# Google Business Profile Audit and Decision Pack

Verified: 2026-07-20 (Asia/Dubai)

Status: `READ_ONLY_AUDIT_PREVIEW_NO_LIVE_WRITE`

## Evidence boundary

Owner-supplied evidence confirms only:

- `GBP_PROFILE_EXISTS = true`
- `GBP_DISPLAY_NAME = Relax Fix UAE`
- `GBP_VERIFICATION_VISIBLE = true`
- `GBP_REGION = Abu Dhabi, United Arab Emirates`
- `GBP_LIVE_WRITE_AUTHORIZED = false`

The screenshot does not prove the signed-in owner/manager role or any internal field below. No account login or live edit occurred.

## Audit and proposed values

| Field | Current readable value | Proposed preview | Disposition |
|---|---|---|---|
| Name | Relax Fix UAE | Keep | Owner evidence; verify real-world brand consistency before any write |
| Verification | Visible as verified | Keep | Visible evidence only; management access unverified |
| Region | Abu Dhabi, United Arab Emirates | Keep | Owner evidence |
| Address | Unverified | Do not expose a pool address | Pool venues are Training locations, not branches |
| Business model | Unverified | One eligible service-area/hybrid profile only | Confirm signed-in configuration and eligibility |
| Service areas | Unverified | Abu Dhabi only as the initial candidate | Owner must review actual served cities/areas; no radius or invented areas |
| Primary category | Unverified | Candidate: Swimming instructor | Confirm that the exact category exists in the signed-in picker and accurately describes the core business |
| Secondary categories | Unverified | Candidate: Swimming school only if accurate and available | Use the fewest accurate categories; no keyword categories |
| Website | Unverified | `https://www.relaxfixuae.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp_profile` | Preview only; validate current live link first |
| Booking link | Unverified | Website assessment section with `utm_content=booking` | Use a crawlable first-party page; do not claim instant confirmation |
| Phone | Unverified | `+971551378660` | Compare before write |
| WhatsApp/chat | Unverified | Use only if the signed-in profile exposes a supported chat field | Do not replace the phone or invent a field |
| Hours | Unverified | Sat–Sun 10:00–22:00; Mon–Fri 16:00–21:00, Asia/Dubai | Read current hours and prepare a diff before separate approval |
| Services | Unverified | Children’s small-group coaching; aquatic movement; land-based movement; initial assessment | Avoid diagnosis, therapy and outcome claims |
| Prices | Unverified | AED 450 child; AED 400 sibling child; AED 150 aquatic or land-based movement session | Put in service fields only if supported; GBP description must not focus on prices/promotions |
| Logo/cover/photos | Unverified | Approved brand logo, pool/coaching images with rights and consent receipts | No school logo, identifiable child image, or unapproved venue implication |
| Posts | Unverified | One reviewed bilingual local/update post weekly | `REVIEW_REQUIRED_BEFORE_PUBLISH = true` |
| Reviews/Q&A | Unverified | Genuine post-service request and human-reviewed replies | No incentives, review gating, sensitive details or automatic replies |

## Description preview

Arabic:

> تقدم Relax Fix UAE تدريب السباحة وبناء الثقة في الماء وتحسين التقنية في أبوظبي مع كوتش أيمن. يبدأ المسار بطلب تقييم أولي لمراجعة نقطة البداية والخدمة وموقع التدريب والوقت المناسب حسب التوفر. تتوفر مجموعات صغيرة للأطفال، إضافة إلى جلسات حركة مائية أو برية بصياغة تعليمية غير طبية. مواقع التدريب الحالية: Najda Street وICS Al Falah وICS Khalifa وICS Mushrif. لا يُعد إرسال الطلب تأكيدًا للحجز.

English:

> Relax Fix UAE provides learn-to-swim, water-confidence, and technique coaching in Abu Dhabi with Coach Ayman. The journey starts with an initial assessment request so the learner’s starting point, service, training location and suitable time can be reviewed against availability. Children’s small-group coaching and non-medical aquatic or land-based movement sessions are available. Training locations are Najda Street, ICS Al Falah, ICS Khalifa and ICS Mushrif. A submitted request is not a confirmed booking.

## Measurement preview

- Website link: `utm_source=google&utm_medium=organic&utm_campaign=gbp_profile&utm_content=website`
- Booking link: same campaign with `utm_content=booking`
- Weekly evidence: profile impressions, website clicks, call clicks, direction requests and booking requests when the signed-in Performance view exposes them.
- Reconcile GBP link clicks with consented GA4 aggregate events; never send names, phone numbers, booking references, dates, times or selected locations to Analytics.
- Preserve weekly screenshots/exports and record the exact date range. Do not interpret missing metrics as zero without account evidence.

## Policy-based safeguards

- Google requires accurate real-world representation and the fewest accurate categories: https://support.google.com/business/answer/3038177
- A recurring class at a location the business does not own or have authority to represent is not a separate eligible profile: https://support.google.com/business/answer/13763036
- Service areas should be specific supported areas, not a radius, and businesses without a customer-facing address should remove it: https://support.google.com/business/answer/9157481
- Business links must be valid, relevant and crawlable: https://support.google.com/business/answer/13769188
- Review incentives and review gating are prohibited: https://support.google.com/business/answer/3474122

## Owner action required before any live write

1. Open the signed-in Relax Fix UAE profile and capture the current values for every unverified field.
2. Confirm owner/manager access and business-model eligibility.
3. Approve one consolidated before/after diff.
4. Provide separate authorization for the exact live edits. This pack is not that authorization.
