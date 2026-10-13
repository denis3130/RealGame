# Il primo Niumon in pixel art (progetto Niumon)

Dal foglio che Denis ha mandato il 13 ottobre (sera): quattro viste (FRONT, LEFT, BACK, RIGHT) e quattro pose (IDLE, WALK, ATTACK,
HIT) dello stesso Niumon grigio con le fiamme e il fumo viola. Il foglio è suo e non sta nel repository: per rifare tutto va messo in
`fai/` come `foglio.png` e si lancia `fai/fai.sh`.

Regola del piano degli sprite (versione 1.1): creature e personaggi solo in pixel art 2D, mai modelli 3D al loro posto; prima di metterli
nel gioco Denis guarda tutte le direzioni.

## Cosa c'è

- `direzioni/`: le 8 direzioni per la mappa, ognuna animata (fumo che ondeggia, respiro, battito delle palpebre), in due grandezze:
  `grande_*` (circa 104 px, per giudicarle) e `mappa_*` (62 px, la grandezza di gioco in un riquadro da 64×64). Ci sono 6 fogli:
  `giu`, `giu_sinistra`, `sinistra`, `su_sinistra`, `su`, `destra`; `su_destra` e `giu_destra` sono lo specchio di `su_sinistra` e
  `giu_sinistra`. Ogni `.json` ha misure, fotogrammi, fps e `anchor` (il punto dei piedi, al centro del corpo).
- `lotta_*`: la lotta. L'avversario di tre quarti davanti (dalla posa IDLE, con le pose ATTACK e HIT) e il proprio Niumon da dietro.
- `mappa_*` (fuori da `direzioni/`): la prima prova per la mappa (quattro direzioni e il passo), superata da `direzioni/`.

## Come sono fatti (`fai/`)

1. `ritaglia.py`: le 8 pose dal foglio. `mask2.py`: il ritaglio senza carta né ombra a matita a terra.
2. `mk_sprites.py` (con `pix.py`, `pix3.py`): la grana della matita lisciata (TV), poi un pixel ogni k del disegno con la tavolozza fissa
   (sei grigi, cinque viola, colori degli occhi), contorno di un pixel, linee interne dai tratti scuri, macchie isolate tolte, le chiazze
   chiare del fumo rimesse viola.
3. Occhi: `eyesr.py` li disegna da tre numeri (angolo interno tondo, punta esterna, mezza larghezza), sempre uguali; sulla mappa sono
   fatti a mano pixel per pixel (`eyes_dmap.py`, `fixeyes.py`).
4. Le diagonali che il foglio non ha: `collage.py` (tre quarti davanti = la testa di tre quarti della posa IDLE sul corpo di lato, un po'
   stretto) e `turnaway.py` (tre quarti dietro = il lato con la faccia girata via). Le diagonali di destra sono specchi.
5. `anim2.py`: i fotogrammi del fermo (fumo che si muove di pixel interi con il contorno ridisegnato, respiro di un pixel, palpebre).
6. Controllo: `strip8.py` mette le 8 direzioni in fila; `showlab.py` stampa i colori di una zona per sistemare a mano.

Pagina da far vedere a Denis: `python3 anteprime/mk_niumon_direzioni.py` → `anteprime/niumon_direzioni.html`, pubblicata su
https://claude.ai/artifact/C4ceMh2S7TfiBzod9zqrYY. La scena di lotta in un bosco 3D (`anteprime/mk_niumon_2d.py`) è una prova ferma:
Denis vuole prima giudicare le direzioni.

Da decidere con Denis: le due diagonali costruite (giù-sinistra e su-sinistra); per le prossime creature un foglio a 5 viste (davanti,
tre quarti davanti, lato, tre quarti dietro, dietro) così nessuna direzione è inventata.
