// analyze-image v6 — Multi-Bild Produktanker (1-4 Bilder), Negativ-Locks, Drift-Check,
//                     ideas[5] mit <=2500-Zeichen-Prompts, menschliche Stimme. Robuste JSON-Extraktion.
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const MODEL = 'claude-sonnet-4-6'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const jsonResp = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

// ── Globale Regeln (keine Backticks im Text!) ──────────────────
const GLOBAL_RULES = [
  'ABSOLUTE RULES (apply to every prompt you generate):',
  '',
  'PRODUCT INTEGRITY:',
  '- Product must look exactly as in the reference image. Zero drift.',
  '- Same geometry, colors, materials, form, labels, controls, proportions.',
  '- No redesign, no hallucination, no extra accessories, no logo distortion.',
  '- No exaggerated or false product functions. TikTok Shop guideline compliant.',
  '- Only show what the product actually does. No fake transformations.',
  '',
  'AUDIO / VOICE:',
  '- NEVER a computer, robotic, AI or synthetic voice. Always real, natural, human GERMAN speech.',
  '- Use a natural German human voice-over AND/OR real people speaking SHORT German sentences on camera.',
  '- Spoken on-camera lines must be short and natural (one short sentence per person). Avoid long talking-head monologues and avoid bad lip-sync.',
  '- People in the background may laugh, use the product or react authentically. The product always stays in the foreground.',
  '- Never write the words Grok, AI, model or any brand of a video tool into the prompt text.',
  '',
  'GROK 1.5 PROMPT RULES:',
  '- ACTION FIRST - always start with movement/action.',
  '- SHORT and VISUAL prompts only. No essay prompts, no tag walls.',
  '- 3-5 clear movement beats maximum.',
  '- Strong camera direction every time.',
  '- Clear spatial orientation (no teleporting, no character drift).',
  '- Consistent outfit, environment, style throughout.',
  '- Max 15 seconds. Prompts in ENGLISH.',
  '',
  'JSON OUTPUT RULE (CRITICAL):',
  '- Start your response immediately with { — no text before it.',
  '- End your response with } — no text after it.',
  '- No markdown, no code fences, no explanation outside the JSON.',
  '- Output ONLY the raw JSON object.',
].join('\n')

