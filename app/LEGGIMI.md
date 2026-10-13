# L'app per il telefono

Mossbound come app web da installare, servita da GitHub Pages dal ramo `gh-pages`: **https://denis3130.github.io/RealGame/**
(richiesta di Denis del 13 ottobre: «mi dai l'app da scaricare sul telefono?»; Denis ha un iPhone).

## Installarla

- **iPhone**: aprire l'indirizzo con **Safari** → Condividi (il quadrato con la freccia) → «Aggiungi alla schermata Home» → Aggiungi.
  Si apre a schermo intero come un'app, con l'icona dell'Arciere col bastoncino di muschio.
- **Android**: aprire l'indirizzo con Chrome → «Installa app».
- L'app ha una memoria sua, separata dal link di claude.ai: per portarsi dietro i progressi, nel gioco di prima ≡ → Impostazioni →
  Salvataggio → «Copia codice», poi nell'app ≡ → Impostazioni → Salvataggio → «Carica codice» e incollarlo.

## Attivarla (una volta sola, lo fa Denis)

Su github.com, nel progetto `denis3130/RealGame`: Settings → Pages → «Build and deployment»: Source «Deploy from a branch»,
Branch `gh-pages`, cartella `/ (root)` → Save. Dopo un paio di minuti l'indirizzo funziona.

## Aggiornarla

Dopo ogni versione nuova del gioco (quando si ripubblica `index.html` su claude.ai): `python3 app/mk_app.py --pubblica`.
Costruisce `app/sito/` e la carica su `gh-pages` (un commit in più, mai forzato). L'app si aggiorna da sola alla prima apertura con
internet; senza internet si gioca con la copia tenuta nel telefono.

## Come è fatta

- `mk_app.py`: prende `index.html` (lo ricostruisce con `build.py`) e in `app/sito/` mette una copia con quello che su claude.ai mette
  la cornice o che serve a un'app: la riga `viewport` (senza, l'iPhone mostra la pagina rimpicciolita), `viewport-fit=cover` e la barra
  di stato trasparente (il gioco si tiene già lontano dalla tacca con `env(safe-area-inset-*)` su `#wrap`), il manifest
  (`manifest.webmanifest`: nome, schermo intero, icone), l'icona per iPhone (`apple-touch-icon`), niente menu del tocco lungo, e il
  service worker. `index.html` e la pagina su claude.ai non cambiano.
- `sw.js` (scritto da `mk_app.py`, con la versione = impronta del gioco e delle icone): la prima volta tiene da parte pagina, icone e
  manifest (i font quando servono); a ogni apertura chiede la pagina nuova alla rete per al massimo 4 secondi, se non arriva usa quella
  tenuta da parte; gli altri file prima dalla copia tenuta da parte. Le copie vecchie si buttano quando arriva una versione nuova.
- `icona.js`: l'icona disegnata dal gioco stesso (`drawRig` → `EROE.arciere`, di tre quarti, col bastoncino di muschio) su uno sfondo
  della cripta con la luce verde del muschio; `icona-1024.png`, `icona-512.png`, `icona-192.png`, `icona-180.png` (iPhone).
  Si rifanno con `python3 tests/mk.py && node app/icona.js`.
- `prova.js`: serve `app/sito` da questo computer e controlla riga viewport, manifest, icone, service worker, il gioco che si riapre
  senza internet, nessun errore (`python3 app/mk_app.py && node app/prova.js`).
- Più avanti, se il gioco esce nei negozi (Play Store, App Store) si parte da questa stessa versione web (account da sviluppatore:
  Google 25 dollari una volta, Apple 99 dollari all'anno, e per l'iPhone serve un Mac).
