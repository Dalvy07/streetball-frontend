// src/services/userService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const userService = {
    // Получение профиля пользователя
    getUserProfile: async (id) => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    },

    // Получение собственного профиля
    getMyProfile: async () => {
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

    // Удаление профиля
    deleteProfile: async () => {
        const response = await apiClient.delete('/users/me');
        return response.data;
    },

    // Обновление настроек уведомлений
    updateNotificationSettings: async (settings) => {
        const response = await apiClient.put('/users/me/notifications', settings);
        return response.data;
    },

    // Смена пароля
    changePassword: async (passwordData) => {
        const response = await apiClient.put('/users/me/password', passwordData);
        if (response.data.success) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    // Обновление аватара
    updateAvatar: async (avatar) => {
        const response = await apiClient.put('/users/me/avatar', { avatar });
        return response.data;
    },

    // Получение игр пользователя
    getUserGames: async (id, params = {}) => {
        const response = await apiClient.get(`/users/${id}/games`, { params });
        return response.data;
    }
};