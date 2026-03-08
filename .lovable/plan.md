

# AI Chatbot for Client and Vendor Dashboards

## Overview
Add a dedicated "AI Assistant" tab to both the Client and Vendor dashboards, featuring a modern chat interface inspired by the reference image. The chatbot will use Lovable AI (Gemini) via a new edge function, with role-specific system prompts so it can help clients plan events and vendors manage listings.

## What the Chatbot Does

**For Clients:**
- Help plan events (suggest themes, budgets, timelines)
- Guide through creating event requests
- Answer questions about event status and vendor assignments
- Provide rental equipment recommendations

**For Vendors:**
- Help with listing creation and pricing strategies
- Guide through inventory management
- Answer questions about assigned jobs
- Provide marketplace tips and best practices

## UI Design (Reference Image Style)

The chat tab will feature:
- A welcome home screen with greeting ("Hi [Name], Ready to Plan Something Amazing?") and quick-action suggestion chips (e.g., "Plan an Event", "Check My Events" for clients; "Add Listing", "View Jobs" for vendors)
- Clean chat bubble layout: user messages on right (dark), assistant messages on left (light glass card)
- Markdown rendering for AI responses
- Typing indicator animation while streaming
- Message input bar at the bottom with send button
- Smooth token-by-token streaming display

## Technical Plan

### 1. New Edge Function: `supabase/functions/dashboard-chat/index.ts`
- Accepts `{ messages, role: "client" | "vendor" }` in the request body
- Uses `LOVABLE_API_KEY` to call Lovable AI Gateway with `google/gemini-3-flash-preview`
- Role-specific system prompts:
  - **Client prompt**: Evnting event planning assistant -- helps with event types, budgets, vendor info, rental catalog
  - **Vendor prompt**: Evnting vendor business assistant -- helps with inventory, pricing, job management, marketplace
- Returns SSE stream for token-by-token rendering
- Handles 429/402 errors gracefully

### 2. Update `supabase/config.toml`
- Add `[functions.dashboard-chat]` with `verify_jwt = true` (authenticated users only)

### 3. New Component: `src/components/dashboard/DashboardChatbot.tsx`
- Props: `role: "client" | "vendor"` and `userName: string`
- **Home screen**: Greeting + quick-action chips in a card grid layout
- **Chat view**: Scrollable message list with streaming support
- Uses `react-markdown` (already available or will add) for rendering
- SSE streaming via fetch to the edge function
- Conversation stored in local React state (no persistence needed)
- Framer Motion for message entrance animations

### 4. Update `src/pages/client/ClientDashboard.tsx`
- Add `Bot` (or `MessageSquare`) icon sidebar item for "AI Assistant" tab
- Render `<DashboardChatbot role="client" userName={...} />` when active

### 5. Update `src/pages/vendor/VendorDashboard.tsx`
- Add same "AI Assistant" sidebar item
- Render `<DashboardChatbot role="vendor" userName={...} />` when active

## File Changes Summary

| File | Action |
|------|--------|
| `supabase/functions/dashboard-chat/index.ts` | Create |
| `supabase/config.toml` | Edit (add function entry) |
| `src/components/dashboard/DashboardChatbot.tsx` | Create |
| `src/pages/client/ClientDashboard.tsx` | Edit (add AI tab) |
| `src/pages/vendor/VendorDashboard.tsx` | Edit (add AI tab) |

## Dependencies
- No new npm packages needed (react-markdown can be rendered with basic HTML for now, or we use a simple prose renderer)
- Uses existing `framer-motion` for animations
- Uses existing Supabase client for auth token in fetch calls

