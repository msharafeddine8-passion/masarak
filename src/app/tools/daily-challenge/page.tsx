"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Question {
  id: number;
  cat: string;
  emoji: string;
  q: string;
  opts: string[];
  ans: number;
  explain: string;
}

const ALL_QUESTIONS: Question[] = [
  // تاريخ لبنان والمنطقة
  { id:1,  cat:"تاريخ", emoji:"🏛️", q:"في أي عام أُعلن استقلال لبنان رسمياً؟", opts:["1920","1943","1946","1975"], ans:1, explain:"أُعلن استقلال لبنان في 22 نوفمبر 1943، وهو اليوم الذي يُحتفل به سنوياً كعيد وطني." },
  { id:2,  cat:"تاريخ", emoji:"🏛️", q:"من هو أول رئيس للجمهورية اللبنانية بعد الاستقلال؟", opts:["بشارة الخوري","كميل شمعون","فؤاد شهاب","الياس سركيس"], ans:0, explain:"بشارة الخوري كان أول رئيس للجمهورية اللبنانية بعد الاستقلال (1943-1952)." },
  { id:3,  cat:"تاريخ", emoji:"🏛️", q:"ما اسم المعاهدة التي أنهت الحرب الأهلية اللبنانية عام 1989؟", opts:["اتفاقية جنيف","اتفاق الطائف","اتفاقية الهدنة","إعلان بعبدا"], ans:1, explain:"اتفاق الطائف وُقّع عام 1989 في المملكة العربية السعودية وأنهى الحرب الأهلية اللبنانية." },
  { id:4,  cat:"تاريخ", emoji:"🏛️", q:"أي حضارة قديمة اخترعت الأبجدية وكانت تسكن أراضي لبنان؟", opts:["الإغريق","الرومان","الفينيقيون","الأكاديون"], ans:2, explain:"الفينيقيون هم من اخترعوا الأبجدية حوالي 1050 ق.م، وكانت مدنهم تقع على ساحل لبنان الحالي." },
  { id:5,  cat:"تاريخ", emoji:"🏛️", q:"ما اسم حضارة بلاد ما بين النهرين التي أسست أول قوانين مكتوبة؟", opts:["الفرعونية","البابلية","الآشورية","السومرية"], ans:1, explain:"الحضارة البابلية في عهد حمورابي وضعت أول مجموعة من القوانين المدوّنة المعروفة بشريعة حمورابي." },
  { id:6,  cat:"تاريخ", emoji:"🏛️", q:"متى اندلعت الثورة الفرنسية؟", opts:["1776","1789","1799","1815"], ans:1, explain:"اندلعت الثورة الفرنسية في 14 يوليو 1789 مع اقتحام سجن الباستيل." },

  // جغرافيا لبنان والعالم
  { id:7,  cat:"جغرافيا", emoji:"🌍", q:"ما هي أطول سلسلة جبال في لبنان؟", opts:["جبال الأنصارية","سلسلة لبنان الغربية","سلسلة لبنان الشرقية","جبل عامل"], ans:1, explain:"سلسلة لبنان الغربية هي الأطول والأعلى وتضم قمة قرنة السودا (3088 م) أعلى قمة في لبنان." },
  { id:8,  cat:"جغرافيا", emoji:"🌍", q:"ما اسم النهر الأطول في لبنان؟", opts:["نهر الليطاني","نهر الأولي","نهر الكلب","نهر الدامور"], ans:0, explain:"نهر الليطاني هو أطول أنهار لبنان (170 كم) وأكثرها مياهاً، وينبع من البقاع." },
  { id:9,  cat:"جغرافيا", emoji:"🌍", q:"أي بحر يُطل عليه لبنان؟", opts:["البحر الأحمر","البحر المتوسط","بحر العرب","البحر الأسود"], ans:1, explain:"لبنان يُطل على البحر الأبيض المتوسط بساحل يمتد نحو 225 كيلومتراً." },
  { id:10, cat:"جغرافيا", emoji:"🌍", q:"ما هي عاصمة لبنان؟", opts:["طرابلس","صيدا","بيروت","زحلة"], ans:2, explain:"بيروت هي عاصمة لبنان ومدينته الأكبر، وتُعرف بـ'باريس الشرق'." },
  { id:11, cat:"جغرافيا", emoji:"🌍", q:"ما هي أكبر قارات العالم من حيث المساحة؟", opts:["أفريقيا","أمريكا الشمالية","آسيا","أوروبا"], ans:2, explain:"آسيا هي أكبر قارات العالم مساحةً (44.6 مليون كم²) وأكثرها سكاناً." },
  { id:12, cat:"جغرافيا", emoji:"🌍", q:"أي دول تُشكّل الدول المجاورة للبنان؟", opts:["سوريا وإسرائيل","سوريا والأردن","إسرائيل والأردن","سوريا والعراق"], ans:0, explain:"لبنان يحدّه سوريا من الشمال والشرق، وإسرائيل من الجنوب، والبحر المتوسط من الغرب." },

  // علوم طبيعية
  { id:13, cat:"علوم", emoji:"🔬", q:"ما هو الرمز الكيميائي للذهب؟", opts:["Go","Au","Ag","Gd"], ans:1, explain:"الرمز الكيميائي للذهب هو Au من الكلمة اللاتينية Aurum." },
  { id:14, cat:"علوم", emoji:"🔬", q:"كم عدد الكروموسومات في الخلية البشرية السليمة؟", opts:["23","44","46","48"], ans:2, explain:"الخلية البشرية السليمة تحتوي على 46 كروموسوماً (23 زوجاً)." },
  { id:15, cat:"علوم", emoji:"🔬", q:"ما هي أسرع قوة في الطبيعة؟", opts:["الضوء","الصوت","الكهرباء","الجاذبية"], ans:0, explain:"الضوء يسافر بسرعة 299,792 كيلومتراً في الثانية، وهي أعلى سرعة ممكنة في الكون." },
  { id:16, cat:"علوم", emoji:"🔬", q:"ما هو عنصر الحياة الأساسي الذي تنتجه النباتات أثناء التمثيل الضوئي؟", opts:["النيتروجين","الأوكسجين","ثاني أكسيد الكربون","الهيدروجين"], ans:1, explain:"تنتج النباتات الأوكسجين كمنتج ثانوي عملية التمثيل الضوئي." },
  { id:17, cat:"علوم", emoji:"🔬", q:"ما هي الوحدة الأساسية للحياة؟", opts:["الجين","الخلية","البروتين","الجزيء"], ans:1, explain:"الخلية هي الوحدة الأساسية للحياة، وكل كائن حي يتكون من خلية واحدة أو أكثر." },
  { id:18, cat:"علوم", emoji:"🔬", q:"في أي طبقة من الغلاف الجوي تتشكّل السحب؟", opts:["الستراتوسفير","الميزوسفير","التروبوسفير","الثيرموسفير"], ans:2, explain:"تتشكّل السحب في التروبوسفير، وهي أدنى طبقات الغلاف الجوي." },

  // رياضيات
  { id:19, cat:"رياضيات", emoji:"📐", q:"كم يساوي حاصل ضرب جذر 144 في جذر 25؟", opts:["30","60","36","50"], ans:1, explain:"جذر 144 = 12، جذر 25 = 5، وحاصل الضرب = 12 × 5 = 60." },
  { id:20, cat:"رياضيات", emoji:"📐", q:"ما هي قيمة π (باي) بدقة حرفين عشريين؟", opts:["3.12","3.14","3.16","3.18"], ans:1, explain:"π ≈ 3.14159... وتقريبها إلى حرفين عشريين هو 3.14." },
  { id:21, cat:"رياضيات", emoji:"📐", q:"إذا كان طول ضلع مربع 6 سم، فما هي مساحته؟", opts:["24 سم²","30 سم²","36 سم²","12 سم²"], ans:2, explain:"مساحة المربع = الضلع × الضلع = 6 × 6 = 36 سم²." },
  { id:22, cat:"رياضيات", emoji:"📐", q:"ما هو الجذر التربيعي لـ 169؟", opts:["11","12","13","14"], ans:2, explain:"13 × 13 = 169، إذن الجذر التربيعي لـ 169 هو 13." },
  { id:23, cat:"رياضيات", emoji:"📐", q:"كم درجة تساوي مجموع زوايا المثلث؟", opts:["90°","180°","270°","360°"], ans:1, explain:"مجموع زوايا أي مثلث يساوي 180 درجة دائماً." },

  // لغة عربية وأدب
  { id:24, cat:"لغة عربية", emoji:"📖", q:"ما هو الجمع الصحيح لكلمة 'كتاب'؟", opts:["كتابات","كتب","أكتبة","كتّاب"], ans:1, explain:"جمع كتاب هو كُتُب على وزن فُعُل." },
  { id:25, cat:"لغة عربية", emoji:"📖", q:"من هو شاعر المهجر المعروف بديوان 'النبي'؟", opts:["إيليا أبو ماضي","جبران خليل جبران","ميخائيل نعيمة","فيليكس فارس"], ans:1, explain:"جبران خليل جبران (1883-1931) هو الأديب اللبناني الأشهر عالمياً، وصاحب كتاب 'النبي'." },
  { id:26, cat:"لغة عربية", emoji:"📖", q:"ما إعراب كلمة 'الطالبَ' في جملة 'رأيتُ الطالبَ'؟", opts:["فاعل مرفوع","مفعول به منصوب","مبتدأ مرفوع","خبر مرفوع"], ans:1, explain:"كلمة الطالب في هذه الجملة مفعول به منصوب وعلامة نصبه الفتحة." },
  { id:27, cat:"لغة عربية", emoji:"📖", q:"ما اسم الأسلوب البلاغي في قولنا 'العلم نور'؟", opts:["الاستعارة","الكناية","التشبيه البليغ","المجاز"], ans:2, explain:"'العلم نور' تشبيه بليغ، حُذفت منه أداة التشبيه ووجه الشبه." },

  // اقتصاد وعلوم اجتماعية
  { id:28, cat:"اقتصاد", emoji:"💰", q:"ما هو الناتج المحلي الإجمالي (GDP)؟", opts:["قيمة الصادرات فقط","إجمالي قيمة السلع والخدمات المنتجة في بلد خلال سنة","إجمالي الديون الحكومية","قيمة احتياطي العملة الأجنبية"], ans:1, explain:"GDP هو مجموع قيمة كل السلع والخدمات المنتجة داخل دولة خلال فترة زمنية معينة." },
  { id:29, cat:"اقتصاد", emoji:"💰", q:"ما هو التضخم الاقتصادي؟", opts:["ارتفاع الإنتاج","انخفاض الأسعار","الارتفاع المستمر في مستوى الأسعار","زيادة قيمة العملة"], ans:2, explain:"التضخم هو الارتفاع المستمر والعام في مستوى أسعار السلع والخدمات." },
  { id:30, cat:"اقتصاد", emoji:"💰", q:"أي قطاع يُعدّ الأكبر في اقتصاد لبنان تاريخياً؟", opts:["الصناعة","الزراعة","الخدمات والمصارف","التعدين"], ans:2, explain:"قطاع الخدمات والمصارف كان دائماً الأكبر في الاقتصاد اللبناني، مما جعل بيروت مركزاً مالياً للمنطقة." },

  // فيزياء وكيمياء
  { id:31, cat:"فيزياء", emoji:"⚡", q:"ما هو قانون أوم في الكهرباء؟", opts:["V = I + R","V = I × R","I = V × R","R = V × I"], ans:1, explain:"قانون أوم ينص على أن الجهد (V) = شدة التيار (I) × المقاومة (R)." },
  { id:32, cat:"فيزياء", emoji:"⚡", q:"كم يساوي قوة الجاذبية الأرضية تقريباً؟", opts:["8 م/ث²","9.8 م/ث²","10.8 م/ث²","11 م/ث²"], ans:1, explain:"قوة الجاذبية الأرضية تساوي تقريباً 9.8 م/ث² (أو 10 م/ث² تقريباً في المسائل الحسابية)." },
  { id:33, cat:"كيمياء", emoji:"🧪", q:"ما هو العنصر الأخف في الجدول الدوري؟", opts:["الهيليوم","الهيدروجين","الليثيوم","البيريليوم"], ans:1, explain:"الهيدروجين هو العنصر الأول في الجدول الدوري والأخف وزناً ذرياً (1)." },
  { id:34, cat:"كيمياء", emoji:"🧪", q:"ما هو تركيب جزيء الماء الكيميائي؟", opts:["HO","H2O","H2O2","HO2"], ans:1, explain:"جزيء الماء يتكون من ذرتين هيدروجين وذرة أوكسجين واحدة (H2O)." },

  // تقنية ومعلوماتية
  { id:35, cat:"تقنية", emoji:"💻", q:"ما معنى اختصار CPU؟", opts:["Central Processing Unit","Computer Programming Unit","Central Power Unit","Computer Processing Unit"], ans:0, explain:"CPU تعني Central Processing Unit أي وحدة المعالجة المركزية، وهي 'دماغ' الحاسوب." },
  { id:36, cat:"تقنية", emoji:"💻", q:"من هو مؤسس شركة Apple؟", opts:["بيل غيتس","مارك زوكربرغ","ستيف جوبز","إيلون ماسك"], ans:2, explain:"ستيف جوبز أسس شركة Apple عام 1976 مع ستيف وزنياك وآخرين." },
  { id:37, cat:"تقنية", emoji:"💻", q:"ما هو نظام الترميز المستخدم في الحواسيب؟", opts:["النظام العشري","النظام الثنائي","النظام السداسي عشر","النظام الثماني"], ans:1, explain:"الحواسيب تعمل بالنظام الثنائي (Binary) الذي يستخدم 0 و1 فقط." },

  // ثقافة عامة ولبنانية
  { id:38, cat:"ثقافة", emoji:"🎭", q:"ما هي أقدم مدينة في العالم لا تزال مأهولة، وتقع في لبنان؟", opts:["طرابلس","صيدا","بيبلوس (جبيل)","صور"], ans:2, explain:"بيبلوس (جبيل) تُعدّ من أقدم المدن المأهولة باستمرار في العالم منذ أكثر من 7000 سنة." },
  { id:39, cat:"ثقافة", emoji:"🎭", q:"كم عدد أيام الأسبوع في التقويم الهجري؟", opts:["5","6","7","8"], ans:2, explain:"التقويم الهجري يحتوي على 7 أيام في الأسبوع، كالتقويم الميلادي." },
  { id:40, cat:"ثقافة", emoji:"🎭", q:"من هو المخترع الأمريكي الذي يُنسب إليه اختراع المصباح الكهربائي؟", opts:["نيكولا تيسلا","توماس إديسون","ألكسندر غراهام بيل","ماري كوري"], ans:1, explain:"توماس إديسون طوّر وسوّق المصباح الكهربائي العملي عام 1879." },
];

