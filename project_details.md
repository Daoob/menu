# 📋 تفاصيل مشروع: Digital Menu SaaS — منصة **daoob**

## 🧭 نظرة عامة

منصة **SaaS** (Software as a Service) متكاملة لإنشاء قوائم طعام رقمية للمطاعم والمقاهي.  
تتيح للتجار عرض منتجاتهم وفئاتهم عبر رابط عام قابل للمسح (QR Code).  
الاسم التجاري للمنصة هو **daoob**.

---

## 📁 هيكل المشروع

```
digital-menu-saas/
├── .env                    # متغيرات البيئة الحقيقية
├── .env.example            # نموذج متغيرات البيئة
├── .gitignore
├── README.md
├── start.bat               # ملف تشغيل البروجكت بضغطة واحدة (Windows)
├── backend/                # الخادم الخلفي
└── frontend/               # الواجهة الأمامية
```

---

## ⚙️ التقنيات المستخدمة

### Backend (الخادم الخلفي)
| التقنية | الإصدار | الغرض |
|---|---|---|
| Node.js + Express | ^4.18.3 | إطار عمل الخادم |
| MongoDB + Mongoose | ^8.2.0 | قاعدة البيانات |
| bcrypt | ^5.1.1 | تشفير كلمات المرور |
| jsonwebtoken | ^9.0.2 | نظام JWT للمصادقة |
| Cloudinary | ^1.41.3 | رفع وتخزين الصور |
| Multer | ^1.4.5-lts | معالجة رفع الملفات |
| Helmet | ^7.1.0 | أمان HTTP headers |
| CORS | ^2.8.5 | التحكم في مصادر الطلبات |
| express-rate-limit | ^7.1.5 | حد معدل الطلبات |
| express-validator | ^7.0.1 | التحقق من صحة المدخلات |
| xss | ^1.0.15 | الحماية من هجمات XSS |
| cookie-parser | ^1.4.6 | معالجة الكوكيز |
| nodemon | ^3.1.0 | إعادة التشغيل التلقائي (dev) |

### Frontend (الواجهة الأمامية)
| التقنية | الإصدار | الغرض |
|---|---|---|
| Next.js | 16.1.6 | إطار React مع SSR |
| React + React DOM | 19.2.3 | مكتبة واجهة المستخدم |
| TypeScript | ^5 | أنواع البيانات الثابتة |
| TailwindCSS | ^4 | نظام التصميم |
| axios | ^1.13.6 | طلبات HTTP |
| js-cookie | ^3.0.5 | إدارة الكوكيز |
| qrcode + qrcode.react | ^1.5.4 / ^4.2.0 | إنشاء QR Codes |
| @hello-pangea/dnd | ^18.0.1 | Drag & Drop للمنتجات |
| react-hot-toast | ^2.6.0 | إشعارات التنبيه |

---

## 🗄️ قاعدة البيانات — نماذج البيانات (Mongoose Models)

### 1. Merchant (التاجر)
```
المجموعة: merchants
```
| الحقل | النوع | الوصف |
|---|---|---|
| email | String (unique) | البريد الإلكتروني (مطلوب) |
| ownerName | String | اسم صاحب المتجر |
| phone | String | رقم الجوال |
| passwordHash | String | كلمة المرور المشفرة (bcrypt x12) |
| refreshToken | String | توكن التجديد المحفوظ |
| slug | String (unique) | الرابط المخصص للمنيو (مثال: my-cafe) |
| storeName_ar | String | اسم المتجر بالعربية |
| storeName_en | String | اسم المتجر بالإنجليزية |
| logo | String | رابط شعار المتجر (Cloudinary / محلي) |
| coverImage | String | رابط صورة الغلاف |
| whatsapp | String | رقم واتساب (يبدأ بـ 05، 10 أرقام) |
| language | Enum: ar/en/both | لغة عرض المنيو |
| theme.selectedTheme | Number (1-6) | رقم الثيم المختار |
| theme.mode | Enum: light/dark/custom | وضع الثيم |
| theme.customColors | Object | ألوان مخصصة (primary/secondary/background/text) |
| social.snapchat | String | رابط سناب شات |
| social.instagram | String | رابط إنستغرام |
| social.tiktok | String | رابط تيك توك |
| social.x | String | رابط تويتر (X) |
| isActive | Boolean | حالة الحساب (نشط/موقوف) |
| lastLogin | Date | آخر وقت تسجيل دخول |
| subscriptionEndsAt | Date | تاريخ انتهاء الاشتراك |

> **Virtual Field:** `subscriptionStatus` — يُحسب تلقائياً ويعيد: `active` / `grace` / `expired`  
> **Grace Period:** 15 يوماً بعد انتهاء الاشتراك

