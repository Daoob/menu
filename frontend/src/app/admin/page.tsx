'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        adminApi.get('/admin/stats').then(res => setStats(res.data.stats)).catch(() => { });
    }, []);

    if (!stats) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

    const cards = [
        { label: 'إجمالي التجار', value: stats.totalMerchants, icon: '👥', color: 'from-blue-500 to-cyan-400' },
        { label: 'تجار نشطون', value: stats.activeMerchants, icon: '✅', color: 'from-emerald-500 to-teal-400' },
        { label: 'تجار موقوفون', value: stats.suspendedMerchants, icon: '🚫', color: 'from-red-500 to-rose-400' },
        { label: 'أكواد غير مستخدمة', value: stats.unusedCodes, icon: '🔑', color: 'from-amber-500 to-orange-400' },
        { label: 'أكواد مستخدمة', value: stats.usedCodes, icon: '✓', color: 'from-purple-500 to-pink-400' },
    ];

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-8">📊 لوحة التحكم</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {cards.map((c, i) => (
                    <div key={i} className="card-hover relative overflow-hidden">
                        <div className={`absolute top-0 start-0 w-16 h-16 bg-gradient-to-br ${c.color} opacity-10 rounded-full -translate-y-4 -translate-x-4`} />
                        <span className="text-2xl">{c.icon}</span>
                        <p className="text-xs text-[var(--color-muted)] mt-2">{c.label}</p>
                        <p className="text-2xl font-bold mt-1">{c.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
