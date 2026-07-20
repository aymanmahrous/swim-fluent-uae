import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { detectChatbotIntent, detectMessageLanguage } from "../src/platform/chatbot-engine.ts";

const [engineSource, knowledgeSource, assistantSource, rootSource, arRoute, enRoute] =
  await Promise.all([
    readFile("src/platform/chatbot-engine.ts", "utf8"),
    readFile("src/platform/chatbot-knowledge.ts", "utf8"),
    readFile("src/components/sales-assistant.tsx", "utf8"),
    readFile("src/routes/__root.tsx", "utf8"),
    readFile("src/routes/index.tsx", "utf8"),
    readFile("src/routes/en.tsx", "utf8"),
  ]);

const intentCases = [
  ["What are your prices?", "pricing"],
  ["How much do lessons cost in AED?", "pricing"],
  ["ما أسعار تدريب الأطفال؟", "pricing"],
  ["I want to book an assessment appointment", "booking"],
  ["أريد حجز موعد تقييم", "booking"],
  ["Where is the Najda location?", "locations"],
  ["أين موقع المشرف على الخريطة؟", "locations"],
  ["When are you open?", "schedules"],
  ["ما مواعيد الدوام؟", "schedules"],
  ["Adult swimming", "adults"],
  ["تدريب للكبار", "adults"],
  ["Kids swimming", "kids"],
  ["تدريب أطفالي", "kids"],
  ["Ladies swimming", "ladies"],
  ["أريد تدريبًا للسيدات", "ladies"],
  ["I need to speak to a person on WhatsApp", "contact"],
  ["أريد التواصل مع الفريق", "contact"],
  ["What services do you offer?", "services"],
  ["ما الخدمات المتاحة؟", "services"],
];

for (const [message, expected] of intentCases) {
  assert.equal(detectChatbotIntent(message), expected, `Intent mismatch for: ${message}`);
}

assert.equal(detectChatbotIntent(""), null);
assert.equal(detectChatbotIntent("unrelated words with no approved answer"), null);
assert.equal(detectMessageLanguage("ما الأسعار؟", "en"), "ar");
assert.equal(detectMessageLanguage("What are the prices?", "en"), "en");
assert.equal(detectMessageLanguage("Where are the training locations?", "ar"), "en");
assert.equal(detectMessageLanguage("12345", "ar"), "ar");

for (const intent of [
  "services",
  "pricing",
  "booking",
  "locations",
  "schedules",
  "adults",
  "kids",
  "ladies",
  "contact",
]) {
  assert.ok(
    knowledgeSource.includes(`intent: "${intent}"`),
    `Missing centralized knowledge for ${intent}`,
  );
}

for (const contract of [
  "PUBLIC_PRICING",
  "GENERAL_AVAILABILITY",
  "TRAINING_LOCATIONS",
  "WHATSAPP_DISPLAY",
  "OPERATIONAL_EMAIL",
  "إرسال الطلب لا يعني أن الموعد أصبح مؤكدًا",
  "Submitting a request does not confirm an appointment",
  "لا ترسل معلومات طبية أو تشخيصية",
  "Do not send medical or diagnostic information",
]) {
  assert.ok(knowledgeSource.includes(contract), `Missing knowledge contract: ${contract}`);
}

for (const contract of [
  "detectChatbotIntent",
  "CHATBOT_QUICK_REPLY_INTENTS",
  "chatbotKnowledgeFor",
  'href={`#${cta === "booking" ? "book" : cta}`}',
  "businessWhatsAppUrl(settings)",
  "relaxfix:conversation-start",
  'role="dialog"',
  'aria-modal="true"',
  'aria-live="polite"',
  'htmlFor="sales-assistant-question"',
  "maxLength={240}",
]) {
  assert.ok(assistantSource.includes(contract), `Missing assistant contract: ${contract}`);
}

for (const forbidden of ["localStorage", "sessionStorage", "fetch(", "XMLHttpRequest"]) {
  assert.ok(
    !`${engineSource}\n${knowledgeSource}\n${assistantSource}`.includes(forbidden),
    `The chatbot must not persist or transmit typed questions: ${forbidden}`,
  );
}

assert.ok(
  !rootSource.includes("DeferredChatbotPreview"),
  "Legacy duplicate chatbot is still mounted",
);
assert.equal(
  (arRoute.match(/<SalesAssistant \/>/g) ?? []).length,
  1,
  "Arabic route must mount exactly one assistant",
);
assert.equal(
  (enRoute.match(/<SalesAssistant \/>/g) ?? []).length,
  1,
  "English route must mount exactly one assistant",
);

console.log(
  `Chatbot Phase 1 verification passed (${intentCases.length} bilingual intent cases + knowledge, privacy, CTA and accessibility contracts).`,
);
