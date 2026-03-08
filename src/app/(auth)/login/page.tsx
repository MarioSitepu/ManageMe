/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, LineChart, TrendingUp } from 'lucide-react';

function LoginUI() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans selection:bg-emerald-500/30 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
            {/* Soft gradient background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#09090b] to-[#09090b] -z-10" />

            {/* Main Container */}
            <div className="w-full max-w-[768px] flex flex-col gap-8 sm:gap-10 z-10 animate-in fade-in duration-1000">

                {/* Header Section */}
                <header className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-[12px] bg-gradient-to-b from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_10px_15px_-3px_rgba(16,185,129,0.2)]">
                        <TrendingUp className="w-6 h-6 text-[#09090b]" strokeWidth={2.5} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f4f4f5]">
                            TrackMe 2.0 <span className="text-emerald-400">is Here</span>
                        </h1>
                        <p className="text-sm sm:text-base text-[#a1a1aa] max-w-[448px] mx-auto leading-relaxed">
                            Master your financial life. The most intelligent way to track expenses, build habits, and secure your financial future.
                        </p>
                    </div>
                </header>

                {/* Login Card */}
                <main className="w-full max-w-[448px] mx-auto bg-[#18181b]/80 backdrop-blur-xl border border-[#27272a]/80 rounded-[16px] p-6 sm:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-medium text-[#f4f4f5] mb-1">Welcome Back</h2>
                        <p className="text-sm text-[#a1a1aa]">Sign in securely to your account</p>
                    </div>

                    {error && (
                        <div className="w-full mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-[12px] flex items-start gap-3 text-left animate-in fade-in slide-in-from-top-2">
                            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-[0.95rem] text-red-300 font-medium">{error}</p>
                        </div>
                    )}

                    <a
                        href="/api/google/auth"
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-[#f4f4f5] text-[#18181b] px-4 py-3 rounded-[8px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#18181b] active:scale-[0.98]"
                        style={{ textDecoration: 'none' }}
                    >
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </a>

                    <div className="mt-6 pt-6 border-t border-[#27272a]/50">
                        <p className="text-center text-xs text-[#a1a1aa] leading-relaxed m-0 p-0">
                            By continuing, you agree to TrackMe's <br className="hidden sm:block" />
                            <a href="#" className="text-[#a1a1aa] hover:text-emerald-400 underline underline-offset-2 decoration-[#3f3f46] transition-colors focus:outline-none focus:text-emerald-400" style={{ display: 'inline' }}>Terms of Service</a> and <a href="#" className="text-[#a1a1aa] hover:text-emerald-400 underline underline-offset-2 decoration-[#3f3f46] transition-colors focus:outline-none focus:text-emerald-400" style={{ display: 'inline' }}>Privacy Policy</a>.
                        </p>
                    </div>
                </main>

                {/* Features Section */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                    <div className="bg-[#18181b]/40 border border-[#27272a]/80 rounded-[12px] p-4 sm:p-5 flex gap-4 hover:bg-[#18181b]/60 transition-colors group">
                        <div className="w-10 h-10 rounded-[8px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                            <LineChart className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="m-0 p-0 text-left">
                            <h3 className="text-sm font-medium text-[#f4f4f5] mb-1 m-0">Smart Analytics</h3>
                            <p className="text-xs text-[#a1a1aa] leading-relaxed m-0">Deep insights into your financial flow with visual reports.</p>
                        </div>
                    </div>

                    <div className="bg-[#18181b]/40 border border-[#27272a]/80 rounded-[12px] p-4 sm:p-5 flex gap-4 hover:bg-[#18181b]/60 transition-colors group">
                        <div className="w-10 h-10 rounded-[8px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                            <Shield className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="m-0 p-0 text-left">
                            <h3 className="text-sm font-medium text-[#f4f4f5] mb-1 m-0">Secure Vault</h3>
                            <p className="text-xs text-[#a1a1aa] leading-relaxed m-0">Enterprise-grade protection for your private data.</p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#a1a1aa] pt-4 border-t border-[#27272a]/50 m-0">
                    <p className="m-0">© 2026 TrackMe. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-[#d4d4d8] transition-colors focus:outline-none focus:underline" style={{ textDecoration: 'none' }}>Privacy Policy</a>
                        <a href="#" className="hover:text-[#d4d4d8] transition-colors focus:outline-none focus:underline" style={{ textDecoration: 'none' }}>Terms of Service</a>
                    </div>
                </footer>

            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginUI />
        </Suspense>
    );
}
