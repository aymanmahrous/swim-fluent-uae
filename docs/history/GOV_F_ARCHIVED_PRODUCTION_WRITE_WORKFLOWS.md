# Archived Production-Write Workflows — GOV-F

Document status: HISTORICAL
Authority: EVIDENCE ONLY
Applies to: swim-fluent-uae
Archived: 2026-07-23 (Asia/Dubai)

These workflow definitions were removed from the active `.github/workflows/` directory on the governance branch because they can create Production records, use paid AI providers, mutate Storage/Database state, or publish commit statuses. They are not executable from this historical document.

| Former active path | Historical blob SHA | Reason archived |
|---|---|---|
| `.github/workflows/production-booking-smoke.yml` | `27f40b03452e8a1a59f8abdc79e5e5a32dc6791d` | Creates an idempotent Production booking; violates GOV-F read-only Production workflow rule. |
| `.github/workflows/ai-media-e2e.yml` | `affcb03947fff2ffb07f478851c42a9008716ab7` | Creates/deletes Production test data, uses paid AI providers, writes statuses. |
| `.github/workflows/ai-media-current-production-e2e.yml` | `874cbda8809ee616daf5dbec4cb147b4e99e20ae` | Production AI/media writes and temporary staff provisioning. |
| `.github/workflows/ai-media-live-fallback.yml` | `6e8050cda4e421501616bc22905d7661d59fc59a` | Production AI/media fallback writes and temporary staff provisioning. |

The exact historical YAML remains recoverable from Git history and the immutable blob SHAs above. Reintroduction requires a new isolated PR, protected `production-write` or `production-ai-spend` Environment, named independent approval, least-privilege secrets, cost ceilings, cleanup receipts, and explicit authorization. No historical instruction here authorizes execution.