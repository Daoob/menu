'use client';

import { useState, useRef } from 'react';
import { THEMES, ThemeId } from '@/lib/constants';

interface MenuPreviewProps {
    storeName_ar?: string;
    storeName_en?: string;
    logo?: string | null;
    coverImage?: string | null;
    selectedTheme: number;
    mode: 'light' | 'dark' | 'custom';
    customColors?: { primary?: string; secondary?: string; background?: string; text?: string };
    language?: 'ar' | 'en' | 'both';
    categories?: { name_ar: string; name_en: string; products: { name_ar: string; name_en: string; price: number; image?: string | null; description_ar?: string }[] }[];
    social?: { snapchat?: string; instagram?: string; tiktok?: string; x?: string };
    whatsapp?: string;
    onModeChange?: (mode: 'light' | 'dark') => void;
}

// Inline SVG Icons (B&W)
const Icons = {
    moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
    search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    x: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    plus: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    minus: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    cart: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>,
    whatsapp: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
    trash: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    coffee: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    instagram: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>,
    snapchat: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.04-.012.06-.012.1 0 .12.036.24.12.286.192.038.06.068.18.008.298a.45.45 0 01-.188.18c-.18.09-.42.162-.66.222-.12.03-.24.06-.33.09-.119.04-.239.09-.329.15-.06.03-.119.09-.149.15-.03.06-.03.12-.008.18.06.12.18.24.3.33.24.18.471.33.731.46.21.12.42.21.63.27.11.03.22.06.31.1.18.06.3.18.33.33.03.15-.03.3-.12.42-.18.21-.42.39-.72.51-.21.09-.42.15-.63.18-.06.015-.12.015-.18.03-.03.015-.06.03-.09.06-.03.06-.03.12-.03.18 0 .06 0 .12.03.18.03.03.06.06.09.09.03.015.06.03.09.045.21.06.42.12.63.21.3.12.6.24.9.42.51.27.78.69.78 1.14 0 .72-.78 1.35-2.07 1.68-.27.06-.54.12-.81.15-.18.03-.36.03-.54.06-.12.015-.24.045-.33.09-.06.03-.12.06-.18.12-.06.09-.09.18-.09.3v.06c0 .03 0 .06-.03.09-.03.06-.09.09-.15.09h-.06c-.42-.03-.84-.12-1.26-.21-.18-.03-.36-.09-.54-.12a6.03 6.03 0 00-.72-.06c-.24 0-.48.03-.72.06-.18.03-.36.09-.54.12-.42.09-.84.18-1.26.21h-.06c-.06 0-.12-.03-.15-.09-.03-.03-.03-.06-.03-.09v-.06c0-.12-.03-.21-.09-.3-.06-.06-.12-.09-.18-.12-.09-.045-.21-.075-.33-.09-.18-.03-.36-.03-.54-.06-.27-.03-.54-.09-.81-.15C3.78 20.1 3 19.47 3 18.75c0-.45.27-.87.78-1.14.3-.18.6-.3.9-.42.21-.09.42-.15.63-.21.03-.015.06-.03.09-.045.03-.03.06-.06.09-.09.03-.06.03-.12.03-.18 0-.06 0-.12-.03-.18-.03-.06-.06-.045-.09-.06-.03-.015-.06-.03-.09-.06-.06-.015-.12-.015-.18-.03-.21-.03-.42-.09-.63-.18-.3-.12-.54-.3-.72-.51-.09-.12-.15-.27-.12-.42.03-.15.15-.27.33-.33.09-.04.2-.07.31-.1.21-.06.42-.15.63-.27.26-.13.491-.28.731-.46.12-.09.24-.21.3-.33.022-.06.022-.12-.008-.18-.03-.06-.089-.12-.149-.15-.09-.06-.21-.11-.329-.15-.09-.03-.21-.06-.33-.09-.24-.06-.48-.132-.66-.222a.45.45 0 01-.188-.18c-.06-.118-.03-.238.008-.298.046-.072.166-.156.286-.192.04-.012.06-.012.1 0 .263.094.622.198.922.214.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.859 1.069 11.216.793 12.206.793z" /></svg>,
    tiktok: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.55a8.28 8.28 0 0 0 4.76 1.5v-3.4c-.01 0-1 .04-1 .04z" /></svg>,
    xTwitter: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
    chevronUp: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>,
};

