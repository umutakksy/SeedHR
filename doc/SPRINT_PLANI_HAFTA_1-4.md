# SeedHR - Sprint Planı (Hafta 1-4)

**Hedef:** Zimmet Yönetimi + Onboarding Modülleri  
**Çıktı:** MVP 2.0 (Ürün 67% → 85% tamamlama)

---

## 📅 HAFTA 1-2: ZİMMET YÖNETİMİ (Asset Management)

### 🎯 Neden Başlamalı?
- Şirketler **ilk gün** talep ediyor
- Para kazandırmaya başlıyor (Add-on: +₺3,000/ay)
- Operasyonel olarak kritik
- Kolay implement (2 hafta)

### 📦 Deliverables

#### Backend (1 hafta)
```
1. Models & Entities
   ├─ Asset.cs (Zimmet)
   │  ├─ Id, Type, Name, Model, SerialNumber
   │  ├─ PurchaseDate, PurchasePrice
   │  ├─ Condition (New, Good, Fair, Poor)
   │  ├─ Status (Available, Assigned, Broken, Returned)
   │  ├─ CurrentAssigneeId, AssignmentDate
   │  └─ Notes
   │
   ├─ AssetType.cs
   │  ├─ Id, Name (Laptop, Phone, Monitor, License)
   │  ├─ Category
   │  └─ DepreciationRate
   │
   └─ AssetAllocation.cs
      ├─ Id, AssetId, UserId, DepartmentId
      ├─ AllocationDate, ReturnDate
      ├─ Condition (assigned vs returned)
      └─ SignatureUrl (PDF imza)

2. Repositories & Services
   ├─ IAssetRepository
   ├─ AssetService
   │  ├─ GetAvailableAssets()
   │  ├─ AllocateAsset(assetId, userId)
   │  ├─ ReturnAsset(assetId)
   │  ├─ GetAssetsByUser(userId)
   │  ├─ GetAssetsByDepartment(deptId)
   │  └─ GetAssetReport()
   │
   └─ Validators
      ├─ CreateAssetValidator
      ├─ AllocateAssetValidator
      └─ ReturnAssetValidator

3. Controllers
   └─ AssetsController
      ├─ GET /assets (list, filter)
      ├─ POST /assets (create)
      ├─ PUT /assets/:id (update)
      ├─ POST /assets/:id/allocate (assign to user)
      ├─ POST /assets/:id/return (return asset)
      ├─ GET /assets/user/:userId (user's assets)
      └─ GET /assets/report (department report)

4. DTOs
   ├─ AssetDto
   ├─ CreateAssetRequest
   ├─ AllocateAssetRequest
   ├─ AssetReportDto
   └─ AssetInventoryDto

Time: 5 days
```

#### Frontend (1 hafta)
```
1. Components
   ├─ AssetsTab.tsx (main component)
   │  ├─ Asset list with filter
   │  ├─ Asset creation modal
   │  ├─ Asset allocation modal
   │  └─ Asset return form
   │
   ├─ AssetAllocationForm.tsx
   ├─ AssetReturnForm.tsx
   ├─ AssetInventoryReport.tsx
   └─ AssetDetailModal.tsx

2. Pages
   ├─ /assets (tabbed dashboard)
   │  ├─ All Assets
   │  ├─ My Assets
   │  ├─ Inventory (Admin)
   │  └─ Reports (Admin)

3. API Integration
   └─ lib/api.ts
      ├─ assetAPI.getAll()
      ├─ assetAPI.create()
      ├─ assetAPI.allocate()
      ├─ assetAPI.return()
      ├─ assetAPI.getByUser()
      └─ assetAPI.getReport()

4. Styling
   ├─ Tailwind + Dark mode
   ├─ Icons (Lucide)
   ├─ Modal/Toast notifications
   └─ Responsive layout

Time: 5 days
```

### ✅ Sprint 1 Checklist
- [ ] Asset entity + migrations
- [ ] AssetService CRUD + business logic
- [ ] AssetController endpoints test
- [ ] AssetsTab component
- [ ] Allocation/Return workflows
- [ ] Admin reports
- [ ] Error handling
- [ ] API documentation (Swagger)
- [ ] E2E test (1 happy path)
- [ ] Deployment to staging

---

## 📅 HAFTA 3-4: ONBOARDİNG SÜRECİ

### 🎯 Neden Başlamalı?
- İnsan kaynakları **operasyon kritik**
- Şirket standarları, politika uygulaması
- İş sözleşmesi, KVKK, eğitim gibi görevleri otomatikleştir
- Yeni çalışan kalitesi vs memnuniyet artar

