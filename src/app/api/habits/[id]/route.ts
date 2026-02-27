import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { completed, text, reminderTime } = body;

        const updateData: any = {};
        if (completed !== undefined) {
            updateData.completed = completed;
            updateData.lastCompletedDate = completed ? new Date() : null;
        }
        if (text !== undefined) updateData.text = text;
        if (reminderTime !== undefined) updateData.reminderTime = reminderTime;

        const habit = await prisma.habit.update({
            where: { id: params.id },
            data: updateData
        });

        return NextResponse.json(habit);
    } catch (error) {
        console.error('Failed to update habit:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.habit.delete({
            where: { id: params.id }
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Failed to delete habit:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
