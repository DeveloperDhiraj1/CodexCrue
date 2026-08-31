# CodexCrue Frontend UI/UX Audit

## Current strengths

- The frontend has a working React Router application with learner and admin route guards.
- API access is centralized through Axios with access-token attachment and refresh handling.
- Core learner pages now consume profile, goal, path, course, progress, assessment, feedback, and AI endpoints.
- Production builds currently pass, and route-level lazy loading is already in place.

## Current problems

1. The visual language is still too close to a generic teal dashboard. The new product direction requires a calmer deep-neutral surface system with blue/purple accents, tighter 12–16px cards, and restrained gradients.
2. The current shared navigation exposes all links through a horizontally scrolling mobile bar. The brief explicitly requires a mobile drawer and forbids horizontal scrolling.
3. Reusable primitives are mostly CSS classes and page-local markup. There is no formal `frontend/src/components/ui` library for buttons, inputs, cards, states, overlays, progress, or charts.
4. Several pages are still dense single-file components and need reusable dashboard, roadmap, course, analytics, and state components.
5. Loading states are mostly text-only rather than skeleton states; retry actions are inconsistent.
6. Some legacy components remain unused and contain old fallback/demo copy, creating maintenance risk even though they are not routed.
7. The current admin shell does not have a distinct management hierarchy with dedicated navigation sections.
8. Accessibility needs a systematic pass: focus states, dialog semantics, labels, mobile menu keyboard behavior, and table overflow handling.

## Redesign plan

1. Establish theme variables and reusable UI primitives.
2. Replace the mobile horizontal bar with an accessible drawer.
3. Refactor the shell/header/sidebar around learner and admin navigation models.
4. Extract dashboard, course, roadmap, AI context, progress, and state components.
5. Add consistent skeleton, empty, error, retry, modal, and toast behavior.
6. Rework visual tokens toward deep neutral + blue/purple accents while preserving real API data.
7. Run build, route, accessibility, responsive, and API-surface audits without changing backend contracts.

## Constraints

- This phase changes frontend files only.
- Existing API contracts and authentication behavior remain unchanged.
- No fake statistics, placeholder buttons, or demo records will be introduced.
