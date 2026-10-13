# Lumbra in pixel art (progetto Niumon)

Richiesta di Denis del 13 ottobre: «fai 2d come le creature in questa immagine» (una lotta in stile Pokémon con sprite in pixel art su
un bosco 3D di notte). Gli sprite sono fatti dai suoi disegni di Lumbra (davanti e da dietro), così restano il suo personaggio.

- `lumbra_davanti.png` (87×95 px, 24 fotogrammi in fila) e `lumbra_dietro.png` (87×87 px, 24 fotogrammi): l'avversario visto davanti
  e il proprio Lumbra visto da dietro, fermo che respira, a 10 fotogrammi al secondo. `lumbra_*.json`: misure, fotogrammi e il punto
  dei piedi (`foot`, in pixel dello sprite) dove va l'ombra.
- Come sono fatti (`fai.sh` rifà tutto): `mask.py` ritaglia il disegno (niente carta, niente ombra a matita a terra); `pix3.py` lo
  riduce a un pixel ogni 12 del disegno, con la palette fissa (contorno, linea interna, sei grigi, cinque viola, i colori degli occhi),
  il contorno scuro di un pixel, le linee interne prese dai tratti scuri del disegno e i colori isolati tolti; `eyes.py` mette gli
  occhi, il muso e la bocca disegnati a mano pixel per pixel (anche gli occhi chiusi del battito); `smoke.py` misura le code di fumo
  dalla radice alla punta; `anim.py` fa i fotogrammi spostando il fumo di pixel interi (onda che corre verso la punta, contorno
  ridisegnato), il respiro di un pixel, il battito delle palpebre e gli sbuffi che galleggiano.
- I disegni originali (`v_front.png`, `v_back.png`, 1254×1254) non sono nel repository: per rifare gli sprite vanno messi qui.
- Pagina di prova: `python3 anteprime/mk_lumbra_lotta.py` → `anteprime/lumbra_lotta.html` (scena di lotta nel bosco, quattro mosse,
  vista «Sprite» da vicino), pubblicata su https://claude.ai/artifact/KkxePrDKwoDGsGzELz52Ed.

Da fare: i due lati per la mappa (dai disegni di lato), le mosse disegnate nello sprite (morso a bocca aperta, balzo), il giudizio di
Denis su grandezza dei pixel e colori.
