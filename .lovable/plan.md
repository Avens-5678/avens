
# Role-Based Access Control (RBAC) Implementation Plan

## Overview
This plan implements a comprehensive three-tier RBAC system for Avens Expositions with Super Admin, Client, and Vendor roles. The system will enable clients to request events, admins to assign vendors, and vendors to manage their inventory and job assignments.

---

## Phase 1: Database Schema Design

### 1.1 Create User Roles Table (Security Best Practice)
Following Supabase security guidelines, roles will be stored in a separate `user_roles` table rather than on the profiles table to prevent privilege escalation attacks.

```text
+------------------+       +-------------------+
|   auth.users     |       |   user_roles      |
+------------------+       +-------------------+
| id (uuid)        |<----->| user_id (uuid)    |
| email            |       | role (enum)       |
+------------------+       | created_at        |
                           +-------------------+
                           
Role Enum: 'admin' | 'client' | 'vendor'
```

### 1.2 Create Event Requests Table
New table for client event requests with vendor assignment workflow.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| client_id | uuid | FK to auth.users |
| assigned_vendor_id | uuid | FK to auth.users (nullable) |
| status | enum | pending, approved, in-progress, completed |
| event_type | text | Type of event requested |
| event_date | date | Requested event date |
| location | text | Event location |
| budget | text | Budget range |
| guest_count | integer | Expected guests |
| requirements | text | Detailed requirements |
| created_at | timestamp | Request timestamp |
| updated_at | timestamp | Last update |

### 1.3 Create Vendor Inventory Table
Table for vendors to list their rental equipment.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| vendor_id | uuid | FK to auth.users (owner) |
| name | text | Item name |
| description | text | Item description |
| quantity | integer | Available quantity |
| price_per_day | numeric | Daily rental price |
| image_url | text | Item image |
| is_available | boolean | Availability status |
| created_at | timestamp | Created timestamp |
| updated_at | timestamp | Updated timestamp |

### 1.4 Extend Profiles Table
Add contact fields for vendor-client communication.

| New Column | Type | Description |
|------------|------|-------------|
| phone | text | Contact phone |
| company_name | text | Business name |
| bio | text | Short description |

---

## Phase 2: Security Functions & RLS Policies

### 2.1 Security Definer Functions

```text
has_role(user_id, role) -> boolean
  - Checks if user has specific role
  - SECURITY DEFINER to bypass RLS

get_user_role(user_id) -> text
  - Returns user's current role
  - Used for dashboard routing
```

### 2.2 RLS Policy Matrix

| Table | Admin | Client | Vendor |
|-------|-------|--------|--------|
| **event_requests** | Full CRUD | SELECT/INSERT own | SELECT assigned only |
| **vendor_inventory** | Full CRUD | SELECT all | CRUD own items |
| **profiles** | Full CRUD | SELECT own + assigned vendor | SELECT own |
| **rentals (existing)** | Full CRUD | SELECT | SELECT (marketplace) |
| **user_roles** | Full CRUD | SELECT own | SELECT own |

### 2.3 Critical Security Rules

**Event Requests:**
- Clients: `client_id = auth.uid()` for SELECT/INSERT
- Vendors: `assigned_vendor_id = auth.uid()` for SELECT, can UPDATE status only
- Admins: Full access via `has_role(auth.uid(), 'admin')`

**Vendor Inventory:**
- Vendors: `vendor_id = auth.uid()` for CRUD
- Others: SELECT only for marketplace view

---

## Phase 3: Authentication Flow Updates

### 3.1 Unified Login Page Enhancement
Update `/auth` page to handle all role types:

```text
Login Flow:
1. User enters email/password
2. Supabase authenticates user
3. Fetch user role from user_roles table
4. Redirect based on role:
   - admin    -> /admin/dashboard
   - client   -> /client/dashboard  
   - vendor   -> /vendor/dashboard
```

### 3.2 New Pages to Create

| Route | Component | Purpose |
|-------|-----------|---------|
| /client/dashboard | ClientDashboard.tsx | Client event management |
| /vendor/dashboard | VendorDashboard.tsx | Vendor jobs & inventory |
| /auth/register | Registration.tsx | New user signup with role selection |

### 3.3 Protected Route Enhancement
Update `ProtectedRoute.tsx` to support role-based access:

