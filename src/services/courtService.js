// src/services/courtService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const courtService = {
    // Получение всех площадок
    getAllCourts: async (params = {}) => {
        const response = await apiClient.get('/courts', { params });
        return response.data;
    },

    // Получение площадки по ID
    getCourtById: async (id) => {
        const response = await apiClient.get(`/courts/${id}`);
        return response.data;
    },

    // Создание новой площадки (только для админов)
    createCourt: async (courtData) => {
        const response = await apiClient.post('/courts', courtData);
        return response.data;
    },

    // Обновление площадки (только для админов)
    updateCourt: async (id, courtData) => {
        const response = await apiClient.put(`/courts/${id}`, courtData);
        return response.data;
    },

    // Удаление площадки (только для админов)
    deleteCourt: async (id) => {
        const response = await apiClient.delete(`/courts/${id}`);
        return response.data;
    },

    // Получение площадок поблизости
    getNearbyCourts: async (params) => {
        const response = await apiClient.get('/courts/nearby', { params });
        return response.data;
    },

    // Добавление отзыва к площадке
    addReview: async (id, reviewData) => {
        const response = await apiClient.post(`/courts/${id}/reviews`, reviewData);
        return response.data;
    },

    // Получение игр на площадке
    getCourtGames: async (id, params = {}) => {
        const response = await apiClient.get(`/courts/${id}/games`, { params });
        return response.data;
    },

    // Получение площадок пользователя
    getMyCourts: async (params = {}) => {
        const response = await apiClient.get('/courts/my-courts', { params });
        return response.data;
    },

    // Проверка доступности площадки
    checkAvailability: async (id, params) => {
        const response = await apiClient.get(`/courts/${id}/availability`, { params });
        return response.data;
    }
};