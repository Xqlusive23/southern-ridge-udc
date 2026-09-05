import { redirect } from "next/navigation";
import { BankingNav } from "@/components/banking-nav";
import { requireSession } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function BankingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession("member");
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-full bg-[#F3F1EB] lg:h-screen lg:overflow-hidden">
      <BankingNav user={session} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-white px-4 py-3 lg:px-8">
          <div>
            <p className="text-xs tracking-[0.14em] text-[#2F7A45] uppercase">
              E-Banking
            </p>
            <p className="text-sm font-medium text-[#0B2340]">
              {session.firstName} {session.lastName}
            </p>
          </div>
          <form action={logoutAction} className="lg:hidden">
            <button
              type="submit"
              className="text-sm font-medium text-[#0B2340] underline-offset-2 hover:underline"
            >
              Sign out
            </button>
          </form>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 lg:px-8 lg:pb-8">
          {session.status === "frozen" ? (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              This membership is frozen. You can review balances, but transfers
              are turned off until a branch officer restores access.
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
