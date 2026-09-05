import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-semibold text-[#0B2340]">Visit or call</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border bg-white p-5">
            <h2 className="font-semibold text-[#0B2340]">Main office</h2>
            <p className="mt-2 text-sm leading-6 text-[#5C6B64]">
              120 Ridge Plaza
              <br />
              Savannah, GA 31401
              <br />
              Weekdays 9:00–5:00
            </p>
          </article>
          <article className="rounded-2xl border bg-white p-5">
            <h2 className="font-semibold text-[#0B2340]">Member desk</h2>
            <p className="mt-2 text-sm leading-6 text-[#5C6B64]">
              (912) 555-0180
              <br />
              members@southernridgeudc.com
              <br />
              Lost card after hours: (912) 555-0199
            </p>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
