# Avvio e distribuzione di InAR AI

## Avvio locale su Windows

```powershell
Set-Location "C:\Users\edoar\Desktop\EM\5-Agency-AI-Website\PROGETTI\Sinarconsulting-Architetto-Papa-Giulio\App AI - InAr\Codice App AI InAr"
npm.cmd start
```

L'app richiede una connessione a Internet. Il profilo locale è separato da quello della demo generalista e viene salvato con il nome `InAR AI`.

Per azzerare la sessione e ripetere l'accesso, usare `Ctrl + Shift + L` mentre l'app è aperta.

## Build locale

```powershell
Set-Location "C:\Users\edoar\Desktop\EM\5-Agency-AI-Website\PROGETTI\Sinarconsulting-Architetto-Papa-Giulio\App AI - InAr\Codice App AI InAr"
npm.cmd run build:win
```

## Sito e release

Il sito e l'applicazione condividono il repository `EM-ai-ai/inar-ai`. Il sito viene pubblicato su Vercel, mentre i file pesanti vengono scaricati direttamente dalle GitHub Releases.

- Sito: [inar-ai.vercel.app](https://inar-ai.vercel.app)
- Release corrente: [v0.1.10](https://github.com/EM-ai-ai/inar-ai/releases/tag/v0.1.10)

La pubblicazione di un tag `v*` avvia la creazione automatica degli installer Windows. L'app controlla gli aggiornamenti tramite `/api/updates`, che legge la release più recente senza trasferire gli installer attraverso Vercel.

Le variabili richieste sono `SITE_PASSWORD`, `AUTH_SECRET`, `GITHUB_RELEASE_OWNER` e `GITHUB_RELEASE_REPO`; i loro valori non devono essere salvati nel repository.
