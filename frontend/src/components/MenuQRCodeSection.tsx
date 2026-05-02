'use client';

import { useState, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { useLanguage } from '@/contexts/LanguageContext';

interface MenuQRCodeSectionProps {
    menuPublicUrl: string;
    restaurantName: string;
}

export default function MenuQRCodeSection({ menuPublicUrl, restaurantName }: MenuQRCodeSectionProps) {
    const { t } = useLanguage();
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [size, setSize] = useState(1024);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generateQR = useCallback(async () => {
        if (!menuPublicUrl) return;
        setGenerating(true);
        try {
            const dataUrl = await QRCode.toDataURL(menuPublicUrl, {
                width: size,
                margin: 2,
                color: { dark: '#000000', light: '#FFFFFF' },
                errorCorrectionLevel: 'H',
            });
            setQrDataUrl(dataUrl);
        } catch (err) {
            console.error('QR generation error:', err);
        } finally {
            setGenerating(false);
        }
    }, [menuPublicUrl, size]);

    const downloadQR = useCallback(async () => {
        if (!menuPublicUrl) return;
        try {
            const dataUrl = await QRCode.toDataURL(menuPublicUrl, {
                width: size,
                margin: 2,
                color: { dark: '#000000', light: '#FFFFFF' },
                errorCorrectionLevel: 'H',
            });
            const link = document.createElement('a');
            const safeName = restaurantName.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '-') || 'menu';
            link.download = `menu-qrcode-${safeName}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('QR download error:', err);
        }
    }, [menuPublicUrl, restaurantName, size]);

    const sizeOptions = [
        { value: 512, label: '512×512' },
        { value: 1024, label: '1024×1024' },
        { value: 2048, label: '2048×2048' },
    ];

    return (
        <div className="card space-y-5">
            {/* Header */}
            <div>
                <h2 className="font-bold flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" />
                        <line x1="21" y1="14" x2="21" y2="14.01" /><line x1="21" y1="21" x2="21" y2="21.01" />
                        <line x1="17" y1="21" x2="17" y2="21.01" /><line x1="21" y1="17" x2="21" y2="17.01" />
                    </svg>
                    {t('QR Code للمنيو الإلكتروني', 'Menu QR Code')}
                </h2>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                    {t('اجعل منيوك سهل الوصول عبر المسح', 'Make your menu easily accessible via scanning')}
                </p>
            </div>

            {/* QR Display */}
            {qrDataUrl ? (
                <div className="flex flex-col items-center gap-5">
                    {/* QR Image */}
                    <div className="p-4 bg-white rounded-2xl shadow-lg border border-[var(--color-border)]">
                        <img
                            src={qrDataUrl}
                            alt="Menu QR Code"
                            className="w-48 h-48 sm:w-56 sm:h-56"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    </div>

                    {/* Menu URL display */}
                    <div className="w-full px-3 py-2 bg-[var(--color-background)] rounded-xl text-center">
                        <p className="text-xs text-[var(--color-muted)] mb-1">{t('رابط المنيو', 'Menu URL')}</p>
                        <p className="text-sm font-mono font-medium truncate" dir="ltr">{menuPublicUrl}</p>
                    </div>

                    {/* Size selector */}
                    <div className="flex items-center gap-2 w-full">
                        <span className="text-xs text-[var(--color-muted)] whitespace-nowrap">
                            {t('حجم التحميل:', 'Download size:')}
                        </span>
                        <div className="flex gap-1.5 flex-1">
                            {sizeOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => { setSize(opt.value); }}
                                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        size === opt.value
                                            ? 'bg-[var(--color-accent)] text-white'
                                            : 'bg-[var(--color-background)] text-[var(--color-muted)] hover:bg-[var(--color-border)]'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 w-full">
                        <button onClick={downloadQR} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            {t('تحميل الـ QR Code', 'Download QR Code')}
                        </button>
                        <button
                            onClick={generateQR}
                            className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-background)] text-[var(--color-muted)] hover:bg-[var(--color-border)] transition-all"
                        >
                            {t('إعادة توليد', 'Regenerate')}
                        </button>
                    </div>
                </div>
            ) : (
                /* Placeholder - No QR generated yet */
                <div className="flex flex-col items-center gap-4 py-8">
                    <div className="w-40 h-40 rounded-2xl border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)]">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" />
                            <line x1="21" y1="14" x2="21" y2="14.01" /><line x1="21" y1="21" x2="21" y2="21.01" />
                            <line x1="17" y1="21" x2="17" y2="21.01" /><line x1="21" y1="17" x2="21" y2="17.01" />
                        </svg>
                    </div>
                    <p className="text-sm text-[var(--color-muted)] text-center">
                        {t('لم يتم توليد QR Code بعد', 'No QR Code generated yet')}
                    </p>
                    <button
                        onClick={generateQR}
                        disabled={generating || !menuPublicUrl}
                        className="btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {generating ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {t('جاري التوليد...', 'Generating...')}
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                                    <rect x="3" y="14" width="7" height="7" />
                                </svg>
                                {t('توليد QR Code', 'Generate QR Code')}
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Note */}
            <p className="text-xs text-[var(--color-muted)] text-center border-t border-[var(--color-border)] pt-4">
                {t(
                    'يمكن للعملاء مسح الكود للوصول المباشر إلى المنيو',
                    'Customers can scan the code for direct access to your menu'
                )}
            </p>

            {/* Hidden canvas for generation */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
