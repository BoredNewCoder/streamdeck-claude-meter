import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outfile = join(root, "io.github.borednewcoder.claudemeter.sdPlugin", "bin", "plugin.js");

mkdirSync(join(root, "io.github.borednewcoder.claudemeter.sdPlugin", "bin"), { recursive: true });

await build({
  entryPoints: [join(root, "src", "plugin.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outfile,
  tsconfig: join(root, "tsconfig.json"),
  sourcemap: "inline",
  logLevel: "info",
});

console.log("Build complete →", outfile);
