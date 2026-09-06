import { BankLogo } from "@/components/logo";
import { PrintActions } from "@/components/print-actions";
import { StatusPill } from "@/components/shared";
import {
  accountsForStatement,
  closingBalanceCents,
  institutionAddress,
  openingBalanceCents,
  statementLines,
  type StatementPeriod,
} from "@/lib/documents";
import {
  amountToneClass,
  formatAccountType,
  formatDate,
  formatDateTime,
  formatMoney,
  memberDisplayName,
} from "@/lib/money";
import type { Account, BankSettings, PublicUser, Transaction } from "@/lib/types";

export function BankingStatement({
  settings,
  member,
  accounts,
  transactions,
  period,
  start,
  end,
}: {
  settings: BankSettings;
  member: PublicUser;
  accounts: Account[];
  transactions: Transaction[];
  period: StatementPeriod;
  start: Date;
  end: Date;
}) {
  const listed = accountsForStatement(accounts);
  const moneyPrefs = { currency: member.currency, locale: member.locale };

  return (
    <article className="banking-document mx-auto w-full max-w-3xl overflow-hidden rounded-sm border border-[#c8c1b2] bg-[#fffdf8] text-[#1b1b1b] shadow-[0_18px_40px_rgba(11,35,64,0.12)]">
      <header className="border-b-4 border-[#0B2340] bg-[#0B2340] px-6 py-5 text-center text-white">
        <p className="font-serif text-[1.35rem] leading-tight font-semibold tracking-wide sm:text-2xl">
          {settings.institutionName}
        </p>
        <p className="mt-1 text-[11px] tracking-[0.22em] text-[#F4E7C5] uppercase">
          {period.kind === "final" ? "Official monthly statement" : "Interim monthly statement"}
        </p>
      </header>

      <div className="flex items-start justify-between gap-4 border-b border-[#e4ddd0] px-6 py-4">
        <BankLogo />
        <div className="text-right text-[11px] leading-relaxed text-[#5C6B64]">
          <p>{settings.branchName}</p>
          <p>{institutionAddress(settings)}</p>
          <p>Routing {listed[0]?.routingNumber ?? ""}</p>
        </div>
      </div>

      <div className="grid gap-4 border-b border-[#e4ddd0] px-6 py-5 sm:grid-cols-2">
        <div>
          <p className="text-[10px] tracking-[0.16em] text-[#8A938C] uppercase">
            Member
          </p>
          <p className="mt-1 font-medium text-[#0B2340]">{memberDisplayName(member)}</p>
          <p className="text-sm text-[#5C6B64]">{member.address}</p>
          <p className="text-sm text-[#5C6B64]">
            {member.city}, {member.state} {member.zip}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-[10px] tracking-[0.16em] text-[#8A938C] uppercase">
            Statement period
          </p>
          <p className="mt-1 font-medium text-[#0B2340]">{period.label}</p>
          <p className="text-sm text-[#5C6B64]">
            {formatDate(start.toISOString(), member.locale)} – {formatDate(end.toISOString(), member.locale)}
          </p>
          <p className="mt-2 text-sm text-[#5C6B64]">
            Prepared {formatDate(new Date().toISOString(), member.locale)}
          </p>
        </div>
      </div>

      {listed.map((account) => {
        const opening = openingBalanceCents(transactions, account.id, start);
        const lines = statementLines(transactions, account.id, start, end);
        const closing = closingBalanceCents(lines, opening);
        return (
          <section key={account.id} className="border-b border-[#e4ddd0] px-6 py-5 last:border-b-0">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] tracking-[0.16em] text-[#2F7A45] uppercase">
                  {formatAccountType(account.type)}
                </p>
                <h2 className="font-serif text-xl text-[#0B2340]">{account.name}</h2>
                <p className="font-mono text-xs text-[#5C6B64]">
                  Account {account.accountNumber}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-[#5C6B64]">
                  Opening {formatMoney(opening, moneyPrefs)}
                </p>
                <p className="font-semibold text-[#0B2340]">
                  Closing {formatMoney(closing, moneyPrefs)}
                </p>
              </div>
            </div>

            {lines.length === 0 ? (
              <p className="mt-4 text-sm text-[#8A938C]">No activity in this period.</p>
            ) : (
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e4ddd0] text-[10px] tracking-[0.14em] text-[#8A938C] uppercase">
                    <th className="py-2 font-medium">Date</th>
                    <th className="py-2 font-medium">Description</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 text-right font-medium">Amount</th>
                    <th className="hidden py-2 text-right font-medium sm:table-cell">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((item) => (
                    <tr key={item.id} className="border-b border-[#f0eee8] last:border-0">
                      <td className="py-2 align-top whitespace-nowrap text-[#5C6B64]">
                        {formatDateTime(item.createdAt, member.locale)}
                      </td>
                      <td className="py-2 align-top">
                        <p className="font-medium text-[#0B2340]">{item.description}</p>
                        {item.counterparty ? (
                          <p className="text-xs text-[#8A938C]">{item.counterparty}</p>
                        ) : null}
                      </td>
                      <td className="py-2 align-top">
                        <StatusPill status={item.status} />
                      </td>
                      <td
                        className={`py-2 align-top text-right font-semibold tabular-nums ${amountToneClass(item.amountCents)}`}
                      >
                        {item.amountCents >= 0 ? "+" : ""}
                        {formatMoney(item.amountCents, moneyPrefs)}
                      </td>
                      <td className="hidden py-2 align-top text-right tabular-nums text-[#5C6B64] sm:table-cell">
                        {formatMoney(item.balanceAfterCents, moneyPrefs)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        );
      })}

      <footer className="border-t border-[#e4ddd0] px-6 py-4 text-[11px] leading-relaxed text-[#5C6B64]">
        <p>
          {period.kind === "final"
            ? "This is your end-of-month statement for the closed period."
            : "This is an interim statement for the current month. A final statement is available after month end."}{" "}
          Please review all items promptly and report errors to{" "}
          {settings.memberDeskEmail}.
        </p>
        <div className="mt-4">
          <PrintActions label="Print statement" />
        </div>
      </footer>
    </article>
  );
}
