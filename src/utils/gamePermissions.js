// src/utils/gamePermissions.js

/**
 * Утилиты для проверки прав пользователя в играх
 */

/**
 * Проверяет, является ли пользователь участником игры
 * @param {Object} user - объект пользователя
 * @param {Object} game - объект игры
 * @returns {boolean}
 */
export const isUserParticipant = (user, game) => {
    if (!user || !game || !game.currentPlayers) return false;

    return game.currentPlayers.some(player => {
        // Проверяем разные возможные структуры данных
        const playerId = player.user?._id?.toString() || player.user?.id?.toString() || player._id?.toString() || player.id?.toString();
        const userId = user.id?.toString() || user._id?.toString();
        return playerId === userId;
    });
};

/**
 * Проверяет, является ли пользователь создателем игры
 * @param {Object} user - объект пользователя
 * @param {Object} game - объект игры
 * @returns {boolean}
 */
export const isGameCreator = (user, game) => {
    if (!user || !game || !game.creator) return false;

    const creatorId = game.creator._id || game.creator.id;
    const userId = user.id || user._id;
    return creatorId === userId;
};

/**
 * Проверяет, может ли пользователь присоединиться к игре
 * @param {Object} user - объект пользователя
 * @param {Object} game - объект игры
 * @returns {boolean}
 */
export const canJoinGame = (user, game) => {
    if (!user || !game) return false;

    // Проверяем все условия
    const notParticipant = !isUserParticipant(user, game);
    const notCreator = !isGameCreator(user, game);
    const hasSpace = (game.currentPlayers?.length || 0) < game.maxPlayers;
    const isScheduled = game.status === 'scheduled';
    const isFuture = new Date(game.dateTime) > new Date();
    const isNotPrivateOrInvited = !game.isPrivate; // Можно расширить для приглашений

    return notParticipant && notCreator && hasSpace && isScheduled && isFuture && isNotPrivateOrInvited;
};

/**
 * Проверяет, может ли пользователь покинуть игру
 * @param {Object} user - объект пользователя
 * @param {Object} game - объект игры
 * @returns {boolean}
 */
export const canLeaveGame = (user, game) => {
    if (!user || !game) return false;

    const isParticipant = isUserParticipant(user, game);
    const notCreator = !isGameCreator(user, game);
    const isScheduled = game.status === 'scheduled';
    const isFuture = new Date(game.dateTime) > new Date();

    return isParticipant && notCreator && isScheduled && isFuture;
};

/**
 * Проверяет, может ли пользователь удалить игру
 * @param {Object} user - объект пользователя
 * @param {Object} game - объект игры
 * @returns {boolean}
 */
export const canDeleteGame = (user, game) => {
    if (!user || !game) return false;

    const isCreator = isGameCreator(user, game);
    const isDeletable = game.status === 'scheduled' || game.status === 'created';
    const isFuture = new Date(game.dateTime) > new Date();

    return isCreator && isDeletable && isFuture;
};

/**
 * Проверяет, может ли пользователь редактировать игру
 * @param {Object} user - объект пользователя
 * @param {Object} game - объект игры
 * @returns {boolean}
 */
export const canEditGame = (user, game) => {
    if (!user || !game) return false;

    const isCreator = isGameCreator(user, game);
    const isEditable = game.status === 'scheduled' || game.status === 'created';
    const isFuture = new Date(game.dateTime) > new Date();

    return isCreator && isEditable && isFuture;
};

/**
 * Получает статус пользователя относительно игры
 * @param {Object} user - объект пользователя
 * @param {Object} game - объект игры
 * @returns {string} - 'creator', 'participant', 'outsider', 'guest'
 */
export const getUserGameStatus = (user, game) => {
    if (!user) return 'guest';
    if (!game) return 'outsider';

    if (isGameCreator(user, game)) return 'creator';
    if (isUserParticipant(user, game)) return 'participant';
    return 'outsider';
};

/**
 * Проверяет, заполнена ли игра до максимума
 * @param {Object} game - объект игры
 * @returns {boolean}
 */
export const isGameFull = (game) => {
    if (!game) return false;
    return (game.currentPlayers?.length || 0) >= game.maxPlayers;
};

/**
 * Проверяет, началась ли игра
 * @param {Object} game - объект игры
 * @returns {boolean}
 */
export const hasGameStarted = (game) => {
    if (!game) return false;
    return new Date(game.dateTime) <= new Date();
};

/**
 * Проверяет, активна ли игра (можно присоединиться/покинуть)
 * @param {Object} game - объект игры
 * @returns {boolean}
 */
export const isGameActive = (game) => {
    if (!game) return false;
    return game.status === 'scheduled' && !hasGameStarted(game);
};

/**
 * Получает список доступных действий для пользователя
 * @param {Object} user - объект пользователя
 * @param {Object} game - объект игры
 * @returns {Array} - массив доступных действий
 */
export const getAvailableActions = (user, game) => {
    const actions = [];

    if (!user) {
        actions.push('login_required');
        return actions;
    }

    if (!game) {
        return actions;
    }

    if (canJoinGame(user, game)) {
        actions.push('join');
    }

    if (canLeaveGame(user, game)) {
        actions.push('leave');
    }

    if (canEditGame(user, game)) {
        actions.push('edit');
    }

    if (canDeleteGame(user, game)) {
        actions.push('delete');
    }

    // Всегда можно посмотреть детали
    actions.push('view_details');

    return actions;
};

/**
 * Получает сообщение о том, почему пользователь не может присоединиться к игре
 * @param {Object} user - объект пользователя
 * @param {Object} game - объект игры
 * @returns {string|null} - сообщение об ошибке или null, если может присоединиться
 */
export const getJoinRestrictionMessage = (user, game) => {
    if (!user) return 'Необходимо войти в систему';
    if (!game) return 'Игра не найдена';

    if (isGameCreator(user, game)) return 'Вы создатель этой игры';
    if (isUserParticipant(user, game)) return 'Вы уже участвуете в этой игре';
    if (isGameFull(game)) return 'В игре нет свободных мест';
    if (game.status !== 'scheduled') return 'Игра недоступна для присоединения';
    if (hasGameStarted(game)) return 'Игра уже началась';
    if (game.isPrivate) return 'Это приватная игра';

    return null; // Может присоединиться
};

/**
 * Форматирует информацию об участниках игры
 * @param {Object} game - объект игры
 * @returns {Object} - объект с информацией об участниках
 */
export const getParticipantsInfo = (game) => {
    if (!game || !game.currentPlayers) {
        return {
            current: 0,
            max: game?.maxPlayers || 0,
            available: game?.maxPlayers || 0,
            isFull: false,
            percentage: 0
        };
    }

    const current = game.currentPlayers.length;
    const max = game.maxPlayers;
    const available = Math.max(0, max - current);
    const isFull = current >= max;
    const percentage = max > 0 ? Math.round((current / max) * 100) : 0;

    return {
        current,
        max,
        available,
        isFull,
        percentage
    };
};