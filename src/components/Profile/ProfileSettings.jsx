// src/components/Profile/ProfileSettings.jsx
import React, { useState } from 'react';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';

const ProfileSettings = ({ profile, onProfileUpdate }) => {
    const [activeSection, setActiveSection] = useState('personal');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Персональные данные
    const [personalData, setPersonalData] = useState({
        username: profile?.username || '',
        fullName: profile?.fullName || '',
        phone: profile?.phone || ''
    });

    // Настройки уведомлений
    const [notificationSettings, setNotificationSettings] = useState({
        email: profile?.notifications?.email ?? true,
        push: profile?.notifications?.push ?? true,
        reminderTime: profile?.notifications?.reminderTime || 60
    });

    // Смена пароля
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePersonalDataSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await userService.updateProfile(personalData);
            onProfileUpdate(response.data.user);
            setSuccess('Профиль успешно обновлен');
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при обновлении профиля');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationSettingsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await userService.updateNotificationSettings(notificationSettings);
            setSuccess('Настройки уведомлений обновлены');
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при обновлении настроек');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Проверка совпадения паролей
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Новые пароли не совпадают');
            setLoading(false);
            return;
        }

        // Проверка длины пароля
        if (passwordData.newPassword.length < 6) {
            setError('Новый пароль должен содержать минимум 6 символов');
            setLoading(false);
            return;
        }

        try {
            await userService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setSuccess('Пароль успешно изменен');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при смене пароля');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо.')) {
            return;
        }

        if (!window.confirm('Все ваши данные будут удалены безвозвратно. Подтвердите удаление.')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await userService.deleteProfile();
            await authService.logout();
            window.location.href = '/';
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при удалении аккаунта');
            setLoading(false);
        }
    };

    const sections = [
        { id: 'personal', name: 'Персональные данные', icon: '👤' },
        { id: 'notifications', name: 'Уведомления', icon: '🔔' },
        { id: 'password', name: 'Безопасность', icon: '🔒' },
        { id: 'danger', name: 'Опасная зона', icon: '⚠️' }
    ];

    return (
        <div className="space-y-6">
            {/* Навигация по разделам */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeSection === section.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <span className="mr-2">{section.icon}</span>
                            {section.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Сообщения */}
            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded">
                    {success}
                </div>
            )}

            {/* Персональные данные */}
            {activeSection === 'personal' && (
                <form onSubmit={handlePersonalDataSubmit} className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Персональные данные
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Имя пользователя
                                </label>
                                <input
                                    type="text"
                                    value={personalData.username}
                                    onChange={(e) => setPersonalData(prev => ({
                                        ...prev,
                                        username: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Полное имя
                                </label>
                                <input
                                    type="text"
                                    value={personalData.fullName}
                                    onChange={(e) => setPersonalData(prev => ({
                                        ...prev,
                                        fullName: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Телефон
                                </label>
                                <input
                                    type="tel"
                                    value={personalData.phone}
                                    onChange={(e) => setPersonalData(prev => ({
                                        ...prev,
                                        phone: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>
                    </div>
                </form>
            )}

            {/* Настройки уведомлений */}
            {activeSection === 'notifications' && (
                <form onSubmit={handleNotificationSettingsSubmit} className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Настройки уведомлений
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">
                                        Email уведомления
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        Получать уведомления о играх на email
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notificationSettings.email}
                                        onChange={(e) => setNotificationSettings(prev => ({
                                            ...prev,
                                            email: e.target.checked
                                        }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">
                                        Push уведомления
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        Получать push уведомления в браузере
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notificationSettings.push}
                                        onChange={(e) => setNotificationSettings(prev => ({
                                            ...prev,
                                            push: e.target.checked
                                        }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Напоминание о игре за (минут)
                                </label>
                                <select
                                    value={notificationSettings.reminderTime}
                                    onChange={(e) => setNotificationSettings(prev => ({
                                        ...prev,
                                        reminderTime: parseInt(e.target.value)
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={15}>15 минут</option>
                                    <option value={30}>30 минут</option>
                                    <option value={60}>1 час</option>
                                    <option value={120}>2 часа</option>
                                    <option value={1440}>1 день</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Сохранение...' : 'Сохранить настройки'}
                        </button>
                    </div>
                </form>
            )}

            {/* Смена пароля */}
            {activeSection === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Изменение пароля
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Текущий пароль
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({
                                        ...prev,
                                        currentPassword: e.target.value
                                    }))}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Новый пароль
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({
                                        ...prev,
                                        newPassword: e.target.value
                                    }))}
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Минимум 6 символов, включая заглавную букву, строчную букву и цифру
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Подтвердите новый пароль
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({
                                        ...prev,
                                        confirmPassword: e.target.value
                                    }))}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Изменение...' : 'Изменить пароль'}
                        </button>
                    </div>
                </form>
            )}

            {/* Опасная зона */}
            {activeSection === 'danger' && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-red-900 mb-4">
                            Опасная зона
                        </h3>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className="text-red-400 text-xl">⚠️</span>
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-red-800">
                                        Удаление аккаунта
                                    </h4>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>
                                            Удаление аккаунта приведет к полному удалению всех ваших данных:
                                        </p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>Профиль пользователя</li>
                                            <li>Все созданные игры будут отменены</li>
                                            <li>Вы будете исключены из всех запланированных игр</li>
                                            <li>История активности</li>
                                        </ul>
                                        <p className="mt-2 font-medium">
                                            Это действие необратимо!
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={loading}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                                        >
                                            {loading ? 'Удаление...' : 'Удалить аккаунт'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileSettings;