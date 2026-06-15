"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import Link from "next/link";
import {
  Brain,
  Users,
  CalendarRange,
  DollarSign,
  Laptop,
  Rocket,
  ShieldCheck,
  Sparkles,
  Clock,
  ArrowRight,
  Sun,
  Moon,
  Menu,
  X,
  UserCheck,
  Building2,
  Smile,
  Heart,
  Zap,
  CheckCircle,
  FileText,
  Shield,
  Layers,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { currentUser, theme, setTheme, checkAuth } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeModule, setActiveModule] = useState<"personel" | "izin" | "vardiya" | "bordro" | "zimmet">("personel");

  useEffect(() => {
    checkAuth();
    setMounted(true);
  }, []);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    if (!mounted) return;

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -50px 0px", // Trigger slightly before element leaves viewport
      threshold: 0.05,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          // Stop observing once visible to optimize scroll performance
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => {
        try { observer.unobserve(el); } catch (e) { }
      });
    };
  }, [mounted, activeModule]); // Re-observe when mounted or activeModule changes

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950 text-slate-400 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
          <span className="text-xs">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans antialiased text-slate-800 dark:text-zinc-200 transition-colors duration-300 overflow-x-hidden">

      {/* Local custom style injection for scroll-reveal */}
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-left {
          opacity: 0;
          transform: translateX(-24px);
          transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-left.active {
          opacity: 1;
          transform: translateX(0);
        }
        .reveal-right {
          opacity: 0;
          transform: translateX(24px);
          transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-right.active {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>

      {/* --- BACKGROUND GLOWS --- */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-[800px] right-1/4 w-[500px] h-[500px] bg-violet-500/5 dark:bg-violet-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* --- NAVIGATION HEADER (Kolay IK Style) --- */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 dark:bg-zinc-950/90 border-b border-slate-100 dark:border-zinc-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo (Modified to use icon.png) */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
              <img src="/icon.png" alt="SeedHR Logo" className="h-8 w-8 object-contain rounded-lg shadow-sm" />
              <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                Seed<span className="text-indigo-600 dark:text-indigo-400">HR</span>
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("moduller")}
                className="text-xs font-bold text-slate-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                Modüllerimiz
              </button>
              <button
                onClick={() => scrollToSection("yapay-zeka")}
                className="text-xs font-bold text-slate-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                Yapay Zeka
              </button>
              <button
                onClick={() => scrollToSection("guvenlik")}
                className="text-xs font-bold text-slate-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                Güvenlik & KVKK
              </button>
            </nav>

            {/* CTA + Theme Toggle */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
                title="Tema Değiştir"
              >
                {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
              </button>

              {currentUser && (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 px-4 py-2 text-xs font-bold text-white dark:text-slate-950 transition-all shadow-sm cursor-pointer animate-in fade-in duration-300"
                >
                  Yönetim Paneli <ArrowRight size={12} />
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
              >
                {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-zinc-950/95 border-b border-slate-100 dark:border-zinc-900 absolute top-16 left-0 right-0 z-50 p-6 space-y-4 shadow-lg backdrop-blur-lg animate-in fade-in slide-in-from-top-5 duration-200">
          <button
            onClick={() => scrollToSection("moduller")}
            className="block w-full text-left py-2 text-xs font-bold text-slate-600 dark:text-zinc-300"
          >
            Modüllerimiz
          </button>
          <button
            onClick={() => scrollToSection("yapay-zeka")}
            className="block w-full text-left py-2 text-xs font-bold text-slate-600 dark:text-zinc-300"
          >
            Yapay Zeka
          </button>
          <button
            onClick={() => scrollToSection("guvenlik")}
            className="block w-full text-left py-2 text-xs font-bold text-slate-600 dark:text-zinc-300"
          >
            Güvenlik & KVKK
          </button>
          {currentUser && (
            <div className="border-t border-slate-100 dark:border-zinc-800 pt-4">
              <Link
                href="/dashboard"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white py-2.5 text-xs font-bold text-white dark:text-slate-950"
              >
                Yönetim Paneli <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="reveal inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/30 dark:border-indigo-900/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
            <Zap size={10} className="fill-indigo-600 dark:fill-indigo-400 animate-bounce" />
            Excel Sayfalarına Veda Edin
          </div>

          {/* Heading */}
          <h1 className="reveal text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]" style={{ transitionDelay: "100ms" }}>
            İnsan Kaynakları Yönetimini <br />
            <span className="text-indigo-600 dark:text-indigo-400">Kolaylaştırın</span>
          </h1>

          {/* Subtext */}
          <p className="reveal text-sm sm:text-base text-slate-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed font-medium" style={{ transitionDelay: "200ms" }}>
            SeedHR; ekibinizin izin taleplerini, vardiya çalışma planlarını, özlük dosyalarını ve varlık zimmetlerini tek bir pratik ekranda birleştirir. Hiçbir kurulum veya teknik karmaşa yaşamadan hemen kullanmaya başlayın.
          </p>

          {/* Buttons */}
          <div className="reveal flex flex-col sm:flex-row gap-3 justify-center items-center pt-4" style={{ transitionDelay: "300ms" }}>
            <button
              onClick={() => scrollToSection("moduller")}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:-translate-y-0.5 transition-all cursor-pointer duration-200"
            >
              Uygulamayı İnceleyin
            </button>

            {currentUser && (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-white font-bold text-xs rounded-xl shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer duration-200"
              >
                Yönetim Paneline Git
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* --- INTERACTIVE MODULE EXPLORER --- */}
      <section id="moduller" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-zinc-900">
        <div className="reveal text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">SEEDHR UYGULAMALARI</h2>
          <p className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Tüm İK İhtiyaçlarınız İçin Tek Çözüm
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
            Farklı modüller arasında kaybolmayın. Her aşama birbiriyle tam entegre çalışır.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="reveal flex flex-wrap justify-center gap-2 mb-10 max-w-4xl mx-auto" style={{ transitionDelay: "100ms" }}>
          {[
            { id: "personel", label: "Personel & Özlük", icon: <Users size={13} /> },
            { id: "izin", label: "İzin & Devamsızlık", icon: <CalendarRange size={13} /> },
            { id: "vardiya", label: "Vardiya & Puantaj", icon: <Clock size={13} /> },
            { id: "bordro", label: "Bordro & Maaş", icon: <DollarSign size={13} /> },
            { id: "zimmet", label: "Zimmet & Varlık", icon: <Laptop size={13} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveModule(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer duration-200 ${activeModule === tab.id
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10"
                  : "bg-white border-slate-200/60 dark:bg-zinc-900 dark:border-zinc-800 text-slate-600 hover:border-slate-300 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Interactive Window Block */}
        <div className="max-w-5xl mx-auto bg-slate-50/50 dark:bg-zinc-900/10 border border-slate-100 dark:border-zinc-900 rounded-3xl p-6 sm:p-8 min-h-[360px] flex flex-col justify-between transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Column (Benefits) */}
            <div className="reveal-left lg:col-span-5 space-y-5">
              {activeModule === "personel" && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md">MODÜL 01</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dijital Özlük Dosyaları</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                    Çalışanlarınızın sözleşme, adres, iletişim ve acil durum bilgilerini güvenli bir şekilde tek bir dijital klasörde saklayın. Dosya yığınlarından kurtulun.
                  </p>
                  <ul className="space-y-2.5 pt-2">
                    {["KVKK uyumlu güvenli veri saklama", "Organizasyon şeması ile hiyerarşi takibi", "Hızlı yeni çalışan kartı oluşturma"].map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
                        <CheckCircle size={14} className="text-indigo-600 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeModule === "izin" && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md">MODÜL 02</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">İzin Yönetimi</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                    Yıllık izin, mazeret izni ve rapor taleplerini personeller online oluşturur. Yöneticiler tek tıkla onaylar ve kalan bakiye otomatik düşer.
                  </p>
                  <ul className="space-y-2.5 pt-2">
                    {["Talep onay süreçlerini özelleştirme", "İzin çakışmalarını önleyen takvim", "Rapor ve hastalık izinleri bildirimi"].map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
                        <CheckCircle size={14} className="text-indigo-600 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeModule === "vardiya" && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md">MODÜL 03</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Vardiya & Puantaj</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                    Esnek çalışma planlarını, sabah/akşam veya gece vardiyalarını hatasız planlayın. Çalışanların devamsızlık ve puantaj durumlarını anlık görün.
                  </p>
                  <ul className="space-y-2.5 pt-2">
                    {["Dinamik vardiya çizelgesi hazırlama", "Mola ve fazla mesai saatleri takibi", "Puantaj çizelgelerini Excel'e aktarma"].map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
                        <CheckCircle size={14} className="text-indigo-600 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeModule === "bordro" && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md">MODÜL 04</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Maaş & Bordro Hesaplama</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                    Temel maaşlara mesai, prim ve sosyal yardımları ekleyin; izin kesintilerini otomatik yansıtarak kurumsal bordro taslaklarınızı saniyeler içinde hazırlayın.
                  </p>
                  <ul className="space-y-2.5 pt-2">
                    {["Maaş, prim ve prim ekleme formları", "Devamsızlık ve mazeret kesintileri", "Dönem bazlı toplu maaş listeleme"].map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
                        <CheckCircle size={14} className="text-indigo-600 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeModule === "zimmet" && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md">MODÜL 05</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Zimmet & Varlık Takibi</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                    Çalışanlara verilen bilgisayar, telefon, tablet, araç ve kart gibi tüm envanterleri zimmetleyin. Envanter durumunu ve değerini tek yerden görün.
                  </p>
                  <ul className="space-y-2.5 pt-2">
                    {["Seri numarası ve marka bazlı envanter", "Varlıkların kullanım durumları", "Hasarlı veya iade edilen ürün takibi"].map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
                        <CheckCircle size={14} className="text-indigo-600 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column (Widget) */}
            <div className="reveal-right lg:col-span-7 bg-white dark:bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-zinc-900 shadow-sm relative overflow-hidden min-h-[280px] flex flex-col justify-between">
              {activeModule === "personel" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-zinc-900/60 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aktif Çalışanlar</span>
                    <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold">128 Toplam</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "Selim Aksoy", pos: "Genel Müdür", email: "selim.aksoy@seedhr.com.tr", init: "SA" },
                      { name: "Elif Kaya", pos: "İK Müdürü", email: "elif.kaya@seedhr.com.tr", init: "EK" },
                      { name: "Can Demir", pos: "Yazılım Uzmanı", email: "can.demir@seedhr.com.tr", init: "CD" },
                    ].map((user, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-900/60">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-[10px] font-bold text-indigo-600 uppercase">{user.init}</div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-[9px] text-slate-400">{user.pos} • {user.email}</p>
                          </div>
                        </div>
                        <span className="text-[9px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded font-bold">Aktif</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModule === "izin" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-zinc-900/60 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">İzin Bakiyeleri</span>
                    <span className="text-[9px] text-slate-400">Yıllık İzin (2026)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Tanımlanan İzin", value: "14 Gün", color: "text-slate-800" },
                      { label: "Kullanılan İzin", value: "4 Gün", color: "text-rose-500" },
                      { label: "Kalan İzin", value: "10 Gün", color: "text-indigo-600" },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-900 rounded-xl text-center">
                        <p className="text-[9px] text-slate-400 font-medium mb-1">{item.label}</p>
                        <p className={`text-base font-extrabold ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl flex items-center justify-between animate-pulse">
                    <div>
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Yeni İzin Talebi Gönderildi</p>
                      <p className="text-[9px] text-emerald-600">15 - 19 Haziran • 4 gün</p>
                    </div>
                    <span className="text-[9px] bg-emerald-500 text-white font-bold px-2.5 py-0.5 rounded-md">Talep Gönderildi</span>
                  </div>
                </div>
              )}

              {activeModule === "vardiya" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-zinc-900/60 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Haftalık Vardiya Çizelgesi</span>
                    <span className="text-[9px] text-indigo-600 font-bold">Planlama Aktif</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { day: "Pazartesi", shift: "Sabah Vardiyası (08:00 - 17:00)", color: "border-indigo-500 bg-indigo-50/20 text-indigo-600" },
                      { day: "Salı", shift: "Sabah Vardiyası (08:00 - 17:00)", color: "border-indigo-500 bg-indigo-50/20 text-indigo-600" },
                      { day: "Çarşamba", shift: "İzinli (Haftalık İzin)", color: "border-slate-300 bg-slate-50 text-slate-500" },
                    ].map((v, i) => (
                      <div key={i} className={`p-2.5 rounded-xl border-l-4 border ${v.color} flex justify-between items-center`}>
                        <span className="text-xs font-bold">{v.day}</span>
                        <span className="text-[10px] font-medium">{v.shift}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModule === "bordro" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-zinc-900/60 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maaş Bordrosu Detayları</span>
                    <span className="text-[9px] text-slate-400">Dönem: Haziran 2026</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { title: "Net Temel Maaş", val: "₺42.500" },
                      { title: "Fazla Mesai Kazancı (4 saat)", val: "₺2.400" },
                      { title: "Mazeret İzni Kesintisi (1 Gün)", val: "-₺1.500" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 dark:text-zinc-400">{item.title}</span>
                        <span className="font-bold text-slate-800 dark:text-white">{item.val}</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-100 dark:border-zinc-900 pt-2 flex justify-between items-center text-sm font-bold text-indigo-600">
                      <span>Ödenecek Net Tutar</span>
                      <span>₺43.400</span>
                    </div>
                  </div>
                </div>
              )}

              {activeModule === "zimmet" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-zinc-900/60 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zimmet Envanteri</span>
                    <span className="text-[9px] text-emerald-600 font-bold">98 Toplam Zimmet</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { item: "MacBook Pro M3", type: "Bilgisayar", serial: "SN-9382-M3", status: "Kullanımda" },
                      { item: "iPhone 15 Pro", type: "Telefon", serial: "SN-2938-I15", status: "Kullanımda" },
                      { item: "Dell 27\" Monitör", type: "Ekipman", serial: "SN-1029-MON", status: "Kayıp/Hasarlı" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-900/60">
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{item.item}</p>
                          <p className="text-[9px] text-slate-400">{item.type} • {item.serial}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${item.status === "Kullanımda" ? "bg-indigo-50 text-indigo-600" : "bg-rose-50 text-rose-600"
                          }`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 text-slate-400 text-[8px] text-right font-medium">
                * SeedHR Canlı Sistem Simülasyonu
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- BENEFITS GRID --- */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="reveal-left space-y-6">
            <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">NEDEN BİZİ SEÇMELİSİNİZ?</h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Tüm Ekip Bilgileri Tek Bir Güvenli Çatıda
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
              Geleneksel İK süreçleri e-postalar, Excel tabloları, kağıt formlar ve WhatsApp mesajları arasında kaybolur. SeedHR ile hepsi entegre çalışır. Bir çalışan izin aldığında, o günkü vardiyası güncellenir ve maaş bordrosu taslağı anında yansır.
            </p>

            <div className="space-y-4 pt-2">
              {[
                { title: "Kullanım Kolaylığı", desc: "Zorlu eğitimler veya teknik jargona gerek yoktur. Herkesin ilk andan itibaren neyi nerede bulacağını bildiği sade arayüz." },
                { title: "Esnek Modüler Yapı", desc: "Sadece ihtiyacınız olan modülleri kullanın. Şirketinizin büyüklüğüne göre süreçleri dilediğiniz gibi açıp kapatabilirsiniz." },
                { title: "Zaman ve Kaynak Tasarrufu", desc: "Manuel kontrolleri, izin onay bekleme süreçlerini ve vardiya hazırlama sürelerini %80'e varan oranda azaltın." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="h-5 w-5 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                    <Heart size={12} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (Illustration comparison) */}
          <div className="reveal-right p-8 rounded-3xl bg-slate-50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-900 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">SeedHR ile Neler Değişiyor?</h3>
            <div className="space-y-4">
              <div className="flex gap-3 items-start p-4 bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 rounded-2xl hover:shadow-sm transition-shadow">
                <div className="h-6 w-6 rounded bg-rose-50 flex items-center justify-center text-rose-500 font-extrabold text-xs shrink-0">X</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">Öncesi (Karmaşa ve Zaman Kaybı)</h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed font-medium">
                    Kaybolan izin dilekçeleri, kimin hangi gün çalışacağını unutulan Excel listeleri ve her ay tekrarlanan hesaplama hataları.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start p-4 bg-gradient-to-br from-indigo-50 to-indigo-50/20 dark:from-indigo-950/20 dark:to-zinc-950 border border-indigo-100/30 dark:border-indigo-900/40 rounded-2xl hover:shadow-sm transition-all duration-200">
                <div className="h-6 w-6 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-xs shrink-0">✓</div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-400">Sonrası (SeedHR ile Düzen ve Güven)</h4>
                  <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 mt-0.5 leading-relaxed font-medium">
                    Tek bir merkezden saniyeler içinde onaylanan izinler, otomatik hesaplanan haklar ve her yerden erişilebilen dijital arşiv.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- AI FEATURES HIGHLIGHTS --- */}
      <section id="yapay-zeka" className="relative py-20 md:py-28 bg-slate-900 dark:bg-zinc-900/30 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              <Brain size={12} className="text-indigo-400 animate-pulse" />
              YAPAY ZEKA DESTEĞİ
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold">
              Akıllı İK Asistanı ile Süreçleri Hızlandırın
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 dark:text-zinc-400 font-medium">
              SeedAI altyapımız, manuel yürüttüğünüz analizleri saniyeler içinde tamamlayarak iş yükünüzü hafifletir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Akıllı Özgeçmiş Eşleme",
                desc: "İşe alım aşamasında, adayların yetkinliklerini pozisyon kriterlerinizle karşılaştırarak size bir uygunluk eşleşme skoru belirler.",
                icon: <Sparkles className="text-indigo-400" size={18} />,
                delay: "0ms"
              },
              {
                title: "Gelişim Notu Hazırlama",
                desc: "Yöneticiler tarafından girilen puanları okuyarak, çalışanlarınız için yapıcı ve yol gösterici performans geri bildirimleri yazar.",
                icon: <Smile className="text-violet-400" size={18} />,
                delay: "100ms"
              },
              {
                title: "Sohbet Robotu Asistanı",
                desc: "Çalışanların vardiya, kalan izin veya şirket kuralları gibi tüm sorularına 7/24 anında yanıt üreten entegre sohbet yardımcısı.",
                icon: <Zap className="text-emerald-400" size={18} />,
                delay: "200ms"
              },
            ].map((ai, idx) => (
              <div
                key={idx}
                className="reveal p-6 rounded-2xl bg-slate-950/60 dark:bg-zinc-950/40 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300"
                style={{ transitionDelay: ai.delay }}
              >
                <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center mb-4 border border-slate-800">
                  {ai.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{ai.title}</h3>
                <p className="text-xs text-slate-400 dark:text-zinc-400 leading-relaxed font-medium">{ai.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECURITY & KVKK COMPLIANCE --- */}
      <section id="guvenlik" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="reveal-left lg:col-span-5 space-y-5">
            <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">GÜVENLİK</h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Verileriniz En Yüksek Standartlarda Korunur
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
              Çalışanlarınızın özlük bilgileri, sağlık verileri ve mali durumları KVKK gereksinimlerine göre en üst düzey güvenlik katmanlarıyla korunur. Veri tabanı erişimleri şifrelenmiş (SSL/TLS) bağlantılarla gerçekleşir.
            </p>
          </div>
          <div className="reveal-right lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <Shield className="text-indigo-600" size={18} />,
                title: "100% KVKK Uyumlu",
                desc: "Çalışan verilerini yasal düzenlemelere tam uyumlu olarak depolar ve korur.",
                delay: "0ms"
              },
              {
                icon: <FileText className="text-emerald-600" size={18} />,
                title: "Günlük Güvenli Yedekleme",
                desc: "Veri kaybını önlemek için bulut altyapımızda verileriniz her gün otomatik yedeklenir.",
                delay: "100ms"
              },
              {
                icon: <Layers className="text-violet-600" size={18} />,
                title: "Rol Bazlı Yetkilendirme",
                desc: "Sadece yetkisi olan yöneticiler hassas belgelere veya maaş detaylarına erişebilir.",
                delay: "200ms"
              },
              {
                icon: <Zap className="text-amber-600" size={18} />,
                title: "Kesintisiz Hizmet Süresi",
                desc: "Güçlü sunucu altyapımız ile 99.9% erişilebilirlik oranıyla hizmet veriyoruz.",
                delay: "300ms"
              },
            ].map((g, idx) => (
              <div key={idx} className="reveal p-5 bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-900 rounded-2xl flex gap-3 items-start transition-all duration-300" style={{ transitionDelay: g.delay }}>
                <div className="h-8 w-8 rounded-lg bg-white dark:bg-zinc-950 flex items-center justify-center shrink-0 border border-slate-200/40 dark:border-zinc-900">
                  {g.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">{g.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 leading-normal font-medium">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BOTTOM CTA --- */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-600 to-violet-700 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MClMLjUuNUgwVjQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10 pointer-events-none" />
        <div className="reveal relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold">Ekibinizi SeedHR ile Kolayca Yönetin</h2>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl mx-auto font-medium">
            Tüm İK ihtiyaçlarınızı tek bir pratik merkezden takip edin. Hızlı, güvenli, yapay zeka destekli ve son derece sade.
          </p>
          <div className="pt-2">
            {currentUser ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 px-8 py-3 text-xs font-bold text-indigo-700 transition-all shadow-lg cursor-pointer duration-200"
              >
                Yönetim Paneline Git <ArrowRight size={12} />
              </Link>
            ) : (
              <a
                href="mailto:seedhrms@outlook.com"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 px-8 py-3 text-xs font-bold text-indigo-700 transition-all shadow-lg cursor-pointer animate-pulse duration-200"
              >
                Bize Ulaşın <ArrowRight size={12} />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src="/icon.png" alt="SeedHR Logo" className="h-7 w-7 object-contain rounded-lg" />
              <span className="font-bold text-sm text-slate-800 dark:text-white">
                Seed<span className="text-indigo-600 dark:text-indigo-400">HR</span>
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                Gizlilik Politikası
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
              © {new Date().getFullYear()} SeedHR Inc. Tüm hakları saklıdır.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
