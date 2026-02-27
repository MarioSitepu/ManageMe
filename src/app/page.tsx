"use client";
import React from 'react';
import { useGlobal } from '@/lib/GlobalContext';
import { QuickFinance } from '@/components/features/QuickFinance';
import { DayTimeline } from '@/components/features/DayTimeline';
import { useNotifications } from '@/lib/useNotifications';

export default function Home() {
  const { state } = useGlobal();
  useNotifications();

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const budgetLeft = state.dailyBudget - (state.expenses
    .filter(e => new Date(e.date).toDateString() === now.toDateString())
    .reduce((a, b) => a + b.amount, 0));

  return (
    <main className="container" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <header style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>
          {dateStr}
        </p>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--text)'
        }}>
          {greeting}, Mario 👋
        </h1>
      </header>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <div className="stat-card">
          <span className="stat-label">Points</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
            {state.disciplinePoints}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Streak</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>
            {state.streakDays}🔥
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Budget</span>
          <span style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: budgetLeft >= 0 ? 'var(--success)' : 'var(--danger)',
          }}>
            {budgetLeft >= 0 ? '+' : ''}{(budgetLeft / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gap: '16px' }}>
        <DayTimeline />
        <QuickFinance />
      </div>
    </main>
  );
}
