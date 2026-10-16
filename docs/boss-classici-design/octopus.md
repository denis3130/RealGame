# La Piovra della Palude: il design finale

(Deciso dal direttore artistico tra tre proposte, 16 ottobre. Tipo nel gioco: `octopus`; modello `sprite/nemici3d/octopus2.js`.)

## Il design

LA PIOVRA DELLA PALUDE · «la Signora dello Stagno» · DESIGN FINALE

Nel gioco restano il nome e il titolo: «La Piovra della Palude», «Signora dello stagno maledetto» (tipo 'octopus', arena 11 «Palude Maledetta»).
- Modello: 'octopus2' in sprite/nemici3d/octopus2.js, con reg('octopus2',{n:'La Piovra della Palude',g:'boss',sc:1,an,dur,lab}). Nel gioco prende il nome 'octopus'; il disegno di oggi resta come N3.meta.octopus2.old per la pagina «prima e dopo».
- Metodo: quello dello spaventapasseri (scheletro 3D proiettato con V(face), ordine di disegno dalla posa di riposo, pezzi con una telecamera loro con Vat). Dipinta come la lanterna.
- Ogni mossa dipende solo da p; idle, walk e swim si chiudono su se stesse.
- Mosse: an = ['idle','walk','hit','slam','stuck','slam2','ink','cage','whirl','sink','swim','rise','tide','rage','taunt','enter','die'].
- Durate: dur = {idle:3, walk:1.2, hit:.6, slam:1.8, stuck:1.4, slam2:2.6, ink:1.6, cage:2.2, whirl:2.8, sink:.9, swim:.8, rise:1.6, tide:3.2, rage:2.8, taunt:1.1, enter:3.4, die:4}.

1 · IDEA
È una piovra antica e gigantesca, color petrolio. Siede dritta nella sua pozza come su un trono: è la Signora dello stagno maledetto.

Sul mantello porta la corona dello stagno: un cerchio di giunco intrecciato con le chiocciole di palude, una cozza di fiume aperta a ventaglio che tiene la Perla dello Stagno, e il fiore rosa di ninfea della Piovra di oggi appuntato come una spilla. Ha due grandi occhi d'ambra con la pupilla a barra, sotto palpebre pesanti e arcate a V: guarda dall'alto, sdegnosa.

Ha otto braccia possenti:
- due posate davanti, come mani impazienti che tamburellano sull'acqua;
- due stese di lato;
- due alzate a S, come cobra;
- due che salgono dietro di lei e si arricciano in fuori, come lo schienale di un trono.

Fa timore perché arriva dappertutto:
- un braccio lungo mezza stanza si abbatte su di te;
- altre braccia sbucano dal pavimento tutto intorno;
- il gorgo ti tira verso di lei;
- sparisce e ti viene dietro con la corona che taglia l'acqua come una pinna;
- nella fase 2 un'onda nera copre la stanza.

È figa per due motivi. Da lontano si legge come la regina degli scacchi fatta di tentacoli. E ha un segnale suo, che il giocatore impara a guardare: la Perla lampeggia e la luce corre nelle ventose del braccio che sta per colpire, come la luce del cuore del Golem nelle sue vene.

A metà vita si alza in piedi sulle braccia, accende anelli magenta su tutta la pelle (come i polpi veri quando avvisano), la corona si accende da dentro e la pozza diventa inchiostro.

Resta della Classica: forme tonde e piene, colori ricchi, occhi con la lucina, il becco con le sue due punte come uniche zannette, niente sangue né ferite. È superba e dispettosa, mai buffa.

