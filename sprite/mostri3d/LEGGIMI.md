# Mostri in 3D vero (modelli con lo scheletro)

Prova del 3–4 novembre: **il nostro zombie base in 3D vero** (Denis: «mi piace come l'hai fatto il modello in 3d in questa immagine che mi
hai mandato senza meshy», «non serve accedere a meshy continua cosi»). Solo un'anteprima: niente entra nel gioco senza il sì di Denis.
Dal 4 novembre il modo in cui è fatto è **la formula per ogni cosa in 3D** (qui sotto).

## La formula per il 3D (dal 4 novembre, per ogni cosa in 3D vero)

Denis, 4 novembre: «d'ora in poi ogni cosa in 3d dovrai adoperare per farla al meglio come questa che hai fatto è chiaro? salvala su
tutto questa tua nuova formula per la creazione in 3d è eccezionale». Personaggi, mostri, boss, oggetti e animazioni in 3D vero, nelle due
modalità, si fanno come lo zombie base: un file come `zombie.js` per la cosa nuova (o per quella che Denis chiede di rifare), disegnato da
`mb3.js`. Le cose che ci sono già restano come sono finché Denis non chiede di rifarle. Prima di cominciare leggere questa formula e
`zombie.js` (i pezzi cominciano con `// ·`, poi le ombre cotte, le mosse, la posa).

**1. Partire da quello che c'è.**
- La cosa di oggi è il modello: il suo disegno (`sprite/mostri/disegno_mostri.js`, `sprite/nemici3d/`, `sprite/eroe3d/`, i prop della
  mappa…) dà le misure (le stesse unità: lo zombie è alto circa 42), i pezzi (tutti e solo quelli, niente in più) e i colori (una tavola come
  `Z`, un nome per colore). Un colore si cambia solo se di notte diventa nero, e si scrive nelle note (come i pantaloni dello zombie).
- I punti del corpo vengono dal disegno: testa, spalle, anche, caviglie (`PV`, `CH`, `HC`, `bindPose`). Dal rig 2D allo spazio del modello
  (x a sinistra della cosa, y in su, z davanti): il punto `[x, y, z]` del rig diventa `[-y, z, x]`.
- Prima di costruire, la foto del disegno di oggi da quattro lati (come `oggi.js` → `zombie_oggi.webp`), che poi sta sopra nella pagina.

**2. Il corpo fatto di triangoli, nel codice** (niente programmi esterni né modelli scaricati: Meshy non si usa).
- `Mesh()`: ogni punto ha posto, normale, colore, `K` = [cosa è, sangue, ombra cotta, contorno], fino a quattro ossa coi pesi, e il gruppo
  (`m.group(g)`, serve alle ombre cotte).
- `ball(m, centro, raggi, lati, anelli, paint, {ax, shape, renorm})` per teste, pance, mani, occhi, bottoni: `shape(dir)` scava o gonfia la
  superficie (orbite, bocca, bozzi) e poi le normali si rifanno da sole (`smoothNormals`).
- `tube(m, punti, raggi, lati, paint, {cap0, cap1, rag1, up, tip})` per braccia, dita, artigli (`cap1: 'point'`), colli, maniche,
  pantaloni, capelli, cuciture: il tubo si stringe e si allarga lungo il percorso e il suo giro viaggia senza torcersi; `rag1` dà i denti a
  un orlo stracciato.
