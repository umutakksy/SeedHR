# SeedHR Backend - Yapı ve Modüller

## 📊 Özet

20 adet Entity, 40+ DTO, 15+ Repository Interface ve 10+ Service Interface ile tam kurumsal HR sistemi.

## 🗂️ Oluşturulan Entity'ler

### Sistem & Yönetim (4)
- **User** - Çalışan ve sistem kullanıcıları
- **Role** - Roller (Admin, Manager, Employee, HR, etc.)
- **Permission** - İzinler (CRUD operations)

### Organizasyon (2)
- **Department** - Departmanlar
- **Position** - Pozisyonlar

### İzin Yönetimi (3)
- **LeaveRequest** - İzin talepleri
- **LeaveBalance** - İzin bakiyeleri
- **LeaveType** - İzin türleri (Yıllık, Mazeret, Hastalık)

### Devamsızlık (2)
- **WorkSchedule** - Çalışma takvimi
- **Attendance** - Devamsızlık kayıtları

### Performans (2)
- **PerformanceGoal** - Performans hedefleri
- **PerformanceEvaluation** - Performans değerlendirmeleri

### İşe Alım (4)
- **JobPosting** - İş ilanları
- **Candidate** - Adaylar
- **CandidateApplication** - Başvurular
- **Interview** - Mülakatlar

### İletişim (2)
- **Announcement** - Duyurular
- **Notification** - Bildirimler

### Diğer (1)
- **Document** - Evraklar (CV, Diploma, Sertifika)

---

## 📝 DTO Kategorileri

### Authentication (2)
- LoginRequest
- LoginResponse

### User Management (3)
- UserDto
- CreateUserRequest
- UpdateUserRequest

### Organization (6)
- DepartmentDto + CreateDepartmentRequest + UpdateDepartmentRequest
- PositionDto + CreatePositionRequest + UpdatePositionRequest

### Leave Management (4)
- LeaveRequestDto
- CreateLeaveRequestRequest
- LeaveApprovalRequest
- LeaveBalanceDto
- LeaveTypeDto

### Dashboard (6)
- DashboardStatisticsDto
- UpcomingBirthdayDto
- UpcomingLeaveDto
- AnnouncementDto

### Recruitment (4)
- CandidateDto + CreateCandidateRequest
- JobPostingDto + CreateJobPostingRequest

### Common (2)
- ApiResponse<T> (Generic)
- PaginatedResponse<T>

---

## 🔌 Repository Pattern

### Base Interface
- **IRepository<T>** - Generic CRUD operations

### Entity Repositories (11)
- IUserRepository (+ spesiyal queries)
- IDepartmentRepository
- IPositionRepository
- ILeaveRequestRepository
- ILeaveBalanceRepository
- ILeaveTypeRepository
- IAttendanceRepository
- IAnnouncementRepository
- ICandidateRepository
- IJobPostingRepository
- INotificationRepository

### UnitOfWork
- **IUnitOfWork** - Tüm repositories'leri yönetir

---

## 🎯 Service Interfaces

### Core Services (10)
1. **IAuthenticationService** - Login, Register, Token Management
2. **IUserService** - Employee/User Management
3. **IDepartmentService** - Department Management
4. **IPositionService** - Position Management
5. **ILeaveService** - Leave Requests & Balances
6. **IAttendanceService** - Check-in/out & Records
7. **IAnnouncementService** - Company Announcements
8. **IRecruitmentService** - Job Postings & Candidates
9. **IDashboardService** - Dashboard Statistics
10. **IEmployeeService** - (placeholder for future)

---

## 🛠️ Teknoloji Stack

- **Framework**: ASP.NET Core 9.0
- **Database**: MongoDB
- **Authentication**: JWT
- **Mapping**: AutoMapper
- **Validation**: FluentValidation
- **Logging**: Serilog
- **API Docs**: Swagger/OpenAPI

---

## 🚀 İlk Adımlar

### 1. MongoDB Kurulum
```bash
# Docker ile MongoDB
docker run -d -p 27017:27017 --name mongodb mongo
```

### 2. Environment Setup
```bash
cp .env.example .env
# .env dosyasında MongoDB bağlantısını güncelleyin
```

### 3. Proje Başlatma
```bash
dotnet restore
dotnet run
```

### 4. Swagger
```
http://localhost:5000/swagger
```

---

## 📋 İmplementasyon Sırası (Tavsiye)

1. **IUserRepository** + **IUserService** - Temel CRUD
2. **IDepartmentRepository** + **IDepartmentService**
3. **IPositionRepository** + **IPositionService**
4. **ILeaveRequestRepository** + **ILeaveService** - Core HR Functionality
5. **IAttendanceService** - Devamsızlık
6. **IDashboardService** - Dashboard Statistics
7. **IAnnouncementService** - Haberler/Duyurular
8. **IRecruitmentService** - İşe Alım
9. Performance Management & Other Services

---

## 🔐 Security Features

- JWT Token-based Authentication
- Role-based Authorization
- Department-based Access Control
- Secure Password Hashing (BCrypt)
- CORS Configuration

---

## 📊 Veritabanı Tasarımı

MongoDB collections:
- users
- departments
- positions
- leaveRequests
- leaveBalances
- leaveTypes
- workSchedules
- attendances
- performanceGoals
- performanceEvaluations
- jobPostings
- candidates
- candidateApplications
- interviews
- announcements
- notifications
- documents
- roles
- permissions

---

## 🎓 Klasör Yapısı

```
backend/
├── src/
│   ├── Models/
│   │   ├── Entities/          # 20 Entity Classes
│   │   └── DTOs/              # 40+ DTO Classes
│   ├── Controllers/            # API Endpoints (TODO)
│   ├── Services/
│   │   ├── Interfaces/        # 10+ Service Interfaces
│   │   └── Implementations/   # TODO
│   ├── Repository/
│   │   ├── Interfaces/        # 11 Repository Interfaces
│   │   └── Implementations/   # TODO
│   ├── Configuration/         # MongoDbSettings
│   ├── Security/              # Auth & Authorization
│   ├── Middleware/            # Custom Middleware
│   ├── Exceptions/            # Custom Exceptions
│   └── Utils/                 # Utilities
├── tests/
│   ├── Unit/
│   └── Integration/
└── Program.cs
```

---

## 📝 Notlar

- Tüm entities **soft delete** için `IsActive` flag'i içerir
- Tüm entities **audit** için `CreatedAt` ve `UpdatedAt` tarihlerine sahiptir
- DTOs çift yönlü mapping için AutoMapper ile hazır
- Tüm exception'lar custom exception classes kullanır
- Repository pattern ile clean architecture uygulanmıştır

---

## ✅ Sonraki Aşama

1. **MongoDB Context** oluşturmak (IMongoDbContext)
2. **Repository Implementations** yazılabilir
3. **Service Implementations** yazılabilir
4. **Controllers** oluşturulabilir
5. **Validators** (FluentValidation) oluşturulabilir
6. **AutoMapper Profiles** oluşturulabilir
7. **Tests** yazılabilir

---

**Hazırlanan**: 30 Mayıs 2026
**Versiyon**: 1.0
**Status**: Yapı Tamamlandı ✅
