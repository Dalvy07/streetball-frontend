// src/components/Games/CreateGameForm.jsx
import React, { useState, useEffect } from 'react';
import { gameService } from '../../services/gameService';
import { courtService } from '../../services/courtService';

const CreateGameForm = ({ onGameCreated, onCancel }) => {
    const [formData, setFormData] = useState({
        court: '',
        sportType: 'basketball',
        dateTime: '',
        duration: 60,
        format: '5x5',
        maxPlayers: 10,
        description: '',
        skillLevel: 'any',
        isPrivate: false,
        tags: []
    });

    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingCourts, setLoadingCourts] = useState(true);

    useEffect(() => {
        loadCourts();
    }, []);

    const loadCourts = async () => {
        try {
            const response = await courtService.getAllCourts({ limit: 100 });
            setCourts(response.data);
        } catch (error) {
            console.error('Error loading courts:', error);
        } finally {
            setLoadingCourts(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Check if the date is in the future
            const gameDate = new Date(formData.dateTime);
            if (gameDate <= new Date()) {
                throw new Error('Game date must be in the future');
            }

            const result = await gameService.createGame(formData);
            if (result.success) {
                // Get fresh data of the created game
                const createdGame = await gameService.getGameById(result.data._id);
                if (createdGame.success) {
                    onGameCreated && onGameCreated(createdGame.data);
                }
            } else {
                setError(result.message || 'Error creating game');
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Error creating game');
        } finally {
            setLoading(false);
        }
    };

    const sportTypes = [
        { value: 'basketball', label: 'Basketball' },
        { value: 'football', label: 'Football' },
        { value: 'tennis', label: 'Tennis' },
        { value: 'volleyball', label: 'Volleyball' },
        { value: 'badminton', label: 'Badminton' },
        { value: 'table_tennis', label: 'Table Tennis' },
        { value: 'hockey', label: 'Hockey' },
        { value: 'futsal', label: 'Futsal' },
        { value: 'handball', label: 'Handball' },
        { value: 'other', label: 'Other' }
    ];

    const formats = [
        { value: '3x3', label: '3 on 3' },
        { value: '5x5', label: '5 on 5' },
        { value: 'freestyle', label: 'Freestyle' },
        { value: 'training', label: 'Training' },
        { value: 'other', label: 'Other' }
    ];

    const skillLevels = [
        { value: 'any', label: 'Any Level' },
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' }
    ];

    // Minimum date - current time + 1 hour
    const minDateTime = new Date();
    minDateTime.setHours(minDateTime.getHours() + 1);
    const minDateTimeString = minDateTime.toISOString().slice(0, 16);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Create Game</h2>
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <span className="text-2xl">&times;</span>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Court */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Court *
                            </label>
                            {loadingCourts ? (
                                <div className="text-sm text-gray-500">Loading courts...</div>
                            ) : (
                                <select
                                    name="court"
                                    value={formData.court}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a court</option>
                                    {courts.map(court => (
                                        <option key={court._id} value={court._id}>
                                            {court.name} - {court.location.address}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Sport Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sport Type *
                            </label>
                            <select
                                name="sportType"
                                value={formData.sportType}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {sportTypes.map(sport => (
                                    <option key={sport.value} value={sport.value}>
                                        {sport.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date and Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date and Time *
                            </label>
                            <input
                                type="datetime-local"
                                name="dateTime"
                                value={formData.dateTime}
                                onChange={handleChange}
                                min={minDateTimeString}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Duration and Format */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration (minutes) *
                                </label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    min="30"
                                    max="480"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Game Format *
                                </label>
                                <select
                                    name="format"
                                    value={formData.format}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {formats.map(format => (
                                        <option key={format.value} value={format.value}>
                                            {format.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Maximum Players and Skill Level */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Players *
                                </label>
                                <input
                                    type="number"
                                    name="maxPlayers"
                                    value={formData.maxPlayers}
                                    onChange={handleChange}
                                    min="2"
                                    max="50"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Skill Level *
                                </label>
                                <select
                                    name="skillLevel"
                                    value={formData.skillLevel}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {skillLevels.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Private Game */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isPrivate"
                                checked={formData.isPrivate}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                                Private Game
                            </label>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Add any additional details about the game..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Game'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateGameForm;