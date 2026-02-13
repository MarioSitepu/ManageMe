"use client";
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useGlobal } from '@/lib/GlobalContext';
import { ExpenseLineChart } from '@/components/charts/ExpenseLineChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { BudgetProgressBar } from '@/components/charts/BudgetProgressBar';

type TimeRange = '7' | '30' | '90';

export default function FinancePage() {
    const { state, addAccount, addExpense } = useGlobal();
    const [timeRange, setTimeRange] = useState<TimeRange>('30');

    // Add Expense / Account Form State
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [expenseForm, setExpenseForm] = useState({ amount: '', category: 'Food', description: '', accountId: '' });
    const [accountForm, setAccountForm] = useState({ name: '', type: 'BANK', balance: '', color: '#3b82f6' });

    const totalSpent = state.expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const todayExpenses = state.expenses.filter(e =>
        new Date(e.date).toDateString() === new Date().toDateString()
    );
    const todayTotal = todayExpenses.reduce((acc, exp) => acc + exp.amount, 0);

    // Filter accounts if any
    const accounts = state.accounts || [];
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Group expenses for history
    const groupedExpenses = state.expenses.reduce((acc, expense) => {
        const date = new Date(expense.date).toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(expense);
        return acc;
    }, {} as Record<string, typeof state.expenses>);

    // Prepare Data for Charts
    const chartData = React.useMemo(() => {
        // Group by date
        const grouped = state.expenses.reduce((acc, curr) => {
            const date = new Date(curr.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            acc[date] = (acc[date] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped)
            .map(([date, amount]) => ({ date, amount }))
            .slice(-parseInt(timeRange)); // Limit by time range
    }, [state.expenses, timeRange]);

    const categoryData = React.useMemo(() => {
        const grouped = state.expenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }, [state.expenses]);


    const formatRupiah = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

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

    return (
        <main className="container" style={{ padding: '2rem 1rem 6rem 1rem' }}>
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>💰 Finance</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Total Balance: <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{formatRupiah(totalBalance)}</span></p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowAddAccount(!showAddAccount)} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}>+ Account</button>
                    <button onClick={() => setShowAddExpense(!showAddExpense)} style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--accent-primary)', color: 'white', border: 'none' }}>+ Expense</button>
                </div>
            </header>

            {/* Accounts Section */}
            {accounts.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '30px' }}>
                    {accounts.map(acc => (
                        <Card key={acc.id} style={{ borderLeft: `4px solid ${acc.color || '#3b82f6'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{acc.name}</h3>
                                    <span style={{ fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>{acc.type}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{formatRupiah(acc.balance)}</div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Account Modal/Form */}
            {showAddAccount && (
                <Card title="Add New Account" style={{ marginBottom: '20px', border: '1px solid var(--accent-primary)' }}>
                    <form onSubmit={handleAddAccount} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input type="text" placeholder="Account Name (e.g. DANA)" value={accountForm.name} onChange={e => setAccountForm({ ...accountForm, name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #333' }} />
                        <select value={accountForm.type} onChange={e => setAccountForm({ ...accountForm, type: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #333' }}>
                            <option value="BANK">Bank</option>
                            <option value="WALLET">E-Wallet</option>
                            <option value="CASH">Cash</option>
                        </select>
                        <input type="number" placeholder="Initial Balance" value={accountForm.balance} onChange={e => setAccountForm({ ...accountForm, balance: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #333' }} />
                        <button type="submit" style={{ padding: '10px', borderRadius: '8px', background: 'var(--success)', color: 'white', border: 'none', fontWeight: 'bold' }}>Save Account</button>
                    </form>
                </Card>
            )}

            {/* Add Expense Form */}
            {showAddExpense && (
                <Card title="Add Expense" style={{ marginBottom: '20px', border: '1px solid var(--danger)' }}>
                    <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input type="text" placeholder="Description (e.g. Nasi Goreng)" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #333' }} />
                        <input type="number" placeholder="Amount" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #333' }} />
                        <select value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #333' }}>
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Bills">Bills</option>
                            <option value="Other">Other</option>
                        </select>
                        {accounts.length > 0 && (
                            <select value={expenseForm.accountId} onChange={e => setExpenseForm({ ...expenseForm, accountId: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #333' }}>
                                <option value="">Select Payment Source (Optional)</option>
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({formatRupiah(acc.balance)})</option>)}
                            </select>
                        )}
                        <button type="submit" style={{ padding: '10px', borderRadius: '8px', background: 'var(--danger)', color: 'white', border: 'none', fontWeight: 'bold' }}>Save Expense</button>
                    </form>
                </Card>
            )}

            {/* Charts Section - Restored */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <Card title="Spending Trends">
                    <div style={{ height: '250px' }}>
                        <ExpenseLineChart data={chartData} />
                    </div>
                </Card>
                <Card title="Expenses by Category">
                    <div style={{ height: '250px' }}>
                        <CategoryPieChart data={categoryData} />
                    </div>
                </Card>
            </div>

            {/* Existing Dashboard Components */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '30px' }}>
                <Card>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Today</p>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--warning)' }}>{formatRupiah(todayTotal)}</h2>
                </Card>
                <Card>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Daily Budget</p>
                    <BudgetProgressBar spent={todayTotal} budget={state.dailyBudget} period="daily" />
                </Card>
            </div>

            {/* Transactions History */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '20px' }}>Recent Transactions</h2>
            {Object.entries(groupedExpenses).slice(0, 5).map(([date, expenses]) => (
                <Card key={date} title={date} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {expenses.map(expense => (
                            <div key={expense.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{expense.description || expense.category}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{expense.category}</div>
                                    {expense.accountName && <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>via {expense.accountName}</div>}
                                </div>
                                <div style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{formatRupiah(expense.amount)}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            ))}
        </main>
    );
}
