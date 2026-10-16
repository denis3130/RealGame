# Regina dei Ghiacci: il design finale

(Deciso dal direttore artistico tra tre proposte, 16 ottobre. Tipo nel gioco: `icequeen`; modello `sprite/nemici3d/icequeen2.js`.)

## Il design

LA REGINA DEI GHIACCI RIFATTA: «L'IMPERATRICE DI CRISTALLO»

Nome e titolo restano: «Regina dei Ghiacci», «Signora dei Picchi di Brina». È il boss dell'arena 8, Ghiacciaio Eterno, nella Sala del Trono di Ghiaccio.
- Modello 'icequeen2' in sprite/nemici3d/icequeen2.js. Nel gioco prende il nome 'icequeen'; il disegno di oggi resta in N3.meta.icequeen.old per «Prima e dopo».
- Base: la proposta «imperatrice», con le idee migliori di «specchi» e «spettro» e le correzioni del direttore artistico.
- Esempio di qualità: sprite/nemici3d/golem2.js.

=== IDEA ===
Un'imperatrice altissima e immobile, piantata a terra come un monumento:
- l'abito è un iceberg di ghiaccio profondo, a facce di gemma, che si allarga fino a terra;
- il corpetto è di velluto indaco;
- i capelli blu mezzanotte incorniciano un viso di porcellana, con due occhi azzurri che brillano sotto una frangia di ghiaccioli;
- dietro la testa si apre una corona a raggiera di sette stalattiti.

Non corre e non si scompone mai. Scivola sul ghiaccio senza muovere un piede, sempre girata verso di te come un pezzo degli scacchi spostato da una mano invisibile, e ti guarda dall'alto in basso.

Prima di ogni incantesimo la corona si accende punta dopo punta, come un orologio (tin… tin… tin… TIN): quando si accende la punta di mezzo, il colpo parte.

