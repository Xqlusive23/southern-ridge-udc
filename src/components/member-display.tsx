"use client";

import { createContext, useActionState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { FormButton } from "@/components/form-button";
import { StatusBanner } from "@/components/status-banner";
import { Label } from "@/components/ui/label";
import { updateDisplayPreferencesAction } from "@/lib/actions/member";
import {
  CURRENCIES,
  CURRENCY_LABELS,
  LOCALES,
  LOCALE_LABELS,
  t,
  type AppCurrency,
  type AppLocale,
} from "@/lib/i18n";
import { formatDate, formatDateTime, formatMoney } from "@/lib/money";

type DisplayValue = {
  locale: AppLocale;
  currency: AppCurrency;
};

const DisplayContext = createContext<DisplayValue>({
  locale: "en",
  currency: "USD",
});

export function MemberDisplayProvider({
  locale,
  currency,
  children,
}: {
  locale: string;
  currency: string;
  children: React.ReactNode;
}) {
  const value: DisplayValue = {
    locale: LOCALES.includes(locale as AppLocale) ? (locale as AppLocale) : "en",
    currency: CURRENCIES.includes(currency as AppCurrency)
      ? (currency as AppCurrency)
      : "USD",
  };
  return (
    <DisplayContext.Provider value={value}>{children}</DisplayContext.Provider>
  );
}

export function useMemberDisplay() {
  return useContext(DisplayContext);
}

export function useT() {
  const { locale } = useMemberDisplay();
  return (key: string) => t(locale, key);
}

export function useFormatMoney() {
  const prefs = useMemberDisplay();
  return (cents: number) => formatMoney(cents, prefs);
}

export function useFormatDate() {
  const { locale } = useMemberDisplay();
  return {
    date: (iso: string) => formatDate(iso, locale),
    dateTime: (iso: string) => formatDateTime(iso, locale),
  };
}

export function DisplayPreferencesForm({
  locale,
  currency,
}: {
  locale: string;
  currency: string;
}) {
  const [state, action] = useActionState(updateDisplayPreferencesAction, null);
  const label = (key: string) => t(locale, key);

  useEffect(() => {
    if (state?.ok && state.message) toast.success(state.message);
  }, [state]);

  return (
    <form action={action} key={`${locale}-${currency}`} className="grid gap-4">
      <StatusBanner error={state?.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="locale">{label("language")}</Label>
          <select
            id="locale"
            name="locale"
            defaultValue={locale}
            className="h-10 rounded-lg border border-input bg-white px-3 text-sm"
          >
            {LOCALES.map((item) => (
              <option key={item} value={item}>
                {LOCALE_LABELS[item]}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="currency">{label("currency")}</Label>
          <select
            id="currency"
            name="currency"
            defaultValue={currency}
            className="h-10 rounded-lg border border-input bg-white px-3 text-sm"
          >
            {CURRENCIES.map((item) => (
              <option key={item} value={item}>
                {item} · {CURRENCY_LABELS[item]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-[#8A938C]">{label("languageCurrencyHelp")}</p>
      <FormButton className="h-10 w-fit bg-[#0B2340] text-white hover:bg-[#08182C]">
        {label("savePreferences")}
      </FormButton>
    </form>
  );
}

export function DisplaySwitcher({
  locale,
  currency,
}: {
  locale: string;
  currency: string;
}) {
  const [state, action] = useActionState(updateDisplayPreferencesAction, null);

  useEffect(() => {
    if (state?.ok && state.message) toast.success(state.message);
  }, [state]);

  return (
    <form action={action} key={`${locale}-${currency}`} className="flex items-center gap-2">
      <select
        name="locale"
        defaultValue={locale}
        aria-label="Language"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-8 max-w-[7.5rem] rounded-lg border border-white/20 bg-white/10 px-2 text-[11px] text-white outline-none"
      >
        {LOCALES.map((item) => (
          <option key={item} value={item} className="text-[#0B2340]">
            {LOCALE_LABELS[item]}
          </option>
        ))}
      </select>
      <select
        name="currency"
        defaultValue={currency}
        aria-label="Currency"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-8 max-w-[6.5rem] rounded-lg border border-white/20 bg-white/10 px-2 text-[11px] text-white outline-none"
      >
        {CURRENCIES.map((item) => (
          <option key={item} value={item} className="text-[#0B2340]">
            {item}
          </option>
        ))}
      </select>
    </form>
  );
}
