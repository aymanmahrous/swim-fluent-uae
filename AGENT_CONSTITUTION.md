# AGENT CONSTITUTION

Last verified: 2026-07-23 (Asia/Dubai)

Status: `PHASE_0_GOVERNANCE_BASELINE`

This constitution is binding for every human, AI agent, automation, reviewer, developer, or tool operating on the Relax Fix UAE program. It supplements `AGENTS.md`, `PROJECT_HANDOFF.md`, `PROJECT_STRATEGY_HANDOFF.md`, and `docs/program/PROJECT_DIRECTOR_AUTHORITY_AND_AGENT_CONTINUATION_HANDOFF.md`. When rules conflict, the stricter safety boundary applies until the conflict is explicitly resolved and recorded.

## 1. Three-project separation

The following are separate projects and must not be mixed:

1. **Relax Fix UAE customer website**
   - GitHub: `aymanmahrous/swim-fluent-uae`
   - Vercel: `swim-fluent-uae-w532`
   - Public domain: `relaxfixuae.com`
   - GitHub and Vercel are authoritative for this project.
2. **Command Center Hub**
   - Separate internal Replit application.
   - Must not be changed from this repository workflow except for explicitly authorized work under Issue #76.
3. **Mobile coach application**
   - Separate project.
   - Intentionally paused and must not be restarted, modified, or merged into Relax Fix UAE without explicit owner authorization.

No shared assumption, file, database, credential, deployment, account, feature, or status may be transferred between these projects without documented evidence and explicit authorization.

## 2. Strategy lock

The approved strategy is:

`REVENUE-FIRST PARALLEL LAUNCH`

This strategy, its track order, and its approval gates must not be changed without a documented reason, explicit owner approval, and updates to the durable strategy source.

Long-term Growth OS or Complete Digital Ecosystem work must not delay, replace, or destabilize current revenue foundations.

## 3. Git and pull-request discipline

- Never push directly to `main`.
- Never merge automatically.
- Work on one phase only at a time.
- Each phase uses a small, isolated branch.
- Each phase requires a Draft PR before it can be considered reviewable.
- Each PR must have one clear purpose and must not mix unrelated workstreams.
- Published Git history must not be rewritten by force push, rebase, amend, or squash after push.
- Only explicitly scoped files may be staged or committed.
- A phase is not complete merely because a branch, commit, Issue, plan, or Draft PR exists.

## 4. Human approval gates

Explicit human approval is required before any protected or irreversible action, including:

- merging a protected or Production-impacting change;
- Production deployment, promotion, activation, rollback, or domain change;
- Production database migration, repair, destructive action, write, seed, or manual migration-history change;
- credentials, secrets, environment variables, OAuth access, account permissions, billing, or vendor configuration changes;
- legal, regulatory, Privacy, Consent, safeguarding, medical, clinical, credential, qualification, professional, price, offer, testimonial, location, school-hours, or outcome claims;
- use of real bookings, leads, customers, learners, children, guardians, families, disability, diagnosis, health, or safeguarding data;
- Analytics activation, advertising measurement, conversion import, Ads, billing, budgets, stop-loss values, or spend;
- publishing, scheduling, external account modification, or public release;
- outbound WhatsApp, email, SMS, notifications, or automated messages beyond an approved user-initiated flow;
- any irreversible external action.

Silence is not approval. Missing facts stay unresolved and must not be invented.

## 5. Data and privacy prohibitions

Until all required Privacy, Consent, security, retention, role-access, sharing, vendor, and incident rules are approved:

- do not use real identifiable learner, child, guardian, family, disability, diagnosis, health, safeguarding, lead, booking, or customer data;
- use only fictional, sample, anonymous, or safely redacted records;
- do not send sensitive or personally identifiable data to Analytics, advertising systems, AI providers, optional marketing tools, logs, screenshots, Issues, PRs, or public files;
- do not perform a real Production booking or create a real customer record;
- do not expose secrets, tokens, private account details, or internal identifiers.

## 6. Supabase and database prohibitions

- No `supabase db push` against Production.
- No `supabase migration repair` against Production.
- No manual modification of migration history.
- No Production migration, seed, destructive statement, RPC write, Storage write, or database write without explicit approval and an approved safety plan.
- The Supabase automation pulse must remain `active=false` until separately authorized after verified deployment evidence.
- Historical migrations must never be edited for new work; approved changes use new migrations only.

## 7. Deployment and runtime prohibitions

- No direct push to `main`.
- No merge.
- No Production deployment or promotion.
- No Production feature-flag activation.
- No Secrets or Environment Variable changes.
- No Cron, Worker, scheduler, publishing adapter, provider generation, or outbound automation activation without explicit approval.
- Contract-tested or documented behavior must not be described as Live without direct Live evidence.

## 8. Messaging, publishing, content, and advertising prohibitions

- No WhatsApp, email, SMS, notification, or automated outbound message without the applicable human approval and consent basis.
- No scheduling, publishing, retry, republishing, or external-account write without human approval.
- No Ads, billing connection, conversion import, budget, stop-loss, paid generation, or spend.
- Do not regenerate Batch A1.
- Do not begin Batch A2 without explicit owner authorization.
- Do not use Doha Sportive Center identity, profile, reviews, categories, photos, locations, ownership history, or account evidence for Relax Fix UAE.
- Do not change the `media-storage` server-key convention from `apikey` to `Authorization: Bearer sb_secret...`.
- Do not publish unsupported claims, prohibited wording, fabricated facts, prices, testimonials, credentials, qualifications, medical/therapy/rehabilitation claims, guarantees, addresses, locations, hours, or outcomes.

## 9. Evidence and truthfulness rules

Every report must distinguish clearly between:

- assigned;
- planned;
- documented;
- implemented;
- contract-tested;
- locally tested;
- CI-tested;
- Preview-tested;
- Production-deployed;
- Production-verified;
- not verified.

Completion requires the applicable evidence: scoped diff, commit SHA, Draft PR, tests, CI result, Preview URL/state, review outcome, deployment evidence, or direct verification. Missing evidence must be stated as missing.

## 10. Phase model

Only one phase may be executed at a time. No later phase starts before the current phase is complete and the owner explicitly authorizes continuation.

### Phase 0 — Constitution and governance baseline

- Establish this constitution.
- Synchronize the operational Handoff with verified repository, Production, test, commit, PR, CI, and Preview evidence.
- No product, database, Production, messaging, publishing, or external-account change.

### Phase 1 — Verified baseline and release-readiness reconciliation

- Reconcile GitHub `main`, Vercel Production, open PRs, active Issues, branch protections, and current release blockers.
- Produce read-only evidence before any release decision.

### Phase 2 — Revenue foundation stability

- Validate the public website, bilingual routes, booking journey, conversion path, mobile behavior, accessibility, security, and rollback boundaries through isolated work.

### Phase 3 — SEO and Local SEO readiness

- Complete technical SEO, on-page SEO, Search Console, Google Business Profile, location, hours, NAP, indexability, and field evidence without inventing facts or writing to external accounts without approval.

### Phase 4 — Privacy, Consent, Analytics, and attribution

- Resolve protected owner/legal/provider decisions.
- Implement only approved consent and measurement foundations through isolated Preview-first work.
- Keep Analytics off until explicitly approved.

### Phase 5 — Content and media readiness

- Use approved copy, assets, rights evidence, Quality decisions, exact file/hash mapping, and human review.
- Do not regenerate Batch A1 or begin Batch A2 implicitly.

### Phase 6 — Publishing and Lead Operations readiness

- Verify account ownership, permissions, publication receipts, duplicate prevention, ambiguous-state handling, human follow-up, chatbot/n8n boundaries, and safe-stop behavior.
- No Live publishing or outbound automation without approval.

### Phase 7 — Controlled Organic Pilot

- Begin only after all Privacy, content, media, Quality, publishing, account, measurement, conversion, and human-release gates pass.
- Keep the pilot limited, reversible, measured, and evidence-backed.

### Phase 8 — Paid acquisition and wider expansion

- Google Ads only after proven conversion measurement, stable booking, acceptable mobile performance, lead follow-up ownership, approved budget, stop-loss, Privacy, Consent, and explicit owner approval.
- Meta Ads later.
- Wider Growth OS, mobile, academy, LMS, multi-coach, and multi-branch expansion remains separately prioritized and gated.

## 11. Phase completion checklist

A phase is complete only when all applicable items exist and are recorded:

1. exact scoped files and exclusions;
2. required tests and their results;
3. reviewed diff confirming no unrelated changes;
4. commit SHA on the phase branch;
5. remote branch push without touching `main`;
6. Draft PR number and URL;
7. CI run and result;
8. Vercel Preview URL and state when applicable;
9. updated `PROJECT_HANDOFF.md` evidence;
10. no merge, Production deployment, Production write, protected external action, or next-phase work.

After completion, stop and request explicit authorization before moving to the next phase.
