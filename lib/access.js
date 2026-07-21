const crypto = require("node:crypto");

const accessCookieName = "inar_ai_access";
const accessPayload = "inar-ai-authorized-v1";

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left), "utf8");
  const rightBuffer = Buffer.from(String(right), "utf8");
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function createAccessToken(secret) {
  return crypto.createHmac("sha256", secret).update(accessPayload).digest("base64url");
}

function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((cookies, entry) => {
    const separator = entry.indexOf("=");
    if (separator === -1) return cookies;
    const name = entry.slice(0, separator).trim();
    const value = entry.slice(separator + 1).trim();
    if (name) cookies[name] = decodeURIComponent(value);
    return cookies;
  }, {});
}

function isAuthorized(cookieHeader, secret) {
  if (!secret) return false;
  const token = parseCookies(cookieHeader)[accessCookieName];
  return Boolean(token) && safeEqual(token, createAccessToken(secret));
}

function createAccessCookie(secret) {
  const token = encodeURIComponent(createAccessToken(secret));
  return `${accessCookieName}=${token}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`;
}

function clearAccessCookie() {
  return `${accessCookieName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

module.exports = {
  accessCookieName,
  clearAccessCookie,
  createAccessCookie,
  createAccessToken,
  isAuthorized,
  safeEqual
};
