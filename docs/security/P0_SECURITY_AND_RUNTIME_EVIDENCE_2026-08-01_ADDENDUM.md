# P0 Security and Runtime Evidence Addendum — 2026-08-01

This addendum corrects and extends the Vercel section of `P0_SECURITY_AND_RUNTIME_EVIDENCE_2026-08-01.md` using evidence that became available after the first artifact commit.

## Secondary Vercel project

- Project ID: `prj_HrvwRKrf0NueBmwjX18ARNRef9Fy`
- Project name: `swim-fluent-uae`
- Framework: `vite`
- PR #241 exact-head deployment: `dpl_78g8y8fsR44BHdfpLNHna9z4bQ2U`
- Commit: `aba5ca8cdc5c1e02136515636cbf7972c5c0b2dd`
- State: `CANCELED`
- Reason boundary: ignored-build behavior; no retry was performed.
- Classification: `SECONDARY_PROJECT_NOT_OFFICIAL_PRODUCTION`

## Official-project PR #241 Preview

- Official project: `prj_4wRrALwNzlU0msHb9pGOsExmNID0`
- Deployment: `dpl_6Bh4hrMAhbmHCd9jsLFhZ7fZPhRf`
- Commit: `aba5ca8cdc5c1e02136515636cbf7972c5c0b2dd`
- State: `CANCELED`
- Classification: `PREVIEW_ONLY_NOT_PRODUCTION`

## Production source of truth unchanged

- Official project: `prj_4wRrALwNzlU0msHb9pGOsExmNID0`
- Official Production deployment: `dpl_BX1Gcs7NEsE6c3KWf8FYaWJJfH9k`
- Production commit: `59f300369c3b8321ceb4bf822d1f13ad19b5776e`
- State: `READY`

## CI receipt after the original artifact commit

For original artifact commit `aba5ca8cdc5c1e02136515636cbf7972c5c0b2dd`:

- CI #794 — SUCCESS
- Public Analytics Foundation #30 — SUCCESS
- Public CTA Events #22 — SUCCESS
- Bilingual Analytics Consent UI #20 — SUCCESS

No deployment, retry, Production write, migration, permission mutation, booking submission, secret access, publishing, scheduling, Analytics activation, Ads, billing, or spend was performed.
