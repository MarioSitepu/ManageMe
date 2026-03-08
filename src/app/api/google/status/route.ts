import { NextResponse } from 'next/server';
import { isGoogleCalendarConnected } from '@/lib/googleCalendar';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ connected: false, error: 'Unauthorized' }, { status: 401 });

        const connected = await isGoogleCalendarConnected(session.userId);
        return NextResponse.json({
            connected,
            authUrl: connected ? null : '/api/google/auth',
            message: connected
                ? 'Google Calendar is connected'
                : 'Google Calendar not connected. Visit /api/google/auth to connect.'
        });
    } catch (error) {
        return NextResponse.json({ connected: false, error: 'Failed to check status' }, { status: 500 });
    }
}
