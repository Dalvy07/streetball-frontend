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

    const surfaces = [
        { value: '', label: 'Not specified' },
        { value: 'asphalt', label: 'Asphalt' },
        { value: 'concrete', label: 'Concrete' },
        { value: 'rubber', label: 'Rubber' },
        { value: 'grass', label: 'Grass' },
        { value: 'artificial_grass', label: 'Artificial Grass' },
        { value: 'parquet', label: 'Parquet' },
        { value: 'clay', label: 'Clay' },
        { value: 'sand', label: 'Sand' },
        { value: 'other', label: 'Other' }
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
            // Validate coordinates
            const [longitude, latitude] = formData.location.coordinates;
            if (!longitude || !latitude) {
                throw new Error('Court coordinates are required');
            }

            if (longitude < -180 || longitude > 180) {
                throw new Error('Longitude must be between -180 and 180');
            }

            if (latitude < -90 || latitude > 90) {
                throw new Error('Latitude must be between -90 and 90');
            }

            if (formData.sportTypes.length === 0) {
                throw new Error('Select at least one sport type');
            }

            const result = await courtService.createCourt(formData);
            onCourtCreated && onCourtCreated(result.data);
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Error creating court');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Add Court</h2>
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
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Court Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Sports Court #1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address *
                                </label>
                                <input
                                    type="text"
                                    name="location.address"
                                    value={formData.location.address}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Full court address"
                                />
                            </div>
                        </div>

                        {/* Coordinates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Longitude *
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.location.coordinates[0]}
                                    onChange={(e) => handleCoordinatesChange(0, e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 30.3158"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Latitude *
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.location.coordinates[1]}
                                    onChange={(e) => handleCoordinatesChange(1, e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 59.9398"
                                />
                            </div>
                        </div>

                        {/* Sport Types */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sport Types * (select at least one)
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

                        {/* Features */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Court Features
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
                                    <span className="text-sm">Indoor Court</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="features.lighting"
                                        checked={formData.features.lighting}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Lighting</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="features.changingRooms"
                                        checked={formData.features.changingRooms}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Changing Rooms</span>
                                </label>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Surface Type
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

                        {/* Working Hours */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Working Hours
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(formData.workingHours).map(([day, hours]) => (
                                    <div key={day} className="flex items-center space-x-2">
                                        <span className="text-sm font-medium w-24">
                                            {day.charAt(0).toUpperCase() + day.slice(1)}
                                        </span>
                                        <input
                                            type="time"
                                            value={hours.open}
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    workingHours: {
                                                        ...prev.workingHours,
                                                        [day]: {
                                                            ...prev.workingHours[day],
                                                            open: e.target.value
                                                        }
                                                    }
                                                }));
                                            }}
                                            className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">to</span>
                                        <input
                                            type="time"
                                            value={hours.close}
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    workingHours: {
                                                        ...prev.workingHours,
                                                        [day]: {
                                                            ...prev.workingHours[day],
                                                            close: e.target.value
                                                        }
                                                    }
                                                }));
                                            }}
                                            className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                ))}
                            </div>
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
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Add any additional information about the court..."
                            />
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Court'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCourtForm;