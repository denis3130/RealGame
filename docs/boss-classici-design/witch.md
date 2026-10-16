# Strega delle Radici: il design finale

(Deciso dal direttore artistico tra tre proposte, 16 ottobre. Tipo nel gioco: `witch`; modello `sprite/nemici3d/witch2.js`.)

## Il design

LA SIGNORA DELLE RADICI · la Strega delle Radici, Signora della cripta
Nel gioco restano il tipo 'witch', l'arena 5 «Cripta Risvegliata», il nome, il titolo, la vita e il santuario. Il modello è 'witch2' in sprite/nemici3d/witch2.js: un corpo tutto suo, fatto con la cassetta C3 e il metodo dello spaventapasseri (l'Arciere e disegno_eroe.js non si toccano).

IDEA
Secoli fa ha piantato il suo trono nel santuario e ha lasciato che il bosco le crescesse addosso. Non è più la maghetta col bastone. È una strega altissima, dritta e calma, tre volte e mezzo l'eroe. Non cammina: scivola, tirata da un groviglio di radici vive che le fanno da piedi e da strascico.
- Porta un abito di corteccia coperto di foglie verde bosco e un collare di foglie a ventaglio dietro la testa.
- Ha il viso pallido di betulla e due occhi verde menta che brillano sotto un alto cappello a punta storto, intrecciato di rami, con i boccioli viola accesi e tre lanterne di spore appese alla tesa: sono la corona di rami e le lanterne di oggi.
- Sul petto ha il Seme del Bosco, il suo cuore. Prima di ogni incantesimo la sua luce corre nelle vene della corteccia fino alla parte che colpirà.
- Fa timore perché ti guarda sempre e sorride freddo; le dita, lunghe come rametti, tamburellano e scrocchiano prima di ogni magia. Tutto il santuario le obbedisce: mani di rami escono dal pavimento, le radici spaccano le lastre, il segno dell'altare spara.
- È figa perché ogni mossa si legge da lontano, e a metà vita arriva il suo autunno: le foglie diventano color brace e cadono in tempesta, il cappello mette corna di rami con lanterne arancioni e quattro radici spinose le girano intorno nel pavimento come pinne.
- Resta della Classica: forme tonde da giocattolo, colori pieni, occhi con la lucina, due zannette, niente sangue né ferite. È la cattiva delle fiabe, non l'horror.

SILHOUETTE E MISURE
Scala sc 1, unità = px. x avanti, y alla sua destra, z su. [0,0,0] è il punto dei piedi, che il gioco mette 8 px sotto il suo punto.
- Altezze: 128 in punta al cappello (134 nella fase 2). Testa con il centro a 89 e il mento a 75; la cima (102) sta dentro il cappello. Spalle a 74, larghe 29. Vita a 52, larga 17.
- Larghezze: orlo largo 46; piedi di radice fino a 37 avanti; strascico 48 dietro l'orlo; braccia aperte 136 da punta a punta; ombra 30 × 12.
- Sagoma:
  - un triangolo alto e stretto che si apre in basso (campana di foglie e radici), con la vita sottile;
  - in alto, il ventaglio del collare dietro la testa e sopra il cono storto del cappello, con la punta piegata indietro e un bocciolo acceso in cima;
  - di lato è una cometa: la figura dritta con la coda di radici a terra.
- Da lontano si leggono tre cose:
  - il cappello a punta storto. Nessun altro boss ce l'ha: il Burattinaio porta un cappuccio morbido viola, la Regina dei Ghiacci punte dritte e simmetriche;
  - il viso chiaro con i due occhi menta dentro il buio dei capelli e del collare;
  - la base larga che striscia.
- Tutto è un po' storto e asimmetrico: la punta del cappello va indietro e alla sua sinistra, due lanterne stanno a sinistra e una a destra, il sorriso è storto. È legno vivo, mai cristallo.
- Fase 2: il cappello mette due corna di rami storte con le lanterne (più largo in alto) e la punta sale a 134; quattro radici guardiane alte 26 le girano intorno a 58. Diventa un albero con un cerchio di pinne.
- Nel gioco: raggio 26 (oggi 20), vita 2.300, contatto 18.

PEZZI NELLA POSA DI RIPOSO
Ogni pezzo è attaccato a un punto del corpo. L'ordine di disegno si prende dalla posa di riposo (parts + run).
- Telaio: frame con lean (a riposo −0,04: busto un poco indietro, mento alto), roll e yaw. Tutto quello che sta sopra l'orlo segue il frame.
- Gonna:
  - revo con il profilo [z, r]: [0, 23] [8, 22] [18, 19,5] [30, 15,5] [42, 11,5] [52, 8,5], profondità AX 0,92;
  - sotto è corteccia; sopra ci sono tre giri di foglie a scaglie, con la punta in giù e un poco in fuori, posate con revoAt (normale vera, girano a 360°);
  - giro alto a z 43: 7 foglie 13 × 5,5. Giro di mezzo a z 30: 9 foglie 16 × 6,5. Giro basso a z 16: 10 foglie 18 × 7,5. In tutto 26 foglie; con LOWFX solo i due giri bassi;
  - all'orlo la corteccia si rompe in 8 radichette corte (catene di 2 punti lunghe 6, r 2 → 1).
