# Armi della modalità zombie (bozza, non ancora nel gioco)

`disegno_armi.js` disegna le otto armi della modalità zombie, le loro munizioni e la Bara delle Sorprese, e ne fa i suoni. Usa le funzioni del gioco (`ctx`, `ink`, `glow`, `INK`, `LOWFX` per il disegno; `fNoise`, `fThump`, `fModal`, `M`, `whoosh`, `vBell`, `vChoir`, `coinClink` per i suoni). Va eseguito dentro la funzione principale di `index.html`, come `disegno_mostri.js`, oppure dopo `poligono/shim.js`. Espone tutto in `window.ARMI`.

## Le armi

| Arma | Rarità | Danno | Colpi al secondo | Caricatore | Ricarica | Com'è |
|---|---|---|---|---|---|---|
| Pistola | Comune | 20 | 4 | 12 + 72 | 1,1 s | acciaio e calcio di legno zigrinato |
| Revolver | Non comune | 55 (passa 2 zombie) | 1,6 | 6 + 36 | 2,2 s | argento lucido, guance rosse, tamburo che gira |
| Mitraglietta | Comune | 11 | 13 | 32 + 192 | 1,4 s | nera e verde acqua, calcio di filo |
| Mitra | Raro | 24 | 9 | 30 + 180 | 1,8 s | legno, caricatore a banana di rame, mirino rosso |
| Mitragliatrice | Epico | 26 (passa 2 zombie) | 16 | 100 + 300 | 3,4 s | quattro canne che girano, cassetta e nastro di colpi |
| Pompa da caccia | Non comune | 16 × 8 pallini | 1,2 | 6 + 36 | 0,42 s a cartuccia | legno e acciaio, cartucce rosse |
| Pompa tattica | Raro | 14 × 7 pallini | 1,8 | 8 + 48 | 0,32 s a cartuccia | nera e arancione, cartucce verdi sul fianco, mirino rosso |
| Lanciarazzi | Leggendario | 240 (esplosione larga 46) | 0,55 | 1 + 8 | 2,2 s | tubo verde oliva, banda gialla e nera, razzo rosso |

I numeri sono in `ARMI.DATI` (con descrizione, velocità dei colpi, gittata, dispersione, rinculo, quanto rallentano), scelti da Claude: da regolare giocando.

## Come sono disegnate

- Ogni arma è un profilo di fianco che punta a destra, con la mano sull'impugnatura nel punto (0, 0), come la balestra in mano all'eroe. L'eroe la gira nella direzione in cui mira e la specchia quando mira a sinistra, così la parte di sopra resta sempre sopra.
- Dipinte come lo Zombie della lanterna: ogni pezzo ha il suo colore, un lato più scuro, una luce calda in alto, il contorno scuro spesso intorno a tutta l'arma e righe sottili dove i pezzi si toccano (prima si disegna la sagoma scura di tutti i pezzi, poi ogni pezzo).
- In mano all'eroe (`ARMI.inMano(id, B, posa, angolo)` dentro `held()`): il corpo si gira nelle 8 direzioni, l'arma invece gira tutto intorno e punta proprio dove mira l'eroe (l'angolo vero, verso lo zombie). La mano gira intorno al corpo come quella dell'arco; quando l'eroe guarda indietro si allarga un po', così l'arma si vede accanto alla testa. Quando punta a sinistra l'arma si capovolge, così la parte di sopra resta sopra.
- Le armi a due mani hanno la seconda mano sotto la canna. Durante la ricarica le mani lavorano:
  - **Caricatori**: la mano toglie il caricatore, che cade a terra; ne prende uno nuovo, lo spinge dentro e tira il carrello o l'otturatore.
  - **Revolver**: si alza e apre il tamburo, che esce sotto l'arma con le sei camere. I bossoli cadono, la mano mette i colpi uno alla volta e poi richiude.
  - **Fucili a pompa**: la mano porta una cartuccia alla volta sotto l'arma e la spinge dentro.
  - **Lanciarazzi**: la mano spinge il razzo nuovo dentro il tubo.
  - **Mitragliatrice**: la mano cambia la cassetta e fa entrare il nastro.
