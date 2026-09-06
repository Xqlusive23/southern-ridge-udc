import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function BankingScreen({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="px-5 pt-5 pb-6 text-white lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">{description}</p>
        ) : null}
      </div>
      <div
        className={cn(
          "banking-sheet banking-sheet-enter flex-1 rounded-t-[1.75rem] bg-white px-5 py-6 shadow-[0_-18px_40px_rgba(8,24,20,0.18)] lg:px-8",
        )}
      >
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
