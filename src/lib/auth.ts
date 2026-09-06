import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_DAYS } from "@/lib/constants";
import { readSessionToken, signSessionToken } from "@/lib/session-token";
import { getPublicUserById, getUserByEmail, recordLogin } from "@/lib/store";
import { verifyPassword } from "@/lib/passwords";
import type { Role, SessionUser } from "@/lib/types";

function sessionCookieBase() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL),
  };
}

async function writeSessionCookie(value: string, maxAge: number) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, value, {
    ...sessionCookieBase(),
    maxAge,
  });
}

export async function createSession(userId: string, role: Role) {
  const token = await signSessionToken({
    sub: userId,
    role,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
  await writeSessionCookie(token, SESSION_DAYS * 24 * 60 * 60);
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await readSessionToken(token);
  if (!payload) {
    await clearSession();
    return null;
  }
  try {
    const user = await getPublicUserById(payload.sub);
    if (!user) {
      await clearSession();
      return null;
    }
    return {
      id: user.id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
    };
  } catch (error) {
    console.error("Session user lookup failed", error);
    return null;
  }
}

export async function requireSession(role?: Role) {
  const session = await getSession();
  if (!session) return null;
  if (role && session.role !== role) return null;
  return session;
}

export async function authenticate(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) return { error: "We could not find a match for that email and password." };
  if (!verifyPassword(password, user.passwordHash)) {
    return { error: "We could not find a match for that email and password." };
  }
  if (user.status === "pending") {
    return {
      error:
        "This membership is waiting for operations approval. You can sign in after a branch officer activates it.",
    };
  }
  if (user.status === "closed") {
    return { error: "This membership is closed. Call a branch officer for help." };
  }
  if (user.status === "banned") {
    return {
      error: "This membership is banned. Login access has been restricted.",
    };
  }
  try {
    await recordLogin(user.id);
  } catch (error) {
    console.error("Login timestamp could not be saved", error);
  }
  return { user };
}
