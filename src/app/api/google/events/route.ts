import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAuthClientForUser } from '@/lib/googleCalendar';

// Returns Google Calendar events in CalendarEvent format for the web app
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '60');

        const auth = await getAuthClientForUser('default-user');
        const calendar = google.calendar({ version: 'v3', auth });

        const now = new Date();
        // Start from beginning of current month
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const future = new Date();
        future.setDate(future.getDate() + days);

        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: start.toISOString(),
            timeMax: future.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 50,
        });

        const gEvents = res.data.items || [];

        // Convert Google Calendar events to CalendarEvent format
        const events = gEvents
            .filter(e => e.summary && (e.start?.dateTime || e.start?.date))
            .map(e => {
                const startStr = e.start?.dateTime || e.start?.date || '';
                const endStr = e.end?.dateTime || e.end?.date;
                const startDate = new Date(startStr);

                const startTime = e.start?.dateTime
                    ? startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    : '00:00';

                const endTime = endStr && e.end?.dateTime
                    ? new Date(endStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    : undefined;

                const dateStr = e.start?.date
                    ? e.start.date
                    : startDate.toISOString().split('T')[0];

                const dayName = startDate.toLocaleDateString('en-US', { weekday: 'long' });
                const isRecurring = !!(e.recurrence && e.recurrence.length > 0);

                // Determine type from title keywords
                const title = (e.summary || '').toLowerCase();
                let type = 'personal';
                if (title.includes('kelas') || title.includes('class') || title.includes('kuliah')) type = 'class';
                else if (title.includes('ujian') || title.includes('exam') || title.includes('test')) type = 'exam';
                else if (title.includes('meeting') || title.includes('rapat')) type = 'meeting';
                else if (title.includes('tugas') || title.includes('assignment') || title.includes('deadline')) type = 'assignment';
                else if (title.includes('belajar') || title.includes('study')) type = 'study';

                return {
                    id: `gcal_${e.id}`,  // Prefix to distinguish from local events
                    title: e.summary!,
                    type,
                    startTime,
                    endTime,
                    prepTimeMinutes: 0,
                    day: isRecurring ? dayName : undefined,
                    date: dateStr,
                    isRecurring,
                    description: e.description || undefined,
                    location: e.location || undefined,
                    fromGoogleCalendar: true,  // Flag for UI differentiation
                };
            });

        return NextResponse.json({ events, connected: true });
    } catch (error: any) {
        if (error.message?.includes('not connected')) {
            return NextResponse.json({ events: [], connected: false });
        }
        console.error('Google Calendar events fetch error:', error);
        return NextResponse.json({ events: [], connected: false, error: error.message });
    }
}
