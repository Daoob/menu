'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { merchant, loading, logout, refreshMerchant } = useAuth();
    const { t, lang, setLang } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Profile completion modal state
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileName, setProfileName] = useState('');
    const [profilePhone, setProfilePhone] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);

    useEffect(() => {
        if (!loading && !merchant) router.push('/login');
    }, [loading, merchant, router]);

    // Check if profile is incomplete
    useEffect(() => {
        if (merchant && (!merchant.ownerName || !merchant.phone)) {
            setShowProfileModal(true);
            setProfileName(merchant.ownerName || '');
            setProfilePhone(merchant.phone || '');
        }
    }, [merchant]);

    useEffect(() => {
        const saved = localStorage.getItem('dashboardDarkMode');
        if (saved !== null) setDarkMode(saved === 'true');
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('dashboardDarkMode', String(darkMode));
    }, [darkMode]);

    const handleProfileSave = async () => {
        if (!profileName.trim()) {
            toast.error(t('الاسم مطلوب', 'Name is required'));
            return;
        }
        if (!profilePhone.trim()) {
            toast.error(t('رقم الجوال مطلوب', 'Phone number is required'));
            return;
        }
        setProfileSaving(true);
        try {
            await api.put('/merchant/store', {
                ownerName: profileName.trim(),
                phone: profilePhone.trim(),
            });
            toast.success(t('تم حفظ البيانات', 'Profile saved'));
            await refreshMerchant();
            setShowProfileModal(false);
        } catch {
            toast.error(t('حدث خطأ', 'An error occurred'));
        } finally {
            setProfileSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
    if (!merchant) return null;

    const SvgIcon = ({ d }: { d: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
    const navItems = [
        { href: '/dashboard', label_ar: 'لوحة التحكم', label_en: 'Dashboard', icon: <SvgIcon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" /> },
        { href: '/dashboard/products', label_ar: 'المنتجات', label_en: 'Products', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg> },
        { href: '/dashboard/appearance', label_ar: 'المظهر', label_en: 'Appearance', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="13.5" cy="6.5" r="2.5" /><path d="M17.08 8.94a10.8 10.8 0 0 1 0 6.12M6 12a6 6 0 0 0 12 0" /><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" /></svg> },
        { href: '/dashboard/settings', label_ar: 'الإعدادات', label_en: 'Settings', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
        { href: '/dashboard/guide', label_ar: 'دليل الاستخدام', label_en: 'User Guide', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 start-0 z-50 w-72 bg-[var(--color-card)] border-e border-[var(--color-border)] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:translate-x-0'}`}>
                <div className="p-6 border-b border-[var(--color-border)]">
                    <Link href="/" className="text-2xl font-bold gradient-text">daoob</Link>
                    <p className="text-xs text-[var(--color-muted)] mt-1">{merchant.email}</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${pathname === item.href
                                ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                                : 'text-[var(--color-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)]'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {lang === 'ar' ? item.label_ar : item.label_en}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-[var(--color-border)] space-y-2">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setDarkMode(!darkMode)} className="btn-ghost text-sm flex-1 text-start flex items-center gap-2">
                            {darkMode ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>} {t(darkMode ? 'وضع فاتح' : 'وضع داكن', darkMode ? 'Light Mode' : 'Dark Mode')}
                        </button>
                        <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="btn-ghost text-sm">
                            {lang === 'ar' ? 'EN' : 'عربي'}
                        </button>
                    </div>
                    <button
                        onClick={() => { logout(); router.push('/login'); }}
                        className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                        {t('تسجيل الخروج', 'Logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen">
                {/* Top bar (mobile) */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                    <button onClick={() => setSidebarOpen(true)} className="text-2xl"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg></button>
                    <span className="text-lg font-bold gradient-text">daoob</span>
                    <button onClick={() => setDarkMode(!darkMode)} className="text-lg">{darkMode ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>}</button>
                </div>

                <div className="p-6 lg:p-8">
                    {/* Subscription Banner */}
                    <SubscriptionBanner />
                    {children}
                </div>
            </main>

            {/* ─── Mandatory Profile Completion Modal ────────── */}
            {showProfileModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-7 animate-fade-in">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-center mb-1">
                            {t('أكمل بياناتك', 'Complete Your Profile')}
                        </h2>
                        <p className="text-sm text-[var(--color-muted)] text-center mb-6">
                            {t(
                                'يرجى إدخال اسمك ورقم جوالك للمتابعة',
                                'Please enter your name and phone number to continue'
                            )}
                        </p>

                        <div className="space-y-4">
                            {/* Owner Name */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    {t('الاسم الكامل', 'Full Name')}
                                </label>
                                <input
                                    type="text"
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                    className="input-field w-full"
                                    placeholder={t('مثال: محمد أحمد', 'e.g. Mohammed Ahmed')}
                                    autoFocus
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    {t('رقم الجوال', 'Phone Number')}
                                </label>
                                <input
                                    type="tel"
                                    value={profilePhone}
                                    onChange={(e) => setProfilePhone(e.target.value)}
                                    className="input-field w-full"
                                    placeholder="05XXXXXXXX"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleProfileSave}
                            disabled={profileSaving || !profileName.trim() || !profilePhone.trim()}
                            className="w-full btn-primary py-3 mt-6 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {profileSaving ? (
                                <div className="spinner mx-auto" style={{ width: 18, height: 18 }} />
                            ) : (
                                t('حفظ والمتابعة', 'Save & Continue')
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
