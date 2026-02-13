"use client";
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGlobal } from '@/lib/GlobalContext';

export const QuickFinance: React.FC = () => {
    const { state, addExpense } = useGlobal();
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');

    const handleAdd = () => {
        if (!amount || !category) return;
        addExpense(parseInt(amount), category);
        setAmount('');
        setCategory('');
    };

    // Calculate daily total (simple filter for today)
    const today = new Date().toDateString();
    const dailyTotal = state.expenses
        .filter(e => new Date(e.date).toDateString() === today)
        .reduce((acc, curr) => acc + curr.amount, 0);

    const percentUsed = Math.min((dailyTotal / state.dailyBudget) * 100, 100);
    const isOverBudget = dailyTotal > state.dailyBudget;

    return (
        <Card title="Quick Finance">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="number"
                    placeholder="Amount (Rp)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
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
                <div style={{ display: 'flex', gap: '10px' }}>
                    {['Food', 'Transport', 'Shop'].map(cat => (
                        <Button
                            key={cat}
                            size="sm"
                            onClick={() => setCategory(cat)}
                            style={{
                                flex: 1,
                                background: category === cat ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                border: category === cat ? '1px solid white' : 'none'
                            }}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
                <Button variant="primary" onClick={handleAdd} disabled={!amount || !category}>
                    Add Expense
                </Button>
            </div>

            <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                    <span>Daily Limit</span>
                    <span>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(dailyTotal)}
                        {' / '}
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(state.dailyBudget)}
                    </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${percentUsed}%`,
                        height: '100%',
                        background: isOverBudget ? 'var(--danger)' : 'var(--warning)',
                        transition: 'width 0.5s ease'
                    }}></div>
                </div>
                {isOverBudget && (
                    <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '5px' }}>
                        Warning: You have exceeded your daily budget!
                    </p>
                )}
            </div>
        </Card>
    );
};
