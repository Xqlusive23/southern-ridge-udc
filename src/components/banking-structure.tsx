import {
  ArrowDownToLine,
  ArrowLeftRight,
  Building2,
  Landmark,
  Scale,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

const TIERS = [
  {
    title: "Membership",
    copy: "Each person owns a share of the credit union. Applications sit with operations until an officer approves them.",
    icon: Users,
  },
  {
    title: "Share accounts",
    copy: "Checking and Ridge Savings open together. A business account can be added later at the desk.",
    icon: Wallet,
  },
  {
    title: "E-Banking services",
    copy: "Transfers, mobile deposit, pay-a-person, wires, and loan requests move through the member portal.",
    icon: ArrowLeftRight,
  },
  {
    title: "Operations desk",
    copy: "Officers approve members, post the ledger, and set outgoing transfer status before funds leave the ridge.",
    icon: Scale,
  },
];

const FLOW = [
  { label: "Member", icon: Users },
  { label: "Checking & savings", icon: Landmark },
  { label: "Move money", icon: ArrowDownToLine },
  { label: "Officer review", icon: ShieldCheck },
  { label: "Posted ledger", icon: Building2 },
];

export function BankingStructure() {
  return (
    <section className="relative z-10 bg-[#0B2340] px-4 py-16 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-[#F4E7C5] uppercase">
          How the credit union is built
        </p>
        <h2 className="site-display mt-3 max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl">
          A member-owned structure, from share accounts to the operations desk.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
          Southern Ridge is organized like a working credit union: membership
          first, then deposit accounts, then services, with officers reviewing
          anything that leaves the institution.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {FLOW.map((step, index) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-2 text-sm">
                <step.icon className="size-4 text-[#F4E7C5]" />
                {step.label}
              </div>
              {index < FLOW.length - 1 ? (
                <span className="hidden text-white/35 sm:inline" aria-hidden>
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {TIERS.map((tier) => (
            <article
              key={tier.title}
              className="rounded-2xl border border-white/10 bg-[#12324f]/80 px-5 py-6"
            >
              <tier.icon className="size-8 text-[#c4a574]" strokeWidth={1.4} />
              <h3 className="mt-4 text-lg font-semibold">{tier.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">{tier.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
