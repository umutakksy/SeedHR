import axios, { AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptors for authorization
if (typeof window !== "undefined") {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token || !token.startsWith("mock_token_")) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("currentUser");
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );
}

// ----------------------------------------------------
// DTOs & INTERFACES (Matching C# Backend Entities)
// ----------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
  timestamp: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  identityNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  departmentId?: string;
  departmentName?: string;
  positionId?: string;
  positionTitle?: string;
  managerId?: string;
  managerName?: string;
  hireDate?: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  location?: string;
}

export interface DepartmentDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  managerName?: string;
  isActive: boolean;
}

export interface PositionDto {
  id: string;
  title: string;
  code: string;
  description?: string;
  departmentId: string;
  departmentName?: string;
  isActive: boolean;
}

export interface LeaveTypeDto {
  id: string;
  name: string;
  code: string;
  defaultDays: number;
  isActive: boolean;
}

export interface LeaveRequestDto {
  id: string;
  userId: string;
  userName: string;
  departmentName?: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  rejectionReason?: string;
  createdAt?: string;
}

export interface LeaveBalanceDto {
  id: string;
  userId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export interface AttendanceDto {
  id: string;
  userId: string;
  userName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "Present" | "Absent" | "Late" | "HalfDay" | "Off";
  totalHoursWorked?: number;
  notes?: string;
}

export interface PerformanceGoalDto {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: string;
  weight: number; // percentage
  status: "NotStarted" | "InProgress" | "Completed" | "Cancelled";
  progressPercentage: number;
}

export interface PerformanceEvaluationDto {
  id: string;
  employeeId: string;
  employeeName: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluationDate: string;
  period: string; // e.g. "2026-Q1"
  score: number; // 1-5
  feedback: string;
  status: "Draft" | "Submitted" | "SignedOff";
}

export interface CourseDto {
  id: string;
  title: string;
  description: string;
  type: string; // Online, Classroom
  durationHours: number;
  provider: string;
  documentUrl?: string;
  isActive: boolean;
}

export interface CourseAssignmentDto {
  id: string;
  courseId: string;
  course?: CourseDto;
  userId: string;
  userFullName?: string;
  assignedBy: string;
  assignedByFullName?: string;
  assignedDate: string;
  completedDate?: string;
  status: "Assigned" | "Completed";
  certificateUrl?: string;
  certificateExpiryDate?: string;
}

export interface CompetencyItemDto {
  id: string;
  category: string;
  question: string;
  weight: number;
}

export interface CompetencyFormDto {
  id: string;
  departmentId?: string;
  departmentName?: string;
  title: string;
  description: string;
  competencies: CompetencyItemDto[];
}

export interface Evaluation360Dto {
  id: string;
  employeeId: string;
  employeeName: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorType: "Self" | "Manager" | "Peer" | "Subordinate";
  competencyFormId: string;
  competencyFormTitle: string;
  scores: Record<string, number>; // QuestionId -> Score
  feedback?: string;
  status: "Draft" | "Submitted" | "SignedOff";
  period: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReferenceCheckDto {
  id: string;
  candidateId: string;
  candidateName: string;
  referenceName: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  relationship: string;
  status: "Pending" | "Sent" | "Completed";
  verificationNotes?: string;
  scores: Record<string, number>;
  comments?: string;
  createdAt: string;
}

// ---- Phase 6: Finance & Saha DTOs ----

export interface PayrollDto {
  id: string;
  userId: string;
  userName: string;
  departmentName: string;
  period: string; // e.g. "2026-06"
  baseSalary: number;
  overtime: number;
  bonus: number;
  deductions: number;
  tax: number;
  netSalary: number;
  status: "Draft" | "Calculated" | "Approved" | "Paid";
  paymentDate?: string;
  createdAt: string;
}

export interface ExpenseRequestDto {
  id: string;
  userId: string;
  userName: string;
  departmentName: string;
  category: "Travel" | "Food" | "Accommodation" | "Equipment" | "Training" | "Other";
  description: string;
  amount: number;
  currency: string;
  receiptUrl?: string;
  status: "Pending" | "Approved" | "Rejected" | "Paid";
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface EmployeeShiftDto {
  id: string;
  userId: string;
  userName: string;
  departmentName: string;
  date: string;
  shiftType: "Morning" | "Afternoon" | "Night" | "Full" | "Off";
  startTime: string;
  endTime: string;
  breakMinutes: number;
  overtimeMinutes: number;
  status: "Planned" | "Active" | "Completed" | "Absent";
  notes?: string;
}

export interface VisitorLogDto {
  id: string;
  visitorName: string;
  visitorCompany: string;
  visitorPhone: string;
  hostUserId: string;
  hostUserName: string;
  purpose: string;
  checkInTime: string;
  checkOutTime?: string;
  badgeNumber?: string;
  vehiclePlate?: string;
  status: "CheckedIn" | "CheckedOut" | "Expected";
  notes?: string;
}

// ---- Phase 5: AI DTOs ----

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AiInterviewQuestion {
  question: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface JobPostingDto {
  id: string;
  title: string;
  description: string;
  requirements: string;
  departmentId: string;
  departmentName: string;
  location: string;
  employmentType: "FullTime" | "PartTime" | "Contract" | "Remote";
  salaryRange?: string;
  status: "Draft" | "Open" | "Closed" | "Archived";
  postedDate: string;
  closingDate?: string;
}

export interface CandidateDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  status: "Applied" | "Screening" | "Interviewing" | "Offered" | "Hired" | "Rejected";
  appliedDate: string;
  jobPostingId: string;
  jobPostingTitle: string;
  address?: string;
  city?: string;
  country?: string;
  coverLetter?: string;
  aiMatchScore?: number;
}

export interface InterviewDto {
  id: string;
  candidateId: string;
  candidateName: string;
  jobPostingTitle: string;
  interviewers: string[]; // UserIds or Names
  scheduledTime: string;
  durationMinutes: number;
  type: "Phone" | "Video" | "OnSite";
  status: "Scheduled" | "Completed" | "Cancelled" | "NoShow";
  feedback?: string;
  score?: number; // 1-5
  rating?: number;
  result?: string;
}

export interface AnnouncementDto {
  id: string;
  title: string;
  content: string;
  category: "General" | "CompanyNews" | "Event" | "PolicyChange";
  publishedDate: string;
  expiryDate?: string;
  authorId: string;
  authorName: string;
  status: "Draft" | "Published" | "Archived";
}

export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "Info" | "Success" | "Warning" | "Error" | "Leave" | "Performance";
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStatisticsDto {
  totalEmployees: number;
  newHiresThisMonth: number;
  activeLeaveRequests: number;
  averagePerformanceScore: number;
  openJobPostings: number;
  attendanceRateToday: number;
}

export interface LogFileDto {
  fileName: string;
  filePath: string;
  size: number;
  createdDate: string;
  lastModified: string;
}

export interface AssetDto {
  id: string;
  type: string;
  name: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  condition: string;
  status: string;
  currentAssigneeId?: string;
  currentAssigneeName?: string;
  assignmentDate?: string;
  notes?: string;
}

export interface AssetReportDto {
  departmentId: string;
  departmentName: string;
  totalAssetsAllocated: number;
  totalValue: number;
  allocatedAssets: AssetDto[];
}

export interface AssetInventoryDto {
  totalAssets: number;
  availableAssets: number;
  assignedAssets: number;
  brokenAssets: number;
  returnedAssets: number;
  totalInventoryValue: number;
  countByType: Record<string, number>;
}

export interface OnboardingTaskDto {
  id: string;
  onboardingPlanId: string;
  title: string;
  description: string;
  category: string;
  dueDay: number;
  assignedToRole: string;
  isMandatory: boolean;
  order: number;
}

export interface OnboardingPlanDto {
  id: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
  positionId?: string;
  positionTitle?: string;
  durationDays: number;
  status: string;
  tasks: OnboardingTaskDto[];
}

export interface OnboardingTaskStatusDto {
  taskId: string;
  title: string;
  description: string;
  category: string;
  dueDay: number;
  assignedToRole: string;
  isMandatory: boolean;
  completionStatus: string;
  completionDate?: string;
  evidenceUrl?: string;
}

export interface OnboardingProgressDto {
  instanceId: string;
  userId: string;
  userName: string;
  planId: string;
  planName: string;
  startDate: string;
  completionDate?: string;
  status: string;
  progressPercentage: number;
  tasks: OnboardingTaskStatusDto[];
}

// ----------------------------------------------------
// LOCAL STORAGE MOCK ENGINE (Dual Mode Support)
// ----------------------------------------------------

const INITIAL_DEPARTMENTS: DepartmentDto[] = [
  { id: "dept_yon", name: "Yönetim", code: "YON", description: "Üst düzey yönetim ve strateji", managerId: "user_selim", managerName: "Selim Aksoy", isActive: true },
  { id: "dept_ik", name: "İnsan Kaynakları", code: "IK", description: "İşe alım, bordro ve eğitim", managerId: "user_elif", managerName: "Elif Kaya", isActive: true },
  { id: "dept_fin", name: "Finans & Muhasebe", code: "FIN", description: "Bütçe, finansal analiz ve muhasebe", managerId: "user_murat", managerName: "Murat Aslan", isActive: true },
  { id: "dept_it", name: "Bilgi Teknolojileri", code: "IT", description: "Altyapı, yazılım geliştirme ve siber güvenlik", managerId: "user_zafer", managerName: "Zafer Yıldız", isActive: true },
  { id: "dept_sat", name: "Satış", code: "SAT", description: "Bireysel ve kurumsal satış operasyonları", managerId: "user_kemal", managerName: "Kemal Yurt", isActive: true },
  { id: "dept_paz", name: "Pazarlama", code: "PAZ", description: "Dijital pazarlama, PR ve marka yönetimi", managerId: "user_merve_guler", managerName: "Merve Güler", isActive: true },
  { id: "dept_op", name: "Operasyon", code: "OP", description: "Lojistik, depo ve teslimat yönetimi", managerId: "user_hakan", managerName: "Hakan Kurt", isActive: true },
  { id: "dept_idari", name: "İdari İşler & Satın Alma", code: "IDA", description: "Tedarik, satın alma ve ofis yönetimi", managerId: "user_burak", managerName: "Burak Yalçın", isActive: true },
  { id: "dept_guv", name: "Güvenlik", code: "GUV", description: "Tesis içi güvenlik operasyonları", managerId: "user_mustafa", managerName: "Mustafa Aydın", isActive: true },
  { id: "dept_temizlik", name: "Temizlik & Destek", code: "TEM", description: "Destek hizmetleri ve temizlik", managerId: "user_selim", managerName: "Selim Aksoy", isActive: true }
];

const INITIAL_POSITIONS: PositionDto[] = [
  { id: "pos_gm", title: "Genel Müdür", code: "GM", departmentId: "dept_yon", departmentName: "Yönetim", isActive: true },
  { id: "pos_gmy", title: "Genel Müdür Yardımcısı", code: "GMY", departmentId: "dept_yon", departmentName: "Yönetim", isActive: true },
  { id: "pos_ik_mudur", title: "İK Müdürü", code: "IKM", departmentId: "dept_ik", departmentName: "İnsan Kaynakları", isActive: true },
  { id: "pos_ik_tl", title: "İK Takım Lideri", code: "IKTL", departmentId: "dept_ik", departmentName: "İnsan Kaynakları", isActive: true },
  { id: "pos_ik_uzman", title: "İK Uzmanı", code: "IKU", departmentId: "dept_ik", departmentName: "İnsan Kaynakları", isActive: true },
  { id: "pos_bordro", title: "Bordro Uzmanı", code: "BU", departmentId: "dept_ik", departmentName: "İnsan Kaynakları", isActive: true },
  { id: "pos_isealim", title: "İşe Alım Uzmanı", code: "IAU", departmentId: "dept_ik", departmentName: "İnsan Kaynakları", isActive: true },
  { id: "pos_fin_mudur", title: "Finans Müdürü", code: "FM", departmentId: "dept_fin", departmentName: "Finans & Muhasebe", isActive: true },
  { id: "pos_muhasebe_sefi", title: "Muhasebe Şefi", code: "MS", departmentId: "dept_fin", departmentName: "Finans & Muhasebe", isActive: true },
  { id: "pos_muhasebe", title: "Muhasebe Uzmanı", code: "MU", departmentId: "dept_fin", departmentName: "Finans & Muhasebe", isActive: true },
  { id: "pos_fin_uzman", title: "Finans Uzmanı", code: "FU", departmentId: "dept_fin", departmentName: "Finans & Muhasebe", isActive: true },
  { id: "pos_mali_isler", title: "Mali İşler Uzmanı", code: "MIU", departmentId: "dept_fin", departmentName: "Finans & Muhasebe", isActive: true },
  { id: "pos_bt_mudur", title: "BT Müdürü", code: "BTM", departmentId: "dept_it", departmentName: "Bilgi Teknolojileri", isActive: true },
  { id: "pos_dev_tl", title: "Yazılım Takım Lideri", code: "DEVTL", departmentId: "dept_it", departmentName: "Bilgi Teknolojileri", isActive: true },
  { id: "pos_dev", title: "Yazılım Geliştirici", code: "DEV", departmentId: "dept_it", departmentName: "Bilgi Teknolojileri", isActive: true },
  { id: "pos_analist", title: "İş Analisti", code: "ANA", departmentId: "dept_it", departmentName: "Bilgi Teknolojileri", isActive: true },
  { id: "pos_qa", title: "QA/Test Uzmanı", code: "QA", departmentId: "dept_it", departmentName: "Bilgi Teknolojileri", isActive: true },
  { id: "pos_sistem", title: "Sistem Uzmanı", code: "SIS", departmentId: "dept_it", departmentName: "Bilgi Teknolojileri", isActive: true },
  { id: "pos_devops", title: "DevOps Uzmanı", code: "DEVOPS", departmentId: "dept_it", departmentName: "Bilgi Teknolojileri", isActive: true },
  { id: "pos_db", title: "Veritabanı Uzmanı", code: "DBA", departmentId: "dept_it", departmentName: "Bilgi Teknolojileri", isActive: true },
  { id: "pos_sat_mudur", title: "Satış Müdürü", code: "SM", departmentId: "dept_sat", departmentName: "Satış", isActive: true },
  { id: "pos_sat_lider", title: "Bölge Satış Lideri", code: "BSL", departmentId: "dept_sat", departmentName: "Satış", isActive: true },
  { id: "pos_sat_uzman", title: "Satış Uzmanı", code: "SU", departmentId: "dept_sat", departmentName: "Satış", isActive: true },
  { id: "pos_musteri_temsilcisi", title: "Müşteri Temsilcisi", code: "MT", departmentId: "dept_sat", departmentName: "Satış", isActive: true },
  { id: "pos_paz_mudur", title: "Pazarlama Müdürü", code: "PM", departmentId: "dept_paz", departmentName: "Pazarlama", isActive: true },
  { id: "pos_dijital_paz", title: "Dijital Pazarlama Uzmanı", code: "DPU", departmentId: "dept_paz", departmentName: "Pazarlama", isActive: true },
  { id: "pos_marka", title: "Marka Uzmanı", code: "MAR", departmentId: "dept_paz", departmentName: "Pazarlama", isActive: true },
  { id: "pos_grafik", title: "Grafik Tasarımcı", code: "GRA", departmentId: "dept_paz", departmentName: "Pazarlama", isActive: true },
  { id: "pos_op_mudur", title: "Operasyon Müdürü", code: "OPM", departmentId: "dept_op", departmentName: "Operasyon", isActive: true },
  { id: "pos_op_sefi", title: "Operasyon Şefi", code: "OPS", departmentId: "dept_op", departmentName: "Operasyon", isActive: true },
  { id: "pos_op_uzman", title: "Operasyon Uzmanı", code: "OPU", departmentId: "dept_op", departmentName: "Operasyon", isActive: true },
  { id: "pos_op_personel", title: "Operasyon Personeli", code: "OPP", departmentId: "dept_op", departmentName: "Operasyon", isActive: true },
  { id: "pos_idari_mudur", title: "İdari İşler Müdürü", code: "IDAM", departmentId: "dept_idari", departmentName: "İdari İşler & Satın Alma", isActive: true },
  { id: "pos_satin_alma", title: "Satın Alma Uzmanı", code: "SAU", departmentId: "dept_idari", departmentName: "İdari İşler & Satın Alma", isActive: true },
  { id: "pos_destek_personel", title: "Destek Personeli", code: "DEP", departmentId: "dept_idari", departmentName: "İdari İşler & Satın Alma", isActive: true },
  { id: "pos_guv_amiri", title: "Güvenlik Amiri", code: "GA", departmentId: "dept_guv", departmentName: "Güvenlik", isActive: true },
  { id: "pos_guv_gorevlisi", title: "Güvenlik Görevlisi", code: "GG", departmentId: "dept_guv", departmentName: "Güvenlik", isActive: true },
  { id: "pos_temizlik", title: "Temizlik Personeli", code: "TP", departmentId: "dept_temizlik", departmentName: "Temizlik & Destek", isActive: true },
  { id: "pos_ofis_destek", title: "Ofis Destek Personeli", code: "ODP", departmentId: "dept_temizlik", departmentName: "Temizlik & Destek", isActive: true }
];

const generateMockUsers = (): UserDto[] => {
  const users: UserDto[] = [];
  const usedEmails = new Set<string>();
  let userCounter = 1;

  const maleNames = ["Selim", "Ahmet", "Can", "Burak", "Kemal", "Hakan", "Murat", "Zafer", "Ömer", "Tarık", "Mustafa", "Ali", "Mehmet", "Serkan", "Gökhan", "Cem", "Deniz", "Volkan", "Onur", "Umut", "Emre", "Fatih", "Süleyman", "Erhan", "Okan", "Levent", "Bülent", "Yasin", "Kadir", "Turan", "Alper", "Yiğit", "Kaan", "Oğuz", "Mert", "Ege", "Kerem", "Doruk", "Tolga", "Barış", "Sinan", "Bora", "Cihan", "Engin", "Metin", "Nihat", "Sedat", "Vedat", "Yusuf", "Halil"];
  const femaleNames = ["Elif", "Merve", "Canan", "Ayşe", "Zeynep", "Aylin", "Sibel", "Aslı", "Ebru", "Demet", "Pınar", "Seda", "Gizem", "Büşra", "Tuğba", "Gamze", "Ceren", "Dilan", "Yağmur", "Damla", "Melis", "İrem", "Didem", "Ezgi", "Özge", "Derya", "Şevval", "Gözde", "Dilek", "Arzu", "Nihan", "Bahar", "Funda", "Hale", "Lale", "Jale", "Mine", "Selin", "Pelin", "Helin", "Derin", "Defne", "Ada", "Duru", "Bade", "Naz", "Su"];
  const lastNames = ["Aksoy", "Yılmaz", "Demir", "Çelik", "Kaya", "Şahin", "Aslan", "Yıldız", "Yurt", "Güler", "Kurt", "Yalçın", "Tekin", "Uçar", "Aydın", "Öztürk", "Özdemir", "Arslan", "Doğan", "Kılıç", "Erdoğan", "Şen", "Güneş", "Özcan", "Bulut", "Köse", "Yıldırım", "Avcı", "Sarı", "Çetin", "Koç", "Polat", "Karaca", "Uzun", "Şeker", "Gül", "Ateş", "Yavuz", "Şimşek"];

  const roleMap: Record<string, string> = {
    role_admin: "Admin",
    role_manager: "Manager",
    role_hr: "HR",
    role_employee: "Employee"
  };

  const deptMap = INITIAL_DEPARTMENTS.reduce((acc, d) => ({ ...acc, [d.id]: d.name }), {} as Record<string, string>);
  const posMap = INITIAL_POSITIONS.reduce((acc, p) => ({ ...acc, [p.id]: p.title }), {} as Record<string, string>);

  function createUserRecord(
    email: string,
    first: string,
    last: string,
    deptId: string,
    posId: string,
    roleId: string,
    managerId: string | null,
    hireDate: string,
    gender: string,
    customId?: string
  ): UserDto {
    const id = customId || `user_${userCounter++}`;
    const baseEmail = email.toLowerCase()
      .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c");
    
    let cleanedEmail = baseEmail;
    let dupCount = 1;
    while (usedEmails.has(cleanedEmail)) {
      const parts = baseEmail.split("@");
      cleanedEmail = `${parts[0]}${dupCount++}@${parts[1]}`;
    }
    usedEmails.add(cleanedEmail);

    return {
      id,
      email: cleanedEmail,
      firstName: first,
      lastName: last,
      fullName: `${first} ${last}`,
      phone: `+90 532 ${100 + userCounter} 34${String(userCounter % 100).padStart(2, "0")}`,
      dateOfBirth: `${1975 + (userCounter % 25)}-${String(1 + (userCounter % 12)).padStart(2, "0")}-${String(1 + (userCounter % 28)).padStart(2, "0")}`,
      gender,
      identityNumber: String(10000000000 + userCounter * 73937),
      address: "İstanbul, Türkiye",
      city: "İstanbul",
      country: "Türkiye",
      departmentId: deptId,
      departmentName: deptMap[deptId] || "",
      positionId: posId,
      positionTitle: posMap[posId] || "",
      managerId: managerId || undefined,
      managerName: "", 
      roleId,
      roleName: roleMap[roleId] || "",
      isActive: true,
      hireDate,
      emergencyContactName: `${last} Yakını`,
      emergencyContactPhone: `+90 544 ${200 + userCounter} 56${String(userCounter % 100).padStart(2, "0")}`
    };
  }

  // 1. Genel Müdür
  const gm = createUserRecord("selim.aksoy@seedhr.com.tr", "Selim", "Aksoy", "dept_yon", "pos_gm", "role_admin", null, "2015-05-10", "Male", "user_selim");
  users.push(gm);

  // 2. Genel Müdür Yardımcıları
  const gmyTech = createUserRecord("ahmet.yilmaz@seedhr.com.tr", "Ahmet", "Yılmaz", "dept_yon", "pos_gmy", "role_manager", gm.id, "2017-03-01", "Male", "user_ahmet");
  const gmyOp = createUserRecord("elif.kaya@seedhr.com.tr", "Elif", "Kaya", "dept_yon", "pos_gmy", "role_manager", gm.id, "2018-01-15", "Female", "user_elif");
  const gmyFin = createUserRecord("canan.demir@seedhr.com.tr", "Canan", "Demir", "dept_yon", "pos_gmy", "role_manager", gm.id, "2016-11-20", "Female");
  const gmySales = createUserRecord("omer.celik@seedhr.com.tr", "Ömer", "Çelik", "dept_yon", "pos_gmy", "role_manager", gm.id, "2019-06-01", "Male");
  users.push(gmyTech, gmyOp, gmyFin, gmySales);

  // Managers
  const mgrIk = createUserRecord("aylin.sahin@seedhr.com.tr", "Aylin", "Şahin", "dept_ik", "pos_ik_mudur", "role_hr", gmyOp.id, "2020-02-01", "Female");
  const mgrFin = createUserRecord("murat.aslan@seedhr.com.tr", "Murat", "Aslan", "dept_fin", "pos_fin_mudur", "role_manager", gmyFin.id, "2018-09-12", "Male");
  const mgrBt = createUserRecord("zafer.yildiz@seedhr.com.tr", "Zafer", "Yıldız", "dept_it", "pos_bt_mudur", "role_manager", gmyTech.id, "2019-10-01", "Male");
  const mgrSat = createUserRecord("kemal.yurt@seedhr.com.tr", "Kemal", "Yurt", "dept_sat", "pos_sat_mudur", "role_manager", gmySales.id, "2020-05-15", "Male");
  const mgrPaz = createUserRecord("merve.guler@seedhr.com.tr", "Merve", "Güler", "dept_paz", "pos_paz_mudur", "role_manager", gmySales.id, "2021-01-10", "Female");
  const mgrOp = createUserRecord("hakan.kurt@seedhr.com.tr", "Hakan", "Kurt", "dept_op", "pos_op_mudur", "role_manager", gmyOp.id, "2019-04-25", "Male");
  const mgrIdari = createUserRecord("burak.yalcin@seedhr.com.tr", "Burak", "Yalçın", "dept_idari", "pos_idari_mudur", "role_manager", gmyOp.id, "2021-06-20", "Male");
  const mgrMuhasebe = createUserRecord("sibel.tekin@seedhr.com.tr", "Sibel", "Tekin", "dept_fin", "pos_muhasebe_sefi", "role_manager", mgrFin.id, "2019-02-14", "Female");
  const mgrYazilim = createUserRecord("tarik.ucar@seedhr.com.tr", "Tarık", "Uçar", "dept_it", "pos_dev_tl", "role_manager", mgrBt.id, "2020-08-01", "Male");
  const mgrGuv = createUserRecord("mustafa.aydin@seedhr.com.tr", "Mustafa", "Aydın", "dept_guv", "pos_guv_amiri", "role_manager", gmyOp.id, "2021-03-01", "Male");
  users.push(mgrIk, mgrFin, mgrBt, mgrSat, mgrPaz, mgrOp, mgrIdari, mgrMuhasebe, mgrYazilim, mgrGuv);

  // Leaders
  const tlIk = createUserRecord("zeynep.ozturk@seedhr.com.tr", "Zeynep", "Öztürk", "dept_ik", "pos_ik_tl", "role_hr", mgrIk.id, "2021-08-15", "Female");
  const tlQa = createUserRecord("burak.sahin@seedhr.com.tr", "Burak", "Şahin", "dept_it", "pos_dev_tl", "role_manager", mgrBt.id, "2021-10-01", "Male");
  const tlSis = createUserRecord("kemal.aslan@seedhr.com.tr", "Kemal", "Aslan", "dept_it", "pos_dev_tl", "role_manager", mgrBt.id, "2020-12-10", "Male");
  const tlSat1 = createUserRecord("ali.demir@seedhr.com.tr", "Ali", "Demir", "dept_sat", "pos_sat_lider", "role_manager", mgrSat.id, "2021-04-01", "Male");
  const tlSat2 = createUserRecord("canan.kaya@seedhr.com.tr", "Canan", "Kaya", "dept_sat", "pos_sat_lider", "role_manager", mgrSat.id, "2021-05-12", "Female");
  const tlPaz = createUserRecord("merve.celik@seedhr.com.tr", "Merve", "Çelik", "dept_paz", "pos_dijital_paz", "role_manager", mgrPaz.id, "2022-02-20", "Female", "user_merve");
  const tlOp1 = createUserRecord("hakan.yildiz@seedhr.com.tr", "Hakan", "Yıldız", "dept_op", "pos_op_sefi", "role_manager", mgrOp.id, "2020-06-01", "Male");
  const tlOp2 = createUserRecord("serkan.kurt@seedhr.com.tr", "Serkan", "Kurt", "dept_op", "pos_op_sefi", "role_manager", mgrOp.id, "2021-02-15", "Male");
  const tlOp3 = createUserRecord("gokhan.yalcin@seedhr.com.tr", "Gökhan", "Yalçın", "dept_op", "pos_op_sefi", "role_manager", mgrOp.id, "2021-09-20", "Male");
  const tlIdari = createUserRecord("ebru.aydin@seedhr.com.tr", "Ebru", "Aydın", "dept_idari", "pos_satin_alma", "role_manager", mgrIdari.id, "2022-04-10", "Female");
  users.push(tlIk, tlQa, tlSis, tlSat1, tlSat2, tlPaz, tlOp1, tlOp2, tlOp3, tlIdari);

  const extraNames = ["Cem", "Deniz", "Volkan", "Onur", "Umut", "Emre", "Gizem"];
  const extraLasts = ["Güneş", "Özcan", "Bulut", "Köse", "Avcı", "Sarı", "Çetin"];
  const extraDepts = ["dept_it", "dept_sat", "dept_op", "dept_op", "dept_idari", "dept_temizlik", "dept_ik"];
  const extraPositions = ["pos_dev_tl", "pos_sat_lider", "pos_op_sefi", "pos_op_sefi", "pos_satin_alma", "pos_ofis_destek", "pos_ik_tl"];
  for (let i = 0; i < 7; i++) {
    const leader = createUserRecord(
      `${extraNames[i]}.${extraLasts[i]}@seedhr.com.tr`,
      extraNames[i],
      extraLasts[i],
      extraDepts[i],
      extraPositions[i],
      "role_manager",
      gm.id,
      `202${1 + (i % 2)}-0${1 + i}-10`,
      i === 6 ? "Female" : "Male"
    );
    users.push(leader);
  }

  function addStaff(count: number, deptId: string, posId: string, roleId: string, managerId: string, isFemaleChance = false) {
    for (let i = 0; i < count; i++) {
      const isFemale = isFemaleChance || (userCounter % 2 === 0);
      const first = isFemale ? femaleNames[userCounter % femaleNames.length] : maleNames[userCounter % maleNames.length];
      const last = lastNames[userCounter % lastNames.length];
      const email = `${first}.${last}@seedhr.com.tr`;
      
      const staff = createUserRecord(
        email,
        first,
        last,
        deptId,
        posId,
        roleId,
        managerId,
        `202${2 + (userCounter % 3)}-${String(1 + (userCounter % 12)).padStart(2, "0")}-${String(1 + (userCounter % 28)).padStart(2, "0")}`,
        isFemale ? "Female" : "Male"
      );
      users.push(staff);
    }
  }

  // İK Uzmanları
  addStaff(2, "dept_ik", "pos_ik_uzman", "role_hr", mgrIk.id, true);
  addStaff(1, "dept_ik", "pos_bordro", "role_hr", mgrIk.id);

  // Finans / Muhasebe
  addStaff(3, "dept_fin", "pos_muhasebe", "role_employee", mgrMuhasebe.id);
  addStaff(2, "dept_fin", "pos_fin_uzman", "role_employee", mgrFin.id);
  addStaff(1, "dept_fin", "pos_mali_isler", "role_employee", mgrFin.id);

  // BT
  const devCan = createUserRecord("can.demir@seedhr.com.tr", "Can", "Demir", "dept_it", "pos_dev", "role_employee", mgrYazilim.id, "2023-09-01", "Male", "user_can");
  users.push(devCan);
  addStaff(5, "dept_it", "pos_dev", "role_employee", mgrYazilim.id);
  addStaff(2, "dept_it", "pos_analist", "role_employee", mgrBt.id, true);
  addStaff(2, "dept_it", "pos_qa", "role_employee", tlQa.id, true);
  addStaff(1, "dept_it", "pos_sistem", "role_employee", tlSis.id);
  addStaff(1, "dept_it", "pos_devops", "role_employee", tlSis.id);
  addStaff(1, "dept_it", "pos_db", "role_employee", tlSis.id);

  // Satış
  addStaff(9, "dept_sat", "pos_sat_uzman", "role_employee", tlSat1.id);
  addStaff(2, "dept_sat", "pos_musteri_temsilcisi", "role_employee", tlSat2.id, true);

  // Pazarlama
  addStaff(2, "dept_paz", "pos_dijital_paz", "role_employee", tlPaz.id, true);
  addStaff(2, "dept_paz", "pos_marka", "role_employee", mgrPaz.id, true);
  addStaff(1, "dept_paz", "pos_grafik", "role_employee", mgrPaz.id);

  // Operasyon
  addStaff(4, "dept_op", "pos_op_uzman", "role_employee", tlOp1.id);
  addStaff(10, "dept_op", "pos_op_personel", "role_employee", tlOp2.id);

  // İdari İşler
  addStaff(1, "dept_idari", "pos_satin_alma", "role_employee", tlIdari.id);
  addStaff(5, "dept_idari", "pos_destek_personel", "role_employee", mgrIdari.id);

  // Güvenlik
  addStaff(4, "dept_guv", "pos_guv_gorevlisi", "role_employee", mgrGuv.id);

  // Temizlik
  addStaff(6, "dept_temizlik", "pos_temizlik", "role_employee", gm.id);

  // Resolve manager names
  const userMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {} as Record<string, UserDto>);
  for (const u of users) {
    if (u.managerId && userMap[u.managerId]) {
      u.managerName = userMap[u.managerId].fullName;
    }
  }

