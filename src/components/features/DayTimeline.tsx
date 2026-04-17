"use client";
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGlobal } from '@/lib/GlobalContext';
import { getNextEvent, getEventIcon, getEventColor } from '@/lib/eventHelpers';
import { Clock, MapPin, CheckCircle, Info, Calendar } from 'lucide-react';

export const DayTimeline: React.FC = () => {
    const { state, checkIn, showToast } = useGlobal();
    const [showModal, setShowModal] = useState(false);

    const nextEvent = getNextEvent(state.events);

    if (!nextEvent) {
        return (
            <Card className="flex flex-col items-center py-8 text-center bg-surface-2 border-dashed">
                <Calendar size={32} className="text-text-muted mb-3 opacity-50" />
                <p className="text-sm text-text-muted">No upcoming events scheduled for today.</p>
                <Button size="sm" variant="ghost" className="mt-4" onClick={() => window.location.href='/schedule'}>
                    Add Schedule
                </Button>
            </Card>
        );
    }

    const eventIcon = getEventIcon(nextEvent.type);
    const eventColor = getEventColor(nextEvent.type);

    const handleCheckIn = (onTime: boolean) => {
        checkIn(onTime);
        setShowModal(false);

        if (onTime) {
            showToast('✅ Awesome! You earned +10 discipline points.', 'success');
        } else {
            showToast('❌ Late check-in. -20 points. Try harder next time!', 'error');
        }
    };

    return (
        <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider">Today's Timeline</h2>
                <span className="badge badge-accent animate-pulse">Running Now</span>
            </div>

            <div className="timeline-container animate-fade-in">
                {/* Active/Next Event */}
                <div className="timeline-item">
                    <div className="timeline-dot shadow-[0_0_8px_var(--accent)]" style={{ background: eventColor }} />
                    <Card 
                        className="p-5! hover:border-accent/40 transition-colors cursor-pointer group"
                        onClick={() => setShowModal(true)}
                    >
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{eventIcon}</span>
                                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: eventColor }}>
                                            {nextEvent.type}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold group-hover:text-accent transition-colors">
                                        {nextEvent.title}
                                    </h3>
                                </div>

                                <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs font-medium text-text-secondary">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-accent" />
                                        <span>{nextEvent.startTime} {nextEvent.endTime && `— ${nextEvent.endTime}`}</span>
                                    </div>
                                    {nextEvent.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} className="text-danger" />
                                            <span>{nextEvent.location}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 bg-surface-2/50 rounded-xl border border-border/50 flex items-start gap-3">
                                    <Info size={14} className="mt-0.5 text-accent shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-semibold text-text uppercase tracking-tight">Prep Checklist</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['Laptop Charged', 'Notebook'].map(item => (
                                                <span key={item} className="flex items-center gap-1 text-[10px] bg-bg px-2 py-0.5 rounded-full text-text-muted border border-border">
                                                    <CheckCircle size={10} className="text-success" />
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button 
                            className="w-full mt-4 rounded-xl! group-hover:bg-accent-hover"
                            onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                        >
                            <CheckCircle size={18} /> Check In
                        </Button>
                    </Card>
                </div>

                {/* Placeholder for later events */}
                <div className="timeline-item opacity-40 grayscale">
                    <div className="timeline-dot" style={{ background: 'var(--text-muted)', border: 'none' }} />
                    <div className="pl-2">
                        <p className="text-[10px] font-bold text-text-muted uppercase italic mt-1">Next events after this...</p>
                    </div>
                </div>
            </div>

            {/* Check-In Modal Implementation remains but we'll use ConfirmModal logic or keep this unique one */}
            {showModal && (
                <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-sm glass-card p-8 rounded-3xl animate-slide-in-up shadow-2xl space-y-6">
                        <div className="text-center space-y-2">
                            <div className="inline-flex p-3 rounded-full bg-accent-light text-accent mb-2">
                                <Clock size={32} />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-text">Attendance</h2>
                            <p className="text-sm text-text-secondary">Are you present and on-time for <span className="text-text font-bold">"{nextEvent.title}"</span>?</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleCheckIn(true)}
                                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-success-light border border-success/30 hover:bg-success/20 transition-all group"
                            >
                                <div className="text-3xl bg-success/20 p-2 rounded-xl group-hover:scale-110 transition-transform">✅</div>
                                <div className="text-center">
                                    <div className="text-xs font-black text-success uppercase">On-Time</div>
                                    <div className="text-[10px] text-success/80">+10 Points</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleCheckIn(false)}
                                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-danger-light border border-danger/30 hover:bg-danger/20 transition-all group"
                            >
                                <div className="text-3xl bg-danger/20 p-2 rounded-xl group-hover:scale-110 transition-transform">❌</div>
                                <div className="text-center">
                                    <div className="text-xs font-black text-danger uppercase">Late</div>
                                    <div className="text-[10px] text-danger/80">-20 Points</div>
                                </div>
                            </button>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={() => setShowModal(false)}
                            className="w-full py-3! rounded-xl!"
                        >
                            Not yet / Cancel
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
};
