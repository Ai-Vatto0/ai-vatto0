import test from "node:test";
import assert from "node:assert/strict";
import { buildFluxTask, buildGptImage2Task, buildSeedreamTask, buildVideoTask } from "../src/payloads.js";
const f = (n) => ({ download_url: `https://example.com/${n}.png`, file_id: n, file_name: `${n}.png` });

test("legacy GPT Image 2 payload preserved", () => {
  assert.equal(buildGptImage2Task({ prompt: "x" }).model, "gpt-image-2-text-to-image");
  assert.equal(buildGptImage2Task({ prompt: "x", reference_image_1: f("a") }).model, "gpt-image-2-image-to-image");
});
test("legacy Flux payload preserved", () => {
  const x = buildFluxTask({ prompt: "x" });
  assert.equal(x.model, "flux-2/pro-text-to-image"); assert.equal(x.input.resolution, "2K");
});
test("legacy Seedream payload preserved", () => {
  const x = buildSeedreamTask({ prompt: "x" });
  assert.equal(x.model, "seedream/5-lite-text-to-image"); assert.equal(x.input.output_format, "png");
});
test("legacy Grok payload preserved", () => {
  const x = buildVideoTask({ prompt: "x", start_frame: f("s") });
  assert.equal(x.model, "grok-imagine-video-1-5-preview"); assert.equal(x.input.duration, 13); assert.equal(x.input.resolution, "720p"); assert.deepEqual(x.input.image_urls, ["https://example.com/s.png"]);
});
test("legacy Seedance Fast first-frame payload preserved", () => {
  const x = buildVideoTask({ prompt: "x", model: "seedance_2_fast", start_frame: f("s") });
  assert.equal(x.model, "bytedance/seedance-2-fast"); assert.equal(x.input.first_frame_url, "https://example.com/s.png");
});
test("legacy Seedance Mini multimodal payload preserved", () => {
  const x = buildVideoTask({ prompt: "x", model: "seedance_2_mini", seedance_reference_mode: "multimodal", reference_image_1: f("a"), reference_image_2: f("b") });
  assert.equal(x.model, "bytedance/seedance-2-mini"); assert.equal(x.input.reference_image_urls.length, 2);
});
test("Kling 3.0 added without replacing legacy models", () => {
  const x = buildVideoTask({ prompt: "Show @scooter riding", model: "kling_3_0", reference_image_1: f("a"), reference_image_2: f("b"), element_name: "scooter", duration: 10 });
  assert.equal(x.model, "kling-3.0/video"); assert.equal(x.input.mode, "pro"); assert.equal(x.input.duration, "10"); assert.equal(x.input.kling_elements[0].element_input_urls.length, 2);
});
test("Kling rejects one element reference", () => {
  assert.throws(() => buildVideoTask({ prompt: "Show @product", model: "kling_3_0", reference_image_1: f("a") }), /2 bis 4/);
});

test("Kling references are rehosted before paid submission", async () => {
  const { rehostKlingPayload } = await import("../src/kie-client.js");
  const body = buildVideoTask({
    prompt: "Show @scooter riding",
    model: "kling_3_0",
    start_frame: f("start"),
    reference_image_1: f("a"),
    reference_image_2: f("b"),
    element_name: "scooter",
    duration: 5
  });
  const calls = [];
  const out = await rehostKlingPayload(body, async (url) => {
    calls.push(url);
    return `https://temp.kie.test/${calls.length}.png`;
  });
  assert.equal(calls.length, 3);
  assert.deepEqual(out.input.image_urls, ["https://temp.kie.test/1.png"]);
  assert.deepEqual(out.input.kling_elements[0].element_input_urls, ["https://temp.kie.test/2.png", "https://temp.kie.test/3.png"]);
  assert.equal(body.input.image_urls[0], "https://example.com/start.png");
});
