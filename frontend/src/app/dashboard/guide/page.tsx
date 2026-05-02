'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function GuidePage() {
    const { t } = useLanguage();

    const steps = [
        { step: '1', title_ar: 'إعداد المتجر', title_en: 'Store Setup', desc_ar: 'اذهب إلى "الإعدادات" وأدخل اسم متجرك بالعربية والإنجليزية، وأضف الشعار وصورة الغلاف.', desc_en: 'Go to "Settings" and enter your store name in Arabic and English, add your logo and cover image.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
        { step: '2', title_ar: 'إضافة المنتجات', title_en: 'Add Products', desc_ar: 'اذهب إلى "المنتجات"، أنشئ تصنيفات ثم أضف منتجاتك مع الأسعار والصور.', desc_en: 'Go to "Products", create categories then add your products with prices and images.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg> },
        { step: '3', title_ar: 'اختيار التصميم', title_en: 'Choose Design', desc_ar: 'اذهب إلى "المظهر" واختر ثيمًا من 6 ثيمات جاهزة أو خصص ألوانك.', desc_en: 'Go to "Appearance" and choose from 6 ready themes or customize your colors.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="13.5" cy="6.5" r="2.5" /><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" /></svg> },
        { step: '4', title_ar: 'إعداد رابط القائمة', title_en: 'Set Menu Link', desc_ar: 'في "الإعدادات"، اختر slug مخصص لرابط قائمتك مثل yoursite.com/menu/my-cafe', desc_en: 'In "Settings", choose a custom slug for your menu link like yoursite.com/menu/my-cafe', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg> },
        { step: '5', title_ar: 'مشاركة القائمة', title_en: 'Share Menu', desc_ar: 'انسخ رابط قائمتك من لوحة التحكم أو حمّل رمز QR لطباعته ووضعه على الطاولات.', desc_en: 'Copy your menu link from the dashboard or download the QR code to print and place on tables.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg> },
    ];

    return (
        <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-6">{t('دليل الاستخدام', 'User Guide')}</h1>

            <div className="card mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold">{t('دليل إعداد القائمة الرقمية', 'Digital Menu Setup Guide')}</h2>
                    <a href="/guide/merchant-guide.pdf" download className="btn-primary text-sm flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        {t('تحميل PDF', 'Download PDF')}
                    </a>
                </div>
                <p className="text-[var(--color-muted)] text-sm mb-4">
                    {t('دليل شامل خطوة بخطوة لإعداد وتصميم قائمتك الرقمية', 'A comprehensive step-by-step guide to set up and design your digital menu')}
                </p>
            </div>

            {/* Inline Guide */}
            <div className="space-y-4">
                {steps.map(({ step, title_ar, title_en, desc_ar, desc_en, icon }) => (
                    <div key={step} className="card-hover flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0" style={{ color: 'var(--color-accent)' }}>{icon}</div>
                        <div>
                            <h3 className="font-bold text-sm mb-1">
                                <span className="text-[var(--color-accent)]">{t(`الخطوة ${step}`, `Step ${step}`)}</span> — {t(title_ar, title_en)}
                            </h3>
                            <p className="text-sm text-[var(--color-muted)]">{t(desc_ar, desc_en)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
