# Nemici e boss della Classica in 3D (nel gioco dal 13 ottobre)

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
- `boss3.js`: i 4 boss nuovi del terzo giro (Burattinaio d'Ombra, Fenice della Forgia, Piovra della Palude, Cervo d'Aurora), con le mosse
  di battaglia e anche `enter` (l'entrata) e `die` (la sconfitta), che il gioco fa recitare ai modelli; e il burattino d'ombra (`puppet`),
  il servitore del Burattinaio, uguale ai burattini della sua mossa. Nel gioco dal 15 ottobre (`src/js/81-86`, `docs/boss-nuovi.md`).
  Dal 15 ottobre (Denis: «voce e personalità») hanno anche `taunt`, «Presa in giro»: un pezzo della loro entrata già approvata, rifatto
  come mossa a sé (l'inchino del Burattinaio; le ali che si aprono e si richiudono della Fenice; il saluto con due tentacoli e la faccia
  brontolona della Piovra; la testa alta del Cervo con le corna che si accendono, sempre intere). Il gioco la usa quando il boss ti colpisce
  o quando gli stai lontano (`src/js/88-boss3-voci.js`).
- `eroi.js` (gruppo «Eroi e compagni», richiesta di Denis «fammi anche i pg tutti in 3d»): l'Arciere, la Cacciatrice (coda di capelli),
  il Balestriere (elmo, balestra) e il Druida (corna di legno, bastone, occhi verdi) sul corpo dell'Arciere 3D; i compagni Muschietto, Lucciola e
  Draghetto; il Mercante col tappeto, le pozioni e la cassa. `N3.meta[nome].old` disegna quello di oggi per «Prima e dopo».

Pagina di prova: `python3 anteprime/mk_nemici3d.py [nome]` → `anteprime/nemici3d.html` (viste «Gira», «4 direzioni», «Prima e dopo»,
«Tutti»; mosse, ◀ ▶, «Fase 2» per i boss, effetti bassi, tempo di disegno), pubblicata su
https://claude.ai/artifact/KJAoPYt98bEeiiwmYpPTYG.

Nel gioco: `src/js/64-nemici-3d.js` (lo stato di ogni nemico diventa la mossa e `p`). Per misurare il tempo di disegno di un modello
pulire la tela a ogni fotogramma come fa il gioco: senza, il browser accumula i comandi e a tratti rallenta (la Piovra sembrava costare
5 ms invece di 0,9).

## «Si prepara» e «Muore» (29 ottobre, Denis: «Nemici più vivi»)

I 26 nemici normali (gruppi 1–4) hanno due mosse in più, `prep` («Si prepara») e `die` («Muore»), nello spirito della Classica (niente
sangue, toni da giocattolo, stelline). `prep` si ripete finché il gioco la tiene (0,7–0,9 s a giro): la preparazione del loro colpo, chiara
da lontano (si abbassano, tremano piano, la parte che colpirà si tira indietro o si illumina, gli occhi si stringono). `die` va una volta
sola (0,9–1 s) e l'ultima posa resta ferma, per famiglia come le morti del gioco (`src/js/77-morti-nemici.js`) ma in 3D coi pezzi del
modello: le gelatine si sciolgono in una pozza, i volanti girano e cadono, le piante appassiscono, le bestie si rovesciano su un fianco, la
pietra e il ghiaccio si spaccano (la sentinella perde la testa, che le cade accanto), il fuoco fatuo e l'occhio d'ombra si spengono.
Per i nemici col corpo dell'Arciere (`umanoidi.js`) le due mosse si fanno da fuori, con le mosse che il corpo ha già (`aim`, `dash`, `hit`)
e `o.tweak`: l'Arciere non cambia di un pixel. Chi ha i vestiti cede sulle ginocchia e cade di lato tutto intero, lontano da dove guarda;
gli scheletri si sfasciano in una nuvola di polvere d'ossa e restano un mucchietto d'ossa con lo scudo e il teschio accanto, che guarda
verso di noi con gli occhi spenti (`EROE.testa`). Nella cassetta, `floor` con trasparenza 0 non disegna più niente (prima `shadow` la
prendeva per quella di sempre). Fogli: `node tests/nemici_mosse.js <png> <nemici> [mosse] [direzione]` (una riga per nemico, `Z=2` più grande); tempi di disegno uguali alle altre
mosse. Suoni e collegamento col gioco in `src/js/97-nemici-vivi.js`; pagina `python3 anteprime/mk_nemici3d.py --vivi` (solo i 26, con
«🔊 Suoni» e «Tutte le mosse» in fila).
