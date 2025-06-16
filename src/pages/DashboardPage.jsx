// src/pages/DashboardPage.jsx (обновленная версия)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    const [error, setError] = useState('');

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

            if (gamesResponse.success) {
                setUpcomingGames(gamesResponse.data);
            } else {
                setError(gamesResponse.message || 'Error loading games');
            }

            if (courtsResponse.success) {
                setNearbyCourts(courtsResponse.data);
            } else {
                setError(courtsResponse.message || 'Error loading courts');
            }

            if (statsResponse.success) {
                setStats(statsResponse.data);
            } else {
                setError(statsResponse.message || 'Error loading stats');
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setError('Error loading dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleGameUpdate = async (updatedGame, deletedGameId) => {
        if (deletedGameId) {
            setUpcomingGames(prev => prev.filter(game => game._id !== deletedGameId));
        } else if (updatedGame) {
            try {
                const response = await gameService.getGameById(updatedGame._id);
                if (response.success) {
                    setUpcomingGames(prev => prev.map(game =>
                        game._id === updatedGame._id ? response.data : game
                    ));
                }
            } catch (error) {
                console.error('Error refreshing game data:', error);
                // Fallback: use passed data
                setUpcomingGames(prev => prev.map(game =>
                    game._id === updatedGame._id ? updatedGame : game
                ));
            }
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
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
                                        Welcome, {user?.username}! 👋
                                    </h1>
                                    <p className="text-gray-600 mt-2">
                                        Here's what's happening in the sports world today
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
                                    <p className="text-sm font-medium text-gray-500">Total Games</p>
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
                                    <p className="text-sm font-medium text-gray-500">Scheduled</p>
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
                                    <p className="text-sm font-medium text-gray-500">Courts</p>
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
                                    <p className="text-sm font-medium text-gray-500">Popular Sport</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {Object.entries(stats.by_sport || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Basketball'}
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
                                        Upcoming Games
                                    </h2>
                                    <Link
                                        to="/games"
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        View all
                                    </Link>
                                </div>
                            </div>
                            <div className="p-6">
                                {upcomingGames.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="text-4xl block mb-3">🏀</span>
                                        <p className="text-gray-500">No scheduled games</p>
                                        <Link
                                            to="/games"
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                                        >
                                            Find games
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {upcomingGames.slice(0, 3).map(game => (
                                            <GameCard
                                                key={game._id}
                                                game={game}
                                                onGameUpdate={handleGameUpdate}
                                            />
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
                                        Popular Courts
                                    </h2>
                                    <Link
                                        to="/courts"
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        View all
                                    </Link>
                                </div>
                            </div>
                            <div className="p-6">
                                {nearbyCourts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="text-4xl block mb-3">🏟️</span>
                                        <p className="text-gray-500">No available courts</p>
                                        <Link
                                            to="/courts"
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                                        >
                                            Find courts
                                        </Link>
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
                                Ready for new games?
                            </h2>
                            <p className="text-blue-100 mb-6">
                                Create a game or find a suitable court
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/games"
                                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                                >
                                    🏀 Find Games
                                </Link>
                                <Link
                                    to="/courts"
                                    className="bg-blue-400 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-300 transition-colors"
                                >
                                    🏟️ Find Courts
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;