# I boss della Classica rifatti (15 ottobre, in corso)

Richiesta di Denis (15 ottobre): «non mi piacciono, rivisita tutti i boss, rendili più creepy e fatti meglio sia da fermi che nelle
animazioni. Dagli un bel character design appropriato per ogni boss della modalità classica, dal Golem all'ultimo». Risposte alle domande:
paura «un po' più cupi» (restano della Classica: forme tonde da giocattolo, colori pieni, occhi con la lucina, al massimo due zannette,
niente sangue né ferite); metodo «prima uno, poi tutti» (il Golem su carta con le quattro direzioni e una pagina dal telefono; se gli
piace lo stile, gli altri dodici nello stesso modo, poi nel gioco); agenti sì: «falli possenti, belli, fighi, che diano timore nello
sfidarli», «migliora anche le loro abilità speciali».

Ordine: Golem, Salamandra, Re Rospo, Yeti, Strega, Fabbro, Idra, Regina, Mimic, Burattinaio, Fenice, Piovra, Cervo.

## Come si fa un boss

1. Tre proposte di character design (agenti), un direttore artistico che le vota e scrive il design finale: silhouette e misure, pezzi
   del corpo nella posa di riposo, colori a tre toni, ogni mossa con i suoi momenti (p da 0 a 1), le abilità nel gioco con i numeri.
2. Due costruttori fanno il modello 3D in due file (`sprite/nemici3d/<boss>2a.js`, `<boss>2b.js`) con la cassetta `C3` di
   `base3d.js` e il metodo dello spaventapasseri; un giudice li confronta sui fogli; il migliore viene rifinito in
   `sprite/nemici3d/<boss>2.js` (modello `<boss>2`), i due file di prova si buttano.
3. Il cervello nuovo nel gioco in un file suo (`src/js/89-golem-nuovo.js` per il Golem), che entra in `src/ordine.txt` solo dopo il sì di
   Denis; fino ad allora sta solo nella copia del gioco dell'anteprima.
4. Prove: foglio con `node tests/foglio3d.js <boss>2 [uscita.png] --file sprite/nemici3d/<boss>2.js` (4 direzioni, fase 2, ogni mossa
   in 8 momenti, tempo di disegno), pagina «prima e dopo» con `python3 anteprime/mk_nemici3d.py --classici`, anteprima giocabile.
5. Dopo il sì: il modello nuovo prende il posto di quello di oggi (stesso nome nel gioco), il disegno di prima resta come
   `N3.meta.<boss>.old` per le pagine; si rifanno le prove dei boss (`tests/bossdie.js`, `tests/anteprime.js`, una partita per capitolo).

## Il Golem di Muschio: «il Colosso della Cripta»

Nome e titolo restano («Golem di Muschio», «Guardiano della prima cripta»). Un colosso di ardesia scolpito nella pietra della cripta,
rimasto in ginocchio per secoli finché il muschio non l'ha coperto come un mantello. Spalle enormi, testa bassa incassata con due occhi
verde menta sotto un sopracciglio di pietra a V, mascella sporgente con due zannette, pugni più grandi della testa appoggiati sulle
nocche, una corona di cinque pietre ritte sulla schiena. Nel petto un **cuore di runa** che batte lento (tum-tum… silenzio): prima di
ogni colpo manda la sua luce lungo le vene di pietra fino al braccio o alle gambe che stanno per colpire. È il suo avviso, e il giocatore
impara a guardarlo. A metà vita il cuore si spacca e dentro c'è la lava. Fa timore perché è una montagna che si muove piano e poi
colpisce forte; la testa resta puntata sull'eroe mentre il corpo ondeggia.

