# Nemici della modalità zombie (bozza, non ancora nel gioco)

`disegno_mostri.js` disegna i mostri con le funzioni del gioco (`ctx`, `ink`, `ell`, `shadow`, `glow`, `INK`, `LOWFX`, `G.t`). Va eseguito dentro la funzione principale di `index.html`; espone `CR.zombie`, `CR.strisciante`, `CR.minatore`, `CR.lanterna`, `CR.hound`, `CR.becchino` con firma `(x, y, face, anim, p, sc)`: `x, y` è il punto dei piedi, `face` la direzione in radianti, `p` va da 0 a 1 lungo la mossa, `sc` la grandezza.

- **Zombie della cripta** (`zombie`): `idle`, `walk` (zoppica trascinando la gamba sinistra, braccia tese in avanti), `attack` (alza le braccia sopra e dietro la testa, poi graffia in avanti).
- **Zombie strisciante** (`strisciante`): `idle`, `walk` (una mano avanza e tira mentre l'altra si appoggia), `attack` (si alza sulle braccia e scatta in avanti a bocca aperta). Visto davanti il corpo dietro al petto è disegnato più lungo (passando piano da tre quarti a davanti), così la schiena e la spina dorsale non spariscono dietro la testa.
- **Zombie minatore** (`minatore`): `idle`, `walk`, `attack` (piccone sopra la testa, colpo a terra con scintille, lo strattona e lo tira fuori). La lampada del casco illumina il pavimento davanti.
- **Zombie della lanterna** (`lanterna`, più grosso degli altri zombie: grandezza 1,55 contro 1,1): `idle`, `walk` (passi lunghi e pesanti, la lanterna dondola), `attack` (alza il bastone dietro la testa, sbatte la lanterna a terra, esplosione di luce verde con scintille). Dai disegni di Denis: cappuccio con muschio e rametto secco, faccia verde con grandi occhi gialli e lingua di fuori, mantellina e mantello strappati, chiave arrugginita alla cintura, gambe fasciate e piedi con artigli, bastone con lanterna accesa che illumina il pavimento.
- **Segugio infernale** (`hound`): `idle`, `walk` (galoppo), `attack` (si acquatta, salta a fauci aperte, atterra). Gli occhi hanno un posto loro nell'ordine di disegno della testa: visti davanti a destra o a sinistra le orecchie non li coprono più.
- **Il Becchino** (`becchino`, boss): `idle`, `walk`, `slam` (pala dietro la testa e colpo a terra con crepa verde), `summon` (braccio dritto in alto, cerchio verde, mani dei morti che escono da terra).

## Perché si muovono senza fotogrammi brutti

- Ogni mostro è uno scheletro 3D (avanti, destra, su) proiettato con la direzione: gira a 360 gradi e ogni pezzo resta attaccato allo stesso punto.
- Il busto è una capsula tra due sfere (bacino e petto), quindi si piega allo stesso modo da ogni lato.
- Braccia e gambe sono due ossa risolte con la cinematica inversa: la spalla o l'anca sta ferma sul corpo, la mossa sposta mano o piede, gomito e ginocchio si trovano da soli. Gli arti non cambiano mai lunghezza e si piegano sempre dalla parte giusta.
- L'ordine di disegno dipende solo da dove sono attaccati spalle e anche, mai dalla mano o dal piede che si muove: niente pezzi che saltano davanti o dietro al corpo a metà passo.
- Le gambe stanno sempre sotto il corpo; colli e attaccature non hanno il contorno dove entrano nel corpo (quando la spalla è sul bordo del corpo).
- Le braccia dei quattro zombie sono magre e ossute (`bone`, `claw`, `rag`): ogni osso si stringe verso il polso, il gomito ha un nodo che sporge solo quando il braccio è piegato, le mani hanno un palmo piccolo e tre dita lunghe che finiscono in artigli neri a punta. La manica è un tubo stretto che finisce con lo strappo: dove sta sopra la camicia si fonde con lei (niente palla sulla spalla), sul bordo del corpo tiene il contorno. Il Becchino ha ancora le maniche larghe del cappotto.
- Piccone, pala e bastone della lanterna girano in un piano di fianco alla testa (non tagliano mai la faccia) e si fermano sul pavimento.
- Il cappuccio dello Zombie della lanterna è una palla di stoffa con il davanti tagliato: da ogni lato copre la testa dove deve e lascia vedere la faccia dall'apertura.
- Ogni movimento dipende solo da `p`: l'ultimo fotogramma si collega al primo.

## Come sono dipinti

Lo Zombie della lanterna è il modello per l'aspetto grafico di tutti (regola di Denis): gli altri mostri restano identici nei pezzi e nelle mosse, ma sono dipinti come lui.

- Luce calda dall'alto a sinistra: ogni pezzo ha tre toni, cioè il suo colore, un lato più scuro e una luce morbida (`rim`, `glowTop`).
- Un filo di luce calda dentro il contorno, sul lato illuminato (`rim`).
- Braccia, gambe, maniche, corna e code hanno il lato in ombra e una riga di luce (`shadeLimb`).
- Pieghe sui vestiti (`folds`), macchie sulla pelle, segni del pelo sul segugio.
- Bagliori morbidi su occhi e luci, con un puntino bianco negli occhi.
- Colori un po' più ricchi; il segugio è un po' più chiaro di prima perché si leggano le forme.
- Luminosità: tutte le luci calde passano da `wa()` e si regolano insieme con `LITK` (oggi 0,55, scelto con Denis perché all'inizio era troppo luminoso). I mostri restano chiari più o meno come prima del ridisegno.

La lanterna ha le sue funzioni e non si tocca: dopo ogni modifica i suoi fogli devono restare identici al pixel (`git status` non deve mostrare `lanterna_*.png`).

## Fogli PNG

8 righe (davanti, davanti-destra, destra, dietro-destra, dietro, dietro-sinistra, sinistra, davanti-sinistra) × un fotogramma per colonna, sfondo trasparente, nessuna direzione specchiata. Ogni fotogramma è disegnato da solo, quindi niente sbavature tra le caselle. Tutte le mosse di un mostro hanno la stessa casella e i piedi sempre nello stesso punto:

| Mostro | Casella | Piedi (x, y) | Mosse (fotogrammi) |
|---|---|---|---|
| zombie | 204 px | 102, 174 | idle 6, walk 8, attack 8 |
| strisciante | 180 px | 90, 113 | idle 6, walk 8, attack 8 |
| minatore | 270 px | 135, 199 | idle 8, walk 12, attack 14 |
| hound | 198 px | 99, 167 | idle 8, walk 12, attack 14 |
| lanterna | 426 px | 213, 285.6 | idle 8, walk 12, attack 14 |
| becchino | 432 px | 216, 295.6 | idle 6, walk 8, slam 10, summon 10 |

`fogli.json` ha gli stessi numeri più `view`: per ogni mossa un quadrato più stretto (in frazioni della casella) per le anteprime.

Per rifare i fogli dopo aver cambiato `disegno_mostri.js`: `python3 tests/mk.py` e poi `node tests/mostri.js` (oppure `node tests/mostri.js zombie lanterna` per rifarne solo alcuni).

Da fare dopo l'ok di Denis: voci in `ET`, IA, danni, capitolo in cui compaiono, ingresso del boss.

Lo Zombie gonfio è stato tolto (non piaceva a Denis); il suo ultimo codice è nella storia di git (commit `7416fcc`).
