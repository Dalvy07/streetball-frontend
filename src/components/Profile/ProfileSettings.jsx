// src/components/Profile/ProfileSettings.jsx
import React, { useState } from 'react';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';

const ProfileSettings = ({ profile, onProfileUpdate }) => {
    const [activeSection, setActiveSection] = useState('personal');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Personal data
    const [personalData, setPersonalData] = useState({
        username: profile?.username || '',
        fullName: profile?.fullName || '',
        phone: profile?.phone || ''
    });

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState({
        email: profile?.notifications?.email ?? true,
        push: profile?.notifications?.push ?? true,
        reminderTime: profile?.notifications?.reminderTime || 60
    });

    // Password change
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePersonalDataSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await userService.updateProfile(personalData);
            onProfileUpdate(response.data.user);
            setSuccess('Profile successfully updated');
        } catch (error) {
            setError(error.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationSettingsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await userService.updateNotificationSettings(notificationSettings);
            setSuccess('Notification settings updated');
        } catch (error) {
            setError(error.response?.data?.message || 'Error updating settings');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Check password match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        // Check password length
        if (passwordData.newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            await userService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setSuccess('Password successfully changed');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setError(error.response?.data?.message || 'Error changing password');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        if (!window.confirm('All your data will be permanently removed. Confirm deletion.')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await userService.deleteProfile();
            await authService.logout();
            window.location.href = '/';
        } catch (error) {
            setError(error.response?.data?.message || 'Error deleting account');
            setLoading(false);
        }
    };

    const sections = [
        { id: 'personal', name: 'Personal Information', icon: '👤' },
        { id: 'notifications', name: 'Notifications', icon: '🔔' },
        { id: 'password', name: 'Security', icon: '🔒' },
        { id: 'danger', name: 'Danger Zone', icon: '⚠️' }
    ];

    return (
        <div className="space-y-6">
            {/* Section navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeSection === section.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <span className="mr-2">{section.icon}</span>
                            {section.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Messages */}
            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded">
                    {success}
                </div>
            )}

            {/* Personal data */}
            {activeSection === 'personal' && (
                <form onSubmit={handlePersonalDataSubmit} className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={personalData.username}
                                    onChange={(e) => setPersonalData(prev => ({
                                        ...prev,
                                        username: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={personalData.fullName}
                                    onChange={(e) => setPersonalData(prev => ({
                                        ...prev,
                                        fullName: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={personalData.phone}
                                    onChange={(e) => setPersonalData(prev => ({
                                        ...prev,
                                        phone: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}

            {/* Notification settings */}
            {activeSection === 'notifications' && (
                <form onSubmit={handleNotificationSettingsSubmit} className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Notification Settings
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">
                                        Email Notifications
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        Receive game notifications via email
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notificationSettings.email}
                                        onChange={(e) => setNotificationSettings(prev => ({
                                            ...prev,
                                            email: e.target.checked
                                        }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">
                                        Push Notifications
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        Receive notifications in the browser
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notificationSettings.push}
                                        onChange={(e) => setNotificationSettings(prev => ({
                                            ...prev,
                                            push: e.target.checked
                                        }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                    Reminder Time
                                </h4>
                                <p className="text-sm text-gray-500 mb-2">
                                    How long before the game to send a reminder
                                </p>
                                <select
                                    value={notificationSettings.reminderTime}
                                    onChange={(e) => setNotificationSettings(prev => ({
                                        ...prev,
                                        reminderTime: parseInt(e.target.value)
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="30">30 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="120">2 hours</option>
                                    <option value="240">4 hours</option>
                                    <option value="1440">1 day</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}

            {/* Password change */}
            {activeSection === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Change Password
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({
                                        ...prev,
                                        currentPassword: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({
                                        ...prev,
                                        newPassword: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({
                                        ...prev,
                                        confirmPassword: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            )}

            {/* Danger zone */}
            {activeSection === 'danger' && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Danger Zone
                        </h3>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <h4 className="text-lg font-medium text-red-800 mb-2">
                                Delete Account
                            </h4>
                            <p className="text-red-700 mb-4">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {loading ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileSettings;