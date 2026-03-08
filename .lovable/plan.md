

## Issues Found

### 1. RLS Error on rental_orders
The INSERT policy (`with_check: true`) allows everyone to insert. However, the code uses `.insert(...).select().single()` — the `.select()` requires a **SELECT** policy. Currently, only admins and assigned vendors have SELECT access. Authenticated clients have no SELECT policy, so the chained `.select()` fails.

**Fix**: Remove `.select().single()` from rental_orders inserts in `Cart.tsx` and `InquiryForm.tsx` (the data isn't critical to retrieve). Alternatively, add a temporary SELECT policy, but removing the select is simpler and safer.

### 2. Phone Country Code
Users enter 10-digit numbers without the +91 prefix. WATI requires the full international number.

**Fix**: Create a `normalizePhoneNumber` utility that auto-prepends `91` for 10-digit Indian numbers. Apply it in:
- Registration form (on submit)
- Cart enquiry form (on submit)
- InquiryForm (on submit)
- WhatsApp helper functions in hooks

## Files to Change

### New: `src/utils/phoneUtils.ts`
- `normalizePhoneNumber(phone: string): string` — strips non-digits, prepends `91` if 10 digits

### Edit: `src/pages/Cart.tsx`
- Remove `.select().single()` from rental_orders insert (line 82)
- Use `normalizePhoneNumber` on `contact_number` before insert and WhatsApp call

### Edit: `src/components/Forms/InquiryForm.tsx`
- Remove `.select().single()` from rental_orders insert (line 131)
- Use `normalizePhoneNumber` on phone before insert and WhatsApp call

### Edit: `src/hooks/useRentalOrders.ts`
- Use `normalizePhoneNumber` in `sendRentalConfirmationWhatsApp`

### Edit: `src/hooks/useEventRequests.ts`
- Use `normalizePhoneNumber` in `sendEventConfirmationWhatsApp`

### Edit: `src/pages/auth/Register.tsx`
- Normalize phone on submit before saving to profile

