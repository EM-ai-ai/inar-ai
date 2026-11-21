# InAR AI

Applicazione desktop e portale di distribuzione riservati a InAR, versione **v0.1.16**.

- Sito protetto: [inar-ai.vercel.app](https://inar-ai.vercel.app)
- Repository: [EM-ai-ai/inar-ai](https://github.com/EM-ai-ai/inar-ai)
- Release: [v0.1.16](https://github.com/EM-ai-ai/inar-ai/releases/tag/v0.1.16)

All'apertura l'app mostra il loader personalizzato InAR e carica `InAR - Progetti`. La sidebar permette di passare rapidamente anche a `InAR AI - DIP` e `InAR - Gare`, mantenendo la stessa sessione protetta e il sistema di mascheramento. Nel footer mostra nome ed email dell'account in uso senza salvare o trasmettere questi dati.

Quando il controllo automatico conferma una nuova versione, l'app apre un pannello di aggiornamento obbligatorio con download, avanzamento, gestione degli errori e riavvio finale. L'uscita tecnica `Ctrl + Shift + U` vale soltanto per la sessione corrente e non viene mostrata nell'interfaccia.

## Struttura

- [[./Codice App AI InAr]] — codice Electron, dipendenze locali e risorse grafiche.
- [[./site]] — sito protetto, presentazione delle funzionalità e download.
- [[./api]] — accesso protetto e canale aggiornamenti.
- [[./AVVIO-E-DISTRIBUZIONE.md]] — istruzioni di avvio e distribuzione.

La versione generalista originale rimane separata e non viene modificata.

## Stato

- Nome applicazione: **InAR AI**
- Versione: **0.1.16**
- Destinazione iniziale: **InAR - Progetti**
- Aree disponibili: **Progetti**, **DIP**, **Gare**
- Logo e icona: logo ufficiale InAR
- Repository e release: `EM-ai-ai/inar-ai`
- Download degli installer: direttamente dalle GitHub Releases
- Sito: distribuito tramite Vercel, senza utilizzare la sua banda per gli installer

## Correzione del banner (0.1.16)

Il banner di Progetti, DIP e Gare aderisce alla fascia superiore. L'intestazione
della chat riserva la stessa altezza del banner, così messaggi, riferimenti alle
fonti e campo della domanda rimangono utilizzabili sotto di esso. L'altezza si
adatta alle finestre più basse.

La verifica isolata `npm.cmd run check:layout` usa Chrome headless, contenuti
fittizi e un profilo temporaneo separato. Controlla le tre aree, quattro dimensioni,
scorrimento, rotellina e accessibilità dei controlli. Non avvia Electron né accede
all'app installata o alla sessione Google dell'utente. Richiede Chrome già
installato e Node.js 22 o successivo; `INAR_LAYOUT_BROWSER` permette di indicare
l'eseguibile su altri PC.
