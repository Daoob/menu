# 🍽️ MenuSA — منصة القوائم الرقمية للتجار السعوديين

منصة SaaS متكاملة تتيح للمطاعم والكافيهات والمتاجر إنشاء قائمة طعام رقمية احترافية مع رمز QR وطلب عبر واتساب.

---

## 📋 فهرس المحتويات

1. [التقنيات المستخدمة](#-التقنيات-المستخدمة)
2. [هيكل المشروع](#-هيكل-المشروع)
3. [التثبيت والتشغيل](#-التثبيت-والتشغيل)
4. [متغيرات البيئة](#-متغيرات-البيئة)
5. [الميزات الأساسية](#-الميزات-الأساسية)
6. [مسار المستخدم](#-مسار-المستخدم)
7. [الحماية والأمان](#-الحماية-والأمان)
8. [النشر على سيرفر VPS](#-النشر-على-سيرفر-vps)
9. [النسخ الاحتياطي](#-النسخ-الاحتياطي)

---

## 🛠️ التقنيات المستخدمة

| الطبقة | التقنية |
|--------|---------|
| الواجهة الأمامية | Next.js 14 (App Router) + Tailwind CSS + TypeScript |
| الخادم الخلفي | Node.js + Express.js |
| قاعدة البيانات | MongoDB + Mongoose |
| المصادقة | JWT (access + refresh) + bcrypt |
| تخزين الصور | Cloudinary |
| الاستضافة | VPS + PM2 + Nginx + SSL (Certbot) |

---

## 📁 هيكل المشروع

```
digital-menu-saas/
├── .env                    # متغيرات البيئة
├── .env.example            # نموذج متغيرات البيئة
├── .gitignore
├── README.md
│
├── backend/                # الخادم الخلفي (Express.js)
│   ├── config/
│   │   ├── db.js           # اتصال MongoDB
│   │   └── cloudinary.js   # إعداد Cloudinary
│   ├── models/
│   │   ├── Admin.js        # نموذج المشرف
│   │   ├── ActivationCode.js # نموذج كود التفعيل
│   │   ├── Merchant.js     # نموذج التاجر
│   │   ├── Category.js     # نموذج التصنيف
│   │   └── Product.js      # نموذج المنتج
│   ├── middleware/
│   │   ├── auth.js         # مصادقة التاجر (JWT)
│   │   ├── adminAuth.js    # مصادقة المشرف (JWT منفصل)
│   │   ├── rateLimiter.js  # تحديد عدد الطلبات
│   │   ├── validate.js     # التحقق من المدخلات
│   │   ├── tenantGuard.js  # حماية بيانات التاجر
│   │   └── upload.js       # رفع الصور (Multer + Cloudinary)
│   ├── controllers/        # 7 وحدات تحكم
│   ├── routes/             # 7 ملفات مسارات API
│   ├── utils/              # أدوات مساعدة
│   ├── server.js           # نقطة الدخول
│   └── package.json
│
└── frontend/               # الواجهة الأمامية (Next.js 14)
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx              # الصفحة الرئيسية
    │   │   ├── login/page.tsx        # تسجيل الدخول
    │   │   ├── activate/page.tsx     # تفعيل الكود
    │   │   ├── register/page.tsx     # إنشاء حساب
    │   │   ├── dashboard/            # لوحة تحكم التاجر
    │   │   │   ├── page.tsx          # نظرة عامة
    │   │   │   ├── products/         # إدارة المنتجات
    │   │   │   ├── appearance/       # المظهر والثيمات
    │   │   │   ├── settings/         # إعدادات المتجر
    │   │   │   └── guide/            # دليل الاستخدام
    │   │   ├── admin/                # لوحة المشرف
    │   │   │   ├── login/            # دخول المشرف
    │   │   │   ├── codes/            # إدارة الأكواد
    │   │   │   └── merchants/        # إدارة التجار
    │   │   └── menu/[slug]/          # القائمة العامة للعملاء
    │   ├── contexts/                 # AuthContext + LanguageContext
    │   └── lib/                      # API + ثوابت + أدوات
    └── package.json
```

---

## 🚀 التثبيت والتشغيل

> **⚡ تشغيل سريع على Windows:**  
> بعد التثبيت، انقر مرتين على ملف **`start.bat`** في جذر المشروع — سيشغّل الـ backend والـ frontend تلقائياً في نافذتين منفصلتين.  
> ثم افتح المتصفح على: **http://localhost:3000**

### المتطلبات
- Node.js 18 أو أحدث
- MongoDB (محلي أو Atlas)
- حساب Cloudinary

### الخطوة 1: إعداد البيئة

```bash
cp .env.example .env
# عدّل ملف .env بالقيم الصحيحة
```

### الخطوة 2: تشغيل الخادم الخلفي

```bash
cd backend
npm install
npm run seed:admin   # إنشاء حساب المشرف (مرة واحدة فقط)
npm run dev          # يعمل على بورت 5000
```

### الخطوة 3: تشغيل الواجهة الأمامية

```bash
cd frontend
npm install
npm run dev          # يعمل على بورت 3000
```

### الخطوة 4: فتح المتصفح
- **الصفحة الرئيسية:** http://localhost:3000
- **لوحة المشرف:** http://localhost:3000/admin
- **تسجيل الدخول:** بإيميل وكلمة مرور المشرف من ملف `.env`

---

## 🔐 متغيرات البيئة

| المتغير | الوصف |
|---------|-------|
| `PORT` | بورت الخادم (افتراضي: 5000) |
| `NODE_ENV` | `development` أو `production` |
| `CLIENT_URL` | رابط الواجهة الأمامية (لإعداد CORS) |
| `MONGODB_URI` | رابط اتصال MongoDB |
| `JWT_ACCESS_SECRET` | مفتاح سري لتوكن الوصول (15 دقيقة) |
| `JWT_REFRESH_SECRET` | مفتاح سري لتوكن التحديث (30 يوم) |
| `ADMIN_SECRET_KEY` | مفتاح سري منفصل لتوكن المشرف |
| `ADMIN_EMAIL` | إيميل المشرف (للتسجيل الأولي) |
| `ADMIN_PASSWORD` | كلمة مرور المشرف |
| `CLOUDINARY_CLOUD_NAME` | اسم سحابة Cloudinary |
| `CLOUDINARY_API_KEY` | مفتاح API لـ Cloudinary |
| `CLOUDINARY_API_SECRET` | المفتاح السري لـ Cloudinary |

---

## ⭐ الميزات الأساسية

### للتاجر (Merchant)
- ✅ إنشاء حساب عبر كود تفعيل
- ✅ لوحة تحكم كاملة لإدارة المتجر
- ✅ إضافة/تعديل/حذف التصنيفات والمنتجات
- ✅ رفع الصور (أو لصقها بـ Ctrl+V)
- ✅ 5 ثيمات احترافية جاهزة
- ✅ وضع داكن / فاتح / ألوان مخصصة
- ✅ رابط قائمة مخصص (slug)
- ✅ رمز QR للقائمة
- ✅ دعم كامل للعربية والإنجليزية (RTL)
- ✅ روابط التواصل الاجتماعي

### للعميل (Customer)
- ✅ تصفح القائمة بدون تسجيل
- ✅ البحث في المنتجات
- ✅ إضافة منتجات إلى السلة
- ✅ إرسال الطلب مباشرة إلى واتساب التاجر

### للمشرف (Admin)
- ✅ لوحة تحكم بالإحصائيات
- ✅ إنشاء أكواد التفعيل
- ✅ إدارة التجار (تفعيل/إيقاف)
- ✅ مراقبة محاولات التفعيل الفاشلة

---

## 🔄 مسار المستخدم

```
المشرف ينشئ كود تفعيل
        ↓
يرسل الكود للتاجر
        ↓
التاجر يدخل الكود في /activate
        ↓
ينشئ حسابه في /register
        ↓
يضبط المتجر (الاسم، الشعار، واتساب)
        ↓
يضيف التصنيفات والمنتجات
        ↓
يختار الثيم والألوان
        ↓
يشارك رابط القائمة مع العملاء
        ↓
العميل يتصفح القائمة ويطلب عبر واتساب
```

---

## 🛡️ الحماية والأمان

| الميزة | التفاصيل |
|--------|----------|
| تشفير كلمات المرور | bcrypt بـ 12 rounds |
| توكن الوصول | JWT - صلاحية 15 دقيقة |
| توكن التحديث | JWT - صلاحية 30 يوم مع تدوير |
| مفتاح المشرف | JWT منفصل بمفتاح سري مستقل |
| تحديد الطلبات | 100 طلب/15 دقيقة (عام)، 10/15 دقيقة (مصادقة) |
| CORS | مقيّد بدومين الواجهة فقط |
| Helmet.js | حماية الهيدرات الأمنية |
| التحقق من المدخلات | express-validator على جميع النقاط |
| حماية XSS | تنظيف جميع المدخلات النصية |
| أكواد التفعيل | 16 حرف عشوائي، قفل تصاعدي بعد 3 محاولات فاشلة |

---

## 🌐 النشر على سيرفر VPS

### 1. إعداد السيرفر

```bash
# تثبيت Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت PM2
sudo npm install -g pm2

# تثبيت MongoDB
sudo apt install -y mongodb
sudo systemctl enable mongodb
```

### 2. نشر الخادم الخلفي

```bash
cd backend
npm install --production
pm2 start server.js --name "menu-api"
pm2 save
pm2 startup
```

### 3. بناء ونشر الواجهة الأمامية

```bash
cd frontend
npm install
npm run build
pm2 start npm --name "menu-frontend" -- start
```

### 4. إعداد Nginx

```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

### 5. تفعيل SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 💾 النسخ الاحتياطي

### نسخ يومي تلقائي لقاعدة البيانات

```bash
# أضف إلى crontab (crontab -e)
0 3 * * * mongodump --out /backup/mongodb/$(date +\%Y\%m\%d) && find /backup/mongodb -mtime +7 -type d -exec rm -rf {} +
```

هذا الأمر ينشئ نسخة احتياطية يوميًا الساعة 3 صباحًا ويحذف النسخ الأقدم من 7 أيام.

---

## 📄 الرخصة

هذا المشروع خاص — جميع الحقوق محفوظة © 2026
