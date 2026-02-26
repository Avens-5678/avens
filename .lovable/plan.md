
# Dashboard UI Redesign — Sidebar Layout with Mobile Responsiveness

## Goal
Redesign all three dashboards (Admin, Client, Vendor) to use a vertical sidebar navigation matching the reference image, with proper mobile responsiveness. No functionality changes — only UI/layout restructuring.

## Reference Design Analysis
- Left sidebar with icon-based navigation (vertical pills)
- Warm neutral background
- Gradient stat cards in overview
- Rounded cards with soft shadows
- On mobile: sidebar becomes a bottom tab bar or hamburger-triggered sheet

---

## Implementation

### 1. Create `src/components/admin/DashboardShell.tsx` (New File)

A shared layout wrapper used by all three dashboards:

**Props:**
- `sidebarItems`: array of `{ icon, label, value }` for navigation
- `activeTab` / `onTabChange`: controlled tab state
- `headerContent`: logo, user info, logout button (role-specific)
- `children`: the active tab's content

**Desktop (lg+):**
- Fixed left sidebar (~72px wide) with icon buttons stacked vertically
- Each item: icon inside a rounded pill, tooltip on hover showing the label
- Active item: `bg-primary text-primary-foreground rounded-xl` with subtle shadow
- Inactive: `text-muted-foreground hover:bg-muted`
- Main content fills remaining space with padding

**Mobile (below lg):**
- Sidebar hidden entirely
- Bottom fixed navigation bar with horizontally scrollable icon+label buttons
- Active item highlighted with primary color
- Sheet/drawer alternative for dashboards with many tabs (Admin has 19 tabs): a hamburger menu button that opens a full-height sheet listing all nav items with icons and labels

### 2. Modify `src/pages/admin/AdminDashboard.tsx`

- Remove the horizontal `TabsList` grid
- Wrap content with `DashboardShell`, passing 19 sidebar items
- Keep the existing header (logo + admin info + logout)
- Overview tab: upgrade stat cards with gradient backgrounds (`bg-gradient-to-br from-primary/90 to-primary text-white`)
- All `TabsContent` blocks remain identical — no functional changes

**Mobile handling for Admin (19 tabs):**
- Bottom bar shows 5 most-used tabs (Overview, Events, Users, Orders, Forms)
- A "More" icon opens a sheet with all remaining tabs
- Active tab always visible in bottom bar or sheet

### 3. Modify `src/pages/client/ClientDashboard.tsx`

- Replace horizontal tabs with `DashboardShell`
- 3 sidebar items: My Events, New Request, Profile
- On mobile: simple 3-item bottom tab bar (fits perfectly)

### 4. Modify `src/pages/vendor/VendorDashboard.tsx`

- Replace horizontal tabs with `DashboardShell`
- 4 sidebar items: Jobs, Inventory, Marketplace, Profile
- On mobile: 4-item bottom tab bar

---

## Technical Details

### DashboardShell Layout Structure

```text
Desktop:
+----------+-----------------------------+
| [Header spanning full width]           |
+----------+-----------------------------+
| Sidebar  |  Main Content Area          |
| (72px)   |  (flex-1, padded)           |
|          |                             |
| [icon]   |                             |
| [icon]   |                             |
| [icon]   |                             |
| ...      |                             |
+----------+-----------------------------+

Mobile:
+-----------------------------+
| [Header]                    |
+-----------------------------+
| Main Content Area           |
| (full width, padded)        |
|                             |
+-----------------------------+
| [Bottom Tab Bar - fixed]    |
+-----------------------------+
```

### Sidebar Item Styling
- Container: `w-[72px] bg-background border-r border-border flex flex-col items-center py-4 gap-1`
- Active button: `w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20`
- Inactive button: `w-12 h-12 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground`
- Tooltip wrapper on each icon for label display on hover

### Bottom Tab Bar (Mobile)
- Container: `fixed bottom-0 inset-x-0 bg-background border-t border-border z-40 px-2 py-2`
- Items: flex row with equal spacing
- Active: primary color icon + small label text
- Inactive: muted foreground
- For Admin "More" button: opens a Sheet with full navigation list

### Overview Stat Cards (Admin)
- Hero stat card: `bg-gradient-to-br from-primary to-blue-600 text-white border-none rounded-2xl`
- Secondary cards: `bg-card rounded-2xl border shadow-sm` with colored icon badges
- Add `pb-20 lg:pb-0` to main content on mobile to account for bottom bar

### Files Summary

| File | Action |
|------|--------|
| `src/components/admin/DashboardShell.tsx` | Create — shared sidebar + bottom bar layout |
| `src/pages/admin/AdminDashboard.tsx` | Modify — use DashboardShell, restyle overview cards |
| `src/pages/client/ClientDashboard.tsx` | Modify — use DashboardShell |
| `src/pages/vendor/VendorDashboard.tsx` | Modify — use DashboardShell |

### What Does NOT Change
- All data hooks, CRUD interfaces, form handlers, and business logic
- Tab content components (EventCenter, UserManagement, JobBoard, etc.)
- Authentication flow and routing
- The existing header content (logo, user info, logout) — just repositioned within DashboardShell
