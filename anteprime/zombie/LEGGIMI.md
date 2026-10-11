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

Vetrina: `node anteprime/zombie/vetrina.js` (quattro viste per prop: eroe a sinistra, destra, sopra, sotto; effetti accesi; ritagli in
`anteprime/zombie/vetrina/`, non su git) e `python3 anteprime/zombie/tavole.py` → `vetrina/board1..4.jpg`. Sei critici in parallelo (lettura, coerenza 3D, pittura, horror, terreno, art director) con un workflow, poi le correzioni:
alberi rifatti (prima erano un pannello con un ventaglio di bastoni), lampione a gabbia, pozzo con l'argano, carriola vera, cartello con le scritte,
piega ridotta per le cose sottili, ombre a strato unico, legno in tre famiglie, muschio marcio nelle fughe, terra e sentiero rifatti (bordo
sbrecciato, lastre a lati dritti), interni horror, luci cotte nel terreno; poi, dalla sintesi: cerchi orizzontali tondi (sotto questa
telecamera un cerchio a terra resta un cerchio: bocca del pozzo, cerchi delle botti), cancellate e picchetti lungo y in 3D invece del
pannello di taglio, porta con l'anta vera lungo y e il pavimento che si vede dal vano, camino disegnato prima del tetto, tegole col bordo
tondo e qualche tegola mancante, zucche con la faccia nel disco, pali ai giunti del recinto. Tema della prima area: `docs/tema-prima-area.md`.

## Profondità, pavimento, sagoma (12 ottobre, foto di Denis: l'eroe spariva davanti all'obelisco e sulla pedana del portico)

- **Regola della profondità** (`ky` di ogni prop): la y del bordo davanti della sua parte alta, cioè del suo solido. Mai la y di cose basse che
  stanno davanti (il cumulo della tomba, i gradini, le pagliuzze): prima la lapide aveva `ky` al bordo del cumulo (+25 px) e l'eroe, fermo
  sul cumulo, veniva disegnato prima della lapide. Le cose lunghe e sottili lungo y (muri, recinti) usano il bordo nord: chi sta accanto viene
  disegnato dopo, tanto il muro si piega via da lui. Le cose sottili in diagonale (ante aperte) hanno `kyFn(x)`: la y dell'anta alla x dell'eroe.
- **Pavimento** (`floor:true`): cumuli, corone, gradini della cripta, pedana e gradini del portico, tappeto, lastre cadute. Si disegnano subito
  dopo il terreno, prima di tutti gli esseri.
- **Pedane** `stand(x,y,w,d,h)`: chi ci sta sopra (eroe e zombie) sale di `h` (pedana del portico 6, gradini 3 e 1,6, gradini della cripta 4 e 7).
- **Sagoma**: quando l'eroe è davvero dietro qualcosa (casa, cripta, pozzo, pilastri, muri), la sua sagoma chiara si vede attraverso, solo
  dove è coperto: le cose davanti che toccano il suo riquadro si ridisegnano in una tela piccola a metà risoluzione. Il riquadro di ogni prop
  si calcola una volta dai suoi pezzi (`obOf`, o `o.ob` per i disegni liberi come gli alberi) e la tolleranza per la piega vale solo dal lato
  opposto all'eroe (le cose alte si piegano sempre via da lui). Se niente cambia (eroe fermo) la sagoma del fotogramma prima si riusa. Non
  dentro casa, dove il muro davanti è già trasparente.
- **Chiome che sfumano** (`fades`): la chioma di un albero vivo diventa trasparente (35%) quando l'eroe le passa dietro, come il tetto della casa.
- I bagliori (flames) non coprono: quello verde della cripta sta davanti alla facciata, non sopra chi è sui gradini.
- Solidi aggiunti: mobili (letto, tavolo, sedie, scaffale, camino), colonne della cripta, ante del cancello, candela sulla tomba.
- Test: `node anteprime/zombie/visibilita.js [passo] [sagoma 0/1]` → `vetrina/vis_mappa.png` (verde visibile, giallo mezzo coperto, rosso
  coperto), `vis.json`, ritagli dei punti coperti `vis_<n>.png` con chi copre (`vis_punti.json`).

## Navigazione degli zombie (12 ottobre, Denis: «se si bloccano su una collisione falli fare il giro fino a farli venire da me»)

- Griglia di 8 px con gli ostacoli gonfiati del raggio dello zombie (11); campo di distanze verso l'eroe (Dijkstra a 8 vicini, senza tagliare gli
  angoli), ricalcolato quando l'eroe cambia casella. Lo zombie va dritto se vede l'eroe; altrimenti segue il campo e punta al punto più lontano
  del percorso che riesce a vedere (niente zig-zag). Se parte da un punto chiuso (la fossa da cui esce) va alla casella libera raggiungibile in
  linea retta (controllo sui solidi veri). Se resta fermo 0,7 s prova di lato per mezzo secondo. Chi è già dentro un solido può uscirne
  (`move`), ma non entrare in un altro.
- **Regola per chi disegna le aree**: niente corridoi tra 18 e 34 px (ci passa l'eroe ma non uno zombie: diventano nascondigli). O larghi almeno
  34, o chiusi. Nell'area di prova la cripta è stata messa contro il bordo e staccata dal muro, e il recinto a est spostato più in là.
- Test: `node anteprime/zombie/navtest.js [passo]` → per 7 posizioni dell'eroe, uno zombie (e un segugio) da ogni punto libero e da ogni buca,
  45 s simulati senza disegnare; più una folla di 8. `vetrina/nav_mappa.png` (verde arriva con i secondi, rosso no con la linea fino a dove si è
  fermato) e `nav.json`. Risultato: arrivano tutti (1.598 su 1.598), tempo medio 8–14 s.
- `node anteprime/zombie/ravvicinati.js` (scritta dal verificatore): zombie e segugi vicinissimi all'eroe ma con un ostacolo in mezzo, da 445
  posizioni dell'eroe (5.401 prove). Aveva trovato segugi fermi contro il recinto: lo zombie schiacciato contro un solido sta in una casella
  chiusa della griglia, e il ripiego sceglieva la casella più vicina all'eroe anche se dall'altra parte. Ora il ripiego cerca a cerchi crescenti
  solo le caselle raggiungibili in linea retta. Risultato: 0 fermi, 0 attacchi attraverso i muri (l'attacco e la corsa finale vogliono la linea
  libera, `physClear`).
- `node anteprime/zombie/inseguimento.js [minuti]`: l'eroe scappa davvero (giro intorno al pozzo, dentro e fuori casa, cimitero, dietro la cripta)
  mentre gli zombie escono dalle buche; chi lo raggiunge muore dopo 2,5 s così ne escono altri. Misura zombie fermi più di 3 s, dentro un
  solido, fuori dal mondo. Quattro giri da 6 minuti, circa 90 zombie ognuno: nessuno fermo, nessuno dentro un solido.
- Tempi (questa macchina, senza scheda grafica, 5 zombie che inseguono): fotogramma 8,5 ms contro 8,0 prima delle modifiche; dietro la cripta
  6,4 contro 6,0; mentre l'eroe si muove dietro qualcosa la sagoma aggiunge circa 2 ms. Navigazione e percorsi: meno di 0,3 ms.

## Piega più dolce e colpi che non passano i muri (12 ottobre, Denis: «la casa si allunga o si accorcia a dipendenza di dove ti muovi»)

- La piega in verticale (le cose alte più lunghe quando l'eroe sta sotto, più corte quando sta sopra) ora è al massimo ±2% dell'altezza
  (`CAM.ly=.0002`, tetto `LKV=.02`); all'inizio a 150 px dall'eroe arrivava a circa ±21%, poi ±7%, poi Denis: «diminuisci di molto». Quella
  di lato, che fa vedere il fianco delle cose, è più leggera (`CAM.lx=.003`, tetto `LK=.22`, circa 12°).
- I colpi non passano attraverso muri, recinti, lapidi, casse e case: l'eroe mira solo allo zombie più vicino che vede davvero (linea libera sui
  solidi veri, `physClear`, ignorando la fossa in cui sta lo zombie), ricontrollato ogni 0,1 s.
