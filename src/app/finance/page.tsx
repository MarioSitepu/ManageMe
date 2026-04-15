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
    const { state, addAccount, updateAccount, deleteAccount, addExpense, deleteExpense, updateDailyBudget } = useGlobal();
    const [tab, setTab] = useState<Tab>('overview');
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [budgetInput, setBudgetInput] = useState(state.dailyBudget.toString());
    const [expenseForm, setExpenseForm] = useState({ type: 'expense', amount: '', category: 'Food', description: '', accountId: '' });
    const [accountForm, setAccountForm] = useState({ name: '', type: 'BANK', balance: '', color: '#3b82f6' });
    const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
    const [editAccountForm, setEditAccountForm] = useState({ name: '', balance: '' });
    const [isDetecting, setIsDetecting] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        autoProcessImage(file);
    };

    const autoProcessImage = async (file: File) => {
        setIsDetecting(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const res = await fetch('/api/expenses/detect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64 })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.amount && data.description) {
                        // AUTO SAVE
                        await addExpense(
                            parseFloat(data.amount),
                            data.category || 'Other',
                            data.description,
                            '', // accountId
                            'expense'
                        );
                        // Success toast equivalent
                        alert(`✨ Auto-Saved: ${data.description} (Rp ${parseFloat(data.amount).toLocaleString('id-ID')})`);
                    } else {
                        // Partial data, pre-fill and show form
                        setExpenseForm(prev => ({
                            ...prev,
                            amount: data.amount?.toString() || prev.amount,
                            description: data.description || prev.description,
                            category: data.category || prev.category
                        }));
                        setShowAddExpense(true);
                    }
                } else {
                    const err = await res.json();
                    alert(err.error || 'Gagal mendeteksi gambar. Coba lagi atau isi manual.');
                }
                setIsDetecting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Detection error:', error);
            setIsDetecting(false);
            alert('Terjadi kesalahan saat mendeteksi.');
        }
    };

    // Global Listeners for Paste/Drop
    React.useEffect(() => {
        const onPaste = (e: ClipboardEvent) => {
            const item = e.clipboardData?.items[0];
            if (item?.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) autoProcessImage(file);
            }
        };

        const onDrop = (e: DragEvent) => {
            e.preventDefault();
            const file = e.dataTransfer?.files?.[0];
            if (file?.type.startsWith('image/')) {
                autoProcessImage(file);
            }
        };

        const onDragOver = (e: DragEvent) => e.preventDefault();

        window.addEventListener('paste', onPaste);
        window.addEventListener('drop', onDrop);
        window.addEventListener('dragover', onDragOver);

        return () => {
            window.removeEventListener('paste', onPaste);
            window.removeEventListener('drop', onDrop);
            window.removeEventListener('dragover', onDragOver);
        };
    }, []);

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
        await addExpense(parseFloat(expenseForm.amount), expenseForm.category, expenseForm.description, expenseForm.accountId, expenseForm.type as 'expense' | 'income');
        setShowAddExpense(false);
        setExpenseForm({ type: 'expense', amount: '', category: 'Food', description: '', accountId: '' });
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
                    <div style={{ marginBottom: '15px' }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            style={{ width: '100%', border: '1px dashed rgba(255,255,255,0.2)', height: '40px' }}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isDetecting}
                        >
                            {isDetecting ? '⌛ Analyzing Receipt...' : '📸 Scan Receipt / Screenshot'}
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <select value={expenseForm.type} onChange={e => setExpenseForm({ ...expenseForm, type: e.target.value })}>
                                <option value="expense">Pengeluaran</option>
                                <option value="income">Pemasukan</option>
                            </select>
                            <input type="number" placeholder="Amount (Rp)" value={expenseForm.amount}
                                onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                        </div>
                        <input placeholder="Description (e.g. Nasi Goreng, Gaji)" value={expenseForm.description}
                            onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
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
                                <div key={exp.id} className="list-item" style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                        background: CATEGORY_COLORS[exp.category] || '#64748b'
                                    }} />
                                    <div style={{ flex: 1, minWidth: 0, paddingLeft: '8px' }}>
                                        <p style={{ fontWeight: 500, color: 'var(--text)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {exp.description || exp.category}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {exp.category}{exp.accountName ? ` • ${exp.accountName}` : ''}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontWeight: 600, color: exp.type === 'income' ? 'var(--success)' : 'var(--danger)', fontSize: '0.9rem', flexShrink: 0 }}>
                                            {exp.type === 'income' ? '+' : '-'}{formatRupiah(exp.amount)}
                                        </span>
                                        <button
                                            onClick={() => deleteExpense(exp.id)}
                                            style={{
                                                background: 'none', border: 'none', color: 'var(--danger)',
                                                cursor: 'pointer', fontSize: '1rem', padding: '4px', opacity: 0.7
                                            }}
                                            title="Delete transaction"
                                        >
                                            🗑️
                                        </button>
                                    </div>
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
                            {editingAccountId === acc.id ? (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input value={editAccountForm.name} onChange={e => setEditAccountForm({ ...editAccountForm, name: e.target.value })} style={{ flex: 1 }} placeholder="Name" />
                                    <input type="number" value={editAccountForm.balance} onChange={e => setEditAccountForm({ ...editAccountForm, balance: e.target.value })} style={{ width: '100px' }} placeholder="Balance" />
                                    <Button size="sm" variant="success" onClick={() => {
                                        updateAccount(acc.id, { name: editAccountForm.name, balance: parseFloat(editAccountForm.balance) });
                                        setEditingAccountId(null);
                                    }}>Save</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingAccountId(null)}>Cancel</Button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ fontWeight: 600, color: 'var(--text)' }}>{acc.name}</p>
                                        <span className="badge badge-muted" style={{ marginTop: '4px' }}>{acc.type}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)' }}>
                                            {formatRupiah(acc.balance)}
                                        </p>
                                        <button onClick={() => { setEditingAccountId(acc.id); setEditAccountForm({ name: acc.name, balance: acc.balance.toString() }) }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }} title="Edit Account">✏️</button>
                                        <button onClick={() => { if (window.confirm('Hapus akun ini? Transaksi yang menggunakan akun ini akan tetap ada namun tidak lagi terkait dengan akun ini.')) deleteAccount(acc.id) }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px', opacity: 0.8 }} title="Delete Account">🗑️</button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </main>
    );
}
