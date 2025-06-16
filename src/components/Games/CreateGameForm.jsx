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
            // Проверяем, что дата в будущем
            const gameDate = new Date(formData.dateTime);
            if (gameDate <= new Date()) {
                throw new Error('Дата игры должна быть в будущем');
            }

            const result = await gameService.createGame(formData);
            onGameCreated && onGameCreated(result.data);
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Ошибка при создании игры');
        } finally {
            setLoading(false);
        }
    };

    const sportTypes = [
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

    const formats = [
        { value: '3x3', label: '3 на 3' },
        { value: '5x5', label: '5 на 5' },
        { value: 'freestyle', label: 'Свободная игра' },
        { value: 'training', label: 'Тренировка' },
        { value: 'other', label: 'Другое' }
    ];

    const skillLevels = [
        { value: 'any', label: 'Любой уровень' },
        { value: 'beginner', label: 'Начинающий' },
        { value: 'intermediate', label: 'Средний' },
        { value: 'advanced', label: 'Продвинутый' }
    ];

    // Минимальная дата - текущее время + 1 час
    const minDateTime = new Date();
    minDateTime.setHours(minDateTime.getHours() + 1);
    const minDateTimeString = minDateTime.toISOString().slice(0, 16);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Создать игру</h2>
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
                        {/* Площадка */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Площадка *
                            </label>
                            {loadingCourts ? (
                                <div className="text-sm text-gray-500">Загрузка площадок...</div>
                            ) : (
                                <select
                                    name="court"
                                    value={formData.court}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Выберите площадку</option>
                                    {courts.map(court => (
                                        <option key={court._id} value={court._id}>
                                            {court.name} - {court.location.address}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Тип спорта */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Вид спорта *
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

                        {/* Дата и время */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Дата и время *
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

                        {/* Продолжительность и формат */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Продолжительность (минуты) *
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
                                    Формат игры *
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

                        {/* Максимальное количество игроков и уровень */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Максимум игроков *
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
                                    Уровень мастерства
                                </label>
                                <select
                                    name="skillLevel"
                                    value={formData.skillLevel}
                                    onChange={handleChange}
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

                        {/* Описание */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Описание
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                maxLength="500"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Дополнительная информация о игре..."
                            />
                        </div>

                        {/* Приватная игра */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isPrivate"
                                checked={formData.isPrivate}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <label className="text-sm text-gray-700">
                                Приватная игра (только по приглашениям)
                            </label>
                        </div>

                        {/* Кнопки */}
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={loading || loadingCourts}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Создание...' : 'Создать игру'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateGameForm;