# GitHub Rulesets Design

Document status: CURRENT
Authority: GOVERNANCE
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)

## Scope and truth boundary

This is a branch-only design. It does not prove that Rulesets or Branch Protection are active on `main`. Activation requires a later explicit repository-settings action and a settings receipt.

## Proposed `main` ruleset

| Control | Required design |
|---|---|
| Required pull request | Every change to `main` must arrive through a PR; direct pushes are blocked. |
| Required approvals | Minimum 1 independent approval; minimum 2 for migrations, auth, AI, media, publishing, secrets, Production workflows, privacy, or governance authority files. |
| Code-owner review | Required for every path matched by `.github/CODEOWNERS`. |
| Dismiss stale approvals | Enabled after any head-SHA change. |
| Review after last push | Require approval from someone other than the last pusher. |
| Required conversation resolution | All review threads and conversations must be resolved. |
| Required checks | Existing CI may be observed, but GOV-E must define stable source, supply-chain, typecheck, test, build and environment-verification check names before enforcement. |
| Force push | Blocked for all users and automation. |
| Branch deletion | Blocked. |
| Bypass | No routine bypass. Emergency bypass requires Repository Owner plus Independent Repository Approver, an incident receipt, rollback owner and retrospective review. |
| Merge policy | Use merge commits to preserve PR/audit history; no squash/amend/history rewrite for protected governance or release work. |
| Linear history | Not required while merge commits are the audit-preserving standard. Rebase/force-push of published branches remains prohibited. |
| Required deployments | Production-write and AI-spend checks may later require protected Environment approval; not activated in GOV-D. |

## Sensitive-path escalation

Workflow, migration, auth, AI, booking, verification-script, privacy, Constitution, Handoff, CODEOWNERS and governance changes require Code Owner review and an approver separate from author/operator.

## Emergency policy

Emergency bypass is only for active incident containment. Record reason, actor, SHA, time, affected environment, rollback owner, verification and unresolved effects. It must not be used to bypass failing checks or missing approvals.

## Activation gate

Verify CODEOWNERS access, stable check names, admin enforcement, bypass actors, and settings evidence before enabling. Confirm that manual protected Production workflows remain operable only through intended Environment gates.
