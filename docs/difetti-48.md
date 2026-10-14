# Difetti dell'anteprima 48 (domande a Denis, 14 ottobre)

Denis: «ci sono diverse cose buggate […] dammi domande con risposte così miglioriamo il gioco, fai domande fino a quando non ti dico
basta». Visto sull'**anteprima 48** (https://claude.ai/artifact/1PeXgrLWXwA3QGKuZCT9as).

## Risposte

- **Classica**: niente da segnalare.
- **Zombie, piano di sopra**: «il pg spara da dove non potrebbe sparare agli zombie, tipo nel primo piano spara a quelli sotto, o si bugga
  il pg dentro il pavimento del primo piano».
- **Zombie, zone nuove**: «alcune cose che hai fatto nelle nuove aree devi migliorarne il 3D perché si muovono leggermente, ma devono essere
  solidi come nella prima e seconda area».
- **Zombie**: zombie che «restano chiusi da qualche parte» (non arrivano mai).
- **Zombie, scatti**: «di più quando ci sono tanti zombie, ma anche nelle aree nuove».
- **Menu, testi tagliati**: «migliora tutto, rendi visibilmente più bello e riconoscibile; fai in modo che i 5 pacchetti li vedi da sotto il
  player, non dentro un menu apposito».
- **Piano di sopra, cosa succede**: spara a chi è di sotto; l'eroe finisce dentro il pavimento; gli zombie di sotto lo mordono.
- **Piano di sopra, quando**: appena arrivato di sopra e camminando di sopra.
- **Zone nuove, cosa si muove**: gli edifici.
- **I 5 pacchetti**: sotto l'eroe nella schermata principale, **al posto degli oggetti** indossati (quelli si cambiano dall'Armeria).
- **Edifici nuovi**: tutto l'edificio ondeggia, soprattutto **girando la visuale** (più di quelli del camposanto e della fattoria).
- **Zombie chiusi**: **dietro una barriera** non ancora comprata.
- **Telefono**: iPhone 15 Pro Max.

## Correzioni (14 ottobre)

### Piano di sopra
- **Causa**: il motore dell'ordine di disegno tiene il verso di prima tra due voci quando la differenza è sotto i 2 px (isteresi, contro lo
  sfarfallio). L'eroe (e gli zombie) appoggiati sul solaio hanno una differenza di 1,5 px: salendo la scala restava il verso di quando erano
  ancora sotto il solaio, e il pavimento di sopra veniva disegnato sopra di loro (si vedeva solo la testa con la sagoma azzurra). Gli zombie di
  sopra «dentro il pavimento» sembravano di sotto: da lì «spara a chi è di sotto» e «quelli di sotto mordono». Nella pagina di prova non si
  vedeva perché la prova saliva senza disegnare i fotogrammi.
