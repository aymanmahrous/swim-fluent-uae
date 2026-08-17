# Current Verified Baseline — 2026-08-01

Status: `P0_BASELINE_RECONCILED_PARTIALLY_VERIFIED`

Authoritative repository: `aymanmahrous/swim-fluent-uae`

Baseline commit: `59f300369c3b8321ceb4bf822d1f13ad19b5776e`

Safety boundary: read-only reconciliation and documentation only. No merge, deployment, Production write, migration, publishing, scheduling, messaging, credentials, Ads, billing, or spend.

## 1. Current verified baseline

| # | Workstream | Classification | Evidence-backed baseline | Remaining gate |
|---|---|---|---|---|
| 1 | Project governance | COMPLETED_VERIFIED | Revenue-First Parallel Launch and protected-action boundaries are locked in the two Handoff files. | Preserve; update operational handoff only after approved phases. |
| 2 | GitHub repository and branches | PARTIALLY_COMPLETED | Public repo, default branch `main`, admin access verified; baseline main SHA recorded above. | Full stale-branch disposition and branch protection evidence. |
| 3 | Issues | PARTIALLY_COMPLETED | Program Board #54, Publishing #60, 90-day strategy #68, Replit #76 and control issues #114–#117 remain canonical tracked work. | Reconcile each issue against artifacts, not comments. |
| 4 | PRs and commits | PARTIALLY_COMPLETED | Recent main includes merged PRs #235–#237; PR #227 identity lock and #228 Post 3 template lock remain do-not-reopen. | Full open-PR disposition and CI linkage. |
| 5 | CI and workflows | PARTIALLY_COMPLETED | Historical CI evidence exists; latest merged commits identified. | Current combined status and workflow-run evidence per active PR. |
| 6 | Vercel Production and Previews | PARTIALLY_COMPLETED | GitHub/Vercel remain website source of truth; prior Production READY evidence exists. | Verify latest Production deployment SHA and active Preview URLs. |
| 7 | Public website AR/EN | PARTIALLY_COMPLETED | Approved bilingual claims and service scope are documented; recent privacy contact alignment merged. | Direct latest Production regression evidence. |
| 8 | Mobile UX and accessibility | PARTIALLY_COMPLETED | Mobile consent/booking-bar overlap fix merged in PR #236. | Full mobile accessibility and form-friction verification. |
| 9 | Booking and duplicate prevention | PARTIALLY_COMPLETED | Booking flow foundations exist; no real booking authorized. | Preview-only idempotency, duplicate prevention, failure/retry tests. |
| 10 | Supabase schema/RLS/RPC/security | BLOCKED | Production writes and migrations are protected; source contains a public project binding. | Read-only schema/RLS/RPC/privileged-function matrix and isolated test evidence. |
| 11 | Staff dashboard and RBAC | PARTIALLY_COMPLETED | Authenticated UI was visually observed previously. | Server-side authorization, API/RLS and role-boundary proof. |
| 12 | Replit Command Center | BLOCKED | Separate internal app; Phase 1 remains without accepted persistence/API/test evidence. | Running Preview, schema/API inventory, persistence and audit tests. |
| 13 | 30-day content plan | COMPLETED_VERIFIED | Canonical bilingual operating plan merged. | Owner/QA/source-rights approval for production slots. |
| 14 | Batch A1 assets and rights | READY_WAITING_APPROVAL | Canonical package and 23/23 visual QA are verified. | Exact asset-caption pairing and rights/source release evidence. |
| 15 | Canva designs and QA | PARTIALLY_COMPLETED | Approved packages and references exist. | Design IDs/export receipts and final per-post QA where missing. |
| 16 | Coach Ayman identity lock | COMPLETED_VERIFIED | PR #227 and Canva reference `MAHQ_4gGKEY` are locked. | Do not reopen unless proven regression. |
| 17 | Facebook/Instagram receipts | COMPLETED_VERIFIED | Confirmed publication URLs supplied for Facebook and Instagram. | Preserve receipts; no republish/recreate. |
| 18 | Meta Graph API readiness | PARTIALLY_COMPLETED | Account identities and published receipts exist. | Permissions, token custody/lifecycle, idempotency and ambiguous-state proof. |
| 19 | GA4/consent/UTM/attribution | PARTIALLY_COMPLETED | Preview analytics isolation and consent foundations merged; Production activation remains off. | Preview event/deduplication proof and owner-approved Production activation. |
| 20 | SEO and Local SEO | PARTIALLY_COMPLETED | Evidence packs and corrected source-of-truth files merged. | Current Search Console/GBP evidence, owner facts and isolated implementation. |
| 21 | Google Search Console | NOT_STARTED | No verified account or URL Inspection evidence in current baseline. | Read-only property/index evidence; writes separately approved. |
| 22 | Google Business Profile | BLOCKED | Target values are documented, live state unverified. | Ownership/verification/current fields and owner-confirmed facts. |
| 23 | WhatsApp and lead operations | PARTIALLY_COMPLETED | CTA and operational planning foundations exist. | Consent, ownership, SLA, audit and outbound approval. |
| 24 | CRM and follow-up ownership | PARTIALLY_COMPLETED | Architecture/planning exists. | Named human owner, stages, dedupe, SLA and approved data handling. |
| 25 | Chatbot and n8n | NOT_STARTED | Strategy approved; Production implementation gated. | Privacy/security/human escalation/idempotency architecture and Preview. |
| 26 | Media Library and SHA-256 audit | PARTIALLY_COMPLETED | Media operating model exists; SHA-256 audit has separate evidence stream. | Reconcile latest inventory/progress/errors and approved duplicate review. |
| 27 | Privacy/minors/sensitive data | PARTIALLY_COMPLETED | Decision pack exists; privacy contact alignment merged. | Owner/legal decisions, retention, access, deletion and consent implementation proof. |
| 28 | Google Ads | BLOCKED | Correctly ordered after conversion proof. | GA4 Production proof, stable booking, lead ownership, budget and owner approval. |
| 29 | Meta Ads | BLOCKED | Correctly ordered after Google Ads/creative proof. | Organic/Google learning, measurement and explicit spend approval. |
| 30 | Complete Digital Ecosystem | PARTIALLY_COMPLETED | Approved phased architecture is on main. | Prioritized module execution after P0–P8 gates. |

