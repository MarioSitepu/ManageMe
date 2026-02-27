import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Cron secret to protect this endpoint
const CRON_SECRET = process.env.CRON_SECRET || 'trackme-cron-2024';

async function sendWhatsApp(phone: string, message: string) {
    const fonnte_api_key = process.env.FONNTE_API_KEY;
    if (!fonnte_api_key) {
        console.error('FONNTE_API_KEY not configured');
        return false;
    }

    try {
        const res = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                'Authorization': fonnte_api_key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ target: phone, message, countryCode: '62' })
        });
        return res.ok;
    } catch (e) {
        console.error('WhatsApp send failed:', e);
        return false;
    }
}

export async function GET(request: Request) {
    // Verify cron secret
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret') || request.headers.get('Authorization');
    if (secret !== CRON_SECRET && secret !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    // Current time in Asia/Jakarta (UTC+7)
    const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const currentHour = wibNow.getUTCHours();
    const currentMinute = wibNow.getUTCMinutes();
    const todayName = wibNow.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const todayISO = `${wibNow.getUTCFullYear()}-${String(wibNow.getUTCMonth() + 1).padStart(2, '0')}-${String(wibNow.getUTCDate()).padStart(2, '0')}`;

    // Target time: 1 hour from now
    const targetHour = currentHour + 1;
    const targetMinute = currentMinute;

    console.log(`[Reminder Cron] Running at WIB ${currentHour}:${String(currentMinute).padStart(2, '0')} | Checking for events at ${targetHour}:${String(targetMinute).padStart(2, '0')}`);

    // Get all users with phone numbers and notifications enabled
    const users = await prisma.user.findMany({
        where: { phoneNumber: { not: null } }
    });

    let totalSent = 0;

    for (const user of users) {
        if (!user.phoneNumber) continue;

        // Find events starting at exactly 1 hour from now (±3 minute window)
        const events = await prisma.event.findMany({
            where: { userId: user.id }
        });

        const matchingEvents = events.filter(event => {
            const [evHour, evMinute] = event.startTime.split(':').map(Number);
            const diffMinutes = (evHour * 60 + evMinute) - (currentHour * 60 + currentMinute);

            // Event is 55-65 minutes from now
            if (diffMinutes < 55 || diffMinutes > 65) return false;

            // Recurring: check if today matches the day
            if (event.isRecurring && event.day === todayName) return true;

            // Specific date: check if today
            if (event.date) {
                const rawDate = event.date;
                const evDate = rawDate instanceof Date
                    ? `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, '0')}-${String(rawDate.getDate()).padStart(2, '0')}`
                    : String(rawDate).substring(0, 10);
                return evDate === todayISO;
            }

            return false;
        });

        for (const event of matchingEvents) {
            const typeEmoji: Record<string, string> = {
                'class': '📚', 'exam': '📝', 'meeting': '💼',
                'assignment': '📋', 'study': '🔖', 'personal': '🗓️'
            };
            const emoji = typeEmoji[event.type] || '📌';
            const prepMsg = event.prepTimeMinutes > 0
                ? `\n⏱️ Siapkan diri ${event.prepTimeMinutes} menit sebelumnya!`
                : '';
            const locationMsg = event.location ? `\n📍 ${event.location}` : '';

            const message =
                `⏰ *Reminder - 1 Jam Lagi!*\n\n` +
                `${emoji} *${event.title}*\n` +
                `🕐 Mulai jam ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}` +
                locationMsg + prepMsg +
                `\n\n✨ Semangat! Jangan sampai telat ya 💪`;

            const sent = await sendWhatsApp(user.phoneNumber, message);
            if (sent) {
                totalSent++;
                console.log(`[Reminder] Sent to ${user.phoneNumber}: ${event.title} at ${event.startTime}`);
            }
        }

        // --- HABIT REMINDERS ---
        const habits = await prisma.habit.findMany({ where: { userId: user.id } });

        // 1. Morning Summary
        const habitMorningTime = (user as any).habitMorningTime || '07:00';
        const [mHour, mMinute] = habitMorningTime.split(':').map(Number);

        // Target time for habits is based on current time (not 1 hour ahead like events)
        const diffMinsFromMorning = (currentHour * 60 + currentMinute) - (mHour * 60 + mMinute);

        // If it's within a 10 mins window of the morning reminder time
        if (diffMinsFromMorning >= 0 && diffMinsFromMorning < 10 && habits.length > 0) {
            let msg = `🌅 *Selamat Pagi!*\nIni daftar habit dan rutinitas kamu hari ini:\n\n`;
            for (const h of habits) {
                // If it's a new day, we assume it's unticked for the summary. The actual DB reset happens when the user opens the app or we could do it here.
                msg += `⬜ ${h.text}\n`;
            }
            msg += `\nJangan lupa diselesaikan ya! 🔥`;
            const sent = await sendWhatsApp(user.phoneNumber, msg);
            if (sent) totalSent++;
        }

        // 2. Specific Habit Reminders
        for (const habit of habits) {
            if (habit.completed) {
                // Check if it was completed on a previous day, treat as not completed for reminder purposes
                const todayStr = wibNow.toDateString();
                const completedDateStr = habit.lastCompletedDate ? new Date(habit.lastCompletedDate).toDateString() : '';
                if (completedDateStr === todayStr) {
                    continue; // Actually completed today
                }
            }

            if (!habit.reminderTime) continue;

            const [hHour, hMinute] = habit.reminderTime.split(':').map(Number);
            const diffMins = (hHour * 60 + hMinute) - (currentHour * 60 + currentMinute);

            // Reminder 0-10 mins window
            if (diffMins >= 0 && diffMins < 10) {
                const msg = `🔔 *Habit Reminder*\n\nSaatnya: *${habit.text}*\n\nYuk segera diselesaikan! 💪`;
                const sent = await sendWhatsApp(user.phoneNumber, msg);
                if (sent) totalSent++;
            }
        }
    }

    return NextResponse.json({
        success: true,
        checkedAt: `${currentHour}:${String(currentMinute).padStart(2, '0')} WIB`,
        reminderFor: `${targetHour}:${String(targetMinute).padStart(2, '0')} WIB`,
        today: todayName,
        remindersSent: totalSent
    });
}

// Also support POST for Vercel Cron
export const POST = GET;
