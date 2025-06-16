// src/components/Courts/CourtsList.jsx
import React, { useState, useEffect } from 'react';
import { courtService } from '../../services/courtService';
import CourtCard from './CourtCard';
import CreateCourtForm from './CreateCourtForm';
import { authService } from '../../services/authService';

const CourtsList = () => {
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [filters, setFilters] = useState({
        sportType: '',
        page: 1,
        limit: 12
    });
    const [pagination, setPagination] = useState({});

    const user = authService.getCurrentUser();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        loadCourts();
    }, [filters]);

    const loadCourts = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await courtService.getAllCourts(filters);
            setCourts(response.data);
            setPagination({
                current_page: response.current_page,
                total_pages: response.total_pages,
                total: response.total,
                has_next: response.has_next,
                has_prev: response.has_prev
            });
        } catch (error) {
            setError('Error loading courts');
            console.error('Error loading courts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value,
            page: 1
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const handleCourtUpdate = (updatedCourt) => {
        setCourts(prev => prev.map(court =>
            court._id === updatedCourt._id ? updatedCourt : court
        ));
    };

    const handleCourtCreated = (newCourt) => {
        setCourts(prev => [newCourt, ...prev]);
        setShowCreateForm(false);
    };

    const sportTypes = [
        { value: '', label: 'All Sports' },
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Courts</h1>
                    <p className="text-gray-600 mt-2">Find sports courts in your city</p>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Add Court
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sport Type
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

                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ sportType: '', page: 1, limit: 12 })}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Courts List */}
            {!loading && (
                <>
                    {courts.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-6xl mb-4 block">🏟️</span>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No Courts Found
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Try adjusting your search filters
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {courts.map(court => (
                                <CourtCard
                                    key={court._id}
                                    court={court}
                                    onCourtUpdate={handleCourtUpdate}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.total_pages > 1 && (
                        <div className="flex justify-center items-center space-x-4 mt-8">
                            <button
                                onClick={() => handlePageChange(filters.page - 1)}
                                disabled={!pagination.has_prev}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            <span className="text-gray-600">
                                Page {pagination.current_page} of {pagination.total_pages}
                            </span>

                            <button
                                onClick={() => handlePageChange(filters.page + 1)}
                                disabled={!pagination.has_next}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Create Court Modal */}
            {showCreateForm && (
                <CreateCourtForm
                    onCourtCreated={handleCourtCreated}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}
        </div>
    );
};

export default CourtsList;