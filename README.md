# HandyHouse ERP, CRM, & HR - Integrated Microservices System

Repositori ini berisi kode sumber untuk sistem monorepo terintegrasi **HandyHouse**, yang dirancang untuk mendukung e-commerce hardware, pengelolaan Supply Chain Management (SCM), Customer Relationship Management (CRM), serta Human Resources (HR).

Proyek ini dibangun sebagai bagian dari mata kuliah **Sistem Integrasi**, menggunakan arsitektur microservices modern yang terintegrasi penuh menggunakan **Docker Compose**, **Nginx API Gateway**, **PostgreSQL**, dan **MinIO Object Storage**.

---

## 🏗️ Arsitektur Sistem

Sistem ini terdiri dari beberapa komponen utama yang saling berinteraksi:

```mermaid
graph TD
    User([User / Browser]) -->|Akses UI - Port 3000| Frontend[Next.js App: HandyHouse]
    User -->|Kirim Request API - Port 8080| Gateway[Nginx API Gateway]
    
    Gateway -->|Proxy /api/crm/*| CRM[CRM Microservice - Port 5001]
    Gateway -->|Proxy /api/hr/*| HR[HR Microservice - Port 5002]
    
    CRM -->|Koneksi DB| DB[(PostgreSQL Central)]
    HR -->|Koneksi DB| DB
    
    CRM -->|Simpan Dokumen| MinIO[(MinIO Object Storage - Port 9000)]
    HR -->|Simpan Dokumen| MinIO
```

### Penjelasan Komponen:

1. **Frontend (HandyHouse - Next.js)**
   * Menggunakan Next.js 16 & React 19.
   * Menyediakan antarmuka katalog produk, manajemen keranjang belanja, wishlist, modul SCM, dashboard CRM, dan dashboard HR.
   * Berjalan pada port `3000`.

2. **API Gateway (Nginx)**
   * Berfungsi sebagai gerbang tunggal (Single Entry Point) untuk seluruh request API ke microservice.
   * Merutekan request berdasarkan path URL:
     * `/api/crm/*` diarahkan ke **CRM Microservice** (port `5001`).
     * `/api/hr/*` diarahkan ke **HR Microservice** (port `5002`).
   * Berjalan pada port `8080` (di-expose ke host) dan meneruskan ke port internal `80` di dalam network Docker.

3. **CRM Microservice (crm-service)**
   * Dibangun menggunakan Node.js (Express & TypeScript).
   * Bertanggung jawab untuk fitur manajemen pelanggan dan pengunggahan dokumen CRM.
   * Menyimpan metadata dokumen ke database `erp_crm_db` di PostgreSQL.
   * Mengunggah file fisik dokumen ke bucket `crm-assets` di MinIO.
   * Berjalan pada port `5001` (internal).

4. **HR Microservice (hr-service)**
   * Dibangun menggunakan Node.js (Express & TypeScript).
   * Bertanggung jawab untuk fitur manajemen karyawan dan pengunggahan dokumen HR.
   * Menyimpan metadata dokumen ke database `erp_hr_db` di PostgreSQL.
   * Mengunggah file fisik dokumen ke bucket `hr-assets` di MinIO.
   * Berjalan pada port `5002` (internal).

5. **Database Central (PostgreSQL 15)**
   * Database terpusat yang dikonfigurasi untuk menjalankan multi-database secara otomatis saat container dijalankan (`postgres-init` script).
   * Menyediakan database terpisah untuk masing-masing service: `erp_crm_db` untuk CRM, dan `erp_hr_db` untuk HR.
   * Berjalan pada port `5432`.

6. **Object Storage (MinIO)**
   * Penyimpanan objek kompatibel dengan S3 (Simple Storage Service).
   * Menyediakan bucket `crm-assets` dan `hr-assets` untuk menyimpan file-file yang diunggah dari modul CRM dan HR.
   * Dilengkapi dengan container helper `minio-mc` yang otomatis membuat bucket dan mengatur hak aksesnya menjadi **public** ketika docker-compose pertama kali dijalankan.
   * Berjalan pada port `9000` (API) dan `9001` (Console Dashboard).

---

## ⚙️ Cara Kerja Sistem (Flow Integrasi)

1. **Akses Aplikasi**: User mengakses frontend Next.js melalui browser di `http://localhost:3000`.
2. **Koneksi Database & Gateway**: Saat halaman CRM atau HR dimuat, frontend melakukan request kesehatan sistem (`health-check`) ke API Gateway melalui `http://localhost:8080/api/crm/health` atau `http://localhost:8080/api/hr/health`.
3. **Routing API**: Nginx API Gateway menerima request tersebut dan meneruskannya ke backend service yang sesuai (`crm-service` atau `hr-service`).
4. **Proses Upload Dokumen**:
   * Ketika user mengunggah file di dashboard CRM/HR, client mengirimkan form data ke gateway.
   * Microservice menerima file tersebut, memprosesnya menggunakan middleware `multer`.
   * Microservice mengirimkan stream file ke MinIO menggunakan `@aws-sdk/client-s3`.
   * Setelah file sukses tersimpan di MinIO, microservice melakukan query `INSERT` untuk menyimpan nama file beserta URL publik MinIO ke tabel `crm_documents` atau `hr_documents` di PostgreSQL.
   * Terakhir, API mengirimkan respon sukses berupa URL publik file agar user dapat mengunduh atau melihat dokumen tersebut langsung dari browser.

---

## 🚀 Panduan Menjalankan Sistem

