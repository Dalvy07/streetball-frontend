// // src/components/Profile/MyGames.jsx
// import React, { useState, useEffect } from 'react';
// import { gameService } from '../../services/gameService';
// import { userService } from '../../services/userService'; // Use userService instead
// import { authService } from '../../services/authService';
// import GameCard from '../Games/GameCard';
// import { Link } from 'react-router-dom';

// const MyGames = ({ userId }) => {

//     const [games, setGames] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [activeTab, setActiveTab] = useState('all');
//     const [pagination, setPagination] = useState({});
//     const [currentPage, setCurrentPage] = useState(1);

//     useEffect(() => {
//         loadGames();
//     }, [activeTab, currentPage]);

//     const loadGames = async () => {
//         setLoading(true);
//         setError('');

//         try {
//             // Get current user if userId not provided
//             const currentUser = authService.getCurrentUser();
//             const targetUserId = userId || currentUser?._id || currentUser?.id;

//             if (!targetUserId) {
//                 setError('Unable to identify user');
//                 setLoading(false);
//                 return;
//             }

//             // Build parameters for the API call
//             const params = {
//                 page: currentPage,
//                 limit: 10
//             };

//             // Add type filter only if it's not 'all'
//             if (activeTab && activeTab !== 'all') {
//                 params.type = activeTab;
//             }

//             console.log('Loading user games with params:', params, 'for user:', targetUserId);

//             // Use userService to get user's games - this typically uses /users/:id/games
//             const response = await userService.getUserGames(targetUserId, params);
            
//             if (response.success) {
//                 setGames(response.data || []);
//                 setPagination(response.pagination || {
//                     current_page: 1,
//                     total_pages: 1,
//                     total: response.data?.length || 0,
//                     has_next: false,
//                     has_prev: false
//                 });
//             } else {
//                 setError(response.message || 'Error loading games');
//             }
//         } catch (error) {
//             console.error('Error loading my games:', error);
//             setError(error.response?.data?.message || error.message || 'Error loading games');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ... rest of the component remains the same
//     // (keeping the same handleGameUpdate, handleTabChange, etc.)

//     const handleGameUpdate = async (updatedGame, deletedGameId) => {
//         if (deletedGameId) {
//             setGames(prev => prev.filter(game => game._id !== deletedGameId));
//         } else if (updatedGame) {
//             try {
//                 const response = await gameService.getGameById(updatedGame._id);
//                 if (response.success) {
//                     setGames(prev => prev.map(game =>
//                         game._id === updatedGame._id ? response.data : game
//                     ));
//                 }
//             } catch (error) {
//                 console.error('Error refreshing game data:', error);
//                 setGames(prev => prev.map(game =>
//                     game._id === updatedGame._id ? updatedGame : game
//                 ));
//             }
//         }
//     };

//     const handleTabChange = (tab) => {
//         setActiveTab(tab);
//         setCurrentPage(1);
//     };

//     const handlePageChange = (newPage) => {
//         setCurrentPage(newPage);
//     };

//     const tabs = [
//         { id: 'all', name: 'All Games', icon: '🏀' },
//         { id: 'created', name: 'Created', icon: '➕' },
//         { id: 'joined', name: 'Joined', icon: '👥' }
//     ];

//     const getEmptyStateContent = () => {
//         switch (activeTab) {
//             case 'created':
//                 return {
//                     icon: '➕',
//                     title: 'You haven\'t created any games yet',
//                     description: 'Create your first game and invite friends!',
//                     actionText: 'Create Game',
//                     actionLink: '/games'
//                 };
//             case 'joined':
//                 return {
//                     icon: '👥',
//                     title: 'You haven\'t joined any games yet',
//                     description: 'Find interesting games and join them!',
//                     actionText: 'Find Games',
//                     actionLink: '/games'
//                 };
//             default:
//                 return {
//                     icon: '🏀',
//                     title: 'You don\'t have any games yet',
//                     description: 'Create a game or join an existing one!',
//                     actionText: 'Find Games',
//                     actionLink: '/games'
//                 };
//         }
//     };

//     const formatDateTime = (dateString) => {
//         const date = new Date(dateString);
//         const now = new Date();
//         const tomorrow = new Date(now);
//         tomorrow.setDate(tomorrow.getDate() + 1);

//         if (date.toDateString() === now.toDateString()) {
//             return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
//         } else if (date.toDateString() === tomorrow.toDateString()) {
//             return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
//         } else {
//             return date.toLocaleString('en-US', {
//                 day: 'numeric',
//                 month: 'short',
//                 hour: '2-digit',
//                 minute: '2-digit'
//             });
//         }
//     };

