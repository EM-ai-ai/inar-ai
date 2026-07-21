const supportedPlatforms = new Set(["windows", "mac-arm64", "mac-x64"]);

module.exports = async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.statusCode = 405;
    response.setHeader("Allow", "GET, HEAD");
    response.end("Metodo non consentito.");
    return;
  }

  const platform = String(request.query?.platform || "").toLowerCase();
  if (!supportedPlatforms.has(platform)) {
    response.statusCode = 400;
    response.end("Piattaforma non valida.");
    return;
  }

  const owner = process.env.GITHUB_RELEASE_OWNER;
  const repo = process.env.GITHUB_RELEASE_REPO;
  if (!owner || !repo) {
    response.statusCode = 503;
    response.end("Download temporaneamente non configurato.");
    return;
  }

  try {
    const release = await fetchLatestRelease(owner, repo);
    const asset = selectAsset(release.assets || [], platform);
    if (!asset) {
      response.statusCode = 404;
      response.end("Installer non disponibile.");
      return;
    }

    response.statusCode = 302;
    response.setHeader("Cache-Control", "private, no-store");
    response.setHeader("Location", asset.browser_download_url);
    response.end();
  } catch (error) {
    response.statusCode = 502;
    response.end(error?.message || "Download non disponibile.");
  }
};

function selectAsset(assets, platform) {
  const candidates = assets.filter((asset) => !asset.name.endsWith(".blockmap"));
  if (platform === "windows") {
    return candidates.find((asset) => /setup-.*-x64\.exe$/i.test(asset.name));
  }
  if (platform === "mac-arm64") {
    return candidates.find((asset) => /mac-arm64\.dmg$/i.test(asset.name));
  }
  if (platform === "mac-x64") {
    return candidates.find((asset) => /mac-x64\.dmg$/i.test(asset.name));
  }
  return undefined;
}

async function fetchLatestRelease(owner, repo) {
  const result = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "inar-ai-download"
    }
  });
  if (!result.ok) throw new Error(`Release lookup failed: ${result.status}`);
  return result.json();
}

module.exports.selectAsset = selectAsset;
