// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';

const HomePage = () => {
    const user = authService.getCurrentUser();

    if (user) {
        // Если пользователь авторизован, перенаправляем на dashboard
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Добро пожаловать, {user.username}!
                    </h1>
                    <Link
                        to="/dashboard"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Перейти к панели управления
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-gradient-to-br from-blue-50 to-indigo-100 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Найди игру</span>{' '}
                                    <span className="block text-blue-600 xl:inline">рядом с собой</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    StreetBall — это платформа для поиска спортивных игр и единомышленников.
                                    Создавай игры, присоединяйся к другим и наслаждайся спортом вместе с друзьями.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <Link
                                            to="/register"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                                        >
                                            Начать играть
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link
                                            to="/login"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                                        >
                                            Войти
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                    <div className="h-56 w-full bg-gray-300 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
                        <span className="text-6xl">🏀</span>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
                            Возможности
                        </h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Все для организации игр
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                            <div className="relative">
                                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                    <span className="text-xl">🗺️</span>
                                </div>
                                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                                    Поиск площадок
                                </p>
                                <p className="mt-2 ml-16 text-base text-gray-500">
                                    Находите спортивные площадки рядом с вами на интерактивной карте
                                </p>
                            </div>

                            <div className="relative">
                                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                    <span className="text-xl">👥</span>
                                </div>
                                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                                    Создание игр
                                </p>
                                <p className="mt-2 ml-16 text-base text-gray-500">
                                    Организуйте игры для любого вида спорта и приглашайте участников
                                </p>
                            </div>

                            <div className="relative">
                                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                    <span className="text-xl">🏆</span>
                                </div>
                                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                                    Рейтинг игроков
                                </p>
                                <p className="mt-2 ml-16 text-base text-gray-500">
                                    Отслеживайте свою статистику и улучшайте навыки
                                </p>
                            </div>

                            <div className="relative">
                                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                    <span className="text-xl">🔔</span>
                                </div>
                                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                                    Уведомления
                                </p>
                                <p className="mt-2 ml-16 text-base text-gray-500">
                                    Получайте уведомления о новых играх и изменениях в расписании
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-blue-600">
                <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        <span className="block">Готов начать играть?</span>
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-blue-200">
                        Присоединяйся к сообществу любителей спорта уже сегодня
                    </p>
                    <Link
                        to="/register"
                        className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto"
                    >
                        Зарегистрироваться бесплатно
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;