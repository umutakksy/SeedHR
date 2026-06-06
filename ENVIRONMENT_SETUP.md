# SeedHR Environment Setup Guide

## Security Update: Turnstile CAPTCHA Configuration

### What Changed
- ✅ Frontend: Site key artık **environment variable'dan okunuyor**
- ✅ Backend: Secret key zaten environment variable'dan okunuyor
- ✅ Docker Compose: Build-time ve runtime vars için güncellendi
- ✅ Production nginx config oluşturuldu

### Current Status
Bu dosyada key'ler hala .env dosyalarında yer alıyor:
- `backend/.env` (exposed)
- `frontend/.env.local` (not in git, safe)

### Production Deployment Steps

#### 1. Yeni Turnstile Key Oluşturun (CRITICAL)
1. Cloudflare Dashboard → Turnstile
2. **Eski site key'i DELETE edin** (0x4AAAAA...Wqeph8)
3. **Yeni site key + secret key oluşturun**
   - Domain: `seedhr.com.tr` (ve www, staging vb.)
   - Widget Mode: Managed

#### 2. Environment Variables Ayarlayın

**Development (Local):**
```bash
# frontend/.env.local
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_new_site_key
NEXT_PUBLIC_API_URL=/api

# backend/.env
TURNSTILE_SECRET_KEY=your_new_secret_key
```

**Docker Compose (Local):**
```bash
# Create .env.docker file
cp .env.docker.example .env.docker
# Edit and fill in:
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_new_site_key
```

Run:
```bash
docker-compose --env-file .env.docker up --build
```

**Production (AWS EC2):**
```bash
# Set environment variables on the server
export NEXT_PUBLIC_TURNSTILE_SITE_KEY="your_new_site_key"
export TURNSTILE_SECRET_KEY="your_new_secret_key"

# Or in docker-compose on production:
docker-compose --env-file /path/to/production.env up -d
```

#### 3. SSL Certificate (seedhr.com.tr)

```bash
# On production server:
sudo certbot certonly --webroot -w /var/www/certbot \
  -d seedhr.com.tr \
  -d www.seedhr.com.tr

# Copy nginx config
sudo cp nginx/seedhr.com.tr.nginx.conf /etc/nginx/sites-available/seedhr.com.tr
sudo ln -s /etc/nginx/sites-available/seedhr.com.tr /etc/nginx/sites-enabled/seedhr.com.tr

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### File Reference

| File | Purpose | Contains Secret? |
|------|---------|------------------|
| `frontend/.env.local` | Dev - Frontend vars | ❌ (site key is public) |
| `frontend/.env.example` | Template only | ❌ |
| `backend/.env` | Dev - Backend vars | ✅ (keep secure) |
| `backend/.env.example` | Template only | ❌ |
| `.env.docker.example` | Docker template | ❌ |
| `docker-compose.yml` | Compose config | ❌ (uses vars) |

### Code Changes Made

1. **frontend/app/login/page.tsx**
   - Line 11: Removed hardcoded key
   - Now reads from `process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY`

2. **backend/appsettings.json**
   - Removed hardcoded secret key
   - AuthController already reads from env var

3. **docker-compose.yml**
   - Build args now use environment variables
   - Added runtime environment variables to frontend service

### Security Best Practices

✅ **Do:**
- Store secret keys in `.env` (local, not in git)
- Use environment variables for all secrets
- Rotate keys regularly
- Use different keys for dev/staging/production
- Never commit .env files to git

❌ **Don't:**
- Hardcode secrets in source code
- Commit .env files to git
- Share keys in chat/email/docs
- Use same keys across environments
- Expose secret keys in Docker build args

### Verification

After setting up:

1. Check frontend loads CAPTCHA properly
2. Verify backend accepts CAPTCHA tokens
3. Test login flow end-to-end
4. Monitor CloudFlare dashboard for request counts

### Next Steps

1. Generate new Turnstile keys
2. Update `backend/.env` with new secret key
3. Update `frontend/.env.local` with new site key
4. Test locally with Docker Compose
5. Deploy to production with new keys
6. Delete old keys from Cloudflare

---

**Questions?** Review backend AuthController.cs for Turnstile verification logic.
