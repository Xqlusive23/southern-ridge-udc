import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { requireSession } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await requireSession("admin");
  if (!session) redirect("/admin/login");

  return (
    <div className="admin-shell flex min-h-full w-full min-w-0 flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
      <AdminNav user={session} />
      <main className="min-w-0 w-full flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 sm:px-4 sm:py-5 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
