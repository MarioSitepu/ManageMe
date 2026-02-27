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
        const weekdayName = date.toLocaleDateString('en-US', { weekday: 'long' }); // e.g. "Monday"
        const dateISO = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; // "YYYY-MM-DD"

        return events.filter(e => {
            // Match recurring events by weekday name
            if (e.isRecurring && e.day === weekdayName) return true;
            // Match specific-date events by date string
            if (e.date) {
                const evDate = e.date.substring(0, 10); // take YYYY-MM-DD part
                return evDate === dateISO;
            }
            // Fallback: match by day name for legacy events without isRecurring flag
            return !e.date && e.day === weekdayName;
        });
    };


    return (
        <div style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '12px' }}>
                {weekDays.map(day => (
                    <div key={day} style={{ textAlign: 'center', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', padding: '4px' }}>
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
                                minHeight: '90px',
                                background: isToday ? 'var(--accent-light)' : 'var(--surface-2)',
                                border: `1px solid ${isToday ? 'var(--accent)' : 'var(--border)'}`,
                                borderRadius: 'var(--radius-sm)',
                                padding: '4px 6px',
                                cursor: date ? 'pointer' : 'default',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden', // Prevent breaking layout
                                minWidth: 0 // Prevent flex children from overflowing
                            }}
                        >
                            {date && (
                                <>
                                    <div style={{
                                        textAlign: 'right',
                                        fontSize: '0.8125rem',
                                        color: isToday ? 'var(--accent)' : 'var(--text)',
                                        fontWeight: isToday ? 700 : 500,
                                        marginBottom: '4px',
                                    }}>
                                        {date.getDate()}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1, minWidth: 0 }}>
                                        {dayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                                                style={{
                                                    fontSize: '0.65rem',
                                                    fontWeight: 500,
                                                    padding: '2px 4px',
                                                    borderRadius: '4px',
                                                    background: `${getEventColor(event.type)}25`,
                                                    color: 'var(--text)',
                                                    borderLeft: `2px solid ${getEventColor(event.type)}`,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    cursor: 'pointer',
                                                    width: '100%',
                                                    minWidth: 0,
                                                    boxSizing: 'border-box'
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
