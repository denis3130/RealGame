# Nemici della modalità classica rifatti (bozza, non ancora nel gioco)

`disegno_nemici.js` rifà i nemici della modalità classica con il metodo dello Zombie spaventapasseri: prende la cassetta degli attrezzi da
`sprite/mostri/disegno_mostri.js` (`CR._rig`: scheletro 3D proiettato con `V(face)`, cinematica inversa `ik`, `stepper`, `trunk`, `leg`, `zArm`,
`claw`, `rim`, `shadeLimb`, `glowTop`, `folds`, `run`, `Vat`…), quindi va eseguito dopo quel file, dentro la funzione principale di `index.html`.
Espone `NE.goblin`, `NE.skeleton`, `NE.slime`, `NE.bat` con firma `(x, y, face, anim, p, sc[, o])`; `anim`: `idle`, `walk`, `attack`; `p` da 0 a 1.

Stessi personaggi di prima, più inquietanti: occhi che brillano e pulsano come un respiro (`gEye`), bocche troppo larghe con denti storti
(`teeth`), dita lunghe con artigli, crepe e cuciture; da fermi restano immobili e poi girano di colpo la testa (`snap`), con un tremito (`tremor`).

- **Goblin** (`goblin`, grandezza 1): arciere gobbo sotto un cappuccio strappato con la punta piegata, orecchie lunghe, naso adunco, ghigno con denti
  storti, occhi rossi; tunica rossa con cintura. `idle` respira e scatta con la testa; `walk` corre curvo a passi corti; `attack` tende la corda alla
  guancia (l'arco gira in avanti), scocca, abbassa l'arco.
- **Scheletro** (`skeleton`, grandezza 1,1, `o.shield` 0..1 = scudo e sua usura): teschio crepato con la mandibola che pende e batte, una brace in
  un'orbita, gabbia toracica sulla cavità scura, spina dorsale, bacino; balestra nella sinistra, scudo di assi con cerchio di ferro e stemma rosso
  sull'avambraccio destro (si crepa con `o.shield` basso, sparisce a 0). `idle` immobile con un tintinnio, piega troppo la testa e la rimette a posto;
  `walk` passi rigidi a scatti; `attack` alza la balestra all'orbita, tira (rinculo e lampo), riabbassa e ricarica.
- **Slime** (`slime`, grandezza 1, `o.gel`/`o.gelD` per i colori): gelatina verde malata con un teschio dentro, bolle, fili di bava alla base; occhi
  gialli che vagano e una bocca larga piena di denti. `idle` respira, sussulta in avanti; `walk` salta (si schiaccia, si allunga in aria, si spiaccica);
  `attack` si tira indietro a bocca spalancata e si lancia in avanti.
- **Pipistrello** (`bat`, grandezza 1): vola. Ali di membrana strappata con le dita d'osso, cicatrici e tacche; pelo viola, muso schiacciato, orecchie
  lunghe e tagliate, occhi di brace, bocca urlante piena di aghi. `idle` plana sbattendo piano e scatta con la testa; `walk` vola; `attack` si impenna,
  si tuffa a bocca aperta e risale.

Fogli: `python3 tests/mk.py` e poi `node tests/nemici.js [nome ...]` → `sprite/nemici/<nome>_<mossa>.png` e `fogli.json` (8 direzioni × fotogrammi,
casella e piedi come per i mostri zombie). Pagina dal vivo: `python3 anteprime/mk_mostro.py goblin` → `anteprime/mostro.html`.

Da fare: gli altri 23 nemici normali e i 9 boss; l'innesto nel gioco (adattatore dallo stato di ogni nemico in `update` a `anim`/`p`, mosse «colpito»
e «muore»); i suoni propri; la misura dei tempi di disegno contro i nemici attuali (`tests/perf.js`).
