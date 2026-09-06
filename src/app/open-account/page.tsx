import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Open an account" };

export default function OpenAccountPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-semibold text-[#0B2340]">
          Open an account
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Everyday Checking and Ridge Savings are reserved together. A branch
          officer must approve the membership before you can sign in.
        </p>
        <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm sm:p-7">
          <RegisterForm />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Already a member?{" "}
          <Link href="/login" className="font-medium text-[#2F7A45]">
            Sign in to E-Banking
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
