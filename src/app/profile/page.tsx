"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { useGlobal } from '@/lib/GlobalContext';
import { WhatsAppSettings } from '@/components/features/WhatsAppSettings';

export default function ProfilePage() {
    const { state } = useGlobal();

    const totalExpenses = state.expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const formatRupiah = (n: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

    const achievements = [
        { icon: '🎯', name: 'First Week', desc: '7-day streak', unlocked: state.streakDays >= 7 },
        { icon: '💪', name: '100 Points', desc: 'Discipline pts', unlocked: state.disciplinePoints >= 100 },
        { icon: '📚', name: '5 Classes', desc: 'Events added', unlocked: state.events.filter(e => e.type === 'class').length >= 5 },
        { icon: '💰', name: 'Budget Master', desc: 'Under budget', unlocked: totalExpenses < state.dailyBudget * 7 },
    ];

    return (
        <main className="container">
            {/* Avatar Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                    margin: '0 auto 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
                }}>
                    👤
                </div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Mario</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Keep tracking, keep growing!</p>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <div className="stat-card" style={{ alignItems: 'center', textAlign: 'center' }}>
                    <span className="stat-label">Points</span>
                    <span style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--success)' }}>{state.disciplinePoints}</span>
                </div>
                <div className="stat-card" style={{ alignItems: 'center', textAlign: 'center' }}>
                    <span className="stat-label">Streak</span>
                    <span style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--warning)' }}>{state.streakDays} 🔥</span>
                </div>
                <div className="stat-card" style={{ alignItems: 'center', textAlign: 'center' }}>
                    <span className="stat-label">Events</span>
                    <span style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--accent)' }}>{state.events.length}</span>
                </div>
            </div>

            {/* Finance Summary */}
            <Card title="Finance Summary" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <p className="section-label">Total Expenses</p>
                        <p style={{ fontWeight: 600, color: 'var(--danger)', marginTop: '4px' }}>{formatRupiah(totalExpenses)}</p>
                    </div>
                    <div>
                        <p className="section-label">Daily Budget</p>
                        <p style={{ fontWeight: 600, color: 'var(--text)', marginTop: '4px' }}>{formatRupiah(state.dailyBudget)}</p>
                    </div>
                </div>
            </Card>

            {/* Achievements */}
            <Card title="Achievements" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {achievements.map((a, i) => (
                        <div key={i} style={{
                            padding: '14px',
                            background: a.unlocked ? 'var(--accent-light)' : 'var(--surface-2)',
                            border: `1px solid ${a.unlocked ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius)',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            opacity: a.unlocked ? 1 : 0.45,
                        }}>
                            <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{a.icon}</span>
                            <div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: a.unlocked ? 'var(--accent)' : 'var(--text)' }}>{a.name}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* WhatsApp Settings */}
            <WhatsAppSettings />
        </main>
    );
}
