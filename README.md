# AURA XAUUSD — Sprint 1: Foundation

Bu proje, XAUUSD (Altın spot) fiyatları üzerinde açıklanacak kritik ABD ekonomik verilerinin (CPI, NFP, FOMC vb.) olası etkilerini simüle eden ve geçmiş verileri analiz eden Next.js 14 tabanlı bir monorepo uygulamasıdır.

---

## Proje Mimarisi

```
aura-xauusd/
├── apps/
│   └── web/                    # Next.js 14 App Router uygulaması
├── packages/
│   ├── database/               # Prisma Schema + Singleton Client + Seed
│   ├── ui/                     # Radix UI + Lucide tabanlı paylaşılan UI bileşen kütüphanesi
│   └── config/                 # ESLint, TypeScript ve Tailwind ortak konfigürasyonları
├── docker-compose.yml          # Yerel PostgreSQL ve Redis konteynerları
└── turbo.json                  # Turborepo yapılandırması
```

---

## Gereksinimler

- Node.js >= 18
- Docker Desktop (Konteynerlar için)

---

## Kurulum ve Başlangıç

### 1. Depoları Yükleyin
Monorepo bağımlılıklarını yüklemek için kök dizinde çalıştırın:
```bash
npm install
```

### 2. Çevre Değişkenlerini Tanımlayın
`.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değerleri doldurun:
```bash
cp .env.example .env
```

### 3. Docker Konteynerlarını Başlatın
Yerel veritabanı (PostgreSQL) ve önbellek/limit servisi (Redis) için Docker'ı ayağa kaldırın:
```bash
docker compose up -d
```

### 4. Veritabanı Şemasını ve Seeding İşlemini Uygulayın
Veritabanı tablolarını oluşturup örnek verileri (1 Admin, 3 Örnek Haber ve Analiz) yüklemek için:
```bash
# Şemayı uygulayın (Prisma Migrations)
npm run db:push --workspace=@aura/database

# Verileri tohumlayın (Prisma Seeding)
npm run db:seed --workspace=@aura/database
```

### 5. Geliştirme Sunucusunu Çalıştırın
Turborepo altında Next.js uygulamasını paralel olarak başlatın:
```bash
npm run dev
```
Uygulama yerel olarak `http://localhost:3000` adresinde çalışacaktır.

---

## Güvenlik ve Kimlik Doğrulama Standartları

- **JWT Stratejisi**: Access Token (15 dakika, Bearer Header) ve Refresh Token (30 gün, HttpOnly Cookie SameSite=Strict).
- **Rate Limiting**: Upstash Redis entegrasyonu ile IP tabanlı API sınırlandırılması (Dakikada maks 60 istek).
- **CSRF Koruması**: Double-Submit Cookie Pattern ile form manipülasyonlarının engellenmesi.
- **Güvenlik Başlıkları**: X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy ve strict nonce-tabanlı CSP (Content Security Policy).
