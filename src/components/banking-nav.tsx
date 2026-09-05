"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  UserRound,
  Wallet,
} from "lucide-react";
import { BankLogo } from "@/components/logo";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { memberDisplayName } from "@/lib/money";

const LINKS = [
  { href: "/banking", label: "Overview", icon: LayoutDashboard },
  { href: "/banking/accounts", label: "Accounts", icon: Wallet },
  { href: "/banking/transfer", label: "Transfers", icon: ArrowLeftRight },
  { href: "/banking/activity", label: "Activity", icon: CreditCard },
  { href: "/banking/profile", label: "Profile", icon: UserRound },
];

export function BankingNav({
  user,
}: {
  user: { firstName: string; lastName: string; email: string };
}) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col bg-[#0B2340] text-white lg:flex">
        <div className="px-5 py-6">
          <Link href="/">
            <BankLogo invert />
          </Link>
          <p className="mt-6 text-xs tracking-[0.16em] text-white/45 uppercase">
            E-Banking
          </p>
          <p className="mt-1 text-sm font-medium">
            {memberDisplayName(user)}
          </p>
          <p className="truncate text-xs text-white/55">{user.email}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {LINKS.map((link) => {
            const active =
              link.href === "/banking"
                ? pathname === "/banking"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                  active
                    ? "bg-white/12 text-white"
                    : "text-white/70 hover:bg-white/8 hover:text-white",
                )}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <form action={logoutAction} className="p-4">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/70 hover:bg-white/8 hover:text-white"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-white lg:hidden">
        {LINKS.map((link) => {
          const active =
            link.href === "/banking"
              ? pathname === "/banking"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
                active ? "text-[#2F7A45]" : "text-[#5C6B64]",
              )}
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
