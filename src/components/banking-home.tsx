"use client";

import { useRef, useState, useTransition } from "react";
import { BankingLink } from "@/components/banking-link";
import { markNotificationsReadAction } from "@/lib/actions/member";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  Receipt,
  Wallet,
} from "lucide-react";
import { formatInboxDate, type MemberMessage } from "@/lib/member-inbox";
import { useFormatMoney, useT } from "@/components/member-display";
import type { Account } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AccountCarousel({ accounts }: { accounts: Account[] }) {
  const money = useFormatMoney();
  const translate = useT();
  function accountStatusLabel(status: Account["status"]) {
    if (status === "active") return translate("current");
    if (status === "frozen") return translate("frozen");
    return translate("closed");
  }
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function onScroll() {
    const node = scroller.current;
    if (!node || node.clientWidth === 0) return;
    setActive(Math.round(node.scrollLeft / node.clientWidth));
  }

  function goTo(index: number) {
    const node = scroller.current;
    if (!node) return;
    node.scrollTo({ left: index * node.clientWidth, behavior: "smooth" });
  }

  if (accounts.length === 0) {
    return (
      <p className="rounded-2xl bg-white/10 px-4 py-8 text-center text-sm text-white/80">
        {translate("noAccounts")}
      </p>
    );
  }

  return (
    <div>
      <div
        ref={scroller}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {accounts.map((account) => (
          <article
            key={account.id}
            className="w-full shrink-0 snap-center pr-3 last:pr-0"
          >
            <div className="rounded-[1.4rem] bg-[#16382B] px-5 py-5 text-white shadow-[0_16px_36px_rgba(8,24,20,0.28)]">
              <div className="flex items-start justify-between gap-4">
                <p className="text-[15px] font-semibold tracking-wide uppercase">
                  {account.name}
                </p>
                <p className="text-right text-2xl font-semibold tracking-tight tabular-nums">
                  {money(account.balanceCents)}
                </p>
              </div>
              <div className="mt-8 flex items-end justify-between text-sm text-white/70">
                <p className="tabular-nums">x{account.accountNumber.slice(-4)}</p>
                <p>{accountStatusLabel(account.status)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {accounts.map((account, index) => (
            <button
              key={account.id}
              type="button"
              aria-label={`Show ${account.name}`}
              onClick={() => goTo(index)}
              className={cn(
                "size-2 rounded-full border border-white/80 transition-all duration-300",
                index === active ? "bg-white" : "bg-transparent",
              )}
            />
          ))}
        </div>
        <BankingLink
          href="/banking/accounts"
          className="text-sm font-medium text-white/90 underline-offset-4 hover:underline"
        >
          {translate("viewAll")}
        </BankingLink>
      </div>
    </div>
  );
}

const ACTIONS = [
  { href: "/banking/transfer", key: "transfers", icon: ArrowLeftRight },
  { href: "/banking/deposit", key: "deposit", icon: ArrowDownToLine },
  { href: "/banking/pay", key: "pay", icon: Receipt },
  { href: "/banking/accounts", key: "accounts", icon: Wallet },
] as const;

export function HomeActions() {
  const translate = useT();
  return (
    <div className="grid grid-cols-4 gap-3">
      {ACTIONS.map((action) => (
        <BankingLink
          key={action.href}
          href={action.href}
          className="flex flex-col items-center gap-2 text-white transition-transform duration-300 hover:-translate-y-0.5"
        >
          <span className="grid size-16 place-items-center rounded-[1.15rem] bg-[#16382B] shadow-[0_10px_22px_rgba(8,24,20,0.22)]">
            <action.icon className="size-6" strokeWidth={1.75} />
          </span>
          <span className="text-xs font-medium">{translate(action.key)}</span>
        </BankingLink>
      ))}
    </div>
  );
}

export function InboxList({
  messages,
  empty,
}: {
  messages: MemberMessage[];
  empty: string;
}) {
  const [, startTransition] = useTransition();

  if (messages.length === 0) {
    return <p className="py-8 text-center text-sm text-[#5C6B64]">{empty}</p>;
  }

  return (
    <ul className="divide-y divide-[#eeeae2]">
      {messages.map((message) => (
        <li key={message.id}>
          <BankingLink
            href={message.href}
            onClick={() => {
              if (!message.unread) return;
              startTransition(async () => {
                await markNotificationsReadAction([message.id]);
              });
            }}
            className="flex gap-3 py-3.5 transition-colors duration-200 hover:bg-[#F7F6F2]"
          >
            <span
              className={cn(
                "grid size-12 shrink-0 place-items-center rounded-full text-xs font-semibold",
                message.tone === "alert"
                  ? "bg-[#F4E7C5] text-[#0B2340]"
                  : message.tone === "person"
                    ? "bg-[#2F7A45] text-white"
                    : "bg-[#0B2340] text-[#F4E7C5]",
              )}
            >
              {message.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-3">
                <span className="font-semibold text-[#122033]">{message.title}</span>
                <span className="shrink-0 text-xs text-[#8A938C]">
                  {formatInboxDate(message.createdAt)}
                </span>
              </span>
              <span className="mt-1 flex items-start gap-2 text-sm leading-5 text-[#5C6B64]">
                {message.unread ? (
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#C56A2D] text-[10px] font-bold text-white">
                    1
                  </span>
                ) : null}
                <span className="line-clamp-2">{message.preview}</span>
              </span>
            </span>
          </BankingLink>
        </li>
      ))}
    </ul>
  );
}
