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

## Gli altri dodici (16 ottobre, Denis: «sì, fai gli altri 12»)

Stesso metodo del Golem, un po' più snello e uguale per tutti, in quattro workflow che lavorano insieme (il contenitore ha 4 processori:
2 agenti alla volta per workflow): Salamandra, Re Rospo, Yeti · Strega, Fabbro, Idra · Regina, Mimic, Burattinaio · Fenice, Piovra, Cervo.
Per ogni boss: tre proposte (tre direzioni scritte per lui), il direttore artistico che sceglie e scrive il design, poi **insieme** il
modello 3D (`sprite/nemici3d/<tipo>2.js`) e il cervello (`src/js/89-<nome>-nuovo.js`, provato col modello finto
`anteprime/boss2/<tipo>_stub.js`), due critici sul modello (direzioni e pittura; animazioni e gioco), le correzioni, il collaudo con
modello e cervello insieme (prove, difficoltà contro il boss di oggi, miniatura dell'arena) e la scheda per questo documento.

Attrezzi comuni: `python3 anteprime/mk_boss2.py <tipo ...>|--tutti [--stub] [--test]` (la copia del gioco coi boss rifatti; legge
`index.html` così com'è), `node tests/boss2gioco.js <tipo>` (entrata, mosse della fase 1 e 2, pericoli, disegno, sconfitta, voce),
`node tests/boss2diff.js <tipo>` (eroe fermo che tira contro il boss di oggi e il nuovo: vite perse); ogni cervello si iscrive nel
registro `BCL` (come si entra nella sua stanza, mosse, pericoli, voce). Foglio del boss di oggi: `tests/b2/<tipo>_oggi.png`.

## Nel gioco dal 19 ottobre: Golem, Salamandra, Re Rospo, Yeti

Denis (19 ottobre), alla domanda su cosa fare dei quattro boss pronti: «sì, metti i 4 pronti»; per gli altri nove il **metodo leggero**
(per ogni boss un agente per il modello e uno per il cervello insieme, la critica la faccio io guardando i fogli, poi un solo agente per
correzioni e collaudo; due o tre boss alla volta), per consumare meno.

- In `src/ordine.txt`, prima di `coda.html`: i quattro modelli (`../sprite/nemici3d/golem2.js`, `salamander2.js`, `toad2.js`, `yeti2.js`)
  e poi i quattro cervelli (`js/89-golem-nuovo.js`, `89-salamandra-nuova.js`, `89-rospo-nuovo.js`, `89-yeti-nuovo.js`). Ognuno si accende
  da solo perché c'è il suo modello e prende il posto del boss di prima dappertutto: arene 1–4, Abisso (stanze 5, 15, 25, 35…), trailer,
  guida, anteprime e sblocco delle arene, prologo. Il disegno di prima resta come `N3.meta.<tipo>.old` (per le pagine «prima e dopo»).
- I modelli nuovi sono più grandi di quelli di prima (alti in punta a sc 1: Golem 139 px contro 80, Salamandra 111 contro 78, Re Rospo 170
  contro 87, Yeti 153 contro 106). Nella guida il ritratto li rimpicciolisce (`BEAST2` in `src/js/44-guida.js`); nel prologo il Re Rospo
  sul trono, lo Yeti e la Salamandra al cancello hanno misure e luci degli occhi loro (`PRO_B2` in `src/js/91-prologo.js`; mentre lo Yeti
  ruggisce la luce degli occhi si spegne, bastano i suoi). Le anteprime e lo sblocco delle arene vanno bene così: il boss riempie la stanza.
- `anteprime/mk_boss2.py` con un boss che è già nel gioco usa quello del gioco (lo dice: «cervello e modello sono già nel gioco»).
- La prova delle anteprime (`tests/anteprime.js`) ora ha un salvataggio con gli oggetti e l'eroe (senza, il gioco lo prendeva per un
  giocatore nuovo e il prologo copriva tutto) e aspetta che le porte dello sblocco si aprano.

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

### Come è nato (15–16 ottobre)

- Tre proposte: «il Colosso Antico» (vince, 8,6 su 10), «la Bestia di Pietra» (7,6: troppo simile allo Yeti e richiama la Bestia che
  Denis ha tolto), «il Guardiano delle Rune» (7,1: pezzi che galleggiano, leggero invece che possente). Dalle altre due sono entrati il
  sopracciglio a V, il triangolo di luci (occhi e cuore), il cerchio d'atterraggio con le sei tacche, i fiorellini sul tumulo, le nocche
  che tamburellano, gli spallacci che cadono e fanno da riparo, la bocca buia con la luce in fondo.
- Due modelli dallo stesso design; ha vinto il primo (più fedele, cuore e spallacci che si leggono, disegni per il gioco già pronti),
  rifinito con le idee migliori del secondo (Valanga senza braccia trasparenti, faccia più cattiva, vene sui fianchi del petto, muschio
  più cupo, cumulo della sconfitta).
- Tre critici (direzioni, animazioni, quanto è figo) hanno trovato 55 difetti; corretti i 33 gravi o medi (sopracciglio diviso per lato,
  spallacci a scudo, braccia in quattro pezzi ordinate da dove sta il pugno, pietre ritte sulla gobba, pugni alti nello Schianto, cuore
  che si vede nei Pugni incastrati, luce nelle dita dei piedi, bocca che si apre nel ruggito, occhi che si accendono a testa alta
  nell'entrata, fiatone che si legge, nocche color ardesia, lastra più grande, bordo caldo su tutti i pezzi grandi). Poi: cuore che
  trema 4 volte al secondo prima di spaccarsi (non più un lampeggio da 13), lampo bianco morbido, mascella del Raggio che si apre piano.
- Nel cervello: la palla gira subito dopo ogni rimbalzo, la camminata riparte dal primo passo, il «tum-tum» suona quando il cuore del
  modello batte.

### Misure

- Disegno: mediana 1,2 ms a fotogramma (i boss nuovi 0,6–1,2), la stanza intera col Golem 3,2 ms.
- Difficoltà (arena 1, eroe fermo che tira, livello 4, caso peggiore, 3 prove): Golem di oggi 3,1–4,3 vite a combattimento
  (5,4–6,3 al minuto), nuovo 3,4–4,1 (5,8–6,9 al minuto; più nella prima metà, meno dopo la furia); combattimento di 35–38 s contro
  34–45. Ogni colpo ha il suo avviso, quindi chi si muove ne prende molti meno. Da regolare giocando.
- Voce: tra 0,07 e 0,11 di volume medio, come il Cervo e la Piovra.

### Pagine per Denis

- Il modello, si gira col dito, tutte le mosse, «prima e dopo»: https://claude.ai/artifact/UnHGgjDbpZikqJU7aWcSmL
  (`python3 anteprime/mk_nemici3d.py --classici` → `anteprime/boss_classici.html`).
- Sfida il Golem dal telefono: https://claude.ai/artifact/7c7LspnByt8aFQKoru5SWa (`python3 anteprime/mk_boss2.py golem` →
  `anteprime/golem2.html`).

### File e prove

- Modello: `sprite/nemici3d/golem2.js` (modello `golem2`; esporta anche `N3.golemSlab`, `golemRock`, `golemFang`, `golemShard` per la
  lastra, i massi, le zanne e le schegge, così hanno lo stesso aspetto del Golem).
- Cervello: `src/js/89-golem-nuovo.js` (non ancora in `src/ordine.txt`): `golemUpd` nuovo, pericoli (`G.g2`: avvisi, lastre, massi,
  faglie, zanne, striscia, raggio), entrata, sconfitta, `n3Move` per la palla che rotola e l'entrata. Si accende solo se c'è
  `N3.golem2`.
- Anteprima giocabile: `python3 anteprime/mk_boss2.py golem` → `anteprime/golem2.html` (pannello: «Sfida il Golem», eroe forte o
  invincibile); `--stub` usa il modello finto `anteprime/boss2/golem_stub.js` (il Golem di oggi che fa le mosse nuove) per provare il
  cervello, `--test` fa `tests/golem2_test.html` per le prove, `--tutti` mette tutti i boss rifatti in una pagina sola.
- Prove: `python3 anteprime/mk_boss2.py golem --test && node tests/boss2gioco.js golem` (entrata, tutte le mosse della fase 1 e i loro
  pericoli, furia e Raggio, tempo di disegno della stanza, sconfitta e stanza ripulita; foto `tests/g2_*.png`). Con il modello finto:
  tutte le mosse passano, nessun errore, stanza disegnata in 2,2–2,5 ms.
- Foglio: `node tests/foglio3d.js golem2 tests/g2/golem2.png --file sprite/nemici3d/golem2.js`; pagina «prima e dopo»:
  `python3 anteprime/mk_nemici3d.py --classici` → `anteprime/boss_classici.html`. Anteprime delle arene con il Golem nuovo:
  `node tests/anteprime.js golem2_test.html`. Difficoltà contro il boss di oggi: `node tests/boss2diff.js golem`.
- Voce e personalità come i 4 boss nuovi (in `89-golem-nuovo.js`, con `B3VO` di `88-boss3-voci.js`): ruggito di pietra con la pietra
  che stride sotto, «hm-hm-hm» quando ti prende in giro (mossa `taunt`), brontolio quando gli stai lontano, un verso per ogni colpo dopo
  il battito del cuore, rabbia, lamento della sconfitta, «ho… ho… ho» se cadi.
