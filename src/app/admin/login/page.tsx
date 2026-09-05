import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-forms";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Operations console" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#2F7A45] uppercase">
          Staff only
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#0B2340]">
          Operations console
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review memberships, correct balances, and update member records.
        </p>
        <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <LoginForm role="admin" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