  return users;
};

const INITIAL_USERS = generateMockUsers();;

const INITIAL_LEAVE_TYPES: LeaveTypeDto[] = [
  { id: "lt_annual", name: "Yıllık İzin", code: "ANNUAL", defaultDays: 14, isActive: true },
  { id: "lt_excuse", name: "Mazeret İzni", code: "EXCUSE", defaultDays: 5, isActive: true },
  { id: "lt_sick", name: "Hastalık İzni", code: "SICK", defaultDays: 10, isActive: true }
];

const INITIAL_LEAVE_BALANCES: LeaveBalanceDto[] = [
  { id: "bal_can_ann", userId: "user_can", leaveTypeId: "lt_annual", leaveTypeName: "Yıllık İzin", totalDays: 14, usedDays: 4, remainingDays: 10, year: 2026 },
  { id: "bal_can_exc", userId: "user_can", leaveTypeId: "lt_excuse", leaveTypeName: "Mazeret İzni", totalDays: 5, usedDays: 1, remainingDays: 4, year: 2026 },
  { id: "bal_mer_ann", userId: "user_merve", leaveTypeId: "lt_annual", leaveTypeName: "Yıllık İzin", totalDays: 14, usedDays: 0, remainingDays: 14, year: 2026 }
];

const INITIAL_LEAVE_REQUESTS: LeaveRequestDto[] = [
  {
    id: "leave_req_1",
    userId: "user_can",
    userName: "Can Demir",
    departmentName: "Yazılım Geliştirme",
    leaveTypeId: "lt_annual",
    leaveTypeName: "Yıllık İzin",
    startDate: "2026-06-15",
    endDate: "2026-06-19",
    daysRequested: 4,
    reason: "Yaz tatili seyahati",
    status: "Pending",
    createdAt: "2026-05-28T10:00:00Z"
  },
  {
    id: "leave_req_2",
    userId: "user_merve",
    userName: "Merve Çelik",
    departmentName: "Pazarlama ve Satış",
    leaveTypeId: "lt_excuse",
    leaveTypeName: "Mazeret İzni",
    startDate: "2026-05-10",
    endDate: "2026-05-11",
    daysRequested: 1,
    reason: "Resmi daire işlemleri",
    status: "Approved",
    approvedBy: "user_elif",
    approvedByName: "Elif Kaya",
    approvedDate: "2026-05-09T14:00:00Z",
    createdAt: "2026-05-08T09:00:00Z"
  }
];

const INITIAL_ATTENDANCE: AttendanceDto[] = [
  { id: "att_1", userId: "user_can", userName: "Can Demir", date: "2026-05-30", checkIn: "08:55", checkOut: "18:05", status: "Present", totalHoursWorked: 9.16 },
  { id: "att_2", userId: "user_ahmet", userName: "Ahmet Yılmaz", date: "2026-05-30", checkIn: "08:30", checkOut: "17:30", status: "Present", totalHoursWorked: 9 },
  { id: "att_3", userId: "user_merve", userName: "Merve Çelik", date: "2026-05-30", checkIn: "09:45", checkOut: "18:00", status: "Late", totalHoursWorked: 8.25, notes: "Trafik gecikmesi" },
  { id: "att_4", userId: "user_elif", userName: "Elif Kaya", date: "2026-05-30", checkIn: "08:45", checkOut: undefined, status: "Present" }
];

const INITIAL_GOALS: PerformanceGoalDto[] = [
  { id: "goal_1", userId: "user_can", title: "SeedHR Dashboard Geliştirme", description: "Next.js 16 ve Tailwind v4 kullanarak modern dashboard arayüzünü oluşturmak.", targetDate: "2026-06-30", weight: 40, status: "InProgress", progressPercentage: 60 },
  { id: "goal_2", userId: "user_can", title: "TypeScript Optimizasyonu", description: "Frontend kod tabanında any tiplerini temizleme ve katı tip güvenliği sağlama.", targetDate: "2026-07-31", weight: 30, status: "InProgress", progressPercentage: 20 },
  { id: "goal_3", userId: "user_can", title: "Performans & Lighthouse Testleri", description: "Dashboard sayfalarında Lighthouse skorunun minimum 90 olmasını sağlama.", targetDate: "2026-08-31", weight: 30, status: "NotStarted", progressPercentage: 0 }
];

const INITIAL_EVALUATIONS: PerformanceEvaluationDto[] = [
  { id: "eval_1", employeeId: "user_can", employeeName: "Can Demir", evaluatorId: "user_ahmet", evaluatorName: "Ahmet Yılmaz", evaluationDate: "2026-04-15", period: "2026-Q1", score: 4.5, feedback: "Can, frontend tarafındaki proaktif yaklaşımı ve temiz kod prensipleriyle projeye büyük katkı sağladı. İletişimi mükemmel.", status: "SignedOff" },
  { id: "eval_2", employeeId: "user_merve", employeeName: "Merve Çelik", evaluatorId: "user_selim", evaluatorName: "Selim Aksoy", evaluationDate: "2026-04-12", period: "2026-Q1", score: 4.0, feedback: "Merve, Q1 pazarlama kampanyalarını başarıyla yönetti. Satış hedeflerinin %110 oranında gerçekleşmesini sağladı.", status: "SignedOff" }
];

const INITIAL_JOB_POSTINGS: JobPostingDto[] = [
  { id: "job_1", title: "Senior React / Next.js Developer", description: "Kurumsal HR platformumuz için modern frontend altyapısını tasarlayacak ve geliştirecek deneyimli uzman arıyoruz.", requirements: "Minimum 5 yıl React/TypeScript tecrübesi, Next.js App Router deneyimi, Tailwind CSS ve test kütüphanelerine hakimiyet.", departmentId: "dept_dev", departmentName: "Yazılım Geliştirme", location: "Istanbul / Remote", employmentType: "FullTime", salaryRange: "80,000 - 110,000 TRY", status: "Open", postedDate: "2026-05-10" },
  { id: "job_2", title: "HR Business Partner", description: "Organizasyonel gelişim süreçlerini yürütecek ve çalışan deneyimini güçlendirecek takım arkadaşı arıyoruz.", requirements: "İlgili lisans derecesi, minimum 4 yıl kurumsal İK süreçleri (tercihen teknoloji şirketi) tecrübesi, güçlü iletişim.", departmentId: "dept_hr", departmentName: "İnsan Kaynakları", location: "Istanbul Office", employmentType: "FullTime", salaryRange: "60,000 - 75,000 TRY", status: "Open", postedDate: "2026-05-20" }
];

const INITIAL_CANDIDATES: CandidateDto[] = [
  { id: "cand_1", firstName: "Burak", lastName: "Şahin", fullName: "Burak Şahin", email: "burak@gmail.com", phone: "+90 533 123 4567", status: "Applied", appliedDate: "2026-05-25", jobPostingId: "job_1", jobPostingTitle: "Senior React / Next.js Developer", aiMatchScore: 84 },
  { id: "cand_2", firstName: "Zeynep", lastName: "Öztürk", fullName: "Zeynep Öztürk", email: "zeynep@hotmail.com", phone: "+90 542 321 7654", status: "Interviewing", appliedDate: "2026-05-18", jobPostingId: "job_1", jobPostingTitle: "Senior React / Next.js Developer", aiMatchScore: 92 },
  { id: "cand_3", firstName: "Kemal", lastName: "Aslan", fullName: "Kemal Aslan", email: "kemal@gmail.com", phone: "+90 551 987 6543", status: "Offered", appliedDate: "2026-05-15", jobPostingId: "job_2", jobPostingTitle: "HR Business Partner", aiMatchScore: 78 }
];

const INITIAL_INTERVIEWS: InterviewDto[] = [
  { id: "int_1", candidateId: "cand_2", candidateName: "Zeynep Öztürk", jobPostingTitle: "Senior React / Next.js Developer", interviewers: ["Ahmet Yılmaz", "Elif Kaya"], scheduledTime: "2026-06-02T14:00:00Z", durationMinutes: 60, type: "Video", status: "Scheduled" }
];

const INITIAL_ANNOUNCEMENTS: AnnouncementDto[] = [
  { id: "ann_1", title: "Q2 Performans Değerlendirme Süreci", content: "Değerli çalışanlarımız, Q2 hedefleri doğrultusunda performans değerlendirme modülümüz açılmıştır. Lütfen kendi hedeflerinizi güncelleyerek yöneticinizle paylaşınız.", category: "PolicyChange", publishedDate: "2026-05-25T08:00:00Z", authorId: "user_elif", authorName: "Elif Kaya", status: "Published" },
  { id: "ann_2", title: "Yaz Dönemi Çalışma Saatleri & Hibrit Çalışma Politikası", content: "1 Haziran - 31 Ağustos tarihleri arasında haftalık uzaktan çalışma gün sayımız 3 güne çıkarılmıştır. Detaylara özlük rehberinden ulaşabilirsiniz.", category: "CompanyNews", publishedDate: "2026-05-29T09:00:00Z", authorId: "user_selim", authorName: "Selim Aksoy", status: "Published" }
];

const INITIAL_NOTIFICATIONS: NotificationDto[] = [
  { id: "not_1", userId: "user_ahmet", title: "İzin Talebi Bekliyor", message: "Can Demir yıllık izin talebinde bulundu. Onayınız bekleniyor.", type: "Leave", isRead: false, createdAt: "2026-05-28T10:05:00Z" },
  { id: "not_2", userId: "user_can", title: "Hedef Güncellemesi", message: "Yeni performans hedefleriniz atandı.", type: "Performance", isRead: false, createdAt: "2026-05-28T09:00:00Z" }
];

class LocalDatabase {
  private get<T>(key: string, initial: T): T {
    if (typeof window === "undefined") return initial;
    const data = localStorage.getItem(`seedhr_db_${key}`);
    if (!data) {
      this.set(key, initial);
      return initial;
    }
    try {
      const parsed = JSON.parse(data);
      if (key === "users" && Array.isArray(parsed) && parsed.length !== 100) {
        this.set(key, initial);
        return initial;
      }
      if (key === "departments" && Array.isArray(parsed) && parsed.length !== 10) {
        this.set(key, initial);
        return initial;
      }
      return parsed;
    } catch {
      this.set(key, initial);
      return initial;
    }
  }

