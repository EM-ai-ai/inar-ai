const test = require("node:test");
const assert = require("node:assert/strict");

const {
  defaultNotebookKey,
  notebookByKey,
  notebooks,
  notebookUrls
} = require("../Codice App AI InAr/src/notebook-config");

test("configura le tre aree InAR con Progetti come predefinita", () => {
  assert.equal(defaultNotebookKey, "architect");
  assert.deepEqual(
    notebooks.map(({ key, label }) => ({ key, label })),
    [
      { key: "architect", label: "InAR - Progetti" },
      { key: "dip", label: "InAR AI - DIP" },
      { key: "gare", label: "InAR - Gare" }
    ]
  );
  assert.equal(new Set(notebooks.map(({ id }) => id)).size, 3);
});

test("collega ogni area al notebook richiesto", () => {
  assert.equal(
    notebookUrls.architect,
    "https://notebook.google.com/notebook/d5a915b1-64ae-4668-9fc4-fe62c4bfa56a"
  );
  assert.equal(
    notebookUrls.dip,
    "https://notebook.google.com/notebook/4d9b8338-8d74-4429-8ef3-d53445e289ef"
  );
  assert.equal(
    notebookUrls.gare,
    "https://notebook.google.com/notebook/df20f3c7-9587-4ce2-8cf9-41264a927abd"
  );
  assert.equal(notebookByKey[defaultNotebookKey].label, "InAR - Progetti");
});
