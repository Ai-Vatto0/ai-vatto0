export default function handler(_req, res) {
  return res.status(200).json({ ok: true, service: "lyra-kie-v2", version: "2.0.0", render_started: false });
}
