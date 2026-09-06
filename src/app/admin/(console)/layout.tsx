import { AdminShell } from "@/app/admin/layout";

export default function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
