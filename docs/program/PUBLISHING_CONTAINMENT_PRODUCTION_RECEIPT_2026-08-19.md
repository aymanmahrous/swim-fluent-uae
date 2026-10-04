# RELAX FIX UAE — PUBLISHING CONTAINMENT PRODUCTION RECEIPT

Date: 2026-08-19 (Asia/Dubai)

Status: `PASS_PRODUCTION_CONTAINMENT_APPLIED_AND_VERIFIED`

## Scope

Owner instructed continuation after the protected Production gate for the already-prepared Buffer publisher isolation change.

The Production change was limited to `public.claim_next_publish_job()` in Supabase.

## Change applied

The generic internal publish worker now excludes both social channels selected for Buffer:

```sql
and coalesce(payload->>'platform', '') not in ('facebook', 'instagram')
```

The previous Production definition already excluded Facebook. This change adds Instagram to the same exclusion while preserving all other function behavior and service-role-only execution grants.

## Verification

Direct Production inspection after migration confirmed:

- `claim_next_publish_job()` contains the Facebook + Instagram exclusion.
- A direct claim attempt returned `NO_JOB` / `claimed=false`.
- Legacy social queue rows were not deleted or rewritten.
- 17 Instagram `publish_content` jobs remain preserved in `queued` state.
- There are no currently claimable non-social publish jobs.

## Safety result

- No content item was created, edited, deleted, published, or rescheduled by this migration.
- No Buffer post was created or changed.
- No Meta / Facebook / Instagram account setting changed.
- No credentials, tokens, environment variables, WhatsApp, Analytics, Ads, billing, or spend changed.
- Historical queued Instagram rows remain as evidence.

## Operational decision

`ONE_CHANNEL_ONE_ACTIVE_PUBLISHER`

For the current Growth phase:

`BUFFER_IS_THE_ONLY_INTENDED_SOCIAL_PUBLISHER_FOR_FACEBOOK_AND_INSTAGRAM`

The generic internal publisher must not be re-enabled for Facebook or Instagram without a future explicit architecture decision and duplicate-publication review.

## Repository state

The matching migration is prepared in Draft PR #268:

- `supabase/migrations/20260819024000_isolate_buffer_social_publisher.sql`
- branch: `agent/buffer-publisher-isolation`

Production application is complete, but repository merge / any automatic Vercel Production deployment remains a separate protected repository/deployment action. Do not silently merge solely to clean up history.

## Next safe work

1. Verify the existing Buffer schedule / provider receipts before creating any new post.
2. Create only missing approved Growth posts.
3. Keep Aug 29 and Sep 1 on visual hold until replacement assets pass.
4. Reuse the existing public `buffer-media` storage path; do not introduce another image host.
5. Record Buffer provider IDs / receipts for every created post.
