"use server";

import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { parseMoneyToCents } from "@/lib/money";
import {
  applyForLoan,
  createMobileDeposit,
  createOutgoingTransfer,
  getMemberBanking,
  getSettings,
  setDebitCardStatus,
  markNotificationsRead,
  setMemberPassword,
  setMemberPhoto,
  setMemberTransferPin,
  transferFunds,
  updateMember,
  verifyMemberTransferPin,
} from "@/lib/store";
import type { ActionResult, CardStatus, LoanType } from "@/lib/types";
import { extractEmail } from "@/lib/mail";
import {
  digitsOnly,
  findUsBank,
  isUsAccountNumber,
  isUsRoutingNumber,
} from "@/lib/us-banks";

function requiredRecipientEmail(formData: FormData) {
  const email = extractEmail(
    String(formData.get("recipientEmail") ?? formData.get("recipientDetails") ?? ""),
  );
  if (!email) return { error: "Recipient email is required." };
  return { email };
}

function requiredTransferPin(formData: FormData) {
  const pin = String(formData.get("transferPin") ?? "").trim();
  if (!pin) return { error: "Transfer PIN is required." };
  return { pin };
}

function blockedMember(status: string) {
  if (status === "frozen") {
    return "This membership is frozen. Transfers are disabled.";
  }
  if (status === "banned") {
    return "This membership is banned. Transfers are disabled.";
  }
  return null;
}

export async function transferAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession("member");
  if (!session) return { ok: false, error: "Your session expired. Sign in again." };
  const blocked = blockedMember(session.status);
  if (blocked) return { ok: false, error: blocked };

  const fromAccountId = String(formData.get("fromAccountId") ?? "");
  const destination = String(formData.get("destination") ?? "other");
  const toAccountId = String(formData.get("toAccountId") ?? "");
  const toAccountNumber = digitsOnly(String(formData.get("toAccountNumber") ?? ""));
  const recipientName = String(formData.get("recipientName") ?? "").trim();
  const emailCheck = requiredRecipientEmail(formData);
  if ("error" in emailCheck) return { ok: false, error: emailCheck.error };
  const pinCheck = requiredTransferPin(formData);
  if ("error" in pinCheck) return { ok: false, error: pinCheck.error };
  const recipientEmail = emailCheck.email;
  const bankName = String(formData.get("bankName") ?? "").trim();
  const amountCents = parseMoneyToCents(String(formData.get("amount") ?? ""));
  const memo = String(formData.get("memo") ?? "");

  if (!fromAccountId || !amountCents) {
    return { ok: false, error: "Choose an account and enter a valid amount." };
  }
  if (destination === "other") {
    if (!toAccountNumber || !recipientName || !bankName) {
      return {
        ok: false,
        error: "Enter the recipient’s name, bank, account number, and email.",
      };
    }
    if (!isUsAccountNumber(toAccountNumber)) {
      return {
        ok: false,
        error: "Account number must be 4–17 digits. Letters are not allowed.",
      };
    }
    if (!findUsBank(bankName)) {
      return { ok: false, error: "Choose a receiving bank from the list." };
    }
  }

  const banking = await getMemberBanking(session.id);
  if (!banking?.accounts.some((account) => account.id === fromAccountId)) {
    return { ok: false, error: "That account does not belong to you." };
  }

  let receiptId = "";
  try {
    await verifyMemberTransferPin(session.id, pinCheck.pin);
    const request = await transferFunds({
      fromAccountId,
      toAccountId: destination === "own" ? toAccountId : undefined,
      toAccountNumber: destination === "other" ? toAccountNumber : undefined,
      recipientName: destination === "other" ? recipientName : undefined,
      recipientDetails:
        destination === "other"
          ? [bankName, recipientEmail].join(" · ")
          : recipientEmail,
      amountCents,
      memo,
      actorId: session.id,
    });
    receiptId = request.id;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "The transfer could not be completed.",
    };
  }
  revalidatePath("/banking");
  revalidatePath("/banking/activity");
  revalidatePath("/banking/accounts");
  revalidatePath("/banking/profile");
  revalidatePath("/banking/pay");
  revalidatePath("/banking/wire");
  revalidatePath("/banking/deposit");
  redirect(`/banking/receipts/${receiptId}`);
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

