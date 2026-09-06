import { redirect } from "next/navigation";
import { BankingScreen } from "@/components/banking-screen";
import { MemberCardPanel } from "@/components/member-cards";
import { requireSession } from "@/lib/auth";
import { getMemberBanking } from "@/lib/store";

export default async function CardsPage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");
  const accountsById = new Map(banking.accounts.map((account) => [account.id, account]));
  const cards = banking.cards.filter((card) => card.status !== "closed");

  return (
    <BankingScreen
      title="Cards"
      description="Debit cards are issued with Everyday Checking and business accounts. Savings stays share-only. Freeze a card if it is misplaced; purchases stay off until you turn it back on."
    >
      {cards.length === 0 ? (
        <p className="text-center text-sm text-[#5C6B64]">
          No debit cards are on this membership yet. An officer can open checking
          or a business account to issue one.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {cards.map((card) => (
            <MemberCardPanel
              key={card.id}
              card={card}
              account={accountsById.get(card.accountId)}
            />
          ))}
        </div>
      )}
    </BankingScreen>
  );
}
