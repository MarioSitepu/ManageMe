/**
 * Local Cron Runner for TrackMe Reminders
 * Run this in a separate terminal: node cron-local.js
 * 
 * This calls /api/cron/reminders every 5 minutes (same as Vercel cron)
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'trackme-cron-2024';
const INTERVAL_MINUTES = 5;

async function runReminders() {
    const now = new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' });
    console.log(`[${now}] Checking reminders...`);

    try {
        const res = await fetch(`${BASE_URL}/api/cron/reminders?secret=${CRON_SECRET}`);
        const data = await res.json();

        if (data.remindersSent > 0) {
            console.log(`✅ Sent ${data.remindersSent} reminder(s) for events at ${data.reminderFor} WIB`);
        } else {
            console.log(`ℹ️  No events in 1 hour. Next check in ${INTERVAL_MINUTES} min.`);
        }
    } catch (err) {
        console.error(`❌ Error: ${err.message} — Is the dev server running?`);
    }
}

// Run immediately on start
runReminders();

// Then run every 5 minutes
setInterval(runReminders, INTERVAL_MINUTES * 60 * 1000);

console.log(`🔔 TrackMe Reminder Cron started`);
console.log(`   Checking every ${INTERVAL_MINUTES} minutes`);
console.log(`   Target: ${BASE_URL}`);
console.log(`   Press Ctrl+C to stop\n`);
