"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { assetAPI, userAPI, UserDto, AssetDto, AssetInventoryDto, AssetReportDto } from "@/lib/api";
import {
  Laptop,
  Smartphone,
  Monitor,
  Cpu,
  Plus,
  Trash2,
  Pencil,
  UserCheck,
  RefreshCw,
  BarChart3,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Package,
  Calendar,
  Layers,
  FileText
} from "lucide-react";
import { toast } from "react-hot-toast";
import { clsx } from "clsx";

export default function AssetsTab() {
  const { currentUser } = useAppStore();
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [summary, setSummary] = useState<AssetInventoryDto | null>(null);
  const [reports, setReports] = useState<AssetReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI Tabs
  const [activeSubTab, setActiveSubTab] = useState<"all" | "reports">("all");
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  
  // Selected item states
  const [selectedAsset, setSelectedAsset] = useState<AssetDto | null>(null);
  
  // Form States
  const [assetForm, setAssetForm] = useState({
    type: "Laptop",
    name: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    purchasePrice: 0,
    condition: "New",
    notes: ""
  });
  
  const [allocateForm, setAllocateForm] = useState({
    userId: "",
    notes: ""
  });
  
  const [returnForm, setReturnForm] = useState({
    condition: "Good"
  });

  const userRole = currentUser?.roleName || "Employee";
  const isManagerOrHR = ["Admin", "Manager", "HR"].includes(userRole);

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Assets
      if (isManagerOrHR) {
        const assetsRes = await assetAPI.getAll();
        if (assetsRes.success) {
          setAssets(assetsRes.data);
        }
        
        const summaryRes = await assetAPI.getSummary();
        if (summaryRes.success) {
          setSummary(summaryRes.data);
        }

        const reportRes = await assetAPI.getReport();
        if (reportRes.success) {
          setReports(reportRes.data);
        }

        const usersRes = await userAPI.getAll();
        if (usersRes.success) {
          setUsers(usersRes.data.filter(u => u.isActive));
        }
      } else if (currentUser) {
        const userAssetsRes = await assetAPI.getByUser(currentUser.id);
        if (userAssetsRes.success) {
          setAssets(userAssetsRes.data);
        }
      }
    } catch (err) {
      toast.error("Varlık verileri yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Create Form Handling
  const handleOpenCreate = () => {
    setAssetForm({
      type: "Laptop",
      name: "",
      model: "",
      serialNumber: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      purchasePrice: 0,
      condition: "New",
      notes: ""
    });
    setShowCreateModal(true);
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.name.trim() || !assetForm.serialNumber.trim()) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }
    try {
      const res = await assetAPI.create({
        ...assetForm,
        purchasePrice: Number(assetForm.purchasePrice)
      });
      if (res.success) {
        toast.success(res.message || "Zimmet varlığı başarıyla eklendi.");
        setShowCreateModal(false);
        fetchData();
      } else {
        toast.error(res.message || "Ekleme başarısız.");
      }
    } catch (err) {
      toast.error("İşlem gerçekleştirilemedi.");
    }
  };

  // Edit Form Handling
  const handleOpenEdit = (asset: AssetDto) => {
    setSelectedAsset(asset);
    setAssetForm({
      type: asset.type,
      name: asset.name,
      model: asset.model,
      serialNumber: asset.serialNumber,
      purchaseDate: asset.purchaseDate ? asset.purchaseDate.split("T")[0] : "",
      purchasePrice: asset.purchasePrice,
      condition: asset.condition,
      notes: asset.notes || ""
    });
    setShowEditModal(true);
  };

  const handleEditAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    if (!assetForm.name.trim() || !assetForm.serialNumber.trim()) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }
    try {
      const res = await assetAPI.update(selectedAsset.id, {
        ...assetForm,
        purchasePrice: Number(assetForm.purchasePrice)
      });
      if (res.success) {
        toast.success(res.message || "Zimmet varlığı güncellendi.");
        setShowEditModal(false);
        fetchData();
      } else {
        toast.error(res.message || "Güncelleme başarısız.");
      }
    } catch (err) {
      toast.error("İşlem gerçekleştirilemedi.");
    }
  };

  // Delete Asset
  const handleDeleteAsset = async (id: string) => {
    if (!window.confirm("Bu zimmet varlığını silmek istediğinize emin misiniz?")) return;
    try {
      const res = await assetAPI.delete(id);
      if (res.success) {
        toast.success(res.message || "Zimmet varlığı silindi.");
        fetchData();
      } else {
        toast.error(res.message || "Silme başarısız.");
      }
    } catch (err) {
      toast.error("İşlem gerçekleştirilemedi.");
    }
  };

  // Allocate Handling
  const handleOpenAllocate = (asset: AssetDto) => {
    setSelectedAsset(asset);
    setAllocateForm({
      userId: users[0]?.id || "",
      notes: ""
    });
    setShowAllocateModal(true);
  };

  const handleAllocateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !allocateForm.userId) return;
    try {
      const res = await assetAPI.allocate(selectedAsset.id, {
        userId: allocateForm.userId,
        notes: allocateForm.notes
      });
      if (res.success) {
        toast.success(res.message || "Zimmet ataması tamamlandı.");
        setShowAllocateModal(false);
        fetchData();
      } else {
        toast.error(res.message || "Atama başarısız.");
      }
    } catch (err) {
      toast.error("İşlem gerçekleştirilemedi.");
    }
  };

  // Return Handling
  const handleOpenReturn = (asset: AssetDto) => {
    setSelectedAsset(asset);
    setReturnForm({
      condition: asset.condition
    });
    setShowReturnModal(true);
  };

  const handleReturnAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      const res = await assetAPI.return(selectedAsset.id, returnForm.condition);
      if (res.success) {
        toast.success(res.message || "Zimmet iade alındı.");
        setShowReturnModal(false);
        fetchData();
      } else {
        toast.error(res.message || "İade işlemi başarısız.");
      }
    } catch (err) {
      toast.error("İşlem gerçekleştirilemedi.");
    }
  };

  const getAssetTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "laptop":
      case "computer":
        return <Laptop size={16} className="text-blue-500" />;
      case "phone":
      case "mobile":
        return <Smartphone size={16} className="text-teal-500" />;
      case "monitor":
      case "screen":
        return <Monitor size={16} className="text-violet-500" />;
      case "accessories":
      case "keyboard":
      case "mouse":
        return <Cpu size={16} className="text-amber-500" />;
      default:
        return <Package size={16} className="text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"><CheckCircle2 size={10} /> Boşta</span>;
      case "Assigned":
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400"><UserCheck size={10} /> Zimmetli</span>;
      case "Broken":
        return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"><XCircle size={10} /> Arızalı</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300"><AlertCircle size={10} /> {status}</span>;
    }
  };

  const getConditionColor = (cond: string) => {
    switch (cond.toLowerCase()) {
      case "new":
        return "text-emerald-600 dark:text-emerald-400 font-semibold";
      case "good":
        return "text-indigo-600 dark:text-indigo-400 font-medium";
      case "fair":
        return "text-amber-600 dark:text-amber-400";
      case "broken":
        return "text-rose-600 dark:text-rose-400 font-semibold";
      default:
        return "text-slate-600 dark:text-slate-400";
    }
  };

  // Filter Assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.currentAssigneeName && asset.currentAssigneeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (asset.model && asset.model.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === "" || asset.type === typeFilter;
    const matchesStatus = statusFilter === "" || asset.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Stats (Only for managers) */}
      {isManagerOrHR && summary && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toplam Varlık</h4>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 dark:text-zinc-100">{summary.totalAssets}</span>
              <span className="text-xs text-slate-400">adet</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-800">
              <div className="h-full rounded-full bg-indigo-600" style={{ width: "100%" }}></div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zimmetliler</h4>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 dark:text-zinc-100">{summary.assignedAssets}</span>
              <span className="text-xs text-slate-400">/ {summary.totalAssets}</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${(summary.assignedAssets / summary.totalAssets) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kullanılabilir Boşta</h4>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 dark:text-zinc-100">{summary.availableAssets}</span>
              <span className="text-xs text-slate-400">/ {summary.totalAssets}</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${(summary.availableAssets / summary.totalAssets) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arızalı Varlık</h4>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-850 dark:text-rose-400">{summary.brokenAssets}</span>
              <span className="text-xs text-slate-400">adet</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-rose-500 transition-all"
                style={{ width: `${(summary.brokenAssets / summary.totalAssets) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-zinc-900 col-span-2 sm:col-span-1">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Envanter Değeri</h4>
            <div className="mt-2 flex items-baseline gap-1 text-indigo-600 dark:text-indigo-400">
              <span className="text-lg font-bold">{summary.totalInventoryValue.toLocaleString("tr-TR")}</span>
              <span className="text-xs font-semibold">TRY</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-2">Toplam satın alma maliyeti</p>
          </div>
        </div>
      )}

      {/* 2. Top Navigation for Admin/HR */}
      {isManagerOrHR ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveSubTab("all")}
              className={clsx(
                "pb-2 text-xs font-bold transition-all relative tracking-wide",
                activeSubTab === "all"
                  ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              )}
            >
              Envanter Listesi
            </button>
            <button
              onClick={() => setActiveSubTab("reports")}
              className={clsx(
                "pb-2 text-xs font-bold transition-all relative tracking-wide",
                activeSubTab === "reports"
                  ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              )}
            >
              Departman Zimmet Raporu
            </button>
          </div>
          {activeSubTab === "all" && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-semibold shadow-sm transition"
            >
              <Plus size={14} /> Yeni Varlık Ekle
            </button>
          )}
        </div>
      ) : (
        <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
          <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">Zimmetimdeki Varlıklar</h3>
          <p className="text-xs text-slate-400">Şirket tarafından kullanımınıza tahsis edilmiş bilgisayar, telefon vb. envanterlerin listesi.</p>
        </div>
      )}

      {/* 3. Main Data Content */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"></div>
          <p className="text-xs text-slate-400 mt-2">Varlıklar yükleniyor...</p>
        </div>
      ) : (
        <>
          {/* A. VIEW FOR EMPLOYEES OR MANAGER VIEWING ALL */}
          {(!isManagerOrHR || activeSubTab === "all") && (
            <div className="space-y-4">
              {/* Search and Filters Bar (Managers only) */}
              {isManagerOrHR && (
                <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-zinc-900/30 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="İsim, seri no, model veya atanan kişi ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-white dark:bg-zinc-950 dark:border-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white dark:bg-zinc-950 dark:border-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Tüm Türler</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Phone">Telefon</option>
                      <option value="Monitor">Monitör</option>
                      <option value="Accessories">Aksesuar</option>
                    </select>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white dark:bg-zinc-950 dark:border-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Tüm Durumlar</option>
                      <option value="Available">Boşta</option>
                      <option value="Assigned">Zimmetli</option>
                      <option value="Broken">Arızalı</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Table / List */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-zinc-800/40">
                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Tür</th>
                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Varlık Adı / Model</th>
                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Seri Numarası</th>
                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Durum</th>
                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Kondisyon</th>
                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Atanan Kişi / Tarih</th>
                        {isManagerOrHR && <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">İşlemler</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredAssets.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-slate-400">
                            Aradığınız kriterlere uygun zimmet varlığı bulunamadı.
                          </td>
                        </tr>
                      ) : (
                        filteredAssets.map((asset) => (
                          <tr key={asset.id} className="hover:bg-slate-50/40 dark:hover:bg-zinc-800/10">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800">
                                  {getAssetTypeIcon(asset.type)}
                                </span>
                                <span className="font-semibold text-slate-700 dark:text-zinc-300">{asset.type}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-slate-900 dark:text-white">{asset.name}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{asset.model}</div>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-slate-500 dark:text-slate-400">
                              {asset.serialNumber}
                            </td>
                            <td className="px-4 py-3.5">
                              {getStatusBadge(asset.status)}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={clsx("text-xs font-semibold", getConditionColor(asset.condition))}>
                                {asset.condition === "New" ? "Yeni" : asset.condition === "Good" ? "İyi" : asset.condition === "Fair" ? "Orta" : "Arızalı"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              {asset.status === "Assigned" ? (
                                <div>
                                  <div className="font-semibold text-slate-800 dark:text-zinc-200">
                                    {asset.currentAssigneeName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                    <Calendar size={10} />
                                    {asset.assignmentDate ? new Date(asset.assignmentDate).toLocaleDateString("tr-TR") : "-"}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            {isManagerOrHR && (
                              <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                <div className="inline-flex gap-1.5">
                                  {asset.status === "Available" ? (
                                    <button
                                      onClick={() => handleOpenAllocate(asset)}
                                      className="flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 px-2 py-1 text-[10px] font-bold transition"
                                    >
                                      Zimmetle
                                    </button>
                                  ) : asset.status === "Assigned" ? (
                                    <button
                                      onClick={() => handleOpenReturn(asset)}
                                      className="flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 px-2 py-1 text-[10px] font-bold transition"
                                    >
                                      İade Al
                                    </button>
                                  ) : null}
                                  
                                  <button
                                    onClick={() => handleOpenEdit(asset)}
                                    title="Düzenle"
                                    className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAsset(asset.id)}
                                    title="Sil"
                                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* B. VIEW FOR MANAGER REPORT TAB */}
          {isManagerOrHR && activeSubTab === "reports" && (
            <div className="space-y-6">
              {reports.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-zinc-900">
                  <FileText className="mx-auto text-slate-350" size={32} />
                  <p className="text-xs text-slate-400 mt-2">Henüz atanmış varlık bulunmadığından zimmet raporu oluşturulamadı.</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.departmentId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">{report.departmentName} Departmanı</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Departman üyelerine zimmetlenmiş varlıkların envanteri.</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="text-slate-400">Atanan Varlık: <strong className="text-slate-700 dark:text-zinc-200">{report.totalAssetsAllocated}</strong> adet</span>
                        <span className="text-slate-400">Toplam Mali Değer: <strong className="text-indigo-600 dark:text-indigo-400">{report.totalValue.toLocaleString("tr-TR")} TRY</strong></span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {report.allocatedAssets.map((asset) => (
                        <div key={asset.id} className="flex flex-col justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800/40 dark:bg-zinc-900/30">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{asset.type}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{asset.serialNumber}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-zinc-100 mt-1">{asset.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{asset.model}</p>
                            
                            <div className="mt-3 text-[10px] text-slate-500 dark:text-slate-400 space-y-1 bg-white p-2 rounded dark:bg-zinc-900">
                              <div className="flex justify-between">
                                <span>Zimmetli Personel:</span>
                                <span className="font-semibold text-slate-800 dark:text-zinc-200">{asset.currentAssigneeName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Atama Tarihi:</span>
                                <span>{asset.assignmentDate ? new Date(asset.assignmentDate).toLocaleDateString("tr-TR") : "-"}</span>
                              </div>
                              {asset.notes && (
                                <div className="border-t border-slate-100 dark:border-slate-800 pt-1 text-[9px] italic text-slate-400 truncate" title={asset.notes}>
                                  "{asset.notes}"
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {isManagerOrHR && (
                            <div className="mt-3 flex justify-end border-t border-slate-100 dark:border-slate-800 pt-2.5">
                              <button
                                onClick={() => handleOpenReturn(asset)}
                                className="flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 px-2 py-1 text-[9px] font-bold transition"
                              >
                                Zimmeti İade Al
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* ==================================================== */}
      {/* 4. MODALS IMPLEMENTATIONS                            */}
      {/* ==================================================== */}

      {/* CREATE ASSET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-zinc-900 text-left">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 border-b pb-2 mb-4">Yeni Zimmet Varlığı Kaydet</h3>
            <form onSubmit={handleCreateAsset} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Varlık Türü</label>
                  <select
                    value={assetForm.type}
                    onChange={(e) => setAssetForm({ ...assetForm, type: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Phone">Telefon</option>
                    <option value="Monitor">Monitör</option>
                    <option value="Accessories">Aksesuar / Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Kondisyon</label>
                  <select
                    value={assetForm.condition}
                    onChange={(e) => setAssetForm({ ...assetForm, condition: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="New">Sıfır / Yeni</option>
                    <option value="Good">İyi</option>
                    <option value="Fair">Orta / Yıpranmış</option>
                    <option value="Broken">Arızalı</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Cihaz Adı *</label>
                <input
                  type="text"
                  placeholder="örn. MacBook Pro M3"
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Model / Özellikler</label>
                <input
                  type="text"
                  placeholder="örn. 16 inç, 18GB RAM, 512GB SSD"
                  value={assetForm.model}
                  onChange={(e) => setAssetForm({ ...assetForm, model: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Seri Numarası *</label>
                <input
                  type="text"
                  placeholder="örn. C02F1234QWER"
                  value={assetForm.serialNumber}
                  onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Satın Alım Tarihi</label>
                  <input
                    type="date"
                    value={assetForm.purchaseDate}
                    onChange={(e) => setAssetForm({ ...assetForm, purchaseDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Fiyat (TRY)</label>
                  <input
                    type="number"
                    value={assetForm.purchasePrice}
                    onChange={(e) => setAssetForm({ ...assetForm, purchasePrice: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Notlar / Açıklama</label>
                <textarea
                  rows={2}
                  value={assetForm.notes}
                  onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ASSET MODAL */}
      {showEditModal && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-zinc-900 text-left">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 border-b pb-2 mb-4">Zimmet Varlığı Düzenle</h3>
            <form onSubmit={handleEditAsset} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Varlık Türü</label>
                  <select
                    value={assetForm.type}
                    onChange={(e) => setAssetForm({ ...assetForm, type: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Phone">Telefon</option>
                    <option value="Monitor">Monitör</option>
                    <option value="Accessories">Aksesuar / Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Kondisyon</label>
                  <select
                    value={assetForm.condition}
                    onChange={(e) => setAssetForm({ ...assetForm, condition: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="New">Sıfır / Yeni</option>
                    <option value="Good">İyi</option>
                    <option value="Fair">Orta / Yıpranmış</option>
                    <option value="Broken">Arızalı</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Cihaz Adı *</label>
                <input
                  type="text"
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Model / Özellikler</label>
                <input
                  type="text"
                  value={assetForm.model}
                  onChange={(e) => setAssetForm({ ...assetForm, model: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Seri Numarası *</label>
                <input
                  type="text"
                  value={assetForm.serialNumber}
                  onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Satın Alım Tarihi</label>
                  <input
                    type="date"
                    value={assetForm.purchaseDate}
                    onChange={(e) => setAssetForm({ ...assetForm, purchaseDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Fiyat (TRY)</label>
                  <input
                    type="number"
                    value={assetForm.purchasePrice}
                    onChange={(e) => setAssetForm({ ...assetForm, purchasePrice: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Notlar / Açıklama</label>
                <textarea
                  rows={2}
                  value={assetForm.notes}
                  onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ALLOCATE ASSET MODAL */}
      {showAllocateModal && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-zinc-900 text-left">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 border-b pb-2 mb-4">Zimmet Ataması Yap</h3>
            
            <div className="mb-4 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-100/60 dark:border-indigo-900/40">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{selectedAsset.type}</span>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">{selectedAsset.name}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">{selectedAsset.model} | S/N: {selectedAsset.serialNumber}</p>
            </div>

            <form onSubmit={handleAllocateAsset} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Zimmetlenecek Çalışan *</label>
                <select
                  value={allocateForm.userId}
                  onChange={(e) => setAllocateForm({ ...allocateForm, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  required
                >
                  <option value="" disabled>Seçiniz...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.departmentName} - {u.positionTitle})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Atama Notu / Açıklama</label>
                <textarea
                  rows={3}
                  placeholder="Kullanıcıya teslim ederken alınan ek notlar..."
                  value={allocateForm.notes}
                  onChange={(e) => setAllocateForm({ ...allocateForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm"
                >
                  Zimmetle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN ASSET MODAL */}
      {showReturnModal && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-zinc-900 text-left">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 border-b pb-2 mb-4">Zimmeti İade Al</h3>

            <div className="mb-4 bg-slate-50 p-3 rounded-lg dark:bg-zinc-900/60 border dark:border-slate-850">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{selectedAsset.type}</span>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">{selectedAsset.name}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Zimmet Sahibi: {selectedAsset.currentAssigneeName}</p>
            </div>

            <form onSubmit={handleReturnAsset} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Cihazın İade Sırasındaki Kondisyonu *</label>
                <select
                  value={returnForm.condition}
                  onChange={(e) => setReturnForm({ condition: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  required
                >
                  <option value="New">Sıfır Gibi / Yeni</option>
                  <option value="Good">İyi</option>
                  <option value="Fair">Orta / Yıpranmış</option>
                  <option value="Broken">Arızalı / Bozuk</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm"
                >
                  İadeyi Tamamla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
