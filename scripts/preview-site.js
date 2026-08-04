const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "site");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".webp": "image/webp" };

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relativePath = pathname.replace(/^\/site(?:\/|$)/, "").replace(/^\/+/, "") || "index.html";
  const filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.setHeader("Content-Type", types[path.extname(filePath)] || "application/octet-stream");
  fs.createReadStream(filePath).pipe(response);
}).listen(4178, "0.0.0.0");
