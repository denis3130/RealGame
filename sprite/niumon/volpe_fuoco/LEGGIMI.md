# Il Niumon di fuoco in pixel art (progetto Niumon)

Dal disegno che Denis ha mandato il 13 ottobre (sera): una volpe di fuoco di tre quarti davanti, con la cresta e la coda di fiamma,
le orecchie rosse dentro, la gorgiera, le zampe rosse e le braci intorno. Il primo Niumon (quello di fumo) non andava: «magari quello
di fumo è troppo complicato senza una buona base solida da dove partire». Il disegno è suo e non sta nel repository: per rifare tutto
va messo in `fai/` come `disegno.png` (serve solo per la pagina di confronto e per ritagliare di nuovo la coda).

Regola del piano degli sprite (versione 1.1): creature e personaggi solo in pixel art 2D. La base a volumi qui sotto è solo un
attrezzo per tenere le forme uguali in tutte le direzioni: nel gioco vanno solo i PNG. Prima di metterli nel gioco Denis guarda tutte
le direzioni (pagina `python3 anteprime/mk_niumon_volpe.py`, pubblicata su https://claude.ai/artifact/5c3n4qU6JekcfCQwHiD14q).

## Solo 2D, senza base 3D (14 ottobre, notte)

Denis sulla versione colorata in 2D: «ma è in 3d questo bro». Allora una prova tutta in 2D, senza modellino: `disegno2d/`
riduce a pixel il suo disegno (`maschera.py`: la sagoma senza carta né ombra a terra, braci a parte; `pixel2d.py`: matita
lisciata, tavolozza fissa di fuoco scelta pixel per pixel sul disegno intero e poi il colore più votato in ogni blocco,
contorno scuro, linee interne dai tratti scuri, occhi da sprite al posto di quelli del disegno: disegnati a 96 px, timbri a
mano a 64 px; naso, bocca con la lingua e guancia presi dal disegno; `anima2d.py`: 8 fotogrammi a 8 al secondo in cui coda e
cresta del disegno si piegano a onde con la base ferma, le braci salgono e al sesto fotogramma chiude gli occhi). Fogli in
`solo2d/`: `lotta_fermo` (96×96, da mostrare a 2× nel riquadro 192×192 del piano) e `mappa_fermo` (64×64). Pagina
`python3 anteprime/mk_niumon_volpe2d.py`, pubblicata su https://claude.ai/artifact/8HKD5hPW47LWkV5bwk2Ww9. È solo la vista del
disegno (tre quarti davanti): in 2D le altre direzioni vanno disegnate, da Denis o da me nello stesso stile (chiesto a lui).

### Poi (14 ottobre, notte): occhio, mossa in lotta, 8 direzioni per la mappa

Denis: «l'occhio che hai aggiunto è messo troppo in su. e fammi uno sprite anche quando è in lotta. e tutte le 8 direzioni per
quando correrà in giro».
- Occhi misurati sul disegno (`pixel2d.EYES`: lontano (304, 592), vicino (472, 600)); la luce dell'occhio vicino in alto a
  sinistra come nel disegno; corretto anche un errore della cache dei colori che con le deformazioni poteva mischiare i fotogrammi.
- In lotta: `disegno2d/anima_lotta.py` → `solo2d/lotta_fiammata` (144×96, 10 fotogrammi a 12 al secondo, una volta sola): si
  carica all'indietro, scatta in avanti e sputa una fiammata verso sinistra (l'avversario), poi torna. Tutto dal disegno, con
  spostamenti e schiacciamenti piatti del disegno stesso; la fiammata è disegnata a gocce con le fasce di fuoco.
- Mappa in 8 direzioni: `burattino2d/` (`burattino.py` gli attrezzi, `volpe2d.py` la volpe, `produci2d.py` i fogli in
  `solo2d/mappa/`: `corsa_*` 6 fotogrammi a 12 al secondo, `fermo_*` 8 a 8 con le palpebre al 5). Il burattino è fatto di forme
  piatte col loro contorno (marrone sul pelo, rosso scuro sulle fiamme) messe una sopra l'altra con regole da disegnatore (zampe
  lontane dietro al corpo, vicine davanti; da dietro coda e corpo davanti alla testa); uno scheletro di punti dice solo dove va
  ogni pezzo. Orecchie e coda non si vedono mai di taglio; nelle viste davanti e di lato la testa si gira un poco verso di noi.
  Colori a grandezza di sprite: pelo con il filo di luce in alto e l'ombra in basso, fiamme a fasce dal bordo, occhi a timbro.
  Corsa a balzi: zampe davanti e dietro alternate, corpo che sale e beccheggia, orecchie un po' indietro, coda e cresta che
  fiammeggiano.
