import { createServer } from 'node:http';
import healthHandler from '../LYRA-KIE-V2/api/health.js';
import mcpHandler from '../LYRA-KIE-V2/api/mcp.js';
import setupHandler from '../LYRA-KIE-V2/api/setup.js';

function augmentResponse(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body)); return res; };
  res.send = (body) => { if (typeof body === 'object' && body !== null && !Buffer.isBuffer(body)) return res.json(body); res.end(body == null ? '' : String(body)); return res; };
  return res;
}

async function parseBody(req) {
  if (!['POST','PUT','PATCH','DELETE'].includes(req.method || '')) return undefined;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  if (String(req.headers['content-type'] || '').includes('application/json')) {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw;
}

const server = createServer(async (req, res) => {
  augmentResponse(res);
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  req.query = Object.fromEntries(url.searchParams.entries());
  req.body = await parseBody(req);
  try {
    if (url.pathname === '/' || url.pathname === '/health' || url.pathname === '/api/health') return await healthHandler(req, res);
    if (url.pathname === '/mcp' || url.pathname === '/api/mcp') return await mcpHandler(req, res);
    if (url.pathname === '/setup' || url.pathname === '/api/setup') return await setupHandler(req, res);
    return res.status(404).json({ ok:false, error:'Not found', service:'lyra-kie-v2-full', version:'2.1.1' });
  } catch (error) {
    console.error('Lyra V2 request failed', error);
    if (!res.headersSent) return res.status(500).json({ ok:false, error:error instanceof Error ? error.message : String(error), render_started:false });
    res.end();
  }
});

server.listen(Number(process.env.PORT || 3000));
