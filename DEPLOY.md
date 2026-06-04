# SeedHR - AWS Dağıtım Rehberi (Deployment Guide)

Bu proje Docker Compose kullanılarak paketlenmiştir. Projeyi AWS EC2 veya benzeri bir Linux sunucusuna en hızlı ve sorunsuz şekilde dağıtmak (deploy etmek) için aşağıdaki yöntemleri izleyebilirsiniz.

---

## Gereksinimler (Sunucuda Olması Gerekenler)
AWS EC2 sunucunuzda aşağıdaki araçların kurulu olduğundan emin olun:
- **Git** (`sudo apt install git`)
- **Docker** (`sudo apt install docker.io`)
- **Docker Compose** (`sudo apt install docker-compose-v2` veya `docker-compose`)

---

## 1. Yöntem: Git ile Dağıtım (Önerilen ve En Hızlı Yol) 🚀

Yerel bilgisayarınızdaki `bin/`, `obj/` gibi derleme klasörlerini SFTP ile sunucuya atmak çok yavaş sürer. Bunun yerine kodlarınızı GitHub'a pushlayıp sunucuda çekmek en hızlı yöntemdir.

### Adım 1: Yerel Bilgisayardan GitHub'a Pushlayın
```bash
git add .
git commit -m "feat: deployment configuration"
git push origin main
```

### Adım 2: AWS Sunucusuna SSH ile Bağlanın
```bash
ssh -i "anahtar-dosyaniz.pem" ubuntu@aws-sunucu-ip-adresi
```

### Adım 3: Depoyu Sunucuya Klonlayın veya Güncelleyin
*Sunucuda proje ilk defa kuruluyorsa:*
```bash
git clone https://github.com/umutakksy/SeedHR.git
cd SeedHR
```

*Sunucuda proje zaten varsa ve sadece kodları güncelliyorsanız:*
```bash
cd SeedHR
git pull origin main
```

### Adım 4: Çevre Değişkenlerini (.env) Yapılandırın
Güvenlik sebebiyle `.env` dosyası GitHub'a yüklenmez. Bu yüzden sunucuda `.env` dosyasını şablondan kopyalayarak oluşturmanız gerekir:

1. `backend` klasörü altındaki `.env.example` şablonunu kopyalayarak `.env` oluşturun:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Dosyayı düzenleyin ve üretim (production) ayarlarınızı girin (örneğin MongoDB Atlas bağlantı adresi ve JWT Secret anahtarınızı):
   ```bash
   nano backend/.env
   ```
   *(Değişiklikleri kaydedip çıkmak için: `CTRL + O`, `Enter`, `CTRL + X`)*

### Adım 5: Docker ile Uygulamayı Başlatın
```bash
# Arka planda build edip çalıştırmak için:
docker-compose up --build -d
```

---

## 2. Yöntem: ZIP ile Dağıtım (Git Olmadan) 📦

Eğer kodları Git/GitHub üzerinden aktarmak istemiyorsanız, yerel bilgisayarınızda **gereksiz derleme klasörlerini hariç tutarak** bir ZIP arşivi oluşturup sunucuya yükleyebilirsiniz.

### Adım 1: Windows (PowerShell) ile Gereksiz Klasörleri Hariç Tutarak Sıkıştırın
Projenin ana dizininde (`SeedHR`) PowerShell terminalini açın ve şu komutu çalıştırın:
```powershell
Compress-Archive -Path .\backend, .\frontend, .\nginx, .\docker-compose.yml -DestinationPath .\project.zip -Force
```
*Bu komut backend/bin, backend/obj gibi gereksiz derleme dosyalarını almayarak dosya boyutunu küçültür ve SFTP yüklemesini saniyelere indirir.*

### Adım 2: ZIP Dosyasını Sunucuya SFTP ile Atın
`project.zip` dosyasını sunucudaki hedef klasöre SFTP (FileZilla, WinSCP vb.) yardımıyla yükleyin.

### Adım 3: Sunucuda ZIP Dosyasını Açın ve Çalıştırın
```bash
# unzip aracını yükleyin (yüklü değilse)
sudo apt install unzip

# Arşivi klasöre çıkartın
unzip project.zip -d SeedHR
cd SeedHR

# Uygulamayı ayağa kaldırın
docker-compose up --build -d
```

---

## 3. Port Yapılandırması ⚙️

| Servis    | Açıklama                                  | Port (Sunucu)           |
|-----------|-------------------------------------------|-------------------------|
| **Nginx** | Docker içi yönlendirici (iç proxy)        | `8085` (dış:Docker içi) |
| Backend   | .NET API - sadece localhost'a açık        | `127.0.0.1:5005`        |
| Frontend  | Razor Pages - sadece localhost'a açık     | `127.0.0.1:5205`        |
| MongoDB   | Veritabanı - sadece localhost'a açık      | `127.0.0.1:27017`       |

> AWS EC2 **Security Group → Inbound Rules** kısmından:
> - **Port 80 (HTTP)** → Herkes (0.0.0.0/0) ✅
> - **Port 443 (HTTPS)** → Herkes (0.0.0.0/0) ✅
> - **Port 22 (SSH)** → Kendi IP'niz ✅
> - **Port 8085** → Kapalı kalabilir (localhost'tan erişiliyor) ✅

---

## 4. SSL Sertifikası (Certbot + Let's Encrypt) 🔒

Bu adımı Docker'ı ayağa kaldırdıktan **sonra** yapın. SSL, host makinedeki Nginx üzerinde yönetilir.

### Adım 1: Certbot Kurulumu (sunucuda)
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### Adım 2: Host Nginx Yapılandırmasını Kurun
Projede hazır bir şablon konfigürasyon dosyası mevcuttur (`nginx/seedhr-host.nginx.conf`).
Bunu sunucudaki doğru konuma kopyalayın:
```bash
# Önce HTTP bloku ile başlayıp sertifika alabilmek için geçici konfigürasyon
sudo cp ~/SeedHR/nginx/seedhr-host.nginx.conf /etc/nginx/sites-available/seedhr.com.tr

# Aktif hale getirin
sudo ln -s /etc/nginx/sites-available/seedhr.com.tr /etc/nginx/sites-enabled/seedhr.com.tr

# Test edip yeniden yükleyin
sudo nginx -t && sudo systemctl reload nginx
```

### Adım 3: SSL Sertifikası Alın (Certbot)
```bash
# Certbot otomatik olarak nginx.conf dosyasını SSL için düzenler:
sudo certbot --nginx -d seedhr.com.tr -d www.seedhr.com.tr
```
Komut çalışırken e-posta adresinizi girin, şartları kabul edin ve `2` seçeneğini seçerek HTTP → HTTPS zorunlu yönlendirmeyi aktif edin.

### Adım 4: Otomatik Yenilemeyi Test Edin
Certbot sertifikaları 90 günde bir yeniler. Otomatik yenilemenin çalışıp çalışmadığını test edin:
```bash
sudo certbot renew --dry-run
```

### Adım 5: Son Test
Tarayıcınızdan `https://seedhr.com.tr` adresine giderek sitenizin HTTPS üzerinden çalıştığını doğrulayın. 🎉

