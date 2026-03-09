import { NextResponse } from 'next/server';
import { prisma, handleDatabaseError } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { id } = await params;
        const body = await request.json();
        const { name, type, balance, color } = body;

        const existing = await prisma.account.findUnique({ where: { id } });
        if (!existing || existing.userId !== session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const account = await prisma.account.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(type && { type }),
                ...(balance !== undefined && { balance: parseFloat(balance) }),
                ...(color && { color }),
            },
        });

        return NextResponse.json(account);
    } catch (error) {
        const dbError = handleDatabaseError(error);
        return NextResponse.json(dbError, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { id } = await params;

        const existing = await prisma.account.findUnique({ where: { id } });
        if (!existing || existing.userId !== session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await prisma.$transaction(async (tx) => {
            // Unlink expenses to avoid foreign key violation
            await tx.expense.updateMany({
                where: { accountId: id },
                data: { accountId: null }
            });

            // Delete the account
            await tx.account.delete({
                where: { id },
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        const dbError = handleDatabaseError(error);
        return NextResponse.json(dbError, { status: 500 });
    }
}
