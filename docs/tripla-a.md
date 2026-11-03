# Mossbound tripla A (anteprima a parte, dal 2 novembre)

Denis, 2 novembre: «ok rendi tripla A il gioco in sé mossbound. capito cosa intendo?». Chiarito con tre giri di domande:

- **cosa**: tutto il gioco, ma prima un'anteprima; **grafica**: «fai 3D vero come la visuale ma prima di metterlo nel gioco fammi vedere
  un'anteprima»;
- **luce**: «fai separatamente le prime due per decidere qual è meglio» → due luci da confrontare nella stessa anteprima, **Chiara**
  (chiara e colorata, più ricca) e **Da film** (più da film, contrasti forti);
- anche **animazioni e colpi, audio, menu e interfaccia, filmati e storia** («senza scene come nei film ma entrate e mosse fatte meglio»);
- **telefono**: «fluido prima di tutto»;
- la visuale zombie in terza e prima persona: «decido dopo»; la mappa zombie dall'alto: «per ora resta com'è»;
- **prima anteprima**: «una stanza completa» del primo mondo (arena, eroe, nemici e Golem in 3D vero, con le due luci, colpi e suoni);
- agenti: «no, fai da solo».

## Cosa c'è nella prima anteprima

Il gioco di oggi, intero; nelle stanze del primo mondo (muschio, grotte di cristallo, la stanza del Golem) la stanza si disegna in 3D vero
con WebGL al posto del disegno 2D. Fuori dal primo mondo (eventi, prove, torre, trappole, gli altri mondi) torna il disegno di sempre.
Il gioco decide tutto come sempre (mosse, colpi, tempi, danni): il 3D legge cosa il gioco disegnerebbe e lo mette in volumi veri.

- **`src/js/110-t3-motore.js`** (`T3`): la tela WebGL sotto quella del gioco; la telecamera dall'alto a 50° che segue quella del gioco
  (sposta il centro un po' a nord, si stringe un attimo coi colpi, `T3.zk`); la stanza: pavimento dalla tela del gioco con le pietre
  bagnate che luccicano, muro nord col cancello che si alza e le torce, muri ai lati, cresta col muschio, la rupe, le costole e il fiume
  dell'abisso; le **due luci** (`T3LUCI.chiara`, `T3LUCI.film`: cielo e terra, luce principale, 12 luci vicine, nebbia, bagliore, colori,
  vignetta, grana) col bottone «Luce: …» in alto a destra o il tasto L (si ricorda in `localStorage` `mb_t3_luce`); il passaggio finale
  (bagliore, contorno scuro dove la profondità salta, i colori della luce scelta); quello che non è ancora in 3D resta una cartolina
  dipinta dal gioco, in piedi al suo posto; sopra, il disegno 2D di testi, barre, raccolte, colpi ed effetti al posto giusto.