- Busto (corsetto di corteccia):
  - ellissoide con il centro in [0, 0, 64] e raggi [8, 11,5, 13];
  - tre file di placche tonde dipinte (contorni con surfLine, due toni) e tre solchi, le vene, che salgono dal seme alle spalle;
  - cintura di tre radici intrecciate a z 52 (surfLine spessa 2,5, fili #170c07).
- Seme del Bosco (il cuore): ovoide lucido in [8,2, 0, 66], r 3,4, con il guscio viola e il cuore menta che pulsa, tra due foglioline 6 × 3 ai lati.
- Spalle: nodi di corteccia in [−1, ±14,5, 74], sball r 5,5.
- Collo: capsula di pelle da [0, 0, 74] a [1,5, 0, 79], r 3,5 → 3.
- Collare:
  - 5 foglie grandi e larghe, con la punta tonda e non a lancia: niente deve sembrare orecchie;
  - sono piantate dietro le spalle e il collo a z 72–76, a ventaglio da −55° a +55° intorno al dietro, piegate indietro di 25°;
  - la centrale (27 × 10) arriva a z circa 103, dietro la base del cappello; le due di mezzo sono 24 × 9; le esterne 20 × 8, più basse (z circa 95);
  - nervatura chiara, rovescio un tono più chiaro;
  - da davanti incorniciano testa e cappello, da dietro coprono la nuca.
- Testa (ha la sua telecamera, Vat, per guardarsi intorno e piegarsi):
  - ellissoide con il centro in [3, 0, 89] e raggi [9,5, 10, 13];
  - mento a punta: capsula da [8, 0, 79] a [10, 0, 75,5], r 3 → 1,6;
  - naso lungo e sottile con la punta un po' in giù: catena [10,5, 0, 91] → [13,5, 0, 87,5] → [14,5, 0, 85] → [13,8, 0, 84], r 1,7 → 1,3 → 1,1 → 0,9;
  - zigomi alti con l'ombra sotto.
- Capelli di muschio nero:
  - due ciocche davanti, dalle tempie [4, ±9,5, 92] fino a [6, ±12, 60] davanti alle spalle (catene di 5 punti, r 3 → 1,5, un'onda leggera);
  - tre ciocche dietro, dalla nuca [−7, 0 e ±6, 90] fino a [−10, 0 e ±7, 62], sotto il collare (r 3,5 → 1,8);
  - qualche fogliolina impigliata.
- Cappello (ha la sua telecamera, Vat, come il cappello dello spaventapasseri: si storce, cade e sprofonda per conto suo):
  - perno sulla testa in [1, 0, 98], inclinato indietro di 0,18 rad, così la tesa davanti si alza e lascia vedere gli occhi;
  - nel suo spazio, cono revo [0, 11,5] [5, 9,2] [10, 7] [15, 5] [20, 3,4] [23, 2,6];
  - poi la punta storta, una catena [0, 0, 23] → [−2,5, −1, 26,5] → [−5,5, −2,5, 29] → [−7,5, −3,5, 30,5] → ricciolo [−8,5, −2,5, 29,5], r 2,6 → 2 → 1,5 → 1,1 → 0,9, con in cima il bocciolo grande (sball r 3);
  - intreccio: tre fili a spirale (1,5 giri) e tre cerchi di treccia dipinti con surfLine (#1f120c, spessi 1), più tre foglioline verdi infilate nel cono;
  - tesa: 7 rametti corti che escono dal cerchietto (lunghi 5–8, r 1,5 → 0,8, un po' su e un po' giù), ai lati e dietro, nessuno davanti al centro, perché il viso resti libero;
  - boccioli viola accesi in [5,5, −6, 9], [−4, 6,5, 13] e [3, 3, 18] (r 2,1), più quello in punta;
  - tre lanterne di spore appese ai rametti della tesa: due alla sua sinistra ([−3, −13, 0] e [4, −12,5, 0]) e una a destra dietro ([−6, 12, 0]). Ognuna pende da un filo di 6–8 (seg): baccello sball r 2,6, con il calice di foglia e il cuore che brilla, a pendolo ±0,2 rad (il pendolo dipende solo da p).
- Braccia (due ossa con ik, shadeLimb, corteccia scura):
  - spalla in [−1, ±14,5, 74]; omero 18 (r 3,6 → 3), avambraccio 18 (r 3 → 2,4), nodo al gomito r 3,4;
  - maniche: tre foglie lunghe 16 × 6 appese all'avambraccio sotto il gomito; seguono il braccio, mai a caso;
  - a riposo: gomiti in [−2, ±19, 58] (fuori e in basso), polsi in [10, ±5, 53], mani unite a punta davanti alla vita, polpastrelli contro polpastrelli in [15, 0, 54]. È la posa del cattivo che aspetta.
- Mani (pelle chiara: sono due punti chiari che si leggono da lontano):
  - palmo ellissoide 6 × 4,5 × 2,2;
  - tre dita più il pollice. Dita di tre pezzi 5 + 4 + 3 (r 1,9 → 1,6 → 1,3, punta 1,1); pollice di due pezzi 4 + 3 (r 1,9 → 1,3);
  - anelli di corteccia scura alle nocche, unghie come spine chiare e tonde (#efe3c8);
  - le punte si accendono come candeline (fiammelle menta) quando lancia: otto punte in tutto;
  - le mani si ordinano da dove stanno in quel momento, come i pugni del Golem.
- Piedi di radice (con una striscia di muschio sul dorso):
  - due grandi davanti, da sotto l'orlo: [10, ±7, 3] → [24, ±10, 2] → [33, ±12, 0,5] → [37, ±13, 0], catene r 4,4 → 3,4 → 2,4 → 1,5, con la punta che afferra il pavimento piegandosi in giù;
  - due piccoli ai lati: [2, ±20, 2] → [6, ±27, 0,5] → [7, ±31, 0], r 3 → 1,2.
- Strascico:
  - parte dal dietro dell'orlo, in [−16, 0, 4];
  - tre radici grosse intrecciate: catene di 6 punti da [−16, −5/0/5, 4] a [−64, −8/0/8, 0], r 5 → 1,6;
  - due radici sottili: da [−14, ±12, 3] a [−52, ±18, 0], r 2,6 → 1;
  - muschio sul dorso, foglioline e tre funghetti viola che brillano, gli stessi del santuario, in [−40, −6, 3], [−48, 5, 2] e [−56, −1, 1,5] (cappello r 3, 2,5 e 2);
  - segue o.mv: si piega dalla parte opposta al movimento, al massimo ±70° dal dietro, con un'onda che va dai fianchi alla punta;
  - è più scuro e rossiccio delle radici dipinte sul pavimento, con il bordo chiaro e l'ombra sotto, così non si confonde.
- Ombra: floor() con rx 30, ry 12, alfa 0,32, più un'ombra più chiara sotto lo strascico.
- Fase 2 (o.p2):
  - colori d'autunno;
  - cadono il giro alto della gonna e le due foglie esterne del collare; tra le foglie rimaste si vede la corteccia con le vene accese;
  - il collare resta di tre foglie seghettate con le spine e due rametti spinosi;
  - il cappello mette due corna di rami storte, che nel suo spazio vanno da [0, ±8, 8] a [−2, ±18, 22]: quello sinistro più alto (fino a z 124), quello destro più basso (z 118), due lanterne arancioni ciascuno;
  - la punta si allunga e si raddrizza fino a 134;
  - i boccioli diventano lanterne (alchechengi), gli occhi ambra, il seme oro;
  - lo strascico si ingrossa del 15% e mette le spine;
  - ogni tanto cade una foglia (non con LOWFX né con o.noFx).
- Radici guardiane (solo fase 2, o.orb e o.guard):
  - quattro radici spinose le girano intorno tagliando il pavimento come pinne, a 58 da lei sul pavimento. Sullo schermo stanno a (58·cos, 58·sin·0,55) dai piedi: è la stessa telecamera;
  - gli angoli nel mondo sono o.orb + k·π/2; nel suo spazio il modello li mette a o.orb + k·π/2 − face;
  - ognuna esce 26 dal pavimento: catena di 4 punti, r 5 → 1,8, piegata di 25° in avanti nel verso in cui gira, con tre spine chiare e un nodo arancione acceso a due terzi dell'altezza; alla base, un'onda di terra e foglie.

COLORI

FASE 1 (chiaro · medio · scuro):
- Corteccia (busto, braccia, gonna sotto le foglie, piedi di radice, strascico): #9a6040 · #52301f · #24120b. Solchi #170c07. Vene spente #3a2016, accese #7bf0c0 (bagliore 123,240,192).
- Corteccia intrecciata del cappello, più calda e chiara perché la punta si stacchi dal buio del collare: #b07a4e · #6a4228 · #2e180c. Fili dell'intreccio #1f120c.
- Foglie (gonna, collare, maniche, foglioline): #5fae6c · #2a6a44 · #10351f. Nervatura #8fd8a0, rovescio #3a7a52.
- Muschio (dorso di strascico e piedi): #3f6a2a · #4f8a34, punte #86b84a.
- Pelle (viso, collo, mani): #e6efd8 · #b6c9a4 · #6d8468. Ombra sotto gli zigomi rgba(70,40,70,.22).
- Bocca e palpebre: palpebre prugna #3a2440 (bordo alto #5a3460), labbra #4a2a40, interno della bocca #2a1424, lingua #b0506a, zannette #fff6e8.
- Occhi: #7bf0c0 (dentro #c8ffe8), lucina #ffffff, bagliore 123,240,192.
- Capelli di muschio nero: #1e2a1c, riflesso #3f5a34, punte #55703e.
- Boccioli: #e0b0ff · #a15ad0 · #5a2a8a, bagliore 190,120,255, come i funghi del santuario.
- Lanterne di spore: buccia #3f8a6a · #2a5e48, calice #2a6a44, cuore #c8ffe8, bagliore 123,240,192.
- Seme: guscio #c48ae8 · #8a4ab8 · #4a2070 (il viola dell'arena), cuore #7bf0c0 con la lucina.
- Funghetti dello strascico: cappello #9a5ad0 / #7a3ab0, puntini #e8c8ff, gambo #e8dcc8, bagliore 190,110,255.
- Unghie e spine: punta #efe3c8, base #52301f.
- Fiammelle delle dita: cuore #e8fff4, bagliore 123,240,192.

FASE 2 (l'autunno, un'onda che scende dal cappello all'orlo):
- Foglie: #ffb04a · #d0602a · #7a2a18. Nervatura #ffd27a; qualche foglia secca #9a6a3a.
- Corteccia: #8a5a3a · #4e2e1e · #22120b. Vene accese #ff8a3c (bagliore 255,138,60).
- Cappello: #a06a40 · #5a3420 · #26140a.
- Occhi: #ffb03c (dentro #ffe0a0), bagliore 255,150,60.
- Seme: cuore #ffcf6a, bagliore 255,190,90.
- Lanterne d'autunno (alchechengi): #ffd27a · #ff8a3c · #a3401a, cuore #fff0c0, bagliore 255,170,80.
- Funghetti: #ff9a3c / #c2561c, puntini #ffe0b0, bagliore 255,150,60.
- Spine delle guardiane e dello strascico #efe3c8, nodo #ff8a3c.
- Fiammelle: #fff0d0, bagliore 255,170,80.

SCONFITTA:
- Foglie secche: #c49a64 · #8a6a3e · #4a3420.
- Corteccia secca: #8a7a6a · #5a4e42 · #2a221a.
- Germoglio #7fd36a con il bocciolo #7bf0c0.
- Fiorellini #f4ecff · #c48ae8, con il cuore #ffd23c.
- Lucciole #c8ffe8.

PERCHÉ QUESTI COLORI:
- La tinta dell'arena 5 colora solo pavimento e muri, non lei. Una foto della stanza dal gioco mostra: lastre grigio malva #605056 · #5b4b51 · #69575e, muschio rosa #9f4862, radici dipinte viola #50426e, funghi dipinti verde acqua #009658 con la luce viola, altare #7f6d76, torce menta.
- Nell'Abisso e nella sfida del giorno lo stesso santuario non è tinto: lastre grigio verde #4f564a, radici marroni #5f4430, muschio verde.
- La sua massa è un verde bosco freddo: complementare al malva, più scuro e più saturo del grigio verde. Così si stacca su tutti e due i pavimenti.
- La corteccia è scura, più rossiccia delle radici dipinte. Viso e mani sono chiari. Le luci menta e viola stanno solo dove contano.
- «Un po' più cupa»: domina il verde scuro, le ombre sotto cappello e collare sono forti, le luci sono piccole e intense.
- Nella fase 2 l'arancio sul malva salta fuori ancora di più.

VISO E OCCHI
- Ovale lungo con il mento a punta, naso lungo e sottile con la punta un po' in giù (da strega, ma tondo), zigomi alti con l'ombra sotto.
- Occhi:
  - grandi, a mandorla, verde menta, che brillano: C3.eyes 'glow', rx 3,3, ry 2,2, dir [1, .36, .1];
  - hanno la lucina bianca e niente pupilla;
  - sopra, palpebre pesanti color prugna coprono il terzo alto dell'occhio e scendono verso il naso: sguardo a V, cattivo ma non orribile;
  - l'angolo esterno della palpebra è un po' allungato, come un trucco;
  - sbatte le palpebre piano.
- Bocca:
  - una linea sottile color prugna e un sorriso storto: l'angolo alla sua sinistra sale di 1, l'altro scende di 0,5;
  - due zannette bianche piccole (C3.mouth 'fangs', fh 1,4) che si vedono sempre un poco;
  - quando grida o ride la bocca si apre scura ('open': due zannette in alto, lingua prugna).
- Luce:
  - in alto il viso è in ombra (cappello e collare), il mento è in luce;
  - quando lancia, la luce menta delle dita le illumina il viso dal basso: un alone morbido sul mento e sotto il naso, come le luci da cinema di Archero 2. Non con LOWFX.
- Niente rughe e niente orbite nere: non deve mai sembrare un teschio. L'occhio brilla dentro la palpebra prugna e il viso resta caldo, mai grigio.

IL SEGNALE CHE AVVISA I COLPI
Il Seme del Bosco sul petto è il suo cuore: batte piano col respiro, con una luce morbida. Prima di ogni incantesimo il seme fa un lampo e una perla di luce menta, con la sua scia, corre in 0,3 s lungo le vene della corteccia fino alla parte che colpirà:
- Spirale: su per le due braccia. Le otto punte delle dita si accendono una a una, con uno scrocchio ciascuna, e dietro la testa compare l'aureola di spine.
- Mano del Bosco: su per un braccio solo (o per tutti e due). Quelle quattro punte ardono forte.
- Radici della Cripta: giù per l'abito. Lo strascico si accende dai fianchi alla punta.
- Giardino: su per il collo fino al cappello, dove si gonfiano i boccioli.
- Rito: tutte le vene insieme, poi giù nel pavimento lungo i tre bracci del segno.
- Sprofonda: al contrario, le luci si spengono (occhi, dita, seme) e restano accesi solo i boccioli del cappello.

Il giocatore impara a guardare il seme e la luce che corre. Anche il suono avvisa: lo scrocchio delle dita (crick… crick) quando la luce arriva alle punte, uno scricchiolio di legno per lo strascico, un rintocco morbido per il cappello. La magia si sente arrivare come il tum-tum del Golem. Nella fase 2 la luce è arancio. Con LOWFX la perla corre lo stesso, perché è l'avviso, ma senza alone.

PITTURA, COSTRUZIONE E COSTO
- Si dipinge come la lanterna:
  - tre toni su ogni pezzo, bordo illuminato caldo (rim), shadeLimb su braccia e radici;
  - glowTop su boccioli, lanterne e punta del cappello;
  - contorno INK #1b1612 spesso: 2,6–3 sui pezzi grandi, 2 su dita, rametti e foglie;
  - segni leggeri: solchi della corteccia, nervature, intreccio;
  - bagliori morbidi solo su occhi, seme, boccioli, lanterne, dita accese e funghetti.
- Materiali da giocattolo: corteccia liscia come legno intagliato (placche tonde con solchi morbidi), foglie come feltro lucido con la nervatura chiara, boccioli e lanterne come perline di vetro che si accendono, pelle opaca.
- Foglie:
  - la mandorla (o il petalo tondo del collare) è un Path2D calcolato una volta sola;
  - ogni foglia si disegna con path.addPath(foglia, matrice), dove la matrice è la proiezione dei suoi due assi. La telecamera è parallela, quindi una foglia piatta si proietta esatta con una trasformazione affine, e il contorno resta spesso uguale;
  - il tono è piatto (chiaro, medio o scuro), scelto da quanto la foglia guarda la luce, come le facce del Golem; più la nervatura.
- Strumenti:
  - testa e cappello con la loro telecamera (Vat);
  - braccia con ik;
  - dita come quelle dei guanti del Burattinaio (chain);
  - revo e revoAt per gonna e cappello;
  - surfLine per cintura, placche, intreccio e vene.
- Ordine di disegno:
  - dalla posa di riposo;
  - le mani da dove stanno in quel momento;
  - i pezzi del cappello intorno al cono: rametti e lanterne di dietro prima del cono, quelli davanti dopo;
  - le radici guardiane per profondità.
- LOWFX: niente aloni né foglie che cadono, due giri di foglie invece di tre, capelli e lanterne fermi, perle delle vene senza alone, dita a due pezzi, niente luce da sotto sul viso.
- Costo: mediana di 1,2–1,5 ms a fotogramma (il Golem 1,2), meno di 1 ms con LOWFX; la stanza intera con lei sotto i 3,5 ms.

LE MOSSE DEL MODELLO
Tutti i momenti p sono nell'elenco «mosse», che fa parte di questo design. Ogni mossa dipende solo da p.
Durate in secondi del modello: idle 3,2 · walk 1,4 · hit 0,6 · hand 3,0 · spiral 3,2 · sink 1,1 · fin 0,6 · rise 1,2 · fix 1,0 · roots 2,8 · sow 1,8 · rite 4,8 · rage 2,8 · taunt 1,2 · enter 3,2 · die 4,0.
In sintesi:
- idle: respira, si guarda intorno, le dita tamburellano, la radice fa tic-tic, boccioli e lanterne sono vivi.
- walk: scivola dritta, le radici davanti afferrano a .25 e a .75, lo strascico segue o.mv.
- hit: testa indietro, occhi strizzati, cappello che traballa (solo per fogli e pagine).
- hand:
  - luce nel braccio .00–.12, mano in alto .00–.24;
  - dita che si allungano in radici dentro il pavimento .24–.32;
  - tiene .32–.80 e stringe a .80 (con due mani la sinistra a .90);
  - strappa fuori .88–1 (con due mani .92–1).
- spiral:
  - luce .00–.10, braccia larghe e otto candeline .10–.27;
  - colpo .27–.85: l'aureola gira, i polsi ruotano, l'abito si apre a campana;
  - con o.p2 lampo a .46 e schiocco a .55;
  - ritorno .85–1.
- sink: bozzolo .00–.25, giù girando .25–.75 (fuori resta il cappello), la terra si chiude .75–1.
- fin: ciclo con la punta del cappello che fa da pinna.
- rise: colonna di radici .00–.12 (il colpo a .12), sale .12–.30, si apre come un bocciolo .30–.55, braccia aperte a .58, ricade .62–1 lasciandole il cappello storto.
- fix: si raddrizza il cappello con due tirate (a .38 e a .60); il seme brilla, è scoperta.
- roots: luce giù .00–.10, strascico su .10–.20, tuffo nel pavimento .20–.26, tiene .26–.90, lo strascico esce .90–1.
- sow: luce su .00–.15, boccioli che si gonfiano .15–.35, li coglie .35–.45, li semina a .50, guarda .55–1.
- rite: braccia al cielo .00–.08, canto con otto scoppi (da .27 a .92), riprende fiato .95–1.
- rage:
  - si stringe il petto .00–.20;
  - grido e onda di colore .20–.45;
  - corna del cappello e lanterne .45–.60;
  - tempesta di foglie, occhi ambra a .62, guardiane che escono .62–.74;
  - sorriso .80–1.
- taunt: soffia sulle candeline (da .22 a .49), sorride, fa «vieni, vieni» con l'indice (a .76 e a .88), le fiammelle si riaccendono.
- enter: bocciolo .00–.20, petali .20–.45, si alza .45–.70, occhi a .72, cappello a .75, scrocchi .76–.80, grido .82–.94.
- die: grido .00–.12, crepa nel cappello .12–.30, cappello a terra a .45 (momento clou a 1,8 s), diventa albero .40–.75, lucciole .75–.90, germoglio .90–1.

Raccordi: idle, walk e fin si chiudono su sé stesse; sink finisce dove comincia fin; rise comincia dove finisce fin e finisce dove comincia fix.

OPZIONI DEL MODELLO
- o.p2: fase 2 (autunno, corna del cappello, collare spinoso, guardiane).
- o.noFx: niente effetti della mossa (foglie che cadono, fumo, aloni, luce da sotto), perché li disegna il gioco.
- o.mv: angolo del movimento rispetto a dove guarda, nel walk (0 = avanti).
- o.orb: angolo nel mondo della prima radice guardiana (0 = verso la destra dello schermo, π/2 = verso chi guarda). o.guard da 0 a 1: quanto sono fuori (1 nella fase 2).
- o.hands: 1 destra, −1 sinistra, 2 tutte e due (hand).
- o.spin: verso iniziale della Spirale (+1 o −1); con o.p2 il modello lo inverte da .55.
- o.neat: in rise il cappello resta dritto (prima del Rito).
- o.k: in fin, quanto cappello esce (da 0 a 1).

DISEGNI DA ESPORTARE PER IL GIOCO
Sono dipinti come lei, come N3.golemSlab. x, y = punto del pavimento.
- N3.witchThorn(x, y, a, sc, o): la spina in volo lungo a. Lunga 12, scura col filo chiaro e la punta chiara, con la scia viola; con o.p2 la punta è di brace.
- N3.witchSeed(x, y, z, sc, o): il seme in volo, un ovoide viola lucido col cuore menta, r 4. Con o.p2 diventa una lanterna d'autunno arancio; o.spin è il suo rotolare. Serve per l'anello di Riaffiora (z 6) e per i semi del Giardino, alla z del loro arco.
- N3.witchHand(x, y, k, sc, o): la mano gigante di rami.
  - Tre dita e il pollice alti 60 (catene di tre pezzi, r 7 → 3,5, con nodi, muschio e punte chiare) escono su un anello di raggio 38 intorno al punto.
  - k .00–.18: escono aperte. k .18–.30: si chiudono sopra il centro, e a .30 c'è il colpo. k .30–.85: resta in piedi come un nodo di rami chiuso alto 44 (l'ostacolo). k .85–1: si sbriciola in foglie e rientra.
  - Opzioni: o.side (±1, specchio), o.p2, o.seed.
- N3.witchBump(x, y, a, k, sc, o): la gobba che corre sotto il pavimento, con a = verso del moto e k = il suo ciclo. Ha 4–5 schegge di lastra sollevate, radichette che spuntano e la crepa che dietro si accende di menta (arancio nella fase 2). o.stone porta i tre colori della lastra dal gioco.
- N3.witchRoot(x0, y0, x1, y1, k, sc, o): la radice spinosa che esce ad archi lungo un tratto di pavimento (le strisce e i bracci del Rito).
  - k .00–.30: esce a onda da (x0, y0) verso (x1, y1). k .30–.70: resta. k .70–1: rientra.
  - Archi lunghi 40 e alti 14, ognuno con due spine e il muschio sul dorso.
  - Opzioni: o.w (spessore; 1 = striscia di 26), o.gaps (tratti [d0, d1] dove resta sotto: gli ostacoli), o.p2, o.seed.
  - Deve essere leggera: un arco è un solo tratto spesso a tre toni.
- N3.witchHusk(x, y, face, k, sc, o): il guscio di corteccia con la sua sagoma, alto 70, vuoto, con le foglie secche. k .00–.60: intero (o.glow da 0 a 1 accende le crepe). k .60–.70: si spacca. k .70–1: si sbriciola.
- N3.witchSprout(x, y, k, sc, o): le radichette e le foglie che girano nel cerchio d'arrivo di Riaffiora (k è un ciclo); o.p2.
- N3.witchLeaf(x, y, z, rot, sc, o): una foglia che cade (o.p2 d'autunno, o.dry secca), per la tempesta dell'autunno, per le foglie dal soffitto e per gli effetti.

CONTROLLI PRIMA DI CONSEGNARE
1. Le quattro direzioni e i 16 angoli, nel foglio:
   - il collare sta dietro la testa vista da davanti e davanti alla nuca vista da dietro;
   - il cappello ha la sua telecamera e la punta storta non si scambia mai con le corna della fase 2 girando;
   - naso e mento non si vedono mai da dietro né sopra il cappello;
   - le mani unite stanno davanti all'abito e da dietro spariscono;
   - lo strascico, quando lei dà le spalle, viene verso di noi e passa sotto l'eroe che le sta davanti;
   - le dita-radici della Mano sono tagliate dove entrano nel pavimento.
2. La tesa non copre mai gli occhi dalla telecamera del gioco: controllare in 8 direzioni e da vicino, nei menu e nelle anteprime.
3. Dita grosse alla base (r almeno 1,6), con punte chiare e tonde e i nodi: artigli di rametti da cartone, mai spaghetti né zampe di ragno. Le due mani si leggono come due punti chiari.
4. Viso pallido ma caldo, mai grigio da cadavere né teschio.
5. Costo misurato con tests/foglio3d.js.
6. Affiancarla al Burattinaio, alla Regina dei Ghiacci e al Cervo appena ci sono i loro modelli nuovi.
7. Nella pagina «prima e dopo» provarla su tutti e due gli sfondi: il malva dell'arena 5 e il grigio verde dell'Abisso.
8. Si deve riconoscere come la Strega di oggi: occhi menta, corona di rami coi boccioli viola (ora intrecciata nel cappello), lanterne di spore, magia menta e viola, spine.

## Le mosse del modello

| id | nome | secondi | descrizione |
|---|---|---|---|
| `idle` | Fermo | 3.2 | Ciclo chiuso. Sta dritta, busto un poco indietro, mento alto, mani unite a punta davanti alla vita. - Respiro: due per ciclo, con i picchi a .25 e .75; il corsetto sale di 1 px e le foglie del collare si aprono e si chiudono di ±4°. Il seme batte piano a .20 e .70. - Testa: si guarda intorno piano (look ±0,3 rad, roll ±0,06) e torna su di te; sbatte le palpebre a .62. - Dita: tamburellano una dopo l'altra, la destra a .32, .38 e .44 (indice, medio, anulare), la sinistra a .57, .63 e .69, poi si richiudono a punta. - Radici: il piede di radice destro alza la punta e batte due volte sul pavimento (tic-tic a .30 e .36, con un filo di polvere); la punta dello strascico si arriccia e si srotola (.70–.95). - Cappello: la punta ondeggia di ±3°, i boccioli pulsano due volte per ciclo, sfasati; le lanterne dondolano a pendolo. - Capelli: le ciocche ondeggiano piano, con un'onda dalla testa alla punta. - Con !noFx una foglia si stacca dal collare a .10, cade ondeggiando e sparisce a terra a .60. |
| `walk` | Scivola sulle radici | 1.4 | Ciclo. Non ha piedi: il busto scivola dritto, con un saliscendi di 1 px due volte per ciclo e il lean +0,06 verso dove va. Le mani restano unite e la testa ferma su di te: il gioco la tiene girata verso l'eroe e passa la direzione del moto in o.mv. - Le due radici davanti si allungano a turno verso dove va. La sinistra si allunga .00–.22, afferra a .25 (sbuffo di polvere, scricchiolio di legno) e tira .25–.50; la destra si allunga .50–.72, afferra a .75 e tira .75–1. Le due piccole ai lati seguono con mezzo tempo di ritardo. - Le foglie dell'orlo si piegano di 6° all'indietro rispetto al moto. Lo strascico striscia dalla parte opposta a o.mv, con un'onda dai fianchi alla punta (una per ciclo). Le lanterne dondolano col passo. - Fase 2: uguale, con le guardiane che girano (o.orb) e una foglia d'autunno che cade a ogni ciclo (!noFx). |
| `hit` | Colpita | 0.6 | Solo per fogli e pagine: nel gioco i boss non la usano. - Con hitK testa e busto vanno indietro (lean −0,25) e gli occhi si strizzano (.00–.40). - Il collare si arruffa (+12°), il cappello traballa di ±0,15 rad e torna, tre foglie saltano via (!noFx). - Da .40 si ricompone, offesa e a broncio. |
| `hand` | Mano del Bosco | 3 | Con o.hands: 1 destra, −1 sinistra, 2 tutte e due. - .00–.12: la luce corre dal seme lungo il braccio fino alle dita, che ardono (scrocchio a .12). - .00–.24: alza la mano sopra la testa e chiude le dita ad artiglio; la testa si piega verso di te col sorriso e la luce delle dita le illumina il viso da sotto. - .24–.32: abbassa il braccio teso in avanti e in giù (lean +0,25). Le quattro dita si allungano in radici, da 12 a circa 45, e si tuffano nel pavimento in [30, ±9, 0]; sono tagliate dove entrano, le lastre si alzano e c'è luce menta nelle crepe. - .32–.80: tiene, con le dita-radici tese, il braccio che trema appena (6 al secondo) e gli occhi fissi su di te. - .80: stringe. Le dita-radici tirano e la spalla scatta indietro: nel gioco la mano gigante si chiude. - .80–.88: tiene stretto. - .88–1: strappa le dita fuori tra sassolini e polvere; tornano dita, lei si raddrizza e riunisce le mani. - Con o.hands=2 lo fanno le due mani insieme (punti [30, +9, 0] e [30, −9, 0]): la destra stringe a .80, la sinistra a .90, tiene fino a .92 e strappa fuori .92–1. |
| `spiral` | Spirale di Spine | 3.2 | Con o.spin +1 o −1. - .00–.10: la luce corre su per le due braccia. - .10–.27: alza le braccia larghe come una direttrice d'orchestra e le otto punte si accendono una a una, con uno scrocchio ciascuna (da .11 a .25). - Intanto (.10–.25) dietro il collare cresce l'aureola: otto spine (coni lunghi 9, base r 2) su un anello di raggio 18 centrato in [−6, 0, 96], nel piano dietro la testa. Comincia a girare nel verso o.spin; il busto si abbassa di 2. - .27–.85, colpo: ruota piano i polsi con le dita aperte; l'abito si apre a campana (+8% all'orlo) e ondeggia nel verso del giro; il busto lo segue (yaw ±0,12); la bocca canticchia. Un lampo menta sull'aureola ogni 0,11 s: è una spina. - Con o.p2: a .46 l'aureola lampeggia forte (avviso); a .55 schiocca le dita sopra la testa, con le mani che si toccano in alto, e da lì aureola e polsi girano al contrario. - .85–1: le braccia scendono, l'aureola rientra nel collare, le dita si spengono e le mani tornano unite. |
| `sink` | Sprofonda | 1.1 | - .00–.25: si abbraccia, con le braccia incrociate sul petto. Lo strascico le si avvolge intorno a spirale come un bozzolo; occhi, dita e seme si spengono e restano accesi solo i boccioli del cappello. Ridacchia. - .25–.75: gira piano di mezzo giro e la terra la tira giù. Tutto quello che scende sotto il pavimento è tagliato, con un anello di terra e foglie che vorticano intorno al taglio. A .50 il busto è sotto; a .75 resta fuori solo la parte alta del cappello (18). - .75–1: la terra si richiude intorno alla punta. L'ultimo fotogramma è il primo di fin. |
| `fin` | La punta del cappello | 0.6 | Ciclo; o.k da 0 a 1 dice quanto cappello esce. - Fuori dal pavimento c'è solo la punta storta del cappello (18 con o.k=1), con i boccioli accesi. Ondeggia come la pinna di uno squalo (±8°). - Davanti ha un'onda di terra, schegge di lastra e foglie; dietro, una luce menta (arancio nella fase 2) filtra dalle crepe. - Il gioco la sposta. Quando passa sotto un ostacolo il gioco abbassa o.k a 0 e lo rialza subito dopo. |
| `rise` | Riaffiora | 1.2 | Con o.neat il cappello resta dritto. - .00–.12: spunta la punta del cappello, poi una colonna di radici attorcigliate esce dal pavimento intorno a lei; a .12 è fuori ed è il colpo della colonna. - .12–.30: la colonna sale girando fino a 70. - .30–.55: si apre come un bocciolo in cinque radici-petali che si piegano in fuori; dentro c'è lei in piedi, con le braccia incrociate. - .55–.62: apre le braccia di scatto con le dita accese; a .58 il gioco spara l'anello di semi. - .62–1: le radici della colonna ricadono e tornano strascico e piedi. Il cappello le è rimasto storto (inclinato di 0,4 rad alla sua sinistra, con la punta che pende), tranne con o.neat. - L'ultimo fotogramma è il primo di fix. |
| `fix` | Cappello storto | 1 | - .00–.18: alza gli occhi al cappello, seccata. - .18–.75: lo prende con tutte e due le mani e lo raddrizza con due tirate (a .38 e a .60), la testa inclinata e la bocca a broncio («hmpf»). Con le braccia in alto il seme sul petto è scoperto e brilla forte: è il momento in cui è vulnerabile. - .75–1: le mani tornano unite a punta, sorriso compiaciuto, cappello dritto. |
| `roots` | Radici della Cripta | 2.8 | - .00–.10: la luce corre dal seme giù per l'abito. - .10–.20: lo strascico si alza dietro di lei come un nodo di serpenti e si accende dalla punta ai fianchi. - .20–.26: le radici frustano giù e si tuffano nel pavimento (schiocco di legno); lei si abbassa di 4 sulle radici, come se afferrasse la terra. - .26–.90: tiene le mani basse coi palmi in giù e le dita che tremano, gli occhi più accesi. Lo strascico è sotto: tagliato al pavimento, coi monconi che vibrano. - .90–1: lo strascico esce dal pavimento e si posa. |
| `sow` | Il Giardino della Strega | 1.8 | - .00–.15: la luce corre dal seme su per il collo fino al cappello. - .15–.35: porta le mani a coppa sul petto, poi le alza al cappello, dove due boccioli si gonfiano e brillano. - .35–.45: li coglie con due dita, uno per mano. - .45–.55: li getta con un colpo di polso, come chi semina un campo. I semi lasciano le mani a .50 e da lì li disegna il gioco. - .55–1: li guarda cadere col sorriso e le mani tornano unite. - Con o.p2 coglie due lanterne arancioni invece dei boccioli. |
| `rite` | Rito delle Rune (fase 2) | 4.8 | Solo nella fase 2. - .00–.08: alza le braccia al cielo e lo strascico si apre nei tre bracci del suo segno (tre radici grosse e quattro piccole), che si tuffano nel pavimento verso l'anello delle rune e sono tagliati dove entrano. - .08–.95: canta a testa indietro, col cappello che arde e le lanterne al massimo. Resta girata verso di te: il gioco la gira piano, al massimo 1,5 rad/s. A ogni scoppio dei raggi (.27, .36, .45, .55, .64, .74, .83, .92) abbassa e rialza le braccia di scatto; le dita accese indicano i bracci che stanno per scoppiare. - .95–1: abbassa le braccia, riprende fiato e lo strascico si richiude. |
| `rage` | L'autunno della Strega (fase 2) | 2.8 | - .00–.20: si ferma e si stringe il petto; il seme lampeggia due volte (.06 e .14). - .20–.45: afferra il cappello con le due mani, butta la testa indietro e grida (bocca aperta, due zannette). Dal cappello all'orlo scende un'onda di colore: tra .22 e .48 la linea dell'onda scende da z 128 a z 0, e le foglie passano dal verde all'ambra al rosso ruggine. - .45–.60: dal cappello spuntano le due corna di rami, i boccioli scoppiano uno a uno in lanterne arancioni (.47, .51, .55) e la punta sale a 134. - .55–.80: metà delle foglie cade in una tempesta (il giro alto della gonna e le due foglie esterne del collare). Il collare diventa di foglie seghettate e rametti spinosi, le vene si accendono d'arancio, gli occhi diventano ambra a .62. - Intanto le quattro guardiane escono da sotto l'orlo e spaccano il pavimento intorno a lei una dopo l'altra (.62, .66, .70, .74), poi cominciano a girare. - .80–1: abbassa le braccia piano, si raddrizza e sorride. |
| `taunt` | Presa in giro | 1.2 | - .00–.15: porta la mano destra alla bocca, con le quattro punte accese come candeline. - .15–.55: ci soffia sopra e le fiammelle si spengono una dopo l'altra (.22, .31, .40, .49), ognuna con un filo di fumo. - .55–.70: sorride con le due zannette, gli occhi socchiusi. - .70–.95: piega l'indice due volte verso di te, a .76 e .88 («vieni, vieni…»). - .95–1: le fiammelle si riaccendono tutte insieme e la mano torna unita all'altra. - Il gioco usa questa mossa anche per chiamarti quando non la colpisci da un po', con un'altra voce. |
| `enter` | Il Risveglio | 3.2 | - .00–.20: dal pavimento sale un grande bocciolo chiuso di foglie scure e radici, alto 60; le lastre intorno si alzano con la polvere. - .20–.45: il bocciolo pulsa di luce menta da dentro (tum a .27 e a .38) e si apre una foglia alla volta, come petali (.30, .34, .38, .42, .45), scricchiolando. - .45–.70: dentro c'è lei, raggomitolata, con la testa china e il cappello piegato. Si alza lenta in tutta la sua altezza: i petali le ricadono addosso e diventano l'abito, le radici del bocciolo si stendono e diventano strascico e piedi. - .70–.82: alza la testa e gli occhi si accendono, due lampi menta con la lucina a .72. Il cappello si raddrizza di scatto a .75 e i boccioli si accendono uno a uno. Stira le dita una per una facendole scrocchiare (.76, .78, .80): è lo stesso suono che poi annuncia ogni incantesimo. - .82–.94: apre le braccia larghe e grida, bocca aperta con le zannette, foglie che volano. - .94–1: riporta le mani unite e torna nella posa di riposo. |
| `die` | L'ultimo autunno | 4 | Momento clou a 1,8 s. - .00–.12: il colpo. Si piega all'indietro con un lungo grido; gli occhi tremolano tre volte, sotto gli 8 lampi al secondo. - .12–.30: si stringe il cappello con le due mani; una crepa lo attraversa e lanterne o boccioli si spengono uno a uno (.16, .21, .26). - .30–.45: il cappello si spezza al cerchietto e le cade, girando con la sua telecamera. Rimbalza una volta a .40 e a .45 resta storto a terra davanti a lei: è il momento clou, 1,8 s. - .40–.75: le foglie seccano, diventano marrone chiaro e cadono in una tempesta. L'abito diventa corteccia secca grigiastra; lei si abbassa di 10 sulle radici, le braccia salgono piano verso il cielo e le dita diventano rametti. Diventa un albero spoglio, con lo strascico avvolto al tronco. - .75–.90: la luce degli occhi si spegne piano e ne escono due lucciole menta che volano via in alto (spariscono a .97). - .90–1: ai piedi dell'albero spunta un germoglio con un bocciolo menta che si apre, e intorno sbocciano tre fiorellini bianco-lilla col cuore giallo. - L'ultimo fotogramma (albero, cappello e fiori) resta fermo finché la stanza non si chiude. - Di solito parte dall'autunno (o.p2); se muore nella fase 1 fa lo stesso partendo dal verde. |

## Le abilità nel gioco

PER CHI SCRIVE IL CERVELLO
File src/js/89-strega-nuova.js, provato col modello finto anteprime/boss2/witch_stub.js. Come 89-golem-nuovo.js: si accende solo se c'è N3.witch2.

REGOLE GENERALI
- Tempo:
  - il gioco passa già al boss dt × bossLvl().spd, che nell'arena 5 va da 1,12 a 1,15;
  - nella fase 2 il cervello moltiplica ancora dt × 1,1;
  - tutti i tempi scritti qui sono secondi del modello (b3go, b3tick, b3at, b3k, come il Golem e i boss nuovi);
  - il modello si suona con b3k(e): avvolgere n3Move per 'witch', perché il suo orologio non conosce l'1,1. Così colpo e disegno coincidono;
  - ogni avviso legato a una mossa dura almeno 0,8 s del modello, cioè almeno 0,63 s veri anche a ×1,265;
  - i pericoli con un orologio loro (volo dei semi del Giardino, vita dei nodi di rami) contano in secondi veri.
- Colori degli avvisi: ogni danno ha un avviso rosso a terra (229,72,77, come G2.red); menta e viola restano decorazione, perché il santuario ne è pieno. I punti d'arrivo che non fanno danno hanno un cerchio tratteggiato chiaro (255,235,210).
- Forme dei colpi:
  - i cerchi d'avviso si disegnano come ellissi r × 0,6 r, come nel resto del gioco, e colpiscono dentro la stessa ellisse: (dx/R)² + (dy/(0,6·R))² < 1, con R = r + 0,4·P.r. Non come il cerchio di caduta del Golem, che colpisce in un cerchio più alto dell'ellisse disegnata;
  - le strisce colpiscono se la distanza dall'asse è minore di w/2 + 0,6·P.r, come le strisce di oggi;
  - i punti del corpo sul pavimento si calcolano con la proiezione del modello, come g2pt del Golem: C3.V(face).P([bx, by, 0]) più (e.x, e.y + 8).
- Ritmo: mai due attacchi insieme (servitori e guardiane a parte). Tra due mosse 1,0–1,4 s di cammino (0,8–1,1 nella fase 2). La presa in giro solo mentre cammina.
- Boss nuovi: il cerchio di sfere delle arene 5–8 (bossExtra) si spegne per lei con B3S.add('witch'), come il Golem; serve anche per voce e personalità.
- Sotto terra (sink da .50, tutto fin, rise fino a .30) non si colpisce e non si mira:
  - non usare e.hidden: 24-disegno.js disegna un'ellisse arancione al posto del modello;
  - usare e.shell come il Golem nella furia (salta canHit) e avvolgere hurtE perché dia la scintilla senza danno;
  - il modello resta disegnato.

CAMMINO
- 45 px/s nel tempo del modello. Non insegue: va verso un punto a 150–230 px dall'eroe, lontano dagli ostacoli, e cambia punto quando lo raggiunge.
- Il punto ha y tra TOP+110 e TOP+0,55·(BOT−TOP), perché il cappello non salga sopra il muro e la barra.
- È sempre girata verso l'eroe (e.face); passa al modello o.mv = angolo del moto − e.face.
- Polvere e scricchiolio quando le radici afferrano (walk .25 e .75).

LE ABILITÀ
I danni sono prima di DMG(). Le velocità dei proiettili sono quelle date a shootE, che nella stanza 10 le alza ancora del 31%.

1. MANO DEL BOSCO ('hand', 3,0 s), nuova
- Avviso: la luce nel braccio e le dita che ardono (.00–.12), poi la gobba e il cerchio.
- Da .24 la direzione resta ferma (e.lf), altrimenti le dita piantate scivolano.
- .24–.32: le dita-radici entrano nel pavimento nel punto P0, proiezione di [30, ±9, 0]. Schegge di lastra e ENV2.rocks(P0, 120, 1).
- .32: parte la gobba (N3.witchBump) da P0 verso l'eroe:
  - velocità max(300, distanza/0,39) px/s, così arriva entro .45;
  - poi resta incollata sotto l'eroe fino a .50;
  - non fa danno; lascia una fila di crepe (stamp 'cracks' ogni 30 px) e solleva schegge.
- .50: si blocca dove sta l'eroe. Compare un'ellisse rossa r 38 che si riempie, con l'ombra di quattro dita che si allargano.
- 0,35 s prima di .80 le punte delle dita spuntano sul bordo (N3.witchHand da k 0).
- .80: la mano si chiude (k .30) e fa 22 all'eroe dentro. L'avviso fermo dura 0,9 s del modello.
- Se l'eroe era fuori, la mano chiusa resta come nodo di rami:
  - G.rocks temporaneo, r 16, vita 6 s veri, kind 'wfist';
  - si disegna con N3.witchHand da k .30 a .85 lungo la vita, poi da .85 a 1 in 0,5 s;
  - ferma spine, semi e frecce; al massimo 2, e il più vecchio si sbriciola.
- Se l'eroe era dentro, niente nodo: la mano si sbriciola subito (k da .85 a 1).
- Fase 2 (o.hands=2): anche la seconda mano. La seconda gobba parte a .32 dall'altra mano su una curva di fianco all'eroe, si blocca a .60 dove l'eroe è in quel momento e si chiude a .90 (22). Due cerchi in fila.
- Come si schiva: uscire dal cerchio dopo che si è fermato (50 px in 0,7 s veri), oppure con lo scatto.
- Arena: dove si chiude ENV2.mark('roots', x, y, 34) ed ENV2.chunks; gli ostacoli entro 120 tremano.
- Voce: scrocchio delle dita a .12, «hn!» a .24 (c_hand).

2. SPIRALE DI SPINE ('spiral', 3,2 s)
- Avviso da .00: anello rosso tratteggiato r 60 intorno a lei e tre frecce curve a terra, a raggio 50, col verso del giro (o.spin, che cambia a ogni lancio). Sono 0,86 s del modello prima della prima spina.
- Colpo .27–.85:
  - ogni 0,11 s del modello parte una spina per braccio da (e.x, e.y − 16);
  - 2 bracci (3 nella fase 2), a 2π diviso il numero dei bracci;
  - l'angolo di partenza avanza di 0,23 rad a ogni colpo, moltiplicato per o.spin;
  - velocità 120, r 6, danno 11, tipo 'wthorn' (disegno N3.witchThorn; nella fase 2 'wthorn2', con la scia arancio);
  - circa 34 spine (51 nella fase 2).
- Fase 2: a .46 un lampo sull'aureola e un clic (avviso); a .55 lo schiocco e il verso si inverte, e la spirale fa una S.
- Come si schiva: girare nei varchi, che lontano da lei sono larghi, oppure ripararsi dietro un nodo di rami o un braciere. Le spine si fermano contro gli ostacoli: per questo la Spirale viene sempre dopo la Mano.
- Arena: torce viola per 3 s (b3torch('violet'); nella fase 2 'fire').
- Voce: un sussurro che sale a .10 (c_spiral), scrocchi delle dita .11–.25.

3. SPROFONDA E RIAFFIORA ('sink' 1,1 s, 'fin', 'rise' 1,2 s) e CAPPELLO STORTO ('fix' 1,0 s)
- A sink .00 si sceglie il punto d'arrivo A:
  - a 130–170 px dall'eroe, comunque più di 90 px;
  - dentro la stanza, con y almeno TOP+110;
  - a più di 40 px da ostacoli e nodi.
- Subito in A compare un'ellisse rossa r 34 con le radichette che girano (N3.witchSprout). Resta fino al colpo della colonna, circa 2 s del modello.
- Da sink .50 non si colpisce. Nella fase 2, a sink .75, nel punto di partenza resta il guscio (N3.witchHusk, k 0).
- 'fin':
  - la porta in linea dritta fino ad A a 380 px/s del modello (almeno 0,35 s, al massimo 0,9 s);
  - quando passa sotto un ostacolo o.k scende a 0 e poi torna a 1;
  - non fa danno; lascia un solco (stamp 'cracks' ogni 24 px, foglie) e l'erba appassisce (ENV2.wiltGrass).
- 'rise' in A:
  - a .12 la colonna fa 16 all'eroe dentro l'ellisse r 34;
  - si colpisce di nuovo da .30;
  - a .58 l'anello: 12 semi (16 nella fase 2), velocità 140, r 6, danno 12, tipo 'wseed' (N3.witchSeed).
- Fase 2: il guscio si accende dall'inizio di fin (o.glow sale). A rise .58 si spacca e spara 8 spine dal suo punto (velocità 130, danno 10): due anelli che si incrociano. Poi si sbriciola in 0,6 s.
- 'fix' subito dopo:
  - ferma 1 s del modello, e i colpi fanno +50% (hurtE avvolto, come per i pugni del Golem);
  - la prima volta nella partita compare la scritta «Cappello storto: colpiscila!» (#ffd84a, 18, sopra di lei a e.y − 140).
- Prima del Rito si fa la stessa cosa con A = centro dell'altare (G.runeAt), senza anello e senza guscio, con rise in o.neat e senza fix.
- Arena: dove sprofonda ENV2.mark('roots', 34) ed ENV2.wiltGrass(50); dove riaffiora ENV2.mark('bloom', 26) e foglie, come oggi; alla colonna tremano gli ostacoli entro 100.
- Voce: risatina che sprofonda (c_sink, sink .20), «ah-ah!» (c_rise, .55), «hmpf» (c_fix, .30).

4. RADICI DELLA CRIPTA ('roots', 2,8 s)
- Da .20 la direzione resta ferma.
- Avviso:
  - .00–.20 la luce scende nello strascico;
  - a .26 le strisce, larghe 26 come oggi (makeBands): 3, o 4 nella fase 2. La prima orizzontale dove sta l'eroe, la seconda verticale dove sta l'eroe, le altre parallele a 50–80 px;
  - durata dell'avviso, nel tempo del modello: 0,95 + 0,18·i s;
  - disegno: striscia rossa tratteggiata che cresce, nei primi 0,3 s, dal muro più vicino a lei fino al muro opposto. Lungo la striscia una fila di schegge di lastra sollevate e la luce menta nelle fughe corrono nello stesso verso.
- Colpo: alla fine del suo avviso una radice spinosa (N3.witchRoot, con o.gaps sotto gli ostacoli) esce ad archi lungo tutta la striscia, in un'onda che parte dallo stesso lato. Dura 0,45 s del modello e fa 18 una volta sola.
- Dopo il colpo resta una cicatrice: stamp 'cracks' ogni 40 px ed ENV2.mark('roots') in due punti; l'erba appassisce lungo la striscia e gli ostacoli vicini tremano.
- Tempi: l'ultima striscia scoppia a .73 (fase 1) o .79 (fase 2) e finisce a .89 o .95, prima che lo strascico esca (.90–1).
- Come si schiva: uscire dalla striscia (21 px) o attraversarla con lo scatto.
- Voce: un «mmmm» basso (c_roots, .20), schiocco di legno a .23.

5. IL GIARDINO DELLA STREGA ('sow', 1,8 s)
- Se ci sono già 2 servitori vivi la mossa salta e si passa alla successiva.
- A .50 partono 2 semi (N3.witchSeed; nella fase 2 due lanterne):
  - volano ad arco per 0,9 s veri, con il colmo a 50 px;
  - verso due punti a 70–120 px da lei, a più di 60 px dall'eroe, liberi e dentro la stanza;
  - ogni punto ha un cerchio tratteggiato chiaro r 20; i semi non fanno danno.
- Quando atterrano: sbuffo di spore, ENV2.mark('bloom', 18) e un Fungo velenoso ('mushroom', spawn .7: il fungo viola di oggi, 55 di vita, nuvola di veleno). Nella fase 2 un fuoco fatuo ('wisp', quello di oggi).
- Al massimo 2 servitori vivi. Quando lei cade appassiscono: muoiono senza oro, con foglie e spore.
- Voce: la ninna nanna di tre note, la-la-là in la minore come il carillon del menu (c_sow, .35).

6. RITO DELLE RUNE ('rite', 4,8 s, solo fase 2), nuova
- È sempre preceduto da sprofonda, pinna e riaffiora al centro dell'altare, senza anello. Lei resta ferma al centro, girata piano verso l'eroe (al massimo 1,5 rad/s).
- .00–.08: lo strascico si apre nel suo segno. Le 16 rune dell'altare (G.witchLights[0..15], ad angolo k·π/8 + π/16) ardono arancio per tutto il Rito.
- 8 ondate:
  - l'ondata i si accende a 0,38 + 0,45·i s del modello e scoppia 0,9 s dopo (a .27, .36, .45, .55, .64, .74, .83, .92 della mossa); resta attiva 0,25 s;
  - ogni ondata è il suo segno a tre bracci: tre raggi dal centro dell'altare, a 120° l'uno dall'altro, il primo esattamente verso dove sta l'eroe quando l'ondata si accende;
  - avviso: per ogni braccio una striscia rossa larga 24 dal bordo dell'altare fino al muro o al primo ostacolo (g2reach); sull'anello delle rune un segno di luce bianco-rosso dove il braccio lo attraversa;
  - colpo: una radice (N3.witchRoot, o.w circa 0,9) scoppia lungo il braccio, dal centro fino al muro o all'ostacolo; fa 16 una volta per ondata.
- Come si schiva:
  - muoversi dopo ogni accensione (basta un passo di lato), oppure correre intorno a lei: i bracci le scoppiano dietro;
  - ripararsi dietro un braciere, perché il raggio si ferma lì;
  - chi resta fermo li prende tutti.
- Fuori dal santuario (senza G.witchLights) il cervello disegna l'anello di 16 rune (92 × 57, arancio) intorno al centro della stanza, e lei va al centro.
- Arena: lungo ogni braccio una fila di crepe (stamp 'cracks' ogni 36 px); le torce divampano arancio; alla fine 8 cicatrici di radici a raggiera intorno all'altare (ENV2.mark('roots')).
- Voce: un canto lungo che sale (c_rite, .05), tre scrocchi a .05, un rintocco (vBell) a ogni accensione.
- Quando: subito dopo l'autunno, poi una volta ogni sei mosse.

7. RADICI GUARDIANE (fase 2, sempre)
- Quattro radici a 58 da lei sul pavimento. La punta k sta in (e.x + 58·cos(orb + k·π/2), e.y + 8 + 58·sin(orb + k·π/2)·0,55).
- orb cresce di 1,7 rad/s nel tempo del modello. Il cervello passa al modello o.orb = orb e o.guard (da 0 a 1), e il modello le disegna esattamente lì.
- Danno 14 se l'eroe è entro 10 + 0,6·P.r dalla punta, al massimo una volta ogni 0,6 s.
- Sono spente (o.guard 0, nessun danno) mentre sprofonda, è pinna e riaffiora, nell'autunno fino a .62 e nella sconfitta. Rientrano in 0,2 s e riescono in 0,3 s.
- Il contatto col corpo resta 18.

L'AUTUNNO DELLA STREGA (fase 2)
- Quando parte: quando la vita scende sotto la metà, alla fine della mossa che sta facendo. Mai sotto terra: se sta sprofondando, aspetta la fine di fix.
- 'rage' dura 2,8 s e non fa danno.
- A .00:
  - si svuota G.eproj e si tolgono strisce, gobbe, mani, raggi e guscio;
  - banner «L'autunno della Strega!» con «Fase 2»; bossRage da menta ad arancio; barra rossa;
  - RUNEC.witch e luci del santuario passano all'arancio (come già oggi); torce 'fire'.
- Da .55, per 1,6 s, cadono foglie d'autunno dal soffitto: G.debris con leaf:true, oppure N3.witchLeaf; 24 foglie, 10 con LOWFX.
- ENV2.rocks su tutta la stanza.
- A .62, .66, .70 e .74 le guardiane spaccano il pavimento nei loro punti: ENV2.chunks 8, stamp 'cracks', shake 4.
- Voce 'angry': un urlo con i rami che si spezzano.
- Dopo: sprofonda, pinna e riaffiora al centro dell'altare, poi il Rito.
- Cosa cambia nella fase 2:
  - dt × 1,1 e cammino tra le mosse di 0,8–1,1 s;
  - le guardiane e il Rito;
  - la Mano a due mani;
  - la Spirale a 3 bracci, con l'inversione;
  - Sprofonda col guscio e 16 semi;
  - le Radici a 4 strisce;
  - il Giardino coi fuochi fatui.

ORDINE DELLE MOSSE
- Fase 1: Mano, Spirale, Sprofonda (con Cappello storto), Radici, Giardino, poi da capo. La prima dopo l'entrata è la Mano.
- Fase 2: [sprofonda al centro] Rito, Mano, Spirale, Sprofonda (con Cappello storto), Radici, Giardino, poi da capo.

ENTRATA ('enter', 3,2 s; BOSS_INTRO.witch = 3,2)
- All'inizio la si mette al centro dell'altare (G.runeAt). Il modello suona 'enter' per tutta l'entrata: n3Move avvolto come per il Golem.
- Momenti in secondi:
  - 0: le 16 rune si accendono una a una in 0,64 s e la luce menta corre al centro; tremito (shake 3), crepe, polvere e lastre che si alzano fino a 0,64;
  - 0,86 e 1,22: tum (fThump morbido);
  - 0,96–1,44: cinque scricchiolii;
  - 2,30: gli occhi si accendono (shimmer);
  - 2,40: scatto del cappello;
  - 2,43, 2,50 e 2,56: tre scrocchi;
  - 2,69: il grido (b3say 'cry'), con gli anelli bianchi del ruggito, foglie e spore;
  - 3,2: la barra.
- Non si colpisce finché non ha finito.

SCONFITTA ('die', 4 s)
- BDEATH.witch = {dur: 4, clou: 1.8, snd: 'bloom'}. snapBoss restituisce {live: 1} e BDIE.witch disegna il modello in 'die', come BDIE.golem.
- Voce 'die': un lungo sospiro che diventa vento tra le foglie.
- A 0 i servitori appassiscono.
- A 1,8 il cappello tocca terra (tonfo leggero e polvere): la barra si rompe in foglie d'autunno (BBFX.witch = {c: '#d0602a', f: '#ffd27a', k: 'fall', s: 'bloom'}) e compare «sconfitta».
- Le luci del santuario tornano menta e calme.
- La stanza si chiude quando il modello ha finito. Albero, cappello e fiori restano fino all'uscita.

PRESA IN GIRO E CHIAMATA (come i boss nuovi, 88-boss3-voci.js)
- Quando ti colpisce: 'taunt' (1,2 s) mentre cammina, con la voce 'laugh', una risatina secca e acuta «ih-ih-ih-ih» col legno che scricchiola sotto.
- Se non la colpisci per 7 s: 'taunt' con la voce 'laugh2', un «vie-ni… vie-ni…» cantato a due note più una risatina.
- Se la colpisci forte: 'hurt', un «hmpf!» offeso.
- Se cadi: 'win', una lunga risata da strega.
- B3VO.VB.witch: voce da cartone fatta col codice, una strega nasale che sale e scende, mai horror. Volume medio 0,07–0,11, come il Golem. Sotto cry, angry, die e win si sentono scricchiolii di legno e fruscio di foglie (b3sayMore).
- B3CUE.witch = {hand: 'c_hand', spiral: 'c_spiral', sink: 'c_sink', rise: 'c_rise', fix: 'c_fix', roots: 'c_roots', sow: 'c_sow', rite: 'c_rite'}.
- Prima di ogni incantesimo, quando la luce arriva alle punte, suona lo scrocchio delle dita (spiral .11–.25, hand .12, rite .05): è il suo tum-tum.
- Le voci si preparano nelle stanze della sua arena: B3VO.prep('witch').

INTEGRAZIONE (come 89-golem-nuovo.js)
- Modello: N3.witch = N3.witch2; N3.meta.witch = N3.meta.witch2, con .old = il disegno di oggi per la pagina «prima e dopo».
- Numeri:
  - ET.witch.r = 26; hp 2.300 e cdmg 18 restano, da regolare giocando con node tests/boss2diff.js witch;
  - BOSS_INTRO, BDEATH e BBFX come sopra; ECOL.witch = '#2a6a44'.
- Effetti 2D:
  - B2H.witch circa 100; B2T.witch = [['123,240,192','255,138,60'],'190,120,255'];
  - B2.witch.back = B2.witch.front = ()=>{}: aureola di radici 2D, lanterne che girano e radici ai piedi ora le disegna il modello;
  - B2G.witch: solo una pozza viola scura sotto di lei (ellisse 50 × 20, rgba(40,16,60,.3)), niente radici 2D;
  - B2CALM.add('fix', 'fin', 'sink').
- Luce della stanza su di lei (18-ambiente; oggi Lt(e.x, e.y−20, 90, .75)): più alta, Lt(e.x, e.y−55, 110, .75).
- b2react (52) ha ancora i casi della Strega di oggi: tenere le torce viola di 'spiral' e togliere il segno di radici sotto l'eroe all'inizio di 'roots', perché le cicatrici ora vengono lungo le strisce.
- Proiettili: EPDRAW per 'wthorn', 'wthorn2', 'wseed' e 'wseed2' coi disegni del modello. Scie (TRC): 'wthorn' '184,116,230', 'wseed' '123,240,192', quelle della fase 2 '255,150,60'.
- Guida (44): «Boss. Mani di rami dal pavimento, spirali di spine e radici che spaccano le lastre; sprofonda e riaffiora: segui la punta del cappello.»
- Registro BCL.witch:
  - n: 'Strega delle Radici', arena: 4, p2: true;
  - enter(){G.arena=4; G.chapter=ARENAS[4].ch; G.diff=ARENAS[4].diff; G.bossLvl=null; G.room=ROOMS; G.event=null; buildRoom()};
  - moves: ['hand','spiral','sink','fin','rise','fix','roots','sow'], moves2: ['rage','rite'];
  - hz(): conta avvisi, gobbe, mani, nodi, strisce, raggi, guscio, semi, spine e servitori;
  - voice: ['cry','laugh','angry','die'].
- LOWFX: niente foglie dal soffitto, metà schegge (B3N), archi più radi nelle radici di strisce e raggi.

COSA TENERE DEL BOSS DI OGGI
- Il santuario intero (bakeWitchFloor in 54: pedana, segno delle tre radici, 16 rune, radici grosse, funghi viola, luci che respirano e passano all'arancio nella fase 2) e RUNEC.witch.
- I servitori: Funghi velenosi e fuochi fatui, al massimo 2.
- Le meccaniche di oggi, rifatte:
  - le strisce di radici, con la stessa disposizione di makeBands, ora rosse e con la radice vera;
  - la spirale di spine;
  - il teletrasporto, che ora è sprofonda, pinna e riaffiora con l'anello;
  - le sfere che girano nella fase 2, che ora sono le radici guardiane.
- La musica (TRACKS.witch), il suono 'bloom' della barra, nome, titolo, oro e traguardo.

PROVE
- python3 anteprime/mk_boss2.py witch --test [--stub], poi node tests/boss2gioco.js witch.
- node tests/boss2diff.js witch: vite perse al minuto contro la Strega di oggi, nell'arena 5.
- Foglio: node tests/foglio3d.js witch2 tests/b2/witch2.png --file sprite/nemici3d/witch2.js.
- Da guardare:
  - avvisi di almeno 0,6 s veri nell'arena 5 con la fase 2;
  - pinna mai colpibile;
  - nodi di rami che non chiudono l'eroe contro un muro;
  - Rito che si schiva sempre con un passo;
  - stanza con lei e con le strisce disegnata in non più di 3,5 ms.
- Nota per quando il modello entra nel gioco (non è in questi file): nella schermata «Nuova arena sbloccata!» (61-anteprime-arene.js, showArenaUp) la tela ha il filtro CSS dell'arena e tinge anche il boss. Nell'arena 5 la Strega diventa rossa con gli occhi arancio, e succede già oggi.

## Voti del direttore artistico

VOTI. Criteri: possente e temibile · bella e figa · cupa ma da Classica · abilità e arena · fattibile con C3 · continuità con la Strega di oggi.

1. «regina»: 8,5 su 10. VINCE.
- È l'unica che mette davvero timore: alta 128, dritta, scivola sulle radici senza camminare, ha braccia lunghe e il viso pallido e freddo dentro il collare. Da lontano si legge come una sovrana del bosco (possente 9, figa 9).
- Tiene quello che Denis già conosce: corona di rami coi boccioli, occhi menta, lanterne di spore, magia menta e viola, rune dell'altare (continuità 9).
- È l'unica che ha scelto i colori sul pavimento vero dell'arena 5. La tinta dell'arena (hue-rotate 235°, saturate 1,15) rende le lastre grigio malva, il muschio rosa e le radici viola. L'ho ricalcolata e l'ho controllata su una foto della stanza dal gioco (lastre #605056, radici #50426e): il verde bosco le sta davvero di fronte.
- Abilità (8,5): la Mano del Bosco è l'immagine più forte delle tre proposte; la Corona storta dà carattere e insieme una finestra per colpirla; il Rito usa l'altare; Spirale e strisce sono rifatte bene.
- Difetti:
  - l'idea della «regina» con corona e abito lungo è vicina alla Regina dei Ghiacci, che si rifà in parallelo, e la corona di rami ricorda le corna del Cervo;
  - le dita lunghissime «come zampe di ragno» tirano verso lo stile Zombie;
  - l'avviso (le dita che si accendono) è uguale per quasi tutte le mosse e dice meno del cuore del Golem;
  - il Rito a raggi pari e dispari lascia un varco sicuro largo 36° proprio sotto di lei, dove l'eroe sta di solito (calcolato sulle 16 rune vere dell'altare);
  - nella Mano di 2,2 s non c'è tempo sia per la gobba sia per un cerchio fermo di 0,9 s;
  - costa molto da disegnare: 30 foglie, 10 dita da tre pezzi, strascico di 60 (fattibilità 7,5).

2. «vecchia»: 7,8.
- È la strega delle fiabe che ogni bambino riconosce, con il carattere più forte: occhio storto, fiuto, risatina.
- Ha le idee di gioco più divertenti (abilità 8,5, Classica 8,5):
  - la pinna del cappello che corre sotto il pavimento;
  - il Cerchio delle Fate;
  - la Giostra sul segno dell'altare;
  - la luce della lucciola che corre fino alla parte che colpirà (il parente più stretto del cuore del Golem);
  - la lucciola liberata alla fine.
- Però non è possente. Curva e buffa, con le stelline sulla testa e il «pupazzo a molla», fa sorridere più che temere, e si raddrizza solo a metà vita (possente 6,5).
- I colori sono pensati per il pavimento senza tinta. Nell'arena 5 la veste viola #7442b8 e il cappello melanzana #44325f finiscono sulle lastre malva e sulle radici viola, e il viola con la punta somiglia al Burattinaio.
- Perde la corona di rami di oggi e ha due posture da tenere coerenti in ogni mossa e in ogni foglio (fattibilità 7).

3. «spirito»: 7,0.
- È elegante e strana, con l'abbinamento tra mosse più furbo: la Radice Cacciatrice lascia pilastri che riparano dalla Spirale, come i massi del Golem prima del Raggio. Ha anche un avviso intelligente: i fiori sbocciano sulla parte da cui arriva il colpo.
- È però più una driade che una strega:
  - il viso a maschera di legno con le orbite scure rischia di sembrare il teschio che Denis ha tolto (Classica 6,5);
  - gli occhi diventano viola e si perde il menta di oggi (continuità 6);
  - sospesa con le radici che pendono ricorda il Burattinaio e la Piovra;
  - sfaldarsi in foglie pezzo per pezzo costa molto e in 3D si legge male;
  - i fiorellini d'avviso sono troppo piccoli sul telefono (fattibilità 6,5).

COSA ENTRA NEL DESIGN FINALE («la Signora delle Radici», base «regina»)

Dalla «vecchia»:
- il cappello a punta storto, qui intrecciato di rami coi boccioli: resta la corona di rami di oggi e la sagoma dice subito «strega», lontana dalla Regina dei Ghiacci;
- la pinna: quando sprofonda resta fuori solo la punta del cappello, che corre sotto il pavimento fino a dove riaffiora;
- il cappello che le resta storto e che lei si risistema: è la finestra per colpirla, al posto della Corona storta;
- la luce che corre dal cuore fino alla parte che colpirà, qui dal Seme sul petto lungo le vene della corteccia, come il cuore del Golem;
- il segno a tre bracci dell'altare che prende vita nel Rito;
- la voce nasale da vecchina e la risatina che sprofonda;
- l'attenzione alla tesa, che non deve coprire gli occhi.

Dallo «spirito»:
- la mano chiusa della Mano del Bosco resta in piedi 6 s come un nodo di rami che ferma spine e frecce, e la Spirale viene sempre dopo la Mano (riparo come i massi del Golem);
- i raggi del Rito si fermano contro bracieri e ostacoli;
- un solo colore di magia per fase (menta, poi arancio), con le luci che si accendono solo per avvisare;
- il viso che non deve mai sembrare un teschio.

Corretto rispetto alla «regina»:
- tre dita più il pollice, grosse alla base, con la punta chiara e tonda (niente zampe di ragno), e braccia un po' più corte;
- nella Mano le dita si allungano in radici che entrano nel pavimento (con le braccia non arriverebbe a terra);
- la Mano dura 3 s, con 0,9 s di cerchio fermo;
- il Rito segue l'eroe, così non c'è nessun posto sicuro fisso;
- le radici guardiane girano nel pavimento come pinne, più chiare e leggere di quattro archi attaccati all'orlo;
- strascico di 48;
- i semi del Giardino non fanno danno (cerchio tratteggiato chiaro);
- verde e corteccia ritoccati per staccarsi anche nell'Abisso, che non è tinto;
- tutti i tempi pensati per la velocità dell'arena 5 con la fase 2.
