# Il Mimic: il design finale

(Deciso dal direttore artistico tra tre proposte, 16 ottobre. Tipo nel gioco: `mimic`; modello `sprite/nemici3d/mimic2.js`.)

## Il design

IL MIMIC · «La cassa sbagliata». Design finale; nome di lavoro «il Forziere Affamato». Nel gioco nome e titolo restano «Il Mimic» · «La cassa sbagliata». Modello 'mimic2' in sprite/nemici3d/mimic2.js, registrato con p2:true; nel gioco prende il nome 'mimic' (src/js/89-mimic-nuovo.js).

IDEA
È il vecchio forziere della cripta che tutti vogliono aprire: quercia scura mezza marcia, angolari e fasce d'ottone che luccicano come il tesoro delle casse gemelle. È un'esca. Quando lo tocchi si sveglia:
- due occhi d'ambra si accendono nel buio sotto il coperchio;
- il coperchio si spalanca su una gola di velluto rosso trapuntato, piena di denti d'avorio (uno è d'oro), e in fondo brilla il suo mucchio d'oro;
- la cassa si alza su lunghe gambe pallide con le ginocchia al contrario e pianta a terra due braccia più lunghe di lei, con tre artigli per mano.
È il Mimic alla Dark Souls approvato, rifatto da boss vero: alto tre volte l'eroe, fermo come un mobile e poi veloce come un ragno, avido e beffardo. Il suo cuore è il tesoro. Prima di ogni colpo il tesoro «si sveglia» (tin-tin) e la sua luce corre nell'ottone fino alla parte che sta per colpire. A metà vita la serratura si apre: era un occhio.

1. SILHOUETTE E MISURE
Unità del modello = px a sc 1. Assi: x avanti, y verso la sua destra, z in alto; 0,0,0 è il pavimento sotto il centro della cassa.

Da lontano: un blocco di legno scuro bordato d'oro, la forma più grande e più chiara, alto sopra quattro trampoli pallidi. Le due gambe sottili stanno sotto la cassa, col ginocchio all'indietro come un uccello. Le due braccia lunghe escono dai fianchi e si piantano a terra, davanti e in fuori, come stampelle ad arco.
Anche quando è piccolo sullo schermo devono leggersi quattro cose:
- il blocco con gli spigoli d'oro;
- i due occhi accesi nella fessura;
- i denti bianchi con la gola che brilla quando apre la bocca;
- i trampoli pallidi col contorno spesso.

Cassa: x da −20 a +20 (profonda 40), y da −26 a +26 (larga 52), z da 60 a 96 (alta 36). Le facce sono bombate di 2,5 al centro come un barile e gli spigoli sono tondi sotto gli angolari: un giocattolo robusto, che può gonfiarsi quando mastica o sputa.

Coperchio ad arco:
- cerniera sullo spigolo alto di dietro (x −20, z 96);
- lungo 40, largo 52, spesso 4 al bordo; l'arco sale di 14 al centro;
- chiuso, la cima è a 110;
- a riposo respira tra 8° e 15° (cima a 112–114);
- aperture: fase 2 25°, Frustata 100°, Morso 110°, rabbia e sputo dell'Assaggio 120°.

Gambe:
- anca sotto la cassa a (−6, ±15, 60);
- coscia 34, stinco 32;
- ginocchio all'indietro e un po' in fuori (il polo verso −x);
- piede a (−2, ±24, 0), con tre dita di 9 in avanti e in fuori.

Braccia:
- la spalla esce dal buco del fianco a (0, ±26, 84);
- omero 50, avambraccio 48;
- il gomito va verso l'alto e in fuori, fino a circa (12, ±54, 52);
- la mano poggia a terra a (24, ±48, 2), con tre dita di 13 e artigli di 5.

Spessori:
- omero da 8,5 a 7, avambraccio da 7 a 5,5;
- coscia da 9 a 7,5, stinco da 7,5 a 5,5;
- gomiti, ginocchia e nocche sono palle di raggio 5.

Ingombri:
- larghezza 116 con le mani a terra, 140 a braccia aperte;
- altezza 110 a coperchio chiuso, 112–114 a riposo;
- a bocca spalancata (110°) il coperchio arriva a 136;
- nella fase 2 è più dritto: anca a 66, cassa da 66 a 102, coperchio sempre a 25°, cima a 123.

Nel gioco: raggio 30 (oggi 24). Il modello disegna la sua ombra: un ellisse 44×18 sotto la cassa, più scura dove ci sono i piedi.

Le quattro direzioni:
- davanti: la piastra della serratura tra due fasce, la fessura con gli occhi, la lingua che pende sull'orlo;
- di lato: un cuneo ad arco su gambe a zeta, con le braccia a stampella davanti e un occhio appena visibile nella fessura;
- dietro: le due cerniere, la fascia del coperchio, le ragnatele e le quattro zampe; mai occhi, denti o velluto;
- tre quarti: tutto insieme.

2. PEZZI NELLA POSA DI RIPOSO
Assi:
- tre assi orizzontali per faccia, con le fughe a z 72 e 84;
- tre assi sul coperchio lungo l'arco, con le fughe a 13 e 27 dalla cerniera;
- venature leggere e due chiodi per asse vicino alle fasce;
- una crepa sull'asse alta davanti, a sinistra;
- macchie di legno marcio sull'asse bassa.

Ottone (da lontano è un tesoro):
- 8 angolari a punta arrotondata sugli spigoli, lati di 9, una borchia ciascuno;
- sul davanti e sul dietro, due fasce verticali larghe 5 a y ±16;
- sui fianchi, due fasce a x ±12;
- la fascia di fondo (z da 60 a 64) tutto intorno;
- borchie di raggio 1,3 ogni 8 lungo tutte le fasce;
- sul coperchio, due cinghie sull'arco a y ±16, che continuano le fasce del davanti, più una fascia sul bordo davanti e una dietro;
- dietro, due cerniere 8×10 a y ±14.

La serratura (il «naso»):
- una piastra a scudo d'ottone al centro del davanti, larga 16, da z 70 a 88;
- il buco della chiave (un cerchio di raggio 2,2 più la coda) sta a z 80;
- dal bordo davanti del coperchio scende la bandella (larga 8, lunga 9): a coperchio chiuso copre la cima della piastra e si alza con lui;
- nel buco c'è sempre un puntino di luce calda: il tesoro che dorme.

Medaglioni e buchi:
- sui fianchi due medaglioni d'ottone di raggio 6,5, sopra i buchi delle spalle;
- nella cassa chiusa sono due borchie grandi;
- quando escono le braccia, si aprono come sportellini incernierati in alto e restano aperti accanto al buco, con le schegge di legno intorno;
- i buchi delle gambe stanno sotto il fondo e dall'alto non si vedono.

Dentro (è un portagioie, mai carne):
- velluto cremisi trapuntato a rombi, con bottoncini d'oro di raggio 1, sulle pareti e sotto il coperchio;
- il mucchio d'oro riempie la cassa fino a z 82 dietro e 78 davanti (la telecamera, inclinata di circa 29°, vede solo così in alto dentro la cassa): monete, una gemma rossa e una verde, e fa luce dal basso;
- in alto, appena sotto l'orlo davanti, c'è il buio dove stanno gli occhi;
- una moneta incastrata tra due denti dell'orlo luccica.

Denti (d'avorio, un po' storti):
- sull'orlo della cassa: 7 davanti, alti 4–6, più due zannette agli angoli davanti, alte 8, e 4 per fianco nella metà davanti;
- sotto il bordo davanti del coperchio: 7, il centrale è il dente d'oro (l'avaro), e 3 per fianco;
- niente denti dietro, dove c'è la cerniera.

Occhi:
- due, di raggio 6,5, a (12, ±9, 95), nel buio dietro l'orlo davanti;
- dalla telecamera si vedono nella fessura tra l'orlo e il bordo del coperchio: a 8° ne resta una fetta, occhi socchiusi sotto una fronte; a 15° si vedono quasi interi; a bocca aperta guardano dal buio sopra l'oro, tra i denti;
- iride d'ambra, pupilla a fessura verticale, lucina bianca in alto a sinistra, alone morbido;
- seguono l'eroe (look);
- da dietro non si vedono mai, e nella cassa chiusa non c'è nessuna lucina.

Lingua:
- color lampone, una catena di 7 palle (raggio da 4,2 a 2,4) che parte da (6, 0, 82) e scende oltre l'orlo davanti;
- a riposo pende di 22 sul davanti e ondeggia;
- riga chiara in mezzo, punta tonda, una goccia di bava ogni 1,5 s.

Arti:
- pallidi come cera vecchia, con un filo di rosa su nocche e ginocchia;
- polsiere d'ottone sugli avambracci (8 sopra il polso, larghe 4, due borchie) e cavigliere sugli stinchi (6 sopra il piede): portano la luce del segnale e staccano le zampe dal pavimento chiaro;
- mani: palmo piccolo e tre dita lunghe che si piegano verso il palmo, con artigli d'avorio dalla punta scura;
- piedi a tre dita, con le unghiette.

Ragnatele: due, sugli spigoli alti di dietro, tra il coperchio e la cassa. La prima volta che il coperchio si spalanca si strappano e restano due fili che pendono.

Il materiale del posto lungo la fascia di fondo (o.mat): il Mimic si traveste da cassa di quella cripta.
- muschio: ciuffi che pendono;
- cenere: strisce grigie e una brace;
- fango: schizzi e lenticchie d'acqua;
- brina: crosta bianca e tre ghiaccioli.

