import React from 'react';
import { authService } from '../services/authService';
import EmailVerification from '../components/Auth/EmailVerification';

const DashboardPage = () => {
    const user = authService.getCurrentUser();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <EmailVerification />

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                Добро пожаловать, {user?.username}!
                            </h1>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                                    Ваш профиль
                                </h2>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Email:</strong> {user?.email}</p>
                                    <p><strong>Роль:</strong> {user?.role}</p>
                                    <p>
                                        <strong>Email подтвержден:</strong>
                                        <span className={user?.isEmailVerified ? 'text-green-600' : 'text-red-600'}>
                                            {user?.isEmailVerified ? ' ✓ Да' : ' ✗ Нет'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;