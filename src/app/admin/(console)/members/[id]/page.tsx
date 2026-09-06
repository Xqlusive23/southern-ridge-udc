import Link from "next/link";
import { notFound } from "next/navigation";
import { AdjustBalanceForm } from "@/components/admin-forms";
import { AdminMemberDesk, MemberSummary } from "@/components/admin-member-desk";
import { memberDisplayName } from "@/lib/money";
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
  const initials = `${detail.user.firstName[0] ?? ""}${detail.user.lastName[0] ?? ""}`;

  return (
    <div className="admin-page">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/admin/members"
            className="text-sm font-medium text-[#2F7A45] underline-offset-4 transition-all hover:underline"
          >
            ← All members
          </Link>
          <div className="mt-4 flex items-start gap-4">
            <div
              aria-hidden
              className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#0B2340] text-lg font-medium tracking-wide text-[#F4E7C5] shadow-[0_8px_20px_rgba(11,35,64,0.18)]"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#2F7A45] uppercase">
                Member record
              </p>
              <h1 className="mt-1 text-2xl font-medium tracking-tight break-words text-[#0B2340] sm:text-3xl">
                {memberDisplayName(detail.user)}
              </h1>
              <p className="mt-1 truncate text-sm text-[#5C6B64]">{detail.user.email}</p>
            </div>
          </div>
          <MemberSummary
            status={detail.user.status}
            outgoingStatus={detail.user.defaultOutgoingStatus}
            totalCents={detail.totalCents}
            hasTransferPin={detail.user.hasTransferPin}
            contactCount={detail.user.contacts.length}
          />
        </div>
        <AdjustBalanceForm accounts={detail.accounts} userId={detail.user.id} />
      </div>

      <AdminMemberDesk
        user={detail.user}
        accounts={detail.accounts}
        cards={detail.cards}
        transactions={detail.transactions}
        transfers={detail.transfers}
        loans={detail.loans}
      />
    </div>
  );
}
