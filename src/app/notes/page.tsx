"use client";
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGlobal } from '@/lib/GlobalContext';

export default function NotesPage() {
    const { state, updateDailyNote, addTodo, toggleTodo, deleteTodo } = useGlobal();
    const [todoInput, setTodoInput] = useState('');
    const [todoDueDate, setTodoDueDate] = useState('');

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    const todayNote = state.dailyNotes?.find(n => n.date === today);
    const [noteContent, setNoteContent] = useState(todayNote?.content || '');

    const handleSaveNote = () => {
        updateDailyNote(today, noteContent);
    };

    const handleAddTodo = () => {
        if (todoInput.trim()) {
            addTodo(todoInput.trim(), todoDueDate || undefined);
            setTodoInput('');
            setTodoDueDate('');
        }
    };

    // Group todos by date
    const activeTodos = state.todos?.filter(t => !t.completed) || [];
    const completedTodos = state.todos?.filter(t => t.completed) || [];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const overdueTodos = activeTodos.filter(t => t.dueDate && t.dueDate < today);
    const todayTodos = activeTodos.filter(t => t.dueDate === today);
    const tomorrowTodos = activeTodos.filter(t => t.dueDate === tomorrowStr);
    const upcomingTodos = activeTodos.filter(t => t.dueDate && t.dueDate > tomorrowStr);
    const noDateTodos = activeTodos.filter(t => !t.dueDate);

    const renderTodoGroup = (todos: typeof activeTodos, title: string, emoji: string, color?: string) => {
        if (todos.length === 0) return null;

        return (
            <div style={{ marginBottom: '16px' }}>
                <h4 style={{
                    fontSize: '0.9rem',
                    color: color || 'var(--text-secondary)',
                    marginBottom: '8px',
                    fontWeight: 600
                }}>
                    {emoji} {title} ({todos.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {todos.map(todo => (
                        <div
                            key={todo.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                border: `1px solid ${color ? color + '40' : 'rgba(255,255,255,0.1)'}`,
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={false}
                                onChange={() => toggleTodo(todo.id)}
                                style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{todo.text}</div>
                                {todo.dueDate && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        📅 {new Date(todo.dueDate + 'T00:00:00').toLocaleDateString('id-ID', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => deleteTodo(todo.id)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <main className="container" style={{ padding: '2rem 1rem 6rem 1rem' }}>
            <header style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>📝 Notes & Tasks</h1>
            </header>

            {/* Daily Notes Section */}
            <Card title="Today's Notes" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        onBlur={handleSaveNote}
                        placeholder="Write your notes here..."
                        rows={8}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(0,0,0,0.2)',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            lineHeight: '1.6'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {noteContent.length} characters • {noteContent.split(/\s+/).filter(Boolean).length} words
                        </p>
                        <Button onClick={handleSaveNote} size="sm">
                            💾 Save Note
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Todo List Section */}
            <Card title="Todo List">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Add Todo Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            type="text"
                            value={todoInput}
                            onChange={(e) => setTodoInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddTodo()}
                            placeholder="Add a new task..."
                            style={{
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="date"
                                value={todoDueDate}
                                onChange={(e) => setTodoDueDate(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    colorScheme: 'dark'
                                }}
                            />
                            <Button onClick={handleAddTodo} disabled={!todoInput.trim()}>
                                + Add Task
                            </Button>
                        </div>
                    </div>

                    {/* Todo Stats */}
                    {(state.todos?.length || 0) > 0 && (
                        <div style={{
                            padding: '10px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)'
                        }}>
                            ✅ {completedTodos.length} of {state.todos?.length || 0} completed
                        </div>
                    )}

                    {/* Grouped Active Todos */}
                    {renderTodoGroup(overdueTodos, 'Overdue', '🚨', '#ef4444')}
                    {renderTodoGroup(todayTodos, 'Today', '📌', '#f59e0b')}
                    {renderTodoGroup(tomorrowTodos, 'Tomorrow', '⏭️', '#3b82f6')}
                    {renderTodoGroup(upcomingTodos, 'Upcoming', '📅', '#8b5cf6')}
                    {renderTodoGroup(noDateTodos, 'No Date', '📋')}

                    {/* Completed Todos */}
                    {completedTodos.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                                ✓ Completed ({completedTodos.length})
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {completedTodos.map(todo => (
                                    <div
                                        key={todo.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px',
                                            background: 'rgba(16, 185, 129, 0.05)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(16, 185, 129, 0.2)',
                                            opacity: 0.7
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={true}
                                            onChange={() => toggleTodo(todo.id)}
                                            style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                                        />
                                        <span style={{ flex: 1, fontSize: '0.95rem', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>
                                            {todo.text}
                                        </span>
                                        <button
                                            onClick={() => deleteTodo(todo.id)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: 'rgba(239, 68, 68, 0.2)',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {(state.todos?.length || 0) === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: 'var(--text-secondary)',
                            fontSize: '0.95rem'
                        }}>
                            <p style={{ fontSize: '3rem', marginBottom: '10px' }}>📋</p>
                            <p>No tasks yet. Add your first task above!</p>
                        </div>
                    )}
                </div>
            </Card>
        </main>
    );
}
