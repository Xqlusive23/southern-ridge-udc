import { redirect } from "next/navigation";
import { BankingScreen } from "@/components/banking-screen";
import { MemberRequestList, MobileDepositForm } from "@/components/member-services";
import { requireSession } from "@/lib/auth";
import { getMemberBanking } from "@/lib/store";

export default async function MobileDepositPage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");
  const usable = banking.accounts.filter((account) => account.status === "active");
  const deposits = banking.transfers.filter((item) => item.kind === "mobile_deposit");

  return (
    <BankingScreen
      title="Deposit"
      description="Submit a check for review. Operations posts the funds when the deposit is completed."
    >
      {usable.length ? (
        <MobileDepositForm accounts={usable} />
      ) : (
        <p className="text-sm text-[#5C6B64]">No active account can receive a deposit.</p>
      )}
      <div className="mt-8">
        <MemberRequestList transfers={deposits} empty="No mobile deposits yet." />
      </div>
    </BankingScreen>
  );
}
