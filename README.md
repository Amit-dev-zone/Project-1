# Project 1: Retail & Ecommerce – Multi-Vendor Marketplace Platform
> **Axlero Startup Launch Kit** | MERN Multi-Vendor Infrastructure

[![Build Status](https://img.shields.io/badge/Verification-18%2F18%20Passing-brightgreen)](#automated-testing)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20Architecture-blue)](#architecture-overview)
[![API Docs](https://img.shields.io/badge/Swagger-OpenAPI%203.0-orange)](http://localhost:5000/api/docs)
[![Auth](https://img.shields.io/badge/Security-JWT%20%2B%20RBAC-red)](#role-based-access-control-rbac)

---

## 📌 System Context & Problem Statement
The rise of D2C (Direct-to-Consumer) brands requires robust multi-vendor digital infrastructure. Traditional e-commerce templates often fail to provide isolated vendor dashboards, unified cart management across different sellers, and split-payment architecture. 

This platform serves as a launch kit for scalable multi-vendor marketplaces, allowing independent sellers to manage localized catalogs and inventory while offering consumers a unified storefront.

### End-User Personas
1. **Platform Admin**: Manages vendor approvals, platform commissions, and global categories.
2. **Vendors (Sellers)**: Isolated dashboard to upload products, track localized inventory, and manage order fulfillment.
3. **Customers**: Single unified shopping cart across multiple vendors and seamless checkout.

---

## 🗓️ Week 1 Milestone: Backend Foundation & Clean Architecture (Nov 8 – Nov 15)

- [x] **Node.js & Express Scaffold**: Clean Architecture directory structure separating domain rules from external frameworks.
- [x] **MongoDB & Mongoose Schemas**: Configured models with index optimizations (`UserModel`, `ProductModel`).
- [x] **Pure Domain Entities**: Created `User` and `Product` entities enforcing domain invariants and vendor isolation rules.
- [x] **JWT Authentication & RBAC Middleware**: Implemented role enforcement distinguishing between **Platform Admin**, **Vendor**, and **Customer**.
- [x] **Environment Validation**: Boot-time Zod schema validation for environment variables.
- [x] **Interactive Swagger Docs**: Mounted OpenAPI 3.0 UI at `/api/docs`.
- [x] **Postman Collection Export**: Ready-to-test collection in `backend/docs/postman_collection.json`.

---

## 🏛️ Architecture Overview

The system strictly adheres to **Clean Architecture** principles:

```text
       ┌────────────────────────────────────────────────────────┐
       │             INTERFACES (Controllers, Routes)           │
       │  ┌──────────────────────────────────────────────────┐  │
       │  │        APPLICATION (Services & Use-Cases)        │  │
       │  │  ┌────────────────────────────────────────────┐  │  │
       │  │  │         DOMAIN (Pure Business Entities)    │  │  │
       │  │  └────────────────────────────────────────────┘  │  │
       │  │       INFRASTRUCTURE (Mongoose Models, Repos,    │  │
       │  │                       Bcrypt, TokenService)      │  │
       │  └──────────────────────────────────────────────────┘  │
       └────────────────────────────────────────────────────────┘
```

### Folder Layout
```text
backend/
├── docs/
│   ├── openapi.json                  # OpenAPI 3.0 specification
│   └── postman_collection.json       # Postman v2.1 collection export
├── scripts/
│   └── verify.js                     # 18-point verification test runner
├── src/
│   ├── application/
│   │   └── services/
│   │       ├── UserService.js        # Auth use-cases (register, login, me)
│   │       └── ProductService.js     # Vendor product management use-cases
│   ├── config/
│   │   ├── db.js                     # Mongoose connection
│   │   └── env.js                    # Boot-time Zod env validation
│   ├── domain/
│   │   └── entities/
│   │       ├── User.js               # Pure User entity & role enums
│   │       └── Product.js            # Pure Product entity & stock invariants
│   ├── infrastructure/
│   │   ├── models/
│   │   │   ├── UserModel.js          # Mongoose user schema
│   │   │   └── ProductModel.js       # Mongoose product schema with vendorId
│   │   ├── repositories/
│   │   │   ├── UserRepository.js     # User data access layer
│   │   │   └── ProductRepository.js  # Vendor-isolated product queries
│   │   └── security/
│   │       ├── PasswordHasher.js     # Bcrypt wrapper
│   │       └── TokenService.js       # JWT wrapper
│   ├── interfaces/
│   │   ├── controllers/
│   │   │   └── authController.js     # Express request handlers
│   │   ├── middleware/
│   │   │   ├── auth.js               # Bearer JWT verification
│   │   │   ├── errorHandler.js       # Global exception handler
│   │   │   ├── rbac.js               # Role-based access control guard
│   │   │   └── validate.js           # Zod body validation middleware
│   │   └── routes/
│   │       ├── authRoutes.js         # Authentication endpoints
│   │       └── index.js              # /api/v1 router
│   ├── app.js                        # Express app & middleware configuration
│   ├── container.js                  # Dependency injection container
│   └── server.js                     # Process entry point
├── .env.example
└── package.json
```

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Endpoint | Method | Public / Auth | Required Role | Description |
| :--- | :---: | :---: | :---: | :--- |
| `/health` | `GET` | Public | None | Server health status |
| `/api/docs` | `GET` | Public | None | Interactive Swagger UI |
| `/api/v1/auth/register` | `POST` | Public | None | Registers `customer` or `vendor` |
| `/api/v1/auth/login` | `POST` | Public | None | Returns JWT + user object |
| `/api/v1/auth/me` | `GET` | Protected | Authenticated | Current profile |
| `/api/v1/auth/vendor/dashboard` | `GET` | Protected | `vendor`, `admin` | Vendor-scoped dashboard |
| `/api/v1/auth/admin/dashboard` | `GET` | Protected | `admin` | Platform admin governance |

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local instance or MongoDB Atlas connection string)

### 1. Installation
```powershell
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
Ensure `.env` contains:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/multi_vendor_marketplace
JWT_SECRET=super_secret_jwt_key_that_is_at_least_32_characters_long_12345
JWT_EXPIRES_IN=1d
```

### 3. Run Development Server
```powershell
npm run dev
```
The server will boot at `http://localhost:5000`.

---

## 🧪 Automated Testing

Run the full 18-point verification suite checking domain entities, models, password hashing, JWT generation, Zod validation, and RBAC guards:

```powershell
npm test
```

---

## 📖 API Documentation & Postman

### Interactive Swagger UI
When the backend is running, open:
👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

### Postman Collection
Import the collection file located at:
`backend/docs/postman_collection.json`
- Includes pre-configured requests for registration, login, profile retrieval, and RBAC test scenarios.
- Automatically saves and reuses the JWT Bearer token across requests.