---

### 2. ActivationCode (كود التفعيل)
```
المجموعة: activationcodes
```
| الحقل | النوع | الوصف |
|---|---|---|
| code | String (unique) | الكود (16 حرف، أحرف كبيرة) |
| isUsed | Boolean | هل تم استخدامه؟ |
| usedAt | Date | وقت الاستخدام |
| usedByEmail | String | البريد الذي استخدمه |
| expiresAt | Date | تاريخ انتهاء الصلاحية (7 أيام من الإنشاء) |
| failedAttempts | Number | عدد محاولات الإدخال الفاشلة |
| lockedUntil | Date | مقفل حتى هذا الوقت |
| attemptLogs | Array | سجل المحاولات {ip, timestamp} |

> **نظام القفل التدريجي:**
> - 3 محاولات فاشلة → قفل 5 دقائق
> - 4 محاولات → قفل 15 دقيقة
> - 5 محاولات → قفل ساعة
> - 6+ محاولات → قفل 3 ساعات

---

### 3. Category (الفئة)
```
المجموعة: categories
```
| الحقل | النوع | الوصف |
|---|---|---|
| merchant_id | ObjectId → Merchant | مرجع التاجر |
| name_ar | String | اسم الفئة بالعربية (مطلوب) |
| name_en | String | اسم الفئة بالإنجليزية (مطلوب) |
| order | Number | ترتيب الفئة |
| isVisible | Boolean | هل الفئة ظاهرة؟ |

---

### 4. Product (المنتج)
```
المجموعة: products
```
| الحقل | النوع | الوصف |
|---|---|---|
| merchant_id | ObjectId → Merchant | مرجع التاجر |
| category_id | ObjectId → Category | مرجع الفئة |
| name_ar | String | اسم المنتج بالعربية (مطلوب) |
| name_en | String | اسم المنتج بالإنجليزية |
| description_ar | String | وصف المنتج بالعربية |
| description_en | String | وصف المنتج بالإنجليزية |
| price | Number (≥ 0) | السعر (مطلوب) |
| image | String | رابط صورة المنتج (Cloudinary) |
| isVisible | Boolean | هل المنتج ظاهر؟ |
| order | Number | ترتيب المنتج داخل الفئة |

---

### 5. Admin (المدير)
```
المجموعة: admins
```
| الحقل | النوع | الوصف |
|---|---|---|
| email | String (unique) | البريد الإلكتروني |
| passwordHash | String | كلمة المرور المشفرة |

---

## 🌐 API Endpoints

**Base URL:** `http://localhost:5000/api`

### 🔐 المصادقة — `/api/auth`
| Method | Endpoint | الوصف | Auth |
|---|---|---|---|
| POST | `/register` | تسجيل تاجر جديد (يتطلب كود التفعيل) | ❌ |
| POST | `/login` | تسجيل الدخول | ❌ |
| POST | `/refresh` | تجديد الـ access token | ❌ (cookie) |
| POST | `/logout` | تسجيل الخروج | ✅ Merchant |
| PUT | `/change-password` | تغيير كلمة المرور | ✅ Merchant |
| GET | `/me` | بيانات التاجر الحالي | ✅ Merchant |

---

### 🏪 التاجر — `/api/merchant`
> جميع الروابط تتطلب: `merchantAuth + checkSubscription`

| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/profile` | جلب ملف التاجر |
| PUT | `/store` | تحديث إعدادات المتجر (الاسم، واتساب، اللغة، السوشيال) |
| PUT | `/theme` | تحديث الثيم والألوان |
| POST | `/logo` | رفع الشعار |
| POST | `/cover` | رفع صورة الغلاف |
| PUT | `/slug` | تعيين الـ slug المخصص |
| GET | `/slug/check/:slug` | التحقق من توفر الـ slug |

---

### 📦 الفئات — `/api/categories`
| Method | Endpoint | الوصف | Auth |
|---|---|---|---|
| GET | `/` | جلب كل فئات التاجر | ✅ |
| POST | `/` | إضافة فئة جديدة | ✅ |
| PUT | `/:id` | تعديل فئة | ✅ |
| DELETE | `/:id` | حذف فئة | ✅ |
| PUT | `/reorder` | إعادة ترتيب الفئات | ✅ |

---

### 🛍️ المنتجات — `/api/products`
| Method | Endpoint | الوصف | Auth |
|---|---|---|---|
| GET | `/` | جلب كل منتجات التاجر | ✅ |
| POST | `/` | إضافة منتج جديد | ✅ |
| PUT | `/:id` | تعديل منتج | ✅ |
| DELETE | `/:id` | حذف منتج | ✅ |
| PUT | `/reorder` | إعادة ترتيب المنتجات | ✅ |

---

### 📋 القائمة العامة — `/api/menu`
| Method | Endpoint | الوصف | Auth |
|---|---|---|---|
| GET | `/:slug` | جلب قائمة المتجر للعموم (بدون تسجيل دخول) | ❌ |

---

### 🔑 كود التفعيل — `/api/activation`
| Method | Endpoint | الوصف |
|---|---|---|
| POST | `/verify` | التحقق من صحة كود التفعيل |

---

### 👑 لوحة الأدمن — `/api/admin`
| Method | Endpoint | الوصف |
|---|---|---|
| POST | `/login` | دخول الأدمن |
| POST | `/codes/generate` | توليد أكواد تفعيل (1-50 كود) |
| GET | `/codes` | جلب كل الأكواد (مع فلترة) |
| DELETE | `/codes/:id` | حذف كود غير مستخدم |
| GET | `/merchants` | جلب كل التجار (مع بحث وترقيم) |
| PATCH | `/merchants/:id/toggle-status` | تفعيل/تعليق حساب تاجر |
| PATCH | `/merchants/:id/renew` | تجديد اشتراك تاجر |
| GET | `/stats` | إحصاءات عامة للمنصة |

---

### ❤️ Health Check
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/api/health` | التحقق من حالة الخادم |

---

## 🛡️ نظام الأمان

### 1. المصادقة (Authentication)
- **Access Token:** JWT قصير الأجل (عبر `Authorization: Bearer`)
- **Refresh Token:** JWT طويل الأجل (30 يوم) محفوظ كـ HttpOnly Cookie
- **Token Rotation:** تجديد الـ refresh token مع كل طلب refresh
- **الحماية:** التحقق من `role: 'merchant'` داخل التوكن

### 2. Rate Limiting
| المحدد | النافذة الزمنية | الحد الأقصى |
|---|---|---|
| Global Limiter | 15 دقيقة | 100 طلب/IP |
| Auth Limiter | 15 دقيقة | 10 طلبات/IP |

### 3. حماية أخرى
- **Helmet:** حماية HTTP headers
- **XSS Protection:** تنظيف جميع المدخلات النصية
- **Validation:** express-validator على كل endpoint
- **CORS:** مفتوح في development، مقيد في production بـ CLIENT_URL
- **File Upload:** فلترة نوع الملف (JPG/PNG/WebP/SVG فقط)، حد 5MB

---

## 🎨 الثيمات المدعومة (6 ثيمات)

| # | الاسم | الاسم بالعربية |
|---|---|---|
| 1 | Midnight Rose | وردة منتصف الليل (بنفسجي وردي) |
| 2 | Dark Burgundy | عنابي داكن |
| 3 | Midnight Gold | أزرق ذهبي |
| 4 | Emerald Nature | زمرد طبيعي (الثيم الافتراضي للمنصة) |
| 5 | Velvet Mauve | مخمل وردي |
| 6 | Coffee Brown | بني قهوة |

- كل ثيم يدعم وضعين: **Light** و **Dark**
- يوجد وضع **Custom** للألوان المخصصة بالكامل

---

## 📱 صفحات الواجهة الأمامية (Next.js)

```
frontend/src/app/
├── page.tsx                  # الصفحة الرئيسية (Landing Page)
├── layout.tsx                # التخطيط العام
├── globals.css               # التنسيق العام
├── login/                    # صفحة تسجيل الدخول
├── register/                 # صفحة التسجيل
├── activate/                 # صفحة تفعيل الحساب
├── menu/[slug]/              # صفحة المنيو العام (للزوار)
├── dashboard/                # لوحة التحكم
│   ├── layout.tsx            # شريط جانبي + تحقق المصادقة
│   ├── page.tsx              # الرئيسية
│   ├── products/             # إدارة المنتجات والفئات
│   ├── appearance/           # تخصيص المظهر
│   ├── settings/             # إعدادات المتجر + QR Code
│   └── guide/                # دليل الاستخدام
└── admin/                    # لوحة الأدمن
    ├── layout.tsx
    ├── page.tsx
    ├── login/
    ├── codes/                # إدارة أكواد التفعيل
    └── merchants/            # إدارة التجار
```

---

## 🧩 المكونات (Components)

| المكون | الوصف |
|---|---|
| `MenuPreview.tsx` | معاينة المنيو داخل لوحة التحكم (محاكاة الجوال) |
| `MenuQRCodeSection.tsx` | قسم توليد وتحميل QR Code لرابط المنيو |
| `SubscriptionBanner.tsx` | شريط تنبيه حالة الاشتراك (نشط/فترة سماح/منتهي) |

