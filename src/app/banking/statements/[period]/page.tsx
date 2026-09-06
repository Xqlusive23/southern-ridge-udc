import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BankingStatement } from "@/components/banking-statement";
import { requireSession } from "@/lib/auth";
import { listStatementPeriods, parsePeriodId } from "@/lib/documents";
import { getMemberBanking, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function StatementPage({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const { period: periodId } = await params;
  const parsed = parsePeriodId(periodId);
  if (!parsed) notFound();
  const [banking, settings] = await Promise.all([
    getMemberBanking(session.id),
    getSettings(),
  ]);
  if (!banking) redirect("/login");
  const openedAt = banking.accounts
    .map((account) => account.openedAt)
    .sort()[0] ?? banking.user.createdAt;
  const period = listStatementPeriods(openedAt).find((item) => item.id === periodId);
  if (!period) notFound();

  return (
    <div className="px-4 py-6 lg:px-8">
      <Link
        href="/banking/profile"
        className="document-actions mb-4 inline-block text-sm font-medium text-white/80 underline-offset-4 hover:underline"
      >
        ← Back to profile
      </Link>
      <BankingStatement
        settings={settings}
        member={banking.user}
        accounts={banking.accounts}
        transactions={banking.transactions}
        period={period}
        start={parsed.start}
        end={parsed.end}
      />
    </div>
  );
}
