# SeedHR - Teknik Dokümantasyon

**Versiyon**: 1.0  
**Son Güncelleme**: 2026-06-05  
**Dokümantasyon Dili**: Türkçe  
**Hedef Kitle**: Yazılım Geliştiricileri, DevOps Mühendisleri, Sistem Mimarları

---

## 📋 İçindekiler

1. [Proje Genel Bakışı](#1-proje-genel-bakışı)
2. [Teknoloji Stack'i](#2-teknoloji-stacki)
3. [Sistem Mimarisi](#3-sistem-mimarisi)
4. [Frontend Mimarisi](#4-frontend-mimarisi)
5. [Backend Mimarisi](#5-backend-mimarisi)
6. [API Dokümantasyonu](#6-api-dokümantasyonu)
7. [Veritabanı Yapısı](#7-veritabanı-yapısı)
8. [Kimlik Doğrulama ve Yetkilendirme](#8-kimlik-doğrulama-ve-yetkilendirme)
9. [Altyapı ve Dağıtım](#9-altyapı-ve-dağıtım)
10. [Güvenlik Mekanizmaları](#10-güvenlik-mekanizmaları)
11. [Geliştirme ve Kurulum Rehberi](#11-geliştirme-ve-kurulum-rehberi)

---

## 1. Proje Genel Bakışı

### 1.1 Proje Amacı

**SeedHR** (Seed Human Resources), kurumsal İnsan Kaynakları yönetimini digital ortamda gerçekleştiren web tabanlı bir yönetim sistemidir.

**Ana İşlevler:**
- ✅ Çalışan bilgileri yönetimi (oluşturma, düzenleme, silme)
- ✅ Departman ve pozisyon hiyerarşisi yönetimi
- ✅ İzin talebi ve onay süreçleri
- ✅ Devam-devamsızlık takibi
- ✅ İşe alım ve recruitment süreci
- ✅ Performans değerlendirmesi
- ✅ Duyuru ve bildirim sistemi
- ✅ Belgeler yönetimi (CV, sertifika vb.)
- ✅ Vardiya ve çalışma takvimi planlaması
- ✅ Sistem logları ve audit trail
- ✅ Kamu (public) kariyer başvuru sayfası

### 1.2 İş Akışları

#### 1.2.1 Çalışan Yönetimi Akışı
```
HR Manager → Sistem Girişi
    ↓
Çalışan Listesi Görüntüleme
    ↓
Yeni Çalışan Ekleme/Düzenleme
    ↓
Departman ve Pozisyon Atama
    ↓
Veritabanında Kayıt Oluşturma
    ↓
Bildirim Gönderme (opsiyonel)
```

#### 1.2.2 İzin Talebi Akışı
```
Çalışan → İzin Talebi Oluşturma
    ↓
Sistem: Izin Bakiyesi Kontrol
    ↓
Yönetici → Onay/Ret Kararı
    ↓
Talep Güncelleme (Approved/Rejected)
    ↓
Bildirim Gönderme
    ↓
İzin Bakiyesi Güncelleme
```

#### 1.2.3 Recruitment Akışı
```
HR → İş İlanı Yayınlama
    ↓
Aday → Başvuru Yapma (Public)
    ↓
Captcha Doğrulaması
    ↓
CV ve Başvuru Bilgisi Kayıt
    ↓
HR: Aday Durumu Güncelleme
    ↓
Mülakat Planlaması
    ↓
AI CV Scoring (Groq API)
```

---

## 2. Teknoloji Stack'i

### 2.1 Frontend Teknolojileri

| Teknoloji | Versiyon | Kullanım Alanı | Neden Seçildi |
|-----------|----------|-----------------|---------------|
| **ASP.NET Core Razor Pages** | 9.0 | Web UI Framework | Server-side rendering, Form işlemleri, SEO |
| **Bootstrap** | 5.x | CSS Framework | Responsive design, Hazır bileşenler |
| **Tailwind CSS** | CDN | Styling | Public sayfalarda custom tasarım |
| **Alpine.js** | 3.x | Interaktivite | Hafif, jQuery alternatifi |
| **FontAwesome** | 6.4 | İkonlar | Çeşitli icon seçenekleri |
| **jQuery** | 3.x | DOM Manipülasyonu | Doğrulama, form işlemleri |
| **Cloudflare Turnstile** | v0 | Captcha | reCAPTCHA alternatifi, daha iyi UX |

### 2.2 Backend Teknolojileri

| Teknoloji | Versiyon | Kullanım Alanı | Neden Seçildi |
|-----------|----------|-----------------|---------------|
| **ASP.NET Core** | 9.0 | Web API Framework | High performance, Cloud-native |
| **C#** | 11+ | Programlama Dili | Type-safe, OOP, LINQ |
| **MongoDB** | 8.2 | Database | NoSQL, Flexible schema, Scale |
| **JWT (JSON Web Tokens)** | - | Authentication | Stateless auth, Microservices ready |
| **Serilog** | 3.x | Logging | Structured logging, Multiple sinks |
| **FluentValidation** | 11.x | Data Validation | Fluent API, Reusable rules |
| **AutoMapper** | 12.x | DTO Mapping | Boilerplate kod azaltma |
| **MediatR** | 12.x | CQRS (optional) | Command pattern (if used) |

### 2.3 Altyapı Teknolojileri

| Teknoloji | Versiyon | Kullanım Alanı | Neden Seçildi |
|-----------|----------|-----------------|---------------|
| **Docker** | 25.x | Containerization | Isolation, Deployment consistency |
| **Docker Compose** | 2.x | Orchestration | Local development, Multi-service |
| **Nginx** | 1.31 | Reverse Proxy | Load balancing, SSL termination |
| **MongoDB Atlas** | Cloud | Managed Database | Backup, Redundancy, Scaling |
| **AWS EC2** | - | Hosting | Elastic computing, Cost-effective |
| **Cloudflare** | - | CDN, Security | DDoS protection, Caching |

### 2.4 Harici Servisler

| Servis | API | Kullanım | Neden Seçildi |
|--------|-----|----------|---------------|
| **Groq AI** | REST API | CV Scoring | Fast inference, Cost-effective |
| **Cloudflare Turnstile** | REST API | Captcha | Privacy-focused, Better UX |
| **MongoDB Atlas** | REST API | Database | Managed service, Automatic backups |

---

## 3. Sistem Mimarisi

### 3.1 Mimaritektur Diyagramı

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                   │
│                                                               │
│  User Interface (HTML, CSS, JavaScript, Bootstrap, Tailwind) │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   NGINX REVERSE PROXY                        │
│                    (Port 80/443)                             │
│  - SSL/TLS Termination                                       │
│  - Route /api/* → Backend (5000)                             │
│  - Route /* → Frontend (5200)                                │
│  - Load Balancing (optional)                                 │
│  - Request Logging                                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        ↓                                      ↓
┌──────────────────────┐          ┌──────────────────────┐
│   FRONTEND (5200)    │          │    BACKEND API       │
│   ASP.NET Core       │          │    (Port 5000)       │
│   Razor Pages        │          │    ASP.NET Core      │
│                      │          │                      │
│ - Controllers        │          │ - API Controllers    │
│ - Views (.cshtml)    │          │ - Services           │
│ - Services           │          │ - Repositories       │
│ - Models             │          │ - Entities           │
│ - ApiService (HTTP)  │          │ - DTOs               │
└──────────┬───────────┘          │ - Middleware         │
           │                       │ - Validators         │
           │◄──────── REST API ────┤                      │
           │         (JSON)        │ - AutoMapper         │
           │                       │ - JWT Auth           │
           │                       └──────────┬───────────┘
           │                                  │
           │                    ┌─────────────┴─────────────┐
           │                    ↓                           ↓
           │            ┌──────────────────┐    ┌──────────────────┐
           │            │   MongoDB (27017)│    │  Groq AI API     │
           │            │                  │    │                  │
           │            │ - Collections    │    │ - CV Scoring     │
           │            │ - Indexes        │    │ - Embeddings     │
           │            │ - Authentication │    │ - Inference      │
           │            │ - Replication    │    └──────────────────┘
           │            └──────────────────┘
           │
           ↓
    ┌──────────────────┐
    │  File System     │
    │  - Uploads       │
    │  - Documents     │
    │  - CVs           │
    │  - Logs          │
    └──────────────────┘
```

### 3.2 Deployment Mimarisi

```
┌──────────────────────────────────────────────────────────┐
│                      AWS EC2                              │
│                  (Ubuntu 24.04 LTS)                       │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Docker Runtime                                     │   │
│  │                                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐ ┌───────────┐ │   │
│  │  │ Nginx        │  │  Frontend    │ │ Backend   │ │   │
│  │  │ (Port 8085)  │  │  (Port 5200) │ │ (5000)    │ │   │
│  │  └──────────────┘  └──────────────┘ └───────────┘ │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │        MongoDB Container (27017)             │  │   │
│  │  │        - Persistent Volume Mounting          │  │   │
│  │  │        - Automatic Backups                   │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Volumes                                           │   │
│  │  - mongo-data: /data/db (Persistent)             │   │
│  │  - backend-uploads: /app/uploads                 │   │
│  │  - logs: /var/log (Optional)                     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Environment Files                                │   │
│  │  - .env (Shared config)                          │   │
│  │  - .env.local (Local overrides)                  │   │
│  │  - docker-compose.yml                           │   │
│  └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────────────┐
│               External Services                          │
│  - Cloudflare (CDN, DDoS Protection)                    │
│  - MongoDB Atlas (Backup)                              │
│  - Groq AI (CV Scoring)                                │
│  - AWS Route 53 (DNS)                                  │
│  - AWS S3 (File Storage - optional)                    │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Frontend Mimarisi

### 4.1 Frontend Yapısı

```
frontend/
├── Pages/                          # Razor Pages (Server-side)
│   ├── Login.cshtml               # Giriş sayfası
│   ├── Login.cshtml.cs            # Login page model
│   ├── Index.cshtml               # Dashboard
│   ├── Employees.cshtml           # Çalışan listesi
│   ├── Leaves.cshtml              # İzin yönetimi
│   ├── Recruitment.cshtml         # İşe alım
│   ├── Basvuru.cshtml             # Public start application form
│   ├── Performance.cshtml         # Performans değerlendirmesi
│   ├── Attendance.cshtml          # Devam takibi
│   ├── Announcements.cshtml       # Duyurular
│   ├── WorkSchedules.cshtml       # Vardiya planlaması
│   ├── Logs.cshtml                # Sistem logları
│   ├── Settings.cshtml            # Ayarlar
│   └── Shared/
│       ├── _Layout.cshtml         # Ana sayfa template
│       ├── _ValidationScriptsPartial.cshtml
│       └── Error.cshtml
│
├── Services/
│   └── ApiService.cs              # HTTP client, API calls
│
├── Models/
│   ├── DTOs.cs                    # Data Transfer Objects
│   └── Enums.cs
│
├── wwwroot/                        # Static files
│   ├── css/
│   ├── js/
│   │   └── site.js
│   └── lib/
│       ├── bootstrap/
│       ├── jquery/
│       └── fontawesome/
│
├── Program.cs                      # Startup configuration
├── appsettings.json               # Application config
├── Dockerfile                      # Docker image definition
└── .env                           # Environment variables
```

### 4.2 Frontend Katmanları

#### 4.2.1 Presentation Layer (Views - .cshtml)
**Sorumluluklar:**
- HTML markup rendering
- User input collection
- Form validation (client-side)
- Data display formatting

**Teknolojiler:**
- Razor syntax (@model, @foreach, @if vb.)
- Bootstrap grid system
- Tailwind CSS (public pages)
- jQuery for interactivity

**Örnek: Employees.cshtml Sayfası**
```html
@page
@model SeedHR.Frontend.Pages.EmployeesModel
@{
    ViewData["Title"] = "Çalışanlar";
}

<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-12">
            <h1>Çalışan Yönetimi</h1>
            <button class="btn btn-primary" id="addEmployeeBtn">
                Yeni Çalışan Ekle
            </button>
        </div>
    </div>

    @if (Model.Employees?.Any() == true)
    {
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Ad Soyad</th>
                    <th>E-posta</th>
                    <th>Departman</th>
                    <th>Pozisyon</th>
                    <th>İşlemler</th>
                </tr>
            </thead>
            <tbody>
                @foreach (var emp in Model.Employees)
                {
                    <tr>
                        <td>@emp.FullName</td>
                        <td>@emp.Email</td>
                        <td>@emp.DepartmentName</td>
                        <td>@emp.PositionTitle</td>
                        <td>
                            <button class="btn btn-sm btn-warning">Düzenle</button>
                            <button class="btn btn-sm btn-danger">Sil</button>
                        </td>
                    </tr>
                }
            </tbody>
        </table>
    }
    else
    {
        <div class="alert alert-info">
            Çalışan bulunmamaktadır.
        </div>
    }
</div>
```

#### 4.2.2 Page Model Layer (.cshtml.cs)
**Sorumluluklar:**
- HTTP request handling (OnGet, OnPost)
- Data loading from API
- Form submission processing
- Validation
- Error handling

**Örnek: Employees.cshtml.cs**
```csharp
public class EmployeesModel : PageModel
{
    private readonly ApiService _apiService;
    
    [BindProperty]
    public CreateUserRequest EmployeeForm { get; set; }
    
    public List<UserDto> Employees { get; set; }
    public string? ErrorMessage { get; set; }
    public string? SuccessMessage { get; set; }

    public async Task<IActionResult> OnGetAsync()
    {
        // Yetkilendirme kontrolü
        if (User?.Identity?.IsAuthenticated != true)
            return RedirectToPage("/Login");

        // API'den çalışan listesini getir
        var result = await _apiService.GetUsersAsync();
        
        if (result.Success && result.Data != null)
        {
            Employees = result.Data.ToList();
        }
        else
        {
            ErrorMessage = result.Message ?? "Veriler yüklenemedi";
        }
        
        return Page();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
        {
            ErrorMessage = "Lütfen tüm alanları doldurun";
            return Page();
        }

        // API'ye yeni çalışan ekle
        var result = await _apiService.CreateUserAsync(EmployeeForm);
        
        if (result.Success)
        {
            SuccessMessage = "Çalışan başarıyla eklendi";
            // Listeyi yenile
            await OnGetAsync();
        }
        else
        {
            ErrorMessage = result.Message ?? "Çalışan eklenemedi";
        }
        
        return Page();
    }
}
```

#### 4.2.3 Service Layer (ApiService.cs)
**Sorumluluklar:**
- HTTP client management
- API call abstraction
- JWT token handling
- Error response parsing
- CORS handling

**Örnek: ApiService.cs**
```csharp
public class ApiService
{
    private readonly IHttpClientFactory _clientFactory;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<ApiService> _logger;

    public ApiService(
        IHttpClientFactory clientFactory, 
        IHttpContextAccessor httpContextAccessor,
        ILogger<ApiService> logger)
    {
        _clientFactory = clientFactory;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    private HttpClient GetClient()
    {
        var client = _clientFactory.CreateClient();
        
        // Backend URL'ini ayarla
        var baseUrl = Environment.GetEnvironmentVariable("BACKEND_API_URL") 
                    ?? "http://localhost:5000/api/";
        client.BaseAddress = new Uri(baseUrl);
        client.DefaultRequestHeaders.Accept.Add(
            new MediaTypeWithQualityHeaderValue("application/json"));

        // JWT token'ı Authorization header'a ekle
        var context = _httpContextAccessor.HttpContext;
        if (context?.User?.Identity?.IsAuthenticated == true)
        {
            var token = context.User.FindFirst("Token")?.Value;
            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Authorization = 
                    new AuthenticationHeaderValue("Bearer", token);
                _logger.LogInformation("JWT token added to header");
            }
        }

        return client;
    }

    public async Task<ApiResponse<UserDto>> CreateUserAsync(
        CreateUserRequest request)
    {
        try
        {
            var client = GetClient();
            var response = await client.PostAsJsonAsync("Users", request);
            return await DeserializeResponseAsync<UserDto>(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return ApiResponse<UserDto>.ErrorResponse($"API Error: {ex.Message}");
        }
    }

    private async Task<ApiResponse<T>> DeserializeResponseAsync<T>(
        HttpResponseMessage response)
    {
        var content = await response.Content.ReadAsStringAsync();
        
        if (string.IsNullOrWhiteSpace(content))
        {
            if (response.IsSuccessStatusCode)
            {
                return new ApiResponse<T>
                {
                    Success = true,
                    Message = "Success",
                    Data = default!,
                    Timestamp = DateTime.UtcNow
                };
            }
            return ApiResponse<T>.ErrorResponse(
                $"API returned {(int)response.StatusCode}: {response.ReasonPhrase}");
        }

        try
        {
            var options = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true 
            };
            var apiResponse = JsonSerializer.Deserialize<ApiResponse<T>>(
                content, options);
            return apiResponse ?? ApiResponse<T>.ErrorResponse(
                "Failed to deserialize response");
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "JSON deserialization error");
            return ApiResponse<T>.ErrorResponse(
                $"JSON error: {ex.Message}");
        }
    }
}
```

### 4.3 Frontend Sayfaları Detaylı

#### 4.3.1 Login (Giriş) Sayfası
**İşlevler:**
- Email/şifre doğrulaması
- Cloudflare Turnstile Captcha
- JWT token alınması
- Kullanıcı session yönetimi

**Request Flow:**
```
User → Email + Password + Captcha Token
    ↓
Frontend: Captcha validation (client-side)
    ↓
POST /api/Auth/login
    ↓
Backend: Turnstile verification
    ↓
Backend: Email/password check
    ↓
Backend: JWT token generation
    ↓
Response: {token, refreshToken, user, expiresAt}
    ↓
Frontend: Cookie'ye token ekle
    ↓
Dashboard'a yönlendir
```

#### 4.3.2 Dashboard (Ana Sayfa)
**İşlevler:**
- İstatistik gösterimi
- Hızlı erişim menüsü
- Son aktiviteler
- Bildirimler

#### 4.3.3 Employees (Çalışan Yönetimi)
**İşlevler:**
- Çalışan listesi (pagination)
- Yeni çalışan ekle
- Çalışan bilgisi düzenle
- Çalışan silme
- Filtreleme (departman, pozisyon)

#### 4.3.4 Basvuru (Public Career Page)
**İşlevler:**
- Açık iş ilanlarını göster
- Başvuru formu
- CV yükleme
- Captcha doğrulaması
- Public access (kimlik doğrulaması gerektirmez)

---

## 5. Backend Mimarisi

### 5.1 Backend Yapısı

```
backend/
├── src/
│   ├── Controllers/                # API endpoints
│   │   ├── AuthController.cs      # Authentication
│   │   ├── UsersController.cs     # User management
│   │   ├── DepartmentsController.cs
│   │   ├── PositionsController.cs
│   │   ├── LeaveController.cs
│   │   ├── AttendanceController.cs
│   │   ├── RecruitmentController.cs
│   │   ├── PerformanceController.cs
│   │   ├── AnnouncementsController.cs
│   │   ├── NotificationsController.cs
│   │   ├── DocumentsController.cs
│   │   ├── WorkSchedulesController.cs
│   │   ├── DashboardController.cs
│   │   ├── LogsController.cs
│   │   └── AiController.cs        # CV Scoring
│   │
│   ├── Services/
│   │   ├── Interfaces/
│   │   │   ├── IAuthenticationService.cs
│   │   │   ├── IUserService.cs
│   │   │   ├── IDepartmentService.cs
│   │   │   ├── ILeaveService.cs
│   │   │   ├── IAttendanceService.cs
│   │   │   ├── IRecruitmentService.cs
│   │   │   ├── IPerformanceService.cs
│   │   │   ├── IDashboardService.cs
│   │   │   └── INotificationService.cs
│   │   │
│   │   └── Implementations/
│   │       ├── AuthenticationService.cs
│   │       ├── UserService.cs
│   │       ├── LeaveService.cs
│   │       ├── AttendanceService.cs
│   │       ├── RecruitmentService.cs
│   │       ├── PerformanceService.cs
│   │       ├── DashboardService.cs
│   │       └── NotificationService.cs
│   │
│   ├── Repository/
│   │   ├── Interfaces/
│   │   │   ├── IRepository.cs     # Generic interface
│   │   │   ├── IUserRepository.cs
│   │   │   ├── IDepartmentRepository.cs
│   │   │   └── ... (diğer repositories)
│   │   │
│   │   └── Implementations/
│   │       ├── MongoRepository.cs # Generic MongoDB implementation
│   │       ├── UserRepository.cs
│   │       └── UnitOfWork.cs      # Transaction management
│   │
│   ├── Models/
│   │   ├── Entities/
│   │   │   ├── BaseEntity.cs      # Abstract base class
│   │   │   ├── User.cs
│   │   │   ├── Department.cs
│   │   │   ├── Position.cs
│   │   │   ├── LeaveRequest.cs
│   │   │   ├── LeaveBalance.cs
│   │   │   ├── LeaveType.cs
│   │   │   ├── Attendance.cs
│   │   │   ├── WorkSchedule.cs
│   │   │   ├── Role.cs
│   │   │   ├── Permission.cs
│   │   │   ├── Document.cs
│   │   │   ├── JobPosting.cs
│   │   │   ├── CandidateApplication.cs
│   │   │   ├── Interview.cs
│   │   │   ├── PerformanceGoal.cs
│   │   │   ├── PerformanceEvaluation.cs
│   │   │   ├── Announcement.cs
│   │   │   ├── Notification.cs
│   │   │   └── ... (diğer entities)
│   │   │
│   │   └── DTOs/
│   │       ├── Auth/
│   │       │   ├── LoginRequest.cs
│   │       │   ├── LoginResponse.cs
│   │       │   └── ChangePasswordRequest.cs
│   │       ├── User/
│   │       │   ├── UserDto.cs
│   │       │   ├── CreateUserRequest.cs
│   │       │   └── UpdateUserRequest.cs
│   │       ├── ... (diğer DTOs)
│   │       └── Common/
│   │           └── ApiResponse.cs
│   │
│   ├── Security/
│   │   └── Authentication/
│   │       ├── IJwtService.cs
│   │       ├── JwtService.cs
│   │       ├── IPasswordHasher.cs
│   │       └── PasswordHasher.cs
│   │
│   ├── Middleware/
│   │   ├── ExceptionHandlingMiddleware.cs
│   │   └── RequestLoggingMiddleware.cs
│   │
│   ├── Utils/
│   │   ├── Mappers/             # AutoMapper profiles
│   │   │   ├── UserMappingProfile.cs
│   │   │   └── ... (diğer profiles)
│   │   └── Validators/          # FluentValidation rules
│   │       ├── CreateUserRequestValidator.cs
│   │       └── ... (diğer validators)
│   │
│   ├── Data/
│   │   ├── IMongoDbContext.cs
│   │   ├── MongoDbContext.cs
│   │   └── DatabaseSeeder.cs    # Initial data
│   │
│   ├── Configuration/
│   │   └── MongoDbSettings.cs
│   │
│   ├── Exceptions/
│   │   ├── AppException.cs       # Custom exception
│   │   ├── UnauthorizedException.cs
│   │   └── ConflictException.cs
│   │
│   └── Program.cs               # Dependency injection, middleware config
│
├── Dockerfile                    # Docker image
├── .env                         # Environment variables
├── appsettings.json            # Default config
├── appsettings.Development.json # Dev config
└── SeedHR.Backend.csproj       # Project file
```

### 5.2 Backend Katmanları

#### 5.2.1 Controller Layer
**Sorumluluklar:**
- HTTP request handling
- Route mapping
- Input validation
- Response formatting
- Status code management

**Örnek: UsersController.cs**
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]  // Tüm endpoints kimlik doğrulama gerektirir
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Tüm çalışanları listele
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<UserDto>>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> GetAll()
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(ApiResponse<IEnumerable<UserDto>>.SuccessResponse(
                users, "Users retrieved successfully"));
        }
        catch (UnauthorizedException ex)
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, 
                ApiResponse<object>.ErrorResponse($"Server error: {ex.Message}"));
        }
    }

    /// <summary>
    /// ID'ye göre çalışan getir
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetById(string id)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound(ApiResponse<UserDto>.ErrorResponse(
                    "User not found"));

            return Ok(ApiResponse<UserDto>.SuccessResponse(user));
        }
        catch (Exception ex)
        {
            return StatusCode(500, 
                ApiResponse<UserDto>.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Yeni çalışan oluştur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<ActionResult<ApiResponse<UserDto>>> Create(
        [FromBody] CreateUserRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<UserDto>.ErrorResponse(
                "Invalid input"));

        try
        {
            var user = await _userService.CreateUserAsync(request);
            return Created($"api/users/{user.Id}", 
                ApiResponse<UserDto>.SuccessResponse(
                    user, "User created successfully"));
        }
        catch (ConflictException ex)
        {
            return BadRequest(ApiResponse<UserDto>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, 
                ApiResponse<UserDto>.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Çalışan bilgisini güncelle
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Update(
        string id, 
        [FromBody] UpdateUserRequest request)
    {
        try
        {
            var user = await _userService.UpdateUserAsync(id, request);
            return Ok(ApiResponse<UserDto>.SuccessResponse(
                user, "User updated successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, 
                ApiResponse<UserDto>.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Çalışanı sil
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
    {
        try
        {
            var success = await _userService.DeleteUserAsync(id);
            if (!success)
                return NotFound(ApiResponse<bool>.ErrorResponse(
                    "User not found"));

            return Ok(ApiResponse<bool>.SuccessResponse(
                true, "User deleted successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, 
                ApiResponse<bool>.ErrorResponse(ex.Message));
        }
    }
}
```

#### 5.2.2 Service Layer
**Sorumluluklar:**
- Business logic implementation
- Data validation
- Orchestration between repositories
- Exception handling
- Logging

**Örnek: UserService.cs**
```csharp
public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IPasswordHasher passwordHasher,
        ILogger<UserService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        _logger.LogInformation("Fetching all users");
        
        var users = await _unitOfWork.Users.GetAllAsync();
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<UserDto> GetUserByIdAsync(string id)
    {
        _logger.LogInformation("Fetching user {UserId}", id);
        
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found", id);
            return null;
        }

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserRequest request)
    {
        _logger.LogInformation("Creating new user with email {Email}", request.Email);

        // Email'in benzersizliğini kontrol et
        var existingUser = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            _logger.LogWarning("User with email {Email} already exists", request.Email);
            throw new ConflictException("Email already registered");
        }

        // Yeni user oluştur
        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            IdentityNumber = request.IdentityNumber,
            Address = request.Address,
            City = request.City,
            Country = request.Country,
            DepartmentId = request.DepartmentId,
            PositionId = request.PositionId,
            RoleId = request.RoleId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Veritabanına ekle
        var createdUser = await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("User {UserId} created successfully", createdUser.Id);

        return _mapper.Map<UserDto>(createdUser);
    }

    public async Task<UserDto> UpdateUserAsync(string id, UpdateUserRequest request)
    {
        _logger.LogInformation("Updating user {UserId}", id);

        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found for update", id);
            throw new UnauthorizedException("User not found");
        }

        // Bilgileri güncelle
        user.FirstName = request.FirstName ?? user.FirstName;
        user.LastName = request.LastName ?? user.LastName;
        user.Phone = request.Phone ?? user.Phone;
        user.DepartmentId = request.DepartmentId ?? user.DepartmentId;
        user.PositionId = request.PositionId ?? user.PositionId;
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("User {UserId} updated successfully", id);

        return _mapper.Map<UserDto>(user);
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        _logger.LogInformation("Deleting user {UserId}", id);

        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null)
            return false;

        user.IsActive = false;  // Soft delete
        user.DeletedAt = DateTime.UtcNow;

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("User {UserId} deleted successfully", id);

        return true;
    }
}
```

#### 5.2.3 Repository Layer
**Sorumluluklar:**
- Data access abstraction
- CRUD operations
- Database queries
- Connection pooling
- Transaction management

**Örnek: MongoRepository.cs (Generic)**
```csharp
public class MongoRepository<T> : IRepository<T> where T : BaseEntity
{
    private readonly IMongoCollection<T> _collection;
    private readonly ILogger<MongoRepository<T>> _logger;

    public MongoRepository(
        IMongoDbContext mongoDbContext,
        ILogger<MongoRepository<T>> logger)
    {
        _collection = mongoDbContext.GetCollection<T>(
            typeof(T).Name.ToLowerInvariant());
        _logger = logger;
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        _logger.LogDebug("Fetching all {EntityType}", typeof(T).Name);
        
        try
        {
            return await _collection
                .Find(Builders<T>.Filter.Empty)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all {EntityType}", typeof(T).Name);
            throw;
        }
    }

    public async Task<T> GetByIdAsync(string id)
    {
        _logger.LogDebug("Fetching {EntityType} by ID: {Id}", typeof(T).Name, id);
        
        try
        {
            var filter = Builders<T>.Filter.Eq(x => x.Id, id);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching {EntityType} {Id}", 
                typeof(T).Name, id);
            throw;
        }
    }

    public async Task<T> AddAsync(T entity)
    {
        _logger.LogDebug("Adding {EntityType}", typeof(T).Name);
        
        try
        {
            entity.Id = ObjectId.GenerateNewId().ToString();
            entity.CreatedAt = DateTime.UtcNow;
            
            await _collection.InsertOneAsync(entity);
            return entity;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding {EntityType}", typeof(T).Name);
            throw;
        }
    }

    public async Task<bool> UpdateAsync(T entity)
    {
        _logger.LogDebug("Updating {EntityType} {Id}", typeof(T).Name, entity.Id);
        
        try
        {
            entity.UpdatedAt = DateTime.UtcNow;
            
            var filter = Builders<T>.Filter.Eq(x => x.Id, entity.Id);
            var result = await _collection.ReplaceOneAsync(filter, entity);
            
            return result.ModifiedCount > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating {EntityType} {Id}",
                typeof(T).Name, entity.Id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(string id)
    {
        _logger.LogDebug("Deleting {EntityType} {Id}", typeof(T).Name, id);
        
        try
        {
            var filter = Builders<T>.Filter.Eq(x => x.Id, id);
            var result = await _collection.DeleteOneAsync(filter);
            
            return result.DeletedCount > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting {EntityType} {Id}",
                typeof(T).Name, id);
            throw;
        }
    }

    public async Task<IEnumerable<T>> FindAsync(
        Expression<Func<T, bool>> predicate)
    {
        _logger.LogDebug("Finding {EntityType}", typeof(T).Name);
        
        try
        {
            var filter = Builders<T>.Filter.Where(predicate);
            return await _collection.Find(filter).ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finding {EntityType}", typeof(T).Name);
            throw;
        }
    }
}
```

#### 5.2.4 Entity Layer
**Sorumluluklar:**
- Data model definition
- Database schema
- Field validations
- Relationships

**Örnek: User.cs Entity**
```csharp
public class User : BaseEntity
{
    // Authentication
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string RefreshToken { get; set; }
    public DateTime RefreshTokenExpiry { get; set; }

    // Personal Info
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Phone { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; }
    public string IdentityNumber { get; set; }

    // Contact Info
    public string Address { get; set; }
    public string City { get; set; }
    public string Country { get; set; }

    // Employment Info
    public string DepartmentId { get; set; }
    public Department Department { get; set; }
    
    public string PositionId { get; set; }
    public Position Position { get; set; }
    
    public string ManagerId { get; set; }
    public User Manager { get; set; }
    
    public DateTime? HireDate { get; set; }

    // Emergency Contact
    public string EmergencyContactName { get; set; }
    public string EmergencyContactPhone { get; set; }

    // Role & Permissions
    public string RoleId { get; set; }
    public Role Role { get; set; }

    // Status
    public bool IsActive { get; set; } = true;
    public DateTime? DeactivatedAt { get; set; }

    // Computed Property
    public string FullName => $"{FirstName} {LastName}";
}
```

#### 5.2.5 DTO Layer
**Sorumluluklar:**
- Data transfer between layers
- API contract definition
- Validation rules
- Response formatting

**Örnek: CreateUserRequest.cs**
```csharp
public class CreateUserRequest
{
    [Required(ErrorMessage = "Email required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Password required")]
    [MinLength(8, ErrorMessage = "Password min 8 characters")]
    public string Password { get; set; }

    [Required(ErrorMessage = "First name required")]
    public string FirstName { get; set; }

    [Required(ErrorMessage = "Last name required")]
    public string LastName { get; set; }

    [Required(ErrorMessage = "Phone required")]
    [Phone(ErrorMessage = "Invalid phone format")]
    public string Phone { get; set; }

    [Required(ErrorMessage = "Date of birth required")]
    public DateTime DateOfBirth { get; set; }

    [Required(ErrorMessage = "Gender required")]
    public string Gender { get; set; }

    [Required(ErrorMessage = "Identity number required")]
    public string IdentityNumber { get; set; }

    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }

    public string? DepartmentId { get; set; }
    public string? PositionId { get; set; }
    public string? ManagerId { get; set; }

    [Required(ErrorMessage = "Role required")]
    public string RoleId { get; set; }
}
```

#### 5.2.6 Middleware Layer
**Sorumluluklar:**
- Cross-cutting concerns
- Request/response interception
- Error handling
- Logging
- Authentication/Authorization

**Örnek: ExceptionHandlingMiddleware.cs**
```csharp
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, 
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred");
            
            var response = new ApiResponse<object>
            {
                Success = false,
                Message = "Internal server error",
                Errors = new List<string> { ex.Message },
                Timestamp = DateTime.UtcNow
            };

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = GetStatusCode(ex);

            await context.Response.WriteAsJsonAsync(response);
        }
    }

    private static int GetStatusCode(Exception exception) =>
        exception switch
        {
            UnauthorizedException => StatusCodes.Status401Unauthorized,
            ConflictException => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status500InternalServerError
        };
}
```

---

## 6. API Dokümantasyonu

### 6.1 API Yapısı

```
Base URL: https://api.seedhr.com.tr/api/
veya Local: http://localhost:5000/api/

Authentication: JWT Bearer Token
Header: Authorization: Bearer {token}

Content-Type: application/json
```

### 6.2 Kimlik Doğrulama API'leri

#### 6.2.1 Login
```http
POST /api/Auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "password123",
  "turnstileToken": "0.xYz..."
}

Response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "guid-here",
    "expiresAt": "2026-06-06T00:00:00Z",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "fullName": "John Doe",
      "roleName": "HR Manager",
      "departmentName": "HR",
      "positionTitle": "Manager"
    }
  },
  "timestamp": "2026-06-05T00:00:00Z"
}

Response (401 Unauthorized):
{
  "success": false,
  "message": "CAPTCHA validation failed",
  "errors": ["captcha error"],
  "timestamp": "2026-06-05T00:00:00Z"
}
```

**Güvenlik Kontrolleri:**
- ✅ Turnstile Captcha doğrulaması
- ✅ Email/şifre kontrolü
- ✅ Rate limiting (5 başarısız denemede 15 dakika blok)
- ✅ Şifre hashing (bcrypt)

#### 6.2.2 Register
```http
POST /api/Auth/register
Content-Type: application/json

Request:
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+905555555555",
  "dateOfBirth": "1990-01-01",
  "gender": "M",
  "identityNumber": "12345678901",
  "roleId": "default-role-id"
}

Response (201 Created):
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "new-user-id",
    "email": "newuser@example.com",
    "fullName": "John Doe"
  }
}

Response (400 Bad Request):
{
  "success": false,
  "message": "Email already registered",
  "errors": ["email_conflict"],
  "timestamp": "2026-06-05T00:00:00Z"
}
```

#### 6.2.3 Refresh Token
```http
POST /api/Auth/refresh
Content-Type: application/json

Request:
{
  "refreshToken": "guid-here"
}

Response (200 OK):
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "token": "new-jwt-token",
    "refreshToken": "new-refresh-token",
    "expiresAt": "2026-06-07T00:00:00Z"
  }
}
```

### 6.3 Çalışan Yönetimi API'leri

#### 6.3.1 Tüm Çalışanları Listele
```http
GET /api/Users
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "user-1",
      "email": "user1@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+905555555555",
      "department Name": "HR",
      "positionTitle": "Manager",
      "roleName": "HR Manager",
      "isActive": true
    },
    {
      "id": "user-2",
      "email": "user2@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      ...
    }
  ],
  "timestamp": "2026-06-05T00:00:00Z"
}
```

#### 6.3.2 Çalışan Oluştur
```http
POST /api/Users
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "firstName": "Ali",
  "lastName": "Veli",
  "phone": "+905555555555",
  "dateOfBirth": "1995-05-15",
  "gender": "M",
  "identityNumber": "12345678901",
  "address": "Istanbul, Turkey",
  "city": "Istanbul",
  "country": "Turkey",
  "departmentId": "dept-1",
  "positionId": "pos-1",
  "roleId": "role-employee"
}

Response (201 Created):
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "new-user-id",
    "email": "newuser@example.com",
    "fullName": "Ali Veli",
    "departmentName": "IT",
    "positionTitle": "Developer"
  }
}
```

#### 6.3.3 Çalışanı Güncelle
```http
PUT /api/Users/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "firstName": "Ali",
  "lastName": "Veliyev",
  "phone": "+905555555556",
  "departmentId": "dept-2",
  "positionId": "pos-2"
}

Response (200 OK):
{
  "success": true,
  "message": "User updated successfully",
  "data": { ... updated user ... }
}
```

#### 6.3.4 Çalışanı Sil
```http
DELETE /api/Users/{id}
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "message": "User deleted successfully",
  "data": true
}

Response (404 Not Found):
{
  "success": false,
  "message": "User not found",
  "errors": ["user_not_found"]
}
```

### 6.4 İzin Yönetimi API'leri

#### 6.4.1 İzin Talebi Oluştur
```http
POST /api/Leave/requests
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "leaveTypeId": "vacation-type-id",
  "startDate": "2026-06-15",
  "endDate": "2026-06-22",
  "reason": "Summer vacation"
}

Response (201 Created):
{
  "success": true,
  "message": "Leave request created",
  "data": {
    "id": "leave-req-1",
    "userId": "user-id",
    "leaveType": "Vacation",
    "startDate": "2026-06-15",
    "endDate": "2026-06-22",
    "days": 8,
    "status": "Pending",
    "createdAt": "2026-06-05T00:00:00Z"
  }
}
```

#### 6.4.2 İzin Talepleri Listele
```http
GET /api/Leave/requests
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "data": [ /* leave requests array */ ]
}
```

#### 6.4.3 İzin Talebini Onayla/Reddet
```http
PUT /api/Leave/requests/{id}/approve
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "approvalNotes": "Approved"
}

Response (200 OK):
{
  "success": true,
  "message": "Leave request approved",
  "data": { ... updated request ... }
}
```

### 6.5 İşe Alım API'leri

#### 6.5.1 Açık İş İlanlarını Listele (Public)
```http
GET /api/Recruitment/job-postings
(Kimlik doğrulama gerektirmez)

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "job-1",
      "title": "Senior Developer",
      "description": "We are looking for...",
      "requirements": "5+ years experience...",
      "postedDate": "2026-05-01",
      "numberOfPositions": 2,
      "status": "Open"
    }
  ]
}
```

#### 6.5.2 İş İlanına Başvur (Public)
```http
POST /api/Recruitment/job-postings/{jobPostingId}/apply
Content-Type: multipart/form-data

Request:
{
  "firstName": "Ali",
  "lastName": "Veli",
  "email": "ali@example.com",
  "phone": "+905555555555",
  "address": "Istanbul",
  "city": "Istanbul",
  "country": "Turkey",
  "coverLetter": "I am interested in this position...",
  "turnstileToken": "0.xyz...",
  "cv": <binary file>
}

Response (201 Created):
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": "application-1",
    "candidateName": "Ali Veli",
    "jobTitle": "Senior Developer",
    "status": "Applied"
  }
}
```

#### 6.5.3 CV'yi Puanla (AI)
```http
POST /api/Ai/score-cv/{candidateId}
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "data": {
    "candidateId": "candidate-1",
    "score": 8.5,
    "summary": "Strong candidate with relevant experience",
    "strengths": ["Python", "AWS", "Leadership"],
    "gaps": ["Kubernetes"]
  }
}
```

### 6.6 Dashboard API'leri

#### 6.6.1 Dashboard İstatistikleri
```http
GET /api/Dashboard/stats
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "data": {
    "totalEmployees": 150,
    "totalDepartments": 8,
    "totalPositions": 25,
    "activeLeaveRequests": 5,
    "pendingRecruitments": 3,
    "upcomingInterviews": 2,
    "announcements": 12,
    "averageAttendance": 94.5
  }
}
```

### 6.7 API Response Format

Tüm API response'ları aşağıdaki standardını takip eder:

```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }           // İstek başarılı mı
    public string Message { get; set; }         // Öz mesaj
    public T Data { get; set; }                 // İstenen veri
    public List<string> Errors { get; set; }    // Hata listesi
    public DateTime Timestamp { get; set; }     // Response zamanı
}
```

### 6.8 HTTP Status Kodları

| Kod | Anlamı | Örnek |
|-----|--------|--------|
| **200** | OK | Başarılı GET, PUT, DELETE |
| **201** | Created | Başarılı POST |
| **400** | Bad Request | Geçersiz input, validasyon hatası |
| **401** | Unauthorized | Token yok, geçersiz token |
| **403** | Forbidden | Token valid ama izin yok |
| **404** | Not Found | Resource bulunamadı |
| **409** | Conflict | Email benzersiz değil vb. |
| **429** | Too Many Requests | Rate limit aşıldı |
| **500** | Internal Server Error | Server hatası |

---

## 7. Veritabanı Yapısı

### 7.1 MongoDB Mimarisi

```
seedhr (Database)
├── users (Collection)
├── departments (Collection)
├── positions (Collection)
├── roles (Collection)
├── permissions (Collection)
├── leaveTypes (Collection)
├── leaveRequests (Collection)
├── leaveBalances (Collection)
├── attendance (Collection)
├── workSchedules (Collection)
├── jobPostings (Collection)
├── candidates (Collection)
├── interviews (Collection)
├── performanceGoals (Collection)
├── performanceEvaluations (Collection)
├── documents (Collection)
├── announcements (Collection)
├── notifications (Collection)
└── logs (Collection)
```

### 7.2 Entity İlişkileri

```
User (Çalışan)
├── has-one → Role
├── has-one → Department
├── has-one → Position
├── has-one → Manager (User)
├── has-many → LeaveRequest
├── has-many → Attendance
├── has-many → Document
├── has-many → PerformanceGoal
├── has-many → PerformanceEvaluation
└── has-many → LeaveBalance

