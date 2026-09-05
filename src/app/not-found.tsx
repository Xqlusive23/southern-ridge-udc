import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16">
        <h1 className="text-2xl font-semibold text-[#0B2340]">
          That page is not on file
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The address may be outdated, or the membership record no longer
          exists.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex w-fit rounded-md bg-[#0B2340] px-4 py-2.5 text-sm font-medium text-white"
        >
          Return home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
