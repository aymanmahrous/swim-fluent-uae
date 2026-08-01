# Vercel Ignored Build Policy Impact Assessment — 2026-08-01

## Classification

`COMPLETED_VERIFIED`

## Scope

Program-governance assessment only. No Vercel setting, repository code, redirect implementation, sitemap, analytics, Production environment, deployment, retry, redeploy, merge, or PR state was changed.

## Evidence baseline

- Official project: `prj_4wRrALwNzlU0msHb9pGOsExmNID0` (`swim-fluent-uae-w532`, TanStack Start).
- Verified affected branch: `agent/p1-3-semantic-route-redirect-preview-20260801`.
- Verified affected commit: `76ac3d4438fdb3cf8a0666cc4c34c56dc4c6a8e5`.
- Verified canceled deployment: `dpl_96bKps6DXCeAjMjGoQmkver8q1xG`.
- Vercel source: Git integration.
- Build log proves repository clone and cache restoration succeeded, then the configured Ignored Build Step canceled the deployment before application compilation.
- Exact policy command recorded by Vercel:

```text
node -e "const ref=process.env.VERCEL_GIT_COMMIT_REF||'';const projectId=process.env.VERCEL_PROJECT_ID||'';const canonical='prj_4wRrALwNzlU0msHb9pGOsExmNID0';process.exit(ref.startsWith('agent/')||(projectId&&projectId!==canonical)?0:1)"
```

- Vercel semantics observed in the real receipt: exit code `0` caused the deployment to be ignored/canceled.
- Explicit Vercel log receipt:

```text
The Deployment has been canceled as a result of running the command defined in the "Ignored Build Step" setting.
```

## Current policy behavior

The current expression returns exit code `0` when either condition is true:

1. `VERCEL_GIT_COMMIT_REF` starts with `agent/`; or
2. the deployment runs under a non-canonical project ID.

Consequently:

- every Git-triggered branch whose full ref begins with `agent/` is intentionally canceled in the official project;
- deployments in secondary/non-canonical projects are intentionally canceled regardless of branch name when `VERCEL_PROJECT_ID` is available and differs from the canonical project;
- the policy is not limited to PR #246, redirect work, or documentation-only branches;
- changing the commit content does not avoid the rule while the branch remains under `agent/*`;
- retrying or redeploying under the same branch and project evaluates the same condition and remains canceled.

## Future work types affected

All future work that depends on a live Vercel Preview from an `agent/*` branch is blocked, including:

1. Public website route or redirect changes.
2. Booking UI and validation changes.
3. Mobile layout and responsive fixes.
4. Accessibility and keyboard-navigation fixes.
5. SEO metadata, canonical, hreflang, structured-data, robots, and runtime sitemap verification.
6. Consent, analytics-preview, CTA-event, and conversion instrumentation validation.
7. Staff dashboard, CRM, Content Studio, Media Library, and authenticated UI changes.
8. API route, server handler, session, RBAC, and error-response runtime smoke checks.
9. AI image/video control UI changes where browser or API runtime evidence is required.
10. PWA, service-worker, manifest, cache, and installability validation.
11. Visual design, branding, content-layout, and bilingual rendering review.
12. Any stakeholder review that requires a clickable isolated URL.
13. Any PR acceptance gate whose definition requires exact-head Preview evidence.
14. Any regression investigation requiring browser console, network, screenshot, or device evidence before merge.

Static GitHub Actions can still execute and may prove typecheck, lint, build, scripted contracts, and source-level boundaries. They cannot substitute for an addressable deployed runtime when the acceptance criterion is browser, network, visual, device, or stakeholder evidence.

## Capability impact matrix

| Capability | Prevented by current policy for `agent/*`? | Impact |
|---|---:|---|
| Preview QA | YES | No exact-head Preview URL exists for QA. |
| Browser Testing | YES | No deployed runtime for navigation, hydration, console, or network checks. |
| Mobile Verification | YES | No addressable build for real 390×844/device verification. |
| Visual Regression | YES | No current rendered target for screenshot baselines or comparisons. |
| SEO Verification | PARTIALLY | Static source/build checks remain possible; live HTTP status, redirects, rendered metadata, canonical behavior, and crawler-like receipts are blocked. |
| Accessibility Testing | PARTIALLY | Static lint/source review remains possible; runtime focus order, keyboard, dialogs, screen-reader tree, and responsive behavior are blocked. |
| Runtime Smoke Tests | YES | Server routes, redirects, sessions, APIs, and hydration cannot be exercised on the PR head. |
| Stakeholder Review | YES | No safe isolated URL can be shared for approval. |
| PR Validation | PARTIALLY | CI validation remains available; runtime-dependent PR acceptance cannot be completed. |

## Scope of affected branches

### Definitive result

`ALL_BRANCHES_WHOSE_REF_STARTS_WITH_agent/`

This follows directly from `ref.startsWith('agent/')` and is not conditional on:

- file type;
- changed path;
- PR number;
- draft status;
- commit message;
- whether the change is documentation, frontend, backend, or infrastructure;
- whether GitHub Actions passed.

### Other affected cases

The policy also ignores deployments where:

```text
projectId && projectId !== canonical
```

