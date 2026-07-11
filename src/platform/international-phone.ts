import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";

export const DEFAULT_PHONE_COUNTRY: CountryCode = "AE";

const supportedCountries = new Set<CountryCode>(getCountries());

export type InternationalPhoneError =
  | "PHONE_REQUIRED"
  | "INVALID_COUNTRY"
  | "INVALID_PHONE"
  | "COUNTRY_MISMATCH"
  | "COUNTRY_CODE_DUPLICATED";

export type InternationalPhoneResult =
  | {
      success: true;
      country: CountryCode;
      callingCode: string;
      e164: string;
      normalized: string;
      internationalDisplay: string;
      nationalDisplay: string;
    }
  | { success: false; code: InternationalPhoneError };

export function isSupportedPhoneCountry(value: string): value is CountryCode {
  return supportedCountries.has(value as CountryCode);
}

export function internationalPhoneCountries(): CountryCode[] {
  return [...supportedCountries];
}

export function phoneCountryCallingCode(country: CountryCode): string {
  return getCountryCallingCode(country);
}

function internationalPrefixInput(value: string): string {
  return value.startsWith("00") ? `+${value.slice(2)}` : value;
}

export function validateInternationalPhone(
  country: CountryCode,
  input: string,
): InternationalPhoneResult {
  if (!isSupportedPhoneCountry(country)) {
    return { success: false, code: "INVALID_COUNTRY" };
  }

  const raw = input.trim();
  if (!raw) return { success: false, code: "PHONE_REQUIRED" };

  const callingCode = getCountryCallingCode(country);
  const normalizedInput = internationalPrefixInput(raw);
  const hasInternationalPrefix = normalizedInput.startsWith("+");

  if (!hasInternationalPrefix) {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith(callingCode) && digits.length > callingCode.length + 4) {
      const asInternational = parsePhoneNumberFromString(`+${digits}`);
      if (asInternational?.isValid() && asInternational.countryCallingCode === callingCode) {
        return { success: false, code: "COUNTRY_CODE_DUPLICATED" };
      }
    }
  }

  const parsed = hasInternationalPrefix
    ? parsePhoneNumberFromString(normalizedInput)
    : parsePhoneNumberFromString(raw, country);

  if (!parsed?.isValid()) {
    return { success: false, code: "INVALID_PHONE" };
  }

  if (
    parsed.countryCallingCode !== callingCode ||
    (parsed.country !== undefined && parsed.country !== country)
  ) {
    return { success: false, code: "COUNTRY_MISMATCH" };
  }

  return {
    success: true,
    country,
    callingCode,
    e164: parsed.number,
    normalized: parsed.number.slice(1),
    internationalDisplay: parsed.formatInternational(),
    nationalDisplay: parsed.formatNational(),
  };
}

export function canonicalPhoneDisplay(normalizedPhone: string, fallback: string): string {
  const digits = normalizedPhone.replace(/\D/g, "");
  if (!/^[1-9][0-9]{7,14}$/.test(digits)) return fallback;
  const parsed = parsePhoneNumberFromString(`+${digits}`);
  return parsed?.isValid() ? parsed.formatInternational() : `+${digits}`;
}
