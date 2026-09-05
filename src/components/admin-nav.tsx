"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Users } from "lucide-react";
import { BankLogo } from "@/components/logo";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
];

export function AdminNav({
  user,
}: {
  user: { firstName: string; lastName: string };
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col bg-[#0B2340] text-white lg:w-64">
      <div className="flex items-center justify-between px-5 py-5 lg:block">
        <Link href="/admin">
          <BankLogo invert />
        </Link>
        <p className="hidden text-xs tracking-[0.16em] text-white/45 uppercase lg:mt-6 lg:block">
          Operations
        </p>
        <p className="hidden text-sm lg:mt-1 lg:block">
          {user.firstName} {user.lastName}
        </p>
      </div>
      <nav className="flex gap-1 px-3 pb-3 lg:flex-1 lg:flex-col">
        {LINKS.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm lg:flex-none lg:justify-start",
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
        <form action={logoutAction} className="lg:mt-auto">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/8 hover:text-white lg:justify-start"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </nav>
    </aside>
  );
}
