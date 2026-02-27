"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useGlobal } from '@/lib/GlobalContext';

export default function NotesPage() {
    const { state, updateDailyNote, addTodo, toggleTodo, deleteTodo, addHabit, toggleHabit, deleteHabit } = useGlobal();
    const [todoInput, setTodoInput] = useState('');
    const [todoDueDate, setTodoDueDate] = useState('');
    const [habitInput, setHabitInput] = useState('');
    const [habitReminder, setHabitReminder] = useState('');
    const [tab, setTab] = useState<'note' | 'todos' | 'habits'>('note');

    const today = new Date().toISOString().split('T')[0];
    const todayNote = state.dailyNotes?.find(n => n.date === today);
    const [noteContent, setNoteContent] = useState(todayNote?.content || '');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const activeTodos = state.todos?.filter(t => !t.completed) || [];
    const completedTodos = state.todos?.filter(t => t.completed) || [];

    const overdueTodos = activeTodos.filter(t => t.dueDate && t.dueDate < today);
    const todayTodos = activeTodos.filter(t => t.dueDate === today);
    const tomorrowTodos = activeTodos.filter(t => t.dueDate === tomorrowStr);
    const upcomingTodos = activeTodos.filter(t => t.dueDate && t.dueDate > tomorrowStr);
    const noDateTodos = activeTodos.filter(t => !t.dueDate);

    // Habits
    const activeHabits = state.habits?.filter(h => !h.completed) || [];
    const completedHabits = state.habits?.filter(h => h.completed) || [];

    const handleAddTodo = () => {
        if (todoInput.trim()) {
            addTodo(todoInput.trim(), todoDueDate || undefined);
            setTodoInput('');
            setTodoDueDate('');
        }
    };

    const handleAddHabit = () => {
        if (habitInput.trim()) {
            addHabit(habitInput.trim(), habitReminder || undefined);
            setHabitInput('');
            setHabitReminder('');
        }
    };

    const TodoItem = ({ todo }: { todo: typeof activeTodos[0] }) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 0',
            borderBottom: '1px solid var(--border)',
        }}>
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                style={{ cursor: 'pointer', flexShrink: 0 }}
            />
            <span style={{
                flex: 1,
                fontSize: '0.9rem',
                color: todo.completed ? 'var(--text-muted)' : 'var(--text)',
                textDecoration: todo.completed ? 'line-through' : 'none',
            }}>
                {todo.text}
            </span>
            {todo.dueDate && (
                <span className={`badge ${todo.dueDate < today ? 'badge-danger' : todo.dueDate === today ? 'badge-warning' : 'badge-muted'}`}>
                    {todo.dueDate === today ? 'Today' : todo.dueDate === tomorrowStr ? 'Tomorrow' : todo.dueDate.slice(5)}
                </span>
            )}
            <button
                onClick={() => deleteTodo(todo.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', fontSize: '1rem', lineHeight: 1 }}
            >×</button>
        </div>
    );

    const TodoGroup = ({ todos, label, color }: { todos: typeof activeTodos, label: string, color?: string }) => {
        if (!todos.length) return null;
        return (
            <div style={{ marginBottom: '8px' }}>
                <p className="section-label" style={{ color: color || 'var(--text-muted)' }}>{label}</p>
                {todos.map(t => <TodoItem key={t.id} todo={t} />)}
            </div>
        );
    };

    return (
        <main className="container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Notes</h1>
                    <p className="page-subtitle">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="tab-group" style={{ marginBottom: '20px' }}>
                <button className={`tab-item ${tab === 'note' ? 'active' : ''}`} onClick={() => setTab('note')}>
                    Daily Note
                </button>
                <button className={`tab-item ${tab === 'habits' ? 'active' : ''}`} onClick={() => setTab('habits')}>
                    Habits {activeHabits.length > 0 && <span className="badge badge-accent" style={{ marginLeft: '4px', padding: '1px 6px', fontSize: '0.65rem' }}>{activeHabits.length}</span>}
                </button>
                <button className={`tab-item ${tab === 'todos' ? 'active' : ''}`} onClick={() => setTab('todos')}>
                    Todos {activeTodos.length > 0 && <span className="badge badge-accent" style={{ marginLeft: '4px', padding: '1px 6px', fontSize: '0.65rem' }}>{activeTodos.length}</span>}
                </button>
            </div>

            {/* NOTE TAB */}
            {tab === 'note' && (
                <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '20px',
                    }}>
                        <p className="section-label" style={{ marginBottom: '12px' }}>Today's Note</p>
                        <textarea
                            value={noteContent}
                            onChange={e => setNoteContent(e.target.value)}
                            placeholder="Write your thoughts, reflections, or anything on your mind..."
                            style={{
                                minHeight: '220px',
                                background: 'transparent',
                                border: 'none',
                                resize: 'vertical',
                                fontSize: '0.95rem',
                                lineHeight: 1.7,
                                color: 'var(--text)',
                                width: '100%',
                                outline: 'none',
                                padding: 0,
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                            <Button size="sm" onClick={() => updateDailyNote(today, noteContent)}>
                                Save Note
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* TODOS TAB */}
            {tab === 'todos' && (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Add Todo */}
                    <div style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                    }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <input
                                placeholder="Add a task..."
                                value={todoInput}
                                onChange={e => setTodoInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddTodo()}
                                style={{ flex: 1 }}
                            />
                            <Button size="sm" onClick={handleAddTodo}>Add</Button>
                        </div>
                        <input
                            type="date"
                            value={todoDueDate}
                            onChange={e => setTodoDueDate(e.target.value)}
                            style={{ width: 'auto', fontSize: '0.8125rem', padding: '6px 10px' }}
                        />
                    </div>

                    {/* Active Todos */}
                    {activeTodos.length > 0 && (
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
                            <TodoGroup todos={overdueTodos} label="Overdue" color="var(--danger)" />
                            <TodoGroup todos={todayTodos} label="Today" color="var(--warning)" />
                            <TodoGroup todos={tomorrowTodos} label="Tomorrow" />
                            <TodoGroup todos={upcomingTodos} label="Upcoming" />
                            <TodoGroup todos={noDateTodos} label="No date" />
                        </div>
                    )}

                    {/* Done */}
                    {completedTodos.length > 0 && (
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
                            <p className="section-label" style={{ marginBottom: '12px' }}>Completed ({completedTodos.length})</p>
                            {completedTodos.slice(0, 5).map(t => <TodoItem key={t.id} todo={t} />)}
                        </div>
                    )}

                    {activeTodos.length === 0 && completedTodos.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                            <p style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</p>
                            <p>All clear! Add a task above.</p>
                        </div>
                    )}
                </div>
            )}

            {/* HABITS TAB */}
            {tab === 'habits' && (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Add Habit */}
                    <div style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                    }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <input
                                placeholder="Add daily habit... (e.g. Read 10 pages)"
                                value={habitInput}
                                onChange={e => setHabitInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
                                style={{ flex: 1 }}
                            />
                            <Button size="sm" onClick={handleAddHabit}>Add</Button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Reminder Time:</span>
                            <input
                                type="time"
                                value={habitReminder}
                                onChange={e => setHabitReminder(e.target.value)}
                                style={{ width: 'auto', fontSize: '0.8125rem', padding: '6px 10px' }}
                            />
                        </div>
                    </div>

                    {/* Active Habits */}
                    {activeHabits.length > 0 && (
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
                            <p className="section-label" style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>To Do Today</p>
                            {activeHabits.map(h => (
                                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                    <input type="checkbox" checked={h.completed} onChange={() => toggleHabit(h.id)} style={{ cursor: 'pointer', flexShrink: 0 }} />
                                    <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text)' }}>{h.text}</span>
                                    {h.reminderTime && (
                                        <span className="badge badge-accent">🔔 {h.reminderTime}</span>
                                    )}
                                    <button onClick={() => deleteHabit(h.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', fontSize: '1rem', lineHeight: 1 }}>×</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Completed Habits */}
                    {completedHabits.length > 0 && (
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
                            <p className="section-label" style={{ color: 'var(--success)', marginBottom: '8px' }}>Done Today ({completedHabits.length})</p>
                            {completedHabits.map(h => (
                                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                    <input type="checkbox" checked={h.completed} onChange={() => toggleHabit(h.id)} style={{ cursor: 'pointer', flexShrink: 0 }} />
                                    <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{h.text}</span>
                                    <button onClick={() => deleteHabit(h.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', fontSize: '1rem', lineHeight: 1 }}>×</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeHabits.length === 0 && completedHabits.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                            <p style={{ fontSize: '2rem', marginBottom: '8px' }}>🌿</p>
                            <p>Build good habits. Add one above!</p>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
