import { NextResponse } from 'next/server';
import { prisma, handleDatabaseError } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET analytics data for expenses
export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = session.userId;

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
        const startDate = new Date(startDateStr);
        startDate.setDate(startDate.getDate() - days);

        // Get expenses within date range
        const expenses = await prisma.expense.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                },
            },
            orderBy: { date: 'asc' },
        });

        // Calculate totals
        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Group by category
        const byCategory = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {} as Record<string, number>);

        // Group by date for trend analysis
        const byDate = expenses.reduce((acc, exp) => {
            const dateKey = exp.date.toISOString().split('T')[0];
            acc[dateKey] = (acc[dateKey] || 0) + exp.amount;
            return acc;
        }, {} as Record<string, number>);

        // Calculate daily average
        const avgPerDay = totalSpent / Math.max(days, 1);

        // Find highest category
        const highestCategory = Object.entries(byCategory).sort(
            ([, a], [, b]) => b - a
        )[0];

        return NextResponse.json({
            totalSpent,
            avgPerDay,
            byCategory,
            byDate,
            highestCategory: highestCategory ? {
                name: highestCategory[0],
                amount: highestCategory[1],
            } : null,
            expenseCount: expenses.length,
        });
    } catch (error) {
        const dbError = handleDatabaseError(error);
        return NextResponse.json(dbError, { status: 500 });
    }
}
