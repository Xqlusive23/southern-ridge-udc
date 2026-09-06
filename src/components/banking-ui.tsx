import Link from "next/link";
import type { ReactNode } from "react";
import { formatAccountType, formatCardExpiry, formatCardNumber, formatMoney } from "@/lib/money";
import type { Account, DebitCard } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BankingPageHeader({
  eyebrow = "E-Banking",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-[#2F7A45] uppercase">
          {eyebrow}
        </p>
        <h1 className="site-display mt-1.5 text-3xl font-medium tracking-tight text-[#0B2340]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5C6B64]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export function BankingPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#e2ddd2] bg-white p-5 shadow-[0_1px_2px_rgba(11,35,64,0.04),0_8px_24px_rgba(11,35,64,0.04)] sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DebitCardFace({
  card,
  account,
  revealed = false,
}: {
  card: DebitCard;
  account?: Account;
  revealed?: boolean;
}) {
  const business = card.kind === "business";
  return (
    <div
      className={cn(
        "relative aspect-[1.62/1] w-full overflow-hidden rounded-[1.35rem] p-5 text-white shadow-[0_18px_40px_rgba(11,35,64,0.28)]",
        "transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(11,35,64,0.32)]",
        business
          ? "bg-[linear-gradient(145deg,#12324f_0%,#0B2340_52%,#1a4a38_100%)]"
          : "bg-[linear-gradient(145deg,#16385c_0%,#0B2340_58%,#245f36_100%)]",
        card.status !== "active" && "opacity-80 grayscale-[0.25]",
      )}
    >
      <div className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full bg-white/8" />
      <div className="pointer-events-none absolute -bottom-20 -left-8 size-48 rounded-full bg-[#c4a574]/12" />
      <div className="relative flex items-start justify-between">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-[#F4E7C5] uppercase">
          Southern Ridge
        </p>
        <p className="text-[10px] tracking-[0.18em] text-white/70 uppercase">
          {business ? "Business debit" : "Debit"}
        </p>
      </div>
      <div className="relative mt-6 flex items-center gap-3">
        <span className="h-8 w-11 rounded-md bg-[linear-gradient(135deg,#e8d5a3,#c4a574,#8a6d3b)] shadow-inner" />
        <svg viewBox="0 0 24 24" className="size-5 text-white/55" aria-hidden>
          <path
            fill="currentColor"
            d="M7.5 16.5a8.5 8.5 0 0 1 0-9l1.2.9a7 7 0 0 0 0 7.2zm3.2-1.6a5.8 5.8 0 0 1 0-5.8l1.2.9a4.2 4.2 0 0 0 0 4zm3.1-1.5a3 3 0 0 1 0-2.8l1.3.8a1.5 1.5 0 0 0 0 1.2z"
          />
        </svg>
      </div>
      <p className="relative mt-5 font-mono text-lg tracking-[0.18em] sm:text-xl">
        {formatCardNumber(card.pan, revealed)}
      </p>
      <div className="relative mt-5 flex items-end justify-between gap-3 text-[11px] tracking-wide">
        <div>
          <p className="text-[9px] tracking-[0.16em] text-white/45 uppercase">Cardholder</p>
          <p className="mt-0.5 font-medium">{card.holderName}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] tracking-[0.16em] text-white/45 uppercase">Expires</p>
          <p className="mt-0.5 font-medium tabular-nums">
            {formatCardExpiry(card.expiryMonth, card.expiryYear)}
          </p>
        </div>
      </div>
      {account ? (
        <p className="relative mt-3 text-[10px] text-white/50">
          {account.name} · {formatAccountType(account.type)} · {formatMoney(account.balanceCents)}
        </p>
      ) : null}
      {card.status !== "active" ? (
        <div className="absolute inset-x-0 bottom-0 bg-black/35 px-5 py-1.5 text-center text-[10px] font-semibold tracking-[0.18em] uppercase">
          {card.status}
        </div>
      ) : null}
    </div>
  );
}

export function AccountSummaryCard({ account }: { account: Account }) {
  return (
    <div className="rounded-2xl border border-[#e2ddd2] bg-white p-5 shadow-[0_1px_2px_rgba(11,35,64,0.04)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(11,35,64,0.08)]">
      <p className="text-[11px] tracking-[0.16em] text-[#8A6D3B] uppercase">
        {formatAccountType(account.type)}
      </p>
      <p className="mt-1 font-medium text-[#0B2340]">{account.name}</p>
      <p className="site-display mt-3 text-2xl font-medium text-[#0B2340]">
        {formatMoney(account.balanceCents)}
      </p>
      <p className="mt-2 text-xs text-[#5C6B64]">
        Account <span className="tabular-nums text-[#0B2340]">{account.accountNumber}</span>
      </p>
    </div>
  );
}

export function QuickAction({
  href,
  label,
  hint,
}: {
  href: string;
  label: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[#e2ddd2] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(11,35,64,0.04)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[#c4a574]/45 hover:shadow-[0_12px_28px_rgba(11,35,64,0.08)]"
    >
      <p className="font-medium text-[#0B2340]">{label}</p>
      <p className="mt-1 text-xs leading-5 text-[#5C6B64]">{hint}</p>
    </Link>
  );
}
