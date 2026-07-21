const fs = require("node:fs");
const path = require("node:path");
const { isAuthorized } = require("../lib/access");

module.exports = async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.statusCode = 405;
    response.setHeader("Allow", "GET, HEAD");
    response.end("Metodo non consentito.");
    return;
  }

  const authSecret = process.env.AUTH_SECRET;
  if (!process.env.SITE_PASSWORD || !authSecret) {
    response.statusCode = 503;
    response.end("Portale temporaneamente non configurato.");
    return;
  }

  const authorized = isAuthorized(request.headers.cookie || "", authSecret);
  const filename = authorized ? "index.html" : "login.html";
  const html = fs.readFileSync(path.join(process.cwd(), "site", filename), "utf8");

  response.statusCode = 200;
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  response.end(html);
};
