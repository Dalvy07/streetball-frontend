// src/components/Layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

const Header = () => {
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, [location]); // Update on route change

    const handleLogout = async () => {
        try {
            await authService.logout();
            setUser(null);
            setIsMenuOpen(false);
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Don't show header on authentication pages
    if (location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    return (
        <header className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">StreetBall</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {user && (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`text-gray-700 hover:text-blue-600 font-medium ${location.pathname === '/dashboard' ? 'text-blue-600' : ''
                                        }`}
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/games"
                                    className={`text-gray-700 hover:text-blue-600 font-medium ${location.pathname === '/games' ? 'text-blue-600' : ''
                                        }`}
                                >
                                    Games
                                </Link>
                                <Link
                                    to="/courts"
                                    className={`text-gray-700 hover:text-blue-600 font-medium ${location.pathname === '/courts' ? 'text-blue-600' : ''
                                        }`}
                                >
                                    Courts
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"
                                >
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-700">
                                            {user.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="hidden md:block font-medium">{user.username}</span>
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                    <>
                                        {/* Overlay */}
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsMenuOpen(false)}
                                        ></div>

                                        {/* Menu */}
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                            <div className="px-4 py-2 border-b border-gray-200">
                                                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                                {!user.isEmailVerified && (
                                                    <p className="text-xs text-red-500 mt-1">Email not verified</p>
                                                )}
                                            </div>

                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                📝 Profile
                                            </Link>

                                            {user.role === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    👑 Admin Panel
                                                </Link>
                                            )}

                                            <hr className="my-1" />

                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                🚪 Sign out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-blue-600 font-medium"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 hover:text-blue-600 focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 py-4">
                        {user ? (
                            <div className="space-y-2">
                                <Link
                                    to="/dashboard"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/games"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Games
                                </Link>
                                <Link
                                    to="/courts"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Courts
                                </Link>
                                <hr className="my-2" />
                                <Link
                                    to="/profile"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    📝 Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                >
                                    🚪 Sign out
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Link
                                    to="/login"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/register"
                                    className="block px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;