  private set<T>(key: string, value: T): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(`seedhr_db_${key}`, JSON.stringify(value));
    }
  }

  get users() { return this.get<UserDto[]>("users", INITIAL_USERS); }
  set users(val: UserDto[]) { this.set("users", val); }

  get departments() { return this.get<DepartmentDto[]>("departments", INITIAL_DEPARTMENTS); }
  set departments(val: DepartmentDto[]) { this.set("departments", val); }

  get positions() { return this.get<PositionDto[]>("positions", INITIAL_POSITIONS); }
  set positions(val: PositionDto[]) { this.set("positions", val); }

  get leaveTypes() { return this.get<LeaveTypeDto[]>("leave_types", INITIAL_LEAVE_TYPES); }
  set leaveTypes(val: LeaveTypeDto[]) { this.set("leave_types", val); }

  get leaveBalances() { return this.get<LeaveBalanceDto[]>("leave_balances", INITIAL_LEAVE_BALANCES); }
  set leaveBalances(val: LeaveBalanceDto[]) { this.set("leave_balances", val); }

  get leaveRequests() { return this.get<LeaveRequestDto[]>("leave_requests", INITIAL_LEAVE_REQUESTS); }
  set leaveRequests(val: LeaveRequestDto[]) { this.set("leave_requests", val); }

  get attendance() { return this.get<AttendanceDto[]>("attendance", INITIAL_ATTENDANCE); }
  set attendance(val: AttendanceDto[]) { this.set("attendance", val); }

  get goals() { return this.get<PerformanceGoalDto[]>("goals", INITIAL_GOALS); }
  set goals(val: PerformanceGoalDto[]) { this.set("goals", val); }

  get evaluations() { return this.get<PerformanceEvaluationDto[]>("evaluations", INITIAL_EVALUATIONS); }
  set evaluations(val: PerformanceEvaluationDto[]) { this.set("evaluations", val); }

  get jobPostings() { return this.get<JobPostingDto[]>("job_postings", INITIAL_JOB_POSTINGS); }
  set jobPostings(val: JobPostingDto[]) { this.set("job_postings", val); }

  get candidates() { return this.get<CandidateDto[]>("candidates", INITIAL_CANDIDATES); }
  set candidates(val: CandidateDto[]) { this.set("candidates", val); }

  get interviews() { return this.get<InterviewDto[]>("interviews", INITIAL_INTERVIEWS); }
  set interviews(val: InterviewDto[]) { this.set("interviews", val); }

  get announcements() { return this.get<AnnouncementDto[]>("announcements", INITIAL_ANNOUNCEMENTS); }
  set announcements(val: AnnouncementDto[]) { this.set("announcements", val); }

  get notifications() { return this.get<NotificationDto[]>("notifications", INITIAL_NOTIFICATIONS); }
  set notifications(val: NotificationDto[]) { this.set("notifications", val); }

  get documents() { return this.get<any[]>("documents", []); }
  set documents(val: any[]) { this.set("documents", val); }

  get workSchedules() { return this.get<any[]>("workSchedules", []); }
  set workSchedules(val: any[]) { this.set("workSchedules", val); }

  get assets() { return this.get<AssetDto[]>("assets", INITIAL_ASSETS); }
  set assets(val: AssetDto[]) { this.set("assets", val); }

  get onboardingPlans() { return this.get<OnboardingPlanDto[]>("onboarding_plans", INITIAL_ONBOARDING_PLANS); }
  set onboardingPlans(val: OnboardingPlanDto[]) { this.set("onboarding_plans", val); }

  get onboardingInstances() { return this.get<OnboardingProgressDto[]>("onboarding_instances", INITIAL_ONBOARDING_INSTANCES); }
  set onboardingInstances(val: OnboardingProgressDto[]) { this.set("onboarding_instances", val); }

  get courses() { return this.get<CourseDto[]>("courses", INITIAL_COURSES); }
  set courses(val: CourseDto[]) { this.set("courses", val); }

  get courseAssignments() { return this.get<CourseAssignmentDto[]>("course_assignments", INITIAL_COURSE_ASSIGNMENTS); }
  set courseAssignments(val: CourseAssignmentDto[]) { this.set("course_assignments", val); }

  get competencyForms() { return this.get<CompetencyFormDto[]>("competency_forms", INITIAL_COMPETENCY_FORMS); }
  set competencyForms(val: CompetencyFormDto[]) { this.set("competency_forms", val); }

  get evaluations360() { return this.get<Evaluation360Dto[]>("evaluations_360", INITIAL_360_EVALUATIONS); }
  set evaluations360(val: Evaluation360Dto[]) { this.set("evaluations_360", val); }

  get referenceChecks() { return this.get<ReferenceCheckDto[]>("reference_checks", INITIAL_REFERENCE_CHECKS); }
  set referenceChecks(val: ReferenceCheckDto[]) { this.set("reference_checks", val); }

  get payrolls() { return this.get<PayrollDto[]>("payrolls", INITIAL_PAYROLLS); }
  set payrolls(val: PayrollDto[]) { this.set("payrolls", val); }

  get expenses() { return this.get<ExpenseRequestDto[]>("expenses", INITIAL_EXPENSES); }
  set expenses(val: ExpenseRequestDto[]) { this.set("expenses", val); }

  get shifts() { return this.get<EmployeeShiftDto[]>("shifts", INITIAL_SHIFTS); }
  set shifts(val: EmployeeShiftDto[]) { this.set("shifts", val); }

  get visitors() { return this.get<VisitorLogDto[]>("visitors", INITIAL_VISITORS); }
  set visitors(val: VisitorLogDto[]) { this.set("visitors", val); }

  get aiChatHistory() { return this.get<AiChatMessage[]>("ai_chat_history", []); }
  set aiChatHistory(val: AiChatMessage[]) { this.set("ai_chat_history", val); }
}

// ---- Phase 6: Initial Mock Data ----

const INITIAL_PAYROLLS: PayrollDto[] = [
  { id: "payroll_1", userId: "user_can", userName: "Can Demir", departmentName: "Bilgi Teknolojileri", period: "2026-05", baseSalary: 55000, overtime: 3200, bonus: 5000, deductions: 1800, tax: 12400, netSalary: 49000, status: "Paid", paymentDate: "2026-05-28", createdAt: "2026-05-25T10:00:00Z" },
  { id: "payroll_2", userId: "user_merve", userName: "Merve Çelik", departmentName: "Pazarlama", period: "2026-05", baseSalary: 48000, overtime: 0, bonus: 8000, deductions: 1500, tax: 11200, netSalary: 43300, status: "Paid", paymentDate: "2026-05-28", createdAt: "2026-05-25T10:00:00Z" },
  { id: "payroll_3", userId: "user_ahmet", userName: "Ahmet Yılmaz", departmentName: "Yönetim", period: "2026-05", baseSalary: 85000, overtime: 0, bonus: 10000, deductions: 2500, tax: 22500, netSalary: 70000, status: "Paid", paymentDate: "2026-05-28", createdAt: "2026-05-25T10:00:00Z" },
  { id: "payroll_4", userId: "user_elif", userName: "Elif Kaya", departmentName: "Yönetim", period: "2026-05", baseSalary: 80000, overtime: 0, bonus: 7000, deductions: 2000, tax: 21000, netSalary: 64000, status: "Approved", createdAt: "2026-05-25T10:00:00Z" },
  { id: "payroll_5", userId: "user_can", userName: "Can Demir", departmentName: "Bilgi Teknolojileri", period: "2026-06", baseSalary: 55000, overtime: 1500, bonus: 0, deductions: 1800, tax: 11700, netSalary: 43000, status: "Calculated", createdAt: "2026-06-01T10:00:00Z" },
  { id: "payroll_6", userId: "user_selim", userName: "Selim Aksoy", departmentName: "Yönetim", period: "2026-05", baseSalary: 120000, overtime: 0, bonus: 15000, deductions: 3000, tax: 35000, netSalary: 97000, status: "Paid", paymentDate: "2026-05-28", createdAt: "2026-05-25T10:00:00Z" },
];