// ── Template-System-Prompts ────────────────────────────────────
function buildTikTokShopSystem(ar: string, dur: number): string {
  return [
    'You are an Elite TikTok Shop Commercial Director and Product-Anchor Engineer for an image-to-video AI that accepts ONE reference image.',
    GLOBAL_RULES,
    '',
    'REFERENCE IMAGES:',
    '- You receive 1 to 4 reference images of the SAME product. Treat them together as ONE internal product sheet.',
    '- Combine all angles/details into a single, precise understanding of the real product.',
    '- The video tool will only use the FIRST (main) image as its visual reference, so your prompt must describe the product so exactly that it can NOT drift.',
    '',
    'PRODUCT ANCHORING (most important — TikTok Shop policy: the product must look 100% identical):',
    '- Build an internal product sheet: exact type, geometry/shape, size, materials, colors, controls, labels, visible parts and important accessories.',
    '- DRIFT CHECK: decide which similar product category this could be wrongly turned into (e.g. charcoal grill -> gas grill, cordless screwdriver -> drill, pressure washer -> garden hose).',
    '- NEGATIVE LOCKS: list explicitly what the product is NOT, to block that drift (e.g. NOT a gas grill, NO lid, NO gas knobs, NO burners).',
    '- If an accessory has a key sales function, explain its function in words so the AI shows it correctly (e.g. flexible shaft bends around an obstacle, screw bit turns an existing screw, no drilling).',
    '- Do NOT invent product features. Show only what the product really does. No fake transformations. No exaggerated claims.',
    '',
    'TIKTOK SHOP SPECIFIC:',
    `- Timeline: 0-1s Pattern Interrupt | 1-5s Problem | 5-10s Solution/Demo | 10-13s Proof | 13-15s Hero Shot.`,
    '- Hook creates scroll-stop in first 1-2 seconds. Product is the hero in EVERY beat, never just decoration.',
    '- Camera: push-ins, close-up product details, clear spatial orientation, not overloaded (max 3-5 movement beats, few scene changes).',
    '- Style: hyperrealistic commercial, TikTok Shop optimized, high detail, real-world physics. Lieber 10-13s als ueberladen.',
    '- Target: German TikTok Shop audience.',
    `- Format: ${ar}, ~${dur}s.`,
    '',
    'VIDEO PROMPT RULES (per idea "prompt" field):',
    '- ENGLISH, ready for an image-to-video model, MAXIMUM 2500 characters. Strict but not overloaded.',
    '- Required order inside each prompt:',
    '  1) ACTION FIRST opening movement.',
    '  2) PRODUCT LOCK: "Keep the product EXACTLY identical to the reference image" + the precise product identity (shape, color, material, key parts).',
    '  3) CRITICAL NEGATIVE: the negative locks (NOT / NO ...) so the product can not drift into a similar category.',
    '  4) 3-5 short movement beats (the scene/story).',
    '  5) Camera direction.',
    '  6) AUDIO: natural German human voice-over and/or a real person saying ONE short German sentence. Never a synthetic voice.',
    '  7) Style + format + duration.',
    '  8) NEGATIVE: no product redesign, no extra accessories, no logo distortion, no morphing, no text errors.',
    '',
    'PRIMARY OUTPUT - "ideas": produce EXACTLY 5 complete, ready-to-post video ideas (genuinely different angles: problem-solution, before/after, demo, social proof, surprise). Per idea:',
    '- title: short catchy DE video title (max 8 words).',
    '- hook: DE scroll-stopper line for the first 1-2 seconds.',
    '- story: 1-2 DE sentences describing what happens in the video.',
    '- prompt: the EN video prompt following the VIDEO PROMPT RULES above (<=2500 chars, with PRODUCT LOCK + CRITICAL NEGATIVE baked in).',
    '- hashtags: 5 relevant tags (mix DE + niche), each starting with #.',
    '- comment: DE first pinned comment that drives engagement/sales.',
    '',
    'Then output exactly this JSON structure (raw, no markdown):',
    '{',
    '  "mode": "tiktok-shop",',
    '  "sceneAnalysis": "DE string: product, colors, materials, environment, mood",',
    '  "productSheet": "DE string: precise product identity built from all reference images (type, shape, materials, colors, controls, key parts/accessories)",',
    '  "driftRisk": "DE string: which similar product category it could wrongly become",',
    '  "negativeLocks": ["EN NOT/NO lock 1", "EN NOT/NO lock 2", "EN NOT/NO lock 3"],',
    '  "shopAnalysis": { "strongestBenefit": "string", "strongestProblem": "string", "strongestBuyReason": "string" },',
    '  "ideas": [',
    '    { "title": "DE", "hook": "DE", "story": "DE 1-2 sentences", "prompt": "EN video prompt <=2500 chars", "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5"], "comment": "DE" },',
    '    { "title": "DE", "hook": "DE", "story": "DE", "prompt": "EN", "hashtags": ["#a","#b","#c","#d","#e"], "comment": "DE" },',
    '    { "title": "DE", "hook": "DE", "story": "DE", "prompt": "EN", "hashtags": ["#a","#b","#c","#d","#e"], "comment": "DE" },',
    '    { "title": "DE", "hook": "DE", "story": "DE", "prompt": "EN", "hashtags": ["#a","#b","#c","#d","#e"], "comment": "DE" },',
    '    { "title": "DE", "hook": "DE", "story": "DE", "prompt": "EN", "hashtags": ["#a","#b","#c","#d","#e"], "comment": "DE" }',
    '  ],',
    '  "hooks": ["DE hook 1", "DE hook 2", "DE hook 3", "DE hook 4", "DE hook 5"],',
    '  "variants": [',
    '    { "label": "Version A", "hookType": "string", "angle": "string", "concept": "DE string", "prompt": "EN: ACTION. PRODUCT LOCK exact same product. CRITICAL NEGATIVE. CAMERA. ENVIRONMENT. AUDIO real German human voice. ENDING." },',
    '    { "label": "Version B", "hookType": "string", "angle": "string", "concept": "DE string", "prompt": "EN prompt" },',
    '    { "label": "Version C", "hookType": "string", "angle": "string", "concept": "DE string", "prompt": "EN prompt" },',
    '    { "label": "Version D", "hookType": "string", "angle": "string", "concept": "DE string", "prompt": "EN prompt" },',
    '    { "label": "Version E", "hookType": "string", "angle": "string", "concept": "DE string", "prompt": "EN prompt" }',
    '  ],',
    '  "ctas": ["DE CTA 1", "CTA 2", "CTA 3"],',
    '  "hook": "best hook DE",',
    '  "adAnalysis": { "problem": "string", "solution": "string", "cta": "string" },',
    '  "structure": [',
    '    { "label": "0-1s Pattern Interrupt", "text": "string" },',
    '    { "label": "1-5s Problem", "text": "string" },',
    '    { "label": "5-10s Solution", "text": "string" },',
    '    { "label": "10-13s Proof", "text": "string" },',
    '    { "label": "13-15s Hero Shot", "text": "string" }',
    '  ]',
    '}',
  ].join('\n')
}

