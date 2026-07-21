const { clearAccessCookie } = require("../lib/access");

module.exports = async function handler(request, response) {
  response.statusCode = 303;
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Set-Cookie", clearAccessCookie());
  response.setHeader("Location", "/");
  response.end();
};
