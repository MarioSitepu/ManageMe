import { NextResponse } from 'next/server';
import { isGoogleCalendarConnected } from '@/lib/googleCalendar';

export async function GET() {
    try {
        const connected = await isGoogleCalendarConnected('default-user');
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
