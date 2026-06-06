const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8899;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

// Local helper for admin-side VRChat world imports. GitHub Pages does not run this server.
const cache = new Map();
const TTL_MS = 60 * 1000;

function fetchVRChat(worldId, callback) {
  const cached = cache.get(worldId);
  if (cached && Date.now() - cached.t < TTL_MS) {
    return callback(null, cached.data);
  }
  const opts = {
    hostname: 'api.vrchat.cloud',
    path: `/api/1/worlds/${worldId}`,
    method: 'GET',
    headers: {
      'User-Agent': 'natsune-site-admin/0.1 (https://natsune-vrc.com/)',
      'Accept': 'application/json',
    },
  };
  const req = https.request(opts, r => {
    let body = '';
    r.on('data', chunk => body += chunk);
    r.on('end', () => {
      cache.set(worldId, { t: Date.now(), data: body });
      callback(null, body);
    });
  });
  req.on('error', err => callback(err));
  req.end();
}

http.createServer((req, res) => {
  const urlNoQs = req.url.split('?')[0];

  // ── VRChat world API proxy ──
  const m = urlNoQs.match(/^\/api\/world\/(wrld_[a-f0-9-]+)$/i);
  if (m) {
    fetchVRChat(m[1], (err, data) => {
      if (err) {
        res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60',
      });
      res.end(data);
    });
    return;
  }

  // ── Static files ──
  let url = urlNoQs;
  if (url === '/') url = '/index.html';
  if (url.endsWith('/')) url += 'index.html';
  const filePath = path.join(ROOT, url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Natsune site server running at http://localhost:${PORT}`);
  console.log(`VRChat API proxy: /api/world/:worldId`);
});