//     const getGameStatus = (game) => {
//         const now = new Date();
//         const gameDate = new Date(game.dateTime);
//         const gameEndDate = new Date(gameDate.getTime() + game.duration * 60000);

//         if (game.status === 'cancelled') {
//             return { text: 'Cancelled', color: 'bg-red-100 text-red-800' };
//         }

//         if (now > gameEndDate) {
//             return { text: 'Completed', color: 'bg-gray-100 text-gray-800' };
//         }

//         if (now >= gameDate && now <= gameEndDate) {
//             return { text: 'In Progress', color: 'bg-yellow-100 text-yellow-800' };
//         }

//         if (gameDate > now) {
//             return { text: 'Scheduled', color: 'bg-green-100 text-green-800' };
//         }

//         return { text: game.status, color: 'bg-gray-100 text-gray-800' };
//     };

//     const emptyState = getEmptyStateContent();

//     return (
//         <div className="space-y-6">
//             {/* Header and tabs */}
//             <div>
//                 <h3 className="text-lg font-medium text-gray-900 mb-4">My Games</h3>
//                 <div className="border-b border-gray-200">
//                     <nav className="-mb-px flex space-x-8">
//                         {tabs.map(tab => (
//                             <button
//                                 key={tab.id}
//                                 onClick={() => handleTabChange(tab.id)}
//                                 className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
//                                         ? 'border-blue-500 text-blue-600'
//                                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                                     }`}
//                             >
//                                 <span className="mr-2">{tab.icon}</span>
//                                 {tab.name}
//                             </button>
//                         ))}
//                     </nav>
//                 </div>
//             </div>

//             {/* Error message */}
//             {error && (
//                 <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
//                     {error}
//                 </div>
//             )}

//             {/* Loading */}
//             {loading && (
//                 <div className="flex justify-center items-center py-12">
//                     <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//                 </div>
//             )}

//             {/* Game list */}
//             {!loading && (
//                 <>
//                     {games.length === 0 ? (
//                         <div className="text-center py-12">
//                             <span className="text-6xl mb-4 block">{emptyState.icon}</span>
//                             <h4 className="text-lg font-medium text-gray-900 mb-2">
//                                 {emptyState.title}
//                             </h4>
//                             <p className="text-gray-600 mb-6">
//                                 {emptyState.description}
//                             </p>
//                             <Link
//                                 to={emptyState.actionLink}
//                                 className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
//                             >
//                                 {emptyState.actionText}
//                             </Link>
//                         </div>
//                     ) : (
//                         <>
//                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                                 {games.map(game => (
//                                     <div key={game._id} className="relative">
//                                         <GameCard
//                                             game={game}
//                                             onGameUpdate={handleGameUpdate}
//                                         />
//                                         {/* Additional information for "My Games" */}
//                                         <div className="absolute top-4 right-4 flex space-x-2">
//                                             {/* Game status */}
//                                             <span className={`text-xs px-2 py-1 rounded-full font-medium ${getGameStatus(game).color}`}>
//                                                 {getGameStatus(game).text}
//                                             </span>

//                                             {/* User role */}
//                                             {game.creator._id === userId ? (
//                                                 <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
//                                                     Creator
//                                                 </span>
//                                             ) : (
//                                                 <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
//                                                     Participant
//                                                 </span>
//                                             )}
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>

//                             {/* Pagination */}
//                             {pagination.total_pages > 1 && (
//                                 <div className="flex justify-center items-center space-x-4 mt-8">
//                                     <button
//                                         onClick={() => handlePageChange(currentPage - 1)}
//                                         disabled={!pagination.has_prev}
//                                         className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                         Previous
//                                     </button>

//                                     <span className="text-gray-600">
//                                         Page {pagination.current_page} of {pagination.total_pages}
//                                     </span>

//                                     <button
//                                         onClick={() => handlePageChange(currentPage + 1)}
//                                         disabled={!pagination.has_next}
//                                         className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                         Next
//                                     </button>
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </>
//             )}
//         </div>
//     );
// };

// export default MyGames;



// src/components/Profile/MyGames.jsx - FIXED VERSION (No Duplicate Tags)
import React, { useState, useEffect } from 'react';
import { gameService } from '../../services/gameService';
import GameCard from '../Games/GameCard';
import { Link } from 'react-router-dom';

