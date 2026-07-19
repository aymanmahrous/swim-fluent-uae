# Batch A1 Publishing Readiness Pack V1 — 2026-07-19

Status: `BATCH_A1_PUBLISHING_READINESS_PACK_READY_NOT_AUTHORIZED`

## Canonical visual package

- Archive: `week1_batch_a1_approved_recovery_pipeline(2).zip`
- SHA-256: `6ce142e1624469052f863662d6a962d6a19ece5eb76e7dfba4306b6a8b077c86`
- Visual QA: `23 PASS / 0 REVISE`
- Documentation merge: PR #120

This pack prepares release verification only. It does not authorize scheduling or publishing.

## Asset-to-caption pairing register

For each of the 23 approved assets record before release:

- exact filename;
- file SHA-256;
- post/day identifier;
- slide sequence and total;
- final Arabic caption version/hash;
- final English caption version/hash when used;
- CTA identifier;
- target platform and format;
- accessibility/alt-text copy;
- owner release decision;
- reviewer and review date.

Pairing status defaults to `PENDING` until the exact caption and asset hashes are recorded together.

## Rights and source register

For every photo, logo, illustration, font, template, and generated component record:

- source/owner;
- original reference;
- usage right or permission evidence;
- restrictions;
- person/child consent requirement;
- AI-generated or edited status;
- reviewer;
- decision: `APPROVED / REVIEW_REQUIRED / BLOCKED`.

Missing rights evidence blocks release even when visual QA passed.

## Content verification

Confirm that each post contains no unapproved:

- medical, therapeutic, diagnostic, rehabilitation, adaptive-specialization, or emergency claim;
- credential, years, founder/relationship, price, discount, offer, location, hours, testimonial, or guaranteed result;
- modified or generated Coach Ayman face;
- child/client image without verified consent;
- unsupported contact or booking information.

## Account readiness

Before release verify separately:

- exact Facebook/Instagram account identity;
- owner/admin access;
- platform connection status;
- page/profile naming and contact details;
- account security and recovery method;
- no conflicting scheduled content;
- no accidental cross-post to an unrelated account.

## Human release checklist

A human approver must confirm:

1. canonical asset and hash;
2. exact caption and hash;
3. rights and consent evidence;
4. platform/account identity;
5. date/time and timezone;
6. CTA/link/UTM when applicable;
7. no prohibited claims;
8. final mobile preview;
9. explicit release decision.

## Publication receipt template

After any later authorized release record:

- platform;
- account;
- post URL/ID;
- published timestamp and timezone;
- asset hash;
- caption hash;
- screenshot/evidence reference;
- actor;
- result;
- deviation or incident notes.

## Stop conditions

Stop release when any asset/caption mismatch, uncertain right, consent gap, wrong account, unexpected crop, broken Arabic, incorrect CTA/link, duplicate post, platform ambiguity, or unsupported claim is found.

## Explicit exclusions

No scheduling, publishing, account connection, credential entry, external message, analytics activation, Ads action, Production write, paid spend, adaptation, or Batch A2 authorization is granted.