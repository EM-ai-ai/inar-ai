const test = require("node:test");
const assert = require("node:assert/strict");
const {
  acknowledgeSourceWelcome,
  ensureCheckboxIsOff,
  isWelcomeDialog
} = require("../Codice App AI InAr/src/source-onboarding-guard");

function makeControl({ label = "", checked, role = "", clickError = null } = {}) {
  return {
    checked,
    clicked: false,
    textContent: label,
    getAttribute(name) {
      if (name === "aria-label") return label;
      if (name === "role") return role;
      if (name === "aria-checked" && typeof this.checked === "boolean") return String(this.checked);
      return "";
    },
    click() {
      this.clicked = true;
      if (clickError) throw clickError;
      if (typeof this.checked === "boolean") this.checked = !this.checked;
    }
  };
}

function makeDialog({
  title = "Ti diamo il benvenuto in Gemini Notebook!",
  body = "Informazioni sul servizio",
  confirmLabel = "Ok",
  checkboxState = false,
  checkboxCount = 1,
  unsafeField = false,
  confirmError = null,
  id = "MESSAGE_DIALOG",
  role = "dialog"
} = {}) {
  const heading = { textContent: title };
  const confirmButton = makeControl({ label: confirmLabel, clickError: confirmError });
  const checkboxes = Array.from({ length: checkboxCount }, () => makeControl({ checked: checkboxState, role: "checkbox" }));
  const dialog = {
    id,
    textContent: `${title} ${body}`,
    getAttribute(name) {
      if (name === "role") return role;
      return "";
    },
    querySelector(selector) {
      if (selector.includes("#title")) return heading;
      if (selector.includes("input:not") && unsafeField) return {};
      return null;
    },
    querySelectorAll(selector) {
      if (selector.includes("checkbox")) return checkboxes;
      if (selector.includes("button")) return [confirmButton];
      return [];
    }
  };

  return { checkboxes, confirmButton, dialog };
}

function makeRoot(dialogs) {
  return {
    querySelectorAll() {
      return dialogs;
    }
  };
}

test("conferma il benvenuto italiano lasciando disattivati gli aggiornamenti", () => {
  const { checkboxes, confirmButton, dialog } = makeDialog();

  assert.equal(isWelcomeDialog(dialog), true);
  assert.equal(acknowledgeSourceWelcome(makeRoot([dialog])), 1);
  assert.equal(checkboxes[0].checked, false);
  assert.equal(checkboxes[0].clicked, false);
  assert.equal(confirmButton.clicked, true);
});

test("riconosce il benvenuto inglese anche se cambia il testo descrittivo", () => {
  const { confirmButton, dialog } = makeDialog({
    title: "Welcome to Gemini Notebook!",
    body: "A completely different description",
    confirmLabel: "Got it"
  });

  assert.equal(acknowledgeSourceWelcome(makeRoot([dialog])), 1);
  assert.equal(confirmButton.clicked, true);
});

test("disattiva un checkbox preselezionato prima della conferma", () => {
  const { checkboxes, confirmButton, dialog } = makeDialog({ checkboxState: true });

  assert.equal(ensureCheckboxIsOff(checkboxes[0]), true);
  assert.equal(checkboxes[0].checked, false);
  assert.equal(checkboxes[0].clicked, true);

  const second = makeDialog({ checkboxState: true });
  assert.equal(acknowledgeSourceWelcome(makeRoot([second.dialog])), 1);
  assert.equal(second.checkboxes[0].checked, false);
  assert.equal(second.confirmButton.clicked, true);
});

test("non accetta dialoghi ambigui, termini aggiornati o moduli aggiuntivi", () => {
  const terms = makeDialog({ title: "Termini aggiornati di Gemini Notebook" });
  const multipleOptions = makeDialog({ checkboxCount: 2 });
  const withField = makeDialog({ unsafeField: true });

  assert.equal(acknowledgeSourceWelcome(makeRoot([terms.dialog, multipleOptions.dialog, withField.dialog])), 0);
  assert.equal(terms.confirmButton.clicked, false);
  assert.equal(multipleOptions.confirmButton.clicked, false);
  assert.equal(withField.confirmButton.clicked, false);
});

test("resta innocuo quando il dialogo manca o il pulsante cambia significato", () => {
  const unknownButton = makeDialog({ confirmLabel: "Accetta condizioni" });

  assert.equal(acknowledgeSourceWelcome(makeRoot([unknownButton.dialog])), 0);
  assert.equal(acknowledgeSourceWelcome(makeRoot([])), 0);
  assert.equal(acknowledgeSourceWelcome(null), 0);
});
