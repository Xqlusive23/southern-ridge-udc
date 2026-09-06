import { formatMoney } from "@/lib/money";
import { loanStatusLabel, loanTypeLabel, transferKindLabel, transferStatusLabel } from "@/lib/transfers";
import type { Loan, MemberStatus, TransferRequest } from "@/lib/types";

export type MemberMessage = {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  unread: boolean;
  href: string;
  tone: "person" | "ops" | "alert";
  initials: string;
};

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SR";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function buildMemberInbox(input: {
  firstName: string;
  status: MemberStatus;
  transfers: TransferRequest[];
  loans: Loan[];
  readIds?: string[];
}): MemberMessage[] {
  const read = new Set(input.readIds ?? []);
  const messages: MemberMessage[] = [];

  if (input.status === "frozen") {
    messages.push({
      id: "alert-frozen",
      title: "Membership hold",
      preview:
        "This membership is frozen. You can review balances, but outgoing transfers stay off until a branch officer restores access.",
      createdAt: new Date().toISOString(),
      unread: !read.has("alert-frozen"),
      href: "/banking/profile",
      tone: "alert",
      initials: "!",
    });
  }

  for (const transfer of input.transfers) {
    const open =
      transfer.status === "hold" ||
      transfer.status === "pending" ||
      transfer.status === "processing";
    messages.push({
      id: `transfer-${transfer.id}`,
      title: transfer.recipientName || transferKindLabel(transfer.kind),
      preview: `${transferKindLabel(transfer.kind)} for ${formatMoney(transfer.amountCents)} is ${transferStatusLabel(transfer.status).toLowerCase()}${transfer.memo ? ` · ${transfer.memo}` : ""}.`,
      createdAt: transfer.updatedAt || transfer.createdAt,
      unread: !read.has(`transfer-${transfer.id}`) && open,
      href:
        transfer.kind === "wire"
          ? "/banking/wire"
          : transfer.kind === "mobile_deposit"
            ? "/banking/deposit"
            : transfer.kind === "pay_person"
              ? "/banking/pay"
              : "/banking/transfer",
      tone: transfer.kind === "pay_person" ? "person" : "ops",
      initials: initialsFrom(transfer.recipientName || "Operations"),
    });
  }

  for (const loan of input.loans) {
    const open =
      loan.status === "applied" || loan.status === "review" || loan.status === "approved";
    messages.push({
      id: `loan-${loan.id}`,
      title: loanTypeLabel(loan.type),
      preview: `Your ${loanTypeLabel(loan.type).toLowerCase()} for ${formatMoney(loan.amountCents)} is ${loanStatusLabel(loan.status).toLowerCase()}${loan.note ? ` · ${loan.note}` : ""}.`,
      createdAt: loan.updatedAt || loan.createdAt,
      unread: !read.has(`loan-${loan.id}`) && open,
      href: "/banking/loans",
      tone: "ops",
      initials: "LN",
    });
  }

  messages.push({
    id: "alert-fraud",
    title: "Fraud alert",
    preview:
      "Please be aware of fraudulent text-message phishing attacks that ask for your transfer PIN or account number. Southern Ridge will never ask for those by text.",
    createdAt: "2024-07-16T14:00:00.000Z",
    unread: !read.has("alert-fraud"),
    href: "/banking/messages",
    tone: "alert",
    initials: "SR",
  });

  return messages.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function formatInboxDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const sameWeek =
    Math.abs(now.getTime() - date.getTime()) < 6 * 24 * 60 * 60 * 1000 &&
    now.getFullYear() === date.getFullYear();
  if (sameWeek) {
    return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
