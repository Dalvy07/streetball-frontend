// src/components/Auth/EmailVerification.jsx - обновленная версия
import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';

const EmailVerification = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Обновляем данные пользователя при монтировании компонента
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    const handleResendVerification = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await authService.resendVerification();
            setMessage('Письмо подтверждения отправлено! Проверьте почту.');
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка отправки письма');
        } finally {
            setLoading(false);
        }
    };

    // Проверяем текущего пользователя каждые 5 секунд на случай если email был подтвержден
    useEffect(() => {
        const interval = setInterval(() => {
            const currentUser = authService.getCurrentUser();
            if (currentUser && currentUser.isEmailVerified !== user?.isEmailVerified) {
                setUser(currentUser);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [user]);

    if (!user) {
        return null;
    }

    if (user.isEmailVerified) {
        return (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <span className="text-green-600">✅</span>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                            Email подтвержден
                        </h3>
                        <p className="text-sm text-green-700">
                            Ваш аккаунт полностью активирован. Теперь у вас есть доступ ко всем функциям!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <span className="text-yellow-600">⚠️</span>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-yellow-800">
                        Подтвердите ваш email
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                        <p>
                            Мы отправили письмо с подтверждением на <strong>{user.email}</strong>.
                            Пожалуйста, проверьте почту и перейдите по ссылке для активации аккаунта.
                        </p>
                        <p className="mt-1 text-xs">
                            После подтверждения вы будете автоматически перенаправлены сюда с обновленным статусом.
                        </p>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={handleResendVerification}
                            disabled={loading}
                            className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Отправка...' : 'Отправить повторно'}
                        </button>
                    </div>
                    {message && (
                        <div className="mt-2 text-sm text-green-700 bg-green-100 p-2 rounded">
                            ✅ {message}
                        </div>
                    )}
                    {error && (
                        <div className="mt-2 text-sm text-red-700 bg-red-100 p-2 rounded">
                            ❌ {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;