import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildFluxTask, buildGptImage2Task, buildSeedreamTask, buildVideoTask, previewSummary } from "./payloads.js";
import { checkKlingMarketplace, createTask, getCredits, getTask, rehostKlingPayload } from "./kie-client.js";
import { databaseHealth, getJob, getProduct, listJobs, listProducts, recordJob, upsertProduct } from "./database.js";

const fileSchema = z.object({ download_url: z.string().url(), file_id: z.string().min(1), mime_type: z.string().optional(), file_name: z.string().optional() });
const ref4 = { reference_image_1: fileSchema.optional(), reference_image_2: fileSchema.optional(), reference_image_3: fileSchema.optional(), reference_image_4: fileSchema.optional() };
const ref8 = { ...ref4, reference_image_5: fileSchema.optional(), reference_image_6: fileSchema.optional(), reference_image_7: fileSchema.optional(), reference_image_8: fileSchema.optional() };
const imageAspect = z.enum(["1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3"]);
const imageFields = { prompt: z.string().min(3).max(5000), ...ref8, aspect_ratio: imageAspect.optional(), product_id: z.string().min(1).optional() };
const videoFields = {
  prompt: z.string().min(3).max(5000),
  model: z.enum(["grok_imagine_video_1_5", "seedance_2_fast", "seedance_2_mini", "kling_3_0"]).optional(),
  start_frame: fileSchema.optional(), last_frame: fileSchema.optional(), ...ref4,
  aspect_ratio: z.enum(["9:16", "16:9", "1:1"]).optional(), resolution: z.enum(["480p", "720p"]).optional(), duration: z.number().int().min(4).max(15).optional(),
  generate_audio: z.boolean().optional(), seedance_reference_mode: z.enum(["first_frame", "multimodal"]).optional(),
  kling_mode: z.enum(["std", "pro", "4K"]).optional(), kling_multi_shots: z.boolean().optional(),
  kling_multi_prompt: z.array(z.record(z.unknown())).optional(), element_name: z.string().regex(/^[A-Za-z0-9_-]+$/).optional(), element_description: z.string().max(300).optional(),
  product_id: z.string().min(1).optional()
};
const renderAnnotations = { readOnlyHint: false, openWorldHint: true, destructiveHint: false, idempotentHint: false };
const readAnnotations = { readOnlyHint: true, openWorldHint: true, destructiveHint: false, idempotentHint: true };
function errorResult(error) { return { isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : "Unbekannter Fehler" }] }; }
function dryResult(body, warnings = []) { return { structuredContent: { valid: true, model: body.model, payload: body, defaults_summary: previewSummary(body), warnings, generation_started: false, credits_spent: false }, content: [{ type: "text", text: `Dry-Run gültig: ${previewSummary(body)}. Kein Render gestartet, keine Generation-Credits verbraucht.${warnings.length ? ` Hinweise: ${warnings.join(" | ")}` : ""}` }] }; }
async function render(body, productId, prompt) {
  const creditsBefore = await getCredits();
  const submissionBody = body.model === "kling-3.0/video" ? await rehostKlingPayload(body) : body;
  const taskId = await createTask(submissionBody);
  await recordJob({ task_id: taskId, product_id: productId ?? null, model: body.model, prompt, state: "submitted", credits_before: creditsBefore, payload_summary: previewSummary(body) });
  return { taskId, creditsBefore };
}
function imageTool(server, name, title, description, builder, invoking, invoked) {
  server.registerTool(name, {
    title, description, inputSchema: { ...imageFields, confirm_render: z.literal(true) }, annotations: renderAnnotations,
    _meta: { "openai/fileParams": ["reference_image_1","reference_image_2","reference_image_3","reference_image_4","reference_image_5","reference_image_6","reference_image_7","reference_image_8"], "openai/toolInvocation/invoking": invoking, "openai/toolInvocation/invoked": invoked }
  }, async (args) => { try { const body = builder(args); const { taskId, creditsBefore } = await render(body, args.product_id, args.prompt); return { structuredContent: { task_id: taskId, model: body.model, state: "submitted", defaults_summary: previewSummary(body), credits_before: creditsBefore }, content: [{ type: "text", text: `${title} gestartet: ${taskId}. Credit-Stand vorher: ${JSON.stringify(creditsBefore)}.` }] }; } catch (e) { return errorResult(e); } });
}

