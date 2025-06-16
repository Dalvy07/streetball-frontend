// src/pages/DashboardPage.jsx (обновленная версия)
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { gameService } from '../services/gameService';
import { courtService } from '../services/courtService';
import EmailVerification from '../components/Auth/EmailVerification';
import GameCard from '../components/Games/GameCard';

const DashboardPage = () => {
    const [user, setUser] = useState(null);
    const [upcomingGames, setUpcomingGames] = useState([]);
    const [nearbyCourts, setNearbyCourts] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [gamesResponse, courtsResponse, statsResponse] = await Promise.all([
                gameService.getUpcomingGames({ limit: 6 }),
                courtService.getAllCourts({ limit: 6 }),
                gameService.getGamesStats()
            ]);

            setUpcomingGames(gamesResponse.data);
            setNearbyCourts(courtsResponse.data);
            setStats(statsResponse.data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGameUpdate = (updatedGame, deletedGameId) => {
        if (deletedGameId) {
            setUpcomingGames(prev => prev.filter(game => game._id !== deletedGameId));
        } else if (updatedGame) {
            setUpcomingGames(prev => prev.map(game =>
                game._id === updatedGame._id ? updatedGame : game
            ));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <EmailVerification />

                    {/* Приветствие */}
                    <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
                        <div className="px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Добро пожаловать, {user?.username}! 👋
                                    </h1>
                                    <p className="text-gray-600 mt-2">
                                        Вот что происходит в мире спорта сегодня
                                    </p>
                                </div>
                                <div className="hidden md:block">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-3xl">🏀</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Статистика */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl">🎯</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Всего игр</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {stats.total || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl">⏰</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Запланировано</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {stats.by_status?.scheduled || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl">🏟️</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Площадок</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {nearbyCourts.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl">🏀</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Популярный спорт</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {Object.entries(stats.by_sport || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Баскетбол'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Ближайшие игры */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Ближайшие игры
                                    </h2>
                                    <a
                                        href="/games"
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Посмотреть все
                                    </a>
                                </div>
                            </div>
                            <div className="p-6">
                                {upcomingGames.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="text-4xl block mb-3">🏀</span>
                                        <p className="text-gray-500">Нет запланированных игр</p>
                                        <a
                                            href="/games"
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                                        >
                                            Найти игры
                                        </a>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {upcomingGames.slice(0, 3).map(game => (
                                            <div key={game._id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-2xl">
                                                            {game.sportType === 'basketball' ? '🏀' :
                                                                game.sportType === 'football' ? '⚽' :
                                                                    game.sportType === 'tennis' ? '🎾' : '🏃'}
                                                        </span>
                                                        <div>
                                                            <p className="font-medium text-gray-900 capitalize">
                                                                {game.sportType}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {new Date(game.dateTime).toLocaleString('ru-RU', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {game.currentPlayers.length}/{game.maxPlayers}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Популярные площадки */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Популярные площадки
                                    </h2>
                                    <a
                                        href="/courts"
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Посмотреть все
                                    </a>
                                </div>
                            </div>
                            <div className="p-6">
                                {nearbyCourts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="text-4xl block mb-3">🏟️</span>
                                        <p className="text-gray-500">Нет доступных площадок</p>
                                        <a
                                            href="/courts"
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                                        >
                                            Найти площадки
                                        </a>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {nearbyCourts.slice(0, 3).map(court => (
                                            <div key={court._id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {court.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {court.location.address}
                                                        </p>
                                                        <div className="flex items-center mt-1">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <span
                                                                    key={star}
                                                                    className={`text-sm ${star <= court.rating
                                                                            ? 'text-yellow-400'
                                                                            : 'text-gray-300'
                                                                        }`}
                                                                >
                                                                    ★
                                                                </span>
                                                            ))}
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                ({court.reviews?.length || 0})
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        {court.sportTypes.slice(0, 3).map(sport => (
                                                            <span
                                                                key={sport}
                                                                className="text-lg"
                                                            >
                                                                {sport === 'basketball' ? '🏀' :
                                                                    sport === 'football' ? '⚽' :
                                                                        sport === 'tennis' ? '🎾' :
                                                                            sport === 'volleyball' ? '🏐' : '🏃'}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Быстрые действия */}
                    <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
                        <div className="px-6 py-8 text-center">
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Готовы к новым играм?
                            </h2>
                            <p className="text-blue-100 mb-6">
                                Создайте игру или найдите подходящую площадку
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="/games"
                                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                                >
                                    🏀 Найти игры
                                </a>
                                <a
                                    href="/courts"
                                    className="bg-blue-400 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-300 transition-colors"
                                >
                                    🏟️ Найти площадки
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;