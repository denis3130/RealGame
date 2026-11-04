# Mostri in 3D vero (modelli con lo scheletro)

Prova del 3–4 novembre: **il nostro zombie base in 3D vero** (Denis: «mi piace come l'hai fatto il modello in 3d in questa immagine che mi
hai mandato senza meshy», «non serve accedere a meshy continua cosi»). Dal 4 novembre il modo in cui è fatto è **la formula per ogni cosa in
3D** (qui sotto), e con la formula c'è anche **lo Zombie strisciante** (Denis: «vai fai»). Solo anteprime: niente entra nel gioco senza il
sì di Denis.

## La formula per il 3D (dal 4 novembre, per ogni cosa in 3D vero)

Denis, 4 novembre: «d'ora in poi ogni cosa in 3d dovrai adoperare per farla al meglio come questa che hai fatto è chiaro? salvala su
tutto questa tua nuova formula per la creazione in 3d è eccezionale». Personaggi, mostri, boss, oggetti e animazioni in 3D vero, nelle due
modalità, si fanno come lo zombie base: un file come `zombie.js` o `strisciante.js` per la cosa nuova (o per quella che Denis chiede di
rifare), coi pezzi comuni della cassetta `kit3d.js` (`K3D`), disegnato da `mb3.js`. Le cose che ci sono già restano come sono finché Denis non
chiede di rifarle. Prima di cominciare leggere questa formula, `kit3d.js` e uno dei due mostri (i pezzi cominciano con `// ·`, poi le ombre
cotte, le mosse, la posa).

**1. Partire da quello che c'è.**
- La cosa di oggi è il modello: il suo disegno (`sprite/mostri/disegno_mostri.js`, `sprite/nemici3d/`, `sprite/eroe3d/`, i prop della
  mappa…) dà le misure (le stesse unità: lo zombie è alto circa 42), i pezzi (tutti e solo quelli, niente in più) e i colori (una tavola come
  `Z`, un nome per colore). Un colore si cambia solo se di notte diventa nero, e si scrive nelle note (come i pantaloni dello zombie).
- I punti del corpo vengono dal disegno: testa, spalle, anche, caviglie (`PV`, `CH`, `HC`, `bindPose`). Dal rig 2D allo spazio del modello
  (x a sinistra della cosa, y in su, z davanti): il punto `[x, y, z]` del rig diventa `[-y, z, x]`.
- Prima di costruire, la foto del disegno di oggi da quattro lati (come `oggi.js` → `zombie_oggi.webp`), che poi sta sopra nella pagina.

**2. Il corpo fatto di triangoli, nel codice** (niente programmi esterni né modelli scaricati: Meshy non si usa).
- Gli attrezzi stanno in `kit3d.js`. `Mesh()`: ogni punto ha posto, normale, colore, `K` = [cosa è, sangue, ombra cotta, contorno], fino a
  quattro ossa coi pesi, e il gruppo (`m.group(g)`, serve alle ombre cotte).
- `ball(m, centro, raggi, lati, anelli, paint, {ax, shape, renorm})` per teste, pance, mani, occhi, bottoni: `shape(dir)` scava o gonfia la
  superficie (orbite, bocca, bozzi) e poi le normali si rifanno da sole (`smoothNormals`).
- `tube(m, punti, raggi, lati, paint, {cap0, cap1, rag1, up, tip})` per braccia, dita, artigli (`cap1: 'point'`), colli, maniche,
  pantaloni, capelli, cuciture: il tubo si stringe e si allarga lungo il percorso e il suo giro viaggia senza torcersi; `rag1` dà i denti a
  un orlo stracciato; `flat: [1, .16]` schiaccia la sezione (una striscia di stoffa che ha comunque il suo spessore e il suo contorno).
