# International booking phone test matrix

The automated verification suite covers:

- UAE local mobile format.
- UAE `+971` format.
- UAE `00971` format.
- Egyptian, Saudi, British, Indian, and US valid examples.
- Spaces, hyphens, and parentheses.
- Too-short and too-long input.
- Invalid calling code.
- A number invalid for the selected country.
- Country-code mismatch.
- Duplicate calling code entry.
- Canonical equivalence for duplicate and rate-limit keys.
- Existing UAE normalized values.
- Arabic and English error content.
- Mobile responsive layout contracts.
- Staff full international display, call link, and WhatsApp link.
- Existing WhatsApp booking message phone line.
- Protected ingress, honeypot, elapsed-time, fingerprint, idempotency, and rate-limit contracts.

The request-only Playwright integration tests submit invalid payloads to a local development server. They stop before Supabase ingress and cannot create a booking.
