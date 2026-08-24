# Lyra KIE V2 Full — 2.1.0

Compatibility-first replacement for the original Lyra KIE Render bridge.

## Preserved tools/models
- `render_gpt_image_2` — GPT Image 2
- `render_flux2_pro_image` — Flux 2 Pro
- `render_seedream5_lite_image` — Seedream 5 Lite
- `render_kie_video` — Grok Imagine Video 1.5 (default), Seedance 2 Fast, Seedance 2 Mini, **Kling 3.0**
- `check_kie_render`
- `check_kie_credits`

## New safety/tools
- `prepare_kie_render` — exact payload dry-run, no generation
- `check_kling3_available`
- `check_lyra_v2`
- `save_product_cheat`, `get_product_cheat`, `list_product_cheats`
- `list_kie_jobs`

Every paid render requires `confirm_render=true`. `createTask` is never retried automatically.

## Database
If `DATABASE_URL` is configured, product cheats and job history are persisted in Neon Postgres. Without it, Lyra falls back to volatile memory so rendering is never blocked; the system check clearly reports `persistent:false`.
