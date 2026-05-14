import {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { fetchRateLimits, RateData } from "../utils/anthropic.js";
import { solidPNG, formatReset } from "../utils/render.js";

type Settings = Record<string, never>;
type ActionRef = WillAppearEvent<Settings>["action"];

const POLL_INTERVAL_MS = 600_000;
const BLACK_BG = solidPNG(0, 0, 0);

@action({ UUID: "io.github.borednewcoder.claudemeter.ratemeter" })
export class RateMeter extends SingletonAction<Settings> {
  private timer?: ReturnType<typeof setInterval>;
  private lastData?: RateData;
  private showWeekly = false;
  private keys = new Set<ActionRef>();

  async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
    this.keys.add(ev.action);

    if (this.lastData) {
      await this.renderKey(ev.action, this.lastData);
    } else {
      await ev.action.setImage(BLACK_BG);
      await ev.action.setTitle("...");
    }

    if (!this.timer) {
      await this.poll();
      this.timer = setInterval(() => this.poll(), POLL_INTERVAL_MS);
    }
  }

  async onWillDisappear(ev: WillDisappearEvent<Settings>): Promise<void> {
    this.keys.delete(ev.action);
    if (this.keys.size === 0 && this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  async onKeyDown(_ev: KeyDownEvent<Settings>): Promise<void> {
    this.showWeekly = !this.showWeekly;
    if (this.lastData) {
      for (const key of this.keys) await this.renderKey(key, this.lastData);
    }
  }

  private async poll(): Promise<void> {
    try {
      this.lastData = await fetchRateLimits();
      for (const key of this.keys) await this.renderKey(key, this.lastData);
    } catch {
      for (const key of this.keys) {
        await key.setImage(solidPNG(60, 60, 60));
        await key.setTitle("ERR\ncheck\nlogs");
      }
    }
  }

  private async renderKey(key: ActionRef, data: RateData): Promise<void> {
    const util = this.showWeekly ? data.weekUtil : data.fiveHUtil;
    const reset = this.showWeekly ? data.weekReset : data.fiveHReset;
    const label = this.showWeekly ? "7D" : "5H";
    const pct = Math.round(util * 100);

    await key.setImage(BLACK_BG);
    await key.setTitle(`${pct}%\n${label}\n${formatReset(reset)}`);
  }
}
