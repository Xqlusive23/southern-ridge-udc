import { redirect } from "next/navigation";
import { TransactionList } from "@/components/shared";
import { requireSession } from "@/lib/auth";
import { getMemberBanking } from "@/lib/store";

export default async function ActivityPage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#0B2340]">Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deposits, purchases, transfers, and officer adjustments.
        </p>
      </div>
      <TransactionList
        transactions={banking.transactions}
        accounts={banking.accounts}
        empty="No transactions posted to these accounts yet."
      />
    </div>
  );
}
