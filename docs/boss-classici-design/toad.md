# Re Rospo: il design finale

(Deciso dal direttore artistico tra tre proposte, 16 ottobre. Tipo nel gioco: `toad`; modello `sprite/nemici3d/toad2.js`.)

## Il design

RE ROSPO · «il Tiranno delle Lucciole»
Nel gioco nome e titolo restano: «Re Rospo», «Sovrano della palude». Il modello si chiama 'toad2' (file sprite/nemici3d/toad2.js) e dopo il sì di Denis prende il nome 'toad'.

L'IDEA
È il rospo più grosso e prepotente della Palude delle Lucciole. Per diventare re si è ingozzato delle lucciole della sua palude: per questo è enorme, e la loro luce gli vive dentro, nella pancia che brilla come una lanterna e nelle verruche della schiena. Siede come su un trono: corona d'oro troppo piccola e storta, cappa corta di velluto di tifa col bordo di piumino bianco (il suo ermellino), colletto alto di sette tife ritte dietro la testa.
Ti guarda dall'alto in basso, con le palpebre a mezz'asta sotto due creste ossee e un sorriso storto con due zannette; ogni tanto si lecca le labbra: per lui sei un boccone. Fa paura perché è una montagna che ti piomba addosso e la sua lingua attraversa mezza stanza.
Prima di ogni colpo la luce delle lucciole gli corre dentro fino al punto da cui partirà, e gli occhi si spalancano: è il suo avviso, come il cuore del Golem. A metà vita si mangia anche le ultime lucciole della stanza e la sua luce diventa brace. Quando lo sconfiggi le sputa tutte in una fontana di luce, si sgonfia e torna un rospetto qualunque che si tuffa nel fango. Resta la corona, e la palude si riaccende.
Resta un boss della Classica: forme tonde da giocattolo, colori pieni, occhi grandi con la lucina, due zannette tonde, niente sangue né ferite. «Un po' più cupo» vuol dire:
- verdi profondi con le ombre fredde e il buio della bocca;
- la luce della pancia che gli illumina il mento da sotto;
- lo sguardo annoiato e cattivo, e la mole.

SAGOMA E MISURE (sc 1, unità del modello)
Per confronto: l'Arciere 3D è alto 37, il Re Rospo di oggi 70.
Forma: una montagna a pera schiacciata, più larga che alta.
- In basso pancia e cosce larghissime, a terra.
- Testa piatta, tutt'uno col corpo, con due cupole degli occhi in cima e la corona in mezzo.
- Dietro la testa il ventaglio delle sette tife. Da davanti è una raggiera di punte sopra la testa, di lato una fila di punte piegate indietro, da dietro un ventaglio sopra la cappa.
Da lontano si legge in tre macchie:
- l'ovale crema della pancia accesa;
- la massa verde scura con le lucine sulla schiena;
- l'oro di corona e bracciali, sotto la raggiera scura delle spighe.
Altezze: 75 in cima alla testa, 86 in cima alle cupole degli occhi, circa 92 in cima alla corona, 116 in punta alla tifa centrale. È tre volte l'eroe, come il Golem (110).
Ingombro: largo 124 con le cosce (il corpo 92), profondo 96 (da −46 dietro a +50 davanti alla pancia).
Fase 2: tutto il 12% più grande (130 in punta, largo 139), ingrandito intorno al punto del pavimento.
Nel gioco: raggio 40 (oggi 34), ombra 52×17.

PEZZI NELLA POSA DI RIPOSO
Assi: x avanti, y alla sua destra, z in su. 0 è il punto del pavimento sotto di lui. I numeri sono indicativi: i pezzi vanno messi sulla superficie.
1. Corpo (dorso e testa, un solo volume): ellissoide di centro [−4,0,42], raggi [42,46,33], inclinato indietro di 0,12 (mento alto).
2. Pancia: un ellissoide suo, così trema in ritardo sul corpo (ritardo 0,06 di p).
   - Centro [18,0,27], raggi [31,39,27]: davanti arriva a x 49 e si appoggia a terra.
   - Crema sul davanti e sotto, verde sui fianchi con un passaggio morbido, quattro pieghe orizzontali morbide.
3. Sacca della gola: una palla sotto il mento, che esce dal corpo come oggi (outCap, sunkDraw).
   - A riposo centro [40,0,44], raggio 7.
   - Gonfiandosi avanza fino a [50,0,38]: raggio 14 nella risata, 24 nel rutto e nel gracidio dell'entrata, 30 nella furia.
4. Bocca: una riga INK spessa 2,8, da guancia a guancia, sul davanti della testa.
   - Va dal centro [36,0,55] agli angoli [12,±36,57]. L'angolo sinistro (y<0) sta 3 più su: è il sorriso storto.
   - Il labbro di sotto sporge un poco.
   - Aperta, è una caverna scura con la lingua arrotolata e in fondo la luce.
5. Zannette: due, d'avorio, tonde, sul labbro di sotto vicino agli angoli, in [24,±30,53]. Lunghe 5, larghe 3,5 alla base, puntano in su. Sono le sole: nessun altro dente.
6. Pappagorgia: due pieghe morbide sotto la bocca.
7. Cupole degli occhi: palle in [14,±20,74], raggio 12,5.
   - L'occhio guarda verso (1, ±0,3, 0,35).
   - Iride grande (raggio 9), pupilla orizzontale a rettangolo arrotondato, lucina bianca.
8. Palpebre di sopra: pelle che a riposo copre un terzo dell'iride, mai di più (la lucina resta sempre libera).
   - Battito: giù in 0,1 s, su in 0,2 s.
   - Prima di ogni colpo si spalancano di scatto.
9. Creste ossee sopra gli occhi (come nei rospi veri): un cordone di raggio 3 sul bordo di sopra di ogni cupola, dal davanti-dentro [22,±12,83] al dietro-fuori [6,±30,83].
   - A riposo sono quasi piatte: sguardo annoiato.
   - Quando prende la mira l'estremo di dentro scende di 4: una V cattiva, come il sopracciglio del Golem.
   - Nella fase 2 restano a V.
10. Ghiandole dietro gli occhi: ellissoidi in [−4,±29,66], raggi [13,9,7], coi pori a puntini. Spente nella fase 1, accese d'arancio nella fase 2.
11. Cosce e gambe:
   - coscia: ellissoide [−12,±44,19], raggi [26,16,18];
   - gamba piegata a due ossa (ik): anca [−12,±40,20], ginocchio [4,±52,14], caviglia [−8,±54,5], piede [10,±56,1];
   - piede palmato lungo 22, con quattro dita tonde, la membrana più scura e schizzi di fango.
12. Braccia corte e grosse a due ossa (ik):
   - dalla spalla [24,±33,34], col gomito in fuori verso [30,±46,16], alla mano piantata in [42,±30,2], davanti ai lati della pancia;
   - omero raggio 8, avambraccio raggio 7;
   - mano larga (palmo 10×8), quattro dita tonde coi polpastrelli a pallina (raggio 3,2);
   - al polso [38,±32,8] un bracciale d'oro ammaccato (raggio 7,5, alto 4).
   L'oro di corona e bracciali fa un triangolo che guida l'occhio.
13. Corona: sulla testa tra le cupole.
   - Centro della base [8,−3,74], raggio 11, alta 13, più una pallina (raggio 2,2) in cima a ogni punta.
   - Cinque punte; quella dietro a destra è piegata.
   - Storta di 0,25 verso la sua sinistra (0,35 nella fase 2).
   - Una crosta di fango secco sul cerchio.
   - Davanti la gemma-lucciola: una goccia di luce incastonata che pulsa piano.
14. Cappa corta di velluto di tifa color cannella, col bordo di piumino bianco a batuffoli (14 batuffoli, bordo largo 5) e i puntini scuri dell'ermellino.
   - Copre nuca, schiena alta e spalle: sta sull'ellissoide del corpo ingrandito 1,05 volte, intorno alla direzione indietro-in-alto (−0,62, 0, 0,78), con mezzo-angolo 1,0 di lato e 0,7 avanti-indietro.
   - Sulla schiena scende fino a z 44. Il bordo davanti passa dietro le ghiandole e scende sui fianchi dietro le braccia.
   - Non copre la schiena bassa: le verruche-lucciole si vedono da dietro.