## 2. Completed — do not repeat

- Revenue-First strategy lock and protected-action matrix.
- PR #227 Coach Ayman identity lock.
- PR #228 Post 3 template lock.
- Canonical Batch A1 package and 23/23 visual QA.
- Existing 30-day bilingual content plan.
- Existing UTM, CTA, consent and Preview analytics foundations.
- Confirmed Facebook and Instagram publication receipts.
- Existing SEO/Local SEO evidence packs.
- Existing Complete Digital Ecosystem architecture.

## 3. Remaining work only

1. Produce current CI/PR/branch disposition evidence.
2. Verify latest Vercel Production and Preview deployment mapping.
3. Build Supabase security matrix: tables, RLS, policies, RPCs, privileged functions and migration state — read only.
4. Prove Preview booking idempotency and duplicate prevention without real submission.
5. Prove Staff RBAC server-side boundaries.
6. Reconcile Replit drift and Phase 1 acceptance evidence.
7. Close Meta readiness gaps without publishing: permissions, custody, lifecycle, receipts and retry safety.
8. Produce GA4 Preview event, consent, deduplication and no-PII evidence.
9. Gather Search Console and GBP read-only evidence plus owner facts.
10. Define lead owner, CRM SLA, chatbot/n8n Preview architecture.
11. Reconcile Media Library/SHA-256 latest state.

## 4. Duplicate or superseded register

- Any attempt to recreate the confirmed Facebook/Instagram post: `DUPLICATE_OR_SUPERSEDED`.
- Any alternative Coach Ayman face reference: `DUPLICATE_OR_SUPERSEDED`.
- Any Batch A1 package other than the approved recovery pipeline: `DUPLICATE_OR_SUPERSEDED` for canonical release.
- Any new 30-day plan that replaces rather than updates the canonical plan: `DUPLICATE_OR_SUPERSEDED`.
- Replit as Production website/database source: `DUPLICATE_OR_SUPERSEDED` by GitHub/Vercel/Supabase authority.

## 5. Security and Production risk register

| Risk | Severity | Safe state |
|---|---|---|
| Supabase RLS/RPC/privileged access not fully evidenced | S1 | No Production migration/write; read-only matrix first. |
| Staff UI evidence without server-side RBAC proof | S1 | Do not treat visible role labels as authorization proof. |
| Publishing retry after ambiguous provider response | S1 | Manual platform verification before any retry. |
| GA4/attribution PII or duplicate events | S1 | Preview only; Production flag off. |
| Replit connected to live Supabase without isolation | S1 | No staff-authenticated test until environment boundary is proven. |
| Mobile/accessibility regressions | S2 | Preview QA before merge/deploy approval. |
| Stale Search/GBP public facts | S2 | No writes or invented facts. |
| Media duplicate/destructive cleanup | S1 | No delete/move/rename without reviewed manifest and approval. |

## 6. Owner decision queue

- Confirm canonical business hours, address visibility, service areas, categories and GBP phone details.
- Approve Privacy/Consent factual and legal decisions, including retention and request handling.
- Approve the narrow Production Analytics verification and rollback policy only after Preview proof.
- Confirm Meta Business ownership, permissions and credential custodian.
- Name the human lead owner and approve CRM follow-up SLA/data minimum.
- Approve Organic Pilot scope, publisher, success/stop rules and release gate.
- Later approve Google Ads budget, billing owner, acceptable lead cost and stop-loss.

## 7. Prioritized execution backlog

- P0: current CI/PR/branch/Vercel evidence; Supabase security matrix; source-of-truth conflicts.
- P1: Preview booking duplicate prevention; Staff RBAC; mobile/accessibility regression.
- P2: Post 3 exact readiness pack; Canva IDs/QA; rights and publication evidence preservation.
- P3: GA4 Preview event/consent/dedup/no-PII proof.
- P4: Search Console/GBP read-only evidence and owner-fact queue.
- P5: Lead owner/CRM/chatbot/n8n Preview design.
- P6: Organic Pilot only after gates and explicit publish approval.
- P7: Google Ads only after conversion proof and financial approval.
- P8: Meta Ads later.
- P9: Growth OS modules by evidence-backed priority.

## 8. Dependency and gate matrix

| Deliverable | Depends on | Gate |
|---|---|---|
| Organic Pilot | Batch A1, approved copy/assets, publishing readiness, measurement, lead owner | Explicit publish approval |
| GA4 Production | Privacy/Consent, Preview proof, no-PII/dedup | Explicit activation approval |
| Search/GBP writes | verified ownership and owner facts | Explicit external-write approval |
| Chatbot/n8n Live | Privacy, security, human escalation, idempotency | Credentials and Production approval |
| Google Ads | stable booking, conversion proof, follow-up, budget | Billing/spend approval |
| Meta Ads | organic/Google learning and creative proof | Separate billing/spend approval |
| Replit Phase 2 | Replit Phase 1 acceptance | Security acceptance |

## 9. 30/60/90-day execution plan

### Days 1–30
- Close P0 evidence gaps and Supabase/RBAC/booking Preview safety proof.
- Close Post 3 readiness and GA4 Preview proof.
- Obtain Search Console/GBP read-only evidence and owner facts.

### Days 31–60
- Implement approved SEO/Local SEO and lead-operations Preview batches.
- Run limited Organic Pilot after all gates and explicit approval.
- Capture immutable publication, analytics and lead-handling evidence.

### Days 61–90
- Evaluate organic conversion evidence.
- Prepare Google Ads gate pack and controlled test only after financial approval.
- Keep Meta Ads deferred until Google/creative/measurement evidence is sufficient.

## 10. Next safe execution batch

`P0_SECURITY_AND_RUNTIME_EVIDENCE_BATCH`

1. Record current open PRs, latest commit CI and branch disposition.
2. Verify latest Vercel Production/Preview mapping read only.
3. Generate Supabase schema/RLS/RPC/privileged-function security matrix read only.
4. Generate Preview-only booking idempotency and Staff RBAC test plan with executable test cases.
5. Update `PROJECT_HANDOFF.md` only after the batch is completed and accepted.
