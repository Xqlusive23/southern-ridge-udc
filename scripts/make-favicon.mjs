import fs from "fs";
import path from "path";

function pngToIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = [];
  for (const buf of pngBuffers) {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    entries.push({
      wByte: width >= 256 ? 0 : width,
      hByte: height >= 256 ? 0 : height,
      size: buf.length,
      offset,
      buf,
    });
    offset += buf.length;
  }
  const out = Buffer.alloc(offset);
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(count, 4);
  let entryAt = 6;
  for (const e of entries) {
    out[entryAt] = e.wByte;
    out[entryAt + 1] = e.hByte;
    out[entryAt + 2] = 0;
    out[entryAt + 3] = 0;
    out.writeUInt16LE(1, entryAt + 4);
    out.writeUInt16LE(32, entryAt + 6);
    out.writeUInt32LE(e.size, entryAt + 8);
    out.writeUInt32LE(e.offset, entryAt + 12);
    entryAt += 16;
  }
  for (const e of entries) {
    e.buf.copy(out, e.offset);
  }
  return out;
}

const pngs = [16, 32, 48].map((s) =>
  fs.readFileSync(path.join("public", `favicon-${s}.png`)),
);
const ico = pngToIco(pngs);
fs.writeFileSync(path.join("src", "app", "favicon.ico"), ico);
fs.copyFileSync(
  path.join("public", "favicon-32.png"),
  path.join("src", "app", "icon.png"),
);
fs.copyFileSync(path.join("public", "icon.svg"), path.join("src", "app", "icon.svg"));
console.log("wrote favicon.ico", ico.length, "bytes");