- Lo sparo ha la sua vampa (diversa per ogni arma, il lanciarazzi anche dietro), il rinculo, il fumo. Da ogni arma escono i suoi bossoli (ottone, cartucce rosse o verdi), che saltano e rimbalzano a terra, e i suoi caricatori vuoti.
- I colpi in volo hanno colori e lunghezze diverse. Il razzo vola con la fiamma e la scia di fumo e fa un'esplosione a cartone animato: lampo, palla di fuoco, fumo nero, scintille e sassi, poi una bruciatura a terra.
- Le casse di munizioni che lasciano gli zombie sono quattro: piccole (gialla), grosse (verde militare), cartucce (rossa con le cartucce che spuntano) e razzi (cassa di legno con un razzo). Ondeggiano e luccicano.

## Come si usano

- `g = ARMI.nuova(id)`: un'arma in mano. Va aggiornata a ogni fotogramma con `ev = g.update(dt, grilletto)`. Poi `g.ricarica()`, `g.annulla()` (ferma la ricarica quando cambi arma) e `g.pose()` (la posa da disegnare). `update` dice cosa è successo:
  - `sparo`, con gli angoli dei pallini;
  - `bossolo`, con quanti;
  - `caricatore`, quando cade quello vuoto;
  - `suono`;
  - `pronta`, quando la ricarica è finita.
- Quando il caricatore è vuoto ricarica da sola. Il clic a vuoto c'è solo se non restano munizioni.
- `ARMI.inMano(id, B, posa, angolo)` disegna l'arma in mano all'eroe, puntata all'angolo (senza angolo punta dove guarda il corpo). `ARMI.inManoPunti(id, B, posa, angolo)` dice dove sono la bocca, l'espulsione dei bossoli, il caricatore e il retro del lanciarazzi, per farne partire colpi e bossoli.
- Nella pagina di prova, e così andrà fatto nel gioco:
  - **Colpi sul pavimento:** i colpi volano sul pavimento. Ognuno sta nel suo punto per terra ed è disegnato all'altezza dell'arma, e colpisce lo zombie dove ha i piedi.
  - **A bruciapelo:** uno zombie tra l'eroe e la bocca dell'arma viene colpito subito.
  - **Mira:** si mira dai piedi dell'eroe. Il corpo cambia direzione solo quando la mira è ben oltre la metà tra due direzioni, così non sfarfalla. `ARMI.arma(id, x, y, angolo, posa)` disegna l'arma da sola (carte, icone).
- Suoni: `ARMI.suono(id, cosa, x)`, dove cosa è `sparo`, `ricarica`, `vuoto`, `pompa`, `cartuccia`, `giri`, `bossolo`, `esplosione` o `presa`. La ricarica è a tempo con l'animazione. `ARMI.motore(g, x)`, chiamato a ogni fotogramma, fa il ronzio delle canne della mitragliatrice.
- Effetti: `ARMI.espelli`, `ARMI.espelliCar` e `ARMI.fxAdd` aggiungono bossoli, caricatori, fumo, scintille, esplosioni e bruciature. `ARMI.fxUpdate(dt)` li muove. `ARMI.fxDraw('suolo')` va chiamato prima dei personaggi e `ARMI.fxDraw('aria')` dopo. Con `LOWFX` gli effetti sono di meno.
- Colpi in volo: `ARMI.colpo(tipo, x, y, dx, dy)` e `ARMI.razzo(x, y, angolo, t)`. Munizioni: `ARMI.munizione(tipo, x, y, grandezza, angolo)` e `ARMI.cassaMun(tipo, x, y, t)`.

## La Bara delle Sorprese

La cassa misteriosa della modalità zombie, ispirata a quella di Black Ops ma tutta nostra:

