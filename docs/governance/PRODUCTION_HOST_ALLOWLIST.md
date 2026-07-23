# Production Host Allowlist

Document status: CURRENT
Authority: GOVERNANCE
Applies to: swim-fluent-uae
Last reviewed: 2026-07-23 (Asia/Dubai)

## Policy

Deny by default. Hosts are allowlisted for read-only verification only. No host is approved for POST, PUT, PATCH, DELETE, RPC mutation, upload, generation, publication, scheduling or messaging.

| Host | Scope | Allowed operations | Credentials | Status |
|---|---|---|---|---|
| `www.relaxfixuae.com` | Public Production website | HTTPS GET/HEAD for pages, headers, sitemap and public assets | None/public only | ALLOWED READ-ONLY |
| `relaxfixuae.com` | Canonical redirect/root-domain verification | HTTPS GET/HEAD only | None | ALLOWED READ-ONLY |

The former Vercel deployment URL is not a canonical Production allowlist entry. Supabase project hosts, Edge Functions, Storage endpoints, AI providers, Meta/publishing providers, webhooks and admin endpoints are explicitly excluded.

Wildcards are prohibited. Any addition requires exact hostname, owner, data classification, methods, credential scope, timeout, audit receipt, kill switch and independent approval.