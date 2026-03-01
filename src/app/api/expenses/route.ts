import { NextResponse } from 'next/server';
import { prisma, handleDatabaseError } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = session.userId;
        const { searchParams } = new URL(request.url);

        // Include account details
        const expenses = await prisma.expense.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            include: {
                account: {
                    select: { name: true, type: true }
                }
            }
        });

        return NextResponse.json(expenses);
    } catch (error) {
        const dbError = handleDatabaseError(error);
        return NextResponse.json(dbError, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = session.userId;
        const body = await request.json();
        const { amount, category, description, accountId } = body;

        if (!amount || !category || !description) {
            return NextResponse.json(
                { error: 'Amount, category and description are required' },
                { status: 400 }
            );
        }

        // If accountId is provided, we need to deduct the amount from the account balance
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Expense
            const expense = await tx.expense.create({
                data: {
                    amount: parseFloat(amount),
                    category,
                    description,
                    userId,
                    accountId,
                },
                include: {
                    account: {
                        select: { name: true }
                    }
                }
            });

            // 2. Update Account Balance (if applicable)
            if (accountId) {
                await tx.account.update({
                    where: { id: accountId },
                    data: {
                        balance: {
                            decrement: parseFloat(amount)
                        }
                    }
                });
            }

            return expense;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        const dbError = handleDatabaseError(error);
        return NextResponse.json(dbError, { status: 500 });
    }
}