- **Correzione** (`relEss` in `motore.js`): chi sta sopra o sotto una cosa ha sempre un margine di almeno 3 px (l'isteresi non lo tocca più);
  sui gradini (`st`) chi sale o scende sta sopra la scala. In più l'arco elettrico delle armi forgiate (livello 2) non salta più tra i piani.
- **Prova**: `piani_prova.js` sale coi fotogrammi veri e controlla che eroe e zombie di sopra siano disegnati sopra il solaio (senza la
  correzione fallisce).

### Edifici delle zone nuove che ondeggiano girando la visuale
- **Causa**: la «piega» (le cose alte si piegano via dall'eroe, stile Pokémon) sposta la cima di un edificio in proporzione all'altezza. La
  Locanda è alta 261 px, il campanile 252, la Cappella 203 (la casa del camposanto 151, il fienile 155): girando la visuale la cima oscillava fino a
  115 px contro i 66 della casa. In più campanile, sagrestia, Forgia, armi a muro, Credenza e interni della Segheria si piegavano ognuno da un
  punto suo (o punto per punto) e scivolavano sull'edificio.
- **Correzione**: il ref di un edificio porta quanto si piega (`r.k`, in `setRef`): sopra i 155 px si piega di meno (Locanda ×0,6, Cappella col
  campanile ×0,62, Segheria ×0,86), così la cima ondeggia quanto la casa e il fienile. Tutto quello che sta dentro o è attaccato a un edificio
  prende lo stesso ref (gruppi in `prop_borgo.js`, `ZM.group` in `area_mappa.js`, Credenza, valvola e Forgia in `macchine.js`, la Bara dentro un
  edificio); i pali e la tettoia della Fucina si piegano come i muri. L'eroe di sopra resta appoggiato al pavimento (usa lo stesso ref).
- **Misura** (cima, giro intero della visuale): Locanda 115 → 68 px, campanile 111 → 68, Cappella 89 → 55, Segheria 80 → 69 (casa 66, fienile 68).

### Zombie chiusi dietro le barriere
- **Cause**: (1) la mappa delle distanze per gli zombie arrivava solo a 1.100 px dall'eroe: nella mappa grande chi restava più lontano andava
  dritto verso l'eroe e si incastrava contro staccionate e barriere chiuse; (2) al varco del bordo est il controllo «devo rompere le assi?» era
  troppo severo e lo zombie restava fuori a spingere; (3) senza buche a giusta distanza ne veniva scelta una a caso, anche dietro una barriera
  chiusa; (4) il cancello della fattoria attirava tutti gli zombie fermi, anche quelli del borgo e della segheria, che si schiacciavano contro le
  staccionate; (5) un lampione chiudeva per gli zombie il passaggio tra la Segheria e la caldaia.
- **Correzioni**: mappa delle distanze su tutta la mappa (costa circa 1 ms); controllo delle assi con più tolleranza; buche solo raggiungibili
  (la distanza della casella libera più vicina, non la più piccola dei dintorni); uno zombie della partita che non si avvicina più e non si vede
  rinasce da una buca raggiungibile (mai chi è già vicino all'eroe); gli zombie fermi di una zona chiusa vengono alle assi della loro barriera
  quando l'eroe è vicino (come al cancello della fattoria), girando intorno a carri e cataste; lampione spostato, cataste a 45 px dal muro.
- **Prova**: `chiusi_prova.js` (da ogni buca attiva, in quattro combinazioni di zone aperte, lo zombie arriva; il varco est; nessuna buca dietro
  una barriera chiusa; la rinascita; gli zombie fermi alle assi).

### Menu: i 5 posti sotto l'eroe, nomi e testi interi
- **I 5 posti** (`src/js/80-posti-casse.js`): sotto l'eroe, al posto degli oggetti indossati, nella Classica le quattro casse vinte e la quinta
  (con la corona), nella Zombie le quattro Lucky Cards vinte e la quinta. Ogni posto mostra la cassa o la bustina e il suo stato: «Apri!» che
  brilla e saltella, il tempo che manca con la barretta, «Sblocca», «In attesa», «Vuoto». Toccando un posto si apre un riquadro sopra di lui come in
  Clash Royale (nome, rarità, cosa contiene, «Sblocca · tempo», «Apri subito · oro»); una cassa pronta si apre al primo tocco; toccando fuori il
  riquadro si chiude. Gli oggetti si cambiano dall'Armeria, l'arma zombie e la Lucky Card in tasca dall'Arsenale e dal bottone Lucky. Nella
  Zombie il bottone «Lucky Cards vinte» non serve più.
- **Nomi**: nella Zombie i bottoni ai lati non avevano il nome e i bollini (livello del Pass, carte da aprire) erano tagliati: la lamiera storta era
  un ritaglio (clip-path) che tagliava tutto quello che sporge dal bottone. Ora i nomi si vedono come nella Classica. Nella barra in basso c'è il
  nome sotto ogni linguetta (prima solo sotto quella aperta).
- **Testi tagliati**: «Liv. 1» in alto diventava «Li…» sui telefoni stretti; un nome lungo nel Profilo finiva tagliato («Massimiliar…»): ora va a
  capo e rimpicciolisce. Controllo automatico di tutte le schermate e dei fogli nei due modi su tre telefoni (360, 390, 430 px): nessun altro
  testo tagliato (le offerte della Bottega che scorrono di lato sono volute).
- **Il bottone a destra «Casse»** della Classica ora è quello della bustina gratis («Gratis!» o il tempo che manca): le casse vinte si vedono già
  sotto l'eroe e prima le contava due volte.

### Scatti sul telefono (tanti zombie e zone nuove)
- **Misure** (computer di prova senza scheda grafica, come un iPhone 15 Pro Max: 430×932 a risoluzione 2; i tempi assoluti sono molto più alti del
  telefono, contano le proporzioni): la parte che cresce con gli zombie è il loro disegno, rifatto da zero a vettori a ogni fotogramma, circa 2,8 ms
  a zombie; l'aggiornamento degli zombie passava un terzo del tempo a provare le collisioni con tutti i solidi della mappa grande.
- **Correzioni**: gli zombie da un'immagine pronta (ognuno tiene la sua figura e la ridisegna a turno, al massimo 6 figure nuove per fotogramma;
  con pochi zombie tutte a ogni fotogramma come prima, subito se cambia mossa, direzione, inclinazione o zoom; a vista identici, controllato pixel
  per pixel): con 16 zombie il disegno di uno zombie scende da 2,8 a 1 ms (Borgo da 116 a 78 ms a fotogramma, Cappella da 124 a 80, sul
  computer di prova); la griglia dei solidi per le collisioni: aggiornamento di 16 zombie da 1,02 a 0,15 ms; risoluzione automatica (con
  «Qualità automatica», quella di partenza): se per 2 s i fotogrammi non stanno nei 60 al secondo la mappa passa da 2 a 1,5 pixel per punto, e
  solo se non basta abbassa gli effetti come prima.
- I «picchi» di 300 ms ogni 6 fotogrammi visti sul computer di prova sono del browser senza scheda grafica (accumula i disegni e li colora tutti
  insieme), non della mappa: sul telefono il lavoro è distribuito. Da riprovare sul telefono vero.
- Collaudo della navigazione (`navmappa.js`): 94 su 96. Nel caso «dentro la Cappella» due zombie restano in coda nella navata tra le panche, a
  50 px dall'eroe, dietro quelli che già mordono (la navata è larga per due zombie). Succedeva uguale prima di queste correzioni (in un giro
  anche 5 su 8): è una strettoia, non uno zombie bloccato.
- Collaudo della navigazione dell'area di prova (`navtest.js`): arrivano tutti (226–232 su 226–232 per punto); nel caso «dietro la cripta» la
  folla arriva 6 su 8 in 60 s, identico alla versione prima delle correzioni (provata accanto, stesso numero).
- Collaudo finale (14 ottobre) tutto passato: prove della mappa (`chiusi_prova`, `piani_prova`, `ondeggia_prova`, `gioco`, `ondate`,
  `barriere_prova`, `macchine_prova`, `comparse_prova`, `bara_usi`, `navmappa`, `navtest`, `visibilita`, `ordine`, `ravvicinati`) e del gioco
  (`zombie`, `menu2`, `menu3`, `salvataggio`, `avvio`, `meta2`, `mig`, `gems`, una partita per capitolo) senza errori. Visibilità
  (1.524 punti visibili su 1.890) e ordine di disegno (12.055 px) dell'area di prova identici alla versione prima delle correzioni.

## Seconda richiesta (14 ottobre)

Denis: «nell'edificio dove c'è il mitra a muro e nella locanda del corvo vorrei che le pareti di questi edifici non fossero storte. migliora
anche le scale, falle più spaziose e belle. migliora il design di tutto, tipo del camino ecc.», poi «ah sì, l'audio dopo il quinto round va a
farsi fottere». L'edificio col Mitra a muro è la Segheria.

### Pareti storte
- **Causa**: la piega (le cose alte si piegano via dall'eroe) degli edifici nuovi partiva dal centro dell'edificio (un punto): tutto
  l'edificio pendeva da una parte sola, anche il muro che l'eroe aveva davanti o accanto. Con l'eroe dentro, vicino al muro est, il muro est
  pendeva verso l'interno, sopra di lui (−11,8 px in cima alla Locanda, −17,9 alla Segheria); davanti al muro del Mitra la cima pendeva fino
  a 17 px verso il centro dell'edificio.
- **Correzione** (`prop_borgo.js`, `BOXOF`): il ref degli edifici nuovi è il loro riquadro, come la casa del camposanto e la cripta: la piega
  va dritta da un muro all'altro, il muro davanti all'eroe resta in piedi e gli altri si aprono via da lui come una scatola (il muro est,
  dall'interno: +5,8 px alla Locanda, +8,7 alla Segheria, verso fuori). Gli edifici continuano a ondeggiare girando la visuale quanto la casa e
  il fienile (`ondeggia_prova.js`: Locanda 68 px, Segheria 69, Cappella 55, campanile 68, Fucina 36; casa 66, fienile 68).

### Scala della Locanda
- Larga 44 (prima 30, nella fascia 18–34 dei corridoi da evitare). Ogni gradino ha il corpo di legno scuro e la pedata di noce chiaro che
  sporge sul gradino sotto; la passatoia rossa col bordo d'oro e i rombi scende sulle pedate e sulle alzate. Sul lato aperto ci sono il fianco a
  pannelli, il cosciale lungo i nasi dei gradini, una colonnina per gradino, il corrimano e il pilastrino col pomolo in fondo. Di sopra la
  ringhiera intorno al buco è fatta allo stesso modo, con un pilastrino agli angoli e una colonnina ogni 9 px. In cima si esce verso sud, a
  ovest del primo pilastrino. Buco del solaio, solidi e percorso della salita (`ZM.scala`) seguono la larghezza nuova. La finestra ovest della
  sala è più a sud (dava contro il fianco della scala larga: `barriere_prova.js` lo segnava) e il camino è 10 px più a est, col solido solo
  sulla cappa e gli stipiti: tra il piede della scala e il camino restano 42 px (lì si preme «Sali», niente corridoi da 18–34) e dentro la
  finestra nord c'è posto per uno zombie.

### Design (camino e il resto)
- **Camino della Locanda**: focolare di pietra con due stipiti e la bocca incassata, il fondo annerito, i ciocchi sugli alari e la brace che
  pulsa (ferma con `LOWFX`). Sopra c'è la trave di noce per mensola, con due candele accese, la brocca di peltro e due boccali. La cappa di
  pietra sale fino al soffitto, annerita dal fumo, con la targa ovale del corvo. Davanti ci sono la lastra del focolare e il tappeto con le
  frange, dipinto nel pavimento. Il comignolo sul tetto è allineato al camino. Sui tavoli, accanto alla candela, un piatto e un boccale.
- **Banco**: piano di noce lucido che sporge verso i clienti, poggiapiedi d'ottone, boccali (uno con la schiuma) e il barilotto con la spina.
- L'insegna e la lanterna fuori dalla porta sfumano col muro sud quando l'eroe è dentro: prima restavano sospese in mezzo alla sala.
- **Segheria**: due lanterne appese sotto il tetto che si accendono quando l'eroe entra (prima dentro era quasi buio); sul muro nord, dentro,
  due lame circolari un po' arrugginite e il segone a due manici.

### Audio dopo il quinto round
- **Misura** (prova nel gioco vero dal round 4 all'8 in tempo reale, eroe invincibile, e un profilo di chi crea i nodi audio): la partita
  non cambia di colpo al round 5. Cambia l'arma: con la pistola dei primi round l'audio crea in media 158 nodi al secondo. Con le armi
  automatiche, che verso il round 5 arrivano dalla Bara o dal muro, si sale a 350 col Mitra e a 352 con la Mitragliatrice, con picchi di 800.
  Due terzi venivano dall'arma: il rumore del meccanismo a ogni colpo (una nota di metallo a quattro parziali), la coda dello sparo e i
  bossoli, ognuno con tre rimbalzi a quattro note. Il resto veniva da colpi, lamenti, morti e passi degli zombie. Su un telefono è più di
  quanto l'audio riesca a suonare in tempo: gracchia, salta o si ammutolisce.
- **Correzione**: un misuratore di carico in `route` (`audioLoad`/`audioLv` in `src/js/05-audio.js`: circa i suoni partiti nell'ultimo mezzo
  secondo).
  - Nelle armi automatiche il meccanismo suona al massimo 4 volte al secondo e la coda 5. Il primo colpo di ogni raffica e i colpi singoli
    suonano come prima.
  - Con l'audio carico: bossoli al massimo uno ogni 50–160 ms e senza i rimbalzi dopo il primo; colpi sugli zombie più radi; lamenti di
    dolore, voci della morte e voci di chi esce da terra più radi o leggeri; passi solo dei vicini; meno schegge di vetro.
  - Un passa-alto a 40 Hz prima del compressore: quei bassi l'altoparlante del telefono non li suona, ma riempivano compressore e
    altoparlante.
  - L'audio rimasto «interrotto» sul telefono riparte al tocco.
- **Risultato**: col Mitra da 350 a 198 nodi al secondo, con la Mitragliatrice da 352 a 192 (la pistola dei primi round: 158).
  Da riprovare sul telefono vero.

### Collaudo della seconda richiesta
- Prove della mappa: `piani_prova`, `ondeggia_prova`, `chiusi_prova`, `gioco`, `ondate`, `barriere_prova` (dopo aver spostato la finestra
  ovest e ristretto il solido del camino), `macchine_prova`, `comparse_prova`, `bara_usi` tutte passate; ordine di disegno della mappa
  invariato (66.987 px contro 67.003, esseri 425). Navigazione 93–94 su 96: la Locanda di sotto e di sopra 8 su 8 con la scala nuova; dentro
  la Cappella i due di sempre in coda; vicino alla casa colonica a volte uno zombie resta a 42 px dietro gli altri sette (la prova conta chi
  arriva a 40): è la folla intorno all'eroe, non uno zombie bloccato, e capitava anche prima (in 9 giri della versione di prima una volta).
- Tempi di disegno dentro la Locanda (le due versioni nello stesso browser, misurate a turno): 10,5 ms contro 9,1 senza zombie, 28,8 contro
  28,0 con 12 zombie. Scala, camino, banco e tavoli tolti uno alla volta costano meno di 1 ms ciascuno.
- Prove del gioco vero: `zombie`, `avvio`, `meta2`, `menu2`, `menu3`, `salvataggio`, due partite Classiche (`run.js`) senza errori; `audio.js`
  nessun errore dentro i suoni. Ripubblicata l'Anteprima 48 (versione 3 dell'artefatto).

## Terza richiesta (14 ottobre)

Denis: «prima di tutto miglioriamo le animazioni delle pistole, cioè la ricarica ecc., poi l'audio delle medesime armi, e infine il verso
degli zombie ora è fastidioso, lo vorrei molto più creepy. Un'altra cosa: se una zona non l'ho ancora sbloccata vorrei che i zombie non
spawnassero da lì, solo in zone dove ho il via libera. E rendi i zombie più rapidi nell'attaccare.»

### Le ricariche in 3D
- **Prima**: l'arma 3D in mano all'eroe alzava solo la bocca durante la ricarica (le armi 3D non avevano un caricatore da togliere).
- **Ora** (`sprite/eroe3d/armi3d.js`, `sprite/eroe3d/disegno_eroe.js`): il caricatore (la cassetta della mitragliatrice, il tamburo, la
  bombola del lanciafiamme, la stecca di chiodi del fucile a vapore, il cristallo del Risonatore) è un pezzo suo. L'arma viene davanti al
  petto, la bocca in su e girata verso la mano libera, e la testa guarda giù. La mano libera:
  - toglie il caricatore, che cade: sulla mappa resta a terra qualche secondo e fa il suo rumore quando tocca;
  - ne prende uno nuovo alla cintura, lo spinge dentro (scatta) e tira il carrello o l'otturatore. La pistola vuota resta col carrello
    indietro finché la mano non lo lascia andare.
  - Il revolver apre il tamburo di lato, butta fuori i sei bossoli, mette sei colpi uno a uno e si richiude con uno scatto.
  - I fucili a pompa prendono una cartuccia alla volta (la Pompa tattica dalla sua fila sul fianco) e la spingono nella finestrella.
  - Il razzo arriva dalla cintura, si porta davanti al tubo e si spinge dentro.
- **Arma presa** (dalla Bara, dal muro, a inizio partita): sale dal fianco e si arma una volta (carrello, pompa, tamburo che gira).
- I tempi della ricarica sono gli stessi per l'eroe 3D, per le armi 2D di prima e per i suoni (`ARMI.RLT` in `sprite/armi/disegno_armi.js`).
- Corretto anche: con gli effetti sonori spenti bossoli e caricatori restavano in aria.
- Fogli: `node tests/ricarica4.js [armi]` (otto momenti nelle quattro direzioni, uno per arma) e `node tests/ricarica_tutte.js` (le dodici
  armi nel momento più chiaro, nelle quattro direzioni). Pagina dal vivo: `python3 anteprime/mk_armi3d.py` → `anteprime/armi3d.html`.
- L'Arciere della Classica è rimasto identico al pixel (arco, balestra e bastone nelle quattro direzioni e nelle cinque mosse).

### L'audio delle armi
- **Misura**: otto spari su undici avevano più di metà dell'energia sotto i 150 Hz (fino al 94%), dove le casse del telefono non suonano.
  Sul telefono restava poco: un «pff».
- **Ora** (`sprite/armi/suoni_armi.js`, nel gioco dopo `disegno_armi.js`): ogni arma ha un banco di suoni fatti col codice e preparati una
  volta sola fuori tempo reale (`OfflineAudioContext`, 0,1–0,4 s al primo uso, 0,5–1,2 MB, al massimo sei armi in memoria). Dentro:
  - tre spari un po' diversi e la coda dell'eco per le raffiche;
  - i rumori della ricarica a tempo con la mossa (eventi `rl:`, `rv:`, `rz:` dalla macchina dell'arma);
  - la presa, il colpo a vuoto e l'esplosione del razzo, che prima sulla mappa era muta.
- **Lo sparo, a strati**: lo schiocco dell'aria, lo scoppio della polvere saturato, un «pugno» che anche il telefono suona, il rombo
  profondo, la coda e l'eco del camposanto, la meccanica dell'arma. Il lanciafiamme è un ruggito continuo (`ARMI.fiamma`). Il motore delle
  canne della mitragliatrice ora suona anche sulla mappa e si spegne da solo in pausa.
- **Misure** (`node tests/suoni_armi.js`, ogni sparo da solo, senza i rumori di fondo del menu):
  - in cuffia forti come prima (da −1,3 a +2,8 dB), così il resto dell'audio resta in equilibrio;
  - sulla cassa di un telefono da 5,8 dB (fucile a vapore) a 10,4 dB (pompa) più forti di prima;
  - sotto i 150 Hz resta il 5–66% dell'energia invece del 14–94%, e i picchi sono più bassi (0,32–0,53 invece di 0,43–0,90);
  - ogni suono è un nastro (tre nodi): in battaglia l'audio crea in media 181 nodi al secondo invece di 355, al massimo 466 invece di 817.
- La prima versione della prova misurava male: preparava i dodici banchi di fila (il gioco ne tiene sei, quindi per metà delle armi
  ascoltava il suono di riserva, a metà volume) e sentiva anche i rumori di fondo del menu. Ora ogni banco si prepara subito prima della
  misura e ogni suono si fa da solo in un `OfflineAudioContext` con la stessa strada del gioco.

### I versi degli zombie
- **Prima**: un'onda a dente di sega che ronzava in due vocali con un vibrato: un kazoo, sempre uguale, e frequente.
- **Ora** (`ZVB` in `anteprime/zombie/audio_zombie.js`): una gola fatta col codice.
  - Colpi della glottide radi e storti: sotto i 55 Hz la voce gracchia come quella di un moribondo.
  - Tre formanti che si muovono come una bocca, il respiro bagnato, il raschio del ringhio, gorgoglii, il sibilo tra i denti, i denti che
    battono.
  - 31 versi preparati una volta: lamenti che finiscono gracchiando, rantoli, gorgoglii, sussurri, ringhi, il rantolo della morte,
    l'ansimo di chi esce dalla fossa. In più la tosse del minatore, la voce da fantasma della lanterna, il cane, la risata del Becchino,
    la paglia e il legno dello spaventapasseri. Ogni zombie li dice con la sua gola, un po' più alta o più bassa.
- **Più radi**: ogni zombie aspetta 6–14 s, al massimo due voci insieme. Più piano dei vecchi. Un ringhio quando ti vede arrivare, i denti
  quando è vicino. Anche i lamenti lontani del menu Zombie usano le voci nuove.
- **Misure**: le voci hanno le due formanti e i colpi radi della gola (spettrogrammi); con le voci nuove l'audio in battaglia crea in media
  165 nodi al secondo.

### Zombie solo dalle zone aperte
- Le buche delle zone chiuse erano già escluse. Ma:
  - chi usciva dalle buche della partenza accanto a una barriera chiusa sembrava venire dalla zona chiusa;
  - i morti evocati dal Becchino nascevano in un punto a caso intorno all'eroe, quindi vicino a una barriera chiusa anche dall'altra parte.
- **Ora**: una buca va bene solo se è in una zona aperta, sia per l'etichetta sia per dove sta davvero (`W.zoneIdAt`), e a più di 110 px
  dalle barriere e dal cancello ancora chiusi. I morti evocati nascono solo in una zona aperta e dove si arriva a piedi.
- Prova `anteprime/zombie/zone_prova.js`:
  - 400 comparse con la sola partenza aperta, tutte nel Camposanto;
  - 120 morti evocati con l'eroe alla barriera del Borgo, tutti di qua;
  - aperto il Borgo, gli zombie escono anche lì.

### Attacchi più rapidi
- **Prima**: lo zombie arrivava, caricava quasi 0,8 s prima di colpire, un colpo ogni 1,4 s.
- **Ora**: il colpo arriva dopo mezzo secondo, nell'affondo del gesto. L'attacco dura 1 s (strisciante 1,05, minatore e lanterna 1,1, il
  cane 0,8).
- Il danno di ogni colpo è un po' più basso (zombie 25, strisciante 19, minatore 28, lanterna 35, cane 16): in tutto circa un quinto di
  male in più.
- Il giocatore automatico arriva agli stessi round (9, 10, 5, 7), ma chi si fa prendere cade prima.
