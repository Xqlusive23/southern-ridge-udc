"use client";

export function PrintActions({
  label = "Print",
}: {
  label?: string;
}) {
  return (
    <div className="document-actions flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => window.print()}
        className="h-10 rounded-lg bg-[#0B2340] px-4 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[#08182C] active:scale-[0.98]"
      >
        {label}
      </button>
    </div>
  );
}
