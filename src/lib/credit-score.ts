import type { Account, Loan, TransferRequest, User } from "@/lib/types";

export type CreditRating = "Excellent" | "Very good" | "Good" | "Fair" | "Poor";

export type CreditSnapshot = {
  score: number;
  rating: CreditRating;
  summary: string;
};

function ratingFor(score: number): CreditRating {
  if (score >= 800) return "Excellent";
  if (score >= 740) return "Very good";
  if (score >= 670) return "Good";
  if (score >= 580) return "Fair";
  return "Poor";
}

export function buildCreditSnapshot(input: {
  user: Pick<User, "status" | "createdAt">;
  accounts: Account[];
  transfers: TransferRequest[];
  loans: Loan[];
}): CreditSnapshot {
  let score = 680;
  const openAccounts = input.accounts.filter((account) => account.status !== "closed");
  const totalCents = openAccounts.reduce((sum, account) => sum + account.balanceCents, 0);
  const hasChecking = openAccounts.some((account) => account.type === "checking");
  const hasSavings = openAccounts.some((account) => account.type === "savings");
  const frozenAccounts = openAccounts.filter((account) => account.status === "frozen").length;
  const rejected = input.transfers.filter((item) => item.status === "rejected").length;
  const openLoans = input.loans.filter(
    (loan) => loan.status === "active" || loan.status === "approved",
  ).length;
  const monthsOpen = Math.max(
    0,
    Math.floor((Date.now() - new Date(input.user.createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000)),
  );

  score += Math.min(45, Math.floor(Math.max(totalCents, 0) / 50_000));
  if (hasChecking && hasSavings) score += 25;
  if (openAccounts.length >= 2) score += 10;
  score += Math.min(20, monthsOpen * 2);
  if (input.user.status === "frozen") score -= 90;
  if (input.user.status === "banned") score -= 140;
  score -= frozenAccounts * 25;
  score -= rejected * 18;
  score -= openLoans * 8;

  const clamped = Math.min(850, Math.max(300, Math.round(score)));
  const rating = ratingFor(clamped);
  const summary =
    rating === "Excellent" || rating === "Very good"
      ? "On-time activity and available balances are supporting this estimate."
      : rating === "Good"
        ? "This is a working estimate from balances, account mix, and recent transfer history."
        : "Recent holds, denials, or thinner balances are weighing on this estimate.";

  return { score: clamped, rating, summary };
}
