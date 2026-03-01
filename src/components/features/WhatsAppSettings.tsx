"use client";
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGlobal } from '@/lib/GlobalContext';

export const WhatsAppSettings: React.FC = () => {
    const { state, updateSettings } = useGlobal();
    const [phoneNumber, setPhoneNumber] = useState(state.phoneNumber || '');

    // Default settings if undefined (for old localStorage data)
    const defaultSettings = {
        enabled: false,
        classReminders: true,
        eventReminderMinutes: [15, 30],
        dailySummary: false,
        streakAlerts: true,
        budgetWarnings: true,
        habitMorningTime: '07:00'
    };

    const [settings, setSettings] = useState(state.notificationSettings || defaultSettings);
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = () => {
        updateSettings(phoneNumber, settings);
        setMessage('✅ Settings saved!');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleTestMessage = async () => {
        if (!phoneNumber) {
            alert('Please enter phone number first');
            return;
        }

        setIsSending(true);
        try {
            const response = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: phoneNumber,
                    message: '🎯 TrackMe Test Message\n\nYour WhatsApp notification is working! You\'ll receive reminders here.'
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('✅ Test message sent!');
            } else {
                setMessage(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            setMessage('❌ Failed to send message');
        } finally {
            setIsSending(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <Card title="📱 WhatsApp Notifications" style={{ marginBottom: '20px' }} id="notifications">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Phone Number (format: 628xxxxx)
                    </label>
                    <input
                        type="tel"
                        placeholder="628123456789"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(0,0,0,0.2)',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Enable/Disable */}
                <label style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    background: settings.enabled ? 'rgba(124, 58, 237, 0.1)' : 'rgba(255,255,255,0.03)',
                    border: settings.enabled ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid var(--border)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}>
                    <span style={{ fontWeight: 600, color: settings.enabled ? 'var(--accent-primary)' : 'var(--text)' }}>
                        Enable Notifications
                    </span>
                    <div style={{ position: 'relative', width: '48px', height: '26px', backgroundColor: settings.enabled ? 'var(--accent)' : 'var(--surface-3)', borderRadius: '13px', transition: 'background-color 0.3s', display: 'flex', alignItems: 'center', padding: '2px' }}>
                        <div style={{ width: '22px', height: '22px', backgroundColor: 'white', borderRadius: '50%', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: settings.enabled ? 'translateX(22px)' : 'translateX(0)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                        <input
                            type="checkbox"
                            checked={settings.enabled}
                            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                            style={{ position: 'absolute', opacity: 0, cursor: 'pointer', width: '100%', height: '100%', margin: 0 }}
                        />
                    </div>
                </label>

                {/* Individual Settings */}
                {settings.enabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            {[
                                { key: 'classReminders', label: '⏰ Event Reminders' },
                                { key: 'streakAlerts', label: '🎯 Streak Alerts' },
                                { key: 'budgetWarnings', label: '💰 Budget Warnings' },
                                { key: 'dailySummary', label: '📊 Daily Summary' },
                            ].map(({ key, label }) => {
                                const isChecked = settings[key as keyof typeof settings] as boolean;
                                return (
                                    <label key={key} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '14px 16px',
                                        background: 'var(--surface-2)',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{label}</span>
                                        <div style={{ position: 'relative', width: '40px', height: '22px', backgroundColor: isChecked ? 'var(--accent)' : 'var(--surface-3)', borderRadius: '11px', transition: 'background-color 0.3s', display: 'flex', alignItems: 'center', padding: '2px' }}>
                                            <div style={{ width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: isChecked ? 'translateX(18px)' : 'translateX(0)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                                                style={{ position: 'absolute', opacity: 0, cursor: 'pointer', width: '100%', height: '100%', margin: 0, top: 0, left: 0 }}
                                            />
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        {/* Reminder Times */}
                        {settings.classReminders && (
                            <div style={{ marginTop: '10px', paddingLeft: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    Remind me before events:
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {[
                                        { minutes: 5, label: '5m' },
                                        { minutes: 15, label: '15m' },
                                        { minutes: 30, label: '30m' },
                                        { minutes: 60, label: '1h' },
                                        { minutes: 120, label: '2h' },
                                        { minutes: 1440, label: '1 day' },
                                    ].map(({ minutes, label }) => {
                                        const isSelected = settings.eventReminderMinutes?.includes(minutes) ?? false;
                                        return (
                                            <button
                                                key={minutes}
                                                type="button"
                                                onClick={() => {
                                                    const current = settings.eventReminderMinutes || [];
                                                    const updated = isSelected
                                                        ? current.filter(m => m !== minutes)
                                                        : [...current, minutes].sort((a, b) => a - b);
                                                    setSettings({ ...settings, eventReminderMinutes: updated });
                                                }}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '20px',
                                                    border: isSelected ? '2px solid var(--accent-primary)' : '2px solid rgba(255,255,255,0.1)',
                                                    background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                                                    color: isSelected ? 'var(--accent-primary)' : 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    fontWeight: isSelected ? 600 : 400,
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                    {settings.eventReminderMinutes?.length || 0} reminder(s) selected
                                </p>
                            </div>
                        )}

                        {/* Morning Habit Reminder Time */}
                        <div style={{ marginTop: '10px', paddingLeft: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Morning Habit Reminder:
                            </label>
                            <input
                                type="time"
                                value={settings.habitMorningTime || '07:00'}
                                onChange={(e) => setSettings({ ...settings, habitMorningTime: e.target.value })}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button onClick={handleSave} style={{ flex: 1 }}>
                        Save Settings
                    </Button>
                    <Button
                        onClick={handleTestMessage}
                        disabled={isSending || !phoneNumber}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}
                    >
                        {isSending ? 'Sending...' : 'Test Message'}
                    </Button>
                </div>

                {message && (
                    <p style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: message.startsWith('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        textAlign: 'center',
                        fontSize: '0.9rem'
                    }}>
                        {message}
                    </p>
                )}
            </div>
        </Card>
    );
};
