const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isPromotionDismissControl,
  suppressSourcePromotions
} = require("../Codice App AI InAr/src/source-promotion-guard");

function makeElement({ ariaLabel = "", text = "", parent = null, hasEditor = false, clickError = null } = {}) {
  const element = {
    dataset: {},
    parentElement: parent,
    removed: false,
    clicked: false,
    textContent: text,
    style: {
      values: {},
      setProperty(name, value, priority) {
        this.values[name] = { value, priority };
      }
    },
    getAttribute(name) {
      if (name === "aria-label") return ariaLabel;
      return "";
    },
    querySelector() {
      return hasEditor ? {} : null;
    },
    click() {
      this.clicked = true;
      if (clickError) throw clickError;
    },
    remove() {
      this.removed = true;
    }
  };

  return element;
}

function makeBanner({ label, message, clickError = null }) {
  const container = makeElement({ text: `${message} ${label}` });
  const button = makeElement({ ariaLabel: label, parent: container, clickError });
  return { button, container };
}

function makeRoot(controls) {
  return {
    querySelectorAll() {
      return controls;
    }
  };
}

test("riconosce il comando italiano senza dipendere dal testo promozionale", () => {
  const { button, container } = makeBanner({
    label: "Ignora banner",
    message: "Un testo promozionale completamente nuovo"
  });

  assert.equal(isPromotionDismissControl(button), true);
  assert.equal(suppressSourcePromotions(makeRoot([button])), 1);
  assert.equal(button.clicked, true);
  assert.equal(container.removed, true);
});

test("riconosce un banner inglese con un messaggio differente", () => {
  const { button, container } = makeBanner({
    label: "Dismiss banner",
    message: "Try our latest workspace capabilities"
  });

  assert.equal(suppressSourcePromotions(makeRoot([button])), 1);
  assert.equal(container.style.values.display.value, "none");
  assert.equal(container.style.values.display.priority, "important");
});

test("non tocca normali pulsanti di chiusura o invio", () => {
  const panel = makeElement({ text: "Chat InAR" });
  const closeButton = makeElement({ ariaLabel: "Chiudi", parent: panel });
  const sendButton = makeElement({ ariaLabel: "Invia", parent: panel });
  const createBannerButton = makeElement({ ariaLabel: "Crea banner", parent: panel });

  assert.equal(suppressSourcePromotions(makeRoot([closeButton, sendButton, createBannerButton])), 0);
  assert.equal(panel.removed, false);
  assert.equal(closeButton.clicked, false);
});

test("non risale fino a un contenitore che include il campo della domanda", () => {
  const unsafePanel = makeElement({ text: "Novità Ignora banner", hasEditor: true });
  const button = makeElement({ ariaLabel: "Ignora banner", parent: unsafePanel });

  assert.equal(suppressSourcePromotions(makeRoot([button])), 0);
  assert.equal(unsafePanel.removed, false);
});

test("rimane innocuo se il sito cambia handler o il banner non esiste", () => {
  const { button, container } = makeBanner({
    label: "Ignora banner",
    message: "Novità",
    clickError: new Error("handler cambiato")
  });

  assert.doesNotThrow(() => suppressSourcePromotions(makeRoot([button])));
  assert.equal(container.removed, true);
  assert.equal(suppressSourcePromotions(makeRoot([])), 0);
  assert.equal(suppressSourcePromotions(null), 0);
});
