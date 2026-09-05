import Link from "next/link";
import { AdminShell } from "@/app/admin/layout";
import { CreateMemberForm } from "@/components/admin-forms";
import { StatusPill } from "@/components/shared";
import { formatMoney } from "@/lib/money";
import { listMembers } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const members = (await listMembers()).filter((member) => {
    if (!query) return true;
    const haystack = [
      member.firstName,
      member.lastName,
      member.email,
      member.phone,
      member.city,
      ...member.accounts.map((account) => account.accountNumber),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  return (
    <AdminShell>
      <div className="mx-auto grid max-w-6xl gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#0B2340]">Members</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Open a record to change personal details or post a balance
              adjustment.
            </p>
          </div>
          <form className="flex w-full gap-2 sm:w-80">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name, email, account #"
              className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm"
            />
            <button
              type="submit"
              className="h-10 rounded-lg bg-[#0B2340] px-3 text-sm font-medium text-white"
            >
              Search
            </button>
          </form>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="overflow-x-auto rounded-xl border bg-white">
            {members.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                No members match that search.
              </p>
            ) : (
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="border-b bg-[#F7F6F2] text-xs tracking-wide text-[#5C6B64] uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Member</th>
                    <th className="px-4 py-3 font-medium">City</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Combined
                    </th>
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
                        {member.city || "—"}
                        {member.state ? `, ${member.state}` : ""}
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
            )}
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <h2 className="font-semibold text-[#0B2340]">Add a member</h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              Opens Everyday Checking and Ridge Savings at $0.00.
            </p>
            <CreateMemberForm />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
