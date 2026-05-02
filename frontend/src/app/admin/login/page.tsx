'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await adminApi.post('/admin/login', { email, password });
            localStorage.setItem('adminToken', data.token);
            toast.success('تم تسجيل الدخول بنجاح');
            router.push('/admin');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'بيانات الدخول غير صحيحة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir="rtl">
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />
            <div className="w-full max-w-sm animate-slide-up" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">🔒 لوحة المشرف</h1>
                    <p className="text-slate-400 text-sm mt-2">الوصول مخصص للمشرف فقط</p>
                </div>
                <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-5 backdrop-blur-xl">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="admin@example.com" dir="ltr" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" dir="ltr" required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                        {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
                    </button>
                </form>
            </div>
        </div>
    );
}
