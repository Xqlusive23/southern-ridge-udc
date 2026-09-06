import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow = "Operations",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-[#2F7A45] uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 text-2xl font-medium tracking-tight text-[#0B2340] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5C6B64]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="w-full shrink-0 sm:w-auto">{actions}</div> : null}
    </div>
  );
}

export function AdminCard({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border border-[#e2ddd2] bg-white shadow-[0_1px_2px_rgba(11,35,64,0.04),0_8px_24px_rgba(11,35,64,0.04)]",
        padded && "p-4 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminStat({
  label,
  value,
  href,
  hint,
}: {
  label: string;
  value: string;
  href?: string;
  hint?: string;
}) {
  const body = (
    <>
      <p className="text-[11px] font-medium tracking-[0.16em] text-[#5C6B64] uppercase">
        {label}
      </p>
      <p className="admin-display mt-2 text-xl font-medium tracking-tight break-words text-[#0B2340] sm:text-2xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[#8A938C]">{hint}</p> : null}
    </>
  );

  const className = cn(
    "min-w-0 rounded-2xl border border-[#e2ddd2] bg-white px-3 py-3 shadow-[0_1px_2px_rgba(11,35,64,0.04)] sm:px-5 sm:py-4",
    "transition-[transform,box-shadow,border-color] duration-300 ease-out",
    href &&
      "hover:-translate-y-0.5 hover:border-[#c4a574]/50 hover:shadow-[0_10px_28px_rgba(11,35,64,0.08)]",
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}
