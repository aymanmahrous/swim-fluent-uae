# Post-Governance Roadmap

Document status: CURRENT
Authority: GOVERNANCE ROADMAP
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)

## After governance

1. Keep `PHASE-3-SAFE-EXECUTION` blocked until a separate explicit order names one exact operation and target SHA.
2. Verify named owners, independent approvers, repository access and Environment separation.
3. Observe successful stable CI contexts on the exact SHA under a separately authorized run.
4. Verify the selected read-only Environment and allowlisted host contain no write credential.
5. Complete `PHASE_3_ACTIVATION_GATE.md` and issue a time-bounded GO or NO-GO receipt.
6. Start only the approved operation; stop at expiry or any gate violation.
7. Record the audit receipt and return to fail-closed state.

## First possible operations

Order of lowest risk:

1. source-only verification;
2. manual `preview-readonly` verification against an exact Preview URL and SHA;
3. separately approved `production-readonly` page/header verification.

None starts automatically. A disposable Migration-chain test is a separate database-only decision and is not part of Phase 3.

## Remains frozen

- PR #170 and all combined Migration/AI scope;
- PR #36 pending database foundation;
- PR #46 pending owner/legal/privacy decisions;
- migrations and Production writes;
- AI text/media generation and spend;
- Storage mutation;
- publishing, scheduling, Meta/provider writes, webhooks and messaging;
- the four Workflows archived by GOV-F;
- repository settings, secrets and PR lifecycle actions without separate authority.

## Separate decisions required

- authorization to run any CI, test, build, Preview or Production-readonly verification;
- activation of Rulesets, required checks, CODEOWNERS or GitHub Environments;
- a database-only Migration PR and disposable test authorization;
- a Feature-only PR after database prerequisites are complete;
- exact AI provider/model/token/cost values or an explicit no-AI decision;
- privacy/legal decisions;
- all Production-write, Storage, publishing, scheduling and messaging work.

No roadmap entry is executable merely because it is documented.