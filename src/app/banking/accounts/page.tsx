import { redirect } from "next/navigation";
import { AccountCard } from "@/components/shared";
import { requireSession } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/money";
import { getMemberBanking } from "@/lib/store";

export default async function AccountsPage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#0B2340]">Accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Account and routing numbers for deposits and outgoing transfers.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {banking.accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b bg-[#F7F6F2] text-xs tracking-wide text-[#5C6B64] uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Number</th>
              <th className="px-4 py-3 font-medium">Routing</th>
              <th className="px-4 py-3 font-medium">Opened</th>
              <th className="px-4 py-3 font-medium text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {banking.accounts.map((account) => (
              <tr key={account.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{account.name}</td>
                <td className="px-4 py-3 tabular-nums">{account.accountNumber}</td>
                <td className="px-4 py-3 tabular-nums">{account.routingNumber}</td>
                <td className="px-4 py-3">{formatDate(account.openedAt)}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatMoney(account.balanceCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
