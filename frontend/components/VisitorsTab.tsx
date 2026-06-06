"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { VisitorLogDto, visitorAPI, userAPI, UserDto } from "@/lib/api";
import {
  UserCheck,
  UserX,
  Clock,
  Plus,
  Search,
  Building2,
  Phone,
  Car,
  BadgeCheck,
  LogIn,
  LogOut,
  CalendarClock,
  Users,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<string, string> = {
  CheckedIn: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  CheckedOut: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
  Expected: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
};

const statusLabels: Record<string, string> = {
  CheckedIn: "Binada",
  CheckedOut: "Ayrıldı",
  Expected: "Bekleniyor",
};

const statusIcons: Record<string, React.ReactNode> = {
  CheckedIn: <LogIn size={12} />,
  CheckedOut: <LogOut size={12} />,
  Expected: <CalendarClock size={12} />,
};

export default function VisitorsTab() {
  const { currentUser } = useAppStore();
  const [visitors, setVisitors] = useState<VisitorLogDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const [newVisitor, setNewVisitor] = useState({
    visitorName: "",
    visitorCompany: "",
    visitorPhone: "",
    hostUserId: "",
    purpose: "",
    vehiclePlate: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [visitorRes, userRes] = await Promise.all([
        visitorAPI.getAll(),
        userAPI.getAll(),
      ]);
      if (visitorRes.success) setVisitors(visitorRes.data);
      if (userRes.success) setUsers(userRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCheckIn = async () => {
    if (!newVisitor.visitorName || !newVisitor.hostUserId || !newVisitor.purpose) return;
    const res = await visitorAPI.checkIn(newVisitor);
    if (res.success) {
      toast.success("Ziyaretçi giriş kaydı oluşturuldu");
      setVisitors(prev => [res.data, ...prev]);
      setShowCheckInModal(false);
      setNewVisitor({ visitorName: "", visitorCompany: "", visitorPhone: "", hostUserId: "", purpose: "", vehiclePlate: "", notes: "" });
    }
  };

  const handleCheckOut = async (id: string) => {
    const res = await visitorAPI.checkOut(id);
    if (res.success) {
      toast.success("Ziyaretçi çıkış kaydedildi");
      setVisitors(prev => prev.map(v => v.id === id ? res.data : v));
    }
  };

  const filteredVisitors = visitors.filter(v => {
    const matchSearch = !searchTerm || v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) || v.visitorCompany.toLowerCase().includes(searchTerm.toLowerCase()) || v.hostUserName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeVisitors = visitors.filter(v => v.status === "CheckedIn");
  const expectedVisitors = visitors.filter(v => v.status === "Expected");
  const todayCheckouts = visitors.filter(v => v.status === "CheckedOut" && v.checkOutTime && new Date(v.checkOutTime).toDateString() === new Date().toDateString());

  const formatTime = (isoStr: string) => new Date(isoStr).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (isoStr: string) => new Date(isoStr).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ziyaretçi Takibi</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Ziyaretçi giriş-çıkış ve yaka kartı yönetimi</p>
        </div>
        <button
          onClick={() => setShowCheckInModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus size={14} />
          Ziyaretçi Kaydı
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Binada</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <UserCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{activeVisitors.length}</p>
          <p className="text-[10px] text-emerald-600 mt-1">Aktif ziyaretçi</p>
        </div>
        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Beklenen</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <CalendarClock size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{expectedVisitors.length}</p>
          <p className="text-[10px] text-blue-600 mt-1">Randevulu ziyaretçi</p>
        </div>
        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Bugün Çıkış</span>
            <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
              <LogOut size={16} className="text-slate-500 dark:text-zinc-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{todayCheckouts.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Ayrılan ziyaretçi</p>
        </div>
        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Toplam Kayıt</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
              <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{visitors.length}</p>
          <p className="text-[10px] text-indigo-600 mt-1">Tüm zamanlar</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Ziyaretçi, şirket veya ev sahibi ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/60 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl">
          {[
            { id: "", label: "Tümü" },
            { id: "CheckedIn", label: "Binada" },
            { id: "Expected", label: "Beklenen" },
            { id: "CheckedOut", label: "Ayrılan" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${statusFilter === f.id ? "bg-white dark:bg-zinc-700 text-indigo-700 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-zinc-400"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visitor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVisitors.map(v => (
          <div key={v.id} className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-slate-100 dark:border-zinc-800/60 p-5 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-base font-bold ${
                  v.status === "CheckedIn" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" :
                  v.status === "Expected" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" :
                  "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}>
                  {v.visitorName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">{v.visitorName}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Building2 size={10} className="text-slate-400" />
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">{v.visitorCompany}</span>
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusColors[v.status]}`}>
                {statusIcons[v.status]}
                {statusLabels[v.status]}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300">
                <UserCheck size={12} className="text-slate-400 shrink-0" />
                <span className="font-medium">Ev Sahibi:</span>
                <span>{v.hostUserName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300">
                <BadgeCheck size={12} className="text-slate-400 shrink-0" />
                <span className="font-medium">Amaç:</span>
                <span className="truncate">{v.purpose}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300">
                  <LogIn size={12} className="text-emerald-500 shrink-0" />
                  <span>{formatDate(v.checkInTime)}</span>
                </div>
                {v.checkOutTime && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300">
                    <LogOut size={12} className="text-rose-400 shrink-0" />
                    <span>{formatTime(v.checkOutTime)}</span>
                  </div>
                )}
              </div>
              {v.badgeNumber && (
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300">
                  <BadgeCheck size={12} className="text-indigo-400 shrink-0" />
                  <span className="font-medium">Yaka Kartı:</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-mono font-bold text-[10px]">{v.badgeNumber}</span>
                </div>
              )}
              {v.vehiclePlate && (
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300">
                  <Car size={12} className="text-slate-400 shrink-0" />
                  <span className="font-medium">Araç:</span>
                  <span className="font-mono">{v.vehiclePlate}</span>
                </div>
              )}
              {v.notes && (
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 italic mt-1">{v.notes}</p>
              )}
            </div>

            {v.status === "CheckedIn" && (
              <button
                onClick={() => handleCheckOut(v.id)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut size={14} />
                Çıkış Kaydı
              </button>
            )}
          </div>
        ))}
        {filteredVisitors.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 dark:text-zinc-500">
            <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Ziyaretçi kaydı bulunamadı</p>
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCheckInModal(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-zinc-800 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5">Yeni Ziyaretçi Kaydı</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Ziyaretçi Adı *</label>
                  <input
                    type="text"
                    value={newVisitor.visitorName}
                    onChange={e => setNewVisitor({ ...newVisitor, visitorName: e.target.value })}
                    placeholder="Ad Soyad"
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Şirket</label>
                  <input
                    type="text"
                    value={newVisitor.visitorCompany}
                    onChange={e => setNewVisitor({ ...newVisitor, visitorCompany: e.target.value })}
                    placeholder="Şirket adı"
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Telefon</label>
                  <input
                    type="tel"
                    value={newVisitor.visitorPhone}
                    onChange={e => setNewVisitor({ ...newVisitor, visitorPhone: e.target.value })}
                    placeholder="+90 5xx xxx xxxx"
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Araç Plaka</label>
                  <input
                    type="text"
                    value={newVisitor.vehiclePlate}
                    onChange={e => setNewVisitor({ ...newVisitor, vehiclePlate: e.target.value })}
                    placeholder="34 ABC 123"
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Ziyaret Edilen Kişi *</label>
                <select
                  value={newVisitor.hostUserId}
                  onChange={e => setNewVisitor({ ...newVisitor, hostUserId: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="">Seçiniz...</option>
                  {users.slice(0, 30).map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} - {u.departmentName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Ziyaret Amacı *</label>
                <input
                  type="text"
                  value={newVisitor.purpose}
                  onChange={e => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                  placeholder="Toplantı, görüşme, denetim vb."
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Notlar</label>
                <textarea
                  value={newVisitor.notes}
                  onChange={e => setNewVisitor({ ...newVisitor, notes: e.target.value })}
                  placeholder="Ek bilgiler..."
                  rows={2}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCheckInModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 transition-colors">
                İptal
              </button>
              <button
                onClick={handleCheckIn}
                disabled={!newVisitor.visitorName || !newVisitor.hostUserId || !newVisitor.purpose}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 shadow-md shadow-indigo-600/20"
              >
                Giriş Kaydı Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
