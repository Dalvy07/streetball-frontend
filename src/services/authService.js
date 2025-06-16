import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// Создаем экземпляр axios
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Важно для работы с cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor для автоматического обновления access token
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await apiClient.get('/auth/refresh');
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Если refresh не удался, перенаправляем на логин
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const authService = {
    // Регистрация пользователя
    register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        if (response.data.success) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    // Вход пользователя
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        if (response.data.success) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    // Выход пользователя
    logout: async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('user');
        }
    },

    // Получение текущего пользователя
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Проверка аутентификации
    isAuthenticated: () => {
        return !!localStorage.getItem('user');
    },

    // Повторная отправка письма подтверждения
    resendVerification: async () => {
        const response = await apiClient.post('/auth/resend-verification');
        return response.data;
    },

    // Получение профиля пользователя
    getProfile: async () => {
        const response = await apiClient.get('/users/me');
        return response.data;
    },

    // Обновление профиля
    updateProfile: async (userData) => {
        const response = await apiClient.put('/users/me', userData);
        if (response.data.success) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    // Смена пароля
    changePassword: async (passwordData) => {
        const response = await apiClient.put('/users/me/password', passwordData);
        return response.data;
    }
};