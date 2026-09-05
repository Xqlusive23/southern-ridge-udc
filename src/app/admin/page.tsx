import Link from "next/link";
import { AdminShell } from "@/app/admin/layout";
import { StatusPill, TransactionList } from "@/components/shared";
import { formatMoney } from "@/lib/money";
import { adminSnapshot, listMembers } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [snapshot, members] = await Promise.all([adminSnapshot(), listMembers()]);

  return (
    <AdminShell>
      <div className="mx-auto grid max-w-6xl gap-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#2F7A45] uppercase">
            Operations
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#0B2340]">
            Membership desk
          </h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Members" value={String(snapshot.memberCount)} />
          <Stat label="Active" value={String(snapshot.activeMembers)} />
          <Stat label="Frozen" value={String(snapshot.frozenMembers)} />
          <Stat label="On deposit" value={formatMoney(snapshot.deposits)} />
        </div>
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-[#0B2340]">Members</h2>
              <Link href="/admin/members" className="text-sm text-[#2F7A45]">
                Manage all
              </Link>
            </div>
            <div className="overflow-x-auto rounded-xl border bg-white">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="border-b bg-[#F7F6F2] text-xs tracking-wide text-[#5C6B64] uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/members/${member.id}`}
                          className="font-medium text-[#0B2340] hover:underline"
                        >
                          {member.firstName} {member.lastName}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={member.status} />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatMoney(member.totalCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h2 className="mb-3 font-semibold text-[#0B2340]">Latest postings</h2>
            <TransactionList
              transactions={snapshot.recentTransactions}
              accounts={members.flatMap((member) => member.accounts)}
              empty="No recent postings."
            />
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white px-5 py-4">
      <p className="text-xs tracking-[0.14em] text-[#5C6B64] uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[#0B2340]">{value}</p>
    </div>
  );
}
