"use client";
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EventTypeSelector } from '@/components/ui/EventTypeSelector';
import { useGlobal } from '@/lib/GlobalContext';
import { EventType, CalendarEvent } from '@/lib/store';
import { MonthlyCalendar } from '@/components/calendar/MonthlyCalendar';
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar';

type ViewType = 'list' | 'monthly' | 'weekly';

export default function SchedulePage() {
    const { state, addEvent, updateEvent, deleteEvent } = useGlobal();
    const [view, setView] = useState<ViewType>('monthly');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        type: 'class' as EventType,
        day: 'Monday',
        date: '',
        startTime: '',
        endTime: '',
        prepTimeMinutes: 15,
        description: '',
        location: '',
        isRecurring: true
    });

    const resetForm = () => {
        setFormData({
            title: '',
            type: 'class',
            day: 'Monday',
            date: new Date().toISOString().split('T')[0],
            startTime: '',
            endTime: '',
            prepTimeMinutes: 15,
            description: '',
            location: '',
            isRecurring: true
        });
        setEditingEvent(null);
    };

    const handleEditClick = (event: CalendarEvent) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            type: event.type,
            day: event.day || 'Monday',
            date: event.date || new Date().toISOString().split('T')[0],
            startTime: event.startTime,
            endTime: event.endTime || '',
            prepTimeMinutes: event.prepTimeMinutes,
            description: event.description || '',
            location: event.location || '',
            isRecurring: event.isRecurring ?? true
        });
        setShowForm(true);
    };

    const handleDeleteClick = async (id: string) => {
        if (confirm('Are you sure you want to delete this event?')) {
            await deleteEvent(id);
            if (editingEvent?.id === id) {
                setShowForm(false);
                resetForm();
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const eventPayload = {
            title: formData.title,
            type: formData.type,
            startTime: formData.startTime,
            endTime: formData.endTime || undefined,
            prepTimeMinutes: formData.prepTimeMinutes,
            description: formData.description || undefined,
            location: formData.location || undefined,
            isRecurring: formData.isRecurring,
            day: formData.isRecurring ? formData.day : undefined,
            date: !formData.isRecurring && formData.date ? formData.date : undefined,
        };

        if (editingEvent) {
            await updateEvent(editingEvent.id, eventPayload);
        } else {
            await addEvent(eventPayload);
        }

        setShowForm(false);
        resetForm();
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <main className="container" style={{ padding: '2rem 1rem 6rem 1rem' }}>
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '5px' }}>📅 Calendar</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                        value={view}
                        onChange={(e) => setView(e.target.value as ViewType)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            outline: 'none'
                        }}
                    >
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="list">List View</option>
                    </select>

                    <Button onClick={() => { resetForm(); setShowForm(!showForm); }} size="sm">
                        {showForm ? 'Cancel' : '+ Add Event'}
                    </Button>
                </div>
            </header>

            {/* Navigation for Month/Week */}
            {view !== 'list' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                    <Button onClick={() => changeMonth(-1)} size="sm" variant="ghost">← Prev</Button>
                    <span style={{ fontWeight: 600 }}>
                        {view === 'monthly' ? 'Month View' : 'Week View'}
                    </span>
                    <Button onClick={() => changeMonth(1)} size="sm" variant="ghost">Next →</Button>
                </div>
            )}

            {showForm && (
                <Card title={editingEvent ? "Edit Event" : "Add New Event"} style={{ marginBottom: '24px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <EventTypeSelector
                            value={formData.type}
                            onChange={(type) => setFormData({ ...formData, type })}
                        />

                        <input
                            type="text"
                            placeholder="Event Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />

                        {/* Recurrence Toggle */}
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    checked={formData.isRecurring}
                                    onChange={() => setFormData({ ...formData, isRecurring: true })}
                                />
                                Weekly (Recurring)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    checked={!formData.isRecurring}
                                    onChange={() => setFormData({ ...formData, isRecurring: false })}
                                />
                                Specific Date
                            </label>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                            {formData.isRecurring ? (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Day of Week</label>
                                    <select
                                        value={formData.day}
                                        onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--glass-border)',
                                            background: 'rgba(0,0,0,0.2)',
                                            color: 'white',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    >
                                        {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required={!formData.isRecurring}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--glass-border)',
                                            background: 'rgba(0,0,0,0.2)',
                                            color: 'white',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            colorScheme: 'dark'
                                        }}
                                    />
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Start Time</label>
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--glass-border)',
                                            background: 'rgba(0,0,0,0.2)',
                                            color: 'white',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>End Time</label>
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--glass-border)',
                                            background: 'rgba(0,0,0,0.2)',
                                            color: 'white',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Additional fields like description, location can be added here */}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button type="submit" variant="primary" style={{ flex: 1 }}>{editingEvent ? 'Update Event' : 'Save Event'}</Button>
                            {editingEvent && (
                                <Button type="button" onClick={() => handleDeleteClick(editingEvent.id)} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                                    Delete
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>
            )}

            {/* Views */}
            {view === 'monthly' && (
                <MonthlyCalendar
                    currentDate={currentDate}
                    events={state.events}
                    onDateClick={(date) => {
                        resetForm();
                        setFormData(prev => ({ ...prev, date: date.toISOString().split('T')[0], isRecurring: false }));
                        setShowForm(true);
                    }}
                    onEventClick={handleEditClick}
                />
            )}

            {view === 'weekly' && (
                <WeeklyCalendar
                    currentDate={currentDate}
                    events={state.events}
                    onEventClick={handleEditClick}
                />
            )}

            {view === 'list' && (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {daysOfWeek.map(day => {
                        const dayEvents = state.events.filter(e => e.day === day || (e.date && new Date(e.date).getDay() === daysOfWeek.indexOf(day) + 1)); // Approximate check
                        // Better List View filtering required for exact dates

                        return (
                            <Card key={day} title={day}>
                                {/* Reuse previous list logic */}
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Use Calendar view for detailed scheduling</div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
