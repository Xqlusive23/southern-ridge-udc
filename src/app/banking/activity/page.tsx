import { redirect } from "next/navigation";
import { BankingScreen } from "@/components/banking-screen";
import { TransactionList } from "@/components/shared";
import { t } from "@/lib/i18n";
import { requireSession } from "@/lib/auth";
import { getMemberBanking } from "@/lib/store";

export default async function ActivityPage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");

  return (
    <BankingScreen
      title={t(banking.user.locale, "activity")}
      description={t(banking.user.locale, "activityDesc")}
    >
      <TransactionList
        className="border-[#e2ddd2]"
        transactions={banking.transactions}
        accounts={banking.accounts}
        empty={t(banking.user.locale, "noTransactions")}
        showReceipts
      />
    </BankingScreen>
  );
}
