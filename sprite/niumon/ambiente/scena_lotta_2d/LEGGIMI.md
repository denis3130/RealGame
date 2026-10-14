# Livelli della scena di lotta 2D

I cinque livelli del bosco della prima scena di lotta (`anteprime/niumon_lotta.html`, https://claude.ai/artifact/YDzxScVHMophiGdL2Bi4r8),
che la pagina disegna col codice a 1280×720: `cielo_e_bosco_lontano` (in fondo, opaco), `alberi_di_mezzo`, `terra`, `primo_piano`
(tronchi sfocati ai bordi) e `nebbia_che_scorre` (512×128, si ripete in orizzontale). Sono sfumati, non pixel art: il bosco in pixel
art vero è in `../bosco_notte/`.

`python3 esporta.py` li salva come PNG (apre la pagina nel browser di prova e prende i livelli da `window.__strati`; prima
`python3 anteprime/mk_niumon_lotta.py`), con i dati in `scena_lotta_2d.json` (asset_id `bg_battle_bosconotte2d_<nome>`).
