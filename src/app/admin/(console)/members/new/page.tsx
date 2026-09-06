import { CreateMemberForm } from "@/components/admin-forms";
import { AdminMembersDesk } from "@/components/admin-members-desk";
import { AdminCard, AdminPageHeader } from "@/components/admin-ui";
import { toListedMember } from "@/lib/admin-members";
import { listMembers } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AddMemberPage() {
  const pending = (await listMembers()).filter((member) => member.status === "pending");

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Add member"
        description="Open Everyday Checking and Ridge Savings for a new membership, or approve an application waiting at the desk."
      />

      <AdminCard>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-[#8A6D3B] uppercase">
          New membership
        </p>
        <h2 className="admin-display mt-1 text-xl font-medium text-[#0B2340]">
          Create a member
        </h2>
        <p className="mt-1 mb-5 text-sm text-[#5C6B64]">
          Members created here are active immediately. Public sign-ups stay
          pending until you approve them.
        </p>
        <CreateMemberForm />
      </AdminCard>

      <section className="grid gap-4">
        <div>
          <h2 className="admin-display text-xl font-medium text-[#0B2340]">
            Waiting for approval
          </h2>
          <p className="mt-1 text-sm text-[#5C6B64]">
            Public applications stay here until an officer activates them.
          </p>
        </div>
        {pending.length === 0 ? (
          <AdminCard className="px-4 py-10 text-center text-sm text-[#5C6B64]">
            No applications are waiting.
          </AdminCard>
        ) : (
          <AdminMembersDesk members={pending.map(toListedMember)} showCity />
        )}
      </section>
    </div>
  );
}
