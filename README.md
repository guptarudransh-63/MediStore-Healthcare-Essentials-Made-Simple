# MediStore — Pharmacy Management & Medicine Ordering SaaS

**MediStore** is a comprehensive, production-grade pharmacy management and medicine ordering full-stack platform built with Node.js, Express, MongoDB, and React. It unifies customer digital ordering with back-office pharmacy operations: batch-level inventory management, **First Expiry, First Out (FEFO)** allocation algorithms, expiry risk monitoring, prescription verification, GST tax billing, and real-time sales analytics.

---

## 🌟 Key Features

### 1. Customer Ordering Portal
- **Healthcare Catalogue:** Search medicines by brand, generic name, active pharmaceutical ingredients (API), or SKU.
- **Categorization:** Prescription Medicines (Schedule H/H1), OTC Pain & Cold, Medical Devices, Health Supplements, First Aid, Personal Care, Baby Care, and Hygiene.
- **Prescription-Aware Ordering:** Products marked `rx_required` mandate an uploaded doctor prescription before checkout can proceed.
- **Detailed Medicine Information:** Transparent composition, strength, dosage form, pack size, storage instructions, and MRP discount calculations.
- **Shopping Cart & Checkout:** Real-time stock validation against active non-expired batches, CGST/SGST breakdown, and free delivery thresholds.
- **Patient Vault:** Upload and track prescriptions (PNG, JPG, WEBP, PDF) with reviewer notes and doctor registration numbers.
- **Order Tracking & Cancellation:** Live order lifecycle progress with one-click cancellation that automatically returns allocated batch stock.
- **GST Tax Invoice:** Certified printable tax invoice for every completed order with HSN codes and batch-level numbers.

### 2. Pharmacy Operations & Admin Dashboard
- **Executive KPI Dashboard:** Real-time gross sales, order fulfillment queue, inventory valuation, at-risk near-expiry financial value, and low-stock reorder alerts.
- **Medicine Catalogue Management:** Add, edit, and archive formulations with complete regulatory fields.
- **Batch-Level Inventory Management:**
  - Multi-batch tracking per formulation (Received, Available, and Reserved quantities).
  - Physical audit stock corrections and damaged stock removals with actor logging.
  - Automatic **FEFO (First Expiry, First Out)** allocation during customer order placement.
- **Expiry Tracking & Risk Alerts:**
  - Multi-tier thresholds: Expired, $\le 7$ Days Critical, $\le 30$ Days Near Expiry, $\le 60$ Days Watchlist, $\le 90$ Days, and Safe Stock.
  - At-risk financial valuation ($\text{Quantity} \times \text{Purchase Price}$).
  - One-click Quarantine & Discard expired batch action with audit trail.
- **Pharmacist Prescription Queue:**
  - Review uploaded doctor slips with side-by-side image/PDF preview.
  - Approve, reject, or request clarification with internal review notes and doctor council registration verification.
  - Direct integration into order lifecycle (`Pending Rx Review` $\to$ `Prescription Approved`).
- **Fulfillment Pipeline:**
  - Order status transitions: `Order Placed` $\to$ `Pending Rx Review` $\to$ `Prescription Approved` $\to$ `Confirmed` $\to$ `Processing` $\to$ `Packed` $\to$ `Out for Delivery` $\to$ `Delivered`.
  - Batch allocation snapshots preserved so historical orders remain unchanged.
- **Stock Receiving Workflow:** Receive stock from registered pharmaceutical distributors, updating batch quantities and logging `stock_in` movements.
- **Suppliers & Customer Management:** Maintain verified vendor profiles and inspect patient order histories and lifetime spend.
- **Sales & Inventory Reports:** Interactive Recharts analytics (Revenue trends, Top products, Top manufacturers, Payment distribution, and Movement logs).

---

## 🛠 Technology Stack

- **Frontend:** React 18, Vite, JavaScript (JSX), Tailwind CSS, React Router v6, Zustand, Axios, Recharts, Lucide React, Framer Motion.
- **Backend:** Node.js, Express.js (ES Modules), MongoDB, Mongoose, JWT, bcryptjs, Multer.
- **Architecture:** Decoupled RESTful API with atomic inventory services and strict separation between customer and staff authorization.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js $\ge$ 18 (Tested on v26)
- MongoDB $\ge$ 6 (Running locally on `mongodb://127.0.0.1:27017`)

