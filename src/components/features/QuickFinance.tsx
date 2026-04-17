"use client";
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGlobal } from '@/lib/GlobalContext';
import { Camera, Plus, Zap, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const QuickFinance: React.FC = () => {
    const { state, addExpense } = useGlobal();
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [description, setDescription] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAdd = async () => {
        if (!amount || !category || !description) return;
        await addExpense(parseInt(amount), category, description);
        setAmount('');
        setDescription('');
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
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
                    setAmount(data.amount?.toString() || '');
                    setDescription(data.description || '');
                    setCategory(data.category || 'Other');
                } else {
                    const err = await res.json();
                    alert(err.error || 'Failed to analyze receipt.');
                }
                setIsDetecting(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Detection error:', error);
            setIsDetecting(false);
            alert('An error occurred while analyzing the image.');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const today = new Date().toDateString();
    const dailyTotal = state.expenses
        .filter(e => new Date(e.date).toDateString() === today)
        .reduce((acc, curr) => acc + curr.amount, 0);

    const percentUsed = Math.min((dailyTotal / state.dailyBudget) * 100, 100);
    const isOverBudget = dailyTotal > state.dailyBudget;

    return (
        <Card 
            title="Quick Finance" 
            subtitle="Snap or tap to track your spending"
            action={
                <Button size="sm" variant="ghost" onClick={() => router.push('/finance')}>
                    Full Stats <ChevronRight size={14} />
                </Button>
            }
        >
            <div className="flex flex-col gap-4">
                {/* AI Scan Button */}
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed cursor-pointer transition-all ${
                        isDetecting ? 'border-accent bg-accent-light animate-pulse' : 'border-border-hover hover:border-accent hover:bg-surface-2'
                    }`}
                >
                    {isDetecting ? (
                        <Zap size={18} className="text-accent animate-spin" />
                    ) : (
                        <Camera size={18} className="text-text-secondary" />
                    )}
                    <span className="text-sm font-medium">
                        {isDetecting ? 'Analyzing Receipt...' : 'Scan Receipt / Screenshot'}
                    </span>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange}
                    />
                </div>

                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Amount (Rp)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="glass-input flex-1"
                    />
                    <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="glass-input w-auto!"
                        style={{ paddingRight: '32px' }}
                    >
                        {['Food', 'Transport', 'Shop', 'Other'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <input
                    type="text"
                    placeholder="What did you buy?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="glass-input"
                />

                <Button variant="primary" onClick={handleAdd} disabled={!amount || !description || isDetecting} className="w-full">
                    <Plus size={18} /> Add Expense
                </Button>
            </div>

            <div className="mt-5 space-y-2">
                <div className="flex justify-between items-end">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Daily Spending</span>
                    <span className="text-sm font-bold text-text">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(dailyTotal)}
                        <span className="text-text-muted font-normal"> / {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(state.dailyBudget)}</span>
                    </span>
                </div>
                
                <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden border border-border">
                    <div 
                        className={`h-full transition-all duration-700 ease-out rounded-full ${isOverBudget ? 'bg-danger shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'bg-accent shadow-[0_0_12px_rgba(124,58,237,0.4)]'}`}
                        style={{ width: `${percentUsed}%` }}
                    />
                </div>

                {isOverBudget && (
                    <p className="text-[11px] text-danger flex items-center gap-1 animate-slide-in-up">
                        ⚠️ Limit reached. Consider saving for tomorrow!
                    </p>
                )}
            </div>
        </Card>
    );
};
