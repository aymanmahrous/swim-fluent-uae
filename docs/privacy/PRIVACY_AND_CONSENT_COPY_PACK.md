# PRIVACY AND ANALYTICS CONSENT COPY PACK

Status: **Draft for owner review — documentation only; no implementation or publication approval**  
Repository baseline: `5ca678a395067e6f00e18a6ce96e9d68501e4f04`  
Strategy: **REVENUE-FIRST PARALLEL LAUNCH**  
Prepared: 2026-07-13 (Asia/Dubai)

> **Legal-review warning:** This is a product and copy draft based on repository evidence and the approved Analytics Measurement Contract. It is not legal advice, does not claim final legal compliance, and must not be published until the owner confirms the marked facts and decides whether external legal review is required.

## 1. Scope and implementation exclusions

This pack prepares reviewable Arabic and English copy for:

- Future Arabic Privacy Policy route: `/privacy`.
- Future English Privacy Policy route: `/en/privacy`.
- Analytics Consent Banner.
- Measurement Preferences control.
- Consent change and withdrawal language.
- Privacy and measurement footer-link labels.

This document does **not** authorize or implement:

- Privacy routes or footer links.
- Consent UI or browser storage.
- `gtag.js`, Google Analytics 4 configuration, or Analytics events.
- Google Tag Manager; GTM is not approved for the initial phase.
- GA4 IDs, environment variables, or feature-flag activation.
- UTM persistence or attribution database fields.
- Cookies, `localStorage`, or `sessionStorage` additions.
- Database changes or migrations.
- Preview or Production tracking.
- Production booking tests or Production activation.

## 2. Read-only data inventory

### 2.1 Classification definitions

- **Confirmed current processing:** Supported by current repository code or database schema.
- **Planned analytics processing:** Approved in the Analytics Measurement Contract but not implemented.
- **Not present:** No supporting repository evidence found in the reviewed scope.
- **Owner confirmation required:** A factual, operational, legal, or retention detail cannot be established safely from the repository alone.

### 2.2 Inventory table

| Item | Classification | Current evidence and limits |
|---|---|---|
| Booking requester full name | Confirmed current processing | Required in `booking_requests.full_name`. |
| Booking requester phone number | Confirmed current processing | Raw and normalized phone values are stored. Current baseline validates UAE mobile format; the deferred international-phone work is outside this pack. |
| Gender | Confirmed current processing | Stored as `Male` or `Female`. |
| Participant category | Confirmed current processing | Stored as `Boy`, `Girl`, `Adult`, or `People of Determination`. |
| Requested area/location | Confirmed current processing | Stores selected location and optional free-text `other_location`. |
| Prior swimming experience | Confirmed current processing | Stored as `swam_before` boolean. |
| Fear of water | Confirmed current processing | Stored as `fear_of_water` boolean; this may reveal a personal condition but is not presented here as a medical diagnosis. |
| Training type | Confirmed current processing | Private, Semi-Private, or Group. |
| Requested date and time | Confirmed current processing | Stored with request status and timestamps. |
| Acceptance of booking terms/disclaimer | Confirmed current processing | `terms_accepted=true` is required. The final wording and legal function of those terms need separate review. |
| Booking request identifier and idempotency key | Confirmed current processing | Internal UUID values are stored for request integrity and duplicate handling; the Analytics Contract prohibits sending booking/database IDs to GA4. |
| Booking status | Confirmed current processing | Pending, contacted, confirmed, declined, or cancelled. |
| Email collected in public booking form | Not present | The current booking schema does not contain a requester-email field. |
| Free-text Notes field in public booking form | Not present | No Notes column is present in the reviewed booking schema. Future addition would require privacy-copy and data-minimization review. |
| Child name separate from requester name | Not present / Owner confirmation required | No dedicated child-name field is present. A requester may nevertheless enter a child’s name in `full_name`; intended use requires owner confirmation. |
| Parent/guardian name separate from participant | Not present / Owner confirmation required | No dedicated guardian field exists. Operational handling for children requires owner confirmation. |
| Medical/disability narrative | Not present as free text | Category may be `People of Determination`; no diagnosis/details field is present. Fear-of-water and category choices can still be sensitive in context. |
| Business identity and coach name | Confirmed current processing/public data | Stored in public Business Settings. |
| Business WhatsApp and public phone | Confirmed current processing/public data | Stored in Business Settings and used in external contact links. |
| Public business email | Confirmed current processing/public data | Stored in Business Settings. Owner must confirm the final published privacy-contact email. |
| Price, currency, duration, timezone, locations, booking availability | Confirmed current processing/public data | Public Business Settings. |
| Social and website URLs | Confirmed current processing where populated | Business Settings supports Instagram, Facebook, TikTok, and website fields; actual populated values may vary. |
| WhatsApp links | Confirmed current processing | External links can open WhatsApp, including a prefilled message after a successful booking request. WhatsApp handles its own service processing under its policies. |
| Telephone links | Partially present / Owner confirmation required | Public phone data exists. Call CTA controls were not present in the Analytics Contract’s reviewed public interface baseline. |
| Vercel hosting/deployment | Confirmed current processing | Repository deployments are connected to Vercel. Exact hosting regions, logs, and retention require provider/account confirmation. |
| Supabase PostgreSQL database | Confirmed current processing | Stores booking requests and Business Settings. |
| Supabase Authentication | Confirmed project capability / staff processing | The repository includes authenticated staff/admin functionality. Exact live user categories, identity fields, and auth-log retention require owner/account confirmation. |
| Supabase Storage | Confirmed project capability | Repository migrations include storage-backed media functionality. Whether public-site visitors’ personal data enters Storage is not established and should not be claimed. |
| Staff access to booking data | Confirmed current processing | Staff read/update workflows exist. Exact role assignments and operational access procedures require owner confirmation. |
| Current first-party cookies | Not present in reviewed application code | No current app use was found. Hosting/auth providers may still set technical cookies; confirm through a live browser/provider review before publication. |
| Current `localStorage` / `sessionStorage` use | Not present in reviewed application code | No current app use was found in repository search. This does not prove that third-party services never use browser storage. |
| Current GA4 / `gtag.js` | Not present | Future only, consent-gated, feature-flagged, and subject to all activation gates. |
| Current Google Tag Manager | Not present and not approved | No GTM in the initial analytics phase. |
| Browser UTM attribution | Planned analytics processing | Future first-touch/latest-touch storage only after consent and approved implementation; 30-day attribution window. |
| Analytics consent preference | Planned analytics processing | Future retention: 180 days; user can change or withdraw earlier. |
| GA4 event/user-associated data | Planned analytics processing | Proposed retention: 14 months, using the lowest practical GA4 option available. |
| GCLID, GBRAID, WBRAID, FBCLID | Not present / prohibited in phase one | Must not be stored in browser attribution, booking requests, or GA4 custom parameters in phase one. |
| Email-delivery provider | Owner confirmation required | No Resend, SendGrid, Postmark, Mailgun, Nodemailer, SMTP, or equivalent provider was confirmed in repository search. |
| Notification provider/workflow | Owner confirmation required | Repository automation capabilities exist, but no specific live booking notification provider should be named without operational evidence. |
| Backups and provider logs | Owner confirmation required | Retention and location cannot be established safely from source code alone. |

