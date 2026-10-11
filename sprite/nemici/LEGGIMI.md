# Nemici della modalità Classica rifatti (bozza, non ancora nel gioco)

`disegno_nemici.js` rifà i nemici della modalità Classica con il metodo dello Zombie spaventapasseri: prende la cassetta degli attrezzi da
`sprite/mostri/disegno_mostri.js` (`CR._rig`: scheletro 3D proiettato con `V(face)`, cinematica inversa `ik`, `stepper`, `trunk`, `leg`, `zArm`,
`rim`, `shadeLimb`, `glowTop`, `folds`, `run`, `Vat`…), quindi va eseguito dopo quel file, dentro la funzione principale di `index.html`.
Espone `NE.goblin`, `NE.skeleton`, `NE.slime`, `NE.bat` con firma `(x, y, face, anim, p, sc[, o])`; `anim`: `idle`, `walk`, `attack`; `p` da 0 a 1.

**Stesso metodo dei mostri zombie, altro spirito.** La Classica deve piacere anche ai bambini: colori pieni e saturi (gli stessi di `ECOL` nel
gioco), forme tonde da giocattolo, teste grandi, occhi grandi da cartone con la luce dentro (`cEye`, con il battito di ciglia `blink`),
sopracciglia birichine (`brow`), bocche semplici: un sorriso (`smile`) con al massimo due zannette (`fangs`) o una bocca aperta con la lingua
(`openMouth`). Niente sangue, ferite, crepe o cuciture: quelle restano ai mostri della modalità Zombie. Da fermi respirano e si guardano
intorno piano (`look`), senza scatti. Lo scheletro ha due lucine rosse ferme nelle orbite (`pip`) e denti quadrati in fila (`teethRow`).

- **Goblin** (`goblin`, grandezza 1): arciere gobbo sotto un cappuccio rosso con la punta floscia che dondola e una toppa cucita; orecchie
  lunghe e tonde, occhi rossi grandi con le sopracciglia storte, naso a pallina, ghigno con due zannette; tunica rossa con cintura e fibbia
  d'oro. `idle` respira, si guarda intorno e ride; `walk` corre curvo a passi corti; `attack` tende la corda alla guancia (l'arco gira in
  avanti), scocca, abbassa l'arco.
- **Scheletro** (`skeleton`, grandezza 1,1, `o.shield` 0..1 = scudo e sua usura): teschio pulito con due luci rosse nelle orbite, la
  mandibola che batte, gabbia toracica, spina dorsale, bacino; un gagliardetto blu annodato sulla spalla; balestra nella sinistra (dardo con le
  penne blu), scudo di assi con cerchio di ferro e stemma rosso sull'avambraccio destro (si crepa solo con `o.shield` basso, sparisce a 0).
  `idle` piega la testa incuriosito e batte la mandibola; `walk` passi rigidi a scatti; `attack` alza la balestra all'occhio, tira (rinculo e
  lampo), riabbassa e ricarica.
- **Slime** (`slime`, grandezza 1, `o.gel`/`o.gelD`/`o.gelF`/`o.gelL`/`o.eye` per i colori): gelatina verde brillante con un nucleo più
  chiaro e le bolle, gocce alla base; due occhioni che sbattono le ciglia e un sorriso con due zannette. `idle` respira e ride; `walk` salta
  (si schiaccia, si allunga in aria, si spiaccica); `attack` si tira indietro a bocca spalancata, con la lingua, e si lancia in avanti.
- **Pipistrello** (`bat`, grandezza 1): vola. Pallina di pelo viola con la pancia chiara, ali di membrana con le dita in rilievo, orecchie
  grandi rosa dentro, muso rosa, occhioni gialli, due zannette. `idle` plana sbattendo piano e si guarda intorno; `walk` vola; `attack` si
  impenna, si tuffa a bocca aperta e risale.

Fogli: `python3 tests/mk.py` e poi `node tests/nemici.js [nome ...]` → `sprite/nemici/<nome>_<mossa>.png` e `fogli.json` (8 direzioni × fotogrammi,
casella e piedi come per i mostri zombie). Pagina dal vivo: `python3 anteprime/mk_mostro.py goblin` → `anteprime/mostro.html`.

Storia: la prima versione (ottobre 2026) era «creepy» come i mostri zombie; Denis l'ha bocciata per la Classica («deve avere il proprio design
artistico, simile ma diverso da quello della modalità zombie»), da qui questo look.

Da fare: gli altri 23 nemici normali e i 9 boss; l'innesto nel gioco (adattatore dallo stato di ogni nemico in `update` a `anim`/`p`, mosse «colpito»
e «muore»); i suoni propri; la misura dei tempi di disegno contro i nemici attuali (`tests/perf.js`).