Misure: alto 89 alle spalle e 110 in punta alla pietra ritta più alta (oggi 72; l'Arciere 3D circa 37); largo 110 coi pugni. Ardesia
fredda che si stacca dal pavimento caldo (il Golem di oggi ha quasi il colore del pavimento), arenaria per sopracciglio, mascella e
cornice del cuore, muschio verde vivo sulle spalle e sulla schiena.

### Mosse e abilità

Ogni stato del Golem ha il nome di una mossa del modello; il colpo vero parte nel suo fotogramma. È il primo boss: mai due attacchi
insieme, ogni danno ha un avviso a terra di almeno 0,6 s, dopo ogni mossa almeno 1,1 s di camminata. I danni sono prima di `DMG()`.

| Mossa | Cosa fa | Come si schiva |
|---|---|---|
| **Schianto** (`leap` 1,8 s + `stuck` 1 s) | si gira, salta; un cerchio rosso di raggio 50 con la sua ombra che cresce e sei tacche come un orologio segna dove ricade (26), un anello tratteggiato fin dove arriva l'onda (16, 240 px; 320 nella fase 2). Poi resta coi **pugni incastrati**: i colpi fanno +50% («Colpo al cuore!») | uscire dal cerchio, stare oltre l'anello o scattare mentre passa l'onda |
| **Frana** (`throw` 1,6 s) | strappa una lastra dal pavimento (resta la buca), tre cerchi rossi, la scaglia: in volo si spacca in tre massi (16 ciascuno) che restano a terra 9 s e fanno da riparo (al massimo 6) | uscire dai cerchi |
| **Faglia** (`fault` 1,4 s, nuova) | una striscia rossa verso di te, il pugno batte e una fila di zanne di pietra corre lungo la crepa (16); nella fase 2 tre file a ventaglio | un passo di lato |
| **Valanga** (`curl` 0,8 s, `roll`, `unroll` 1 s) | una striscia larga ti segue e poi si blocca, rotola a 330 px/s rimbalzando 3 volte (4 nella fase 2) e spacca i massi; poi resta senza fiato | uscire dalla striscia; dopo, colpirlo |
| **Raggio del Cuore** (`beam`, solo fase 2) | una linea di mira ti insegue piano, si blocca e lampeggia, poi il raggio esce dal cuore (20) e si ferma contro massi e ostacoli | ripararsi dietro un masso o un passo di lato |
| **Furia** (`rage`, a metà vita) | il cuore si spacca, gli spallacci cadono e restano come massi, ruggito; da lì tutto 1,3 volte più rapido, schegge roventi dopo lo Schianto e a ogni rimbalzo | — |

Ordine: Schianto, Frana, Faglia, Valanga; nella fase 2 subito il Raggio, poi Schianto, Frana, Raggio, Faglia, Valanga (il Raggio viene
sempre dopo la Frana, così ci sono i massi per ripararsi). **Entrata** (`enter`, 3,2 s): una statua in ginocchio in mezzo alle rune che
si risveglia (le pietre ritte si raddrizzano una a una, scrocchia il collo, batte i pugni, ruggisce). **Sconfitta** (`die`, 4 s): torna
pietra e si sbriciola in un tumulo; barra e «sconfitto» al momento clou (2,2 s).

Nel gioco: cerchio di rune verde menta nella fase 1 e arancio nella fase 2 (`RUNEC.golem`), alone e barra più grandi (`B2H.golem` 100),
spenti i sassi, il muschio, il fiorellino e il funghetto in 2D del Golem di prima (il modello disegna tutto).

### File e prove

- Modello: `sprite/nemici3d/golem2.js` (modello `golem2`; esporta anche `N3.golemSlab`, `golemRock`, `golemFang`, `golemShard` per la
  lastra, i massi, le zanne e le schegge, così hanno lo stesso aspetto del Golem).
- Cervello: `src/js/89-golem-nuovo.js` (non ancora in `src/ordine.txt`): `golemUpd` nuovo, pericoli (`G.g2`: avvisi, lastre, massi,
  faglie, zanne, striscia, raggio), entrata, sconfitta, `n3Move` per la palla che rotola e l'entrata. Si accende solo se c'è
  `N3.golem2`.
- Anteprima giocabile: `python3 anteprime/mk_golem2.py` → `anteprime/golem2.html` (pannello «Il Golem nuovo»: «Sfida il Golem», eroe
  forte o invincibile); `--stub` usa il Golem di oggi al posto del modello nuovo (per provare il cervello), `--test` fa
  `tests/golem2_test.html` per le prove.
- Prove: `python3 anteprime/mk_golem2.py --test && node tests/golem2gioco.js` (entrata, tutte le mosse della fase 1 e i loro
  pericoli, furia e Raggio, tempo di disegno della stanza, sconfitta e stanza ripulita; foto `tests/g2_*.png`). Con il modello finto:
  tutte le mosse passano, nessun errore, stanza disegnata in 2,2–2,5 ms.
- Foglio: `node tests/foglio3d.js golem2 tests/g2/golem2.png --file sprite/nemici3d/golem2.js`; pagina «prima e dopo»:
  `python3 anteprime/mk_nemici3d.py --classici` → `anteprime/boss_classici.html`.
