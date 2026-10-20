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

## Le modifiche proposte (20 ottobre, nella stessa pagina)

Denis: «fammela vedere la classica nuova e le modifiche che mi avevi proposto».

9. **Crescita automatica** (`CN_GROW`, `cnGrow`): le carte che erano solo numeri (Punte affilate, Cuore di quercia, Corda tesa, Occhio di
   falco) non escono più; a ogni livello arriva da sola, a giro, +10% attacco, +10% salute, +10% cadenza, +5% critico (scritta sopra
   l'eroe e nell'avviso del livello). Nelle scelte restano le abilità che cambiano il modo di giocare. Colpo letale chiede due crescite
   di attacco e due di critico (dal livello 9).
10. **Élite con un potere** (`CN_AFX`, `cnGiveAfx`): ogni élite (anche i Campioni e la Torre) ha un potere scritto sopra la barra, due
    dall'arena 4 o dalla stanza 8: Scudo (para il 35% della vita e torna dopo 4 s senza colpi, bolla azzurra), Si divide (cadendo diventa
    due più piccoli), Esplosivo (lascia una bomba che scoppia dopo 1,2 s, cerchio rosso), Furioso (tutto più veloce, ×1,4), Gelido
    (vicino a lui cammini piano, anello di brina), Rigenera (se non lo colpisci per 1,6 s si cura del 5% al secondo). In cambio le élite
    hanno ×2,2 di vita invece di ×2,6 e la vita dei nemici cresce del 14% a stanza invece del 20%.
11. **Capobanda e passaggi più veloci**: la stanza 3 è sempre del Capobanda (il nemico più grosso della stanza diventa un'élite più grande
    con due poteri e la corona, premio una reliquia); la porta si apre 0,4 s dopo l'ultimo nemico (prima 0,9; le morti dei boss si
    aspettano come prima), il nero tra le stanze dura meno e con la porta aperta l'eroe corre verso l'uscita (×1,45).
12. **Frammenti di fiamma e Altare** (`CN_ALT`): a fine partita un frammento per stanza (sei in più se vinci), metà dei piani nella Torre,
    tre a custode nella Corsa; nell'Altare (quarto bottone della mappa) Cuore di brace (+6% salute a livello, 5 livelli), Lama ardente
    (+5% attacco, 5), Passo di cenere (−8% di attesa dello scatto, 3), Ultima scintilla (una volta a partita, sotto un quinto della
    salute, ne recuperi un terzo), Occhio del destino (reliquie tra tre). Prezzi 8–45 frammenti. Nell'anteprima si parte con 20.
13. **Menu con meno bottoni** (`cnPremi*`): nella Classica a sinistra un solo bottone «Premi» (si accende e conta quando qualcosa è pronto)
    che apre Missioni, Accesso, Ruota e Traguardi; a destra restano Pass e Casse (il Cammino delle coppe non serve con le stelle, le
    Offerte stanno nella Bottega). La Zombie resta com'è. Unire oro e cristalli in una moneta sola è rimasto una proposta: non è fatto.

## Prove (`tests/classica.js`, 39 controlli, nessun errore)

Menu e mappa (scheda, 12 arene, chiuse, «apri tutte», Torre, Corsa, Reliquie); i cinque obiettivi con il premio; «Resisti» che non si chiude
prima; élite con la reliquia e la collezione; fusione Inferno; fusioni e reliquie tutte insieme senza errori; una partita intera del
giocatore automatico con i bivi fino alla vittoria con le 3 stelle e il braciere; la scheda che propone l'arena 2; la Torre dal piano 19 al
20 («Torre conquistata», Abisso intatto); la Corsa per 4 custodi di fila e la fine senza coppe cambiate. Con `nuovo`: il menu con «Premi»
(e la Zombie com'era), la crescita automatica e le carte senza numeri, i sei poteri delle élite, il Capobanda con la sua reliquia, la porta
subito aperta, i frammenti a fine partita (16 con la vittoria), l'Altare e la miglioria nella partita dopo.
