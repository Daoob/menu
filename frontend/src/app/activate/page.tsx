'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ActivatePage() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const upperCode = code.toUpperCase().trim();

        if (upperCode.length !== 16) {
            toast.error(t('كود التفعيل يجب أن يكون 16 حرفًا', 'Activation code must be 16 characters'));
            return;
        }

        setLoading(true);
        try {
            await api.post('/activation/validate', { code: upperCode });
            toast.success(t('كود صالح! قم بإنشاء حسابك', 'Valid code! Create your account'));
            router.push(`/register?code=${upperCode}`);
        } catch (error: any) {
            const msg = error.response?.data?.message || t('كود غير صالح', 'Invalid code');
            toast.error(msg);
            // Record failed attempt
            try {
                await api.post('/activation/failed', { code: upperCode });
            } catch { }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-[var(--color-background)] via-[var(--color-accent)]/5 to-[var(--color-background)]">
            <div className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-bold gradient-text">daoob</Link>
                    <h2 className="text-2xl font-bold mt-6 mb-2">{t('تفعيل الحساب', 'Activate Account')}</h2>
                    <p className="text-[var(--color-muted)]">
                        {t('أدخل كود التفعيل الذي حصلت عليه', 'Enter the activation code you received')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {t('كود التفعيل', 'Activation Code')}
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16))}
                            className="input-field text-center text-2xl tracking-[0.3em] font-mono"
                            placeholder="XXXXXXXXXXXXXXXX"
                            maxLength={16}
                            dir="ltr"
                            autoFocus
                        />
                        <p className="text-xs text-[var(--color-muted)] mt-2 text-center">
                            {code.length}/16 {t('حرف', 'characters')}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.length !== 16}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {t('جاري التحقق...', 'Verifying...')}
                            </span>
                        ) : (
                            t('تحقق من الكود', 'Verify Code')
                        )}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-[var(--color-muted)]">
                    {t('لديك حساب بالفعل؟', 'Already have an account?')}{' '}
                    <Link href="/login" className="text-[var(--color-accent)] font-medium hover:underline">
                        {t('تسجيل الدخول', 'Login')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
