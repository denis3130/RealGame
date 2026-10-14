# Anteprima 48 (dal 14 ottobre)

Richiesta di Denis del 14 ottobre: «continua pure con le cose che mancano e lasciate a metà». Si lavora sul ramo `anteprima-48`
(partito da `anteprima`, cioè dall'anteprima 47 che Denis deve ancora approvare): il gioco sul telefono e l'app non cambiano. Elenco di
cosa mancava (dal piano maestro di 60 punti, testo completo nella trascrizione dell'11 ottobre): 4 boss nuovi (punto 5) con
animazioni, morti, barre e musiche; musiche dei boss (51); animazioni complete dei nemici (4: preparazione, morte, abilità); mappa
zombie enormemente più grande con edifici esplorabili, piano di sopra, confini, collegamenti (10, 12–15), barriere a pagamento e spawn
nuovo (16–17), finestre e recinzioni (18–19), casse 3–5 usi (20), armi a muro con munizioni (21), macchina di potenziamento (22), perk
(23), ottimizzazione della mappa (54), salvataggi in tre blocchi (55), controllo finale (57); più l'Arco del tuono rimasto sul ramo
`nuovi-oggetti`.

## Stato

| Punto | Cosa | Stato |
|---|---|---|
| 5–7 | 4 boss nuovi del terzo giro «su carta» | fatto, da far approvare a Denis (`docs/boss-nuovi.md`) |
| 51 | Musiche dei boss: entrata, tema, reazione alla morte, vittoria | fatto |
| 4 | Nemici: morte propria per famiglia (preparazione e abilità c'erano già) | fatto |
| — | Arco del tuono, faretre, scia di ghiaccio (`nuovi-oggetti`) | fatto |
| 10–17, 54 | Mappa zombie grande: Borgo dei Lumi e Segheria, edifici, piano di sopra, barriere, comparse, ottimizzazione | fatto |
| 18–23 | Finestre, recinzioni, Bara a 3–5 aperture, armi a muro con i colpi, Forgia delle Anime, elisir | fatto |
| 55, 57 | Salvataggi in tre blocchi, collaudo | fatto |

## 5–7: i 4 boss nuovi su carta

`sprite/nemici3d/boss3.js` (gruppo `boss3`): il Burattinaio d'Ombra (arena 9), la Fenice della Forgia (10), la Piovra della Palude (11), il
Cervo d'Aurora (12), ognuno con fermo, movimento, preparazione, tre o quattro attacchi, colpito, entrata e sconfitta, e la seconda fase
(`o.p2`). Pagina `python3 anteprime/mk_nemici3d.py --nuovi` → `anteprime/boss3.html`, pubblicata su
https://claude.ai/artifact/KrYogWLkw61CANfz64uzmA; fogli `node tests/boss3.js` → `tests/nb_<boss>_dir.png`, `nb_<boss>_mosse.png`.
Scheda di ogni boss in `docs/boss-nuovi.md`. Non sono nel gioco: dopo l'ok di Denis vanno fatti comportamento, entrata, morte unica
nel gioco (`BDEATH`/`BDIE`), barra (`BBFX`), anteprima dell'arena, musica.

## 51: musiche dei boss

`src/js/76-musiche-boss.js` (`BM`, `BMS`): entrando nella stanza del boss la musica dell'arena si abbassa e resta sotto («attesa» se non
ce n'era); a metà dell'entrata del boss un colpo d'orchestra suo (respiro che sale, tamburo, ottoni e coro sul primo accordo del suo
tema, il colore del mondo: campane, incudine, fuoco, acqua, ghiaccio, cristallo, monete) e il suo tema, un po' più basso; al colpo
finale la musica passa in un filtro che la chiude «sott'acqua» e cala; nel clou della morte unica l'accordo di vittoria suo, poi la
musica calma «vittoria» (dopo il Mimic torna quella di prima). Tema nuovo del Mimic (`TRACKS.mimic`). Volumi misurati: i colpi hanno il
picco a 0,34 contro 0,15 del tema. Prova `node tests/bossmusica.js`.

## 4: le morti dei nemici

`src/js/77-morti-nemici.js` (`EDF`, `ESN`): ogni nemico in 3D colpito a morte viene fotografato una volta nella posa di «colpito» (tele
riusate) e il suo corpo muore secondo la famiglia: gelatine che si afflosciano in una pozza che bolle, nemici in piedi che cadono
all'indietro lontano dall'eroe con la nuvoletta e le stelline, scheletri che si sfasciano in pezzi, volanti che girano cadendo e
svaniscono in scintille, piante e funghi che appassiscono lasciando petali o spore, pietra e ghiaccio che si crepano e cadono in pezzi,
bestie che fanno un saltello e si rovesciano a pancia in su. Niente sangue; restano il colpo ad anello, monete, esperienza e cuori; via
le schegge e i pezzetti dello scoppio di prima. Con `LOWFX` lo scoppio di prima. I corpi stanno in `G.ecorpses` (non ritardano la porta)
e si disegnano nell'ordine della stanza. La preparazione (la prima metà dell'attacco mentre mira, la stellina) e le abilità (le mosse
legate agli stati: evoca, scatto, tuffo…) c'erano già dal 13 ottobre. Prova `node tests/mortinemici.js` → `tests/mn_morti.png`.

## Arco del tuono e scia del gelo (dal ramo `nuovi-oggetti`)

- **Arco del tuono** al posto dell'Arco delle spine (richiesta di Denis sul ramo `nuovi-oggetti`, mai portata): blu notte con le
  rifiniture d'oro, «Le frecce richiamano fulmini sui nemici» (`P.light`, il fulmine che c'era già), frecce con la punta a fulmine
  e la luce azzurra (`drawArrow`), il suo suono, l'arco 3D `thunder` in `armi3d.js` (cappucci d'oro con le scintille, zig-zag d'oro sui
  flettenti, luce azzurra), la carta dipinta in `73`. I salvataggi vecchi passano carte e livello (`migrateItems` in `07`, anche col
  codice di salvataggio). Il Set della Foresta ora è Arco ricurvo + Corazza di muschio (come sul ramo vecchio).
