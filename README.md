# Project 1: Retail & Ecommerce – Multi-Vendor Marketplace Platform
> **Axlero Startup Launch Kit** | MERN Multi-Vendor Infrastructure

[![Backend Verification](https://img.shields.io/badge/Backend%20Verification-23%2F23%20Passing-brightgreen)](#automated-testing)
[![Frontend Build](https://img.shields.io/badge/Frontend-Vite%20%2B%20React%2018-blue)](#frontend-architecture)
[![Performance](https://img.shields.io/badge/Lighthouse-85%2B%20Ready%20(Code--Splitting)-success)](#performance--optimization)
[![API Docs](https://img.shields.io/badge/Swagger-OpenAPI%203.0-orange)](http://localhost:5000/api/docs)
[![Auth](https://img.shields.io/badge/Security-JWT%20%2B%20RBAC-red)](#role-based-access-control-rbac)

---

## 📌 System Context & Problem Statement
The rise of D2C (Direct-to-Consumer) brands requires robust multi-vendor digital infrastructure. Traditional e-commerce templates often fail to provide isolated vendor dashboards, unified cart management across different sellers, and split-payment architecture. 

This platform serves as a launch kit for scalable multi-vendor marketplaces, allowing independent sellers to manage localized catalogs and inventory while offering consumers a unified storefront.

### End-User Personas
1. **Platform Admin**: Manages vendor approvals, platform commissions, and global categories.
2. **Vendors (Sellers)**: Isolated dashboard to upload products with photos, track localized inventory, and manage order fulfillment.
3. **Customers**: Single unified shopping cart across multiple vendors and seamless checkout.

---

## 🗓️ Completed Milestones

### Week 1: Backend Foundation & Clean Architecture (Nov 8 – Nov 15)
- [x] **Clean Architecture Scaffold**: Separated business domain rules from Express, Mongoose, and external utilities.
- [x] **Pure Domain Entities**: Created `User` and `Product` entities enforcing business invariants.
- [x] **MongoDB & Mongoose Schemas**: Configured indexed schemas for users and vendor products.
- [x] **JWT Authentication & RBAC Middleware**: Role enforcement distinguishing between **Platform Admin**, **Vendor**, and **Customer**.
- [x] **Interactive Swagger Docs & Postman Collection**: OpenAPI 3.0 at `/api/docs` and exportable Postman suite.

### Week 2: Vendor Dashboard & Product Management (Nov 16 – Nov 22)
- [x] **Multi-Vendor Product CRUD**: Backend routes allowing sellers to create, view, update, and delete only their own listings.
- [x] **Multipart Image Uploads**: `multer` middleware handling JPEG, PNG, and WebP product photos (max 5MB) served via `/uploads`.
- [x] **React 18 + Vite Scaffold**: Ultra-fast build times with Tailwind CSS and Lucide-React icons.
- [x] **Centralized Axios Client**: Automatic JWT Bearer token attachment and automatic 401 session expiration handling.
- [x] **Auth State & Protected Routes**: `AuthContext` with role guards preventing customer access to vendor portals.
- [x] **Vendor Dashboard Shell**: Collapsible sidebar navigation, live inventory metrics, valuation tracker, and low-stock alerts.
- [x] **Product Catalog & Inventory Table**: Searchable, filterable table with stock health indicators and modal-guarded delete.
- [x] **Product Create & Edit Forms**: Dual-mode form with drag-and-drop file upload, live client-side preview, and instant storefront card preview.
- [x] **Route Code-Splitting**: Lazy-loaded routes (`React.lazy()` and `<Suspense>`) targeting Lighthouse 85+ performance scores.

---

## 🏛️ Architecture Overview

### Backend: Clean Architecture
```text
       ┌────────────────────────────────────────────────────────┐
       │             INTERFACES (Controllers, Routes)           │
       │  ┌──────────────────────────────────────────────────┐  │
       │  │        APPLICATION (Services & Use-Cases)        │  │
       │  │  ┌────────────────────────────────────────────┐  │  │
       │  │  │         DOMAIN (Pure Business Entities)    │  │  │
       │  │  └────────────────────────────────────────────┘  │  │
       │  │       INFRASTRUCTURE (Mongoose Models, Repos,    │  │
       │  │                       Multer, Bcrypt, JWT)       │  │
       │  └──────────────────────────────────────────────────┘  │
       └────────────────────────────────────────────────────────┘
```

### Monorepo Structure
```text
Project-1-Retail-Ecommerce-Multi-Vendor-Marketplace-Platform/
├── backend/
│   ├── docs/
│   │   ├── openapi.json                  # OpenAPI 3.0 specification
│   │   └── postman_collection.json       # Complete Postman v2.1 test collection
│   ├── scripts/
│   │   └── verify.js                     # 23-point automated verification runner
│   ├── src/
│   │   ├── application/services/         # UserService, ProductService
│   │   ├── config/                       # Mongoose db.js, Zod env.js
│   │   ├── domain/entities/              # Pure User.js, Product.js
│   │   ├── infrastructure/
│   │   │   ├── models/                   # UserModel, ProductModel
│   │   │   ├── repositories/             # UserRepository, ProductRepository
│   │   │   └── security/                 # PasswordHasher (bcrypt), TokenService (JWT)
│   │   ├── interfaces/
│   │   │   ├── controllers/              # authController, productController
│   │   │   ├── middleware/               # auth, rbac, validate, upload (multer), errorHandler
│   │   │   └── routes/                   # authRoutes, productRoutes, index.js
│   │   ├── app.js                        # Express app, Swagger UI, static uploads
│   │   ├── container.js                  # Dependency injection container
│   │   └── server.js                     # Process entry point
│   ├── uploads/products/                 # Multipart uploaded images
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/                          # Axios client.js, authService, productService
    │   ├── components/                   # ProtectedRoute.jsx, VendorLayout.jsx
    │   ├── context/                      # AuthContext.jsx
    │   ├── pages/
    │   │   ├── VendorLogin.jsx           # Sign in view with demo fill helper
    │   │   ├── VendorRegister.jsx        # Vendor store onboarding
    │   │   ├── DashboardHome.jsx         # Live metrics, stock counters, recent listings
    │   │   ├── ProductList.jsx           # Inventory table, filters, delete modal
    │   │   └── ProductForm.jsx           # Create/Edit product with live photo preview
    │   ├── App.jsx                       # Code-split lazy routing & providers
    │   ├── main.jsx
    │   └── index.css                     # Tailwind CSS directives
    ├── vite.config.js                    # Vite setup with /api & /uploads proxy
    └── package.json
```

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Endpoint | Method | Security | Allowed Roles | Description |
| :--- | :---: | :---: | :---: | :--- |
| `/health` | `GET` | Public | None | Server health status |
| `/api/docs` | `GET` | Public | None | Interactive Swagger UI |
| `/api/v1/auth/register` | `POST` | Public | None | Registers `customer` or `vendor` |
| `/api/v1/auth/login` | `POST` | Public | None | Returns signed JWT + user profile |
| `/api/v1/auth/me` | `GET` | Protected | Authenticated | Current authenticated profile |
| `/api/v1/auth/vendor/dashboard` | `GET` | Protected | `vendor`, `admin` | Vendor-scoped dashboard status |
| `/api/v1/auth/admin/dashboard` | `GET` | Protected | `admin` | Platform admin operations |
| `/api/v1/products` | `POST` | Protected | `vendor`, `admin` | Create product with photo (Multipart) |
| `/api/v1/products/vendor` | `GET` | Protected | `vendor`, `admin` | View authenticated vendor's listings |
| `/api/v1/products/:id` | `GET` | Public | None | View product details |
| `/api/v1/products/:id` | `PUT` | Protected | `vendor`, `admin` | Update own product (Isolated) |
| `/api/v1/products/:id` | `DELETE` | Protected | `vendor`, `admin` | Delete own product (Isolated) |

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas URI)

### 1. Backend Setup
```powershell
cd backend
npm install
cp .env.example .env
# Edit .env if using a custom MongoDB URI
npm run dev
```
*Backend runs on `http://localhost:5000` with Swagger UI at `http://localhost:5000/api/docs`.*

### 2. Frontend Setup
In a new terminal:
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000` with proxy configured to backend.*

---

## 🧪 Automated Testing & Verification

### Backend Verification Suite (23/23 Passing)
Run the comprehensive unit, RBAC, and multi-vendor isolation test suite:
```powershell
cd backend
npm test
```

### Frontend Production Build
Verify React bundle compilation and code-splitting:
```powershell
cd frontend
npm run build
```

---

## 📖 API Documentation & Postman

- **Interactive Swagger UI**: Open `http://localhost:5000/api/docs` when the backend is running.
- **Postman Collection**: Import `backend/docs/postman_collection.json` into Postman to run the pre-configured test suite.
