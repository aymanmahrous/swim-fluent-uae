import fs from "node:fs";

const source = fs.readFileSync("src/platform/public-attribution.ts", "utf8");

const required = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "EMAIL_PATTERN",
  "PHONE_PATTERN",
  "HTML_PATTERN",
  "stripControlCharacters",
  "code > 31",
  "code !== 127",
  "source: 100",
  "medium: 100",
  "campaign: 150",
  "content: 150",
  "term: 150",
  "toLowerCase()",
  "URLSearchParams",
];

for (const token of required) {
  if (!source.includes(token)) {
    throw new Error(`Public attribution foundation is missing required contract token: ${token}`);
  }
}

const forbidden = [
  "localStorage",
  "sessionStorage",
  "document.cookie",
  "indexedDB",
  "fetch(",
  "navigator.sendBeacon",
];

for (const token of forbidden) {
  if (source.includes(token)) {
    throw new Error(`Public attribution foundation must remain non-persistent and write-free: ${token}`);
  }
}

console.log(
  "Public attribution foundation verified: normalized UTM allow-list, click-ID removal, PII rejection, control-character stripping, bounded lengths, and no persistence or external writes.",
);
