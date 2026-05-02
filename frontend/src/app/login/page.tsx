'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success(t('تم تسجيل الدخول بنجاح', 'Logged in successfully'));
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('خطأ في البريد أو كلمة المرور', 'Invalid email or password'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-[var(--color-background)] via-[var(--color-accent)]/5 to-[var(--color-background)]">
            <div className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-bold gradient-text">daoob</Link>
                    <h2 className="text-2xl font-bold mt-6 mb-2">{t('تسجيل الدخول', 'Login')}</h2>
                    <p className="text-[var(--color-muted)]">
                        {t('أدخل بياناتك للوصول إلى لوحة التحكم', 'Enter your credentials to access the dashboard')}
                    </p>
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
                            autoFocus
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
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {t('جاري الدخول...', 'Signing in...')}
                            </span>
                        ) : (
                            t('دخول', 'Sign In')
                        )}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-[var(--color-muted)]">
                    {t('ليس لديك حساب؟', "Don't have an account?")}{' '}
                    <Link href="/activate" className="text-[var(--color-accent)] font-medium hover:underline">
                        {t('احصل على كود التفعيل', 'Get activation code')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