const MyGames = ({ userId }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadGames();
    }, [activeTab, currentPage]);

    const loadGames = async () => {
        setLoading(true);
        setError('');

        try {
            // Build parameters for the API call
            const params = {
                page: currentPage,
                limit: 10
            };

            // Add type filter - make sure we're sending the correct type
            params.type = activeTab;

            console.log('Loading games with params:', params);

            const response = await gameService.getMyGames(params);
            
            if (response.success) {
                console.log('Games loaded successfully:', response.data);
                setGames(response.data || []);
                setPagination(response.pagination || {
                    current_page: 1,
                    total_pages: 1,
                    total: response.data?.length || 0,
                    has_next: false,
                    has_prev: false
                });
            } else {
                console.error('Failed to load games:', response.message);
                setError(response.message || 'Error loading games');
            }
        } catch (error) {
            console.error('Error loading my games:', error);
            setError(error.response?.data?.message || error.message || 'Error loading games');
        } finally {
            setLoading(false);
        }
    };

    const handleGameUpdate = async (updatedGame, deletedGameId) => {
        if (deletedGameId) {
            setGames(prev => prev.filter(game => game._id !== deletedGameId));
        } else if (updatedGame) {
            // Get fresh game data
            try {
                const response = await gameService.getGameById(updatedGame._id);
                if (response.success) {
                    setGames(prev => prev.map(game =>
                        game._id === updatedGame._id ? response.data : game
                    ));
                }
            } catch (error) {
                console.error('Error refreshing game data:', error);
                // Fallback: use passed data
                setGames(prev => prev.map(game =>
                    game._id === updatedGame._id ? updatedGame : game
                ));
            }
        }
    };

    const handleTabChange = (tab) => {
        console.log('Changing tab to:', tab);
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const tabs = [
        { id: 'all', name: 'All Games', icon: '🏀' },
        { id: 'created', name: 'Created', icon: '➕' },
        { id: 'joined', name: 'Joined', icon: '👥' }
    ];

    const getEmptyStateContent = () => {
        switch (activeTab) {
            case 'created':
                return {
                    icon: '➕',
                    title: 'You haven\'t created any games yet',
                    description: 'Create your first game and invite friends!',
                    actionText: 'Create Game',
                    actionLink: '/games'
                };
            case 'joined':
                return {
                    icon: '👥',
                    title: 'You haven\'t joined any games yet',
                    description: 'Find interesting games and join them!',
                    actionText: 'Find Games',
                    actionLink: '/games'
                };
            default:
                return {
                    icon: '🏀',
                    title: 'You don\'t have any games yet',
                    description: 'Create a game or join an existing one!',
                    actionText: 'Find Games',
                    actionLink: '/games'
                };
        }
    };

    const isUserCreator = (game) => {
        if (!game || !game.creator || !userId) return false;
        const creatorId = game.creator._id || game.creator.id || game.creator;
        return creatorId === userId;
    };

    const emptyState = getEmptyStateContent();

    return (
        <div className="space-y-6">
            {/* Header and tabs */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">My Games</h3>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Debug info (remove in production) */}
            <div className="bg-gray-100 p-3 rounded text-sm">
                <strong>Debug:</strong> Active tab: {activeTab}, Games count: {games.length}, 
                Page: {currentPage}, Loading: {loading.toString()}
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
                    <div className="flex items-center">
                        <span className="text-red-400 mr-2">⚠️</span>
                        <p className="text-sm">{error}</p>
                    </div>
                    <button
                        onClick={loadGames}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">Loading games...</span>
                    </div>
                </div>
            )}

            {/* Game list */}
            {!loading && (
                <>
                    {games.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-6xl mb-4 block">{emptyState.icon}</span>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                {emptyState.title}
                            </h4>
                            <p className="text-gray-600 mb-6">
                                {emptyState.description}
                            </p>
                            <Link
                                to={emptyState.actionLink}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                            >
                                {emptyState.actionText}
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {games.map(game => (
                                    <div key={game._id} className="relative">
                                        {/* Use GameCard without modifications - it already handles the badges correctly */}
                                        <GameCard
                                            game={game}
                                            onGameUpdate={handleGameUpdate}
                                        />
                                        
                                        {/* Only add ONE additional badge for user role in top-left corner */}
                                        <div className="absolute top-4 left-4">
                                            {isUserCreator(game) ? (
                                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                                                    👑 Creator
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
                                                    👥 Participant
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.total_pages > 1 && (
                                <div className="flex justify-center items-center space-x-4 mt-8">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={!pagination.has_prev}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    <span className="text-gray-600">
                                        Page {pagination.current_page} of {pagination.total_pages}
                                    </span>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={!pagination.has_next}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}

                            {/* Results summary */}
                            {pagination.total > 0 && (
                                <div className="text-center text-sm text-gray-600 mt-4">
                                    Showing {games.length} of {pagination.total} games
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default MyGames;