const INITIAL_EXPENSES: ExpenseRequestDto[] = [
  { id: "exp_1", userId: "user_can", userName: "Can Demir", departmentName: "Bilgi Teknolojileri", category: "Equipment", description: "Mekanik Klavye - Keychron K8 Pro", amount: 4500, currency: "TRY", status: "Approved", approvedBy: "user_ahmet", approvedByName: "Ahmet Yılmaz", approvedDate: "2026-05-20T14:00:00Z", createdAt: "2026-05-18T09:00:00Z" },
  { id: "exp_2", userId: "user_merve", userName: "Merve Çelik", departmentName: "Pazarlama", category: "Travel", description: "İstanbul - Ankara iş seyahati uçak bileti", amount: 3200, currency: "TRY", status: "Pending", createdAt: "2026-06-01T11:00:00Z" },
  { id: "exp_3", userId: "user_ahmet", userName: "Ahmet Yılmaz", departmentName: "Yönetim", category: "Accommodation", description: "Ankara konferans otel konaklaması (2 gece)", amount: 7800, currency: "TRY", status: "Approved", approvedBy: "user_selim", approvedByName: "Selim Aksoy", approvedDate: "2026-05-22T16:00:00Z", createdAt: "2026-05-20T08:00:00Z" },
  { id: "exp_4", userId: "user_can", userName: "Can Demir", departmentName: "Bilgi Teknolojileri", category: "Training", description: "AWS Solutions Architect sertifika sınavı", amount: 6800, currency: "TRY", status: "Pending", createdAt: "2026-06-03T10:00:00Z" },
  { id: "exp_5", userId: "user_elif", userName: "Elif Kaya", departmentName: "Yönetim", category: "Food", description: "Müşteri akşam yemeği - 4 kişi", amount: 2400, currency: "TRY", status: "Paid", approvedBy: "user_selim", approvedByName: "Selim Aksoy", approvedDate: "2026-05-15T09:00:00Z", createdAt: "2026-05-14T20:00:00Z" },
];

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const INITIAL_SHIFTS: EmployeeShiftDto[] = [
  { id: "shift_1", userId: "user_can", userName: "Can Demir", departmentName: "Bilgi Teknolojileri", date: formatDate(today), shiftType: "Full", startTime: "09:00", endTime: "18:00", breakMinutes: 60, overtimeMinutes: 0, status: "Active" },
  { id: "shift_2", userId: "user_merve", userName: "Merve Çelik", departmentName: "Pazarlama", date: formatDate(today), shiftType: "Full", startTime: "09:00", endTime: "18:00", breakMinutes: 60, overtimeMinutes: 30, status: "Active" },
  { id: "shift_3", userId: "user_ahmet", userName: "Ahmet Yılmaz", departmentName: "Yönetim", date: formatDate(today), shiftType: "Full", startTime: "08:30", endTime: "17:30", breakMinutes: 60, overtimeMinutes: 0, status: "Active" },
  { id: "shift_4", userId: "user_can", userName: "Can Demir", departmentName: "Bilgi Teknolojileri", date: formatDate(addDays(today, 1)), shiftType: "Full", startTime: "09:00", endTime: "18:00", breakMinutes: 60, overtimeMinutes: 0, status: "Planned" },
  { id: "shift_5", userId: "user_can", userName: "Can Demir", departmentName: "Bilgi Teknolojileri", date: formatDate(addDays(today, -1)), shiftType: "Full", startTime: "09:00", endTime: "18:00", breakMinutes: 60, overtimeMinutes: 45, status: "Completed" },
  { id: "shift_6", userId: "user_elif", userName: "Elif Kaya", departmentName: "Yönetim", date: formatDate(today), shiftType: "Morning", startTime: "08:00", endTime: "14:00", breakMinutes: 30, overtimeMinutes: 0, status: "Active" },
  { id: "shift_7", userId: "user_merve", userName: "Merve Çelik", departmentName: "Pazarlama", date: formatDate(addDays(today, 1)), shiftType: "Off", startTime: "00:00", endTime: "00:00", breakMinutes: 0, overtimeMinutes: 0, status: "Planned", notes: "İzinli" },
  { id: "shift_8", userId: "user_selim", userName: "Selim Aksoy", departmentName: "Yönetim", date: formatDate(today), shiftType: "Full", startTime: "08:00", endTime: "18:00", breakMinutes: 60, overtimeMinutes: 0, status: "Active" },
];

const INITIAL_VISITORS: VisitorLogDto[] = [
  { id: "visitor_1", visitorName: "Mehmet Karagöz", visitorCompany: "TeknoSoft A.Ş.", visitorPhone: "+90 532 111 2233", hostUserId: "user_ahmet", hostUserName: "Ahmet Yılmaz", purpose: "Yazılım Entegrasyon Toplantısı", checkInTime: new Date(Date.now() - 3600000).toISOString(), badgeNumber: "V-001", status: "CheckedIn" },
  { id: "visitor_2", visitorName: "Ayşe Tekin", visitorCompany: "HR Danışmanlık", visitorPhone: "+90 544 222 3344", hostUserId: "user_elif", hostUserName: "Elif Kaya", purpose: "İK Süreç Denetimi", checkInTime: new Date(Date.now() - 7200000).toISOString(), checkOutTime: new Date(Date.now() - 3600000).toISOString(), badgeNumber: "V-002", status: "CheckedOut" },
  { id: "visitor_3", visitorName: "Burak Yıldırım", visitorCompany: "FinTech Solutions", visitorPhone: "+90 555 333 4455", hostUserId: "user_selim", hostUserName: "Selim Aksoy", purpose: "Yatırım Görüşmesi", checkInTime: new Date(Date.now() + 3600000).toISOString(), badgeNumber: "V-003", vehiclePlate: "34 ABC 567", status: "Expected", notes: "Otopark bilgisi verilecek" },
  { id: "visitor_4", visitorName: "Zehra Demir", visitorCompany: "Muhasebe Danışmanlık", visitorPhone: "+90 533 444 5566", hostUserId: "user_elif", hostUserName: "Elif Kaya", purpose: "Mali Denetim", checkInTime: new Date(Date.now() - 86400000).toISOString(), checkOutTime: new Date(Date.now() - 82800000).toISOString(), badgeNumber: "V-004", status: "CheckedOut" },
];

const INITIAL_ASSETS: AssetDto[] = [
  { id: "asset_1", type: "Laptop", name: "MacBook Pro 16", model: "M3 Pro 18GB/512GB", serialNumber: "C02F1234QWER", purchaseDate: "2026-01-15", purchasePrice: 95000, condition: "New", status: "Assigned", currentAssigneeId: "user_employee", currentAssigneeName: "Ahmet Yılmaz", assignmentDate: "2026-01-16T09:00:00Z", notes: "Yazılım geliştirme ekibi kullanımı için verilmiştir." },
  { id: "asset_2", type: "Phone", name: "iPhone 15 Pro", model: "128GB Black", serialNumber: "G02H5678UIOP", purchaseDate: "2026-02-10", purchasePrice: 65000, condition: "New", status: "Available", notes: "Test cihazı." },
  { id: "asset_3", type: "Monitor", name: "Dell UltraSharp 27", model: "U2723QE 4K", serialNumber: "CN-08W297-Dell", purchaseDate: "2025-11-20", purchasePrice: 18000, condition: "Good", status: "Available", notes: "Ofis içi kullanım." }
];

const INITIAL_ONBOARDING_PLANS: OnboardingPlanDto[] = [
  {
    id: "plan_1",
    name: "Yazılım Geliştirici Uyum Süreci",
    departmentId: "dept_it",
    departmentName: "Bilgi Teknolojileri",
    positionId: "pos_yazilim_uzmani",
    positionTitle: "Kıdemli Yazılım Geliştirici",
    durationDays: 14,
    status: "Active",
    tasks: [
      { id: "task_1_1", onboardingPlanId: "plan_1", title: "İş Sözleşmesi ve Özlük Belgelerinin İmzalanması", description: "İşe giriş sözleşmesi, KVKK onay formu ve ilgili belgelerin İK ekibine teslim edilmesi/sistemden imzalanması.", category: "Document", dueDay: 1, assignedToRole: "Employee", isMandatory: true, order: 1 },
      { id: "task_1_2", onboardingPlanId: "plan_1", title: "IT Ekipman Teslimi ve Kurulumu", description: "Zimmetli bilgisayar ve diğer ekipmanların teslim alınması, şirket e-posta hesabı ve Slack kurulumlarının tamamlanması.", category: "System", dueDay: 1, assignedToRole: "IT", isMandatory: true, order: 2 },
      { id: "task_1_3", onboardingPlanId: "plan_1", title: "Ekip ile Tanışma Toplantısı", description: "Geliştirme ekibi ve ürün yöneticisiyle 30 dakikalık tanışma ve oryantasyon toplantısı.", category: "Meeting", dueDay: 2, assignedToRole: "Manager", isMandatory: true, order: 3 },
      { id: "task_1_4", onboardingPlanId: "plan_1", title: "Şirket Kültürü ve İSG Eğitimi", description: "Şirket genel politikaları, çalışma saatleri ve İş Sağlığı Güvenliği eğitim videosunun izlenmesi.", category: "Training", dueDay: 3, assignedToRole: "Employee", isMandatory: true, order: 4 }
    ]
  }
];

const INITIAL_ONBOARDING_INSTANCES: OnboardingProgressDto[] = [
  {
    instanceId: "inst_1",
    userId: "user_employee",
    userName: "Ahmet Yılmaz",
    planId: "plan_1",
    planName: "Yazılım Geliştirici Uyum Süreci",
    startDate: "2026-06-01T09:00:00Z",
    status: "In Progress",
    progressPercentage: 50.00,
    tasks: [
      { taskId: "task_1_1", title: "İş Sözleşmesi ve Özlük Belgelerinin İmzalanması", description: "İşe giriş sözleşmesi, KVKK onay formu ve ilgili belgelerin İK ekibine teslim edilmesi/sistemden imzalanması.", category: "Document", dueDay: 1, assignedToRole: "Employee", isMandatory: true, completionStatus: "Completed", completionDate: "2026-06-01T10:30:00Z" },
      { taskId: "task_1_2", title: "IT Ekipman Teslimi ve Kurulumu", description: "Zimmetli bilgisayar ve diğer ekipmanların teslim alınması, şirket e-posta hesabı ve Slack kurulumlarının tamamlanması.", category: "System", dueDay: 1, assignedToRole: "IT", isMandatory: true, completionStatus: "Completed", completionDate: "2026-06-01T13:00:00Z" },
      { taskId: "task_1_3", title: "Ekip ile Tanışma Toplantısı", description: "Geliştirme ekibi ve ürün yöneticisiyle 30 dakikalık tanışma ve oryantasyon toplantısı.", category: "Meeting", dueDay: 2, assignedToRole: "Manager", isMandatory: true, completionStatus: "Pending" },
      { taskId: "task_1_4", title: "Şirket Kültürü ve İSG Eğitimi", description: "Şirket genel politikaları, çalışma saatleri ve İş Sağlığı Güvenliği eğitim videosunun izlenmesi.", category: "Training", dueDay: 3, assignedToRole: "Employee", isMandatory: true, completionStatus: "Pending" }
    ]
  }
];

const INITIAL_COURSES: CourseDto[] = [
  {
    id: "course_isg",
    title: "İş Sağlığı ve Güvenliği (İSG) Eğitimi",
    description: "Yasal olarak zorunlu genel iş sağlığı ve güvenliği eğitimi.",
    type: "Online",
    durationHours: 4,
    provider: "SeedHR Akademi",
    documentUrl: "https://example.com/isg-kurs-dokumani.pdf",
    isActive: true
  },
  {
    id: "course_cyber",
    title: "Siber Güvenlik Farkındalık Eğitimi",
    description: "Şirket içi bilgi güvenliği kuralları ve sosyal mühendislik saldırıları farkındalık eğitimi.",
    type: "Online",
    durationHours: 2,
    provider: "IT Güvenlik Ekibi",
    documentUrl: "https://example.com/cyber-security-awareness.pdf",
    isActive: true
  },
  {
    id: "course_kvkk",
    title: "KVKK ve Kişisel Verilerin Korunması Eğitimi",
    description: "Kişisel Verilerin Korunması Kanunu kapsamında uyulması gereken veri işleme kuralları.",
    type: "Online",
    durationHours: 3,
    provider: "Hukuk Departmanı",
    documentUrl: "https://example.com/kvkk-egitim.pdf",
    isActive: true
  }
];

const INITIAL_COURSE_ASSIGNMENTS: CourseAssignmentDto[] = [
  {
    id: "assign_1",
    courseId: "course_isg",
    course: INITIAL_COURSES[0],
    userId: "user_employee",
    userFullName: "Ahmet Yılmaz",
    assignedBy: "user_hr",
    assignedByFullName: "Ayşe Kaya",
    assignedDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    completedDate: new Date(Date.now() - 8 * 86400000).toISOString(),
    status: "Completed",
    certificateUrl: "https://example.com/certificates/cert_isg_ahmet.pdf"
  },
  {
    id: "assign_2",
    courseId: "course_cyber",
    course: INITIAL_COURSES[1],
    userId: "user_employee",
    userFullName: "Ahmet Yılmaz",
    assignedBy: "user_hr",
    assignedByFullName: "Ayşe Kaya",
    assignedDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: "Assigned"
  },
  {
    id: "assign_3",
    courseId: "course_isg",
    course: INITIAL_COURSES[0],
    userId: "user_mehmet",
    userFullName: "Mehmet Yılmaz",
    assignedBy: "user_hr",
    assignedByFullName: "Ayşe Kaya",
    assignedDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    completedDate: new Date(Date.now() - 8 * 86400000).toISOString(),
    status: "Completed",
    certificateUrl: "https://example.com/certificates/cert_isg_mehmet.pdf"
  }
];

const INITIAL_COMPETENCY_FORMS: CompetencyFormDto[] = [
  {
    id: "comp_form_it",
    departmentId: "dept_it",
    departmentName: "Bilgi Teknolojileri",
    title: "Yazılım Geliştirici Değerlendirme Şablonu",
    description: "Yazılım geliştirici kadrosundaki çalışanlar için yetkinlik değerlendirme şablonu.",
    competencies: [
      { id: "comp_it_1", category: "Technical", question: "Teknik Bilgi & Kod Kalitesi: Temiz kod prensipleri ve mimari standartlara uyum.", weight: 40.0 },
      { id: "comp_it_2", category: "Soft Skills", question: "Problem Çözme Yeteneği: Karmaşık hataları çözme ve analitik yaklaşım.", weight: 30.0 },
      { id: "comp_it_3", category: "Soft Skills", question: "İletişim & Takım Çalışması: Ekip arkadaşlarıyla uyum ve bilgi paylaşımı.", weight: 30.0 }
    ]
  }
];

