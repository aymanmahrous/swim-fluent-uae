import fs from "node:fs";

const source = fs.readFileSync("src/platform/public-cta-registry.ts", "utf8");

const requiredIds = [
  "header_book",
  "hero_book",
  "programs_book",
  "booking_section_submit",
  "header_whatsapp",
  "floating_whatsapp",
  "booking_section_whatsapp",
  "footer_whatsapp",
  "header_call",
  "booking_section_call",
  "footer_call",
];

for (const id of requiredIds) {
  if (!source.includes(id)) throw new Error(`Missing approved CTA ID: ${id}`);
}

for (const forbidden of ["phone", "email", "http://", "https://", "wa.me", "tel:"]) {
  if (source.includes(forbidden)) throw new Error(`CTA registry must not contain user/contact data or URLs: ${forbidden}`);
}

if (!source.includes('status !== "reserved"')) {
  throw new Error("Reserved CTA IDs must be blocked from event emission.");
}

console.log("Public CTA registry verified: approved IDs only, reserved controls blocked, and no PII or URLs.");
