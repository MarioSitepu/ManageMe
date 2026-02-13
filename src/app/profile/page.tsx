"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { useGlobal } from '@/lib/GlobalContext';
import { WhatsAppSettings } from '@/components/features/WhatsAppSettings';

export default function ProfilePage() {
    const { state } = useGlobal();

    const totalExpenses = state.expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const avgDaily = state.expenses.length > 0 ? totalExpenses / Math.max(state.expenses.length, 1) : 0;

    // Calculate on-time percentage (mock data for now)
    const totalClasses = 20; // mock
    const onTimeCount = 15; // mock
    const onTimePercentage = (onTimeCount / totalClasses) * 100;

    const formatRupiah = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

    return (
        <main className="container" style={{ padding: '2rem 1rem 6rem 1rem' }}>
            <header style={{ marginBottom: '30px', textAlign: 'center' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    margin: '0 auto 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem'
                }}>
                    👤
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Student Profile</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Keep tracking, keep growing!</p>
            </header>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '30px' }}>
                <Card style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Discipline</p>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{state.disciplinePoints}</h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Points</p>
                </Card>

                <Card style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Streak</p>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>{state.streakDays}</h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Days 🔥</p>
                </Card>

                <Card style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Events</p>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{state.events.length}</h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Scheduled</p>
                </Card>
            </div>

            {/* Performance Metrics */}
            <Card title="Performance Metrics" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.95rem' }}>On-Time Rate</span>
                            <span style={{ fontWeight: 600, color: 'var(--success)' }}>{onTimePercentage.toFixed(0)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${onTimePercentage}%`,
                                height: '100%',
                                background: 'var(--success)',
                                transition: 'width 0.5s ease'
                            }}></div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Total Expenses</p>
                            <p style={{ fontSize: '1.3rem', fontWeight: 600 }}>{formatRupiah(totalExpenses)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Daily Budget</p>
                            <p style={{ fontSize: '1.3rem', fontWeight: 600 }}>{formatRupiah(state.dailyBudget)}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* WhatsApp Settings */}
            <WhatsAppSettings />

            {/* Achievements */}
            <Card title="Achievements">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '16px' }}>
                    {[
                        { icon: '🎯', name: 'First Week', unlocked: state.streakDays >= 7 },
                        { icon: '💪', name: '100 Points', unlocked: state.disciplinePoints >= 100 },
                        { icon: '📚', name: '5 Classes', unlocked: state.events.filter(e => e.type === 'class').length >= 5 },
                        { icon: '💰', name: 'Budget Master', unlocked: totalExpenses < state.dailyBudget * 7 },
                    ].map((achievement, idx) => (
                        <div
                            key={idx}
                            style={{
                                padding: '16px',
                                background: achievement.unlocked ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${achievement.unlocked ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '12px',
                                textAlign: 'center',
                                opacity: achievement.unlocked ? 1 : 0.4,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{achievement.icon}</div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 500 }}>{achievement.name}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </main>
    );
}