### 2.3 Confirmed current booking data fields

The current `booking_requests` schema contains:

- Internal booking UUID.
- Idempotency UUID.
- Full name.
- Raw phone and normalized phone.
- Gender.
- Participant category.
- Selected location and optional other location.
- Whether the participant has swum before.
- Whether the participant is afraid of water.
- Training type.
- Requested date and time.
- Request status.
- Terms-accepted flag.
- Created and updated timestamps.

It does not currently contain requester email, free-text Notes, medical narrative, analytics attribution, or advertising click IDs.

## 3. Arabic Privacy Policy draft

# مسودة سياسة الخصوصية — Relax Fix UAE / Swim Fluent UAE

**تاريخ السريان:** `[OWNER CONFIRMATION REQUIRED — EFFECTIVE DATE]`

## 3.1 مقدمة وهوية الجهة

توضح هذه السياسة بصورة عامة كيف يتعامل موقع Relax Fix UAE / Swim Fluent UAE وخدمة التدريب المرتبطة به مع المعلومات المقدمة عند استخدام الموقع أو إرسال طلب حجز أو التواصل معنا.

الاسم العام النهائي للجهة بالعربية والإنجليزية، والصفة التجارية أو القانونية التي ستُنشر بها هذه السياسة، تحتاج إلى تأكيد المالك:

`[OWNER CONFIRMATION REQUIRED — FINAL PUBLIC/LEGAL ENTITY NAME]`

هذه المسودة لا تمثل إقرارًا نهائيًا بالامتثال لأي نظام قانوني محدد، ويجب مراجعتها واعتمادها قبل النشر.

## 3.2 البيانات التي نجمعها

عند إرسال طلب حجز، قد نجمع البيانات التالية:

- الاسم الكامل الذي يدخله مقدم الطلب.
- رقم الهاتف وصيغة موحدة منه لأغراض التحقق والتواصل ومنع الطلبات المكررة.
- الجنس والفئة العمرية/العملية المحددة في النموذج، مثل طفل أو طفلة أو بالغ أو من أصحاب الهمم.
- المنطقة أو الموقع المطلوب، وأي موقع آخر يكتبه المستخدم عند اختيار «أخرى».
- ما إذا كان المتدرب قد مارس السباحة من قبل.
- ما إذا كان لديه خوف من الماء.
- نوع التدريب المطلوب.
- التاريخ والوقت المطلوبان.
- قبول الإقرار أو شروط إرسال طلب الحجز.
- معلومات تشغيلية داخلية مثل حالة الطلب، ومعرّفات منع التكرار، وتواريخ إنشاء وتحديث السجل.

لا يحتوي نموذج الحجز الحالي على حقل بريد إلكتروني للعميل أو حقل ملاحظات حرة أو حقل مستقل لاسم الطفل أو ولي الأمر. أي تغيير مستقبلي في هذه الحقول يتطلب تحديث هذه السياسة ومراجعة تقليل البيانات.

## 3.3 كيفية جمع البيانات

نجمع المعلومات بصورة مباشرة عندما:

- يملأ المستخدم نموذج طلب الحجز.
- يختار التواصل عبر WhatsApp أو الهاتف.
- يرسل لنا معلومات عبر قناة تواصل خارجية اختار استخدامها.

وقد تُنتج أنظمتنا معلومات تشغيلية ضرورية لإدارة الطلب، مثل حالة الطلب والتوقيت ومعرّف داخلي لمنع الإرسال المكرر.

## 3.4 أغراض الاستخدام

قد نستخدم البيانات للأغراض التشغيلية التالية:

