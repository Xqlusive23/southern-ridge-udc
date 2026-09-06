import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { BankingLink } from "@/components/banking-link";
import { BankingScreen } from "@/components/banking-screen";
import { requireSession } from "@/lib/auth";
import { formatAccountType, formatDate, formatMoney } from "@/lib/money";
import { getMemberBanking } from "@/lib/store";

export default async function AccountsPage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");

  return (
    <BankingScreen
      title="Accounts"
      description="Open an account to review its balance, numbers, and posted activity."
    >
      <div className="grid gap-4">
        {banking.accounts.map((account) => {
          const activity = banking.transactions.filter(
            (item) => item.accountId === account.id,
          ).length;
          return (
            <BankingLink
              key={account.id}
              href={`/banking/accounts/${account.id}`}
              className="block rounded-[1.4rem] bg-[#16382B] px-5 py-5 text-white shadow-[0_16px_36px_rgba(8,24,20,0.16)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] tracking-[0.16em] text-white/55 uppercase">
                    {formatAccountType(account.type)}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{account.name}</p>
                </div>
                <p className="text-right text-2xl font-semibold tabular-nums">
                  {formatMoney(account.balanceCents)}
                </p>
              </div>
              <div className="mt-6 flex items-end justify-between text-sm text-white/70">
                <div>
                  <p className="tabular-nums">{account.accountNumber}</p>
                  <p className="mt-1 text-xs">Opened {formatDate(account.openedAt)}</p>
                </div>
                <p className="inline-flex items-center gap-1 text-sm font-medium text-white">
                  {activity} {activity === 1 ? "transaction" : "transactions"}
                  <ChevronRight className="size-4" />
                </p>
              </div>
            </BankingLink>
          );
        })}
      </div>
    </BankingScreen>
  );
}