```text
<ProtectedRoute allowedRoles={['admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

---

## Phase 4: Client Dashboard

### 4.1 Components Structure

```text
/client/dashboard
├── EventRequestForm     (Submit new requests)
├── EventTracker         (View all requests)
│   ├── PendingCard      (Status: pending)
│   └── AssignedCard     (Shows vendor info)
└── ProfileSettings      (Update contact info)
```

### 4.2 Event Request Form Fields
- Event Type (dropdown)
- Event Date (date picker)
- Location (text)
- Guest Count (number)
- Budget Range (dropdown)
- Requirements (textarea)

### 4.3 Event Tracker Logic

```text
IF assigned_vendor_id IS NULL:
  Display: "Pending Review" badge
  Show: Event details only
  
ELSE:
  Display: "Vendor Assigned" badge
  Show: Event details + Vendor card
  Vendor Card includes:
    - Vendor Name
    - Phone Number
    - Email Address
    - Company Name
```

---

## Phase 5: Vendor Dashboard

### 5.1 Components Structure

```text
/vendor/dashboard
├── Tabs
│   ├── Job Board        (Assigned events)
│   ├── My Inventory     (CRUD equipment)
│   └── Marketplace      (Avens rentals catalog)
└── ProfileSettings
```

### 5.2 Job Board Features
- List of events where `assigned_vendor_id = current_user`
- Status badges (Approved, In-Progress, Completed)
- "Update Status" button with dropdown
- Event details expansion

### 5.3 Inventory Manager
- Add new equipment items
- Edit existing items
- Toggle availability
- Delete items
- Image upload support

### 5.4 Marketplace View
- Read-only view of existing `rentals` table
- Filter by category
- Search functionality
- Contact Avens for cross-rental inquiries

---

## Phase 6: Admin Dashboard Enhancement

### 6.1 New "Event Center" Tab
Add to existing admin dashboard tabs:

```text
Event Center Features:
├── All Event Requests Table
│   ├── Client Name
│   ├── Event Type
│   ├── Date
│   ├── Status
│   └── Actions
├── Assign Vendor Dropdown
│   └── Lists all active vendors
├── Status Override Controls
└── Communication History
```

### 6.2 Vendor Assignment Flow

```text
1. Admin views incoming request
2. Clicks "Assign Vendor" dropdown
3. Selects vendor from list
4. System updates:
   - Sets assigned_vendor_id
   - Changes status to "approved"
   - Triggers notification (future)
5. Client can now see vendor contact info
```

### 6.3 User Management Section
- View all users by role
- Activate/deactivate accounts
- Change user roles (super admin only)

---

## Phase 7: File Structure

### New Files to Create

```text
src/
├── pages/
│   ├── client/
│   │   └── ClientDashboard.tsx
│   ├── vendor/
│   │   └── VendorDashboard.tsx
│   └── auth/
│       └── Register.tsx
├── components/
│   ├── client/
│   │   ├── EventRequestForm.tsx
│   │   ├── EventTracker.tsx
│   │   └── VendorCard.tsx
│   ├── vendor/
│   │   ├── JobBoard.tsx
│   │   ├── InventoryManager.tsx
│   │   └── Marketplace.tsx
│   └── admin/
│       ├── EventCenter.tsx
│       ├── VendorAssignment.tsx
│       └── UserManagement.tsx
├── hooks/
│   ├── useUserRole.ts
│   ├── useEventRequests.ts
│   └── useVendorInventory.ts
```

### Files to Modify

```text
src/
├── App.tsx                    (Add new routes)
├── pages/Auth.tsx             (Add registration link)
├── pages/admin/AdminDashboard.tsx (Add Event Center tab)
├── components/ProtectedRoute.tsx  (Add role checking)
└── hooks/useAuth.ts           (Add role fetching)
```

---

## Technical Details

### Database Migration SQL Preview

```sql
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'vendor');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create event_requests table
CREATE TABLE public.event_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_vendor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  event_type text NOT NULL,
  event_date date,
  location text,
  budget text,
  guest_count integer,
  requirements text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vendor_inventory table
CREATE TABLE public.vendor_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  quantity integer DEFAULT 1,
  price_per_day numeric,
  image_url text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

---

## Implementation Order

1. **Database Setup** - Create tables, enums, functions, and RLS policies
2. **Auth Updates** - Role fetching hook, protected route enhancement
3. **Registration Page** - Allow new users to sign up with role selection
4. **Client Dashboard** - Event request form and tracker
5. **Vendor Dashboard** - Job board, inventory manager, marketplace
6. **Admin Enhancement** - Event center and vendor assignment
7. **Testing** - End-to-end flow verification

---

## Notes

- The existing `admin_users` table will be kept for backward compatibility
- Super admin (leads@avens.in) will automatically have the 'admin' role
- Email notifications for assignments can be added as a future enhancement
- The system integrates with existing Supabase RLS patterns already in use
