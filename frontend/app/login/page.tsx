"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { authAPI } from "@/lib/api";
import { Shield, Key, Mail, RefreshCw } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, login, checkAuth } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      router.push("/");
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      if (res.success) {
        login(res.data.user, res.data.token);
        toast.success(`Hoş geldiniz, ${res.data.user.fullName}`);
        router.push("/");
      } else {
        toast.error(res.message || "Giriş başarısız");
      }
    } catch (err) {
      toast.error("Giriş sırasında hata oluştu. E-posta veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword("Password123!");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#070d0b] font-sans items-center justify-center p-4 transition-colors">
      <Toaster position="top-right" />

      {/* Main card wrapper */}
      <div className="flex w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.02)] bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80">
        {/* Left Side: Illustration / Brand Banner */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-indigo-50/60 via-indigo-100/40 to-indigo-200/10 dark:from-indigo-950/20 dark:via-zinc-900/60 dark:to-zinc-950 p-10 text-left border-r border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shrink-0">
              S
            </div>
            <span className="font-semibold text-base text-slate-800 dark:text-white tracking-wide">
              Seed<span className="text-indigo-600 dark:text-indigo-400">HR</span>
            </span>
          </div>

          <div className="space-y-4 my-auto">
            <h2 className="text-2xl font-bold leading-snug text-slate-800 dark:text-white">
              Kurumsal İnsan Kaynakları Yönetim Sistemi
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
              SeedHR; çalışan özlük hakları, izin yönetimi, günlük mesai kaydı, dönemsel performans değerlendirmeleri ve işe alım süreçlerini tek bir çatı altında toplayan uçtan uca kurumsal bir platformdur.
            </p>
          </div>

          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
            © 2026 SeedHR Inc. Tüm hakları saklıdır.
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center bg-white dark:bg-zinc-900">
          <div className="text-left mb-6">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Sisteme Giriş Yapın</h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Devam etmek için kurumsal hesabınızı kullanın.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">KULLANICI ADI VEYA E-POSTA</label>
              <div className="relative">
                <Mail className="absolute top-2.5 left-3 text-slate-400 dark:text-zinc-500" size={15} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">ŞİFRE</label>
              <div className="relative">
                <Key className="absolute top-2.5 left-3 text-slate-400 dark:text-zinc-500" size={15} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-semibold text-white transition-all duration-200 disabled:opacity-50 shadow-md shadow-indigo-600/10"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></span>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
