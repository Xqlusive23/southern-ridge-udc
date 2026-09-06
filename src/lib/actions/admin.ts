"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { parseMoneyToCents } from "@/lib/money";
import { redirect } from "next/navigation";
import {
  addMemberContact,
  adjustBalance,
  clearMemberTransferPin,
  createMember,
  deleteAccount,
  deleteMember,
  getMemberDetail,
  getSettings,
  openAccount,
  setMemberAccess,
  setMemberOutgoingPolicy,
  removeMemberContact,
  setMemberPassword,
  setMemberTransferPin,
  updateAccountStatus,
  updateLoan,
  updateMember,
  updateMemberContact,
  updateSettings,
  updateTransaction,
  updateTransferStatus,
  voidTransaction,
} from "@/lib/store";
import type {
  AccountStatus,
  AccountType,
  ActionResult,
  ContactChannel,
  LoanStatus,
  MemberStatus,
  OutgoingPolicy,
  StatementDelivery,
  TransferStatus,
} from "@/lib/types";
import {
  buildMailPreview,
  extractEmail,
  normalizeSmtpPassword,
  sendSupportEmail,
} from "@/lib/mail";
import { extractSmartsuppKey, smartsuppWidgetExists } from "@/lib/smartsupp";

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
      preferredContact: String(formData.get("preferredContact") ?? "mobile") as ContactChannel,
    });
    await setMemberAccess(
      userId,
      String(formData.get("status") ?? "active") as MemberStatus,
    );
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
  const postedAt = parsePostedAt(String(formData.get("postedAt") ?? ""));
  if (postedAt.error) return { ok: false, error: postedAt.error };

  if (!accountId || amountCents === null) {
    return { ok: false, error: "Enter a valid amount and choose an account." };
  }
  const owned = await accountBelongsToMember(userId, accountId);
  if (!owned) return { ok: false, error: "That account is not on this membership." };

  try {
    await adjustBalance({
      accountId,
      mode,
      amountCents,
      description: description || `Operations ${mode}`,
      createdBy: session.id,
      createdAt: postedAt.value,
      counterparty: String(formData.get("counterparty") ?? "").trim() || undefined,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not change that balance.",
    };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${userId}`);
  revalidatePath("/banking");
  revalidatePath("/banking/activity");
  revalidatePath("/banking/accounts");
  return { ok: true, message: "Balance updated." };
}

export async function adminAddMemberAmountAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };

  const userId = String(formData.get("userId") ?? "");
  const accountId = String(formData.get("accountId") ?? "");
  const mode = String(formData.get("mode") ?? "credit") as "credit" | "debit";
  const amountCents = parseMoneyToCents(String(formData.get("amount") ?? ""));
  const description = String(formData.get("description") ?? "").trim();
  const postedAt = parsePostedAt(String(formData.get("postedAt") ?? ""));
  if (postedAt.error) return { ok: false, error: postedAt.error };

  if (!accountId || amountCents === null) {
    return { ok: false, error: "Choose an account and enter a valid amount." };
  }
  if (!description) {
    return { ok: false, error: "Enter a history description for this posting." };
  }
  const owned = await accountBelongsToMember(userId, accountId);
  if (!owned) return { ok: false, error: "That account is not on this membership." };

  try {
    await adjustBalance({
      accountId,
      mode,
      amountCents,
      description,
      createdBy: session.id,
      createdAt: postedAt.value,
      counterparty: String(formData.get("counterparty") ?? "").trim() || undefined,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not post that amount.",
    };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${userId}`);
  revalidatePath("/banking");
  revalidatePath("/banking/activity");
  revalidatePath("/banking/accounts");
  return { ok: true, message: "Amount and history posted to the member." };
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

export async function adminSetTransferPinAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };
  const userId = String(formData.get("userId") ?? "");
  const pin = String(formData.get("pin") ?? "");
  try {
    await setMemberTransferPin(userId, pin);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update that transfer PIN.",
    };
  }
  revalidatePath(`/admin/members/${userId}`);
  return { ok: true, message: "Transfer PIN updated." };
}

export async function adminClearTransferPinAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };
  const userId = String(formData.get("userId") ?? "");
  try {
    await clearMemberTransferPin(userId);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not clear that transfer PIN.",
    };
  }
  revalidatePath(`/admin/members/${userId}`);
  return { ok: true, message: "Transfer PIN removed." };
}

