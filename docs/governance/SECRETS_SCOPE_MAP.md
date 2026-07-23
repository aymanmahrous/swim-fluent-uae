# Secrets Scope Map

Document status: CURRENT
Authority: GOVERNANCE
Applies to: swim-fluent-uae
Last reviewed: 2026-07-23 (Asia/Dubai)

No secret values are recorded here. Source review found hostnames and secret references but no committed secret value. GOV-F did not query GitHub Environment secret inventories.

| Secret class | Allowed Environment | Capability | Allowed workflow level | Status |
|---|---|---|---|---|
| Public website/Preview URL | `preview-readonly` or public configuration | Read public pages/assets | Preview/source | ALLOWED non-secret |
| Supabase URL + publishable/anon-role key | Local/Preview only where browser-safe | Public/auth/read capability only | Source/Preview | BLOCKED pending exact scope verification |
| Production read-only credential | `production-readonly` only | Read-only verification | `verify:production-readonly` | Optional; no write grant allowed |
| Supabase service-role/database credential | `production-write` only | Database/RPC/admin writes | No active Workflow after GOV-F archive | BLOCKED |
| AI provider key/OIDC exchange | `production-ai-spend` only | Paid generation/provider jobs | No active Workflow after GOV-F archive | FROZEN |
| Storage write credential | Dedicated protected write environment | Upload/update/delete | No active Workflow | BLOCKED |
| Meta/publishing/webhook token | Dedicated publishing environment | External publication/message | No active Workflow | BLOCKED |
| Disposable database credential | Disposable/local Workflow only | Isolated migration testing | `test:integration:disposable` | Definition only; execution blocked |
| GitHub token | Ephemeral runner token, minimum permissions | Checkout/artifact/status only | Normalized CI | GitHub-managed; no value committed |

`preview-readonly` and `production-readonly` must never contain service-role, provider, Storage-write, publishing or webhook credentials. The archived Production-write and AI workflows no longer occupy `.github/workflows/` on this branch.