- I buchi sono veri: si tolgono i triangoli dentro la forma del buco (`holeIn`, con l'orlo frastagliato) e sotto c'è quello che deve vedersi
  (il petto marcio e le costole). Una bocca che si apre ha il fondo scuro dentro la testa: mai un buco sul vuoto.
- Il `paint` di ogni pezzo decide colore, chiazze, sangue (vicino a buchi e strappi), cosa è e le ossa di ogni punto.
- Le stoffe (maglia, maniche, pantaloni, mantelli) stanno in un pezzo loro, visto anche da dentro (`mats[1].dbl`).
- Lo zombie ha circa 10.500 triangoli e si costruisce in meno di 100 ms: una cosa nuova resta lì (un boss un po' di più, un oggetto molto meno).

**3. Lo scheletro con le ossa e i pesi.**
- Una lista di ossa (`BN`) coi genitori (`PAR`); nella posa di riposo le ossa non sono girate, quindi la matrice di partenza di ogni osso è
  solo lo spostamento al suo posto (`ibm`).
- Ogni punto attaccato a una o due ossa (al massimo quattro); intorno a una giuntura (gomito, ginocchio, collo) il peso passa morbido da un
  osso all'altro (`sm`): niente salti.
- La stoffa sopra una giuntura segue le stesse ossa del corpo sotto (le maniche col braccio, l'orlo della maglia col bacino, i pantaloni
  con le cosce): niente pezzi che si staccano o che entrano nel corpo.
- La mascella per la bocca che si apre, due ossa per le dita (`dita`, `punte`) che stringono e graffiano; code, ali, tentacoli e corna che
  si muovono sono catene di ossa.

**4. Dipinto come la lanterna, da `mb3.js`.**
- `K[0]` dice cosa è: 1 pelle, 2 maglia, 3 pantaloni, 4 cuoio, 5 osso e denti, 6 buio dentro, 9 luce (occhi). Ognuno ha i suoi segni
  nello shader (chiazze, venature e grinze sulla pelle; pieghe e trama sulla stoffa; fango sui pantaloni…), calcolati dal posto nella posa di
  riposo, così restano attaccati al corpo quando si muove. Una materia nuova (pietra, cristallo, legno, metallo, pelo, fiamma) è un numero
  nuovo coi suoi segni, scritto accanto agli altri.
- Lo shader fa i tre toni, la luna sui bordi (`rim`), la lucetta umida, il rilievo (`bump`), il contorno spesso a guscio rovesciato (`K[3]`:
  1 normale, più sottile su denti, capelli e bottoni, 0 su cuciture e occhi), la luce degli occhi che pulsa (`emK`) col suo bagliore, il
  lampo bianco (`flash`), la nebbia e `clipY` (niente di quello che sta sotto terra: per sbucare).
- Le ombre cotte (`K[2]`): palle che fanno da pezzi (`OCC`: busto, braccia, gambe), un pezzo non fa ombra a sé stesso (i gruppi), un po'
  più scuro vicino a terra.
- Con `LOWFX`: niente rilievo (`bump: 0`) né bagliore, contorno più sottile, risoluzione 1.

**5. Le mosse, scritte da noi.**
- `MOSSE` = {nome, durata, `loop` se si ripete, `hold` se l'ultima posa resta}; `pose(id, p, {look})` dipende solo da `p` (da 0 a 1),
  così l'ultimo fotogramma si collega al primo.
- Una posa dice il corpo (`root`), i giri delle ossa (`turn`), dove vanno le mani (rispetto al petto o al mondo, col polo del gomito) e i
  piedi (a terra o rispetto al corpo, col polo del ginocchio, piatti); `solve` fa il resto con la IK (`ik`; `qframe` tiene il piano della
  piega). `stepper` per i passi; quando il disegno 2D di oggi ha già le formule di una mossa si prendono da lì (la zoppia e il colpo dello
  zombie vengono da `disegno_mostri.js`).
- Ogni mossa con preparazione, colpo e ritorno, e col carattere della sua modalità: nella Zombie lento e poi lo scatto, tremori, la testa
  piegata troppo, gli arti che si torcono; nella Classica vivaci, coi rimbalzi e le stelline, niente sangue.
- `mix` sfuma una mossa nell'altra (0,24 s nella pagina); `look` gira la testa verso l'eroe.

**6. Il controllo.**
- Una pagina come `anteprime/zombie3d.js` (`mk_*.py` la mette in un file solo): le mosse e «Tutte», il dito che gira, due dita o − e +,
  «Quattro direzioni», «Prima e dopo» col disegno di oggi sopra, la luce, il contorno, gli effetti ridotti; un `window.__…` con `hold` per
  fermare un momento.
- La prova come `tests/zombie3d.js`: si costruisce, ogni mossa parte e torna (o si ripete), nessun errore, i tempi con e senza effetti; le
  foto: ogni mossa in sei momenti di tre quarti, le quattro direzioni, prima e dopo (anche su uno schermo grande).
- Guardare davvero le foto e correggere prima di mandarle. Con lo zombie erano: occhi troppo bianchi, la maglia che sembrava un vestito, le
  costole come un codice a barre, le braccia da fermo troppo basse, le mani che non arrivavano a terra quando sbuca e la testa che usciva
  lontano dal buco, il colpito troppo debole.
- Pubblicare la pagina e mandarla a Denis con le foto: niente nel gioco senza il suo sì. Il collegamento col gioco non c'è ancora (la tela 3D
  di `src/js/110-t3-motore.js` o una tela a parte copiata nel disegno 2D): si sceglie e si scrive qui la prima volta che Denis dice sì.

**Errori già fatti, da non rifare.**
- Gli assi `ax` di `ball` devono girare come la mano destra (z = x × y): al contrario le facce si girano e il contorno copre il pezzo.
- Nei tubi i triangoli vanno (a, b, c) e (a, c, d), con i giri costruiti come in `tube`: i telai fatti a mano al contrario girano le facce.
- Una manica coi pesi di un osso solo salta sulla giuntura: anche la stoffa ha i pesi morbidi.
- Le ombre cotte senza i gruppi scuriscono il pezzo stesso.
- La luce (9) tiene il suo colore e il bagliore fa il resto: spinta di più, gli occhi diventano bianchi.
- Nella pagina serve `[hidden]{display:none!important}`, se no i pannelli nascosti si vedono.

## Lo zombie base (`zombie.js`, `ZB3`)

È il nostro Zombie della cripta (`CR.zombie` di `sprite/mostri/disegno_mostri.js`, che non cambia) costruito nel codice come un modello
vero: circa 10.500 triangoli, 25 ossa, costruito in 65–95 ms all'avvio. Stesse misure del disegno 2D (alto circa 42 unità; spazio del
modello: x a sinistra dello zombie, y in su, z davanti), stessi pezzi e stessi colori (`ZC`, pantaloni e scarpe un poco più chiari perché di
notte sembravano neri, l'occhio un giallo più verde):

- testa grande e tonda con le chiazze nei posti del disegno 2D e la macchia marcia, orbite scavate (la destra più grande), occhi che
  brillano e pulsano con la scintilla bianca, bocca troppo larga scavata nella faccia, quattro denti storti sopra (uno più lungo) e tre sotto,
  la parte bassa della faccia sulla mascella (la bocca si apre davvero), il fondo della bocca scuro, quattro capelli, la crepa cucita dietro
  e la cicatrice cucita a destra; il collo corto;
- maglia blu strappata (orlo a denti, il buco davanti a sinistra con sotto il petto marcio e le costole, tre bottoni verdi dietro, lo
  strappo sul fianco, sangue scuro vicino al buco e al colletto); maniche strette e stracciate;
- braccia ossute col gomito nodoso, mani piccole con tre dita lunghe a uncino e gli artigli neri;
- pantaloni strappati in fondo (sangue sul ginocchio destro), caviglie ossute, scarpe grosse piatte a terra.

Dipinto come la lanterna (`mb3.js`): tre toni, bordo di luna, contorno spesso a guscio rovesciato (più sottile su denti, capelli, bottoni;
niente su cuciture e occhi), chiazze, venature e pieghe della stoffa dipinte dal posto nella posa di riposo (restano attaccate al corpo),
un rilievo leggero che prende la luce (pelle grinzosa, trama e pieghe della maglia), le ombre morbide cotte dove i pezzi si toccano,
lucetta umida su pelle, denti e scarpe. Con «Effetti ridotti» niente rilievo né bagliore degli occhi, contorno più sottile.

Lo scheletro (`BN`): root, bacino, schiena, petto, collo, testa, mascella, e per lato (S sinistra, D destra) spalla, braccio, avambraccio,
mano, dita, punte, coscia, stinco, piede. Braccia e gambe a due ossa con la cinematica inversa (`ik`, come `disegno_mostri.js`; il gomito e
il ginocchio si piegano verso il loro polo, l'osso si gira tenendo il piano della piega: `qframe`), i piedi piatti a terra.

Le mosse (`ZB3.MOSSE`, ognuna dipende solo da `p`, da 0 a 1): **Fermo** (immobile e ingobbito con le braccia avanti, poi la testa scatta
verso di te, resta e torna piano; tremori della mano), **Cammina** (zoppica come quello di oggi: la gamba sinistra trascinata a passi corti,
la destra fa il lavoro, la testa piegata troppo di lato con uno scatto), **Corre**, **Sbuca da terra** (prima la cima della testa con gli
artigli accanto, poi la testa, le mani che sbattono a terra, due strattoni, in piedi, la testa che scatta verso di te), **Urla** (indietro,
poi la testa su, la bocca spalancata, le braccia aperte, tutto che trema; gli occhi più accesi), **Colpo** (l'attacco di oggi: le braccia
sopra la testa, poi graffia giù in avanti), **Morso** (si tira indietro a bocca aperta, scatta, morde, scuote la testa, torna), **Colpito**,
**Muore** (le ginocchia cedono, cade in avanti di faccia, un ultimo scatto, gli occhi si spengono; poi sprofonda e risbuca).

`ZB3.build()` → il modello per `MB3.gpu`/`MB3.draw`; `ZB3.solve(M, ZB3.pose(id, p, {look}))` → posti e giri delle ossa; `ZB3.mix(a, b, w)`
sfuma due pose; `ZB3.joints(M, posa, out)` → le matrici. Tempi: una posa 16–32 µs (contro 0,19–0,32 ms per disegnare lo zombie 2D di oggi
sulla tela: il disegno 3D lo fa la scheda grafica).

## I file

- `mb3.js` (`MB3`): legge un glTF binario (`.glb`) con lo scheletro e le mosse, e disegna sia quelli sia i modelli costruiti da noi, col
  nostro WebGL 2 senza librerie: `readGLB`, `model`, `pose`, `gpu`, `draw` (contorno, tre toni, bordo di luna, rilievo, luce degli occhi che
  pulsa, lampo bianco, nebbia, `clipY` per non disegnare quello che sta sotto terra). Per i pezzi fatti da noi: colore per vertice e
  `aK` = [cosa è (1 pelle, 2 maglia, 3 pantaloni, 4 cuoio, 5 osso e denti, 6 buio dentro, 9 luce), sangue, ombra cotta, contorno].
- `zombie.js`: lo zombie base (sopra).
- `oggi.js` → `zombie_oggi.webp`: il nostro zombie di oggi da quattro lati (davanti, tre quarti, lato, dietro), per «Prima e dopo».
- `prepara.js`: da un personaggio `.glb` con lo scheletro e dalle sue mosse in altri `.glb` fa un `.glb` solo e leggero (serviva per Meshy).
- Pagina: `python3 anteprime/mk_zombie3d.py` → `anteprime/zombie3d.html` (codice in `anteprime/zombie3d.js`), pubblicata su
  https://claude.ai/artifact/Weae1UsGGoEti6wccnqTRB («Zombie in 3D», si aggiorna ripubblicando lo stesso file): le mosse, «Tutte», il dito che
  gira, due dita o − e + per avvicinare, «Quattro direzioni», «Prima e dopo», luce a tre toni o morbida, contorno, effetti ridotti.
  Prova: `node tests/zombie3d.js` (14 controlli; foto `tests/zombie3d_mosse.jpg`, `tests/zombie3d_prima_dopo.png`,
  `tests/zombie3d_prima_dopo_grande.png`, `tests/zombie3d_quattro.png`).

## Il soldato di prova (non nostro)

Il modello della foto del 3 novembre che a Denis era piaciuto («Vanguard», un soldato di Mixamo, dagli esempi di three.js, con le sue mosse
Idle, Walk e Run) disegnato col nostro WebGL, più il nostro «Morso» e la testa che scatta verso di te: pagina `anteprime/modello_prova.js`,
costruita da `python3 anteprime/mk_modello_prova.py <prova.glb>` (come preparare il `.glb` è scritto in cima a quel file; il modello non sta
su git e non va nel gioco), pubblicata su https://claude.ai/artifact/PHJdybyvCT5r1SMghLq8Tm («Modello di prova», Denis: «fammi vedere lo
stesso modello dell'immagine in un'anteprima»).

## Meshy (non si usa)

Il 3 novembre si era provato a rifare lo zombie con Meshy: la prova si è fermata prima di generare qualcosa (Denis: «fa niente non usare
meshy»; nessun credito speso). In questa sessione c'erano le istruzioni di Meshy ma non l'accesso al suo account, e i codici da approvare su
meshy.ai sono scaduti. Il soldato delle foto di quel giorno era un modello di prova scaricato (Vanguard di Mixamo, dagli esempi di three.js),
non nostro: nostro era solo il modo di disegnarlo.
