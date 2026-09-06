import { redirect } from "next/navigation";
import { BankingScreen } from "@/components/banking-screen";
import { TransactionList } from "@/components/shared";
import { requireSession } from "@/lib/auth";
import { getMemberBanking } from "@/lib/store";

export default async function ActivityPage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");

  return (
    <BankingScreen
      title="Activity"
      description="View-only history of deposits, purchases, transfers, and officer adjustments."
    >
      <TransactionList
        className="border-[#e2ddd2]"
        transactions={banking.transactions}
        accounts={banking.accounts}
        empty="No transactions posted to these accounts yet."
        showReceipts
      />
    </BankingScreen>
  );
}
