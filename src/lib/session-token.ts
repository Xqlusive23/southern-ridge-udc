export type TokenPayload = {
  sub: string;
  role: "member" | "admin";
  exp: number;
};

const SECRET =
  process.env.SESSION_SECRET ?? "srudc-local-demo-secret-change-in-production";

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  return Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
}

async function signBody(body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body),
  );
  return toBase64Url(new Uint8Array(signature));
}

export async function signSessionToken(payload: TokenPayload) {
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  return `${body}.${await signBody(body)}`;
}

export async function readSessionToken(token: string): Promise<TokenPayload | null> {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = await signBody(body);
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  if (diff !== 0) return null;
  try {
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(body)),
    ) as TokenPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
