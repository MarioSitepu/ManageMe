import { NextResponse } from 'next/server';
import { prisma, handleDatabaseError } from '@/lib/db';

// UPDATE expense
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { amount, category } = body;

        const expense = await prisma.expense.update({
            where: { id: params.id },
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
    { params }: { params: { id: string } }
) {
    try {
        await prisma.expense.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        const dbError = handleDatabaseError(error);
        return NextResponse.json(dbError, { status: 500 });
    }
}
