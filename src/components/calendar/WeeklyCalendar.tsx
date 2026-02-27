"use client";
import React from 'react';
import { CalendarEvent } from '@/lib/store';
import { getEventColor, getEventIcon } from '@/lib/eventHelpers';

interface WeeklyCalendarProps {
    currentDate: Date;
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
}

export function WeeklyCalendar({ currentDate, events, onEventClick }: WeeklyCalendarProps) {
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

    // Get the actual date for each weekday column based on currentDate
    const getDateForDay = (day: string) => {
        const dayIndex = weekDays.indexOf(day); // 0=Mon, 6=Sun
        const curr = new Date(currentDate);
        // Find Monday of this week
        const currDay = curr.getDay(); // 0=Sun, 1=Mon,...
        const diffToMonday = currDay === 0 ? -6 : 1 - currDay;
        const monday = new Date(curr);
        monday.setDate(curr.getDate() + diffToMonday);
        const targetDate = new Date(monday);
        targetDate.setDate(monday.getDate() + dayIndex);
        return targetDate;
    };

    const getEventsForDayAndTime = (day: string, hour: number) => {
        const columnDate = getDateForDay(day);
        const dateISO = `${columnDate.getFullYear()}-${String(columnDate.getMonth() + 1).padStart(2, '0')}-${String(columnDate.getDate()).padStart(2, '0')}`;

        return events.filter(e => {
            const eventStartHour = parseInt(e.startTime.split(':')[0]);
            const eventEndHour = e.endTime ? parseInt(e.endTime.split(':')[0]) : eventStartHour + 1;
            if (hour < eventStartHour || hour >= eventEndHour) return false;

            // Match recurring events by weekday name
            if (e.isRecurring && e.day === day) return true;
            // Match specific-date events by date
            if (e.date) return e.date.substring(0, 10) === dateISO;
            // Fallback for legacy events
            return e.day === day;
        });
    };


    return (
        <div style={{ width: '100%', overflowX: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, minmax(120px, 1fr))', gap: '1px', background: 'var(--border)' }}>
                {/* Header Row */}
                <div style={{ padding: '10px', background: 'var(--surface)', position: 'sticky', left: 0, zIndex: 10 }}></div>
                {weekDays.map(day => (
                    <div
                        key={day}
                        style={{
                            padding: '10px',
                            textAlign: 'center',
                            background: 'var(--surface)',
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            color: 'var(--text-muted)',
                        }}
                    >
                        {day}
                    </div>
                ))}

                {/* Time Slots */}
                {timeSlots.map(hour => (
                    <React.Fragment key={hour}>
                        <div style={{
                            padding: '10px',
                            textAlign: 'right',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            background: 'var(--surface)',
                            position: 'sticky',
                            left: 0,
                            zIndex: 10,
                        }}>
                            {hour}:00
                        </div>
                        {weekDays.map(day => {
                            const slotEvents = getEventsForDayAndTime(day, hour);
                            return (
                                <div
                                    key={`${day}-${hour}`}
                                    style={{
                                        minHeight: '60px',
                                        background: 'var(--surface-2)',
                                        padding: '4px',
                                        position: 'relative'
                                    }}
                                >
                                    {slotEvents.map(event => (
                                        <div
                                            key={event.id}
                                            onClick={() => onEventClick(event)}
                                            style={{
                                                position: 'absolute',
                                                top: '2px',
                                                left: '2px',
                                                right: '2px',
                                                bottom: '2px',
                                                background: `${getEventColor(event.type)}25`,
                                                borderLeft: `3px solid ${getEventColor(event.type)}`,
                                                borderRadius: '4px',
                                                padding: '4px 6px',
                                                fontSize: '0.7rem',
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                zIndex: 1
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{event.title}</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{event.location}</div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
