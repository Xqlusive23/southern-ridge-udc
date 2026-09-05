import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_DAYS } from "@/lib/constants";
import { getPublicUserById, getUserByEmail, recordLogin } from "@/lib/store";
import { verifyPassword } from "@/lib/passwords";
import type { Role, SessionUser } from "@/lib/types";

const SECRET =
  process.env.SESSION_SECRET ?? "srudc-local-demo-secret-change-in-production";

type TokenPayload = {
  sub: string;
  role: Role;
  exp: number;
};

function sign(payload: TokenPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function readToken(token: string): TokenPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", SECRET).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as TokenPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, role: Role) {
  const token = sign({
    sub: userId,
    role,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = readToken(token);
  if (!payload) return null;
  const user = await getPublicUserById(payload.sub);
  if (!user) return null;
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status,
  };
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
  if (user.status === "closed") {
    return { error: "This membership is closed. Call a branch officer for help." };
  }
  await recordLogin(user.id);
  return { user };
}
