import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { requireSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login lives in this segment but must stay public.
  return children;
}

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await requireSession("admin");
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-full flex-col bg-[#F3F1EB] lg:flex-row">
      <AdminNav user={session} />
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
