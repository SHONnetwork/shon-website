# SHON release audit

This development branch is for non-destructive release work. Production remains on main.

## Verified
- Profile includes household, family, pets, accessibility, participation, financial, and discovery preferences.
- Member profile and private story are saved separately.
- Mutual-interest database function is not a compatibility ranking algorithm.

## Required before release
- Validate profile save/reload and optional-question semantics.
- Implement consent-aware compatibility ranking without exposing private responses.
- Test Discover, connections, messaging, blocking, reporting, and access controls.
- Verify mobile and keyboard accessibility and full member journeys.
- Extract reusable SHANE components only after SHON release verification.

Do not equate a deployed page with a verified feature.
