# PWA Owner-Attested Device Gate Receipt

Last verified: 2026-07-30 11:35 Asia/Dubai

Status: `PWA_DEVICE_GATE_OWNER_ATTESTED_PASS_DOCUMENTATION_RISK_ACCEPTED`

Evidence level: `OWNER_ATTESTATION_ONLY_NO_SCREENSHOT_RECEIPT`

## Owner statement

A manual PWA test was performed on a real Android phone belonging to a friend of the owner. The owner personally witnessed the test and confirmed the required observations.

No screenshot or screen recording is available because the Android device was not owned by the owner. The owner explicitly waived the media-receipt requirement and accepted the remaining documentation risk.

Residual documentation risk accepted by owner because the Android device belonged to a third party and no media receipt was retained.

## Android observations attested by the owner

- installation from Chrome / Install App;
- launch from the home-screen icon;
- launch in standalone mode rather than a normal browser tab;
- correct application name, icon and Start URL;
- successful close and reopen;
- approved public offline page behavior;
- Staff, OS and sensitive routes were not made available from CacheStorage;
- no false booking-success state appeared while offline.

## iPhone observations attested by the owner

- Add to Home Screen from Safari;
- launch from the home-screen icon;
- correct application name, icon and Start URL;
- successful close and reopen.

## Evidence boundaries

This receipt must not be described as any of the following:

- screenshot verified;
- screen recording verified;
- independent QA verified;
- automated device verification.

The correct result classification is:

- `OWNER_WITNESSED_MANUAL_DEVICE_TEST_PASS`
- `OWNER_ATTESTATION_ONLY_NO_SCREENSHOT_RECEIPT`

## Administrative decision

The device gate may be treated as a conditional pass based on the owner's witnessed manual test and explicit acceptance of the residual documentation risk.

This decision does not authorize merge or Production promotion. PR #213 must still pass a separate final technical review covering current-main compatibility, CI, Preview behavior, privacy-safe caching, rollback and exact changed-file scope.