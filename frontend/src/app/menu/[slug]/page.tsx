'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { THEMES, ThemeId } from '@/lib/constants';
import { generateWhatsAppLink } from '@/lib/utils';
import api from '@/lib/api';

/* ── Inline SVG Icons (same as MenuPreview) ── */
const Icons = {
    moon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
    search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    x: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    minus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    cart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>,
    whatsapp: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
    trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    coffee: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>,
    snapchat: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.04-.012.06-.012.1 0 .12.036.24.12.286.192.038.06.068.18.008.298a.45.45 0 01-.188.18c-.18.09-.42.162-.66.222-.12.03-.24.06-.33.09-.119.04-.239.09-.329.15-.06.03-.119.09-.149.15-.03.06-.03.12-.008.18.06.12.18.24.3.33.24.18.471.33.731.46.21.12.42.21.63.27.11.03.22.06.31.1.18.06.3.18.33.33.03.15-.03.3-.12.42-.18.21-.42.39-.72.51-.21.09-.42.15-.63.18-.06.015-.12.015-.18.03-.03.015-.06.03-.09.06-.03.06-.03.12-.03.18 0 .06 0 .12.03.18.03.03.06.06.09.09.03.015.06.03.09.045.21.06.42.12.63.21.3.12.6.24.9.42.51.27.78.69.78 1.14 0 .72-.78 1.35-2.07 1.68-.27.06-.54.12-.81.15-.18.03-.36.03-.54.06-.12.015-.24.045-.33.09-.06.03-.12.06-.18.12-.06.09-.09.18-.09.3v.06c0 .03 0 .06-.03.09-.03.06-.09.09-.15.09h-.06c-.42-.03-.84-.12-1.26-.21-.18-.03-.36-.09-.54-.12a6.03 6.03 0 00-.72-.06c-.24 0-.48.03-.72.06-.18.03-.36.09-.54.12-.42.09-.84.18-1.26.21h-.06c-.06 0-.12-.03-.15-.09-.03-.03-.03-.06-.03-.09v-.06c0-.12-.03-.21-.09-.3-.06-.06-.12-.09-.18-.12-.09-.045-.21-.075-.33-.09-.18-.03-.36-.03-.54-.06-.27-.03-.54-.09-.81-.15C3.78 20.1 3 19.47 3 18.75c0-.45.27-.87.78-1.14.3-.18.6-.3.9-.42.21-.09.42-.15.63-.21.03-.015.06-.03.09-.045.03-.03.06-.06.09-.09.03-.06.03-.12.03-.18 0-.06 0-.12-.03-.18-.03-.06-.06-.045-.09-.06-.03-.015-.06-.03-.09-.06-.06-.015-.12-.015-.18-.03-.21-.03-.42-.09-.63-.18-.3-.12-.54-.3-.72-.51-.09-.12-.15-.27-.12-.42.03-.15.15-.27.33-.33.09-.04.2-.07.31-.1.21-.06.42-.15.63-.27.26-.13.491-.28.731-.46.12-.09.24-.21.3-.33.022-.06.022-.12-.008-.18-.03-.06-.089-.12-.149-.15-.09-.06-.21-.11-.329-.15-.09-.03-.21-.06-.33-.09-.24-.06-.48-.132-.66-.222a.45.45 0 01-.188-.18c-.06-.118-.03-.238.008-.298.046-.072.166-.156.286-.192.04-.012.06-.012.1 0 .263.094.622.198.922.214.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.859 1.069 11.216.793 12.206.793z" /></svg>,
    tiktok: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.55a8.28 8.28 0 0 0 4.76 1.5v-3.4c-.01 0-1 .04-1 .04z" /></svg>,
    xTwitter: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
};

/* ── helpers ── */
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

/* ── Types ── */
interface Product { _id: string; name_ar: string; name_en: string; description_ar: string; description_en: string; price: number; image: string | null; }
interface Category { _id: string; name_ar: string; name_en: string; products: Product[]; }
interface StoreData {
    storeName_ar: string; storeName_en: string; logo: string | null; coverImage: string | null;
    whatsapp: string; language: 'ar' | 'en' | 'both';
    theme: { selectedTheme: number; mode: 'light' | 'dark' | 'custom'; customColors: { primary?: string; secondary?: string; background?: string; text?: string } };
    social: { snapchat: string; instagram: string; tiktok: string; x: string };
}

