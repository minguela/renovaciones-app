# Fix Catalog Autocomplete & Data Completeness

> **For Hermes:** Execute task-by-task. Each task is 2-5 min of focused work.

**Goal:** Fix the catalog autocomplete bug in production web builds and ensure every catalog entry carries complete default data (type, frequency, name, provider, cost, currency=EUR). Insurance defaults to annual, subscriptions to monthly.

**Architecture:** Refactor `CatalogPicker` to remove the race-condition-prone `handleClose`+`setTimeout` pattern. Enrich `types/catalog.ts` with explicit `defaultCurrency: 'EUR'` on every option. Strengthen E2E tests to assert all populated fields.

**Tech Stack:** Expo Router (web), React Native Web, Playwright E2E, TypeScript

---

## Root Cause

`CatalogPicker.handleSelectOption` calls `handleClose()` (which invokes `onClose` -> parent sets `visible=false`) **before** `setTimeout(() => onSelect(payload), 50)`. In production React bundles this creates a race condition where the component unmounts before `onSelect` fires, so the form never updates.

**Fix:** Let the parent control closing. `CatalogPicker` should call `onSelect(payload)` immediately and do nothing else. The parent (`[id].tsx`) already calls `setCatalogVisible(false)` inside `handleCatalogSelect`.

---

### Task 1: Fix CatalogPicker race condition

**Objective:** Remove `handleClose` and `setTimeout` from `handleSelectOption` so `onSelect` fires synchronously.

**Files:**
- Modify: `components/CatalogPicker.tsx:74-93`

**Step 1: Edit handleSelectOption**

Replace the current callback with:

```tsx
const handleSelectOption = useCallback(
    (option: CatalogOption, category: CatalogCategory) => {
      const typeInfo = RENEWAL_TYPES.find((t) => t.value === option.defaultType);
      const payload = {
        name: option.name,
        type: option.defaultType,
        frequency: option.defaultFrequency,
        cost: option.defaultCost.toString(),
        provider: option.suggestedProvider || category.name,
        icon: typeInfo?.icon || category.icon,
        color: option.defaultColor || category.color,
        currency: option.defaultCurrency || 'EUR',
      };
      onSelect(payload);
    },
    [onSelect]
  );
```

**Step 2: Verify no other internal close call exists**

Ensure `handleSelectOption` no longer references `handleClose`.

---

### Task 2: Enrich catalog data

**Objective:** Add `defaultCurrency: 'EUR'` to every `CatalogOption`. Ensure insurance category defaults are predominantly annual.

**Files:**
- Modify: `types/catalog.ts`

**Step 1: Streaming & Software**

Append `defaultCurrency: 'EUR'` to every option in `streaming` and `software` categories. Leave frequencies as `monthly` (subscriptions).

**Step 2: Insurance**

Append `defaultCurrency: 'EUR'` to every option in `insurance` category.
Change these to `annual` (standard Spanish insurance cadence):
- `Seguro salud` -> `annual` (kept monthly if you prefer, but standard is annual lump sum or monthly — leave as-is if user already configured monthly)
- `Seguro dental` -> `annual`
- `Seguro vida` -> `annual`
- `Seguro mascotas` -> `annual`
- `Seguro móvil` -> `annual`
- `Seguro bicicleta` -> `annual`
- `Seguro autónomo` -> `annual`

Wait — user said "seguros son anuales normalmente, suscripciones son mensuales". Apply annual to ALL insurance entries except where monthly is truly standard (e.g. health insurance sometimes is monthly). To keep it simple and match user's rule: ALL insurance -> `annual`.

**Step 3: Housing, Finance, Health, Transport, Technology, Education, Pets, Others**

Append `defaultCurrency: 'EUR'` to every option in these categories.

---

### Task 3: Update E2E tests

**Objective:** Make tests assert every field populated by the catalog: name, provider, cost, type, frequency, currency.

**Files:**
- Modify: `e2e/catalog.spec.ts`
- Modify: `e2e/crud.spec.ts`

**Step 1: catalog.spec.ts**

Replace the existing test with a stricter version that:
- Opens `/renewal/new`
- Opens catalog -> Streaming -> Netflix
- Asserts name = Netflix
- Asserts provider = Netflix
- Asserts cost = 12.99
- Asserts type = subscription (check selected pill)
- Asserts frequency = monthly (check selected pill)
- Asserts currency = EUR (check EUR pill selected)

**Step 2: crud.spec.ts**

Keep existing tests but ensure the "from catalog" test also asserts the 3 core fields.

---

### Task 4: Run full E2E suite

**Objective:** Verify nothing broke.

**Command:**
```bash
npx playwright test --reporter=list
```

**Expected:** 5+ tests pass (navigation:2, catalog:1, crud:2, debug:1 if kept).

---

### Task 5: Build and verify static export

**Objective:** Ensure `/renewal/new` is generated and bundle has no runtime errors.

**Command:**
```bash
npx expo export --platform web
```

**Expected:**
- Exit 0
- `/renewal/new` listed in static routes
- No red JavaScript errors in build output

---

### Task 6: Commit

**Command:**
```bash
git add -A
git commit -m "fix(catalog): eliminate race condition in web picker, enrich defaults with EUR currency, insurance=annual, subscription=monthly"
```

---

## Verification Checklist

- [ ] `CatalogPicker` calls `onSelect` synchronously
- [ ] Every catalog option has `defaultCurrency: 'EUR'`
- [ ] Every insurance option has `defaultFrequency: 'annual'`
- [ ] Every streaming/software option has `defaultFrequency: 'monthly'`
- [ ] Playwright tests assert name, provider, cost, type, frequency, currency
- [ ] All E2E tests pass
- [ ] Static export succeeds with `/renewal/new`