3. COLORI (tre toni: luce / base / ombra)
Fase 1:
- legno di quercia vecchia #a4643a / #74401f / #42200e; fughe e crepa #26110a; venature rgba(38,17,10,.35); legno marcio #3a2a18;
- ottone #ffe08a / #d9a640 / #8c5e1c; luce sulle borchie #fff3c4; qualche puntino di verderame #5f9a7a;
- velluto #c23a52 / #7d1a2c / #3a0812; bottoncini #ffd56a; il buio in alto nella bocca #1a0608;
- oro del mucchio #fff0a8 / #ffc93c / #b07a1c; la sua luce rgb 255,196,70;
- denti #f6eed6 / #d9caa6 / #a8956e; dente d'oro #ffe58a / #e0a830 / #8a5a14;
- lingua #f07a94 / #c8466a / #7a1f3c; riga #ffb0c0; bava rgba(220,235,210,.8);
- arti #ece3d4 / #c3b6a2 / #85786a; nocche e ginocchia #d9c4b8; artigli #f8efda / #c9b791 con la punta #5a4a38;
- occhi: iride #ffb52e, cuore #ffe98a, pupilla #1b1612, lucina #ffffff, alone rgba(255,170,50);
- ragnatele rgba(235,235,240,.55);
- o.mat: muschio #6e9a3e / #4f7a2e / #2f4f1c; cenere #8a807a / #6a605c / #3e3836 con la brace #ff8a3a; fango #7a6038 / #5a4428 / #36281a con le lenticchie #7ab03a; brina #f4fbff / #e8f6ff / #9cc8e8;
- contorno INK 2,5; 1,2 su denti, dita e borchie.

Fase 2 («ha fame»):
- occhi rossi: iride #ff4a2a, cuore #ffb08a, alone rgba(255,80,40);
- la luce dentro passa all'arancio rgb 255,110,40 ed esce dalle fughe tra le assi, in righe sottili #ff8a3a che pulsano col respiro;
- legno più cupo #94552e / #663818 / #381a0a; velluto #a82a40 / #601222 / #2a0408;
- occhio della serratura: bianco #fff1c8, iride #ff5a2a, cuore #ffc08a, pupilla a buco di serratura #1b0a06, palpebre d'ottone (i tre toni dell'ottone), crepe della piastra #5a3a10;
- polsiere e cavigliere con un filo di luce arancio.

4. PITTURA (come la lanterna)
- Tre toni su ogni pezzo (softBox, softBall).
- Bordo caldo (rim, rimPoly) su cassa, coperchio, braccia e gambe; shadeLimb sugli arti; glowTop su ottone e oro.
- Segni leggeri: venature, chiodi, crepa.
- Bagliori morbidi (shine) su occhi, gola, oro e buco della serratura.
«Un po' più cupo» vuol dire:
- la metà bassa della cassa è più scura, verso l'ombra;
- sotto il bordo del coperchio, sul davanti, c'è una fascia d'ombra di 4 px;
- le cosce sono più scure in alto, nell'ombra della cassa;
- la luce viene da dentro: l'oro illumina dal basso i denti, la lingua e il sotto del coperchio, come una torcia sotto il mento.
Nel gioco la bocca fa luce sul pavimento davanti a lui (ELIGHT.mimic): poca a riposo, tanta a bocca spalancata, arancio nella fase 2, spenta quando è nascosto.

5. FACCIA E OCCHI
La faccia è la fessura: sopra la fronte del coperchio con la bandella, sotto l'orlo coi denti e le due zannette, dentro due occhi d'ambra. Gli occhi:
- nelle preparazioni si stringono: la fessura si chiude del 40%;
- quando mastica diventano mezzelune felici;
- quando qualcosa non gli piace si spalancano;
- quando è stordito girano a spirale.
Il battito delle palpebre è il coperchio che fa «clac»: si chiude di colpo e si riapre. Il dente d'oro luccica (una stellina) quando ride. Nella fase 2 si aggiunge l'occhio della serratura.

6. IL SEGNALE: IL TESORO SI SVEGLIA
È il suo cuore, come la runa del Golem. A riposo l'oro dentro pulsa piano col respiro del coperchio, e nel buco della serratura c'è un puntino caldo.
Prima di ogni colpo:
1. «tin-tin», due tintinnii di moneta come il «tum-tum» del Golem: la luce dentro si gonfia e dal buco della serratura esce un raggio corto.
2. La luce corre nell'ottone (una perla luminosa che scorre in circa 0,25 s) fino alla parte che sta per colpire:
 - Morso: lungo le due cinghie del coperchio fino ai suoi denti, che si accendono bianco-oro;
 - Frustata: dentro la bocca la lingua arrotolata si accende rosa-oro, la punta più di tutto;
 - Assaggio: dai medaglioni giù per le braccia, fino alle polsiere e alle punte degli artigli;
 - Sputo d'oro: in tutte le fughe tra le assi e nel buco della serratura (la pancia si accende da dentro);
 - Tagliola: lungo le gambe fino alle cavigliere, e le ginocchia fanno clic;
 - Gioco delle Casse: la luce si spegne (si nasconde).
3. A terra gli avvisi rossi contano alla rovescia:
 - le tre impronte di denti della corsia si accendono una dopo l'altra;
 - la corona di otto dentini del cerchio della Tagliola si accende tutt'intorno, come le tacche del Golem;
 - le linee delle monete si riempiono dalla bocca in fuori.
Il punto debole, «Colpo in bocca!»: quando la bocca è spalancata e la luce d'oro esce sul pavimento, i colpi da davanti fanno +50%. Vale nelle preparazioni di Morso, Frustata e Sputo e nella presa in giro; da Incastrato e da Stordito vale da ogni lato.

7. ORDINE DI DISEGNO (dalla posa di riposo, con parts e run)
1. gamba lontana;
2. braccio lontano;
3. la cassa (le facce che si vedono);
4. il dentro, ritagliato sull'apertura tra l'orlo e il coperchio: velluto, oro, occhi, denti dell'orlo, la radice della lingua;
5. il coperchio, con i suoi denti e, quando si vede, il velluto sotto;
6. braccio vicino;
7. gamba vicina;
8. la lingua davanti; quando è stesa a terra e lui guarda via dalla telecamera va prima della cassa (decide la profondità del suo punto medio);
9. le monete.
Le braccia alzate (la mantide, la rabbia) restano nel posto che hanno nella posa di riposo. Nella Tagliola l'inclinazione resta sotto i 65°.

8. FERMO E CORSA
Fermo (idle, 3 s, ciclo): piantato sulle quattro zampe come un mobile.
- Il coperchio respira da 8° a 15° e torna, lento come un mantice; con lui pulsa l'oro dentro.
- Gli occhi si guardano intorno (a sinistra a p .10–.25, a destra a .35–.50), poi restano sull'eroe.
- A .30–.45 la lingua esce, lecca l'orlo da sinistra a destra e rientra.
- A .15, .20 e .25 le tre dita della mano destra tamburellano: tic-tic-tic, le punte si alzano di 4.
- A .62 tutto il corpo dà uno scatto secco di 2 px e il coperchio fa «clac» (è anche il battito delle palpebre).
- A .70–.90 la cassa si piega di 4° di lato, come un cane curioso.
- Nella fase 2: coperchio a 25° ±3°, lingua fuori di 30 che ondeggia, l'occhio della serratura che si guarda intorno per conto suo, fughe arancio che pulsano.

Corsa a scatti (walk, 0,8 s, ciclo): fermo come un mobile e poi veloce come un ragno.
- p 0–.55, lo scatto: quattro passi rapidi a coppie in diagonale, braccio sinistro con gamba destra e poi il contrario, due volte; appoggi a .11, .22, .33 e .44. La cassa è bassa di 4 e inclinata in avanti di 6°, il coperchio batte a .12 e .40, c'è un saltello di 2 a ogni passo e le braccia a stampella avanzano di 30 per passo.
- p .55–1, il fermo: si blocca di colpo a metà passo, con un piede appena alzato. A .60 si raddrizza, il coperchio si piega verso l'eroe, gli occhi guizzano; a .80 un artiglio batte una volta.
- Il gioco lo muove solo per p < .55.

9. LE MOSSE (preparazione, colpo, ritorno)
IL MORSO (chomp, 1,8 s)
- Il segnale: a .00–.12 si sveglia (tin a .03 e .10); a .12–.35 la luce corre lungo le cinghie del coperchio; a .35–.45 i denti del coperchio si accendono e a .40 una scintilla corre lungo la fila.
- Preparazione (.00–.45): si abbassa sui trampoli (cassa da 60 a 50) e alza le braccia larghe e alte come una mantide (mani a (10, ±46, 124), artigli aperti in avanti). Il coperchio si spalanca fino a 110°, la gola brilla d'oro, gli occhi si stringono.
- Colpo (.45–.72): si butta in avanti con la cassa inclinata di 15° e le gambe che zampettano veloci, remando indietro con le braccia. Il coperchio si chiude tre volte, CIAC a .50, .58 e .66: chiude a 8°, riapre a 70°, e di nuovo.
- Ritorno (.72–1): l'ultimo morso sbatte il bordo del coperchio a terra davanti (cassa inclinata di 30° a .74); a .82 lo strappa via con uno scatto e la cassa torna su; a .85–.95 scuote il coperchio di ±6° di lato; poi la posa di riposo.

LA FRUSTATA (tongue, 1,6 s)
- Il segnale: a .00–.12 si sveglia (tin a .03 e .10); a .20–.50 la lingua arrotolata si accende dalla radice alla punta.
- Preparazione (.00–.50): si piega indietro sui trampoli (cassa a −15° e più alta di 6), il coperchio spalancato verso l'alto (100°), la lingua arrotolata in bocca contro il velluto.
- Colpo (.50): la lingua schizza dritta lungo il pavimento fino a o.reach, in .025. Nei primi 30 px scende dalla bocca a terra, poi resta stesa a 2 dal pavimento, alzando la polvere. Da .53 a .75 due onde corrono fino alla punta, che schiaffeggia il pavimento a .60 e a .70.
- Ritorno: a .75–.90 si riavvolge («slurp»), a .90–1 il coperchio torna a riposo.

