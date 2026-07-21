module.exports = async function handler(request, response) {
  try {
    const owner = process.env.GITHUB_RELEASE_OWNER;
    const repo = process.env.GITHUB_RELEASE_REPO;
    if (!owner || !repo) {
      response.statusCode = 503;
      response.end("Canale aggiornamenti temporaneamente non configurato.");
      return;
    }
    const requestedFile = getRequestedFile(request) || "latest.yml";
    const release = await fetchLatestRelease(owner, repo);
    const asset = findAsset(release.assets || [], requestedFile);

    if (!asset) {
      response.statusCode = 404;
      response.end("File di aggiornamento non trovato.");
      return;
    }

    if (asset.name.endsWith(".yml")) {
      const metadataResponse = await fetch(asset.browser_download_url, { redirect: "follow" });
      if (!metadataResponse.ok) {
        response.statusCode = metadataResponse.status;
        response.end("Metadati di aggiornamento non disponibili.");
        return;
      }

      response.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
      response.setHeader("Content-Type", "text/yaml; charset=utf-8");
      response.end(await metadataResponse.text());
      return;
    }

    response.statusCode = 302;
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Location", asset.browser_download_url);
    response.end();
  } catch (error) {
    response.statusCode = 500;
    response.end(error?.message || "Aggiornamento non disponibile.");
  }
};

function getRequestedFile(request) {
  const queryFile = request.query?.file;
  if (queryFile) {
    return decodeURIComponent(Array.isArray(queryFile) ? queryFile.join("/") : queryFile);
  }
  const pathname = new URL(request.url, "https://example.com").pathname;
  return decodeURIComponent(pathname.replace(/^\/api\/updates\/?/, ""));
}

function findAsset(assets, requestedFile) {
  const normalizedRequest = normalizeName(requestedFile);
  return assets.find((asset) => normalizeName(asset.name) === normalizedRequest)
    || assets.find((asset) => normalizeName(asset.name.replaceAll(" ", "-")) === normalizedRequest);
}

function normalizeName(name) {
  return name.toLowerCase().replaceAll("%20", "-").replace(/[.\s_-]+/g, "-");
}

async function fetchLatestRelease(owner, repo) {
  const result = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "inar-ai-site"
    }
  });
  if (!result.ok) throw new Error(`GitHub release lookup failed: ${result.status}`);
  return result.json();
}

module.exports.findAsset = findAsset;
module.exports.normalizeName = normalizeName;
