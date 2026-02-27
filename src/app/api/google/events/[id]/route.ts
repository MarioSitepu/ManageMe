import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAuthClientForUser } from '@/lib/googleCalendar';

// Update a Google Calendar event by its gcal event ID
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const googleEventId = params.id;
        const body = await request.json();
        const { title, startTime, endTime, date, day, isRecurring, description, location, type } = body;

        const auth = await getAuthClientForUser('default-user');
        const calendar = google.calendar({ version: 'v3', auth });

        // Build the event date
        const rruleDayMap: Record<string, string> = {
            'Sunday': 'SU', 'Monday': 'MO', 'Tuesday': 'TU',
            'Wednesday': 'WE', 'Thursday': 'TH', 'Friday': 'FR', 'Saturday': 'SA'
        };

        const pad = (n: number) => n.toString().padStart(2, '0');
        const toLocalDT = (d: Date) =>
            `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

        let eventDate: Date;
        if (date) {
            eventDate = new Date(date);
        } else if (day) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const target = days.indexOf(day);
            const curr = new Date().getDay();
            let diff = (target - curr + 7) % 7;
            if (diff === 0) diff = 7;
            eventDate = new Date();
            eventDate.setDate(eventDate.getDate() + diff);
        } else {
            eventDate = new Date();
        }

        const [sh, sm] = startTime.split(':').map(Number);
        const startDT = new Date(eventDate);
        startDT.setHours(sh, sm, 0, 0);

        let endDT: Date;
        if (endTime) {
            const [eh, em] = endTime.split(':').map(Number);
            endDT = new Date(eventDate);
            endDT.setHours(eh, em, 0, 0);
        } else {
            endDT = new Date(startDT);
            endDT.setHours(endDT.getHours() + 1);
        }

        const googleEvent: any = {
            summary: title,
            description: description || undefined,
            location: location || undefined,
            start: { dateTime: toLocalDT(startDT), timeZone: 'Asia/Jakarta' },
            end: { dateTime: toLocalDT(endDT), timeZone: 'Asia/Jakarta' },
        };

        if (isRecurring && day && rruleDayMap[day]) {
            googleEvent.recurrence = [`RRULE:FREQ=WEEKLY;BYDAY=${rruleDayMap[day]}`];
        }

        await calendar.events.update({
            calendarId: 'primary',
            eventId: googleEventId,
            requestBody: googleEvent,
        });

        return NextResponse.json({ success: true, message: 'Event updated in Google Calendar' });
    } catch (error: any) {
        console.error('Update Google Calendar event error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Delete a Google Calendar event
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const googleEventId = params.id;
        const auth = await getAuthClientForUser('default-user');
        const calendar = google.calendar({ version: 'v3', auth });

        await calendar.events.delete({
            calendarId: 'primary',
            eventId: googleEventId,
        });

        return NextResponse.json({ success: true, message: 'Event deleted from Google Calendar' });
    } catch (error: any) {
        console.error('Delete Google Calendar event error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
