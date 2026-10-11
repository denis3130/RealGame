# Bozza: mappa della modalità zombie

Questa è una bozza per Claude Code. Descrive la mappa grande della modalità zombie: cosa deve fare, cosa non deve rompere e cosa va deciso prima di scrivere codice. I numeri sono proposte da regolare giocando.

## Obiettivo

Una mappa molto più grande dello schermo, dove gli zombie sbucano dal terreno e dall'ambiente intorno all'eroe. Dentro ci sono case e luoghi abbandonati in cui si entra direttamente, senza il passaggio da una stanza all'altra che c'è nelle arene.

Il gioco deve restare chiaro e colorato, e piacere anche ai bambini. Nessuna scena deve sembrare spaventosa in modo frustrante all'inizio.

## Vincoli dal progetto

- Il gioco è in un solo file, `index.html`, con canvas 2D e nessuna libreria esterna (vedi `CLAUDE.md`).
- La stanza delle arene è 360×640 (`AW`, `AH`), con l'area giocabile tra `L`, `R`, `TOP`, `BOT`. La mappa zombie non la sostituisce: è una modalità a parte.
- Lo stile grafico è quello dello Zombie della lanterna (`sprite/mostri/disegno_mostri.js`): ombre e luci su ogni pezzo, colori ricchi, bordi illuminati. Il pavimento resta più spento; zombie, pericoli e premi devono risaltare.
- La lanterna non si modifica.
- Ogni elemento nuovo rispetta `LOWFX` per i telefoni lenti.
- I personaggi restano coerenti in tutte le direzioni: davanti, lato, dietro.
- Prima di inserire un personaggio nuovo, mostrare a Denis le quattro direzioni affiancate.

## Cosa fa la mappa

1. **Grande più dello schermo.** La mappa è molto più grande della vista. La telecamera segue l'eroe. Dipende dalla modifica "arene più grandi dello schermo" (voce 5 del `CLAUDE.md`): va fatta prima, o insieme.
2. **Zombie che sbucano.** Gli zombie escono dal terreno (aperture nel suolo, terra smossa, poi la figura) e anche da porte, finestre, cespugli e rottami. Non devono comparire dal nulla davanti all'eroe.
3. **Case e luoghi abbandonati.** L'eroe entra in un edificio camminando sopra la soglia. Non c'è nessun cambio di stanza: cambia solo la scena.
4. **Dall'esterno si vede tutto il posto.** Il tetto copre l'interno.
5. **Dentro si toglie il tetto.** Una volta dentro, il tetto sparisce (dissolvenza o scorrimento) e si vede cosa c'è dentro: mobili, zombie, oggetti.
6. **Uscita.** Tornando sulla soglia il tetto torna.
7. **Ambiente.** Ogni zona ha il suo tema (per esempio cimitero, quartiere, fattoria). I temi usano `ENV` come le arene.

## Cose da decidere con Denis prima di scrivere codice

- Quanto è grande la mappa? Proposta: tre o quattro volte lo schermo in larghezza, due o tre in altezza.
- Quante case e luoghi per mappa? Proposta: tre o quattro, con almeno una casa piccola per i principianti.
- Il tetto sparisce a dissolvenza o scorre via? Quale rende meglio con lo stile attuale?
- Gli zombie sbucano sempre o solo in certi punti? Proposta: punti fissi più un po' di casualità.
- Dentro le case ci sono oggetti da raccogliere, come nell'arena, o solo zombie?
- Il paesaggio fuori dalla mappa si vede? Vedi la voce 4, "arene più grandi".

## Passi suggeriti

1. Prima la telecamera che segue l'eroe, su una mappa di prova con un solo edificio.
2. Poi gli zombie che sbucano dal terreno, con il ciclo di comparsa e spawn fissato.
3. Poi il tetto che si toglie e torna, con l'ingresso alla casa.
4. Poi gli altri edifici e i temi di zona.
5. Infine le prove: partita automatica, poligono di prova in `sprite/armi/poligono/`, test di telefono.

## Cosa non cambiare

- Il sistema delle arene e delle coppe resta com'è.
- Lo Zombie della lanterna e l'eroe non cambiano aspetto.
- Le armi e la Bara delle Sorprese restano quelle già scritte in `sprite/armi/`.

## Verifica

- Il gioco deve girare su telefono e su computer, senza errori in console.
- Dopo ogni modifica: almeno una partita automatica, `tests/meta2.js`, `tests/menu2.js`, e uno sguardo alle schermate.
- Le schermate vanno mostrate a Denis prima di proseguire con cose grosse.
