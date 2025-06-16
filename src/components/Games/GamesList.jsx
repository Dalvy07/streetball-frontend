// src/components/Games/GamesList.jsx
import React, { useState, useEffect } from 'react';
import { gameService } from '../../services/gameService';
import GameCard from './GameCard';
import CreateGameForm from './CreateGameForm';
import { authService } from '../../services/authService';

const GamesList = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [filters, setFilters] = useState({
        sportType: '',
        skillLevel: '',
        status: 'scheduled',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({});

    const user = authService.getCurrentUser();

    useEffect(() => {
        loadGames();
    }, [filters]);

    const loadGames = async () => {
        setLoading(true);
        setError('');

        try {
            // Remove empty filters
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== '')
            );

            const response = await gameService.getAllGames(cleanFilters);
            if (response.success) {
                setGames(response.data);
                setPagination({
                    current_page: response.pagination.current_page,
                    total_pages: response.pagination.total_pages,
                    total: response.pagination.total,
                    has_next: response.pagination.has_next,
                    has_prev: response.pagination.has_prev
                });
            } else {
                setError('Ошибка при загрузке игр');
            }
        } catch (error) {
            setError('Ошибка при загрузке игр');
            console.error('Error loading games:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value,
            page: 1 // Сброс на первую страницу при изменении фильтров
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const handleGameUpdate = (updatedGame, deletedGameId) => {
        if (deletedGameId) {
            // Удаление игры
            setGames(prev => prev.filter(game => game._id !== deletedGameId));
        } else if (updatedGame) {
            // Обновление игры
            setGames(prev => prev.map(game =>
                game._id === updatedGame._id ? updatedGame : game
            ));
        }
    };

    const handleGameCreated = (newGame) => {
        setGames(prev => [newGame, ...prev]);
        setShowCreateForm(false);
        // Можно добавить уведомление об успешном создании
    };

    const sportTypes = [
        { value: '', label: 'Все виды спорта' },
        { value: 'basketball', label: 'Баскетбол' },
        { value: 'football', label: 'Футбол' },
        { value: 'tennis', label: 'Теннис' },
        { value: 'volleyball', label: 'Волейбол' },
        { value: 'badminton', label: 'Бадминтон' },
        { value: 'table_tennis', label: 'Настольный теннис' },
        { value: 'hockey', label: 'Хоккей' },
        { value: 'futsal', label: 'Футзал' },
        { value: 'handball', label: 'Гандбол' },
        { value: 'other', label: 'Другое' }
    ];

    const skillLevels = [
        { value: '', label: 'Любой уровень' },
        { value: 'beginner', label: 'Начинающий' },
        { value: 'intermediate', label: 'Средний' },
        { value: 'advanced', label: 'Продвинутый' },
        { value: 'any', label: 'Любой' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Игры</h1>
                    <p className="text-gray-600 mt-2">Найдите игры поблизости или создайте свою</p>
                </div>

                {user?.isEmailVerified && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Создать игру
                    </button>
                )}
            </div>

            {/* Фильтры */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Вид спорта
                        </label>
                        <select
                            value={filters.sportType}
                            onChange={(e) => handleFilterChange('sportType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {sportTypes.map(sport => (
                                <option key={sport.value} value={sport.value}>
                                    {sport.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Уровень мастерства
                        </label>
                        <select
                            value={filters.skillLevel}
                            onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {skillLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ sportType: '', skillLevel: '', page: 1, limit: 10 })}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                </div>
            </div>

            {/* Сообщение об ошибке */}
            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Требование подтверждения email */}
            {user && !user.isEmailVerified && (
                <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 px-4 py-3 rounded mb-6">
                    Для создания игр необходимо подтвердить email адрес
                </div>
            )}

            {/* Загрузка */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Список игр */}
            {!loading && (
                <>
                    {games.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-6xl mb-4 block">🏀</span>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Игры не найдены
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Попробуйте изменить фильтры или создайте первую игру
                            </p>
                            {user?.isEmailVerified && (
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Создать игру
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {games.map(game => (
                                <GameCard
                                    key={game._id}
                                    game={game}
                                    onGameUpdate={handleGameUpdate}
                                />
                            ))}
                        </div>
                    )}

                    {/* Пагинация */}
                    {pagination.total_pages > 1 && (
                        <div className="flex justify-center items-center space-x-4 mt-8">
                            <button
                                onClick={() => handlePageChange(filters.page - 1)}
                                disabled={!pagination.has_prev}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Предыдущая
                            </button>

                            <span className="text-gray-600">
                                Страница {pagination.current_page} из {pagination.total_pages}
                            </span>

                            <button
                                onClick={() => handlePageChange(filters.page + 1)}
                                disabled={!pagination.has_next}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Следующая
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Модальное окно создания игры */}
            {showCreateForm && (
                <CreateGameForm
                    onGameCreated={handleGameCreated}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}
        </div>
    );
};

export default GamesList;