const INITIAL_360_EVALUATIONS: Evaluation360Dto[] = [
  {
    id: "eval360_1",
    employeeId: "user_employee",
    employeeName: "Ahmet Yılmaz",
    evaluatorId: "user_manager",
    evaluatorName: "Can Demir",
    evaluatorType: "Manager",
    competencyFormId: "comp_form_it",
    competencyFormTitle: "Yazılım Geliştirici Değerlendirme Şablonu",
    scores: {
      "comp_it_1": 5,
      "comp_it_2": 4,
      "comp_it_3": 4
    },
    feedback: "Ahmet teknik olarak çok güçlü bir çalışan. İletişimini daha da geliştirebilir.",
    status: "Submitted",
    period: "2026 Q2",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: "eval360_2",
    employeeId: "user_employee",
    employeeName: "Ahmet Yılmaz",
    evaluatorId: "user_mehmet",
    evaluatorName: "Mehmet Yılmaz",
    evaluatorType: "Peer",
    competencyFormId: "comp_form_it",
    competencyFormTitle: "Yazılım Geliştirici Değerlendirme Şablonu",
    scores: {
      "comp_it_1": 4,
      "comp_it_2": 5,
      "comp_it_3": 4
    },
    feedback: "Harika bir takım arkadaşı, her zaman yardıma hazır.",
    status: "Submitted",
    period: "2026 Q2",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: "eval360_3",
    employeeId: "user_employee",
    employeeName: "Ahmet Yılmaz",
    evaluatorId: "user_employee",
    evaluatorName: "Ahmet Yılmaz",
    evaluatorType: "Self",
    competencyFormId: "comp_form_it",
    competencyFormTitle: "Yazılım Geliştirici Değerlendirme Şablonu",
    scores: {
      "comp_it_1": 4,
      "comp_it_2": 4,
      "comp_it_3": 4
    },
    feedback: "Bu dönem hedeflerimi başarıyla gerçekleştirdiğimi düşünüyorum. Teknik olarak kendimi geliştirdim.",
    status: "Submitted",
    period: "2026 Q2",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

const INITIAL_REFERENCE_CHECKS: ReferenceCheckDto[] = [
  {
    id: "ref_check_1",
    candidateId: "candidate_2",
    candidateName: "Merve Demir",
    referenceName: "Hakan Aydın",
    company: "Tekno Soft",
    title: "Yazılım Mimarı",
    email: "hakan.aydin@teknosoft.com",
    phone: "+90 532 777 6655",
    relationship: "Former Manager",
    status: "Completed",
    verificationNotes: "Merve Hanım ile 2 yıl boyunca aynı projelerde çalıştık.",
    scores: {
      "Teknik Beceri": 5,
      "Uyum / Takım Çalışması": 5,
      "Girişkenlik / Sorumluluk": 5
    },
    comments: "Merve mükemmel bir takım arkadaşı ve teknik bilgisi çok üst düzeydedir. Kesinlikle öneririm.",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

export const mockDb = new LocalDatabase();

// ----------------------------------------------------
// API WRAPPERS WITH OFF-LINE MOCK FALLBACK
// ----------------------------------------------------

async function wrapApiCall<T>(apiCall: () => Promise<{ data: ApiResponse<T> }>, mockFallback: () => T, customMsg?: string): Promise<ApiResponse<T>> {
  try {
    const res = await apiCall();
    return res.data;
  } catch (err: any) {
    // If backend is offline or network connection is refused, run the mock fallback engine
    const isNetworkError = !err.response || err.code === "ERR_NETWORK" || err.message === "Network Error" || err.message.includes("Network Error");
    if (isNetworkError && mockFallback) {
      console.warn("Backend API bağlantı hatası. SeedHR Demo Mock DB motoru devrede.");
      try {
        const mockData = mockFallback();
        return {
          success: true,
          message: customMsg || "Çevrimdışı Demo Modu",
          data: mockData,
          errors: [],
          timestamp: new Date().toISOString()
        };
      } catch (mockErr: any) {
        return {
          success: false,
          message: `Mock motoru hatası: ${mockErr.message}`,
          data: null as any,
          errors: [mockErr.message],
          timestamp: new Date().toISOString()
        };
      }
    }

    const errMsg = err.response?.data?.message || err.message || "API Hatası oluştu";
    const errors = err.response?.data?.errors || [];
    return {
      success: false,
      message: errMsg,
      data: null as any,
      errors: Array.isArray(errors) ? errors : [errors],
      timestamp: new Date().toISOString()
    };
  }
}

export const authAPI = {
  login: async (data: any): Promise<ApiResponse<{ token: string; refreshToken: string; expiresAt: string; user: UserDto }>> => {
    return wrapApiCall(
      () => api.post("/auth/login", data),
      () => {
        const user = mockDb.users.find(u => u.email === data.email) || mockDb.users[0];
        if (typeof window !== "undefined") {
          localStorage.setItem("token", "mock_token_" + user.id);
          localStorage.setItem("refreshToken", "mock_refresh_" + user.id);
          localStorage.setItem("currentUser", JSON.stringify(user));
        }
        return {
          token: "mock_token_" + user.id,
          refreshToken: "mock_refresh_" + user.id,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          user
        };
      },
      "Demo Giriş Başarılı"
    );
  },

  getCurrentUser: (): UserDto | null => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
  },

  logout: async (): Promise<ApiResponse<boolean>> => {
    return wrapApiCall(
      () => api.post("/auth/logout"),
      () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("currentUser");
        }
        return true;
      },
      "Oturum Kapatıldı"
    );
  }
};

export const userAPI = {
  getAll: async (): Promise<ApiResponse<UserDto[]>> => {
    return wrapApiCall(
      () => api.get("/users"),
      () => mockDb.users
    );
  },
  getById: async (id: string): Promise<ApiResponse<UserDto>> => {
    return wrapApiCall(
      () => api.get(`/users/${id}`),
      () => mockDb.users.find(u => u.id === id) || mockDb.users[0]
    );
  },
  create: async (data: any): Promise<ApiResponse<UserDto>> => {
    return wrapApiCall(
      () => api.post("/users", data),
      () => {
        const id = "user_" + Date.now();
        const dept = mockDb.departments.find(d => d.id === data.departmentId);
        const pos = mockDb.positions.find(p => p.id === data.positionId);
        const newUser: UserDto = {
          ...data,
          id,
          fullName: `${data.firstName} ${data.lastName}`,
          departmentName: dept?.name || "",
          positionTitle: pos?.title || "",
          isActive: true,
          roleName: data.roleId === "role_admin" ? "Admin" : data.roleId === "role_manager" ? "Manager" : data.roleId === "role_hr" ? "HR" : "Employee"
        };
        mockDb.users = [...mockDb.users, newUser];
        return newUser;
      },
      "Çalışan Eklendi"
    );
  },
  update: async (id: string, data: any): Promise<ApiResponse<UserDto>> => {
    return wrapApiCall(
      () => api.put(`/users/${id}`, data),
      () => {
        const dept = mockDb.departments.find(d => d.id === data.departmentId);
        const pos = mockDb.positions.find(p => p.id === data.positionId);
        const updated = mockDb.users.map(u => {
          if (u.id === id) {
            const up: UserDto = {
              ...u,
              ...data,
              fullName: `${data.firstName || u.firstName} ${data.lastName || u.lastName}`,
              departmentName: dept ? dept.name : u.departmentName,
              positionTitle: pos ? pos.title : u.positionTitle
            };
            if (typeof window !== "undefined") {
              const current = authAPI.getCurrentUser();
              if (current && current.id === id) {
                localStorage.setItem("currentUser", JSON.stringify(up));
              }
            }
            return up;
          }
          return u;
        });
        mockDb.users = updated;
        return mockDb.users.find(u => u.id === id)!;
      },
      "Çalışan Bilgileri Güncellendi"
    );
  },
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    return wrapApiCall(
      () => api.delete(`/users/${id}`),
      () => {
        mockDb.users = mockDb.users.filter(u => u.id !== id);
        return true;
      },
      "Çalışan Silindi"
    );
  },
  getUpcomingBirthdays: async (days: number = 30): Promise<ApiResponse<any[]>> => {
    return wrapApiCall(
      () => api.get(`/users/birthdays?days=${days}`),
      () => {
        return mockDb.users.map(u => ({
          userId: u.id,
          fullName: u.fullName,
          dateOfBirth: u.dateOfBirth,
          departmentName: u.departmentName,
          positionTitle: u.positionTitle
        }));
      }
    );
  }
};

export const departmentAPI = {
  getAll: async (): Promise<ApiResponse<DepartmentDto[]>> => {
    return wrapApiCall(
      () => api.get("/departments"),
      () => mockDb.departments
    );
  },
  getById: async (id: string): Promise<ApiResponse<DepartmentDto>> => {
    return wrapApiCall(
      () => api.get(`/departments/${id}`),
      () => mockDb.departments.find(d => d.id === id)!
    );
  },
  create: async (data: any): Promise<ApiResponse<DepartmentDto>> => {
    return wrapApiCall(
      () => api.post("/departments", data),
      () => {
        const newDept = { ...data, id: "dept_" + Date.now(), isActive: true };
        mockDb.departments = [...mockDb.departments, newDept];
        return newDept;
      },
      "Departman Oluşturuldu"
    );
  },
  update: async (id: string, data: any): Promise<ApiResponse<DepartmentDto>> => {
    return wrapApiCall(
      () => api.put(`/departments/${id}`, data),
      () => {
        mockDb.departments = mockDb.departments.map(d => d.id === id ? { ...d, ...data } : d);
        return mockDb.departments.find(d => d.id === id)!;
      },
      "Departman Güncellendi"
    );
  },
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    return wrapApiCall(
      () => api.delete(`/departments/${id}`),
      () => {
        mockDb.departments = mockDb.departments.filter(d => d.id !== id);
        return true;
      },
      "Departman Silindi"
    );
  }
};

export const positionAPI = {
  getAll: async (): Promise<ApiResponse<PositionDto[]>> => {
    return wrapApiCall(
      () => api.get("/positions"),
      () => mockDb.positions
    );
  },
  create: async (data: any): Promise<ApiResponse<PositionDto>> => {
    return wrapApiCall(
      () => api.post("/positions", data),
      () => {
        const dept = mockDb.departments.find(d => d.id === data.departmentId);
        const newPos = { ...data, id: "pos_" + Date.now(), departmentName: dept?.name || "", isActive: true };
        mockDb.positions = [...mockDb.positions, newPos];
        return newPos;
      },
      "Pozisyon Oluşturuldu"
    );
  }
};

export const leaveAPI = {
  getRequests: async (): Promise<ApiResponse<LeaveRequestDto[]>> => {
    return wrapApiCall(
      () => api.get("/leave/requests"),
      () => mockDb.leaveRequests
    );
  },
  getRequestsByUser: async (userId: string): Promise<ApiResponse<LeaveRequestDto[]>> => {
    return wrapApiCall(
      () => api.get(`/leave/requests/user/${userId}`),
      () => mockDb.leaveRequests.filter(r => r.userId === userId)
    );
  },
  getBalancesByUser: async (userId: string): Promise<ApiResponse<LeaveBalanceDto[]>> => {
    return wrapApiCall(
      () => api.get(`/leave/balances/user/${userId}`),
      () => {
        const userBal = mockDb.leaveBalances.filter(b => b.userId === userId);
        if (userBal.length === 0) {
          // generate default
          const generated = mockDb.leaveTypes.map(t => ({
            id: `bal_${userId}_${t.code.toLowerCase()}`,
            userId,
            leaveTypeId: t.id,
            leaveTypeName: t.name,
            totalDays: t.defaultDays,
            usedDays: 0,
            remainingDays: t.defaultDays,
            year: 2026
          }));
          mockDb.leaveBalances = [...mockDb.leaveBalances, ...generated];
          return generated;
        }
        return userBal;
      }
    );
  },
  createRequest: async (data: any): Promise<ApiResponse<LeaveRequestDto>> => {
    return wrapApiCall(
      () => api.post("/leave/requests", data),
      () => {
        const user = mockDb.users.find(u => u.id === data.userId)!;
        const type = mockDb.leaveTypes.find(t => t.id === data.leaveTypeId)!;
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const newReq: LeaveRequestDto = {
          id: "leave_req_" + Date.now(),
          userId: data.userId,
          userName: user.fullName,
          departmentName: user.departmentName,
          leaveTypeId: data.leaveTypeId,
          leaveTypeName: type.name,
          startDate: data.startDate,
          endDate: data.endDate,
          daysRequested: diffDays,
          reason: data.reason,
          status: "Pending",
          createdAt: new Date().toISOString()
        };

        mockDb.leaveRequests = [newReq, ...mockDb.leaveRequests];

        // add notification for manager / hr
        const newNotif: NotificationDto = {
          id: "not_" + Date.now(),
          userId: "user_elif", // HR
          title: "Yeni İzin Talebi",
          message: `${user.fullName} tarafından ${diffDays} günlük ${type.name} talebi oluşturuldu.`,
          type: "Leave",
          isRead: false,
          createdAt: new Date().toISOString()
        };
        mockDb.notifications = [newNotif, ...mockDb.notifications];

        return newReq;
      },
      "İzin Talebi Gönderildi"
    );
  },
  approveRequest: async (id: string, approverId: string, comment?: string): Promise<ApiResponse<LeaveRequestDto>> => {
    return wrapApiCall(
      () => api.post(`/leave/requests/${id}/approve`, { approverId, comment }),
      () => {
        const approver = mockDb.users.find(u => u.id === approverId)!;
        let targetReq: LeaveRequestDto | null = null;
        mockDb.leaveRequests = mockDb.leaveRequests.map(r => {
          if (r.id === id) {
            targetReq = {
              ...r,
              status: "Approved",
              approvedBy: approverId,
              approvedByName: approver.fullName,
              approvedDate: new Date().toISOString(),
              rejectionReason: comment
            };
            return targetReq;
          }
          return r;
        });

        // Deduct from balances
        if (targetReq) {
          const req: LeaveRequestDto = targetReq;
          mockDb.leaveBalances = mockDb.leaveBalances.map(b => {
            if (b.userId === req.userId && b.leaveTypeId === req.leaveTypeId) {
              const used = b.usedDays + req.daysRequested;
              return {
                ...b,
                usedDays: used,
                remainingDays: Math.max(0, b.totalDays - used)
              };
            }
            return b;
          });

          // notify employee
          const newNotif: NotificationDto = {
            id: "not_" + Date.now(),
            userId: req.userId,
            title: "İzin Talebiniz Onaylandı",
            message: `${req.startDate} - ${req.endDate} tarihleri arasındaki izin talebiniz onaylandı.`,
            type: "Success",
            isRead: false,
            createdAt: new Date().toISOString()
          };
          mockDb.notifications = [newNotif, ...mockDb.notifications];
        }

        return targetReq || mockDb.leaveRequests[0];
      },
      "İzin Talebi Onaylandı"
    );
  },
  rejectRequest: async (id: string, rejecterId: string, reason: string): Promise<ApiResponse<LeaveRequestDto>> => {
    return wrapApiCall(
      () => api.post(`/leave/requests/${id}/reject`, { rejecterId, reason }),
      () => {
        let targetReq: LeaveRequestDto | null = null;
        mockDb.leaveRequests = mockDb.leaveRequests.map(r => {
          if (r.id === id) {
            targetReq = {
              ...r,
              status: "Rejected",
              rejectionReason: reason
            };
            return targetReq;
          }
          return r;
        });

        if (targetReq) {
          const req: LeaveRequestDto = targetReq;
          // notify employee
          const newNotif: NotificationDto = {
            id: "not_" + Date.now(),
            userId: req.userId,
            title: "İzin Talebiniz Reddedildi",
            message: `${req.startDate} - ${req.endDate} tarihleri arasındaki izin talebiniz reddedildi. Gerekçe: ${reason}`,
            type: "Error",
            isRead: false,
            createdAt: new Date().toISOString()
          };
          mockDb.notifications = [newNotif, ...mockDb.notifications];
        }

        return targetReq || mockDb.leaveRequests[0];
      },
      "İzin Talebi Reddedildi"
    );
  }
};

export const attendanceAPI = {
  getAll: async (): Promise<ApiResponse<AttendanceDto[]>> => {
    return wrapApiCall(
      () => api.get("/attendance"),
      () => mockDb.attendance
    );
  },
  getByUser: async (userId: string): Promise<ApiResponse<AttendanceDto[]>> => {
    return wrapApiCall(
      () => api.get(`/attendance/user/${userId}`),
      () => mockDb.attendance.filter(a => a.userId === userId)
    );
  },
  checkIn: async (userId: string, notes?: string): Promise<ApiResponse<AttendanceDto>> => {
    return wrapApiCall(
      () => api.post("/attendance/checkin", { userId, notes }),
      () => {
        const user = mockDb.users.find(u => u.id === userId)!;
        const now = new Date();
        const timeStr = now.toTimeString().split(" ")[0].slice(0, 5); // "HH:MM"
        const dateStr = now.toISOString().split("T")[0]; // "YYYY-MM-DD"

        // check if already checked in today
        const existing = mockDb.attendance.find(a => a.userId === userId && a.date === dateStr);
        if (existing) {
          return existing;
        }

        // Determine if late
        const hour = now.getHours();
        const minute = now.getMinutes();
        const isLate = hour > 9 || (hour === 9 && minute > 0);

        const newAtt: AttendanceDto = {
          id: "att_" + Date.now(),
          userId,
          userName: user.fullName,
          date: dateStr,
          checkIn: timeStr,
          status: isLate ? "Late" : "Present",
          notes: notes || (isLate ? "Geç Giriş" : undefined)
        };

        mockDb.attendance = [newAtt, ...mockDb.attendance];
        return newAtt;
      },
      "Giriş Kaydı Yapıldı"
    );
  },
  checkOut: async (userId: string): Promise<ApiResponse<AttendanceDto>> => {
    return wrapApiCall(
      () => api.post("/attendance/checkout", { userId }),
      () => {
        const now = new Date();
        const timeStr = now.toTimeString().split(" ")[0].slice(0, 5); // "HH:MM"
        const dateStr = now.toISOString().split("T")[0]; // "YYYY-MM-DD"

        let target: AttendanceDto | null = null;
        mockDb.attendance = mockDb.attendance.map(a => {
          if (a.userId === userId && a.date === dateStr) {
            const checkInTime = a.checkIn || "09:00";
            const [ciH, ciM] = checkInTime.split(":").map(Number);
            const totalHours = Math.round((now.getHours() + now.getMinutes() / 60 - (ciH + ciM / 60)) * 100) / 100;
            target = {
              ...a,
              checkOut: timeStr,
              totalHoursWorked: Math.max(0.1, totalHours)
            };
            return target;
          }
          return a;
        });

        return target || mockDb.attendance[0];
      },
      "Çıkış Kaydı Yapıldı"
    );
  }
};

