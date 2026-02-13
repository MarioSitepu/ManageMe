import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    style,
    ...props
}) => {
    // Base styles are in globals.css under .btn

    const getVariantStyle = () => {
        switch (variant) {
            case 'primary': return 'btn-primary';
            case 'secondary': return 'btn-secondary'; // Need to define in globals if used
            case 'danger': return 'btn-danger'; // Need to define in globals if used
            default: return 'btn-primary';
        }
    };

    return (
        <button
            className={`btn ${getVariantStyle()} ${className}`}
            style={{
                fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem',
                padding: size === 'sm' ? '0.5rem 1rem' : size === 'lg' ? '1rem 2rem' : '0.75rem 1.5rem',
                ...style
            }}
            {...props}
        >
            {children}
        </button>
    );
};
