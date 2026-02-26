
# Phase 1: Auth & Branding Overhaul for "Evnting"

## Overview
Rebrand from "Avens" to "Evnting" across the entire application, implement intelligent unified sign-in with role auto-detection, add Google Sign-In, and build a Forgot Password flow.

---

## 1. Global Rebrand: "Avens" to "Evnting"

Update all references across 12+ files:

- **Navbar** (`src/components/Layout/Navbar.tsx`): Already shows "Evnting.com" -- confirm consistency
- **Logo component** (`src/components/ui/logo.tsx`): Change "Avens" to "Evnting" and subtitle to "Online platform for event production"
- **Footer** (`src/components/Layout/Footer.tsx`): Replace Avens logo reference, copyright text, and email
- **Register page** (`src/pages/auth/Register.tsx`): "Join Avens Events Platform" to "Join Evnting"
- **Admin Login** (`src/pages/admin/AdminLogin.tsx`): Update placeholder email
- **WhatsApp Bot** (`src/components/ui/whatsapp-bot.tsx`): All "Avens" references in messages
- **Event page template** (`src/components/templates/EventPageTemplate.tsx`): "At Avens Events" text
- **Government Events** (`src/pages/events/GovernmentEvents.tsx`): Any Avens references
- **Team page** (`src/pages/Team.tsx`): Contact email
- **Marketplace** (`src/components/vendor/Marketplace.tsx`): "Avens Marketplace" to "Evnting Marketplace"
- **Integration Tester** (`src/components/admin/IntegrationTester.tsx`): Test email and stream name
- **Custom Knowledge** (project settings): Update brand references

---

## 2. Intelligent Unified Sign-In

Replace the current separate Auth page (`/auth`) with a smart sign-in flow:

**How it works:**
1. User enters email only (single field, no password initially)
2. System checks:
   - Is this email in `admin_users`? --> Redirect to Admin OTP login
   - Is this email registered in `auth.users`? --> Show password field for sign-in
   - Is this email registered with **both** client and vendor roles? --> After password, show a role toggle to pick dashboard
   - Not registered? --> Show "Create Account" option
3. Admin OTP flow remains unchanged (already working)

**Technical approach:**
- Create a new edge function `check-user-type` that accepts an email and returns `{ exists: boolean, isAdmin: boolean, roles: string[] }` using service role key to query `admin_users` and `user_roles` tables securely
- Update `src/pages/Auth.tsx` to implement a multi-step form: Email --> Password (or Admin redirect) --> Role toggle (if dual-role)
- Keep existing registration flow at `/auth/register`

**Database function needed:**
```sql
CREATE OR REPLACE FUNCTION public.check_email_type(check_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  is_admin boolean;
  user_id_found uuid;
  user_roles_list text[];
BEGIN
  -- Check admin
  SELECT EXISTS (SELECT 1 FROM admin_users WHERE email = check_email AND is_active = true) INTO is_admin;
  
  -- Check registered user
  SELECT id INTO user_id_found FROM auth.users WHERE email = check_email LIMIT 1;
  
  -- Get roles if user exists
  IF user_id_found IS NOT NULL THEN
    SELECT array_agg(role::text) INTO user_roles_list FROM user_roles WHERE user_id = user_id_found;
  END IF;
  
  result := jsonb_build_object(
    'is_admin', is_admin,
    'exists', user_id_found IS NOT NULL,
    'roles', COALESCE(to_jsonb(user_roles_list), '[]'::jsonb)
  );
  
  RETURN result;
END;
$$;
```

---

## 3. Google Sign-In

- Add Google OAuth button to the Auth page using `supabase.auth.signInWithOAuth({ provider: 'google' })`
- After Google sign-in, if the user has no role in `user_roles`, redirect to a role selection page (client or vendor)
- Requires the user to configure Google OAuth in their Supabase dashboard (instructions will be provided)

---

## 4. Forgot Password Flow

**Two new components:**

1. **Forgot Password** (added to Auth page as a link):
   - Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`
   
2. **Reset Password page** (`src/pages/ResetPassword.tsx`):
   - New route at `/reset-password`
   - Detects `type=recovery` from URL hash
   - Shows new password + confirm password form
   - Calls `supabase.auth.updateUser({ password })`

---

## Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/check-user-type/index.ts` | Edge function for email role detection |
| `src/pages/ResetPassword.tsx` | Password reset form page |

## Files to Modify
| File | Changes |
|------|---------|
| `src/components/ui/logo.tsx` | Rebrand to Evnting |
| `src/components/Layout/Footer.tsx` | Rebrand text and copyright |
| `src/pages/Auth.tsx` | Intelligent multi-step sign-in with Google OAuth |
| `src/pages/auth/Register.tsx` | Rebrand text |
| `src/pages/admin/AdminLogin.tsx` | Update placeholder |
| `src/components/ui/whatsapp-bot.tsx` | Rebrand all messages |
| `src/components/templates/EventPageTemplate.tsx` | Rebrand |
| `src/components/vendor/Marketplace.tsx` | Rebrand |
| `src/pages/Team.tsx` | Update contact email |
| `src/components/admin/IntegrationTester.tsx` | Rebrand |
| `src/App.tsx` | Add `/reset-password` route |
| `supabase/config.toml` | Add check-user-type function config |

## Database Migration
- Add `check_email_type` security definer function for email role lookup

## User Action Required
- Configure Google OAuth provider in Supabase Dashboard (Authentication -> Providers -> Google) with Google Cloud Console credentials