export const performanceAPI = {
  getGoals: async (userId: string): Promise<ApiResponse<PerformanceGoalDto[]>> => {
    return wrapApiCall(
      () => api.get(`/performance/goals/user/${userId}`),
      () => mockDb.goals.filter(g => g.userId === userId)
    );
  },
  createGoal: async (data: any): Promise<ApiResponse<PerformanceGoalDto>> => {
    return wrapApiCall(
      () => api.post("/performance/goals", data),
      () => {
        const newGoal: PerformanceGoalDto = {
          ...data,
          id: "goal_" + Date.now(),
          progressPercentage: 0,
          status: "NotStarted"
        };
        mockDb.goals = [...mockDb.goals, newGoal];
        return newGoal;
      },
      "Performans Hedefi Eklendi"
    );
  },
  updateGoalProgress: async (id: string, progress: number): Promise<ApiResponse<PerformanceGoalDto>> => {
    return wrapApiCall(
      () => api.put(`/performance/goals/${id}/progress`, { progress }),
      () => {
        mockDb.goals = mockDb.goals.map(g => {
          if (g.id === id) {
            const status = progress === 100 ? "Completed" : progress > 0 ? "InProgress" : "NotStarted";
            return { ...g, progressPercentage: progress, status };
          }
          return g;
        });
        return mockDb.goals.find(g => g.id === id)!;
      },
      "Hedef İlerlemesi Güncellendi"
    );
  },
  getEvaluations: async (employeeId?: string): Promise<ApiResponse<PerformanceEvaluationDto[]>> => {
    return wrapApiCall(
      () => api.get(employeeId ? `/performance/evaluations?employeeId=${employeeId}` : "/performance/evaluations"),
      () => employeeId ? mockDb.evaluations.filter(e => e.employeeId === employeeId) : mockDb.evaluations
    );
  },
  createEvaluation: async (data: any): Promise<ApiResponse<PerformanceEvaluationDto>> => {
    return wrapApiCall(
      () => api.post("/performance/evaluations", data),
      () => {
        const emp = mockDb.users.find(u => u.id === data.employeeId)!;
        const evalr = mockDb.users.find(u => u.id === data.evaluatorId)!;
        const newEval: PerformanceEvaluationDto = {
          id: "eval_" + Date.now(),
          employeeId: data.employeeId,
          employeeName: emp.fullName,
          evaluatorId: data.evaluatorId,
          evaluatorName: evalr.fullName,
          evaluationDate: new Date().toISOString().split("T")[0],
          period: data.period,
          score: data.score,
          feedback: data.feedback,
          status: data.status || "Submitted"
        };
        mockDb.evaluations = [newEval, ...mockDb.evaluations];
        return newEval;
      },
      "Değerlendirme Gönderildi"
    );
  }
};

export const recruitmentAPI = {
  getJobPostings: async (): Promise<ApiResponse<JobPostingDto[]>> => {
    return wrapApiCall(
      () => api.get("/recruitment/postings"),
      () => mockDb.jobPostings
    );
  },
  createJobPosting: async (data: any): Promise<ApiResponse<JobPostingDto>> => {
    return wrapApiCall(
      () => api.post("/recruitment/postings", data),
      () => {
        const dept = mockDb.departments.find(d => d.id === data.departmentId)!;
        const newJob: JobPostingDto = {
          ...data,
          id: "job_" + Date.now(),
          departmentName: dept.name,
          postedDate: new Date().toISOString().split("T")[0],
          status: "Open"
        };
        mockDb.jobPostings = [newJob, ...mockDb.jobPostings];
        return newJob;
      },
      "İş İlanı Yayınlandı"
    );
  },
  getCandidates: async (): Promise<ApiResponse<CandidateDto[]>> => {
    return wrapApiCall(
      () => api.get("/recruitment/candidates"),
      () => mockDb.candidates
    );
  },
  createCandidate: async (data: any): Promise<ApiResponse<CandidateDto>> => {
    return wrapApiCall(
      () => api.post("/recruitment/candidates", data),
      () => {
        const job = mockDb.jobPostings.find(j => j.id === data.jobPostingId)!;
        const newCand: CandidateDto = {
          ...data,
          id: "cand_" + Date.now(),
          fullName: `${data.firstName} ${data.lastName}`,
          appliedDate: new Date().toISOString().split("T")[0],
          jobPostingTitle: job.title,
          status: "Applied"
        };
        mockDb.candidates = [newCand, ...mockDb.candidates];
        return newCand;
      },
      "Aday Başvurusu Alındı"
    );
  },
  updateCandidateStatus: async (id: string, status: CandidateDto["status"]): Promise<ApiResponse<CandidateDto>> => {
    return wrapApiCall(
      () => api.put(`/recruitment/candidates/${id}/status`, { status }),
      () => {
        mockDb.candidates = mockDb.candidates.map(c => {
          if (c.id === id) {
            return { ...c, status };
          }
          return c;
        });
        return mockDb.candidates.find(c => c.id === id)!;
      },
      "Aday Durumu Güncellendi"
    );
  },
  getInterviews: async (): Promise<ApiResponse<InterviewDto[]>> => {
    return wrapApiCall(
      () => api.get("/recruitment/interviews"),
      () => mockDb.interviews
    );
  },
  createInterview: async (data: any): Promise<ApiResponse<InterviewDto>> => {
    return wrapApiCall(
      () => api.post("/recruitment/interviews", data),
      () => {
        const cand = mockDb.candidates.find(c => c.id === data.candidateId)!;
        const newInt: InterviewDto = {
          ...data,
          id: "int_" + Date.now(),
          candidateName: cand.fullName,
          jobPostingTitle: cand.jobPostingTitle,
          status: "Scheduled"
        };
        mockDb.interviews = [...mockDb.interviews, newInt];
        return newInt;
      },
      "Mülakat Planlandı"
    );
  },
  completeInterview: async (id: string, data: any): Promise<ApiResponse<InterviewDto>> => {
    return wrapApiCall(
      () => api.post(`/recruitment/interviews/${id}/complete`, data),
      () => {
        mockDb.interviews = mockDb.interviews.map(i => {
          if (i.id === id) {
            return { ...i, status: "Completed", rating: data.rating, feedback: data.feedback, result: data.result };
          }
          return i;
        });
        return mockDb.interviews.find(i => i.id === id)!;
      },
      "Mülakat Tamamlandı"
    );
  }
};

export const announcementAPI = {
  getAll: async (): Promise<ApiResponse<AnnouncementDto[]>> => {
    return wrapApiCall(
      () => api.get("/announcements"),
      () => mockDb.announcements
    );
  },
  create: async (data: any): Promise<ApiResponse<AnnouncementDto>> => {
    return wrapApiCall(
      () => api.post("/announcements", data),
      () => {
        const user = mockDb.users.find(u => u.id === data.authorId)!;
        const newAnn: AnnouncementDto = {
          ...data,
          id: "ann_" + Date.now(),
          authorName: user.fullName,
          publishedDate: new Date().toISOString(),
          status: "Published"
        };
        mockDb.announcements = [newAnn, ...mockDb.announcements];
        return newAnn;
      },
      "Duyuru Yayınlandı"
    );
  }
};

export const notificationAPI = {
  getAll: async (userId: string): Promise<ApiResponse<NotificationDto[]>> => {
    return wrapApiCall(
      () => api.get(`/notifications/user/${userId}`),
      () => mockDb.notifications.filter(n => n.userId === userId)
    );
  },
  markAsRead: async (id: string): Promise<ApiResponse<boolean>> => {
    return wrapApiCall(
      () => api.post(`/notifications/${id}/read`),
      () => {
        mockDb.notifications = mockDb.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
        return true;
      }
    );
  },
  markAllAsRead: async (userId: string): Promise<ApiResponse<boolean>> => {
    return wrapApiCall(
      () => api.post(`/notifications/user/${userId}/read-all`),
      () => {
        mockDb.notifications = mockDb.notifications.map(n => n.userId === userId ? { ...n, isRead: true } : n);
        return true;
      }
    );
  }
};

export const dashboardAPI = {
  getStats: async (): Promise<ApiResponse<DashboardStatisticsDto>> => {
    return wrapApiCall(
      () => api.get("/dashboard/stats"),
      () => {
        const users = mockDb.users.filter(u => u.isActive);
        const leaves = mockDb.leaveRequests.filter(r => r.status === "Pending");
        const postings = mockDb.jobPostings.filter(j => j.status === "Open");
        const evaluations = mockDb.evaluations;

        const avgScore = evaluations.length > 0
          ? Math.round((evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length) * 10) / 10
          : 0;

        const presentToday = mockDb.attendance.filter(a => a.date === new Date().toISOString().split("T")[0] && (a.status === "Present" || a.status === "Late")).length;
        const attRate = users.length > 0 ? Math.round((presentToday / users.length) * 100) : 100;

        return {
          totalEmployees: users.length,
          newHiresThisMonth: 1, // Simulated
          activeLeaveRequests: leaves.length,
          averagePerformanceScore: avgScore,
          openJobPostings: postings.length,
          attendanceRateToday: attRate
        };
      }
    );
  }
};

