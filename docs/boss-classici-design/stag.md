# Il Cervo d'Aurora: il design finale

(Deciso dal direttore artistico tra tre proposte, 16 ottobre. Tipo nel gioco: `stag`; modello `sprite/nemici3d/stag2.js`.)

## Il design

IL CERVO D'AURORA · «IL RE DELLA VETTA»
Nel gioco nome e titolo restano: «Il Cervo d'Aurora», «Il custode della vetta». Tipo 'stag', modello 'stag2' in sprite/nemici3d/stag2.js.

IDEA
L'ultimo boss del gioco è il re della cima del mondo. Un cervo del nord, antico e immenso, del colore del cielo di notte dove nasce l'aurora.
Ha il collare bianco di brina, le calze bianche, una criniera di ghiaccioli sul collo. In testa porta la sua corona: corna di cristallo vivo con la pala in cima come i caribù, attaccate da due rosette d'oro antico, e dentro scorre l'aurora.
È lento e solenne. Ti guarda dall'alto, con le palpebre pesanti sotto due sopracciglia di brina a V. Prima di ogni colpo l'aurora nasce dalle rosette e corre una punta alla volta nel pezzo che colpirà: è il suo avviso, come il cuore del Golem. Poi il colpo arriva col peso di una montagna.
- Fa paura perché è enorme e calmo.
- È figo perché è sacro e terribile insieme.
- È giusto perché la corona dice sempre cosa sta per fare.
Resta della Classica: forme robuste da giocattolo, colori pieni, occhi con la lucina, due zannette di ghiaccio, niente sangue, ferite, cuciture né teschi. Quando perde si inchina all'eroe, lascia la corona nel muschio e torna aurora.

1. MISURE E SAGOMA
Unità del modello a sc 1. Assi del corpo: x avanti, y a sinistra del cervo, z su; l'origine è a terra sotto il centro.
- Punte delle corna a 126 a riposo (fase 2: 130), circa 165 nell'impennata.
- Garrese a 80; i ghiacciuoli della criniera arrivano a 92. Cima della testa a 98.
- Lungo 115: il muso a x 71, la coda a x −44.
- Corona larga 122 da punta a punta (fase 2: 132). Corpo largo 40, 48 col collare.
- Ombra 46×17 centrata in [−4,0,0], più chiara e più piccola quando si impenna.
- Paragone: l'Arciere 3D è alto 37, il Golem nuovo 110 in punta. Il Cervo è il più alto di tutti (3,4 volte l'eroe). La massa vera (corpo e collo) però sta sotto 98; sopra c'è la corona, aperta, che lascia vedere attraverso.
- Nel gioco: raggio 32 (oggi 30); alone e barra 100 (B2H, oggi 86).
La sagoma è un triangolo che punta avanti e in alto:
- davanti è alto e massiccio, col petto profondo e il garrese alto; dietro è più basso e corto, la groppa scende;
- il collo è grosso; la testa è portata un po' bassa davanti al garrese, come un toro che ti misura;
- quattro zampe forti con le calze bianche;
- sopra tutto, la corona larga tre volte il corpo.
Da lontano si leggono tre cose: la macchia blu notte; la corona di cristallo chiaro col contorno scuro; il bianco del collare e delle calze, con i due occhi accesi.
Le quattro direzioni:
- Davanti: corona aperta a ventaglio, le due lance puntate verso di te, il collare bianco a V sotto la testa, le quattro calze.
- Lato: il triangolo petto-garrese, le lance in avanti, le pale che spazzano indietro sopra la schiena.
- Dietro: la corona aperta sopra la groppa, la criniera di ghiaccio, la coda bianca.
- Tre quarti: la vista più bella, con la corona in prospettiva.

2. I PEZZI NELLA POSA DI RIPOSO

Corpo
Un solo volume (svol3, inviluppo di tre ellissoidi), con i tre toni e il bordo caldo come il Golem.
- Petto e garrese: C [16,0,56], R [22,20,24].
- Botte: C [−4,0,50], R [28,18,18].
- Groppa: C [−28,0,50], R [16,16,17].
La pancia è più chiara (un cappuccio largo sotto la botte). Segni leggeri di pelo: piccole C a ciuffi su spalla, collo e coscia, e due curve morbide dei muscoli della spalla.

Collo
Catena [26,0,64] r 15 → [37,0,75] r 12,5 → [45,0,82] r 10,5.

Testa
Ha la sua telecamera (Xh), col perno alla nuca [44,0,84].
- Cranio: C [48,0,86], R [14,11,11,5].
- Muso: C [61,0,80], R [10,7,7,5]; punta a x 71.
A riposo è un poco bassa (beccheggio +0,12) e resta puntata sull'eroe (look), mentre il corpo ondeggia appena.

Orecchie
- Foglie larghe 13×6,5 dalla base [43,±10,93], girate in fuori e indietro.
- Fuori il manto, dentro il pelo di brina, la punta scura con un ghiacciolino di 3 che tintinna.
- In avanti quando ascolta; indietro quando si arrabbia (carica, richiamo, rabbia).

Occhi
- Sul cranio in direzione [.72,±.62,.3], circa [57,±7,89].
- A mandorla, rx 5,2 e ry 3,6, con iride e lucina bianca.
- La palpebra di sopra è pesante e copre il 30% dell'occhio. Quando stringe gli occhi scende la punta verso il naso.

Sopracciglia di brina
- Un cuneo per lato, da [58,±4,92] a [53,±10,91], in giù verso il naso: è la V che fa paura, come il sopracciglio del Golem.
- Sono divise per lato: quella lontana va dietro il cranio, mai sopra l'occhio.
- Si alzano e si aprono nel bramito e nella rabbia.

Naso e bocca
- Naso grande, scuro e lucido in [70,0,81]; le narici si allargano negli sbuffi. Il dorso del muso è un filo più chiaro.
- Bocca: una linea semplice in [67,0,75]. Si apre nei bramiti: dentro è scuro, la lingua non si vede.
- Due zannette di ghiaccio dal labbro di sopra, da [66,±3,76], lunghe 3,5, come il cervo acquatico. Se lo fanno sembrare un vampiro si accorciano a 2,5.
- Il bianco sta solo sotto: labbro di sotto, mento, barba, collare. Mai una maschera chiara intorno agli occhi: niente teschio.

