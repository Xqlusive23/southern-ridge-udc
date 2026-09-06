"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, UserRound, X } from "lucide-react";
import { BankLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Accounts" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  overlay = false,
}: {
  overlay?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-[#0B2340]/50 to-transparent"
          : "sticky top-0 z-30 bg-[#0B2340]"
      }
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[4.25rem] sm:px-6">
        <Link href="/" className="relative z-10" onClick={() => setOpen(false)}>
          <BankLogo invert wordmark />
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-white/90 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="tracking-wide hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-2 py-2 text-sm font-medium text-white"
          >
            <UserRound className="size-4" />
            <span className="hidden sm:inline">E-Banking</span>
            <span className="sm:hidden">E-Banking</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[#0B2340] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-white hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/open-account"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-white hover:bg-white/10"
            >
              Open an account
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-white/70 hover:bg-white/10"
            >
              Staff console
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
