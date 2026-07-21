import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const [rootShell, staffPortal, osRoute, adminRoute, robots, vercelConfigSource] =
  await Promise.all([
    readFile(join(root, "src/routes/__root.tsx"), "utf8"),
    readFile(join(root, "src/routes/staff.tsx"), "utf8"),
    readFile(join(root, "src/routes/os.tsx"), "utf8"),
    readFile(join(root, "src/routes/admin.tsx"), "utf8"),
    readFile(join(root, "public/robots.txt"), "utf8"),
    readFile(join(root, "vercel.json"), "utf8"),
  ]);

const forbiddenPublicNeedles = [
  'to="/os"',
  'to="/staff"',
  'to="/admin"',
  'href="/os"',
  'href="/staff"',
  'href="/admin"',
  "VITE_ENABLE_AI_OS",
  "VITE_ENABLE_LEGACY_ADMIN",
  "staff-session.server",
  "staff-rbac",
  "supabase-secret.server",
  "content-automation.server",
  "publish-worker.server",
  "content-media-worker.server",
];

for (const needle of forbiddenPublicNeedles) {
  if (rootShell.includes(needle)) {
    throw new Error(`public root boundary violation: forbidden ${JSON.stringify(needle)}`);
  }
}

for (const needle of ['to="/os"', "AI OS"]) {
  if (!staffPortal.includes(needle)) {
    throw new Error(`Staff Portal internal navigation missing ${JSON.stringify(needle)}`);
  }
}

for (const needle of ["VITE_ENABLE_AI_OS", "fetchStaffSession", "enabled: aiOsEnabled"]) {
  if (!osRoute.includes(needle)) {
    throw new Error(`AI OS route boundary missing ${JSON.stringify(needle)}`);
  }
}

for (const route of ["/api/", "/os", "/staff", "/admin"]) {
  if (!robots.includes(`Disallow: ${route}`)) {
    throw new Error(`robots.txt must disallow internal surface ${route}`);
  }
}

const vercelConfig = JSON.parse(vercelConfigSource);
const protectedSources = new Set(
  (vercelConfig.headers ?? [])
    .filter((entry) =>
      (entry.headers ?? []).some(
        (header) =>
          header.key === "X-Robots-Tag" &&
          header.value === "noindex, nofollow, noarchive",
      ),
    )
    .map((entry) => entry.source),
);

for (const source of ["/api/(.*)", "/os/(.*)", "/os", "/staff", "/admin"]) {
  if (!protectedSources.has(source)) {
    throw new Error(`Vercel X-Robots-Tag boundary missing for ${source}`);
  }
}

for (const needle of ['name: "robots"', 'content: "noindex"']) {
  if (!adminRoute.includes(needle)) {
    throw new Error(`Legacy admin noindex contract missing ${JSON.stringify(needle)}`);
  }
}

console.log(
  "Public/internal route boundary verification passed (no public links, authenticated Staff navigation retained, robots and X-Robots-Tag protections verified).",
);
