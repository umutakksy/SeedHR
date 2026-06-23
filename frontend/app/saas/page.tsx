"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  GitFork,
  Rocket,
  Laptop,
  CalendarRange,
  Clock,
  Award,
  Briefcase,
  Banknote,
  Timer,
  UserCheck,
  Megaphone,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Search,
  ArrowUpRight,
  CheckCircle,
  Send,
  User as UserIcon,
  Bot as BotIcon,
} from "lucide-react";

// Mock Data for AI Chat responses
const DEFAULT_CHAT_QA = [
  { q: "Ahmet Yılmaz'ın kalan izin gün sayısını sorgula", a: "Ahmet Yılmaz (Kıdemli Yazılım Geliştirici) için kalan yıllık izin bakiyesi **10 gündür**. Bu yıl 4 gün kullanmış, 14 gün hakkı bulunmaktadır." },
  { q: "Zeynep Demir'in departmanını ve pozisyonunu söyler misin?", a: "Zeynep Demir, **İnsan Kaynakları** departmanında **İK Uzmanı** olarak görev yapmaktadır." },
  { q: "Şirket içi en son duyuru nedir?", a: "En son duyuru: **'Yeni SeedHR Portalına Hoş Geldiniz!'** (2 gün önce yayınlandı). İzin taleplerinin ve günlük giriş çıkışların bu sistemden yapılacağı bildirilmiştir." }
];

