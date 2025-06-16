// src/pages/EmailVerifiedPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

const EmailVerifiedPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Подтверждение email...');
    const navigate = useNavigate();

    useEffect(() => {
        const handleEmailVerification = async () => {
            const token = searchParams.get('token');
            const verified = searchParams.get('verified');

            if (!token || verified !== 'true') {
                setStatus('error');
                setMessage('Неверная ссылка подтверждения');
                return;
            }

            try {
                // Сохраняем токен временно для получения обновленного профиля
                const tempAuthHeader = `Bearer ${token}`;

                // Получаем обновленный профиль пользователя
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1'}/users/me`, {
                    headers: {
                        'Authorization': tempAuthHeader
                    },
                    credentials: 'include'
                });

                if (response.ok) {
                    const userData = await response.json();

                    // Обновляем данные пользователя в localStorage
                    localStorage.setItem('user', JSON.stringify(userData.data));

                    setStatus('success');
                    setMessage('Email успешно подтвержден!');

                    // Перенаправляем на dashboard через 2 секунды
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 2000);
                } else {
                    throw new Error('Ошибка получения профиля');
                }
            } catch (error) {
                console.error('Email verification error:', error);
                setStatus('error');
                setMessage('Ошибка при подтверждении email');
            }
        };

        handleEmailVerification();
    }, [searchParams, navigate]);

    const getStatusIcon = () => {
        switch (status) {
            case 'verifying':
                return (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                );
            case 'success':
                return (
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-green-600 text-3xl">✓</span>
                    </div>
                );
            case 'error':
                return (
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-600 text-3xl">✗</span>
                    </div>
                );
            default:
                return null;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'verifying':
                return 'text-blue-600';
            case 'success':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                {getStatusIcon()}

                <h2 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
                    {status === 'verifying' && 'Подтверждение email'}
                    {status === 'success' && 'Email подтвержден!'}
                    {status === 'error' && 'Ошибка подтверждения'}
                </h2>

                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                {status === 'success' && (
                    <>
                        <p className="text-sm text-gray-500 mb-4">
                            Теперь у вас есть доступ ко всем функциям приложения
                        </p>
                        <p className="text-sm text-gray-400">
                            Перенаправление через несколько секунд...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Перейти в аккаунт
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            На главную
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailVerifiedPage;