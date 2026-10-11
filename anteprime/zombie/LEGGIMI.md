# Mappa zombie: motore 3D «alla Pokémon» e prop (anteprima, non ancora nel gioco)

Richiesta di Denis (11 ottobre): telecamera dritta dall'alto come nel gioco, ma case e tutto ciò che è alto in 3D, che «si vede meglio
quando ci passi accanto», come in Pokémon Bianco e Nero. Tutto dipinto come la lanterna (tre toni, bordo illuminato, buio ai piedi, luce in cima,
contorno scuro spesso). Pagina di prova: `python3 anteprime/zombie/mk.py [area]` → `anteprime/zombie.html` (il gioco + mostri + armi + motore +
prop + area; non si salva su git). Area predefinita `area_prova` (un angolo 10×10 con cimitero, cripta, casa, pozzo: serve a rivedere i prop).

## Il motore (`motore.js`, globale `ZM`)

- **Proiezione** `S(x,y,z)`: schermo = `(x + piega·z, y − z + piega·z)`, dove la piega cresce con la distanza dall'eroe (`CAM.lx=.0048`, `CAM.ly=.0016`)
  e satura piano verso 23° (`soft`), così le cose alte ai bordi dello schermo mostrano il fianco verso l'eroe senza sembrare cadute. Ogni prop può
  piegarsi meno con `lk` (1 case e muri; .65 alberi; .6 pozzo, pilastri, cancello; .5 lapidi e cartelli; .45 lampione): le sue fiamme e luci
  portano lo stesso `lk`.
- **Facce**: `face(p0,p1,p2,p3,mat,key,o)` quattro angoli 3D in senso antiorario visti da fuori; visibile se la proiezione gira nel verso giusto.
  `key` è l'orientamento: `t` sopra, `s` sud, `e` est, `w` ovest, `n` nord, `r`/`rn` falde verso sud/nord, `rw`/`re` falde verso ovest/est. La luna sta a
  ovest, alta: `TONE` dà i toni (ovest e sopra chiari, est e nord scuri). Ogni faccia ha una texture dipinta una volta (`texture`: tono +
  `MARKS` del materiale + luce calda in alto sulle facce verso il cielo, o buio ai piedi e filo freddo in cima su quelle in piedi) e appoggiata sul
  quadrilatero con `drawQuad` (una trasformazione affine, o due triangoli esatti se non è un parallelogramma). `o.tex(w,h,key)` aggiunge segni
  nella texture, `o.ink` lo spessore del contorno della faccia.
- **Materiali** `material(nome,[base,scuro,chiaro],marks)`: pietra (`stone` per le lapidi, `stoneW`/`stoneWD` più scuri e freddi per muri, pilastri,
  pozzo e cripta, `slab` lastre del tetto), legno in tre famiglie (`oldwood`/`board`/`post` legno vecchio argentato per recinti, cartelli e pali;
  `plankD`/`stave`/`wood` legno scuro oliato per casse, botti e mobili; `siding`/`plank` assi della casa), `brick` fumoso, `shingle`/`slate`/`tile`
  tetti, `iron`, `glass` ambra, `pumpkin` sporco, `leafZ` chiome malate, `leafA` ruggine, `hay` paglia spenta, `plaster` intonaco interno, `soil`.
  Segni: `plank`, `siding`, `stone`, `brick`, `shingle` (muschio solo ai bordi bassi delle tegole), `slab`, `bark`, `vgrain`, `straw`, `plaster`.
- **Pezzi**: `box`, `prismX` (profilo `[u,z]` estruso lungo y; `out:'profile'` per i profili non convessi come le croci), `prismY` (profilo `[v,z]`
  lungo x: tetti), `plane` (pannello verticale con trasparenza, lungo `'x'`, `'y'` o un angolo in radianti: recinti, cancellate, ante, porte,
  finestre), `cyl` (n lati, `r1` in cima), `ballAt` (sfera a tre toni; `lobes/amp/ph` profilo smerlato per le chiome), `line3`, `poly3`, `fn3(S2=>…)`
  disegno libero con la proiezione, `hullOf` contorno convesso.
