# `src/components/` map

Read this first when you're asked to add or edit a component. Every folder name is **lowercase** (case-sensitive — Vercel deploys from Linux, so `Foo/` and `foo/` are different paths). If a new component fits two folders, prefer the more specific one; if it's truly cross-role, put it in `shared/`.

## Folders

| Folder | What lives here | Add new files here when… |
|---|---|---|
| **`admin/`** | Widgets and panels rendered inside `/admin` (the AdminDashboard). 49 files. | You're building an admin-only tool: user management, vendor approval, CMS, WhatsApp console, pricing rules, etc. |
| **`vendor/`** | Widgets and panels rendered inside `/vendor/dashboard` (VendorDashboard). 37 files. | You're building a vendor-only tool: inventory editor, order tracker, delivery manager, payouts, employee manager, etc. |
| **`client/`** | Widgets and panels rendered inside `/client/dashboard` (ClientDashboard). 13+ files. | You're building a client-only tool: profile, saved addresses, past orders, loyalty, help guide, messages. |
| **`ecommerce/`** | Marketplace surfaces — `/ecommerce`, product detail, vendor storefront, search, location bar, product cards. 35 files. | You're touching anything customers see while browsing the marketplace. |
| **`cart/`** | Anything that touches the `useCart` store, the Cart page, or the cart modal. | A new component for the checkout flow, address picker, milestone summary, etc. |
| **`layout/`** | Site chrome — Navbar, Footer, page wrappers, mobile tab bar, announcement bar, notification center. | A new global header/footer element or page wrapper. |
| **`shared/`** | Components reused across two or more roles (client + vendor, marketplace + dashboard, etc.). Includes: GoogleMapPicker, ProtectedRoute, ErrorBoundary, ScrollToTop, AppLoadingScreen, TestimonialsSection. | A new component used by more than one role. **Rule:** if in doubt, start here, then move to a role folder once it's clearly single-use. |
| **`ui/`** | shadcn primitives (Button, Card, Dialog, Sheet, etc.). 85 files. | Only when adding a new shadcn component via the shadcn CLI. Don't hand-write here. |
| **`forms/`** | Public-facing forms (InquiryForm, contact forms). | A new public form. |
| **`audio/`** | Audio playback widgets. | A new audio player or control. |
| **`portfolio/`** | Portfolio gallery + items + lightbox. | A new portfolio surface. |
| **`essentials/`** | Essentials shop widgets (separate from rentals). | An Essentials-shop-only component. |
| **`dashboard/`** | Shared dashboard chrome used by all three role dashboards (sidebar shell, command-K, etc.). | A new piece of chrome used by more than one dashboard. |
| **`mobile/`** | Mobile-only widgets (bottom sheets, native pickers, etc.). | A widget that only renders on mobile / Capacitor. |
| **`templates/`** | Print and email HTML templates (quote PDFs, etc.). | A new template that gets rendered server-side or for print. |

## Where pages live

Top-level pages live at `src/pages/<Page>.tsx` — one file per route. They're the entry points imported by `src/App.tsx`. Page-specific helper components should live in the matching role folder above (`admin/`, `vendor/`, `client/`, `ecommerce/`, `cart/`).

## Naming rules

1. **Folders are lowercase.** No more `Cart/` vs `cart/` accidents.
2. **Component files are PascalCase** (`SavedAddressPicker.tsx`).
3. **Imports use the `@/` alias**, never relative paths from `src/`. Example:
   ```ts
   import Layout from "@/components/layout/Layout";
   ```
4. **One component per file** unless a sub-component is only used in the parent.
5. **No top-level files in `src/components/`** — every file lives in a folder.

## Stores, hooks, integrations

- `src/hooks/` — React hooks (`useAuth`, `useCart`, `useRentalOrders`, etc.).
- `src/stores/` — Zustand stores.
- `src/contexts/` — React contexts.
- `src/integrations/supabase/` — generated Supabase client + types.
- `src/services/` — pure helpers (e.g. `shareService`).
- `src/utils/` — pure utility functions.
- `src/lib/` — third-party adapters (utils + validators).

## Adding a new component — quick checklist

1. Decide the folder using the table above.
2. Create the file as PascalCase `.tsx`.
3. Import via `@/components/<folder>/<File>`.
4. Run `npm run build` locally to make sure imports resolve on case-sensitive filesystems.
5. Commit with a clear message; CI/Vercel will rebuild and deploy.
