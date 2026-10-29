# Nemici più vivi (29 ottobre)

Denis, alla domanda «cosa possiamo migliorare?»: «Nemici più vivi» («il pezzo che manca della FASE 2: i nemici normali con tutte le mosse
(fermi, camminano, si preparano, attaccano, colpiti, muoiono) e i loro suoni»). Prima nell'anteprima; nel gioco solo dopo il suo sì.

## Le mosse (nei modelli, `sprite/nemici3d/`)

I 26 nemici normali dei quattro capitoli avevano fermo, cammina, attacco, colpito (e alcuni una mossa loro: ululato, scatto, teletrasporto,
evoca, si immerge, esce da terra). Ora hanno anche **«Si prepara»** (`prep`, si ripete finché dura) e **«Muore»** (`die`, una volta, l'ultima
posa resta ferma). Stile della Classica: niente sangue, stelline sopra la testa, colori di sempre.

| Nemico | Si prepara | Muore |
|---|---|---|
| Slime, slime grande, slime di lava | si schiaccia e trema, gli occhi stretti | si scioglie in una pozza (gli occhi spariscono per ultimi) |
| Pipistrello | si alza e si tira indietro, la bocca spalancata, le ali che battono in alto | gira, chiude le ali e cade, steso a terra |
| Goblin | l'arco teso che trema | cede sulle ginocchia, cade di lato tutto intero |
| Pianta | il fiore gonfio e piegato indietro, la bocca spalancata, i petali aperti | il gambo si piega fino a terra, due petali cadono |
| Scheletro, scheletrino | la balestra puntata (lo scheletrino accovacciato per saltare) | trema, polvere d'ossa, un mucchietto d'ossa con lo scudo, il teschio accanto che rotola e ci guarda |
| Fungo | accucciato, il cappello che si gonfia, una luce viola sotto | si piega e cade sul fianco, il cappello giù |
| Fuoco fatuo | si gonfia e brilla | tremola, si rimpicciolisce e si spegne in scintille |
| Scarabeo bomba | la miccia che brucia, il guscio che pulsa | un salto lo rovescia, le zampe in aria, la miccia si spegne in un filo di fumo |
| Fiore occhio | si tira indietro, l'occhio che si arrossa e brilla | il gambo si piega, l'occhio si chiude |
| Occhio d'ombra | l'occhio si apre e si riempie di luce, i viticci dritti, le sfere vicine | gira, affonda e si sfa in fumo viola |
| Negromante | il bastone puntato | cade di lato; nel gioco l'evocazione ha la sua mossa «Evoca» |
| Diavoletto | si tira indietro gonfio, il fuoco che brilla dentro, le ali che battono forte | rotola all'indietro, rimbalza, le ali molli |
| Golem d'ossidiana | accucciato come un toro, raspa il pavimento | le crepe si accendono, i pugni cadono, si spacca e si raffredda |
| Piromante | il bastone puntato | cade di lato |
| Nano bombarolo | la bomba alzata, la miccia | cade di lato con la bomba |
| Rana | la sacca che si gonfia | un salto di spavento e giù a pancia in giù |
| Zanzara | mira, l'addome rosso che trema | le ali si fermano, cade sulla schiena |
| Coccodrillo | la testa alta, le fauci spalancate, la coda che frusta | rotola sul fianco, la pancia in su |
| Lumaca | mezza nel guscio, il guscio che dondola | si chiude nel guscio e il guscio si rovescia |
| Girino | la coda arricciata che vibra | si gira a pancia in su e galleggia |
| Lupo delle nevi | acquattato, orecchie basse, ringhia mostrando le zanne, fiato freddo | cade sul fianco con un rimbalzo, le zampe rigide |
| Spirito della neve | si stringe e brilla, il fiocco che gira veloce | scende a terra, il fiocco gli cade accanto, diventa un mucchietto di neve |
| Sentinella di ghiaccio | i pugni alzati che tremano, la runa che si carica | si crepa con una riga bianca, la testa scivola giù e le cade accanto, i pugni e le schegge a terra |

Nei nemici col corpo dell'Arciere (`umanoidi.js`) le mosse si fanno da fuori (con le mosse che il corpo ha già e `o.tweak`): l'Arciere non
cambia di un pixel. La caduta all'indietro vera in 3D è stata provata e scartata: la testa restava dritta col corpo a terra.

