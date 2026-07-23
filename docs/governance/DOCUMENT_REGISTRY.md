# Document Registry

Document status: CURRENT-CANDIDATE
Authority: GOVERNANCE
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)
Owner: Repository Owner

## Classification rules

Allowed statuses: `CURRENT`, `DRAFT`, `BLOCKED`, `HISTORICAL`, `SUPERSEDED`.

- `CURRENT`: authoritative operating source.
- `DRAFT`: proposed and not yet authoritative.
- `BLOCKED`: incomplete because a named dependency or approval is missing.
- `HISTORICAL`: retained as dated evidence; contains no executable next action.
- `SUPERSEDED`: replaced by another named source; contains no executable next action.

## Canonical documents

| Path | Status on this branch | Authority | Notes |
|---|---|---|---|
| `AGENT_CONSTITUTION.md` | DRAFT | GOVERNANCE | Reconciles the governance intent of Draft PR #168 and removes ambiguous bare phase numbers. |
| `PROJECT_HANDOFF.md` | DRAFT | OPERATIONAL | Must reflect the current PR and governance state. |
| `PROJECT_STRATEGY_HANDOFF.md` | CURRENT-REVIEW-REQUIRED | STRATEGY | Remains subordinate to the Constitution where safety rules conflict. |
| `docs/governance/DOCUMENT_REGISTRY.md` | DRAFT | GOVERNANCE | Canonical classification index. |
| `docs/governance/GOV_A_READINESS_REPORT.md` | DRAFT | EVIDENCE | Readiness evidence for governance stage GOV-A. |
| `docs/program/PROJECT_DIRECTOR_AUTHORITY_AND_AGENT_CONTINUATION_HANDOFF.md` | CURRENT-REVIEW-REQUIRED | GOVERNANCE | Must be checked for conflicts with the new phase namespace. |

## Historical-source rule

Repository history before base commit `c7c0f118048e13de606576771edddddcc07f0c7a` remains immutable evidence. Older handoffs and stage documents that conflict with the canonical sources must be classified `HISTORICAL` or `SUPERSEDED` before merge and must not retain an executable `NEXT_REQUIRED_ACTION`.

## Known reconciliation items

- Draft PR #168: governance Constitution and Handoff synchronization.
- Draft PR #169: Vercel evidence; evidence scope must not be treated as a product phase.
- Draft PR #170: Content Brain validation; frozen outside GOV-A and must use `PRODUCT-CONTENT-BRAIN-VALIDATION`.
- `PRODUCT-SEO-READINESS` is a separate product scope and must not share the same phase identifier.

## Pending inventory

A complete Markdown inventory has not been mechanically generated because this governance task forbids running repository scripts. Before GOV-A can be declared complete, a reviewer must confirm every operational/governance Markdown document is listed and classified without executing code.