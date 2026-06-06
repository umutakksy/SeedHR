"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { EmployeeShiftDto, shiftAPI, userAPI, UserDto } from "@/lib/api";
import {
  Clock,
  Calendar,
  Sun,
  Moon,
  Sunrise,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Timer,
  Users,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const shiftTypeLabels: Record<string, string> = {
  Morning: "Sabah",
  Afternoon: "Öğleden Sonra",
  Night: "Gece",
  Full: "Tam Gün",
  Off: "İzinli",
};

const shiftTypeColors: Record<string, string> = {
  Morning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  Afternoon: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800",
  Night: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800",
  Full: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  Off: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
};

const shiftIcons: Record<string, React.ReactNode> = {
  Morning: <Sunrise size={14} />,
  Afternoon: <Sun size={14} />,
  Night: <Moon size={14} />,
  Full: <Clock size={14} />,
  Off: <Coffee size={14} />,
};

const statusColors: Record<string, string> = {
  Planned: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  Active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  Completed: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
  Absent: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
};

const statusLabels: Record<string, string> = {
  Planned: "Planlandı",
  Active: "Aktif",
  Completed: "Tamamlandı",
  Absent: "Devamsız",
};

export default function ShiftsTab() {
  const { currentUser } = useAppStore();
  const [shifts, setShifts] = useState<EmployeeShiftDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newShift, setNewShift] = useState({
    userId: "",
    shiftType: "Full" as EmployeeShiftDto["shiftType"],
    startTime: "09:00",
    endTime: "18:00",
    breakMinutes: "60",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [shiftRes, userRes] = await Promise.all([
        shiftAPI.getAll(),
        userAPI.getAll(),
      ]);
      if (shiftRes.success) setShifts(shiftRes.data);
      if (userRes.success) setUsers(userRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreateShift = async () => {
    if (!newShift.userId) return;
    const res = await shiftAPI.create({
      userId: newShift.userId,
      date: selectedDate,
      shiftType: newShift.shiftType,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      breakMinutes: parseInt(newShift.breakMinutes) || 60,
      overtimeMinutes: 0,
    });
    if (res.success) {
      toast.success("Vardiya planlandı");
      setShifts(prev => [...prev, res.data]);
      setShowAddModal(false);
      setNewShift({ userId: "", shiftType: "Full", startTime: "09:00", endTime: "18:00", breakMinutes: "60" });
    }
  };

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const getWeekDates = () => {
    const d = new Date(selectedDate);
    const dayOfWeek = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day.toISOString().split("T")[0]);
    }
    return days;
  };

  const filteredShifts = shifts.filter(s => {
    const matchDate = viewMode === "day" ? s.date === selectedDate : getWeekDates().includes(s.date);
    const matchSearch = !searchTerm || s.userName.toLowerCase().includes(searchTerm.toLowerCase()) || s.departmentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDate && matchSearch;
  });

  const todayShifts = shifts.filter(s => s.date === new Date().toISOString().split("T")[0]);
  const activeShifts = todayShifts.filter(s => s.status === "Active");
  const totalOvertime = filteredShifts.reduce((sum, s) => sum + s.overtimeMinutes, 0);

  const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vardiya & Puantaj</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Vardiya planlama ve mesai takibi</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus size={14} />
          Vardiya Ekle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Bugün Aktif</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{activeShifts.length}</p>
          <p className="text-[10px] text-emerald-600 mt-1">Çalışan aktif vardiyada</p>
        </div>
        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Bugün Toplam</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{todayShifts.length}</p>
          <p className="text-[10px] text-blue-600 mt-1">Planlı vardiya</p>
        </div>
        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Fazla Mesai</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <Timer size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{totalOvertime} dk</p>
          <p className="text-[10px] text-amber-600 mt-1">Seçili dönemde</p>
        </div>
        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">İzinli</span>
            <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
              <Coffee size={16} className="text-slate-500 dark:text-zinc-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {filteredShifts.filter(s => s.shiftType === "Off").length}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Bu dönemde izinli</p>
        </div>
      </div>

      {/* Date Navigation & View Mode */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => changeDate(viewMode === "week" ? -7 : -1)} className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
            <ChevronLeft size={14} className="text-slate-600 dark:text-zinc-300" />
          </button>
          <div className="px-4 py-2 bg-white dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-800 dark:text-white min-w-[140px] text-center">
            {viewMode === "day"
              ? new Date(selectedDate).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })
              : `${new Date(getWeekDates()[0]).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} - ${new Date(getWeekDates()[6]).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}`
            }
          </div>
          <button onClick={() => changeDate(viewMode === "week" ? 7 : 1)} className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
            <ChevronRight size={14} className="text-slate-600 dark:text-zinc-300" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors"
          >
            Bugün
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Çalışan ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/60 text-xs w-48 outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <div className="flex bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all ${viewMode === "day" ? "bg-white dark:bg-zinc-700 text-indigo-700 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-zinc-400"}`}
            >
              Gün
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all ${viewMode === "week" ? "bg-white dark:bg-zinc-700 text-indigo-700 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-zinc-400"}`}
            >
              Hafta
            </button>
          </div>
        </div>
      </div>

      {/* Shift Cards */}
      {viewMode === "day" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredShifts.map(s => (
            <div key={s.id} className={`rounded-2xl border p-5 transition-all hover:shadow-md ${shiftTypeColors[s.shiftType]}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/60 dark:bg-black/20 flex items-center justify-center">
                    {shiftIcons[s.shiftType]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{s.userName}</h4>
                    <p className="text-[10px] opacity-70">{s.departmentName}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[s.status]}`}>
                  {statusLabels[s.status]}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider opacity-60">Vardiya</span>
                  <p className="text-xs font-bold mt-0.5">{shiftTypeLabels[s.shiftType]}</p>
                </div>
                {s.shiftType !== "Off" && (
                  <>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider opacity-60">Saat</span>
                      <p className="text-xs font-bold mt-0.5">{s.startTime} - {s.endTime}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider opacity-60">Mola</span>
                      <p className="text-xs font-bold mt-0.5">{s.breakMinutes} dk</p>
                    </div>
                    {s.overtimeMinutes > 0 && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider opacity-60">Mesai</span>
                        <p className="text-xs font-bold mt-0.5 text-amber-600">+{s.overtimeMinutes} dk</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              {s.notes && (
                <p className="text-[10px] mt-3 opacity-70 italic">{s.notes}</p>
              )}
            </div>
          ))}
          {filteredShifts.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400 dark:text-zinc-500">
              <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Bu tarih için vardiya kaydı bulunamadı</p>
            </div>
          )}
        </div>
      ) : (
        /* Week View - Table */
        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-slate-100 dark:border-zinc-800/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800/60">
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-zinc-400 w-40">Çalışan</th>
                  {getWeekDates().map((d, i) => {
                    const isToday = d === new Date().toISOString().split("T")[0];
                    return (
                      <th key={d} className={`px-3 py-3 text-center font-semibold ${isToday ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20" : "text-slate-500 dark:text-zinc-400"}`}>
                        <div>{dayNames[new Date(d).getDay()]}</div>
                        <div className="text-[10px]">{new Date(d).getDate()}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/40">
                {[...new Set(filteredShifts.map(s => s.userId))].map(userId => {
                  const userShifts = filteredShifts.filter(s => s.userId === userId);
                  const userName = userShifts[0]?.userName || "";
                  return (
                    <tr key={userId} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{userName}</td>
                      {getWeekDates().map(d => {
                        const shift = userShifts.find(s => s.date === d);
                        const isToday = d === new Date().toISOString().split("T")[0];
                        return (
                          <td key={d} className={`px-2 py-2 text-center ${isToday ? "bg-indigo-50/30 dark:bg-indigo-950/10" : ""}`}>
                            {shift ? (
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${shiftTypeColors[shift.shiftType]}`}>
                                {shiftIcons[shift.shiftType]}
                                <span>{shift.startTime !== "00:00" ? `${shift.startTime}-${shift.endTime}` : "İzin"}</span>
                              </div>
                            ) : (
                              <span className="text-slate-300 dark:text-zinc-600">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Shift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5">Yeni Vardiya Planla</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Çalışan</label>
                <select
                  value={newShift.userId}
                  onChange={e => setNewShift({ ...newShift, userId: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="">Seçiniz...</option>
                  {users.slice(0, 30).map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} - {u.departmentName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Vardiya Tipi</label>
                <select
                  value={newShift.shiftType}
                  onChange={e => setNewShift({ ...newShift, shiftType: e.target.value as EmployeeShiftDto["shiftType"] })}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {Object.entries(shiftTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Başlangıç</label>
                  <input
                    type="time"
                    value={newShift.startTime}
                    onChange={e => setNewShift({ ...newShift, startTime: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Bitiş</label>
                  <input
                    type="time"
                    value={newShift.endTime}
                    onChange={e => setNewShift({ ...newShift, endTime: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Mola (dk)</label>
                <input
                  type="number"
                  value={newShift.breakMinutes}
                  onChange={e => setNewShift({ ...newShift, breakMinutes: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 transition-colors">
                İptal
              </button>
              <button
                onClick={handleCreateShift}
                disabled={!newShift.userId}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 shadow-md shadow-indigo-600/20"
              >
                Planla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
