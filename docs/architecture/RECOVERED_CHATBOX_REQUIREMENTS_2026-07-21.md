# Recovered Chatbox Requirements — 2026-07-21

Status: sanitized requirements recovery for Draft PR #152.

## Scope lock

- This document applies only to `aymanmahrous/swim-fluent-uae`.
- No requirement from the recovery archive is to be applied to another repository.
- No credentials, tokens, API keys, cookies, sessions, local paths, or `.env` contents from the archive may be copied into this repository.
- The recovery archive is treated as untrusted historical input, not as an authoritative source of current configuration.

## Recovered user requirements

Two non-secret requirements related to Relax Fix were recovered:

1. Configure the production domain and SEO for `relaxfixuae.com`, and ensure the project is structurally ready for deployment.
2. Provide a complete localized public home implementation using the production domain, SEO coverage, an error boundary, and an attribution/footer signature; also consider an automated ZIP packaging script.

## Adaptation to the retained architecture

The recovered requests were written for an older Next.js project and referenced `src/app/[locale]/page.tsx` and `next.config.js`.

The retained project uses TanStack Start and Vite. Therefore the intent must be mapped to the current architecture rather than copying old code:

| Recovered intent | Current `swim-fluent-uae` implementation | Disposition |
| --- | --- | --- |
| Production domain | `relaxfixuae.com` is already used by the sitemap, robots, SEO source of truth, and verification scripts | Preserve and verify |
| Arabic and English public pages | `/` and `/en` are implemented as localized public routes | Preserve |
| SEO metadata and canonical URLs | Implemented through the current route metadata and `src/platform/public-seo.ts` plus SEO verification scripts | Preserve and validate through CI |
| Error boundary | Root route already defines `errorComponent` | Preserve |
| Footer attribution | Current footer identifies the business and coach; a separate developer signature is not required for security or SEO | Product decision only; do not add automatically |
| ZIP deployment script | Current deployment is repository/CI based, not manual ZIP based | Rejected unless a documented offline distribution requirement appears |
| Environment configuration | Current `.env.example` is the only configuration template allowed in version control | Never import recovered secrets |

## Security finding

The recovery archive contains historical plaintext credentials and environment material embedded in chat history and configuration data.

Required response outside this PR:

- treat all exposed credentials as compromised;
- rotate or revoke them at their respective providers;
- review provider access logs where available;
- do not commit the recovery archive or extracted contents;
- do not reuse any recovered credential in local, Preview, or Production environments.

No credential value is reproduced in this document.

## Accepted project work

The following recovered intent is accepted for `swim-fluent-uae`:

- keep `relaxfixuae.com` as the production canonical domain;
- preserve Arabic/English SEO and sitemap coverage;
- preserve the root error boundary;
- keep deployment configuration repository-driven and reviewable;
- continue enforcing the public/internal route boundary and production-write safety checks in CI.

## Rejected imports

The following recovery content must not be imported:

- `.env.local` or any environment values;
- API/provider keys or Supabase tokens;
- Chatbox license/session data;
- IndexedDB, Local Storage, or Session Storage databases;
- user-specific local filesystem paths;
- Next.js-specific files or configuration;
- manual publish or ZIP scripts that bypass the current CI and review path.

## Decision

The archive contributes requirements evidence only. It is not a source-code donor and is not a configuration source. All implementation remains inside `swim-fluent-uae` and must follow the current TanStack/Vite/Supabase architecture and Draft PR #152 safety boundary.
