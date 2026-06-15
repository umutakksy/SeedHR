# SeedHR - Kurumsal İnsan Kaynakları Yönetim Sistemi

SeedHR, kurumsal şirketlerin insan kaynakları süreçlerini dijitalleştirmek, yönetmek ve otomatikleştirmek amacıyla geliştirilmiş modern bir İnsan Kaynakları Yönetim Sistemi (HRMS) uygulamasıdır. Proje, ölçeklenebilir bir arka uç (backend) mimarisi ile modern ve duyarlı bir ön uç (frontend) deneyimini bir araya getirir.

## Proje Mimarisi ve Teknolojiler

Sistem iki ana bileşenden ve bunları bir araya getiren bir orkestrasyon katmanından oluşmaktadır:

### 1. Backend (.NET API)
Sistemin iş mantığını ve veri erişim katmanını yöneten RESTful web servisidir.
- Framework: ASP.NET Core 9.0
- Veritabanı: MongoDB (NoSQL)
- Kimlik Doğrulama: JWT (JSON Web Tokens) tabanlı oturum yönetimi ve rol tabanlı yetkilendirme (Role-based Authorization)
- Eşleme: AutoMapper
- Doğrulama: FluentValidation
- Günlükleme (Logging): Serilog
- API Dokümantasyonu: Swagger / OpenAPI
- Testler: xUnit ile yazılmış Unit ve Entegrasyon testleri

### 2. Frontend (ASP.NET Razor Pages)
Projenin ön yüzünü (UI) oluşturan sunucu taraflı arayüzdür.
- Teknoloji: ASP.NET Razor Pages (Page + PageModel mimarisi)
- Yetkilendirme: Cookie-based Authentication (ClaimsIdentity)
- Form Doğrulama: Server-side + Unobtrusive Javascript validation

### 3. Altyapı ve Konteynerizasyon
- Konteyner Yönetimi: Docker ve Docker Compose
- Web Sunucusu / Tersine Vekil (Reverse Proxy): Nginx

---

## Modüller 

### Aktif Modüller
- Personel Yönetimi: Çalışan ekleme, güncelleme, listeleme, departman ve pozisyon tanımlama işlemleri.
- İzin Yönetimi: Yıllık izin, mazeret izni, hastalık izni gibi taleplerin oluşturulması, yöneticiler tarafından onaylanması veya reddedilmesi süreçleri.
- Doküman Yönetimi: Çalışanlara ait sözleşmeler, sertifikalar ve özlük belgelerinin sisteme yüklenmesi ve yönetimi.
- Duyuru Yönetimi: Şirket içi duyuruların oluşturulması ve çalışan paneline yansıtılması.
- Self Service Çalışan Portalı: Çalışanların kendi profillerini güncelleyebilmesi, izin taleplerini takip edebilmesi ve giriş-çıkış (Check-in/Check-out) işlemlerini yapabilmesi.
- İşe Alım ve ATS (Aday Takip Sistemi): Açık pozisyonların yönetimi, aday havuzu, mülakat süreçleri ve harici kariyer portalı üzerinden iş başvurularının alınması.



## Proje Klasör Yapısı

