# Il Burattinaio d'Ombra: il design finale

(Deciso dal direttore artistico tra tre proposte, 16 ottobre. Tipo nel gioco: `puppeteer`; modello `sprite/nemici3d/puppeteer2.js`.)

## Il design

IL BURATTINAIO D'OMBRA · «la Marionetta del Teatro delle Ombre»
Modello 'puppeteer2' (sprite/nemici3d/puppeteer2.js); nel gioco prende il nome 'puppeteer' (arena 9, Cripta delle Ombre). Base: la proposta «marionetta».
- Dal «marionettista»: il sipario rosso, i campanelli come avviso, l'occhio di bue, i burattini che rotti feriscono il padrone.
- Dal «ragno»: il filo che scende sul riflettore, il ritorno lento del Filo d'oro, il ricamo sul dorso.

1 · CHI È
Nome e titolo restano: «Il Burattinaio d'Ombra», «Il teatro delle ombre». Era l'artista del teatro della Cripta. L'Ombra gli ha rubato la croce di comando e adesso la marionetta più grande del teatro è lui: un giullare di legno, avorio e velluto viola, alto più di tre volte l'eroe, appeso a cinque fili d'oro. I fili salgono a una croce di legno che dondola da sola nel buio: nessuno la tiene.

Fa timore perché si muove come una cosa che non dovrebbe muoversi: le giunture scattano, la testa gira sul suo piolo fino a guardarsi dietro la spalla. I colpi arrivano quando i fili si accendono, si tendono e poi mollano di colpo: un peso morto che ti cade addosso.

È figo perché è un teatro intero (sipario, riflettore, botole, burattini). A metà vita arriva la risposta a «chi lo muove?»: sopra la croce si aprono due grandi occhi magenta e una mano d'ombra gigante la afferra.

Resta della Classica:
- viso tondo d'avorio con le guance rosa, occhi d'oro con la lucina, due zannette sole;
- legno e velluto da giocattolo, contorni scuri spessi;
- niente sangue, ferite o cuciture: le crepe sono solo nella vernice, sottili, e si accendono di luce come le vene del Golem.

«Un po' più cupo» vuol dire: ombre profonde nel velluto e nella mascherina, lo sguardo dal basso, i fili che spariscono nel buio, l'Ombra.

Dal boss di oggi tiene:
- il viola e l'oro;
- il cappuccio a punta col sonaglio, che ora è un cappuccio da giullare a due punte coi campanelli;
- gli occhi d'oro, la gorgiera bianca, le grandi mani bianche col polsino viola, i fili d'oro;
- la voce da teatro, il filo che spazza la stanza, i burattini d'ombra suoi servitori.

2 · SILHOUETTE E MISURE (sc 1)
- Altezza: 130 in cima alle punte del cappuccio, 125 alla testa (l'Arciere 3D è alto 37, quindi 3,5 volte; il Golem nuovo 110). Sopra il corpo:
  - la croce a z 158;
  - due fili che salgono e sfumano tra z 172 e 210;
  - nella fase 2 l'Ombra sopra la croce, fino a z 225.
  Croce, fili e Ombra non contano nell'altezza del corpo.
- Larghezza: 82 alle maniche a sbuffo, 88 con le mani; la croce è larga 56.
- Da lontano: un triangolo rovesciato (spalle a sbuffo, botte a rombi) su gambe di legno con le ginocchia a palla. La testa è tonda, col viso chiaro attraversato da una fascia scura con due luci d'oro. Le due punte del cappuccio salgono e ricadono coi campanelli, come due corna morbide. Sopra, righe d'oro verticali e la croce: si capisce subito che è una marionetta, ed enorme.
- Postura: un poco curvo in avanti, la testa bassa e avanti (pitch +0,12): ti guarda dal basso della mascherina. Le mani lunghe pendono accanto alle cosce. Nella fase 1 sta in piedi sul pavimento, nella fase 2 è sospeso a 3 px.
- Nel gioco: il raggio resta 26 (ET.puppeteer); alone e barra B2H 105; ombra a terra rx 30, ry 11, più piccola e chiara quando è in alto.

Nelle quattro direzioni:
- Davanti: il viso d'avorio con la fascia scura e gli occhi d'oro; la gorgiera; la botte a rombi coi bottoni a stella e la fibbia a mascherina; le grandi mani bianche; le ginocchia a palla e le scarpe a punta; le due punte del cappuccio aperte; la croce coi cinque fili.
- Di lato: il profilo col naso a pallina e il solco della mascella; la pancia della botte; le code del frac dietro; le scarpe lunghe; una punta del cappuccio verso di te e una dietro; la croce di taglio, una riga coi pomelli.
- Dietro: il cappuccio con le due punte, la grande maschera della commedia ricamata d'oro sul dorso, le code del frac, la croce coi fili.
- Tre quarti: tutto insieme. Girando niente si stacca, perché i fili partono e arrivano sempre ai punti veri.

3 · LA POSA DI RIPOSO, PEZZO PER PEZZO
Spazio del corpo: x avanti, y a sinistra, z in su; destra = y negativa; piedi a z 0; il segno ± vale per i due lati.

GAMBE, a due ossa con ik: anca → ginocchio 18,5, ginocchio → caviglia 20,4. Nel passo comanda il ginocchio, tirato dal filo, e lo stinco penzola.
- Scarpe laccate a punta: tallone (−4, ±10, 3), punta (12, ±10, 2,5) che si arriccia in su fino a (15, ±10, 7), con un campanellino d'oro r 1,8. Lunghe 19, larghe 8, alte 6. Un punto di luce bianco sul collo del piede e un segno chiaro di consumo sulla punta.
- Caviglie: palle di legno r 3,6 a (−1, ±10, 6).
- Stinchi: capsule di legno nudo r 4,4 → 3,8, con due venature.
- Ginocchia: palle di legno r 6,8 a (3, ±10, 26). Un piolo scuro r 1,6 sul lato esterno, un anello d'oro sottile intorno; davanti, l'occhiello d'oro r 1,4 dove si lega il filo.
- Calzoni a sbuffo di velluto prugna intorno alle cosce: ellissoide 9,5 × 8,5 × 8 (largo, profondo, alto) al centro (0, ±11, 37), fascia d'oro in fondo (z 31), tre pieghe morbide. Anche a (−1, ±11, 44).

BUSTO
- Farsetto a botte: ellissoide al centro (0, 0, 66), semiassi 17 avanti, 25 di lato, 24 in alto. Va da z 42 a 90; largo 50, profondo 34.
- Rombi da Arlecchino tra z 50 e 84, viola chiaro e cremisi alternati come una scacchiera girata di 45°. Ogni rombo è largo 45° di giro e alto 17; le righe d'oro sottili sono i loro bordi (due famiglie di linee a spirale). Ordine: prima la botte viola, poi i rombi cremisi girati verso la telecamera, dentro il ritaglio della botte, poi le righe d'oro.
- Tre bottoni d'oro a stella sul davanti (z 58, 68, 78).
- Sul dorso, sopra i rombi (z 62–80, largo 18), una grande maschera della commedia ricamata d'oro, con gli occhi a mandorla vuoti e il sorriso: lo si riconosce anche di spalle.
- Cintura d'oro a z 49. Davanti, la fibbia: una mascherina d'oro sorridente r 4,5 a (17, 0, 49). Sotto la cintura (z 42–49) il farsetto è viola liscio.
- Code del frac: due lingue di velluto viola col bordo d'oro, larghe 9. Attaccate dietro la cintura a (−15, ±7, 48), scendono fino a (−18, ±9, 22) e dondolano in ritardo.

BRACCIA, a due ossa con ik: omero 21, avambraccio 20; polo in fuori, indietro e in basso. Il braccio teso è lungo 41: i pugni arrivano a z 128, all'altezza delle punte del cappuccio.
- Maniche a sbuffo: palle di velluto viola r 12 a (0, ±29, 84), con due fasce d'oro a croce e quattro pieghe.
- Omero: manica viola r 6 → 5 dalla spalla (0, ±30, 80) al gomito.
- Gomiti: palle di legno r 5 a (3, ±37, 60), con un piolo scuro e un anellino d'oro.
- Avambracci: legno nudo r 4,5 → 3,8, con due o tre venature.
- Polsi: palle di legno r 3,8 a (12, ±39, 42), con l'occhiello d'oro del filo.
- Mani: grandi mani di legno dipinte di bianco come guanti, quelle di oggi. Si copia la funzione glove() di boss3.js con gs 1,4: palmo 9,2 × 8,7 × 5,3, tre dita e il pollice in capsule, nocche a piolo, polsino viola bordato d'oro. In più ogni dito si piega da solo, per le onde delle dita. A riposo pendono accanto alle cosce, palmo verso la gamba, dita morbide.

COLLO E TESTA. La testa ha la sua telecamera (Vat): gira da sola sul piolo, si piega e annuisce. Rispetto al corpo gira fino a ±110° da fermo e nell'entrata; il giro intero solo nella presa in giro. Come oggi si gira un poco verso la telecamera (cheat 0,3), così il viso si legge anche di lato.
- Collo: piolo di legno r 4 da z 90 a 97, quasi tutto coperto dalla gorgiera.
- Gorgiera: 12 sbuffi bianchi r 4,8 su un anello di raggio 15,5 intorno a (1, 0, 92), con un filo d'oro sotto. Quelli davanti coprono il mento; segue un poco la testa.
- Testa: palla r 17 a (3, 0, 108). Il viso è la calotta davanti, d'avorio (metà angolo 62°, un poco più alta che larga), incorniciata dal bordo d'oro del cappuccio.
- Cappuccio da giullare di velluto: un guscio r 18,6 sulla testa che copre nuca, cima e lati, aperto davanti sul viso, con una fascia d'oro intorno al viso; dentro, dove si vede, è prugna scuro.
- Le due punte del cappuccio:
  - catene da (−2, ±8, 121) a (−4, ±15, 126), (−6, ±26, 125), (−6, ±33, 118), (−5, ±35, 111), con raggi 6 / 5 / 3,8 / 2,8 / 2;
  - in punta un campanello d'oro r 3,2 appeso a (−5, ±35, 107);
  - la punta sinistra è viola, la destra cremisi;
  - seguono la testa con un ritardo di 0,08 del ciclo e i campanelli dondolano.

CROCE DI COMANDO E FILI
- La croce è di legno scuro laccato e ha il suo telaio. A riposo il centro sta a (0, 0, 158); gira col corpo, dondola e si piega da sola.
  - Asta lunga lungo y da −28 a +28 (sezione 3,6).
  - Asta corta lungo x da −16 a +20 (sezione 3,4).
  - In punta all'asta corta, a x +20, l'asticella delle ginocchia lungo y da −11 a +11 (sezione 3).
  - Pomelli d'oro r 2,6 alle sei punte; in cima al centro un anello d'oro r 4 (tubo 1,2).
- Cinque fili:
  - testa: dal centro della croce alla cima del cappuccio, (2, 0, 127), tra le due punte;
  - polsi: dalle punte dell'asta lunga agli occhielli dei polsi;
  - ginocchia: dalle punte dell'asticella agli occhielli delle ginocchia.
  Dall'anello due fili salgono nel buio (a y ±3) e sfumano tra z 172 e 210.
- Come si disegnano i fili:
  - oro di 1,1 px con sotto una riga scura di 2,2 px, così si staccano dal pavimento;
  - teso = dritto;
  - molle = curvo, con la pancia fino a 18 px, e più spento (alpha 0,5);
  - acceso = 1,6 px chiaro con l'alone, e una perla di luce che corre giù dalla croce all'arto.
  I fili sono linee tra i punti veri della croce e del corpo: restano sempre attaccati, in ogni direzione e in ogni posa.

PEZZI DI SCENA
- Il sipario (entrata, Sipario, sconfitta): un drappo di velluto cremisi di fronte alla telecamera, largo 78 e alto 150, centrato su di lui e davanti a lui.
  - Sale nel buio: il bordo alto sfuma negli ultimi 25 px in cima.
  - Sette pieghe verticali a tre toni.
  - All'orlo la frangia d'oro, fatta come un unico tratteggio di trattini verticali.
  - Una corda d'oro con la nappa, legata a sinistra a un terzo dell'altezza.
  - Quando si muove, l'orlo ondeggia di ±4 px e le pieghe si increspano.
- L'Ombra (solo fase 2):
  - sopra la croce una nebbia viola scura di fronte alla telecamera, 90 × 64, centro a z 206;
  - in mezzo due grandi occhi a mandorla magenta, 14 × 6, a 30 l'uno dall'altro, inclinati in dentro e in giù (arrabbiati), col nucleo bianco e l'alone; sbattono piano e guardano un poco verso l'eroe (2 px);
  - la mano sinistra d'ombra, in 3D nel telaio della croce, la stringe: il palmo sopra l'anello, quattro dita lunghe ma tonde intorno all'asta lunga vicino al centro, il pollice sotto, il polso che sale nella nebbia come una colonna di fumo che si assottiglia;
  - la mano destra compare solo nella Mano dell'Ombra e nella furia;
  - segue la croce stando 40 px sopra; quando la croce cade con lui (Sipario e riflettore) l'Ombra resta in alto, sparisce e torna.

4 · COLORI
Regole di pittura:
- tre toni su ogni pezzo (luce / base / ombra);
- contorno INK spesso: 2,5 sui pezzi grandi, 2 su dita, giunture e croce;
- bordo caldo (rim) in alto a sinistra su ogni pezzo;
- shadeLimb su stinchi, avambracci e maniche;
- glowTop su testa, cappuccio e spalle: la luce viene dall'alto, come su un palco;
- bagliori morbidi solo su occhi, fili accesi, campanelli, crepe e Ombra.

FASE 1
- Velluto viola (farsetto, rombi chiari, maniche, code del frac, cappuccio, punta sinistra): #a47ae8 / #6e42b8 / #351a6e.
- Velluto cremisi (rombi scuri, punta destra del cappuccio, sipario): #c8384f / #8f1d35 / #4a0b1d.
- Prugna (calzoni, dentro del cappuccio): #74468f / #4a2463 / #230f35.
- Legno color miele (stinchi, avambracci, giunture, collo): #f3c98a / #c4864a / #6f4224; venature #8d5a33 al 35%; pioli #3a2416.
- Avorio dipinto (viso, mani): #fffaf0 / #f1e4c8 / #b9a383.
- Mascherina e palpebre: #3a1838 / #24102a / #120610, con un bordo d'oro di 1 px.
- Oro (bordi, fasce, campanelli, bottoni, fibbia, pomelli, anelli, ricamo): #fff1a8 / #ffcd45 / #b17b12.
- Gorgiera: #ffffff / #f3eeff / #c5b8e4.
- Scarpe laccate: #6c4c8c / #3f2659 / #1d102b; luce #ffffff, consumo #8a6aa8.
- Croce: #9c6c46 / #5f3b22 / #2d190c.
- Viso:
  - guance #e0607f al 55%;
  - sorriso e solchi #6a1d44;
  - naso #e8a07a con l'ombra #c87a58;
  - dentro la bocca #1c0a18 con la luce viola 170,110,255;
  - zannette #fff6e0.
- Occhi #ffd84a, nucleo #fff6c8, alone 255,216,74, lucina #ffffff.
- Fili 255,233,160 (#ffe9a0), con la riga sotto rgba(40,20,10,.5). Accesi #fffbe8 con l'alone 255,233,160; perla #ffffff.
- Indizio nel buio sopra la croce: occhi 190,150,255 al 20%.

FASE 2
- Velluto viola #8a5ccc / #55309a / #261050; cremisi #a82a48 / #6a1028 / #300614; prugna #5e3478 / #3a1a52 / #1a0828.
- Il bordo in alto (glowTop) diventa magenta, 255,95,200 al 30%, su cappuccio, spalle, croce e legno: è la luce degli occhi dell'Ombra.
- Occhi #ff5fc8, nucleo #ffe6f6, alone 255,95,200.
- Fili #ff9ae0 (255,154,224), accesi #ffe0f4.
- Crepe della vernice #ff7ad6 con l'alone 255,122,214.
- Fumo dalle giunture 120,60,180.
- L'Ombra:
  - nebbia #140a22 (0,85 al centro) che sfuma nel trasparente, orlo viola 120,70,200 al 25%;
  - mani #4a2a6e / #2a1444 / #120820 col bordo 255,95,200;
  - occhi #ff5fc8 col nucleo #ffffff e l'alone 255,95,200.
- L'oro resta oro: è il segno del personaggio.

PEZZI DI SCENA E PERICOLI
- Sipario: i tre toni cremisi; frangia #ffcd45 / #b17b12; corda e nappa #ffcd45.
- Botola: legno #5f3b22 / #2d190c, cerniere #ffcd45, luce nelle fessure 255,210,110 (fase 2: 255,120,210).
- Mano dell'Ombra (disegno per il gioco): gli stessi colori delle mani dell'Ombra.
- Riflettore: luce 255,244,214.
- Avvisi di danno: il rosso del gioco, 229,72,77.

Perché si stacca dal pavimento: la Cripta delle Ombre è ardesia fredda grigio-blu (la tinta dell'arena). Il legno miele, l'avorio, l'oro e il cremisi sono caldi e ci risaltano sopra; il viola resta più saturo della pietra e ha il bordo caldo. L'avorio del viso e delle mani è la cosa più chiara del boss.

Nel gioco:
- ECOL '#6e42b8';
- la barra si rompe in coriandoli d'oro che salgono (BBFX c '#351a6e', f '#ffcd45', k 'rise', s 'magic');
- alone B2T e cerchio di rune 'ombre' come oggi (viola, poi magenta).

5 · FACCIA E OCCHI
- Mascherina da Arlecchino: una fascia scura sul viso, da sopra le sopracciglia (z 116) agli zigomi (z 103). Le punte esterne salgono fino alle tempie (z 119); in mezzo, tra gli occhi, una punta scende in giù. Fa da sopracciglio a V: lo sguardo è cattivo da ogni lato, come quello del Golem. Bordo d'oro di 1 px.
- Occhi:
  - due occhi d'oro che brillano (eyes kind 'glow', rx 4,4, ry 5, lucina bianca, alone morbido), in due orbite scure dentro la mascherina;
  - rivolti un poco in giù: ti guardano dall'alto;
  - palpebre di legno da bambola, del colore della mascherina col bordo d'oro: si chiudono con un clic per battere, a metà per mirare (lo sguardo cattivo), si spalancano quando lo colpisci forte o quando i fili si spezzano;
  - non pulsano: la luce è ferma, e cresce (alone ×1,4) un attimo prima di ogni colpo.
- Naso a pallina r 3,2 al centro del viso (z 104), color pesca col punto di luce.
- Guance: due dischi rosa tondi a z 100.
- Bocca:
  - un sorriso dipinto prugna largo 13 che sale ai lati (z 96,5);
  - dagli angoli due solchi verticali scendono al mento (z 92): è la mascella della marionetta;
  - la mascella (il pezzo tra i solchi, largo 13 e alto 8) scende fino a 5 px; dentro è buia, con la luce viola in fondo e due zannette d'avorio agli angoli in alto;
  - scende quando parla (o.talk), quando ride e quando grida.
- L'espressione è dipinta e non cambia: recita con le palpebre, la mascella, la luce degli occhi e la piega della testa.
- Fase 2:
  - occhi magenta;
  - due crepe sottilissime della vernice partono dalle punte della mascherina e scendono di 8–10 px lungo le tempie, accese di luce magenta che respira piano (meno di una volta al secondo);
  - la mascella resta socchiusa di 1,5 px: una riga buia.

6 · IL SEGNALE CHE AVVISA I COLPI (il suo «cuore di runa»)
Prima di ogni colpo, nei primi istanti della mossa:
1) si accendono e si tendono i fili dell'arto che colpirà, e una perla di luce corre giù dalla croce fino al polso o al ginocchio;
2) la croce si piega da quella parte;
3) tintinnano i campanelli del cappuccio e si sente lo «zing» di una corda strofinata che sale: si sente anche col boss fuori schermo;
4) le palpebre si chiudono a metà.
Quando i fili sono molli (curvi e spenti) è indifeso: è il momento di colpirlo.

