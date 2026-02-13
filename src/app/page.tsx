"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { useGlobal } from '@/lib/GlobalContext';
import { QuickFinance } from '@/components/features/QuickFinance';
import { DayTimeline } from '@/components/features/DayTimeline';
import { useNotifications } from '@/lib/useNotifications';

export default function Home() {
  const { state } = useGlobal();
  useNotifications(); // Enable automatic notifications

  return (
    <main className="container" style={{ padding: '2rem 1rem 6rem 1rem' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          TrackMe
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          Discipline. Finance. Growth.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Status Card */}
        <Card title="Current Status">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <h2 style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--success)' }}>{state.disciplinePoints}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Discipline Points</p>
          </div>
          <div style={{ marginTop: '20px' }}>
            <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Streak</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{state.streakDays} Days 🔥</span>
            </p>
          </div>
        </Card>

        {/* Components */}
        <DayTimeline />
        <QuickFinance />
      </div>
    </main>
  );
}
