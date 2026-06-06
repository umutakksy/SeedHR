"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { announcementAPI, AnnouncementDto, mockDb } from "@/lib/api";
import { Megaphone, Plus, X, Search, Bell } from "lucide-react";
import { toast } from "react-hot-toast";
import { clsx } from "clsx";

export default function AnnouncementsTab() {
  const { currentUser } = useAppStore();
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [annForm, setAnnForm] = useState({
    title: "",
    content: "",
    category: "General"
  });

  const userRole = currentUser?.roleName || "Employee";
  const isManagerOrHR = ["Admin", "Manager", "HR"].includes(userRole);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await announcementAPI.getAll();
      if (res.success) {
        setAnnouncements(res.data);
      }
    } catch (err) {
      toast.error("Duyurular yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAnnForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const res = await announcementAPI.create({
        ...annForm,
        authorId: currentUser.id,
        status: "Published"
      });
      if (res.success) {
        toast.success(res.message || "Duyuru yayınlandı");
        setShowAddModal(false);
        setAnnForm({
          title: "",
          content: "",
          category: "General"
        });
        fetchData();
      }
    } catch (err) {
      toast.error("Duyuru yayınlanamadı");
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "PolicyChange":
        return "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30";
      case "Event":
        return "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
      case "CompanyNews":
        return "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
      default:
        return "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30";
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "PolicyChange": return "Politika Değişikliği";
      case "Event": return "Şirket Etkinliği";
      case "CompanyNews": return "Haber / Bülten";
      default: return "Genel Duyuru";
    }
  };

  // Filter logic
  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ann.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter ? ann.category === categoryFilter : true;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Duyurularda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-900 dark:border-slate-800 dark:text-white"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none dark:bg-zinc-900 dark:border-slate-800 dark:text-white"
          >
            <option value="">Tüm Kategoriler</option>
            <option value="General">Genel Duyuru</option>
            <option value="CompanyNews">Şirket Haberi</option>
            <option value="Event">Etkinlikler</option>
            <option value="PolicyChange">Kural ve Prosedür</option>
          </select>
        </div>

        {isManagerOrHR && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition self-end sm:self-center"
          >
            <Plus size={14} /> Yeni Duyuru Yayınla
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-10">Yükleniyor...</p>
        ) : filteredAnnouncements.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">Duyuru bulunamadı.</p>
        ) : (
          filteredAnnouncements.map((ann) => (
            <div key={ann.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900 text-left">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={clsx("inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase", getCategoryColor(ann.category))}>
                    {getCategoryLabel(ann.category)}
                  </span>
                  <span className="text-[10px] text-slate-400">Yazar: {ann.authorName}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(ann.publishedDate).toLocaleString("tr-TR")}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm mt-3">{ann.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-wrap leading-relaxed">
                {ann.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add Announcement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-950 dark:text-white">Şirket İçi Duyuru Yayınla</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Duyuru Kategorisi</label>
                <select
                  name="category"
                  value={annForm.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                >
                  <option value="General">Genel Duyuru</option>
                  <option value="CompanyNews">Haber / Bülten</option>
                  <option value="Event">Şirket Etkinliği</option>
                  <option value="PolicyChange">Kural ve Prosedür Değişikliği</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Duyuru Başlığı</label>
                <input
                  type="text"
                  name="title"
                  value={annForm.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="Başlık girin..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Duyuru Metni / İçerik</label>
                <textarea
                  name="content"
                  rows={5}
                  value={annForm.content}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="Duyurulacak metni yazın..."
                  required
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
