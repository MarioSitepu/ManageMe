"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const navItems = [
    {
        label: 'Home', href: '/', icon: (active: boolean) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
        )
    },
    {
        label: 'Schedule', href: '/schedule', icon: (active: boolean) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        )
    },
    {
        label: 'Notes', href: '/notes', icon: (active: boolean) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
            </svg>
        )
    },
    {
        label: 'Finance', href: '/finance', icon: (active: boolean) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        )
    },
    {
        label: 'Profile', href: '/profile', icon: (active: boolean) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        )
    },
];

export const Navbar: React.FC = () => {
    const pathname = usePathname();

    if (pathname === '/login' || pathname === '/register') {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-100 py-2 bg-[#0a0a0f]/80 backdrop-blur-2xl border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center max-w-md mx-auto relative">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex flex-col items-center gap-1 px-4 py-2 text-center transition-colors ${
                                isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-accent-light rounded-xl -z-10"
                                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                                />
                            )}
                            
                            <motion.div
                                animate={{ scale: isActive ? 1.15 : 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className="relative z-10"
                            >
                                {item.icon(isActive)}
                            </motion.div>
                            
                            <span className={`text-[10px] font-bold tracking-tight transition-all relative z-10 ${
                                isActive ? 'opacity-100 scale-100' : 'opacity-60 scale-95'
                            }`}>
                                {item.label}
                            </span>

                            {isActive && (
                                <motion.div 
                                    layoutId="nav-dot"
                                    className="absolute -bottom-1.5 w-1 h-1 bg-accent rounded-full shadow-[0_0_8px_var(--accent)]"
                                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
