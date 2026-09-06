import { redirect } from "next/navigation";
import { BankingScreen } from "@/components/banking-screen";
import { MemberRequestList, WireTransferForm } from "@/components/member-services";
import { t } from "@/lib/i18n";
import { requireSession } from "@/lib/auth";
import { getMemberBanking } from "@/lib/store";
import { US_BANKS } from "@/lib/us-banks";

export default async function WirePage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");
  const usable = banking.accounts.filter((account) => account.status === "active");
  const wires = banking.transfers.filter((item) => item.kind === "wire");

  return (
    <BankingScreen
      title={t(banking.user.locale, "wireTitle")}
      description={t(banking.user.locale, "wireDesc")}
    >
      {usable.length ? (
        <WireTransferForm
          accounts={usable}
          banks={US_BANKS}
          hasPin={banking.user.hasTransferPin}
        />
      ) : (
        <p className="text-sm text-[#5C6B64]">No active account is available.</p>
      )}
      <div className="mt-8">
        <MemberRequestList transfers={wires} empty="No wire transfers yet." />
      </div>
    </BankingScreen>
  );
}
