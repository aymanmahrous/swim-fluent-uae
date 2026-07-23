# PROJECT HANDOFF

Document status: CURRENT
Authority: OPERATIONAL
Applies to: swim-fluent-uae
Last verified: 2026-07-24 (Asia/Dubai)
Owner: Repository Owner

## Current stage

`STAGE-07-SINGLE-CHANNEL-PILOT (WEBSITE-ONLY): BLOCKED — NO AUTHORIZED WEBSITE PILOT RUNNER`

`SOURCE READINESS: VERIFIED BY REPOSITORY INSPECTION ONLY`

`STAGE-05-N8N-SHADOW-MODE: BLOCKED — NO AUTHORIZED SHADOW RUNNER`

## Authorization

- Owner / Operator: `AYMAN`
- Independent approver: `pixelreel2026`
- Stage 07 retry Target SHA: `38d6b2643cc712c066f7877bf7b8e02c7060a0a4`
- Allowed Environment: `WEBSITE ONLY`
- FREE-SAFE-MODE: `ACTIVE`
- external API calls ceiling: `0`
- CRM and Booking writes ceiling: `0`
- publishing, scheduling and webhooks ceiling: `0`
- paid AI cost ceiling: `0`
- generated images/videos ceiling: `0`
- user-message storage/transmission ceiling: `0`

## Stage 07 retry finding

The retry correctly selected the website as the only channel.

The repository contains a deterministic bilingual chatbot, centralized knowledge and `npm run verify:chatbot-phase1`. Static inspection shows approved intent coverage, Booking Request disclaimers, medical-data warnings, accessibility checks and source checks that forbid browser persistence and network transmission primitives.

No approved local runner, isolated runtime, authorized Preview, executed verifier, browser session or immutable Pilot PASS receipt was available. The website chatbot was not run.

## Intended safe website behavior

- services, approved prices, approved locations and schedules;
- children, adults and ladies routing;
- Booking Request candidate only;
- no automatic availability or booking confirmation;
- bounded clarification and human-handoff notice;
- no storage or transmission of typed messages;
- no API, CRM, Booking or Calendar operation.

## Authoritative documents

- `docs/governance/SAFE_GROWTH_10_STAGE_PROGRAM.md`
- `docs/governance/STAGE_07_CHATBOT_PILOT_REPORT.md`
- `docs/governance/STAGE_06_CHATBOT_SCRIPTED_EVALUATION.md`
- `docs/governance/STAGE_05_N8N_SHADOW_MODE_REPORT.md`

## Safety receipt

- website chatbot runtime executions: `0`;
- source verifier executions: `0`;
- browser/Preview sessions: `0`;
- external/API calls: `0`;
- user messages stored/transmitted: `0`;
- CRM writes: `0`;
- Booking writes: `0`;
- Calendar connections/writes: `0`;
- publishing/scheduling/webhooks: `0`;
- paid AI calls: `0`;
- generated images/videos: `0`;
- Production/Supabase/Storage connections: `0`;
- `main` modifications: `0`.

PR #170 and archived Production-write/AI workflows remain frozen.

## Current safety state

`FAIL-CLOSED / NOT AUTHORIZED FOR STAGE 08`

Stage 07 remains incomplete without a genuine website Pilot PASS receipt. A later retry requires a new Target SHA and an approved isolated/local runner or authorized Preview.