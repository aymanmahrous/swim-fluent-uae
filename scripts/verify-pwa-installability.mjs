import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile("public/manifest.webmanifest", "utf8"));
const serviceWorker = await readFile("public/service-worker.js", "utf8");
const rootRoute = await readFile("src/routes/__root.tsx", "utf8");
const offlinePage = await readFile("public/offline.html", "utf8");
const icon = await readFile("public/pwa-icon.svg", "utf8");

assert.equal(manifest.id, "/");
assert.equal(manifest.start_url, "/");
assert.equal(manifest.scope, "/");
assert.equal(manifest.display, "standalone");
assert.equal(manifest.theme_color, "#0b1f3a");
assert.ok(manifest.icons.some((entry) => entry.type === "image/svg+xml"));
assert.ok(manifest.icons.some((entry) => entry.purpose === "maskable"));
assert.ok(manifest.shortcuts.some((entry) => entry.url === "/staff"));
assert.ok(manifest.shortcuts.some((entry) => entry.url === "/os"));

assert.match(rootRoute, /rel: "manifest", href: "\/manifest\.webmanifest"/);
assert.match(rootRoute, /rel: "apple-touch-icon", href: "\/pwa-icon\.svg"/);
assert.match(rootRoute, /name: "apple-mobile-web-app-capable", content: "yes"/);
assert.match(rootRoute, /name: "apple-mobile-web-app-title", content: "Relax Fix UAE"/);
assert.match(rootRoute, /navigator\.serviceWorker\.register\("\/service-worker\.js"/);

for (const privatePrefix of ["/api", "/staff", "/os", "/admin"]) {
  assert.match(serviceWorker, new RegExp(`"${privatePrefix}"`));
}
assert.match(serviceWorker, /request\.mode === "navigate"/);
assert.match(serviceWorker, /url\.pathname\.startsWith\("\/assets\/"\)/);
assert.match(serviceWorker, /caches\.match\(OFFLINE_URL\)/);
assert.doesNotMatch(serviceWorker, /addEventListener\("(push|sync|notificationclick)"/i);

assert.match(offlinePage, /لا يوجد اتصال بالإنترنت/);
assert.match(offlinePage, /You are offline/);
assert.match(icon, /viewBox="0 0 512 512"/);

console.log("PWA installability contracts passed.");
