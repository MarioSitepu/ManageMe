import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAuthClientForUser } from '@/lib/googleCalendar';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Debug endpoint to test Google Calendar connection
export async function GET() {
    // Only allow in development or if explicitly enabled
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG !== 'true') {
        return NextResponse.json({ error: 'Debug mode disabled in production' }, { status: 403 });
    }

    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Check if user has tokens stored
        const user = await prisma.user.findUnique({ where: { id: session.userId } });
        if (!user) {
            return NextResponse.json({ error: 'No user found in database' }, { status: 404 });
        }

        const userAny = user as any;
        const hasTokens = !!(userAny.googleAccessToken && userAny.googleRefreshToken);

        if (!hasTokens) {
            return NextResponse.json({
                error: 'Google Calendar not connected',
                hint: 'Visit /api/google/auth to connect',
                userFields: Object.keys(user)
            }, { status: 400 });
        }

        // Try to fetch calendar list
        const auth = await getAuthClientForUser(session.userId);
        const calendar = google.calendar({ version: 'v3', auth });

        const calList = await calendar.calendarList.list();
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + 7);

        const events = await calendar.events.list({
            calendarId: 'primary',
            timeMin: now.toISOString(),
            timeMax: future.toISOString(),
            singleEvents: true,
            maxResults: 5,
        });

        return NextResponse.json({
            status: 'connected',
            tokenPresent: true,
            calendars: calList.data.items?.map(c => c.summary),
            upcomingEvents: events.data.items?.map(e => ({
                summary: e.summary,
                start: e.start?.dateTime || e.start?.date
            })),
            totalEvents: events.data.items?.length || 0
        });
    } catch (error: any) {
        const status = error?.response?.status || error?.status;
        const message = error?.response?.data?.error?.message || error?.message;
        return NextResponse.json({
            error: message,
            status,
            hint: status === 403
                ? 'Enable Google Calendar API at console.cloud.google.com → APIs & Services → Library'
                : status === 401
                    ? 'Token expired. Visit /api/google/auth to reconnect'
                    : 'Unknown error'
        }, { status: status || 500 });
    }
}
