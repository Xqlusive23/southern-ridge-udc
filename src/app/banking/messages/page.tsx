import { redirect } from "next/navigation";
import { NotificationsPageList } from "@/components/banking-notifications";
import { BankingScreen } from "@/components/banking-screen";
import { buildMemberInbox } from "@/lib/member-inbox";
import { requireSession } from "@/lib/auth";
import { getMemberBanking } from "@/lib/store";

export default async function MessagesPage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const banking = await getMemberBanking(session.id);
  if (!banking) redirect("/login");
  const messages = buildMemberInbox({
    firstName: session.firstName,
    status: banking.user.status,
    transfers: banking.transfers,
    loans: banking.loans,
    readIds: banking.user.readNotificationIds,
  });

  return (
    <BankingScreen
      title="Notifications"
      description="Desk updates, transfer status, and security notices. Mark a notice read when you have reviewed it."
    >
      <NotificationsPageList messages={messages} />
    </BankingScreen>
  );
}
