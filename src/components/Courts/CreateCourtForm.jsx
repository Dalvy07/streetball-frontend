// src/components/Courts/CreateCourtForm.jsx
import React, { useState } from 'react';
import { courtService } from '../../services/courtService';

const CreateCourtForm = ({ onCourtCreated, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        location: {
            coordinates: ['', ''],
            address: ''
        },
        sportTypes: [],
        photos: [],
        description: '',
        features: {
            covered: false,
            lighting: false,
            surface: '',
            changingRooms: false
        },
        workingHours: {
            monday: { open: '08:00', close: '22:00' },
            tuesday: { open: '08:00', close: '22:00' },
            wednesday: { open: '08:00', close: '22:00' },
            thursday: { open: '08:00', close: '22:00' },
            friday: { open: '08:00', close: '22:00' },
            saturday: { open: '08:00', close: '22:00' },
            sunday: { open: '08:00', close: '22:00' }
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    const surfaces = [
        { value: '', label: 'Не указано' },
        { value: 'asphalt', label: 'Асфальт' },
        { value: 'concrete', label: 'Бетон' },
        { value: 'rubber', label: 'Резина' },
        { value: 'grass', label: 'Трава' },
        { value: 'artificial_grass', label: 'Искусственная трава' },
        { value: 'parquet', label: 'Паркет' },
        { value: 'clay', label: 'Грунт' },
        { value: 'sand', label: 'Песок' },
        { value: 'other', label: 'Другое' }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleCoordinatesChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                coordinates: prev.location.coordinates.map((coord, i) =>
                    i === index ? parseFloat(value) || '' : coord
                )
            }
        }));
    };

    const handleSportTypesChange = (sportType) => {
        setFormData(prev => ({
            ...prev,
            sportTypes: prev.sportTypes.includes(sportType)
                ? prev.sportTypes.filter(type => type !== sportType)
                : [...prev.sportTypes, sportType]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Валидация координат
            const [longitude, latitude] = formData.location.coordinates;
            if (!longitude || !latitude) {
                throw new Error('Необходимо указать координаты площадки');
            }

            if (longitude < -180 || longitude > 180) {
                throw new Error('Долгота должна быть от -180 до 180');
            }

            if (latitude < -90 || latitude > 90) {
                throw new Error('Широта должна быть от -90 до 90');
            }

            if (formData.sportTypes.length === 0) {
                throw new Error('Выберите хотя бы один вид спорта');
            }

            const result = await courtService.createCourt(formData);
            onCourtCreated && onCourtCreated(result.data);
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Ошибка при создании площадки');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Добавить площадку</h2>
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
                        {/* Основная информация */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Название площадки *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Например, Спортивная площадка №1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Адрес *
                                </label>
                                <input
                                    type="text"
                                    name="location.address"
                                    value={formData.location.address}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Полный адрес площадки"
                                />
                            </div>
                        </div>

                        {/* Координаты */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Долгота *
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.location.coordinates[0]}
                                    onChange={(e) => handleCoordinatesChange(0, e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Например, 30.3158"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Широта *
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.location.coordinates[1]}
                                    onChange={(e) => handleCoordinatesChange(1, e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Например, 59.9398"
                                />
                            </div>
                        </div>

                        {/* Виды спорта */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Виды спорта * (выберите хотя бы один)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {sportTypes.map(sport => (
                                    <label key={sport.value} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.sportTypes.includes(sport.value)}
                                            onChange={() => handleSportTypesChange(sport.value)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">{sport.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Особенности */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Особенности площадки
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="features.covered"
                                        checked={formData.features.covered}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Крытая площадка</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="features.lighting"
                                        checked={formData.features.lighting}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Освещение</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="features.changingRooms"
                                        checked={formData.features.changingRooms}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Раздевалки</span>
                                </label>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Покрытие
                                    </label>
                                    <select
                                        name="features.surface"
                                        value={formData.features.surface}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {surfaces.map(surface => (
                                            <option key={surface.value} value={surface.value}>
                                                {surface.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                                maxLength="1000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Дополнительная информация о площадке..."
                            />
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
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Создание...' : 'Создать площадку'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCourtForm;