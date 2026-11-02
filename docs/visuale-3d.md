# La visuale in terza e prima persona della modalità zombie (anteprima a parte, 2 novembre)

Denis: «fai un'anteprima a parte facendo vedere come sarebbe la modalità zombie se la telecamera fosse tipo in terza persona e prima
persona». Non è nel gioco e non è nell'Anteprima 49: è una pagina sua, per vedere e provare dal telefono come sarebbe.

## Cosa c'è

- Nella partita zombie (la stessa di oggi: ondate, armi, abilità, Bara, barriere, cancelli, sfida, musica) il bottone **«Visuale»** in alto a
  destra, sotto la bussola (o il tasto C), passa tra tre visuali: **Dall'alto** (quella di oggi), **Terza persona**, **Prima persona**. La
  prima partita parte da sola in terza persona (mezzo secondo dopo che la mappa è pronta); la scelta resta per le partite dopo.
- **Terza persona**: la telecamera dietro le spalle dell'eroe, un po' a destra (150 unità indietro, 13° sopra l'orizzonte all'inclinazione
  di partenza), che guarda 80 unità davanti a lui; l'eroe in basso. Non entra nei muri: se tra l'eroe e la telecamera c'è qualcosa di alto
  (muri, case, la cripta: una griglia delle altezze fatta dai pezzi dei prop, senza tetti né alberi) viene avanti fino a poco prima.
