import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusPill } from "@/components/shared";
import type { ListedMember } from "@/lib/admin-members";
import { formatMoney } from "@/lib/money";

function MemberIdentity({
  member,
  showCity,
  linked = true,
}: {
  member: ListedMember;
  showCity?: boolean;
  linked?: boolean;
}) {
  const name = `${member.firstName} ${member.lastName}`;
  return (
    <div className="min-w-0">
      {linked ? (
        <Link
          href={`/admin/members/${member.id}`}
          className="font-medium break-words text-[#0B2340] underline-offset-4 transition-all hover:underline"
        >
          {name}
        </Link>
      ) : (
        <p className="font-medium break-words text-[#0B2340]">{name}</p>
      )}
      <p className="text-xs break-all text-[#5C6B64]">{member.email}</p>
      {showCity ? (
        <p className="mt-1 text-xs text-[#3d4a44]">
          {member.city || "—"}
          {member.state ? `, ${member.state}` : ""}
        </p>
      ) : null}
      <ul className="mt-2 grid gap-0.5">
        {member.accounts.map((account) => (
          <li key={account.id} className="text-[11px] break-words text-[#8A938C]">
            {account.name} ·{" "}
            <span className="tabular-nums text-[#0B2340]">{account.accountNumber}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MemberStatus({ member }: { member: ListedMember }) {
  return (
    <div>
      <StatusPill status={member.status} />
      {member.status !== "frozen" && member.outgoingStatus ? (
        <p className="mt-1.5 text-[11px] text-[#8A938C]">
          Future transfers: {member.outgoingStatus}
        </p>
      ) : member.openTransferCount > 0 ? (
        <p className="mt-1.5 text-[11px] text-[#8A938C]">
          {member.openTransferCount} open transfer
          {member.openTransferCount === 1 ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}

export function AdminMembersRoster({ members }: { members: ListedMember[] }) {
  return (
    <>
      <div className="grid gap-3 lg:hidden">
        {members.map((member) => (
          <Link
            key={member.id}
            href={`/admin/members/${member.id}`}
            className="flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-[#e2ddd2] bg-white p-4 shadow-[0_1px_2px_rgba(11,35,64,0.04)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(11,35,64,0.08)]"
          >
            <MemberIdentity member={member} showCity linked={false} />
            <div className="flex min-w-0 shrink-0 flex-col items-end gap-2">
              <p className="text-sm font-semibold tabular-nums text-[#0B2340]">
                {formatMoney(member.totalCents)}
              </p>
              <MemberStatus member={member} />
              <ChevronRight className="size-4 text-[#8A938C]" />
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[#e2ddd2] bg-white shadow-[0_1px_2px_rgba(11,35,64,0.04),0_8px_24px_rgba(11,35,64,0.04)] lg:block">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-[#e2ddd2] bg-[#F7F6F2]/95 text-[11px] tracking-[0.14em] text-[#5C6B64] uppercase">
            <tr>
              <th className="px-5 py-3.5 font-medium">Member</th>
              <th className="px-5 py-3.5 font-medium">City</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium text-right">Combined</th>
              <th className="px-5 py-3.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-[#f0eee8] last:border-0">
                <td className="px-5 py-4">
                  <MemberIdentity member={member} />
                </td>
                <td className="px-5 py-4 text-sm text-[#3d4a44]">
                  {member.city || "—"}
                  {member.state ? `, ${member.state}` : ""}
                </td>
                <td className="px-5 py-4">
                  <MemberStatus member={member} />
                </td>
                <td className="px-5 py-4 text-right font-medium tabular-nums text-[#0B2340]">
                  {formatMoney(member.totalCents)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/members/${member.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#2F7A45] underline-offset-4 hover:underline"
                  >
                    Open
                    <ChevronRight className="size-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
