# Publishing Readiness and Organic Pilot Evidence Pack

Date: 2026-07-15 (Asia/Dubai)

Parent: Issue #60

Status: `PUBLISHING_CONTRACTS_EXIST_LIVE_READINESS_UNPROVEN_NO_RELEASE_AUTHORIZED`

This is a read-only evidence and planning pack. It does not schedule, publish, retry, install configuration, boost, advertise, or write to Production.

## Confirmed repository contracts

Current `main` contains:

- a server-side Meta publishing adapter for Instagram and Facebook;
- one publication receipt per content item and platform;
- receipt states for reserved, container-created, published, ambiguous, and failed results;
- service-role-only receipt operations;
- duplicate prevention through the unique content/platform receipt;
- reuse of an already recorded published post ID;
- a mandatory stop when the provider result is ambiguous;
- private signed media delivery to the provider;
- CI verification of these code and database contracts.

These contracts do not prove that the live Meta accounts, permissions, or Production configuration are ready.

## Format limitation affecting Batch A1

The current adapter does not implement multi-image carousel publishing.

- Instagram requires exactly one image or video.
- Facebook supports no more than one image or video.
- `w1_d1_p01`, `w1_d1_p03`, `w1_d3_p07`, and `w1_d5_p13` are multi-image groups and are not compatible with the current automated adapter.
- `w1_d7_p21` is a single approved Arabic image and matches the adapter’s media shape, but it is not authorized for release.

Do not publish one slide from a carousel, flatten it, or substitute another asset without a new reviewed decision.

## Account evidence

Documented evidence exists for the Instagram profile target and Post 1 public URLs on Instagram and Facebook.

Still required before Live readiness:

- Instagram Professional/Business status and ownership evidence;
- canonical Facebook Page URL and Page identity;
- Meta Business ownership and Page–Instagram linkage;
- current publishing permissions;
- controlled server-side configuration and lifecycle evidence;
- environment separation and emergency stop procedure.

A public post URL does not prove current account ownership, permissions, or automation readiness.

## Post status reconciliation

### Post 1

Repository documentation records Post 1 as published on Facebook and Instagram. This is historical publication evidence only.

### Post 2

Last durable internal state:

- Feed scheduled for 2026-07-15 at 20:00 Asia/Dubai;
- Story scheduled for 2026-07-15 at 19:50 Asia/Dubai;
- Facebook and Instagram publication receipts pending.

Public search did not return a reliable Post 2 receipt, and direct Instagram inspection was unavailable to the audit tool.

Current classification:

`POST2_SCHEDULE_RECORDED_ACTUAL_PUBLICATION_UNVERIFIED`

Do not duplicate, reschedule, republish, or mark Published until Planner/account evidence, URLs or screenshots, actual timestamps, and exact asset/caption versions are reconciled.

### Post 3

Post 3 content and Visual Brief remain approved, but its assets are not created, scheduled, or published. Batch A1 does not create or authorize Post 3 assets.

## Publication receipt minimum

Each future platform receipt must preserve:

- content ID and platform/account;
- exact caption version;
- exact asset filename and SHA-256;
- approval and Quality references;
- scheduled/requested and actual timestamps;
- external container/post ID when available;
- public URL or Story screenshot;
- final state and non-sensitive error note;
- confirmation that Boost and Ads are off.

A visible post with a missing receipt is a reconciliation incident, not permission to publish again.

## Ambiguous-state rule

When a provider response is unknown or interrupted:

1. mark the receipt ambiguous;
2. stop all automatic retries;
3. inspect the account and provider IDs;
4. attach an existing post to the receipt when found;
5. retry only after a human confirms that no post was created and the original version remains approved.

## Smallest recommended Organic Pilot

This recommendation is not release approval.

Candidate after every gate passes:

- one single-image Arabic static post;
- exact approved `w1_d7_p21` file and SHA-256;
- Instagram first;
- no cross-posting, Story adaptation, website link, UTM, Boost, or Ads.

Required before launch:

- Post 2 reconciliation;
- verified target account and linkage;
- exact asset-to-caption pairing;
- rights/source and Quality receipts;
- mobile crop review;
- pre-created publication receipt;
- protected human release approval.

Observe immediately, at 30 minutes, 24 hours, and 72 hours. Infrastructure success means one correct post, on one correct account, with the correct media/copy and a durable receipt. Engagement volume is not a first-pilot pass/fail threshold.

Stop further release for a wrong account, duplicate, unexpected cross-post, altered media/copy, missing receipt, unresolved provider result, unsupported crop/format, unapproved claim, or data exposure.

## Final blockers

- live Meta account and linkage evidence;
- canonical Facebook Page identity;
- Instagram Professional status;
- current permissions and controlled configuration evidence;
- Post 2 reconciliation;
- carousel support or a separately reviewed manual procedure;
- exact pilot caption pairing;
- rights, Quality, and human release receipts.

No scheduling or publishing is authorized by this pack.