- استلام طلب الحجز ومراجعته.
- التواصل مع مقدم الطلب بشأن الموعد أو الخدمة المطلوبة.
- التحقق من صحة الحقول الأساسية ومنع الطلبات المكررة أو المسيئة.
- إدارة حالة الطلب ومتابعته داخليًا.
- فهم المتطلبات العامة للتدريب، مثل الفئة والخبرة السابقة والخوف من الماء ونوع التدريب.
- تشغيل الموقع وحمايته وتشخيص الأعطال التشغيلية بصورة متناسبة.
- الوفاء بالمتطلبات المحاسبية أو التشغيلية أو النظامية المطبقة، بعد تأكيدها ومراجعتها عند الحاجة.

الأساس القانوني أو التنظيمي الدقيق لكل غرض يجب تحديده في مراجعة قانونية ملائمة قبل النشر. لا تفترض هذه المسودة أساسًا قانونيًا محددًا.

## 3.5 بيانات الحجز والتواصل

إرسال النموذج هو **طلب حجز** وليس تأكيدًا تلقائيًا للموعد. نستخدم الاسم والهاتف وتفاصيل الطلب لمراجعته والتواصل بشأنه.

البريد العام المقترح حاليًا في Business Settings هو `swimmingayman@gmail.com`، ورقم الهاتف العام هو `+971 55 137 8660`. يجب على المالك تأكيد استخدامهما في النسخة المنشورة من السياسة:

`[OWNER CONFIRMATION REQUIRED — PRIVACY CONTACT EMAIL AND PHONE]`

## 3.6 بيانات الأطفال وأولياء الأمور

يمكن أن تتعلق طلبات الحجز بأطفال، لأن النموذج يسمح باختيار فئة طفل أو طفلة. لا يوجد حاليًا حقل منفصل يوضح إن كان الاسم اسم الطفل أو ولي الأمر.

يجب على المالك تحديد:

- الحد الأدنى للعمر الذي يمكنه إرسال الطلب بنفسه.
- متى يجب أن يرسل الطلب ولي أمر أو وصي.
- كيفية توضيح العلاقة بين مقدم الطلب والمتدرب.

`[OWNER CONFIRMATION REQUIRED — CHILD/GUARDIAN PROCESS AND MINIMUM AGE]`

## 3.7 أصحاب الهمم والمعلومات الحساسة

يسمح النموذج باختيار فئة «أصحاب الهمم» ويسأل عن الخوف من الماء والخبرة السابقة. قد تكون هذه المعلومات حساسة بحسب السياق، ولذلك يجب استخدامها فقط بالقدر اللازم لفهم طلب التدريب والاستعداد للتواصل المناسب.

لا يطلب النموذج الحالي تشخيصًا طبيًا أو تفاصيل إعاقة أو ملاحظات صحية حرة. لا ينبغي للمستخدم إدخال معلومات طبية غير مطلوبة عبر حقول أخرى. إذا تقرر جمع بيانات صحية مستقبلًا، فيلزم تصميم غرض واضح وتقليل للبيانات وضوابط وصول واحتفاظ ومراجعة قانونية مستقلة قبل التنفيذ.

## 3.8 WhatsApp والمكالمات والروابط الخارجية

قد يحتوي الموقع على روابط تفتح WhatsApp أو تطبيق الاتصال. عند اختيار المستخدم قناة خارجية، تنتقل المعالجة أيضًا إلى مقدم تلك الخدمة وفق شروطه وسياسة الخصوصية الخاصة به.

قد ينشئ الموقع رسالة WhatsApp مقترحة بعد نجاح طلب الحجز. لا تُرسل الرسالة إلا عندما يختار المستخدم فتح WhatsApp واتخاذ الإجراء داخل الخدمة الخارجية. يجب عدم إرسال محتوى الرسالة المعبأة مسبقًا إلى Analytics.

لا نتحكم في بيانات الحساب أو الجهاز التي قد يجمعها WhatsApp أو مزود الاتصالات بصورة مستقلة.

## 3.9 الاستضافة وقاعدة البيانات ومزودو الخدمة

المزودون المؤكدون من بنية المشروع الحالية هم:

- **Vercel:** لاستضافة ونشر تطبيق الويب والبنية المرتبطة به.
- **Supabase:** لقاعدة البيانات، والمصادقة الخاصة بوصول الموظفين، وبعض قدرات التخزين في المشروع.

قد يعالج هؤلاء المزودون معلومات تقنية وتشغيلية لازمة لتقديم خدماتهم. يجب تأكيد إعدادات الحساب، مناطق المعالجة، السجلات، النسخ الاحتياطية ومدد الاحتفاظ قبل إدراج تفاصيل أكثر تحديدًا.

`[OWNER CONFIRMATION REQUIRED — LIVE SERVICE PROVIDERS, REGIONS, LOGS, BACKUPS]`

لم يتم تأكيد مزود مستقل للبريد الإلكتروني أو تنبيهات طلب الحجز من المستودع. لا ينبغي ذكر أي مزود بالاسم قبل التحقق التشغيلي.

## 3.10 القياس والتحليلات

Analytics غير مفعّل حاليًا في نطاق التطبيق الذي تمت مراجعته.

إذا اعتمد التنفيذ مستقبلًا:

