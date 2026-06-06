"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import {
  performanceAPI,
  userAPI,
  lmsAPI,
  performance360API,
  PerformanceGoalDto,
  PerformanceEvaluationDto,
  UserDto,
  CourseDto,
  CourseAssignmentDto,
  CompetencyFormDto,
  Evaluation360Dto,
  mockDb
} from "@/lib/api";
import {
  Award,
  Plus,
  Star,
  CheckCircle,
  Clock,
  ChevronRight,
  X,
  BookOpen,
  Users,
  BarChart2,
  FileText,
  Trash2,
  Send,
  HelpCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { clsx } from "clsx";

type SubTab = "goals" | "feedback360" | "lms";

export default function PerformanceTab() {
  const { currentUser } = useAppStore();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("goals");
  const [loading, setLoading] = useState(true);

  // Users for HR/Manager assign operations
  const [employees, setEmployees] = useState<UserDto[]>([]);

  // 1. Goal & Evaluation States
  const [goals, setGoals] = useState<PerformanceGoalDto[]>([]);
  const [evaluations, setEvaluations] = useState<PerformanceEvaluationDto[]>([]);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    userId: "",
    title: "",
    description: "",
    targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    weight: 25
  });
  const [evalForm, setEvalForm] = useState({
    employeeId: "",
    period: "2026-Q2",
    score: 4,
    feedback: ""
  });

  // 2. 360 Degree Feedback States
  const [competencyForms, setCompetencyForms] = useState<CompetencyFormDto[]>([]);
  const [evaluations360, setEvaluations360] = useState<Evaluation360Dto[]>([]);
  const [myPending360s, setMyPending360s] = useState<Evaluation360Dto[]>([]);
  const [selected360ForFeedback, setSelected360ForFeedback] = useState<Evaluation360Dto | null>(null);
  const [feedback360Scores, setFeedback360Scores] = useState<Record<string, number>>({});
  const [feedback360Comment, setFeedback360Comment] = useState("");
  const [showCreate360RequestModal, setShowCreate360RequestModal] = useState(false);
  const [showCompetencyWizard, setShowCompetencyWizard] = useState(false);

  // Competency wizard form
  const [compFormDetails, setCompFormDetails] = useState({
    title: "",
    description: "",
    departmentId: ""
  });
  const [wizardCompetencies, setWizardCompetencies] = useState<{ category: string; question: string; weight: number }[]>([
    { category: "Technical", question: "Teknik Bilgi & Kod Kalitesi: Temiz kod prensipleri ve mimari standartlara uyum.", weight: 40.0 },
    { category: "Soft Skills", question: "Problem Çözme Yeteneği: Karmaşık hataları çözme ve analitik yaklaşım.", weight: 30.0 },
    { category: "Soft Skills", question: "İletişim & Takım Çalışması: Ekip arkadaşlarıyla uyum ve bilgi paylaşımı.", weight: 30.0 }
  ]);

  // Request 360 feedback form
  const [request360Form, setRequest360Form] = useState({
    employeeId: "",
    evaluatorId: "",
    evaluatorType: "Peer" as "Self" | "Manager" | "Peer" | "Subordinate",
    competencyFormId: "",
    period: "2026 Q2"
  });

  // 3. LMS & Training States
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [myAssignments, setMyAssignments] = useState<CourseAssignmentDto[]>([]);
  const [allAssignments, setAllAssignments] = useState<CourseAssignmentDto[]>([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAssignCourseModal, setShowAssignCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    type: "Online",
    durationHours: 3,
    provider: "SeedHR Akademi",
    documentUrl: ""
  });
  const [assignCourseForm, setAssignCourseForm] = useState({
    userId: "",
    courseId: ""
  });

  const userRole = currentUser?.roleName || "Employee";
  const isManagerOrHR = ["Admin", "Manager", "HR"].includes(userRole);
  const isHR = userRole === "HR" || userRole === "Admin";

  useEffect(() => {
    fetchData();
  }, [currentUser, activeSubTab]);

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // 1. Fetch Users list for dropdowns
      const empRes = await userAPI.getAll();
      if (empRes.success) {
        setEmployees(empRes.data);
        // Set default dropdown selections
        if (empRes.data.length > 0) {
          setGoalForm(prev => ({ ...prev, userId: empRes.data.find(u => u.id !== currentUser.id)?.id || empRes.data[0].id }));
          setEvalForm(prev => ({ ...prev, employeeId: empRes.data.find(u => u.id !== currentUser.id)?.id || empRes.data[0].id }));
          setRequest360Form(prev => ({
            ...prev,
            employeeId: empRes.data[0].id,
            evaluatorId: empRes.data.find(u => u.id !== empRes.data[0].id)?.id || empRes.data[0].id
          }));
          setAssignCourseForm(prev => ({ ...prev, userId: empRes.data[0].id }));
        }
      }

      if (activeSubTab === "goals") {
        // Fetch goals & standard evaluations
        const goalsRes = await performanceAPI.getGoals(currentUser.id);
        const evalRes = await performanceAPI.getEvaluations(
          isManagerOrHR ? undefined : currentUser.id
        );
        if (goalsRes.success) setGoals(goalsRes.data);
        if (evalRes.success) setEvaluations(evalRes.data);
      } else if (activeSubTab === "feedback360") {
        // Fetch competency templates
        const formRes = await performance360API.getCompetencyForms();
        if (formRes.success) {
          setCompetencyForms(formRes.data);
          if (formRes.data.length > 0) {
            setRequest360Form(prev => ({ ...prev, competencyFormId: formRes.data[0].id }));
          }
        }

        // Fetch evaluations of current employee
        const my360Res = await performance360API.get360EvaluationsForEmployee(currentUser.id, "2026 Q2");
        if (my360Res.success) setEvaluations360(my360Res.data);

        // Fetch pending/incoming evaluations assigned to this user to fill
        const incomingRes = await performance360API.get360EvaluationsByEvaluator(currentUser.id);
        if (incomingRes.success) {
          setMyPending360s(incomingRes.data.filter(e => e.status === "Draft"));
        }
      } else if (activeSubTab === "lms") {
        // Fetch courses and assignments
        const coursesRes = await lmsAPI.getCourses();
        if (coursesRes.success) {
          setCourses(coursesRes.data);
          if (coursesRes.data.length > 0) {
            setAssignCourseForm(prev => ({ ...prev, courseId: coursesRes.data[0].id }));
          }
        }

        const myAssignRes = await lmsAPI.getUserAssignments(currentUser.id);
        if (myAssignRes.success) setMyAssignments(myAssignRes.data);

        if (isHR) {
          const allAssignRes = await lmsAPI.getAllAssignments();
          if (allAssignRes.success) setAllAssignments(allAssignRes.data);
        }
      }
    } catch (err) {
      toast.error("Veriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // GOALS & EVALUATIONS ACTIONS
  // ----------------------------------------------------
  const handleProgressChange = async (goalId: string, progress: number) => {
    try {
      const res = await performanceAPI.updateGoalProgress(goalId, progress);
      if (res.success) {
        setGoals(prev => prev.map(g => g.id === goalId ? res.data : g));
        toast.success("İlerleme güncellendi.");
      }
    } catch (err) {
      toast.error("İlerleme güncellenemedi.");
    }
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await performanceAPI.createGoal(goalForm);
      if (res.success) {
        toast.success("Performans hedefi başarıyla atandı.");
        setShowAddGoalModal(false);
        setGoalForm({
          userId: employees.find(u => u.id !== currentUser?.id)?.id || employees[0]?.id || "",
          title: "",
          description: "",
          targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          weight: 25
        });
        fetchData();
      }
    } catch (err) {
      toast.error("Hedef atanamadı.");
    }
  };

  const handleEvalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const res = await performanceAPI.createEvaluation({
        ...evalForm,
        evaluatorId: currentUser.id,
        status: "Submitted"
      });
      if (res.success) {
        toast.success("Değerlendirme başarıyla tamamlandı.");
        setShowEvalModal(false);
        setEvalForm({
          employeeId: employees.find(u => u.id !== currentUser.id)?.id || employees[0]?.id || "",
          period: "2026-Q2",
          score: 4,
          feedback: ""
        });
        fetchData();
      }
    } catch (err) {
      toast.error("Değerlendirme gönderilemedi.");
    }
  };

  // ----------------------------------------------------
  // 360° EVALUATION ACTIONS
  // ----------------------------------------------------
  const handleCompetencyWizardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalWeight = wizardCompetencies.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      toast.error(`Yetkinlik ağırlıkları toplamı %100 olmalıdır. Şu an: %${totalWeight}`);
      return;
    }

    try {
      const res = await performance360API.createCompetencyForm({
        ...compFormDetails,
        competencies: wizardCompetencies
      });
      if (res.success) {
        toast.success("Değerlendirme şablonu oluşturuldu.");
        setShowCompetencyWizard(false);
        setCompFormDetails({ title: "", description: "", departmentId: "" });
        fetchData();
      }
    } catch (err) {
      toast.error("Değerlendirme şablonu oluşturulamadı.");
    }
  };

  const handle360RequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (request360Form.employeeId === request360Form.evaluatorId && request360Form.evaluatorType !== "Self") {
      toast.error("Çalışan ve değerlendirici aynı ise Rolü 'Kendi (Self)' olmalıdır.");
      return;
    }
    try {
      const res = await performance360API.create360Request(request360Form);
      if (res.success) {
        toast.success("360° Değerlendirme talebi gönderildi.");
        setShowCreate360RequestModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Talep gönderilemedi.");
    }
  };

  const startFill360 = async (evalReq: Evaluation360Dto) => {
    setSelected360ForFeedback(evalReq);
    // Fetch detailed form competencies
    try {
      const res = await performance360API.getCompetencyFormById(evalReq.competencyFormId);
      if (res.success) {
        const initialScores: Record<string, number> = {};
        res.data.competencies.forEach(c => {
          initialScores[c.id] = 4; // default score
        });
        setFeedback360Scores(initialScores);
      }
    } catch {
      toast.error("Değerlendirme şablonu yüklenemedi.");
    }
    setFeedback360Comment("");
  };

  const handle360FeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected360ForFeedback) return;
    try {
      const res = await performance360API.submit360Scores(selected360ForFeedback.id, {
        scores: feedback360Scores,
        feedback: feedback360Comment
      });
      if (res.success) {
        toast.success("360° Değerlendirmeniz başarıyla kaydedildi.");
        setSelected360ForFeedback(null);
        fetchData();
      }
    } catch {
      toast.error("Değerlendirme kaydedilemedi.");
    }
  };

  // ----------------------------------------------------
  // LMS / TRAINING ACTIONS
  // ----------------------------------------------------
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await lmsAPI.createCourse(courseForm);
      if (res.success) {
        toast.success("Eğitim programı eklendi.");
        setShowAddCourseModal(false);
        setCourseForm({
          title: "",
          description: "",
          type: "Online",
          durationHours: 3,
          provider: "SeedHR Akademi",
          documentUrl: ""
        });
        fetchData();
      }
    } catch {
      toast.error("Eğitim eklenemedi.");
    }
  };

  const handleAssignCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await lmsAPI.assignCourse(assignCourseForm);
      if (res.success) {
        toast.success("Eğitim başarıyla atandı.");
        setShowAssignCourseModal(false);
        fetchData();
      }
    } catch {
      toast.error("Eğitim atanamadı.");
    }
  };

  const handleCompleteCourse = async (assignmentId: string) => {
    const certUrl = prompt("Varsa Sertifika Dosya URL'ini girin (İsteğe bağlı):", "https://example.com/certificates/cert.pdf");
    if (certUrl === null) return; // cancelled

    try {
      const res = await lmsAPI.completeCourse(assignmentId, certUrl);
      if (res.success) {
        toast.success("Tebrikler! Eğitim başarıyla tamamlandı.");
        fetchData();
      }
    } catch {
      toast.error("İşlem gerçekleştirilemedi.");
    }
  };

  // Helper score color
  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400";
    if (score >= 3.5) return "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400";
    if (score >= 2.5) return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400";
    return "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400";
  };

  // Render visual comparison charts for 360
  const render360Chart = () => {
    if (evaluations360.length === 0) return null;

    // Calculate averages per type: Self, Manager, Peer
    const feedbackTypes = ["Self", "Manager", "Peer"];
    const typeAverages: Record<string, number> = { Self: 0, Manager: 0, Peer: 0 };
    const typeCounts: Record<string, number> = { Self: 0, Manager: 0, Peer: 0 };

    evaluations360.forEach(ev => {
      const scores = Object.values(ev.scores);
      if (scores.length > 0) {
        const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        typeAverages[ev.evaluatorType] = (typeAverages[ev.evaluatorType] || 0) + avg;
        typeCounts[ev.evaluatorType] = (typeCounts[ev.evaluatorType] || 0) + 1;
      }
    });

    feedbackTypes.forEach(t => {
      if (typeCounts[t] > 0) {
        typeAverages[t] = typeAverages[t] / typeCounts[t];
      }
    });

    return (
      <div className="p-4 border border-slate-100 rounded-xl dark:border-slate-800 bg-slate-50/20 dark:bg-zinc-950/20 mt-4">
        <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2 mb-4">
          <BarChart2 size={14} className="text-indigo-500" />
          Kişisel 360° Alignment Analizi (Puan Ortalamaları)
        </h4>
        <div className="space-y-4">
          {feedbackTypes.map(t => {
            const val = typeAverages[t] || 0;
            const percent = (val / 5) * 100;
            const labelText = t === "Self" ? "Kendi Değerlendirmem (Self)" : t === "Manager" ? "Yönetici Değerlendirmesi" : "İş Arkadaşları (Peer)";
            const barColor = t === "Self" ? "bg-amber-500" : t === "Manager" ? "bg-indigo-600" : "bg-emerald-500";
            return (
              <div key={t} className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-slate-600 dark:text-zinc-400">{labelText}</span>
                  <span className="text-slate-800 dark:text-white">{val.toFixed(1)} / 5.0</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={clsx("h-full transition-all duration-500 rounded-full", barColor)}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex border-b border-slate-150 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab("goals")}
          className={clsx(
            "pb-3 text-xs font-bold transition-all px-4 relative flex items-center gap-1.5",
            activeSubTab === "goals"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          )}
        >
          <Award size={14} /> Hedeflerim & Performans
        </button>
        <button
          onClick={() => setActiveSubTab("feedback360")}
          className={clsx(
            "pb-3 text-xs font-bold transition-all px-4 relative flex items-center gap-1.5",
            activeSubTab === "feedback360"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          )}
        >
          <Users size={14} /> 360° Değerlendirme
        </button>
        <button
          onClick={() => setActiveSubTab("lms")}
          className={clsx(
            "pb-3 text-xs font-bold transition-all px-4 relative flex items-center gap-1.5",
            activeSubTab === "lms"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          )}
        >
          <BookOpen size={14} /> Eğitim & Gelişim (LMS)
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. TAB: GOALS & PERFORMANCE EVAL */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === "goals" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top action row */}
          {isManagerOrHR && (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddGoalModal(true)}
                className="flex items-center gap-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 px-4 py-2 text-xs font-semibold dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
              >
                <Plus size={14} /> Yeni Hedef Ata
              </button>
              <button
                onClick={() => setShowEvalModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 text-xs font-semibold transition"
              >
                <Award size={14} /> Değerlendirme Yap
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Performance Goals List */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Performans Hedeflerim</h3>
              <p className="text-xs text-slate-400 mt-1">İlerleme çubuğunu kaydırarak çalışmalarınızı güncelleyebilirsiniz.</p>

              <div className="mt-4 space-y-4">
                {loading ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Yükleniyor...</p>
                ) : goals.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Tanımlanmış aktif performans hedefiniz bulunmuyor.</p>
                ) : (
                  goals.map((g) => (
                    <div key={g.id} className="p-4 border border-slate-100 rounded-xl dark:border-slate-800">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            {g.status === "Completed" ? (
                              <CheckCircle size={16} className="text-emerald-500" />
                            ) : (
                              <Clock size={16} className="text-indigo-500 animate-pulse" />
                            )}
                            <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">{g.title}</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{g.description}</p>
                        </div>
                        <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 shrink-0 dark:bg-zinc-800 dark:text-zinc-400">
                          Ağırlık: %{g.weight}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Hedef Tarih: {new Date(g.targetDate).toLocaleDateString("tr-TR")}</span>
                          <span className="font-semibold text-slate-700 dark:text-zinc-300">Tamamlanma: %{g.progressPercentage}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="10"
                          value={g.progressPercentage}
                          onChange={(e) => handleProgressChange(g.id, Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-zinc-800"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Evaluations History List */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-slate-800 dark:text-zinc-200">
                {isManagerOrHR ? "Personel Değerlendirmeleri" : "Değerlendirme Geçmişim"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Dönemsel puanlama ve yönetici geribildirimleri.</p>

              <div className="mt-4 space-y-4">
                {loading ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Yükleniyor...</p>
                ) : evaluations.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Değerlendirme kaydı bulunamadı.</p>
                ) : (
                  evaluations.map((e) => (
                    <div key={e.id} className="p-4 border border-slate-100 rounded-xl dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                            {isManagerOrHR ? `${e.employeeName} Değerlendirmesi` : `${e.evaluatorName} Geribildirimi`}
                          </h4>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">{e.period} Dönemi ({new Date(e.evaluationDate).toLocaleDateString("tr-TR")})</span>
                        </div>
                        <div className={clsx("flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-bold shrink-0", getScoreColor(e.score))}>
                          <Star size={12} fill="currentColor" /> {e.score.toFixed(1)} / 5.0
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50 italic dark:bg-zinc-800/20 dark:border-slate-800/50">
                        "{e.feedback}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. TAB: 360 DEGREE FEEDBACK */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === "feedback360" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* HR Wizard buttons */}
          {isHR && (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCompetencyWizard(true)}
                className="flex items-center gap-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 px-4 py-2 text-xs font-semibold dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
              >
                <FileText size={14} /> Yetkinlik Şablonu Sihirbazı
              </button>
              <button
                onClick={() => setShowCreate360RequestModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 text-xs font-semibold transition"
              >
                <Send size={14} /> 360° Değerlendirme Talebi Gönder
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Incoming requests to fill */}
            <div className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Doldurmam Beklenen 360° Formları</h3>
              <p className="text-xs text-slate-400 mt-1">İş arkadaşlarınız ve yöneticileriniz için yetkinlik formları.</p>

              <div className="mt-4 space-y-3">
                {myPending360s.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Giriş yapmanız beklenen aktif 360° değerlendirme bulunmamaktadır.</p>
                ) : (
                  myPending360s.map(req => (
                    <div key={req.id} className="p-3 border border-slate-100 rounded-xl dark:border-slate-800 space-y-2 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">{req.employeeName}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Rol: {req.evaluatorType} | Dönem: {req.period}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">"{req.competencyFormTitle}"</p>
                      </div>
                      <button
                        onClick={() => startFill360(req)}
                        className="w-full text-center rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 px-3 py-1.5 text-xs font-bold transition mt-2"
                      >
                        Formu Doldur ve Gönder
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* My 360 Feedback Result View */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-zinc-200">360° Geri Bildirim Sonuçlarım ({evaluations360[0]?.period || "2026 Q2"})</h3>
                <p className="text-xs text-slate-400 mt-1">Yöneticileriniz ve çalışma arkadaşlarınızdan gelen ortalama skor analizleri.</p>
              </div>

              {render360Chart()}

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Açık Uçlu Yorumlar & Tavsiyeler</h4>
                {evaluations360.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Henüz toplanmış 360° değerlendirme yorumu bulunmamaktadır.</p>
                ) : (
                  <div className="space-y-3">
                    {evaluations360.map(ev => ev.feedback && (
                      <div key={ev.id} className="p-3 border border-slate-100 rounded-xl dark:border-slate-800">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                          <span>Tür: {ev.evaluatorType === "Self" ? "Kendi Görüşüm" : ev.evaluatorType === "Manager" ? "Yönetici" : "Çalışma Arkadaşı"}</span>
                          <span>{new Date(ev.createdAt).toLocaleDateString("tr-TR")}</span>
                        </div>
                        <p className="mt-2 text-xs italic text-slate-600 dark:text-slate-300">
                          "{ev.feedback}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. TAB: LMS & TRAINING */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === "lms" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* HR LMS buttons */}
          {isHR && (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddCourseModal(true)}
                className="flex items-center gap-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 px-4 py-2 text-xs font-semibold dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
              >
                <Plus size={14} /> Yeni Eğitim Ekle
              </button>
              <button
                onClick={() => setShowAssignCourseModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 text-xs font-semibold transition"
              >
                <BookOpen size={14} /> Personele Eğitim Ata
              </button>
            </div>
          )}

          {/* Assigned Trainings */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* My assignments */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Eğitim Programlarım (LMS)</h3>
              <p className="text-xs text-slate-400 mt-1">Gelişiminiz için atanan aktif veya tamamlanmış eğitimler.</p>

              <div className="mt-4 space-y-4">
                {myAssignments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Adınıza atanmış eğitim programı bulunmamaktadır.</p>
                ) : (
                  myAssignments.map(assign => (
                    <div key={assign.id} className="p-4 border border-slate-100 rounded-xl dark:border-slate-800 flex justify-between items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-indigo-500" />
                          <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">{assign.course?.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{assign.course?.description}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2">
                          <span>Süre: {assign.course?.durationHours} Saat</span>
                          <span>Sağlayıcı: {assign.course?.provider}</span>
                          {assign.completedDate && (
                            <span className="text-emerald-500">Tamamlandı: {new Date(assign.completedDate).toLocaleDateString("tr-TR")}</span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        {assign.status === "Completed" ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full px-2.5 py-0.5 text-[10px] font-bold dark:bg-emerald-950/20 dark:text-emerald-400">
                            <CheckCircle size={10} fill="currentColor" className="text-white dark:text-zinc-900" /> Tamamlandı
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCompleteCourse(assign.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold transition"
                          >
                            Eğitimi Tamamla
                          </button>
                        )}
                        {assign.certificateUrl && (
                          <a
                            href={assign.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-indigo-500 hover:underline mt-1 font-semibold"
                          >
                            Sertifikayı Görüntüle
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Course Catalog (Sidebar) */}
            <div className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Aktif Eğitim Kataloğu</h3>
              <p className="text-xs text-slate-400 mt-1">Gelişim kataloğundaki genel eğitimler.</p>

              <div className="mt-4 space-y-3">
                {courses.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Katalogda aktif eğitim bulunmamaktadır.</p>
                ) : (
                  courses.map(c => (
                    <div key={c.id} className="p-3 border border-slate-100 rounded-xl dark:border-slate-800">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">{c.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">{c.description}</p>
                      <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400">
                        <span>{c.type} | {c.durationHours} Saat</span>
                        {c.documentUrl && (
                          <a href={c.documentUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                            Döküman
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODALS */}
      {/* ---------------------------------------------------- */}

      {/* 360 Fill Form Modal */}
      {selected360ForFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-950 dark:text-white">360° Değerlendirme Formu Doldur</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Hedef Kişi: {selected360ForFeedback.employeeName}</p>
              </div>
              <button onClick={() => setSelected360ForFeedback(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handle360FeedbackSubmit} className="space-y-6 mt-4">
              {/* Question list dynamically fetched */}
              <div className="space-y-4">
                {competencyForms
                  .find(f => f.id === selected360ForFeedback.competencyFormId)
                  ?.competencies.map((c, i) => (
                    <div key={c.id} className="p-3 border border-slate-50 rounded-xl dark:border-slate-800 bg-slate-50/30 dark:bg-zinc-950/10 space-y-2">
                      <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                        <span>Soru {i + 1} ({c.category})</span>
                        <span>Ağırlık: %{c.weight}</span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-zinc-200 font-semibold">{c.question}</p>
                      <div className="flex justify-between items-center gap-1.5 pt-2">
                        {[1, 2, 3, 4, 5].map(scoreVal => (
                          <button
                            key={scoreVal}
                            type="button"
                            onClick={() => setFeedback360Scores(prev => ({ ...prev, [c.id]: scoreVal }))}
                            className={clsx(
                              "w-10 h-10 rounded-full text-xs font-bold transition flex items-center justify-center border",
                              feedback360Scores[c.id] === scoreVal
                                ? "bg-indigo-600 border-indigo-600 text-white shadow"
                                : "bg-white dark:bg-zinc-950 border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-zinc-400"
                            )}
                          >
                            {scoreVal}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Açık Uçlu Görüş & Tavsiyeleriniz</label>
                <textarea
                  value={feedback360Comment}
                  onChange={(e) => setFeedback360Comment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="Eklemek istediğiniz geribildirim notları..."
                  required
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelected360ForFeedback(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Değerlendirmeyi Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Competency Wizard Modal */}
      {showCompetencyWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-950 dark:text-white">Yetkinlik Şablonu Sihirbazı (İK)</h3>
              <button onClick={() => setShowCompetencyWizard(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCompetencyWizardSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Şablon Adı</label>
                <input
                  type="text"
                  value={compFormDetails.title}
                  onChange={(e) => setCompFormDetails(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="örn. Yazılım Geliştirici Değerlendirme Şablonu"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Açıklama</label>
                <textarea
                  value={compFormDetails.description}
                  onChange={(e) => setCompFormDetails(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="Şablonun kapsamı..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Hedef Departman (İsteğe bağlı)</label>
                <select
                  value={compFormDetails.departmentId}
                  onChange={(e) => setCompFormDetails(prev => ({ ...prev, departmentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                >
                  <option value="">Tüm Departmanlar</option>
                  <option value="dept_it">Bilgi Teknolojileri</option>
                  <option value="dept_ik">İnsan Kaynakları</option>
                  <option value="dept_sat">Satış</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-500">Kriterler & Sorular (Toplam Ağırlık %100 olmalı)</label>
                  <button
                    type="button"
                    onClick={() => setWizardCompetencies(prev => [...prev, { category: "Soft Skills", question: "Yeni yetkinlik sorusu...", weight: 10 }])}
                    className="text-[10px] text-indigo-600 hover:underline font-bold"
                  >
                    + Soru Ekle
                  </button>
                </div>

                <div className="space-y-2">
                  {wizardCompetencies.map((comp, idx) => (
                    <div key={idx} className="flex gap-2 items-center p-2.5 border border-slate-100 rounded-lg dark:border-slate-800">
                      <select
                        value={comp.category}
                        onChange={(e) => {
                          const updated = [...wizardCompetencies];
                          updated[idx].category = e.target.value;
                          setWizardCompetencies(updated);
                        }}
                        className="px-2 py-1.5 border border-slate-200 rounded text-xs dark:bg-zinc-950 dark:border-slate-800 dark:text-white shrink-0"
                      >
                        <option value="Technical">Technical</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="Leadership">Leadership</option>
                      </select>
                      <input
                        type="text"
                        value={comp.question}
                        onChange={(e) => {
                          const updated = [...wizardCompetencies];
                          updated[idx].question = e.target.value;
                          setWizardCompetencies(updated);
                        }}
                        className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-xs dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                        placeholder="Soru metni..."
                        required
                      />
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={comp.weight}
                        onChange={(e) => {
                          const updated = [...wizardCompetencies];
                          updated[idx].weight = Number(e.target.value);
                          setWizardCompetencies(updated);
                        }}
                        className="w-16 px-2 py-1.5 border border-slate-200 rounded text-xs dark:bg-zinc-950 dark:border-slate-800 dark:text-white shrink-0"
                        placeholder="%"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setWizardCompetencies(prev => prev.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700 shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCompetencyWizard(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Şablonu Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create 360 Request Modal */}
      {showCreate360RequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-950 dark:text-white">360° Değerlendirme Talebi Oluştur</h3>
              <button onClick={() => setShowCreate360RequestModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handle360RequestSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Değerlendirilecek Çalışan</label>
                <select
                  value={request360Form.employeeId}
                  onChange={(e) => setRequest360Form(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.fullName} ({e.positionTitle})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Değerlendirecek Kişi</label>
                <select
                  value={request360Form.evaluatorId}
                  onChange={(e) => setRequest360Form(prev => ({ ...prev, evaluatorId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.fullName} ({e.positionTitle})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">İlişki Türü (Rol)</label>
                  <select
                    value={request360Form.evaluatorType}
                    onChange={(e) => setRequest360Form(prev => ({ ...prev, evaluatorType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="Self">Self (Kendi)</option>
                    <option value="Peer">Peer (Akran)</option>
                    <option value="Manager">Manager (Yönetici)</option>
                    <option value="Subordinate">Subordinate (Ast)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Dönem</label>
                  <select
                    value={request360Form.period}
                    onChange={(e) => setRequest360Form(prev => ({ ...prev, period: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="2026 Q1">2026 Q1</option>
                    <option value="2026 Q2">2026 Q2</option>
                    <option value="2026 Q3">2026 Q3</option>
                    <option value="2026 Q4">2026 Q4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Değerlendirme Yetkinlik Şablonu</label>
                <select
                  value={request360Form.competencyFormId}
                  onChange={(e) => setRequest360Form(prev => ({ ...prev, competencyFormId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                >
                  {competencyForms.map(f => (
                    <option key={f.id} value={f.id}>{f.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreate360RequestModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Talebi Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-950 dark:text-white">Yeni Eğitim Ekle</h3>
              <button onClick={() => setShowAddCourseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCourseSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Eğitim Başlığı</label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="örn. Siber Güvenlik Farkındalık Eğitimi"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Açıklama</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="Eğitim içeriği..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Eğitim Türü</label>
                  <select
                    value={courseForm.type}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="Online">Online / Video</option>
                    <option value="Classroom">Sınıf İçi (Classroom)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Süre (Saat)</label>
                  <input
                    type="number"
                    value={courseForm.durationHours}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, durationHours: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Eğitim Sağlayıcı / Ekip</label>
                <input
                  type="text"
                  value={courseForm.provider}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="örn. IT Güvenlik Ekibi"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Eğitim Materyal Linki (Döküman / Video URL)</label>
                <input
                  type="url"
                  value={courseForm.documentUrl}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, documentUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Course Modal */}
      {showAssignCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-950 dark:text-white">Personele Eğitim Ata</h3>
              <button onClick={() => setShowAssignCourseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignCourseSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Çalışan</label>
                <select
                  value={assignCourseForm.userId}
                  onChange={(e) => setAssignCourseForm(prev => ({ ...prev, userId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.fullName} ({e.positionTitle})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Atanacak Eğitim Programı</label>
                <select
                  value={assignCourseForm.courseId}
                  onChange={(e) => setAssignCourseForm(prev => ({ ...prev, courseId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignCourseModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Eğitimi Ata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-950 dark:text-white">Performans Hedefi Ata</h3>
              <button onClick={() => setShowAddGoalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGoalSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Çalışan</label>
                <select
                  value={goalForm.userId}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, userId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.fullName} ({e.positionTitle})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Hedef Başlığı</label>
                <input
                  type="text"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="Hedefin kısa adı..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Hedef Detayı / Açıklama</label>
                <textarea
                  value={goalForm.description}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="Detaylar ve beklentiler..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Hedef Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={goalForm.targetDate}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, targetDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Hedef Ağırlığı (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={goalForm.weight}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, weight: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Ata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Evaluation Modal */}
      {showEvalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-950 dark:text-white">Personel Değerlendirmesi Yap</h3>
              <button onClick={() => setShowEvalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEvalSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Değerlendirilecek Çalışan</label>
                <select
                  value={evalForm.employeeId}
                  onChange={(e) => setEvalForm(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.fullName} ({e.positionTitle})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Dönem</label>
                  <select
                    value={evalForm.period}
                    onChange={(e) => setEvalForm(prev => ({ ...prev, period: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="2026-Q1">2026-Q1</option>
                    <option value="2026-Q2">2026-Q2</option>
                    <option value="2026-Q3">2026-Q3</option>
                    <option value="2026-Q4">2026-Q4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Skor Puanı (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.5"
                    value={evalForm.score}
                    onChange={(e) => setEvalForm(prev => ({ ...prev, score: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Geribildirim Notu / Yorumlar</label>
                <textarea
                  value={evalForm.feedback}
                  onChange={(e) => setEvalForm(prev => ({ ...prev, feedback: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  placeholder="Detaylı performans geribildirimi..."
                  required
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEvalModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
