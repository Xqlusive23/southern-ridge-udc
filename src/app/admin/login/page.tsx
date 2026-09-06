import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-forms";
import { BankLogo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Operations console" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#efece4]">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-8 sm:py-12">
        <div className="admin-login-enter grid w-full overflow-hidden rounded-3xl border border-[#e2ddd2] bg-white shadow-[0_20px_50px_rgba(11,35,64,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden bg-[#0B2340] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(196,165,116,0.18),transparent_42%),radial-gradient(circle_at_90%_80%,rgba(47,122,69,0.2),transparent_40%)]"
            />
            <div className="relative">
              <BankLogo invert />
              <p className="mt-10 text-[11px] font-semibold tracking-[0.22em] text-[#c4a574] uppercase">
                Staff only
              </p>
              <h1 className="admin-display mt-3 text-4xl font-medium tracking-tight">
                Operations console
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
                Review memberships, post ledger amounts, and keep member records
                in order.
              </p>
            </div>
            <p className="relative text-xs tracking-[0.16em] text-white/40 uppercase">
              Southern Ridge Union De&apos; Creditos
            </p>
          </div>
          <div className="px-6 py-10 sm:px-10 sm:py-12">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-[#2F7A45] uppercase lg:hidden">
              Staff only
            </p>
            <h2 className="admin-display mt-2 text-2xl font-medium text-[#0B2340] lg:mt-0">
              Sign in
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5C6B64]">
              Use your operations credentials to open the membership desk.
            </p>
            <div className="mt-8">
              <LoginForm role="admin" />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
