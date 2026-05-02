'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Merchant {
    _id: string;
    email: string;
    ownerName: string;
    phone: string;
    storeName_ar: string;
    storeName_en: string;
    slug: string | null;
    isActive: boolean;
    createdAt: string;
    subscriptionEndsAt: string | null;
    subscriptionStatus: 'active' | 'grace' | 'expired';
}

const STATUS_LABELS: Record<string, { ar: string; class: string }> = {
    active: { ar: 'نشط', class: 'bg-green-500/10 text-green-500' },
    grace: { ar: 'فترة سماح', class: 'bg-amber-500/10 text-amber-600' },
    expired: { ar: 'منتهي', class: 'bg-red-500/10 text-red-500' },
};

const MONTH_OPTIONS = [
    { value: 1, label: 'شهر واحد' },
    { value: 3, label: '٣ أشهر' },
    { value: 6, label: '٦ أشهر' },
    { value: 12, label: '١٢ شهر (سنة)' },
];

export default function AdminMerchantsPage() {
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Renewal modal state
    const [renewModal, setRenewModal] = useState<Merchant | null>(null);
    const [renewMode, setRenewMode] = useState<'months' | 'custom'>('months');
    const [renewMonths, setRenewMonths] = useState(1);
    const [renewCustomDate, setRenewCustomDate] = useState('');
    const [renewLoading, setRenewLoading] = useState(false);

    const fetchMerchants = async () => {
        try {
            const params: Record<string, string | number> = { limit: 50 };
            if (search) params.search = search;
            const { data } = await adminApi.get('/admin/merchants', { params });
            setMerchants(data.merchants);
        } catch {
            toast.error('خطأ في تحميل التجار');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMerchants();
    }, [search]);

    const handleToggle = async (id: string) => {
        try {
            const { data } = await adminApi.patch(`/admin/merchants/${id}/toggle-status`);
            toast.success(data.merchant.isActive ? 'تم تفعيل التاجر' : 'تم إيقاف التاجر');
            fetchMerchants();
        } catch {
            toast.error('خطأ في تغيير الحالة');
        }
    };

    const openRenewModal = (m: Merchant) => {
        setRenewModal(m);
        setRenewMode('months');
        setRenewMonths(1);
        setRenewCustomDate('');
    };

    const handleRenew = async () => {
        if (!renewModal) return;
        setRenewLoading(true);
        try {
            const body: Record<string, string | number> =
                renewMode === 'months'
                    ? { months: renewMonths }
                    : { customDate: new Date(renewCustomDate).toISOString() };

            await adminApi.patch(`/admin/merchants/${renewModal._id}/renew`, body);
            toast.success('تم تجديد الاشتراك بنجاح');
            setRenewModal(null);
            fetchMerchants();
        } catch {
            toast.error('خطأ في تجديد الاشتراك');
        } finally {
            setRenewLoading(false);
        }
    };

    const formatDate = (d: string | null) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-6">👥 إدارة التجار</h1>

            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field max-w-md mb-6"
                placeholder="ابحث بالاسم أو الإيميل..."
            />

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="spinner" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="text-start p-3 text-[var(--color-muted)] font-medium">الاسم</th>
                                <th className="text-start p-3 text-[var(--color-muted)] font-medium">الجوال</th>
                                <th className="text-start p-3 text-[var(--color-muted)] font-medium">البريد الإلكتروني</th>
                                <th className="text-start p-3 text-[var(--color-muted)] font-medium">اسم المتجر</th>
                                <th className="text-start p-3 text-[var(--color-muted)] font-medium">الرابط</th>
                                <th className="text-start p-3 text-[var(--color-muted)] font-medium">تاريخ الانتهاء</th>
                                <th className="text-start p-3 text-[var(--color-muted)] font-medium">الاشتراك</th>
                                <th className="text-start p-3 text-[var(--color-muted)] font-medium">الحالة</th>
                                <th className="text-start p-3 text-[var(--color-muted)] font-medium">إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {merchants.map((m) => {
                                const subLabel = STATUS_LABELS[m.subscriptionStatus] || STATUS_LABELS.expired;
                                return (
                                    <tr
                                        key={m._id}
                                        className="border-b border-[var(--color-border)] hover:bg-[var(--color-card)]/50"
                                    >
                                        <td className="p-3 text-xs font-medium">{m.ownerName || '—'}</td>
                                        <td className="p-3 text-xs" dir="ltr">{m.phone || '—'}</td>
                                        <td className="p-3 text-xs" dir="ltr">{m.email}</td>
                                        <td className="p-3 text-xs">{m.storeName_ar || m.storeName_en || '—'}</td>
                                        <td className="p-3 text-xs font-mono" dir="ltr">{m.slug || '—'}</td>
                                        <td className="p-3 text-xs text-[var(--color-muted)]">
                                            {formatDate(m.subscriptionEndsAt)}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${subLabel.class}`}>
                                                {subLabel.ar}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    m.isActive
                                                        ? 'bg-green-500/10 text-green-500'
                                                        : 'bg-red-500/10 text-red-500'
                                                }`}
                                            >
                                                {m.isActive ? 'نشط' : 'موقوف'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openRenewModal(m)}
                                                    className="text-xs px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                                                >
                                                    تجديد
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(m._id)}
                                                    className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                                                        m.isActive
                                                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                                            : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                    }`}
                                                >
                                                    {m.isActive ? 'إيقاف' : 'تفعيل'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {merchants.length === 0 && (
                        <p className="text-center py-10 text-[var(--color-muted)]">لا يوجد تجار</p>
                    )}
                </div>
            )}

            {/* ─── Renewal Modal ─────────────────────────────── */}
            {renewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">تجديد الاشتراك</h2>
                            <button
                                onClick={() => setRenewModal(null)}
                                className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Merchant info */}
                        <div className="mb-5 p-3 rounded-xl bg-[var(--color-background)] text-sm space-y-1">
                            <p>
                                <span className="text-[var(--color-muted)]">التاجر: </span>
                                <span className="font-medium">{renewModal.ownerName || renewModal.storeName_ar || renewModal.email}</span>
                            </p>
                            {renewModal.phone && (
                                <p>
                                    <span className="text-[var(--color-muted)]">الجوال: </span>
                                    <span className="font-medium" dir="ltr">{renewModal.phone}</span>
                                </p>
                            )}
                            <p>
                                <span className="text-[var(--color-muted)]">ينتهي في: </span>
                                <span className="font-medium">{formatDate(renewModal.subscriptionEndsAt)}</span>
                            </p>
                        </div>

                        {/* Mode tabs */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setRenewMode('months')}
                                className={`flex-1 text-sm py-2 rounded-xl transition-colors font-medium ${
                                    renewMode === 'months'
                                        ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                                        : 'bg-[var(--color-background)] text-[var(--color-muted)]'
                                }`}
                            >
                                عدد الأشهر
                            </button>
                            <button
                                onClick={() => setRenewMode('custom')}
                                className={`flex-1 text-sm py-2 rounded-xl transition-colors font-medium ${
                                    renewMode === 'custom'
                                        ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                                        : 'bg-[var(--color-background)] text-[var(--color-muted)]'
                                }`}
                            >
                                تاريخ مخصص
                            </button>
                        </div>

                        {/* Mode content */}
                        {renewMode === 'months' ? (
                            <div className="grid grid-cols-2 gap-2 mb-5">
                                {MONTH_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setRenewMonths(opt.value)}
                                        className={`py-3 rounded-xl text-sm font-medium transition-all border ${
                                            renewMonths === opt.value
                                                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                                                : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/50'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="mb-5">
                                <input
                                    type="date"
                                    value={renewCustomDate}
                                    onChange={(e) => setRenewCustomDate(e.target.value)}
                                    className="input-field w-full"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleRenew}
                                disabled={renewLoading || (renewMode === 'custom' && !renewCustomDate)}
                                className="flex-1 btn-primary py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {renewLoading ? (
                                    <div className="spinner mx-auto" style={{ width: 18, height: 18 }} />
                                ) : (
                                    'تجديد الآن'
                                )}
                            </button>
                            <button
                                onClick={() => setRenewModal(null)}
                                className="px-5 py-2.5 text-sm rounded-xl bg-[var(--color-background)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