const CATS = ["الكل", ...Array.from(new Set(ALL_QUESTIONS.map(q => q.cat)))];

function getTodayIndex() {
  const d = new Date();
  return (d.getFullYear() * 365 + d.getMonth() * 30 + d.getDate()) % ALL_QUESTIONS.length;
}

function getDailySet(): Question[] {
  const start = getTodayIndex();
  const result: Question[] = [];
  for (let i = 0; i < 5; i++) {
    result.push(ALL_QUESTIONS[(start + i) % ALL_QUESTIONS.length]);
  }
  return result;
}

export default function DailyChallengePage() {
  const [mode, setMode]         = useState<"daily" | "practice">("daily");
  const [cat, setCat]           = useState("الكل");
  const [current, setCurrent]   = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState<Record<number, number>>({});
  const [xp, setXp]             = useState(0);
  const [streak, setStreak]     = useState(0);
  const [finished, setFinished] = useState(false);

  const dailyQuestions = getDailySet();
  const practiceQuestions = cat === "الكل"
    ? ALL_QUESTIONS
    : ALL_QUESTIONS.filter(q => q.cat === cat);

  const questions = mode === "daily" ? dailyQuestions : practiceQuestions;
  const q = questions[current];

  useEffect(() => {
    const saved = localStorage.getItem("masarak_streak");
    if (saved) setStreak(Number(saved));
  }, []);

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    setAnswered(prev => ({ ...prev, [current]: idx }));
    if (idx === q.ans) {
      setXp(prev => prev + 10);
    }
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      if (mode === "daily") {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem("masarak_streak", String(newStreak));
      }
      setFinished(true);
    }
  }

  function restart() {
    setCurrent(0);
    setSelected(null);
    setAnswered({});
    setXp(0);
    setFinished(false);
  }

  const correct = Object.entries(answered).filter(([i, a]) => questions[Number(i)]?.ans === a).length;
  const total   = Object.keys(answered).length;

  if (finished) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="min-h-screen bg-bg" dir="rtl">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-extrabold">م</span>
              </div>
              <span className="text-primary font-extrabold text-lg">مسارك</span>
            </Link>
            <Link href="/tools" className="text-text-sub text-sm hover:text-primary">← الأدوات</Link>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-12 text-center">
          <div className="card">
            <div className="text-7xl mb-4">{pct >= 80 ? "🏆" : pct >= 60 ? "⭐" : "📚"}</div>
            <h2 className="text-2xl font-extrabold text-primary mb-2">
              {pct >= 80 ? "ممتاز! نتيجة رائعة" : pct >= 60 ? "جيد! استمر في التطور" : "حاول مرة أخرى!"}
            </h2>
            <p className="text-text-sub mb-6">أجبت صح على {correct} من {questions.length} أسئلة</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-primary/10 rounded-xl p-3">
                <div className="text-2xl font-extrabold text-primary">{pct}%</div>
                <div className="text-xs text-text-sub">النسبة</div>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <div className="text-2xl font-extrabold text-green-600">+{correct * 10} XP</div>
                <div className="text-xs text-text-sub">نقاط مكتسبة</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-3">
                <div className="text-2xl font-extrabold text-orange-500">{streak}🔥</div>
                <div className="text-xs text-text-sub">سلسلة الأيام</div>
              </div>
            </div>

            <div className="text-right space-y-3 mb-6">
              {questions.map((question, i) => {
                const userAns = answered[i];
                const isRight = userAns === question.ans;
                return (
                  <div key={question.id} className={`p-3 rounded-xl border text-sm ${isRight ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <p className="font-semibold mb-1">{question.emoji} {question.q}</p>
                    <p className={`text-xs ${isRight ? "text-green-700" : "text-red-700"}`}>
                      {isRight ? "✓ صحيح" : `✗ أجبت: ${question.opts[userAns]} — الصحيح: ${question.opts[question.ans]}`}
                    </p>
                    <p className="text-xs text-text-sub mt-1">💡 {question.explain}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={restart} className="flex-1 btn-primary py-3 rounded-xl font-semibold">
                إعادة المحاولة 🔄
              </button>
              <Link href="/tools" className="flex-1 btn-outline py-3 rounded-xl font-semibold text-center block">
                الأدوات الأخرى ←
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-primary font-extrabold text-lg">مسارك</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-orange-500 font-bold">🔥 {streak}</span>
            <span className="text-primary font-bold">⚡ {xp} XP</span>
          </div>
          <Link href="/tools" className="text-text-sub text-sm hover:text-primary">← الأدوات</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6">
          <button onClick={() => { setMode("daily"); restart(); }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${mode === "daily" ? "bg-primary text-white border-primary" : "bg-white border-gray-200 text-text-sub"}`}>
            📅 التحدي اليومي (5 أسئلة)
          </button>
          <button onClick={() => { setMode("practice"); restart(); }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${mode === "practice" ? "bg-primary text-white border-primary" : "bg-white border-gray-200 text-text-sub"}`}>
            🎯 وضع التدريب الحر
          </button>
        </div>

        {mode === "practice" && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {CATS.map(c => (
              <button key={c} onClick={() => { setCat(c); restart(); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 whitespace-nowrap transition-all ${
                  cat === c ? "bg-primary text-white border-primary" : "bg-white border-gray-200 text-text-sub"
                }`}>{c}</button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-3 text-sm text-text-sub">
          <span>سؤال {current + 1} / {questions.length}</span>
          <span className={`badge ${
            q.cat === "تاريخ" ? "bg-amber-50 text-amber-700" :
            q.cat === "جغرافيا" ? "bg-blue-50 text-blue-700" :
            q.cat === "علوم" ? "bg-green-50 text-green-700" :
            q.cat === "رياضيات" ? "bg-indigo-50 text-indigo-700" :
            q.cat === "لغة عربية" ? "bg-rose-50 text-rose-700" :
            q.cat === "فيزياء" || q.cat === "كيمياء" ? "bg-teal-50 text-teal-700" :
            q.cat === "تقنية" ? "bg-purple-50 text-purple-700" :
            "bg-gray-100 text-gray-600"
          }`}>{q.cat}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="card mb-4">
          <div className="text-5xl text-center mb-5">{q.emoji}</div>
          <h2 className="text-lg font-extrabold text-primary text-center mb-6 leading-relaxed">{q.q}</h2>

          <div className="space-y-3">
            {q.opts.map((opt, i) => {
              let cls = "w-full p-4 rounded-xl border-2 text-right font-semibold text-sm transition-all ";
              if (selected === null) {
                cls += "bg-white border-gray-200 hover:border-primary hover:bg-primary/5 cursor-pointer";
              } else if (i === q.ans) {
                cls += "bg-green-50 border-green-500 text-green-800";
              } else if (i === selected && selected !== q.ans) {
                cls += "bg-red-50 border-red-400 text-red-800";
              } else {
                cls += "bg-white border-gray-100 text-text-sub opacity-60";
              }
              return (
                <button key={i} className={cls} onClick={() => handleAnswer(i)}>
                  <span className="text-text-sub ml-2">{["أ","ب","ج","د"][i]}.</span> {opt}
                  {selected !== null && i === q.ans && " ✓"}
                  {selected === i && selected !== q.ans && " ✗"}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className={`mt-5 p-4 rounded-xl border ${selected === q.ans ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}`}>
              <p className="font-bold text-sm mb-1">
                {selected === q.ans ? "✅ إجابة صحيحة! +10 XP" : `❌ الإجابة الصحيحة: ${q.opts[q.ans]}`}
              </p>
              <p className="text-sm text-text-sub">💡 {q.explain}</p>
            </div>
          )}
        </div>

        {selected !== null && (
          <button onClick={handleNext} className="btn-primary w-full py-4 rounded-xl font-bold text-base">
            {current < questions.length - 1 ? "السؤال التالي ←" : "إنهاء التحدي 🏁"}
          </button>
        )}
      </main>
    </div>
  );
   }
