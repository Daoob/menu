'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import MenuQRCodeSection from '@/components/MenuQRCodeSection';

export default function SettingsPage() {
    const { merchant, refreshMerchant } = useAuth();
    const { t } = useLanguage();
    const [saving, setSaving] = useState(false);

    const [storeNameAr, setStoreNameAr] = useState('');
    const [storeNameEn, setStoreNameEn] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [language, setLanguage] = useState<'ar' | 'en' | 'both'>('both');
    const [slug, setSlug] = useState('');
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
    const [social, setSocial] = useState({ snapchat: '', instagram: '', tiktok: '', x: '' });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [coverUrl, setCoverUrl] = useState('');

    const logoAreaRef = useRef<HTMLDivElement>(null);
    const coverAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (merchant) {
            setStoreNameAr(merchant.storeName_ar || '');
            setStoreNameEn(merchant.storeName_en || '');
            setWhatsapp(merchant.whatsapp || '');
            setLanguage(merchant.language);
            setSlug(merchant.slug || '');
            setSocial(merchant.social || { snapchat: '', instagram: '', tiktok: '', x: '' });
        }
    }, [merchant]);

    const checkSlug = async (value: string) => {
        const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setSlug(clean);
        if (clean.length < 3) { setSlugAvailable(null); return; }
        try {
            const { data } = await api.get(`/merchant/slug/check/${clean}`);
            setSlugAvailable(data.available);
        } catch { setSlugAvailable(null); }
    };

    // Handle paste from clipboard (images)
    const handlePaste = (e: React.ClipboardEvent, type: 'logo' | 'cover') => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                e.preventDefault();
                const file = items[i].getAsFile();
                if (file) {
                    const preview = URL.createObjectURL(file);
                    if (type === 'logo') { setLogoFile(file); setLogoPreview(preview); setLogoUrl(''); }
                    else { setCoverFile(file); setCoverPreview(preview); setCoverUrl(''); }
                    toast.success(t('تم لصق الصورة ✓', 'Image pasted ✓'));
                }
            }
            // Handle pasted text (URL)
            if (items[i].type === 'text/plain') {
                items[i].getAsString((text) => {
                    if (text.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i)) {
                        if (type === 'logo') { setLogoUrl(text); setLogoFile(null); setLogoPreview(text); }
                        else { setCoverUrl(text); setCoverFile(null); setCoverPreview(text); }
                        toast.success(t('تم لصق رابط الصورة ✓', 'Image URL pasted ✓'));
                    }
                });
            }
        }
    };

    // Handle drag & drop
    const handleDrop = (e: React.DragEvent, type: 'logo' | 'cover') => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const preview = URL.createObjectURL(file);
            if (type === 'logo') { setLogoFile(file); setLogoPreview(preview); setLogoUrl(''); }
            else { setCoverFile(file); setCoverPreview(preview); setCoverUrl(''); }
            toast.success(t('تم إضافة الصورة ✓', 'Image added ✓'));
        }
    };

    const handleSaveStore = async () => {
        if (whatsapp && !/^05\d{8}$/.test(whatsapp)) {
            toast.error(t('رقم الواتساب يجب أن يبدأ بـ 05 ويكون 10 أرقام', 'WhatsApp must be 10 digits starting with 05'));
            return;
        }
        setSaving(true);
        try {
            await api.put('/merchant/store', { storeName_ar: storeNameAr, storeName_en: storeNameEn, whatsapp, language, social });
            if (slug && slug !== merchant?.slug) await api.put('/merchant/slug', { slug });

            // Upload logo file or URL
            if (logoFile) {
                const fd = new FormData(); fd.append('logo', logoFile);
                await api.post('/merchant/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else if (logoUrl) {
                await api.put('/merchant/store', { logo: logoUrl });
            }

            // Upload cover file or URL
            if (coverFile) {
                const fd = new FormData(); fd.append('cover', coverFile);
                await api.post('/merchant/cover', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else if (coverUrl) {
                await api.put('/merchant/store', { coverImage: coverUrl });
            }

            await refreshMerchant();
            toast.success(t('تم حفظ الإعدادات ✓', 'Settings saved ✓'));
            setLogoFile(null); setCoverFile(null); setLogoUrl(''); setCoverUrl('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('خطأ في الحفظ', 'Error saving'));
        } finally {
            setSaving(false);
        }
    };

    if (!merchant) return null;

    return (
        <div className="animate-fade-in max-w-2xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">{t('إعدادات المتجر', 'Store Settings')}</h1>
                <button onClick={handleSaveStore} disabled={saving} className="btn-primary disabled:opacity-50">
                    {saving ? t('جاري الحفظ...', 'Saving...') : t('حفظ', 'Save')}
                </button>
            </div>

            <div className="space-y-6">
                {/* Store Name */}
                <div className="card space-y-4">
                    <h2 className="font-bold">{t('اسم المتجر', 'Store Name')}</h2>
                    <input value={storeNameAr} onChange={e => setStoreNameAr(e.target.value)} className="input-field" placeholder={t('اسم المتجر بالعربية', 'Store name (Arabic)')} dir="rtl" />
                    <input value={storeNameEn} onChange={e => setStoreNameEn(e.target.value)} className="input-field" placeholder={t('اسم المتجر بالإنجليزية', 'Store name (English)')} dir="ltr" />
                </div>

                {/* Images - Logo & Cover */}
                <div className="card space-y-6">
                    <h2 className="font-bold">{t('الشعار وصورة الغلاف', 'Logo & Cover Image')}</h2>

                    {/* Logo */}
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('الشعار', 'Logo')}</label>
                        <div
                            ref={logoAreaRef}
                            onPaste={e => handlePaste(e, 'logo')}
                            onDrop={e => handleDrop(e, 'logo')}
                            onDragOver={e => e.preventDefault()}
                            tabIndex={0}
                            className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-4 text-center cursor-pointer hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                            onClick={() => { const input = logoAreaRef.current?.querySelector('input[type=file]') as HTMLInputElement; input?.click(); }}
                        >
                            {(logoPreview || merchant.logo) && (
                                <img src={logoPreview || merchant.logo!} alt="Logo" className="w-20 h-20 rounded-xl object-cover mx-auto mb-3" />
                            )}
                            <p className="text-sm text-[var(--color-muted)]">
                                {t('اختر ملف · Ctrl+V للصق · او الصق رابط صورة', 'Choose file · Ctrl+V to paste · or paste image URL')}
                            </p>
                            <input type="file" accept="image/*" className="hidden" onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); setLogoUrl(''); }
                            }} />
                        </div>
                        <input
                            value={logoUrl}
                            onChange={e => { setLogoUrl(e.target.value); if (e.target.value) { setLogoPreview(e.target.value); setLogoFile(null); } }}
                            className="input-field mt-2 text-sm"
                            placeholder={t('أو الصق رابط الصورة هنا...', 'Or paste image URL here...')}
                            dir="ltr"
                        />
                        {logoFile && <p className="text-xs text-green-500 mt-1">✓ {logoFile.name}</p>}
                    </div>

                    {/* Cover */}
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('صورة الغلاف', 'Cover Image')}</label>
                        <div
                            ref={coverAreaRef}
                            onPaste={e => handlePaste(e, 'cover')}
                            onDrop={e => handleDrop(e, 'cover')}
                            onDragOver={e => e.preventDefault()}
                            tabIndex={0}
                            className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-4 text-center cursor-pointer hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                            onClick={() => { const input = coverAreaRef.current?.querySelector('input[type=file]') as HTMLInputElement; input?.click(); }}
                        >
                            {(coverPreview || merchant.coverImage) && (
                                <img src={coverPreview || merchant.coverImage!} alt="Cover" className="w-full h-32 rounded-xl object-cover mx-auto mb-3" />
                            )}
                            <p className="text-sm text-[var(--color-muted)]">
                                {t('اختر ملف · Ctrl+V للصق · او الصق رابط صورة', 'Choose file · Ctrl+V to paste · or paste image URL')}
                            </p>
                            <input type="file" accept="image/*" className="hidden" onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); setCoverUrl(''); }
                            }} />
                        </div>
                        <input
                            value={coverUrl}
                            onChange={e => { setCoverUrl(e.target.value); if (e.target.value) { setCoverPreview(e.target.value); setCoverFile(null); } }}
                            className="input-field mt-2 text-sm"
                            placeholder={t('أو الصق رابط الصورة هنا...', 'Or paste image URL here...')}
                            dir="ltr"
                        />
                        {coverFile && <p className="text-xs text-green-500 mt-1">✓ {coverFile.name}</p>}
                    </div>
                </div>

                {/* WhatsApp */}
                <div className="card space-y-4">
                    <h2 className="font-bold">{t('واتساب', 'WhatsApp')}</h2>
                    <input value={whatsapp} onChange={e => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))} className="input-field" placeholder="05XXXXXXXX" dir="ltr" />
                    <p className="text-xs text-[var(--color-muted)]">{t('10 أرقام تبدأ بـ 05', '10 digits starting with 05')}</p>
                </div>

                {/* Menu Link / Slug */}
                <div className="card space-y-4">
                    <h2 className="font-bold">{t('رابط القائمة', 'Menu Link')}</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--color-muted)]" dir="ltr">yoursite.com/menu/</span>
                        <input value={slug} onChange={e => checkSlug(e.target.value)} className="input-field flex-1" placeholder="my-restaurant" dir="ltr" />
                    </div>
                    {slug.length >= 3 && slugAvailable !== null && (
                        <p className={`text-xs ${slugAvailable ? 'text-green-500' : 'text-red-500'}`}>
                            {slugAvailable ? t('✓ متاح', '✓ Available') : t('✗ غير متاح', '✗ Not available')}
                        </p>
                    )}
                </div>

                {/* Language */}
                <div className="card space-y-4">
                    <h2 className="font-bold">{t('لغة القائمة', 'Menu Language')}</h2>
                    <div className="flex gap-3">
                        {(['ar', 'en', 'both'] as const).map(l => (
                            <button key={l} onClick={() => setLanguage(l)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${language === l ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-background)] text-[var(--color-muted)]'}`}>
                                {l === 'ar' ? t('عربي', 'Arabic') : l === 'en' ? t('إنجليزي', 'English') : t('كلاهما', 'Both')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Social Links */}
                <div className="card space-y-4">
                    <h2 className="font-bold">{t('روابط التواصل الاجتماعي', 'Social Media Links')}</h2>
                    <p className="text-xs text-[var(--color-muted)]">{t('جميعها اختيارية', 'All optional')}</p>
                    {[
                        { key: 'snapchat', label: 'Snapchat', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.04-.012.06-.012.1 0 .12.036.24.12.286.192.038.06.068.18.008.298a.45.45 0 01-.188.18c-.18.09-.42.162-.66.222-.12.03-.24.06-.33.09-.119.04-.239.09-.329.15-.06.03-.119.09-.149.15-.03.06-.03.12-.008.18.06.12.18.24.3.33.24.18.471.33.731.46.21.12.42.21.63.27.11.03.22.06.31.1.18.06.3.18.33.33.03.15-.03.3-.12.42-.18.21-.42.39-.72.51-.21.09-.42.15-.63.18-.06.015-.12.015-.18.03-.03.015-.06.03-.09.06-.03.06-.03.12-.03.18 0 .06 0 .12.03.18.03.03.06.06.09.09.03.015.06.03.09.045.21.06.42.12.63.21.3.12.6.24.9.42.51.27.78.69.78 1.14 0 .72-.78 1.35-2.07 1.68-.27.06-.54.12-.81.15-.18.03-.36.03-.54.06-.12.015-.24.045-.33.09-.06.03-.12.06-.18.12-.06.09-.09.18-.09.3v.06c0 .03 0 .06-.03.09-.03.06-.09.09-.15.09h-.06c-.42-.03-.84-.12-1.26-.21-.18-.03-.36-.09-.54-.12a6.03 6.03 0 00-.72-.06c-.24 0-.48.03-.72.06-.18.03-.36.09-.54.12-.42.09-.84.18-1.26.21h-.06c-.06 0-.12-.03-.15-.09-.03-.03-.03-.06-.03-.09v-.06c0-.12-.03-.21-.09-.3-.06-.06-.12-.09-.18-.12-.09-.045-.21-.075-.33-.09-.18-.03-.36-.03-.54-.06-.27-.03-.54-.09-.81-.15C3.78 20.1 3 19.47 3 18.75c0-.45.27-.87.78-1.14.3-.18.6-.3.9-.42.21-.09.42-.15.63-.21.03-.015.06-.03.09-.045.03-.03.06-.06.09-.09.03-.06.03-.12.03-.18 0-.06 0-.12-.03-.18-.03-.06-.06-.045-.09-.06-.03-.015-.06-.03-.09-.06-.06-.015-.12-.015-.18-.03-.21-.03-.42-.09-.63-.18-.3-.12-.54-.3-.72-.51-.09-.12-.15-.27-.12-.42.03-.15.15-.27.33-.33.09-.04.2-.07.31-.1.21-.06.42-.15.63-.27.26-.13.491-.28.731-.46.12-.09.24-.21.3-.33.022-.06.022-.12-.008-.18-.03-.06-.089-.12-.149-.15-.09-.06-.21-.11-.329-.15-.09-.03-.21-.06-.33-.09-.24-.06-.48-.132-.66-.222a.45.45 0 01-.188-.18c-.06-.118-.03-.238.008-.298.046-.072.166-.156.286-.192.04-.012.06-.012.1 0 .263.094.622.198.922.214.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.859 1.069 11.216.793 12.206.793z" /></svg> },
                        { key: 'instagram', label: 'Instagram', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg> },
                        { key: 'tiktok', label: 'TikTok', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.55a8.28 8.28 0 0 0 4.76 1.5v-3.4c-.01 0-1 .04-1 .04z" /></svg> },
                        { key: 'x', label: 'X (Twitter)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                    ].map(({ key, label, icon }) => (
                        <div key={key} className="flex items-center gap-3">
                            <span className="text-lg">{icon}</span>
                            <input
                                value={(social as any)[key]}
                                onChange={e => setSocial({ ...social, [key]: e.target.value })}
                                className="input-field flex-1"
                                placeholder={`${label} ${t('اسم المستخدم أو الرابط', 'username or URL')}`}
                                dir="ltr"
                            />
                        </div>
                    ))}
                </div>

                {/* QR Code */}
                {merchant.slug && (
                    <MenuQRCodeSection
                        menuPublicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/menu/${merchant.slug}`}
                        restaurantName={merchant.storeName_ar || merchant.storeName_en || merchant.slug}
                    />
                )}
            </div>
        </div>
    );
}
