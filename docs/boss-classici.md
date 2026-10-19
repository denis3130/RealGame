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

## Pronti per il gioco (19 ottobre): Golem, Salamandra, Re Rospo, Yeti (non ancora in `src/ordine.txt`)

Denis (19 ottobre), in questa sessione: «sì, metti i 4 pronti» e per gli altri nove il **metodo leggero** (per ogni boss un agente per il
modello e uno per il cervello insieme, la critica fatta guardando i fogli, poi un solo agente per correzioni e collaudo). Poi, nell'altra
sessione (`session_01NzD5NzkcNh3pmk6QqLSVHu`, quella che fa il Fabbro): boss «da solo, senza agenti», «tutti alla fine» (una pagina con tutti
i boss alla fine) e, su questa sessione, «fermala, fai tutto tu»; qui, alla domanda, «finisci lo Yeti e fermati». Quindi i quattro boss
sono **finiti e collaudati ma non sono nel gioco**: ce li mette l'altra sessione quando Denis dice sì.

- Per metterli nel gioco: in `src/ordine.txt`, prima di `coda.html`, i quattro modelli (`../sprite/nemici3d/golem2.js`, `salamander2.js`,
  `toad2.js`, `yeti2.js`) e poi i quattro cervelli (`js/89-golem-nuovo.js`, `89-salamandra-nuova.js`, `89-rospo-nuovo.js`,
  `89-yeti-nuovo.js`); con i boss fatti dopo, prima `../sprite/nemici3d/boss2kit.js` (la cassetta comune dell'altra sessione). Ognuno si
  accende da solo perché c'è il suo modello e prende il posto del boss di prima dappertutto: arene 1–4, Abisso (stanze 5, 15, 25, 35…),
  trailer, guida, anteprime e sblocco delle arene, prologo. Il disegno di prima resta come `N3.meta.<tipo>.old` (per le pagine «prima e
  dopo»). Va aggiornata la riga «ANTEPRIMA» in cima ai cervelli.
- **Provato così in una copia a parte** (una cartella di lavoro con i quattro in `src/ordine.txt`, 19 ottobre): `boss2gioco.js` dei quattro
  tutto OK, nessun errore (alla Salamandra mancava la voce della presa in giro, poi corretta dalla sua rifinitura); il giocatore automatico
  (`run.js arena`, coppe 100, 400, 800, 1.300) vince le arene 1–4 contro i boss nuovi, con le righe di vittoria nuove; nell'Abisso le
  stanze 5, 15, 25 e 35 col boss nuovo: entrata, tutte le mosse, fase 2, sconfitta e stanza ripulita; `bossdie.js` dei quattro, `boss1x.js`,
  `bossbig.js`, `meta2.js` (tutto OK), `menu2.js` e `menu3.js` senza errori; il trailer (38) senza errori. `bossx.js` dice «mossa in più
  vista 0»: i boss rifatti stanno in `B3S` (per la voce), e `B3S` spegne l'anello di sfere di `bossExtra` (81-boss3-base.js). Per questi
  quattro non conta (arene 1–4, Abisso e sfida hanno il livello 0), per Strega, Fabbro, Idra e Regina (arene 5–8) sì: va deciso se
  tenerlo spento (le loro mosse lo sostituiscono; la difficoltà misurata della Strega senza anello è giusta) o riaccenderlo.
- **Già adattati nel gioco** (nei file del gioco, funzionano solo quando i modelli nuovi ci sono): nel prologo il Re Rospo sul trono, lo Yeti
  e la Salamandra al cancello hanno misure e luci degli occhi loro (`PRO_B2` in `src/js/91-prologo.js`; mentre lo Yeti ruggisce la luce degli
  occhi si spegne, bastano i suoi; provato anche su 360×640); nella guida il ritratto dei boss rifatti è rimpicciolito (`BEAST2` in
  `src/js/44-guida.js`: i modelli nuovi sono alti in punta, a sc 1, Golem 139 px contro 80, Salamandra 111 contro 78, Re Rospo 170 contro
  87, Yeti 153 contro 106) e le righe di Golem, Salamandra, Re Rospo e Yeti dicono le mosse nuove. Alcuni cervelli (Re Rospo, Strega,
  Regina, Fenice e il Fabbro) riscrivono anche loro la riga della guida (`BEST.find(...)`), con testi più lunghi che allungano le schede
  vicine: va scelto un posto solo. Le anteprime e lo sblocco delle arene vanno bene così (il boss riempie la stanza; nella miniatura
  dell'arena 3 le punte delle tife del Re Rospo arrivano al bordo alto).
- `anteprime/mk_boss2.py` con un boss che è già nel gioco usa quello del gioco (lo dice: «cervello e modello sono già nel gioco»).
- La prova delle anteprime (`tests/anteprime.js`) ora ha un salvataggio con gli oggetti e l'eroe (senza, il gioco lo prendeva per un
  giocatore nuovo e il prologo copriva tutto) e aspetta che le porte dello sblocco si aprano.

## Passaggio all'altra sessione (19 ottobre sera)

Lo stato dei boss lasciato da questa sessione (`session_01Dgjf4PuqZowPts7C7dSiaz`):

| Boss | Modello | Cervello | Stato |
|---|---|---|---|
| Golem | `golem2.js` | `89-golem-nuovo.js` | approvato da Denis, finito |
| Salamandra | `salamander2.js` | `89-salamandra-nuova.js` | finita: critici, correzioni e collaudo (scheda sotto) |
| Re Rospo | `toad2.js` | `89-rospo-nuovo.js` | finito: critici, correzioni e collaudo (scheda sotto) |
| Yeti | `yeti2.js` | `89-yeti-nuovo.js` | finito: critici, correzioni e collaudo (scheda sotto) |
| Strega | `witch2.js` | `89-strega-nuova.js` | costruiti col metodo leggero, prove OK col modello vero; **la critica sotto non è ancora corretta** |
| Regina | `icequeen2.js` | `89-regina-nuova.js` | a metà (16 ottobre, fermati dal limite settimanale): foglio `tests/b2/icequeen2_stato.png` |
| Fenice | `phoenix2.js` | `89-fenice-nuova.js` | modello a metà, cervello finito (16 ottobre): foglio `tests/b2/phoenix2_stato.png` |
| Fabbro | `smith2.js` | `89-fabbro-nuovo.js` | fatto dall'altra sessione |
| Idra, Mimic, Burattinaio, Piovra, Cervo | — | — | da fare (i design sono in `docs/boss-classici-design/`) |

### La Strega: com'è e cosa resta da correggere

Costruita il 19 ottobre: modello rifatto partendo da quello a metà (16 mosse del design; disegno da 2,1 a 1,2 ms, pari al Golem; 16
direzioni, tutte le mosse a 100 passi senza salti, idle, walk e fin che si richiudono, LOWFX, 15.484 chiamate senza errori), cervello
controllato contro il design (servitori che appassiscono senza oro, scoppio d'autunno menta e arancio, voci tra 0,07 e 0,12).
`boss2gioco.js witch` col modello vero: tutto OK, ERR []; `boss2diff.js witch` (arena 5, eroe fermo, caso peggiore): oggi 7,4 vite a
combattimento (3,26 al minuto, 135 s), nuova 6,7 (3,21 al minuto, 125 s; più gentile nella fase 1, più dura nella fase 2), vita 2.900.
Fogli: `tests/b2/witch2.png`, `witch2_16dir.png`, `witch2_sc1.png`, `witch2_disegni.png`; foto `tests/b2g_witch_*.png`.

La critica sui fogli (da fare):
1. **Fase 2, la gonna a righe**: nel giro alto dell'abito la corteccia ha righe arancio verticali dritte e uguali; a sc 1 sembra una gonna a
   righe. Vene di brace come crepe storte che si ramificano (poche, spessore che cambia, più fitte in basso), o foglie d'autunno arricciate.
2. **Le mani bianco gesso** sono le macchie più chiare della figura e sembrano guanti o ossa: pelle del viso (menta pallido) un tono più
   scura nelle ombre, nocche segnate, unghie prugna; il chiaro solo sul bordo illuminato.
3. **Mano del Bosco**: il braccio che affonda nel pavimento (hand .29–.86) diventa un palo dritto e lunghissimo, sembra un bastone: gomito
   piegato, l'avambraccio che si apre in radici attorcigliate dentro il pavimento con la luce menta che scorre, un piccolo cumulo di terra.
4. **Sconfitta poco spettacolare** (l'albero grigio-bruno spento): foglie dell'abito che cadono a ondate, l'ultima luce menta che sale dal
   petto e si spegne in alto (luce morbida), radichette che si ritirano; alla fine due o tre foglie d'autunno e la lucina viola che si spegne.
5. Piccoli: la pinna (18 px a sc 1) con la luce viola in cima un po' più forte; il Rito delle Rune sul foglio coi colori della fase 1
   (controllare che nel gioco sia sempre d'autunno); le foglie dell'abito tutte uguali come le squame di una pigna (un po' di varietà).
6. Dubbi del costruttore: le guardiane della fase 2 e le radici del Rito in verticale sullo schermo sembrano pali (`N3.witchRoot`); la
   spina in volo è piccola (12 px, come da design); in rise .55–.60 le mani passano veloci davanti al mento.

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

## La Salamandra di Lava: «la Regina del Vulcano»

Nome e titolo restano: «Salamandra di Lava», «Regina delle pendici». È una salamandra pezzata enorme, carminio e oro, che sta dritta come su un trono. È lunga 172, quattro eroi e mezzo, e la corona arriva a 92 da ferma e a 124 da ritta; nel gioco è alta 111 px in punta, contro i 78 di oggi.

Porta tre segni da regina cresciuti sul corpo:
- una corona di cinque punte d'ossidiana viola scuro, incastonata nel cranio;
- una gorgiera di dieci petali di magma intorno al collo, che è il suo cuore;
- lo scettro, una goccia d'ossidiana in punta alla coda lunghissima.

Ha occhi grandi color ambra, con la fessura e la lucina, sotto sopracciglia d'ossidiana a V. Il sorriso è lunghissimo, da regina cattiva, con un filo di luce di fornace tra le labbra e due zannette. Sulla schiena ha sette placche d'ossidiana con le fessure di magma, sui fianchi macchie d'oro, il ventre è d'oro. Si muove lenta e solenne, con la testa sempre puntata su di te, poi colpisce all'improvviso.

**Il segnale**: prima di ogni colpo il collare si apre come un sole e la sua luce corre nella parte che colpirà:
- nella gola → Sputafuoco;
- giù per la schiena fino allo scettro, che diventa bianco → Frustata;
- nelle zampe davanti, col collare piegato a elmo → Tuffo;
- nelle macchie, col collare steso a cometa → Anello;
- dallo scettro alla corona → Eruzione.

Dopo l'Anello il collare diventa grigio e molle e sfiata vapore: è il momento di colpirla.

Resta della Classica: forme da giocattolo, colori pieni, niente sangue né ferite. La muta è una pelle vuota e liscia, la sconfitta è pietra che si raffredda.

### Mosse e abilità

Ogni stato ha il nome di una mossa del modello, e il colpo vero parte nel suo fotogramma.

Regole per tutto il combattimento:
- È il primo boss del vulcano: mai due attacchi insieme.
- Ogni danno ha un avviso a terra di almeno 0,6 s, calcolato sulla velocità più alta.
- Dopo ogni mossa cammina 1,1–1,5 s (fase 2: 1,0–1,3).
- I danni sono prima di `DMG()`.
- Vita 2.600, contatto 22, oro 50, come oggi; raggio 30.

Come cammina:
- Va a 50 px/s e ti gira intorno tra 110 e 170 px.
- La punta della coda striscia e lascia uno strascico di fuoco: un fuocherello ogni 0,3 s, che dura 1,4 s (fase 2: 2,2 s).
- Le zampe davanti lasciano orme che si accendono.

I suoi fuochi a terra:
- Fanno 4 ogni mezzo secondo, ma solo dove il magma è ancora acceso.
- Il magma si ritira dal bordo, così si vede quanto dura; la crosta nera non fa male.
- Al massimo 40 fuochi insieme, 24 con LOWFX.

| Mossa | Cosa fa | Come si schiva |
|---|---|---|
| **Sputafuoco** (`spit` 2 s) | si alza sulle zampe davanti e la luce le sale nella gola; un cono rosso largo 46° e lungo almeno 240 px va dalla bocca verso di te e si riempie; tre ventagli di palle di magma escono dalla bocca a .42, .58 e .74: 5, 4 e 5 palle, gli uni negli spazi degli altri; le palle vanno a 165 px/s e fanno 12 | uscire dal cono di lato |
| **Frustata** (`whip` 1,7 s) | si gira di spalle, con la coda alzata come uno scorpione, e ti guarda da sopra la spalla; dietro di lei una mezzaluna rossa (da 40 a 150 px, larga 200°) si riempie nel verso della spazzata, con la freccia; a .66 la coda spazza il pavimento: 18 di danno e 5 fuochi lungo l'arco, e spacca le pietre, anche la pelle vecchia. Se sei lontano e dopo tocca al Tuffo, prima il Tuffo e subito dopo la Frustata; se no scatta verso di te (230 px/s, al massimo 0,9 s). Fuori turno: se le stai a meno di 110 px per 0,8 s (al massimo una volta ogni 5 s) | uscire oltre la mezzaluna o scattare attraverso la coda |
| **Tuffo di lava** (`burrow` 0,8 s, `swim`, `breach` 1,7 s) | si tuffa (si può colpire fino a metà); sotto il pavimento resta solo la corona, che taglia la pietra come una pinna, con due occhi ambra a filo del pavimento; ti viene incontro a 130 px/s, gira al massimo di 2,5 rad/s, e si ferma dopo 1,4 s o a 40 px da te; la pinna non fa male. Dove si ferma compare un cerchio rosso di raggio 48 con sei tacche e il pavimento che ribolle. A .48 esplode fuori da una colonna di lava: 22 nel cerchio, un anello di 10 palle (140 px/s, 12), una pozza di magma per 4 s | uscire dal cerchio, poi evitare le palle |
| **Anello di fuoco** (`crouch` 0,9 s, `run`, `pant` 1,4 s) | si acquatta col collare a cometa; intorno a te compare un anello rosso tratteggiato (raggio 95–125) con un varco di 60° segnato da due paletti di luce e la freccia del verso; lei ci corre sopra a 300 px/s e lascia un muro di fuoco che resta 2,2 s dopo il giro (se ti investe, 22); poi si ferma sul varco col **collare freddo**: fino a .80 i colpi fanno +50%, e la prima volta compare la scritta «Il collare è freddo!». Contro un muro l'anello ti passa accanto; solo in un angolo fa il giro della stanza | restare dentro (dentro non arriva niente), uscire dal varco prima che si chiuda o scattare attraverso il fuoco |
| **Eruzione** (`erupt` 2,2 s, solo fase 2) | beve il suo fuoco dal pavimento entro 260 px (le braci le scivolano fino alle zampe); si alza ritta fino a 124, ruggisce al cielo e la corona divampa; poi tre onde di cerchi rossi: 6, 9 e 12 geyser a 85, 160 e 235 px da lei, più uno sotto di te; scoppiano a .56, .70 e .84 e fanno 18, al massimo un colpo per onda; ogni geyser lascia una goccia di fuoco | stare nei varchi tra i geyser o scattare oltre un'onda; mai restare fermi |
| **Frustata doppia** (`whip2` 2,8 s, fase 2) | la spazzata a .53 (18); poi una striscia rossa lunga 240 px verso di te, e a .85 lo schiocco della coda in linea (20 e una fila di fuochi lungo la striscia) | prima uscire dalla mezzaluna, poi un passo di lato |
| **Salto del delfino** (`leap` 1,9 s, fase 2, al posto dell'uscita del Tuffo) | esplode dal primo cerchio a .43 (22 e un anello di 12 palle); fa un arco di 120 px verso di te, alto fino a 70; ricade di testa nel secondo cerchio, raggio 40, segnato da .25 (a .80: 18 e un anello di 8 palle); lascia due pozze | uscire da tutti e due i cerchi |

**Fase 2, la Muta** (`rage` 3 s): a metà vita, appena è calma (mentre cammina, sputa, ha il collare freddo o ti prende in giro), cambia pelle.
- Si contorce sibilando; la pelle vecchia si spacca lungo la schiena e diventa grigia.
- Scivola fuori in avanti, incandescente, e le punte della corona si accendono una a una. Esce il banner «La Regina cambia pelle!» · «Fase 2», la barra diventa rossa e il cerchio di rune oro bianco. Mentre fa la muta non si può colpire.
- La pelle vuota resta 15 s dove era lei. Dentro ci sono due pietre che fermano palle e frecce: è un riparo per i ventagli grandi. La Frustata la spacca.
- Da lì tutto va 1,25 volte più veloce. I ventagli sono larghi 60°, con 7, 6 e 7 palle a 185 px/s. Il varco dell'Anello è di 40°, e durante il giro sputa tre palle. Lo strascico dura di più.
- Pelle rosso-arancio con isole di crosta, ventre oro chiaro, corona in fiamme, collare sempre aperto: più rossa della Fenice, così non si confondono.

**Ordine delle mosse**:
- Fase 1: Sputafuoco, Frustata, Tuffo, Sputafuoco, Anello. Se alla Frustata sei lontano, prima il Tuffo e poi la Frustata.
- Fase 2: subito l'Eruzione, poi la Frustata doppia e il Tuffo col salto. Poi in giro: Sputafuoco, Anello, Frustata doppia, Tuffo, Eruzione. L'Eruzione viene dopo il Tuffo, quando c'è fuoco da bere.

**Entrata** (`enter`, 3,4 s; non si può colpire):
- Le crepe di lava della stanza si accendono e la loro luce corre al centro, dove si apre una pozza di magma.
- Escono le cinque punte della corona, una dopo l'altra, con tre «tin».
- Nella lava si aprono due occhi ambra: guardano a sinistra, a destra, poi te.
- Sale la testa colante e lei esce dalla pozza; il collare si accende petalo per petalo.
- Si alza ritta, apre il collare a sole e ruggisce, con tre anelli bianchi.
- Ricade e frusta il pavimento dietro di sé. Dove c'era la pozza resta un cratere bruciato.

**Sconfitta** (`die`, 4 s, momento clou a 2,3 s):
- Si inarca sibilando; il collare si apre e si chiude a scatti.
- La luce se ne va dalla coda alla testa, con uno sbuffo di vapore da ogni fessura; le fiammelle della corona si spengono una a una.
- Tossisce un anellino di fumo.
- La corona si stacca, cade, rimbalza, gira e si ferma quasi dritta accanto al muso: è il momento clou, col tintinnio di vetro e «sconfitto».
- Gli occhi si spengono e il corpo, ormai d'ossidiana, si affloscia in un mucchio di rocce nere lucide.
- L'ultima brace gira sopra la corona e si infila in una crepa; le crepe di lava della stanza si spengono una a una.
- Il mucchio e la corona restano nel pavimento.

**Presa in giro** (`taunt`, 1,2 s):
- Quando ti colpisce alza il mento e ti guarda dall'alto con le palpebre a metà, la regina annoiata.
- Soffia due anelli di fumo verso di te e batte due volte la punta della coda («hsss-hsss-hsss»).
- Se non la colpisci per 7 s ti chiama: tre colpi secchi e un sibilo.
- Mai con te addosso.

**Voce** (`B3VO.VB.salamander`): un sibilo regale da rettile, con le fusa sotto e la lava che gorgoglia.
- Grido dell'entrata e rabbia della muta.
- Risata quando ti colpisce, chiamata quando le stai lontano.
- «Ksss!» quando la colpisci forte, risata lenta se cadi.
- Lamento della sconfitta, che diventa lo sfrigolio dell'acqua sulla pietra calda.
- Un verso per ogni mossa, più il soffio di mantice del collare: «fff» quando si apre, «vuff» quando si piega.
- Volume medio 0,065–0,115 (mediana 0,095), come il Cervo (0,095) e la Piovra (0,102).

**Nel gioco**:
- Cerchio di rune arancio rosso e oro bianco (`RUNEC.magma`), alone e barra più grandi (`B2H` 92). La barra si rompe in schegge d'ossidiana e braci (`BBFX`). Luce più forte e larga; sotto terra niente ombra né alone.
- Spenti i pezzi 2D della Salamandra di prima: strascico di fiamme, braci e fumo, fiammelle della fase 2, cerchio e ombra del Tuffo, reazioni del Tuffo, sconfitta in cenere ed entrata.
- L'arena reagisce: orme accese; erba bruciata e legno acceso dallo strascico; torce che virano al suo rosso quando il collare si apre; bruciature, cenere e basalto scheggiato dalla Frustata; cratere, pezzi di lava e torce bianco-oro all'uscita del Tuffo; un anello di bruciature; tutte le crepe di lava accese nell'Eruzione e spente nella sconfitta.
- Funziona anche nell'Abisso (stanze 15, 55, 95…).

### Come è nata (16–19 ottobre)

- Tre proposte: «la regina» ha vinto con 8,7 su 10, poi «lo spirito» (7,9: un axolotl con le branchie di fiamma, più tenero che temibile) e «la bestia» (7,3: la fornace nella pancia non si vede dalla telecamera e somiglia al Golem).
- Dallo «spirito» sono entrati: gli occhi a filo del pavimento dietro la pinna, gli occhi che si aprono nella lava nell'entrata, il cerchio d'uscita con le sei tacche del Golem, l'anello intorno all'eroe col varco, l'ultima brace che torna nel vulcano, il fuoco «caldo fa male, nero no».
- Dalla «bestia» sono entrati: il sorriso con la luce della fornace, il fuoco bevuto prima dell'Eruzione, il colpo di tosse prima che cada la corona, la Frustata fuori turno, le orme accese.
- Due critici (direzioni e pittura; animazioni e gioco) hanno trovato 43 problemi: 6 gravi, 18 medi, 19 piccoli. Sono stati corretti tutti tranne uno: gli occhi a terra visti di lato stanno uno sopra l'altro, ed è la proiezione giusta. Tra i gravi: il collare che di lato e da dietro non si leggeva, lo spacco della muta che sembrava carne aperta, le pose ritte da «salsicciotto», l'Anello piegato al contrario, la coda che saltava a ogni cambio di mossa, le fiammelle accese nella sconfitta.
- Collaudo nel gioco (19 ottobre): se sei lontano la Frustata viene dopo il Tuffo (prima chi teneva la distanza non la vedeva quasi mai); l'Anello funziona anche contro un muro; la corona caduta si ferma dritta e girata verso la telecamera (prima, sdraiata, sembrava un artiglio nero sotto il mento).

### Misure

- **Disegno**: nella stessa pagina, alternata col Golem approvato, la mediana è 1,4 ms contro 1,3 (rapporto 1,08), con la macchina carica; a macchina scarica 1,1. Le mosse più care sono l'Eruzione (1,9), la Muta (1,8) e la Frustata doppia (1,7); la pinna costa 0,4. La stanza intera col boss costa 2,6–5,1 ms secondo il carico (il Golem 3,2).
- **Difficoltà** (arena 2, eroe fermo che tira, livello 4, caso peggiore, 3 prove):
  - Salamandra di oggi: 14,3–16,4 vite a combattimento (9,6–10,1 al minuto), 87–98 s.
  - Nuova: 6,0–6,5 vite (4,0–4,7 al minuto; nella fase 1 2,7–3,5), 82–90 s.
  - Per confronto, il Golem nuovo nell'arena 1: 3,4–4,1.
  - Ogni colpo ha il suo avviso, quindi chi si muove ne prende molti meno. Da regolare giocando.

### File e prove

- Modello: `sprite/nemici3d/salamander2.js` (modello `salamander2`). Esporta anche `N3.salamanderGlob`, `salamanderGeyser`, `salamanderPool`, `salamanderHusk` e `salamanderPrint` (palla, geyser, fuochi a terra, pelle vecchia, orma), così hanno lo stesso aspetto della Salamandra.
- Cervello: `src/js/89-salamandra-nuova.js`. Si accende solo se c'è `N3.salamander2`; allora prende il posto della Salamandra di prima, e il disegno vecchio resta come `N3.meta.salamander.old`.
- Modello finto: `anteprime/boss2/salamander_stub.js`.
- Pagina per provarla: `python3 anteprime/mk_boss2.py salamander` crea `anteprime/salamander2.html`; con `--test` crea `tests/salamander2_test.html`.
- Prove:
  - `node tests/boss2gioco.js salamander`
  - `node tests/boss2diff.js salamander`
  - `node tests/anteprime.js salamander2_test.html`
  - foglio: `node tests/foglio3d.js salamander2 tests/b2/salamander2_finale.png --file sprite/nemici3d/salamander2.js`
- Momenti nel gioco: `tests/b2/salamander2_gioco.png`. Corona caduta in 16 direzioni: `tests/b2/salamander2_corona_caduta.png`.

## Il Re Rospo: «il Tiranno delle Lucciole»

Nome e titolo restano: «Re Rospo», «Sovrano della palude». È il rospo più grosso e prepotente della Palude delle Lucciole. Per diventare re
si è ingozzato delle lucciole della sua palude: per questo è enorme, e la loro luce gli vive dentro, nella pancia che brilla come una
lanterna e nelle verruche della schiena. Siede come su un trono:
- una corona d'oro troppo piccola e storta, con una gemma-lucciola;
- una cappa corta di velluto di tifa col bordo di piumino bianco (il suo ermellino);
- un colletto di sette tife ritte dietro la testa.

Ti guarda dall'alto in basso, con le palpebre a mezz'asta sotto due creste ossee e un sorriso storto con due zannette, e ogni tanto si
lecca le labbra. Fa paura perché è una montagna che ti piomba addosso e la sua lingua attraversa mezza stanza. Resta un boss della
Classica: forme tonde, occhi con la lucina, niente sangue né ferite.

Misure:
- alto 75 alla testa, 92 alla corona, 116 in punta alla tifa più alta (l'Arciere 3D è alto 37);
- largo 124 con le cosce;
- nella fase 2 tutto il 12% più grande;
- nel gioco raggio 40.

Si legge in tre macchie: l'ovale crema della pancia accesa, la massa verde scura con le lucine sulla schiena, l'oro di corona e bracciali.
La pelle è di un verde profondo con le ombre fredde, così gli occhi ambra e le verruche-lucciole si accendono. Nella fase 2 la pelle diventa
più fredda e la luce diventa brace arancio: occhi rossi, ghiandole accese, piumino luminoso al posto delle spighe.

**Il suo avviso**, come il cuore del Golem: prima di ogni colpo la luce delle lucciole gli corre sotto la pelle fino al punto da cui partirà.
È una perla di luce con un alone scuro, e la pancia intanto si spegne. Insieme gli occhi si spalancano e si sente un tintinnio di vetro.

### Mosse e abilità

Ogni stato ha il nome di una mossa del modello, e il modello va con l'orologio del cervello: il colpo vero parte nel fotogramma del gesto.
Regole:
- mai due attacchi insieme;
- ogni danno ha un avviso a terra di almeno 0,6 s, anche nella fase 2;
- dopo ogni mossa almeno 1 s di camminata (0,8 s nella fase 2);
- i danni sono quelli prima di `DMG()`.

| Mossa | Cosa fa | Come si schiva |
|---|---|---|
| **Linguata** (`tongue` 1,6 s) | una striscia rossa larga 24 lo segue, girando al massimo di 140° al secondo; si blocca a .30 e pulsa. A .55 la lingua corre lungo la striscia, fino a 300 px o al primo ostacolo: 20 danni. Se ti prende ti tira davanti a lui e poi ti prende in giro; uno scatto mentre ti tira ti stacca («Strappo!») | un passo di lato dopo il blocco (0,4 s; 0,32 s nella fase 2), uno scatto, o un albero morto tra te e lui |
| **Lingua incollata** (`stuck` 1,1 s) | se ti manca, la lingua resta attaccata a terra, al muro o a un albero, che trema. È indifeso: fino a .70 i colpi fanno +50% («Lingua incollata!»). Poi la lingua torna indietro come un elastico | colpirlo |
| **Panciata** (`flop` 2 s) | un cerchio rosso di raggio 56 ti segue (220 px/s) fino a .30, con l'ombra che cresce, sei tacche e le sue tre lucciole che ci girano sopra. Un anello tratteggiato a 240 px segna l'onda. Salta fino a 150 px (sopra i 30 non si può colpire) e a .75 ricade di pancia: 26 nel cerchio, onda d'acqua da 16, tre chiazze di fango che per 4 s ti rallentano al 55% (al massimo 6) | uscire dal cerchio dopo il blocco (0,9 s; 0,72 s nella fase 2), stare oltre l'anello o scattare quando passa l'onda |
| **Rutto di bolle** (`bubbles` 1,8 s) | la sacca diventa una lanterna; un ventaglio rosso di 100° e 260 px segue la sua faccia fino a .40. A .60 escono dalla bocca due file di bolle con dentro una lucciola: 5 a 70 px/s e 4 a 100 px/s (7 e 6 nella fase 2). Ogni bolla fa 12, dura 5 s e scoppia contro muri, ostacoli e l'eroe; al massimo 13 nella stanza | uscire dal ventaglio, oppure passare nei varchi tra le due file |
| **Tamburo di pancia** (`drum` 2,6 s) | batte la pancia a .32, .52 e .74 (quattro colpi nella fase 2). A ogni colpo parte un anello d'acqua basso da 40 a 280 px (190 px/s, l'ultimo 160) che fa 14. C'è un corridoio chiaro largo 70° (60° nella fase 2) dove l'onda non arriva: non punta mai verso di te ma a 45–75° da te, dal lato con più pavimento, e nella fase 2 gira di 15° a ogni anello. L'ultimo anello è intero. Poi indica le pozze lontane da te: ribollono 0,8 s e ne saltano fuori 3 girini (4 nella fase 2, al massimo 7 vivi) | stare nel corridoio, poi scattare attraverso l'ultimo anello o stare oltre i 280 px |
| **Frustata** (`sweep` 1,6 s, solo fase 2, al posto di una Linguata su due) | un ventaglio rosso di 110° e 230 px ti segue fino a .30, poi si riempie dal lato da cui partirà la lingua; una freccia dice il verso. Da .52 a .70 la lingua spazza il ventaglio: 18 danni e ti spinge via | andargli dietro, stare oltre i 230 px, o scattare attraverso la lingua |
| **Tripla Panciata** (fase 2) | tre panciate di fila. La seconda e la terza ripartono subito dalla pancia schiacciata, e ogni cerchio ti insegue di nuovo. Le prime due fanno 26 e lasciano due chiazze. La terza, la Panciata Reale, ha un cerchio di 70, fa 30, ha l'onda fino a 300 px e fa cadere rametti dall'alto | come la Panciata, tre volte |
| **Pioggia di lucciole** (`rain` 2,4 s, solo fase 2) | tre colpi di tosse lanciano lucciole arancio in cielo. Ricadono in sette cerchi rossi di raggio 26: il primo sotto di te, tre intorno a lui a 70–110 px lasciando i varchi, tre dove sei in quel momento. Ogni cerchio avvisa 0,9 s, con una scia di luce che scende, poi fa 16 | uscire dal mucchio e continuare a muoversi, o scattare |
| **Furia** (`rage` 3 s, a metà vita) | non fa danni e non si può colpire. Batte i pugni a terra e si mangia le lucciole della stanza, che però non si scurisce. Si gonfia del 12%, la luce diventa brace e le torce arancio, gracida forte con la sacca accesa, e le spighe delle tife diventano piumino luminoso. Da lì tutto va 1,25 volte più rapido | — |

- Contatto: 22 col raggio 40. Vita 3.500 × arena, oro 70, come oggi.
- Ordine delle mosse:
  - fase 1: Linguata, Panciata, Rutto, Linguata, Tamburo, Panciata;
  - fase 2: Pioggia (sempre la prima dopo la Furia), Frustata, Tripla Panciata, Rutto, Linguata, Tamburo.
- La camminata:
  - nella fase 1 striscia a quattro zampe come un lottatore di sumo, a 34 px/s;
  - nella fase 2 avanza a balzi pesanti di circa 45 px;
  - dopo il Rutto cammina 1,4–1,8 s, dopo il Tamburo 1,2–1,6 s.

**Entrata** (`enter`, 3,4 s):
- le lucciole della stanza girano a spirale sopra il cerchio di rune;
- a 1,53 s cade dal cielo di pancia: la stanza trema e le pozze schizzano;
- le sette tife scattano su una dopo l'altra;
- a 2,31 s la corona gli ricade in testa, storta, con un «clink»;
- a 2,52 s gonfia la sacca accesa e lancia il gracidio reale;
- alla fine tamburella due dita sulla pancia.

**Sconfitta** (`die`, 4 s):
- barcolla; la corona vola via e cade a terra davanti alla sua sinistra;
- si gonfia tremando fino a 1,45 volte, con gli occhi che sporgono dalla paura, e le tife saltano via come tappi;
- a 2 s arrivano la barra e «sconfitto»: il rutto enorme a bocca tonda verso il cielo, e 40 lucciole (12 con LOWFX) volano per la stanza e ci restano: la palude si riaccende;
- si sgonfia come un pallone e la cappa gli scivola giù;
- torna un rospetto qualunque, che si tuffa nel fango;
- a terra resta la corona, con una lucciola sopra che lampeggia.

**Voce** (come i boss nuovi, `B3VO`): un vocione di gola col trillo della sacca, mai gorgoglio, che è della Piovra.
- il gracidio reale nell'entrata;
- «gro-gro-gro» quando ti colpisce e ti prende in giro (mossa `taunt`): la voce parte quando il modello ride;
- un «graaak?» annoiato e uno sbadiglio se gli stai lontano;
- «gwak!» se lo colpisci forte;
- un verso per ogni mossa: tonfi di pelle tesa nel tamburo, il «BUUURP» del rutto, tre colpi di tosse nella Pioggia;
- la rabbia: tre gracidi corti sui tre sorsi e quello lungo con la sacca piena;
- nella sconfitta: lo sforzo, il rutto, il fischio del pallone che si sgonfia e il «cra?» del rospetto;
- «gro… ho… ho» se cadi.

### Come è nato (16–19 ottobre)

- Il design viene da tre proposte. Ha vinto il «tiranno» (8,4 su 10), con pezzi del «predatore» (creste a V, leccata di labbra, ghiandole,
  Strappo) e dello «sciamano» (varco degli anelli mai verso l'eroe, lucciole sul cerchio, Furia che mangia le lucciole). Dettagli in
  `docs/boss-classici-design/toad.md`.
- Due critici hanno trovato circa 47 difetti: corretti tutti i gravi, i medi e quasi tutti i piccoli. I principali:
  - lucciole che crescevano fino ad accecare;
  - lingua staccata dall'eroe mentre lo tirava;
  - Tripla Panciata che saltava di posa;
  - piumino che sfarfallava girando;
  - lingua che finiva dietro la testa;
  - pelle troppo chiara;
  - sconfitta che sembrava ridere.
- Nel collaudo in gioco:
  - il modello va con l'orologio del cervello;
  - la sacca grande si nasconde dietro il petto per profondità;
  - l'anello di carica dei colpi ha i colori del rospo (lime, brace nella fase 2).

### Misure

- Disegno:
  - misurato uno accanto all'altro sulla stessa macchina: 1,3 ms la versione corretta, 1,2–1,3 quella di prima; media 1,56 contro 1,49 ms;
  - con la macchina carica, nel foglio, 1,7 ms;
  - la stanza intera col boss circa 4 ms.
- Salti girando (passi di 0,25°, per giro):
  - fermo: 51 prima, 1 dopo;
  - fermo della fase 2: 57 prima, 9 dopo;
  - Linguata: 56 prima, 3 dopo;
  - Tamburo: 52 prima, 5 dopo;
  - Panciata: 30 prima, 3 dopo;
  - sconfitta: 57 prima, 19 dopo.
- Difficoltà (arena 3, eroe fermo che tira, livello 4, il caso peggiore; due giri da tre prove):
  - Re Rospo di oggi: 30,6–32,1 vite a combattimento, 16,5–17,1 al minuto;
  - nuovo: 35,2–35,5 vite, 19,5–19,6 al minuto, in 108–109 s di lotta;
  - in media +13% a combattimento: dentro il ±15% del design.
  - Ogni colpo ha il suo avviso, quindi chi si muove ne prende molti meno.
  - Se serve, prima meno chiazze di fango, poi la Pioggia a 5 cerchi. Da regolare giocando.
- Voce: volume medio come gli altri boss nuovi (0,07–0,11).

### File e prove

- Modello: `sprite/nemici3d/toad2.js` (modello `toad2`). Esporta anche i disegni per il gioco, con lo stesso aspetto del rospo:
  `N3.toadBubble`, `N3.toadFly` (k è la fase del lampeggio), `N3.toadMud`, `N3.toadCrown` (rot è la faccia del boss).
- Cervello: `src/js/89-rospo-nuovo.js`. Contiene `TK`, `EUPD.toad`, i pericoli in `G.tk`, l'entrata, la sconfitta, la voce e `BCL.toad`.
  Si accende solo se c'è `N3.toad2`.
- Modello finto: `anteprime/boss2/toad_stub.js`.
- Prove:
  - `python3 anteprime/mk_boss2.py toad --test && node tests/boss2gioco.js toad` (tutto OK, ERR []);
  - `node tests/boss2diff.js toad`;
  - `node tests/anteprime.js toad2_test.html` (la miniatura e lo sblocco dell'arena 3 stanno nel riquadro; le punte delle tife arrivano al bordo alto della miniatura);
  - foglio: `cd tests && node foglio3d.js toad2 b2/toad2.png --file ../sprite/nemici3d/toad2.js`.
- Immagini del collaudo: `tests/b2/toad2_collaudo_*.png` (entrata, lingua, tripla, tamburo, Frustata, Pioggia, rutto, Furia, sconfitta)
  e `tests/b2/toad2_correzioni_*.png`.
