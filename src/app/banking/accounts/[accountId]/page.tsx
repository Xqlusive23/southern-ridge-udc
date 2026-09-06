import { notFound, redirect } from "next/navigation";
import { BankingLink } from "@/components/banking-link";
import { BankingScreen } from "@/components/banking-screen";
import { TransactionList } from "@/components/shared";
import { requireSession } from "@/lib/auth";
import { t } from "@/lib/i18n";
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
  const locale = banking.user.locale;
  const statusLabel =
    account.status === "active"
      ? t(locale, "current")
      : account.status === "frozen"
        ? t(locale, "frozen")
        : t(locale, "closed");

  return (
    <BankingScreen
      title={account.name}
      description={`${formatAccountType(account.type, locale)} · ${statusLabel}`}
    >
      <div className="mb-6 rounded-2xl bg-[#16382B] px-5 py-5 text-white">
        <p className="text-sm text-white/65">{t(locale, "availableBalance")}</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums">
          {formatMoney(account.balanceCents, banking.user)}
        </p>
        <div className="mt-4 grid gap-1 text-sm text-white/75">
          <p>
            {t(locale, "account")}{" "}
            <span className="tabular-nums text-white">{account.accountNumber}</span>
          </p>
          <p>
            {t(locale, "routing")}{" "}
            <span className="tabular-nums text-white">{account.routingNumber}</span>
          </p>
          <p>
            {t(locale, "opened")} {formatDate(account.openedAt, locale)}
          </p>
        </div>
      </div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-[#122033]">{t(locale, "transactions")}</h2>
        <BankingLink
          href="/banking/accounts"
          className="text-sm font-medium text-[#2F7A45] underline-offset-4 hover:underline"
        >
          {t(locale, "allAccounts")}
        </BankingLink>
      </div>
      <TransactionList
        className="border-[#e2ddd2]"
        transactions={transactions}
        accounts={[account]}
        empty={t(locale, "noTransactions")}
        showReceipts
      />
    </BankingScreen>
  );
}
