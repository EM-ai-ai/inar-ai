const bannerMeaningPattern = /\b(?:banner|bannière|announcement|annuncio|anuncio|avviso|aviso|notice|hinweis|promotion|promozione)\b/i;
const dismissMeaningPattern = /\b(?:ignora|ignorer|chiudi|dismiss|close|skip|fermer|schlie(?:ß|ss)en|cerrar|descartar|fechar|sluiten|verwerfen|omitir)\b/i;
const sourceProductPattern = /\b(?:gemini\s+notebook|notebook\s*lm)\b/i;
const editorSelector = "form, textarea, input, [contenteditable='true']";

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function getControlLabel(control) {
  return normalizeText([
    control?.getAttribute?.("aria-label"),
    control?.getAttribute?.("title"),
    control?.textContent
  ].filter(Boolean).join(" "));
}

function isPromotionDismissControl(control) {
  const label = getControlLabel(control);
  if (!label) return false;

  return bannerMeaningPattern.test(label) && dismissMeaningPattern.test(label);
}

function findPromotionContainer(control) {
  const controlLabel = getControlLabel(control);
  let node = control?.parentElement || null;

  for (let depth = 0; node && depth < 7; depth += 1) {
    if (node.querySelector?.(editorSelector)) return null;

    const nodeText = normalizeText(node.textContent);
    const containsMessage = nodeText.length > controlLabel.length + 4;
    if (containsMessage) return node;

    node = node.parentElement;
  }

  return null;
}

function findFallbackDismissControls(controls) {
  return controls.filter((control) => {
    const label = getControlLabel(control);
    if (!dismissMeaningPattern.test(label)) return false;

    let node = control.parentElement;
    for (let depth = 0; node && depth < 5; depth += 1) {
      if (node.querySelector?.(editorSelector)) return false;
      if (sourceProductPattern.test(normalizeText(node.textContent))) return true;
      node = node.parentElement;
    }

    return false;
  });
}

function suppressSourcePromotions(root) {
  try {
    const allControls = Array.from(root?.querySelectorAll?.("button, [role='button']") || []);
    const semanticControls = allControls.filter(isPromotionDismissControl);
    const controls = semanticControls.length > 0 ? semanticControls : findFallbackDismissControls(allControls);
    let suppressedCount = 0;

    for (const control of controls) {
      const container = findPromotionContainer(control);
      if (!container || container.dataset?.demoPromotionSuppressed === "1") continue;

      if (container.dataset) container.dataset.demoPromotionSuppressed = "1";
      container.style?.setProperty?.("display", "none", "important");

      try {
        control.click?.();
      } catch {
        // La rimozione visiva resta valida anche se il sito cambia il proprio handler.
      }

      container.remove?.();
      suppressedCount += 1;
    }

    return suppressedCount;
  } catch {
    return 0;
  }
}

module.exports = {
  findPromotionContainer,
  getControlLabel,
  isPromotionDismissControl,
  normalizeText,
  suppressSourcePromotions
};
