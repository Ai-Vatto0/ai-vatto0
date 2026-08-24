# Lyra KIE V2

Private MCP bridge for KIE.ai with a diagnostic-first Kling 3.0 workflow.

## Safety workflow
1. `check_kie_credits` — read-only, no generation.
2. `check_kling3_available` — checks KIE auth + public Kling marketplace page, no generation.
3. `prepare_kling3_video` — dry-run; validates exact payload, no upload, no generation.
4. `render_kling3_video` — requires `confirm_render: true`; uploads references to KIE temporary storage first, then creates exactly one task.
5. `check_kie_render` — polls the task status.

## KIE endpoints
- Credits: `GET https://api.kie.ai/api/v1/chat/credit`
- Create task: `POST https://api.kie.ai/api/v1/jobs/createTask`
- Task status: `GET https://api.kie.ai/api/v1/jobs/recordInfo`
- Free URL file upload: `POST https://kieai.redpandaai.co/api/file-url-upload`
- Kling model: `kling-3.0/video`

## Deploy on Vercel
Create a Vercel project whose root directory is this folder, then set `KIE_API_KEY` as a Vercel environment variable. Do not commit the key.

MCP URL after deployment: `https://<project>.vercel.app/mcp`
Health URL: `https://<project>.vercel.app/health`
