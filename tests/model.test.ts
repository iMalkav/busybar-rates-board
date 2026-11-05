import assert from "node:assert/strict";
import test from "node:test";
import schema from "../src/appmeta/settings.json" with { type: "json" };
import { AppModel } from "../src/model.ts";
import { schemaDefaults, type Settings } from "../src/lib.ts";
const NOW = 1700000000000;
const make = (values: Settings = {}, saved: Settings = {}, now = NOW) =>
  new AppModel({ ...schemaDefaults(schema.fields), ...values }, saved, now);

test("small values retain configured precision and negative change", () => {
  const a = make({ decimals: 8 });
  a.receive(
    { rates: [{ pair: "X/Y", value: 0.00001234, change_pct: -2.5 }] },
    NOW,
  );
  assert.equal(a.view(NOW).value, "0.00001234");
  assert.equal(a.view(NOW).rows?.[0], "-2.50%");
});
test("invalid feed retains last known values", () => {
  const a = make();
  a.receive({ rates: [{ pair: "A/B", value: 1, change_pct: 0 }] }, NOW);
  assert.throws(() =>
    a.receive({ rates: [{ pair: "A/B", value: "0", change_pct: 0 }] }, NOW + 1),
  );
  assert.equal(a.items.length, 1);
});
