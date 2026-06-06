"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { dashboardAPI, attendanceAPI, userAPI, announcementAPI, mockDb, DashboardStatisticsDto, AttendanceDto, AnnouncementDto } from "@/lib/api";
import { Users, Clock, CalendarDays, Briefcase, Play, Square, Cake, BellRing, Check } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "react-hot-toast";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function DashboardTab() {
  const { currentUser } = useAppStore();
  const [stats, setStats] = useState<DashboardStatisticsDto | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceDto | null>(null);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [checkInNotes, setCheckInNotes] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Chart data
  const [deptChartData, setDeptChartData] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const statsRes = await dashboardAPI.getStats();
      const birthdayRes = await userAPI.getUpcomingBirthdays(30);
      const annRes = await announcementAPI.getAll();
      const attRes = await attendanceAPI.getByUser(currentUser.id);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (birthdayRes.success && birthdayRes.data) {
        // filter birthdays within this month
        setUpcomingBirthdays(birthdayRes.data.slice(0, 3));
      }
      if (annRes.success && annRes.data) {
        setAnnouncements(annRes.data.slice(0, 3));
      }

      // Check today's check-in status
      const todayStr = new Date().toISOString().split("T")[0];
      const todayRecord = attRes.success && attRes.data 
        ? attRes.data.find(a => a && a.date === todayStr) 
        : null;
      setTodayAttendance(todayRecord || null);

      // Generate department chart data
      const deptCounts: Record<string, number> = {};
      mockDb.users.forEach(u => {
        if (u.isActive && u.departmentName) {
          deptCounts[u.departmentName] = (deptCounts[u.departmentName] || 0) + 1;
        }
      });
      const formattedChart = Object.keys(deptCounts).map(name => ({
        name,
        personel: deptCounts[name]
      }));
      setDeptChartData(formattedChart);

    } catch (err) {
      console.error(err);
      toast.error("Dashboard verileri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!currentUser) return;
    try {
      const res = await attendanceAPI.checkIn(currentUser.id, checkInNotes);
      if (res.success) {
        toast.success(res.message || "Giriş kaydı yapıldı");
        setCheckInNotes("");
        fetchData();
      }
    } catch (err) {
      toast.error("Giriş işlemi başarısız");
    }
  };

  const handleCheckOut = async () => {
    if (!currentUser) return;
    try {
      const res = await attendanceAPI.checkOut(currentUser.id);
      if (res.success) {
        toast.success(res.message || "Çıkış kaydı yapıldı");
        fetchData();
      }
    } catch (err) {
      toast.error("Çıkış işlemi başarısız");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md">
        <h2 className="text-xl font-bold md:text-2xl">Hoş geldiniz, {currentUser?.fullName}!</h2>
        <p className="mt-1.5 text-xs text-indigo-200 md:text-sm">
          Kurumsal SeedHR yönetim paneline başarıyla bağlandınız. Bugün yapacaklarınızı kontrol etmeyi unutmayın.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Employees */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Aktif Çalışanlar</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">{stats?.totalEmployees}</h3>
            <p className="text-xs text-slate-400 mt-1">Son 30 günde +1 çalışan</p>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Bugünkü Katılım</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">%{stats?.attendanceRateToday}</h3>
            <p className="text-xs text-slate-400 mt-1">Hedef: %95 katılım oranı</p>
          </div>
        </div>

        {/* Leave Requests */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Bekleyen İzinler</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <CalendarDays size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">{stats?.activeLeaveRequests}</h3>
            <p className="text-xs text-slate-400 mt-1">İncelenmesi gereken talepler</p>
          </div>
        </div>

        {/* Job Postings */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Açık İlanlar</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Briefcase size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">{stats?.openJobPostings}</h3>
            <p className="text-xs text-slate-400 mt-1">Yayınlanan açık kariyer ilanı</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Clock-in/out & Visual Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Time Card Widget */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
          <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Zaman Kaydı (Punches)</h3>
          <p className="text-xs text-slate-400 mt-1">Günlük mesai başlangıç ve bitiş kaydınızı girin.</p>

          <div className="mt-6 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl dark:bg-zinc-800/40">
            <span className="text-xs font-medium text-slate-400">GÜNÜN DURUMU</span>
            {todayAttendance ? (
              todayAttendance.checkOut ? (
                <span className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Mesai Tamamlandı ({todayAttendance.checkIn} - {todayAttendance.checkOut})
                </span>
              ) : (
                <span className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">
                  Çalışıyor (Giriş: {todayAttendance.checkIn})
                </span>
              )
            ) : (
              <span className="mt-2 text-sm font-semibold text-rose-500">
                Henüz Giriş Yapılmadı
              </span>
            )}

            <div className="mt-6 flex gap-4 w-full">
              {!todayAttendance && (
                <div className="w-full space-y-3">
                  <input
                    type="text"
                    value={checkInNotes}
                    onChange={(e) => setCheckInNotes(e.target.value)}
                    placeholder="Giriş notu (opsiyonel)..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  />
                  <button
                    onClick={handleCheckIn}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                  >
                    <Play size={14} /> Mesaiye Başla
                  </button>
                </div>
              )}

              {todayAttendance && !todayAttendance.checkOut && (
                <button
                  onClick={handleCheckOut}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 transition"
                >
                  <Square size={14} /> Mesaiyi Bitir
                </button>
              )}

              {todayAttendance && todayAttendance.checkOut && (
                <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 text-slate-400 py-2.5 text-xs font-medium dark:bg-zinc-800">
                  <Check size={14} className="text-emerald-500" /> Bugün Kayıt Yapıldı
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts & Analytics */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
          <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Departman Dağılımı</h3>
          <p className="text-xs text-slate-400 mt-1">Şirket genelinde çalışanların departmanlara göre sayısal dağılımı.</p>

          <div className="mt-4 h-60 w-full">
            {mounted && deptChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="personel" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Grafik oluşturulamıyor
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Birthdays & Company Announcements */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Birthdays Widget */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Cake size={16} className="text-amber-500" />
            <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Yaklaşan Doğum Günleri</h3>
          </div>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {upcomingBirthdays.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Önümüzdeki 30 günde doğum günü bulunmuyor.</p>
            ) : (
              upcomingBirthdays.map((b, idx) => {
                const bdate = new Date(b.dateOfBirth);
                const formatBday = bdate.toLocaleDateString("tr-TR", { day: 'numeric', month: 'long' });
                return (
                  <div key={idx} className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">{b.fullName}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{b.positionTitle} - {b.departmentName}</p>
                    </div>
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
                      {formatBday}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Announcements Widget */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <BellRing size={16} className="text-indigo-500" />
            <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Duyurular & Bültenler</h3>
          </div>
          <div className="mt-4 space-y-3">
            {announcements.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Yayınlanmış şirket duyurusu bulunmuyor.</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="p-3 bg-slate-50 rounded-lg dark:bg-zinc-800/40 text-left">
                  <div className="flex items-center justify-between">
                    <span className={clsx(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase",
                      a.category === "PolicyChange" ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400" :
                      a.category === "Event" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400" :
                      "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400"
                    )}>
                      {a.category === "PolicyChange" ? "Kural/Prosedür" : a.category === "Event" ? "Etkinlik" : "Şirket Haberi"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(a.publishedDate).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mt-2 truncate">{a.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{a.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
