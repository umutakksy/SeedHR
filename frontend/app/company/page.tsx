"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import {
  mockDb,
  AnnouncementDto,
  UserDto,
  authAPI,
} from "@/lib/api";
import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Wind,
  Thermometer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Cake,
  PartyPopper,
  Users,
  Megaphone,
  ArrowRight,
  Clock,
  Star,
  Building2,
  Heart,
  Coffee,
  Utensils,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Gift,
  Briefcase,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { clsx } from "clsx";

// ─── Types ───────────────────────────────────────────
interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  description: string;
  icon: React.ReactNode;
}

interface CurrencyRates {
  USD: number;
  EUR: number;
  GBP: number;
  date: string;
}

interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
}

interface DailyQuote {
  text: string;
  author: string;
}

interface MenuItem {
  type: string;
  name: string;
  emoji: string;
}

// ─── Weather Helpers ─────────────────────────────────
const weatherDescriptions: Record<number, { text: string; icon: React.ReactNode }> = {
  0: { text: "Açık", icon: <Sun size={28} className="text-amber-400" /> },
  1: { text: "Parçalı Bulutlu", icon: <Sun size={28} className="text-amber-400" /> },
  2: { text: "Bulutlu", icon: <Cloud size={28} className="text-slate-400" /> },
  3: { text: "Kapalı", icon: <Cloud size={28} className="text-slate-500" /> },
  45: { text: "Sisli", icon: <CloudFog size={28} className="text-slate-400" /> },
  48: { text: "Dondurucu Sis", icon: <CloudFog size={28} className="text-blue-300" /> },
  51: { text: "Hafif Çisenti", icon: <CloudDrizzle size={28} className="text-blue-400" /> },
  53: { text: "Çisenti", icon: <CloudDrizzle size={28} className="text-blue-400" /> },
  55: { text: "Yoğun Çisenti", icon: <CloudDrizzle size={28} className="text-blue-500" /> },
  61: { text: "Hafif Yağmur", icon: <CloudRain size={28} className="text-blue-500" /> },
  63: { text: "Yağmurlu", icon: <CloudRain size={28} className="text-blue-600" /> },
  65: { text: "Şiddetli Yağmur", icon: <CloudRain size={28} className="text-blue-700" /> },
  71: { text: "Hafif Kar", icon: <CloudSnow size={28} className="text-blue-200" /> },
  73: { text: "Karlı", icon: <CloudSnow size={28} className="text-blue-300" /> },
  75: { text: "Yoğun Kar", icon: <CloudSnow size={28} className="text-blue-400" /> },
  95: { text: "Gök Gürültülü Fırtına", icon: <CloudLightning size={28} className="text-yellow-500" /> },
};

// ─── Daily Menu (mock) ─────────────────────────────
const getDailyMenu = (): MenuItem[] => {
  const dayIndex = new Date().getDay();
  const menus: MenuItem[][] = [
    [{ type: "Çorba", name: "Domates Çorbası", emoji: "🍅" }, { type: "Ana Yemek", name: "Karnıyarık", emoji: "🍆" }, { type: "Yan Yemek", name: "Pirinç Pilavı", emoji: "🍚" }, { type: "Tatlı", name: "Sütlaç", emoji: "🍮" }],
    [{ type: "Çorba", name: "Mercimek Çorbası", emoji: "🥣" }, { type: "Ana Yemek", name: "Tavuk Sote", emoji: "🍗" }, { type: "Yan Yemek", name: "Bulgur Pilavı", emoji: "🌾" }, { type: "Tatlı", name: "Meyve", emoji: "🍊" }],
    [{ type: "Çorba", name: "Ezogelin Çorbası", emoji: "🥘" }, { type: "Ana Yemek", name: "Köfte", emoji: "🥩" }, { type: "Yan Yemek", name: "Makarna", emoji: "🍝" }, { type: "Tatlı", name: "Baklava", emoji: "🍯" }],
    [{ type: "Çorba", name: "Tavuk Suyu Çorbası", emoji: "🐔" }, { type: "Ana Yemek", name: "Etli Güveç", emoji: "🥘" }, { type: "Yan Yemek", name: "Patates Püresi", emoji: "🥔" }, { type: "Tatlı", name: "Profiterol", emoji: "🍫" }],
    [{ type: "Çorba", name: "Yayla Çorbası", emoji: "🥛" }, { type: "Ana Yemek", name: "Kuzu Tandır", emoji: "🍖" }, { type: "Yan Yemek", name: "Sebzeli Pilav", emoji: "🥗" }, { type: "Tatlı", name: "Revani", emoji: "🍰" }],
    [{ type: "Çorba", name: "Tarhana Çorbası", emoji: "🫕" }, { type: "Ana Yemek", name: "Balık", emoji: "🐟" }, { type: "Yan Yemek", name: "Salata", emoji: "🥗" }, { type: "Tatlı", name: "Muhallebi", emoji: "🍮" }],
    [{ type: "Çorba", name: "Mantar Çorbası", emoji: "🍄" }, { type: "Ana Yemek", name: "Izgara Tavuk", emoji: "🍗" }, { type: "Yan Yemek", name: "Patates Kızartması", emoji: "🍟" }, { type: "Tatlı", name: "Dondurma", emoji: "🍦" }],
  ];
  return menus[dayIndex] || menus[0];
};

