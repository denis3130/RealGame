# Anteprima 50 (6 novembre)

Denis, alla domanda «cosa miglioreresti nel gioco?» (6 novembre), ha scelto:
- Anteprima 49: «Mettila nel gioco» — fatto lo stesso giorno (i sei file in fondo a `src/ordine.txt`, gioco e app ripubblicati, commit
  82a9cb1 del ramo `gioco`);
- Zombie: «Zombie nuovi in partita» (il Gonfio, lo Sputatore e il Bruto disegnati il 31 ottobre);
- Classica: «Menu che si apre piano», «Bilanciamento misurato», «Più fluido sul tuo iPhone» (per questo servono i numeri del contatore
  dal suo telefono: Impostazioni → Contatore, poi «Copia»).

Le due cose nuove stanno in file loro fuori da `src/ordine.txt` e si vedono solo nell'Anteprima 50: il gioco di oggi più i file di
`NUOVI` in `anteprime/mk_anteprima50.py`, messi prima della chiusura. `python3 anteprime/mk_anteprima50.py <cartella>` la costruisce
anche divisa in tre pezzi come il gioco pubblicato; pubblicata su https://claude.ai/artifact/VWQta6wf9zkT8PLyaLdm2T (si aggiorna
ripubblicando la stessa cartella). Nella pagina si parte da giocatore nuovo con l'eroe già fatto (niente prologo né
creazione), il bottoncino «Anteprima: sali di livello ▲» fa salire di un livello alla volta, e gli zombie nuovi escono prima (lo
Sputatore dal round 2, il Gonfio dal 3, il Bruto dal 4). Il gioco sul telefono e l'app non cambiano finché Denis non dice sì.

## 1. Gli zombie nuovi in partita (`anteprime/zombie/speciali.js`)

`ZM.speciali`, tutti i numeri in `ZSP`. Il file avvolge `ZM.partita` (update, reset, drawGround, drawTop del direttore) come le abilità
(99) e fa diventare speciale qualche zombie del round appena nato, ancora sotto terra (`FROM`: zombie, strisciante, minatore), da un
round in su, con una probabilità che cresce coi round e mai troppi insieme. Il primo di ogni tipo in una partita esce di sicuro (il terzo
zombie del suo primo round) e una scritta lo presenta una volta («Uno Sputatore! Sputa acido: schiva il cerchio verde», «Un Gonfio!
Fallo scoppiare in mezzo agli altri», «Il Bruto! Quando si curva, spostati»; le scritte della mappa ora vanno a capo invece di uscire
dallo schermo, solo con questo file). Vita, passo e danno
restano in proporzione a quelli del round; le monete sono di più.

| | dal round | insieme | vita | passo | monete | mosse |
|---|---|---|---|---|---|---|
| Sputatore | 4 | 2 (3 dal 12) | 70 | 34 | 90 | sputo d'acido da 80–230 px: il cerchio verde dove cadrà, 0,8 s di volo, 15; pozza che brucia 4 s (5 ogni mezzo secondo); graffio 14 |
| Gonfio | 6 | 2 | 140 | 20 | 80 | vicino a te si gonfia 1,25 s e scoppia (30 a te, 150 agli zombie vicini, a catena sugli altri Gonfi); nube verde 4,5 s; ucciso scoppia subito |
| Bruto | 8 | 1 (2 dal 15) | 480 | 26 | 220 | carica da 110–260 px: si curva 0,75 s e la strada si accende a terra, poi a 250 px/s: 34 e spinta, contro un muro resta stordito 1,5 s; schianto da vicino 38 con l'anello di polvere e le crepe |

- Le abilità zombie valgono anche per loro: la campana del Rintocco e la Tagliola li stordiscono e la mossa che stavano facendo si perde
  (provato sulla carica del Bruto).
- Agganci nel motore della mappa (`anteprime/zombie/motore.js`), che senza il file non fanno niente: `ZM.zSpec(z, dt, d, dx, dy)` nel
  giro degli zombie, dopo barriere e stordimento (se risponde vero, lo zombie fa la sua mossa e salta passo e morso di sempre), e
  `ZBOX` nel `return` (i riquadri dipinti dei tipi nuovi per l'immagine pronta: misurati in tutte le mosse, 21 momenti, 16 direzioni e
  le tre inclinazioni della telecamera, più 4 px, con `node tests/a50/zbox.js`).
- Voci: la gola di ognuno in `KV` di `audio_zombie.js` (Gonfio basso e gorgogliante, Sputatore acuto e raschiato, Bruto profondo).
- Costo di disegno dal vivo come gli zombie di sempre: 1,6–2,3 ms a zombie qui (lo zombie 1,7, la lanterna 2,1, il Becchino 2–2,3, lo
  spaventapasseri 2,9–5); nella partita, come gli altri, si copiano dall'immagine pronta (`ZBOX`) ridisegnata a turno.
- Prova: `node tests/a50/speciali.js` (19 controlli: i disegni e gli agganci; lo sputo che cade dove eri con la pozza che brucia e
  l'attesa prima del prossimo; il Gonfio che si gonfia e scoppia, uccide lo zombie accanto e lascia la nube che brucia, e ucciso fa
  scoppiare quello accanto; il Bruto che si curva, la carica che fa male e spinge via, il muro che lo stordisce, lo schianto con anello e
  crepe; la campana e la tagliola che fermano la carica; nessuno zombie nuovo nel round 2, tutti e tre nel round 8 con un Bruto solo; il
  costo di disegno; nessun errore; foto `tests/a50/sp_*.png`).

