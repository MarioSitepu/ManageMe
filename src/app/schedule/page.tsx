"use client";
import React, { useState, useEffect } from 'react';
import { EventTypeSelector } from '@/components/ui/EventTypeSelector';
import { useGlobal } from '@/lib/GlobalContext';
import { EventType, CalendarEvent } from '@/lib/store';
import { MonthlyCalendar } from '@/components/calendar/MonthlyCalendar';
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar';

type ViewType = 'monthly' | 'weekly' | 'list';

export default function SchedulePage() {
    const { state, addEvent, updateEvent, deleteEvent } = useGlobal();
    const [view, setView] = useState<ViewType>('monthly');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [gcalEvents, setGcalEvents] = useState<CalendarEvent[]>([]);
    const [gcalConnected, setGcalConnected] = useState(false);
    const [gcalLoading, setGcalLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const [formData, setFormData] = useState({
        title: '', type: 'class' as EventType, day: 'Monday',
        date: '', startTime: '', endTime: '',
        prepTimeMinutes: 15, description: '', location: '', isRecurring: true
    });

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Load Google Calendar events
    useEffect(() => {
        async function loadGcalEvents() {
            try {
                const res = await fetch('/api/google/events?days=60');
                const data = await res.json();
                if (data.connected) { setGcalConnected(true); setGcalEvents(data.events || []); }
            } catch { /* not connected */ } finally { setGcalLoading(false); }
        }
        loadGcalEvents();
    }, []);

    const allEvents = [
        ...state.events,
        ...gcalEvents.filter(ge => !state.events.some(le => ge.id === `gcal_${(le as any).googleEventId}`))
    ] as CalendarEvent[];

    const resetForm = () => {
        setFormData({ title: '', type: 'class', day: 'Monday', date: new Date().toISOString().split('T')[0], startTime: '', endTime: '', prepTimeMinutes: 15, description: '', location: '', isRecurring: true });
        setEditingEvent(null);
    };

    const handleEditClick = (event: CalendarEvent) => {
        setEditingEvent(event);
        setFormData({ title: event.title, type: event.type, day: event.day || 'Monday', date: event.date || new Date().toISOString().split('T')[0], startTime: event.startTime, endTime: event.endTime || '', prepTimeMinutes: event.prepTimeMinutes, description: event.description || '', location: event.location || '', isRecurring: event.isRecurring ?? true });
        setShowForm(true);
    };

    const handleDeleteClick = async (id: string) => {
        if (!confirm('Delete this event?')) return;
        if (id.startsWith('gcal_')) {
            await fetch(`/api/google/events/${id.replace('gcal_', '')}`, { method: 'DELETE' });
            setGcalEvents(prev => prev.filter(e => e.id !== id));
        } else {
            await deleteEvent(id);
        }
        if (editingEvent?.id === id) { setShowForm(false); resetForm(); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            title: formData.title, type: formData.type, startTime: formData.startTime,
            endTime: formData.endTime || undefined, prepTimeMinutes: formData.prepTimeMinutes,
            description: formData.description || undefined, location: formData.location || undefined,
            isRecurring: formData.isRecurring, day: formData.isRecurring ? formData.day : undefined,
            date: !formData.isRecurring && formData.date ? formData.date : undefined,
        };
        if (editingEvent?.id.startsWith('gcal_')) {
            await fetch(`/api/google/events/${editingEvent.id.replace('gcal_', '')}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const res = await fetch('/api/google/events?days=60');
            const data = await res.json();
            if (data.connected) setGcalEvents(data.events || []);
        } else if (editingEvent) {
            await updateEvent(editingEvent.id, payload);
        } else {
            await addEvent(payload);
        }
        setShowForm(false); resetForm();
    };

    const handleSyncFromGcal = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/google/pull', { method: 'POST' });
            const data = await res.json();
            const evRes = await fetch('/api/google/events?days=60');
            const evData = await evRes.json();
            if (evData.connected) setGcalEvents(evData.events || []);
            alert(`✅ ${data.created} event diimport!`);
            window.location.reload(); // Force GlobalContext to refetch DB state
        } catch { alert('❌ Gagal sync'); } finally { setSyncing(false); }
    };

    const changeMonth = (delta: number) => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + delta);
        setCurrentDate(d);
    };

    return (
        <main className="container">
            {/* Header */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div>
                        <h1 className="page-title">Schedule</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px', lineHeight: 1, transition: 'color var(--transition)' }}>‹</button>
                            <p className="page-subtitle" style={{ margin: 0, minWidth: '110px', textAlign: 'center' }}>
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                            <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px', lineHeight: 1, transition: 'color var(--transition)' }}>›</button>
                        </div>
                    </div>
                </div>
                {!gcalLoading && (
                    gcalConnected ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span className="badge badge-success">🗓 {gcalEvents.length}</span>
                            <button onClick={handleSyncFromGcal} disabled={syncing} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', padding: '2px 4px', fontFamily: 'inherit' }}>
                                {syncing ? '⏳' : '↓ Pull'}
                            </button>
                        </div>
                    ) : (
                        <a href="/api/google/auth" className="badge badge-muted" style={{ textDecoration: 'none' }}>🔗 Connect GCal</a>
                    )
                )}
            </div>

            {/* View Tabs */}
            <div className="tab-group" style={{ marginBottom: '16px' }}>
                {(['monthly', 'weekly', 'list'] as ViewType[]).map(v => (
                    <button key={v} className={`tab-item ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                ))}
            </div>

            {/* Event Form */}
            {showForm && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '16px', animation: 'slideUp 0.25s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                            {editingEvent ? '✏️ Edit Event' : '+ New Event'}
                        </h3>
                        <button onClick={() => { setShowForm(false); resetForm(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1 }}>×</button>
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <EventTypeSelector value={formData.type} onChange={(type) => setFormData({ ...formData, type })} />
                        <input type="text" placeholder="Event title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />

                        <div style={{ display: 'flex', gap: '6px' }}>
                            {([true, false] as const).map(r => (
                                <button key={String(r)} type="button" onClick={() => setFormData({ ...formData, isRecurring: r })}
                                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${formData.isRecurring === r ? 'var(--accent)' : 'var(--border)'}`, background: formData.isRecurring === r ? 'var(--accent-light)' : 'var(--surface-2)', color: formData.isRecurring === r ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'inherit', transition: 'all var(--transition)' }}>
                                    {r ? '🔁 Weekly' : '📅 One-time'}
                                </button>
                            ))}
                        </div>

                        {formData.isRecurring ? (
                            <select value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })}>
                                {daysOfWeek.map(d => <option key={d}>{d}</option>)}
                            </select>
                        ) : (
                            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required />
                            <input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                        </div>
                        <input type="text" placeholder="Location (optional)" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />

                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                {editingEvent ? 'Update' : 'Save Event'}
                            </button>
                            {editingEvent && (
                                <button type="button" className="btn btn-danger" onClick={() => handleDeleteClick(editingEvent.id)}>Delete</button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Views */}
            {view === 'monthly' && (
                <MonthlyCalendar
                    currentDate={currentDate}
                    events={allEvents}
                    onDateClick={(date) => {
                        resetForm();
                        setFormData(prev => ({ ...prev, date: date.toISOString().split('T')[0], isRecurring: false }));
                        setShowForm(true);
                    }}
                    onEventClick={handleEditClick}
                />
            )}

            {view === 'weekly' && (
                <WeeklyCalendar currentDate={currentDate} events={allEvents} onEventClick={handleEditClick} />
            )}

            {view === 'list' && (
                <div style={{ display: 'grid', gap: '8px' }}>
                    {daysOfWeek.map(day => {
                        const dayEvents = allEvents.filter(e => {
                            if (e.isRecurring && e.day === day) return true;
                            if (!e.isRecurring && e.date) {
                                // Parse date and get local weekday name
                                const d = typeof e.date === 'string' ? new Date(e.date) : new Date(e.date);
                                return d.toLocaleDateString('en-US', { weekday: 'long' }) === day;
                            }
                            // fallback
                            return e.day === day;
                        });

                        // Sort events by time
                        dayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));

                        if (!dayEvents.length) return null;

                        return (
                            <div key={day} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 18px' }}>
                                <p className="section-label" style={{ marginBottom: '10px' }}>{day}</p>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {dayEvents.map(ev => (
                                        <div key={ev.id} onClick={() => handleEditClick(ev)} className="list-item" style={{ cursor: 'pointer', background: 'var(--surface-2)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: 4, height: 36, borderRadius: 2, background: ev.id.startsWith('gcal_') ? 'var(--success)' : 'var(--accent)', flexShrink: 0 }} />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{ev.title}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}
                                                    {!ev.isRecurring && ev.date && ` • ${new Date(ev.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`}
                                                </p>
                                            </div>
                                            {ev.id.startsWith('gcal_') && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>GCal</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Show empty state if NO events match any day */}
                    {!daysOfWeek.some(day => allEvents.some(e => {
                        if (e.isRecurring) return e.day === day;
                        if (e.date) return new Date(e.date).toLocaleDateString('en-US', { weekday: 'long' }) === day;
                        return e.day === day;
                    })) && (
                            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                                <p style={{ fontSize: '2rem', marginBottom: '8px' }}>📅</p>
                                <p>Belum ada jadwal. Tap + untuk menambah jadwal.</p>
                            </div>
                        )}
                </div>
            )}

            {/* FAB */}
            {!showForm && (
                <button className="fab" onClick={() => { resetForm(); setShowForm(true); }} title="Add Event">+</button>
            )}
        </main>
    );
}
