"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { parseMoneyToCents } from "@/lib/money";
import {
  getMemberBanking,
  setMemberPassword,
  transferFunds,
  updateMember,
} from "@/lib/store";
import type { ActionResult } from "@/lib/types";

export async function transferAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession("member");
  if (!session) return { ok: false, error: "Your session expired. Sign in again." };
  if (session.status === "frozen") {
    return { ok: false, error: "This membership is frozen. Transfers are disabled." };
  }

  const fromAccountId = String(formData.get("fromAccountId") ?? "");
  const destination = String(formData.get("destination") ?? "own");
  const toAccountId = String(formData.get("toAccountId") ?? "");
  const toAccountNumber = String(formData.get("toAccountNumber") ?? "");
  const amountCents = parseMoneyToCents(String(formData.get("amount") ?? ""));
  const memo = String(formData.get("memo") ?? "");

  if (!fromAccountId || !amountCents) {
    return { ok: false, error: "Choose an account and enter a valid amount." };
  }

  const banking = await getMemberBanking(session.id);
  if (!banking?.accounts.some((account) => account.id === fromAccountId)) {
    return { ok: false, error: "That account does not belong to you." };
  }

  try {
    await transferFunds({
      fromAccountId,
      toAccountId: destination === "own" ? toAccountId : undefined,
      toAccountNumber: destination === "other" ? toAccountNumber : undefined,
      amountCents,
      memo,
      actorId: session.id,
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "The transfer could not be completed.",
    };
  }

  revalidatePath("/banking");
  revalidatePath("/banking/activity");
  revalidatePath("/banking/accounts");
  return { ok: true, message: "Transfer completed." };
}

export async function updateProfileAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession("member");
  if (!session) return { ok: false, error: "Your session expired. Sign in again." };

  try {
    await updateMember(session.id, {
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      zip: String(formData.get("zip") ?? ""),
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "We could not save your profile.",
    };
  }
  revalidatePath("/banking/profile");
  return { ok: true, message: "Profile updated." };
}

export async function changePasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession("member");
  if (!session) return { ok: false, error: "Your session expired. Sign in again." };
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { ok: false, error: "Choose a password with at least 8 characters." };
  }
  await setMemberPassword(session.id, password);
  return { ok: true, message: "Password changed." };
}
