# BDCCL BOQ Web Application

An enterprise-grade Bill of Quantities (BOQ) configuration and generation tool built for **Bangladesh Data Center Company Limited (BDCCL)**.

A highly interactive, dynamic React data grid for quickly configuring cloud infrastructure packages. It features automated nested row generation for complex services (OKE, PostgreSQL, etc.), real-time BDT pricing, requirement reordering, and one-click export to formula-embedded Excel (`.xlsx`) documents.

## 🚀 Key Features

* **Dynamic Service Configurator** — 1-click deployment of predefined master services (Compute Instances, OKE, PostgreSQL, and more) with auto-calculated sub-components.
* **Smart Nested Grouping** — sub-components (OCPU, Memory, Boot Storage) scale independently based on instance architecture.
* **Requirement Reordering** — move any requirement group up/down with arrow controls; `Req.` labels auto-renumber.
* **Custom Metric Injection** — add add-ons (Public IP, Block Storage) into existing groups via context-aware dropdowns.
* **Searchable Service Picker** — services grouped by category (Compute, Storage, Database, Security, Connectivity…).
* **Real-time Financial Engine** — live subtotal, 5% VAT, Grand Total, plus auto "Amount in Words" (Lakh/Crore BDT).
* **Advanced Excel Export** — `ExcelJS` generates spreadsheets with native formulas, merged cells, branded headers, and colored requirement notes.
* **PostgreSQL Integrated** — metrics and unit prices managed in a relational database; prices are editable and persist across restarts.

## 🛠️ Technology Stack

**Frontend:** React (Vite) · Axios · React-Select · Lucide-React
**Backend:** Node.js · Express · PostgreSQL (`pg`) · ExcelJS · PM2

---

## ⚙️ Installation & Setup

### 1. Prerequisites
* Node.js (v16+)
* PostgreSQL (v12+)
* Git

### 2. Database
```sql
CREATE DATABASE boq_db;
CREATE USER boq_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE boq_db TO boq_user;
```
The catalog table is created automatically. It is **seeded only when empty** — existing price edits are preserved across restarts (no destructive re-seed).

### 3. Clone
```bash
git clone https://github.com/mazharulmd/BDCCL-BOQ-Web-Application.git
cd BDCCL-BOQ-Web-Application
```

### 4. Backend
Database credentials are read from environment variables (with sensible fallbacks):

| Variable | Default |
|---|---|
| `PGUSER` | `boq_user` |
| `PGHOST` | `localhost` |
| `PGDATABASE` | `boq_db` |
| `PGPASSWORD` | _(set this)_ |
| `PGPORT` | `5432` |
| `PORT` | `3000` |

```bash
cd boq-backend
npm install
PGPASSWORD='your_password' node server.js
```
Expect: `Database seeded successfully...` (first run) or `Catalog already has N rows. Skipping seed.`

### 5. Frontend
```bash
cd ../boq-frontend
npm install
npm run build
```
For local development with hot reload (`vite.config.js` proxies `/api` → `:3000`):
```bash
npm run dev
```

---

## 🌐 API Endpoints

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/health` | DB connectivity check |
| `GET` | `/api/products` | Full price catalog |
| `GET` | `/api/products/search?q=` | Search catalog |
| `PUT` | `/api/products/:id` | Update a unit price (persists) |
| `POST` | `/api/quotes/generate` | Generate the Excel BOQ |

---

## 🌍 Running in Production

Served continuously via **PM2**; Express serves the compiled React frontend on port `3000`.

```bash
cd ~/bdcclboq/boq-backend
pm2 start server.js --name boq-api
pm2 save
```

**Helpful PM2 commands:**
```bash
pm2 logs boq-api        # live logs
pm2 status              # process status
pm2 restart boq-api     # restart after code/build updates
```
After frontend changes: `cd boq-frontend && npm run build` then `pm2 restart boq-api`.

---

## 📁 Project Structure

```text
BDCCL-BOQ-Web-Application/
├── boq-backend/               # Node.js Express API
│   ├── package.json
│   └── server.js              # DB config, ExcelJS generation, routing, health/price endpoints
├── boq-frontend/              # React UI
│   ├── public/                # static assets (logo, favicon)
│   ├── src/
│   │   ├── App.jsx            # interactive grid, reorder logic, BDT calculations
│   │   ├── index.css          # BDCCL design system & layout
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js         # dev proxy + build config
├── .gitignore
└── README.md
```

---

## 👤 Developer

Developed by **Md Mazharul Islam**, Assistant Manager (Cloud), BDCCL.
[LinkedIn](https://www.linkedin.com/in/mazharul-i-tusar/) · [GitHub](https://github.com/mazharulmd)

## 📝 License
Proprietary software developed for Bangladesh Data Center Company Limited (BDCCL). All rights reserved.
