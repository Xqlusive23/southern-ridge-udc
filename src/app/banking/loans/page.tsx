import { redirect } from "next/navigation";
import { BankingScreen } from "@/components/banking-screen";
import { LoanApplicationForm, MemberLoanList } from "@/components/member-services";
import { requireSession } from "@/lib/auth";
import { getMemberBanking } from "@/lib/store";

export default async function LoansPage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");

  return (
    <BankingScreen
      title="Loan"
      description="Apply for a personal, auto, home, or line-of-credit loan. Only the operations desk can approve, deny, or activate it."
    >
      <LoanApplicationForm />
      <div className="mt-8">
        <MemberLoanList loans={banking.loans} />
      </div>
    </BankingScreen>
  );
}