### 1. Installation
Clone or navigate to the workspace directory:
```bash
# Install root, backend, and frontend dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Environment Configuration
The server configuration is located in `server/.env`:
```env
PORT=5088
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/medistore
JWT_SECRET=medistore_jwt_secure_secret_key_2026_xyz987
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5180
PHARMACY_NAME=MediStore Pharmacy & Healthcare Solutions
PHARMACY_ADDRESS=Plot 42, Health City, Sector 18, Gurugram, Haryana 122001
PHARMACY_PHONE=+91 98765 43210
PHARMACY_EMAIL=support@medistore.health
PHARMACY_GSTIN=06AAAAA0000A1Z5
PHARMACY_DL=HR-GGM-2024-DL009876
```

### 3. Seed Realistic Pharmacy Data
Seed 29+ certified healthcare products across 8 categories, 32+ multi-dated batches, suppliers, demo customers, and orders:
```bash
npm run seed
```

### 4. Running MediStore
Start the backend and frontend simultaneously:
```bash
npm run dev
```
- **Customer Storefront & Admin Portal:** [http://localhost:5180](http://localhost:5180)
- **Backend API:** [http://localhost:5088/api](http://localhost:5088/api)
- **API Health Check:** [http://localhost:5088/api/health](http://localhost:5088/api/health)

---

## 🔑 Demo Login Credentials

Pre-configured accounts with instant one-click login buttons on `/login`:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Admin** | `admin@medistore.health` | `Password@123` | Full access to Products, Inventory, FEFO Batches, Expiry Alerts, Orders, Suppliers, Customers, Analytics |
| **Pharmacist** | `pharmacist@medistore.health` | `Password@123` | Prescription Queue review, doctor registration validation, order dispensing workflow |
| **Customer** | `customer@medistore.health` | `Password@123` | Product browsing, cart, prescription upload, checkout, order tracking, and GST invoice download |

---

## 🧪 Automated Test Suite

A standalone test suite exercises all core workflows directly against the database:
```bash
node server/src/scripts/testSuite.js
```

### Acceptance Test Results
- `✓ PASS`: API Server health check endpoint is responsive
- `✓ PASS`: Admin login successful and role verified
- `✓ PASS`: Pharmacist login successful
- `✓ PASS`: Customer login successful
- `✓ PASS`: Product catalogue loaded with 29 items
- `✓ PASS`: Both Prescription (Rx) and OTC categories are present
- `✓ PASS`: Batches retrieved for Pantocid 40 Tablet: 1 batches found
- `✓ PASS`: Batch sequence strictly follows FEFO (Earliest expiry date first)
- `✓ PASS`: Expiry financial risk computed
- `✓ PASS`: Expired batches identified and flagged
- `✓ PASS`: Added OTC product to customer cart (Quantity: 2)
- `✓ PASS`: Cart recalculated totals with GST
- `✓ PASS`: Order placed successfully with FEFO allocation
- `✓ PASS`: Item allocated from specific non-expired batch
- `✓ PASS`: FEFO atomic stock deduction verified
- `✓ PASS`: GST Tax Invoice generated with valid GSTIN and HSN
- `✓ PASS`: Admin successfully advanced order status to "confirmed"
- `✓ PASS`: Order cancelled successfully
- `✓ PASS`: Batch inventory restored upon cancellation
- `✓ PASS`: Inventory movement audit trail recorded order cancellation return with actor
- `✓ PASS`: Prescription approved by pharmacist in review queue

**Result:** `20 PASSED, 0 FAILED (100% Success)`.

---

## 🏛 Legal & Regulatory Safeguard

MediStore is designed exclusively for pharmacy operational efficiency and compliant healthcare commerce. It strictly enforces:
1. **No Automated Prescribing:** The system does not diagnose illnesses, prescribe medications, or recommend unprompted pharmaceutical substitutions.
2. **Prescription Mandate:** Products classified under Schedule H/H1 require registered pharmacist manual approval before dispensing.
3. **Audit Immutability:** Historical order snapshots and inventory movements cannot be retroactively modified.
