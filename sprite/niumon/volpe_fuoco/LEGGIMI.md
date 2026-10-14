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
