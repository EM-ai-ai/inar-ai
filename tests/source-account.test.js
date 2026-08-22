const assert = require("node:assert/strict");
const test = require("node:test");

const {
  findSourceAccount,
  parseSourceAccountLabel
} = require("../Codice App AI InAr/src/source-account");

test("estrae nome ed email dall'account italiano", () => {
  assert.deepEqual(
    parseSourceAccountLabel("Account Google: Marco Vitti (marco.vitti83@gmail.com), Avviso importante relativo all'account"),
    { name: "Marco Vitti", email: "marco.vitti83@gmail.com" }
  );
});

test("estrae l'account senza dipendere dalla lingua dell'etichetta", () => {
  assert.deepEqual(
    parseSourceAccountLabel("Google Account: Jane Smith (Jane.Smith@inar.example)"),
    { name: "Jane Smith", email: "jane.smith@inar.example" }
  );
  assert.deepEqual(
    parseSourceAccountLabel("Compte : Jean Dupont (jean.dupont@inar.fr)"),
    { name: "Jean Dupont", email: "jean.dupont@inar.fr" }
  );
});

test("ignora controlli che non espongono un indirizzo email", () => {
  assert.equal(parseSourceAccountLabel("Account collegato"), null);
  assert.equal(parseSourceAccountLabel("Apri impostazioni"), null);
});

test("trova l'account soltanto nei controlli accessibili", () => {
  const controls = [
    { getAttribute: (name) => name === "aria-label" ? "Impostazioni" : null },
    { getAttribute: (name) => name === "aria-label" ? "Account: Ada Lovelace (ada@inar.it)" : null }
  ];
  const root = { querySelectorAll: () => controls };

  assert.deepEqual(findSourceAccount(root), { name: "Ada Lovelace", email: "ada@inar.it" });
  assert.equal(findSourceAccount({ querySelectorAll: () => [] }), null);
});