export function createKieServer() {
  const server = new McpServer({ name: "lyra-kie-v2", version: "2.1.0" }, { capabilities: { tools: {} }, instructions: "Lyra V2 preserves all legacy Lyra KIE models and adds Kling 3.0 plus product/job storage. Default image: GPT Image 2. Default video: Grok Imagine Video 1.5. Flux and Seedream only when explicitly requested. Seedance only when requested. Kling 3.0 is an additional video option. Before any paid generation, use prepare_kie_render and require explicit user approval in the current conversation. Never retry createTask automatically. Status/credit/database reads do not start generations." });

  server.registerTool("check_kie_credits", { title: "KIE Credits prüfen", description: "Verifies KIE connection and remaining credits. Never starts a render.", inputSchema: {}, annotations: readAnnotations }, async () => { try { const credits = await getCredits(); return { structuredContent: { connected: true, credits_remaining: credits, render_started: false }, content: [{ type: "text", text: `KIE verbunden. Credits: ${JSON.stringify(credits)}. Kein Render gestartet.` }] }; } catch (e) { return errorResult(e); } });

  server.registerTool("check_kling3_available", { title: "Kling 3.0 prüfen", description: "Checks KIE auth and public Kling 3.0 availability without generation.", inputSchema: {}, annotations: readAnnotations }, async () => { try { const [credits, market] = await Promise.all([getCredits(), checkKlingMarketplace()]); return { structuredContent: { kie_authenticated: true, credits_remaining: credits, kling3_marketplace_available: market.available, model_id: "kling-3.0/video", render_started: false }, content: [{ type: "text", text: `KIE-Auth OK. Kling 3.0 Marketplace: ${market.available ? "verfügbar" : "nicht bestätigt"}. Kein Render gestartet.` }] }; } catch (e) { return errorResult(e); } });

  server.registerTool("prepare_kie_render", { title: "KIE Render Dry-Run", description: "Validates the exact KIE payload for any Lyra image/video model without creating a task or spending generation credits.", inputSchema: {
    kind: z.enum(["gpt_image_2", "flux_2_pro", "seedream_5_lite", "video"]), ...imageFields,
    model: videoFields.model, start_frame: videoFields.start_frame, last_frame: videoFields.last_frame,
    resolution: videoFields.resolution, duration: videoFields.duration, generate_audio: videoFields.generate_audio, seedance_reference_mode: videoFields.seedance_reference_mode,
    kling_mode: videoFields.kling_mode, kling_multi_shots: videoFields.kling_multi_shots, kling_multi_prompt: videoFields.kling_multi_prompt, element_name: videoFields.element_name, element_description: videoFields.element_description
  }, annotations: { ...readAnnotations, openWorldHint: false }, _meta: { "openai/fileParams": ["start_frame","last_frame","reference_image_1","reference_image_2","reference_image_3","reference_image_4","reference_image_5","reference_image_6","reference_image_7","reference_image_8"] } }, async (args) => { try {
    let body; if (args.kind === "gpt_image_2") body = buildGptImage2Task(args); else if (args.kind === "flux_2_pro") body = buildFluxTask(args); else if (args.kind === "seedream_5_lite") body = buildSeedreamTask(args); else body = buildVideoTask(args);
    const warnings = []; if (args.model === "kling_3_0" && args.kling_mode === "4K") warnings.push("Kling 4K ist teurer als PRO; nur bewusst verwenden.");
    return dryResult(body, warnings);
  } catch (e) { return errorResult(e); } });

  imageTool(server, "render_gpt_image_2", "GPT Image 2 Bild rendern", "Legacy-compatible GPT Image 2 renderer. Spends KIE credits and requires confirm_render=true.", buildGptImage2Task, "GPT Image 2 wird gestartet…", "GPT Image 2 wurde gestartet.");
  imageTool(server, "render_flux2_pro_image", "Flux 2 Pro Bild rendern", "Legacy-compatible Flux 2 Pro renderer. Use only when explicitly requested. Spends KIE credits.", buildFluxTask, "Flux 2 Pro wird gestartet…", "Flux 2 Pro wurde gestartet.");
  imageTool(server, "render_seedream5_lite_image", "Seedream 5 Lite Bild testen", "Legacy-compatible Seedream 5 Lite renderer. Use only when explicitly requested. Spends KIE credits.", buildSeedreamTask, "Seedream 5 Lite wird gestartet…", "Seedream 5 Lite wurde gestartet.");

  server.registerTool("render_kie_video", { title: "KIE-Video rendern", description: "Legacy-compatible video renderer. Default Grok Imagine Video 1.5; Seedance Fast/Mini and Kling 3.0 are additional options. Spends KIE credits and requires confirm_render=true.", inputSchema: { ...videoFields, confirm_render: z.literal(true) }, annotations: renderAnnotations, _meta: { "openai/fileParams": ["start_frame","last_frame","reference_image_1","reference_image_2","reference_image_3","reference_image_4"], "openai/toolInvocation/invoking": "KIE-Video wird gestartet…", "openai/toolInvocation/invoked": "KIE-Video wurde gestartet." } }, async (args) => { try { const body = buildVideoTask(args); const { taskId, creditsBefore } = await render(body, args.product_id, args.prompt); return { structuredContent: { task_id: taskId, model: body.model, state: "submitted", defaults_summary: previewSummary(body), credits_before: creditsBefore }, content: [{ type: "text", text: `KIE-Video gestartet: ${taskId}. Modell: ${body.model}. Credit-Stand vorher: ${JSON.stringify(creditsBefore)}.` }] }; } catch (e) { return errorResult(e); } });

  server.registerTool("check_kie_render", { title: "KIE-Renderstatus prüfen", description: "Returns queue/generation progress, errors and final URLs. Does not start a new render.", inputSchema: { task_id: z.string().min(3) }, annotations: readAnnotations }, async ({ task_id }) => { try { const task = await getTask(task_id); const known = await getJob(task_id); await recordJob({ ...(known ?? {}), task_id, ...task }); const text = task.state === "success" ? `Render fertig: ${task.result_urls.join(" ")}` : task.state === "fail" ? `Render fehlgeschlagen: ${task.error_message ?? task.error_code ?? "unbekannt"}` : `Renderstatus: ${task.state}${typeof task.progress === "number" ? ` (${task.progress}%)` : ""}.`; return { structuredContent: task, content: [{ type: "text", text }] }; } catch (e) { return errorResult(e); } });

  server.registerTool("save_product_cheat", { title: "Produkt-Cheat speichern", description: "Stores or updates verified product facts, visual locks and claim rules for reuse. This does not render anything.", inputSchema: {
    product_id: z.string().min(1), name: z.string().min(1), brand: z.string().optional(), variant: z.string().optional(),
    verified_facts: z.array(z.string()).optional(), visual_locks: z.array(z.string()).optional(), allowed_claims: z.array(z.string()).optional(), forbidden_claims: z.array(z.string()).optional(), reference_notes: z.string().optional(), source_urls: z.array(z.string().url()).optional()
  }, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false, idempotentHint: true } }, async (args) => { try { const p = await upsertProduct(args); const health = await databaseHealth(); return { structuredContent: { product: p, database: health }, content: [{ type: "text", text: `Produkt-Cheat ${p.product_id} gespeichert. DB persistent: ${health.persistent ? "ja" : "noch nicht"}.` }] }; } catch (e) { return errorResult(e); } });

  server.registerTool("get_product_cheat", { title: "Produkt-Cheat laden", description: "Loads one stored product cheat. No render.", inputSchema: { product_id: z.string().min(1) }, annotations: { ...readAnnotations, openWorldHint: false } }, async ({ product_id }) => { try { const p = await getProduct(product_id); return { structuredContent: { product: p }, content: [{ type: "text", text: p ? JSON.stringify(p) : `Kein Produkt-Cheat für ${product_id} gefunden.` }] }; } catch (e) { return errorResult(e); } });
  server.registerTool("list_product_cheats", { title: "Produkt-Cheats auflisten", description: "Lists stored product cheats. No render.", inputSchema: {}, annotations: { ...readAnnotations, openWorldHint: false } }, async () => { try { const items = await listProducts(); const health = await databaseHealth(); return { structuredContent: { products: items, database: health }, content: [{ type: "text", text: `${items.length} Produkt-Cheats gefunden. DB persistent: ${health.persistent ? "ja" : "noch nicht"}.` }] }; } catch (e) { return errorResult(e); } });
  server.registerTool("list_kie_jobs", { title: "KIE Job-Historie", description: "Lists recent render jobs recorded by Lyra V2. No render.", inputSchema: { limit: z.number().int().min(1).max(100).optional() }, annotations: { ...readAnnotations, openWorldHint: false } }, async ({ limit }) => { try { const jobs = await listJobs(limit ?? 20); return { structuredContent: { jobs }, content: [{ type: "text", text: `${jobs.length} Jobs gefunden.` }] }; } catch (e) { return errorResult(e); } });
  server.registerTool("check_lyra_v2", { title: "Lyra V2 Systemcheck", description: "Checks database mode and reports all available Lyra V2 models without rendering.", inputSchema: {}, annotations: { ...readAnnotations, openWorldHint: false } }, async () => { const db = await databaseHealth(); return { structuredContent: { ok: true, version: "2.1.0", database: db, image_models: ["GPT Image 2","Flux 2 Pro","Seedream 5 Lite"], video_models: ["Grok Imagine Video 1.5","Seedance 2 Fast","Seedance 2 Mini","Kling 3.0"], render_started: false }, content: [{ type: "text", text: `Lyra V2 2.1.0 bereit. Bilder: GPT Image 2, Flux 2 Pro, Seedream 5 Lite. Videos: Grok 1.5, Seedance Fast/Mini, Kling 3.0. DB persistent: ${db.persistent ? "ja" : "noch nicht"}. Kein Render gestartet.` }] }; });

  return server;
}
