# SeedHR — Geliştirme Planı

Mevcut kodun detaylı incelenmesi sonucunda tespit edilen tüm eksiklikler, hatalar ve geliştirme alanları.  
Her madde: **Nerede**, **Ne Problem**, **Nasıl Çözülecek** şeklinde.

---

## 1. AI Modülü — Gerçek Kullanıcı Verisi Bağlamı (KRİTİK)

### 1.1 Chat — Mock Politika Metni Yerine Gerçek DB Verisi

**Dosya:** `src/Controllers/AiController.cs:253-307`

**Problem:**  
`/api/ai/chat` endpoint'inde sistem promptu tamamen hardcode edilmiş statik şirket politikası metnidir.  
Kullanıcı "kaç günlük iznim kaldı?" diye sorduğunda AI gerçek bakiyeyi değil, genel "14 iş günü" politikasını döner.  
Aynı şekilde "bu ay kaç gün devamsız kaldım?", "maaşım ne kadar?", "hangi görevlerim var?" gibi sorulara da gerçek veri yerine sahte yanıt üretilir.

**Köken:**  
`systemPrompt` string'i request'teki `userId`'yi hiç kullanmaz. DB'ye hiç sorgu atılmaz.

**Çözüm:**

1. `ChatRequest`'e `string UserId` eklenir (veya JWT'den `sub` claim'i alınır — tercih edilen yol).
2. Gelen mesajın intent'i belirlenir (basit keyword matching yeterli):
   - `"izin"`, `"tatil"`, `"gün"` → `LeaveBalances` + `LeaveRequests` çekilir
   - `"devam"`, `"giriş"`, `"çıkış"` → `Attendances` son 30 gün çekilir
   - `"maaş"`, `"bordro"` → `Payrolls` son 3 dönem çekilir
   - `"görev"`, `"hedef"`, `"performance"` → `PerformanceGoals` çekilir
3. Çekilen veriler `systemPrompt`'a JSON olarak eklenir.
4. AI hem politikayı hem de gerçek veriyi bilerek yanıt verir.

```csharp
// Örnek: LeaveBalance bağlamı ekleme
var userId = User.FindFirst("sub")?.Value;
var balances = await _unitOfWork.LeaveBalances.GetByUserAsync(userId);
var contextJson = JsonSerializer.Serialize(balances.Select(b => new {
    tip = b.LeaveType?.Name,
    toplam = b.TotalDays,
    kullanılan = b.UsedDays,
    kalan = b.RemainingDays
}));
systemPrompt += $"\n\nKullanıcının gerçek izin bakiyeleri:\n{contextJson}";
```

**Etki:** Yüksek — chatbot şu an işlevsiz, gerçek değer üretmiyor.

---

### 1.2 `score-all` Endpoint — Stub Implementasyon

**Dosya:** `src/Controllers/AiController.cs:212-245`

**Problem:**  
`POST /api/ai/score-all/{jobPostingId}` tüm adayları sıfır skorlu "Beklemede / Değerlendirilmedi" placeholder'ı olarak döner.  
Hiç AI çağrısı yapılmaz.

