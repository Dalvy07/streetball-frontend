// src/components/Games/GamesList.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
                setGames(response.data || []);
                setPagination(response.pagination || {
                    current_page: 1,
                    total_pages: 1,
                    total: response.data?.length || 0,
                    has_next: false,
                    has_prev: false
                });
            } else {
                setError(response.message || 'Ошибка при загрузке игр');
            }
        } catch (error) {
            setError('Ошибка при загрузке игр');
            console.error('Error loading games:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = useCallback((filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value,
            page: 1 // Сброс на первую страницу при изменении фильтров
        }));
    }, []);

    const handlePageChange = useCallback((newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    }, []);

    const handleGameUpdate = useCallback(async (updatedGame, deletedGameId) => {
        if (deletedGameId) {
            // Удаление игры
            setGames(prev => {
                const filtered = prev.filter(game => game._id !== deletedGameId);
                console.log(`Game ${deletedGameId} removed from list`);
                return filtered;
            });
        } else if (updatedGame) {
            // Обновление игры
            try {
                // Получаем свежие данные игры
                const response = await gameService.getGameById(updatedGame._id);
                if (response.success) {
                    setGames(prev => {
                        const updated = prev.map(game => {
                            if (game._id === updatedGame._id) {
                                console.log(`Game ${updatedGame._id} updated with fresh data`);
                                return response.data;
                            }
                            return game;
                        });
                        return updated;
                    });
                }
            } catch (error) {
                console.error('Error refreshing game data:', error);
            }
        }
    }, []);

    const handleGameCreated = useCallback((newGame) => {
        if (newGame) {
            setGames(prev => [newGame, ...prev]);
            setShowCreateForm(false);
            console.log('New game created:', newGame._id);
        }
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            sportType: '',
            skillLevel: '',
            status: 'scheduled',
            page: 1,
            limit: 10
        });
    }, []);

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

    const statusOptions = [
        { value: 'scheduled', label: 'Запланированные' },
        { value: 'in_progress', label: 'В процессе' },
        { value: 'completed', label: 'Завершённые' },
        { value: 'cancelled', label: 'Отменённые' },
        { value: '', label: 'Все статусы' }
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
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                        Создать игру
                    </button>
                )}
            </div>

            {/* Фильтры */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Статус игры
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {statusOptions.map(status => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={resetFilters}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                </div>
            </div>

            {/* Сообщение об ошибке */}
            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-red-400">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Требование подтверждения email */}
            {user && !user.isEmailVerified && (
                <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 px-4 py-3 rounded mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-yellow-400">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm">
                                Для создания игр необходимо подтвердить email адрес.
                                Проверьте вашу почту и перейдите по ссылке подтверждения.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Сообщение для неавторизованных пользователей */}
            {!user && (
                <div className="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-blue-400">ℹ️</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm">
                                Войдите в систему, чтобы присоединяться к играм и создавать собственные
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Загрузка */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">Загрузка игр...</span>
                    </div>
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
                                {Object.values(filters).some(filter => filter && filter !== 'scheduled')
                                    ? 'Попробуйте изменить фильтры поиска'
                                    : 'Создайте первую игру в вашем районе!'
                                }
                            </p>
                            <div className="flex justify-center space-x-4">
                                {Object.values(filters).some(filter => filter && filter !== 'scheduled') && (
                                    <button
                                        onClick={resetFilters}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        Сбросить фильтры
                                    </button>
                                )}
                                {user?.isEmailVerified && (
                                    <button
                                        onClick={() => setShowCreateForm(true)}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                    >
                                        Создать игру
                                    </button>
                                )}
                            </div>
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
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                ← Предыдущая
                            </button>

                            <div className="flex items-center space-x-2">
                                {/* Показываем номера страниц */}
                                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                                    const pageNum = Math.max(1, pagination.current_page - 2) + i;
                                    if (pageNum > pagination.total_pages) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pageNum === pagination.current_page
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <span className="text-gray-600 text-sm">
                                из {pagination.total_pages}
                            </span>

                            <button
                                onClick={() => handlePageChange(filters.page + 1)}
                                disabled={!pagination.has_next}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Следующая →
                            </button>
                        </div>
                    )}

                    {/* Информация о результатах */}
                    {pagination.total > 0 && (
                        <div className="text-center text-sm text-gray-600 mt-4">
                            Показано {games.length} из {pagination.total} игр
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