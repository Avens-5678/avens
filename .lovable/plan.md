

## Add WhatsApp Dashboard + Employee Assignment to Admin Panel

### What This Adds

1. **Full WATI-like WhatsApp Dashboard** in Admin — a dedicated "WhatsApp" menu group with sub-tabs for Live Chat, Campaigns, Contacts, and Templates
2. **Employee assignment** for live chat conversations — admin can manually assign a chat to an employee, or auto-assign based on round-robin logic

---

### Database Changes (1 migration)

**New tables (in addition to previously planned tables):**

```sql
-- Track which employee is assigned to a conversation
ALTER TABLE whatsapp_sessions ADD COLUMN assigned_employee_id uuid;
ALTER TABLE whatsapp_sessions ADD COLUMN assigned_at timestamptz;
ALTER TABLE whatsapp_sessions ADD COLUMN assignment_type text DEFAULT 'manual'; -- 'manual' or 'auto'

-- Contacts table for WhatsApp CRM
CREATE TABLE whatsapp_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text UNIQUE NOT NULL,
  user_id uuid,
  name text,
  tags text[] DEFAULT '{}',
  opted_in boolean DEFAULT false,
  opted_in_at timestamptz,
  last_message_at timestamptz,
  total_conversations integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-assignment config
CREATE TABLE whatsapp_assignment_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_auto_assign boolean DEFAULT false,
  eligible_employee_ids uuid[] DEFAULT '{}',
  last_assigned_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**RLS:** Admin full access, employees can view/update only conversations assigned to them.

---

### Admin Dashboard Changes

**New menu group: "WhatsApp"** (added to `menuGroups` in `AdminDashboard.tsx`):

| Sub-tab | Component | Description |
|---|---|---|
| Live Chat | `WhatsAppLiveChat.tsx` | Real-time inbox — list of active conversations on left, chat thread on right. Assign button per conversation to pick an employee. Unread badge. |
| Campaigns | `WhatsAppCampaigns.tsx` | Create/schedule template campaigns, view delivery stats |
| Contacts | `WhatsAppContacts.tsx` | All WhatsApp contacts with opt-in status, tags, last activity |
| Templates | `WhatsAppTemplates.tsx` | View synced Meta templates (read-only list pulled from Meta API) |
| Settings | `WhatsAppSettings.tsx` | Toggle auto-assign on/off, pick eligible employees for round-robin |

**Mobile primary items** updated to include WhatsApp tab.

---

### Employee Assignment Flow

1. **Manual**: Admin opens a live chat conversation → clicks "Assign" → picks an employee from a dropdown (filtered to employees with `operations` permission) → employee sees it in their dashboard
2. **Auto-assign**: When `is_auto_assign = true` in `whatsapp_assignment_rules`, incoming human-handoff conversations are automatically round-robin assigned to the next eligible employee
3. **Employee view**: Employee Dashboard gets a new "Live Chat" tab showing only conversations assigned to them, with the same chat UI

---

### Live Chat UI Design (WATI-inspired)

```text
┌──────────────────────────────────────────────────┐
│  WhatsApp Live Chat                    [Settings]│
├────────────┬─────────────────────────────────────┤
│ Search...  │  Customer Name        [Assign ▼]    │
│            │  +91 98765 43210      Status: Open   │
│ ┌────────┐ │─────────────────────────────────────│
│ │ Chat 1 │ │  Customer: Hi, I need help          │
│ │ Chat 2 │ │  Bot: How can I help? [Menu shown]  │
│ │ Chat 3 │ │  Customer: Track my order           │
│ │  ...   │ │  Bot: Enter order ID                │
│ │        │ │  Customer: agent                    │
│ │        │ │  → Handed off to human              │
│ │        │ │                                     │
│ └────────┘ │  [Type a reply...        ] [Send]   │
└────────────┴─────────────────────────────────────┘
```

- Left panel: conversation list with unread counts, assignee avatar, status filters (Open/Assigned/Resolved)
- Right panel: full message thread with bot messages, customer messages, and admin replies
- Assign dropdown shows employees with `operations` permission
- "Resolve" button closes the conversation and resets session to idle

---

### Employee Dashboard Integration

**File: `src/pages/employee/EmployeeDashboard.tsx`**
- Add a "Live Chat" tab (visible only if employee has `operations` permission)
- Shows only conversations where `assigned_employee_id = auth.uid()`
- Same chat thread UI, but no assign/reassign capability

---

### Files Changed

| File | Change |
|---|---|
| Migration | New tables: `whatsapp_contacts`, `whatsapp_assignment_rules`. New columns on `whatsapp_sessions` for assignment. RLS policies. |
| `src/components/admin/WhatsAppLiveChat.tsx` | New — split-panel inbox with real-time Supabase subscription |
| `src/components/admin/WhatsAppCampaigns.tsx` | New — campaign creator + delivery stats |
| `src/components/admin/WhatsAppContacts.tsx` | New — contact list with opt-in, tags, search |
| `src/components/admin/WhatsAppTemplates.tsx` | New — read-only template viewer |
| `src/components/admin/WhatsAppSettings.tsx` | New — auto-assign toggle + employee selector |
| `src/pages/admin/AdminDashboard.tsx` | Add "WhatsApp" menu group with 5 sub-tabs |
| `src/pages/employee/EmployeeDashboard.tsx` | Add "Live Chat" tab for assigned conversations |
| `supabase/functions/whatsapp-webhook/index.ts` | Add auto-assign logic on human handoff |
| All previously planned files from the WhatsApp chatbot plan | Same as before |

---

### Prerequisites (Same as Before)

1. Meta WhatsApp Business App + phone number registration
2. Secrets: `META_WHATSAPP_TOKEN`, `META_PHONE_NUMBER_ID`, `META_WEBHOOK_VERIFY_TOKEN`
3. Message templates submitted and approved in Meta Business Manager
4. Webhook URL registered after deployment

