const requiredOverlayIds = Object.freeze([
  "demo-ai-shell",
  "demo-top-mask",
  "demo-left-mask",
  "demo-right-mask",
  "demo-card-mask",
  "demo-bottom-mask"
]);

function hasRequiredOverlay(getElementById) {
  return requiredOverlayIds.every((id) => Boolean(getElementById(id)));
}

module.exports = {
  hasRequiredOverlay,
  requiredOverlayIds
};
