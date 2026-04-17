"use client";
import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
    message, 
    type = 'info', 
    duration = 3000, 
    onClose 
}) => {
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(onClose, 300); // Wait for animation
    };

    const icons = {
        success: <CheckCircle2 className="text-success" size={18} />,
        error: <XCircle className="text-danger" size={18} />,
        warning: <AlertCircle className="text-warning" size={18} />,
        info: <Info className="text-accent" size={18} />,
    };

    const borderColors = {
        success: 'rgba(34, 197, 94, 0.2)',
        error: 'rgba(239, 68, 68, 0.2)',
        warning: 'rgba(245, 158, 11, 0.2)',
        info: 'rgba(124, 58, 237, 0.2)',
    };

    return (
        <div 
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-2000 flex items-center gap-3 px-4 py-3 rounded-xl glass-card animate-slide-in-up ${isLeaving ? 'opacity-0 translate-y-2' : 'opacity-100'} transition-all`}
            style={{ 
                minWidth: '280px',
                border: `1px solid ${borderColors[type]}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}
        >
            {icons[type]}
            <p className="text-sm font-medium text-text flex-1">{message}</p>
            <button 
                onClick={handleClose}
                className="p-1 hover:bg-surface-2 rounded-lg text-text-muted hover:text-text transition-colors"
            >
                <X size={14} />
            </button>
        </div>
    );
};
