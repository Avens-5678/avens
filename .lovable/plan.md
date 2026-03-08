

## Problem Analysis

The admin dashboard has two separate views under Operations:
1. **Event Center** → reads from `event_requests` table (via `useEventRequests` hook)
2. **Event Requests** → reads from `service_orders` table (via `LiveServiceOrders` component using `useServiceOrders` hook)

When a client submits an event request, it inserts into `event_requests`. The sync to `service_orders` happens **client-side** in `useEventRequests.ts` (`syncEventRequestToServiceOrders`), which is unreliable — it can fail silently due to network issues, RLS restrictions, or race conditions.

## Plan

### 1. Create a database trigger for reliable sync
Create a Postgres trigger on `event_requests` that automatically inserts a corresponding row into `service_orders` whenever a new event request is created. This replaces the unreliable client-side sync.

```text
event_requests (INSERT)
  └─► trigger: sync_event_request_to_service_orders()
        └─► INSERT INTO service_orders (title, service_type, location, event_date, budget, guest_count, ...)
```

### 2. Sync existing unsynced records
Run a data migration to insert any `event_requests` rows that don't yet have a matching `service_orders` entry (matching by title pattern or notes containing the event request ID).

### 3. Remove client-side sync code
Remove the `syncEventRequestToServiceOrders` function from `useEventRequests.ts` since the database trigger now handles this reliably.

### 4. Files affected
- **New migration**: Database trigger + data backfill
- **Edit**: `src/hooks/useEventRequests.ts` — remove `syncEventRequestToServiceOrders` function and its call in `onSuccess`

