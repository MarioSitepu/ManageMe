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
        const { amount, category } = body;

        const existing = await prisma.expense.findUnique({ where: { id } });
        if (!existing || existing.userId !== session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const expense = await prisma.expense.update({
            where: { id },
            data: {
                ...(amount && { amount: parseFloat(amount) }),
                ...(category && { category }),
            },
        });

        return NextResponse.json(expense);
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

        await prisma.expense.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        const dbError = handleDatabaseError(error);
        return NextResponse.json(dbError, { status: 500 });
    }
}
