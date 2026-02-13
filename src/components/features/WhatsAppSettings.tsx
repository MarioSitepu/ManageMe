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
        budgetWarnings: true
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
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px'
                }}>
                    <span style={{ fontWeight: 600 }}>Enable Notifications</span>
                    <label style={{ cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={settings.enabled}
                            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                            style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                        />
                    </label>
                </div>

                {/* Individual Settings */}
                {settings.enabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '10px' }}>
                        {[
                            { key: 'classReminders', label: '⏰ Event Reminders' },
                            { key: 'streakAlerts', label: '🎯 Streak Alerts' },
                            { key: 'budgetWarnings', label: '💰 Budget Warnings' },
                            { key: 'dailySummary', label: '📊 Daily Summary' },
                        ].map(({ key, label }) => (
                            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={settings[key as keyof typeof settings] as boolean}
                                    onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                                    style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.95rem' }}>{label}</span>
                            </label>
                        ))}

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
