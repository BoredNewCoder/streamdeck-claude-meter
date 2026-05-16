# streamdeck-claude-meter

Stream Deck plugin that displays live Claude API rate limit usage. Reads directly from your local Claude Code credentials — no API key configuration needed.

Inspired by [Clawdmeter](https://github.com/HermannBjorgvin/Clawdmeter) by HermannBjorgvin.

## What it shows

The key displays a horizontal meter bar plus both utilization percentages:

```
5H:73%    ← 5-hour window utilization
7D:12%    ← 7-day window utilization
[████░░░]  ← color bar: green → yellow → red as usage rises
```

- **Bar** fills left-to-right as usage increases; color shifts green → yellow → red
- Press the key to toggle which window the bar tracks (5H ↔ 7D)
- Both percentages are always visible regardless of toggle
- If the key shows `ERR / check / logs`, see [Troubleshooting](#troubleshooting)

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Elgato Stream Deck software](https://www.elgato.com/downloads) 6.4+
- Claude Code installed and logged in (`~/.claude/.credentials.json` must exist)

## Install

```bash
git clone https://github.com/YOUR_USERNAME/streamdeck-claude-meter
cd streamdeck-claude-meter
npm install
npm run dev
```

`npm run dev` builds the plugin and links it to Stream Deck automatically.

## Usage

1. Open Stream Deck software
2. Find **Claude Meter** in the action list (right panel)
3. Drag **Rate Meter** onto any key
4. The key polls every **1 minute** automatically — the first fetch runs immediately on appearance
5. Press the key to toggle 5H ↔ 7D view
6. You can place the action on multiple keys; they all share one poll timer and stay in sync

## How it works

Every minute the plugin:
1. Reads your OAuth token from `~/.claude/.credentials.json`
2. Makes a minimal API call to `api.anthropic.com/v1/messages` (1 token, cheapest model)
3. Reads rate limit headers from the response:
   - `anthropic-ratelimit-unified-5h-utilization`
   - `anthropic-ratelimit-unified-7d-utilization`
   - `anthropic-ratelimit-unified-5h-reset`
   - `anthropic-ratelimit-unified-7d-reset`
4. Displays the data on the key

## Troubleshooting

**Key shows `ERR / check / logs`**

The plugin failed to fetch rate limit data. Common causes:

| Symptom | Fix |
|---|---|
| `~/.claude/.credentials.json` missing | Log into Claude Code: run `claude` in a terminal and complete auth |
| Token expired | Same — re-run `claude` to refresh credentials |
| No internet / firewall blocking `api.anthropic.com` | Check network; corporate proxies may block the endpoint |
| Rate limited (HTTP 429) | Wait for the 5H window to reset, then the key will recover automatically |

Log file location: `%appdata%\Elgato\StreamDeck\logs\io.github.borednewcoder.claudemeter.log`

Open it with any text editor or run:
```powershell
notepad "$env:APPDATA\Elgato\StreamDeck\logs\io.github.borednewcoder.claudemeter.log"
```

**Key stuck on `...`**

The first poll hasn't completed yet. Wait a few seconds. If it never resolves, check the log file.

---

## macOS support

The plugin ships Windows-only by default. To enable macOS:

1. Open `manifest.json`
2. Find the `"OS"` array and add a `mac` entry:

```json
"OS": [
  { "Platform": "windows", "MinimumVersion": "10" },
  { "Platform": "mac", "MinimumVersion": "10.15" }
]
```

3. Rebuild and re-link:

```bash
npm run dev
```

The credentials path (`~/.claude/.credentials.json`) is the same on macOS, so no other changes are needed.

---

## Rebuild after changes

```bash
npm run build
streamdeck restart io.github.borednewcoder.claudemeter
```

## Credits & Licenses

- Inspired by [Clawdmeter](https://github.com/HermannBjorgvin/Clawdmeter) (HermannBjorgvin) — source of the `anthropic-ratelimit-unified-*` header technique
- [@elgato/streamdeck](https://github.com/elgatosf/streamdeck) — MIT License (Elgato)
- [esbuild](https://github.com/evanw/esbuild) — MIT License
- [TypeScript](https://github.com/microsoft/TypeScript) — Apache 2.0 License (Microsoft)
- This project uses no Anthropic-owned assets, fonts, or trademarks

## Notes

- The plugin UUID is `io.github.borednewcoder.claudemeter` — change this in `manifest.json`, `rate-meter.ts`, and `package.json` if you fork and redistribute
- Currently Windows-only (manifest OS config); add `mac` entry to `manifest.json` for macOS support
- Plugin logs at `%appdata%\Elgato\StreamDeck\logs\io.github.borednewcoder.claudemeter.log`