**Çözüm:**  
Her aday için `ScoreCv` lojiğini çalıştır. Adaylar paralel işlenmeli (API rate limit'e dikkat ederek `SemaphoreSlim` ile maks 5 eş zamanlı).

```csharp
var semaphore = new SemaphoreSlim(5);
var tasks = candidates.Select(async c => {
    await semaphore.WaitAsync();
    try { return await ScoreSingleCandidateAsync(c, jobPosting); }
    finally { semaphore.Release(); }
});
var results = await Task.WhenAll(tasks);
```

---

### 1.3 `AiMatchScore` — Random Değer

**Dosya:** `src/Services/Implementations/RecruitmentService.cs:37,64`

**Problem:**  
```csharp
AiMatchScore = new Random().Next(60, 96)
```  
Aday oluşturulurken AI skoru rastgele atanıyor. Gerçek bir değerlendirme yapılmıyor.

**Çözüm:**  
Aday kayıt edilirken `AiMatchScore` hesaplanmamalı. Bunun yerine:
- `AiMatchScore` nullable (`int?`) yapılır, varsayılan `null`.
- `POST /api/ai/score-cv/{candidateId}` çağrıldıktan sonra DB'de güncellenir.
- Frontend skorsuz adaylara "Puanlanmamış" etiketi gösterir.

---

### 1.4 `HttpClient` Authorization Header Sızıntısı

**Dosya:** `src/Controllers/AiController.cs:103-104, 273-274, 384-385`

**Problem:**  
```csharp
var client = _httpClientFactory.CreateClient();
client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_groqApiKey}");
```
`IHttpClientFactory` her çağrıda aynı `HttpClient` örneğini dönebilir. `DefaultRequestHeaders.Add` thread-safe değildir ve birden fazla concurrent request'te başlık duplikasyonuna yol açar (`"Authorization: Bearer xxx, Bearer xxx"`).

**Çözüm:**  
Named client kayıt edilir:
```csharp
// Program.cs
builder.Services.AddHttpClient("groq", c => {
    c.DefaultRequestHeaders.Add("Authorization", $"Bearer {groqKey}");
    c.BaseAddress = new Uri("https://api.groq.com/");
});
// AiController'da:
var client = _httpClientFactory.CreateClient("groq");
```

---

### 1.5 AI Endpoint'lerinde Rate Limiting Yok

**Dosya:** `Program.cs:219` (Rate limiter comment-out edilmiş)

**Problem:**  
`/api/ai/chat`, `/api/ai/score-cv` gibi dışarıya (Groq API'ye) çağrı yapan endpoint'lerde hiçbir rate limiting uygulanmıyor. Kötü niyetli kullanım veya hatalı frontend döngüsü API anahtarı kotasını bitirebilir.

**Çözüm:**  
`app.UseRateLimiter()` aktif edilir ve AI endpoint'lerine özel policy eklenir:
```csharp
// Program.cs
builder.Services.AddRateLimiter(opt => {
    opt.AddFixedWindowLimiter("ai", o => {
        o.PermitLimit = 10;
        o.Window = TimeSpan.FromMinutes(1);
    });
});
// AiController üstüne:
[EnableRateLimiting("ai")]
```

---

## 2. Veri Katmanı N+1 Sorunları

### 2.1 PayrollService — `GetPayrollsByPeriodAsync` N+1

**Dosya:** `src/Services/Implementations/PayrollService.cs:102-113`

**Problem:**  
```csharp
foreach (var p in list)
{
    var user = await _unitOfWork.Users.GetByIdAsync(p.UserId); // Her bordro için 1 sorgu!
```
100 çalışana ait bordro dönmek = 100 ayrı MongoDB round-trip.

**Çözüm:**  
Tüm userId'leri topla, `$in` filtresi ile tek sorguda çek:
```csharp
var userIds = list.Select(p => p.UserId).ToHashSet();
var users = (await _unitOfWork.Users.FindAsync(u => userIds.Contains(u.Id)))
    .ToDictionary(u => u.Id);
```

---

### 2.2 RecruitmentService — `GetInterviewsAsync` Tüm Koleksiyonları Yüklüyor

**Dosya:** `src/Services/Implementations/RecruitmentService.cs:226-246`

**Problem:**  
```csharp
var candidates = (await _unitOfWork.Candidates.GetAllAsync()).ToDictionary(c => c.Id);
var users      = (await _unitOfWork.Users.GetAllAsync()).ToDictionary(u => u.Id);
var jobPostings = (await _unitOfWork.JobPostings.GetAllAsync()).ToDictionary(j => j.Id);
```
Sistemde kaç aday, kullanıcı, ilan olursa olsun hepsi belleğe yükleniyor.

**Çözüm:**  
Önce interview'lardan ilgili ID'leri topla, sonra sadece onları çek:
```csharp
var candidateIds  = interviews.Select(i => i.CandidateId).ToHashSet();
var userIds       = interviews.Select(i => i.InterviewerUserId).ToHashSet();
var jobPostingIds = interviews.Select(i => i.JobPostingId).ToHashSet();

var candidatesTask   = _unitOfWork.Candidates.FindAsync(c => candidateIds.Contains(c.Id));
var usersTask        = _unitOfWork.Users.FindAsync(u => userIds.Contains(u.Id));
var jobPostingsTask  = _unitOfWork.JobPostings.FindAsync(j => jobPostingIds.Contains(j.Id));

await Task.WhenAll(candidatesTask, usersTask, jobPostingsTask);
```

---

### 2.3 RecruitmentService — `GetReferencesForCandidateAsync` N+1

**Dosya:** `src/Services/Implementations/RecruitmentService.cs:327-336`

**Problem:**  
```csharp
foreach (var r in refs)
{
    r.Candidate = await _unitOfWork.Candidates.GetByIdAsync(r.CandidateId); // Loop içinde await!
```
Tek aday için bile tüm referanslar tek tek sorgulanıyor.

**Çözüm:**  
Referanslar aynı `candidateId`'ye ait olduğundan aday bir kez çekip tüm referanslara atanır:
```csharp
var candidate = await _unitOfWork.Candidates.GetByIdAsync(candidateId);
foreach (var r in refs)
    r.Candidate = candidate;
```

---

## 3. Sayfalama (Pagination) — Hiç Yok

**Etkilenen dosyalar:** Tüm `GetAllAsync` çağrıları olan tüm servisler ve controller'lar.

**Problem:**  
`/api/users`, `/api/attendance`, `/api/payrolls/period/...` gibi endpoint'ler tüm kayıtları döner. Sistemde 500 çalışan, 10.000 devamsızlık kaydı, 1.000 bordro olduğunda her liste isteği tüm koleksiyonu çeker.

**Çözüm:**  
`MongoRepository<T>`'ye `GetPagedAsync` eklenir:
```csharp
// IRepository.cs
Task<(IEnumerable<T> Items, int TotalCount)> GetPagedAsync(
    Expression<Func<T, bool>>? filter,
    int page,
    int pageSize,
    Expression<Func<T, object>>? sortBy = null,
    bool descending = false
);
```
Controller'lar `?page=1&pageSize=20` query parametresi alır. Response'a `totalCount`, `totalPages` eklenir.

**Öncelik sırası:** Users, Attendance, Payrolls, LeaveRequests, Notifications.

---

## 4. Önbellekleme (Caching) — Hiç Yok

**Problem:**  
Her request'te departmanlar, pozisyonlar, roller ve izin tipleri yeniden veritabanından çekiliyor. Bu veriler nadiren değişir.  
`UserService.PopulateNavigationPropertiesBulkAsync` her kullanıcı listesi isteğinde 4 ayrı koleksiyon çeker.

**Çözüm:**  
`IMemoryCache` ile static lookup veriler cache'lenir:
```csharp
// Program.cs
builder.Services.AddMemoryCache();

// DepartmentService örneği
public async Task<IEnumerable<DepartmentDto>> GetAllAsync()
{
    if (_cache.TryGetValue("departments", out var cached))
        return (IEnumerable<DepartmentDto>)cached!;

    var result = _mapper.Map<IEnumerable<DepartmentDto>>(await _unitOfWork.Departments.GetAllAsync());
    _cache.Set("departments", result, TimeSpan.FromMinutes(10));
    return result;
}
```
Cache create/update/delete işlemlerinde `InvalidateAsync("departments")` ile temizlenir.

**Servisler:** DepartmentService, PositionService, RoleService, LeaveTypeService.

---

## 5. PayrollService — Hardcoded Maaş

**Dosya:** `src/Services/Implementations/PayrollService.cs:38-41`

**Problem:**  
```csharp
decimal baseSalary = 45000;
if (user.RoleId == "role_admin")   baseSalary = 120000;
else if (user.RoleId == "role_manager") baseSalary = 75000;
```
Çalışanın gerçek maaşı yerine rol bazlı hardcoded değer kullanılıyor.

**Çözüm:**  
`User` entity'sine `decimal BaseSalary` alanı eklenir. Yoksa `Position` entity'sindeki `SalaryRange` alt değeri kullanılır.  
`CalculatePayrollAsync` bu değeri okur:
```csharp
decimal baseSalary = user.BaseSalary > 0 ? user.BaseSalary
    : (position?.MinSalary ?? 45000);
```

---

## 6. ImportController — Satır Satır Insert

**Dosya:** `src/Controllers/ImportController.cs:83, 133, 232`

**Problem:**  
```csharp
await _context.Departments.InsertOneAsync(dept);    // Her satır için ayrı DB yazma!
await _context.Positions.InsertOneAsync(pos);
await _context.Users.InsertOneAsync(user);
```
1000 kullanıcılık Excel import = 1000 ayrı MongoDB yazma işlemi.

**Çözüm:**  
Önce tüm geçerli entity'ler bir listeye toplanır, sonra tek seferde `InsertManyAsync`:
```csharp
var validDepts = rows
    .Where(r => !string.IsNullOrWhiteSpace(GetValue(r, "Name", "Ad")))
    .Select(r => BuildDepartment(r))
    .ToList();

await _context.Departments.InsertManyAsync(validDepts);
result.DepartmentsImported = validDepts.Count;
```

---

## 7. AttendanceRepository — `.Date` MongoDB'ye Çevrilmiyor

**Dosya:** `src/Repository/Implementations/RepositoriesShort.cs:99-100, 106-107`

**Problem:**  
```csharp
a => a.CheckInTime.Value.Date == date.Date
```
`.Date` (DateTime'ın günün başlangıcına round-down eden property) MongoDB LINQ translator'ı tarafından desteklenmeyebilir. Bazı sürümlerde client-side evaluation'a düşer (tüm koleksiyon belleğe çekilip C#'ta filtre).

**Çözüm:**  
Tarihin başlangıç ve bitiş sınırları hesaplanır:
```csharp
var startOfDay = date.Date;
var endOfDay   = startOfDay.AddDays(1);

a => a.CheckInTime.HasValue
  && a.CheckInTime.Value >= startOfDay
  && a.CheckInTime.Value < endOfDay
```

---

## 8. Yeni İzin Talebi — Yöneticiye Bildirim Gönderilmiyor

**Dosya:** `src/Services/Implementations/LeaveService.cs:56-60`

**Problem:**  
Çalışan izin talebinde bulunduğunda sadece DB'ye kayıt açılıyor. İzni onaylaması gereken yönetici/HR'a hiç bildirim gitmiyor.  
Onay yapıldığında çalışana bildirim gönderiliyor (`LeaveService.cs:86-92`) ama ters yönde (talep → yönetici) yok.

**Çözüm:**  
`CreateLeaveRequestAsync` içinde izin oluşturulduktan sonra:
```csharp
// Kullanıcının yöneticisini bul (user.ManagerId) veya HR rolündeki kullanıcıları
var managers = await _unitOfWork.Users.FindAsync(u => u.RoleId == "role_hr" || u.Id == user.ManagerId);
foreach (var manager in managers)
{
    await _notificationService.CreateNotificationAsync(
        manager.Id,
        "Yeni İzin Talebi",
        $"{user.FullName} izin talebinde bulundu ({request.DaysRequested} gün, {request.StartDate:dd.MM.yyyy}–{request.EndDate:dd.MM.yyyy})",
        "LeaveRequest", created.Id, "LeaveRequest"
    );
}
```

---

## 9. Import — Hardcoded Default Parola

**Dosya:** `src/Controllers/ImportController.cs:160`

**Problem:**  
```csharp
var defaultPassword = _passwordHasher.Hash("SeedHR2026!");
```
Import edilen tüm kullanıcılar aynı hardcoded şifreyle oluşturuluyor. Bu şifre kodda yazılı.

**Çözüm Seçenekleri:**
- **A)** Şifre Excel'deki `Password` kolonundan okunur (şifreli sütun, import sonrası temizlenir).
- **B)** Her kullanıcıya rastgele şifre üretilir ve `result.TempPasswords` listesine eklenerek response'da döner (tek seferlik görüntüleme).
- **C)** Kullanıcı oluşturulurken "şifre sıfırlama gerekli" flag'i set edilir, ilk girişte değiştirmesi zorlanır. (Önerilen)

