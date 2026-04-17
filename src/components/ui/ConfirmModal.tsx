"use client";
import React from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-3000 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm glass-card p-6 rounded-2xl animate-slide-in-up border border-white/10 shadow-2xl">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className={`p-3 rounded-full ${
                        variant === 'danger' ? 'bg-danger-light text-danger' : 
                        variant === 'warning' ? 'bg-warning-light text-warning' : 
                        'bg-accent-light text-accent'
                    }`}>
                        <AlertTriangle size={28} />
                    </div>
                    
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-text">{title}</h3>
                        <p className="text-sm text-text-muted leading-relaxed">{message}</p>
                    </div>

                    <div className="flex gap-3 w-full mt-4">
                        <Button 
                            variant="ghost" 
                            onClick={onCancel} 
                            className="flex-1"
                        >
                            {cancelText}
                        </Button>
                        <Button 
                            variant={variant === 'danger' ? 'danger' : 'primary'} 
                            onClick={onConfirm} 
                            className="flex-1"
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
