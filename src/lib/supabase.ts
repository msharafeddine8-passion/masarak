// src/lib/supabase.ts
// استخدم createClientComponentClient حتى الجلسة تنحفظ بـ cookies
// (مش بس localStorage) — هذا يخلّي الـ session تشتغل عبر كل الصفحات
// والـ middleware يقدر يفحصها على السيرفر

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();
