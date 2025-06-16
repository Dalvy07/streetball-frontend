// src/components/Auth/EmailVerification.jsx - updated version
import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';

const EmailVerification = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Update user data when component mounts
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    const handleResendVerification = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await authService.resendVerification();
            setMessage('Verification email sent! Please check your inbox.');
        } catch (error) {
            setError(error.response?.data?.message || 'Error sending verification email');
        } finally {
            setLoading(false);
        }
    };

    // Check current user every 5 seconds in case email was verified
    useEffect(() => {
        const interval = setInterval(() => {
            const currentUser = authService.getCurrentUser();
            if (currentUser && currentUser.isEmailVerified !== user?.isEmailVerified) {
                setUser(currentUser);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [user]);

    if (!user) {
        return null;
    }

    if (user.isEmailVerified) {
        return (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <span className="text-green-600">✅</span>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                            Email verified
                        </h3>
                        <p className="text-sm text-green-700">
                            Your account is fully activated. You now have access to all features!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <span className="text-yellow-600">⚠️</span>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-yellow-800">
                        Verify your email
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                        <p>
                            We've sent a verification email to <strong>{user.email}</strong>.
                            Please check your email and click the link to activate your account.
                        </p>
                        <p className="mt-1 text-xs">
                            After verification, you will be automatically redirected here with an updated status.
                        </p>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={handleResendVerification}
                            disabled={loading}
                            className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Sending...' : 'Resend'}
                        </button>
                    </div>
                    {message && (
                        <div className="mt-2 text-sm text-green-700 bg-green-100 p-2 rounded">
                            ✅ {message}
                        </div>
                    )}
                    {error && (
                        <div className="mt-2 text-sm text-red-700 bg-red-100 p-2 rounded">
                            ❌ {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;