Ada dua cara untuk menjalankan sistem ini: menggunakan **Docker Compose** (sangat direkomendasikan karena praktis) atau menjalankan secara **Lokal (Development)**.

### Prasyarat Sebelum Memulai
* Pastikan Anda sudah menginstal [Docker Desktop](https://www.docker.com/products/docker-desktop/).
* Instal [Node.js (v18 ke atas)](https://nodejs.org/) jika ingin mencoba menjalankan secara lokal.
* Copy file `.env.example` menjadi `.env` di direktori utama:
  ```bash
  cp .env.example .env
  ```

---

### Metode 1: Menggunakan Docker Compose (Rekomendasi)

Dengan Docker Compose, semua komponen (Frontend, API Gateway, CRM, HR, Postgres, dan MinIO) akan berjalan secara otomatis dalam container.

1. **Build dan Jalankan Container**
   Jalankan perintah berikut di direktori root proyek:
   ```bash
   docker-compose up --build -d
   ```

2. **Daftar Port & Akses Layanan**
   Setelah semua container berjalan (`running`), Anda bisa mengakses layanan-layanan berikut:
   * 🌐 **Frontend (Next.js)**: [http://localhost:3000](http://localhost:3000)
   * 🔌 **API Gateway (Nginx)**: [http://localhost:8080](http://localhost:8080)
   * 🗄️ **MinIO Console (Dashboard)**: [http://localhost:9001](http://localhost:9001) (Username: `admin` | Password: `adminpassword`)
   * 📊 **MinIO API (S3 EndPoint)**: [http://localhost:9000](http://localhost:9000)
   * 🐘 **Database PostgreSQL**: `localhost:5432` (Username: `postgres` | Password: `postgrespassword`)

3. **Menghentikan Layanan**
   Untuk mematikan seluruh container:
   ```bash
   docker-compose down
   ```
   Jika ingin menghapus seluruh data volume database dan object storage yang tersimpan:
   ```bash
   docker-compose down -v
   ```

---

### Metode 2: Menjalankan secara Lokal untuk Development (Tanpa Docker)

Jika Anda ingin melakukan debugging atau pengembangan kode tanpa menggunakan Docker compose untuk layanannya, ikuti langkah berikut:

#### 1. Setup Database & Object Storage
Anda tetap memerlukan database PostgreSQL dan MinIO yang aktif. Anda bisa menjalankan container DB dan MinIO saja menggunakan perintah:
```bash
docker compose up -d postgres minio minio-mc
```
*(Atau gunakan PostgreSQL dan MinIO lokal yang sudah terpasang pada komputer Anda).*

#### 2. Jalankan CRM & HR Microservice secara Terpisah
Buka terminal baru untuk masing-masing folder service, lalu jalankan perintah instalasi dan start server:

* **CRM Microservice**:
  ```bash
  cd crm-service
  npm install
  npm run dev
  ```
  *(Akan berjalan di port `5001` atau `5002` tergantung konfigurasi env lokal)*

* **HR Microservice**:
  ```bash
  cd hr-service
  npm install
  npm run dev
  ```

#### 3. Jalankan Next.js Frontend
Buka terminal baru di folder `HandyHouse`:
```bash
cd HandyHouse
npm install
# Sinkronisasi skema database SQLite lokal (jika diperlukan untuk demo frontend standalone)
npx prisma db push
npm run dev
```

*Catatan:* Di dalam `HandyHouse/package.json`, perintah `npm run dev` dikonfigurasi untuk menjalankan frontend bersama mockup service port 3001 & 3002 secara simultan menggunakan `concurrently`. Anda bisa mengontrol dan mematikan port jika terjadi bentrok menggunakan script yang tersedia:
```bash
npm run kill:all
```

---

## 📁 Struktur Direktori Repositori

```text
SISTEMINTEGRASI/
├── HandyHouse/            # Next.js 16 Web Application (Frontend)
├── crm-service/           # Express.js CRM Microservice
├── hr-service/            # Express.js HR Microservice
├── nginx-gateway/         # Nginx API Gateway Configuration
│   └── nginx.conf         # Konfigurasi reverse proxy API Gateway
├── postgres-init/         # Script SQL inisialisasi database PostgreSQL
│   └── init.sql           # Membuat database erp_crm_db & erp_hr_db secara otomatis
├── .env.example           # Contoh file environment variable
├── docker-compose.yml     # Orkestrasi Docker untuk seluruh stack microservice
└── README.md              # Dokumentasi proyek (file ini)
```

---

## 🔒 Konfigurasi Environment (`.env`)

Berikut adalah nilai environment variable standar yang digunakan untuk mengintegrasikan seluruh service:

```ini
# PostgreSQL Central Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgrespassword
POSTGRES_DB=postgres
POSTGRES_MULTIPLE_DATABASES=erp_crm_db,erp_hr_db

# Microservices Database Credentials (digunakan oleh container crm & hr)
DATABASE_URL_CRM=postgresql://postgres:postgrespassword@postgres:5432/erp_crm_db
DATABASE_URL_HR=postgresql://postgres:postgrespassword@postgres:5432/erp_hr_db

# MinIO Object Storage Configuration
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=adminpassword
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_BUCKET_NAME=erp-attachments

# Microservices Ports (Internal)
PORT_CRM=4001
PORT_HR=4002

# JWT Authentication Secrets
JWT_SECRET_CRM=supersecretcrmkey123
JWT_SECRET_HR=supersecrethrkey123

# Frontend Environment
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```