La posa dice quale numero arriva, e quali fili si accendono:
- mani tirate in alto = Manate (i fili dei due polsi);
- un pugno solo in alto = Manate a catena (il polso sinistro, poi il destro, poi tutti e due);
- braccia spalancate col filo teso fra le mani = Fili d'oro (i due polsi);
- indice destro puntato = Sei il mio burattino! (il polso destro);
- mani alzate davanti che suonano l'aria = Burattini (i due polsi);
- i due fili sopra la croce accesi = Sipario;
- nella fase 2, gli occhi dell'Ombra che si accendono e lui che dirige = Mano dell'Ombra.

7 · FERMO E CAMMINA
FERMO (idle, 3,0 s). Si chiude su se stesso.
- La croce disegna un otto lento: si sposta di 2,5·sin(4πp) in avanti, 4·sin(2πp) di lato e 1,2·sin(2πp) in alto, e si piega (roll 0,05·sin(2πp), pitch 0,04·sin(4πp+1)).
- Il corpo la segue con 0,06 di ritardo: ondeggia di lato di 1,5 px, il busto sale e scende di 1,5 (le ginocchia si piegano appena, i piedi restano piantati) e la botte si gonfia del 2%. È il respiro.
- Punte del cappuccio, campanelli e code del frac seguono con 0,1 di ritardo.
- Le mani pendono accanto alle cosce e le dita si piegano una dopo l'altra (mignolo, anulare, medio, indice), come se suonassero fili invisibili: un'onda a .15 e una a .60, l'altra mano sfasata di .20.
- La mascella borbotta: si apre di 1,5 px a .30 e a .36.
- La testa si guarda intorno piano:
  - a sinistra (+0,5 rad) tra .10 e .30, a destra (−0,5) tra .45 e .60;
  - da .68 a .84 gira piano, troppo, oltre la spalla sinistra (+1,9 rad, 110°: si vede il cappuccio da dietro);
  - a .85 torna di scatto verso l'eroe in 0,03 (clac), con un rimbalzino;
  - a .88 le palpebre si chiudono e si riaprono (clic).
- A .55 la punta del piede destro batte una volta.
- Solo nella fase 1, tra .93 e .99, due occhi viola chiaro (190,150,255 al 20%) si aprono appena nel buio sopra la croce e si richiudono: l'indizio di chi lo muove.
- Fase 2 (o.p2):
  - è sospeso a 3 px da terra, le gambe penzolano a pendolo;
  - l'Ombra respira (la nebbia si gonfia del 4%) e sbatte gli occhi a .30 e .80;
  - le dita si contraggono il doppio, le crepe respirano, la mascella è socchiusa.
- In battaglia o.look gira la testa verso l'eroe e si somma a questi movimenti.