---

## 10. `RecruitmentService.CreateInterviewAsync` — Otomatik Görüşmeci Seçimi

**Dosya:** `src/Services/Implementations/RecruitmentService.cs:198-200`

**Problem:**  
```csharp
var hrUser = (await _unitOfWork.Users.FindAsync(u => u.RoleId == "role_hr" || u.RoleId == "role_admin"))
    .FirstOrDefault();
var interviewerId = hrUser?.Id ?? "default_interviewer";
```
Görüşme oluşturulurken görüşmeci otomatik ve rastgele seçiliyor. `InterviewerUserId` request'ten alınmıyor.

**Çözüm:**  
`CreateInterviewRequest`'e `string InterviewerUserId` eklenir. Boş gelirse mevcut fallback kalabilir ama override edilebilir olmalı.

---

## 11. Pagination Olmayan Listeler — Frontend'de Sonsuz Yükleme Potansiyeli

Aşağıdaki endpoint'ler için öncelikli pagination eklenmeli:

| Endpoint | Servis Metodu | Risk |
|---|---|---|
| `GET /api/users` | `GetAllUsersAsync` | Yüzlerce çalışan |
| `GET /api/attendance` | `GetAllAttendanceAsync` | Binlerce kayıt |
| `GET /api/payrolls/period/{p}` | `GetPayrollsByPeriodAsync` | Tüm çalışanlar |
| `GET /api/notifications/user/{id}` | `GetUserNotificationsAsync` | Birikmiş bildirimler |
| `GET /api/recruitment/candidates` | `GetCandidatesAsync` | Sınırsız aday |
| `GET /api/lms/assignments/user/{id}` | İlgili metot | Kurs birikimleri |

