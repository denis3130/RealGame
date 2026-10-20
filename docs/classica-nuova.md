# Classica nuova (anteprima, 20 ottobre)

Denis: «ascolta ora pensiamo a migliorare la modalità classica […] per rendere l'esperienza di gioco migliore e non pallosa come la scalata
delle coppe con le arene», poi «ok creami le cose che mi hai elencato su una cosa a parte senza intaccare il progetto principale». Ramo
`classica-nuova` (da `piano-maestro`); il gioco vero non cambia: `src/js/94-classica-nuova.js` **non** è in `src/ordine.txt`. Pagina:
`python3 anteprime/mk_classica.py [--build]` → `anteprime/classica.html` (parte con un salvataggio suo, già dopo la creazione dell'eroe),
pubblicata su https://claude.ai/artifact/K6E5QMv5pxKkt61MCFJsba («Mossbound · Classica nuova»: si aggiorna ripubblicando
`anteprime/classica.html`). Prova: `python3 anteprime/mk_classica.py --test --build && node tests/classica.js [menu|stanze|furia|rarita|evo|nemesi|torre|corsa|ondate|trappole|3d|ponte]`.

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

## Annotato: le abilità che si livellano nel menu (20 ottobre notte)

Denis, con la foto della scelta «Livello 5 · Scegli un'abilità»: «fai in modo che nella modalità classica ci sia una nuova funzione di
progressione: tutte le abilità che si possono prendere giocando appunto alla modalità classica, per averle potenziate devi livellarle nel
menu apposito. deve essere bello e pulito con una non so che di magico». Solo annotato (anche in «Da fare» del CLAUDE.md, punto 7): non
ancora fatto, prima le domande.

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
