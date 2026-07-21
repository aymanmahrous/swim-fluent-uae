import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

// This is a read-only source contract. It never imports or executes application routes.
const routesDirectory = join(process.cwd(), "src/routes");
const routeFiles = (await readdir(routesDirectory))
  .filter((name) => /^api\..+\.(?:ts|tsx)$/.test(name))
  .sort();

assert.ok(routeFiles.length > 0, "No API route files were discovered");

const mutationMethods = ["POST", "PUT", "PATCH", "DELETE"];
const validatedRoutes = [];

for (const file of routeFiles) {
  const source = await readFile(join(routesDirectory, file), "utf8");
  const methods = mutationMethods.filter((method) => new RegExp(`\\b${method}\\s*:`).test(source));
  if (methods.length === 0 || !source.includes("request.json")) continue;

  validatedRoutes.push(`${file} [${methods.join(", ")}]`);

  assert.ok(
    /request\.json\(\)\.catch\(/.test(source),
    `${file} must handle malformed JSON without leaking an unhandled exception`,
  );
  assert.ok(
    /(?:safeParse|parse)\(/.test(source),
    `${file} reads a mutation JSON body without schema validation`,
  );

  const explicitInvalidInput =
    source.includes("INVALID_INPUT") ||
    /status:\s*400/.test(source) ||
    source.includes("ENUMERATION_SAFE_INVALID_INPUT");
  assert.ok(
    explicitInvalidInput,
    `${file} must preserve an explicit invalid-input response or documented enumeration-safe behavior`,
  );
}

assert.ok(validatedRoutes.length > 0, "No JSON mutation API routes were discovered");
console.log(
  `API mutation input contract verification passed (${validatedRoutes.length} routes): ${validatedRoutes.join("; ")}`,
);
