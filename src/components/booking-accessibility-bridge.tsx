import { useEffect } from "react";
import { useLang } from "../lib/i18n";

export function BookingAccessibilityBridge() {
  const { lang } = useLang();

  useEffect(() => {
    const labels =
      lang === "ar"
        ? { name: "الاسم الكامل", phone: "رقم الهاتف" }
        : { name: "Full name", phone: "Phone number" };

    const applyAccessibleNames = () => {
      const nameInput = document.querySelector<HTMLInputElement>('input[autocomplete="name"]');
      const phoneInput = document.querySelector<HTMLInputElement>('input[autocomplete="tel"]');

      if (nameInput && !nameInput.hasAttribute("aria-label")) {
        nameInput.setAttribute("aria-label", labels.name);
      }
      if (phoneInput && !phoneInput.hasAttribute("aria-label")) {
        phoneInput.setAttribute("aria-label", labels.phone);
      }
    };

    applyAccessibleNames();
    const observer = new MutationObserver(applyAccessibleNames);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [lang]);

  return null;
}
