import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ProfilePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('profile');

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        const newSearchParams = new URLSearchParams(searchParams);
        if (tab === 'profile') {
            newSearchParams.delete('tab');
        } else {
            newSearchParams.set('tab', tab);
        }
        setSearchParams(newSearchParams);
    };

    const tabs = [
        { id: 'profile', name: 'Profile', icon: '👤' },
        { id: 'games', name: 'My Games', icon: '🏀' },
        { id: 'settings', name: 'Settings', icon: '⚙️' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow rounded-lg">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                                    {/* Avatar placeholder */}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Profile Name
                                    </h1>
                                    <p className="text-gray-600">user@email.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`py-4 px-6 border-b-2 font-medium text-sm ${
                                            activeTab === tab.id
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
                                <div>
                                    {/* Profile content goes here */}
                                </div>
                            )}
                            {activeTab === 'games' && (
                                <div>
                                    {/* Games content goes here */}
                                </div>
                            )}
                            {activeTab === 'settings' && (
                                <div>
                                    {/* Settings content goes here */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;