# Il Fabbro Infernale: il design finale

(Deciso dal direttore artistico tra tre proposte, 16 ottobre. Tipo nel gioco: `smith`; modello `sprite/nemici3d/smith2.js`.)

## Il design

IL FABBRO INFERNALE · «il Gigante della Forgia»
Nome e titolo nel gioco restano: «Il Fabbro Infernale», «Signore della forgia».
- Modello 'smith2' in sprite/nemici3d/smith2.js. Nel gioco prende il nome 'smith'; il disegno di oggi resta come N3.meta.smith2.old per le pagine «prima e dopo».
- Base: la proposta «gigante». Dal «demone» prende l'entrata e il maglio alla catena, dall'«automa» la pressione e la fornace aperta.

1 · CHI È
Un gigante di bronzo nato nel cuore del vulcano: il fabbro e la sua fucina in un corpo solo.
- Nel petto a botte arde una fornace dietro un portello tondo a grata.
- Ai lati del portello ci sono tre feritoie per parte, come costole, dove si vede salire la pressione.
- Sulle spalle porta due spallacci-stufa di ghisa, con due camini che fumano a ogni passo.
- L'avambraccio sinistro è un'incudine. Sul destro è avvolta tre volte la catena del maglio, un blocco di ghisa grande quanto l'eroe.
- Dal cappuccio di cuoio, nel buio, si vedono solo due occhi di brace sotto una fascia di ferro a V. Sotto c'è una barba di ferro in tre trecce, poi un grembiule di cuoio rosso.

Come si comporta:
- È lento e pesantissimo, respira come un mantice e la testa non ti perde mai di vista.
- Quando entri lo trovi al lavoro, di spalle, sull'incudine: l'hai disturbato.
- Prima di ogni colpo il metallo che colpirà si arroventa davanti a te: bianco vuol dire adesso.
- Ogni mossa carica la pressione. Con tre feritoie accese sfiata e la fornace resta aperta: è lì che si colpisce.
- A metà vita il cappuccio gli brucia in testa, si alza la criniera di fuoco e tutto il bronzo diventa rovente.

Fa timore perché è una fucina che cammina. Resta della Classica: forme robuste da giocattolo, colori pieni, occhi con la lucina, al massimo due zannette, niente sangue, ferite o cuciture.

2 · SAGOMA E MISURE
Unità del modello a sc 1. Assi: x avanti, y alla sua destra, z in su; 0,0,0 è il punto dei piedi.

Altezze:
- 108,5 in cima al cappuccio, 116 in punta ai camini.
- Il fumo sale fino a circa 140; nella fase 2 la criniera arriva a 122.
- Cima degli spallacci a 93.
- Col maglio alzato nella Martellata arriva a circa 145.
- L'Arciere 3D è alto circa 37: il Fabbro è tre volte l'eroe, come il Golem nuovo (110).

Larghezze:
- 102 agli spallacci.
- Circa 116 contando maglio e incudine.

Forma generale: una torre larga in alto e piantata in basso.
- La botte del petto è enorme: 66 di largo e 54 di fondo.
- La testa è incassata tra i camini e un po' in avanti.
- Le braccia arrivano alle ginocchia e hanno gli avambracci grossi.
- Le gambe sono corte e un poco arcuate, su stivali di ghisa larghi e piatti.

Da lontano si leggono cinque forme:
1. In cima il triangolo camino–cappuccio–camino: nessun altro boss ha due comignoli che fumano.
2. Al centro il cerchio acceso del portello.
3. I due occhi di brace.
4. Il blocco del maglio a terra alla sua destra.
5. Il grembiule rosso.

È asimmetrico apposta: a sinistra il profilo dell'incudine col corno sopra il gomito, a destra il maglio con la catena.

Nelle quattro direzioni:
- Davanti: il cappuccio con la V e gli occhi, le trecce sopra il portello, le feritoie ai lati del portello, i due cerchi della botte, il grembiule.
- Di lato: la pancia a botte col portello che sporge, le feritoie, l'incudine di profilo (tavola, vita, corno), i camini inclinati indietro, il maglio sdraiato davanti.
- Dietro: il retro del cappuccio con la falda, le basi dei camini, la griglia di sfiato tra le scapole (si accende con la pressione), il nodo della cintura, i lembi del grembiule ai fianchi.

Nel gioco:
- ET.smith: raggio 34 (oggi 30), vita 4.200 come oggi, danno da contatto 20 (oggi 26).
- Alone e barra B2H.smith: 100 (oggi 72).

3 · I PEZZI NELLA POSA DI RIPOSO
Si costruisce con la cassetta C3 e il metodo dello spaventapasseri, con lo scheletro fatto come quello del Golem.

STIVALI E GAMBE
- Stivali di ghisa:
  - blocchi smussati (boxF) centrati in [3, ±16, 4,5], mezze misure [13, 9, 4,5], smusso 2;
  - punta rinforzata d'ottone (fascia a x 12–16) con tre borchie;
  - orlo in alto: fascia di raggio 11 tra z 9 e z 12.
- Anche in [−2, ±15, 34].
- Coscia lunga 15,5: capsula di bronzo, raggio da 11,5 a 10.
- Stinco lungo 12: raggio da 9,5 a 10,5, entra nell'orlo dello stivale.
- Ginocchia: ik col polo avanti e un poco in fuori, così le gambe sono arcuate. Il ginocchio sta intorno a [6, ±19, 20], con la rotula di bronzo (palla di raggio 8, spostata 2 in avanti).
- Caviglie in [1, ±16, 9].

CINTURA E GREMBIULE
- Cintura di cuoio scuro tra z 35 e z 41, mezza larghezza 27,5, mezza profondità 22,5.
  - Davanti, in [23, 0, 38], la fibbia d'ottone a forma di incudine (11 × 6).
  - Dietro, in [−22, 0, 37], il nodo di cuoio.
