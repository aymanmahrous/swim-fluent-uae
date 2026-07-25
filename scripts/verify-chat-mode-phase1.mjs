/**
 * Verification script for Chat Mode Phase 1
 * Tests intent detection with various phrasings
 * 
 * Run: node scripts/verify-chat-mode-phase1.mjs
 */

import { detectChatbotIntent, detectMessageLanguage } from "../src/platform/chatbot-engine.ts";

const TEST_CASES = [
  // الأطفال / Kids
  {
    category: "Kids Coaching",
    tests: [
      { msg: "هل يوجد تدريب للأطفال؟", expected: "kids", lang: "ar" },
      { msg: "أريد تدريب أطفالي", expected: "kids", lang: "ar" },
      { msg: "تدريب للأطفال", expected: "kids", lang: "ar" },
      { msg: "هل تقبلون الأطفال؟", expected: "kids", lang: "ar" },
      { msg: "Do you offer kids coaching?", expected: "kids", lang: "en" },
      { msg: "I want coaching for my children", expected: "kids", lang: "en" },
      { msg: "Kids coaching please", expected: "kids", lang: "en" },
    ],
  },
  // السيدات / Ladies
  {
    category: "Ladies Coaching",
    tests: [
      { msg: "هل يوجد تدريب للسيدات؟", expected: "ladies", lang: "ar" },
      { msg: "أريد تدريبًا للسيدات", expected: "ladies", lang: "ar" },
      { msg: "هل توجد حصة مخصصة للنساء؟", expected: "ladies", lang: "ar" },
      { msg: "Do you offer ladies coaching?", expected: "ladies", lang: "en" },
      { msg: "I want ladies coaching", expected: "ladies", lang: "en" },
      { msg: "Women's swimming classes", expected: "ladies", lang: "en" },
    ],
  },
  // الحجز / Booking
  {
    category: "Booking/Assessment",
    tests: [
      { msg: "أريد حجز موعد تقييم", expected: "booking", lang: "ar" },
      { msg: "كيف أطلب حجز موعد؟", expected: "booking", lang: "ar" },
      { msg: "أريد طلب تقييم أولي", expected: "booking", lang: "ar" },
      { msg: "احجز لي موعد", expected: "booking", lang: "ar" },
      { msg: "I want to book an assessment", expected: "booking", lang: "en" },
      { msg: "How do I book?", expected: "booking", lang: "en" },
      { msg: "I want to request an assessment", expected: "booking", lang: "en" },
    ],
  },
];

function runTests() {
  console.log("🧪 Chat Mode Phase 1 - Intent Detection Verification\n");
  console.log("=" + "=".repeat(69));

  let totalTests = 0;
  let passedTests = 0;
  const results = [];

  for (const category of TEST_CASES) {
    console.log(`\n📂 ${category.category}`);
    console.log("-" + "-".repeat(69));

    let categoryPassed = 0;
    let categoryTotal = 0;

    for (const test of category.tests) {
      totalTests++;
      categoryTotal++;

      const detectedIntent = detectChatbotIntent(test.msg);
      const detectedLang = detectMessageLanguage(test.msg, "ar");
      const passed = detectedIntent === test.expected && detectedLang === test.lang;

      if (passed) {
        passedTests++;
        categoryPassed++;
        console.log(`  ✅ "${test.msg}"`);
        console.log(`     → Intent: ${detectedIntent} (${detectedLang})\n`);
      } else {
        console.log(`  ❌ "${test.msg}"`);
        console.log(`     Expected: ${test.expected} (${test.lang})`);
        console.log(`     Got: ${detectedIntent} (${detectedLang})\n`);
        results.push({
          message: test.msg,
          expected: test.expected,
          got: detectedIntent,
        });
      }
    }

    console.log(
      `   Passed: ${categoryPassed}/${categoryTotal} (${Math.round((categoryPassed / categoryTotal) * 100)}%)`
    );
  }

  console.log("\n" + "=".repeat(70));
  console.log(`\n📊 Final Result: ${passedTests}/${totalTests} tests passed`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%\n`);

  if (passedTests === totalTests) {
    console.log("✅ Chat Mode Phase 1 verification PASSED");
    console.log("All intent detection tests passed. Ready for STAGE-07 testing.\n");
    process.exit(0);
  } else {
    console.log("⚠️ Chat Mode Phase 1 verification INCOMPLETE");
    console.log(`${totalTests - passedTests} test(s) failed.\n`);
    if (results.length > 0) {
      console.log("Failed tests details:");
      for (const result of results) {
        console.log(`  - "${result.message}"`);
        console.log(`    Expected: ${result.expected}, Got: ${result.got}`);
      }
    }
    process.exit(1);
  }
}

runTests();
