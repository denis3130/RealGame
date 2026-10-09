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

Il file ha circa 6.600 righe. Le sezioni sono segnate da commenti `// ---------- nome ----------` o da blocchi `// =====`:

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
- Altri: `boss1x.js` (sconfitta del boss a velocità reale), `wheelsk.js` (ruota + scelta abilità), `aura.js` (aure delle evoluzioni), `look.js` (schermate dei 4 capitoli), `fresh.js` (primo avvio), `mostri.js` (fogli dei nemici zombie in `sprite/mostri/`).

Dopo ogni modifica: rifare almeno una partita automatica per capitolo, `meta2.js` e `menu2.js`, e guardare le schermate.

## Fatto di recente (versione 41)

- Prova del coraggio: la porta non si apriva più (corretto). Ruota + scelta abilità: i tocchi venivano ignorati (corretto).
- Barra del boss che si svuota, lampeggia e si rompe alla sconfitta.
- Icone nuove di monete e gemme (SVG in `COIN_SVG`, `GEM_SVG`).
- Aure delle 6 evoluzioni.
- Compagni: si parte senza; carte compagno nelle casse (circa 35% legno, 60% argento, 90% oro); sblocco a 6/15/25 carte (Muschietto/Lucciola/Draghetto) o con 60/150/300 gemme; livelli con carte (`PET_NEED`) e oro. Premio delle 500 coppe: 10 carte Lucciola. Valori scelti da Claude, da regolare giocando.
- Grafica: personaggi non scuriti dalla luce della stanza, colori più ricchi e luce al centro (`gradeRoom`), ciuffi d'erba che ondeggiano e si piegano al passaggio (`drawTufts`).

## Branch `nuovi-oggetti` (da approvare con Denis)

- L'arciere non ha più la punta sul cappuccio (`HERO.hoodTip:false`).
- Arco delle spine tolto, al suo posto l'Arco del tuono (`arco_tuono`, epico): arco blu con un fulmine lungo i flettenti, frecce che richiamano fulmini (`P.light`). I salvataggi vecchi passano da `arco_spine` ad `arco_tuono` in `migrateItems`. Il Set della Foresta ora è Arco ricurvo + Corazza di muschio.
- Icone disegnate a mano per ogni oggetto (`ICON_ART` dentro `itemSVG`). Sull'eroe: funghetto sulla Corazza di muschio. La Giubba di cuoio è il vestito base con i colori del cuoio.
- Faretra in diagonale sulla schiena, diversa per ogni arma (`QUIV`), con munizioni diverse anche in volo (foglie per l'Arco ricurvo, punta a fulmine per l'Arco del tuono, alette blu per la Balestra).
- La balestra in mano all'eroe è uguale alla sua carta: calcio di legno con gemma blu, flettenti d'acciaio, staffa davanti, dardo carico (sparisce solo mentre ricarica).
- Anello del gelo eterno: alone di ghiaccio leggero e scia di ghiaccio che si scioglie camminando (`frostTick`, `drawFrostTrail`).
- Sprite in `sprite/` (icone e fotogrammi dell'eroe), spiegati in `sprite/LEGGIMI.md`.
- Nemici della modalità zombie, non ancora nel gioco: `sprite/mostri/disegno_mostri.js` (Zombie della cripta, Zombie strisciante, Zombie minatore, Segugio infernale, boss Il Becchino), scheletri 3D con arti a due ossa e ordine di disegno fisso, così niente si sovrappone male mentre si muovono. Fogli rifatti con `tests/mostri.js`; spiegazioni in `sprite/mostri/LEGGIMI.md`.

## Da fare (annotato con Denis, non ancora fatto)

1. Compagni: massimo 2 equipaggiati insieme; equipaggiamento solo manuale (oggi il primo sbloccato viene messo in automatico: togliere).
2. Scheletro con lo scudo: arma a distanza, si muove e spara insieme, scatto che si ricarica ogni 5 secondi.
3. Boss più forti man mano che salgono le coppe: oggi crescono solo a scalini (arene 1–4 base, 5–8 circa ×1,8 vita, 9–12 da ×2,9 a ×4,3) e solo nei numeri. Idea: crescita graduale per arena e boss più "svegli" nelle arene alte (attacchi più rapidi, meno pause, una mossa in più).
4. Arene più grandi dello schermo, con telecamera che segue l'eroe e paesaggio del capitolo visibile oltre i muri (stile Hades). È la modifica più profonda: tutto oggi presume una stanza grande come lo schermo.
5. Rifare l'eroe e gli altri personaggi, coerenti in tutte le direzioni.
6. Micro animazioni (idee da scegliere): bottoni che si schiacciano al tocco, monete che volano al portafoglio, contatore dell'oro che rimbalza, puntini rossi che pulsano una volta sola; in battaglia nemici che si schiacciano quando colpiti, monete raccolte che volano al contatore, cancello che si apre con polvere, saltello dell'eroe al livello nuovo, barra della vita con scia bianca.
7. Dal collaudo: troppi avvisi insieme (puntini rossi ovunque, accesso giornaliero subito dopo la intro, riquadri missioni sopra la barra del boss); Prova del coraggio possibile già alla stanza 2 per i principianti; nome dell'abilità speciale gigante a metà schermo; Druida più debole degli altri eroi.
8. Possibile in futuro: dividere `index.html` in più file con uno script che li riunisce per la pubblicazione.
