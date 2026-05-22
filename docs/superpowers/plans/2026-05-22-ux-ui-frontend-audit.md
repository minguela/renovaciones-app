# UX/UI and Frontend Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a complete, evidence-based UX/UI and frontend audit of RenovacionesApp with a realistic design system proposal and phased visual roadmap.

**Architecture:** Treat the audit as three evidence streams that converge into one report: deployed-product inspection through a real audit user, source inspection of the Expo Router frontend, and synthesis of findings into prioritized product/design/frontend guidance. Keep observation notes separate from recommendations until the final synthesis so priority calls remain traceable.

**Tech Stack:** Expo Router, React Native, React Native Web, Supabase Auth, Codex Browser plugin, CodeGraph, local Markdown docs.

---

## File Structure

- Read: `README.md` for declared product scope and setup.
- Read: `package.json` for runtime scripts and stack.
- Read: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx`, `app/renewal/[id].tsx` for route and screen structure.
- Read: `components/AuthScreen.tsx`, `components/RenewalCard.tsx`, `components/NotificationSettings.tsx`, `components/EmptyState.tsx` for feature UI.
- Read: `components/ui/Button.tsx`, `components/ui/Input.tsx`, `components/ui/Card.tsx`, `constants/theme.ts`, `hooks/use-theme-color.ts`, `hooks/use-color-scheme.web.ts` for visual primitives and theming.
- Read: `hooks/useRenewals.ts`, `lib/supabase.ts`, `types/renewal.ts` for UX-affecting data states.
- Create only if a persisted audit artifact is needed: `docs/superpowers/reports/2026-05-22-ux-ui-frontend-audit.md`.
- Avoid source edits during the audit unless a blocker prevents evidence gathering and the user approves the change.

### Task 1: Inspect Deployed Product Through Real User Flow

**Files:**
- Read: `components/AuthScreen.tsx`
- Read: `app/(tabs)/index.tsx`
- Read: `app/renewal/[id].tsx`
- Read: `components/NotificationSettings.tsx`

- [ ] **Step 1: Define the tested flow**

Record this target flow in working notes before browser inspection:

```text
The flow under test is: deployed web app loads -> audit user registers or signs in -> empty and populated renewal experiences render -> renewal form and settings states are exercised -> responsive and theme behavior are inspected.
```

- [ ] **Step 2: Open the deployed app and capture first-screen evidence**

Use the Browser skill sequence with the in-app browser:

```js
if (!globalThis.agent) {
  const { setupBrowserRuntime } = await import("/Users/minguela/.codex/plugins/cache/openai-bundled/browser/0.1.0-alpha2/scripts/browser-client.mjs");
  await setupBrowserRuntime({ globals: globalThis });
}
if (!globalThis.browser) {
  globalThis.browser = await agent.browsers.get("iab");
}
await browser.nameSession("🔎 Renovaciones audit");
if (typeof tab === "undefined") {
  globalThis.tab = await browser.tabs.new();
}
await tab.goto("https://renovaciones.dminguela.es");
nodeRepl.write([
  `URL: ${await tab.url()}`,
  `Title: ${await tab.title()}`,
  await tab.playwright.domSnapshot(),
].join("\n\n"));
```

Expected evidence: page identity, meaningful auth surface or app shell, no framework error overlay in snapshot.

- [ ] **Step 3: Register the audit account through the UI**

Use the auth screen controls rather than direct API calls. Use a dedicated audit address and strong generated password stored only in working memory for this session.

Expected evidence: the UI exposes whether registration succeeds immediately, requires email confirmation, or returns an error that blocks sign-in.

- [ ] **Step 4: Inspect mobile viewport first**

Set the viewport to a phone-sized layout, capture screenshot evidence, and record:

```text
tap targets
navigation reachability
action priority
safe-area and bottom spacing
form ergonomics
text wrapping
scroll friction
empty and populated list readability
```

Expected evidence: screenshot and notes for auth, list state, create/edit form, and settings surfaces reached safely.

- [ ] **Step 5: Populate representative data through product flows**

Create enough renewals through the UI to inspect:

```text
short and long names
different frequencies
provider and note presence
notification-enabled field state when exposed
cost summary behavior
```

Expected evidence: populated list, card scanning behavior, summary metrics, and edit-entry affordance.

- [ ] **Step 6: Inspect tablet, desktop, and theme behavior**

Use one tablet-sized viewport and one desktop viewport. Record whether the app gains structure or simply stretches mobile UI. Toggle system/theme behavior only through supported browser or app conditions.

Expected evidence: screenshot and notes for responsive hierarchy, content width, headers, settings placement, modal/form presentation, hover/focus visibility where observable.

- [ ] **Step 7: Record visible feedback and edge states**

Exercise validation and safe feedback paths:

```text
missing required form data
auth error or validation text when safe
empty state before data creation
loading indicators observed during fetch or submit
destructive action affordance without destructive confirmation unless safe
```

Expected evidence: notes distinguishing observed feedback from unreachable states.

### Task 2: Inventory Frontend Architecture and Components

**Files:**
- Read: `app/_layout.tsx`
- Read: `app/(tabs)/_layout.tsx`
- Read: `app/(tabs)/index.tsx`
- Read: `app/(tabs)/explore.tsx`
- Read: `app/renewal/[id].tsx`
- Read: `components/**/*.tsx`
- Read: `constants/theme.ts`
- Read: `hooks/**/*.ts`
- Read: `lib/supabase.ts`
- Read: `types/renewal.ts`

- [ ] **Step 1: Map route and layout structure**

Use CodeGraph and targeted file reads:

```text
app root layout
tab layout
home/list screen
settings/explore screen
renewal form route
modal route
```

Expected evidence: a route inventory that explains navigation hierarchy and modal behavior.

- [ ] **Step 2: Map UI primitives and variants**

Read the button, input, card, text, and themed view primitives. Record:

```text
props and variants
hard-coded colors
spacing and radius decisions
focus/hover/pressed/disabled/loading support
dark-mode behavior
reuse and bypasses
```

Expected evidence: a component inventory with visual-system gaps.

- [ ] **Step 3: Map feature components and UX state ownership**

Read auth, renewal card, empty state, notification settings, renewal hook, and Supabase helpers. Record which layer owns:

```text
auth gate
loading
error
empty state
refresh
create/edit/delete feedback
settings loading and save feedback
copy strings
```

Expected evidence: links between UX behavior and source structure.

- [ ] **Step 4: Audit style consistency**

Compare screen and component style sheets for:

```text
duplicate color definitions
duplicate card/input/button patterns
one-off dimensions
inconsistent title scale
inconsistent spacing scale
platform-web gaps
dark-mode gaps
```

Expected evidence: a style debt inventory specific enough to drive design tokens and refactor sequencing.

- [ ] **Step 5: Audit copy and accessibility from source**

Review embedded strings and control structure for:

```text
labels vs placeholders
button verbs
empty-state guidance
error specificity
screen titles
icon-only action naming
touch target sizing
focus visibility and keyboard flow risk
contrast risk from hard-coded colors
```

Expected evidence: copy rewrite candidates and accessibility findings tied to screens or components.

### Task 3: Synthesize UX/UI Findings and Design Proposal

**Files:**
- Read: `docs/superpowers/specs/2026-05-22-ux-ui-frontend-audit-design.md`
- Create if persisting report: `docs/superpowers/reports/2026-05-22-ux-ui-frontend-audit.md`

- [ ] **Step 1: Separate findings by evidence type**

Build the report using these labels when useful:

```text
Observed in deployed product
Code-derived
Inference where state was not directly exercised
```

Expected evidence: the report does not present inaccessible or inferred states as observed facts.

- [ ] **Step 2: Prioritize findings**

Sort into:

```text
Critical
High
Medium
Low
Quick wins
```

Use task completion, mobile usability, accessibility, perceived quality, and maintainability to justify priority.

- [ ] **Step 3: Propose the design system**

Specify:

```text
semantic colors and theme roles
typography hierarchy
spacing scale
radius and elevation policy
buttons and inputs
cards and list rows
layout containers and responsive breakpoints
interaction states
dark mode
```

Expected evidence: design guidance is concrete enough to turn into tokens and components.

- [ ] **Step 4: Produce screen and component recommendations**

Cover:

```text
auth
home/list/dashboard
renewal form modal
settings/notifications
empty/loading/error states
navigation/header/tabs
Button/Input/Card/RenewalCard/EmptyState/NotificationSettings
```

Expected evidence: no major user-facing surface is left as a generic recommendation.

- [ ] **Step 5: Add copy proposals and code patterns**

Include realistic examples for this stack:

```tsx
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
```

```tsx
<Button size="lg" variant="primary" fullWidth title="Guardar renovacion" />
```

```tsx
<Field label="Fecha de renovacion" hint="Te avisaremos antes si activas recordatorios">
  <Input value={renewalDate} onChangeText={setRenewalDate} />
