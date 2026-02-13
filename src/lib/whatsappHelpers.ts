// Helper functions for WhatsApp notifications

interface NotificationMessage {
    phone: string;
    message: string;
}

export async function sendWhatsAppMessage({ phone, message }: NotificationMessage): Promise<boolean> {
    try {
        const response = await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, message })
        });

        return response.ok;
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
        return false;
    }
}

export function formatClassReminder(className: string, startTime: string, prepTime: number): string {
    return `⏰ *Class Reminder*\n\n📚 ${className}\n🕐 Starts at ${startTime}\n⏱️ Preparation time: ${prepTime} minutes\n\n🎯 Get ready now to stay on track!`;
}

export function formatStreakAlert(streakDays: number): string {
    return `🔥 *Streak Alert!*\n\nYou're on a ${streakDays}-day streak! 💪\n\nDon't forget to check in for your classes today to keep it going!\n\n📈 Keep up the great work!`;
}

export function formatBudgetWarning(spent: number, limit: number): string {
    const percentage = Math.round((spent / limit) * 100);
    return `💰 *Budget Warning*\n\n⚠️ You've spent ${percentage}% of your daily budget\n\n💵 Spent: Rp ${spent.toLocaleString('id-ID')}\n🎯 Limit: Rp ${limit.toLocaleString('id-ID')}\n\n🛑 Consider slowing down on expenses!`;
}

export function formatDailySummary(points: number, streak: number, spent: number, classes: number): string {
    return `📊 *Daily Summary*\n\n✨ Discipline Points: ${points}\n🔥 Streak: ${streak} days\n💰 Spent Today: Rp ${spent.toLocaleString('id-ID')}\n📚 Classes Attended: ${classes}\n\n${points > 0 ? '🎉 Great job today!' : '💪 Tomorrow is a new day!'}`;
}
