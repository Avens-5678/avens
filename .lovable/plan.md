

## Quote Maker Feature Assessment & Enhancement Plan

### Current State

| Feature | Status | Details |
|---------|--------|---------|
| **Dynamic Templates** | Missing | Only 1 hardcoded orange/Evnting template in `QuotePrintTemplate.ts` |
| **Tax & Discount Engine** | Partial | GST % and flat/percent discount exist. No VAT, no tiered discounts |
| **Pick-list Integration** | Missing | All line items are typed manually. No connection to `rentals` or `services` tables |
| **Digital Signature** | Missing | No signature capability at all |
| **Version Control** | Missing | Each save creates a new quote record; no parent/version tracking |

---

### Implementation Plan

#### 1. Dynamic Professional Templates
Add a template selector (Modern, Classic, Creative) to QuoteMaker. Each template is a different HTML layout in `QuotePrintTemplate.ts` with distinct color schemes and typography.

- **QuoteMaker.tsx**: Add template dropdown state (`modern` | `classic` | `creative`)
- **QuotePrintTemplate.ts**: Refactor into 3 template generators sharing the same data interface but with different styles/layouts
- Pass selected template to `downloadQuoteAsPDF()`

#### 2. Enhanced Tax & Discount Engine
Extend the existing calculations to support:
- GST / VAT toggle (tax type selector)
- Tiered discounts: multiple discount rows (e.g., 10% on first 50k, 5% on rest)

Changes:
- **QuoteMaker.tsx**: Replace single discount with array of discount tiers. Add tax type selector (GST/VAT/None).
- **Calculations memo**: Update to process tiered discounts sequentially
- **QuotePrintTemplate.ts**: Render multiple discount rows
- **Database**: Add `tax_type` column to `quotes` table via migration

#### 3. Inventory/Service Pick-list
Add a searchable product picker that pulls from the `rentals` and `services` tables to auto-fill line items.

Changes:
- **QuoteMaker.tsx**: Add a "Pick from Catalog" button next to "Add Item" that opens a searchable dialog
- New component: **QuotePicklistDialog.tsx** — fetches from `rentals` table, displays searchable list with prices, clicking adds to line items with pre-filled description, unit, and price
- Also allow picking from `services` table

#### 4. Digital Signature Integration
Create a public quote acceptance page where clients can view and sign quotes.

Changes:
- **Database migration**: Add `signature_url`, `signed_at`, `acceptance_token` columns to `quotes` table
- **New page**: `src/pages/QuoteAcceptance.tsx` — public route `/quote/:token` that displays quote details and a "Accept & Sign" button
- **Signature capture**: Use a canvas-based signature pad (simple HTML canvas, no external lib needed)
- **Storage**: Save signature image to `general-uploads` bucket
- **QuoteMaker.tsx**: Add "Copy Acceptance Link" button that generates the token URL
- **Route**: Add to `App.tsx`

#### 5. Version Control
Track quote revisions so admin can see v1, v2, v3 history.

Changes:
- **Database migration**: Add `version` (int, default 1) and `parent_quote_id` (uuid, nullable, self-ref) columns to `quotes` table
- **QuoteMaker.tsx**: Add "Revise Quote" action on existing quotes that creates a new version linked to the parent
- **useQuotes.ts**: Add `useQuoteVersions(parentId)` hook to fetch all versions
- **QuoteMaker.tsx**: Show version history panel when editing a quote with previous versions

---

### Database Migration (single migration)

```sql
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS tax_type text DEFAULT 'gst',
  ADD COLUMN IF NOT EXISTS template text DEFAULT 'modern',
  ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_quote_id uuid REFERENCES quotes(id),
  ADD COLUMN IF NOT EXISTS acceptance_token text DEFAULT encode(gen_random_bytes(16), 'hex'),
  ADD COLUMN IF NOT EXISTS signature_url text,
  ADD COLUMN IF NOT EXISTS signed_at timestamptz;

-- Public can view quotes by acceptance token (for signature page)
CREATE POLICY "Public can view quote by token"
  ON quotes FOR SELECT
  USING (acceptance_token IS NOT NULL AND acceptance_token != '');

-- Public can update signature fields by token
CREATE POLICY "Public can sign quote by token"
  ON quotes FOR UPDATE
  USING (acceptance_token IS NOT NULL)
  WITH CHECK (acceptance_token IS NOT NULL);
```

### Files to Create/Edit

| File | Action |
|------|--------|
| `src/components/admin/QuoteMaker.tsx` | Major rewrite — add template selector, pick-list button, tiered discounts, version history, acceptance link |
| `src/components/admin/QuotePrintTemplate.ts` | Refactor into 3 template layouts |
| `src/components/admin/QuotePicklistDialog.tsx` | New — searchable catalog picker dialog |
| `src/hooks/useQuotes.ts` | Add `useQuoteVersions`, update Quote interface with new fields |
| `src/pages/QuoteAcceptance.tsx` | New — public quote view + signature page |
| `src/App.tsx` | Add `/quote/:token` route |
| Database migration | Add columns listed above |

### Scope Note
This is a substantial enhancement (~6 files, 1 migration). The digital signature uses a simple HTML canvas approach (no external library) to keep dependencies minimal.