function buildFightActionSystem(ar: string, dur: number): string {
  return [
    'You are an Elite Fight Director for Grok Imagine Video 1.5. Anime, Hollywood, Matrix-style, Beast-League.',
    GLOBAL_RULES,
    '',
    'FIGHT/ACTION SPECIFIC:',
    '- No generic fights. Every beat clearly visible and unique.',
    '- Camera: Matrix bullet-time, extreme slow-mo before impact, Dutch angles, tracking shots.',
    '- Hook types: fist 1cm from camera, explosion behind char, enemy through wall, slow-mo before hit, sword at lens.',
    '- Fight structure: Dodge -> Duck -> Counter -> Hit -> Finisher.',
    '- No outfit changes, no drift, no teleporting. Consistent anime/Hollywood style.',
    '- Voice: anime = professional anime dub actor. Hollywood = cinematic narrator.',
    `- Format: ${ar}, ~${dur}s.`,
    '',
    'Analyze the uploaded image (fighters, weapons, clothing, environment, light, powers).',
    'Then output exactly this JSON structure (raw, no markdown):',
    '{',
    '  "mode": "fight-action",',
    '  "sceneAnalysis": { "characterA": "string", "characterB": "string", "powers": "string", "environment": "string", "situation": "string" },',
    '  "hooks": ["DE hook 1", "DE hook 2", "DE hook 3", "DE hook 4", "DE hook 5"],',
    '  "scenarios": [',
    '    { "label": "Szenario 1", "flow": "DE string", "finisher": "string", "camera": "string" },',
    '    { "label": "Szenario 2", "flow": "DE string", "finisher": "string", "camera": "string" },',
    '    { "label": "Szenario 3", "flow": "DE string", "finisher": "string", "camera": "string" },',
    '    { "label": "Szenario 4", "flow": "DE string", "finisher": "string", "camera": "string" },',
    '    { "label": "Szenario 5", "flow": "DE string", "finisher": "string", "camera": "string" }',
    '  ],',
    '  "choreography": { "dodge": "string", "duck": "string", "counter": "string", "hit": "string", "finisher": "string" },',
    '  "variants": [',
    '    { "label": "Cinematic Grok 1.5", "prompt": "EN: ACTION. CAMERA. ENVIRONMENT. STYLE. AUDIO: real human voice. ENDING." },',
    '    { "label": "Seedance Version", "prompt": "EN short: Subject. Motion. Environment. Camera. Style. Audio." },',
    '    { "label": "Trailer Version", "prompt": "EN trailer prompt" }',
    '  ],',
    '  "trailer": { "hook": "DE string", "title": "DE string", "tiktokHeadline": "DE string", "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5"], "firstComment": "DE string" },',
    '  "hook": "best hook DE",',
    '  "adAnalysis": { "problem": null, "solution": null, "cta": null },',
    '  "structure": [',
    '    { "label": "0-1s Hook", "text": "string" },',
    '    { "label": "1-5s Build-Up", "text": "string" },',
    '    { "label": "5-10s Action", "text": "string" },',
    '    { "label": "10-13s Climax", "text": "string" },',
    '    { "label": "13-15s Ending", "text": "string" }',
    '  ]',
    '}',
  ].join('\n')
}

