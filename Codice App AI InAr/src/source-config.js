const primarySourceHost = ["note", "book.google.com"].join("");
const legacySourceHost = ["note", "booklm.google.com"].join("");
const sourceHosts = new Set([primarySourceHost, legacySourceHost]);
const sourcePath = "/notebook/";

function isSourceHost(hostname) {
  return sourceHosts.has(hostname);
}

function isNotebookPath(pathname) {
  return /^\/notebook\/[^/]+/.test(pathname);
}

function isSourceLocation(location) {
  return location.protocol === "https:" && isNotebookPath(location.pathname);
}

function isSourceUrl(rawUrl) {
  try {
    return isSourceLocation(new URL(rawUrl));
  } catch {
    return false;
  }
}

function makeSourceUrl(id) {
  return `https://${primarySourceHost}${sourcePath}${id}`;
}

module.exports = {
  isSourceHost,
  isSourceLocation,
  isSourceUrl,
  makeSourceUrl,
  primarySourceHost,
  sourceHosts
};
