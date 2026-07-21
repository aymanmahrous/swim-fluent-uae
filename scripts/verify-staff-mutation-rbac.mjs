import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const routesDirectory = join(process.cwd(), "src/routes");
const routeFiles = (await readdir(routesDirectory))
  .filter((name) => /^api\.os(?:[.-]|$).+\.(?:ts|tsx)$/.test(name))
  .sort();

assert.ok(routeFiles.length > 0, "No AI OS API routes were discovered");

const mutationMethods = ["POST", "PUT", "PATCH", "DELETE"];
const permissionBoundaries = ["hasStaffPermission", "requireStaffPermission", "assertStaffPermission"];
const mutationRoutes = [];

for (const file of routeFiles) {
  const source = await readFile(join(routesDirectory, file), "utf8");
  const methods = mutationMethods.filter((method) => new RegExp(`\\b${method}\\s*:`).test(source));
  if (methods.length === 0) continue;

  mutationRoutes.push(`${file} [${methods.join(", ")}]`);

  assert.ok(source.includes("resolveStaffSession"), `${file} must authenticate the Staff session before mutation`);
  assert.ok(
    permissionBoundaries.some((boundary) => source.includes(boundary)),
    `${file} exposes ${methods.join(", ")} without a centralized Staff RBAC permission check`,
  );
  assert.ok(
    source.includes("FORBIDDEN") || source.includes("status: 403") || source.includes("status:403"),
    `${file} must preserve an explicit forbidden response for denied permissions`,
  );
}

assert.ok(mutationRoutes.length > 0, "No AI OS mutation routes were discovered");
console.log(`Staff mutation RBAC verification passed (${mutationRoutes.length} routes): ${mutationRoutes.join("; ")}`);
