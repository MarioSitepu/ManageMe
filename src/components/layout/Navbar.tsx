"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Navbar: React.FC = () => {
    const pathname = usePathname();

    const navItems = [
        { label: 'Dashboard', href: '/', icon: '🏠' },
        { label: 'Schedule', href: '/schedule', icon: '📅' },
        { label: 'Notes', href: '/notes', icon: '📝' },
        { label: 'Finance', href: '/finance', icon: '💰' },
        { label: 'Profile', href: '/profile', icon: '👤' },
    ];

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(10, 10, 15, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid var(--glass-border)',
            padding: '10px 0',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center'
        }}>
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            transition: 'color 0.2s',
                            fontSize: '0.8rem'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
};
