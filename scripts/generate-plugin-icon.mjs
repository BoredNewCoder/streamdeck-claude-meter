import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, "..", "imgs", "plugin-icon.svg");
const outDir = join(__dirname, "..", "io.github.borednewcoder.claudemeter.sdPlugin", "imgs");

const svg = readFileSync(svgPath, "utf8");

for (const name of ["plugin-default", "action-default"]) {
  for (const size of [72, 144]) {
    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
    const png = resvg.render().asPng();
    const suffix = size === 144 ? "@2x" : "";
    const out = join(outDir, `${name}${suffix}.png`);
    writeFileSync(out, png);
    console.log(`wrote ${out} (${size}x${size})`);
  }
}
