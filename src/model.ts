import {
  record,
  str,
  num,
  requiredNumber,
  requiredText,
  entries,
  Feed,
  type View,
} from "./lib.ts";

export class AppModel extends Feed {
  receive(value: unknown, now: number): void {
    const data = record(value);
    const items = entries(data.rates).map((raw) => {
      const v = record(raw);
      return {
        pair: requiredText(v.pair, 32),
        value: requiredNumber(v.value),
        change: requiredNumber(v.change_pct),
      };
    });
    this.commit(
      items,
      now,
      data.updated_at === undefined ? now : data.updated_at,
    );
  }
  view(now: number): View {
    if (!this.items.length) return this.empty("Rates", now);
    const v = this.items[this.selected];
    const change = num(v, "change");
    return this.feedView(
      str(v, "pair"),
      num(v, "value").toFixed(num(this.settings, "decimals", 4)),
      [
        (change >= 0 ? "+" : "") + change.toFixed(2) + "%",
        this.selected + 1 + " / " + this.items.length,
      ],
      now,
      change < 0 ? "#FF7777FF" : "#66EE99FF",
    );
  }
}
