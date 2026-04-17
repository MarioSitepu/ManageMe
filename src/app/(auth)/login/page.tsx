"use client";

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, LineChart, TrendingUp, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function LoginUI() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const errorParam = searchParams.get('error');
    
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setLocalError(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Success
            router.push('/');
            router.refresh();
        } catch (err: any) {
            setLocalError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const displayError = localError || errorParam;

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans selection:bg-emerald-500/30 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-[#09090b] to-[#09090b] -z-10" />

            <div className="w-full max-w-[768px] flex flex-col gap-8 sm:gap-10 z-10 animate-in fade-in duration-1000">
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

                <main className="w-full max-w-[448px] mx-auto bg-[#18181b]/80 backdrop-blur-xl border border-[#27272a]/80 rounded-[16px] p-6 sm:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-medium text-[#f4f4f5] mb-1">Welcome Back</h2>
                        <p className="text-sm text-[#a1a1aa]">Sign in to your account</p>
                    </div>

                    {displayError && (
                        <div className="w-full mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-[12px] flex items-start gap-3 text-left animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-[0.95rem] text-red-300 font-medium">{displayError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-[#a1a1aa] ml-1">Username or Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b] group-focus-within:text-emerald-400 transition-colors z-10 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="johndoe or name@example.com"
                                    required
                                    className="w-full bg-[#09090b] border border-[#27272a] rounded-[8px] py-2.5 !pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-sans"
                                    value={formData.identifier}
                                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-[#a1a1aa] ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b] group-focus-within:text-emerald-400 transition-colors z-10 pointer-events-none" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-[#09090b] border border-[#27272a] rounded-[8px] py-2.5 !pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 disabled:cursor-not-allowed text-[#09090b] py-2.5 rounded-[8px] font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Sign In
                        </button>
                    </form>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#27272a]"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#18181b] px-2 text-[#52525b]">Or continue with</span>
                        </div>
                    </div>

                    <a
                        href="/api/google/auth"
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-[#f4f4f5] text-[#18181b] px-4 py-3 rounded-[8px] font-medium transition-all active:scale-[0.98]"
                        style={{ textDecoration: 'none' }}
                    >
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </a>

                </main>

                <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#a1a1aa] pt-4 border-t border-[#27272a]/50 m-0">
                    <p className="m-0">© 2026 TrackMe. All rights reserved.</p>
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