Department
├── has-many → User
└── has-many → Position

Position
├── has-many → User
└── belongs-to → Department

LeaveRequest
├── belongs-to → User
└── belongs-to → LeaveType

LeaveBalance
├── belongs-to → User
└── belongs-to → LeaveType

JobPosting
├── has-many → Candidate
└── has-many → Interview

Candidate
├── has-many → Interview
└── belongs-to → JobPosting

Interview
├── belongs-to → Candidate
├── belongs-to → JobPosting
└── belongs-to → User (Interviewer)

PerformanceGoal
├── belongs-to → User
└── has-many → PerformanceEvaluation

PerformanceEvaluation
├── belongs-to → PerformanceGoal
└── belongs-to → User
```

### 7.3 Collection Şemaları

#### 7.3.1 Users Collection
```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "passwordHash", "firstName", "lastName", "roleId"],
      properties: {
        _id: { bsonType: "objectId" },
        email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
        passwordHash: { bsonType: "string" },
        refreshToken: { bsonType: "string" },
        refreshTokenExpiry: { bsonType: "date" },
        
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        phone: { bsonType: "string" },
        dateOfBirth: { bsonType: "date" },
        gender: { enum: ["M", "F", "O"] },
        identityNumber: { bsonType: "string" },
        
        address: { bsonType: "string" },
        city: { bsonType: "string" },
        country: { bsonType: "string" },
        
        departmentId: { bsonType: "objectId" },
        positionId: { bsonType: "objectId" },
        managerId: { bsonType: "objectId" },
        hireDate: { bsonType: "date" },
        
        emergencyContactName: { bsonType: "string" },
        emergencyContactPhone: { bsonType: "string" },
        
        roleId: { bsonType: "objectId" },
        isActive: { bsonType: "bool" },
        deactivatedAt: { bsonType: "date" },
        
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        deletedAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ departmentId: 1 });
db.users.createIndex({ roleId: 1 });
db.users.createIndex({ identityNumber: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });
```

#### 7.3.2 LeaveRequest Collection
```javascript
db.createCollection("leaverequests", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "leaveTypeId", "startDate", "endDate"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        leaveTypeId: { bsonType: "objectId" },
        startDate: { bsonType: "date" },
        endDate: { bsonType: "date" },
        numberOfDays: { bsonType: "int" },
        reason: { bsonType: "string" },
        status: { enum: ["Pending", "Approved", "Rejected", "Cancelled"] },
        approvedBy: { bsonType: "objectId" },
        approvalDate: { bsonType: "date" },
        approvalNotes: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.leaverequests.createIndex({ userId: 1, startDate: -1 });
db.leaverequests.createIndex({ status: 1 });
db.leaverequests.createIndex({ approvedBy: 1 });
```

#### 7.3.3 JobPosting Collection
```javascript
db.createCollection("jobpostings", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "description", "numberOfPositions"],
      properties: {
        _id: { bsonType: "objectId" },
        title: { bsonType: "string" },
        description: { bsonType: "string" },
        requirements: { bsonType: "string" },
        numberOfPositions: { bsonType: "int" },
        postedDate: { bsonType: "date" },
        closedDate: { bsonType: "date" },
        status: { enum: ["Open", "Closed", "Draft"] },
        createdBy: { bsonType: "objectId" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.jobpostings.createIndex({ status: 1, postedDate: -1 });
db.jobpostings.createIndex({ createdBy: 1 });
```

#### 7.3.4 Candidate Collection (Aday/Başvuru)
```javascript
db.createCollection("candidates", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["jobPostingId", "firstName", "lastName", "email"],
      properties: {
        _id: { bsonType: "objectId" },
        jobPostingId: { bsonType: "objectId" },
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        email: { bsonType: "string" },
        phone: { bsonType: "string" },
        address: { bsonType: "string" },
        city: { bsonType: "string" },
        country: { bsonType: "string" },
        coverLetter: { bsonType: "string" },
        cvUrl: { bsonType: "string" },
        status: { enum: ["Applied", "Reviewing", "Interview", "Offered", "Rejected", "Accepted"] },
        cvScore: { bsonType: "double" },
        notes: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.candidates.createIndex({ jobPostingId: 1 });
db.candidates.createIndex({ status: 1 });
db.candidates.createIndex({ email: 1 }, { unique: true });
db.candidates.createIndex({ createdAt: -1 });
```

### 7.4 Veri Akışı

```
Yeni Çalışan Ekleme Akışı:
┌─────────────────┐
│   User Input    │
│  (Form Data)    │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Validation     │
│  (FluentVal)    │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Service Layer  │
│  - Check email  │
│  - Hash pwd     │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Repository     │
│  Add to MongoDB │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Save Response  │
│  (DTO)          │
└─────────────────┘
```

---

## 8. Kimlik Doğrulama ve Yetkilendirme

### 8.1 JWT Authentication Flow

```
1. User Login
   ├─ Email + Password + Captcha Token
   ├─ Turnstile Verification
   ├─ Email/Password Check
   └─ JWT Token Generation
       └─ Header: {typ: "JWT", alg: "HS256"}
       └─ Payload: {sub, email, name, role, iat, exp}
       └─ Signature: HMACSHA256(header.payload, secret)

2. API Request
   ├─ Authorization: Bearer {token}
   ├─ JWT Middleware Validation
   ├─ Token Signature Verification
   ├─ Expiration Check
   └─ Claims Extraction

3. Authorization
   ├─ [Authorize] Attribute Check
   ├─ Role Verification
   ├─ Permission Check (if RBAC)
   └─ Request Processing or 403
```

### 8.2 JWT Token Yapısı

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user-id-12345",              // Subject (User ID)
  "email": "user@example.com",         // Email
  "name": "John Doe",                  // Full name
  "role": "HR Manager",                // Role
  "iat": 1717420800,                   // Issued at
  "exp": 1717507200                    // Expiration (24 hours)
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  "jwt-secret-key-min-32-chars"
)
```

### 8.3 Role-Based Access Control (RBAC)

**Roller:**
- **Admin**: Sistem yöneticisi, tüm operasyonlara erişim
- **HR Manager**: İnsan kaynakları yöneticisi, çalışan ve recruitment yönetimi
- **Manager**: Departman yöneticisi, raporlarını yönetebilir
- **Employee**: Standart çalışan, kendi bilgileri ve izin talepleri
- **Recruiter**: İşe alım uzmanı, recruitment modülü erişimi
- **Performance Manager**: Performans değerlendirme

**Permission Matrisi:**

| İşlem | Admin | HR Manager | Manager | Employee | Recruiter | Perf Manager |
|-------|-------|-----------|---------|----------|-----------|--------------|
| User Create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| User Update | ✅ | ✅ | ✅* | ✅** | ❌ | ❌ |
| User Delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Leave Approve | ✅ | ✅ | ✅* | ❌ | ❌ | ❌ |
| Job Posting Create | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Performance Eval | ✅ | ✅ | ✅* | ❌ | ❌ | ✅ |

*Manager sadece raporlarını yönetebilir
**Employee sadece kendi bilgisini güncelleme

### 8.4 Token Refresh Mekanizması

```
Initial Login:
┌──────────┐
│ Credentials
└────┬─────┘
     ↓
┌──────────────────────────┐
│ Access Token (24 hours)  │  <- Kısa ömürlü
│ Refresh Token (7 days)   │  <- Uzun ömürlü
└────┬─────────────────────┘
     ↓
┌──────────────────────────┐
│ Save in Secure Cookie    │
│ (HTTPOnly, Secure flag)  │
└──────────────────────────┘

When Access Token Expires:
┌──────────────────┐
│ 401 Response     │
│ TokenExpired     │
└────┬─────────────┘
     ↓
┌──────────────────────────┐
│ POST /Auth/refresh       │
│ + Refresh Token          │
└────┬─────────────────────┘
     ↓
┌──────────────────────────┐
│ New Access Token         │
│ New Refresh Token        │
└──────────────────────────┘
```

### 8.5 Güvenlik Başlıkları

```csharp
// Program.cs'te konfigüre edilecek
app.UseHsts(); // HSTS (HTTP Strict Transport Security)

// Nginx'te eklenecek:
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## 9. Altyapı ve Dağıtım

### 9.1 Docker Architecture

#### 9.1.1 docker-compose.yml Yapısı
```yaml
version: '3.8'

services:
  # MongoDB - NoSQL Database
  mongodb:
    image: mongo:latest
    container_name: seedhr-mongodb
    ports:
      - "127.0.0.1:27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGODB_USER:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_PASSWORD:-password}
    restart: always
    networks:
      - seedhr-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: seedhr-backend
    ports:
      - "127.0.0.1:5005:5000"
    environment:
      - MONGODB_CONNECTION_STRING=mongodb://mongodb:27017
      - MONGODB_DATABASE_NAME=seedhr
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRATION_HOURS=24
      - TURNSTILE_SECRET_KEY=${TURNSTILE_SECRET_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - ASPNETCORE_ENVIRONMENT=Development
      - BACKEND_API_URL=http://backend:5000/api/
    depends_on:
      - mongodb
    volumes:
      - backend-uploads:/app/uploads
      - ./backend/.env:/app/.env
      - ./backend/appsettings.json:/app/appsettings.json
    restart: always
    networks:
      - seedhr-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Web Application
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: seedhr-frontend
    ports:
      - "127.0.0.1:5205:5200"
    environment:
      - BACKEND_API_URL=http://backend:5000/api/
      - ASPNETCORE_ENVIRONMENT=Development
    depends_on:
      - backend
    volumes:
      - ./frontend/.env:/app/.env
    restart: always
    networks:
      - seedhr-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:latest
    container_name: seedhr-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx-logs:/var/log/nginx
    depends_on:
      - backend
      - frontend
    restart: always
    networks:
      - seedhr-network

volumes:
  mongo-data:
    driver: local
  backend-uploads:
    driver: local
  nginx-logs:
    driver: local

networks:
  seedhr-network:
    driver: bridge
```

#### 9.1.2 Backend Dockerfile
```dockerfile
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build-env
WORKDIR /app

# Copy project file
COPY SeedHR.Backend.csproj ./
RUN dotnet restore

# Copy source and publish
COPY . ./
RUN dotnet publish -c Release -o out

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Copy published files
COPY --from=build-env /app/out ./

# Copy configuration files
COPY .env ./
COPY appsettings*.json ./

# Create directories
RUN mkdir -p uploads/documents uploads/cvs logs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Expose and run
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "SeedHR.Backend.dll"]
```

#### 9.1.3 Frontend Dockerfile
```dockerfile
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build-env
WORKDIR /app

COPY SeedHR.Frontend.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o out

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

COPY --from=build-env /app/out ./

# Copy config
COPY .env ./
COPY appsettings*.json ./

EXPOSE 5200
ENV ASPNETCORE_URLS=http://+:5200
ENTRYPOINT ["dotnet", "SeedHR.Frontend.dll"]
```

### 9.2 Nginx Reverse Proxy Configuration

#### 9.2.1 nginx.conf
```nginx
events {
    worker_connections 2048;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

    # Include server configs
    include /etc/nginx/conf.d/*.conf;
}
```

#### 9.2.2 Server Configuration (seedhr.conf)
```nginx
upstream backend {
    server backend:5000;
}

upstream frontend {
    server frontend:5200;
}

server {
    listen 80;
    server_name seedhr.local localhost;

    client_max_body_size 20M;  # File upload limit

    # API Routes
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Authorization $http_authorization;
        
        # Websocket support (if needed)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Buffering
        proxy_buffering off;
        proxy_cache off;
        
        # Rate limiting
        limit_req zone=api_limit burst=20 nodelay;
    }

    # Frontend Routes
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Health checks
    location /health {
        proxy_pass http://backend;
        access_log off;
    }
}
```

### 9.3 AWS Deployment

#### 9.3.1 EC2 Instance Setup

**Sistem Gereksinimleri:**
- **OS**: Ubuntu 24.04 LTS
- **RAM**: 4GB minimum (8GB recommended)
- **CPU**: 2 vCPU minimum
- **Storage**: 50GB minimum
- **Ağ**: Port 80, 443 açık

**İlk Kurulum:**
```bash
# System updates
sudo apt update && sudo apt upgrade -y

# Docker kurulumu
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER

# Git
sudo apt install git -y

# SSL Certificates (Certbot)
sudo apt install certbot python3-certbot-nginx -y

# Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### 9.3.2 Deployment Steps

```bash
# 1. Repository clone
git clone https://github.com/yourorg/seedhr.git
cd seedhr

# 2. Environment files
cp .env.example .env
# Edit .env with production values

# 3. SSL Certificate
sudo certbot certonly --standalone -d seedhr.com.tr -d www.seedhr.com.tr

# 4. Docker Compose Deploy
docker-compose -f docker-compose.yml up -d

# 5. Database Backup
docker exec seedhr-mongodb mongodump --out /backup

# 6. Logs monitoring
docker-compose logs -f
```

### 9.4 Backup ve Recovery

#### 9.4.1 MongoDB Backup
```bash
# Full backup
docker exec seedhr-mongodb mongodump \
  --out /data/backup/$(date +\%Y\%m\%d)

# Backup to S3 (AWS)
aws s3 cp /data/backup s3://seedhr-backups/ --recursive

# Restore from backup
docker exec seedhr-mongodb mongorestore \
  /data/backup/20260605
```

#### 9.4.2 File Backup
```bash
# Backend uploads
docker cp seedhr-backend:/app/uploads ./backups/uploads_$(date +\%Y\%m\%d)

# Logs
docker logs seedhr-backend > logs/backend_$(date +\%Y\%m\%d).log
docker logs seedhr-frontend > logs/frontend_$(date +\%Y\%m\%d).log
```

---

## 10. Güvenlik Mekanizmaları

### 10.1 Kimlik Doğrulama Güvenliği

#### 10.1.1 Şifre Yönetimi
```csharp
// PasswordHasher implementation
public class PasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(
            password, 
            workFactor: 12);  // BCrypt 12 rounds
    }

    public bool Verify(string password, string hash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch
        {
            return false;
        }
    }
}

// Güvenlik özellikleri:
// ✅ BCrypt hashing (irreversible)
// ✅ Salt generation (per-password)
// ✅ Time-resistant comparison
// ✅ Work factor 12 (2^12 iterations)
```

#### 10.1.2 JWT Token Güvenliği
```csharp
// Token generation
var token = new JwtSecurityToken(
    claims: claims,
    expires: DateTime.UtcNow.AddHours(24),  // 24 saat
    signingCredentials: credentials
);

// Token validation
new TokenValidationParameters
{
    ValidateIssuerSigningKey = true,
    IssuerSigningKey = signingKey,
    ValidateIssuer = false,               // Internal use
    ValidateAudience = false,             // Internal use
    ValidateLifetime = true,
    ClockSkew = TimeSpan.Zero            // No skew
}
```

#### 10.1.3 Captcha Doğrulaması
```csharp
// Turnstile Captcha
public async Task<(bool Success, string Error)> VerifyTurnstileTokenAsync(
    string token)
{
    var client = new HttpClient();
    var response = await client.PostAsync(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("secret", secretKey),
            new KeyValuePair<string, string>("response", token)
        }));

    if (!response.IsSuccessStatusCode)
        return (false, $"HTTP {response.StatusCode}");

    var json = await response.Content.ReadAsStringAsync();
    var doc = JsonDocument.Parse(json);
    
    if (!doc.RootElement.TryGetProperty("success", out var success))
        return (false, "Invalid response");

    return (success.GetBoolean(), "");
}

// Güvenlik özellikleri:
// ✅ Server-side doğrulama (client-side bypass koruması)
// ✅ Challenge-response protokolü
// ✅ Bot trafik filtreleme
// ✅ Privacy-friendly (reCAPTCHA alternatifi)
```

### 10.2 Yetkilendirme ve Erişim Kontrolü

#### 10.2.1 Role-Based Authorization
```csharp
// Controller-level authorization
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,HR Manager")]  // Sadece bu roller
public class UsersController : ControllerBase
{
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]          // Sadece Admin
    public async Task<IActionResult> Delete(string id)
    {
        // ...
    }
}

// Custom policy authorization
services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("Admin"));
    
    options.AddPolicy("CanApproveLeavе", policy =>
        policy.RequireRole("Admin", "HR Manager", "Manager"));
    
    options.AddPolicy("CanViewReports", policy =>
        policy.RequireAssertion(context =>
        {
            var userRole = context.User.FindFirst("role")?.Value;
            var userId = context.User.FindFirst("sub")?.Value;
            // Custom logic
            return userRole == "Manager";
        }));
});
```

#### 10.2.2 Permission-Based Access
```csharp
// Fine-grained permissions
public class Permission
{
    public string Name { get; set; }        // "create_user"
    public string Description { get; set; }
    public string Category { get; set; }    // "user_management"
}

// Role-Permission mapping
public class Role
{
    public string Name { get; set; }
    public List<Permission> Permissions { get; set; }
}

// Authorization middleware
public class PermissionAuthorizationHandler : 
    AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var userPermissions = context.User
            .FindAll("permissions");
        
        if (userPermissions.Any(c => c.Value == requirement.Permission))
        {
            context.Succeed(requirement);
        }
        
        return Task.CompletedTask;
    }
}
```

### 10.3 Input Validation ve Sanitization

#### 10.3.1 FluentValidation
```csharp
// CreateUserRequestValidator
public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .Must(IsUniqueEmail).WithMessage("Email already registered");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(8).WithMessage("Password min 8 characters")
            .Matches(@"[A-Z]").WithMessage("Password must contain uppercase")
            .Matches(@"[a-z]").WithMessage("Password must contain lowercase")
            .Matches(@"[0-9]").WithMessage("Password must contain number")
            .Matches(@"[!@#$%^&*]").WithMessage("Password must contain special char");

        RuleFor(x => x.IdentityNumber)
            .NotEmpty()
            .Length(11)
            .Must(IsValidTcKimlik).WithMessage("Invalid TC Kimlik No");

        RuleFor(x => x.DateOfBirth)
            .NotEmpty()
            .Must(BeAtLeast18YearsOld).WithMessage("Must be at least 18");
    }

    private bool IsUniqueEmail(string email)
    {
        // Check in database
        return !_userRepository.EmailExists(email);
    }

    private bool IsValidTcKimlik(string tcNo)
    {
        // TC Kimlik validation algorithm
        if (tcNo.Length != 11) return false;
        
        int sum = 0;
        for (int i = 0; i < 10; i++)
        {
            sum += int.Parse(tcNo[i].ToString()) * (i % 2 == 0 ? 1 : 3);
        }
        // ... checksum verification
        return true;
    }

    private bool BeAtLeast18YearsOld(DateTime dateOfBirth)
    {
        var age = DateTime.Today.Year - dateOfBirth.Year;
        if (dateOfBirth > DateTime.Today.AddYears(-age)) age--;
        return age >= 18;
    }
}
```

#### 10.3.2 Injection Prevention
```csharp
// SQL Injection Protection (MongoDB)
// ✅ Parameterized queries (BSON)
var filter = Builders<User>.Filter.Eq(x => x.Email, userInput);
var user = await _collection.Find(filter).FirstOrDefaultAsync();

// ❌ String concatenation (NEVER)
// db.users.find({ email: "' + userInput + '" })

// XSS Prevention (Frontend)
// ✅ HTML encoding
@Html.DisplayFor(m => m.User.Email)

// Script injection prevention (API responses)
return Json(new { message = "Success" });  // Content-Type: application/json
```

### 10.4 Rate Limiting

#### 10.4.1 Nginx Rate Limiting
```nginx
# Define rate limit zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

# Apply rate limits
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    # After 10 req/s, queue up to 20 more, reject over 30
}

location /api/Auth/login {
    limit_req zone=login_limit burst=3 nodelay;
    # Max 5 login attempts per minute
}
```

#### 10.4.2 ASP.NET Core Rate Limiting
```csharp
// Program.cs
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter(
        policyName: "fixed",
        configureOptions: options =>
        {
            options.PermitLimit = 100;
            options.Window = TimeSpan.FromMinutes(1);
            options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            options.QueueLimit = 10;
        });

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { error = "Too many requests" });
    };
});

// Controller
[Route("api/[controller]")]
[EnableRateLimiting("fixed")]
public class LoginController : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Rate limited
    }
}
```

### 10.5 CORS ve CSRF Koruması

#### 10.5.1 CORS Configuration
```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("ProductionCors", policy =>
    {
        policy
            .WithOrigins(
                "https://seedhr.com.tr",
                "https://www.seedhr.com.tr"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithExposedHeaders("X-Total-Count")  // Pagination header
            .WithMaxAge(3600);
    });
});

app.UseCors("ProductionCors");
```

#### 10.5.2 CSRF Token
```csharp
// Razor Pages
@{
    ViewData["Title"] = "Delete User";
}

<form method="post">
    @Html.AntiForgeryToken()  <!-- CSRF token -->
    <button type="submit">Confirm Delete</button>
</form>

// Validation in PageModel
[ValidateAntiForgeryToken]
public async Task<IActionResult> OnPostAsync()
{
    // CSRF token automatically validated
}
```

### 10.6 SSL/TLS Configuration

#### 10.6.1 Nginx SSL
```nginx
server {
    listen 443 ssl http2;
    server_name seedhr.com.tr www.seedhr.com.tr;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/seedhr.com.tr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seedhr.com.tr/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security 
        "max-age=31536000; includeSubDomains" always;

    # HTTP to HTTPS redirect
    error_page 497 301 =307 https://$host$request_uri;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name seedhr.com.tr www.seedhr.com.tr;
    return 301 https://$server_name$request_uri;
}
```

#### 10.6.2 Certificate Renewal
```bash
# Certbot auto-renewal
sudo certbot renew --dry-run  # Test renewal
sudo certbot renew            # Actual renewal

# Cron job for auto-renewal
0 0 * * * /usr/bin/certbot renew --quiet
```

### 10.7 Güvenlik İi Uygulamalar

**Yapılması Gerekenler:**
- ✅ HTTPS/TLS kullan
- ✅ Şifreleri hash'le (bcrypt, Argon2)
- ✅ Rate limiting uygula
- ✅ Input validation
- ✅ CORS whitelist
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF tokens
- ✅ Security headers
- ✅ Regular updates
- ✅ Audit logging
- ✅ Access control

**Yapılmaması Gerekenler:**
- ❌ Şifreleri plain-text sakla
- ❌ JWT secret'ı kodda hard-code etme
- ❌ Sensitive data'yı loglama
- ❌ API key'leri public repo'da sakla
- ❌ Debugging modunu production'da bırak
- ❌ Default credentials kullan
- ❌ Validation'ı bypass etme

---

## 11. Geliştirme ve Kurulum Rehberi

### 11.1 Geliştirme Ortamı Kurulumu

#### 11.1.1 Sistem Gereksinimleri

**Windows/Mac/Linux:**
- ✅ .NET 9 SDK
- ✅ Git
- ✅ Docker Desktop
- ✅ Visual Studio 2022 / VS Code
- ✅ MongoDB Compass (Optional)

**Kurulum Adımları:**

```bash
# 1. Repository klone et
git clone https://github.com/yourorg/seedhr.git
cd seedhr

# 2. .env dosyası oluştur
cp .env.example .env

# Edit .env
nano .env
# MONGODB_CONNECTION_STRING=mongodb://localhost:27017
# JWT_SECRET=dev-secret-key-min-32-chars-xxxxxxxx
# TURNSTILE_SECRET_KEY=your-turnstile-secret
# GROQ_API_KEY=your-groq-api-key

# 3. Docker container'ları başlat
docker-compose up -d

# 4. Dependencies yükle
cd frontend && dotnet restore && cd ..
cd backend && dotnet restore && cd..

# 5. Database seeding
docker exec seedhr-backend dotnet SeedHR.Backend.dll seed

# 6. Frontend çalıştır
cd frontend
dotnet run --urls "http://localhost:5200"

# 7. Backend çalıştır (başka terminal)
cd backend
dotnet run --urls "http://localhost:5000"

# 8. Browser'da aç
# Frontend: http://localhost:5200
# Backend Swagger: http://localhost:5000/swagger
```

#### 11.1.2 Development Workflow

```bash
# Feature branch oluştur
git checkout -b feature/new-feature

# Kod yaz, test et
# ...

# Commit et
git add .
git commit -m "feat: add new feature"

# Push et
git push origin feature/new-feature

# Pull request oluştur (GitHub)
gh pr create --title "Add new feature"

# Code review sonrası merge
git checkout main
git pull origin main
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### 11.2 Docker Geliştirme

#### 11.2.1 Docker Komutları

```bash
# Build and run
docker-compose up -d --build

# Logs görüntüleme
docker-compose logs -f backend
docker-compose logs -f frontend

# Container'a gir
docker exec -it seedhr-backend bash
docker exec -it seedhr-mongodb mongosh

# Veritabanı backup
docker exec seedhr-mongodb mongodump --out /backup

# Container'ları durdur
docker-compose down

# Volumes silme (data kaybı!)
docker-compose down -v
```

#### 11.2.2 Local Development Setup

```dockerfile
# Dockerfile.dev (local development)
FROM mcr.microsoft.com/dotnet/sdk:9.0

WORKDIR /app

# Copy project
COPY . .

# Restore and build
RUN dotnet restore
RUN dotnet build

# Watch mode
CMD ["dotnet", "watch", "run"]
```

### 11.3 Testing

#### 11.3.1 Unit Tests

```csharp
[TestClass]
public class UserServiceTests
{
    private UserService _service;
    private Mock<IUnitOfWork> _unitOfWorkMock;

    [TestInitialize]
    public void Setup()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _service = new UserService(_unitOfWorkMock.Object, ...);
    }

    [TestMethod]
    public async Task CreateUser_WithValidData_ReturnsUserDto()
    {
        // Arrange
        var request = new CreateUserRequest
        {
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe"
        };

        // Mock setup
        _unitOfWorkMock.Setup(x => x.Users.GetByEmailAsync(request.Email))
            .ReturnsAsync((User)null);
        
        _unitOfWorkMock.Setup(x => x.Users.AddAsync(It.IsAny<User>()))
            .ReturnsAsync(new User { Id = "1", Email = request.Email });

        // Act
        var result = await _service.CreateUserAsync(request);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(request.Email, result.Email);
    }

    [TestMethod]
    public async Task CreateUser_WithDuplicateEmail_ThrowsConflictException()
    {
        // Arrange
        var request = new CreateUserRequest { Email = "existing@example.com" };
        
        _unitOfWorkMock.Setup(x => x.Users.GetByEmailAsync(request.Email))
            .ReturnsAsync(new User { Email = request.Email });

        // Act & Assert
        await Assert.ThrowsExceptionAsync<ConflictException>(
            () => _service.CreateUserAsync(request));
    }
}
```

#### 11.3.2 Integration Tests

```csharp
[TestClass]
public class UsersControllerIntegrationTests
{
    private WebApplicationFactory<Program> _factory;
    private HttpClient _client;

    [TestInitialize]
    public void Setup()
    {
        _factory = new WebApplicationFactory<Program>();
        _client = _factory.CreateClient();
    }

    [TestMethod]
    public async Task GetUsers_WithValidToken_Returns200()
    {
        // Arrange
        var token = GenerateValidToken();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/users");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
    }

    [TestMethod]
    public async Task GetUsers_WithoutToken_Returns401()
    {
        // Act
        var response = await _client.GetAsync("/api/users");

        // Assert
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
```

### 11.4 Deployment to Production

#### 11.4.1 Production Checklist

```markdown
## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] Code review completed
- [ ] No console.logs or debug code
- [ ] Environment variables configured
- [ ] Secrets not in code

### Security
- [ ] SSL/TLS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Logging configured
- [ ] Backup strategy ready

### Infrastructure
- [ ] Database backups working
- [ ] Monitoring configured
- [ ] Health checks enabled
- [ ] Logging aggregated
- [ ] Auto-scaling set up

### Documentation
- [ ] API documentation updated
- [ ] Deployment runbook ready
- [ ] Rollback plan documented
- [ ] Team trained
```

#### 11.4.2 Deployment Steps

```bash
#!/bin/bash

# 1. Backup
docker exec seedhr-mongodb mongodump --out /backup/$(date +%Y%m%d)
aws s3 cp /backup/$(date +%Y%m%d) s3://seedhr-backups/ --recursive

# 2. Pull latest code
git fetch origin
git checkout origin/main

# 3. Build images
docker-compose build --no-cache

# 4. Run database migrations
docker-compose run backend dotnet SeedHR.Backend.dll migrate

# 5. Start new containers
docker-compose up -d

# 6. Health check
sleep 10
curl -f http://localhost:5000/health || {
    echo "Health check failed! Rolling back..."
    docker-compose down
    # Restore from backup
    exit 1
}

# 7. Smoke tests
./scripts/smoke-tests.sh

echo "Deployment successful!"
```

---

## 12. İleri Konular

### 12.1 Logging ve Monitoring

#### 12.1.1 Serilog Configuration
```csharp
// Program.cs
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Environment", app.Environment.EnvironmentName)
    .Enrich.WithProperty("Version", "1.0.0")
    
    // Console output
    .WriteTo.Console(
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    
    // File output
    .WriteTo.File(
        path: "logs/seedhr-.txt",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    
    // Elasticsearch (for production)
    .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(
        new Uri("http://elasticsearch:9200"))
    {
        IndexFormat = "seedhr-logs-{0:yyyy.MM.dd}"
    })
    
    .CreateLogger();
```

#### 12.1.2 Structured Logging Examples
```csharp
// Information
_logger.LogInformation(
    "User {UserId} logged in from {IpAddress}",
    userId, ipAddress);

// Warning
_logger.LogWarning(
    "Failed login attempt for email {Email}. Attempt {Attempt}/5",
    email, attemptCount);

// Error
_logger.LogError(ex,
    "Failed to process leave request {RequestId} for user {UserId}",
    requestId, userId);

// Debug (development only)
_logger.LogDebug(
    "Query executed: {Query} in {ElapsedMs}ms",
    query, stopwatch.ElapsedMilliseconds);
```

### 12.2 Performance Optimization

#### 12.2.1 Database Query Optimization
```csharp
// Bad: N+1 query problem
var users = await _context.Users.ToListAsync();
foreach (var user in users)
{
    var department = await _context.Departments
        .FirstOrDefaultAsync(d => d.Id == user.DepartmentId);
    // Executes N+1 queries!
}

// Good: Eager loading
var users = await _context.Users
    .Include(u => u.Department)
    .Include(u => u.Position)
    .ToListAsync();

// Good: Projection (Select only needed fields)
var userDtos = await _context.Users
    .Select(u => new UserDto
    {
        Id = u.Id,
        Email = u.Email,
        FullName = u.FirstName + " " + u.LastName,
        DepartmentName = u.Department.Name
    })
    .ToListAsync();

// Good: Pagination
var page = 1;
var pageSize = 20;
var users = await _context.Users
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync();
```

#### 12.2.2 Caching Strategy
```csharp
// In-memory cache (for small data)
services.AddMemoryCache();

public class DepartmentService
{
    private readonly IMemoryCache _cache;
    private const string DEPARTMENTS_CACHE_KEY = "all_departments";

    public async Task<IEnumerable<DepartmentDto>> GetAllAsync()
    {
        if (_cache.TryGetValue(DEPARTMENTS_CACHE_KEY, out var cached))
        {
            return (IEnumerable<DepartmentDto>)cached;
        }

        var departments = await _repository.GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<DepartmentDto>>(departments);

        _cache.Set(DEPARTMENTS_CACHE_KEY, dtos, 
            TimeSpan.FromHours(1));

        return dtos;
    }

    public async Task InvalidateCache()
    {
        _cache.Remove(DEPARTMENTS_CACHE_KEY);
    }
}

// Redis cache (for large/shared data)
services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = configuration.GetConnectionString("Redis");
});
```

### 12.3 API Versioning

```csharp
// API versioning with URL
[ApiVersion("1.0")]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class UsersController : ControllerBase
{
    [HttpGet]
    [MapToApiVersion("1.0")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersV1()
    {
        // Version 1: returns legacy format
    }

    [HttpGet]
    [MapToApiVersion("2.0")]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> GetUsersV2()
    {
        // Version 2: returns new format
    }
}

// Usage:
// GET /api/v1/users  <- Version 1
// GET /api/v2/users  <- Version 2
```

### 12.4 Background Jobs ve Scheduled Tasks

```csharp
// Hangfire for background jobs
services.AddHangfire(configuration =>
{
    configuration.UseMongoStorage("mongodb://localhost:27017");
});
services.AddHangfireServer();

// Schedule a job
BackgroundJob.Enqueue(() => _emailService.SendEmailAsync(...));

// Recurring jobs
RecurringJob.AddOrUpdate(
    "send-daily-report",
    () => _reportService.SendDailyReportAsync(),
    Cron.Daily(9, 0));  // 9:00 AM daily

// Scheduled job
var jobId = BackgroundJob.Schedule(
    () => _notificationService.SendAsync(...),
    TimeSpan.FromHours(1));  // 1 hour from now
```

---

## Sonuç ve Roadmap

### Mevcut Özellikler (v1.0)
- ✅ Çalışan yönetimi
- ✅ İzin yönetimi
- ✅ İşe alım süreci
- ✅ Performans değerlendirmesi
- ✅ Devam takibi
- ✅ Belgeler yönetimi
- ✅ Bildirimler
- ✅ Rol bazlı erişim kontrol
- ✅ JWT authentication
- ✅ Captcha doğrulaması

### Planlanan Özellikler (v2.0)
- 🔜 Multi-language support (EN, DE, FR)
- 🔜 Mobile app (iOS/Android)
- 🔜 Advanced reporting (BI integration)
- 🔜 Payroll integration
- 🔜 Time tracking
- 🔜 Expense management
- 🔜 Learning management system
- 🔜 360-degree feedback
- 🔜 Succession planning

---

**Dokümantasyon Sonu**

Sorular, öneriler veya düzeltmeler için: [support@seedhr.com.tr]

Versiyon: 1.0 | Tarih: 2026-06-05 | Yazar: Development Team
