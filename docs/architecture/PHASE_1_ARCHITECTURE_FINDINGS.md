# Relax Fix UAE — Phase 1 Architecture Findings

Status: review artifact for Draft PR #152

## Executive conclusion

The retained repository is the mixed Relax Fix UAE production platform. It is not a standalone Command Center repository. The public website, Staff Portal, AI OS, protected APIs, content and media generation, cron endpoints, and worker endpoints intentionally coexist in one codebase.

Phase 1 established a safer authorization baseline without changing production data, secrets, deployments, cron, workers, or publishing behavior. The platform now has a centralized, tested role-to-permission policy for the audited operational actions, while all protected APIs continue to resolve a Staff session independently.

The architecture is suitable for incremental hardening. It is not yet ready for repository renaming, legacy repository archival, removal of compatibility routes, or automatic production merge.

## Confirmed strengths

### Authentication boundary

- Staff identity is provided by Supabase Auth.
- Staff access requires an active `staff_profiles` record.
- Access and refresh tokens are handled with Secure, HttpOnly, SameSite=Lax cookies.
- Session resolution and refresh happen server-side.
- Protected Staff and AI OS APIs independently call `resolveStaffSession(request)` rather than trusting client navigation state.

### Authorization boundary

- `src/platform/staff-rbac.ts` is the single audited role-to-permission map.
- Centralized permissions currently cover:
  - `booking.status.update`
  - `crm.workflow.update`
  - `content.item.update`
  - `content.item.transition`
  - `content.generate`
  - `media.generate`
  - `automation.status.read`
- Existing role sets were preserved exactly during consolidation.
- The complete five-role permission matrix is locked by `tests/staff-rbac.test.ts` and the required `test:rbac` CI step.
- Booking status mutation now rejects unauthorized roles at the API boundary before the protected RPC call.

### Feature isolation

- `/os` is protected by `VITE_ENABLE_AI_OS` in addition to Staff-session verification.
- When AI OS is disabled, the OS route does not query the Staff session endpoint.
- `/admin` is already a retired compatibility surface rather than an active browser-password dashboard.

### Verification and delivery safety

- CI installs dependencies with lifecycle scripts disabled.
- CI runs TypeScript checks, RBAC tests, ESLint, Vite build, and the existing read-only contract verification suite.
- Production-writing workflows remain manual-only according to the existing contract checks.
- No migrations, seeds, Preview, cron route, background worker, publishing operation, booking submission, production secret access, or production database write was performed in Phase 1.

## Confirmed weaknesses

### Mixed route tree

Public pages, Staff Portal, AI OS, server APIs, cron endpoints, and workers share one application route tree. This reduces deployment fragmentation but increases the importance of strict module ownership, route naming, feature gates, and independent server authorization.

### Internal-surface discoverability

The public application shell knows about AI OS and legacy-admin feature flags. Internal routes remain technically addressable even when links are hidden. Security does not rely on obscurity, but public discoverability creates unnecessary support, indexing, and operational exposure.

### UI and server policy duplication

The Staff booking interface contains a role-based disabled state for the status selector. This is a user-experience aid only. The server API is the authoritative permission boundary. Any future UI permission display must be treated as advisory and kept aligned with centralized RBAC.

### Broad permissions

`media.generate` currently covers image generation, video generation, generated matching copy, and video-job reads. This preserves previous behavior but combines read and write capabilities. Splitting it now would risk changing access and is therefore deferred until a separately approved permission-design review.

### Repository identity mismatch

The repository name `swim-fluent-uae` no longer describes the full production platform. Renaming before Vercel, Actions, webhooks, documentation, deployment references, and developer remotes are mapped would create avoidable operational risk.

### Legacy parity not yet complete

Legacy repositories and deployments must not be archived or deleted until feature, deployment, secret ownership, domain, webhook, and data-flow parity is documented and reviewed.

## Risk register

### High priority

1. **Unverified legacy/deployment parity**
   - Risk: archiving or renaming could break a production deployment, webhook, domain binding, or developer workflow.
   - Control: keep all destructive repository actions blocked until a parity checklist is complete.

2. **Internal navigation exposed from public shell**
   - Risk: unnecessary discovery of Staff and AI OS surfaces and confusion when feature flags differ by environment.
   - Control: make Staff Portal the only discoverable entry point while preserving direct route authentication and feature gates.

### Medium priority

3. **Mixed public/internal operational concerns**
   - Risk: future changes may unintentionally cross public, Staff, AI OS, cron, or worker boundaries.
   - Control: introduce explicit module ownership and route-boundary documentation before structural moves.

4. **Permission granularity**
   - Risk: broad permissions may become difficult to reason about as capabilities grow.
   - Control: add new permissions only when a route has a distinct audited role set; never split existing permissions implicitly.

5. **Feature-flag drift**
   - Risk: navigation, routes, and environment configuration may disagree.
   - Control: retain CI contract checks for route gates and document intended behavior for each environment without exposing values.

### Low priority

6. **Retired `/admin` compatibility route remains present**
   - Risk: stale bookmarks and support ambiguity.
   - Control: retain until external references are checked, then remove in a separate reviewable change.

7. **Vercel build-rate-limit status noise**
   - Risk: infrastructure/account limits may appear as code failures.
   - Control: distinguish GitHub CI validation from Vercel account-limit statuses in review reports.

## Remediation priorities

### Priority 1 — reduce public discoverability

- Remove internal AI OS and legacy-admin links from public navigation and shell code.
- Preserve Staff Portal navigation to AI OS for authenticated users.
- Keep direct `/os` route gating and independent API authorization unchanged.

### Priority 2 — complete authorization inventory

- Continue searching for direct role checks only when behavior can be preserved exactly.
- Document route-specific role checks that should remain local.
- Add a new centralized permission only when the existing allowed-role set is explicit and stable.

### Priority 3 — document ownership boundaries

- Define ownership for public UI, Staff Portal, AI OS, Staff APIs, internal APIs, cron routes, and worker processors.
- Record which modules are allowed to access provider adapters, secret-backed clients, and write-capable RPCs.

### Priority 4 — legacy and deployment parity

- Inventory every related GitHub repository and Vercel project.
- Map production domains, environment ownership, deployment branches, Actions, webhooks, and developer remotes.
- Identify the retained source of truth before archive or rename decisions.

### Priority 5 — repository rename readiness

- Prepare a rename checklist and rollback plan.
- Do not rename while PR #152 remains the active architecture-consolidation lane.

## Phase 1 acceptance state

- Centralized RBAC consolidation for the audited routes: complete.
- Focused RBAC matrix test and required CI integration: complete.
- Typecheck, RBAC tests, lint, build, and read-only contract suite: passed on the prior RBAC-test head.
- Latest documentation and automation-status RBAC head: awaiting final CI completion at the time this report was created.
- Production merge: not authorized.
- Repository rename/archive/delete: not authorized.
