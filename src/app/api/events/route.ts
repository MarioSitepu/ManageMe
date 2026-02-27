import { NextResponse } from 'next/server';
import { prisma, handleDatabaseError } from '@/lib/db';
import { syncEventToGoogle, isGoogleCalendarConnected } from '@/lib/googleCalendar';

// GET all events for a user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || 'default-user';
        const day = searchParams.get('day'); // Optional filter by day
        const date = searchParams.get('date'); // Optional filter by date

        // Build where clause
        const where: any = { userId };

        if (day) {
            // If filtering by day (e.g. "Monday"), getting recurring events for that day
            // OR one-off events that happen to be on a specific date corresponding to that day?
            // Usually, the frontend will request events for a specific view.
            // If we want "Monday" events, we want:
            // 1. Recurring events on "Monday"
            // 2. Specific date events that fallback to "Monday"? 
            // No, typically we query by date range.
            // But for "Weekly Schedule" view (generic), we just want recurring "Monday" events.
            where.day = day;
        }

        // Future: Range query for monthly view
        // if (startDate && endDate) { ... }

        const events = await prisma.event.findMany({
            where,
            orderBy: { startTime: 'asc' },
        });

        return NextResponse.json(events);
    } catch (error) {
        const dbError = handleDatabaseError(error);
        return NextResponse.json(dbError, { status: 500 });
    }
}

// POST create new event
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            title,
            type,
            startTime,
            endTime,
            prepTimeMinutes,
            day,
            date,
            description,
            location,
            isRecurring,
            recurringPattern,
            userId = 'default-user',
        } = body;

        // Validation
        if (!title || !type || !startTime) {
            return NextResponse.json(
                { error: 'Title, type, and startTime are required' },
                { status: 400 }
            );
        }

        // Must have either day (recurring) or date (one-off)
        if (!day && !date) {
            return NextResponse.json(
                { error: 'Either "day" (for recurring) or "date" (for specific) is required' },
                { status: 400 }
            );
        }

        const event = await prisma.event.create({
            data: {
                title,
                type,
                startTime,
                endTime,
                prepTimeMinutes: prepTimeMinutes || 15,
                day,
                date: date ? new Date(date) : null,
                description,
                location,
                isRecurring: isRecurring || false,
                recurringPattern,
                userId,
            },
        });

        // Auto-sync to Google Calendar (non-blocking — won't slow down response)
        syncEventToGoogle(event.id, userId).catch(e =>
            console.log('Google Calendar sync skipped (not connected?):', e.message)
        );

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        const dbError = handleDatabaseError(error);
        return NextResponse.json(dbError, { status: 500 });
    }
}
