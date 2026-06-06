"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { leaveAPI, LeaveRequestDto, LeaveBalanceDto, LeaveTypeDto, mockDb } from "@/lib/api";
import { Calendar, Plus, Check, X, AlertTriangle, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import { clsx } from "clsx";

export default function LeaveTab() {
  const { currentUser } = useAppStore();
  const [balances, setBalances] = useState<LeaveBalanceDto[]>([]);
  const [requests, setRequests] = useState<LeaveRequestDto[]>([]);
  const [pendingInbox, setPendingInbox] = useState<LeaveRequestDto[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: ""
  });

  // Rejection Dialog State
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const userRole = currentUser?.roleName || "Employee";
  const isManagerOrHR = ["Admin", "Manager", "HR"].includes(userRole);

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Fetch leave types
      setLeaveTypes(mockDb.leaveTypes);

      // Fetch balances for active user
      const balRes = await leaveAPI.getBalancesByUser(currentUser.id);
      if (balRes.success) setBalances(balRes.data);

      // Fetch user requests
      const reqRes = await leaveAPI.getRequestsByUser(currentUser.id);
      if (reqRes.success) setRequests(reqRes.data);

      // Fetch pending inbox if manager/HR
      if (isManagerOrHR) {
        const allReqRes = await leaveAPI.getRequests();
        if (allReqRes.success) {
          // managers only see their department's pending requests (or all if admin/HR)
          const filtered = allReqRes.data.filter(r => {
            if (r.status !== "Pending") return false;
            if (userRole === "Manager") {
              // manager shouldn't approve their own request
              return r.userId !== currentUser.id && r.departmentName === currentUser.departmentName;
            }
            return r.userId !== currentUser.id;
          });
          setPendingInbox(filtered);
        }
      }
    } catch (err) {
      toast.error("Veriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenRequest = () => {
    setFormData({
      leaveTypeId: leaveTypes[0]?.id || "",
      startDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
      endDate: new Date(Date.now() + 172800000).toISOString().split("T")[0], // Day after tomorrow
      reason: ""
    });
    setShowRequestModal(true);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      toast.error("İzin başlangıç tarihi geçmişte olamaz");
      return;
    }
    if (end < start) {
      toast.error("Bitiş tarihi başlangıç tarihinden önce olamaz");
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check balance limit
    const balance = balances.find(b => b.leaveTypeId === formData.leaveTypeId);
    if (balance && diffDays > balance.remainingDays) {
      toast.error(`Yetersiz bakiye. Bu izin türü için kalan hakkınız: ${balance.remainingDays} gün`);
      return;
    }

    try {
      const res = await leaveAPI.createRequest({
        userId: currentUser.id,
        leaveTypeId: formData.leaveTypeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      });

      if (res.success) {
        toast.success(res.message || "İzin talebi iletildi");
        setShowRequestModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error("İzin talebi oluşturulamadı");
    }
  };

  const handleApprove = async (id: string) => {
    if (!currentUser) return;
    try {
      const res = await leaveAPI.approveRequest(id, currentUser.id);
      if (res.success) {
        toast.success(res.message || "Talebi onayladınız");
        fetchData();
      }
    } catch (err) {
      toast.error("İşlem gerçekleştirilemedi");
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !rejectingReqId) return;

    if (!rejectionReason.trim()) {
      toast.error("Reddetme gerekçesi girmelisiniz");
      return;
    }

    try {
      const res = await leaveAPI.rejectRequest(rejectingReqId, currentUser.id, rejectionReason);
      if (res.success) {
        toast.success(res.message || "Talep reddedildi");
        setRejectingReqId(null);
        setRejectionReason("");
        fetchData();
      }
    } catch (err) {
      toast.error("İşlem gerçekleştirilemedi");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">Onaylandı</span>;
      case "Rejected":
        return <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">Reddedildi</span>;
      case "Cancelled":
        return <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">İptal Edildi</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">Beklemede</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Leave Balances Header Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {balances.map((b) => {
          const usagePercent = Math.round((b.usedDays / b.totalDays) * 100);
          return (
            <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
              <h4 className="text-xs font-semibold text-slate-500 uppercase">{b.leaveTypeName} Bakiyesi</h4>
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-bold text-slate-800 dark:text-zinc-100">{b.remainingDays}</span>
                  <span className="text-xs text-slate-400"> / {b.totalDays} gün kaldı</span>
                </div>
                <span className="text-xs font-medium text-slate-400">{b.usedDays} gün kullanıldı</span>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, usagePercent)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Button triggers */}
      <div className="flex justify-end">
        <button
          onClick={handleOpenRequest}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
        >
          <Plus size={14} /> İzin Talep Et
        </button>
      </div>

      {/* Manager Inbox Section */}
      {isManagerOrHR && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
          <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Onay Bekleyen Talepler</h3>
          <p className="text-xs text-slate-400 mt-1">Departmanınızdaki personellerin izin taleplerini inceleyip onaylayın.</p>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {pendingInbox.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Onay bekleyen izin talebi bulunmuyor.</p>
            ) : (
              pendingInbox.map((req) => (
                <div key={req.id} className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-800 dark:text-zinc-100">{req.userName}</span>
                      <span className="text-xs text-slate-400">({req.departmentName})</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{req.leaveTypeName}</span>: {new Date(req.startDate).toLocaleDateString("tr-TR")} - {new Date(req.endDate).toLocaleDateString("tr-TR")} ({req.daysRequested} Gün)
                    </p>
                    <p className="text-xs text-slate-400 mt-2 bg-slate-50 p-2 rounded-lg italic dark:bg-zinc-800/40">
                      "{req.reason}"
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition"
                    >
                      <Check size={14} /> Onayla
                    </button>
                    <button
                      onClick={() => setRejectingReqId(req.id)}
                      className="flex items-center gap-1 rounded-lg bg-rose-600 hover:bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white transition"
                    >
                      <X size={14} /> Reddet
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Personal Requests Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
        <h3 className="font-semibold text-slate-800 dark:text-zinc-200">İzin Taleplerim</h3>
        <p className="text-xs text-slate-400 mt-1">Geçmiş ve aktif tüm izin taleplerinizin listesi.</p>

        <div className="overflow-x-auto mt-4">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-zinc-800/50">
                <th className="px-4 py-2.5 font-semibold text-xs uppercase">Tür</th>
                <th className="px-4 py-2.5 font-semibold text-xs uppercase">Tarih Aralığı</th>
                <th className="px-4 py-2.5 font-semibold text-xs uppercase">Gün</th>
                <th className="px-4 py-2.5 font-semibold text-xs uppercase">Açıklama</th>
                <th className="px-4 py-2.5 font-semibold text-xs uppercase">Durum</th>
                <th className="px-4 py-2.5 font-semibold text-xs uppercase">İşlem Yapan / Geri Bildirim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">Yükleniyor...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">İzin talebiniz bulunmuyor.</td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-zinc-200">{req.leaveTypeName}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(req.startDate).toLocaleDateString("tr-TR")} - {new Date(req.endDate).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800 dark:text-zinc-200">{req.daysRequested} Gün</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                    <td className="px-4 py-3 text-xs">
                      {req.status === "Approved" && (
                        <span className="text-slate-500 dark:text-slate-400">Onaylayan: {req.approvedByName}</span>
                      )}
                      {req.status === "Rejected" && (
                        <span className="text-rose-500 font-medium">Gerekçe: {req.rejectionReason}</span>
                      )}
                      {req.status === "Pending" && (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-950 dark:text-white">İzin Talep Formu</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">İzin Türü</label>
                <select
                  name="leaveTypeId"
                  value={formData.leaveTypeId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                >
                  {leaveTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Başlangıç Tarihi</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Bitiş Tarihi</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Talep Nedeni / Gerekçesi</label>
                <textarea
                  name="reason"
                  rows={3}
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="İzinde bulunma sebebiniz..."
                  required
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Comment Dialog */}
      {rejectingReqId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-xl p-5 shadow-xl dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertTriangle size={18} />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">İzin Talebi Red Gerekçesi</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Lütfen çalışana iletilmek üzere talebin reddedilme nedenini açıklayın.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                placeholder="Örn: Operasyon yoğunluğu sebebiyle erteleme rica ederiz."
                required
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setRejectingReqId(null); setRejectionReason(""); }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition"
                >
                  Reddet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