LA FRUSTATA A TRE (tongue3, 2,0 s, solo nella fase 2)
- Fino a .36 è come la Frustata: si sveglia, si piega indietro, la lingua si accende.
- Schiocca a sinistra a .40 (o.fan[0], −26°), al centro a .56, a destra a .72 (+26°); ogni lingua arriva fino alla sua lunghezza (o.reach3). Ogni schiocco: fuori in .03, frusta fino a +.07, poi la lingua si alza e gira verso la direzione dopo.
- Ritorno: .80–1.

L'ASSAGGIO
La presa (grab, 1,5 s):
- Il segnale: a .00–.10 si sveglia (tin a .03 e .09); a .10–.35 la luce scende dai medaglioni lungo le braccia; a .35–.55 polsiere e punte degli artigli sono accese.
- Preparazione (.00–.55): si abbassa (cassa a 52) e apre le braccia larghe e basse in avanti, come un abbraccio (mani a (30, ±70, 20)), coi tre artigli spalancati. Coperchio a 30°; a .20–.40 la lingua lecca l'orlo.
- Colpo (.55–.62): le braccia si chiudono di scatto davanti (mani a (46, ±4, 14)) e gli artigli si incrociano.
- Ritorno, se manca: a .62–.80 graffia il pavimento tirando indietro le mani, a .80–.92 le scuote stizzito, poi torna in posa.
Il boccone (gulp, 1,2 s), con l'eroe dentro:
- .00–.12: le mani spingono il boccone in bocca e il coperchio sbatte; la cassa scende di 4 («Gnam!»).
- .12–.55: mastica tre volte (il coperchio si apre a 15° e sbatte a .20, .33 e .46). A ogni masticata la cassa si gonfia fino a 1,06, le assi si piegano e da ogni fuga salta una moneta; gli occhi sono mezzelune felici.
- .55–.70: gli occhi si spalancano (qualcosa non va), si gonfia tutto fino a 1,12 e le assi scricchiolano.
- .75, lo sputo: il coperchio si spalanca a 120°, la lingua schizza fuori e la cassa rincula («Bleah!»).
- .80–1: scuote il coperchio a destra e a sinistra, disgustato, con la lingua fuori e gli occhi strizzati; poi torna in posa.

SPUTO D'ORO, PIOGGIA D'ORO CON o.p2 (coins, 1,6 s)
- Il segnale: a .00–.10 si sveglia (tin a .03 e .10); a .15–.50 tutte le fughe tra le assi e il buco della serratura si accendono d'oro e le monete dentro sbattono (la cassa trema di 1 px a 18 Hz).
- Preparazione (.00–.50): si alza in punta di zampe (cassa più alta di 8) e si gonfia, con le assi incurvate (1,08 di lato); coperchio a 25°.
- Colpo (.50–.65): si butta in avanti di 18° e spalanca la bocca a 100°; ne esce uno sbuffo di monete, che il modello disegna fino a .62 (le monete vere le tira il gioco). Con o.p2, a .55 esce anche una fontana di monete verso l'alto.
- Ritorno (.65–1): a .72 tossisce l'ultima moneta, che cade dal labbro; a .80–.90 si lecca il dente d'oro; poi si sgonfia.

