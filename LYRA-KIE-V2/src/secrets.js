import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";

function db() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL fehlt; sichere KIE-Key-Speicherung ist nicht verfügbar.");
  return neon(url);
}
function masterKey() {
  const raw = process.env.LYRA_MASTER_KEY?.trim();
  if (!raw) throw new Error("LYRA_MASTER_KEY fehlt auf dem Server.");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("LYRA_MASTER_KEY muss 32 Bytes Base64 sein.");
  return key;
}

export function encryptSecret(plaintext, key = masterKey()) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext: ciphertext.toString("base64"), iv: iv.toString("base64"), auth_tag: tag.toString("base64") };
}
export function decryptSecret(row, key = masterKey()) {
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(row.iv, "base64"));
  decipher.setAuthTag(Buffer.from(row.auth_tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(row.ciphertext, "base64")), decipher.final()]).toString("utf8");
}
export async function saveKieApiKey(value) {
  const key = value?.trim();
  if (!key || key.length < 12) throw new Error("Der KIE API Key ist leer oder unplausibel kurz.");
  const enc = encryptSecret(key);
  const sql = db();
  await sql`INSERT INTO lyra_secrets(secret_name,ciphertext,iv,auth_tag,updated_at)
    VALUES ('kie_api_key',${enc.ciphertext},${enc.iv},${enc.auth_tag},now())
    ON CONFLICT(secret_name) DO UPDATE SET ciphertext=EXCLUDED.ciphertext,iv=EXCLUDED.iv,auth_tag=EXCLUDED.auth_tag,updated_at=now()`;
  return true;
}
export async function loadKieApiKey() {
  const sql = db();
  const rows = await sql`SELECT ciphertext,iv,auth_tag FROM lyra_secrets WHERE secret_name='kie_api_key' LIMIT 1`;
  if (!rows[0]) return null;
  return decryptSecret(rows[0]);
}
export async function kieKeyStatus() {
  try {
    const sql = db();
    const rows = await sql`SELECT updated_at FROM lyra_secrets WHERE secret_name='kie_api_key' LIMIT 1`;
    return { configured: Boolean(rows[0]), updated_at: rows[0]?.updated_at ?? null };
  } catch (e) {
    return { configured: false, error: e instanceof Error ? e.message : String(e) };
  }
}
