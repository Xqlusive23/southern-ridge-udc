import Link from "next/link";
import { BankLogo } from "@/components/logo";
import { BANK_NAME, BANK_ROUTING, BANK_SHORT } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#08182C] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <BankLogo invert />
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
            {BANK_NAME} is a member-owned credit union serving families and
            businesses across the southern ridge. Routing number {BANK_ROUTING}.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">
            Banking
          </p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/80">
            <Link href="/login" className="hover:text-white">
              E-Banking login
            </Link>
            <Link href="/open-account" className="hover:text-white">
              Open an account
            </Link>
            <Link href="/services" className="hover:text-white">
              Account types
            </Link>
            <Link href="/admin/login" className="hover:text-white">
              Staff console
            </Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">
            Visit
          </p>
          <p className="mt-3 text-sm leading-6 text-white/80">
            120 Ridge Plaza
            <br />
            Savannah, GA 31401
            <br />
            (912) 555-0180
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-white/45 sm:px-6">
          © {new Date().getFullYear()} {BANK_SHORT}. Local demonstration
          system — balances and member records are stored on this machine.
        </p>
      </div>
    </footer>
  );
}
