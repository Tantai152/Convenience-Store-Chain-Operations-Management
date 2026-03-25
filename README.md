# 🏪 Convenience Store Chain — Operations Management System

> Internal web app for managing a convenience store chain | IT Project Management Course · 5 Members · 3.5 Weeks

---

## Table of Contents

- [About](#about)
- [Team & Roles](#team--roles)
- [Features (6 Modules)](#features-6-modules)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Timeline](#timeline)
- [Phase 1 — Initiation & Planning (Day 1–3)](#phase-1--initiation--planning-day-13)
- [Local Setup](#local-setup)
- [Deployment](#deployment)
- [Project Documents](#project-documents)
- [Quick Links](#quick-links)

---

## About

A web-based internal dashboard that allows Admins and Store Managers to manage inventory, employees, and sales reports across multiple store branches — all in one place.

**Users:** Admin · Store Manager · Staff

---

## Team & Roles

| # | Role | Responsibilities |
|---|------|-----------------|
| 1 | **PM** | Gantt chart, daily standups, 3 progress reports, risk register, blocker resolution |
| 2 | **BE Dev 1** | DB schema, Auth API (login/JWT), Branch CRUD, Employee CRUD, Postman tests |
| 3 | **BE Dev 2** | Product/Inventory APIs, Sales/Orders APIs, seed data, deploy to Render.com |
| 4 | **FE Dev** | All 6 pages, routing, API integration, basic responsive layout |
| 5 | **BA/Tester** | Wireframes, requirements doc, 30+ test cases, bug reports, User Manual, final report |

> ⚠️ **FE Dev:** You are the only frontend person. Use **Bootstrap 5** or **shadcn/ui** — do not write CSS from scratch. Pick one on Day 1 and stick with it.

---

## Features (6 Modules)

| # | Page | Description | Owner |
|---|------|-------------|-------|
| 1 | **Login** | Email + password form. Success → Dashboard. Show error on wrong credentials. | FE + BE Dev 1 |
| 2 | **Dashboard** | KPI cards (total stores, products, low-stock count, recent orders). Weekly sales chart. | FE + BE Dev 2 |
| 3 | **Branch Management** | Table of all branches. Add / edit / deactivate. Shows name, address, manager, status. | FE + BE Dev 1 |
| 4 | **Inventory Management** | Products with stock per store. Color-coded badges (green/yellow/red). Add/edit products. | FE + BE Dev 2 |
| 5 | **Employee Management** | Employee list filtered by branch. Add / edit / deactivate. Shows name, role, shift. | FE + BE Dev 1 |
| 6 | **Sales Reports** | Daily/Weekly/Monthly toggle. Revenue trend chart. Recent orders table + totals. | FE + BE Dev 2 |

---

## Tech Stack

| Layer | Tool | Reason |
|-------|------|--------|
| Frontend | HTML + CSS + JS (Bootstrap 5) | Quick setup, ready-made components |
| Backend | Node.js + Express.js | Fast to set up, great for REST APIs |
| Database | MySQL or PostgreSQL | Standard relational DB for structured data |
| API Testing | Postman | Test endpoints without needing the frontend ready |
| Version Control | Git + GitHub | Mandatory for all members |
| Wireframes / WBS | draw.io (app.diagrams.net) | Free, browser-based, no account needed |
| Task Tracking | Trello or GitHub Projects | PM tracks: To Do → In Progress → Done |
| Deployment | Render.com (BE) + Vercel (FE) | Free tier, no server management |
| Charts | Chart.js via CDN | ~10 lines of code for a bar chart |

---

## Folder Structure

```
convenience-store-management/
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── db/
│       └── schema.sql
└── docs/
    ├── api_contract.md
    ├── WBS_Diagram.png
    ├── Requirements.docx
    └── ...
```

---

## Timeline

| Phase | Name | Days | Key Deliverables |
|-------|------|------|-----------------|
| 1 | Initiation & Planning | 1–3 | Project Charter, Scope Statement, WBS, Gantt, GitHub setup, Wireframes, DB Schema draft |
| 2 | Design & Setup | 4–8 | Wireframes locked, DB schema final, API contract agreed, FE/BE skeletons running |
| 3 | Sprint 1 — Core Features | 9–13 | Login/Auth, Dashboard, Branch Management (full CRUD, FE + BE) |
| 4 | Sprint 2 — Remaining Features | 14–17 | Inventory, Employees, Sales Reports, Role-based access, bug fixes |
| 5 | Testing, Deploy & Wrap-up | 18–21 | UAT, deployment, User Manual, Final Report, presentation |

> 📌 **Golden Rule:** Never start a new phase before the previous phase's exit checklist is fully cleared. PM checks — if anything is missing, delay by 1 day rather than carry broken work forward.

---

## Phase 1 — Initiation & Planning (Day 1–3)

> 🎯 **Goal by end of Day 3:** Everyone knows what is being built, who does what, and has push access to the GitHub repo. Every document created in this phase must be shared in the group chat the same day it is created.

This phase is **PM-driven**. Do not skip anything — a bad plan means a chaotic project later.

---

### Task 1: Project Charter
**Owner:** PM | **Effort:** 0.5 day

Write a 1-page document covering: project name & goal, all 5 team members + roles, key milestones (end dates for each phase), and a sign-off line: *"Approved by all members."*

Share in group chat. Ask everyone to reply **"Approved"**. Screenshot the replies.

✅ **Done when:** All 5 members have replied "Approved."

---

### Task 2: Scope Statement
**Owner:** PM | **Effort:** 0.5 day

Create `Scope_Statement.docx` with these sections:

| Section | Content |
|---------|---------|
| **Project Purpose** | 2–3 sentences: what it is, who uses it, what problem it solves |
| **In-Scope Features** | All 6 modules listed above (one bullet each, be specific) |
| **Out-of-Scope** | At least 5 things NOT being built (e.g. mobile app, payment processing, SMS notifications, multi-language support) |
| **Deliverables** | Working web app, GitHub repo, final report, presentation, user manual |
| **Assumptions** | 3–5 assumptions (e.g. "All members have a working laptop with Node.js installed") |
| **Constraints** | 2–4 constraints (e.g. "3.5-week deadline", "free-tier hosting only", "no paid APIs") |
| **Sign-off** | Table with all 5 names + an "Approved" column |

> 💡 Keep it to 1–2 pages max. Bullet points are fine. Clarity over length.

✅ **Done when:** Document created and confirmed by the team.

---

### Task 3: WBS Diagram
**Owner:** PM | **Effort:** 1.0 day

Use **draw.io** at [app.diagrams.net](https://app.diagrams.net) — free, no account needed.

**3-level structure:**
```
Level 1:  1.0 Convenience Store Chain Project
Level 2:  1.1 Planning | 1.2 Design | 1.3 Sprint 1 | 1.4 Sprint 2 | 1.5 Delivery
Level 3:  1.1.1 Project Charter | 1.1.2 Scope Statement | 1.1.3 WBS | 1.1.4 Gantt | ...
```

**Steps:**
1. Go to app.diagrams.net → Create New Diagram → Blank → Create
2. Double-click canvas → type root box name → format blue background, white text
3. Add 5 Level 2 phase boxes below, connect each to root
4. Add Level 3 task boxes under each phase, connect to phase box
5. Label every Level 3 task with the assignee in brackets — e.g. `1.1.1 Project Charter (PM)`
6. Export: File → Export As → PNG → Save as `WBS_Diagram.png`

> 🔢 Every task must have a unique number. Never skip numbers. This lets the team reference tasks by ID in meetings instead of "that login thing."

✅ **Done when:** `WBS_Diagram.png` is in the shared folder.

---

### Task 4: Gantt Chart
**Owner:** PM | **Effort:** 1.0 day

**Option A — TeamGantt (recommended):** [teamgantt.com](https://teamgantt.com) → sign up free → New Project → set name and start date. Free plan allows up to 3 users — PM manages and shares the view link.

**Option B — Google Sheets (no signup needed):** Column A = task name, B = assignee, C onward = one column per day (Day 1–21). Fill cells with color when a task is active. Color by person: blue = PM, green = BE Dev 1, orange = BE Dev 2, purple = FE Dev, yellow = BA/Tester.

**The Gantt must include:**
- All tasks across all 5 phases (25–30 minimum)
- Assignee, start date, and end date for every task
- Dependencies between tasks shown as arrows
- The critical path visible
- A milestone marker for each phase end

> ⚠️ Do not make every task 3 days just for convenience. Each leaf-level task should be 0.5–1 day. A 4-day task should be broken into 4 × 1-day sub-tasks.

✅ **Done when:** Gantt link is shared in the group chat.

---

### Task 5: Risk Register
**Owner:** PM | **Effort:** 0.5 day

Create a Google Sheet with 8 columns: `ID | Risk Description | Probability | Impact | Score | Category | Mitigation | Owner`

**Pre-identified risks — copy these in, then add at least 2 more specific to your team:**

| ID | Risk | Level | Mitigation |
|----|------|-------|-----------|
| R01 | A team member is sick/unavailable for 2+ days | High | PM reassigns their tasks to whoever has the lightest load |
| R02 | FE Dev blocked waiting for an API that is not ready | High | BE Dev writes a mock API with fake data so FE can keep building |
| R03 | Scope creep — someone requests unplanned features | High | PM says no immediately; any new feature needs a written change request |
| R04 | App works locally but breaks on deployment | High | BE Dev 2 does a test deploy on Day 17 (not Day 21) to leave time for fixes |
| R05 | Git merge conflicts waste dev time | High | Everyone works on separate branches; merge to main every evening |
| R06 | Wireframes not ready before coding starts | High | BA/Tester must finish wireframes by end of Day 5; no FE coding before approval |
| R07 | Final report not finished on time | Med | PM and BA/Tester fill in the report template throughout the project, not all at the end |

✅ **Done when:** Risk Register spreadsheet created and shared with the team.

---

### Task 6: GitHub Repo Setup
**Owner:** BE Dev 1 | **Effort:** 1.0 day

1. Create a new GitHub repo named `convenience-store-management`
2. Add all 5 members as collaborators with push access
3. Create folders: `/frontend`, `/backend`, `/docs`
4. Create this `README.md`

✅ **Done when:** All 5 members have push access and README exists.

---

### Task 7: DB Schema Draft
**Owner:** BE Dev 1 + BE Dev 2 | **Effort:** 1.5 days

Use **[dbdiagram.io](https://dbdiagram.io)** (free, no install) to draw the ERD.

**Tables required:**

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `roles` | Role types (admin, manager, staff) |
| `stores` | Store branches |
| `products` | Product catalogue |
| `inventory` | Stock levels per store |
| `employees` | Employee records |
| `orders` | Order records |
| `sales` | Aggregated revenue data |

For each table: list all columns, data types, and the primary key.

✅ **Done when:** ERD exported and committed to `/docs`.

---

### Task 8: Wireframes — All 6 Pages
**Owner:** BA/Tester | **Effort:** 2.0 days

Use draw.io or pen-and-paper (photo it). Does not need to be polished — just show where buttons, tables, and forms are placed on each page. Share with PM and FE Dev for feedback before finalizing.

✅ **Done when:** All 6 wireframe sketches approved by PM.

---

### Task 9: Requirements Document
**Owner:** BA/Tester | **Effort:** 1.0 day

Create `Requirements.docx` in `/docs`. For each of the 6 pages, write functional requirements in this format:

> *"The system shall [do something]."*
> e.g. *"The system shall display a table of all store branches with name, address, manager, and status."*

Target: **20–30 requirements total.**

✅ **Done when:** `Requirements.docx` is saved in `/docs`.

---

### Task 10: Test Plan Draft
**Owner:** BA/Tester | **Effort:** 0.5 day

Create a Google Sheet with these columns:

| Test Case ID | Feature | Steps | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|

Leave the last 2 columns blank for now. Target is **30+ test cases total** — start with 10 rows and fill in more during Phase 2.

✅ **Done when:** Sheet exists with column headers and at least 10 initial test case rows.

---

### Phase 1 Exit Checklist — PM verifies before Day 4 starts

- [ ] Project Charter shared and acknowledged by all 5 members
- [ ] Scope Statement written and confirmed by team
- [ ] WBS Diagram exported and in shared folder
- [ ] Gantt chart accessible via link, all tasks visible
- [ ] GitHub repo created, all 5 members have push access
- [ ] DB schema draft committed to `/docs`
- [ ] Rough wireframes for all 6 pages exist and reviewed by PM

---

## Local Setup

### Backend

```bash
cd backend
npm install
# Create a .env file with: DB_URL, JWT_SECRET, PORT=3001
node server.js
# Verify: GET http://localhost:3001/api/health → { "status": "ok" }
```

### Frontend

```bash
# Plain HTML/JS:
cd frontend
# Open index.html in browser or use the Live Server VS Code extension

# React:
cd frontend
npm install
npm start
```

### Database

```bash
cd backend
node db/seed.js
# Expected seed data: 3 admin users, 5 branches, 20 products, 10 employees, 50 orders
```

---

## Deployment

| Layer | Platform | URL |
|-------|----------|-----|
| **Backend** | [Render.com](https://render.com) | *(BE Dev 2 fills in after deploy)* |
| **Frontend** | [Vercel](https://vercel.com) | *(FE Dev fills in after deploy)* |

> ⚠️ After deploying the frontend, update all API base URLs in your JS files to point to the deployed backend URL — not `localhost`.

---

## Project Documents

| Document | Owner | Location |
|----------|-------|----------|
| Project Charter | PM | `/docs/Project_Charter.docx` |
| Scope Statement | PM | `/docs/Scope_Statement.docx` |
| WBS Diagram | PM | `/docs/WBS_Diagram.png` |
| Gantt Chart | PM | *(link — fill in)* |
| Risk Register | PM | *(Google Sheet link — fill in)* |
| DB Schema (ERD) | BE Dev 1 | `/docs/ERD.png` |
| SQL Schema | BE Dev 1 + 2 | `/backend/db/schema.sql` |
| API Contract | BE Dev 1 + 2 | `/docs/api_contract.md` |
| Wireframes | BA/Tester | `/docs/Wireframes/` |
| Requirements | BA/Tester | `/docs/Requirements.docx` |
| Test Cases | BA/Tester | *(Google Sheet link — fill in)* |
| User Manual | BA/Tester | `/docs/User_Manual.docx` |
| Final Report | PM + BA/Tester | `/docs/Final_Report.docx` |

---

## Quick Links

| Tool | Link |
|------|------|
| Gantt Chart | *(fill in)* |
| Trello Board | *(fill in)* |
| DB Diagram | *(fill in)* |
| Deployed Backend | *(fill in)* |
| Deployed Frontend | *(fill in)* |
| Google Drive | *(fill in)* |

---

*Good luck team 🍀 — If anything is unclear, re-read the relevant section of the team guide. If still unsure, PM asks the lecturer — don't guess.*