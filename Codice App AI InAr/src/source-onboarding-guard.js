const { getControlLabel, normalizeText } = require("./source-promotion-guard");

const sourceProductPattern = /\b(?:gemini\s+notebook|notebook\s*lm)\b/i;
const welcomePattern = /(?:\bwelcome\b|\bbenvenut[oa]\b|\bbienvenue\b|\bwillkommen\b|\bbienvenid[oa]\b|\bbem-vind[oa]\b|\bwelkom\b|\bwitamy\b|ようこそ|환영|歡迎|欢迎)/i;
const safeConfirmPattern = /^(?:ok|okay|got it|ho capito|j['’]ai compris|verstanden|entendido|entendi|begrepen)$/i;
const dialogSelector = "#MESSAGE_DIALOG, [role='dialog']";
const checkboxSelector = "input[type='checkbox'], [role='checkbox']";
const unsafeFieldSelector = "input:not([type='checkbox']), textarea, select, [contenteditable='true']";
const handledDialogs = new WeakSet();

function getCheckboxState(checkbox) {
  if (typeof checkbox?.checked === "boolean") return checkbox.checked;

  const ariaChecked = checkbox?.getAttribute?.("aria-checked");
  if (ariaChecked === "true") return true;
  if (ariaChecked === "false") return false;
  return null;
}

function ensureCheckboxIsOff(checkbox) {
  const initialState = getCheckboxState(checkbox);
  if (initialState === false) return true;
  if (initialState !== true) return false;

  try {
    checkbox.click?.();
  } catch {
    return false;
  }

  return getCheckboxState(checkbox) === false;
}

function isWelcomeDialog(dialog) {
  const title = dialog?.querySelector?.("#title, [role='heading'], h1, h2, h3");
  const titleText = normalizeText(title?.textContent);
  const dialogText = normalizeText(dialog?.textContent);
  const identity = normalizeText([
    dialog?.id,
    dialog?.getAttribute?.("aria-label"),
    dialog?.getAttribute?.("aria-labelledby")
  ].filter(Boolean).join(" "));

  const isKnownDialog = dialog?.id === "MESSAGE_DIALOG" || dialog?.getAttribute?.("role") === "dialog";
  const mentionsProduct = sourceProductPattern.test(`${titleText} ${dialogText} ${identity}`);
  return isKnownDialog && mentionsProduct && welcomePattern.test(titleText);
}

function findSafeConfirmButton(dialog) {
  const buttons = Array.from(dialog?.querySelectorAll?.("button, [role='button']") || []);
  const safeButtons = buttons.filter((button) => {
    const labels = [
      button.getAttribute?.("aria-label"),
      button.getAttribute?.("title"),
      button.textContent,
      getControlLabel(button)
    ]
      .map(normalizeText)
      .filter(Boolean);

    return labels.some((label) => safeConfirmPattern.test(label));
  });
  return safeButtons.length === 1 ? safeButtons[0] : null;
}

function acknowledgeSourceWelcome(root) {
  try {
    const dialogs = Array.from(root?.querySelectorAll?.(dialogSelector) || []);
    let acknowledgedCount = 0;

    for (const dialog of dialogs) {
      if (!isWelcomeDialog(dialog) || handledDialogs.has(dialog)) continue;
      if (dialog.querySelector?.(unsafeFieldSelector)) continue;

      const checkboxes = Array.from(dialog.querySelectorAll?.(checkboxSelector) || []);
      if (checkboxes.length > 1) continue;
      if (checkboxes.length === 1 && !ensureCheckboxIsOff(checkboxes[0])) continue;

      const confirmButton = findSafeConfirmButton(dialog);
      if (!confirmButton) continue;

      handledDialogs.add(dialog);
      try {
        confirmButton.click?.();
        acknowledgedCount += 1;
      } catch {
        handledDialogs.delete(dialog);
      }
    }

    return acknowledgedCount;
  } catch {
    return 0;
  }
}

module.exports = {
  acknowledgeSourceWelcome,
  ensureCheckboxIsOff,
  findSafeConfirmButton,
  getCheckboxState,
  isWelcomeDialog
};