## 2. Il menu che si apre piano (`src/js/120-menu-graduale.js`)

Per chi crea l'eroe da adesso i bottoni del menu si aprono uno alla volta salendo di Livello esploratore («Liv. N» in alto), come in Clash
Royale. All'inizio ci sono Gioca, le isole, le casse sotto l'eroe, la bustina gratis e l'Armeria. `APRE`:

| quando | cosa | come si vede prima |
|---|---|---|
| dopo la prima partita | le Missioni | non c'è (nella Classica: dentro «Premi») |
| livello 2 | Eroi e talenti; l'accesso di ogni giorno | linguetta col lucchetto e «Liv. 2»; non c'è |
| livello 3 | la modalità Zombie (manina e linguette) | non c'è |
| livello 4 | i compagni; la Ruota della fortuna | linguetta col lucchetto; non c'è |
| livello 5 | la Bottega (anche le Offerte e la Bottega Zombie); il Pass di stagione (anche il Pass Zombie) | linguetta col lucchetto; non c'è |
| livello 6 | l'Albero delle abilità; il Cammino e i Traguardi | non c'è |
| livello 7 | la Sfida del giorno; l'Abisso | accanto a Gioca, grigi col lucchetto e «Liv. 7» |
| livello 8 | Torre, Corsa e Reliquie (la fila sopra Gioca); l'Evento della settimana | non c'è |

- Un tocco su una cosa col lucchetto dice «Si apre al livello N» e la fa tremare, senza aprirla.
- Quando si apre qualcosa, appena il menu è libero (nessun foglio, cassa, isola nuova, spettacolo del ponte, creazione o filmato) la
  finestra «Si è aperto!» lo presenta col suo disegno in grande, il nome e una riga, col suo suono di campanelle; una alla volta.
  Poi il bottone brilla con «Nuovo» finché non lo tocchi.
- Nella Classica Missioni, Accesso, Ruota e Traguardi stanno nel bottone «Premi» (94): «Premi» c'è appena uno dei quattro è aperto, dice
  «Nuovo» finché uno dei quattro lo è, e nel suo pannello ci sono solo le righe aperte (`AP_PREMI`); il numerino di «Premi» conta solo
  quelli aperti.
- L'accesso di ogni giorno non si apre da solo finché è chiuso.
- Nella Zombie (dal livello 3) ci sono subito le Missioni, l'accesso e le Lucky Cards; Pass e Bottega Zombie al 5, i Traguardi al 6.
- Il bottoncino dell'anteprima «Anteprima: sali di livello ▲» (solo con `window.MB_ANTEPRIMA`) sta sotto il nome dell'arena.
- Livelli: per salire servono 100, 140, 180… punti (`acctNeed`); una partita della Classica ne dà circa 40–80 all'inizio (8 a stanza,
  le uccisioni, 40 se vinci, 25 a boss), una missione 25. Quindi circa 3 partite per la Zombie e 15–18 per avere tutto: da regolare.
- I salvataggi di prima hanno tutto aperto come sempre (`SAVE.apre` c'è solo per chi passa dalla creazione dell'eroe da adesso).
- Prova: `node tests/a50/menu.js` (17 controlli: giocatore nuovo, lucchetti e livelli, il tocco sul lucchetto, l'accesso che non si apre
  da solo, «Si è aperto!» dopo la prima partita, «Premi» e il suo pannello, «Nuovo» che se ne va, i tredici sblocchi dal livello 2
  all'8, tutto aperto all'8 anche nella Zombie, salvataggio di prima, telefono piccolo, nessun errore; foto `tests/a50/me_*.png`).

## Prove

`python3 tests/a50/mk.py` (costruisce `tests/a50/test_a50.html` dall'anteprima senza salvataggio pronto né scorciatoie), poi
`node tests/a50/speciali.js`, `node tests/a50/menu.js`, `node tests/a50/zbox.js`.

## Per metterla nel gioco (quando Denis dice sì)

- In `src/ordine.txt`, prima di `coda.html`: `../sprite/mostri/zombie_nuovi.js` (dopo `disegno_mostri.js` va bene anche in fondo: usa
  solo `CR._rig`), `../anteprime/zombie/speciali.js` (dopo i file della mappa) e `js/120-menu-graduale.js` (dopo 94, 96, 99, 103 e 104,
  che crea o tocca i bottoni). Le scorciatoie dell'anteprima (zombie nuovi dal round 2, salvataggio pronto, il bottoncino per salire di
  livello) restano solo nella pagina dell'anteprima.
- Le prove che partono da un giocatore nuovo che passa dalla creazione (`fresh.js`, `mig.js`, `scelta.js`) troveranno il menu chiuso:
  vanno adattate (salire di livello come `tests/a50/menu.js`, oppure toccare solo quello che è aperto). Quelle coi salvataggi pronti
  che hanno `starter` (`menu2.js`, `menu3.js`, `gems.js`, `hand.js`) non cambiano: per loro tutto resta aperto.
- Poi le prove di sempre (`menu2`, `menu3`, `meta2`, `zombie`, `mig`, `fresh`, `classica`, una partita automatica per capitolo) e le tre
  di `tests/a50/`.