CAMMINA (walk, 1,2 s, due passi). Si chiude su se stesso.
Fase 1, passo da marionetta:
- Il filo del ginocchio tira su il ginocchio: il destro da .00 a .50, il sinistro da .50 a 1. Il ginocchio sale di 12 e va avanti di 14; lo stinco penzola sotto, col piede di punta.
- Il piede scende di punta e appoggia a .45 (e a .95), poi si spiana; durante l'appoggio scivola indietro sotto di lui.
- Il corpo sale di 2,5 px a metà passo (.25 e .75), dolce, mai un saltello, e ondeggia verso la gamba d'appoggio (roll ±0,04).
- Le braccia dondolano sciolte, opposte alle gambe, con 0,08 di ritardo; code del frac e punte del cappuccio rimbalzano; i campanellini delle scarpe tintinnano a ogni appoggio.
- La croce va 4 px più avanti di lui (è lei che lo trascina) e l'asticella delle ginocchia dondola di ±0,25 rad: il filo della gamba che sale è più teso.
- La testa resta su di te (o.look).

Fase 2 (o.p2), portato:
- piedi 3 px sopra il pavimento, con le punte in giù;
- le gambe penzolano e restano indietro (pendolo di 0,15 rad);
- il busto va un poco all'indietro (−0,08), perché la croce lo tira, e ondeggia lento (roll ±0,05);
- le braccia penzolano; l'Ombra va un poco avanti.

Nel gioco va a 70 px/s (88 nella fase 2).

8 · LE MOSSE
Ogni mossa ha preparazione, colpo e ritorno; p va da 0 a 1; i colpi del gioco cadono sui momenti scritti COLPO o TONFO. Le pose danno il punto del polso nello spazio del corpo.

COLPITO (hit, 0,6 s). Serve per le pagine: in battaglia c'è o.jig, e sui boss la mossa non parte da sola.
- .00 uno strattone dei fili.
- .00–.25 dondola indietro sui fili (lean −0,3, corpo 4 px indietro); .25–.60 torna avanti come una molla.
- Intanto la testa fa mezzo giro (yaw +1,2) e torna; palpebre chiuse fino a .50; stelline sopra la testa; i fili vibrano di 1,5 px.

MANATE (slam, 1,8 s)
- .00–.06 avviso: si accendono i fili dei due polsi (la perla corre giù), tintinnano i campanelli, la croce si piega indietro (pitch −0,25) e sale di 6, le palpebre a metà.
- .06–.40 la croce sale ancora, fino a z 180, e tira su di colpo le mani: polsi a (2, ±24, 118), due pugni grandi all'altezza delle punte del cappuccio. Il corpo si inarca (lean −0,15) e la mascella si spalanca («hup!»).
- .40–.47 fermo in alto, i pugni tremano (tre colpetti).
- .47 i fili si spengono e mollano, curvi; la croce cade di 30.
- .47–.52 i pugni cadono a peso morto, accelerando, e il corpo si piega in avanti quasi in ginocchio (lean +0,7, corpo 18 più in basso, testa giù).
- .52 COLPO: i pugni battono insieme il pavimento davanti, polsi a (34, ±20, 10).
- .52–.74 resta piegato coi pugni a terra e i fili molli (il momento buono per colpirlo); le dita grattano.
- .74 e .80 due strattoni: i fili si ritendono (clac clac) e lo raddrizzano, prima a metà e poi in piedi.
- .80–1 si assesta.
Con o.p2 i fili sono magenta (nella fase 2 il gioco usa le Manate a catena).

MANATE A CATENA (slam3, 2,8 s, solo fase 2). Tre colpi che avanzano.
- .00–.05 si accende il filo del polso sinistro e la croce si piega a sinistra (roll +0,3).
- .05–.34 sale il pugno sinistro (polso a (4, 24, 118)); .34–.38 cade a peso morto.
- .40 COLPO 1: polso a (36, 16, 10), il corpo piegato a sinistra.
- .42–.54 l'Ombra lo trascina in avanti (il gioco lo sposta di 45 px): le punte dei piedi strisciano, il busto resta indietro. A .44 si accende il filo destro e la croce si piega a destra.
- .46–.60 sale il pugno destro; .60–.63 cade.
- .64 COLPO 2: polso a (36, −16, 10).
- .66–.78 trascinato di altri 45 px. A .68 si accendono i due fili e la croce si piega indietro; .70–.84 salgono i due pugni; .84–.88 cadono.
- .90 COLPO 3, i due pugni insieme, il più forte: polsi a (34, ±20, 10).
- .90–.95 resta piegato coi fili molli; .95 uno strattone (clac); .95–1 di nuovo in posa.

FILI D'ORO (strings, 1,8 s)
- .00–.08 si accendono i fili dei due polsi, tintinnano i campanelli. Spalanca le braccia (polsi a (8, ±66, 82)) e tra le punte dei due indici si tende un filo d'oro: prima sottile e tremante, poi dritto e lucente. Con o.noFx resta un filo semplice.
- .08–.40 tiene il filo teso, che vibra e si accende sempre di più; il busto va un poco indietro (−0,08), le palpebre a metà, la croce sale di 8.
- .40 COLPO: frusta in avanti le due braccia (polsi a (34, ±40, 70)) e il filo parte. Da qui lo disegna il gioco: il filo tra le mani sparisce.
- .40–.62 accompagna col busto in avanti (+0,15).
- .62–1 torna in posa e le dita si richiudono una a una.

BURATTINI (puppets, 1,9 s)
- .00–.08 si accendono i fili dei polsi, tintinnano i campanelli; alza le mani davanti, palmi in giù (polsi a (20, ±26, 92)).
- .08–.30 dai polpastrelli scendono fili d'oro sottili fino al pavimento: nel gioco verso le botole (o.traps), nelle pagine verso due punti fissi a (70, ±24, 0). Ridacchia, con la mascella.
- .30–.62 le dita suonano l'aria (onde di dita, 3 al secondo), la croce dondola di lato (roll ±0,15), i fili vibrano.
- .62 COLPO: uno strattone, tira su le mani di colpo e i burattini saltano fuori.
- .62–.85 l'inchino (lean +0,4), la mano destra sul petto e la sinistra aperta di lato, la testa piegata, compiaciuto; i burattini si inchinano con lui.
- .85 apre le mani: i fili delle dita volano su nel buio.
- .85–1 torna in posa.

SEI IL MIO BURATTINO! È fatta di tre mosse: lasso, poi yank se ti prende, oppure snap se spezzi il filo.

LASSO, il filo del burattino (lasso, 1,6 s)
- .00–.06 si accende il filo del polso destro, tintinnano i campanelli.
- .06–.28 alza la destra e punta l'indice verso di te (polso a (24, −34, 96)): la punta dell'indice si accende d'oro, la testa si piega di lato per mirare (roll +0,3), le palpebre a metà.
- .28 clic: la mira si blocca.
- .28–.68 resta fermo, l'indice trema (quattro colpetti).
- .68 COLPO: uno scatto del polso, il filo parte. Lo disegna il gioco, dalla punta dell'indice (o.out.tipR).
- .68–1 se non ti ha preso, lo ritira con un giro del polso, scuote la mano seccato e piega la testa («hmpf»).
Nelle pagine (senza o.game) il modello disegna da solo il filo, che vola avanti 120 px tra .68 e .80 e torna tra .80 e .95.

TIRA! (yank, 1,5 s)
- Il filo resta teso dalla punta dell'indice destro all'eroe. Lo disegna il gioco; nelle pagine va verso (110, 0, 14).
- Tre strattoni a .12, .39 e .66: tutto il corpo all'indietro (lean −0,25 in 0,05), la mano destra tira al petto (polso a (14, −24, 78)), la croce si piega indietro. Tra uno strattone e l'altro torna un poco avanti.
- .72–.88 carica il pugno destro: si riaccende il filo del polso destro, polso a (−6, −34, 100), il busto girato a destra (yaw −0,3).
- .94 COLPO: il pugno in avanti, polso a (36, −14, 62), un passo avanti di 6, lean +0,25.
- .94–1 torna in posa.

FILO SPEZZATO (snap, 1,0 s)
- .00 il filo gli torna addosso con le scintille e la mano destra scatta indietro.
- .00–.60 barcolla all'indietro con le braccia che mulinano; la testa fa mezzo giro e torna, le palpebre sbattono a scatti, stelline sopra la testa. Tutti i fili sono molli e spenti: è indifeso.
- .60–1 i fili si ritendono uno a uno (testa .62, braccia .70, ginocchia .80) e lo rimettono in posa.

SIPARIO E RIFLETTORE: vanish, poi il riflettore del gioco, poi drop.

SIPARIO (vanish, 1,4 s)
- .00–.06 si accendono e vibrano i due fili sopra la croce (quelli che salgono nel buio); tintinnano i campanelli.
- .06–.32 dal buio scende davanti a lui il sipario rosso, dall'alto fino al pavimento; il bordo basso ondeggia.
- .32–.45 dietro il velluto, la sua sagoma lo gonfia una volta.
- .45 i fili lo strappano in alto («fwip»): sopra il sipario si vedono i fili e la croce che frustano su e spariscono; il sipario ondeggia.
- .55–.85 il sipario risale vuoto.
- .85–1 a terra resta solo la macchia d'ombra (la fa il gioco).
Nella fase 2 è la mano dell'Ombra a sollevare la croce, e l'Ombra sparisce con lui.

DAL RIFLETTORE (drop, 1,9 s)
- .00–.28 cade dall'alto a braccia e gambe aperte (polsi a (0, ±58, 70)), coi fili molli che sventolano sopra. L'altezza è z = 260·(1−(p/.28)²); con o.z la dà il gioco.
- .28 TONFO: diventa un mucchio di legno e velluto. Seduto a terra, gambe piegate in fuori, braccia larghe sul pavimento, testa ciondoloni di lato, punte del cappuccio afflosciate.
- .28–.55 resta così, coi fili molli e spenti: è indifeso.
- .55–.90 i fili si tendono uno a uno e lo rimontano, ogni volta con un «tac» e uno scatto: testa .60, braccio destro .70, braccio sinistro .76, ginocchia .84. A .90 è in piedi.
- .90–1 si scrolla le spalle e torna in posa.
Nelle pagine, tra .00 e .28, un cerchio di luce a terra dove cade. Fase 2: l'Ombra sparisce mentre lui cade e torna sopra il mucchio tra .45 e .55; a .55 la sua mano scende a riprendere la croce e lo rimonta lei.

MANO DELL'OMBRA (hand, 2,4 s, solo fase 2)
- La marionetta dirige come un maestro d'orchestra: da .05 a .75 le braccia sono alte (polsi a (10, ±34, 118)) e battono il tempo, la testa dondola, la mascella ride.
- .00–.08 gli occhi dell'Ombra si accendono di più (alone ×1,5).
- .08–.20 la mano destra dell'Ombra, quella libera, sale dalla croce nel buio e sparisce.
- .36 gli occhi dell'Ombra si stringono: nel gioco l'ombra della mano a terra si blocca.
- .78 COLPO: la marionetta abbassa le braccia di colpo, come all'ultimo accordo, mentre la mano cade dal buio sul punto bloccato. La mano la disegna il gioco con N3.puppeteer2Hand.
- .86–1 la mano torna dal buio e si rimette accanto alla croce; le braccia tornano in posa.

9 · FASE 2 · IL VERO BURATTINAIO (rage, 3,2 s, a metà vita: non si colpisce, non attacca)
- .00–.18 tutti i fili mollano insieme e lui crolla in un mucchio, come nel drop.
- .18–.42 la croce cade girando fino a z 110. Nel buio sopra si aprono piano due grandi occhi magenta, che sbattono due volte, e la nebbia si addensa (.20–.40).
- .42–.58 una mano d'ombra gigante scende dalla nebbia; a .50 afferra la croce al volo.
- .58–.80 con uno strattone lo tira su:
  - le giunture scattano al loro posto (clac clac clac a .62, .68, .74);
  - gli occhi diventano magenta e le crepe della vernice si accendono;
  - dalle giunture esce un filo di fumo viola;
  - finisce sospeso a 3 px da terra, coi fili magenta.
