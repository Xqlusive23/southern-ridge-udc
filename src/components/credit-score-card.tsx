import type { CreditSnapshot } from "@/lib/credit-score";

export function CreditScoreCard({ snapshot }: { snapshot: CreditSnapshot }) {
  const percent = (snapshot.score - 300) / 550;
  const circumference = 2 * Math.PI * 52;
  const offset = circumference * (1 - percent);

  return (
    <section className="rounded-2xl border border-[#e2ddd2] bg-[#F7F6F2] px-5 py-5">
      <div className="flex items-center gap-5">
        <div className="relative size-28 shrink-0">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#e2ddd2"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#2F7A45"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <p className="text-2xl font-semibold tabular-nums text-[#0B2340]">
              {snapshot.score}
            </p>
          </div>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.16em] text-[#8A6D3B] uppercase">
            Credit estimate
          </p>
          <p className="mt-1 text-lg font-semibold text-[#0B2340]">{snapshot.rating}</p>
          <p className="mt-1 text-sm leading-6 text-[#5C6B64]">{snapshot.summary}</p>
          <p className="mt-2 text-xs text-[#8A938C]">
            Southern Ridge estimate · 300–850 scale · not a bureau report
          </p>
        </div>
      </div>
    </section>
  );
}
