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

    const getEventsForDayAndTime = (day: string, hour: number) => {
        return events.filter(e => {
            const eventStartHour = parseInt(e.startTime.split(':')[0]);
            const eventEndHour = e.endTime ? parseInt(e.endTime.split(':')[0]) : eventStartHour + 1;
            return e.day === day && hour >= eventStartHour && hour < eventEndHour;
        });
    };

    return (
        <div style={{ width: '100%', overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, minmax(120px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.1)' }}>
                {/* Header Row */}
                <div style={{ padding: '10px', background: 'var(--background)', position: 'sticky', left: 0, zIndex: 10 }}></div>
                {weekDays.map(day => (
                    <div
                        key={day}
                        style={{
                            padding: '10px',
                            textAlign: 'center',
                            background: 'var(--background)',
                            fontWeight: 600,
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
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
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            background: 'var(--background)',
                            position: 'sticky',
                            left: 0,
                            zIndex: 10,
                            borderRight: '1px solid rgba(255,255,255,0.1)'
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
                                        background: 'rgba(0,0,0,0.2)',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        borderRight: '1px solid rgba(255,255,255,0.05)',
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
                                                background: `${getEventColor(event.type)}40`,
                                                borderLeft: `3px solid ${getEventColor(event.type)}`,
                                                borderRadius: '4px',
                                                padding: '4px',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                zIndex: 1
                                            }}
                                        >
                                            <div style={{ fontWeight: 600 }}>{event.title}</div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{event.location}</div>
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
