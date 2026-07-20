import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.PREVIEW_URL;
assert.ok(baseUrl?.startsWith("https://"), "Set PREVIEW_URL to an HTTPS Preview deployment");

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});

const results = [];
try {
  for (const route of ["/", "/en"]) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36",
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      connectionType: "cellular3g",
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    await page.addInitScript(() => {
      window.__rfVitals = { lcp: 0, cls: 0, maxInteraction: 0 };
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        window.__rfVitals.lcp = entries.at(-1)?.startTime ?? window.__rfVitals.lcp;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__rfVitals.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.__rfVitals.maxInteraction = Math.max(
              window.__rfVitals.maxInteraction,
              entry.duration,
            );
          }
        }).observe({ type: "event", buffered: true, durationThreshold: 16 });
      } catch {
        // Event Timing is optional in older browsers; report null below.
      }
    });

    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    const requests = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("request", (request) => requests.push(request.url()));
    page.on("requestfailed", (request) =>
      failedRequests.push(`${request.url()} :: ${request.failure()?.errorText ?? "unknown"}`),
    );

    await page.goto(new URL(route, baseUrl).href, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(2_000);

    const initialExternalIntegrationRequests = requests.filter((url) =>
      /n8n|calendar\.google|googleapis\.com\/calendar/i.test(url),
    );
    const chatbotButton = page.getByRole("button", {
      name: route === "/" ? "فتح المساعد" : "Open assistant",
    });
    const chatbotPresent = (await chatbotButton.count()) === 1;
    if (chatbotPresent) {
      await chatbotButton.click();
      await page
        .getByRole("button", {
          name: route === "/" ? "إغلاق المساعد" : "Close assistant",
        })
        .click();
    }

    const audit = await page.evaluate(() => {
      const visible = (element) => {
        const style = getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden";
      };
      const unnamedButtons = [...document.querySelectorAll("button")].filter(
        (button) =>
          visible(button) && !(button.getAttribute("aria-label") || button.textContent?.trim()),
      ).length;
      const unnamedLinks = [...document.querySelectorAll("a")].filter(
        (link) => visible(link) && !(link.getAttribute("aria-label") || link.textContent?.trim()),
      ).length;
      const missingAlt = [...document.querySelectorAll("img")].filter(
        (image) => !image.hasAttribute("alt"),
      ).length;
      const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
      const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
      return {
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        unnamedButtons,
        unnamedLinks,
        missingAlt,
        duplicateIds,
        h1Count: document.querySelectorAll("h1").length,
        vitals: window.__rfVitals,
      };
    });

    assert.equal(audit.horizontalOverflow, false, `${route}: horizontal overflow`);
    assert.equal(audit.unnamedButtons, 0, `${route}: unnamed visible buttons`);
    assert.equal(audit.unnamedLinks, 0, `${route}: unnamed visible links`);
    assert.equal(audit.missingAlt, 0, `${route}: images without alt`);
    assert.deepEqual(audit.duplicateIds, [], `${route}: duplicate IDs`);
    assert.equal(audit.h1Count, 1, `${route}: expected one h1`);
    assert.equal(consoleErrors.length, 0, `${route}: console errors`);
    assert.equal(pageErrors.length, 0, `${route}: page errors`);
    assert.equal(
      initialExternalIntegrationRequests.length,
      0,
      `${route}: eager Calendar/n8n request`,
    );
    assert.ok(audit.vitals.lcp < 2_500, `${route}: lab LCP exceeds 2.5s`);
    assert.ok(audit.vitals.cls < 0.1, `${route}: lab CLS exceeds 0.1`);

    results.push({
      route,
      viewport: "390x844",
      throttling: "150ms / 1.6Mbps / 4x CPU",
      chatbotPresent,
      audit,
      consoleErrors,
      pageErrors,
      failedRequests,
      requestCount: requests.length,
      duplicateRequestUrls: [...new Set(requests.filter((url, i) => requests.indexOf(url) !== i))],
      initialExternalIntegrationRequests,
    });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ previewUrl: baseUrl, results }, null, 2));