LA TAGLIOLA
Un balzo (leap, 1,1 s; il gioco lo ripete 2 o 3 volte e gli dà l'altezza con o.z):
- .00–.20: si accuccia fondo sui trampoli (cassa a 46), le ginocchia fanno clic, le cavigliere si accendono, le braccia vanno indietro, coperchio a 90°.
- .20–.93, in volo: si inclina in avanti fino a 60° (mai oltre 65°) con la bocca spalancata verso il basso (100°). Le gambe penzolano indietro, le braccia sono aperte in avanti e in basso come le ganasce di una tagliola.
- .93–1: ricade a bocca in giù e il coperchio sbatte sul pavimento (CLANG a .95), poi rimbalza su nella posa accucciata del balzo dopo. Con o.last invece resta piantato: inclinato di 35°, con il bordo del coperchio e l'orlo nel pavimento, e continua in stuck.
Incastrato (stuck, 1 s):
- .00–.80: i denti sono nel pavimento, la cassa è inclinata in avanti di 35° col fondo in alto e la bocca è rimasta aperta di 40° verso terra. La luce d'oro fa una pozza sul pavimento davanti e scappa qualche moneta. Le gambe scalciano in aria (due calci alternati al secondo), le braccia fanno leva coi gomiti in alto.
- .80: si stacca con uno strappo, con una pioggia di schegge di legno e di pavimento.
- .80–1: si scrolla di ±5° e torna in posa.

IL GIOCO DELLE CASSE (fase 2)
Torna cassa (hide, 0,8 s):
- .00–.30: le gambe si piegano sotto il fondo (le ginocchia scrocchiano);
- .10–.45: le braccia vengono risucchiate nei buchi dei fianchi e a .45 i medaglioni si chiudono;
- .50: la cassa si siede a terra con un tonfo (da 60 a 0);
- .55–.70: gli occhi si spengono nella fessura come due braci; a .60 il coperchio si chiude;
- da .70 è uguale alla posa chest.
Cassa chiusa (chest, 1 s, ciclo): è ferma, la muovono solo le opzioni (sezione 15). In questa posa l'aspetto della fase 2 si spegne del tutto: l'occhio della serratura torna un buco della chiave, le fughe si spengono, il coperchio è chiuso. Così la vera è uguale alle finte.
Salta fuori (pop, 0,5 s):
- .00–.30: zampe e braccia scattano fuori tutte insieme, i medaglioni si spalancano, il coperchio si spalanca;
- .40: un saltello, la cassa più alta di 10;
- .80: atterra in posa di riposo.
Stordito (daze, 1 s, ciclo): in piedi ma molle. La cassa ondeggia in tondo di ±6°, le ginocchia cedono un poco, il coperchio pende aperto a 60° con la luce d'oro, la lingua penzola di lato, le pupille girano a spirale e ci sono le stelline sopra il coperchio.

COLPITO (hit, 0,6 s; solo per le pagine, in battaglia i boss non la usano): a .00–.10 il coperchio si chiude di colpo, la cassa rincula di 4 con un rollio di 6° e gli arti si allargano; a .10–.60 torna in posa con un brivido.

10. FASE 2: «IL MIMIC HA FAME!» (rage, 2,4 s, nessun danno)
- .00–.20: si blocca e trema (12 Hz, 1,5 px), le monete sbattono dentro, le fughe sfarfallano.
- .20–.45: si alza sulle zampe (anca da 60 a 66) e solleva le braccia alte e larghe.
- .45–.60: la piastra della serratura si crepa (due crepe a .47) e il buco della chiave si apre come una palpebra (le palpebre d'ottone si separano a .50–.58). È un terzo occhio grande, di raggio 7, con la pupilla a forma di buco della serratura: a .58–.62 guarda a sinistra e a destra, poi si pianta davanti.
- .60–.75: il coperchio si spalanca a 120° con le cerniere che cigolano e da qui non si chiude più; la luce dentro passa dall'oro all'arancio ed esce dalle fughe; gli occhi diventano rossi.
- .75–.95: un ruggito che rimbomba nella cassa. Il coperchio sbatte tre volte, il modello disegna una fontana di monete e le mani battono a terra a .78 e .86.
- .95–1: si ferma nella posa nuova.
L'aspetto della fase 2 (o.p2):
- più alto e più dritto: anca a 66, cassa da 66 a 102, cima a 123;
- coperchio sempre socchiuso a 25°, coi denti in vista e la lingua fuori di 30;
- tre occhi rossi;
- righe arancio luminose nelle fughe;
- polsiere e cavigliere con un filo di luce.
Nelle preparazioni il coperchio si spalanca come prima; nella posa chest tutto torna come nella fase 1.

11. ENTRATA (enter, 2,8 s; BOSS_INTRO.mimic 2,8)
Le casse gemelle (42) si disegnano col modello (N3.mimicChest con o.mat) e sono uguali al pixel, la buona e la sbagliata:
- la buona si apre (o.lid, o.gold, o.good: dentro velluto e oro, niente denti né occhi) e le monete vere escono come oggi;
- la sbagliata trema per 1,1 s (o.shake): il coperchio sobbalza, a .3 salta una moneta dalla fessura, da .6 si vedono due occhi d'ambra nella fessura.
L'entrata parte da quella stessa cassa chiusa:
- .00–.10: la cassa fa un balzo indietro, come chi è stato scoperto, lontano dall'eroe. Il gioco la sposta di 50 px; il modello la alza di 14 e la fa ricadere con un tonfo a .10.
- .10–.22: trema sempre più forte (da 2 a 4 px) e il coperchio sobbalza (da 2° a 6°). A .14 due occhi d'ambra si accendono nella fessura, a .18 cola una goccia di bava e spuntano le punte dei denti.
- .22–.45: da sotto escono le gambe e la cassa si alza in tre scatti, a .25, .33 e .41: il ginocchio si apre, il piede si pianta, su. Il fondo sale da 0 a 20, 40 e 60.
- .45–.62: i medaglioni dei fianchi si aprono (a .46 il destro, a .53 il sinistro) e le braccia si srotolano una alla volta, con le giunture che fanno clic (gomito, polso); a .60 le dita tamburellano a terra.
- .62–.80: il coperchio si spalanca fino a 110° con un cigolio lungo (.62–.72) e le ragnatele dietro si strappano; a .70–.80 la lingua esce e lecca tutto l'orlo; gli occhi si piantano sull'eroe.
- .80–.94: a .82 sbatte le due mani a terra; a .84–.94 si sporge in avanti e urla col coperchio che sbatte (il grido rimbomba nella cassa).
- .94–1: si rimette nella posa di riposo.

12. SCONFITTA (die, 3,4 s; BDEATH.mimic {dur:3.4, clou:2.2, snd:'coin'})
Il gesto approvato da Denis (perde il coperchio e sputa monete), ora recitato dal modello.
- .00–.20: l'ultimo colpo lo fa barcollare indietro; il coperchio sbatte aperto e chiuso a .05 e .12.
- .20–.45: traballa sui trampoli e le gambe si piegano una dopo l'altra come una sedia pieghevole (a .25 la destra, a .32 la sinistra; mai spezzate). A .40 la cassa si siede a terra con un tonfo e una nuvola di polvere.
- .45–.65: le braccia ricadono e vengono risucchiate nei buchi dei fianchi («slurp»; i medaglioni si chiudono a .55 e .60). A .60 gli occhi si spengono nella fessura con due sbuffi di fumo.
- .65, il momento clou: il coperchio salta via con un «boing», gira in aria e a .80 ricade dietro. Dalla cassa aperta esce una fontana di monete nella luce d'oro.
- .65–1: le monete piovono intorno, a .70 la lingua ricade molle sull'orlo, e resta una vecchia cassa vuota e aperta che sfuma (.85–1).
Nella fase 2 l'occhio della serratura si chiude a .60 e la luce torna d'oro prima di spegnersi.

13. PRESA IN GIRO, ESCA, STORDITO
Presa in giro (taunt, 1,1 s): «i denti a molla», il pezzo finale dell'entrata rifatto come risata.
- .00–.12: si drizza sulle zampe (più alto di 6) e porta le mani davanti.
- .12–.60: il coperchio batte su e giù sei volte velocissimo, da 0° a 50° (clac-clac-clac, come i denti finti a molla). La cassa saltella tre volte sul posto, gli artigli si sfregano davanti come un avaro che conta le monete, il dente d'oro luccica.
- .60–.80: la lingua lecca tutto l'orlo.
- .82: un singhiozzo, e una moneta salta fuori dalla bocca, fa un arco e cade davanti («hic!»).
- .88–1: si ricompone.
L'esca (lure, 1,4 s), quando lo lasci stare troppo a lungo:
- .00–.25: si abbassa (cassa a 52), socchiude il coperchio a 20° e lascia uscire la luce d'oro sul pavimento.
- .25–.75: il dito di mezzo della mano vicina si alza e si piega due volte, a .35 e a .55 («vieni qui»); le monete tintinnano piano e la cassa trema appena.
- .75–1: richiude il coperchio a riposo con un'ondeggiata furba.
Lo stordito è nella sezione 9 (daze).

14. DISEGNI DA ESPORTARE PER IL GIOCO (stesso aspetto del modello, come N3.golemRock)
N3.mimicChest(x, y, z, face, sc, o): la cassa chiusa della posa chest, per le casse gemelle e per le due finte del Gioco delle Casse. z è l'altezza del saltello negli scambi. Costo massimo 0,4 ms. Opzioni:
- o.mat: il materiale del posto;
- o.shake (0..1): il tremito della cassa sbagliata, col coperchio che sobbalza, la moneta che salta a .3 e gli occhi nella fessura da .6;
- o.lid (0..1, apertura) e o.gold (0..1, luce del tesoro), insieme a o.good per la cassa buona: dentro velluto e oro, niente denti, occhi o lingua;
- o.slide (−1..1): si inclina di 6° dalla parte dove scivola;
- o.real (0..1): lampo degli occhi nella fessura, col coperchio che si alza di 2° (occhi rossi con o.p2);
- o.breath (0..1): il coperchio si alza di 2°;
- o.shadow: false per non disegnare l'ombra.
N3.mimicCoin(x, y, z, spin, sc, o): una moneta d'oro in 3D, di raggio 4,5, col bordo #c88a1e, una stellina incisa #9a5a16 e la luce #fff6c8. In volo gira col suo spin; con o.floor è distesa a terra e luccica (o.glint 0..1); o.a è la trasparenza. Serve per lo Sputo, la Pioggia, le monete a terra e le finte che scoppiano.
N3.mimicPlank(x, y, z, rot, sc, o): un'asse di quercia rotta lunga 16, con due chiodi (o.band: con un pezzo di fascia d'ottone). Serve per le finte che scoppiano, le schegge dei colpi forti e lo strappo dell'Incastrato.
I segni a terra li fa il cervello sul pavimento, come b3mark: l'impronta del morso (un cerchio di dentini incisi), i tre graffi, la polvere d'oro.
Per la pagina «prima e dopo»: N3.meta.mimic2.old con il Mimic di oggi.

15. OPZIONI DEL MODELLO
- o.p2: la fase 2;
- o.z: l'altezza data dal gioco nel balzo e nei saltelli;
- o.reach: la lunghezza in px della lingua della Frustata;
- o.reach3 ([sinistra, centro, destra]) e o.fan (angoli, di serie [−0,45, 0, 0,45] rad): per la Frustata a tre;
- o.last: l'ultimo balzo, che resta piantato;
- o.mat: 'moss', 'ash', 'mud' o 'frost';
- le opzioni della cassa (o.shake, o.lid, o.gold, o.good, o.slide, o.real, o.breath), valide anche sulla posa chest del modello;
- o.noFx: niente effetti della mossa.
Ogni mossa dipende solo da p; idle, walk, chest e daze si chiudono su sé stesse.

16. CONTROLLI
LOWFX:
- niente bagliori: occhi e gola solo colorati, e la perla di luce diventa il pezzo che cambia colore;
- niente ragnatele, bava, bottoncini, monete che saltano, né righe di luce nelle fughe;
- il materiale del posto resta fermo;
- nella Pioggia 4 monete invece di 6.
Tempo di disegno:
- mediana massima 1,2 ms, come il Golem; la cassa chiusa al massimo 0,4 ms (nel Gioco delle Casse ce ne sono tre insieme);
- assi, fasce e angolari come quadrilateri sulle facce, calcolati una volta (Path2D); denti e bottoncini solo sulle facce che si vedono.
Direzioni da guardare:
- da dietro mai occhi, denti né velluto (a bocca spalancata si vede il dorso del coperchio dritto);
- di lato appena un occhio;
- nella cassa chiusa nessuna lucina;
- il ritaglio del dentro sull'apertura, in 8 direzioni;
- la lingua stesa con l'ordine di disegno giusto quando lui guarda via dalla telecamera;
- la Tagliola sotto i 65°;
- nella mantide, le braccia alzate davanti al coperchio solo dal lato vicino.
Pavimenti difficili: sul ghiaccio (capitolo 4) le zampe pallide si staccano grazie al contorno, alle polsiere e cavigliere d'ottone e al tono d'ombra #85786a sul lato lontano: va provata quella stanza. Sulla lava il legno scuro si regge su ottone, oro e zampe chiare.
Mai sangue né carne: il dentro è velluto trapuntato coi bottoncini, la lingua è rosa da cartone, le crepe della fase 2 sono del legno e dell'ottone.

## Le mosse del modello

| id | nome | secondi | descrizione |
|---|---|---|---|
| `idle` | Fermo | 3 | Ciclo. Piantato sulle quattro zampe come un mobile. Il coperchio respira da 8° a 15° (cima a 112–114) e con lui pulsano l'oro dentro e il puntino nel buco della serratura. Gli occhi guardano a sinistra a p .10–.25 e a destra a .35–.50, poi restano sull'eroe. A .30–.45 la lingua lecca l'orlo da sinistra a destra. A .15, .20 e .25 le tre dita della mano destra tamburellano (le punte si alzano di 4). A .62 uno scatto secco di 2 px e il clac del coperchio (è il battito delle palpebre). A .70–.90 la cassa si piega di 4° di lato, curiosa. Fase 2: coperchio a 25° ±3°, lingua fuori di 30, l'occhio della serratura che si guarda intorno per conto suo, fughe arancio che pulsano. |
| `walk` | Corsa a scatti | 0.8 | Ciclo. p 0–.55, lo scatto: quattro passi rapidi a coppie in diagonale (braccio sinistro con gamba destra, poi il contrario; appoggi a .11, .22, .33 e .44). Cassa bassa di 4 e inclinata in avanti di 6°, il coperchio batte a .12 e .40, saltello di 2 a ogni passo, le braccia a stampella avanzano di 30 per passo. p .55–1, il fermo: si blocca a metà passo con un piede appena alzato; a .60 si raddrizza e il coperchio si piega verso l'eroe, gli occhi guizzano; a .80 un artiglio batte una volta. Il gioco lo muove solo per p < .55. |
| `hit` | Colpito | 0.6 | Solo per le pagine: in battaglia i boss non la usano. A .00–.10 il coperchio si chiude di colpo, la cassa rincula di 4 con un rollio di 6° e gli arti si allargano; gli occhi restano strizzati fino a .40; a .10–.60 torna in posa con un brivido. |
| `chomp` | Il Morso | 1.8 | Tin a .03 e .10; a .12–.35 la luce corre lungo le cinghie del coperchio e a .35–.45 i denti del coperchio si accendono. Preparazione .00–.45: si abbassa (cassa a 50), braccia alte e larghe da mantide (mani a 10, ±46, 124), coperchio a 110°, gola d'oro, occhi stretti. Colpo .45–.72: si butta in avanti (15°) remando con le braccia; tre morsi, CIAC a .50, .58 e .66. Ritorno: a .74 sbatte il coperchio a terra (30° in avanti), a .82 lo strappa via, a .85–.95 lo scuote di ±6°, poi la posa. |
| `tongue` | La Frustata | 1.6 | Tin a .03 e .10; a .20–.50 la lingua arrotolata si accende dalla radice alla punta. Preparazione .00–.50: si piega indietro (−15°, più alto di 6), coperchio a 100°, lingua arrotolata in bocca. Colpo .50: la lingua schizza dritta sul pavimento fino a o.reach in .025 (scende a terra nei primi 30 px, poi stesa a 2 dal pavimento). A .53–.75 due onde corrono fino alla punta, che schiaffeggia il pavimento a .60 e .70. Ritorno: si riavvolge a .75–.90 (slurp), coperchio a riposo a .90–1. |
| `tongue3` | La Frustata a tre (fase 2) | 2 | Fino a .36 come la Frustata (tin a .03 e .09, si piega indietro, lingua accesa). Schiocchi in fila: a .40 a sinistra (o.fan[0], −26°), a .56 al centro, a .72 a destra (+26°), ognuno fino alla sua lunghezza in o.reach3. Ogni schiocco: fuori in .03, frusta fino a +.07, poi la lingua si alza e gira verso la direzione dopo. Ritorno .80–1. |
| `grab` | L'Assaggio: la presa | 1.5 | Tin a .03 e .09; a .10–.35 la luce scende dai medaglioni lungo le braccia, a .35–.55 polsiere e punte degli artigli sono accese. Preparazione .00–.55: si abbassa (cassa a 52), braccia larghe e basse in avanti come un abbraccio (mani a 30, ±70, 20), artigli spalancati, coperchio a 30°, la lingua lecca l'orlo a .20–.40. Colpo .55–.62: le braccia si chiudono di scatto davanti (mani a 46, ±4, 14), gli artigli si incrociano. Se manca: a .62–.80 graffia il pavimento tirando indietro le mani, a .80–.92 le scuote stizzito, poi torna in posa. |
| `gulp` | L'Assaggio: il boccone | 1.2 | L'eroe è dentro. A .00–.12 le mani spingono il boccone in bocca e il coperchio sbatte (cassa giù di 4, «Gnam!»). A .12–.55 tre masticate a .20, .33 e .46 (il coperchio si apre a 15° e sbatte): la cassa si gonfia fino a 1,06, le assi si piegano, salta una moneta da una fuga, occhi a mezzaluna felici. A .55–.70 gli occhi si spalancano e si gonfia fino a 1,12. A .75 lo sputo: coperchio a 120°, lingua fuori, rinculo («Bleah!»). A .80–1 scuote il coperchio, disgustato, e torna in posa. |
| `coins` | Sputo d'oro (Pioggia d'oro con o.p2) | 1.6 | Tin a .03 e .10; a .15–.50 tutte le fughe e il buco della serratura si accendono d'oro e le monete sbattono (tremito di 1 px a 18 Hz). Preparazione .00–.50: in punta di zampe (cassa più alta di 8), assi incurvate (1,08 di lato), coperchio a 25°. Colpo .50–.65: si butta in avanti di 18° a bocca spalancata (100°) e il modello disegna lo sbuffo di monete fino a .62; con o.p2 a .55 anche la fontana verso l'alto. Ritorno: a .72 tossisce l'ultima moneta, a .80–.90 si lecca il dente d'oro, poi si sgonfia. |
| `leap` | La Tagliola: un balzo | 1.1 | Il gioco lo ripete 2 o 3 volte e dà l'altezza con o.z. A .00–.20 si accuccia (cassa a 46), le ginocchia fanno clic, le cavigliere si accendono, braccia indietro, coperchio a 90°. A .20–.93 in volo si inclina in avanti fino a 60° (mai oltre 65°) a bocca spalancata in giù, gambe che penzolano, braccia aperte come ganasce. A .93–1 ricade e il coperchio sbatte a terra (CLANG a .95), poi rimbalza nella posa accucciata. Con o.last resta piantato (35°, bordo del coperchio e orlo nel pavimento) e continua in stuck. |
| `stuck` | Incastrato | 1 | A .00–.80 i denti sono nel pavimento: cassa inclinata in avanti di 35° col fondo in alto, bocca rimasta aperta di 40° verso terra con una pozza di luce d'oro sul pavimento e qualche moneta che scappa. Le gambe scalciano in aria (due calci alternati al secondo), le braccia fanno leva coi gomiti in alto. A .80 si stacca con uno strappo e una pioggia di schegge; a .80–1 si scrolla di ±5° e torna in posa. |
| `hide` | Torna cassa | 0.8 | A .00–.30 le gambe si piegano sotto il fondo (le ginocchia scrocchiano). A .10–.45 le braccia vengono risucchiate nei buchi e a .45 i medaglioni si chiudono. A .50 la cassa si siede a terra con un tonfo (da 60 a 0). A .55–.70 gli occhi si spengono come braci e a .60 il coperchio si chiude. Da .70 è uguale alla posa chest, aspetto della fase 2 compreso. |
| `chest` | Cassa chiusa | 1 | Ciclo fermo. È la cassa delle casse gemelle e delle finte, identica a N3.mimicChest: niente zampe, occhi o lucine, medaglioni chiusi, o.mat sulla fascia di fondo, l'aspetto della fase 2 spento. Opzioni: o.slide (si inclina di 6° dove scivola), o.real (lampo degli occhi, coperchio su di 2°), o.breath (coperchio su di 2°), o.shake (tremito della cassa sbagliata: moneta a .3, occhi da .6), o.lid, o.gold e o.good (la cassa buona che si apre: velluto e oro, niente denti). |
| `pop` | Salta fuori | 0.5 | È hide al contrario, più svelto. A .00–.30 zampe e braccia scattano fuori tutte insieme, i medaglioni si spalancano e il coperchio si spalanca. A .40 un saltello (la cassa più alta di 10). A .80 atterra nella posa di riposo. |
| `daze` | Stordito | 1 | Ciclo. In piedi ma molle: la cassa ondeggia in tondo di ±6° e le ginocchia cedono un poco. Il coperchio pende aperto a 60° con la luce d'oro, la lingua penzola di lato, le pupille girano a spirale, le stelline girano sopra il coperchio. |
| `rage` | Ha fame! (fase 2) | 2.4 | A .00–.20 si blocca e trema (12 Hz, 1,5 px), le monete sbattono, le fughe sfarfallano. A .20–.45 si alza (anca da 60 a 66) con le braccia alte. A .47 la piastra della serratura si crepa; a .50–.58 il buco della chiave si apre come una palpebra, ed è il terzo occhio (raggio 7, pupilla a buco di serratura): guarda a sinistra e a destra a .58–.62, poi si pianta davanti. A .60–.75 il coperchio si spalanca a 120° con le cerniere che cigolano, la luce passa all'arancio ed esce dalle fughe, gli occhi diventano rossi. A .75–.95 il ruggito nella cassa: il coperchio sbatte tre volte, una fontana di monete, le mani battono a terra a .78 e .86. A .95–1 la posa nuova: cima a 123, coperchio a 25°. |
| `taunt` | Presa in giro | 1.1 | I denti a molla. A .00–.12 si drizza (più alto di 6) con le mani davanti. A .12–.60 il coperchio batte sei volte velocissimo da 0° a 50° (clac-clac-clac), la cassa saltella tre volte, gli artigli si sfregano come un avaro che conta le monete, il dente d'oro luccica. A .60–.80 la lingua lecca tutto l'orlo. A .82 un singhiozzo, e una moneta salta fuori, fa un arco e cade davanti (hic!). A .88–1 si ricompone. |
| `lure` | L'esca | 1.4 | A .00–.25 si abbassa (cassa a 52), socchiude il coperchio a 20° e la luce d'oro esce sul pavimento. A .25–.75 il dito di mezzo della mano vicina si alza e si piega due volte, a .35 e .55 (vieni qui), con le monete che tintinnano piano. A .75–1 richiude a riposo con un'ondeggiata furba. |
| `enter` | Entrata | 2.8 | Parte dalla cassa chiusa uguale alla cassa gemella. A .00–.10 un balzo indietro (il gioco la sposta di 50 px; il modello la alza di 14 e ricade con un tonfo a .10). A .10–.22 trema sempre più forte, il coperchio sobbalza, a .14 gli occhi d'ambra nella fessura, a .18 la bava, spuntano i denti. A .22–.45 escono le gambe e la cassa sale in tre scatti a .25, .33 e .41 (fondo a 20, 40, 60). A .45–.62 i medaglioni si aprono (.46 destro, .53 sinistro), le braccia si srotolano con le giunture che fanno clic, a .60 le dita tamburellano. A .62–.80 il coperchio si spalanca a 110° con un cigolio lungo (le ragnatele si strappano), a .70–.80 la lingua lecca l'orlo, gli occhi si piantano sull'eroe. A .82 sbatte le mani a terra, a .84–.94 urla col coperchio che sbatte, a .94–1 la posa di riposo. |
| `die` | Sconfitta | 3.4 | Clou a .65 (2,2 s). A .00–.20 barcolla indietro, il coperchio sbatte a .05 e .12. A .20–.45 le gambe si piegano come una sedia pieghevole (.25 la destra, .32 la sinistra, mai spezzate) e a .40 la cassa si siede con un tonfo e la polvere. A .45–.65 le braccia vengono risucchiate nei buchi (slurp, medaglioni chiusi a .55 e .60) e a .60 gli occhi si spengono con due sbuffi di fumo. A .65 il coperchio salta via con un boing, gira e a .80 ricade dietro: fontana di monete nella luce d'oro. A .70 la lingua ricade molle sull'orlo; a .85–1 resta una vecchia cassa vuota che sfuma. Con o.p2 l'occhio della serratura si chiude a .60 e la luce torna d'oro prima di spegnersi. |

