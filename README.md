# مسارك — Masarak Platform

## خطوات الإعداد والنشر

### الخطوة 1: إعداد Supabase
1. اذهب إلى [supabase.com](https://supabase.com) وأنشئ مشروعاً جديداً
2. اسم المشروع: `masarak` | كلمة مرور قوية | Region: `West EU (Ireland)`
3. بعد الإنشاء: شغّل migrations المشروع **بالترتيب** من مجلّد `supabase/migrations/` عبر **SQL Editor** (أو `supabase db push` مع Supabase CLI). ⚠️ **لا تشغّل** `supabase-schema.sql` أو `supabase/schema.sql` القديمين على قاعدة بيانات حيّة — هنّي ملفات legacy متعارضة مع الـ migrations (بتلغي إصلاح التسجيل وبتنشئ نسخة `profiles` بـ RLS معطّل)
4. اذهب لـ **Settings → API** وانسخ:
   - `URL` → هو `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → هو `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### الخطوة 2: رفع الكود على GitHub
1. اذهب لـ [github.com/new](https://github.com/new)
2. اسم المستودع: `masarak` | Private | لا تضع README
3. اضغط Create Repository
4. انسخ رابط المستودع

### الخطوة 3: نشر على Vercel
1. اذهب لـ [vercel.com/new](https://vercel.com/new)
2. اربط حساب GitHub وابحث عن مستودع `masarak`
3. في **Environment Variables** أضف المتغيّرات من `.env.local.example`:
   - **مطلوبة:** `NEXT_PUBLIC_SUPABASE_URL`، `NEXT_PUBLIC_SUPABASE_ANON_KEY`، `SUPABASE_SERVICE_ROLE_KEY` (server-only)، `NEXT_PUBLIC_SITE_URL`، `CRON_SECRET`
   - **اختيارية:** `ADMIN_EMAILS`، `ANTHROPIC_API_KEY`، `NEXT_PUBLIC_GA_ID`، `NEXT_PUBLIC_WHATSAPP_NUMBER`
4. اضغط Deploy

### الخطوة 4: ربط الدومين
1. في Vercel → Settings → Domains → أضف `masaraklb.com`
2. في cPanel → DNS → أضف CNAME: `@` → `cname.vercel-dns.com`