- **Faretra**: le penne delle frecce sulla schiena prendono i colori dell'arco in mano (ricurvo verde, tuono azzurro e oro, fenice
  arancio); con l'Arco di frassino resta tutto com'era (l'Arciere identico).
- **Scia dell'Anello del gelo eterno** (`src/js/78-gelo.js`): camminando restano piccole lastre di ghiaccio che si crepano e si
  sciolgono. La balestra uguale alla carta c'è già (le carte sono disegnate dai modelli 3D); la Giubba resta del suo colore.
- Prova `node tests/tuono.js`.

## 10–14, 16: la mappa zombie grande

La mappa passa da 16×29 a **30×29 caselle**: alle due zone di prima (Camposanto e Casa, Fattoria dei Corvi) si aggiungono il **Borgo dei
Lumi** (sud-est) e la **Segheria del Fiume** (nord-est), costruiti in `anteprime/zombie/prop_borgo.js` e `area_mappa.js` (`buildEast`).
Pianta dall'alto: `python3 anteprime/zombie/pianta_grande.py` → `anteprime/zombie/pianta_grande.png`; foto dei posti nuovi:
`node anteprime/zombie/foto_grande.js` → `anteprime/zombie/vetrina/grande/`.

- **Borgo dei Lumi**: la strada di ciottoli coi solchi e i lampioni; la **Locanda del Corvo** a due piani (tre porte: strada, retro, ovest;
  bancone, scaffali, camino acceso, tavoli con le candele, la scala, la seconda Credenza degli Elisir); il mercato coi banchi a strisce,
  la bacheca dei dispersi, il carretto rovesciato e la **carrozza della scuola bruciata** (da sotto escono gli zombie); la **Fucina**
  aperta sulla strada con la Forgia delle Anime e la Mitraglietta col gesso; l'orto del parroco con le tombe; la **Cappella** di pietra
  (panche, altare con le candele, vetrate, il portale a ovest) col **campanile**; le rovine e gli alberi oltre il fiume.
- **Segheria del Fiume**: il fiume con le increspature e la riva, il mulino con la ruota, le cataste, la gru, il carro dei tronchi, la
  **Segheria** (portone, porte, il banco della sega) col Mitra col gesso, la tettoia della **caldaia** con la valvola del vapore.
- **Edifici** (`P.edificio`): muri pieni con porte alte 72 px (l'eroe è alto circa 58), finestre che sono barriere, tetto a due falde;
  dentro i mobili compaiono quando si entra; tetto e muri verso la telecamera sfumano anche quando l'eroe passa **dietro** un edificio
  alto (come le chiome degli alberi), anche la tettoia della Fucina. Si entra da una parte e si esce dall'altra.
- **Barriere a pagamento tra le zone** (`P.barriera`): i carri di traverso tra la partenza e il Borgo (1.000), la catasta di tronchi con
  la catena tra la Fattoria e la Segheria (1.000), il cancello della Segheria tra il Borgo e la Segheria (1.250). Si comprano da tutte e
  due le parti, aprono le due zone, i pezzi si spostano di lato con le schegge e il suono, la griglia degli zombie si rifà; niente doppio
  pagamento. Le zone si ricollegano: si può fare il giro Partenza → Borgo → Segheria → Fattoria → Partenza.
- **Confini**: a est la staccionata con due varchi rotti di legno (da lì escono gli zombie dal buio), a sud il muro con la cancellata di
  ferro; oltre i bordi il mondo continua (la nebbia del vuoto, le rovine, il fiume).

## 15: il piano di sopra della Locanda

Al piede della scala il bottone **«Sali al piano di sopra»** (tenere premuto): l'eroe sale i gradini in 1,1 s mentre compare il solaio, e
arriva sul pianerottolo; **«Scendi»** lo riporta giù. Di sopra: tre letti, l'armadio contro il muro nord, il baule, lo scrittoio sotto la
finestra con la candela, la ringhiera intorno al buco della scala e la **Pompa tattica col gesso (2.000)**, che si compra solo di sopra.
Nel motore (`motore.js`): i solidi hanno il loro piano (`lv`), l'eroe, gli zombie e i compagni pure; con l'eroe di sopra gli zombie vanno
al piede della scala, salgono, e di sopra lo inseguono con una griglia piccola dell'edificio; se l'eroe scende, quelli di sopra scendono.
Colpi, morsi, fiammate e spinte solo tra chi sta sullo stesso piano; i boss vanno alla scala e colpiscono solo sullo stesso piano. Dentro al
pianterreno la parte alta dei muri sparisce come il tetto; di sopra spariscono i mobili di sotto. Chi sta di sopra si piega con
l'edificio (la prospettiva dei tetti). La telecamera segue l'altezza del piano. Prova `node anteprime/zombie/piani_prova.js`.

## 17: la comparsa degli zombie

Ogni zombie esce da una buca **raggiungibile a piedi** (il campo di navigazione intorno alla buca: mai dietro ostacoli invalicabili, in
stanze chiuse o in zone non aperte), a una distanza a piedi tra 130 e 700 px dall'eroe (con l'eroe di sopra: dal piede della scala), a caso
tra le sei più vicine e mai la stessa due volte di fila. Le comparse: dalle fosse e dalla terra (il mucchio), dal granturco, dalla porta
della latrina, dal buio oltre il bordo, **dal fiume** (cerchi nell'acqua e gocce), **dalla botola della cantina** nel vicolo della Locanda
(le ante si spalancano), **da sotto i carri e la carrozza bruciata** (polvere e cenere). Prova `node anteprime/zombie/comparse_prova.js`.

## 18–19: finestre e recinzioni

`anteprime/zombie/barriere.js` (`BZ`): ogni finestra delle case è una barriera. Uno zombie fuori, con l'eroe dentro, rompe il vetro (una
volta sola: resta rotta) ed entra scavalcando in 0,75 s; l'eroe vicino alla finestra rotta tiene premuto **«Ripara la finestra»** e rimette
le assi una alla volta col martello (mossa nuova «ripara» dell'Arciere 3D, foglio nelle quattro direzioni `node tests/ripara4.js` →
`tests/ripara_4dir.png`), 10 monete ad asse (al massimo 120 a round); lo zombie strappa un'asse a colpo. Le stesse barriere nei varchi
della staccionata (assi di legno, dal granturco e dal buio a est) e nella cancellata di ferro (sbarre, due colpi ciascuna). I boss le
sfondano; i colpi dell'eroe passano. Nel campo degli zombie passare una barriera chiusa costa di più (prendono la porta se è poco più
lunga). Prova `node anteprime/zombie/barriere_prova.js`.

