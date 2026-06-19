# Task 2-d: Admin Dashboard

Agent: full-stack-developer
Task: Build the full admin dashboard (shell + 12 tabs) under `src/components/admin/`.

## Scope
- `admin-view.tsx` — shell w/ sidebar, topbar, access guard, Framer Motion tab transitions
- `admin-overview.tsx` — KPIs, Recharts charts, recent orders, top courses
- `admin-orders.tsx` — table + filters + CSV export + detail sheet
- `admin-courses.tsx` — grid + edit/new dialog
- `admin-coupons.tsx` — table + create dialog + live preview
- `admin-students.tsx` — derived from orders + detail dialog
- `admin-activity.tsx` — timeline + filter
- `admin-notifications.tsx` — broadcast form + list
- `admin-announcements.tsx` — create form + list w/ toggles
- `admin-reviews.tsx` — table + featured toggle
- `admin-blog.tsx` — table + edit/new dialog
- `admin-cms.tsx` — page select + form
- `admin-settings.tsx` — platform form

## Conventions used
- All files `"use client"`.
- Toasts: `import { toast } from "sonner"`.
- Recharts: chart colors via `var(--chart-1..5)`.
- Store API: exact per brief (`useLms`, `setAdminTab`, `enterAdminDemo`, `navigate`, etc.).
- Brand: emerald palette, no indigo/blue. Dark mode default.
- Sidebar collapses on mobile via Sheet (hamburger in topbar).
