import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { detectChatbotIntent, detectMessageLanguage } from "../src/platform/chatbot-engine.ts";
import {
  CHATBOT_APPROVED_QUESTIONS,
  CHATBOT_KNOWLEDGE,
} from "../src/platform/chatbot-knowledge.ts";

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
  ["Is there a sibling price?", "pricing"],
  ["ما تكلفة الحصة بالدرهم؟", "pricing"],
  ["I want to book an assessment appointment", "booking"],
  ["Does submitting a booking confirm the appointment?", "booking"],
  ["أريد حجز موعد تقييم للعائلة", "booking"],
  ["Where is the Najda location?", "locations"],
  ["I need the location map link", "locations"],
  ["أين موقع المشرف على الخريطة؟", "locations"],
  ["When are you open?", "schedules"],
  ["What times are available on the weekend?", "schedules"],
  ["ما مواعيد الدوام؟", "schedules"],
  ["I am an adult swimming beginner", "adults"],
  ["How does an adult start coaching?", "adults"],
  ["كيف يبدأ تدريب بالغ؟", "adults"],
  ["I want coaching for my daughter", "kids"],
  ["Can a father submit a request for a child?", "kids"],
  ["أريد تدريب لابني", "kids"],
  ["Do you provide coaching for women?", "ladies"],
  ["How do I request ladies coaching?", "ladies"],
  ["هل يوجد تدريب للنساء؟", "ladies"],
  ["I need to speak to a person on WhatsApp", "contact"],
  ["How do I speak to a staff member?", "contact"],
  ["أريد التواصل مع الفريق", "contact"],
  ["What services do you offer?", "services"],
  ["I want to build confidence in the water", "services"],
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

  const entry = CHATBOT_KNOWLEDGE.find((item) => item.intent === intent);
  assert.ok(entry, `Missing runtime knowledge entry for ${intent}`);
  assert.ok(entry.questions.ar.length >= 8, `Arabic question coverage is incomplete for ${intent}`);
  assert.ok(entry.questions.en.length >= 8, `English question coverage is incomplete for ${intent}`);
}

assert.ok(CHATBOT_APPROVED_QUESTIONS.length >= 144, "Expanded approved question bank is incomplete");
for (const item of CHATBOT_APPROVED_QUESTIONS) {
  assert.ok(item.question.trim().length > 0, "Approved chatbot question must not be empty");
  assert.ok(item.answer.trim().length > 0, "Approved chatbot answer must not be empty");
  assert.equal(
    detectChatbotIntent(item.question),
    item.intent,
    `Approved question does not resolve to ${item.intent}: ${item.question}`,
  );
}

for (const contract of [
  "PUBLIC_PRICING",
  "GENERAL_AVAILABILITY",
  "TRAINING_LOCATIONS",
  "WHATSAPP_DISPLAY",
  "OPERATIONAL_EMAIL",
  "CHATBOT_APPROVED_QUESTIONS",
  "questions:",
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
  `Chatbot Phase 1 verification passed (${intentCases.length} bilingual intent cases + ${CHATBOT_APPROVED_QUESTIONS.length} approved questions + knowledge, privacy, CTA and accessibility contracts).`,
);
