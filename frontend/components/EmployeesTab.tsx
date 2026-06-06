"use client";

import React, { useState, useEffect } from "react";
import { userAPI, departmentAPI, positionAPI, documentAPI, UserDto, DepartmentDto, PositionDto } from "@/lib/api";
import { Search, Filter, Plus, Edit2, Trash2, X, Eye, FileText, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { clsx } from "clsx";

export default function EmployeesTab() {
  const [employees, setEmployees] = useState<UserDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [positions, setPositions] = useState<PositionDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<UserDto | null>(null);

  // Documents state
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    if (showDetailModal && selectedEmp) {
      loadDocuments(selectedEmp.id);
    }
  }, [showDetailModal, selectedEmp]);

  const loadDocuments = async (userId: string) => {
    try {
      const res = await documentAPI.getByUser(userId);
      if (res.success && res.data) {
        setDocuments(res.data);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      toast.error("Belgeler yüklenirken hata oluştu");
    }
  };

  const handleUpload = async (userId: string, docType: string, file: File) => {
    setUploadingDoc(true);
    try {
      const res = await documentAPI.upload(userId, docType, file);
      if (res.success) {
        toast.success(`${docType} başarıyla yüklendi`);
        loadDocuments(userId);
      } else {
        toast.error(res.message || "Yükleme başarısız");
      }
    } catch (err) {
      toast.error("Yükleme sırasında hata oluştu");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      await documentAPI.download(docId, fileName);
    } catch (err) {
      toast.error("Dosya indirilemedi");
    }
  };

  const handleDeleteDoc = async (docId: string, userId: string) => {
    if (!confirm("Bu belgeyi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await documentAPI.delete(docId);
      if (res.success) {
        toast.success("Belge silindi");
        loadDocuments(userId);
      } else {
        toast.error(res.message || "Silme başarısız");
      }
    } catch (err) {
      toast.error("Silme işlemi sırasında hata oluştu");
    }
  };

  // Form State (shared for add & edit)
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "Password123!",
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    gender: "Male",
    identityNumber: "",
    address: "",
    city: "",
    country: "Turkey",
    departmentId: "",
    positionId: "",
    roleId: "role_employee",
    hireDate: "",
    emergencyContactName: "",
    emergencyContactPhone: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const empRes = await userAPI.getAll();
      const deptRes = await departmentAPI.getAll();
      const posRes = await positionAPI.getAll();

      if (empRes.success) setEmployees(empRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
      if (posRes.success) setPositions(posRes.data);
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

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({
      email: "",
      password: "Password123!",
      firstName: "",
      lastName: "",
      phone: "",
      dateOfBirth: "1990-01-01",
      gender: "Male",
      identityNumber: "",
      address: "",
      city: "",
      country: "Turkey",
      departmentId: departments[0]?.id || "",
      positionId: positions[0]?.id || "",
      roleId: "role_employee",
      hireDate: new Date().toISOString().split("T")[0],
      emergencyContactName: "",
      emergencyContactPhone: ""
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (emp: UserDto) => {
    setIsEditMode(true);
    setSelectedEmp(emp);
    setFormData({
      email: emp.email,
      password: "", // ignore on edit
      firstName: emp.firstName,
      lastName: emp.lastName,
      phone: emp.phone,
      dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split("T")[0] : "1990-01-01",
      gender: emp.gender || "Male",
      identityNumber: emp.identityNumber || "",
      address: emp.address || "",
      city: emp.city || "",
      country: emp.country || "Turkey",
      departmentId: emp.departmentId || "",
      positionId: emp.positionId || "",
      roleId: emp.roleId || "role_employee",
      hireDate: emp.hireDate ? emp.hireDate.split("T")[0] : "",
      emergencyContactName: emp.emergencyContactName || "",
      emergencyContactPhone: emp.emergencyContactPhone || ""
    });
    setShowAddModal(true);
  };

  const handleOpenDetail = (emp: UserDto) => {
    setSelectedEmp(emp);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Ad, soyad ve e-posta zorunludur");
      return;
    }

    try {
      if (isEditMode && selectedEmp) {
        // Update user
        const res = await userAPI.update(selectedEmp.id, formData);
        if (res.success) {
          toast.success(res.message || "Personel kaydı güncellendi");
          setShowAddModal(false);
          fetchData();
        }
      } else {
        // Create user
        const res = await userAPI.create(formData);
        if (res.success) {
          toast.success(res.message || "Personel kaydı oluşturuldu");
          setShowAddModal(false);
          fetchData();
        }
      }
    } catch (err) {
      toast.error("Kaydetme işlemi başarısız");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu personeli arşivlemek istediğinize emin misiniz?")) return;
    try {
      const res = await userAPI.delete(id);
      if (res.success) {
        toast.success(res.message || "Çalışan arşive taşındı");
        fetchData();
      }
    } catch (err) {
      toast.error("İşlem başarısız");
    }
  };

  // Reset pagination on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, deptFilter, roleFilter]);

  // Filter logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (emp.positionTitle && emp.positionTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = deptFilter ? emp.departmentId === deptFilter : true;
    const matchesRole = roleFilter ? emp.roleId === roleFilter : true;

    return matchesSearch && matchesDept && matchesRole;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-2.5 left-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="İsim, e-posta veya pozisyon ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-900 dark:border-slate-800 dark:text-white"
          />
        </div>

        {/* Filters & Add button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-zinc-900">
            <Filter size={14} className="text-slate-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-600 focus:outline-none dark:text-slate-300"
            >
              <option value="">Tüm Departmanlar</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 border border-slate-200 rounded-xl bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-zinc-900">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-600 focus:outline-none dark:text-slate-300"
            >
              <option value="">Tüm Roller</option>
              <option value="role_admin">Admin</option>
              <option value="role_manager">Yönetici (Manager)</option>
              <option value="role_hr">İnsan Kaynakları (HR)</option>
              <option value="role_employee">Çalışan (Employee)</option>
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
          >
            <Plus size={14} /> Yeni Çalışan Ekle
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-zinc-900">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-zinc-800/50">
              <th className="px-6 py-3.5 font-semibold text-xs uppercase">Çalışan</th>
              <th className="px-6 py-3.5 font-semibold text-xs uppercase">Departman / Pozisyon</th>
              <th className="px-6 py-3.5 font-semibold text-xs uppercase">Rol</th>
              <th className="px-6 py-3.5 font-semibold text-xs uppercase">Giriş Tarihi</th>
              <th className="px-6 py-3.5 font-semibold text-xs uppercase">Durum</th>
              <th className="px-6 py-3.5 font-semibold text-xs uppercase text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  Veriler yükleniyor...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  Sonuç bulunamadı.
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600 uppercase dark:bg-indigo-900/30 dark:text-indigo-400">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-zinc-100">{emp.fullName}</span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">{emp.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-medium text-slate-800 dark:text-zinc-200">{emp.positionTitle || "Belirtilmemiş"}</span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">{emp.departmentName || "Organizasyon Dışı"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      emp.roleId === "role_admin" ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400" :
                      emp.roleId === "role_manager" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400" :
                      emp.roleId === "role_hr" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400" :
                      "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      {emp.roleName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                    {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString("tr-TR") : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      emp.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-slate-100 text-slate-500"
                    )}>
                      <span className={clsx("h-1.5 w-1.5 rounded-full", emp.isActive ? "bg-emerald-500" : "bg-slate-400")}></span>
                      {emp.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenDetail(emp)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg dark:hover:bg-zinc-800"
                        title="Profili İncele"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg dark:hover:bg-zinc-800"
                        title="Düzenle"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg dark:hover:bg-rose-950/20"
                        title="Sil"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {!loading && filteredEmployees.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-800/10">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Toplam <span className="font-semibold text-slate-700 dark:text-zinc-200">{filteredEmployees.length}</span> çalışandan{" "}
              <span className="font-semibold text-slate-700 dark:text-zinc-200">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
              <span className="font-semibold text-slate-700 dark:text-zinc-200">
                {Math.min(currentPage * itemsPerPage, filteredEmployees.length)}
              </span>{" "}
              arası gösteriliyor
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white dark:border-slate-800 dark:bg-zinc-900 dark:text-slate-300 dark:hover:bg-zinc-800 dark:disabled:hover:bg-zinc-900 transition-colors"
              >
                <ChevronLeft size={14} /> Önceki
              </button>
              
              {/* Page buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((page, index, array) => {
                  const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsisBefore && (
                        <span className="px-2 text-xs text-slate-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={clsx(
                          "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                          currentPage === page
                            ? "bg-indigo-600 text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-zinc-900 dark:text-slate-300 dark:hover:bg-zinc-800"
                        )}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white dark:border-slate-800 dark:bg-zinc-900 dark:text-slate-300 dark:hover:bg-zinc-800 dark:disabled:hover:bg-zinc-900 transition-colors"
              >
                Sonraki <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Sliding Drawer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 h-screen overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditMode ? "Çalışan Bilgilerini Düzenle" : "Yeni Çalışan Kaydet"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              {/* Form Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Adı</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Soyadı</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Kurumsal E-posta</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    required
                    disabled={isEditMode}
                  />
                </div>

                {!isEditMode && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Geçici Şifre</label>
                    <input
                      type="text"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Telefon</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">T.C. Kimlik No</label>
                  <input
                    type="text"
                    name="identityNumber"
                    value={formData.identityNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Doğum Tarihi</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Cinsiyet</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="Male">Erkek</option>
                    <option value="Female">Kadın</option>
                    <option value="Other">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Departman</label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Pozisyon</label>
                  <select
                    name="positionId"
                    value={formData.positionId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  >
                    {positions.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Yetki Rolü</label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="role_employee">Personel (Employee)</option>
                    <option value="role_hr">İnsan Kaynakları (HR)</option>
                    <option value="role_manager">Yönetici (Manager)</option>
                    <option value="role_admin">Sistem Yöneticisi (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">İşe Başlama Tarihi</label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="col-span-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-3">Acil Durum İletişim Bilgileri</h4>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">İrtibat Kişisi</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    placeholder="Ad Soyad ve Yakınlık Derecesi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">İrtibat Telefonu</label>
                  <input
                    type="text"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="col-span-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-3">Adres Bilgileri</h4>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Açık Adres</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Şehir</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Ülke</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end border-t border-slate-100 pt-6 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-zinc-800"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Detail Modal */}
      {showDetailModal && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-950 dark:text-white">Çalışan Detaylı Özlük Dosyası</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Header profile info */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl dark:bg-zinc-800/40">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 font-bold text-white text-lg shrink-0 uppercase">
                  {selectedEmp.firstName[0]}{selectedEmp.lastName[0]}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{selectedEmp.fullName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedEmp.positionTitle} - {selectedEmp.departmentName}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Sistem Rolü: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedEmp.roleName}</span></p>
                </div>
              </div>

              {/* Data list */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">E-POSTA</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-200 mt-1 block">{selectedEmp.email}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">TELEFON</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-200 mt-1 block">{selectedEmp.phone || "-"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">T.C. KİMLİK NUMARASI</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-200 mt-1 block">{selectedEmp.identityNumber || "-"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">DOĞUM TARİHİ</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-200 mt-1 block">
                    {selectedEmp.dateOfBirth ? new Date(selectedEmp.dateOfBirth).toLocaleDateString("tr-TR") : "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">GİRİŞ TARİHİ</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-200 mt-1 block">
                    {selectedEmp.hireDate ? new Date(selectedEmp.hireDate).toLocaleDateString("tr-TR") : "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">CİNSİYET</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-200 mt-1 block">{selectedEmp.gender === "Male" ? "Erkek" : selectedEmp.gender === "Female" ? "Kadın" : "Diğer"}</span>
                </div>
                <div className="col-span-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">ADRES</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-200 mt-1 block">
                    {selectedEmp.address ? `${selectedEmp.address}, ${selectedEmp.city} / ${selectedEmp.country}` : "-"}
                  </span>
                </div>
                <div className="col-span-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <h5 className="font-bold text-slate-800 dark:text-zinc-300 text-xs">Acil Durum İletişim Kişisi</h5>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span className="text-[10px] text-slate-400">İrtibat Adı / Yakınlık</span>
                      <span className="block font-medium text-slate-700 dark:text-zinc-200 mt-0.5">{selectedEmp.emergencyContactName || "-"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">İrtibat Telefonu</span>
                      <span className="block font-medium text-slate-700 dark:text-zinc-200 mt-0.5">{selectedEmp.emergencyContactPhone || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Evraklar (Documents) Section */}
                <div className="col-span-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <h5 className="font-bold text-slate-800 dark:text-zinc-300 text-xs mb-2">Özlük Evrakları & Belgeler</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {["Nüfus Cüzdanı", "İkametgah Belgesi", "Diploma", "Sertifika", "CV / Özgeçmiş"].map((docType) => {
                      const existingDoc = documents.find(d => d.documentType === docType);
                      return (
                        <div key={docType} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg dark:bg-zinc-800/40 border border-slate-100 dark:border-slate-800/50">
                          <div className="flex items-center gap-2 overflow-hidden mr-1">
                            <FileText size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate" title={existingDoc ? existingDoc.fileName : docType}>
                              {existingDoc ? existingDoc.fileName : docType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {existingDoc ? (
                              <>
                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full dark:bg-emerald-950/20">Yüklendi</span>
                                <button
                                  onClick={() => handleDownload(existingDoc.id, existingDoc.fileName)}
                                  className="text-slate-500 hover:text-indigo-600 p-1 rounded transition"
                                  title="İndir"
                                >
                                  <ChevronRight size={14} className="rotate-90" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDoc(existingDoc.id, selectedEmp.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                                  title="Sil"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full dark:bg-amber-950/20">Eksik</span>
                                <label className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer transition">
                                  Yükle
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleUpload(selectedEmp.id, docType, file);
                                      }
                                    }}
                                  />
                                </label>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