- .80–1 butta la testa indietro e ride a mascella spalancata, a due voci: la sua e quella lenta dell'Ombra. Un anello di luce senza danno (lo fa il gioco).

Cosa cambia nell'aspetto, da qui alla fine:
- l'Ombra sempre sopra la croce (nebbia, occhi, la mano sinistra che la stringe);
- velluto più cupo col bordo magenta in alto;
- occhi e fili magenta, crepe accese, mascella socchiusa;
- un filo di fumo dalle giunture nelle mosse forti;
- non cammina più: sta sospeso a 3 px in tutte le pose in piedi; tocca terra solo nelle Manate a catena, nel mucchio e nella sconfitta.
Cosa cambia nel gioco: mosse più fitte (×1,15, pause più corte), la Mano dell'Ombra, le Manate a catena, i Fili che tornano, 3 burattini, 16 sfere, la voce dell'Ombra (i dettagli sono nelle abilità).

10 · ENTRATA, SCONFITTA, PRESA IN GIRO, CHIAMATA
ENTRATA «Si alza il sipario» (enter, 3,4 s)
- A p 0, in mezzo al cerchio di rune, il sipario rosso è chiuso e lui ci sta dietro.
- .00–.30 il sipario sale nel buio e lo scopre dai piedi in su: una marionetta afflosciata, appesa ai fili molli, con la testa sul petto, le braccia a penzoloni (polsi a (6, ±34, 38)), le ginocchia piegate e le punte dei piedi che toccano appena. La croce è ferma sopra.
- .31 il filo della testa si tende con un «tac»: la testa scatta su, le palpebre si aprono con un clic, gli occhi si accendono d'oro. Nello stesso attimo due occhi viola chiaro sbattono una volta nel buio sopra la croce (al 20%).
- Poi gli altri fili, uno alla volta: .38 il braccio destro e .44 il sinistro (scattano su e tornano a posto), .51 il ginocchio destro, .56 il sinistro. A .60 è in piedi.
- .60–.74 la testa gira piano, troppo, fino a guardarsi dietro la spalla sinistra (110°).
- .76 torna di scatto verso di te e grida «Ah-ah!», con la mascella che batte e i campanelli che tintinnano (il grido del gioco è a 2,58 s).
- .80–1 l'inchino profondo (lean +0,55): la mano destra sul petto, la sinistra che spazza l'aria, le punte del cappuccio che ricadono avanti. Si rialza tra .95 e 1.

SCONFITTA «Cala il sipario» (die, 3,8 s; momento clou a .46 = 1,75 s)
- .00–.10 gli occhi tremolano, la mascella batte.
- I fili si spezzano uno a uno, ognuno con un «ping» e una scintilla d'oro sul suo occhiello (magenta con o.p2):
  - .12 il ginocchio sinistro;
  - .20 il ginocchio destro: cade in ginocchio, col corpo 18 più in basso;
  - .28 il braccio sinistro e .36 il destro: cadono e penzolano;
  - .46 il filo della testa: la testa cade sul petto. È il momento clou.
- .48–.68 crolla in un mucchio di legno e velluto; i campanelli del cappuccio tintinnano.
- .50 senza Ombra si spezzano i fili sopra la croce; con o.p2 è la mano dell'Ombra che si apre.
- .56–.70 la croce cade e rimbalza sul mucchio (clac a .70).
- Con o.p2, .60–.84: gli occhi dell'Ombra si chiudono piano e il buio sale come fumo viola e sparisce.
- .72–.84 si spengono gli occhi della marionetta, uno dopo l'altro; le palpebre si chiudono con l'ultimo clic (.84).
- .74–.86 un campanello si stacca dal cappuccio, rotola davanti al mucchio, oscilla e si ferma («drin»).
- .86–.95 dal buio cala il sipario rosso davanti al mucchio e lo chiude.
- .95–1 il sipario si scioglie dal basso in scintille d'oro; per ultimo resta il campanello, che sfuma con lui.
Niente di rotto o di ferito: è un giocattolo che nessuno muove più.

PRESA IN GIRO «Il giro della testa» (taunt, 1,2 s). Non attacca.
- .00–.55 la testa fa un giro intero sul suo piolo, come un gufo, con un cricchettio di legno; cappuccio e punte la seguono in ritardo.
- .30–.80 la mascella batte tre volte a tempo con la risata.
- .80–1 batte due volte le mani di legno davanti al petto (polsi a (26, ±6, 76), clac clac) e fa un inchino corto.
Fase 2: anche gli occhi dell'Ombra si stringono a mezzaluna, perché ride anche lei.

CHIAMATA «Ti chiama» (call, 1,0 s). Quando gli stai lontano; non attacca.
- La mano destra va avanti (polso a (26, −28, 76)) e l'indice fa «vieni, vieni» due volte (.20–.45 e .55–.80), con uno scricchiolio.
- Intanto la testa è piegata di lato e la mascella ride piano.
- .80–1 torna in posa.

11 · OPZIONI DEL MODELLO E DISEGNI DA ESPORTARE
La firma è N3.puppeteer2(x, y, face, anim, p, sc, o). Le opzioni:
- o.p2: la fase 2.
- o.noFx: niente effetti della mossa (bagliori, perle, fumo, polvere, scintille); il filo tra le mani resta semplice.
- o.z: l'altezza data dal gioco; si usa solo nel drop, e senza la calcola da p.
- o.jig (da 0 a 1): colpito in battaglia. I fili vibrano (1,5 px a metà) e lui dondola appena (lean −0,06·jig).
- o.look (rad, ±1,9): dove guarda la testa rispetto al corpo (verso l'eroe). Si somma ai movimenti della testa da fermo, nella camminata e nelle mire, non nei colpi.
- o.talk (da 0 a 1): la mascella batte 7 volte al secondo finché parla.
- o.veil (da 0 a 1): croce, fili sopra la testa e Ombra scendono fino al 40%; serve quando l'eroe gli sta dietro.
- o.mini: per le anteprime delle arene. Croce a z 140, niente fili verso l'alto e niente Ombra.
- o.game: è il gioco a disegnare il filo del lazo, i fili verso le botole e la luce della caduta; senza, il modello li disegna da solo (nelle pagine).
- o.traps: [{x, y}], i punti del pavimento delle botole, in coordinate del mondo. Nella mossa puppets i fili delle dita vanno lì; il modello li porta nelle sue coordinate con (x − X)/sc e (y − Y)/sc.
- o.out: un oggetto che il modello riempie a ogni disegno coi punti sullo schermo, in coordinate del mondo (X + q·sc):
  - tipR e tipL (le punte degli indici);
  - wristR e wristL (i polsi);
  - cross (l'anello della croce);
  - head (il centro del viso).

Disegni da esportare, con lo stesso aspetto del modello:
- IL BURATTINO NUOVO, modello 'puppet2' (reg; nel gioco prende il posto di 'puppet'). È una piccola marionetta come lui, alta 28 (raggio 10 nel gioco):
  - testa di legno laccato viola r 6,5 a z 19,5 (#6a46a8 / #45277a / #22103e), con la faccina d'avorio, la mascherina scura e due occhietti #ffd84a che brillano (fase 2: #ff5fc8);
  - un cappuccetto a due punte, viola e cremisi, coi campanellini d'oro;
  - una gorgierina bianca di 6 sbuffi;
  - il corpo a sacchetto di velluto viola (7 × 6 × 8 a z 10), con un rombo d'oro davanti;
  - braccia e gambe a bastoncino di legno miele (r 1,6) con le giunture tonde (r 2), manine d'avorio (r 2,4), scarpine a punta;
  - tre fili d'oro (dalla testa e dalle mani) che salgono per 50 px e sfumano.
  Le sue mosse:
  - idle (1,8 s): dondola sui fili di 1,5 px, i piedi che toccano appena, la testa che si piega, le braccia che penzolano;
  - walk (0,5 s): saltella come tirato dai fili. Sale di 6, le gambe scalciano penzolando, atterra morbido;
  - attack (1,0 s): .00–.45 alza le braccia sui fili, gli occhi si accendono e tra le manine si forma una sferetta viola; .50 la tira; .50–1 torna;
  - hit (0,6 s): scatta indietro, la testa fa mezzo giro, gli occhi chiusi;
  - spawn (0,8 s): salta fuori dalla botola appeso al filo, da z −22 a +6 e poi giù a 0, con le gambe che scalciano e i fili tesi.
  Opzioni: o.p2, o.noFx.
- N3.puppeteer2Hand(x, y, z, k, sc, o): la mano gigante dell'Ombra che cade dal buio.
  - x, y è il punto a terra sotto il palmo; z l'altezza del palmo.
  - k va da 0 a 1: 0 cade col palmo in giù e le dita mezze chiuse; .3 l'urto, con le dita spalancate, il palmo piatto, un poco schiacciata; .6 preme; 1 risale chiudendo le dita.
  - o.a è la rotazione a terra; c'è anche o.noFx.
  - Larga 100 da dito a dito: palmo 44 × 38, quattro dita lunghe 28 ma tonde, il pollice. Viola scura col bordo magenta, col fumo al polso che sale nel buio.
  - L'ombra a terra la disegna il gioco.
- N3.puppeteer2Trap(x, y, k, sc, o): la botola, 26 × 26.
  - Due ante di legno incernierate ai lati, con le cerniere d'oro e la luce d'oro nelle fessure.
  - k 0 chiusa (o.glow, da 0 a 1, fa crescere la luce); da 0 a .3 le ante si aprono in giù; da .3 a .7 aperta (un buco scuro con la luce d'oro dentro); da .7 a 1 si richiude.
  - o.p2: luce magenta.
  - Chiusa si deve poter cuocere nel pavimento: il gioco la disegna una volta con k 0 e la luce spenta.

12 · REGOLE DI COSTRUZIONE E RISCHI
- Ordine di disegno: lo decide la posa di riposo (parts + run), mai il punto dove va la mano o il piede. Dal fondo al davanti:
  1) l'ombra a terra;
  2) il braccio, la gamba e i fili del lato lontano;
  3) il busto con code e calzoni (le code stanno dietro il busto; davanti solo visto da dietro);
  4) la gamba e il braccio vicini, coi loro fili;
  5) la gorgiera, sbuffo per sbuffo;
  6) la testa;
  7) le punte del cappuccio, dietro o davanti alla testa secondo come gira;
  8) il filo della testa, la croce, l'Ombra;
  9) il sipario, davanti a tutto.
  I fili di polsi e ginocchia si disegnano alla profondità del loro capo basso, più 2 verso la telecamera: quello lontano passa dietro il busto, quello vicino davanti.
- Tutto dipende da p, più i valori che dà il gioco (o.jig, o.look, o.talk): campanelli, punte, code, croce e Ombra dondolano con p, mai con G.t (oggi il sonaglio usa G.t: non più). Le mosse finiscono nella posa di riposo; il fermo e la camminata si chiudono su se stessi.
- Tremolii sotto gli 8 Hz (pugni, indice, mascella a 7 al secondo); i lampi salgono in almeno 3 passi.
- Con LOWFX:
  - niente bagliori (lighter), perle, fumo, polvere né scintille;
  - i fili accesi diventano solo più chiari;
  - la nebbia dell'Ombra è un'ellisse piatta al 50% e gli occhi non hanno alone;
  - il sipario ha 4 pieghe e la gorgiera 10 sbuffi.