export async function adminAddContactAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };
  const userId = String(formData.get("userId") ?? "");
  try {
    await addMemberContact(userId, {
      channel: String(formData.get("channel") ?? "mobile") as ContactChannel,
      label: String(formData.get("label") ?? ""),
      value: String(formData.get("value") ?? ""),
      isPrimary: formData.get("isPrimary") === "on",
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not add that contact method.",
    };
  }
  revalidatePath(`/admin/members/${userId}`);
  return { ok: true, message: "Contact method added." };
}

export async function adminUpdateContactAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };
  const userId = String(formData.get("userId") ?? "");
  const contactId = String(formData.get("contactId") ?? "");
  try {
    await updateMemberContact(userId, contactId, {
      channel: String(formData.get("channel") ?? "mobile") as ContactChannel,
      label: String(formData.get("label") ?? ""),
      value: String(formData.get("value") ?? ""),
      isPrimary: formData.get("isPrimary") === "on",
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update that contact method.",
    };
  }
  revalidatePath(`/admin/members/${userId}`);
  return { ok: true, message: "Contact method saved." };
}

export async function adminRemoveContactAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };
  const userId = String(formData.get("userId") ?? "");
  const contactId = String(formData.get("contactId") ?? "");
  try {
    await removeMemberContact(userId, contactId);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not remove that contact method.",
    };
  }
  revalidatePath(`/admin/members/${userId}`);
  return { ok: true, message: "Contact method removed." };
}

export async function adminUpdateSettingsAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };

  const smartsuppKey = extractSmartsuppKey(String(formData.get("smartsuppKey") ?? ""));
  if (String(formData.get("smartsuppKey") ?? "").trim() && !smartsuppKey) {
    return {
      ok: false,
      error:
        "Paste the Smartsupp chat key or the full chat code from Settings → Chat box → Chat code.",
    };
  }
  if (smartsuppKey && !(await smartsuppWidgetExists(smartsuppKey))) {
    return {
      ok: false,
      error:
        "Smartsupp does not recognize that key. Open your Smartsupp dashboard, copy _smartsupp.key, and paste it here.",
    };
  }

  const current = await getSettings();
  const smtpPassword = normalizeSmtpPassword(String(formData.get("smtpPassword") ?? ""));
  const supportEmail =
    extractEmail(String(formData.get("supportEmail") ?? "")) ||
    current.supportEmail ||
    current.memberDeskEmail;

  try {
    await updateSettings({
      institutionName: String(formData.get("institutionName") ?? ""),
      branchName: String(formData.get("branchName") ?? ""),
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      zip: String(formData.get("zip") ?? ""),
      hours: String(formData.get("hours") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      memberDeskPhone: String(formData.get("memberDeskPhone") ?? ""),
      memberDeskEmail: String(formData.get("memberDeskEmail") ?? ""),
      afterHoursPhone: String(formData.get("afterHoursPhone") ?? ""),
      requireTransferPin: formData.get("requireTransferPin") === "on",
      allowMemberPinChange: formData.get("allowMemberPinChange") === "on",
      defaultStatementDelivery: String(
        formData.get("defaultStatementDelivery") ?? "email",
      ) as StatementDelivery,
      operationsNote: String(formData.get("operationsNote") ?? ""),
      smartsuppKey,
      supportEmail,
      smtpHost: String(formData.get("smtpHost") ?? "").trim(),
      smtpPort: Number(formData.get("smtpPort") ?? current.smtpPort) || 587,
      smtpUser: String(formData.get("smtpUser") ?? "").trim(),
      smtpPassword: smtpPassword || current.smtpPassword,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save preferences.",
    };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/preferences");
  revalidatePath("/contact");
  revalidatePath("/", "layout");
  revalidatePath("/about");
  revalidatePath("/services");
  revalidatePath("/login");
  revalidatePath("/banking", "layout");
  return { ok: true, message: "Operations preferences saved." };
}

export async function adminSendTestEmailAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };
  const settings = await getSettings();
  const to = extractEmail(String(formData.get("testEmail") ?? "")) || session.email;
  if (!to) return { ok: false, error: "Enter an email address to test." };
  try {
    const preview = buildMailPreview(
      settings,
      `${session.firstName} ${session.lastName}`.trim() || "Officer",
    );
    await sendSupportEmail(settings, {
      to,
      subject: preview.subject,
      text: preview.text,
      html: preview.html,
      fromName: preview.fromName,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not send the test email.",
    };
  }
  return { ok: true, message: `Test email sent to ${to}.` };
}

export async function adminDeleteMemberAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };
  const userId = String(formData.get("userId") ?? "");
  const confirm = String(formData.get("confirm") ?? "").trim().toUpperCase();
  if (confirm !== "DELETE") {
    return { ok: false, error: "Type DELETE to permanently remove this member." };
  }
  try {
    await deleteMember(userId);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not delete this member.",
    };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export async function adminTransferStatusAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };
  const userId = String(formData.get("userId") ?? "");
  try {
    await updateTransferStatus({
      transferId: String(formData.get("transferId") ?? ""),
      status: String(formData.get("status") ?? "pending") as TransferStatus,
      reviewedBy: session.id,
      reviewNote: String(formData.get("reviewNote") ?? ""),
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update that transfer.",
    };
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/members/${userId}`);
  return { ok: true, message: "Transfer status updated." };
}

export async function adminLoanStatusAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };
  const userId = String(formData.get("userId") ?? "");
  try {
    await updateLoan({
      loanId: String(formData.get("loanId") ?? ""),
      status: String(formData.get("status") ?? "review") as LoanStatus,
      note: String(formData.get("note") ?? ""),
      reviewedBy: session.id,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update that loan.",
    };
  }
  revalidatePath(`/admin/members/${userId}`);
  return { ok: true, message: "Loan status updated." };
}

export async function adminDeleteAccountAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };
  const userId = String(formData.get("userId") ?? "");
  try {
    await deleteAccount(String(formData.get("accountId") ?? ""));
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not delete that account.",
    };
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/members/${userId}`);
  return { ok: true, message: "Account deleted." };
}

