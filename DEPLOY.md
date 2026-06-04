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

## 3. Docker Port ve Nginx Yapılandırması ⚙️

- **Nginx (Dış Dünya):** Projede Nginx `80` portundan dış dünyaya hizmet vermektedir. AWS EC2 Security Group (Güvenlik Grubu) ayarlarından **Inbound Rules** kısmına **HTTP (Port 80)** erişim izni vermeyi unutmayın.
- **Backend:** `http://localhost:5000`
- **Frontend:** `http://localhost:5200`
- **Veritabanı:** `mongodb://localhost:27017`