- Pagina: la stessa (`python3 anteprime/mk_niumon_volpe2d.py`).

### Poi (14 ottobre, notte): più pixel e più vero

Denis: «aggiungi più pixel e fallo sembrare più vero dai».
- Dal disegno, il doppio dei pixel: `solo2d/lotta_fermo` 192×192 (il riquadro della lotta del piano, un pixel per pixel),
  `solo2d/mappa_fermo` 128×128, `solo2d/lotta_fiammata` 288×192. Tavolozza del disegno più ricca (pelo e fiamme a più toni,
  iride a cinque toni con due luci), occhi disegnati a questa misura.
- Mappa in 8 direzioni rifatta con `burattino2d/volpe_hd.py` (128×128, punto d'appoggio (64, 111)); `produci2d.py` ora usa
  questo (`volpe2d.py` è quello di prima, a 64 px). Sempre forme piatte col loro contorno messe a posto dallo scheletro, ma:
  - proporzioni del disegno (quelle della base controllata sul disegno: testa ×1, corpo lungo), zampe grosse con le calze rosse
    e due dita sul davanti del piede, cresta grande a sei lingue, orecchie con due ciuffi di fiamma sul bordo esterno, ciuffi
    sulle guance, collare rosso a ciuffi e petto chiaro a punte, ciuffo sulla schiena, fiamme dietro la testa (si vedono da
    dietro), bocca aperta con la lingua, braci che salgono quando sta fermo;
  - colori del disegno: misurato lo sprite fatto dal disegno, il pelo è quasi tutto oro e arancio (`o0`, `o1`, `y1`) con l'ombra
    rossa (`r0`, `r1`), non i toni chiari `f0`–`f4`; le calze vanno dall'arancio al rosso scuro, le fiamme dal bordo rosso al
    cuore giallo;
  - toni come in una pittura a mano, pezzo per pezzo (`Tela.put`): filo di luce sul bordo verso la luce (in alto a sinistra),
    ombra sul bordo opposto, più scuro in basso, zampe lontane più scure; il tono delle zampe vicine si calcola insieme al
    corpo, così spalla e coscia si fondono nel corpo; sopra, il tratteggio della matita fisso sul pezzo (`TEX`);
  - linee: fuori marrone scuro (rosso scurissimo vicino alle fiamme), dentro più chiare; sul bordo di un pezzo di pelo che guarda
    la luce la linea interna non c'è (restano sui lati in ombra e sotto); pixel isolati tolti (`despeckle`).
  - Controlli: nessun fotogramma tocca il bordo (almeno 4 px di margine), i fogli si rifanno uguali al pixel dagli script.
- Pagina: la stessa, con «Prima | Adesso» (i fogli di prima presi da git, commit 3facba8, mostrati alla stessa grandezza) e le
  8 direzioni a rosa dei venti, con al centro la volpe che gira su se stessa.

## Pixel art vera, come lo screenshot della lotta (14 ottobre)

Denis: «c'è qualcosa che stiamo sbagliando bro». Riguardando il suo screenshot di riferimento (lotta HD-2D nel bosco di notte, il
proprio mostro di spalle grande in primo piano, quello selvatico davanti più lontano) il difetto era il metodo: rimpicciolire il
disegno a matita si porta dietro tratteggio e sfumature e sembra un disegno sgranato; più pixel lo allontanava ancora di più. Gli
sprite dello screenshot hanno pochi pixel grossi, tre o quattro toni per colore e il contorno scuro, e metà dell'effetto lo fa la
scena. Denis ha confermato («sì») che «più vero» vuol dire come quegli sprite.
- `disegno2d/pulito.py`: pixel art pulita dal disegno, riquadro 80x80. Ogni pixel del disegno diventa un numero sulla scala di
  fuoco del disegno (`SCALA`: r3, r2, r1, r0, o1, o0, y1, y0), il numero si liscia (il tratteggio sparisce, la luce del disegno
  resta), si fa la media nel blocco e si arrotonda: zone piatte con bordi puliti; pixel soli tolti; contorno di un pixel (marrone
  scuro sul pelo, rosso scurissimo vicino a fiamme e calze); linee interne solo dai tratti scuri più lunghi del disegno; i buchetti
  bianchi degli occhi del disegno si chiudono; occhi, naso, bocca con la lingua e guancia sono timbri fatti a mano.
