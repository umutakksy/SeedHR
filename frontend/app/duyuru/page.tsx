"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function DuyuruPage() {
  const router = useRouter();
  const { setActiveTab } = useAppStore();

  useEffect(() => {
    setActiveTab("announcements");
    router.push("/");
  }, [router, setActiveTab]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Duyurular sayfasına yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
}
