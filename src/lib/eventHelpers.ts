import { EventType, CalendarEvent } from './store';

// Event type configurations
export const EVENT_TYPES = {
    class: { icon: '📚', color: '#8b5cf6', label: 'Class' },
    assignment: { icon: '📝', color: '#3b82f6', label: 'Assignment' },
    meeting: { icon: '👥', color: '#10b981', label: 'Meeting' },
    personal: { icon: '🎯', color: '#f59e0b', label: 'Personal' },
    exam: { icon: '📋', color: '#ef4444', label: 'Exam' },
    study: { icon: '📖', color: '#06b6d4', label: 'Study' },
};

export function getEventColor(type: EventType): string {
    return EVENT_TYPES[type]?.color || '#8b5cf6';
}

export function getEventIcon(type: EventType): string {
    return EVENT_TYPES[type]?.icon || '📅';
}

export function getEventLabel(type: EventType): string {
    return EVENT_TYPES[type]?.label || 'Event';
}

export function sortEventsByTime(events: CalendarEvent[]): CalendarEvent[] {
    return [...events].sort((a, b) => {
        const timeA = a.startTime.split(':').map(Number);
        const timeB = b.startTime.split(':').map(Number);
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });
}

export function getEventsForDay(events: CalendarEvent[], day: string): CalendarEvent[] {
    return sortEventsByTime(events.filter(e => e.day === day));
}

export function getNextEvent(events: CalendarEvent[]): CalendarEvent | null {
    if (events.length === 0) return null;

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5);

    // Get today's remaining events
    const todayEvents = getEventsForDay(events, currentDay).filter(
        e => e.startTime >= currentTime
    );

    if (todayEvents.length > 0) return todayEvents[0];

    // If no events today, get next day's first event
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const currentDayIndex = daysOfWeek.indexOf(currentDay);

    for (let i = 1; i < 7; i++) {
        const nextDayIndex = (currentDayIndex + i) % 7;
        const nextDay = daysOfWeek[nextDayIndex];
        const nextDayEvents = getEventsForDay(events, nextDay);
        if (nextDayEvents.length > 0) return nextDayEvents[0];
    }

    return events[0]; // Fallback to first event
}
