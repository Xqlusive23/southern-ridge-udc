import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/app/admin/layout";
import {
  AccountStatusForm,
  AdjustBalanceForm,
  EditMemberForm,
  OpenAccountForm,
  ResetPasswordForm,
} from "@/components/admin-forms";
import { StatusPill, TransactionList } from "@/components/shared";
import {
  formatAccountType,
  formatDate,
  formatMoney,
  memberDisplayName,
} from "@/lib/money";
import { getMemberDetail } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getMemberDetail(id);
  if (!detail || detail.user.role !== "member") notFound();

  return (
    <AdminShell>
      <div className="mx-auto grid max-w-6xl gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/admin/members" className="text-sm text-[#2F7A45]">
              ← All members
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-[#0B2340]">
              {memberDisplayName(detail.user)}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusPill status={detail.user.status} />
              <span className="text-sm text-muted-foreground">
                Combined {formatMoney(detail.totalCents)}
              </span>
            </div>
          </div>
          <AdjustBalanceForm accounts={detail.accounts} userId={detail.user.id} />
        </div>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="mb-4 font-semibold text-[#0B2340]">
            Member information
          </h2>
          <EditMemberForm user={detail.user} />
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="font-semibold text-[#0B2340]">Accounts</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b text-xs tracking-wide text-[#5C6B64] uppercase">
                <tr>
                  <th className="pb-3 font-medium">Account</th>
                  <th className="pb-3 font-medium">Number</th>
                  <th className="pb-3 font-medium">Opened</th>
                  <th className="pb-3 font-medium text-right">Balance</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {detail.accounts.map((account) => (
                  <tr key={account.id} className="border-b last:border-0">
                    <td className="py-3">
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatAccountType(account.type)}
                      </p>
                    </td>
                    <td className="py-3 tabular-nums">{account.accountNumber}</td>
                    <td className="py-3">{formatDate(account.openedAt)}</td>
                    <td className="py-3 text-right tabular-nums">
                      {formatMoney(account.balanceCents)}
                    </td>
                    <td className="py-3">
                      <AccountStatusForm
                        account={account}
                        userId={detail.user.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 border-t pt-5">
            <h3 className="mb-3 text-sm font-medium text-[#0B2340]">
              Open another account
            </h3>
            <OpenAccountForm userId={detail.user.id} />
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="mb-4 font-semibold text-[#0B2340]">Reset password</h2>
          <ResetPasswordForm userId={detail.user.id} />
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-[#0B2340]">Ledger</h2>
          <TransactionList
            transactions={detail.transactions}
            accounts={detail.accounts}
            empty="No postings on this membership yet."
          />
        </section>
      </div>
    </AdminShell>
  );
}
