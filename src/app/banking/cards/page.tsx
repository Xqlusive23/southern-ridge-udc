import { redirect } from "next/navigation";
import { BankingScreen } from "@/components/banking-screen";
import { MemberCardPanel } from "@/components/member-cards";
import { t } from "@/lib/i18n";
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
      title={t(banking.user.locale, "cards")}
      description={t(banking.user.locale, "cardsDesc")}
    >
      {cards.length === 0 ? (
        <p className="text-center text-sm text-[#5C6B64]">
          {t(banking.user.locale, "noCards")}
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