- `disegno2d/lotta80.py` → `solo2d/lotta_davanti` (l'avversario: 4 fotogrammi a 6 al secondo più uno a occhi chiusi da mettere
  ogni tanto; coda e cresta che fiammeggiano, testa e petto che scendono di un pixel col respiro, dita sulle zampe, braci che
  salgono) e `solo2d/lotta_spalle` (il tuo, di spalle). Il disegno c'è solo davanti: vista dalla parte opposta la sagoma è la
  stessa, specchiata, quindi lo sprite di spalle è la sagoma del disegno girata, ridipinta dentro: la nuca al posto del muso
  (pelo con la luce in alto e la cresta che scende a punte rosse), il dietro delle orecchie, niente petto chiaro. Il burattino 2D
  di spalle (provato) era meno leggibile. Scala consigliata: l'avversario a 1x, il tuo a 3x (pixel grossi come nello screenshot).
- Pagina `python3 anteprime/mk_niumon_lotta.py` (`anteprime/niumon_lotta.tpl.html`), pubblicata su
  https://claude.ai/artifact/YDzxScVHMophiGdL2Bi4r8: la scena di lotta in 640x360 logici (bosco di notte in tre piani sfocati,
  luna velata, raggi, nebbia che scorre, cenere fredda, luce del fuoco a terra, bagliore intorno alle volpi, ombra), la tua volpe
  di spalle in basso a sinistra tagliata dal bordo, quella selvatica davanti nella radura; nome, livello e PS; quattro mosse
  (Fiammata, Graffio, Braci, Coda ardente) con gli effetti, lampo e scossa quando colpisce, turno dell'avversario, esausta e
  un'altra che esce dalla nebbia. Sul telefono in verticale le mosse scendono sotto la scena; girato, la scena prende tutto lo
  schermo. Sotto: i due sprite da vicino e quello di prima.
- Da fare se Denis approva: un disegno suo da dietro renderebbe lo sprite di spalle esatto; poi la mappa in 4 direzioni a 64 px
  (come il piano) da un turnaround della volpe, con le stesse regole.

## Versione colorata in 2D sulla base 3D (14 ottobre, notte)

Denis: «prova a farlo 2d facendolo più simile che ne so ad un evee va bene? mettici poco tempo». Fatto in fretta, sulla stessa base:
- colori come uno sprite disegnato a mano (`pixel.finish2d`, `sprite.STILE = '2d'`): per ogni parte un colore pieno, un'ombra
  semplice sotto (dalla luce ammorbidita) e un filo di luce sul bordo in alto; fiamme, cresta, gorgiera e bordo delle orecchie a
  fasce contate in pixel dal bordo della loro zona (rosso, rosso arancio, arancio, giallo, cuore chiaro); contorno marrone vicino al
  pelo e rosso scuro vicino alle fiamme, di due pixel nella misura grande; linee interne dello stesso colore;
- proporzioni più tenere (in `volpe.py`): testa ×1,08 (`HS`), orecchie ×1,12, corpo più corto di 3 unità (`KB`: fianchi, zampe
  dietro e coda vengono avanti), gorgiera più folta. Di Eevee si prende solo l'idea di creatura tenera, niente dei suoi pezzi né
  dei suoi colori: la volpe resta quella del disegno;
- per far stare testa e orecchie più grandi nel riquadro la scala è 1,82 unità per pixel a 64 px (1,82/3 a 192).
La prima prova (toni presi dalla luce della base) è in `prima/`, con gli stessi nomi; si rifà con `sprite.STILE = 'base'` e il
`volpe.py` del commit fc85cfc.

## Cosa c'è

