"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import {
  PayrollDto,
  ExpenseRequestDto,
  payrollAPI,
  expenseAPI,
  userAPI,
  UserDto,
} from "@/lib/api";
import {
  DollarSign,
  Receipt,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Filter,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

type SubTab = "payroll" | "expenses";

const statusColors: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Calculated: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  Approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  Paid: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  Pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  Rejected: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
};

const statusLabels: Record<string, string> = {
  Draft: "Taslak",
  Calculated: "Hesaplandı",
  Approved: "Onaylandı",
  Paid: "Ödendi",
  Pending: "Beklemede",
  Rejected: "Reddedildi",
};

const categoryLabels: Record<string, string> = {
  Travel: "Seyahat",
  Food: "Yemek",
  Accommodation: "Konaklama",
  Equipment: "Ekipman",
  Training: "Eğitim",
  Other: "Diğer",
};

const categoryIcons: Record<string, string> = {
  Travel: "✈️",
  Food: "🍽️",
  Accommodation: "🏨",
  Equipment: "💻",
  Training: "📚",
  Other: "📋",
};

export default function FinanceTab() {
  const { currentUser } = useAppStore();
  const [subTab, setSubTab] = useState<SubTab>("payroll");
  const [payrolls, setPayrolls] = useState<PayrollDto[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRequestDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Expense form
  const [expForm, setExpForm] = useState({
    category: "Travel" as ExpenseRequestDto["category"],
    description: "",
    amount: "",
  });

  const isAdmin = currentUser?.roleName === "Admin" || currentUser?.roleName === "HR" || currentUser?.roleName === "Manager";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [payRes, expRes, userRes] = await Promise.all([
        payrollAPI.getAll(),
        expenseAPI.getAll(),
        userAPI.getAll(),
      ]);
      if (payRes.success) setPayrolls(payRes.data);
      if (expRes.success) setExpenses(expRes.data);
      if (userRes.success) setUsers(userRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleApprovePayroll = async (id: string) => {
    const res = await payrollAPI.approve(id);
    if (res.success) {
      toast.success("Bordro onaylandı");
      setPayrolls(prev => prev.map(p => p.id === id ? res.data : p));
    }
  };

  const handlePayPayroll = async (id: string) => {
    const res = await payrollAPI.pay(id);
    if (res.success) {
      toast.success("Ödeme gerçekleştirildi");
      setPayrolls(prev => prev.map(p => p.id === id ? res.data : p));
    }
  };

  const handleApproveExpense = async (id: string) => {
    if (!currentUser) return;
    const res = await expenseAPI.approve(id, currentUser.id);
    if (res.success) {
      toast.success("Harcama talebi onaylandı");
      setExpenses(prev => prev.map(e => e.id === id ? res.data : e));
    }
  };

  const handleRejectExpense = async (id: string) => {
    const res = await expenseAPI.reject(id, "Bütçe limiti aşıldı");
    if (res.success) {
      toast.success("Harcama talebi reddedildi");
      setExpenses(prev => prev.map(e => e.id === id ? res.data : e));
    }
  };

  const handleCreateExpense = async () => {
    if (!currentUser || !expForm.description || !expForm.amount) return;
    const res = await expenseAPI.create({
      userId: currentUser.id,
      category: expForm.category,
      description: expForm.description,
      amount: parseFloat(expForm.amount),
    });
    if (res.success) {
      toast.success("Harcama talebi oluşturuldu");
      setExpenses(prev => [res.data, ...prev]);
      setShowExpenseModal(false);
      setExpForm({ category: "Travel", description: "", amount: "" });
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);

  // Stats
  const totalPayrollThisMonth = payrolls.filter(p => p.status === "Paid").reduce((s, p) => s + p.netSalary, 0);
  const pendingExpenses = expenses.filter(e => e.status === "Pending");
  const approvedExpenseTotal = expenses.filter(e => e.status === "Approved" || e.status === "Paid").reduce((s, e) => s + e.amount, 0);

  const filteredPayrolls = payrolls.filter(p => {
    const matchSearch = p.userName.toLowerCase().includes(searchTerm.toLowerCase()) || p.departmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPeriod = !periodFilter || p.period === periodFilter;
    return matchSearch && matchPeriod;
  });

  const filteredExpenses = expenses.filter(e =>
    e.userName.toLowerCase().includes(searchTerm.toLowerCase()) || e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const periods = [...new Set(payrolls.map(p => p.period))].sort().reverse();

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Finans & Bordro</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Maaş, bordro ve harcama yönetimi</p>
        </div>
        {subTab === "expenses" && (
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
          >
            <Plus size={14} />
            Harcama Talebi
          </button>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-zinc-900/60 p-1 rounded-xl w-fit">
        {[
          { id: "payroll" as SubTab, label: "Bordro", icon: Banknote },
          { id: "expenses" as SubTab, label: "Harcamalar", icon: Receipt },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setSubTab(tab.id); setSearchTerm(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              subTab === tab.id
                ? "bg-white dark:bg-zinc-800 text-indigo-700 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-700"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Toplam Bordro (Ödenen)</span>
            <div className="h-9 w-9 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
              <DollarSign size={16} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{fmt(totalPayrollThisMonth)}</p>
          <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
            <ArrowUpRight size={10} /> Bu dönem
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Bekleyen Harcama</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <Clock size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{pendingExpenses.length}</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Onay bekliyor</p>
        </div>

        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Onaylanan Harcama</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{fmt(approvedExpenseTotal)}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp size={10} /> Toplam onaylanan
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Toplam Bordro Kaydı</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
              <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{payrolls.length}</p>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">{periods.length} dönem</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Çalışan veya açıklama ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/60 text-xs text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
          />
        </div>
        {subTab === "payroll" && (
          <select
            value={periodFilter}
            onChange={e => setPeriodFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/60 text-xs text-slate-700 dark:text-zinc-200 outline-none"
          >
            <option value="">Tüm Dönemler</option>
            {periods.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}
      </div>

      {/* Content */}
      {subTab === "payroll" ? (
        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-slate-100 dark:border-zinc-800/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800/60">
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-500 dark:text-zinc-400">Çalışan</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-500 dark:text-zinc-400">Dönem</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-slate-500 dark:text-zinc-400">Brüt Maaş</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-slate-500 dark:text-zinc-400">Fazla Mesai</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-slate-500 dark:text-zinc-400">Prim</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-slate-500 dark:text-zinc-400">Kesintiler</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-slate-500 dark:text-zinc-400">Vergi</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-slate-500 dark:text-zinc-400 bg-indigo-50/50 dark:bg-indigo-950/20">Net Maaş</th>
                  <th className="px-5 py-3.5 text-center font-semibold text-slate-500 dark:text-zinc-400">Durum</th>
                  {isAdmin && <th className="px-5 py-3.5 text-center font-semibold text-slate-500 dark:text-zinc-400">İşlem</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/40">
                {filteredPayrolls.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-800 dark:text-white">{p.userName}</div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500">{p.departmentName}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-zinc-300 font-medium">{p.period}</td>
                    <td className="px-5 py-3 text-right text-slate-700 dark:text-zinc-200 font-medium">{fmt(p.baseSalary)}</td>
                    <td className="px-5 py-3 text-right text-slate-600 dark:text-zinc-300">{p.overtime > 0 ? fmt(p.overtime) : "—"}</td>
                    <td className="px-5 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">{p.bonus > 0 ? `+${fmt(p.bonus)}` : "—"}</td>
                    <td className="px-5 py-3 text-right text-rose-500 dark:text-rose-400">{p.deductions > 0 ? `-${fmt(p.deductions)}` : "—"}</td>
                    <td className="px-5 py-3 text-right text-rose-500 dark:text-rose-400">{`-${fmt(p.tax)}`}</td>
                    <td className="px-5 py-3 text-right font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10">{fmt(p.netSalary)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusColors[p.status]}`}>
                        {statusLabels[p.status]}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {p.status === "Calculated" && (
                            <button onClick={() => handleApprovePayroll(p.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 transition-colors" title="Onayla">
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          {p.status === "Approved" && (
                            <button onClick={() => handlePayPayroll(p.id)} className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/30 text-green-600 dark:text-green-400 transition-colors" title="Öde">
                              <CreditCard size={14} />
                            </button>
                          )}
                          {p.status === "Paid" && (
                            <span className="text-[10px] text-green-600 dark:text-green-400">{p.paymentDate}</span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredPayrolls.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center text-slate-400 dark:text-zinc-500">Bordro kaydı bulunamadı</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map(e => (
            <div key={e.id} className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-slate-100 dark:border-zinc-800/60 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-lg shrink-0">
                    {categoryIcons[e.category] || "📋"}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{e.description}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">{e.userName}</span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">•</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">{categoryLabels[e.category]}</span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">•</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">{new Date(e.createdAt).toLocaleDateString("tr-TR")}</span>
                    </div>
                    {e.approvedByName && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Onaylayan: {e.approvedByName}</p>
                    )}
                    {e.rejectionReason && (
                      <p className="text-[10px] text-rose-500 dark:text-rose-400 mt-1">Red sebebi: {e.rejectionReason}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{fmt(e.amount)}</p>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold mt-1 ${statusColors[e.status]}`}>
                    {statusLabels[e.status]}
                  </span>
                  {isAdmin && e.status === "Pending" && (
                    <div className="flex items-center gap-1 mt-2 justify-end">
                      <button
                        onClick={() => handleApproveExpense(e.id)}
                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                        title="Onayla"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                      <button
                        onClick={() => handleRejectExpense(e.id)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                        title="Reddet"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredExpenses.length === 0 && (
            <div className="text-center py-12 text-slate-400 dark:text-zinc-500 text-sm">Harcama talebi bulunamadı</div>
          )}
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowExpenseModal(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5">Yeni Harcama Talebi</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Kategori</label>
                <select
                  value={expForm.category}
                  onChange={e => setExpForm({ ...expForm, category: e.target.value as ExpenseRequestDto["category"] })}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <option key={k} value={k}>{categoryIcons[k]} {v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Açıklama</label>
                <input
                  type="text"
                  value={expForm.description}
                  onChange={e => setExpForm({ ...expForm, description: e.target.value })}
                  placeholder="Harcama açıklaması..."
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Tutar (₺)</label>
                <input
                  type="number"
                  value={expForm.amount}
                  onChange={e => setExpForm({ ...expForm, amount: e.target.value })}
                  placeholder="0"
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExpenseModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleCreateExpense}
                disabled={!expForm.description || !expForm.amount}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
              >
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
