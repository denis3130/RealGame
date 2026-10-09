# Nemici della modalità zombie (bozza, non ancora nel gioco)

`disegno_mostri.js` disegna i mostri con le funzioni del gioco (`ctx`, `ink`, `ell`, `shadow`, `glow`, `INK`, `LOWFX`, `G.t`). Va eseguito dentro la funzione principale di `index.html`; espone `CR.zombie`, `CR.strisciante`, `CR.minatore`, `CR.hound`, `CR.becchino` con firma `(x, y, face, anim, p, sc)`: `x, y` è il punto dei piedi, `face` la direzione in radianti, `p` va da 0 a 1 lungo la mossa, `sc` la grandezza.

- **Zombie della cripta** (`zombie`): `idle`, `walk` (zoppica trascinando la gamba sinistra, braccia tese in avanti), `attack` (alza le braccia sopra e dietro la testa, poi graffia in avanti).
- **Zombie strisciante** (`strisciante`): `idle`, `walk` (una mano avanza e tira mentre l'altra si appoggia), `attack` (si alza sulle braccia e scatta in avanti a bocca aperta).
- **Zombie minatore** (`minatore`): `idle`, `walk`, `attack` (piccone sopra la testa, colpo a terra con scintille, lo strattona e lo tira fuori). La lampada del casco illumina il pavimento davanti.
- **Segugio infernale** (`hound`): `idle`, `walk` (galoppo), `attack` (si acquatta, salta a fauci aperte, atterra).
- **Il Becchino** (`becchino`, boss): `idle`, `walk`, `slam` (pala dietro la testa e colpo a terra con crepa verde), `summon` (braccio dritto in alto, cerchio verde, mani dei morti che escono da terra).

## Perché si muovono senza fotogrammi brutti

- Ogni mostro è uno scheletro 3D (avanti, destra, su) proiettato con la direzione: gira a 360 gradi e ogni pezzo resta attaccato allo stesso punto.
- Il busto è una capsula tra due sfere (bacino e petto), quindi si piega allo stesso modo da ogni lato.
- Braccia e gambe sono due ossa risolte con la cinematica inversa: la spalla o l'anca sta ferma sul corpo, la mossa sposta mano o piede, gomito e ginocchio si trovano da soli. Gli arti non cambiano mai lunghezza e si piegano sempre dalla parte giusta.
- L'ordine di disegno dipende solo da dove sono attaccati spalle e anche, mai dalla mano o dal piede che si muove: niente pezzi che saltano davanti o dietro al corpo a metà passo.
- Le gambe stanno sempre sotto il corpo; maniche, colli e attaccature non hanno il contorno dove entrano nel corpo (quando la spalla è sul bordo del corpo).
- Piccone e pala girano in un piano di fianco alla testa (non tagliano mai la faccia) e si fermano sul pavimento.
- Ogni movimento dipende solo da `p`: l'ultimo fotogramma si collega al primo.

## Fogli PNG

8 righe (davanti, davanti-destra, destra, dietro-destra, dietro, dietro-sinistra, sinistra, davanti-sinistra) × un fotogramma per colonna, sfondo trasparente, nessuna direzione specchiata. Ogni fotogramma è disegnato da solo, quindi niente sbavature tra le caselle. Tutte le mosse di un mostro hanno la stessa casella e i piedi sempre nello stesso punto:

| Mostro | Casella | Piedi (x, y) | Mosse (fotogrammi) |
|---|---|---|---|
| zombie | 204 px | 102, 175 | idle 6, walk 8, attack 8 |
| strisciante | 180 px | 90, 113 | idle 6, walk 8, attack 8 |
| minatore | 270 px | 135, 199 | idle 8, walk 12, attack 14 |
| hound | 198 px | 99, 167 | idle 8, walk 12, attack 14 |
| becchino | 432 px | 216, 287.6 | idle 6, walk 8, slam 10, summon 10 |

`fogli.json` ha gli stessi numeri più `view`: per ogni mossa un quadrato più stretto (in frazioni della casella) per le anteprime.

Per rifare i fogli dopo aver cambiato `disegno_mostri.js`: `python3 tests/mk.py` e poi `node tests/mostri.js` (oppure `node tests/mostri.js zombie hound` per rifarne solo alcuni).

Da fare dopo l'ok di Denis: voci in `ET`, IA, danni, capitolo in cui compaiono, ingresso del boss.

Lo Zombie gonfio è stato tolto (non piaceva a Denis); il suo ultimo codice è nella storia di git (commit `7416fcc`).
