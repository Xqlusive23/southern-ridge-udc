export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function parseMoneyToCents(value: string) {
  const cleaned = value.replace(/[$,\s]/g, "");
  if (!cleaned || Number.isNaN(Number(cleaned))) {
    return null;
  }
  const amount = Math.round(Number(cleaned) * 100);
  if (!Number.isFinite(amount)) {
    return null;
  }
  return amount;
}

export function maskAccountNumber(accountNumber: string) {
  const last4 = accountNumber.slice(-4);
  return `•••• ${last4}`;
}

export function formatAccountType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function memberDisplayName(user: {
  firstName: string;
  lastName: string;
}) {
  return `${user.firstName} ${user.lastName}`.trim();
}