- **`src/js/111-t3-eroe.js`**: l'eroe in 3D vero dai pezzi del suo modello (`EROE.rig3d`, come nella visuale): corpo con la giubba, viso
  dipinto sulla palla della testa, mani, piedi, l'arco vero di `ARMI3D` che si piega con la corda; le teste con pezzi propri restano la
  testa dipinta del gioco; ombra morbida. **I personaggi si piegano un po' all'indietro** (`T3.lean`, `t3CharM`): il gioco li disegna visti
  da circa 29° sopra il pavimento, la telecamera li guarda da 50°; piegati indietro mostrano il davanti (visi, il gambo sotto il cappello
  del fungo, la schiena dell'eroe) come nei loro disegni, coi piedi fermi a terra.
- **`src/js/112-t3-nemici.js`** (`T3N`): i nemici del primo mondo in 3D vero, ognuno in tutte le sue mosse (fermo, cammina, si prepara,
  attacca, colpito, muore): slime, slime grande e slime di lava (la gelatina trasparente col teschio dentro, gli occhi gialli, la bocca
  coi denti), pipistrello (ali di membrana con le dita, orecchie rosa dentro, occhi gialli che brillano), fungo (cappello a pois, viso
  sul gambo), pianta (petali, faccia gialla, bocca coi denti), fuoco fatuo (goccia di luce che illumina la stanza); goblin, scheletro
  (con le costole), scheletrino e negromante col corpo 3D dell'eroe, il loro vestito, la loro arma e la loro testa. Le pose di ogni mossa
  si fanno una volta (16–20 a mossa) e la scheda grafica passa dall'una all'altra; la prima posa di una mossa nuova si fa subito.
- **`src/js/113-t3-golem.js`** (`T3GL`): il **Golem di Muschio** in 3D vero, a pezzi che si muovono (niente pose da preparare): busto
  d'ardesia col manto di muschio, testa con le lastre di arenaria, orbite con la luce menta, mascella e zanne, massi delle spalle col
  muschio e lo spallaccio, braccia coi pugni e le nocche, gambe con l'anello di arenaria, le cinque pietre ritte, il cuore nella chiave
  di volta e le sei vene che si accendono. Ogni posa è quella del suo modello (`golem2.js` esporta solo i conti, `N3.meta.golem2.k3`):
  entrata da statua, Schianto, Frana, Faglia, palla che rotola, Raggio del Cuore, furia della fase 2 (ardesia annerita, lava nelle crepe,
  occhi arancio), sconfitta che crolla in un mucchio di massi col muschio.
- **`src/js/114-t3-stanza.js`** (`T3S`): gli ostacoli del primo mondo in 3D vero, come li dipinge oggi il gioco: masso col muschio, colonna
  scanalata (intera o spezzata) col collare di muschio, sarcofago col sigillo, urne di terracotta, lapide con le righe incise, ceppo con
  radici e anelli, cristalli che brillano, braciere col fuoco, mucchio di teschi. Tremano quando li colpisci, come nel gioco.
- **`src/js/115-t3-effetti.js`** (`T3FX`): ogni freccia e ogni colpo dei nemici porta la sua luce (del colore del colpo); un colpo a segno
  fa un lampo caldo, un'uccisione un lampo grande del colore del nemico, un colpo preso un lampo rosso e la telecamera che si stringe;
  gli scossoni dei boss danno un colpetto alla telecamera; fuochi fatui e slime di lava illuminano la stanza; sotto colpi, uccisioni e
  schianti un tonfo basso con la coda della cripta. Niente allunga le lotte.

Con gli effetti ridotti (`LOWFX`): meno luci, niente luci dei colpi in volo.

## Come si costruisce e si prova

- `python3 anteprime/mk_tripla.py <cartella>` → `anteprime/tripla.html` e la stessa pagina divisa in tre pezzi nella cartella; alla
  prima apertura c'è già un eroe, il menu è sulla Classica e il contatore dei fotogrammi è acceso.
- Pubblicata a parte su https://claude.ai/artifact/8UveByoEu5gWa7cXm6aUEw («Mossbound tripla A»); si aggiorna ripubblicando la stessa cartella.
- Prove: `python3 tests/t3/mk.py`, poi `node tests/t3/tripla.js` (26 controlli: stanza in 3D, eroe, ogni nemico del primo mondo in tutte
  le mosse, il Golem in tutte le 15 mosse nelle due fasi, ostacoli, le due luci, lampi e telecamera, effetti ridotti, il disegno di sempre
  fuori dal primo mondo, nessun errore). Foto in `tests/t3/`: `tr_lotta.jpg` (la stessa stanza col disegno di oggi, con la luce
  Chiara e con la luce Da film), `tr_golem.jpg` (il Golem che entra, nelle due luci).

## Tempi

Sul computer di prova senza scheda grafica (la scheda grafica è finta, fatta dal processore) un fotogramma della stanza 3D con l'eroe e
otto nemici costa circa 15 ms di disegno (12–14 ms i personaggi, il resto meno di 2 ms); non è il numero del telefono: lì lo dice il
contatore dei fotogrammi acceso nell'anteprima. Telefono lento: `LOWFX` e le scorciatoie del motore (risoluzione e luci).

## Cosa manca (prossimi passi)

- Tre nemici delle grotte di cristallo restano cartoline: scarabeo, occhio d'ombra, fiore occhio.
- Le raccolte (monete, cristalli, sfere, cuori) e i colpi sono ancora disegni 2D messi al posto giusto (con la loro luce 3D).
- Gli altri mondi, i menu, le entrate e le mosse più belle, l'audio più ricco oltre ai tonfi: dopo la scelta della luce.
- Niente entra nel gioco senza il sì di Denis.

## Il menu in tripla A (3 novembre)

Denis, 2 novembre: «migliora il ponte ed il menu ora». Alle domande: «3D vero come la stanza»; del ponte «sembra piatto», «poco
spettacolare», «troppo piccolo o lontano»; le parti del menu: schermata principale, interfaccia, fogli e finestre, menu Zombie; tutto
nell'anteprima tripla A (il gioco e l'app non cambiano).

