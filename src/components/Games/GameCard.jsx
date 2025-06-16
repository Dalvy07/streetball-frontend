// src/components/Games/GameCard.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { gameService } from '../../services/gameService';
import { authService } from '../../services/authService';
import {
    isUserParticipant,
    isGameCreator,
    canJoinGame,
    canLeaveGame,
    canDeleteGame,
    getUserGameStatus,
    getJoinRestrictionMessage,
    getParticipantsInfo
} from '../../utils/gamePermissions';

const GameCard = ({ game, onGameUpdate, onShowToast }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const user = authService.getCurrentUser();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSportIcon = (sport) => {
        const icons = {
            basketball: '🏀',
            football: '⚽',
            tennis: '🎾',
            volleyball: '🏐',
            badminton: '🏸',
            table_tennis: '🏓',
            hockey: '🏒',
            futsal: '🥅',
            handball: '🤾',
            other: '🏃'
        };
        return icons[sport] || '🏃';
    };

    const getSportName = (sport) => {
        const names = {
            basketball: 'Баскетбол',
            football: 'Футбол',
            tennis: 'Теннис',
            volleyball: 'Волейбол',
            badminton: 'Бадминтон',
            table_tennis: 'Настольный теннис',
            hockey: 'Хоккей',
            futsal: 'Футзал',
            handball: 'Гандбол',
            other: 'Другое'
        };
        return names[sport] || sport;
    };

    const getSkillLevelColor = (level) => {
        const colors = {
            beginner: 'bg-green-100 text-green-800',
            intermediate: 'bg-yellow-100 text-yellow-800',
            advanced: 'bg-red-100 text-red-800',
            any: 'bg-gray-100 text-gray-800'
        };
        return colors[level] || 'bg-gray-100 text-gray-800';
    };

    const getSkillLevelName = (level) => {
        const names = {
            beginner: 'Начинающий',
            intermediate: 'Средний',
            advanced: 'Продвинутый',
            any: 'Любой'
        };
        return names[level] || level;
    };

    // Используем утилиты для проверки прав
    const userStatus = getUserGameStatus(user, game);
    const participantsInfo = getParticipantsInfo(game);
    const canJoin = canJoinGame(user, game);
    const canLeave = canLeaveGame(user, game);
    const canDelete = canDeleteGame(user, game);
    const joinRestriction = getJoinRestrictionMessage(user, game);

    const handleJoinGame = async () => {
        if (!canJoin) {
            const message = joinRestriction || 'Невозможно присоединиться к этой игре';
            setError(message);
            onShowToast?.(message, 'warning');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await gameService.joinGame(game._id);
            if (result.success) {
                // Получаем свежие данные игры
                const updatedGame = await gameService.getGameById(game._id);
                if (updatedGame.success) {
                    onGameUpdate && onGameUpdate(updatedGame.data);
                    onShowToast?.('Вы успешно присоединились к игре!', 'success');
                }
            } else {
                const message = result.message || 'Ошибка при присоединении к игре';
                setError(message);
                onShowToast?.(message, 'error');
            }
        } catch (error) {
            console.error('Error joining game:', error);
            const message = error.response?.data?.message || error.message || 'Ошибка при присоединении к игре';
            setError(message);
            onShowToast?.(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveGame = async () => {
        if (!canLeave) {
            const message = 'Невозможно покинуть эту игру';
            setError(message);
            onShowToast?.(message, 'warning');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await gameService.leaveGame(game._id);
            if (result.success) {
                // Получаем свежие данные игры
                const updatedGame = await gameService.getGameById(game._id);
                if (updatedGame.success) {
                    onGameUpdate && onGameUpdate(updatedGame.data);
                    onShowToast?.('Вы успешно покинули игру!', 'success');
                }
            } else {
                const message = result.message || 'Ошибка при выходе из игры';
                setError(message);
                onShowToast?.(message, 'error');
            }
        } catch (error) {
            console.error('Error leaving game:', error);
            const message = error.response?.data?.message || error.message || 'Ошибка при выходе из игры';
            setError(message);
            onShowToast?.(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGame = async () => {
        if (!canDelete) {
            const message = 'У вас нет прав для удаления этой игры';
            setError(message);
            onShowToast?.(message, 'warning');
            return;
        }

        const participantCount = participantsInfo.current;
        const confirmMessage = participantCount > 1
            ? `Вы уверены, что хотите отменить эту игру? ${participantCount - 1} участников будут уведомлены об отмене.`
            : 'Вы уверены, что хотите отменить эту игру?';

        if (!window.confirm(confirmMessage)) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await gameService.deleteGame(game._id, 'Игра отменена создателем');
            if (result.success || result.data) {
                onGameUpdate && onGameUpdate(null, game._id);
                onShowToast?.('Игра успешно отменена', 'info');
            } else {
                const message = result.message || 'Ошибка при удалении игры';
                setError(message);
                onShowToast?.(message, 'error');
            }
        } catch (error) {
            console.error('Error deleting game:', error);
            const message = error.response?.data?.message || error.message || 'Ошибка при удалении игры';
            setError(message);
            onShowToast?.(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Проверка, прошла ли игра
    const isGamePast = new Date(game.dateTime) < new Date();

    return (
        <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${isGamePast ? 'opacity-75' : ''
            }`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getSportIcon(game.sportType)}</span>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {getSportName(game.sportType)}
                        </h3>
                        <p className="text-sm text-gray-500">{game.format}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(game.skillLevel)}`}>
                        {getSkillLevelName(game.skillLevel)}
                    </span>
                    {userStatus === 'creator' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Создатель
                        </span>
                    )}
                    {userStatus === 'participant' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Участник
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center text-sm text-gray-600">
                <span className={isGamePast ? 'text-red-600' : ''}>
                    <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📅</span>
                        <span className={isGamePast ? 'text-red-600' : ''}>
                            {formatDate(game.dateTime)}
                            {isGamePast && <span className="ml-1">(прошла)</span>}
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">⏱️</span>
                        {game.duration} минут
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📍</span>
                        {game.court?.name || 'Площадка не указана'}
                        {game.court?.location?.address && (
                            <span className="ml-1 text-gray-500">
                                - {game.court.location.address}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">👥</span>
                        {participantsInfo.current}/{participantsInfo.max} игроков
                        {participantsInfo.isFull && <span className="ml-2 text-red-600">(полная)</span>}
                        {participantsInfo.current > 0 && (
                            <span className="ml-2 text-gray-500">
                                ({participantsInfo.percentage}% заполнено)
                            </span>
                        )}
                    </div>
                </span>
            </div>

            {/* Description */}
            {game.description && (
                <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-2">{game.description}</p>
                </div>
            )}

            {/* Creator */}
            <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                        {game.creator?.username?.charAt(0).toUpperCase() || '?'}
                    </span>
                </div>
                <span className="text-sm text-gray-600">
                    Создатель: {game.creator?.username || 'Неизвестен'}
                </span>
                {game.creator?.rating && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                        ⭐ {game.creator.rating}
                    </span>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded text-sm mb-4">
                    <div className="flex items-center">
                        <span className="mr-2">⚠️</span>
                        {error}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2 mb-4">
                {/* Кнопка присоединения */}
                {canJoin && !isGamePast && (
                    <button
                        onClick={handleJoinGame}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                        {loading ? 'Присоединение...' : 'Присоединиться'}
                    </button>
                )}

                {/* Информация о том, почему нельзя присоединиться */}
                {!canJoin && user && joinRestriction && userStatus === 'outsider' && !isGamePast && (
                    <div className="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded-lg text-sm text-center border">
                        {joinRestriction}
                    </div>
                )}

                {/* Кнопка выхода из игры */}
                {canLeave && !isGamePast && (
                    <button
                        onClick={handleLeaveGame}
                        disabled={loading}
                        className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                        {loading ? 'Выход...' : 'Покинуть игру'}
                    </button>
                )}

                {/* Кнопка удаления игры */}
                {canDelete && !isGamePast && (
                    <button
                        onClick={handleDeleteGame}
                        disabled={loading}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                        {loading ? 'Отмена...' : 'Отменить игру'}
                    </button>
                )}

                {/* Кнопка подробнее - всегда доступна */}
                <button
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                    onClick={() => {
                        // Здесь можно добавить логику для показа деталей игры
                        console.log('Show game details for:', game._id);
                    }}
                >
                    Подробнее
                </button>
            </div>

            {/* Status indicators */}
            <div className="flex justify-between items-center">
                {/* Аватары участников */}
                <div className="flex -space-x-2">
                    {game.currentPlayers && game.currentPlayers.slice(0, 5).map((player, index) => (
                        <div
                            key={player.user?._id || player._id || index}
                            className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center"
                            title={player.user?.username || 'Игрок'}
                        >
                            <span className="text-xs font-medium text-gray-700">
                                {(player.user?.username || '?').charAt(0).toUpperCase()}
                            </span>
                        </div>
                    ))}
                    {game.currentPlayers && game.currentPlayers.length > 5 && (
                        <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                                +{game.currentPlayers.length - 5}
                            </span>
                        </div>
                    )}
                    {(!game.currentPlayers || game.currentPlayers.length === 0) && (
                        <div className="text-xs text-gray-500">
                            Пока нет участников
                        </div>
                    )}
                </div>

                {/* Статусы игры */}
                <div className="flex items-center space-x-2">
                    {participantsInfo.isFull && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Полная
                        </span>
                    )}
                    {game.isPrivate && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            Приватная
                        </span>
                    )}
                    {isGamePast && game.status === 'scheduled' && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            Прошла
                        </span>
                    )}
                    {game.status !== 'scheduled' && (
                        <span className={`text-xs px-2 py-1 rounded ${game.status === 'completed' ? 'bg-green-100 text-green-800' :
                            game.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                game.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {game.status === 'completed' ? 'Завершена' :
                                game.status === 'cancelled' ? 'Отменена' :
                                    game.status === 'in_progress' ? 'В процессе' :
                                        game.status}
                        </span>
                    )}
                </div>
            </div>

            {/* Progress bar для заполненности */}
            {participantsInfo.max > 0 && (
                <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Заполненность</span>
                        <span>{participantsInfo.current}/{participantsInfo.max}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${participantsInfo.percentage >= 100 ? 'bg-red-500' :
                                participantsInfo.percentage >= 80 ? 'bg-yellow-500' :
                                    'bg-blue-500'
                                }`}
                            style={{ width: `${Math.min(participantsInfo.percentage, 100)}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Дополнительная информация для отладки (можно удалить в продакшене) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 text-xs text-gray-400 border-t pt-2">
                    Debug: Status={userStatus}, CanJoin={canJoin}, CanLeave={canLeave}, CanDelete={canDelete}
                    <br />
                    Participants: {participantsInfo.current}/{participantsInfo.max} ({participantsInfo.percentage}% full)
                    <br />
                    Game Past: {isGamePast ? 'Yes' : 'No'}, Status: {game.status}
                </div>
            )}
        </div>
    );
};


export default GameCard;