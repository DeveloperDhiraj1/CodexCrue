# CodexCrue Public Site UX Plan

## Scope

This phase is frontend-only. It changes the first-run experience, public
navigation, light visual system, and route protection without changing backend
services, ML behavior, database schemas, or API contracts.

## Current findings

- `/` currently redirects to the protected dashboard, so unauthenticated users
  land on login instead of discovering the product.
- `/courses` and `/courses/:id` are protected even though course discovery is a
  public product surface.
- Public landing, features, how-it-works, and about routes are missing.
- Protected-action CTAs need to retain an intended destination through login.
- The current shared theme is dark-first and needs a light SaaS treatment while
  preserving the existing authenticated screens and API data flows.

## Implementation order

1. Add the public route surface and a reusable public layout.
2. Build the light-theme home page with product explanation, feature paths,
   workflow, previews, and clear authentication boundaries.
3. Make course discovery public while keeping enrollment/personal actions
   protected.
4. Add protected-route redirect preservation and authenticated-login redirect.
5. Align shared styles and authentication pages with the light design system.
6. Verify builds, route imports, responsive CSS, and API usage without adding
   fake statistics or mock backend behavior.

## Data policy

Public content is explanatory UI or clearly labeled illustrative previews.
Course discovery uses the existing courses API. Personalized dashboard,
assistant, goals, skill gap, learning path, assessment, progress, and profile
data remain protected and API-backed.
