function clampPercent(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(100, Math.round(numericValue)));
}

function shouldShowRequiredUpdatePanel({ updateAvailable, downloaded, dismissed }) {
  return Boolean((updateAvailable || downloaded) && !dismissed);
}

function getRequiredUpdatePanelContent({
  mode,
  currentVersion = "",
  latestVersion = "",
  message = "",
  percent = 0,
  total = ""
}) {
  const safePercent = clampPercent(percent);
  const versionLabel = latestVersion ? `v${latestVersion}` : "la nuova versione";

  if (mode === "downloading") {
    return {
      eyebrow: "Aggiornamento richiesto",
      title: `Download ${safePercent}%`,
      message: total
        ? `Scaricamento di ${versionLabel}: ${safePercent}% di ${total}.`
        : `Scaricamento di ${versionLabel}: ${safePercent}%.`,
      actionLabel: `Download ${safePercent}%`,
      actionDisabled: true,
      showSpinner: true,
      progress: safePercent,
      currentVersion,
      latestVersion
    };
  }

  if (mode === "install") {
    return {
      eyebrow: "Aggiornamento pronto",
      title: `${versionLabel} è pronta`,
      message: "Riavvia InAR AI per completare l'installazione e utilizzare la versione più recente.",
      actionLabel: "Riavvia e installa",
      actionDisabled: false,
      showSpinner: false,
      progress: 100,
      currentVersion,
      latestVersion
    };
  }

  if (mode === "error") {
    return {
      eyebrow: "Aggiornamento richiesto",
      title: "Download non riuscito",
      message: message || "Non è stato possibile scaricare l'aggiornamento. Controlla la connessione e riprova.",
      actionLabel: "Riprova",
      actionDisabled: false,
      showSpinner: false,
      progress: null,
      currentVersion,
      latestVersion
    };
  }

  if (mode === "installing") {
    return {
      eyebrow: "Installazione in corso",
      title: "Riavvio di InAR AI",
      message: "L'applicazione si chiuderà e completerà automaticamente l'aggiornamento.",
      actionLabel: "Riavvio...",
      actionDisabled: true,
      showSpinner: true,
      progress: 100,
      currentVersion,
      latestVersion
    };
  }

  return {
    eyebrow: "Aggiornamento richiesto",
    title: `Aggiorna InAR AI a ${versionLabel}`,
    message: message || "Installa la versione più recente per mantenere l'app compatibile, protetta e pienamente funzionante.",
    actionLabel: "Scarica aggiornamento",
    actionDisabled: false,
    showSpinner: false,
    progress: null,
    currentVersion,
    latestVersion
  };
}

module.exports = {
  clampPercent,
  getRequiredUpdatePanelContent,
  shouldShowRequiredUpdatePanel
};
