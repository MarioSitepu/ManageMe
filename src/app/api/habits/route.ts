import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = session.userId;
        const { searchParams } = new URL(request.url);

        const habits = await prisma.habit.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });

        // Reset logic: if it's a new day, set completed = false
        const now = new Date();
        const todayStr = now.toDateString();

        let needsRefetch = false;

        for (const habit of habits) {
            if (habit.completed && habit.lastCompletedDate) {
                const completedDateStr = new Date(habit.lastCompletedDate).toDateString();
                if (completedDateStr !== todayStr) {
                    await prisma.habit.update({
                        where: { id: habit.id },
                        data: { completed: false }
                    });
                    needsRefetch = true;
                }
            }
        }

        if (needsRefetch) {
            const updatedHabits = await prisma.habit.findMany({
                where: { userId },
                orderBy: { createdAt: 'asc' },
            });
            return NextResponse.json(updatedHabits);
        }

        return NextResponse.json(habits);
    } catch (error) {
        console.error('Failed to fetch habits:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = session.userId;
        const body = await request.json();
        const { text, reminderTime } = body;

        if (!text || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const habit = await prisma.habit.create({
            data: {
                text,
                reminderTime: reminderTime || null,
                userId
            }
        });

        return NextResponse.json(habit, { status: 201 });
    } catch (error) {
        console.error('Failed to create habit:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
