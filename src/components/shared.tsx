import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { amountToneClass, formatAccountType, formatDateTime, formatMoney } from "@/lib/money";
import { transferStatusLabel, transferStatusToneClass } from "@/lib/transfers";
import type { Account, Transaction, TransferStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "hold"
      ? "bg-orange-50 text-orange-700 border-orange-200"
      : status === "active" || status === "completed" || status === "paid" || status === "approved"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : status === "frozen" || status === "pending" || status === "applied" || status === "review"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : status === "processing"
          ? "bg-sky-50 text-sky-800 border-sky-200"
          : status === "banned" || status === "rejected" || status === "denied"
            ? "bg-red-50 text-red-800 border-red-200"
            : "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <Badge variant="outline" className={cn("capitalize", tone)}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}

export function AccountCard({ account }: { account: Account }) {
  return (
    <div className="rounded-2xl bg-[linear-gradient(145deg,#16385c,#0B2340)] p-5 text-white shadow-[0_12px_28px_rgba(11,35,64,0.16)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(11,35,64,0.2)]">
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
        <span className="block text-xs tracking-[0.16em] text-white/45 uppercase">
          Account number
        </span>
        <span className="tabular-nums text-white">{account.accountNumber}</span>
        <span className="mt-1 block">Routing {account.routingNumber}</span>
      </p>
    </div>
  );
}

export function TransactionList({
  transactions,
  accounts,
  empty,
  className,
  showReceipts = false,
}: {
  transactions: Transaction[];
  accounts: Account[];
  empty: string;
  className?: string;
  showReceipts?: boolean;
}) {
  if (transactions.length === 0) {
    return (
      <div className={cn("rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground", className)}>
        {empty}
      </div>
    );
  }

  const names = new Map(accounts.map((account) => [account.id, account.name]));

  return (
    <div className={cn("divide-y rounded-xl border bg-white", className)}>
      {transactions.map((item) => {
        const inbound = item.amountCents >= 0;
        return (
          <div
            key={item.id}
            className="flex items-start justify-between gap-4 px-4 py-3.5 transition-colors duration-200 hover:bg-[#F7F6F2]"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{item.description}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDateTime(item.createdAt)}
                {names.get(item.accountId)
                  ? ` · ${names.get(item.accountId)}`
                  : ""}
                {item.counterparty ? ` · ${item.counterparty}` : ""}
                {showReceipts && item.transferId ? (
                  <>
                    {" · "}
                    <Link
                      href={`/banking/receipts/${item.transferId}`}
                      className="font-medium text-[#2F7A45] underline-offset-4 hover:underline"
                    >
                      Receipt
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={cn(
                  "font-semibold tabular-nums",
                  amountToneClass(item.amountCents),
                )}
              >
                {inbound ? "+" : ""}
                {formatMoney(item.amountCents)}
              </p>
              {item.status ? (
                <p
                  className={cn(
                    "mt-0.5 text-[11px] font-semibold tracking-[0.14em] uppercase",
                    transferStatusToneClass(item.status),
                  )}
                >
                  {transferStatusLabel(item.status as TransferStatus)}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