- Costo di disegno: al massimo 1,3 ms a fotogramma (il Golem ne costa 1,2). Per stare dentro:
  - rombi come quadrilateri calcolati sulla botte, solo quelli girati verso la telecamera;
  - pieghe e ricamo solo dal lato in vista;
  - dita in due capsule dove non si vedono bene;
  - punte e campanelli in catene corte;
  - inviluppi filtrati e calcolati una volta, come nel Golem;
  - l'Ombra solo nella fase 2, il sipario solo nelle sue mosse.
- Restare nella Classica:
  - viso tondo con le guance rosa e il sorriso morbido, occhi con la lucina, solo due zannette;
  - la testa gira troppo solo da fermo e nell'entrata (110°); il giro intero solo nella presa in giro, per scherzo, col cricchettio;
  - le giunture si piegano solo come quelle di una marionetta, mai al contrario né a scatti spezzati;
  - le crepe sono solo della vernice, sottili, accese di luce;
  - l'Ombra è nebbia, due occhi e una mano: niente denti.
- Altezza: sopra la testa non c'è niente che serva per giocare. Quando l'eroe gli sta dietro c'è o.veil; nelle anteprime o.mini.
- Il sipario e la nebbia dell'Ombra stanno di fronte alla telecamera e restano uguali in ogni direzione; la mano dell'Ombra sulla croce è in 3D, attaccata alla croce.
- Un problema che non dipende da questi file: la schermata «Nuova arena sbloccata!» mette il filtro dell'arena (hue-rotate 200°) anche sul boss (#auCv, nel file 61), quindi lì i colori cambiano, come già oggi.
- Prima del gioco: a Denis le quattro direzioni affiancate (anche della fase 2) e la pagina dal telefono; i fogli col solito foglio3d.js; i fogli della lanterna non devono cambiare.

## Le mosse del modello

| id | nome | secondi | descrizione |
|---|---|---|---|
| `idle` | Fermo | 3 | Si chiude su se stesso. La croce disegna un otto lento: si sposta di 2,5·sin(4πp) in avanti, 4·sin(2πp) di lato e 1,2·sin(2πp) in alto, e si piega (roll 0,05·sin(2πp), pitch 0,04·sin(4πp+1)). Il corpo la segue con 0,06 di ritardo: ondeggia di lato di 1,5 px, il busto sale e scende di 1,5 (ginocchia appena piegate, piedi piantati) e la botte si gonfia del 2% (il respiro). Punte del cappuccio, campanelli e code del frac seguono con 0,1 di ritardo. Le mani pendono accanto alle cosce; le dita si piegano una dopo l'altra (mignolo, anulare, medio, indice) come se suonassero fili invisibili: un'onda a .15 e una a .60, l'altra mano sfasata di .20. La mascella borbotta (si apre di 1,5 px a .30 e a .36). La testa si guarda intorno piano: a sinistra (+0,5 rad) tra .10 e .30, a destra (−0,5) tra .45 e .60. Da .68 a .84 gira piano, troppo, oltre la spalla sinistra (+1,9 rad, 110°); a .85 torna di scatto verso l'eroe in 0,03 (clac) con un rimbalzino; a .88 le palpebre si chiudono e si riaprono (clic). A .55 la punta del piede destro batte una volta. Solo nella fase 1, tra .93 e .99, due occhi viola chiaro (190,150,255 al 20%) si aprono appena nel buio sopra la croce e si richiudono. Con o.p2: sospeso a 3 px da terra, gambe a pendolo; l'Ombra respira (nebbia +4%) e sbatte gli occhi a .30 e .80; dita che si contraggono il doppio; crepe che respirano; mascella socchiusa. In battaglia o.look gira la testa verso l'eroe e si somma a questi movimenti. |
| `walk` | Cammina | 1.2 | Due passi, si chiude su se stesso. Fase 1, passo da marionetta: il filo del ginocchio tira su il ginocchio (il destro da .00 a .50, il sinistro da .50 a 1), che sale di 12 e va avanti di 14; lo stinco penzola col piede di punta. Il piede scende di punta e appoggia a .45 (e a .95), poi si spiana e scivola indietro sotto di lui. Il corpo sale di 2,5 px a metà passo (.25 e .75), dolce, mai un saltello, e ondeggia verso la gamba d'appoggio (roll ±0,04). Le braccia dondolano sciolte, opposte alle gambe, con 0,08 di ritardo; code e punte rimbalzano; i campanellini delle scarpe tintinnano a ogni appoggio. La croce va 4 px più avanti di lui e l'asticella delle ginocchia dondola di ±0,25 rad. La testa resta sull'eroe (o.look). Con o.p2 è portato: piedi 3 px sopra il pavimento con le punte in giù, gambe che penzolano e restano indietro (pendolo di 0,15 rad), busto un poco indietro (−0,08), ondeggia lento (roll ±0,05), braccia che penzolano, l'Ombra un poco avanti. |
| `hit` | Colpito | 0.6 | Per le pagine: in battaglia c'è o.jig, e sui boss la mossa non parte da sola. .00 uno strattone dei fili; .00–.25 dondola indietro sui fili (lean −0,3, corpo 4 px indietro); .25–.60 torna avanti come una molla. La testa fa mezzo giro (yaw +1,2) e torna, le palpebre restano chiuse fino a .50, stelline sopra la testa, i fili vibrano di 1,5 px. |
| `slam` | Manate | 1.8 | .00–.06 avviso: si accendono i fili dei due polsi (la perla corre giù), tintinnano i campanelli, la croce si piega indietro (pitch −0,25) e sale di 6, palpebre a metà. .06–.40 la croce sale fino a z 180 e tira su di colpo le mani: polsi a (2, ±24, 118), due pugni all'altezza delle punte del cappuccio; il corpo si inarca (lean −0,15), la mascella si spalanca («hup!»). .40–.47 fermo in alto, i pugni tremano (tre colpetti). .47 i fili si spengono e mollano (curvi), la croce cade di 30. .47–.52 i pugni cadono a peso morto e il corpo si piega in avanti quasi in ginocchio (lean +0,7, corpo 18 più in basso, testa giù). .52 COLPO: i pugni battono insieme il pavimento davanti, polsi a (34, ±20, 10). .52–.74 resta piegato coi pugni a terra e i fili molli, le dita grattano. .74 e .80 due strattoni (clac clac): i fili si ritendono e lo raddrizzano, prima a metà e poi in piedi. .80–1 si assesta. Con o.p2 i fili sono magenta. |
| `slam3` | Manate a catena | 2.8 | Solo fase 2: tre colpi che avanzano. .00–.05 si accende il filo del polso sinistro, la croce si piega a sinistra (roll +0,3). .05–.34 sale il pugno sinistro (polso a (4, 24, 118)); .34–.38 cade a peso morto; .40 COLPO 1 (polso a (36, 16, 10)), corpo piegato a sinistra. .42–.54 l'Ombra lo trascina avanti (il gioco lo sposta di 45 px): punte dei piedi che strisciano, busto che resta indietro; a .44 si accende il filo destro e la croce si piega a destra. .46–.60 sale il pugno destro; .60–.63 cade; .64 COLPO 2 (polso a (36, −16, 10)). .66–.78 trascinato di altri 45 px; a .68 si accendono i due fili e la croce si piega indietro; .70–.84 salgono i due pugni; .84–.88 cadono; .90 COLPO 3, i due pugni insieme (polsi a (34, ±20, 10)), il più forte. .90–.95 resta piegato coi fili molli; .95 uno strattone (clac); .95–1 di nuovo in posa. |
| `strings` | Fili d'oro | 1.8 | .00–.08 si accendono i fili dei due polsi, tintinnano i campanelli; spalanca le braccia (polsi a (8, ±66, 82)) e tra le punte dei due indici si tende un filo d'oro, prima sottile e tremante, poi dritto e lucente (con o.noFx un filo semplice). .08–.40 lo tiene teso: vibra e si accende sempre di più; il busto va un poco indietro (−0,08), palpebre a metà, la croce sale di 8. .40 COLPO: frusta in avanti le due braccia (polsi a (34, ±40, 70)) e il filo parte; da qui lo disegna il gioco e il filo tra le mani sparisce. .40–.62 accompagna col busto in avanti (+0,15). .62–1 torna in posa e le dita si richiudono una a una. |
| `puppets` | Burattini | 1.9 | .00–.08 si accendono i fili dei polsi, tintinnano i campanelli; alza le mani davanti (polsi a (20, ±26, 92)), palmi in giù. .08–.30 dai polpastrelli scendono fili d'oro sottili fino al pavimento: nel gioco verso le botole (o.traps), nelle pagine verso due punti fissi a (70, ±24, 0); ridacchia, con la mascella. .30–.62 le dita suonano l'aria (onde di dita, 3 al secondo), la croce dondola di lato (roll ±0,15), i fili vibrano. .62 COLPO: uno strattone, tira su le mani di colpo (i burattini saltano fuori). .62–.85 inchino (lean +0,4), la mano destra sul petto e la sinistra aperta di lato, la testa piegata, compiaciuto. .85 apre le mani e i fili delle dita volano su nel buio. .85–1 torna in posa. |
| `lasso` | Il filo del burattino | 1.6 | Prima parte di «Sei il mio burattino!». .00–.06 si accende il filo del polso destro, tintinnano i campanelli. .06–.28 alza la destra e punta l'indice verso l'eroe (polso a (24, −34, 96)); la punta dell'indice si accende d'oro, la testa si piega di lato per mirare (roll +0,3), palpebre a metà. .28 clic: la mira si blocca. .28–.68 resta fermo, l'indice trema (quattro colpetti). .68 COLPO: uno scatto del polso e il filo parte; lo disegna il gioco dalla punta dell'indice (o.out.tipR). .68–1 se non ha preso, lo ritira con un giro del polso, scuote la mano seccato e piega la testa («hmpf»). Senza o.game (le pagine) il modello disegna da solo il filo, che vola avanti 120 px tra .68 e .80 e torna tra .80 e .95. |
| `yank` | Tira! | 1.5 | Quando il filo ha preso l'eroe. Il filo resta teso dalla punta dell'indice destro all'eroe; lo disegna il gioco (nelle pagine va verso (110, 0, 14)). Tre strattoni a .12, .39 e .66: tutto il corpo all'indietro (lean −0,25 in 0,05), la mano destra tira al petto (polso a (14, −24, 78)), la croce si piega indietro; tra uno e l'altro torna un poco avanti. .72–.88 carica il pugno destro: si riaccende il filo del polso destro, polso a (−6, −34, 100), busto girato a destra (yaw −0,3). .94 COLPO: pugno in avanti (polso a (36, −14, 62)), un passo avanti di 6, lean +0,25. .94–1 torna in posa. |
| `snap` | Filo spezzato | 1 | Quando l'eroe spezza il filo con lo scatto (il suo punto debole: è indifeso). .00 il filo gli torna addosso con le scintille e la mano destra scatta indietro. .00–.60 barcolla all'indietro con le braccia che mulinano; la testa fa mezzo giro e torna, le palpebre sbattono a scatti, stelline sopra la testa; tutti i fili molli e spenti. .60–1 i fili si ritendono uno a uno (testa .62, braccia .70, ginocchia .80) e lo rimettono in posa. |
| `vanish` | Sipario | 1.4 | .00–.06 si accendono e vibrano i due fili sopra la croce, tintinnano i campanelli. .06–.32 dal buio scende davanti a lui il sipario rosso (di fronte alla telecamera, 78 × 150, dall'alto al pavimento) con la frangia d'oro e la nappa; l'orlo ondeggia. .32–.45 dietro, la sua sagoma gonfia una volta il velluto. .45 i fili lo strappano in alto («fwip»): sopra il sipario i fili e la croce frustano su e spariscono, il sipario ondeggia. .55–.85 il sipario risale vuoto. .85–1 a terra resta solo la macchia d'ombra (la fa il gioco). Con o.p2 è la mano dell'Ombra a sollevare la croce, e l'Ombra sparisce con lui. |
| `drop` | Dal riflettore | 1.9 | .00–.28 cade dall'alto a braccia e gambe aperte (polsi a (0, ±58, 70)), coi fili molli che sventolano sopra; altezza z = 260·(1−(p/.28)²), oppure o.z se lo passa il gioco. .28 TONFO: un mucchio di legno e velluto (seduto a terra, gambe piegate in fuori, braccia larghe sul pavimento, testa ciondoloni di lato, punte del cappuccio afflosciate). .28–.55 resta così coi fili molli e spenti (indifeso). .55–.90 i fili si tendono uno a uno e lo rimontano, ogni volta con un «tac» e uno scatto: testa .60, braccio destro .70, sinistro .76, ginocchia .84; .90 in piedi. .90–1 si scrolla le spalle e torna in posa. Nelle pagine, tra .00 e .28, un cerchio di luce a terra dove cade. Con o.p2 l'Ombra sparisce mentre cade e torna sopra il mucchio tra .45 e .55; a .55 la sua mano scende, riprende la croce e lo rimonta lei. |
| `hand` | Mano dell'Ombra | 2.4 | Solo fase 2. La marionetta dirige come un maestro d'orchestra: da .05 a .75 le braccia sono alte (polsi a (10, ±34, 118)) e battono il tempo, la testa dondola, la mascella ride. .00–.08 gli occhi dell'Ombra si accendono di più (alone ×1,5). .08–.20 la mano destra dell'Ombra, quella libera, sale dalla croce nel buio e sparisce. .36 gli occhi dell'Ombra si stringono (il gioco blocca l'ombra della mano). .78 COLPO: abbassa le braccia di colpo, come all'ultimo accordo, mentre la mano cade dal buio (la disegna il gioco con N3.puppeteer2Hand). .86–1 la mano torna dal buio e si rimette accanto alla croce; le braccia tornano in posa. |
| `rage` | Il vero Burattinaio | 3.2 | A metà vita; non si colpisce e non attacca. .00–.18 tutti i fili mollano insieme e crolla in un mucchio, come nel drop. .18–.42 la croce cade girando fino a z 110; nel buio sopra si aprono piano due grandi occhi magenta (sbattono due volte) e la nebbia si addensa (.20–.40). .42–.58 una mano d'ombra gigante scende dalla nebbia e a .50 afferra la croce al volo. .58–.80 con uno strattone lo tira su: le giunture scattano al loro posto (clac clac clac a .62, .68, .74), gli occhi diventano magenta, le crepe della vernice si accendono, dalle giunture esce un filo di fumo viola; finisce sospeso a 3 px da terra coi fili magenta. .80–1 butta la testa indietro e ride a mascella spalancata, a due voci; l'anello di luce lo fa il gioco. Da qui in poi l'aspetto è quello di o.p2. |
| `taunt` | Presa in giro | 1.2 | Il giro della testa; non attacca. .00–.55 la testa fa un giro intero sul suo piolo, come un gufo, con un cricchettio di legno; cappuccio e punte la seguono in ritardo. .30–.80 la mascella batte tre volte a tempo con la risata. .80–1 batte due volte le mani di legno davanti al petto (polsi a (26, ±6, 76), clac clac) e fa un inchino corto. Con o.p2 anche gli occhi dell'Ombra si stringono a mezzaluna. |
| `call` | Ti chiama | 1 | Quando l'eroe gli sta lontano; non attacca. La mano destra avanti (polso a (26, −28, 76)), l'indice fa «vieni, vieni» due volte (.20–.45 e .55–.80) con uno scricchiolio; la testa è piegata di lato e la mascella ride piano. .80–1 torna in posa. |
| `enter` | Entrata | 3.4 | «Si alza il sipario». A p 0 il sipario rosso è chiuso in mezzo al cerchio di rune e lui ci sta dietro. .00–.30 il sipario sale nel buio e lo scopre dai piedi in su: una marionetta afflosciata, appesa ai fili molli, con la testa sul petto, le braccia a penzoloni (polsi a (6, ±34, 38)), le ginocchia piegate e le punte dei piedi che toccano appena; la croce è ferma sopra. .31 il filo della testa si tende con un «tac»: la testa scatta su, le palpebre si aprono con un clic, gli occhi si accendono d'oro, e due occhi viola chiaro sbattono una volta nel buio sopra la croce (20%). .38 il braccio destro, .44 il sinistro, .51 il ginocchio destro, .56 il sinistro; .60 è in piedi. .60–.74 la testa gira piano, troppo, fino a guardarsi dietro la spalla sinistra (110°). .76 torna di scatto verso l'eroe e grida «Ah-ah!», con la mascella che batte e i campanelli che tintinnano (nel gioco il grido è a 2,58 s). .80–1 l'inchino profondo (lean +0,55): la mano destra sul petto, la sinistra che spazza l'aria, le punte del cappuccio che ricadono avanti; si rialza tra .95 e 1. |
| `die` | Sconfitta | 3.8 | «Cala il sipario»; il momento clou è a .46 (1,75 s). .00–.10 gli occhi tremolano, la mascella batte. I fili si spezzano uno a uno, ognuno con un «ping» e una scintilla d'oro (magenta con o.p2): .12 ginocchio sinistro, .20 ginocchio destro (cade in ginocchio, corpo 18 più in basso), .28 braccio sinistro, .36 braccio destro, .46 testa (cade sul petto: momento clou). .48–.68 crolla in un mucchio di legno e velluto, i campanelli tintinnano. A .50 senza Ombra si spezzano i fili sopra la croce; con o.p2 si apre la mano dell'Ombra. .56–.70 la croce cade e rimbalza sul mucchio (clac a .70). Con o.p2, .60–.84 gli occhi dell'Ombra si chiudono piano e il buio sale come fumo viola e sparisce. .72–.84 si spengono gli occhi della marionetta e le palpebre si chiudono con l'ultimo clic. .74–.86 un campanello si stacca, rotola davanti al mucchio, oscilla e si ferma («drin»). .86–.95 dal buio cala il sipario rosso davanti al mucchio. .95–1 il sipario si scioglie dal basso in scintille d'oro; per ultimo sfuma il campanello. |

