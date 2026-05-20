const fs = require('fs');
const http = require('http');
const path = require('path');

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');
const rateWindowMs = 60 * 1000;
const maxRequests = 140;
const requestLog = new Map();

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

const routeFiles = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/directory': 'directory.html',
  '/directory.html': 'directory.html',
  '/programs': 'programs.html',
  '/programs.html': 'programs.html',
};

function isRateLimited(req) {
  const key = req.socket.remoteAddress || 'local';
  const now = Date.now();
  const recent = (requestLog.get(key) || []).filter((timestamp) => now - timestamp < rateWindowMs);
  recent.push(now);
  requestLog.set(key, recent);
  return recent.length > maxRequests;
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      send(res, 404, 'Not found');
      return;
    }
    const type = contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    send(res, 200, content, type);
  });
}

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${PORT}`).pathname);
  if (pathname === '/healthz') return { health: true };

  const routeFile = routeFiles[pathname];
  const requestedFile = routeFile || pathname.replace(/^\/+/, '');
  const candidate = path.resolve(publicDir, requestedFile);
  const publicRoot = path.resolve(publicDir);

  if (!candidate.toLowerCase().startsWith(publicRoot.toLowerCase())) {
    return { blocked: true };
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return { filePath: candidate };
  }

  return { filePath: path.join(publicDir, 'index.html') };
}

const server = http.createServer((req, res) => {
  if (isRateLimited(req)) {
    send(res, 429, 'Too many requests');
    return;
  }

  const target = resolveRequestPath(req.url);
  if (target.health) {
    send(res, 200, JSON.stringify({ ok: true, app: 'Reconnect Directory' }), 'application/json; charset=utf-8');
    return;
  }
  if (target.blocked) {
    send(res, 403, 'Forbidden');
    return;
  }
  sendFile(res, target.filePath);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
