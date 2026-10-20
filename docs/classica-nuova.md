# Classica nuova (anteprima, 20 ottobre)

Denis: «ascolta ora pensiamo a migliorare la modalità classica […] per rendere l'esperienza di gioco migliore e non pallosa come la scalata
delle coppe con le arene», poi «ok creami le cose che mi hai elencato su una cosa a parte senza intaccare il progetto principale». Ramo
`classica-nuova` (da `piano-maestro`); il gioco vero non cambia: `src/js/94-classica-nuova.js` **non** è in `src/ordine.txt`. Pagina:
`python3 anteprime/mk_classica.py [--build]` → `anteprime/classica.html` (parte con un salvataggio suo, già dopo la creazione dell'eroe),
pubblicata su https://claude.ai/artifact/K6E5QMv5pxKkt61MCFJsba («Mossbound · Classica nuova»: si aggiorna ripubblicando
`anteprime/classica.html`). Prova: `python3 anteprime/mk_classica.py --test --build && node tests/classica.js [menu|onde|furia|rarita|evo|nemesi|torre|corsa]`.

## Seconda versione (20 ottobre sera)

Denis, sulla prima versione: «mi piace la grafica delle cose che hai aggiunto ma non la meccanica.. trovati belle idee ispirandoti ai
giochi più in foga che fanno più forte, e fammi domande con risposte». Giochi guardati: Slay the Spire 2 (il lancio roguelike più grande),
Hades II, Megabonk, Balatro, Vampire Survivors; sul telefono Brawl Stars e Archero 2 (modalità a tempo, sfide 3 contro 3). Le sue risposte:

