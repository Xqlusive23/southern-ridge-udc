"use server";

import { redirect } from "next/navigation";
import { authenticate, clearSession, createSession, getSession } from "@/lib/auth";
import { createMember } from "@/lib/store";
import type { ActionResult } from "@/lib/types";

function required(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function passwordValue(formData: FormData) {
  return String(formData.get("password") ?? "");
}

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = required(formData, "email");
  const password = passwordValue(formData);
  const expectedRole = required(formData, "role") || "member";

  if (!email || !password) {
    return { ok: false, error: "Enter your email and password." };
  }

  try {
    const result = await authenticate(email, password);
    if ("error" in result) return { ok: false, error: result.error };

    if (expectedRole === "admin" && result.user.role !== "admin") {
      return { ok: false, error: "This portal is reserved for operations staff." };
    }
    if (expectedRole === "member" && result.user.role !== "member") {
      return { ok: false, error: "Staff should sign in through the operations console." };
    }
    if (result.user.status === "pending" && result.user.role === "member") {
      return {
        ok: false,
        error:
          "This membership is waiting for operations approval. You can sign in after a branch officer activates it.",
      };
    }
    if (result.user.status === "frozen" && result.user.role === "member") {
      await createSession(result.user.id, result.user.role);
      redirect("/banking");
    }

    await createSession(result.user.id, result.user.role);
    redirect(result.user.role === "admin" ? "/admin" : "/banking");
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    console.error("Login failed", error);
    const message = error instanceof Error ? error.message : "";
    return {
      ok: false,
      error: message.includes("ledger")
        ? message
        : "Sign-in could not be completed. Please try again in a moment.",
    };
  }
}

export async function registerAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const firstName = required(formData, "firstName");
  const lastName = required(formData, "lastName");
  const email = required(formData, "email");
  const password = passwordValue(formData);
  const phone = required(formData, "phone");
  const address = required(formData, "address");
  const city = required(formData, "city");
  const state = required(formData, "state");
  const zip = required(formData, "zip");
  const dateOfBirth = required(formData, "dateOfBirth");

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !phone ||
    !address ||
    !city ||
    !state ||
    !zip ||
    !dateOfBirth
  ) {
    return { ok: false, error: "Please complete every field to open your membership." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Choose a password with at least 8 characters." };
  }
  if (!email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }

  try {
    await createMember({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      city,
      state,
      zip,
      dateOfBirth,
      status: "pending",
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "We could not open that account.",
    };
  }
  return {
    ok: true,
    message:
      "Application received. A branch officer must approve this membership before you can sign in to E-Banking.",
  };
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function currentSession() {
  return getSession();
}
