import { redirect } from "next/navigation";
import { BankingScreen } from "@/components/banking-screen";
import { MemberRequestList, PayPersonForm } from "@/components/member-services";
import { requireSession } from "@/lib/auth";
import { getMemberBanking } from "@/lib/store";

export default async function PayPersonPage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");
  const usable = banking.accounts.filter((account) => account.status === "active");
  const people = banking.transfers.filter((item) => item.kind === "pay_person");

  return (
    <BankingScreen
      title="Pay"
      description="Send money by name and recipient email. A transfer PIN is required on every payment."
    >
      {usable.length ? (
        <PayPersonForm
          accounts={usable}
          hasPin={banking.user.hasTransferPin}
        />
      ) : (
        <p className="text-sm text-[#5C6B64]">No active account is available.</p>
      )}
      <div className="mt-8">
        <MemberRequestList transfers={people} empty="No pay-a-person requests yet." />
      </div>
    </BankingScreen>
  );
}