- I pezzi da zombie ci sono già, presi dal disegno di oggi: `zHead` (la testa intera: orbite, occhi, bocca sulla mascella, denti, capelli,
  crepa e, se serve, la cicatrice; più piccola o più grande con `R`) e `zArm` (il braccio ossuto con la manica e la mano a tre dita; lunghezze,
  manica, mano e dita a misura). Un pezzo che serve a più mostri va nella cassetta, non copiato.
- I buchi sono veri: si tolgono i triangoli dentro la forma del buco (`holeIn`, con l'orlo frastagliato) e sotto c'è quello che deve vedersi
  (il petto marcio e le costole). Una bocca che si apre ha il fondo scuro dentro la testa: mai un buco sul vuoto.
- Il `paint` di ogni pezzo decide colore, chiazze, sangue (vicino a buchi e strappi), cosa è e le ossa di ogni punto.
- Le stoffe (maglia, maniche, pantaloni, mantelli, stracci) stanno in un pezzo loro (`mats[1]`, segnato `dbl`). Oggi `mb3.js` disegna solo il
  fuori di ogni pezzo: dentro un orlo o un buco si vede il buio del contorno, quindi sotto un buco ci va sempre quello che deve vedersi.
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
- `K3D.skel(BN, PAR, bind, chains, follow)` fa lo scheletro: le `chains` sono gli arti a due ossa con la IK (dove va la punta, il polo, come
  si gira la mano o il piede), le `follow` le catene che passano per punti dati dalla mossa (la spina dello strisciante che striscia per
  terra o pende nel buco, gli stracci). `K3D.solve`, `mix`, `joints` valgono per tutti.

**4. Dipinto come la lanterna, da `mb3.js`.**
- `K[0]` dice cosa è: 1 pelle, 2 maglia, 3 pantaloni, 4 cuoio, 5 osso e denti, 6 buio dentro, 9 luce (occhi). Ognuno ha i suoi segni
  nello shader (chiazze, venature e grinze sulla pelle; pieghe e trama sulla stoffa; fango sui pantaloni…), calcolati dal posto nella posa di
  riposo, così restano attaccati al corpo quando si muove. Una materia nuova (pietra, cristallo, legno, metallo, pelo, fiamma) è un numero
  nuovo coi suoi segni, scritto accanto agli altri.
- Lo shader fa i tre toni, la luna sui bordi (`rim`), la lucetta umida, il rilievo (`bump`), il contorno spesso a guscio rovesciato (`K[3]`:
  1 normale, più sottile su denti, capelli e bottoni, 0 su cuciture e occhi), la luce degli occhi che pulsa (`emK`) col suo bagliore, il
  lampo bianco (`flash`), la nebbia e `clipY` (niente di quello che sta sotto terra: per sbucare).
- Le ombre cotte (`K[2]`, `K3D.bake`): palle che fanno da pezzi (`OCC`: busto, braccia, gambe), un pezzo non fa ombra a sé stesso (i
  gruppi), un po' più scuro vicino a terra. Se la forma di riposo non è la posa vera (lo strisciante ha le braccia dritte nella forma e le mani
  piantate a terra nella posa) le ombre si calcolano sulla posa vera (`skinned` in `strisciante.js`).
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
  fermare un momento. Un mostro zombie nuovo va nella stessa pagina: una riga in `MODELS` (inquadratura, buco da cui sbuca, ossa
  dell'ombra), la sua foto di oggi (`node sprite/mostri3d/oggi.js <nome> <uscita.webp>`) e il suo script in `mk_zombie3d.py`.
- La prova come `tests/zombie3d.js` (guarda tutti i mostri della pagina; un mostro nuovo vuole la sua riga in `CFG`): si costruisce, ogni
  mossa parte e torna (o si ripete), nessun errore, i tempi con e senza effetti; le foto: ogni mossa in sei momenti di tre quarti, le quattro
  direzioni, prima e dopo (anche su uno schermo grande).
- Guardare davvero le foto e correggere prima di mandarle. Con lo zombie erano: occhi troppo bianchi, la maglia che sembrava un vestito, le
  costole come un codice a barre, le braccia da fermo troppo basse, le mani che non arrivavano a terra quando sbuca e la testa che usciva
  lontano dal buco, il colpito troppo debole. Con lo strisciante: la pagina troppo vicina (di lato la spina usciva dalla foto), i dischi della
  spina che si toccavano (sembrava una pannocchia), gli stracci troppo scuri che sparivano sul prato, la maglia che si chiudeva a stella sotto
  la testa.
- Pubblicare la pagina e mandarla a Denis con le foto: niente nel gioco senza il suo sì. Il collegamento col gioco non c'è ancora (la tela 3D
  di `src/js/110-t3-motore.js` o una tela a parte copiata nel disegno 2D): si sceglie e si scrive qui la prima volta che Denis dice sì.

