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

// Функция для стандартизации обработки ошибок
const handleServiceError = (error, defaultMessage) => {
    console.error('Service Error:', error);
    return {
        success: false,
        message: error.response?.data?.message || error.message || defaultMessage,
        data: null
    };
};

export const gameService = {
    // Получение всех игр
    getAllGames: async (params = {}) => {
        try {
            const response = await apiClient.get('/games', { params });
            return {
                success: true,
                data: response.data.data || response.data,
                pagination: response.data.pagination,
                message: response.data.message
            };
        } catch (error) {
            return handleServiceError(error, 'Ошибка при получении списка игр');
        }
    },

    // Получение игры по ID
    getGameById: async (id) => {
        try {
            const response = await apiClient.get(`/games/${id}`);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message
            };
        } catch (error) {
            return handleServiceError(error, 'Ошибка при получении информации об игре');
        }
    },

    // Создание новой игры
    createGame: async (gameData) => {
        try {
            const response = await apiClient.post('/games', gameData);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Игра успешно создана'
            };
        } catch (error) {
            return handleServiceError(error, 'Ошибка при создании игры');
        }
    },

    // Присоединение к игре
    joinGame: async (id) => {
        try {
            const response = await apiClient.post(`/games/${id}/join`);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Вы успешно присоединились к игре'
            };
        } catch (error) {
            return handleServiceError(error, 'Ошибка при присоединении к игре');
        }
    },

    // Покидание игры
    leaveGame: async (id) => {
        try {
            const response = await apiClient.post(`/games/${id}/leave`);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Вы успешно покинули игру'
            };
        } catch (error) {
            console.error('Error leaving game:', error);
            
            // Специальная обработка для случая, когда пользователь не является участником
            if (error.response?.status === 400) {
                return {
                    success: false,
                    message: error.response.data.message || 'Вы не являетесь участником этой игры'
                };
            }
            
            // Специальная обработка для случая, когда игра не найдена
            if (error.response?.status === 404) {
                return {
                    success: false,
                    message: 'Игра не найдена'
                };
            }
            
            return handleServiceError(error, 'Ошибка при выходе из игры');
        }
    },

    // Удаление игры
    deleteGame: async (id, reason) => {
        try {
            const response = await apiClient.delete(`/games/${id}`, {
                data: { reason }
            });
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Игра успешно отменена'
            };
        } catch (error) {
            console.error('Error deleting game:', error);
            
            // Специальная обработка для случая отсутствия прав
            if (error.response?.status === 403) {
                return {
                    success: false,
                    message: 'У вас нет прав для удаления этой игры'
                };
            }
            
            // Специальная обработка для случая, когда игра не найдена
            if (error.response?.status === 404) {
                return {
                    success: false,
                    message: 'Игра не найдена'
                };
            }
            
            return handleServiceError(error, 'Ошибка при удалении игры');
        }
    },

    // Получение предстоящих игр
    getUpcomingGames: async (params = {}) => {
        try {
            const response = await apiClient.get('/games/upcoming', { params });
            return {
                success: true,
                data: response.data.data || response.data,
                pagination: response.data.pagination,
                message: response.data.message
            };
        } catch (error) {
            return handleServiceError(error, 'Ошибка при получении предстоящих игр');
        }
    },

    // Получение игр поблизости
    getNearbyGames: async (params) => {
        try {
            const response = await apiClient.get('/games/nearby', { params });
            return {
                success: true,
                data: response.data.data || response.data,
                pagination: response.data.pagination,
                message: response.data.message
            };
        } catch (error) {
            return handleServiceError(error, 'Ошибка при получении игр поблизости');
        }
    },

    // Получение игр пользователя
    getMyGames: async (params = {}) => {
        try {
            const response = await apiClient.get('/games/my-games', { params });
            return {
                success: true,
                data: response.data.data || response.data,
                pagination: response.data.pagination,
                message: response.data.message
            };
        } catch (error) {
            return handleServiceError(error, 'Ошибка при получении ваших игр');
        }
    },

    // Получение игр по типу спорта
    getGamesBySportType: async (sportType, params = {}) => {
        try {
            const response = await apiClient.get(`/games/sport/${sportType}`, { params });
            return {
                success: true,
                data: response.data.data || response.data,
                pagination: response.data.pagination,
                message: response.data.message
            };
        } catch (error) {
            return handleServiceError(error, 'Ошибка при получении игр по виду спорта');
        }
    },

    // Получение статистики игр
    getGamesStats: async (params = {}) => {
        try {
            const response = await apiClient.get('/games/stats', { params });
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message
            };
        } catch (error) {
            return handleServiceError(error, 'Ошибка при получении статистики игр');
        }
    },

    // Получение списка кортов
    getCourts: async () => {
        try {
            const response = await apiClient.get('/courts');
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message
            };
        } catch (error) {
            return handleServiceError(error, 'Ошибка при получении списка площадок');
        }
    },

    // Проверка статуса участия пользователя в игре
    checkUserGameStatus: async (gameId) => {
        try {
            const response = await apiClient.get(`/games/${gameId}/status`);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message
            };
        } catch (error) {
            return handleServiceError(error, 'Ошибка при проверке статуса участия');
        }
    },

    // Получение участников игры
    getGameParticipants: async (gameId) => {
        try {
            const response = await apiClient.get(`/games/${gameId}/participants`);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message
            };
        } catch (error) {
            return handleServiceError(error, 'Ошибка при получении списка участников');
        }
    }
};