## Le abilità nel gioco

CERVELLO: src/js/89-mimic-nuovo.js
- Si accende solo se c'è N3.mimic2, come G2ON del Golem. Per le prove c'è il modello finto anteprime/boss2/mimic_stub.js: il Mimic di oggi che recita le mosse nuove.
- Come per il Golem: N3.mimic = N3.mimic2, e il disegno di oggi resta in N3.meta.mimic.old. Un mimicUpd nuovo (lo chiama 13-entrate-boss.js), con ogni stato che ha il nome di una mossa del modello (b3go, b3tick, b3k e b3at di 81-boss3-base.js); il colpo vero parte nel suo fotogramma.
- Si spengono drawMimicDS, il disegno 2D e i pericoli di oggi: le G.lines rosse, i proiettili 'coinp' e il quake.

DATI
- ET.mimic: r 30 (era 24), cdmg 20 (era 24). Restano uguali vita (900 × (1 + (effRoom − 1) × 0,14), la mette 42), oro 45, XP 60, nome e titolo.
- BOSS_INTRO.mimic 2,8. 42 mette m.intro = 1,3: il bossIntro del Mimic lo riscrive a ogni fotogramma, come fa il Golem.
- BDEATH.mimic {dur:3.4, clou:2.2, snd:'coin'}.
- B2.mimic resta plain come oggi: niente alone, aura o anello di carica dietro. La luce è la sua: ELIGHT.mimic, luce calda dalla bocca, raggio 50 a riposo e 110 a bocca spalancata, arancio nella fase 2, spenta quando è nascosto. Così nel Gioco delle Casse niente tradisce la cassa vera.
- B3S.add('mimic'), per la voce e la personalità.
- Il Mimic non usa bossLvl (14-update.js lo esclude già): niente anelli di sfere nelle arene 5–12.
- Nella fase 2 tutto il cervello va con dt × 1,3, come il Golem (64-nemici-3d.js disegna già il modello al passo 1,3). Fanno eccezione il Gioco delle Casse e lo Stordito, che vanno in secondi veri. Tutti i tempi qui sotto sono quelli della fase 1. I danni sono prima di DMG(). Avvisi rossi 229,72,77, come nel resto del gioco.
- Regole da primo boss, perché esce anche nella prima arena (stanze 3, 4, 6–9) e nell'Abisso: mai due attacchi insieme; ogni danno ha un avviso a terra di almeno 0,8 s nella fase 1, quindi almeno 0,6 s nella fase 2; dopo ogni mossa 1,1–1,5 s di corsa a scatti.
- Il contatto (cdmg) è spento quando è nascosto (e.hidden), in volo (z), nella corsa del Morso (e.air) e nel Gioco delle Casse.
- I pericoli stanno in G.m2, che buildRoom azzera:
 - warn: gli avvisi a terra;
 - coins: le monete in volo;
 - floor: le monete a terra;
 - rain: le monete che ricadono;
 - tongue: la lingua stesa;
 - gulp: l'eroe in bocca;
 - shell: il Gioco delle Casse.
 Si disegnano avvolgendo drawHazards2Ground e drawHazards2Air, come il Golem.