```text
SeedHR/
├── backend/                              - .NET 9.0 Web API Katmanı
│   ├── src/                              - Backend kaynak kodları
│   │   ├── Configuration/                - Uygulama yapılandırma sınıfları
│   │   ├── Controllers/                  - REST API Uç noktaları (Endpoints)
│   │   ├── Exceptions/                   - Özel hata sınıfları (Custom Exceptions)
│   │   ├── Middleware/                   - Özel ara katman yazılımları
│   │   ├── Models/
│   │   │   ├── DTOs/                     - Veri transfer nesneleri (Data Transfer Objects)
│   │   │   └── Entities/                 - Veritabanı varlıkları (MongoDB şemaları)
│   │   ├── Repository/
│   │   │   ├── Implementations/          - Veritabanı erişim sınıfları (DataAccess)
│   │   │   └── Interfaces/               - Repository arayüzleri
│   │   ├── Security/
│   │   │   ├── Authentication/           - JWT oturum açma mantığı
│   │   │   └── Authorization/            - Yetkilendirme ve rol kontrolleri
│   │   ├── Services/
│   │   │   ├── Implementations/          - İş mantığı (Business Logic) sınıfları
│   │   │   └── Interfaces/               - Servis arayüzleri
│   │   └── Utils/                        - Mapper profilleri, doğrulayıcılar ve uzantılar
│   ├── tests/                            - Test katmanı
│   │   ├── Integration/                  - Entegrasyon testleri
│   │   └── Unit/                         - Birim testleri
│   ├── .env.example                      - Çevre değişkenleri şablon dosyası
│   ├── appsettings.json                  - Proje yapılandırma dosyası
│   ├── Program.cs                        - Uygulama başlangıç dosyası (Entrypoint)
│   ├── SeedHR.Backend.csproj             - Proje bağımlılık dosyası
│   └── Dockerfile                        - Backend Docker derleme dosyası
│
├── frontend/                             - ASP.NET Razor Pages Frontend Katmanı
│   ├── Models/                           - Sayfa modelleri ve view modelleri
│   ├── Pages/                            - CSHTML sayfaları ve arkasındaki C# kodları (.cshtml.cs)
│   ├── Properties/                       - Başlangıç ayarları (launchSettings.json)
│   ├── Services/                         - Backend API ile iletişim kuran servis sınıfları
│   ├── wwwroot/                          - Statik dosyalar (CSS, JS, resimler vb.)
│   ├── appsettings.json                  - Frontend yapılandırma dosyası
│   ├── Program.cs                        - Frontend başlangıç dosyası
│   ├── frontend.csproj                   - Proje bağımlılık dosyası
│   └── Dockerfile                        - Frontend Docker derleme dosyası
│
├── nginx/                                - Nginx Tersine Vekil Sunucusu Yapılandırması
│   ├── default.conf                      - Nginx yerel sunucu rota yapılandırması
│   ├── seedhr-host.nginx.conf            - Üretim (Production) ortamı Nginx yapılandırma şablonu
│   └── Dockerfile                        - Nginx Docker derleme dosyası
│
└── docker-compose.yml                    - Çoklu konteyner (API, UI, DB, Proxy) yönetim dosyası
```

---

## Kurulum ve Çalıştırma

Projenin yerel geliştirme ortamında çalıştırılması için iki farklı yöntem mevcuttur:

### 1. Docker Compose ile Çalıştırma (Önerilen)
Tüm servisleri (MongoDB, API, Razor Pages Frontend, Nginx) tek bir komutla ayağa kaldırmak için Docker Compose kullanabilirsiniz.

Gereksinimler:
- Docker ve Docker Compose kurulu olmalıdır.

Adımlar:
1. Projenin kök dizininde bir terminal açın.
2. Servisleri derleyin ve arka planda çalıştırın:
   ```bash
   docker-compose up --build -d
   ```
3. Docker Compose, servisleri şu portlarda ayağa kaldıracaktır:
   - Nginx Yönlendirici (Dış Erişim): http://localhost:8085
   - Backend API (Doğrudan Erişim): http://localhost:5005
   - Razor Pages Frontend (Doğrudan Erişim): http://localhost:5205
   - MongoDB (Yerel Erişim): localhost:27017

### 2. Manuel Olarak Yerel Geliştirme Ortamında Çalıştırma

#### Backend Kurulumu:
Gereksinimler:
- .NET SDK 9.0 ve MongoDB (yerel veya bulut üzerinde) kurulu olmalıdır.

Adımlar:
1. `backend` klasörüne geçiş yapın.
2. `.env.example` dosyasını `.env` olarak kopyalayın:
   ```bash
   cp .env.example .env
   ```
3. `.env` dosyasındaki veritabanı bağlantı bilgilerini ve JWT ayarlarını kendi yerel ortamınıza göre güncelleyin.
4. Bağımlılıkları yükleyin ve projeyi çalıştırın:
   ```bash
   dotnet restore
   dotnet run
   ```
5. API varsayılan olarak http://localhost:5000 adresinden çalışmaya başlayacaktır. Swagger arayüzüne http://localhost:5000/swagger adresinden erişebilirsiniz.

---