**Errori già fatti, da non rifare.**
- Gli assi `ax` di `ball` devono girare come la mano destra (z = x × y): al contrario le facce si girano e il contorno copre il pezzo.
- Nei tubi i triangoli vanno (a, b, c) e (a, c, d), con i giri costruiti come in `tube`: i telai fatti a mano al contrario girano le facce.
- Una manica coi pesi di un osso solo salta sulla giuntura: anche la stoffa ha i pesi morbidi.
- Le ombre cotte senza i gruppi scuriscono il pezzo stesso.
- La luce (9) tiene il suo colore e il bagliore fa il resto: spinta di più, gli occhi diventano bianchi.
- Nella pagina serve `[hidden]{display:none!important}`, se no i pannelli nascosti si vedono.
- Prima di cambiare un pezzo della cassetta, l'impronta dei modelli che la usano (tutti i numeri del modello e delle ossa in tutte le mosse)
  prima e dopo: quando lo zombie base è passato alla cassetta è rimasto identico su 1.108 pose.

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

## Lo strisciante (`strisciante.js`, `ZS3`)

È il nostro Zombie strisciante (`CR.strisciante` di `sprite/mostri/disegno_mostri.js`, che non cambia) costruito con la formula: circa 10.750
triangoli, 27 ossa, costruito in 35–130 ms (la prima volta di più); una posa circa 30 µs (lo zombie base 17). Le misure del disegno 2D, girate nello spazio del modello: il petto (7,2) un po' più alto e
avanti della vita (5), la testa (6,8, più piccola di quella dello zombie base) davanti al petto, le braccia lunghe (7,4 e 7,8), le mani a
terra 10 avanti e 8,8 di lato, la spina a cinque vertebre che va da 3,5 a 12 dietro la vita, i tre stracci; stessi colori (`ZC`).