- Quello che il gioco passa al modello (N3G.opt.mimic): p2, z, reach, reach3, fan, last, mat (dal tema della stanza: moss, ash, mud o frost) e, nella posa chest, real, slide e breath. N3G.wp.mimic è il passo della corsa a scatti col suo orologio (e.wt), come il Golem.
- Il Mimic nascosto si disegna normalmente, non trasparente. La cassa vera e le finte devono avere la stessa ombra: controllare che per il tipo mimic non resti l'ombra 2D di 16-creature.js (o usare ESHADOW).

CORSA A SCATTI (walk)
- Il ciclo è quello del modello, 0,8 s. Si muove solo per p < .55, a 140 px/s (in media 77 px/s; oggi 78). Per p ≥ .55 sta fermo e si gira verso l'eroe (e.face = a).
- Ogni scatto va verso un punto di fianco all'eroe, a 80–120 px da lui e a ±60° dalla linea; il lato cambia ogni due scatti. Mai addosso: il contatto fa male solo se ci vai contro tu.
- Suoni: mimicStep a .11, .22, .33 e .44; un tintinnio piano di monete a ogni scatto.
- Ogni 2–3 s una moneta salta fuori dalla fessura (solo una scintilla). Una frenata su tre lascia tre graffi a terra.
- Fra una mossa e l'altra 1,1–1,5 s di corsa.

IL SEGNALE A ORECCHIO
Quando parte una mossa suonano due tintinnii di moneta, «tin-tin», nel momento in cui il modello sveglia la luce (come il «tum-tum» del Golem, nel tempo del boss): chomp a .03 e .10, tongue a .03 e .10, tongue3 a .03 e .09, grab a .03 e .09, coins a .03 e .10, leap a .02 (solo il primo balzo). Poi il verso della mossa (B3CUE).