15. Colletto di sette tife.
   - Gli steli partono dal bordo dietro della cappa, a circa [−28,y,66] con y = −24, −16, −8, 0, 8, 16, 24, e si aprono a ventaglio in alto e indietro.
   - Le punte stanno in [−34,±46,96], [−34,±31,103], [−34,±15,110] e [−34,0,116].
   - Stelo spesso 2,4 più il contorno. La spiga di velluto è una capsula di raggio 2,8, lunga 15, che finisce 3 sotto la punta; sopra c'è la punticina dello stelo.
   - Ondeggiano in ritardo (±2,5 in cima).
16. Verruche-lucciole (8, raggio 3,5–4,5): due file di tre sulla schiena bassa, in [−44,±13,40], [−42,±13,30] e [−34,±13,21], più una in cima a ogni coscia in [−16,±50,34].
17. Verruche spente: 12 (raggio 2,5–4) su fianchi e cosce. In più nove macchie scure su dorso e cosce, e i pori a puntini.
18. Dentro la pancia tre lucine morbide (raggio 7–10) che girano piano, ritagliate alla pancia: le lucciole ingoiate.
19. Tre lucciole gli girano intorno (raggio 58–66, alte 40–90), un giro intero per ciclo di mossa. Nella fase 2 sono cinque, arancio, e c'è anche il piumino.

COLORI (chiaro / base / scuro)
Fase 1
- Pelle: #9ccf5c / #4f8a34 / #1e4022 (ombre fredde). Macchie #2a4a1e. Riflesso bagnato largo su dorso e testa #eaffd8 al 35%. Bordo illuminato (rim) #e2f28a, la luce lime delle torce.
- Verruche spente: #b0d870 / #5f9638 / #2c5020.
- Verruche-lucciole: nucleo #f6ffc0, colore #d6f55a, bagliore 214,255,90.
- Creste: #8aaa52 / #44682a / #1c3218, con un filo chiaro in cima #d8e890.
- Ghiandole: #8cbc58 / #4a7a30 / #22401c, pori #1a3216.
- Pancia: #fff3c4 / #ecd38c / #a8873e, pieghe #c4a356, luci dentro 220,255,120.
- Sacca: #fff8dc / #f1dc98 / #b89a50; accesa #fffbe0 col bagliore 235,255,150.
- Occhi: iride #ffe9a0 / #ffb02e / #b8680c, pupilla INK, lucina #ffffff, bagliore 255,190,70. Palpebra del colore della pelle, con la riga INK.
- Bocca: dentro #4a1a2c, in fondo #2a0c18.
- Lingua: #ffa3b8 / #e8607e / #a02c4c; pallina della punta #ffc4d2 con riflesso bianco; chiazza appiccicosa rgba(255,170,195,.6).
- Zannette: #fffaf0 / #efe2c0 / #b8a882.
- Oro di corona e bracciali: #fff0a0 / #f2b62e / #94580c. Fango secco #5a4a2a. Gemma-lucciola #f6ffc0 / #b8f040 / #4e8a14, bagliore 200,255,90.
- Cappa di velluto: #c27a44 / #8a4a26 / #4a2412. Piumino #fff6e2 / #e8dcc0 / #b8a888, puntini dell'ermellino #5a3a20.
- Tife: spighe #b88048 / #7a4a24 / #3a2210; steli #9cb85a / #5e7e30 / #2c4218.
- Lucciole: corpo #3a3020, ali rgba(255,255,255,.5), coda #f6ffc0 col bagliore 214,255,90.
- Membrana dei piedi #3a6a28, schizzi di fango #5a4a30.

Fase 2
La pelle diventa più fredda e profonda, così l'arancio risalta e il corpo non si confonde col pavimento oliva #4c4b35.
- Pelle: #86c77a / #3f7f4a / #173a26. Macchie #1f4a2c. Rim #ffc070.
- Verruche-lucciole: nucleo #fff2c0, colore #ffaa3a, bagliore 255,150,50.
- Ghiandole accese: cuore #ffb04a, orlo #c25a14, bagliore 255,140,50.
- Pancia accesa da dentro: #ffe2b0 / #f4b468 / #a8602a, luce 255,170,70.
- Sacca accesa #fff0d8, bagliore 255,170,80.
- Occhi: #ffc8a0 / #ff5a26 / #a01e08, bagliore 255,90,40. Rossore sulle guance 255,96,64 al 35%.
- Gemma #ffb040, bagliore 255,140,40.
- Creste: #6a9a62 / #2f5a36 / #142a1a.
- Cappa più cupa: #a8603a / #6e3a1e / #3a1c0e, piumino #ffe8cc.
- Al posto delle spighe, batuffoli di piumino luminoso #fff0d8 col bagliore 255,190,110.
- Lingua #ff6f9a, punta 255,170,80.
- Lucciole: coda #ffd08a, bagliore 255,150,50.

Nella stanza
- Cerchio di rune da 200,240,90 a 255,190,60, come oggi (RUNEC.rospo).
- Nella fase 2 le torce diventano arancio ma restano accese: la stanza non si scurisce mai.

FACCIA E SGUARDO
- A riposo: palpebre a mezz'asta, creste piatte, sorriso storto con le zannette, mento alto. Ti guarda dall'alto in basso, annoiato.
- Prima di colpire: palpebre spalancate di scatto, pupille strette, creste a V, bocca tirata indietro in un ghigno. È il secondo avviso.
- Fase 2: occhi spalancati rossi che non tornano più a mezz'asta, creste a V, broncio con le zannette in vista, guance rosse.
- Gli occhi hanno sempre la lucina. Quando si gira, gli occhi arrivano prima del corpo.

IL SEGNALE: LA LUCE DELLE LUCCIOLE
Le lucciole che ha ingoiato vivono nella pancia. Prima di ogni colpo la loro luce si raduna e corre sotto la pelle, come una perla di luce morbida col suo bagliore che lascia una scia, fino al punto da cui partirà il colpo; quel punto si accende. Insieme gli occhi si spalancano.
Dove va la luce:
- Linguata: dalla pancia su per la gola fino agli angoli della bocca (la riga della bocca si accende).
- Frustata: nella guancia del lato da cui parte la lingua.
- Panciata: giù nelle cosce, poi su per tutte le verruche-lucciole dalle cosce alla testa (la pancia si spegne).
- Rutto: nella sacca, che diventa una lanterna con le lucciole che girano.
- Tamburo: tutta nella pancia, che fa un lampo a ogni colpo.
- Pioggia: dalla pancia alla gola fino alla bocca aperta, arancio.
La luce che viene dal basso illumina mento, bocca e mani con una sfumatura calda sul lato di sotto: è il tocco cupo.
Nel gioco questo momento ha un suono: un tintinnio di vetro che sale, al posto del «tum-tum» del cuore del Golem. Con LOWFX la perla è una macchia chiara senza bagliore.

PITTURA (come la lanterna)
- Tre toni su ogni pezzo.
- Contorno INK spesso: 2,5–3 sui pezzi grandi.
- Bordo illuminato (rim) in alto a sinistra, del colore della luce delle torce: lime nella fase 1, arancio nella fase 2.
- shadeLimb su braccia, gambe e steli; glowTop su corona e cupole degli occhi.
- shine solo sulle cose che fanno luce: verruche-lucciole, sacca accesa, pancia, gemma, lucciole, occhi.
- Segni leggeri: pieghe a gomiti e ginocchia, le quattro pieghe della pancia, il riflesso bagnato su dorso e testa, il riflesso lucido su pancia e sacca, pori, schizzi di fango sui piedi.
- Ombre profonde sotto la pancia e dentro la bocca.
Costo: la mediana deve stare sotto 1,2 ms, come il Golem.
- Tife, cappa col piumino, verruche e macchie si calcolano una volta sola (Path2D).
- Solo le 8 verruche-lucciole hanno il bagliore.
Con LOWFX:
- niente bagliori (verruche-lucciole e pancia accese sono tinte piatte chiare);
- niente lucine che girano, niente lucciole intorno, niente piumino che vola, niente schizzi;
- tife e cappa ferme.

