# RJ BODY BUILDING — Lorry Body Building & Modification Workshop

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Node-Express-black.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma_6-2D3748.svg)](https://www.prisma.io/)

A complete, responsive, full-stack workshop management system and public website for **RJ BODY BUILDING** — Lorry Body Building & Modification Workshop, located in Vasthanagar, near Agrini / Ravithurayan Temple, Madurai, Tamil Nadu, India (35 years of master craftsmanship, 1991–2026).

---

## 1. Project Identity

- **Official Name**: RJ BODY BUILDING
- **Tagline**: Lorry Body Building & Modification Workshop
- **Location**: Vasthanagar, near Agrini / Ravithurayan Temple, Madurai, Tamil Nadu, India
- **Experience**: 35 years of master craftsmanship (1991–2026)
- **Design Language**: Industrial heavy-vehicle style with charcoal, steel grey, clean white, and safety orange accents.

---

## 2. Architecture & Technology Stack

```
d:\final yr project\
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, Modal, TimelineView, Badges)
│   │   ├── context/            # AuthContext (with quick role switcher) & ToastContext
│   │   ├── pages/              # Public Pages (Home, About, Services, Gallery, Categories, Contact, Enquiry, Auth)
│   │   │   ├── admin/          # Admin Management (Dashboard, Enquiries, Quotes, Jobs, Workers, Stock, Invoices, Reports, Settings)
│   │   │   ├── worker/         # Worker Workspace (Assigned Tasks, Permitted Updates)
│   │   │   └── customer/       # Customer Portal (My Enquiries, Quotation Approvals, Live Vehicle Timeline, Bills)
│   │   ├── services/api.ts     # Typed REST API Client
│   │   └── types/index.ts      # Data Models & Schemas
│   └── dist/                   # Production Bundle
├── server/                     # Backend API & Database
│   ├── prisma/
│   │   ├── schema.prisma       # 19 Relational Database Models
│   │   └── dev.db              # SQLite Database (Zero-setup local execution)
│   ├── src/
│   │   ├── routes/             # RESTful API Endpoints (Auth, Enquiries, Quotes, Jobs, Workers, Materials, Billing, etc.)
│   │   ├── middleware/         # JWT Auth, Role Guard, Safe Error Handlers
│   │   ├── seed.ts             # Realistic Demo Workshop Seeder
│   │   └── index.ts            # Express Server (serves API & Frontend SPA)
│   └── package.json
└── README.md
```

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons, React Router v6.
- **Backend**: Node.js, Express, TypeScript, REST APIs.
- **Database**: Prisma ORM with SQLite for instant local zero-setup execution, and PostgreSQL production-ready configuration.
- **Security**: JWT session tokens, bcrypt password hashing, server-side role validation (`ADMIN`, `WORKER`, `CUSTOMER`), file upload validation (JPEG/PNG/WebP, 5MB limit).

---

## 3. Demo Accounts & 1-Click Role Switcher

For seamless evaluator testing, a **1-Click Role Switcher** is present in the top header bar of the application, alongside quick-fill credential buttons on the login screen:

| Role | Email | Password | Pre-seeded Context |
| :--- | :--- | :--- | :--- |
| **Admin / Owner** | `admin@rjbodybuilding.local` | `Admin@12345` | R. Jayachandran (Full management of all 14 modules) |
| **Worker (Body Work)** | `murugan.body@rjbodybuilding.local` | `Worker@12345` | Murugan P. (Assigned to chassis subframe channel welding) |
| **Customer** | `senthil.transport@gmail.com` | `Customer@12345` | Senthil Kumar (Ashok Leyland Boss build currently in Painting stage) |

Additional demo customers and workers across all 10 departments (`Painting`, `Artist`, `Electrical`, `Lining`, `Mechanic`, `Glass Fixing`, `Sticker Fixing`, `Maintenance`, `Security`) are also seeded into the database.

---

## 4. Implemented Modules Overview

1. **Home**: Workshop identity, 35-year legacy badge (1991–2026), services preview, vehicle categories highlight, selected project showcase, and primary call-to-actions.
2. **About Us**: 35-year heritage narrative, Vasthanagar yard location details, craftsmanship values, and 10 in-house trade divisions.
3. **Services**: All 15 official services (New Lorry Body Building, Accident Repair & Rework, Old Vehicle Conversion, Goods Carrier, Tipper, Grocery Transport, Cylinder Transport, Cattle Transport, Painting, Electrical Work, Glass Fitting, A/C Fitting, Reflective Stickers, Lining, Brake/Mechanical Checks) with direct enquiry actions.
4. **Vehicle Gallery**: Completed workshop projects with category filters and interactive **Before / After** comparison toggles. All demonstration photographs are explicitly flagged with transparent `DEMO PROJECT` markers.
5. **Vehicle Categories & Models**: Small, Medium, Heavy, and Multi-Axle configurations (Tata Ace, Tata Dost, Tata Intra, Mahindra SCV, Eicher Pro, Ashok Leyland Boss, E-Comet, single/double/multi-axle) with vehicle-specific supported body types.
6. **Customer Enquiry Module**: Full customer enquiry form with name, phone format validation, vehicle category, make/model, purpose, enquiry type, multi-select service checkboxes, optional vehicle photo upload, duplicate submission guard, and unique reference generation (`ENQ-2026-XXXX`).
7. **Quotation Management**: Admin dynamic line-item quotation builder (description, quantity, unit, rate, auto-computed amounts, discount, taxes/charges, validity, estimated completion). Customer portal allows transparent breakdown inspection and **Approve** / **Reject** actions with recorded timestamps.
8. **Work Progress & Timeline Module**: Visual 6-stage lifecycle progress tracker:
   1. `Enquiry Received` &rarr; 2. `Quotation Approved` &rarr; 3. `Body Building / Repair` &rarr; 4. `Painting & Finishing` &rarr; 5. `Quality Check` &rarr; 6. `Billing & Delivery`
   Supports Admin stage progression, skipping stages with mandatory recorded reasons, worker task checklists, target completion dates, and actual delivery logging.
9. **Worker Management**: Workforce directory across 10 specialized departments with skill profiles, status controls, and active job task allocations.
10. **Material Management (Inventory)**: Raw materials inventory (steel channels, sheets, paints, timber, wiring), low-stock warning badges, stock-in additions, job usage deductions, atomic transactions, and transaction audit history.
11. **Billing & Payments**: Invoices linked to workshop jobs, advance and milestone payment logs (CASH, UPI, BANK TRANSFER, CHEQUE), auto-calculated outstanding balances (`Total Bill - Total Paid`), and printable official tax invoice layout.
12. **Contact Us**: Official Vasthanagar address, landmark near Agrini / Ravithurayan Temple, operating hours, editable contact placeholders, and a working direct message submission form.
13. **Login & Registration**: JWT authentication, bcrypt encryption, customer self-registration, and role-guarded routes.
14. **Reports & Analytics**: Real-time database metrics (invoiced revenue, collected payments, outstanding balances, active jobs, pending quotes, low stock items) with date range filters, printable view, and **CSV Export**.

---

## 5. Running the Application Locally

The application is already compiled and running on `http://localhost:5000`.

### Step 1: Install Dependencies
```bash
# In server folder:
cd server
npm install

# In client folder:
cd ../client
npm install
```

### Step 2: Database Initialization & Seeding
```bash
cd server
# Synchronize Prisma schema with database:
npx prisma db push

# Populate realistic demo records:
npx tsx src/seed.ts
```

### Step 3: Run the Full Application
```bash
# Option A: Start the unified production server (serves both API & Frontend at http://localhost:5000):
cd server
npm run build
npm start

# Option B: Run development servers in parallel:
# Terminal 1 (Backend API on http://localhost:5000):
cd server
npm run dev

# Terminal 2 (Vite Frontend with hot reload on http://localhost:5173):
cd client
npm run dev
```

---

## 6. Configuring Production PostgreSQL

To switch from the default SQLite database to a PostgreSQL instance:

1. Open `server/.env` and configure your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/rj_body_building?schema=public"
   ```
2. In `server/prisma/schema.prisma`, update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run the Prisma schema push and seed script:
   ```bash
   cd server
   npx prisma db push
   npm run seed
   ```
