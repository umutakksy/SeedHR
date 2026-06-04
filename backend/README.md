# SeedHR Backend

Kurumsal şirketler için İnsan Kaynakları Yönetim Sistemi - ASP.NET Core Backend

## Klasör Yapısı

```
backend/
├── src/
│   ├── Models/
│   │   ├── DTOs/              # Data Transfer Objects
│   │   └── Entities/          # Database Entities
│   ├── Controllers/            # API Controllers
│   ├── Services/
│   │   ├── Interfaces/        # Service Interfaces
│   │   └── Implementations/   # Service Implementations
│   ├── Repository/
│   │   ├── Interfaces/        # Repository Interfaces
│   │   └── Implementations/   # Repository Implementations
│   ├── Configuration/         # App Configuration Classes
│   ├── Security/
│   │   ├── Authentication/    # JWT/Auth Logic
│   │   └── Authorization/     # Permission & Role Management
│   ├── Middleware/            # Custom Middleware
│   ├── Exceptions/            # Custom Exception Classes
│   └── Utils/
│       ├── Mappers/          # AutoMapper Profiles
│       ├── Validators/       # Data Validators
│       └── Extensions/       # Extension Methods
├── tests/
│   ├── Unit/                 # Unit Tests
│   └── Integration/          # Integration Tests
├── .env.example              # Environment Variables Template
├── appsettings.json          # Configuration
├── Program.cs                # Entry Point
└── SeedHR.Backend.csproj     # Project File
```

## Başlamak

### 1. .env Dosyasını Oluştur
```bash
cp .env.example .env
```

### 2. MongoDB Bağlantısını Ayarla
`.env` dosyasında MongoDB bağlantı string'ini güncelleyin:
```
MONGODB_CONNECTION_STRING=mongodb://localhost:27017
MONGODB_DATABASE_NAME=seedhr
```

### 3. Dependencies Yükle
```bash
dotnet restore
```

### 4. Proje Çalıştır
```bash
dotnet run
```

Swagger UI: `http://localhost:5000/swagger`

## Teknolojiler

- **Framework**: ASP.NET Core 9.0
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Mapping**: AutoMapper
- **Validation**: FluentValidation
- **Logging**: Serilog
- **API Documentation**: Swagger/OpenAPI

## Özellikler

- RESTful API
- JWT-based Authentication
- Role-based Authorization
- MongoDB Integration
- CORS Support
- Comprehensive Logging
- Swagger Documentation

## Environment Variables

| Variable | Açıklama | Örnek |
|----------|----------|--------|
| `MONGODB_CONNECTION_STRING` | MongoDB bağlantı URL | `mongodb://localhost:27017` |
| `MONGODB_DATABASE_NAME` | Database adı | `seedhr` |
| `JWT_SECRET` | JWT imzalama anahtarı | `your_secret_key` |
| `JWT_EXPIRATION_HOURS` | Token geçerlilik süresi | `24` |
| `APP_ENVIRONMENT` | Ortam | `Development` / `Production` |
| `APP_PORT` | Uygulama portu | `5000` |
| `CORS_ALLOWED_ORIGINS` | İzin verilen CORS kaynakları | `http://localhost:3000` |
| `LOG_LEVEL` | Log seviyesi | `Information` |

## API Endpoints

(API endpoints daha sonra eklenecek)
