import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const rootShell = await readFile(join(root, "src/routes/__root.tsx"), "utf8");
const staffPortal = await readFile(join(root, "src/routes/staff.tsx"), "utf8");
const osRoute = await readFile(join(root, "src/routes/os.tsx"), "utf8");

const forbiddenPublicNeedles = [
  'to="/os"',
  'to="/admin"',
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

console.log("Public/internal route boundary verification passed.");
