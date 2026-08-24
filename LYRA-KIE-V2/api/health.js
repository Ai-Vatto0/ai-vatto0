import { databaseHealth } from "../src/database.js";

export default async function handler(_req, res) {
  const db = await databaseHealth();
  return res.status(200).json({
    ok: true,
    service: "lyra-kie-v2-full",
    version: "2.1.0",
    models: {
      images: ["gpt-image-2", "flux-2-pro", "seedream-5-lite"],
      videos: ["grok-imagine-video-1.5", "seedance-2-fast", "seedance-2-mini", "kling-3.0"]
    },
    database: db,
    render_started: false
  });
}