- Grembiule di cuoio rosso in tre lembi appesi alla cintura (leaf, piegati con bend).
  - Lembo davanti:
    - parte da [23, 0, 37], è lungo 24 (l'orlo arriva a z circa 13 e copre le ginocchia), mezza larghezza 19;
    - quasi rettangolare, un po' svasato in basso, piegato in avanti sulla pancia (bend 0,25);
    - due borchie d'ottone agli angoli in alto, orlo scuro a tre smerli.
  - Lembi ai fianchi: partono da [14, ±23, 37], lunghi 20, mezza larghezza 9, aperti in fuori di 15°.
  - Niente cuciture, solo pieghe morbide.

BOTTE DEL PETTO (bronzo)
- Solido di rivoluzione (revo) con profondità 0,82 della larghezza, a partire da z 36.
  - Profilo [quota sopra 36, raggio]: [0, 26], [8, 30,5], [20, 33], [32, 32], [42, 28], [48, 21], [51, 12].
  - La cima è a z 87; nel punto più largo (z 56) misura 66.
- Due cerchi di ghisa chiodati (band) a z 41–45 e a z 75–79, con raggio uguale al profilo più 1,6. Sei rivetti d'ottone ciascuno, disegnati solo quelli verso la telecamera.

PORTELLO DELLA FORNACE (il punto debole)
- Centro [26,9, 0, 58], normale [1, 0, 0,05], raggio 11.
- Cornice d'ottone tra raggio 11 e 13.
- Grata di quattro sbarre verticali di ghisa, larghe 2,2, a y −6, −2, 2 e 6.
- Cardine alla sua sinistra (y −12): due nocche d'ottone a z 53 e z 63.
- Chiavistello d'ottone alla sua destra (y +12).
- Dietro la grata il fuoco: un disco di raggio 10, dal cuore al fondo, con due lingue che si muovono piano (sotto i 6 Hz).
- Aperto, il portello gira sull'asse verticale del cardine fino a 110° in fuori. Si vede tutto il fuoco, con tre lingue che escono dall'alto della bocca.

FERITOIE (le costole)
- Tre per lato, sui fianchi davanti, ai lati del portello, a z 50, 57,5 e 65.
- Vanno da t ±0,78 a ±1,42 rad intorno alla botte (lunghe circa 19).
- Ognuna è un solco scuro (inchiostro largo 3,4 e sopra #12161c largo 2,2), con sopra una lamella di ghisa chiara (#a2adb9, larga 1,2).
- Dentro c'è la luce secondo lo stato: spenta, arancio quando c'è pressione, bianca nello Sfiato.
- Devono leggersi di fronte, di tre quarti e di lato.

GRIGLIA DI SFIATO DIETRO
- Tra le scapole: t = π, da z 61 a z 75.
- Riquadro tondeggiante di ghisa 18 × 14 con tre fessure orizzontali, che si accendono con la pressione come le feritoie.

SEGNI LEGGERI
- 6–8 archetti chiari di martellatura (#ffe2ae, opacità 0,35, 1 px), lontani dal portello.
- Fuliggine morbida rgba(30,18,10,0,35) sopra le feritoie e intorno alla base degli spallacci.
- Nessun taglio.

LUCE DELLA FORNACE
- Una pozza calda e morbida sul pavimento davanti ai piedi: sfumatura radiale 255,150,60, opacità 0,18 (0,35 col portello aperto).
- Un riflesso caldo dal basso sul lato di sotto delle trecce e sull'orlo basso del cappuccio: rende lo sguardo minaccioso.

SPALLACCI E CAMINI (ghisa)
- Spallacci-stufa: calotte d'ellissoide centrate in [−3, ±35, 80], raggi [17, 16, 13], tagliate a −0,1. Hanno una fascia d'ottone alla base e quattro rivetti.
- Camini:
  - partono dalla cima dello spallaccio, verso dietro, in [−8, ±40, 90];
  - vanno nella direzione d = nrm([−0,22, ±0,36, 1]), cioè 20° in fuori e un po' indietro;
  - lunghi 26, raggio 5,2 alla base e 6 in cima;
  - orlo d'ottone: fascia di raggio 6,8, alta 2,5;
  - bocca: disco con normale d, scuro #12161c, con la brace dentro (glowTop, #ff8c2e che sfuma);
  - la punta arriva a z circa 115.
- Il fumo esce dalla bocca vera in ogni direzione.
- Non devono sembrare corna: inclinati in fuori e indietro, con l'orlo d'ottone, la bocca accesa e sempre il fumo.

TESTA (con la sua telecamera, Vat) E BARBA
- Centro HC in [13, 0, 92].
- Cappuccio di cuoio:
  - ellissoide di raggi [15,5, 15, 16,5]: la cima è a 108,5;
  - dietro una falda: ellissoide [11, 13, 9] centrato in [2, 0, 86];
  - il colletto scende sulle spalle e sul petto tra gli spallacci: ellissoide [20, 24, 8] centrato in [6, 0, 83].
- Apertura del viso:
  - calotta sul davanti del cappuccio, verso [1, 0, −0,12];
  - mezzi angoli 0,62 in largo e 0,52 in alto (circa 18 × 16);
  - piena del buio #140a06, più scura verso il bordo;
  - un labbro chiaro sottile sull'orlo di sotto.
- Fascia di ferro sulla fronte, a V:
  - striscia larga 3,5 sulla superficie del cappuccio;
  - va da [0,62, −0,72, 0,30] giù fino a [0,97, 0, 0,20] (la punta, appena sopra l'apertura) e risale a [0,62, 0,72, 0,30];
  - luce sull'orlo alto, tre rivetti d'ottone (sulla punta e ai due capi);
  - è lo sguardo cattivo: quando stringe gli occhi la punta scende di 1,5.
- Barba di ferro in tre trecce:
  - nascono dall'orlo di sotto dell'apertura, nelle direzioni sul cappuccio [0,86, −0,34, −0,38], [0,92, 0, −0,42] e [0,86, 0,34, −0,38];
  - scendono un poco in avanti sul colletto fino a z circa 70, appena sopra il portello;
  - ognuna è una catena di quattro capsule, di raggio 4,4, 4, 3,4 e 2,8;
  - su ogni pezzo due o tre righine chiare in diagonale fanno l'intreccio;
  - una perlina d'ottone al secondo giunto e un puntale d'ottone (raggio 2,6) in fondo;
  - dondolano in ritardo col respiro e coi passi.

BRACCIA
- Spalle in [−2, ±40, 77], dentro gli spallacci.
- Omero lungo 25: capsula di bronzo, raggio da 10,5 a 9,5, con una piega chiara del muscolo fatta con shadeLimb.
- Gomito: anello d'ottone, fascia di raggio 9,6, alta 3,5.
- Avambraccio lungo 27.
- Pugno a manopola: palla di bronzo di raggio 11, pollice di raggio 4 dalla parte di dentro, due pieghe per le nocche.
- ik a due ossa, polo dei gomiti indietro e in fuori.
- A riposo il pugno destro è in [16, 44, 26] e il sinistro in [14, −45, 24].

AVAMBRACCIO SINISTRO: L'INCUDINE (ghisa)
- Corpo: boxF lungo l'avambraccio, mezze misure [11,5, 6, 7,5], smusso 1,5.
- Tavola: dalla parte di fuori, boxF [12,5, 2,2, 8,5] spostato in fuori di 7,5, con la faccia lucida verso fuori.
- Corno: cono lungo 13, base di raggio 6, sei facce come stoneF. Esce dalla tavola dalla parte del gomito e sporge oltre il gomito, indietro e un poco in fuori.
- Foro quadro: un puntino scuro sulla faccia, vicino al polso.
- Ammaccature e graffi lucidi.
- A riposo la faccia guarda in fuori: davanti si vede l'incudine di taglio col corno sopra il gomito, di lato tutto il profilo dell'incudine.
- Il pugno esce dalla parte del polso.

AVAMBRACCIO DESTRO: LA CATENA
- Bracciale di cuoio scuro: capsula di raggio da 10 a 11.
- Sopra, la catena del maglio avvolta tre volte: tre anelli di ghisa di raggio 11,8, alti 3, segnati con trattini scuri ad anelli alterni.
- Il capo libero (cinque anelli) scende dal polso all'anello del pomolo, con una piccola pancia (6 sotto la retta).

MAGLIO (nella mano destra)
- Testa:
  - blocco di ghisa (boxF), mezze misure [15, 9, 9], smusso 2;
  - lungo 30 sull'asse del colpo, 18 × 18 di sezione: grande quanto l'eroe;
  - le due facce di battuta lucide (#e2eaf2 con graffi chiari), spigoli scheggiati;
  - fascia d'ottone in mezzo, mezze misure [3,2, 9,6, 9,6];
  - sui due fianchi la runa del Fabbro: un tratto dritto con due punte a freccia ‹ ›, scura da fredda e accesa col calore (#ffd56a).
- Manico:
  - capsula di legno di raggio 3,8, dal centro della testa, perpendicolare all'asse del colpo, lunga 34 fino al pomolo;
  - due fasce di cuoio scuro (raggio 4,4) a 14 e a 22 dalla testa;
  - pomolo d'ottone: palla di raggio 4,6 con l'anello per la catena.
- A riposo:
  - la testa è sdraiata a terra davanti a destra, col centro in [26, 44, 9];
  - l'asse del colpo è lungo y, da y 29 a y 59, così davanti si vede tutto il blocco;
  - il manico va nella direzione nrm([−10, 0, 17]);
  - il pugno destro lo stringe a 20 dalla testa e il pomolo sporge dietro il pugno fino a circa [9, 44, 38].

4 · COLORI
Ogni pezzo ha tre toni (chiaro / base / ombra), luce calda dall'alto a sinistra e il bordo caldo (rim) su tutti i pezzi grandi. Le ombre sono profonde: «un po' più cupo».

FASE 1
- Bronzo (botte, omeri, pugni, rotule): #e9ad6a / #a8652c / #4a250d. Bordo caldo #ffe2ae.
- Ghisa (spallacci, camini, cerchi, incudine del braccio, stivali, testa del maglio, sbarre del portello): #a2adb9 / #5b6673 / #262c35. Facce lucide #e2eaf2, fessure #12161c.
- Ottone (rivetti, orli dei camini, cornice, cardine e chiavistello del portello, fibbia, fascia e pomolo del maglio, perline e puntali, anelli dei gomiti): #ffe196 / #d29b3c / #7a5218.
- Cuoio rosso del grembiule: #c46a3c / #8a3b20 / #40170b. Orlo #1f0d07.
- Cuoio del cappuccio: #7c4128 / #4c2416 / #230f08. Buio del viso #140a06.
- Cuoio scuro (cintura, bracciale destro, fasce del manico): #6a3a22 / #3e1f10 / #1c0c05.
- Barba di ferro: #7b7682 / #46424d / #1e1c23.
- Catena: #8d97a3 / #4f5864 / #22272e.
- Legno del manico: #8a5a36 / #5a3820 / #2a180c.
- Fuoco: cuore #fff6d6, caldo #ffd56a, fiamma #ff8c2e, fondo #d6431a. Bagliore 255,150,60.
- Occhi: cuore #fffbe8, iride #ffc23e, bagliore 255,190,80, lucina #ffffff.
- Bocca: fondo #3a1408, luce #ffd56a, zannette #f2c088.
- Rampa del calore (vale per ogni metallo che si scalda): dal suo colore a #9a2a1a, poi #ff5a1a, #ffb43a e infine #fff4d6. Bagliore 255,130,50.
- Fumo rgba(52,46,44,α); vapore rgba(236,240,244,α); scintille #ffd36e e #ff8a3a; cenere #8a8078.
- Incudine da lavoro dell'entrata: ghisa come sopra, su un ceppo di legno #8a6a44 / #6b4a2a / #4a3220 con due fasce di ferro.

FASE 2 «ARROVENTATO»
- Bronzo rovente: #ffbe7a / #c95a26 / #5c1d0a.
- Vene di calore: #ffd25c col bagliore 255,120,40. Sono sei linee lisce: due sul petto, che salgono dalla cornice del portello al cerchio di sopra; due sugli omeri; due sulle cosce. Sono metallo che brilla, mai tagli.
- Ghisa scaldata: #c49a8a / #6e4a46 / #2e1a19. Facce lucide #ffb366.
- Testa del maglio: sempre calda, al punto 0,55 della rampa (#ff6a1a con le facce #ffe2a0). Diventa bianca solo per colpire.
- Grembiule bruciacchiato: #a0502c / #5e2414 / #2a0e06, con tre fiammelle #ffb030 sull'orlo (tremolio sotto gli 8 Hz).
- Barba scaldata: #a08a86 / #5a4a4c / #2a1e20, perline accese #ffb34a.
- Testa: bronzo rovente. Orbite #3a1206; occhi #ffffff con iride #ffe08a e bagliore 255,110,40; bocca #ffd56a con zannette #ffd9a8.
- Criniera di fuoco: esterno #ff5a14, medio #ffa030, cuore #fff0b0.
- Fornace bianca #fff8e0 col bagliore 255,100,40. Le feritoie restano arancio fisse.
- Camini: fiamme invece del fumo, da #ff7a2e a #ffd36e, con la punta #fff6e0.

STATUA SPENTA (sconfitta)
- Bronzo cenere: #a39a90 / #6b645c / #2f2b27.
- Ghisa fredda: #8a8d93 / #55585e / #232428.
- Cuoio spento: i suoi colori mescolati al 50% con #3a302a.

AVVISI E PERICOLI
- Gli avvisi sono rosso-rosa 229,72,77, come nel resto del gioco.
- Lava e fuoco attivi sono arancio-giallo 255,170,60.
- Avviso e pericolo non hanno mai lo stesso colore.

CONTRASTO COL PAVIMENTO
Il pavimento della Forgia Infernale è grigio viola scuro (#3c3a42–#48464e), con torce rosse e crepe di lava.
- Bronzo e cuoio rosso sono più chiari e più saturi del pavimento.
- La ghisa è più chiara e più fredda.
- Il buio sta solo in pezzi piccoli (il viso, le fessure). Il Fabbro di oggi (#3a3a42) invece ci spariva dentro.
- Il fuoco del boss sta in pochi punti (portello, occhi, bocche dei camini, metallo caldo): il corpo si legge dai materiali e dal contorno spesso.

5 · FACCIA E OCCHI
FASE 1
- Nel buio del cappuccio ci sono due occhi di brace grandi, del tipo 'glow' della cassetta:
  - direzione [1, ±0,30, 0,03], rx 2,6, ry 2,3;
  - iride #ffc23e con dentro un cuore più piccolo #fffbe8;
  - bagliore 255,190,80 di raggio 3,2 volte l'occhio;
  - lucina bianca in alto a sinistra.
- Quando li stringe (ry × 0,55) diventano due fessure di fuoco sotto la V. Non si chiudono mai del tutto: il suo «battito» è stringerli e abbassarne un poco la luce.
- La bocca si vede solo nel ruggito, nella risata e nella presa in giro:
  - è una fessura di brace verso [1, 0, −0,34], tipo 'open', larga 3,6, alta fino a 2,6;
  - fondo #3a1408, dentro la luce #ffd56a, due zannette #f2c088.
- Il resto del viso non si vede mai: è buio.

FASE 2
- Testa calva di bronzo rovente: ellissoide [13,5, 13,5, 14] nello stesso centro del cappuccio.
- Sopracciglio di bronzo a V, esattamente dove era la fascia: una cresta pesante con l'ombra sotto.
- Naso corto e largo: palla di raggio 3.
- Occhi del tipo 'pip': orbite scure #3a1206, pupille bianche #ffffff, iride #ffe08a, bagliore 255,110,40.
- Bocca sempre un poco accesa (#ffd56a), con due zannette #ffd9a8.
- La barba resta.
- Dietro la testa la criniera di fuoco (sezione 9).

TESTA CHE GUARDA
- Da fermo si guarda intorno piano (look ±0,35 rad, cioè 20°) e torna sempre su di te.
- Camminando compensa l'imbardata del corpo e resta puntata su di te.

6 · IL SEGNALE CHE AVVISA I COLPI
IL RESPIRO DELLA FORNACE
All'inizio di ogni mossa il portello avvampa: luce piena per 0,08 e un «whoosh».

IL CALORE
La parte che colpirà si arroventa davanti a te, sempre con la stessa rampa: k va da 0 a 1 e passa dal suo colore al rosso #9a2a1a, all'arancio #ff5a1a, al giallo #ffb43a e al bianco #fff4d6. Da k 0,5 c'è un bagliore morbido 'lighter' (255,130,50); da k 0,7 cadono gocce di scintille. Bianco vuol dire adesso.
- Martellata: si scalda la testa del maglio.
- Lancio: si scalda la catena, dal polso al maglio, anello dopo anello, poi il maglio.
- Incudini: si scalda la faccia dell'incudine del braccio.
- Sfiatata: si scaldano le feritoie e il portello.
- Turbine: si scaldano il maglio intero e le bocche dei camini.

LA PRESSIONE
- o.press va da 0 a 3 e lo dà il gioco. Per ogni mossa fatta si accende una fila di feritoie per lato (prima quella in basso, poi quella in mezzo, poi quella in alto) e una fessura della griglia dietro.
- La luce è arancio fissa e ben leggibile: righe spesse almeno 2 px.
- Con tre file accese la mossa dopo è sempre la Sfiatata, e dopo la fornace resta aperta. I bambini imparano a contarle.

I CAMINI
- Tacciono (niente fumo) quando sta per sfiatare: un silenzio che mette paura.
- Sbuffano a ogni passo quando cammina: si sente arrivare.

7 · FERMO, CAMMINA, COLPITO
I momenti p sono nelle schede delle mosse.
- FERMO (idle, 3 s): respiro a mantice.
  - All'inspiro la botte si gonfia, spalle e camini salgono e il portello passa dall'arancio al giallo.
  - All'espiro i due camini sbuffano uno dopo l'altro e le feritoie lasciano un filo di vapore.
  - La testa si guarda intorno piano e torna su di te. La mano dell'incudine si sgranchisce, le trecce dondolano.
  - Il maglio è a terra; ogni tanto ne cade una scintilla.
  - Il corpo è quasi fermo: è la testa che fa paura.
- CAMMINA (walk, 1,4 s): due passi pesanti a ginocchia piegate.
  - A ogni appoggio il corpo scende di 3 e sbuffa il camino dello stesso lato («ciuff… ciuff…», come una locomotiva).
  - Il maglio trascinato gratta il pavimento e fa scintille. Il grembiule segue le cosce. La testa resta ferma su di te.
  - Il gioco lo fa andare lento e lo ferma a 80 px da te: non ti viene addosso.
- COLPITO (hit, 0,6 s): serve solo alle pagine e ai fogli.

8 · LE ABILITÀ
Qui il riassunto: i momenti p sono nelle schede delle mosse, i numeri del gioco nel testo «abilita_gioco».

MARTELLATA ROVENTE (slam 2 s, poi stuck 1 s)
- Trascina il maglio e lo alza sopra la testa a due mani; intanto la testa del maglio passa dal nero al bianco.
- Lo tiene su tremando, poi un colpo secco davanti a sé.
- Dal cratere corrono tre crepe di lava (cinque nella fase 2).
- Poi tira tre volte il maglio incastrato e lo strappa via.
- Si schiva uscendo dal cerchio di lato, non indietro: indietro c'è la crepa di mezzo.

INCUDINI DAL CIELO (anvil 1,8 s)
- Mette l'incudine del braccio davanti al petto e ci batte sopra col maglio: tre DONG (quattro nella fase 2, l'ultimo doppio).
- Ogni DONG chiama un'incudine dal soffitto, col suo cerchio a terra.
- A terra le incudini restano 9 s come ripari.

LANCIO DEL MAGLIO (swing 1,6 s, poi hold, poi yank 1 s)
- Fa roteare il maglio sopra la testa, sulla catena, e lo lancia dove sei.
- Il maglio resta piantato con la catena tesa, poi lo strappa indietro, strisciando lungo la linea.
- Si schiva in due tempi: prima esci dal cerchio, poi non stare sulla linea.

SFIATATA DELLE COSTOLE (vent 1,9 s; nella fase 2 vent2 2,6 s) E FORNACE APERTA (open 1,6 s)
- Con tre file di feritoie accese i camini tacciono, le feritoie diventano bianche una fila alla volta e sale il fischio.
- Esplode in otto getti raso terra, a stella.
- Poi si sgonfia e la fornace resta aperta: i colpi fanno +50%.

TURBINE DEL MAGLIO (solo fase 2: spinup 1 s, spin 0,8 s per tre volte, dizzy 1,2 s)
- Trascina il maglio in un giro a terra, lo alza ai fianchi e gira su se stesso avanzando verso di te.
- Poi barcolla con la fornace spalancata: i colpi fanno +50%.

ORDINE DELLE MOSSE
- Fase 1: Martellata, Incudini, Lancio, Sfiatata (poi Fornace aperta), e da capo. Le Incudini vengono prima della Sfiatata, così ci sono i ripari.
- Fase 2: Turbine (poi Barcolla), Martellata, Incudini, Lancio, Doppia sfiatata (poi Fornace aperta), e da capo.
- Mai due mosse insieme.

9 · FASE 2 «IL FABBRO SI ARROVENTA» (rage, 3 s)
- Parte a metà vita, ma solo tra due mosse.
- Durante la furia non fa danni e non si può colpire.
- Il cappuccio brucia come cuoio e sotto c'è il bronzo. Occhi, sopracciglio e barba restano esattamente dove erano (si passa con fadeDraw), così è ancora lui.

CRINIERA DI FUOCO
- Nove lingue a ventaglio dietro la testa, da un orecchio all'altro, attaccate alla testa (si muovono con la sua telecamera).
- La lingua centrale è la più alta (punta a z circa 122), le altre vanno da 7 a 11.
- Ondeggiano piano, sotto gli 8 Hz.
- Vista da davanti sta dietro la testa, vista da dietro davanti alla nuca.

COSA CAMBIA PER SEMPRE
- Aspetto: testa calva, criniera, bronzo rovente con le vene di calore, maglio caldo, fiamme dai camini e sull'orlo del grembiule, fornace bianca.
- Tutto va 1,15 volte più svelto (oltre alla velocità dell'arena), con camminate più corte.
- Mosse:
  - Martellata a cinque crepe, che restano lava per 1,2 s;
  - cinque incudini: tre come prima, poi due insieme ai tuoi lati;
  - Lancio con la catena rovente e una scia di fuoco al ritorno;
  - Doppia sfiatata;
  - Turbine del maglio, che finisce in Barcolla.
- La regola del colore resta: tutto è arancio, quindi il bianco del colpo si nota ancora di più.

10 · ENTRATA «AL LAVORO» (enter, 3,2 s; BOSS_INTRO.smith passa da 2,6 a 3,2)
Quando entri lui c'è già. Nessun boss entra così: non scende e non sbuca, smette di lavorare perché l'hai disturbato.
- È in mezzo al cerchio di rune, di spalle. Il corpo è girato di π dentro il modello, mentre il gioco gli dà la direzione verso l'eroe.
- È chino su un'incudine da lavoro posata su un ceppo. Nella posa finale l'incudine sta in [−36, 0, 0], cioè dietro di lui quando si sarà girato.
- Nella mano sinistra tiene le tenaglie con un ferro rovente. Dalla telecamera si vedono la schiena, i camini e la griglia che brilla.

La sequenza:
1. Tre martellate sull'incudine: fontane di scintille, torce che lampeggiano, i camini sbuffano dopo ogni colpo.
2. Si ferma col maglio alzato a metà.
3. Gira di scatto la testa sopra la spalla e gli occhi si accendono.
4. Si gira tutto verso di te (la testa resta su di te) e getta di lato tenaglie e ferro, che rimbalzano tintinnando e si raffreddano a terra.
5. Fa un passo pesante trascinando il maglio, e i camini si accendono: pff… pff… WHOOSH.
6. Ruggisce a testa indietro, con la bocca accesa e le due zannette, le braccia larghe e il vapore che fischia dalle feritoie.
7. Posa il maglio a terra.

L'incudine da lavoro la disegna il modello fino a p .97. Da lì il gioco la tiene per tutto il combattimento come ostacolo, nello stesso punto: è il primo riparo.

11 · SCONFITTA «LA FORGIA SI SPEGNE» (die, 4 s; BDEATH.smith dur 4, momento clou a 2,0 s)
1. Barcolla e pianta il maglio a testa in giù davanti a sé, alla sua destra.
2. Cade in ginocchio, prima uno e poi l'altro, con la mano destra sul pomolo e l'incudine del braccio sulla coscia. Il portello resta in vista.
3. La fornace tossisce: la luce trema tre volte e i camini sputano fumo nero.
4. Momento clou: il portello si spalanca con un clangore e da feritoie, portello e griglia esce un grande sospiro di vapore bianco, che sale in colonna. Il fuoco si spegne e il bronzo si raffredda verso il grigio cenere. Nella fase 2 la criniera si stringe in fumo e le vene si spengono. Qui la barra si rompe e arriva «sconfitto».
5. Gli occhi tremolano due volte e si spengono, la lucina per ultima.
6. Silenzio: la testa cade sul petto.
7. Dal portello rotolano le ultime braci, che si spengono a terra; dai camini sale un ultimo filo di fumo.

Resta in ginocchio sul suo maglio, una statua fredda. La stanza si chiude quando il corpo ha finito, col rallentatore di 1,1 s come gli altri boss.
È diversa dal Golem, che torna pietra e si sbriciola: il Fabbro si spegne come una fornace.

12 · PRESA IN GIRO E VOCE
PRESA IN GIRO (taunt, 1,2 s), quando ti colpisce:
- alza il maglio accanto alla faccia e ci soffia sopra, come su una pistola appena sparata;
- lo picchietta due volte sull'incudine del braccio: tin-tin;
- ride «HO-HO-HO», e i camini fanno tre anelli di fumo a tempo con la risata (anelli di fiamma nella fase 2).

LA VOCE
- È bassa e metallica, come una campana con sotto il soffio del mantice.
- Il «ciuff» dei camini a ogni passo è il cuore della sua camminata.
- I dettagli per il cervello sono nel testo «abilita_gioco».

13 · DISEGNI DA ESPORTARE PER IL GIOCO
Hanno lo stesso aspetto del modello. x, y sono il punto a terra, z l'altezza.
- N3.smithAnvil(x, y, z, rot, sc, o): l'incudine di ghisa, 30 di lunghezza × 14 di larghezza × 20 di altezza, con corno e foro, ingombro a terra di raggio 16. Va bene in volo (z, rot) e a terra (z 0). Opzioni:
  - o.hot da 1 a 0: dall'arancio al ferro;
  - o.p2: arroventata;
  - o.brk da 0 a 1: si spezza in tre pezzi e si sbriciola;
  - o.work: l'incudine da lavoro sul ceppo, quella dell'entrata;
  - o.shadow false: l'ombra la fa il gioco.
- N3.smithMaul(x, y, z, rot, sc, o): il maglio da solo. Opzioni:
  - in volo, con rot che lo fa girare;
  - o.planted: testa affondata di 5, manico in su;
  - o.drag: sdraiato e trascinato, con o.a la direzione sullo schermo;
  - o.hot, o.p2.
- N3.smithChain(ax, ay, az, bx, by, bz, sc, o): la catena tra due punti, con anelli alterni (un'ellisse piatta e una sbarretta di taglio) ogni 6 px. Opzioni: o.sag da 0 (tesa) a 1 (molle), o.hot.
- N3.smithHand(face, anim, p, o): restituisce {h:[dx,dy], m:[dx,dy] oppure null}, gli spostamenti sullo schermo a sc 1 dal punto dei piedi:
  - h è il polso destro, dove la catena lascia l'avambraccio;
  - m è il centro della testa del maglio, quando è il modello a disegnarlo.
  Serve per i passaggi del Lancio: swing a p .60 e yank a p .40.
- N3.smithCrack(x, y, a, len, k, sc, o): la crepa di lava lungo la linea. Da k 0 a 0,2 corre, da 0,2 a 1 si raffredda; con o.p2 resta lava.
- N3.smithJet(x, y, a, len, k, sc, o): il getto raso terra di vapore e fiamma della Sfiatata lungo la corsia, con k da 0 a 1 la sua vita. Con o.p2 c'è più fuoco.

14 · OPZIONI, LOWFX, COSTO, ORDINE DI DISEGNO, COSE DA CONTROLLARE
OPZIONI
- o.p2: seconda fase.
- o.press: 0–3, le feritoie accese, dato dal gioco. In vent, vent2 e open il modello le gestisce da solo.
- o.noFx: niente fumo, vapore, scintille e radici dei getti. Restano colori, calore e luci.

LOWFX
- Niente bagliori 'lighter', fumo, vapore, scintille né braci.
- La criniera resta ferma, a colori pieni.
- Restano il calore, le feritoie e il portello: sono gli avvisi.

COSTO DI DISEGNO
- Mediana al massimo 1,3 ms (il Golem fa 1,2).
- Percorsi e gradienti calcolati una volta (Path2D, come il Golem).
- 'lighter' solo su tre o quattro bagliori: portello, occhi, maglio caldo, criniera.
- Nel modello al massimo 6 sbuffi di fumo, 10 scintille e 14 anelli di catena.

ORDINE DI DISEGNO
Lo decide la posa di riposo (parts + run), come nel Golem.
- Visti da davanti, i camini stanno dietro la testa.
- La barba sta davanti al petto e sotto la testa.
- Il grembiule sta davanti alle gambe visto da davanti e dietro visto da dietro.
- Le braccia si ordinano da dove sta il pugno (alzato: alla sua altezza).
- Il maglio: in mano va insieme al pugno destro; a terra si ordina dalla sua testa.
- La catena va col polso.
- Visto da davanti, il maglio alzato sopra la testa sta dietro la testa; visto da dietro, davanti.

DA CONTROLLARE NEI FOGLI
- Le quattro direzioni in ogni momento di Martellata, Incudini, Lancio e Turbine.
- I camini non devono leggersi come corna.
- L'incudine del braccio deve leggersi come un'incudine, di profilo e di taglio.
- Le feritoie accese devono leggersi anche di fronte.
- Il cappuccio che brucia: occhi, sopracciglio e barba devono restare fermi al loro posto.
- I passaggi del maglio tra modello e gioco, senza salti.
- I giri di catena che si srotolano senza scatti (ognuno sparisce in .04).
- Nel Turbine il riquadro del modello deve contenere il maglio a raggio circa 80.
- Nell'entrata il mezzo giro senza scatto sull'ultimo fotogramma.
- Nella sconfitta il portello deve restare visibile al momento clou.
- Niente blu: è della Fenice nella fase 2.
- Niente piume né pioggia di braci: sono della Fenice, che combatte nella stessa stanza.

## Le mosse del modello

| id | nome | secondi | descrizione |
|---|---|---|---|
| `idle` | Fermo | 3 | Respiro a mantice; si chiude su se stesso (p 0 = p 1). - Inspiro, 0–.55: la botte si gonfia del 4% (solo la botte), spalle e camini salgono di 2. La luce del portello passa da .55 a .85. Le feritoie accese dalla pressione si ravvivano e due scintille entrano nelle feritoie (.20, .35). - Espiro, .55–1: sbuffo tondo dal camino sinistro a .58 e dal destro a .66, un filo di vapore dalle feritoie a .62, la luce cala. - Testa: look ±0,35 rad, torna sempre su di te. Gli occhi si accendono di più con l'inspiro; a .82 si stringono (squint .6 per .08). - La mano sinistra (incudine) si apre e si richiude tra .30 e .45. - Le trecce della barba dondolano in ritardo sul respiro. - Il maglio riposa a terra accanto al piede destro; a .20 ne cade una scintilla. La catena tra polso e pomolo dondola appena. - Con o.p2:   - due respiri per giro (inspiri 0–.28 e .50–.78);   - fiamme fisse dai camini (tremolio sotto gli 8 Hz) invece degli sbuffi;   - la criniera ondeggia;   - il maglio è sollevato da terra di 4, arancio;   - le feritoie restano arancio fisse. |
| `walk` | Cammina | 1.4 | Due passi pesanti, senza saltelli: stepper con il piede destro a terra a 0 e il sinistro a .5, passo 10, piede alzato al massimo 4. - A ogni appoggio il corpo scende di 3 e si schiaccia del 3% (s −.03). - Rollio ±.05, imbardata ±.04, busto avanti .08. La testa compensa l'imbardata e resta puntata su di te. - A ogni appoggio sbuffa il camino dello stesso lato: destro a .02, sinistro a .52 («ciuff»). - Il braccio destro trascina il maglio: la testa del maglio striscia a terra accanto al piede destro e dondola di ±4° a ogni passo, con scintille a .10 e .60. - Il braccio sinistro con l'incudine oscilla di ±8° in controfase. - I tre lembi del grembiule seguono le cosce in ritardo, mai a caso. Anche le trecce vanno in ritardo. - Con o.p2: la stessa mossa (il gioco la fa 1,15 volte più svelta), fiamme dei camini piegate indietro, scintille più vive. |
| `hit` | Colpito | 0.6 | hitK: indietro di 3, busto −.08, testa −.12. - Sbuffo di vapore dalle feritoie a .05 e quattro scintille dal petto. - Occhi stretti fino a .40. - Il portello sbatte: si apre di 6° e si richiude. - Le trecce sobbalzano; poi torna con un'oscillazione. - Solo per pagine e fogli: in battaglia i boss non la fanno. |
| `slam` | Martellata rovente | 2 | Preparazione: - 0–.10: pianta i piedi (il sinistro avanti di 6). Il portello avvampa a .04 («whoosh»), i camini smettono di fumare. - .10–.42: trascina il maglio indietro (scintille a .12 dietro di lui, nel punto [−10,34,0]) e lo porta sopra la testa a due mani; la sinistra prende il manico a .26. Si inarca indietro (busto −.14, testa su). - La testa del maglio si scalda: calore 0 a .10, .35 a .22, .70 a .32, 1 (bianco) a .42, con gocce di scintille da .32. Tenuta, .42–.58: fermo in cima col maglio dietro la testa (punta a z circa 145). Braccia che tremano (7 Hz, ampiezza .6), vapore dalle feritoie, occhi stretti (.7), brontolio. Colpo: - .58–.62: cala secco davanti a sé. - A .62 la testa del maglio è piantata in [50,0,4], affondata di 5 e tagliata dal pavimento come i pugni del Golem. - Lampo bianco, polvere, sassolini; busto avanti .28, ginocchia piegate (giù di 5). Assestamento, .62–1: - resta curvo sul manico con le due mani, le spalle sobbalzano a .75 e .88; - il calore del maglio scende da 1 a .60 (arancio). La mossa dopo è 'stuck'. |
| `stuck` | Maglio incastrato | 1 | Il maglio è piantato in [50,0,4]. - Tre strattoni a .15, .42 e .68: indietro di 3, busto che ondeggia, sbuffi di polvere e sassolini al maglio. - Due ansimi di vapore dalle feritoie (.30, .58), occhi stretti. - A .85 lo strappa via con una fiammata di braci e zolle. - Tra .85 e 1 il maglio torna nella posa del Fermo. - Calore del maglio da .60 a .30. - Il portello resta chiuso: qui non c'è bonus, il punto debole è la fornace aperta. |
| `anvil` | Incudini dal cielo | 1.8 | Preparazione, 0–.18: - porta l'avambraccio-incudine di traverso davanti al petto, sopra il portello (z circa 70), con la faccia piatta in su; - la mano destra prende il maglio corto, vicino alla testa, e lo alza; - la faccia dell'incudine si scalda fino a .60 (arancio) a .18. Colpi: tre DONG a .28, .50 e .72. Il maglio sale nei .08 prima del colpo e cala secco. A ogni DONG: - lampo bianco sulla faccia dell'incudine; - ventaglio di scintille verso l'alto; - un anello di suono che sale (un'ellisse che si allarga e sale per .12); - subito dopo alza la testa verso il soffitto (testa su .25 per .10), come se chiamasse. Con o.p2: DONG a .22, .38 e .54, più un DONG doppio, più forte, a .70 (lampo più grande e due anelli). Ritorno, .85–1: abbassa le braccia nella posa del Fermo. Le incudini che cadono le disegna il gioco con N3.smithAnvil. |
| `swing` | Lancio del maglio | 1.6 | Preparazione, 0–.12: lascia scorrere il manico nel pugno fino al pomolo e prende la catena. La catena si scalda dal polso (rosso). Giro, .12–.55: - alza la mano destra sopra la testa, in [0,12,120], e fa girare il maglio in orizzontale sulla catena (raggio 40, due giri sempre più svelti); - scia di scintille dalla testa del maglio; - le spalle seguono il giro (imbardata ±.15), i piedi restano piantati, la testa su di te, gli occhi stretti; - il maglio si scalda fino a .70 a .55; con o.p2 la catena diventa rovente. Lancio: - .55–.60: ultimo giro basso in avanti e passo avanti col piede sinistro; - a .60 lascia andare il maglio: da qui lo disegna il gioco. N3.smithHand dà il punto del polso e quello del maglio a .60. Ritorno, .60–1: - braccio teso in avanti, mano in [40,30,70]; - i tre giri di catena dell'avambraccio si srotolano uno a uno (.70, .80, .90; ogni giro sparisce in .04). |
| `hold` | Catena tesa | 0.8 | Ciclo, p 0 = p 1. - Piegato all'indietro (busto −.18), piedi puntati col sinistro avanti. - Tutte e due le mani sulla catena tesa davanti al petto, in [24,±6,52]. - Braccia che tremano (6 Hz), sbuffo dai camini a .5. - Nel modello non c'è il maglio: è piantato lontano e lo disegna il gioco. - Il gioco tiene questa mossa per 0,65 s veri. |
| `yank` | Strattone | 1 | Strattoni, 0–.40: tira la catena a bracciate (.05, .18, .31). Le mani si alternano e il corpo si piega indietro a ogni tirata; intanto il gioco riporta il maglio strisciando lungo la linea. Presa, .40–.50: riprende il maglio al volo per il manico, con mezzo giro del busto (imbardata da .4 a 0). Da .40 il maglio lo disegna di nuovo il modello, nel punto che N3.smithHand dà per 'yank' a .40. Riavvolgimento, .50–.85: i tre giri di catena tornano sull'avambraccio uno a uno (.55, .65, .75). Ritorno, .85–1: il maglio torna nella posa del Fermo. |
| `vent` | Sfiatata delle costole | 1.9 | Preparazione: - 0–.08: pianta i piedi larghi e tira indietro le spalle, petto in fuori (busto −.1). I camini tacciono. - Le feritoie, già accese dalla pressione, diventano bianche una fila dopo l'altra: in basso a .10, in mezzo a .20, in alto a .30, insieme alla griglia della schiena. - Il portello diventa bianco, le trecce si sollevano. - Il corpo trema con un tremito che cresce fino a 7 Hz (ampiezza .8), e sale il fischio della caldaia. Getto: - a .55 esplode: da feritoie, portello e griglia escono corti getti di vapore e fiamma (radici lunghe 30 che tremolano fino a .80); - intanto allarga le braccia (pugni in [6,±62,60]) e butta fuori l'aria, da .55 a .80. Ritorno, .80–1: si sgonfia (s −.06) e ansima; il portello comincia ad aprirsi a .85. La mossa dopo è 'open'. Le otto corsie le disegna il gioco con N3.smithJet. |
| `vent2` | Doppia sfiatata (fase 2) | 2.6 | Come 'vent', ma con due raffiche. - Le feritoie diventano bianche a .06, .12 e .18. - Prima raffica a .40, getti da .40 a .55. - Rinculo e ricarica da .55 a .70: le feritoie tornano bianche tra .62 e .70 e il fischio risale. - Seconda raffica a .76, getti da .76 a .90, col busto girato di 22,5° rispetto alla prima (imbardata .39). - Da .90 a 1 si sgonfia; il portello comincia ad aprirsi a .95. |
| `open` | Fornace aperta | 1.6 | Il punto debole. - 0–.10: il portello si spalanca sul cardine fino a 110° e il fuoco ruggisce in vista: disco pieno, tre lingue di fuoco che escono dalla bocca, luce sulla barba e sul pavimento davanti. - È piegato avanti con le mani sulle ginocchia e il maglio appoggiato a terra. - Tre grandi ansimi a .20, .50 e .80: il petto si gonfia e all'espiro esce uno sbuffo di vapore dal portello aperto. - I camini sono muti, con solo un filo di fumo; gli occhi a metà. - Le feritoie si spengono una fila alla volta (.25, .45, .65): contano il tempo che resta. - A .85 il portello sbatte chiuso, col CLANG a .90. - A .92 gli occhi si riaccendono; da .90 a 1 si raddrizza. |
| `spinup` | Rincorsa del turbine | 1 | Solo fase 2. - 0–.15: abbassa il maglio a braccio teso fino a terra, alla sua destra. - .15–.70: lo trascina in un giro completo intorno a sé. Il corpo fa un giro intero (imbardata da 0 a 2π) e la testa del maglio raschia a terra a raggio circa 62, con scintille. - .70–1: lo alza ai fianchi a due mani, in orizzontale, con la testa del maglio a raggio 66. - Il maglio diventa bianco (calore 1 a .90) e il grembiule comincia ad aprirsi. - Finisce nella posa di 'spin' a p 0. |
| `spin` | Turbine del maglio | 0.8 | Solo fase 2; ciclo, p 0 = p 1. - Un giro intero su se stesso: imbardata da 0 a 2π, lineare. La rotazione è nel modello; il gioco tiene la direzione verso l'eroe. - Il maglio è teso in orizzontale ai fianchi, a due mani: testa a raggio 66, z circa 34, con una scia di scintille. - Il grembiule è aperto a campana (lembi laterali alzati di 50°), le trecce volano in fuori. - Spirali di fiamma dai camini, occhi stretti. - Il gioco ripete la mossa tre volte. |
| `dizzy` | Barcolla | 1.2 | Solo fase 2: il secondo punto debole. - 0–.15: si ferma di colpo e il maglio gli scivola a terra (CLANG a .15). - .05–.15: il portello si spalanca e resta aperto col fuoco in vista. - Tre passi incerti a .10, .35 e .60 (sinistro, destro, sinistro), con rollio ±.10 e la testa che ciondola. - Tre scintille gli girano sopra la testa come stelline (C3.stars). - .85–.95: si china e riprende il maglio; a .95 il portello si richiude. - A 1 è nella posa del Fermo. |
| `rage` | Si arroventa (fase 2) | 3 | Nessun danno. - 0–.12: barcolla di un passo indietro, i bordi del cappuccio fumano, il portello avvampa. - .12–.30: pianta i piedi e alza il maglio e il braccio-incudine sopra la testa. - .30: CLANG, il maglio batte sull'incudine del braccio sopra la testa (lampo bianco, anello di scintille). - .30–.40: la fornace ruggisce (portello bianco) e una fiamma risale dalla barba al cappuccio. - .40–.60: il cappuccio prende fuoco e brucia in uno sbuffo di fuoco e cenere. Un bordo arancio mangia il cuoio dal viso verso la nuca, i fiocchi di cenere salgono (fadeDraw). Sotto c'è la testa calva di bronzo: sopracciglio a V, occhi bianchi in orbite scure, bocca accesa con due zannette. Occhi, sopracciglio e barba restano esattamente dove erano. - .62–.70: dietro la testa si alza la criniera di fuoco. - .60–.85: il bronzo si arroventa, dal petto (.60) alle braccia (.70) alle gambe (.80). Si accendono le vene di calore, il portello diventa bianco, l'orlo del grembiule prende fiammelle, i camini sputano fiamme. - .78: ruggito, con la testa indietro, la bocca aperta e le braccia larghe. - .90–1: posa di guardia della fase 2, col maglio sollevato e arancio. |
| `taunt` | Presa in giro | 1.2 | - 0–.15: alza il maglio dritto accanto alla faccia (testa del maglio in [18,24,98], vicino al cappuccio). - .15–.35: ci soffia sopra come su una pistola appena sparata. La testa si piega verso il maglio, esce uno sbuffo di vapore dal viso e un ricciolo di fumo dalla faccia del maglio. - .45 e .58: lo picchietta due volte sull'avambraccio-incudine (tin-tin, due scintille). - .68, .78 e .88: «HO-HO-HO». Le spalle saltellano, la bocca si accende un poco, i camini fanno tre anelli di fumo a tempo (anelli di fiamma con o.p2). - .90–1: torna nella posa del Fermo. |
| `enter` | Al lavoro (entrata) | 3.2 | Comincia di spalle: il corpo è girato di π dentro il modello, mentre il gioco gli dà la direzione verso l'eroe. - È chino su un'incudine da lavoro posata su un ceppo davanti a lui. Nel riferimento finale l'incudine sta in [−36,0,0], cioè dietro di lui quando si sarà girato. - Nella mano sinistra tiene le tenaglie, con un ferro rovente sull'incudine. La sequenza: - .06, .19 e .32: tre martellate. Fontana di scintille, corpo che sobbalza, sbuffi dei camini a .09, .22 e .35. - .42–.48: si ferma col maglio alzato a metà. - .48: gira di scatto la testa sopra la spalla destra (imbardata della testa di circa 2,1 rad in .06) e gli occhi si accendono. - .52–.68: si gira tutto verso di noi (imbardata del corpo da π a 0), con la testa che resta su di noi. Getta di lato tenaglie e ferro: li lascia a .56, toccano terra a .62 e rimbalzano; il ferro si raffredda dall'arancio al nero fino a .97. - .68–.78: fa un passo pesante avanti trascinando il maglio. I camini si accendono: sbuffo a .70, sbuffo a .73, getto di fuoco a .76. - .78–.95: ruggito. Testa indietro, bocca accesa con due zannette, braccia larghe (incudine su, maglio su nella destra), vapore che fischia dalle feritoie. - .95–1: abbassa il maglio nella posa del Fermo. L'incudine da lavoro la disegna il modello fino a .97. Da lì resta nel gioco come ostacolo nello stesso punto (N3.smithAnvil con o.work). |
| `die` | La forgia si spegne (sconfitta) | 4 | - 0–.12: l'ultimo colpo lo fa rinculare (indietro di 5, busto −.18). Scintille dal petto, il portello sbatte. - .12–.30: barcolla e pianta il maglio a testa in giù, davanti a sé alla sua destra, in [24,30,0], affondato di 3 (tonfo a .16). Cade sul ginocchio destro a .22, poi sul sinistro a .30: il corpo scende di 15. La mano destra è sul pomolo, l'avambraccio-incudine appoggiato sulla coscia sinistra. Il portello resta libero alla vista. - .30–.48: la fornace tossisce. La luce del portello trema tre volte (.33, .39, .45), i camini tossiscono fumo nero (.35, .42), gli occhi tremolano. - .50, momento clou (2,0 s):   - il portello si spalanca con un clangore;   - da feritoie, portello e griglia esce un grande sospiro di vapore bianco che sale in colonna sopra di lui;   - il fuoco si spegne (portello, feritoie, bocche dei camini) e il bronzo si raffredda verso il grigio cenere, tra .50 e .72;   - con o.p2 la criniera si stringe in fumo (.50–.60) e le vene si spengono. - .52 e .55: gli occhi tremolano due volte e si spengono, la lucina per ultima. - .55–.75: silenzio; la testa cade sul petto e le trecce si posano con un clang a .70. - .75–.95: dal portello aperto rotolano le ultime tre braci, che si spengono a terra; un ultimo filo di fumo sale da ogni camino, con qualche fiocco di cenere. - .95–1: fermo, una statua grigia. Il gioco lo sfuma. |

## Le abilità nel gioco

CERVELLO NEL GIOCO: src/js/89-fabbro-nuovo.js
Si scrive come src/js/89-golem-nuovo.js e si prova col modello finto anteprime/boss2/smith_stub.js.

0 · COLLEGAMENTI
Tutto si accende solo se c'è il modello nuovo: const F2ON=typeof N3!=='undefined'&&!!N3.smith2.
- Il modello nuovo prende il posto di quello di oggi: N3.smith=N3.smith2, N3.meta.smith={...N3.meta.smith2, old: disegno di oggi}.
- ET.smith.r=34 e ET.smith.cdmg=20. Restano vita 4.200, oro, nome e titolo.
- BOSS_INTRO.smith=3.2.
- BDEATH.smith={dur:4,clou:2.0,snd:'block'}.
- B2H.smith=100.
- B2.smith.back=B2.smith.front=()=>{}: criniera, fumo, braci e bagliore 2D li disegna il modello.
- BBFX.smith={c:'#9a5e28',f:'#ffd27a',k:'fall',s:'block'}: la barra si rompe in schegge di bronzo che cadono suonando come metallo.
- RUNEC.fabbro resta com'è: arancio nella fase 1, rosso nella fase 2.
- B3S.add('smith'): spegne l'anello di sfere rosa di bossExtra (arene 5–8) e accende corpo, voce e presa in giro come per i boss nuovi.
- smithUpd (chiamato da 13-entrate-boss.js) si riscrive.
- N3G.opt.smith=e=>({press:e.press||0}).
- N3G.wp.smith come quello del Golem: la camminata segue il suo orologio e.wt.
- n3Move va avvolto per 'smith', perché da solo non conosce la fase 2 a 1,15:
  - di regola restituisce [e.st, b3k(e)] con l'orologio del cervello;
  - 'hold' e 'spin' vanno in ciclo: (e.mt/durata)%1;
  - 'enter' usa e.iT/3,2.
- N3.smithHand va chiamato con la stessa direzione con cui il gioco disegna il modello (e.f3, come fa g2pt nel Golem).
- Vecchi agganci da conoscere:
  - 16-creature.js:146 (il cerchio 2D dello slam vecchio, con sub 'a') resta spento, perché b3go mette sub vuoto.
  - 52-boss2-arena-reagisce.js:53, all'inizio di 'anvil', fa cadere 6 sassolini dal soffitto. Va bene così: il soffitto trema al primo DONG.
  - 24-disegno.js:92 è nel disegno 2D, che col modello 3D non si usa.

1 · TEMPI
- La fase 2 va 1,15 volte più svelta: sp=e.p2?1.15:1, dt*=sp (come nel Golem).
- Il gioco passa al cervello un dt già moltiplicato per la velocità dell'arena (14-update.js: updEnemy(e,dt*bl.spd)). Nell'arena 6 bl.spd vale da 1,17 a 1,20.
- Un tempo del modello diventa tempo vero dividendo per sp·bl.spd, con bl=G.bossLvl||bossLvl().
- Gli avvisi in G.f2.warn scendono in secondi veri, quindi durano anticipo nel modello / (sp·bl.spd). Il Golem divideva solo per la fase, perché nell'arena 1 bl.spd vale 1.
- Con i numeri qui sotto ogni avviso dura almeno 0,6 s veri, anche nella fase 2 (velocità totale ×1,38).
- I colpi partono nel loro fotogramma con b3at(e,p).
- Il danno è sempre hurtP(Math.round(N*DMG())), solo con P.inv<=0 e P.dashT<=0. Le distanze hanno il margine P.r*.4, come nel Golem.

2 · CAMMINATA
- Va verso l'eroe con navAngle e moveCircle, a 34 px/s nel tempo del boss (circa 41 px/s veri nell'arena 6, 47 nella fase 2).
- Si muove solo se è a più di 80 px dall'eroe. Più vicino resta fermo, girato verso di lui: il contatto lo prendi solo se gli vai addosso.
- Dura 1,1–1,5 s nel tempo del boss (fase 2: 0,9–1,2).
- A ogni passo (quando la fase della camminata passa 0 e 0,5): stepFx pesante, G.shake 1,5 e il «ciuff» del camino.

3 · ORDINE DELLE MOSSE E PRESSIONE
- Fase 1: ['slam','anvil','throw','vent'].
  - slam continua in stuck;
  - throw è swing, poi hold, poi yank;
  - vent continua in open.
- Fase 2: ['spin','slam','anvil','throw','vent2'].
  - spin è spinup, poi spin ripetuto tre volte, poi dizzy;
  - vent2 continua in open;
  - dopo la furia si comincia dal Turbine.
- Pressione e.press (da 0 a 3, passata al modello):
  - sale di 1 alla fine di stuck, di anvil e di yank;
  - alla fine di open torna a 0 (il modello spegne le feritoie una alla volta da solo);
  - con 3 la mossa dopo è sempre la Sfiatata.
- Mai due mosse insieme. Pozze, lava e scie finiscono prima del colpo della mossa dopo.

4 · LE ABILITÀ
I danni sono prima di DMG(), che nell'arena 6 alla stanza 10 vale circa 1,95.

MARTELLATA ROVENTE (slam 2,0 s, poi stuck 1,0 s)
- Si gira verso l'eroe a p 0 e da lì non si gira più (e.lf).
- p .05: compare un cerchio rosso di raggio 56 nel punto [50,0,0] del modello (g2pt(e,50,0)), davanti a lui verso di te, e resta fermo. Il riempimento passa dal rosso all'arancio al bianco insieme alla testa del maglio (calore .35 a .22, .70 a .32, 1 a .42).
- p .12: compaiono tre linee rosse larghe 22 (cinque nella fase 2: 0, ±28°, ±56°), dal centro del cerchio fino al muro o al primo ostacolo, al massimo 320 px.
- p .62, impatto: 22 a chi è nel cerchio (distanza < 56 + P.r·.4).
- Subito dopo le crepe di lava corrono dal centro lungo le linee a 520 px/s (N3.smithCrack): 12 a chi tocca una crepa quando passa il fronte (distanza dalla linea < 11 + P.r·.4), una volta per crepa.
- Nella fase 2 le crepe restano lava per 1,2 s: zone di fuoco del gioco (addZone 'fire', raggio 12, una ogni 24 px).
- Avviso: 1,14 s nel tempo del modello, cioè 0,95 s veri (0,83 nella fase 2).
- stuck, 1,0 s: resta fermo col maglio piantato e non attacca. Niente bonus: il punto debole è la fornace.
- Come si schiva: uscendo dal cerchio di lato, perché indietro c'è la crepa di mezzo.

INCUDINI DAL CIELO (anvil 1,8 s)
- DONG a p .28, .50 e .72. Nella fase 2 a .22, .38, .54, più un DONG doppio a .70.
- Ogni DONG mette a terra un cerchio rosso di raggio 26 con un'ombra che cresce.
- L'incudine cade 1,0 s veri dopo il suo DONG, fischiando; nell'ultimo 0,4 s si vede scendere dall'alto dello schermo (N3.smithAnvil con z che scende).
- Danno: 18 a chi è nel cerchio (distanza < 26 + P.r·.4), più il cratere.
- Dove cadono:
  - la prima sull'eroe;
  - le altre dove sta andando: posizione più velocità × 0,5 s, al massimo 60 px avanti;
  - sempre ad almeno 46 px dai centri delle altre e a 20 px da muri e ostacoli;
  - dentro la stanza: x tra L+24 e R−24, y tra TOP+30 e BOT−24;
  - il DONG doppio della fase 2 manda due incudini insieme ai due lati dell'eroe, a ±70 px di traverso rispetto alla linea boss–eroe: si scappa avanti o indietro.
- A terra:
  - restano 9 s come ostacoli: G.rocks, temporanee, kind 'anvil', raggio 16, disegnate con N3.smithAnvil;
  - arrivano arancio e si raffreddano in 3 s;
  - fermano le crepe, i getti della Sfiatata e i tuoi colpi;
  - al massimo 6 insieme: la più vecchia si sbriciola;
  - un'incudine che colpisce l'eroe si spezza e non resta;
  - le spazzano via il Turbine e il maglio che torna.

LANCIO DEL MAGLIO (swing 1,6 s, poi hold, poi yank 1,0 s)
- p .10: compare un cerchio rosso di raggio 40 sull'eroe, con una linea tratteggiata (la catena) dalla mano al cerchio.
  - Se l'eroe è più vicino di 100 px, il cerchio sta a 100 px sulla linea verso di lui.
  - Al massimo sta a 320 px dalla mano.
  - La linea si ferma contro gli ostacoli fissi della stanza; le incudini cadute non la fermano (il maglio le spacca).
- Il cerchio segue l'eroe a 110 px/s veri fino a p .45, poi si ferma e lampeggia due volte (.48, .54).
- p .60, il lancio: il maglio lascia il modello.
  - Il gioco lo fa volare ad arco, alto 70, con due giri su se stesso, in 0,5 s veri.
  - Parte dal punto del maglio dato da N3.smithHand(face,'swing',.6) e arriva al centro del cerchio.
  - La catena (N3.smithChain) va dal polso (N3.smithHand(...).h) al pomolo.
- Atterraggio: 20 a chi è nel cerchio (distanza < 40 + P.r·.4), cratere e scintille. Il maglio resta piantato (N3.smithMaul con planted) e le incudini vicine sobbalzano.
- hold: dura 0,65 s veri (nel tempo del boss 0,65·sp·bl.spd), con la catena tesa a terra. La striscia larga 26 dal maglio alla mano diventa piena, si accende e lampeggia: è l'avviso del ritorno.
- yank, da p .00 a .40: il maglio torna strisciando lungo la striscia fino al punto che N3.smithHand dà per 'yank' a .40, dove il modello lo riprende in mano.
  - 12 a chi tocca la testa del maglio che passa (distanza < 13 + P.r·.4), una volta sola.
  - Spacca le incudini cadute che trova.
  - Nella fase 2 la catena è rovente e lascia una scia di fuoco lungo la striscia (addZone 'fire', raggio 11, una ogni 22 px, per 1,2 s).
- Avvisi veri: dal fermo del cerchio all'atterraggio 0,70 s (0,67 nella fase 2); il ritorno 0,65 s.
- Come si schiva: in due tempi, prima esci dal cerchio, poi non stare sulla linea. Stargli lontano non basta più.

SFIATATA DELLE COSTOLE (vent 1,9 s, poi open 1,6 s)
- p .06: compaiono otto corsie rosse larghe 22, a stella dal suo centro. Una punta sempre sull'eroe, le altre ogni 45°.
- Ogni corsia arriva al primo ostacolo o muro (comprese le incudini cadute), al massimo 260 px, con frecce bianche verso fuori in fondo.
- Da p .55 a .80: getti di vapore e fuoco raso terra lungo le corsie (N3.smithJet), da 18 px dal centro fino alla fine della corsia.
- Danno: 16 a chi è in una corsia (distanza dalla linea < 11 + P.r·.4), una volta.
- Avviso: 0,93 s nel tempo del modello, cioè 0,78 s veri.
- Come si schiva:
  - mettendosi tra due corsie: a 140 px dal centro restano più di 60 px liberi, vicino a lui lo spazio si stringe;
  - oppure dietro un'incudine.
- Dopo la Sfiatata la nebbia di vapore resta a terra per 2 s (non con LOWFX).

DOPPIA SFIATATA (vent2 2,6 s, solo fase 2, poi open)
- p .04: compaiono le corsie A, come sopra.
- Da p .40 a .55: getti A, 16 di danno.
- p .40: compaiono le corsie B, ruotate di 22,5°: i posti sicuri di prima diventano corsie.
- Da p .76 a .90: getti B, 16 di danno.
- Avviso delle corsie B: 0,94 s nel tempo del modello, cioè 0,68 s veri.
- Come si schiva: bisogna cambiare spicchio tra le due raffiche.

FORNACE APERTA (open 1,6 s, dopo ogni Sfiatata)
- Non attacca e i colpi fanno +50%: si avvolge hurtE per type 'smith' quando st è 'open' o 'dizzy'.
- La prima volta nella partita compare la scritta «Colpo alla fornace!» (#ffd84a).
- Dura circa 1,33 s veri nella fase 1 e 1,16 s nella fase 2.
- Alla fine e.press torna a 0.

TURBINE DEL MAGLIO (solo fase 2: spinup 1,0 s, poi spin 0,8 s tre volte, poi dizzy 1,2 s)
- spinup, da p .00: intorno a lui un disco rosso di raggio 74, disegnato a terra sotto il boss, con l'anello tratteggiato e il solco tondo. Sono 0,72 s veri di avviso.
- spin, tre giri (b3go(e,'spin',3·durata)):
  - avanza verso l'eroe a 75 px/s veri col disco addosso;
  - prima di muoverlo con moveCircle si spaccano le incudini cadute che tocca (volano via); poi si ferma ai muri e non passa negli ostacoli fissi;
  - 18 a chi è nel disco (distanza < 74 + P.r·.4), al massimo una volta per giro;
  - la rotazione è nel modello: il gioco tiene e.face verso l'eroe.
- dizzy, 1,2 s: fermo, barcolla, fornace spalancata, i colpi fanno +50%.
- Come si schiva: correndo di lato (tu vai a 150 px/s, lui a 75).

5 · FASE 2
Parte a metà vita, ma solo dalla camminata: mai in mezzo a una mossa, né col maglio lontano né nel Turbine. Al passaggio:
- e.p2=true;
- e.shell=9: durante la furia non si può colpire;
- banner('Il Fabbro si arroventa!','Fase 2',1.6);
- bossRage(e,'255,120,40');
- $('bossBar').classList.add('rage');
- shake(8), sfx('boom'), G.eproj=[];
- b3go(e,'rage') e b3say(e,'angry').

La furia (rage) dura 3,0 s e non fa danni:
- p .30: CLANG, lampo bianco sopra di lui e anello di scintille;
- p .78: ruggito, con shake 8, vibrazione e tre anelli.
- Alla fine e.shell=0, e.press=0 e subito spinup.

Da lì in poi:
- tutto va 1,15 volte più svelto e le camminate durano 0,9–1,2 s;
- Martellata a cinque crepe, con la lava che resta 1,2 s;
- cinque incudini;
- catena rovente con la scia di fuoco;
- Doppia sfiatata e Turbine.

6 · ENTRATA
Si avvolge bossIntro per 'smith', come nel Golem: e.st='enter', e.face=a, niente danni e niente colpi. T=3,2 s; il modello recita 'enter' con p=e.iT/3,2.
- A 0,19, 0,61 e 1,02 s: le martellate sull'incudine da lavoro.
  - sfx('block') e scintille nel punto g2pt(e,−36,0,30);
  - shake 1,5;
  - lampo bianco-oro delle torce: ENV2.torches(['#ffffff','#ffd86b','#ff8a22'],'255,220,160',.3).
- A 1,54 s: due clic (la testa che si gira).
- A 2,24 e 2,34 s gli sbuffi dei camini; a 2,43 s il «whoosh».
- A 2,5 s: il grido (b3say(e,'cry')), shake 6, tre anelli e il nome sulla barra.
- A 3,1 s (p .97): l'incudine da lavoro diventa un ostacolo nello stesso punto del modello (g2pt(e,−36,0)).
  - G.rocks, raggio 16, kind 'anvil', segnata come f2work, disegnata con N3.smithAnvil({work:1}).
  - Resta per tutto il combattimento, lontana dalla porta.
  - Non conta tra le 6 temporanee e non la spaccano né il Turbine né la catena.
- Alla fine: e.si=−1 e b3go(e,'walk',.9).

7 · SCONFITTA
- snapBoss restituisce {live:1}.
- BDIE.smith:
  - setup: pulisce G.f2, mette in c.face la sua direzione e in c.p2 la fase, sfx('block');
  - tick: vapore e cenere; a 2,0 s il momento clou, con un lampo bianco morbido, shake 6 e il suono del vapore;
  - draw: N3.smith(c.x,c.y+8,c.face,'die',p,1,{p2:c.p2,noFx:LOWFX}).
- La barra e «sconfitto» arrivano al momento clou.
- La stanza si chiude quando il corpo ha finito, col rallentatore di 1,1 s.
- Voce: un lamento che si spegne in un sibilo.

8 · L'ARENA CHE REAGISCE (ENV2 e stamp, come per i boss di prima)
MARTELLATA
- Cratere (stamp 'crater' 36), crepe e bruciatura (ENV2.mark 'cracks' 60 e 'scorch' 30).
- Nel cratere resta la runa del maglio impressa a fuoco, che si spegne in 4 s.
- ENV2.rocks(x,y,170,3): gli ostacoli tremano e si crepano.
- ENV2.fall(B3N(8)) e ENV2.chunks con i colori '#3a3a42', '#ff7a2e', '#5f5f68'.
- Torce col lampo bianco-oro: ENV2.torches(['#ffffff','#ffd86b','#ff8a22'],'255,220,160',1.2).
- vfxBlast di lava e scintille, shake 9, vibrazione.
- Lungo le crepe uno stamp 'cracks' ogni 40 px.

INCUDINI
- A ogni DONG le incudini della stanza suonano e sobbalzano: un «ding» ed ENV2.rocks senza danno su quelle entro 220 px. Più un filo di polvere dal soffitto (ENV2.fall(2)).
- Quando un'incudine cade: cratere 18, schegge, ENV2.rocks(x,y,80,2), shake 3.

LANCIO
- Cratere all'atterraggio.
- Un graffio dritto dove il maglio torna (stamp 'cracks' lungo la linea); nella fase 2 anche la bruciatura.

SFIATATA
- Le torce si piegano e impallidiscono un momento: ENV2.torches(['#ffe6c0','#ffd27a','#ff8a22'],'255,230,190',.8).
- A terra resta una stella di fuliggine: piccoli stamp 'scorch' lungo le corsie, tra 40 e 90 px dal centro.
- Nebbia di vapore a terra per 2 s.

TURBINE
- Un solco tondo: stamp 'cracks' in cerchio a raggio 62. Nella fase 2 brilla per 1 s e poi si spegne.

FURIA
- Torce bianco-rosse: ENV2.torches(['#ffffff','#ff8a22','#ff3c10'],'255,140,60',3).
- ENV2.fall(10).

LUCE DELLA FORNACE (facoltativa)
- Una luce calda sul pavimento davanti a lui, come quella del Golem nella fase 2, più forte col portello aperto.

9 · VOCE E PERSONALITÀ
Si usa B3VO.VB.smith, come per il Golem, senza parole. Il timbro è basso e metallico, come una campana con sotto il soffio del mantice (ro alto e un poco di rumore).

I versi:
- cry: inspiro del mantice e ruggito basso (50–95 Hz) che rimbomba nel cappuccio e finisce in un fischio di vapore.
- angry: come cry ma più lungo, con il fuoco che scoppietta.
- laugh: «HO-HO-HO», tre note basse da 88 a 72 Hz.
- laugh2: «ho… ho…» con un tintinnio d'incudine.
- hurt: un «ungh» corto col clangore.
- c_slam: un brontolio che sale e poi «HRRAAH!» a tempo col colpo (p .62), programmato come il tum-tum del Golem.
- c_anvil: un «Hm!» sotto ogni DONG.
- c_throw: un ringhio e il «vvv-vvv» della catena che gira.
- c_vent: un «Hhhh» d'inspiro col fischio della caldaia che sale.
- c_spin: un urlo lungo.
- die: un lamento che si spegne in un sibilo di vapore.
- win (se cadi): «ho… ho… ho» lento e tre tintinnii d'incudine.

Il «ciuff» dei camini a ogni passo, un soffio corto, è il cuore della sua camminata.

Personalità:
- Quando ti colpisce fa 'taunt' (1,2 s), solo durante la camminata e mai tra due colpi, poi riparte a camminare un po' prima della mossa dopo.
- Se gli stai lontano (oltre 280 px per 6 s) brontola e batte due volte il maglio a terra: toc toc.
- Se lo colpisci forte, dal portello esce una nuvoletta nera e lui grugnisce.
- Se cadi: 'win' e la presa in giro.
- Non si parla sopra: 2,4 s prima di un lamento, 1,2 s prima del verso di una mossa.
- Le voci si preparano nelle stanze della sua arena con B3VO.prep('smith').

10 · COSA TENERE E COSA TOGLIERE DEL BOSS DI OGGI
Restano:
- la stanza della Forgia Infernale (zona 'fabbro'): cerchio di rune 'fabbro', 8 crepe di lava, 4 grate, e le 4 incudini agli angoli di bossLayout, che diventano ripari;
- la musica del boss (76-musiche-boss.js, 'fabbro' con l'incudine);
- nome, titolo, vita, oro e il traguardo «Cuore di vulcano».

Si tolgono:
- i diavoletti (niente servitori);
- la pioggia di meteore, che ora è della Fenice e combatte nella stessa stanza;
- la martellata vecchia con le 3–5 linee e l'onda su tutta la stanza;
- le incudini vecchie (G.boulders);
- l'entrata dalla colonna di fuoco;
- la morte vecchia a piastre (BDIE.smith);
- gli effetti 2D di B2.smith;
- l'anello di sfere rosa di bossExtra.

Facoltativo: aggiornare la riga della guida (44-guida.js) dal file del cervello con «Boss. Il maglio rovente apre la terra, le incudini cadono dal cielo, la catena arriva lontano. Quando la fornace sfiata, colpiscila.»

Il Fabbro nuovo vale anche nell'Abisso e nella sfida del giorno (stesso tipo), come il Golem.

11 · REGISTRO, MODELLO FINTO, PROVE
- BCL.smith:
  - n: 'Il Fabbro Infernale', arena: 5, p2: true;
  - enter(): G.arena=5; G.chapter=ARENAS[5].ch; G.diff=ARENAS[5].diff; G.bossLvl=null; G.room=ROOMS; G.event=null; buildRoom();
  - moves: ['slam','stuck','anvil','swing','hold','yank','vent','open'];
  - moves2: ['rage','spinup','spin','dizzy','vent2'];
  - hz(): conta cerchi, incudini in volo, incudini a terra, crepe, corsie, maglio (in volo o piantato), disco e zone di fuoco;
  - voice: ['cry','laugh','angry','die'].
- Modello finto anteprime/boss2/smith_stub.js: il Fabbro di oggi (mosse idle, walk, slam, forge, hit) recita le mosse nuove.
  - Corrispondenze: stuck→idle, anvil→forge, swing→slam, hold→idle, yank→walk, vent→forge, vent2→forge, open→hit, spinup→slam, spin→walk, dizzy→hit, rage→hit, taunt→idle, enter→idle, die→hit.
  - Usa le durate del modello nuovo e ha un N3.smithHand finto ({h:[8,−40], m:[14,−30]}).
  - Senza i disegni esportati, il cervello usa disegni semplici suoi (come g2art nel Golem).
- Prove: python3 anteprime/mk_boss2.py smith --test && node tests/boss2gioco.js smith. Difficoltà: node tests/boss2diff.js smith.

12 · DIFFICOLTÀ
- Oggi, con l'eroe fermo, si perdono circa 32 vite al minuto. Le cause: il contatto (26 × 1,95 ogni 0,7 s), fino a 4 diavoletti, l'anello rosa e la martellata con tre pericoli insieme.
- Il nuovo si ferma a 80 px, non ha servitori né anello e mette un pericolo alla volta.
- Stima con l'eroe fermo che tira (il caso peggiore):
  - fase 1: un giro di circa 14 s veri fa circa 100 di danno base (Martellata 22+12, Incudine 18, Lancio 20+12, Sfiatata 16), cioè circa 6 vite al minuto;
  - fase 2: circa 170 in 16 s (col Turbine a 3 × 18), cioè 8–9 vite al minuto.
- L'obiettivo è 7–11 vite al minuto nel caso peggiore: va misurato con boss2diff.
- Manopole da girare, in quest'ordine: le camminate tra le mosse, il danno di incudini e lancio, i giri del Turbine (da 3 a 2).

## Voti del direttore artistico

«GIGANTE» 8,4/10: vince ed è la base. È il più «fabbro» e il più lontano dal Golem: un gigante vivo, non una statua di pietra. La sagoma si legge (camino–cappuccio–camino, il cerchio acceso del portello, il blocco del maglio). Tiene quello che i bambini già conoscono del Fabbro di oggi, cioè il cappuccio buio con gli occhi accesi e la criniera di fuoco della fase 2, e lo rende enorme. Bronzo caldo, ghisa fredda e cuoio rosso staccano bene dal pavimento grigio viola della Forgia. Il calore come avviso (arancio = caldo, bianco = adesso) è il segnale più bello e più leggibile delle tre proposte, e la fase 2 cambia davvero faccia.
Difetti: l'Eruzione dei camini ripete le Incudini (cerchi dove cade qualcosa) e somiglia alla Pioggia di braci della Fenice, che combatte nella stessa stanza. Il Martello incastrato col +50% è lo schema del Golem (Schianto più Pugni incastrati). Anche l'entrata, una statua in ginocchio che si risveglia, è quella del Golem. La caduta in avanti come una torre è rischiosa: scheletro girato di 90° e ingombro vicino ai muri.

«AUTOMA» 7,7/10: ha le idee di gioco più pulite.
- Le tre spie della pressione contano le mosse fino allo Sfiato, poi la caldaia resta aperta: un punto debole col suo ritmo, diverso dal Golem.
- La luce della fornace illumina il viso da sotto.
- Avverte che gli avvisi vanno divisi anche per la velocità dell'arena.
- La Colata è una bella mossa e non somiglia alla Fenice.
Però una caldaia a pentola su gambe corte, col comignolo a cilindro sulla testa, rischia di sembrare una teiera buffa più che un gigante che fa paura. Manometro, spie, ingranaggi e ribattini a 117 px diventano rumore. È un secondo costrutto che «si accende», dopo la statua che si risveglia del Golem.

«DEMONE» 7,4/10: il più temibile a vedersi (corna da toro, maschera a griglia, corona a quattro punte) e con le due idee più belle di tutto il lavoro.
- L'entrata «Al lavoro»: lui è già lì, di spalle, che batte il ferro. L'hai disturbato.
- Il Maglio alla catena: l'unica minaccia a media distanza, che si legge in due tempi (prima il cerchio, poi la linea).
Però un demone rosso a petto nudo, con corna e catene da prigioniero, porta la Classica verso l'inferno e l'horror. Pelle rossa e vene di lava rischiano di leggersi come ferite. Perde il cappuccio che i bambini conoscono. È il più difficile da costruire: corna e camini che si intrecciano, maschera che si strappa, catena e maglio in mano al gioco. Ha anche una mossa riempitivo, lo Sbuffo di scintille.

COSA ENTRA DALLE ALTRE DUE
- Dal «demone»:
  - l'entrata «Al lavoro», con l'incudine da lavoro che resta nella stanza come primo riparo;
  - il Lancio del maglio alla catena, con la catena avvolta tre volte sull'avambraccio destro che si srotola e si riavvolge;
  - le incudini della stanza che suonano e sobbalzano ai colpi;
  - la runa del maglio impressa a fuoco nel cratere;
  - la sconfitta in ginocchio, appoggiato al maglio piantato.
- Dall'«automa»:
  - la pressione che sale di una mossa alla volta, mostrata sulle feritoie delle costole, fino alla Sfiatata;
  - la fornace aperta dopo la Sfiatata come finestra di colpo;
  - la luce della fornace sul viso e sul pavimento;
  - la nebbia di vapore dopo lo Sfiato;
  - la regola dei tempi veri.

COSA CAMBIO DEL «GIGANTE»
- Tolta l'Eruzione: al suo posto il Lancio del maglio.
- Il +50% passa dal Martello incastrato alla Fornace aperta e alla Barcolla, con una regola sola: portello aperto = colpiscilo.
- Le feritoie vanno sui fianchi davanti, ai lati del portello, così la pressione si legge anche di fronte.
- Niente caduta a torre nella sconfitta: resta una statua fredda in ginocchio sul maglio.
- Entrata «Al lavoro» al posto della statua che si risveglia.
