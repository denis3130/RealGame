# Mostri in 3D vero (modelli con lo scheletro)

Prova del 3–4 novembre: **il nostro zombie base in 3D vero** (Denis: «mi piace come l'hai fatto il modello in 3d in questa immagine che mi
hai mandato senza meshy», «non serve accedere a meshy continua cosi»). Solo un'anteprima: niente entra nel gioco senza il sì di Denis.

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

## Meshy (non si usa)

Il 3 novembre si era provato a rifare lo zombie con Meshy: la prova si è fermata prima di generare qualcosa (Denis: «fa niente non usare
meshy»; nessun credito speso). In questa sessione c'erano le istruzioni di Meshy ma non l'accesso al suo account, e i codici da approvare su
meshy.ai sono scaduti. Il soldato delle foto di quel giorno era un modello di prova scaricato (Vanguard di Mixamo, dagli esempi di three.js),
non nostro: nostro era solo il modo di disegnarlo.