Tutto nasce da lei:
- le lance di cristallo crescono sopra la sua testa;
- la corona vola via e ti chiude in una gabbia di pilastri che si stringe;
- lo scettro piantato disegna un fiocco di neve gigante sul pavimento;
- dagli specchi escono le sue copie (la vera ha l'ombra e la corona accesa).

Nella fase 2 diventa la Notte Polare: l'abito si riempie di stelle, dietro le spalle si apre il Ventaglio d'Inverno, e arrivano lo Sguardo d'Inverno e il Valzer della Tormenta.

Punto debole: la gemma sulla fronte. Quando è scoperta, o quando la incrini nella Sala degli Specchi, i colpi fanno +50%.

Fa timore perché è enorme e calma. Resta della Classica: bella come una regina delle fiabe, occhi con la lucina, nessun dente, niente sangue, ferite né cuciture.

=== SAGOMA E MISURE ===
Unità del modello a sc 1: x avanti, y alla sua destra, z su, 0 = il punto a terra sotto di lei. Per confronto: l'Arciere 3D è alto circa 37, la Regina di oggi 75, il Golem nuovo 110.

- La sagoma è un triangolo alto e scuro piantato a terra, con la corona chiara a raggiera in cima e la riga dello scettro accanto, sul suo lato destro.
- A un terzo della grandezza devono restare quattro cose: il triangolo scuro dai bordi chiari, la corona bianca a punte, due puntini azzurri e la luce in cima allo scettro.
- Altezza:
  - 128 in punta alla stalattite centrale nella fase 1;
  - 140 nella fase 2;
  - il Ventaglio d'Inverno arriva a z 131 ed è largo 90.
- Larghezza: 76 all'orlo (raggio 38), 50 alle spalle con spalline e maniche, 84 con lo scettro.
- Non è un cono: vita stretta (22 a z 64), spalle larghe, collo lungo, profilo dell'abito a campana concava, facce irregolari, spuntoni e orlo frastagliato. Non deve sembrare né un albero di Natale né il pupazzo di neve di oggi: va controllato nei fogli anche piccola.
- Non galleggia (oggi float:true): sta piantata. Così si distingue da Strega e Burattinaio, che fluttuano col mantello.
- Nel gioco: raggio del corpo da 20 a 28, B2H.icequeen da 60 a 115.

=== PEZZI NELLA POSA DI RIPOSO ===

1. ABITO-ICEBERG (da z 0 a 58)
- Solido di rivoluzione (revo, AX 0,92) a 9 lati irregolari.
- Profilo (z, raggio): (0, 38) (8, 36) (20, 30) (36, 21) (50, 15) (58, 12,5).
- Fattori dei 9 lati, fissi: 1,06 · 0,94 · 1 · 1,08 · 0,95 · 1,03 · 0,97 · 1,05 · 0,92.
- Anelli a z 0, 20, 40 e 58. L'anello di z 20 è ruotato di mezzo passo, così le facce sono triangoli come una gemma tagliata.
- Facce dipinte una per una come i `facets` del Golem (l'aiutante sta in golem2.js, non nella cassetta): tono pieno per faccia secondo la luce, spigoli chiari sottili (1 px) sui lati verso la luce, contorno INK 2,6.
- Orlo frastagliato: 12 punte che toccano terra, alternate (raggio 38, z 0) e (raggio 34, z 4).
- Luce dentro: shine rgb(110,205,255) tagliata dentro l'inviluppo, centrata davanti in basso (x +12, z 14), raggio 30, alfa da 0,25 a 0,4 col respiro dello scettro.

2. SPUNTONI (seracchi di ghiaccio che escono dall'abito)
Tre cristalli a 4 facce:
- fianco destro: azimut +100°, z 30, verso fuori e su di 35°, lungo 16, base 6;
- fianco sinistro: azimut −100°, uguale;
- davanti in basso a sinistra: azimut −25°, z 9, su di 20°, lungo 12, base 5.
Nella fase 2 sono lunghi 1,5 volte e se ne aggiungono due dietro (azimut ±160°, z 22, lunghi 14). Punte grosse e smussate, mai aghi (stile giocattolo).

3. CORPETTO (da z 56 a 80)
- Volume (vol) dagli anelli: z 56 (rx 10, ry 12), z 64 (9,5, 11), z 72 (11, 14), z 78 (10, 15).
- Velluto indaco con i ricami d'argento:
  - sul petto un fiocco di neve a 6 bracci largo 10 (x +10, z 68, con surfLine);
  - un filetto alla vita (z 57);
  - la scollatura a V dalle spalle a z 72.
- Spilla a stella a 6 punte (r 3) a z 76 davanti, con una gemma azzurra.

4. SPALLINE DI CRISTALLO
Su ogni spalla, a (0, ±15, 79): tre punte a facce, una centrale da 8 verso fuori e su, due da 5. Colori delle punte dell'orlo.

5. COLLO
Capsula di porcellana, r 3,5, da z 80 a 86.

6. TESTA
- Sball r 12,5 centrata a (1, 0, 96).
- Ha la sua telecamera (Vat): segue l'eroe fino a ±70° rispetto al corpo e annuisce. Nello Sguardo gira di ±60°.
- Corona, frangia, capelli e chignon la seguono.

7. CAPELLI BLU MEZZANOTTE
- Una calotta (ellCap) sopra e dietro, con la riga in mezzo sotto il cerchietto.
- Due ciocche lisce (catene di 5 palline, r da 3,4 a 2,4):
  - partono dalle tempie (dir [0,35, ±0,92, 0,05] sulla testa);
  - scendono lungo le guance fino alle spalle (z 78), poi davanti alle spalle fino a z 70;
  - quando la testa gira seguono per metà della rotazione.
- Uno chignon dietro, a (−10, 0, 101), r 6, dentro la raggiera della corona: da dietro si vede tra le stalattiti.
- Due o tre fili d'argento sulle ciocche.

8. CORONA
- Cerchietto d'argento: un anello r 12,8 intorno alla testa, a z 103 davanti e 108 dietro, spesso 2.
- Gemma zaffiro sulla fronte (dir [1, 0, 0,58], r 2,6): è il punto debole.
- Sette stalattiti a raggiera dietro la testa:
  - stanno nel piano yz inclinato di 20° all'indietro, con il centro della raggiera a (−4, 0, 104);
  - angoli dalla verticale 0°, ±25°, ±50°, ±75°;
  - lunghe 24, 19, 14, 10; basi larghe 5,5, 4,6, 3,8, 3,2;
  - piramidi a 3–4 facce con la punta smussata;
  - nella fase 2 sono lunghe 34, 26, 19, 13 e diventano viola.
- Frangia: 7 ghiaccioli appesi al cerchietto sulla fronte, lunghi da 4 a 6 (il centrale 6), larghi 1,6, fino a z ≈ 100. Gli occhi (z ≈ 95) brillano sotto, nella loro ombra.

9. BRACCIA (due ossa, ik)
- Spalle a (0, ±15, 78); omero 19, avambraccio 19.
- Omero di velluto indaco (r da 3,6 a 3,2).
- Dal gomito la manica a campana di seta brinata: si allarga fino a raggio 8, pende fino a z ≈ 38 e ha tre ghiaccioli sull'orlo (4, 6, 4; nella fase 2 6, 10, 6). Dentro, l'avambraccio sottile di porcellana (r 2,4).
- Mano elegante: palmo r 3, tre dita da 6 e il pollice. Mai dita lunghissime: sono un segno della modalità Zombie.
- A riposo:
  - la destra stringe lo scettro a (12, 32, 66);
  - la sinistra è posata davanti alla vita, a (10, −4, 60), col gomito in fuori.

10. SCETTRO (lungo 112, argento brunito)
- Piede a punta (un cono di 4) a terra a (14, 40, 0): sempre fuori dall'abito, che a terra ha raggio 38. Mai attraverso il vestito.
- Asta r 1,8, appena inclinata verso di lei: la cima sta a (10, 27, 112).
- Una spirale di ghiaccio sull'asta da z 70 a 98 (tre giri, surfLine).
- In cima un artiglio d'argento a 3 dita (catene) stringe un cristallo ottaedrico (8 facce, r 6) a z 106. Il cristallo pulsa (orb) e prende il colore dell'incantesimo.

11. VENTAGLIO D'INVERNO (solo fase 2)
- 9 lame di cristallo (leaf a due facce, larghe 9 a metà).
- La base è dietro il collo, a (−8, 0, 82), in semicerchio nel piano inclinato di 25° all'indietro.
- Angoli dalla verticale 0°, ±20°, ±40°, ±60°, ±80°; lunghe 54, 52, 50, 46, 40.
- Trasparenti (alfa 0,75) col bordo bianco; si aprono e si chiudono di ±4° a ogni respiro.

12. STELLE (solo fase 2)
14 stelline a 4 punte fisse sulla superficie dell'abito, disegnate solo sulle facce che si vedono. Due sono calde. Brillano piano, sotto i 2 Hz.

13. OMBRA A TERRA
rx 40, ry 15, alfa 0,4 (C3.floor). Solo per la vera: con o.ghost niente ombra. Nel gioco ESHADOW.icequeen va vuotato, perché l'ombra la fa il modello.

=== ORDINE DI DISEGNO (dalla posa di riposo, parts + run) ===
1. Ventaglio d'Inverno: dietro (centro a x −8). Da dietro passa davanti al corpo.
2. Braccio e manica lontani: la manica lontana è coperta dall'abito.
3. Abito con gli spuntoni (prima quelli dietro).
4. Corpetto e spalline.
5. Braccio e manica vicini.
6. Scettro: va davanti o dietro secondo il suo posto a riposo (lato destro), mai secondo la mano che si alza.
7. Collo.
8. Testa, con la sua telecamera: prima le stalattiti dietro la testa e lo chignon, poi la testa, i capelli, il viso, la frangia e le stalattiti che stanno davanti.
Nelle mosse in cui la mano passa davanti al corpo (lances, nova, stunned), il braccio si divide in pezzi ordinati da dove sta la mano, come nel Golem.

=== COLORI (luce / base / ombra) ===
Il pavimento della sala con la tinta dell'arena 8 è #adb5e6 (luminosità 74). La massa della Regina è scura (base dell'abito 55, corpetto 27, capelli 21) e sopra stanno i bianchi: corona, maniche, viso, punte. Così si stacca sempre dal pavimento.

Luci:
- la luce calda del gioco dall'alto a sinistra, col bordo caldo (rim) su tutti i pezzi grandi, come la lanterna;
- sul lato in ombra di abito e maniche un filo di luce fredda lilla rgb(180,165,255), la luce della sala.

FASE 1 «GELO REALE»
- Abito-iceberg: #BDEBFF / #3F86D6 / #1D3486; cuore #111A52; spigoli #EAFBFF; luce dentro rgb(110,205,255).
- Punte dell'orlo, spuntoni, spalline: #F2FCFF / #9ADAFF / #3F7FD0.
- Corpetto di velluto: #5A66D6 / #2E368F / #161B52; ricami e filetti #DCE8FF.
- Spilla: argento #E6ECFA, gemma #78E6FF.
- Maniche di seta brinata: #F4F7FF / #BCC9F0 / #6D7CC0; ghiaccioli #E8FAFF.
- Pelle di porcellana: #F6F9FF / #D9E4F6 / #A3B3DA; guance rgba(200,180,255,.2).
- Capelli blu mezzanotte: #4B5C9E / #232D63 / #0F1433; fili d'argento #A9C4F0.
- Sopracciglia #232D63; palpebre e ciglia #1B1A3A; ombretto rgba(96,96,208,.35).
- Occhi: iride #9FF6FF, centro #FFFFFF, lucina #FFFFFF, bagliore rgb(140,235,255).
- Labbra #4B3D8F; neo di brina #EAFBFF.
- Corona:
  - stalattiti #FFFFFF / #A8E6FF / #3F80D6; accese con glowTop e shine rgb(170,235,255);
  - cerchietto #E6ECFA / #9AA8CC / #56628E;
  - gemma #3D5BFF con la lucina #C9D2FF, bagliore rgb(120,150,255).
- Scettro:
  - argento #C3CDE8 / #6F7FAE / #2F3A66, spirale #DFF6FF;
  - cristallo #FFFFFF / #8FE8FF / #2F8FD8, bagliore rgb(150,235,255).
- Nebbia ai piedi rgba(220,240,255,.35).

FASE 2 «NOTTE POLARE»
- Abito: #D9CCFF / #6A55D0 / #221A6E; cuore #120C3D; spigoli #F2ECFF; stelle #FFFFFF e #FFE9A8; luce dentro rgb(190,160,255).
- Punte e spuntoni: #F6F2FF / #C9B8FF / #6A4FD6.
- Corpetto: #4A3A9A / #241A5C / #0E0A2A; ricami #E6D8FF.
- Maniche: #EEE8FF / #B3A6E8 / #6555B0; ghiaccioli #E6DCFF.
- Capelli uguali, con i fili #B9A8F0.
- Occhi: iride #F0E6FF, centro #FFFFFF, bagliore rgb(200,160,255).
- Labbra #3A2470.
- Corona: #FFFFFF / #D2C2FF / #6A4FD6, accese rgb(210,180,255); gemma ametista #9A6CFF con la crepa bianca.
- Ventaglio d'Inverno: #F2EEFF / #A996F0 / #4E3DA8, alfa 0,75, bordo #FFFFFF.
- Cristallo dello scettro: #FFFFFF / #C9B0FF / #6A3FD8, bagliore rgb(200,170,255).

NELLA STANZA
- Avvisi sempre rossi (229,72,77).
- Cerchio di rune RUNEC.regina = ['140,225,255','200,160,255'].
- Alone B2T.icequeen = [['140,225,255','200,160,255'],'220,240,255'].
- La barra si rompe come oggi (BBFX.icequeen).

=== FACCIA E OCCHI ===
- Occhi:
  - grandi a mandorla: eyes di tipo 'glow', rx 2,4, ry 1,9, dir [1, ±0,36, 0,02], con la lucina;
  - palpebra superiore spessa e scura (1,2), con la codina in su all'angolo esterno.
- Stati degli occhi:
  - ferma: a metà (blink 0,55), lo sguardo altero di chi ti guarda dall'alto;
  - prima dei colpi grossi: si aprono a 0,8;
  - Sguardo d'Inverno: tondi e grandi (blink 1,25, più alti del normale);
  - corona incrinata: spalancati, poi tremano offesi;
  - presa in giro: due mezzelune (squint 0,8).
- Sopracciglia sottili, del colore dei capelli, alte e arcuate. Nella fase 2 la punta interna scende verso il naso.
- Ombretto lilla-indaco sopra gli occhi. Naso: un trattino.
- Bocca: labbra piccole e chiuse ('smile', bow −0,3, larga 2,2). Nella presa in giro un sorriso soddisfatto (bow 2,2). Mai denti.
- Guance appena lilla. Un fiocchetto di brina di 3 px sotto l'occhio sinistro (dir [1, −0,44, −0,18]): un neo, non una lacrima.

=== IL SEGNALE: LA CORONA-OROLOGIO ===
Prima di ogni incantesimo le stalattiti si accendono a coppie:
- prima le esterne (±75°), poi le medie (±50°), poi le interne (±25°);
- infine la centrale, e in quel momento parte il pericolo.

Una punta accesa ha le facce più chiare, glowTop e uno shine rgb(170,235,255) di raggio 7 (fase 2: 210,180,255). Resta accesa fino alla fine del colpo, poi tutte si spengono insieme in 0,1 di p.

Il gioco fa sentire un «tin» di vetro a ogni coppia e un «TIN» più chiaro sulla centrale. I momenti (p) del conto:
- lances: 0,30 · 0,45 · 0,60 · centrale 0,76
- crown: 0,04 · 0,08 · 0,12 · 0,16
- nova: 0,16 · 0,26 · 0,36 · 0,46
- mirror: 0,05 · 0,12 · 0,19 · 0,26
- waltz: 0,03 · 0,06 · 0,09 · 0,12
- enter: 0,76 · 0,80 · 0,84 · 0,88 (mostrato una volta)
- gaze: la corona si spegne del tutto (parlano gli occhi)
- cast: niente conto (nella Sala la vera ha la corona sempre tutta accesa)

Il luccichio bianco del fermo è rapido e corre di lato: non si confonde col conto.

=== FERMA (idle, 3 s) ===
È una statua: niente su e giù, l'abito non si muove. Si muovono solo cose piccole, lente e regolari:
- il petto si alza di 1 px col respiro (un ciclo), le spalle di 0,6;
- a p 0,50 espira: due o tre sbuffi di fiato freddo salgono di 6 px e svaniscono;
- la testa segue l'eroe con un'oscillazione viva di ±4°; da 0,30 a 0,45 alza il mento di 6°, lo tiene fino a 0,70 e lo riabbassa entro 0,85;
- da 0,78 a 0,90 chiude lenta le palpebre e le riapre;
- da 0,10 a 0,40 un luccichio bianco corre sulle punte della corona da sinistra a destra (una punta ogni 0,04);
- il cristallo dello scettro pulsa (alfa del bagliore 0,45 → 0,7 → 0,45) e la luce dentro l'abito respira con lui;
- frangia e ghiaccioli delle maniche dondolano di ±1 px (due cicli);
- da 0,88 a 0,98 le dita della sinistra tamburellano due volte sul corpetto, impazienti;
- tre sbuffi di nebbia escono da sotto l'orlo e scivolano a terra.
Il primo fotogramma combacia con l'ultimo.

=== SCIVOLA (walk, 1,4 s) ===
- Nessun passo: tutto il corpo scorre sul ghiaccio.
- È sempre girata verso di te, anche quando va di lato o all'indietro. Il gioco le dà o.mv, la direzione del moto rispetto a dove guarda.
- Si inclina di 3° verso dove va; le maniche restano indietro fino a 4 px all'orlo, le ciocche 2 px.
- Oscillazione a tre tempi (il suo valzer): un piccolo affondo di 0,5 px a ogni tempo (p 0, 0,333, 0,667), un'alzata di 0,8 px sull'«uno» (p 0) e un rollio di ±1,2° (un ciclo).
- Lo scettro si stacca da terra di 5 px ed è portato dritto, appena inclinato dove va.
- La scia di brina la disegna il gioco.

=== COLPITA (hit, 0,6 s; nel gioco solo per le pagine) ===
- 0–0,15: un sussulto indietro di 1,5 px; la testa si gira offesa di 12° col mento su; palpebre a 0,35.
- 0–0,40: una banda di luce bianca scende sulle facce dell'abito, dalla vita all'orlo.
- 0,40–1: torna a riposo.

=== LE MOSSE (p da 0 a 1; i secondi sono del modello) ===

LANCE DI CRISTALLO (lances, 2,0 s)
Preparazione:
- 0–0,12: alza piano lo scettro sopra e dietro la testa con la destra (il cristallo sale a z 130); il corpo resta fermo; la sinistra sale a mezz'aria col palmo avanti.
- 0,10–0,28: sopra di lei, su un arco di raggio 34 intorno a (4, 0, 112), nascono da un luccichio le lance di cristallo: 5 (con o.p2: 7), lunghe 26, una ogni 0,03, ognuna cresce in 0,05.
  - Sono a ventaglio: 16° tra l'una e l'altra (fase 2: 14°), puntano avanti (verso l'eroe) e un po' in giù.
- 0,30: si fermano; il conto della corona comincia (0,30, 0,45, 0,60).
- 0,30–0,50: lampeggiano bianche una dopo l'altra («tin»); gli occhi si aprono a 0,8.
- 0,62–0,76: lo scettro sale verso il lato da cui parte il gesto (alla sua sinistra; con o.rev alla sua destra).
Colpo:
- 0,76: si accende la centrale.
- 0,76–0,90: il gesto da direttore d'orchestra, lo scettro cala di taglio verso l'altro lato.
- La lancia k parte a 0,76 + 0,025·k, nell'ordine del gesto: 5 lance tra 0,76 e 0,86, 7 tra 0,76 e 0,91.
- Partita una lancia, il modello non la disegna più: quella in volo la disegna il gioco.
Ritorno:
- 0,90–1: lo scettro torna al fianco e tocca terra a 0,97 con uno sbuffo di brina; la corona si spegne.

INCORONAZIONE (crown, 2,6 s)
Preparazione:
- 0–0,16: china la testa verso di te (14°) in un saluto regale; la sinistra va al petto; il conto corre (0,04, 0,08, 0,12, 0,16).
Primo colpo:
- 0,16–0,20: getta la testa all'indietro (16°) e le sette stalattiti si staccano e volano in alto girando su sé stesse; sopra z 160 sono sparite (entro 0,26).
- La corona resta spoglia: il cerchietto con sette monconi di 2 px e la gemma scoperta che brilla e pulsa.
- 0,20–0,56: mento alto, la sinistra alzata davanti all'altezza della spalla col palmo in giù, come chi dà un ordine; occhi a metà.
- 0,52: le stalattiti atterrano (le disegna il gioco).
- 0,56–0,74: le stalattiti ricrescono sulla corona con uno scricchiolio: centrale 0,56, interne 0,60, medie 0,65, esterne 0,70. A 0,74 la gemma è di nuovo coperta.
Secondo colpo:
- 0,58–0,93: la mano alzata si chiude piano a pugno, un dito alla volta.
- 0,93: chiude il pugno di scatto (i pilastri sparano).
Ritorno:
- 0,93–1: abbassa la mano.
Gemma scoperta (+50% nel gioco): da 0,17 a 0,74.

FIOCCO REALE (nova, 2,6 s)
Preparazione:
- 0–0,11: alza lo scettro con le due mani davanti a sé, il cristallo sopra la corona; occhi a 0,8.
- 0,11: lo pianta nel ghiaccio davanti a sé con un tonfo; il piede sta in (22, 0, 0) e intorno si aprono crepe di brina.
- 0,11–0,46: si appoggia allo scettro con le due mani, testa bassa e occhi su di te; il cristallo passa dall'azzurro al bianco; l'abito si illumina dal basso; il conto corre (0,16, 0,26, 0,36, centrale 0,46).
Colpo:
- 0,46: lampo bianco sul cristallo; le facce dell'abito lampeggiano bianche (0,46–0,49), e il vestito risuona come un bicchiere.
Scettro incastrato:
- 0,46–0,95: lo scettro resta piantato.
  - 0,62: lo strattona all'indietro (sbuffo di brina, non viene);
  - 0,78: secondo strattone;
  - 0,95: lo strappa fuori. Nella fase 2 lo strappo libera il secondo fiocco.
Ritorno:
- 0,95–1: riporta lo scettro al fianco e rialza il mento.

SALA DEGLI SPECCHI (mirror, 1,6 s)
Preparazione:
- 0–0,30: una piroetta lenta su sé stessa (+360°, ammorbidita), come la ballerina di un carillon; le maniche si aprono; il conto corre (0,05, 0,12, 0,19, 0,26).
- 0,30–0,50: di nuovo girata verso di te, punta lo scettro avanti e in alto; il cristallo lampeggia lilla a 0,45.
Si scioglie:
- 0,55–0,85: si scioglie in neve dall'orlo in su (il taglio sale da z 0 a z 130); i fiocchi turbinano e salgono; gli occhi spariscono per ultimi, a 0,85.
- 0,85–1: non si disegna niente.

ESCE DALLO SPECCHIO (emerge, 0,9 s; la usano lei e i riflessi)
- 0–0,45: esce dal vetro. Un piano di taglio nel suo corpo va da x +24 a x −40: davanti al piano si disegna, dietro no (è ancora nello specchio), con una riga di luccichii bianchi sul taglio. Esce per prima la punta dello scettro, poi la corona e il viso, poi l'abito.
  - Ripiego semplice: dissolvenza dell'alfa con lo stesso ordine dei pezzi.
- 0,45–0,80: un piccolo inchino (scende di 3 px, la testa si china di 10°, poi su) con un sorriso freddo.
- 0,80–1: a riposo.
- Il gioco le dà face π/2 (verso la telecamera, fuori dallo specchio) fino a 0,5, poi la gira verso l'eroe.

TIRO DALLO SPECCHIO (cast, 1,4 s)
- 0–0,10: allunga il braccio destro e punta lo scettro sull'eroe (il cristallo a (30, 10, 80)).
- 0,15 · 0,32 · 0,50: sul cristallo si formano una dopo l'altra tre lancette a ventaglio (±14°).
- 0,76: colpo secco del polso (lo scettro scatta avanti di 8°) e le tre lancette partono.
- 0,76–1: il braccio torna.

CORONA INCRINATA (stunned, 1,5 s)
- 0–0,12: la gemma lampeggia con una crepa di luce bianca a zigzag; lei sobbalza indietro di 2 px e spalanca gli occhi tondi (blink 1,2).
- 0,12–0,70: si porta la sinistra alla corona per tenerla, la testa piegata di 12° alla sua sinistra; dalla corona cadono schegge piccole; le palpebre tremano offese (3 Hz).
- 0,70–0,90: si raddrizza la corona con un gesto regale e un piccolo cenno («hm!»).
- 0,85–1: la crepa svanisce; torna con le palpebre a metà.

=== FASE 2: NOTTE POLARE ===
A metà vita, ma mai durante lo Sguardo, il Valzer o la Sala degli Specchi: aspetta che finiscano.

NOTTE POLARE (rage, 2,6 s)
- 0–0,12: la gemma si incrina con uno schiocco e una crepa di luce viola; lei si irrigidisce con gli occhi spalancati.
- 0,12–0,30: per la prima volta abbassa la testa (20°) e stringe lo scettro con le due mani davanti a sé.
- 0,30–0,62: la notte sale nell'abito dal basso. Una riga orizzontale va da z 0 a z 58: sotto la riga i colori della fase 2, sopra quelli della fase 1.
  - Le stelle si accendono una a una quando la riga le passa.
  - Punte dell'orlo e spuntoni crescono al passaggio della riga.
  - 0,50–0,62: i ghiaccioli delle maniche si allungano.
- 0,40–0,52: il Ventaglio d'Inverno si apre lama dopo lama, prima la centrale (0,40), poi le coppie a 0,43, 0,46, 0,49 e 0,52 (tic-tic-tic).
- 0,66–0,82: rialza piano la testa; le stalattiti crescono alla lunghezza della fase 2 e diventano viola; a 0,78 gli occhi si aprono bianchi e viola; le sopracciglia scendono.
- 0,82–0,92: alza lo scettro al cielo, con un lampo a 0,86.
- 0,92–1: lo tiene, poi lo riporta al fianco.

Da qui in poi o.p2: l'abito di notte con le stelle, la corona alta 140, il Ventaglio, gli spuntoni e i ghiaccioli lunghi, la gemma crepata.

SGUARDO D'INVERNO (gaze, 3,4 s, solo fase 2)
- 0–0,04: si blocca, il corpo fermo verso dove sei.
- 0,04–0,26: chiude piano gli occhi; la corona si spegne del tutto; la frangia tintinna; a occhi chiusi la testa gira fino all'angolo di partenza (−60° × o.sweep).
- 0,26–0,32: spalanca gli occhi, tondi, grandi, bianchi e viola, con due raggi corti di luce fredda.
- 0,32–0,92: il corpo è una statua (niente respiro). Solo la testa gira, a velocità costante:
  - angolo = o.sweep × (−60° + 120° × (p − 0,32) / 0,60);
  - è una formula lineare, così testa e cono del gioco coincidono;
  - i raggi la seguono.
- 0,92–1: socchiude gli occhi e torna a guardarti dall'alto, col mento su.

VALZER DELLA TORMENTA (waltz, 3,6 s, solo fase 2)
- 0–0,12: un inchino da ballo: piccola riverenza, il braccio sinistro apre la manica come un'ala, lo scettro tenuto di traverso; il Ventaglio si apre di +8°; il conto corre (0,03, 0,06, 0,09, 0,12).
- 0,12–0,70: scivola lungo tre archi (la sposta il gioco).
  - Un giro intero su sé stessa per arco: 0,12–0,313, 0,313–0,507, 0,507–0,70, a velocità costante.
  - Braccia aperte, abito inclinato di 6° dentro la curva, neve che le gira intorno.
  - Un'alzata di 2 px su ogni «uno» (0,12, 0,313, 0,507).
  - Il gioco le dà come face la direzione in cui scivola; i giri li aggiunge il modello.
- 0,70–0,95: piroetta sul posto, due giri sempre più rapidi, le braccia che si chiudono, la neve che si raccoglie in un anello.
- 0,95: spalanca le braccia (partono i fiocchi).
- 0,95–1: si ferma dritta e il Ventaglio torna a posto.

=== ENTRATA: «SPECCHIO, SPECCHIO…» (enter, 3,4 s) ===
Il modello disegna dietro di lei (corpo x −16) uno specchio ad arco di ghiaccio alto 64 e largo 40, con la cornice d'argento a filigrana e il vetro blu notte.
- 0–0,18: lo specchio è solo; un luccichio corre sul vetro; la brina sale lungo la cornice dal basso.
- 0,18–0,32: nel vetro compare la sua sagoma scura (tagliata dentro il vetro, #121A40 a 0,7); a 0,28 si accendono due puntini azzurri: gli occhi, prima di tutto il resto.
- 0,32–0,58: esce dal vetro, che si increspa come acqua (cerchi concentrici).
  - Prima la punta dello scettro (0,34), poi la corona (0,38), poi viso e abito (0,42–0,56).
  - Il piano di taglio va da x −16 a +40; la parte ancora dietro si vede dentro il vetro, più scura.
  - Dal basso esce la nebbia.
- 0,58–0,74: dietro di lei lo specchio si crepa dall'angolo in alto a sinistra (0,58–0,64) e va in frantumi a 0,66; le schegge cadono e diventano brina (0,66–0,74).
- 0,74–0,90: alza il mento; la corona fa il suo conto con i tin (0,76, 0,80, 0,84, 0,88): l'orologio, mostrato una volta.
- 0,90–1: a 0,92 batte il piede dello scettro a terra. Il gioco fa l'anello di brina, le torce azzurre, il grido e la barra.

=== SCONFITTA: «L'ULTIMO INCHINO» (die, 4 s; momento clou a 0,575, cioè 2,3 s) ===
- 0–0,12: il colpo la fa indietreggiare per la prima volta (6 px); la corona le scivola di sbieco (15°).
- 0,12–0,42: si raddrizza, regale fino alla fine, e fa una riverenza lenta e profonda: il corpo scende di 10 px, lo scettro tenuto di lato, la testa china, la manica sinistra aperta; gli occhi si chiudono.
- 0,42–0,56: crepe di luce bianca salgono sulle facce dell'abito dall'orlo al corpetto, come su uno specchio che si spacca; la luce degli occhi si spegne.
- 0,575 (clou): si scioglie in un vortice di fiocchi di neve e brillantini che sale a spirale. È morbido, non sono frantumi pesanti: quelli sono dello Yeti. A 0,62 il corpo non c'è più.
- 0,575–0,70: in aria resta la corona da sola (z 100) per un attimo, poi cade. A 0,70 tocca terra con un «tin», rimbalza (0,70–0,76, 6 px su) e perde una stalattite, che scivola via.
- 0,58–0,72: lo scettro si inclina e cade di traverso, con un tonfo a 0,72.
- 0,70–0,90: la neve cade sul posto e fa un cumulo morbido (r 22, alto 8).
- 0,80–1: sul cumulo la corona e lo scettro di traverso; la gemma si spegne piano; cadono gli ultimi fiocchi.
Se ne va come una regina: niente di triste o brutto per i bambini.

=== PRESA IN GIRO (taunt, 1,2 s) ===
- 0–0,18: la brina si raccoglie nella sua sinistra e diventa uno specchietto ovale con la cornice d'argento (9×12).
- 0,18–0,50: lo alza, si ammira, gira la testa a destra e a sinistra (±12°) con un sorriso compiaciuto.
- 0,50–0,85: ti guarda da sopra lo specchietto e ride: le spalle sobbalzano tre volte (0,55, 0,65, 0,75), gli occhi diventano mezzelune, lo specchietto luccica a 0,6.
- 0,85–1: lo specchietto si scioglie in neve dall'alto e la mano torna alla vita.

=== OPZIONI DEL MODELLO ===
- o.p2: la fase 2 (aspetto e varianti delle mosse: 7 lance, ventaglio, stelle).
- o.ghost: il riflesso.
  - Alfa 0,6, colori più chiari (lt 0,25), un filo di crepa in diagonale sul corpo.
  - Niente ombra, niente luce dentro, niente nebbia; corona spenta; occhi meno accesi (bagliore a metà).
  - Facoltativo, se costa poco: o.mirror per tenere lo scettro nell'altra mano. Il segno vero resta l'ombra con la corona accesa.
- o.mv: direzione del moto rispetto a dove guarda (walk).
- o.sweep: ±1, il verso dello Sguardo.
- o.rev: 0 o 1, il gesto e l'ordine delle lance da destra a sinistra (la raffica di ritorno della fase 2).
- o.crown: da 0 a 1, forza la corona accesa tutta (la vera nella Sala degli Specchi).
- o.noFx: niente effetti delle mosse.
Il gioco passa o.p2, e tramite N3G.opt mv, sweep, rev e crown.

=== DISEGNI DA ESPORTARE PER IL GIOCO ===
Hanno lo stesso aspetto della Regina e il prefisso del modello, così mk_boss2.py --modello li rinomina da solo. Se mancano, il gioco usa disegni semplici.

- N3.icequeen2Lance(x, y, z, a, sc, o): la lancia di cristallo in volo.
  - Lunga 26, 4 facce, cuore bianco, bagliore azzurro; a = direzione.
  - o.p2 viola; o.small a 0,75 (le lancette del tiro); o.ghost pallida (quelle dei riflessi).
- N3.icequeen2Pillar(x, y, z, k, sc, o): la stalattite-pilastro dell'Incoronazione.
  - Alta 34, base r 10 (sta nell'ostacolo r 12).
  - z = altezza mentre cade (gira con o.spin).
  - k = vita a terra: 0 si pianta (crepe e polvere di brina), fino a 0,85 ritta con un luccichio lento, da 0,85 a 1 si scioglie in brina.
  - o.p2, o.seed.
- N3.icequeen2Spike(x, y, h, k, sc, o): la punta di ghiaccio del Fiocco Reale (h 20) e della scia del Valzer (h 16).
  - k: 0–0,15 sale, 0,15–0,80 resta, 0,80–1 si sbriciola.
  - o.a direzione della sua riga (si piega di lato), o.seed, o.p2.
- N3.icequeen2Mirror(x, y, k, sc, o): lo specchio ad arco della Sala.
  - Alto 46, largo 30, sempre girato verso la telecamera.
  - k: 0–0,25 sale dal pavimento, poi è in piedi.
  - o.ripple da 0 a 1 (cerchi sul vetro); o.crack da 0 a 3; o.shatter da 0 a 1 (va in pezzi); o.eyes da 0 a 1 (i suoi due occhi dentro il vetro, che guardano verso l'angolo o.look); o.inside da 0 a 1 (la sua sagoma scura dentro, quando i riflessi rientrano); o.p2 cornice viola.
- N3.icequeen2Ice(x, y, k, sc, o): il cubo di ghiaccio dell'eroe congelato.
  - Largo 30 e alto 34.
  - k: 0–0,15 si forma (la brina sale), 0,15–0,8 tiene con i luccichii, 0,8–1 si crepa e va in pezzi.
- N3.icequeen2Shard(x, y, z, a, sc, o): la scheggia piccola (lunga 10), per i pilastri e lo scoppio degli specchi.
- N3.icequeen2Flake(x, y, z, a, sc, o): il fiocco di neve del Valzer, r 7, sei bracci, bianco col cuore azzurro, che gira con a.

=== PITTURA, LOWFX E COSTO ===
- Pittura come la lanterna: tre toni su ogni pezzo, bordo caldo (rim), shadeLimb sulle braccia, glowTop sulle punte accese, segni leggeri (ricami, spigoli), bagliori morbidi.
- Ghiaccio a facce piatte coi toni netti come una gemma; velluto a tre toni morbidi.
- Obiettivo di costo 1,2 ms come il Golem, al massimo 1,4. Per arrivarci:
  - facce e profili dell'abito, delle stalattiti e del Ventaglio calcolati una volta (come le pietre ritte del Golem);
  - niente sfumature sulle punte piccole;
  - niente ctx.filter.
- Un riflesso con o.ghost costa al massimo 0,7 ms: nella Sala, una vera e tre riflessi stanno sotto i 3,5 ms.
- Con LOWFX:
  - via: stelle, nebbia, luccichio del fermo, sbuffi di fiato e la neve fitta del Valzer e della sconfitta (resta quella poca);
  - la luce dentro l'abito resta ferma;
  - il Ventaglio è opaco;
  - restano le punte accese della corona (sono l'avviso), gli occhi e tutti gli avvisi a terra.

=== L'ARENA CHE REAGISCE (ENV2, b3mark, b3torch, come gli altri boss) ===
- Lance: dove si piantano contro muri e ostacoli lasciano un segno di brina (ENV2.mark 'frost', piccolo) e l'ostacolo trema. Alla partenza le torce diventano azzurre per un attimo.
- Incoronazione: i pilastri che si piantano crepano il pavimento (cracks e frost) e fanno tremare gli ostacoli vicini. Quando si sciolgono resta una macchia di brina.
- Fiocco Reale:
  - lungo i bracci resta il disegno del fiocco di brina, cotto nel pavimento (pochi segni frost lungo ogni braccio);
  - gli ostacoli tremano;
  - cadono due o tre ghiaccioli dal soffitto (ENV2.fall, solo decoro);
  - le torce diventano bianco-azzurre.
- Specchi: quando vanno in frantumi restano a terra schegge che luccicano (b3mark 'shards'); i cerchi di brina restano.
- Sguardo: gli ostacoli toccati dalla luce tremano e perdono brina; dove è passato il cono restano tre segni di brina a ventaglio.
- Valzer: la sua curva resta come brina; nevica dal soffitto mentre balla.
- Fase 2:
  - per tutto il resto del combattimento le torce restano viola-bianco (#7a3cff, #b48aff, #f4eeff con luce 200,160,255);
  - nell'aria c'è il doppio della neve della stanza;
  - la stanza non diventa mai buia.
- Sconfitta: la brina sul pavimento sbiadisce e le torce diventano calde per un attimo.

=== FUORI DALLA BATTAGLIA ===
- Prologo (91, quadro IV «I re»): chiama N3.icequeen a sc 0,5. Il cervello avvolge N3.icequeen e, quando PRO.on è vero, porta la grandezza a 0,29: alta come quella di oggi, con la testa a ~28, dove il prologo disegna già gli occhi (26). Va guardato il quadro: corona e scettro dentro il trono.
- Anteprima e sblocco dell'arena 8 (61): il boss a 1,3 viene alto ~166 nella miniatura; da controllare con tests/anteprime.js.
- Guida (44), riga nuova: «Boss. Lance di cristallo, la corona che ti chiude in gabbia, il Fiocco Reale e la Sala degli Specchi (la vera ha l'ombra); nella fase 2 lo Sguardo d'Inverno e il Valzer della Tormenta.»
- Il riflesso di oggi (qmirror) diventa il modello stesso con o.ghost: N3.qmirror e N3.meta.qmirror rifatti dal cervello.

=== RISCHI DA CONTROLLARE NEI FOGLI ===
- Sagoma: che non sembri un albero di Natale o il pupazzo di oggi (vita stretta, spalle, maniche, facce irregolari). Da guardare anche a un terzo della grandezza.
- Contrasto: va provata nella stanza vera, con la tinta dell'arena 8 e con LOWFX. La base dell'abito deve restare più scura del pavimento.
- Lo scettro sempre fuori dall'abito, in tutte le 16 direzioni.
- Pezzi attaccati in tutte le direzioni:
  - le maniche;
  - corona e frangia con la telecamera della testa, anche a ±60° nello Sguardo;
  - le ciocche che seguono a metà;
  - il Ventaglio dietro o davanti secondo la telecamera.
- Somiglianze con gli altri boss:
  - Cervo d'Aurora (stesso mondo): niente colori d'aurora; il Fiocco parte da lei e non è un anello.
  - Yeti: la sconfitta è un vortice di neve, non frantumi.
  - Burattinaio: le copie sono lei, e lei sparisce in neve bianca, non in un'ombra.
  - Golem: lo Sguardo insegna a ripararsi come il Raggio, ma è un cono che gira con la sua freccia ed esiste solo nella fase 2.
- Il conto della corona a fine entrata somiglia alle corna del Cervo che si accendono: qui però è un ritmo di quattro tin che poi rivedi in battaglia.
- Gelo: deve durare poco e vedersi bene (0,7 s, cubo che si crepa).

## Le mosse del modello

| id | nome | secondi | descrizione |
|---|---|---|---|
| `idle` | Fermo | 3 | Statua che respira (petto 1 px, spalle 0,6, un ciclo). A 0,50 sbuffo di fiato freddo. La testa segue l'eroe con ±4°; mento su di 6° da 0,30 a 0,45, tenuto fino a 0,70, giù entro 0,85. Palpebre a metà (0,55), chiusura lenta 0,78–0,90. Luccichio bianco sulle punte della corona da sinistra a destra (0,10–0,40, una punta ogni 0,04). Il cristallo dello scettro pulsa e la luce dentro l'abito respira con lui. Frangia e ghiaccioli dondolano ±1 px (due cicli). Le dita della sinistra tamburellano due volte sul corpetto (0,88–0,98). Nebbia da sotto l'orlo. Si chiude su sé stesso. |
| `walk` | Scivola | 1.4 | Nessun passo: tutto il corpo scorre, sempre girata verso l'eroe; o.mv = direzione del moto rispetto a dove guarda. Inclinata di 3° verso dove va, maniche indietro fino a 4 px, ciocche 2 px. Tre tempi: affondo di 0,5 px a 0, 0,333 e 0,667, alzata di 0,8 px sull'«uno» (p 0), rollio ±1,2° (un ciclo). Scettro staccato da terra di 5 px, portato dritto. Si chiude su sé stesso. |
| `hit` | Colpita | 0.6 | 0–0,15 sussulto indietro di 1,5 px, testa girata offesa di 12° col mento su, palpebre 0,35. 0–0,40 banda di luce bianca che scende sulle facce dell'abito dalla vita all'orlo. 0,40–1 ritorno. Nel gioco solo per le pagine. |
| `lances` | Lance di Cristallo | 2 | 0–0,12 scettro su dietro la testa (cristallo a z 130), sinistra a mezz'aria. 0,10–0,28 nascono 5 lance (o.p2: 7) su un arco sopra la testa (raggio 34 intorno a (4,0,112)), una ogni 0,03, lunghe 26, a ventaglio di 16° (fase 2: 14°), puntate avanti. 0,30 si fermano: conto della corona 0,30, 0,45, 0,60; lampeggiano una a una fino a 0,50; occhi a 0,8. 0,62–0,76 lo scettro sale al lato di partenza (sua sinistra; o.rev sua destra). 0,76 centrale accesa e gesto da direttore d'orchestra fino a 0,90: la lancia k parte a 0,76+0,025·k nell'ordine del gesto (il gioco la prende in consegna). 0,90–1 scettro al fianco, tocca terra a 0,97. |
| `crown` | Incoronazione | 2.6 | 0–0,16 saluto regale (testa china 14°), sinistra al petto, conto 0,04, 0,08, 0,12, 0,16. 0,16–0,20 testa all'indietro (16°): le 7 stalattiti volano via girando (sparite a 0,26); corona spoglia coi monconi e la gemma scoperta che pulsa. 0,20–0,56 mento alto, sinistra alzata col palmo in giù. 0,52 atterraggio (lo disegna il gioco). 0,56–0,74 le stalattiti ricrescono: centrale 0,56, interne 0,60, medie 0,65, esterne 0,70; gemma coperta a 0,74. 0,58–0,93 la mano alzata si chiude piano a pugno, un dito alla volta. 0,93 pugno chiuso di scatto (sparano i pilastri). 0,93–1 abbassa la mano. Gemma scoperta da 0,17 a 0,74. |
| `nova` | Fiocco Reale | 2.6 | 0–0,11 scettro alzato con due mani davanti a sé, occhi a 0,8. 0,11 lo pianta nel ghiaccio davanti a sé (piede in (22,0,0)): tonfo e crepe di brina. 0,11–0,46 appoggiata allo scettro, testa bassa e occhi su; il cristallo passa dall'azzurro al bianco; l'abito si illumina dal basso; conto 0,16, 0,26, 0,36, centrale 0,46. 0,46 lampo, facce dell'abito bianche (0,46–0,49): esplodono le punte (gioco). 0,46–0,95 scettro incastrato: strattone a 0,62 e a 0,78, strappo a 0,95 (nella fase 2 libera il secondo fiocco). 0,95–1 scettro al fianco, mento su. |
| `mirror` | Sala degli Specchi | 1.6 | 0–0,30 piroetta lenta di 360°, maniche aperte, conto 0,05, 0,12, 0,19, 0,26 (a 0,26 il gioco disegna i cerchi di brina). 0,30–0,50 girata verso l'eroe, punta lo scettro avanti e su; lampo lilla a 0,45 (salgono gli specchi). 0,55–0,85 si scioglie in neve dall'orlo in su (taglio da z 0 a 130), fiocchi che turbinano; gli occhi spariscono per ultimi a 0,85. 0,85–1 non si disegna niente. |
| `emerge` | Esce dallo specchio | 0.9 | La usano lei e i riflessi (o.ghost). 0–0,45 un piano di taglio nel corpo va da x +24 a x −40: prima la punta dello scettro e la corona, poi il viso, poi l'abito, con luccichii sul taglio (ripiego: dissolvenza nello stesso ordine). 0,45–0,80 piccolo inchino (giù di 3 px, testa china di 10°), sorriso freddo. 0,80–1 riposo. Il gioco dà face π/2 fino a 0,5, poi la gira verso l'eroe. |
| `cast` | Tiro dallo specchio | 1.4 | 0–0,10 braccio destro teso, scettro puntato sull'eroe (cristallo a (30,10,80)). Sul cristallo nascono tre lancette a ventaglio di ±14° a 0,15, 0,32 e 0,50. 0,76 colpo secco del polso (lo scettro scatta avanti di 8°): partono. 0,76–1 il braccio torna. Niente conto della corona: la vera la tiene accesa con o.crown. |
| `stunned` | Corona incrinata | 1.5 | 0–0,12 la gemma lampeggia con una crepa bianca a zigzag; sobbalzo indietro di 2 px, occhi tondi spalancati (blink 1,2). 0,12–0,70 la sinistra tiene la corona, testa piegata 12° alla sua sinistra, cadono schegge piccole dalla corona, palpebre che tremano offese (3 Hz). 0,70–0,90 si raddrizza la corona con un gesto regale e un cenno («hm!»). 0,85–1 la crepa svanisce, palpebre a metà. |
| `gaze` | Sguardo d'Inverno (fase 2) | 3.4 | 0–0,04 corpo bloccato verso l'eroe. 0,04–0,26 chiude piano gli occhi, la corona si spegne del tutto, la frangia tintinna; a occhi chiusi la testa va all'angolo di partenza (−60°×o.sweep). 0,26–0,32 spalanca gli occhi tondi, grandi, bianchi e viola, con due raggi corti. 0,32–0,92 il corpo è una statua (niente respiro); solo la testa gira a velocità costante: angolo = o.sweep×(−60°+120°×(p−0,32)/0,60); i raggi seguono la testa. 0,92–1 socchiude gli occhi, testa di nuovo sull'eroe, mento su. |
| `waltz` | Valzer della Tormenta (fase 2) | 3.6 | 0–0,12 inchino da ballo: piccola riverenza, la manica sinistra aperta come un'ala, scettro di traverso, Ventaglio aperto di +8°; conto 0,03, 0,06, 0,09, 0,12. 0,12–0,70 tre archi (la sposta il gioco; face = direzione in cui scivola): un giro intero su sé stessa per arco (0,12–0,313, 0,313–0,507, 0,507–0,70), braccia aperte, abito inclinato 6° nella curva, neve intorno, alzata di 2 px a ogni «uno». 0,70–0,95 piroetta sul posto, due giri sempre più rapidi, braccia che si chiudono, neve in anello. 0,95 braccia spalancate (fiocchi). 0,95–1 si ferma dritta. |
| `rage` | Notte Polare (fase 2) | 2.6 | 0–0,12 la gemma si incrina con uno schiocco e una crepa viola; si irrigidisce, occhi spalancati. 0,12–0,30 per la prima volta abbassa la testa (20°) e stringe lo scettro con due mani. 0,30–0,62 la notte sale nell'abito da z 0 a 58 (sotto la riga i colori della fase 2, sopra quelli della fase 1); le stelle si accendono al passaggio; orlo e spuntoni crescono; ghiaccioli delle maniche più lunghi da 0,50 a 0,62. 0,40–0,52 il Ventaglio d'Inverno si apre: centrale 0,40, coppie a 0,43, 0,46, 0,49, 0,52. 0,66–0,82 rialza la testa, le stalattiti crescono alla lunghezza della fase 2 e diventano viola, occhi bianco-viola a 0,78, sopracciglia giù. 0,82–0,92 scettro al cielo, lampo a 0,86. 0,92–1 lo tiene e lo riporta al fianco. |
| `taunt` | Presa in giro | 1.2 | 0–0,18 la brina si raccoglie nella sinistra e diventa uno specchietto ovale (cornice d'argento, 9×12). 0,18–0,50 si ammira girando la testa ±12° con un sorriso compiaciuto. 0,50–0,85 ti guarda da sopra lo specchietto e ride: spalle che sobbalzano tre volte (0,55, 0,65, 0,75), occhi a mezzaluna, luccichio dello specchietto a 0,6. 0,85–1 lo specchietto si scioglie in neve dall'alto e la mano torna alla vita. |
| `enter` | Entrata: «Specchio, specchio…» | 3.4 | Specchio ad arco disegnato dal modello dietro di lei (x −16), alto 64 e largo 40. 0–0,18 specchio solo, luccichio sul vetro, brina sulla cornice. 0,18–0,32 la sua sagoma scura nel vetro; a 0,28 si accendono i due occhi azzurri. 0,32–0,58 esce dal vetro che si increspa: punta dello scettro 0,34, corona 0,38, viso e abito 0,42–0,56 (taglio da x −16 a +40), nebbia dal basso. 0,58–0,74 lo specchio si crepa dall'angolo in alto a sinistra, va in frantumi a 0,66, le schegge diventano brina. 0,74–0,90 mento su e conto della corona 0,76, 0,80, 0,84, 0,88. 0,92 batte il piede dello scettro a terra (anello di brina, grido, barra). |
| `die` | Sconfitta: l'ultimo inchino | 4 | 0–0,12 indietreggia di 6 px per la prima volta, la corona di sbieco di 15°. 0,12–0,42 si raddrizza e fa una riverenza lenta e profonda (giù di 10 px, scettro di lato, testa china, manica aperta), gli occhi si chiudono. 0,42–0,56 crepe di luce bianca salgono sull'abito, la luce degli occhi si spegne. 0,575 (clou, 2,3 s) si scioglie in un vortice di fiocchi e brillantini che sale a spirale; a 0,62 il corpo non c'è più. La corona resta sospesa a z 100, cade, tocca terra a 0,70 («tin»), rimbalza fino a 0,76 e perde una stalattite. Lo scettro cade di traverso (0,58–0,72). 0,70–0,90 cumulo di neve (r 22, alto 8). 0,80–1 corona e scettro sul cumulo, la gemma si spegne. |

## Le abilità nel gioco

IL CERVELLO NEL GIOCO: src/js/89-regina-nuova.js
- Si accende solo se c'è N3.icequeen2 (come G2ON nel Golem).
- Si prova col modello finto anteprime/boss2/icequeen_stub.js: la Regina di oggi che fa le mosse nuove, con le stesse durate di N3.meta.icequeen2.dur.
- Ogni stato ha il nome di una mossa del modello e il colpo vero parte nel suo fotogramma: b3go, b3tick, b3k, b3at di 81.
- Danni sempre prima di DMG().
- Avvisi rossi (229,72,77), ognuno di almeno 0,6 s veri.

=== 1. COLLEGAMENTI (come il Golem) ===
- Modello:
  - N3.icequeen = N3.icequeen2;
  - N3.meta.icequeen = copia di N3.meta.icequeen2, con old = il disegno di oggi;
  - N3.qmirror = (x,y,f,a,p,sc,o) => N3.icequeen2(x,y,f,a,p,sc,{...o,ghost:1}), e N3.meta.qmirror con le stesse mosse.
- Prologo: avvolgere N3.icequeen; se PRO.on è vero, sc×0,58 (da 0,5 a 0,29).
- Dati del boss:
  - ET.icequeen.r 28 (vita 7.200 come oggi, contatto 22, oro 140);
  - ET.qmirror.r 16;
  - BOSS_INTRO.icequeen 3,4;
  - BDEATH.icequeen {dur:4, clou:2.3, snd:'shimmer'};
  - snapBoss → {live:1};
  - BDIE.icequeen e drawCorpse: li disegna il modello con 'die', come il Golem.
- Alone e barra:
  - B2H.icequeen 115;
  - B2T.icequeen [['140,225,255','200,160,255'],'220,240,255'];
  - RUNEC.regina ['140,225,255','200,160,255'].
- Da spegnere per lei (li sostituisce il modello):
  - B2.icequeen.back e front;
  - B2G.icequeen (il fiocco a terra);
  - i luccichii di b2aura;
  - la convergenza di particelle e l'anello di b2front al cambio di stato (il suo avviso è la corona);
  - le reazioni vecchie in 52 per nova, blizzard e storm;
  - queenWings, i rombi che le girano intorno, EDRAW e EDRAW.qmirror di oggi;
  - ESHADOW.icequeen vuoto (l'ombra la fa il modello; i riflessi non la hanno);
  - ELIGHT: una luce a (e.x, e.y−60, raggio 130, 0,8).
- Spegnere bossExtra per lei: l'anello di sfere rosa delle arene 5–8 rovinerebbe la lettura.
- N3G.opt.icequeen = e => ({mv: e.mv3||0, sweep: e.sweep||1, rev: e.rev||0, crown: e.crownLit||0}).
- N3G.wp.icequeen: la scivolata segue il suo orologio, come il Golem.
- n3Move avvolto:
  - entrata su tutta la durata;
  - lo stato 'hall' gioca 'idle';
  - lo stato 'hallEnd' gioca 'idle'.

=== 2. VELOCITÀ E AVVISI ===
- L'arena 8 accelera i boss di 1,27–1,30 (bossLvl().spd). Nella fase 2 il cervello moltiplica il dt per 1,15 (il Golem per 1,3). In tutto fino a 1,5.
- Ogni avviso dura almeno 0,91 s del modello, quindi sta sopra 0,6 s veri anche a 1,5.
- Il cervello calcola le durate degli avvisi in tempo vero, come il Golem: lead = frazione × durata / velocità totale.
- shootE moltiplica la velocità per min(1,7, 1+(effRoom−1)×0,035): nella stanza della Regina (stanza 10, capitolo 4) fa ×1,525. Più sotto scrivo il valore da passare a shootE e la velocità vera.
- Colpi in volo:
  - partono da sopra di lei (e.y−40), come le schegge di oggi;
  - si mirano dal punto di partenza verso (P.x, P.y−6);
  - le linee rosse a terra partono dallo stesso punto con la stessa direzione: la linea è proprio la strada del colpo.

=== 3. SCIVOLATA (stato 'walk') ===
- Velocità 70 px/s (fase 2: 80), con moveCircle; sempre girata verso l'eroe (e.face = angolo verso l'eroe).
- e.mv3 = direzione del moto − e.face.
- Meta: un punto a 170–240 px dall'eroe, dentro L+50…R−50 e TOP+90…BOT−90, lontano dagli ostacoli (r+28); meglio nel 60% alto della stanza. Si cambia quando la raggiunge o dopo 1,2 s.
- Scia di brina: particelle che svaniscono in 1 s, non segni cotti nel pavimento. Una ogni 14 px, con LOWFX ogni 28.
- Dopo ogni mossa scivola per rand(1,2–1,7) s del modello (fase 2: rand(1,1–1,5)).
- Contatto: 22.

=== 4. ORDINE DELLE MOSSE ===
- Fase 1: lances → crown → nova → mirror, poi da capo.
- Fase 2: dopo la rage, crown → gaze → lances → lances (o.rev=1, mirata di nuovo) → mirror → waltz → nova, poi da capo.
- Lo Sguardo viene sempre subito dopo l'Incoronazione, così ci sono i pilastri per ripararsi (come il Raggio del Golem dopo la Frana).
- Mai due attacchi insieme: i pericoli che restano (pilastri, scia) finiscono prima della mossa dopo.

=== 5. LE ABILITÀ ===

LANCE DI CRISTALLO (lances, 2,0 s)
- Avviso:
  - a p 0,30 il cervello fissa a0 = angolo dal punto di partenza (e.x, e.y−40) verso l'eroe;
  - disegna una linea rossa tratteggiata per ogni lancia, con direzione a0 + (k−(n−1)/2)·Δ, fino al muro o all'ostacolo;
  - n=5 e Δ=16° (fase 2: n=7, Δ=14°);
  - linee piene e lampeggianti da 0,62.
- Colpo: la lancia k parte a p 0,76 + 0,025·k, nell'ordine del gesto (da sinistra a destra rispetto a lei; con o.rev al contrario).
  - shootE(e.x, e.y−40, θk, 200, 6, 14, 'qlance'): circa 305 px/s veri, raggio 6, danno 14.
  - EPDRAW.qlance con N3.icequeen2Lance; scia TRC '170,235,255'.
- Le lance si fermano contro muri e ostacoli, compresi i pilastri, e lasciano un segno di brina.
- Avviso vero: (0,76−0,30)×2,0 = 0,92 s del modello = 0,72 s veri (0,62 nella fase 2).
- Schiva: a 200 px tra due linee restano 56 px (fase 2: 49) e l'eroe ne occupa 24. Un passo di lato dalla linea di mezzo.
- Fase 2: subito una seconda volta con o.rev=1, che si mira di nuovo alla sua p 0,30.

INCORONAZIONE (crown, 2,6 s)
- Primo avviso, p 0,16:
  - C = posizione dell'eroe (dentro la stanza);
  - 7 punti su un cerchio di raggio 72 intorno a C, a 51,4° l'uno dall'altro, con un giro di partenza a caso;
  - si saltano i punti fuori da L+20…R−20 / TOP+30…BOT−20 o a meno di r+16 da un ostacolo; se ne restano meno di 4, C si sposta fino a 40 px dal muro e si riprova;
  - su ogni punto un cerchio rosso di raggio 16 con l'ombra che cresce;
  - le stalattiti cadono dal cielo (N3.icequeen2Pillar, z da 260 a 0, girano) tra p 0,30 e 0,52.
- Colpo 1, p 0,52 (avviso 0,94 s del modello = 0,73 s veri):
  - chi è a meno di 21 px da un punto prende 16, e quella stalattite va in pezzi invece di piantarsi (mai un pilastro sopra l'eroe);
  - le altre diventano pilastri: ostacoli temporanei r 12, kind 'qpillar', disegnati da N3.icequeen2Pillar, vita 7 s;
  - fields={} quando compaiono e quando spariscono;
  - si crepa il pavimento (cracks e frost) e trema ENV2.rocks(C, 120, 1).
- Secondo avviso, p 0,58: una linea rossa larga 12 da ogni pilastro.
  - Fase 1: fino a C.
  - Fase 2: attraverso C fino al muro. Con 7 pilastri, il numero dispari è voluto: ogni colpo esce in mezzo al varco opposto, e chi è appena uscito da un varco è sulla linea.
- Colpo 2, p 0,93 (avviso 0,91 s del modello = 0,71 s veri; fase 2 0,62): ogni pilastro spara una scheggia verso C.
  - shootE(px, py−14, verso C, 190, 6, 14, 'qshard'): circa 290 px/s veri, danno 14.
  - Fase 1: vita = distanza/290, così la scheggia si rompe in C con un piccolo scoppio.
  - Fase 2: vola fino al muro.
- Punto debole: da p 0,17 a 0,74 la gemma è scoperta e i colpi fanno +50%. Il cervello avvolge hurtE: per type 'icequeen', st 'crown' e b3k tra 0,17 e 0,74, danno ×1,5. La prima volta nella partita scrive «Colpo alla corona!».
- Schiva:
  - non stare sotto i cerchi;
  - nella fase 1 esci dall'anello da un varco (40 px di spazio tra due pilastri);
  - nella fase 2 mettiti appena fuori dall'anello, dietro un pilastro: dietro un pilastro si è sempre al sicuro.
- Ostacoli temporanei al massimo 11 insieme (pilastri e specchi): il più vecchio si scioglie (Pillar k da 0,85 a 1, 0,5 s).

FIOCCO REALE (nova, 2,6 s)
- Avviso, p 0,11:
  - F = b3pt(e, 22, 0), il piede dello scettro davanti a lei;
  - 6 bracci rossi larghi 24 da F, il primo puntato sull'eroe, poi uno ogni 60°;
  - ogni braccio va fino al muro o al primo ostacolo (dietro un ostacolo si è al sicuro), con i rametti laterali disegnati solo per decoro (non fanno male);
  - il rosso si riempie da F verso fuori tra p 0,11 e 0,30.
- Colpo, p 0,46 (avviso 0,91 s del modello = 0,71 s veri; fase 2 0,61):
  - lungo ogni braccio una fila di punte corre da F verso fuori a 420 px/s, una punta ogni 18 px (N3.icequeen2Spike, h 20; sale 0,06 s, resta 0,30, si sbriciola 0,12);
  - danno 18 se l'eroe è a meno di 20 px da una punta mentre sale, una volta sola per fiocco, mai durante lo scatto o se è invulnerabile.
- Fase 2: a p 0,46 compare il secondo fiocco, girato di 30°, ed esplode a p 0,95, quando lei strappa lo scettro (avviso 1,27 s del modello = 0,87 s veri). Le punte del primo a quel punto sono già sparite.
- Scettro incastrato: da p 0,46 a 0,95 non attacca, è il momento di colpirla (circa 1 s vero nella fase 1). Non c'è un bonus di danno.
- Schiva: stai tra due bracci (lontano da lei lo spazio è largo). Nella fase 2 spostati a metà tra un braccio del primo fiocco e uno del secondo (a 15° da tutti e due).

SALA DEGLI SPECCHI (mirror 1,6 s → emerge 0,9 s → 'hall' fino a 6 s veri; cast 1,4 s; stunned 1,5 s)
- Specchi:
  - a p 0,26 il cervello sceglie 3 posti (fase 2: 4) su un cerchio di raggio 150 intorno all'eroe, alla stessa distanza tra loro e con un giro a caso;
  - ogni posto dentro L+40…R−40 / TOP+70…BOT−50, a più di r+30 dagli ostacoli e a più di 110 px dagli altri posti; se un posto non va bene si gira di ±25°, poi il raggio scende a 120;
  - cerchi di brina a terra (r 22);
  - a p 0,45 salgono gli specchi: ostacoli temporanei r 14, kind 'qmirror', N3.icequeen2Mirror con k da 0 a 0,25 in 0,4 s, gli occhi di lei nel vetro (o.eyes, o.look verso l'eroe); fields={};
  - gli specchi guardano sempre verso la telecamera.
- A p 0,85:
  - lei diventa invisibile (e.hidden) e si sposta davanti a uno degli specchi scelto a caso: 16 px più in basso sullo schermo, così non resta mai nascosta dietro il vetro;
  - davanti agli altri specchi nascono i riflessi (makeE 'qmirror', due colpi per romperli: il cervello conta i colpi, non la vita; niente oro, niente esperienza);
  - tutte giocano 'emerge' insieme, poi lo stato 'hall'.
- Nella Sala:
  - tutte scivolano piano (20 px/s), al massimo 24 px dal loro specchio, girate verso l'eroe;
  - indizi: solo la vera ha l'ombra a terra e la corona tutta accesa (o.crown=1, e.crownLit=1); i riflessi hanno o.ghost (alfa 0,6, più chiari, una crepa, niente ombra, corona spenta);
  - ogni 1,2 s veri una delle Regine ancora intere tira, a turno, partendo da una a caso e mai la stessa due volte di fila: gioca 'cast';
  - linee rosse da p 0,10, partenza a p 0,76 (0,92 s del modello = 0,72 s veri);
  - tre lancette a ±14°: shootE(…, 165, 5, 12 la vera / 8 i riflessi, 'qlance'), circa 250 px/s veri; con o.small, e o.ghost per i riflessi.
- Trovata: se un colpo diretto dell'eroe (hurtE senza dot) prende la vera:
  - scritta «Specchio infranto!»;
  - tutti i riflessi e gli specchi vanno in frantumi (brillantini, b3mark 'shards' che restano; nessun danno);
  - lei gioca 'stunned' (1,5 s): non attacca, non si muove, i colpi fanno +50% («Colpo alla corona!» la prima volta);
  - poi scivola.
- Riflesso colpito due volte: si rompe in neve, e il suo specchio anche.
- Se in 6 s veri non la trovi (stato 'hallEnd'):
  - i riflessi rientrano negli specchi (alfa giù in 0,4 s; Mirror o.inside);
  - poi un cerchio rosso di raggio 30 sotto ogni specchio, anche il suo, per 0,8 s veri;
  - poi ogni specchio scoppia in 6 schegge lente (shootE 85, 5, 10, 'qshard', circa 130 px/s veri), radiali con un giro a caso;
  - poi lei scivola.
- Il tiro dell'eroe mira al nemico più vicino, quindi trovarla vuol dire avvicinarsi a quella con l'ombra: un gioco di posizione.
- Quando la Regina muore, i riflessi spariscono subito, altrimenti la stanza non si ripulisce.

SGUARDO D'INVERNO (gaze, 3,4 s, solo fase 2, sempre dopo l'Incoronazione)
- Avviso, p 0,04 (fino a 0,32: 0,95 s del modello = 0,65 s veri):
  - a0 = angolo verso l'eroe; e.sweep = ±1 a caso;
  - a terra un settore rosso tenue (alfa 0,08) da a0−s·74° ad a0+s·74°: tutta la zona che spazzerà;
  - sopra, il cono di partenza (28° di larghezza, centrato su a0−s·60°, lungo 320 px) rosso ad alfa 0,28, con una freccia bianca curva nel verso in cui girerà.
- Colpo, da p 0,32 a 0,92:
  - cono di luce largo 28° (metà 14°), lungo 320 px, con apice in lei e angolo c(p) = a0 + s·(−60° + 120°·(p−0,32)/0,60), la stessa formula della testa;
  - circa 86° al secondo veri;
  - si ferma contro gli ostacoli (pilastri, statue, specchi), che fanno ombra: 15 raggi sul ventaglio, ognuno fino al primo ostacolo o al muro;
  - a terra luce azzurro-viola ad alfa 0,35 con i bordi rossi.
- Esposizione:
  - se il centro dell'eroe è nel cono, a più di 20 px da lei e senza ostacoli in mezzo, con P.dashT ≤ 0 e P.inv ≤ 0, l'esposizione cresce di dt (vero); fuori dal cono cala di 2·dt;
  - a 0,35 s: «Congelato!»;
    - hurtP(14·DMG);
    - P.pull = {x:P.x, y:P.y, sp:0, t:0,7} (fermo sul posto);
    - P.dashCd almeno 0,7;
    - cubo N3.icequeen2Ice per 0,7 s;
    - poi lo sguardo non lo conta più fino alla fine della mossa (almeno 1,2 s di respiro).
- Schiva:
  - dietro un pilastro dell'Incoronazione o una statua;
  - correre contro la freccia: a 150–320 px si attraversa il cono in meno di 0,35 s;
  - uno scatto attraverso il bordo;
  - restarle vicino (a 100 px il cono va alla velocità dell'eroe: gli corri davanti);
  - oltre i 320 px o dietro di lei.

VALZER DELLA TORMENTA (waltz, 3,6 s, solo fase 2)
- Strada, a p 0,03:
  - S = la sua posizione; u = direzione da lei all'eroe; n = perpendicolare, verso il lato con più spazio;
  - fine della linea di base T = eroe + u·120 + n·110, dentro L+50…R−50 / TOP+70…BOT−70;
  - strada = linea di base + n·40·sin(3π·t), cioè tre archi, lunga 280–320 px;
  - deve passare ad almeno 70 px dall'eroe e non chiuderlo contro un muro: se non ci sta, si gira n o si fanno solo 2 archi;
  - da p 0,03 a 0,12 a terra una riga bianca tratteggiata tenue mostra la strada.
- Colpo, da p 0,12 a 0,70: lei percorre la strada a velocità costante (circa 210 px/s veri), con e.face = la tangente.
  - Ogni 16 px nasce un punto di scia: azzurro per 0,2 s veri, poi rosso;
  - 0,85 s veri dopo il suo passaggio esplode in una punta (N3.icequeen2Spike, h 16, dura 0,36 s);
  - danno 18 se l'eroe è a meno di 18 px, una volta per valzer;
  - toccarla mentre balla fa il danno di contatto.
- Piroetta:
  - da p 0,70 un anello rosso intorno a lei (r 40) con 8 tacche, fino a p 0,95 (0,9 s del modello = 0,61 s veri);
  - a 0,95 partono 8 fiocchi radiali con un giro a caso: shootE(e.x, e.y−30, …, 75, 7, 10, 'qflake'), circa 115 px/s veri, N3.icequeen2Flake.
- Mentre balla nevica dal soffitto (ENV2.fall piccolo).
- Schiva: non stare sulla scia quando diventa rossa; dopo, uno spazio tra due fiocchi lenti.

FASE 2 (rage, 2,6 s)
- Quando: hp < 50%, ma non durante gaze, waltz, mirror, emerge, hall, hallEnd, cast, stunned (aspetta che finiscano).
- e.shell = 9: non la si può colpire durante la rage.
- Cosa succede:
  - scritta «La Regina chiama la Notte Polare», Fase 2;
  - bossRage(e, '200,160,255'), barra 'rage';
  - G.eproj = [];
  - si annullano i pericoli in attesa (cerchi, linee, bracci non esplosi, scia); i pilastri piantati restano;
  - b3say 'angry'.
- A p 0,86:
  - lampo;
  - ENV2.fall(14, true);
  - gli ostacoli tremano (ENV2.rocks raggio 400);
  - torce viola-bianco per il resto del combattimento;
  - zone di brina lungo il muro in alto e in basso per 9 s (rallentano, non fanno male), come oggi;
  - il doppio della neve d'ambiente.
- Alla fine: e.shell = 0, poi crown e gaze. Da qui il dt è ×1,15.

ENTRATA (bossIntro avvolto per 'icequeen', 3,4 s, il modello gioca 'enter')
- e.em sotto 1 fino a 3,3 s, così alone e aura aspettano.
- Suoni e colpi:
  - 0: scricchiolio di ghiaccio e vento;
  - 0,95 s (p 0,28): gli occhi, 'shimmer' basso;
  - 1,1–1,9 s: il vetro che vibra;
  - 2,24 s (p 0,66): crepa e frantumi, schegge e segni di brina;
  - p 0,76, 0,80, 0,84, 0,88: i tin della corona;
  - 3,13 s (p 0,92): il piede dello scettro batte a terra, anello di brina (ring2 bianco-azzurro), torce azzurre (b3torch 'blue', 2 s), b3say 'cry' (se no sfx 'shimmer'), vibrazione.
- Poi la scivolata, e la prima mossa lances.

SCONFITTA (BDIE.icequeen, 4 s, disegnata dal modello con 'die')
- Suoni:
  - 0,5 s: il vetro che ronza;
  - 1,7 s: le crepe;
  - 2,3 s, il clou: lo scoppio di neve ('shimmer'), barra, «sconfitto», rallentatore;
  - 2,8 s: il «tin» della corona;
  - 2,9 s: il tonfo dello scettro.
- Particelle di neve che salgono (con LOWFX poche).
- b3say 'die'.
- La brina sbiadisce e le torce diventano calde per un attimo.
- La stanza si chiude quando il corpo ha finito (corpseLeft).

=== 6. VOCE E PERSONALITÀ ===
Voce in B3VO.VB.icequeen, preparata nelle stanze della sua arena come il Golem (B3VO.prep).
- Timbro: un soprano lontano dentro un'armonica di vetro. Vocali a, o, i, u; altezze 500–1.050 Hz; vibrato lento [0,02, 5,5]; un po' di fischio (tn) per il vetro. Sotto, i parziali stonati del vetro con fModal e un fruscio di brina (fNoise passa-alto).
- Niente carillon: è già del menu e del Burattinaio.
- Volume medio tra 0,07 e 0,11.
- I versi:
  - cry (1,6 s): «aaah» che sale da 660 a 990 Hz e tiene, coi vetri che vibrano e il ghiaccio che scricchiola;
  - angry (1,8 s): schianto di ghiaccio, poi «ah-oh» da 784 a 740 con due voci basse di coro (392, 330) che scendono di un semitono;
  - laugh (1,0 s): «oh-oh-oh» in tre sillabe che scendono (880, 784, 698) con i campanelli;
  - laugh2: più piano, quando cadi;
  - hurt (0,3 s): «oh!» da 990 a 740, oppure «ah!» col tic di vetro;
  - call (0,7 s): «mm?» che sale da 660 a 880 e due colpetti dello scettro a terra (tic-tic), quando non la colpisci per 5 s;
  - c_lances: «hm» e un tin che sale a ogni lancia che parte;
  - c_crown: campana grave e tintinnio delle stalattiti che volano;
  - c_nova: «mmm» che sale da 440 a 880 fino allo scoppio;
  - c_mirror: arpeggio di vetro che cresce e un «shhh»;
  - c_gaze: una nota pura lunga 1,6 s, come un dito bagnato sul bordo di un bicchiere;
  - c_waltz: tre note di vetro (1.047, 1.319, 1.568 Hz) su ogni uno-due-tre;
  - die (2,4 s): una nota alta (1.175) che si spezza come vetro, poi un arpeggio di vetro che scende;
  - win: risatina e tre note.
- B3CUE.icequeen = {lances:'c_lances', crown:'c_crown', nova:'c_nova', mirror:'c_mirror', gaze:'c_gaze', waltz:'c_waltz'}.
- La corona-orologio: b3go avvolto, come il battito del Golem. Un tin di vetro (fModal ~1.760 Hz, corto) a ogni coppia e un TIN doppio (2.093 + 2.637 Hz) sulla centrale, ai p del conto convertiti in secondi veri:
  - lances [0,30, 0,45, 0,60, 0,76]
  - crown [0,04, 0,08, 0,12, 0,16]
  - nova [0,16, 0,26, 0,36, 0,46]
  - mirror [0,05, 0,12, 0,19, 0,26]
  - waltz [0,03, 0,06, 0,09, 0,12]
- Presa in giro ('taunt' 1,2 s): quando ti colpisce, come pausa nella scivolata, mai tra due colpi; riparte a scivolare poco prima della mossa dopo.
- Regole di B3VO: 2,4 s prima di un lamento, 1,2 s prima del verso di una mossa.

=== 7. COSA TENERE DEL BOSS DI OGGI ===
- La stanza resta: «Sala del Trono di Ghiaccio», con le rune 'regina' (colori nuovi), 5 lastre di ghiaccio scivolose, le vene di cristallo, la neve, e le tre statue di ghiaccio di bossLayout ([92,190], [268,190], [180,480], r 16), che fanno da riparo contro lance, fiocco e sguardo.
- Il servitore resta: il tipo 'qmirror', il riflesso, che ora è il modello con o.ghost, r 16, due colpi, niente oro né esperienza.
- Restano anche:
  - la brina sui muri nella fase 2 (9 s);
  - la barra che si rompe (BBFX);
  - la musica 'regina' (76). Il tema a tre tempi del Valzer è un'idea da far sentire a Denis.
- Cosa diventa cosa:
  - schegge → Lance di Cristallo;
  - nova → Fiocco Reale;
  - specchi senza indizio → Sala degli Specchi;
  - muri di ghiaccio (iceblock) → pilastri dell'Incoronazione;
  - tormenta a strisce e tempesta a spirale → Valzer della Tormenta;
  - in più lo Sguardo d'Inverno.
- Traguardo «Cuore di ghiaccio» e testo della vittoria invariati. La guida va aggiornata (riga nel design).

=== 8. REGISTRO PER LE PROVE (BCL.icequeen) ===
- n: 'Regina dei Ghiacci', arena: 7, p2: true.
- enter(): G.arena=7; G.chapter=ARENAS[7].ch; G.diff=ARENAS[7].diff; G.bossLvl=null; G.room=ROOMS; G.event=null; buildRoom().
- moves: ['lances','crown','nova','mirror','emerge','cast','stunned'].
- moves2: ['rage','gaze','waltz'].
- hz(): avvisi, lance in volo, stalattiti che cadono, pilastri, bracci del fiocco, punte, specchi, riflessi, cono acceso, punti della scia, fiocchi.
- voice: ['cry','laugh','angry','die'].
- Prove:
  - python3 anteprime/mk_boss2.py icequeen --test e node tests/boss2gioco.js icequeen (con --stub finché il modello manca);
  - difficoltà contro la Regina di oggi: node tests/boss2diff.js icequeen. Oggi un eroe fermo perde 5,5 vite al minuto; la nuova deve stare tra 5 e 6,5 per chi sta fermo e molto meno per chi si muove;
  - disegno della Sala con quattro Regine sotto i 3,5 ms.
- Tutti i numeri sono da regolare giocando.

## Voti del direttore artistico

GIUDIZIO DEL DIRETTORE ARTISTICO (occhio severo: possente, bella, figa, che dia timore; un po' più cupa ma da Classica; abilità migliori e giuste per l'arena 8; fattibile bene con la cassetta C3; all'altezza del Golem approvato)

1) «Imperatrice» — 8,7 / 10 — VINCE
Pro:
- La sagoma più forte e leggibile delle tre: un triangolo alto 130 piantato a terra, la corona a raggiera, la riga dello scettro. È un monumento, non una figurina: è «possente» come il Golem, ma in verticale.
- È l'unica che non galleggia. Strega e Burattinaio fluttuano col mantello di stoffa; lei scivola senza piedi come un pezzo degli scacchi, sempre girata verso di te: calma che mette timore.
- Il segnale è la cosa migliore delle tre proposte e il vero erede del cuore del Golem: la corona-orologio, che si accende punta dopo punta e quando si accende la punta di mezzo il colpo parte. Si vede da lontano, si sente (tin… tin… TIN), si impara al primo combattimento.
- Le abilità nascono tutte da lei: l'Incoronazione (la corona vola via e diventa una gabbia di pilastri che si stringe) è un'idea originale e chiarissima anche per un bambino. Gli specchi hanno un indizio vero. Lo Sguardo d'Inverno (corpo immobile, solo la testa che gira) è il momento più inquietante senza essere horror. Il Valzer cambia il ritmo della fase 2. Ci sono due finestre di danno, la gemma scoperta e lo scettro incastrato, come i pugni incastrati del Golem.
- Entrata dallo specchio e sconfitta con l'inchino: da regina delle fiabe.

Contro (da correggere):
- Colori sbagliati. La base dell'iceberg (#78C6F2) ha luminosità 77, il pavimento della sua sala con la tinta dell'arena 8 (#adb5e6) 74: sparirebbe come la Regina di oggi. Diceva «cuore scuro», ma i toni erano chiari.
- Capelli platino su una faccia bianca sotto una corona bianca: la testa torna la pallina bianca di oggi.
- Avvisi troppo corti con la velocità vera. L'arena 8 accelera i boss di 1,28 e la fase 2 di 1,2: per le lance, tra il lampo a 0,35 e la prima lancia a 0,55, restano 0,27 s veri.
- Nella fase 2 l'Incoronazione mette 9 pilastri a raggio 64: restano varchi di 21 px e l'eroe ne è largo 24, quindi la gabbia è chiusa.
- Nova generica (onda più 16 schegge). Ghiaccio vivo che fa scivolare e zone che rallentano, in una sala che ha già 5 lastre scivolose. Due ventagli (quello in mano più il Ventaglio d'Inverno): troppi oggetti. Il cono «sotto i 110 px» non torna con i tempi veri.

2) «Specchi» — 7,9 / 10
Pro:
- Le meccaniche più originali: il Raggio Prismatico che rimbalza, il Fiocco di Brina disegnato a terra (bellissimo e leggibile), la sala che diventa una galleria di specchi.
- Il prisma come cuore è un buon segnale.
- La presa in giro della vanità (si specchia) è perfetta per il personaggio.
- Ha visto per prima i rischi giusti: l'anello di sfere generico delle arene 5–8 da spegnere, gli avvisi da allungare per la velocità dell'arena 8, il costo delle copie.

Contro:
- Abito di placche a specchio, tre specchi che le girano intorno e l'arcobaleno del prisma: una sagoma piena di cose, da gioiello prezioso, non da monumento possente. Si legge peggio da lontano.
- L'arcobaleno va verso l'aurora del Cervo, che sta nello stesso mondo.
- Lo Specchio Riflesso (le tue frecce che tornano) è difficile da capire per un bambino sul telefono e tocca i colpi dell'eroe.
- È il disegno più costoso (1,2–1,6 ms, più le copie).

3) «Spettro» — 7,3 / 10
Pro:
- La più inquietante: le mani che escono dal ghiaccio, l'abbraccio lunghissimo.
- Segnale ottimo (la brina che sale sul braccio che colpirà).
- Ha capito i colori: massa scura con i bianchi sopra, capelli mezzanotte attorno al viso pallido.
- Sconfitta dolce (si scioglie in neve).

Contro:
- Va verso il linguaggio della modalità Zombie: «dita lunghe» è scritto in CLAUDE.md tra i segni degli zombie, insieme alla testa ferma mentre il corpo gira e all'orlo sfilacciato da fantasma. Denis ha chiesto «un po' più cupi», non horror.
- Galleggia come Strega e Burattinaio e ha le mani grandi come il Burattinaio.
- È la più fragile da costruire: braccia che si allungano oltre le due ossa, velo a elica davanti e dietro con l'isteresi, lingue di tormenta, capelli che volano. Rischio alto di pezzi che saltano in 16 direzioni, e costo alto.

COSA ENTRA NEL DESIGN FINALE DALLE ALTRE DUE
- Da «specchi»:
  - il Fiocco di Brina diventa la sua Nova (Fiocco Reale, che parte dal piede dello scettro piantato);
  - la presa in giro allo specchietto (al posto del ventaglio in mano, che sparisce);
  - gli occhi di lei dentro gli specchi;
  - due colpetti dello scettro a terra quando ti chiama;
  - l'anello di sfere generico dell'arena 8 spento per lei;
  - ogni avviso di almeno 0,9 s del modello, così resta sopra 0,6 s veri anche a 1,28 × 1,15.
- Da «spettro»:
  - la massa scura e i bianchi sopra: ghiaccio profondo di ghiacciaio, corpetto indaco, capelli blu mezzanotte attorno alla porcellana;
  - il filo di luce fredda lilla della sala sul lato in ombra;
  - il fiocchetto di brina sotto l'occhio come un neo (non una lacrima);
  - la testa al massimo a ±60–70° dal corpo;
  - una sconfitta morbida, in fiocchi che salgono e non in frantumi pesanti (quelli sono dello Yeti).

CORREZIONI MIE
- Colori ricalcolati sul pavimento vero: base dell'abito con luminosità 55 contro 74 del pavimento.
- Gabbia della fase 2 con 7 pilastri sempre a raggio 72. Il numero dispari è voluto: nella fase 2 le schegge attraversano il centro e passano proprio nei varchi.
- Sguardo più stretto (28°) e corto (320 px), con 0,35 s di tolleranza.
- Niente pavimento scivoloso nuovo e niente zone che rallentano, tranne la brina sui muri nella fase 2, come oggi.
- Specchi sempre girati verso la telecamera, così una Regina non finisce mai nascosta dietro il suo specchio.
- Voce di armonica di vetro e non di carillon: il carillon è già del menu e del Burattinaio.
