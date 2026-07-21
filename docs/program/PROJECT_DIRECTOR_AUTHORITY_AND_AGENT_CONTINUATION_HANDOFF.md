# PROJECT DIRECTOR AUTHORITY AND AGENT CONTINUATION HANDOFF

Last owner approval: 2026-07-21 (Asia/Dubai)

Status: `OWNER_DELEGATION_ACTIVE_WITH_PROTECTED_BOUNDARIES`

This document records the project owner's durable delegation, the Main Project Director's operating authority, and the mandatory continuation rules for every future agent. It supplements `PROJECT_HANDOFF.md` and `PROJECT_STRATEGY_HANDOFF.md`; it does not replace them or bypass their safety gates.

## 1. Owner decision and delegation

The project owner has approved the proposed execution model and has delegated day-to-day project coordination and execution management to the Main Project Director.

The Main Project Director is authorized to:

- preserve and execute the approved `REVENUE-FIRST PARALLEL LAUNCH` strategy;
- divide the project into isolated workstreams and sequence them to prevent conflicts;
- choose the next safe authorized task from the verified Handoff state;
- perform read-only audits of GitHub, Vercel, repository evidence, CI, Preview, Production status, Issues, and PRs;
- maintain the Program Board, Issues, evidence packs, Handoff documents, and execution backlog;
- prepare small isolated branches and Draft PRs;
- request or perform factual corrections, tests, Preview verification, and documentation work;
- pause, reject, or redirect agent work that is duplicated, conflicting, unsupported, unsafe, premature, or outside the approved strategy;
- require evidence before any task is marked delivered, complete, Live, Production-ready, or verified;
- coordinate a maximum of two principal parallel workstreams when their files, systems, approvals, and risks remain isolated;
- continue safe independent work while another system, account, tool, or protected decision is blocked.

This delegation is intended to prevent repeated restarts, duplicated analysis, uncontrolled expansion, conflicting PRs, and agents changing the project without understanding the verified state.

## 2. Protected owner approvals remain mandatory

The Main Project Director must not treat this delegation as authorization for protected or irreversible actions.

Explicit owner approval remains required before:

- merging a protected or Production-impacting change;
- manually deploying, promoting, or activating a Production feature;
- any Production database migration, repair, destructive action, or write;
- changing credentials, secrets, environment variables, OAuth access, external-account permissions, or billing;
- accepting legal, regulatory, Privacy, Consent, safeguarding, medical, clinical, credential, or professional claims;
- using real bookings, customer records, lead data, child or guardian data, disability, diagnosis, health, family, or safeguarding data;
- activating Analytics or advertising measurement on Production;
- publishing, scheduling, or modifying public external accounts;
- sending outbound WhatsApp, email, SMS, notifications, or automated messages beyond an approved user-initiated flow;
- starting Ads, connecting billing, importing conversions, committing spend, or setting budgets and stop-loss values;
- any irreversible external action.

Silence is not approval. Missing facts stay in the Owner Decision Queue and must never be invented.

## 3. Approved management structure

The Main Project Director coordinates two principal workstreams.

### Workstream A — Stability, engineering, and quality

Scope:

- GitHub, branches, PRs, CI, and code review;
- Vercel Preview and Production evidence;
- verified bugs and regressions;
- booking and conversion-path stability;
- technical SEO, accessibility, mobile behavior, performance, security, privacy implementation boundaries, and rollback readiness;
- evidence-based validation and Quality gates.

### Workstream B — Commercial and launch readiness

Scope:

- approved bilingual content and source or rights evidence;
- SEO and Local SEO account-readiness evidence;
- Privacy, Consent, and Analytics decision readiness;
- publishing readiness and receipts;
- Lead Operations and human follow-up readiness;
- Organic Pilot gate preparation.

Parallel execution is allowed only when the workstreams do not touch the same files, branches, external accounts, database objects, credentials, or approval gates. One implementation PR is preferred at a time. Read-only audits and documentation may proceed in parallel when isolated.

The Main Project Director is the coordination and conflict-resolution point between the workstreams.

## 4. Mandatory continuation rule for every new agent

A new agent must not start from zero and must not rely only on chat history.

Before proposing or changing anything, the agent must read:

1. `AGENTS.md`;
2. `PROJECT_HANDOFF.md`;
3. `PROJECT_STRATEGY_HANDOFF.md`;
4. this authority Handoff;
5. Program Board Issue #54 and the exact current PR, Issue, CI, deployment, or evidence pack relevant to the assigned task.

The agent must then:

- identify the latest verified state rather than assuming the Handoff date is the latest repository state;
- check open PRs and file overlap before starting work;
- state the single next authorized action;
- preserve existing architecture and sources of truth;
- use a small isolated branch and Draft PR for repository changes;
- distinguish assigned, planned, documented, contract-tested, Preview-tested, Production-deployed, and Production-verified states;
- provide evidence for any completion claim;
- remain read-only when the required context, access, or protected approval is missing.

No agent may rebuild, redesign, replace technologies, create a duplicate database, duplicate CRM, duplicate chatbot, duplicate workflow, duplicate content source, or expand the scope merely because a new session has begun.

## 5. Long text, new page, and context-preservation protocol

The owner has instructed that any agent must notify the owner when a text, report, instruction set, audit, plan, decision pack, or generated response becomes long enough that it may be truncated, misunderstood, or lost across chat messages.

When this threshold is reached, the agent must:

1. tell the owner that the material is becoming too long for reliable chat continuation;
2. recommend moving it to a dedicated page, document, GitHub Issue, PR description, or repository Markdown file;
3. give the page or document a clear title and identify it as the continuation source;
4. after the owner sends or opens the page, continue from that source instead of restarting or asking for the same information again;
5. place a brief status summary, decisions, approvals, blockers, evidence, and next action at the top;
6. preserve links, file paths, version identifiers, dates, commit SHAs, PR numbers, and evidence references;
7. state clearly when only part of a source was available and never claim full review of truncated material.

The preferred rule is one authoritative long-form source per major plan or workstream, with chat used for decisions and concise updates rather than as the only durable record.

## 6. Current approved execution direction

The owner has approved the following management direction:

1. preserve the existing Handoff and strategy rather than create a competing strategy;
2. freeze uncontrolled expansion while the verified baseline is established;
3. review and resolve current PR and deployment state before starting unrelated features;
4. classify verified findings as P0, P1, P2, or P3;
5. execute fixes through small isolated PRs with tests, Preview evidence, review, rollback boundaries, and protected approval where required;
6. close Privacy, Consent, measurement, SEO, publishing, lead-follow-up, and Organic Pilot gates in the approved Revenue-First order;
7. begin wider Growth OS modules only after the core revenue and operational foundation is stable and evidenced.

The first management action is to establish a current verified baseline, review the active chatbot and other open PRs, identify overlap and protected gates, and create a prioritized execution queue without merging or deploying automatically.

## 7. Evidence and reporting expectations

After each major phase, the Main Project Director or assigned agent must report:

- the exact scope inspected or changed;
- branch, commit, PR, CI, Preview, and Production identifiers where applicable;
- validation performed and results;
- conflicts or duplicated work found;
- protected actions not performed;
- blockers and Owner Decision Queue items;
- the single next recommended action.

A plan, chat statement, open Issue, agent assignment, branch, or Draft PR alone is not evidence that implementation is complete.

## 8. Change control for this delegation

This delegation remains active until the owner explicitly changes or revokes it.

Any change to the Main Project Director's authority, protected approval boundaries, two-workstream structure, long-text protocol, or new-agent continuation rules must:

1. state the reason;
2. record explicit owner approval and date;
3. update this document and the relevant strategic or operational Handoff;
4. preserve the stricter safety rule when documents conflict until the conflict is resolved.