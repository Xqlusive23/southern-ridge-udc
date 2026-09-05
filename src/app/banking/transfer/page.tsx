import { redirect } from "next/navigation";
import { TransferForm } from "@/components/member-forms";
import { requireSession } from "@/lib/auth";
import { getMemberBanking } from "@/lib/store";

export default async function TransferPage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");

  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#0B2340]">Transfers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Move money between your accounts or send it to another Southern Ridge
          member by account number.
        </p>
      </div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <TransferForm accounts={banking.accounts} />
      </div>
    </div>
  );
}
