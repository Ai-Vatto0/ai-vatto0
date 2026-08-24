import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { checkKlingMarketplace, createTask, getCredits, getTask } from "./kie-client.js";
import { buildKlingPayloadWithKieUploads, previewKlingPayload, validateKlingArgs } from "./kling.js";

const fileSchema = z.object({
  download_url: z.string().url(),
  file_id: z.string().min(1),
  mime_type: z.string().optional(),
  file_name: z.string().optional(),
});

const klingFields = {
  prompt: z.string().min(3).max(2500),
  start_frame: fileSchema.optional(),
  last_frame: fileSchema.optional(),
  reference_image_1: fileSchema.optional(),
  reference_image_2: fileSchema.optional(),
  reference_image_3: fileSchema.optional(),
  reference_image_4: fileSchema.optional(),
  element_name: z.string().regex(/^[a-zA-Z0-9_-]+$/).optional(),
  element_description: z.string().max(300).optional(),
  duration: z.number().int().min(3).max(15).optional(),
  aspect_ratio: z.enum(["9:16", "16:9", "1:1"]).optional(),
  mode: z.enum(["std", "pro", "4K"]).optional(),
  sound: z.boolean().optional(),
};

function errorResult(error) {
  const message = error instanceof Error ? error.message : "Unbekannter Fehler";
  return { isError: true, content: [{ type: "text", text: message }] };
}

export function createKieServer() {
  const server = new McpServer(
    { name: "lyra-kie-v2", version: "2.0.0" },
    {
      capabilities: { tools: {} },
      instructions:
        "Private KIE bridge. Diagnostic tools never start generation. Always run check_kie_credits and prepare_kling3_video before a Kling render. Never call render_kling3_video without explicit user approval in the current conversation. KIE reference uploads are free; video generation spends credits.",
    },
  );

  server.registerTool("check_kie_credits", {
    title: "KIE Credits prüfen",
    description: "Use this to verify KIE authentication and return the remaining credit balance. This does not start a render and does not spend generation credits.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true, idempotentHint: true },
  }, async () => {
    try {
      const credits = await getCredits();
      return {
        structuredContent: { connected: true, credits_remaining: credits },
        content: [{ type: "text", text: `KIE verbunden. Verbleibende Credits: ${credits}. Kein Render gestartet.` }],
      };
    } catch (e) { return errorResult(e); }
  });

  server.registerTool("check_kling3_available", {
    title: "Kling 3.0 Verfügbarkeit prüfen",
    description: "Use this to verify KIE account authentication plus public Kling 3.0 marketplace availability without creating a generation task. This spends no generation credits.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true, idempotentHint: true },
  }, async () => {
    try {
      const [credits, market] = await Promise.all([getCredits(), checkKlingMarketplace()]);
      return {
        structuredContent: {
          kie_authenticated: true,
          credits_remaining: credits,
          kling3_marketplace_available: market.available,
          model_id: "kling-3.0/video",
          marketplace_http_status: market.http_status,
          render_test_performed: false,
        },
        content: [{ type: "text", text: market.available
          ? `KIE-Auth OK; Kling 3.0 ist im KIE-Marketplace verfügbar. Credits: ${credits}. Kein Render-Test durchgeführt.`
          : `KIE-Auth OK, aber die öffentliche Kling-3.0-Seite konnte nicht bestätigt werden. Credits: ${credits}. Kein Render gestartet.` }],
      };
    } catch (e) { return errorResult(e); }
  });

  server.registerTool("prepare_kling3_video", {
    title: "Kling 3.0 Dry-Run prüfen",
    description: "Use this before rendering Kling 3.0. Validates duration, mode, element references and returns the exact payload preview. It does not upload files, create a task, or spend credits.",
    inputSchema: klingFields,
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false, idempotentHint: true },
    _meta: { "openai/fileParams": ["start_frame", "last_frame", "reference_image_1", "reference_image_2", "reference_image_3", "reference_image_4"] },
  }, async (args) => {
    try {
      const warnings = validateKlingArgs(args);
      const payload = previewKlingPayload(args);
      return {
        structuredContent: { valid: true, warnings, payload, generation_started: false, credits_spent: false },
        content: [{ type: "text", text: `Kling-3.0-Dry-Run gültig. ${warnings.length ? `Hinweise: ${warnings.join(" | ")}` : "Keine technischen Warnungen."} Kein Render gestartet.` }],
      };
    } catch (e) { return errorResult(e); }
  });

  server.registerTool("render_kling3_video", {
    title: "Kling 3.0 Video rendern",
    description: "Use this only after the user explicitly approves the Kling 3.0 render. It first checks credits, uploads supplied reference files to KIE temporary storage for free, then creates one Kling 3.0 generation task. This spends generation credits.",
    inputSchema: { ...klingFields, confirm_render: z.literal(true) },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true, idempotentHint: false },
    _meta: {
      "openai/fileParams": ["start_frame", "last_frame", "reference_image_1", "reference_image_2", "reference_image_3", "reference_image_4"],
      "openai/toolInvocation/invoking": "Kling 3.0 wird vorbereitet…",
      "openai/toolInvocation/invoked": "Kling 3.0 wurde gestartet."
    },
  }, async (args) => {
    try {
      const creditsBefore = await getCredits();
      const payload = await buildKlingPayloadWithKieUploads(args);
      const taskId = await createTask(payload);
      return {
        structuredContent: {
          task_id: taskId,
          model: "kling-3.0/video",
          state: "submitted",
          credits_before: creditsBefore,
          reference_uploads: "completed_before_generation",
        },
        content: [{ type: "text", text: `Kling 3.0 gestartet: ${taskId}. Credit-Stand vor Start: ${creditsBefore}.` }],
      };
    } catch (e) { return errorResult(e); }
  });

  server.registerTool("check_kie_render", {
    title: "KIE Renderstatus prüfen",
    description: "Use this after a KIE task was created. Returns progress, consumed credits, failure details and final URLs. This status check does not start a new render.",
    inputSchema: { task_id: z.string().min(3) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true, idempotentHint: true },
  }, async ({ task_id }) => {
    try {
      const task = await getTask(task_id);
      const text = task.state === "success"
        ? `Render fertig: ${task.result_urls.join(" ")}`
        : task.state === "fail"
          ? `Render fehlgeschlagen: ${task.error_message ?? task.error_code ?? "unbekannt"}`
          : `Renderstatus: ${task.state}${typeof task.progress === "number" ? ` (${task.progress}%)` : ""}.`;
      return { structuredContent: task, content: [{ type: "text", text }] };
    } catch (e) { return errorResult(e); }
  });

  return server;
}
