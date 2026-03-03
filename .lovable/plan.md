

# Make nout@alleman.nl a System Admin

Found the user in the database:
- **Name:** Nout Alleman
- **Email:** nout@alleman.nl  
- **User ID:** `cd2bcc1c-f6cb-4e0e-b8ae-5522da213bed`

## What needs to happen

Insert a single row into the `system_roles` table:

```sql
INSERT INTO system_roles (user_id, role)
VALUES ('cd2bcc1c-f6cb-4e0e-b8ae-5522da213bed', 'super_admin')
ON CONFLICT DO NOTHING;
```

This grants access to the `/admin` panel with full super admin privileges.

