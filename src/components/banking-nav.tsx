"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BankingLink } from "@/components/banking-link";
import {
  ArrowLeftRight,
  Banknote,
  CreditCard,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Smartphone,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { BankLogo } from "@/components/logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NotificationsBell } from "@/components/banking-notifications";
import { logoutAction } from "@/lib/actions/auth";
import type { MemberMessage } from "@/lib/member-inbox";
import { cn } from "@/lib/utils";
import { DisplaySwitcher, useT } from "@/components/member-display";
import { MemberPhoto } from "@/components/member-photo";
import { memberDisplayName } from "@/lib/money";

const LINKS = [
  { href: "/banking", key: "overview", icon: LayoutDashboard },
  { href: "/banking/accounts", key: "accounts", icon: Wallet },
  { href: "/banking/cards", key: "cards", icon: CreditCard },
  { href: "/banking/transfer", key: "transfers", icon: ArrowLeftRight },
  { href: "/banking/activity", key: "activity", icon: Receipt },
  { href: "/banking/deposit", key: "deposit", icon: Smartphone },
  { href: "/banking/pay", key: "pay", icon: Users },
  { href: "/banking/wire", key: "wire", icon: Landmark },
  { href: "/banking/loans", key: "loan", icon: Banknote },
  { href: "/banking/profile", key: "profile", icon: UserRound },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/banking" ? pathname === "/banking" : pathname.startsWith(href);
}

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isActive(pathname, href);
  return (
    <BankingLink
      href={href}
      onClick={onNavigate}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300",
        active
          ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
          : "text-white/65 hover:bg-white/8 hover:text-white",
      )}
    >
      <Icon className="size-4" />
      {label}
    </BankingLink>
  );
}

function SidebarBody({
  user,
  pathname,
  onNavigate,
}: {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    photoPath?: string | null;
    locale?: string;
  };
  pathname: string;
  onNavigate?: () => void;
}) {
  const translate = useT();
  return (
    <>
      <div className="border-b border-white/10 px-5 py-6">
        <BankingLink href="/" onClick={onNavigate}>
          <BankLogo invert />
        </BankingLink>
        <p className="mt-6 text-xs tracking-[0.16em] text-[#c4a574] uppercase">
          {translate("ebanking")}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="size-10 overflow-hidden rounded-full bg-white/12 text-xs font-semibold text-white">
            <MemberPhoto
              photoPath={user.photoPath}
              initials={`${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`}
              alt={memberDisplayName(user)}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">{memberDisplayName(user)}</p>
            <p className="truncate text-xs text-white/55">{user.email}</p>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {LINKS.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={translate(link.key)}
            icon={link.icon}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
      <form action={logoutAction} className="border-t border-white/10 p-4">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/65 transition-all duration-200 hover:bg-white/8 hover:text-white"
        >
          <LogOut className="size-4" />
          {translate("signOut")}
        </button>
      </form>
    </>
  );
}

export function BankingNav({
  user,
  notifications,
}: {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    photoPath?: string | null;
    locale?: string;
    currency?: string;
  };
  notifications: MemberMessage[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <aside className="relative z-20 hidden w-72 shrink-0 flex-col bg-[#0B2340] text-white lg:flex">
        <SidebarBody user={user} pathname={pathname} />
      </aside>

      <header className="banking-chrome sticky top-0 z-30 flex items-center justify-between gap-2 px-3 py-2 text-white lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid size-10 place-items-center rounded-xl text-white transition-colors hover:bg-white/10"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          {user.locale && user.currency ? (
            <DisplaySwitcher locale={user.locale} currency={user.currency} />
          ) : null}
          <NotificationsBell messages={notifications} />
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-72 max-w-[85vw] gap-0 border-white/10 bg-[#0B2340] p-0 text-white shadow-2xl"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>E-Banking menu</SheetTitle>
          </SheetHeader>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-3 grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
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
    </>
  );
}
