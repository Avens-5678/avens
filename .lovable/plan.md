

## Problem Analysis

Two separate issues identified:

### 1. Event Request WhatsApp not sending
When a client submits an event request, the new DB trigger creates a `service_orders` row — but **nobody calls `wati-service-confirmation`**. Previously the client-side sync code did this, but we removed it. The DB trigger can't call edge functions directly.

**Fix**: Add a `wati-service-confirmation` call in `useCreateEventRequest` onSuccess (in `useEventRequests.ts`). The trigger handles the DB sync; the client-side handles the WhatsApp notification.

### 2. Rental Order WhatsApp — likely working but silently failing
The `useCreateRentalOrder` hook already calls `sendRentalConfirmationWhatsApp` in onSuccess. I tested the edge function — it's deployed and responds. The most likely cause: the `client_phone` field is empty when creating the order, so the function early-returns without sending.

**Fix**: Add a toast warning when WhatsApp can't be sent (no phone number), so the admin knows why it didn't fire.

### 3. `api.whatsapp.com` blocked error
This is from the **WhatsApp bot UI widget** in the preview iframe — the browser blocks `api.whatsapp.com` due to X-Frame-Options. This is **unrelated** to the WATI API notifications. No action needed for this.

## Plan

### File: `src/hooks/useEventRequests.ts`
- Add a `sendEventConfirmationWhatsApp` function that calls `wati-service-confirmation` edge function (similar to how rental orders do it)
- Call it in `useCreateEventRequest` onSuccess, passing `result.id`, client profile info, and `result.event_type`
- Need to fetch client profile (phone/name) since event_requests only stores `client_id`

### File: `src/hooks/useRentalOrders.ts`
- Add a toast notification in `sendRentalConfirmationWhatsApp` when `client_phone` is empty, so admin sees "WhatsApp not sent — no phone number"

### File: `src/hooks/useServiceOrders.ts`
- Same improvement: warn when `client_phone` is missing

