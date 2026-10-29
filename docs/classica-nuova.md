# Classica nuova (anteprima, 20 ottobre)

Denis: «ascolta ora pensiamo a migliorare la modalità classica […] per rendere l'esperienza di gioco migliore e non pallosa come la scalata
delle coppe con le arene», poi «ok creami le cose che mi hai elencato su una cosa a parte senza intaccare il progetto principale». Ramo
`classica-nuova` (da `piano-maestro`); il gioco vero non cambia: `src/js/94-classica-nuova.js` **non** è in `src/ordine.txt`. Pagina:
`python3 anteprime/mk_classica.py [--build]` → `anteprime/classica.html` (parte con un salvataggio suo, già dopo la creazione dell'eroe),
pubblicata su https://claude.ai/artifact/K6E5QMv5pxKkt61MCFJsba («Mossbound · Classica nuova»: si aggiorna ripubblicando
`anteprime/classica.html`). Prova: `python3 anteprime/mk_classica.py --test --build && node tests/classica.js [menu|stanze|furia|rarita|evo|nemesi|torre|corsa|ondate|trappole|3d|ponte|fontana|cristallo|albero]`.

## Il ponte sospeso di assi, il rimborso, le mosse leggendarie (26–27 ottobre)

Denis, sui progressi: «…aggiungi una specie di cosa che ha clash royale come proseguimento con le coppe, ma in questo caso saranno con le
assi di legno che servono per costruire il ponte, il ponte deve essere fatto meglio rendilo più grande e allontana le isole di tanto l'una
dall'altra, migliorando la posizione del ponte e l'animazione di quando si mettono nel loro apposito posto ma ancora da sbloccare»; alle
domande: «Modifiche, poi nel gioco» (prima tutte le modifiche nell'anteprima, poi, se gli piace, tutta la Classica nuova nel gioco e
nell'app), «Assi e premi sul ponte», «Ponte sospeso di assi», «Volano e si inchiodano»; sull'albero: «Rimborso» e «Mosse più spettacolari».

**Le assi** (al posto delle pietre, stessi numeri): 2 per ogni stanza o piano superato, 20 per il custode (una vittoria 40), l'Incubo
niente; ponti da 100 a 200 (+10 a isola, `cnBrNeed`); i salvataggi tengono le pietre come assi (`cnPlanks`, `cnBridgeAdd` in 94).

**I premi del cammino** (come le coppe di Clash Royale): a ogni quarto del ponte un premio, preso quando le assi ci arrivano
(`cnBrTh`, `cnBrPrize`): sul primo balcone un sacco d'oro (120 + 40 a isola), sul secondo cristalli (6 + 2 a isola) o Essenza di muschio
(10 + 4 a isola) un ponte sì e uno no, sul terzo una cassa (legno, poi argento, poi oro), dove il ponte finisce una cassa migliore (argento,
oro, poi cristallo). I premi vanno nel salvataggio alla fine della partita (la cassa in un posto libero, nel quinto o in oro se sono pieni:
`earnChest(tipo,true)`); la fine della partita li elenca sotto il ponte («Premio del ponte: …», «Premio di fine ponte: …»). Fino a quando lo
spettacolo non li apre, i contatori di oro e cristalli e i posti delle casse li tengono indietro (`cnPend`, `renderGold` e `renderGearRow`
avvolti).

**Il ponte grande** (sezione 8 di 94, `CNB`; 27 ottobre, Denis: «nel ponte non fare le piccole isolette di mezzo ma un ponte più grande ed
quindi anche isola ecc più grandi. le ricompense saranno a sinistra»): le isole sono lontane 1000 invece di 380 (`CNI_GAP`), con la
prospettiva vera e la nebbia del cielo in lontananza (`cnIslHaze`). Niente più rocce in mezzo: un ponte solo, largo 84 (prima 68), dalle due
torri di tronchi sull'isola (`cnBrPortal`: ognuna due tronchi legati con la corda, alta 106, col tettuccio, lo stendardo dell'arena dopo, una
lanterna sul braccio, il cavo che scende sul davanti fino al picchetto; due travi in mezzo, quella bassa sopra le teste) fino ai due pali
dell'isola dopo (`cnBrStumps`); 64 assi (16 a quarto: ogni asse disegnata vale un sessantaquattresimo del ponte) che pendono con una pancia sola
(`cnBrGeo`, `cnDeckZ`), le funi del parapetto con i fili verticali, i due **cavi grandi** che scendono dalle cime delle torri e raggiungono il
parapetto verso la fine, coi tiranti (`cnRailZ`, `cnCableZ`, `cnRopeP`: le funi lunghe più grosse vicino e più sottili lontano). **I premi a
sinistra**: a un quarto, a metà e a tre quarti un **balcone** attaccato al lato sinistro (`cnBalcony`: il pavimento di quattro assi su due
travi che vengono da sotto il ponte, il parapetto sui tre lati di fuori, il palo con la lanterna accesa quando le assi ci arrivano, due funi su
fino al cavo), col premio sopra un terzo più grande (sacco, cristalli, vasetto d'essenza, cassa che apre il coperchio); il premio di fine
ponte a sinistra sull'isola dopo; il conto delle assi a destra, dove il lavoro si ferma. Le assi in 3D con le venature, i chiodi e il bordo
illuminato (`cnPlankDraw`), quelle che mancano appena accennate (`cnPlankGhost`). Dipinto una volta a telecamera ferma (`cnBrBake`), dal vivo
mentre il dito trascina o durante lo spettacolo. L'eroe ci cammina sopra seguendo la pancia del ponte (`cnRoute`, `cnDeckZ`). **Isole più
grandi**: la telecamera più vicina (`CNI_WIDE` 86% della larghezza invece del 62%, `CNI_UPN` 420 invece di 720: a riposo si vede meno ponte,
il resto col dito), così isola, eroe, custode e ponte sono un terzo più grandi (390×844: k da 1,62 a 2,24; 390×763: da 1,34 a 1,74; 360×640:
da 0,85 a 1,10); l'immagine dell'isola più alta per le torri (`cnIslImg`).

**Il ponte più bello** (27 ottobre, Denis: «fallo ancora meglio il ponte»; sezione 8 di 94). Con questa telecamera (che guarda a nord dall'alto)
tutto quello che sta sul bordo del ponte finisce nella stessa colonna dello schermo: le funi e i cavi vicini, alti e larghi in prospettiva,
passano sopra le cose lontane dello stesso bordo. Per questo le cose nuove stanno un po' fuori dal ponte. **La struttura**: sotto le assi una
crociera di travi a zigzag, scura, che si vede solo dove le assi mancano (il telaio che aspetta le assi sopra l'abisso); i traversi ogni quattro
assi escono oltre le assi (fino a 51 dal mezzo, `CNB.je`) e i pali del parapetto ci stanno sopra, appena fuori dalle assi (47 invece di 44,
`CNB.pp`), più grossi; le funi un po' più grosse. **Le lanterne** (`cnLamp2`): appese a un braccio di ferro col suo puntone, fuori dal parapetto
(`CNB.lo`), più grandi (gabbia con la finestrella a croce, tetto, gancio, fondo), accese quando le assi ci arrivano, con la fiamma e la luce
dal vivo (`cnBrLamps`); solo a destra, ogni due pali: a sinistra fanno luce i balconi (i loro archi coprirebbero le lanterne). **Il vestito
del mondo**: dalle teste dei traversi pende quello del mondo dell'isola (`cnBrHang`, `cnBrHangAt`): muschio (1), una catena col carbone
acceso (2), una liana con le foglie e a volte un fiore (3), ghiaccioli (4); le stesse cose sotto il davanti dei balconi; sulle teste di
alcune assi un cuscino di muschio, la cenere con la brace, un ciuffo d'erba o un mucchietto di neve (`cnBrTuft`); sulla cima di ogni palo il
muschio, la brace, la liana col fiore o il cappuccio di neve (`cnBrDressPost`). Quello che pende dal lato destro e le lanterne si disegnano
dopo i cavi (`late` in `cnBrDeck`): da questa telecamera la parte vicina dei cavi ci passerebbe sopra pur non essendo davanti; a sinistra solo
dove nessun balcone sta davanti. **Le torri vestite dal loro mondo** (`cnPortalBase`, `cnPortalVine`, `cnPortalRoof`, `cnPortalBeams`, nell'immagine
dell'isola): muschio sulla pietra, sul tetto e che pende dalla trave bassa (1); la pietra crepata dal calore col fuoco dentro e la punta del
tetto nera di fuliggine (2); la liana che sale a spirale sui tronchi col suo fiore e pende dal tetto e dalla trave (3); neve sulla pietra, sui
tetti e sulle travi, ghiaccioli sotto i tetti e sotto la trave (4). **I balconi**: la pedana del premio più piccola e scura (raggio 10,5
invece di 13,5) con un anello del colore del premio. Il conto delle assi un po' più a destra (non copre le lanterne). Tempi: a telecamera ferma
niente cambia (il ponte è un'immagine copiata); dal vivo (col dito, nello spettacolo, mentre l'eroe cammina) un ponte costa circa 1 ms in più nel browser delle prove (da 1,8–2,4 a 2,6–3,4 ms; la crociera senza contorno, i ghiaccioli, le foglie e gli anelli delle catene in un tracciato solo), un fotogramma intero col dito il 10–18% in più (60 fotogrammi trascinando, tre giri; tolte le pozze di luce sulle assi, che costavano quasi quanto il resto). Le prove della camminata, del
colpo di dito, dello spettacolo e della pillola «Incubo» nell'anteprima ora aspettano che la cosa finisca invece di un tempo fisso: il browser
delle prove disegna un fotogramma in 40–100 ms e il tempo del gioco avanza al massimo di 1/30 di secondo a fotogramma.

**Lo spettacolo** (`cnBrShow*`; dal 27 ottobre, Denis: «fai in modo che il pg non costruisca il ponte ma le assi si infilano da sole»; prima
l'eroe portava il sacco sul ponte e inchiodava ogni asse): tornato dalla partita, l'eroe aspetta sulla sua isola e le assi vanno al ponte da
sole, una dopo l'altra (`CN_SHOW`: volo 0,42 s, una ogni 0,11 s, assestamento 0,3 s; fino alla metà più svelte quando le assi sono tante):
ognuna arriva volando bassa dalla sua isola sopra quelle già posate, girandosi, con una lucina che la segue, e si infila al suo posto
(`cnBrFlyLive`); si assesta, polvere, i chiodi entrano da soli con una scintilla, il colpo del legno sale di nota a ogni asse fino al balcone
dopo. La telecamera segue il fronte del lavoro (`cnBrShowCam`). Quando le assi arrivano a un balcone si fermano, la telecamera lo inquadra e
il premio salta fuori (`cnPrizeOut`; la cassa vola al suo posto sotto l'eroe, `cnChestFly`) e i contatori si muovono, poi le assi riprendono;
finito il ponte la telecamera va sull'isola dopo, che esce dal buio e si accende (col premio di fine ponte), e l'eroe ci corre: entra nella
scena dove sta la telecamera e lei lo segue (`cnBrShowEnd(true)`); se il ponte non è finito la telecamera torna da lui. Un tocco finisce
subito lo spettacolo (tutto al suo posto), e lo finiscono anche «Gioca», il cambio di modalità e una partita nuova.

**Isole ancora più grandi** (27 ottobre, Denis: «il ponte e l'isola li voglio ancora più grandi»): la telecamera ancora più vicina, così
isola, ponte, eroe e custode sono più grandi insieme. L'isola può arrivare a tutta la larghezza dello schermo (`CNI_WIDE` 1 invece di 0,86)
e a riposo sopra l'isola si vede meno ponte (`CNI_UPN` 260 invece di 420: il resto col dito); l'isola sta un poco più in basso del suo posto
(il sasso sotto va un poco dietro la scritta «Da conquistare»), così le torri e il cartello col numero restano sotto il nome dell'arena.
Grandezza (k): 390×763, il telefono di Denis, da 1,74 a 2,16 (+25%); 390×844 da 2,24 a 2,61 (+16%); 360×640 da 1,10 a 1,38; 430×932 da 2,24
a 2,61.

**La vita intorno e il ponte vivo** (27–28 ottobre, Denis: «manca qualcosa a parer mio», poi alla domanda «Cosa ti manca sulle isole e sul
ponte?»: «Vita intorno, Ponte vivo»; sezioni 7 e 8 di 94).
- **Il vento** (`cnWind`): una brezza sempre (0,42) e ogni 11 secondi circa una raffica che viene e va (fino a 1); due raffiche su tre si
  sentono piano (un soffio basso, un fischio sottile nelle funi e uno scricchiolio: `cnBrSnd('vento')`). Soffia verso est: bandiere e
  stendardi vanno tutti da quella parte (prima le bandiere delle torri guardavano una a destra e una a sinistra).
- **Il ponte nel vento**: l'immagine del ponte fermo (`cnBrBake`) tiene solo l'impalcato (assi, travi, pali, balconi) e le funi del
  parapetto; sopra, a ogni fotogramma, quello che il vento muove (`cnBrRopes`): i cavi grandi che ondeggiano piano (di più in mezzo, niente
  dove sono legati) coi tiranti, le bandierine che sbattono spinte a est e si alzano coi bordi che si gonfiano, gli stendardi dei balconi
  con un'onda che scende (`cnCloth`: ogni banda nella sua luce mentre si gira) e le loro funi fino al cavo, il muschio, le liane e le catene
  col carbone appesi ai lati che dondolano (i ghiaccioli no), le lanterne sui bracci che dondolano piano attorno al gancio, con la loro luce
  (`cnLampTh`). Le funi del parapetto restano nell'immagine: legate ai pali ogni quattro assi, da questa telecamera si muoverebbero troppo
  poco per vedersi. Sulle torri, fuori dall'immagine dell'isola (`cnPortalLive`): la bandiera del tettuccio che sventola, lo stendardo
  dell'arena dopo, la corda davanti, la lanterna sul braccio che dondola. La luce delle lanterne delle torri ora sta sulle lanterne (prima
  era disegnata in un punto sbagliato dell'isola). Quello che è fuori dallo schermo non si disegna (`cnOff`, i pezzi delle funi in
  `cnRopeP`): il ponte dal vivo, col dito che trascina, costa meno di prima.
- **Il ponte sotto l'eroe** (`ISL.sw`, `cnSwayStep`, `cnSwayFn` dentro `cnBrMap`: sposta ogni punto del ponte): mentre l'eroe corre sul ponte
  le assi cedono sotto i suoi piedi (fino a 6 dove sta lui) e tutto il ponte ondeggia di lato (4,2) e un poco su e giù, di più in mezzo,
  niente alle estremità; le assi bussano a ogni passo della corsa e ogni mezzo secondo circa il legno scricchiola (`cnCreak`); arrivato, il
  ponte si ferma in circa tre secondi e torna nella sua immagine. L'eroe e i compagni vanno col ponte; le lanterne dondolano di più.
- **La vita di ogni mondo** (`cnIslLife`): nel muschio lucciole che si accendono e si spengono e farfalle dei colori dei fiori che svolazzano
  e ogni tanto planano (`cnFireflies`, `cnButterflies`); nel vulcano braci che salgono dalla lava, dal cratere e dalle crepe e vanno col
  vento (bianche, poi arancio, poi rosse), il fumo del cratere, bolle di lava che si gonfiano, brillano e scoppiano nella pozza (`cnEmbers`,
  `cnSmoke`, `cnLavaBubbles`); nella palude tre rane sulle foglie di ninfea e sulla riva che respirano, gonfiano la gola e gracidano (si
  sente, piano) e saltano da un posto all'altro, libellule che sfrecciano e si fermano nell'aria sopra la pozza, lucciole (`cnFrogs`,
  `cnDragonflies`); sul ghiaccio luccichii sulla neve e la neve che cade, quella lontana piccola e lenta, quella vicina più grande davanti a
  tutto (`cnGlints`, `cnSnow`). Rane, farfalle, libellule e uccelli in 3D con la telecamera dei mostri. Su un'isola ancora al buio niente.
- **Gli stormi** (`cnFlockStep`, `cnFlockDraw`, `cnBird`): ogni 7–13 secondi 3–5 animali del mondo sull'isola che guardi: rondini blu col
  petto bianco e la gola rossa (muschio), uccellini di fuoco con la loro luce (vulcano), pipistrelli con le ali a due lobi e gli occhi gialli
  (palude), uccelli bianchi (ghiaccio); una volta passano di traverso, alti davanti alle torri del ponte, la volta dopo arrivano da dietro e
  vanno lungo il ponte verso l'isola dopo, sempre più piccoli. Un verso piano quando passano (`cnLifeSnd`).
- **Le nuvole e la nebbia**: nell'abisso, sotto le isole, banchi di nuvole a cumulo dei colori del mondo (la cima chiara di luna, la pancia
  scura illuminata dal mondo, rossa nel vulcano: `cnCloudImg`, tre forme per mondo dipinte una volta) che vanno piano verso est e passano
  con la prospettiva quando si sale verso nord (`cnIslClouds`, solo quelle sopra la riga sotto l'isola); due banchi di nebbia sottile
  sopra la parte lontana del ponte (`cnBrWisps`).
- **Effetti ridotti** (`LOWFX`): niente vento (il ponte tutto nella sua immagine), niente stormi, nuvole e nebbia sul ponte, meno lucciole e
  braci e senza luci, niente farfalle e libellule, metà neve.
- **Misure** (computer di prova senza scheda grafica, 390×844 a 2 pixel a punto, fotogramma fermo col disegno forzato a finire): da circa 27
  a circa 31 ms, quasi tutto nel disegno dei pixel (le nuvole la parte più grande: circa 220 mila pixel copiati a fotogramma); la vita, le
  cose nel vento e le torri meno di mezzo millisecondo ciascuna.

**La mini isola del traguardo** (28 ottobre, Denis: «vedi dove c'è l'isola successiva? vorrei la spingessi più in su ed al suo posto creassi
una mini isola dove il pg si dirigerà come checkpoint e come cosa introduttiva, troverà qualcosa di più bello rispetto alle altre ricompense,
una volta finito fammi vedere un'anteprima veloce»; sezioni 7 e 8 di 94).
- **Dove sta**: l'isola dopo è più su, a 1400 invece di 1000 (`CNI_GAP`); al suo posto, a 1000 (`CNI_MN`), la mini isola (`CNI_MR` 60,
  larga una volta e mezza quanto è profonda: due terzi di un'isola, più larga delle isole perché il ponte grande ci atterra sopra). Il ponte
  di assi finisce lì (`cnBrGeo`: `a1` sul suo bordo, `ae` gli ancoraggi un poco più dentro, dove è larga abbastanza); da lì cinque pietre
  sospese (`st`) vanno fino all'isola dopo. Le pietre hanno la loro prospettiva aggiustata come il ponte (`cnSegAt`, `cnStMap`); `cnChainScr`
  sa dove sta ogni punto del cammino (isola, ponte, mini isola, pietre, isola dopo).
- **Com'è** (`cnMiniImg`, `cnMiniPaint`, dipinta una volta come le isole): un pezzo del mondo dopo, i suoi colori e le sue cose, per far
  vedere cosa arriva (dopo il muschio il vulcano con l'ossidiana, il basalto e le crepe di fuoco; poi la palude con le canne, i ceppi e i
  funghi; poi il ghiaccio con le punte, la neve e un pino; poi il muschio del secondo giro col colore dell'arena). Davanti gli ancoraggi del
  ponte, in mezzo il sentiero, a sinistra l'**altare delle rune** (tre gradini di pietra, le rune del colore dell'arena dopo che brillano),
  a destra il **palo del traguardo** con lo stendardo dell'arena dopo arrotolato sotto la traversa e il pomo d'oro, dietro due **bracieri** dove
  cominciano le pietre. Sotto il sasso che pende, sul bordo i ghiaccioli o le radici.
- **Il tesoro del traguardo** (il premio di fine ponte, `cnBrPrize(i,4)`: `k:'tesoro'`): la cassa di fine ponte di prima (argento, poi oro,
  poi cristallo) **più cristalli e oro** (8+2·arena cristalli, 150+50·arena oro: sul primo ponte cassa d'argento, 8 cristalli e 150 oro).
  Sull'altare in un **raggio di luce** che scende con i granelli che salgono (`cnMiniBeam`): un forziere grande col coperchio a cupola, bande e
  angoli d'oro, la gemma sulla serratura e una sulla cima, monete e cristalli intorno (`cnTreasure3`). Un tocco dice cos'è e quando è tuo;
  sulla fermata della telecamera «TRAGUARDO · Verso …», «Tesoro a 100 assi: cassa, cristalli e oro» e le assi che mancano. Preso, il forziere
  resta aperto e vuoto sull'altare, con un po' di luce d'oro.
- **Lo spettacolo a ponte finito** (`cnBrShowStep`, fasi nuove dopo le assi): l'eroe entra dove è la telecamera e va **alla mini isola**
  (`cnShowWalk`, l'ultimo tratto di corsa leggera), si ferma al suo posto lì (`CNM_HERO`); il **tesoro si apre** per lui (il coperchio che si
  alza, il lampo, monete e cristalli che saltano fuori e ricadono, «Tesoro del traguardo!»; oro e cristalli volano ai contatori, la cassa al suo
  posto) mentre lo **stendardo si srotola** dalla traversa e i bracieri si accendono (`cnMiniUp`, `cnMiniBanner`); poi le **pietre salgono dal
  buio** una dopo l'altra, un poco oltre il loro posto e indietro, con la luce del mondo dopo sotto (`cnStoneUp`, `cnStonesDraw`); l'isola dopo
  esce dal buio e lui ci arriva **saltando di pietra in pietra** (la telecamera con lui dall'inizio). Suoni nuovi: il traguardo (un richiamo
  chiaro e una campana), il tesoro (il coperchio, un accordo che sale, le monete che cadono, un luccichio), ogni pietra che sale (un soffio
  basso e il colpo quando si ferma, una nota più su ogni volta), i piedi sulle pietre (`cnBrSnd('traguardo'|'tesoro'|'pietra'|'salto')`). Un
  tocco finisce subito tutto, come prima.
- **Il cammino** (`cnRoute`): da un'isola all'altra l'eroe passa sul ponte, sulla mini isola e salta di pietra in pietra (ogni salto conta di
  più nel tempo, `CNI_HOPW`: lì va più piano), fino a 3,6 secondi (`cnWalkDur`; prima 2,6). La telecamera si ferma anche sulla mini isola
  (`cnIslStops`, `cnStopNear`, `cnMiniView`: l'eroe lì dove sta sempre sullo schermo); mentre l'eroe cammina le scritte delle fermate non
  si accavallano più con quelle delle isole.
- **Misure** (computer di prova, 390×844 a 2 pixel a punto, la pagina prima e dopo a turno): a riposo sull'isola 31,3 ms contro 30,5; sulla
  mini isola 24–26 contro 24–26 e, a traguardo raggiunto con le pietre e lo stendardo vivi, 32,1 contro 32,0: quasi niente in più.
- **Prova** `node tests/classica.js traguardo` (dove sta, prima del traguardo, il tocco sul tesoro, lo spettacolo intero, il tesoro nel
  salvataggio, dopo il traguardo, il cammino coi salti, gli effetti ridotti); `ponte` aggiornata (1400, il tesoro, la quinta fermata).
- **Prove**: `node tests/classica.js vita` (6 controlli: il vento sopra l'immagine del ponte, il ponte che cede e ondeggia coi passi e gli
  scricchiolii e poi torna nella sua immagine, la vita di ogni mondo, gli stormi nei due modi, i suoni nuovi, gli effetti ridotti);
  `node tests/classica.js ponte` come prima (48).

**Il traguardo più bello** (29 ottobre, Denis alla domanda «cosa possiamo migliorare?»: «Arrivo più bello», «Tesoro più speciale» e
«Mini isola più ricca»; sul tesoro: «Lo stendardo per il menu»; sezioni 7 e 8 di 94).
- **L'arrivo** (`cnBrShowStep`, fase nuova `back`): finite le assi la telecamera torna morbida dall'eroe sulla sua isola (da 0,5 a 1,1 s,
  `A.bk`) e lo segue mentre corre per tutto il ponte fino alla mini isola (prima compariva di colpo a metà ponte); lì la scritta grande
  **«Traguardo raggiunto!»** che rimbalza fuori, coi raggi che girano nel colore dell'arena dopo (`cnShowTitle`), e sotto, quando il tesoro
  si apre, «+ lo stendardo di …»; una **musichetta** sua (`cnBrSnd('fanfara')`: uno squillo di sette note che sale fino al do alto) con la
  campana del traguardo. Le parole del tesoro e la riga in basso non vanno più sopra la scritta (la scritta le dice lei).
- **Il tesoro più speciale: lo stendardo**: il tesoro di ogni traguardo dà anche lo stendardo dell'arena dopo, che le casse non danno. I tuoi
  stendardi sventolano da un **pennone** piantato sull'isola dove sta l'eroe (a sinistra davanti a lui, `CI_STDS`), uno sotto l'altro
  nell'ordine in cui li hai vinti (sul pennone gli ultimi cinque, `CI_STDN`; un anello d'oro per ognuno), spinti a est dal vento, ognuno col
  colore della sua arena e lo **stemma** della sua arena (quello del pavimento, `floorEmblem` di 74) su un disco chiaro; il pennone cresce con
  loro. Va con l'eroe: quando arriva su un'altra isola si pianta lì, uscendo da terra con un po' di polvere e un colpo di legno (`pennone`);
  quello appena vinto sale per ultimo dalla base con un lampo, il suo suono (`stendardo`: un fruscio di stoffa e un accordo) e «Lo stendardo
  di … è nella tua collezione!». Un tocco sul pennone dice «I tuoi stendardi: 1 di 11 · …». Niente di nuovo nel salvataggio: sono i ponti
  finiti (`cnStdList`). La scritta del tesoro e il riepilogo della partita dicono «Cassa d'argento, 8 cristalli, 150 oro e lo stendardo di
  Cuore del Vulcano»; la fermata «Tesoro a 100 assi: cassa, cristalli, oro e stendardo».
- **La mini isola più ricca**: più grande (`CNI_MR` da 60 a 68, più profonda), l'altare e il tesoro più grandi (il tesoro ×1,45), così sulla
  fermata della telecamera si vede meglio; sullo stendardo del palo lo **stemma vero dell'arena dopo** su un medaglione chiaro; prima del
  traguardo le **pietre si intravedono sotto**, sommerse nel buio, scure, che ondeggiano piano con un filo di luce del mondo dopo (poi salgono
  da lì, `cnStonesDraw`); il **forziere aperto** è foderato di velluto rosso (anche dentro il coperchio), con le pieghe, quattro monete e un
  cristallino rimasti e la luce d'oro.
- **Prova** `node tests/classica.js traguardo` (10 controlli; nuovi: la telecamera che torna dall'eroe e lo segue, la scritta con la
  musichetta senza parole sopra, lo stendardo piantato col suo stemma, il suo suono e le sue parole, il tocco che dice i tuoi stendardi, il
  pennone che va con l'eroe, le pietre sommerse prima del traguardo); `ponte` con le parole nuove del tesoro.

**La telecamera e il dito**: si ferma su ogni balcone (`cnIslStops`: l'isola, i tre balconi, l'isola dopo), dove la scritta dice «Premio N»,
il premio e quante assi mancano (`cnStopNear`, `cnStopText`); trascinando piano si ferma sulla fermata più vicina, un colpo di dito va
all'isola dopo (`cnIslSettle`, la velocità degli ultimi 100 ms); dai balconi «Gioca» gioca l'isola dell'eroe. Un tocco su un premio dice cos'è.

**Il rimborso dell'albero** (96): nell'angolo in alto a destra dell'albero, quando l'abilità ha dei passi, «↺ Rimborsa»; la domanda sta nel
riquadro sotto (niente finestre del telefono): «Ti ridà tutto l'oro, 3.850: i 5 passi tornano chiusi e l'oro lo spendi dove vuoi», «Annulla»
e «Rimborsa · 25 cristalli» (5 cristalli a passo, `TR_RF`); senza cristalli il bottone trema e la riga sotto dice quanti ne mancano, e non
cambia niente. Rimborsando i passi si spengono uno alla volta dal V al I (`trView`: l'albero mostra lo stato che si spegne, il salvataggio è
già a zero), la luce risale i fili, le monete di ogni passo volano al contatore che sale quando arrivano, un accordo che scende; poi l'albero è
di nuovo da comprare dal passo I (`trRefund`).

**Le mosse leggendarie più spettacolari** (sezione 5 di 96): ognuna delle 46 ha il **suo suono** fatto col codice (`TRSN`, mai troppo spesso:
la squilla della Salva del capitano, la campana della Stella a otto punte, il boato del Titano, le note che salgono a ogni salto del Rimbalzo
infinito, il tac sempre più acuto di Trapassa tutto, il vento che ulula della Tormenta, il cuore che batte della Frenesia, l'accordo cupo del
Patto della luna…), **le sue luci** più grandi (anelli di luce a terra, raggi, colonne di luce, segni a stella sul pavimento, crepe che
brillano dietro la Freccia del titano e intorno ai Passi di tuono, la X del Colpo di grazia, la statua di ghiaccio, i cuori della Festa, la
corteccia, gli esagoni dello Scudo di lame, le rune sui muri, il velo azzurro della Tormenta e il buio del Temporale con i lampi) e le frecce
delle mosse più grandi con la loro scia (lance, boomerang con gli archi d'oro, comete, salve, frecce che crescono, schegge). La prima volta che
una mossa parte in una partita il suo nome sale sopra l'eroe con la stella, del colore dell'abilità (`trLeg`). Le mosse che durano si vedono
sull'eroe: la Frenesia batte rossa, la Corsa del vento lascia le righe del vento, sopra il Patto della luna c'è la falce di luna. Con gli
effetti ridotti niente raggi, colonne, segni, spirali e brina (`TR_HI`); il velo è più leggero. Costo sul computer di prova: 80 luci di
mosse insieme +9 ms a fotogramma (in partita ce ne sono poche alla volta).

**La pagina delle mosse** (per vederle dal telefono senza comprare gli alberi): `python3 anteprime/mk_mosse.py` → `anteprime/mosse.html`, una
copia del gioco con 94, 95 e 96 (pubblicata su https://claude.ai/artifact/4nyo34y7gxJFAUuH1sb7Nz, «Mosse leggendarie») e un pannello «Mosse»: scegli un'abilità e una delle due mosse e la vedi in una stanza vera, coi nemici che
tornano sempre (fermi, tranne per lo Scudo di lame che vuole i loro colpi); l'eroe non muore e, se la mossa lo chiede, la stanza lo fa colpire,
scattare, correre, bere la pozione o stare con poca salute; «↺ Rifai» la fa ripartire. Prova `node tests/mosse.js` (ogni mossa parte nella sua
stanza, nessun errore; foto `tests/mv_<abilità><lato>.png`).

**«Prova» nell'albero** (27 ottobre, Denis: «Sì, nell'albero»; sezione 6 di 96): sul passo V, accanto al bottone, «▶ Prova» porta in
una stanzetta della propria isola per 12 secondi con la mossa leggendaria accesa senza comprarla (l'albero di quell'abilità al passo V sul
lato scelto, il proprio lato del bivio III), cinque nemici fermi che tornano sempre e quello che la mossa chiede (poca salute, colpi presi,
scatti, corsa, la pozione: `TR_NEED`); in alto «Prova · abilità», la mossa, la barra del tempo e «Fine»; alla fine si torna all'albero sul
passo V. Il salvataggio non cambia: fotografato prima e rimesso com'era dopo dentro gli stessi oggetti (`trRestore`); mentre si prova non si
scrive e non contano missioni, traguardi, livelli; uscire dalla pausa chiude la prova senza premi (`trTryStart`, `trTryTick`, `trTryEnd`).
La pagina delle mosse usa la stessa stanza senza fine.

**Nel gioco** (27 ottobre, Denis: «Tutto nel gioco»): «Solo nell'anteprima: apri tutte le arene» c'è solo nelle pagine di prova
(`window.MB_ANTEPRIMA`, messo da `mk_classica.py`); i salvataggi del gioco di prima tengono le arene che le coppe avevano aperto: i loro
ponti costruiti, i bracieri accesi, l'eroe sull'ultima (`S.mig` in `cnS`).

Prove: `node tests/classica.js ponte` (assi, premi, ponte grande senza rocce coi premi a sinistra, isole larghe più di 4/5 dello schermo, spettacolo, contatori che aspettano, tocco che lo finisce, balconi, colpo di dito),
`node tests/classica.js albero` (anche il rimborso), `node tests/mosse.js`.

## La fontana della vita, il ponte che non vibra, le pietre (20 ottobre notte)

Denis: «migliora la fontana della vita. e l'animazione di quando passa dal ponte vibra troppo. dai meno mattoncini e aumenta di 10 ad
isola»; alla domanda su come intendere le pietre: «Meno pietre, ponti +10».

**La fontana della vita** (la stanza evento; `fnDraw` in `95-ostacoli-3d.js`, `OB3.P.fontana`). Prima era una vasca grigia con acqua blu e
quattro zampilli. Ora una fontana a due piani di pietra color sabbia: lo zoccolo scuro col muschio ai piedi, la vasca scanalata con la fascia
dorata e il bordo svasato, il piedistallo con la modanatura e un rampicante, la coppa a conchiglia profonda con la sua fascia dorata, in cima un
loto d'oro (sei petali aperti e quattro chiusi) che tiene il **seme della vita**, una luce verde che respira. L'acqua della vita è
verde-azzurra e luminosa (scura sul bordo, chiara nel mezzo, l'ombra del bordo, il cielo riflesso, i cerchi, i luccichii): dal seme quattro
archetti cadono nella coppa, dalla coppa sei fili escono oltre il bordo e ricadono nella vasca con gli spruzzi, e dall'acqua salgono cinque
lucine. **Il sorso**: una colonna di luce verde, un anello che corre sul pavimento, un lampo, quattordici lucine che girano intorno all'eroe e
salgono, un gorgoglio e due campanelle (la cura è quella di prima, metà della salute); poi l'acqua si abbassa e si spegne in 1,4 s e il seme
diventa grigio. Le parti di pietra sono dipinte una volta in tre immagini (vasca; piedistallo e coppa; loto) per ogni misura della tela;
acqua, fili, seme e lucine dal vivo. Costo della fontana da sola sul computer di prova: 0,7 ms, 0,14 con `LOWFX` (due lucine, niente
luccichii, niente fili dietro né spruzzi). La **Fonte della torre** (il piano del premio) è la stessa fontana più piccola (×0,74), con lo
stesso sorso. Foto: `tests/cn_fontana.jpg`.

**La camminata sul ponte** (`cnIslHero`, `cnIslStep`, `cnIslWay` in 94). Misurata fotogramma per fotogramma, le cause erano quattro: la
telecamera aveva un'andatura sua, diversa da quella dell'eroe, così sullo schermo lui saliva, tornava giù di 15–20 pixel e risaliva; la sua
grandezza veniva dall'isola o dal ponte sotto i piedi (+9% salendo sul ponte, −4% scendendo); i passi erano quasi cinque volte più veloci che
in battaglia (64 al secondo invece di 12); il sentiero partiva con un passo quasi di lato e all'arrivo andava oltre il suo posto e tornava
indietro, e lui si girava di scatto (fino a 1,9 radianti da un fotogramma all'altro). Ora la telecamera lo segue esattamente (resta dove sta
sempre sullo schermo e sale e scende solo con la gobba del ponte), la grandezza viene dalla sua distanza (non cambia), i passi hanno il ritmo
della battaglia (`cnWayDD`, `dd·0,046`), il sentiero entra ed esce con due curve morbide, e lui si gira piano: via da noi alla partenza,
verso di noi all'arrivo (al massimo 0,37 radianti tra due fotogrammi). Prova: `node tests/classica.js ponte` («sul ponte non vibra»).

**Le pietre**: 2 per ogni stanza o piano superato (20 per una partita intera, anche nella torre) e 20 per il custode: una vittoria dà 40
pietre invece di 55. Ogni ponte vuole 10 pietre più del precedente: 100 verso la seconda isola, 110 verso la terza … 200 verso la dodicesima
(`cnBrNeed`; prima 100, 130, 160 a giri di quattro isole). Il primo ponte vuole quindi tre vittorie. Nei salvataggi i ponti finiti con le
lunghezze di prima restano finiti (`S.brv` 2), quelli a metà tengono le loro pietre.

## Le carte sui telefoni larghi e il cristallo che si rompe (20 ottobre notte)

Denis: «sì correggi ed riaggiungi i cristalli ma solo quelli rompibili, e cambia animazione quando si rompono senza mettere quelle linea a
zigzag quando la si colpisce»; alla domanda su quali cristalli rimettere (quelli grandi che si rompono c'erano ancora, con i microcristalli
erano andati via solo i cristallini decorativi): «cambia solo animazioni come ti ho detto». Quindi niente cristallini: le carte corrette e
il colpo e la rottura del cristallo grande rifatti.

**Le carte.** Sul telefono di Denis la pagina è larga circa 430 punti (misurato sulla sua foto: «Cambia gratis» largo come qui a 430),
sopra i 420 del foglio di stile: le carte stanno su tre colonne e il blocco del testo non andava a capo, così nome, descrizione,
«Verso «…»» e «Livello N di M» erano attaccati. In `src/pagina.html` il testo della carta è una colonna anche lì (`.sk div`; sotto i 420
punti le carte restano righe come prima). È un difetto anche del gioco vero sui telefoni larghi: la correzione è nel foglio comune. Nella
Classica nuova «Verso «…»» va prima di «Livello» (`cnEvoHint`) e la Furia (rango, barra, «×1,1 oro ed esperienza · 5 s»), che stava sopra
tutte le finestre e copriva la rarità della terza carta, sparisce mentre è aperta una finestra (`#wrap:has(>.screen:not([hidden]))`, anche
le scritte della torre e delle trappole) e torna dopo.

**Il cristallo che si rompe** (`95-ostacoli-3d.js`, in fondo: `rockHit` e `shatterRock` avvolti per i cristalli, `cryBurst`). Gli stessi
colpi di prima (5, o 8 per i grandi) e gli stessi cristalli lasciati (+1, a volte +2); intatto è identico a prima. Via le crepe a zigzag
del disegno a ogni colpo e il cratere con le crepe scure per terra (e le crepe sotto la base, che si vedevano dopo la rottura):
- **il colpo**: la luce dentro il cristallo si accende e si spegne in 0,3 s, saltano 3 schegge (rombi a due toni che rimbalzano una volta e
  spariscono in meno di un secondo; 1 con `LOWFX`), una stellina dove ha colpito la freccia, il tintinnio di prima;
- **a ogni quarto della sua vita uno spuntone si stacca intero** e vola via girando in 3D (prima il piccolo davanti, poi quello a sinistra,
  poi quello a destra; il grande resta per ultimo): al suo posto resta un moncone basso con il ghiaccio chiaro della rottura in cima, da cui
  esce un po' di luce; dove lo spuntone cade si sbriciola in schegge e polvere luccicante con un tintinnio e una campanella. Dopo il primo
  colpo una stellina corre ogni tanto su una punta, più spesso man mano che si indebolisce;
- **l'ultimo colpo**: un lampo, due anelli di luce fredda che corrono sul pavimento, una luce nella stanza che si spegne in 0,7 s (nella
  mappa delle luci, così il buio non torna di colpo), gli spuntoni rimasti (il grande in due pezzi) e tre pezzi del cuore volano in 3D
  girando nella luce e si sbriciolano dove cadono, otto stelline salgono, otto schegge; per terra resta una brina di luce chiara con
  qualche scheggia stesa e un po' di polvere luccicante. Suono: la rottura di prima più una discesa di campanelle e un soffio freddo.
  Con `LOWFX`: due pezzi in meno, tre stelline, quattro schegge;
- schiacciato da una cassa gemella esplode allo stesso modo, senza lasciare cristalli.

Costo sul computer di prova (un fotogramma intero della stanza, a 2 pixel per punto): 11,1 ms prima, 12,1 durante i colpi, 13,5 di mediana
durante l'esplosione (al massimo 22), 10,7 dopo; con `LOWFX` nessuna differenza. Foglio della sequenza: `tests/cn_cristallo_foglio.jpg`.
Prova: `node tests/classica.js cristallo` (spuntoni che si staccano ai colpi giusti per i due tipi, il disegno che si rifà, l'esplosione
con pezzi, lampo, anelli e luce, +1 o +2 cristalli, tutto pulito dopo, gli effetti ridotti, la cassa); `node tests/classica.js rarita` ha
le carte a 430 punti.

## L'albero delle abilità (21 ottobre)

Denis, con la foto della scelta «Livello 5 · Scegli un'abilità»: «fai in modo che nella modalità classica ci sia una nuova funzione di
progressione: tutte le abilità che si possono prendere giocando appunto alla modalità classica, per averle potenziate devi livellarle nel
menu apposito. deve essere bello e pulito con una non so che di magico», poi «il menu dei potenziamenti in battaglia nella modalità classica
dovrà essere tipo uno di quei menu che per ogni abilità si va sempre più giù per migliorarla o aggiungerci altre cose più op». Le sue
risposte: l'albero sta **fuori dalla partita** (in partita le tre carte restano); i passi si pagano in **oro**; l'albero scende **a bivi**;
**subito nell'anteprima**. Il codice è in `src/js/96-albero-abilita.js`, fuori da `src/ordine.txt` come 94 e 95 (lo mette
`anteprime/mk_classica.py`; `TR.on` lo spegne).

- **Gli alberi** (`TRD`): uno per ognuna delle 23 abilità di `SK`, in sei gruppi (Frecce, Traiettorie, Elementi, Lame e passi, Forza,
  Vita). Cinque passi: I e II dritti, III un bivio (di solito «più forte» a sinistra e «una cosa nuova» a destra), IV dritto, V il bivio
  tra due **mosse leggendarie**. Le mosse leggendarie, a sinistra | a destra: Freccia frontale Lance di luce | Salva del capitano;
  Raffica Tempesta di frecce | Eco di luce; Frecce diagonali Boomerang | Pioggia obliqua; Frecce laterali Stella a otto punte | Guardiani
  di luce; Freccia posteriore Coda di cometa | Contrattacco; Freccia gigante Freccia del titano | Gigante che si apre; Rimbalzo Rimbalzo
  infinito | Scoppio finale; Perforazione Trapassa tutto | Stella di schegge; Frecce di sponda Biliardo | Muri che tirano; Frecce
  infuocate Terra in fiamme | Vampata; Frecce di ghiaccio Tormenta | Statue di ghiaccio; Frecce velenose Contagio | Veleno che scoppia;
  Fulmine Temporale | Nuvola amica; Lame rotanti Corona di lame | Scudo di lame; Passo d'ombra Doppio passo | Ombra che scoppia; Stivali
  leggeri Corsa del vento | Passi di tuono; Punte affilate Colpo del gigante | Colpo di grazia; Corda tesa Frenesia | Raffica d'oro;
  Occhio di falco Colpo perfetto | Stella cadente; Cuore di quercia Cuore del bosco | Corteccia di pietra; Pozione Cerchio della vita |
  Pozione esplosiva; Scudo di muschio Doppio scudo | Scudo di spine; Sete di sangue Festa | Patto della luna. I testi di tutti i passi
  stanno in `TRD` (nome e una riga), i numeri nel codice degli effetti.
- **I costi**: 100, 250, 500, 1.000, 2.000 oro per i passi I … V (`TR_COST`; un albero intero 3.850, tutti e 23 circa 88.500). Si
  comprano in ordine; nel bivio vale un lato solo e **si cambia quando vuoi, gratis**. Salvataggio `SAVE.cn.tr[id] = {lv, f3, f5}`.
- **In partita**: le carte sono quelle di sempre; l'abilità presa (carta, mercante, altare, ruota, l'abilità con cui parte l'eroe) arriva
  coi passi sbloccati (`trSync`, `trTook`: i passi delle carte dei numeri valgono a ogni presa, per esempio Punte affilate +23% invece di
  +20% col passo I; quelli «in più» alla prima presa). Sotto la carta i cinque rombi dei passi e la mossa leggendaria scelta. Valgono
  nelle partite della Classica (arena, Torre, Corsa) e nell'Abisso, **non nella sfida del giorno** (è uguale per tutti) né nel trailer.
  Come funziona dentro: ogni freccia sa da che parte della raffica viene (dritta, diagonale, laterale, alle spalle, gigante) e ogni colpo
  si riconosce (freccia, lama, fuoco, veleno, fulmine), così i passi cambiano solo le cose loro; colpi ad area «di contorno» che non fanno
  partire altri effetti, catene fermate a tre livelli. Effetti a terra (fuoco, spine, nubi velenose, vento, il cerchio della vita) e in
  aria (lucciole guardiane, nuvola amica, frecce dal cielo, stelle cadenti, l'ombra che scoppia, la tormenta), frecce speciali (lance di
  luce, boomerang, cometa, freccia del titano, eco, schegge, spine, sassi dei muri).
- **Il menu** (bottone «Albero» sotto «Premi», acceso quando c'è un passo da comprare dopo l'ultima partita): titolo in Cinzel, cielo di
  notte; in alto la striscia delle 23 abilità a gruppi coi rombi dei passi; sotto l'albero dell'abilità scelta che scende dalla radice
  (l'abilità nel suo cerchio di rune che gira), legato da fili di luce del suo colore con le gocce di luce che scendono; i passi comprati
  accesi, il prossimo che respira, il lato non scelto del bivio a metà; in basso il riquadro del passo toccato («Sblocca · 250», «Scegli
  questo ramo · gratis», «Ti mancano …»). Comprando, la luce corre lungo il filo e il passo scoppia di luce con un suono magico (più grande
  per le mosse leggendarie). Il dito di lato passa all'abilità dopo. Su 430×932 (il telefono di Denis) e 390×844 l'albero sta tutto senza
  scorrere; sui telefoni piccoli scorre. Con gli effetti ridotti o «riduci movimento» niente lucciole né rune che girano.
- **Misure**: disegnare tutti gli effetti dei passi in una scena piena (22 zone, 60 effetti) costa 0,3–0,4 ms a fotogramma sul computer di
  prova; con gli effetti ridotti al massimo 10 zone e 70 effetti.
- **Prova** `node tests/classica.js albero` (36 controlli): il bottone, il menu su tre telefoni, gli acquisti in ordine, il bivio gratis,
  le carte coi rombi, i danni delle frecce coi passi, ogni mossa leggendaria in una scena sua, i numeri dei passi dritti, ognuno dei 161
  passi e lati da solo in battaglia, la sfida del giorno senza alberi, gli effetti ridotti, due partite con tutti gli alberi al passo V.

## Le isole verso nord e il ponte di pietra in 3D (20 ottobre notte)

Denis, con la foto del telefono: «vorrei che ingrandissi l'isola e ci mettessi più dettagli per arricchirla. sopratutto il ponte lo voglio
fatto decisamente molto meglio rispetto ad com'è ora. sembra troppo piatto», poi «anziché far le isole alla destra facciamole da nord, così il
ponte si vede per dritto e viene molto meglio».
- **Verso nord** (`CNI_GAP`, `CNI_PD`, `cnIslAt`): le isole stanno una dietro l'altra; quella su cui sei in basso, il suo ponte che sale dritto
  nel mezzo dello schermo, quella dopo più in alto e più piccola (più è lontana più è piccola), quella dopo ancora dietro le scritte. Il dito
  le muove su e giù (in giù porta l'isola dopo; anche di lato come prima); un tocco sul ponte o sull'isola dopo ci va (se è chiusa dice
  quante pietre mancano). L'isola alle spalle se ne va mentre la lasci; sotto la riga dell'isola la scena torna cielo (le caselle vuote
  delle casse restano pulite).
- **L'isola più grande** (larga fino al 62% dello schermo, sul telefono di Denis circa il doppio di prima): scritte compatte in alto
  («ARENA N» e il nome su una riga, sotto la modalità e l'Incubo affiancati, sempre tra i bottoni e la manina zombie), la riga di stato in
  basso. **Più dettagli**: sotto ogni isola un grande sasso che pende nel buio a strati, con i sassi (il ghiaccio: i ghiaccioli) appesi;
  l'acqua del mondo che corre da una pozza al bordo e cade giù dal fianco (acqua nel muschio, lava nel vulcano, l'acqua scura della palude,
  una cascata gelata), viva con i riflessi che scorrono; il sentiero da un ponte all'altro col ramo per il cancello; muschio: tombe intorno
  al custode, un vecchio albero carico di muschio, due lanterne di pietra accese lungo il sentiero, colonne, funghi, felci, ciuffi, fiori;
  vulcano: il vulcano che fuma, colonne di basalto, ossidiana, l'albero bruciato, rocce di lava; palude: l'albero morto, lo stagno con le
  ninfee, canne, funghi, il totem della rana, ceppi, lanterne; ghiaccio: punte di ghiaccio, pini innevati, il pupazzo di neve, cumuli,
  cristalli (le cose delle stanze, 95, riusate sulle isole).
- **Il ponte di pietra in 3D** (`cnIslBridge`, `cnBrMap`, `CNB`): a schiena d'asino, lastricato (quattro file di lastre, due spostate di
  mezza lastra) e illuminato secondo la pendenza; un cordolo lungo i due lati, la balaustra di colonnine con il corrimano sopra (muschio o
  neve sul corrimano), l'ombra della balaustra sulle lastre; quattro pilastri con le lanterne ai due capi (accese a ponte finito), sui
  pilastri in fondo lo stendardo dell'arena dove porta; dai bordi pendono liane, muschio, ghiaccioli o braci secondo il mondo. Dodici file
  di pietre: dove le pietre non ci sono ancora c'è una passerella di assi su due travi con i paletti e la corda, e le pietre pronte dove
  finisce il lavoro; le pietre di una partita cadono una fila alla volta. Il ponte da un'isola chiusa è al buio come lei. A telecamera
  ferma il ponte è dipinto una volta e copiato (`cnBrBake`): un fotogramma costa quanto prima.
- **L'eroe attraversa il ponte a piedi** (`cnIslWay`, `cnIslMove`): dal suo posto al sentiero, su e giù per la gobba, fino al suo posto
  sull'isola dopo, di spalle mentre va a nord; la telecamera lo segue, i compagni gli vanno dietro. Più lontano salta come prima.
Prove: `node tests/classica.js ponte` (17 controlli: anche le isole verso nord, il ponte che sale dritto, la camminata, il dito in giù).

## Il ponte di pietre, la Prova dell'Incubo, le isole chiuse al buio (20 ottobre notte)

Denis: «secondo me dovresti togliere quei microcristalli attorno a gli ostacoli, migliorare leggermente l'effetto del fuoco in generale. ed
non fare in modo che si possa passare da un'isola all'altra solo vincendo una partita da 10 round. oscura tutte le arene non accessibili
cosicchè non si vedono i boss». Alla domanda su come aprire l'isola dopo: «Più difficile»; tra le idee proposte: «aggiungi ponte di pietra e
prova dell'incubo a parte perchè la voglio provare».
- **Via i microcristalli** intorno agli ostacoli (95): niente più cristallini ai piedi degli ostacoli né schegge luccicanti a terra nel
  mondo dei cristalli (resta il pavimento scurito e crepato sotto, `groundPatch` avvolto).
- **Fuoco un po' più bello** dappertutto (`flame` avvolto in 95, `O3FIRE`): lingue in più ai lati, cuore chiaro, una lingua che si stacca e
  sale, scintille (una con `LOWFX`); bracieri, torce, ostacoli che bruciano, chiazze di fuoco a terra (bruciato col bordo tratteggiato),
  nemici che bruciano (due fiammelle), fuochi della Classica nuova. Costo di una fiamma 0,045 ms qui.
- **Il ponte di pietre** (`CN_BRN`, `cnBrNeed`, `cnStones`, `cnBridgeAdd`, `cnIslBridge`): l'isola dopo si apre solo quando il ponte è
  finito, non più alla prima vittoria. Ogni partita porta pietre: 3 per ogni stanza (o piano) superata e 25 per il custode, cioè 55 per
  una vittoria (ritirarsi o cadere porta quelle delle stanze superate). Un ponte vuole 100 pietre per le isole 2–4, 130 per le 5–8, 160 per
  le 9–12: due vittorie per le prime, tre per le altre. Sulla schermata di fine «Ponte verso … · +N pietre» con la barra, o «Il ponte è
  finito! … è aperta»; tornando al menu la telecamera va al ponte e le pietre nuove cadono al loro posto (dodici file di pietre, sotto:
  «Le isole verso nord»; la targhetta «N/100» solo sul ponte che parte da un'isola aperta); finito il ponte l'eroe lo attraversa e passa
  all'isola nuova. Isola chiusa: «Finisci il ponte: N/100 pietre» sotto l'isola, sulla mappa e su «Gioca».
  Le coppe non aprono più le arene (niente schermata «nuova arena» dalle coppe). I salvataggi dell'anteprima di prima tengono aperte le
  isole già vinte (`S.brv`).
- **La Prova dell'Incubo** (a parte, da provare): sulle isole già vinte c'è la pillola rossa «Incubo» sotto il nome; un tocco la accende,
  il cielo diventa rosso, il custode si sveglia e ringhia, «Gioca» diventa «Incubo» (rosso) e la riga sotto dice «Incubo: nemici più forti
  · oro doppio». La partita: le manopole di `DIFF` più dure (élite fin dalla prima stanza e molto più spesso, niente sconti della prima
  arena, vita e danno come un'arena ×1,5 + 0,1), la scritta «Prova dell'Incubo» dopo quella della stanza, tutto un po' più rosso, e il
  custode **già arrabbiato** (la sua fase 2 da subito, con la vita intera, `cnIncTick`). Vinta: **oro doppio** e **3 cristalli**, la luna
  rossa sopra il cancello dell'isola; niente pietre, niente braciere. Le manopole tornano come prima alla fine, uscendo dalla partita o
  tornando al menu (`cnIncRestore`); «Gioca ancora» rifà l'Incubo. Record in `SAVE.cn.inc`. Per provarlo subito, nell'anteprima con
  «Solo nell'anteprima: apri tutte le arene» (sulla mappa) la pillola c'è su ogni isola.
- **Le isole chiuse al buio**: nel cammino un'isola chiusa è quasi nera (si intravedono la forma, il lucchetto e qualche luce del suo
  mondo) e il suo custode non c'è; sulla mappa del mondo le arene chiuse sono nere e il custode è «???».
Prova `node tests/classica.js ponte`.

## Tutto in 3D (20 ottobre notte)

Denis: «vorrei che facessi i dettagli in 3d per le isole fluttuanti non in 2d ce, trasforma ogni cosa/ostacolo che è in 2d in 3d anche in
game». Quello che nell'anteprima era disegnato piatto adesso è fatto di volumi 3D visti dalla telecamera dei mostri (lo schermo è x,
y·0,55 − z) e dipinto come loro (tre toni, bordo illuminato, contorno scuro spesso, luce dall'alto a sinistra):
- **Ostacoli delle stanze** (`src/js/95-ostacoli-3d.js`, fuori dal gioco come 94: lo mette `mk_classica.py` dopo 94; `OB3.on=false`
  rimette il disegno di prima): i 27 tipi dei quattro mondi (masso, colonna, sarcofago, urne, lapide, ceppo, cristalli, braciere, teschi,
  rovi; basalto, roccia di lava, ossidiana, incudine, calderone, cassa; albero morto, totem, fango, canne, lanterna, roccia della palude;
  ghiaccio, pino, pupazzo di neve, roccia innevata, statua congelata) con le stesse forme, colori e grandezze di prima; i pezzi squadrati
  girati un poco a caso, così si vedono due facce; mucchietti 3D del mondo tutto intorno alla base (quelli dietro prima dell'ostacolo,
  quelli davanti dopo); l'usura taglia il disegno 3D e i pezzi caduti sono sassi 3D; fiamme, bagliori, bolle, canne e il braccio del
  pupazzo restano vivi. Ogni ostacolo fermo è dipinto una volta in un'immagine (come `rockSprite` in 47) e rifatto solo quando cambia
  l'usura: una stanza costa quanto prima (14–25 ms a fotogramma contro 13–21 sul computer di prova), un ostacolo si dipinge in 0,5–3 ms una
  volta sola. Gli ostacoli dei boss rifatti (rocce del Golem, incudini del Fabbro, gabbia della Piovra…) restano i loro, già in 3D.
  Foglio nelle quattro direzioni: `anteprime/ostacoli3d_foglio.jpg` (prima, davanti, lato, dietro, altro lato).
- **Le cose della stanza**: monete che girano sul bordo, cristalli, sfere dell'esperienza, cuori, la fontana, l'altare e il tesoro delle
  stanze speciali, massi e incudini lanciati dai boss, le strisce di spine; le casse gemelle restano quelle 3D del Mimic (89).
- **Le isole**: lastre del sentiero, ciuffi d'erba, fiori, cuscini di muschio, lo stagno con le ninfee e i sassi intorno, le canne, la
  colata del vulcano, la lastra di ghiaccio, le catene e il lucchetto, gli stendardi, il braciere (anche quello piccolo sotto l'isola).
- **Trappole e torre**: seghe e binari, lame di pietra con le rune, spuntoni, sfiati, la fonte e l'altare del piano del premio, le macerie
  dei buchi, i pezzi del pavimento che crolla, le mani che si arrampicano, le monete del percorso; la bomba, la meteora, la stella e il
  drago di fuoco.
- Restano piatti, perché lo sono anche in 3D: pavimento, crepe, pozzanghere, segni a terra; e scritte, icone, fiamme, getti e scie.
Prova `node tests/classica.js 3d`.

## Il cammino delle isole (20 ottobre notte)

Denis, con le foto della campagna di Archero 2: «faremo in modo che si avanzi così come vedi nelle immagini». Risposte: le isole **al
centro con l'eroe sopra** (si scorre col dito e l'eroe salta sull'isola dopo), **pezzi di mondo sospesi** come nel prologo (nebbia, la luce
del mondo, il custode che dorme sull'isola), sotto ogni isola **il braciere e il record** e l'icona della modalità, **Torre, Corsa,
Reliquie e Ricercati in una fila sopra Gioca**. Nella Classica la schermata principale non ha più la cripta e la scheda dell'arena: al
loro posto il cammino (`src/js/94-classica-nuova.js`, sezione 7, `ISL`): ogni arena un pezzo di terra del suo mondo (muschio, vulcano,
palude, ghiaccio, coi colori dell'arena) col sentiero, l'arco del cancello, il braciere e le cose del mondo, il custode che dorme in fondo;
le isole chiuse hanno le catene col lucchetto. Scorrendo si guardano le altre (chiuse comprese, l'eroe resta dov'è); su un'isola aperta
l'eroe ci salta e «Gioca» gioca quella; quando il ponte verso l'isola dopo è finito ci salta da solo (sopra, «Il ponte di pietre»). In alto «ARENA N», il nome e la modalità
(un tocco apre la mappa del mondo), sotto il braciere con «Completata» e il record. La Zombie resta com'era (lo scorrimento tra le modalità
funziona come prima fuori dalle isole). Ogni isola è dipinta una volta in una tela sua (al massimo 6), un fotogramma costa circa 7 ms qui
(la cripta 21). Prova `node tests/classica.js menu`.

## La scalata a giro: una modalità per arena (20 ottobre notte)

Denis, con quattro foto di Archero 2 (tre di ondate su isole con i ponti, una di un percorso a trappole): «dovremmo modificare la scalata
delle arene e metterci modalità diverse ogni tot tipo la modalità che abbiamo già va bene, si inizierà così a inizio game. aggiungiamo una
modalità simile a quelle che vedi nelle prime 3 immagini […] ed un'altra come l'ultima». Le sue risposte alle domande: **una modalità per
arena, a giro**; per le ondate «come le isole con i ponti ma non tocca copiare l'idea ad archero tocca fare una cosa molto diversa» → **la
torre che sale**; **10 ondate e il custode nelle arene 2 e 5, 20 col boss ogni 5 nelle 8 e 11**; l'eroe cresce **come nelle stanze**; per le
trappole **tutti e tre i tipi** di stanza e **il custode alla fine**.

| Arene | Modalità | Com'è fatta |
|---|---|---|
| 1, 4, 7, 10 | **Le stanze** | Le 10 stanze di sempre (si comincia così) |
| 2, 5 · 8, 11 | **La torre che sale** | 10 piani (Campioni al 5, premio all'8, custode al 10) · 20 piani (campione del piano al 5, 10, 15, premio all'8 e al 16, custode al 20) |
| 3, 6, 9, 12 | **Le trappole** | Percorso (1, 4, 7), trappole e nemici (2, 5, 8), fuga dal crollo (3, 6, 9), custode tra le trappole (10) |

- **La torre che sale** (`cnTowPlan`, `cnTowSetup`, `cnTowTick`): un'ondata per piano, ognuno con la forza di una stanza (`c`: vita, danno,
  nemici ed esperienza come nelle stanze; nella torre da 20 ogni piano ha due terzi dei nemici). I nemici **salgono dall'abisso e si
  arrampicano sul bordo** della piattaforma (a sinistra, a destra o in basso, mai addosso all'eroe: le mani sul bordo e la polvere), metà
  subito e il resto quando i primi sono quasi finiti («Ne arrivano altri!», tenuto aperto dal segnaposto `cnanchor`). Ripulito il piano, monete
  ed esperienza arrivano all'eroe e **la piattaforma sale** (2,6 s: trema, sassi e polvere che cadono, bande d'ombra che scorrono, un attimo
  di buio quando attraversa il solaio, il tonfo all'arrivo); l'eroe resta dov'era. Dal piano 2 **buchi nel pavimento** (`cnHolesMake`): si
  vede l'abisso con la parete di pietra e la luce del mondo in fondo; chi cammina ci gira intorno (anche nella navigazione dei nemici), chi
  vola no, i colpi ci passano sopra. **Campione del piano** (`cnMiniBoss`): il nemico più forte del piano con tre poteri e la vita ×3,2.
  **Piano del premio** (`cnShrines`): la fonte (cura il 40%) o l'altare (un'abilità); l'altra si sbriciola. Barra dei piani in alto
  (`#cnTow`: il piano e i prossimi cinque, con le icone di Campioni, campione, premio e custode) e «7/20» al posto della stanza. A fine
  partita il piano raggiunto e il record (`SAVE.cn.best[a].fl`).
- **Le trappole** (`CN_TRK`, `cnTrapSetup`, `cnTrTick`): **lame** che girano sui binari, **travi runiche** che scorrono, **spuntoni** a tempo
  (i buchi si accendono prima), **sfiati del mondo** (fiamma d'ombra, getto di lava, geyser di veleno, soffio di brina che rallenta). Colpiscono
  anche i nemici (16% della vita) e il custode (2%). **Percorso**: niente nemici, la porta aperta, nove monete a zig zag; tre traguardi
  (tempo, nessun colpo, tutte le monete): 15 oro e un cristallo ciascuno, tutti e tre anche la cura del 20%, e l'esperienza della stanza.
  **Trappole e nemici**: la stanza di sempre con 3–4 trappole. **Fuga dal crollo**: il pavimento crolla dal fondo (`cnColTick`) sempre più
  svelto, la porta è aperta anche coi nemici in giro, chi resta sotto la linea prende un colpo (18% della salute, mai l'ultimo) e salta in
  avanti; i nemici e gli ostacoli sotto la linea cadono. **Custode**: due lame sui lati e due sfiati.
- Scheda dell'arena e mappa: la modalità di ogni arena (icona e nome, sulla mappa anche la riga che la spiega), la striscia coi piani o con
  le stanze delle trappole, il record giusto. La Nemesi non invade il percorso, la fuga né il piano del premio.


Denis, dopo averla provata: «è troppo rotta come modalità quella dei 5minuti bro siamo veramente troppo op rispetto ai nemici gli
fulminiamo»; poi «togliamola per ora, e togli quell'effetto delle fiamme sul personaggio che sblocchi con le abilità» e «il
moltiplicatore ecc non deve durare tutto il tempo ma una manciata di secondi». La misura gli dava ragione: con l'eroe fermo e
l'equipaggiamento di partenza, nei 5 minuti di ondate dell'arena 1 si facevano 689 uccisioni e si arrivava al livello 43 con 9.285 oro
(in una partita a stanze si arriva al livello 8–10 alla stanza 10).

- **Via le ondate a tempo**: la partita d'arena è di nuovo `makeSeq()`, le 10 stanze di sempre con i Campioni alla 5 e il custode alla 10;
  la scheda dell'arena e la mappa mostrano le 10 stanze e il record di stanza (`bestRoom`). Il codice delle ondate è nel commit 22ea83a.
- **Via le fiamme dell'SSS** (fiamme, braci e luce sotto i piedi sull'eroe, e con loro il +30% di danno e la bruciatura).
- **Il moltiplicatore della Furia dura 6 secondi** (`CN_FUT`) dopo ogni rango nuovo, poi torna ×1 anche se il rango resta; un colpo
  preso lo spegne. Sotto la lettera: «×1,5 oro ed esperienza · 6 s» che scende e pulsa.
- **La Nemesi invade una stanza a caso** della partita d'arena (`cnNemPlan`, `cnNemCheck`): dalla 3 alla 8, mai la 5 dei Campioni né il
  custode; se tocca un evento, la stanza dopo.

## Seconda versione (20 ottobre sera)

Denis, sulla prima versione: «mi piace la grafica delle cose che hai aggiunto ma non la meccanica.. trovati belle idee ispirandoti ai
giochi più in foga che fanno più forte, e fammi domande con risposte». Giochi guardati: Slay the Spire 2 (il lancio roguelike più grande),
Hades II, Megabonk, Balatro, Vampire Survivors; sul telefono Brawl Stars e Archero 2 (modalità a tempo, sfide 3 contro 3). Le sue risposte:

- In battaglia: **Furia a catena** (non scelte: ruba il potere, schivata perfetta, santuari da caricare).
- Crescita: **Rarità a sorpresa** ed **Evoluzioni spettacolari** (non scelte: fusioni a stelle, moltiplicatori alla Balatro).
- Per tornare a giocare: **Anime perdute** e **la Nemesi**, **insieme** (consigliato e scelto: chi ti uccide si prende l'oro), carattere
  «**entrambe** ed aggiungi pure il sangue se necessario» (non scelte: sblocchi con le imprese, Ascensione).
- La partita: **ondate a tempo**, arena **come oggi** (460×820, non più grande).
- Da tenere della prima versione: **mappa del mondo**, **menu con «Premi»**, **élite coi poteri**, **Torre e Corsa dei boss**. Tolti: bivi,
  stanze con un obiettivo, famiglie e fusioni, crescita automatica, Capobanda, Altare e frammenti, stelle (la versione di prima è nel commit
  9d51e82).

### Cosa c'è

1. **Ondate a tempo** (tolte, sopra; codice nel commit 22ea83a; `CN_WV`, `cnWaveStart`, `cnWaveTick`, `cnWaveEnd`; come la modalità a tempo di Archero 2, Megabonk e Survivor.io): la
   partita d'arena è `[{c:1},{c:10}]`: 5 minuti di ondate nella stanza di sempre, poi la stanza del custode. Nemici dalla composizione della
   stanza che corrisponde al tempo (`G.room` sale da 1 a 9: vita, danno e cadenza crescono come stanza dopo stanza; la vita cresce del 14% a
   stanza invece del 20%), da 6 a 12 insieme e mai più di 16, uno ogni 1,45 → 0,5 s; ogni minuto un'«Ondata N!» grande con 1–2 élite coi
   poteri. Cronometro al posto di «N/10» (rosso negli ultimi 10 s). Un segnaposto invisibile (`cnAnchor`, tipo `cnanchor`) tiene la stanza
   aperta; esperienza e monete volano da sole all'eroe (`cnWaveMagnet`); alla fine il bottino a terra è tuo, i nemici fuggono nel fumo e si va
   dal custode. Record per arena in `SAVE.cn.best[a]` (`t` ondate, `fu` Furia massima, `win`).
2. **Furia a catena** (`CN_FU`; come Devil May Cry e Hi-Fi Rush): uccisioni di fila (élite 3, custode 6) → D Deciso (3), C Carico (8),
   B Brutale (15), A Assurdo (24), S Spietato (36), SS Sanguinario (52), SSS Sovrumano (72); ogni rango nuovo moltiplica oro ed esperienza (×1,1 … ×2,5)
   per 6 secondi; dopo 2,6 s senza uccisioni cala, un colpo preso la spezza (resta il 35%) e spegne il moltiplicatore (a SSS l'eroe prendeva
   fuoco: tolto). Lettera
   grande a destra con la parola, la barra e il moltiplicatore, suono a ogni rango; Nella Classica nuova
   prende il posto di «Doppia! Tripla!…» (`killStreak`).
3. **Carte con la rarità a sorpresa** (`CN_RAR`; come Megabonk e Brotato): ogni carta esce Comune, Rara, Epica o Leggendaria (64/24/9/3; la
   Furia le sposta verso le rare). Le carte dei numeri crescono (Attacco, Salute, Cadenza +20/30/45/70%, Critico +10/15/22/35%, Pozione
   40–100%, scatto, stivali), le altre danno +8/16/25% di danno e, leggendarie, due livelli. Arrivano coperte e si girano una alla volta;
   quelle rare girano come una slot (colori che cambiano, tic tic) e si fermano con un suono per rarità; il primo tocco le scopre tutte.
4. **Evoluzioni spettacolari** (`CN_EVO`; come Vampire Survivors): un'abilità al massimo con la compagna giusta. Pioggia di meteore (Raffica +
   Frecce infuocate: tre meteore ogni 2,6 s, cratere che brucia), Lancia di ghiaccio (Perforazione + Frecce di ghiaccio: lance che trapassano
   tutto e alla fine scoppiano in schegge che gelano), Catena del tuono (Rimbalzo + Fulmine: fulmini su tre nemici, stordiscono), Ciclone di
   lame (Lame rotanti + Passo d'ombra: cinque lame nel vortice), Freccia del drago (Freccia frontale + Occhio di falco: un drago di fuoco ogni
   4 s, critico), Corona di piume (Frecce diagonali + Frecce laterali: dodici piume d'oro ogni terza raffica). Sulle carte «Verso…» e
   «Sblocca…»; quando la prendi «EVOLUZIONE!», onda, scintille e una colonna di luce. Le sei evoluzioni di prima restano fuori dalla Classica
   nuova (ci sono nell'Abisso e nella sfida del giorno).
5. **La Nemesi col tuo oro** (`cnNem*`; come Shadow of Mordor e le invasioni di Dark Souls): chi ti uccide (il nemico che si muoveva, il
   colpo tirato, se no il più vicino o il custode) prende un nome e un titolo (`CN_NEMN`, `CN_NEMT`), è buffa o spavalda a caso, balla e ti
   prende in giro; a fine partita si prende l'oro raccolto e diventa una Nemesi (al massimo tre, `SAVE.cn.nem`). In una stanza a caso della partita d'arena (dalla 3 alla 8, mai
   la 5) la più ricercata invade la partita: portale rosso, «Invasione!», il tuo sacco sulle spalle, nome sopra la testa, i poteri delle élite,
   più vita col livello, frasi nei fumetti con una voce fatta di sillabe (`CN_NEML`, `cnVoice`). Battila: ti riprendi l'oro e la taglia
   (5 + 5 × livello cristalli); se ti batte ancora sale di livello (fino a 5), prende un potere in più e il sacco cresce. Se ti uccide un
   custode, è lui a tenersi l'oro (`SAVE.cn.bossGold`) fino a quando non lo batti. Per le spavalde un po' di sangue: il taglio rosso sullo
   schermo e le gocce a terra quando ti uccidono, le macchie sul manifesto e a terra quando le batti (Denis: «aggiungi pure il sangue se
   necessario»). A fine partita il manifesto col ritratto (il modello 3D, `cnPortrait`); nella mappa la bacheca dei **Ricercati** con i
   manifesti, la taglia, i custodi col tuo oro e le Nemesi sconfitte. Ritirarsi lascia l'oro a te.
6. **Restano**: la mappa del mondo coi 12 bracieri (si accendono vincendo; via le stelle; per ogni arena i record), il bottone «Premi», le
   élite coi poteri (Scudo, Si divide, Esplosivo, Furioso, Gelido, Rigenera), la Torre della settimana con le reliquie dopo ogni custode e la
   Corsa dei boss (sotto).

### Misure

Sul computer di prova (lento, senza scheda grafica) a 3 pixel a punto: il disegno di un fotogramma è circa 1,7–2,6 ms per nemico 3D (con 13
nemici 21 ms, con 21 43 ms); le evoluzioni aggiungono poco. Per questo nelle ondate al massimo 12 nemici insieme (16 con le ondate grandi).

### Prove (`tests/classica.js`, 61 controlli, nessun errore; in qualità alta, perché sul computer di prova la qualità automatica passerebbe agli effetti ridotti)

Menu (scheda coi bracieri, «Premi» e le Missioni, la Zombie com'era, mappa senza stelle, arena chiusa, Torre, Corsa chiusa, Ricercati vuoti);
la partita d'arena (le 10 stanze di sempre senza ondate, esperienza, Furia e oro stanza dopo stanza, il custode alla stanza 10, la vittoria
col braciere e il record, la scheda che propone l'arena 2 con le sue 10 stanze); Furia (D ×1,1 per 6 secondi, SSS ×2,5 senza fiamme né
bruciatura, il moltiplicatore che finisce, colpo che la spezza e lo spegne, calo); carte (coperte, primo tocco, leggendarie forzate, effetti,
la Furia che fa uscire più rare); evoluzioni (la carta, la trasformazione, tutte e sei insieme); Nemesi (nasce, manifesto e oro, bacheca,
invasione nella stanza scelta col sacco e la frase, taglia, che cresce, il custode che tiene l'oro e lo ridà); Torre fino al piano 20;
Corsa per 4 custodi. Foto `tests/cn_<n>.png`.

## Prima versione (20 ottobre, tolta dopo la risposta di Denis)

Bivi tra le stanze, stanze con un obiettivo (resisti, totem, pavimento che sale, scrigno a tempo, lanterna), famiglie di abilità che si
fondono, 12 reliquie dalle élite, mappa con le 3 stelle per arena, bracieri, Torre della settimana, Corsa dei boss; poi le modifiche proposte
(crescita automatica, élite coi poteri, Capobanda alla stanza 3, porta subito aperta, frammenti e Altare, menu con «Premi»). Codice nel
commit 9d51e82 del ramo `classica-nuova`.

## Torre della settimana e Corsa dei boss (come nella prima versione)

- **Torre della settimana** (`cnTowerMods`, `cnTowerBoard`): 20 piani dell'Abisso, un custode ogni 5 e una reliquia dopo ognuno, tre regole
  che cambiano il lunedì (una buona e due cattive, dalle regole della sfida del giorno più Sete di sangue, Niente cuori, Contro il tempo),
  classifica della settimana. Non tocca i record dell'Abisso. Niente ondate.
- **Corsa dei boss** (`cnRushNext`): i custodi già battuti uno dopo l'altro; tra uno e l'altro il 35% di salute e un'abilità; record di
  custodi di fila e tempo di tutti e 12. Non tocca coppe né record delle arene.