1. **Si paga** (750 monete): le monete volano nella bocca del teschio che fa da lucchetto, e lui le mastica.
2. **Si apre**: il teschio ride, il lucchetto si apre, la catena cade a terra e il coperchio si spalanca su una luce verde con un coro di fantasmi. Dentro c'è il velluto rosso con i bottoni d'oro.
3. **Gira**: una mano scheletrica esce e fa girare le armi. A ogni cambio c'è uno sbuffo di fumo verde e una nota di xilofono d'ossa che sale, prima veloce e poi sempre più piano.
4. **Offre**: la mano solleva l'arma, che brilla, con il suo nome sopra. Toccando la bara la prendi: l'arma ti vola in mano e la mano ti saluta col pollice in su. Se aspetti troppo, la mano torna giù con l'arma e la bara si richiude da sola: il coperchio scende, la catena torna e il lucchetto scatta.
5. **Scappa** (12% delle volte, mai nelle prime due aperture): la mano esce vuota e saluta. Il teschio ride e ti risputa le monete, il coperchio sbatte, la bara trema e sprofonda nella terra lasciando un mucchio di terra. Poi rispunta da un'altra parte.

Quando è chiusa, ogni tanto qualcosa bussa da dentro: il coperchio salta e il teschio sbatte gli occhi. Le due candele hanno la fiamma verde.

- `b = ARMI.nuovaBara(x, y)` crea la bara.
- `b.paga(x, y, armaAttuale)` la fa partire, e la bara non ti dà l'arma che hai già. `b.prendi()` prende l'arma offerta. `b.forza(true)` fa scappare la prossima. `b.next = [x, y]` è il posto dove ricomparirà.
- `b.update(dt)` restituisce `suono` (da passare a `ARMI.suonoBara`), `offerta`, `presa`, `rimborso`, `via` e `qui`. Poi c'è `b.draw(vista)`.
- **La vista** (12 ottobre, Denis: «che non ruoti ma che rimanga ferma come il resto degli oggetti 3d»). Senza vista la bara si disegna con la
  sua vista fissa, girata un po' per mostrare la testa: è quella del poligono e dei fogli, identica al pixel a prima (`bara.png`,
  `bara_fuga.png`). Una mappa le dà la sua telecamera con `ARMI.vistaBara(pj, ombra)`: `pj(u, v, z)` porta un punto della bara (u lungo la
  bara, testa a +u; v di traverso, catena e teschio sul lato +v; z in alto) sullo schermo, e il verso della telecamera si ricava da `pj`. Così la
  bara resta ferma nel mondo e la telecamera le gira intorno: si vedono le facce giuste, le maniglie su tutti e due i fianchi, e candele,
  coperchio aperto (la cerniera è sul lato −v), catena e teschio vanno davanti o dietro secondo da dove la si guarda (la mano alzata con l'arma, più alta della cima del coperchio aperto, va davanti al coperchio anche quando questo sta dalla parte della telecamera); quando sprofonda il taglio
  segue il bordo della buca verso la telecamera. La mano con l'arma resta dritta sullo schermo. `ARMI.formaBara()` dà le misure (scala, contorno,
  altezze, candele, coperchio aperto) e `ARMI.facceBara(posa)` le facce vere per i test dell'ordine di disegno.
- Prezzo, tempi, probabilità di ogni arma e della fuga sono in `ARMI.BARA`.

## Poligono di prova

`poligono/armi.html` è la pagina di prova: l'eroe con le armi, gli zombie che escono da terra, le casse di munizioni e la bara. Si apre anche direttamente dal file.

- **Computer**:
  - W A S D o le frecce per muoversi;
  - il mouse per mirare, tenuto premuto per sparare;
  - R per ricaricare, E per la bara;
  - da 1 a 8 per cambiare arma.
- **Telefono**: il cerchio per muoversi, poi i tasti Spara, Ricarica e Bara.

`node tests/poligono.js` rifà quello che serve alla pagina: `shim.js` (copiato da `index.html`), l'eroe a strati in 8 direzioni (`eroe_a.webp` e `eroe_b.webp`) e i fogli degli zombie in `mostri/`.

## Controllo

`node tests/armi.js` fa queste cose:

