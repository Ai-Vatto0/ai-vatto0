import { uploadRemoteFile } from "./kie-client.js";

function refs(args) {
  return [args.reference_image_1, args.reference_image_2, args.reference_image_3, args.reference_image_4]
    .filter(Boolean);
}

export function validateKlingArgs(args) {
  const warnings = [];
  const duration = args.duration ?? 5;
  if (!Number.isInteger(duration) || duration < 3 || duration > 15) {
    throw new Error("Kling 3.0 Dauer muss eine ganze Zahl von 3 bis 15 Sekunden sein.");
  }
  const r = refs(args);
  if (r.length === 1) {
    throw new Error("Ein Kling-Bildelement benötigt 2 bis 4 Referenzbilder, nicht genau 1.");
  }
  if (r.length > 0) {
    const name = args.element_name ?? "product";
    if (!args.prompt.includes(`@${name}`)) {
      throw new Error(`Prompt muss das Element als @${name} referenzieren.`);
    }
  }
  if (args.start_frame && args.last_frame && duration < 4) {
    warnings.push("Start- und Endframe bei sehr kurzer Dauer können starke Bewegungsrestriktionen erzeugen.");
  }
  if ((args.mode ?? "pro") === "4K") {
    warnings.push("4K verbraucht laut KIE mehr Credits; für Tests ist pro sinnvoller.");
  }
  return warnings;
}

export function previewKlingPayload(args) {
  validateKlingArgs(args);
  const image_urls = [args.start_frame?.download_url, args.last_frame?.download_url].filter(Boolean);
  const r = refs(args);
  const name = args.element_name ?? "product";
  return {
    model: "kling-3.0/video",
    input: {
      prompt: args.prompt,
      ...(image_urls.length ? { image_urls } : {}),
      sound: args.sound ?? true,
      duration: String(args.duration ?? 5),
      aspect_ratio: args.aspect_ratio ?? "9:16",
      mode: args.mode ?? "pro",
      multi_shots: false,
      multi_prompt: [],
      ...(r.length ? {
        kling_elements: [{
          name,
          description: args.element_description ?? "Product reference",
          element_input_urls: r.map((x) => x.download_url),
        }],
      } : {}),
    },
  };
}

export async function buildKlingPayloadWithKieUploads(args) {
  validateKlingArgs(args);
  const stamp = Date.now();
  const upload = async (f, suffix) => f
    ? uploadRemoteFile(f.download_url, `lyra-${stamp}-${suffix}-${f.file_name ?? "file"}`)
    : undefined;

  const [start, end] = await Promise.all([
    upload(args.start_frame, "start"),
    upload(args.last_frame, "end"),
  ]);
  const r = refs(args);
  const uploadedRefs = await Promise.all(r.map((f, i) => uploadRemoteFile(
    f.download_url,
    `lyra-${stamp}-ref${i + 1}-${f.file_name ?? "image"}`,
  )));
  const image_urls = [start, end].filter(Boolean);
  const name = args.element_name ?? "product";

  return {
    model: "kling-3.0/video",
    input: {
      prompt: args.prompt,
      ...(image_urls.length ? { image_urls } : {}),
      sound: args.sound ?? true,
      duration: String(args.duration ?? 5),
      aspect_ratio: args.aspect_ratio ?? "9:16",
      mode: args.mode ?? "pro",
      multi_shots: false,
      multi_prompt: [],
      ...(uploadedRefs.length ? {
        kling_elements: [{
          name,
          description: args.element_description ?? "Product reference",
          element_input_urls: uploadedRefs,
        }],
      } : {}),
    },
  };
}
