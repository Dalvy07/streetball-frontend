// src/components/Courts/CourtCard.jsx
import React, { useState } from 'react';
import { courtService } from '../../services/courtService';
import { authService } from '../../services/authService';

const CourtCard = ({ court, onCourtUpdate }) => {
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewData, setReviewData] = useState({ text: '', rating: 5 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const user = authService.getCurrentUser();

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

    const getFeatureIcon = (feature, value) => {
        const featureIcons = {
            covered: value ? '🏠' : '☀️',
            lighting: value ? '💡' : '🌙',
            changingRooms: value ? '🚿' : '👕'
        };
        return featureIcons[feature] || '';
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="text-yellow-400">★</span>);
        }

        if (hasHalfStar) {
            stars.push(<span key="half" className="text-yellow-400">☆</span>);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
        }

        return stars;
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await courtService.addReview(court._id, reviewData);
            onCourtUpdate && onCourtUpdate(result.data);
            setShowReviewForm(false);
            setReviewData({ text: '', rating: 5 });
        } catch (error) {
            setError(error.response?.data?.message || 'Error adding review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Images */}
            {court.photos && court.photos.length > 0 ? (
                <div className="h-48 bg-gray-200 relative">
                    <img
                        src={court.photos[0]}
                        alt={court.name}
                        className="w-full h-full object-cover"
                    />
                    {court.photos.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            +{court.photos.length - 1} photos
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-6xl">🏟️</span>
                </div>
            )}

            <div className="p-6">
                {/* Title and Rating */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {court.name}
                        </h3>
                        <p className="text-sm text-gray-600">{court.location.address}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center">
                            {renderStars(court.rating)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {court.reviews?.length || 0} reviews
                        </p>
                    </div>
                </div>

                {/* Sport Types */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {court.sportTypes.map(sport => (
                        <span
                            key={sport}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                            <span className="mr-1">{getSportIcon(sport)}</span>
                            {sport === 'basketball' ? 'Basketball' :
                                sport === 'football' ? 'Football' :
                                    sport === 'tennis' ? 'Tennis' :
                                        sport === 'volleyball' ? 'Volleyball' :
                                            sport === 'badminton' ? 'Badminton' :
                                                sport === 'table_tennis' ? 'Table Tennis' :
                                                    sport === 'hockey' ? 'Hockey' :
                                                        sport === 'futsal' ? 'Futsal' :
                                                            sport === 'handball' ? 'Handball' :
                                                                'Other'}
                        </span>
                    ))}
                </div>

                {/* Features */}
                {court.features && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center">
                            <span className="text-lg block">{getFeatureIcon('covered', court.features.covered)}</span>
                            <span className="text-xs text-gray-600">
                                {court.features.covered ? 'Indoor' : 'Outdoor'}
                            </span>
                        </div>
                        <div className="text-center">
                            <span className="text-lg block">{getFeatureIcon('lighting', court.features.lighting)}</span>
                            <span className="text-xs text-gray-600">
                                {court.features.lighting ? 'Lighting' : 'No Lighting'}
                            </span>
                        </div>
                        <div className="text-center">
                            <span className="text-lg block">{getFeatureIcon('changingRooms', court.features.changingRooms)}</span>
                            <span className="text-xs text-gray-600">
                                {court.features.changingRooms ? 'Changing Rooms' : 'No Changing Rooms'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Description */}
                {court.description && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {court.description}
                    </p>
                )}

                {/* Surface */}
                {court.features?.surface && (
                    <p className="text-sm text-gray-600 mb-4">
                        <span className="font-medium">Surface:</span> {
                            court.features.surface === 'asphalt' ? 'Asphalt' :
                                court.features.surface === 'concrete' ? 'Concrete' :
                                    court.features.surface === 'rubber' ? 'Rubber' :
                                        court.features.surface === 'grass' ? 'Grass' :
                                            court.features.surface === 'artificial_grass' ? 'Artificial Grass' :
                                                court.features.surface === 'parquet' ? 'Parquet' :
                                                    court.features.surface === 'clay' ? 'Clay' :
                                                        court.features.surface === 'sand' ? 'Sand' :
                                                            'Other'
                        }
                    </p>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm font-medium">
                        Details
                    </button>

                    {user?.isEmailVerified && !showReviewForm && (
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                            Review
                        </button>
                    )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Add Review</h4>

                        {error && (
                            <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded text-sm mb-3">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleAddReview}>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rating
                                </label>
                                <select
                                    value={reviewData.rating}
                                    onChange={(e) => setReviewData(prev => ({
                                        ...prev,
                                        rating: parseInt(e.target.value)
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    {[5, 4, 3, 2, 1].map(rating => (
                                        <option key={rating} value={rating}>
                                            {rating} {rating === 1 ? 'star' : 'stars'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Comment
                                </label>
                                <textarea
                                    value={reviewData.text}
                                    onChange={(e) => setReviewData(prev => ({
                                        ...prev,
                                        text: e.target.value
                                    }))}
                                    rows="3"
                                    maxLength="500"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Share your experience..."
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourtCard;