"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

interface Internship {
  id: number;
  company: string;
  logo: string;
  role: string;
  category: string;
  city: string;
  type: "paid" | "unpaid" | "stipend";
  duration: string;
  deadline: string;
  salary?: string;
  description: string;
  skills: string[];
  applyUrl: string;
  featured?: boolean;
}

const INTERNSHIPS: Internship[] = [
  { id: 1, company: "Berytech", logo: "🚀", role: "Business Development Intern", category: "startup", city: "بيروت", type: "paid", duration: "3 أشهر", deadline: "2026-06-15", salary: "300-500$ / شهر", description: "ساعد شركات الناشئة اللبنانية على النمو من خلال التسويق وتطوير الأعمال", skills: ["Excel", "PowerPoint", "التواصل", "التسويق"], applyUrl: "https://berytech.org", featured: true },
  { id: 2, company: "Banque du Liban", logo: "🏦", role: "Finance & Economics Intern", category: "finance", city: "بيروت", type: "stipend", duration: "2 أشهر", deadline: "2026-05-30", salary: "200$ / شهر", description: "تدريب في القسم المالي والاقتصادي لدى البنك المركزي اللبناني", skills: ["Excel", "تحليل بيانات", "اقتصاد", "محاسبة"], applyUrl: "https://bdl.gov.lb", featured: true },
  { id: 3, company: "Ogero Telecom", logo: "📡", role: "Network Engineering Intern", category: "tech", city: "بيروت", type: "paid", duration: "3 أشهر", deadline: "2026-06-01", salary: "400$ / شهر", description: "العمل مع فريق الشبكات على تطوير البنية التحتية لشبكة الإنترنت في لبنان", skills: ["Networking", "Linux", "Cisco", "Python"], applyUrl: "https://ogero.gov.lb" },
  { id: 4, company: "UNICEF Lebanon", logo: "🌍", role: "Communications & Media Intern", category: "ngo", city: "بيروت", type: "stipend", duration: "6 أشهر", deadline: "2026-06-20", salary: "350$ / شهر", description: "دعم فريق الاتصالات والإعلام لدى منظمة الأمم المتحدة لرعاية الأطفال", skills: ["كتابة محتوى", "Social Media", "تصميم", "تواصل"], applyUrl: "https://unicef.org/lebanon", featured: true },
  { id: 5, company: "Murex", logo: "💻", role: "Software Engineering Intern", category: "tech", city: "بيروت", type: "paid", duration: "3 أشهر", deadline: "2026-07-01", salary: "600-800$ / شهر", description: "تطوير برمجيات في شركة Murex الرائدة عالمياً في حلول التكنولوجيا المالية", skills: ["Java", "C++", "SQL", "Algorithms"], applyUrl: "https://murex.com/careers", featured: true },
  { id: 6, company: "Deloitte Lebanon", logo: "📊", role: "Audit & Assurance Intern", category: "finance", city: "بيروت", type: "paid", duration: "3 أشهر", deadline: "2026-05-31", salary: "400-500$ / شهر", description: "تدريب في قسم التدقيق والتأكيد لدى شركة Deloitte لبنان", skills: ["محاسبة", "Excel", "تدقيق", "التحليل المالي"], applyUrl: "https://deloitte.com/lb" },
  { id: 7, company: "JWT Lebanon", logo: "📢", role: "Marketing & Creative Intern", category: "marketing", city: "بيروت", type: "paid", duration: "2 أشهر", deadline: "2026-06-10", salary: "300$ / شهر", description: "انضم لفريق الإبداع في JWT لبنان وساعد في تطوير حملات إعلانية", skills: ["Photoshop", "Canva", "Copywriting", "Social Media"], applyUrl: "https://jwt.com" },
  { id: 8, company: "Siemens Lebanon", logo: "⚡", role: "Electrical Engineering Intern", category: "engineering", city: "بيروت", type: "paid", duration: "3 أشهر", deadline: "2026-06-25", salary: "500$ / شهر", description: "تدريب هندسي في مشاريع الطاقة والبنية التحتية لدى شركة سيمنز لبنان", skills: ["AutoCAD", "Electrical Design", "PLC", "MATLAB"], applyUrl: "https://siemens.com/lb" },
  { id: 9, company: "Wamda", logo: "🌟", role: "Startup Ecosystem Intern", category: "startup", city: "بيروت", type: "stipend", duration: "4 أشهر", deadline: "2026-07-15", salary: "200-300$ / شهر", description: "اعمل مع Wamda لدعم ريادة الأعمال في منطقة MENA", skills: ["Research", "Content Writing", "Event Planning", "Networking"], applyUrl: "https://wamda.com" },
  { id: 10, company: "Middle East Airlines", logo: "✈️", role: "Operations & Logistics Intern", category: "engineering", city: "بيروت", type: "paid", duration: "2 أشهر", deadline: "2026-06-05", salary: "350$ / شهر", description: "تدريب في قسم العمليات واللوجستيات لدى الناقل الوطني الرسمي للبنان", skills: ["إدارة العمليات", "Excel", "التخطيط", "التنسيق"], applyUrl: "https://mea.com.lb" },
  { id: 11, company: "BLOM Bank", logo: "🏛️", role: "IT & Digital Banking Intern", category: "tech", city: "بيروت", type: "paid", duration: "3 أشهر", deadline: "2026-06-30", salary: "400$ / شهر", description: "المساهمة في تطوير الخدمات المصرفية الرقمية لدى BLOM Bank", skills: ["Programming", "Database", "API", "Agile"], applyUrl: "https://blombank.com" },
  { id: 12, company: "WHO Lebanon", logo: "🏥", role: "Public Health Intern", category: "ngo", city: "بيروت", type: "stipend", duration: "6 أشهر", deadline: "2026-07-01", salary: "400$ / شهر", description: "دعم برامج الصحة العامة لمنظمة الصحة العالمية في لبنان", skills: ["Research", "Data Analysis", "Report Writing", "Public Health"], applyUrl: "https://who.int/lebanon", featured: true },
  { id: 13, company: "Anghami", logo: "🎵", role: "Product & UX Intern", category: "tech", city: "بيروت", type: "paid", duration: "3 أشهر", deadline: "2026-06-15", salary: "500$ / شهر", description: "ساعد فريق المنتج في تطوير تجربة المستخدم لمنصة الموسيقى الأولى عربياً", skills: ["Figma", "User Research", "Product Thinking", "Data Analysis"], applyUrl: "https://anghami.com/jobs" },
  { id: 14, company: "KPMG Lebanon", logo: "💼", role: "Tax & Advisory Intern", category: "finance", city: "بيروت", type: "paid", duration: "3 أشهر", deadline: "2026-05-25", salary: "400-450$ / شهر", description: "تدريب في قسم الضرائب والاستشارات لدى شركة KPMG لبنان", skills: ["محاسبة", "ضرائب", "Excel", "Research"], applyUrl: "https://kpmg.com/lb" },
  { id: 15, company: "IFC (World Bank Group)", logo: "🌐", role: "Financial Sector Intern", category: "finance", city: "بيروت", type: "paid", duration: "6 أشهر", deadline: "2026-08-01", salary: "600-700$ / شهر", description: "دعم فريق القطاع المالي في مؤسسة التمويل الدولية التابعة لمجموعة البنك الدولي", skills: ["Financial Modeling", "Excel", "Research", "Report Writing"], applyUrl: "https://ifc.org/careers", featured: true },
  { id: 16, company: "Publicis Groupe Lebanon", logo: "🎨", role: "Digital Marketing Intern", category: "marketing", city: "بيروت", type: "paid", duration: "2 أشهر", deadline: "2026-06-10", salary: "300-350$ / شهر", description: "تدريب في أحد أكبر مجموعات الإعلان والتسويق في العالم — مكتب لبنان", skills: ["Google Ads", "Meta Ads", "Analytics", "Content Creation"], applyUrl: "https://publicisgroupe.com" },
  { id: 17, company: "Broadgate", logo: "🖥️", role: "Cybersecurity Intern", category: "tech", city: "بيروت", type: "paid", duration: "3 أشهر", deadline: "2026-07-10", salary: "450$ / شهر", description: "تدريب في مجال الأمن السيبراني وحماية البيانات لدى شركة Broadgate", skills: ["Cybersecurity", "Linux", "Networking", "Python"], applyUrl: "https://broadgate.com.lb" },
  { id: 18, company: "NDU Career Center", logo: "🎓", role: "Research & Academic Intern", category: "education", city: "كسروان", type: "unpaid", duration: "3 أشهر", deadline: "2026-06-30", description: "المساهمة في الأبحاث الأكاديمية ودعم برامج التوجيه المهني في جامعة NDU", skills: ["Research", "Writing", "SPSS", "Data Collection"], applyUrl: "https://ndu.edu.lb" },
  { id: 19, company: "Zain Lebanon", logo: "📱", role: "Telecom & Network Intern", category: "tech", city: "بيروت", type: "paid", duration: "3 أشهر", deadline: "2026-06-20", salary: "350$ / شهر", description: "تدريب في قسم الاتصالات والشبكات لدى شركة Zain في لبنان", skills: ["Networking", "Telecom Protocols", "Linux", "Monitoring"], applyUrl: "https://jo.zain.com" },
  { id: 20, company: "Order of Engineers Beirut", logo: "🔧", role: "Civil Engineering Intern", category: "engineering", city: "بيروت", type: "unpaid", duration: "2 أشهر", deadline: "2026-07-01", description: "تدريب في مشاريع هندسية وإشراف ميداني تحت إشراف نقابة المهندسين في بيروت", skills: ["AutoCAD", "Civil Engineering", "Site Supervision", "Estimation"], applyUrl: "https://order-engineers.org.lb" },
];

