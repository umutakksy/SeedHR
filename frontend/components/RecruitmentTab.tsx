"use client";

import React, { useState, useEffect } from "react";
import {
  recruitmentAPI,
  departmentAPI,
  recruitmentReferenceAPI,
  JobPostingDto,
  CandidateDto,
  InterviewDto,
  DepartmentDto,
  ReferenceCheckDto,
  aiAPI
} from "@/lib/api";
import {
  Briefcase,
  Users,
  Calendar,
  Plus,
  ChevronRight,
  X,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  FileText,
  Sparkles
} from "lucide-react";
import { toast } from "react-hot-toast";
import { clsx } from "clsx";

export default function RecruitmentTab() {
  const [postings, setPostings] = useState<JobPostingDto[]>([]);
  const [candidates, setCandidates] = useState<CandidateDto[]>([]);
  const [interviews, setInterviews] = useState<InterviewDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"jobs" | "candidates" | "interviews">("jobs");
  const [loading, setLoading] = useState(true);

  // AI Interview Questions States
  const [showAiQuestionsModal, setShowAiQuestionsModal] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedInterviewForQuestions, setSelectedInterviewForQuestions] = useState<InterviewDto | null>(null);

  // Candidate Details Modal States
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDto | null>(null);
  const [candidateReferences, setCandidateReferences] = useState<ReferenceCheckDto[]>([]);
  const [candidateDetailTab, setCandidateDetailTab] = useState<"info" | "references">("info");
  const [showAddReferenceModal, setShowAddReferenceModal] = useState(false);
  const [showSimulateReferenceModal, setShowSimulateReferenceModal] = useState(false);
  const [selectedReferenceForSimulation, setSelectedReferenceForSimulation] = useState<ReferenceCheckDto | null>(null);

  // Forms
  const [referenceForm, setReferenceForm] = useState({
    referenceName: "",
    company: "",
    title: "",
    email: "",
    phone: "",
    relationship: "Former Manager"
  });

  const [simulationForm, setSimulationForm] = useState({
    verificationNotes: "Referans doğrulama araması tamamlandı. Adayın eski projelerdeki başarısı teyit edildi.",
    comments: "Çok başarılı, uyumlu ve sorumluluk sahibi bir çalışma arkadaşıydı. Kesinlikle tavsiye ederim.",
    scores: {
      "Teknik Beceri": 5,
      "Uyum / Takım Çalışması": 4,
      "Girişkenlik / Sorumluluk": 5
    }
  });

  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewDto | null>(null);
  const [evaluationForm, setEvaluationForm] = useState({ rating: 5, feedback: "", result: "Pass" });

  // Form states
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    requirements: "",
    departmentId: "",
    location: "Istanbul / Remote",
    employmentType: "FullTime",
    salaryRange: ""
  });

  const [scheduleForm, setScheduleForm] = useState({
    candidateId: "",
    interviewers: "", // Comma-separated names
    scheduledTime: "",
    durationMinutes: 45,
    type: "Video"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobRes = await recruitmentAPI.getJobPostings();
      const candRes = await recruitmentAPI.getCandidates();
      const intRes = await recruitmentAPI.getInterviews();
      const deptRes = await departmentAPI.getAll();

      if (jobRes.success) setPostings(jobRes.data);
      if (candRes.success) setCandidates(candRes.data);
      if (intRes.success) setInterviews(intRes.data);
      if (deptRes.success) {
        setDepartments(deptRes.data);
        setJobForm(prev => ({ ...prev, departmentId: deptRes.data[0]?.id || "" }));
      }

      if (candRes.success && candRes.data.length > 0) {
        setScheduleForm(prev => ({ ...prev, candidateId: candRes.data[0]?.id || "" }));
      }
    } catch (err) {
      toast.error("İşe alım verileri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCandidate) {
      fetchReferences(selectedCandidate.id);
    }
  }, [selectedCandidate]);

  const fetchReferences = async (candidateId: string) => {
    try {
      const res = await recruitmentReferenceAPI.getReferencesForCandidate(candidateId);
      if (res.success) {
        setCandidateReferences(res.data);
      }
    } catch {
      toast.error("Referans kontrolleri yüklenemedi.");
    }
  };

  const handleCreateReferenceCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    try {
      const res = await recruitmentReferenceAPI.createReferenceCheck(selectedCandidate.id, referenceForm);
      if (res.success) {
        toast.success("Referans doğrulama talebi oluşturuldu (E-posta gönderildi).");
        setShowAddReferenceModal(false);
        setReferenceForm({
          referenceName: "",
          company: "",
          title: "",
          email: "",
          phone: "",
          relationship: "Former Manager"
        });
        fetchReferences(selectedCandidate.id);
      }
    } catch {
      toast.error("Talep oluşturulamadı.");
    }
  };

  const handleSimulateFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReferenceForSimulation || !selectedCandidate) return;
    try {
      const res = await recruitmentReferenceAPI.submitReferenceFeedback(selectedReferenceForSimulation.id, simulationForm);
      if (res.success) {
        toast.success("Referans geribildirimi simüle edildi ve kaydedildi.");
        setShowSimulateReferenceModal(false);
        setSelectedReferenceForSimulation(null);
        fetchReferences(selectedCandidate.id);
      }
    } catch {
      toast.error("Geribildirim gönderilemedi.");
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await recruitmentAPI.createJobPosting(jobForm);
      if (res.success) {
        toast.success(res.message || "İş ilanı oluşturuldu");
        setShowAddJobModal(false);
        setJobForm({
          title: "",
          description: "",
          requirements: "",
          departmentId: departments[0]?.id || "",
          location: "Istanbul / Remote",
          employmentType: "FullTime",
          salaryRange: ""
        });
        fetchData();
      }
    } catch (err) {
      toast.error("İşlem başarısız");
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formatted = {
        ...scheduleForm,
        interviewers: scheduleForm.interviewers.split(",").map(i => i.trim())
      };
      const res = await recruitmentAPI.createInterview(formatted);
      if (res.success) {
        toast.success(res.message || "Mülakat planlandı");
        setShowScheduleModal(false);
        setScheduleForm({
          candidateId: candidates[0]?.id || "",
          interviewers: "",
          scheduledTime: "",
          durationMinutes: 45,
          type: "Video"
        });
        fetchData();
      }
    } catch (err) {
      toast.error("Mülakat planlanamadı");
    }
  };

  const handleEvaluationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    try {
      const res = await recruitmentAPI.completeInterview(selectedInterview.id, {
        rating: Number(evaluationForm.rating),
        feedback: evaluationForm.feedback,
        result: evaluationForm.result
      });
      if (res.success) {
        toast.success(res.message || "Değerlendirme başarıyla kaydedildi");
        setShowEvaluateModal(false);
        fetchData();
      } else {
        toast.error(res.message || "Değerlendirme kaydedilemedi");
      }
    } catch (err) {
      toast.error("Değerlendirme sırasında hata oluştu");
    }
  };

  const handleUpdateStatus = async (candId: string, status: CandidateDto["status"]) => {
    try {
      const res = await recruitmentAPI.updateCandidateStatus(candId, status);
      if (res.success) {
        toast.success(res.message || "Aday durumu güncellendi");
        setCandidates(prev => prev.map(c => c.id === candId ? res.data : c));
      }
    } catch (err) {
      toast.error("Durum güncellenemedi");
    }
  };

  const getCandidateBadge = (status: string) => {
    switch (status) {
      case "Hired":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400";
      case "Offered":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400";
      case "Interviewing":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400";
      case "Rejected":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400";
      default:
        return "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Hired": return "İşe Alındı";
      case "Offered": return "Teklif Yapıldı";
      case "Interviewing": return "Mülakatta";
      case "Screening": return "Değerlendirmede";
      case "Rejected": return "Elendi";
      default: return "Yeni Başvuru";
    }
  };

  const handleSuggestQuestions = async (interview: InterviewDto) => {
    setSelectedInterviewForQuestions(interview);
    setShowAiQuestionsModal(true);
    setLoadingQuestions(true);
    try {
      const candidate = candidates.find(c => c.id === interview.candidateId);
      const departmentName = candidate?.jobPostingTitle.toLowerCase().includes("hr") || candidate?.jobPostingTitle.toLowerCase().includes("ik")
        ? "İnsan Kaynakları"
        : "Yazılım Geliştirme";

      const res = await aiAPI.getInterviewQuestions(interview.jobPostingTitle, departmentName);
      if (res.success) {
        setAiQuestions(res.data);
      } else {
        toast.error("Sorular önerilemedi");
      }
    } catch (err) {
      toast.error("Yapay zeka soru önerisi alınırken hata oluştu");
    } finally {
      setLoadingQuestions(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSubTab("jobs")}
            className={clsx(
              "flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 px-1 transition",
              activeSubTab === "jobs"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <Briefcase size={14} /> Açık Pozisyonlar ({postings.length})
          </button>
          <button
            onClick={() => setActiveSubTab("candidates")}
            className={clsx(
              "flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 px-1 transition",
              activeSubTab === "candidates"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <Users size={14} /> Aday Havuzu ({candidates.length})
          </button>
          <button
            onClick={() => setActiveSubTab("interviews")}
            className={clsx(
              "flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 px-1 transition",
              activeSubTab === "interviews"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <Calendar size={14} /> Mülakat Takvimi ({interviews.length})
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end">
        {activeSubTab === "jobs" && (
          <button
            onClick={() => setShowAddJobModal(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
          >
            <Plus size={14} /> Yeni İlan Yayınla
          </button>
        )}
        {activeSubTab === "interviews" && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
          >
            <Calendar size={14} /> Mülakat Planla
          </button>
        )}
      </div>

      {/* Content panes */}
      {loading ? (
        <p className="text-xs text-slate-400 text-center py-10">Yükleniyor...</p>
      ) : (
        <>
          {/* Postings View */}
          {activeSubTab === "jobs" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {postings.length === 0 ? (
                <p className="col-span-2 text-xs text-slate-400 text-center py-6">Açık ilan bulunmuyor.</p>
              ) : (
                postings.map((job) => (
                  <div key={job.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full dark:bg-indigo-950/20 dark:text-indigo-400">
                        {job.employmentType === "FullTime" ? "Tam Zamanlı" : job.employmentType === "Remote" ? "Uzaktan" : "Yarı Zamanlı"}
                      </span>
                      <span className="text-[10px] text-slate-400">Yayınlanma: {new Date(job.postedDate).toLocaleDateString("tr-TR")}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm mt-3">{job.title}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{job.departmentName} - {job.location}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-3">{job.description}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-semibold text-slate-500">
                      <span>Bütçe: {job.salaryRange || "Belirtilmemiş"}</span>
                      <span className="text-emerald-600">Başvurulara Açık</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Candidates Pipeline View */}
          {activeSubTab === "candidates" && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-zinc-900">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-zinc-800/50">
                    <th className="px-6 py-3 font-semibold text-xs uppercase">Aday</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase">Başvurulan Pozisyon</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase">Başvuru Tarihi</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase">İletişim</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase">AI Uyum Skoru</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase">Durum</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase text-right">Aşama Değiştir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {candidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">Başvuru kaydı bulunmuyor.</td>
                    </tr>
                  ) : (
                    candidates.map((cand) => (
                      <tr key={cand.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                        <td
                          onClick={() => {
                            setSelectedCandidate(cand);
                            setCandidateDetailTab("info");
                          }}
                          className="px-6 py-4 font-semibold text-slate-800 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                        >
                          {cand.fullName}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">{cand.jobPostingTitle}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{new Date(cand.appliedDate).toLocaleDateString("tr-TR")}</td>
                        <td className="px-6 py-4 text-xs">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1"><Mail size={12} className="text-slate-400" /> {cand.email}</span>
                            <span className="inline-flex items-center gap-1"><Phone size={12} className="text-slate-400" /> {cand.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {cand.aiMatchScore ? (
                            <div className="flex items-center gap-2">
                              <div className="relative h-8 w-8 shrink-0">
                                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                  <path
                                    className="text-slate-100 dark:text-zinc-850 stroke-current"
                                    strokeWidth="3.5"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <path
                                    className={clsx(
                                      "stroke-current transition-all duration-500",
                                      cand.aiMatchScore >= 85
                                        ? "text-emerald-500"
                                        : cand.aiMatchScore >= 70
                                        ? "text-indigo-500"
                                        : "text-amber-500"
                                    )}
                                    strokeWidth="3.5"
                                    strokeDasharray={`${cand.aiMatchScore}, 100`}
                                    strokeLinecap="round"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-700 dark:text-zinc-300">
                                  %{cand.aiMatchScore}
                                </span>
                              </div>
                              <span className={clsx(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded",
                                cand.aiMatchScore >= 85 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" :
                                cand.aiMatchScore >= 70 ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400" :
                                "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                              )}>
                                {cand.aiMatchScore >= 85 ? "Uyumlu" : cand.aiMatchScore >= 70 ? "Orta" : "Zayıf"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", getCandidateBadge(cand.status))}>
                            {getStatusLabel(cand.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {cand.status === "Applied" && (
                              <button
                                onClick={() => handleUpdateStatus(cand.id, "Screening")}
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-zinc-800"
                              >
                                İncelemeye Al
                              </button>
                            )}
                            {cand.status === "Screening" && (
                              <button
                                onClick={() => handleUpdateStatus(cand.id, "Interviewing")}
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400"
                              >
                                Mülakata Çağır
                              </button>
                            )}
                            {cand.status === "Interviewing" && (
                              <button
                                onClick={() => handleUpdateStatus(cand.id, "Offered")}
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                Teklif Ver
                              </button>
                            )}
                            {cand.status === "Offered" && (
                              <button
                                onClick={() => handleUpdateStatus(cand.id, "Hired")}
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                İşe Başlat
                              </button>
                            )}
                            {cand.status !== "Hired" && cand.status !== "Rejected" && (
                              <button
                                onClick={() => handleUpdateStatus(cand.id, "Rejected")}
                                className="px-2 py-1 text-[10px] font-bold rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50 dark:border-rose-950/20 dark:hover:bg-rose-950/30"
                              >
                                Ele
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Interviews Schedule View */}
          {activeSubTab === "interviews" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {interviews.length === 0 ? (
                <p className="col-span-2 text-xs text-slate-400 text-center py-6">Planlanmış mülakat bulunmuyor.</p>
              ) : (
                interviews.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900 text-left flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full dark:bg-indigo-950/20 dark:text-indigo-400">
                          {item.type === "Video" ? "Online Görüntülü" : item.type === "Phone" ? "Telefon" : "Ofiste Birebir"}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.durationMinutes} Dakika</span>
                      </div>

                      <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm mt-3">{item.candidateName}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.jobPostingTitle}</p>

                      <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-slate-400" />
                          <span>{new Date(item.scheduledTime).toLocaleString("tr-TR")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={13} className="text-slate-400" />
                          <span>Mülakatçılar: {item.interviewers.join(", ")}</span>
                        </div>
                      </div>
                    </div>

                    {item.status === "Scheduled" ? (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full dark:bg-amber-950/20">Planlandı</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSuggestQuestions(item)}
                            className="flex items-center gap-1 rounded-lg border border-indigo-200 dark:border-indigo-850 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 transition"
                          >
                            <Sparkles size={11} className="animate-pulse" />
                            AI Soruları
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInterview(item);
                              setEvaluationForm({ rating: 5, feedback: "", result: "Pass" });
                              setShowEvaluateModal(true);
                            }}
                            className="rounded-lg bg-indigo-600 px-3 py-1 text-[10px] font-semibold text-white hover:bg-indigo-700 transition"
                          >
                            Değerlendir
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-semibold">
                          <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full dark:bg-emerald-950/20">Tamamlandı</span>
                          <span className={clsx(
                            "px-1.5 py-0.5 rounded-full",
                            item.result === "Pass" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" : "text-rose-600 bg-rose-50 dark:bg-rose-950/20"
                          )}>
                            Sonuç: {item.result === "Pass" ? "Olumlu" : item.result === "Fail" ? "Olumsuz" : "Beklemede"}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-800/45 p-2 rounded border border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between font-bold mb-1">
                            <span>Mülakat Puanı:</span>
                            <span className="text-amber-500 font-bold">{item.score || item.rating} / 5</span>
                          </div>
                          <p className="italic">"{item.feedback || "Geri bildirim belirtilmemiş."}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Add Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-950 dark:text-white">Yeni Kariyer İlanı Oluştur</h3>
              <button onClick={() => setShowAddJobModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleJobSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Pozisyon Başlığı</label>
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="Örn: Senior Backend Developer"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Departman</label>
                <select
                  value={jobForm.departmentId}
                  onChange={(e) => setJobForm(prev => ({ ...prev, departmentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Açıklama</label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="Pozisyon görev tanımı..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Gereksinimler</label>
                <textarea
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm(prev => ({ ...prev, requirements: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="Aranan deneyimler, eğitim derecesi..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Konum</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Çalışma Şekli</label>
                  <select
                    value={jobForm.employmentType}
                    onChange={(e) => setJobForm(prev => ({ ...prev, employmentType: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="FullTime">Tam Zamanlı (On-site)</option>
                    <option value="Remote">Remote (Uzaktan)</option>
                    <option value="PartTime">Yarı Zamanlı (Part-time)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Bütçe / Maaş Aralığı</label>
                <input
                  type="text"
                  value={jobForm.salaryRange}
                  onChange={(e) => setJobForm(prev => ({ ...prev, salaryRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="Örn: 80,000 - 100,000 TRY"
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
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

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-950 dark:text-white">Mülakat Planla</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Aday</label>
                <select
                  value={scheduleForm.candidateId}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, candidateId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                >
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.jobPostingTitle})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Mülakatçılar</label>
                <input
                  type="text"
                  value={scheduleForm.interviewers}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, interviewers: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="İsimleri virgülle ayırın (Örn: Ahmet Yılmaz, Elif Kaya)"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Mülakat Türü</label>
                  <select
                    value={scheduleForm.type}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="Video">Görüntülü Mülakat</option>
                    <option value="Phone">Telefon</option>
                    <option value="OnSite">Ofis / Birebir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Süre (Dakika)</label>
                  <input
                    type="number"
                    value={scheduleForm.durationMinutes}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tarih ve Saat</label>
                <input
                  type="datetime-local"
                  value={scheduleForm.scheduledTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Planla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evaluate Interview Modal */}
      {showEvaluateModal && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-950 dark:text-white">Mülakat Değerlendirme Formu</h3>
              <button onClick={() => setShowEvaluateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEvaluationSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Aday</label>
                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  {selectedInterview.candidateName} - {selectedInterview.jobPostingTitle}
                </div>
              </div>

              <div className="border border-indigo-100 dark:border-indigo-950 bg-indigo-50/20 dark:bg-indigo-950/10 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  <span className="text-[10px] font-semibold text-indigo-950 dark:text-indigo-300">Bu aday için yapay zeka destekli mülakat soruları hazır!</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSuggestQuestions(selectedInterview)}
                  className="text-[10px] font-bold text-indigo-700 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline animate-bounce"
                >
                  Soruları Öner
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Mülakat Puanı (1 - 5)</label>
                <select
                  value={evaluationForm.rating}
                  onChange={(e) => setEvaluationForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                >
                  <option value={5}>5 - Mükemmel</option>
                  <option value={4}>4 - İyi</option>
                  <option value={3}>3 - Ortalama</option>
                  <option value={2}>2 - Zayıf</option>
                  <option value={1}>1 - Çok Kötü</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Mülakat Sonucu</label>
                <select
                  value={evaluationForm.result}
                  onChange={(e) => setEvaluationForm(prev => ({ ...prev, result: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                >
                  <option value="Pass">Olumlu (Geçti)</option>
                  <option value="Fail">Olumsuz (Elendi)</option>
                  <option value="Pending">Beklemede</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Mülakat Geri Bildirimi / Değerlendirme Notları</label>
                <textarea
                  value={evaluationForm.feedback}
                  onChange={(e) => setEvaluationForm(prev => ({ ...prev, feedback: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="Aday hakkındaki görüşleriniz..."
                  required
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEvaluateModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Değerlendirmeyi Tamamla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-950 dark:text-white text-base">{selectedCandidate.fullName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Başvurulan Pozisyon: {selectedCandidate.jobPostingTitle}</p>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Modal Inner Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 mt-4">
              <button
                onClick={() => setCandidateDetailTab("info")}
                className={clsx(
                  "pb-2.5 text-xs font-bold px-4 border-b-2 transition",
                  candidateDetailTab === "info"
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                Aday Bilgileri
              </button>
              <button
                onClick={() => setCandidateDetailTab("references")}
                className={clsx(
                  "pb-2.5 text-xs font-bold px-4 border-b-2 transition",
                  candidateDetailTab === "references"
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                Referans Kontrolü ({candidateReferences.length})
              </button>
            </div>

            {/* Inner Content */}
            <div className="py-4 space-y-4">
              {candidateDetailTab === "info" ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block mb-0.5">E-posta:</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedCandidate.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Telefon:</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedCandidate.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Başvuru Tarihi:</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        {new Date(selectedCandidate.appliedDate).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Durum:</span>
                      <span className={clsx("inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold", getCandidateBadge(selectedCandidate.status))}>
                        {getStatusLabel(selectedCandidate.status)}
                      </span>
                    </div>

                    <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                      <span className="text-slate-400 block mb-2 font-semibold">AI CV Eşleşme Analizi:</span>
                      {selectedCandidate.aiMatchScore ? (
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-zinc-950/30 p-3 rounded-xl border border-slate-150/50 dark:border-slate-800">
                          <div className="relative h-12 w-12 shrink-0">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-slate-100 dark:text-zinc-800/80 stroke-current"
                                strokeWidth="3"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className={clsx(
                                  "stroke-current transition-all duration-500",
                                  selectedCandidate.aiMatchScore >= 85
                                    ? "text-emerald-500"
                                    : selectedCandidate.aiMatchScore >= 70
                                    ? "text-indigo-500"
                                    : "text-amber-500"
                                )}
                                strokeWidth="3.5"
                                strokeDasharray={`${selectedCandidate.aiMatchScore}, 100`}
                                strokeLinecap="round"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-zinc-200">
                              %{selectedCandidate.aiMatchScore}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                              {selectedCandidate.aiMatchScore >= 85 ? "Mükemmel Eşleşme" : selectedCandidate.aiMatchScore >= 70 ? "Uyumlu Aday" : "Kısmi Eşleşme"}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-normal mt-0.5">
                              Yapay zeka bu adayın özgeçmişini, {selectedCandidate.jobPostingTitle} pozisyonu gereksinimleri ile karşılaştırarak yüksek uyumluluk derecesi atamıştır.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Analiz yapılmadı</span>
                      )}
                    </div>
                  </div>

                  {selectedCandidate.coverLetter && (
                    <div className="border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-zinc-800/30 p-3 rounded-lg">
                      <span className="text-slate-400 block mb-1 font-semibold">Ön Yazı:</span>
                      <p className="text-slate-600 dark:text-slate-300 italic">"{selectedCandidate.coverLetter}"</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Özgeçmiş Dokümanı:</span>
                    <a
                      href={`http://localhost:5000/api/recruitment/candidates/${selectedCandidate.id}/cv`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-700 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      <FileText size={14} /> Özgeçmişi Görüntüle / İndir
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Referans Kontrol Listesi</h4>
                    <button
                      onClick={() => setShowAddReferenceModal(true)}
                      className="flex items-center gap-1 bg-slate-800 text-white hover:bg-slate-900 rounded-lg px-2.5 py-1 text-[10px] font-bold dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
                    >
                      <Plus size={10} /> Referans Talebi Ekle
                    </button>
                  </div>

                  <div className="space-y-4">
                    {candidateReferences.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">Aday için henüz referans kontrolü tanımlanmamış.</p>
                    ) : (
                      candidateReferences.map(ref => (
                        <div key={ref.id} className="p-4 border border-slate-100 rounded-xl dark:border-slate-800 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-100">{ref.referenceName}</h5>
                              <p className="text-[10px] text-slate-400">{ref.company} - {ref.title} ({ref.relationship})</p>
                            </div>
                            <span className={clsx(
                              "text-[9px] font-bold rounded-full px-2 py-0.5",
                              ref.status === "Completed" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                            )}>
                              {ref.status === "Completed" ? "Tamamlandı" : "Yanıt Bekleniyor"}
                            </span>
                          </div>

                          {ref.status === "Completed" ? (
                            <div className="bg-slate-50 dark:bg-zinc-950/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 text-xs space-y-2">
                              <div className="grid grid-cols-3 gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 font-semibold">
                                {Object.entries(ref.scores || {}).map(([criteria, score]) => (
                                  <div key={criteria} className="text-center">
                                    <span className="text-slate-400 block text-[9px] truncate">{criteria}</span>
                                    <span className="text-amber-500 font-bold text-xs">{score} / 5</span>
                                  </div>
                                ))}
                              </div>
                              {ref.comments && (
                                <p className="italic text-slate-600 dark:text-slate-400">"{ref.comments}"</p>
                              )}
                              {ref.verificationNotes && (
                                <p className="text-[10px] text-slate-400 mt-1">Görüşme Notları: {ref.verificationNotes}</p>
                              )}
                            </div>
                          ) : (
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => {
                                  setSelectedReferenceForSimulation(ref);
                                  setShowSimulateReferenceModal(true);
                                }}
                                className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg px-2.5 py-1 text-[10px] font-bold transition flex items-center gap-1"
                              >
                                <Send size={10} /> Referans Geri Bildirimi Simüle Et (Mock)
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="rounded-lg bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-xs font-semibold dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Reference Modal */}
      {showAddReferenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-950 dark:text-white">Referans Bilgilerini Gir</h3>
              <button onClick={() => setShowAddReferenceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateReferenceCheck} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Referans Kişinin Adı Soyadı</label>
                <input
                  type="text"
                  value={referenceForm.referenceName}
                  onChange={(e) => setReferenceForm(prev => ({ ...prev, referenceName: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="örn. Hakan Aydın"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Şirket</label>
                  <input
                    type="text"
                    value={referenceForm.company}
                    onChange={(e) => setReferenceForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    placeholder="örn. Tekno Soft"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Ünvan</label>
                  <input
                    type="text"
                    value={referenceForm.title}
                    onChange={(e) => setReferenceForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    placeholder="örn. Yazılım Mimarı"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">E-posta</label>
                  <input
                    type="email"
                    value={referenceForm.email}
                    onChange={(e) => setReferenceForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    placeholder="hakan@mail.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Telefon</label>
                  <input
                    type="text"
                    value={referenceForm.phone}
                    onChange={(e) => setReferenceForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    placeholder="+90 532..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">İlişki (Yakınlık)</label>
                <select
                  value={referenceForm.relationship}
                  onChange={(e) => setReferenceForm(prev => ({ ...prev, relationship: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                >
                  <option value="Former Manager">Eski Yönetici (Former Manager)</option>
                  <option value="Peer">Çalışma Arkadaşı (Peer)</option>
                  <option value="HR">İK Sorumlusu (HR)</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddReferenceModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Referans Kontrolü Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulate Reference Feedback Modal */}
      {showSimulateReferenceModal && selectedReferenceForSimulation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-950 dark:text-white">Referans Yanıtını Simüle Et</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Referans: {selectedReferenceForSimulation.referenceName}</p>
              </div>
              <button onClick={() => {
                setShowSimulateReferenceModal(false);
                setSelectedReferenceForSimulation(null);
              }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSimulateFeedbackSubmit} className="space-y-4 mt-4 text-xs">
              <div className="space-y-2 border border-slate-100 dark:border-slate-800 p-2.5 rounded-lg">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Aday Değerlendirme Puanları (1 - 5)</label>
                {Object.keys(simulationForm.scores).map(crit => (
                  <div key={crit} className="flex justify-between items-center gap-2">
                    <span className="font-semibold">{crit}:</span>
                    <select
                      value={simulationForm.scores[crit as keyof typeof simulationForm.scores]}
                      onChange={(e) => {
                        const updatedVal = Number(e.target.value);
                        setSimulationForm(prev => ({
                          ...prev,
                          scores: {
                            ...prev.scores,
                            [crit]: updatedVal
                          }
                        }));
                      }}
                      className="px-2 py-1 border border-slate-200 rounded dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    >
                      <option value={5}>5 - Çok Başarılı</option>
                      <option value={4}>4 - Başarılı</option>
                      <option value={3}>3 - Ortalama</option>
                      <option value={2}>2 - Zayıf</option>
                      <option value={1}>1 - Başarısız</option>
                    </select>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Referansın Görüşü / Yorumu</label>
                <textarea
                  value={simulationForm.comments}
                  onChange={(e) => setSimulationForm(prev => ({ ...prev, comments: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="Detaylı referans yorumu..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">İK Görüşme Notları</label>
                <textarea
                  value={simulationForm.verificationNotes}
                  onChange={(e) => setSimulationForm(prev => ({ ...prev, verificationNotes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="Arama detayları..."
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowSimulateReferenceModal(false);
                    setSelectedReferenceForSimulation(null);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Geribildirimi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Suggested Questions Modal */}
      {showAiQuestionsModal && selectedInterviewForQuestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                  <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 dark:text-white text-sm">Yapay Zeka Soru Önerileri</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Aday: {selectedInterviewForQuestions.candidateName}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAiQuestionsModal(false);
                  setSelectedInterviewForQuestions(null);
                  setAiQuestions([]);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3.5 max-h-[50vh] overflow-y-auto">
              {loadingQuestions ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-600 dark:border-zinc-800 dark:border-t-indigo-400" />
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Yapay zeka CV analiziyle özel soruları hazırlıyor...</span>
                </div>
              ) : aiQuestions.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-zinc-450 leading-relaxed font-medium">
                    Adayın başvurduğu **{selectedInterviewForQuestions.jobPostingTitle}** ilan gereksinimlerine göre üretilen sorular:
                  </p>
                  <div className="space-y-2.5">
                    {aiQuestions.map((q, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/30 border border-slate-150/40 dark:border-slate-800 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded dark:bg-indigo-950/35 dark:text-indigo-400 uppercase tracking-wider">
                            {q.category}
                          </span>
                          <span className={clsx(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                            q.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" :
                            q.difficulty === "Medium" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400" :
                            "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                          )}>
                            {q.difficulty === "Easy" ? "Kolay" : q.difficulty === "Medium" ? "Orta" : "Zor"}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                          {q.question}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">Öneri alınamadı.</p>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                onClick={() => {
                  setShowAiQuestionsModal(false);
                  setSelectedInterviewForQuestions(null);
                  setAiQuestions([]);
                }}
                className="rounded-xl bg-slate-900 hover:bg-slate-950 text-white px-4 py-2 text-xs font-semibold dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
