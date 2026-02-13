"use client";
import React from 'react';
import { CalendarEvent } from '@/lib/store';
import { getEventColor, getEventIcon } from '@/lib/eventHelpers';

interface MonthlyCalendarProps {
    currentDate: Date;
    events: CalendarEvent[];
    onDateClick: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
}

export function MonthlyCalendar({ currentDate, events, onDateClick, onEventClick }: MonthlyCalendarProps) {
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        // Adjust for Monday start (0=Sunday, 1=Monday, etc.)
        // We want Monday to be 0, Sunday to be 6
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    // Create array of days to render
    const days = [];
    // Add empty slots for days before the 1st
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getEventsForDate = (date: Date) => {
        if (!date) return [];
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'long' });
        // Filter by specific date matches (future implementation) or recurring day matches
        // For now, matching by "Day" string as per current store structure
        return events.filter(e => e.day === dateStr);
    };

    return (
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
                {weekDays.map(day => (
                    <div key={day} style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', padding: '8px' }}>
                        {day}
                    </div>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                {days.map((date, idx) => {
                    const dayEvents = date ? getEventsForDate(date) : [];
                    const isToday = date && date.toDateString() === new Date().toDateString();

                    return (
                        <div
                            key={idx}
                            onClick={() => date && onDateClick(date)}
                            style={{
                                minHeight: '100px',
                                background: isToday ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.03)',
                                border: isToday ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                padding: '8px',
                                cursor: date ? 'pointer' : 'default',
                                position: 'relative'
                            }}
                        >
                            {date && (
                                <>
                                    <div style={{
                                        textAlign: 'right',
                                        marginBottom: '4px',
                                        fontSize: '0.9rem',
                                        color: isToday ? 'var(--accent-primary)' : 'var(--text-primary)',
                                        fontWeight: isToday ? 'bold' : 'normal'
                                    }}>
                                        {date.getDate()}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {dayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEventClick(event);
                                                }}
                                                style={{
                                                    fontSize: '0.7rem',
                                                    padding: '2px 4px',
                                                    borderRadius: '4px',
                                                    background: `${getEventColor(event.type)}30`,
                                                    color: 'white', // getEventColor(event.type),
                                                    borderLeft: `2px solid ${getEventColor(event.type)}`,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                                title={event.title}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
