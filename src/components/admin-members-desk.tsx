"use client";

import Link from "next/link";
import { MemberAmountForm, MemberDeskActions } from "@/components/admin-member-row";
import { StatusPill } from "@/components/shared";
import type { ListedMember } from "@/lib/admin-members";
import { formatMoney } from "@/lib/money";

function Identity({ member, showCity }: { member: ListedMember; showCity?: boolean }) {
  return (
    <div className="min-w-0">
      <Link
        href={`/admin/members/${member.id}`}
        className="font-medium break-words text-[#0B2340] underline-offset-4 hover:underline"
      >
        {member.firstName} {member.lastName}
      </Link>
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

function Status({ member }: { member: ListedMember }) {
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

export function AdminMembersDesk({
  members,
  showCity = false,
}: {
  members: ListedMember[];
  showCity?: boolean;
}) {
  return (
    <>
      <div className="grid gap-4 lg:hidden">
        {members.map((member) => (
          <article
            key={member.id}
            className="rounded-2xl border border-[#e2ddd2] bg-white p-4 shadow-[0_1px_2px_rgba(11,35,64,0.04)]"
          >
            <div className="flex items-start justify-between gap-3">
              <Identity member={member} showCity={showCity} />
              <p className="shrink-0 text-right text-sm font-semibold tabular-nums text-[#0B2340]">
                {formatMoney(member.totalCents)}
              </p>
            </div>
            <div className="mt-3">
              <Status member={member} />
            </div>
            <div className="mt-4 grid gap-4 border-t border-[#f0eee8] pt-4">
              <div>
                <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-[#8A938C] uppercase">
                  Amount & history
                </p>
                <MemberAmountForm member={member} />
              </div>
              <div>
                <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-[#8A938C] uppercase">
                  Desk actions
                </p>
                <MemberDeskActions member={member} />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[#e2ddd2] bg-white shadow-[0_1px_2px_rgba(11,35,64,0.04)] lg:block">
        <table className="w-full min-w-[72rem] text-left text-sm">
          <thead className="border-b border-[#e2ddd2] bg-[#F7F6F2]/95 text-[11px] tracking-[0.14em] text-[#5C6B64] uppercase">
            <tr>
              <th className="px-5 py-3.5 font-medium">{showCity ? "Member" : "Name"}</th>
              {showCity ? <th className="px-5 py-3.5 font-medium">City</th> : null}
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium text-right">
                {showCity ? "Combined" : "Balance"}
              </th>
              <th className="px-5 py-3.5 font-medium">Amount & history</th>
              <th className="px-5 py-3.5 font-medium">Desk actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-[#f0eee8] last:border-0 align-top">
                <td className="px-5 py-4">
                  <Identity member={member} />
                </td>
                {showCity ? (
                  <td className="px-5 py-4 text-sm text-[#3d4a44]">
                    {member.city || "—"}
                    {member.state ? `, ${member.state}` : ""}
                  </td>
                ) : null}
                <td className="px-5 py-4">
                  <Status member={member} />
                </td>
                <td className="px-5 py-4 text-right font-medium tabular-nums text-[#0B2340]">
                  {formatMoney(member.totalCents)}
                </td>
                <td className="px-5 py-4">
                  <MemberAmountForm member={member} />
                </td>
                <td className="px-5 py-4">
                  <MemberDeskActions member={member} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
