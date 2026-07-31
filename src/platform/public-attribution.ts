export type PublicAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

const MAX_LENGTHS = {
  source: 100,
  medium: 100,
  campaign: 150,
  content: 150,
  term: 150,
} as const;

const CLICK_ID_KEYS = new Set(["gclid", "gbraid", "wbraid", "fbclid"]);
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_PATTERN = /(?:\+?\d[\d\s().-]{7,}\d)/;
const HTML_PATTERN = /<\/?[a-z][^>]*>|javascript:/i;

function stripControlCharacters(value: string): string {
  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join("");
}

function normalizeValue(
  value: string | null,
  maxLength: number,
  lowercase: boolean,
): string | undefined {
  if (!value) return undefined;

  const cleaned = stripControlCharacters(value).trim();
  if (!cleaned || EMAIL_PATTERN.test(cleaned) || PHONE_PATTERN.test(cleaned) || HTML_PATTERN.test(cleaned)) {
    return undefined;
  }

  const normalized = lowercase ? cleaned.toLowerCase() : cleaned;
  return normalized.slice(0, maxLength);
}

export function normalizePublicAttribution(search: string): PublicAttribution {
  const params = new URLSearchParams(search);

  for (const key of CLICK_ID_KEYS) {
    params.delete(key);
  }

  return {
    source: normalizeValue(params.get("utm_source"), MAX_LENGTHS.source, true),
    medium: normalizeValue(params.get("utm_medium"), MAX_LENGTHS.medium, true),
    campaign: normalizeValue(params.get("utm_campaign"), MAX_LENGTHS.campaign, false),
    content: normalizeValue(params.get("utm_content"), MAX_LENGTHS.content, false),
    term: normalizeValue(params.get("utm_term"), MAX_LENGTHS.term, false),
  };
}

export function hasPublicAttribution(value: PublicAttribution): boolean {
  return Object.values(value).some(Boolean);
}
