import { redirect } from "next/navigation";
import { BankingScreen } from "@/components/banking-screen";
import { LoanApplicationForm, MemberLoanList } from "@/components/member-services";
import { t } from "@/lib/i18n";
import { requireSession } from "@/lib/auth";
import { getMemberBanking } from "@/lib/store";

export default async function LoansPage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");

  return (
    <BankingScreen
      title={t(banking.user.locale, "loanTitle")}
      description={t(banking.user.locale, "loanDesc")}
    >
      <LoanApplicationForm />
      <div className="mt-8">
        <MemberLoanList loans={banking.loans} />
      </div>
    </BankingScreen>
  );
}