const CATEGORIES = [
  { value: "all", label: "كل القطاعات", emoji: "🌐" },
  { value: "tech", label: "تقنية", emoji: "💻" },
  { value: "finance", label: "مالية", emoji: "💰" },
  { value: "marketing", label: "تسويق", emoji: "📢" },
  { value: "engineering", label: "هندسة", emoji: "⚙️" },
  { value: "ngo", label: "منظمات دولية", emoji: "🌍" },
  { value: "startup", label: "شركات ناشئة", emoji: "🚀" },
  { value: "education", label: "تعليم", emoji: "🎓" },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  paid: { label: "مدفوع", color: "bg-green-100 text-green-700" },
  stipend: { label: "بدل تدريب", color: "bg-blue-100 text-blue-700" },
  unpaid: { label: "تطوعي", color: "bg-gray-100 text-gray-600" },
};

function daysLeft(deadline: string) {
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (diff < 0) return "انتهى";
  if (diff === 0) return "اليوم آخر يوم!";
  if (diff <= 7) return `${diff} أيام فقط!`;
  return `${diff} يوم`;
}

function urgencyColor(deadline: string) {
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (diff < 0) return "text-gray-400";
  if (diff <= 7) return "text-red-500 font-bold";
  if (diff <= 14) return "text-orange-500 font-semibold";
  return "text-gray-500";
}