- In battaglia: **Furia a catena** (non scelte: ruba il potere, schivata perfetta, santuari da caricare).
- Crescita: **Rarità a sorpresa** ed **Evoluzioni spettacolari** (non scelte: fusioni a stelle, moltiplicatori alla Balatro).
- Per tornare a giocare: **Anime perdute** e **la Nemesi**, **insieme** (consigliato e scelto: chi ti uccide si prende l'oro), carattere
  «**entrambe** ed aggiungi pure il sangue se necessario» (non scelte: sblocchi con le imprese, Ascensione).
- La partita: **ondate a tempo**, arena **come oggi** (460×820, non più grande).
- Da tenere della prima versione: **mappa del mondo**, **menu con «Premi»**, **élite coi poteri**, **Torre e Corsa dei boss**. Tolti: bivi,
  stanze con un obiettivo, famiglie e fusioni, crescita automatica, Capobanda, Altare e frammenti, stelle (la versione di prima è nel commit
  9d51e82).

### Cosa c'è

1. **Ondate a tempo** (`CN_WV`, `cnWaveStart`, `cnWaveTick`, `cnWaveEnd`; come la modalità a tempo di Archero 2, Megabonk e Survivor.io): la
   partita d'arena è `[{c:1},{c:10}]`: 5 minuti di ondate nella stanza di sempre, poi la stanza del custode. Nemici dalla composizione della
   stanza che corrisponde al tempo (`G.room` sale da 1 a 9: vita, danno e cadenza crescono come stanza dopo stanza; la vita cresce del 14% a
   stanza invece del 20%), da 6 a 12 insieme e mai più di 16, uno ogni 1,45 → 0,5 s; ogni minuto un'«Ondata N!» grande con 1–2 élite coi
   poteri. Cronometro al posto di «N/10» (rosso negli ultimi 10 s). Un segnaposto invisibile (`cnAnchor`, tipo `cnanchor`) tiene la stanza
   aperta; esperienza e monete volano da sole all'eroe (`cnWaveMagnet`); alla fine il bottino a terra è tuo, i nemici fuggono nel fumo e si va
   dal custode. Record per arena in `SAVE.cn.best[a]` (`t` ondate, `fu` Furia massima, `win`).
2. **Furia a catena** (`CN_FU`; come Devil May Cry e Hi-Fi Rush): uccisioni di fila (élite 3, custode 6) → D Deciso (3), C Carico (8),
   B Brutale (15), A Assurdo (24), S Spietato (36), SS Sanguinario (52), SSS Sovrumano (72); moltiplica oro ed esperienza (×1,1 … ×2,5); dopo
   2,6 s senza uccisioni cala, un colpo preso la spezza (resta il 35%); a SSS l'eroe prende fuoco: danni +30% e colpi che bruciano. Lettera
   grande a destra con la parola, la barra e il moltiplicatore, suono a ogni rango; sotto i piedi una luce dal rango S. Nella Classica nuova
   prende il posto di «Doppia! Tripla!…» (`killStreak`).
3. **Carte con la rarità a sorpresa** (`CN_RAR`; come Megabonk e Brotato): ogni carta esce Comune, Rara, Epica o Leggendaria (64/24/9/3; la
   Furia le sposta verso le rare). Le carte dei numeri crescono (Attacco, Salute, Cadenza +20/30/45/70%, Critico +10/15/22/35%, Pozione
   40–100%, scatto, stivali), le altre danno +8/16/25% di danno e, leggendarie, due livelli. Arrivano coperte e si girano una alla volta;
   quelle rare girano come una slot (colori che cambiano, tic tic) e si fermano con un suono per rarità; il primo tocco le scopre tutte.
4. **Evoluzioni spettacolari** (`CN_EVO`; come Vampire Survivors): un'abilità al massimo con la compagna giusta. Pioggia di meteore (Raffica +
   Frecce infuocate: tre meteore ogni 2,6 s, cratere che brucia), Lancia di ghiaccio (Perforazione + Frecce di ghiaccio: lance che trapassano
   tutto e alla fine scoppiano in schegge che gelano), Catena del tuono (Rimbalzo + Fulmine: fulmini su tre nemici, stordiscono), Ciclone di
   lame (Lame rotanti + Passo d'ombra: cinque lame nel vortice), Freccia del drago (Freccia frontale + Occhio di falco: un drago di fuoco ogni
   4 s, critico), Corona di piume (Frecce diagonali + Frecce laterali: dodici piume d'oro ogni terza raffica). Sulle carte «Verso…» e
   «Sblocca…»; quando la prendi «EVOLUZIONE!», onda, scintille e una colonna di luce. Le sei evoluzioni di prima restano fuori dalla Classica
   nuova (ci sono nell'Abisso e nella sfida del giorno).
5. **La Nemesi col tuo oro** (`cnNem*`; come Shadow of Mordor e le invasioni di Dark Souls): chi ti uccide (il nemico che si muoveva, il
   colpo tirato, se no il più vicino o il custode) prende un nome e un titolo (`CN_NEMN`, `CN_NEMT`), è buffa o spavalda a caso, balla e ti
   prende in giro; a fine partita si prende l'oro raccolto e diventa una Nemesi (al massimo tre, `SAVE.cn.nem`). Nelle ondate la più ricercata
   invade la partita (tra 1:10 e 3:20): portale rosso, «Invasione!», il tuo sacco sulle spalle, nome sopra la testa, i poteri delle élite,
   più vita col livello, frasi nei fumetti con una voce fatta di sillabe (`CN_NEML`, `cnVoice`). Battila: ti riprendi l'oro e la taglia
   (5 + 5 × livello cristalli); se ti batte ancora sale di livello (fino a 5), prende un potere in più e il sacco cresce. Se ti uccide un
   custode, è lui a tenersi l'oro (`SAVE.cn.bossGold`) fino a quando non lo batti. Per le spavalde un po' di sangue: il taglio rosso sullo
   schermo e le gocce a terra quando ti uccidono, le macchie sul manifesto e a terra quando le batti (Denis: «aggiungi pure il sangue se
   necessario»). A fine partita il manifesto col ritratto (il modello 3D, `cnPortrait`); nella mappa la bacheca dei **Ricercati** con i
   manifesti, la taglia, i custodi col tuo oro e le Nemesi sconfitte. Ritirarsi lascia l'oro a te.
6. **Restano**: la mappa del mondo coi 12 bracieri (si accendono vincendo; via le stelle; per ogni arena i record), il bottone «Premi», le
   élite coi poteri (Scudo, Si divide, Esplosivo, Furioso, Gelido, Rigenera), la Torre della settimana con le reliquie dopo ogni custode e la
   Corsa dei boss (sotto).

### Misure

Sul computer di prova (lento, senza scheda grafica) a 3 pixel a punto: il disegno di un fotogramma è circa 1,7–2,6 ms per nemico 3D (con 13
nemici 21 ms, con 21 43 ms); le evoluzioni aggiungono poco. Per questo nelle ondate al massimo 12 nemici insieme (16 con le ondate grandi).

### Prove (`tests/classica.js`, 42 controlli, nessun errore, due giri di fila; in qualità alta, perché sul computer di prova la qualità automatica passerebbe agli effetti ridotti)

Menu (scheda coi bracieri, «Premi» e le Missioni, la Zombie com'era, mappa senza stelle, arena chiusa, Torre, Corsa chiusa, Ricercati vuoti);
ondate (cronometro, nemici, stanza che non si chiude, livelli e oro, ondata grande con le élite, la stanza che sale col tempo, il custode
dopo 5 minuti, vittoria col braciere e il record, la scheda che propone l'arena 2); Furia (D, SSS ×2,5 in fiamme, +30% e bruciatura, colpo
che la spezza, calo); carte (coperte, primo tocco, leggendarie forzate, effetti, la Furia che fa uscire più rare); evoluzioni (la carta,
la trasformazione, tutte e sei insieme); Nemesi (nasce, manifesto e oro, bacheca, invasione col sacco e la frase, taglia, che cresce, il
custode che tiene l'oro e lo ridà); Torre fino al piano 20; Corsa per 4 custodi. Foto `tests/cn_<n>.png`.

## Prima versione (20 ottobre, tolta dopo la risposta di Denis)

Bivi tra le stanze, stanze con un obiettivo (resisti, totem, pavimento che sale, scrigno a tempo, lanterna), famiglie di abilità che si
fondono, 12 reliquie dalle élite, mappa con le 3 stelle per arena, bracieri, Torre della settimana, Corsa dei boss; poi le modifiche proposte
(crescita automatica, élite coi poteri, Capobanda alla stanza 3, porta subito aperta, frammenti e Altare, menu con «Premi»). Codice nel
commit 9d51e82 del ramo `classica-nuova`.

## Torre della settimana e Corsa dei boss (come nella prima versione)

- **Torre della settimana** (`cnTowerMods`, `cnTowerBoard`): 20 piani dell'Abisso, un custode ogni 5 e una reliquia dopo ognuno, tre regole
  che cambiano il lunedì (una buona e due cattive, dalle regole della sfida del giorno più Sete di sangue, Niente cuori, Contro il tempo),
  classifica della settimana. Non tocca i record dell'Abisso. Niente ondate.
- **Corsa dei boss** (`cnRushNext`): i custodi già battuti uno dopo l'altro; tra uno e l'altro il 35% di salute e un'abilità; record di
  custodi di fila e tempo di tutti e 12. Non tocca coppe né record delle arene.
