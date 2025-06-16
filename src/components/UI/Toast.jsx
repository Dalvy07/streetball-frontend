// src/components/UI/Toast.jsx
import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose && onClose(), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getToastStyles = () => {
        const baseStyles = "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform";

        if (!isVisible) {
            return `${baseStyles} translate-x-full opacity-0`;
        }

        switch (type) {
            case 'success':
                return `${baseStyles} bg-green-500 text-white`;
            case 'error':
                return `${baseStyles} bg-red-500 text-white`;
            case 'warning':
                return `${baseStyles} bg-yellow-500 text-white`;
            default:
                return `${baseStyles} bg-blue-500 text-white`;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            default:
                return 'ℹ️';
        }
    };

    return (
        <div className={getToastStyles()}>
            <div className="flex items-center space-x-3">
                <span className="text-lg">{getIcon()}</span>
                <p className="text-sm font-medium">{message}</p>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(() => onClose && onClose(), 300);
                    }}
                    className="ml-2 text-white hover:text-gray-200"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

// Hook for managing notifications
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        const toast = { id, message, type, duration };

        setToasts(prev => [...prev, toast]);

        return id;
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const success = (message, duration) => addToast(message, 'success', duration);
    const error = (message, duration) => addToast(message, 'error', duration);
    const warning = (message, duration) => addToast(message, 'warning', duration);
    const info = (message, duration) => addToast(message, 'info', duration);

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info
    };
};

// Container for displaying notifications
export const ToastContainer = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
};

export default Toast;