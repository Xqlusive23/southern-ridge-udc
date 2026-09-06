import { AdminMembersRoster } from "@/components/admin-members-table";
import { AdminCard, AdminPageHeader } from "@/components/admin-ui";
import { toListedMember } from "@/lib/admin-members";
import { listMembers } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const members = (await listMembers())
    .filter((member) => member.status !== "pending")
    .filter((member) => {
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
    <div className="admin-page">
      <AdminPageHeader
        title="Members"
        description="Open a member to freeze the account or set transfer status to hold, pending, processing, or completed."
        actions={
          <form className="flex w-full min-w-0 gap-2 sm:w-[22rem]">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name, email, account #"
              className="admin-field h-10 min-w-0 flex-1 rounded-lg px-3 text-sm"
            />
            <button
              type="submit"
              className="h-10 shrink-0 rounded-lg bg-[#0B2340] px-3 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[#08182C] active:scale-[0.98] sm:px-4"
            >
              Search
            </button>
          </form>
        }
      />

      {members.length === 0 ? (
        <AdminCard className="px-4 py-12 text-center text-sm text-[#5C6B64]">
          {query
            ? "No members match that search."
            : "No members yet. New applications are under Add member."}
        </AdminCard>
      ) : (
        <AdminMembersRoster members={members.map(toListedMember)} />
      )}
    </div>
  );
}