export async function uploadProfilePhotoAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession("member");
  if (!session) return { ok: false, error: "Your session expired. Sign in again." };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a photo to upload." };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { ok: false, error: "Photo must be 2 MB or smaller." };
  }
  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/jpeg"
          ? "jpg"
          : null;
  if (!ext) {
    return { ok: false, error: "Use a JPEG, PNG, or WebP photo." };
  }

  try {
    const dir = path.join(process.cwd(), "public", "uploads", "members");
    mkdirSync(dir, { recursive: true });
    const filename = `${session.id}-${Date.now()}.${ext}`;
    writeFileSync(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
    await setMemberPhoto(session.id, `/uploads/members/${filename}`);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "We could not save that photo.",
    };
  }
  revalidatePath("/banking");
  revalidatePath("/banking/profile");
  return { ok: true, message: "Profile photo updated." };
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

export async function changeTransferPinAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession("member");
  if (!session) return { ok: false, error: "Your session expired. Sign in again." };
  const settings = await getSettings();
  if (!settings.allowMemberPinChange) {
    return {
      ok: false,
      error: "Transfer PIN changes are handled by the operations desk.",
    };
  }
  try {
    await setMemberTransferPin(session.id, String(formData.get("pin") ?? ""));
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "We could not update your transfer PIN.",
    };
  }
  revalidatePath("/banking/profile");
  revalidatePath("/banking/transfer");
  return { ok: true, message: "Transfer PIN updated." };
}

export async function payPersonAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession("member");
  if (!session) return { ok: false, error: "Your session expired. Sign in again." };
  const blocked = blockedMember(session.status);
  if (blocked) return { ok: false, error: blocked };

  const fromAccountId = String(formData.get("fromAccountId") ?? "");
  const recipientName = String(formData.get("recipientName") ?? "").trim();
  const emailCheck = requiredRecipientEmail(formData);
  if ("error" in emailCheck) return { ok: false, error: emailCheck.error };
  const pinCheck = requiredTransferPin(formData);
  if ("error" in pinCheck) return { ok: false, error: pinCheck.error };
  const amountCents = parseMoneyToCents(String(formData.get("amount") ?? ""));
  if (!fromAccountId || !recipientName || !amountCents) {
    return { ok: false, error: "Enter the recipient name, email, account, and a valid amount." };
  }

  let receiptId = "";
  try {
    await verifyMemberTransferPin(session.id, pinCheck.pin);
    const request = await createOutgoingTransfer({
      fromAccountId,
      recipientName,
      recipientDetails: emailCheck.email,
      amountCents,
      memo: String(formData.get("memo") ?? ""),
      actorId: session.id,
      kind: "pay_person",
    });
    receiptId = request.id;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Pay a person could not be submitted.",
    };
  }
  revalidatePath("/banking");
  revalidatePath("/banking/activity");
  revalidatePath("/banking/profile");
  revalidatePath("/banking/pay");
  redirect(`/banking/receipts/${receiptId}`);
}

export async function wireTransferAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession("member");
  if (!session) return { ok: false, error: "Your session expired. Sign in again." };
  const blocked = blockedMember(session.status);
  if (blocked) return { ok: false, error: blocked };

  const fromAccountId = String(formData.get("fromAccountId") ?? "");
  const recipientName = String(formData.get("recipientName") ?? "").trim();
  const emailCheck = requiredRecipientEmail(formData);
  if ("error" in emailCheck) return { ok: false, error: emailCheck.error };
  const pinCheck = requiredTransferPin(formData);
  if ("error" in pinCheck) return { ok: false, error: pinCheck.error };
  const recipientEmail = emailCheck.email;
  const bankName = String(formData.get("bankName") ?? "").trim();
  const routingNumber = digitsOnly(String(formData.get("routingNumber") ?? ""));
  const accountNumber = digitsOnly(String(formData.get("accountNumber") ?? ""));
  const amountCents = parseMoneyToCents(String(formData.get("amount") ?? ""));
  if (!fromAccountId || !recipientName || !bankName || !routingNumber || !accountNumber || !amountCents) {
    return { ok: false, error: "Complete every wire field, including beneficiary email, and enter a valid amount." };
  }
  if (!findUsBank(bankName)) {
    return { ok: false, error: "Choose a receiving bank from the list." };
  }
  if (!isUsRoutingNumber(routingNumber)) {
    return { ok: false, error: "Routing number must be 9 digits." };
  }
  if (!isUsAccountNumber(accountNumber)) {
    return {
      ok: false,
      error: "Account number must be 4–17 digits. Letters are not allowed.",
    };
  }

  let receiptId = "";
  try {
    await verifyMemberTransferPin(session.id, pinCheck.pin);
    const request = await createOutgoingTransfer({
      fromAccountId,
      recipientName,
      recipientDetails: [bankName, `routing ${routingNumber}`, accountNumber, recipientEmail].join(" · "),
      amountCents,
      memo: String(formData.get("memo") ?? ""),
      actorId: session.id,
      kind: "wire",
    });
    receiptId = request.id;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "The wire could not be submitted.",
    };
  }
  revalidatePath("/banking");
  revalidatePath("/banking/activity");
  revalidatePath("/banking/profile");
  revalidatePath("/banking/wire");
  redirect(`/banking/receipts/${receiptId}`);
}