---

## 12. Öncelik Sırası

| # | Alan | Öncelik | Tahmini Efor |
|---|---|---|---|
| 1.1 | AI Chat — Gerçek kullanıcı verisi | Kritik | 1 gün |
| 1.4 | HttpClient header sızıntısı | Kritik | 30 dk |
| 2.1 | PayrollService N+1 | Yüksek | 2 saat |
| 2.2 | RecruitmentService N+1 | Yüksek | 2 saat |
| 2.3 | ReferenceCheck N+1 | Yüksek | 30 dk |
| 5 | Hardcoded maaş | Yüksek | 3 saat (User entity değişimi) |
| 7 | Attendance `.Date` bug | Yüksek | 30 dk |
| 8 | İzin bildirimi yöneticiye | Orta | 1 saat |
| 6 | Import bulk insert | Orta | 1 saat |
| 4 | Memory cache | Orta | 2 saat |
| 3 | Pagination | Orta | 1 gün |
| 1.2 | score-all gerçek implementasyon | Orta | 3 saat |
| 1.3 | AiMatchScore gerçek hesaplama | Orta | 2 saat |
| 1.5 | AI rate limiting | Düşük | 30 dk |
| 9 | Import şifre politikası | Düşük | 1 saat |
| 10 | Görüşmeci seçimi | Düşük | 30 dk |
| 11 | Tüm listeler pagination | Uzun vade | 2 gün |
