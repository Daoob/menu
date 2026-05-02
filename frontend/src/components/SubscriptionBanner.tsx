'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMemo } from 'react';

const GRACE_DAYS = 15;

/** Convert Western digits to Arabic-Indic digits */
function toArabicDigits(n: number): string {
    return n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
}

type SubStatus = 'active' | 'grace' | 'expired';

interface SubInfo {
    status: SubStatus;
    daysRemaining: number;
}

function computeSubscription(endsAt: string | null | undefined): SubInfo {
    if (!endsAt) return { status: 'expired', daysRemaining: 0 };

    const now = new Date();
    const end = new Date(endsAt);
    const diffMs = end.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysRemaining > 0) {
        return { status: 'active', daysRemaining };
    }

    const graceEndMs = end.getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000;
    if (now.getTime() <= graceEndMs) {
        return { status: 'grace', daysRemaining: 0 };
    }

    return { status: 'expired', daysRemaining: 0 };
}

export default function SubscriptionBanner() {
    const { merchant } = useAuth();
    const { lang } = useLanguage();

    const sub = useMemo(
        () => computeSubscription(merchant?.subscriptionEndsAt),
        [merchant?.subscriptionEndsAt]
    );

    // No banner if active with > 7 days remaining, or if no merchant
    if (!merchant) return null;
    if (sub.status === 'active' && sub.daysRemaining > 7) return null;

    // ─── Active ≤ 7 days → Warning banner ───────────────────────
    if (sub.status === 'active') {
        const days = sub.daysRemaining;
        const daysAr = toArabicDigits(days);

        let daysText: string;
        if (lang === 'ar') {
            if (days === 1) daysText = `متبقي يوم واحد لاشتراكك`;
            else if (days === 2) daysText = `متبقي يومين لاشتراكك`;
            else daysText = `متبقي ${daysAr} أيام لاشتراكك`;
        } else {
            daysText = `${days} day${days !== 1 ? 's' : ''} remaining in your subscription`;
        }

        return (
            <div
                id="subscription-banner-warning"
                className="mb-4 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3.5 text-amber-600 dark:text-amber-400"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className="text-sm font-semibold">{daysText}</span>
            </div>
        );
    }

    // ─── Grace period → Red banner ──────────────────────────────
    if (sub.status === 'grace') {
        return (
            <div
                id="subscription-banner-grace"
                className="mb-4 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/15 px-5 py-4 text-red-600 dark:text-red-400"
            >
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="text-sm font-bold">
                    {lang === 'ar'
                        ? 'اشتراكك انتهى وسيختفي المنيو في أي وقت'
                        : 'Your subscription has expired. The menu will disappear at any time.'}
                </span>
            </div>
        );
    }

    // ─── Expired → Big red banner ───────────────────────────────
    return (
        <div
            id="subscription-banner-expired"
            className="mb-4 flex items-center gap-3 rounded-xl border-2 border-red-600/40 bg-red-600/20 px-5 py-5 text-red-700 dark:text-red-400"
        >
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span className="text-base font-extrabold">
                {lang === 'ar'
                    ? 'المنيو مختفي حالياً - تواصل مع الإدارة للتجديد'
                    : 'Your menu is currently hidden — contact support to renew.'}
            </span>
        </div>
    );
}
