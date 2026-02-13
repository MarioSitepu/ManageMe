"use client";
import React from 'react';
import { EventType } from '@/lib/store';
import { EVENT_TYPES, getEventColor, getEventIcon } from '@/lib/eventHelpers';

interface EventTypeSelectorProps {
    value: EventType;
    onChange: (type: EventType) => void;
}

export const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({ value, onChange }) => {
    const types: EventType[] = ['class', 'assignment', 'meeting', 'personal', 'exam', 'study'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Event Type
            </label>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px'
            }}>
                {types.map((type) => {
                    const config = EVENT_TYPES[type];
                    const isSelected = value === type;

                    return (
                        <button
                            key={type}
                            type="button"
                            onClick={() => onChange(type)}
                            style={{
                                padding: '12px 8px',
                                borderRadius: '8px',
                                border: `2px solid ${isSelected ? config.color : 'rgba(255,255,255,0.1)'}`,
                                background: isSelected
                                    ? `${config.color}33`
                                    : 'rgba(255,255,255,0.03)',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.85rem',
                                fontWeight: isSelected ? 600 : 400,
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{config.icon}</span>
                            <span>{config.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
