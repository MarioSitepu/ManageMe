"use client";
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGlobal } from '@/lib/GlobalContext';
import { ExpenseLineChart } from '@/components/charts/ExpenseLineChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { BudgetProgressBar } from '@/components/charts/BudgetProgressBar';

type Tab = 'overview' | 'transactions' | 'accounts';

const CATEGORY_COLORS: Record<string, string> = {
    Food: '#f59e0b', Transport: '#3b82f6', Entertainment: '#8b5cf6',
    Shopping: '#ec4899', Bills: '#ef4444', Other: '#64748b',
};

export default function FinancePage() {
    const { state, addAccount, addExpense, updateDailyBudget } = useGlobal();
    const [tab, setTab] = useState<Tab>('overview');
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [budgetInput, setBudgetInput] = useState(state.dailyBudget.toString());
    const [expenseForm, setExpenseForm] = useState({ amount: '', category: 'Food', description: '', accountId: '' });
    const [accountForm, setAccountForm] = useState({ name: '', type: 'BANK', balance: '', color: '#3b82f6' });

    const accounts = state.accounts || [];
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
    const todayExpenses = state.expenses.filter(e => new Date(e.date).toDateString() === new Date().toDateString());
    const todayTotal = todayExpenses.reduce((s, e) => s + e.amount, 0);

    const formatRupiah = (n: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

    const chartData = React.useMemo(() => {
        const g = state.expenses.reduce((acc, curr) => {
            const d = new Date(curr.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            acc[d] = (acc[d] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(g).map(([date, amount]) => ({ date, amount })).slice(-30);
    }, [state.expenses]);

    const categoryData = React.useMemo(() => {
        const g = state.expenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(g).map(([name, value]) => ({ name, value }));
    }, [state.expenses]);

    const groupedExpenses = state.expenses.reduce((acc, expense) => {
        const date = new Date(expense.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
        if (!acc[date]) acc[date] = [];
        acc[date].push(expense);
        return acc;
    }, {} as Record<string, typeof state.expenses>);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!expenseForm.amount || !expenseForm.description) return;
        await addExpense(parseFloat(expenseForm.amount), expenseForm.category, expenseForm.description, expenseForm.accountId);
        setShowAddExpense(false);
        setExpenseForm({ amount: '', category: 'Food', description: '', accountId: '' });
    };

    const handleAddAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountForm.name) return;
        await addAccount(accountForm.name, accountForm.type, parseFloat(accountForm.balance) || 0, accountForm.color);
        setShowAddAccount(false);
        setAccountForm({ name: '', type: 'BANK', balance: '', color: '#3b82f6' });
    };

    const handleSaveBudget = () => {
        const val = parseFloat(budgetInput);
        if (!isNaN(val) && val > 0) {
            updateDailyBudget(val);
        }
        setIsEditingBudget(false);
    };

    return (
        <main className="container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Finance</h1>
                    <p className="page-subtitle" style={{ color: 'var(--success)', fontWeight: 600 }}>
                        {formatRupiah(totalBalance)}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="ghost" size="sm" onClick={() => setShowAddAccount(!showAddAccount)}>+ Account</Button>
                    <Button variant="primary" size="sm" onClick={() => setShowAddExpense(!showAddExpense)}>+ Expense</Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div className="stat-card">
                    <span className="stat-label">Spent Today</span>
                    <span className="stat-value" style={{ fontSize: '1.375rem', color: 'var(--danger)' }}>{formatRupiah(todayTotal)}</span>
                </div>
                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span className="stat-label" style={{ marginBottom: 0 }}>Daily Budget</span>
                        <button onClick={() => {
                            setBudgetInput(state.dailyBudget.toString());
                            setIsEditingBudget(!isEditingBudget);
                        }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', padding: '0 4px' }}>
                            ✏️
                        </button>
                    </div>
                    {isEditingBudget ? (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                            <input
                                type="number"
                                value={budgetInput}
                                onChange={(e) => setBudgetInput(e.target.value)}
                                style={{ flex: 1, padding: '4px 8px', fontSize: '0.875rem' }}
                                autoFocus
                            />
                            <Button variant="primary" size="sm" onClick={handleSaveBudget}>Save</Button>
                        </div>
                    ) : (
                        <BudgetProgressBar spent={todayTotal} budget={state.dailyBudget} period="daily" />
                    )}
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="tab-group" style={{ marginBottom: '20px' }}>
                {(['overview', 'transactions', 'accounts'] as Tab[]).map(t => (
                    <button key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {/* Add Forms */}
            {showAddExpense && (
                <Card title="New Expense" style={{ marginBottom: '16px', borderColor: 'rgba(239,68,68,0.2)' }}>
                    <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input placeholder="Description (e.g. Nasi Goreng)" value={expenseForm.description}
                            onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                        <input type="number" placeholder="Amount (Rp)" value={expenseForm.amount}
                            onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <select value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                                {['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'].map(c => <option key={c}>{c}</option>)}
                            </select>
                            {accounts.length > 0 && (
                                <select value={expenseForm.accountId} onChange={e => setExpenseForm({ ...expenseForm, accountId: e.target.value })}>
                                    <option value="">From account...</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            )}
                        </div>
                        <Button type="submit" variant="danger">Save Expense</Button>
                    </form>
                </Card>
            )}

            {showAddAccount && (
                <Card title="New Account" style={{ marginBottom: '16px', borderColor: 'rgba(34,197,94,0.2)' }}>
                    <form onSubmit={handleAddAccount} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input placeholder="Account Name (e.g. DANA)" value={accountForm.name}
                            onChange={e => setAccountForm({ ...accountForm, name: e.target.value })} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <select value={accountForm.type} onChange={e => setAccountForm({ ...accountForm, type: e.target.value })}>
                                <option value="BANK">Bank</option>
                                <option value="WALLET">E-Wallet</option>
                                <option value="CASH">Cash</option>
                            </select>
                            <input type="number" placeholder="Initial Balance" value={accountForm.balance}
                                onChange={e => setAccountForm({ ...accountForm, balance: e.target.value })} />
                        </div>
                        <Button type="submit" variant="success">Save Account</Button>
                    </form>
                </Card>
            )}

            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
                <div style={{ display: 'grid', gap: '16px' }}>
                    <Card title="Spending Trends">
                        <div style={{ height: '220px' }}><ExpenseLineChart data={chartData} /></div>
                    </Card>
                    <Card title="By Category">
                        <div style={{ height: '220px' }}><CategoryPieChart data={categoryData} /></div>
                    </Card>
                </div>
            )}

            {/* TRANSACTIONS TAB */}
            {tab === 'transactions' && (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {Object.entries(groupedExpenses).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                            <p style={{ fontSize: '2rem', marginBottom: '8px' }}>💸</p>
                            <p>No expenses yet</p>
                        </div>
                    )}
                    {Object.entries(groupedExpenses).map(([date, expenses]) => (
                        <Card key={date}>
                            <p className="section-label" style={{ marginBottom: '12px' }}>{date}</p>
                            {expenses.map(exp => (
                                <div key={exp.id} className="list-item">
                                    <div style={{
                                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                        background: CATEGORY_COLORS[exp.category] || '#64748b'
                                    }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 500, color: 'var(--text)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {exp.description || exp.category}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {exp.category}{exp.accountName ? ` • ${exp.accountName}` : ''}
                                        </p>
                                    </div>
                                    <span style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.9rem', flexShrink: 0 }}>
                                        -{formatRupiah(exp.amount)}
                                    </span>
                                </div>
                            ))}
                        </Card>
                    ))}
                </div>
            )}

            {/* ACCOUNTS TAB */}
            {tab === 'accounts' && (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {accounts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                            <p style={{ fontSize: '2rem', marginBottom: '8px' }}>🏦</p>
                            <p>No accounts yet. Add one above!</p>
                        </div>
                    )}
                    {accounts.map(acc => (
                        <Card key={acc.id} style={{ borderLeft: `3px solid ${acc.color || '#3b82f6'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: 600, color: 'var(--text)' }}>{acc.name}</p>
                                    <span className="badge badge-muted" style={{ marginTop: '4px' }}>{acc.type}</span>
                                </div>
                                <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)' }}>
                                    {formatRupiah(acc.balance)}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    );
}
