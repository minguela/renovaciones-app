# UX/UI and Frontend Audit Design

**Date:** 2026-05-22

## Goal

Produce a complete, evidence-based UX/UI and frontend audit of RenovacionesApp that can guide a premium, mobile-first visual refactor without introducing random cosmetic changes.

The audit must combine three perspectives:

1. Senior product and UX review of the deployed web app through a real registered-user flow.
2. Frontend engineering review of the Expo Router and React Native Web codebase.
3. Practical visual refactor guidance with a realistic design system, code patterns, and phased roadmap.

## Product Context

RenovacionesApp is a multiplatform renewals manager for insurance, subscriptions, licenses, and similar recurring expenses.

The current frontend is an Expo Router application using React Native components for iOS and web. The audit target is the deployed web surface at `https://renovaciones.dminguela.es`, with local source review in this repository.

The product direction is:

- Mobile-first.
- Clear, calm, fast, and suitable for repeated use.
- Visually coherent and more premium than an MVP.
- Accessible enough to support legibility, focus, contrast, and reliable touch interaction.
- Realistic to maintain in the existing stack.

## Audit Strategy

### Real Product Inspection

The audit will use a dedicated registered audit user created through the deployed app when the flow allows it. That user will be used to observe the product as a real authenticated customer would see it.

The inspection should cover:

- Registration and login.
- Empty and populated renewal states.
- Renewal creation and editing.
- Renewal list scanning and summary metrics.
- Settings and notification configuration surfaces.
- Logout and re-entry.
- Visible loading, feedback, validation, confirmation, and error states that can be exercised safely.
- Dark mode and theme behavior when available.

The audit should inspect at least:

- Mobile viewport as the primary design reference.
- Tablet-sized layout.
- Desktop layout.

### Codebase Inspection

The source review will cover the full relevant frontend surface while omitting generated, dependency, cache, build, lockfile, and heavy asset noise named by the user.

The code review should focus on:

- Expo Router layout and screen architecture.
- Navigation hierarchy and route presentation.
- Shared UI primitives such as buttons, inputs, and cards.
- Feature components such as auth, renewal cards, empty states, and notification settings.
- Visual constants, theme handling, and dark mode.
- Data/loading/error coupling that affects UX.
- Repeated style decisions, missing variants, and inconsistent interaction states.
- Copy embedded in screens and components.

### Evidence Standard

The audit should distinguish:

- Observed issues from deployed-screen inspection.
- Code-derived issues where source structure explains behavior or risk.
- Inferences, clearly marked when a state cannot be observed directly.

Claims about priority should be tied to impact on:

- Mobile usability.
- Task completion.
- Perceived quality.
- Accessibility and legibility.
- Maintainability and consistency.

## Coverage

### UX/UI Topics

The report must assess:

- Visual structure, layout, density, alignment, whitespace, and hierarchy.
- Navigation, page architecture, flows, CTA hierarchy, modals, sticky regions, and scroll.
- Typography, color, contrast, iconography, cards, tables or list equivalents, forms, inputs, and buttons.
- Empty states, loaders, feedback, status transitions, and interaction states.
- Hover, focus, active, disabled, touch, safe-area, and responsive behavior.
- Mobile, tablet, desktop, dark mode, and basic accessibility.
- Product feel: clarity, modern SaaS quality, fatigue over long use, and signs of MVP or amateur presentation.

### Component Topics

The report must identify:

- Important components and their responsibilities.
- Duplicated or overlapping visual patterns.
- Missing component variants.
- Inconsistent sizes, spacing, colors, and interaction states.
- UX logic that belongs in a better component or screen structure.
- Reuse opportunities that reduce visual drift without overengineering.

### Copy Topics

The report must review:

- Titles and subtitles.
- Buttons and action labels.
- Labels and placeholders.
- Empty-state copy.
- Error, loader, confirmation, and success messages.
- Auth and settings text.

Copy proposals should improve clarity, humanity, expectation-setting, and action confidence without becoming verbose.

## Design System Proposal

The audit deliverable will include a proposed design system suitable for this application:

- Color roles and state roles.
- Typography scale and semantic usage.
- Spacing scale.
- Border radii and shadow/elevation rules.
- Layout containers, max widths, breakpoints, grids, and responsive page structure.
- Button sizes and variants.
- Input and form field structure.
- Card and list-item rules.
- Focus, hover, pressed, disabled, destructive, success, warning, loading, and empty-state behavior.
- Dark-mode guidance.

The proposal should match the current codebase direction where practical and should avoid needless abstraction.

## Deliverables

The final audit package must include:

1. A detailed UX/UI report.
2. Findings prioritized as Critical, High, Medium, and Low.
3. Quick wins with high visual or usability return.
4. A global visual direction for the product.
5. A phased visual refactor roadmap.
6. Screen-by-screen and component-by-component improvements.
7. Copy improvements.
8. Frontend code proposals appropriate to Expo Router and React Native Web, including style organization and component patterns where useful.

## Implementation Guidance Scope

This audit is diagnostic and prescriptive. It may recommend refactor tasks and provide code sketches, but it should not start broad visual implementation until the audit is complete and priorities are accepted.

Because the user selected a real registered-user flow, the current audit will not add a development authentication bypass by default. A local dev bypass can be proposed later only if protected or hard-to-reproduce states cannot be inspected safely through the real flow.

## Risks and Guardrails

- Avoid treating a web-only screenshot as the whole mobile product.
- Avoid cosmetic recommendations that do not improve clarity, consistency, or task completion.
- Avoid overengineering a large design system before the real component inventory is understood.
- Do not mutate existing user changes unrelated to the audit.
- Use real evidence where possible and mark uncertainty where it remains.

## Success Criteria

The audit is successful when it gives the user:

- A clear picture of what currently feels weak, inconsistent, confusing, or amateur.
- A product-quality target state for the UI.
- A practical order of operations for improving the app.
- Enough code and component guidance to start refactoring without re-litigating the design foundation.
