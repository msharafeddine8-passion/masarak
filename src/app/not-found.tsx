import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-[#1e4080] to-[#0f2448] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
            <span className="text-white font-extrabold text-xl">م</span>
          </div>
          <span className="text-white font-extrabold text-2xl">مسارك</span>
        </Link>

        {/* 404 */}
        <div className="text-[120px] font-extrabold text-accent/30 leading-none mb-2 select-none">
          404
        </div>

        <div className="text-5xl mb-4">🗺️</div>
        <h1 className="text-3xl font-extrabold text-white mb-3">
          الصفحة غير موجودة
        </h1>
        <p className="text-white/70 text-lg mb-10 leading-relaxed">
          يبدو أن هذا المسار غير صحيح!<br />
          دعنا نوجّهك نحو الوجهة الصحيحة.
        </p>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { href: "/", emoji: "🏠", label: "الرئيسية" },
            { href: "/tools", emoji: "🛠️", label: "الأدوات المهنية" },
            { href: "/universities", emoji: "🏛️", label: "الجامعات" },
            { href: "/scholarships", emoji: "🏆", label: "المنح الدراسية" },
            { href: "/internships/hub", emoji: "💼", label: "فرص التدريب" },
            { href: "/career-dna", emoji: "🧬", label: "Career DNA" },
          ].map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-all flex items-center gap-2 justify-center"
            >
              <span>{l.emoji}</span> {l.label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="bg-accent text-white font-extrabold px-8 py-3 rounded-2xl hover:bg-[#c8920a] transition-all inline-block"
        >
          ← عد للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
