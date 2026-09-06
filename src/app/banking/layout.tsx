import Image from "next/image";
import { redirect } from "next/navigation";
import { BankingNav } from "@/components/banking-nav";
import { NotificationsBell } from "@/components/banking-notifications";
import { DisplaySwitcher, MemberDisplayProvider } from "@/components/member-display";
import { SmartsuppChat } from "@/components/smartsupp-chat";
import { clearSession, requireSession } from "@/lib/auth";
import { memberDisplayName, photoSrc } from "@/lib/money";
import { buildMemberInbox } from "@/lib/member-inbox";
import { extractSmartsuppKey, smartsuppWidgetExists } from "@/lib/smartsupp";
import { t } from "@/lib/i18n";
import { getMemberBanking, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function BankingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  if (session.status === "banned") {
    await clearSession();
    redirect("/login?banned=1");
  }
  if (session.status === "pending") {
    await clearSession();
    redirect("/login?pending=1");
  }
  const [banking, settings] = await Promise.all([
    getMemberBanking(session.id),
    getSettings(),
  ]);
  const requestedChatKey = extractSmartsuppKey(
    process.env.NEXT_PUBLIC_SMARTSUPP_KEY || settings.smartsuppKey || "",
  );
  const chatKey =
    requestedChatKey && (await smartsuppWidgetExists(requestedChatKey))
      ? requestedChatKey
      : "";
  const notifications = banking
    ? buildMemberInbox({
        firstName: session.firstName,
        status: banking.user.status,
        transfers: banking.transfers,
        loans: banking.loans,
        readIds: banking.user.readNotificationIds,
        locale: banking.user.locale,
        currency: banking.user.currency,
      })
    : [];
  const locale = banking?.user.locale ?? session.locale ?? "en";
  const currency = banking?.user.currency ?? session.currency ?? "USD";
  const photoPath = photoSrc(session.id, banking?.user.photoPath);

  return (
    <MemberDisplayProvider locale={locale} currency={currency}>
    <div className="relative flex min-h-full flex-col bg-[#102018] lg:h-screen lg:flex-row lg:overflow-hidden">
      <Image
        src="/media/ridge-dusk.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-[center_35%]"
      />
      <div className="pointer-events-none absolute inset-0 bg-[#102018]/55" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[#102018]/70" />
      <BankingNav
        user={{
          firstName: session.firstName,
          lastName: session.lastName,
          email: session.email,
          photoPath,
          locale,
          currency,
        }}
        notifications={notifications}
      />
      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="hidden items-center justify-between px-8 py-4 text-white lg:flex">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-white/55 uppercase">
              E-Banking
            </p>
            <p className="text-sm font-medium">
              {session.firstName} {session.lastName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DisplaySwitcher locale={locale} currency={currency} />
            <NotificationsBell messages={notifications} />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {session.status === "frozen" ? (
            <p className="mx-5 mt-3 rounded-xl border border-amber-200/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-50 lg:mx-8">
              {t(locale, "frozenBanner")}
            </p>
          ) : null}
          {children}
        </main>
      </div>
      <SmartsuppChat
        chatKey={chatKey}
        name={memberDisplayName(session)}
        email={session.email}
      />
    </div>
    </MemberDisplayProvider>
  );
}