- سيكون المسار الأولي المعتمد هو Google Analytics 4 عبر `gtag.js`.
- لن يُستخدم Google Tag Manager في المرحلة الأولى.
- سيبقى القياس خلف Feature Flag معطل افتراضيًا.
- لن يبدأ GA4 أو إرسال أحداث Analytics قبل موافقة المستخدم الصريحة.
- سيظل الحجز والاتصال وWhatsApp متاحًا عند رفض القياس.
- لن تتضمن أحداث Analytics الاسم أو البريد أو الهاتف أو بيانات الحجز الخام أو الملاحظات أو البيانات الطبية أو معرّفات الحجز وقاعدة البيانات.
- لن يبدأ تشغيل Production إلا بعد اكتمال بوابات التفعيل المعتمدة وموافقة مالك منفصلة.

## 3.11 UTM attribution

بعد موافقة المستخدم وتنفيذ القياس بصورة معتمدة، قد يحتفظ الموقع مستقبلاً بقيم UTM محدودة ومُنظّمة لفهم مصدر الزيارة والحملة، وهي:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

ستكون مدة Browser attribution المعتمدة 30 يومًا. وعند حالة الموافقة `unknown` أو `denied` لن يتم حفظ Attribution في المتصفح في المرحلة الأولى.

## 3.12 Click IDs

في المرحلة الأولى لن نخزن أو نرسل كمعلمات مخصصة:

- GCLID.
- GBRAID.
- WBRAID.
- FBCLID.

لن تضاف هذه القيم إلى طلبات الحجز أو Browser attribution. أي استخدام مستقبلي يحتاج عقدًا منفصلًا ومراجعة خصوصية واحتفاظ ووصول وحذف وموافقة صريحة من المالك.

## 3.13 Cookies وتخزين المتصفح

لم يُعثر في كود التطبيق الحالي على استخدام أولي لـcookies أو `localStorage` أو `sessionStorage` من التطبيق العام.

عند تنفيذ تفضيل القياس مستقبلًا، قد يلزم تخزين اختيار المستخدم لمدة تصل إلى 180 يومًا، وقد يلزم Browser attribution بعد الموافقة لمدة 30 يومًا. يجب أن يحدد التنفيذ التقني نوع التخزين وأسماء المفاتيح وقيمها بصورة موثقة ومحدودة، ولا يجوز بدء Analytics قبل الموافقة.

قد تستخدم خدمات الاستضافة أو المصادقة تقنيات تشغيلية خاصة بها. يجب إجراء فحص حي قبل نشر وصف نهائي شامل للـcookies أو التخزين التقني.

## 3.14 الاحتفاظ بالبيانات

المدد المعتمدة أو المقترحة حاليًا:

- Browser attribution المستقبلي: 30 يومًا.
- تفضيل الموافقة على القياس: 180 يومًا، مع إمكانية تغيير المستخدم لقراره قبل انتهاء المدة.
- احتفاظ GA4 المقترح بالبيانات المرتبطة بالمستخدم والأحداث: 14 شهرًا، مع اختيار أقل مدة عملية متاحة في إعدادات GA4.

لم تعتمد بعد مدد نهائية لطلبات الحجز أو سجلات الموظفين/المصادقة أو مراسلات العمل أو النسخ الاحتياطية أو تنفيذ طلبات الحذف.

`[OWNER CONFIRMATION REQUIRED — BOOKING, AUTH, COMMUNICATION, BACKUP AND DELETION RETENTION]`

## 3.15 مشاركة البيانات ومزودو المعالجة

لا نبيع البيانات الشخصية بحسب غرض هذه المسودة، لكن يجب على المالك تأكيد دقة هذه العبارة قبل النشر:

`[OWNER CONFIRMATION REQUIRED — CONFIRM NO SALE/RENT OF PERSONAL DATA]`

قد تُتاح البيانات لموظفين مخولين أو لمزودي البنية التقنية بالقدر اللازم لتشغيل الخدمة وإدارة طلبات الحجز. يجب تقييد الوصول بحسب الدور والحاجة العملية.

قد يكون الإفصاح مطلوبًا عند وجود التزام قانوني قابل للتطبيق، ويجب التعامل معه بصورة مناسبة ومتناسبة.

## 3.16 النقل الدولي للبيانات

قد تعمل خدمات الاستضافة وقاعدة البيانات أو دعمها من دول أو مناطق مختلفة. لا تحدد هذه المسودة مناطق استضافة أو ضمانات نقل دولي غير مؤكدة. يجب تأكيد إعدادات Vercel وSupabase الفعلية وأي التزامات تعاقدية قبل نشر تفاصيل محددة.

## 3.17 حماية البيانات

نستخدم ضوابط تقنية وتشغيلية موجودة في تصميم النظام، مثل التحقق من الإدخال، ومنع الوصول العام المباشر إلى جدول طلبات الحجز، وصلاحيات وصول الموظفين. ومع ذلك، لا توجد وسيلة نقل أو تخزين مضمونة الأمان بصورة مطلقة، ولا تقدم هذه السياسة ضمانًا أمنيًا مطلقًا أو ادعاء تشفير غير موثق.

يجب على المالك تأكيد إجراءات الوصول والمراجعة والاستجابة للحوادث والنسخ الاحتياطية قبل النشر.

## 3.18 حقوق المستخدم وطلباته

يمكن للمستخدم التواصل لطلب الوصول أو التصحيح أو الحذف أو الاعتراض أو الاستفسار عن استخدام معلوماته، حسب الحقوق والإجراءات التي تنطبق بعد المراجعة القانونية.