export default function MenuPage() {
    const { slug } = useParams();
    const [store, setStore] = useState<StoreData | null>(null);
    const [menu, setMenu] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState(0);
    const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [viewMode, setViewMode] = useState<'light' | 'dark'>('light');
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const screenRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const { data } = await api.get(`/menu/${slug}`);
                setStore(data.store);
                setMenu(data.menu);
                // Set initial view mode based on store theme
                if (data.store) {
                    setViewMode(data.store.theme.mode === 'dark' ? 'dark' : 'light');
                }
            } catch {
                setError('Menu not found');
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [slug]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' }}>
            <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error || !store) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', color: '#fff' }}>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>🍽️</p>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Menu Not Found</h1>
                <p style={{ opacity: 0.5 }}>This menu does not exist or has been deactivated.</p>
            </div>
        </div>
    );

    /* ── Build color system (matching MenuPreview exactly) ── */
    const themeId = store.theme.selectedTheme as ThemeId;
    const themeData = THEMES[themeId] || THEMES[1];
    let c: any;
    if (store.theme.mode === 'custom') {
        const isBgLight = isLightColor(store.theme.customColors.background || '#fff');
        c = {
            primary: store.theme.customColors.primary || '#706D54',
            secondary: store.theme.customColors.secondary || '#A08963',
            bg: store.theme.customColors.background || '#F5F2EC',
            bgCard: isBgLight ? '#FFFFFF' : lighten(store.theme.customColors.background || '#000', 8),
            bgNav: (store.theme.customColors.background || '#F5F2EC') + 'e0',
            text: store.theme.customColors.text || '#2C2A22',
            textSec: store.theme.customColors.primary || '#706D54',
            accent: store.theme.customColors.primary || '#A08963',
            border: (store.theme.customColors.text || '#2C2A22') + '15',
            accentGlow: (store.theme.customColors.primary || '#A08963') + '20',
        };
    } else {
        const t = viewMode === 'dark' ? themeData.dark : themeData.light;
        c = {
            primary: t.primary, secondary: t.secondary, bg: t.background, bgCard: t.card,
            bgNav: t.background + 'e0', text: t.text, textSec: t.primary, accent: t.accent,
            border: t.text + '12', accentGlow: t.accent + '20',
        };
    }

    const isAr = store.language !== 'en';
    const dir = store.language === 'en' ? 'ltr' : 'rtl';
    const getName = (ar: string, en: string) => {
        if (store.language === 'en') return en || ar;
        return ar || en;
    };

    /* ── Filter products by search ── */
    const filteredMenu = menu.map(cat => ({
        ...cat,
        products: cat.products.filter(p =>
            p.name_ar.includes(search) || p.name_en?.toLowerCase().includes(search.toLowerCase()) ||
            p.description_ar?.includes(search) || p.description_en?.toLowerCase().includes(search.toLowerCase())
        ),
    })).filter(cat => cat.products.length > 0);

    /* ── Cart functions ── */
    const addToCart = (product: Product) => {
        const existing = cart.find(i => i.product._id === product._id);
        if (existing) {
            setCart(cart.map(i => i.product._id === product._id ? { ...i, qty: i.qty + 1 } : i));
        } else {
            setCart([...cart, { product, qty: 1 }]);
        }
    };
    const updateQty = (productId: string, delta: number) => {
        setCart(prev => prev.map(i => i.product._id === productId ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
    };
    const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
    const totalPrice = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);

    const sendWhatsApp = () => {
        if (!store.whatsapp) return;
        let message = isAr ? `*طلب جديد*\n\n` : `*New Order*\n\n`;
        cart.forEach(item => {
            message += `• ${getName(item.product.name_ar, item.product.name_en)} × ${item.qty} = ${(item.product.price * item.qty).toFixed(2)} ${isAr ? 'ر.س' : 'SAR'}\n`;
        });
        message += `\n*${isAr ? 'الإجمالي' : 'Total'}:* ${totalPrice.toFixed(2)} ${isAr ? 'ر.س' : 'SAR'}`;
        window.open(generateWhatsAppLink(store.whatsapp, message), '_blank');
        setCart([]);
        setShowCart(false);
    };

    const scrollToSection = (index: number) => {
        setActiveCategory(index);
        const el = sectionRefs.current[index];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleModeToggle = () => {
        setViewMode(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#111', display: 'flex', justifyContent: 'center' }}>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .menu-scrollbar::-webkit-scrollbar { display: none; }
                .menu-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div
                ref={screenRef}
                className="menu-scrollbar"
                style={{
                    maxWidth: 430,
                    width: '100%',
                    minHeight: '100vh',
                    backgroundColor: c.bg,
                    color: c.text,
                    fontFamily: dir === 'rtl' ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
                    position: 'relative',
                    boxShadow: '0 0 60px rgba(0,0,0,0.5)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}
                dir={dir}
            >
                {/* ── Hero Header (centered logo + store name + gradient) ── */}
                <div className="relative text-center" style={{
                    paddingTop: 40, paddingBottom: 24, paddingLeft: 16, paddingRight: 16,
                    background: `linear-gradient(180deg, ${c.accentGlow}, ${c.bg})`,
                }}>
                    {/* Theme Toggle Button */}
                    {store.theme.mode !== 'custom' && (
                        <button
                            onClick={handleModeToggle}
                            style={{
                                position: 'absolute', top: 16,
                                ...(dir === 'rtl' ? { right: 16 } : { left: 16 }),
                                width: 40, height: 40, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: c.bgCard, color: c.accent,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                border: 'none', cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {viewMode === 'dark' ? Icons.sun : Icons.moon}
                        </button>
                    )}

                    {/* Logo */}
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
                        overflow: 'hidden', border: `3px solid ${c.bg}80`,
                        backgroundColor: c.bgCard, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {store.logo
                            ? <img src={store.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ color: c.accent, fontSize: 24, fontWeight: 700 }}>{(store.storeName_ar || store.storeName_en || 'D')[0]}</span>
                        }
                    </div>

                    {/* Store Name */}
                    <h1 style={{ fontSize: 20, fontWeight: 800, color: c.text, marginBottom: 4 }}>
                        {getName(store.storeName_ar, store.storeName_en)}
                    </h1>
                    <p style={{ fontSize: 12, color: c.textSec, opacity: 0.7, fontWeight: 500 }}>
                        {isAr ? 'القائمة' : 'Menu'}
                    </p>
                </div>

                {/* ── Sticky Category Navigation ── */}
                <div style={{
                    position: 'sticky', top: 0, zIndex: 20,
                    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                    backgroundColor: c.bgNav, borderBottom: `1px solid ${c.border}`,
                }}>
                    <div className="menu-scrollbar" style={{
                        display: 'flex', gap: 6, padding: '8px 12px',
                        overflowX: 'auto', scrollBehavior: 'smooth',
                    }}>
                        {menu.map((cat, i) => (
                            <button
                                key={cat._id}
                                onClick={() => scrollToSection(i)}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                                    padding: '8px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                    flexShrink: 0, transition: 'all 0.2s',
                                    backgroundColor: activeCategory === i ? c.primary : 'transparent',
                                    color: activeCategory === i ? '#fff' : c.textSec,
                                    fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                                    fontFamily: 'inherit',
                                }}
                            >
                                <span>{getName(cat.name_ar, cat.name_en)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Search Bar ── */}
                <div style={{ padding: '12px 16px 0' }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{
                            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                            ...(dir === 'rtl' ? { right: 14 } : { left: 14 }),
                            color: c.textSec, opacity: 0.4,
                        }}>
                            {Icons.search}
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={isAr ? 'ابحث عن منتج...' : 'Search...'}
                            style={{
                                width: '100%', padding: '12px 40px',
                                borderRadius: 14, border: `1px solid ${c.border}`,
                                backgroundColor: c.bgCard, color: c.text,
                                fontSize: 14, outline: 'none',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box',
                            }}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                style={{
                                    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                                    ...(dir === 'rtl' ? { left: 14 } : { right: 14 }),
                                    color: c.textSec, opacity: 0.5,
                                    background: 'none', border: 'none', cursor: 'pointer',
                                }}
                            >
                                {Icons.x}
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Menu Sections ── */}
                <div style={{ padding: '12px 16px 100px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {filteredMenu.map((category, ci) => (
                        <div key={category._id} ref={el => { sectionRefs.current[ci] = el; }}>
                            {/* Section Title - Badge style */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '0 4px' }}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '5px 14px', borderRadius: 99,
                                    fontSize: 12, fontWeight: 700,
                                    backgroundColor: c.primary, color: '#fff',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                }}>
                                    {getName(category.name_ar, category.name_en)}
                                </span>
                                <div style={{ flex: 1, height: 1, backgroundColor: c.border }} />
                            </div>

                            {/* 2-Column Product Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {category.products.map(product => (
                                    <div key={product._id} style={{
                                        borderRadius: 16, overflow: 'hidden',
                                        border: `1px solid ${c.border}`,
                                        backgroundColor: c.bgCard,
                                        transition: 'all 0.2s',
                                    }}>
                                        {/* Product Image or placeholder */}
                                        {product.image ? (
                                            <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}>
                                                <img src={product.image} alt={getName(product.name_ar, product.name_en)}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                            </div>
                                        ) : (
                                            <div style={{
                                                width: '100%', aspectRatio: '4/3',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: `linear-gradient(135deg, ${c.accentGlow}, transparent)`,
                                            }}>
                                                <span style={{ color: c.accent, opacity: 0.15, fontSize: 28, fontWeight: 700 }}>{getName(product.name_ar, product.name_en)[0]}</span>
                                            </div>
                                        )}

                                        {/* Product Info */}
                                        <div style={{ padding: 10 }}>
                                            <h3 style={{
                                                fontSize: 13, fontWeight: 700, margin: 0,
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                                {getName(product.name_ar, product.name_en)}
                                            </h3>
                                            {getName(product.description_ar, product.description_en) && (
                                                <p style={{
                                                    fontSize: 10, margin: '3px 0 0', color: c.textSec, opacity: 0.6,
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>
                                                    {getName(product.description_ar, product.description_en)}
                                                </p>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 3,
                                                    padding: '3px 10px', borderRadius: 99,
                                                    fontSize: 12, fontWeight: 700,
                                                    backgroundColor: c.accentGlow, color: c.accent,
                                                }}>
                                                    {product.price} <span style={{ fontSize: 9, opacity: 0.7 }}>{isAr ? 'ر.س' : 'SAR'}</span>
                                                </span>
                                                {store.whatsapp && (
                                                    <button
                                                        onClick={() => addToCart(product)}
                                                        style={{
                                                            width: 32, height: 32, borderRadius: '50%',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            backgroundColor: c.accent, color: '#fff',
                                                            border: 'none', cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                        }}
                                                    >
                                                        {Icons.plus}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {filteredMenu.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: c.textSec, opacity: 0.5, fontSize: 14 }}>
                            {isAr ? 'لا توجد نتائج' : 'No results'}
                        </div>
                    )}

                    {/* ── Footer with Social Links ── */}
                    <footer style={{ textAlign: 'center', paddingTop: 20, paddingBottom: 16, marginTop: 16, borderTop: `1px solid ${c.border}` }}>
                        {store.social && (store.social.instagram || store.social.snapchat || store.social.tiktok || store.social.x) && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
                                {store.social.instagram && (
                                    <a href={store.social.instagram.startsWith('http') ? store.social.instagram : `https://instagram.com/${store.social.instagram}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{
                                            width: 38, height: 38, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            backgroundColor: c.accentGlow, color: c.accent,
                                            transition: 'all 0.2s',
                                        }}>
                                        {Icons.instagram}
                                    </a>
                                )}
                                {store.social.snapchat && (
                                    <a href={store.social.snapchat.startsWith('http') ? store.social.snapchat : `https://snapchat.com/add/${store.social.snapchat}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{
                                            width: 38, height: 38, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            backgroundColor: c.accentGlow, color: c.accent,
                                            transition: 'all 0.2s',
                                        }}>
                                        {Icons.snapchat}
                                    </a>
                                )}
                                {store.social.tiktok && (
                                    <a href={store.social.tiktok.startsWith('http') ? store.social.tiktok : `https://tiktok.com/@${store.social.tiktok}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{
                                            width: 38, height: 38, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            backgroundColor: c.accentGlow, color: c.accent,
                                            transition: 'all 0.2s',
                                        }}>
                                        {Icons.tiktok}
                                    </a>
                                )}
                                {store.social.x && (
                                    <a href={store.social.x.startsWith('http') ? store.social.x : `https://x.com/${store.social.x}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{
                                            width: 38, height: 38, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            backgroundColor: c.accentGlow, color: c.accent,
                                            transition: 'all 0.2s',
                                        }}>
                                        {Icons.xTwitter}
                                    </a>
                                )}
                            </div>
                        )}
                        <p style={{ fontSize: 11, color: c.textSec, opacity: 0.4 }}>
                            Powered by <span style={{ color: c.accent, fontWeight: 700 }}>daoob</span>
                        </p>
                    </footer>
                </div>

                {/* ── Cart FAB ── */}
                {store.whatsapp && totalItems > 0 && !showCart && (
                    <div style={{
                        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                        maxWidth: 430, width: '100%', padding: '12px 16px',
                        zIndex: 40, boxSizing: 'border-box',
                        background: `linear-gradient(to top, ${c.bg}, ${c.bg}ee, transparent)`,
                        paddingTop: 24,
                    }}>
                        <button
                            onClick={() => setShowCart(true)}
                            style={{
                                width: '100%', padding: '14px 20px', borderRadius: 18,
                                backgroundColor: c.accent, color: '#fff',
                                fontSize: 13, fontWeight: 700,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                border: 'none', cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontFamily: 'inherit',
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {Icons.cart} {totalItems} {isAr ? 'عنصر' : 'items'}
                            </span>
                            <span>{totalPrice.toFixed(0)} {isAr ? 'ر.س' : 'SAR'}</span>
                        </button>
                    </div>
                )}

                {/* ── Cart Sheet ── */}
                {showCart && (
                    <div
                        onClick={() => setShowCart(false)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 50,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                        }}
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            style={{
                                maxWidth: 430, width: '100%',
                                borderRadius: '18px 18px 0 0', padding: 20,
                                boxShadow: '0 -8px 30px rgba(0,0,0,0.2)',
                                borderTop: `1px solid ${c.border}`,
                                backgroundColor: c.bg, color: c.text,
                                maxHeight: '65vh', overflowY: 'auto',
                                fontFamily: dir === 'rtl' ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
                            }}
                            dir={dir}
                        >
                            {/* Cart header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                                    {Icons.cart} {isAr ? 'سلة الطلب' : 'Cart'}
                                </h3>
                                <button onClick={() => setShowCart(false)} style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: c.textSec, opacity: 0.5,
                                }}>
                                    {Icons.x}
                                </button>
                            </div>

                            {/* Cart items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                                {cart.map(item => (
                                    <div key={item.product._id} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: 12, borderRadius: 14,
                                        backgroundColor: c.bgCard,
                                    }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {getName(item.product.name_ar, item.product.name_en)}
                                            </p>
                                            <p style={{ fontSize: 11, opacity: 0.5, margin: '2px 0 0' }}>
                                                {item.product.price} × {item.qty}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginInlineStart: 12 }}>
                                            <button onClick={() => updateQty(item.product._id, -1)} style={{
                                                width: 28, height: 28, borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: c.accentGlow, color: c.accent,
                                                border: 'none', cursor: 'pointer',
                                            }}>
                                                {Icons.minus}
                                            </button>
                                            <span style={{ fontSize: 14, fontWeight: 700, width: 18, textAlign: 'center' }}>{item.qty}</span>
                                            <button onClick={() => updateQty(item.product._id, 1)} style={{
                                                width: 28, height: 28, borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: c.accent, color: '#fff',
                                                border: 'none', cursor: 'pointer',
                                            }}>
                                                {Icons.plus}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '0 4px', fontSize: 15, fontWeight: 700 }}>
                                <span>{isAr ? 'الإجمالي' : 'Total'}</span>
                                <span style={{ color: c.accent }}>{totalPrice.toFixed(0)} {isAr ? 'ر.س' : 'SAR'}</span>
                            </div>

                            {/* WhatsApp button */}
                            <button
                                onClick={sendWhatsApp}
                                style={{
                                    width: '100%', padding: '14px 0', borderRadius: 14,
                                    backgroundColor: '#25D366', color: '#fff',
                                    fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'opacity 0.2s',
                                    fontFamily: 'inherit',
                                }}
                            >
                                {Icons.whatsapp} {isAr ? 'إرسال الطلب عبر واتساب' : 'Send Order via WhatsApp'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Fixed WhatsApp FAB (always visible) ── */}
                {store.whatsapp && (
                    <a
                        href={`https://wa.me/966${store.whatsapp.replace(/^0/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            position: 'fixed', bottom: totalItems > 0 ? 80 : 24,
                            ...(dir === 'rtl' ? { left: 'calc(50% + 160px)' } : { right: 'calc(50% - 200px)' }),
                            width: 56, height: 56, borderRadius: '50%',
                            backgroundColor: '#25D366', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
                            zIndex: 40, border: 'none', cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            textDecoration: 'none',
                        }}
                    >
                        {Icons.whatsapp}
                    </a>
                )}
            </div>
        </div>
    );
}
