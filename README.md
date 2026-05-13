# streamdeck-claude-meter

Stream Deck plugin that displays live Claude API rate limit usage. Reads directly from your local Claude Code credentials — no API key configuration needed.

Inspired by [Clawdmeter](https://github.com/HermannBjorgvin/Clawdmeter).

## What it shows

- **5H view** — 5-hour rolling window utilization % + time until reset
- **7D view** — 7-day rolling window utilization % + time until reset
- Press the key to toggle between views
- Background is pure black; text is white

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
4. The key polls every 60 seconds automatically
5. Press the key to toggle 5H ↔ 7D view

## How it works

Every 60 seconds the plugin:
1. Reads your OAuth token from `~/.claude/.credentials.json`
2. Makes a minimal API call to `api.anthropic.com/v1/messages` (1 token, cheapest model)
3. Reads rate limit headers from the response:
   - `anthropic-ratelimit-unified-5h-utilization`
   - `anthropic-ratelimit-unified-7d-utilization`
   - `anthropic-ratelimit-unified-5h-reset`
   - `anthropic-ratelimit-unified-7d-reset`
4. Displays the data on the key

## Rebuild after changes

```bash
npm run build
streamdeck restart io.github.borednewcoder.claudemeter
```

## Notes

- The plugin UUID is `io.github.borednewcoder.claudemeter` — change this in `manifest.json`, `rate-meter.ts`, and `package.json` if you fork and redistribute
- Currently Windows-only (manifest OS config); add `mac` entry to `manifest.json` for macOS support
- Plugin logs at `%appdata%\Elgato\StreamDeck\logs\io.github.borednewcoder.claudemeter.log`