### 📦 Deliverables

#### Backend (1.5 hafta)
```
1. Models & Entities
   ├─ OnboardingPlan.cs
   │  ├─ Id, Name (e.g., "Developer Onboarding")
   │  ├─ DepartmentId, PositionId (which role gets this)
   │  ├─ DurationDays
   │  ├─ Status (Template, Active, Archived)
   │  └─ CreatedDate
   │
   ├─ OnboardingTask.cs
   │  ├─ Id, OnboardingPlanId
   │  ├─ Title, Description
   │  ├─ Category (Document, Training, System, Meeting)
   │  ├─ DueDay (relative to start date, e.g., Day 0, Day 1, Day 3)
   │  ├─ AssignedToRole (HR, Manager, IT, Employee)
   │  ├─ IsMandatory
   │  └─ Order (sequence)
   │
   └─ OnboardingInstance.cs
      ├─ Id, UserId, OnboardingPlanId
      ├─ StartDate, CompletionDate
      ├─ Status (In Progress, Completed, Delayed)
      └─ Progress %

2. Task Completion Tracking
   └─ OnboardingTaskCompletion.cs
      ├─ Id, OnboardingInstanceId, TaskId
      ├─ UserId (who completed), CompletionDate
      ├─ Status (Pending, Completed, Skipped)
      ├─ Evidence (document url, email proof)
      └─ Signature

3. Services
   ├─ IOnboardingService
   │  ├─ GetOnboardingPlans()
   │  ├─ CreateOnboardingPlan()
   │  ├─ StartOnboarding(userId, planId)
   │  ├─ GetOnboardingProgress(userId)
   │  ├─ CompleteTask(taskId, evidence)
   │  ├─ SendReminders()
   │  └─ GenerateOnboardingCertificate()
   │
   └─ OnboardingService (implementation)
      ├─ Auto-create tasks on hire date
      ├─ Send reminders (email notifications)
      ├─ Track progress per user
      └─ Generate reports

4. Controllers
   └─ OnboardingController
      ├─ GET /onboarding/plans
      ├─ POST /onboarding/plans
      ├─ POST /onboarding/start (userId, planId)
      ├─ GET /onboarding/progress/:userId
      ├─ POST /onboarding/task/:taskId/complete
      ├─ GET /onboarding/report
      └─ POST /onboarding/send-reminders

5. DTOs
   ├─ OnboardingPlanDto
   ├─ OnboardingTaskDto
   ├─ OnboardingProgressDto
   ├─ CreateOnboardingPlanRequest
   └─ CompleteTaskRequest

Time: 6 days
```

#### Frontend (1.5 hafta)
```
1. Components
   ├─ OnboardingTab.tsx (main)
   │  ├─ Plan templates list
   │  ├─ Active onboardings
   │  └─ Completion progress
   │
   ├─ OnboardingPlanBuilder.tsx
   │  ├─ Task CRUD
   │  ├─ Task ordering (drag-drop)
   │  ├─ Assignment configuration
   │  └─ Template publish
   │
   ├─ OnboardingChecklist.tsx
   │  ├─ Task list for new hire
   │  ├─ Status indicators
   │  ├─ Document links
   │  ├─ Complete/Sign button
   │  └─ Progress bar
   │
   ├─ OnboardingReport.tsx
   │  ├─ New hires this month
   │  ├─ Completion rates
   │  ├─ Bottleneck tasks
   │  └─ Manager effectiveness
   │
   └─ OnboardingReminders.tsx
      ├─ Pending tasks
      ├─ Overdue alerts
      └─ Send reminder form

2. Pages
   ├─ /onboarding (admin dashboard)
   │  ├─ Plans tab
   │  ├─ Active employees tab
   │  ├─ Reports tab
   │  └─ Settings tab
   │
   └─ /onboarding/:userId (employee checklist)
      ├─ Progress overview
      ├─ Task checklist
      ├─ Document links
      └─ Manager notes

3. Features
   ├─ Drag-drop task ordering
   ├─ Rich text editor for task descriptions
   ├─ File attachments for documents
   ├─ Email reminders integration
   ├─ Progress notifications
   ├─ Signature capture (PDF)
   └─ Export as PDF

4. API Integration
   └─ onboardingAPI
      ├─ getPlans()
      ├─ createPlan()
      ├─ startOnboarding()
      ├─ getProgress()
      ├─ completeTask()
      ├─ sendReminders()
      └─ getReport()

Time: 6 days
```