1. Fa sparare e ricaricare ogni arma e scrive cosa è successo.
2. Fa aprire la bara: una volta va fino in fondo, una volta scappa.
3. Rifà le anteprime:
   - `armi.png`: le 8 armi con colpi e casse;
   - `eroe_armi.png`: l'eroe con ogni arma in 8 direzioni;
   - `ricariche.png`: sparo e ricarica fotogramma per fotogramma;
   - `bara.png` e `bara_fuga.png`.

Prima va lanciato `python3 tests/mk.py`.

Da fare dopo l'ok di Denis:
- mettere le armi nel gioco, con la modalità zombie;
- dove sta la bara nella mappa;
- quanto costa e quanti punti danno gli zombie;
- se si tengono due armi insieme.

## La ricarica e i suoni nuovi (anteprima 48, 14 ottobre, Denis: «miglioriamo le animazioni delle pistole, cioè la ricarica», «poi l'audio»)
- **I tempi della ricarica** (`ARMI.RLT`, frazioni di `D.rel`), gli stessi per l'eroe 3D, per le armi 2D di qui e per i suoni:
  - armi a caricatore (`mag`): `out` .1 il caricatore si sgancia ed esce, `drop` .18 cade (evento `caricatore`), `pouch` .3 la mano prende
    quello nuovo alla cintura, `well` .42 è sotto il pozzetto, `push` .5 entra, `seat` .66 scatta, `rack` .72 la mano tira il carrello,
    `fwd` .8 il carrello torna avanti, `done` .88 la mano torna;
  - revolver (`rev`): `open` .04–.16 il tamburo si apre, `eject` .16–.2 i bossoli escono, `load` .3–.8 sei colpi uno a uno, `shut` .84–.92
    si chiude, poi gira.
- A ogni momento `nuova(id).update` manda `{k:'suono', w:'rl:out'|'rl:pouch'|'rl:seat'|'rl:rack'|'rl:fwd'}`, per il revolver `rv:open`,
  `rv:eject`, `rv:round` (sei volte), `rv:shut`, `rv:spin`, per il razzo `rz:pouch`, `rz:in`, `rz:lock`; `coda` alla fine di una raffica (tre
  colpi o più); `estrai` e `armata` quando l'arma presa sale (`g.estrai()`, `g.eq` da 0 a 1 in `ARMI.EQT` secondi, `ARMI.EQR` lo scatto).
  `pose()` dà anche `n` (colpi nel caricatore), `empty` (ricarica partita a vuoto: la pistola tiene il carrello indietro), `eq`.
- **I suoni** (`suoni_armi.js`, dopo questo file): ogni arma ha un banco preparato una volta sola fuori tempo reale (`ARMI.prepara(id)`, da
  solo al primo suono; al massimo sei armi in memoria): tre spari, la coda, i rumori della ricarica, `estrai`, `armata`, `vuoto`,
  l'esplosione del razzo. `ARMI.suono(id, what, x, dt)` suona dal banco (un nastro un po' più veloce o più lento ogni volta) o, finché non è
  pronto, gli stessi strati dal vivo. Lo sparo: schiocco, scoppio saturato, pugno (un tono che scende reso ruvido: le casse del telefono
  sotto i 150 Hz non suonano), rombo, coda ed eco del camposanto, meccanica (numeri in `SHOT`, da regolare a orecchio). Il lanciafiamme:
  `ARMI.fiamma(g, x)` a ogni fotogramma (ruggito continuo finché spara, si spegne da solo); `ARMI.motore` si spegne da solo anche in
  pausa; `ARMI.ferma(g)` quando si cambia arma. `ARMI.suonoVecchio` è il suono di prima (per le misure).
- `caricatore(id, ...)` disegna anche il tamburo, la bombola, la stecca di chiodi e il cristallo (la mappa li lascia a terra).
- Misure: `node tests/suoni_armi.js` (tempo e memoria del banco; lo sparo nuovo e quello vecchio, ognuno da solo in un
  `OfflineAudioContext` con la strada del gioco: volume pesato come l'orecchio e come la cassa di un telefono, energia sotto i 150 Hz,
  picco; la ricarica della pistola e l'esplosione del razzo). Il 14 ottobre: in cuffia come prima, sul telefono da 5,8 a 10,4 dB più forti.
