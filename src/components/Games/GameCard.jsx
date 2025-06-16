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
        return date.toLocaleDateString('en-US', {
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
            basketball: 'Basketball',
            football: 'Football',
            tennis: 'Tennis',
            volleyball: 'Volleyball',
            badminton: 'Badminton',
            table_tennis: 'Table Tennis',
            hockey: 'Hockey',
            futsal: 'Futsal',
            handball: 'Handball',
            other: 'Other'
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
            beginner: 'Beginner',
            intermediate: 'Intermediate',
            advanced: 'Advanced',
            any: 'Any'
        };
        return names[level] || level;
    };

    // Use utilities to check permissions
    const userStatus = getUserGameStatus(user, game);
    const participantsInfo = getParticipantsInfo(game);
    const canJoin = canJoinGame(user, game);
    const canLeave = canLeaveGame(user, game);
    const canDelete = canDeleteGame(user, game);
    const joinRestriction = getJoinRestrictionMessage(user, game);

    const handleJoinGame = async () => {
        if (!canJoin) {
            const message = joinRestriction || 'Cannot join this game';
            setError(message);
            onShowToast?.(message, 'warning');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await gameService.joinGame(game._id);
            if (result.success) {
                // Get fresh game data
                const updatedGame = await gameService.getGameById(game._id);
                if (updatedGame.success) {
                    onGameUpdate && onGameUpdate(updatedGame.data);
                    onShowToast?.('Successfully joined the game!', 'success');
                }
            } else {
                const message = result.message || 'Error joining the game';
                setError(message);
                onShowToast?.(message, 'error');
            }
        } catch (error) {
            console.error('Error joining game:', error);
            const message = error.response?.data?.message || error.message || 'Error joining the game';
            setError(message);
            onShowToast?.(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveGame = async () => {
        if (!canLeave) {
            const message = 'Cannot leave this game';
            setError(message);
            onShowToast?.(message, 'warning');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await gameService.leaveGame(game._id);
            if (result.success) {
                // Get fresh game data
                const updatedGame = await gameService.getGameById(game._id);
                if (updatedGame.success) {
                    onGameUpdate && onGameUpdate(updatedGame.data);
                    onShowToast?.('Successfully left the game!', 'success');
                }
            } else {
                const message = result.message || 'Error leaving the game';
                setError(message);
                onShowToast?.(message, 'error');
            }
        } catch (error) {
            console.error('Error leaving game:', error);
            const message = error.response?.data?.message || error.message || 'Error leaving the game';
            setError(message);
            onShowToast?.(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGame = async () => {
        if (!canDelete) {
            const message = 'You do not have permission to delete this game';
            setError(message);
            onShowToast?.(message, 'warning');
            return;
        }

        const participantCount = participantsInfo.current;
        const confirmMessage = participantCount > 1
            ? `Are you sure you want to cancel this game? ${participantCount - 1} participants will be notified of the cancellation.`
            : 'Are you sure you want to cancel this game?';

        if (!window.confirm(confirmMessage)) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await gameService.deleteGame(game._id, 'Game cancelled by creator');
            if (result.success || result.data) {
                onGameUpdate && onGameUpdate(null, game._id);
                onShowToast?.('Game successfully cancelled', 'info');
            } else {
                const message = result.message || 'Error deleting the game';
                setError(message);
                onShowToast?.(message, 'error');
            }
        } catch (error) {
            console.error('Error deleting game:', error);
            const message = error.response?.data?.message || error.message || 'Error deleting the game';
            setError(message);
            onShowToast?.(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Check if the game has passed
    const isGamePast = new Date(game.dateTime) < new Date();

    return (
        <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${isGamePast ? 'opacity-75' : ''}`}>
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
                            Creator
                        </span>
                    )}
                    {userStatus === 'participant' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Participant
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
                            {isGamePast && <span className="ml-1">(passed)</span>}
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">⏱️</span>
                        {game.duration} minutes
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">📍</span>
                        {game.court?.name || 'Court not specified'}
                        {game.court?.location?.address && (
                            <span className="text-gray-500 ml-1">
                                ({game.court.location.address})
                            </span>
                        )}
                    </div>
                </span>
            </div>

            {/* Participants */}
            <div className="mt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">👥</span>
                        <span className="text-sm text-gray-600">
                            {participantsInfo.current} / {game.maxPlayers} participants
                        </span>
                    </div>
                    {game.isPrivate && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                            Private Game
                        </span>
                    )}
                </div>
            </div>

            {/* Description */}
            {game.description && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600">{game.description}</p>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="mt-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-3">
                {canDelete && (
                    <button
                        onClick={handleDeleteGame}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                        {loading ? 'Cancelling...' : 'Cancel Game'}
                    </button>
                )}
                {canLeave && (
                    <button
                        onClick={handleLeaveGame}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 disabled:opacity-50"
                    >
                        {loading ? 'Leaving...' : 'Leave Game'}
                    </button>
                )}
                {canJoin && (
                    <button
                        onClick={handleJoinGame}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Joining...' : 'Join Game'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default GameCard;