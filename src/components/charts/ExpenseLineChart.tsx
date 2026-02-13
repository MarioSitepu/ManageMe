"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ExpenseLineChartProps {
    data: { date: string; amount: number }[];
}

export function ExpenseLineChart({ data }: ExpenseLineChartProps) {
    return (
        <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.5)"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.5)"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(139, 92, 246, 0.5)',
                            borderRadius: '8px',
                            color: 'white'
                        }}
                        formatter={(value: number) => [
                            new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                maximumFractionDigits: 0
                            }).format(value),
                            'Amount'
                        ]}
                    />
                    <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                    <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Daily Spending"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
