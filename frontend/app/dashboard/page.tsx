"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardTab from "@/components/DashboardTab";
import EmployeesTab from "@/components/EmployeesTab";
import LeaveTab from "@/components/LeaveTab";
import AttendanceTab from "@/components/AttendanceTab";
import PerformanceTab from "@/components/PerformanceTab";
import RecruitmentTab from "@/components/RecruitmentTab";
import AnnouncementsTab from "@/components/AnnouncementsTab";
import SettingsTab from "@/components/SettingsTab";
import LogsTab from "@/components/LogsTab";
import OnboardingTab from "@/components/OnboardingTab";
import AssetsTab from "@/components/AssetsTab";
import OrgChartTab from "@/components/OrgChartTab";
import FinanceTab from "@/components/FinanceTab";
import ShiftsTab from "@/components/ShiftsTab";
import VisitorsTab from "@/components/VisitorsTab";
import AiChatWidget from "@/components/AiChatWidget";
import { Toaster } from "react-hot-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, activeTab, checkAuth } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuth();
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (authChecked && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authChecked]);

  if (!authChecked || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-600"></div>
          <span className="text-xs text-slate-400">SeedHR Oturum Doğrulanıyor...</span>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "employees":
        return <EmployeesTab />;
      case "orgchart":
        return <OrgChartTab />;
      case "onboarding":
        return <OnboardingTab />;
      case "assets":
        return <AssetsTab />;
      case "leaves":
        return <LeaveTab />;
      case "attendance":
        return <AttendanceTab />;
      case "performance":
        return <PerformanceTab />;
      case "recruitment":
        return <RecruitmentTab />;
      case "finance":
        return <FinanceTab />;
      case "shifts":
        return <ShiftsTab />;
      case "visitors":
        return <VisitorsTab />;
      case "announcements":
        return <AnnouncementsTab />;
      case "settings":
        return <SettingsTab />;
      case "logs":
        return <LogsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans antialiased text-slate-800 dark:text-zinc-200 transition-colors">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* Navigation sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main portal layout */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Dynamic page context */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {renderActiveTab()}
        </main>
      </div>

      {/* AI Chat Widget - floating */}
      <AiChatWidget />
    </div>
  );
}
