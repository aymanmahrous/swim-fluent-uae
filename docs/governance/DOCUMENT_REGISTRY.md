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
| `PROJECT_HANDOFF.md` | CURRENT | OPERATIONAL | Current continuation source; restored non-destructively. |
| `docs/governance/PHASE_NAMESPACE.md` | CURRENT | GOVERNANCE | Canonical GOV and PRODUCT identifiers. |
| `docs/governance/DOCUMENT_REGISTRY.md` | CURRENT | GOVERNANCE | This registry. |
| `docs/governance/GOV_A_READINESS_REPORT.md` | CURRENT | EVIDENCE | GOV-A completion decision. |
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

## Evidence PRs

| PR | Classification | Notes |
|---|---|---|
| #169 | OVERLAPPING / EVIDENCE | Vercel evidence overlaps governance baseline; not a product implementation phase. |
| Documentation/evidence-only merged PR records in the restored Handoff | HISTORICAL | Dated evidence; no current execution authority. |

## Functional and product PRs

| PR | Classification | Notes |
|---|---|---|
| #168 | BLOCKED | Constitution candidate requiring reconciliation/review. |
| #170 | FROZEN | `PRODUCT-CONTENT-BRAIN-VALIDATION`; no migration, provider call, media, publishing, or Production write authorized. |
| #36 | BLOCKED | International phone cutover depends on its database predecessor and must not merge as-is. |
| #46 | DRAFT / BLOCKED | Privacy copy pending owner/legal/provider decisions. |
| #51, #28, #49 | SUPERSEDED | Retained as historical PR evidence only. |

## Directory-level classification

| Scope | Default classification | Rule |
|---|---|---|
| `docs/governance/**` | CURRENT or HISTORICAL as listed | Governance authority is explicit per file. |
| `docs/program/**` | CURRENT-REVIEW-REQUIRED | Operational/program documents remain references; conflicts defer to Constitution/Handoff. |
| `docs/quality/**` | CURRENT-REFERENCE | Quality gates do not authorize Production or external action. |
| `docs/privacy/**` | DRAFT or BLOCKED unless explicitly approved | Copy and decision packs are not legal approval. |
| `docs/seo/**` | CURRENT-EVIDENCE or BLOCKED | Evidence does not authorize external account writes. |
| `docs/content/**` | DRAFT, HISTORICAL, or approved-asset evidence | No scheduling/publishing authority. |
| PR descriptions and comments | HISTORICAL-EVIDENCE | Never substitute for current Handoff authority. |

## Historical instruction rule

Any occurrence of `NEXT_REQUIRED_ACTION`, `Next required action`, `Resume instruction`, or similar wording inside a `HISTORICAL` or `SUPERSEDED` source is non-executable evidence. The current `PROJECT_HANDOFF.md` is the only operational continuation source.

## GOV-A inventory decision

The Constitution, Handoff, evidence PRs, governance documents, operational documents, historical/superseded/draft classes, `CHANGE_SCOPE`, and `NO_EXECUTION_RECEIPT` are now covered by explicit file or directory classifications. Further file-by-file header insertion is a later isolated documentation cleanup and is not required to preserve authority because this registry governs unmodified historical bodies.