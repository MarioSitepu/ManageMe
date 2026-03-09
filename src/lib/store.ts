

export interface Expense {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    accountId?: string;
    accountName?: string;
    type?: string;
}

export interface Account {
    id: string;
    name: string;
    type: 'BANK' | 'WALLET' | 'CASH' | string;
    balance: number;
    color?: string;
    icon?: string;
    isDefault?: boolean;
}

export type EventType = 'class' | 'assignment' | 'meeting' | 'personal' | 'exam' | 'study';

export interface CalendarEvent {
    id: string;
    title: string;
    type: EventType;
    startTime: string; // "08:00"
    endTime?: string; // "10:00" (optional)
    prepTimeMinutes: number;
    day?: string; // "Monday" (optional if specific date)
    date?: string; // ISO date string (YYYY-MM-DD) for specific dates
    isRecurring?: boolean;
    recurringPattern?: string;
    description?: string;
    location?: string;
}

export interface DailyNote {
    date: string;  // ISO date string (YYYY-MM-DD)
    content: string;
}

export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
    completedAt?: string;
    dueDate?: string;  // ISO date string (YYYY-MM-DD)
}

export interface Habit {
    id: string;
    text: string;
    completed: boolean;
    reminderTime?: string;
    lastCompletedDate?: string;
}


export interface UserState {
    disciplinePoints: number;
    streakDays: number;
    dailyBudget: number;
    accounts: Account[];
    expenses: Expense[];
    events: CalendarEvent[];
    dailyNotes: DailyNote[];
    todos: TodoItem[];
    habits: Habit[];
    phoneNumber?: string;
    notificationSettings: {
        enabled: boolean;
        classReminders: boolean;
        eventReminderMinutes: number[];
        dailySummary: boolean;
        streakAlerts: boolean;
        budgetWarnings: boolean;
        habitMorningTime: string;
    };
}

// Initial Mock Data (Fallback)
export const initialUser: UserState = {
    disciplinePoints: 850,
    streakDays: 5,
    dailyBudget: 50000,
    accounts: [],
    expenses: [
        { id: '1', amount: 15000, category: 'Food', description: 'Nasi Goreng Spesial', date: '2024-01-01T12:00:00.000Z' },
    ],
    events: [
        { id: '1', title: 'Algoritma & Pemograman', type: 'class', startTime: '08:00', endTime: '10:00', prepTimeMinutes: 30, day: 'Monday', location: 'Room A101', isRecurring: true },
        { id: '2', title: 'Matematika Diskrit', type: 'class', startTime: '10:00', endTime: '12:00', prepTimeMinutes: 15, day: 'Monday', location: 'Room B202', isRecurring: true },
    ],
    dailyNotes: [],
    todos: [],
    habits: [],
    phoneNumber: '',
    notificationSettings: {
        enabled: false,
        classReminders: true,
        eventReminderMinutes: [15, 30],
        dailySummary: false,
        streakAlerts: true,
        budgetWarnings: true,
        habitMorningTime: '07:00'
    }
};

// Simple Store (In a real app, use Context or Zustand)
let currentState = { ...initialUser };

export const getUserState = () => currentState;
export const addExpense = (amount: number, category: string, description: string) => {
    currentState.expenses.push({
        id: Math.random().toString(36).substr(2, 9),
        amount,
        category,
        description,
        date: new Date().toISOString()
    });
    return currentState;
};
