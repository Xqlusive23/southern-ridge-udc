import { notFound, redirect } from "next/navigation";
import { BankingLink } from "@/components/banking-link";
import { BankingScreen } from "@/components/banking-screen";
import { TransactionList } from "@/components/shared";
import { requireSession } from "@/lib/auth";
import { formatAccountType, formatDate, formatMoney } from "@/lib/money";
import { getMemberBanking } from "@/lib/store";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const { accountId } = await params;
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");
  const account = banking.accounts.find((item) => item.id === accountId);
  if (!account) notFound();
  const transactions = banking.transactions.filter(
    (item) => item.accountId === account.id,
  );

  return (
    <BankingScreen
      title={account.name}
      description={`${formatAccountType(account.type)} · ${account.status === "active" ? "Current" : account.status}`}
    >
      <div className="mb-6 rounded-2xl bg-[#16382B] px-5 py-5 text-white">
        <p className="text-sm text-white/65">Available balance</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums">
          {formatMoney(account.balanceCents)}
        </p>
        <div className="mt-4 grid gap-1 text-sm text-white/75">
          <p>
            Account <span className="tabular-nums text-white">{account.accountNumber}</span>
          </p>
          <p>
            Routing <span className="tabular-nums text-white">{account.routingNumber}</span>
          </p>
          <p>Opened {formatDate(account.openedAt)}</p>
        </div>
      </div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-[#122033]">Transactions</h2>
        <BankingLink
          href="/banking/accounts"
          className="text-sm font-medium text-[#2F7A45] underline-offset-4 hover:underline"
        >
          All accounts
        </BankingLink>
      </div>
      <TransactionList
        className="border-[#e2ddd2]"
        transactions={transactions}
        accounts={[account]}
        empty="No transactions have posted to this account yet."
        showReceipts
      />
    </BankingScreen>
  );
}
