const path = require("node:path");
const fs = require("node:fs");
const { app, BrowserWindow, ipcMain, shell, session } = require("electron");
const { autoUpdater } = require("electron-updater");
const { defaultNotebookKey, notebookUrls } = require("./notebook-config");
const { isSourceUrl, sourceHosts } = require("./source-config");

const demoUrls = notebookUrls;
const appTitle = "InAR AI";
const inarLogoPath = path.join(__dirname, "..", "assets", "inar-logo-full.webp");
const iconPath = path.join(__dirname, "..", "assets", "inar-app-logo.png");
const profileName = "InAR AI";
const sessionPartition = "persist:inar-ai";
const nativeCurtainEnabled = true;
const nativeCurtainBeforeLoadMs = 90;
const nativeCurtainAfterOverlayMs = 1100;
const nativeCurtainFailsafeMs = 9000;
const allowedHosts = new Set([
  ...sourceHosts,
  "accounts.google.com",
  "myaccount.google.com",
  "ogs.google.com",
  "www.gstatic.com",
  "ssl.gstatic.com"
]);
const curtainLogos = {
  architect: createAssetDataUrl(inarLogoPath, "image/webp")
};
const defaultCurtainSteps = [
  "Preparazione area riservata",
  "Allineamento documenti e procedure",
  "Configurazione risposte aziendali",
  "Applicazione interfaccia cliente",
  "Verifica contesto operativo"
];
const curtainClients = {
  general: {
    label: "Conoscenza Aziendale AI",
    context: "Ambiente demo generale",
    initials: "AI",
    logo: curtainLogos.general,
    logoShape: "horizontal",
    accent: "#4f8dff",
    accentSoft: "rgba(79, 141, 255, 0.18)",
    steps: [
      "Preparazione conoscenza aziendale",
      "Sincronizzazione materiali dimostrativi",
      "Ottimizzazione percorso di consultazione",
      "Configurazione ambiente conversazionale",
      "Verifica interfaccia operativa"
    ]
  },
  chemical: {
    label: "Azienda Produttiva CH",
    context: "Schede tecniche, prodotti e procedure operative",
    initials: "CH",
    logo: curtainLogos.chemical,
    logoShape: "vertical",
    accent: "#4f8dff",
    accentSoft: "rgba(79, 141, 255, 0.18)",
    steps: [
      "Allineamento catalogo prodotti",
      "Preparazione schede tecniche",
      "Verifica procedure operative",
      "Organizzazione materiali aziendali",
      "Configurazione assistente tecnico"
    ]
  },
  architect: {
    label: "InAR - Progetti",
    context: "Progetti, capitolati e documentazione tecnica",
    initials: "IN",
    logo: curtainLogos.architect,
    logoShape: "horizontal",
    accent: "#9b7cff",
    accentSoft: "rgba(155, 124, 255, 0.2)",
    steps: [
      "Preparazione archivio InAR",
      "Allineamento progetti e capitolati",
      "Organizzazione documentazione tecnica",
      "Verifica del contesto di studio",
      "Configurazione assistente InAR"
    ]
  },
  dip: {
    label: "InAR AI - DIP",
    context: "Documentazione DIP e relativo contesto operativo",
    initials: "DI",
    logo: curtainLogos.architect,
    logoShape: "horizontal",
    accent: "#38bdf8",
    accentSoft: "rgba(56, 189, 248, 0.2)",
    steps: [
      "Preparazione archivio DIP",
      "Allineamento documentazione dedicata",
      "Organizzazione requisiti e riferimenti",
      "Verifica del contesto operativo",
      "Configurazione assistente DIP"
    ]
  },
  gare: {
    label: "InAR - Gare",
    context: "Bandi, requisiti e materiali di gara",
    initials: "GA",
    logo: curtainLogos.architect,
    logoShape: "horizontal",
    accent: "#f59e0b",
    accentSoft: "rgba(245, 158, 11, 0.2)",
    steps: [
      "Preparazione archivio gare",
      "Allineamento bandi e requisiti",
      "Organizzazione materiali di partecipazione",
      "Verifica del contesto di gara",
      "Configurazione assistente gare"
    ]
  },
  legal: {
    label: "Studio legale LS",
    context: "Pratiche, procedure interne e documenti legali",
    initials: "LS",
    accent: "#38bdf8",
    accentSoft: "rgba(56, 189, 248, 0.18)"
  },
  building: {
    label: "Impresa edile ED",
    context: "Cantieri, preventivi, materiali e sicurezza",
    initials: "ED",
    accent: "#f59e0b",
    accentSoft: "rgba(245, 158, 11, 0.18)"
  },
  mechanic: {
    label: "Officina meccanica ME",
    context: "Manuali, ricambi, diagnosi e interventi",
    initials: "ME",
    accent: "#22c55e",
    accentSoft: "rgba(34, 197, 94, 0.18)"
  },
  laboratory: {
    label: "Laboratorio analisi LA",
    context: "Protocolli, referti, procedure e qualità",
    initials: "LA",
    accent: "#06b6d4",
    accentSoft: "rgba(6, 182, 212, 0.18)"
  },
  assistance: {
    label: "Centro assistenza CA",
    context: "Ticket, FAQ, guide e supporto clienti",
    initials: "CA",
    accent: "#19c37d",
    accentSoft: "rgba(25, 195, 125, 0.18)"
  }
};

