// // src/services/userService.js
// import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// const apiClient = axios.create({
//     baseURL: API_BASE_URL,
//     withCredentials: true,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// export const userService = {
//     // Получение профиля пользователя
//     getUserProfile: async (id) => {
//         const response = await apiClient.get(`/users/${id}`);
//         return response.data;
//     },

//     // Получение собственного профиля
//     getMyProfile: async () => {
//         const response = await apiClient.get('/users/me');
//         return response.data;
//     },

//     // Обновление профиля
//     updateProfile: async (userData) => {
//         const response = await apiClient.put('/users/me', userData);
//         if (response.data.success) {
//             localStorage.setItem('user', JSON.stringify(response.data.data.user));
//         }
//         return response.data;
//     },

//     // Удаление профиля
//     deleteProfile: async () => {
//         const response = await apiClient.delete('/users/me');
//         return response.data;
//     },

//     // Обновление настроек уведомлений
//     updateNotificationSettings: async (settings) => {
//         const response = await apiClient.put('/users/me/notifications', settings);
//         return response.data;
//     },

//     // Смена пароля
//     changePassword: async (passwordData) => {
//         const response = await apiClient.put('/users/me/password', passwordData);
//         if (response.data.success) {
//             localStorage.setItem('user', JSON.stringify(response.data.data.user));
//         }
//         return response.data;
//     },

//     // Обновление аватара
//     updateAvatar: async (avatar) => {
//         const response = await apiClient.put('/users/me/avatar', { avatar });
//         return response.data;
//     },

//     // Получение игр пользователя
//     getUserGames: async (id, params = {}) => {
//         const response = await apiClient.get(`/users/${id}/games`, { params });
//         return response.data;
//     }
// };




// src/services/userService.js - FIXED VERSION
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user?.accessToken) {
            config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                await apiClient.get('/auth/refresh');
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const userService = {
    // Get user profile by ID
    getUserProfile: async (id) => {
        try {
            const response = await apiClient.get(`/users/${id}`);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('Error getting user profile:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Error loading profile',
                data: null
            };
        }
    },

    // Get current user's profile
    getMyProfile: async () => {
        try {
            const response = await apiClient.get('/users/me');
            return {
                success: true,
                data: response.data.data || response.data.user || response.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('Error getting my profile:', error);
            
            // If there's an auth error, try to use cached data
            if (error.response?.status === 401) {
                const cachedUser = JSON.parse(localStorage.getItem('user') || 'null');
                if (cachedUser) {
                    return {
                        success: true,
                        data: cachedUser,
                        message: 'Using cached profile data'
                    };
                }
            }
            
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Error loading profile',
                data: null
            };
        }
    },

    // Update profile
    updateProfile: async (userData) => {
        try {
            const response = await apiClient.put('/users/me', userData);
            
            if (response.data.success || response.data.data) {
                const updatedUser = response.data.data?.user || response.data.data || response.data.user;
                if (updatedUser) {
                    // Update localStorage with new data
                    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const newUserData = { ...currentUser, ...updatedUser };
                    localStorage.setItem('user', JSON.stringify(newUserData));
                }
            }
            
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Profile updated successfully'
            };
        } catch (error) {
            console.error('Error updating profile:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Error updating profile',
                data: null
            };
        }
    },

    // Delete profile
    deleteProfile: async () => {
        try {
            const response = await apiClient.delete('/users/me');
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Profile deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting profile:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Error deleting profile',
                data: null
            };
        }
    },

    // Update notification settings
    updateNotificationSettings: async (settings) => {
        try {
            const response = await apiClient.put('/users/me/notifications', settings);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Notification settings updated'
            };
        } catch (error) {
            console.error('Error updating notification settings:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Error updating notification settings',
                data: null
            };
        }
    },

    // Change password
    changePassword: async (passwordData) => {
        try {
            const response = await apiClient.put('/users/me/password', passwordData);
            
            if (response.data.success || response.data.data) {
                const updatedUser = response.data.data?.user || response.data.data || response.data.user;
                if (updatedUser) {
                    // Update localStorage with new data
                    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const newUserData = { ...currentUser, ...updatedUser };
                    localStorage.setItem('user', JSON.stringify(newUserData));
                }
            }
            
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Password changed successfully'
            };
        } catch (error) {
            console.error('Error changing password:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Error changing password',
                data: null
            };
        }
    },

    // Update avatar
    updateAvatar: async (avatar) => {
        try {
            const response = await apiClient.put('/users/me/avatar', { avatar });
            
            if (response.data.success || response.data.data) {
                const updatedUser = response.data.data?.user || response.data.data || response.data.user;
                if (updatedUser) {
                    // Update localStorage with new data
                    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const newUserData = { ...currentUser, ...updatedUser };
                    localStorage.setItem('user', JSON.stringify(newUserData));
                }
            }
            
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Avatar updated successfully'
            };
        } catch (error) {
            console.error('Error updating avatar:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Error updating avatar',
                data: null
            };
        }
    },

    // Get user games
    getUserGames: async (id, params = {}) => {
        try {
            const response = await apiClient.get(`/users/${id}/games`, { params });
            return {
                success: true,
                data: response.data.data || response.data,
                pagination: response.data.pagination,
                message: response.data.message
            };
        } catch (error) {
            console.error('Error getting user games:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Error loading user games',
                data: null
            };
        }
    }
};