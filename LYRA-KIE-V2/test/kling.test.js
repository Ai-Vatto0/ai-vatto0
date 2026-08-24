import test from "node:test";
import assert from "node:assert/strict";
import { previewKlingPayload, validateKlingArgs } from "../src/kling.js";

const file = (id) => ({ download_url: `https://example.com/${id}.png`, file_id: id, file_name: `${id}.png` });

test("single-shot Kling payload matches KIE model id", () => {
  const payload = previewKlingPayload({
    prompt: "Track @scooter exactly",
    start_frame: file("start"),
    reference_image_1: file("a"),
    reference_image_2: file("b"),
    element_name: "scooter",
    duration: 4,
    mode: "pro",
    aspect_ratio: "9:16",
    sound: true,
  });
  assert.equal(payload.model, "kling-3.0/video");
  assert.equal(payload.input.duration, "4");
  assert.equal(payload.input.multi_shots, false);
});

test("one element reference image is rejected", () => {
  assert.throws(() => validateKlingArgs({
    prompt: "Use @scooter",
    reference_image_1: file("a"),
    element_name: "scooter",
  }));
});

test("element name must be used in prompt", () => {
  assert.throws(() => validateKlingArgs({
    prompt: "Scooter rides",
    reference_image_1: file("a"),
    reference_image_2: file("b"),
    element_name: "scooter",
  }));
});
