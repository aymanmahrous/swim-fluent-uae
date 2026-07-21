import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.PREVIEW_URL;
assert.ok(
  baseUrl?.startsWith("https://") || baseUrl?.startsWith("http://127.0.0.1"),
  "Set PREVIEW_URL to an HTTPS Preview deployment or local 127.0.0.1 production preview",
);
const basePreviewUrl = new URL(baseUrl);
const baseOrigin = basePreviewUrl.origin;
const isLocalUncompressedPreview = baseUrl.startsWith("http://127.0.0.1");
const enforcePerformanceBudgets = process.env.ENFORCE_PERFORMANCE_BUDGETS !== "false";

const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_EXECUTABLE_PATH
    ? { executablePath: process.env.CHROME_EXECUTABLE_PATH }
    : {}),
});

let protectedStorageState;
if (basePreviewUrl.searchParams.has("_vercel_share")) {
  const authContext = await browser.newContext();
  const authPage = await authContext.newPage();
  await authPage.goto(basePreviewUrl.href, { waitUntil: "domcontentloaded", timeout: 60_000 });
  protectedStorageState = await authContext.storageState();
  await authContext.close();
}

const results = [];
try {
  for (const route of ["/", "/en"]) {
    const context = await browser.newContext({
      ...(protectedStorageState ? { storageState: protectedStorageState } : {}),
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
      window.__rfVitals = { lcp: 0, lcpElement: null, cls: 0, maxInteraction: 0 };
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const latest = entries.at(-1);
        window.__rfVitals.lcp = latest?.startTime ?? window.__rfVitals.lcp;
        if (latest?.element) {
          window.__rfVitals.lcpElement = {
            tag: latest.element.tagName,
            id: latest.element.id,
            className: String(latest.element.className).slice(0, 180),
            text: latest.element.textContent?.trim().slice(0, 120) ?? "",
            url: latest.url ?? "",
          };
        }
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
    const httpErrors = [];
    const requests = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push({ text: message.text(), sourceUrl: message.location().url });
      }
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("request", (request) => requests.push(request.url()));
    page.on("response", (response) => {
      if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
    });
    page.on("requestfailed", (request) =>
      failedRequests.push(`${request.url()} :: ${request.failure()?.errorText ?? "unknown"}`),
    );

    const routeUrl = new URL(route, baseOrigin);
    await page.goto(routeUrl.href, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(2_000);

    const initialExternalIntegrationRequests = requests.filter((url) =>
      /n8n|calendar\.google|googleapis\.com\/calendar/i.test(url),
    );
    const consentBanner = page.getByRole("region", {
      name: route === "/" ? "خيارات الخصوصية" : "Privacy choices",
    });
    if ((await consentBanner.count()) === 1) {
      await consentBanner.getByRole("button", { name: route === "/" ? "رفض" : "Reject" }).click();
      await consentBanner.waitFor({ state: "hidden" });
    }
    const chatbotButton = page.getByRole("button", {
      name: route === "/" ? "افتح مساعد اختيار البرنامج" : "Open program selection assistant",
    });
    const chatbotPresent = (await chatbotButton.count()) === 1;
    if (chatbotPresent) {
      await chatbotButton.click();
      const dialog = page.locator('section[role="dialog"]');
      await dialog.waitFor({ state: "visible" });
      await dialog
        .getByRole("heading", {
          name: route === "/" ? "مساعد اختيار البرنامج" : "Program selection assistant",
        })
        .waitFor({ state: "visible" });
      await dialog.getByRole("button", { name: route === "/" ? "الأسعار" : "Pricing" }).click();
      await dialog
        .getByText(route === "/" ? "450 درهمًا" : "AED 450", { exact: false })
        .waitFor({ state: "visible" });

      const question = dialog.getByLabel(
        route === "/" ? "أو اكتب سؤالك بالعربية أو الإنجليزية" : "Or ask in Arabic or English",
      );
      await question.fill(route === "/" ? "أين مواقع التدريب؟" : "Do you coach adults?");
      await dialog
        .getByRole("button", {
          name: route === "/" ? "إرسال السؤال" : "Send question",
        })
        .click();
      await dialog
        .getByText(
          route === "/"
            ? "مواقع التدريب الحالية"
            : "Adults can submit an initial assessment request",
          { exact: false },
        )
        .waitFor({ state: "visible" });
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
      const ids = [...document.querySelectorAll("[id]")]
        .map((element) => element.id)
        .filter(Boolean);
      const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
      const heroResource = performance
        .getEntriesByType("resource")
        .find((entry) => entry.name.includes("hero-pool"));
      const navigation = performance.getEntriesByType("navigation")[0];
      const slowResources = performance
        .getEntriesByType("resource")
        .map((entry) => ({
          name: entry.name,
          initiatorType: entry.initiatorType,
          startTime: entry.startTime,
          responseEnd: entry.responseEnd,
          duration: entry.duration,
          transferSize: entry.transferSize,
        }))
        .sort((a, b) => b.responseEnd - a.responseEnd)
        .slice(0, 12);
      const paints = Object.fromEntries(
        performance.getEntriesByType("paint").map((entry) => [entry.name, entry.startTime]),
      );
      return {
        url: location.href,
        title: document.title,
        bodyTextStart: document.body.innerText.slice(0, 180),
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        unnamedButtons,
        unnamedLinks,
        missingAlt,
        duplicateIds,
        h1Count: document.querySelectorAll("h1").length,
        paints,
        navigation: navigation
          ? {
              responseStart: navigation.responseStart,
              responseEnd: navigation.responseEnd,
              domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
              loadEventEnd: navigation.loadEventEnd,
            }
          : null,
        heroResource: heroResource
          ? {
              startTime: heroResource.startTime,
              responseStart: heroResource.responseStart,
              responseEnd: heroResource.responseEnd,
              duration: heroResource.duration,
              transferSize: heroResource.transferSize,
            }
          : null,
        slowResources,
        vitals: window.__rfVitals,
      };
    });

    assert.equal(
      new URL(audit.url).host,
      new URL(baseUrl).host,
      `${route}: navigation left the application host (deployment protection or redirect)`,
    );

    const appConsoleErrors = consoleErrors.filter(({ sourceUrl }) =>
      sourceUrl.startsWith(baseOrigin),
    );
    const appHttpErrors = httpErrors.filter((entry) => entry.includes(new URL(baseUrl).host));
    if (
      consoleErrors.length ||
      pageErrors.length ||
      failedRequests.length ||
      httpErrors.length ||
      (enforcePerformanceBudgets && !isLocalUncompressedPreview && audit.vitals.lcp >= 2_500) ||
      audit.vitals.cls >= 0.1
    ) {
      console.error(
        JSON.stringify(
          { route, audit, consoleErrors, appConsoleErrors, pageErrors, failedRequests, httpErrors },
          null,
          2,
        ),
      );
    }

    assert.equal(audit.horizontalOverflow, false, `${route}: horizontal overflow`);
    assert.equal(audit.unnamedButtons, 0, `${route}: unnamed visible buttons`);
    assert.equal(audit.unnamedLinks, 0, `${route}: unnamed visible links`);
    assert.equal(audit.missingAlt, 0, `${route}: images without alt`);
    assert.deepEqual(audit.duplicateIds, [], `${route}: duplicate IDs`);
    assert.equal(audit.h1Count, 1, `${route}: expected one h1`);
    assert.equal(appConsoleErrors.length, 0, `${route}: application console errors`);
    assert.equal(pageErrors.length, 0, `${route}: page errors`);
    assert.equal(appHttpErrors.length, 0, `${route}: application HTTP errors`);
    assert.equal(
      initialExternalIntegrationRequests.length,
      0,
      `${route}: eager Calendar/n8n request`,
    );
    if (enforcePerformanceBudgets && !isLocalUncompressedPreview) {
      assert.ok(audit.vitals.lcp < 2_500, `${route}: lab LCP exceeds 2.5s`);
    }
    assert.ok(audit.vitals.cls < 0.1, `${route}: lab CLS exceeds 0.1`);
    if (enforcePerformanceBudgets) {
      assert.ok(
        !audit.vitals.maxInteraction || audit.vitals.maxInteraction < 200,
        `${route}: observed interaction exceeds 200ms`,
      );
    }

    results.push({
      route,
      viewport: "390x844",
      throttling: "150ms / 1.6Mbps / 4x CPU",
      performanceBudgetsEnforced: enforcePerformanceBudgets,
      chatbotPresent,
      audit,
      consoleErrors,
      appConsoleErrors,
      pageErrors,
      failedRequests,
      httpErrors,
      requestCount: requests.length,
      duplicateRequestUrls: [...new Set(requests.filter((url, i) => requests.indexOf(url) !== i))],
      initialExternalIntegrationRequests,
      lcpThresholdEvaluated: !isLocalUncompressedPreview,
    });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ previewUrl: baseUrl, results }, null, 2));
