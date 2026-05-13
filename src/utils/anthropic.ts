import { readAccessToken } from "./credentials.js";

export interface RateData {
  fiveHUtil: number;
  fiveHReset: string;
  weekUtil: number;
  weekReset: string;
  status: string;
  ok: boolean;
}

export async function fetchRateLimits(): Promise<RateData> {
  const token = await readAccessToken();

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "oauth-2025-04-20",
      "Content-Type": "application/json",
      "User-Agent": "claude-code/2.1.5",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1,
      messages: [{ role: "user", content: "hi" }],
    }),
  });

  const h = (name: string) => res.headers.get(name) ?? "";

  const fiveHReset = h("anthropic-ratelimit-unified-5h-reset");
  const weekReset = h("anthropic-ratelimit-unified-7d-reset");
  console.log("[claudemeter] 5h-reset raw:", JSON.stringify(fiveHReset));
  console.log("[claudemeter] 7d-reset raw:", JSON.stringify(weekReset));

  return {
    fiveHUtil: parseFloat(h("anthropic-ratelimit-unified-5h-utilization")) || 0,
    fiveHReset,
    weekUtil: parseFloat(h("anthropic-ratelimit-unified-7d-utilization")) || 0,
    weekReset,
    status: h("anthropic-ratelimit-unified-5h-status") || "unknown",
    ok: res.status !== 429,
  };
}
