'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCodesPage() {
    const [codes, setCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [count, setCount] = useState(1);
    const [filter, setFilter] = useState('');

    const fetchCodes = async () => {
        try {
            const params: any = { limit: 50 };
            if (filter) params.status = filter;
            const { data } = await adminApi.get('/admin/codes', { params });
            setCodes(data.codes);
        } catch { toast.error('خطأ في تحميل الأكواد'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCodes(); }, [filter]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const { data } = await adminApi.post('/admin/codes/generate', { count });
            toast.success(`تم إنشاء ${data.codes.length} كود(أكواد)`);
            fetchCodes();
        } catch { toast.error('خطأ في إنشاء الأكواد'); }
        finally { setGenerating(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('حذف هذا الكود؟')) return;
        try {
            await adminApi.delete(`/admin/codes/${id}`);
            toast.success('تم حذف الكود');
            fetchCodes();
        } catch { toast.error('خطأ في الحذف'); }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success('تم نسخ الكود!');
    };

    const getStatus = (code: any) => {
        if (code.isUsed) return { label: 'مستخدم', color: 'bg-green-500/10 text-green-500' };
        if (new Date(code.expiresAt) < new Date()) return { label: 'منتهي', color: 'bg-red-500/10 text-red-500' };
        if (code.lockedUntil && new Date(code.lockedUntil) > new Date()) return { label: 'مقفل', color: 'bg-amber-500/10 text-amber-500' };
        return { label: 'نشط', color: 'bg-blue-500/10 text-blue-500' };
    };

    const filterLabels: Record<string, string> = {
        '': 'الكل',
        'unused': 'غير مستخدم',
        'used': 'مستخدم',
        'expired': 'منتهي',
        'locked': 'مقفل',
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-6">🔑 أكواد التفعيل</h1>

            {/* إنشاء */}
            <div className="card mb-6 flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium">إنشاء أكواد:</span>
                <input type="number" value={count} onChange={e => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))} className="input-field w-20" min="1" max="50" dir="ltr" />
                <button onClick={handleGenerate} disabled={generating} className="btn-primary text-sm disabled:opacity-50">
                    {generating ? 'جاري الإنشاء...' : 'إنشاء الأكواد'}
                </button>
            </div>

            {/* الفلاتر */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {Object.entries(filterLabels).map(([key, label]) => (
                    <button key={key} onClick={() => setFilter(key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === key ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-card)] text-[var(--color-muted)]'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* الجدول */}
            {loading ? (
                <div className="flex justify-center py-10"><div className="spinner" /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="text-start p-3 text-[var(--color-muted)] font-medium">الكود</th>
                                <th className="text-start p-3 text-[var(--color-muted)] font-medium">الحالة</th>
                                <th className="text-start p-3 text-[var(--color-muted)] font-medium">ينتهي في</th>
                                <th className="text-start p-3 text-[var(--color-muted)] font-medium">المحاولات</th>
                                <th className="text-start p-3 text-[var(--color-muted)] font-medium">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {codes.map(code => {
                                const status = getStatus(code);
                                return (
                                    <tr key={code._id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-card)]/50">
                                        <td className="p-3 font-mono text-xs tracking-wider" dir="ltr">{code.code}</td>
                                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span></td>
                                        <td className="p-3 text-xs text-[var(--color-muted)]">{new Date(code.expiresAt).toLocaleDateString('ar-SA')}</td>
                                        <td className="p-3 text-xs">{code.failedAttempts || 0}</td>
                                        <td className="p-3 flex gap-2">
                                            <button onClick={() => copyCode(code.code)} className="text-xs btn-ghost" title="نسخ">📋</button>
                                            {!code.isUsed && <button onClick={() => handleDelete(code._id)} className="text-xs btn-ghost text-red-500" title="حذف">🗑️</button>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {codes.length === 0 && <p className="text-center py-10 text-[var(--color-muted)]">لا توجد أكواد</p>}
                </div>
            )}
        </div>
    );
}
