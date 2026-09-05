import Image from "next/image";
import Link from "next/link";
import {
  Landmark,
  PiggyBank,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BANK_NAME } from "@/lib/constants";

const FEATURES = [
  {
    title: "Saving Benefits",
    copy: "Competitive dividends on Ridge Savings, with automatic transfers from everyday checking.",
    icon: PiggyBank,
    tone: "text-[#C56A2D]",
  },
  {
    title: "Business Income",
    copy: "Separate operating accounts, merchant deposits, and officer-level visibility for your books.",
    icon: Landmark,
    tone: "text-[#2F7A45]",
  },
  {
    title: "Secure E-Banking",
    copy: "Review balances, move money between accounts, and keep a full activity history in one place.",
    icon: ShieldCheck,
    tone: "text-[#0B2340]",
  },
  {
    title: "Mobile Ready",
    copy: "The same E-Banking tools on a phone as at a branch desk — including transfers after hours.",
    icon: Smartphone,
    tone: "text-[#4C6F8A]",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-[#F6F4EF]">
      <div className="relative min-h-[100svh] overflow-hidden">
        <Image
          src="/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-[#0B2340]/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B2340]/40 via-[#0B2340]/55 to-[#0B2340]/80" />
        <SiteHeader overlay />
        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-5 pb-16 pt-24 text-center text-white">
          <h1 className="text-[2rem] leading-tight font-semibold tracking-tight sm:text-5xl">
            Welcome To {BANK_NAME}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-white/90 sm:text-base">
            Our mission is to make you succeed both in your business income
            management and your personal finances.
          </p>
          <div className="mt-8 flex w-full max-w-md gap-3">
            <Link
              href="/open-account"
              className="flex-1 rounded-md bg-[#0B2340] px-3 py-3 text-center text-[13px] font-semibold tracking-wide text-white uppercase ring-1 ring-white/15 hover:bg-[#08182C]"
            >
              Open an account
            </Link>
            <Link
              href="/login"
              className="flex-1 rounded-md bg-[#0B2340] px-3 py-3 text-center text-[13px] font-semibold tracking-wide text-white uppercase ring-1 ring-white/15 hover:bg-[#08182C]"
            >
              Login account
            </Link>
          </div>
        </div>
      </div>

      <section className="-mt-8 rounded-t-[1.75rem] bg-white px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-[#E4E8E2] bg-white px-5 py-6"
            >
              <feature.icon className={`size-9 stroke-[1.4] ${feature.tone}`} />
              <h2 className="mt-4 text-lg font-semibold text-[#0B2340]">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5C6B64]">
                {feature.copy}
              </p>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
