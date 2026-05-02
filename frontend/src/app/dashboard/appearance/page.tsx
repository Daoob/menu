'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { THEMES, ThemeId } from '@/lib/constants';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import MenuPreview from '@/components/MenuPreview';

export default function AppearancePage() {
    const { merchant, refreshMerchant } = useAuth();
    const { t, lang } = useLanguage();
    const [saving, setSaving] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(merchant?.theme.selectedTheme || 1);
    const [mode, setMode] = useState(merchant?.theme.mode || 'light');
    const [customColors, setCustomColors] = useState(merchant?.theme.customColors || { primary: '#e94560', secondary: '#1a1a2e', background: '#ffffff', text: '#1a1a2e' });
    const [categories, setCategories] = useState<any[]>([]);

    const fetchProducts = useCallback(async () => {
        try {
            const [catRes, prodRes] = await Promise.all([api.get('/categories'), api.get('/products')]);
            const cats = catRes.data.categories.map((cat: any) => ({
                name_ar: cat.name_ar, name_en: cat.name_en,
                products: prodRes.data.products.filter((p: any) => p.category_id === cat._id && p.isVisible).map((p: any) => ({
                    name_ar: p.name_ar, name_en: p.name_en, price: p.price, image: p.image, description_ar: p.description_ar,
                })),
            })).filter((c: any) => c.products.length > 0);
            setCategories(cats);
        } catch { }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    if (!merchant) return null;

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/merchant/theme', { selectedTheme, mode, customColors: mode === 'custom' ? customColors : undefined });
            await refreshMerchant();
            toast.success(t('تم حفظ المظهر', 'Appearance saved'));
        } catch {
            toast.error(t('خطأ في الحفظ', 'Error saving'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">{t('المظهر والتصميم', 'Appearance & Design')}</h1>
                <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
                    {saving ? t('جاري الحفظ...', 'Saving...') : t('حفظ التغييرات', 'Save Changes')}
                </button>
            </div>

            <div className="flex gap-8">
                {/* Settings Panel */}
                <div className="flex-1 min-w-0">
                    {/* Theme Selection */}
                    <h2 className="font-bold mb-4">{t('اختر الثيم', 'Choose Theme')}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                        {Object.entries(THEMES).map(([id, theme]) => {
                            const themeId = Number(id) as ThemeId;
                            const light = theme.light;
                            const dark = theme.dark;
                            return (
                                <button key={id} onClick={() => setSelectedTheme(themeId)}
                                    className={`relative rounded-2xl overflow-hidden transition-all h-28 border-2 ${selectedTheme === themeId ? 'border-[var(--color-accent)] scale-[1.03] shadow-lg' : 'border-[var(--color-border)] hover:border-[var(--color-muted)]'}`}>
                                    {/* Mini preview of theme */}
                                    <div className="absolute inset-0 flex">
                                        <div className="w-1/2 h-full" style={{ backgroundColor: light.background }}>
                                            <div className="p-2 space-y-1.5">
                                                <div className="h-2 w-10 rounded-full" style={{ backgroundColor: light.accent }} />
                                                <div className="h-1.5 w-14 rounded-full" style={{ backgroundColor: light.text, opacity: 0.3 }} />
                                                <div className="rounded-md p-1.5 mt-1" style={{ backgroundColor: light.card }}>
                                                    <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: light.primary, opacity: 0.6 }} />
                                                    <div className="h-1 w-6 rounded-full mt-1" style={{ backgroundColor: light.accent, opacity: 0.8 }} />
                                                </div>
                                                <div className="rounded-md p-1.5" style={{ backgroundColor: light.card }}>
                                                    <div className="h-1.5 w-10 rounded-full" style={{ backgroundColor: light.primary, opacity: 0.6 }} />
                                                    <div className="h-1 w-5 rounded-full mt-1" style={{ backgroundColor: light.accent, opacity: 0.8 }} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-1/2 h-full" style={{ backgroundColor: dark.background }}>
                                            <div className="p-2 space-y-1.5">
                                                <div className="h-2 w-10 rounded-full" style={{ backgroundColor: dark.accent }} />
                                                <div className="h-1.5 w-14 rounded-full" style={{ backgroundColor: dark.text, opacity: 0.3 }} />
                                                <div className="rounded-md p-1.5 mt-1" style={{ backgroundColor: dark.card }}>
                                                    <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: dark.primary, opacity: 0.6 }} />
                                                    <div className="h-1 w-6 rounded-full mt-1" style={{ backgroundColor: dark.accent, opacity: 0.8 }} />
                                                </div>
                                                <div className="rounded-md p-1.5" style={{ backgroundColor: dark.card }}>
                                                    <div className="h-1.5 w-10 rounded-full" style={{ backgroundColor: dark.primary, opacity: 0.6 }} />
                                                    <div className="h-1 w-5 rounded-full mt-1" style={{ backgroundColor: dark.accent, opacity: 0.8 }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedTheme === themeId && (
                                        <div className="absolute top-2 end-2 w-5 h-5 bg-[var(--color-accent)] rounded-full flex items-center justify-center text-white text-[8px] shadow-md">✓</div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Mode Selection */}
                    <h2 className="font-bold mb-4">{t('وضع عرض القائمة للعملاء', 'Customer Menu Display Mode')}</h2>
                    <div className="flex gap-3 mb-8 flex-wrap">
                        {(['light', 'dark', 'custom'] as const).map((m) => (
                            <button key={m} onClick={() => setMode(m)}
                                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${mode === m ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-card)] text-[var(--color-muted)]'}`}>
                                {m === 'light' && t('فاتح ☀️', 'Light ☀️')}
                                {m === 'dark' && t('داكن 🌙', 'Dark 🌙')}
                                {m === 'custom' && t('مخصص 🎨', 'Custom 🎨')}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-[var(--color-muted)] -mt-6 mb-8">
                        {t('هذا يحدد كيف سيظهر موقعك للعملاء عند تصفح القائمة', 'This determines how your menu appears to customers')}
                    </p>

                    {/* Custom Colors */}
                    {mode === 'custom' && (
                        <div className="card mb-8">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { key: 'primary', label: t('اللون الأساسي', 'Primary') },
                                    { key: 'secondary', label: t('اللون الثانوي', 'Secondary') },
                                    { key: 'background', label: t('لون الخلفية', 'Background') },
                                    { key: 'text', label: t('لون النص', 'Text Color') },
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <label className="block text-sm font-medium mb-2">{label}</label>
                                        <div className="flex items-center gap-3">
                                            <input type="color" value={(customColors as any)[key] || '#000000'}
                                                onChange={(e) => setCustomColors({ ...customColors, [key]: e.target.value })}
                                                className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                                            <input type="text" value={(customColors as any)[key] || ''}
                                                onChange={(e) => setCustomColors({ ...customColors, [key]: e.target.value })}
                                                className="input-field text-sm font-mono" dir="ltr" placeholder="#000000" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Always-Visible Live Preview */}
                <div className="hidden lg:block sticky top-6 self-start flex-shrink-0">
                    <p className="text-center text-xs text-[var(--color-muted)] mb-3 font-medium">
                        {t('معاينة مباشرة', 'Live Preview')}
                    </p>
                    <MenuPreview
                        storeName_ar={merchant.storeName_ar || 'اسم المتجر'}
                        storeName_en={merchant.storeName_en || 'Store Name'}
                        logo={merchant.logo}
                        coverImage={merchant.coverImage}
                        selectedTheme={selectedTheme}
                        mode={mode}
                        customColors={mode === 'custom' ? customColors : undefined}
                        language={merchant.language}
                        categories={categories}
                        social={merchant.social}
                        whatsapp={merchant.whatsapp}
                        onModeChange={(newMode) => setMode(newMode)}
                    />
                </div>
            </div>

            {/* Mobile Preview */}
            <div className="lg:hidden mt-8">
                <p className="text-center text-xs text-[var(--color-muted)] mb-3 font-medium">
                    {t('معاينة مباشرة', 'Live Preview')}
                </p>
                <div className="flex justify-center">
                    <MenuPreview
                        storeName_ar={merchant.storeName_ar || 'اسم المتجر'}
                        storeName_en={merchant.storeName_en || 'Store Name'}
                        logo={merchant.logo}
                        coverImage={merchant.coverImage}
                        selectedTheme={selectedTheme}
                        mode={mode}
                        customColors={mode === 'custom' ? customColors : undefined}
                        language={merchant.language}
                        categories={categories}
                        social={merchant.social}
                        whatsapp={merchant.whatsapp}
                        onModeChange={(newMode) => setMode(newMode)}
                    />
                </div>
            </div>
        </div>
    );
}
