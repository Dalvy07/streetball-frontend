// src/components/Profile/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import EmailVerification from '../Auth/EmailVerification';
import ProfileSettings from './ProfileSettings';
import MyGames from './MyGames';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await userService.getMyProfile();
            setProfile(response.data);
        } catch (error) {
            setError('Ошибка при загрузке профиля');
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = (updatedProfile) => {
        setProfile(updatedProfile);
        // Обновляем данные в localStorage
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            const newUserData = { ...currentUser, ...updatedProfile };
            localStorage.setItem('user', JSON.stringify(newUserData));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Ошибка</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', name: 'Профиль', icon: '👤' },
        { id: 'games', name: 'Мои игры', icon: '🏀' },
        { id: 'settings', name: 'Настройки', icon: '⚙️' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <EmailVerification />

                    <div className="bg-white shadow rounded-lg">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                                    {profile?.avatar ? (
                                        <img
                                            src={profile.avatar}
                                            alt={profile.username}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-medium text-gray-700">
                                            {profile?.username?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {profile?.fullName || profile?.username}
                                    </h1>
                                    <p className="text-gray-600">{profile?.email}</p>
                                    <div className="flex items-center space-x-4 mt-1">
                                        <span className={`text-xs px-2 py-1 rounded-full ${profile?.isEmailVerified
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {profile?.isEmailVerified ? 'Email подтвержден' : 'Email не подтвержден'}
                                        </span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 capitalize">
                                            {profile?.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="mr-2">{tab.icon}</span>
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {activeTab === 'profile' && (
                                <ProfileInfo profile={profile} />
                            )}
                            {activeTab === 'games' && (
                                <MyGames userId={profile?._id} />
                            )}
                            {activeTab === 'settings' && (
                                <ProfileSettings
                                    profile={profile}
                                    onProfileUpdate={handleProfileUpdate}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Компонент информации о профиле
const ProfileInfo = ({ profile }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Основная информация</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Имя пользователя
                        </label>
                        <p className="mt-1 text-sm text-gray-900">{profile?.username}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <p className="mt-1 text-sm text-gray-900">{profile?.email}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Полное имя
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                            {profile?.fullName || 'Не указано'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Телефон
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                            {profile?.phone || 'Не указан'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Дата регистрации
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                            {formatDate(profile?.createdAt)}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Последний вход
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                            {profile?.lastLogin ? formatDate(profile.lastLogin) : 'Не указан'}
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Статистика</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {profile?.createdGames?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Создано игр</div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {profile?.joinedGames?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Участий в играх</div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                            {(profile?.createdGames?.length || 0) + (profile?.joinedGames?.length || 0)}
                        </div>
                        <div className="text-sm text-gray-600">Всего игр</div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Настройки уведомлений</h3>
                <div className="space-y-3">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-700 mr-3">Email уведомления:</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${profile?.notifications?.email
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {profile?.notifications?.email ? 'Включены' : 'Отключены'}
                        </span>
                    </div>

                    <div className="flex items-center">
                        <span className="text-sm text-gray-700 mr-3">Push уведомления:</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${profile?.notifications?.push
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {profile?.notifications?.push ? 'Включены' : 'Отключены'}
                        </span>
                    </div>

                    <div className="flex items-center">
                        <span className="text-sm text-gray-700 mr-3">Напоминания за:</span>
                        <span className="text-sm text-gray-900">
                            {profile?.notifications?.reminderTime || 60} минут до игры
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;