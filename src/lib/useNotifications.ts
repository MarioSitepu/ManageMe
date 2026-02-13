"use client";
import { useEffect } from 'react';
import { useGlobal } from '@/lib/GlobalContext';
import { sendWhatsAppMessage, formatClassReminder, formatStreakAlert, formatBudgetWarning } from '@/lib/whatsappHelpers';

export const useNotifications = () => {
    const { state } = useGlobal();

    useEffect(() => {
        if (!state.notificationSettings.enabled || !state.phoneNumber) {
            return;
        }

        // Check for upcoming classes
        if (state.notificationSettings.classReminders) {
            const interval = setInterval(() => {
                checkClassReminders();
            }, 60000); // Check every minute

            return () => clearInterval(interval);
        }
    }, [state]);

    const checkClassReminders = () => {
        if (!state.notificationSettings.classReminders) return;

        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM
        const reminderMinutes = state.notificationSettings.eventReminderMinutes || [15, 30];

        state.events.forEach((event) => {
            if (event.day !== currentDay) return;

            // Calculate event date
            const [eventHour, eventMin] = event.startTime.split(':').map(Number);
            const eventDate = new Date(now);
            eventDate.setHours(eventHour, eventMin, 0);

            // Check each configured reminder time
            reminderMinutes.forEach((minutes) => {
                const reminderDate = new Date(eventDate.getTime() - minutes * 60000);
                const reminderTime = reminderDate.toTimeString().slice(0, 5);

                // Send reminder if current time matches reminder time
                if (currentTime === reminderTime) {
                    const message = formatClassReminder(event.title, event.startTime, minutes);
                    sendWhatsAppMessage({ phone: state.phoneNumber!, message });
                }
            });
        });
    };

    const checkBudgetWarning = () => {
        if (!state.notificationSettings.budgetWarnings) return;

        const today = new Date().toDateString();
        const dailyTotal = state.expenses
            .filter(e => new Date(e.date).toDateString() === today)
            .reduce((acc, curr) => acc + curr.amount, 0);

        const percentage = (dailyTotal / state.dailyBudget) * 100;

        // Send warning at 80% and 100%
        if (percentage >= 80 && percentage < 85) {
            const message = formatBudgetWarning(dailyTotal, state.dailyBudget);
            sendWhatsAppMessage({ phone: state.phoneNumber!, message });
        }
    };

    const checkStreakAlert = () => {
        if (!state.notificationSettings.streakAlerts) return;

        // Send streak reminder in the morning (9 AM)
        const now = new Date();
        if (now.getHours() === 9 && now.getMinutes() === 0) {
            if (state.streakDays > 0) {
                const message = formatStreakAlert(state.streakDays);
                sendWhatsAppMessage({ phone: state.phoneNumber!, message });
            }
        }
    };
};
