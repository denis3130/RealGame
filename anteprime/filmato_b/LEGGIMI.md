# Il filmato B: l'allenamento all'alba (anteprima, non ancora nel gioco)

Seconda intro (14 ottobre, richiesta di Denis): l'Arciere e la Cacciatrice si allenano insieme nel bosco all'alba. Ci sono la corsa,
il tiro ai bersagli, la gara a chi colpisce prima (la tua freccia spacca la sua), le pigne da schivare con gli scatti e infine
i due seduti su un tronco con la cripta lontana. Dura circa 42 secondi, poi c'è il logo.

- **Il protagonista è l'eroe che hai scelto** (`FM.prot`): ha solo i pensieri, in corsivo in basso, e il bastoncino di muschio.
  L'altro eroe è il compagno: parla in alto, col suo nome nel suo colore (verde acqua l'Arciere, rosa la Cacciatrice). Se il filmato
  va nel gioco prima della creazione dell'eroe, il protagonista è l'Arciere.
- **Ci sono anche il Balestriere e il Druida** (Denis, 14 ottobre: «aggiungi anche gli altri pg nel filmato»): aspettano al campo
  (`BAL`, `DRU`; il Balestriere: «In ritardo, come sempre.»), guardano la gara dai lati, ridono con gli altri due dopo le pigne
  e alla fine stanno al tronco con loro (il Druida seduto all'altro capo, il Balestriere in piedi), e il Druida chiude con
  «Domani, tutti e quattro.». Le due battute sono da confermare con Denis. Il Balestriere parla in azzurro acciaio, il Druida in verde.
- **Un momento tutto loro** (Denis, 14 ottobre: «Un momento tutto loro», 3,2 s dopo «Cosa?! Mi hai spaccato la freccia!», senza parole):
  `4.7` il Balestriere alza la balestra, un respiro, il dardo: la telecamera gli frusta dietro fino al bersaglio basso (`TB`), che si
  spacca in due; le metà volano di lato, girano tre quarti e cadono sul taglio (`halfAt`, `halfTarget`), resta il cavalletto (`easel`);
  `4.7b` lui si gira verso di noi, contento, mentre ricarica; `4.9` il Druida batte il bastone (`B_DCAST`): un anello di luce verde sul
  prato, foglie che gli girano intorno salendo a spirale (`leafCard`) e diciotto fiori che sbocciano intorno ai piedi, dal centro in
  fuori (`DFL`, `flowerCard`). Suoni: manovella e scatto del dardo, il colpo secco, lo schiocco del legno che si spacca, le metà a
  terra, una piccola fanfara; poi un coro, campane, l'arpa che sale, il fruscio delle foglie, una nota per ogni fiore. Tutto quello che
  viene dopo è spostato di 3,2 s (`B_THROW`, `B_CONE`, `B_DASH`, `B_LOGO`, le battute, i suoni).
- **Battute del compagno** (scelte da Denis): «Tutto qui? Corri, dormiglione!» (dormigliona se la protagonista è la Cacciatrice),
  «Bel colpo… sarà fortuna!», «Cosa?! Mi hai spaccato la freccia!», «Schiva questa! E questa!», «Domani la cripta. Ci stai?».
  Pensieri del protagonista: «Ah, sì? Ti prendo!», «Fortuna? Guarda bene.», «Respira… mira…», «Troppo facile!», «Ci sto.»
  In apertura «Prima della cripta…». Testi in `bTexts()` di `12-inquadrature.js`.
- Usa il motore del filmato A (`anteprime/filmato/01-motore.js`, `02-bosco.js`, `06-suoni.js`). Per questo il motore ora regge:
  più eroi nella stessa inquadratura (`sh.heroes`), eroi sollevati da terra (`H.y`, seduti sul tronco), gli effetti dello scatto
  (`H.fx`), battute col nome di chi parla (5° e 6° campo di `TXT.A`), cielo, nebbia, raggi e lucine scelti dal set, oggetti propri
  dell'inquadratura nel bosco, suoni e silenzi di un altro filmato (`AUD.cues`, `AUD.silent`). Il filmato A resta identico.
- `10-alba.js`: la luce dell'alba (stessa tavolozza `NT` del bosco, scaldata), cielo col sole e le nuvole, uccelli; bersaglio di
  paglia sul cavalletto, bersaglio appeso al ramo, frecce in volo e piantate, balle di fieno, staccionata, stendardo, cesto di pigne,
  tronco col muschio, cripta lontana sulla collina (quella del filmato A).
- `11-scene.js`: chi è chi (`B_ID`, `B_CO`), aspetto dei quattro eroi (`BST`, `BNAME`, `BCOL`), corsa (`runPose`), i set `bAlba`, `bCorsa`, `bCorsa2`,
  `bCampo` (il campo di allenamento, `CAMPO`), `bTronco`.
- `12-inquadrature.js`: le 22 inquadrature e i momenti chiave (`B_REL1`, `B_HIT1`, `B_SPLIT`, `B_BOLT`, `B_DCAST`…), gli altri due (`bTwo`, `bLog`). `13-suoni.js`: suoni e musica
  (re maggiore, flauto, arpa, tamburi a cornice; il trombone buffo quando il compagno resta senza parole).
- Anteprima: `python3 anteprime/mk_filmato_b.py` → `anteprime/filmato_b.html` (non va su git). All'inizio «Chi sei?» (Arciere o
  Cacciatrice), alla fine «Rivedi con l'altro eroe» e «Trailer 9:16». Indirizzo: `?eroe=cacciatrice`, `?trailer=1`, `?t=19`, `?shot=4.5`.
- Foto di prova: `python3 anteprime/filmato_b/foto.py <cartella> 4.5 20.8 --eroe cacciatrice --sheet foglio.png`.
  Suoni: `python3 anteprime/filmato_b/audio_prova.py <cartella>`.

Da decidere con Denis: quale dei due filmati va nel gioco (all'avvio) e quale fa da pubblicità.
