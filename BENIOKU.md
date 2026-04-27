# 📚 Kitabevi Online Satış Sistemi

Bu proje, modern bir web tabanlı kitap satış platformu simülasyonudur. Öğretici ve operasyonel amaçlar doğrultusunda hazırlanmıştır.

### 🌐 Canlı Önizleme (Live Demo)
Projeyi internet üzerinden anında denemek için: **[https://bookstore-dpsa.onrender.com/](https://bookstore-dpsa.onrender.com/)**

## 🛠️ Teknolojik Altyapı
- **Backend:** NestJS, TypeORM, SQLite (Veritabanı)
- **Frontend:** React, Vite, Tailwind CSS, TypeScript

---

## 🚀 Projeyi Yerel Makinede (Localhost) Çalıştırma

Aşağıdaki adımları sırasıyla uygulayarak projeyi kendi bilgisayarınızda çalışır duruma getirebilirsiniz.

### 📌 Ön Hazırlık
Bilgisayarınızda [Node.js](https://nodejs.org/) (v18+ sürümü) kurulu olmalıdır.

### 📦 1. Gerekli Paketlerin Yüklenmesi
Ana dizindeyken backend ve frontend kütüphanelerinin tamamını kurmak için:
```bash
npm run build
```
*(Veya sırasıyla `cd backend && npm install` ve `cd frontend && npm install` yapabilirsiniz).*

### 💻 2. Sunucuyu (Backend) Başlatma
1. Terminalden `backend` dizinine geçin: `cd backend`
2. Sunucuyu ayağa kaldırın:
   ```bash
   npm run start:dev
   ```
   *Backend sunucusu **`http://localhost:3000`** üzerinde hazır olacaktır.*

### 🎨 3. Arayüzü (Frontend) Başlatma
1. Yeni bir terminalde `frontend` dizinine geçin: `cd frontend`
2. Arayüzü çalıştırın:
   ```bash
   npm run dev
   ```
   *Sistem otomatik olarak **`http://localhost:5173`** (veya benzeri bir portta) açılacaktır.*

---

## 🔑 Admin (Yönetici) Giriş Bilgileri
- **E-posta:** `admin@kitabevi.com`
- **Şifre:** `Admin123!`

## 📊 Öne Çıkan Fonksiyonlar
- **X ve Y Eksenli Grafikler:** Tüm kitapların anlık kazanç grafikleri dinamiktir.
- **Sürükle & Bırak/Yapıştır:** Admin panelinde dışarıdan hızlı kapak görseli ekleme.
