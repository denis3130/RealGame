# La visuale in terza e prima persona della modalità zombie (anteprima a parte, 2 novembre)

**Per ogni cosa nuova in 3D vero** (dal 4 novembre, Denis: «d'ora in poi ogni cosa in 3d dovrai adoperare per farla al meglio come questa
che hai fatto»): la formula dello zombie base, in `sprite/mostri3d/LEGGIMI.md` («La formula per il 3D»). Quello che è già nella pagina resta com'è finché Denis non chiede di rifarlo.

Denis: «fai un'anteprima a parte facendo vedere come sarebbe la modalità zombie se la telecamera fosse tipo in terza persona e prima
persona». Non è nel gioco e non è nell'Anteprima 49: è una pagina sua, per vedere e provare dal telefono come sarebbe.

## Cosa c'è

- Nella partita zombie (la stessa di oggi: ondate, armi, abilità, Bara, barriere, cancelli, sfida, musica) il bottone **«Visuale»** in alto a
  destra, sotto la bussola (o il tasto C), passa tra tre visuali: **Dall'alto** (quella di oggi), **Terza persona**, **Prima persona**. La
  prima partita parte da sola in terza persona (mezzo secondo dopo che la mappa è pronta); la scelta resta per le partite dopo.
- **Terza persona**: la telecamera dietro le spalle dell'eroe, un po' a destra (150 unità indietro, 13° sopra l'orizzonte all'inclinazione
  di partenza), che guarda 80 unità davanti a lui; l'eroe in basso. Non entra nei muri: se tra l'eroe e la telecamera c'è qualcosa di alto
  (una griglia delle altezze fatta solo dalle cose grandi: case, muri lunghi, la cripta; senza tetti né alberi, e senza lampioni, pilastri,
  lapidi) prova prima l'altra spalla o il mezzo, poi un poco più in alto (sopra il recinto, sopra il muretto), e solo allora viene avanti
  fino a poco prima; passa da un posto all'altro piano. Quando è proprio addosso all'eroe lui diventa mezzo trasparente.
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
  - Il terreno: la foto cotta dal motore, intera (1,5 pixel per unità), stesa a terra, con il filtro che la tiene nitida anche vista di
    sbieco e il dettaglio fine vicino alla telecamera (sotto, «La mappa come dall'alto»).
  - Quello che cambia nella partita resta giusto: i prop nascosti (`hide`, il cancello aperto), i pezzi con `vis()` (assi delle barricate,
    ante della botola), le parti delle case (con l'eroe dentro niente tetto; al pianterreno niente piano di sopra).
- **L'eroe in 3D vero** (2 novembre, Denis: «metti il pg in 3d, non può essere in 2d, ce l'abbiamo già il modello in 3d usiamo quello»): in
  terza persona l'eroe è fatto di triangoli dai pezzi del suo modello 3D (`sprite/eroe3d/disegno_eroe.js`). `EROE.rig3d(verso, mossa, p, o)`
  dà, senza disegnare niente, la posa di quel momento: la stessa del disegno (respiro, passi, mira, rinculo, ricarica, colpito, le riparazioni
  col martello), il corpo, la testa, i piedi, le mani e l'arma; il disegno dell'eroe nel gioco non cambia (800 disegni confrontati al pixel col
  file di prima: identici). Nella scena:
  - il **corpo a goccia**: gli anelli della giubba (`PROF`) girati, schiacciati, inclinati come li muove la posa; sopra la sua texture che gira
    intorno al corpo (orlo, colletto a V, cucitura coi bottoni, la cinghia, la cintura con la fibbia d'oro, i colori del vestito);
  - il **cappuccio** come una palla vera col **viso** fatto punto per punto sulla palla (l'apertura con l'anello scuro, la pelle, i due occhi
    grandi con la luce, le guance, la bocca quando lo colpiscono, gli occhi strizzati o chiusi; la cucitura sopra il cappuccio): si gira e
    annuisce con la testa;
  - i **piedi** tondi (due palle unite, come le scarpe del gioco), le **mani** (sull'impugnatura, sull'astina o sulla pompa, quella libera al
    fianco, quella che porta il caricatore nella ricarica), il **martello** quando ripara una finestra;
  - l'**arma** vera di ARMI3D: un «kit» che invece di disegnare fa triangoli coi pezzi dei modelli delle armi (prismi, cilindri con le bocche
    scure, sfere, aste, piastrine), coi colori dei loro materiali e le parti che si muovono (carrello, pompa, tamburo, canne che girano, il
    caricatore che esce, il razzo); ogni posa dell'arma si costruisce una volta e si riusa (le parti in pochi passi, 64 modelli al massimo).
  Dipinto come i disegni del gioco: tre toni che sfumano con la luce dall'alto a sinistra della telecamera, il bordo chiaro, il contorno scuro
  spesso (gli stessi pezzi un poco più grandi, girati al rovescio), poi la notte, le luci e la nebbia come tutto il resto; lampeggia bianco
  quando lo colpiscono, mezzo trasparente con l'invisibilità, cade sul fianco. Le teste con pezzi propri (la coda della Cacciatrice, la piuma
  del Bardo, gli occhiali dell'Alchimista, maschera e fascia del Ninja, l'elmo del Balestriere, corna e punta del Druida, i capelli e i
  cappelli dell'aspetto) sono la testa dipinta dal gioco, vista dalla parte giusta come una palla al suo posto; il resto è in 3D.
- **L'arma in prima persona in 3D**: lo stesso modello dell'arma, con le due mani e le maniche della giubba, in basso a destra e girata verso
  il centro (così se ne vede il fianco, come negli sparatutto), più piccola per le pistole; dondola coi passi, rincula a ogni colpo, nella
  ricarica sale, si gira sul fianco e la mano libera toglie e rimette il caricatore; presa un'arma sale dal basso. Sta sempre davanti a tutto
  (non entra nei muri). La vampa: due luci morbide alla bocca.
- **Gli altri personaggi**: zombie, boss e Bara sono i loro disegni dipinti (CR, la Bara di ARMI), girati dalla parte giusta rispetto alla
  telecamera e inclinati come li vede (`CR.cam`, `RIGCAM` dall'altezza da cui li si guarda), messi in piedi come cartoline; uno zombie si
  ridipinge solo quando cambia quello che mostra (la posa a dodicesimi, il verso, l'inclinazione, la grandezza), in un posto suo dell'atlante.
  L'uscita da terra, la morte che affonda, il lampo bianco quando lo si colpisce come dall'alto. Sotto l'eroe, gli zombie e la Bara un'ombra
  morbida a terra.
- **La notte**: la stessa ricetta della vista dall'alto per ogni punto del mondo (`drawDark` e `drawLights` del motore): tutto più scuro e
  blu (il velo `rgba(10,14,34,.42)`) tranne nei buchi intorno alle luci (le 11 più vicine, larghi 1,2 volte il loro raggio, che tremolano come
  le loro) e intorno all'eroe (120 unità, senza luce sua), con la pozza di luce calda delle luci che si somma; la nebbia
  con la distanza (in terza persona da 230 unità, in prima da 150), più fitta nelle zone chiuse (il velo) e ai bordi del mondo; la luna a
  ovest; le fiamme (lanterne, candele, torce, zucche) come fiammelle e aloni sommati. Il **cielo** va dal colore della nebbia all'orizzonte al
  blu profondo della notte in alto, con 240 **stelle** che tremolano (non con `LOWFX`). La **vampa** di ogni colpo accende per un attimo una
  luce calda alla bocca dell'arma, che illumina l'eroe, gli zombie e quello che c'è intorno.
- **Il contorno scuro**: l'ultimo passaggio guarda dove la profondità salta (a uno e a due pixel di distanza, così è spesso come quello
  della mappa dall'alto; sul telefono lento a uno) e scurisce il bordo della cosa davanti, sfumato con la nebbia; i colori un poco più pieni
  (+10%), come quelli della mappa; poi la vignetta.
- **A terra** i disegni della partita (gli avvisi del Becchino, il fuoco della Bomba, la Tagliola, l'onda del Rintocco, le crepe): quelli del
  direttore (`drawGround`) dipinti in una tela vista dall'alto intorno all'eroe e stesa a terra, solo quando c'è qualcosa.
- **Sopra, in 2D**: le strisce dei colpi (dalla bocca dell'arma), le esplosioni, le monete che saltano, il sangue, il mirino, l'arma in prima
  persona. Le levette, la vignetta e la bussola le disegna il motore come oggi.
- **Telefoni lenti**: oltre 34 ms a fotogramma per 1,6 s la qualità scende da sola (immagine a 2/3, 6 luci, contorno più leggero, niente
  muri ridipinti né nitidezza in più, dettaglio del terreno più leggero); `LOWFX` rispettato (niente vita della mappa, niente stelle, niente
  dettaglio). Memoria: 3 fogli da 2048 (48 MB) più due atlanti da 2048×1024 (16 MB), il terreno intero (circa 43 MB con le mipmap; a metà se
  il telefono è già lento quando si prepara), il foglio dei muri vicini (16 MB), i fogli 2D buttati dopo averli mandati. Se il telefono
  perde il disegno 3D (memoria finita), torna da solo alla vista dall'alto e lo dice («La visuale 3D si è fermata: torno dall'alto»).

## La mappa come dall'alto (2 novembre, seconda richiesta)

Denis: «della visuale in prima e terza persona non riesci a fare la mappa fatta bene come la modalità zombie esistente nel gioco?». Le cause,
guardate mettendo una accanto all'altra la stessa scena dall'alto, in terza e in prima persona: il terreno era a metà grandezza (da pochi
passi i ciottoli erano una macchia), le texture dei muri a circa un pixel per unità (vicine, sfocate), la notte diversa da quella dall'alto
(una luce calda grande intorno all'eroe, pozze più chiare), il contorno più sottile e i colori più spenti, la telecamera in terza persona che
accanto a un lampione finiva sulla nuca dell'eroe, e niente della vita della mappa. Fatto:

- **Il terreno nitido**: la foto intera del motore (1,5 pixel per unità; a metà solo su un telefono già lento), il filtro anisotropo su tutte
  le texture con le mipmap (8, 4 sul telefono lento: il terreno e i muri visti di sbieco restano nitidi) e un **dettaglio fine** vicino alla
  telecamera (pieno fino a 60 unità, sparisce a 200): un'immagine di 256 pixel che si ripete senza giunture, con tre grane in una, scelte dal
  colore del terreno stesso: fili d'erba dove è verde, ciottoli dove è terra, grana e crepette dove è pietra o ghiaia; a due grandezze (23 e 37
  unità) così non si vede ripetere (`v3DetailTex`, `uDet` nel disegno delle facce).
- **I muri vicini nitidi**: le facce dipinte delle cose entro 130 unità dalla telecamera (110 in prima persona) si **ridipingono con la
  ricetta del motore** (`texture()`: lo stesso seme, gli stessi segni dei materiali, la stessa luce, il disegno in più) fino a 4 pixel per
  unità in un foglio loro da 2048 (`V3NA`, `v3TexHi`, `v3Near`), al massimo 5 ms a fotogramma, le più vicine prima; quando una cosa ha tutte
  le facce pronte si disegna con quelle al posto delle sfocate (`v3NearDraw`); pieno il foglio, si ricomincia dalle più vicine. Le altre facce
  tra 50 e 150 unità un poco più nitide (`uShp`). Niente con `LOWFX` o sul telefono lento.
- **La notte come dall'alto**: vedi sopra («La notte»): l'eroe senza luce calda sua, solo il buco nella notte (120 unità, profondo 0,6, come
  `drawDark`); ogni luce il buco largo 1,2 volte il raggio e la pozza calda larga il raggio, forte 0,8 della sua luce, meno quando la sua casa
  sfuma (come `drawLights`); il velo 0,42.
- **Il contorno spesso e i colori pieni**: vedi sopra («Il contorno scuro»).
- **La telecamera in terza persona libera**: la griglia delle altezze prende solo le cose grandi (una cosa conta se la sua parte alta, dai 34
  in su, è larga almeno 34; di lei solo le facce lunghe almeno 18 e alte almeno 12, o piatte di almeno 16×24), così un lampione, la sua
  lanterna, un pilastro, una lapide non la spingono addosso all'eroe; guarda dai 14 unità dietro la testa in poi (un muro che l'eroe tocca
  non la ferma subito); sette posti in ordine (spalla destra, mezzo, spalla sinistra, poi gli stessi un poco più in alto, poi più in alto
  ancora) e prende il primo libero o quello che arriva più lontano; passa da uno all'altro in circa un terzo di secondo. Quando è proprio
  addosso (meno del 42% della distanza) l'eroe è mezzo trasparente (0,55), disegnato prima solo nella profondità così i suoi pezzi non si
  vedono uno attraverso l'altro.
- **La vita della mappa** (`v3Life`): quella che il motore muove anche dall'alto (`updateAmbient`), disegnata in 3D: la **nebbia bassa** che
  scorre verso est stesa a terra (il motore la muove solo quando disegna dall'alto, qui la muove la visuale), il **fumo** dei camini e della
  carrozza bruciata, le **foglie** che cadono dagli alberi, le **lucciole** verdi che si accendono e si spengono, lo **stormo di corvi** che
  passa in alto battendo le ali (sei pose, girati dove volano) e i **corvi posati** su tetti e croci (due pose, la testa da una parte e
  dall'altra) che volano via quando ci si avvicina, le **falene** intorno ai vetri accesi dei lampioni. Niente con `LOWFX`.
- **Se il telefono perde il disegno 3D** (la memoria della scheda grafica finita): torna da solo alla vista dall'alto, con la scritta.

Il costo: la memoria grafica sale di circa 50 MB (il terreno intero, circa 43 MB invece di 11, e il foglio dei muri vicini, 16 MB); a
fotogramma la vita della mappa sono pochi disegni (le cose vicine, quelle fuori dalla nebbia no), i muri vicini al massimo 5 ms solo mentre
se ne ridipingono di nuovi (camminando verso cose nuove), poi niente. Foto di confronto (dall'alto, terza, prima persona negli stessi tre
posti) fatte con uno script della cartella di lavoro.

## Tripla A (2 novembre, terza richiesta)

Denis: «rendilo tripla A». Quattro pezzi, ognuno in un file suo (106, 107, 108 si agganciano a 105 e senza di loro 105 disegna come prima):

- **Luci da film** (in 105): le lanterne illuminano dal lato giusto (la faccia girata verso la luce più di quella girata dall'altra parte), le
  strade di pietra e la ghiaia bagnate che luccicano sotto le lanterne e la luna (l'erba no), la luce che si vede nella nebbia intorno alle
  sei lanterne più vicine, la nebbia bassa che si muove (un rumore morbido che scorre, più fitta in basso), l'ombra lunga e morbida dei
  personaggi dalla luce più forte; poi il passaggio finale: il bagliore delle cose luminose (bloom, a un quarto e a un ottavo), una curva
  morbida per le luci forti (niente bianco bruciato), ombre fredde e luci calde, un poco di contrasto, la vignetta, i colori che si separano
  appena ai bordi, la grana; colpito, un lampo che scuote i colori; con poca vita i colori si spengono e i bordi battono rossi col cuore.
  L'arma e le mani in prima persona prendono meno luce (niente bianco).
- **Zombie e boss in 3D vero** (`src/js/106-zombie-3d.js`, `Z3`): tutti e sette (zombie della cripta, strisciante, minatore, cane, zombie
  della lanterna, Becchino, Spaventapasseri) fatti di triangoli dalle stesse pose dei loro disegni (i conti delle pose copiati da
  `sprite/mostri/disegno_mostri.js`, che non cambia: i fogli della lanterna restano identici), dipinti a tre toni col contorno scuro come
  l'eroe: il minatore con la lampada sul casco che illumina la strada davanti, la lanterna con la sua luce, il Becchino col cilindro, la pala
  e la gabbia toracica che brilla, lo Spaventapasseri che gira come una trottola col corvo che vola. Ogni mossa è una serie di pose fatte una
  volta (16 da fermo, 24 le altre) e la scheda grafica passa da una all'altra; gli occhi brillano e pulsano; muoiono cadendo e affondando,
  escono da terra. Al massimo 5 ms a fotogramma per le pose nuove (3 sul telefono lento); finché una posa non è pronta resta la cartolina
  dipinta di prima.
- **Effetti della battaglia in 3D** (`src/js/107-effetti-3d.js`, `FX3`): la scia di ogni colpo come un fascio di luce dalla bocca dell'arma
  (più fine e lunga per i fucili, a ventaglio per le pompe) e la vampa a stella; scintille e polvere dove il colpo prende il muro; il sangue
  scuro dello zombie colpito che cade e lascia le macchie a terra; i bossoli d'ottone che saltano e tintinnano; le esplosioni (palla di fuoco,
  il lampo che illumina tutto intorno, l'anello a terra, il fumo, i detriti, la bruciatura); le zolle quando gli zombie escono da terra; la
  telecamera che trema con le esplosioni, i colpi grossi e quando ti colpiscono, in prima persona lo sguardo che rincula a ogni colpo; i segni
  sul mirino quando colpisci (rossi quando uccidi) e un arco rosso sul bordo dalla parte da cui ti hanno colpito.
- **Il mondo più ricco** (`src/js/108-mondo-3d.js`, `MW`):
  - **L'erba vera**: fili 3D dove il terreno è erba (letto dalla foto del terreno a un pixel ogni due unità, dal suo colore come decide il
    terreno stesso; mai sui solidi, nelle case, sui portici, sulle pedane), col colore del terreno sotto, scuri alla radice e chiari in punta,
    qualche stelo alto e secco color paglia. Il vento li muove a ondate che corrono sul prato, con le raffiche; l'eroe e i sette zombie più
    vicini li piegano e li schiacciano dove passano, e ai loro piedi sono più scuri. A pezzi di 48 unità intorno a dove si guarda (210 unità
    in terza persona, 150 in prima; ×0,72 e metà fili sul telefono lento), fatti pochi millisecondi a fotogramma, i più vicini prima; verso il
    bordo si abbassano fino a sparire. Non scrive la profondità (così il contorno scuro non ripassa ogni filo): si disegna dopo i personaggi,
    i fili davanti ai loro piedi li coprono, i pezzi dal più lontano al più vicino.
  - **I coni di luce** sotto i lampioni e le lanterne appese fuori (non quelle dentro le case): la luce che si vede nella nebbia, più forte
    vicino al vetro, che trema con la fiamma e respira con la nebbia che ci passa, e il **pulviscolo** che ci galleggia dentro e brilla (15
    granelli a lampione, 7 sul telefono lento, solo vicino alla telecamera).
  - **Le nuvole che passano sulla luna**: 27 banchi scuri tutto intorno al cielo che scorrono piano; tre all'altezza della luna, a un terzo di
    cielo l'uno dall'altro, così ogni tanto uno la copre; coprono le stelle e la luna, il bordo diventa d'argento quando le passano davanti
    (di più dalla parte della luna).
- La telecamera in terza persona: se l'eroe ha le spalle contro una cosa grande e alta (il pozzo, una tettoia) prova anche più in alto,
  guardandolo dall'alto, e se finisce comunque dentro quella cosa non la disegna (mai una casa, mai una cosa grande), invece di riempire lo
  schermo col suo interno.
- Effetti bassi: niente erba, coni, pulviscolo e grana, meno nuvole e particelle, niente tremolio della telecamera.
- Tempi qui (senza scheda grafica, i passi del disegno misurati uno per uno): l'erba 3,8–4,8 ms con 9.000–10.000 fili nel prato, i coni
  0,05–0,1 ms, il cielo con le nuvole 1,3–1,8 ms; il disegno di un fotogramma (la parte nel programma) 3,3–4,1 ms nelle prove. Memoria: i pezzi
  d'erba al massimo 150 (circa 90 KB l'uno), la foto piccola del terreno 4,5 MB, le nuvole 256 KB.
- Foto: `tests/v3/vi_zombie4.jpg` (zombie, strisciante, minatore, cane, Becchino e Spaventapasseri in 3D nelle quattro direzioni) e `tests/v3/vi_tripla_a.jpg` (gli stessi quattro posti prima e dopo: il prato col pozzo, il lampione in prima persona, gli zombie e i due
  boss, la luna).

## Nella pagina tripla A (3 novembre)

Denis: «fammi giocare in prima persona e l'altra visuale in 3d»: la stessa visuale è anche nella pagina «Mossbound tripla A», dove si parte in
prima persona e il bottone va alla terza persona e poi dall'alto; lì disegna col contesto 3D della tripla A (uno solo). Dettagli in
`docs/tripla-a.md` («La Zombie in prima persona»). In questa pagina non cambia niente (si parte ancora in terza persona).

## L'aggancio nel motore (anteprime/zombie/motore.js)

Senza questo file non fa niente: in `render()` se `W.v3.on` il mondo lo disegna `W.v3.draw(dt, Wp, Hp, dpr)` (al posto di sfondo,
`drawWorld` e `drawDark`), poi il motore disegna levette, vignetta e bussola come sempre. In `ZM` due cose in più: `HSTYLE` (lo stile
dell'eroe della mappa) e `bara()` (la Bara delle Sorprese).

## La pagina

`python3 anteprime/mk_visuale.py <cartella>`: l'Anteprima 49 (il gioco di oggi più 98–104) più 105–108, divisa come il gioco pubblicato
(`app/mk_claude.py`); alla prima apertura c'è già un eroe e il menu è sulla Zombie: si tocca Gioca. Pubblicata a parte su
https://claude.ai/artifact/EsX3514z5xM6WsFLEAGFhW («Mossbound Visuale zombie»; si aggiorna ripubblicando la stessa cartella).

## Prove

`python3 tests/v3/mk.py`, poi `node tests/v3/visuale.js` (24 controlli: la partita parte in terza persona col bottone e il mondo in 3D;
la mappa come dall'alto (il terreno intero col dettaglio, i muri vicini ridipinti, la vita della mappa); accanto al lampione la telecamera
resta dietro l'eroe; avanti va dove guarda la telecamera, girando la visuale cammina nella direzione nuova, a destra alla sua destra (ogni passo dal punto di
partenza, all'aperto); spara allo zombie davanti, zombie ed eroe disegnati; l'eroe in 3D vero (corpo, testa, piedi, mani e arma) col colpo
dalla bocca dell'arma 3D; gli altri eroi senza errori; in prima persona l'arma in mano, niente eroe, lo zombie preso, e l'arma in 3D vero; in
casa niente tetto e niente muri tra la telecamera e l'eroe (alta, la telecamera può guardare sopra i muri); il fuoco della Bomba e la Tagliola
a terra; la Bara; il tripla A: i sei zombie e i due boss in 3D vero, sangue e macchie, l'esplosione che illumina e fa tremare la
telecamera, l'erba nel prato coi coni dei lampioni lontani e le nuvole, la telecamera col pozzo alle spalle, il cono col pulviscolo in prima
persona sotto il lampione, gli effetti bassi senza erba né coni; «Dall'alto» torna com'era e si torna in terza; nessun errore di disegno; al
massimo tre fogli). Il foglio
delle quattro direzioni dell'eroe 3D: `tests/v3/vi_eroe4.png`. Il browser delle prove disegna il 3D senza scheda grafica (4–7 fotogrammi al
secondo): le prove aspettano di più, vanno a 1× e tengono la qualità alta (altrimenti il gioco abbassa da solo gli effetti). Foto
`tests/v3/vi_*.png`.

## Da sapere

- La preparazione la prima volta che si passa al 3D: qualche secondo sul telefono (qui 6–7 s senza scheda grafica, di cui 3 la prima
  pittura delle armi appese ai muri, che si farebbe comunque la prima volta che compaiono), con la scritta «Preparo la visuale 3D…».
- Non si vedono ancora in 3D: i compagni sulla mappa, i caricatori che cadono, la fiamma del lanciafiamme (resta il danno), le cose che il
  direttore disegna sopra a tutto (l'anima che vola, la colonna di luce). La Bara è ancora una cartolina dipinta (gli zombie e i boss dal
  tripla A sono in 3D vero).
- Dentro le case la telecamera in terza persona sta vicina all'eroe, o guarda da sopra i muri quando è alta.
- L'eroe 3D costa poco: una decina di disegni per fotogramma; un'arma nuova si costruisce in 0,5–2,3 ms la prima volta che si vede in quella
  posa (qui), poi si riusa.
- Per le foto delle prove: `__V3.dbgCam` (la telecamera intorno all'eroe, a quella distanza) e `__V3.dbgYaw` (l'eroe girato).
