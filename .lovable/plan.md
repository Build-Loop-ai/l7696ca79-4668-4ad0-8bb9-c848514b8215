

# Plan: Fix Onboarding Loop & Add Currency Toggle

Based on the feedback, I've identified two issues that need to be addressed.

---

## Issue 1: Onboarding Loop (Already Fixed by User)

**What was happening:** After completing onboarding, users were being redirected back to the beginning instead of going to the dashboard.

**Root Cause Analysis:** 
Looking at the code flow:
1. `complete-onboarding` edge function sets `onboarding_completed: true` in the profile (line 121)
2. `ProtectedRoute` checks `profile.onboarding_completed` and should redirect completed users to `/dashboard`
3. The onboarding page sets `isCompleted = true` and shows a success screen with "Go to Dashboard" button

**Potential Issue:** There's a race condition - the frontend's `isCompleted` state is local, but after clicking "Go to Dashboard", the `ProtectedRoute` might still have stale data. If the profile query cache wasn't invalidated, it could still see `onboarding_completed: false` and redirect back to onboarding.

**Fix:** Add cache invalidation after completing onboarding to ensure `ProtectedRoute` sees the updated value.

### Changes
**File:** `src/pages/Onboarding.tsx`

In the `handleComplete` function, after the successful response, add a query client invalidation to refresh the profile data:

```typescript
// After toast success
queryClient.invalidateQueries({ queryKey: ['profile'] });
```

This ensures the ProtectedRoute will see the updated `onboarding_completed` status.

---

## Issue 2: Phone Pricing Shows Only Euros

**What the user wants:** An easy way to toggle between regions/currencies (EUR vs USD) without changing code.

**Current state:**
- `phone-countries.ts` has hardcoded prices in EUR (field name: `monthlyPriceEur`)
- `PhoneNumberDialog.tsx` displays `€{c.monthlyPriceEur}/mo` (line 193)
- The `site_config` table already has `currency` and `currency_symbol` columns
- AdminSiteConfig currently doesn't expose currency settings to admins

### Solution

Add a "Regional Settings" section to the Admin Site Config with:
1. Currency dropdown (EUR, USD, GBP, etc.)
2. Currency symbol input

Then update the phone number display to use the site config currency instead of hardcoded EUR.

### Changes

**1. Update `AdminSiteConfig.tsx`** - Add a new "Regional Settings" card with currency dropdown

Add after the "Branding" card:
```tsx
{/* Regional Settings */}
<Card>
  <CardHeader>
    <div className="flex items-center gap-2">
      <Globe className="h-5 w-5 text-primary" />
      <CardTitle>Regional Settings</CardTitle>
    </div>
    <CardDescription>Currency and locale preferences</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select 
          value={formData.currency || "EUR"} 
          onValueChange={(value) => updateField("currency", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EUR">Euro (EUR)</SelectItem>
            <SelectItem value="USD">US Dollar (USD)</SelectItem>
            <SelectItem value="GBP">British Pound (GBP)</SelectItem>
            <SelectItem value="CHF">Swiss Franc (CHF)</SelectItem>
            <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
            <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency_symbol">Currency Symbol</Label>
        <Input
          id="currency_symbol"
          value={formData.currency_symbol || "€"}
          onChange={(e) => updateField("currency_symbol", e.target.value)}
          placeholder="€"
          maxLength={3}
        />
      </div>
    </div>
  </CardContent>
</Card>
```

**2. Update `PhoneNumberDialog.tsx`** - Use site config currency

```typescript
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";

// Inside component:
const { config } = useSiteConfigTransformed();

// Change display from:
<span className="text-muted-foreground ml-auto">€{c.monthlyPriceEur}/mo</span>

// To:
<span className="text-muted-foreground ml-auto">
  {config.currencySymbol}{c.monthlyPriceEur}/mo
</span>
```

**3. Update `phone-countries.ts`** - Rename field to be currency-agnostic

Rename `monthlyPriceEur` to `monthlyPrice` to be more generic. The value stays the same (prices are set by admin in their chosen currency).

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/pages/Onboarding.tsx` | Add query invalidation after onboarding completion |
| `src/components/admin/AdminSiteConfig.tsx` | Add "Regional Settings" card with currency dropdown |
| `src/components/dashboard/PhoneNumberDialog.tsx` | Use site config currency symbol |
| `src/lib/phone-countries.ts` | Rename `monthlyPriceEur` to `monthlyPrice` |

---

## Technical Details

### Exchange Rate Note
The phone prices themselves are hardcoded values in `phone-countries.ts`. When changing currency, admins need to understand:
- The displayed symbol changes, but the underlying prices need to be updated separately
- For a full currency conversion solution, we'd need a price conversion API or separate price fields per currency

For now, this solution gives admins control over the display currency and symbol. If they're operating in USD, they can:
1. Set currency to USD and symbol to $
2. The phone number prices will show as $5/mo, $7/mo, etc. (same numeric values)
3. If they need different numeric values, that requires code changes to `phone-countries.ts`

