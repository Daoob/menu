'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { validatePassword } from '@/lib/validators';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Suspense } from 'react';

function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code') || '';

    if (!code) {
        router.push('/activate');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const pwCheck = validatePassword(password);
        if (!pwCheck.valid) {
            toast.error(pwCheck.message);
            return;
        }

        if (password !== confirmPassword) {
            toast.error(t('كلمات المرور غير متطابقة', 'Passwords do not match'));
            return;
        }

        setLoading(true);
        try {
            await register(email, password, code);
            toast.success(t('تم إنشاء الحساب بنجاح!', 'Account created successfully!'));
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('حدث خطأ', 'An error occurred'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-[var(--color-background)] via-[var(--color-accent)]/5 to-[var(--color-background)]">
            <div className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-bold gradient-text">daoob</Link>
                    <h2 className="text-2xl font-bold mt-6 mb-2">{t('إنشاء حساب جديد', 'Create Account')}</h2>
                    <div className="inline-block px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
                        ✓ {t('كود التفعيل مؤكد', 'Activation code verified')}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {t('البريد الإلكتروني', 'Email')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="you@example.com"
                            dir="ltr"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {t('كلمة المرور', 'Password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            dir="ltr"
                            required
                        />
                        <p className="text-xs text-[var(--color-muted)] mt-1">
                            {t('8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم', 'Min 8 chars, uppercase, lowercase, and number')}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {t('تأكيد كلمة المرور', 'Confirm Password')}
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            dir="ltr"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {t('جاري الإنشاء...', 'Creating...')}
                            </span>
                        ) : (
                            t('إنشاء الحساب', 'Create Account')
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>}>
            <RegisterForm />
        </Suspense>
    );
}