Therefore a non-canonical Vercel project is also blocked when the project ID environment value is present, even for a non-`agent/*` branch.

### Cases not proven blocked by this expression

- `main` in the canonical project.
- non-`agent/*` branches in the canonical project.

This report does not assert that those cases always deploy; it states only that this specific expression does not classify them for cancellation.

## Minimum policy change for Preview-only enablement

### Governance objective

Allow Preview deployments for review branches while preserving all existing Production controls and preventing non-canonical projects from becoming alternate deployment paths.

### Smallest documented logic change

Remove the blanket `agent/*` cancellation condition while retaining the canonical-project guard:

```text
node -e "const projectId=process.env.VERCEL_PROJECT_ID||'';const canonical='prj_4wRrALwNzlU0msHb9pGOsExmNID0';process.exit(projectId&&projectId!==canonical?0:1)"
```

Effect:

- official canonical project may build Preview deployments for `agent/*` branches;
- non-canonical projects remain ignored;
- Production deployment permissions, domain promotion, merge controls, environment variables, and GitHub branch protections are not relaxed by this change;
- the change enables a Preview build but does not itself deploy to Production.

### Safer explicit allowlist variant

Where governance requires previews only for approved agent branches, use a documented prefix or exact-ref allowlist rather than permitting every `agent/*` branch. Example policy intent:

```text
ignore when project is non-canonical;
build when ref is main;
build when ref starts with agent/preview- or agent/qa-;
ignore all other refs.
```

An exact implementation should be reviewed against Vercel's exit-code semantics before activation. The critical requirement is to make the allowlist explicit and documented, not to use an undocumented bypass or rename convention.

## Current versus proposed policy

| Dimension | Current policy | Proposed minimum policy |
|---|---|---|
| Canonical Production protection | Preserved | Preserved |
| Non-canonical project suppression | Preserved | Preserved |
| `agent/*` Preview builds | Always canceled | Allowed in canonical project |
| Exact-head runtime QA | Blocked | Available |
| GitHub static CI | Available | Available |
| Browser/mobile/visual evidence | Blocked | Available on Preview |
| Stakeholder isolated review | Blocked | Available |
| Production promotion | Not granted by policy | Still not granted by policy |
| Risk of accidental Preview creation | Low | Increased, limited to Preview build consumption |
| Risk of Production write | Not caused by this setting | Not caused by the proposed change; remains governed elsewhere |

## Risks

### Current-policy risks

- Runtime defects can pass static CI and remain undiscovered until after merge or Production release.
- Mobile, accessibility, SEO HTTP behavior, redirects, hydration, and browser-network defects cannot receive exact-head evidence.
- Stakeholder approvals become screenshot- or description-based rather than build-based.
- PRs can remain permanently in a partially verified state despite green CI.
- Teams may be incentivized to rename branches or seek undocumented workarounds, weakening governance.
- The policy conflicts with existing program acceptance criteria that require Preview evidence before merge.

### Proposed-policy risks

- More Preview builds consume build minutes and deployment storage.
- Preview URLs may expose unfinished UI unless deployment protection remains enabled.
- A branch may accidentally connect to unsafe external services if Preview environment isolation is misconfigured.
- Stakeholders may confuse Preview with Production unless labels and domains are explicit.

### Required controls if changed

- Keep Production target and domain promotion separately permission-gated.
- Keep PRs Draft/unmerged until evidence and approval are complete.
- Keep Production secrets absent from Preview unless explicitly required and safely scoped.
- Keep database writes and external publishing disabled by environment-level feature flags and credentials.
- Retain Vercel deployment protection for Preview URLs where appropriate.
- Document the allowlisted branch pattern and responsible approver.
- Monitor build usage to avoid unexpected quota consumption.

## Benefits of the proposed minimum policy

- Restores exact-head Preview QA without weakening Production promotion controls.
- Enables real desktop and mobile browser verification.
- Enables screenshot, console, network, redirect, canonical, and accessibility receipts.
- Allows stakeholders to review the actual isolated change before merge.
- Aligns infrastructure behavior with the project's established preview-first governance.
- Reduces late defect discovery and Production rollback risk.
- Removes pressure to use branch-renaming workarounds or secondary projects.

## Governance conclusion

The current Ignored Build Step is an intentional cost/control mechanism, but it is over-broad for this project's operating model. It cancels every `agent/*` Preview before application compilation and therefore blocks the full runtime evidence chain required by the program's own acceptance gates.

The lowest-impact correction is to preserve the non-canonical-project cancellation rule and stop treating all `agent/*` refs as ignored in the official project. An explicit, documented Preview branch allowlist is the safest refined form when unrestricted `agent/*` previews are not desired.

No policy change was executed in this assessment.

## Process guard receipt

- Existing evidence branch used: `agent/p1-3-preview-http-browser-receipts-20260801`.
- Target branch explicitly confirmed as non-`main`.
- Intended path printed and passed explicitly:
  - `docs/program/VERCEL_IGNORED_BUILD_POLICY_IMPACT_ASSESSMENT_2026-08-01.md`
- PR #246 was not modified.
- No code or Vercel configuration was changed.
- No deployment, retry, redeploy, merge, or Production action occurred.