لا تعد هذه المسودة بتنفيذ فوري أو مدة استجابة محددة. يجب تحديد قناة الطلب، والتحقق من الهوية، والاستثناءات التشغيلية أو النظامية، والمدة المستهدفة قبل النشر.

`[OWNER CONFIRMATION REQUIRED — PRIVACY REQUEST PROCESS]`

## 3.19 سحب أو تغيير موافقة القياس

عند تنفيذ Measurement Preferences مستقبلًا، يمكن للمستخدم تغيير قرار القياس أو سحبه في أي وقت من تفضيلات القياس.

سحب الموافقة يوقف القياس المستقبلي وتخزين Attribution المستقبلي وفق التنفيذ المعتمد، لكنه لا يعني تلقائيًا حذف بيانات جُمعت بصورة صحيحة قبل السحب. آلية أي طلب حذف منفصل تعتمد على السياسة والإجراءات المعتمدة.

## 3.20 الأطفال

الخدمة قد تتعلق بتدريب أطفال، لكن هذه المسودة لا تحدد بعد عمرًا أدنى أو نموذج موافقة ولي الأمر. يجب اعتماد ذلك قبل النشر وتنفيذ أي تعديلات لازمة في النموذج.

## 3.21 التعديلات على السياسة

قد نحدّث هذه السياسة عند تغير الخدمة أو البيانات أو المزودين أو متطلبات القياس. يجب نشر تاريخ سريان أو آخر تحديث واضح عند اعتماد أي نسخة جديدة. التغييرات الجوهرية في Analytics أو البيانات الحساسة أو مزودي المعالجة تحتاج مراجعة مناسبة قبل التفعيل.

## 3.22 بيانات الاتصال

الاسم: `[OWNER CONFIRMATION REQUIRED — FINAL PUBLIC NAME]`  
البريد: `[OWNER CONFIRMATION REQUIRED — PRIVACY EMAIL]`  
الهاتف: `[OWNER CONFIRMATION REQUIRED — PUBLIC PHONE]`  
العنوان: `[OWNER CONFIRMATION REQUIRED — ADDRESS OR DECISION NOT TO PUBLISH]`

---

## 4. English Privacy Policy draft

# Draft Privacy Policy — Relax Fix UAE / Swim Fluent UAE

**Effective date:** `[OWNER CONFIRMATION REQUIRED — EFFECTIVE DATE]`

## 4.1 Introduction and identity

This policy explains in general terms how the Relax Fix UAE / Swim Fluent UAE website and related coaching service handle information submitted when someone uses the website, sends a booking request, or contacts us.

The final public English and Arabic name and the legal or trading identity under which this policy will be published require owner confirmation:

`[OWNER CONFIRMATION REQUIRED — FINAL PUBLIC/LEGAL ENTITY NAME]`

This draft does not claim final compliance with any specific legal framework and must be reviewed and approved before publication.

## 4.2 Information we collect

When a booking request is submitted, we may collect:

- The full name entered by the requester.
- The phone number and a normalized version used for validation, contact, and duplicate prevention.
- The gender and participant category selected in the form, such as boy, girl, adult, or People of Determination.
- The requested area/location and optional free-text other location.
- Whether the participant has swum before.
- Whether the participant is afraid of water.
- The requested training type.
- The requested date and time.
- Acceptance of the booking-request disclaimer or terms.
- Internal operational information such as request status, duplicate-prevention identifiers, and record timestamps.

The current booking form does not include a customer email field, free-text Notes field, dedicated child-name field, or dedicated guardian-name field. A future change to those fields requires an update to this policy and a data-minimization review.

## 4.3 How information is collected

We collect information directly when a user:

- Completes the booking-request form.
- Chooses to contact us through WhatsApp or a telephone channel.
- Sends information through an external communication channel they choose to use.

Our systems may also generate operational information needed to manage the request, such as its status, timestamps, and an internal duplicate-prevention identifier.

## 4.4 Purposes of use

We may use information for these operational purposes:

- Receiving and reviewing a booking request.
- Contacting the requester about the requested service or time.
- Validating required fields and limiting duplicate or abusive submissions.
- Managing and following up the request internally.
- Understanding general coaching needs, such as participant category, previous experience, fear of water, and training type.
- Operating, protecting, and proportionately troubleshooting the website.
- Meeting applicable operational, accounting, or legal requirements once confirmed and reviewed where necessary.

The exact legal or regulatory basis for each purpose must be determined through suitable legal review before publication. This draft does not assume a specific legal basis.

## 4.5 Booking and contact information

Submitting the form creates a **booking request**, not an automatically confirmed appointment. We use the name, phone number, and request details to review the request and communicate about it.

The public Business Settings currently contain `swimmingayman@gmail.com` and `+971 55 137 8660`. The owner must confirm whether these are the final privacy contact details:

`[OWNER CONFIRMATION REQUIRED — PRIVACY CONTACT EMAIL AND PHONE]`

## 4.6 Children and guardians

Booking requests may relate to children because the form allows the categories Boy and Girl. There is currently no separate field identifying whether the entered full name belongs to the child or a parent/guardian.

The owner must define:

- The minimum age for submitting a request independently.
- When a parent or guardian must submit or approve a request.
- How the relationship between the requester and participant should be recorded.

`[OWNER CONFIRMATION REQUIRED — CHILD/GUARDIAN PROCESS AND MINIMUM AGE]`

## 4.7 People of Determination and sensitive information

The form allows the category People of Determination and asks about fear of water and previous swimming experience. These details may be sensitive in context and should be used only as needed to understand the coaching request and prepare for appropriate contact.

