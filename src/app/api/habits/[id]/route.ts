import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { id } = await params;
        const body = await request.json();
        const { completed, text, reminderTime } = body;

        const updateData: any = {};
        if (completed !== undefined) {
            updateData.completed = completed;
            updateData.lastCompletedDate = completed ? new Date() : null;
        }
        if (text !== undefined) updateData.text = text;
        if (reminderTime !== undefined) updateData.reminderTime = reminderTime;

        const existing = await prisma.habit.findUnique({ where: { id } });
        if (!existing || existing.userId !== session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const habit = await prisma.habit.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(habit);
    } catch (error) {
        console.error('Failed to update habit:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { id } = await params;

        const existing = await prisma.habit.findUnique({ where: { id } });
        if (!existing || existing.userId !== session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await prisma.habit.delete({
            where: { id },
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Failed to delete habit:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
