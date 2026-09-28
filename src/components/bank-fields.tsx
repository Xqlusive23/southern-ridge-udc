"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type BankOption = {
  name: string;
  routing: string;
  category: "home" | "prepaid" | "bank" | "credit_union";
};

export const OTHER_BANK_VALUE = "__other__";

const CATEGORIES: { value: BankOption["category"]; label: string }[] = [
  { value: "home", label: "This credit union" },
  { value: "prepaid", label: "Prepaid banks" },
  { value: "bank", label: "Banks" },
  { value: "credit_union", label: "Credit unions & digital banks" },
];

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function alphanumericOnly(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function BankSelect({
  banks,
  id = "bankName",
  name = "bankName",
  label = "Receiving bank",
  value,
  onBankChange,
}: {
  banks: BankOption[];
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  onBankChange?: (bank: BankOption | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(value ?? "");
  const [customBank, setCustomBank] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return banks;
    return banks.filter(
      (bank) =>
        bank.name.toLowerCase().includes(needle) || bank.routing.includes(needle),
    );
  }, [banks, query]);
  const selectedBank = banks.find((bank) => bank.name === selected) ?? null;
  const isOther = selected === OTHER_BANK_VALUE;

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={`${id}-search`}>{label}</Label>
      <Input
        id={`${id}-search`}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search U.S. banks and prepaid cards"
        className="h-10"
        autoComplete="off"
      />
      <select
        id={id}
        name={name}
        required
        value={selected}
        onChange={(event) => {
          const next = event.target.value;
          setSelected(next);
          if (next === OTHER_BANK_VALUE) {
            onBankChange?.(null);
          } else {
            onBankChange?.(banks.find((bank) => bank.name === next) ?? null);
          }
        }}
        className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm"
      >
        <option value="">Select a bank</option>
        <option value={OTHER_BANK_VALUE}>My bank isn’t listed</option>
        {CATEGORIES.map((category) => {
          const options = filtered.filter((bank) => bank.category === category.value);
          if (
            selectedBank &&
            selectedBank.category === category.value &&
            !options.some((bank) => bank.name === selectedBank.name)
          ) {
            options.unshift(selectedBank);
          }
          if (options.length === 0) return null;
          return (
            <optgroup key={category.value} label={category.label}>
              {options.map((bank) => (
                <option key={bank.name} value={bank.name}>
                  {bank.name}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
      {isOther ? (
        <div className="grid gap-1.5 pt-1">
          <Label htmlFor={`${id}-custom`}>Bank name</Label>
          <Input
            id={`${id}-custom`}
            name="customBankName"
            value={customBank}
            onChange={(event) => setCustomBank(event.target.value)}
            placeholder="Enter your bank's name"
            className="h-10"
            autoComplete="off"
            required
          />
          <p className="text-xs text-muted-foreground">
            We’ll route this transfer using the name you enter here.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function AccountNumberField({
  id = "accountNumber",
  name = "accountNumber",
  label = "Account number",
  hint,
}: {
  id?: string;
  name?: string;
  label?: string;
  hint?: string;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        value={value}
        inputMode="text"
        autoComplete="off"
        pattern="[A-Za-z0-9]{4,34}"
        minLength={4}
        maxLength={34}
        className="h-10"
        required
        onChange={(event) => setValue(alphanumericOnly(event.target.value))}
        onPaste={(event) => {
          event.preventDefault();
          setValue(alphanumericOnly(event.clipboardData.getData("text")));
        }}
      />
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}