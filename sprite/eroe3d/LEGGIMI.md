# L'Arciere in 3D (prova, non ancora nel gioco)

`disegno_eroe.js` disegna l'eroe della modalità Classica (l'Arciere) con il metodo dei mostri nuovi: scheletro 3D proiettato con `V(face)` e la cassetta degli attrezzi `CR._rig` di `sprite/mostri/disegno_mostri.js`. Va eseguito dopo `disegno_mostri.js`, dentro la funzione principale di `index.html`; espone `EROE.arciere(x, y, face, anim, p, sc, o)`:

- `x, y`: il punto dei piedi (attenzione: `drawRig` del gioco ha il suo punto 8 px più in alto, al centro del corpo);
- `face`: la direzione in radianti, come `P.face` (π/2 verso chi guarda, 0 verso destra);
- `anim`: `idle` (respira, si guarda intorno piano, sbatte gli occhi), `walk` (piedi che fanno il passo, corpo che rimbalza, mano libera che dondola), `shoot` (alza l'arco in piano, tende la corda fino al petto, tira, la mano torna alla corda e incocca una freccia nuova), `aim` (la corda tesa di `o.pull` da 0 a 1, come `P.aiming` del gioco), `dash` (si accuccia, scatta in avanti allungato, piccolo salto, atterra), `hit` (spinto indietro, occhi strizzati, bocca aperta, stelline);
- `p`: da 0 a 1 lungo la mossa (ogni mossa si richiude su se stessa); `sc`: grandezza (1 = come oggi);
- `o.style`: colori ed equipaggiamento come `heroStyle()` del gioco (le 4 armature, i 5 archi con balestra compresa, anelli con l'aura del gioco, amuleti, manti del pass); `o.moss`: il bastoncino di muschio in bocca (solo schermata iniziale e intro); `o.noFx`: niente freccia che vola, polvere e scie (per i fogli).

## Com'è fatto

- È lo stesso eroe di oggi, con le stesse misure: corpo a goccia largo 22 px visto davanti e 16 di lato (sezione ovale), cappuccio tondo di raggio 10 senza punta, faccia larga 7 px nell'apertura con il bordo nero spesso, due occhi neri (con un puntino di luce), colletto a V, cucitura tratteggiata e due bottoni, cintura con la fibbia d'oro, piedi tondi senza gambe, mani senza braccia.
- L'arco a riposo sta davanti alla pancia, tenuto da una mano, quasi in piano e inclinato in giù davanti: così da davanti si vede come oggi (arco curvo sotto la cintura, corda dritta, mano in basso al centro) e da ogni lato resta un arco, mai una riga. Quando tira l'arco sta in piano all'altezza del petto (un arco in piano visto dall'alto si legge uguale da tutti i lati).
- La faretra è a tracolla dalla spalla sinistra al fianco: la cinghia attraversa il petto, le penne rosse e bianche escono sopra la spalla destra. Tubo e frecce hanno due posti diversi nell'ordine di disegno, così da dietro le frecce stanno davanti alla testa e da davanti restano nascoste.
- Il cappuccio è una palla con l'apertura tagliata (`capPath`): da ogni lato copre la testa dove deve. Il naso è una pallina disegnata prima del cappuccio, quindi si vede solo di profilo, come oggi.
- Come gli sprite del gioco, la testa si gira un poco verso chi guarda (fino a 17°, mai da dietro): di lato si vedono la faccia e l'occhio. `o.noCheat` lo toglie.
- L'ordine di disegno viene dalla posa di riposo (`parts` + `run`); l'arco ha un posto fisso davanti alla pancia; la mano libera sta sul fianco e, solo nelle mosse in cui lavora la corda, passa subito dopo l'arco.
- Dipinto come i nemici Classici rifatti: tre toni su ogni pezzo, luce calda dall'alto a sinistra (`rim`, `glowTop`, `wa`), ombra della testa sulle spalle, contorno spesso.
- Funziona con l'inclinazione della telecamera della mappa zombie (`CR.cam`, da 35° a 62°).

## Tempo di disegno

Misurato in Chromium sul server: circa 0,45-0,65 ms a disegno (0,4 con `LOWFX`), contro 0,05 ms dell'eroe di oggi, 0,3 del goblin rifatto e 0,7 dello Zombie della lanterna. È uno solo sullo schermo, quindi si può disegnare dal vivo con qualsiasi equipaggiamento.

## Fogli e pagina di prova

- Fogli PNG con l'equipaggiamento di partenza (giubba e arco di frassino): `node tests/eroe3d.js` (dopo `python3 tests/mk.py`) → `arciere_<mossa>.png` e `fogli.json`, 8 righe nell'ordine dei nemici, casella unica con i piedi sempre nello stesso punto; `aim` ha un fotogramma per ogni tiro della corda.
- Pagina dal vivo: `python3 anteprime/mk_eroe3d.py` → `anteprime/eroe3d.html` (Gira, 4 direzioni con sotto l'eroe di oggi, Prima e dopo; mosse, equipaggiamento, bastoncino, effetti bassi, telecamera). Pubblicata su https://claude.ai/artifact/B3on6ftX12vGAKXNNVocsw.

Da fare dopo l'ok di Denis: sostituire `drawRig` per l'Arciere in `drawHero`, nel menu (`drawHomeHero`, anteprima dell'eroe, Armeria) e nella intro, con `walk` da `P.walk`, `aim` da `P.aiming`/`pull`, e controllare il punto dei piedi (8 px).
