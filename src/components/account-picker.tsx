"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/money";
import type { Account } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AccountPicker({
  accounts,
  name,
  label,
  defaultAccountId,
}: {
  accounts: Account[];
  name: string;
  label: string;
  defaultAccountId?: string;
}) {
  const [selected, setSelected] = useState(
    defaultAccountId && accounts.some((account) => account.id === defaultAccountId)
      ? defaultAccountId
      : accounts[0]?.id ?? "",
  );

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <input type="hidden" name={name} value={selected} />
      <div className="grid gap-2">
        {accounts.map((account) => {
          const active = account.id === selected;
          return (
            <button
              key={account.id}
              type="button"
              onClick={() => setSelected(account.id)}
              className={cn(
                "rounded-xl border px-3 py-3 text-left transition-colors",
                active
                  ? "border-[#0B2340] bg-[#0B2340] text-white"
                  : "border-[#e2ddd2] bg-white text-[#122033] hover:border-[#0B2340]/35",
              )}
            >
              <p className="text-sm font-semibold break-words">{account.name}</p>
              <p
                className={cn(
                  "mt-1 text-xs leading-5 break-words",
                  active ? "text-white/75" : "text-[#5C6B64]",
                )}
              >
                <span className="tabular-nums">{account.accountNumber}</span>
                <span className="mx-1.5">·</span>
                <span className="tabular-nums">{formatMoney(account.balanceCents)}</span>
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