## Le abilità nel gioco

IL CERVELLO NUOVO (src/js/89-burattinaio-nuovo.js)

COME SI ACCENDE E COSA SOSTITUISCE
- Si accende solo se c'è N3.puppeteer2 (PU2ON, come G2ON del Golem).
- Il modello nuovo prende il posto di quello di oggi:
  - N3.puppeteer = N3.puppeteer2;
  - N3.meta.puppeteer = una copia di N3.meta.puppeteer2, con old = il disegno di oggi per le pagine;
  - se c'è N3.puppet2, anche il burattino: N3.puppet = N3.puppet2, meta compresa.
- EUPD.puppeteer è nuovo e gestisce da solo 'taunt' e 'call': il giro della presa in giro di 88 avvolge il cervello di prima, come è successo col Golem.
  - Le prese in giro restano quelle di 88: b3taunt quando ti colpisce e quando ti chiama; lo stato libero (b3free) è 'walk'.
  - Se b3taunt arriva dalla chiamata (e.b3s.callT === e.b3s.tauntT), il cervello fa 'call' al posto di 'taunt'.
- n3Move avvolto per lui:
  - durante l'entrata ['enter', iT/3,4];
  - in ogni stato che è una mossa del modello [stato, min(.999, b3k(e))]: è l'orologio del cervello, così il colpo cade sempre sul suo fotogramma, anche nella fase 2;
  - 'spot' è nascosto.
- Gli agganci di N3G:
  - N3G.wp.puppeteer: l'orologio suo della camminata, che riparte dal primo passo, come nel Golem;
  - N3G.zm.puppeteer = 1: nella caduta il modello riceve o.z;
  - N3G.opt.puppeteer = e => ({game:1, jig, look, talk, veil, traps, out, mini}).
- Tempi:
  - Il dt del boss porta già la velocità dell'arena 9 (bossLvl ×1,24–1,27).
  - Nella fase 2 il cervello moltiplica il dt delle mosse per 1,15 e accorcia le pause. Fanno eccezione lasso, yank e snap, che vanno sempre al tempo della fase 1.
  - REGOLA: ogni danno ha un avviso a terra di almeno 0,6 s veri. I tempi qui sotto lo garantiscono anche a ×1,27 e a ×1,46 (i conti sono fra parentesi). Se un'altra velocità li accorciasse, il cervello tiene la mossa ferma sul fotogramma prima del colpo finché l'avviso non ha avuto i suoi 0,6 s.
- Colori degli avvisi: rossi (229,72,77) per ogni danno, come nel resto del gioco; d'oro solo la mira del filo, che non fa danno.

MOVIMENTO
- Tra una mossa e l'altra cammina 1,1–1,5 s (fase 2: 0,7–0,95 s) verso un punto a 150–230 px da te:
  - lontano dagli ostacoli;
  - quando può, sul cerchio di rune (il palco);
  - mai coi piedi sopra TOP+130, così la testa resta sotto la barra.
- Velocità 70 px/s; nella fase 2 88, perché lo portano.
- La testa ti segue sempre: o.look = l'angolo verso l'eroe meno la direzione disegnata, entro ±1,9 rad, morbido.
- Danno di contatto 22 come oggi; ET.puppeteer resta (r 26, vita 6.000).
- I valori che il cervello passa al modello:
  - o.jig: 1 a ogni colpo vero che prende (hurtE, non veleno e fuoco), poi scende a 0 in 0,25 s;
  - o.talk: 1 per la durata di ogni verso (b3say la restituisce);
  - o.veil: quando l'eroe gli sta dietro (sopra di lui sullo schermo, entro 45 px di lato e 175 px sopra i piedi) sale a 1 in 0,2 s;
  - o.mini: nelle anteprime delle arene (boss finto, fuori dalla partita);
  - o.out: un oggetto del boss che il modello riempie coi punti sullo schermo; da lì partono il filo del lazo (tipR) e le scie dei burattini (cross). Se manca: b3pt(e, 30, −30, 96) e b3pt(e, 0, 0, 158);
  - o.traps: le botole, durante 'puppets'.

LE ABILITÀ
I danni sono prima di DMG(); p è il momento della mossa del modello.

1. MANATE (slam, 1,8 s), solo fase 1
- Avviso a .04:
  - due cerchi rossi r 30 dove cadranno i pugni (punti del corpo (38, ±18), con b3pt), che si riempiono;
  - un anello tratteggiato chiaro fin dove arriva l'onda (230 px, centro (38, 0)).
