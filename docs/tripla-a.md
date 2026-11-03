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
- **`src/js/118-t3-falo.js`** (`T3F`): il falò del menu Zombie. La scena lontana resta il dipinto di oggi (cielo, luna, mulino, fattoria,
  gli zombie sul sentiero con gli occhi accesi, la staccionata, la nebbia), dipinta a metà grandezza e messa come fondale; davanti il
  campo in 3D vero: il tronco con la corteccia e il taglio, l'eroe seduto (la mossa «seduto» del suo modello), la pistola appoggiata, lo
  zaino, la pala, la cassa delle munizioni, il pentolino, l'anello di pietre, i ceppi con le punte di brace, le fiamme del gioco, le
  scintille e il fumo; la notte fredda della luna e la luce calda del fuoco che trema. Andando a giocare l'eroe si alza e se ne va nel buio.
- Mentre il menu passa da una modalità all'altra (lo scorrimento) c'è per quel secondo il disegno di sempre; se il 3D non c'è torna da solo.
- Prove: `node tests/t3/menu.js` (19 controlli: isole in 3D, tocchi dell'eroe e dei premi, pezzi sotto i 65.000 punti, spettacolo, interfaccia
  e interruttori, falò, ritorno al disegno di sempre, nessun errore). Foto: `tests/t3/tr_isole.jpg` (prima e dopo: l'isola e il ponte col
  disegno di oggi e in 3D), `tr_falo.jpg` (il falò prima e dopo), `tr_spettacolo.jpg` (lo spettacolo, il traguardo, due fogli).
- Tempi sul computer di prova (senza scheda grafica): isole circa 18–24 ms a fotogramma; falò circa 2 ms di lavoro più il passaggio finale.
  Sul telefono lo dice il contatore.
- Cosa manca: degli animali intorno alle isole ci sono solo lucciole, braci e luccichii (niente stormi, farfalle, rane); il ponte non
  ondeggia ancora sotto l'eroe e le funi non sentono il vento; gli stendardi delle torri sono fermi.
