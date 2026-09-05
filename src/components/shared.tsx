import { Badge } from "@/components/ui/badge";
import {
  formatAccountType,
  formatDateTime,
  formatMoney,
  maskAccountNumber,
} from "@/lib/money";
import type { Account, Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "active"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : status === "frozen"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <Badge variant="outline" className={cn("capitalize", tone)}>
      {status}
    </Badge>
  );
}

export function AccountCard({ account }: { account: Account }) {
  return (
    <div className="rounded-2xl bg-[#0B2340] p-5 text-white shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-white/55 uppercase">
            {formatAccountType(account.type)}
          </p>
          <p className="mt-1 text-lg font-medium">{account.name}</p>
        </div>
        <StatusPill status={account.status} />
      </div>
      <p className="mt-6 text-3xl font-semibold tracking-tight">
        {formatMoney(account.balanceCents)}
      </p>
      <p className="mt-3 text-sm text-white/65">
        {maskAccountNumber(account.accountNumber)} · Routing {account.routingNumber}
      </p>
    </div>
  );
}

export function TransactionList({
  transactions,
  accounts,
  empty,
}: {
  transactions: Transaction[];
  accounts: Account[];
  empty: string;
}) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  }

  const names = new Map(accounts.map((account) => [account.id, account.name]));

  return (
    <div className="divide-y rounded-xl border bg-white">
      {transactions.map((item) => {
        const inbound = item.amountCents >= 0;
        return (
          <div
            key={item.id}
            className="flex items-start justify-between gap-4 px-4 py-3.5"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{item.description}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDateTime(item.createdAt)}
                {names.get(item.accountId)
                  ? ` · ${names.get(item.accountId)}`
                  : ""}
                {item.counterparty ? ` · ${item.counterparty}` : ""}
              </p>
            </div>
            <p
              className={cn(
                "shrink-0 font-medium tabular-nums",
                inbound ? "text-emerald-700" : "text-[#0B2340]",
              )}
            >
              {inbound ? "+" : ""}
              {formatMoney(item.amountCents)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