## 20–23: Bara, armi a muro, Forgia, elisir

- **Bara delle Sorprese** (`sprite/armi/disegno_armi.js`): si apre da 3 a 5 volte (mai scappa nelle prime due), poi saluta, sprofonda e
  ricompare in un altro posto di una zona aperta (scritta con il nome della zona e il fascio di luce); ora anche nella Cappella e nella
  Segheria. Prova `node anteprime/zombie/bara_usi.js`.
- **Armi a muro**: comprare l'arma che si ha già dà solo i colpi (a metà prezzo) e tiene l'arma forgiata. Nuove: Mitraglietta 1.000
  (Fucina), Mitra 1.250 (Segheria), Pompa tattica 2.000 (di sopra nella Locanda).
- **Forgia delle Anime** (`anteprime/zombie/macchine.js`, `FG`): va col vapore (la valvola della caldaia della Segheria, tenere premuto);
  si apre (1.000) e forgia l'arma in mano in due livelli (2.500 e 5.000): danno ×2 e ×3,2, colpi azzurri e viola, nome nuovo, al secondo
  livello i colpi saltano su uno zombie vicino. Mentre forgia l'eroe resta con la pistola (o senz'arma se forgia la pistola).
- **Credenza degli Elisir** (due: nel camposanto e nella Locanda): 8 elisir (Doppi Danni, Cuore di Pietra, Mani Svelte, Colpo Vampirico,
  Istinto Mortale, Impulso Difensivo, Doppio Impatto, Passo Svelto), al massimo 4, prezzo 1.500 + 500 per ognuno già bevuto; le bottiglie in
  alto sullo schermo. Prova `node anteprime/zombie/macchine_prova.js`.

