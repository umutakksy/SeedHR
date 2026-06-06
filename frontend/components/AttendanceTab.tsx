"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { attendanceAPI, workScheduleAPI, AttendanceDto, userAPI, UserDto } from "@/lib/api";
import { Search, Calendar as CalendarIcon, Clock, UserCheck, AlertTriangle, Plus, ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { clsx } from "clsx";

export default function AttendanceTab() {
  const { currentUser } = useAppStore();
  const [activeSubTab, setActiveSubTab] = useState<"logs" | "schedule">("logs");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceDto[]>([]);
  const [employees, setEmployees] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States for logs
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Schedule States
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedules, setSchedules] = useState<any[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    type: "Working",
    description: ""
  });

  const userRole = currentUser?.roleName || "Employee";
  const isHRorAdmin = ["Admin", "HR"].includes(userRole);

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (activeSubTab === "schedule") {
      loadSchedules();
    }
  }, [currentMonth, activeSubTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isHRorAdmin) {
        const res = await attendanceAPI.getAll();
        const empRes = await userAPI.getAll();
        if (res.success) setAttendanceRecords(res.data);
        if (empRes.success) setEmployees(empRes.data);
      } else if (currentUser) {
        const res = await attendanceAPI.getByUser(currentUser.id);
        if (res.success) setAttendanceRecords(res.data);
      }
    } catch (err) {
      toast.error("Katılım verileri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const start = new Date(year, month - 1, 15).toISOString().split('T')[0];
    const end = new Date(year, month + 1, 15).toISOString().split('T')[0];
    try {
      const res = await workScheduleAPI.getByRange(start, end);
      if (res.success && res.data) {
        setSchedules(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedDate) return;
    const data = {
      date: selectedDate,
      type: scheduleForm.type,
      description: scheduleForm.description,
      dayOfWeek: selectedDate.getDay()
    };

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const existing = schedules.find(s => s.date.startsWith(dateStr));
      let res;
      if (existing) {
        res = await workScheduleAPI.update(existing.id, data);
      } else {
        res = await workScheduleAPI.create(data);
      }

      if (res.success) {
        toast.success("Çalışma takvimi güncellendi");
        loadSchedules();
        setShowScheduleModal(false);
      } else {
        toast.error(res.message || "Kaydedilemedi");
      }
    } catch (err) {
      toast.error("İşlem sırasında hata oluştu");
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    const existing = schedules.find(s => s.date.startsWith(dateStr));
    if (!existing) return;

    if (!confirm("Bu tarihe ait özel planlamayı silmek istediğinize emin misiniz?")) return;

    try {
      const res = await workScheduleAPI.delete(existing.id);
      if (res.success) {
        toast.success("Planlama kaldırıldı");
        loadSchedules();
        setShowScheduleModal(false);
      } else {
        toast.error(res.message || "Silinemedi");
      }
    } catch (err) {
      toast.error("Silme işlemi sırasında hata oluştu");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">Zamanında Giriş</span>;
      case "Late":
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">Gecikmeli Giriş</span>;
      case "Absent":
        return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">Devamsızlık</span>;
      case "HalfDay":
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">Yarım Gün</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">İzinli / Tatil</span>;
    }
  };

  // Filter records
  const filteredRecords = attendanceRecords.filter(rec => {
    const matchesUser = isHRorAdmin
      ? rec.userName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesDate = dateFilter ? rec.date === dateFilter : true;

    return matchesUser && matchesDate;
  });

  // Calculate statistics
  const totalWorkedHours = attendanceRecords
    .filter(r => r.totalHoursWorked)
    .reduce((sum, r) => sum + (r.totalHoursWorked || 0), 0);

  const averageHours = attendanceRecords.filter(r => r.totalHoursWorked).length > 0
    ? Math.round((totalWorkedHours / attendanceRecords.filter(r => r.totalHoursWorked).length) * 10) / 10
    : 0;

  const lateCount = attendanceRecords.filter(r => r.status === "Late").length;

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    for (let i = startPadding; i > 0; i--) {
      days.push(new Date(year, month, 1 - i));
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const calendarDays = getDaysInMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDayClick = (day: Date) => {
    if (!isHRorAdmin) return;
    setSelectedDate(day);
    const dateStr = day.toISOString().split('T')[0];
    const existing = schedules.find(s => s.date.startsWith(dateStr));
    if (existing) {
      setScheduleForm({
        type: existing.type,
        description: existing.description || ""
      });
    } else {
      // Default to weekend for Sat/Sun, Working for Mon-Fri
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      setScheduleForm({
        type: isWeekend ? "Weekend" : "Working",
        description: ""
      });
    }
    setShowScheduleModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab("logs")}
          className={clsx(
            "px-4 py-2.5 text-xs font-semibold border-b-2 transition-all duration-200 flex items-center gap-2",
            activeSubTab === "logs"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          )}
        >
          <Clock size={14} />
          Giriş-Çıkış Kayıtları
        </button>
        <button
          onClick={() => setActiveSubTab("schedule")}
          className={clsx(
            "px-4 py-2.5 text-xs font-semibold border-b-2 transition-all duration-200 flex items-center gap-2",
            activeSubTab === "schedule"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          )}
        >
          <CalendarIcon size={14} />
          Çalışma Takvimi Planlama
        </button>
      </div>

      {activeSubTab === "logs" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Overview Analytics row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Toplam Mesai Süresi</span>
                <Clock size={16} className="text-slate-400" />
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">{Math.round(totalWorkedHours)} saat</h3>
                <p className="text-xs text-slate-400 mt-1">Bu dönemdeki toplam kayıtlı çalışma saati</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Ortalama Günlük Mesai</span>
                <UserCheck size={16} className="text-indigo-500" />
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">{averageHours} saat</h3>
                <p className="text-xs text-slate-400 mt-1">Günlük ortalama aktif çalışma süresi</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Geç Kalma Sayısı</span>
                <AlertTriangle size={16} className="text-amber-500" />
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">{lateCount}</h3>
                <p className="text-xs text-slate-400 mt-1">Saat 09:00 sonrası yapılan girişler</p>
              </div>
            </div>
          </div>

          {/* Filter and search bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-3 max-w-lg">
              {isHRorAdmin && (
                <div className="relative flex-1">
                  <Search className="absolute top-2.5 left-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Çalışan ismi ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-900 dark:border-slate-800 dark:text-white"
                  />
                </div>
              )}
              <div className="relative">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-900 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-zinc-900">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-zinc-800/50">
                  <th className="px-6 py-3 font-semibold text-xs uppercase">Çalışan</th>
                  <th className="px-6 py-3 font-semibold text-xs uppercase">Tarih</th>
                  <th className="px-6 py-3 font-semibold text-xs uppercase">Giriş Saati</th>
                  <th className="px-6 py-3 font-semibold text-xs uppercase">Çıkış Saati</th>
                  <th className="px-6 py-3 font-semibold text-xs uppercase">Mesai Süresi</th>
                  <th className="px-6 py-3 font-semibold text-xs uppercase">Durum</th>
                  <th className="px-6 py-3 font-semibold text-xs uppercase">Açıklama / Not</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">Yükleniyor...</td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">Kayıt bulunamadı.</td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-zinc-200">{rec.userName}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(rec.date).toLocaleDateString("tr-TR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-800 dark:text-zinc-100">{rec.checkIn || "-"}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-800 dark:text-zinc-100">{rec.checkOut || "-"}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-zinc-300">
                        {rec.totalHoursWorked ? `${rec.totalHoursWorked} Saat` : "-"}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(rec.status)}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 italic">
                        {rec.notes || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === "schedule" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Calendar Header */}
          <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                {currentMonth.toLocaleDateString("tr-TR", { year: 'numeric', month: 'long' })}
              </h3>
              {isHRorAdmin && (
                <span className="text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Sparkles size={10} /> HR Yönetim Modu
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-800/20 text-center py-2 text-xs font-bold text-slate-500">
              {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 border-l border-t border-transparent">
              {calendarDays.map((day, idx) => {
                const dateStr = day.toISOString().split('T')[0];
                const schedule = schedules.find(s => s.date.startsWith(dateStr));
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                
                // Determine display type
                let displayType = "Working";
                let description = "";
                if (schedule) {
                  displayType = schedule.type;
                  description = schedule.description || "";
                } else {
                  // Fallback for default weekends
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  displayType = isWeekend ? "Weekend" : "Working";
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(day)}
                    className={clsx(
                      "min-h-24 p-2 transition flex flex-col justify-between cursor-pointer",
                      isCurrentMonth ? "bg-white dark:bg-zinc-900" : "bg-slate-50/40 dark:bg-zinc-900/20 opacity-50",
                      isHRorAdmin ? "hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10" : "cursor-default"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className={clsx(
                        "text-xs font-bold",
                        day.toDateString() === new Date().toDateString()
                          ? "h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center -mt-1 -ml-1 shadow-md shadow-indigo-600/20"
                          : "text-slate-700 dark:text-zinc-300"
                      )}>
                        {day.getDate()}
                      </span>
                      
                      {/* Badge indicator */}
                      <span className={clsx(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                        displayType === "Working" && "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400",
                        displayType === "Holiday" && "text-rose-700 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400",
                        displayType === "Weekend" && "text-slate-500 bg-slate-100 dark:bg-zinc-800 dark:text-zinc-400"
                      )}>
                        {displayType === "Working" && "İş Günü"}
                        {displayType === "Holiday" && "Resmi Tatil"}
                        {displayType === "Weekend" && "Hafta Sonu"}
                      </span>
                    </div>

                    {description && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 truncate bg-slate-50 dark:bg-zinc-800/50 p-1 rounded border border-slate-100 dark:border-slate-800">
                        {description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Edit Modal */}
      {showScheduleModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white">Günlük Takvim Planlaması</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tarih</label>
                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  {selectedDate.toLocaleDateString("tr-TR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gün Tipi</label>
                <select
                  value={scheduleForm.type}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 dark:bg-zinc-900 dark:border-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Working">İş Günü (Working)</option>
                  <option value="Holiday">Resmi Tatil (Holiday)</option>
                  <option value="Weekend">Hafta Sonu (Weekend)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Açıklama / Not</label>
                <textarea
                  placeholder="Tatil adı veya özel durum açıklaması..."
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 dark:bg-zinc-900 dark:border-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6 dark:border-slate-800">
              <div>
                {schedules.some(s => s.date.startsWith(selectedDate.toISOString().split('T')[0])) && (
                  <button
                    onClick={handleDeleteSchedule}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                  >
                    Planlamayı Sil
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveSchedule}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
