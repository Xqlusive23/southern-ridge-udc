import { AdminPreferencesForm } from "@/components/admin-forms";
import { AdminCard, AdminPageHeader } from "@/components/admin-ui";
import { isMailConfigured } from "@/lib/mail";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPreferencesPage() {
  const settings = await getSettings();

  return (
    <div className="admin-page max-w-3xl">
      <AdminPageHeader
        title="Preferences"
        description="Manage public contact details, support email, transfer PIN policy, and desk defaults."
      />
      <AdminCard>
        <AdminPreferencesForm settings={settings} mailReady={isMailConfigured(settings)} />
      </AdminCard>
    </div>
  );
}