- **`src/js/116-t3-isole.js`** (`T3I`): la schermata principale della Classica disegnata con WebGL come la stanza. La logica resta quella
  di 94 (dove guardi, l'eroe, i salti, le assi, i premi, lo spettacolo, i tocchi); cambia solo il disegno, le scritte di 94 restano sopra.
  - **Le isole**: il terreno a cupola con la sua tessitura del mondo (prato e muschio, cenere con le crepe, palude bagnata, neve coi suoi
    riflessi), il bordo che sporge, la rupe a strati e il sasso che pende sotto fino a una punta, nella nebbia dell'abisso; sopra le cose
    del mondo in volumi veri dove le metteva 94: il sentiero di lastre, la pozza con la cascata giù dalla rupe (acqua, lava, ghiaccio), il
    cancello ad arco con la gemma dell'arena e la bocca buia con la sua luce, il braciere che arde quando l'arena è vinta, le lanterne di
    pietra, radici e ghiaccioli dal bordo; muschio (la quercia, le colonne, le lapidi, i funghi, felci, ciuffi e fiori), vulcano (il cono
    col cratere e le colate, il basalto, l'ossidiana, l'albero morto con le punte di brace, l'incudine), palude (l'albero storto con le
    barbe di muschio, canne, ninfee, il totem, i ceppi), ghiaccio (i pini con la neve, i cristalli, il pupazzo di neve, i cumuli). Il
    custode dorme al suo posto: il Golem in 3D vero (113), gli altri dipinti dal gioco su una cartolina; le «z» del sonno sopra. Le isole
    chiuse sono nere col lucchetto e le catene sul cancello.
  - **Il ponte**: le due torri di tronchi con la base di pietra, gli anelli, le croci, la piattaforma, il tetto a quattro falde (col suo
    colore del mondo) e lo stendardo lungo dell'arena dopo sul davanti di ognuna (la vista lungo il ponte resta aperta); le 64 assi con la
    pancia del ponte, ognuna un po' diversa (lunghezza, posto, giro, colore, venature del legno) coi chiodi; sotto le due travi, i traversi
    ogni quattro assi e la crociera (dove le assi mancano si vede l'impalcatura che le aspetta); i pali coi cappelli, le funi del
    parapetto a festoni (a sinistra si aprono dove ci sono i balconi), i due cavi grandi dalle cime delle torri coi tiranti e le
    bandierine dell'arena dopo; il vestito del mondo sulle teste dei traversi (muschio e barbe, catene col carbone acceso, liane coi fiori,
    ghiaccioli e neve); i tre balconi a sinistra (pavimento di assi, puntelli, la pietra tonda con l'anello del colore del premio, i pali
    alti con l'arco e lo stendardino, le lanterne in cima, le funi intorno) col premio in 3D che galleggia (la cassa col coperchio sul
    suo cardine, il sacco d'oro con le monete, i cristalli, il vasetto dell'essenza che brilla); le lanterne che si accendono quando le
    assi le raggiungono; gli ancoraggi sulla mini isola.
  - **La mini isola del traguardo**, nel mondo dopo: il sentiero, l'altare con le rune, il tesoro (chiuso o aperto e vuoto), il palo con
    lo stendardo arrotolato che si srotola, i due bracieri che si accendono; **le cinque pietre** che salgono dal buio; **l'isola dopo**
    lontana nella nebbia.
  - **La telecamera** bassa (14°) e vicina, che guarda lungo il ponte (`T3IC`): le assi vicine grandi, il ponte che corre lontano fino alla
    mini isola; l'isola larga quanto il telefono permette, al posto dove 94 la vuole (le scritte stanno intorno).
  - **L'eroe** in 3D (il suo modello, come nella stanza) col bastoncino di muschio acceso in bocca sulla sua isola, che respira, si guarda
    intorno e ogni tanto fa un saltello; cammina sui ponti e salta sulle pietre; i compagni accanto (cartoline). **Il pennone degli
    stendardi** sull'isola dove sta l'eroe, coi suoi stendardi che sventolano e quello nuovo che sale.
  - **Lo spettacolo delle assi** in 3D: le assi volano basse dall'isola, girando, e si posano al loro posto con un piccolo assestamento;
    polvere, scintille dei chiodi, i premi che si aprono (lo scoppio e le monete che volano di 94 dove il 3D mette il premio), l'eroe che
    corre sul ponte fino al traguardo, «Traguardo raggiunto!», le pietre che salgono, l'isola dopo che si accende con un grande bagliore.
  - **Intorno**: il cielo del mondo con le stelle e la sua luce dal basso, le nuvole nell'abisso, le rocce lontane che galleggiano, le
    luci delle lanterne e dei bracieri sulle cose vicine, lucciole, braci e luccichii; le due luci («Chiara» e «Da film»).
- **`src/js/117-t3-interfaccia.js`** (`T3UI`): le stesse forme e misure di oggi (i tocchi restano dove sono), materiali più ricchi:
  rilievi più profondi e un filo del colore della modalità intorno ai bottoni (oro nella Classica, verde malato nella Zombie), la luce che
  scorre sui bottoni laterali (più spesso su quelli pronti), monete e cristalli in tasche incassate, i cinque posti delle casse come
  incastri di pietra con le borchie, Gioca d'oro più ricco, la barra in basso con la scheda scelta che si accende; i fogli più scuri e caldi
  col titolo su un nastro, le schede con la loro cornice, le scelte dorate. Nelle **Impostazioni** due interruttori dell'anteprima: la
  luce del 3D («Chiara» o «Da film») e l'interfaccia («Nuova» o «Di prima», per confrontarle).
- **`src/js/118-t3-falo.js`** (`T3F`): la scena del menu Zombie. Prima il falò in 3D (2 novembre, col dipinto di 66 come fondale: commit
  561bd0e), poi **il falò rifatto da capo** (3 novembre, Denis: «miglioralo non mi piace»; risposte «Falò del menu Zombie, rifai tutto
  meglio», «Sembra di plastica, Inquadratura», «Rifinisco il 3D»: tutta la scena in 3D vero e dipinta; l'ultima versione è nel commit
  7f490df), poi, stesso giorno, Denis: «non mi ispira»; alle domande: «Statico, poca azione», «Manca un'idea forte», e fra le idee proposte
  ha scelto **l'Assedio** («una barricata di assi e carri intorno al fuoco, l'orda che preme da fuori con le braccia tese, la fattoria che
  brucia, luna rossa e lampi»). Della scena di prima restano la pittura e l'inquadratura:
  - **Dipinta, non di plastica**: un programma suo (`T3FS_FP`) mette su ogni pezzo il disegno del suo materiale, preso dal posto dove sta
    (triplanare: niente coordinate da preparare, si vede uguale da ogni lato): erba, terra, pietra, corteccia (in piedi e coricata), legno
    (in piedi e coricato), assi, intonaco, tegole, tela, ferro, legno bruciato e uno neutro, quindici disegni di 256 punti fatti una volta
    (`T3FTX`, chiari: il colore del pezzo li tinge). Sopra: la luna in due toni con l'orlo sfrangiato come una pennellata, il fuoco a fasce
    morbide, l'orlo freddo della luna sui bordi, le cime più chiare, il buio alla base delle cose, il contorno scuro spesso (`t3FDraw`), la
    nebbia bassa che si muove sul campo fuori dalla barricata ma non dentro.
  - **L'inquadratura**: la telecamera lontana e bassa (`T3FC`, 50° di campo, l'eroe al 70% del disegno di oggi, l'inclinazione calcolata
    perché l'orizzonte cada sotto la barra in alto e il cielo si veda), il campo dove 66 lo ha (l'eroe appena sopra «Cambia»).
  - **L'eroe** in piedi davanti al tronco con l'arma zombie scelta nell'Arsenale (`SAVE.z.gun`; pistola, revolver, mitraglietta, mitra,
    tamburo, mitragliatrice, pompa e pompa tattica; le altre fanno vedere la pistola), il fuoco alla sua destra; guarda verso di noi e ogni
    tanto si volta a guardare la barricata da sopra la spalla. Quando uno zombie scavalca si gira di scatto (di tre quarti: lo zombie sale
    sempre alla sua destra, così l'arma, la vampa e la scia si vedono), mira e spara con il modo della sua arma (`T3F_SHOTS`: un colpo, due,
    raffiche da quattro a sei; il rinculo, la vampa e il carrello veri dell'arma 3D, `o.gp`; il suono dell'arma, `ARMI.suono`; la luce della
    vampa intorno, la scia fino al petto dello zombie, il sangue scuro che gli esce dalla schiena), poi abbassa l'arma e torna a guardia (la
    pompa si ricarica). Andando a giocare si incammina verso la barricata e sparisce nel buio.
  - **La barricata** (`T3FB`: una mezzaluna intorno al campo, aperta verso di noi; `t3FBf` il suo verso in ogni punto; `t3FBarricade`): il
    carro ribaltato con le ruote in alto (cerchioni di ferro, razze, mozzi; tre ferme e una che gira ancora, un pezzo suo), le stanghe a
    terra; casse, una botte in piedi e una coricata, i sacchi di terra; la palizzata di pali appuntiti piegati in fuori, legati da due funi e
    puntellati da dentro; una porta con le traverse e un tavolo rovesciati, un'altra botte; assi inchiodate di traverso dove ci sono i buchi;
    i cavalli di frisia ai due lati; due pali con le torce (le fiamme vere e la loro luce). Trema quando l'orda spinge (polvere, il tonfo, il
    legno che scricchiola).
  - **L'orda** (106, gli zombie della visuale, `t3FHorde`): 28 zombie, 14 con LOWFX. La prima fila contro la barricata con le braccia oltre
    (la mossa dell'attacco), la seconda che spinge, la folla dietro, e altri che vengono avanti dalla nebbia fra le tombe aperte; i posti
    liberi della prima fila li prende chi sta dietro, e quando uno cade un altro esce dalla nebbia (l'orda non cala mai). Tutti guardano
    l'eroe. Gli occhi brillano e pulsano, e restano sugli occhi anche quando la testa scatta in avanti (`t3FHeadOff`, i conti delle mosse di
    106); la lanterna e la lampada del minatore fanno luce. Ogni 2–5 s uno della prima fila si butta sulla barricata; ogni 7–12 s uno
    scavalca: sale in cima in un secondo, si sporge verso il campo con le braccia tese e, colpito, cade all'indietro e sparisce dietro la
    barricata. Gemono ogni 2–5 s (`sndZGroan`).
  - **Il campo fuori**: le tombe del vecchio cimitero con le croci, tre aperte da sotto (la fossa nera, la terra buttata fuori, il coperchio
    spezzato), l'erba alta, l'albero morto, lo spaventapasseri che ogni tanto gira la testa verso di te; **la fattoria in fiamme** (il fuoco
    dalle tre finestre, dal tetto sfondato coi travetti bruciati, dall'angolo e dalla gronda; la fuliggine sui muri, il campo bruciato
    intorno; il fumo grande acceso dal basso, le braci che salgono e vanno col vento, la sua luce rossa sul campo e il bagliore sull'orizzonte);
    il mulino con le pale che girano; le colline con la cappella.
  - **Il cielo**: notte rossa, la luna rossa con l'alone, le nuvole rosse vicino alla luna; **i lampi** (`t3FLight`, ogni 6–15 s): il fulmine
    coi rami dalle nuvole a dietro le colline, la luce fredda che viene da dietro e disegna i contorni, due o tre sfarfallii (con «riduci
    movimento» del telefono un solo bagliore morbido), e **il tuono**
    che arriva dopo (`t3FThunder`, prima lo schiocco, poi il rotolare, più tardi se è più lontano).
  - **Il campo dentro**: il tronco (ora dietro l'eroe), la tenda, lo zaino con la coperta, la pala, il ceppo con l'ascia, la catasta, la
    cassa delle munizioni coi bossoli e la lanterna, il pentolino col vapore, il fuoco (le pietre, la cenere, i ceppi con le crepe di brace,
    le fiamme a lingue in quattro colori, `T3FS_FLAME`, le scintille, il fumo); i corvi in volo e posati sullo spaventapasseri, su una ruota
    del carro e su un palo della palizzata.
  - La prima volta la scena si prepara **a pezzetti** (15 disegni, 49.000 triangoli): già nei momenti liberi del menu Classica (l'`IDLE` di
    65, 4 ms alla volta, mai in battaglia né sulla mappa zombie), poi nel menu Zombie 8 ms a fotogramma, mai durante lo scorrimento tra le
    modalità; intanto resta il disegno di 66, e quando il 3D è pronto il disegno di prima gli sfuma sopra in mezzo secondo. Le pose degli
    zombie dopo, 3–4 ms alla volta (l'orda arriva appena le pose del primo tipo sono pronte): l'attacco e la camminata, una posa su due di 106
    (84 pose; lo strisciante solo cammina). Suoni solo nel menu Zombie e con gli effetti accesi (`t3FSnd`). LOWFX: metà orda, niente nebbia,
    fumo e corvi in volo, meno scintille, braci e polvere.
- Mentre il menu passa da una modalità all'altra (lo scorrimento) scorrono le due scene in 3D (sotto, «Ancora meglio»); se il 3D non c'è
  torna da solo il disegno di sempre.
- Prove: `node tests/t3/menu.js` (37 controlli dopo «Ancora meglio»; i primi 30: isole in 3D, tocchi dell'eroe e dei premi, pezzi sotto i 65.000 punti, spettacolo, interfaccia
  e interruttori, l'assedio in 3D con tutta la scena, la barricata, la ruota e le torce, la fattoria che brucia, il cielo sotto la barra,
  l'orda in 3D, lo zombie che scavalca e l'eroe che si gira, mira e spara, l'eroe che torna a guardia e l'orda che torna al suo numero, la
  spinta, il lampo, lo spaventapasseri che si gira, ritorno al disegno di sempre, nessun errore). Foto: `tests/t3/tr_isole.jpg` (prima e dopo: l'isola e il ponte col
  disegno di oggi e in 3D), `tr_falo.jpg` (il falò: il primo 3D, quello rifatto con la luce «Chiara» e con la luce «Da film»), `tr_assedio.jpg` (l'assedio con la luce «Chiara» e «Da film», lo sparo, il lampo), `tr_spettacolo.jpg` (lo spettacolo, il traguardo, due fogli).
- Tempi sul computer di prova (senza scheda grafica): isole circa 17–30 ms a fotogramma; l'assedio 6,6 ms di lavoro del programma a
  fotogramma con 28 zombie (5,0 con LOWFX e 14 zombie; il falò di prima 3,5), più il disegno (49.000 triangoli fermi e circa 117.000
  dell'orda) e il passaggio finale.
  Sul telefono lo dice il contatore.

### Ancora meglio (3 novembre)

Denis: «miglioralo ancora senza farmi domande, intendo incluso anche il menu ecc». Senza domande, tre pezzi:

- **L'assedio più vivo** (118):
  - **La telecamera** respira piano (si sposta di poco avanti e indietro), si avvicina un poco quando uno scavalca e trema col tuono, con le
    spinte sulla barricata e col rinculo dei colpi (`T3F.cam`; con «riduci movimento» del telefono ferma).
  - **L'arma vera dell'Arsenale** (`t3FGunObj`: lo stesso oggetto di `ARMI.nuova` che spara sulla mappa zombie): i colpi al suo ritmo (le
    automatiche a raffica finché lo zombie non cade, la pompa coi suoi pallini, ognuno la sua scia), i suoi suoni dal banco
    (`ARMI.suonaBanco`), **i bossoli** che volano a destra e rimbalzano a terra, **il caricatore vuoto** che cade ai suoi piedi, e dopo, girato
    di nuovo verso il fuoco, **la ricarica** vera dell'arma 3D con la mano libera (quattro volte su cinque).
  - **Il sangue** dello zombie colpito schizza e resta a terra come macchie scure; **le schegge** di legno saltano dalla barricata quando
    l'orda spinge.
  - **L'orda innaturale**: ogni tanto uno piega di scatto la testa e il corpo da un lato e torna piano, un tremito lo attraversa, oppure si
    ferma immobile e poi recupera tutto d'un colpo (`z.tw`, `z.trm`, `z.frz`).
  - **Cenere e braci** che il vento porta dalla fattoria su tutta la scena, anche davanti all'eroe (`t3FAsh`: 40 fiocchi di cenere e 14
    braci; con LOWFX niente cenere e 4 braci).
  - **L'aria della notte** (`t3FAmbOn`): il vento che sale e scende, il brusio dell'orda, il sibilo degli incendi, piano (sotto restano il
    crepitio e le raffiche del menu Zombie di 67), solo con la scena sullo schermo e gli effetti accesi.
- **Le isole più vive** (116):
  - **Il vento**: gli stendardi delle torri e dei balconi (`t3IBanner`), le funi, i cavi, gli appesi e le bandierine si muovono col vento a
    raffiche di 94 (`cnWind`): tre pose del vento fatte una volta (`B.wind`) e passate dall'una all'altra dalla scheda grafica (`T3I.wu`).
  - **Il ponte che ondeggia** sotto l'eroe che corre (`ISL.sw` di 94, `cnSwayFn`): l'impalcato e le funi si piegano nella scheda grafica
    (`t3IBrProg`, `uSw`), le lanterne dondolano con lui, l'eroe va su e giù col ponte.
  - **La vita** (`t3ILife`): ogni 10–18 s uno stormo del mondo che guardi passa di traverso sopra il ponte tra le torri (rondini sul muschio,
    uccellini di fuoco sul vulcano, pipistrelli sulla palude, uccelli bianchi sul ghiaccio); farfalle sull'isola del muschio, libellule
    sulla palude, il fumo del vulcano (grigio cenere, acceso dal basso, con le braci) e la neve sul ghiaccio. Con LOWFX niente.
- **Lo scorrimento tra Classica e Zombie in 3D**: quando parte (67, `modeSwitch` avvolto in 118) ognuna delle due scene si disegna una volta
  in 3D e si copia (`t3SnapPair`: prima quella nuova, poi la vecchia, così lo schermo resta com'è fino al primo passo); durante lo
  scorrimento scorrono le due copie (`t3Snap`, `t3SnapDraw`), non più il disegno di sempre. Una copia sola a scorrimento: copiare il 3D a
  ogni fotogramma costerebbe uno scatto sul telefono. Se una scena non è ancora pronta (l'assedio la prima volta), per lei resta il
  disegno di sempre. Mentre scorre la copia delle isole l'orologio del menu va avanti come col disegno di 94 (senza, partendo dalla
  Classica lo scorrimento restava a metà finché non si toccava lo schermo: trovato dalla prova).
- Prove: `node tests/t3/menu.js` ora ha anche il vento e il ponte che ondeggia, lo stormo, i bossoli dell'arma vera, la cenere, l'eroe che
  torna a guardia anche ricaricando, lo scorrimento con le due scene in 3D che arriva in fondo da solo nei due sensi (verso la Zombie con
  la manina, verso la Classica col germoglio). Il computer delle prove di oggi è molto più lento di quello di
  ieri (anche il menu senza 3D va a 5 fotogrammi al secondo, sia col codice nuovo sia con quello di prima), per questo le attese della prova
  sono più lunghe; il lavoro vero di un fotogramma delle isole, misurato pezzo per pezzo, è circa 12 ms. Foto: `tests/t3/tr_ancora.jpg`.
