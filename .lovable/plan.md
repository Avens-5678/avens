

## Plan: Link Quote to Order & Auto-Sync on Acceptance

### What the user wants
1. Display the linked **order number** (order ID) on the quote — both in the admin QuoteMaker and on the public QuoteAcceptance page.
2. When a client **accepts/signs** the quote, automatically sync the quote line items back to the linked order (updating `equipment_details` for rental orders or `service_details` for service orders).

### Current state
- Quotes already store `source_type` (`rental_order` / `service_order` / `manual`) and `source_order_id` (UUID of the linked order).
- The QuoteAcceptance page does NOT display the order reference or sync anything on acceptance — it only updates `signature_url`, `signed_at`, and `status`.

### Changes

#### 1. `src/pages/QuoteAcceptance.tsx`
- **Display order number**: Show `source_order_id` (truncated) and `source_type` in the quote info header when present.
- **Sync on sign**: After updating the quote status to "accepted", check if `source_order_id` exists. If so:
  - For `rental_order`: Update `rental_orders.equipment_details` with the quote's line items as a JSON object (`{ cart_items: [...] }`), and update the order `status` to `"confirmed"`.
  - For `service_order`: Update `service_orders.service_details` with a text summary of line items, and update `status` to `"confirmed"`.
- This uses the existing public UPDATE RLS policy on quotes, but the order update needs to happen server-side. We'll create a small **edge function** `sync-quote-to-order` that accepts the quote ID and performs the update with the service role key.

#### 2. New Edge Function: `supabase/functions/sync-quote-to-order/index.ts`
- Accepts `{ quote_id: string }` in the body.
- Fetches the quote + line items using the service role.
- If `source_order_id` is set, updates the corresponding order table with line items and sets status to `"confirmed"`.
- Returns success/failure.

#### 3. `src/components/admin/QuoteMaker.tsx`
- Show the linked order ID (first 8 chars) as a badge next to the source selector when an order is selected.
- Include `source_order_id` in the quote data passed to `downloadQuoteAsPDF` so it appears on the PDF.

#### 4. `src/components/admin/QuotePrintTemplate.ts`
- Add "Order Ref: #XXXXXXXX" line in the quote header when `sourceOrderId` is provided.

### Files to create/edit

| File | Action |
|------|--------|
| `supabase/functions/sync-quote-to-order/index.ts` | New — syncs quote line items to linked order on acceptance |
| `src/pages/QuoteAcceptance.tsx` | Show order number + call sync edge function on sign |
| `src/components/admin/QuoteMaker.tsx` | Pass order ID to PDF template |
| `src/components/admin/QuotePrintTemplate.ts` | Show order reference in PDF |

