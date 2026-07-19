# Publishing Account and Rights Evidence Register — 2026-07-19

Status: `PUBLISHING_EVIDENCE_REGISTER_PARTIALLY_VERIFIED_RELEASE_BLOCKED`

## Account inventory

| Platform | Candidate account | Evidence state | Release state |
|---|---|---|---|
| Instagram | `https://www.instagram.com/relaxfixuae/` | Documented official profile in merged SEO evidence | Requires current login/account-role verification before scheduling or publishing |
| Facebook | Unknown canonical Page URL | A post receipt is not a canonical Page identity | Blocked until canonical Page URL and account access are verified |
| Website | `https://www.relaxfixuae.com/` | Verified canonical Production URL | Website publication remains governed by code/Production gates |
| Google Business Profile | Unknown live verification/account state | External account evidence required | No write or publication action authorized |
| Google Search Console | Unknown live property/account state | External account evidence required | No indexing request or write authorized |

## Batch A1 canonical package

- package: `week1_batch_a1_approved_recovery_pipeline(2).zip`;
- package SHA-256: `6ce142e1624469052f863662d6a962d6a19ece5eb76e7dfba4306b6a8b077c86`;
- visual result: `23 PASS / 0 REVISE`;
- visual approval does not authorize release.

## Required per-asset release evidence

Before any item may be scheduled or published, its release row must include:

- exact asset filename and SHA-256;
- exact Arabic/English/bilingual caption version and hash;
- destination platform and verified account identifier;
- source classification: owner original / licensed / commissioned / generated / other;
- rights evidence location;
- identifiable-person consent state;
- child/minor and guardian consent state when applicable;
- claim review result;
- privacy review result;
- final human release approver and timestamp;
- scheduled/published timestamp only after separate release authorization;
- platform publication receipt URL/ID after publication.

## Current rights state

The repository contains the visual-package approval and design-direction evidence, but the current audit did not locate a complete per-asset rights and consent register that independently proves release readiness for all 23 assets.

Therefore:

- design approval is preserved;
- adaptation, scheduling, and publishing remain blocked;
- no asset is marked `RELEASE_READY` merely because it passed visual QA;
- owner original-photo constraints remain active for Coach Ayman imagery;
- any image containing clients or children requires explicit consent evidence before release.

## Release decision vocabulary

- `VISUAL_APPROVED`: design QA passed only.
- `RIGHTS_PENDING`: source/rights evidence incomplete.
- `CONSENT_PENDING`: identifiable-person or guardian evidence incomplete.
- `ACCOUNT_PENDING`: destination account identity/access not verified.
- `RELEASE_READY`: all pairing, rights, consent, account, claims, privacy, and human approval gates passed.
- `PUBLISHED_VERIFIED`: platform receipt recorded after authorized publication.

Current Batch A1 state: `VISUAL_APPROVED_RIGHTS_CONSENT_ACCOUNT_RELEASE_GATES_PENDING`.
