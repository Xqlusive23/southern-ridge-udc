import {
  type AppCurrency,
  LOCALE_TAGS,
  USD_RATES,
  normalizeCurrency,
  normalizeLocale,
} from "@/lib/i18n";

export type MoneyPrefs = {
  currency?: string | null;
  locale?: string | null;
};

export function formatMoney(cents: number, currencyOrPrefs?: string | MoneyPrefs, locale?: string) {
  const prefs: MoneyPrefs =
    typeof currencyOrPrefs === "object" && currencyOrPrefs !== null
      ? currencyOrPrefs
      : { currency: currencyOrPrefs, locale };
  const currency = normalizeCurrency(prefs.currency);
  const tag = LOCALE_TAGS[normalizeLocale(prefs.locale)];
  const amount = usdCentsToCurrency(cents, currency);
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  }).format(amount);
}

export function usdCentsToCurrency(cents: number, currency: AppCurrency) {
  return (cents / 100) * (USD_RATES[currency] ?? 1);
}

export function amountToneClass(cents: number) {
  return cents >= 0 ? "text-emerald-700" : "text-[#B42318]";
}

export function parseMoneyToCents(value: string) {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  if (!cleaned || Number.isNaN(Number(cleaned))) {
    return null;
  }
  const amount = Math.round(Number(cleaned) * 100);
  if (!Number.isFinite(amount)) {
    return null;
  }
  return amount;
}

export function maskAccountNumber(accountNumber: string) {
  const last4 = accountNumber.slice(-4);
  return `•••• ${last4}`;
}

export function formatCardNumber(pan: string, revealed = false) {
  const digits = pan.replace(/\D/g, "");
  if (!revealed) {
    return `•••• •••• •••• ${digits.slice(-4)}`;
  }
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function formatCardExpiry(month: number, year: number) {
  return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}

export function formatAccountType(type: string, locale?: string) {
  if (type === "checking") {
    const lang = normalizeLocale(locale);
    if (lang === "es") return "Cheques";
    if (lang === "fr") return "Chèques";
    if (lang === "pt") return "Corrente";
    if (lang === "ht") return "Chèk";
    return "Checking";
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function formatDateTime(iso: string, locale?: string) {
  return new Intl.DateTimeFormat(dateTag(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDate(iso: string, locale?: string) {
  return new Intl.DateTimeFormat(dateTag(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function dateTag(locale?: string) {
  const lang = normalizeLocale(locale);
  return lang === "ht" ? "fr-FR" : LOCALE_TAGS[lang];
}

export function memberDisplayName(user: {
  firstName: string;
  lastName: string;
}) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function photoSrc(userId: string, photoPath?: string | null) {
  if (!photoPath) return null;
  if (photoPath.startsWith("/api/member-photo/")) return photoPath;
  return `/api/member-photo/${userId}`;
}