</Field>
```

Expected evidence: recommendations are actionable without forcing a Tailwind migration or a web-only architecture.

- [ ] **Step 6: Produce the phased roadmap**

Use phases:

```text
Phase 0: evidence and bug-risk cleanup
Phase 1: visual foundations
Phase 2: primitives and interaction states
Phase 3: screen refactors mobile first
Phase 4: responsive and accessibility QA
Phase 5: product polish and richer states
```

Expected evidence: roadmap order reduces visual churn and keeps UX stable.

### Task 4: Verify Audit Completeness

**Files:**
- Read: `docs/superpowers/specs/2026-05-22-ux-ui-frontend-audit-design.md`
- Read if created: `docs/superpowers/reports/2026-05-22-ux-ui-frontend-audit.md`

- [ ] **Step 1: Check spec coverage**

Verify the final answer or report explicitly covers:

```text
A. Informe UX/UI
B. Lista priorizada
C. Quick wins
D. Propuesta visual global
E. Plan de refactor visual
F. Mejoras concretas
G. Propuestas de codigo
roadmap por fases
copy UX
mobile-first review
component review
design system proposal
```

Expected evidence: no requested deliverable is omitted.

- [ ] **Step 2: Check evidence quality**

Confirm the report states:

```text
which flows were observed
which viewports were inspected
which source files drove technical findings
which important states remain unobserved
```

Expected evidence: audit limitations are explicit.

- [ ] **Step 3: Check for empty placeholders**

Run:

```bash
rg -n "TBD|TODO|placeholder|fill in|similar to|later" docs/superpowers/reports/2026-05-22-ux-ui-frontend-audit.md
```

Expected: no unresolved audit placeholders if the report file was created.

- [ ] **Step 4: Prepare final delivery**

Final delivery should lead with the most serious findings, then present the detailed report sections and remaining risk. If screenshots are collected for rendered validation, include the relevant images together at the end.
