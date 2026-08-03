const test = require("node:test");
const assert = require("node:assert/strict");

const {
  isSourceHost,
  isSourceLocation,
  isSourceUrl,
  makeSourceUrl,
  primarySourceHost
} = require("../Codice App AI InAr/src/source-config");

test("usa il nuovo host Notebook e mantiene compatibilità con quello precedente", () => {
  assert.equal(primarySourceHost, "notebook.google.com");
  assert.equal(isSourceHost("notebook.google.com"), true);
  assert.equal(isSourceHost("notebooklm.google.com"), true);
  assert.equal(isSourceHost("accounts.google.com"), false);
});

test("crea l'URL del notebook sul nuovo host", () => {
  assert.equal(
    makeSourceUrl("notebook-id"),
    "https://notebook.google.com/notebook/notebook-id"
  );
});

test("riconosce un notebook HTTPS anche dopo un futuro cambio di dominio", () => {
  assert.equal(isSourceUrl("https://notebook-futuro.example/notebook/abc-123"), true);
  assert.equal(isSourceUrl("http://notebook-futuro.example/notebook/abc-123"), false);
  assert.equal(isSourceUrl("https://accounts.google.com/signin"), false);
  assert.equal(isSourceUrl("https://example.com/notebook/"), false);
  assert.equal(
    isSourceLocation({ protocol: "https:", pathname: "/notebook/abc-123" }),
    true
  );
});