- la testa degli zombie (`zHead`) senza cicatrice, gli occhi più piccoli con lei; il collo nascosto sotto la testa;
- la maglia blu dal colletto sotto la testa fino alla vita, dove finisce in un orlo a denti che cade a terra; il buco sulla schiena con
  sotto il corpo marcio, quattro nodi della spina e due costole (i due segni d'osso del disegno); il moncone di carne scura alla vita, da cui
  esce la spina; la pancia e la vita appoggiate a terra;
- le braccia ossute (`zArm`) più lunghe, coi gomiti in fuori e un po' in alto, le maniche corte stracciate, le mani piatte a terra con gli
  artigli piantati;
- la spina che striscia: cinque vertebre sempre più piccole, ognuna un disco con lo spuntone sopra e le due alette, un cordone scuro che le
  tiene insieme; tre stracci della maglia per terra (quello di sinistra più lungo, come il disegno).

Lo scheletro: root, vita, schiena, petto, collo, testa, mascella, le braccia (spalla, braccio, avambraccio, mano, dita, punte per lato), spina1–5
e straccio1–3. Le braccia con la IK; una mano piantata tiene il suo giro nel mondo (piatta a terra), una in aria gira con l'avambraccio. La
spina e gli stracci passano per punti fatti dalla mossa: partono dalla vita e stanno a terra dietro, serpeggiano, restano indietro quando
balza, pendono nel buco quando sbuca.

Le mosse (`ZS3.MOSSE`, gli stessi nomi di quelle dello zombie base): **Fermo** (immobile a terra, la testa piegata troppo di lato, poi scatta
verso di te; le dita che grattano, la punta della spina che si muove), **Striscia** (la camminata di oggi: una mano avanza e tira mentre l'altra
viene avanti, il corpo avanza a ogni tirata, la testa piegata con uno scatto), **Striscia veloce** (come un ragno: le mani lontane, il corpo
basso, la spina che frusta), **Sbuca da terra** (la cima della testa, una mano che esce e si apre in aria e sbatte a terra, poi l'altra, due
strattoni, si trascina fuori con la spina per ultima, la testa che scatta verso di te), **Urla** (si alza sulle braccia, la testa su e la bocca
spalancata, la spina che frusta; gli occhi più accesi), **Balzo** (l'attacco di oggi: si alza sulle braccia e balza avanti basso a bocca
aperta, le mani avanti ad afferrare), **Morso** (indietro a bocca aperta, scatta avanti basso e morde, scuote la testa), **Colpito** (scatto
indietro, una mano che scivola), **Muore** (le braccia cedono e scivolano di lato, petto e testa a terra, la testa sulla guancia, un ultimo
scatto delle dita e della spina, gli occhi si spengono).

## I file

- `mb3.js` (`MB3`): legge un glTF binario (`.glb`) con lo scheletro e le mosse, e disegna sia quelli sia i modelli costruiti da noi, col
  nostro WebGL 2 senza librerie: `readGLB`, `model`, `pose`, `gpu`, `draw` (contorno, tre toni, bordo di luna, rilievo, luce degli occhi che
  pulsa, lampo bianco, nebbia, `clipY` per non disegnare quello che sta sotto terra). Per i pezzi fatti da noi: colore per vertice e
  `aK` = [cosa è (1 pelle, 2 maglia, 3 pantaloni, 4 cuoio, 5 osso e denti, 6 buio dentro, 9 luce), sangue, ombra cotta, contorno].
- `kit3d.js` (`K3D`): la cassetta della formula (conti, forme, scheletro, ombre cotte, il modello per `MB3`, testa e braccio da zombie).
- `zombie.js`: lo zombie base (sopra). `strisciante.js`: lo strisciante (sopra).
- `oggi.js`: un nostro mostro di oggi da quattro lati (davanti, tre quarti, lato, dietro), per «Prima e dopo»: `node sprite/mostri3d/oggi.js
  <uscita.webp>` (lo zombie, `zombie_oggi.webp`) o `node sprite/mostri3d/oggi.js strisciante strisciante_oggi.webp` (dopo `python3 tests/mk.py`).
- `prepara.js`: da un personaggio `.glb` con lo scheletro e dalle sue mosse in altri `.glb` fa un `.glb` solo e leggero (serviva per Meshy).
- Pagina: `python3 anteprime/mk_zombie3d.py` → `anteprime/zombie3d.html` (codice in `anteprime/zombie3d.js`), pubblicata su
  https://claude.ai/artifact/Weae1UsGGoEti6wccnqTRB («Zombie in 3D», si aggiorna ripubblicando lo stesso file): in alto «Zombie» o
  «Strisciante» (l'indirizzo che finisce con `#strisciante` apre lo strisciante), le mosse, «Tutte», il dito che gira, due dita o − e + per
  avvicinare, «Quattro direzioni», «Prima e dopo», luce a tre toni o morbida, contorno, effetti ridotti.
  Prova: `node tests/zombie3d.js [zombie|strisciante]` (gli stessi controlli per tutti e due i mostri; foto `tests/zombie3d_mosse.jpg`, `_prima_dopo.png`,
  `_prima_dopo_grande.png`, `_quattro.png` per lo zombie base e le stesse `tests/strisciante3d_…` per lo strisciante).

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
