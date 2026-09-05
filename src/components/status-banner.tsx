import { AlertTriangle } from "lucide-react";

export function StatusBanner({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (!error && !message) return null;
  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>{error}</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
      {message}
    </div>
  );
}