The current form does not request a diagnosis, disability details, medical narrative, or free-text health Notes. Users should not enter unnecessary medical details in other fields. Any future collection of health information requires a separately defined purpose, data minimization, access and retention controls, and legal review before implementation.

## 4.8 WhatsApp, calls, and external links

The website may provide links that open WhatsApp or a telephone application. When a user chooses an external channel, that provider also processes information under its own terms and privacy policy.

The website may prepare a suggested WhatsApp message after a successful booking request. The message is not sent unless the user chooses to open WhatsApp and acts within the external service. The prefilled message must not be sent to Analytics.

We do not control account or device information independently collected by WhatsApp or telecommunications providers.

## 4.9 Hosting, database, and confirmed service providers

Providers confirmed by the current project architecture include:

- **Vercel:** web application hosting and deployment infrastructure.
- **Supabase:** database services, staff authentication, and some project storage capabilities.

These providers may process technical and operational information needed to provide their services. Account configuration, processing regions, logs, backups, and retention must be confirmed before more specific claims are published.

`[OWNER CONFIRMATION REQUIRED — LIVE SERVICE PROVIDERS, REGIONS, LOGS, BACKUPS]`

No separate email-delivery or booking-notification provider was confirmed from the repository. No provider should be named until operationally verified.

## 4.10 Analytics

Analytics is not currently active in the reviewed public application scope.

If a future implementation is separately approved:

- The approved initial path will be Google Analytics 4 through `gtag.js`.
- Google Tag Manager will not be used in the initial phase.
- Measurement will remain behind a disabled-by-default feature flag.
- GA4 and Analytics events will not start before the user gives an affirmative measurement choice.
- Rejecting measurement will not disable booking, contact, calls, or WhatsApp.
- Analytics events will not include names, email addresses, phone numbers, raw booking payloads, Notes, medical details, booking UUIDs, or database IDs.
- Production measurement will not activate until every approved activation gate is complete and the owner gives separate Production activation approval.

## 4.11 UTM attribution

After user consent and an approved implementation, the website may in future retain limited, normalized UTM values to understand visit and campaign source:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

The approved browser-attribution window is 30 days. When consent is `unknown` or `denied`, no attribution persistence will occur in phase one.

## 4.12 Click IDs

Phase one will not store or send as custom parameters:

- GCLID.
- GBRAID.
- WBRAID.
- FBCLID.

These values will not be added to booking requests or browser attribution. Future use requires a separate contract, privacy, retention, access, and deletion review, and explicit owner approval.

## 4.13 Cookies and browser storage

No current first-party use of cookies, `localStorage`, or `sessionStorage` was found in the reviewed public application code.

A future approved implementation may need to retain the measurement preference for up to 180 days and, after consent, browser attribution for 30 days. The implementation must document the exact storage mechanism, key names, and limited values, and Analytics must not start before consent.

Hosting or authentication providers may use their own technical mechanisms. A live browser/provider review is required before publishing a complete final cookie or storage description.

## 4.14 Data retention

Current approved or proposed measurement periods are:

- Future browser attribution: 30 days.
- Measurement preference: 180 days, with the user able to change their choice earlier.
- Proposed GA4 user/event-associated retention: 14 months, selecting the lowest practical option available in GA4.

No final retention period has been approved for booking requests, staff/authentication logs, business communications, backups, or deletion completion.

`[OWNER CONFIRMATION REQUIRED — BOOKING, AUTH, COMMUNICATION, BACKUP AND DELETION RETENTION]`

## 4.15 Sharing and processors

This draft assumes personal data is not sold, but the owner must confirm that statement before publication:

`[OWNER CONFIRMATION REQUIRED — CONFIRM NO SALE/RENT OF PERSONAL DATA]`

Information may be available to authorized staff and infrastructure providers as needed to operate the service and manage booking requests. Access should be limited according to role and operational need.

Disclosure may be required where an applicable legal obligation exists and should be handled appropriately and proportionately.

## 4.16 International data transfers

Hosting, database, or support services may operate from different countries or regions. This draft does not claim specific hosting regions or transfer safeguards that have not been verified. Actual Vercel and Supabase account settings and contractual arrangements must be confirmed before publishing detailed transfer statements.

## 4.17 Data protection

The system design includes technical and operational controls such as input validation, no direct anonymous table access to booking requests, and authenticated staff access. However, no transmission or storage method is guaranteed completely secure, and this policy does not claim absolute security or unverified encryption guarantees.

The owner must confirm access review, incident handling, and backup procedures before publication.

## 4.18 User requests and rights

A user may contact us to ask about access, correction, deletion, objection, or other handling of their information, subject to the rights and procedures that apply after legal review.

This draft does not promise immediate deletion or a fixed response time. The request channel, identity verification, operational/legal exceptions, and target response process must be approved before publication.

`[OWNER CONFIRMATION REQUIRED — PRIVACY REQUEST PROCESS]`

## 4.19 Changing or withdrawing measurement consent

After Measurement Preferences are implemented, a user can change or withdraw their measurement choice at any time through Measurement Preferences.

Withdrawal will stop future measurement and future attribution persistence according to the approved implementation. It does not automatically mean that data lawfully collected before withdrawal is deleted; a separate deletion request will follow the approved privacy procedure.

## 4.20 Children

The service may involve children, but this draft does not yet set a minimum age or guardian-consent procedure. Those decisions must be approved before publication and reflected in the booking flow where necessary.