export const documentAPI = {
  getByUser: async (userId: string): Promise<ApiResponse<any[]>> => {
    return wrapApiCall(
      () => api.get(`/documents/user/${userId}`),
      () => mockDb.documents.filter((d: any) => d.userId === userId) || []
    );
  },
  upload: async (userId: string, documentType: string, file: File): Promise<ApiResponse<any>> => {
    return wrapApiCall(
      () => {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("documentType", documentType);
        formData.append("file", file);
        return api.post("/documents/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
      },
      () => {
        const newDoc = {
          id: "doc_" + Date.now(),
          fileName: file.name,
          fileType: file.type,
          documentType: documentType,
          fileSize: file.size,
          userId: userId
        };
        mockDb.documents = [...mockDb.documents, newDoc];
        return newDoc;
      },
      "Belge Yüklendi"
    );
  },
  download: async (id: string, fileName: string) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${api.defaults.baseURL || "http://localhost:5000/api"}/documents/${id}/download`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    return wrapApiCall(
      () => api.delete(`/documents/${id}`),
      () => {
        mockDb.documents = mockDb.documents.filter((d: any) => d.id !== id) || [];
        return true;
      },
      "Belge Silindi"
    );
  }
};

export const workScheduleAPI = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    return wrapApiCall(
      () => api.get("/workschedules"),
      () => mockDb.workSchedules || []
    );
  },
  getByRange: async (start: string, end: string): Promise<ApiResponse<any[]>> => {
    return wrapApiCall(
      () => api.get(`/workschedules/range?start=${start}&end=${end}`),
      () => {
        const s = new Date(start);
        const e = new Date(end);
        return mockDb.workSchedules.filter((w: any) => {
          const d = new Date(w.date);
          return d >= s && d <= e;
        });
      }
    );
  },
  create: async (data: any): Promise<ApiResponse<any>> => {
    return wrapApiCall(
      () => api.post("/workschedules", data),
      () => {
        const newSchedule = {
          ...data,
          id: "sched_" + Date.now()
        };
        mockDb.workSchedules = [...mockDb.workSchedules, newSchedule];
        return newSchedule;
      },
      "Çalışma Takvimi Oluşturuldu"
    );
  },
  update: async (id: string, data: any): Promise<ApiResponse<any>> => {
    return wrapApiCall(
      () => api.put(`/workschedules/${id}`, data),
      () => {
        mockDb.workSchedules = mockDb.workSchedules.map((w: any) => w.id === id ? { ...w, ...data } : w);
        return mockDb.workSchedules.find((w: any) => w.id === id);
      },
      "Çalışma Takvimi Güncellendi"
    );
  },
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    return wrapApiCall(
      () => api.delete(`/workschedules/${id}`),
      () => {
        mockDb.workSchedules = mockDb.workSchedules.filter((w: any) => w.id !== id);
        return true;
      },
      "Çalışma Takvimi Silindi"
    );
  }
};

export const logsAPI = {
  getFiles: async (): Promise<ApiResponse<LogFileDto[]>> => {
    return wrapApiCall(
      () => api.get("/logs/files"),
      () => {
        const mockLogFiles: LogFileDto[] = [
          {
            fileName: "seedhr-2026-05-30.log",
            filePath: "/var/logs/seedhr-2026-05-30.log",
            size: 2048000,
            createdDate: "2026-05-30T00:00:00Z",
            lastModified: "2026-05-30T23:59:59Z"
          },
          {
            fileName: "seedhr-2026-05-29.log",
            filePath: "/var/logs/seedhr-2026-05-29.log",
            size: 1856000,
            createdDate: "2026-05-29T00:00:00Z",
            lastModified: "2026-05-29T23:59:59Z"
          },
          {
            fileName: "seedhr-2026-05-28.log",
            filePath: "/var/logs/seedhr-2026-05-28.log",
            size: 1672000,
            createdDate: "2026-05-28T00:00:00Z",
            lastModified: "2026-05-28T23:59:59Z"
          }
        ];
        return mockLogFiles;
      }
    );
  },
  viewFile: async (fileName: string, lines: number = 250): Promise<ApiResponse<string>> => {
    return wrapApiCall(
      () => api.get(`/logs/view/${fileName}?lines=${lines}`),
      () => {
        const mockContent = `[2026-05-30T10:15:32.123Z] INFO: Uygulama başlatıldı
[2026-05-30T10:15:32.456Z] INFO: Veritabanı bağlantısı kuruldu
[2026-05-30T10:15:33.789Z] INFO: Giriş modülü hazır
[2026-05-30T10:15:34.012Z] INFO: API sunucusu 5000 portunda dinleniyor
[2026-05-30T10:25:15.234Z] INFO: Kullanıcı selim.aksoy@seedhr.com.tr başarıyla giriş yaptı
[2026-05-30T10:26:45.567Z] WARN: Başarısız giriş denemesi: metin_test@seedhr.com.tr
[2026-05-30T11:30:22.890Z] INFO: Çalışan listesi sorgulandı (100 kayıt)
[2026-05-30T11:35:48.123Z] INFO: İzin talebi oluşturuldu: can.demir@seedhr.com.tr
[2026-05-30T12:45:10.456Z] INFO: Performans değerlendirmesi gönderildi
[2026-05-30T13:20:33.789Z] WARN: API yanıt süresi 2.5 saniye (Beklenen: <1s)
[2026-05-30T14:10:55.012Z] ERROR: Belge yükleme başarısız: user_can (Dosya boyutu çok büyük)
[2026-05-30T15:00:12.345Z] INFO: Sistem yedeklemesi başladı
[2026-05-30T15:15:44.678Z] INFO: Sistem yedeklemesi tamamlandı (2048 MB)
[2026-05-30T16:30:27.901Z] INFO: Duyuru yayınlandı: Q2 Performans Değerlendirme
[2026-05-30T17:45:50.234Z] INFO: Günlük raporlar oluşturuldu`;
        return mockContent.split('\n').slice(0, lines).join('\n');
      }
    );
  },
  deleteFile: async (fileName: string): Promise<ApiResponse<boolean>> => {
    return wrapApiCall(
      () => api.delete(`/logs/files/${fileName}`),
      () => {
        return true;
      },
      "Günlük dosyası silindi"
    );
  }
};

export const assetAPI = {
  getAll: async (type?: string, status?: string): Promise<ApiResponse<AssetDto[]>> => {
    return wrapApiCall(
      () => api.get(`/assets?type=${type || ""}&status=${status || ""}`),
      () => {
        let list = mockDb.assets;
        if (type) list = list.filter(a => a.type === type);
        if (status) list = list.filter(a => a.status === status);
        return list;
      }
    );
  },
  getById: async (id: string): Promise<ApiResponse<AssetDto>> => {
    return wrapApiCall(
      () => api.get(`/assets/${id}`),
      () => mockDb.assets.find(a => a.id === id)!
    );
  },
  create: async (data: any): Promise<ApiResponse<AssetDto>> => {
    return wrapApiCall(
      () => api.post("/assets", data),
      () => {
        const newAsset: AssetDto = {
          ...data,
          id: "asset_" + Date.now(),
          status: "Available"
        };
        mockDb.assets = [...mockDb.assets, newAsset];
        return newAsset;
      },
      "Zimmet Varlığı Eklendi"
    );
  },
  update: async (id: string, data: any): Promise<ApiResponse<AssetDto>> => {
    return wrapApiCall(
      () => api.put(`/assets/${id}`, data),
      () => {
        mockDb.assets = mockDb.assets.map(a => a.id === id ? { ...a, ...data } : a);
        return mockDb.assets.find(a => a.id === id)!;
      },
      "Zimmet Varlığı Güncellendi"
    );
  },
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    return wrapApiCall(
      () => api.delete(`/assets/${id}`),
      () => {
        mockDb.assets = mockDb.assets.filter(a => a.id !== id);
        return true;
      },
      "Zimmet Varlığı Silindi"
    );
  },
  allocate: async (id: string, data: any): Promise<ApiResponse<AssetDto>> => {
    return wrapApiCall(
      () => api.post(`/assets/${id}/allocate`, data),
      () => {
        const user = mockDb.users.find(u => u.id === data.userId)!;
        let updated: AssetDto | null = null;
        mockDb.assets = mockDb.assets.map(a => {
          if (a.id === id) {
            updated = {
              ...a,
              status: "Assigned",
              currentAssigneeId: data.userId,
              currentAssigneeName: user.fullName,
              assignmentDate: new Date().toISOString()
            };
            return updated;
          }
          return a;
        });
        return updated!;
      },
      "Zimmet Ataması Yapıldı"
    );
  },
  return: async (id: string, condition?: string): Promise<ApiResponse<AssetDto>> => {
    return wrapApiCall(
      () => api.post(`/assets/${id}/return?condition=${condition || ""}`),
      () => {
        let updated: AssetDto | null = null;
        mockDb.assets = mockDb.assets.map(a => {
          if (a.id === id) {
            updated = {
              ...a,
              status: "Available",
              currentAssigneeId: undefined,
              currentAssigneeName: undefined,
              assignmentDate: undefined,
              condition: condition || a.condition
            };
            return updated;
          }
          return a;
        });
        return updated!;
      },
      "Zimmet İade Alındı"
    );
  },
  getByUser: async (userId: string): Promise<ApiResponse<AssetDto[]>> => {
    return wrapApiCall(
      () => api.get(`/assets/user/${userId}`),
      () => mockDb.assets.filter(a => a.currentAssigneeId === userId)
    );
  },
  getReport: async (): Promise<ApiResponse<AssetReportDto[]>> => {
    return wrapApiCall(
      () => api.get("/assets/report"),
      () => {
        return mockDb.departments.map(dept => {
          const deptAssets = mockDb.assets.filter(a => {
            if (a.currentAssigneeId) {
              const u = mockDb.users.find(user => user.id === a.currentAssigneeId);
              return u?.departmentId === dept.id;
            }
            return false;
          });
          return {
            departmentId: dept.id,
            departmentName: dept.name,
            totalAssetsAllocated: deptAssets.length,
            totalValue: deptAssets.reduce((sum, a) => sum + a.purchasePrice, 0),
            allocatedAssets: deptAssets
          };
        }).filter(r => r.totalAssetsAllocated > 0);
      }
    );
  },
  getSummary: async (): Promise<ApiResponse<AssetInventoryDto>> => {
    return wrapApiCall(
      () => api.get("/assets/summary"),
      () => {
        const assets = mockDb.assets;
        const countByType: Record<string, number> = {};
        assets.forEach(a => {
          countByType[a.type] = (countByType[a.type] || 0) + 1;
        });
        return {
          totalAssets: assets.length,
          availableAssets: assets.filter(a => a.status === "Available").length,
          assignedAssets: assets.filter(a => a.status === "Assigned").length,
          brokenAssets: assets.filter(a => a.status === "Broken").length,
          returnedAssets: assets.filter(a => a.status === "Returned").length,
          totalInventoryValue: assets.reduce((sum, a) => sum + a.purchasePrice, 0),
          countByType
        };
      }
    );
  }
};

export const onboardingAPI = {
  getPlans: async (): Promise<ApiResponse<OnboardingPlanDto[]>> => {
    return wrapApiCall(
      () => api.get("/onboarding/plans"),
      () => mockDb.onboardingPlans
    );
  },
  createPlan: async (data: any): Promise<ApiResponse<OnboardingPlanDto>> => {
    return wrapApiCall(
      () => api.post("/onboarding/plans", data),
      () => {
        const dept = mockDb.departments.find(d => d.id === data.departmentId);
        const pos = mockDb.positions.find(p => p.id === data.positionId);
        const newPlan: OnboardingPlanDto = {
          ...data,
          id: "plan_" + Date.now(),
          departmentName: dept?.name,
          positionTitle: pos?.title,
          status: "Active",
          tasks: (data.tasks || []).map((t: any, i: number) => ({
            ...t,
            id: `task_${Date.now()}_${i}`,
            order: t.order || i + 1
          }))
        };
        mockDb.onboardingPlans = [...mockDb.onboardingPlans, newPlan];
        return newPlan;
      },
      "Onboarding Planı Oluşturuldu"
    );
  },
  start: async (userId: string, planId: string): Promise<ApiResponse<OnboardingProgressDto>> => {
    return wrapApiCall(
      () => api.post(`/onboarding/start?userId=${userId}&planId=${planId}`),
      () => {
        const user = mockDb.users.find(u => u.id === userId)!;
        const plan = mockDb.onboardingPlans.find(p => p.id === planId)!;

        // Check for existing active
        const existing = mockDb.onboardingInstances.find(oi => oi.userId === userId && oi.status === "In Progress");
        if (existing) return existing;

        const newInstance: OnboardingProgressDto = {
          instanceId: "inst_" + Date.now(),
          userId,
          userName: user.fullName,
          planId,
          planName: plan.name,
          startDate: new Date().toISOString(),
          status: "In Progress",
          progressPercentage: 0,
          tasks: plan.tasks.map(t => ({
            taskId: t.id,
            title: t.title,
            description: t.description,
            category: t.category,
            dueDay: t.dueDay,
            assignedToRole: t.assignedToRole,
            isMandatory: t.isMandatory,
            completionStatus: "Pending"
          }))
        };
        mockDb.onboardingInstances = [newInstance, ...mockDb.onboardingInstances];
        return newInstance;
      },
      "Onboarding Süreci Başlatıldı"
    );
  },
  getProgress: async (userId: string): Promise<ApiResponse<OnboardingProgressDto>> => {
    return wrapApiCall(
      () => api.get(`/onboarding/progress/user/${userId}`),
      () => {
        const progress = mockDb.onboardingInstances.find(oi => oi.userId === userId);
        if (!progress) {
          throw new Error("Onboarding progress not found");
        }
        return progress;
      }
    );
  },
  completeTask: async (taskId: string, data: any): Promise<ApiResponse<OnboardingProgressDto>> => {
    // Note: since mock is client side, we complete the active user's task
    return wrapApiCall(
      () => api.post(`/onboarding/task/${taskId}/complete`, data),
      () => {
        const currentUser = authAPI.getCurrentUser()!;
        let instance = mockDb.onboardingInstances.find(oi => oi.userId === currentUser.id && oi.status === "In Progress");
        if (!instance) {
          instance = mockDb.onboardingInstances.find(oi => oi.status === "In Progress"); // fallback to first active for mock demo
        }
        if (!instance) throw new Error("Active onboarding instance not found");

        instance.tasks = instance.tasks.map(t => {
          if (t.taskId === taskId) {
            return {
              ...t,
              completionStatus: "Completed",
              completionDate: new Date().toISOString(),
              evidenceUrl: data.evidenceUrl
            };
          }
          return t;
        });

        const completed = instance.tasks.filter(t => t.completionStatus === "Completed").length;
        instance.progressPercentage = Math.round((completed / instance.tasks.length) * 100);
        if (instance.progressPercentage >= 100) {
          instance.status = "Completed";
          instance.completionDate = new Date().toISOString();
        }

        mockDb.onboardingInstances = mockDb.onboardingInstances.map(oi => oi.instanceId === instance!.instanceId ? instance! : oi);
        return instance;
      },
      "Görev Tamamlandı"
    );
  },
  getActive: async (): Promise<ApiResponse<OnboardingProgressDto[]>> => {
    return wrapApiCall(
      () => api.get("/onboarding/active"),
      () => mockDb.onboardingInstances.filter(oi => oi.status === "In Progress")
    );
  },
  sendReminders: async (): Promise<ApiResponse<boolean>> => {
    return wrapApiCall(
      () => api.post("/onboarding/send-reminders"),
      () => true,
      "Geciken görev hatırlatmaları gönderildi"
    );
  }
};

export const lmsAPI = {
  getCourses: async (): Promise<ApiResponse<CourseDto[]>> => {
    return wrapApiCall(
      () => api.get("/lms/courses"),
      () => mockDb.courses
    );
  },
  getCourseById: async (id: string): Promise<ApiResponse<CourseDto>> => {
    return wrapApiCall(
      () => api.get(`/lms/courses/${id}`),
      () => mockDb.courses.find(c => c.id === id)!
    );
  },
  createCourse: async (data: any): Promise<ApiResponse<CourseDto>> => {
    return wrapApiCall(
      () => api.post("/lms/courses", data),
      () => {
        const newCourse: CourseDto = {
          ...data,
          id: "course_" + Date.now(),
          isActive: true
        };
        mockDb.courses = [...mockDb.courses, newCourse];
        return newCourse;
      },
      "Eğitim Programı Oluşturuldu"
    );
  },
  deleteCourse: async (id: string): Promise<ApiResponse<boolean>> => {
    return wrapApiCall(
      () => api.delete(`/lms/courses/${id}`),
      () => {
        mockDb.courses = mockDb.courses.filter(c => c.id !== id);
        return true;
      },
      "Eğitim Programı Silindi"
    );
  },
  assignCourse: async (data: any): Promise<ApiResponse<CourseAssignmentDto>> => {
    return wrapApiCall(
      () => api.post("/lms/assignments", data),
      () => {
        const user = mockDb.users.find(u => u.id === data.userId)!;
        const course = mockDb.courses.find(c => c.id === data.courseId)!;
        const newAssignment: CourseAssignmentDto = {
          id: "assign_" + Date.now(),
          courseId: data.courseId,
          course,
          userId: data.userId,
          userFullName: user.fullName,
          assignedBy: "user_hr",
          assignedByFullName: "Ayşe Kaya",
          assignedDate: new Date().toISOString(),
          status: "Assigned"
        };
        mockDb.courseAssignments = [...mockDb.courseAssignments, newAssignment];
        return newAssignment;
      },
      "Eğitim Çalışana Atandı"
    );
  },
  completeCourse: async (id: string, certificateUrl?: string): Promise<ApiResponse<CourseAssignmentDto>> => {
    return wrapApiCall(
      () => api.post(`/lms/assignments/${id}/complete?certificateUrl=${certificateUrl || ""}`),
      () => {
        let updated: CourseAssignmentDto | null = null;
        mockDb.courseAssignments = mockDb.courseAssignments.map(a => {
          if (a.id === id) {
            updated = {
              ...a,
              status: "Completed",
              completedDate: new Date().toISOString(),
              certificateUrl: certificateUrl || "https://example.com/certificate.pdf"
            };
            return updated;
          }
          return a;
        });
        return updated!;
      },
      "Eğitim Tamamlandı Olarak İşaretlendi"
    );
  },
  getUserAssignments: async (userId: string): Promise<ApiResponse<CourseAssignmentDto[]>> => {
    return wrapApiCall(
      () => api.get(`/lms/assignments/user/${userId}`),
      () => mockDb.courseAssignments.filter(a => a.userId === userId)
    );
  },
  getCourseAssignments: async (courseId: string): Promise<ApiResponse<CourseAssignmentDto[]>> => {
    return wrapApiCall(
      () => api.get(`/lms/assignments/course/${courseId}`),
      () => mockDb.courseAssignments.filter(a => a.courseId === courseId)
    );
  },
  getAllAssignments: async (): Promise<ApiResponse<CourseAssignmentDto[]>> => {
    return wrapApiCall(
      () => api.get("/lms/assignments/all"),
      () => mockDb.courseAssignments
    );
  }
};

export const performance360API = {
  createCompetencyForm: async (data: any): Promise<ApiResponse<CompetencyFormDto>> => {
    return wrapApiCall(
      () => api.post("/performance/competency-forms", data),
      () => {
        const newForm: CompetencyFormDto = {
          ...data,
          id: "comp_form_" + Date.now(),
          competencies: (data.competencies || []).map((c: any, idx: number) => ({
            ...c,
            id: c.id || `comp_item_${Date.now()}_${idx}`
          }))
        };
        mockDb.competencyForms = [...mockDb.competencyForms, newForm];
        return newForm;
      },
      "Değerlendirme Şablonu Sihirbazı Kaydedildi"
    );
  },
  getCompetencyFormById: async (id: string): Promise<ApiResponse<CompetencyFormDto>> => {
    return wrapApiCall(
      () => api.get(`/performance/competency-forms/${id}`),
      () => mockDb.competencyForms.find(f => f.id === id)!
    );
  },
  getCompetencyForms: async (departmentId?: string): Promise<ApiResponse<CompetencyFormDto[]>> => {
    return wrapApiCall(
      () => api.get(`/performance/competency-forms${departmentId ? "?departmentId=" + departmentId : ""}`),
      () => departmentId ? mockDb.competencyForms.filter(f => f.departmentId === departmentId) : mockDb.competencyForms
    );
  },
  create360Request: async (data: any): Promise<ApiResponse<Evaluation360Dto>> => {
    return wrapApiCall(
      () => api.post("/performance/360-requests", data),
      () => {
        const emp = mockDb.users.find(u => u.id === data.employeeId)!;
        const evalr = mockDb.users.find(u => u.id === data.evaluatorId)!;
        const form = mockDb.competencyForms.find(f => f.id === data.competencyFormId)!;
        const newEval: Evaluation360Dto = {
          id: "eval360_" + Date.now(),
          employeeId: data.employeeId,
          employeeName: emp.fullName,
          evaluatorId: data.evaluatorId,
          evaluatorName: evalr.fullName,
          evaluatorType: data.evaluatorType,
          competencyFormId: data.competencyFormId,
          competencyFormTitle: form.title,
          scores: {},
          status: "Draft",
          period: data.period,
          createdAt: new Date().toISOString()
        };
        mockDb.evaluations360 = [...mockDb.evaluations360, newEval];
        return newEval;
      },
      "360° Değerlendirme Talebi Gönderildi"
    );
  },
  submit360Scores: async (id: string, data: any): Promise<ApiResponse<Evaluation360Dto>> => {
    return wrapApiCall(
      () => api.post(`/performance/360-evaluations/${id}/submit`, data),
      () => {
        let updated: Evaluation360Dto | null = null;
        mockDb.evaluations360 = mockDb.evaluations360.map(ev => {
          if (ev.id === id) {
            updated = {
              ...ev,
              scores: data.scores,
              feedback: data.feedback,
              status: "Submitted",
              updatedAt: new Date().toISOString()
            };
            return updated;
          }
          return ev;
        });
        return updated!;
      },
      "Değerlendirme Girişiniz Kaydedildi"
    );
  },
  get360EvaluationsForEmployee: async (employeeId: string, period: string): Promise<ApiResponse<Evaluation360Dto[]>> => {
    return wrapApiCall(
      () => api.get(`/performance/360-evaluations/employee/${employeeId}?period=${period}`),
      () => mockDb.evaluations360.filter(ev => ev.employeeId === employeeId && ev.period === period)
    );
  },
  get360EvaluationsByEvaluator: async (evaluatorId: string): Promise<ApiResponse<Evaluation360Dto[]>> => {
    return wrapApiCall(
      () => api.get(`/performance/360-evaluations/evaluator/${evaluatorId}`),
      () => mockDb.evaluations360.filter(ev => ev.evaluatorId === evaluatorId)
    );
  },
  get360EvaluationById: async (id: string): Promise<ApiResponse<Evaluation360Dto>> => {
    return wrapApiCall(
      () => api.get(`/performance/360-evaluations/${id}`),
      () => mockDb.evaluations360.find(ev => ev.id === id)!
    );
  }
};

export const recruitmentReferenceAPI = {
  createReferenceCheck: async (candidateId: string, data: any): Promise<ApiResponse<ReferenceCheckDto>> => {
    return wrapApiCall(
      () => api.post(`/recruitment/candidates/${candidateId}/references`, data),
      () => {
        const cand = mockDb.candidates.find(c => c.id === candidateId)!;
        const newRef: ReferenceCheckDto = {
          ...data,
          id: "ref_" + Date.now(),
          candidateId,
          candidateName: cand.fullName || `${cand.firstName} ${cand.lastName}`,
          status: "Sent",
          scores: {},
          createdAt: new Date().toISOString()
        };
        mockDb.referenceChecks = [...mockDb.referenceChecks, newRef];
        return newRef;
      },
      "Referans Kontrol İstemi Başlatıldı"
    );
  },
  submitReferenceFeedback: async (referenceId: string, data: any): Promise<ApiResponse<ReferenceCheckDto>> => {
    return wrapApiCall(
      () => api.post(`/recruitment/references/${referenceId}/feedback`, data),
      () => {
        let updated: ReferenceCheckDto | null = null;
        mockDb.referenceChecks = mockDb.referenceChecks.map(r => {
          if (r.id === referenceId) {
            updated = {
              ...r,
              verificationNotes: data.verificationNotes,
              scores: data.scores,
              comments: data.comments,
              status: "Completed"
            };
            return updated;
          }
          return r;
        });
        return updated!;
      },
      "Referans Geri Bildirimi Kaydedildi"
    );
  },
  getReferencesForCandidate: async (candidateId: string): Promise<ApiResponse<ReferenceCheckDto[]>> => {
    return wrapApiCall(
      () => api.get(`/recruitment/candidates/${candidateId}/references`),
      () => mockDb.referenceChecks.filter(r => r.candidateId === candidateId)
    );
  },
  getReferenceById: async (id: string): Promise<ApiResponse<ReferenceCheckDto>> => {
    return wrapApiCall(
      () => api.get(`/recruitment/references/${id}`),
      () => mockDb.referenceChecks.find(r => r.id === id)!
    );
  }
};

// ---- Phase 6: Finance & Saha APIs ----

export const payrollAPI = {
  getAll: async (period?: string): Promise<ApiResponse<PayrollDto[]>> => {
    return wrapApiCall(
      () => api.get(`/payrolls${period ? `?period=${period}` : ""}`),
      () => period ? mockDb.payrolls.filter(p => p.period === period) : mockDb.payrolls
    );
  },
  getByUser: async (userId: string): Promise<ApiResponse<PayrollDto[]>> => {
    return wrapApiCall(
      () => api.get(`/payrolls/user/${userId}`),
      () => mockDb.payrolls.filter(p => p.userId === userId)
    );
  },
  create: async (data: any): Promise<ApiResponse<PayrollDto>> => {
    return wrapApiCall(
      () => api.post("/payrolls", data),
      () => {
        const user = mockDb.users.find(u => u.id === data.userId)!;
        const tax = Math.round(data.baseSalary * 0.2);
        const netSalary = data.baseSalary + (data.overtime || 0) + (data.bonus || 0) - (data.deductions || 0) - tax;
        const newPayroll: PayrollDto = {
          ...data,
          id: "payroll_" + Date.now(),
          userName: user.fullName,
          departmentName: user.departmentName || "",
          tax,
          netSalary,
          status: "Calculated",
          createdAt: new Date().toISOString()
        };
        mockDb.payrolls = [newPayroll, ...mockDb.payrolls];
        return newPayroll;
      },
      "Bordro Kaydı Oluşturuldu"
    );
  },
  approve: async (id: string): Promise<ApiResponse<PayrollDto>> => {
    return wrapApiCall(
      () => api.post(`/payrolls/${id}/approve`),
      () => {
        let updated: PayrollDto | null = null;
        mockDb.payrolls = mockDb.payrolls.map(p => {
          if (p.id === id) {
            updated = { ...p, status: "Approved" };
            return updated;
          }
          return p;
        });
        return updated!;
      },
      "Bordro Onaylandı"
    );
  },
  pay: async (id: string): Promise<ApiResponse<PayrollDto>> => {
    return wrapApiCall(
      () => api.post(`/payrolls/${id}/pay`),
      () => {
        let updated: PayrollDto | null = null;
        mockDb.payrolls = mockDb.payrolls.map(p => {
          if (p.id === id) {
            updated = { ...p, status: "Paid", paymentDate: new Date().toISOString().split("T")[0] };
            return updated;
          }
          return p;
        });
        return updated!;
      },
      "Ödeme Gerçekleştirildi"
    );
  }
};

export const expenseAPI = {
  getAll: async (): Promise<ApiResponse<ExpenseRequestDto[]>> => {
    return wrapApiCall(
      () => api.get("/expenses"),
      () => mockDb.expenses
    );
  },
  getByUser: async (userId: string): Promise<ApiResponse<ExpenseRequestDto[]>> => {
    return wrapApiCall(
      () => api.get(`/expenses/user/${userId}`),
      () => mockDb.expenses.filter(e => e.userId === userId)
    );
  },
  create: async (data: any): Promise<ApiResponse<ExpenseRequestDto>> => {
    return wrapApiCall(
      () => api.post("/expenses", data),
      () => {
        const user = mockDb.users.find(u => u.id === data.userId)!;
        const newExpense: ExpenseRequestDto = {
          ...data,
          id: "exp_" + Date.now(),
          userName: user.fullName,
          departmentName: user.departmentName || "",
          currency: data.currency || "TRY",
          status: "Pending",
          createdAt: new Date().toISOString()
        };
        mockDb.expenses = [newExpense, ...mockDb.expenses];
        return newExpense;
      },
      "Harcama Talebi Oluşturuldu"
    );
  },
  approve: async (id: string, approverId: string): Promise<ApiResponse<ExpenseRequestDto>> => {
    return wrapApiCall(
      () => api.post(`/expenses/${id}/approve`, { approverId }),
      () => {
        const approver = mockDb.users.find(u => u.id === approverId)!;
        let updated: ExpenseRequestDto | null = null;
        mockDb.expenses = mockDb.expenses.map(e => {
          if (e.id === id) {
            updated = { ...e, status: "Approved", approvedBy: approverId, approvedByName: approver.fullName, approvedDate: new Date().toISOString() };
            return updated;
          }
          return e;
        });
        return updated!;
      },
      "Harcama Talebi Onaylandı"
    );
  },
  reject: async (id: string, reason: string): Promise<ApiResponse<ExpenseRequestDto>> => {
    return wrapApiCall(
      () => api.post(`/expenses/${id}/reject`, { reason }),
      () => {
        let updated: ExpenseRequestDto | null = null;
        mockDb.expenses = mockDb.expenses.map(e => {
          if (e.id === id) {
            updated = { ...e, status: "Rejected", rejectionReason: reason };
            return updated;
          }
          return e;
        });
        return updated!;
      },
      "Harcama Talebi Reddedildi"
    );
  }
};

export const shiftAPI = {
  getAll: async (date?: string): Promise<ApiResponse<EmployeeShiftDto[]>> => {
    return wrapApiCall(
      () => api.get(`/employee-shifts${date ? `?date=${date}` : ""}`),
      () => date ? mockDb.shifts.filter(s => s.date === date) : mockDb.shifts
    );
  },
  getByUser: async (userId: string): Promise<ApiResponse<EmployeeShiftDto[]>> => {
    return wrapApiCall(
      () => api.get(`/employee-shifts/user/${userId}`),
      () => mockDb.shifts.filter(s => s.userId === userId)
    );
  },
  create: async (data: any): Promise<ApiResponse<EmployeeShiftDto>> => {
    return wrapApiCall(
      () => api.post("/employee-shifts", data),
      () => {
        const user = mockDb.users.find(u => u.id === data.userId)!;
        const newShift: EmployeeShiftDto = {
          ...data,
          id: "shift_" + Date.now(),
          userName: user.fullName,
          departmentName: user.departmentName || "",
          status: "Planned"
        };
        mockDb.shifts = [...mockDb.shifts, newShift];
        return newShift;
      },
      "Vardiya Planlandı"
    );
  },
  update: async (id: string, data: any): Promise<ApiResponse<EmployeeShiftDto>> => {
    return wrapApiCall(
      () => api.put(`/employee-shifts/${id}`, data),
      () => {
        mockDb.shifts = mockDb.shifts.map(s => s.id === id ? { ...s, ...data } : s);
        return mockDb.shifts.find(s => s.id === id)!;
      },
      "Vardiya Güncellendi"
    );
  },
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    return wrapApiCall(
      () => api.delete(`/employee-shifts/${id}`),
      () => {
        mockDb.shifts = mockDb.shifts.filter(s => s.id !== id);
        return true;
      },
      "Vardiya Silindi"
    );
  }
};

export const visitorAPI = {
  getAll: async (): Promise<ApiResponse<VisitorLogDto[]>> => {
    return wrapApiCall(
      () => api.get("/visitors"),
      () => mockDb.visitors
    );
  },
  getActive: async (): Promise<ApiResponse<VisitorLogDto[]>> => {
    return wrapApiCall(
      () => api.get("/visitors/active"),
      () => mockDb.visitors.filter(v => v.status === "CheckedIn" || v.status === "Expected")
    );
  },
  checkIn: async (data: any): Promise<ApiResponse<VisitorLogDto>> => {
    return wrapApiCall(
      () => api.post("/visitors/checkin", data),
      () => {
        const host = mockDb.users.find(u => u.id === data.hostUserId)!;
        const newVisitor: VisitorLogDto = {
          ...data,
          id: "visitor_" + Date.now(),
          hostUserName: host.fullName,
          checkInTime: new Date().toISOString(),
          badgeNumber: "V-" + String(mockDb.visitors.length + 1).padStart(3, "0"),
          status: "CheckedIn"
        };
        mockDb.visitors = [newVisitor, ...mockDb.visitors];
        return newVisitor;
      },
      "Ziyaretçi Giriş Kaydı Oluşturuldu"
    );
  },
  checkOut: async (id: string): Promise<ApiResponse<VisitorLogDto>> => {
    return wrapApiCall(
      () => api.post(`/visitors/${id}/checkout`),
      () => {
        let updated: VisitorLogDto | null = null;
        mockDb.visitors = mockDb.visitors.map(v => {
          if (v.id === id) {
            updated = { ...v, status: "CheckedOut", checkOutTime: new Date().toISOString() };
            return updated;
          }
          return v;
        });
        return updated!;
      },
      "Ziyaretçi Çıkış Kaydedildi"
    );
  }
};

// ---- Phase 5: AI APIs ----

const AI_HR_KNOWLEDGE_BASE = `
SeedHR Şirket Politikaları ve İK Bilgi Tabanı:
- Yıllık izin hakkı: 14 gün (kıdemle artar)
- Mazeret izni: 5 gün
- Hastalık izni: 10 gün (rapor ile)
- Çalışma saatleri: 09:00 - 18:00 (esnek, ±1 saat)
- Uzaktan çalışma: Haftada 3 gün (Yaz dönemi), 2 gün (kış dönemi)
- Fazla mesai ücreti: Saatlik ücretin 1.5 katı
- SGK ve vergi kesintileri otomatik hesaplanır
- Performans değerlendirmesi: Üç ayda bir (Q1, Q2, Q3, Q4)
- Eğitim bütçesi: Kişi başı yıllık 15.000 TL
- İSG eğitimi: Yılda 1 kez zorunlu
- KVKK eğitimi: İşe girişte zorunlu
- Yemek kartı: Günlük 150 TL (Sodexo / Multinet)
- Servis: İstanbul Anadolu ve Avrupa yakası
- Özel sağlık sigortası: Çalışan + eş + çocuklar
- Performans bonusu: Q sonuçlarına göre %5-15 arası
- Terfi süreci: Yılda 1 kez, Ocak ayında değerlendirilir
- İşten ayrılma bildirimi: Minimum 30 gün önceden
`;

export const aiAPI = {
  chat: async (message: string): Promise<ApiResponse<{ reply: string }>> => {
    return wrapApiCall(
      () => api.post("/ai/chat", { message }),
      () => {
        // Local smart fallback with keyword matching
        const msg = message.toLowerCase();
        let reply = "";

        if (msg.includes("izin") || msg.includes("tatil") || msg.includes("off")) {
          reply = "📋 **İzin Politikası:**\n\n• **Yıllık İzin:** 14 gün (kıdem ile artar)\n• **Mazeret İzni:** 5 gün\n• **Hastalık İzni:** 10 gün (rapor gerekli)\n\nİzin talebinizi sol menüdeki 'İzin Yönetimi' sekmesinden oluşturabilirsiniz.";
        } else if (msg.includes("maaş") || msg.includes("bordro") || msg.includes("ücret") || msg.includes("maas")) {
          reply = "💰 **Bordro Bilgileri:**\n\nBordro hesaplamaları her ayın 25'inde yapılır. Net maaşınız brüt maaştan SGK primi (%14) ve gelir vergisi (%15-40 dilim) düşülerek hesaplanır.\n\nDetaylı bordro bilginize 'Finans & Bordro' sekmesinden ulaşabilirsiniz.";
        } else if (msg.includes("performans") || msg.includes("değerlendirme") || msg.includes("hedef")) {
          reply = "🎯 **Performans Sistemi:**\n\n• Değerlendirme periyodu: Çeyreklik (Q1-Q4)\n• 360° değerlendirme: Yönetici, eş düzey ve öz değerlendirme\n• Hedef ağırlıkları belirlenebilir\n• Performans bonusu: %5-15 arası\n\nDetaylar için 'Performans' sekmesine göz atın.";
        } else if (msg.includes("eğitim") || msg.includes("kurs") || msg.includes("sertifika")) {
          reply = "📚 **Eğitim & Gelişim:**\n\n• Kişi başı yıllık bütçe: 15.000 TL\n• Zorunlu eğitimler: İSG, KVKK, Siber Güvenlik\n• Online ve sınıf içi eğitim seçenekleri\n• Sertifika takibi sistem üzerinden yapılır\n\nAktif eğitimlerinizi 'Performans > Eğitim' sekmesinden görebilirsiniz.";
        } else if (msg.includes("uzaktan") || msg.includes("remote") || msg.includes("hibrit") || msg.includes("evden")) {
          reply = "🏠 **Uzaktan Çalışma Politikası:**\n\n• Yaz dönemi (Haziran-Ağustos): Haftada 3 gün uzaktan\n• Kış dönemi: Haftada 2 gün uzaktan\n• Çalışma saatleri: 09:00-18:00 (esnek ±1 saat)\n• VPN erişimi zorunludur";
        } else if (msg.includes("servis") || msg.includes("yol") || msg.includes("ulaşım")) {
          reply = "🚌 **Ulaşım:**\n\n• Şirket servisi İstanbul Anadolu ve Avrupa yakasında mevcuttur\n• Servis saatleri: Sabah 07:30-08:30, Akşam 18:00-19:00\n• Güzergah bilgileri İdari İşler departmanından alınabilir";
        } else if (msg.includes("sigorta") || msg.includes("sağlık")) {
          reply = "🏥 **Sağlık Sigortası:**\n\n• Özel sağlık sigortası kapsamı: Çalışan + eş + çocuklar\n• Anlaşmalı hastaneler listesi İK departmanından temin edilebilir\n• Göz ve diş tedavisi dahildir";
        } else {
          reply = `Merhaba! 👋 Ben SeedHR Yapay Zeka Asistanınızım.\n\nSize şu konularda yardımcı olabilirim:\n• 📋 İzin politikaları\n• 💰 Bordro ve maaş bilgileri\n• 🎯 Performans değerlendirme\n• 📚 Eğitim programları\n• 🏠 Uzaktan çalışma kuralları\n• 🚌 Servis ve ulaşım\n• 🏥 Sağlık sigortası\n\nLütfen bir konu hakkında soru sorun!`;
        }

        // Save to chat history
        const userMsg: AiChatMessage = { id: "msg_" + Date.now(), role: "user", content: message, timestamp: new Date().toISOString() };
        const assistantMsg: AiChatMessage = { id: "msg_" + (Date.now() + 1), role: "assistant", content: reply, timestamp: new Date().toISOString() };
        mockDb.aiChatHistory = [...mockDb.aiChatHistory, userMsg, assistantMsg];

        return { reply };
      }
    );
  },
  getChatHistory: async (): Promise<ApiResponse<AiChatMessage[]>> => {
    return wrapApiCall(
      () => api.get("/ai/chat/history"),
      () => mockDb.aiChatHistory
    );
  },
  getInterviewQuestions: async (position: string, department: string): Promise<ApiResponse<AiInterviewQuestion[]>> => {
    return wrapApiCall(
      () => api.post("/ai/interview-questions", { position, department }),
      () => {
        // Local fallback - curated questions by department type
        const techQuestions: AiInterviewQuestion[] = [
          { question: "SOLID prensiplerini açıklayın ve bir projede nasıl uyguladığınıza dair örnek verin.", category: "Teknik", difficulty: "Medium" },
          { question: "Microservices mimarisinin monolitik yapıya göre avantaj ve dezavantajları nelerdir?", category: "Mimari", difficulty: "Hard" },
          { question: "REST API tasarımında en iyi uygulamalar nelerdir?", category: "Teknik", difficulty: "Medium" },
          { question: "Git branching stratejileri hakkında bilginiz nedir? GitFlow vs Trunk-based development karşılaştırması yapın.", category: "DevOps", difficulty: "Easy" },
          { question: "Bir üretim ortamında performans darboğazı tespit ettiğinizde nasıl bir yaklaşım izlersiniz?", category: "Problem Çözme", difficulty: "Hard" },
        ];

        const hrQuestions: AiInterviewQuestion[] = [
          { question: "Çalışan bağlılığını artırmak için hangi stratejileri uygularsınız?", category: "İK Yönetimi", difficulty: "Medium" },
          { question: "İşe alım sürecinde adayı en iyi değerlendirme yöntemleri nelerdir?", category: "İşe Alım", difficulty: "Easy" },
          { question: "KVKK kapsamında İK departmanının sorumlulukları nelerdir?", category: "Hukuk", difficulty: "Hard" },
          { question: "Performans değerlendirme sistemleri hakkında deneyimlerinizi paylaşır mısınız?", category: "Performans", difficulty: "Medium" },
          { question: "Çatışma yönetimi konusunda bir örnek verin.", category: "Soft Skills", difficulty: "Easy" },
        ];

        const generalQuestions: AiInterviewQuestion[] = [
          { question: "Son işinizde karşılaştığınız en büyük zorluk neydi ve nasıl aştınız?", category: "Deneyim", difficulty: "Easy" },
          { question: "5 yıl sonra kendinizi nerede görüyorsunuz?", category: "Kariyer Hedefleri", difficulty: "Easy" },
          { question: "Takım çalışmasında yaşadığınız bir başarı hikayesini paylaşır mısınız?", category: "Takım Çalışması", difficulty: "Medium" },
          { question: "Stresli bir iş ortamında nasıl başa çıkarsınız?", category: "Stres Yönetimi", difficulty: "Medium" },
          { question: "Bu pozisyon için sizi diğer adaylardan ayıran özellikleriniz nelerdir?", category: "Motivasyon", difficulty: "Easy" },
        ];

        const dept = department.toLowerCase();
        if (dept.includes("bilgi") || dept.includes("yazılım") || dept.includes("it") || dept.includes("teknoloji")) {
          return [...techQuestions, ...generalQuestions.slice(0, 2)];
        } else if (dept.includes("insan") || dept.includes("ik") || dept.includes("hr")) {
          return [...hrQuestions, ...generalQuestions.slice(0, 2)];
        }
        return generalQuestions;
      }
    );
  },
  clearHistory: async (): Promise<ApiResponse<boolean>> => {
    return wrapApiCall(
      () => api.delete("/ai/chat/history"),
      () => {
        mockDb.aiChatHistory = [];
        return true;
      },
      "Sohbet Geçmişi Temizlendi"
    );
  }
};
