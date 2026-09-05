import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/member-forms";
import { requireSession } from "@/lib/auth";
import { getMemberBanking } from "@/lib/store";

export default async function ProfilePage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#0B2340]">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your contact details current. Name and email changes go through
          the operations desk.
        </p>
      </div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <ProfileForm user={banking.user} />
      </div>
    </div>
  );
}
