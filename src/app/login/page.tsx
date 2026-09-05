import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-forms";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "E-Banking login" };

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <h1 className="text-2xl font-semibold text-[#0B2340]">E-Banking</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to review balances, move money, and manage your Southern
          Ridge membership.
        </p>
        <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <LoginForm role="member" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