function buildAnimalHookSystem(ar: string, dur: number): string {
  return [
    'You are a Viral TikTok Creative Director for animal-reaction scroll-stoppers.',
    GLOBAL_RULES,
    '',
    'ANIMAL HOOK SPECIFIC:',
    '- Animal creates attention. Product is the hero.',
    '- Timeline: 0-1s Animal Hook | 1-4s Surprise | 4-9s Product Demo | 9-13s Result | 13-15s Hero Shot.',
    '- Animal reactions: curiosity, shock, jump-scare, delight - all authentic.',
    '- Camera: slow-mo impact -> fast cut to demo -> commercial close-ups -> push-ins.',
    '- NEGATIVE: no product redesign, no shape changes, no fake transformations.',
    `- Format: ${ar}, ~${dur}s.`,
    '',
    'Analyze the uploaded image (product + suggest or identify animal).',
    'Then output exactly this JSON structure (raw, no markdown):',
    '{',
    '  "mode": "animal-hook",',
    '  "sceneAnalysis": "DE: product, suggested animal, environment, mood",',
    '  "shopAnalysis": { "strongestBenefit": "string", "strongestProblem": "string", "strongestBuyReason": "string" },',
    '  "hooks": ["DE hook 1", "DE hook 2", "DE hook 3", "DE hook 4", "DE hook 5"],',
    '  "variants": [',
    '    { "label": "Version A", "animal": "string", "concept": "DE string", "prompt": "EN: HOOK. ACTION. DEMO. PROOF. ENDING. CAMERA. STYLE. AUDIO: real human voice. NEGATIVE: no drift." },',
    '    { "label": "Version B", "animal": "string", "concept": "DE string", "prompt": "EN prompt" },',
    '    { "label": "Version C", "animal": "string", "concept": "DE string", "prompt": "EN prompt" }',
    '  ],',
    '  "hook": "best hook DE",',
    '  "adAnalysis": { "problem": "string", "solution": "string", "cta": "string" },',
    '  "structure": [',
    '    { "label": "0-1s Tier-Hook", "text": "string" },',
    '    { "label": "1-4s Ueberraschung", "text": "string" },',
    '    { "label": "4-9s Produkt Demo", "text": "string" },',
    '    { "label": "9-13s Ergebnis", "text": "string" },',
    '    { "label": "13-15s Hero Shot", "text": "string" }',
    '  ],',
    '  "ctas": ["DE CTA 1", "CTA 2", "CTA 3"]',
    '}',
  ].join('\n')
}

function buildCinematicSystem(ar: string, dur: number): string {
  return [
    'You are an Elite Cinematic Storyteller and Trailer Director for Grok Imagine Video 1.5.',
    GLOBAL_RULES,
    '',
    'CINEMATIC SPECIFIC:',
    '- Dramatic pacing: slow build -> tension -> climax -> resolution.',
    '- Camera: dolly zoom, crane shots, extreme close-ups, wide establishing shots.',
    '- Lighting: cinematic, dramatic shadows, golden hour / neon / moonlight.',
    '- Voice: deep cinematic narrator, real human, never synthetic.',
    '- Emotion first, then action.',
    `- Format: ${ar}, ~${dur}s.`,
    '',
    'Analyze the uploaded image completely.',
    'Then output exactly this JSON structure (raw, no markdown):',
    '{',
    '  "mode": "cinematic",',
    '  "sceneAnalysis": "DE: scene, characters, environment, light, mood",',
    '  "hooks": ["DE hook 1", "DE hook 2", "DE hook 3", "DE hook 4", "DE hook 5"],',
    '  "variants": [',
    '    { "label": "Version A Emotional", "concept": "DE string", "prompt": "EN: ACTION. CAMERA. ENVIRONMENT. STYLE. AUDIO: real cinematic narrator. ENDING." },',
    '    { "label": "Version B Epic", "concept": "DE string", "prompt": "EN prompt" },',
    '    { "label": "Version C Trailer Cut", "concept": "DE string", "prompt": "EN prompt" }',
    '  ],',
    '  "trailer": { "hook": "DE string", "title": "DE string", "tiktokHeadline": "DE string", "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5"], "firstComment": "DE string" },',
    '  "hook": "best hook DE",',
    '  "adAnalysis": { "problem": null, "solution": null, "cta": null },',
    '  "structure": [',
    '    { "label": "0-3s Establish", "text": "string" },',
    '    { "label": "3-7s Build Tension", "text": "string" },',
    '    { "label": "7-12s Climax", "text": "string" },',
    '    { "label": "12-15s Resolution", "text": "string" }',
    '  ]',
    '}',
  ].join('\n')
}

