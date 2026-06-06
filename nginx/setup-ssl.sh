#!/bin/bash

# =============================================================================
# SEEDHR SSL & HOST NGINX AUTOMATION SETUP SCRIPT
# =============================================================================
# Bu script, sunucudaki (Ubuntu/Debian) host Nginx servisini ve Certbot SSL
# sertifikasını otomatik olarak kurar, yapılandırır ve yenileme tetikleyicisi ekler.
# =============================================================================

# Hatalarda durdur
set -e

DOMAIN="seedhr.com.tr"
EMAIL="admin@seedhr.com.tr" # Let's Encrypt iletişim e-postası
WEBROOT_PATH="/var/www/certbot"
CONF_NAME="seedhr.com.tr"

echo "=== [1/5] Sunucu Güncellemeleri ve Paket Kontrolü ==="
sudo apt-get update -y
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "=== [2/5] Webroot Dizinlerinin Hazırlanması ==="
sudo mkdir -p $WEBROOT_PATH
sudo chown -R www-data:www-data $WEBROOT_PATH

# HTTP server geçici ayarı (Certbot doğrulaması için)
echo "=== [3/5] İlk HTTP Geçiş Konfigürasyonu Kuruluyor ==="
TEMP_CONF="server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root $WEBROOT_PATH;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}"

echo "$TEMP_CONF" | sudo tee /etc/nginx/sites-available/$CONF_NAME > /dev/null
if [ ! -f /etc/nginx/sites-enabled/$CONF_NAME ]; then
    sudo ln -s /etc/nginx/sites-available/$CONF_NAME /etc/nginx/sites-enabled/
fi

sudo nginx -t
sudo systemctl reload nginx

echo "=== [4/5] Let's Encrypt SSL Sertifikası Alınıyor ==="
# Certbot --deploy-hook ile yenilenme tetiklendiğinde nginx'i otomatik reload eder.
sudo certbot certonly --webroot -w $WEBROOT_PATH \
  -d $DOMAIN -d www.$DOMAIN \
  --email $EMAIL \
  --agree-tos \
  --non-interactive \
  --keep-until-expiring \
  --deploy-hook "systemctl reload nginx"

echo "=== [5/5] Gerçek Üretim Nginx Konfigürasyonu Kopyalanıyor ==="
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
sudo cp "$SCRIPT_DIR/seedhr.com.tr.nginx.conf" /etc/nginx/sites-available/$CONF_NAME

sudo nginx -t
sudo systemctl reload nginx

echo "============================================================================="
echo " SUCCESS: SSL sertifikası başarıyla kuruldu ve yenileme otomasyonu ayarlandı!"
echo "============================================================================="
