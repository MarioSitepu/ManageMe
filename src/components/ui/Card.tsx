import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    style?: React.CSSProperties;
    id?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, style, id }) => {
    return (
        <div className={`glass-panel ${className}`} style={{ padding: '24px', ...style }} id={id}>
            {title && <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: 600 }}>{title}</h3>}
            {children}
        </div>
    );
};
