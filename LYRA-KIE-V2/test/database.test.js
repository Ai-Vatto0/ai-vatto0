import test from "node:test";
import assert from "node:assert/strict";
import { databaseHealth, getProduct, listProducts, recordJob, upsertProduct } from "../src/database.js";

test("database fallback is non-blocking", async () => {
  const h = await databaseHealth(); assert.equal(h.ok, true);
});
test("product cheat roundtrip", async () => {
  await upsertProduct({ product_id: "p1", name: "Scooter", visual_locks: ["2 grips"] });
  const p = await getProduct("p1"); assert.equal(p.name, "Scooter");
  assert.ok((await listProducts()).length >= 1);
});
test("job roundtrip", async () => {
  const j = await recordJob({ task_id: "t1", model: "grok", state: "submitted" }); assert.equal(j.task_id, "t1");
});
