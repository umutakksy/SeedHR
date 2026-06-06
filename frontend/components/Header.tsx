"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { notificationAPI, NotificationDto, authAPI } from "@/lib/api";
import { Bell, Sun, Moon, Menu, CheckCircle2, AlertCircle, Info, Calendar, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "react-hot-toast";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const router = useRouter();
  const { activeTab, currentUser, theme, setTheme, logout } = useAppStore();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      toast.success("Başarıyla çıkış yapıldınız");
      router.push("/login");
    } catch (err) {
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await notificationAPI.getAll(currentUser.id);
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll notifications every 10 seconds
    return () => clearInterval(interval);
  }, [currentUser]);

  // Handle clicking outside the notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    try {
      const res = await notificationAPI.markAllAsRead(currentUser.id);
      if (res.success) {
        toast.success("Tüm bildirimler okundu işaretlendi");
        fetchNotifications();
      }
    } catch (err) {
      toast.error("Bildirimler güncellenemedi");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const res = await notificationAPI.markAsRead(id);
      if (res.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "Success":
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "Error":
        return <AlertCircle size={16} className="text-rose-500" />;
      case "Leave":
        return <Calendar size={16} className="text-indigo-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard";
      case "employees":
        return "Çalışan Yönetimi";
      case "leaves":
        return "İzin Planlama & Onay";
      case "attendance":
        return "Devamsızlık & Zaman Kaydı";
      case "performance":
        return "Performans Değerlendirme";
      case "recruitment":
        return "İşe Alım Portalı";
      case "announcements":
        return "Şirket İçi Duyurular";
      case "settings":
        return "Sistem ve Demo Ayarları";
      default:
        return "SeedHR Platformu";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-zinc-950 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none lg:hidden dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 md:text-xl">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          title="Koyu/Açık Tema"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications center */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            title="Bildirimler"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-zinc-900 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200">Bildirimler ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium dark:text-indigo-400"
                  >
                    Hepsini Okundu Say
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    Henüz bildiriminiz bulunmuyor.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={clsx(
                        "flex gap-3 p-3 text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50",
                        !n.isRead && "bg-slate-50/50 dark:bg-zinc-800/20"
                      )}
                    >
                      <div className="mt-0.5 shrink-0">{getNotificationIcon(n.type)}</div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={clsx("text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate", !n.isRead && "text-indigo-950 font-bold dark:text-indigo-300")}>
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User quick profile indicator */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
            {currentUser?.firstName[0] || "U"}
          </div>
          <div className="hidden flex-col text-left md:flex">
            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-none">
              {currentUser?.fullName}
            </span>
            <span className="text-[10px] text-indigo-600 font-medium dark:text-indigo-400 mt-0.5">
              {currentUser?.roleName}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors dark:hover:bg-slate-800 dark:text-slate-400"
            title="Çıkış yap"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
