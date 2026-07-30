# PWA Current-Main Rebuild Rollback Plan

Last verified: 2026-07-30 Asia/Dubai

Status: `PWA_ROLLBACK_PLAN_VERIFIED`

## Scope

This plan applies only to the rebuilt privacy-safe PWA candidate based on `main` commit `8288881babbb1c085c19f86e55471999191d8859`.

## Rollback triggers

Rollback if the candidate causes any of the following:

- stale application shell or public content remains after a release;
- protected, API, booking, identity or user-specific content enters CacheStorage;
- navigation becomes unavailable because Service Worker registration, install or activation fails;
- offline behavior shows a false booking, WhatsApp, form-submission or data-send success;
- users remain controlled by an obsolete Service Worker after disablement;
- exact-head Preview or post-release verification detects scope, privacy or cache-boundary drift.

## Immediate containment

1. Set `PWA_ENABLED` to `false` in a dedicated rollback commit created from the current release branch.
2. Preserve the existing root-scoped unregister and owned-cache deletion path:
   - unregister only Service Worker registrations whose scope is `${window.location.origin}/`;
   - delete only cache keys beginning with `relax-fix-pwa-`;
   - do not delete unrelated or foreign caches.
3. Publish a new application version only through a separately approved release action.

## Defective-cache eviction

1. Increment `CACHE_VERSION` for every repaired Service Worker release.
2. During `activate`, delete prior caches only when their names start with `CACHE_PREFIX` and do not equal the new version.
3. Keep `updateViaCache: "none"` so the Service Worker script itself is not indefinitely served from an HTTP cache.
4. Call `clients.claim()` only after owned old-cache cleanup completes.

## Source rollback

1. Revert the PWA merge commit, or restore the immediately preceding known-good `main` commit, in a new reviewed rollback PR.
2. Do not rewrite migration history, touch Supabase, or roll back unrelated application changes.
3. If a code revert disables registration, keep the unregister/owned-cache cleanup path active for at least one deployed version so existing installations receive cleanup.

## Post-rollback verification

- open the public Arabic and English routes online;
- confirm no framework error or blank page;
- confirm root Service Worker registration count becomes zero when disabled;
- confirm all `relax-fix-pwa-*` caches are removed;
- confirm unrelated caches are untouched;
- confirm `/staff`, `/os`, `/admin`, `/api` and authentication routes remain network-only;
- confirm offline navigation does not show false booking or message success;
- reconnect and confirm fresh online content is loaded;
- close and relaunch an installed instance and confirm the obsolete worker no longer controls the page.

## Boundary

This plan does not authorize Merge, Production Promotion, environment changes, Supabase, Auth, RLS, database mutation or secret changes.