2 · MISURE E SAGOMA (sc 1; l'Arciere 3D è alto circa 37)
- È alta 116 in cima alle volute del trono, 103 in punta alle chiocciole della corona, 100 in cima al mantello (oggi circa 70): tre volte l'eroe, come il Golem.
- Gli occhi sono a z 40: guarda l'eroe dall'alto.
- È larga 150 con le braccia stese sull'acqua e 124 tra le punte dei cobra. La pozza sotto di lei misura 124×112.
- Nella fase 2 sta 12 più alta sulle braccia: 128 in cima.
- Nel gioco: raggio 34 (oggi 30); barra e alone B2H 100 (oggi 58).

Come si legge da lontano, dal basso verso l'alto:
- una base larga: la pozza, la gonna e le braccia stese;
- la testa larga con i due occhi d'ambra;
- il mantello alto a goccia, piegato indietro, con la corona intorno;
- i due cobra ai lati, all'altezza delle spalle;
- le due volute del trono, dietro e sopra la corona.

Ha tre luci a triangolo, come il Golem: i due occhi in basso e la Perla sopra, al centro della corona.

Sul telefono conta prima la sagoma, poi le tre luci, poi le ventose accese. Gli anelli spenti, le arcate e l'intreccio del giunco restano leggeri. Va guardata sempre anche piccola, a sc 1.

3 · PEZZI NELLA POSA DI RIPOSO
(x avanti, y verso la sua sinistra, z su; gli angoli intorno al corpo partono da 0 davanti e sono positivi verso la sua sinistra)

POZZA
Disco a z 0, raggi 62×56 (pool0): acqua scura con la schiuma sul bordo e tre anelli che partono dal corpo. Sotto di lei si vede il riflesso della Perla. Con o.noWater il disco non c'è, ma gli anelli restano.

GONNA
È la membrana tra le basi delle braccia, stesa sull'acqua come lo strascico di un vestito.
- Solido di rivoluzione centrato in [2,0,0], con il profilo (z, raggio) [0,46] [6,40] [14,32] [22,24].
- L'orlo sull'acqua fa 8 smerli bassi, uno tra ogni coppia di braccia (raggio 46 sulle braccia, 42 tra l'una e l'altra).
- Ha lo stesso colore della pelle; solo il bordo è un filo più chiaro. Mai una fascia chiara: sembrerebbe un pannolino.

TESTA
Ellissoide in [9,0,34], raggi [22,26,16]: larga e schiacciata.

MANTELLO
Ellissoide in [−6,0,64], raggi [26,28,36], piegato indietro di 0,18 rad: la cima arriva a z 100, verso x −12. Dove si attacca alla testa c'è una piega di pelle: una riga scura con un filo di luce sotto, a z 46–48 davanti.

OCCHI
Sulla testa, in direzione [0,824, ±0,472, 0,315] (azimut ±0,52, elevazione 0,32). I centri stanno a x 27, y ±12, z 39; rx 8,6, ry 7,6.

ARCATE
- Sopra ogni occhio c'è una piega di pelle a capsula, spessa 2,6–3,2. Va dall'interno (azimut ±0,24) all'esterno (azimut ±0,80), 2 px sopra il bordo alto dell'occhio.
- La punta interna sta 2 px più in basso di quella esterna: una V cattiva.
- All'estremità esterna c'è una puntina tonda di 3, curva in su e indietro (la papilla dei polpi veri).
- L'arcata lontana si disegna prima della testa e rientra dietro il suo bordo, mai sopra l'occhio (la lezione del sopracciglio del Golem).

BOCCA
Sulla testa, in direzione [0,92, 0, −0,38] (x 29, z 28), larga 9.

SIFONE
Un tubo corto sul lato sinistro della testa: parte dalla base [−2,24,28] e va verso [−0,2, 0,9, −0,3]. È lungo 8, con raggio da 3,6 a 3 e la bocca scura. Respira col fiato e si gira verso l'eroe nell'Inchiostro e nella presa in giro.

CORONA DELLO STAGNO
Niente oro, metallo né punte regolari: è storta e viva.
- Il cerchio: giunco intrecciato spesso 3, a due toni, con le righe oblique dell'intreccio e un nodo dietro. Appoggia sul mantello a z 84 davanti e 90 dietro (punti con ellAt sul mantello piegato, normali con ellN).
- Sopra il cerchio, per angolo intorno al mantello:
  - 0°: la cozza di fiume aperta a ventaglio, alta 15 e larga 16, con le valve in su (fuori scura con le righe di crescita, dentro madreperla). Alla base tiene la Perla dello Stagno (raggio 5,5).
  - ±45°: due chiocciole di palude (limnee, conchiglie a spirale alte e appuntite), alte 17, base raggio 5, piegate in fuori di 15°. Sono le punte più alte della corona.
  - ±115°: due limnee alte 13, base raggio 4.
  - 180°: una limnea alta 11, base raggio 3,5.
  - +80°, sulla sinistra e appena sotto il cerchio: il fiore rosa di ninfea della Piovra di oggi, raggio 7, come una spilla.
  - ±95°: due ciuffi d'alga (nastri lunghi 18, a due toni) che pendono dal cerchio e dondolano come molle, con una telecamera loro (Vat), come il corvo dello spaventapasseri.

OTTO BRACCIA
Ogni braccio è una catena di 10 punti (chain, shadeLimb), con raggio 10,5 alla base e 2 in punta, attaccata alla gonna a raggio 28 e z 6. Il dorso è color pelle; il ventre è corallo, con due file di ventose sul lato di sotto (sul lato di dentro per le braccia alzate).
- Le mani (±0,42): base [26,±11,4], distese in avanti sull'acqua fino a [70,±34,3]. L'ultimo quarto è arrotolato a spirale verso l'interno (punte a [62,±26,6]). Lunghe circa 70.
- Di lato (±1,25): base [11,±26,4], stese a S sull'acqua fino a [20,±72,8]; la punta si alza e si arriccia in su. Lunghe circa 70.
- I cobra (±2,0): base [−14,±25,6]; salgono a S verso fuori fino a z 58, con la punta arricciata in fuori a [−20,±62,60]. Lunghi circa 90.
- Il trono (±2,7): base [−26,±13,6], raggio alla base 9,5. Salgono dietro il mantello, a 10 dalla sua superficie senza toccarlo, fino a z 104. Poi si arrotolano in fuori (1,6 mezzi giri nell'ultimo 30%): le volute stanno intorno a [−30,±34,110]. Lunghi circa 130. Il ventre corallo delle volute, con le ventose, guarda avanti: vista da davanti, incornicia la corona.

FASE 2 (o.p2): POSA DI RIPOSO NUOVA
Come un ragno pronto a scattare:
- il corpo sale di 12; la gonna si solleva e mostra le basi delle braccia con le ventose;
- il primo terzo di ogni braccio scende all'acqua come una gamba piegata;
- i cobra sono più aperti (punte a [−18,±72,66]);
- le mani vanno più avanti (punte a x 76);
- la pozza è d'inchiostro.

4 · LE QUATTRO DIREZIONI
DAVANTI
- La base larga, con le mani posate e le braccia di lato.
- La testa con gli occhi d'ambra sotto le palpebre pesanti e le arcate a V.
- Il mantello alto dietro la testa.
- La corona: la cozza con la Perla al centro, le limnee ai lati, il fiore a sinistra.
- I cobra ai due lati, all'altezza delle spalle.
- Le volute del trono, color corallo con le ventose, che spuntano sopra e ai lati della corona.

TRE QUARTI
- Il mantello piegato indietro e la corona di sbieco.
- Il sifone, se si guarda dal lato sinistro.
- Un cobra davanti al fianco del mantello e l'altro dietro.
- Una voluta del trono che si vede intera.

LATO
- Il profilo a goccia piegata indietro.
- La testa avanti, con un occhio solo.
- Le mani che arrivano lontano sull'acqua.
- Il braccio del trono, a S, dietro.
- La corona di profilo, con le limnee in piedi.

DIETRO
- Il dorso del mantello con gli anelli.
- La limnea di dietro e il nodo del giunco.
- Le due braccia del trono, vicinissime alla telecamera, che incorniciano tutto.
- I cobra ai lati.

Ogni pezzo parte da un punto del corpo, quindi niente si stacca girando.

5 · COLORI (luce / base / ombra)
Il pavimento della Palude Maledetta è viola-bruno scuro: petrolio, corallo, madreperla e ambra si staccano bene. Niente oro (è del Re Rospo), niente ghiaccio (della Regina), niente verde a squame (dell'Idra).

FASE 1
- Pelle (mantello, testa, dorso delle braccia, gonna): #58bdb0 / #1d8080 / #0c4552. Bordo illuminato caldo #dffbea (rim 0,3), riflesso bagnato #f2fffb, orlo della gonna #2e9a92.
- Anelli spenti: contorno #0a3640, centro #74cfc0.
- Nuvola che passa sul mantello: #0f5a62 al 35%.
- Ventre delle braccia e ventose: #ffd0b8 / #ec967e / #a95c5c.
- Centro della ventosa: spenta #fde6d6; accesa #8ffbe9, con alone 140,250,232 (il verde acqua delle rune della stanza, RUNEC.piovra).
- Occhi: iride #ffd889 / #ff9f2e / #b3550f, cerchio intorno #0b3f4a, pupilla #160b06, lucina #ffffff, alone 255,170,70.
- Palpebre: #145a62, con la riga #0b2e36.
- Bocca #2b1020; becco #f6ebd3 / #b8a27a; bocca del sifone #0b2e36.
- Giunco: #7a6440 / #4e3e24 / #2a2012.
- Limnee: #fff2e2 / #e8c9b4 / #a9806e, con le fasce della spirale #8a5a46 e un filo iridescente #cfe9ff sul bordo illuminato.
- Cozza: fuori #5a5236 / #3a3424 / #211d14; dentro madreperla #fff4ec / #e9d6e6 / #b7a2c0, con il bordo #cfe9ff.
- Perla: #f6ffff, alone 190,255,240.
- Fiore di ninfea: #ff9ad8 / #e05aa8, cuore #ffd84a (come oggi).
- Alghe: #78a043 / #3e6a28.
- Pozza: #173f44, riflesso #3d8f8a, schiuma rgba(205,245,235,.6).

FASE 2 (più cupa e fredda, con gli avvisi accesi)
- Pelle: #45aebd / #1d6a80 / #0b3448, bordo freddo #c8f6ff.
- Anelli accesi: #ff4fcf, centro #ffd1f3, alone 255,80,210. Pulsano a ondate, dalla testa alle punte, ogni 1,6 s.
- Ventose accese: #ff7ae0, alone 255,122,224 (il magenta delle rune nella fase 2).
- Occhi: #ffb3c6 / #ff3d78 / #8f0f3d, con la pupilla più sottile.
- Corona: la bocca di ogni limnea brilla da dentro (255,110,215) come una lanterna; il fiore si apre del tutto (#ff7ad0 / #c83a98) con l'alone; la Perla ha l'alone 255,120,220.
- Pozza d'inchiostro: #1d1330, con riflessi 255,90,220 e 120,230,210 (come le pozze d'inchiostro di oggi).

SCONFITTA
La pelle va verso #c9c2d2 (grigio-lilla), gli anelli verso #9a93a8.

6 · FACCIA
OCCHI
- Sono d'ambra e brillano (alone morbido, 'lighter'). Non hanno il bianco: l'iride riempie l'occhio dentro un cerchio scuro sottile.
- Lucina bianca in alto a sinistra e una più piccola in basso a destra.
- La pupilla è una barra orizzontale con le punte tonde, una pillola larga 0,75 rx e alta 0,32 ry. Mai una fessura sottile da capra. Quando prende la mira si stringe a 0,2 ry, quando ride si allarga a 0,55, quando ha paura (nella sconfitta) diventa tonda. È diversa dalla fessura verticale dell'Idra.
- Gli occhi stanno sempre sulla superficie della testa, mai sul contorno; viste di lato, hanno 0,3 di spinta verso la telecamera.

PALPEBRE
Le palpebre si fanno col ritaglio nell'ovale, come oggi, e sono pesanti. A riposo quella di sopra copre un terzo dell'occhio ed è inclinata verso il centro: scende di più verso il naso, e lo sguardo diventa sdegnoso e cattivo. Quella di sotto è un poco alzata. Batte gli occhi lentamente.

ARCATE
Le arcate a V, con la loro puntina, si alzano quando ride o prende in giro e si abbassano quando prende la mira.

BOCCA
- A riposo è piccola e all'ingiù, sdegnosa: una riga scura con gli angoli giù e un'ombra sotto.
- Aperta (ruggito, risata, furia, colpi) è un ovale scuro col becco: la punta di sopra e quella di sotto sono color avorio, e sono le sue due zannette.
- Mai altri denti, niente guance rosa.

7 · IL SEGNALE: LA PERLA DELLO STAGNO
È il suo cuore di runa. Batte piano col respiro: la luce sale e scende.

Prima di ogni mossa manda un lampo morbido: un gradiente, mai un disco pieno, al massimo 4 lampi al secondo. Il lampo ha un alone che sale sopra la corona e si vede anche da dietro. Poi la sua luce corre dove sta per colpire:
- Tentacolata: nelle ventose della mano che si alza, una per una dalla base alla punta, con una perla di luce in testa (come nella vena del Golem).
- Inchiostro: giù lungo il lato sinistro della testa fino al sifone, che si accende.
- Gabbia: nelle quattro braccia che si tuffano nella pozza. La luce va sotto terra, poi ribollono i cerchi rossi.
- Gorgo: in tutte le ventose, a spirale.
- Agguato: negli occhi, che si accendono sotto il pelo dell'acqua.
- Marea Nera: in tutta la corona e in tutti gli anelli.

La luce è verde acqua nella fase 1 e magenta nella fase 2. Con LOWFX niente bagliori, ma le ventose cambiano colore lo stesso: è un avviso di gioco.

8 · PITTURA E DETTAGLI
- Si dipinge come la lanterna: tre toni su ogni pezzo, bordo illuminato caldo in alto a sinistra (freddo nella fase 2), glowTop sul mantello (un riflesso bagnato bianco e morbido in cima), contorno scuro spesso (2,6–2,8 sui pezzi grandi, 1,6 sui piccoli).
- Pelle bagnata e lucida: qualche verruca chiara in cima al mantello, la piega tra mantello e testa, e la nuvola più scura che passa sul mantello quando sta ferma.
- Anelli:
  - 9 sul mantello (raggio 3,5–5,5), sparsi come una costellazione;
  - 3 sulla testa, mai tra gli occhi;
  - 2 sul dorso di ogni braccio alzato (cobra e trono).
  Si disegnano solo quelli girati verso di noi. Mai file di palline chiare.
- Ventose: due file sul ventre corallo, al massimo 8 per fila, con raggio da 2,8 a 1,2 verso la punta, bordo chiaro e centro che si accende. Si disegnano solo quelle girate verso di noi.
- Limnee: un cono a spirale (revo, in un sistema locale sul mantello) con le fasce marroni (surfLine) e la bocca scura in basso, verso fuori. Sono di madreperla, con il filo azzurro sul bordo illuminato.
- Cozza: due valve a ventaglio (leaf a due facce), fuori scure con le righe di crescita, dentro madreperla.
- Giunco con l'intreccio (righe oblique alterne) e il nodo dietro.
- Gocce: ogni tanto dalle punte alzate cade una goccia nella pozza, con un anellino.
- Pozza: schiuma sul bordo, anelli che partono dal corpo, il riflesso della Perla, qualche bollicina (l'aura di oggi resta).

9 · FERMA, SCIVOLA, COLPITA
FERMA (idle, 3 s, si chiude su se stessa)
- Respira lenta e profonda: il mantello si gonfia del 3% e si sgonfia, la Perla pulsa col respiro e il sifone sbuffa due bolle quando lei espira (0,75). Un'onda gira intorno agli smerli della gonna, un giro per ciclo.
- Le mani tamburellano sull'acqua, impazienti come le nocche del Golem: la destra a 0,10 e 0,18, la sinistra a 0,55 e 0,63. A ogni colpo la punta si alza di 5 e batte, con un anellino.
- I cobra ondeggiano lenti a S (±6°, sfasati); le volute del trono si arrotolano e si srotolano appena.
- La parte di sopra (testa, mantello, corona) guarda piano di qua e di là (±0,12), sempre con le palpebre pesanti, e torna davanti a 0 e a 0,5.
- Batte gli occhi lentamente a 0,45: giù in 0,1, ferma 0,05, su in 0,1.
- Tra 0,60 e 0,90 una nuvola più scura scende sul mantello (i polpi veri cambiano colore).
- Le alghe dondolano. A 0,30 dalla punta di un cobra cade una goccia nella pozza.

SCIVOLA (walk, 1,2 s, si chiude su se stessa)
- Scivola insieme alla sua pozza. Le braccia stese fanno un'onda che gira intorno al corpo: ognuna si alza di 4 e spinge, sfasate di 1/8, come una piovra vera sul fondo.
- Il corpo si piega avanti di 0,10 e ondeggia su e giù di 2 (a 0,25 e a 0,75). Il mantello resta un poco indietro e poi recupera.
- Cobra e trono dondolano di ±4. Davanti alla pozza si apre un'onda a V.
- Va in qualunque direzione con la testa girata verso l'eroe: l'onda delle braccia non ha un davanti.
- Fase 2: è più alta e cammina sulle braccia-gambe, in due gruppi (a 0 e a 0,5), con la punta che si arriccia a terra. A ogni spinta gli anelli lampeggiano piano.

COLPITA (hit, 0,6 s)
Il mantello si schiaccia (−8%), gli occhi si stringono, le braccia sobbalzano e tornano (hitK). C'è per completezza: sui boss il gioco non la usa.

10 · LE MOSSE
(preparazione, colpo e ritorno; i numeri del gioco sono nelle abilità)

TENTACOLATA (slam, 1,8 s)
Opzioni:
- o.side: +1 è la mano alla sua sinistra, −1 quella alla sua destra;
- o.ang: la direzione del colpo rispetto a dove guarda (0 se manca);
- o.len: la lunghezza del colpo (165 se manca).

Preparazione (0–0,60):
- Da 0 a 0,06 gli occhi vanno sul bersaglio e la Perla lampeggia.
- Da 0,05 a 0,50 la mano scelta si alza alta (punta a z 85) e si arrotola all'indietro sopra il fianco come una frusta (2 mezzi giri).
- Tra 0,10 e 0,45 le sue ventose si accendono una per una dalla base alla punta, con la perla di luce in testa.
- Intanto il mantello va indietro (−0,12), la pupilla si stringe a 0,2, le arcate scendono, le altre braccia si allargano e premono sull'acqua. Dalla punta arrotolata cadono gocce.

Colpo (0,50–0,60):
- Il braccio si srotola di colpo e si abbatte disteso lungo o.ang: si posa sulla linea davanti, da 24 a o.len dal centro.
- Il mantello va avanti (+0,15), il becco si apre (0,6).
- Impatto a 0,60: schizzo d'acqua e fango lungo tutto il braccio.

Ritorno (0,60–1): il braccio resta a terra, pesante, con un rimbalzo a 0,66; il corpo resta piegato in avanti. La posa finale è quella da cui parte stuck.

VENTOSE ATTACCATE (stuck, 1,4 s)
Usa gli stessi o.side, o.ang e o.len della tentacolata che l'ha preceduta.
- 0–0,15: tira per staccare il braccio, che si tende e si gira un poco sul fianco; il mantello dondola indietro.
- 0,15–0,85: le ventose si staccano una a una, dalla punta alla base: otto «pop» a 0,20, 0,29, 0,38, 0,47, 0,56, 0,65, 0,74 e 0,83, ognuno con un anellino e una goccia. Il braccio si alza dalla punta un pezzo alla volta.
- Intanto il corpo resta piegato avanti, con la corona inclinata verso l'eroe e la Perla scoperta che trema (al massimo 4 volte al secondo): è il punto debole, in vista.
- 0,85–1: il braccio torna su arrotolandosi e lei si raddrizza. Finisce nella posa di riposo.

DOPPIA TENTACOLATA (slam2, 2,6 s, solo fase 2)
Opzioni:
- o.side: il primo braccio;
- o.a2: la direzione del secondo colpo rispetto a dove guarda (il gioco la dà da p 0,45);
- o.len e o.len2: le lunghezze dei due colpi.

Primo colpo:
- 0–0,06 lampo magenta della Perla.
- 0,04–0,38 la mano o.side si alza e si arrotola; le ventose si accendono dalla base alla punta tra 0,08 e 0,34.
- 0,38–0,45 si abbatte dritta: impatto a 0,45.
- 0,45–0,70 resta a terra; 0,70–0,95 torna a posto arrotolandosi.

Secondo colpo:
- 0,45–0,78 l'altra mano si alza e si arrotola (ventose accese tra 0,50 e 0,74); il corpo si gira di 0,5·o.a2 verso il nuovo bersaglio.
- 0,78–0,85 si abbatte lungo o.a2: impatto a 0,85.
- 0,85–1 resta a terra. La posa finale è quella di stuck, con o.side l'altra mano e o.ang = o.a2.

PIOGGIA D'INCHIOSTRO (ink, 1,6 s)
Opzione o.n: i colpi, 3 o 5 (se manca: 3, o 5 con o.p2).
- Preparazione (0–0,36): il mantello si gonfia come un pallone (+16%) e gli anelli si allargano; il sifone si gira verso l'eroe e si gonfia; tra 0,10 e 0,34 la luce della Perla scende fino al sifone, che si accende.
- Colpi: con 3 a 0,40, 0,47 e 0,54; con 5 a 0,36, 0,42, 0,48, 0,54 e 0,60. A ogni colpo il mantello si sgonfia di una tacca, il sifone sputa in alto uno sbuffo d'inchiostro con le goccioline e la testa dà un colpetto. Le palle in volo le disegna il gioco con N3.octopus2Blob.
- Ritorno (0,62–1): si sgonfia del tutto con uno sbuffo di bolle e torna dritta.

GABBIA DEGLI ABISSI (cage, 2,2 s)
- 0–0,25: si alza un poco (+4) e solleva quattro braccia (i cobra e quelle di lato) alte e aperte, come una mano. Le ventose si accendono dalla base alla punta (0,05–0,22).
- 0,25–0,38: le pianta nella sua pozza, ai fianchi, con uno schizzo (a 0,33). Le braccia spariscono sotto il pelo dell'acqua (tagliate alla linea dell'acqua) e la luce scende con loro.
- 0,38–0,85: resta china (in avanti di 0,1), con le basi delle braccia tese che entrano nell'acqua, gli occhi più accesi fissi sull'eroe e la pozza che gira piano. A 0,71 dà una spinta verso il basso (il corpo scende di 3): è il momento in cui le braccia sbucano lontano (nel gioco a p 0,715).
- 0,85–1: tira fuori le braccia gocciolanti e si raddrizza.

GORGO (whirl, 2,8 s)
- 0–0,15: stende tutte e otto le braccia piatte sull'acqua, a stella (quasi 200 da punta a punta); la gonna si apre; lampo della Perla.
- 0,15–0,85: gonna e braccia girano intorno al corpo per un giro e mezzo, prima lente, poi veloci, poi di nuovo lente (angolo TAU·1,5·ez((p−0,15)/0,7)).
  - Le braccia si piegano all'indietro come le pale di una girandola, le alghe della corona volano in fuori, la luce corre nelle ventose a spirale.
  - Testa, mantello e corona restano girati verso l'eroe, con una telecamera loro (come il cappello dello spaventapasseri): ti guarda mentre gira.
  - Sulla sua pozza girano correnti di schiuma a spirale, fino a raggio 70.
- 0,85–1: si ferma di colpo (scatto a 0,86), le braccia tornano a posto e la testa ondeggia un attimo.

SI IMMERGE (sink, 0,9 s)
- 0–0,20: prende fiato (il mantello si gonfia) e guarda l'eroe.
- 0,20–0,85: si avvolge nelle braccia come in un mantello, abbassa la corona e affonda nella pozza con un risucchio di bolle. A 0,70 è sotto del tutto; tutto si taglia al pelo dell'acqua, come oggi.
- 0,85–1: restano fuori solo le punte della corona; sotto l'acqua si accendono due luci d'ambra, gli occhi. Finisce nella posa di swim.

SOTT'ACQUA (swim, 0,8 s, si ripete)
- La pozza scivola. Fuori dall'acqua restano solo le punte delle chiocciole della corona, che tagliano l'acqua come una pinna, con l'onda a V verso dove guarda.
- Sotto il pelo dell'acqua due luci d'ambra (gli occhi) guardano avanti; salgono bolle.
- Pinna e occhi si disegnano come una cosa sola: su un livello, poi posati con l'alfa, così non si vedono contorni in trasparenza.
- L'ultimo fotogramma è uguale al primo.

AGGUATO (rise, 1,6 s)
Comincia da sott'acqua.
- 0–0,63: l'acqua ribolle in cerchio, la corona affonda, gli occhi salgono più accesi e la superficie si gonfia.
- 0,63: esplode fuori con tutte le braccia aperte verso l'alto, come un fiore, e il becco aperto, dentro una colonna d'acqua. È il colpo.
- 0,63–0,75: tiene il fiore.
- 0,75–0,90: le braccia ricadono sbattendo l'acqua intorno (lo schiaffo è a 0,80).
- 0,90–1: si assesta nella posa di riposo.

MAREA NERA (tide, 3,2 s, solo fase 2)
- 0–0,30: si alza in piedi sulle punte delle braccia (+20 sopra la posa della fase 2, con la gonna sollevata) e alza tutte le braccia sopra la testa, come una fontana. Anelli e corona divampano, la Perla brucia.
- 0,30–0,55: tira giù piano le braccia verso la pozza, respirando a fondo (il mantello si gonfia); l'acqua si alza intorno a lei (il bordo della pozza sale).
- 0,55: sbatte tutte le braccia sull'acqua insieme, con uno schizzo ad anello: parte l'onda, che la disegna il gioco.
- 0,55–0,80: tiene le braccia stese sull'acqua e spinge.
- 0,80–1: si riabbassa nella posa di riposo della fase 2.

11 · FASE 2: «LA PIOVRA SI INFURIA»
La mossa rage (2,8 s) parte a metà vita. Va sempre dai colori della fase 1 a quelli della fase 2, qualunque sia o.p2.
- 0–0,20: trema (al massimo 4 volte al secondo) e gli anelli tremolano.
- 0,20–0,50: si alza in piedi sulle otto braccia (+12); la gonna si solleva e mostra le basi delle braccia con le ventose.
- 0,50–0,70: butta indietro la testa. Intanto:
  - gli anelli si accendono di magenta, a ondata, dalla testa alle punte;
  - le conchiglie della corona si accendono da dentro e il fiore si apre del tutto;
  - la pozza diventa d'inchiostro, dal centro verso il bordo;
  - la pelle passa ai colori della fase 2.
- 0,70–0,85: ruggisce col becco aperto; le braccia frustano in alto e in fuori con uno spruzzo.
- 0,85–1: si assesta nella posa di riposo della fase 2.

Cosa cambia per sempre nell'aspetto:
- la pelle è più cupa e fredda;
- gli anelli magenta pulsano a ondate;
- gli occhi sono rosso-magenta, con la pupilla più sottile;
- la corona è accesa e la Perla è magenta;
- la pozza è d'inchiostro;
- sta 12 più alta, sulle braccia-gambe, con i cobra più aperti.

Cosa cambia nel combattimento:
- tutto va 1,2 volte più rapido, ma gli avvisi restano sopra 0,6 s veri;
- la Tentacolata diventa la Doppia tentacolata;
- la pioggia d'inchiostro cade a X;
- la Gabbia diventa la Gabbia d'inchiostro;
- il Gorgo finisce con la Risacca;
- l'Agguato si fa due volte;
- arriva la mossa nuova, la Marea Nera.

12 · ENTRATA (enter, 3,4 s; sempre coi colori della fase 1)
- 0–0,15: sul pavimento si allarga una pozza scura che ribolle.
- 0,15–0,30: sotto il pelo dell'acqua si aprono due occhi d'ambra che brillano; le punte della corona escono e girano piano, come una pinna.
- 0,30–0,40: la punta di una mano esce e batte tre volte sull'acqua, impaziente (a 0,31, 0,35 e 0,39: tic, tic, tic, con tre anellini).
- 0,40–0,66: si alza maestosa e lenta, con l'acqua che le cola a rivoli dal mantello e dalla corona. A 0,52 e a 0,60 le due braccia del trono si srotolano dietro di lei, una dopo l'altra, ognuna con uno schiocco bagnato. La gonna si stende sull'acqua.
- 0,66: la Perla si accende, con uno scintillio.
- 0,72–0,80: alza le due mani e le sbatte sull'acqua ai lati (impatto a 0,75): parte un anello di schizzi.
- 0,82–0,92: il ruggito, col becco aperto e le braccia alzate.
- 0,92–1: abbassa le palpebre e guarda l'eroe dall'alto, sdegnosa. Finisce nella posa di riposo.

13 · SCONFITTA (die, 4 s)
Il momento clou è a 0,55 (2,2 s). Parte dai colori della fase in cui si trova.
- 0–0,15: trema (al massimo 4 volte al secondo). Gli occhi si spalancano: niente più palpebre pesanti, la pupilla diventa tonda. La Perla tremola.
- 0,15–0,40: la luce si ritira. Gli anelli si spengono dalle punte verso il corpo, poi la pelle impallidisce verso il grigio-lilla. I cobra e il trono perdono forza e ricadono piano in avanti sull'acqua.
- 0,40–0,60: affonda lenta girando di un quarto. Le braccia si arrotolano come molle e scivolano sotto per ultime. A 0,55, mentre va sotto, la corona le scivola via dal mantello e cade sull'acqua con un «plop»: è il clou.
- 0,55–0,80: sull'acqua si apre una nuvola d'inchiostro, che poi si schiarisce. Resta sulla sua pozza, mai sopra lo schermo.
- 0,80–1: sull'acqua calma galleggia solo la corona, col suo fiore. A 0,90 la Perla fa un ultimo bagliore e si spegne; a 0,95 sale un'ultima bolla. Nella fase 2, come ultima cosa, il fiore si riapre bianco (#fff6fa).

Niente ferite: è una regina che perde la corona.

14 · PRESA IN GIRO (taunt, 1,1 s)
- 0–0,30: un cobra sale alla corona e la raddrizza con un colpetto; la Perla fa un lampo (a 0,12).
- 0,30–0,70: la Piovra guarda l'eroe dall'alto, con le palpebre pesanti e le arcate alzate. Il sifone si gira verso di lui e gli soffia contro un filo di bolle, che finisce in una bolla grossa che scoppia (a 0,62). È uno sbuffo sdegnoso, più regale della pernacchia di oggi.
- 0,70–1: le mani tamburellano due volte (a 0,75 e 0,85) e lei si riassesta.

Con o.call (la chiamata, quando le stai lontano): tra 0,30 e 0,70 niente bolle. La testa è un po' piegata, le arcate alzate, e la punta del cobra si arriccia due volte verso di lei (a 0,38 e 0,56): «vieni».

15 · OPZIONI DEL MODELLO
- o.p2: la fase 2.
- o.side: +1 la mano alla sua sinistra, −1 quella alla sua destra.
- o.ang: la direzione del colpo in radianti, positiva verso la sua sinistra; 0 se manca.
- o.len, o.len2: la lunghezza dei colpi; 165 se manca. Il gioco la accorcia contro muri e ostacoli, mai sotto 60.
- o.a2: la direzione del secondo colpo di slam2.
- o.n: i colpi di ink, 3 o 5.
- o.call: la presa in giro che chiama.
- o.noWater: niente pozza, per i menu e le anteprime.
- o.noFx: niente particelle delle mosse (schizzi, gocce, bolle, sbuffi); le disegna il gioco.
- o.z: l'altezza dal pavimento, per coerenza con gli altri modelli (lei non salta).
- 'enter' ha sempre i colori della fase 1; 'rage' va sempre dalla fase 1 alla fase 2.

16 · DISEGNI DA ESPORTARE PER IL GIOCO
Hanno lo stesso aspetto della Piovra, come N3.golemFang per il Golem.

N3.octopus2Arm(x, y, k, a, sc, o): un suo braccio che sbuca dal pavimento, per la Gabbia.
- (x, y) è il punto a terra. a è l'angolo nella stanza verso cui frusta e verso cui guardano le ventose: il braccio si disegna con V(a).
- Le fasi di k, da 0 a 1:
  - 0–0,62 ribolle: una macchia scura e bagnata che cresce (raggio 14), 5 crepe, bolle che escono dalle fughe; il braccio non c'è ancora;
  - 0,62–0,68 sbuca rompendo la pietra (anello di schegge e schizzo) e sale tutto: alto 54, raggio 9 alla base e 2 in punta, con la punta arricciata;
  - 0,68–0,84 sta dritto e ondeggia appena, con le ventose accese verso a;
  - 0,84–0,90 frusta: si piega di 75° verso a;
  - 0,90–1 torna giù nel buco; resta l'anello di pietra rotta con l'acqua.
- Opzioni: o.p2 (ventose e anelli magenta); o.ink (esce da una pozza d'inchiostro: gocce scure e bordo viola); o.seed (per variare piega e ondeggio).

N3.octopus2Pad(x, y, k, sc, o): la ninfea della Marea Nera.
- Raggio 20, col fiore rosa (lo stesso della corona) e il bordo che brilla di un verde-oro chiaro (200,255,170). È il colore del «qui sei salvo», diverso dal rosso e dal magenta.
- Le fasi di k:
  - 0–0,12 spunta da una bolla, con uno schizzo;
  - 0,12–0,85 galleggia (su e giù di 1,5);
  - 0,85–1 affonda con le bolle.
- Opzioni: o.lift, da 0 a 1, è l'onda che la solleva (la ninfea sale di 6 e si piega di 0,15 verso o.wa, la direzione dell'onda); o.on vuol dire che l'eroe ci sta sopra (il bordo brilla di più).

N3.octopus2Blob(x, y, z, k, sc, o): la palla d'inchiostro in volo.
- Raggio 7, lucida, viola scura, col riflesso viola chiaro e un filo verde acqua.
- Rotola (giro k·TAU·1,5) e lascia due goccioline.
- o.p2 dà il riflesso magenta. L'ombra a terra la fa il gioco.

Il gioco disegna da sé l'onda della Marea, la Risacca, gli avvisi e le pozze d'inchiostro (G.zones, come oggi).

17 · ORDINE DI DISEGNO, LOWFX, COSTO
ORDINE DI DISEGNO
- La pozza si disegna prima di tutto. Poi le parti, con la profondità della posa di riposo e senza salti girando: nessun segno che cambia proprio a 90° o a 270°.
- Ogni braccio è diviso in tre pezzi (base, mezzo, punta), ognuno alla profondità del suo punto di mezzo.
- Un braccio che si alza sopra la testa (Tentacolata, Gabbia, Marea) va alla profondità e all'altezza della sua punta, come i pugni del Golem: niente sparisce dietro la propria spalla.
- Il trono sta dietro il mantello, tranne che vista da dietro, dove sta davanti. I cobra stanno dietro le spalle, le mani davanti alla gonna.
- Ogni pezzo della corona sta alla sua profondità sul mantello: quelli dalla parte lontana si disegnano prima del mantello. L'arcata, il sifone e le alghe lontani si disegnano prima della testa.
- Sott'acqua (sink, swim, rise, enter, die) si taglia al pelo dell'acqua come oggi (L0, L1, L2).
- Niente arti trasparenti, niente lampeggi oltre i 4 al secondo; i lampi sono luce morbida (gradiente).

LOWFX
Niente bagliori: Perla, ventose, anelli, conchiglie e alone degli occhi restano solo coi colori pieni, e le ventose dell'avviso cambiano colore lo stesso. Niente gocce, bolle o correnti di schiuma; le alghe stanno ferme.

COSTO
La mediana deve restare sotto 1,3 ms (il Golem è a 1,2).
- Ventose solo girate verso di noi, al massimo 48 per fotogramma: prima quelle del braccio che attacca, poi quelle delle braccia alzate.
- Anelli al massimo 20, solo girati verso di noi.
- Conchiglie, giunco e pozza calcolati una volta sola (Path2D).
- Bagliori in una passata sola.

## Le mosse del modello

| id | nome | secondi | descrizione |
|---|---|---|---|
| `idle` | Ferma | 3 | Seduta dritta e superba. Il mantello respira (+3%), la Perla pulsa col respiro e il sifone sbuffa due bolle a 0,75; un'onda gira intorno agli smerli della gonna. Le mani tamburellano: la destra a 0,10 e 0,18, la sinistra a 0,55 e 0,63 (la punta si alza di 5 e batte, con un anellino). I cobra ondeggiano a S (±6°) e le volute del trono respirano. La parte di sopra guarda piano di qua e di là (±0,12) e torna davanti a 0 e 0,5. Battito lento a 0,45; nuvola scura sul mantello da 0,60 a 0,90; a 0,30 una goccia cade da un cobra; le alghe dondolano. L'ultimo fotogramma è uguale al primo. |
| `walk` | Scivola | 1.2 | Scivola con la sua pozza. Le braccia stese fanno un'onda che gira intorno al corpo: ognuna si alza di 4 e spinge, sfasate di 1/8. Il corpo si piega avanti di 0,10 e va su e giù di 2 (a 0,25 e 0,75); il mantello resta un po' indietro e poi recupera; cobra e trono dondolano di ±4; davanti c'è un'onda a V. Va in ogni direzione con la testa girata verso l'eroe. Fase 2: più alta, sulle braccia-gambe in due gruppi (a 0 e 0,5) con la punta che si arriccia a terra; gli anelli lampeggiano piano a ogni spinta. Si chiude su se stessa. |
| `hit` | Colpita | 0.6 | Con hitK: il mantello si schiaccia (−8%), gli occhi si stringono, le braccia sobbalzano e tornano. C'è per completezza: sui boss il gioco non la usa. |
| `slam` | Tentacolata | 1.8 | Opzioni: o.side (+1 la mano sinistra, −1 la destra), o.ang (direzione del colpo, 0 se manca), o.len (165 se manca). 0–0,06: gli occhi vanno sul bersaglio e la Perla lampeggia, con un alone sopra la corona che si vede anche da dietro. 0,05–0,50: la mano si alza a z 85 e si arrotola indietro come una frusta; le ventose si accendono dalla base alla punta tra 0,10 e 0,45, con la perla di luce in testa; il mantello va indietro (−0,12), la pupilla si stringe a 0,2, le arcate scendono e le altre braccia premono sull'acqua. 0,50–0,60: si srotola e si abbatte lungo o.ang, da 24 a o.len; il mantello va avanti e il becco si apre. IMPATTO a 0,60, con lo schizzo lungo il braccio. 0,60–1: il braccio resta a terra (rimbalzo a 0,66). Finisce nella posa di stuck. |
| `stuck` | Ventose attaccate | 1.4 | Usa gli stessi o.side, o.ang e o.len della tentacolata prima. 0–0,15: tira; il braccio si tende e si gira sul fianco. 0,15–0,85: le ventose si staccano una a una dalla punta alla base, con un pop (anellino e goccia) a 0,20, 0,29, 0,38, 0,47, 0,56, 0,65, 0,74 e 0,83, e il braccio si alza dalla punta. Intanto il corpo resta piegato avanti, la corona inclinata verso l'eroe e la Perla scoperta che trema (al massimo 4 volte al secondo): il punto debole è in vista. 0,85–1: il braccio torna su arrotolandosi e lei si raddrizza. Finisce nella posa di riposo. |
| `slam2` | Doppia tentacolata | 2.6 | Solo fase 2. Opzioni: o.side (il primo braccio), o.a2 (la direzione del secondo colpo, che il gioco dà da p 0,45), o.len, o.len2. 0–0,06: lampo magenta. 0,04–0,38: la prima mano si alza e si arrotola (ventose da 0,08 a 0,34). 0,38–0,45: si abbatte dritta; IMPATTO 1 a 0,45. Il primo braccio resta a terra fino a 0,70 e torna su tra 0,70 e 0,95. 0,45–0,78: l'altra mano si alza e si arrotola (ventose da 0,50 a 0,74) e il corpo si gira di 0,5·o.a2. 0,78–0,85: si abbatte lungo o.a2; IMPATTO 2 a 0,85. 0,85–1: resta a terra. Finisce nella posa di stuck, con o.side l'altra mano e o.ang = o.a2. |
| `ink` | Pioggia d'inchiostro | 1.6 | Opzione o.n: 3 colpi (5 con o.p2). 0–0,36: il mantello si gonfia del 16% e gli anelli si allargano; il sifone si gira verso l'eroe e si gonfia; tra 0,10 e 0,34 la luce della Perla scende fino al sifone. Colpi a 0,40, 0,47 e 0,54 (con 5: 0,36, 0,42, 0,48, 0,54 e 0,60). A ogni colpo il mantello si sgonfia di una tacca, il sifone sputa uno sbuffo d'inchiostro con le goccioline e la testa dà un colpetto; le palle in volo le disegna il gioco. 0,62–1: si sgonfia con le bolle e torna dritta. |
| `cage` | Gabbia degli abissi | 2.2 | 0–0,25: si alza di 4 e solleva i cobra e le braccia di lato, alte e aperte; le ventose si accendono da 0,05 a 0,22. 0,25–0,38: le pianta nella pozza (schizzo a 0,33); le braccia sono tagliate al pelo dell'acqua e la luce scende con loro. 0,38–0,85: resta china, con le braccia tese nell'acqua, gli occhi accesi e fissi sull'eroe e la pozza che gira; a 0,71 dà una spinta in giù (nel gioco i tentacoli sbucano lontano a 0,715). 0,85–1: tira fuori le braccia gocciolanti e si raddrizza. |
| `whirl` | Gorgo | 2.8 | 0–0,15: tutte le braccia si stendono piatte, a stella (quasi 200 da punta a punta); la gonna si apre; lampo della Perla. 0,15–0,85: gonna e braccia fanno un giro e mezzo (angolo TAU·1,5·ez((p−0,15)/0,7)), con le braccia piegate indietro come pale, le alghe in fuori e la luce che corre a spirale nelle ventose. Testa, mantello e corona restano girati verso face, con una telecamera loro; sulla pozza girano correnti di schiuma. 0,85–1: si ferma di colpo (a 0,86), le braccia tornano a posto e la testa ondeggia. |
| `sink` | Si immerge | 0.9 | 0–0,20: prende fiato e guarda l'eroe. 0,20–0,85: si avvolge nelle braccia, abbassa la corona e affonda con un risucchio di bolle; a 0,70 è sotto del tutto (taglio al pelo dell'acqua). 0,85–1: restano fuori solo le punte della corona, e sotto l'acqua brillano due luci d'ambra. Finisce nella posa di swim. |
| `swim` | Sott'acqua | 0.8 | Si ripete. Fuori dall'acqua ci sono solo le punte delle chiocciole della corona, come una pinna, con l'onda a V verso face; sotto il pelo dell'acqua due occhi d'ambra; bolle. Pinna e occhi si disegnano come una cosa sola (un livello posato con l'alfa). L'ultimo fotogramma è uguale al primo. |
| `rise` | Agguato | 1.6 | Comincia da sott'acqua. 0–0,63: l'acqua ribolle in cerchio, la corona affonda, gli occhi salgono più accesi e la superficie si gonfia. 0,63: il COLPO, esplode fuori con le braccia aperte a fiore e il becco aperto, dentro una colonna d'acqua. 0,63–0,75: tiene il fiore. 0,75–0,90: le braccia ricadono sbattendo l'acqua (a 0,80). 0,90–1: si assesta nella posa di riposo. |
| `tide` | Marea Nera | 3.2 | Solo fase 2. 0–0,30: in piedi sulle punte (+20), con tutte le braccia alzate a fontana; anelli e corona divampano, la Perla brucia. 0,30–0,55: tira giù le braccia piano, respirando; il mantello si gonfia e il bordo della pozza sale. 0,55: sbatte tutte le braccia (schizzo ad anello) e parte l'onda, che la disegna il gioco. 0,55–0,80: le braccia stese spingono. 0,80–1: si riabbassa nella posa della fase 2. |
| `rage` | Furia | 2.8 | Va sempre dai colori della fase 1 a quelli della fase 2. 0–0,20: trema (al massimo 4 volte al secondo) e gli anelli tremolano. 0,20–0,50: si alza in piedi sulle otto braccia (+12); la gonna si solleva e mostra le basi con le ventose. 0,50–0,70: butta indietro la testa; gli anelli si accendono di magenta a ondata, dalla testa alle punte; le conchiglie si accendono da dentro, il fiore si apre, la pozza diventa d'inchiostro dal centro al bordo e la pelle passa alla fase 2. 0,70–0,85: ruggito col becco aperto, le braccia frustano in alto e in fuori con uno spruzzo. 0,85–1: si assesta nella posa della fase 2. |
| `taunt` | Presa in giro | 1.1 | 0–0,30: un cobra raddrizza la corona con un colpetto; lampo della Perla a 0,12. 0,30–0,70: guarda dall'alto con le palpebre pesanti e le arcate alzate; il sifone soffia un filo di bolle che finisce in una bolla grossa e scoppia a 0,62. 0,70–1: le mani tamburellano a 0,75 e 0,85 e lei si riassesta. Con o.call (la chiamata) niente bolle: la testa è un po' piegata e la punta del cobra si arriccia due volte verso di lei (a 0,38 e 0,56), «vieni». |
| `enter` | Entrata | 3.4 | Colori della fase 1. 0–0,15: la pozza scura si allarga e ribolle. 0,15–0,30: sotto l'acqua si aprono gli occhi d'ambra; le punte della corona escono e girano come una pinna. A 0,31, 0,35 e 0,39 la punta di una mano batte tre volte sull'acqua. 0,40–0,66: si alza lenta, con l'acqua che le cola a rivoli; a 0,52 e 0,60 le braccia del trono si srotolano con uno schiocco e la gonna si stende. 0,66: la Perla si accende. 0,72–0,80: sbatte le mani sull'acqua ai lati (impatto a 0,75). 0,82–0,92: ruggito. 0,92–1: abbassa le palpebre, sdegnosa, e finisce nella posa di riposo. |
| `die` | Sconfitta | 4 | Il clou è a 0,55 (2,2 s). 0–0,15: trema, gli occhi si spalancano con la pupilla tonda, la Perla tremola. 0,15–0,40: gli anelli si spengono dalle punte verso il corpo, la pelle impallidisce verso #c9c2d2, cobra e trono ricadono in avanti. 0,40–0,60: affonda girando di un quarto, con le braccia arrotolate come molle; a 0,55 la corona scivola via e cade sull'acqua (plop). 0,55–0,80: una nuvola d'inchiostro si apre sulla pozza e si schiarisce. 0,80–1: galleggia solo la corona col fiore; a 0,90 la Perla fa l'ultimo bagliore e si spegne, a 0,95 sale l'ultima bolla. Nella fase 2 il fiore si riapre bianco. |

## Le abilità nel gioco

PER CHI SCRIVE IL CERVELLO
Il file è src/js/89-piovra-nuova.js, fatto come 89-golem-nuovo.js. Si accende solo se c'è N3.octopus2.

0 · REGOLE
VELOCITÀ
- S è la velocità del boss: bossLvl().spd (1,34–1,37 nell'arena 11), per 1,2 nella fase 2. Nella fase 2 il cervello fa dt*=1,2, come il Golem fa 1,3.
- n3Move va avvolto. Per la Piovra la mossa e p vengono dal suo orologio: e.st e b3k(e), con 'swim' che si ripete e 'walk' con N3G.wp.octopus. Il motivo: n3Move di oggi moltiplica solo per bossLvl, e il disegno andrebbe fuori tempo rispetto ai colpi.
- Niente stato 'prep': la preparazione è dentro ogni mossa.

AVVISI
- Ogni finestra tra la comparsa di un avviso e il suo danno è di almeno 1,0 s del modello. Fanno 0,73 s veri nella fase 1 e 0,61 nella fase 2.
- Gli avvisi si consumano col dt vero: si creano con t = (pColpo − pOra)·durata/S.
- Sono rossi 229,72,77: cerchi che si riempiono, strisce, anelli tratteggiati, sei tacche come il Golem. Il verde acqua (fase 1) e il magenta (fase 2) solo come luce dentro gli avvisi.

TEMPI E VELOCITÀ «VERI»
I px/s e i secondi scritti «veri» (inseguimento, tiro, intervalli delle bolle, voli, camminata tra le mosse) sono del tempo del gioco: quando si usa il dt del boss vanno divisi per S. Le velocità di shootE sono quelle nominali (il gioco le alza per la stanza).

DANNI E CAMMINATA
- Danni sempre per DMG(). Niente danno con P.inv>0 o P.dashT>0.
- Mai due mosse insieme; restano solo le pozze d'inchiostro, che rallentano e non fanno danno.
- Camminata tra le mosse: 1,0–1,4 s veri (fase 2: 0,75–1,0). Sta a mezza distanza dall'eroe, 150–220 px, come oggi.
- Velocità della camminata, nel suo tempo: 52 px/s (circa 71 veri), 60 nella fase 2 (circa 100 veri).

NUMERI DEL BOSS E INCHIOSTRO
- ET.octopus: raggio 34 (oggi 30), hp 7000, cdmg 24 di contatto. Niente contatto mentre è sott'acqua (e.hidden, e.air).
- B2H.octopus: 100.
- Le pozze d'inchiostro sono G.zones con kind 'slime' e ink:true, come oggi. Al massimo 8 in tutto: la più vecchia si asciuga.
- Al massimo 8 pozzanghere nuove in tutto il combattimento (B.pud di 87).

1 · TENTACOLATA (slam 1,8 s, poi stuck 1,4 s)
PRIMA
L'àncora della camminata va messa a 120–170 px dall'eroe. Se all'inizio l'eroe è oltre 230 px, la Piovra gli scivola ancora incontro (al massimo 1 s in più).

MIRA (p 0)
- e.lf è l'angolo verso l'eroe; e.face = e.lf fino alla fine di stuck.
- o.side alterna (+1, −1…); o.ang è 0.
- reach è la distanza dal primo muro o ostacolo lungo e.lf (come g2reach); o.len = clamp(reach, 60, 165).

AVVISO (p 0,03)
Striscia rossa (b3wline) che parte a 24 px lungo e.lf: lunga min(240, reach), larga 42. t = 0,57·1,8/S, cioè 0,75 s veri.

COLPO (b3at a p 0,60)
- Chi è nella striscia tra 24 e o.len prende 24.
- Tra p 0,60 e 0,66 lo schizzo corre da o.len fino a min(240, reach): chi c'è quando passa il fronte prende 24. Una volta sola per tentacolata.
- Effetti: vfxBlast lungo il braccio, G.ripples alla punta, shake(6), sfx('splash',2), b3fx(e,'oslam',punta).

VENTOSE ATTACCATE (stuck, con gli stessi o.side, o.ang, o.len)
- La Piovra non si muove e i colpi le fanno +50% (hurtE avvolto, come i pugni incastrati del Golem).
- La prima volta compare la scritta «Colpo alla perla!» (#ffd84a).
- Il pop di ogni ventosa (sfx('bubble',0)) a p 0,20, 0,29, 0,38, 0,47, 0,56, 0,65, 0,74 e 0,83.
- A p 0,15, b3fx(e,'ostuck',…) lungo il braccio: nel pavimento restano le impronte delle ventose.

COME SI SCHIVA
Con un passo di lato (bastano 32 px) o stando dietro un ostacolo. Poi si colpisce forte.

2 · DOPPIA TENTACOLATA (slam2 2,6 s, poi stuck; solo fase 2, al posto della Tentacolata)
PRIMO COLPO
- p 0: e.lf verso l'eroe, o.side alterna.
- Striscia 1 come nella Tentacolata, con t = 0,42·2,6/S (0,67 s veri).
- p 0,45: chi c'è prende 22 (il braccio da 24 a o.len; lo schizzo fino a 240 tra p 0,45 e 0,49).

SECONDO COLPO
- p 0,45: o.a2 è l'angolo verso l'eroe in quel momento meno e.lf, limitato a ±1,1. Si calcolano reach2 lungo e.lf+o.a2 e o.len2.
- Striscia 2 con t = 0,40·2,6/S (0,63 s veri).
- p 0,85: chi c'è prende 22 (lo schizzo tra p 0,85 e 0,89).
- Alla punta del secondo braccio resta una pozza d'inchiostro: raggio 24, 4 s.

DOPO
Stuck con o.side l'altra mano, o.ang = o.a2, o.len = o.len2. Dura 1,4 s del modello, cioè 0,85 s veri.

3 · PIOGGIA D'INCHIOSTRO (ink 1,6 s)
e.face resta sull'eroe.

BERSAGLI (p 0,30)
Si fissano rispetto alla linea boss-eroe: u verso l'eroe, v di traverso. Tutti dentro la stanza, a 14 px dai muri.
- Fase 1, tre: uno sull'eroe e due a ±55 px lungo v. È una fila di traverso: si esce avanti o indietro.
- Fase 2, cinque: uno sull'eroe e quattro a 75 px sulle diagonali (u±v)/√2. È una X: si esce lungo u o lungo v.

AVVISO (p 0,30)
Un cerchio rosso di raggio 26 per ogni bersaglio, che si riempie fino al suo atterraggio. L'avviso dura in tutto circa 1,0 s veri.

LANCI
- Fase 1 a p 0,40, 0,47 e 0,54; fase 2 a p 0,36, 0,42, 0,48, 0,54 e 0,60. Prima il bersaglio al centro, poi quelli ai lati.
- Ogni palla parte dal sifone, cioè da b3pt(e,−2,28) alzato di 30, e vola 0,9 s veri ad arco alto 90, con l'ombra a terra che cresce.
- In volo si disegna con N3.octopus2Blob, al posto delle ellissi di b3air; se il disegno manca, le ellissi.

ATTERRAGGIO
- Chi è nel cerchio (raggio 26 + P.r·0,4) prende 14.
- Resta una pozza d'inchiostro di raggio 30 che rallenta per 4,5 s (5 nella fase 2).
- b3fx 'oink', sfx('splash',0).

COME SI SCHIVA
Uscendo dai cerchi.

4 · GABBIA DEGLI ABISSI (cage 2,2 s)
IL CENTRO (p 0,25)
Il centro C è dove sta l'eroe, spostato se serve per stare ad almeno 80 px dai muri.

I POSTI
- Otto posti su un cerchio di raggio 62 intorno a C, uno ogni 45°, girati a caso. I posti che cadono su un ostacolo si saltano.
- Il buco è un posto con due condizioni: il suo verso da C fa più di 90° con la direzione C-Piovra, e la strada da C fino a 110 px è libera da muri e ostacoli. Tra i posti buoni se ne sceglie uno a caso. Se nessuno va bene, il buco è il posto più lontano da lei, e si toglie anche un suo vicino.
- Ogni posto tranne il buco ha un cerchio rosso di raggio 18 col pavimento che ribolle (N3.octopus2Arm nella fase «ribolle»). Il buco non ha niente: pavimento pulito.
- Dentro c'è un disco rosso tratteggiato di raggio 46 che si riempie come un orologio fino a p 0,88.
- Il k di ogni posto è (p − 0,25)/0,75: così le fasi del disegno tornano coi colpi.

I TENTACOLI
- p 0,715: sbucano. La finestra è di 0,465·2,2 = 1,02 s del modello: 0,75 s veri, 0,62 nella fase 2. Chi è a meno di 18 + P.r da un posto prende 18 e viene spinto via da C di 30 px in 0,2 s. Da qui sono sbarre solide (ostacoli temporanei di raggio 14 in G.rocks, temp) fino a p 0,925.
- p 0,88: frustano verso C. Chi è a meno di 46 + P.r·0,5 da C prende 20.
- p 0,925: tornano giù e le sbarre spariscono. A ogni posto b3fx(e,'ocage',x,y).

FASE 2: GABBIA D'INCHIOSTRO
Anche ogni pozza d'inchiostro a meno di 170 px da C (al massimo 3, non sopra il cerchio) ribolle col suo cerchio rosso di raggio 18. A p 0,715 ne esce un tentacolo (o.ink): chi c'è sopra prende 18. Questi tentacoli non frustano, tornano giù a 0,925, e la pozza si consuma.

COME SI SCHIVA
- La Piovra sta ferma con le braccia nella pozza: si può colpire.
- Si esce dal buco: dal centro bastano 45 px verso il buco.
- Oppure si esce dalla gabbia prima che i tentacoli sbuchino: prima di p 0,715 i cerchi non fanno niente.

5 · GORGO (whirl 2,8 s)
e.face resta sempre sull'eroe: la testa lo guarda, e nel modello la gonna gira da sola.

AVVISO (p 0)
Un anello rosso tratteggiato di raggio 92 (fin dove arrivano le braccia), che si riempie fino a p 0,36. In più correnti di schiuma a spirale fino a raggio 220, che girano: non sono rosse e non fanno male.

DANNO (da p 0,36 a 0,85)
Chi è a meno di 92 + P.r·0,5 prende 16, al massimo una volta ogni 0,7 s veri.

TIRO (da p 0,15 a 0,85)
- L'eroe viene tirato verso di lei a 55·(1 − d/320) px/s veri (75 nella fase 2).
- Niente tiro se d > 320, se l'eroe sta scattando o se è già a contatto.
- L'eroe corre a 150: si allontana sempre.

BOLLE (da p 0,15 a 0,85)
- Due bracci a spirale (tre nella fase 2), che girano insieme alla gonna.
- Una bolla per braccio ogni 0,22 s veri, dalle punte delle braccia (raggio 40): shootE 'bubble', velocità 105, raggio 7, danno 11.

FASE 2: RISACCA
- p 0,50: compare un anello rosso tratteggiato fino a raggio 240.
- p 0,88: parte l'onda, G.waves {r:92, max:240, dmg:12, rgb '120,220,210'}. Va a 210 px/s e colpisce quando il fronte passa sull'eroe; lo scatto la evita.
- Dentro il raggio 92, dopo p 0,85, si è al sicuro.

EFFETTI
A p 0,15 b3fx(e,'owhirl') e sfx('bubble',2).

COME SI SCHIVA
Camminando via oltre 92 prima di p 0,36, e passando tra le bolle.

6 · AGGUATO DAL FONDO (sink 0,9 s, poi swim, poi rise 1,6 s)
SINK
- e.face sull'eroe.
- p 0,5: e.hidden = true ed e.air = 1. Non si può colpire, non fa danni di contatto e la mira automatica la ignora.
- b3fx(e,'osink').

SWIM
- La pozza insegue l'eroe a 120 px/s veri (135 nella fase 2), più piano di lui, per al massimo 1,4 s veri. Si ferma prima se arriva a meno di 20 px dall'eroe.
- e.face è la direzione in cui va, così pinna e onda a V puntano giusto.
- Dietro di lei bolle (G.fx 'bub', la metà con LOWFX).

RISE
- p 0: dove si è fermata compare un cerchio rosso di raggio 60 con sei tacche. t = 0,63·1,6/S: 0,74 s veri, 0,61 nella fase 2.
- p 0,63: riemerge. Chi è nel cerchio (60 + P.r·0,4) prende 26.
- Insieme parte un anello di 12 bolle (16 nella fase 2): shootE 'bubble', velocità 115, raggio 7, danno 11.
- Sempre a p 0,63: e.hidden = false, b3fx(e,'orise'), shake(7), sfx('splash',2).
- p 0,75: e.air = 0. Da 0,75 a 1 si assesta e si può colpire.

COME SI SCHIVA
Correndo via (è più lenta dell'eroe) e uscendo dal cerchio.

FASE 2: DUE VOLTE DI FILA
Dopo la prima risalita si immerge subito di nuovo.
- Se c'è una pozza d'inchiostro a meno di 150 px dall'eroe, la seconda volta non nuota. Tutte le pozze d'inchiostro ribollono piano per 0,3 s veri; poi lei passa sotto la pozza più vicina all'eroe (e.x, e.y = la pozza) e risale da lì, col cerchio di raggio 56 e 10 bolle. Quella pozza si consuma.
- Se non c'è nessuna pozza vicina, nuota di nuovo per al massimo 0,9 s e risale col cerchio di raggio 56 e 10 bolle.

7 · MAREA NERA (tide 3,2 s, solo fase 2)
e.face resta sull'eroe.

L'ANELLO (da p 0 a 0,55)
Un anello rosso pulsa intorno alla sua pozza, raggio 64.

LE NINFEE (p 0,10)
- Compaiono tre ninfee (N3.octopus2Pad, raggio 20) a 80–140 px dall'eroe e ad almeno 70 px l'una dall'altra. Stanno dentro la vista del telefono, mai su ostacoli o pozze d'inchiostro.
- Il loro k: spuntano in 0,3 s veri (da 0 a 0,12); galleggiano (da 0,12 a 0,85) finché non è passato 1 s dal passaggio dell'onda; affondano in 0,4 s (da 0,85 a 1).

L'ONDA (p 0,55)
- Un anello che si allarga da lei, partendo da raggio 40, a 260 px/s veri, fino all'angolo più lontano della stanza.
- Lo disegna il cervello: un anello largo 22, con davanti la cresta di schiuma (#e6fff8, alone 150,240,225, goccioline) e dietro l'acqua d'inchiostro (#2a1f40) che sfuma in 30 px. Dopo il passaggio il pavimento resta lucido: un velo che sfuma in 4 s.
- Quando il fronte passa sull'eroe: 22 di danno e una spinta di 40 px in 0,25 s nel verso dell'onda. Niente danno se l'eroe sta su una ninfea (centro a meno di 20 px) o sta scattando.
- Al passaggio le ninfee si alzano (o.lift, o.wa).
- L'onda lava via tutte le pozze d'inchiostro che attraversa.
- A p 0,55, b3fx(e,'otide').

QUANTO TEMPO C'È
Dalle ninfee alla partenza dell'onda ci sono 1,44 s del modello (0,88 s veri), più il viaggio dell'onda fino all'eroe.

COME SI SCHIVA
Salendo su una ninfea, o scattando quando arriva la cresta. La voce c_tide a p 0 la annuncia anche quando lei è fuori dallo schermo.

8 · FURIA E FASE 2
QUANDO PARTE
- A metà vita, ma solo se la Piovra è in camminata, in stuck o in taunt.
- Mai a metà di un'altra mossa, mai sott'acqua, mai durante la Marea o la Gabbia.

COSA SUCCEDE
- Si chiama b3phase(e,'La Piovra si infuria!','255,90,220','splash'). Questo dà la fascia «Fase 2», bossRage, la barra rossa e la scossa, e con gli avvolgimenti di 87 e 88 anche b3fx 'phase2' e la voce 'angry'.
- Poi b3go(e,'rage').
- Durante la furia: e.shell, così non si può colpire (come il Golem).
- Spariscono i colpi in volo (G.eproj = []), le palle d'inchiostro in volo, gli avvisi e i suoi pericoli.

DALLA FINE DELLA FURIA
- dt×1,2.
- Camminata di 0,75–1,0 s veri tra le mosse, a 60 px/s del suo tempo.
- Scivolando lascia una pozza d'inchiostro ogni 1,6 s veri: raggio 24, 3,5 s, al massimo 3 sue insieme.
- Mosse della fase 2: Doppia tentacolata, pioggia a X di cinque, Gabbia d'inchiostro, Risacca alla fine del Gorgo, Agguato due volte (la seconda da una pozza d'inchiostro), Marea Nera.

LA STANZA
Il cerchio di rune RUNEC.piovra passa dal verde acqua al magenta (già così oggi), le torce diventano magenta, la stanza trema.

9 · ORDINE DELLE MOSSE
- Fase 1: slam, ink, cage, slam, whirl, sink (l'Agguato), poi da capo.
- Fase 2: tide subito dopo la furia. Poi slam2, cage, ink, sink (doppio), slam2, whirl, tide, e da capo da slam2.

10 · ENTRATA, SCONFITTA, PRESA IN GIRO
ENTRATA
- BOSS_INTRO.octopus = 3,4. Se c'è G.swampPool, la Piovra entra dal suo centro.
- B3IN.octopus, con t in secondi:
  - 0: shake(2) e sfx('bubble',2); bolle sulla pozza fino a 1,4 (G.fx 'bub', meno con LOWFX);
  - 0,6: sfx('shimmer',0), gli occhi sott'acqua;
  - 1,05, 1,19 e 1,33: tre colpetti, sfx('bubble',0) e G.ripples alla punta;
  - 1,77 e 2,04: schiocchi bagnati, sfx('splash',0);
  - 2,24: sfx('shimmer',1), la Perla;
  - 2,55: shake(5), sfx('splash',2), vfxBlast ad anello, G.ripples;
  - 2,79: roar(), cioè il suo grido, fatto da 88.
- e.em resta sotto 1 fino a 3,13: alone e aura aspettano che sia arrivata.

SCONFITTA
- BDEATH.octopus = {dur:4, clou:2.2, snd:'bubble'}.
- B3DIE.octopus.tick:
  - bolle (cpart 'bubble') tra p 0,25 e 0,8;
  - a p 0,55 il plop della corona: sfx('splash',0) e cpart 'ripple';
  - a p 0,90 il tintinnio della Perla: sfx('shimmer',0).
- La voce 'die' la mette già 88.

PRESA IN GIRO
- Lo stato 'taunt' lo gestisce il cervello nuovo. 88 aveva avvolto il vecchio EUPD.octopus, che questo file sostituisce, quindi l'avvolgimento si perde.
- Nello stato 'taunt': b3tick, e.moving = false, e.face = a; alla fine b3go(e,'walk') per 0,3–0,55 s veri.
- b3taunt va avvolto: per la Piovra o.call = (k === 'laugh2') finché dura il taunt (passato con N3G.opt.octopus).
- I tempi restano quelli di 88: la presa in giro quando ti colpisce, al massimo ogni 9 s; la chiamata dopo 7 s senza colpi; il lamento quando la colpisci forte.
- B2CALM.add('stuck') e B2CALM.add('rise'): niente anello di carica, perché in stuck è il suo punto debole e in rise è sott'acqua.

11 · VOCE
B3VO.VB.octopus va rifatta nel file, al caricamento, prima che le voci si preparino.

COME SUONA
- La gola gorgogliante di oggi, ma una quinta più bassa: vocali scure, più gorgoglio, e sotto un respiro lungo da balena.
- base {br:.35, ro:.3, ji:.08, gu:.45, lp:.42}.
- Volume medio tra 0,07 e 0,11 (si misura come per il Golem). Niente urla.

LE VOCI
- cry (1,5 s, l'entrata), «Hooommm… AAARGH»: [{t:0,d:.45,f:[70,82],v:['m','o'],h:.1,gu:.3},{t:.5,d:.95,f:[95,120,62],v:['o','a','u'],ro:.5,gu:.6,vib:[.03,4.5],rel:.45}].
- angry (1,4 s), un ruggito gorgogliante che finisce in un lamento alto da balena: [{t:0,d:.6,f:[72,80],v:'o',ro:.85,gu:.6},{t:.62,d:.75,f:[150,210,170],v:['u','o'],vib:[.04,5],br:.5,gu:.2,rel:.5}].
- laugh (la presa in giro, 1 s), «hmm-hm-hm» e poi lo sbuffo: ha(3,0,.16,.12,98,84,'m',{h:.2}), poi {t:.55,d:.35,noise:1,v:'u',a:.6,gu:1}.
- laugh2 (la chiamata, 0,9 s), un «Mmmh?» che sale e un gorgoglio: [{t:0,d:.45,f:[72,104],v:'m',h:.2},{t:.5,d:.35,f:[80,66],v:'u',gu:.9,a:.6}].
- hurt (0,3 s), «hngh!» con le bolle: [{t:0,d:.26,f:[110,72],v:['m','u'],gu:.9,att:.05}].
- Un verso per mossa:
  - c_slam, «Hah!»: 0,24 s, da 120 a 92 Hz, vocale 'a', ro .4;
  - c_ink, «ptù-ptù-ptù»: 0,5 s, tre colpi di fiato 'u' con un filo di sibilo e tre vocali corte da 150 a 120 Hz;
  - c_cage, «Mmmmh…» basso che sale, come se chiamasse dal fondo: 0,8 s, da 62 a 95 Hz, 'm', gu .4;
  - c_whirl, «Ooo-ooh» che gira: 0,7 s, 88, 120 e 95 Hz, ['o','u'], am [.3,8];
  - c_dive, «glub-glub»: 0,5 s, due gorgogli da 85 a 60 Hz;
  - c_tide, un richiamo lungo che sale: 1,3 s, 68, 100 e 130 Hz, ['o','a'], ro .3, vib [.025,4].
- die (1,8 s), un lamento lungo che affonda e diventa bolle: 110, 85 e 48 Hz, ['o','u'], gu .9, vib [.05,3.5].
- win (1,1 s, quando l'eroe cade), «Oh-ho-ho… glub»: ha(3,0,.17,.13,100,86,'o') e un gorgoglio da 80 a 55 Hz.

QUANDO PARTONO
- B3CUE.octopus = {slam:'c_slam', slam2:'c_slam', ink:'c_ink', cage:'c_cage', whirl:'c_whirl', sink:'c_dive', tide:'c_tide'}. La voce parte quando comincia la mossa: il colpo si sente arrivare.
- Le bolle di b3sayMore restano.

12 · L'ARENA CHE REAGISCE
b3fx va avvolto con le chiavi nuove; b3mark va avvolto col segno nuovo 'suck'.
- 'oslam', 'oink', 'owhirl', 'osink', 'orise': come oggi.
- 'ostuck': lungo il braccio a terra, due file di 6 tondi bagnati (b3mark 'suck': anelli scuri col bordo chiaro e un riflesso) e una goccia per ventosa.
- 'ocage', a ogni posto della gabbia:
  - un anello di pietra rotta con acqua e due alghe (ENV2.mark 'cracks' di raggio 16);
  - una piccola pozzanghera, se B.pud < 8;
  - ENV2.rocks per gli ostacoli vicini;
  - ENV2.fall(B3N(3)).
- 'otide':
  - torce che si abbassano ('dim' per 0,6 s) e poi tornano magenta per 2,4 s;
  - gocce dal soffitto (ENV2.fall(B3N(10)));
  - tutte le pozzanghere che tremano;
  - canne schiacciate lungo l'onda (ENV2.wiltGrass);
  - il velo lucido sul pavimento.
- 'phase2': come oggi (torce magenta, la stanza trema).

13 · COSA TENERE DEL BOSS DI OGGI
Si tengono:
- la stanza Stagno della Piovra (B3V.octopus: la pozza G.swampPool, canne, ossa, fango) col suo cerchio di rune RUNEC.piovra;
- la musica 'piovra' (86) e BMS.octopus;
- la barra che si rompe come acqua (BBFX.octopus), B2T.octopus e l'aura di bolle (b2aura);
- le pozze d'inchiostro (G.zones ink, drawSoftZone);
- il proiettile 'bubble', G.waves e G.ripples;
- il traguardo 'octo'.
Niente servitori.

Si sostituiscono:
- EUPD.octopus, B3IN.octopus, B3DIE.octopus, BDEATH.octopus e BOSS_INTRO.octopus;
- ETELE.octopus (il vecchio ovale del gorgo: ora lo disegna il cervello nuovo);
- B3CUE.octopus e B3VO.VB.octopus;
- ET.octopus.r e B2H.octopus;
- la riga del bestiario (BEST), che diventa: «Boss. Si abbatte con braccia lunghe mezza stanza (poi resta con le ventose attaccate: colpiscila), piove inchiostro che rallenta, chiude intorno a te una gabbia di tentacoli (esci dal buco), un gorgo ti tira a sé; si immerge e ti viene dietro con la corona come una pinna. A metà vita si alza sulle braccia, si accende di magenta e manda la Marea Nera: si salva chi sta su una ninfea.»

14 · COLLEGAMENTI
MODELLO NUOVO
const OC2ON = typeof N3!=='undefined' && !!N3.octopus2. Se c'è:
- N3.octopus = N3.octopus2;
- N3.meta.octopus = Object.assign({}, N3.meta.octopus2, {old: il disegno di oggi}).

OPZIONI E CAMMINATA
- N3G.opt.octopus = e => ({side:e.oSide, ang:e.oAng||0, a2:e.oA2||0, len:e.oLen, len2:e.oLen2, n:e.oN, call:!!e.oCall}).
- N3G.wp.octopus: la camminata col suo orologio.

PERICOLI
- Stanno in G.oc: avvisi, posti della gabbia, ninfee, onda, velo lucido, e le palle d'inchiostro se non si usa b3ink.
- Si rimettono a zero in buildRoom, si aggiornano in update avvolto, si disegnano in drawHazards2Ground e drawHazards2Air avvolti.
- Se manca un disegno esportato, un ripiego 2D semplice.

REGISTRO
BCL.octopus = {n:'La Piovra della Palude', arena:10, p2:true, enter(), moves:['slam','ink','cage','whirl','sink'], moves2:['tide','slam2'], hz(){conta dei pericoli}, voice:[…]}, come BCL.golem.

MODELLO FINTO
anteprime/boss2/octopus_stub.js: la Piovra di oggi che fa le mosse nuove, con le durate del design. Corrispondenze:
- stuck → idle;
- slam2 → slam;
- cage → prep;
- sink → dive, con p·0,32;
- swim → dive, fermo a p 0,5;
- rise → dive, con 0,66 + p·0,34;
- tide → whirl;
- rage → hit;
- taunt, enter e die come oggi.

NUMERI
Si misurano con tests/boss2diff.js octopus (oggi circa 8 vite al minuto, nel caso peggiore) e si regolano giocando.

## Voti del direttore artistico

VOTI (severi, su 10; il metro è il Golem approvato: misura da boss vero, sagoma che si legge da lontano, un segnale che avvisa i colpi, fase 2 che cambia davvero, abilità giuste e leggibili per la sua arena, costo sotto 1,3 ms)

«regina» 8,4: VINCE
+ La sagoma più forte e più sua: la regina degli scacchi fatta di tentacoli (base larga sull'acqua, testa con due occhi grandi, mantello alto con la corona, due braccia alzate come cobra, due braccia dietro come lo schienale di un trono). Si legge da lontano e non somiglia a nessun altro boss.
+ La stessa grammatica del Golem: tre luci a triangolo (gli occhi d'ambra e la perla); la perla lampeggia e la luce corre nelle ventose del braccio che colpisce.
+ La fase 2 cambia la posa (in piedi sulle braccia) e accende gli anelli magenta che i polpi veri mostrano quando avvisano: un'idea vera, leggibile e bella.
+ Le abilità migliori delle tre. Due mosse nuove tutte sue: la Gabbia (un anello di tentacoli con un buco) e la Marea Nera (l'onda che copre la stanza, le ninfee per salvarsi, e intanto lava via l'inchiostro). La finestra per colpire dopo la Tentacolata funziona come i pugni incastrati. La corona fa da pinna nell'Agguato. Molte regole di giustizia sono già pensate.
+ Superba e dispettosa: giusta per la «Signora dello stagno maledetto».
- Coralli e capesante sono cose di mare, non di palude. Denis vuole colori e cose sempre del loro mondo.
- È il terzo boss con la corona (il Re Rospo d'oro, la Regina dei Ghiacci di cristallo) e la seconda «regina». La corona va fatta di cose dello stagno, col suo cerchio di giunco, e il nome del design cambia.
- Troppi pezzi piccoli: 9 pezzi di corona, balani, due papille per occhio, una dozzina di anelli, 16 ventose per braccio. A 120 px diventano rumore, e costano.
- I tempi sono in secondi del modello e non tengono conto della velocità. Nell'arena 11 il boss va già 1,34–1,37 volte più veloce (bossLvl), e nella fase 2 fino a 1,64. Così la Tentacolata avvisa 0,58 s veri (0,46 nella fase 2), l'Agguato 0,4–0,55 s, la Risacca 0,48 s: tutti sotto 0,6 s.
- Nella fase 2 la seconda tentacolata riparte dalla posa di riposo mentre il primo braccio è ancora a terra: la posa salta.
- L'inseguimento a 125–150 px/s, calcolato col dt del boss, diventa 170–245 px/s: più veloce dell'eroe (150).

«kraken» 7,6
+ La più possente e la più da palude (fango, tife, ninfea). L'occhio che ti scivola dietro a pelo del fango è l'immagine più paurosa delle tre.
+ L'unica che conta gli avvisi in secondi veri, con la velocità dell'arena. Bella la luce che corre negli anelli dalla base alla punta.
- Un occhio solo su una cupola: o diventa un ciclope da pupazzo o un mostro da horror, ed è difficile restare a metà.
- Non è più una «Signora», è una montagna di fango. L'ocra del fango è meno bella e meno ricca della madreperla.
- Copia il Golem: nella fase 2 le zolle che fanno da riparo sono i suoi spallacci, e le gobbe che corrono sotto il pavimento sono la sua Faglia. Inoltre un mucchio da cui escono cose alte resta vicino all'Idra.

«strega» 6,9
+ Le idee di gioco più furbe. Le pozze d'inchiostro diventano le sue porte, così le mosse si parlano. La Collana dell'Abisso (un anello di perle con un varco che gira, va e torna) è il disegno di colpi più bello delle tre. Bello anche il gorgo che ti porta nell'abbraccio.
- È la strega del mare dei cartoni (cappuccio, collana, trucco), ed è la seconda strega col cappuccio del gioco: la Strega delle Radici ha già cappuccio e viso che brilla. Già vista due volte.
- Elegante più che possente. La fase 2 su sei tentacoli usati come gambe, con la membrana, è la parte più difficile da costruire, e la proposta stessa prevede una riserva.
- Cappuccio di 9 foglie, tre fili di perle e 8 tentacoli: troppo per il costo. E troppi sistemi insieme per un boss solo (porte, cerchi, collana, gorgo e abbraccio).

COSA ENTRA DALLE ALTRE DUE
- Dal «kraken»:
  - cose dello stagno al posto del mare: chiocciole di palude, la cozza di fiume con la perla, il cerchio di giunco, la ninfea;
  - ogni avviso contato in secondi veri, con la velocità dell'arena 11: ogni finestra dura almeno 1,0 s del modello;
  - gli occhi che brillano sotto il pelo dell'acqua mentre la pinna taglia l'acqua;
  - nella sconfitta, la luce che si ritira dalle punte.
- Dalla «strega»:
  - i tre colpetti impazienti sull'acqua nell'entrata;
  - le pozze d'inchiostro come porte, nella seconda risalita della fase 2;
  - niente pupille a fessura sottile come quelle delle capre: pupilla a pillola, iride grande, lucina sempre.

COSA ESCE DALLA «REGINA»
- Escono coralli, capesante e balani.
- Escono le due papille a corno: al loro posto un'arcata di pelle a V con una puntina.
- Esce l'orlo chiaro della gonna, che sembrerebbe un pannolino.
- Esce il dito che chiama dal fermo: resta solo nella chiamata.
- Si dimezzano anelli e ventose.
- La doppia tentacolata diventa una mossa sola (slam2).
- Tutti i tempi sono ricontati per la velocità dell'arena 11.