- **Prima persona**: gli occhi dell'eroe (47 unità da terra, un poco di dondolio camminando), il mirino al centro, l'arma in mano in basso a
  destra (il modello 3D dell'arma, ARMI3D, visto da dietro, con le mani e le maniche): rinculo, vampa, carrello, pompa, tamburo; in ricarica
  si abbassa e si piega, presa un'arma nuova sale dal basso. Morendo la vista cade a terra.
- I comandi sono quelli di oggi: la levetta a sinistra cammina rispetto a dove si guarda (in su = avanti), il dito a destra gira la visuale
  (destra e sinistra) e guarda in alto e in basso (su e giù: è l'inclinazione di oggi, che in terza persona alza o abbassa la telecamera e in
  prima persona alza o abbassa lo sguardo); tastiera WASD, Q/E, R/F come oggi. Si spara da soli a chi è nella visuale (104: il fascio largo,
  ±22°, ±30° per le armi corte), col mirino rosso sullo zombie preso; la striscia del colpo parte dalla bocca dell'arma.

## Come si disegna (src/js/105-visuale-3d.js)

- **WebGL** (il disegno 3D del telefono; WebGL 2 se c'è, altrimenti 1; senza, il bottone lo dice e resta la vista dall'alto). La mappa vera:
  gli stessi pezzi 3D che il motore (anteprime/zombie/motore.js) costruisce per la vista dall'alto, rifatti una volta in triangoli.
  - Facce (`face`): ognuna con la sua texture dipinta dal motore (tre toni, segni del materiale, il disegno in più `o.tex`), raccolte in fogli
    da 2048×2048 (0,95 pixel per unità: 3 fogli per la mappa intera), con le mipmap.
  - Facce piatte (`facepoly`): il colore del materiale per il loro lato; quelle col disegno (lapidi incise, insegne) dipinte nel loro piano.
  - Pannelli (`plane`: recinti, cancellate, finestre): la loro texture coi buchi, dai due lati; quelli su un muro un poco staccati. Le finestre
    rifanno la loro texture quando cambiano le assi.
  - Poligoni a terra (`poly`), aste (`line`: due listelli incrociati), chiome e zucche (`ball`: dischi dipinti a tre toni che guardano la
    telecamera). I contorni (`hull`) no: il contorno scuro lo fa l'ultimo passaggio (sotto).
  - I disegni a mano (`fn3`: tronchi e rami, il mais, buche, dettagli): dipinti dal motore stesso «dalla parte da cui li si guarda» (16
    direzioni, a 25° di inclinazione) e messi in piedi come cartoline che guardano la telecamera; quelli piatti (buche, botole) una volta
    dall'alto e stesi a terra. Si fanno quando servono (al massimo 12 a fotogramma, i più vicini prima) in un atlante loro; pieno, si ricomincia.
  - Il terreno: la foto cotta dal motore (a metà grandezza), stesa a terra.
  - Quello che cambia nella partita resta giusto: i prop nascosti (`hide`, il cancello aperto), i pezzi con `vis()` (assi delle barricate,
    ante della botola), le parti delle case (con l'eroe dentro niente tetto; al pianterreno niente piano di sopra).
- **Personaggi**: zombie, boss, eroe (in terza persona) e Bara sono i loro disegni dipinti (CR, EROE.arciere, la Bara di ARMI), girati dalla
  parte giusta rispetto alla telecamera e inclinati come li vede (`CR.cam`, `RIGCAM` dall'altezza da cui li si guarda), messi in piedi come
  cartoline; uno zombie si ridipinge solo quando cambia quello che mostra (la posa a dodicesimi, il verso, l'inclinazione, la grandezza), in un
  posto suo dell'atlante. L'uscita da terra, la morte che affonda, il lampo bianco quando lo si colpisce come dall'alto.
- **La notte**: la stessa ricetta della vista dall'alto per ogni punto del mondo: tutto più scuro e blu (il velo `rgba(10,14,34,.42)`) tranne
  vicino alle luci (le 11 più vicine più quella dell'eroe, che tremolano come le loro) e all'eroe, con la luce calda che si somma; la nebbia
  con la distanza (in terza persona da 230 unità, in prima da 150), più fitta nelle zone chiuse (il velo) e ai bordi del mondo; la luna a
  ovest; le fiamme (lanterne, candele, torce, zucche) come fiammelle e aloni sommati.
- **Il contorno scuro**: l'ultimo passaggio guarda dove la profondità salta e scurisce il bordo della cosa davanti (come i contorni spessi
  dei disegni), sfumato con la nebbia; poi la vignetta.
- **A terra** i disegni della partita (gli avvisi del Becchino, il fuoco della Bomba, la Tagliola, l'onda del Rintocco, le crepe): quelli del
  direttore (`drawGround`) dipinti in una tela vista dall'alto intorno all'eroe e stesa a terra, solo quando c'è qualcosa.
- **Sopra, in 2D**: le strisce dei colpi (dalla bocca dell'arma), le esplosioni, le monete che saltano, il sangue, il mirino, l'arma in prima
  persona. Le levette, la vignetta e la bussola le disegna il motore come oggi.
- **Telefoni lenti**: oltre 34 ms a fotogramma per 1,6 s la qualità scende da sola (immagine a 2/3, 6 luci, contorno più leggero); `LOWFX`
  rispettato. Memoria: 3 fogli da 2048 (48 MB) più due atlanti da 2048×1024, il terreno a metà, i fogli 2D buttati dopo averli mandati.

## L'aggancio nel motore (anteprime/zombie/motore.js)

Senza questo file non fa niente: in `render()` se `W.v3.on` il mondo lo disegna `W.v3.draw(dt, Wp, Hp, dpr)` (al posto di sfondo,
`drawWorld` e `drawDark`), poi il motore disegna levette, vignetta e bussola come sempre. In `ZM` due cose in più: `HSTYLE` (lo stile
dell'eroe della mappa) e `bara()` (la Bara delle Sorprese).

## La pagina

`python3 anteprime/mk_visuale.py <cartella>`: l'Anteprima 49 (il gioco di oggi più 98–104) più 105, divisa come il gioco pubblicato
(`app/mk_claude.py`); alla prima apertura c'è già un eroe e il menu è sulla Zombie: si tocca Gioca. Pubblicata a parte su
https://claude.ai/artifact/EsX3514z5xM6WsFLEAGFhW («Mossbound Visuale zombie»; si aggiorna ripubblicando la stessa cartella).

## Prove

`python3 tests/v3/mk.py`, poi `node tests/v3/visuale.js` (13 controlli: la partita parte in terza persona col bottone e il mondo in 3D;
avanti va dove guarda la telecamera, girando la visuale cammina nella direzione nuova, a destra alla sua destra; spara allo zombie davanti,
zombie ed eroe disegnati; in prima persona l'arma in mano, niente eroe, lo zombie preso; in casa niente tetto e la telecamera dentro i muri;
il fuoco della Bomba e la Tagliola a terra; la Bara; «Dall'alto» torna com'era e si torna in terza; effetti bassi; nessun errore di disegno;
al massimo tre fogli). Il browser delle prove disegna il 3D senza scheda grafica (4–7 fotogrammi al secondo): le prove aspettano di più e
vanno a 1×. Foto `tests/v3/vi_*.png`.

## Da sapere

- La preparazione la prima volta che si passa al 3D: qualche secondo sul telefono (qui 6–7 s senza scheda grafica, di cui 3 la prima
  pittura delle armi appese ai muri, che si farebbe comunque la prima volta che compaiono), con la scritta «Preparo la visuale 3D…».
- Non si vedono ancora in 3D: i compagni sulla mappa, i corvi, il fumo, le foglie e le lucciole, i bossoli e i caricatori che cadono, la
  fiamma del lanciafiamme (resta il danno), le cose che il direttore disegna sopra a tutto (l'anima che vola, la colonna di luce).
- Le figure sono cartoline dipinte (non modelli 3D veri): da molto in basso si vedono un po' «dall'alto»; dentro le case la telecamera in
  terza persona sta vicina all'eroe.