---

## 🔄 السياقات (React Contexts)

| السياق | الوصف |
|---|---|
| `AuthContext.tsx` | إدارة حالة المصادقة، بيانات التاجر، access token |
| `LanguageContext.tsx` | إدارة اللغة (عربي/إنجليزي)، دالة `t()` للترجمة |

---

## 🛠️ أدوات البواكند (Utils)

| الملف | الوصف |
|---|---|
| `generateCode.js` | توليد كود تفعيل عشوائي (16 حرف) |
| `tokenUtils.js` | توليد والتحقق من JWT (access + refresh + admin) |
| `logger.js` | تسجيل الأحداث الهامة (login، register، codes...) |
| `seedAdmin.js` | إنشاء أول حساب أدمن في قاعدة البيانات |
| `migrateSubscription.js` | سكريبت ترحيل بيانات الاشتراك |

---

## 💾 رفع الصور

يستخدم المشروع نظام رفع مزدوج:

```
Cloudinary متوفر؟
├── نعم → رفع مباشر على Cloudinary (CDN)
│         تحويل تلقائي: max 1200x1200، جودة auto
└── لا  → رفع محلي في /backend/uploads/ (fallback)
```

**الأنواع المسموح بها:** JPG, JPEG, PNG, WebP, SVG  
**الحد الأقصى:** 5 MB

---

## 📋 نظام الاشتراك

| الحالة | المعنى |
|---|---|
| `active` | اشتراك نشط (`subscriptionEndsAt > now`) |
| `grace` | فترة سماح 15 يوماً بعد الانتهاء |
| `expired` | انتهى الاشتراك وفترة السماح |

- يُعرض `SubscriptionBanner` في لوحة التحكم حسب الحالة
- الأدمن يجدد الاشتراك بـ: 1 / 3 / 6 / 12 شهراً أو تاريخ مخصص
- إذا كان الاشتراك لا يزال نشطاً عند التجديد → يُضاف الوقت فوق الرصيد
- إذا كان منتهياً → يبدأ من اليوم الحالي

---

## 🌍 دعم اللغتين

- جميع بيانات المتجر بالعربية **والإنجليزية** (name_ar / name_en)
- لوحة التحكم تدعم التبديل لحظياً بين AR و EN
- الـ CSS يستخدم `dir="rtl"` مع خط Tajawal للعربية وInter للإنجليزية
- خيار `language` على مستوى كل متجر: `ar` | `en` | `both`

---

## 🖥️ متغيرات البيئة (.env)

```env
# الخادم
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# قاعدة البيانات
MONGODB_URI=mongodb://localhost:27017/digital-menu-saas

# JWT
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...

# الأدمن
ADMIN_SECRET_KEY=...
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecureAdminPassword123!

# Cloudinary (اختياري)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## 🚀 تشغيل المشروع

### الطريقة السريعة (Windows)
```
انقر مرتين على: start.bat
```
يفتح نافذتي CMD:
- Backend على المنفذ 5000
- Frontend على المنفذ 3000

### يدوياً
```bash
# Backend
cd backend
npm run dev

# Frontend (في نافذة أخرى)
cd frontend
npm run dev
```

### أوامر خاصة
```bash
# إنشاء أول أدمن
cd backend && npm run seed:admin

# ترحيل بيانات الاشتراك
cd backend && npm run migrate:subscription
```

---

## 🔁 تدفق التسجيل للتاجر الجديد

```
1. الأدمن يولّد كود تفعيل (16 حرف، صالح 7 أيام)
2. يعطي الكود للعميل
3. العميل يدخل الكود في /activate
4. بعد التحقق → ينتقل لصفحة /register مع الكود
5. يسجل بـ (email + password + code)
6. يُنشأ الحساب ويُحذف الكود نهائياً
7. ينتقل للـ Dashboard لإعداد متجره
```

---

## 📊 إحصاءات لوحة الأدمن

```
الإحصاءات المتاحة:
- إجمالي التجار
- التجار النشطون / الموقوفون
- الأكواد غير المستخدمة / المستخدمة
- التجار بالاشتراك النشط / فترة السماح / المنتهي
```

---

## 🎯 مسار الـ Slug (رابط المنيو)

```
رابط المنيو العام:
http://localhost:3000/menu/{slug}
أو في production: https://yourdomain.com/menu/{slug}

قواعد الـ slug:
- أحرف صغيرة، أرقام، شرطات فقط: [a-z0-9-]
- الطول: 3 إلى 30 حرفاً
- فريد لكل تاجر
- يُتحقق من توفره قبل الحفظ
```
