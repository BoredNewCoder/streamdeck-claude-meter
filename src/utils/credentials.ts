import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

export async function readAccessToken(): Promise<string> {
  const credPath = join(homedir(), ".claude", ".credentials.json");
  const raw = await readFile(credPath, "utf-8");
  const data = JSON.parse(raw);
  const token = data?.claudeAiOauth?.accessToken ?? data?.accessToken;
  if (!token) throw new Error(`No accessToken in ${credPath}`);
  return token;
}
