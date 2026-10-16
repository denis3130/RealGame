# La Fenice della Forgia: il design finale

(Deciso dal direttore artistico tra tre proposte, 16 ottobre. Tipo nel gioco: `phoenix`; modello `sprite/nemici3d/phoenix2.js`.)

## Il design

LA FENICE DELLA FORGIA: «la Fenice Imperiale»
Titolo che resta: «Rinasce dalla sua cenere». Tipo 'phoenix' nel gioco, arena 10 «Forgia degli Dei». Modello 'phoenix2' in sprite/nemici3d/phoenix2.js; nel gioco prende il nome 'phoenix', come il Golem.

IDEA
È l'imperatrice di fuoco della Forgia degli Dei: un rapace regale cremisi e oro, più alto del Golem.
- Ti guarda dall'alto del becco con due occhi d'oro bianco incandescenti, sotto un diadema d'oro battuto con l'occhio degli dei: una gemma menta, la stessa degli stendardi dell'arena.
- A riposo è una regina sul trono: ali chiuse come un mantello fino a terra, una corona di cinque pennacchi di fiamma, dietro uno strascico di piume lunghe steso sul pavimento come fiamme basse.
- Nel petto, in una spilla d'oro sotto la gorgiera, batte il Cuore di Forgia, una brace bianca. Prima di ogni colpo batte due volte e il suo fuoco corre lungo i rachidi delle penne fino al pezzo che colpirà. È il suo avviso, come il cuore del Golem.
- Brucia mentre combatte: le punte delle piume diventano cenere man mano che perde vita.
- A metà vita si spegne e si chiude in un uovo di cenere, che batte tre volte mentre il fuoco degli dei (fili menta) sale dal cerchio di rune. Rinasce azzurra, più grande, con una corona di sole di fiamme azzurre.
- Sconfitta torna cenere, e dall'uovo esce un pulcino.
Resta della Classica: forme robuste, contorno scuro spesso, colori pieni, occhi che brillano con la lucina, niente denti, niente sangue, ferite o cuciture.

MISURE E SILHOUETTE
Unità del modello a sc 1. x avanti, y a sinistra, z in su; l'origine è a terra tra i piedi.
- Altezze: spalle 66, cima della testa 102, diadema 95–99, punta del pennacchio centrale 122 (più la fiammella).
  - Fase 2: tutto ×1,06 e i pennacchi ×1,25, quindi circa 130.
  - Confronto: il Golem è 110, l'Arciere 3D 37. Lei è tre volte l'eroe alla testa, più di tre volte alla corona.
- Larghezze: corpo 40; con le ali chiuse a mantello 70; ali aperte 220 (240 nella fase 2); in volo al massimo 180; stesa a terra 200.
  - Le ali si aprono del tutto solo per poco: Ventaglio, Ali dell'Impero, Ruota, entrata, rinascita.
- Strascico: 5 piume (7 nella fase 2). La punta della centrale arriva circa 105 dietro i piedi (118 nella fase 2); il ventaglio è aperto di circa 55° (66°).
- Becco: la punta arriva a x 52.
- Tre triangoli che si leggono anche piccolissimi: in cima la corona, al centro il mantello delle ali che si allarga fino a terra, dietro il ventaglio dello strascico. Nella fase 2 c'è in più il cerchio della corona di sole dietro la testa.
- Posa regale: petto in fuori (corpo inclinato indietro di 0,12 rad), collo corto e grosso nascosto dalla gorgiera, testa un po' alta col becco puntato in giù su di te, zampe corte e larghe con gli artigli aperti.
- Le quattro direzioni:
  - Davanti: la corona, gli occhi bianchi nella maschera scura, il cuore nella spilla, la corazza del petto incorniciata dal bordo d'oro del mantello, lo strascico che spunta ai due lati dietro le zampe.
  - Di lato: il profilo del becco a uncino, la corona piegata indietro, il mantello come uno scudo lungo sul fianco, lo strascico lungo a terra che risale in punta (non deve sembrare un tappeto).
  - Dietro: la schiena cremisi, le punte delle remiganti incrociate sopra la radice dello strascico, lo strascico che si apre verso di noi a filo del pavimento.
  - Tre quarti: tutto insieme.
  - Ali aperte: una V enorme di nove remiganti per ala.
- Nel gioco: ET.phoenix.r da 24 a 28 (solo il corpo); alone e barra B2H.phoenix da 66 a 96.

COSTRUZIONE
Metodo dello spaventapasseri, cassetta C3, dipinta come la lanterna.
- Scheletro proiettato con V(face). Il corpo è un solo volume convesso di tre ellissoidi, come il busto del Golem (svol3 o hullE), con tre toni e il bordo caldo (rim).
- Collo e zampe: chain e shadeLimb. Gambe a due ossa con ik, piedi fermi a terra.
- La testa ha la sua telecamera (Vat): gira verso di te per conto suo e resta ferma nello spazio mentre il corpo respira e beccheggia, come i falchi. Corona e corona di sole stanno nella stessa telecamera.
- Penne: leaf in tre toni. Fiamme: lick e glowTop col tempo del gioco, mai con la posa.
- Ordine di disegno dalla posa di riposo, a gruppi:
  1. strascico (sempre per primo, a terra);
  2. gamba lontana;
  3. ala lontana;
  4. corpo con corazza, cuore e gorgiera;
  5. gamba vicina;
  6. ala vicina;
  7. collo e testa.
  - Un'ala alzata dietro la schiena (Ventaglio, Giudizio, battuta in su) va tutta dietro al corpo: il gruppo prende la profondità del polso rispetto al centro del petto. Nel passaggio usa una dissolvenza breve (fadeDraw), mai uno scambio secco.
  - Dentro un'ala le penne seguono l'ordine della posa di riposo, mai da dove sta la punta.
  - I pennacchi stanno davanti o dietro la testa secondo da dove la guardi, come oggi crestBack.
- I pezzi fermi (gorgiera a smerli, fascia delle copritrici, squame del petto) sono Path2D calcolati una volta.

PEZZI NELLA POSA DI RIPOSO (fase 1)
1. Piedi (2). Caviglia a [3, ±10, 3].
   - Tre artigli avanti, lunghi 7, ricurvi in giù, a −25°, 0° e +25°; uno dietro, lungo 5. Ferro brunito.
   - Anello d'oro alla caviglia.
2. Tarsi (2). Dalla caviglia a [0, ±10, 17], chain con raggio da 3 a 2,6, oro arancio con tre anelli di squame. Uno sperone d'oro dietro, a z 9.
3. Calzoni (2). Ellissoide [0, ±11, 24], raggi [9, 7, 9], piume cremisi, orlo in basso a quattro smerli sopra il tarso. L'anca è a [−2, ±10, 30]; il ginocchio sta dentro il calzone (ik).
4. Corpo, un solo volume di tre ellissoidi:
   - petto [8, 0, 50], raggi [19, 20, 22];
   - ventre [2, 0, 32], raggi [15, 16, 12];
   - dorso [−8, 0, 60], raggi [17, 21, 14].
5. Corazza del petto. Sulla calotta davanti del petto tre file di squame di piume, disegnate come archi e non come pezzi: 5, 6 e 5 squame a z 60, 52 e 44, ognuna col filo d'oro sull'orlo. Sotto, il ventre arancio oro.
6. Cuore di Forgia. Sulla superficie del petto a [26, 0, 57], subito sotto gli smerli davanti della gorgiera.
   - Un rombo verticale di luce 6 × 9: centro bianco, poi #fff2c4, orlo #ffb347.
   - Montatura d'oro sottile con quattro borchiette agli angoli.
   - Bagliore morbido intorno (raggio 16). Batte.
7. Gorgiera. Un anello di 10 smerli d'oro battuto intorno alla base del collo: centro [12, 0, 70], raggio 14, inclinato in avanti di 20°. Gli smerli davanti scendono sul petto fino a z 64 e coprono l'attacco del collo. Un solo tracciato, con una riga scura tra uno smerlo e l'altro.
8. Collo. Tre anelli: [12, 0, 70] raggio 10, [18, 0, 79] raggio 8,5, [22, 0, 85] raggio 7,5. Cremisi, quasi tutto nascosto dalla gorgiera.
9. Testa. Ellissoide H [24, 0, 89], raggi [15, 13, 13], nella sua telecamera.
   - Maschera: una fascia scura #2e0a10 con l'orlo #6a1420, dalla radice del becco a dietro gli occhi, alta 9, come la mascherina di un falco.
   - Occhi: vedi FACCIA.
   - Cipiglio: vedi FACCIA.
   - Becco a uncino:
     - la mandibola di sopra esce dalla faccia (x locale 13) per 15, piega in giù di 5 in punta ed è larga 9 alla radice;
     - bronzo dorato, con la punta brunita negli ultimi 4 e una piega leggera;
     - alla radice la cera d'oro con la narice;
     - la mandibola di sotto è lunga 11 e si apre fino a 25°: dentro c'è la gola scura con la luce bianca in fondo, il fuoco dentro. Niente denti.
   - Diadema:
     - una fascia di 7 scaglie d'oro battuto dalla fronte ai lati del capo, alta 4, con i colpi del martello;
     - in mezzo, sopra la V del cipiglio, l'occhio degli dei: una gemma a mandorla 4 × 2,6 menta, con la pupilla scura e la lucina, uguale all'occhio degli stendardi dell'arena.
   - Corona: 5 pennacchi dalla cima della nuca, in su e indietro.
     - Il centrale è lungo 24 (punta a z 122), i due interni 18 aperti di ±20°, i due esterni 12 aperti di ±40°.
     - Colore dal cremisi della radice all'oro della punta; in punta una goccia di fuoco e una fiammella (lick).
     - Molleggiano appena, in ritardo sul movimento della testa.
