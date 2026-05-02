'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const saved = localStorage.getItem('adminDarkMode');
        if (saved !== null) setDarkMode(saved === 'true');
        const token = localStorage.getItem('adminToken');
        if (!token && pathname !== '/admin/login') {
            router.push('/admin/login');
        } else if (token) {
            setAuthenticated(true);
        }
        setLoading(false);
    }, [pathname, router]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('adminDarkMode', String(darkMode));
    }, [darkMode]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
    if (pathname === '/admin/login') return <>{children}</>;
    if (!authenticated) return null;

    const navItems = [
        { href: '/admin', label: 'لوحة التحكم', icon: '📊' },
        { href: '/admin/codes', label: 'أكواد التفعيل', icon: '🔑' },
        { href: '/admin/merchants', label: 'التجار', icon: '👥' },
    ];

    return (
        <div className="min-h-screen flex" dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />

            {/* Sidebar */}
            <aside className="w-64 bg-[var(--color-card)] border-l border-[var(--color-border)] p-6 hidden lg:flex flex-col">
                <h1 className="text-xl font-bold gradient-text mb-2">daoob</h1>
                <p className="text-xs text-[var(--color-muted)] mb-8">لوحة المشرف</p>

                <nav className="space-y-1 flex-1">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === item.href ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}>
                            <span>{item.icon}</span> {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="space-y-2 border-t border-[var(--color-border)] pt-4">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] rounded-xl transition-colors"
                    >
                        {darkMode ? '☀️' : '🌙'} {darkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
                    </button>
                    <button onClick={() => { localStorage.removeItem('adminToken'); router.push('/admin/login'); }}
                        className="w-full text-sm text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-colors text-start">
                        🚪 تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 right-0 left-0 z-50 bg-[var(--color-card)] border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
                <span className="text-lg font-bold gradient-text">daoob Admin</span>
                <div className="flex gap-2">
                    <button onClick={() => setDarkMode(!darkMode)} className="text-lg">{darkMode ? '☀️' : '🌙'}</button>
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className={`text-lg ${pathname === item.href ? '' : 'opacity-50'}`}>{item.icon}</Link>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-8 lg:mt-0 mt-14">{children}</main>
        </div>
    );
}