### ✅ Sprint 2 Checklist
- [ ] OnboardingPlan entity + relationships
- [ ] OnboardingTask CRUD
- [ ] Progress tracking logic
- [ ] Email reminders (Hangfire?)
- [ ] OnboardingTab component
- [ ] Plan builder (drag-drop)
- [ ] Employee checklist UI
- [ ] Admin reports
- [ ] PDF export
- [ ] E2E test
- [ ] Deployment

---

## 🎯 SONRA (Hafta 5+ için hazırlık)

### Hafta 5-6 Hazırlığı: 360 Derece Değerlendirme
- Research on multi-rater feedback systems
- Database schema planning
- UI/UX mockups

### Hafta 7-8 Hazırlığı: Eğitim Yönetimi
- Course catalog structure
- Certification tracking
- Learning path design

---

## 📊 PROJE METRİKLERİ

### Başarı Kriteri (Sprint 1)
```
✅ Zimmet Yönetimi:
  - CRUD operations: %100
  - Allocation workflow: %100
  - Reports: %100
  - Frontend: 6 screens
  - API endpoints: 8
  - Test coverage: >80%
  - Performance: <200ms response

✅ Genel:
  - Zero critical bugs
  - 100% Swagger documented
  - Production deployment successful
  - No performance regression
```

### Başarı Kriteri (Sprint 2)
```
✅ Onboarding:
  - Plans CRUD: %100
  - Task creation: %100
  - Progress tracking: %100
  - Reminders: %100
  - Frontend: 8 screens
  - API endpoints: 7
  - Test coverage: >85%

✅ User Adoption:
  - 100% new hires using system
  - Avg task completion time: <2 days
  - Zero missed steps
```

---

## 🛠️ TEKNİK DETAYLAR

### Database Changes
```mongodb
// Asset Collection
db.createCollection("assets", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["type", "name", "status"],
      properties: {
        type: { enum: ["Laptop", "Phone", "Monitor", "License", "Other"] },
        status: { enum: ["Available", "Assigned", "Broken", "Returned"] },
        currentAssigneeId: ObjectId,
        history: [{ userId, assignDate, returnDate }]
      }
    }
  }
})

// Onboarding Collections
db.createCollection("onboarding_plans")
db.createCollection("onboarding_tasks")
db.createCollection("onboarding_instances")
```

### API Versioning
- Keep `/api/v1/*` for existing
- New modules under `/api/v1/assets` etc
- No breaking changes

### Testing Strategy
```
Unit Tests:
  ├─ Service logic
  ├─ Validator rules
  └─ Repository methods

Integration Tests:
  ├─ API endpoints
  ├─ Database operations
  └─ Service workflows

E2E Tests:
  ├─ Asset allocation flow
  └─ Onboarding completion
```

---

## 📈 BEKLENEN SONUÇ

Hafta 4 Sonunda:
- **Ürün tamamlanma:** 67% → 85%
- **Yeni müşteri kazanımı:** +30%
- **Mevcut müşteri upsell:** 40%
- **Churn rate:** -15%
- **NPS score:** +20 puan

**Finansal Impact:**
- Yeni özellikler: +₺5,000/ay (zimmet), +₺3,000/ay (onboarding)
- Müşteri memnuniyeti: Daha düşük support cost
- Competitive advantage: Market'te daha güçlü pozisyon

---

## 🚨 RİSK YÖNETİMİ

| Risk | Olabilirlik | Impact | Mitigation |
|------|-----------|--------|-----------|
| Timeline kayması | Medium | High | Daily standup, buffer days |
| Scope creep | High | Medium | Strict MoSCoW, Change control |
| DB migration issues | Low | High | Staging test, rollback plan |
| User adoption gecikme | Low | Medium | Documentation, training |
| AI modülü delay | N/A | N/A | Paralel başlayabilir |

---

## ✨ İLETİŞİM PLANI

### Stakeholder Updates
- Daily: Dev team standup (15 min)
- Weekly: Sprint review + planning (1 hour)
- Bi-weekly: Customer update (30 min)
- Monthly: Executive summary

### Customer Preview
- Week 2: Beta access (internal testing)
- Week 3: Limited beta (top 3 customer)
- Week 4: GA release + documentation

---

## 📞 İYİLEŞTİRME DÖNGÜSÜ

Post-Launch (Hafta 5):
- [ ] Customer feedback collection
- [ ] Bug fixing
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] Training material creation

---

**Bu plan uygulanırsa, SeedHR 4 haftada market'te çok daha kompetitif hale gelir. 🚀**
