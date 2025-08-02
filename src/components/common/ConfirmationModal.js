import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children, handleInteractiveClick }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="rounded-2xl shadow-glass w-full max-w-sm bg-surface-container-high flex flex-col glass-effect border-glass" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-on-surface font-display mb-2">{title}</h2>
                    <div className="text-on-surface-variant">{children}</div>
                </div>
                <div className="p-4 bg-surface-container/50 flex justify-end gap-3 rounded-b-2xl">
                    <button onClick={handleInteractiveClick(onClose)} className="px-4 py-2 font-bold rounded-full text-on-background hover:bg-surface-container-highest transition-colors">Cancel</button>
                    <button onClick={handleInteractiveClick(onConfirm)} className="px-4 py-2 font-bold rounded-full bg-primary text-on-primary shadow-md hover:opacity-90 transition-opacity active:scale-95">Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;