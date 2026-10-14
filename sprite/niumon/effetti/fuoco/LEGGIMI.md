# Effetti di fuoco delle mosse (lotta dei Niumon)

Pixel art con gli stessi colori delle volpi di fuoco, fogli di fotogrammi in fila. `python3 effetti.py fai` li rifà (PNG, un .json
per effetto con asset_id `vfx_battle_fuoco_<nome>`, ed `effetti_fuoco.json`); `python3 effetti.py foto.png` fa il foglio di prova.
Stato: **da approvare**.

| effetto | fotogramma | fotogrammi | dove si usa nella pagina 3D |
|---|---|---|---|
| `palla_di_fuoco` | 16×16 | 4 (si ripete) | Braci: tre palle che volano ad arco |
| `fiammata` | 24×24 | 6 (fuoco poi fumo) | Fiammata: tanti sbuffi in fila, solo i fotogrammi di fuoco; Coda ardente: le fiamme che salgono |
| `esplosione` | 48×48 | 6 | Coda ardente: lampo, anello di fuoco, fumo |
| `graffio` | 32×32 | 4 | Graffio: tre artigli di luce in diagonale |
| `scintilla` | 9×9 | 3 | dove arriva ogni colpo |

Nella pagina 3D (`anteprime/niumon_bosco360.tpl.html`) stanno a 1/50 di unità per pixel come le volpi, con un bagliore morbido
che si somma intorno (tranne il graffio).
