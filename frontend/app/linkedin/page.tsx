"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Brain,
  Users,
  CalendarRange,
  DollarSign,
  Laptop,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileText,
  Layers,
  Zap,
  ArrowLeft,
  Camera,
  FolderOpen,
  Megaphone,
  TrendingUp,
  Building2,
  Lock,
  Sun,
  Moon,
} from "lucide-react";

type Category = "all" | "core" | "ai" | "hr" | "ops" | "culture";

export default function LinkedinPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [zoomLevel, setZoomLevel] = useState<number>(0.8);
  const [isDark, setIsDark] = useState<boolean>(true);

  const categories = [
    { id: "all", label: "Tüm Modüller (11)" },
    { id: "core", label: "Genel Lansman" },
    { id: "ai", label: "Yapay Zeka (2)" },
    { id: "hr", label: "Operasyonel İK (3)" },
    { id: "ops", label: "Donanım & Doküman (3)" },
    { id: "culture", label: "Kültür & Performans (2)" },
  ];

  return (
    <div className={`min-h-screen font-sans antialiased pb-32 relative overflow-x-hidden transition-colors duration-300 ${
      isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"
    }`}>
      
      {/* Background glow effects */}
      <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none -z-10 transition-colors duration-350 ${
        isDark ? "bg-indigo-500/10" : "bg-indigo-500/5"
      }`} />
      <div className={`absolute top-1/2 right-1/4 w-[700px] h-[700px] rounded-full blur-[180px] pointer-events-none -z-10 transition-colors duration-350 ${
        isDark ? "bg-emerald-500/5" : "bg-emerald-500/3"
      }`} />

      {/* Top Header */}
      <header className={`border-b sticky top-0 z-50 transition-colors duration-300 backdrop-blur-md ${
        isDark ? "border-slate-900 bg-slate-950/80" : "border-slate-200 bg-white/80"
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
              isDark ? "bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white" : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-800"
            }`}>
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2">
              <img src="/icon.png" alt="SeedHR Logo" className="h-8 w-8 object-contain rounded-lg shadow-sm" />
              <span className={`font-bold text-lg tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Seed<span className="text-indigo-500">HR</span>
              </span>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                isDark ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "bg-indigo-50 text-indigo-650 border-indigo-150"
              }`}>
                LinkedIn Kit
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                isDark 
                  ? "bg-slate-900 border-slate-850 text-slate-350 hover:bg-slate-800" 
                  : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
              }`}
            >
              {isDark ? (
                <>
                  <Sun size={14} className="text-amber-400 fill-amber-400 animate-spin-slow" />
                  <span>Açık Arka Plan Yap</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-indigo-600 fill-indigo-600" />
                  <span>Koyu Arka Plan Yap</span>
                </>
              )}
            </button>

            {/* Zoom Controls */}
            <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl ${
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <span className="text-[10px] text-slate-400 font-semibold">Yakınlaştırma:</span>
              <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))} className="text-xs font-bold text-slate-400 hover:text-white px-1.5">-</button>
              <span className="text-xs font-bold text-indigo-500">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={() => setZoomLevel(Math.min(1.2, zoomLevel + 0.1))} className="text-xs font-bold text-slate-400 hover:text-white px-1.5">+</button>
            </div>
          </div>
        </div>
      </header>

      {/* Control Filters */}
      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Helper Notification */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3 max-w-3xl mx-auto shadow-sm ${
          isDark ? "bg-indigo-950/20 border-indigo-500/20" : "bg-white border-indigo-100"
        }`}>
          <Camera className="text-indigo-500 shrink-0 mt-0.5" size={18} />
          <div>
            <h3 className="text-xs font-bold text-indigo-600">Premium Görsel Paylaşım Kiti</h3>
            <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Açık tema tasarımları **arka plan derinliği ve yüksek kontrast** ile optimize edilmiştir. LinkedIn'de dikkat çekecek seviyede temiz ve net bir görünüm sağlar.
            </p>
          </div>
        </div>

        {/* Tab Category Selection */}
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {categories.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as Category)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm ${
                activeCategory === tab.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : isDark 
                    ? "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                    : "bg-white border border-slate-200 text-slate-650 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* BANNERS LIST */}
        <div className="space-y-16 py-8 flex flex-col items-center" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}>

          {/* ========================================================================= */}
          {/* CATEGORY: CORE (GENEL) */}
          {/* ========================================================================= */}

          {/* BANNER 1: GENERAL LAUNCH */}
          {(activeCategory === "all" || activeCategory === "core") && (
            <div className="flex flex-col items-center gap-2">
              
              <div className={`w-[1200px] h-[630px] rounded-3xl border relative overflow-hidden flex flex-col justify-between p-12 shrink-0 select-none transition-all duration-300 ${
                isDark 
                  ? "bg-slate-950 border-slate-850 text-white shadow-2xl" 
                  : "bg-white border-slate-200/80 text-slate-900 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.09),_0_20px_50px_rgba(99,102,241,0.03)] border-slate-200"
              }`}
                style={{ 
                  backgroundImage: isDark
                    ? "radial-gradient(circle at 100% 0%, rgba(11, 163, 96, 0.1) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)"
                    : "radial-gradient(circle at 100% 0%, rgba(11, 163, 96, 0.08) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.07) 0%, transparent 60%)"
                }}>
                
                {/* Visual Grid Backdrop */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MClMLjUuNUgwVjQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoOTksMTAyLDI0MSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] pointer-events-none opacity-60" />
                
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="SeedHR Logo" className="h-10 w-10 object-contain rounded-xl shadow-sm" />
                    <span className={`font-extrabold text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Seed<span className="text-indigo-500">HR</span></span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold ${
                    isDark ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400" : "bg-indigo-50/80 border border-indigo-100/60 text-indigo-700 shadow-sm"
                  }`}>
                    <Zap size={12} className="fill-indigo-500" />
                    Yapay Zeka Destekli Yeni Nesil HRMS
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8 items-center relative z-10 my-auto">
                  <div className="col-span-7 space-y-6">
                    <h2 className={`text-5xl font-extrabold leading-[1.15] tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      İnsan Kaynakları <br /> Yönetimini <span className="bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent">Dijitalleştirin</span>
                    </h2>
                    <p className={`text-base leading-relaxed font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Çalışan özlük bilgileri, izin, vardiya planları, puantaj, envanter ve maaş bordroları tek bir akıllı platformda entegre.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {[
                        { icon: <Users size={14} className="text-indigo-500" />, text: "Personel & Özlük Takibi" },
                        { icon: <CalendarRange size={14} className="text-indigo-500" />, text: "İzin & Devamsızlık" },
                        { icon: <Clock size={14} className="text-indigo-500" />, text: "Vardiya & Puantaj" },
                        { icon: <DollarSign size={14} className="text-indigo-500" />, text: "Akıllı Maaş Bordroları" },
                      ].map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-2.5 text-sm font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          <div className={`p-1.5 rounded-lg border shrink-0 ${
                            isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200/80 shadow-sm"
                          }`}>{item.icon}</div>
                          {item.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-5 flex justify-end">
                    <div className={`w-[380px] rounded-2xl border p-6 shadow-2xl relative ${
                      isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80 shadow-md"
                    }`}>
                      <div className={`flex items-center justify-between border-b pb-3 mb-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">İK Gösterge Paneli</span>
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className={`p-3 border rounded-xl shadow-sm ${isDark ? "bg-slate-950 border-slate-900" : "bg-slate-50 border-slate-100"}`}>
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">Toplam Çalışan</span>
                          <span className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>128</span>
                        </div>
                        <div className={`p-3 border rounded-xl shadow-sm ${isDark ? "bg-slate-950 border-slate-900" : "bg-slate-50 border-slate-100"}`}>
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">İzinli Çalışan</span>
                          <span className="text-2xl font-extrabold text-indigo-600">8</span>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <div className={`flex items-center justify-between p-2.5 border rounded-xl shadow-sm ${isDark ? "bg-slate-950/60 border-slate-900" : "bg-white border-slate-150"}`}>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-500">SA</div>
                            <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Selim Aksoy</span>
                          </div>
                          <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded shadow-sm">Giriş Yaptı</span>
                        </div>
                        <div className={`flex items-center justify-between p-2.5 border rounded-xl shadow-sm ${isDark ? "bg-slate-950/60 border-slate-900" : "bg-white border-slate-150"}`}>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-500">EK</div>
                            <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Elif Kaya</span>
                          </div>
                          <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded shadow-sm">İzinli</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-between items-center border-t pt-6 relative z-10 ${isDark ? "border-slate-900" : "border-slate-200"}`}>
                  <span className={`text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-600"}`}>SeedHR • Kurumsal İnsan Kaynakları Yönetim Sistemi</span>
                  <div className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                    <span>🏢 seedhr.com.tr</span>
                    <span className="opacity-55">•</span>
                    <span>✉️ seedhrms@outlook.com</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CATEGORY: AI (YAPAY ZEKA) */}
          {/* ========================================================================= */}

          {/* BANNER 2: AI CHATBOT */}
          {(activeCategory === "all" || activeCategory === "ai") && (
            <div className="flex flex-col items-center gap-2">

              <div className={`w-[1200px] h-[630px] rounded-3xl border relative overflow-hidden flex flex-col justify-between p-12 shrink-0 select-none transition-all duration-300 ${
                isDark 
                  ? "bg-slate-950 border-slate-850 text-white shadow-2xl" 
                  : "bg-white border-slate-200/80 text-slate-900 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.09),_0_20px_50px_rgba(99,102,241,0.03)] border-slate-200"
              }`}
                style={{ 
                  backgroundImage: isDark
                    ? "radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)"
                    : "radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.07) 0%, transparent 60%)"
                }}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MClMLjUuNUgwVjQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoOTksMTAyLDI0MSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQiIi8+PC9zdmc+')] pointer-events-none opacity-60" />

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="SeedHR Logo" className="h-10 w-10 object-contain rounded-xl shadow-sm" />
                    <span className={`font-extrabold text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Seed<span className="text-indigo-500">HR</span></span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold ${
                    isDark ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400" : "bg-indigo-50/80 border border-indigo-100/60 text-indigo-700 shadow-sm"
                  }`}>
                    <Brain size={12} className="animate-pulse text-indigo-500" /> Yapay Zeka Destekli 7/24 Aktif İK Asistanı
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8 items-center relative z-10 my-auto">
                  <div className="col-span-5 space-y-6">
                    <h2 className={`text-4xl font-extrabold leading-[1.2] tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      Çalışanlarınızın <br /> Sorularına <br /> <span className="bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent">Yapay Zeka</span> Yanıtı
                    </h2>
                    <p className={`text-sm leading-relaxed font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      SeedAI, personelinizin kalan izin sürelerini, çalışma takvimlerini veya maaş detaylarını şirket politikalarını ve gerçek veritabanını analiz ederek anında yanıtlar.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${
                        isDark ? "bg-slate-900 border-slate-800 text-indigo-500" : "bg-slate-50 border-slate-200 text-indigo-600 shadow-sm"
                      }`}>
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Kişiselleştirilmiş Güvenli Veri Bağlamı</h4>
                        <p className={`text-[10px] font-semibold ${isDark ? "text-slate-500" : "text-slate-500"}`}>Kullanıcının sadece kendi yetkisi dahilindeki veriler AI asistanına beslenir.</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-7 flex justify-end">
                    <div className={`w-[580px] rounded-2xl border p-6 shadow-2xl space-y-4 ${
                      isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-md"
                    }`}>
                      <div className={`flex items-center gap-2 border-b pb-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white"><Brain size={14} /></div>
                        <div>
                          <h4 className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>SeedAI - İK Asistanı</h4>
                          <span className="text-[9px] text-emerald-600 flex items-center gap-1 font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping" /> Çevrimiçi • Şirket Politikaları Aktif
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <div className="bg-indigo-655 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[85%] text-xs font-bold shadow-md leading-relaxed" style={{ backgroundColor: "#0ba360" }}>
                            Merhaba, bu ay kaç gün yıllık izin hakkım kaldı? Önümüzdeki hafta mazeret izni talep edebilir miyim?
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <div className={`h-6 w-6 rounded border flex items-center justify-center shrink-0 ${
                            isDark ? "bg-slate-800 border-slate-700 text-indigo-400" : "bg-slate-100 border-slate-200 text-indigo-600 shadow-sm"
                          }`}>
                            <Brain size={12} />
                          </div>
                          <div className={`border rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[85%] text-xs font-bold shadow-md leading-relaxed space-y-1 ${
                            isDark ? "bg-slate-950 border-slate-900 text-slate-300" : "bg-slate-50 border-slate-150 text-slate-700"
                          }`}>
                            <p>Merhaba Umut Bey,</p>
                            <p>Güncel verilere göre kalan **10 gün** yıllık izin bakiyeniz bulunmaktadır. 📅</p>
                            <p className={`text-[11px] mt-1 font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Şirket politikamız gereği mazeret izin taleplerinin en geç 3 iş günü öncesinden iletilmesi önerilmektedir. İzin sekmesinden talebinizi hemen oluşturabilirsiniz.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-between items-center border-t pt-6 relative z-10 ${isDark ? "border-slate-900" : "border-slate-200"}`}>
                  <div className="flex items-center gap-6">
                    {[{ icon: <Sparkles size={12} className="text-indigo-500" />, label: "7/24 Anında Yanıt" },
                      { icon: <ShieldCheck size={12} className="text-indigo-500" />, label: "Akıllı Şirket Politikası Analizi" },
                      { icon: <CheckCircle size={12} className="text-indigo-500" />, label: "Otomatik Veri Eşleştirme" }].map((item, idx) => (
                      <div key={idx} className={`flex items-center gap-2 text-xs font-extrabold ${isDark ? "text-slate-500" : "text-slate-600"}`}>{item.icon}{item.label}</div>
                    ))}
                  </div>
                  <div className={`text-xs font-extrabold ${isDark ? "text-slate-500" : "text-slate-450"}`}>🏢 seedhr.com.tr</div>
                </div>
              </div>
            </div>
          )}

          {/* BANNER 3: ATS & CV MATCHING */}
          {(activeCategory === "all" || activeCategory === "ai") && (
            <div className="flex flex-col items-center gap-2">

              <div className={`w-[1200px] h-[630px] rounded-3xl border relative overflow-hidden flex flex-col justify-between p-12 shrink-0 select-none transition-all duration-300 ${
                isDark 
                  ? "bg-slate-950 border-slate-850 text-white shadow-2xl" 
                  : "bg-white border-slate-200/80 text-slate-900 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.09),_0_20px_50px_rgba(99,102,241,0.03)] border-slate-200"
              }`}
                style={{ 
                  backgroundImage: isDark
                    ? "radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)"
                    : "radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.07) 0%, transparent 60%)"
                }}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MClMLjUuNUgwVjQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoOTksMTAyLDI0MSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQiIi8+PC9zdmc+')] pointer-events-none opacity-60" />

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="SeedHR Logo" className="h-10 w-10 object-contain rounded-xl shadow-sm" />
                    <span className={`font-extrabold text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Seed<span className="text-indigo-500">HR</span></span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold ${
                    isDark ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border border-emerald-100 text-emerald-700 shadow-sm"
                  }`}>
                    <Sparkles size={12} className="text-emerald-500" /> Aday Takip ve Akıllı CV Değerlendirme Sistemi (ATS)
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8 items-center relative z-10 my-auto">
                  <div className="col-span-5 space-y-6">
                    <h2 className={`text-4xl font-extrabold leading-[1.2] tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      İşe Alımlarda <br /> <span className="bg-gradient-to-r from-emerald-500 to-indigo-650 bg-clip-text text-transparent">Akıllı CV Eşleme</span> <br /> Dönemi
                    </h2>
                    <p className={`text-sm leading-relaxed font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Adayların yetkinliklerini ve tecrübelerini iş ilanınızdaki niteliklerle yapay zeka yardımıyla analiz edin. Yüzlerce özgeçmiş arasından en doğru adayları saniyeler içinde önceliklendirin.
                    </p>
                    <div className="space-y-3 pt-2">
                      {["Yapay zeka uyumluluk skorlama (0 - 100)", "Kapsamlı teknik yetkinlik analizi", "Paralel ve hızlı CV tarama altyapısı"].map((t, i) => (
                        <div key={i} className={`flex items-center gap-2 text-xs font-bold ${isDark ? "text-slate-350" : "text-slate-700"}`}><CheckCircle size={14} className="text-emerald-500 shrink-0" />{t}</div>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-7 flex justify-end">
                    <div className={`w-[580px] rounded-2xl border p-6 shadow-2xl space-y-4 ${
                      isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-md"
                    }`}>
                      <div className={`flex justify-between items-center border-b pb-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <div>
                          <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">AKTİF İŞ İLANI</span>
                          <h4 className={`text-xs font-bold mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>Kıdemli Yazılım Geliştirici</h4>
                        </div>
                        <span className={`text-[10px] border px-2.5 py-1 rounded-md font-bold ${
                          isDark ? "bg-slate-950 border-slate-880 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600 shadow-sm"
                        }`}>12 Aday Başvurusu</span>
                      </div>

                      <div className="space-y-2.5">
                        <div className={`p-3 border rounded-xl flex items-center justify-between ${
                          isDark ? "bg-slate-950/80 border-slate-900" : "bg-white border-slate-150 shadow-sm"
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-500">CD</div>
                            <div>
                              <p className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Can Demir</p>
                              <p className="text-[9px] text-slate-500 font-medium">8+ Yıl Deneyim • Yazılım Geliştirme, Proje Yönetimi</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-xs font-bold text-emerald-500 block">%94</span>
                              <span className="text-[8px] text-slate-500 font-semibold block">Güçlü Eşleşme</span>
                            </div>
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          </div>
                        </div>

                        <div className={`p-3 border rounded-xl flex items-center justify-between ${
                          isDark ? "bg-slate-950/80 border-slate-900" : "bg-white border-slate-150 shadow-sm"
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-500">EY</div>
                            <div>
                              <p className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Elif Yılmaz</p>
                              <p className="text-[9px] text-slate-500 font-medium">4 Yıl Deneyim • Arayüz Tasarımı, Modern Kütüphaneler</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-xs font-bold text-emerald-500 block">%82</span>
                              <span className="text-[8px] text-slate-500 font-semibold block">Uygun Eşleşme</span>
                            </div>
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-between items-center border-t pt-6 relative z-10 ${isDark ? "border-slate-900" : "border-slate-200"}`}>
                  <div className="flex items-center gap-6">
                    {["#IseAlim", "#AdayTakip", "#InsanKaynaklari"].map((tag, i) => (
                      <span key={i} className={`text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-655"}`} style={{ color: isDark ? "" : "#0ba360" }}>{tag}</span>
                    ))}
                  </div>
                  <div className={`text-xs font-extrabold ${isDark ? "text-slate-500" : "text-slate-450"}`}>🏢 seedhr.com.tr</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CATEGORY: OPS (ORGANIZASYON & DONANIM) */}
          {/* ========================================================================= */}

          {/* BANNER 4: PERSONEL YÖNETİMİ & ÖZLÜK */}
          {(activeCategory === "all" || activeCategory === "ops") && (
            <div className="flex flex-col items-center gap-2">

              <div className={`w-[1200px] h-[630px] rounded-3xl border relative overflow-hidden flex flex-col justify-between p-12 shrink-0 select-none transition-all duration-300 ${
                isDark 
                  ? "bg-slate-950 border-slate-850 text-white shadow-2xl" 
                  : "bg-white border-slate-200/80 text-slate-900 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.09),_0_20px_50px_rgba(99,102,241,0.03)] border-slate-200"
              }`}
                style={{ backgroundImage: isDark ? "radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.1) 0%, transparent 60%)" : "radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.07) 0%, transparent 60%)" }}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MClMLjUuNUgwVjQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoOTksMTAyLDI0MSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQiIi8+PC9zdmc+')] pointer-events-none opacity-60" />

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="SeedHR Logo" className="h-10 w-10 object-contain rounded-xl shadow-sm" />
                    <span className={`font-extrabold text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Seed<span className="text-indigo-500">HR</span></span>
                  </div>
                  <span className={`text-xs font-bold border px-3 py-1 rounded-md ${isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50/80 border border-indigo-100 text-indigo-700 shadow-sm"}`}>Modül 01: Personel & Özlük</span>
                </div>

                <div className="grid grid-cols-12 gap-8 items-center relative z-10 my-auto">
                  <div className="col-span-5 space-y-6">
                    <h2 className={`text-4xl font-extrabold leading-[1.2] tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      Dijital Özlük <br /> Dosyaları ile <br /> <span className="bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent">Düzenli Arşiv</span>
                    </h2>
                    <p className={`text-sm leading-relaxed font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Çalışanlarınızın iletişim, acil durum, sözleşme ve kariyer bilgilerini tek bir merkezde saklayın. Şirket yapınızı organizasyon şemasıyla anlık görüntüleyin.
                    </p>
                    <div className="space-y-3">
                      <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-750"}`}>
                        <CheckCircle size={14} className="text-indigo-650" /> KVKK ile tam uyumlu kişisel veri koruması
                      </div>
                      <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-750"}`}>
                        <CheckCircle size={14} className="text-indigo-650" /> Departman ve rol bazlı organizasyon ağacı
                      </div>
                    </div>
                  </div>

                  <div className="col-span-7 flex justify-end">
                    <div className={`w-[580px] rounded-2xl border p-6 shadow-2xl space-y-4 ${
                      isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className={`flex justify-between items-center border-b pb-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Çalışan Kartı Örneği</span>
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded shadow-sm">ID: EMP-0923</span>
                      </div>
                      
                      <div className={`flex gap-4 items-center p-4 border rounded-xl ${
                        isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150 shadow-sm"
                      }`}>
                        <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-2xl font-bold text-indigo-500">CD</div>
                        <div className="space-y-1">
                          <h4 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Can Demir</h4>
                          <p className="text-xs text-indigo-600 font-bold">Yazılım Geliştirme Kıdemli Uzmanı</p>
                          <p className="text-[10px] text-slate-500 font-medium">Teknoloji & Ar-Ge Departmanı • Tam Zamanlı</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className={`p-3 border rounded-xl space-y-1 ${
                          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150"
                        }`}>
                          <span className="text-[9px] text-slate-500 font-semibold block uppercase">İşe Giriş Tarihi</span>
                          <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-850"}`}>12 Ocak 2022</span>
                        </div>
                        <div className={`p-3 border rounded-xl space-y-1 ${
                          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150"
                        }`}>
                          <span className="text-[9px] text-slate-500 font-semibold block uppercase">E-Posta Adresi</span>
                          <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-850"}`}>can.demir@seedhr.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-between items-center border-t pt-6 relative z-10 ${isDark ? "border-slate-900" : "border-slate-200"}`}>
                  <span className={`text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-450"}`}>#EmployeeManagement #DigitalHR</span>
                  <div className={`text-xs font-extrabold ${isDark ? "text-slate-500" : "text-slate-450"}`}>🏢 seedhr.com.tr</div>
                </div>
              </div>
            </div>
          )}

          {/* BANNER 5: İZİN YÖNETİMİ */}
          {(activeCategory === "all" || activeCategory === "hr") && (
            <div className="flex flex-col items-center gap-2">

              <div className={`w-[1200px] h-[630px] rounded-3xl border relative overflow-hidden flex flex-col justify-between p-12 shrink-0 select-none transition-all duration-300 ${
                isDark 
                  ? "bg-slate-950 border-slate-850 text-white shadow-2xl" 
                  : "bg-white border-slate-200/80 text-slate-900 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.09),_0_20px_50px_rgba(99,102,241,0.03)] border-slate-200"
              }`}
                style={{ backgroundImage: isDark ? "radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.1) 0%, transparent 60%)" : "radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.07) 0%, transparent 60%)" }}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MClMLjUuNUgwVjQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoOTksMTAyLDI0MSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSurlowiZ3JpZCkiLz48L3N2Zz4=')] pointer-events-none opacity-40" />

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="SeedHR Logo" className="h-10 w-10 object-contain rounded-xl shadow-sm" />
                    <span className={`font-extrabold text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Seed<span className="text-indigo-500">HR</span></span>
                  </div>
                  <span className={`text-xs font-bold border px-3 py-1 rounded-md ${isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50/80 border border-indigo-100 text-indigo-700 shadow-sm"}`}>Modül 02: İzin & Devamsızlık</span>
                </div>

                <div className="grid grid-cols-12 gap-8 items-center relative z-10 my-auto">
                  <div className="col-span-5 space-y-6">
                    <h2 className={`text-4xl font-extrabold leading-[1.2] tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      İzin Talepleri ve <br /> <span className="bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent">Onay Süreçleri</span> <br /> Parmaklarınızın Ucunda
                    </h2>
                    <p className={`text-sm leading-relaxed font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Çalışanlar saniyeler içinde izin talebi oluşturur, yöneticiler anında onaylar. Yıllık izin, mazeret izni ve rapor bakiye düşüşleri otomatik hesaplanır.
                    </p>
                  </div>

                  <div className="col-span-7 flex justify-end">
                    <div className={`w-[580px] rounded-2xl border p-6 shadow-2xl space-y-4 ${
                      isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className={`flex justify-between items-center border-b pb-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Son İzin Talepleri</span>
                        <span className="text-[10px] text-slate-500">Yönetici Paneli</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className={`p-3 border rounded-xl flex items-center justify-between ${
                          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150 shadow-sm"
                        }`}>
                          <div>
                            <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Can Demir</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Yıllık İzin • 5 Gün (15.06 - 19.06)</p>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded shadow-sm">Onaylandı</span>
                          </div>
                        </div>

                        <div className={`p-3 border rounded-xl flex items-center justify-between ${
                          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150 shadow-sm"
                        }`}>
                          <div>
                            <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Elif Kaya</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Mazeret İzni • 1 Gün (24.06 - 24.06)</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="text-[9px] bg-indigo-600 text-white font-bold px-2.5 py-1 rounded hover:bg-indigo-700 cursor-pointer shadow-sm">Onayla</button>
                            <button className={`text-[9px] border font-bold px-2.5 py-1 rounded cursor-pointer shadow-sm ${
                              isDark ? "bg-slate-900 border-slate-850 text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-650 hover:bg-slate-100"
                            }`}>Reddet</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-between items-center border-t pt-6 relative z-10 ${isDark ? "border-slate-900" : "border-slate-200"}`}>
                  <span className={`text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-450"}`}>#LeaveManagement #HRSoftware</span>
                  <div className={`text-xs font-extrabold ${isDark ? "text-slate-500" : "text-slate-450"}`}>🏢 seedhr.com.tr</div>
                </div>
              </div>
            </div>
          )}

          {/* BANNER 6: VARDİYA & PUANTAJ */}
          {(activeCategory === "all" || activeCategory === "hr") && (
            <div className="flex flex-col items-center gap-2">

              <div className={`w-[1200px] h-[630px] rounded-3xl border relative overflow-hidden flex flex-col justify-between p-12 shrink-0 select-none transition-all duration-300 ${
                isDark 
                  ? "bg-slate-950 border-slate-850 text-white shadow-2xl" 
                  : "bg-white border-slate-200/80 text-slate-900 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.09),_0_20px_50px_rgba(99,102,241,0.03)] border-slate-200"
              }`}
                style={{ backgroundImage: isDark ? "radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 60%)" : "radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.07) 0%, transparent 60%)" }}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MClMLjUuNUgwVjQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoOTksMTAyLDI0MSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSurlowiZ3JpZCkiLz48L3N2Zz4=')] pointer-events-none opacity-40" />

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="SeedHR Logo" className="h-10 w-10 object-contain rounded-xl shadow-sm" />
                    <span className={`font-extrabold text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Seed<span className="text-indigo-500">HR</span></span>
                  </div>
                  <span className={`text-xs font-bold border px-3 py-1 rounded-md ${isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50/80 border border-indigo-100 text-indigo-700 shadow-sm"}`}>Modül 03: Vardiya & Puantaj</span>
                </div>

                <div className="grid grid-cols-12 gap-8 items-center relative z-10 my-auto">
                  <div className="col-span-5 space-y-6">
                    <h2 className={`text-4xl font-extrabold leading-[1.2] tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      Hatasız Planlama ve <br /> <span className="bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent">Dinamik Vardiya</span> <br /> Yönetimi
                    </h2>
                    <p className={`text-sm leading-relaxed font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Haftalık veya aylık esnek çalışma planları hazırlayın. Vardiya çakışmalarını önleyin, fazla mesai saatlerini ve devamsızlık durumlarını puantaja otomatik yansıtın.
                    </p>
                  </div>

                  <div className="col-span-7 flex justify-end">
                    <div className={`w-[580px] rounded-2xl border p-6 shadow-2xl space-y-4 ${
                      isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className={`flex justify-between items-center border-b pb-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Haftalık Vardiya Planı</span>
                        <span className="text-[10px] text-indigo-500 font-semibold">15 - 21 Haziran</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className={`flex justify-between items-center p-3 border rounded-xl shadow-sm ${
                          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150"
                        }`}>
                          <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Pazartesi</span>
                          <span className={`text-xs font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded shadow-sm ${isDark ? "text-indigo-400" : "text-indigo-750"}`}>08:00 - 17:00 (Sabah Vardiyası)</span>
                        </div>
                        <div className={`flex justify-between items-center p-3 border rounded-xl shadow-sm ${
                          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150"
                        }`}>
                          <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Salı</span>
                          <span className={`text-xs font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded shadow-sm ${isDark ? "text-indigo-400" : "text-indigo-750"}`}>08:00 - 17:00 (Sabah Vardiyası)</span>
                        </div>
                        <div className={`flex justify-between items-center p-3 border rounded-xl shadow-sm ${
                          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150"
                        }`}>
                          <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Çarşamba</span>
                          <span className={`text-xs font-bold border px-2 py-0.5 rounded ${
                            isDark ? "border-slate-800 text-slate-400 bg-slate-900" : "border-slate-200 text-slate-500 bg-slate-100"
                          }`}>İzinli (Haftalık Tatil)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-between items-center border-t pt-6 relative z-10 ${isDark ? "border-slate-900" : "border-slate-200"}`}>
                  <span className={`text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-450"}`}>#ShiftScheduler #Attendance</span>
                  <div className={`text-xs font-extrabold ${isDark ? "text-slate-500" : "text-slate-450"}`}>🏢 seedhr.com.tr</div>
                </div>
              </div>
            </div>
          )}

          {/* BANNER 7: BORDRO & MAAŞ */}
          {(activeCategory === "all" || activeCategory === "hr") && (
            <div className="flex flex-col items-center gap-2">

              <div className={`w-[1200px] h-[630px] rounded-3xl border relative overflow-hidden flex flex-col justify-between p-12 shrink-0 select-none transition-all duration-300 ${
                isDark 
                  ? "bg-slate-950 border-slate-850 text-white shadow-2xl" 
                  : "bg-white border-slate-200/80 text-slate-900 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.09),_0_20px_50px_rgba(99,102,241,0.03)] border-slate-200"
              }`}
                style={{ backgroundImage: isDark ? "radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 60%)" : "radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.04) 0%, transparent 60%)" }}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MClMLjUuNUgwVjQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoOTksMTAyLDI0MSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSurlowiZ3JpZCkiLz48L3N2Zz4=')] pointer-events-none opacity-40" />

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="SeedHR Logo" className="h-10 w-10 object-contain rounded-xl shadow-sm" />
                    <span className={`font-extrabold text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Seed<span className="text-indigo-500">HR</span></span>
                  </div>
                  <span className={`text-xs font-bold border px-3 py-1 rounded-md ${isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50/80 border border-indigo-100 text-indigo-700 shadow-sm"}`}>Modül 04: Bordro & Maaş</span>
                </div>

                <div className="grid grid-cols-12 gap-8 items-center relative z-10 my-auto">
                  <div className="col-span-5 space-y-6">
                    <h2 className={`text-4xl font-extrabold leading-[1.2] tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      Otomatik Bordro ve <br /> <span className="bg-gradient-to-r from-emerald-500 to-indigo-700 bg-clip-text text-transparent">Hatasız Maaş</span> <br /> Hesaplama Hızı
                    </h2>
                    <p className={`text-sm leading-relaxed font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Çalışanların temel maaşlarına prim, mesai ve sosyal yardımları ekleyin; devamsızlık kesintilerini otomatik yansıtarak kurumsal bordroları saniyeler içinde hazırlayın.
                    </p>
                  </div>

                  <div className="col-span-7 flex justify-end">
                    <div className={`w-[580px] rounded-2xl border p-6 shadow-2xl space-y-4 ${
                      isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className={`flex justify-between items-center border-b pb-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Maaş Detayı (Haziran 2026)</span>
                        <span className="text-[10px] text-slate-500">Bordro Taslağı</span>
                      </div>
                      
                      <div className="space-y-2.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className={`font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Temel Net Maaş</span>
                          <span className={`font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>₺42.500</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                          <span className={`font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Fazla Mesai Kazancı (4 Saat)</span>
                          <span className={`font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>₺2.400</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                          <span className={`font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Mazeret İzni Kesintisi (1 Gün)</span>
                          <span className="font-extrabold text-rose-600">-₺1.500</span>
                        </div>
                        
                        <div className={`border-t pt-2.5 flex justify-between text-sm font-extrabold text-indigo-500 ${isDark ? "border-slate-850" : "border-slate-200"}`}>
                          <span>Ödenecek Net Tutar</span>
                          <span>₺43.400</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-between items-center border-t pt-6 relative z-10 ${isDark ? "border-slate-900" : "border-slate-200"}`}>
                  <span className={`text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-455"}`}>#PayrollManagement #FinTechHR</span>
                  <div className={`text-xs font-extrabold ${isDark ? "text-slate-500" : "text-slate-450"}`}>🏢 seedhr.com.tr</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CATEGORY: OPS (ORGANIZASYON & DONANIM) */}
          {/* ========================================================================= */}

          {/* BANNER 8: ZİMMET & VARLIK TAKİBİ */}
          {(activeCategory === "all" || activeCategory === "ops") && (
            <div className="flex flex-col items-center gap-2">

              <div className={`w-[1200px] h-[630px] rounded-3xl border relative overflow-hidden flex flex-col justify-between p-12 shrink-0 select-none transition-all duration-300 ${
                isDark 
                  ? "bg-slate-950 border-slate-850 text-white shadow-2xl" 
                  : "bg-white border-slate-200/80 text-slate-900 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.09),_0_20px_50px_rgba(99,102,241,0.03)] border-slate-200"
              }`}
                style={{ backgroundImage: isDark ? "radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)" : "radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.07) 0%, transparent 60%)" }}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MClMLjUuNUgwVjQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoOTksMTAyLDI0MSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSurlowiZ3JpZCkiLz48L3N2Zz4=')] pointer-events-none opacity-40" />

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="SeedHR Logo" className="h-10 w-10 object-contain rounded-xl shadow-sm" />
                    <span className={`font-extrabold text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Seed<span className="text-indigo-500">HR</span></span>
                  </div>
                  <span className={`text-xs font-bold border px-3 py-1 rounded-md ${isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50/80 border border-indigo-100 text-indigo-700 shadow-sm"}`}>Modül 05: Zimmet & Varlık</span>
                </div>

                <div className="grid grid-cols-12 gap-8 items-center relative z-10 my-auto">
                  <div className="col-span-5 space-y-6">
                    <h2 className={`text-4xl font-extrabold leading-[1.2] tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      Envanter ve <br /> <span className="bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent">Zimmet Yönetimi</span> <br /> Güven Altında
                    </h2>
                    <p className={`text-sm leading-relaxed font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Çalışanlara verilen bilgisayar, telefon, tablet, lisans ve kart gibi envanterlerin seri numarası ve zimmet kayıtlarını tek panelden organize edin.
                    </p>
                  </div>

                  <div className="col-span-7 flex justify-end">
                    <div className={`w-[580px] rounded-2xl border p-6 shadow-2xl space-y-4 ${
                      isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className={`flex justify-between items-center border-b pb-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Zimmetli Cihazlar</span>
                        <span className="text-[10px] text-emerald-600 font-bold">98 Toplam Donanım</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className={`p-3 border rounded-xl flex items-center justify-between shadow-sm ${
                          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150"
                        }`}>
                          <div>
                            <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>MacBook Pro M3</h4>
                            <p className="text-[9px] text-slate-550 font-semibold">Seri No: SN-9382-M3 • Bilgisayar</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${isDark ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-50 text-indigo-700"}`}>Can Demir'de</span>
                        </div>
                        <div className={`p-3 border rounded-xl flex items-center justify-between shadow-sm ${
                          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150"
                        }`}>
                          <div>
                            <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>iPhone 15 Pro</h4>
                            <p className="text-[9px] text-slate-550 font-semibold">Seri No: SN-2938-I15 • Telefon</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${isDark ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-50 text-indigo-700"}`}>Elif Kaya'da</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-between items-center border-t pt-6 relative z-10 ${isDark ? "border-slate-900" : "border-slate-200"}`}>
                  <span className={`text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-450"}`}>#AssetTracking #InventoryManagement</span>
                  <div className={`text-xs font-extrabold ${isDark ? "text-slate-500" : "text-slate-450"}`}>🏢 seedhr.com.tr</div>
                </div>
              </div>
            </div>
          )}

          {/* BANNER 9: DOKÜMAN YÖNETİMİ */}
          {(activeCategory === "all" || activeCategory === "ops") && (
            <div className="flex flex-col items-center gap-2">

              <div className={`w-[1200px] h-[630px] rounded-3xl border relative overflow-hidden flex flex-col justify-between p-12 shrink-0 select-none transition-all duration-300 ${
                isDark 
                  ? "bg-slate-950 border-slate-850 text-white shadow-2xl" 
                  : "bg-white border-slate-200/80 text-slate-900 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.09),_0_20px_50px_rgba(99,102,241,0.03)] border-slate-200"
              }`}
                style={{ backgroundImage: isDark ? "radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 60%)" : "radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.07) 0%, transparent 60%)" }}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MClMLjUuNUgwVjQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoOTksMTAyLDI0MSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSurlowiZ3JpZCkiLz48L3N2Zz4=')] pointer-events-none opacity-40" />

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="SeedHR Logo" className="h-10 w-10 object-contain rounded-xl shadow-sm" />
                    <span className={`font-extrabold text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Seed<span className="text-indigo-500">HR</span></span>
                  </div>
                  <span className={`text-xs font-bold border px-3 py-1 rounded-md ${isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50/80 border border-indigo-100 text-indigo-700 shadow-sm"}`}>Modül 06: Doküman Yönetimi</span>
                </div>

                <div className="grid grid-cols-12 gap-8 items-center relative z-10 my-auto">
                  <div className="col-span-5 space-y-6">
                    <h2 className={`text-4xl font-extrabold leading-[1.2] tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      Güvenli, Düzenli ve <br /> <span className="bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent">KVKK Uyumlu</span> <br /> Dijital Arşiv
                    </h2>
                    <p className={`text-sm leading-relaxed font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Sözleşmeler, kimlik belgeleri, sertifikalar ve sağlık raporlarını dijital klasörlerde depolayın. Süresi dolmak üzere olan belgeler için otomatik uyarılar alın.
                    </p>
                  </div>

                  <div className="col-span-7 flex justify-end">
                    <div className={`w-[580px] rounded-2xl border p-6 shadow-2xl space-y-4 ${
                      isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className={`flex justify-between items-center border-b pb-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Belge Deposu</span>
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${isDark ? "text-indigo-400" : "text-indigo-650"}`}><Lock size={10} /> Şifreli Depolama</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className={`p-3 border rounded-xl flex items-center justify-between shadow-sm ${
                          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150"
                        }`}>
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-indigo-500" />
                            <div>
                              <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>İş Sözleşmesi - Can Demir.pdf</h4>
                              <p className="text-[9px] text-slate-500">Sözleşmeler Klasörü • 2.4 MB</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Görüntüle</span>
                        </div>
                        
                        <div className={`p-3 border rounded-xl flex items-center justify-between shadow-sm ${
                          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150"
                        }`}>
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-indigo-500" />
                            <div>
                              <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Sağlık Raporu - Elif Kaya.pdf</h4>
                              <p className="text-[9px] text-slate-500">Sağlık Raporları Klasörü • 1.1 MB</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-rose-500 font-bold animate-pulse">Yenilenmeli!</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-between items-center border-t pt-6 relative z-10 ${isDark ? "border-slate-900" : "border-slate-200"}`}>
                  <span className={`text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-450"}`}>#DocumentManagement #KVKKCompliance</span>
                  <div className={`text-xs font-extrabold ${isDark ? "text-slate-500" : "text-slate-450"}`}>🏢 seedhr.com.tr</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CATEGORY: CULTURE (KÜLTÜR & ETKİLEŞİM) */}
          {/* ========================================================================= */}

          {/* BANNER 10: DUYURU & ŞİRKET İLETİŞİMİ */}
          {(activeCategory === "all" || activeCategory === "culture") && (
            <div className="flex flex-col items-center gap-2">

              <div className={`w-[1200px] h-[630px] rounded-3xl border relative overflow-hidden flex flex-col justify-between p-12 shrink-0 select-none transition-all duration-300 ${
                isDark 
                  ? "bg-slate-950 border-slate-850 text-white shadow-2xl" 
                  : "bg-white border-slate-200/80 text-slate-900 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.09),_0_20px_50px_rgba(99,102,241,0.03)] border-slate-200"
              }`}
                style={{ backgroundImage: isDark ? "radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)" : "radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.07) 0%, transparent 60%)" }}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MClMLjUuNUgwVjQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoOTksMTAyLDI0MSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSurlowiZ3JpZCkiLz48L3N2Zz4=')] pointer-events-none opacity-40" />

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="SeedHR Logo" className="h-10 w-10 object-contain rounded-xl shadow-sm" />
                    <span className={`font-extrabold text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Seed<span className="text-indigo-500">HR</span></span>
                  </div>
                  <span className={`text-xs font-bold border px-3 py-1 rounded-md ${isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50/80 border border-indigo-100 text-indigo-700 shadow-sm"}`}>Modül 07: Duyuru Yönetimi</span>
                </div>

                <div className="grid grid-cols-12 gap-8 items-center relative z-10 my-auto">
                  <div className="col-span-5 space-y-6">
                    <h2 className={`text-4xl font-extrabold leading-[1.2] tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      Şirket Duyuruları ve <br /> <span className="bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent">İç İletişim</span> <br /> Paneli ile Bağ Kurun
                    </h2>
                    <p className={`text-sm leading-relaxed font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Şirket içi etkinlikleri, önemli duyuruları ve idari bültenleri tek kanaldan tüm çalışanlara ulaştırın. İletişim kopukluklarını ortadan kaldırın.
                    </p>
                  </div>

                  <div className="col-span-7 flex justify-end">
                    <div className={`w-[580px] rounded-2xl border p-6 shadow-2xl space-y-4 ${
                      isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className={`flex justify-between items-center border-b pb-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Duyuru Panosu</span>
                        <span className="text-[10px] text-slate-500">Şirket Akışı</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className={`p-3 border rounded-xl space-y-1.5 shadow-sm ${isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150"}`}>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-indigo-650 font-bold bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded shadow-sm">Etkinlik 🎉</span>
                            <span className="text-[9px] text-slate-500 font-medium">12.06.2026</span>
                          </div>
                          <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Yaz Pikniği ve Barbekü Günü</h4>
                          <p className={`text-[10px] leading-relaxed font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Tüm ekibimizle 20 Haziran Cumartesi günü Belgrad Ormanı'nda bir araya geliyoruz. Detaylar mail grubunda!</p>
                        </div>

                        <div className={`p-3 border rounded-xl space-y-1.5 shadow-sm ${isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150"}`}>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded shadow-sm">Genel 📢</span>
                            <span className="text-[9px] text-slate-500 font-medium">09.06.2026</span>
                          </div>
                          <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>SeedHR Yeni Arayüz Güncellemesi v2.0</h4>
                          <p className={`text-[10px] leading-relaxed font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>İç sistemimizin yeni sürümü yayına girdi. Yapay zeka modülü testlerinizi gerçekleştirebilirsiniz.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-between items-center border-t pt-6 relative z-10 ${isDark ? "border-slate-900" : "border-slate-200"}`}>
                  <span className={`text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-455"}`}>#InternalCommunications #CompanyCulture</span>
                  <div className={`text-xs font-extrabold ${isDark ? "text-slate-500" : "text-slate-455"}`}>🏢 seedhr.com.tr</div>
                </div>
              </div>
            </div>
          )}

          {/* BANNER 11: PERFORMANS & HEDEF YÖNETİMİ */}
          {(activeCategory === "all" || activeCategory === "culture") && (
            <div className="flex flex-col items-center gap-2">

              <div className={`w-[1200px] h-[630px] rounded-3xl border relative overflow-hidden flex flex-col justify-between p-12 shrink-0 select-none transition-all duration-300 ${
                isDark 
                  ? "bg-slate-950 border-slate-850 text-white shadow-2xl" 
                  : "bg-white border-slate-200/80 text-slate-900 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.09),_0_20px_50px_rgba(99,102,241,0.03)] border-slate-200"
              }`}
                style={{ backgroundImage: isDark ? "radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)" : "radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.07) 0%, transparent 60%)" }}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MClMLjUuNUgwVjQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoOTksMTAyLDI0MSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSurlowiZ3JpZCkiLz48L3N2Zz4=')] pointer-events-none opacity-40" />

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="SeedHR Logo" className="h-10 w-10 object-contain rounded-xl shadow-sm" />
                    <span className={`font-extrabold text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Seed<span className="text-indigo-500">HR</span></span>
                  </div>
                  <span className={`text-xs font-bold border px-3 py-1 rounded-md ${isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50/80 border border-indigo-100 text-indigo-700 shadow-sm"}`}>Modül 08: Performans Değerlendirme</span>
                </div>

                <div className="grid grid-cols-12 gap-8 items-center relative z-10 my-auto">
                  <div className="col-span-5 space-y-6">
                    <h2 className={`text-4xl font-extrabold leading-[1.2] tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      Hedef Odaklı <br /> <span className="bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent">Performans ve OKR</span> <br /> Takip Altyapısı
                    </h2>
                    <p className={`text-sm leading-relaxed font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Çalışanlarınız için ölçülebilir hedefler atayın, performans puanları verin. Yapay zeka ile otomatik gelişim bildirimleri hazırlayıp geri bildirim sürecini güçlendirin.
                    </p>
                  </div>

                  <div className="col-span-7 flex justify-end">
                    <div className={`w-[580px] rounded-2xl border p-6 shadow-2xl space-y-4 ${
                      isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className={`flex justify-between items-center border-b pb-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Aktif Performans Hedefleri</span>
                        <span className="text-[10px] text-indigo-500 font-bold">Umut Aksoy</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className={`${isDark ? "text-slate-350" : "text-slate-700"}`}>Sistem Entegrasyonları ve Geliştirme</span>
                            <span className="text-indigo-500 font-extrabold">92%</span>
                          </div>
                          <div className={`h-2 w-full border rounded-full overflow-hidden ${isDark ? "bg-slate-950 border-slate-900" : "bg-slate-100 border-slate-200 shadow-inner"}`}>
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: "92%" }} />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className={`${isDark ? "text-slate-350" : "text-slate-700"}`}>Performans Değerlendirme Süreçleri</span>
                            <span className="text-indigo-500 font-extrabold">75%</span>
                          </div>
                          <div className={`h-2 w-full border rounded-full overflow-hidden ${isDark ? "bg-slate-950 border-slate-900" : "bg-slate-100 border-slate-200 shadow-inner"}`}>
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: "75%" }} />
                          </div>
                        </div>

                        <div className={`p-3 border rounded-xl mt-2 flex items-start gap-2 ${
                          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150 shadow-sm"
                        }`}>
                          <Brain size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                          <p className={`text-[10px] leading-normal font-bold ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                            <strong>Yapay Zeka Performans Notu:</strong> "Çalışanımız sistem entegrasyonlarında ve veri yönetimi süreçlerinde yüksek başarı sergilemiştir. Planlanan takvime uygun ilerlemektedir."
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex justify-between items-center border-t pt-6 relative z-10 ${isDark ? "border-slate-900" : "border-slate-200"}`}>
                  <span className={`text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-450"}`}>#PerformanceGoals #OKRPlanning</span>
                  <div className={`text-xs font-extrabold ${isDark ? "text-slate-500" : "text-slate-450"}`}>🏢 seedhr.com.tr</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
