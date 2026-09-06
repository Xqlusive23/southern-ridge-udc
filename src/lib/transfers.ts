import { t } from "@/lib/i18n";
import type {
  LoanStatus,
  LoanType,
  OutgoingPolicy,
  TransferKind,
  TransferStatus,
} from "@/lib/types";

export const TRANSFER_STATUSES: { value: TransferStatus; label: string }[] = [
  { value: "hold", label: "Hold" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

export const OUTGOING_POLICIES: { value: OutgoingPolicy; label: string }[] = [
  { value: "hold", label: "Hold" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
];

export const TRANSFER_KINDS: { value: TransferKind; label: string }[] = [
  { value: "internal", label: "Between my accounts" },
  { value: "member", label: "Member transfer" },
  { value: "pay_person", label: "Pay a person" },
  { value: "wire", label: "Wire transfer" },
  { value: "mobile_deposit", label: "Mobile deposit" },
];

export const LOAN_TYPES: { value: LoanType; label: string }[] = [
  { value: "personal", label: "Personal loan" },
  { value: "auto", label: "Auto loan" },
  { value: "home", label: "Home loan" },
  { value: "line", label: "Line of credit" },
];

export const LOAN_STATUSES: { value: LoanStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "review", label: "In review" },
  { value: "approved", label: "Approved" },
  { value: "active", label: "Active" },
  { value: "denied", label: "Denied" },
  { value: "paid", label: "Paid off" },
];

export function transferKindLabel(kind: TransferKind, locale?: string) {
  const translated = t(locale, `kind_${kind}`);
  if (translated !== `kind_${kind}`) return translated;
  return TRANSFER_KINDS.find((item) => item.value === kind)?.label ?? kind;
}

export function transferStatusLabel(status: TransferStatus, locale?: string) {
  const translated = t(locale, `status_${status}`);
  if (translated !== `status_${status}`) return translated;
  return TRANSFER_STATUSES.find((item) => item.value === status)?.label ?? status;
}

export function transferStatusToneClass(status: string) {
  if (status === "hold") return "text-orange-600";
  if (status === "pending") return "text-amber-600";
  if (status === "processing") return "text-sky-600";
  if (status === "completed") return "text-emerald-700";
  if (status === "rejected") return "text-red-700";
  return "text-slate-600";
}

export function loanTypeLabel(type: LoanType) {
  return LOAN_TYPES.find((item) => item.value === type)?.label ?? type;
}

export function loanStatusLabel(status: LoanStatus) {
  return LOAN_STATUSES.find((item) => item.value === status)?.label ?? status;
}
