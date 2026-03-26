

## Fix Mobile Bottom Nav Floating + Remove Stats Bar from Service Views

### Issue 1: Bottom Nav Floating Above Screen Bottom
The `MobileBottomNav` uses `fixed bottom-0` with inline `style={{ bottom: 0 }}`, but something in the page layout or CSS is pushing it up. The fix is to add `!important` via a more aggressive approach and ensure no parent transforms or other CSS interfere.

**File: `src/components/ecommerce/MobileBottomNav.tsx`**
- Change the nav element to use `inset-x-0` and explicit `bottom-0` with `!bottom-0` (Tailwind important modifier)
- Add `pb-[env(safe-area-inset-bottom)]` as a Tailwind class instead of inline style
- Remove the inline `style` prop entirely to avoid specificity conflicts

### Issue 2: TrustStrip Shows on All Views (Including Insta-Rent, Venues, Crew)
Currently `<TrustStrip />` renders unconditionally on line 601. It should only show in the discovery view (when no service tab is selected).

**File: `src/pages/Ecommerce.tsx`**
- Wrap `<TrustStrip />` with `{isDiscoveryView && <TrustStrip />}` so it only appears on the landing/discovery view, not when Insta-Rent, Venues, or Crew Hub tabs are active.

### Files Changed

| File | Change |
|---|---|
| `src/components/ecommerce/MobileBottomNav.tsx` | Fix positioning to stick firmly to bottom edge |
| `src/pages/Ecommerce.tsx` | Conditionally render TrustStrip only in discovery view |