MOSSE DEL MODELLO
Le durate sono quelle della fase 1. Nella fase 2 il gioco le fa andare 1,25 volte più rapide. Ogni mossa dipende solo da p e l'ultimo fotogramma si collega al primo; tutti i tremiti stanno sotto gli 8 Hz. I tempi completi sono nella lista delle mosse; qui i momenti che contano.
- idle «Fermo» (3,2 s): trono, respiro con la pancia in ritardo, onda di luce sulle verruche (.10–.60), guarda a sinistra (.15–.35) e a destra (.40–.55), battito pesante (.62), dita che tamburellano sulla pancia (.70–.84), leccata di labbra (.86–.96).
- walk «Avanza» (1 s): nella fase 1 striscia a quattro zampe come un lottatore di sumo (mano sinistra .00, piede destro .25, mano destra .50, piede sinistro .75). Con o.p2 è un balzo pesante: in volo tra .10 e .45, atterra di pancia a .47.
- hit «Colpito» (0,6 s): solo per le pagine.
- tongue «Linguata» (1,6 s): la luce sale .05–.40, tremito .40–.52. Colpo a .55, lingua tutta fuori a .60, tesa fino a .66. Rientra .66–.90, deglutisce .90–1.
- stuck «Lingua incollata» (1,1 s): strattoni a .15 e .45, si stacca a .70.
- sweep «Frustata» (1,6 s, fase 2): prepara .00–.45, tremito .45–.52, spazzata .52–.70, ritorno .70–1.
- flop «Panciata» (2 s): si accuccia e la luce corre .00–.30, spinta a .30, a stella .33–.50, cade .50–.75, SPLAT a .75, ritorno .78–1.
- bubbles «Rutto di bolle» (1,8 s): sacca-lanterna .00–.55, rutto a .60, si pulisce la bocca .82–1.
- drum «Tamburo di pancia» (2,6 s): colpi a .32, .52 e .74 (con o.p2 a .32, .46, .60 e .76), poi gong, poi indica la pozza (.86–1).
- rain «Pioggia di lucciole» (2,4 s, fase 2): tre colpi di tosse a .35, .45 e .55.
- rage «Furia» (3 s): pugni a terra (.15, .25, .35), ingoia (.38–.55), cambia colore e si gonfia (.45–.62), occhi rossi (.60), gracidio (.62–.85), le spighe scoppiano (.70).
- taunt «Presa in giro» (1,2 s).
- enter «Entrata» (3,4 s): cade dall'alto e tocca terra a .45.
- die «Sconfitta» (4 s): il momento clou è a .50.

ENTRATA (3,4 s): IL RE CADE DAL CIELO
La recita il modello, caduta compresa (il gioco tiene e.z a 0).
- .00–.26: lui non si vede. Le lucciole della stanza girano a spirale sopra il cerchio di rune e le pozze fanno cerchi; si sente un gracidio lontano, dall'alto.
- .26–.45: un'ombra compare al centro e cresce.
- .30–.45: cade dall'alto, a stella e di pancia, con la pancia accesa (z da 360 a 0). A .32 la corona gli vola via verso l'alto.
- .45: TONFO. Si schiaccia larghissimo; la stanza trema; le pozze schizzano, le ninfee saltano, le canne si piegano; tre anelli d'acqua senza danno.
- .45–.62: trema come una gelatina e si tira su, seduto come sul trono.
- .55–.67: le sette tife scattano su una dopo l'altra.
- .62–.68: la corona ricade dal cielo e gli si posa in testa, storta, con un luccichio («clink»).
- .66: apre gli occhi, ambra, a mezz'asta.
- .72–.88: gonfia la sacca al massimo, accesa, e a .74 lancia il gracidio reale.
- .90–1: si sistema col sorrisetto storto e tamburella due dita sulla pancia.
Così mostra subito la sua mossa più forte, e non sale dall'acqua come la Piovra e l'Idra.

SCONFITTA (4 s; il momento clou è a 2 s, con la barra e «sconfitto»)
È il «si gonfia e scoppia» di oggi, ma scoppia di luce.
- Barcolla. La corona vola via e cade a terra davanti alla sua sinistra.
- Si gonfia tremando fino a 1,45 volte. La pelle si schiarisce e la luce torna dall'arancio al verde-giallo, finché è una lanterna. Le tife saltano via come tappi.
- A 2 s il rutto enorme: una fontana a spirale di lucciole riempie la stanza, con un lampo verde-giallo.
- Si sgonfia come un pallone, con due sbandate; la cappa gli scivola giù.
- Rimpicciolisce, intero, fino a un rospetto qualunque (0,16 volte): sbatte gli occhi, guarda la corona, fa un saltello e si tuffa nel fango.
- Restano la corona, con una lucciola che le si posa sopra e lampeggia, e il velluto della cappa, che sfuma.
Le lucciole liberate restano nella stanza: la palude si riaccende.

PRESA IN GIRO (1,2 s)
Viene dalla fine dell'entrata.
- Si appoggia indietro e si dà due pacche sulla pancia.
- Ride «gro-gro-gro», con la sacca che si gonfia a ogni risata e gli occhi chiusi dal gusto.
- Apre un occhio solo, ti indica col dito e si passa la punta della lingua sulle labbra.

OPZIONI DEL MODELLO
- o.p2: seconda fase (colori, +12%, occhi spalancati rossi, piumino al posto delle spighe, ghiandole accese).
- o.z: altezza data dal gioco nella Panciata e nei balzi.
- o.tip: [dx,dy] sullo schermo rispetto al punto (x,y) del disegno: dove sta la punta della lingua, come oggi. La lunghezza la decide il gioco.
- o.side: +1 o −1, il lato da cui parte la Frustata (+1 è la sua destra).
- o.chain: Panciata della Tripla, che parte dalla pancia schiacciata.
- o.point: angolo rispetto a dove guarda; è la pozza che indica alla fine del Tamburo.
- o.noFlies: niente lucciole intorno (le fa volare il gioco).
- o.noFx: niente effetti della mossa.
Registrazione: reg('toad2', {n:'Re Rospo', g:'boss', sc:1, an:[le 14 mosse], dur, lab}). Il disegno di oggi resta come N3.meta.toad2.old per la pagina «prima e dopo», come per il Golem.

DISEGNI DA ESPORTARE PER IL GIOCO
Hanno lo stesso aspetto del modello, come N3.golemRock.
- N3.toadBubble(x,y,z,r,ph,sc,o): bolla grande e trasparente, con un contorno verde scuro sottile, un riflesso bianco ad arco e un velo azzurrino rgba(190,240,255,.2). Dentro una lucciola accesa che lampeggia (ph). o.p2: lucciola arancio. o.pop da 0 a 1: lo scoppio, con un anello di luce e quattro goccioline.
- N3.toadFly(x,y,z,k,sc,o): la lucciola, con il corpo scuro tondo, due ali che vibrano e la coda accesa col bagliore; k è la fase del lampeggio. o.p2: brace arancio. o.fall da 0 a 1: la scia di luce che scende dall'alto (Pioggia).
- N3.toadMud(x,y,r,k,sc,o): la chiazza di fango, k da 0 a 1 la sua vita. Si allarga in .1, resta lucida con due bollicine, alla fine si secca con una crosta più chiara e sfuma. Colori: #3a2a1c lucido, orlo bagnato #c9b78c, riflesso #a08a62; più scura del pavimento, così si legge come un buco bagnato.
- N3.toadCrown(x,y,z,rot,sc,o): la corona da sola, per quella che resta a terra dopo la sconfitta.

DA CONTROLLARE NEI FOGLI
1. Da dietro: la cappa copre solo la schiena alta e le sei verruche-lucciole basse si vedono. Il ventaglio delle tife sta davanti alla cappa; da davanti sta dietro la testa. Ogni stelo va in ordine secondo la sua posa di riposo.
2. Le palpebre non coprono mai più di un terzo dell'iride, e la lucina resta sempre libera.
3. La stella in volo e la caduta di pancia (inclinazione fino a 0,9), viste di lato e da dietro:
   - braccia e gambe a due ossa, con l'ordine della posa di riposo;
   - le braccia restano davanti alla pancia anche quando sono alzate nel Tamburo;
   - la cappa aperta non deve passare davanti al corpo.
4. Pancia che trema, lucine che girano e lucciole intorno fanno cicli interi, così la mossa si chiude su se stessa.
5. Le zannette restano piccole, tonde e d'avorio. Dentro la bocca il colore è prugna, mai rosso.
6. La sconfitta non deve mai sembrare una pelle vuota:
   - il pallone gonfio è lucido e acceso;
   - poi rimpicciolisce intero, con ogni pezzo attaccato, ingrandito o rimpicciolito intorno ai piedi;
   - il velluto per terra è un mucchietto di stoffa.
7. La lingua:
   - parte dalla bocca, quindi quando lui guarda lontano dalla telecamera va dietro la testa;
   - è grossa abbastanza da leggersi: contorno 12, rosa 8, pallina in punta di raggio 8.