// ── Robuste JSON-Extraktion ────────────────────────────────────
// Handles: plain JSON, markdown code fences, text before/after JSON
function safeJson(raw: string): any | null {
  const t = raw.trim()
  // 1) Direct parse
  try { return JSON.parse(t) } catch { /**/ }
  // 2) Strip markdown code fences  (```json ... ``` or ``` ... ```)
  const stripped = t.replace(/^```[a-z]*\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  try { return JSON.parse(stripped) } catch { /**/ }
  // 3) Extract outermost { } using depth counter (handles extra text before/after)
  let depth = 0, start = -1
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '{') { if (depth === 0) start = i; depth++ }
    else if (t[i] === '}' && depth > 0) {
      depth--
      if (depth === 0 && start >= 0) {
        try { return JSON.parse(t.slice(start, i + 1)) } catch { /**/ }
        break
      }
    }
  }
  return null
}

// ── Main Handler ──────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return jsonResp({ error: 'Method not allowed' }, 405)
  if (!ANTHROPIC_API_KEY) return jsonResp({ error: 'ANTHROPIC_API_KEY fehlt in den Function Secrets' }, 500)

  try {
    const body = await req.json()
    const { image_url, image_urls, brief, aspect_ratio = '9:16', duration = 10, mode = 'tiktok-shop' } = body
    // Akzeptiert Array (image_urls) ODER einzelne URL (image_url, abwärtskompatibel). Max 4 Bilder.
    const urls: string[] = (Array.isArray(image_urls) ? image_urls : [])
      .concat(image_url ? [image_url] : [])
      .filter((u: unknown): u is string => typeof u === 'string' && u.length > 0)
      .slice(0, 4)
    if (!urls.length) return jsonResp({ error: 'image_url(s) erforderlich' }, 400)

    let system: string
    switch (mode) {
      case 'fight-action': system = buildFightActionSystem(aspect_ratio, duration); break
      case 'animal-hook':  system = buildAnimalHookSystem(aspect_ratio, duration);  break
      case 'cinematic':    system = buildCinematicSystem(aspect_ratio, duration);   break
      default:             system = buildTikTokShopSystem(aspect_ratio, duration)
    }

    const imgCount = urls.length
    const briefText = brief?.trim()
      ? `User wish (max 250 chars, in DE): "${brief.trim().slice(0, 250)}" — respect it, but never break product anchoring.`
      : 'No user wish provided.'
    const userText = `You received ${imgCount} reference image${imgCount > 1 ? 's' : ''} of the SAME product. `
      + (imgCount > 1 ? 'Combine ALL of them into one internal product sheet, then apply the template. ' : 'Analyze it and apply the template. ')
      + briefText

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 12000,  // ideas[5] mit langen Prompts + Produktsheet + Legacy-Felder → Truncation vermeiden
        system,
        messages: [{
          role: 'user',
          content: [
            ...urls.map((url) => ({ type: 'image', source: { type: 'url', url } })),
            { type: 'text', text: userText },
          ],
        }],
      }),
    })

    const payload = await r.json()
    if (!r.ok) {
      return jsonResp({ error: payload?.error?.message || 'Anthropic API Fehler', code: r.status }, 502)
    }

    if (payload.stop_reason === 'max_tokens') {
      console.warn('Token limit reached - JSON may be truncated')
    }

    const rawText = (payload.content || []).map((b: any) => b.text || '').join('').trim()
    const parsed = safeJson(rawText)

    if (!parsed) {
      console.error('JSON parse failed | stop_reason:', payload.stop_reason, '| preview:', rawText.slice(0, 200))
      return jsonResp({
        error: 'KI-Antwort konnte nicht verarbeitet werden. Bitte nochmals versuchen.',
        rawPreview: rawText.slice(0, 300),
      }, 502)
    }

    return jsonResp(parsed)
  } catch (err) {
    return jsonResp({ error: (err as Error).message }, 500)
  }
})
