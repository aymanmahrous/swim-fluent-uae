# Document Registry

Document status: CURRENT
Authority: GOVERNANCE
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)
Owner: Repository Owner

## Allowed classifications

- `CURRENT`: authoritative operating source.
- `DRAFT`: proposed and not authoritative.
- `BLOCKED`: incomplete because a named dependency or approval is missing.
- `HISTORICAL`: dated evidence only; no executable instruction.
- `SUPERSEDED`: replaced by a named source; no executable instruction.

A registry classification governs a document even when its historical body does not yet contain an inline header.

## Canonical governance and operational documents

| Path | Classification | Authority | Notes |
|---|---|---|---|
| `AGENT_CONSTITUTION.md` | DRAFT | GOVERNANCE | GOV-A candidate; requires later independent review and separate merge decision. |
| `PROJECT_HANDOFF.md` | CURRENT | OPERATIONAL | Current continuation source through GOV-B. |
| `docs/governance/PHASE_NAMESPACE.md` | CURRENT | GOVERNANCE | Canonical GOV and PRODUCT identifiers. |
| `docs/governance/DOCUMENT_REGISTRY.md` | CURRENT | GOVERNANCE | This registry. |
| `docs/governance/PR_REGISTRY.md` | CURRENT | GOVERNANCE | Authoritative PR classifications, risk slots, and dependency order. |
| `docs/governance/GOV_A_READINESS_REPORT.md` | CURRENT | EVIDENCE | GOV-A completion decision. |
| `docs/governance/GOV_B_READINESS_REPORT.md` | CURRENT | EVIDENCE | GOV-B completion decision. |
| `docs/governance/CHANGE_SCOPE.md` | HISTORICAL | EVIDENCE | Records GOV-A scope; contains no action authority. |
| `docs/governance/NO_EXECUTION_RECEIPT_2026-07-23.md` | HISTORICAL | EVIDENCE | Immutable no-execution receipt. |
| `PROJECT_STRATEGY_HANDOFF.md` | CURRENT | STRATEGY | Strategy source, subordinate to stricter safety rules. |
| `docs/program/PROJECT_DIRECTOR_AUTHORITY_AND_AGENT_CONTINUATION_HANDOFF.md` | CURRENT | GOVERNANCE | Delegated-authority reference; cannot override protected gates. |

## Restored and historical Handoffs

| Path/source | Classification | Notes |
|---|---|---|
| `docs/history/PROJECT_HANDOFF_PRE_C7C0F118_FULL.md` | HISTORICAL | Complete byte-for-byte pre-incident Handoff restored from blob `a6738cac...`; any next-action text is evidence only. |
| `PROJECT_HANDOFF.md` at commit `c7c0f118...` | SUPERSEDED | Corrupted 13-line PowerShell instruction file; replaced by current Handoff. |
| Earlier Handoff commits | HISTORICAL | Immutable Git evidence only. |

## Evidence and governance PRs

| PR | Classification | Notes |
|---|---|---|
| #168 | BLOCKED / OVERLAPPING / SUPERSEDED-CANDIDATE | Older Constitution/Handoff scope overlaps the GOV-A source of truth. |
| #169 | OVERLAPPING / HISTORICAL-CANDIDATE / EVIDENCE | Dated Vercel evidence; not a product or deployment authorization. |
| Documentation/evidence-only merged PR records in the restored Handoff | HISTORICAL | Dated evidence; no current execution authority. |

## Functional and product PRs

| PR | Classification | Notes |
|---|---|---|
| #170 | FROZEN / NON-MERGE-READY | `PRODUCT-CONTENT-BRAIN-VALIDATION`; migration and application/AI behavior must be separated later. |
| #36 | BLOCKED / DEPENDENCY / NON-MERGE-READY | International phone cutover depends on its database predecessor and disposable verification. |
| #46 | BLOCKED | Privacy copy pending owner/legal/provider decisions; no publication or implementation authority. |
| #51, #28, #49 | SUPERSEDED | Retained as historical PR evidence only. |

The detailed rationale, risk slots, and dependency sequences are maintained in `docs/governance/PR_REGISTRY.md`.

## Directory-level classification

| Scope | Default classification | Rule |
|---|---|---|
| `docs/governance/**` | CURRENT or HISTORICAL as listed | Governance authority is explicit per file. |
| `docs/program/**` | CURRENT-REVIEW-REQUIRED | Operational/program references defer to Constitution/Handoff on conflict. |
| `docs/quality/**` | CURRENT-REFERENCE | Quality gates do not authorize Production or external action. |
| `docs/privacy/**` | DRAFT or BLOCKED unless explicitly approved | Copy and decision packs are not legal approval. |
| `docs/seo/**` | CURRENT-EVIDENCE or BLOCKED | Evidence does not authorize external-account writes. |
| `docs/content/**` | DRAFT, HISTORICAL, or approved-asset evidence | No scheduling or publishing authority. |
| PR descriptions and comments | HISTORICAL-EVIDENCE | Never substitute for current Handoff authority. |

## Historical instruction rule

Any occurrence of `NEXT_REQUIRED_ACTION`, `Next required action`, `Resume instruction`, or similar wording inside a `HISTORICAL` or `SUPERSEDED` source is non-executable evidence. The current `PROJECT_HANDOFF.md` is the only operational continuation source.

## Governance inventory decision

GOV-A covered the Constitution, Handoff, evidence PRs, governance documents, operational documents, historical/superseded/draft classes, `CHANGE_SCOPE`, and `NO_EXECUTION_RECEIPT`.

GOV-B added the canonical PR Registry and readiness report, froze PR #170, separated evidence from functional scopes, constrained each sensitive domain to one governance slot, and recorded dependency order. Further file-by-file header insertion is later cleanup and cannot change authority.