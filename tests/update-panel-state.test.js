const assert = require("node:assert/strict");
const test = require("node:test");

const {
  clampPercent,
  getRequiredUpdatePanelContent,
  shouldShowRequiredUpdatePanel
} = require("../Codice App AI InAr/src/update-panel-state");

test("mostra il pannello per aggiornamenti disponibili o già scaricati", () => {
  assert.equal(shouldShowRequiredUpdatePanel({ updateAvailable: true, downloaded: false, dismissed: false }), true);
  assert.equal(shouldShowRequiredUpdatePanel({ updateAvailable: false, downloaded: true, dismissed: false }), true);
  assert.equal(shouldShowRequiredUpdatePanel({ updateAvailable: false, downloaded: false, dismissed: false }), false);
  assert.equal(shouldShowRequiredUpdatePanel({ updateAvailable: true, downloaded: false, dismissed: true }), false);
});

test("limita sempre la percentuale tra zero e cento", () => {
  assert.equal(clampPercent(-12), 0);
  assert.equal(clampPercent(44.6), 45);
  assert.equal(clampPercent(107), 100);
  assert.equal(clampPercent("non valido"), 0);
});

test("genera azioni coerenti per ogni fase dell'aggiornamento", () => {
  const available = getRequiredUpdatePanelContent({ mode: "available", currentVersion: "0.1.13", latestVersion: "0.1.14" });
  const downloading = getRequiredUpdatePanelContent({ mode: "downloading", latestVersion: "0.1.14", percent: 108, total: "100 MB" });
  const install = getRequiredUpdatePanelContent({ mode: "install", latestVersion: "0.1.14" });
  const error = getRequiredUpdatePanelContent({ mode: "error", latestVersion: "0.1.14", message: "Connessione interrotta." });

  assert.equal(available.actionLabel, "Scarica aggiornamento");
  assert.match(available.title, /v0\.1\.14/);
  assert.equal(downloading.progress, 100);
  assert.equal(downloading.actionDisabled, true);
  assert.equal(install.actionLabel, "Riavvia e installa");
  assert.equal(error.actionLabel, "Riprova");
  assert.equal(error.message, "Connessione interrotta.");
});