10. Ali (2). Spalla S a [−4, ±19, 64]. Ossa: omero 18, avambraccio 24, mano 22. Gomito e polso si muovono come oggi con l'apertura sp, l'alzata fl e la spinta sw.
    - Chiuse (riposo), un mantello:
      - un volume solo per ala, dalla spalla [−4, ±19, 66] fino a [−20, ±13, 4] dietro il tallone; spesso 7, largo 16 in alto e 10 in basso;
      - il bordo davanti è una fascia d'oro (le copritrici) che scende dalla spalla lungo il fianco e incornicia il petto;
      - la faccia esterna è cremisi con tre file di smerli e diventa più arancio oro verso il fondo;
      - in fondo spuntano le punte di 5 remiganti (lunghe 14) dietro i piedi; quelle delle due ali si incrociano sopra la radice dello strascico.
    - Aperte:
      - 9 remiganti sulla mano, lunghe 46, 44, 42, 40, 38, 36, 34, 32, 30 (la più lunga fuori), aperte da 0° a 70°;
      - 7 secondarie sull'avambraccio, da 30 a 24, rivolte all'indietro;
      - le copritrici sono una fascia sola a squame d'oro su omero e avambraccio (un tracciato).
    - Ogni penna: radice #a8201a, metà #ff5a1f, punta #ffc23c; rachide chiaro #ffe0a0 (spesso 1, alfa .6); bordo incandescente #fff1c0 sul lato esterno. Il sotto dell'ala (#6a1214) si vede quando è alzata. Fiammelle solo sulle 3 remiganti più lunghe.
    - Le 5 remiganti più lunghe di ogni ala sono le corsie del Ventaglio. Da destra a sinistra di lei: R1 (la più esterna dell'ala destra), R2, R3, R4, R5, poi L5, L4, L3, L2, L1. Sono le corsie da 0 a 9.
11. Strascico. Radice T a [−16, 0, 30].
    - Sopra, 3 copritrici d'oro corte (16, 14, 14) aperte a ventaglio di ±20°.
    - Poi 5 piume lunghe 76, 88, 100, 88, 76, girate indietro di 0°, ±13° e ±26°.
    - Percorso: dalla radice scendono a terra 26 più indietro, corrono sul pavimento con una S morbida (ampiezza 4) e negli ultimi 14 risalgono fino a z 6.
    - Forma: fusto sottile (2,2) per il primo 55%; poi la bandiera si allarga fino a 7 all'80% e si stringe a 4.
    - In punta l'occhio di fiamma: una goccia 9 × 6 cremisi con l'anello d'oro e il cuore bianco, più una fiammella.
    - Con o.veil (da 0 a 1) lo strascico si fa trasparente fino ad alfa .4. Il cervello lo passa quando l'eroe ci sta sopra, dietro di lei.
12. A terra:
    - un'ombra ellittica 30 × 12, che si stringe quando lei si alza;
    - una pozza di luce calda intorno a lei (255,150,60, raggio 70, alfa .16; nella fase 2 120,190,255) che la segue come una torcia.

PALETTE
Tre toni per pezzo, scritti come luce / base / ombra. Contorno INK spesso 2,6–3 sui pezzi grandi e 1,6–2 sulle penne.

FASE 1, cremisi e oro:
- piumaggio: #ff6a3c / #c42a1c / #5e0f14
- corazza del petto: #ffd36a / #ff9a2a / #a4460e; filo d'oro #ffe7a0
- penne delle ali: radice #a8201a → #ff5a1f → punta #ffc23c; bordo #fff1c0; sotto #6a1214
- oro battuto (diadema, gorgiera, cipiglio, copritrici, anelli, speroni): #fff2b0 / #ffc83c / #a86e12; colpi del martello #c8901e
- becco: #ffd27a / #e8962a / #8a4a12; punta #5a2a10; cera #ffc83c; narice #3a1a10; gola #5a0a10
- maschera: #2e0a10; orlo #6a1420
- occhi: bianco #fffaf0; anello #ffd27a; lucina #ffffff; alone 255,240,200; fessura #2a0a08
- occhio degli dei: #e0fff4 / #7ff0c0 / #1e7a5a; pupilla #0e3a2a; alone 127,240,192
- tarsi: #ffd060 / #ffb020 / #a8640e; squame #c8801a
- artigli: #6a5448 / #3a2a24 / #1e1612
- strascico: fusto #c42a1c → punta #ffc23c; occhio di fiamma #e8341c, anello #ffd84a, cuore #fffaf0
- Cuore di Forgia: #ffffff → #fff2c4 → #ffb347; alone 255,190,90
- fuoco: 255,120,40; caldo 255,225,150
- cenere sulle punte: #d8d0c6 / #a69c92 / #6a625a; riga di brace #ff8a3a

FASE 2, cobalto e oro bianco («il fuoco degli dei»):
- piumaggio: #8cc4ff / #3a74e8 / #1a3684
- petto: #ffffff / #cfeaff / #6a9ad0; filo #fff4c8
- penne: #2448a8 → #3a8ae8 → #9fe0ff; bordo #f0fbff; sotto #142a6a
- oro bianco: #ffffff / #ffe8a0 / #b8963a
- becco: #fff4d0 / #e8c070 / #8a6a2a; punta #4a3a1a
- maschera: #0c1438; orlo #24408a
- occhi: #f0fbff; anello #7fd4ff; scie #9fe0ff; fessura #0c1438
- occhio degli dei: resta menta, ma più acceso
- tarsi in oro bianco; artigli in acciaio scuro #4a5a7a / #1e2a44 / #0e1424
- strascico: fusto #3a74e8 → punta #9fe0ff; occhio #3a8ae8, anello #fff4c8, cuore #ffffff
- Cuore: #ffffff → #bfe8ff; alone 140,210,255
- corona di sole: da #9fe0ff a #ffffff
- fuoco: 120,200,255; caldo 220,245,255 (l'azzurro di oggi, già approvato)

ALTRO:
- uovo della Rinascita: #6a5e58 / #3a3230 / #1e1816; crepe #ffc83c che diventano #9fe0ff; fili degli dei 127,240,192
- cenere della sconfitta: #8a837c / #5a544e
- uovo piccolo: #fff3d0 col bagliore d'oro
- pulcino: #ffd36a / #ffb020 / #c8641a; occhioni bianchi con la pupilla #1b1612 e la lucina; ciuffetto di fiamma #9fe0ff

Cosa vuol dire «un po' più cupi» qui:
- ombre profonde: vino nella fase 1, blu notte nella 2;
- maschera quasi nera;
- luce solo su bordi, occhi, corona, punte e cuore, che guidano l'occhio.
Sul pavimento grigio con le crepe menta della Forgia, il cremisi e l'oro si staccano da soli. Nella fase 2 la tengono staccata il tono chiaro, il petto bianco, il bordo incandescente, il contorno spesso e la pozza azzurra.

FACCIA
- Il triangolo di luci: i due occhi bianchi e, sotto, il cuore nella spilla, come occhi e cuore del Golem; in fronte l'occhio degli dei.
- Lo sguardo è sempre minaccioso: cipiglio d'oro a V, maschera scura, becco puntato in giù.
- Occhi: due mandorle 5,4 × 4 nella maschera, in direzione [.55, ±.62, .12] dal centro della testa, con l'angolo esterno in su di 12°.
  - Bianco caldo incandescente, anello d'oro di 1,2, lucina bianca (1,4) in alto davanti, mai sul contorno.
  - Un alone morbido che pulsa col respiro.
  - Di solito non hanno pupilla e brillano come quelli del Golem. La fessura verticale scura (1,2 × 3,4) compare solo quando ti giudica, quando prende la mira in cima alla Picchiata e nella presa in giro.
- Cipiglio: due placche d'oro a V sopra gli occhi, dalla punta interna bassa [.62, ±.25, .45] a quella esterna alta [.25, ±.75, .55], lunghe 9 e spesse 3. Quella lontana sta dietro il cranio e non va mai sopra il suo occhio, come il sopracciglio del Golem.
- Batte le palpebre piano; la palpebra è scura come la maschera.
- Nei gridi il becco si apre e la gola si accende in fondo.

IL SEGNALE: il Cuore di Forgia e il fuoco che corre
- Prima di ogni mossa il cuore batte due volte («tum-tum»): si gonfia fino a 1,35 e lampeggia morbido. I momenti sono scritti per ogni mossa (A.beat).
- Poi una perla di luce bianca corre dal cuore lungo i rachidi delle penne, su percorsi calcolati una volta, fino al pezzo che colpirà, in 0,25–0,35 s.
- Il pezzo si accende: le penne vanno verso #fff1c0 col bordo bianco e le fiammelle crescono. A.heat vale per gruppo: ala destra, ala sinistra, strascico, zampe, testa.
- Cosa si accende in ogni mossa:
  - Ventaglio: le remiganti delle corsie, una alla volta da dentro a fuori; quelle del varco restano scure.
  - Picchiata: artigli e corona, poi diventa tutta cometa.
  - Ali dell'Impero: il bordo davanti delle due ali, dalle spalle alle punte.
  - Ruota di Fiamme: lo strascico dalla radice alle punte, e gli occhi di fiamma si accendono.
  - Pioggia: le 3 remiganti più lunghe di ogni ala.
  - Giudizio: su per il collo, fino agli occhi e all'occhio degli dei.
- Cenere sulle punte. o.ash va da 0 a .35 e lo dà il cervello: è la vita persa nella fase.
  - La parte esterna di ogni penna (remiganti, secondarie, pennacchi, strascico) diventa cenere chiara, con la riga di brace al confine, e le fiammelle delle punte si rimpiccioliscono.
  - È la sua vita disegnata sul corpo e dice «si sta consumando».
  - Quando il fuoco corre in una penna di cenere, la riaccende finché dura il colpo.
  - Dopo la rinascita riparte da 0.
  - Resta anche con LOWFX, perché è solo colore.

FERMA (idle, 3 s, si chiude su se stesso)
Sta dritta come su un trono, con le ali a mantello e lo strascico steso. Niente scatti: è una regina che aspetta.
- Respiro: uno per giro. Il petto si gonfia del 3%, la gorgiera sale con lui, l'alone degli occhi pulsa.
- Cuore: batte a .08 e .20, poi silenzio.
- Testa: fa un giro lento della stanza (look, ±0,38) e torna a fissarti dall'alto col becco in giù (−0,12). A .62 batte gli occhi, piano.
- Strascico: un'onda corre dalla radice alle punte, un'onda intera per giro; le punte si arricciano di 2.
- Corona: i pennacchi oscillano appena (±3°), in ritardo sulla testa.
- .30: un artiglio gratta il pavimento (si alza di 2, tira indietro di 3, due scintille).
- .70–.85: si scrolla. Le ali si alzano un poco, tremano due volte (6 Hz) e si risistemano; cadono tre braci.

VOLA (walk, 1,3 s)
Non cammina: plana a 16 da terra.
- Un battito lento e potente per giro: giù veloce (.00–.40, le ali passano da su a giù aperte fino a 180), su lento (.40–1, coi polsi piegati).
- Il corpo è piegato avanti (0,35) e sale di 3 dopo ogni battuta; la testa resta ferma su di te.
- Zampe raccolte con gli artigli chiusi. Lo strascico è sollevato e le sventola dietro, con due mezze onde per giro.
- A .38 sul pavimento si allarga un anello di cenere. L'ombra resta a terra.

COLPITA (hit, 0,6 s; solo per le pagine)
La testa va indietro, tre piume volano via e diventano cenere in aria, la corona trema, gli occhi si stringono.

MOSSE
- I p vanno da 0 a 1. I secondi sono del modello; nella fase 2 il gioco va 1,15 volte più svelto.
- Il cuore batte sempre prima, la preparazione è lunga, il colpo è secco, poi c'è l'assestamento.

1. VENTAGLIO DELL'IMPERO (fan, 1,6 s)
   - .00–.05 si drizza col petto in fuori; il cuore batte a .01 e .05.
   - .05–.15 la perla di luce sale nelle due ali.
   - .05–.42 apre le ali dietro di sé verso l'alto come un ventaglio imperiale (sp .9, fl +.9): le remiganti fanno un semicerchio dietro la testa.
     - Le 10 corsie si accendono a coppie da dentro a fuori: R5 e L5 a .10, R4 e L4 a .13, R3 e L3 a .16, R2 e L2 a .19, R1 e L1 a .22.
     - Le due del varco (o.gap: la corsia g e la g+1) restano scure, senza fiammella.
     - Da .22 a .42 le penne accese brillano sempre di più.
   - .42–.50 un battito tremendo in avanti: le ali vanno giù e avanti, la corona si schiaccia indietro, il becco si apre.
   - .50 le penne accese si staccano (il gioco spara qui). Sull'ala restano i calami corti: il 30% della lunghezza, scuri.
   - .50–.80 richiude le ali a mantello.
   - .80–1 le penne ricrescono dalla radice con uno sbuffo di scintille.

2. VENTAGLIO DOPPIO (fan2, 2,3 s, fase 2)
   - .00–.03 si drizza; il cuore batte a .00 e .03.
   - .02–.30 apre il ventaglio e accende le corsie da .06, una coppia ogni .02; il varco A (o.gap) resta scuro.
   - .30–.36 primo battito; a .36 partono le penne A.
   - .36–.48 le ali tornano su. Le penne ricrescono già accese (.40–.52), tranne il varco B (o.gap2).
   - .62–.72 secondo battito; a .72 partono le penne B.
   - .72–.90 richiude a mantello; .85–1 le penne ricrescono.

3. PICCHIATA DELLA COMETA (dive, 2,2 s)
   - .00–.05 il cuore batte a .00 e .04; il fuoco corre negli artigli e nella corona.
   - .00–.12 si accuccia con le ali alte.
   - .12–.30 due battiti enormi (.16 e .24) e sale: o.z dal gioco, da 0 a 260. Senza o.z il modello usa la stessa curva, così le pagine la mostrano uguale.
   - .30–.42 in alto si chiude a freccia: ali tirate indietro, corona schiacciata, strascico dritto. Il corpo diventa una cometa: una goccia di fuoco col bagliore e dentro la sua sagoma. A .38 un lampo bianco negli occhi e compare la fessura: prende la mira.
   - .42–.62 il tuffo. Il gioco la sposta sulla linea e abbassa o.z fino a 12. È una cometa con la scia di fuoco e lo strascico che sventola.
   - .62 frena: ali spalancate (220), artigli avanti, scintille.
     - Con o.anvil sbatte contro l'incudine: testa indietro, ali buttate in avanti, lampo, poi cade.
   - .62–.80 slitta sul pavimento tra le scintille, con gli artigli che grattano.
   - .80–1 si posa nella posa di Ali a terra.
   - Con o.chain (fase 2), da .62 frena in aria a z 30 e resta sospesa ad ali aperte, pronta per redive.

4. SECONDA PICCHIATA (redive, 1,6 s, fase 2)
   - .00–.25 sospesa a z 30, si gira verso di te (il gioco gira face), ali aperte; il cuore batte a .02.
   - .25–.45 si chiude a cometa; lampo negli occhi a .40.
   - .45–.62 il tuffo.
   - .62–.80 frena e slitta (o.anvil come nella prima picchiata).
   - .80–1 si posa ad Ali a terra.

5. ALI A TERRA (grounded, 1,1 s, ciclo)
   - È stesa sulle ali aperte, piatte sul pavimento (apertura 200), con la pancia a terra.
   - Testa su ma stanca, becco socchiuso, ansima: due respiri per giro.
   - La corona è ridotta a brace: pennacchi rosso scuro, senza fiammelle.
   - Il cuore è scoperto e pulsa forte e svelto: è il bersaglio.
   - Occhi socchiusi; le ali tremano appena.

6. SI RIALZA (rise, 0,5 s)
   - .00–.50 spinge sulle ali e si rialza.
   - .50–1 si scrolla (un tremito) e richiude le ali a mantello; la corona si riaccende (.60–1).

7. ALI DELL'IMPERO (wings, 1,6 s)
   - .00–.06 il cuore batte a .00 e .04; da .06 il fuoco corre sul bordo davanti delle due ali.
   - .00–.20 plana in avanti (il gioco la sposta) aprendo le ali (sp .6).
   - .20–.45 si drizza (lean −.25) e stende le ali di lato a tutta apertura (220), testa indietro, becco aperto. Il fuoco arriva alle punte a .42.
   - .45–.52 chiude di colpo le ali davanti a sé, come due falci di fuoco che si incontrano davanti al petto; vampata davanti al becco a .50.
   - .52–.75 tiene le ali incrociate davanti; il fuoco si spegne.
   - .75–1 le riapre piano e le richiude a mantello.

8. ALI DELL'IMPERO DOPPIE (wings2, 2,2 s, fase 2)
   - .00–.04 il cuore batte; il fuoco corre sui bordi da .04.
   - .04–.30 plana, si drizza, apre le ali.
   - .30–.38 prima chiusura davanti a sé (a .38).
   - .38–.45 tiene.
   - .45–.60 si gira di scatto (il gioco gira face verso di te) riaprendo le ali; il fuoco corre di nuovo.
   - .60–.72 tutta aperta.
   - .72–.80 seconda chiusura (a .80).
   - .80–1 richiude a mantello.

9. RUOTA DI FIAMME (sweep, 2,4 s)
   - .00–.06 il cuore batte; da .06 a .30 il fuoco corre sullo strascico dalla radice alle punte e gli occhi di fiamma si accendono.
   - .00–.15 plana verso di te (il gioco la sposta) aprendo le ali in orizzontale.
   - .15–.30 si pianta e si abbassa un poco. Lo strascico si alza da terra e si raddrizza in una frusta sola (le 5 piume strette a ±4°), lunga fino a 135 dal suo centro, a filo del pavimento (z 4).
     - Con o.p2 lo strascico si divide in due fruste, a destra e a sinistra di lei, lunghe 150.
   - .30–.80 fa un giro intero: prima piano, poi forte, poi frena. L'angolo è dir·TAU·smoothstep((p−.30)/.50), lo stesso di N3.phoenixSweep, e o.dir dà il verso.
     - Le ali aperte girano come una ruota e la frusta spazza il cerchio.
     - Le fiamme della corona si piegano contro il giro; la testa gira con un ritardo di 0,25 rad.
   - .84 un anello di fuoco si allarga dai suoi piedi (disegnato fino a .95).
   - .80–1 si ferma; lo strascico ricade e si riapre a ventaglio; scrolla la testa (.88–.98).

10. PIOGGIA DI BRACI (rain, 3 s)
    - .00–.06 il cuore batte; il fuoco corre nelle 3 remiganti più lunghe di ogni ala.
    - .00–.18 sale con battiti forti fino a 60, sempre in vista, con l'ombra a terra.
    - .18–.85 resta sospesa e batte forte in giù tre volte: a .24, .48 e .72 (con o.p2 quattro volte: .22, .38, .54, .70).
      - A ogni battuta si staccano 3 penne accese da ogni ala e cadono girando. Il modello le disegna per i primi 20 di caduta, poi le disegna il gioco con N3.phoenixEmber.
      - A ogni battuta la corona divampa.
    - .85–1 scende a spirale (un giro) e atterra con un battito che alza la cenere (.97).

11. SGUARDO DEL GIUDIZIO (judge, 2,6 s, fase 2)
    - .00–.15 si drizza, la corona di sole divampa e la testa si abbassa verso di te. Negli occhi compare la fessura, l'occhio degli dei si accende. Il cuore batte a .02 e .06 e il fuoco sale per il collo.
    - .15–.80 ti fissa: la testa ti segue piano e le scie degli occhi si allungano; le ali mezze aperte tremano (6 Hz).
      - A .25, .42 e .59 fa un cenno secco della testa in giù (−0,35 in .03, torna in .06). A ogni cenno l'occhio degli dei lampeggia.
    - .80–1 gli occhi si calmano (la fessura sparisce), scuote la testa e richiude le ali.

12. RINASCITA (rebirth, 3,4 s): il passaggio alla fase 2, la sua «rage»
    - .00–.12 un grido spezzato; le fiamme tremano e si abbassano; cade sul pavimento.
    - .12–.28 si avvolge nelle ali come in un mantello regale, e lo strascico le gira intorno: un bozzolo di fuoco.
    - .28–.56 il bozzolo diventa un grande uovo di cenere nera (raggi 22 × 27) con le crepe d'oro.
      - Batte tre volte, a .36, .46 e .56, e si gonfia di 1,04, 1,07 e 1,12.
      - A ogni battito le crepe brillano di più e passano dall'oro all'azzurro.
      - Da .30 sei fili di luce menta salgono dal pavimento (da un cerchio di raggio 40) dentro l'uovo: il fuoco degli dei.
    - .56–.64 le crepe si aprono; a .64 l'uovo scoppia, con un lampo e i gusci. Le schegge che volano lontano le spara il gioco.
    - .64–1 rinasce azzurra (la palette passa alla fase 2 tra .64 e .74) e si alza.
      - Stende le ali a tutta apertura, 240 (.78–.90).
      - Dietro la testa si accende la corona di sole, una lingua alla volta (.80–.92).
      - Grida, col becco aperto da .84 a .98.

FASE 2: «la Fenice Azzurra»
Non è la stessa Fenice con un altro colore: cambia forma.
- Palette cobalto e oro bianco; tutto ×1,06.
- I pennacchi crescono di un quarto (×1,25) e diventano bianco-azzurri.
- Corona di sole: 10 lingue di fiamma azzurra su un anello di raggio 20 dietro la testa, nella telecamera della testa, 6 dietro il centro.
  - È un solo tracciato con il gradiente da #9fe0ff a #ffffff e gira piano col tempo del gioco (0,5 rad/s).
  - Sottile e mossa: un sole di fuoco, non un'aureola da santo. Con LOWFX resta ferma.
- Gli occhi lasciano due scie azzurre corte (8) dietro di sé.
- Le remiganti finiscono in lingue di fiamma: una frangia di fuoco lungo il bordo d'uscita dell'ala, fatta con un tracciato e un gradiente (non nove fiammelle). Ali da 240.
- Strascico di 7 piume (76, 88, 100, 112, 100, 88, 76, aperte di 11° l'una dall'altra), con gli occhi di fiamma azzurri.
- Pozza di luce azzurra; artigli d'acciaio scuro.

ENTRATA (enter, 3,4 s; BOSS_INTRO.phoenix 3,4)
- .00–.22 non si vede: è in cielo. L'ombra delle ali che attraversa la stanza la disegna il gioco sul pavimento.
- .22–.50 una colonna di fuoco cade sul cerchio di rune. Dentro, lei scende piano (z da 160 a 0): ali a mantello, strascico che pende sotto come la coda di una cometa, occhi chiusi, corona spenta. La colonna il modello la disegna dietro e davanti, come oggi.
- .50–.60 atterra leggera: le ginocchia piegano appena, niente botto, è regale. Lo strascico le cade dietro e si apre a ventaglio (.52–.62); la colonna si stringe.
- .60–.72 apre gli occhi, due lampi bianchi (.62). La corona si accende un pennacchio alla volta, dai lati al centro: .64, .66, .68, .70, .72.
- .72–.90 stende le ali a tutta apertura (aperte a .80); la colonna scoppia in un anello di scintille (.76); alza la testa e grida (becco aperto da .78 a .90). È il momento da poster.
- .90–1 richiude le ali a mantello e abbassa la testa su di te, con gli occhi fissi nei tuoi.

SCONFITTA (die, 4 s; momento clou a .55 = 2,2 s)
- .00–.15 un grido spezzato; barcolla.
  - Nella fase 2 la corona di sole si rompe in scintille (.04).
  - I pennacchi si spengono uno a uno, dal centro ai lati (.04–.14).
- .15–.35 un ultimo battito pesante (ali su a .18, giù a .26): si stacca di 10 da terra (.24) e ricade in ginocchio (.30), con le ali a terra.
- .30–.55 le piume diventano cenere grigia dalle punte verso il corpo: prima ali, strascico e corona, poi il corpo. Gli occhi si spengono in un grigio chiaro, con la lucina.
- .50–.65 un ultimo gesto regale: si avvolge nelle ali e nasconde la testa sotto un'ala.
- .55–.70 crolla in un mucchio di cenere (raggio 26, alto 18) con una piccola brace accesa in mezzo: è il momento clou.
- .70–.85 la cenere vola via in fiocchi verso l'alto e resta un piccolo uovo che brilla d'oro (9 × 11).
- .85–.95 l'uovo si crepa a zigzag e la cima si alza.
- .95–1 sbuca il pulcino di fuoco, che sbatte gli occhi:
  - una pallina arancio oro di raggio 6,5;
  - occhioni bianchi con la lucina;
  - un ciuffetto di fiamma azzurra in testa: la fiamma rinata passa a lui.
Niente ferite: solo cenere.

PRESA IN GIRO (taunt, 1,2 s)
È un pezzo della sua entrata: le ali aperte e la testa alta.
- .00–.30 alza la testa e ti guarda dall'alto del becco, con gli occhi socchiusi e la fessura.
- .30–.70 apre le ali a metà con uno scatto regale, come per togliersi la polvere di dosso; a .40 uno sbuffo di fiamma dalla corona.
- .45–.80 il becco si apre tre volte (.48, .58, .68): «kek-kek-kek».
- .80–1 richiude le ali, gira la testa di lato con aria sdegnosa (.82–.92) e torna a fissarti.

DISEGNI PER IL GIOCO
Stesso aspetto del modello, come N3.golemRock.
- N3.phoenixFeather(x, y, z, a, sc, o): la piuma di fuoco in volo lungo a.
  - Lunga 22 a sc 1: fusto cremisi, bandiera arancio, punta d'oro con la fiammella, una scia di scintille.
  - o.p2: azzurra.
  - o.stuck (da 0 a 1): piantata storta in un muro o nel pavimento, brucia fino a diventare cenere.
- N3.phoenixEmber(x, y, z, a, sc, o): la penna accesa che cade girando nella Pioggia (a è il giro), con la scia di scintille. Vicino a terra (o.k da 0 a 1) si accartoccia in una brace. o.p2: azzurra.
- N3.phoenixShard(x, y, z, a, sc, o): una scheggia del guscio di cenere con l'orlo acceso (oro, azzurro con o.p2) che rotola in volo.
- N3.phoenixShadow(x, y, a, k, sc): la grande ombra delle ali aperte vista da sotto, morbida, per l'entrata. k è l'opacità, a la direzione del volo.
- N3.phoenixSweep(p, p2) restituisce {a, r0, r1, on}:
  - a: l'angolo della frusta rispetto a dove parte (da 0 a TAU, smoothstep tra .30 e .80);
  - r0 = 30 e r1 = 135 (150 con p2);
  - on: vero tra .30 e .80.
- N3.phoenixInfo: {lanes:10, laneDeg:12, fanShot:.50, fan2Shot:[.36,.72], rain:[.24,.48,.72], rain2:[.22,.38,.54,.70], judge:[.25,.42,.59]}. Sono le cifre del modello, così il cervello non le ricopia a mano.
- N3.meta.phoenix2.old: la Fenice di oggi per «prima e dopo», come il Golem.

OPZIONI DEL MODELLO
- o.p2: seconda fase.
- o.z: altezza data dal gioco (nel gioco N3G.zm.phoenix = 1).
- o.noFx: niente effetti della mossa.
- o.gap: la prima corsia scura del Ventaglio, da 0 a 8, oppure −1 per nessun varco; o.gap2: quella del secondo ventaglio.
- o.chain: la picchiata non atterra.
- o.anvil: la picchiata finisce contro un'incudine.
- o.dir: verso della Ruota, ±1.
- o.ash: cenere sulle punte, da 0 a .35.
- o.veil: trasparenza dello strascico, da 0 a 1.
Le durate stanno in meta.dur, le etichette in meta.lab.

COSTO E LOWFX
L'obiettivo è una mediana di 1,3 ms al massimo (il Golem fa 1,2): misurare col foglio (node tests/foglio3d.js phoenix2 … --file sprite/nemici3d/phoenix2.js).
- Il mantello è un volume per ala con 5 punte; le penne aperte si disegnano solo quando l'ala è aperta.
- Fasce, gorgiera e squame sono tracciati calcolati una volta.
- Al massimo 16 fiammelle: 5 pennacchi, 6 remiganti, 5 occhi dello strascico.
- La corona di sole è un tracciato solo.
- Con LOWFX: niente bagliori, fiammelle, pozza di luce, scie, braci, scintille né fili degli dei animati. Restano il fuoco che corre (è solo colore ed è l'avviso), la cenere sulle punte e il cuore che batte (solo la grandezza).

RISCHI PER CHI COSTRUISCE
1. Le ali possono coprire l'eroe e i colpi: si aprono del tutto solo per poco. Va provato nella stanza vera.
2. Lo strascico sta sempre dietro le zampe; di lato risale in punta; da dietro non deve coprire l'eroe vicino (o.veil).
3. Gli occhi bianchi, con l'anello, l'alone, la lucina e il cipiglio, non devono sembrare vuoti o ciechi: vanno provati alla grandezza del telefono.
4. Il cobalto della fase 2 sul pavimento scuro: controllare le quattro direzioni sul pavimento vero dell'arena 10.
5. Modello e cervello devono coincidere: corsie e varco del Ventaglio (o.gap), giro della frusta (N3.phoenixSweep), battute della Pioggia (N3.phoenixInfo), cometa e incudine (o.anvil).
6. Le ali che si alzano dietro la schiena non devono fare scambi secchi nell'ordine di disegno.
7. Nello stesso mondo ci sono altri due boss di fuoco, la Salamandra e il Fabbro. La Fenice si distingue per la sagoma d'uccello con la corona, l'oro, gli occhi bianchi e la fase azzurra; niente metallo fuso, martelli o lame.
8. La voce è nel cervello: vedi le abilità.

## Le mosse del modello

| id | nome | secondi | descrizione |
|---|---|---|---|
| `idle` | Ferma | 3 | Ciclo che si chiude su se stesso. Dritta come su un trono: ali chiuse a mantello, strascico steso a terra. - Respiro: uno per giro, il petto si gonfia del 3%, la gorgiera sale, l'alone degli occhi pulsa. - Cuore: batte a .08 e .20, poi silenzio. - Testa: un giro lento della stanza (look ±0,38), poi torna a fissarti col becco in giù (−0,12). Batte gli occhi piano a .62. - Strascico: un'onda dalla radice alle punte per giro; le punte si arricciano di 2. - Corona: i pennacchi oscillano di ±3° in ritardo sulla testa. - .30: un artiglio gratta il pavimento (si alza di 2, tira indietro di 3, due scintille). - .70–.85: si scrolla. Le ali si alzano un poco, tremano due volte (6 Hz) e si risistemano; cadono tre braci. Niente scatti. |
| `walk` | Vola | 1.3 | Ciclo. Plana a 16 da terra con un battito lento e potente per giro. - .00–.40 battuta in giù veloce: le ali passano da su a giù, aperte fino a 180. - .40–1 battuta in su lenta, coi polsi piegati. - Il corpo è piegato avanti di 0,35 e sale di 3 dopo la battuta; la testa resta ferma su di te. - Zampe raccolte con gli artigli chiusi. Lo strascico è sollevato e sventola dietro con due mezze onde per giro. - .38: anello di cenere a terra. L'ombra resta sul pavimento. |
| `hit` | Colpita | 0.6 | Solo per le pagine e la voce: nel gioco i boss non la recitano. - Testa indietro (curva hitK). - Tre piume volano via e diventano cenere in aria. - La corona trema, gli occhi si stringono. A .45 è di nuovo in posa. |
| `fan` | Ventaglio dell'Impero | 1.6 | - .00–.05 si drizza col petto in fuori; il cuore batte a .01 e .05. - .05–.15 la luce sale nelle ali. - .05–.42 apre le ali dietro di sé verso l'alto, come un ventaglio imperiale (sp .9, fl +.9).   - Le 10 corsie (R1…R5 a destra, L5…L1 a sinistra, numerate da 0 a 9) si accendono a coppie da dentro a fuori: R5 e L5 a .10, poi una coppia ogni .03; tutte accese a .22.   - Le corsie o.gap e o.gap+1 restano scure, senza fiammella.   - Da .22 a .42 le accese brillano sempre di più. - .42–.50 battito tremendo in avanti: corona schiacciata indietro, becco aperto. - .50 le penne accese si staccano: è il colpo del gioco. Restano i calami (il 30% della lunghezza, scuri). - .50–.80 richiude a mantello. - .80–1 le penne ricrescono con uno sbuffo di scintille. |
| `fan2` | Ventaglio doppio (fase 2) | 2.3 | - .00–.03 si drizza; il cuore batte a .00 e .03. - .02–.30 apre il ventaglio e accende le corsie da .06, una coppia ogni .02; il varco A (o.gap) resta scuro. - .30–.36 primo battito; a .36 partono le penne A. - .36–.48 le ali tornano su; le penne ricrescono già accese (.40–.52), tranne il varco B (o.gap2). - .62–.72 secondo battito; a .72 partono le penne B. - .72–.90 richiude a mantello; .85–1 le penne ricrescono. |
| `dive` | Picchiata della Cometa | 2.2 | - .00–.05 il cuore batte a .00 e .04; il fuoco corre negli artigli e nella corona. - .00–.12 si accuccia con le ali alte. - .12–.30 due battiti enormi (.16 e .24) e sale: o.z da 0 a 260 (senza o.z il modello usa la stessa curva). - .30–.42 in alto si chiude a freccia: ali tirate indietro, corona schiacciata, strascico dritto. Diventa una cometa (goccia di fuoco con dentro la sua sagoma). A .38 un lampo bianco negli occhi e compare la fessura. - .42–.62 il tuffo: il gioco la sposta sulla linea, o.z scende fino a 12; scia di fuoco e strascico che sventola. - .62 frena: ali spalancate (220), artigli avanti, scintille. Con o.anvil sbatte contro l'incudine (testa indietro, ali buttate avanti, lampo) e cade. - .62–.80 slitta tra le scintille. - .80–1 si posa nella posa di Ali a terra. - Con o.chain: da .62 frena in aria a z 30 e resta sospesa ad ali aperte. |
| `redive` | Seconda picchiata (fase 2) | 1.6 | - .00–.25 sospesa a z 30, si gira verso di te (il gioco gira face), ali aperte; il cuore batte a .02. - .25–.45 si chiude a cometa; lampo negli occhi a .40. - .45–.62 il tuffo. - .62–.80 frena e slitta (o.anvil come nella prima). - .80–1 si posa ad Ali a terra. |
| `grounded` | Ali a terra | 1.1 | Ciclo: il gioco la tiene 1,1 s, 1,6 s dopo l'incudine. - Stesa sulle ali aperte e piatte sul pavimento (apertura 200), pancia a terra. - Testa su ma stanca, becco socchiuso; ansima con due respiri per giro. - La corona è ridotta a brace: pennacchi rosso scuro, niente fiammelle. - Il cuore è scoperto e pulsa forte e svelto: è il bersaglio. - Occhi socchiusi, le ali tremano appena. |
| `rise` | Si rialza | 0.5 | - .00–.50 spinge sulle ali e si rialza. - .50–1 si scrolla con un tremito e richiude le ali a mantello. - .60–1 la corona si riaccende, dalla brace alle fiamme. |
| `wings` | Ali dell'Impero | 1.6 | - .00–.06 il cuore batte a .00 e .04. - .06–.42 il fuoco corre sul bordo davanti delle due ali, dalle spalle alle punte. - .00–.20 plana avanti (il gioco la sposta) aprendo le ali (sp .6). - .20–.45 si drizza (lean −.25) e stende le ali di lato a tutta apertura (220); testa indietro, becco aperto. - .45–.52 chiude di colpo le ali davanti a sé, come due falci di fuoco che si incontrano davanti al petto; vampata davanti al becco a .50. Il colpo è a .52. - .52–.75 tiene le ali incrociate; il fuoco si spegne. - .75–1 le riapre piano e le richiude a mantello. |
| `wings2` | Ali dell'Impero doppie (fase 2) | 2.2 | - .00–.04 il cuore batte; il fuoco corre sui bordi da .04. - .04–.30 plana, si drizza, apre le ali. - .30–.38 prima chiusura davanti (colpo a .38). - .38–.45 tiene. - .45–.60 si gira di scatto (il gioco gira face verso di te) riaprendo le ali; il fuoco corre di nuovo. - .60–.72 tutta aperta. - .72–.80 seconda chiusura (colpo a .80). - .80–1 richiude a mantello. |
| `sweep` | Ruota di Fiamme | 2.4 | - .00–.06 il cuore batte a .00 e .04. - .06–.30 il fuoco corre sullo strascico dalla radice alle punte; gli occhi di fiamma si accendono. - .00–.15 plana verso di te (il gioco la sposta) aprendo le ali in orizzontale. - .15–.30 si pianta e si abbassa un poco. Lo strascico si alza e si raddrizza in una frusta sola (piume strette a ±4°), lunga 135 dal centro, a z 4. Con o.p2: due fruste a destra e a sinistra di lei, lunghe 150. - .30–.80 un giro intero con le ali aperte come una ruota.   - Angolo = o.dir·TAU·smoothstep((p−.30)/.50): lo stesso di N3.phoenixSweep.   - Le fiamme della corona si piegano contro il giro; la testa gira con 0,25 rad di ritardo. - .84 anello di fuoco dai piedi (disegnato fino a .95). - .80–1 si ferma; lo strascico ricade e si riapre; scrolla la testa (.88–.98). |
| `rain` | Pioggia di Braci | 3 | - .00–.06 il cuore batte; il fuoco corre nelle 3 remiganti più lunghe di ogni ala. - .00–.18 sale con battiti forti fino a 60, sempre in vista, con l'ombra a terra. - .18–.85 sospesa, batte forte in giù a .24, .48 e .72 (con o.p2 a .22, .38, .54 e .70).   - A ogni battuta si staccano 3 penne accese per ala e cadono girando; il modello le disegna per i primi 20, poi il gioco con N3.phoenixEmber.   - A ogni battuta la corona divampa. - .85–1 scende a spirale (un giro) e atterra con un battito che alza la cenere (.97). |
| `judge` | Sguardo del Giudizio (fase 2) | 2.6 | - .00–.15 si drizza; la corona di sole divampa; la testa si abbassa verso di te; negli occhi compare la fessura; l'occhio degli dei si accende. Il cuore batte a .02 e .06 e il fuoco sale per il collo. - .15–.80 ti fissa: la testa ti segue piano, le scie degli occhi si allungano, le ali mezze aperte tremano (6 Hz).   - A .25, .42 e .59 un cenno secco della testa in giù (−0,35 in .03, torna in .06); a ogni cenno l'occhio degli dei lampeggia. - .80–1 gli occhi si calmano, la fessura sparisce, scuote la testa e richiude le ali. |
| `rebirth` | Rinascita (fase 2) | 3.4 | Il passaggio di fase: è la sua «rage». - .00–.12 grido spezzato; le fiamme tremano e si abbassano; cade. - .12–.28 si avvolge nelle ali come in un mantello regale, lo strascico le gira intorno: un bozzolo di fuoco. - .28–.56 uovo di cenere nera (22 × 27) con le crepe d'oro.   - Batte a .36, .46 e .56 e si gonfia di 1,04, 1,07 e 1,12; le crepe passano dall'oro all'azzurro.   - Da .30 sei fili di luce menta salgono da un cerchio a terra di raggio 40 dentro l'uovo. - .56–.64 le crepe si aprono; a .64 lo scoppio, con lampo e gusci. - .64–1 rinasce azzurra (la palette cambia tra .64 e .74) e si alza.   - Ali a tutta apertura, 240 (.78–.90).   - La corona di sole si accende una lingua alla volta (.80–.92).   - Grida col becco aperto (.84–.98). |
| `taunt` | Presa in giro | 1.2 | - .00–.30 alza la testa e ti guarda dall'alto del becco, occhi socchiusi con la fessura. - .30–.70 mezze ali con uno scatto regale, come per togliersi la polvere; sbuffo di fiamma dalla corona a .40. - .45–.80 il becco si apre tre volte (.48, .58, .68): «kek-kek-kek». - .80–1 richiude le ali, gira la testa di lato sdegnosa (.82–.92) e torna a fissarti. |
| `enter` | Entrata | 3.4 | - .00–.22 non si vede: l'ombra delle ali la disegna il gioco a terra. - .22–.50 colonna di fuoco sul cerchio di rune (dietro e davanti). Dentro scende piano, z da 160 a 0: ali a mantello, strascico che pende come la coda di una cometa, occhi chiusi, corona spenta. - .50–.60 atterra leggera, senza botto; lo strascico cade dietro e si apre a ventaglio (.52–.62); la colonna si stringe. - .60–.72 lampo bianco degli occhi che si aprono (.62); i pennacchi si accendono dai lati al centro (.64, .66, .68, .70, .72). - .72–.90 ali a tutta apertura (a .80); la colonna scoppia in un anello di scintille (.76); testa alta e grido (becco aperto da .78 a .90). - .90–1 richiude a mantello e abbassa la testa su di te. |
| `die` | Sconfitta | 4 | Momento clou a .55 (2,2 s). - .00–.15 grido spezzato; barcolla. Nella fase 2 la corona di sole si rompe in scintille a .04. I pennacchi si spengono dal centro ai lati (.04–.14). - .15–.35 ultimo battito pesante (su a .18, giù a .26): si alza di 10 (.24) e ricade in ginocchio (.30), ali a terra. - .30–.55 cenere grigia dalle punte verso il corpo; gli occhi si spengono in grigio chiaro, con la lucina. - .50–.65 si avvolge nelle ali e nasconde la testa sotto un'ala. - .55–.70 crolla in un mucchio di cenere (raggio 26, alto 18) con una brace accesa in mezzo. - .70–.85 la cenere vola via a fiocchi; resta un piccolo uovo che brilla d'oro (9 × 11). - .85–.95 l'uovo si crepa a zigzag e la cima si alza. - .95–1 sbuca il pulcino di fuoco (raggio 6,5, occhioni bianchi con la lucina, ciuffetto di fiamma azzurra) e sbatte gli occhi. |

## Le abilità nel gioco

IL CERVELLO NUOVO: src/js/89-fenice-nuova.js
Si prova prima col modello finto anteprime/boss2/phoenix_stub.js.

PRINCIPI
- Si accende solo se c'è N3.phoenix2, come G2ON del Golem. Allora:
  - N3.phoenix diventa N3.phoenix2;
  - il disegno di oggi va in N3.meta.phoenix.old;
  - EUPD.phoenix di 83 viene sostituito;
  - B3IN.phoenix, B3DIE.phoenix e ETELE.phoenix (l'anello disegnato oggi durante la rinascita: via) diventano quelli nuovi.
- Valori da mettere:
  - ET.phoenix: r 28; hp 6600 e cdmg 24 restano come oggi;
  - BOSS_INTRO.phoenix 3,4;
  - BDEATH.phoenix {dur 4, clou 2,2, snd 'ignite'};
  - B2H.phoenix 96;
  - N3G.zm.phoenix = 1 (il modello si alza da solo con o.z);
  - N3G.opt.phoenix = e => ({gap, gap2, chain, anvil, dir, ash, veil});
  - n3Move: 'grounded' gira a ciclo ((e.mt/1,1) % 1); per l'entrata ci pensa già 81, con BOSS_INTRO.
- Tempo:
  - La Fenice ha il suo tempo, pensato per l'arena 10. Il cervello divide il dt per (G.bossLvl||bossLvl()).spd: in quest'arena è circa 1,3, e senza questa divisione gli avvisi scenderebbero sotto 0,6 s.
  - Nella fase 2 moltiplica il dt per 1,15.
  - I p sono quelli del modello: nella fase 1 i secondi del modello sono secondi veri; nella fase 2 i secondi veri sono i secondi del modello divisi per 1,15.
- Le mosse:
  - Ogni stato ha il nome di una mossa del modello (b3go, b3tick, b3k, b3at di 81) e il colpo vero parte nel suo p.
  - Una mossa alla volta.
  - Ogni danno ha un avviso rosso a terra (229,72,77) di almeno 0,6 s veri. I danni qui sotto sono prima di DMG().
  - Tra una mossa e l'altra vola 1,0–1,4 s (fase 2: 0,7–1,0 s).
- o.ash, la cenere sulle punte:
  - fase 1: .35·clamp((max−hp)/(max/2), 0, 1);
  - fase 2: .35·clamp((max/2−hp)/(max/2), 0, 1).
- o.veil: vale 1 quando l'eroe sta sullo strascico, cioè dietro di lei entro 115 px e entro ±35° dalla direzione opposta a face; sfuma in 0,2 s.
- Quota e bersaglio:
  - In alto non si colpisce (canHit: z > 20).
  - e.air = 1 quando vola alta (Picchiata, Pioggia): niente danno da contatto e niente presa in giro in volo.
- I pericoli suoi stanno in G.ph, come G.g2 del Golem: avvisi, mezzalune, frusta, cerchio che insegue, colonne, piume piantate, penne che cadono, ombra dell'entrata, incudini roventi.
- Tetto: al massimo 14 zone di fuoco. Quando ne arriva una nuova, si spegne la più vecchia.

CAMMINO (walk)
- Come oggi: le gira intorno a mezza distanza, tra 170 e 240 px (ancore con b3spot).
- 90 px/s (fase 2: 110), face verso l'eroe, e.z = 0, e.air = 0.
- Il passo dell'animazione viene dal suo orologio (N3G.wp, come il Golem).

1. VENTAGLIO DELL'IMPERO (fan 1,6 s; nella fase 2 fan2 2,3 s)
- All'inizio:
  - s = ±1 a caso.
  - 10 corsie: θi = (i − 4,5)·12° + 6°·s, con i da 0 a 9 da destra a sinistra di lei (+y è la sua sinistra). Gli angoli sono nel corpo; nel mondo si convertono con b3pt dei punti [100·cos θi, 100·sin θi], così coincidono col modello.
  - La corsia h punta sull'eroe: h = 4 se s = +1, h = 5 se s = −1.
  - Varco g (corsie g e g+1): g = h−2 o h+1 il 70% delle volte, h−3 o h+2 il 30%, sempre dentro 0–8.
  - e.gap3 = g, passato al modello come o.gap.
- Avviso a .05:
  - raggi rossi sottili tratteggiati (b3wline larghi 5, lunghi 300) sulle 8 corsie accese, fino a .50 (0,72 s);
  - nelle due corsie del varco niente raggio.
- Colpo a .50:
  - 8 piume (shootE dal petto, b3pt(e, 14, 0) con y − 30): 220 px/s di base (shootE le accelera con la stanza, come oggi), raggio 6, danno 13;
  - tipo 'pfeather', disegnato con N3.phoenixFeather.
  - Contro le incudini si fermano (lo fa già il gioco): l'incudine «canta», con un tintinnio e le scintille.
  - Quelle che escono dalla stanza restano piantate nel muro e bruciano 1,2 s (solo disegno, o.stuck).
- Si schiva:
  - entrando nel varco: un corridoio di tre corsie, circa 90 px a 200 px da lei;
  - uscendo dal ventaglio (108°);
  - riparandosi dietro un'incudine;
  - da lontano si passa anche tra due corsie.
- Fase 2 (fan2):
  - ventaglio A mirato a .02 col varco A, colpo a .36 (0,68 s veri);
  - ventaglio B mirato dove sei a .40, col varco B (|gB − gA| ≥ 2), colpo a .72 (0,64 s);
  - 240 px/s, danno 14, piume azzurre ('pfeatherb').
- Arena: b3fx 'ffeathers' al colpo.

2. PICCHIATA DELLA COMETA (dive 2,2 s, poi grounded e rise)
- A .05, la linea:
  - parte dalla sua posizione, passa sull'eroe e arriva al muro, al massimo 440 px;
  - se incontra un'incudine si ferma lì (D.anvil).
- Avviso: b3wline larga 36 che si riempie fino a .42 (0,81 s; fase 2 0,71 s), con la freccia e il cerchio d'arrivo di raggio 56. Se c'è l'incudine, si borda di rosso.
- Quota (e.z):
  - .12–.30 da 0 a 260;
  - .30–.42 resta a 260;
  - .42–.62 scende fino a 12 mentre corre sulla linea (posizione con smoothstep);
  - poi 4, e a .80 torna a 0.
  - e.air = 1 da .12 a .80.
- Colpi:
  - in .42–.62, se l'eroe è entro 26 px dalla cometa: 22, una volta sola;
  - a .62, se è nel cerchio d'arrivo: 18.
- Scia di fuoco: una zona ogni 38 px (raggio 17) per 2,2 s; nella fase 2 3 s (il cervello può tingerla d'azzurro).
- Incudine:
  - a .62 lei ci si schianta e il modello riceve o.anvil = 1;
  - b3fx nuovo 'fanvil': l'incudine suona e resta rovente 3 s (il cervello avvolge drawRock per il bagliore rosso), scintille, shake 7.
- Poi grounded:
  - 1,1 s (dopo l'incudine 1,6 s); nella fase 2 0,9 s e 1,4 s veri;
  - ferma a terra, i colpi fanno +50% (hurtE avvolto, come il Golem); la prima volta nella partita compare «Fiamma bassa!»;
  - poi rise 0,5 s e torna a volare.
- Si schiva:
  - uscendo dalla linea: un passo di lato di 30 px basta;
  - oppure mettendosi dietro un'incudine: lei ci sbatte contro e resta a terra più a lungo.
- Fase 2, Picchiata a V:
  - dive con o.chain: a .62 non atterra (resta a z 30) e passa subito a redive (1,6 s);
  - a redive .00 parte la seconda linea, dal punto dov'è, attraverso di te, fino al muro o a un'incudine; l'avviso dura fino a .45 (0,63 s veri);
  - il tuffo è in .45–.62, coi colpi come sopra;
  - poi grounded 0,9 s (1,4 s con l'incudine) e rise.
- Arena: b3fx 'fdive' all'arrivo (le passa la linea), come oggi.

3. ALI DELL'IMPERO (wings 1,6 s; nella fase 2 wings2 2,2 s)
- All'inizio:
  - il punto d'arrivo Q è la sua posizione spostata verso di te di min(100, d − 110) se sei più lontano di 110, in un posto libero (b3spot);
  - lei plana fino a Q in .00–.20.
- Avviso a .06: una mezzaluna rossa a terra centrata in Q, raggio 150, ampia 200° e rivolta verso di te. Si riempie fino a .52 (0,74 s) e il suo bordo prende fuoco man mano che il fuoco corre sulle ali.
- Colpo a .52: chi è dentro (distanza da Q sotto 156 e angolo entro ±100°) prende 24.
- Si schiva: uscendo oltre il bordo (40–60 px), con lo scatto, oppure, se sei vicino, girandole dietro (i 160° dietro di lei sono sicuri).
- Fase 2 (wings2):
  - mezzaluna 1 a .04, colpo a .38 (0,65 s veri);
  - mezzaluna 2 a .42, rivolta dove sei in quel momento; lei si gira (face) in .45–.60; colpo a .80 (0,73 s);
  - alla fine l'unico posto sicuro è lontano.
- Arena, b3fx nuovo 'fwings' alla chiusura:
  - un colpo di vento;
  - le torce si piegano e quasi si spengono (b3torch('ember', .5));
  - polvere e cenere spinte via da lei (ENV2.chunks);
  - gli ostacoli tremano (ENV2.rocks).

4. RUOTA DI FIAMME (sweep 2,4 s)
- All'inizio:
  - Q è il punto verso di te a 100 px da te, al massimo 120 px di strada; lei ci plana in .00–.15;
  - dir = ±1 a caso, passato come o.dir;
  - la frusta parte dietro di lei (face + π); nella fase 2 le fruste sono due, a face ± π/2.
- Avviso da .00:
  - in Q il cerchio rosso tratteggiato di raggio 140 (fase 2: 160);
  - la riga rossa dove parte la frusta e la freccia del verso;
  - da .30 l'anello tratteggiato dell'onda a 190 (fase 2: 260).
- Colpo in .30–.80:
  - la frusta è la riga da 30 a 135 px (fase 2: 150) all'angolo di partenza + dir·N3.phoenixSweep(p).a;
  - ti colpisce se in quel fotogramma l'angolo passa su di te e la tua distanza da lei è tra 18 e 147 px (fase 2: tra 18 e 162): danno 18, una volta per mossa.
- A .84 l'anello: G.waves {r: e.r, max 190, dmg 12} (fase 2: 260 e 14).
- Si schiva:
  - uscendo dal cerchio: la frusta parte dietro di lei e arriva dove sei circa 1,3 s dopo l'inizio (fase 2: circa 1 s);
  - oppure scattando quando passa;
  - poi allontanandosi oltre 190, o scattando dentro l'anello quando arriva.
- Arena: b3fx 'fvortex' a .84, più un anello di cenere cotto nel pavimento (b3mark 'ash' 8 volte a raggio 120).

5. PIOGGIA DI BRACI (rain 3 s)
- e.z resta 0, quindi è colpibile come oggi: è il modello a disegnarla in alto (60). e.air = 1.
- A ogni battuta (N3.phoenixInfo.rain: .24, .48, .72; fase 2 rain2: .22, .38, .54, .70) arriva un'ondata:
  - un meteor sull'eroe (raggio 30, danno 16);
  - 5 meteor in cerchio a 130 px intorno all'eroe (raggio 22, danno 14), a giro casuale;
  - l'avviso è quello dei meteor del gioco: 1,05 s, col cerchio e l'ombra che cresce;
  - il gioco disegna la penna che cade con N3.phoenixEmber, dalla punta dell'ala al bersaglio, con z da 100 a 0;
  - dove cade resta il fuocherello di 1,6 s dei meteor.
- Fase 2: l'ultima ondata è una brace enorme su di te (raggio 56, danno 20) più 5 braci a 150 px; braci e penne azzurre.
- Si schiva: uscendo dal centro ma senza andare lontano (tra 45 e 95 px dal punto dov'eri), oppure passando tra due braci dell'anello.
- Arena, b3fx nuovo 'frain': macchie di cenere (b3mark 'ash') dove cadono e penne piantate a terra per 4 s (solo disegno).

6. SGUARDO DEL GIUDIZIO (judge 2,6 s, solo nella fase 2)
- Da .15 un cerchio rosso di raggio 34 parte dai suoi piedi e ti insegue a terra a 100 px/s, più piano di te, fino a .70.
- A ogni cenno (.25, .42, .59):
  - resta un cerchio bloccato dove sta il cerchio che insegue; lampeggia 0,62 s veri;
  - poi da uno dei raggi della Forgia, dal soffitto, cade una colonna di fuoco azzurro: 22 se sei entro 40 px dal centro;
  - a terra resta un cerchio di rune bruciato. b3fx nuovo 'fjudge': il segno cotto nel pavimento e i raggi dell'arena che si accendono.
  - Tre colonne in tutto.
- Si schiva: continuando a muoversi; fermarsi a tirare solo subito dopo una colonna.
- È la prima mossa dopo la rinascita e torna a ogni giro.

7. RINASCITA (rebirth 3,4 s, a metà vita)
- Quando parte:
  - quando hp scende sotto max/2, qualunque cosa stia facendo;
  - non però in dive o redive tra .12 e .80: lì aspetta grounded.
- Mentre dura:
  - e.shell da .00 a .70: non si può colpire, e si vede il guscio;
  - e.moving = false, e.z = 0.
- All'inizio:
  - si spengono le zone di fuoco;
  - spariscono i colpi in volo (G.eproj = []), gli avvisi di G.b3, quelli di G.ph e la linea.
- L'uovo:
  - da .28 un anello rosso a terra (raggio 240) che si riempie fino allo scoppio (1,22 s);
  - i battiti dell'uovo a .36, .46 e .56 (fThump a 52 Hz, shake 2);
  - duckMusic(.45) da .28;
  - b3fx 'fegg' a .28.
- Scoppio a .64:
  - 16 schegge di guscio in cerchio: shootE 140 px/s, raggio 7, danno 12, tipo 'pshard', disegnate con N3.phoenixShard;
  - un'onda azzurra fino a 240 (danno 14);
  - e.p2 = true;
  - banner «La Fenice rinasce» «Fase 2»;
  - bossRage(e,'120,200,255') e barra rossa;
  - shake 9, vib;
  - duckMusic(1);
  - b3fx 'freborn'.
- A .84 il grido (b3say 'angry').
- Alla fine vola 0,8 s, poi il Giudizio.
- Si schiva lo scoppio: con lo scatto nell'onda e mettendosi tra due schegge, oppure stando lontano.

ORDINE DELLE MOSSE
- Fase 1: fan, dive, wings, sweep, fan, rain, poi da capo. Dopo l'entrata comincia dal Ventaglio.
- Fase 2: judge, dive a V, fan2, wings2, judge, sweep a due fruste, rain a quattro ondate, poi da capo.

ENTRATA (3,4 s, B3IN.phoenix)
- 0–0,75 s: l'ombra delle ali (N3.phoenixShadow) attraversa la stanza dal basso in alto, disegnata nel livello del pavimento.
  - Le torce divampano quando l'ombra ci passa sopra (b3torch('fire', .4)).
  - A 0,2 s un grido lontano (la voce nuova 'far').
- 0,75 s: la colonna di fuoco la disegna il modello; il gioco aggiunge le braci.
- 1,7 s: l'atterraggio leggero (shake 2, bruciatura 'scorch' sotto la colonna).
- 2,58 s: la colonna scoppia in un anello di scintille.
- 2,65 s: il grido (b3say 'cry'), shake 6 e gli anelli bianchi.
- e.em resta sotto 1 fino a 2,65 s.

SCONFITTA (4 s, B3DIE.phoenix; barra e «sconfitto» a 2,2 s)
- Cenere che sale (.30–.85) e braci azzurre (.00–.30).
- A .55 un tonfo morbido.
- A .85 il crac dell'uovo (sfx 'click').
- A .95 b3say(c,'chick'). Lo deve chiamare il B3DIE nuovo da solo, perché il gancio di 88 avvolge la funzione di 83.
- Le torce tornano del loro colore; la cenere cade piano come neve.

PRESA IN GIRO E PERSONALITÀ
- Quando la fa lo decide 88: 'laugh' quando ti colpisce, 'laugh2' quando non la colpisci da 7 s.
- Lo stato 'taunt' lo gestisce il cervello nuovo da solo, perché il gancio di 88 avvolge l'EUPD di 83, che non c'è più: b3tick, resta ferma, face verso di te, poi vola di nuovo dopo 0,3–0,55 s.

VOCE
B3VO.VB.phoenix si rifà nel cervello, come ha fatto il Golem.
- Lo strido è più grave e più lungo: 900–1.350 Hz invece di 1.150–1.600. Nei gridi c'è una seconda voce un'ottava sotto (a .35) e sotto ancora il soffio del fuoco (fNoise passa-basso a 800 Hz).
- Le chiavi:
  - cry, angry, hurt, die, win;
  - laugh: «kek-kek-kek», tre trilli corti che scendono e uno lungo;
  - laugh2: uno strido lungo e un colpo d'ali;
  - chick: resta quello di oggi;
  - far: il grido lontano, piano;
  - c_fan: «kiii!»;
  - c_dive: il grido che sale;
  - c_wings: un «vuuum» e lo strido;
  - c_sweep: il ruggito del fuoco e un trillo;
  - c_rain: «kraa», anche a ogni battuta;
  - c_judge: un grido solenne con un rintocco (vBell);
  - c_egg: tre colpi sordi.
- B3CUE.phoenix = {fan:'c_fan', fan2:'c_fan', dive:'c_dive', wings:'c_wings', wings2:'c_wings', sweep:'c_sweep', rain:'c_rain', judge:'c_judge', rebirth:'hurt'}.
- Il doppio battito del cuore si sente prima di ogni mossa, come per il Golem: fThump nei momenti A.beat del modello, contati nel suo tempo (diviso 1,15 nella fase 2).

MUSICA
Resta quella di 86. Si abbassa durante l'uovo e torna allo scoppio.

ARENA CHE REAGISCE
- Restano le chiavi di 87: ffeathers, fdive, fvortex, fegg, freborn.
- Le nuove le aggiunge il cervello avvolgendo b3fx: fanvil, fwings, frain, fjudge.

COSA TENERE DEL BOSS DI OGGI
- La stanza resta il «Nido della Fenice» (B3V): cerchio di rune 'fenice' arancio, poi azzurro; 8 crepe di lava; 4 grate.
- Le 4 incudini della stanza del Fabbro (bossLayout 'fabbro') ora servono: riparano dalle piume e la Picchiata ci si schianta.
- Niente servitori: oggi non ne ha e non ne prende.
- Restano BBFX, B2T, l'aura di braci (b2aura), RUNEC.fenice e i traguardi.
- Il bestiario cambia frase: «Boss. Ventagli di piume con un varco, picchiata da cometa (attirala contro un'incudine!), ali che tagliano davanti a sé, coda che spazza in cerchio, pioggia di braci a ondate. A metà vita rinasce dall'uovo, azzurra, e ti giudica con colonne di fuoco.»

PROVE
- Il registro BCL.phoenix:
  - n: 'La Fenice della Forgia', arena 9, p2 true;
  - enter(): G.arena = 9, G.chapter, G.diff e G.bossLvl = null, G.room = ROOMS, G.event = null, poi buildRoom();
  - moves: ['fan','dive','grounded','rise','wings','sweep','rain'];
  - moves2: ['rebirth','judge','fan2','redive','wings2'];
  - hz(): avvisi, raggi, linea, mezzalune, frusta, braci, colonne, piume, schegge, zone di fuoco;
  - voice: ['cry','laugh','angry','die','chick'].
- Difficoltà: misurare con node tests/boss2diff.js phoenix (oggi 9,3 vite al minuto nel caso peggiore) e regolare con corsie e varco del Ventaglio, velocità del giro, numero di ondate e raggio della mezzaluna.

MODELLO FINTO (anteprime/boss2/phoenix_stub.js)
La Fenice di oggi che fa le mosse nuove con le durate nuove:
- fan e fan2 → feathers;
- dive e redive → dive;
- grounded → hit, poi idle;
- rise → idle;
- wings, wings2 e judge → prep;
- sweep → vortex;
- rain → rain;
- rebirth → rebirth;
- taunt, enter e die come oggi.
In più N3.phoenixSweep, N3.phoenixInfo e disegni semplici per piuma, brace, scheggia e ombra.

## Voti del direttore artistico

VOTI (severi, sul metro del Golem approvato: possente, bello, figo, che dia timore; un po' più cupo ma da Classica; abilità migliori e giuste per la Forgia degli Dei; fattibile bene con la cassetta C3)

«imperiale»: 8,7 su 10. VINCE.
Pro:
- È la sagoma più forte e più da boss. Tre triangoli (la corona di pennacchi, il mantello delle ali chiuse, il ventaglio dello strascico a terra) si leggono anche piccolissimi. È alta 122, superba e lenta finché non colpisce: possente, bella e figa nello stile Clash Royale (corona, oro battuto, materiali ricchi).
- È giusta per la sua arena: l'oro e l'occhio degli dei color menta (lo stesso degli stendardi della Forgia degli Dei), il Giudizio che fa cadere colonne dai raggi della Forgia, la rinascita nel «fuoco degli dei» della descrizione dell'arena.
- Gli avvisi stanno sul corpo e il gioco li usa davvero: il varco del Ventaglio lo sceglie il cervello e lo passa al modello, il giro della coda lo esporta il modello.
- Dopo la Picchiata c'è una finestra per colpirla, come i pugni incastrati del Golem. La rinascita ha tre battiti e l'anello a terra.
- Tiene quello che di oggi funziona: fuoco arancio poi azzurro, l'uovo, la voce che strida, il pulcino.
Contro:
- Non ha un'unica fonte del segnale come il cuore del Golem: ogni mossa ha un avviso diverso.
- Il Ventaglio a 8 corsie simmetriche lascia l'eroe fermo in mezzo a due corsie (non viene colpito), e il varco può capitare troppo lontano.
- La Ruota a 140 px non tocca chi sta a mezza distanza, che è dove lei vola (170–240).
- Ali da 240–260 coprono l'eroe e metà dello schermo.
- L'«aureola» sa di santo.
- Lo strascico da 110–135 costa e copre l'eroe quando le sta dietro.
- Gli occhi bianchi senza pupilla sono da provare.
- Non usa le 4 incudini della sua stanza.
- I tempi sono scritti senza la velocità dell'arena 10: bossLvl() fa andare i boss 1,3 volte più svelti (1,5 con la fase 2), quindi gli avvisi da 0,72 s diventerebbero 0,48 s.

«cenere»: 8,0 su 10.
Pro:
- È l'idea più «fenice»: si consuma mentre combatte e si riaccende.
- Ha il segnale più vicino a quello del Golem: il fuoco lascia il corpo e corre dal Cuore di Forgia nell'arto che colpirà.
- La vita persa si vede come cenere sulle piume.
- I cumuli e il Risveglio cambiano l'arena, e il Soffio si ferma contro gli ostacoli.
Contro:
- È troppo grigia: cenere chiara su un pavimento grigio, e a ogni avviso il corpo si spegne verso il grigio. Per metà del tempo è un uccello smorto, non a colori pieni.
- La maschera pallida a cuore con gli occhi infossati rischia di sembrare un teschio, che il piano ha tolto.
- Le ossa di brace della fase 2 portano verso l'horror e costano una tela in più.
- La postura da avvoltoio è meno regale per la custode della Forgia degli Dei.
- Sei attacchi, più i cumuli da gestire.

«ferro»: 7,0 su 10.
Pro:
- Il calore che sale dal ferro scuro al bianco è un avviso splendido.
- Il crogiolo come punto debole, il richiamo delle lame, le incudini come riparo, i colori della tempra.
Contro:
- Non è più una fenice: niente piumaggio di fuoco, è un uccello meccanico fatto di lame, e «Rinasce dalla sua cenere» non c'entra più.
- Si sovrappone al Fabbro (bronzo, ferro, crogiolo, metallo fuso, incudini), che sta nello stesso mondo e si sta rifacendo in questi giorni.
- Spade e lame sono meno da bambini delle piume di fuoco.
- 40 lame a più strati e dieci stati in più (bare, catch, stuck, pull, dizzy, soar, drop, slash, xslash, cage) sono tanto lavoro e tanti rischi nell'ordine di disegno.

IL DESIGN FINALE parte da «imperiale». Dalle altre prende:
- Da «cenere»:
  - il Cuore di Forgia nel petto: batte due volte e manda il fuoco lungo i rachidi delle penne nel pezzo che colpirà. È un solo segnale, come il cuore del Golem, e con gli occhi forma lo stesso triangolo di luci;
  - la cenere che sale sulle punte delle piume con la vita persa (o.ash);
  - il cuore scoperto nella finestra dopo la Picchiata;
  - le incudini che «cantano» quando le piume ci sbattono.
- Da «ferro»:
  - le 4 incudini della stanza come tattica: le piume ci si fermano, e la Picchiata ci si schianta e resta a terra più a lungo;
  - i fili di luce menta del fuoco degli dei che salgono dal cerchio di rune dentro l'uovo;
  - il colpo doppio del cuore che si sente prima di ogni mossa.

Correzioni mie:
- Ventaglio a 10 corsie (5 per ala) spostate di mezza corsia, così una corsia punta sempre su di te; il varco sta a 1–2 corsie dalla tua.
- Tempi pensati per l'arena 10: il cervello toglie la velocità generica di bossLvl e usa la sua (×1, nella fase 2 ×1,15). Tutti gli avvisi durano almeno 0,6 s veri, anche nella fase 2.
- Nella Ruota e nelle Ali prima plana verso di te.
- «Ali a terra» diventa un ciclo seguito da «Si rialza», così l'incudine può allungarla.
- Ali di 220 (240 nella fase 2), 180 in volo.
- Strascico di 100 (112 nella fase 2), che si fa trasparente quando l'eroe ci sta sopra.
- Al posto dell'aureola una corona di sole sottile e mossa.
- La pupilla a fessura compare solo quando giudica o prende la mira.
- Il cobalto della fase 2 è un tono più chiaro, per staccarsi dal pavimento.
- Nella Pioggia resta colpibile, alta 60 e non 90.
