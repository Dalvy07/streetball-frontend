// src/components/Games/GameCard.jsx
import React, { useState } from 'react';
import { gameService } from '../../services/gameService';
import { authService } from '../../services/authService';

const GameCard = ({ game, onGameUpdate }) => {
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

    const getSkillLevelColor = (level) => {
        const colors = {
            beginner: 'bg-green-100 text-green-800',
            intermediate: 'bg-yellow-100 text-yellow-800',
            advanced: 'bg-red-100 text-red-800',
            any: 'bg-gray-100 text-gray-800'
        };
        return colors[level] || 'bg-gray-100 text-gray-800';
    };

    const isUserParticipant = () => {
        return game.currentPlayers.some(player => player.user._id === user.id);
    };

    const isGameCreator = () => {
        return game.creator._id === user.id;
    };

    const canJoin = () => {
        return !isUserParticipant() && game.currentPlayers.length < game.maxPlayers &&
            game.status === 'scheduled' && new Date(game.dateTime) > new Date();
    };

    const handleJoinGame = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await gameService.joinGame(game._id);
            onGameUpdate && onGameUpdate(result.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при присоединении к игре');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveGame = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await gameService.leaveGame(game._id);
            onGameUpdate && onGameUpdate(result.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при покидании игры');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGame = async () => {
        if (!window.confirm('Вы уверены, что хотите отменить эту игру?')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await gameService.deleteGame(game._id, 'Игра отменена создателем');
            onGameUpdate && onGameUpdate(null, game._id);
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при удалении игры');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getSportIcon(game.sportType)}</span>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                            {game.sportType}
                        </h3>
                        <p className="text-sm text-gray-500">{game.format}</p>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(game.skillLevel)}`}>
                    {game.skillLevel}
                </span>
            </div>

            {/* Game Info */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    {formatDate(game.dateTime)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">⏱️</span>
                    {game.duration} минут
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📍</span>
                    {game.court.name}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">👥</span>
                    {game.currentPlayers.length}/{game.maxPlayers} игроков
                </div>
            </div>

            {/* Description */}
            {game.description && (
                <p className="text-sm text-gray-700 mb-4">{game.description}</p>
            )}

            {/* Creator */}
            <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                        {game.creator.username?.charAt(0).toUpperCase()}
                    </span>
                </div>
                <span className="text-sm text-gray-600">
                    Создатель: {game.creator.username}
                </span>
            </div>

            {/* Actions */}
            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded text-sm mb-4">
                    {error}
                </div>
            )}

            <div className="flex space-x-2">
                {canJoin() && (
                    <button
                        onClick={handleJoinGame}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        {loading ? 'Присоединение...' : 'Присоединиться'}
                    </button>
                )}

                {isUserParticipant() && !isGameCreator() && (
                    <button
                        onClick={handleLeaveGame}
                        disabled={loading}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        {loading ? 'Выход...' : 'Покинуть игру'}
                    </button>
                )}

                {isGameCreator() && game.status === 'scheduled' && (
                    <button
                        onClick={handleDeleteGame}
                        disabled={loading}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        {loading ? 'Отмена...' : 'Отменить игру'}
                    </button>
                )}

                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                    Подробнее
                </button>
            </div>

            {/* Status indicator */}
            <div className="mt-4 flex justify-between items-center">
                <div className="flex -space-x-2">
                    {game.currentPlayers.slice(0, 5).map((player, index) => (
                        <div
                            key={player.user._id}
                            className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center"
                            title={player.user.username}
                        >
                            <span className="text-xs font-medium text-gray-700">
                                {player.user.username?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    ))}
                    {game.currentPlayers.length > 5 && (
                        <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                                +{game.currentPlayers.length - 5}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {game.currentPlayers.length === game.maxPlayers && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Полная
                        </span>
                    )}
                    {game.status !== 'scheduled' && (
                        <span className={`text-xs px-2 py-1 rounded ${game.status === 'completed' ? 'bg-green-100 text-green-800' :
                                game.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                            }`}>
                            {game.status === 'completed' ? 'Завершена' :
                                game.status === 'cancelled' ? 'Отменена' :
                                    game.status === 'in_progress' ? 'В процессе' : game.status}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameCard;