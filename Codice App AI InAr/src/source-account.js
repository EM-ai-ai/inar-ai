const emailPattern = /[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+/i;
const accountControlSelector = "button[aria-label], [role='button'][aria-label], button[title], [role='button'][title]";

function normalizeAccountText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function extractNameBeforeEmail(label, emailIndex) {
  let prefix = normalizeAccountText(label.slice(0, emailIndex).replace(/\($/, ""));
  const lastColonIndex = Math.max(prefix.lastIndexOf(":"), prefix.lastIndexOf("："));
  if (lastColonIndex >= 0) prefix = normalizeAccountText(prefix.slice(lastColonIndex + 1));

  return prefix.length >= 2 && prefix.length <= 80 ? prefix : "";
}

function parseSourceAccountLabel(value) {
  const label = normalizeAccountText(value);
  const emailMatch = label.match(emailPattern);
  if (!emailMatch || !Number.isInteger(emailMatch.index)) return null;

  const email = emailMatch[0].toLowerCase();
  const name = extractNameBeforeEmail(label, emailMatch.index);
  return { name, email };
}

function findSourceAccount(root) {
  const controls = Array.from(root?.querySelectorAll?.(accountControlSelector) || []);

  for (const control of controls) {
    const labels = [control.getAttribute?.("aria-label"), control.getAttribute?.("title")];
    for (const label of labels) {
      const account = parseSourceAccountLabel(label);
      if (account) return account;
    }
  }

  return null;
}

module.exports = {
  accountControlSelector,
  findSourceAccount,
  normalizeAccountText,
  parseSourceAccountLabel
};
