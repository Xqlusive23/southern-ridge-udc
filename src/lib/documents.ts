import type { Account, BankSettings, Transaction } from "@/lib/types";

export function confirmationNumber(id: string) {
  const compact = id.replace(/[^a-zA-Z0-9]/g, "").slice(-10).toUpperCase();
  return `SR-${compact || "RECEIPT"}`;
}

export function formatPeriodId(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function parsePeriodId(period: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { year, month, start, end };
}

export type StatementPeriod = {
  id: string;
  label: string;
  kind: "final" | "interim";
};

export function listStatementPeriods(openedAt: string, now = new Date()) {
  const start = new Date(openedAt);
  if (Number.isNaN(start.getTime())) return [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth(), 1);
  const periods: StatementPeriod[] = [];
  while (cursor <= last) {
    const id = formatPeriodId(cursor);
    const isCurrent =
      cursor.getFullYear() === now.getFullYear() &&
      cursor.getMonth() === now.getMonth();
    periods.push({
      id,
      label: cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      kind: isCurrent ? "interim" : "final",
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return periods.reverse();
}

export function institutionAddress(settings: BankSettings) {
  return `${settings.address}, ${settings.city}, ${settings.state} ${settings.zip}`;
}

export function openingBalanceCents(
  transactions: Transaction[],
  accountId: string,
  start: Date,
) {
  const prior = transactions
    .filter(
      (item) =>
        item.accountId === accountId && new Date(item.createdAt) < start,
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return prior[0]?.balanceAfterCents ?? 0;
}

export function statementLines(
  transactions: Transaction[],
  accountId: string,
  start: Date,
  end: Date,
) {
  return transactions
    .filter((item) => {
      if (item.accountId !== accountId) return false;
      const date = new Date(item.createdAt);
      return date >= start && date <= end;
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function closingBalanceCents(
  lines: Transaction[],
  openingCents: number,
) {
  return lines.at(-1)?.balanceAfterCents ?? openingCents;
}

export function accountsForStatement(accounts: Account[]) {
  return [...accounts].sort((a, b) => a.name.localeCompare(b.name));
}