export async function mobileDepositAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession("member");
  if (!session) return { ok: false, error: "Your session expired. Sign in again." };
  const blocked = blockedMember(session.status);
  if (blocked) return { ok: false, error: blocked };

  const accountId = String(formData.get("accountId") ?? "");
  const amountCents = parseMoneyToCents(String(formData.get("amount") ?? ""));
  if (!accountId || !amountCents) {
    return { ok: false, error: "Choose an account and enter the check amount." };
  }

  let receiptId = "";
  try {
    const request = await createMobileDeposit({
      userId: session.id,
      accountId,
      amountCents,
      memo: String(formData.get("memo") ?? ""),
    });
    receiptId = request.id;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "The mobile deposit could not be submitted.",
    };
  }
  revalidatePath("/banking");
  revalidatePath("/banking/activity");
  revalidatePath("/banking/profile");
  revalidatePath("/banking/deposit");
  redirect(`/banking/receipts/${receiptId}`);
}

export async function applyLoanAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession("member");
  if (!session) return { ok: false, error: "Your session expired. Sign in again." };
  const blocked = blockedMember(session.status);
  if (blocked) return { ok: false, error: blocked };

  const amountCents = parseMoneyToCents(String(formData.get("amount") ?? ""));
  const termMonths = Number(formData.get("termMonths") ?? 36);
  if (!amountCents) return { ok: false, error: "Enter a loan amount." };

  try {
    await applyForLoan({
      userId: session.id,
      type: String(formData.get("type") ?? "personal") as LoanType,
      purpose: String(formData.get("purpose") ?? ""),
      amountCents,
      termMonths,
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "The loan request could not be submitted.",
    };
  }
  revalidatePath("/banking/profile");
  revalidatePath("/banking/loans");
  return { ok: true, message: "Loan request submitted to the lending desk." };
}

export async function setCardStatusAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession("member");
  if (!session) return { ok: false, error: "Your session expired. Sign in again." };

  const cardId = String(formData.get("cardId") ?? "");
  const status = String(formData.get("status") ?? "") as CardStatus;
  if (!cardId || (status !== "active" && status !== "frozen")) {
    return { ok: false, error: "Choose a valid card action." };
  }

  try {
    await setDebitCardStatus(cardId, status, session.id);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not update that card.",
    };
  }
  revalidatePath("/banking");
  revalidatePath("/banking/accounts");
  revalidatePath("/banking/cards");
  revalidatePath("/banking/profile");
  return {
    ok: true,
    message: status === "frozen" ? "Card frozen." : "Card turned back on.",
  };
}

export async function markNotificationsReadAction(
  ids: string[],
): Promise<ActionResult> {
  const session = await requireSession("member");
  if (!session) return { ok: false, error: "Your session expired. Sign in again." };
  if (ids.length === 0) return { ok: true };
  try {
    await markNotificationsRead(session.id, ids);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not update notifications.",
    };
  }
  revalidatePath("/banking");
  revalidatePath("/banking/messages");
  revalidatePath("/banking/transfer");
  revalidatePath("/banking/accounts");
  return { ok: true };
}
