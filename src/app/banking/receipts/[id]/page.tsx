import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BankingReceipt } from "@/components/banking-receipt";
import { requireSession } from "@/lib/auth";
import { getMemberBanking, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const { id } = await params;
  const [banking, settings] = await Promise.all([
    getMemberBanking(session.id),
    getSettings(),
  ]);
  if (!banking) redirect("/login");
  const transfer = banking.transfers.find((item) => item.id === id);
  if (!transfer) notFound();
  const fromAccount = banking.accounts.find(
    (account) => account.id === transfer.fromAccountId,
  );
  const toAccount = transfer.toAccountId
    ? banking.accounts.find((account) => account.id === transfer.toAccountId)
    : null;

  return (
    <div className="px-4 py-6 lg:px-8">
      <Link
        href="/banking/activity"
        className="document-actions mb-4 inline-block text-sm font-medium text-white/80 underline-offset-4 hover:underline"
      >
        ← Back to activity
      </Link>
      <BankingReceipt
        settings={settings}
        member={banking.user}
        transfer={transfer}
        fromAccount={fromAccount}
        toAccount={toAccount}
      />
    </div>
  );
}
