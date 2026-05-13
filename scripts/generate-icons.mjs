/**
 * Generates placeholder solid-color PNG icons for the Stream Deck plugin.
 * Run via: node scripts/generate-icons.mjs
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMGS = join(__dirname, "..", "io.github.borednewcoder.claudemeter.sdPlugin", "imgs");

mkdirSync(IMGS, { recursive: true });

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (const b of buf) c = crcTable[(c ^ b) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.allocUnsafe(4); len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, "ascii");
  const crcB = Buffer.allocUnsafe(4);
  crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([len, typeB, data, crcB]);
}

function makePNG(r, g, b, size = 72) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const row = Buffer.allocUnsafe(1 + size * 3);
  row[0] = 0;
  for (let x = 0; x < size; x++) { row[1+x*3]=r; row[2+x*3]=g; row[3+x*3]=b; }
  const rows = Buffer.concat(Array.from({ length: size }, () => Buffer.from(row)));
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(rows)), chunk("IEND", Buffer.alloc(0))]);
}

const icons = [
  { name: "action-default", r: 0,  g: 0,   b: 0   },
  { name: "plugin-default", r: 22, g: 100, b: 180 },
];

for (const { name, r, g, b } of icons) {
  for (const size of [72, 144]) {
    const suffix = size === 144 ? "@2x" : "";
    const path = join(IMGS, `${name}${suffix}.png`);
    writeFileSync(path, makePNG(r, g, b, size));
    console.log(`wrote ${path}`);
  }
}
