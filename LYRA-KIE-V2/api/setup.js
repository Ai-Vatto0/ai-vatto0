import { saveKieApiKey, kieKeyStatus } from "../src/secrets.js";

function authorized(token) {
  const expected = process.env.LYRA_SETUP_TOKEN?.trim();
  return Boolean(expected && token && token === expected);
}
function page(token, configured) {
  const safeToken = JSON.stringify(token);
  return `<!doctype html><html lang="de"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lyra V2 Setup</title><style>body{font-family:system-ui;background:#0b0d10;color:#f4f6f8;display:grid;place-items:center;min-height:100vh;margin:0}.c{width:min(520px,90vw);background:#15191f;padding:24px;border-radius:18px}input,button{box-sizing:border-box;width:100%;padding:14px;margin-top:12px;border-radius:10px;border:1px solid #303641;font-size:16px}input{background:#0e1116;color:#fff}button{background:#fff;color:#111;font-weight:700}#s{margin-top:14px;white-space:pre-wrap}.ok{color:#7ee787}.err{color:#ff7b72}</style><div class="c"><h1>Lyra KIE V2</h1><p>${configured ? "Ein KIE-Key ist bereits verschlüsselt gespeichert. Du kannst ihn hier ersetzen." : "KIE-Key einmalig sicher hinterlegen."}</p><input id="k" type="password" autocomplete="off" placeholder="KIE API Key"><button id="b">Key sicher speichern</button><div id="s"></div></div><script>const token=${safeToken};document.getElementById('b').onclick=async()=>{const s=document.getElementById('s'),key=document.getElementById('k').value;s.className='';s.textContent='Speichere…';try{const r=await fetch('/api/setup',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,key})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Fehler');document.getElementById('k').value='';s.className='ok';s.textContent='Gespeichert. Der Key wurde nicht zurückgegeben.';}catch(e){s.className='err';s.textContent=e.message;}};</script></html>`;
}
export default async function handler(req, res) {
  if (req.method === "GET") {
    const token = String(req.query?.token ?? "");
    if (!authorized(token)) return res.status(403).send("Forbidden");
    const status = await kieKeyStatus();
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(page(token, status.configured));
  }
  if (req.method === "POST") {
    const token = String(req.body?.token ?? "");
    if (!authorized(token)) return res.status(403).json({ ok: false, error: "Forbidden" });
    try {
      await saveKieApiKey(String(req.body?.key ?? ""));
      return res.status(200).json({ ok: true, stored: true });
    } catch (e) {
      return res.status(400).json({ ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