// ─── Quotes Fallback ─────────────────────────────────
const fallbackQuotes: DailyQuote[] = [
  { text: "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.", author: "Robert Collier" },
  { text: "Gelecek, bugün ne yaptığınıza bağlıdır.", author: "Mahatma Gandhi" },
  { text: "Başlamak için harika olmak zorunda değilsin, ama harika olmak için başlamalısın.", author: "Zig Ziglar" },
  { text: "Düşünceler kelime olur, kelimeler eylem olur, eylemler alışkanlık olur.", author: "Margaret Thatcher" },
  { text: "Her başarı hikayesi, başlama cesaretinin bir sonucudur.", author: "Sheldon Kopp" },
  { text: "İmkansız bir hedef yoktur, sadece imkansız süreler vardır.", author: "Robert Schuller" },
  { text: "Değişim acı verir, ama hiçbir şey olduğun yerde kalmak kadar acı vermez.", author: "Mandy Hale" },
];

export default function CompanyIntranetPage() {
  const router = useRouter();
  const { currentUser, theme, setTheme, checkAuth, setActiveTab } = useAppStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [rates, setRates] = useState<CurrencyRates | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [quote, setQuote] = useState<DailyQuote>(fallbackQuotes[0]);
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth check
  useEffect(() => {
    checkAuth();
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (authChecked && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authChecked]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load local mock data
  useEffect(() => {
    if (!currentUser) return;
    setAnnouncements(mockDb.announcements || []);
    setUsers(mockDb.users || []);
    setQuote(fallbackQuotes[new Date().getDate() % fallbackQuotes.length]);
  }, [currentUser]);

  // Fetch Weather (Open-Meteo - Istanbul)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=Europe/Istanbul");
        const data = await res.json();
        const code = data.current.weather_code;
        const weatherInfo = weatherDescriptions[code] || weatherDescriptions[2];
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: code,
          windSpeed: Math.round(data.current.wind_speed_10m),
          humidity: data.current.relative_humidity_2m,
          description: weatherInfo.text,
          icon: weatherInfo.icon,
        });
      } catch (err) {
        setWeather({
          temperature: 24,
          weatherCode: 0,
          windSpeed: 12,
          humidity: 55,
          description: "Açık",
          icon: <Sun size={28} className="text-amber-400" />,
        });
      }
    };
    fetchWeather();
  }, []);

  // Fetch Currency Rates (Frankfurter)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("https://api.frankfurter.dev/v1/latest?base=TRY&symbols=USD,EUR,GBP");
        const data = await res.json();
        // Frankfurter returns TRY-based rates, we need to invert
        setRates({
          USD: Math.round((1 / data.rates.USD) * 100) / 100,
          EUR: Math.round((1 / data.rates.EUR) * 100) / 100,
          GBP: Math.round((1 / data.rates.GBP) * 100) / 100,
          date: data.date,
        });
      } catch (err) {
        setRates({
          USD: 38.45,
          EUR: 43.12,
          GBP: 48.90,
          date: new Date().toISOString().split("T")[0],
        });
      }
    };
    fetchRates();
  }, []);

  // Fetch Holidays (Nager.Date)
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const year = new Date().getFullYear();
        const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/TR`);
        const data = await res.json();
        const upcoming = data.filter((h: Holiday) => new Date(h.date) >= new Date());
        setHolidays(upcoming.slice(0, 5));
      } catch (err) {
        setHolidays([
          { date: "2026-08-30", localName: "Zafer Bayramı", name: "Victory Day", countryCode: "TR" },
          { date: "2026-10-29", localName: "Cumhuriyet Bayramı", name: "Republic Day", countryCode: "TR" },
        ]);
      }
    };
    fetchHolidays();
  }, []);

  // Fetch Quote
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await fetch("https://zenquotes.io/api/today");
        const data = await res.json();
        if (data && data[0]) {
          setQuote({ text: data[0].q, author: data[0].a });
        }
      } catch {
        // Fallback already set
      }
    };
    fetchQuote();
  }, []);

  // Computed data
  const todayStr = currentTime.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = currentTime.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const getUpcomingBirthdays = useCallback(() => {
    if (!users.length) return [];
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisDay = now.getDate();

    return users
      .filter(u => u.dateOfBirth && u.isActive)
      .map(u => {
        const dob = new Date(u.dateOfBirth!);
        const bMonth = dob.getMonth();
        const bDay = dob.getDate();
        let daysUntil = 0;

        const thisYearBd = new Date(now.getFullYear(), bMonth, bDay);
        if (thisYearBd >= now) {
          daysUntil = Math.ceil((thisYearBd.getTime() - now.getTime()) / 86400000);
        } else {
          const nextYearBd = new Date(now.getFullYear() + 1, bMonth, bDay);
          daysUntil = Math.ceil((nextYearBd.getTime() - now.getTime()) / 86400000);
        }

        return { ...u, daysUntil, birthdayStr: `${bDay} ${["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"][bMonth]}` };
      })
      .filter(u => u.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 8);
  }, [users]);

  const getWorkAnniversaries = useCallback(() => {
    if (!users.length) return [];
    const now = new Date();
    return users
      .filter(u => u.hireDate && u.isActive)
      .map(u => {
        const hd = new Date(u.hireDate!);
        const years = now.getFullYear() - hd.getFullYear();
        const anniv = new Date(now.getFullYear(), hd.getMonth(), hd.getDate());
        let daysUntil = Math.ceil((anniv.getTime() - now.getTime()) / 86400000);
        if (daysUntil < 0) daysUntil += 365;
        return { ...u, years, daysUntil, hireStr: `${hd.getDate()} ${["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"][hd.getMonth()]}` };
      })
      .filter(u => u.daysUntil <= 30 && u.years > 0)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 6);
  }, [users]);

  const getNewHires = useCallback(() => {
    if (!users.length) return [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    return users
      .filter(u => u.hireDate && new Date(u.hireDate) >= thirtyDaysAgo && u.isActive)
      .sort((a, b) => new Date(b.hireDate!).getTime() - new Date(a.hireDate!).getTime())
      .slice(0, 6);
  }, [users]);

  const getDaysUntilHoliday = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return Math.ceil((d.getTime() - now.getTime()) / 86400000);
  };

  const dailyMenu = getDailyMenu();
  const birthdays = getUpcomingBirthdays();
  const anniversaries = getWorkAnniversaries();
  const newHires = getNewHires();

  if (!authChecked || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 transition-colors">
      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-slate-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/icon.png" alt="SeedHR Logo" className="h-8 w-8 object-contain rounded-lg shrink-0 shadow-sm" />
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white">Seed<span className="text-indigo-600 dark:text-indigo-400">HR</span></h1>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 -mt-0.5">Şirket İntranet</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <button onClick={() => router.push("/dashboard")} className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                Dashboard
              </button>
              <button className="px-3 py-2 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30">
                İntranet
              </button>
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                title="Tema Değiştir"
              >
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 dark:border-zinc-800 pl-3 ml-1">
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">{currentUser.fullName}</span>
              </div>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800">
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 py-3 space-y-2">
          <button onClick={() => { router.push("/dashboard"); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800">Dashboard</button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── Hero Banner ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 sm:p-10 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-30" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-indigo-200 text-xs font-medium mb-1">{todayStr}</p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Hoş Geldin, {currentUser.firstName}! 👋
              </h2>
              <p className="text-indigo-100/80 text-sm max-w-md">
                Bugün harika bir gün için hazır mısın? İşte şirket içi son gelişmeler.
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold font-mono tracking-wider">{timeStr}</div>
              <p className="text-indigo-200 text-xs mt-1">İstanbul, Türkiye</p>
            </div>
          </div>
        </div>

        {/* ── Quick Info Row: Weather + Currency + Quote ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Weather */}
          <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-slate-100 dark:border-zinc-800/60 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Hava Durumu</h3>
              <span className="text-[10px] text-slate-400">İstanbul</span>
            </div>
            {weather ? (
              <div className="flex items-center gap-4">
                <div className="shrink-0">{weather.icon}</div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{weather.temperature}°C</div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{weather.description}</p>
                </div>
                <div className="ml-auto text-right space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Wind size={10} /> {weather.windSpeed} km/s
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    💧 %{weather.humidity}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-pulse h-14 bg-slate-100 dark:bg-zinc-800 rounded-xl" />
            )}
          </div>

          {/* Currency */}
          <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-slate-100 dark:border-zinc-800/60 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Döviz Kurları</h3>
              <span className="text-[10px] text-slate-400">{rates?.date || "..."}</span>
            </div>
            {rates ? (
              <div className="space-y-2.5">
                {[
                  { code: "USD", symbol: "$", rate: rates.USD, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30" },
                  { code: "EUR", symbol: "€", rate: rates.EUR, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
                  { code: "GBP", symbol: "£", rate: rates.GBP, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30" },
                ].map(c => (
                  <div key={c.code} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-7 w-7 rounded-lg ${c.bg} flex items-center justify-center text-xs font-bold ${c.color}`}>{c.symbol}</div>
                      <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">{c.code}/TRY</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">₺{c.rate.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-pulse space-y-2">
                <div className="h-7 bg-slate-100 dark:bg-zinc-800 rounded" />
                <div className="h-7 bg-slate-100 dark:bg-zinc-800 rounded" />
                <div className="h-7 bg-slate-100 dark:bg-zinc-800 rounded" />
              </div>
            )}
          </div>

          {/* Quote */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-amber-500" />
              <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Günün Sözü</h3>
            </div>
            <blockquote className="text-sm text-slate-700 dark:text-zinc-300 italic leading-relaxed mb-3">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">— {quote.author}</p>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Announcements */}
            <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-slate-100 dark:border-zinc-800/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Şirket Duyuruları</h3>
                </div>
                <button onClick={() => { setActiveTab("announcements"); router.push("/dashboard"); }} className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
                  Tümünü Gör <ChevronRight size={10} />
                </button>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-zinc-800/40">
                {announcements.length > 0 ? announcements.map(a => (
                  <div key={a.id} className="px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                    <div className="flex items-start gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                        a.category === "CompanyNews" ? "bg-blue-50 dark:bg-blue-950/30" :
                        a.category === "PolicyChange" ? "bg-amber-50 dark:bg-amber-950/30" :
                        a.category === "Event" ? "bg-purple-50 dark:bg-purple-950/30" :
                        "bg-slate-50 dark:bg-zinc-800"
                      }`}>
                        <Megaphone size={14} className={
                          a.category === "CompanyNews" ? "text-blue-600 dark:text-blue-400" :
                          a.category === "PolicyChange" ? "text-amber-600 dark:text-amber-400" :
                          a.category === "Event" ? "text-purple-600 dark:text-purple-400" :
                          "text-slate-500"
                        } />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{a.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">{a.content}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-slate-400">{a.authorName}</span>
                          <span className="text-[10px] text-slate-300 dark:text-zinc-600">•</span>
                          <span className="text-[10px] text-slate-400">{new Date(a.publishedDate).toLocaleDateString("tr-TR")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="px-6 py-10 text-center text-sm text-slate-400">Henüz duyuru yok</div>
                )}
              </div>
            </div>

            {/* Daily Menu */}
            <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-slate-100 dark:border-zinc-800/60 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Utensils size={16} className="text-orange-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Günün Menüsü</h3>
                <span className="ml-auto text-[10px] text-slate-400">{currentTime.toLocaleDateString("tr-TR", { weekday: "long" })}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {dailyMenu.map((item, i) => (
                  <div key={i} className="text-center p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700/50 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
                    <div className="text-2xl mb-2">{item.emoji}</div>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium uppercase tracking-wider mb-0.5">{item.type}</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Holidays */}
            <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-slate-100 dark:border-zinc-800/60 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Calendar size={16} className="text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Yaklaşan Resmi Tatiller</h3>
              </div>
              {holidays.length > 0 ? (
                <div className="space-y-3">
                  {holidays.map((h, i) => {
                    const daysUntil = getDaysUntilHoliday(h.date);
                    return (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                        <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
                          <Calendar size={16} className="text-rose-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-white">{h.localName}</h4>
                          <p className="text-[10px] text-slate-400">{new Date(h.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" })}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          daysUntil <= 7 ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" :
                          daysUntil <= 30 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
                          "bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300"
                        }`}>
                          {daysUntil} gün
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">Tatil bilgisi yükleniyor...</p>
              )}
            </div>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">
            {/* Birthdays */}
            <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-slate-100 dark:border-zinc-800/60 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Cake size={16} className="text-pink-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Yaklaşan Doğum Günleri</h3>
              </div>
              <div className="space-y-2.5">
                {birthdays.length > 0 ? birthdays.map(b => (
                  <div key={b.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-pink-50/50 dark:hover:bg-pink-950/10 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-950/30 flex items-center justify-center text-[10px] font-bold text-pink-700 dark:text-pink-400">
                      {b.firstName[0]}{b.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{b.fullName}</p>
                      <p className="text-[10px] text-slate-400">{b.birthdayStr}</p>
                    </div>
                    <span className={`text-[10px] font-bold ${b.daysUntil === 0 ? "text-pink-600" : "text-slate-400"}`}>
                      {b.daysUntil === 0 ? "🎂 Bugün!" : `${b.daysUntil} gün`}
                    </span>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 text-center py-3">Yaklaşan doğum günü yok</p>
                )}
              </div>
            </div>

            {/* Work Anniversaries */}
            <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-slate-100 dark:border-zinc-800/60 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <PartyPopper size={16} className="text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">İş Yıldönümleri</h3>
              </div>
              <div className="space-y-2.5">
                {anniversaries.length > 0 ? anniversaries.map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-amber-50/50 dark:hover:bg-amber-950/10 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      {a.years}y
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{a.fullName}</p>
                      <p className="text-[10px] text-slate-400">{a.years}. yıl • {a.hireStr}</p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      {a.daysUntil === 0 ? "🎉 Bugün!" : `${a.daysUntil} gün`}
                    </span>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 text-center py-3">Yaklaşan yıldönümü yok</p>
                )}
              </div>
            </div>

            {/* New Hires */}
            <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-slate-100 dark:border-zinc-800/60 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-emerald-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Yeni Başlayan Çalışanlar</h3>
              </div>
              <div className="space-y-2.5">
                {newHires.length > 0 ? newHires.map(n => (
                  <div key={n.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      {n.firstName[0]}{n.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{n.fullName}</p>
                      <p className="text-[10px] text-slate-400">{n.positionTitle} • {n.departmentName}</p>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {new Date(n.hireDate!).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 text-center py-3">Son 30 günde yeni başlayan yok</p>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 p-5">
              <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-3">Hızlı Erişim</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "İzin Talebi", icon: Calendar, onClick: () => { setActiveTab("leaves"); router.push("/dashboard"); } },
                  { label: "Bordro", icon: DollarSign, onClick: () => { setActiveTab("finance"); router.push("/dashboard"); } },
                  { label: "Eğitimler", icon: Star, onClick: () => { setActiveTab("performance"); router.push("/dashboard"); } },
                  { label: "İK Destek", icon: Heart, onClick: () => { setActiveTab("settings"); router.push("/dashboard"); } },
                ].map((item, i) => (
                  <button key={i} onClick={item.onClick} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/60 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 border border-indigo-100/50 dark:border-indigo-800/30 transition-all text-left">
                    <item.icon size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="text-[10px] font-semibold text-indigo-800 dark:text-indigo-300">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 mt-12 py-6 text-center">
        <p className="text-[10px] text-slate-400 dark:text-zinc-500">
          © {new Date().getFullYear()} SeedHR — Şirket İçi İntranet Portalı • seedhr.com.tr
        </p>
      </footer>
    </div>
  );
}
