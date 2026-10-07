# Mossbound

Roguelite in stile Archero per telefono, in un solo file HTML5 (`index.html`): canvas 2D, JavaScript dentro un'unica funzione `(()=>{ ... })();`, musica ed effetti sonori generati dal codice, nessuna libreria esterna (solo i font da Google Fonts). Autore: Denis.

## Regole del progetto

- Parla sempre in italiano con Denis. Tutti i testi del gioco sono in italiano.
- Il gioco deve piacere anche ai bambini: chiaro, colorato, mai frustrante all'inizio.
- Stile grafico deciso: un mix tra Clash Royale (forme robuste, contorni scuri spessi, colori pieni, materiali "da giocattolo") e Archero 2 (leggibilità in battaglia, luci cinematografiche, effetti spettacolari). Il pavimento resta più spento; personaggi, pericoli e premi devono risaltare.
- I personaggi devono essere coerenti in tutte le direzioni (davanti, lato, dietro): ogni parte resta attaccata al punto giusto del corpo. Prima di inserire un personaggio nuovo, mostrare a Denis le quattro direzioni affiancate.
- Segno distintivo dell'eroe: un bastoncino di muschio verde acceso in bocca, solo nella schermata iniziale e nella intro, mai in battaglia.
- Prima di cambiare qualcosa di grosso, chiedere a Denis. Quando dice "annota", si annota e basta.

## Mappa del file `index.html`

Il file ha circa 6.700 righe. Le sezioni sono segnate da commenti `// ---------- nome ----------` o da blocchi `// =====`:

- definizioni (nemici `ET`, layout, abilità `SK`), setup della partita (`newRun`, `buildRoom`), input, audio
- UI e meta: oggetti, carte, casse (`rollChest`, `grant`, `openChest`, `revealCard`), salvataggio (`SAVE`, chiave `cripta_save_v1` in localStorage)
- arene e coppe (`ARENAS`: soglia coppe, capitolo, difficoltà `diff`)
- stanze evento, élite, tutorial; IA dei nemici; ingressi dei boss; `update(dt)` (logica a ogni fotogramma)
- disegno: primitive, rig umanoide, creature, ambienti (`ENV`, temi per zona), luci (`drawLighting`), `render()` in fondo al file
- capitoli 3 e 4, nemici nuovi, stanze speciali (oro, prova del coraggio, stanza buia)
- compagni (`PETS`, `SAVE.pets`), abilità speciali degli eroi (`ULT`), pass di stagione, sfida del giorno
- momenti chiave (morte al rallentatore, replay del colpo finale), trailer/intro (`INTRO`, `playIntro`)
- meta 2: eroi, talenti, set, evoluzioni, missioni, traguardi, impostazioni; aure delle evoluzioni (`AURA`, `startAura`)
- negozio, cammino delle coppe, casse gemelle (Mimic), kit effetti, guida (`fillGuide`)

Dettagli utili:
- Difficoltà: `hpMul()` (vita nemici), `DMG()` (danno), `bossMul()` (vita boss), moltiplicati per `G.diff` dell'arena.
- La stanza è 360×640 (`AW`, `AH`), area giocabile tra `L`, `R`, `TOP`, `BOT`.
- `LOWFX` riduce gli effetti sui telefoni lenti; ogni effetto nuovo deve rispettarlo.
- Le funzioni dichiarate si possono "avvolgere" (es. `{const _u=update;update=function(dt){_u(dt);...}}`): il file lo fa già in più punti.

## Test automatici (cartella `tests/`)

Servono Node e Python. Una volta sola: `npm install` e poi `npx playwright install chromium`.

`tests/mk.py` crea `tests/test.html`: il gioco con in più `window.__E(codice)`, che esegue codice dentro il gioco. Gli script poi lo aprono in un browser senza finestra:

- `run.js <modalità> <coppe> <invincibile 1/0> <nome> [velocità] [eroe] [compagno]`: un giocatore automatico fa una partita intera (es. `node run.js arena 700 1 c3 6 druida lucciola`) e salva le schermate stanza per stanza.
- `meta2.js`: eroi, compagni, talenti, oggetti, nome, codice di salvataggio, pausa, tastiera, rinascita, intro.
- `menu2.js`: tocca ogni bottone di ogni scheda e controlla che non ci siano errori.
- `mig.js`: salvataggi vecchi o rovinati e schermi di misure diverse.
- `pets.js`: sblocco e miglioramento dei compagni. `perf.js`: tempi di aggiornamento e disegno.
- Altri: `boss1x.js` (sconfitta del boss a velocità reale), `wheelsk.js` (ruota + scelta abilità), `aura.js` (aure delle evoluzioni), `look.js` (schermate dei 4 capitoli), `fresh.js` (primo avvio).

Dopo ogni modifica: rifare almeno una partita automatica per capitolo, `meta2.js` e `menu2.js`, e guardare le schermate.

## Fatto di recente (versione 42)

- Compagni: fino a 2 insieme (`SAVE.pets.eq`, `PET_SLOTS`), solo a mano con «Porta» / «Lascia»; il terzo prende il posto del primo. I vecchi salvataggi con `sel` vengono convertiti da `petEq()`.
- Collaudo: puntino Eroe solo se il miglioramento si può pagare; niente puntini doppi nella barra laterale; accesso giornaliero mai in automatico prima della prima partita; traguardi e missioni aspettano la fine del boss; niente Prova del coraggio dopo la stanza 2 per i principianti; nome dell'abilità speciale piccolo sopra l'eroe; Druida più forte (+20% vita e attacco, rigenerazione 1,5/s, foglie più veloci: da regolare giocando).
- Scheletro: balestra, tira mentre cammina, scatto ogni 5 secondi (mentre scatta lo scudo non para).
- Boss: `bossLvl()` fa crescere la vita un po' a ogni arena e con le coppe, e li rende più rapidi (fino a ×1,38); dalle arene 5–8 anello di sfere con avviso rosa, dalle 9–12 anche un ventaglio mirato. La prima arena resta com'era.
- Micro animazioni: nemici che si schiacciano, monete che volano al contatore e al portafoglio, saltello al livello nuovo, scia bianca sulla barra della vita, cancello che si alza con polvere, bottoni che si schiacciano, puntini che spuntano una volta.
- Arene grandi: le stanze di combattimento normali sono 460×820 (`BIG`), lo schermo resta 360×640 (`VW`, `VH`); `AW`, `AH`, `R`, `BOT` ora cambiano per stanza con `setWorld()`. Telecamera morbida (`G.vx`, `G.vy`, `camStep`), paesaggio del capitolo oltre i muri (`bakeBackdrop`), frecce ai bordi per i nemici fuori schermo. Boss, eventi, tutorial e intro restano 360×640. Impostazioni → Stanze: Grandi / Piccole.
- Nuovi test: `sk.js` (scheletri), `bossx.js` (crescita boss), `micro.js` (micro animazioni), `big.js` (arene grandi), `dirs.js` (foglio dei personaggi in tutte le direzioni).
- Personaggi: Denis preferisce lo stile attuale (proposta nuova scartata). Corretta la punta del cappuccio, che da dietro finiva sotto la testa: ora sta sempre in cima e si piega un po' all'indietro.
- Nota: in `meta2.js` i controlli «codice caricato» e «salvataggio dopo ricarica» falliscono anche sulla versione 41: problema del test, non del gioco.

## Da fare (annotato con Denis, non ancora fatto)

1. Possibile in futuro: dividere `index.html` in più file con uno script che li riunisce per la pubblicazione.
2. Da regolare giocando: forza del Druida, crescita dei boss, misura delle arene grandi.
