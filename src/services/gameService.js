// src/services/gameService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor для добавления токена авторизации
apiClient.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.accessToken) {
            config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor для обработки ошибок аутентификации
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await apiClient.get('/auth/refresh');
                if (response.data.success) {
                    const user = JSON.parse(localStorage.getItem('user'));
                    user.accessToken = response.data.data.accessToken;
                    localStorage.setItem('user', JSON.stringify(user));
                    originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const gameService = {
    // Получение всех игр
    getAllGames: async (params = {}) => {
        const response = await apiClient.get('/games', { params });
        return response.data;
    },

    // Получение игры по ID
    getGameById: async (id) => {
        const response = await apiClient.get(`/games/${id}`);
        return response.data;
    },

    // Создание новой игры
    createGame: async (gameData) => {
        const response = await apiClient.post('/games', gameData);
        return response.data;
    },

    // Присоединение к игре
    joinGame: async (id) => {
        const response = await apiClient.post(`/games/${id}/join`);
        return response.data;
    },

    // Покидание игры
    leaveGame: async (id) => {
        const response = await apiClient.post(`/games/${id}/leave`);
        return response.data;
    },

    // Удаление игры
    deleteGame: async (id, reason) => {
        const response = await apiClient.delete(`/games/${id}`, {
            data: { reason }
        });
        return response.data;
    },

    // Получение предстоящих игр
    getUpcomingGames: async (params = {}) => {
        const response = await apiClient.get('/games/upcoming', { params });
        return response.data;
    },

    // Получение игр поблизости
    getNearbyGames: async (params) => {
        const response = await apiClient.get('/games/nearby', { params });
        return response.data;
    },

    // Получение игр пользователя
    getMyGames: async (params = {}) => {
        const response = await apiClient.get('/games/my-games', { params });
        return response.data;
    },

    // Получение игр по типу спорта
    getGamesBySportType: async (sportType, params = {}) => {
        const response = await apiClient.get(`/games/sport/${sportType}`, { params });
        return response.data;
    },

    // Получение статистики игр
    getGamesStats: async (params = {}) => {
        const response = await apiClient.get('/games/stats', { params });
        return response.data;
    },

    // Получение списка кортов
    getCourts: async () => {
        const response = await apiClient.get('/courts');
        return response.data;
    }
};