const test = require("node:test");
const assert = require("node:assert/strict");
const {
  hasRequiredOverlay,
  requiredOverlayIds
} = require("../Codice App AI InAr/src/overlay-guard");

test("conferma l'overlay soltanto quando tutti i blocchi protettivi esistono", () => {
  const mountedIds = new Set(requiredOverlayIds);

  assert.equal(hasRequiredOverlay((id) => mountedIds.has(id)), true);

  mountedIds.delete("demo-left-mask");
  assert.equal(hasRequiredOverlay((id) => mountedIds.has(id)), false);
});

test("un overlay completamente assente non viene mai considerato pronto", () => {
  assert.equal(hasRequiredOverlay(() => null), false);
});
