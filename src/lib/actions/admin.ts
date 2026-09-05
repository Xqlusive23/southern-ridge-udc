"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { parseMoneyToCents } from "@/lib/money";
import {
  adjustBalance,
  createMember,
  openAccount,
  setMemberPassword,
  updateAccountStatus,
  updateMember,
} from "@/lib/store";
import type { AccountStatus, AccountType, ActionResult, MemberStatus } from "@/lib/types";

async function requireAdmin() {
  const session = await requireSession("admin");
  if (!session) {
    return { error: "Operations access required." as const, session: null };
  }
  return { session, error: null };
}

export async function adminUpdateMemberAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };

  const userId = String(formData.get("userId") ?? "");
  try {
    await updateMember(userId, {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      zip: String(formData.get("zip") ?? ""),
      dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
      status: String(formData.get("status") ?? "active") as MemberStatus,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update this member.",
    };
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/members/${userId}`);
  return { ok: true, message: "Member record saved." };
}

export async function adminAdjustBalanceAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };

  const accountId = String(formData.get("accountId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const mode = String(formData.get("mode") ?? "set") as "credit" | "debit" | "set";
  const amountCents = parseMoneyToCents(String(formData.get("amount") ?? ""));
  const description = String(formData.get("description") ?? "");

  if (!accountId || amountCents === null) {
    return { ok: false, error: "Enter a valid amount and choose an account." };
  }

  try {
    await adjustBalance({
      accountId,
      mode,
      amountCents,
      description: description || `Operations ${mode}`,
      createdBy: session.id,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not change that balance.",
    };
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/members/${userId}`);
  return { ok: true, message: "Balance updated." };
}

export async function adminOpenAccountAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };
  const userId = String(formData.get("userId") ?? "");
  const type = String(formData.get("type") ?? "checking") as AccountType;
  const name = String(formData.get("name") ?? "");
  try {
    await openAccount(userId, type, name);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not open that account.",
    };
  }
  revalidatePath(`/admin/members/${userId}`);
  return { ok: true, message: "Account opened." };
}

export async function adminAccountStatusAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };
  const accountId = String(formData.get("accountId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const status = String(formData.get("status") ?? "active") as AccountStatus;
  try {
    await updateAccountStatus(accountId, status);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update account status.",
    };
  }
  revalidatePath(`/admin/members/${userId}`);
  return { ok: true, message: "Account status updated." };
}

export async function adminResetPasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };
  const userId = String(formData.get("userId") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  await setMemberPassword(userId, password);
  revalidatePath(`/admin/members/${userId}`);
  return { ok: true, message: "Password reset." };
}

export async function adminCreateMemberAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!firstName || !lastName || !email || password.length < 8) {
    return {
      ok: false,
      error: "First name, last name, email, and an 8+ character password are required.",
    };
  }

  try {
    await createMember({
      firstName,
      lastName,
      email,
      password,
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      zip: String(formData.get("zip") ?? ""),
      dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not create that member.",
    };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/members");
  return { ok: true, message: "Member created with checking and savings accounts." };
}
