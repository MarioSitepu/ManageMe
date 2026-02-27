import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, phoneNumber, notificationSettings, habitMorningTime } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

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
