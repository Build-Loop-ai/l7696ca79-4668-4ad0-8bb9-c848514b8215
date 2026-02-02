
# Plan: Template Quality Improvements

Based on the comprehensive audit, here's the prioritized plan to fix all issues and ensure users who remix this template never encounter errors.

---

## Phase 1: Critical Security Fixes

### 1.1 Fix RLS Policies
- Review and fix the 4 permissive RLS policies detected by the linter
- Add proper authentication checks for INSERT/UPDATE/DELETE operations
- Tables likely affected: `contact_requests`, `assessment_leads`, `site_config`, `email_config`

### 1.2 Enable Leaked Password Protection
- Configure auth settings to enable leaked password protection
- This prevents users from using compromised passwords

### 1.3 Add Stripe Webhook Secret Validation
- Update `stripe-webhook` function to require `STRIPE_WEBHOOK_SECRET`
- Add clear error message if not configured
- Document in README that this secret is required

---

## Phase 2: Fix Broken Links & Placeholders

### 2.1 Update Signup Page Placeholder
**File**: `src/pages/Signup.tsx`
- Change line 256 placeholder from "Amsterdam Dental Care" to "Your Business Name"

### 2.2 Handle Forgot Password
**Options**:
- Option A: Create a `/forgot-password` page with password reset flow
- Option B: Remove the "Forgot password?" link from login page

**Recommended**: Option A - Create proper password reset flow

### 2.3 Create Terms & Privacy Pages
**Files to create**:
- `src/pages/Terms.tsx` - Terms of Service page
- `src/pages/Privacy.tsx` - Privacy Policy page
- Update `App.tsx` to add routes

---

## Phase 3: Improve Edge Function Error Handling

### 3.1 Secret Validation Helper
Create a utility that checks for required secrets and returns user-friendly errors:
```
Missing: VAPI_API_KEY
→ "Voice AI is not configured. Please add the VAPI_API_KEY in Settings → Backend → Secrets."
```

### 3.2 Update Edge Functions
Add clear error messages to:
- `create-vapi-assistant` - Check VAPI_API_KEY
- `buy-phone-number` - Check all Twilio secrets
- `stripe-checkout` - Check STRIPE_SECRET_KEY
- `google-calendar-auth` - Check Google OAuth secrets

### 3.3 Phone Number Country Bundles
- Add informational message in `PhoneNumberDialog` explaining that some countries (EU) require regulatory bundles
- Link to Twilio documentation

---

## Phase 4: Create Setup Validation System

### 4.1 Health Check Edge Function
Create `supabase/functions/health-check/index.ts`:
- Validates all required secrets are present
- Tests connectivity to Vapi, Twilio, Stripe (if keys present)
- Returns status for each integration

### 4.2 Admin Integration Status Panel
- Add new tab in Admin panel showing integration health
- Green/Red indicators for each service
- Quick links to configure missing integrations

---

## Phase 5: Documentation & Onboarding

### 5.1 Add "Get Started" Page
Create a new page at `/get-started` with:
- Step-by-step remix instructions
- All 12 required secrets with where to find them
- Webhook configuration for Vapi and Stripe
- Google Calendar OAuth setup
- First admin user SQL
- Testing checklist

### 5.2 Update README
- Add webhook URL formats with project ID placeholder
- Add troubleshooting section for common errors
- Add screenshots of admin setup process

---

## Implementation Summary

| Phase | Files Changed | Effort |
|-------|---------------|--------|
| Phase 1 | Database migrations, auth config | Small |
| Phase 2 | Signup.tsx, Login.tsx, Terms.tsx, Privacy.tsx, App.tsx | Medium |
| Phase 3 | 5+ edge functions | Medium |
| Phase 4 | New edge function, Admin panel component | Medium |
| Phase 5 | GetStarted.tsx, README.md | Medium |

---

## Technical Details

### RLS Policy Fixes (Phase 1.1)
```sql
-- Example: Fix contact_requests to only allow inserts (public form)
-- but restrict updates/deletes to admins
DROP POLICY IF EXISTS "contact_requests_insert" ON contact_requests;
CREATE POLICY "contact_requests_insert" ON contact_requests
  FOR INSERT TO public
  WITH CHECK (true);  -- Anyone can submit contact form

DROP POLICY IF EXISTS "contact_requests_update" ON contact_requests;
CREATE POLICY "contact_requests_update" ON contact_requests
  FOR UPDATE TO authenticated
  USING (is_system_admin(auth.uid()));
```

### Password Reset Flow (Phase 2.2)
Components needed:
1. `ForgotPassword.tsx` - Email input form
2. `ResetPassword.tsx` - New password form (accessed via email link)
3. Use `supabase.auth.resetPasswordForEmail()` API

### Secret Validation Pattern (Phase 3.1)
```typescript
function validateSecrets(required: string[]): { valid: boolean; missing: string[] } {
  const missing = required.filter(name => !Deno.env.get(name));
  return { valid: missing.length === 0, missing };
}

// Usage in edge function:
const { valid, missing } = validateSecrets(['VAPI_API_KEY', 'TWILIO_ACCOUNT_SID']);
if (!valid) {
  throw new Error(`Missing configuration: ${missing.join(', ')}. Add these in Settings → Backend → Secrets.`);
}
```

---

## Success Criteria

After implementing these changes:
1. No security vulnerabilities detected by linter
2. All links work (no 404s)
3. New remix users get clear errors with instructions when secrets are missing
4. Setup documentation is comprehensive and accurate
5. Edge functions fail gracefully with helpful messages
