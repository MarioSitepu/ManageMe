"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUser, UserState, EventType, CalendarEvent } from './store';

interface GlobalContextType {
    state: UserState;
    addExpense: (amount: number, category: string, description: string, accountId?: string) => Promise<void>;
    addPoints: (points: number) => void;
    addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
    updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    checkIn: (onTime: boolean) => void;
    addAccount: (name: string, type: string, balance: number, color?: string) => Promise<void>;

    updateSettings: (phoneNumber: string, notificationSettings: UserState['notificationSettings']) => void;
    updateDailyNote: (date: string, content: string) => void;
    addTodo: (text: string, dueDate?: string) => void;
    toggleTodo: (id: string) => void;
    deleteTodo: (id: string) => void;
    loading: boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<UserState>(initialUser);
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Load LocalStorage (for Todos, Notes, Settings, and immediate display)
                const saved = localStorage.getItem('trackme_state');
                if (saved) {
                    const parsedState = JSON.parse(saved);
                    // Merging logic or simple set
                    // For now, let's trust local storage for everything EXCEPT what we fetch from API
                    setState(prev => ({ ...prev, ...parsedState }));
                }

                // 2. Fetch from API (Expenses & Events)
                // This becomes the source of truth for these domains
                const [expRes, evtRes] = await Promise.all([
                    fetch('/api/expenses?userId=default-user'),
                    fetch('/api/events?userId=default-user')
                ]);

                if (expRes.ok && evtRes.ok) {
                    const expenses = await expRes.json();
                    const events = await evtRes.json();

                    if (Array.isArray(expenses) && Array.isArray(events)) {
                        setState(prev => ({
                            ...prev,
                            expenses,
                            events
                        }));
                    }
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const sendNotification = async (phone: string, message: string) => {
        try {
            await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, message })
            });
        } catch (error) {
            console.error("Failed to send notification", error);
        }
    };

    // Save to local storage on change (Persist everything as backup/cache)
    useEffect(() => {
        localStorage.setItem('trackme_state', JSON.stringify(state));
    }, [state]);

    const addExpense = async (amount: number, category: string, description: string, accountId?: string) => {
        // Optimistic Update
        const tempId = Math.random().toString(36).substr(2, 9);
        const newExpense = {
            id: tempId,
            amount,
            category,
            description,
            date: new Date().toISOString(),
            accountId
        };

        setState(prev => ({
            ...prev,
            expenses: [newExpense, ...prev.expenses]
        }));

        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, category, description, accountId, userId: 'default-user' })
            });

            if (res.ok) {
                const savedExpense = await res.json();
                // Replace temp ID with real ID
                setState(prev => ({
                    ...prev,
                    expenses: prev.expenses.map(e => e.id === tempId ? savedExpense : e)
                }));
            }
        } catch (error) {
            console.error("Failed to save expense", error);
            // Revert on failure? Or just keep local
        }
    };

    const addPoints = (points: number) => {
        setState(prev => ({
            ...prev,
            disciplinePoints: prev.disciplinePoints + points
        }));
    };

    const addAccount = async (name: string, type: string, balance: number, color?: string) => {
        const tempId = Math.random().toString(36).substr(2, 9);
        const newAccount = { id: tempId, name, type, balance, color };

        setState(prev => ({
            ...prev,
            accounts: [...prev.accounts, newAccount]
        }));

        try {
            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type, balance, color, userId: 'default-user' })
            });

            if (res.ok) {
                const savedAccount = await res.json();
                setState(prev => ({
                    ...prev,
                    accounts: prev.accounts.map(a => a.id === tempId ? savedAccount : a)
                }));
            }
        } catch (error) {
            console.error("Failed to add account", error);
        }
    };

    const addEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
        // Optimistic
        const tempId = Math.random().toString(36).substr(2, 9);
        const newEvent = { ...eventData, id: tempId };

        setState(prev => ({
            ...prev,
            events: [...prev.events, newEvent]
        }));

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...eventData, userId: 'default-user' })
            });

            if (res.ok) {
                const savedEvent = await res.json();
                setState(prev => ({
                    ...prev,
                    events: prev.events.map(e => e.id === tempId ? savedEvent : e)
                }));

                // Send WhatsApp Notification if enabled
                if (state.phoneNumber && state.notificationSettings.enabled) {
                    const message = `📅 New Event Added: ${eventData.title}\nTime: ${eventData.startTime}\nDay: ${eventData.day || eventData.date}`;
                    sendNotification(state.phoneNumber, message);
                }
            }
        } catch (error) {
            console.error("Failed to save event", error);
        }
    };

    const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
        // Optimistic
        setState(prev => ({
            ...prev,
            events: prev.events.map(e => e.id === id ? { ...e, ...updates } : e)
        }));

        try {
            await fetch(`/api/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (error) {
            console.error("Failed to update event", error);
        }
    };

    const deleteEvent = async (id: string) => {
        // Optimistic
        setState(prev => ({
            ...prev,
            events: prev.events.filter(e => e.id !== id)
        }));

        try {
            await fetch(`/api/events/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error("Failed to delete event", error);
        }
    };

    const checkIn = (onTime: boolean) => {
        const pointsChange = onTime ? 10 : -20;
        setState(prev => ({
            ...prev,
            disciplinePoints: prev.disciplinePoints + pointsChange,
            streakDays: onTime ? prev.streakDays + 1 : 0
        }));
    };

    const updateSettings = (phoneNumber: string, notificationSettings: UserState['notificationSettings']) => {
        setState(prev => ({
            ...prev,
            phoneNumber,
            notificationSettings
        }));
    };

    const updateDailyNote = (date: string, content: string) => {
        setState(prev => {
            const existingNoteIndex = prev.dailyNotes.findIndex(n => n.date === date);
            if (existingNoteIndex !== -1) {
                const updated = [...prev.dailyNotes];
                updated[existingNoteIndex] = { date, content };
                return { ...prev, dailyNotes: updated };
            } else {
                return { ...prev, dailyNotes: [...prev.dailyNotes, { date, content }] };
            }
        });
    };

    const addTodo = (text: string, dueDate?: string) => {
        const newTodo = {
            id: Math.random().toString(36).substr(2, 9),
            text,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate
        };
        setState(prev => ({ ...prev, todos: [...prev.todos, newTodo] }));
    };

    const toggleTodo = (id: string) => {
        setState(prev => ({
            ...prev,
            todos: prev.todos.map(todo =>
                todo.id === id
                    ? { ...todo, completed: !todo.completed, completedAt: !todo.completed ? new Date().toISOString() : undefined }
                    : todo
            )
        }));
    };

    const deleteTodo = (id: string) => {
        setState(prev => ({
            ...prev,
            todos: prev.todos.filter(todo => todo.id !== id)
        }));
    };

    return (
        <GlobalContext.Provider value={{
            state,
            addExpense,
            addPoints,
            addAccount,
            addEvent,

            updateEvent,
            deleteEvent,
            checkIn,
            updateSettings,
            updateDailyNote,
            addTodo,
            toggleTodo,
            deleteTodo,
            loading
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
};