- Colpo a .52 (0,68 s veri dopo l'avviso):
  - 22 a chi è in uno dei due cerchi;
  - un'onda d'ombra da (38, 0) fino a 230 px, 16 (G.waves, rgb 170,110,255);
  - b3fx 'pslam', shake 8, sfx boom, vib.
- Come si schiva: uscire dai cerchi; per l'onda, stare oltre l'anello o scattare mentre passa.
- Da .52 a .74 è piegato coi fili molli: non attacca. Non c'è bonus: è il respiro per tirargli.

2. MANATE A CATENA (slam3, 2,8 s), solo fase 2, al posto delle Manate
- Avviso a .04: tre cerchi rossi r 30 sulla linea verso di te, a 40, 85 e 130 px da dove sta; la linea si blocca a .04.
- Colpi a .40, .64 e .90 (0,69 / 1,15 / 1,65 s veri a ×1,46):
  - danni 18, 18 e 22;
  - sull'ultimo anche l'onda fino a 290 px (16);
  - tra un colpo e l'altro (.42–.54 e .66–.78) il cervello lo sposta di 45 px lungo la linea (moveCircle), così ogni pugno cade nel suo cerchio;
  - b3fx 'pchain' ai primi due colpi, 'pslam' all'ultimo.
- Come si schiva: spostandosi di lato rispetto alla linea. Uno scatto solo non basta per tutti e tre.

3. FILI D'ORO (strings, 1,8 s)
- Avviso a .04: una banda rossa tratteggiata larga 10 che attraversa tutta la stanza passando per lui, perpendicolare a dove guarda, con tre frecce d'oro verso il lato dove sei.
- A .40 parte il filo di oggi: b3thread(e.x, e.y, angolo verso di te, 290, 18, {s0:22}); nella fase 2 a 340. b3fx 'pstrings', sfx shimmer e dash.
- Fase 2: il filo torna, ma solo dopo 2,2 s:
  - resta fermo e teso contro la parete in fondo, e vibra;
  - la banda rossa dove ripartirà si accende 0,8 s prima;
  - il ritorno è un secondo filo che parte dalla parete verso di lui a 340 px/s e riattraversa la stanza;
  - fra i due passaggi lo scatto si ricarica (2,2 s);
  - la mossa dopo aspetta che il filo sia tornato: il cervello allunga la camminata.
- Come si passa: con lo scatto o stando dietro un ostacolo (b3cover).

4. SEI IL MIO BURATTINO! (lasso 1,6 s, poi yank 1,5 s oppure snap 1,0 s)
- Si fa solo con l'eroe tra 90 e 400 px; altrimenti prima cammina (al massimo 1 s in più) o passa alla mossa dopo. Sempre al tempo della fase 1.
- La mira (da .06 a .28): una linea tratteggiata d'oro dalla punta dell'indice destro (o.out.tipR) fino a te, che ti segue. A .28 clic: si blocca e lampeggia bianca.
- A .68 (0,5 s veri dopo il blocco) il filo corre sulla linea bloccata a 900 px/s, fino a 420 px; si ferma prima contro muri e ostacoli. Ti prende solo se la sua punta passa a meno di P.r+5 dal tuo centro e non stai scattando né sei invulnerabile. Basta un passo di lato dopo il clic. Se non prende, la mossa finisce (lo ritira) e lui cammina.
- Se ti prende, subito 'yank':
  - un anellino d'oro intorno all'eroe e il filo teso dal dito a te;
  - niente danno, ma tre strattoni (a .12, .39 e .66) che in 0,1 s ti tirano di 26 px verso di lui;
  - correndo via ne annulli fino al 70%;
  - mai più vicino di 70 px a lui, mai dentro muri o ostacoli (lo stesso controllo dell'eroe);
  - la prima volta compare «Scatta per spezzare il filo!».
- Il pugno: da .12 un cerchio rosso r 40 davanti a lui (punto (44, 0)); il pugno arriva a .94 (0,97 s veri dopo), 26 a chi è dentro. Dopo l'ultimo strattone hai almeno 0,33 s per uscirne.
- Se scatti mentre sei legato il filo si spezza: 'snap', con scintille lungo il filo e un «twang». Per tutta la mossa i colpi gli fanno +50%; la prima volta compare «Filo spezzato!».
- Mentre ti tiene non fa altro, e i burattini non tirano.

5. BURATTINI (puppets, 1,9 s)
- Se ce ne sono già 3, la mossa salta.
- Avviso a .08: 2 botole (3 nella fase 2) dove usciranno:
  - a 60–85 px da lui verso di te, entro ±70° dalla direzione verso di te;
  - distanti fra loro almeno 40 px, mai a meno di 70 px da te, né su ostacoli né sulla porta;
  - ognuna è il disegno N3.puppeteer2Trap (chiusa, con la luce d'oro nelle fessure che cresce) con un anello rosso che pulsa (r 16);
  - dalle dita del boss scendono fili sottili alle botole (o.traps).
- A .62 (0,81 s veri dopo; 0,70 a ×1,46) le botole si aprono:
  - 14 a chi ci sta sopra;
  - da ognuna salta fuori un burattino (makeE('puppet'), p2 nella fase 2, al massimo 4 vivi) con la mossa 'spawn': per 0,8 s esce dalla botola appeso al suo filo e non si muove né tira;
  - b3fx 'ptrap' e 'ppuppet'.
- A .80 le botole si richiudono (0,3 s) e si cuociono nel pavimento come la buca della lastra del Golem, al massimo 6.
- I burattini sono quelli di oggi (EUPD.puppet di 81): vita 32, contatto 8, una sfera d'ombra (10) ogni 2,6–3,6 s, 14 s di vita.
- «Il filo torna al padrone»: ogni burattino che rompi tu toglie al Burattinaio l'1,2% della vita massima.
  - Contano solo quelli uccisi con killE senza il secondo argomento: non quelli che si consumano, né quelli della sconfitta.
  - Non vale se il boss è nascosto, in aria o nella furia.
  - Una scia d'oro (magenta nella fase 2) vola in 0,25 s dal burattino alla croce (o.out.cross); lui sussulta (o.jig 1) e si lamenta (b3say 'hurt').

6. SIPARIO E RIFLETTORE (vanish 1,4 s, poi il riflettore, poi drop 1,9 s)
- Vanish: a .45 sparisce (e.hidden, e.alpha 0, niente alone); b3fx 'psink' dove sparisce; sfx creep.
- Il riflettore (stato 'spot', solo del cervello, a tempo vero):
  - un cono di luce calda dall'alto (255,244,214) e a terra un cerchio luminoso r 46 col bordo rosso che pulsa;
  - parte sopra di te e ti segue a 110 px/s per 0,6 s: tu corri a 150 e lo semini muovendoti, ma intanto non tiri;
  - poi si blocca per 0,35 s: lampeggia, suona un arpeggio di carillon, e un filo d'oro sottile scende dal buio sul suo centro con una scintilla;
  - le torce si abbassano (b3fx 'pspot');
  - mai sulla porta né sugli ostacoli: se serve, va al punto libero più vicino.
- Drop: il boss va nel punto bloccato.
  - Da .00 a .28 cade (e.z da 260 a 0); sopra i 20 non si colpisce.
  - TONFO a .28 (0,77 s veri dopo il blocco; 0,71 a ×1,46): 26 nel cerchio r 46.
  - Poi un anello di 12 sfere d'ombra (16 nella fase 2) a 135 px/s, 12 ciascuna, da (x, y−16).
  - b3fx 'pdrop', shake 7, sfx boom e tre clic di legno.
- Punto debole: da .28 a .80 è un mucchio coi fili allentati e i colpi gli fanno +50%; la prima volta compare «Fili allentati!».
- Come si schiva: uscire dal cerchio dopo il blocco (bastano 0,4 s di corsa) o scattare all'impatto.

7. MANO DELL'OMBRA (hand, 2,4 s), solo fase 2
- Da .08 a .36, sul pavimento, l'ombra di una mano enorme (100 px, dita aperte) parte sotto di te e ti segue a 95 px/s.
- A .36 si blocca: il bordo diventa rosso-magenta e un cerchio rosso r 50 segna dove fa male.
- A .78 (0,69 s veri dopo il blocco, a ×1,46) la mano cade dal buio in un lampo: N3.puppeteer2Hand da z 260 a 0 in 0,08 s, preme 0,15 s, risale in 0,3 s.
  - 28 nel cerchio; la stanza trema (shake 9);
  - b3fx 'phand': una grande macchia d'ombra a forma di mano, crepe, polvere, torce magenta.
- Come si schiva: uscire dal cerchio dopo il blocco o scattare all'ultimo.
- Arriva subito dopo la furia, poi due volte a ogni giro.

ORDINE DELLE MOSSE
- Fase 1: Manate, Fili d'oro, Sei il mio burattino!, Burattini, Sipario e riflettore; poi da capo. Tra una mossa e l'altra 1,1–1,5 s di camminata.
- Fase 2: prima Il vero Burattinaio; poi Mano dell'Ombra, Manate a catena, Fili d'oro (col ritorno), Sei il mio burattino!, Mano dell'Ombra, Burattini (3), Sipario e riflettore (16 sfere); poi da capo dalla Mano. Tra una mossa e l'altra 0,7–0,95 s.
- Mai due mosse insieme. La presa in giro di 88 parte solo da 'walk'.

FASE 2 · IL VERO BURATTINAIO (rage, 3,2 s)
- Quando parte: sotto metà vita, appena è libero (in 'walk', 'taunt' o 'call', oppure alla fine di una mossa). Mai durante lasso, yank, snap, vanish, spot o drop.
- All'inizio:
  - e.p2; e.shell, così non si colpisce fino alla fine;
  - via le sfere in volo (G.eproj) e gli avvisi; i burattini restano;
  - fascia «L'Ombra tira i fili!» · «Fase 2» (1,6 s), barra 'rage', bossRage(e,'255,95,200').
  Non si usa b3phase, perché i suoi versi e l'arena arriverebbero troppo presto: li chiama il cervello a .80.
- A .62, .68 e .74: tre clac di legno (shake 1,5).
- A .80 la risata a due voci:
  - b3say(e,'angry') e, 0,15 s dopo, b3say(e,'ombra',true);
  - b3fx(e,'phase2') (torce magenta, la stanza trema), shake 8, vib;
  - tre anelli di luce magenta senza danno, come il ruggito del Golem.
- Alla fine: e.shell 0, poi la Mano dell'Ombra.
- Cosa cambia nel gioco:
  - mosse a ×1,15 (non lasso, yank e snap), pause di 0,7–0,95 s;
  - lo portano, a 88 px/s;
  - Mano dell'Ombra (nuova) e Manate a catena al posto delle Manate;
  - i Fili tornano dopo 2,2 s;
  - 3 burattini con gli occhi magenta, 16 sfere dopo la caduta;
  - la voce dell'Ombra sotto la sua.

ENTRATA (B3IN.puppeteer, BOSS_INTRO.puppeteer = 3,4 s)
- La telecamera lo inquadra; alone e aura arrivano solo a 2,58 s (prima e.em = .999).
- A 0 s: un carillon stonato (tre note che calano fuori tono) e il fruscio del sipario che sale (da 0 a 1 s).
- 1,05 s: il filo della testa («tac», shake 1,5, gli occhi viola sopra la croce).
- 1,29 s braccio destro, 1,50 s sinistro, 1,73 s ginocchio destro, 1,90 s sinistro: un «tac» ciascuno, shake 1.
- 2,04 s: è in piedi; dustRing e shake 3.
- Da 2,04 a 2,52 s: il cricchettio della testa che gira.
- 2,58 s: roar(), cioè il grido «Ah-ah!» (b3say 'cry' col wrapper di 88), shake 5, tre anelli bianchi.
- Da 2,72 a 3,4 s: l'inchino coi campanelli.

SCONFITTA (B3DIE.puppeteer, BDEATH.puppeteer = {dur 3,8, clou 1,75, snd 'magic'})
- setup:
  - i fili di tutti i burattini si spezzano insieme (scintille d'oro e viola, killE(m,true));
  - si puliscono gli avvisi del cervello;
  - la voce di 88 dice 'die' (il lungo «nooo»).
- tick:
  - a .12, .20, .28, .36 e .46 un «ping» (una nota alta del carillon) e una scintilla per ogni filo che si spezza (ginocchia circa 26 px sopra i piedi, braccia 45, testa 108);
  - polvere e scintille mentre crolla (.48–.70);
  - clac della croce a .70, clic delle palpebre a .84, «drin» del campanello a .86;
  - da .88 un applauso lontano dal buio (raffiche di rumore morbide e larghe, piano);
  - due note di carillon che si spengono a .90;
  - da .95 a 1 scintille d'oro che salgono: il sipario che si scioglie.

VOCE (B3VO.VB.puppeteer resta; i versi nuovi si aggiungono in .k)
- c_lasso «eccoti!»: tre sillabe svelte e-o-i, che sale e ricade, 0,5 s.
- c_drop «hop-là!»: 0,5 s.
- c_hand e ombra: la risata lenta e profonda dell'Ombra, «ha… ha… haaa». Tre sillabe tra 92 e 78 Hz con ro 0,5 e br 0,5, poi una o che scende a 62 Hz; 1,3 s.
- B3CUE.puppeteer = {slam:'c_slam', slam3:'c_slam', strings:'c_strings', puppets:'c_puppets', lasso:'c_lasso', vanish:'c_vanish', drop:'c_drop', hand:'c_hand'}; per lo snap 'hurt'.
- 'win' (quando cadi): la sua risata e, nella fase 2, sotto quella dell'Ombra.
- Il resto come oggi: cry, laugh, laugh2, hurt, angry, die, c_slam («hup!»), c_strings, c_puppets (la ridarella), c_vanish (il sussurro).

SUONI (radi e piano, mai sopra la voce, con gli strumenti che ci sono già)
- Il segnale: all'inizio di ogni attacco lo «zing» di una corda strofinata che sale (0,25 s, da 600 a 1.400 Hz) e due note alte dei campanelli del cappuccio. Deve distinguersi dal pizzicato della musica.
- Gli altri:
  - i clac di legno per gli strattoni e le giunture;
  - il clic delle palpebre;
  - il cricchettio della testa (otto clic in 0,5 s);
  - il fruscio del velluto del sipario;
  - il «tok» e lo scricchiolio delle botole;
  - il «fwip» del lazo e il «twang» quando si spezza;
  - l'arpeggio del riflettore;
  - il tonfo della caduta coi clic di legno;
  - il soffio profondo della Mano.

L'ARENA CHE REAGISCE (b3fx)
Restano 'pslam', 'pstrings', 'ppuppet', 'psink' e 'phase2'. Il cervello avvolge b3fx per le chiavi nuove:
- 'pchain' (i primi due colpi della catena): ostacoli che tremano (110 px), sei schegge, crepe r 28, torce magenta per 0,5 s;
- 'ptrap' (si apre una botola): una macchia d'ombra r 12, quattro schegge, scintille d'oro;
- 'plasso' (parte il filo): torce d'oro (magenta nella fase 2) per 0,4 s;
- 'pspot' (il riflettore cerca): torce basse ('dim') per 1,2 s;
- 'pdrop' (il tonfo): ostacoli che tremano (170), polvere dal soffitto, dodici schegge, crepe r 44, macchia d'ombra r 26, erba piegata;
- 'phand' (la Mano): ostacoli che tremano forte (220), polvere dal soffitto, crepe r 56, una macchia d'ombra r 44 con cinque dita (macchie r 9 sulle punte), torce magenta per 1,2 s.

COSA TENERE DEL BOSS DI OGGI
- La stanza: il Teatro delle Ombre (B3V.puppeteer, con radici, ossa e crepe), col cerchio di rune 'ombre' viola che diventa magenta (RUNEC). È il palco.
- I servitori: il nemico 'puppet' e il suo cervello (EUPD.puppet di 81), col modello nuovo 'puppet2'. EUPD.puppet si avvolge: 'spawn' per 0,8 s quando esce dalla botola, e niente sfere mentre l'eroe è legato.
- Il filo d'oro che spazza la stanza (b3thread e b3cover di 81, b3threadFx di 87), le sfere d'ombra ('shadow'), la musica 'burattinaio'.
- BBFX: la barra si rompe in coriandoli d'oro che salgono (c '#351a6e', f '#ffcd45', k 'rise').
- B2T e il traguardo «Il sipario cala».

COSA CAMBIA
- BOSS_INTRO 3,4, B3IN, BDEATH, B3DIE.
- ETELE vuoto: gli avvisi li disegna il cervello.
- B2H 105, ECOL '#6e42b8'.
- B2CALM: si aggiungono 'call', 'snap', 'spot', 'yank', 'drop' e 'rage'.
- Il testo della guida (BEST): «Boss. Una marionetta gigante appesa ai fili d'oro: prima di ogni colpo si accendono i fili del braccio o delle gambe che colpiranno. Manate, un filo di luce che spazza la stanza, un filo che prova a legarti (scatta per spezzarlo), burattini dalle botole, e cala dal riflettore. A metà vita si vede chi tira i fili.»

DISEGNI DEL CERVELLO
- In drawHazards2Ground: gli avvisi a terra, le botole, il cerchio del riflettore, l'ombra della mano.
- In drawHazards2Air: il filo del lazo, il cono del riflettore, la mano che cade, le scie.
- Tutto sta in G.pu2, che si pulisce a ogni stanza (buildRoom) e quando la partita non è in gioco.

PER LE PROVE (BCL.puppeteer)
- n: «Il Burattinaio d'Ombra», arena 8, p2 true.
- enter(): come quella del Golem, ma con l'arena 8.
- moves: ['slam','strings','lasso','yank','snap','puppets','vanish','spot','drop']; moves2: ['rage','hand','slam3'].
- hz(): cerchi, botole, burattini, lazo, riflettore, mano, fili, onde, sfere.
- voice: ['cry','laugh','angry','die','c_lasso','c_drop','c_hand'].

MODELLO FINTO (anteprime/boss2/puppeteer_stub.js)
Il Burattinaio di oggi fa le mosse nuove così:
- slam e slam3 → slam;
- strings → strings, puppets → puppets, vanish → vanish;
- lasso, yank e hand → prep;
- snap e rage → hit;
- drop → enter, col p ricontato (il .28 della caduta corrisponde al .5 dell'atterraggio di enter);
- taunt e call → taunt;
- enter → enter, die → die.
In più N3.puppet2 è il burattino di oggi, con spawn → idle. Se mancano N3.puppeteer2Hand e Trap, il cervello ha un disegno semplice suo, come g2art del Golem.

DIFFICOLTÀ
Da misurare con boss2diff.js contro il Burattinaio di oggi, che fa perdere 6 vite al minuto con l'eroe fermo. Obiettivo 5,5–7, di più nella fase 2; chi si muove ne perde molte meno. Da regolare giocando.

## Voti del direttore artistico

Giudizio severo sui criteri della richiesta: possente, bello, figo, che dia timore; un po' più cupo ma da Classica; abilità migliori e giuste per l'arena 9; fattibile bene con la cassetta 3D; all'altezza del Golem nuovo.

«marionetta» 8,7/10 · VINCE
+ Il segnale più giusto dopo il cuore del Golem: si accendono e si tendono i fili dell'arto che colpirà, la croce si piega da quella parte, e quando i fili sono molli è indifeso. Si legge da lontano anche col corpo coperto, perché i fili stanno in aria.
+ La fase 2 cambia davvero aspetto e abilità ed è il momento più forte dei tre: «chi lo muove?», due occhi magenta e una mano d'ombra gigante sopra la croce; da lì non cammina più, lo portano. Fa paura senza niente di brutto.
+ Entrata e sconfitta sono le più recitate e fanno il paio col Golem: lì la statua che si risveglia, qui i fili che si tendono uno a uno e poi si spezzano uno a uno, e resta un giocattolo.
+ Legno, avorio, velluto e oro sono i materiali da giocattolo di Clash Royale; il corpo è umanoide, con braccia e gambe a due ossa: il metodo dello spaventapasseri ci sta come un guanto.
+ Abilità da teatro vero (botole, riflettore, un filo che prova a fare di te il suo burattino), con premi chiari per chi gioca bene (filo spezzato, fili allentati).
− Con croce e Ombra arriva a 230: copre l'eroe ed esce dallo schermo. La testa che gira di 150° e la mascella da ventriloquo sono troppo vicine all'horror e ai movimenti degli zombie. Il berretto fa sparire il cappuccio a punta col sonaglio di oggi. Le braccia proposte (39) non arrivano alle pose che chiede («pugni sopra il berretto»). I tempi non tengono conto della velocità dell'arena 9 (il dt dei boss è già ×1,24–1,27): con la fase 2 a ×1,25 diversi avvisi scenderebbero sotto 0,6 s. Il sipario viola si perde sul cerchio di rune, che è viola anche lui.

«marionettista» 8,0/10
+ Il più sontuoso: velluto rosso, maschera di porcellana che sorride sempre, un teatrino buio dentro il vestito. Un punto debole che nasce dal carattere (l'inchino del vanitoso), il Gran Finale che prepara il riparo per il filo (come Frana e Raggio del Golem), l'occhio di bue col bordo rosso.
− Una clessidra slanciata: elegante, non possente. Il rosso prende il posto del viola già approvato. Due teli che si aprono su un teatrino interno sono difficili da fare bene in 3D (si compenetrano, e l'interno deve vedersi da ogni lato). Dieci dita lunghissime e braccia di fumo sono tratti da zombie. «Il burattino sei tu» mette due avvisi di fila più una tirata: troppo per un bambino. Tre inchini a ogni giro sono troppi regali.

«ragno» 6,9/10
+ La sagoma più minacciosa (appeso al filo, sei braccia a corona sopra la testa) e le idee più originali: l'arpa di fili che suona la sua musica, la gabbia con la porta dalla parte opposta, la calata dal buio.
− Ragno, sei occhi e sei braccia sono un salto verso l'orrore per i bambini e trasformano il burattinaio approvato in un altro mostro. Sei braccia con l'ik diventano un groviglio sullo schermo piccolo e costano tanto da disegnare. Nella fase 2 la ragnatela su tutta la stanza si confonde col Filo d'oro e affolla l'arena.

Cosa entra dalle altre due.
- Dal «marionettista»: il sipario rosso da teatro (nell'entrata si alza, nel Sipario cala davanti a lui, alla fine cala sul mucchio); i campanelli come avviso, che si sente anche col boss fuori schermo; l'occhio di bue col bordo rosso; i burattini che, quando li rompi, feriscono il padrone; la tirata che non ti porta mai più vicino di 70 px e va sempre al tempo della fase 1.
- Dal «ragno»: il filo sottile che scende dal buio sul riflettore; il ritorno del Filo d'oro solo dopo 2,2 s, così lo scatto si ricarica; il ricamo sul dorso, per riconoscerlo di spalle; nella fase 2 mosse «più fitte, non più corte».

Correzioni alla vincitrice:
- cappuccio da giullare a due punte coi campanelli, erede del cappuccio col sonaglio di oggi;
- testa che gira di 110°, e solo da fermo e nell'entrata; il giro intero solo per scherzo, nella presa in giro;
- braccia più lunghe (21 + 20);
- croce più bassa (z 158) e Ombra più bassa (z 175–225), con o.veil e o.mini;
- avvisi rossi per ogni danno;
- tempi ricontati sulla velocità dell'arena 9; nella fase 2 le mosse vanno a ×1,15 e le pause sono più corte.
