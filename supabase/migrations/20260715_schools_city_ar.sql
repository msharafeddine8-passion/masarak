-- ============================================================================
-- Schools cleanup — Arabize city_or_area for well-known Lebanese localities
-- (rebuild spec H1: no English inside Arabic pages). CONSERVATIVE: only maps
-- towns we are confident about; obscure village spellings are left as-is on
-- purpose (rule #13 — an honest transliteration beats a wrong Arabic guess).
-- Idempotent (targets exact English values). NOT auto-applied — run after review.
-- ============================================================================
UPDATE public.schools SET city_or_area = m.ar
FROM (VALUES
  ('Achrafieh','الأشرفية'), ('Ashrafieh','الأشرفية'), ('Choueifat','الشويفات'),
  ('Ain Saadeh','عين سعادة'), ('Baakleen','بعقلين'), ('Adma','أدما'),
  ('Anjar','عنجر'), ('Barja','برجا'), ('Bir Hassan','بئر حسن'),
  ('Bourj Hammoud','برج حمود'), ('Byblos','جبيل'), ('Clemenceau','كليمنصو'),
  ('Fanar','الفنار'), ('Hadat','الحدث'), ('Hadath','الحدث'),
  ('Jounieh','جونية'), ('Kfarshima','كفرشيما'), ('Mansourieh','المنصورية'),
  ('Msaytbeh','المصيطبة'), ('Moussaitbeh','المصيطبة'), ('Aabra','عبرا'),
  ('Ain Aar','عين عار'), ('Ain El Rummaneh','عين الرمانة'), ('Akkar Al-Atika','عكار العتيقة'),
  ('Al Manara','المنارة'), ('Amsheet','عمشيت'), ('Antoura','عنتورا'),
  ('Aramoun','عرمون'), ('Baabdat','بعبدات'), ('Baskinta','بسكنتا'),
  ('Bebnine','ببنين'), ('Bekaa','البقاع'), ('Bqennaya','بقنايا'),
  ('Brummana','برمانا'), ('Bsalim','بصاليم'), ('Cornet Chahwan','قرنة شهوان'),
  ('Dbayeh','ضبية'), ('Dhour Shweir','ضهور الشوير'), ('Ersal','عرسال'),
  ('Fnaydek','فنيدق'), ('Gemmayze','الجميزة'), ('Habbouche','حبّوش'),
  ('Hamra','الحمرا'), ('Haret Hreik','حارة حريك'), ('Hazmieh','الحازمية'),
  ('Jamhour','الجمهور'), ('Jdeideh','الجديدة'), ('Jezzine','جزين'),
  ('Khaldeh','خلدة'), ('Ksara','كسارة'), ('Majdal Anjar','مجدل عنجر'),
  ('Metn','المتن'), ('Nahr Ibrahim','نهر إبراهيم'), ('Rabieh','الرابية'),
  ('Rashaya','راشيا'), ('Rawda','الروضة'), ('Sahel Alma','ساحل علما'),
  ('Saida','صيدا'), ('Sin El Fil','سن الفيل'), ('Verdun','فردان'),
  ('Zouk Mosbeh','ذوق مصبح'), ('Bchamoun','بشامون'), ('Baaloul','بعلول'),
  ('Deek El Mehdi','ديك المحدي'), ('Dik El Mehdi','ديك المحدي'), ('Doha Aramoun','ضوحى عرمون'),
  ('Ghazza','غزة'), ('Kamed Al-Lawz','كامد اللوز'), ('Karoun','القرعون'),
  ('Mtein','المتين'), ('Qabb Ilyas','قب الياس'), ('Kebb Al-Yas','قب الياس'),
  ('Berr Al-Yas','بر الياس'), ('Borj Al Shimali','برج الشمالي'), ('Bakaata','بقعاتا'),
  ('Qabreshmoon','قبرشمون'), ('Majdal Anjar','مجدل عنجر'), ('Amanos','أمانوس'),
  -- compound "A / B" localities where both parts are well known
  ('Adma / Fatka','أدما / فتقا'), ('Beirut / Khaldeh','بيروت / خلدة'),
  ('Ksara / Zahle','كسارة / زحلة'), ('Jdeideh / Metn','الجديدة / المتن'),
  ('Rabieh / Cornet Chahwan','الرابية / قرنة شهوان'), ('Sioufi / Achrafieh','السيوفي / الأشرفية'),
  ('Kraytem / Beirut','قريطم / بيروت'), ('Douris / Baalbek','دورس / بعلبك'),
  ('Tyre / Hay Al Ramel','صور / حي الرمل'), ('Adonis / Zouk Mosbeh','أدونيس / ذوق مصبح'),
  ('Aramoun / Bshamoun','عرمون / بشامون')
) AS m(en, ar)
WHERE public.schools.city_or_area = m.en;

-- report what's left in English (for the manual gap list)
SELECT count(*) AS english_cities_remaining
FROM public.schools WHERE city_or_area IS NOT NULL AND city_or_area !~ '[ء-ي]';
