import { NextResponse } from 'next/server';
import { prisma, handleDatabaseError } from '@/lib/db';
import { getSession } from '@/lib/auth';

// UPDATE expense
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { id } = await params;
        const body = await request.json();
        const { amount, category, type } = body;
        const existing = await prisma.expense.findUnique({ where: { id } });
        if (!existing || existing.userId !== session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let balanceChange = 0;
        const newType = type || existing.type;
        const newAmount = amount !== undefined ? parseFloat(amount) : existing.amount;

        const oldEffect = existing.type === 'income' ? existing.amount : -existing.amount;
        const newEffect = newType === 'income' ? newAmount : -newAmount;
        balanceChange = newEffect - oldEffect;

        // Perform atomic update inside transaction
        const updatedExpense = await prisma.$transaction(async (tx) => {
            const exp = await tx.expense.update({
                where: { id },
                data: {
                    ...(amount !== undefined && { amount: newAmount }),
                    ...(category && { category }),
                    ...(type && { type: newType }),
                },
            });

            if (existing.accountId && balanceChange !== 0) {
                await tx.account.update({
                    where: { id: existing.accountId },
                    data: { balance: { increment: balanceChange } }
                });
            }
            return exp;
        });

        return NextResponse.json(updatedExpense);
    } catch (error) {
        const dbError = handleDatabaseError(error);
        return NextResponse.json(dbError, { status: 500 });
    }
}

// DELETE expense
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { id } = await params;

        const existing = await prisma.expense.findUnique({ where: { id } });
        if (!existing || existing.userId !== session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await prisma.$transaction(async (tx) => {
            await tx.expense.delete({
                where: { id },
            });

            if (existing.accountId) {
                const reverseEffect = existing.type === 'income' ? -existing.amount : existing.amount;
                await tx.account.update({
                    where: { id: existing.accountId },
                    data: {
                        balance: { increment: reverseEffect }
                    }
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        const dbError = handleDatabaseError(error);
        return NextResponse.json(dbError, { status: 500 });
    }
}
