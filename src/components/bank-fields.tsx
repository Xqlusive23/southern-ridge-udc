"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type BankOption = {
  name: string;
  routing: string;
  category: "home" | "prepaid" | "bank" | "credit_union";
};

const CATEGORIES: { value: BankOption["category"]; label: string }[] = [
  { value: "home", label: "This credit union" },
  { value: "prepaid", label: "Prepaid banks" },
  { value: "bank", label: "Banks" },
  { value: "credit_union", label: "Credit unions & digital banks" },
];

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
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
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return banks;
    return banks.filter(
      (bank) =>
        bank.name.toLowerCase().includes(needle) || bank.routing.includes(needle),
    );
  }, [banks, query]);
  const selectedBank = banks.find((bank) => bank.name === selected) ?? null;

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
          onBankChange?.(banks.find((bank) => bank.name === next) ?? null);
        }}
        className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm"
      >
        <option value="">Select a bank</option>
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
        inputMode="numeric"
        autoComplete="off"
        pattern="[0-9]{4,17}"
        minLength={4}
        maxLength={17}
        className="h-10"
        required
        onChange={(event) => setValue(digitsOnly(event.target.value))}
        onPaste={(event) => {
          event.preventDefault();
          setValue(digitsOnly(event.clipboardData.getData("text")));
        }}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
