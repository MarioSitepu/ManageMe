"use client";
import React from 'react';

interface BudgetProgressBarProps {
    spent: number;
    budget: number;
    period?: 'daily' | 'weekly' | 'monthly';
}

export function BudgetProgressBar({ spent, budget, period = 'daily' }: BudgetProgressBarProps) {
    const percentage = Math.min((spent / budget) * 100, 100);
    const isWarning = percentage > 80;
    const isDanger = percentage > 100;

    const formatRupiah = (value: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(value);

    const getColor = () => {
        if (isDanger) return '#ef4444';
        if (isWarning) return '#f59e0b';
        return '#10b981';
    };

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                    {period.charAt(0).toUpperCase() + period.slice(1)} Budget
                </span>
                <span style={{ fontWeight: 600, color: getColor() }}>
                    {formatRupiah(spent)} / {formatRupiah(budget)}
                </span>
            </div>

            <div style={{
                width: '100%',
                height: '12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '6px',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <div
                    style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: getColor(),
                        transition: 'all 0.5s ease',
                        position: 'relative'
                    }}
                >
                    {percentage > 100 && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: '20px',
                            background: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)',
                        }} className="animate-slide" />
                    )}
                </div>
            </div>

            <div style={{ marginTop: '6px', fontSize: '0.85rem' }}>
                {isDanger && (
                    <span style={{ color: '#ef4444' }}>
                        ⚠️ Over budget by {formatRupiah(spent - budget)}
                    </span>
                )}
                {isWarning && !isDanger && (
                    <span style={{ color: '#f59e0b' }}>
                        ⚡ {percentage.toFixed(0)}% of budget used
                    </span>
                )}
                {!isWarning && !isDanger && (
                    <span style={{ color: '#10b981' }}>
                        ✓ {formatRupiah(budget - spent)} remaining
                    </span>
                )}
            </div>
        </div>
    );
}
