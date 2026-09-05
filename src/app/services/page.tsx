import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Accounts" };

const ACCOUNTS = [
  {
    name: "Everyday Checking",
    copy: "No monthly minimum after direct deposit. Debit card, bill pay, and instant transfers to Ridge Savings.",
  },
  {
    name: "Ridge Savings",
    copy: "A share account that earns dividends quarterly. Use it as a reserve for taxes, tuition, or a slow season.",
  },
  {
    name: "Business Operating",
    copy: "Separate books for a shop or practice, with officer-level adjustments when a deposit needs a correction.",
  },
];

export default function ServicesPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-semibold text-[#0B2340]">
          Accounts that stay out of the way
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Open membership online. A branch officer can later add accounts,
          freeze a card-compromised membership, or post a balance correction.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {ACCOUNTS.map((account) => (
            <article
              key={account.name}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-[#0B2340]">
                {account.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5C6B64]">
                {account.copy}
              </p>
            </article>
          ))}
        </div>
        <Link
          href="/open-account"
          className="mt-8 inline-flex rounded-md bg-[#0B2340] px-5 py-3 text-sm font-semibold text-white hover:bg-[#08182C]"
        >
          Open an account
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
