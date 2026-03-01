import { google } from 'googleapis';
import { prisma } from '@/lib/db';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/google/callback`
    : 'http://localhost:3000/api/google/callback';

export function createOAuth2Client() {
    return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);
}

export function getAuthUrl(): string {
    const oauth2Client = createOAuth2Client();
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ],
    });
}

export async function getAuthClientForUser(userId: string) {
    const user = await prisma.user.findFirst({ where: { id: userId === 'default-user' ? undefined : userId } })
        ?? await prisma.user.findFirst();

    if (!user?.googleAccessToken || !user?.googleRefreshToken) {
        throw new Error('Google Calendar not connected. Visit /api/google/auth to connect.');
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
        expiry_date: user.googleTokenExpiry?.getTime(),
    });

    // Auto-refresh token if expired
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.access_token) {
            await prisma.user.updateMany({
                where: { googleRefreshToken: user.googleRefreshToken! },
                data: {
                    googleAccessToken: tokens.access_token,
                    googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                },
            });
        }
    });

    return oauth2Client;
}

export async function isGoogleCalendarConnected(userId: string): Promise<boolean> {
    try {
        const user = await prisma.user.findFirst();
        return !!(user?.googleAccessToken && user?.googleRefreshToken);
    } catch {
        return false;
    }
}

// Helper: format Date to "YYYY-MM-DDTHH:MM:SS" without timezone conversion
function toLocalDateTimeString(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

// Convert local event to Google Calendar event format
function toGoogleEvent(event: {
    title: string;
    type: string;
    startTime: string;
    endTime?: string | null;
    day?: string | null;
    date?: Date | null;
    description?: string | null;
    location?: string | null;
    isRecurring?: boolean;
}) {
    const today = new Date();
    let eventDate: Date;

    if (event.date) {
        eventDate = new Date(event.date);
    } else if (event.day) {
        // Find next occurrence of this weekday
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDay = days.indexOf(event.day);
        const currentDay = today.getDay();
        let daysUntil = (targetDay - currentDay + 7) % 7;

        // If it's today but we've passed the start time, schedule for next week
        if (daysUntil === 0 && event.startTime) {
            const [h, m] = event.startTime.split(':').map(Number);
            const eventMoment = new Date(today);
            eventMoment.setHours(h, m, 0, 0);
            if (eventMoment <= today) daysUntil = 7;
        }

        eventDate = new Date(today);
        eventDate.setDate(today.getDate() + daysUntil);
    } else {
        eventDate = today;
    }

    const [startHour, startMin] = event.startTime.split(':').map(Number);
    const startDateTime = new Date(eventDate);
    startDateTime.setHours(startHour, startMin, 0, 0);

    let endDateTime: Date;
    if (event.endTime) {
        const [endHour, endMin] = event.endTime.split(':').map(Number);
        endDateTime = new Date(eventDate);
        endDateTime.setHours(endHour, endMin, 0, 0);
    } else {
        // Default: 1 hour duration
        endDateTime = new Date(startDateTime);
        endDateTime.setHours(endDateTime.getHours() + 1);
    }

    // Map RRULE day codes correctly
    const rruleDayMap: Record<string, string> = {
        'Sunday': 'SU', 'Monday': 'MO', 'Tuesday': 'TU',
        'Wednesday': 'WE', 'Thursday': 'TH', 'Friday': 'FR', 'Saturday': 'SA'
    };

    // Type emoji for description
    const typeEmoji: Record<string, string> = {
        'class': '📚', 'exam': '📝', 'meeting': '💼',
        'assignment': '📋', 'study': '🔖', 'personal': '🗓️'
    };

    const googleEvent: any = {
        summary: event.title,
        description: `${typeEmoji[event.type] || '📌'} ${event.type.charAt(0).toUpperCase() + event.type.slice(1)} | Added via TrackMe${event.description ? `\n\n${event.description}` : ''}`,
        location: event.location || undefined,
        start: {
            // Use local datetime string + explicit timezone (avoids UTC conversion bug)
            dateTime: toLocalDateTimeString(startDateTime),
            timeZone: 'Asia/Jakarta',
        },
        end: {
            dateTime: toLocalDateTimeString(endDateTime),
            timeZone: 'Asia/Jakarta',
        },
    };

    // Add weekly recurrence for recurring events
    if (event.isRecurring && event.day && rruleDayMap[event.day]) {
        googleEvent.recurrence = [`RRULE:FREQ=WEEKLY;BYDAY=${rruleDayMap[event.day]}`];
    }

    return googleEvent;
}

// Sync a local event to Google Calendar
export async function syncEventToGoogle(
    eventId: string,
    userId: string
): Promise<string | null> {
    try {
        const auth = await getAuthClientForUser(userId);
        const calendar = google.calendar({ version: 'v3', auth });

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return null;

        const googleEvent = toGoogleEvent(event);
        const calendarId = 'primary';

        if (event.googleEventId) {
            // Update existing event
            await calendar.events.update({
                calendarId,
                eventId: event.googleEventId,
                requestBody: googleEvent,
            });
            return event.googleEventId;
        } else {
            // Create new event
            const res = await calendar.events.insert({
                calendarId,
                requestBody: googleEvent,
            });
            const googleEventId = res.data.id!;
            await prisma.event.update({
                where: { id: eventId },
                data: { googleEventId },
            });
            return googleEventId;
        }
    } catch (error) {
        console.error('Sync to Google Calendar failed:', error);
        return null;
    }
}

// Delete event from Google Calendar
export async function deleteEventFromGoogle(
    googleEventId: string,
    userId: string
): Promise<void> {
    try {
        const auth = await getAuthClientForUser(userId);
        const calendar = google.calendar({ version: 'v3', auth });
        await calendar.events.delete({ calendarId: 'primary', eventId: googleEventId });
    } catch (error) {
        console.error('Delete from Google Calendar failed:', error);
    }
}

// Get upcoming events from Google Calendar (next N days)
export async function getUpcomingFromGoogle(userId: string, days: number = 7): Promise<string> {
    try {
        const auth = await getAuthClientForUser(userId);
        const calendar = google.calendar({ version: 'v3', auth });

        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + days);

        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: now.toISOString(),
            timeMax: future.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 20,
        });

        const events = res.data.items;
        if (!events || events.length === 0) {
            return `📅 *Google Calendar (${days} hari ke depan)*\n\nTidak ada event. Santai! 😊`;
        }

        let msg = `📅 *Google Calendar (${days} hari ke depan)*\n\n`;
        for (const e of events) {
            const start = e.start?.dateTime || e.start?.date || '';
            const startDate = new Date(start);
            const dateStr = startDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
            const timeStr = e.start?.dateTime
                ? startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                : 'Seharian';
            msg += `📌 *${e.summary}*\n   📅 ${dateStr} 🕐 ${timeStr}\n\n`;
        }
        return msg;
    } catch (error: any) {
        console.error('Get upcoming from Google failed:', error);

        if (error.message?.includes('not connected')) {
            return `❌ Google Calendar belum terhubung.\nKunjungi: /api/google/auth untuk menghubungkan.`;
        }

        // Google API specific errors
        const status = error?.response?.status || error?.status;
        const message = error?.response?.data?.error?.message || error?.message || 'Unknown error';

        if (status === 403) {
            return `❌ *Akses ditolak (403)*\n\nKemungkinan penyebab:\n1. Google Calendar API belum diaktifkan\n   → Buka: console.cloud.google.com → APIs & Services → Library → cari "Google Calendar API" → Enable\n\n2. Scope tidak cukup → coba reconnect di /api/google/auth`;
        }
        if (status === 401 || status === 400) {
            return `❌ *Sesi Google Calendar berakhir atau token tidak valid (${status})*\n\n(Catatan: Jika aplikasi Google OAuth berstatus "Testing", token akan otomatis expired dalam 7 hari).\n\nSilakan reconnect ulang di:\n🌐 ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/google/auth`;
        }

        return `❌ Gagal mengambil data Google Calendar.\nError: ${message}\nStatus: ${status || 'unknown'}`;
    }
}

