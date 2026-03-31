

## Full Platform Documentation — PDF Generation

### What I'll Do

Generate a comprehensive **downloadable PDF** documenting every feature, route, database table, dashboard, and integration of the Evnting.com platform.

### Document Structure (20 Sections, ~15 Pages)

1. **Cover Page** — Evnting.com Platform Documentation, Version 1.0, March 2026
2. **Table of Contents**
3. **Platform Overview** — Multi-vertical marketplace + corporate site + 4 role-based dashboards
4. **Technology Stack** — React 18, Vite 5, Tailwind, Supabase, Zustand, Framer Motion (table)
5. **Authentication & RBAC** — 4-tier system (Admin/Employee/Client/Vendor), unified sign-in flow, role storage in user_roles table, security definer functions, Google OAuth, OTP for admins
6. **Public Website** — Homepage (hero carousel, stats, services, rentals, testimonials, trusted clients), plus 15+ public pages (Services, Portfolio, Gallery, About, Blog, FAQ, Team, Dynamic Events, Privacy, Terms, Quote Acceptance)
7. **E-Commerce Marketplace** — 3 verticals (Insta-Rent, Venues, Crew Hub), discovery rows, service-specific filters, location detection, promo banners, product cards, comparison feature
8. **Product Detail Page** — Image gallery with zoom, variant chips, specifications, reviews, venue-specific sections (amenities matrix, house rules, site visit form), MMT-style date selector with auto-transition, slot selection, add to cart flow
9. **Cart & Checkout** — Zustand cart state, enquiry form with auto-fill, venue address detection, order creation with auto vendor routing
10. **Instant Booking Engine** — 30% markup, manpower fee calculation, transport fee (edge function + tiers), 48-hour buffer, seasonal pricing
11. **Venue Marketplace** — Dual pricing (dry rental vs per-plate), amenities matrix, house rules, site visit funnel (Rs.499 deposit), comparison, verified badge
12. **Crew Hub** — Commodity (broadcast model) vs Creative (portfolio-driven), categories, experience levels
13. **Admin Dashboard** — All 8 menu groups with sub-tabs: Overview, Operations (Event Center, Rental Orders, Service Orders, Quote Maker), Users, Ecommerce (Rentals, Vendor Inventory, Promos, Trust Strip, Logistics Config), Content, Website CMS, WhatsApp, Settings
14. **Vendor Dashboard** — 8 tabs: AI Assistant, My Orders (pending/completed with status updates), Inventory (with per-item inline calendar), Site Visits, Offline Booking, Quotation Maker, Earnings, Profile
15. **Client Dashboard** — 5 tabs: AI Assistant, My Requests, New Request, Past Orders, Profile
16. **Employee Dashboard** — Permission-gated subset of admin tools (ecommerce, content, operations, whatsapp categories)
17. **Quote Maker System** — Templates, catalog picking, tax engine, version history, email/WhatsApp dispatch, digital acceptance portal, auto-sync
18. **WhatsApp Integration** — Live Chat, Campaigns, Contacts, Templates, Settings + 6 automated notification functions
19. **Edge Functions** — 21 serverless functions documented (calculate-transport, check-user-type, dashboard-chat, notify-admin-order, sync-quote-to-order, vendor-action, WATI functions, Zoho CRM)
20. **Database Architecture** — 35+ tables with purpose and key fields
21. **Security Model** — RLS, security definer functions, admin isolation, role anti-escalation, vendor/client scoping, audit logging, account lockout
22. **Complete Route Map** — All 30 routes with type and description

### Implementation

Single script using **reportlab** (Python) to generate a professionally styled PDF with:
- Brand colors (navy primary, purple accent)
- Styled tables with alternating row backgrounds
- Bullet-point feature lists
- Section headers and horizontal rules
- Cover page with company branding

Output: `/mnt/documents/Evnting_Platform_Documentation.pdf`

### Effort

One implementation step — the script is already written and ready to execute once approved.