function isAllowedNavigation(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" && (allowedHosts.has(url.hostname) || isSourceUrl(rawUrl));
  } catch {
    return false;
  }
}

function createWindow() {
  const kiosk = process.argv.includes("--kiosk");
  let activeDemoKey = defaultNotebookKey;
  let nativeCurtain = null;
  let nativeCurtainHideTimer = null;
  let nativeCurtainFailsafeTimer = null;
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1280,
    minHeight: 820,
    maxWidth: 1280,
    maxHeight: 820,
    title: appTitle,
    autoHideMenuBar: true,
    icon: iconPath,
    resizable: false,
    maximizable: false,
    kiosk,
    backgroundColor: "#020305",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, "preload.js"),
      partition: sessionPartition
    }
  });

  win.removeMenu();
  win.setTitle(appTitle);
  win.center();

  const syncNativeCurtainBounds = () => {
    if (!nativeCurtain || nativeCurtain.isDestroyed()) return;
    nativeCurtain.setBounds(win.getBounds());
  };

  const createNativeCurtain = () => {
    if (!nativeCurtainEnabled) return null;
    if (nativeCurtain && !nativeCurtain.isDestroyed()) return nativeCurtain;

    nativeCurtain = new BrowserWindow({
      ...win.getBounds(),
      parent: win,
      modal: false,
      frame: false,
      show: false,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      backgroundColor: "#020305",
      title: appTitle,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      }
    });

    nativeCurtain.removeMenu();
    nativeCurtain.setAlwaysOnTop(true, "screen-saver");
    syncNativeCurtainBounds();

    nativeCurtain.on("closed", () => {
      nativeCurtain = null;
    });

    return nativeCurtain;
  };

  const showNativeCurtain = (demoKey) => {
    if (!nativeCurtainEnabled) return;

    const curtain = createNativeCurtain();
    if (!curtain || curtain.isDestroyed()) return;

    windowClearTimeout(nativeCurtainHideTimer);
    windowClearTimeout(nativeCurtainFailsafeTimer);
    syncNativeCurtainBounds();
    curtain.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(createNativeCurtainHtml(demoKey))}`);
    curtain.showInactive();

    nativeCurtainFailsafeTimer = setTimeout(() => {
      hideNativeCurtain();
    }, nativeCurtainFailsafeMs);
  };

  const hideNativeCurtain = () => {
    windowClearTimeout(nativeCurtainHideTimer);
    windowClearTimeout(nativeCurtainFailsafeTimer);
    nativeCurtainHideTimer = null;
    nativeCurtainFailsafeTimer = null;

    if (nativeCurtain && !nativeCurtain.isDestroyed()) {
      nativeCurtain.hide();
    }
  };

  const scheduleNativeCurtainHide = (delayMs = nativeCurtainAfterOverlayMs) => {
    if (!nativeCurtainEnabled || !nativeCurtain || nativeCurtain.isDestroyed() || !nativeCurtain.isVisible()) return;

    windowClearTimeout(nativeCurtainHideTimer);
    nativeCurtainHideTimer = setTimeout(() => {
      hideNativeCurtain();
    }, delayMs);
  };

  const loadDemoUrl = (demoKey, { useCurtain = true } = {}) => {
    const nextUrl = demoUrls[demoKey];
    if (!nextUrl) return;

    activeDemoKey = demoKey;

    if (!nativeCurtainEnabled || !useCurtain) {
      win.loadURL(nextUrl);
      return;
    }

    showNativeCurtain(demoKey);
    setTimeout(() => {
      if (!win.webContents.isDestroyed()) win.loadURL(nextUrl);
    }, nativeCurtainBeforeLoadMs);
  };

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedNavigation(url)) {
      return { action: "allow" };
    }

    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (!isAllowedNavigation(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  win.webContents.on("before-input-event", async (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === "l" && input.type === "keyDown") {
      event.preventDefault();
      await session.fromPartition(sessionPartition).clearStorageData();
      loadDemoUrl(defaultNotebookKey);
    }
  });

  win.on("page-title-updated", (event) => {
    event.preventDefault();
    win.setTitle(appTitle);
  });

  const forceOverlay = () => {
    if (!win.webContents.isDestroyed()) {
      win.webContents.send("demo-force-overlay", activeDemoKey);
    }
    scheduleNativeCurtainHide();
  };

  win.webContents.on("dom-ready", forceOverlay);
  win.webContents.on("did-finish-load", forceOverlay);
  win.webContents.on("did-fail-load", () => {
    scheduleNativeCurtainHide(1600);
  });

  win.on("move", syncNativeCurtainBounds);
  win.on("resize", syncNativeCurtainBounds);
  win.on("restore", syncNativeCurtainBounds);
  win.on("closed", () => {
    windowClearTimeout(nativeCurtainHideTimer);
    windowClearTimeout(nativeCurtainFailsafeTimer);
    if (nativeCurtain && !nativeCurtain.isDestroyed()) nativeCurtain.destroy();
  });

  const sendUpdateStatus = (message, holdMs = 6000) => {
    if (!win.webContents.isDestroyed()) {
      win.webContents.send("demo-update-status", { message, holdMs });
    }
  };

  let pendingUpdateInfo = null;
  let downloadedUpdateInfo = null;
  let updateCheckMode = "manual";
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on("update-available", (info) => {
    pendingUpdateInfo = info;
    if (!win.webContents.isDestroyed()) {
      win.webContents.send("demo-update-available", {
        currentVersion: app.getVersion(),
        latestVersion: info.version,
        message: `Ultima versione: v${info.version}. Aggiornamento disponibile.`
      });
    }
    if (updateCheckMode !== "silent") {
      sendUpdateStatus(`Ultima versione: v${info.version}. Puoi avviare il download quando vuoi.`, 6000);
    }
  });

  autoUpdater.on("update-not-available", (info) => {
    pendingUpdateInfo = null;
    downloadedUpdateInfo = null;
    const latestVersion = info?.version || app.getVersion();
    if (updateCheckMode !== "silent") {
      sendUpdateStatus(`La tua versione è già aggiornata. Ultima versione: v${latestVersion}.`, 3600);
    }
  });

  autoUpdater.on("download-progress", (progress) => {
    if (!win.webContents.isDestroyed()) {
      win.webContents.send("demo-update-progress", {
        percent: Math.max(0, Math.min(100, progress.percent || 0)),
        transferred: progress.transferred || 0,
        total: progress.total || 0,
        bytesPerSecond: progress.bytesPerSecond || 0
      });
    }
  });

  autoUpdater.on("update-downloaded", (info) => {
    downloadedUpdateInfo = info;
    if (!win.webContents.isDestroyed()) {
      win.webContents.send("demo-update-downloaded", { version: info.version });
    }
    sendUpdateStatus(`Aggiornamento v${info.version} scaricato. Riavvia per installarlo.`, 9000);
  });

  autoUpdater.on("error", (error) => {
    if (updateCheckMode !== "silent") {
      sendUpdateStatus(error?.message || "Controllo aggiornamenti non riuscito.", 4200);
    }
  });

  ipcMain.on("demo-open", (event, demoKey) => {
    if (event.sender !== win.webContents) return;

    const nextUrl = demoUrls[demoKey];
    if (nextUrl) {
      loadDemoUrl(demoKey);
    }
  });

  ipcMain.handle("demo-check-updates", async (event) => {
    if (event.sender !== win.webContents) return { ok: false, message: "Richiesta non valida." };

    if (!app.isPackaged) {
      return { ok: false, message: "Il controllo aggiornamenti funziona nella versione installata." };
    }

    try {
      const result = await checkForUpdates({ silent: false });
      const currentVersion = app.getVersion();
      const latestVersion = result?.updateInfo?.version || currentVersion;
      const updateAvailable = latestVersion !== currentVersion;
      return {
        ok: true,
        currentVersion,
        latestVersion,
        updateAvailable,
        message: updateAvailable
          ? `Ultima versione: v${latestVersion}. Aggiornamento disponibile.`
          : `La tua versione è già aggiornata. Ultima versione: v${latestVersion}.`
      };
    } catch (error) {
      return { ok: false, message: error?.message || "Controllo aggiornamenti non riuscito." };
    }
  });

  ipcMain.handle("demo-download-update", async (event) => {
    if (event.sender !== win.webContents) return { ok: false, message: "Richiesta non valida." };

    if (!app.isPackaged) {
      return { ok: false, message: "Il download aggiornamenti funziona nella versione installata." };
    }

    try {
      autoUpdater.autoDownload = false;
      autoUpdater.autoInstallOnAppQuit = false;
      if (!pendingUpdateInfo) {
        const result = await checkForUpdates({ silent: false });
        const currentVersion = app.getVersion();
        const latestVersion = result?.updateInfo?.version || currentVersion;
        if (latestVersion === currentVersion) {
          return {
            ok: true,
            updateAvailable: false,
            latestVersion,
            message: `La tua versione è già aggiornata. Ultima versione: v${latestVersion}.`
          };
        }
      }

      await autoUpdater.downloadUpdate();
      return {
        ok: true,
        updateAvailable: true,
        latestVersion: pendingUpdateInfo?.version,
        message: `Download aggiornamento v${pendingUpdateInfo?.version || ""} avviato.`
      };
    } catch (error) {
      return { ok: false, message: error?.message || "Download aggiornamento non riuscito." };
    }
  });

  ipcMain.handle("demo-install-update", (event) => {
    if (event.sender !== win.webContents) return { ok: false, message: "Richiesta non valida." };

    if (!downloadedUpdateInfo) {
      return { ok: false, message: "Nessun aggiornamento scaricato." };
    }

    autoUpdater.quitAndInstall(false, true);
    return { ok: true };
  });

  ipcMain.handle("demo-get-app-version", (event) => {
    if (event.sender !== win.webContents) return "";
    return app.getVersion();
  });

  loadDemoUrl(defaultNotebookKey);

  setTimeout(() => {
    checkForUpdates({ silent: true }).catch(() => {});
  }, 4500);

  async function checkForUpdates({ silent }) {
    if (!app.isPackaged) {
      return { updateInfo: { version: app.getVersion() } };
    }

    updateCheckMode = silent ? "silent" : "manual";
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;

    try {
      return await autoUpdater.checkForUpdates();
    } finally {
      updateCheckMode = "manual";
    }
  }
}

function windowClearTimeout(timerId) {
  if (timerId) clearTimeout(timerId);
}

function createAssetDataUrl(assetPath, mimeType) {
  try {
    return `data:${mimeType};base64,${fs.readFileSync(assetPath).toString("base64")}`;
  } catch {
    return "";
  }
}

function getCurtainClient(demoKey) {
  const client = curtainClients[demoKey] || curtainClients[defaultNotebookKey];
  return {
    ...client,
    steps: client.steps || defaultCurtainSteps
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createNativeCurtainHtml(demoKey = defaultNotebookKey) {
  const client = getCurtainClient(demoKey);
  const logoShape = client.logoShape || "compact";
  const logoSizeClass = demoKey === "chemical" ? "is-chemical-logo" : "";
  const clientLogo = client.logo
    ? `<img class="client-logo ${logoSizeClass}" src="${client.logo}" alt="${escapeHtml(client.label)}">`
    : `<div class="client-initials">${escapeHtml(client.initials || "AI")}</div>`;
  const stepsJson = JSON.stringify(client.steps);

  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root {
      color-scheme: dark;
      --accent: ${client.accent};
      --accent-soft: ${client.accentSoft};
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #020305;
      color: #f6f7fb;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      width: 100%;
      height: 100%;
      margin: 0;
      overflow: hidden;
      background: #020305;
    }

    body {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 52px;
      background:
        radial-gradient(circle at 22% 18%, var(--accent-soft), rgba(2, 3, 5, 0) 30%),
        radial-gradient(circle at 76% 74%, rgba(25, 195, 125, 0.1), rgba(2, 3, 5, 0) 28%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0) 38%),
        #020305;
    }

    main {
      width: min(760px, 88vw);
      min-height: 580px;
      position: relative;
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 32px;
      padding: 44px 52px 34px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 18px;
      background:
        linear-gradient(145deg, rgba(15, 18, 25, 0.94), rgba(6, 8, 13, 0.92)),
        rgba(8, 10, 15, 0.96);
      box-shadow:
        0 28px 90px rgba(0, 0, 0, 0.52),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }

    main::before {
      content: "";
      position: absolute;
      inset: -1px;
      background:
        radial-gradient(circle at 18% 0%, var(--accent-soft), transparent 28%),
        linear-gradient(90deg, rgba(255, 255, 255, 0.12), transparent 36%, rgba(255, 255, 255, 0.08));
      opacity: 0.72;
      pointer-events: none;
    }

    main::after {
      content: "";
      position: absolute;
      right: -90px;
      top: -120px;
      width: 280px;
      height: 280px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 50%;
      box-shadow:
        0 0 0 36px rgba(255, 255, 255, 0.018),
        0 0 0 76px rgba(255, 255, 255, 0.012);
      pointer-events: none;
    }

    .topline,
    .center,
    .bottom {
      position: relative;
      z-index: 1;
    }

    .topline {
      display: grid;
      justify-items: center;
      gap: 18px;
      text-align: center;
    }

    .brand {
      display: grid;
      justify-items: center;
      gap: 18px;
      min-width: 0;
      width: min(560px, 100%);
    }

    .mark {
      width: min(260px, 58vw);
      height: 190px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(255, 255, 255, 0.13);
      border-radius: 22px;
      padding: 24px 30px;
      background:
        radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.16), transparent 32%),
        rgba(255, 255, 255, 0.045);
      box-shadow: 0 18px 52px rgba(0, 0, 0, 0.3), 0 0 42px var(--accent-soft);
      overflow: hidden;
    }

    .mark.is-horizontal {
      width: min(390px, 62vw);
      height: 190px;
      padding: 28px 34px;
    }

    .mark.is-vertical {
      width: min(210px, 42vw);
      height: 330px;
      padding: 16px;
      border-radius: 24px;
    }

    .mark.is-compact {
      width: min(260px, 48vw);
      height: 190px;
      padding: 26px;
    }

    .client-logo {
      display: block;
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      object-position: center;
      filter: drop-shadow(0 0 22px var(--accent-soft));
    }

    .client-logo.is-chemical-logo {
      width: 72%;
      height: 72%;
      max-width: 72%;
      max-height: 72%;
    }

    .client-initials {
      color: #fff;
      font-size: 24px;
      font-weight: 880;
    }

    .client-text {
      min-width: 0;
      max-width: 620px;
    }

    .client-text h1 {
      margin: 0;
      color: #f8f9ff;
      font-size: 30px;
      font-weight: 850;
      line-height: 1.08;
      letter-spacing: 0;
    }

    .client-text p {
      margin: 8px 0 0;
      color: #aeb7c9;
      font-size: 13px;
      line-height: 1.45;
      text-wrap: balance;
    }

    .status-pill {
      height: 34px;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 0 14px;
      white-space: nowrap;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.055);
      color: #dfe6f7;
      font-size: 12px;
      font-weight: 760;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 18px var(--accent);
      animation: pulse 1.1s ease-in-out infinite;
    }

    .center {
      display: grid;
      align-content: center;
      gap: 18px;
      width: min(560px, 100%);
      justify-self: center;
    }

    .loader-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
    }

    .loader-title {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      color: #f6f7fb;
    }

    .loader-percent {
      color: #aeb7c9;
      font-size: 12px;
      font-weight: 780;
      font-variant-numeric: tabular-nums;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      border: 2px solid rgba(255, 255, 255, 0.16);
      border-top-color: var(--accent);
      animation: spin 0.82s linear infinite;
    }

    .progress {
      width: 100%;
      height: 8px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.075);
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.26);
    }

    .progress::before {
      content: "";
      display: block;
      width: 44%;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), var(--accent), rgba(25, 195, 125, 0.82));
      box-shadow: 0 0 26px var(--accent-soft);
      animation: progress 1.55s ease-in-out infinite;
    }

    .message-box {
      min-height: 54px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.045);
    }

    .message-box p {
      margin: 0;
      color: #dce3f2;
      font-size: 14px;
      font-weight: 650;
      line-height: 1.45;
      transition: opacity 180ms ease, transform 180ms ease;
    }

    .message-box p.is-changing {
      opacity: 0;
      transform: translateY(4px);
    }

    .bottom {
      display: grid;
      justify-items: center;
      text-align: center;
      grid-template-columns: 1fr;
      align-items: center;
      gap: 10px;
      color: #7f8798;
      font-size: 11px;
      line-height: 1.4;
    }

    .security {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .security-icon {
      width: 20px;
      height: 20px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #06120d;
      background: #19c37d;
      font-size: 12px;
      font-weight: 900;
    }

    .brand-note {
      margin: 0;
      text-align: center;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes progress {
      0% {
        transform: translateX(-110%);
      }

      100% {
        transform: translateX(245%);
      }
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 0.55;
        transform: scale(0.92);
      }

      50% {
        opacity: 1;
        transform: scale(1);
      }
    }
  </style>
</head>
<body>
  <main>
    <section class="topline">
      <div class="brand">
        <div class="mark is-${escapeHtml(logoShape)}">${clientLogo}</div>
        <div class="client-text">
          <h1>${escapeHtml(client.label)}</h1>
          <p>${escapeHtml(client.context)}</p>
        </div>
      </div>
      <div class="status-pill">
        <span class="status-dot"></span>
        Ambiente riservato
      </div>
    </section>

    <section class="center">
      <div class="loader-line">
        <div style="display:flex;align-items:center;gap:11px;">
          <div class="spinner"></div>
          <p class="loader-title">Preparazione della chat aziendale</p>
        </div>
        <div class="loader-percent" id="percent">68%</div>
      </div>
      <div class="progress"></div>
      <div class="message-box">
        <p id="message">${escapeHtml(client.steps[0])}</p>
      </div>
    </section>

    <section class="bottom">
      <div class="security">
        <span class="security-icon">✓</span>
        <span>Contesto cliente protetto e interfaccia in preparazione</span>
      </div>
      <p class="brand-note">InAR AI</p>
    </section>
  </main>
  <script>
    const steps = ${stepsJson};
    const message = document.getElementById("message");
    const percent = document.getElementById("percent");
    let index = 0;
    let value = 68;

    window.setInterval(() => {
      index = (index + 1) % steps.length;
      value = value >= 96 ? 71 : value + Math.floor(Math.random() * 7) + 3;
      message.classList.add("is-changing");
      window.setTimeout(() => {
        message.textContent = steps[index];
        percent.textContent = value + "%";
        message.classList.remove("is-changing");
      }, 180);
    }, 1050);
  </script>
</body>
</html>`;
}

app.setName(appTitle);
app.setPath("userData", path.join(app.getPath("appData"), profileName));
app.setAppUserModelId("it.em.inar-ai");
app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
