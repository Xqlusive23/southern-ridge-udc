"use client";

import Link from "next/link";
import { CinematicBackdrop } from "@/components/cinematic-backdrop";
import { SiteHeader } from "@/components/site-header";
import { BANK_NAME } from "@/lib/constants";

const HERO_CLIPS = ["/media/bank-lobby.mp4", "/media/office-hall.mp4"];

export function HomeHero() {
  return (
    <div className="relative min-h-[100svh] overflow-hidden">
      <CinematicBackdrop clips={HERO_CLIPS} />
      <SiteHeader overlay />
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-5 pt-24 pb-20 text-center text-white">
        <p className="site-hero-copy text-[11px] font-semibold tracking-[0.28em] text-[#F4E7C5] uppercase">
          Member-owned since the ridge
        </p>
        <h1 className="site-display site-hero-copy site-hero-copy-delay-1 mt-4 text-[2.15rem] leading-tight font-medium tracking-tight sm:text-5xl">
          Welcome to {BANK_NAME}
        </h1>
        <p className="site-hero-copy site-hero-copy-delay-2 mt-5 max-w-xl text-sm leading-7 text-white/88 sm:text-base">
          Our mission is to make you succeed both in your business income
          management and your personal finances.
        </p>
        <div className="site-hero-copy site-hero-copy-delay-3 mt-9 flex w-full max-w-md gap-3">
          <Link
            href="/open-account"
            className="flex-1 rounded-md bg-white px-3 py-3.5 text-center text-[13px] font-semibold tracking-wide text-[#0B2340] uppercase shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-[#F4E7C5] active:scale-[0.98]"
          >
            Open an account
          </Link>
          <Link
            href="/login"
            className="flex-1 rounded-md bg-[#0B2340]/70 px-3 py-3.5 text-center text-[13px] font-semibold tracking-wide text-white uppercase ring-1 ring-white/25 backdrop-blur-sm transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#08182C] active:scale-[0.98]"
          >
            Login account
          </Link>
        </div>
      </div>
    </div>
  );
}
