function configured() { return Boolean(process.env.DATABASE_URL?.trim()); }

let driverPromise;
async function sql() {
  if (!configured()) return null;
  if (!driverPromise) {
    driverPromise = import('@neondatabase/serverless')
      .then(({ neon }) => neon(process.env.DATABASE_URL))
      .catch(() => null);
  }
  return await driverPromise;
}

export async function databaseHealth() {
  if (!configured()) return { mode: 'memory-fallback', persistent: false, ok: true, warning: 'DATABASE_URL noch nicht gesetzt; Rendering bleibt funktionsfähig.' };
  try {
    const db = await sql();
    if (!db) return { mode: 'memory-fallback', persistent: false, ok: true, warning: 'Neon-Treiber nicht verfügbar; Rendering bleibt funktionsfähig.' };
    const rows = await db`SELECT 1 AS ok`;
    return { mode: 'neon-postgres', persistent: true, ok: rows?.[0]?.ok === 1 };
  } catch (e) {
    return { mode: 'memory-fallback', persistent: false, ok: true, warning: `Neon derzeit nicht erreichbar: ${e instanceof Error ? e.message : String(e)}` };
  }
}

const mem = () => {
  if (!globalThis.__LYRA_V2_DB__) globalThis.__LYRA_V2_DB__ = { products: {}, jobs: {} };
  return globalThis.__LYRA_V2_DB__;
};
async function dbOrNull() { return await sql(); }

export async function upsertProduct(p) {
  const db = await dbOrNull();
  if (!db) {
    const m = mem(); const old = m.products[p.product_id] ?? {}; const now = new Date().toISOString();
    return (m.products[p.product_id] = { ...old, ...p, created_at: old.created_at ?? now, updated_at: now });
  }
  const rows = await db`
    INSERT INTO lyra_product_cheats
      (product_id,name,brand,variant,verified_facts,visual_locks,allowed_claims,forbidden_claims,reference_notes,source_urls,updated_at)
    VALUES
      (${p.product_id},${p.name},${p.brand ?? null},${p.variant ?? null},${JSON.stringify(p.verified_facts ?? [])}::jsonb,${JSON.stringify(p.visual_locks ?? [])}::jsonb,${JSON.stringify(p.allowed_claims ?? [])}::jsonb,${JSON.stringify(p.forbidden_claims ?? [])}::jsonb,${p.reference_notes ?? null},${JSON.stringify(p.source_urls ?? [])}::jsonb,now())
    ON CONFLICT (product_id) DO UPDATE SET
      name=EXCLUDED.name, brand=EXCLUDED.brand, variant=EXCLUDED.variant,
      verified_facts=EXCLUDED.verified_facts, visual_locks=EXCLUDED.visual_locks,
      allowed_claims=EXCLUDED.allowed_claims, forbidden_claims=EXCLUDED.forbidden_claims,
      reference_notes=EXCLUDED.reference_notes, source_urls=EXCLUDED.source_urls, updated_at=now()
    RETURNING *`;
  return rows[0];
}
export async function getProduct(id) {
  const db = await dbOrNull();
  if (!db) return mem().products[id] ?? null;
  const rows = await db`SELECT * FROM lyra_product_cheats WHERE product_id=${id} LIMIT 1`; return rows[0] ?? null;
}
export async function listProducts() {
  const db = await dbOrNull();
  if (!db) return Object.values(mem().products).sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at)));
  return await db`SELECT * FROM lyra_product_cheats ORDER BY updated_at DESC`;
}
export async function recordJob(j) {
  const db = await dbOrNull();
  if (!db) {
    const m=mem(); const old=m.jobs[j.task_id]??{}; const now=new Date().toISOString(); return (m.jobs[j.task_id]={...old,...j,created_at:old.created_at??now,updated_at:now});
  }
  const rows = await db`
    INSERT INTO lyra_render_jobs
      (task_id,product_id,model,prompt,state,credits_before,credits_consumed,progress,result_urls,error_code,error_message,payload_summary,updated_at)
    VALUES
      (${j.task_id},${j.product_id ?? null},${j.model ?? 'unknown'},${j.prompt ?? null},${j.state ?? 'unknown'},${JSON.stringify(j.credits_before ?? null)}::jsonb,${j.credits_consumed ?? null},${j.progress ?? null},${JSON.stringify(j.result_urls ?? [])}::jsonb,${j.error_code ?? null},${j.error_message ?? null},${j.payload_summary ?? null},now())
    ON CONFLICT (task_id) DO UPDATE SET
      product_id=COALESCE(EXCLUDED.product_id,lyra_render_jobs.product_id), model=COALESCE(NULLIF(EXCLUDED.model,'unknown'),lyra_render_jobs.model),
      prompt=COALESCE(EXCLUDED.prompt,lyra_render_jobs.prompt), state=EXCLUDED.state,
      credits_before=COALESCE(EXCLUDED.credits_before,lyra_render_jobs.credits_before), credits_consumed=COALESCE(EXCLUDED.credits_consumed,lyra_render_jobs.credits_consumed),
      progress=COALESCE(EXCLUDED.progress,lyra_render_jobs.progress), result_urls=CASE WHEN jsonb_array_length(EXCLUDED.result_urls)>0 THEN EXCLUDED.result_urls ELSE lyra_render_jobs.result_urls END,
      error_code=COALESCE(EXCLUDED.error_code,lyra_render_jobs.error_code), error_message=COALESCE(EXCLUDED.error_message,lyra_render_jobs.error_message),
      payload_summary=COALESCE(EXCLUDED.payload_summary,lyra_render_jobs.payload_summary), updated_at=now()
    RETURNING *`;
  return rows[0];
}
export async function getJob(id) {
  const db=await dbOrNull();
  if (!db) return mem().jobs[id] ?? null;
  const rows=await db`SELECT * FROM lyra_render_jobs WHERE task_id=${id} LIMIT 1`; return rows[0]??null;
}
export async function listJobs(limit=20) {
  const db=await dbOrNull();
  if (!db) return Object.values(mem().jobs).sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at))).slice(0,limit);
  return await db`SELECT * FROM lyra_render_jobs ORDER BY updated_at DESC LIMIT ${limit}`;
}
