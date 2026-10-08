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

Il file ha circa 7.650 righe (versione 44). Le sezioni sono segnate da commenti `// ---------- nome ----------` o da blocchi `// =====`:

- definizioni (nemici `ET`, layout, abilità `SK`), setup della partita (`newRun`, `buildRoom`), input, audio
- UI e meta: oggetti, carte, casse (`rollChest`, `grant`, `openChest`, `revealCard`), salvataggio (`SAVE`, chiave `cripta_save_v1` in localStorage)
- arene e coppe (`ARENAS`: soglia coppe, capitolo, difficoltà `diff`)
- stanze evento, élite, tutorial; IA dei nemici; ingressi dei boss; `update(dt)` (logica a ogni fotogramma)
- disegno: primitive, rig umanoide, creature, ambienti (`ENV`, temi per zona), luci (`drawLighting`), `render()` in fondo al file
- capitoli 3 e 4, nemici nuovi, stanze speciali (oro, prova del coraggio; la stanza buia c'è ancora nel codice ma è spenta: `rollDark()` restituisce sempre `false`)
- compagni (`PETS`, `SAVE.pets`), abilità speciali degli eroi (`ULT`), pass di stagione, sfida del giorno
- momenti chiave (morte al rallentatore, replay del colpo finale), trailer/intro (`INTRO`, `playIntro`)
- meta 2: eroi, talenti, set, evoluzioni, missioni, traguardi, impostazioni; aure delle evoluzioni (`AURA`, `startAura`)
- negozio, cammino delle coppe, casse gemelle (Mimic), kit effetti, guida (`fillGuide`)
- in fondo, prima dell'ultima riga (`newRun();...`): occhi del teschio (`drawBeastEyes`), blocco «BOSSES 2» (boss nuovi), nemici vivi (`ELIFE`), suoni nuovi (`SFX2`) e atmosfera (`AMB`), manina della prima partita (`showHand`)

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

## Fatto di recente (versioni 42–44)

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
- Anteprima (non ancora nel gioco, da valutare con Denis): boss più ricchi e animati in `anteprime/boss2.js`. Per costruire la pagina di prova `anteprime/boss_nuovi.html` (con una galleria e il bottone Prima/Dopo) si usa `python3 anteprime/mk_boss.py`. Nell'anteprima: il Golem resta semplice (solo qualche crepa); ogni boss ha effetti presi dal suo mondo (`B2G`, `B2T`); le mosse cambiano l'arena (`ENV2`, `b2react`: ostacoli che tremano e si crepano, sassi o ghiaccioli dal soffitto, torce che cambiano colore, erba bruciata, legno che prende fuoco, segni sul pavimento che restano: radici, fiori, brina, veleno, pozzanghere nuove, monete). Test `tests/b2moves.js`. Poi (8 ottobre): Mimic rifatto in stile Dark Souls (`drawMimicDS`: cassa marcia su lunghe gambe pallide con le ginocchia al contrario, braccia lunghe con artigli, coperchio che respira, denti, lingua; si alza dalla cassa nell'entrata), senza più gli effetti dorati; pavimento della stanza della Strega rifatto (`bakeWitchFloor`: pedana rituale con il suo simbolo, radici grosse che si tuffano sotto le lastre, funghi viola luminosi); entrata dell'Idra più inquietante (occhi gialli sott'acqua, teste che escono una alla volta a scatti, poi il corpo; stessa cosa nel tuffo); dettagli dei boss nascosti mentre stanno ancora entrando. Test `tests/mimicsheet.js` (Mimic in 4 direzioni), `tests/witchroom.js`, `tests/hydrarise.js`, `tests/b2qa.js` (strisce di fotogrammi per ogni boss). Se Denis approva, il contenuto di `boss2.js` va incollato in `index.html` prima dell'ultima riga (`newRun();...`).
- Corretto nel gioco: durante l'entrata l'Idra era invisibile (le teste venivano create solo all'inizio del combattimento).
- Versione 43 (8 ottobre), tutto approvato da Denis:
  - Boss nuovi nel gioco: il contenuto di `anteprime/boss2.js` è incollato in fondo a `index.html` (blocco «BOSSES 2»). `BOSS2` resta come interruttore. L'anteprima con la galleria si può ancora costruire con `anteprime/mk_boss.py`.
  - Nemici normali vivi (`ELIFE`): respiro (gli slime tremolano), particelle del loro materiale, polvere ai passi, una stellina sopra la testa prima di sparare o caricare. Usa lo stesso motore di particelle dei boss (`b2tick`, `b2emit`, `b2draw`). Test `enemies.js`.
  - Suoni (`SFX2`, `AMB`):
    - Atmosfera continua: vento dell'abisso e respiro profondo della bestia, più suoni per capitolo (gocce e ossa, lava, bolle e rane, ghiaccio e vento) e un ringhio lontano ogni tanto. Nel menu un'atmosfera più leggera, con il fuoco dell'accampamento.
    - Suoni per le reazioni dell'arena: crolli, ghiaccioli, incendi, torce magiche, brina, radici, fiori, ostacoli che si crepano.
    - Voci: Mimic (risveglio, passi, respiro) e Idra (sibilo quando le teste escono, bolle sott'acqua).
    - I suoni seguono la telecamera a sinistra e a destra.
    - Volumi misurati con `audio.js` (picco e volume medio accanto ai suoni vecchi).
  - Menu in pietra della cripta: tutti i blu dei pannelli convertiti in grigi caldi e color osso (stessa luminosità), inchiostro marrone scuro come nel gioco, bordo d'osso sui riquadri principali.
  - Arene grandi: 2–3 ostacoli in più negli spazi vuoti (mai vicino al cancello, alla partenza o ad altri ostacoli; non nelle stanze dei boss né negli eventi).
  - Linea sul cancello: la cima del muro di fondo è ora una cresta di pietre rotte (con muschio, cenere o neve), il buio sopra è più profondo, niente linea nera sulla cornice.
  - Prima partita: una manina senza parole (`showHand`, `SAVE.handSeen`) che mostra il dito che trascina; sparisce al primo tocco e non torna più. Test `hand.js`.
- Teschio sopra il cancello: nel capitolo 1 (muschio) è identico a quello della palude (stesse ossa, stesse colature, niente macchie di muschio), cambia solo il colore degli occhi (`BDPAL.moss.eye`). Gli occhi sono disegnati dopo le luci della stanza (`drawBeastEyes`), con un respiro leggero.
- Nota: in `meta2.js` i controlli «codice caricato» e «salvataggio dopo ricarica» falliscono anche sulla versione 41: problema del test, non del gioco.

- Versione 44 (8 ottobre), nel gioco:
  - Stanza buia tolta per sempre (decisione di Denis): `rollDark()` restituisce sempre `false`, tolta la sfida del giorno «Notte fonda», tolta dalla guida, la Lucciola ora «fa luce intorno a te». Non riproporre stanze buie, nemmeno nella Discesa.
  - Arciere (l'eroe classico): tolta la punta dal cappuccio (`HERO.hoodTip:false`, richiesta di Denis), in tutte le direzioni, anche nel menu e nella intro. Gli altri con la punta (Druida, Mercante e i nemici incappucciati) la tengono. L'eroe nuovo dall'immagine di Denis è stato scartato (vedi «Da fare» 7).
  - Teschio sopra il cancello (arene grandi, `bakeBackdrop`): ora si intravede appena, coperto da un velo scuro, e non ha più luce negli occhi (niente `drawBeastEyes` attivo: gli occhi `k:'big'` e la crepa di lava sul cranio non vengono più aggiunti a `bdFx`). Richiesta di Denis; lo ripenserà lui più avanti. Il teschio del menu e quello dei menu laterali non sono cambiati.
  - Collaudo: una partita automatica per capitolo fino alla stanza 10 senza errori, `menu2.js` senza errori, `dirs.js` guardato.

## Dove sta il lavoro

- Ramo `lavori-in-sospeso` (tutto salvato e caricato su GitHub, non ancora unito a `main`).
- Gioco pubblicato per provarlo sul telefono: https://claude.ai/artifact/7inhZ4hyu1MyjLE5TYFkSK (si aggiorna ripubblicando `index.html` allo stesso indirizzo).
- Anteprime pubblicate (pagine di prova, il gioco vero non le contiene):
  - La Discesa (mappa): https://claude.ai/artifact/QAocTWmJLvf97YuYQDc4Yk — file `anteprime/discesa.html` (pagina a sé).
  - Epico (pavimento e battaglie): https://claude.ai/artifact/S8sZHqt9LbkDny8P78GYZU — `python3 anteprime/mk_epico.py`.
  - La Bestia dell'Abisso: https://claude.ai/artifact/FPW7CX8vJst28tJzyr2pt2 — `python3 anteprime/mk_beast.py`.
  - Eroe nuovo (scartato): https://claude.ai/artifact/VHZ9vBv2nhayWDQPWvHZNX — `python3 anteprime/mk_eroe.py`.
  - Boss nuovi (già nel gioco dalla versione 43): https://claude.ai/artifact/7b7Vtw5eWZ45oF5gWqTHWE — `python3 anteprime/mk_boss.py`.
- Le anteprime si costruiscono incollando un file `.js` dentro una copia di `index.html` (prima dell'ultima riga) con un pannellino di bottoni; i file `.html` costruiti non si salvano su GitHub (`.gitignore`). Se `index.html` cambia, vanno ricostruite.

## Gusti di Denis (imparati lavorando)

- Prima un'anteprima separata da provare sul telefono; nel gioco vero solo dopo il suo sì.
- Colori sempre adatti al mondo o al boss, mai messi a caso.
- Pavimento: niente cose sparse a caso; la vita (muschio, cenere, neve…) deve nascere dalle fughe e dalle crepe.
- Telecamera: alle uccisioni normali un movimento leggerissimo; il rallentatore sull'ultimo nemico della stanza va bene; la scossa quando si apre uno strato della Discesa va bene.
- Camminate: niente saltelli da un gradino all'altro; i vestiti non devono muoversi a caso.
- Frecce: piccole e devono partire dall'arco, non dal centro del corpo; tirando in su la freccia non deve vedersi sopra il personaggio.
- Niente stanze buie. Niente riferimenti alla Bestia nella progressione.
- L'eroe resta nello stile classico del gioco: i personaggi presi da immagini esterne (ritagliati o ridisegnati) non lo hanno convinto.

## Da fare (annotato con Denis, non ancora fatto)

1. Possibile in futuro: dividere `index.html` in più file con uno script che li riunisce per la pubblicazione.
2. Da regolare giocando: forza del Druida, crescita dei boss, misura delle arene grandi. Da provare sul telefono vero: fluidità con tutti gli effetti nuovi e volume dei suoni.
3. Boss nuovo, molto più avanti nel gioco: la bestia scheletrica gigante che sta sotto l'arena (le costole ai lati, il teschio con le corna dietro la porta, la coda di vertebre in basso: `bakeBackdrop`). L'idea di Denis è che il paesaggio stesso si risvegli e diventi il boss. Anteprima pronta (non ancora nel gioco): `anteprime/beast.js`, pagina di prova con `python3 anteprime/mk_beast.py` → `anteprime/bestia.html` (bottoni Combatti, Fase 2, Fase 3, Vita ∞, Capitolo). La Bestia (`beast`): il teschio si affaccia sopra il muro con la mascella dentro l'arena (lì si colpisce), arena grande quanto lo schermo; fase 1 costole dai lati e ventaglio di ossa, fase 2 soffio dell'abisso e pioggia di ossa, fase 3 coda che spazza e pavimento che crolla in buchi permanenti. Pericoli in `G.beH`. Seconda versione (richiesta di Denis): entrata con la telecamera larga sull'abisso (`G.beCam`, `beCamNow`), le costole che cadono nel buio (`G.beRibs`, paesaggio ridisegnato senza costole/teschio con `G.bdNoRibs`/`G.bdNoSkull`), due mani d'osso che si aggrappano al muro ai lati del cancello, il teschio che sale e sfonda il cancello (`G.gateBroken`: finché non lo batti non passi). Mani (`G.beHands`, `HACT`): schiacciata con l'ombra che insegue, doppia schiacciata, spazzata a terra, artigli dall'alto che lasciano solchi, dito che pugnala a passi verso l'eroe. Combattimento nell'arena grande con la telecamera allontanata (zoom 0,74). Test `tests/beast.js`. Da decidere con Denis: in quale capitolo/arena, vita e danni.
4. Teschio sopra il cancello: per ora velato e senza luce negli occhi (versione 44). Denis ci ripenserà più avanti (prima non gli piaceva quello del capitolo 1); partire da una sua foto o idea.
5. Nuova progressione al posto delle coppe: «La Discesa» (seconda versione, la prima con la Bestia è stata scartata da Denis: niente riferimenti al boss). Anteprima (non nel gioco): `anteprime/discesa.html`. Mappa al contrario (richiesta di Denis): si parte in basso dall'ingresso con l'arco di pietra e si sale sullo schermo, ma la profondità cresce e il buio aumenta salendo (metri incisi sul muro a sinistra); luci del mondo in ogni strato (funghi, cascate di lava, baccelli, cristalli) che si vedono brillare anche nel buio più in alto, raggi caldi dall'ingresso, polvere nella luce della lanterna, esplosione di luce e scossa quando si apre uno strato, niente barra «Luce», niente fune; l'eroe scende a passi sui gradini (senza saltelli: richiesta di Denis; gambe, lanterna che dondola, si gira verso dove va, schiacciata all'arrivo), polvere e sassolini dai gradini, gradini che si accendono al passaggio, luci del mondo che si ravvivano quando passa; 12 strati (le 12 arene, alcune rinominate: Grotte di Brina, Forgia Sepolta, Gelo Senza Fondo) fino a «Il Fondo». Più scendi più è buio: la luce della lanterna dell'eroe si restringe, sotto lo strato raggiunto c'è il buio quasi totale, nomi e profondità nascosti (???) finché non ti avvicini. Più in basso: catene, gabbie, tacche sul muro, scritte («TORNA SU»…), occhi nel buio che si ritraggono dalla luce. 1–3 stelle per strato, non si perde mai niente; 9 lanterne da accendere con le stelle (premi, e quel tratto di pozzo resta illuminato per sempre); 13 pagine del diario di Ilda (3 stelle per strato), una esploratrice scesa prima; in fondo al pozzo una lucina sempre visibile. Da decidere con Denis.
   Proposta di gameplay per i livelli (8 ottobre, scritta a Denis in chat, non ancora confermata):
   - 12 strati × 5 piani = 60 livelli, più «Il Fondo»; ogni piano è una partita corta da 5 stanze (4–5 minuti). Sulla mappa lo strato resta il medaglione grande, i piani sono gradini più piccoli in mezzo.
   - Schema di ogni strato: 1 Ingresso (partita normale, si conoscono i nemici), 2 Sorpresa (una stanza speciale sicura: oro, prova del coraggio o casse gemelle), 3 Primo guardiano (il primo boss del mondo: Golem, Salamandra, Re Rospo, Yeti), 4 Il mondo si muove (la regola dello strato), 5 Custode dello strato (il boss grande: Strega, Fabbro, Idra, Regina; batterlo apre lo strato sotto).
   - Una regola per strato, senza buio: 1 Cripta di Muschio partita base; 2 Cuore del Vulcano crepe di lava che si accendono a ritmo; 3 Palude delle Lucciole pozzanghere che rallentano e ninfee come passaggio sicuro; 4 Grotte di Brina ghiaccioli dal soffitto con l'ombra che avvisa; 5 Cripta Risvegliata radici che spuntano dove stai fermo troppo e ti bloccano un secondo; 6 Vulcano Furioso meteore e pavimento che si spacca per qualche secondo; 7 Palude Avvelenata nubi di veleno che si spostano piano; 8 Ghiacciaio Eterno raffiche di vento avvisate dalla neve; 9 Cripta delle Ombre nemici che colpiti si dividono in due; 10 Forgia Sepolta lame che girano e presse a tempo; 11 Palude Maledetta un altare a ogni stanza con una scelta (es. più oro ma nemici più forti); 12 Gelo Senza Fondo pavimento che si ghiaccia e si rompe, buchi fino alla fine della stanza. Strati 1–4 «Le grotte» (si impara), 5–8 «I risvegliati» (élite in ogni piano, boss con una mossa in più), 9–12 «Il profondo».
   - Il Fondo: partita speciale con i 4 mondi mescolati e un guardiano finale nuovo da inventare insieme (non la Bestia). Dopo: «Oltre il Fondo» potrebbe essere la modalità infinita di adesso, rinominata.
   - Stelle per piano (non si perdono mai, si riprova lo stesso piano): ★ finisci, ★★ senza rinascere, ★★★ una piccola sfida diversa per piano scritta prima di entrare («non farti colpire dal boss», «finisci in meno di 4 minuti», «raccogli tutti i cristalli»); 180 stelle in tutto.
   - Premi: 12 lanterne (una in cima a ogni strato, circa ogni 15 stelle) e 13 pagine del diario di Ilda (una per strato con almeno 12 stelle su 15, l'ultima sul Fondo). Nell'anteprima della mappa sono ancora 9 lanterne e le pagine a 3 stelle per strato: da allineare.
   - Chi ha già le coppe parte dallo strato della sua arena, con i piani sopra già fatti a 1 stella.
   - Domande aperte per Denis: 5 o 3 piani per strato? Piani da 5 stanze o le 10 di adesso? Le regole degli strati vanno bene? (La sua unica risposta finora: niente stanze buie.)
6. Anteprima «Epico» (non nel gioco): `anteprime/epico.js`, pagina di prova con `python3 anteprime/mk_epico.py` → `anteprime/epico.html` (bottoni Gioca, Prima/Dopo, Capitolo, Vita ∞). Pavimento: niente più ciuffi e macchie a caso; muschio (Cripta), muschio con cristallini (Cristalli), muschio e fango (Palude), cenere con braci (Vulcano) o neve e brina (Ghiacci) crescono nelle fughe tra le lastre e nelle crepe, a chiazze: di più negli angoli, lungo i muri e intorno agli ostacoli (`seamLife`, `G.slabs`, `G.slabCracks`); ciuffi d'erba e fiorellini dove si incontrano quattro lastre, e i ciuffi che ondeggiano nascono solo lì (`G.seamJ`). Lastre (`slabDetail`, prima di emblema e ombre dei muri): ombra morbida dentro ogni fuga, macchie diverse su ogni lastra, alcune un po' più alte o sprofondate, lastre spaccate (la crepa diventa una fuga dove cresce la vita) con a volte un angolo mancante riempito (muschio ed erba, cenere con brace, neve), un sentiero più consumato dal cancello in giù, mucchietti ai piedi dei muri (terra e muschio, cenere, fango, neve), riflessi sul ghiaccio e bruciature nel vulcano. Battaglie: lampo e scintille al tiro, colpo con raggiera, uccisione con anello d'urto, lampo e scintille, zoom della telecamera leggerissimo (`G.pz` 0,004; élite 0,012; richiesta di Denis); élite con pausa e scossa; l'ultimo nemico della stanza cade al rallentatore con un anello grande; scia allo scatto (`G.efx`, `epicDraw`). Da decidere con Denis se metterlo nel gioco (ultime richieste fatte: zoom più leggero e pavimento migliore in tutte le arene, entrambe fatte nell'anteprima).
7. Eroe nuovo: scartato da Denis (né le pose ritagliate dalla sua immagine né la versione ridisegnata lo ispirano). I file delle prove restano in `anteprime/` (`riferimento_eroe.jpg`, `cut_eroe.py`, `eroe_sprite/`, `eroe_sprite.js`, `eroe_stile.js`, `mk_eroe.py`).
