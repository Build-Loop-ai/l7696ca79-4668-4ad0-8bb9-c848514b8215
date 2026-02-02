
# Plan: Fix Template Issues for Customer Deployment

Based on the feedback, I've identified four distinct issues that need to be fixed. Here's the plan to address each one:

---

## Issue 1: Services Feature Doesn't Work in Onboarding

**Problem**: In Step 3 of onboarding, there's an "Add custom service" input and button that do nothing - they're not connected to any functionality.

**Solution**: Make the custom service input functional by adding state and an onClick handler.

**File to modify**: `src/pages/Onboarding.tsx`

**Changes**:
- Add state for custom service input: `const [customService, setCustomService] = useState("")`
- Connect the Input to this state
- Add onClick handler to the "Add" button that adds the custom service to the services array

---

## Issue 2: Hard-coded Dental Services in Onboarding

**Problem**: The onboarding shows dental-specific services (Checkup, Cleaning, Filling, Root Canal, etc.) regardless of what business type the user selects.

**Solution**: Make services dynamic based on business type selection. Create service presets for each business type and update the UI when the business type changes.

**File to modify**: `src/pages/Onboarding.tsx`

**Changes**:
- Replace `DENTAL_SERVICES` with a `SERVICES_BY_TYPE` object containing presets for each business type:
  - `dental_clinic`: Checkup, Cleaning, Filling, Root Canal, Whitening, etc.
  - `medical_practice`: Consultation, Follow-up, Physical Exam, Vaccination, etc.
  - `salon`: Haircut, Coloring, Styling, Manicure, Pedicure, etc.
  - `restaurant`: Table Reservation, Private Event, Catering, etc.
  - `other`: Generic services like Consultation, Appointment, Follow-up
- Update default services state to be empty or based on initial type
- Add a `useEffect` that updates suggested services when `businessData.type` changes
- Change placeholder text from "Amsterdam Dental Care" to "Your Business Name"

---

## Issue 3: Phone Numbers Only Show European Countries

**Problem**: In the onboarding Step 5 dropdown, only European countries (Netherlands, Germany, Belgium, UK) are shown, but the `PhoneNumberDialog` component properly uses the full country list from `phone-countries.ts` which includes US and Canada.

**Solution**: Update the onboarding to use the same country list as the PhoneNumberDialog.

**File to modify**: `src/pages/Onboarding.tsx`

**Changes**:
- Import `getAvailableCountries` from `@/lib/phone-countries`
- Replace the hardcoded SelectItems with a dynamic list from the countries array
- Update the default `phoneSetup.areaCode` to use country code instead of prefix
- Show country flag and name similar to PhoneNumberDialog

---

## Issue 4: Admin Script Duplicate Key Error

**Problem**: When users run the SQL script to make themselves admin, they get a "duplicate key" error if they're already an admin. This is confusing.

**Technical Detail**: This is actually expected behavior - it means the user is already an admin! The SQL uses `INSERT` which fails if the row exists.

**Solution**: Update documentation to use `INSERT ... ON CONFLICT DO NOTHING` pattern, and add clearer messaging.

**Documentation Change**: The SQL script in documentation should be updated to:
```sql
INSERT INTO system_roles (user_id, role)
SELECT id, 'super_admin' FROM auth.users WHERE email = 'your-email@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

This will silently succeed if the user is already an admin, rather than throwing an error.

---

## Issue 5: "Forward My Existing Number" Edge Function Error

**Problem**: Users report getting an Edge Function error when selecting "Forward my existing number" during onboarding.

**Root Cause**: Looking at the code, the onboarding flow doesn't actually call any edge function for the "forward" option - it simply stores the selection. The `handleComplete` function doesn't even include `phoneSetup` data in its payload.

**What's Actually Happening**: The onboarding completes successfully regardless of phone option selected, because phone setup is meant to be completed on the Dashboard after onboarding (via the Setup Checklist).

**Two Options**:
1. **Remove the "Forward my existing number" option from onboarding** - Since phone setup happens post-onboarding anyway, having this option is misleading
2. **Or make it clear this is just preference selection** - Change the copy to indicate "We'll help you set this up after onboarding"

**Recommended**: Option 1 - Remove the confusing phone step from onboarding entirely. Users complete AI configuration during onboarding, then get their phone number on the Dashboard via the Setup Checklist which is where the real provisioning happens.

**File to modify**: `src/pages/Onboarding.tsx`

**Changes**:
- Remove Step 5 (Phone Setup) from onboarding
- Update `STEPS` array to have 4 steps instead of 5
- Remove the phone setup section from the component
- The Setup Checklist on the Dashboard already handles phone number provisioning properly

---

## Summary of Changes

| File | Changes |
|------|---------|
| `src/pages/Onboarding.tsx` | Fix custom service button, make services dynamic by business type, remove phone step |
| Documentation | Update admin SQL script to use ON CONFLICT DO NOTHING |

---

## Technical Notes

- The `ServicesEditor` component in settings works correctly - it properly saves/loads services
- The `PhoneNumberDialog` component works correctly with all countries
- The `update-forwarding-status` edge function works correctly - it's not being called from onboarding (correctly)
- No database changes needed
- No new edge functions needed
