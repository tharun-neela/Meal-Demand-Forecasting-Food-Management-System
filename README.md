# LPU Mess — Meal Demand Forecasting & Food-Waste Management System

A modern full-stack web application built for Lovely Professional University to predict meal attendance, optimize kitchen preparation, and systematically eliminate food waste.

---

## Project Overview

### Description
Forecasts attendance for each meal service using historical attendance and calendar context, converts the forecast into preparation and ingredient quantities via recipe data, captures post-service actuals – prepared, served, leftover – and reports waste quantity and cost with forecast-accuracy feedback.

### Problem Statement
Kitchens prepare against registered strength, not actual demand. Demand varies with menu, weekday, holidays, examinations and events. Over-preparation is routine, waste is unmeasured, and its cost is invisible.

### Target Users
- **Students** — Access daily menus, submit dietary attendance feedback.
- **Kitchen Staff** — Review daily ingredient prep sheets and record post-service actuals.
- **Mess Managers** — Inspect forecasted demand, adjust batch cooking, and monitor kitchen operations.
- **Mess Administrators** — Manage mess units, academic calendars, and holiday meal configurations.
- **Finance Officers** — Audit food-waste costs, procurement savings, and per-plate budgets.
- **Administrators** — Manage system access and global system configurations.

### Expected Outcome
Measurable reduction in avoidable waste, a documented cost saving, and a planning loop that improves each cycle.

---

## Project Architecture

```text
├── client/                     # Next.js 15+ Frontend (React 19, TypeScript)
│   ├── src/
│   │   └── app/                # App Router (page.tsx, layout.tsx, globals.css)
│   ├── public/                 # Static assets (Official LPU Logo, icons)
│   ├── tsconfig.json           # Frontend TypeScript configuration
│   └── package.json            # Frontend dependencies
│
├── server/                     # Express Backend (Node.js, TypeScript)
│   ├── src/
│   │   ├── controllers/        # Auth & Status controllers
│   │   ├── middleware/         # JWT verification & RBAC middleware
│   │   ├── routes/             # API routes (/api/auth, /api/health)
│   │   ├── data/               # In-memory mock accounts with bcrypt hashes
│   │   └── index.ts            # Server entrypoint with Helmet security headers
│   ├── .env.example            # Environment variables template
│   ├── tsconfig.json           # Backend TypeScript configuration
│   └── package.json            # Backend dependencies (express, bcryptjs, jsonwebtoken, helmet)
│
├── package.json                # Root orchestration & scripts (concurrently)
└── .gitignore                  # Git ignore rules for both client & server
```

---

##  Quick Start

### 1. Run Both Frontend and Backend Concurrently
From the project root directory, run:
```bash
npm run dev
```

- **Frontend (Next.js & React)**: [http://localhost:3000](http://localhost:3000)
- **Backend (Node.js & Express)**: [http://localhost:5000](http://localhost:5000)

---

## Available Scripts (Root)

| Command | Description |
|---|---|
| `npm run dev` | Runs both Express server and Next.js client concurrently |
| `npm run dev:server` | Runs the Express TypeScript backend on port 5000 (`tsx watch`) |
| `npm run dev:client` | Runs the Next.js React frontend on port 3000 |
| `npm run build` | Builds both backend (`tsc`) and frontend (`next build`) |
| `npm run build:server`| Compiles server TypeScript to `server/dist/` |
| `npm run build:client`| Generates production Next.js build |
| `npm run install:all` | Installs root, server, and client npm dependencies |

---

## Default Test Credentials (Password: `password123`)

| Role | User ID | Password | Scope |
|---|---|---|---|
| **Student** | `12204918` | `password123` | Student meal attendance |
| **Kitchen Staff** | `KS-304` | `password123` | Ingredient & actuals logging |
| **Mess Manager** | `MM-108` | `password123` | Forecasting & prep planning |
| **Mess Administrator** | `MA-201` | `password123` | Calendar & unit administration |
| **Finance Officer** | `FO-502` | `password123` | Food-waste cost audits |
| **Administrator** | `admin` | `password123` | Full system control |
