import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSettings } from "@/lib/store";

export const metadata: Metadata = { title: "Contact" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-semibold text-[#0B2340]">Visit or call</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[#0B2340]">{settings.branchName}</h2>
            <p className="mt-2 text-sm leading-6 text-[#5C6B64]">
              {settings.address}
              <br />
              {settings.city}, {settings.state} {settings.zip}
              <br />
              {settings.hours}
            </p>
          </article>
          <article className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[#0B2340]">Member desk</h2>
            <p className="mt-2 text-sm leading-6 text-[#5C6B64]">
              {settings.memberDeskPhone}
              <br />
              {settings.memberDeskEmail}
              <br />
              Lost card after hours: {settings.afterHoursPhone}
            </p>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
