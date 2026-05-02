'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const { lang, setLang, t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18"/><circle cx="7" cy="6" r="1" fill="currentColor"/><circle cx="7" cy="12" r="1" fill="currentColor"/><circle cx="7" cy="18" r="1" fill="currentColor"/></svg>, title_ar: 'قائمة طعام رقمية احترافية', title_en: 'Professional Digital Menu', desc_ar: 'صمم قائمتك بسهولة مع 6 ثيمات جاهزة ودعم كامل للعربية والإنجليزية', desc_en: 'Design your menu easily with 6 ready themes and full Arabic & English support' },
    { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>, title_ar: 'رمز QR فوري', title_en: 'Instant QR Code', desc_ar: 'احصل على رمز QR لمشاركة قائمتك مع عملائك فورًا', desc_en: 'Get a QR code to share your menu with customers instantly' },
    { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 0 1-4.29-1.239l-.293-.174-3.04.797.811-2.96-.192-.3A7.96 7.96 0 0 1 4 12a8 8 0 1 1 16 0 8 8 0 0 1-8 8z"/></svg>, title_ar: 'طلب عبر واتساب', title_en: 'WhatsApp Ordering', desc_ar: 'يستطيع عملاؤك إرسال طلباتهم مباشرة إلى واتساب المتجر', desc_en: 'Customers can send orders directly to your WhatsApp' },
    { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="17" r="2"/><circle cx="6" cy="12" r="3"/><path d="M9 12h5.5l2 5"/></svg>, title_ar: 'تخصيص كامل', title_en: 'Full Customization', desc_ar: 'اختر الألوان والثيمات والوضع الداكن أو المخصص', desc_en: 'Choose colors, themes, dark mode or custom styling' },
    { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>, title_ar: 'آمن ومحمي', title_en: 'Secure & Protected', desc_ar: 'حماية كاملة لبياناتك مع تشفير متقدم', desc_en: 'Complete data protection with advanced encryption' },
    { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, title_ar: 'سريع وخفيف', title_en: 'Fast & Lightweight', desc_ar: 'تحميل فوري لقائمتك بتقنيات متقدمة', desc_en: 'Instant menu loading with advanced technologies' },
  ];

  const faqs = [
    { q_ar: 'كيف أبدأ باستخدام المنصة؟', q_en: 'How do I get started?', a_ar: 'تواصل معنا للحصول على كود التفعيل، ثم سجل حسابك وابدأ بإنشاء قائمتك فورًا', a_en: 'Contact us to get your activation code, then register and start creating your menu right away' },
    { q_ar: 'هل يدعم اللغة العربية؟', q_en: 'Does it support Arabic?', a_ar: 'نعم! المنصة مصممة بالكامل لدعم العربية والإنجليزية مع اتجاه RTL', a_en: 'Yes! The platform is fully designed to support Arabic and English with RTL direction' },
    { q_ar: 'كيف يطلب العملاء؟', q_en: 'How do customers order?', a_ar: 'يختار العميل المنتجات من القائمة ويرسل الطلب مباشرة إلى واتساب المتجر', a_en: 'Customers select products from the menu and send the order directly to your WhatsApp' },
    { q_ar: 'هل يمكنني تغيير التصميم؟', q_en: 'Can I change the design?', a_ar: 'بالتأكيد! اختر من 5 ثيمات جاهزة أو خصص ألوانك بالكامل', a_en: 'Absolutely! Choose from 5 ready themes or fully customize your colors' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 bg-[var(--color-background)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold gradient-text">daoob</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="btn-ghost text-sm font-medium"
            >
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>
            <Link href="/login" className="btn-ghost text-sm font-medium">
              {t('تسجيل الدخول', 'Login')}
            </Link>
            <Link href="/activate" className="btn-primary text-sm">
              {t('ابدأ الآن', 'Get Started')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 via-transparent to-purple-500/5" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-block mb-6 px-4 py-2 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full text-sm font-medium animate-fade-in">
            {t('منصة القوائم الرقمية #1 في السعودية', '#1 Digital Menu Platform in Saudi Arabia')}
          </div>
          <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight animate-slide-up">
            {t('حوّل قائمتك إلى', 'Transform Your Menu to a')}
            <br />
            <span className="gradient-text">{t('تجربة رقمية مذهلة', 'Stunning Digital Experience')}</span>
          </h2>
          <p className="text-xl text-[var(--color-muted)] mb-10 max-w-2xl mx-auto animate-slide-up">
            {t(
              'أنشئ قائمة طعام رقمية احترافية لمطعمك أو كافيهك بسهولة تامة. رمز QR، طلب واتساب، تصاميم مذهلة.',
              'Create a professional digital menu for your restaurant or cafe with ease. QR code, WhatsApp ordering, stunning designs.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link href="/activate" className="btn-primary text-lg px-10 py-4">
              {t('ابدأ الآن - 49 ر.س/شهر', 'Get Started - 49 SAR/month')}
            </Link>
            <a href="#features" className="btn-secondary text-lg px-10 py-4">
              {t('اكتشف المزيد', 'Learn More')}
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {t('كل ما تحتاجه في مكان واحد', 'Everything You Need in One Place')}
          </h3>
          <p className="text-[var(--color-muted)] text-center mb-16 max-w-xl mx-auto">
            {t('أدوات متكاملة لإنشاء وإدارة قائمتك الرقمية', 'Integrated tools to create and manage your digital menu')}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card-hover group" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300 text-[var(--color-accent)]">{f.icon}</div>
                <h4 className="text-lg font-bold mb-2">{lang === 'ar' ? f.title_ar : f.title_en}</h4>
                <p className="text-[var(--color-muted)] text-sm">{lang === 'ar' ? f.desc_ar : f.desc_en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-[var(--color-accent)]/5 to-transparent">
        <div className="max-w-md mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">
            {t('خطة بسيطة وواضحة', 'Simple & Clear Pricing')}
          </h3>
          <div className="card-hover">
            <div className="text-6xl font-black gradient-text mb-2">49</div>
            <div className="text-[var(--color-muted)] mb-6">{t('ريال سعودي / شهريًا', 'SAR / month')}</div>
            <ul className="text-start space-y-3 mb-8">
              {[
                t('قائمة رقمية كاملة', 'Full digital menu'),
                t('6 ثيمات احترافية', '6 professional themes'),
                t('رمز QR قابل للتحميل', 'Downloadable QR code'),
                t('طلب عبر واتساب', 'WhatsApp ordering'),
                t('دعم العربية والإنجليزية', 'Arabic & English support'),
                t('الوضع الداكن والمخصص', 'Dark & custom modes'),
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-500 flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/activate" className="btn-primary w-full block text-center">
              {t('ابدأ الآن', 'Get Started')}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">
            {t('الأسئلة الشائعة', 'Frequently Asked Questions')}
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="card cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{lang === 'ar' ? faq.q_ar : faq.q_en}</h4>
                  <span className={`text-[var(--color-accent)] transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </div>
                {openFaq === i && (
                  <p className="mt-4 text-[var(--color-muted)] text-sm animate-slide-down">
                    {lang === 'ar' ? faq.a_ar : faq.a_en}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold gradient-text mb-2">daoob</h2>
          <p className="text-[var(--color-muted)] text-sm">
            {t('© 2026 daoob. جميع الحقوق محفوظة.', '© 2026 daoob. All rights reserved.')}
          </p>
        </div>
      </footer>
    </div>
  );
}
