import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountCard, TransactionList } from "@/components/shared";
import { requireSession } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { getMemberBanking } from "@/lib/store";

export default async function BankingHomePage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#0B2340]">
          Good to see you, {session.firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Combined available balance across your Southern Ridge accounts.
        </p>
        <p className="mt-3 text-4xl font-semibold tracking-tight text-[#0B2340]">
          {formatMoney(banking.totalCents)}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {banking.accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/banking/transfer"
          className="rounded-md bg-[#0B2340] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#08182C]"
        >
          Transfer money
        </Link>
        <Link
          href="/banking/activity"
          className="rounded-md border border-[#0B2340]/15 bg-white px-4 py-2.5 text-sm font-medium text-[#0B2340]"
        >
          View activity
        </Link>
      </div>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-[#0B2340]">Recent activity</h2>
          <Link href="/banking/activity" className="text-sm text-[#2F7A45]">
            See all
          </Link>
        </div>
        <TransactionList
          transactions={banking.transactions.slice(0, 5)}
          accounts={banking.accounts}
          empty="No activity yet. Transfers and officer adjustments will appear here."
        />
      </section>
    </div>
  );
}
