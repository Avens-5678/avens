

## Database Duplication Analysis

### Tables Reviewed (27 total)

After examining every table, view, and their usage across the codebase, here is the assessment:

### No True Duplicate Tables Found

The database is already well-structured with minimal redundancy. Here's why the apparent overlaps are intentional:

| Apparent Overlap | Type | Why It Exists |
|---|---|---|
| `admin_users` / `admin_users_safe` | Table + **View** | `admin_users_safe` is a database VIEW that strips sensitive fields (password_hash, reset_token). This is a security pattern, not duplication. |
| `portfolio` / `portfolio_view` | Table + **View** | `portfolio_view` is a VIEW joining portfolio with events for convenience. Not used in code currently. |
| `event_requests` / `service_orders` | Two tables with sync trigger | Intentional dual-table architecture. `event_requests` is client-facing (tied to `client_id`), `service_orders` is admin-facing with different fields (`guest_count`, `service_details`, `event_end_date`). A DB trigger syncs new event requests into service orders. Merging would break RBAC and RLS policies. |
| `profiles.role` / `user_roles.role` | Column overlap | `profiles.role` is a legacy column. The actual RBAC system uses `user_roles` table with security definer functions (`has_role`, `get_user_role`). |

### One Minor Cleanup Possible

**`profiles.role` column**: This is redundant since the app uses the `user_roles` table for all role checks. However, removing it risks breaking edge cases where legacy code reads `profiles.role`. The risk-to-benefit ratio is low.

### Recommendation

**No merges are needed.** The database does not have duplicate tables storing the same data. The apparent overlaps are either:
- Security views (safe patterns)
- Intentional architectural separation (different RLS, different schemas)
- Legacy columns with negligible overhead

Merging any of these would either break security boundaries, destroy RLS policies, or remove intentional architectural separation with no meaningful benefit.

