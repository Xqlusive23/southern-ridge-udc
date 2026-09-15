import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

/**
 * Durable disk on Railway (volume) or local `data/`.
 * Vercel /tmp is ephemeral — there we still prefer Blob when configured.
 */
function resolveDataDir() {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  if (process.env.RAILWAY_VOLUME_MOUNT_PATH) {
    return process.env.RAILWAY_VOLUME_MOUNT_PATH;
  }
  if (process.env.VERCEL) {
    return path.join("/tmp", "southern-ridge-udc");
  }
  return path.join(process.cwd(), "data");
}

const DATA_DIR = resolveDataDir();
const DATA_FILE = path.join(DATA_DIR, "bank.json");
const BLOB_PATHNAME = "bank-store.json";
const BLOB_BACKUP_PATHNAME = "bank-store.backup.json";

/** True when writes to DATA_DIR survive restarts (local + Railway volume). */
function hasDurableDisk() {
  if (process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH) {
    return true;
  }
  // Plain Railway container disk lasts until redeploy; better than Blob flakiness.
  if (process.env.RAILWAY_ENVIRONMENT) return true;
  return !process.env.VERCEL;
}

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || "";
}

export type PersistedLoad =
  | { status: "loaded"; json: string; durable: boolean }
  | { status: "missing" }
  | { status: "unavailable" };

function writeLocal(json: string) {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(DATA_FILE, json);
}

function readLocal() {
  if (!existsSync(DATA_FILE)) return null;
  return readFileSync(DATA_FILE, "utf8");
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readBlobText(
  get: typeof import("@vercel/blob").get,
  token: string,
  urlOrPathname: string,
) {
  const result = await get(urlOrPathname, {
    access: "private",
    token,
    useCache: false,
  });
  if (!result?.stream) return null;
  const text = await new Response(result.stream).text();
  return text.trim() ? text : null;
}

async function loadFromBlob(token: string): Promise<PersistedLoad> {
  try {
    const { get, list } = await import("@vercel/blob");
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const primary = await readBlobText(get, token, BLOB_PATHNAME);
      if (primary) {
        writeLocal(primary);
        return { status: "loaded", json: primary, durable: true };
      }

      const listed = await list({ token, prefix: "bank-store", limit: 20 });
      const newest = [...listed.blobs].sort(
        (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime(),
      )[0];
      if (newest) {
        const fromList = await readBlobText(get, token, newest.url);
        if (fromList) {
          writeLocal(fromList);
          return { status: "loaded", json: fromList, durable: true };
        }
        return { status: "unavailable" };
      }

      if (attempt === 0) await wait(250);
    }

    return { status: "missing" };
  } catch (error) {
    console.error("Blob load failed", error);
    return { status: "unavailable" };
  }
}

export async function loadPersistedJson(): Promise<PersistedLoad> {
  const local = readLocal();
  if (local) {
    return { status: "loaded", json: local, durable: hasDurableDisk() };
  }

  const token = blobToken();
  if (token) {
    const fromBlob = await loadFromBlob(token);
    if (fromBlob.status === "loaded") return fromBlob;
    if (hasDurableDisk()) return { status: "missing" };
    return fromBlob;
  }

  if (hasDurableDisk()) return { status: "missing" };
  return { status: "unavailable" };
}

export async function savePersistedJson(json: string) {
  writeLocal(json);

  const token = blobToken();
  if (!token) {
    if (!hasDurableDisk()) {
      throw new Error(
        "The membership ledger is not connected. Deploy on Railway with a volume (DATA_DIR) or set BLOB_READ_WRITE_TOKEN.",
      );
    }
    return;
  }

  const { put } = await import("@vercel/blob");
  const options = {
    access: "private" as const,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
    token,
  };
  await put(BLOB_PATHNAME, json, options);
  try {
    await put(BLOB_BACKUP_PATHNAME, json, options);
  } catch (error) {
    console.error("Blob backup save failed", error);
  }
}

function photoPathname(userId: string) {
  return `members/${userId}/photo`;
}

function localPhotoFile(userId: string) {
  return path.join(DATA_DIR, "photos", userId);
}

function localPhotoMeta(userId: string) {
  return path.join(DATA_DIR, "photos", `${userId}.type`);
}

export async function saveMemberPhoto(
  userId: string,
  body: Buffer,
  contentType: string,
) {
  const pathname = photoPathname(userId);
  const token = blobToken();
  const dir = path.join(DATA_DIR, "photos");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(localPhotoFile(userId), body);
  writeFileSync(localPhotoMeta(userId), contentType);

  if (token) {
    const { put } = await import("@vercel/blob");
    await put(pathname, body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
      token,
    });
  }
  return pathname;
}

export async function loadMemberPhoto(userId: string) {
  const token = blobToken();
  if (token) {
    try {
      const { get } = await import("@vercel/blob");
      const result = await get(photoPathname(userId), {
        access: "private",
        token,
        useCache: false,
      });
      if (result?.statusCode === 200 && result.stream) {
        const bytes = Buffer.from(await new Response(result.stream).arrayBuffer());
        return {
          bytes,
          contentType: result.blob.contentType || "image/jpeg",
        };
      }
    } catch (error) {
      console.error("Photo blob load failed", error);
    }
  }
  if (!existsSync(localPhotoFile(userId))) return null;
  const bytes = readFileSync(localPhotoFile(userId));
  const contentType = existsSync(localPhotoMeta(userId))
    ? readFileSync(localPhotoMeta(userId), "utf8")
    : "image/jpeg";
  return { bytes, contentType };
}
