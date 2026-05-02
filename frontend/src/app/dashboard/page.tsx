'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

const SvgI = ({ children }: { children: React.ReactNode }) => <span className="block w-fit">{children}</span>;

export default function DashboardHome() {
    const { merchant } = useAuth();
    const { t, lang } = useLanguage();

    if (!merchant) return null;

    const menuUrl = merchant.slug ? `${window.location.origin}/menu/${merchant.slug}` : null;

    const cards = [
        { label: t('اسم المتجر', 'Store Name'), value: lang === 'ar' ? merchant.storeName_ar || '—' : merchant.storeName_en || '—', icon: <SvgI><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg></SvgI>, color: 'from-blue-500 to-cyan-400' },
        { label: t('رابط القائمة', 'Menu Link'), value: merchant.slug ? `/menu/${merchant.slug}` : t('غير محدد', 'Not set'), icon: <SvgI><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg></SvgI>, color: 'from-emerald-500 to-teal-400' },
        { label: t('الثيم', 'Theme'), value: `${t('ثيم', 'Theme')} ${merchant.theme.selectedTheme}`, icon: <SvgI><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="13.5" cy="6.5" r="2.5" /><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" /></svg></SvgI>, color: 'from-purple-500 to-pink-400' },
        { label: t('اللغة', 'Language'), value: merchant.language === 'both' ? t('عربي + إنجليزي', 'Arabic + English') : merchant.language === 'ar' ? t('عربي', 'Arabic') : t('إنجليزي', 'English'), icon: <SvgI><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg></SvgI>, color: 'from-orange-500 to-amber-400' },
    ];

    const quickLinks = [
        { href: '/dashboard/products', label: t('إدارة المنتجات', 'Manage Products'), icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>, desc: t('أضف وعدّل منتجاتك', 'Add and edit products') },
        { href: '/dashboard/appearance', label: t('تخصيص المظهر', 'Customize Appearance'), icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="13.5" cy="6.5" r="2.5" /><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" /></svg>, desc: t('غيّر الثيم والألوان', 'Change theme and colors') },
        { href: '/dashboard/settings', label: t('إعدادات المتجر', 'Store Settings'), icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>, desc: t('المعلومات والروابط', 'Info and social links') },
    ];

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    {t('مرحبًا بك!', 'Welcome!')}
                </h1>
                <p className="text-[var(--color-muted)]">
                    {t('هذه لوحة تحكم متجرك. ابدأ بإعداد قائمتك.', 'This is your store dashboard. Start setting up your menu.')}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map((card, i) => (
                    <div key={i} className="card-hover relative overflow-hidden">
                        <div className={`absolute top-0 end-0 w-20 h-20 bg-gradient-to-br ${card.color} opacity-10 rounded-full -translate-y-4 translate-x-4 rtl:-translate-x-4`} />
                        <span className="text-2xl mb-2 block">{card.icon}</span>
                        <p className="text-xs text-[var(--color-muted)] mb-1">{card.label}</p>
                        <p className="text-sm font-bold truncate">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Menu Link */}
            {menuUrl && (
                <div className="card mb-8 bg-gradient-to-r from-[var(--color-accent)]/10 to-transparent border-[var(--color-accent)]/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold mb-1">{t('رابط قائمتك', 'Your Menu Link')}</h3>
                            <p className="text-sm text-[var(--color-accent)] font-mono" dir="ltr">{menuUrl}</p>
                        </div>
                        <button
                            onClick={() => { navigator.clipboard.writeText(menuUrl); }}
                            className="btn-primary text-sm"
                        >
                            {t('نسخ الرابط', 'Copy Link')}
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Links */}
            <h2 className="text-lg font-bold mb-4">{t('وصول سريع', 'Quick Access')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
                {quickLinks.map((link, i) => (
                    <Link key={i} href={link.href} className="card-hover group">
                        <span className="mb-3 block group-hover:scale-110 transition-transform">{link.icon}</span>
                        <h3 className="font-bold text-sm mb-1">{link.label}</h3>
                        <p className="text-xs text-[var(--color-muted)]">{link.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
