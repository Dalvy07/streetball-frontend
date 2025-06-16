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
            setError(error.response?.data?.message || 'Ошибка при добавлении отзыва');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Изображения */}
            {court.photos && court.photos.length > 0 ? (
                <div className="h-48 bg-gray-200 relative">
                    <img
                        src={court.photos[0]}
                        alt={court.name}
                        className="w-full h-full object-cover"
                    />
                    {court.photos.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            +{court.photos.length - 1} фото
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-6xl">🏟️</span>
                </div>
            )}

            <div className="p-6">
                {/* Заголовок и рейтинг */}
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
                            {court.reviews?.length || 0} отзывов
                        </p>
                    </div>
                </div>

                {/* Виды спорта */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {court.sportTypes.map(sport => (
                        <span
                            key={sport}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                            <span className="mr-1">{getSportIcon(sport)}</span>
                            {sport === 'basketball' ? 'Баскетбол' :
                                sport === 'football' ? 'Футбол' :
                                    sport === 'tennis' ? 'Теннис' :
                                        sport === 'volleyball' ? 'Волейбол' :
                                            sport === 'badminton' ? 'Бадминтон' :
                                                sport === 'table_tennis' ? 'Настольный теннис' :
                                                    sport === 'hockey' ? 'Хоккей' :
                                                        sport === 'futsal' ? 'Футзал' :
                                                            sport === 'handball' ? 'Гандбол' :
                                                                'Другое'}
                        </span>
                    ))}
                </div>

                {/* Особенности */}
                {court.features && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center">
                            <span className="text-lg block">{getFeatureIcon('covered', court.features.covered)}</span>
                            <span className="text-xs text-gray-600">
                                {court.features.covered ? 'Крытая' : 'Открытая'}
                            </span>
                        </div>
                        <div className="text-center">
                            <span className="text-lg block">{getFeatureIcon('lighting', court.features.lighting)}</span>
                            <span className="text-xs text-gray-600">
                                {court.features.lighting ? 'Освещение' : 'Без освещения'}
                            </span>
                        </div>
                        <div className="text-center">
                            <span className="text-lg block">{getFeatureIcon('changingRooms', court.features.changingRooms)}</span>
                            <span className="text-xs text-gray-600">
                                {court.features.changingRooms ? 'Раздевалки' : 'Без раздевалок'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Описание */}
                {court.description && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {court.description}
                    </p>
                )}

                {/* Покрытие */}
                {court.features?.surface && (
                    <p className="text-sm text-gray-600 mb-4">
                        <span className="font-medium">Покрытие:</span> {
                            court.features.surface === 'asphalt' ? 'Асфальт' :
                                court.features.surface === 'concrete' ? 'Бетон' :
                                    court.features.surface === 'rubber' ? 'Резина' :
                                        court.features.surface === 'grass' ? 'Трава' :
                                            court.features.surface === 'artificial_grass' ? 'Искусственная трава' :
                                                court.features.surface === 'parquet' ? 'Паркет' :
                                                    court.features.surface === 'clay' ? 'Грунт' :
                                                        court.features.surface === 'sand' ? 'Песок' :
                                                            'Другое'
                        }
                    </p>
                )}

                {/* Действия */}
                <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm font-medium">
                        Подробнее
                    </button>

                    {user?.isEmailVerified && !showReviewForm && (
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                            Отзыв
                        </button>
                    )}
                </div>

                {/* Форма добавления отзыва */}
                {showReviewForm && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Добавить отзыв</h4>

                        {error && (
                            <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded text-sm mb-3">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleAddReview}>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Оценка
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
                                            {rating} {rating === 1 ? 'звезда' : rating < 5 ? 'звезды' : 'звезд'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Комментарий
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
                                    placeholder="Расскажите о своих впечатлениях..."
                                />
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowReviewForm(false);
                                        setError('');
                                        setReviewData({ text: '', rating: 5 });
                                    }}
                                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Отправка...' : 'Отправить'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Последние отзывы */}
                {court.reviews && court.reviews.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Отзывы</h4>
                        <div className="space-y-2">
                            {court.reviews.slice(-2).map((review, index) => (
                                <div key={index} className="text-sm">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className="flex">
                                            {renderStars(review.rating)}
                                        </div>
                                        <span className="text-gray-600 text-xs">
                                            {review.user?.username || 'Аноним'}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-xs">{review.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourtCard;