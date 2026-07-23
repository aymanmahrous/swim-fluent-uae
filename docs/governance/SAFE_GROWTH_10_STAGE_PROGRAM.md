# Safe Growth Ten-Stage Program

Document status: CURRENT
Authority: STRATEGIC OPERATING PROGRAM
Applies to: swim-fluent-uae
Last verified: 2026-07-24 (Asia/Dubai)

## Program decision

`SAFE-GROWTH-10-STAGE-PROGRAM: APPROVED — SEQUENTIAL EXECUTION ONLY`

Stage 07 was retried correctly with one selected channel: Website only. Repository evidence supports deterministic, privacy-bounded chatbot source readiness, but no approved runtime, Preview or immutable live-pilot receipt was available. Stage 07 therefore remains incomplete.

## Program roles

- Owner / Operator: `AYMAN`
- Independent approver: `pixelreel2026`
- Repository: `aymanmahrous/swim-fluent-uae`
- Branch: `agent/phase-a-source-of-truth`

## Permanent boundaries

- paid AI provider use: prohibited; cost ceiling `0`;
- generated images: prohibited; ceiling `0`;
- generated videos: prohibited; ceiling `0`;
- external API, Production, Supabase, Storage, publishing, scheduling, webhook, CRM or Booking writes require separate authority;
- user-message storage or transmission is prohibited for this pilot;
- missing or unverified execution evidence fails closed.

## Stages

1. SAFE EXECUTION BASELINE — `COMPLETED`.
2. READ-ONLY INVENTORY — `COMPLETED`.
3. CONVERSION OPERATING MODEL — `COMPLETED`.
4. CONTENT CALENDAR (DRAFT-ONLY) — `COMPLETED`.
5. N8N SHADOW MODE — `BLOCKED — NO AUTHORIZED SHADOW RUNNER`.
6. CHATBOT SCRIPTED EVALUATION — `COMPLETED — DOCUMENTATION ONLY`.
7. SINGLE CHANNEL PILOT — `BLOCKED — WEBSITE SOURCE READY; NO AUTHORIZED WEBSITE PILOT RUNNER`.
8. MULTI-CHANNEL EXPANSION — `BLOCKED`.
9. CRM & BOOKING INTEGRATION — `BLOCKED`.
10. MONTHLY GROWTH OPERATIONS REVIEW — `BLOCKED`.

## Stage 07 website-only retry

- Target SHA: `38d6b2643cc712c066f7877bf7b8e02c7060a0a4`.
- Allowed Environment: `WEBSITE ONLY`.
- The selected channel satisfies the Single Channel rule.
- The repository contains the deterministic bilingual chatbot and `verify:chatbot-phase1` source verifier.
- Static inspection shows nine approved intent families, Booking Request disclaimers, medical-data warnings, accessibility contracts and checks preventing `localStorage`, `sessionStorage`, `fetch(` and `XMLHttpRequest`.
- No runtime, Preview, source verifier, browser session or synthetic pilot execution occurred.
- No live Pilot PASS receipt exists.

Authoritative evidence:

- `docs/governance/STAGE_07_CHATBOT_PILOT_REPORT.md`
- `docs/governance/STAGE_06_CHATBOT_SCRIPTED_EVALUATION.md`
- `docs/governance/STAGE_05_N8N_SHADOW_MODE_REPORT.md`

PR #170 and archived Production-write/AI workflows remain frozen.

## Current program state

`FAIL-CLOSED / NOT AUTHORIZED FOR STAGE 08`

Stage 08 must not begin. A later Stage 07 retry requires a new exact Target SHA and an approved isolated/local runner or explicitly authorized Preview with zero external effects.