// src/components/Profile/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import EmailVerification from '../Auth/EmailVerification';
import ProfileSettings from './ProfileSettings';
import MyGames from './MyGames';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await userService.getMyProfile();
            setProfile(response.data);
        } catch (error) {
            setError('Error loading profile');
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = (updatedProfile) => {
        setProfile(updatedProfile);
        // Update data in localStorage
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            const newUserData = { ...currentUser, ...updatedProfile };
            localStorage.setItem('user', JSON.stringify(newUserData));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', name: 'Profile', icon: '👤' },
        { id: 'games', name: 'My Games', icon: '🏀' },
        { id: 'settings', name: 'Settings', icon: '⚙️' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <EmailVerification />

                    <div className="bg-white shadow rounded-lg">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                                    {profile?.avatar ? (
                                        <img
                                            src={profile.avatar}
                                            alt={profile.username}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-medium text-gray-700">
                                            {profile?.username?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {profile?.fullName || profile?.username}
                                    </h1>
                                    <p className="text-gray-600">{profile?.email}</p>
                                    <div className="flex items-center space-x-4 mt-1">
                                        <span className={`text-xs px-2 py-1 rounded-full ${profile?.isEmailVerified
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {profile?.isEmailVerified ? 'Email verified' : 'Email not verified'}
                                        </span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 capitalize">
                                            {profile?.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === tab.id
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

                        {/* Content */}
                        <div className="p-6">
                            {activeTab === 'profile' && (
                                <ProfileInfo profile={profile} />
                            )}
                            {activeTab === 'games' && (
                                <MyGames userId={profile?._id} />
                            )}
                            {activeTab === 'settings' && (
                                <ProfileSettings
                                    profile={profile}
                                    onProfileUpdate={handleProfileUpdate}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Profile Information Component
const ProfileInfo = ({ profile }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <p className="mt-1 text-sm text-gray-900">{profile?.username}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <p className="mt-1 text-sm text-gray-900">{profile?.email}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                            {profile?.fullName || 'Not specified'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Phone
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                            {profile?.phone || 'Not specified'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Date of Registration
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                            {formatDate(profile?.createdAt)}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Last Login
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                            {profile?.lastLogin ? formatDate(profile.lastLogin) : 'Not specified'}
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {profile?.createdGames?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Created Games</div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {profile?.joinedGames?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Participations in Games</div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                            {(profile?.createdGames?.length || 0) + (profile?.joinedGames?.length || 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Games</div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                <div className="space-y-3">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-700 mr-3">Email Notifications:</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${profile?.notifications?.email
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {profile?.notifications?.email ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>

                    <div className="flex items-center">
                        <span className="text-sm text-gray-700 mr-3">Push Notifications:</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${profile?.notifications?.push
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {profile?.notifications?.push ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>

                    <div className="flex items-center">
                        <span className="text-sm text-gray-700 mr-3">Reminders:</span>
                        <span className="text-sm text-gray-900">
                            {profile?.notifications?.reminderTime || 60} minutes before the game
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;