## 4.21 Policy changes

We may update this policy when the service, data, providers, or measurement design changes. An effective or last-updated date must be displayed for an approved revision. Material changes involving Analytics, sensitive information, or processors require suitable review before activation.

## 4.22 Contact details

Name: `[OWNER CONFIRMATION REQUIRED — FINAL PUBLIC NAME]`  
Email: `[OWNER CONFIRMATION REQUIRED — PRIVACY EMAIL]`  
Phone: `[OWNER CONFIRMATION REQUIRED — PUBLIC PHONE]`  
Address: `[OWNER CONFIRMATION REQUIRED — ADDRESS OR DECISION NOT TO PUBLISH]`

---

## 5. Analytics Consent Banner copy

### 5.1 Arabic

**العنوان:**

القياس اختياري

**الوصف:**

نرغب في استخدام قياس اختياري لفهم كيفية استخدام الموقع وتحسينه. لن يبدأ Analytics قبل موافقتك. يمكنك رفض القياس دون أن يتأثر الحجز أو الاتصال أو WhatsApp، ويمكنك تغيير قرارك لاحقًا.

**الأزرار:**

- قبول القياس
- رفض القياس
- تفضيلات القياس

### 5.2 English

**Title:**

Measurement is optional

**Description:**

We would like to use optional measurement to understand how the website is used and improve it. Analytics will not start before you accept. You can reject measurement without affecting booking, contact, or WhatsApp, and you can change your choice later.

**Buttons:**

- Accept measurement
- Reject measurement
- Measurement preferences

### 5.3 Banner presentation rules

- Acceptance and rejection must be equally clear and accessible.
- Do not make acceptance larger, brighter, preselected, or more urgent in a misleading way.
- Do not use implied consent through scrolling, browsing, or continued use.
- Do not call optional Analytics “necessary” or “essential.”
- Do not use a full-screen consent wall.

## 6. Measurement Preferences copy

### 6.1 Arabic

**العنوان:**

تفضيلات القياس

**المقدمة:**

اختر ما إذا كنت تسمح بالقياس الاختياري. لن يؤثر اختيارك في إمكانية استخدام الموقع أو إرسال طلب الحجز أو التواصل عبر الهاتف أو WhatsApp.

**الفئة 1 — الوظائف الأساسية**

العنوان: الوظائف الأساسية  
الحالة: تعمل دائمًا فقط بالقدر اللازم لتشغيل وظائف الموقع المثبتة فعليًا، مثل إرسال طلب الحجز وحمايته من التكرار. لا تشمل هذه الفئة Analytics.

> قبل التنفيذ يجب تأكيد ما إذا كان أي تخزين متصفح أساسي مطلوبًا فعليًا. لا يجوز إنشاء تخزين أساسي لمجرد أن هذه الفئة موثقة.

**الفئة 2 — قياس Analytics**

العنوان: قياس Analytics  
الحالة الافتراضية قبل القرار: معطل  
الوصف: قياس اختياري قد يستخدم مستقبلًا Google Analytics 4 عبر `gtag.js` فقط بعد الموافقة واكتمال بوابات التفعيل. لن يُستخدم GTM في المرحلة الأولى. وقد يُحفظ Browser attribution المنظم لمدة 30 يومًا بعد الموافقة فقط.

**نص تغيير القرار:**

يمكنك تغيير قرار القياس أو سحبه في أي وقت من تفضيلات القياس.

**الأزرار:**

- حفظ التفضيلات
- قبول القياس
- رفض القياس

### 6.2 English

**Title:**

Measurement Preferences

**Introduction:**

Choose whether you allow optional measurement. Your choice will not affect your ability to use the website, submit a booking request, call, or use WhatsApp.

**Category 1 — Essential functionality**

Title: Essential functionality  
State: Always active only to the extent required for confirmed website functions, such as submitting a booking request and protecting it from duplicates. Analytics is not part of this category.

> Before implementation, confirm whether any essential browser storage is actually required. No storage should be created merely because this category is documented.

**Category 2 — Analytics measurement**

Title: Analytics measurement  
Default before a choice: Off  
Description: Optional measurement may in future use Google Analytics 4 through `gtag.js` only after consent and completion of the activation gates. GTM will not be used in the initial phase. Normalized browser attribution may be retained for 30 days after consent only.

**Change-choice text:**

You can change or withdraw your measurement choice at any time through Measurement Preferences.

**Buttons:**

- Save preferences
- Accept measurement
- Reject measurement

## 7. Consent withdrawal and status messages

### 7.1 Arabic

**بعد قبول القياس:**

تم حفظ اختيارك بالسماح بالقياس. لن يبدأ القياس إلا عندما يكون النظام معتمدًا ومفعّلًا بصورة منفصلة.

**بعد رفض القياس:**

تم حفظ اختيارك برفض القياس. يمكنك الاستمرار في استخدام الموقع والحجز والتواصل وWhatsApp بصورة طبيعية.

**بعد سحب الموافقة:**

تم سحب موافقتك على القياس. سيتوقف القياس المستقبلي وحفظ Attribution المستقبلي وفق الإعداد المعتمد. يمكنك تغيير اختيارك لاحقًا.

**بعد تغيير الاختيار:**

تم تحديث تفضيلات القياس.

### 7.2 English

**After accepting measurement:**

Your choice to allow measurement has been saved. Measurement will start only when the system is separately approved and activated.

