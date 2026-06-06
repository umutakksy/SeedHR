"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { mockDb, authAPI } from "@/lib/api";
import { Settings, Shield, RefreshCw, LogIn } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SettingsTab() {
  const { currentUser, login, logout } = useAppStore();
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

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

  return (
    <div className="space-y-6 max-w-3xl text-left">
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
