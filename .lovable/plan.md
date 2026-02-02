

# Remaining Template Quality Improvements

Based on my comprehensive audit, here are the remaining issues to fix:

---

## 1. Security: RLS Policies Still Need Attention

**Problem**: The linter still shows 4 RLS policies with `WITH CHECK (true)` that need review:

| Table | Policy | Issue |
|-------|--------|-------|
| `assessment_leads` | Anyone can submit assessment | `WITH CHECK (true)` - Intentional, public form |
| `call_logs` | Service can insert call logs | `WITH CHECK (true)` - Intentional, edge function use |
| `contact_requests` | Anyone can submit contact request | `WITH CHECK (true)` - Intentional, public form |
| `email_logs` | Service can insert email logs | `WITH CHECK (true)` - Intentional, edge function use |

**Assessment**: These are actually **correctly designed** for their purpose:
- Public forms (`contact_requests`, `assessment_leads`) need unrestricted INSERT
- Service-level inserts (`call_logs`, `email_logs`) are only called from edge functions using service_role

**No changes needed** - these are false positives from the linter.

---

## 2. Leaked Password Protection Still Disabled

**Problem**: The linter shows this is still disabled despite previous configuration attempt.

**Solution**: Need to verify and re-apply the auth configuration for leaked password protection.

---

## 3. Minor UI Polish: Email Placeholders

**Problem**: Login page still has clinic-specific placeholder.

| File | Line | Current | Should Be |
|------|------|---------|-----------|
| `src/pages/Login.tsx` | 181 | `you@clinic.com` | `you@business.com` |

---

## 4. Edge Functions Missing Secret Validation

Several edge functions don't have helpful error messages when secrets are missing:

| Function | Missing Validation |
|----------|--------------------|
| `send-email` | RESEND_API_KEY check |
| `stripe-checkout` | STRIPE_SECRET_KEY check |
| `stripe-portal` | STRIPE_SECRET_KEY check |
| `release-phone-number` | Graceful handling exists |
| `search-phone-numbers` | Has validation ✓ |
| `generate-demo-audio` | ELEVENLABS_API_KEY check |

**Solution**: Add the `validateSecrets` helper to these functions with user-friendly error messages.

---

## 5. Documentation Improvements

The README is good but could use:
- `STRIPE_WEBHOOK_SECRET` clearly marked as required (currently implied)
- Link to webhook setup in Stripe dashboard

---

## Implementation Summary

| Task | Files | Priority |
|------|-------|----------|
| Re-enable leaked password protection | Auth config | High |
| Update Login.tsx placeholder | 1 file | Low |
| Add secret validation to remaining edge functions | 4 files | Medium |

---

## Changes to Make

### 1. Update Login Page Placeholder
- `src/pages/Login.tsx` line 181: Change `you@clinic.com` → `you@business.com`

### 2. Add Secret Validation to Edge Functions

**send-email/index.ts:**
```typescript
if (!RESEND_API_KEY) {
  return new Response(JSON.stringify({ 
    error: "Email service not configured. Add RESEND_API_KEY in Settings → Backend → Secrets." 
  }), { status: 503, headers: corsHeaders });
}
```

**stripe-checkout/index.ts:**
```typescript
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
if (!STRIPE_SECRET_KEY) {
  throw new Error("Payments not configured. Add STRIPE_SECRET_KEY in Settings → Backend → Secrets.");
}
```

**stripe-portal/index.ts:**
```typescript
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
if (!STRIPE_SECRET_KEY) {
  throw new Error("Payments not configured. Add STRIPE_SECRET_KEY in Settings → Backend → Secrets.");
}
```

**generate-demo-audio/index.ts:**
```typescript
const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
if (!ELEVENLABS_API_KEY) {
  return new Response(JSON.stringify({ 
    error: "Voice synthesis not configured. Add ELEVENLABS_API_KEY in Settings → Backend → Secrets." 
  }), { status: 503, headers: corsHeaders });
}
```

### 3. Re-enable Leaked Password Protection
- Apply auth configuration to enable hibp (Have I Been Pwned) protection

---

## What's Already Working Well

After the previous improvements, the template now has:

- Dynamic services based on business type in onboarding
- Working "Add custom service" functionality
- Password reset flow (`/forgot-password`, `/reset-password`)
- Terms and Privacy pages
- Health check endpoint for admin integration status
- Admin Integration Status panel
- Secret validation in core edge functions (Vapi, Twilio, Google)
- Simplified onboarding without confusing phone step
- Improved README with better admin SQL

The remaining items are minor polish to ensure a completely error-free experience for template users.