const CANDIDATES = [
  { name: "Elif Yurt", role: "Senior UX Designer", score: 94, source: "LinkedIn", tags: ["Figma", "Design System"], init: "EY", bg: "bg-purple-500/10 text-purple-400", col: "applied" },
  { name: "Barış Tunç", role: "Product PM", score: 85, source: "Kariyer.net", tags: ["Agile", "SaaS Roadmap"], init: "BT", bg: "bg-blue-500/10 text-blue-400", col: "applied" },
  { name: "Murat Şen", role: "React Geliştirici", score: 91, source: "GitHub", tags: ["Next.js", "TypeScript"], init: "MŞ", bg: "bg-emerald-500/10 text-emerald-400", col: "interview" },
  { name: "Banu Mert", role: "QA Automation Eng.", score: 88, source: "LinkedIn", tags: ["Selenium", "Playwright"], init: "BM", bg: "bg-amber-500/10 text-amber-400", col: "interview" },
  { name: "Sibel Kaya", role: "UX Lead", score: 96, source: "Referans", tags: ["User Research", "Strategy"], init: "SK", bg: "bg-pink-500/10 text-pink-400", col: "offer" }
];
export default function SaasPromoPage() {

  // Video-like states
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [typedSubtitle, setTypedSubtitle] = useState("");

  // Interaction states for specific mockups
  const [approvedLeave, setApprovedLeave] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const steps = [
    { id: "dashboard", label: "Dashboard", title: "SeedHR Dashboard", subtitle: "Şirketinizin genel durumunu, aktif izinleri ve işe girişleri anlık takip edin.", icon: LayoutDashboard },
    { id: "employees", label: "Çalışanlar", title: "Kişisel Özlük Dosyaları", subtitle: "Tüm çalışanların sözleşmelerine, iletişim bilgilerine ve belgelerine tek tıkla ulaşın.", icon: Users },
    { id: "orgchart", label: "Org Şeması", title: "Hiyerarşik Organizasyon Şeması", subtitle: "Şirket organizasyon ağacını ve departman ilişkilerini görsel olarak inceleyin.", icon: GitFork },
    { id: "onboarding", label: "Onboarding", title: "Oryantasyon & Uyum", subtitle: "Yeni işe başlayan çalışanların hazırlık ve evrak süreçlerini otomatik checklistlerle takip edin.", icon: Rocket },
    { id: "assets", label: "Zimmet Yönetimi", title: "Zimmet & Varlık Takibi", subtitle: "Çalışanlara atanan bilgisayar, telefon ve şirket varlıklarını kolayca zimmetleyin.", icon: Laptop },
    { id: "leaves", label: "İzin Yönetimi", title: "İzin ve Onay Yönetimi", subtitle: "Yıllık izin, mazeret ve rapor taleplerini online yönetin; kalan bakiyeleri otomatik hesaplayın.", icon: CalendarRange },
    { id: "attendance", label: "Giriş-Çıkış (PDKS)", title: "Mesai Giriş-Çıkış Takibi", subtitle: "Çalışanların günlük giriş-çıkış zamanlarını, geç kalma durumlarını ve çalışma lokasyonlarını görün.", icon: Clock },
    { id: "performance", label: "Performans", title: "Performans Değerlendirme", subtitle: "Çalışan hedeflerini, yetkinlik formlarını ve 360 derece geri bildirim süreçlerini tasarlayın.", icon: Award },
    { id: "recruitment", label: "İşe Alım (ATS)", title: "Aday Takip Sistemi", subtitle: "Açık pozisyonları ilan edin, aday havuzunu ve mülakat aşamalarını kanban panosundan izleyin.", icon: Briefcase },
    { id: "finance", label: "Finans & Bordro", title: "Bordro ve Maaş Yönetimi", subtitle: "Maaş, prim, ödenek ve sosyal yardımları ekleyin; aylık bordro taslaklarını hazırlayın.", icon: Banknote },
    { id: "shifts", label: "Vardiyalar", title: "Vardiya Planlama & Puantaj", subtitle: "Esnek haftalık vardiya çizelgeleri hazırlayın ve puantaj cetvellerini otomatik hesaplatın.", icon: Timer },
    { id: "visitors", label: "Ziyaretçi Takibi", title: "Ziyaretçi Giriş Yönetimi", subtitle: "Ofis binalarınıza gelen ziyaretçileri, giriş amaçlarını ve verdikleri kartları listeleyin.", icon: UserCheck },
    { id: "announcements", label: "Duyurular", title: "Duyuru & İletişim Portalı", subtitle: "Şirket içi önemli duyuruları, haberleri ve günlük yemek menüsünü anında yayınlayın.", icon: Megaphone },
    { id: "ai_chat", label: "SeedAI Asistan", title: "Yapay Zeka Destekli İK", subtitle: "Şirket içi politikalara ve izin durumlarına ait soruları yapay zekaya sorup saniyeler içinde yanıt alın.", icon: Sparkles }
  ];

  // Auto-play timer logic
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 50; // Update progress bar every 50ms
    const duration = 2150; // ~2.15 seconds per step (14 steps * 2.15s ≈ 30 seconds total)
    const progressStep = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + progressStep;
        if (nextProgress >= 100) {
          return 100;
        }
        return nextProgress;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Handle step transition when progress reaches 100
  useEffect(() => {
    if (progress >= 100) {
      setActiveStep((prevStep) => (prevStep + 1) % steps.length);
      setProgress(0);
    }
  }, [progress, steps.length]);

  // Handle Typewriter Subtitle
  useEffect(() => {
    let isCancelled = false;
    let index = 0;
    const fullText = steps[activeStep].subtitle;

    setTypedSubtitle("");

    const interval = setInterval(() => {
      if (isCancelled) return;
      if (index < fullText.length) {
        setTypedSubtitle(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [activeStep]);

  // Handle auto-simulating actions on steps
  useEffect(() => {
    // Reset specific states on tab changes
    if (steps[activeStep].id !== "leaves") setApprovedLeave(false);

    let recruitmentTimeout: NodeJS.Timeout;

    if (steps[activeStep].id !== "recruitment") {
      setSelectedCandidate(null);
    } else {
      setSelectedCandidate(null);
      // Automatically open "Sibel Kaya" detailed profile at 1 second
      recruitmentTimeout = setTimeout(() => {
        setSelectedCandidate("Sibel Kaya");
      }, 1000);
    }

    if (steps[activeStep].id === "ai_chat") {
      setChatMessages([]);
      setIsTyping(false);

      const askTimeout = setTimeout(() => {
        const query = "Ahmet Yılmaz'ın kalan izin gün sayısını sorgula";
        setChatMessages([{ role: "user", text: query }]);
        setIsTyping(true);

        const replyTimeout = setTimeout(() => {
          setIsTyping(false);
          setChatMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              text: "Ahmet Yılmaz (Kıdemli Yazılım Geliştirici) için kalan yıllık izin bakiyesi 10 gündür. Bu yıl 4 gün kullanmış, 14 gün hakkı bulunmaktadır.",
            },
          ]);
        }, 700);

        return () => clearTimeout(replyTimeout);
      }, 300);

      return () => {
        clearTimeout(askTimeout);
        clearTimeout(recruitmentTimeout);
      };
    }

    return () => {
      clearTimeout(recruitmentTimeout);
    };
  }, [activeStep]);

  const handleStepSelect = (index: number) => {
    setActiveStep(index);
    setProgress(0);
  };

  const handleRestart = () => {
    setActiveStep(0);
    setProgress(0);
    setIsPlaying(true);
    setApprovedLeave(false);
    setChatMessages([]);
  };

  const handleCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const query = aiInput;
    setChatMessages((prev) => [...prev, { role: "user", text: query }]);
    setAiInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const matched = DEFAULT_CHAT_QA.find(qa => qa.q.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(qa.q.toLowerCase()));
      const reply = matched
        ? matched.a
        : `Anladım. "${query}" konusuyla ilgili şirket verilerinde arama yaptım. Ahmet Yılmaz'ın BT departmanında, Ayşe Kaya'nın ise İK departmanında çalıştığı görülüyor. Başka bir detay sorgulamak ister misiniz?`;

      setChatMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans antialiased selection:bg-emerald-500/30 flex items-center justify-center p-3 sm:p-5">
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        ::-webkit-scrollbar {
          display: none !important;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        * {
          -ms-overflow-style: none !important;  /* IE and Edge */
          scrollbar-width: none !important;  /* Firefox */
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 8px rgba(99, 102, 241, 0.2), inset 0 0 4px rgba(99, 102, 241, 0.1);
            border-color: rgba(99, 102, 241, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.5), inset 0 0 10px rgba(99, 102, 241, 0.2);
            border-color: rgba(129, 140, 248, 0.6);
          }
        }
        @keyframes floatingPill {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.02); }
        }
        @keyframes textGradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .ai-glow-card {
          animation: pulseGlow 3s infinite ease-in-out;
        }
        .ai-float {
          animation: floatingPill 4s infinite ease-in-out;
        }
        .ai-gradient-text {
          background: linear-gradient(90deg, #a78bfa, #818cf8, #34d399, #a78bfa);
          background-size: 300% 300%;
          animation: textGradientShift 8s infinite linear;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Background glowing gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* PROMO COMPONENT */}
      <div className="w-full max-w-[1500px] bg-slate-900/60 border border-white/10 rounded-3xl p-4 sm:p-5 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden">

        {/* Top segment progress bar */}
        <div className="flex gap-1.5 mb-5">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden cursor-pointer"
              onClick={() => handleStepSelect(idx)}
              title={step.label}
            >
              <div
                className="h-full bg-emerald-500 transition-all ease-linear"
                style={{
                  width: idx === activeStep
                    ? `${progress}%`
                    : idx < activeStep
                      ? "100%"
                      : "0%"
                }}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* LEFT COLUMN: Controls & Steps selector */}
          <div className="lg:col-span-3 space-y-3">

            {/* Media Controls Card */}
            <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  title={isPlaying ? "Duraklat" : "Oynat"}
                >
                  {isPlaying ? <Pause size={12} /> : <Play size={12} className="fill-white" />}
                </button>
                <button
                  onClick={handleRestart}
                  className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  title="Yeniden Başlat"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            </div>

            {/* Scrollable Steps Selector */}
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx === activeStep;
                const isAiTab = step.id === "ai_chat";
                return (
                  <button
                    key={idx}
                    onClick={() => handleStepSelect(idx)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all duration-200 ${isActive
                      ? isAiTab
                        ? "bg-indigo-600/15 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10 ai-glow-card"
                        : "bg-emerald-600/10 border-emerald-500/30 text-white shadow-lg shadow-emerald-500/5"
                      : isAiTab
                        ? "bg-indigo-950/20 border-indigo-500/20 text-indigo-305 text-indigo-300 hover:border-indigo-400/45 hover:bg-indigo-950/40"
                        : "bg-slate-950/30 border-white/5 text-slate-500 hover:border-white/10 hover:bg-slate-950/60 hover:text-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${isActive
                        ? isAiTab
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "bg-emerald-600 text-white"
                        : isAiTab
                          ? "bg-indigo-950/40 text-indigo-400"
                          : "bg-white/5 text-slate-400"
                        }`}>
                        <Icon size={12} className={isAiTab && !isActive ? "animate-pulse" : ""} />
                      </div>
                      <div className="overflow-hidden">
                        <p className={`text-[8px] font-bold uppercase tracking-wider ${isActive
                          ? isAiTab
                            ? "text-indigo-400"
                            : "text-emerald-400"
                          : isAiTab
                            ? "text-indigo-455 text-indigo-400"
                            : "text-slate-500"
                          }`}>
                          BÖLÜM {idx + 1 < 10 ? `0${idx + 1}` : idx + 1} {isAiTab && "• AI"}
                        </p>
                        <p className="text-[11px] font-bold truncate leading-tight mt-0.5">{step.label}</p>
                      </div>
                    </div>
                    {isAiTab && (
                      <span className="text-[7px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded border border-indigo-400/20 shrink-0 ai-float">YENİ</span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>

          {/* RIGHT COLUMN: Browser Device Mockup */}
          <div className="lg:col-span-9 space-y-3">

            {/* Glowing subtitle card */}
            <div className="bg-slate-950/70 border border-white/5 rounded-xl p-3 flex items-center gap-3 shrink-0">
              <div className="flex-1 min-w-0">
                <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{steps[activeStep].title}</h3>
                <p className="text-[11px] text-slate-200 mt-1 min-h-[16px] font-medium leading-relaxed">
                  {typedSubtitle}
                  <span className="animate-ping text-emerald-400 ml-0.5">|</span>
                </p>
              </div>
            </div>

            {/* Browser Window Frame Mockup */}
            <div className="bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col min-h-[580px] max-h-[680px]">

              {/* Browser top title bar */}
              <div className="bg-slate-900 border-b border-white/5 px-4 py-2.5 flex items-center gap-3 shrink-0 select-none">
                <div className="flex gap-1.5 shrink-0">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 max-w-md mx-auto bg-slate-950/80 border border-white/5 rounded-lg py-1 px-3 text-[9px] text-slate-500 flex items-center gap-2">
                  <span className="font-medium truncate">
                    https://seedhr.com/dashboard/{
                      steps[activeStep].id === "dashboard" ? "portal" :
                      steps[activeStep].id === "orgchart" ? "org-chart" :
                      steps[activeStep].id === "attendance" ? "pdks" :
                      steps[activeStep].id === "recruitment" ? "recruitment-ats" :
                      steps[activeStep].id === "finance" ? "bordro-finance" :
                      steps[activeStep].id === "ai_chat" ? "seedai" :
                      steps[activeStep].id
                    }
                  </span>
                </div>
                <div className="h-3 w-3" />
              </div>

              {/* Main app body mockup */}
              <div className="flex-1 flex min-h-0 bg-slate-950 text-slate-200 text-xs overflow-hidden">

                {/* Virtual app sidebar */}
                <aside className="w-44 bg-slate-900/60 border-r border-white/5 p-3 flex flex-col justify-between shrink-0 select-none">
                  <nav className="space-y-1">
                    {steps.map((item, idx) => {
                      const Icon = item.icon;
                      const isTabActive = idx === activeStep;
                      const isAiTab = item.id === "ai_chat";
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleStepSelect(idx)}
                          className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[9px] font-bold tracking-wide transition-all cursor-pointer ${isTabActive
                            ? isAiTab
                              ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-indigo-600/20"
                              : "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                            : isAiTab
                              ? "text-indigo-300 bg-indigo-950/20 border border-indigo-500/20 hover:bg-indigo-950/40 hover:text-white"
                              : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Icon size={12} className={isTabActive ? "text-white" : isAiTab ? "text-indigo-400 animate-pulse" : "text-slate-500"} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {isAiTab && (
                            <span className="text-[7px] font-extrabold uppercase bg-indigo-550/20 bg-indigo-500/20 text-indigo-350 text-indigo-300 px-1 py-0.2 rounded border border-indigo-400/20 shrink-0">AI</span>
                          )}
                        </div>
                      );
                    })}
                  </nav>

                  <div className="border-t border-white/5 pt-3.5 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[9px] uppercase">
                      AD
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-[9px] text-white truncate">Can Demir</p>
                      <p className="text-[8px] text-slate-500 truncate">BT Müdürü</p>
                    </div>
                  </div>
                </aside>

                {/* Mock Dynamic Tab View Screen */}
                <div className="flex-1 relative bg-slate-950 flex flex-col min-h-0">
                  <div className="flex-1 p-5 overflow-y-auto pb-20 min-h-0">

                    {/* MODÜL 1: DASHBOARD */}
                    {steps[activeStep].id === "dashboard" && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Toplam Çalışan", value: "148 Kişi", change: "+12 Bu ay", icon: <Users size={14} className="text-emerald-400" /> },
                            { label: "Aktif İzinler", value: "4 Kişi", change: "2 Bekleyen", icon: <CalendarRange size={14} className="text-indigo-400" /> },
                            { label: "Açık Pozisyonlar", value: "6 İlan", change: "42 Başvuru", icon: <Briefcase size={14} className="text-amber-400" /> },
                          ].map((card, idx) => (
                            <div key={idx} className="p-3 bg-slate-900 border border-white/5 rounded-2xl space-y-1.5 hover:border-white/10 transition-all">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{card.label}</span>
                                {card.icon}
                              </div>
                              <p className="text-base font-extrabold text-white">{card.value}</p>
                              <p className="text-[9px] text-emerald-500 flex items-center gap-0.5">
                                <TrendingUp size={10} />
                                {card.change}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Bugün Giriş-Çıkış (PDKS)</span>
                              <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">%98.4 Katılım</span>
                            </div>
                            <div className="h-24 flex items-end gap-1.5 justify-around pb-2 border-b border-white/5">
                              {[35, 45, 60, 85, 98, 95, 40].map((h, i) => (
                                <div key={i} className="flex flex-col items-center gap-1 w-6">
                                  <div className={`w-full rounded-t ${i === 4 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-white/10"}`} style={{ height: `${h}px` }} />
                                  <span className="text-[8px] text-slate-500">{["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"][i]}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-3">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Son İK Duyuruları</span>
                            <div className="space-y-2">
                              {[
                                { title: "Yeni İK Yönetim Portalı Yayında!", time: "2 gün önce", cat: "Sistem" },
                                { title: "Yaz Dönemi Yıllık İzin Planlamaları", time: "3 gün önce", cat: "Duyuru" },
                                { title: "Günün Leziz Yemek Menüsü Açıklandı", time: "Bugün", cat: "Yemek" }
                              ].map((ann, i) => (
                                <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-slate-950/60 border border-white/5">
                                  <div>
                                    <p className="font-bold text-[10px] text-white truncate max-w-[160px]">{ann.title}</p>
                                    <p className="text-[9px] text-slate-500 mt-0.5">{ann.time}</p>
                                  </div>
                                  <span className="text-[8px] font-bold bg-white/5 px-2 py-0.5 rounded text-slate-400 shrink-0">{ann.cat}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MODÜL 2: EMPLOYEES */}
                    {steps[activeStep].id === "employees" && (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        <div className="relative">
                          <Search className="absolute top-2.5 left-3 text-slate-500" size={12} />
                          <input type="text" placeholder="Çalışan ara..." className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-[10px] text-white outline-none" disabled />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { name: "Ayşe Kaya", title: "İK Müdürü", dept: "İnsan Kaynakları", status: "Aktif", init: "AK" },
                            { name: "Can Demir", title: "BT Müdürü", dept: "Bilgi Teknolojileri", status: "Aktif", init: "CD" },
                            { name: "Ahmet Yılmaz", title: "Yazılım Uzmanı", dept: "Bilgi Teknolojileri", status: "İzinli", init: "AY" },
                            { name: "Zeynep Demir", title: "İK Uzmanı", dept: "İnsan Kaynakları", status: "Aktif", init: "ZD" },
                            { name: "Mehmet Çelik", title: "Muhasebe Uzmanı", dept: "Finans & Muhasebe", status: "Aktif", init: "MÇ" },
                            { name: "Sibel Kaya", title: "UX Tasarımcı", dept: "Tasarım", status: "Aktif", init: "SK" }
                          ].map((emp, i) => (
                            <div key={i} onClick={() => setSelectedEmployee(emp.name)} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-white/5 hover:border-emerald-500/20 hover:bg-slate-900/80 transition-all cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">{emp.init}</div>
                                <div>
                                  <p className="font-bold text-white text-[10px]">{emp.name}</p>
                                  <p className="text-[9px] text-slate-500">{emp.title} • {emp.dept}</p>
                                </div>
                              </div>
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${emp.status === "Aktif" ? "bg-emerald-500/10 text-emerald-400" : emp.status === "İzinli" ? "bg-amber-500/10 text-amber-400" : "bg-slate-550/10 text-slate-400"}`}>{emp.status}</span>
                            </div>
                          ))}
                        </div>

                        {selectedEmployee && (
                          <div className="absolute inset-0 bg-slate-950/95 border border-white/10 p-5 rounded-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
                            <div className="space-y-4">
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold text-sm text-white">Çalışan Özlük Dosyası</h3>
                                <button onClick={() => setSelectedEmployee(null)} className="text-slate-500 hover:text-white text-[10px] font-bold">Kapat</button>
                              </div>
                              <div className="flex gap-3 items-center">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">{selectedEmployee[0]}</div>
                                <div>
                                  <h4 className="font-bold text-white text-xs">{selectedEmployee}</h4>
                                  <p className="text-[10px] text-slate-400">BT Departmanı • Kıdemli Personel</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3 pt-2 text-[10px]">
                                <div className="p-2.5 bg-slate-900 rounded-xl"><p className="text-slate-500 font-bold text-[8px]">E-Posta</p><p className="text-white mt-0.5 truncate">{selectedEmployee.toLowerCase().replace(" ", ".")}@seedhr.com</p></div>
                                <div className="p-2.5 bg-slate-900 rounded-xl"><p className="text-slate-500 font-bold text-[8px]">Telefon</p><p className="text-white mt-0.5">+90 532 555 1234</p></div>
                                <div className="p-2.5 bg-slate-900 rounded-xl"><p className="text-slate-500 font-bold text-[8px]">İşe Başlama</p><p className="text-white mt-0.5">12.04.2023</p></div>
                                <div className="p-2.5 bg-slate-900 rounded-xl"><p className="text-slate-500 font-bold text-[8px]">Zimmetler</p><p className="text-white mt-0.5">MacBook Pro</p></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* MODÜL 3: ORG CHART */}
                    {steps[activeStep].id === "orgchart" && (
                      <div className="space-y-3 flex flex-col items-center justify-center h-full min-h-[240px] animate-in fade-in duration-300">
                        <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-600/10 text-center w-36 shadow-md shrink-0">
                          <p className="font-bold text-white text-[10px]">Selim Aksoy</p>
                          <p className="text-[8px] text-emerald-400 uppercase tracking-wider mt-0.5 font-bold">Genel Müdür</p>
                        </div>
                        <div className="h-3 w-0.5 bg-slate-800 shrink-0" />

                        <div className="flex gap-6 relative">
                          <div className="flex flex-col items-center">
                            <div className="p-2.5 rounded-xl border border-white/10 bg-slate-900 text-center w-28 shrink-0">
                              <p className="font-bold text-white text-[9.5px]">Ayşe Kaya</p>
                              <p className="text-[7.5px] text-slate-500 uppercase mt-0.5 font-semibold">İK Müdürü</p>
                            </div>
                            <div className="h-3 w-0.5 bg-slate-800" />
                            <div className="p-2 rounded-xl border border-white/5 bg-slate-950 text-center w-26 shrink-0">
                              <p className="font-bold text-white text-[9px]">Zeynep Demir</p>
                              <p className="text-[7px] text-slate-500 uppercase mt-0.5 font-medium">İK Uzmanı</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="p-2.5 rounded-xl border border-white/10 bg-slate-900 text-center w-28 shrink-0">
                              <p className="font-bold text-white text-[9.5px]">Can Demir</p>
                              <p className="text-[7.5px] text-slate-500 uppercase mt-0.5 font-semibold">BT Müdürü</p>
                            </div>
                            <div className="h-3 w-0.5 bg-slate-800" />
                            <div className="p-2 rounded-xl border border-white/5 bg-slate-950 text-center w-26 shrink-0">
                              <p className="font-bold text-white text-[9px]">Ahmet Yılmaz</p>
                              <p className="text-[7px] text-slate-500 uppercase mt-0.5 font-medium">Yazılım Uzm.</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="p-2.5 rounded-xl border border-white/10 bg-slate-900 text-center w-28 shrink-0">
                              <p className="font-bold text-white text-[9.5px]">Bülent Öz</p>
                              <p className="text-[7.5px] text-slate-500 uppercase mt-0.5 font-semibold">Finans Müdürü</p>
                            </div>
                            <div className="h-3 w-0.5 bg-slate-800" />
                            <div className="p-2 rounded-xl border border-white/5 bg-slate-950 text-center w-26 shrink-0">
                              <p className="font-bold text-white text-[9px]">Mehmet Çelik</p>
                              <p className="text-[7px] text-slate-500 uppercase mt-0.5 font-medium">Muhasebe Uzm.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MODÜL 4: ONBOARDING */}
                    {steps[activeStep].id === "onboarding" && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Aktif İşe Uyum (Onboarding) Süreçleri</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-900 border border-white/5 rounded-2xl space-y-2.5">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <span className="font-bold text-[9px] text-white">Zeynep Çelik (İK)</span>
                              <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-full">%80</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                              <div className="bg-emerald-500 h-full w-[80%]" />
                            </div>
                            <div className="space-y-1.5 pt-1 text-[9px]">
                              {[
                                { task: "İş Sözleşmesi & Evrak", status: "Tamamlandı" },
                                { task: "Zimmet Cihaz Teslimi", status: "Tamamlandı" },
                                { task: "Departman Oryantasyonu", status: "Tamamlandı" },
                                { task: "BT Erişim Kurulumu", status: "Tamamlandı" },
                                { task: "İSG Eğitim Videosu", status: "Beklemede" }
                              ].map((t, idx) => (
                                <div key={idx} className="flex justify-between items-center p-1.5 rounded bg-slate-950/40 border border-white/5">
                                  <span className="text-slate-300 truncate max-w-[100px]">{t.task}</span>
                                  <span className={`text-[7px] font-bold px-1 py-0.2 rounded ${t.status === "Tamamlandı" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{t.status === "Tamamlandı" ? "Bitti" : "Bekliyor"}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 bg-slate-900 border border-white/5 rounded-2xl space-y-2.5">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <span className="font-bold text-[9px] text-white">Murat Şen (BT)</span>
                              <span className="text-[8px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded-full">%40</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                              <div className="bg-indigo-500 h-full w-[40%]" />
                            </div>
                            <div className="space-y-1.5 pt-1 text-[9px]">
                              {[
                                { task: "İş Sözleşmesi & Evrak", status: "Tamamlandı" },
                                { task: "Zimmet Cihaz Teslimi", status: "Tamamlandı" },
                                { task: "Departman Oryantasyonu", status: "Beklemede" },
                                { task: "BT Erişim Kurulumu", status: "Beklemede" },
                                { task: "İSG Eğitim Videosu", status: "Beklemede" }
                              ].map((t, idx) => (
                                <div key={idx} className="flex justify-between items-center p-1.5 rounded bg-slate-950/40 border border-white/5">
                                  <span className="text-slate-300 truncate max-w-[100px]">{t.task}</span>
                                  <span className={`text-[7px] font-bold px-1 py-0.2 rounded ${t.status === "Tamamlandı" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{t.status === "Tamamlandı" ? "Bitti" : "Bekliyor"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MODÜL 5: ASSETS */}
                    {steps[activeStep].id === "assets" && (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Zimmetli Cihaz & Ekipman Envanteri</span>
                          <span className="text-[8px] font-bold text-slate-400">Toplam 24 Cihaz</span>
                        </div>
                        <div className="space-y-2">
                          {[
                            { item: "MacBook Pro M3 Max", category: "Laptop", user: "Can Demir", status: "Zimmetli", color: "bg-emerald-500/10 text-emerald-400" },
                            { item: "iPhone 15 Pro 256GB", category: "Telefon", user: "Ayşe Kaya", status: "Zimmetli", color: "bg-emerald-500/10 text-emerald-400" },
                            { item: "Dell UltraSharp 27\"", category: "Monitör", user: "Ahmet Yılmaz", status: "Zimmetli", color: "bg-emerald-500/10 text-emerald-400" },
                            { item: "Logitech MX Master 3S", category: "Aksesuar", user: "Zeynep Demir", status: "Zimmetli", color: "bg-emerald-500/10 text-emerald-400" },
                            { item: "iPad Air 128GB", category: "Tablet", user: "-", status: "Depoda", color: "bg-indigo-500/10 text-indigo-400" },
                            { item: "Lenovo ThinkPad P16", category: "İş İstasyonu", user: "-", status: "Bakımda", color: "bg-amber-500/10 text-amber-400" }
                          ].map((a, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900 border border-white/5">
                              <div>
                                <p className="font-bold text-white text-[10px]">{a.item}</p>
                                <p className="text-[8px] text-slate-500">{a.category} • Zimmet Sahibi: {a.user}</p>
                              </div>
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${a.color}`}>{a.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MODÜL 6: LEAVES */}
                    {steps[activeStep].id === "leaves" && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Aktif İzin Onay Talebi</span>
                            <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">Onay Bekliyor</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">AY</div>
                            <div>
                              <h4 className="font-bold text-white text-[10px]">Ahmet Yılmaz</h4>
                              <p className="text-[8px] text-slate-500">Yazılım Geliştirici • Bilgi Teknolojileri</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-[9px]">
                            <div className="p-2 bg-slate-950 border border-white/5 rounded-xl">
                              <span className="text-slate-500 block uppercase font-bold text-[7px]">Talep Edilen Gün</span>
                              <span className="text-emerald-400 font-bold">5 Gün</span>
                            </div>
                            <div className="p-2 bg-slate-950 border border-white/5 rounded-xl">
                              <span className="text-slate-500 block uppercase font-bold text-[7px]">İzin Türü</span>
                              <span className="text-white font-semibold">Yıllık İzin</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {approvedLeave ? (
                              <div className="w-full flex items-center justify-center gap-2 p-2 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl animate-in zoom-in">
                                <CheckCircle size={14} className="text-emerald-500" />
                                Onaylandı
                              </div>
                            ) : (
                              <>
                                <button className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold text-[9px] border border-white/5">Reddet</button>
                                <button onClick={() => setApprovedLeave(true)} className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px]">Onayla</button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-900 border border-white/5 rounded-2xl space-y-2.5">
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider block">Son Onaylanan İzinler</span>
                          <div className="space-y-2">
                            {[
                              { name: "Sibel Kaya", type: "Mazeret İzni", duration: "1 Gün", date: "Dün", status: "Onaylandı" },
                              { name: "Zeynep Demir", type: "Yıllık İzin", duration: "3 Gün", date: "Geçen Hafta", status: "Onaylandı" }
                            ].map((l, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[9px] p-2 rounded-lg bg-slate-950/40 border border-white/5">
                                <div>
                                  <span className="text-white font-bold">{l.name}</span>
                                  <span className="text-slate-500 text-[8px] block">{l.type} • {l.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400 font-bold">{l.duration}</span>
                                  <span className="text-[7.5px] font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">{l.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MODÜL 7: ATTENDANCE */}
                    {steps[activeStep].id === "attendance" && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-center space-y-3">
                          <p className="text-[10px] text-slate-400">Bugünkü Çalışma Durumunuz</p>
                          <div className="text-2xl font-extrabold text-white">08:45</div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20">
                            Mesai Girişi Yapıldı
                          </div>
                          <div className="border-t border-white/5 pt-3 text-left space-y-2 text-[9px]">
                            <div className="flex justify-between text-slate-400"><span>Giriş Saati</span><span className="text-white font-semibold">08:45</span></div>
                            <div className="flex justify-between text-slate-400"><span>Çıkış Saati</span><span className="text-white font-semibold">18:00 (Planlanan)</span></div>
                            <div className="flex justify-between text-slate-400"><span>Konum</span><span className="text-emerald-400 font-semibold">Ofisten Çalışma</span></div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-900 border border-white/5 rounded-2xl space-y-2.5">
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider block text-left">PDKS Haftalık Geçmişi</span>
                          <div className="space-y-1.5 text-[9px]">
                            {[
                              { day: "Dün (Salı)", log: "08:28 - 18:02", total: "9 sa 34 dk", status: "Tamamlandı" },
                              { day: "Pazartesi", log: "08:31 - 18:10", total: "9 sa 39 dk", status: "Tamamlandı" },
                              { day: "Geçen Cuma", log: "08:42 - 18:00", total: "9 sa 18 dk", status: "Geçen Giriş" }
                            ].map((h, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-950/40 border border-white/5">
                                <span className="font-bold text-slate-300">{h.day}</span>
                                <span className="text-[8.5px] text-slate-400 font-medium">{h.log}</span>
                                <span className="text-[8px] font-bold text-slate-500">{h.total}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MODÜL 8: PERFORMANCE */}
                    {steps[activeStep].id === "performance" && (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Performans Değerlendirmesi</span>
                        <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[10px] text-white">Ahmet Yılmaz - 2026 Q1</span>
                            <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">4.5 / 5.0</span>
                          </div>
                          <div className="space-y-2.5 text-[9px] pt-1">
                            {[
                              { skill: "Teknik Yetkinlik & Kod Kalitesi", val: 95 },
                              { skill: "Takım Çalışması & İletişim", val: 85 },
                              { skill: "Problem Çözme & Analiz", val: 90 },
                              { skill: "İnisiyatif & Liderlik Yeteneği", val: 80 }
                            ].map((s, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-slate-400"><span>{s.skill}</span><span className="text-white font-bold">%{s.val}</span></div>
                                <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                                  <div className="bg-indigo-500 h-full" style={{ width: `${s.val}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-900 border border-white/5 rounded-2xl space-y-2 text-[9px]">
                          <span className="font-bold text-white uppercase tracking-wider block">Bekleyen Değerlendirme Formları</span>
                          <div className="flex justify-between items-center p-2 rounded-xl bg-slate-950/40 border border-white/5">
                            <div>
                              <p className="font-bold text-white">2026 Q2 Öz Değerlendirme</p>
                              <p className="text-[8px] text-slate-500">Son Tarih: 30.06.2026</p>
                            </div>
                            <span className="text-[8px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Doldur</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MODÜL 9: RECRUITMENT */}
                    {steps[activeStep].id === "recruitment" && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        {/* Summary Stats Row */}
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: "Toplam Başvuru", value: "42 Aday", change: "+4 Bugün", color: "text-indigo-400" },
                            { label: "AI Değerlendirme", value: "24 Profil", change: "6 Bekleyen", color: "text-purple-400" },
                            { label: "Mülakat Süreci", value: "5 Görüşme", change: "2 Bugün", color: "text-blue-400" },
                            { label: "Kabul Edilen", value: "3 Aday", change: "%96 Eşleşme", color: "text-emerald-400" }
                          ].map((stat, i) => (
                            <div key={i} className="bg-slate-900 border border-white/5 rounded-2xl p-2.5 text-left">
                              <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider block">{stat.label}</span>
                              <div className="flex justify-between items-baseline mt-0.5">
                                <span className="text-[11px] font-extrabold text-white">{stat.value}</span>
                                <span className="text-[7.5px] text-emerald-400 font-bold">{stat.change}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Kanban Board Container */}
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { key: "applied", title: "Yeni Başvurular", count: 2, color: "border-blue-500/20 text-blue-400 bg-blue-500/5" },
                            { key: "interview", title: "Mülakat Aşaması", count: 2, color: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5" },
                            { key: "offer", title: "Teklif & Onay", count: 1, color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" }
                          ].map((column) => (
                            <div key={column.key} className="flex-1 bg-slate-900/40 border border-white/5 rounded-2xl p-2.5 space-y-2.5 min-h-[260px]">
                              <div className={`flex justify-between items-center px-2 py-0.5 rounded-lg border text-[8px] font-extrabold tracking-wide ${column.color}`}>
                                <span>{column.title.toUpperCase()}</span>
                                <span>{column.count}</span>
                              </div>

                              <div className="space-y-2">
                                {CANDIDATES
                                  .filter((c) => c.col === column.key)
                                  .map((c, i) => (
                                    <div
                                      key={i}
                                      onClick={() => setSelectedCandidate(c.name)}
                                      className="p-2.5 bg-slate-950 border border-white/5 rounded-xl hover:border-indigo-500/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] space-y-2 shadow-md hover:shadow-indigo-950/20"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex gap-2 items-center overflow-hidden">
                                          <div className={`h-6.5 w-6.5 rounded-lg font-bold text-[9px] flex items-center justify-center shrink-0 ${c.bg}`}>
                                            {c.init}
                                          </div>
                                          <div className="overflow-hidden">
                                            <p className="font-bold text-white text-[9.5px] truncate">{c.name}</p>
                                            <p className="text-[8px] text-slate-500 truncate mt-0.5">{c.role}</p>
                                          </div>
                                        </div>
                                        <ArrowUpRight size={10} className="text-slate-500 shrink-0" />
                                      </div>

                                      <div className="flex flex-wrap gap-1">
                                        {c.tags.map((tag, tIdx) => (
                                          <span key={tIdx} className="text-[7px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded font-bold">{tag}</span>
                                        ))}
                                      </div>

                                      <div className="flex justify-between items-center border-t border-white/5 pt-1.5 text-[7px] text-slate-500">
                                        <span>{c.source}</span>
                                        <span className="text-[7.5px] font-extrabold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/10 flex items-center gap-0.5 shadow-sm">
                                          <Sparkles size={7} className="animate-pulse" /> AI %{c.score}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Candidate Detailed Profile Overlay */}
                        {selectedCandidate && (() => {
                          const selectedC = CANDIDATES.find(c => c.name === selectedCandidate);
                          if (!selectedC) return null;
                          return (
                            <div className="absolute inset-0 bg-slate-950/98 border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[8px] font-extrabold bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1 ai-float">
                                    <Sparkles size={8} /> SEEDAI ADAY ANALİZ DETAYI
                                  </span>
                                  <button onClick={() => setSelectedCandidate(null)} className="text-slate-500 hover:text-white text-[9px] font-bold transition-colors">Kapat</button>
                                </div>

                                <div className="flex gap-2.5 items-center">
                                  <div className={`h-9 w-9 rounded-xl font-extrabold text-[10px] flex items-center justify-center shrink-0 ${selectedC.bg}`}>
                                    {selectedC.init}
                                  </div>
                                  <div>
                                    <h4 className="font-extrabold text-white text-[11px] leading-none">{selectedC.name}</h4>
                                    <p className="text-[9px] text-slate-400 mt-1">{selectedC.role} • {selectedC.source}</p>
                                    <div className="flex gap-1 mt-1">
                                      {selectedC.tags.map((tag, tIdx) => (
                                        <span key={tIdx} className="text-[7px] bg-slate-900 border border-white/5 text-slate-400 px-1 py-0.2 rounded font-bold">{tag}</span>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="p-2 bg-slate-900 border border-white/5 rounded-xl space-y-0.5">
                                    <span className="text-slate-500 block uppercase font-bold text-[6.5px]">SeedAI Eşleşme Skoru</span>
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-indigo-400 font-extrabold text-[12px] leading-none">%{selectedC.score}</span>
                                      <span className="text-[7px] text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.2 rounded">Uyumlu</span>
                                    </div>
                                  </div>
                                  <div className="p-2 bg-slate-900 border border-white/5 rounded-xl space-y-0.5">
                                    <span className="text-slate-500 block uppercase font-bold text-[6.5px]">Başvuru Tarihi</span>
                                    <span className="text-white font-bold text-[8.5px] block mt-0.5">16.06.2026</span>
                                  </div>
                                </div>

                                <div className="p-2.5 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-1 shadow-md shadow-indigo-950/20">
                                  <span className="text-indigo-400 font-bold text-[8px] flex items-center gap-1 uppercase tracking-wide">
                                    <Sparkles size={8} className="animate-pulse" /> SeedAI Değerlendirme Raporu
                                  </span>
                                  <div className="text-[8px] text-indigo-100/90 space-y-0.5 leading-relaxed">
                                    <p>• <strong>Teknik Uyum:</strong> Pozisyon gereksinimleriyle ({selectedC.tags.slice(0, 2).join(", ")}) yüksek eşleşme.</p>
                                    <p>• <strong>Kültür:</strong> Şirket değerleri ve ekip yapısı ile tamamen dengeli profil.</p>
                                    <p>• <strong>Değerlendirme:</strong> Genel puan %{selectedC.score}. Mülakat aşamasına geçilmesi önerilir.</p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2 border-t border-white/5 pt-2">
                                <button onClick={() => setSelectedCandidate(null)} className="flex-1 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold text-[9px] border border-white/5 transition-all">Geri Dön</button>
                                <button onClick={() => {
                                  setSelectedCandidate(null);
                                }} className="flex-1 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[9px] shadow-lg shadow-indigo-600/15 transition-all">Mülakat Planla</button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* MODÜL 10: FINANCE */}
                    {steps[activeStep].id === "finance" && (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Aylık Bordro Detayları (Haziran)</span>
                        <div className="p-3 bg-slate-900 border border-white/5 rounded-2xl space-y-2.5 text-[10px]">
                          <div className="flex justify-between text-slate-400"><span>Brüt Temel Maaş</span><span className="text-white font-semibold">₺42.500</span></div>
                          <div className="flex justify-between text-slate-400"><span>Prim ve Ödenekler</span><span className="text-white font-semibold">₺2.400</span></div>
                          <div className="flex justify-between text-slate-400"><span>Yasal Kesintiler</span><span className="text-rose-500 font-semibold">-₺1.500</span></div>
                          <div className="border-t border-white/5 pt-2 flex justify-between font-bold text-emerald-400">
                            <span>Net Ödenecek Tutar</span><span>₺43.400</span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-900 border border-white/5 rounded-2xl space-y-2 text-[9px]">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white uppercase tracking-wider">Bekleyen Masraf Talepleri</span>
                            <span className="text-[8px] font-bold text-slate-500">2 Yeni</span>
                          </div>
                          <div className="space-y-1.5">
                            {[
                              { expense: "Müşteri Öğle Yemeği", amt: "₺1.200", status: "Onay Bekliyor", color: "text-amber-400 bg-amber-500/10" },
                              { expense: "Yol / Taksi Ücreti", amt: "₺350", status: "Onaylandı", color: "text-emerald-400 bg-emerald-500/10" }
                            ].map((ex, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-950/40 border border-white/5">
                                <div>
                                  <p className="font-bold text-white">{ex.expense}</p>
                                  <p className="text-[7.5px] text-slate-500">Kategori: Seyahat & Yemek</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">{ex.amt}</span>
                                  <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${ex.color}`}>{ex.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MODÜL 11: SHIFTS */}
                    {steps[activeStep].id === "shifts" && (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Haftalık Vardiya Takvimi (Can Demir)</span>
                        <div className="space-y-1.5 text-[9.5px]">
                          {[
                            { day: "Pazartesi", shift: "Sabah Vardiyası (08:00 - 17:00)", color: "border-emerald-500 text-emerald-400" },
                            { day: "Salı", shift: "Sabah Vardiyası (08:00 - 17:00)", color: "border-emerald-500 text-emerald-400" },
                            { day: "Çarşamba", shift: "Akşam Vardiyası (15:00 - 23:00)", color: "border-indigo-500 text-indigo-400" },
                            { day: "Perşembe", shift: "Akşam Vardiyası (15:00 - 23:00)", color: "border-indigo-500 text-indigo-400" },
                            { day: "Cuma", shift: "Sabah Vardiyası (08:00 - 17:00)", color: "border-emerald-500 text-emerald-400" },
                            { day: "Cumartesi", shift: "İzinli (Haftalık Dinlenme)", color: "border-slate-700 text-slate-500" },
                            { day: "Pazar", shift: "İzinli (Haftalık Dinlenme)", color: "border-slate-700 text-slate-500" }
                          ].map((s, idx) => (
                            <div key={idx} className={`p-2 rounded-xl bg-slate-900 border-l-4 border-y border-r border-white/5 ${s.color} flex justify-between items-center`}>
                              <span className="font-bold">{s.day}</span>
                              <span className="text-[8.5px] font-medium">{s.shift}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MODÜL 12: VISITORS */}
                    {steps[activeStep].id === "visitors" && (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Günlük Ziyaretçi Giriş/Çıkış Kayıtları</span>
                          <span className="text-[8px] font-bold text-emerald-400">3 Aktif Ziyaretçi</span>
                        </div>
                        <div className="space-y-2 text-[10px]">
                          {[
                            { name: "Ahmet Güneş", card: "102", reason: "Müşteri Toplantısı", status: "İçeride", color: "bg-emerald-500/10 text-emerald-400" },
                            { name: "Selin Yurt", card: "110", reason: "İş Görüşmesi", status: "İçeride", color: "bg-emerald-500/10 text-emerald-400" },
                            { name: "Cem Çelik", card: "108", reason: "Teknik Servis", status: "İçeride", color: "bg-emerald-500/10 text-emerald-400" },
                            { name: "Mehmet Şahin", card: "105", reason: "Kargo/Kurye", status: "Ayrıldı", color: "bg-white/5 text-slate-400" }
                          ].map((v, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900 border border-white/5">
                              <div>
                                <p className="font-bold text-white text-[10px]">{v.name}</p>
                                <p className="text-[8px] text-slate-500">Kart No: {v.card} • Sebep: {v.reason}</p>
                              </div>
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${v.color}`}>{v.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MODÜL 13: ANNOUNCEMENTS */}
                    {steps[activeStep].id === "announcements" && (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Şirket İçi Duyurular & Bülten</span>
                        <div className="space-y-2 text-[10px]">
                          {[
                            { title: "Yeni Yapay Zeka Destekli SeedAI Asistanı Tüm Çalışanlar İçin Aktif Edildi!", date: "17.06.2026", type: "Duyuru" },
                            { title: "Yıllık İzin Planlamalarının Cuma Gününe Kadar Tamamlanması Rica Olunur.", date: "15.06.2026", type: "Hatırlatma" },
                            { title: "Yeni SeedHR Personel Portalı Kullanım Kılavuzu Yayınlandı.", date: "12.06.2026", type: "Kılavuz" },
                            { title: "Haftalık BT Güvenlik Güncellemeleri ve Şifre Yenileme Politikası.", date: "10.06.2026", type: "Güvenlik" }
                          ].map((a, idx) => (
                            <div key={idx} className="p-3 bg-slate-900 border border-white/5 rounded-2xl space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{a.type}</span>
                                <span className="text-[8px] text-slate-500">{a.date}</span>
                              </div>
                              <p className="font-bold text-white leading-snug text-[10px]">{a.title}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MODÜL 14: SEEDAI ASSISTANT */}
                    {steps[activeStep].id === "ai_chat" && (
                      <div className="space-y-2.5 flex flex-col h-full animate-in fade-in duration-300">
                        <div className="flex-1 overflow-y-auto space-y-2.5 min-h-[220px] border border-indigo-500/10 bg-slate-950/40 rounded-xl p-2.5 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]">
                          {chatMessages.length === 0 && (
                            <div className="text-center py-4 space-y-3">
                              <div className="h-9 w-9 bg-indigo-500/10 text-indigo-400 flex items-center justify-center rounded-xl mx-auto"><Sparkles size={16} className="animate-pulse" /></div>
                              <div className="space-y-1">
                                <h4 className="font-bold text-white text-[10px] ai-gradient-text">SeedAI İK Copilot Asistanı</h4>
                                <p className="text-[8px] text-indigo-200/60 max-w-[200px] mx-auto">Maaş, izin hakları, zimmetler ve şirket politikaları hakkında sorun.</p>
                              </div>
                              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto pt-2">
                                {[
                                  "Kalan yıllık izin günlerim?",
                                  "Haziran ayı maaş bordrom?",
                                  "Üzerimdeki zimmetli cihazlar?",
                                  "İzin onay sürecini nasıl başlatırım?"
                                ].map((q, i) => (
                                  <div key={i} onClick={() => { setAiInput(q); }} className="p-2 bg-indigo-950/20 hover:bg-indigo-900/30 border border-indigo-500/20 hover:border-indigo-400/50 rounded-lg text-[8px] text-indigo-200 cursor-pointer transition-all truncate hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-indigo-950/20">
                                    ✨ {q}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                              <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"}`}>
                                {msg.role === "user" ? <UserIcon size={12} /> : <BotIcon size={12} />}
                              </div>
                              <div className={`max-w-[80%] p-2.5 rounded-xl text-[9px] leading-relaxed ${msg.role === "user"
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-md shadow-md shadow-emerald-600/10 animate-in slide-in-from-right duration-200"
                                : "bg-slate-900 border border-indigo-500/20 text-slate-100 rounded-tl-md shadow-md shadow-indigo-950/40 ai-glow-card animate-in slide-in-from-left duration-200"
                                }`}>
                                <p className="font-medium">{msg.text}</p>
                              </div>
                            </div>
                          ))}
                          {isTyping && (
                            <div className="flex gap-2.5">
                              <div className="h-6 w-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0"><BotIcon size={12} /></div>
                              <div className="bg-slate-900 border border-indigo-500/20 rounded-xl rounded-tl-md px-3 py-2 flex items-center justify-center ai-glow-card">
                                <div className="flex gap-1">
                                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <form onSubmit={handleCustomQuestionSubmit} className="flex gap-2">
                          <input type="text" value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Bir soru sorun..." className="flex-1 px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-xl text-[10px] text-white outline-none focus:border-indigo-500/40" />
                          <button type="submit" className="h-8 w-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shrink-0"><Send size={12} /></button>
                        </form>
                      </div>
                    )}

                  </div>


                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
