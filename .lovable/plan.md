

## Swiggy-Style Service Tabs & Category Icons for /ecommerce

### What We're Building

**1. Service Selection Strip** (below search bar, above banners)
A horizontal row of 3 large clickable cards — similar to Swiggy's "Food Delivery | Instamart | Dineout" — but for your business:

```text
┌─────────────────────────────────────────────────────────┐
│  [Search Bar - Amazon style]                            │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ ⚡        │  │ 🏛️        │  │ 👥        │              │
│  │ Insta-Rent│  │ Venues   │  │ Crew Hub │              │
│  │ Equipment │  │ Spaces & │  │ Skilled  │              │
│  │ on demand │  │ Locations│  │ Manpower │              │
│  └──────────┘  └──────────┘  └──────────┘              │
├─────────────────────────────────────────────────────────┤
│  [Promo Banners]                                        │
└─────────────────────────────────────────────────────────┘
```

- **Insta-Rent** — Quick equipment & decor rentals (filters to rental categories)
- **Venues** — Spaces, halls, outdoor locations (filters to venue-related items)
- **Crew Hub** — Manpower, technicians, staff (filters or navigates to services)

Each card has a Lucide icon, title, and subtitle. Clicking filters the product grid or navigates accordingly.

**2. Category Icons on Quick Browse Strip**
Replace the plain text category pills with icon + text, like Swiggy's circular "What's on your mind?" section. Each category gets a relevant Lucide icon:

| Category | Icon |
|---|---|
| Lighting | `Lightbulb` |
| Sound/Audio | `Speaker` |
| Stages | `Theater` (or `LayoutDashboard`) |
| Furniture | `Armchair` |
| Decor | `Flower2` |
| Tents/Structures | `Tent` |
| Catering | `UtensilsCrossed` |
| Electronics/AV | `Monitor` |
| Default/All | `Sparkles` |

Categories will be displayed as circular icon cards with the label below — scrollable horizontally.

### Technical Plan

**File: `src/pages/Ecommerce.tsx`**
- Add a new `ServiceSelector` section between `EcommerceHeader` and `PromoBannerCarousel`
- Three large cards in a responsive flex row with icons, titles, and subtitles
- Clicking a service card sets a filter or navigates (Insta-Rent = show all, Venues = filter venues category, Crew Hub = navigate to /services)
- Replace the category quick-browse strip: change from plain pills to circular icon cards with category name below
- Create an icon mapping object that maps category names to Lucide icons
- Style as horizontal scrollable row with centered circular icon containers

**File: `src/components/ecommerce/EcommerceHeader.tsx`**
- No changes needed — search bar stays as-is

### Naming Suggestions
- **Insta-Rent** — "Rent equipment instantly"
- **Venues** — "Find the perfect space"  
- **Crew Hub** — "Hire skilled professionals"

