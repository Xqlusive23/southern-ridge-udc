"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  SlidersHorizontal,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { BankLogo } from "@/components/logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/members/new", label: "Add member", icon: UserPlus },
  { href: "/admin/preferences", label: "Preferences", icon: SlidersHorizontal },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/members/new") return pathname === "/admin/members/new";
  if (href === "/admin/members") {
    return (
      pathname === "/admin/members" ||
      (pathname.startsWith("/admin/members/") && pathname !== "/admin/members/new")
    );
  }
  return pathname.startsWith(href);
}

function SidebarBody({
  user,
  pathname,
  onNavigate,
}: {
  user: { firstName: string; lastName: string };
  pathname: string;
  onNavigate?: () => void;
}) {
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`;

  return (
    <>
      <div className="border-b border-white/10 px-6 py-7">
        <Link href="/admin" onClick={onNavigate} className="transition-opacity duration-200 hover:opacity-90">
          <BankLogo invert />
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-white/10 text-xs font-semibold tracking-wide text-[#F4E7C5]">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.18em] text-[#c4a574] uppercase">
              Operations
            </p>
            <p className="truncate text-sm font-medium">
              {user.firstName} {user.lastName}
            </p>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
        {LINKS.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={`nav-${link.href}`}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300",
                active
                  ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                  : "text-white/65 hover:bg-white/8 hover:text-white",
              )}
            >
              <span
                className={cn(
                  "absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#c4a574] transition-all duration-300",
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-40",
                )}
              />
              <link.icon
                className={cn(
                  "size-4 transition-transform duration-300",
                  active ? "scale-110" : "group-hover:scale-105",
                )}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAction} className="border-t border-white/10 p-4">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/65 transition-all duration-200 hover:bg-white/8 hover:text-white"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </form>
    </>
  );
}

export function AdminNav({
  user,
}: {
  user: { firstName: string; lastName: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <aside className="hidden w-72 shrink-0 flex-col bg-[#0B2340] text-white lg:flex">
        <SidebarBody user={user} pathname={pathname} />
      </aside>

      <header className="sticky top-0 z-30 grid w-full min-w-0 grid-cols-[2.75rem_1fr_2.75rem] items-center bg-[#0B2340] px-2 py-2 text-white lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid size-11 place-items-center rounded-xl text-white transition-colors hover:bg-white/10"
          aria-label="Open operations menu"
        >
          <Menu className="size-5" />
        </button>
        <Link href="/admin" className="min-w-0 justify-self-center">
          <BankLogo invert className="max-w-full" markClassName="h-8 w-10" />
        </Link>
        <form action={logoutAction} className="justify-self-end">
          <button
            type="submit"
            className="grid size-11 place-items-center rounded-xl text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </form>
      </header>

      {ready ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="w-72 max-w-[85vw] gap-0 border-white/10 bg-[#0B2340] p-0 text-white shadow-2xl"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Operations menu</SheetTitle>
            </SheetHeader>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-3 z-10 grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
            <div className="flex h-full flex-col">
              <SidebarBody
                user={user}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      ) : null}
    </>
  );
}
