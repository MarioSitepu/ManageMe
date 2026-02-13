"use client";
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGlobal } from '@/lib/GlobalContext';
import { getNextEvent, getEventIcon, getEventColor } from '@/lib/eventHelpers';

export const DayTimeline: React.FC = () => {
    const { state, checkIn } = useGlobal();
    const [showModal, setShowModal] = useState(false);

    const nextEvent = getNextEvent(state.events);

    if (!nextEvent) return <Card>No upcoming events</Card>;

    const eventIcon = getEventIcon(nextEvent.type);
    const eventColor = getEventColor(nextEvent.type);

    const handleCheckIn = (onTime: boolean) => {
        checkIn(onTime);
        setShowModal(false);

        // Show feedback animation
        const pointsChange = onTime ? '+10' : '-20';
        alert(`${onTime ? '✅ Great!' : '❌ Late!'} Points: ${pointsChange} `);
    };

    return (
        <>
            <Card title="Next Up">
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '2rem' }}>{eventIcon}</span>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{nextEvent.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: eventColor, textTransform: 'capitalize' }}>
                                {nextEvent.type}
                            </p>
                        </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Starts at <span style={{ color: 'white' }}>{nextEvent.startTime}</span>
                        {nextEvent.endTime && <span> - {nextEvent.endTime}</span>}
                        {' '}(Prep: {nextEvent.prepTimeMinutes}m)
                    </p>
                    {nextEvent.location && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                            📍 {nextEvent.location}
                        </p>
                    )}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Preparation Checklist:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                        <li>Laptop Charged</li>
                        <li>Notebook</li>
                    </ul>
                </div>

                <Button onClick={() => setShowModal(true)} style={{ width: '100%' }}>
                    Check In
                </Button>
            </Card>

            {/* Check-In Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div className="glass-panel" style={{
                        padding: '30px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        animation: 'slideUp 0.3s ease'
                    }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Were you on time?</h2>

                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                            <Button
                                onClick={() => handleCheckIn(true)}
                                style={{
                                    flex: 1,
                                    background: 'var(--success)',
                                    padding: '20px'
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: '2rem', marginBottom: '5px' }}>✅</div>
                                    <div>Yes, On Time</div>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>+10 points</div>
                                </div>
                            </Button>

                            <Button
                                onClick={() => handleCheckIn(false)}
                                style={{
                                    flex: 1,
                                    background: 'var(--danger)',
                                    padding: '20px'
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: '2rem', marginBottom: '5px' }}>❌</div>
                                    <div>No, Late</div>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>-20 points</div>
                                </div>
                            </Button>
                        </div>

                        <Button
                            onClick={() => setShowModal(false)}
                            style={{ background: 'rgba(255,255,255,0.1)', width: '100%' }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};