export async function adminUpdateActivityAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };
  const userId = String(formData.get("userId") ?? "");
  try {
    await updateTransaction({
      transactionId: String(formData.get("transactionId") ?? ""),
      description: String(formData.get("description") ?? ""),
      status: String(formData.get("status") ?? "completed") as TransferStatus,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update that activity.",
    };
  }
  revalidatePath(`/admin/members/${userId}`);
  return { ok: true, message: "Activity updated." };
}

export async function adminVoidActivityAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };
  const userId = String(formData.get("userId") ?? "");
  try {
    await voidTransaction(String(formData.get("transactionId") ?? ""), session.id);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not void that activity.",
    };
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/members/${userId}`);
  return { ok: true, message: "Activity voided." };
}

export async function adminQuickMemberAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { ok: false, error: error ?? "Operations access required." };

  const userId = String(formData.get("userId") ?? "");
  const choice = String(formData.get("choice") ?? "");

  try {
    if (choice === "delete") {
      await deleteMember(userId);
      revalidatePath("/admin");
      revalidatePath("/admin/members");
      return { ok: true, message: "Member deleted." };
    }
    if (choice === "approve") {
      await setMemberAccess(userId, "active");
      revalidatePath("/admin");
      revalidatePath("/admin/members");
      revalidatePath(`/admin/members/${userId}`);
      return { ok: true, message: "Membership approved. The member can sign in." };
    }
    if (choice === "freeze") {
      await setMemberAccess(userId, "frozen");
      revalidatePath("/admin");
      revalidatePath("/admin/members");
      revalidatePath(`/admin/members/${userId}`);
      return { ok: true, message: "Member account frozen." };
    }
    if (
      choice === "hold" ||
      choice === "pending" ||
      choice === "processing" ||
      choice === "completed"
    ) {
      await setMemberAccess(userId, "active");
      await setMemberOutgoingPolicy(userId, choice as OutgoingPolicy);
      revalidatePath("/admin");
      revalidatePath("/admin/members");
      revalidatePath(`/admin/members/${userId}`);
      return {
        ok: true,
        message: `Future outgoing transfers will start as ${choice}.`,
      };
    }
    return {
      ok: false,
      error: "Choose approve, freeze, hold, pending, processing, completed, or delete.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update this member.",
    };
  }
}

function parsePostedAt(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { value: undefined as string | undefined, error: null };
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return { value: undefined, error: "Enter a valid history date." };
  }
  return { value: date.toISOString(), error: null };
}

async function accountBelongsToMember(userId: string, accountId: string) {
  if (!userId || !accountId) return false;
  const detail = await getMemberDetail(userId);
  return Boolean(detail?.accounts.some((account) => account.id === accountId));
}
