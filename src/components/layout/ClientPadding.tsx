"use client";

import { usePathname } from 'next/navigation';

export function ClientPadding({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuth = pathname === '/login' || pathname === '/register';

    return (
        <div className="main-layout" style={{ paddingBottom: isAuth ? '0px' : '80px' }}>
            {children}
        </div>
    );
}
