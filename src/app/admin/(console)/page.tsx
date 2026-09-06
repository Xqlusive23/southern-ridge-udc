import Link from "next/link";
import { AdminMembersRoster } from "@/components/admin-members-table";
import { AdminCard, AdminPageHeader, AdminStat } from "@/components/admin-ui";
import { toListedMember } from "@/lib/admin-members";
import { TransactionList } from "@/components/shared";
import { formatMoney } from "@/lib/money";
import { adminSnapshot, getSettings, listMembers } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [snapshot, members, settings] = await Promise.all([
    adminSnapshot(),
    listMembers(),
    getSettings(),
  ]);

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Membership desk"
        description="Review memberships, post ledger amounts, and keep outgoing transfer policy current."
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <AdminStat
          label="Members"
          value={String(snapshot.memberCount)}
          href="/admin/members"
          hint="Open the full roster"
        />
        <AdminStat
          label="Pending approval"
          value={String(snapshot.pendingMembers)}
          href="/admin/members/new"
        />
        <AdminStat
          label="Active"
          value={String(snapshot.activeMembers)}
          href="/admin/members"
        />
        <AdminStat
          label="Frozen"
          value={String(snapshot.frozenMembers)}
          href="/admin/members"
        />
        <AdminStat
          label="Banned"
          value={String(snapshot.bannedMembers)}
          href="/admin/members"
        />
        <AdminStat
          label="Pending transfers"
          value={String(snapshot.pendingTransfers)}
          href="/admin/members"
        />
        <AdminStat label="On deposit" value={formatMoney(snapshot.deposits)} />
      </div>

      {snapshot.requireTransferPin ? (
        <p className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-5 py-3.5 text-sm text-emerald-950 shadow-sm">
          Transfer PINs are required. {snapshot.pinOnFile} of{" "}
          {snapshot.memberCount} members have a PIN on file.
        </p>
      ) : null}
      {settings.operationsNote ? (
        <AdminCard>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#8A6D3B] uppercase">
            Desk note
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#0B2340]">
            {settings.operationsNote}
          </p>
        </AdminCard>
      ) : null}

      <section className="grid gap-8">
        <div>
          <div className="mb-4 flex min-w-0 items-end justify-between gap-3">
            <h2 className="admin-display text-xl font-medium text-[#0B2340]">
              Members
            </h2>
            <Link
              href="/admin/members"
              className="text-sm font-medium text-[#2F7A45] underline-offset-4 transition-all hover:underline"
            >
              Manage all
            </Link>
          </div>
          <AdminMembersRoster
            members={members
              .filter((member) => member.status === "active")
              .map(toListedMember)}
          />
        </div>
        <div>
          <h2 className="admin-display mb-4 text-xl font-medium text-[#0B2340]">
            Latest postings
          </h2>
          <TransactionList
            className="admin-ledger min-w-0 overflow-hidden rounded-2xl border-[#e2ddd2] shadow-[0_1px_2px_rgba(11,35,64,0.04),0_8px_24px_rgba(11,35,64,0.04)]"
            transactions={snapshot.recentTransactions}
            accounts={members.flatMap((member) => member.accounts)}
            empty="No recent postings."
          />
        </div>
      </section>
    </div>
  );
}
