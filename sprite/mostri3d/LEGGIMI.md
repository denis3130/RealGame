# Mostri in 3D vero (modelli con lo scheletro)

Prova del 3–4 novembre: **il nostro zombie base in 3D vero** (Denis: «mi piace come l'hai fatto il modello in 3d in questa immagine che mi
hai mandato senza meshy», «non serve accedere a meshy continua cosi»). Dal 4 novembre il modo in cui è fatto è **la formula per ogni cosa in
3D** (qui sotto), e con la formula ci sono anche **lo Zombie strisciante** (Denis: «vai fai») e **lo Zombie minatore** (Denis: «fammene
un'altro»). Solo anteprime: niente entra nel gioco senza il sì di Denis.

## La formula per il 3D (dal 4 novembre, per ogni cosa in 3D vero)

Denis, 4 novembre: «d'ora in poi ogni cosa in 3d dovrai adoperare per farla al meglio come questa che hai fatto è chiaro? salvala su
tutto questa tua nuova formula per la creazione in 3d è eccezionale». Personaggi, mostri, boss, oggetti e animazioni in 3D vero, nelle due
modalità, si fanno come lo zombie base: un file come `zombie.js`, `strisciante.js` o `minatore.js` per la cosa nuova (o per quella che Denis
chiede di rifare), coi pezzi comuni della cassetta `kit3d.js` (`K3D`), disegnato da `mb3.js`. Le cose che ci sono già restano come sono finché Denis non
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
  crepa e, se serve, la cicatrice; più piccola o più grande con `R`; sotto un casco senza macchia marcia e senza capelli, un occhio spento con
  `deadEye`) e `zArm` (il braccio ossuto con la manica e la mano a tre dita; lunghezze, manica col suo colore, mano e dita a misura, o il pugno
  chiuso su un manico con `fist`). Un pezzo che serve a più mostri va nella cassetta, non copiato.
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
- `K[0]` dice cosa è: 1 pelle, 2 maglia, 3 pantaloni (2.2 e 3.2: le stoffe dei corpi scolpiti, che hanno già le pieghe vere: quasi niente pieghe dipinte), 4 cuoio, 5 osso e denti, 6 buio dentro, 7 ferro (graffi, ruggine, lucido; 7.2 il
  metallo dipinto, quasi senza ruggine: il casco), 8 legno (le venature lungo il pezzo, che nella forma di riposo va costruito lungo z), 9
  luce (occhi, lampade). Ognuno ha i suoi segni nello shader (chiazze, venature e grinze sulla pelle; pieghe e trama sulla stoffa; fango sui
  pantaloni…), calcolati dal posto nella posa di riposo, così restano attaccati al corpo quando si muove. Una materia nuova (pietra, cristallo,
  pelo, fiamma) è un numero nuovo coi suoi segni, scritto accanto agli altri (ferro e legno sono venuti col minatore).
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
  lontano dal buco, il colpito troppo debole. Col minatore: la ruggine anche sul casco (sembrava sporco: il metallo dipinto ne ha
  pochissima), il casco che quando cade finiva dentro la terra (ora la testa si gira di lato), il piccone che passava sotto terra perché il
  controllo non teneva conto della schiena piegata. Con lo strisciante: la pagina troppo vicina (di lato la spina usciva dalla foto), i dischi della
  spina che si toccavano (sembrava una pannocchia), gli stracci troppo scuri che sparivano sul prato, la maglia che si chiudeva a stella sotto
  la testa.
- Pubblicare la pagina e dare sempre a Denis il link dell'anteprima, con le foto (Denis: «e dammi sempre l'anteprima per vederli»): niente
  nel gioco senza il suo sì. Il collegamento col gioco non c'è ancora (la tela 3D
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

## Il minatore (`minatore.js`, `ZMI3`)

È il nostro Zombie minatore (`CR.minatore` di `sprite/mostri/disegno_mostri.js`, che non cambia) costruito con la formula: circa 12.100
triangoli, lo scheletro dello zombie base (25 ossa), le misure del disegno 2D (bacino 12,4, petto 20,2 e 2,6 avanti, testa 8 a 31,2; braccia 6
e 6,2) e i suoi colori (`MC`):

- la testa degli zombie sotto il casco (niente macchia marcia, niente capelli), l'occhio sinistro spento, la crepa cucita e la cicatrice;
- il casco giallo di metallo dipinto con la tesa, la cresta dal davanti al dietro e la lampada (l'anello scuro e il vetro che si accende:
  nella pagina fa una macchia di luce calda a terra davanti a lui, che trema e si spegne con gli occhi quando muore);