export default function InternshipHub() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const filtered = useMemo(() => {
    return INTERNSHIPS.filter((i) => {
      const matchSearch = !search || i.company.toLowerCase().includes(search.toLowerCase()) || i.role.toLowerCase().includes(search.toLowerCase()) || i.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const matchCat = category === "all" || i.category === category;
      const matchType = typeFilter === "all" || i.type === typeFilter;
      const matchCity = cityFilter === "all" || i.city === cityFilter;
      const matchFeatured = !featuredOnly || i.featured;
      return matchSearch && matchCat && matchType && matchCity && matchFeatured;
    });
  }, [search, category, typeFilter, cityFilter, featuredOnly]);

  const cities = [...new Set(INTERNSHIPS.map((i) => i.city))];

  return (
    <div className="min-h-screen bg-light" dir="rtl">
      <div className="bg-gradient-to-br from-[#1a3560] via-[#1e4080] to-[#2563EB] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Link href="/" className="text-white/60 hover:text-white text-sm mb-6 inline-block">← الصفحة الرئيسية</Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">💼</span>
            <h1 className="text-3xl font-extrabold">فرص التدريب</h1>
          </div>
          <p className="text-white/80 text-lg mb-6">أكثر من {INTERNSHIPS.length} فرصة تدريب في لبنان والمنطقة — محدّثة شهرياً</p>
          <div className="flex flex-wrap gap-4 mb-8">
            {[
              { label: "فرصة متاحة", value: INTERNSHIPS.length, emoji: "📋" },
              { label: "فرص مدفوعة", value: INTERNSHIPS.filter((i) => i.type === "paid").length, emoji: "💰" },
              { label: "قطاعات", value: CATEGORIES.length - 1, emoji: "🏢" },
              { label: "فرص مميزة", value: INTERNSHIPS.filter((i) => i.featured).length, emoji: "⭐" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
                <span>{s.emoji}</span>
                <span className="font-bold text-lg">{s.value}</span>
                <span className="text-white/70 text-sm">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="relative max-w-xl">
            <input type="text" placeholder="ابحث بالشركة، الدور، أو المهارة..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-10 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 text-right" />
            <span className="absolute right-3 top-3.5 text-white/50">🔍</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c.value} onClick={() => setCategory(c.value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${category === c.value ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
            <div className="h-6 w-px bg-gray-200 hidden sm:block" />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none">
              <option value="all">كل الأنواع</option>
              <option value="paid">مدفوع</option>
              <option value="stipend">بدل تدريب</option>
              <option value="unpaid">تطوعي</option>
            </select>
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none">
              <option value="all">كل المناطق</option>
              {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
            <button onClick={() => setFeaturedOnly(!featuredOnly)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${featuredOnly ? "bg-yellow-400 text-yellow-900" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              ⭐ مميزة فقط
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-500 text-sm">{filtered.length === 0 ? "لا توجد نتائج" : `${filtered.length} فرصة تدريب`}</p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-lg">لا توجد فرص تطابق بحثك</p>
            <button onClick={() => { setSearch(""); setCategory("all"); setTypeFilter("all"); setCityFilter("all"); setFeaturedOnly(false); }} className="mt-4 text-primary hover:underline text-sm">إلغاء كل الفلاتر</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((intern) => (
              <div key={intern.id} className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-all flex flex-col ${intern.featured ? "border-yellow-300 ring-1 ring-yellow-200" : "border-gray-100"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-gray-100">{intern.logo}</div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{intern.company}</p>
                      <p className="text-xs text-gray-400">{intern.city} • {intern.duration}</p>
                    </div>
                  </div>
                  {intern.featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⭐ مميز</span>}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{intern.role}</h3>
                <p className="text-gray-500 text-xs mb-3 leading-relaxed flex-1">{intern.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {intern.skills.slice(0, 3).map((s) => (<span key={s} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s}</span>))}
                  {intern.skills.length > 3 && <span className="text-xs text-gray-400">+{intern.skills.length - 3}</span>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_LABELS[intern.type].color}`}>{TYPE_LABELS[intern.type].label}</span>
                    {intern.salary && <span className="text-xs text-green-600 font-medium">{intern.salary}</span>}
                  </div>
                  <p className={`text-xs ${urgencyColor(intern.deadline)}`}>🕒 {daysLeft(intern.deadline)}</p>
                </div>
                <a href={intern.applyUrl} target="_blank" rel="noopener noreferrer" className="mt-3 w-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2 rounded-xl text-center transition-colors">
                  تقدّم الآن ←
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-primary to-accent rounded-2xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">شركتك تقدّم تدريباً؟</h3>
          <p className="text-white/80 mb-4">أضف فرصتك مجاناً وصل إلى آلاف الطلاب اللبنانيين</p>
          <a href="mailto:msharafeddine8@gmail.com?subject=إضافة فرصة تدريب - مسارك" className="inline-block bg-white text-primary font-bold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            أضف فرصة تدريب ←
          </a>
        </div>
      </div>
    </div>
  );
}
