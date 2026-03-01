import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = session.userId;
        const body = await request.json();
        const { phoneNumber, notificationSettings, habitMorningTime } = body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                phoneNumber: phoneNumber !== undefined ? phoneNumber : undefined,
                notificationsEnabled: notificationSettings?.enabled,
                classReminders: notificationSettings?.classReminders,
                dailySummary: notificationSettings?.dailySummary,
                streakAlerts: notificationSettings?.streakAlerts,
                budgetWarnings: notificationSettings?.budgetWarnings,
                habitMorningTime: habitMorningTime !== undefined ? habitMorningTime : undefined,
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Failed to update settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
