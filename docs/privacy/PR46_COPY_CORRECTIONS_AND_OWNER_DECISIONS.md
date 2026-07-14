# PR #46 COPY CORRECTIONS AND OWNER DECISION REGISTER

Status: **Documentation-only addendum for owner review.**

This file is part of PR #46 and records the exact corrections and unresolved owner decisions that must govern the privacy and consent copy pack before merge or publication.

## 1. Exact copy corrections

### Arabic section 3.2

Replace:

> الجنس والفئة العمرية/العملية المحددة في النموذج

With:

> الجنس وفئة المشارك المحددة في النموذج

The corrected sentence should read:

> الجنس وفئة المشارك المحددة في النموذج، مثل طفل أو طفلة أو بالغ أو من أصحاب الهمم.

### Arabic section 3.19

Replace:

> بيانات جُمعت بصورة صحيحة قبل السحب

With:

> البيانات التي جُمعت قبل سحب الموافقة

The corrected sentence should read:

> سحب الموافقة يوقف القياس المستقبلي وتخزين Attribution المستقبلي وفق التنفيذ المعتمد، لكنه لا يعني تلقائيًا حذف البيانات التي جُمعت قبل سحب الموافقة. آلية أي طلب حذف منفصل تعتمد على السياسة والإجراءات المعتمدة.

### English section 4.19

Replace:

> data lawfully collected before withdrawal

With:

> data collected before withdrawal

The corrected sentence should read:

> Withdrawal will stop future measurement and future attribution persistence according to the approved implementation. It does not automatically mean that data collected before withdrawal is deleted; a separate deletion request will follow the approved privacy procedure.

## 2. Expanded owner decision register

No value below may be invented or assumed. Each item remains blocked until the owner records a decision and, where appropriate, obtains legal review.

| Decision area | Owner decision required | Why it matters | Status |
|---|---|---|---|
| Guardian relationship | Decide whether `full_name` represents the participant, the parent/guardian, or either; decide whether a separate guardian relationship field is required. | The current form supports child categories without a dedicated guardian field. | Owner confirmation required |
| Minor participants | Define minimum age, who may submit a request, when guardian approval is required, and how approval is documented. | The service may involve children and the current draft does not establish an age or guardian procedure. | Owner and legal review required |
| Sensitive data handling | Define whether fear-of-water and participant-category values are treated as restricted operational data; approve access controls and staff handling rules. | These values can be sensitive in context even without medical narrative. | Owner and legal review required |
| Special needs data | Confirm that no diagnosis or medical narrative is requested; decide whether any future field may collect disability, support, accommodation, or health details. | Any expansion requires purpose limitation, data minimization, access, retention, and legal review. | Owner confirmation required |
| Booking retention | Approve how long booking requests remain active, when they are archived, and when they are deleted. | No final retention period is documented. | Owner and legal review required |
| Communications retention | Approve retention for WhatsApp, phone follow-up, and any future email/SMS records. | Communications occur partly outside the website and may be retained by external providers. | Owner and provider confirmation required |
| Authentication and infrastructure retention | Confirm staff/auth log, Vercel log, Supabase log, storage, and backup settings and retention. | Repository code does not prove live account configuration. | Owner/provider confirmation required |
| Consent withdrawal handling | Define the exact future process after withdrawal, including stopping future measurement, clearing future attribution persistence, and handling a separate deletion request. | Withdrawal and deletion are related but distinct processes and must not be overstated. | Owner and legal review required |
| Privacy request handling | Approve contact channel, identity verification, response workflow, exceptions, and deletion completion evidence. | The policy must not promise unsupported timelines or automatic deletion. | Owner and legal review required |
| Staff access | Define which roles can view or update booking data and whether access reviews or audit records are required. | Access should be limited to operational need. | Owner confirmation required |

## 3. Merge and implementation gates

PR #46 must remain Draft and unmerged until:

1. The owner confirms the factual identity and privacy-contact details.
2. The guardian, minor-participant, and sensitive-data decisions above are recorded.
3. Booking, communication, authentication, infrastructure, backup, and deletion retention decisions are approved.
4. Consent-withdrawal and privacy-request handling are operationally defined.
5. Arabic and English copy are checked for parity after the exact corrections above are applied.
6. The owner decides whether UAE-qualified legal review is required before publication.

This addendum does not authorize routes, Consent UI, Analytics, cookies, browser storage, database changes, migrations, Preview tracking, Production tracking, or publication.
