import { deflateSync } from "node:zlib";

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xFFFFFFFF;
  for (const b of buf) c = crcTable[(c ^ b) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, "ascii");
  const crcB = Buffer.allocUnsafe(4);
  crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([len, typeB, data, crcB]);
}

export function solidPNG(r: number, g: number, b: number, size = 72): string {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const row = Buffer.allocUnsafe(1 + size * 3);
  row[0] = 0;
  for (let x = 0; x < size; x++) {
    row[1 + x * 3] = r;
    row[2 + x * 3] = g;
    row[3 + x * 3] = b;
  }
  const rows = Buffer.concat(Array.from({ length: size }, () => Buffer.from(row)));
  const idat = deflateSync(rows);

  return `data:image/png;base64,${Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]).toString("base64")}`;
}

export function formatReset(iso: string): string {
  if (!iso) return "?";
  const trimmed = iso.trim();
  if (!trimmed) return "?";

  let date = new Date(trimmed);

  // Handle Unix timestamp (seconds) if ISO parse fails
  if (isNaN(date.getTime())) {
    const n = parseInt(trimmed, 10);
    if (!isNaN(n)) date = new Date(n < 1e10 ? n * 1000 : n);
  }

  if (isNaN(date.getTime())) return "?";

  const ms = date.getTime() - Date.now();
  if (ms <= 0) return "now";
  const mins = Math.ceil(ms / 60_000);
  return mins >= 60 ? `${Math.round(mins / 60)}h` : `${mins}m`;
}
