/**
 * One-time: download the membership ledger from Vercel Blob to a local file.
 *
 * Usage (PowerShell):
 *   $env:BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
 *   npm run export-ledger
 *
 * Then upload data/bank-export.json to Railway as /data/bank.json
 * (see walkthrough in the chat), and remove the token from Railway after.
 */
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
if (!token) {
  console.error("Set BLOB_READ_WRITE_TOKEN first.");
  process.exit(1);
}

const outDir = path.join(process.cwd(), "data");
const outFile = path.join(outDir, "bank-export.json");

async function readBlobText(get, urlOrPathname) {
  const result = await get(urlOrPathname, {
    access: "private",
    token,
    useCache: false,
  });
  if (!result?.stream) return null;
  const text = await new Response(result.stream).text();
  return text.trim() ? text : null;
}

const { get, list } = await import("@vercel/blob");

let json = await readBlobText(get, "bank-store.json");
if (!json) {
  json = await readBlobText(get, "bank-store.backup.json");
}
if (!json) {
  const listed = await list({ token, prefix: "bank-store", limit: 20 });
  const newest = [...listed.blobs].sort(
    (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime(),
  )[0];
  if (newest) {
    json = await readBlobText(get, newest.url);
  }
}

if (!json) {
  console.error(
    "No bank-store.json found in Blob (or Hobby limits are still blocking reads).",
  );
  console.error("Upgrade to Pro or wait until access resumes, then retry.");
  process.exit(1);
}

try {
  JSON.parse(json);
} catch {
  console.error("Downloaded file is not valid JSON.");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, json);
console.log(`Wrote ${outFile} (${Buffer.byteLength(json)} bytes)`);
console.log("Next: copy this file to Railway volume path /data/bank.json");
