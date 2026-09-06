import { redirect } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { AccountCarousel, HomeActions } from "@/components/banking-home";
import { BankingLink } from "@/components/banking-link";
import { MemberPhoto } from "@/components/member-photo";
import { CreditScoreCard } from "@/components/credit-score-card";
import { TransactionList } from "@/components/shared";
import { requireSession } from "@/lib/auth";
import { buildCreditSnapshot } from "@/lib/credit-score";
import { getMemberBanking } from "@/lib/store";

export default async function BankingHomePage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");
  const initials = `${session.firstName[0] ?? ""}${session.lastName[0] ?? ""}`;
  const recent = banking.transactions.slice(0, 5);
  const credit = buildCreditSnapshot({
    user: banking.user,
    accounts: banking.accounts,
    transfers: banking.transfers,
    loans: banking.loans,
  });

  return (
    <div className="flex min-h-full flex-col">
      <div className="px-5 pt-3 pb-5 text-white lg:px-8 lg:pt-6">
        <div className="flex items-start justify-between">
          <h1 className="text-[2.1rem] leading-none font-semibold tracking-tight">
            Hi, {session.firstName}
          </h1>
          <BankingLink
            href="/banking/profile"
            className="size-12 overflow-hidden rounded-full bg-white text-sm font-semibold text-[#5C6B64] shadow-sm transition-transform duration-300 hover:scale-105"
          >
            <MemberPhoto
              photoPath={banking.user.photoPath}
              initials={initials}
              alt={`${session.firstName} ${session.lastName}`}
            />
          </BankingLink>
        </div>

        <div className="mt-7 flex items-center justify-between">
          <h2 className="text-lg font-medium">Accounts</h2>
          <BankingLink
            href="/banking/accounts"
            className="grid size-8 place-items-center rounded-full text-white/80 hover:bg-white/10"
            aria-label="Account options"
          >
            <MoreHorizontal className="size-5" />
          </BankingLink>
        </div>
        <div className="mt-3">
          <AccountCarousel accounts={banking.accounts} />
        </div>
        <div className="mt-6">
          <HomeActions />
        </div>
      </div>

      <section className="banking-sheet banking-sheet-enter flex-1 rounded-t-[1.75rem] bg-white px-5 pt-5 pb-8 shadow-[0_-18px_40px_rgba(8,24,20,0.18)] lg:px-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#122033]">Recent activity</h2>
          <BankingLink
            href="/banking/activity"
            className="text-sm font-medium text-[#2F7A45] underline-offset-4 hover:underline"
          >
            View all
          </BankingLink>
        </div>
        <TransactionList
          className="border-[#e2ddd2]"
          transactions={recent}
          accounts={banking.accounts}
          empty="No transactions posted to these accounts yet."
          showReceipts
        />
        <div className="mt-8">
          <CreditScoreCard snapshot={credit} />
        </div>
      </section>
    </div>
  );
}
