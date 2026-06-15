"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarRange,
  Clock,
  Award,
  Briefcase,
  Megaphone,
  Settings,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Laptop,
  Rocket,
  GitFork,
  Banknote,
  Timer,
  UserCheck,
  Building2,
} from "lucide-react";
import { clsx } from "clsx";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { activeTab, setActiveTab, currentUser, logout } = useAppStore();
  const router = useRouter();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Manager", "HR", "Employee"] },
    { id: "company", label: "Şirket İntraneti", icon: Building2, roles: ["Admin", "Manager", "HR", "Employee"] },
    { id: "employees", label: "Çalışanlar", icon: Users, roles: ["Admin", "Manager", "HR"] },
    { id: "orgchart", label: "Organizasyon Şeması", icon: GitFork, roles: ["Admin", "Manager", "HR", "Employee"] },
    { id: "onboarding", label: "Onboarding & Uyum", icon: Rocket, roles: ["Admin", "Manager", "HR", "Employee"] },
    { id: "assets", label: "Zimmet Yönetimi", icon: Laptop, roles: ["Admin", "Manager", "HR", "Employee"] },
    { id: "leaves", label: "İzin Yönetimi", icon: CalendarRange, roles: ["Admin", "Manager", "HR", "Employee"] },
    { id: "attendance", label: "Devamsızlık & Takvim", icon: Clock, roles: ["Admin", "Manager", "HR", "Employee"] },
    { id: "performance", label: "Performans", icon: Award, roles: ["Admin", "Manager", "HR", "Employee"] },
    { id: "recruitment", label: "İşe Alım", icon: Briefcase, roles: ["Admin", "HR"] },
    { id: "finance", label: "Finans & Bordro", icon: Banknote, roles: ["Admin", "Manager", "HR"] },
    { id: "shifts", label: "Vardiya & Puantaj", icon: Timer, roles: ["Admin", "Manager", "HR"] },
    { id: "visitors", label: "Ziyaretçi Takibi", icon: UserCheck, roles: ["Admin", "Manager", "HR", "Employee"] },
    { id: "announcements", label: "Duyurular", icon: Megaphone, roles: ["Admin", "Manager", "HR", "Employee"] },
    { id: "settings", label: "Sistem Ayarları", icon: Settings, roles: ["Admin", "Manager", "HR", "Employee"] },
    { id: "logs", label: "Sistem Günlükleri", icon: FileText, roles: ["Admin"] }
  ];

  const userRole = currentUser?.roleName || "Employee";
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside
      className={clsx(
        "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white text-slate-700 border-r border-slate-100 dark:bg-zinc-950 dark:border-slate-800/80 transition-all duration-300 ease-in-out shadow-[1px_0_10px_rgba(0,0,0,0.01)]",
        isOpen ? "w-64" : "w-16",
        "lg:sticky lg:h-screen"
      )}
    >
      {/* Header / Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 overflow-hidden">
          <img src="/icon.png" alt="SeedHR Logo" className="h-8 w-8 object-contain rounded-lg shrink-0 shadow-sm" />
          <span
            className={clsx(
              "font-semibold text-base text-slate-800 dark:text-white transition-opacity duration-200 whitespace-nowrap tracking-wide",
              isOpen ? "opacity-100" : "opacity-0 w-0"
            )}
          >
            Seed<span className="text-indigo-600 dark:text-indigo-400">HR</span>
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 px-2 py-4 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "company") {
                  router.push("/company");
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={clsx(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 tracking-wide",
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "text-slate-500 hover:bg-indigo-50/50 hover:text-indigo-700 dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-100"
              )}
              title={!isOpen ? item.label : undefined}
            >
              <Icon
                size={16}
                className={clsx(
                  "shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                )}
              />
              <span
                className={clsx(
                  "transition-opacity duration-200 whitespace-nowrap",
                  isOpen ? "opacity-100" : "opacity-0 w-0 pointer-events-none"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      {currentUser && (
        <div className="border-t border-slate-100 dark:border-slate-800/80 p-3 bg-slate-50/50 dark:bg-zinc-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-xs font-bold text-indigo-700 dark:text-indigo-400 shrink-0 uppercase">
              {currentUser.firstName[0]}
              {currentUser.lastName[0]}
            </div>
            <div
              className={clsx(
                "flex-1 overflow-hidden transition-opacity duration-200",
                isOpen ? "opacity-100" : "opacity-0 w-0 pointer-events-none"
              )}
            >
              <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate leading-tight">
                {currentUser.fullName}
              </h4>
              <p className="text-[10px] text-slate-400 truncate leading-none mt-1">
                {currentUser.positionTitle || "Personel"}
              </p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className={clsx(
              "mt-3 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[11px] font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-all duration-200",
              isOpen ? "justify-start" : "justify-center"
            )}
            title="Çıkış Yap"
          >
            <LogOut size={14} className="shrink-0" />
            <span
              className={clsx(
                "transition-opacity duration-200",
                isOpen ? "opacity-100" : "opacity-0 w-0 pointer-events-none"
              )}
            >
              Çıkış Yap
            </span>
          </button>
        </div>
      )}
    </aside>
  );
}