export default function MenuPreview({
    storeName_ar = 'اسم المتجر',
    storeName_en = 'Store Name',
    logo,
    coverImage,
    selectedTheme = 1,
    mode = 'light',
    customColors,
    language = 'ar',
    categories = [],
    social,
    whatsapp,
    onModeChange,
}: MenuPreviewProps) {
    const [previewMode, setPreviewMode] = useState<'light' | 'dark'>(mode === 'dark' ? 'dark' : 'light');
    const [activeTab, setActiveTab] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [cart, setCart] = useState<{ name: string; price: number; qty: number }[]>([]);
    const [showCart, setShowCart] = useState(false);
    const screenRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

    const themeId = selectedTheme as ThemeId;
    const themeData = THEMES[themeId] || THEMES[1];
    let c: any;
    if (mode === 'custom' && customColors) {
        const isBgLight = isLightColor(customColors.background || '#fff');
        c = {
            primary: customColors.primary || '#706D54', secondary: customColors.secondary || '#A08963',
            bg: customColors.background || '#F5F2EC', bgCard: isBgLight ? '#FFFFFF' : lighten(customColors.background || '#000', 8),
            bgNav: (customColors.background || '#F5F2EC') + 'e0', text: customColors.text || '#2C2A22',
            textSec: customColors.primary || '#706D54', accent: customColors.primary || '#A08963',
            border: (customColors.text || '#2C2A22') + '15', accentGlow: (customColors.primary || '#A08963') + '20',
        };
    } else {
        const t = previewMode === 'dark' ? themeData.dark : themeData.light;
        c = {
            primary: t.primary, secondary: t.secondary, bg: t.background, bgCard: t.card,
            bgNav: t.background + 'e0', text: t.text, textSec: t.primary, accent: t.accent,
            border: t.text + '12', accentGlow: t.accent + '20',
        };
    }

    const isAr = language !== 'en';
    const dir = language === 'en' ? 'ltr' : 'rtl';
    const getName = (ar: string, en: string) => language === 'en' ? (en || ar) : ar;

    const demoCategories = categories.length > 0 ? categories : [
        {
            name_ar: 'المشروبات الساخنة', name_en: 'Hot Drinks', products: [
                { name_ar: 'قهوة عربية', name_en: 'Arabic Coffee', price: 15, description_ar: 'قهوة أصيلة مع هيل' },
                { name_ar: 'كابتشينو', name_en: 'Cappuccino', price: 22, description_ar: 'كابتشينو كلاسيكي' },
                { name_ar: 'شاي أخضر', name_en: 'Green Tea', price: 12, description_ar: 'شاي أخضر طبيعي' },
            ]
        },
        {
            name_ar: 'الحلويات', name_en: 'Desserts', products: [
                { name_ar: 'كنافة', name_en: 'Kunafa', price: 28, description_ar: 'كنافة نابلسية' },
                { name_ar: 'بسبوسة', name_en: 'Basbousa', price: 18, description_ar: 'بسبوسة بالقشطة' },
            ]
        },
        {
            name_ar: 'المشروبات الباردة', name_en: 'Cold Drinks', products: [
                { name_ar: 'عصير برتقال', name_en: 'Orange Juice', price: 16, description_ar: 'عصير طازج' },
                { name_ar: 'سموذي توت', name_en: 'Berry Smoothie', price: 25, description_ar: 'مزيج التوت' },
            ]
        },
    ];

    const filteredCategories = demoCategories.map(cat => ({
        ...cat, products: cat.products.filter(p =>
            p.name_ar.includes(searchText) || p.name_en?.toLowerCase().includes(searchText.toLowerCase())
        ),
    })).filter(cat => cat.products.length > 0);

    const addToCart = (name: string, price: number) => {
        const existing = cart.find(i => i.name === name);
        if (existing) setCart(cart.map(i => i.name === name ? { ...i, qty: i.qty + 1 } : i));
        else setCart([...cart, { name, price, qty: 1 }]);
    };
    const updateQty = (name: string, delta: number) => {
        setCart(prev => prev.map(i => i.name === name ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
    };
    const totalItems = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

    const handleModeToggle = () => {
        const newMode = previewMode === 'dark' ? 'light' : 'dark';
        setPreviewMode(newMode);
        if (onModeChange) onModeChange(newMode);
    };

    const scrollToSection = (index: number) => {
        setActiveTab(index);
        const el = sectionRefs.current[index];
        if (el && screenRef.current) {
            screenRef.current.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
        }
    };

    const sendToWhatsApp = () => {
        const phone = whatsapp ? `966${whatsapp.replace(/^0/, '')}` : '';
        let msg = isAr ? `*طلب جديد*\n\n` : `*New Order*\n\n`;
        cart.forEach(item => { msg += `• ${item.name} × ${item.qty} = ${(item.price * item.qty).toFixed(0)} ${isAr ? 'ر.س' : 'SAR'}\n`; });
        msg += `\n*${isAr ? 'الإجمالي' : 'Total'}:* ${totalPrice.toFixed(0)} ${isAr ? 'ر.س' : 'SAR'}`;
        const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
        setCart([]); setShowCart(false);
    };

    return (
        <div className="relative mx-auto" style={{ width: '320px' }}>
            <div className="rounded-[2.5rem] border-[6px] border-gray-800 dark:border-gray-600 shadow-2xl overflow-hidden bg-gray-800">
                {/* Notch */}
                <div className="bg-gray-800 flex justify-center py-1"><div className="w-20 h-5 bg-gray-900 rounded-full" /></div>

                {/* Screen */}
                <div ref={screenRef} className="overflow-y-auto overflow-x-hidden relative" dir={dir}
                    style={{ backgroundColor: c.bg, color: c.text, height: '520px', fontFamily: "'Tajawal', sans-serif", scrollBehavior: 'smooth' }}>

                    {/* Hero Header */}
                    <div className="relative text-center pt-8 pb-5 px-4" style={{ background: `linear-gradient(180deg, ${c.accentGlow}, ${c.bg})` }}>
                        {/* Theme Toggle */}
                        {mode !== 'custom' && (
                            <button onClick={handleModeToggle}
                                className="absolute top-3 start-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90"
                                style={{ backgroundColor: c.bgCard, color: c.accent }}>
                                {previewMode === 'dark' ? Icons.sun : Icons.moon}
                            </button>
                        )}
                        {/* Logo */}
                        <div className="w-16 h-16 rounded-full mx-auto mb-2 overflow-hidden border-2 shadow-lg"
                            style={{ borderColor: `${c.bg}80`, backgroundColor: c.bgCard }}>
                            {logo ? <img src={logo} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center" style={{ color: c.accent, fontSize: 18, fontWeight: 700 }}>{(storeName_ar || storeName_en || 'D')[0]}</div>}
                        </div>
                        <h1 className="text-sm font-extrabold" style={{ color: c.text }}>{getName(storeName_ar, storeName_en)}</h1>
                        <p className="text-[9px] mt-0.5 font-medium" style={{ color: c.textSec, opacity: 0.7 }}>
                            {isAr ? 'القائمة' : 'Menu'}
                        </p>

                    </div>

                    {/* Sticky Nav */}
                    <div className="sticky top-0 z-20 backdrop-blur-lg border-b" style={{ backgroundColor: c.bgNav, borderColor: c.border }}>
                        <div className="flex gap-1 px-2 py-1.5 overflow-x-auto" style={{ scrollBehavior: 'smooth' }}>
                            {demoCategories.map((cat, i) => (
                                <button key={i} onClick={() => scrollToSection(i)}
                                    className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-center flex-shrink-0 transition-all active:scale-95"
                                    style={{
                                        backgroundColor: activeTab === i ? c.primary : 'transparent',
                                        color: activeTab === i ? '#fff' : c.textSec,
                                        fontSize: '9px', fontWeight: 600, whiteSpace: 'nowrap',
                                    }}>
                                    <span>{getName(cat.name_ar, cat.name_en)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search */}
                    <div className="px-3 pt-2">
                        <div className="relative">
                            <span className="absolute top-1/2 -translate-y-1/2 start-2.5" style={{ color: c.textSec, opacity: 0.4 }}>{Icons.search}</span>
                            <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)}
                                placeholder={isAr ? 'ابحث عن منتج...' : 'Search...'}
                                className="w-full ps-8 pe-8 py-2 rounded-xl text-[10px] focus:outline-none border transition-colors"
                                style={{ backgroundColor: c.bgCard, color: c.text, borderColor: c.border }} />
                            {searchText && <button onClick={() => setSearchText('')} className="absolute top-1/2 -translate-y-1/2 end-2.5" style={{ color: c.textSec, opacity: 0.5 }}>{Icons.x}</button>}
                        </div>
                    </div>

                    {/* Menu Sections */}
                    <div className="px-3 pb-20 pt-2 space-y-4">
                        {filteredCategories.map((cat, ci) => (
                            <div key={ci} ref={el => { sectionRefs.current[ci] = el; }}>
                                {/* Section Title - Badge style */}
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold shadow-sm"
                                        style={{ backgroundColor: c.primary, color: '#fff' }}>
                                        {getName(cat.name_ar, cat.name_en)}
                                    </span>
                                    <div className="flex-1 h-px" style={{ backgroundColor: c.border }} />
                                </div>
                                {/* 2-Column Grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    {cat.products.map((p, pi) => (
                                        <div key={pi} className="rounded-2xl overflow-hidden border transition-all active:scale-[0.97]"
                                            style={{ backgroundColor: c.bgCard, borderColor: c.border }}>
                                            {/* Image or placeholder */}
                                            {p.image ? (
                                                <div className="w-full aspect-[4/3] overflow-hidden">
                                                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-full aspect-[4/3] flex items-center justify-center"
                                                    style={{ background: `linear-gradient(135deg, ${c.accentGlow}, transparent)` }}>
                                                    <span style={{ color: c.accent, opacity: 0.15, fontSize: '18px', fontWeight: 700 }}>{getName(p.name_ar, p.name_en)[0]}</span>
                                                </div>
                                            )}
                                            <div className="p-2">
                                                <h3 className="text-[10px] font-bold leading-tight truncate">{getName(p.name_ar, p.name_en)}</h3>
                                                {p.description_ar && <p className="text-[8px] mt-0.5 leading-tight truncate" style={{ color: c.textSec, opacity: 0.6 }}>{p.description_ar}</p>}
                                                <div className="flex items-center justify-between mt-1.5">
                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                                                        style={{ backgroundColor: c.accentGlow, color: c.accent }}>
                                                        {p.price} <span className="text-[7px] opacity-70">ر.س</span>
                                                    </span>
                                                    <button onClick={e => { e.stopPropagation(); addToCart(getName(p.name_ar, p.name_en), p.price); }}
                                                        className="w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90"
                                                        style={{ backgroundColor: c.accent, color: '#fff' }}>
                                                        {Icons.plus}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {filteredCategories.length === 0 && <div className="text-center py-8 text-[10px]" style={{ color: c.textSec, opacity: 0.5 }}>{isAr ? 'لا توجد نتائج' : 'No results'}</div>}

                        {/* Footer with Social Links */}
                        <footer className="text-center pt-4 pb-3 mt-4 border-t" style={{ borderColor: c.border }}>
                            {social && (social.instagram || social.snapchat || social.tiktok || social.x) && (
                                <div className="flex justify-center gap-2 mb-2">
                                    {social.instagram && (
                                        <a href={social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                                            style={{ backgroundColor: c.accentGlow, color: c.accent }}>
                                            {Icons.instagram}
                                        </a>
                                    )}
                                    {social.snapchat && (
                                        <a href={social.snapchat.startsWith('http') ? social.snapchat : `https://snapchat.com/add/${social.snapchat}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                                            style={{ backgroundColor: c.accentGlow, color: c.accent }}>
                                            {Icons.snapchat}
                                        </a>
                                    )}
                                    {social.tiktok && (
                                        <a href={social.tiktok.startsWith('http') ? social.tiktok : `https://tiktok.com/@${social.tiktok}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                                            style={{ backgroundColor: c.accentGlow, color: c.accent }}>
                                            {Icons.tiktok}
                                        </a>
                                    )}
                                    {social.x && (
                                        <a href={social.x.startsWith('http') ? social.x : `https://x.com/${social.x}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                                            style={{ backgroundColor: c.accentGlow, color: c.accent }}>
                                            {Icons.xTwitter}
                                        </a>
                                    )}
                                </div>
                            )}
                            <p className="text-[8px]" style={{ color: c.textSec, opacity: 0.4 }}>
                                Powered by <span style={{ color: c.accent, fontWeight: 700 }}>daoob</span>
                            </p>
                        </footer>
                    </div>

                    {/* Cart FAB */}
                    {totalItems > 0 && !showCart && (
                        <div className="sticky bottom-2 px-3 z-20">
                            <button onClick={() => setShowCart(true)}
                                className="w-full px-4 py-2.5 rounded-2xl text-white text-[10px] font-bold shadow-xl flex items-center justify-between transition-all active:scale-[0.98]"
                                style={{ backgroundColor: c.accent }}>
                                <span className="flex items-center gap-1.5">{Icons.cart} {totalItems} {isAr ? 'عنصر' : 'items'}</span>
                                <span>{totalPrice.toFixed(0)} ر.س</span>
                            </button>
                        </div>
                    )}

                    {/* Cart Sheet */}
                    {showCart && (
                        <div className="sticky bottom-0 inset-x-0 z-30">
                            <div className="rounded-t-2xl p-3 shadow-2xl border-t max-h-[280px] overflow-y-auto" style={{ backgroundColor: c.bg, borderColor: c.border }}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[11px] font-bold flex items-center gap-1">{Icons.cart} {isAr ? 'سلة الطلب' : 'Cart'}</h3>
                                    <button onClick={() => setShowCart(false)} style={{ color: c.textSec, opacity: 0.5 }}>{Icons.x}</button>
                                </div>
                                <div className="space-y-1.5 mb-2">
                                    {cart.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 rounded-xl text-[9px]" style={{ backgroundColor: c.bgCard }}>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold truncate">{item.name}</p>
                                                <p style={{ opacity: 0.5 }}>{item.price} × {item.qty}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 ms-2">
                                                <button onClick={() => updateQty(item.name, -1)} className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: c.accentGlow, color: c.accent }}>{Icons.minus}</button>
                                                <span className="text-[10px] font-bold w-3 text-center">{item.qty}</span>
                                                <button onClick={() => updateQty(item.name, 1)} className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: c.accent, color: '#fff' }}>{Icons.plus}</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between mb-2 text-[10px] font-bold px-1">
                                    <span>{isAr ? 'الإجمالي' : 'Total'}</span>
                                    <span style={{ color: c.accent }}>{totalPrice.toFixed(0)} ر.س</span>
                                </div>
                                <button onClick={sendToWhatsApp}
                                    className="w-full py-2.5 rounded-xl text-white text-[10px] font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                                    style={{ backgroundColor: '#25D366' }}>
                                    {Icons.whatsapp} {isAr ? 'إرسال الطلب عبر واتساب' : 'Send Order via WhatsApp'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Home Bar */}
                <div className="bg-gray-800 flex justify-center py-2"><div className="w-28 h-1 bg-gray-600 rounded-full" /></div>
            </div>
        </div>
    );
}

function isLightColor(hex: string): boolean {
    const h = hex.replace('#', '');
    if (h.length < 6) return true;
    const r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
function lighten(hex: string, pct: number): string {
    const h = hex.replace('#', '');
    const r = Math.min(255, parseInt(h.substr(0, 2), 16) + Math.round(255 * pct / 100));
    const g = Math.min(255, parseInt(h.substr(2, 2), 16) + Math.round(255 * pct / 100));
    const b = Math.min(255, parseInt(h.substr(4, 2), 16) + Math.round(255 * pct / 100));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
