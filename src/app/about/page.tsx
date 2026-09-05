import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BANK_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#2F7A45] uppercase">
          Our story
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#0B2340]">
          A credit union built for the ridge
        </h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-[#3E4A44]">
          <p>
            {BANK_NAME} started as a workplace cooperative for port clerks,
            growers, and shop owners who needed a place that treated deposits
            as more than a product line.
          </p>
          <p>
            Today members still own the institution. Earnings return as
            dividends on savings, lower loan rates, and staff who can sit with
            a ledger and explain every line.
          </p>
          <p>
            The E-Banking portal and operations console on this site are the
            same tools our officers use to keep member records accurate —
            balances, contact details, and account status included.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
