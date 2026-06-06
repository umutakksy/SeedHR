"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { onboardingAPI, userAPI, departmentAPI, positionAPI, UserDto, DepartmentDto, PositionDto, OnboardingPlanDto, OnboardingProgressDto, OnboardingTaskDto } from "@/lib/api";
import {
  Rocket,
  CheckSquare,
  Square,
  ClipboardList,
  Plus,
  Trash2,
  Play,
  Users,
  Calendar,
  Layers,
  Award,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Send,
  HelpCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { clsx } from "clsx";

export default function OnboardingTab() {
  const { currentUser } = useAppStore();
  const [plans, setPlans] = useState<OnboardingPlanDto[]>([]);
  const [activeInstances, setActiveInstances] = useState<OnboardingProgressDto[]>([]);
  const [personalProgress, setPersonalProgress] = useState<OnboardingProgressDto | null>(null);
  
  // Catalogs for forms
  const [users, setUsers] = useState<UserDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [positions, setPositions] = useState<PositionDto[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [expandedInstance, setExpandedInstance] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"tracking" | "templates" | "myTasks">("tracking");

  // Modals state
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);

  // Create Plan Form State
  const [planForm, setPlanForm] = useState({
    name: "",
    departmentId: "",
    positionId: "",
    durationDays: 14
  });
  const [planTasks, setPlanTasks] = useState<Partial<OnboardingTaskDto>[]>([
    { title: "Evrak ve Belgelerin İmzalanması", description: "Sözleşme ve özlük evraklarının İK birimine teslimi", category: "Document", dueDay: 1, assignedToRole: "Employee", isMandatory: true }
  ]);

  // Start Onboarding Form State
  const [startForm, setStartForm] = useState({
    userId: "",
    planId: ""
  });

  const userRole = currentUser?.roleName || "Employee";
  const isManagerOrHR = ["Admin", "Manager", "HR"].includes(userRole);

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Load plans
      const plansRes = await onboardingAPI.getPlans();
      if (plansRes.success) setPlans(plansRes.data);

      if (isManagerOrHR) {
        // Load active onboarding processes
        const activeRes = await onboardingAPI.getActive();
        if (activeRes.success) setActiveInstances(activeRes.data);
        
        // Load catalogs
        const usersRes = await userAPI.getAll();
        const deptsRes = await departmentAPI.getAll();
        const posRes = await positionAPI.getAll();
        
        if (usersRes.success) setUsers(usersRes.data.filter(u => u.isActive));
        if (deptsRes.success) setDepartments(deptsRes.data);
        if (posRes.success) setPositions(posRes.data);
      }

      // Always check if current user has an active onboarding plan
      if (currentUser) {
        const progressRes = await onboardingAPI.getProgress(currentUser.id);
        if (progressRes.success) {
          setPersonalProgress(progressRes.data);
        }
      }
    } catch (err) {
      console.log("Onboarding data fetch error: ", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleInstanceExpand = (id: string) => {
    setExpandedInstance(prev => (prev === id ? null : id));
  };

  // Task Complete Action (For any role completing a task they are assigned to)
  const handleCompleteTask = async (taskId: string, currentInstanceUserId?: string) => {
    try {
      const res = await onboardingAPI.completeTask(taskId, { evidenceUrl: "" });
      if (res.success) {
        toast.success(res.message || "Görev başarıyla tamamlandı!");
        fetchData();
      }
    } catch (err) {
      toast.error("Görev tamamlanırken hata oluştu.");
    }
  };

  // Plan Creator Handlers
  const handleAddTaskInForm = () => {
    setPlanTasks(prev => [
      ...prev,
      {
        title: "",
        description: "",
        category: "Document",
        dueDay: 1,
        assignedToRole: "Employee",
        isMandatory: true
      }
    ]);
  };

  const handleRemoveTaskInForm = (index: number) => {
    if (planTasks.length <= 1) {
      toast.error("Plan en az 1 görev içermelidir.");
      return;
    }
    setPlanTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleTaskFieldChange = (index: number, field: string, value: any) => {
    setPlanTasks(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name.trim()) {
      toast.error("Lütfen şablon adını girin.");
      return;
    }

    const invalidTask = planTasks.find(t => !t.title?.trim() || !t.description?.trim());
    if (invalidTask) {
      toast.error("Lütfen tüm görevlerin Başlık ve Açıklama alanlarını doldurun.");
      return;
    }

    try {
      const res = await onboardingAPI.createPlan({
        ...planForm,
        durationDays: Number(planForm.durationDays),
        tasks: planTasks
      });
      if (res.success) {
        toast.success(res.message || "Onboarding şablonu oluşturuldu.");
        setShowCreatePlanModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Şablon kaydedilirken hata oluştu.");
    }
  };

  // Start Onboarding Process Handler
  const handleStartOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startForm.userId || !startForm.planId) {
      toast.error("Lütfen çalışan ve plan şablonu seçin.");
      return;
    }
    try {
      const res = await onboardingAPI.start(startForm.userId, startForm.planId);
      if (res.success) {
        toast.success(res.message || "Onboarding süreci başlatıldı.");
        setShowStartModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Süreç başlatılamadı.");
    }
  };

  // Send Late Reminders
  const handleSendReminders = async () => {
    try {
      const res = await onboardingAPI.sendReminders();
      if (res.success) {
        toast.success(res.message || "Hatırlatma bildirimleri e-posta ile gönderildi.");
      }
    } catch (err) {
      toast.error("İşlem başarısız.");
    }
  };

  // Helper to extract role tasks
  const getTasksAssignedToRole = () => {
    const list: { instance: OnboardingProgressDto; task: any }[] = [];
    activeInstances.forEach(inst => {
      inst.tasks.forEach(task => {
        if (task.completionStatus === "Pending") {
          // If the currentUser is HR and task is for HR
          // Or Manager of that employee and task is for Manager
          // Or IT role and task is for IT
          const matchRole =
            (task.assignedToRole === "HR" && userRole === "HR") ||
            (task.assignedToRole === "IT" && userRole === "Admin") || // Admin acts as IT/all
            (task.assignedToRole === "Manager" && userRole === "Manager" && inst.userName !== currentUser?.fullName);
            
          if (matchRole || userRole === "Admin") {
            list.push({ instance: inst, task });
          }
        }
      });
    });
    return list;
  };

  const myAssignedTasks = getTasksAssignedToRole();

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "document":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100/60 dark:border-blue-900/40";
      case "system":
        return "bg-teal-50 text-teal-700 dark:bg-teal-950/20 dark:text-teal-400 border border-teal-100/60 dark:border-teal-900/40";
      case "meeting":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-100/60 dark:border-purple-900/40";
      case "training":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/40";
      default:
        return "bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-slate-700";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "Employee": return "Çalışan";
      case "IT": return "BT/Sistem";
      case "HR": return "İnsan Kaynakları";
      case "Manager": return "Yönetici";
      default: return role;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header & Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex gap-4">
          {isManagerOrHR && (
            <>
              <button
                onClick={() => setActiveSubTab("tracking")}
                className={clsx(
                  "pb-2 text-xs font-bold transition-all relative tracking-wide",
                  activeSubTab === "tracking"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                )}
              >
                Süreç Takibi ({activeInstances.length})
              </button>
              <button
                onClick={() => setActiveSubTab("myTasks")}
                className={clsx(
                  "pb-2 text-xs font-bold transition-all relative tracking-wide",
                  activeSubTab === "myTasks"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                )}
              >
                Bana Atanan Görevler ({myAssignedTasks.length})
              </button>
              <button
                onClick={() => setActiveSubTab("templates")}
                className={clsx(
                  "pb-2 text-xs font-bold transition-all relative tracking-wide",
                  activeSubTab === "templates"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                )}
              >
                Plan Şablonları ({plans.length})
              </button>
            </>
          )}
          {!isManagerOrHR && (
            <div className="pb-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400">
              Oryantasyon Sürecim
            </div>
          )}
        </div>
        
        {isManagerOrHR && (
          <div className="flex gap-2 self-end sm:self-center">
            {activeSubTab === "tracking" && (
              <>
                <button
                  onClick={handleSendReminders}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 transition"
                >
                  <Send size={13} /> Gecikmeleri Hatırlat
                </button>
                <button
                  onClick={() => {
                    setStartForm({
                      userId: users[0]?.id || "",
                      planId: plans[0]?.id || ""
                    });
                    setShowStartModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-semibold shadow-sm transition"
                >
                  <Play size={13} /> Oryantasyon Başlat
                </button>
              </>
            )}
            {activeSubTab === "templates" && (
              <button
                onClick={handleOpenCreatePlan}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-semibold shadow-sm transition"
              >
                <Plus size={13} /> Yeni Şablon Oluştur
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Loading State */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"></div>
          <p className="text-xs text-slate-400 mt-2">Veriler yükleniyor...</p>
        </div>
      ) : (
        <>
          {/* ==================================================== */}
          {/* A. PERSONAL ONBOARDING CHECKLIST (For standard Employees) */}
          {/* ==================================================== */}
          {!isManagerOrHR && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {personalProgress ? (
                <>
                  <div className="md:col-span-1 space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                          <Rocket size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Oryantasyon Planı</h3>
                          <span className="text-[10px] text-slate-400">İşe Uyum Programı</span>
                        </div>
                      </div>
                      
                      <div className="mt-5 space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
                        <div>
                          <span className="font-semibold block text-[10px] text-slate-400 uppercase">Süreç Adı</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{personalProgress.planName}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-semibold block text-[10px] text-slate-400 uppercase">Başlangıç</span>
                            <span>{new Date(personalProgress.startDate).toLocaleDateString("tr-TR")}</span>
                          </div>
                          <div>
                            <span className="font-semibold block text-[10px] text-slate-400 uppercase">Durum</span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{personalProgress.status === "In Progress" ? "Devam Ediyor" : "Tamamlandı"}</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t dark:border-slate-800">
                          <div className="flex justify-between font-semibold text-[10px] text-slate-400 mb-1.5 uppercase">
                            <span>Program İlerlemesi</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{personalProgress.progressPercentage}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                            <div className="h-full bg-indigo-600 transition-all duration-550" style={{ width: `${personalProgress.progressPercentage}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
                      <h3 className="font-bold text-slate-850 dark:text-zinc-100 text-sm border-b pb-2 mb-4">Görev Listesi</h3>
                      <div className="space-y-3">
                        {personalProgress.tasks.map((task) => {
                          const isEmployeeTask = task.assignedToRole === "Employee";
                          const isDone = task.completionStatus === "Completed";
                          return (
                            <div
                              key={task.taskId}
                              className={clsx(
                                "flex items-start gap-3 p-3.5 rounded-lg border transition",
                                isDone 
                                  ? "bg-slate-50/50 border-slate-150 dark:bg-zinc-950/20 dark:border-slate-900" 
                                  : "bg-white border-slate-200 dark:bg-zinc-900 dark:border-slate-800/80"
                              )}
                            >
                              <div className="pt-0.5">
                                {isDone ? (
                                  <CheckSquare className="text-emerald-600 dark:text-emerald-500" size={16} />
                                ) : isEmployeeTask ? (
                                  <button onClick={() => handleCompleteTask(task.taskId)} className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                                    <Square size={16} />
                                  </button>
                                ) : (
                                  <Clock className="text-slate-300 dark:text-zinc-700" size={16} />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className={clsx("font-bold text-xs", isDone ? "text-slate-400 line-through" : "text-slate-800 dark:text-zinc-200")}>
                                    {task.title}
                                  </h4>
                                  {task.isMandatory && (
                                    <span className="text-[8px] bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 px-1 py-0.5 rounded font-bold uppercase">Zorunlu</span>
                                  )}
                                </div>
                                <p className={clsx("text-xs mt-1", isDone ? "text-slate-400" : "text-slate-500 dark:text-slate-400")}>
                                  {task.description}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2 items-center text-[9px] text-slate-400">
                                  <span className={clsx("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase", getCategoryColor(task.category))}>
                                    {task.category === "Document" ? "Evrak" : task.category === "System" ? "Sistem" : task.category === "Meeting" ? "Toplantı" : "Eğitim"}
                                  </span>
                                  <span>Girişten itibaren: <strong>{task.dueDay}. Gün</strong></span>
                                  <span className="border-l border-slate-200 dark:border-slate-800 pl-2">Sorumlu: <strong className="text-slate-600 dark:text-zinc-300">{getRoleLabel(task.assignedToRole)}</strong></span>
                                  {isDone && task.completionDate && (
                                    <span className="text-emerald-600 dark:text-emerald-400 border-l border-slate-200 dark:border-slate-800 pl-2">Tamamlandı: {new Date(task.completionDate).toLocaleDateString("tr-TR")}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-zinc-900">
                  <Rocket className="mx-auto text-slate-300 dark:text-zinc-800 mb-3" size={32} />
                  <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm">Aktif Oryantasyon Planı Yok</h3>
                  <p className="text-xs text-slate-400 mt-1">Hesabınız için atanmış aktif bir uyum süreci bulunmuyor. İK birimi ile iletişime geçebilirsiniz.</p>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* B. ACTIVE INSTANCES TRACKING (For Admin/HR/Manager) */}
          {/* ==================================================== */}
          {isManagerOrHR && activeSubTab === "tracking" && (
            <div className="space-y-4">
              {activeInstances.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-zinc-900">
                  <ClipboardList className="mx-auto text-slate-300 dark:text-zinc-800 mb-3" size={32} />
                  <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm">Devam Eden Oryantasyon Yok</h3>
                  <p className="text-xs text-slate-400 mt-1">Şu anda işe uyum süreci devam eden bir çalışan bulunmuyor.</p>
                </div>
              ) : (
                activeInstances.map((inst) => {
                  const isExpanded = expandedInstance === inst.instanceId;
                  const totalTasks = inst.tasks.length;
                  const completedTasks = inst.tasks.filter(t => t.completionStatus === "Completed").length;
                  return (
                    <div
                      key={inst.instanceId}
                      className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-zinc-900 overflow-hidden"
                    >
                      {/* Accordion Header */}
                      <div
                        onClick={() => toggleInstanceExpand(inst.instanceId)}
                        className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-900/40 select-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase shrink-0">
                            {inst.userName[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs">{inst.userName}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{inst.planName}</p>
                          </div>
                        </div>

                        <div className="flex flex-1 items-center gap-4 sm:max-w-xs">
                          <div className="flex-1">
                            <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                              <span>İlerleme: {completedTasks}/{totalTasks} Görev</span>
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{inst.progressPercentage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full dark:bg-zinc-800 overflow-hidden">
                              <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${inst.progressPercentage}%` }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(inst.startDate).toLocaleDateString("tr-TR")}</span>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {/* Accordion Content (Task list details) */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 p-4 dark:bg-zinc-950/10 space-y-2">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Süreç Detayları</h5>
                          <div className="grid grid-cols-1 gap-2.5">
                            {inst.tasks.map((task) => {
                              const isDone = task.completionStatus === "Completed";
                              
                              // Check if active user has permission to complete this task
                              const userCanComplete =
                                userRole === "Admin" ||
                                (task.assignedToRole === "HR" && userRole === "HR") ||
                                (task.assignedToRole === "IT" && userRole === "Admin") || // BT maps to Admin
                                (task.assignedToRole === "Manager" && userRole === "Manager" && inst.userName !== currentUser?.fullName);

                              return (
                                <div
                                  key={task.taskId}
                                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200/60 bg-white dark:border-slate-800/80 dark:bg-zinc-900 text-xs"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="shrink-0">
                                      {isDone ? (
                                        <CheckSquare className="text-emerald-600 dark:text-emerald-500" size={14} />
                                      ) : userCanComplete ? (
                                        <button
                                          onClick={() => handleCompleteTask(task.taskId, inst.userId)}
                                          className="text-slate-400 hover:text-indigo-600 transition"
                                          title="Görevi Tamamla"
                                        >
                                          <Square size={14} />
                                        </button>
                                      ) : (
                                        <Clock className="text-slate-300 dark:text-zinc-700" size={14} />
                                      )}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className={clsx("font-bold", isDone ? "text-slate-400 line-through" : "text-slate-700 dark:text-zinc-200")}>{task.title}</span>
                                        <span className={clsx("px-1.5 py-0.2 rounded text-[7px] font-bold uppercase", getCategoryColor(task.category))}>
                                          {task.category === "Document" ? "Evrak" : task.category === "System" ? "Sistem" : task.category === "Meeting" ? "Toplantı" : "Eğitim"}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-0.5">{task.description}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 shrink-0 text-[10px] text-slate-500 dark:text-zinc-400">
                                    <span>Gün: <strong>{task.dueDay}</strong></span>
                                    <span className="bg-slate-50 dark:bg-zinc-950 px-2 py-0.5 rounded border dark:border-slate-850">Sorumlu: <strong>{getRoleLabel(task.assignedToRole)}</strong></span>
                                    <div>
                                      {isDone ? (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Tamamlandı</span>
                                      ) : (
                                        <span className="text-amber-600 dark:text-amber-500 font-semibold">Bekliyor</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* C. TASKS ASSIGNED TO LOGGED-IN ROLE (Admin/HR/Manager) */}
          {/* ==================================================== */}
          {isManagerOrHR && activeSubTab === "myTasks" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-zinc-900">
                <h3 className="font-bold text-slate-900 dark:text-zinc-200 text-xs">Bekleyen Görevlerim</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Rolünüz gereği diğer çalışma arkadaşlarınızın uyum sürecinde tamamlamanız gereken görevler.</p>
              </div>

              {myAssignedTasks.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-zinc-900">
                  <CheckSquare className="mx-auto text-emerald-600 dark:text-emerald-500 mb-3" size={32} />
                  <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm">Tebrikler!</h3>
                  <p className="text-xs text-slate-400 mt-1">Uyum süreçlerinde üzerinize atanan bekleyen herhangi bir görev bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {myAssignedTasks.map(({ instance, task }) => (
                    <div
                      key={task.taskId}
                      className="flex flex-col justify-between p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-zinc-900 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Hedef: {instance.userName}
                          </span>
                          <span className="text-[8px] font-mono text-slate-400">{instance.planName}</span>
                        </div>

                        <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs mt-3">{task.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">{task.description}</p>
                        
                        <div className="mt-3 flex gap-2 items-center text-[9px] text-slate-400">
                          <span className={clsx("px-1.5 py-0.2 rounded text-[8px] font-bold uppercase", getCategoryColor(task.category))}>
                            {task.category === "Document" ? "Evrak" : task.category === "System" ? "Sistem" : task.category === "Meeting" ? "Toplantı" : "Eğitim"}
                          </span>
                          <span>Uyumun <strong>{task.dueDay}. günü</strong> son tarih</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-end">
                        <button
                          onClick={() => handleCompleteTask(task.taskId, instance.userId)}
                          className="flex items-center gap-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-[10px] font-bold transition shadow-sm"
                        >
                          Tamamlandı Olarak İşaretle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* D. TEMPLATES LISTING (For Admin/HR/Manager) */}
          {/* ==================================================== */}
          {isManagerOrHR && activeSubTab === "templates" && (
            <div className="space-y-4">
              {plans.length === 0 ? (
                <p className="text-xs text-slate-400 py-10 text-center">Henüz oluşturulmuş plan şablonu bulunmuyor.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-zinc-900 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-950 dark:text-white text-xs">{plan.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{plan.departmentName || "Tüm Departmanlar"} | {plan.positionTitle || "Tüm Pozisyonlar"}</p>
                          </div>
                          <span className="text-[9px] bg-slate-50 dark:bg-zinc-950 px-2 py-0.5 rounded border dark:border-slate-850 font-semibold text-slate-500">
                            {plan.durationDays} Gün Sürecek
                          </span>
                        </div>

                        {/* Visual Task count */}
                        <div className="mt-4 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Görevler ({plan.tasks.length})</span>
                          <div className="max-h-36 overflow-y-auto space-y-1.5 border-l border-slate-200 dark:border-slate-800 pl-3">
                            {plan.tasks.map((task, idx) => (
                              <div key={task.id || idx} className="text-[10px] text-slate-600 dark:text-slate-450">
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{idx+1}.</span> {task.title}
                                <span className="text-[8px] text-slate-400 ml-1">({getRoleLabel(task.assignedToRole)})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-slate-100 dark:border-slate-850 pt-3 flex justify-end">
                        <button
                          onClick={() => {
                            setStartForm({
                              userId: users[0]?.id || "",
                              planId: plan.id
                            });
                            setShowStartModal(true);
                          }}
                          className="flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 px-3 py-1.5 text-[10px] font-bold transition"
                        >
                          <Play size={11} /> Bu Planı Uygula
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ==================================================== */}
      {/* 3. MODALS IMPLEMENTATIONS                            */}
      {/* ==================================================== */}

      {/* TEMPLATE PLAN BUILDER MODAL */}
      {showCreatePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-zinc-900 text-left my-8">
            <h3 className="text-sm font-bold text-slate-850 dark:text-zinc-100 border-b pb-2 mb-4">Yeni İşe Alım Uyum Programı Şablonu Oluştur</h3>
            
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Şablon Adı *</label>
                  <input
                    type="text"
                    placeholder="örn. IT Destek Oryantasyon Programı"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Departman</label>
                  <select
                    value={planForm.departmentId}
                    onChange={(e) => setPlanForm({ ...planForm, departmentId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="">Tüm Departmanlar</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Süre (Gün)</label>
                  <input
                    type="number"
                    value={planForm.durationDays}
                    onChange={(e) => setPlanForm({ ...planForm, durationDays: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                    min={1}
                  />
                </div>
              </div>

              {/* Dynamic Task list builder */}
              <div className="border-t dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Plan Görevleri</span>
                  <button
                    type="button"
                    onClick={handleAddTaskInForm}
                    className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20 px-2 py-1 rounded"
                  >
                    <Plus size={12} /> Görev Ekle
                  </button>
                </div>

                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                  {planTasks.map((task, idx) => (
                    <div key={idx} className="p-3 bg-slate-50/50 border border-slate-200/60 rounded-xl dark:bg-zinc-950/20 dark:border-slate-850 space-y-2.5 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveTaskInForm(idx)}
                        className="absolute right-2 top-2 p-1 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 size={13} />
                      </button>

                      <span className="text-[9px] font-bold text-slate-400">Görev #{idx+1}</span>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Görev Başlığı * (örn. E-posta şifre teslimi)"
                            value={task.title}
                            onChange={(e) => handleTaskFieldChange(idx, "title", e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] bg-white dark:bg-zinc-900 dark:border-slate-800 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Açıklama * (örn. BT departmanından teslim alınacak)"
                            value={task.description}
                            onChange={(e) => handleTaskFieldChange(idx, "description", e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] bg-white dark:bg-zinc-900 dark:border-slate-800 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div>
                          <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Kategori</label>
                          <select
                            value={task.category}
                            onChange={(e) => handleTaskFieldChange(idx, "category", e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[10px] bg-white dark:bg-zinc-900 dark:border-slate-800 dark:text-white"
                          >
                            <option value="Document">Belge / Evrak</option>
                            <option value="System">BT Altyapı / Erişim</option>
                            <option value="Meeting">Görüşme / Toplantı</option>
                            <option value="Training">Eğitim</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Sorumlu Rol</label>
                          <select
                            value={task.assignedToRole}
                            onChange={(e) => handleTaskFieldChange(idx, "assignedToRole", e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[10px] bg-white dark:bg-zinc-900 dark:border-slate-800 dark:text-white"
                          >
                            <option value="Employee">Çalışan</option>
                            <option value="IT">BT / IT</option>
                            <option value="HR">İnsan Kaynakları</option>
                            <option value="Manager">Yönetici</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Hedef Gün</label>
                          <input
                            type="number"
                            value={task.dueDay}
                            onChange={(e) => handleTaskFieldChange(idx, "dueDay", Number(e.target.value))}
                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[10px] bg-white dark:bg-zinc-900 dark:border-slate-800 dark:text-white"
                            min={1}
                          />
                        </div>
                        <div className="flex items-center justify-center pt-3">
                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-500">
                            <input
                              type="checkbox"
                              checked={task.isMandatory}
                              onChange={(e) => handleTaskFieldChange(idx, "isMandatory", e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 text-xs"
                            />
                            Zorunlu mu?
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreatePlanModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* START ONBOARDING MODAL */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-zinc-900 text-left">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 border-b pb-2 mb-4">Yeni İşe Alım Uyum Süreci Başlat</h3>
            
            <form onSubmit={handleStartOnboarding} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Çalışan Seçin *</label>
                <select
                  value={startForm.userId}
                  onChange={(e) => setStartForm({ ...startForm, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  required
                >
                  <option value="" disabled>Seçiniz...</option>
                  {users.map(u => {
                    const alreadyHas = activeInstances.find(ai => ai.userId === u.id);
                    return (
                      <option key={u.id} value={u.id} disabled={!!alreadyHas}>
                        {u.fullName} ({u.departmentName || "Bilinmiyor"}) {alreadyHas ? "- Süreci Var" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Plan Şablonu Seçin *</label>
                <select
                  value={startForm.planId}
                  onChange={(e) => setStartForm({ ...startForm, planId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
                  required
                >
                  <option value="" disabled>Seçiniz...</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.tasks.length} Görev, {p.durationDays} Gün)</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm"
                >
                  Süreci Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function handleOpenCreatePlan() {
    setPlanForm({
      name: "",
      departmentId: "",
      positionId: "",
      durationDays: 14
    });
    setPlanTasks([
      { title: "İş Sözleşmesi İmzalanması", description: "Özlük dosyası belgelerinin tamamlanıp İK'ya sunulması.", category: "Document", dueDay: 1, assignedToRole: "Employee", isMandatory: true },
      { title: "Bilgisayar Kurulumu", description: "Gerekli ortam kurulumlarının BT ekibiyle yapılması.", category: "System", dueDay: 2, assignedToRole: "IT", isMandatory: true }
    ]);
    setShowCreatePlanModal(true);
  }
}
