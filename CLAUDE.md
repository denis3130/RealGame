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
- Arene grandi: le stanze di combattimento, boss compresi, sono 460×820 (`BIG`), lo schermo resta 360×640 (`VW`, `VH`); `AW`, `AH`, `R`, `BOT` ora cambiano per stanza con `setWorld()`. Telecamera morbida (`G.vx`, `G.vy`, `camStep`); durante l'entrata del boss inquadra il boss. Frecce ai bordi per i nemici fuori schermo. Eventi, tutorial e intro restano 360×640. Impostazioni → Stanze: Grandi / Piccole.
- Fuori dall'arena (`bakeBackdrop`, `BDPAL`, `drawBackdrop`): l'arena è uno sperone sopra un abisso buio, dentro la cassa toracica di una bestia gigante. Ci sono costole ai lati, il teschio con le corna e gli occhi accesi dietro la porta, e la coda di vertebre in basso. Intorno: pali con teschi, mucchi di teschi con candele, occhi che sbattono nel buio e fuochi fatui. Nel fondo dell'abisso un fiume che brilla: lava, ghiaccio, palude o muschio a seconda del capitolo. Le cose più lontane dall'arena sono più scure. Con `LOWFX` niente animazioni, solo luci fisse.
- Nuovi test: `sk.js` (scheletri), `bossx.js` (crescita boss), `micro.js` (micro animazioni), `big.js` (arene grandi), `bossbig.js` (tutti i boss nell'arena grande), `bd.js` (paesaggio fuori dall'arena nei 4 capitoli), `dirs.js` (foglio dei personaggi in tutte le direzioni).
- Personaggi: Denis preferisce lo stile attuale (proposta nuova scartata). Corretta la punta del cappuccio, che da dietro finiva sotto la testa: ora sta sempre in cima e si piega un po' all'indietro.
- Cristalli: prima il conteggio della partita (`G.gemsRun`) ripartiva da zero a ogni stanza e si perdevano. Ora si sommano per tutta la partita e anche quelli rimasti a terra vengono contati (test `gems.js`).
- Tutorial tolto del tutto: niente schermata di benvenuto con il dito alla prima partita, niente suggerimenti in partita (`ingameHint`), niente indicazioni nel menu (`coach`). La intro/trailer resta (si rivede dalle impostazioni).
- Grafica più "piantata":
  - Ostacoli: ombre morbide (`castShadow` con `SHB`); sotto ogni ostacolo il pavimento si scurisce, si crepa e ci sono schegge (`groundPatch`); davanti alla base muschio, cenere, fango o neve con sassi in rilievo (`groundFront`, `footMat`).
  - Gli ostacoli fermi sono disegnati una volta in un'immagine (`rockSprite`), più scuri alla base e illuminati dall'alto. Quelli animati (`ROCK_LIVE`: braciere, cristallo, calderone…) si disegnano ancora a ogni fotogramma.
  - Pavimento: piastrelle a lastra con bordo chiaro e bordo scuro, angoli consumati e ombra lungo tutti i muri. Pozzanghere come acqua con bordo bagnato e riflesso; calcinacci senza contorno.
  - Pareti: cornice in cima, zoccolo alla base, pilastri sotto le torce e negli angoli, bordo pulito sui muri laterali.
  - La sfumatura scura ai bordi copre tutto lo schermo (prima si vedeva una riga sui telefoni alti).
  - Test `vetrina.js`: gli stessi ostacoli di ogni capitolo, sempre nella stessa posizione, visti da vicino.
- Effetto WOW esteso:
  - Arena: il teschio dietro il muro sfuma nel buio e nella nebbia, senza più la linea netta sopra il cancello.
  - Pavimento (`renderFloor`): lastre di misure diverse (1×1, 2×1, 1×2, 2×2) con rilievo, macchie, scheggiature e crepe; cornice incisa lungo i muri; al centro un medaglione con il teschio della bestia inciso (non nelle stanze con le rune del boss né negli eventi); 2–3 crepe che lasciano uscire la luce del capitolo. Luce viva in `drawFloorGlow` (`G.floorGlow`, `G.floorCracks`), spenta con `LOWFX`.
  - Schermata principale: nel paesaggio dell'accampamento (`campBg`) c'è il teschio con le corna della bestia dietro la collina della cripta, con le costole ai lati, velato dalla foschia. Gli occhi brillano del colore della modalità (in `drawCamp`).
  - Menu laterali (Eroe, Bottega, Cammino, Profilo): sotto i pannelli c'è la tela `#mbgCv` (`drawMenuBg`, `MBG`): abisso blu notte, costole che entrano dai bordi, teschio in alto con gli occhi accesi, nebbia che scorre e lucine che salgono. Con `LOWFX` resta ferma.
- Nota: in `meta2.js` i controlli «codice caricato» e «salvataggio dopo ricarica» falliscono anche sulla versione 41: problema del test, non del gioco.

## Da fare (annotato con Denis, non ancora fatto)

1. Possibile in futuro: dividere `index.html` in più file con uno script che li riunisce per la pubblicazione.
2. Da regolare giocando: forza del Druida, crescita dei boss, misura delle arene grandi.
3. Boss nuovo, molto più avanti nel gioco: la bestia scheletrica gigante che sta sotto l'arena (le costole ai lati, il teschio con le corna dietro la porta, la coda di vertebre in basso: `bakeBackdrop`). L'idea di Denis è che il paesaggio stesso si risvegli e diventi il boss.
4. Linea sul cancello: sotto il teschio gigante, dove il teschio incontra la cima del muro sopra il cancello, si vede ancora una specie di linea. Va sfumata meglio (vedi la sfumatura in `bakeBackdrop` e la cornice del muro in `bakeWalls`).
