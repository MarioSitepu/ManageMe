import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
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
    const variantClass = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        danger: 'btn-danger',
        success: 'btn-success',
    }[variant];

    const sizeClass = {
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg',
    }[size];

    return (
        <button
            className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
            style={style}
            {...props}
        >
            {children}
        </button>
    );
};
