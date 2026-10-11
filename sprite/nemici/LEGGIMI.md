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
  mandibola che batte, gabbia toracica, spina dorsale, bacino, piedi d'osso con tallone, arco e tre dita di due ossicini con le nocche; un gagliardetto blu annodato sulla spalla; balestra nella sinistra (dardo con le
  penne blu), scudo di assi con cerchio di ferro e stemma rosso sull'avambraccio destro (si crepa solo con `o.shield` basso, sparisce a 0).
  `idle` piega la testa incuriosito e batte la mandibola; `walk` passi rigidi a scatti; `attack` alza la balestra all'occhio, tira (rinculo e
  lampo), riabbassa e ricarica.
- **Slime** (`slime`, grandezza 1, `o.gel`/`o.gelD` per i colori): **la prima versione fatta col metodo, voluta da Denis** (11 ottobre:
  «quello che hai fatto prima di cambiarlo»): gelatina verde con un teschio dentro che galleggia, bolle, fili di bava alla base, occhi
  gialli che brillano e una bocca larga con i denti. Ha i suoi aiutanti (`sEye`, `sTeeth`). `idle` respira e sussulta in avanti; `walk`
  salta (si schiaccia, si allunga in aria, si spiaccica); `attack` si tira indietro a bocca spalancata e si lancia in avanti.
- **Pipistrello** (`bat`, grandezza 1, rifatto da zero l'11 ottobre su richiesta di Denis): sta in aria dritto, con una testa grande
  (occhioni gialli, orecchie alte rosa dentro, muso rosa, nasino, due zannette, ciuffi sulle guance) sopra un corpicino di pelo con la
  pancia chiara e due zampette. Le ali vivono in un piano loro (`U` lungo l'apertura, girato dal battito e un po' all'indietro, `Wc`
  lungo la corda): braccio, tre dita lunghe e la membrana chiara smerlata, appesa dal braccio verso la telecamera, così si vede larga
  davanti e dietro e gira piano nei tre quarti; di lato resta sottile e si legge col battito. `idle` plana sbattendo e si guarda
  intorno; `walk` vola; `attack` si impenna a bocca aperta, si tuffa con le ali all'indietro e risale.

Fogli: `python3 tests/mk.py` e poi `node tests/nemici.js [nome ...]` → `sprite/nemici/<nome>_<mossa>.png` e `fogli.json` (8 direzioni × fotogrammi,
casella e piedi come per i mostri zombie). Pagina dal vivo: `python3 anteprime/mk_mostro.py goblin` → `anteprime/mostro.html`.

Storia: la prima versione (ottobre 2026) era «creepy» come i mostri zombie; Denis l'ha bocciata per la Classica («deve avere il proprio design
artistico, simile ma diverso da quello della modalità zombie»), da qui questo look.

Da fare: gli altri 23 nemici normali e i 9 boss; l'innesto nel gioco (adattatore dallo stato di ogni nemico in `update` a `anim`/`p`, mosse «colpito»
e «muore»); i suoni propri; la misura dei tempi di disegno contro i nemici attuali (`tests/perf.js`).
