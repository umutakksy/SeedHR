"use client";

import React, { useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { mockDb, authAPI, importAPI, ImportResultDto } from "@/lib/api";
import { Settings, Shield, RefreshCw, LogIn, Upload, Download, FileSpreadsheet, CheckCircle, AlertTriangle, X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SettingsTab() {
  const { currentUser, login, logout } = useAppStore();
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResultDto | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const quickUsers = [
    { email: "selim@seedhr.com.tr", name: "Selim Aksoy (Admin)", role: "Admin" },
    { email: "ahmet@seedhr.com.tr", name: "Ahmet Yılmaz (Yönetici)", role: "Manager" },
    { email: "elif@seedhr.com.tr", name: "Elif Kaya (İK)", role: "HR" },
    { email: "can@seedhr.com.tr", name: "Can Demir (Çalışan)", role: "Employee" }
  ];

  const handleQuickLogin = async (email: string) => {
    try {
      const res = await authAPI.login({ email, password: "Password123!" });
      if (res.success) {
        login(res.data.user, res.data.token);
        toast.success(`Hızlı Giriş Başarılı: ${res.data.user.fullName}`);
        window.location.reload();
      }
    } catch (err) {
      toast.error("Giriş başarısız");
    }
  };

  const handleResetDb = () => {
    if (window.confirm("Tüm demo veritabanını sıfırlamak istediğinize emin misiniz? Yapılan değişiklikler silinecektir.")) {
      if (typeof window !== "undefined") {
        const keys = Object.keys(localStorage);
        keys.forEach(k => {
          if (k.startsWith("seedhr_db_")) {
            localStorage.removeItem(k);
          }
        });
        toast.success("Veritabanı başarıyla sıfırlandı. Sayfa yenileniyor...");
        setTimeout(() => window.location.reload(), 1500);
      }
    }
  };

  const handleExcelUpload = async (file: File) => {
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "xls") {
      toast.error("Sadece .xlsx veya .xls dosyaları desteklenir.");
      return;
    }

    setUploading(true);
    setImportResult(null);

    try {
      const res = await importAPI.uploadExcel(file);
      if (res.success) {
        setImportResult(res.data);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Dosya yükleme sırasında hata oluştu.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleExcelUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleExcelUpload(file);
  };

  const isAdmin = currentUser?.roleName === "Admin";

  return (
    <div className="space-y-6 max-w-3xl text-left">

      {/* Excel Import — Only visible to Admin */}
      {isAdmin && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-emerald-600" size={18} />
            <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Excel ile Toplu Veri Yükleme</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Firmaların çalışan, departman ve pozisyon bilgilerini Excel dosyasıyla toplu olarak sisteme aktarın.
          </p>

          {/* Template Download */}
          <div className="mt-4 flex items-center gap-3">
            <a
              href={importAPI.getTemplateUrl()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 px-3 py-1.5 text-xs font-semibold transition"
            >
              <Download size={14} />
              Boş Şablon İndir (.xlsx)
            </a>
            <span className="text-[10px] text-slate-400">
              3 sheet: Departmanlar, Pozisyonlar, Çalışanlar
            </span>
          </div>

          {/* Drag & Drop Upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 px-4 cursor-pointer transition-all ${
              dragOver
                ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30"
                : "border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            {uploading ? (
              <>
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600"></span>
                <span className="text-xs text-slate-500">Dosya yükleniyor ve işleniyor...</span>
              </>
            ) : (
              <>
                <Upload className="text-slate-400" size={28} />
                <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                  Excel dosyasını sürükleyin veya tıklayarak seçin
                </span>
                <span className="text-[10px] text-slate-400">.xlsx veya .xls — Maks. 10 MB</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Import Result */}
          {importResult && (
            <div className="mt-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-emerald-600" size={16} />
                  <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                    Import Tamamlandı
                  </span>
                </div>
                <button onClick={() => setImportResult(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-3 text-center">
                  <div className="text-lg font-bold text-indigo-600">{importResult.usersImported}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Çalışan</div>
                </div>
                <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-3 text-center">
                  <div className="text-lg font-bold text-emerald-600">{importResult.departmentsImported}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Departman</div>
                </div>
                <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-3 text-center">
                  <div className="text-lg font-bold text-amber-600">{importResult.positionsImported}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Pozisyon</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-1 mb-1">
                    <AlertTriangle className="text-amber-500" size={13} />
                    <span className="text-[10px] font-semibold text-amber-600">{importResult.errors.length} Uyarı</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-2 space-y-0.5">
                    {importResult.errors.map((err, i) => (
                      <div key={i} className="text-[10px] text-amber-700 dark:text-amber-400">• {err}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sheet Info */}
          <div className="mt-4 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 p-3">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Excel Sheet Yapısı</h4>
            <div className="space-y-2 text-[10px] text-slate-500">
              <div>
                <span className="font-semibold text-emerald-600">Departmanlar:</span>{" "}
                Ad, Kod, Aciklama
              </div>
              <div>
                <span className="font-semibold text-amber-600">Pozisyonlar:</span>{" "}
                Baslik, Kod, Departman, Aciklama
              </div>
              <div>
                <span className="font-semibold text-indigo-600">Calisanlar:</span>{" "}
                Email, Ad, Soyad, Telefon, DogumTarihi, Cinsiyet, TCKimlik, Adres, Sehir, Ulke, Departman, Pozisyon, Rol, BaslamaTarihi, Lokasyon, AcilKisiAdi, AcilKisiTel
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              * Tüm kullanıcıların varsayılan şifresi: <code className="bg-slate-200 dark:bg-zinc-800 px-1 rounded">SeedHR2026!</code>
            </p>
          </div>
        </div>
      )}

      {/* Quick Switch Profiles (Test helper) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <LogIn className="text-indigo-600" size={18} />
          <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Rol Deneyimleyici & Hızlı Giriş</h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          SeedHR yetki hiyerarşisini test etmek için aşağıdaki profiller arasında şifresiz geçiş yapabilirsiniz.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {quickUsers.map((qu) => {
            const isActive = currentUser?.email === qu.email;
            return (
              <button
                key={qu.email}
                onClick={() => handleQuickLogin(qu.email)}
                disabled={isActive}
                className={`flex items-center justify-between p-3 rounded-lg border text-xs font-semibold transition ${
                  isActive
                    ? "bg-slate-50 border-indigo-600 text-indigo-600 dark:bg-zinc-800 dark:border-indigo-400 dark:text-indigo-400"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-zinc-800 dark:text-slate-300"
                }`}
              >
                <span>{qu.name}</span>
                {isActive ? (
                  <span className="text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded-full dark:bg-indigo-900/30">Aktif Profil</span>
                ) : (
                  <span className="text-[10px] text-slate-400">Giriş Yap</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Database management */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <Shield className="text-slate-700 dark:text-zinc-400" size={18} />
          <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Demo Veritabanı Yönetimi</h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Eklediğiniz çalışanları, izin taleplerini veya onayları sıfırlayıp fabrika ayarlarına dönebilirsiniz.
        </p>

        <div className="mt-5">
          <button
            onClick={handleResetDb}
            className="flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-semibold transition"
          >
            <RefreshCw size={14} /> Demo Verilerini Sıfırla
          </button>
        </div>
      </div>

      {/* Connection Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <Settings className="text-slate-700 dark:text-zinc-400" size={18} />
          <h3 className="font-semibold text-slate-800 dark:text-zinc-200">API Entegrasyon Ayarları</h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Mevcut Next.js web projesinin bağlandığı C# .NET Core backend endpoint ayarları.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">C# API BASE URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
              disabled
            />
          </div>
          <p className="text-[10px] text-slate-400">
            * SeedHR hibrit mimarisi sayesinde, backend sunucusu kapalı olduğunda frontend tüm verileri otomatik olarak tarayıcı yerel belleğinde (mock engine) simüle eder.
          </p>
        </div>
      </div>
    </div>
  );
}
