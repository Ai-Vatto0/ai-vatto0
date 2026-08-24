const VIDEO_MODEL_IDS = {
  grok_imagine_video_1_5: "grok-imagine-video-1-5-preview",
  seedance_2_fast: "bytedance/seedance-2-fast",
  seedance_2_mini: "bytedance/seedance-2-mini",
  kling_3_0: "kling-3.0/video"
};

function compact(input) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}

function fileUrl(file) { return file?.download_url; }
function refs(args, max = 8) {
  const out = [];
  for (let i = 1; i <= max; i++) {
    const f = args[`reference_image_${i}`];
    if (f) out.push(f);
  }
  return out;
}

export function buildGptImage2Task(args) {
  const urls = refs(args, 8).map((f) => f.download_url);
  return {
    model: urls.length ? "gpt-image-2-image-to-image" : "gpt-image-2-text-to-image",
    input: compact({ input_urls: urls.length ? urls : undefined, prompt: args.prompt, aspect_ratio: args.aspect_ratio ?? "9:16" })
  };
}

export function buildFluxTask(args) {
  const urls = refs(args, 8).map((f) => f.download_url);
  return {
    model: urls.length ? "flux-2/pro-image-to-image" : "flux-2/pro-text-to-image",
    input: compact({ input_urls: urls.length ? urls : undefined, prompt: args.prompt, aspect_ratio: args.aspect_ratio ?? "9:16", resolution: "2K", nsfw_checker: true })
  };
}

export function buildSeedreamTask(args) {
  const urls = refs(args, 8).map((f) => f.download_url);
  return {
    model: urls.length ? "seedream/5-lite-image-to-image" : "seedream/5-lite-text-to-image",
    input: compact({ image_urls: urls.length ? urls : undefined, prompt: args.prompt, aspect_ratio: args.aspect_ratio ?? "9:16", quality: "basic", output_format: "png", nsfw_checker: true })
  };
}

function validateDuration(duration) {
  if (!Number.isInteger(duration) || duration < 4 || duration > 15) throw new Error("Die Videolänge muss eine ganze Zahl zwischen 4 und 15 Sekunden sein.");
}

export function buildVideoTask(args) {
  const model = args.model ?? "grok_imagine_video_1_5";
  const aspectRatio = args.aspect_ratio ?? "9:16";
  const resolution = args.resolution ?? "720p";
  const duration = args.duration ?? 13;
  validateDuration(duration);
  const references = refs(args, 4).map((f) => f.download_url);

  if (model === "grok_imagine_video_1_5") {
    const imageUrls = [fileUrl(args.start_frame), ...references].filter(Boolean);
    return {
      model: VIDEO_MODEL_IDS[model],
      input: compact({ prompt: args.prompt, image_urls: imageUrls.length ? imageUrls : undefined, aspect_ratio: aspectRatio, resolution, duration })
    };
  }

  if (model === "seedance_2_fast" || model === "seedance_2_mini") {
    const referenceMode = args.seedance_reference_mode ?? "first_frame";
    const startFrame = fileUrl(args.start_frame);
    const lastFrame = fileUrl(args.last_frame);
    if (referenceMode === "first_frame") {
      if (!startFrame) throw new Error("Seedance im First-Frame-Modus benötigt ein Startbild.");
      if (references.length > 0) throw new Error("Seedance erlaubt First-Frame und Multimodal-Referenzen nicht gleichzeitig.");
    } else if (lastFrame) {
      throw new Error("Ein festes Endbild ist im Seedance-Multimodal-Modus nicht zulässig.");
    }
    const multimodalReferences = [startFrame, ...references].filter(Boolean);
    return {
      model: VIDEO_MODEL_IDS[model],
      input: compact({
        prompt: args.prompt,
        first_frame_url: referenceMode === "first_frame" ? startFrame : undefined,
        last_frame_url: referenceMode === "first_frame" ? lastFrame : undefined,
        reference_image_urls: referenceMode === "multimodal" && multimodalReferences.length ? multimodalReferences : undefined,
        return_last_frame: false,
        generate_audio: args.generate_audio ?? true,
        resolution,
        aspect_ratio: aspectRatio,
        duration,
        web_search: false
      })
    };
  }

  if (model === "kling_3_0") {
    const refFiles = refs(args, 4);
    if (refFiles.length === 1) throw new Error("Kling 3.0 Element-Referenzen benötigen 2 bis 4 Bilder; genau 1 Referenzbild ist nicht zulässig.");
    const name = args.element_name ?? "product";
    if (refFiles.length > 0 && !args.prompt.includes(`@${name}`)) throw new Error(`Der Kling-Prompt muss das Element als @${name} referenzieren.`);
    const imageUrls = [fileUrl(args.start_frame), fileUrl(args.last_frame)].filter(Boolean);
    return {
      model: VIDEO_MODEL_IDS[model],
      input: compact({
        prompt: args.prompt,
        image_urls: imageUrls.length ? imageUrls : undefined,
        sound: args.generate_audio ?? true,
        duration: String(duration),
        aspect_ratio: aspectRatio,
        mode: args.kling_mode ?? "pro",
        multi_shots: args.kling_multi_shots ?? false,
        multi_prompt: args.kling_multi_prompt ?? [],
        kling_elements: refFiles.length ? [{
          name,
          description: args.element_description ?? "Product reference",
          element_input_urls: refFiles.map((f) => f.download_url)
        }] : undefined
      })
    };
  }

  throw new Error(`Unbekanntes Videomodell: ${model}`);
}

export function previewSummary(body) {
  const i = body.input ?? {};
  return `${body.model}, ${i.aspect_ratio ?? "n/a"}${i.resolution ? `, ${i.resolution}` : ""}${i.duration ? `, ${i.duration}s` : ""}`;
}
