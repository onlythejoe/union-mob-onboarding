# Repository audit and refactor report

## Findings
- All behavior was driven by a single `script.js` file that owned DOM references, step state, pronoun handling, card rendering, downloads and integrations with `visuals.js`. The tight coupling made it hard to reason about responsibilities or add automated tests.
- User data (identity fields, motivations, links) was collected inline on the form without a dedicated layer, so validation and payload creation were scattered.
- UI transitions (progress bar, transition copy, membership card visibility) were managed through imperative DOM mutations without clear separation, raising the cognitive load and increasing the risk of regressions if the DOM structure changes.
- The `setupVisualManager` integration depended on globals and was initialized at the bottom of the file, mixing animated intro sequences with functional onboarding logic.
- `API_URL` was declared but never used, adding noise and raising questions about intended network access.

## Anti-patterns & risk hotspots
- **God module**: `script.js` was responsible for practically every UI concern. This violates the "one responsibility per file" rule and leaves no easy seam for targeted unit tests.
- **Inline state mutation**: Progress logic, pronoun feedback and membership card data each manipulated DOM nodes from the same scope, making it easy to introduce synchronous bugs (e.g., forgetting to update a success message when closing a card).
- **Weak abstraction for sensitive paths**: There was no central place to sanitize or validate inputs before building the membership payload, and HTML2Canvas access was sprinkled directly in the button handler.
- **Global side effects**: `window.showPresenceCard` was defined in the global scope without a clear owner, meaning external scripts could mutate shared state unexpectedly.

## Data flow & entry points
- **Entry point**: `assets/js/app.js` (new) boots the `OnboardingController`, which wires DOM elements to services.
- **Form state**: `formService.collectFormData` reads FormData when the preview/download handlers run; all derived values live in `membershipCardService`.
- **Transition updates**: `transitionService` owns pronoun-aware copy, while `StepManager` tracks current step + progress and notifies the controller to repaint.
- **Visuals**: `visuals.js` still exposes `setupVisualManager`, and `OnboardingController` initializes it after wiring the new controller.
- **Downloads**: `cardDownloadService` keeps the html2canvas logic behind named exports to keep the format logic testable later.

## New file tree
- `assets/`
  - `js/`
    - `app.js` — single module entry point that assembles the controller and kicks off the onboarding flow.
    - `controllers/`
      - `onboardingController.js` — orchestrates listeners, pronoun feedback, membership card triggers and the visuals bootstrap.
    - `services/`
      - `formService.js` — FormData helpers and validation helpers for required fields.
      - `cardDownloadService.js` — Handles html2canvas rendering and user feedback for downloads.
      - `membershipCardService.js` — Builds payloads, populates the preview card, and hides/displays overlays safely.
      - `stepManager.js` — Manages step progression, button states, progress bars and scrolling rules.
      - `transitionService.js` — Provides pronoun-aware transition copy and message updates.
      - `viewportService.js` — Keeps the `--vh` custom property in sync for fluid layouts.
    - `config/`
      - `pronounConfig.js` — Central pronoun map so the copy and traces always agree.
    - `visuals.js` (unchanged) — Continues to supply `setupVisualManager`.
- `AUDIT.md` — Records the audit findings, new architecture and security rationale.

Each service now manages a well-defined responsibility, making the codebase easier to unit test and secure.

## Technical decisions & security notes
- **Pronoun handling**: Resolved via `transitionService` + `pronounConfig`, ensuring that translation strings live in one place and any new pronoun options need only update that file.
- **Input handling**: `formService` centralizes required-field inspection, so future validators or sanitizers can instrument those helpers instead of scattering logic across event handlers.
- **Membership card rendering**: `membershipCardService` owns payload creation, DOM mapping, and success toggles, reducing the risk of showing stale data.
- **Download guardrails**: `cardDownloadService` encapsulates html2canvas usage and failure messaging so that the onboarding controller only orchestrates actions.
- **Viewport handling**: Dedicated service keeps `--vh` updated and easily removable if a responsive layout break occurs.
- **Global exposure**: `window.showPresenceCard` is still available but now tied to the controller, giving a single owner for future refactors.

## Suggested next steps
1. Add unit or integration tests for `formService`, `transitionService`, `membershipCardService` and `stepManager` to lock down behavior before adding features.
2. Consider bundling the modules (or keeping them as native modules) in the future to support type-checking and tree-shaking.
3. Keep an eye on `visuals.js` dynamic import errors in older browsers; the controller already guards against missing `setupVisualManager`.