Controlli: fogli in quattro direzioni (`node tests/nemici_mosse.js`), tempi di disegno uguali alle altre mosse (0,3–2,2 ms a disegno sul
computer di prova, nessuna mossa nuova oltre una volta e mezza le altre). Corretta nella cassetta `floor` con trasparenza 0, che disegnava
un'ombra piena (lo `shadow` del gioco prende 0 per «quella di sempre»).

## I suoni (`src/js/97-nemici-vivi.js`)

- **Voci proprie** per i dieci che prendevano in prestito quelle di un altro (attacco, colpito, morte, passi): slime grande (più grave),
  slime di lava (con lo sfrigolio), girino (bollicine), lumaca (guscio che gratta, uno squittio), scheletrino (ossa più piccole e una
  risatina), piromante (fiamma e un «ha!»), fungo (sbuffo di spore), fiore occhio (fruscio e un «blink» bagnato), occhio d'ombra (ronzio
  basso e vetro), golem d'ossidiana (pietra, vetro e sfrigolio).
- **Un verso di «Si prepara»** per ognuno dei 26 (`VOX[tipo].p`): la corda che scricchiola e un «heh» del goblin, i tre scatti della
  balestra, il sussurro del negromante, la miccia e la risatina del nano, la gola della rana, il ringhio del lupo, i campanelli dello
  spirito, il ghiaccio che si carica della sentinella…
- **I suoni di «Muore» nel loro momento** (`NVD`: il tonfo quando tocca terra, il guscio che batte, le ossa che si sparpagliano e il teschio
  che bussa, il ghiaccio che si crepa…), sopra il grido e il suono del materiale che il gioco ha già.
- Misure (`picco` / `volume`, accanto alle voci di prima: goblin 0,053 / 0,0068, lupo 0,141 / 0,0095, colpo 0,359 / 0,0204): versi di
  preparazione da 0,013 a 0,14 di picco, voci nuove da 0,03 a 0,23, morti fino a 0,24 dopo il ritocco; nessun errore dentro i suoni.

## Nel gioco (quando Denis dice sì: `js/97-nemici-vivi.js` in fondo a `src/ordine.txt`)

- **«Si prepara»** quando il gioco dice già che il nemico sta per colpire (`NVP`): il goblin che mira (`e.aim`), lo scheletro fermo che mira
  o prima dello scatto, il fungo che si gonfia (`e.puff`), lo scarabeo con la miccia (`e.arm`), il fiore occhio e il golem d'ossidiana che
  caricano (`e.wind`), l'occhio d'ombra che fissa (`e.stare`), il piromante e la sentinella che lanciano (`e.cast`), il nano con la bomba
  (`e.throwT`), la rana con la sacca (`e.spit`), gli slime un attimo prima del salto, la pianta e il diavoletto un attimo prima di sparare,
  il pipistrello d'élite. Il colpo che segue parte dal suo momento forte (anche per chi non spara un colpo del gioco: le spore del fungo, la
  bomba del nano, la meteora del piromante, il raggio dell'occhio d'ombra, `NVA`); il colpo preso vince sempre. Il negromante che evoca fa la sua
  mossa «Evoca». Il verso di preparazione suona quando comincia.
- **«Muore»**: il corpo recita la mossa del modello dal vivo (al massimo 5 insieme, `NV.live`; gli altri tengono la foto di prima, che
  resta anche la riserva se un modello dà errore), poi sfuma in 0,35 s; chi muore in aria (lo slime a metà salto) scende a terra nel primo
  quarto. Con `LOWFX` niente corpi, come prima.
- Prova nella cartella di lavoro: con cinque corpi dal vivo e uno in foto il disegno della stanza costa 28,2 ms invece di 26,6 (computer di
  prova); nessun errore.

## La pagina per Denis

`python3 anteprime/mk_nemici3d.py --vivi` → `anteprime/vivi.html` (pubblicata su https://claude.ai/artifact/LmWUzGPfCc5VqMGSwqfZLJ, divisa come il gioco con `app/mk_claude.py`): solo i 26 nemici normali, parte da tutto il primo capitolo che recita
le mosse in fila («Tutte le mosse»: fermo, cammina, si prepara, attacca, colpito, muore); «🔊 Suoni» per sentirli; «Gira» (un nemico
grande col dito), «4 direzioni», «Prima e dopo», «Tutti».
