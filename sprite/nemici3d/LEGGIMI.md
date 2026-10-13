# Nemici e boss della Classica in 3D (prova, non ancora nel gioco)

Richiesta di Denis del 13 ottobre: «ricreami tutti i boss ed i nemici in 3d come hai fatto col pg». Ogni mostro è quello di oggi nel
gioco (stessi colori, stessi pezzi, stesse proporzioni, stessi occhi), rifatto con volumi 3D visti dalla telecamera dei mostri
(`V(face)` di `CR._rig`), quindi gira a 360 gradi; è dipinto come l'Arciere 3D: tre toni che sfumano con la luce calda dall'alto a
sinistra, contorno scuro spesso, bordo illuminato. Ogni mossa dipende solo da `p` (da 0 a 1).

Firma: `N3.<nome>(x, y, face, anim, p, sc, o)`; `x, y` è il punto a terra sotto il mostro; `anim` è una delle mosse di
`N3.meta[nome].an` (`idle`, `walk`, `attack`, `hit` e le mosse speciali, con le scritte italiane in `lab`); `o.p2` la seconda fase dei
boss, `o.noFx` senza gli effetti delle mosse. `N3.meta[nome]`: `n` nome, `g` gruppo (capitolo 1–4 o `'boss'`), `sc`, `an`, `dur`
(secondi di ogni mossa), `lab`.

File (si caricano in quest'ordine, dopo il gioco: servono `CR._rig`, `EROE` e, per lo slime, `NE` di `sprite/nemici/disegno_nemici.js`):
- `base3d.js`: la cassetta degli attrezzi `C3` (volumi convessi dai punti della superficie `vol`, ellissoidi, palle e capsule morbide,
  catene, foglie e petali a due facce, dischi e macchie sulle superfici, corpi di rotazione, occhi che non stanno mai sul contorno,
  bocche, guance, ombre, stelline) e il registro `N3`.
- `cap1.js`: fungo, slime (quello col teschio scelto da Denis, `NE.slime`, solo più grande o del colore della lava per lo slime grande
  e quello di lava), pipistrello, pianta, fuoco fatuo. `cap1b.js`: scarabeo bomba, fiore occhio, occhio d'ombra.
- `cap2.js`: diavoletto, golem d'ossidiana. `cap3.js`: rana, zanzara, coccodrillo, lumaca, girino. `cap4.js`: lupo, spirito della
  neve, sentinella di ghiaccio.
- `umanoidi.js`: i nemici che nel gioco usano il rig dell'eroe, sullo stesso corpo dell'Arciere 3D con le opzioni di stile nuove di
  `EROE` (teschio, costole, orecchie, punta del cappuccio, corna di rami, corona di ghiaccio, elmo e barba, veste lunga, sospesi, crepe
  di lava, scudo, bastone dei maghi, martello, bomba; l'Arciere resta identico al pixel): goblin, scheletro, scheletrino, negromante,
  piromante, nano bombarolo, la Strega, il Fabbro, la Regina dei Ghiacci e il suo riflesso.
- `boss1.js`: Golem, Re Rospo, Yeti. `boss2.js`: Salamandra, Idra, Mimic.
- `eroi.js` (gruppo «Eroi e compagni», richiesta di Denis «fammi anche i pg tutti in 3d»): l'Arciere, la Cacciatrice (coda di capelli),
  il Balestriere (elmo, balestra) e il Druida (corna di legno, bastone, occhi verdi) sul corpo dell'Arciere 3D; i compagni Muschietto, Lucciola e
  Draghetto; il Mercante col tappeto, le pozioni e la cassa. `N3.meta[nome].old` disegna quello di oggi per «Prima e dopo».

Pagina di prova: `python3 anteprime/mk_nemici3d.py [nome]` → `anteprime/nemici3d.html` (viste «Gira», «4 direzioni», «Prima e dopo»,
«Tutti»; mosse, ◀ ▶, «Fase 2» per i boss, effetti bassi, tempo di disegno), pubblicata su
https://claude.ai/artifact/KJAoPYt98bEeiiwmYpPTYG.

Da fare dopo il giudizio di Denis: le correzioni che chiede; poi l'innesto nel gioco (adattatore dallo stato di ogni nemico in `update`
alla mossa e a `p`, come `src/js/62-eroe-3d.js` fa per l'eroe), i fogli per i telefoni lenti, la mossa «muore».
