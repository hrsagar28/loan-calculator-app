import React from 'react';

const Snackbar = ({ message, type, onDismiss }) => {
    if (!message) return null;

    // Determine colors based on the notification type
    const bgColor = type === 'error' ? 'bg-error-container' : 'bg-inverse-surface';
    const textColor = type === 'error' ? 'text-on-error-container' : 'text-inverse-on-surface';
    const buttonColorClass = type === 'error' ? 'text-on-error-container' : 'text-inverse-on-surface';

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 p-4 rounded-2xl shadow-lg flex items-center justify-between min-w-[320px] animate-snackbar-in ${bgColor} ${textColor}`}>
            <p className="font-medium">{message}</p>
            <button
                onClick={onDismiss}
                className={`ml-4 font-bold uppercase text-sm tracking-wider ${buttonColorClass} opacity-80 hover:opacity-100 transition-opacity`}
            >
                Dismiss
            </button>
        </div>
    );
};

export default Snackbar;