8. La corona resta attaccata alla testa in ogni direzione; quando salta torna allo stesso posto.
9. Gli steli delle tife sono spessi almeno 2,4 più il contorno: quello che si deve leggere sono le spighe.
10. Il contrasto col pavimento #4c4b35 va guardato nei fogli in tutte e due le fasi.
11. Rispetto agli altri due boss della palude, la Piovra (ninfea con fiore rosa, inchiostro, gorgo, immersioni) e l'Idra (immersioni):
   - in battaglia non si tuffa mai;
   - niente inchiostro né gorgo;
   - le sue luci sono lucciole lime e arancio, non il magenta della Piovra.

## Le mosse del modello

| id | nome | secondi | descrizione |
|---|---|---|---|
| `idle` | Fermo | 3.2 | Seduto come su un trono: pancia a terra tra le cosce, mani piantate, mento alto, palpebre a mezz'asta (un terzo dell'iride), creste piatte, sorriso storto con le zannette. Respiro: .00–.50 inspira (dorso +2, sacca fino a r 9 a .45), la pancia lo segue con 0,06 di ritardo e poi fa due ondine (.50–.62); .50–1 espira. .10–.60 un'onda di luce passa sulle verruche-lucciole dalla coda alla testa; le tre lucine della pancia fanno un giro. .15–.35 guarda a sinistra, .40–.55 a destra (corpo ±0,2, gli occhi arrivano prima), poi torna su di te. .62 battito pesante (giù in .03, su in .06). .70–.84 tamburella le quattro dita della mano destra sulla pancia, una dopo l'altra (quattro fossette). .86–.96 si lecca le labbra: la punta della lingua esce dall'angolo sinistro, passa sul labbro di sopra e rientra. Corona e tife dondolano in ritardo; le tre lucciole fanno un giro intorno; p 1 uguale a p 0. Con o.p2: fiatone corto e arrabbiato, occhi spalancati rossi, creste a V, broncio con le zannette in vista, quattro respiri corti con la pancia che sussulta, cinque lucciole arancio e il piumino che girano due volte. |
| `walk` | Avanza | 1 | Fase 1: striscia a quattro zampe come un lottatore di sumo. .00 la mano sinistra va avanti e giù con uno schizzo, .25 il piede destro si trascina avanti, .50 la mano destra (schizzo), .75 il piede sinistro. La pancia va a pendolo di lato (±6) con 0,06 di ritardo e trema a ogni appoggio, il corpo rolla ±0,06, tife e corona traballano, la cappa ondeggia appena. Nel gioco 34 px/s, il corpo guarda dove va. Con o.p2 un balzo pesante per ciclo: .00–.10 spinta delle cosce, .10–.45 volo basso (z fino a 16, o.z dal gioco se c'è) con la pancia che pende e le mani avanti, .47 atterra di pancia schiacciandosi del 15% con uno schizzo, .50–.80 un'ondina sale fino alla corona che saltella, .80–1 si raccoglie per il balzo dopo (nel gioco si sposta solo tra .10 e .45, circa 45 px a balzo). |
| `hit` | Colpito | 0.6 | Rinculo (lean −0,24, indietro di 3), la pancia rimbalza, palpebre strizzate, la corona salta e ricade più storta, la sacca si sgonfia di colpo, stelline sopra la testa fino a .75; .75–1 torna seduto. Nel gioco i boss non la usano: serve alle pagine. |
| `tongue` | Linguata | 1.6 | Preparazione: .00–.10 si gira tutto verso di te; .10 palpebre spalancate di scatto, pupille strette, creste a V. .05–.40 la perla di luce sale dalla pancia su per la gola fino agli angoli della bocca (la riga della bocca si accende, luce dal basso sul mento); si tira indietro (lean −0,15), la sacca si gonfia un poco (r 11). .40–.52 tremito leggero (6 Hz). Colpo: .55 la bocca scatta aperta e la lingua esce verso o.tip (la lunghezza la dà il gioco: tutta fuori a .60), grossa (contorno 12, rosa 8, pallina in punta r 8 col riflesso). .60–.66 tesa, con un fremito. Ritorno: .66–.90 rientra (se il gioco tiene o.tip sull'eroe la punta lo segue mentre lo tira), .90–1 deglutisce (la gola scende), si lecca le labbra, le palpebre ricadono a mezz'asta. Se la lingua va a vuoto il gioco passa a stuck a .66. |
| `stuck` | Lingua incollata | 1.1 | La lingua tesa fino alla punta incollata (o.tip fermo; sotto la pallina una chiazza rosa appiccicosa); la luce della gola è spenta e la pancia smorta: si vede che è indifeso; occhi strabuzzati, creste in su (sorpreso). .15 e .45 due strattoni: il corpo va avanti di 4, la pancia sbatte, gli occhi si strizzano, la lingua vibra. .70 si stacca: la lingua torna come un elastico in .07 e lui va indietro di colpo (lean −0,2). .77–1 scuote la testa due volte, si lecca le labbra, le palpebre tornano a mezz'asta. |
| `sweep` | Frustata | 1.6 | Solo fase 2. Preparazione: .00–.45 gira tutto il davanti verso il lato o.side (yaw fino a 0,45·side), la lingua penzola fuori da quell'angolo della bocca (.20–.48), la perla di luce sale nella guancia di quel lato; .08 palpebre spalancate e creste a V; .45–.52 tremito. Colpo: .52–.70 la lingua spazza 110° davanti a lui dal lato o.side all'altro (la punta la dà il gioco con o.tip); il corpo ruota con lei (yaw da +0,5·side a −0,5·side) e la pancia va dall'altra parte in ritardo. Ritorno: .70–.85 la lingua rientra, .85–1 schiocca le labbra e torna dritto. |
| `flop` | Panciata | 2 | Preparazione: .00–.30 si accuccia: pancia schiacciata a terra (s −0,2), cosce caricate; .05 palpebre spalancate; .05–.28 la luce scende nelle cosce e poi sale a onda su tutte le verruche-lucciole dalle cosce alla testa (la pancia si spegne); .22–.30 tremito. .30 spinta enorme. .33–.50 sale a stella: braccia e gambe aperte, inclinato indietro (lean −0,35) con la pancia in mostra, la cappa aperta ai lati, le tife che sventolano. .50–.75 si gira in avanti (lean fino a +0,9) e cade di pancia (altezza da o.z; senza, fino a 150 a .52). Colpo: .75 SPLAT, la pancia si schiaccia e si allarga (sx +0,3, s −0,35), lampo di luce dentro, le lucine sobbalzano, schizzi. Ritorno: .78–.90 un'ondina sale fino alla testa e la corona salta di 6; .90–1 si stacca dal fango con le braccia e torna seduto. Con o.chain (seconda e terza della Tripla) .00–.12 si raccoglie dalla pancia schiacciata invece che da seduto. Con o.noFlies le tre lucciole intorno non ci sono (le fa volare il gioco sul cerchio). |
| `bubbles` | Rutto di bolle | 1.8 | Preparazione: .00–.55 gonfia la sacca da r 7 a r 24: dentro si accende come una lanterna e ci girano quattro lucciole; guance gonfie; .05 palpebre spalancate, da .35 occhi sporgenti; .45–.55 tremito comico (6 Hz). Colpo: .60 il RUTTO: bocca spalancata, la testa scatta avanti, la sacca si svuota in .06; il modello disegna solo le bolle che escono dalla bocca (i primi 30 px), poi le disegna il gioco. Ritorno: .60–.80 la bocca resta aperta e soffia; .82–1 si pulisce la bocca col dorso della mano destra, palpebre di nuovo a mezz'asta. |
| `drum` | Tamburo di pancia | 2.6 | Preparazione: .00–.20 alza le due mani (ik, fino all'altezza della sacca) e si tira indietro; la luce si raduna tutta nella pancia, che si accende forte; .03 palpebre spalancate, creste a V. Colpi: .32 mano sinistra, .52 mano destra, .74 tutte e due (il più forte, la testa va indietro). A ogni colpo la pancia si schiaccia dove batte la mano, fa un lampo di luce e trema in tre ondine che si spengono; schizzi ai piedi; la corona saltella. Con o.p2 quattro colpi: .32 sinistra, .46 destra, .60 sinistra, .76 tutte e due. Ritorno: dall'ultimo colpo fino a .86 la pancia vibra come un gong; .86–1 abbassa la mano sinistra e con la destra indica col dito teso una pozza (o.point, angolo rispetto a dove guarda; senza, avanti a destra), mentre la gemma della corona lampeggia due volte. |
| `rain` | Pioggia di lucciole | 2.4 | Solo fase 2. Preparazione: .00–.30 si tira indietro con la bocca al cielo (lean −0,35), la pancia si accende d'arancio e la perla di luce sale nella gola. Colpi: tre colpi di tosse a .35, .45 e .55: la testa scatta in su, la sacca si strizza e dalla bocca esce un fiotto di lucciole arancio (il modello disegna solo quelle che escono, i primi 40 px; poi le disegna il gioco). Ritorno: .55–.80 le guarda salire con un ghigno, le zannette in vista; .80–1 torna seduto. |
| `rage` | Furia | 3 | Disegna da sola il passaggio alla fase 2 (colori, grandezza, piumino), qualunque sia o.p2; a p 1 è uguale a idle con o.p2 a p 0. .00–.12 indietreggia, palpebre spalancate, la corona scivola storta (fino a 0,35). .15, .25 e .35 batte i pugni a terra (sinistro, destro, tutti e due) con schizzi di fango. .38–.55 apre la bocca e ingoia tre sorsi d'aria con la sacca che pulsa (il gioco ci fa entrare le lucciole della stanza). .45–.62 si gonfia del 12% e il colore cambia dalla pancia verso fuori: le verruche passano dal verde lucciola all'arancio come un'onda, la pelle diventa quella della fase 2, le ghiandole si accendono. .60 occhi spalancati rossi e creste a V, da qui in poi per sempre. .62–.85 il gracidio enorme: sacca r 30 accesa d'arancio, tutto il corpo vibra (6 Hz); le tife si drizzano e a .70 le spighe scoppiano in batuffoli di piumino luminoso, con una nuvoletta di semi che gli resta intorno. .85–1 broncio con le due zannette in vista e fiatone. |
| `taunt` | Presa in giro | 1.2 | Viene dalla fine dell'entrata (la mano sulla pancia, il sorrisetto). .00–.12 si appoggia indietro (lean −0,12). .15 e .35 due pacche sulla pancia con la mano destra: la pancia trema due volte. .40, .55 e .70 ride «gro-gro-gro»: la sacca si gonfia a ogni risata (r 14), occhi chiusi a mezzaluna dal gusto, la corona saltella. .82–1 apre un occhio solo, ti indica col dito sinistro e si passa la punta della lingua sulle labbra («ti mangio»). |
| `enter` | Entrata | 3.4 | Il modello fa da solo la caduta (il gioco tiene e.z a 0). .00–.26 non si vede: è sopra, fuori dallo schermo. .26–.45 l'ombra compare al centro e cresce. .30–.45 cade dall'alto (z da 360 a 0) a stella e di pancia, con la pancia accesa; a .32 la corona gli vola via verso l'alto, fuori schermo. .45 TONFO: si schiaccia larghissimo (sx +0,35, s −0,4), schizzi. .45–.62 trema come una gelatina e si tira su seduto, occhi strizzati. .55–.67 le sette tife scattano su una dopo l'altra (.55, .57, .59, .61, .63, .65, .67). .62–.68 la corona ricade dal cielo e gli si posa in testa, storta, con un luccichio. .66 apre gli occhi: ambra, a mezz'asta. .72–.88 gonfia la sacca al massimo (r 24, accesa) e a .74 lancia il gracidio reale, con tutto il corpo che vibra. .90–1 si sistema col sorrisetto storto e tamburella due dita sulla pancia. |
| `die` | Sconfitta | 4 | Parte dall'aspetto della fase 2 se o.p2. .00–.10 barcolla; la corona gli vola via, gira in aria e cade a terra davanti alla sua sinistra, in [26,−50,0], dove resta fino alla fine. .10–.45 si gonfia tremando (5 Hz) fino a ×1,45: la pelle si tende e si schiarisce, la luce dentro cresce finché è una lanterna e torna dall'arancio al verde-giallo delle lucciole; gli occhi sporgono; le tife saltano via una a una come tappi (.20, .25, .30, .34, .38, .41, .44). .50 CLOU: il rutto enorme, bocca al cielo, una fontana a spirale di lucciole (il modello disegna quelle che escono dalla bocca, il gioco le fa volare per la stanza), lampo verde-giallo. .50–.70 si sgonfia come un pallone fino a ×0,6 con due sbandate (.56 a sinistra, .63 a destra); a .62 la cappa gli scivola giù e resta a terra come un mucchietto di velluto. .70–.85 continua a rimpicciolire, intero, fino a ×0,16: un rospetto qualunque, verde chiaro, senza corona né tife, che sbatte gli occhi e guarda la corona. .85–.93 fa un saltello e si tuffa nel fango (ritagliato al pavimento, con un anellino d'acqua): sparito. .93–1 restano la corona, con una lucciola che le si posa sopra e lampeggia, e il velluto che sfuma. |

## Le abilità nel gioco

PER CHI SCRIVE IL CERVELLO
File: src/js/89-rospo-nuovo.js. Si accende solo se esiste N3.toad2, come il Golem con G2ON. Si prova col modello finto anteprime/boss2/toad_stub.js.

MONTAGGIO
- N3.toad = N3.toad2. Il disegno di oggi resta come N3.meta.toad.old, per le pagine.
- ET.toad.r = 40. Restano come oggi: vita 3.500 × arena, contatto 22, oro 70.
- BOSS_INTRO.toad = 3,4; BDEATH.toad = {dur:4, clou:2, snd:'splash'}; B2H.toad = 100.
- B2T.toad: '200,240,90' nella fase 1 e '255,150,60' nella fase 2.
- RUNEC.rospo resta com'è: da 200,240,90 a 255,190,60.
- Da spegnere:
  - B2.toad.front: moscerini, luccichio della corona, bava, bolle ai piedi, sciame di lucciole 2D;
  - ETELE.toad e toadMouth: gli avvisi nuovi li disegna il cervello.
- Da tenere:
  - B2.toad.back, le increspature d'acqua sotto di lui, col raggio nuovo;
  - una sola ombra: o quella del modello o ESHADOW.toad 52×17, non tutte e due.
- ELIGHT.toad: la luce della pancia è sempre accesa.
  - Fase 1: 210,240,110, raggio 90, forza .45.
  - Fase 2: 255,150,60, raggio 110, forza .6.
  - Nei segnali è più forte.
- Punti del modello, da proiettare come g2pt (×1,12 nella fase 2):
  - bocca [36,0,55]
  - sacca [44,0,42]
  - pancia [40,0,26]
  - gemma [18,−3,80]
  - mani [42,±30,2]
- N3G.opt.toad passa al modello tip, side, chain, point e noFlies, presi dallo stato. N3G.wp.toad viene dall'orologio della camminata, come per il Golem.
- Modello finto (stub), mosse nuove sul rospo di oggi:
  - stuck → idle
  - sweep → tongue
  - drum → bubbles
  - rain → bubbles
  - rage → hit
  - taunt → idle
  - enter → flop
  - die → hit

REGOLE
- Ogni stato ha il nome di una mossa del modello, e il colpo vero parte nel suo fotogramma (b3at).
- Nella fase 2 tutto va 1,25 volte più rapido, come oggi; n3Move disegna già il rospo a 1,25.
- Mai due attacchi insieme. Girini e bolle già lanciati possono restare in giro.
- Ogni danno ha un avviso a terra di almeno 0,6 s, anche alla velocità della fase 2.
- Dopo ogni mossa almeno 1 s di camminata (0,8 s nella fase 2).
- Gli avvisi sono rossi come nel resto del gioco (229,72,77).
- I danni sono quelli prima di DMG(). Nessun danno arriva mentre l'eroe scatta (P.dashT>0) o è invulnerabile (P.inv>0).

CAMMINATA (walk)
- Fase 1: striscia verso di te (navAngle) a 34 px/s; e.face guarda dove va. A ogni mano (p .00 e .50 del ciclo di 1 s): stepFx e scossa 1.
- Fase 2: balzi pesanti, uno per ciclo del modello (0,8 s veri).
  - Si sposta solo tra k .10 e .45, circa 45 px a balzo, con z fino a 16.
  - A .47 atterra: stepFx, scossa 2, anellino d'acqua.
  - La camminata finisce solo quando atterra.
- Durate della camminata:
  - fase 1: 1–1,4 s; dopo il Rutto 1,4–1,8 s; dopo il Tamburo 1,2–1,6 s;
  - fase 2: 0,8–1,1 s; dopo il Rutto 1,1–1,4 s.

ORDINE DELLE MOSSE
- Fase 1: Linguata, Panciata, Rutto, Linguata, Tamburo, Panciata, poi da capo.
- Fase 2: Pioggia, Frustata, Tripla Panciata, Rutto, Linguata, Tamburo, poi da capo. La Pioggia è sempre la prima dopo la Furia e torna ogni sei mosse.

1. LINGUATA (tongue, 1,6 s) e LINGUA INCOLLATA (stuck, 1,1 s)
- Da k .00 a .30 si gira verso di te.
- Da .02 esce dalla bocca una striscia rossa larga 24, tratteggiata, che ti segue girando al massimo di 140° al secondo. È lunga 300 px oppure fino al primo ostacolo o muro: la portata si calcola come g2reach, e gli alberi morti fermano la lingua.
- A .30 la striscia si blocca: diventa piena e lampeggia.
- Avviso totale da .02 a .55: 0,85 s (0,68 s nella fase 2).
- A .55 il COLPO: la lingua corre lungo la striscia in 0,08 s (o.tip va dalla bocca alla fine). Tra .55 e .66 colpisce chi è nella striscia (distanza dalla riga minore di 12 + P.r·0,5): 20 danni.
- Se ti prende:
  - ti tira verso il punto 70 px davanti a lui: P.pull con t .38 e sp 280, segnato come suo;
  - il modello continua tongue da .66 a .90 con o.tip sull'eroe, poi deglutisce;
  - poi la Presa in giro, con b3taunt, così il sistema B3 non ne fa un'altra.
- Lo Strappo: se scatti mentre ti tira, ti stacchi.
  - Si avvolge dash(): se P.pull è del rospo, lo si toglie. La prima volta compare «Strappo!».
  - La lingua schiocca indietro e lui torna a camminare, senza presa in giro.
- Se non ti prende:
  - a .66 passa a stuck, con o.tip fermo sul punto dove si è incollata (a terra, sul muro o su un albero morto);
  - se è un albero morto, l'albero trema (ENV2.rocks su di lui) e perde rametti (G.debris #6b5a48);
  - durante stuck, fino a k .70, i colpi fanno +50%: si avvolge hurtE come per il Golem, e la prima volta compare «Lingua incollata!» (#ffd84a);
  - a .70 la lingua torna indietro come un elastico, poi camminata.
- Come si schiva: un passo di lato dopo il blocco (0,4 s; 0,32 s nella fase 2), uno scatto, oppure un albero morto tra te e lui.

2. FRUSTATA (sweep, 1,6 s, solo fase 2: prende il posto di una Linguata su due)
- o.side vale +1 o −1, a caso.
- Da .02 un ventaglio rosso di 110° e 230 px davanti a lui. È puntato su di te fino a .30, poi si blocca. Si riempie dal lato da cui partirà la lingua verso l'altro, e una freccia sull'arco dice il verso.
- Da .52 a .70 la lingua spazza il ventaglio:
  - l'angolo va da centro+55°·side a centro−55°·side, con partenza e arrivo morbidi;
  - o.tip sta a 230 px sull'angolo del momento;
  - chi è nel ventaglio quando la lingua gli passa sopra prende 18 danni ed è spinto via nel verso della frustata (0,2 s a 220 px/s).
- Avviso da .02 a .52: 0,64 s alla velocità della fase 2.
- Come si schiva: andargli dietro, stare oltre i 230 px, o scattare attraverso la lingua quando passa.
- Arena: le canne nel ventaglio si piegano e perdono le spighe.

3. PANCIATA (flop, 2 s) e TRIPLA PANCIATA (fase 2)
- A .02 un cerchio rosso di raggio 56 compare sotto di te, come il cerchio d'atterraggio del Golem (ombra che cresce e sei tacche). Ti segue fino a 220 px/s fino a .30, poi si blocca.
- Un anello tratteggiato a 240 px (300 nella Panciata Reale) segna fin dove arriva l'onda.
- Le tre lucciole che gli girano intorno volano sul cerchio e ci girano sopra: le disegna il cervello con N3.toadFly, e al modello si passa o.noFlies.
- A .30 salta: va da (sx,sy) al centro del cerchio con smoothstep, con z = 150·sin(πu) fino a .75. Mentre z è sopra 30 non si può colpire.
- A .75 lo SPLAT:
  - 26 danni nel cerchio (distanza minore di 56 + P.r·0,4);
  - un'onda d'acqua: G.waves, max 240, 16 danni, colore '190,235,170';
  - tre chiazze di fango a 40–60 px dal centro: raggio 24, durano 4 s, al massimo 6 insieme; rallentano al 55% come la bava (P.mire), zona di tipo 'slime' disegnata con N3.toadMud;
  - stamp 'puddle', vfxBlast d'acqua e fango, scossa 9, boom e splash, vibrazione.
- Avviso dopo il blocco, da .30 a .75: 0,9 s (0,72 s nella fase 2).
- Tripla Panciata (fase 2): tre flop di fila senza camminata in mezzo; il secondo e il terzo con o.chain. Ogni cerchio ti insegue di nuovo da k .02 a .30.
  - Primi due: solo l'impatto (26 nel cerchio) e due chiazze di fango, scossa 6, niente onda.
  - Terzo, la Panciata Reale: cerchio di raggio 70, 30 danni, onda fino a 300 px (16 danni), tre chiazze, rametti e foglie dall'alto (ENV2.fall 8), scossa 11.
- Arena: le pozze schizzano (G.ripples), le ninfee saltano, gli ostacoli vicini tremano (ENV2.rocks 190), le canne si piegano.

4. RUTTO DI BOLLE (bubbles, 1,8 s)
- A .03 un ventaglio rosso di 100° e 260 px davanti a lui. Segue la sua faccia (lui si gira verso di te al massimo di 90° al secondo) fino a .40, poi si blocca.
- A .60 il RUTTO: dalla bocca escono due file di bolle (shootE di tipo 'fbubble').
  - Ogni bolla: disegnata con N3.toadBubble, raggio 10, 12 danni, dura 5 s, ondeggia di ±4 px, scoppia contro muri, ostacoli e l'eroe.
  - Fase 1: fila A di 5 bolle a −40, −20, 0, 20 e 40° a 70 px/s; fila B di 4 bolle a −30, −10, 10 e 30° a 100 px/s.
  - Fase 2: fila A di 7 bolle (da −60 a 60°, una ogni 20°) a 75 px/s; fila B di 6 bolle (da −50 a 50°) a 105 px/s.
  - Al massimo 13 bolle nella stanza: le più vecchie scoppiano.
- Avviso da .03 a .60: 1 s (0,82 s nella fase 2).
- Come si schiva: chi è vicino esce dal ventaglio; chi è oltre i 150 px passa nei varchi, spostandosi di mezza bolla tra la prima fila e la seconda.
- Arena: le ninfee davanti a lui volano via, le pozze si increspano.
- Alla Furia le bolle in giro scoppiano senza fare danno.

5. TAMBURO DI PANCIA (drum, 2,6 s) e i girini
- A .00 compaiono due cose:
  - un cerchio rosso tratteggiato a 280 px intorno a lui, fin dove arrivano gli anelli;
  - il corridoio: un cuneo chiaro sul pavimento, largo 70° (60° nella fase 2), da lui fino a 280 px, coi bordi tratteggiati.
- Il corridoio non punta mai verso di te: sta a 45–75° dalla tua direzione, dal lato con più pavimento libero (almeno 200 px prima di un muro).
- Colpi: nella fase 1 a .32, .52 e .74; nella fase 2 a .32, .46, .60 e .76.
- A ogni colpo parte dai suoi piedi un anello d'acqua basso:
  - va da raggio 40 a 280 a 190 px/s; l'ultimo è più lento (160 px/s);
  - è spesso ±9 px e fa 14 danni, una volta sola per anello;
  - tutti gli anelli tranne l'ultimo hanno il varco del corridoio; l'ultimo è intero;
  - nella fase 2 il varco gira di 15° a ogni anello, e il pavimento mostra il corridoio piegato.
- Avviso da .00 a .32: 0,83 s (0,67 s nella fase 2).
- Come si schiva: stare nel corridoio per gli anelli col varco; poi scattare attraverso l'ultimo (lo scatto è ancora carico, perché prima non è servito) oppure stare oltre i 280 px.
- Aspetto:
  - anelli: un muretto d'acqua scura (da #1f3324 a #34492e, come le pozze) con la cresta di schiuma #d8f0c8 e un riflesso lime;
  - corridoio: rgba(255,250,210,.16), bordi rgba(255,250,210,.5);
  - con LOWFX, tinta piatta.
- A ogni colpo: scossa 3 (5 all'ultimo), tonfo di pelle tesa, cerchi in tutte le pozze, canne che tremano, torce che saltano a tempo (t.ph), lucciole della stanza che scappano.
- A .86 indica una pozza (o.point verso la pozza scelta).
  - Si scelgono le pozze della stanza (G.puddles con swamp) che stanno ad almeno 120 px da te, prima le più lontane.
  - Ribollono per 0,8 s (bollicine e cerchi), poi da ognuna salta fuori un girino con uno spruzzo: makeE('tadpole', …, .25).
  - I girini sono 3 (4 nella fase 2), al massimo 7 vivi insieme.
  - Se non ci sono pozze adatte, escono dalla sua bocca come oggi.

6. PIOGGIA DI LUCCIOLE (rain, 2,4 s, solo fase 2)
- A .35, .45 e .55 tre colpi di tosse: da ognuno sei lucciole arancio salgono dalla bocca e escono dallo schermo. Sono solo per l'occhio (N3.toadFly).
- Cerchi: sette cerchi rossi di raggio 26.
  - Il primo compare a .35, sotto di te.
  - Poi ne compare uno ogni 0,12 s (tempo vero).
  - Il 2°, il 3° e il 4° stanno intorno al primo, tra 70 e 110 px, a più di 70° l'uno dall'altro, così restano i varchi.
  - Il 5°, il 6° e il 7° compaiono dove sei tu in quel momento: ti inseguono.
- Ogni cerchio:
  - ha 0,9 s di avviso: si riempie, e negli ultimi 0,25 s una scia di luce scende dall'alto (N3.toadFly con o.fall);
  - poi la lucciola cade: 16 danni (distanza minore di 26 + P.r·0,4) e uno scoppio di scintille arancio;
  - per 1 s resta una macchiolina di luce che non fa male.
- Come si schiva: uscire dal mucchio e continuare a muoversi, oppure scattare.
- Arena: lampi arancio sulle pozze, le torce sfrigolano.

7. FURIA (rage, 3 s, a metà vita)
- Quando parte: alla metà della vita, ma solo se non è in aria e non sta colpendo. Quindi non dopo k .30 della Panciata, non tra .55 e .66 della Linguata, non tra .52 e .70 della Frustata.
- All'inizio: lo striscione di oggi «Il Re Rospo si gonfia di rabbia» / «Fase 2» (1,6 s), bossRage con '255,150,60', barra in rabbia. Le bolle scoppiano. Non fa danni.
- A .15, .25 e .35 i pugni a terra: scossa 4, schizzi di fango.
- Da .38 a .55 le lucciole della stanza (G.amb di tipo firefly) volano a spirale nella sua bocca e spariscono; con LOWFX sfumano e basta. Non tornano fino alla sconfitta. La stanza non si scurisce mai: le torce restano accese.
- A .62 le torce diventano arancio per tutta la fase 2 (ENV2.torches con una durata lunga) e parte la voce angry.
- Da .62 a .85 il gracidio: scossa 8, tre anelli di luce senza danno (ring2), vibrazione.
- Dopo: e.p2, tutto 1,25 volte più rapido, e la prima mossa è la Pioggia.

8. PRESA IN GIRO (taunt, 1,2 s), come i boss nuovi (B3)
- Quando ti colpisce la fa subito, se sta camminando; se no appena finisce la mossa. Al massimo una volta ogni 9 s.
- La fa sempre dopo la Linguata che ti prende, dopo averti tirato.
- Mai tra due colpi: dopo la presa in giro, 0,3–0,55 s di camminata.
- Se gli stai lontano e non lo colpisci per 7 s, ti chiama: taunt con la voce laugh2.

9. CONTATTO: 22 danni col raggio 40, come oggi.

10. ENTRATA (bossIntro avvolto per 'toad'; il modello recita enter per tutta la sua durata e fa da solo la caduta, con e.z = 0)
- Da 0 a 0,9 s: le lucciole della stanza girano a spirale sopra il cerchio di rune e le pozze fanno cerchi. A 0,2 s un gracidio lontano dall'alto.
- 0,9 s: un fischio che scende.
- 1,53 s, il TONFO (k .45):
  - scossa 10, vibrazione [80,40,100];
  - cerchi in tutte le pozze, ninfee che saltano, ostacoli che tremano (ENV2.rocks 400), canne piegate;
  - tre anelli d'acqua senza danno, stamp 'puddle';
  - le lucciole scappano verso i muri.
- Da 1,87 a 2,28 s: i sette «boing» delle tife.
- 2,15 s: il «clink» della corona.
- 2,52 s (k .74): il gracidio reale (b3say cry), le torce tremano.
- 3,06 s: due tocchi di dita sulla pancia.
- Finché recita non si colpisce; la telecamera inquadra il boss come per gli altri.

11. SCONFITTA
- snapBoss restituisce live; il corpo lo disegna il modello con N3.toad(c.x, c.y+8, c.face, 'die', p, 1, {p2:c.p2, noFx:LOWFX}). La voce die parte all'inizio.
- p .50, cioè 2 s: arrivano la barra e «sconfitto».
  - Lampo verde-giallo e campanellini.
  - Escono dalla bocca a spirale 40 lucciole (12 con LOWFX). Volano per la stanza e restano: vanno in G.amb come lucciole, e la palude si riaccende.
- p .92: un anellino d'acqua e un «plop» dove si tuffa il rospetto.
- Alla fine la corona resta sul pavimento: la si disegna una volta sola nello strato del pavimento con N3.toadCrown, nel punto del modello [26,−50,0] girato con c.face.
- VINTO.rospo diventa «Il Re Rospo si è sgonfiato. Le lucciole sono libere.» (oggi dice «è scoppiato»).

12. VOCE E PERSONALITÀ (B3VO, volume medio 0,07–0,11 come il Golem)
È un vocione di gola enorme che gracida col trillo della sacca: la voce vibra a 20–25 colpi al secondo. Mai gorgoglio né pernacchia, che sono della Piovra.
- cry (entrata, circa 1,9 s): un respiro, poi un gracidio enorme che va da 62 a 100 Hz e torna a 70, vocali o-a-o, trillo a 22 Hz, sotto la risonanza bassa della sacca.
- angry (Furia): tre gracidi corti che salgono (70, 85, 100 Hz), poi «BRRRAAAK» lungo (da 75 a 120 Hz e giù a 65, trillo a 24 Hz).
- laugh (presa in giro): «gro-gro-gro», tre gracidi che scendono da 92 a 74 Hz, a 0,24 s l'uno dall'altro.
- laugh2 (ti chiama): un «graaak?» annoiato che sale in fondo (da 70 a 95 Hz), poi uno sbadiglio.
- hurt: «gwak!» corto, da 130 a 85 Hz.
- c_tongue: un «hm…» a bocca chiusa; lo schiocco bagnato «thwip» suona al colpo (k .55).
- c_sweep: «hah!»; il «fwip» della frusta suona a .52.
- c_flop: «hnnng… hup!».
- c_burp: la sacca che si gonfia («mmmm»); il «BUUURP» vero suona al suo fotogramma (k .60).
- c_drum: i colpi sono tonfi di pelle tesa (fThump intorno ai 70 Hz) nei loro fotogrammi, con un «hoh!» sull'ultimo.
- c_rain: tre colpi di tosse roca a .35, .45 e .55.
- die: uno sforzo che sale mentre si gonfia; al momento clou il rutto enorme; poi il fischio del pallone che si sgonfia (da 900 a 300 Hz, con soffio), un «cra?» piccolo da rospetto (420 Hz) e il «plop».
- win (se cadi): «gro… ho… ho» lento, con un ruttino in fondo.
- B3CUE.toad = {tongue:'c_tongue', sweep:'c_sweep', flop:'c_flop', bubbles:'c_burp', drum:'c_drum', rain:'c_rain'}.
- Il tintinnio della luce: tre note di vetro che salgono (1,2, 1,6 e 2,4 kHz, morbide, 0,25 s) quando la luce corre dentro di lui. Fa la parte del «tum-tum» del Golem. Si sente a: Linguata .05, Frustata .05, Panciata .05 e .15, Rutto .03, Tamburo .03, Pioggia .03, nel tempo del boss.
- Le voci si preparano nelle stanze della sua arena con B3VO.prep('toad').

13. L'ARENA CHE REAGISCE, IN BREVE
- Panciata: schizzi, pozze, ostacoli che tremano, fango che resta.
- Lingua incollata a un albero: l'albero trema e perde rametti.
- Tamburo: cerchi nelle pozze, canne e torce a tempo.
- Rutto: le ninfee volano via.
- Frustata: le canne si piegano.
- Pioggia: lampi arancio.
- Furia: le lucciole della stanza mangiate, le torce arancio.

14. DA TENERE DEL BOSS DI OGGI
- La stanza «Trono del Re Rospo»: tre pozze con le ninfee, canne, fango, il cerchio di rune 'rospo' e i tre alberi morti del bossLayout.
- I girini (tipo 'tadpole'), come oggi.
- Lo striscione della fase 2, la musica 'rospo' (BM.toad), la barra che si rompe in acqua (BBFX.toad).
- Nome, titolo, vita, oro, esperienza e traguardi.
Fuori dalla sua stanza, da segnalare a chi mette il boss nel gioco (questi file non sono nostri):
- Il prologo (91) disegna N3.toad sul trono a sc .62, con le due lampade degli occhi (pEyes) messe per il rospo di oggi. Col nuovo a sc .46 gli occhi tornano al loro posto (34–35 sopra i piedi, come oggi) e la larghezza resta vicina (57 contro 45).
- Vanno guardate le anteprime delle arene (61).
- La riga della guida (44) va cambiata in: «Boss. Lingua che ti tira a sé (se ti manca resta incollata: colpiscilo!), panciate che fanno onde, rutti di bolle, il tamburo di pancia che chiama i girini; a metà vita si mangia le lucciole e le fa piovere.»

15. BCL
R.toad = {n:'Re Rospo', arena:2, p2:true,
- enter: G.arena=2, G.chapter=ARENAS[2].ch, G.diff=ARENAS[2].diff, G.bossLvl=null, G.room=ROOMS, G.event=null, buildRoom();
- moves: ['tongue','stuck','flop','bubbles','drum'];
- moves2: ['rage','sweep','rain'];
- hz conta: cerchi, strisce, ventagli, anelli, bolle ('fbubble'), fango, pioggia, girini, onde;
- voice: ['cry','laugh','angry','die']}.

16. NUMERI DA TARARE
Si tarano con node tests/boss2diff.js toad: le vite perse devono restare vicine a quelle del Re Rospo di oggi (±15%). Se il nuovo è troppo difficile:
1. prima si mettono meno chiazze di fango;
2. poi la Pioggia scende a 5 cerchi.
Danni: Linguata 20, Frustata 18, Panciata 26 (Reale 30), onda 16, bolle 12, anelli 14, Pioggia 16, contatto 22.

## Voti del direttore artistico

VOTI (severi, con il Golem nuovo come metro: possente, bello, figo, che dia timore; un po' più cupo ma da Classica; abilità migliori e giuste per la palude; fattibile bene con la cassetta 3D)

«tiranno»: 8,4 su 10, vince.
È il più legato alla sua arena, e la storia si vede: si è ingozzato delle lucciole della Palude delle Lucciole. La loro luce gli corre sotto la pelle fino al punto che sta per colpire (lo stesso linguaggio del cuore del Golem, ma con un motivo), e quando lo sconfiggi le libera e la palude si riaccende. Ha la sagoma da boss vero: più largo che alto, con la raggiera di sette tife dietro la testa che si legge da ogni lato come le pietre ritte del Golem, la pancia-lanterna e l'oro di corona e bracciali. Le abilità restano sue (lingua, panciata, bolle, girini) ma diventano più giuste e più belle:
- la Lingua incollata premia chi schiva e fa degli alberi morti dei ripari;
- il Tamburo di pancia è la mossa che fa vedere il personaggio;
- Frustata e Pioggia danno forme nuove alla fase 2.
Si fa bene con la cassetta: ellissoidi, ossa a due pezzi, parti calcolate una volta sola.
Difetti:
- troppe gag che tolgono timore: i capricci da bambino, il dito che rimette su la corona, le pacche soddisfatte;
- la mantellina di lenticchia d'acqua è dello stesso verde della pelle e non si legge;
- troppi ninnoli (conchigliette, perle, spilla, strascico d'alghe): costano e da piccoli fanno solo rumore;
- nella fase 2 la pelle oliva ha la stessa tinta del pavimento (#4c4b35);
- due onde a 0,4 s una dall'altra non si schivano con uno scatto che si ricarica in 2,2 s;
- nel Tamburo della fase 2 il varco si sposta di 15° a ogni colpo: per seguirlo bisogna correre di lato a 145 px/s;
- l'entrata dal fango (prima la corona, poi gli occhi) ripete quelle della Piovra e dell'Idra.

«predatore»: 7,6.
Pregi:
- la faccia più minacciosa delle tre: le palpebre a corno fanno la V come il sopracciglio del Golem, lo sguardo è da boccone, la lingua si lecca le labbra;
- il verde smeraldo si stacca meglio dal pavimento;
- la gola-lanterna funziona da punto debole;
- la voce ha il trillo vero della gola.
Difetti:
- perde il re: è una belva con la corona, e «rospo-bestia» richiama la Bestia che Denis ha tolto;
- l'Agguato nel fango sarebbe la terza immersione della palude, dopo la Piovra e l'Idra;
- troppi sistemi per l'arena 3 (Boccone, Strappo, Rampino, doppia lingua, doppio morso, Gracidio, schizzi coi cerchi): un bambino non li legge e il cervello diventa pesante;
- la bava addosso e il «ti risputa» sono un po' schifosi per la Classica.

«sciamano»: 7,0.
Pregi:
- il personaggio più originale;
- la fase 2 più teatrale: beve le lucciole e diventa una lanterna vivente;
- le uova da rompere sono una scelta vera;
- il varco degli anelli mai dritto verso l'eroe è un'ottima regola.
Difetti:
- la forza viene da un oggetto e non dal corpo: vecchio, ingobbito, quasi immobile, più saggio che possente;
- il bastone sottile sul telefono sparisce, e la lanterna in alto (122, 140 nella Pioggia) lo porta fuori dallo schermo quando è vicino al muro;
- una lanterna di lucciole su un bastone è il pezzo simbolo dello Zombie della lanterna, il modello della Zombie (che si copia solo nella pittura, mai nei pezzi): mescola i due design;
- un boss col bastone magico c'è già (la Strega, e anche i maghi);
- niente zannette e tanti pezzetti: collane, lische, licheni, ciocche.

IL DESIGN FINALE parte dal «tiranno» e diventa «il Tiranno delle Lucciole».
Dal «predatore» prende:
- le creste ossee sopra gli occhi, che fanno la V quando prende la mira;
- la leccata di labbra nel fermo;
- la pelle più fredda e profonda nella fase 2, che non si confonde col pavimento;
- le ghiandole dietro gli occhi che si accendono solo nella fase 2;
- la voce col trillo della gola, senza gorgoglio (il gorgoglio è della Piovra);
- lo Strappo: se scatti mentre la lingua ti tira, ti stacchi.
Dallo «sciamano» prende:
- il varco degli anelli mai dritto verso l'eroe;
- le lucciole che volano a segnare il cerchio dove ricadrà;
- la Furia in cui si mangia le lucciole della stanza (senza mai scurirla), così la sconfitta le libera;
- la camminata più lunga dopo le bolle;
- l'idea dei disegni da esportare per il gioco (la bolla con la lucciola, la lucciola).
Correzioni mie:
- meno gag e più minaccia;
- al posto della lenticchia, una cappa corta di velluto di tifa color cannella col bordo di piumino bianco (l'ermellino del re), che si stacca dalla pelle verde;
- via conchigliette, perle, spilla e strascico;
- una sola onda per Panciata; nella Tripla l'onda la fa solo la terza, la Panciata Reale;
- Tamburo più giusto: il varco sta a 45–75° da te, e nella fase 2 gira di 15° a ogni anello;
- entrata dall'alto: cade di pancia sul cerchio di rune, così mostra subito la sua mossa e non ripete Piovra e Idra;
- sconfitta che finisce con un rospetto qualunque che si tuffa nel fango (erano le lucciole a farlo enorme), lasciando la corona.
La Lingua incollata (+50%) ripete di proposito la regola dei Pugni incastrati del Golem: tra i boss si usa lo stesso linguaggio.
