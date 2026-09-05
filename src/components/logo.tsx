import { cn } from "@/lib/utils";

export function BankLogo({
  className,
  markClassName,
  wordmark = true,
  invert = false,
}: {
  className?: string;
  markClassName?: string;
  wordmark?: boolean;
  invert?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 72 56"
        aria-hidden="true"
        className={cn("h-10 w-12 shrink-0", markClassName)}
      >
        <path
          fill={invert ? "#7CDA95" : "#2F7A45"}
          d="M28.2 8.4c6.4-5.2 16.2-5.8 22.8-1.2 3.1 2.2 5.2 5.6 6.1 9.4 6.2 1.8 11.4 7.4 11.6 14.4.2 6.2-3.4 11.6-8.8 14.2v6.6h-7.4v-5.1c-4.6 2-10 2.8-15.4 2.2v4.7h-7.6V44c-5.8-1.4-10.8-5.2-13.4-10.6-3.4 1.8-7.8 1.2-9.8-2.2-2.2-3.6.2-8.2 4.6-9.4C12.4 16.8 19.6 11.8 28.2 8.4Z"
        />
        <path
          fill={invert ? "#0B2340" : "#F4E7C5"}
          d="M20.8 27.6c3.2 1.4 5.2 4.2 5.6 7.6-3.8.4-7.2-1.6-8.8-4.8-.6-1.2.8-3.4 3.2-2.8Z"
        />
      </svg>
      {wordmark ? (
        <span
          className={cn(
            "text-[11px] leading-tight font-semibold tracking-[0.14em] uppercase",
            invert ? "text-white" : "text-[#2F7A45]",
          )}
        >
          Southern
          <br />
          Ridge UDC
        </span>
      ) : null}
    </span>
  );
}
