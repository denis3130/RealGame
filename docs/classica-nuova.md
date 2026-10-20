# Classica nuova (anteprima, 20 ottobre)

Denis: «ascolta ora pensiamo a migliorare la modalità classica […] per rendere l'esperienza di gioco migliore e non pallosa come la scalata
delle coppe con le arene», poi, dopo la lista delle proposte: «ok creami le cose che mi hai elencato su una cosa a parte senza intaccare il
progetto principale». Ramo `classica-nuova` (da `piano-maestro`); il gioco vero non cambia: `src/js/94-classica-nuova.js` **non** è in
`src/ordine.txt`. Pagina: `python3 anteprime/mk_classica.py` → `anteprime/classica.html` (parte con un salvataggio suo, già dopo la creazione
dell'eroe), pubblicata su https://claude.ai/artifact/K6E5QMv5pxKkt61MCFJsba («Mossbound · Classica nuova»: si aggiorna ripubblicando
`anteprime/classica.html`). Prova: `python3 anteprime/mk_classica.py --test && node tests/classica.js [menu|obj|elite|fusioni|partita|torre|corsa]`.

## Le otto novità

1. **Bivi tra le stanze** (`cnRouteOpts`, `cnRouteShow`, `cnRouteApply`): nelle arene, uscendo da una stanza, si sceglie tra due o tre
   porte ad arco: Battaglia, Élite (due nemici élite, premio una reliquia) o una stanza con un obiettivo (premio un'abilità in più), e a
   volte una sosta (Fontana, Mercante, Altare, Tesoro, Stanza dell'oro, Prova del coraggio; al massimo 4 per partita). Prima del boss: il
   boss o la fontana. In alto la strada fatta (le 10 stanze, le soste, il boss) e le reliquie che hai. Gli eventi fissi delle stanze 2, 5, 7
   non ci sono più: le soste le scegli tu.
2. **Stanze con un obiettivo** (`CN_OBJ`, `cnObjStart`, `cnObjTick`): Resisti 30 secondi (i nemici continuano ad arrivare, la stanza non si
   chiude prima); I tre totem (si rompono a frecce, chiamano un rinforzo ogni 5 s); Il pavimento sale (veleno, lava, palude o acqua gelida
   secondo il mondo; dentro si perde il 7% della salute ogni 0,75 s); Scrigno a tempo (22 s più le stanze); La lanterna (metà dei nemici va
   a spegnerla, i loro colpi la colpiscono). Riquadro in alto con il tempo o il conto (`#cnHud`).
3. **Famiglie di abilità che si fondono** (`CN_FAM`): quattro abilità nuove (Scia di braci, Brina, Spore, Carica statica) fanno coppia con
   Frecce infuocate, di ghiaccio, velenose e Fulmine; con tutte e due arriva la carta **FUSIONE**: Inferno (chi brucia esplode), Bufera (ogni
   6 s congela i vicini), Peste (il veleno salta e fa il doppio), Tempesta (fulmini doppi che stordiscono). Sulle carte la famiglia e «con
   questa, FUSIONE!».
4. **Reliquie** (`CN_REL`, 12): si scelgono tra due dopo le stanze élite e dopo i custodi della Torre; durano la partita e restano nella
   collezione (`SAVE.cn.relics`). Specchio di sponda, Stivali di brace, Calice del vampiro, Calamita d'oro, Occhio del cacciatore, Guscio di
   tartaruga, Cuore di bomba, Furia dell'orso, Clessidra rotta, Piuma del passero, Radice antica, Stella cadente.
5. **Mappa del mondo con le stelle** (`cnMapOpen`): la scheda dell'arena apre una mappa che sale dall'arena 1 alla 12; ogni arena ha 3
   stelle (vinci; finisci con più di metà salute; finisci in meno di 7 minuti); un'arena si apre vincendo quella prima; si gioca l'arena
   scelta; le coppe non si perdono più. Ogni 6 stelle un premio della fiamma (300 oro e 10 cristalli). Nella pagina c'è «apri tutte le arene»
   (solo anteprima).
6. **Bracieri della fiamma**: 12 bracieri in cima alla mappa, uno per arena, si accendono battendo il suo custode («Hai riacceso il braciere
   di…» a fine partita); il conto anche sulla scheda dell'arena.
7. **Torre della settimana** (`cnTowerMods`, `cnTowerBoard`): 20 piani dell'Abisso, un custode ogni 5 e una reliquia dopo ognuno, tre regole
   che cambiano il lunedì (una buona e due cattive, dalle regole della sfida del giorno più Sete di sangue, Niente cuori, Contro il tempo),
   classifica della settimana. Non tocca i record dell'Abisso.
8. **Corsa dei boss** (`cnRushNext`): i custodi già battuti uno dopo l'altro; tra uno e l'altro il 35% di salute e un'abilità; record di
   custodi di fila e tempo di tutti e 12. Non tocca coppe né record delle arene.

## Prove (`tests/classica.js`, 24 controlli, nessun errore)

Menu e mappa (scheda, 12 arene, chiuse, «apri tutte», Torre, Corsa, Reliquie); i cinque obiettivi con il premio; «Resisti» che non si chiude
prima; élite con la reliquia e la collezione; fusione Inferno; fusioni e reliquie tutte insieme senza errori; una partita intera del
giocatore automatico con i bivi fino alla vittoria con le 3 stelle e il braciere; la scheda che propone l'arena 2; la Torre dal piano 19 al
20 («Torre conquistata», Abisso intatto); la Corsa per 4 custodi di fila e la fine senza coppe cambiate.
