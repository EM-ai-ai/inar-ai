const { createAccessCookie, safeEqual } = require("../lib/access");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.statusCode = 405;
    response.setHeader("Allow", "POST");
    response.end("Metodo non consentito.");
    return;
  }

  const expectedPassword = process.env.SITE_PASSWORD;
  const authSecret = process.env.AUTH_SECRET;
  if (!expectedPassword || !authSecret) {
    response.statusCode = 503;
    response.end("Portale temporaneamente non configurato.");
    return;
  }

  const body = await readBody(request);
  const password = new URLSearchParams(body).get("password") || "";

  if (!safeEqual(password, expectedPassword)) {
    response.statusCode = 303;
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Location", "/?error=1");
    response.end();
    return;
  }

  response.statusCode = 303;
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Set-Cookie", createAccessCookie(authSecret));
  response.setHeader("Location", "/");
  response.end();
};

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 4096) reject(new Error("Richiesta troppo grande."));
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}
