"use client";

import React, { useState } from "react";
import { recruitmentAPI } from "@/lib/api";
import { Send, CheckCircle2, User, Mail, Phone, MapPin, Building, FileText, ArrowRight } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function JobApplicationPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Türkiye",
    coverLetter: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("Lütfen zorunlu alanları (Ad, Soyad, E-posta, Telefon) doldurun.");
      return;
    }

    setLoading(true);
    try {
      const res = await recruitmentAPI.createCandidate(formData);
      if (res.success) {
        setSubmitted(true);
        toast.success("Başvurunuz başarıyla iletildi!");
      } else {
        toast.error(res.message || "Başvuru gönderilirken bir hata oluştu.");
      }
    } catch (err) {
      toast.error("Sistem hatası. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#070d0b] items-center justify-center p-4 transition-colors font-sans">
        <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-8 text-center shadow-xl border border-slate-100 dark:border-zinc-800/80">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Başvurunuz Alındı!</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed">
            SeedHR İnsan Kaynakları ekibine başvurunuz başarıyla ulaşmıştır. Profiliniz incelendikten sonra sizinle iletişime geçilecektir. Gösterdiğiniz ilgi için teşekkür ederiz.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                address: "",
                city: "",
                country: "Türkiye",
                coverLetter: ""
              });
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs font-semibold text-white transition-all duration-200 shadow-md shadow-indigo-600/10"
          >
            Yeni Başvuru Yap <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#070d0b] items-center justify-center p-4 transition-colors font-sans py-12">
      <Toaster position="top-right" />

      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800/80">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-300 via-indigo-950 to-zinc-950"></div>
          <div className="relative z-10">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md font-bold text-white mb-3">
              S
            </div>
            <h1 className="text-xl font-bold tracking-tight">Kariyer Fırsatları</h1>
            <p className="text-xs text-indigo-100 mt-1">SeedHR ailesine katılmak için başvuru formunu doldurun.</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ad */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">AD *</label>
              <div className="relative">
                <User className="absolute top-2.5 left-3 text-slate-400 dark:text-zinc-500" size={15} />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Ahmet"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Soyad */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">SOYAD *</label>
              <div className="relative">
                <User className="absolute top-2.5 left-3 text-slate-400 dark:text-zinc-500" size={15} />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Yılmaz"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* E-posta */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">E-POSTA ADRESİ *</label>
              <div className="relative">
                <Mail className="absolute top-2.5 left-3 text-slate-400 dark:text-zinc-500" size={15} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ahmet.yilmaz@example.com"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">TELEFON NUMARASI *</label>
              <div className="relative">
                <Phone className="absolute top-2.5 left-3 text-slate-400 dark:text-zinc-500" size={15} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+90 555 123 4567"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Şehir */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">ŞEHİR</label>
              <div className="relative">
                <Building className="absolute top-2.5 left-3 text-slate-400 dark:text-zinc-500" size={15} />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="İstanbul"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>

            {/* Ülke */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">ÜLKE</label>
              <div className="relative">
                <MapPin className="absolute top-2.5 left-3 text-slate-400 dark:text-zinc-500" size={15} />
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Türkiye"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Adres */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">ADRES</label>
            <div className="relative">
              <MapPin className="absolute top-2.5 left-3 text-slate-400 dark:text-zinc-500" size={15} />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Kadıköy, İstanbul"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-white"
              />
            </div>
          </div>

          {/* Ön Yazı */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">ÖN YAZI / BAŞVURU NOTU</label>
            <div className="relative">
              <FileText className="absolute top-2.5 left-3 text-slate-400 dark:text-zinc-500" size={15} />
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                rows={4}
                placeholder="Kendinizden, deneyimlerinizden ve neden bize katılmak istediğinizden kısaca bahsedin..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-white resize-none"
              ></textarea>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-semibold text-white transition-all duration-200 disabled:opacity-50 shadow-lg shadow-indigo-600/10 cursor-pointer"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></span>
            ) : (
              <>
                Başvuruyu Tamamla <Send size={13} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
