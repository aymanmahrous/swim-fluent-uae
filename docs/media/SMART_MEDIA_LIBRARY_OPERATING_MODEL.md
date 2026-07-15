# Smart Media Library Operating Model

Last verified: 2026-07-15 (Asia/Dubai)

Status: `SMART_MEDIA_LIBRARY_OPERATING_MODEL_DRAFT_READY_FOR_REVIEW`

## 1. Purpose

This document defines how Coach Ayman's photos and videos are received, inventoried, classified, reviewed, approved, reused and handed to publishing operations without destructive file handling, unsupported claims, rights violations or duplicated sources of truth.

## 2. Systems of record

- Google Drive is the canonical working media library and approval source.
- Dropbox remains an intake/archive source until an exact folder and copy/move plan is approved and verified.
- GitHub stores workflow rules, schemas, evidence receipts and audit documentation, not large binary media files.
- Replit Command Center will later store media metadata and evidence links after Phase 1 persistence and security gates pass.

## 3. Verified Google Drive structure

- `00_UPLOAD_INBOX - صندوق الرفع`
- `01_PHOTOS - الصور`
- `02_VIDEOS - الفيديوهات`
- `03_SWIMMING_SKILLS - مهارات السباحة`
- `04_ADAPTIVE_AQUATICS - السباحة التكيفية`
- `05_AQUATIC_EXERCISE - التمارين المائية`
- `06_CERTIFICATES_AND_CREDENTIALS - الشهادات`
- `07_APPROVED_FOR_CONTENT - معتمد للمحتوى`
- `08_NEEDS_RIGHTS_OR_CONSENT - يحتاج حقوق او موافقة`
- `09_REJECTED_OR_LOW_QUALITY - مرفوض او جودة منخفضة`
- `10_EXPORTS_FOR_PUBLISHING - تجهيزات النشر`
- `11_ARCHIVE - الارشيف`

## 4. Intake workflow

1. New files are uploaded only to `00_UPLOAD_INBOX`.
2. Each file receives a canonical media ID before any classification or relocation.
3. Record source location, original filename, file type, size, dimensions, duration, orientation, capture date when available and duplicate candidates.
4. Create a rights and sensitivity record before recommending public use.
5. Complete content classification and Quality review.
6. Assign exactly one current lifecycle state.
7. Copy or move only after the source, destination, preservation requirement and provider-specific confirmation are known.
8. Keep the original when editing, deriving or exporting a new version.

## 5. Required metadata

### Identity and file facts

- canonical media ID;
- original filename;
- current canonical location;
- source provider and source location;
- MIME type, extension and size;
- width, height, orientation and duration;
- capture or creation date when verified;
- checksum or duplicate-group reference;
- original or derivative relationship.

### Content classification

- media type: photo, video, certificate, document or graphic;
- language where relevant;
- swimming stroke: freestyle, backstroke, breaststroke, butterfly or multi-skill;
- skill: water entry, water confidence, floating, breathing, body position, rotation, kick, arm action, coordination, starts, turns or safety;
- learner context: child, adult, beginner, intermediate, advanced, competitive or unknown;
- educational domain: learn-to-swim, performance coaching, Adaptive Aquatics, general aquatic exercise, event, testimonial, coach profile or internal operations;
- intended use: website, Instagram post, Reel, Story, Facebook, educational library, family report, internal evidence or do-not-publish.

### Rights, consent and sensitivity

- owner or source;
- license and usage limits;
- consent status;
- whether children or other identifiable people appear;
- whether a certificate, private document, personal detail, health-related context or safeguarding concern appears;
- expiry or review date;
- redaction or blur requirement;
- public-use approval status.

### Quality and approval

- technical quality findings;
- visual or audio issues;
- crop, edit, caption or translation requirements;
- factual-claim and credential review;
- Quality status;
- human approval status;
- publishability status;
- approved channels and exclusions;
- publication receipt links after verified publication.

## 6. Lifecycle states