COLPO IN BOCCA! (+50%)
- hurtE avvolto: se la bocca è spalancata e il colpo viene da davanti (l'eroe entro 70° da e.face), il danno × 1,5.
- Bocca spalancata: chomp k < .45, tongue k < .50, tongue3 k < .36, coins k < .50, taunt k da .12 a .60. Valgono da ogni lato stuck k < .80 e daze.
- La prima volta nella partita compare la scritta «Colpo in bocca!» (#ffd84a, grandezza 18) sopra di lui; a ogni colpo così, un «ding» e una scintilla d'oro dalla bocca.
- Il coperchio socchiuso della fase 2 non conta.

LE ABILITÀ
1. IL MORSO (chomp, 1,8 s)
- Avviso, a k 0: una corsia rossa larga 44 dal centro verso l'eroe. La corsa è min(180, distanza dal primo ostacolo o muro − 30); la corsia è lunga la corsa più 30.
- Sulla corsia tre impronte di denti (mezzelune coi dentini) dove si chiuderà la bocca: a 62, 117 e 172 px, scalate se la corsa è più corta. Si accendono una dopo l'altra, a 1/3, 2/3 e 3/3 dell'avviso.
- Colpo: da k .45 a .72 corre lungo la corsia a 380 px/s (e.air: contatto spento). I morsi (CIAC) sono a .50, .58 e .66. Danno 22, una volta sola, se l'eroe è entro 24 + P.r × 0,5 dal punto della bocca, 28 px davanti al centro.
- Se arriva a un ostacolo o a un muro, si ferma e lo morde: l'ostacolo trema e si crepa (ENV2.rocks, ENV2.chunks di legno e pietra), resta a terra l'impronta del morso, shake 3.
- Fase 2: due corse di fila; la seconda corsia appare all'inizio del secondo Morso, verso dove sei (0,62 s veri).
- Si schiva con un passo di lato (22 + 12 px), o mettendo un ostacolo in mezzo.

2. LA FRUSTATA (tongue, 1,6 s)
- Avviso, a k 0: una linea rossa larga 18 dalla bocca verso l'eroe, fino al primo ostacolo o muro, al massimo 240 px (o.reach è quella lunghezza).
- Colpo: lo schiocco a .50. Da .50 a .62 danno 20, una volta, se l'eroe è entro 9 + P.r × 0,5 dalla linea.
- Gli ostacoli la fermano: ci si ripara dietro. Non tira l'eroe verso di sé (quella è la mossa del Re Rospo).
- Si schiva con un passo di lato o dietro un ostacolo.

3. LA FRUSTATA A TRE (tongue3, 2,0 s; nella fase 2 prende il posto della Frustata)
- Tre linee insieme a k 0, a −26°, 0° e +26° (o.fan, o.reach3).
- Schioccano in fila: a .40 la sinistra, a .56 la centrale, a .72 la destra. Ogni linea si accende di più 0,15 s prima del suo schiocco e si spegne subito dopo.
- Danno 18 per linea, una volta, nelle finestre .40–.47, .56–.63 e .72–.79.
- Si schiva uscendo dal ventaglio, o tornando al centro dopo che la linea centrale è schioccata.

4. L'ASSAGGIO (grab 1,5 s + gulp 1,2 s)
- Quando: alla fine di una corsa, se l'eroe è entro 85 px e sono passati almeno 6 s dall'ultimo Assaggio (4 s nella fase 2). Prende il posto della mossa dopo, che resta in coda.
- Avviso, a k 0: un ventaglio rosso davanti a lui, raggio 72, apertura 130°.
- A .58 controlla: se l'eroe è nel ventaglio (distanza < 72 + P.r × 0,5, entro 65° da e.face), non sta scattando e non è invulnerabile, è preso e si passa al boccone. Altrimenti la presa finisce (graffi a terra).
- Il boccone (G.m2.gulp):
 - l'eroe sparisce: si avvolge drawHero, niente eroe, ombra o barretta della vita;
 - resta fermo nella bocca: dopo ogni update P.x, P.y vanno al punto 24 px davanti; niente scatto né Super;
 - P.inv resta sopra 0,3;
 - il Mimic è nascosto (e.hidden): niente bersaglio, niente contatto;
 - a k 0 la scritta «Gnam!» sopra di lui.
- Lo sputo, a .75:
 - l'eroe riappare 70 px davanti, in un posto libero lontano da muri e ostacoli (b3spot), con un saltello (P.hopT = .38);
 - in quest'ordine: P.inv = 0, hurtP(24 × DMG()), P.inv = 1;
 - «Bleah!» sopra l'eroe, poi la presa in giro.
- Se il Mimic muore o la stanza finisce mentre l'eroe è in bocca, lo sputa subito, senza danno.
- In bocca si sta 0,9 s (0,7 s nella fase 2).
- Si schiva uscendo dal ventaglio o con lo scatto; meglio non stargli incollati.

5. SPUTO D'ORO (coins, 1,6 s, fase 1)
- Avviso, a k 0: sette linee rosse tratteggiate a ventaglio (70° in tutto, una ogni 11,7°). Ogni linea va dalla bocca fin dove la sua moneta si fermerà (fra 170 e 230 px, o al primo ostacolo) e ha un cerchietto in fondo. Le linee si riempiono dalla bocca in fuori.
- Colpo: a .50 partono sette monete 3D (N3.mimicCoin) a 190 px/s, raso terra con due rimbalzi (alti 14 e 6 px). Danno 12 solo mentre volano (z < 18, raggio 7 + P.r × 0,4). Contro un ostacolo cadono lì.
- A terra diventano monete vere: valgono 1 oro come quelle del gioco, si raccolgono a 16 px (G.gold, G.goldRun, sfx coin) e si disegnano distese che luccicano. Restano 3 s, al massimo 12 insieme: le più vecchie spariscono in un luccichio.
- Si schiva uscendo dal ventaglio, o stando lontano, dove le linee si allargano.

6. PIOGGIA D'ORO (coins con o.p2, fase 2)
- Come lo Sputo, ma con 9 monete nel ventaglio.
- In più, a .50, sei cerchi rossi di raggio 18: uno sull'eroe, uno dove sta andando (posizione + velocità × 0,8 s), quattro a 50–90 px intorno. Mai sugli ostacoli né fuori dalla stanza.
- A .55 la fontana: sei monete salgono e ricadono sui cerchi 1 s dopo lo sputo. Danno 16 nel cerchio; poi restano a terra come le altre.
- Con LOWFX i cerchi sono 4.

7. LA TAGLIOLA (leap 1,1 s × 2, × 3 nella fase 2, poi stuck 1 s)
- Avviso, a k 0 di ogni balzo: un cerchio rosso di raggio 36 dove sei, al massimo a 220 px da lui (260 nella fase 2). Mai su un ostacolo: se ci cade, va spostato in un posto libero vicino. Sul bordo una corona di otto dentini bianchi che si accendono uno dopo l'altro in giro, e dentro la sua ombra che cresce.
- Volo: da .20 a .93 (z fino a 80, passato al modello come o.z); in aria non si può colpire.
- Atterraggio a .93: danno 20 (24 l'ultimo balzo) entro 36 + P.r × 0,4. Shake 5, polvere dal soffitto (ENV2.fall 4), gli ostacoli vicini tremano (ENV2.rocks), a terra resta l'impronta del morso.
- L'ultimo balzo ha o.last e passa a stuck: 1 s fermo, con il +50% del Colpo in bocca da ogni lato; a .80 si stacca, con le schegge.
- Niente onda d'urto: quella è del Golem.
- Si schiva uscendo dal cerchio.

8. IL GIOCO DELLE CASSE (fase 2: la prima mossa dopo la rabbia, poi ogni cinque mosse, al massimo due volte per lotta; tutto in secondi veri)
- Se l'eroe è a meno di 120 px, prima fa uno scatto indietro lontano da lui (corsa veloce per 0,4 s).
- Servono tre posti: il suo e due ai lati, a 110–140 px da lui, perpendicolari alla linea verso l'eroe. Tutti a 130 px o più dall'eroe, ad almeno 40 dai muri e lontani dagli ostacoli (k.r + 30). Se non ci sono, salta la mossa e fa il Morso.
- 0 s: hide. Il Mimic è nascosto (e.hidden, e.air). Compaiono due cerchi rossi di raggio 26 dove cadranno le finte; c_hide.
- 0,25–0,80 s: le due finte cadono dall'alto in 0,55 s, da 260 px come le casse gemelle. A 0,80 s toccano terra: 14 di danno a chi è nel cerchio, shake 4, boom, polvere; banner «Tre casse!» · «Trova quella vera».
- Le finte stanno in G.cc con uno stato loro ('m2', che updTwinChests ignora) e si disegnano con N3.mimicChest nella lista ordinata per y. Non sono nemici: niente oro, uccisioni o barre.
- La vera si disegna col modello nella posa chest. Tutte e tre guardano la telecamera (faccia π/2), con la stessa ombra e le stesse opzioni: devono essere uguali al pixel.
- 1,0–2,5 s: tre scambi da 0,5 s (la seconda volta quattro da 0,42 s). Due casse alla volta si scambiano di posto su due archi: una passa davanti, l'altra dietro, con un saltello (z 0 → 16 → 0) e o.slide. All'inizio di ogni scambio la vera accende gli occhi per 0,1 s (o.real). Due tonfi di legno per scambio; le tre ridacchiano a turno dalle loro posizioni, così la voce non tradisce la vera.
- Poi 3 s per scegliere: il «?» sopra le tre casse, come nelle casse gemelle; la vera ogni 0,9 s alza il coperchio di 2° (o.breath). Si sceglie toccando una cassa (touching come in 42, rx 24, ry 12).
- Se tocchi la vera: «Trovato!» in oro. Le finte fanno «Vuota!»: uno sbuffo, assi (N3.mimicPlank) e 3 monete vere ciascuna. Il Mimic fa pop e poi daze per 2 s veri: si colpisce col +50% da ogni lato.
- Se tocchi una finta: «Vuota!», scoppia in assi e 3 monete, e l'altra pure. La vera fa pop e ti salta addosso con un balzo della Tagliola (cerchio 0,8 s veri, danno 24), senza incastro.
- Se non scegli entro 3 s: le finte fanno «Vuota!» da sole e la vera fa pop e il balzo, come sopra.
- Dall'hide al pop non si può colpire: al massimo circa 5,5 s, se non scegli.

9. L'ESCA (lure, 1,4 s)
Quando la personalità dei boss lo fa chiamare (7 s senza essere colpito: b3taunt con 'laugh2'), il Mimic fa lure al posto della presa in giro. Poi, se sei a 140 px o più, fa la Frustata.

10. LA PRESA IN GIRO (taunt, 1,1 s)
Come i boss nuovi (88-boss3-voci.js): quando ti colpisce, subito se è libero (sta correndo), altrimenti appena finisce la mossa. Mai fra due colpi; dopo l'Assaggio sempre. Nel cervello: durante taunt sta fermo e ti guarda, poi corre di nuovo per 0,3–0,55 s prima della mossa dopo.

ORDINE DELLE MOSSE
- Fase 1: Morso, Sputo d'oro, Frustata, Tagliola, poi da capo. L'Assaggio prende il posto della mossa dopo quando gli stai addosso e il cooldown è passato; l'esca porta la Frustata.
- Fase 2: Gioco delle Casse, Morso doppio, Pioggia d'oro, Frustata a tre, Tagliola tripla, poi di nuovo il Gioco delle Casse (al massimo due volte). L'Assaggio può arrivare ogni 4 s quando gli stai addosso.

FASE 2 (a metà vita)
- Non scatta mai durante la corsa del Morso, un balzo, il boccone o il Gioco delle Casse.
- rage, 2,4 s:
 - e.shell = 9: non si può colpire, come il Golem;
 - banner «Il Mimic ha fame!» · «Fase 2», bossRage(e,'255,120,60'), barra 'rage';
 - G.m2 ripulito (avvisi e monete in volo); b3say 'angry';
 - a .20 b3torch('gold', .8);
 - a .47 lo schiocco della serratura (sfx click e un suono di vetro);
 - a .60 il cigolio;
 - a .75 b3torch('fire', 4) e la stanza trema (shake 8, ENV2.rocks su 400 px);
 - a .78 e .86 le mani a terra (shake 4).
- Alla fine e.shell = 0, e via col Gioco delle Casse.

ENTRATA (bossIntro avvolto per 'mimic', 2,8 s; e.st = 'enter' e il modello la recita tutta)
- A ogni fotogramma e.intro = max(0, 2,8 − t).
- Da 0 a 0,28 s lo sposta di 50 px lontano dall'eroe, in un posto libero (b3spot), e lo gira verso di lui.
- Tonfi a .10, .25, .33 e .41 (boom piccolo, shake 2); clic a .46 e .53 (sfx click); mimicWake a .62.
- A .82 le mani: shake 4, dustRing, vib.
- A .84 b3say(e,'cry'), tre anelli come il Golem, shake 6.
- Banner, barra e musica partono come oggi, da 42, quando il Mimic nasce. Niente danni durante l'entrata.
- Alla fine e.si = −1 e la corsa (0,9 s).

CASSE GEMELLE (42 non si tocca)
- drawTwinChest avvolto: la cassa si disegna con N3.mimicChest ai piedi dove nascerà il Mimic (c.x, c.y + 4), faccia π/2, con o.mat. Gli stati:
 - drop: cade dall'alto come oggi;
 - idle: le due casse uguali;
 - open: o.good, o.lid = min(1, k/0,35), o.gold;
 - poof: si rimpicciolisce come oggi;
 - shake: o.shake = k/1,1.
- Il «?» resta.
- spawnTwinChests avvolto: per ogni cassa, le rocce entro k.r + 36 vanno in c.crush, perché il corpo nuovo è più grande.

SCONFITTA
- snapBoss restituisce {live:1}. BDIE.mimic dal vivo: N3.mimic(c.x, c.y + 8, c.face, 'die', p, 1, {p2:c.p2, noFx:LOWFX}).
- A 1,36 s (p .40) il tonfo e la polvere. Dal clou (2,2 s) per 1 s una fontana di monete (cpart 'coin') con i tintinnii. b3say 'die'.
- Il premio resta quello del gioco (45 oro): nessuna moneta in più. La stanza si chiude quando il corpo ha finito.

VOCE E PERSONALITÀ (B3VO.VB.mimic, come il Golem: legno, denti e monete, mai orrore)
- cry: legno che scricchiola e un ruggito cavo che rimbomba come in una botte.
- angry: lo stesso, con lo schiocco di metallo della serratura.
- laugh: denti che battono «ka-ka-ka-ka» col tintinnio delle monete.
- laugh2 (quando chiama): «hm-hm?» con le monete scosse piano.
- hurt: un «bonk» di legno vuoto con le monete che sbattono.
- die: un lamento che si sgonfia e una cascata di monete.
- win (se cadi): la stessa risata, più lenta, come chi conta le monete.
- Un verso per mossa (B3CUE.mimic):
 - chomp: «kraah!» col clac;
 - tongue e tongue3: «slurp»;
 - grab: «gnam», più c_spit «bleah!» allo sputo;
 - coins: «blorgh» con una cascata di monete;
 - leap: «hop!» solo al primo balzo, e il clang all'atterraggio;
 - hide: una risatina.
- b3sayMore: tintinnio di monete sotto cry, angry, laugh, win e die; legno che scricchiola sotto cry e angry.
- Restano le voci di oggi: mimicStep (le ossa che fanno clic) dai passi della corsa nuova, mimicBreath ogni 4–7 s mentre corre, mimicWake nell'entrata.
- Volume medio fra 0,07 e 0,11.
- Le voci si preparano (B3VO.prep('mimic')) appena si entra nella stanza delle casse gemelle (G.ccRoom, o la 7 di ogni dieci dell'Abisso) e quando il Mimic c'è.

ARENA CHE REAGISCE (nel cervello, come b3fx)
- Il Morso contro un ostacolo: l'ostacolo trema e si crepa, schegge di legno e di pietra, l'impronta del morso a terra.
- Le frenate: tre graffi, una frenata su tre.
- La Tagliola: l'impronta del morso, polvere dal soffitto, ostacoli che tremano.
- Sputo e Pioggia: monete che luccicano a terra per 3 s.
- Le finte che scoppiano: assi e monete.
- La rabbia: torce d'oro e poi arancio, la stanza che trema, polvere d'oro a terra.
- I colpi forti e il «Colpo in bocca!»: due o tre schegge di legno (N3.mimicPlank piccole).
- I segni nuovi (morso, graffi, polvere d'oro) si fanno nel cervello, come b3mark.
- La reazione 'mimic' che c'è oggi in 52-boss2-arena-reagisce.js non fa danni, perché non ci sono più G.lines né quake.

COSA TENERE DEL BOSS DI OGGI
- Le casse gemelle (42) e il modo in cui compare: una volta per partita dopo una stanza ripulita (stanze 3, 4, 6–9; nell'Abisso la 7 di ogni dieci).
- La stanza: è quella normale appena ripulita, con i suoi ostacoli. Nessuna stanza speciale, nessun cerchio di rune.
- Nessun servitore: le finte non sono nemici.
- La vita, l'oro 45, l'XP 60, il nome e il titolo, la musica (bmIn('mimic')), la barra che si rompe in monete (BBFX.mimic), le voci di oggi.

PROVE (registro BCL.mimic, come il Golem)
- n: 'Il Mimic', arena: 0, p2: true.
- enter(): arena 1, stanza 4 normale, vuota e ripulita; poi come fa 42 quando c.k supera 1,1: makeE('mimic', x, y + 4, 0), vita 900 × stanza, intro 2,8, G.state 'play', porta chiusa, barra, banner, bmIn('mimic'). Con enter({casse:true}) fa tutto il giro delle casse gemelle.
- moves: ['chomp','coins','tongue','leap','stuck','grab','gulp']; moves2: ['rage','hide','chest','pop','daze','tongue3'].
- hz(): avvisi, corsie, linee, ventagli, cerchi, monete in volo, monete a terra, pioggia, casse finte, inghiottito (0 o 1).
- voice: ['cry','laugh','angry','die'].
- Difficoltà contro il Mimic di oggi: tests/boss2diff.js mimic, già nell'arena 1.

RISCHI E COSE DA REGOLARE
- L'Assaggio toglie il controllo per 0,9 s. Se a Denis pesa, c'è la riserva: il Mimic tiene l'eroe negli artigli per 0,5 s senza nasconderlo, lo morde e lo lancia via di 70 px.
- Il Gioco delle Casse arriva al massimo due volte e non va mai allungato.
- Il «Colpo in bocca!» accorcia la lotta, il boccone e le casse la allungano: misurare.
- Le monete a terra danno un po' d'oro in più (al massimo una ventina a lotta): misurare.
- Tutti i numeri sono da regolare giocando.
- La riga della guida (44-guida.js) e le scritte nuove si aggiornano solo dopo il sì di Denis. Proposta per la guida: «Mini boss nascosto in una delle due casse: morde, frusta con la lingua, ti assaggia e ti risputa, sputa oro e nella fase 2 ti sfida al gioco delle tre casse».

## Voti del direttore artistico

«affamato» 8,6/10: VINCE. È il Mimic alla Dark Souls approvato l'8 ottobre diventato un boss vero, come chiede il compito («parti da lì»). La sagoma si legge in un attimo anche piccola: una cassa con gli occhi, i denti e i trampoli, alta tre volte l'eroe. È cupo nel modo giusto per la Classica: occhi d'ambra nel buio sotto il coperchio, l'oro dentro che illumina i denti dal basso come una torcia sotto il mento. Le mosse sono tutte «da forziere»: morde, ti assaggia e ti risputa, ti tira le sue monete, si chiude come una tagliola. La fase 2 è la più forte delle tre: la serratura si apre, ed era un occhio. Si fa bene con la cassetta C3: il modello di oggi in boss2.js ha già la cassa con le facce, il coperchio a cerniera, gli arti a due ossa con ik e la lingua a catena.
Difetti:
- l'avviso è sparso: ogni mossa ha un segnale diverso e manca un «cuore» unico come la runa del Golem;
- 18 mosse sono tante per un mini boss;
- l'Assaggio toglie il controllo all'eroe;
- il Gioco delle Casse senza scelta è solo una schivata;
- ha quattro zanne grandi oltre alle file di denti;
- le zampe pallide si perdono sul ghiaccio.

«ragno» 7,2/10. Ha il segnale migliore, il più vicino al Golem: l'oro della parte che sta per colpire si accende e i nodi del legno contano alla rovescia. Il carattere da avaro funziona (il dente d'oro, le zampe che si sfregano) e ci sono due momenti spettacolari, il balzo dal muro e la gabbia di seta. Però butta via il Mimic approvato:
- sei-otto zampe da ragno al posto di gambe e braccia;
- otto occhi e un ragno gigante vanno oltre «un po' più cupi» per i bambini (lo scrive lui stesso);
- 176 px di apertura in una stanza normale piena di ostacoli;
- sei-otto zampe a due ossa costano tempo di disegno e si scambiano di posto nell'ordine di disegno;
- muri, telecamera, fili, tele e furto di monete sono cinque sistemi nuovi per un mini boss.
È un ragno vestito da cassa, non la cassa sbagliata.

«tesoro» 7,0/10. È l'idea più originale, con il giro di gioco più furbo: le monete che sputa restano a terra e sono tue, finché «Tutte mie!» non se le riprende. Il gioco delle tre casse, da scegliere toccando, richiama alla perfezione le casse gemelle, e lo stordito a gambe all'aria fa ridere. Però:
- la cassa diventa una mascella sotto una cupola d'oro, e così si perdono la lettura «cassa coi denti» e il coperchio che respira, che Denis ha approvato;
- un corpo di metallo liquido che scorre, cola e si rifà è il pezzo più difficile e più caro da fare bene con la cassetta;
- oro su oro, con le monete d'oro a terra, diventa una macchia;
- l'oro acceso è il contrario di «più cupo».

COSA ENTRA DALLE ALTRE DUE
Dal «ragno»:
- il segnale unico alla Golem: il tesoro si sveglia con un «tin-tin» e la sua luce corre nell'ottone fino alla parte che colpirà;
- il conto alla rovescia sugli avvisi a terra;
- il dente d'oro;
- l'avaro che si sfrega gli artigli nella presa in giro;
- il balzo indietro all'inizio dell'entrata: l'eroe ha appena toccato la cassa, e così la lotta non parte con i due appiccicati;
- le fasce d'oro sulle zampe, qui polsiere e cavigliere d'ottone: portano la luce e staccano le zampe pallide dal ghiaccio;
- la pioggia che mira anche dove stai andando.
Dal «tesoro»:
- il Gioco delle Casse in cui si sceglie toccando una cassa, come con le casse gemelle: «Trovato!» e il Mimic resta stordito (+50%), oppure «Vuota!» e la vera ti salta addosso;
- le tre frustate in fila invece che tutte insieme;
- le monete sputate che a terra diventano vere per 3 s;
- lo stordito;
- le linee che dicono dove arriva ogni moneta.
Tolto o cambiato dall'«affamato»:
- al posto delle quattro zanne grandi, due zannette davanti; restano le file di denti approvate;
- il Gioco delle Casse ha la scelta;
- le mosse sono 20, ma molte sono varianti semplici: pop è hide al contrario, lure e daze nascono dal fermo;
- la «cassa che respira» come segreto delle casse gemelle resta spenta, perché cambia il 50 e 50 della scelta: decide Denis;
- niente aura né alone dietro: B2.mimic resta plain come oggi, la luce è la sua e viene dalla bocca.
