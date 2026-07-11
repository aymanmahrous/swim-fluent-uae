import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { CountryCode } from "libphonenumber-js/max";
import {
  internationalPhoneCountries,
  phoneCountryCallingCode,
  validateInternationalPhone,
  type InternationalPhoneError,
} from "../platform/international-phone";

function flagEmoji(country: CountryCode): string {
  return country
    .split("")
    .map((character) => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join("");
}

function countryName(country: CountryCode, language: "ar" | "en"): string {
  try {
    return new Intl.DisplayNames([language], { type: "region" }).of(country) ?? country;
  } catch {
    return country;
  }
}

function phoneErrorMessage(language: "ar" | "en", code: InternationalPhoneError): string {
  const messages: Record<InternationalPhoneError, { ar: string; en: string }> = {
    PHONE_REQUIRED: {
      ar: "أدخل رقم الهاتف.",
      en: "Enter a phone number.",
    },
    INVALID_COUNTRY: {
      ar: "اختر دولة صالحة.",
      en: "Choose a valid country.",
    },
    INVALID_PHONE: {
      ar: "رقم الهاتف غير صالح لهذه الدولة.",
      en: "This phone number is not valid for the selected country.",
    },
    COUNTRY_MISMATCH: {
      ar: "كود الدولة في الرقم لا يطابق الدولة المختارة.",
      en: "The number's country code does not match the selected country.",
    },
    COUNTRY_CODE_DUPLICATED: {
      ar: "لا تكتب كود الدولة مرة أخرى؛ اكتبه كرقم محلي فقط.",
      en: "Do not enter the country code twice; enter the local number only.",
    },
  };
  return messages[code][language];
}

type InternationalPhoneFieldProps = {
  country: CountryCode;
  value: string;
  language: "ar" | "en";
  onCountryChange: (country: CountryCode) => void;
  onValueChange: (value: string) => void;
};

export function InternationalPhoneField({
  country,
  value,
  language,
  onCountryChange,
  onValueChange,
}: InternationalPhoneFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const errorId = "booking-phone-error";
  const hintId = "booking-phone-hint";
  const validation = useMemo(
    () => validateInternationalPhone(country, value),
    [country, value],
  );
  const showError = value.trim().length > 0 && !validation.success;

  const countries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(language);
    return internationalPhoneCountries()
      .map((code) => ({
        code,
        name: countryName(code, language),
        callingCode: phoneCountryCallingCode(code),
      }))
      .filter(
        (item) =>
          !normalizedQuery ||
          item.name.toLocaleLowerCase(language).includes(normalizedQuery) ||
          item.code.toLocaleLowerCase(language).includes(normalizedQuery) ||
          item.callingCode.includes(normalizedQuery.replace(/^\+/, "")),
      )
      .sort((left, right) => left.name.localeCompare(right.name, language));
  }, [language, query]);

  function chooseCountry(nextCountry: CountryCode) {
    onCountryChange(nextCountry);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative">
      <div className="grid gap-2 sm:grid-cols-[minmax(11rem,0.85fr)_minmax(0,1.15fr)]">
        <div className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls="booking-country-list"
            onClick={() => {
              setOpen((current) => !current);
              window.setTimeout(() => searchRef.current?.focus(), 0);
            }}
            className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-start text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span aria-hidden="true" className="text-xl">{flagEmoji(country)}</span>
              <span className="min-w-0">
                <span className="block truncate font-bold">{countryName(country, language)}</span>
                <span className="block text-xs text-muted-foreground" dir="ltr">
                  +{phoneCountryCallingCode(country)}
                </span>
              </span>
            </span>
            <ChevronsUpDown aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>

          {open && (
            <div
              className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-elegant sm:min-w-80"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setOpen(false);
                }
              }}
            >
              <label className="flex items-center gap-2 border-b border-border px-3 py-2">
                <Search aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">
                  {language === "ar" ? "ابحث عن الدولة أو كود الاتصال" : "Search country or calling code"}
                </span>
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={language === "ar" ? "بحث عن الدولة أو الكود" : "Search country or code"}
                  className="w-full bg-transparent px-1 py-2 text-sm outline-none"
                />
              </label>
              <div
                id="booking-country-list"
                role="listbox"
                aria-label={language === "ar" ? "الدولة وكود الاتصال" : "Country and calling code"}
                className="max-h-64 overflow-y-auto p-1"
              >
                {countries.map((item) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={item.code === country}
                    key={item.code}
                    onClick={() => chooseCountry(item.code)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                  >
                    <span aria-hidden="true" className="text-xl">{flagEmoji(item.code)}</span>
                    <span className="min-w-0 flex-1 truncate">{item.name}</span>
                    <span className="shrink-0 text-muted-foreground" dir="ltr">+{item.callingCode}</span>
                    {item.code === country && <Check aria-hidden="true" className="h-4 w-4 text-primary" />}
                  </button>
                ))}
                {countries.length === 0 && (
                  <p className="px-3 py-5 text-center text-sm text-muted-foreground">
                    {language === "ar" ? "لا توجد دولة مطابقة." : "No matching country."}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <div
            className={`flex min-h-12 overflow-hidden rounded-2xl border bg-background transition focus-within:ring-4 focus-within:ring-primary/10 ${
              showError
                ? "border-destructive focus-within:border-destructive"
                : "border-border focus-within:border-primary"
            }`}
          >
            <span
              aria-hidden="true"
              className="flex items-center border-e border-border bg-muted/60 px-3 text-sm font-bold"
              dir="ltr"
            >
              +{phoneCountryCallingCode(country)}
            </span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              aria-invalid={showError}
              aria-describedby={`${hintId}${showError ? ` ${errorId}` : ""}`}
              placeholder={language === "ar" ? "رقم الهاتف المحلي" : "Local phone number"}
              className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm outline-none"
              dir="ltr"
            />
          </div>
          <p id={hintId} className="mt-2 text-xs leading-5 text-muted-foreground">
            {language === "ar"
              ? "اختر الدولة ثم اكتب الرقم المحلي دون تكرار كود الدولة. يمكنك أيضًا لصق رقم يبدأ بـ + أو 00."
              : "Choose the country and enter the local number without repeating the calling code. You may also paste a number beginning with + or 00."}
          </p>
          {showError && (
            <p id={errorId} role="alert" className="mt-1 text-xs font-semibold text-destructive">
              {phoneErrorMessage(language, validation.code)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
