import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/db';
import { getAuthClientForUser } from '@/lib/googleCalendar';
import { getSession } from '@/lib/auth';

// Pull events from Google Calendar → save to local DB
export async function POST(request: Request) {
    try {
        const session = await getSession();
        let requestBody = {};
        try { requestBody = await request.json(); } catch (e) { }
        const userId = session?.userId || (requestBody as any).userId;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const auth = await getAuthClientForUser(userId);
        const calendar = google.calendar({ version: 'v3', auth });

        // Fetch events from Google Calendar (next 30 days)
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + 30);

        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: now.toISOString(),
            timeMax: future.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 100,
        });

        const gEvents = res.data.items || [];
        let created = 0;
        let updated = 0;
        let skipped = 0;

        for (const gEvent of gEvents) {
            if (!gEvent.id || !gEvent.summary) { skipped++; continue; }

            // Parse time
            const startStr = gEvent.start?.dateTime || gEvent.start?.date;
            if (!startStr) { skipped++; continue; }

            const startDate = new Date(startStr);
            const startTime = gEvent.start?.dateTime
                ? startDate.toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })
                : '00:00';

            let endTime: string | undefined;
            if (gEvent.end?.dateTime) {
                const endDate = new Date(gEvent.end.dateTime);
                endTime = endDate.toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' });
            }

            const dayName = startDate.toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta', weekday: 'long' });
            const isRecurring = !!(gEvent.recurrence && gEvent.recurrence.length > 0);

            // Determine event type from Google Calendar color/description
            const title = gEvent.summary.toLowerCase();
            let type = 'personal';
            if (title.includes('kelas') || title.includes('class') || title.includes('kuliah')) type = 'class';
            else if (title.includes('ujian') || title.includes('exam') || title.includes('test')) type = 'exam';
            else if (title.includes('meeting') || title.includes('rapat')) type = 'meeting';
            else if (title.includes('tugas') || title.includes('assignment')) type = 'assignment';
            else if (title.includes('belajar') || title.includes('study')) type = 'study';

            // Check if already synced (exists in local DB by googleEventId)
            const existing = await prisma.event.findFirst({
                where: { googleEventId: gEvent.id }
            });

            if (existing) {
                await prisma.event.update({
                    where: { id: existing.id },
                    data: {
                        title: gEvent.summary,
                        type,
                        startTime,
                        endTime,
                        day: isRecurring ? dayName : dayName,
                        date: gEvent.start?.date ? new Date(gEvent.start.date) : null,
                        isRecurring,
                        recurringPattern: isRecurring ? 'weekly' : null,
                        description: gEvent.description || null,
                        location: gEvent.location || null,
                    }
                });
                updated++;
                continue;
            }

            await prisma.event.create({
                data: {
                    title: gEvent.summary,
                    type,
                    startTime,
                    endTime,
                    day: isRecurring ? dayName : dayName,
                    date: gEvent.start?.date ? new Date(gEvent.start.date) : null,
                    isRecurring,
                    recurringPattern: isRecurring ? 'weekly' : null,
                    description: gEvent.description || null,
                    location: gEvent.location || null,
                    googleEventId: gEvent.id,
                    userId: userId,
                }
            });
            created++;
        }

        return NextResponse.json({
            success: true,
            message: `Pulled ${created} new events, updated ${updated} events. ${skipped} skipped.`,
            created,
            updated,
            skipped
        });
    } catch (error: any) {
        console.error('Google Calendar pull error:', error);
        return NextResponse.json({
            error: error.message || 'Pull failed',
            hint: error.message?.includes('not connected')
                ? 'Visit /api/google/auth to connect Google Calendar first'
                : undefined
        }, { status: 500 });
    }
}

// GET — quick status check
export async function GET() {
    return NextResponse.json({
        message: 'Use POST to pull events from Google Calendar to local DB',
        endpoint: '/api/google/pull'
    });
}