- **Un prop**: `prop({bx,ky,parts,lk,house})`; `solid(x,y,w,d)` per le collisioni (`.round` per il buio di contatto a ellisse, `.noAO`), `shade`/`shadeR`
  ombre cotte nel terreno (strato unico composto a .24+.16, piede più scuro, mai nere dove si sommano), `lights` (bagliori dal vivo), `flames`
  (candele, vetri, zucche, camini, il verde della cripta), `decals` (pozze di luce fisse e macchie cotte nel terreno), `holes` (fosse da cui
  escono gli zombie), `houses` (il tetto sfuma quando l'eroe entra o sta sul portico), `smokes`, `perches` (corvi appollaiati che volano via).
- **Terreno** `bakeGround(w,h,painter)`: il painter dipinge con `ZM.G` (`grass`, `tufts`, `soil`, `cobbles(w,h,inside)`, `leaves`, `twigs`,
  `floorPlanks`, `bloodTrail`, `holes`, `puddle`), poi ombre, buio di contatto e decalcomanie. Dal vivo: nuvole sulla luna, stormo di corvi con le
  ombre, nebbia bassa, lucciole, foglie che cadono, fumo dei camini, velo di notte con i buchi delle luci (a 1/3 di risoluzione).
- Esseri: eroe con la pistola (`ARMI.inMano` tramite `held`), zombie `CR.*` che escono dalle buche; `__MZ` espone `tp, cam, zoom, setWhole, zombies, low`
  per i test. Costo: 4–11 ms a fotogramma sull'area di prova.

## I prop (`prop.js`, `ZM.P`)

`wall` (muretto a pezzi di una casella con un solo contorno per corsa, cancellata opzionale), `pillar(x,y,kind)` (palla, urna, cuspide spezzata),
`gateLeaf` (anta dipinta girata di un angolo, perni sul pilastro), `grave(x,y,kind,o)` (lastra tonda, a punta, croce, obelisco; `lean`, `wreath`,
`candle`; cumulo a cupola, incisioni col filo di luce, scheggiature, colature), `tree(x,y,dead,s,o)` (tronco a cilindro di corteccia, radici
curve, rami a cono che si biforcano; morto: cappio che dondola, cavo con due lucine, moncherini; vivo: chioma fusa in una silhouette, due rami
nudi, foglie che cadono; `o.autumn`), `lamp`, `pumpkin(x,y,s,carved,rot)`, `crate`, `barrel`, `rock`, `bush` (rovo con bacche), `hay`, `well` (argano,
manovella, mano ossuta sull'orlo), `barrow`, `openGrave`, `sign(x,y,a,b)`, `fence` (legno vecchio, picchetti rotti o mancanti), `crypt`
(pilastri, cornice con «REQUIESCANT IN PACE», frontone col teschio e le tibie, tetto a lastre, grata con la luce verde, lastre cadute), `house`
(muri a pezzi davanti/dietro, porta a pannelli, finestre accese o sbarrate con la luce sull'erba, portico con pali e lanterna, tetto con tegole
mancanti, buco e camino che fuma; dentro: pavimento di assi, tappeto col pentacolo, tavolo con la candela, letto con una forma sotto, sedia
rovesciata, scaffale, camino acceso, scia scura).

## Revisione «impeccabile» (11 ottobre)

Vetrina: `node scratchpad/vetrina.js` (quattro viste per prop: eroe a sinistra, destra, sopra, sotto; effetti accesi) e `python3 tavole.py`
→ `board1..4.jpg`. Sei critici in parallelo (lettura, coerenza 3D, pittura, horror, terreno, art director) con un workflow, poi le correzioni:
alberi rifatti (prima erano un pannello con un ventaglio di bastoni), lampione a gabbia, pozzo con l'argano, carriola vera, cartello con le scritte,
piega ridotta per le cose sottili, ombre a strato unico, legno in tre famiglie, muschio marcio nelle fughe, terra e sentiero rifatti (bordo
sbrecciato, lastre a lati dritti), interni horror, luci cotte nel terreno. Tema della prima area: `docs/tema-prima-area.md`.
