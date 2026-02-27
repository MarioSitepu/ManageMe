import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    style?: React.CSSProperties;
    id?: string;
    accent?: 'purple' | 'blue' | 'green' | 'red' | 'orange';
    action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    title,
    subtitle,
    style,
    id,
    accent,
    action,
}) => {
    const accentColors: Record<string, string> = {
        purple: 'var(--accent)',
        blue: 'var(--accent-secondary)',
        green: 'var(--success)',
        red: 'var(--danger)',
        orange: 'var(--warning)',
    };

    return (
        <div
            className={`glass-panel ${className}`}
            id={id}
            style={{
                padding: '20px',
                borderLeft: accent ? `3px solid ${accentColors[accent]}` : undefined,
                ...style,
            }}
        >
            {(title || action) && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: subtitle ? '4px' : '16px',
                    gap: '12px',
                }}>
                    {title && (
                        <h3 style={{
                            fontSize: '0.9375rem',
                            fontWeight: 600,
                            color: 'var(--text)',
                            letterSpacing: '-0.01em',
                        }}>
                            {title}
                        </h3>
                    )}
                    {action && (
                        <div style={{ flexShrink: 0 }}>{action}</div>
                    )}
                </div>
            )}
            {subtitle && (
                <p style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-muted)',
                    marginBottom: '16px',
                }}>
                    {subtitle}
                </p>
            )}
            {children}
        </div>
    );
};
