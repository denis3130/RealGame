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
