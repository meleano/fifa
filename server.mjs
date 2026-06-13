// ============================================================
// FIFA 2026 — Servidor Proxy Local para desarrollo
// ============================================================
// Ejecutar: node server.mjs
// Abrir:    http://localhost:3001
//
// Sirve archivos estáticos (index.html) y el endpoint /api/proxy
// ============================================================

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const MIME = {
  '.html':'text/html; charset=utf-8',
  '.js':'application/javascript',
  '.mjs':'application/javascript',
  '.css':'text/css',
  '.json':'application/json',
  '.svg':'image/svg+xml',
  '.png':'image/png',
  '.ico':'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Proxy API
  if (url.pathname === '/api/proxy') {
    const { default: handler } = await import('./api/proxy.mjs');
    const response = await handler(
      new Request(`http://${req.headers.host}${req.url}`, {
        method: req.method,
        headers: new Headers(req.headers),
      })
    );
    res.writeHead(response.status, Object.fromEntries(response.headers));
    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
    return;
  }

  // Archivos estáticos
  let filePath = path.join(__dirname, url.pathname === '/' ? 'index.html' : url.pathname);
  filePath = path.normalize(filePath);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403); res.end('Forbidden');
    return;
  }

  try {
    const content = await fs.promises.readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 — No encontrado</h1>');
  }
});

server.listen(PORT, () => {
  console.log(`\n  🏆 FIFA 2026 Media Center — Servidor local`);
  console.log(`  ─────────────────────────────────────────`);
  console.log(`  🌐 Web:    http://localhost:${PORT}`);
  console.log(`  🔧 Proxy:  http://localhost:${PORT}/api/proxy?stream=rtve1`);
  console.log(`  📺 Abre http://localhost:${PORT} en tu navegador\n`);
});
