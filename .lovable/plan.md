

## Two Changes: Logo Text + Smart Search

### 1. Navbar Logo: "Evnting" → "Evnting.com"

Update the EcommerceHeader logo text to include ".com" with the secondary color accent, matching the rest of the site's branding.

**File: `src/components/ecommerce/EcommerceHeader.tsx`** (line 94-96)
- Change `Evnting` → `Evnting<span className="text-secondary">.com</span>`

### 2. Smart Search with Autocomplete Dropdown

Build an Amazon/Swiggy-style search experience with:
- **Live suggestions dropdown** that appears as you type, showing matching product titles
- **Category-grouped results** (e.g., "in Lighting", "in Sound Equipment")
- **Click a suggestion** to navigate to that product or filter results
- **Keyboard navigation** (arrow keys + Enter to select)
- **Recent searches** shown when the input is focused but empty (stored in localStorage)
- **Close on click outside** or Escape key

**File: `src/components/ecommerce/EcommerceHeader.tsx`**
- Add state for `showSuggestions`, `suggestions`, `recentSearches`, `selectedIndex`
- Filter rental items by title as user types (passed via new `allItems` prop)
- Render a dropdown below the search input with grouped suggestions
- Handle keyboard events (ArrowUp/Down/Enter/Escape)
- On suggestion click: set search term and close dropdown
- On Enter with no suggestion selected: submit search as-is

**File: `src/pages/Ecommerce.tsx`**
- Pass `rentals` array to `EcommerceHeader` as `allItems` prop so suggestions can be computed

### Files Changed
| File | Change |
|---|---|
| `src/components/ecommerce/EcommerceHeader.tsx` | Add ".com" to logo; add autocomplete dropdown with suggestions, keyboard nav, recent searches |
| `src/pages/Ecommerce.tsx` | Pass `rentals` to header as `allItems` |