**After rejecting measurement:**

Your choice to reject measurement has been saved. You can continue to use the website, booking, contact, and WhatsApp normally.

**After withdrawing consent:**

Your measurement consent has been withdrawn. Future measurement and future attribution persistence will stop according to the approved configuration. You can change your choice later.

**After changing the choice:**

Your Measurement Preferences have been updated.

## 8. Footer and link labels

### Arabic

- سياسة الخصوصية
- تفضيلات القياس

### English

- Privacy Policy
- Measurement Preferences

No separate Terms or Cookie Policy is proposed in this pack. A separate Cookie Policy should be considered only if a later verified storage/cookie inventory makes it necessary. Booking terms/disclaimer wording remains a separate legal-copy question.

## 9. Retention table

### 9.1 Confirmed contract decisions

| Data category | Retention decision | Status |
|---|---:|---|
| Browser UTM attribution | 30 days after a future approved and consented implementation | Approved contract decision; not implemented |
| Measurement consent preference | 180 days, with earlier user change/withdrawal permitted | Approved contract decision; not implemented |
| GA4 user/event-associated data | Proposed 14 months, selecting the lowest practical option available | Approved proposal; not configured |
| Advertising click IDs | No storage in phase one | Approved prohibition |

### 9.2 Unresolved retention decisions

| Data category | Current state |
|---|---|
| `booking_requests` records | `[OWNER CONFIRMATION REQUIRED]` |
| Staff/authentication logs | `[OWNER CONFIRMATION REQUIRED]` |
| Business communications, including WhatsApp/call follow-up | `[OWNER CONFIRMATION REQUIRED]` |
| Infrastructure logs | `[OWNER/PROVIDER CONFIRMATION REQUIRED]` |
| Database/storage backups | `[OWNER/PROVIDER CONFIRMATION REQUIRED]` |
| Deletion-request completion timelines | `[OWNER CONFIRMATION REQUIRED AFTER LEGAL/OPERATIONAL REVIEW]` |

No period is invented for an unresolved category.

## 10. Owner decisions required

1. Confirm the final public and, if applicable, legal/trading name in Arabic and English.
2. Confirm the privacy-contact email; decide whether `swimmingayman@gmail.com` remains appropriate.
3. Confirm the public phone number to include in the policy.
4. Provide a publishable business address or approve a policy of not publishing a street address, subject to legal review.
5. Approve a retention period and archival/deletion rule for `booking_requests`.
6. Define when booking records move from active to archived and who may delete them.
7. Confirm that there is no intended Notes field today; decide whether any future Notes field may contain health, disability, or other special-category details.
8. Define the intended interpretation of `full_name` when the participant is a child: child, guardian, or either.
9. Approve the minimum age and guardian process.
10. Identify all live email, SMS, WhatsApp automation, notification, CRM, or workflow providers, or confirm none are used.
11. Confirm Vercel and Supabase account regions, log settings, backup behavior, and relevant retention where available.
12. Define the process and contact channel for access, correction, deletion, or other privacy requests.
13. Confirm whether personal data is ever sold, rented, or disclosed for another party’s independent marketing.
14. Define staff roles permitted to access booking data and whether access auditing is required.
15. Approve the effective date placeholder.
16. Decide whether external UAE-qualified legal review is required before publication. The recommended answer is **yes** for the final public policy, particularly because the service may involve children and People of Determination.
17. Review the existing booking disclaimer/terms separately; this pack does not validate it as a complete legal consent mechanism.

## 11. Factual and legal risks to review

- **Identity risk:** “Relax Fix UAE / Swim Fluent UAE” may be a brand rather than the complete legal/trading identity required for a public policy.
- **Children risk:** The flow supports child categories without a dedicated guardian relationship or age rule.
- **Sensitive-context risk:** “People of Determination” and fear-of-water selections can reveal sensitive circumstances even without a medical narrative.
- **Retention risk:** Booking, staff/auth, communication, backup, and deletion timelines remain unresolved.
- **Provider risk:** Repository evidence confirms architecture but not every live provider configuration, region, subprocessor, log, or backup setting.
- **Communication risk:** WhatsApp and telephone processing occur partly outside the site and need careful, non-overstated disclosure.
- **Storage-inventory risk:** No current app browser storage was found, but a live inspection is still required before publishing a final cookie/storage statement.
- **Legal-basis risk:** This draft deliberately avoids asserting a final legal basis; legal review must supply appropriate wording.
- **Rights risk:** User rights, identity verification, response timelines, and exceptions must not be promised without a supported process.
- **Security-claims risk:** Do not add claims of guaranteed security, universal encryption, certifications, or immediate deletion without evidence.

## 12. Recommended owner review order

1. **Confirm factual identity and contact details.**
2. **Confirm current providers and operational data flows**, especially email/notifications and staff access.
3. **Decide child/guardian and sensitive-data handling.**
4. **Approve retention and deletion decisions.**
5. **Review the Arabic Privacy draft for factual accuracy and tone.**
6. **Review the English Privacy draft for equivalence.**
7. **Approve Banner and Preferences copy**, checking that accept/reject remain balanced.
8. **Obtain external legal review if required.**
9. Only after final copy approval, authorize a separate implementation PR for routes and Consent UI.
10. Keep Analytics disabled until all Measurement Contract activation gates and a separate Production activation approval are complete.

Final documentation state: `PRIVACY_CONSENT_COPY_PACK_READY_FOR_OWNER_REVIEW`.
