# Production Deployment Guide - AURA XAUUSD

Bu doküman, AURA XAUUSD portalını sıfırdan üretim sunucusuna (Ubuntu 22.04 LTS) dağıtmak ve yönetmek için gerekli adımları içerir.

---

## 1. Sunucu Gereksinimleri & Kurulum
* **Önerilen Kaynaklar**: En az 4 vCPU, 8GB RAM, 80GB SSD.
* **İşletim Sistemi**: Ubuntu 22.04 LTS.
* **UFW Güvenlik Duvarı**:
  ```bash
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```
* **Gerekli Paketler**:
  * Docker Engine & Docker Compose v2.

---

## 2. Environment Variables (.env.production)
Proje kök dizininde bir `.env.production` dosyası oluşturun ve aşağıdaki değerleri tanımlayın:
```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:secretpassword@postgres:5473/aura_prod?schema=public
UPSTASH_REDIS_URL=redis://redis:6379
JWT_SECRET=production_access_secret_key
JWT_REFRESH_SECRET=production_refresh_secret_key
STRIPE_SECRET_KEY=sk_live_production_key
STRIPE_WEBHOOK_SECRET=whsec_production_key
RESEND_API_KEY=re_production_resend_key
ANTHROPIC_API_KEY=sk-ant-production_key
```

---

## 3. SSL Sertifikası Alımı (Certbot & Let's Encrypt)
Certbot yardımıyla alan adınız için sertifika oluşturun:
```bash
docker run -it --rm --name certbot \
  -v "/etc/letsencrypt:/etc/letsencrypt" \
  -v "/var/www/certbot:/var/www/certbot" \
  certbot/certbot certonly --webroot -w /var/www/certbot -d aura.com -d www.aura.com
```

---

## 4. Dağıtımı Başlatma (Production Deploy)
Docker Compose ile tüm servisleri ayağa kaldırın:
```bash
# Servisleri başlat
docker-compose -f docker-compose.prod.yml up -d

# Prisma veritabanı şema güncellemelerini uygula
docker exec -it app_web_1 npx prisma migrate deploy

# Veritabanını tohumla (seed)
docker exec -it app_web_1 npx prisma db seed
```

---

## 5. Doğrulama ve Sağlık Kontrolü
Aşağıdaki komutla tüm servislerin yeşil olduğunu doğrulayın:
```bash
curl -f https://aura.com/api/health
```

---

## 6. Geri Alma (Rollback) Prosedürü
Olası bir güncelleme hatasında, bir önceki Docker imajına hızlıca geri dönebilirsiniz:
```bash
# 1. Önceki çalışan tag'e çekin
docker-compose -f docker-compose.prod.yml pull web:PREVIOUS_STABLE_SHA

# 2. Sadece web servisini yenileyin
docker-compose -f docker-compose.prod.yml up -d web
```

---

## 7. Cloudflare Kurulum & Cache Kuralları
1. Cloudflare üzerinde SSL/TLS ayarını **Full (strict)** moduna getirin.
2. **Önbellek Kuralları (Cache Rules)**:
   * `/api/news` -> Edge Cache TTL: 5 Dakika
   * `/_next/static/*` -> Cache Everything: 1 Yıl
   * `/images/*` -> Cache Everything: 30 Gün
