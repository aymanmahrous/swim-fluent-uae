import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile("public/manifest.webmanifest", "utf8"));
const serviceWorker = await readFile("public/service-worker.js", "utf8");
const rootRoute = await readFile("src/routes/__root.tsx", "utf8");
const offlinePage = await readFile("public/offline.html", "utf8");

function pngDimensions(buffer) {
  assert.equal(buffer.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(buffer.subarray(12, 16).toString("ascii"), "IHDR");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

assert.equal(manifest.id, "/");
assert.equal(manifest.start_url, "/");
assert.equal(manifest.scope, "/");
assert.equal(manifest.display, "standalone");
assert.equal(manifest.theme_color, "#0b1f3a");
assert.ok(manifest.icons.some((entry) => entry.src === "/pwa-icon-192.png" && entry.sizes === "192x192"));
assert.ok(manifest.icons.some((entry) => entry.src === "/pwa-icon-512.png" && entry.sizes === "512x512" && entry.purpose.includes("maskable")));
assert.ok(!manifest.shortcuts || manifest.shortcuts.every((entry) => !["/staff", "/os", "/admin"].includes(entry.url)));

assert.deepEqual(pngDimensions(await readFile("public/pwa-icon-192.png")), { width: 192, height: 192 });
assert.deepEqual(pngDimensions(await readFile("public/pwa-icon-512.png")), { width: 512, height: 512 });
assert.deepEqual(pngDimensions(await readFile("public/apple-touch-icon.png")), { width: 180, height: 180 });

assert.match(rootRoute, /rel: "manifest", href: "\/manifest\.webmanifest"/);
assert.match(rootRoute, /rel: "apple-touch-icon", href: "\/apple-touch-icon\.png"/);
assert.match(rootRoute, /name: "apple-mobile-web-app-capable", content: "yes"/);
assert.match(rootRoute, /navigator\.serviceWorker\.register\("\/service-worker\.js"/);

for (const privatePrefix of ["/api", "/staff", "/os", "/admin"]) {
  assert.match(serviceWorker, new RegExp(`"${privatePrefix}"`));
}
assert.match(serviceWorker, /key\.startsWith\(CACHE_PREFIX\) && key !== CACHE_VERSION/);
assert.doesNotMatch(serviceWorker, /filter\(\(key\) => key !== CACHE_VERSION\)/);
assert.match(serviceWorker, /request\.method !== "GET"/);
assert.match(serviceWorker, /url\.origin !== self\.location\.origin \|\| isPrivatePath\(url\.pathname\)/);
assert.match(serviceWorker, /request\.mode === "navigate"/);
assert.match(serviceWorker, /caches\.match\(OFFLINE_URL\)/);
assert.doesNotMatch(serviceWorker, /cache\.put\(/);
assert.doesNotMatch(serviceWorker, /addEventListener\("(push|sync|notificationclick)"/i);

assert.match(rootRoute, /const PWA_ENABLED = false/);
assert.match(rootRoute, /registration\.unregister\(\)/);
assert.match(rootRoute, /key\.startsWith\(PWA_CACHE_PREFIX\)/);
assert.match(rootRoute, /updateViaCache: "none"/);
assert.match(rootRoute, /pwaRollbackEvidence/);

assert.match(offlinePage, /لا يوجد اتصال بالإنترنت/);
assert.match(offlinePage, /You are offline/);
assert.match(offlinePage, /name="robots" content="noindex,nofollow"/);

console.log("Privacy-safe PWA rollback observation contracts passed.");
