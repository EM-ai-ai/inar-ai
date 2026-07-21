const test = require("node:test");
const assert = require("node:assert/strict");
const {
  accessCookieName,
  clearAccessCookie,
  createAccessCookie,
  createAccessToken,
  isAuthorized,
  safeEqual
} = require("../lib/access");
const { findAsset, normalizeName } = require("../api/updates");

test("confronta valori sensibili senza conversioni implicite", () => {
  assert.equal(safeEqual("InAR AI", "InAR AI"), true);
  assert.equal(safeEqual("InAR AI", "inar ai"), false);
  assert.equal(safeEqual("breve", "molto più lungo"), false);
});

test("autorizza soltanto un cookie firmato con lo stesso segreto", () => {
  const secret = "segreto-test";
  const token = createAccessToken(secret);
  assert.equal(isAuthorized(`${accessCookieName}=${token}`, secret), true);
  assert.equal(isAuthorized(`${accessCookieName}=${token}`, "altro-segreto"), false);
  assert.equal(isAuthorized("", secret), false);
});

test("genera cookie sicuri e revocabili", () => {
  assert.match(createAccessCookie("segreto-test"), /HttpOnly; Secure; SameSite=Lax/);
  assert.match(clearAccessCookie(), /Max-Age=0/);
});

test("normalizza e trova gli asset delle release", () => {
  const assets = [
    { name: "InAR.AI-Setup-0.1.6-x64.exe" },
    { name: "latest.yml" }
  ];
  assert.equal(normalizeName("InAR AI_Setup.0.1.6-x64.exe"), "inar-ai-setup-0-1-6-x64-exe");
  assert.equal(findAsset(assets, "latest.yml").name, "latest.yml");
  assert.equal(findAsset(assets, "InAR-AI-Setup-0.1.6-x64.exe").name, assets[0].name);
});