- la camicia grigia con le maniche corte stracciate, la salopette di jeans dalla vita in giù con la pettorina, la tasca, le cuciture, le due
  bretelle sulle spalle e giù per la schiena, due bottoni d'ottone, la polvere di carbone; gli stivali di cuoio;
- il braccio sinistro che pende, il pugno destro chiuso sul piccone: manico di legno lungo, testa di ferro curva con le due punte, la ruggine.

Il piccone fa come nel disegno: la mano gira intorno a un punto accanto alla spalla destra (`pickRel(a)`: 0 avanti, π/2 in su, oltre π/2
dietro la testa) e il piccone non passa mai sotto terra (l'angolo sale finché la punta più bassa sta sopra il suolo). Le mosse: **Fermo**
(ingobbito, il piccone appoggiato avanti, la testa che scatta verso di te, la mano sinistra che trema), **Cammina** (il passo rigido di
oggi, la testa che resta indietro a ogni passo, il piccone basso), **Corre** (piegato in avanti, il piccone di traverso), **Sbuca da terra**
(prima la punta del piccone tenuto in alto, poi il casco con la lampada accesa, la testa, la mano che sbatte a terra, due strattoni, in
piedi, il piccone che scende), **Urla** (il piccone alzato in alto), **Picconata** (l'attacco di oggi: si accuccia e lo tira indietro, lo
alza sopra la testa un po' troppo, lo cala, il piccone morde la terra con le scintille e le schegge, lo strattona e lo tira fuori),
**Morso**, **Colpito**, **Muore** (cade col piccone sotto, la testa di lato e il casco che resta su; si spengono occhi e lampada).
`ZMI3.tip(M, posa)` e `ZMI3.lamp(M, posa)` dicono alla pagina dove sono la punta del piccone e la lampada.

## Lo zombie col corpo vero (`zombie_vero.js`, `ZV3`), scolpito nel codice (`scultura.js`, `SCU`) — in prova

Denis, 4 novembre: «non riesci a farmeli come ci eravamo prefissati di fare per tutti i modelli 3d come l'artefatto modello di prova?»; alla
domanda su cosa voleva dal soldato di prova: **«Corpo più vero, Mosse più naturali»**, e come farlo: **«Solo il codice»** (niente modelli né
mosse prese da fuori). Prima uno solo, lo zombie base, da far vedere a Denis prima di rifare lo strisciante e il minatore. È lo stesso
Zombie della cripta (gli stessi pezzi e gli stessi colori della tavola `Z`, i pantaloni marroni, la maglia blu col buco sulle costole, la
crepa cucita, la cicatrice, i denti storti, gli occhi gialli che brillano) ma col corpo di un uomo vero, magro e marcio, alto sempre circa
42: la testa piccola come quella di una persona (sette teste e mezza), clavicole, scapole, la spina che si vede sotto la maglia, la pancia
incavata sotto le costole, braccia ossute coi bicipiti e i tendini, ginocchia nodose con la rotula, caviglie ossute, mani ossute con quattro
dita lunghe e il pollice, le unghie nere.

**Come si scolpisce un corpo (`scultura.js`).** Il corpo non è fatto di palle e tubi messi uno accanto all'altro ma è **una forma sola fatta
di distanze**: per ogni punto, quanto è lontano dalla pelle (meno di zero dentro). Le forme morbide (`ball`, gli ovali `ell` girati come
l'arto, i coni arrotondati `cone`) si **saldano** con una saldatura morbida (`add(forma, k)`: più `k` è grande, più la giuntura è dolce,
come i muscoli sotto la pelle) e si **scavano** (`dig`: le orbite, il naso marcito, le guance e le tempie incavate, la bocca troppo larga, il
morso nell'orecchio, la pancia). `Sculpt().d(x, y, z)` dà la distanza; le forme lontane dal punto si saltano (è veloce). Poi:
- `nets(D, scatola, h, {keep})`: la pelle di triangoli (surface nets su una griglia larga e poi fine solo vicino alla pelle); `keep(punto)`
  dice dove la superficie non c'è (gli orli, gli strappi, il buco della maglia: lì resta aperta).
- `normal(D, p)` le normali dalla forma, `onSkin(D, p)` il punto sulla pelle più vicino (per cuciture, peli, lacci, costole),
  `occl(D, p, n)` **l'ombra morbida dalla forma stessa** (quanto spazio libero c'è appena fuori: ascelle, sotto il mento, le pieghe), che va
  nell'ombra cotta al posto delle palle di `K3D.bake`.
- `weights(p, ossa, solo)`: i pesi delle ossa dalla distanza dalle ossa (segmenti), misurata nello spessore di ogni osso; in `ZV3` ogni punto
  può seguire solo l'osso della sua parte e quelle accanto (`PART`), così una coscia non segue l'altra; la mascella prende la parte bassa del
  viso.
- `noise`, `fbm`: rumore per orli stracciati, pieghe e chiazze, sempre uguale.

**I vestiti** sono la stessa forma gonfiata di poco e tagliata dove finiscono: la maglia (pieghe intorno al corpo, l'orlo stracciato sotto la
vita, il collo, le maniche stracciate, il buco davanti sopra le costole, lo strappo sulla schiena, il sangue vicino al buco e al collo), i
pantaloni (la vita, gli orli stracciati sopra le scarpe, lo strappo sul ginocchio destro col sangue, sporchi in basso). La forma su cui stanno
è il corpo **senza gli incavi e coi bozzi addolciti** (`body(true)`: la stoffa passa sopra la pancia incavata e sopra la spina, non ci
entra), così la stoffa non lascia mai passare la pelle e non fa doppie pieghe. I vestiti seguono le stesse ossa della pelle sotto (gli
stessi pesi). **La pelle che i vestiti coprono sempre** (ben dentro la maglia e i pantaloni, lontano da orli, strappi e buco) non si fa: non
si vede mai e il modello pesa la metà. Le scarpe: suola spessa con la cucitura scura, la punta tonda e il tallone sbucciati, il collo intorno
alla caviglia con l'apertura, tre incroci di lacci e un laccio che pende.

**Le mosse naturali** (sempre solo da `p`, IK per braccia e gambe, la testa che scatta verso di te dove serve): il passo vero col tallone che
tocca prima e la punta per ultima (`step`), **i due piedi a terra che vanno indietro alla stessa velocità** (5,7 unità al secondo nella
camminata: il passo corto della gamba che trascina sta a terra meno e si trascina più a lungo, così nessun piede scivola; nel gioco lo zombie
deve andare a quella velocità), il bacino che scende sul lato debole e si sposta sopra il piede che regge, le spalle che girano contro le
anche, le braccia che arrivano dopo il corpo, la schiena curva, la testa che pende e ogni tanto ha uno scatto. **Fermo** (sulla gamba destra,
il respiro, la testa che pende e poi scatta verso di te e torna piano, le dita che si contraggono), **Cammina**, **Corre**, **Sbuca da terra**
(le mani, poi la testa, si aggrappa al bordo, due strattoni, un ginocchio a terra, in piedi, la testa che scatta), **Urla** (prende fiato e
poi grida tremando con le braccia aperte, gli occhi più accesi), **Colpo** (si carica indietro, entra col piede destro e graffia di traverso),
**Morso** (afferra, tira a sé, morde e scuote la testa, lascia), **Colpito**, **Muore** (le ginocchia cedono una dopo l'altra e cade
**sulle ginocchia** coi piedi che scivolano indietro e gli stinchi a terra, ondeggia e **cade a faccia in giù facendo perno sulle
ginocchia**, la testa girata di lato a terra, l'ultimo scatto, gli occhi che si spengono).

**Numeri.** Circa 42.000 triangoli (pelle 16.000, vestiti 25.000; lo zombie di prima 10.500), 25 ossa come prima, si costruisce in circa
1,3–1,8 s in Node; una posa 50–200 µs. `ZV3.build({h})` fa la griglia più larga per i telefoni lenti (`h` .3 di solito; con .42 circa metà
triangoli). Nella pagina «Zombie in 3D» è «Corpo vero» (`#vero`), con «Prima e dopo» sopra lo zombie di oggi.

**Le foto veloci** (solo per lavorarci, fuori dal gioco): un piccolo disegnatore a triangoli in Node nella cartella di lavoro (`rapido.js`)
fa un foglio in 3 secondi senza browser, perché qui il browser disegna il 3D senza scheda grafica e una foto della pagina vera costa 6 s.

## Il Viandante (`viandante.js`, `VI3`), il personaggio dell'immagine di Denis — in prova

Denis, 4 novembre, con l'immagine di un uomo stracciato in piedi a braccia un po' aperte: «bro posso chiederti di farmi questo modello in 3d
invece? come hai fatto per l'artefatto modello di prova?». Il soldato del modello di prova era un modello scaricato (Mixamo) disegnato col
nostro WebGL; il Viandante invece è **fatto tutto da noi nel codice**, con la formula del corpo vero (`scultura.js`, come lo zombie col corpo
vero) e disegnato da `mb3.js`. L'immagine sta in `viandante_rif.webp` (piccola, per la pagina). Un uomo magro e asciutto, scalzo, coi capelli
scuri spettinati, la barba di qualche giorno e gli occhi chiari; la tunica grigia senza maniche col collo a V, strappata e bucata; la corda
attorcigliata due volte in vita col nodo grande e i due capi sfilacciati; il borsellino di cuoio; la gonna marrone a due strati stracciata; i
pantaloni marroni al ginocchio col buco; le fasce di stoffa incrociate su avambracci e stinchi; la fascia rossa sul braccio sinistro; il
cordino col cerchio di ferro.

**Il corpo** è una forma sola (busto, collo, testa, braccia, mani con quattro dita a tre ossa e il pollice, gambe, piedi scalzi con le cinque
dita), fatta di triangoli con **griglie diverse per parte**: larga sul corpo (.26), fine sulla testa (.095), più fine sul **viso** (.05:
palpebre, naso, labbra), sulle mani e sui piedi; le griglie si sovrappongono un poco dove si incontrano (la stessa pelle, non si vede). La
pelle che i vestiti e i capelli coprono sempre non si fa. `S.fast` (in `scultura.js`) tiene per ogni cubetto solo le forme che lo toccano:
il modello si costruisce in metà tempo.

**Il viso** come quello dell'immagine: magro e lungo, gli zigomi alti, le guance un po' scavate, la mascella e il mento netti, il naso lungo
e dritto, le labbra sottili chiuse; **gli occhi di misura vera** (un globo di 2,4 cm) dentro **le palpebre**: un guscio intorno all'occhio con
l'apertura a mandorla tagliata da `almond` (l'arco di sopra più alto, l'angolo di fuori un po' in su), la piega sopra la palpebra, l'iride
grigio-azzurra col bordo scuro e l'ombra della palpebra sull'occhio; le sopracciglia folte e scure; la barba di qualche giorno è un'ombra
morbida (più sul mento e sulla mascella, meno sopra il labbro, le basette). Nella pagina «Viso da vicino» lo fa vedere.

**I capelli** sono un guscio sottile su tutta la testa (più spesso in cima) e sopra **le ciocche**: strisce piatte che seguono la testa
allontanandosi dal vortice in cima, più lunghe sopra, pettinate indietro sui lati e giù sulla nuca, e **il ciuffo** di nove ciocche che cade
sulla fronte (oltre l'attaccatura le ciocche si posano sulla pelle), più qualche capello che sta su. Materiale proprio in `mb3.js` (4.3:
lucido debole, venature lungo le ciocche).

**I vestiti** sono la forma gonfiata e tagliata come quelli dello zombie col corpo vero: la tunica (la V profonda e aperta, gli spallacci
stretti, gli scalfi grandi, raccolta dalla corda, l'orlo a strappi con la falda lunga e l'apertura davanti da cui si vede la gonna, i buchi),
le due gonne a punte, i pantaloni (il buco sul ginocchio destro, il sinistro consumato), le fasce (uno strato stretto e due strisce a elica
che si incrociano); la corda a tre capi attorcigliati (due giri, il nodo grande con due anse, i due capi col nodino e la nappa), il
borsellino (sacca morbida, patta con le cuciture, l'alamaro, le cinghie intorno alla corda), il cordino col cerchio di ferro, la fascia rossa
col nodo e le due code. Il contorno è più sottile sulle cose piccole (dita, dita dei piedi, viso), così non diventano inchiostro.

**Le mosse** (nove, solo da `p`, IK per braccia e gambe, i piedi a terra che non scivolano mai): **Posa del disegno** (come l'immagine, respira),
**Fermo** (il peso su una gamba, il respiro, ogni tanto gira la testa verso di te), **Cammina** (il tallone prima e la punta per ultima, il
peso da un piede all'altro, le anche e le spalle che girano al contrario, le braccia che dondolano), **Corre**, **Si guarda intorno**,
**Saluta**, **Pugno** (guardia, passo avanti, il destro dritto col giro delle anche), **Colpito** (la testa all'indietro, un passo indietro),
**Muore** (la mano al petto, le ginocchia che cedono, a faccia in giù).

**Numeri.** Circa 148.000 triangoli (la pelle 66.000, di cui il viso 13.500 e il resto della testa 17.000; capelli, vestiti e cose addosso il
resto), 27 ossa, si costruisce in 4–5,5 s sul computer di prova; una posa 80 µs (`VI3.build({h})` con la griglia più larga per i telefoni lenti). Pagina: `python3 anteprime/mk_viandante3d.py` →
`anteprime/viandante3d.html` (la stessa pagina di «Zombie in 3D», `anteprime/zombie3d.js`, in studio con la luce morbida): le mosse, «Viso da
vicino», «Quattro direzioni», «Con l'immagine» (l'immagine di Denis accanto al 3D, nella posa del disegno), scena studio o notte, luce a tre
toni o morbida, contorno, effetti ridotti. Prova: `node tests/zombie3d.js anteprime/viandante3d.html [--senza-foglio]` (17 controlli; senza il foglio delle mosse, che qui nel browser
senza scheda grafica costa venti minuti, in cinque; foto `tests/viandante3d_mosse.jpg`,
`_quattro.png`, `_prima_dopo.png`, `_viso.png`, `_viso_lato.png`).

## I file

- `mb3.js` (`MB3`): legge un glTF binario (`.glb`) con lo scheletro e le mosse, e disegna sia quelli sia i modelli costruiti da noi, col
  nostro WebGL 2 senza librerie: `readGLB`, `model`, `pose`, `gpu`, `draw` (contorno, tre toni, bordo di luna, rilievo, luce degli occhi che
  pulsa, lampo bianco, nebbia, `clipY` per non disegnare quello che sta sotto terra). Per i pezzi fatti da noi: colore per vertice e
  `aK` = [cosa è (1 pelle, 2 maglia, 3 pantaloni, 4 cuoio, 5 osso e denti, 6 buio dentro, 9 luce), sangue, ombra cotta, contorno].
- `kit3d.js` (`K3D`): la cassetta della formula (conti, forme, scheletro, ombre cotte, il modello per `MB3`, testa e braccio da zombie).
- `zombie.js`: lo zombie base (sopra). `strisciante.js`: lo strisciante (sopra). `minatore.js`: il minatore (sopra).
- `scultura.js` (`SCU`): scolpire nel codice con le distanze (forme morbide saldate e scavate, la superficie, normali, ombre morbide, punto sulla pelle, pesi, rumore). `zombie_vero.js` (`ZV3`): lo zombie base col corpo vero (sopra, in prova). `viandante.js` (`VI3`): il Viandante (sopra, in prova).
- `oggi.js`: un nostro mostro di oggi da quattro lati (davanti, tre quarti, lato, dietro), per «Prima e dopo»: `node sprite/mostri3d/oggi.js
  <uscita.webp>` (lo zombie, `zombie_oggi.webp`) o `node sprite/mostri3d/oggi.js strisciante strisciante_oggi.webp` (e `minatore`), dopo
  `python3 tests/mk.py`.
- `prepara.js`: da un personaggio `.glb` con lo scheletro e dalle sue mosse in altri `.glb` fa un `.glb` solo e leggero (serviva per Meshy).
- Pagina: `python3 anteprime/mk_zombie3d.py` → `anteprime/zombie3d.html` (codice in `anteprime/zombie3d.js`), pubblicata su
  https://claude.ai/artifact/Weae1UsGGoEti6wccnqTRB («Zombie in 3D», si aggiorna ripubblicando lo stesso file): in alto «Zombie»,
  «Corpo vero», «Strisciante» o «Minatore» (l'indirizzo che finisce con `#vero`, `#strisciante` o `#minatore` apre quello), le mosse, «Tutte», il dito che gira, due dita o − e + per
  avvicinare, «Quattro direzioni», «Prima e dopo», luce a tre toni o morbida, contorno, effetti ridotti.
  Prova: `node tests/zombie3d.js [zombie|vero|strisciante|minatore]` (gli stessi controlli per ogni mostro, e per il minatore le scintille e la
  lampada; foto `tests/zombie3d_mosse.jpg`, `_prima_dopo.png`, `_prima_dopo_grande.png`, `_quattro.png` per lo zombie base e le stesse
  `tests/vero3d_…`, `tests/strisciante3d_…` e `tests/minatore3d_…`).

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
