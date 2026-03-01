import { NextResponse } from 'next/server';
import { prisma, handleDatabaseError } from '@/lib/db';
import { getSession } from '@/lib/auth';

// UPDATE event
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { id } = await params;
        const body = await request.json();
        const {
            title,
            type,
            startTime,
            endTime,
            prepTimeMinutes,
            day,
            date,
            description,
            location,
            isRecurring,
            recurringPattern,
        } = body;

        const existing = await prisma.event.findUnique({ where: { id } });
        if (!existing || existing.userId !== session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const event = await prisma.event.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(type && { type }),
                ...(startTime && { startTime }),
                ...(endTime !== undefined && { endTime }),
                ...(prepTimeMinutes !== undefined && { prepTimeMinutes }),
                ...(day !== undefined && { day }),
                ...(date !== undefined && { date: date ? new Date(date) : null }),
                ...(description !== undefined && { description }),
                ...(location !== undefined && { location }),
                ...(isRecurring !== undefined && { isRecurring }),
                ...(recurringPattern !== undefined && { recurringPattern }),
            },
        });

        return NextResponse.json(event);
    } catch (error) {
        const dbError = handleDatabaseError(error);
        return NextResponse.json(dbError, { status: 500 });
    }
}

// DELETE event
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { id } = await params;

        const existing = await prisma.event.findUnique({ where: { id } });
        if (!existing || existing.userId !== session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await prisma.event.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        const dbError = handleDatabaseError(error);
        return NextResponse.json(dbError, { status: 500 });
    }
}