- `UPLOADED_UNREVIEWED`
- `INVENTORIED`
- `CLASSIFIED`
- `NEEDS_EDIT`
- `NEEDS_RIGHTS_OR_CONSENT`
- `QA_FAILED`
- `QA_PASSED_INTERNAL_ONLY`
- `APPROVED_FOR_CONTENT`
- `READY_FOR_PUBLISHING_HANDOFF`
- `PUBLISHED_WITH_RECEIPT`
- `SUPERSEDED`
- `ARCHIVED`
- `REJECTED`

No file may skip directly from upload to publishing.

## 7. Image Quality checklist

- correct orientation and usable resolution;
- sharpness, lighting and subject visibility;
- no accidental cropping or unsafe background detail;
- no misleading before/after presentation;
- no unapproved brand, trademark, price, qualification or service claim;
- no private document or personal data visible;
- no child-sensitive public use without verified rights and consent;
- suitability for the target aspect ratio and mobile display;
- Arabic/English text quality when graphics include text;
- derivative export remains linked to the source.

## 8. Video Quality checklist

- usable resolution, stable framing and acceptable lighting;
- clear audio or a documented caption/voiceover plan;
- duration and orientation suitable for the target use;
- no unsafe demonstration or context presented without qualification;
- no identifying or sensitive information in the frame or audio;
- rights for people, music, location and source material;
- accurate skill label and coaching context;
- subtitles, translation and CTA requirements;
- representative thumbnail or cover-frame selection;
- possible educational chapters, clips or Reels are recorded as derivatives, not replacements for the source.

## 9. Channel recommendation rules

### Website
Use only high-confidence, rights-cleared, brand-aligned media that supports factual service information and mobile performance.

### Instagram and Facebook
Recommend format based on the content itself, not assumed trends. Use verified performance evidence later to refine decisions.

### Educational library
Use clear demonstrations with source, skill, level, limitations, safety context and review date. Internal educational use does not automatically permit public publication.

### Adaptive Aquatics and aquatic exercise
Do not infer diagnosis, disability, health status or age from appearance. Use only verified context supplied through approved records. Avoid therapy, treatment, rehabilitation or guaranteed-outcome claims.

### Certificates and credentials
Keep private by default. Public use requires verification, redaction of personal identifiers, rights review and explicit public-use approval.

## 10. Duplicate and derivative policy

- Never delete duplicates automatically.
- Group likely duplicates and nominate a canonical original.
- Preserve the highest-quality source and rights evidence.
- Every crop, edited image, short clip, Reel, subtitle version or cover image links back to the canonical source.
- Superseded exports remain traceable but cannot be selected as current by default.

## 11. Dropbox policy

- Do not move, delete or reorganize existing Dropbox files automatically.
- Inventory first and identify exact project-relevant source paths.
- Prefer copy when source preservation matters.
- A Dropbox mutation requires confirmed source paths, destination paths, copy-or-move choice and expected outcome.
- Dropbox may be used as upload intake or archive, but Google Drive remains the working approval source unless a later architecture decision changes this.

## 12. Publishing handoff

A media item reaches `10_EXPORTS_FOR_PUBLISHING` only when:

- rights and consent are verified;
- Quality passed;
- approved copy and claims are linked;
- target channel, dimensions, language and CTA are approved;
- Publishing Operations confirms account and receipt readiness;
- a human approves the exact final asset.

Publication status is not complete without a provider receipt or other verified platform evidence.

## 13. Command Center requirements

Future metadata screens should provide:

- Upload Inbox and inventory queue;
- filters by stroke, skill, domain, language, status, rights and channel;
- preview and evidence links;
- duplicate groups and derivative relationships;
- rights/consent decision queue;
- Quality findings and rework tasks;
- content selection and publishing-handoff queue;
- immutable audit events for metadata and approval changes;
- clear distinction between sample records and verified project records.

Implementation remains gated by Command Center Phase 1 persistence and Phase 2 security.

## 14. First operational milestone

After Coach Ayman uploads files to `00_UPLOAD_INBOX`, produce an inventory-only report before changing file locations. The report must include:

- total files by type;
- duplicate candidates;
- unreadable or unsupported files;
- rights/consent unknowns;
- quality risks;
- skill and content categories;
- recommended next review batch;
- items that must remain internal or require owner input.

No publishing, deletion, automatic identity recognition or sensitive-person inference is part of the first milestone.
