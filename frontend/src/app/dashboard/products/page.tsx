'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import MenuPreview from '@/components/MenuPreview';

interface Category {
    _id: string;
    name_ar: string;
    name_en: string;
    order: number;
    isVisible: boolean;
}

interface Product {
    _id: string;
    category_id: string;
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    price: number;
    image: string | null;
    isVisible: boolean;
    order: number;
}

export default function ProductsPage() {
    const { merchant } = useAuth();
    const { t, lang } = useLanguage();
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Category form
    const [showCatForm, setShowCatForm] = useState(false);
    const [catNameAr, setCatNameAr] = useState('');
    const [catNameEn, setCatNameEn] = useState('');
    const [editingCat, setEditingCat] = useState<string | null>(null);

    // Product form
    const [showProdForm, setShowProdForm] = useState(false);
    const [prodNameAr, setProdNameAr] = useState('');
    const [prodNameEn, setProdNameEn] = useState('');
    const [prodDescAr, setProdDescAr] = useState('');
    const [prodDescEn, setProdDescEn] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [prodImage, setProdImage] = useState<File | null>(null);
    const [prodImageUrl, setProdImageUrl] = useState('');
    const [prodImagePreview, setProdImagePreview] = useState<string | null>(null);
    const [prodCategoryId, setProdCategoryId] = useState('');
    const [editingProd, setEditingProd] = useState<string | null>(null);
    const prodImageAreaRef = useRef<HTMLDivElement>(null);

    const fetchData = useCallback(async () => {
        try {
            const [catRes, prodRes] = await Promise.all([api.get('/categories'), api.get('/products')]);
            setCategories(catRes.data.categories);
            setProducts(prodRes.data.products);
            if (catRes.data.categories.length > 0 && !activeCategory) {
                setActiveCategory(catRes.data.categories[0]._id);
            }
        } catch {
            toast.error(t('خطأ في تحميل البيانات', 'Error loading data'));
        } finally {
            setLoading(false);
        }
    }, [t, activeCategory]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Build preview categories
    const previewCategories = categories.filter(c => c.isVisible).map(cat => ({
        name_ar: cat.name_ar, name_en: cat.name_en,
        products: products.filter(p => p.category_id === cat._id && p.isVisible).map(p => ({
            name_ar: p.name_ar, name_en: p.name_en, price: p.price, image: p.image, description_ar: p.description_ar,
        })),
    })).filter(c => c.products.length > 0);

    // Category handlers
    const handleSaveCategory = async () => {
        if (!catNameAr || !catNameEn) {
            toast.error(t('أدخل اسم التصنيف بالعربية والإنجليزية', 'Enter category name in Arabic and English'));
            return;
        }
        try {
            if (editingCat) {
                await api.put(`/categories/${editingCat}`, { name_ar: catNameAr, name_en: catNameEn });
                toast.success(t('تم تحديث التصنيف', 'Category updated'));
            } else {
                await api.post('/categories', { name_ar: catNameAr, name_en: catNameEn });
                toast.success(t('تم إنشاء التصنيف', 'Category created'));
            }
            resetCatForm();
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('حدث خطأ', 'An error occurred'));
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm(t('حذف التصنيف وجميع منتجاته؟', 'Delete category and all its products?'))) return;
        try {
            await api.delete(`/categories/${id}`);
            toast.success(t('تم حذف التصنيف', 'Category deleted'));
            if (activeCategory === id) setActiveCategory(null);
            fetchData();
        } catch { toast.error(t('خطأ في الحذف', 'Error deleting')); }
    };

    const resetCatForm = () => { setShowCatForm(false); setCatNameAr(''); setCatNameEn(''); setEditingCat(null); };

    // Product handlers
    const handleSaveProduct = async () => {
        if (!prodNameAr || !prodPrice) {
            toast.error(t('اسم المنتج والسعر مطلوبان', 'Product name and price are required'));
            return;
        }
        const formData = new FormData();
        formData.append('name_ar', prodNameAr);
        formData.append('name_en', prodNameEn);
        formData.append('description_ar', prodDescAr);
        formData.append('description_en', prodDescEn);
        formData.append('price', prodPrice);
        formData.append('category_id', prodCategoryId || activeCategory || '');
        if (prodImage) formData.append('image', prodImage);
        if (prodImageUrl && !prodImage) formData.append('imageUrl', prodImageUrl);

        try {
            if (editingProd) {
                await api.put(`/products/${editingProd}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success(t('تم تحديث المنتج', 'Product updated'));
            } else {
                await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success(t('تم إنشاء المنتج', 'Product created'));
            }
            resetProdForm();
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('حدث خطأ', 'An error occurred'));
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm(t('حذف هذا المنتج؟', 'Delete this product?'))) return;
        try { await api.delete(`/products/${id}`); toast.success(t('تم حذف المنتج', 'Product deleted')); fetchData(); }
        catch { toast.error(t('خطأ في الحذف', 'Error deleting')); }
    };

    const handleToggleProduct = async (id: string) => {
        try { await api.patch(`/products/${id}/toggle`); fetchData(); }
        catch { toast.error(t('خطأ', 'Error')); }
    };

    const resetProdForm = () => {
        setShowProdForm(false); setProdNameAr(''); setProdNameEn(''); setProdDescAr(''); setProdDescEn('');
        setProdPrice(''); setProdImage(null); setProdImageUrl(''); setProdImagePreview(null); setProdCategoryId(''); setEditingProd(null);
    };

    const editProduct = (p: Product) => {
        setProdNameAr(p.name_ar); setProdNameEn(p.name_en); setProdDescAr(p.description_ar); setProdDescEn(p.description_en);
        setProdPrice(String(p.price)); setProdCategoryId(p.category_id); setEditingProd(p._id);
        setProdImagePreview(p.image); setProdImage(null); setProdImageUrl('');
        setShowProdForm(true);
    };

    const handleProdImagePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                e.preventDefault();
                const file = items[i].getAsFile();
                if (file) { setProdImage(file); setProdImagePreview(URL.createObjectURL(file)); setProdImageUrl(''); toast.success(t('تم لصق الصورة ✓', 'Image pasted ✓')); }
            }
            if (items[i].type === 'text/plain') {
                items[i].getAsString((text) => {
                    if (text.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i)) {
                        setProdImageUrl(text); setProdImage(null); setProdImagePreview(text);
                        toast.success(t('تم لصق رابط الصورة ✓', 'Image URL pasted ✓'));
                    }
                });
            }
        }
    };

    const handleProdImageDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setProdImage(file); setProdImagePreview(URL.createObjectURL(file)); setProdImageUrl('');
            toast.success(t('تم إضافة الصورة ✓', 'Image added ✓'));
        }
    };

    const categoryProducts = products.filter(p => p.category_id === activeCategory);

    if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">{t('إدارة المنتجات', 'Product Management')}</h1>
            </div>

            <div className="flex gap-8">
                {/* Products Panel */}
                <div className="flex-1 min-w-0">
                    {/* Categories */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold text-[var(--color-muted)]">{t('التصنيفات', 'Categories')}</h2>
                            <button onClick={() => setShowCatForm(true)} className="text-sm text-[var(--color-accent)] font-medium hover:underline">
                                + {t('تصنيف جديد', 'New Category')}
                            </button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {categories.map(cat => (
                                <button key={cat._id} onClick={() => setActiveCategory(cat._id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat._id ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-card)] text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}>
                                    {lang === 'ar' ? cat.name_ar : cat.name_en}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Category Actions */}
                    {activeCategory && (
                        <div className="flex gap-2 mb-4">
                            <button onClick={() => {
                                const cat = categories.find(c => c._id === activeCategory);
                                if (cat) { setCatNameAr(cat.name_ar); setCatNameEn(cat.name_en); setEditingCat(cat._id); setShowCatForm(true); }
                            }} className="text-xs btn-ghost">{t('تعديل التصنيف', 'Edit Category')}</button>
                            <button onClick={() => handleDeleteCategory(activeCategory)} className="text-xs btn-ghost text-red-500">{t('حذف التصنيف', 'Delete Category')}</button>
                        </div>
                    )}

                    {/* Add Product */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold">{t('المنتجات', 'Products')} ({categoryProducts.length})</h2>
                        <button onClick={() => { setProdCategoryId(activeCategory || ''); setShowProdForm(true); }} className="btn-primary text-sm">
                            + {t('منتج جديد', 'New Product')}
                        </button>
                    </div>

                    {/* Products Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {categoryProducts.map(product => (
                            <div key={product._id} className={`card-hover ${!product.isVisible ? 'opacity-50' : ''}`}>
                                {product.image && <img src={product.image} alt={product.name_ar} className="w-full h-36 object-cover rounded-xl mb-3" />}
                                <h3 className="font-bold text-sm mb-1">{lang === 'ar' ? product.name_ar : product.name_en || product.name_ar}</h3>
                                {(lang === 'ar' ? product.description_ar : product.description_en) && (
                                    <p className="text-xs text-[var(--color-muted)] mb-2 line-clamp-2">{lang === 'ar' ? product.description_ar : product.description_en}</p>
                                )}
                                <p className="text-[var(--color-accent)] font-bold mb-3">{product.price} {t('ر.س', 'SAR')}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => editProduct(product)} className="text-xs btn-ghost"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                                    <button onClick={() => handleToggleProduct(product._id)} className="text-xs btn-ghost">{product.isVisible ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>}</button>
                                    <button onClick={() => handleDeleteProduct(product._id)} className="text-xs btn-ghost text-red-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {categoryProducts.length === 0 && activeCategory && (
                        <div className="text-center py-12 text-[var(--color-muted)]">
                            <div className="text-4xl mb-4 flex justify-center"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-30"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg></div>
                            <p>{t('لا توجد منتجات في هذا التصنيف', 'No products in this category')}</p>
                        </div>
                    )}

                    {categories.length === 0 && (
                        <div className="text-center py-12 text-[var(--color-muted)]">
                            <div className="text-4xl mb-4 flex justify-center"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-30"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></div>
                            <p>{t('أنشئ تصنيفًا أولًا ثم أضف المنتجات', 'Create a category first, then add products')}</p>
                        </div>
                    )}
                </div>

                {/* Always-Visible Live Preview */}
                {merchant && (
                    <div className="hidden lg:block sticky top-6 self-start flex-shrink-0">
                        <p className="text-center text-xs text-[var(--color-muted)] mb-3 font-medium">
                            {t('معاينة مباشرة', 'Live Preview')}
                        </p>
                        <MenuPreview
                            storeName_ar={merchant.storeName_ar || 'اسم المتجر'}
                            storeName_en={merchant.storeName_en || 'Store Name'}
                            logo={merchant.logo}
                            coverImage={merchant.coverImage}
                            selectedTheme={merchant.theme.selectedTheme}
                            mode={merchant.theme.mode}
                            customColors={merchant.theme.mode === 'custom' ? merchant.theme.customColors : undefined}
                            language={merchant.language}
                            categories={previewCategories}
                            social={merchant.social}
                            whatsapp={merchant.whatsapp}
                        />
                    </div>
                )}
            </div>

            {/* Mobile Preview */}
            {merchant && (
                <div className="lg:hidden mt-8">
                    <p className="text-center text-xs text-[var(--color-muted)] mb-3 font-medium">{t('معاينة مباشرة', 'Live Preview')}</p>
                    <div className="flex justify-center">
                        <MenuPreview
                            storeName_ar={merchant.storeName_ar || 'اسم المتجر'}
                            storeName_en={merchant.storeName_en || 'Store Name'}
                            logo={merchant.logo}
                            coverImage={merchant.coverImage}
                            selectedTheme={merchant.theme.selectedTheme}
                            mode={merchant.theme.mode}
                            customColors={merchant.theme.mode === 'custom' ? merchant.theme.customColors : undefined}
                            language={merchant.language}
                            categories={previewCategories}
                            social={merchant.social}
                            whatsapp={merchant.whatsapp}
                        />
                    </div>
                </div>
            )}

            {/* Category Form Modal */}
            {showCatForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={resetCatForm}>
                    <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">{editingCat ? t('تعديل التصنيف', 'Edit Category') : t('تصنيف جديد', 'New Category')}</h3>
                        <div className="space-y-4">
                            <input value={catNameAr} onChange={e => setCatNameAr(e.target.value)} className="input-field" placeholder={t('الاسم بالعربية', 'Arabic name')} dir="rtl" />
                            <input value={catNameEn} onChange={e => setCatNameEn(e.target.value)} className="input-field" placeholder={t('الاسم بالإنجليزية', 'English name')} dir="ltr" />
                            <div className="flex gap-2">
                                <button onClick={handleSaveCategory} className="btn-primary flex-1">{t('حفظ', 'Save')}</button>
                                <button onClick={resetCatForm} className="btn-secondary flex-1">{t('إلغاء', 'Cancel')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Form Modal */}
            {showProdForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={resetProdForm}>
                    <div className="card w-full max-w-lg my-8" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">{editingProd ? t('تعديل المنتج', 'Edit Product') : t('منتج جديد', 'New Product')}</h3>
                        <div className="space-y-4">
                            <input value={prodNameAr} onChange={e => setProdNameAr(e.target.value)} className="input-field" placeholder={t('اسم المنتج بالعربية *', 'Product name (Arabic) *')} dir="rtl" />
                            <input value={prodNameEn} onChange={e => setProdNameEn(e.target.value)} className="input-field" placeholder={t('اسم المنتج بالإنجليزية', 'Product name (English)')} dir="ltr" />
                            <textarea value={prodDescAr} onChange={e => setProdDescAr(e.target.value)} className="input-field" rows={2} placeholder={t('الوصف بالعربية (اختياري)', 'Description (Arabic)')} dir="rtl" />
                            <textarea value={prodDescEn} onChange={e => setProdDescEn(e.target.value)} className="input-field" rows={2} placeholder={t('الوصف بالإنجليزية (اختياري)', 'Description (English)')} dir="ltr" />
                            <input type="number" value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="input-field" placeholder={t('السعر *', 'Price *')} dir="ltr" min="0" step="0.01" />
                            <div>
                                <label className="block text-sm font-medium mb-2">{t('الصورة (اختياري)', 'Image (optional)')}</label>
                                <div
                                    ref={prodImageAreaRef}
                                    onPaste={handleProdImagePaste}
                                    onDrop={handleProdImageDrop}
                                    onDragOver={e => e.preventDefault()}
                                    tabIndex={0}
                                    className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-3 text-center cursor-pointer hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                                    onClick={() => { const input = prodImageAreaRef.current?.querySelector('input[type=file]') as HTMLInputElement; input?.click(); }}
                                >
                                    {prodImagePreview && (
                                        <img src={prodImagePreview} alt="" className="w-full h-28 rounded-lg object-cover mx-auto mb-2" />
                                    )}
                                    <p className="text-xs text-[var(--color-muted)]">
                                        {t('اختر ملف · Ctrl+V للصق · سحب وإفلات', 'Choose file · Ctrl+V paste · Drag & drop')}
                                    </p>
                                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) { setProdImage(file); setProdImagePreview(URL.createObjectURL(file)); setProdImageUrl(''); }
                                    }} />
                                </div>
                                <input
                                    value={prodImageUrl}
                                    onChange={e => { setProdImageUrl(e.target.value); if (e.target.value) { setProdImagePreview(e.target.value); setProdImage(null); } }}
                                    className="input-field mt-2 text-sm"
                                    placeholder={t('أو الصق رابط الصورة هنا...', 'Or paste image URL here...')}
                                    dir="ltr"
                                    onClick={e => e.stopPropagation()}
                                />
                                {prodImage && <p className="text-xs text-green-500 mt-1">✓ {prodImage.name}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleSaveProduct} className="btn-primary flex-1">{t('حفظ', 'Save')}</button>
                                <button onClick={resetProdForm} className="btn-secondary flex-1">{t('إلغاء', 'Cancel')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