- `direzioni/`: le 8 direzioni (giu, giu_sinistra, sinistra, su_sinistra, su, su_destra, destra, giu_destra), tutte disegnate dalla
  base, nessuna specchiata. Fermo animato: 12 fotogrammi a 8 al secondo (coda e cresta che fiammeggiano, respiro, palpebre al
  fotogramma 9, tre braci che salgono). `mappa_*` riquadri da 64×64 con il punto d'appoggio in (32, 56); `grande_*` riquadri da
  192×192 (la misura della lotta) con il punto d'appoggio in (96, 168). Ogni `.json` ha i dati del piano (asset_id, frame_width,
  frame_height, frames, fps, loop, direction, pivot, hitbox, source, version) più `w`, `h`, `n`, `anchor` per la pagina.
  Il punto d'appoggio è lo stesso punto della base in tutte le direzioni (a terra, sotto il centro tra muso e coda), così girandosi
  non salta. Nome provvisorio nei file: `volpefuoco`.
- `giro_mappa.png`, `giro_grande.png`: 16 viste ogni 22,5 gradi, ferme.
- `come_il_disegno.png` (160 px, pixel art) e `base_come_il_disegno.png` (la base colorata): la vista del disegno di Denis, con la
  testa girata come nel disegno, per il confronto.

## Come sono fatti (`fai/`)

1. `rs.c`: il raymarcher dei volumi (`gcc -O3 -march=native -ffast-math -fopenmp -o rs rs.c -lm`). Pezzi: ellissoidi, coni a
   punte tonde, lastre, e una forma gonfiata da una sagoma 2D. Per ogni pixel dà punto, normale, profondità e pezzo.
2. `base.py`: il costruttore del modello (gruppi con raccordo morbido, trasformazioni, telecamera ortografica).
3. `volpe.py`: la volpe. Unità ≈ 10 px del disegno; x avanti, y a sinistra, z in su. Corpo, zampe con le calze rosse, gorgiera a
   punte, ciuffo sulla schiena, testa (gira sul collo), muso, ciuffi delle guance, cresta (una massa che sale dalla fronte e si apre
   in lingue che vanno indietro), orecchie (coni schiacciati con due ciuffi di fiamma), braci. Ogni movimento dipende solo da `p`.
4. `sagome.py`: la coda è la sagoma della coda del disegno portata nel piano del corpo (telecamera del disegno stimata: 62 gradi di
   lato, 15 dall'alto) e gonfiata; `coda_sagoma.png` è la sagoma già portata nel piano. Per il fermo la sagoma si piega con delle
   onde che lasciano ferma la base.
5. `colora.py`: tavolozza fissa di 27 colori presi dal disegno. Ogni sottopixel ha un'etichetta (pelo, calze, fiamma, cresta,
   gorgiera, orecchio dentro e fuori, oppure un colore fisso del muso) e due valori continui (luce, fiamma); occhi, naso, bocca
   aperta con la lingua, guance e la V sulla fronte sono disegnati sulla testa e la seguono. Il cuore giallo della coda segue la
   sagoma (più lontano dal bordo = più giallo).
6. `pixel.py`: rimpicciolisce (etichetta più votata per blocco, con precedenza agli occhi e al muso), sceglie i toni dopo (fasce
   pulite), toglie i pixel isolati, mette le linee interne dove c'è un salto di profondità tra parti diverse e il contorno scuro di
   un pixel fuori dalla sagoma.
7. `occhi64.py`: a 64 px gli occhi sono timbri fatti a mano (davanti 5×7, tre quarti 4×7, lato 3×7, lontano, chiusi), scelti da
   quanto l'occhio guarda verso di noi e tenuti dentro la testa.
8. `sprite.py`: uno sprite (direzione, grandezza, posa). Nelle viste davanti e di lato la testa si gira un poco verso di noi, come
   nel disegno (20 gradi a tre quarti, 12 di lato, niente da dietro). `produci.py ..` rifà tutti i fogli; `confronto.py` la vista
   del disegno.

Controlli fatti: nessun pixel tocca il bordo del riquadro in nessun fotogramma (niente fiamme tagliate), i piedi stanno sulla stessa
riga in tutti i fotogrammi, i fogli si rifanno uguali al pixel dagli script.

Da decidere con Denis (domande nella pagina): la testa girata verso di noi nelle viste davanti e di lato; la coda da dietro (copre il
corpo perché sta nel piano del corpo come nel disegno: si può piegare un poco di lato); la grandezza sulla mappa (64×64 col corpo
piccolo per far stare la coda); il nome.
