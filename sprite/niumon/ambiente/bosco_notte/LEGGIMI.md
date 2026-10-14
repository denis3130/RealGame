# Bosco di notte (ambiente della lotta dei Niumon)

Richiesta di Denis (14 ottobre): «dammi tutti gli sprite che hai usato per l'ambientazione della lotta… creami un'anteprima con
tutto a 360 gradi». Il bosco della prima scena di lotta era disegnato col codice dentro la pagina (forme sfumate, non pixel art):
qui è rifatto come **sprite veri in pixel art**, un PNG per cosa, messi in un mondo 3D (stile HD-2D: il mondo in 3D, tutto quello
che ci sta dentro in pixel art). Stato: **da approvare**, niente è nel gioco.

## Cosa c'è (34 sprite, `python3 fai.py` li rifà tutti uguali)

| cartella | sprite | note |
|---|---|---|
| `alberi/` | `albero_spoglio_1`–`4`, `albero_storto_grande`, `alberello_secco` | corteccia blu grigia in quattro toni, filo di luce della luna in alto a destra, rametti di un pixel, radici che si allargano; tela adattata all'albero, pivot alla base del tronco |
| `rocce/` | `sasso_grande`, `sasso_medio`, `sasso_piccolo`, `sasso_piatto`, `ceppo` | sassi a faccette (un tono per faccia dalla luce), muschio |
| `piante/` | `erba_1`–`3`, `felce_1`–`2`, `funghi_1`–`2`, `cespuglio_secco` | i funghi brillano di azzurro (`brilla` nel .json) |
| `a_terra/` | `radici_1`–`2`, `foglie_secche` | stese a terra, viste dall'alto (`billboard: false`) |
| `terreno/` | `terra`, `radura`, `muschio` | piastrelle 64×64 che si ripetono senza cuciture |
| `luce/` | `luna` (pixel art), `alone_luna`, `nebbia`, `raggio_di_luna`, `luce_fuoco`, `ombra` | le luci morbide si sommano (`blend: somma`) o velano (`blend: alfa`) |
| `particelle/` | `lucciola` (5×5, 4 fotogrammi), `cenere` (3×3, 2), `brace` (4×4, 5) | fotogrammi in fila |

Ogni sprite ha il suo `.json` (asset_id `env_bosconotte_<nome>`, misure, fotogrammi, `pivot`, `unita_per_pixel`, `billboard`,
`blend`, stato). `bosco_notte.json` è l'elenco; `atlante.png` + `atlante.json` mettono tutti gli sprite in pixel art in un'immagine
sola (1024×512, rettangolo di ognuno; il rettangolo è il foglio intero, il primo fotogramma è largo `frame_width`);
`foglio_di_controllo.png` li mostra tutti ingranditi.

Misure nel mondo (`unita_per_pixel`): alberi 1/26, sassi e piante 1/40, terreno e cose a terra 1/32, luci 1/40, particelle 1/50;
le volpi in lotta stanno a 1/50 (96 px = 1,9 unità).

## Come sono fatti

- `pixel.py`: la tela a etichette (`Tela`), la tavolozza del bosco (`PAL`: corteccia `k0–k6`, muschio `m0–m4`, pietra `s0–s6`,
  erba `g0–g5`, terra `t0–t5`, legno e foglie `f0–f5`, funghi `u0–u6`, luna e lucciole, il fuoco delle volpi), linee spesse
  (`capsula`), linee di un pixel, ovali, contorno, luce dalle normali, pulizia dei pixel soli, rumore che si ripete.
- `alberi.py`: rami ricorsivi che tendono verso l'alto, poi contorno, toni e luce della luna.
- `piccoli.py`: sassi a faccette (Voronoi), ceppo, erba, felci a spina di pesce, funghi, cespuglio, radici e foglie.
- `terreno.py`: piastrelle con le cose vicino al bordo che continuano dall'altra parte.
- `luce.py`: la luna e le luci morbide; le particelle in fogli di fotogrammi.
- Colori freddi (blu, grigi, verdi scuri) di proposito: le volpi di fuoco devono staccarsi.

## Dove si vede

Pagina `python3 anteprime/mk_niumon_bosco360.py` → `anteprime/niumon_bosco360.html`, pubblicata su
https://claude.ai/artifact/DkjGkNBHoUGK8EVVscxr2c (WebGL2, nessuna libreria): la radura col bosco intorno, la telecamera gira a
360° col dito (due dita o rotella per avvicinarsi, «Vista lotta» per tornare, «Gira da solo»), gli alberi e le piante guardano
sempre la telecamera e fanno l'ombra della luna sul terreno, le due volpi prendono la vista giusta (davanti o di spalle, girate a
destra o a sinistra) da dove guarda la telecamera, la lotta si gioca (Fiammata, Graffio, Braci, Coda ardente con gli effetti di
`sprite/niumon/effetti/fuoco/`). Seconda scheda «Tutti gli sprite»: ogni sprite da vicino, animato.

Pacchetto da dare a Denis: `python3 sprite/niumon/pacchetto_lotta.py <cartella>` (volpi, bosco, effetti, livelli 2D, atlante,
registro JSON e CSV, anteprime).
