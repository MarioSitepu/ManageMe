import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { syncEventToGoogle } from '@/lib/googleCalendar';
import { getSession } from '@/lib/auth';

export async function POST() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = session.userId;

        // Get all events without googleEventId for THIS user
        const events = await prisma.event.findMany({
            where: { googleEventId: null, userId },
        });

        let synced = 0;
        let failed = 0;

        for (const event of events) {
            const googleId = await syncEventToGoogle(event.id, userId);
            if (googleId) synced++;
            else failed++;
        }

        return NextResponse.json({
            success: true,
            synced,
            failed,
            message: `Synced ${synced} events to Google Calendar. ${failed > 0 ? `${failed} failed.` : ''}`
        });
    } catch (error: any) {
        console.error('Sync error:', error);
        return NextResponse.json({
            error: error.message || 'Sync failed',
            hint: error.message?.includes('not connected')
                ? 'Visit /api/google/auth to connect Google Calendar first'
                : undefined
        }, { status: 500 });
    }
}