Corna
Sono nella telecamera della testa, un corno per lato (sd = ±1). I punti dati sono le cime dei cristalli.
- Rosetta d'oro in [45,±6,5,95]: un anello di 7 bottoni, raggio 4,2. È la corona del re, e con il muschio è l'unico colore caldo del cervo.
- Fusto: ghiaccio vecchio, scuro e nodoso vicino alla testa. Va da [45,±6,5,95] → [39,±17,105] → [31,±31,113] → [27,±45,117], con i raggi 5 → 4,2 → 3,6 → 3.
- P1, la lancia: parte dal 20% del fusto (circa [44,±9,97]) e arriva a [64,±12,99]. Bassa e in avanti sopra gli occhi; raggio 2,8 → 1,8.
- P2: da [39,±17,105] a [50,±24,120].
- P3, la più alta: da [31,±31,113] a [34,±38,126].
- La pala: una piastra di cristallo piatta e tonda, raggio 8, centrata in [25,±50,118] e girata avanti-fuori. È larga vista da davanti e sottile di lato, come le corna vere. Dal suo bordo escono P4 [28,±50,125] in su, P5 [19,±60,121] in fuori, P6 [16,±54,112] indietro.
- Ogni punta finisce in un cristallo a diamante lungo 6–7, col lato illuminato e la riga bianca. I cristalli sono tozzi, da giocattolo, mai aghi.
- Dentro il fusto c'è una vena d'aurora: una path sola per lato, dalla rosetta alla pala, che pulsa col respiro.
- Da ogni lancia pendono due fili di licheni lunghi 9, con due nodi a pendolo, che dondolano.
- Le corna sono pesanti: seguono la testa con un attimo di ritardo, solo nel rollio e senza mai staccarsi.
- La geometria sta in tabelle fisse nello spazio della testa, calcolate una volta. Il corno lontano e quello vicino si scelgono con la telecamera della testa, così girando non si scambiano.
- Fase 2: fusto e punte più lunghi del 10% (130 in punta, larghe 132). La pala mette P7 [22,±57,127] e P8 [13,±60,116] (misure prima dell'allungamento). Sulle punte compaiono le fiamme d'aurora.

Criniera di ghiaccio
- 7 ghiacciuoli sulla cresta del collo e del garrese.
- Basi: [40,0,89] [36,0,86] [31,0,84] [25,0,82] [19,0,81] [13,0,80] [7,0,78].
- Alti 6, 8, 10, 11, 12, 9, 6, inclinati indietro di 35°. Si rizzano a 5° nell'impennata, nel richiamo e nella rabbia.
- Sono piantati in ciocche di pelo di brina (foglie).
- Fase 2: più lunghi del 30% e accesi dentro.

Mantellina di muschio
- Un cappuccio sul garrese, dietro la criniera: direzione [−.35,0,.94], apertura .55, bordo smerlato e punte brinate.
- Due ciuffi sulle anche: sulla groppa, direzione [−.2,±.6,.75], apertura .3.
- È il segno di Mossbound: poca, cupa, con la luce solo in cima.

Collare di brina
- Un cappuccio bianco sul davanti del petto: direzione [.8,0,−.3], apertura .7.
- 9 ciocche (foglie 9–12×4,5) dalla gola [40,0,72] fino in mezzo alle zampe davanti [30,0,40], in due file (5 + 4).
- La barba: 3 ciocche sotto il mento [60,0,74], lunghe 7.
- Sotto il collare 3 ghiacciolini lunghi 5: [32,±5,38] e [33,0,37].
- Dondola col respiro e col passo. Visto da davanti fa da cornice bianca alla testa.

Stelle di brina
- 9 per fianco (5 sulla spalla e sul fianco alto, 4 sul fianco basso) e 3 sulla groppa.
- Sono punti fissi sulla superficie (ellAt) e si disegnano solo quando guardano la telecamera.
- Stelline a 4 punte di 3,5, come le macchie di un cerbiatto ma fatte di brina.
- Nella fase 2 si accendono e fili sottili le uniscono in costellazioni.

Zampe
Due ossa per zampa (ik). Spalla e coscia stanno dentro il volume; il punto alto scivola di ±5 col passo, così l'angolo resta morbido.
- Davanti: radice (il gomito) in [18,±10,38], zoccolo in [19,±11,0]. Ossa 20 + 18, ginocchio in avanti, raggi 8,5 → 5,6 → 4,6.
- Dietro: radice (la grassella) in [−26,±10,42], zoccolo in [−27,±11,0]. Ossa 22 + 20, garretto indietro, raggi 9,5 → 5,8 → 4,6.
- Potenti in alto e più sottili negli stinchi, mai stecchini.
- Calze di brina negli ultimi 9 sopra lo zoccolo, con due ciuffi alle caviglie come un cavallo da tiro: anche in piccolo si capisce dov'è la zampa.
- Le zampe lontane sono più scure (shadeLimb).
- Zoccoli spaccati in due (la V si vede davanti): ellissoide [6,5,4,5] con il bordo brinato.

Coda
- Corta, dalla base [−43,0,58]: una foglia 11×5 in giù e indietro, blu sopra e bianca sotto.
- Nella carica si alza a bandiera bianca.

Ordine di disegno
Dalla posa di riposo, in quest'ordine:
1. corno, orecchio e sopracciglio lontani (scelti dalla telecamera della testa);
2. zampe lontane;
3. coda;
4. corpo, con muschio e stelle;
5. criniera;
6. collo;
7. collare e barba;
8. testa;
9. orecchio e corno vicini;
10. zampe vicine;
11. gocce di luce e fiato.
Visto da dietro le corna vanno sopra la criniera, perché sono più in alto. L'ordine non cambia mai perché si muove uno zoccolo o la testa.

3. MATERIALI E COLORI
Ogni pezzo ha tre toni: luce / base / ombra. La luce calda viene dall'alto a sinistra. Contorno INK del gioco: 2,8 sui volumi grandi, 2,2 sulle zampe, 1,8 sulle corna.
È dipinto come la lanterna: rim, shadeLimb, glowTop della corona sulla cima della testa e sul garrese, segni leggeri, bagliori morbidi.
Doppio bordo di luce:
- un bordo caldo #ffe2a8 in alto a sinistra su tutti i pezzi grandi: è il sole della vetta;
- dall'altra parte, in basso a destra, un controluce d'aurora sottile (125,255,208, alpha .5, 'lighter'), solo senza LOWFX, su corpo, collo, testa e fusti. Stacca il manto scuro dalle sue ombre.

FASE 1, «il re della vetta»
- Manto: #5a76b0 / #34497f / #1a2750.
- Dorso del muso e fronte: #6782bd / #3d5490 / #1f2d5c.
- Pancia, interno delle cosce, gola: #8ea6cc / #607aa6 / #354870.
- Pelo di brina (collare, barba, mento, labbro di sotto, calze, ciuffi, sotto della coda, dentro le orecchie): #ffffff / #dce9f6 / #8ea8c7, tratti #6f8db0.
- Stelle di brina: #e8f6ff col puntino #ffffff, alpha .85.
- Ghiacciuoli della criniera e punte delle orecchie: #f2fdff / #a8e6f6 / #4f9cc4, con una riga di luce dentro #e0fff6.
- Muschio: #9bd46a / #4f8e3e / #2b5a2a, punte brinate #d8f0d0.
- Licheni: #d2e3b4 / #9fb98a / #627a58.
- Oro antico delle rosette: #ffe9a8 / #d9a93e / #8a6020.
- Fusto delle corna: #93acd0 / #506a96 / #283756.
- Cristallo delle corna (punte e pala): #f0ffff / #a2eaf6 / #4fa8c8.
- Aurora (vena, punte accese, scia): verde 110,255,196; azzurro 95,224,255; viola 180,140,255. Una punta accesa ha il cuore #ffffff.
- Gocce di luce: #eafff6 con l'alone 140,255,210.
- Occhi: iride da #b8fbff a #3fd6e8, bordo #17708a, lucina #ffffff, alone 120,235,255. Azzurro ghiaccio, perché il Golem ha già gli occhi menta.
- Palpebre e cavità: #141e33.
- Sopracciglia di brina: #f0f8ff / #b6cee6 / #6f8db0.
- Naso #161e30 col riflesso #4a5a7e; dentro la bocca #2a1830; zannette #f0fbff con l'ombra #9cc3dc.
- Zoccoli: #616d86 / #343d54 / #181e2c, bordo brinato #cfe6f5.
- Fiato e neve: rgba(235,246,255,.55).

FASE 2, «l'aurora si accende»
- Manto più profondo e violaceo: #5e5fb4 / #35347c / #1a1848.
- Muso: #6a6ac0 / #3e3d8a / #201e52.
- Pancia: #9a92d8 / #6a62a8 / #3a3470.
- Pelo di brina, con l'ombra lilla: #ffffff / #e4e2f8 / #9a9cd0.
- Stelle accese: #f6eeff, con l'alone 200,160,255 che pulsa col respiro; fili delle costellazioni rgba(220,200,255,.35).
- Ghiacciuoli: #fbf4ff / #cdb8ff / #7a64c8, accesi dentro di 190,150,255.
- Muschio brinato: #a8d88a / #5a9a52 / #2e5a36, con fiorellini di ghiaccio #f2fbff (cuore #b8f0ff).
- Fusto delle corna: #a29ad8 / #5a4f9a / #2c2558.
- Cristallo: #fbf4ff / #cdb8ff / #7a64c8.
- Sulle punte fiamme d'aurora, da 125,255,176 a 195,140,255 a 255,122,208; tremolano sotto gli 8 Hz.
- Oro più acceso: #fff3c4 / #f0c04a / #9a6a1c.
- Occhi: iride da #f0c8ff a #b46cff, bordo #5a2a9a, cuore bianco, alone 200,140,255.
- Controluce più forte: 170,150,255, alpha .7.

LUCE D'AURORA (o.ghost: entrata, spiriti della mandria, sconfitta)
- Riempimento sfumato dall'alto in basso: rgba(140,255,215,.55) → rgba(120,200,255,.45) → rgba(190,150,255,.4).
- Al posto dell'INK, un contorno bianco rgba(255,255,255,.75) largo 1,4.
- Niente segni né dettagli piccoli.

PERCHÉ QUESTI COLORI
- Il blu notte è il cielo dove nasce l'aurora, e si stacca netto dal pavimento grigio chiaro del Prato dell'Aurora (in media circa #798185).
- Il bianco del cervo sacro resta nel collare, nella barba e nelle calze.
- L'oro è il colore della Vetta: la scheda dell'arena 12 è d'oro.
- Verde, azzurro e viola sono l'aurora del cerchio di rune e delle tende di oggi.

4. IL SEGNALE: LA CORONA
L'aurora nasce sempre dalle rosette d'oro e corre nel pezzo che colpirà. Il giocatore impara a guardarla come il cuore del Golem. A riposo respira piano alla base delle corna.
- Carica: la luce scende nelle due lance, che diventano bianche.
- Spazzata: le punte si accendono una dopo l'altra in sei tacche, come un orologio che si legge da lontano: lancia, P2, P3, P4, P5, P6, su tutte e due le corna insieme.
- Tende: le pale divampano e la luce sale dalle punte verso il cielo come fumo.
- Zoccolata: una perla di luce scende dalle rosette lungo il davanti del collo e nel petto fino alle zampe davanti; gli zoccoli diventano bianchi.
- Richiamo: la corona diventa viola dalle rosette alle punte e la criniera si accende.
- Corona Boreale: tutte le punte bianche, e un anello di luce sopra la corona.
Quando l'avviso a terra si blocca, gli occhi fanno un lampo (alone doppio per un attimo) e si sente un tintinnio.
Una punta accesa è un cristallo col cuore bianco e un bagliore (shine) solo su di lei. Con LOWFX cambia solo il colore.

5. DA FERMO E CAMMINA
Fermo (idle 3 s, si chiude su se stesso)
- Sta piantato a zampe larghe e respira lento e profondo: due respiri a giro. Petto, garrese e collare si alzano del 2%, i ghiacciuoli tintinnano appena.
- Sull'espirazione due sbuffi di brina dalle narici (p .35 e .85).
- A ogni respiro una pulsazione d'aurora sale dalle rosette alle punte (.1–.4 e .6–.9).
- Una goccia di luce si gonfia sotto una lancia, si stacca e cade fino a terra, dove diventa una stellina di brina che si spegne: a .3 da sinistra, a .8 da destra.
- La testa resta puntata sull'eroe mentre il corpo ondeggia appena.
- Palpebre pesanti e un battito lento (.62). Un orecchio scatta a .2, l'altro a .45. La coda frusta una volta a .7. Collare e licheni dondolano.
- A .5–.6 abbassa un poco la corona verso l'eroe: mezza minaccia.
- A .78–.86 raspa una volta la neve con lo zoccolo destro davanti; sbuffo di neve a .82.
- Mai un saltello.
- Fase 2: tre respiri a giro, più forti; dalle lance due fili di luce continui al posto delle gocce; fiamme sulle punte; stelle che pulsano col respiro; il fiato non smette mai.

Cammina (walk 1,1 s)
- Passo pesante a quattro tempi: dietro sinistra a 0, davanti sinistra a .25, dietro destra a .5, davanti destra a .75.
- Ogni zoccolo si alza di 7 e si posa di peso.
- La testa annuisce a ogni zoccolo davanti, la corona segue con un attimo di ritardo, il garrese rolla, collare e licheni dondolano.
- A ogni zoccolo davanti (.25 e .75) lascia un'impronta di brina e uno sbuffo di neve.
- Il gioco dà la fase dalla strada fatta, un giro ogni 70 px, così gli zoccoli non scivolano.
- È un re che passeggia davanti alla sua preda, mai un trotto.
- Fase 2: marcia altera, con gli zoccoli davanti alzati di 12, testa alta e coda su.

6. LE MOSSE IN BREVE
I momenti esatti sono nella lista delle mosse. I tempi sono in secondi del modello: nell'arena 12 il boss va 1,38 volte, quindi 1 s del modello dura 0,72 s veri.
- Carica del Re:
  - prep 1,4: testa giù con le lance in avanti, due raspate, luce nelle lance, lampo degli occhi a .35 quando la striscia si blocca, poi si carica indietro;
  - charge 0,6, a giro: galoppo a balzi, testa ferma, scia d'aurora dalle lance;
  - stuck 1,6: corna piantate, due strattoni, si libera a .82;
  - recoil 0,5: il rimbalzo della prima carica nella fase 2;
  - prep2 0,95: la seconda mira, corta;
  - skid 0,6: frena se non tocca niente.
- Spazzata della Corona (sweep 1,8): carica la corona di lato con le sei tacche fino a .5, spazza da destra a sinistra a .55–.70, scrolla. Con o.p2 c'è il ritorno a .70–.82.
- Tende d'Aurora (aurora 3,4): testa al cielo, pale che divampano, un cenno a .58 e uno a .72; con o.p2 anche a .86.
- Zoccolata del Re (stomp 2,0): impennata fino a 165 con la perla di luce nelle zampe, colpo a .52, poi resta basso. Con o.p2 secondo colpo a .76.
- Richiamo della Mandria (call 2,2): collo avanti e in su, bramito a .25–.70, corona viola.
- Corona Boreale (crown 4,0, solo fase 2): si pianta, raccoglie la luce a .15–.40, poi la corona brucia e la testa gira di 40° a .40–.88.
- Fase 2: rage 3,0, «l'aurora si accende».
- Entrata enter 3,4; sconfitta die 4,2; presa in giro taunt 1,2; colpito hit 0,6.

7. FASE 2: «L'AURORA SI ACCENDE» (rage, a metà vita)
Nella mossa:
- barcolla e la corona si spegne;
- piega un ginocchio e china la testa: sembra finita;
- dal cielo gli scende addosso una colonna d'aurora (la disegna il gioco);
- la corona si riaccende dalle punte in giù e crescono le punte nuove;
- si rialza in tutta la sua altezza, le stelle del manto si accendono una a una, gli occhi si aprono viola;
- bramito della rabbia.
Cosa cambia per sempre:
- manto violaceo con le costellazioni accese;
- corna più lunghe del 10%, con la pala a cinque punte e le fiamme d'aurora;
- ghiacciuoli più lunghi del 30% e accesi;
- muschio brinato coi fiorellini di ghiaccio;
- fili di luce continui dalle lance;
- occhi viola col cuore bianco;
- controluce più forte, fiato sempre, marcia altera.
La stanza NON si scurisce, perché Denis ha tolto le stanze buie. Cambiano solo: torce color aurora, un nastro d'aurora tenue che ondeggia sopra il muro di fondo, neve leggera che cade.

8. ENTRATA: «Il re scende con l'aurora»
enter dura 3,4 s sull'orologio dell'entrata; la luce d'aurora la fa il modello da solo.
- .00–.18: il cervo non c'è ancora. Il gioco fa scendere un velo d'aurora sul cerchio di rune: tre nastri, verde, azzurro e viola.
- .18–.35: nella luce si disegna la sagoma del Cervo fatta d'aurora (come o.ghost 1), a testa bassa.
- .35–.60: il colore gli sale addosso dagli zoccoli verso le corna. Il confine è una riga orizzontale sullo schermo, con un filo di luce sopra. Intanto fa due passi pesanti in avanti, a .42 e a .55.
- .60–.70: apre gli occhi; a .64 due lampi azzurri con la lucina.
- .70–.86: alza la testa in tutta la sua altezza e la corona si accende una punta dopo l'altra, in sei tacche: .72, .745, .77, .795, .82, .845. Il gioco suona una campana per tacca.
- .86–1: il bramito d'entrata (collo su, bocca aperta, sopracciglia alzate) con la corona tutta accesa; poi abbassa appena la corona verso l'eroe.

9. SCONFITTA: «Il re si inchina»
die dura 4,2 s; il momento clou è a 2,2 s (p .52).
- .00–.14: barcolla, la luce delle corna trema.
- .14–.34: le punte si spengono una dopo l'altra, dalle cime alle rosette: l'entrata al contrario.
- .34–.50: piega le zampe davanti e si inchina verso l'eroe finché la corona tocca terra. Il re riconosce chi l'ha battuto.
- .50–.56: la corona manda tutta la sua luce in un lampo morbido. È il clou.
- .56–.74: le corna si staccano pulite dalla testa, come ai cervi a primavera (nessuna ferita, restano le rosette), e restano ritte nel muschio davanti a lui, come un alberello di cristallo.
- .62–.92: il corpo diventa luce d'aurora dagli zoccoli in su e sale al cielo come una tenda che si arrotola: tre nastri che salgono e svaniscono.
- .84–1: un raggio caldo dell'alba (#ffd9a0, morbido) cade sulle corna. Intorno cresce un cumulo di muschio con fiorellini bianchi, ai suoi piedi si apre una stella alpina, l'ultima goccia di luce cade dalla punta più alta.
Cosa resta (a p .999, finché si esce dalla stanza): la corona spenta e chiara, ritta sul cumulo di muschio fiorito con la stella alpina. Niente dolore e nessuna caduta brutta.

10. PRESA IN GIRO: «Lo sguardo del re» (taunt 1,2 s)
- Alza il mento e ti guarda dall'alto in basso lungo il muso, con gli occhi bassi sotto le palpebre pesanti.
- Due sbuffi di brina dalle narici, a .25 e .40.
- Scuote piano la testa come a dire «no, no», mentre le gocce di luce sulle lance tintinnano come campanelle (.45–.75).
- Raspa una volta lo zoccolo (.80) e torna a fissarti.
- Mentre lo fa non attacca.

11. OPZIONI DEL MODELLO
- o.p2: seconda fase.
- o.z: altezza data dal gioco.
- o.noFx: niente effetti della mossa (polvere, fiato, gocce, scia).
- o.ghost (da 0 a 1): tutto di luce d'aurora, coi colori dati sopra. A 1 niente licheni, muschio, stelle, gocce né punte in più sulla pala: più leggero da disegnare.
- o.see (da 0 a 1): quando l'eroe gli passa dietro il gioco lo alza, e corona e criniera si schiariscono fino ad alpha .5.
- o.dir (±1): il verso della Corona Boreale. Con +1 la testa gira verso la sinistra del cervo (+y).
Con LOWFX:
- niente gocce né fili di luce, fiamme, controluce, scia, fiato, né licheni che dondolano;
- stelle ferme, senza alone;
- la vena d'aurora è una riga chiara senza 'lighter';
- bagliori solo negli occhi;
- o.ghost diventa una sagoma piena.

12. DISEGNI PER IL GIOCO
Hanno lo stesso aspetto del modello, come N3.golemSlab.
- N3.stagShard(x, y, z, a, sc, o): la scheggia di cristallo della corona, per la Spazzata e per l'urto della Carica. Un diamante lungo 18 e largo 7, col cuore d'aurora, la faccia illuminata, la riga bianca e il contorno INK; con o.p2 è viola. Accetta anche la forma corta (x, y, r, a), come quella del Golem.
- N3.stagSpike(x, y, h, k, sc, o): la punta di ghiaccio dell'onda della Zoccolata; h è l'altezza, di solito 18. Con k da .00 a .15 spunta, poi sta ferma, da .75 a 1 si spezza in schegge di brina. o.a è la direzione in cui pende (fuori dal centro); o.p2 la fa viola.
- N3.stagSpirit(x, y, face, p, sc, o): lo spirito della mandria, cioè il modello con o.ghost 1 nella mossa charge al momento p, a sc .62. o.k (da 0 a 1) serve per quando prende forma e quando svanisce. Il gioco lo disegna una volta per fotogramma e per direzione su un livello, poi lo posa più volte.
- N3.stagCrown(x, y, sc, o): la corona ritta sul cumulo di muschio fiorito, uguale alla fine della sconfitta. o.p2 dà la corona con la pala a cinque punte; o.k è la luce (da 0 a 1).

13. COSTO E PROVE
Obiettivo: mediana sotto 1,3 ms a fotogramma, come il Golem (1,2). Per arrivarci:
- geometria delle corna in tabelle fisse;
- una path sola per la vena;
- bagliori solo sulle punte accese e sugli occhi;
- stelle in una sola path;
- inviluppo filtrato e Path2D;
- cappucci con la chiave fissa (ellCap o.ck).
Il foglio si fa con node tests/foglio3d.js stag2 tests/b2/stag2.png --file sprite/nemici3d/stag2.js: quattro direzioni, fase 2, ogni mossa in 8 momenti, tempo di disegno.
Sul foglio controllare:
- le corna in ogni direzione, lontana e vicina mai scambiate;
- le zampe nel galoppo, nell'impennata e nell'inchino: garretto sempre indietro, zampe davanti mai dentro il petto;
- che il viso non sembri mai un teschio;
- che il manto si stacchi sul pavimento vero dell'arena 12.

## Le mosse del modello

| id | nome | secondi | descrizione |
|---|---|---|---|
| `idle` | Fermo | 3 | Due respiri lenti: petto, garrese e collare si alzano del 2%, i ghiacciuoli tintinnano. Sbuffi di brina dalle narici a .35 e .85. A .1–.4 e .6–.9 una pulsazione d'aurora sale dalle rosette alle punte. Una goccia di luce si stacca da una lancia e cade a terra, dove diventa una stellina di brina: a .3 la sinistra, a .8 la destra. La testa resta puntata sull'eroe (look) e il corpo ondeggia (rollio ±.02). Battito lento a .62, orecchie a .2 e .45, coda a .7, collare e licheni a pendolo. A .5–.6 abbassa un poco la corona verso l'eroe (beccheggio da +.12 a +.3 e ritorno). A .78–.86 raspa con lo zoccolo destro davanti (neve a .82). Mai un saltello. Con o.p2: tre respiri più forti, fili di luce continui dalle lance, fiamme sulle punte, stelle che pulsano, fiato sempre. |
| `walk` | Cammina | 1.1 | Passo pesante a quattro tempi con lo stepper: dietro sinistra 0, davanti sinistra .25, dietro destra .5, davanti destra .75. Gli zoccoli si alzano di 7 e si posano di peso; il punto alto della zampa scivola di ±5. La testa annuisce a .25 e .75, la corona segue in ritardo, il garrese rolla di ±.03, collare e licheni dondolano. A .25 e .75 (zoccoli davanti) impronta di brina e sbuffo di neve. Il gioco dà la fase dalla strada fatta, un giro ogni 70 px. Con o.p2: marcia altera, zoccoli davanti alzati di 12, testa alta (−.1), coda su. |
| `hit` | Colpito | 0.6 | Con hitK: la testa va indietro (−.3) e il corpo indietro di 4, orecchie piatte, occhi chiusi fino a .4. La luce della corona trema, i ghiacciuoli tintinnano, dal pelo esce uno sbuffo di brina. Si vede nelle pagine di prova: nel gioco i boss non fanno 'hit'. |
| `prep` | Prepara la carica | 1.4 | A .00–.20 si mette di fronte all'eroe e abbassa la testa finché le lance puntano avanti come spade (beccheggio +.55, testa avanti di 4 e giù di 10), orecchie indietro. A .20–.80 raspa due volte con lo zoccolo destro davanti (colpi a .32 e .58, sbuffi di neve), mentre la luce scende dalle rosette nelle lance: da .35 sono bianche. A .35 lampo degli occhi: è il momento in cui la striscia si blocca. Sbuffo di brina a .62. A .80–1 si carica indietro sulle zampe dietro (corpo indietro di 4 e giù di 3) e trema a 6 Hz; la coda si alza bianca. |
| `charge` | Carica | 0.6 | Galoppo vero a balzi, che si chiude su se stesso. Le zampe davanti si allungano insieme (sfasate di .08) e quelle dietro spingono; il corpo si allunga e si accorcia (petto ±4). Tutte e quattro le zampe in aria a .45–.60 (corpo su di 4). Testa bassa e ferma (+.55) con le lance avanti, orecchie piatte, coda alta e bianca, criniera piatta. Dalle punte delle lance una scia d'aurora (4 punti che sfumano); neve dagli zoccoli a .1 e .6. |
| `stuck` | Corna incastrate | 1.6 | A .00–.08 l'urto: testa e lance spinte avanti contro il muro (beccheggio +.7, testa avanti di 6), il corpo sobbalza avanti e indietro, una stellina di crepe sulle punte delle lance. A .08–.80 è incastrato: il corpo spinge, le zampe dietro scavano e scivolano indietro (−6), quelle davanti sono puntate. Due strattoni a .30 e .58: la testa tira indietro di 4 e torna, tre pezzetti di ghiaccio cadono dalla corona. Le rosette tremano 4 volte al secondo: è il momento per colpirlo. A .80–.88 si libera con uno strattone indietro e un passo indietro con le zampe davanti (−8). A .88–1 scuote la corona due volte e sbuffa. |
| `recoil` | Rimbalzo | 0.5 | È la prima carica della fase 2, che non si incastra. A .00–.20 rimbalza dall'urto: testa indietro (−.35), corpo indietro di 4, ghiacciuoli che tintinnano. A .20–.60 fa un passo indietro con le zampe davanti. A .60–1 una scrollata della corona, gli occhi già sull'eroe. |
| `prep2` | Seconda carica | 0.95 | La seconda mira della fase 2. A .00–.30 si gira verso l'eroe e abbassa la testa con le lance avanti. Le lance sono subito accese; lampo degli occhi a .05, perché la striscia nuova è già bloccata. A .30–.60 una raspata (.45). A .60–1 si carica indietro e trema. |
| `skid` | Frenata | 0.6 | A .00–.60 pianta gli zoccoli davanti in avanti (+8) e tira indietro il corpo (beccheggio −.15); la neve schizza dagli zoccoli davanti e il gioco lo fa scivolare. A .60–1 si rimette dritto e scrolla la testa. Serve quando la corsa finisce senza toccare niente. |
| `sweep` | Spazzata della Corona | 1.8 | A .00–.50 carica il colpo: gira la testa alla sua destra (imbardata −1,0; il collo segue a metà, il busto si torce di .2) e piega la corona di lato (rollio della testa −.35), come chi sguaina una spada. Le punte si accendono in sei tacche a .08, .16, .24, .32, .40, .48: lancia, P2, P3, P4, P5, P6, su tutte e due le corna (nella fase 2 P7 e P8 insieme a P6). Lampo degli occhi a .48. A .50–.55 resta caricato e trema. A .55–.70 la grande spazzata da destra a sinistra: l'imbardata va da −1,0 a +1,0, il busto si torce, lo zoccolo sinistro davanti si sposta in fuori a .58. Dietro le punte una scia d'aurora; le punte si spengono una dopo l'altra mentre partono le schegge. A .70–1 scuote la corona due volte, cadono gocce, sbuffo a .85. Con o.p2: le punte si riaccendono svelte a .66–.70, a .70–.82 il ritorno da sinistra a destra (imbardata da +1,0 a −.3), a .82–1 una scrollata. |
| `aurora` | Tende d'Aurora | 3.4 | A .00–.14 alza la testa al cielo (beccheggio −.6, collo su), le pale divampano, orecchie indietro. A .14–.88 tiene la testa alta con gli occhi socchiusi; a .2–.5 la bocca è aperta nel richiamo morbido. Il collo vibra piano, sotto i 5 Hz; la luce sale dalle pale come fumo, le gocce salgono invece di cadere. Tre cenni secchi, uno per tenda, a .58, .72 e .86: la testa scende di colpo di .3 e torna in .08. Senza o.p2 il terzo cenno non c'è. A .88–1 riabbassa la testa e scuote la corona. |
| `stomp` | Zoccolata del Re | 2 | A .00–.45 si impenna sulle zampe dietro fino all'altezza più grande: beccheggio −.70 intorno agli zoccoli dietro, punte a circa 165. Zampe davanti alte e piegate, ghiacciuoli ritti, collare che dondola. A .00–.35 una perla di luce scende dalle rosette lungo il davanti del collo e nel petto fino alle zampe davanti; gli zoccoli davanti diventano bianchi. Lampo degli occhi a .40. A .45–.50 trema in cima a 6 Hz. A .50–.54 batte giù, col colpo a .52: un fotogramma di schiacciata (corpo giù di 3, z ×.94), la corona va avanti per il peso, anello di brina e punte agli zoccoli. A .54–.78 resta basso col fiato di brina, i ghiacciuoli vibrano. A .78–1 si rialza e sbuffa. Con o.p2: a .56–.70 si rialza a metà (−.35), a .74–.78 batte di nuovo (colpo a .76), a .78–1 si rimette. |
| `call` | Richiamo della Mandria | 2.2 | A .00–.25 allunga il collo avanti e in su e apre la bocca nel bramito. La corona diventa viola dalle rosette alle punte, i ghiacciuoli si rizzano e si accendono. A .25–.70 tiene il bramito: il collo vibra, escono tre nuvole di fiato, lampi degli occhi a .25 e .50, sopracciglia alzate. A .70–1 riabbassa la testa, con due sbuffi a .78 e .90. |
| `crown` | Corona Boreale (fase 2) | 4 | A .00–.15 pianta le zampe larghe (quelle davanti ±4 in fuori), alza la testa (−.3) e apre la corona: le punte della pala si allargano del 15%. A .15–.40 la luce si raccoglie su tutte le punte, le fiamme crescono, la criniera si accende, un anello di luce sale sopra la corona (a z 140, raggio da 10 a 40). Lampo degli occhi a .38. A .40–.88 la corona brucia (tutte le punte bianche, l'anello pulsa) e la testa gira piano di 40° nel verso o.dir, seguendo i raggi; le zampe restano piantate e il corpo trema appena (6 Hz). A .88–1 la luce si spegne, testa bassa e fiatone di brina. |
| `rage` | L'aurora si accende (fase 2) | 3 | A .00–.12 barcolla indietro; la luce delle corna trema e si spegne, le gocce si fermano. A .12–.32 piega il ginocchio sinistro davanti a terra e china la testa: sembra finita. A .32–.50 il gioco fa scendere la colonna d'aurora: la corona si riaccende dalle punte in giù, crescono P7 e P8, corna e ghiacciuoli si allungano. Da .32 a .60 i colori passano dalla fase 1 alla fase 2. A .50–.68 si rialza in tutta la sua altezza; le stelle del manto si accendono una dopo l'altra e si uniscono in costellazioni; gli occhi si aprono viola. A .68–.90 il bramito della rabbia: collo su, bocca aperta, sopracciglia alzate, ghiacciuoli ritti. A .90–1 abbassa la corona, pronto. Dopo questa mossa il modello si disegna con o.p2. |
| `taunt` | Presa in giro | 1.2 | A .00–.15 alza il mento (beccheggio −.4) e guarda l'eroe dall'alto in basso lungo il muso, con gli occhi bassi sotto le palpebre pesanti. Sbuffi di brina a .25 e .40. A .45–.75 scuote piano la testa, «no, no» (imbardata ±.3 due volte), mentre le gocce di luce sulle lance tintinnano come campanelle (due scintille). A .80 raspa una volta la neve. A .85–1 torna a fissarlo. |
| `enter` | Entrata | 3.4 | A .00–.18 non si vede ancora: il gioco fa scendere il velo d'aurora. A .18–.35 prende forma la sagoma di luce d'aurora (come o.ghost 1), a testa bassa. A .35–.60 il colore sale dagli zoccoli alle corna (un confine orizzontale con un filo di luce) e fa due passi pesanti avanti, a .42 e .55. A .60–.70 apre gli occhi: a .64 un lampo con la lucina. A .70–.86 alza la testa in tutta la sua altezza e le punte si accendono una dopo l'altra in sei tacche: .72, .745, .77, .795, .82, .845. A .86–1 bramito d'entrata (collo su, bocca aperta) con la corona tutta accesa; poi abbassa appena la corona verso l'eroe. |
| `die` | Sconfitta | 4.2 | A .00–.14 barcolla, la luce delle corna trema. A .14–.34 le punte si spengono una dopo l'altra, dalle cime alle rosette. A .34–.50 piega le zampe davanti e si inchina verso l'eroe finché la corona tocca terra. A .50–.56 lampo morbido di tutta la corona: è il clou, a 2,2 s. A .56–.74 le corna si staccano pulite dalla testa e restano ritte nel muschio davanti a lui, come un alberello di cristallo. A .62–.92 il corpo diventa luce d'aurora dagli zoccoli in su e sale come una tenda che si arrotola (tre nastri che salgono e svaniscono). A .84–1 un raggio caldo dell'alba cade sulle corna: cresce il cumulo di muschio con fiorellini bianchi e una stella alpina, e l'ultima goccia di luce cade dalla punta più alta. A .999 resta la corona sul cumulo fiorito; con o.p2 è la corona a cinque punte sulla pala. |

## Le abilità nel gioco

PER CHI SCRIVE IL CERVELLO
File: src/js/89-cervo-nuovo.js. Si accende solo se esiste N3.stag2. Si prova prima col modello finto anteprime/boss2/stag_stub.js.

0. REGOLE E TEMPI
- 'p' è il momento della mossa del modello, da 0 a 1. 'm' sono i secondi del modello, cioè i secondi del boss.
- Nell'arena 12 bossLvl().spd vale 1,38. Il dt del boss (quello che muove e.mt, b3at e moveCircle) va 1,38 volte, quindi 1 m dura 0,72 s veri.
- I pericoli che vivono da soli nella stanza contano invece in secondi veri: proiettili shootE, G.waves, corsie e spiriti della mandria, il tempo attivo delle tende e dei raggi.
- I numeri «veri» scritti sotto hanno già dentro l'1,38.
- Nella fase 2 nessuna accelerazione in più, perché il boss va già a 1,38. La fase 2 è più difficile per i disegni dei colpi, le mosse nuove e le pause più corte. Così n3Move resta quello standard (la durata del modello) e il modello resta col colpo.
- Ogni danno ha un avviso a terra di almeno 0,6 s veri; è controllato mossa per mossa qui sotto.
- Mai due mosse insieme. La mossa dopo parte solo quando i pericoli della mossa prima sono finiti: tende cadute, spiriti spariti, raggi spenti.
- Avvisi:
  - Sono rossi come nel resto del gioco (229,72,77): bordo tratteggiato più un filo scuro all'esterno, rgba(60,14,18,.55), così si leggono sul pavimento chiaro.
  - Quelli legati a un colpo del modello si riempiono col p della mossa e sono pieni quando parte il colpo.
- Luce d'aurora dei pericoli (tende, spiriti, raggi):
  - Si disegna piena (source-over) con la sfumatura verde #7dffd0 → azzurro #6fd8ff → viola #b48cff, al massimo alpha .55, con una riga bianca nel mezzo e il bordo scuro rgba(20,30,60,.35).
  - Il bagliore 'lighter' si aggiunge solo sopra, e solo senza LOWFX.
  - Mai il lampo bianco su tutto lo schermo che c'è oggi: l'eroe deve vedersi sempre.
- I danni sono prima di DMG(). Nessun danno se P.inv > 0 o P.dashT > 0. Il contatto col corpo resta cdmg 22, come oggi.
- Velocità (nel codice, che il dt del boss moltiplica per 1,38, e vere):
  - cammina: 46 nella fase 1 e 55 nella fase 2 (64 e 76 px/s veri);
  - carica: 300 e 340 (415 e 470 px/s veri).

1. COLLEGAMENTI (come fa il Golem in 89-golem-nuovo.js)
Valori:
- N3.stag = N3.stag2. Il disegno di oggi resta come N3.meta.stag.old per le pagine.
- ET.stag.r = 32.
- ECOL.stag = '#34497f'.
- B2H.stag = 100.
- BBFX.stag = {c:'#34497f', f:'#a2eaf6', k:'rise', s:'shimmer'}.
- BOSS_INTRO.stag = 3.4.
- BDEATH.stag = {dur:4.2, clou:2.2, snd:'shimmer'}.
- Restano come sono: RUNEC.aurora (verde nella fase 1, viola nella 2) e B3V.stag (il Prato dell'Aurora: icep 4, veins 4, snow 6).
- Nuovi B3IN.stag e B3DIE.stag. BDIE.stag di 81 disegna già il modello 'die', e 88 ci mette la voce.
EUPD.stag nuovo:
- 88 aveva avvolto quello vecchio per la presa in giro. Quindi il nuovo deve gestire da solo lo stato 'taunt' (b3tick, fermo, faccia verso l'eroe, alla fine b3go walk 0,3–0,55 m), oppure avvolgere il vecchio solo per 'taunt'.
- La rabbia non passa da b3phase: b3say(e,'angry') va chiamato a mano.
Modello:
- N3G.wp.stag: la fase del passo viene dalla strada fatta: ((e.wd/70)%1), dove e.wd sono i px percorsi camminando.
- N3G.opt.stag: {see:e.see3||0, dir:e.cdir||1}.
- e.see3 va verso 1 in 0,2 s quando l'eroe è dietro: P.y < e.y−10, |P.x−e.x| < 66 ed e.y−P.y < 140. Altrimenti torna a 0.
Disegno e danni:
- EPDRAW.crystal usa N3.stagShard se esiste, come 'stone' per il Golem.
- hurtE avvolto: nello stato 'stuck' i colpi fanno ×1,5. La prima volta compare «Corna incastrate!» (#ffd84a, grandezza 18) sopra la corona.
- Una passata di disegno a terra (drawHazards2Ground) e una in aria (drawHazards2Air), per avvisi, tende, corsie, spiriti, raggi e punte.
- Lo stato sta in G.s2, azzerato in buildRoom.
Prove e testi:
- Registro BCL.stag per le prove, come BCL.golem: arena 11, mosse, pericoli contati, voce.
- Bestiario (BEST, voce 'stag'): «Boss. Carica e resta con le corna incastrate, spazza con la corona, fa cadere le tende d'aurora, si impenna e chiama la mandria di luce; a metà vita la corona si accende e gira i suoi raggi.»

2. TRA UNA MOSSA E L'ALTRA
- Cammina a mezza distanza, 180–240 px veri dall'eroe, girandogli intorno con la testa sempre su di lui. Il punto d'arrivo si sceglie come oggi, con b3spot.
- Quanto cammina:
  - fase 1: 1,25–1,6 m (0,9–1,15 s veri);
  - fase 2: 0,95–1,2 m (0,7–0,87 s veri);
  - dopo la Corona Boreale: 1,4 m.
- Prima di ogni mossa e.lf diventa l'angolo verso l'eroe, e la mossa parte da fermo.

3. LE ABILITÀ

A. CARICA DEL RE
Sequenza: prep → charge → stuck. Nella fase 2: prep → charge → recoil → prep2 → charge → stuck.
Avviso:
- Da prep p 0 una striscia rossa larga 64 va dal Cervo al primo muro o ostacolo solido (come stagLine di oggi).
- Fino a p .35 la striscia segue l'eroe, girando al massimo di 2,5 rad al secondo vero, senza scatti.
- A .35 si blocca e lampeggia; il modello fa il lampo degli occhi e si sente un tintinnio.
- Da bloccata (.35 → 1) passano 0,91 m, cioè 0,66 s veri prima della corsa: sopra 0,6.
Corsa:
- charge è a giro: e.s3 = null a ogni falcata, come oggi.
- Va dritto lungo la striscia a 415 px/s veri (fase 2: 470).
- Il contatto fa 24 una volta sola, al posto del contatto normale.
- Brina sotto gli zoccoli (b3fx 'sstride') e polvere ogni 0,17 m.
Urto contro un muro o un ostacolo:
- scossa 9, boom, vibrazione, vfxBlast di brina e cristallo, ghiaccioli dal soffitto (solo da vedere), cratere, b3fx 'swall';
- 7 schegge di cristallo all'indietro dal punto d'urto: un ventaglio intorno alla direzione opposta alla corsa, 0,3 rad tra una scheggia e l'altra, 170 px/s veri, 12 di danno; nella fase 2 sono 9;
- poi stuck 1,6 m (1,16 s veri): fermo, e i colpi fanno +50%;
- gli strattoni del modello sono a .30 e .58: scossa 2, pezzetti di ghiaccio;
- si libera a .82.
Se dopo 1,9 m di corsa non ha toccato niente (per esempio l'ostacolo è sparito): skid 0,6 m, e nessun premio per l'eroe.
Fase 2:
- dopo il primo urto non si incastra: recoil 0,5 m;
- poi prep2 0,95 m, con la striscia nuova già bloccata verso l'eroe: 0,69 s veri, sopra 0,6;
- seconda corsa, 9 schegge all'urto, poi stuck 1,4 m (1,0 s veri).
Come si schiva:
- un passo fuori dalla striscia quando si blocca: 38 px, 0,25 s;
- oppure lo scatto.
Farlo sbattere contro un ostacolo vicino all'eroe è il momento per colpirlo.

B. SPAZZATA DELLA CORONA (sweep 1,8 m, al posto dei Cristalli)
Mira: a p 0 guarda l'eroe (angolo a) e poi non si gira più.
Avvisi:
- Da p 0, davanti a lui, un settore rosso: dal centro, raggio 95, ampio 150° (a ±75°). Si riempie fino a .62: 1,12 m, cioè 0,81 s veri (sopra 0,6).
- Oltre il settore, 9 righe rosse tratteggiate sottili (1,5 px, lunghe 300) dove voleranno le schegge. Ognuna resta finché parte la sua scheggia; la prima parte a .55, dopo 0,72 s veri (sopra 0,6).
Colpi:
- A .62 il settore fa 22 di danno, se l'eroe è a meno di 95 + P.r·0,5 e dentro i ±75°.
- Da .55 a .70 partono 9 schegge di cristallo dalla corona (punto di partenza e.x, e.y−60):
  - una ogni .01875 di p, cioè ogni 0,024 s veri;
  - 210 px/s veri, 12 di danno ciascuna;
  - da a+75° ad a−75°, nell'ordine della testa: la prima dal lato destro del cervo (il lato dove cade b3pt(e,0,−60)), l'ultima dal lato sinistro;
  - 18,75° tra una scheggia e l'altra: a 200 px restano 65 px fra due schegge.
- b3fx 'scrystals' e 'ssweep'.
Fase 2 (o.p2): il ritorno da sinistra a destra. Da .70 a .82 partono altre 8 schegge, a metà strada tra gli angoli delle prime (negli spazi del primo ventaglio). Sono più lente (150 px/s veri) e non hanno righe: si vedono arrivare.
Come si schiva:
- uscire dal settore e mettersi tra due righe;
- nella fase 2, dopo il primo ventaglio, mezzo passo di lato (37 px a 225 px dal cervo).
Finestra per colpirlo: dopo la spazzata scrolla la corona (.70–1, cioè 0,39 s veri; nella fase 2 .82–1).

C. TENDE D'AURORA (aurora 3,4 m)
Come appaiono (a p .14):
- In cielo, sopra ogni fascia, un drappo d'aurora che ondeggia. È solo decorazione, alpha massimo .45.
- A terra la fascia: larga 64, da muro a muro, a onde ferme. La riga di mezzo si sposta di 16·sin(2π·s/260 + fase).
- La fascia ha il bordo rosso tratteggiato e un rosso che si riempie fino alla caduta.
La piega:
- Ogni tenda ha una piega aperta lunga 64. Lì non c'è luce, e due tacche bianche ne segnano i bordi.
- La piega sta a 60–150 px dalla proiezione dell'eroe sulla tenda, da un lato a caso.
- Mai sopra una lastra di ghiaccio: si controlla con onIce sui due bordi e al centro. Se da quel lato non c'è posto, si prova l'altro.
Fase 1:
- Due tende parallele, righe o colonne a caso. La prima passa sulla linea dell'eroe, la seconda a 130 px dal lato con più spazio. Tra le due resta un corridoio sicuro di 54 px.
- Cadono ai cenni del modello: a .58, cioè 1,08 s veri dopo che sono apparse (sopra 0,6), e a .72, dopo 1,43 s veri.
Fase 2:
- Tre tende: le due parallele, più una di traverso che passa dove sta l'eroe quando appaiono. Ognuna ha la sua piega.
- Cadono a .58, .72 e .86.
Quando cade una tenda:
- il drappo di luce scende in 0,1 s e resta attivo 0,5 s veri;
- fa 18 di danno una volta, se l'eroe è dentro la fascia a onde (|d| < 32 + P.r·0,5 dalla riga di mezzo) e non dentro la piega;
- scossa 2 e shimmer;
- poi resta la riga di brina lungo la tenda vera (ENV2.mark 'frost' ogni 70 px sulla linea a onde), e b3fx 'saurora' (torce color aurora).
Come si schiva: un passo fuori dalla fascia (38 px), il corridoio tra le due tende, oppure la piega.

D. ZOCCOLATA DEL RE (stomp 2,0 m)
Avvisi (da p 0):
- un cerchio rosso sotto di lui, raggio 72 (fase 2: 80), che si riempie fino a .52: 1,04 m, cioè 0,75 s veri (sopra 0,6);
- un anello tratteggiato chiaro dove arriva l'onda: 240 (fase 2: 290).
A .52:
- 26 di danno dentro il cerchio (distanza < 72 + P.r·0,5);
- un'onda di brina in G.waves: r e.r, max 240 o 290, 16 di danno, rgb '190,240,255';
- sul fronte dell'onda spuntano punte di ghiaccio (N3.stagSpike): un giro ogni 70 px di raggio, 12 punte sfalsate di mezzo passo da un giro all'altro. Ognuna sta 0,25 s e si spezza; al massimo 2 giri visibili insieme. Con LOWFX: 8 punte, un giro ogni 120 px;
- scossa 10, boom e icicles, cratere, b3fx 'sstomp'.
Dopo il colpo resta basso (.54–.78, 0,35 s veri): si colpisce.
Fase 2, secondo colpo a .76:
- 26 di danno nello stesso cerchio, che resta a terra da p 0 e si riempie di nuovo da .52;
- 12 schegge di ghiaccio a raggiera ('ice'), che partono a 60 px dal centro, 150 px/s veri, 12 di danno: la seconda zampata spezza le punte;
- nessuna seconda onda.
Come si schiva:
- uscire dal cerchio, poi stare oltre l'anello oppure passare l'onda con lo scatto;
- nella fase 2, dopo, mettersi tra due schegge: 30° tra l'una e l'altra, cioè 105 px a 200 px dal cervo.

E. RICHIAMO DELLA MANDRIA (call 2,2 m)
Le corsie (a p .25, il bramito pieno):
- Tre corsie attraversano la stanza da un muro all'altro. Sono righe orizzontali, lunghe quanto la stanza è larga, larghe 48, a 100 px l'una dall'altra.
- Una passa sulla riga dell'eroe; le altre due dal lato con più spazio, oppure una per parte. Tra due corsie restano 52 px.
- Bordo rosso tratteggiato, con impronte di zoccoli che si accendono.
- A un capo di ogni corsia, dal muro più lontano dall'eroe, prende forma lo spirito d'aurora (N3.stagSpirit, sc .62). Compare in 0,6 s.
Gli spiriti:
- 1,1 s veri dopo, galoppano lungo le corsie uno dopo l'altro, a 0,2 s di distanza, a 540 px/s veri.
- Passano attraverso gli ostacoli, che scintillano, e svaniscono in scintille contro il muro di fronte.
- 18 di danno, una volta per spirito, se l'eroe è nella sua corsia (|d| < 24 + P.r·0,5) quando lo spirito gli passa accanto.
- Lungo la corsia restano impronte di luce che si spengono in 2 s (b3fx 'sherd').
Fase 2: quando partono i primi tre spiriti, compaiono due corsie verticali: la colonna dove sta l'eroe in quel momento e una a 100 px. Hanno 1,0 s vero di avviso, poi due spiriti le percorrono, dall'alto o dal basso.
Il Cervo non attacca finché c'è in giro uno spirito; nel frattempo cammina. Non ci sono nemici da uccidere.
Come si schiva: uscire dalla corsia (30 px) o usare lo scatto.

F. CORONA BOREALE (crown 4,0 m, solo fase 2: subito dopo la rabbia, poi una volta a ogni giro)
Avviso (a p .15):
- Sei righe rosse tratteggiate, larghe 18, partono da lui fino al primo ostacolo o muro, a 60° l'una dall'altra.
- La prima è a 30° dalla direzione dell'eroe: all'inizio l'eroe sta a metà di un settore.
- Frecce rosse a 120 px dicono da che parte gireranno. e.cdir vale ±1 a caso, e lo stesso valore va al modello come o.dir.
- Avviso da .15 a .40: 1,0 m, cioè 0,72 s veri (sopra 0,6).
I raggi (a .40):
- Si accendono sei raggi d'aurora, larghi 18, col cuore bianco.
- Girano tutti insieme di 40° fino a .88: 1,39 s veri, 29° al secondo. L'angolo è θ = θ0 + dir·40°·(p−.40)/.48.
- Si fermano contro ostacoli e muri; la loro lunghezza si ricalcola a ogni fotogramma, a passi di 8 px, su G.rocks.
- Ogni raggio colpisce una volta sola per mossa (18 di danno): quando l'eroe è a meno di 9 + P.r·0,5 dalla sua riga e prima della fine del raggio.
- A .88 si spengono in 0,1 s; poi b3fx 'scrown' (righe di brina a raggiera).
Lui non si muove. Dopo la mossa resta a testa bassa col fiatone (.88–1): si colpisce.
Come si schiva:
- stare tra due raggi e camminare piano nel verso delle frecce: a 200 px bastano 100 px al secondo;
- oppure mettersi subito dietro un raggio, che si allontana;
- oppure passare un raggio con lo scatto;
- oppure ripararsi dietro un ostacolo.

4. FASE 2 (rage 3,0 m, a metà vita)
Quando parte:
- quando e.hp scende sotto il 50% e il Cervo sta camminando: mai durante una carica, un incastro, la mandria o la Corona;
- per tutta la mossa è invulnerabile;
- spariscono i proiettili in volo (G.eproj = []) e i pericoli a terra.
All'inizio:
- scritta «Il Cervo si accende d'aurora» · «Fase 2», come oggi;
- bossRage(e,'200,160,255'), barra rossa;
- b3fx(e,'phase2'): torce color aurora, ostacoli che tremano, ghiaccio dal soffitto.
Nella mossa:
- da .32 a .50 il gioco disegna una colonna d'aurora che scende dal cielo sul Cervo: larga 60, sfumata dal verde al viola, alpha massimo .5, con uno shimmer;
- a .68 b3say(e,'angry') e il bramito;
- a .70 un anello di neve spazzata via (ring2) e scossa 6.
Dopo, per il resto del combattimento: neve leggera che cade e un nastro d'aurora tenue (alpha .3) che ondeggia sopra il muro di fondo. La stanza non si scurisce mai.

5. ORDINE DELLE MOSSE
- Fase 1: Carica, Spazzata, Tende, Carica, Zoccolata, Mandria, poi si ricomincia.
- Fase 2: Corona Boreale, Carica doppia, Spazzata doppia, Tende (tre), Zoccolata doppia, Carica doppia, Mandria in due ondate, poi di nuovo la Corona.
- La prima mossa dopo l'entrata è la Carica.

6. ENTRATA (B3IN.stag)
Dura 3,4 s veri (BOSS_INTRO.stag) e il modello fa 'enter' su tutta la durata. e.em resta sotto 1 fino a 3,0 s; da lì compaiono alone e aura.
- 0: shimmer e una campana lontana. Il velo d'aurora scende sul cerchio di rune: tre nastri, verde, azzurro e viola, che arrivano da sopra il muro di fondo (0–0,7 s). Poi resta a terra come un velo (0,7–1,2 s) e sfuma mentre il Cervo prende colore (1,2–2,1 s).
- 1,43 s e 1,87 s (p .42 e .55): passi pesanti. Scossa 4, impronte di brina, un po' di neve e di ghiaccioli dal soffitto.
- 2,18 s (p .64): gli occhi si aprono; un piccolo shimmer.
- Da 2,45 a 2,87 s (p .72 + 0,025·i): sei campane sulle note della sua musica, una per tacca della corona: vBell, midi 74, 78, 81, 86, 90, 93.
- 2,92 s (p .86): il bramito (roar(), che 88 cambia in b3say 'cry'), due anelli di neve, scossa 6, vibrazione.
- 3,4 s: cammina, poi parte la Carica.

7. SCONFITTA
- BDEATH.stag: dura 4,2 s, clou a 2,2 s. Barra e «sconfitto» arrivano al lampo della corona; il rallentatore è come per gli altri boss.
- B3DIE.stag:
  - a p .2 un tintinnio mentre le punte si spengono ('icicles' piano);
  - a .52 il lampo morbido: ring2 chiaro e shimmer;
  - da .56 a .74 le corna si staccano: 'icicles' e uno sbuffo di neve;
  - da .62 a .92 scintille d'aurora che salgono, verdi e viola; shimmer a .7;
  - a .84 i fiori: ENV2.mark('bloom') intorno al corpo, e la brina vicina diventa fiori (b3fx 'sdie');
  - se nevica, smette di nevicare.
- La voce 'die' la mette già 88.
- Resta il modello a p .999, cioè la corona sul cumulo fiorito, finché si esce dalla stanza.

8. VOCE E PERSONALITÀ
Si tengono B3VO.VB.stag e il sistema di 88.
Battute delle mosse:
- B3CUE.stag = {charge:'c_charge', prep2:'c_charge', sweep:'c_sweep', aurora:'c_aurora', stomp:'c_stomp', call:'c_call', crown:'c_crown', stuck:'c_stuck'}.
- c_charge parte già con prep. Il secondo c_charge, dopo prep2, lo tiene fuori da solo la pausa di 1,2 s di b3say.
Clip nuovi in B3VO.VB.stag, prima che parta la preparazione a fettine:
- c_sweep: un «hmpf» corto dal naso, con un tintinnio di cristallo;
- c_call: il bramito pieno del wapiti. Parte basso e roco, sale in un fischio lungo e cristallino, finisce in tre grugniti; sotto, il tuono lontano degli zoccoli;
- c_crown: un richiamo che sale lento, con le campane;
- c_stuck: uno sbuffo seccato.
cry e angry si rifanno come il richiamo del wapiti. Tutti un poco più bassi di oggi (frequenze ×0,9), per il corpo più grande. La presa in giro e «laugh» restano i due sbuffi col «hmm». Volume medio tra 0,07 e 0,11, come gli altri.
Gesti:
- quando ti colpisce: presa in giro (taunt);
- quando stai lontano per 7 s: ti chiama (88 usa taunt con laugh2);
- quando lo colpisci forte: lamento, ma mai mentre è incastrato (lì dice c_stuck);
- quando cadi: ride ('win').

9. ARENA CHE REAGISCE
Da 87 si tengono 'sstride', 'swall', 'scrystals', 'saurora', 'scurtain', 'sstomp' e 'phase2'. I nuovi stanno nel file del Cervo, avvolgendo b3fx:
- 'ssweep': una mezzaluna di brina davanti a lui, sul bordo del settore (5 ENV2.mark 'frost');
- 'sherd': impronte di luce lungo la corsia (piccoli ENV2.mark 'frost' ogni 40 px) e gli ostacoli attraversati che scintillano (k.hit .18 e scintille);
- 'scrown': righe di brina a raggiera lungo i sei raggi, alla fine (ogni 50 px);
- 'sdie': la brina intorno al corpo si scioglie in muschio e fiori (ENV2.mark 'bloom').

10. COSA SI TIENE DEL BOSS DI OGGI
- Nome, titolo, vita 7.600 (×arena), oro 160, contatto 22, materiale 'flesh'.
- La stanza speciale, il Prato dell'Aurora (B3V.stag), col cerchio di rune dell'aurora.
- La musica 'cervo' (86), con il suo accordo di vittoria.
- La voce e l'arena che reagisce.
- La barra che si rompe in schegge che salgono, coi colori nuovi.
- I traguardi e la descrizione dell'arena 12.
- Servitori: nessuno. Gli spiriti della mandria sono un pericolo, non nemici da colpire.

11. PROVE E NUMERI
Modello finto anteprime/boss2/stag_stub.js:
- è il cervo di oggi registrato come 'stag2', con le durate nuove;
- fa le mosse nuove con quelle vecchie: prep2, stuck e skid → prep; recoil → hit; sweep → crystals; call e crown → aurora; rage → stomp;
- dà disegni semplici per N3.stagShard, Spike, Spirit e Crown.
Prove:
- python3 anteprime/mk_boss2.py stag --test, poi node tests/boss2gioco.js stag: entrata, tutte le mosse delle due fasi, pericoli contati, disegno della stanza, sconfitta, voce.
- Difficoltà: node tests/boss2diff.js stag, contro il Cervo di oggi (10,6 vite al minuto con l'eroe fermo, nel caso peggiore). Il nuovo deve stare tra 9 e 11; chi si muove deve perderne molte meno, perché ogni colpo ha il suo avviso.
- Combattimento di circa 50–60 s.

## Voti del direttore artistico

VOTI (severi, su 10). Il metro: possente, bello, figo, che faccia paura; un po' più cupo ma sempre Classica; abilità migliori e giuste; fattibile bene con la cassetta C3; all'altezza del Golem nuovo approvato da Denis.

«re»: 8,7, VINCE.
Pregi:
- È la sagoma più possente e regale delle tre: petto profondo, garrese alto, collo da toro, testa bassa e una corona larga tre volte il corpo.
- Collare e calze bianchi si leggono sul pavimento chiaro del Prato dell'Aurora. Il manto blu notte si stacca dal pavimento: il cervo bianco di oggi ci sparisce dentro (tests/b2/stag_oggi.png e le foto in battaglia).
- Il segnale è la corona: la luce sale una punta alla volta e va nel pezzo che colpirà. È lo stesso linguaggio del cuore del Golem, che Denis ha già approvato.
- Ogni abilità ha una risposta e un momento per punirlo. Le corna incastrate. La spazzata, che punisce chi gli sta addosso. La mandria su corsie dritte. La Corona Boreale come gran finale.
- Entrata e sconfitta si chiudono a cerchio: scende dall'aurora, torna aurora e lascia la corona nel muschio.
Difetti:
- Troppi accessori insieme (gobba d'alce, barba di licheni, licheni, stelle, rosette, criniera, mantellina, gocce): a 120 px fanno rumore e costano.
- Nella fase 2 «la stanza diventa più buia», ma Denis ha tolto le stanze buie per sempre.
- Nessuna delle tre proposte tiene conto che nell'arena 12 il boss va già 1,38 volte più veloce (bossLvl: tier 2, posto 3). Con in più l'1,15 della fase 2, quasi tutti gli avvisi scenderebbero sotto 0,6 s veri.
- La Zoccolata doppia della fase 2 non si passa con un solo scatto, e lo scatto si ricarica in 2,2 s.
- I due ventagli della Spazzata doppia, a 0,25 s e sfalsati di mezzo passo, sono troppo fitti per un telefono.
- Il passo di 78 px è troppo lungo per zampe di 40.

«spettro»: 7,8.
Pregi:
- L'immagine più originale: un pezzo di cielo stellato che cammina, con la Stella Polare.
- Il doppio bordo di luce: caldo dal sole della vetta e, dall'altra parte, un controluce d'aurora che stacca il corpo scuro.
- La cura per gli avvisi: tutti rossi, niente lampo bianco, niente stanza buia.
- La muta delle corna è un'idea vera da cervo. La Costellazione è una mossa che non ha nessun altro.
Difetti:
- È meno possente. Uno spirito con le zampe di nebbia che galleggia nella fase 2 perde il peso che serve al boss finale e il materiale «da giocattolo» della Classica.
- Il corpo a finestra sulle stelle in parallasse lotta contro i tre toni e costa.
- Il Passo con le eco e la Carica fantasma, che riappare dall'altra parte, si sovrappongono alla Piovra e al Burattinaio e si leggono peggio.
- La Zoccolata ammucchia ancora cerchio, onda, 8 schegge e 4 chiazze, che è proprio il difetto di oggi.
- Le corna cadute che fanno da riparo ripetono gli spallacci del Golem.

«guardiano»: 7,3.
Pregi:
- La massa più pesante, un bisonte.
- Un'idea di sistema forte: i cristalli piantati dalla carica poi «cantano» col bramito.
- Le note di collegamento più precise: n3Move, B3IN, BDEATH, B3CUE, la presa in giro, il modello finto.
- Le tende disegnate piene con il bordo scuro, così si leggono sul pavimento chiaro.
- La frenata, e nessuna accelerazione nella fase 2.
Difetti:
- Ripete il Golem punto per punto: spallacci e pettorale, cresta di pietre ritte sulla schiena, armatura che cade e diventa riparo.
- La piastra di ghiaccio sulla fronte rischia di sembrare una maschera, o un teschio.
- Tutto cristallo: scivola verso la Regina dei Ghiacci.
- Un bisonte corazzato è meno sacro e maestoso per l'ultimo boss.
- Cristalli che fermano le frecce e poi sparano sono troppe regole per i bambini.

COSA ENTRA NEL DESIGN FINALE
Base: «re».
Da «spettro»:
- il doppio bordo di luce;
- avvisi rossi ovunque e luce dei pericoli mai sopra alpha 0,55, così l'eroe si vede sempre;
- la fase 2 che non scurisce la stanza;
- la corona che si schiarisce quando l'eroe passa dietro al cervo (o.see);
- la stella alpina nel cumulo finale.
Da «guardiano»:
- nessuna accelerazione nella fase 2;
- la frenata (skid);
- tende, corsie e raggi pieni con il bordo scuro;
- i ciuffi di brina alle caviglie, che fanno leggere le zampe;
- la lista dei collegamenti.
Miei:
- La pala di cristallo in cima alle corna, come i caribù del nord: la corona si legge come corona e si allontana da Xerneas.
- Meno accessori: via la gobba d'alce e la barba lunga, i licheni restano solo appesi alle lance.
- Occhi azzurro ghiaccio, perché il Golem ha già gli occhi menta.
- Tutti i tempi rifatti per l'1,38 dell'arena 12.
- Zoccolata doppia in due tempi: prima l'onda, poi le schegge a raggiera.
- Ritorno della Spazzata con schegge più lente, che passano negli spazi lasciati dalle prime.
- Corona Boreale che parte con l'eroe a metà di un settore.
- Una mossa corta tutta sua per la seconda carica (prep2), più il rimbalzo (recoil).
