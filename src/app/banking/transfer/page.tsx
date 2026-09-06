import { redirect } from "next/navigation";
import { BankingScreen } from "@/components/banking-screen";
import { TransferForm } from "@/components/member-forms";
import { requireSession } from "@/lib/auth";
import { getMemberBanking } from "@/lib/store";
import { US_BANKS } from "@/lib/us-banks";

export default async function TransferPage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");

  return (
    <BankingScreen
      title="Transfer"
      description="Send money to another person or between your own accounts. Recipient email and transfer PIN are required."
    >
      <TransferForm
        accounts={banking.accounts}
        banks={US_BANKS}
        hasPin={banking.user.hasTransferPin}
      />
    </BankingScreen>
  );
}