## 54: la mappa più leggera

Misure con `node anteprime/zombie/tempi_grande.js` (computer di prova, senza scheda grafica). La causa grossa: la foto del terreno della
mappa grande (2880×2784) il browser la disegnava per una strada lentissima; ora è tagliata in riquadri di 1024 px (con 2 px in comune,
niente righe) e si disegnano solo quelli sullo schermo: alla partenza da 28 a 9 ms a fotogramma, con 10 zombie da 43 a 13 ms; ovunque
4–10 ms senza zombie e 8–17 con dieci. In più zombie, fiamme libere, corvi posati, luci, buio e fumi lontani dallo schermo non si
ordinano e non si disegnano. L'audio c'era già: volume con la distanza, al massimo tre voci insieme, intervalli minimi tra colpi e passi.

## 55: il salvataggio in tre blocchi

Nel telefono il salvataggio è `{v:2, classica, zombie, condivisa}` (`SAVE_BLOCCHI`, `saveBlocks`, `flatBlocks` in
`src/js/07-meta-oggetti-casse.js`): Classica = oggetti, equipaggiamento, set, casse e quinto posto, coppe, arene, Abisso, sfida, eroi e
talenti, pass, Essenza di muschio, bustine Classiche; Zombie = armi e accessori zombie, Lucky Cards, record e partite, Pass Zombie, Rottami,
bustine Zombie; condivisa = oro, cristalli, vestiti e loro carte, compagni e loro carte, profilo, missioni, traguardi, ruota. In memoria
resta un oggetto solo; i salvataggi vecchi e i codici di salvataggio si leggono come prima. Il controllo `saveCheck`
(`src/js/79-salvataggio.js`) dopo la lettura e prima di ogni scrittura rimette a posto solo ciò che è rotto (numeri impossibili, livelli
fuori misura, cose indossate ma non possedute, tetti di 99 bustine e 99 Lucky Cards per tipo) senza togliere niente di posseduto. Le
monete della partita zombie non entrano mai nel salvataggio. Prova `node tests/salvataggio.js`.

## 57: collaudo

Passano: una partita automatica per capitolo fino al boss (`run.js`), `menu2.js`, `menu3.js`, `meta2.js`, `mig.js`, `gems.js`,
`bossdie.js`, `avvio.js`, `zombie.js`, `salvataggio.js`; della mappa `gioco.js`, `ondate.js`, `barriere_prova.js`, `macchine_prova.js`,
`bara_usi.js`, `piani_prova.js`, `comparse_prova.js`, `navmappa.js` (96 zombie su 96 arrivano all'eroe in 12 posti, anche di sopra). Corretti
durante il collaudo: la riga di vittoria della Classica diceva «La Strega delle Radici è caduta» dopo il Golem (ora è quella del boss vero
dell'arena, `VINTO` in `06-ui.js`); uno zombie dentro la Cappella restava contro la finestra (il controllo «conviene passare?» era troppo
severo di qualche pixel); tettoia della caldaia che invadeva il varco est; Credenza davanti a una finestra e scaffali davanti alle finestre
della Locanda; porta sul retro della Locanda che dava sulla scala; botola nascosta dietro la Locanda (spostata nel vicolo).

