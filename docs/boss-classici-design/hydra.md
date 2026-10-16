# Idra della Palude: il design finale

(Deciso dal direttore artistico tra tre proposte, 16 ottobre. Tipo nel gioco: `hydra`; modello `sprite/nemici3d/hydra2.js`.)

## Il design

L'IDRA DELLA PALUDE · design «l'Antica della Pozza Nera»: tre teste, una sola mente

Nome, titolo, arena e vita restano: «Idra della Palude», «Tre teste, nessuna pietà», arena 7 Palude Avvelenata, 5.600. Compare anche nell'Abisso e nella sfida del giorno, lì senza la tinta dell'arena.
Il modello è 'hydra2' in sprite/nemici3d/hydra2.js e nel gioco prende il nome 'hydra'. Come golem2.js, il file si porta dentro gli attrezzi che gli servono di boss2.js (ring, ellRows, blob, tube, polys, discP, splitHead, hneck, hhead come base) e la cassetta C3.

IDEA
È il cuore avvelenato della Palude Avvelenata. Un'idra antichissima vive nella Pozza Nera, sommersa fino alle spalle, con due grandi mani palmate aggrappate al bordo della sua acqua. Dall'acqua salgono tre colli lunghissimi e possenti, e su ogni testa c'è un ventaglio d'avorio e viola sulla nuca.
Fa paura perché è calma e perfetta: tre teste e una sola mente. Respirano insieme, ti guardano insieme, sbattono gli occhi nello stesso istante. Sei occhi d'oro fissi su di te, poi la tenaglia si chiude.
Il suo avviso fa come il cuore del Golem: il veleno sale luminoso nel collo della testa che sta per colpire. Va dall'acqua alla gola, la gola si gonfia e la testa colpisce.
A metà vita le gemme verdi sulle fronti si aprono: erano occhi.
Quando cade, per la prima volta le teste vanno fuori tempo; poi la palude guarisce, l'acqua si schiarisce e tornano le lucciole.
Resta della Classica: forme grosse e tonde da giocattolo, contorni INK spessi, colori pieni, occhi con la lucina, due sole zannette per testa, niente sangue, ferite o cuciture.
«Un po' più cupa» vuol dire: acqua nera, ombre profonde al pelo dell'acqua, sopracciglia pesanti a V, sguardo fisso, presenza enorme.
Niente regina, trono o corona: il Re Rospo è già il re della palude con la corona d'oro, e nell'arena 8 c'è la Regina dei Ghiacci.

SILHOUETTE E MISURE
Unità del modello a sc 1: in larghezza e in altezza sono px dello schermo, il pavimento è schiacciato a 0,55 (lo schermo è x, y·0,55 − z). x va avanti, y di lato (y negativo è il lato sinistro dell'Idra, testa s −1; vista da davanti sta a destra sullo schermo), z in alto.
- Da davanti è un tridente su una base larga: tre teste (quella di mezzo più alta e più grande) sopra una gobba bassa, le due mani ai lati sul bordo, tutto dentro un'ellisse d'acqua nera.
- Da lontano: tre strisce chiare (i ventri dei colli), sei occhi d'oro, tre gemme lime, tre ventagli viola.
- Altezza: circa 119 in punta al ventaglio di mezzo, circa 90 quelli di lato. Oggi è 96; l'Arciere 3D è 37, quindi più di tre volte. Fase 2: circa 128.
- Larghezza: 112 di dorso, circa 132 da ventaglio a ventaglio, 148 con l'acqua.
- Di lato: la gobba mezza sommersa, tre colli a punto interrogativo che salgono e si piegano in avanti con le teste davanti al petto, i ventagli che vanno indietro, la mano vicina sul bordo, la punta della coda che affiora dietro.
- Da dietro: la gobba con la cresta di cinque pinne a ventaglio, i dorsi dei colli con le losanghe viola, il retro dei ventagli, la coda arricciata.
- Tre quarti: la testa di mezzo alta davanti, le teste di lato aperte a ventaglio.
- Ogni pezzo è grosso e tondo: niente punte sotto i 3 px, artigli e zanne con la punta arrotondata.

PEZZI NELLA POSA DI RIPOSO
1. ACQUA. Cerchio di raggio 74 a z 0: sullo schermo 148×81, grande come la pozza della stanza (148×80).
   - Colori: centro #142420, mezzo #22362f, bordo #3e5a50, chiaro dietro e scuro davanti.
   - Schiuma #cfe9d8 a collare dove escono colli, polsi e coda.
   - Riflessi morbidi degli occhi (oro) e delle gemme (lime) sotto le teste.
   - Cerchi lenti col respiro, cerchietti dove gocciola il veleno.
   - È anche la sua ombra: niente ombra a parte. Il modello la disegna sempre, anche quando riemerge altrove.
2. GOBBA. Ellissoide con centro [−8, 0, 0] e raggi [42, 56, 36]: davanti arriva a x 34, dietro a −50, ai lati a ±56, in cima a z 36. È tagliata al pelo dell'acqua.
   - Scaglie lisce a tre toni.
   - Due file di losanghe grandi, il «manto»: #2b1f42 al 45%, 12 a elevazione .25 e 8 a .6.
   - Bordo caldo in cima.
3. PINNE DEL DORSO. Cinque ventagli intorno alla schiena, come oggi: azimut 2.04 · 2.64 · 3.14 · 3.64 · 4.24 rad (π è dietro), elevazione .8.
   - Alte 11 · 14 · 18 · 14 · 11.
   - Ognuna ha tre stecche d'avorio con la punta bronzo e la membrana viola, inclinate indietro e in fuori di 25°.
4. GORGIERA. Sul davanti della gobba, sotto le radici dei colli: tre file di placche d'avorio (5, 4, 3), da z 4 a z 22, larghe ±24. È un colletto chiaro; nella fase 2 si vede tutta.
5. COLLI.
   - Radici: s −1 [20, −22, 20], s 0 [24, 0, 24], s +1 [20, 22, 20].
   - Raggio 11 alla radice e 7,5 sotto la testa, mai più sottili, nemmeno stesi.
   - Davanti la striscia delle placche d'avorio, larga il 60% del collo, con righe sottili #7e6a3e al 40% ogni 7. Dietro verde, con una fila di losanghe viola scuro.
   - A riposo salgono e si piegano in avanti a punto interrogativo; la testa ci entra dal basso, dietro la nuca (come hneck di oggi).
6. TESTE.
   - Centro del cranio a riposo: s 0 [24, 0, 92], s ±1 [18, ±50, 70]. Beccheggio −0,12: guardano un poco in giù.
   - Le teste di lato si girano verso l'eroe e gli occhi convergono: yaw = atan(50 / (o.td/0,55)), circa 0,15 rad.
   - Lunghe 32; quella di mezzo è ×1,12 (36).
   - Cranio: centro [−4, 0, 1], raggi [11, 10.5, 9]. Muso: centro [9, 0, −1.5], raggi [12.5, 7.5, 6].
   - Divise alla bocca con splitHead (hz −2,2); la mascella si apre fino a 0,8 rad.
7. VENTAGLI.
   - Stanno sulla nuca: la radice è in direzione [−.75, 0, .66] sul cranio. Le stecche d'avorio stanno nel piano di traverso della testa, aperte intorno all'asse alto.
   - Teste di lato: 3 stecche a −35°, 0°, +35°, lunghe 11 · 15 · 11.
   - Testa di mezzo: 5 stecche a −50°, −25°, 0°, 25°, 50°, lunghe 10 · 14 · 19 · 14 · 10; quella centrale ha la punta piegata indietro di 20°.
   - Tra due stecche c'è la membrana viola, fino a 3/4 della loro lunghezza, con due pieghe più scure.
   - A riposo il ventaglio è socchiuso (apertura 0,6) e inclinato indietro di 35°, così non copre mai gli occhi. Aperto (1) si alza a 15° e si spiega.
8. MANI. Due braccia a due ossa con ik.
   - Spalla sott'acqua a [6, ±42, −14], omero 26, avambraccio 26. Il gomito va in fuori e in alto, al pelo dell'acqua (circa [28, ±56, 0]). La mano sta sul bordo a [52, ±50, 1].
   - Palmo d'avorio, dorso verde, tre dita (due capsule ciascuna, 4 + 3,5) con artigli d'avorio tondi di 3,5 e la membrana viola tra le dita.
   - Fase 2: gomiti alti (spalla a z −4).
9. CODA. La punta esce dietro da [−62, 16, 0] e si arriccia fino a [−72, 24, 14]: tre capsule, raggio da 6 a 3, con una pinnetta viola a ventaglio di 5 raggi.

COLORI (tre toni: base / luce / ombra)
FASE 1, «smeraldo e avorio»:
- Scaglie (gobba, colli, teste, dorso delle mani, coda): #33784a / #66b86e / #173d29. Si stacca dal pavimento dell'arena 7, che con la tinta (hue-rotate 70°, saturate 1,25) è un grigio-verdeazzurro scuro, circa #2f3f3b, e anche da quello oliva senza tinta (#383d32).
- Losanghe: #2b1f42 al 45%.
- Placche (ventri, gorgiera, palmi): #efe0b4 / #fff6d8 / #b39a64, righe #7e6a3e al 40%.
- Avorio (stecche, artigli, zanne): #f1e4c0 / #fffbea / #b8a272, punte bronzo #8a6a38.
- Membrane (ventagli, pinne, alette, coda, tra le dita): #7a40b0 / #b06ad8 (il colore dell'arena) / #3c1a5e.
- Gemme (terzo occhio chiuso): #a8f060, bagliore 150,255,90, lucina bianca, riga della palpebra #2a4a14, bordino #173d29.
- Occhi: #ffc93a, bagliore 255,200,60, fessura #1b1612, lucina bianca.
- Bocca #4a1a2e, lingua #d9709a, zanne #f6ead2.
- Veleno: #9be05a, bagliore 150,230,90. Pozze #6fbf3a, bordo tratteggiato #2f5a1a, bolle #d8ffb0.
- Acqua: #142420 / #22362f / bordo #3e5a50, riflessi 170,255,120 al 25%, schiuma #cfe9d8.
- Bordo illuminato caldo (rim) su ogni pezzo grande, glowTop sulle teste.
FASE 2, «il terzo occhio» (placche e avorio restano uguali, così resta riconoscibile):
- Scaglie #285e3e / #4f9a62 / #10301f, col bordo illuminato viola 199,125,255 al posto di quello caldo.
- Membrane accese #9a52d8 / #e2aaff / #4a2270, bagliore 199,125,255.
- Terzo occhio aperto: bianco #f6eaff, iride #c77dff col cerchio #7a2ec0, fessura #1b1612, lucina, bagliore 199,125,255.
- Occhi delle teste più caldi: #ffb02e (bagliore 255,170,50).
- Veleno viola #c77dff (199,125,255). Pozze #9a52d8 col bordo #3c1a5e e bolle #f0d8ff.
- Acqua #1a1226 / #2c1f3e / bordo #5a3f7e, riflessi viola.
SCONFITTA, acqua limpida: #2f6a5e / #4f9a88 / bordo #8fd0b8.

FACCIA E OCCHI
Ogni testa ha la sua telecamera: cornice u avanti, v di lato, w su, come hhead di oggi.
- Muso lungo e mascella larga dietro. La testa è grande rispetto al collo: è la cosa che si vede.
- Arcate sopracciliari pesanti a V (ombra #173d29, filo di luce #66b86e in cima) che scendono verso il muso: sguardo cattivo. Quando stringe gli occhi scende solo la punta interna.
- Occhi d'oro a fessura con la lucina, sul cranio dove comincia il muso: direzione [.55, ±.6, .55], rx 3,6 (4 la testa di mezzo). Bagliore morbido sul muso.
- Terzo occhio: una gemma a mandorla sulla fronte, davanti al ventaglio. Direzione [.3, 0, .95], 5×3,4 (6×4 la testa di mezzo), con una riga sottile in mezzo: è una palpebra chiusa, ma si capisce solo nella fase 2. Pulsa piano col respiro.
- Narici a taglio in punta al muso.
- La riga della bocca risale dietro in un sorrisetto. Due zannette d'avorio sul labbro di sopra (2,2 a bocca chiusa, 4 aperta) e nient'altro.
- Dentro la bocca #4a1a2e. Lingua biforcuta che guizza fuori di 6–10. In fondo alla gola, quando il veleno è pieno, una luce lime.
- Alette: due piccoli ventagli viola dietro la mascella (3 stecche, lunghi 7), chiusi contro la testa; si aprono quando sibila.
- Gozzo: sotto la mascella una sacca d'avorio che si gonfia (raggio da 4 a 8) e si accende di lime quando arriva il veleno.

IL SEGNALE: IL VELENO CHE SALE (come le vene del Golem)
Prima di ogni colpo di una testa, una luce lime sale lungo la striscia d'avorio del suo collo, dall'acqua alla gola. Quando arriva in cima il gozzo si gonfia e la testa colpisce. Il livello di ogni collo va da 0 a 1 (fin dove è arrivata la luce) e lo decide la mossa.
- Morso: in fretta in tutti e tre i colli, e la gemma lampeggia due volte.
- Salva: un collo dopo l'altro (sinistra, mezzo, destra).
- Soffio: tutti e tre insieme dal basso; tutta l'Idra si accende e si vede da lontano.
- Agguato: la luce scende dalla gola nell'acqua (le teste vanno sotto).
- Giudizio: la luce del collo di mezzo scende nell'acqua e l'acqua si accende.
Nella fase 2 la luce è viola. Con LOWFX è una striscia piatta senza bagliore. Si sente anche: un gorgoglio che sale (glu-glu-glu) mentre la luce sale, come il «tum-tum» del cuore del Golem.

PITTURA (come la lanterna), LOWFX E COSTO
- Tre toni su ogni pezzo. Bordo caldo (rim) su gobba, colli, teste e mani; glowTop sulle teste; shadeLimb su colli, avambracci e coda.
- Segni leggeri: losanghe, righe delle placche, pieghe delle membrane.
- Bagliori morbidi su occhi, gemme e veleno.
- Contorno INK di 2,2–2,8 sui pezzi grandi, 1,5 sui piccoli.
- Più cupo: il basso di ogni pezzo vicino all'acqua è più scuro (ombra profonda al pelo dell'acqua), la luce sta in cima.
- LOWFX: niente bagliori, gocce, schiuma che si muove, nebbia né bolle; l'acqua è piatta con un solo cerchio; la luce del veleno è una striscia piatta.
- Costo: mediana di 1,4 ms al massimo (il Golem fa 1,2).
  - Ventagli e pinne calcolati una volta (Path2D o direzioni in cache).
  - Losanghe e righe in un solo percorso per colore.
  - Anelli dei colli in proporzione alla lunghezza.
  - Anche i disegni esportati devono essere leggeri: le tre teste dell'Agguato possono stare sullo schermo insieme.

ORDINE DI DISEGNO E COLLI LUNGHI
- L'ordine viene dalla posa di riposo (parts + run), mai dalla testa che si muove:
  1. metà di dietro dell'acqua;
  2. coda;
  3. braccio lontano;
  4. gobba con pinne, losanghe e gorgiera;
  5. i tre colli, ognuno con la sua testa come un pezzo solo, ordinati dalla profondità della testa a riposo;
  6. braccio vicino;
  7. metà davanti dell'acqua con la schiuma.
- Collo steso (Morso, Zanne):
  - È una curva cubica (hneck) dalla radice alla nuca, con un anello ogni 10 di lunghezza (almeno 8) e raggio sempre tra 11 e 7,5.
  - Quando la testa deve andare più lontano di 110 dalla radice, la radice scivola sul pelo dell'acqua verso il bersaglio fino al bordo dell'acqua (a 66 dal centro), con un collare di schiuma. Il collo si srotola dall'acqua, non si allunga.
  - Il collo steso resta basso sul pavimento (z 6–12) e si alza solo vicino alla radice e alla testa.
- I bersagli del morso:
  - Li dà il gioco con o.tg, in px dello schermo dal punto in cui il modello è disegnato.
  - Il modello li porta nel suo spazio a z 0 con l'inversa di V(face): gx = dx·c + (dy/0,55)·s, gy = −dx·s + (dy/0,55)·c, con c e s di face. Per esempio, un bersaglio 100 px sotto un'Idra che guarda in giù sta 182 unità avanti.
  - Le teste di lato vanno al bersaglio col segno della loro y (s −1 a quello con gy < 0), così non si incrociano mai.
  - La mano dal lato di un collo steso si sposta in fuori sul bordo (y ±58), così il collo non le passa sotto.

FERMA (idle, 3,2 s, ciclo chiuso)
La posa p 0 è il ritratto per la miniatura dell'arena: tre teste a ventaglio verso di te, bocche chiuse, occhi aperti.
- Respiro: con k = ½ − ½cos(2πp) la gobba si gonfia del 2% e l'acqua sale e scende di 1 insieme a lei, con due cerchi lenti a p .10 e .60.
- Respiro a ventaglio: inspirando le teste di lato salgono di 3 e si aprono in fuori di 3 (yaw +0,05), quella di mezzo sale di 4; espirando si chiudono. Sempre a specchio. Le teste arrivano 0,06 dopo il collo e i ventagli 0,10 dopo: insieme, ma vive e mai robot.
- Lo sguardo sta sempre sull'eroe, tutte insieme. Sbattono gli occhi nello stesso istante a .62 (per 0,07).
- Lingue a onda a .35, .38, .41 (sinistra, mezzo, destra).
- Tra .45 e .55 la testa di mezzo apre appena la bocca (0,18) e in fondo alla gola si vede la luce lime.
- Gli artigli battono sul bordo, impazienti: mano sinistra a .15, .20, .25; destra a .65, .70, .75. Ogni dito si alza di 2,5.
- Una goccia di veleno cade dalle zanne di mezzo a .80 e fa un cerchietto verde sull'acqua a .90 (solo con gli effetti).
- La punta della coda si arriccia piano; le gemme pulsano col respiro (bagliore da .25 a .45).
- Nessun movimento brusco: è la calma che fa paura.
- Fase 2: due respiri per ciclo e i terzi occhi aperti, che sbattono con gli altri.

NUOTA (walk, 1,6 s, ciclo; si sposta davvero solo nella fase 2)
- La gobba scivola avanti, con un beccheggio di ±1 due volte per ciclo e un rollio di ±0,03. Davanti c'è una scia a V; sulle pinne passa un'onda, sfasata di 1,1 rad dall'una all'altra.
- I colli fanno insieme il gesto dei cigni: le teste vanno 4 avanti e 4 indietro una volta per ciclo, sempre puntate sull'eroe.
- Le mani remano a turno. La sinistra da p 0 a .5: avanti fino a [62, −46, 2], poi tira indietro fino a [40, −54, −2]. La destra fa lo stesso da .5.
- La coda ondeggia di ±0,25. L'acqua viaggia con lei.

COLPITA (hit, 0,7 s; serve al foglio, sui boss il gioco non la mostra)
Le tre teste si ritraggono insieme di scatto (8 indietro, 4 su, beccheggio +0,35), con occhi e ventagli chiusi fino a .5. La gobba affonda di 3 e l'acqua schizza.

LE MOSSE (ogni mossa dipende solo da p: preparazione lunga, colpo secco, assestamento)

MORSO A TENAGLIA (bite, 2,0 s): «ta-ta… TAM»
- .00–.40, preparazione:
  - Le tre teste si alzano insieme e si aprono a forbice. Quelle di lato vanno larghe in fuori e indietro (spostamento [−6, ±12, +10], yaw in fuori 0,25, beccheggio +0,3 per guardare giù il bersaglio). Quella di mezzo va indietro e in alto a S ([−10, 0, +12], beccheggio +0,25).
  - Ventagli tutti aperti entro .20, alette aperte, bocche spalancate (0,9 da .15) sulle due zannette.
  - Il veleno sale in fretta nei tre colli (.05–.40). La gemma lampeggia a .12 e a .28: è l'avviso del morso.
  - Le mani stringono il bordo e si spostano in fuori (y ±58).
- .40–.44, carica: le teste di lato si tirano indietro di altri 2 e stringono gli occhi.
- .44–.48, colpo: le teste di lato scattano giù insieme. I colli si srotolano sul pavimento come serpenti fino ai bersagli di lato di o.tg, e le mascelle sbattono sulla pietra a .48 (schiacciamento 1,1 × 0,85 per .02, schegge e polvere).
- .48–.58: restano serrate con due strattoni (.52 e .56). Nella fase 1 tornano a riposo entro .80.
- .54–.62: la testa di mezzo si avvolge più stretta (14 indietro): si vede la carica.
- .62–.64, colpo: la testa di mezzo scatta sul bersaglio di mezzo (o.tg[1]). TCHAK a .64, più grande: tutta l'Idra si sporge (la gobba avanza di 4, inclinazione +0,1) e le mani schiaffeggiano il bordo.
- .64–1: la testa di mezzo resta piantata. Zanne nella pietra, bocca a 0,15, collo teso come un ponte, ventaglio che si chiude fino a 0,3, gemma spenta, occhi stretti.
- Fase 2 (o.p2, con o.tg2 = i due bersagli nuovi): dopo .52 le teste di lato rimbalzano a mezz'aria (z 45, bocche aperte 0,8) e seguono o.tg2 (.62–.88), si caricano (.88–.92) e mordono di nuovo a .95.
- Senza o.tg (per i fogli) i bersagli sono: lati [120, ±60, 0], mezzo [140, 0, 0], nel suo spazio.

ZANNE PIANTATE (stuck, 1,0 s; viene dopo il morso)
- La testa di mezzo resta inchiodata a terra con le zannette nella pietra: collo teso come un ponte, ventaglio chiuso, gemma spenta, occhi stretti.
- Due strattoni, a .25 e .55: il collo tira e la gobba si inclina indietro di 0,08. Anche le due teste libere tirano a vuoto con lei, a tempo e a bocca aperta.
- A .80 si libera di scatto con una pioggia di schegge, scrolla la testa (±0,15 per .10) e torna verso la posa di riposo entro 1.

SALVA DI VELENO (spit, 1,4 s)
- Il veleno sale nel collo di sinistra (.00–.25), di mezzo (.12–.37) e di destra (.24–.49). Il gozzo di ognuno si gonfia negli ultimi .08.
- Quando la luce arriva in gola, la testa si tira indietro a S (spostamento [−8, 0, +8], beccheggio +0,4) e sputa in alto una palla: sinistra a .30, mezzo a .42, destra a .54.
- Dopo ogni sputo: rinculo e una goccia che cola dal mento. Il modello disegna la palla che esce per .08, poi la porta il gioco (con o.noGlob non la disegna affatto).
- Fase 2: le teste di lato si riaccendono (.52–.62 e .60–.70) e sputano ancora, viola, a .66 e .74.
- Da .70 (.82 nella fase 2) a 1: si leccano le labbra tutte e tre insieme (lingua fuori a .80) e si assestano.

SOFFIO VELENOSO (breath, 2,4 s)
- .00–.30: le tre teste si tirano indietro in alto ([−8, 0, +10], beccheggio +0,35). I tre colli si accendono insieme dal basso, gozzi gonfi, ventagli e alette aperti.
- .30–.40: scattano avanti ([+10, 0, −6], beccheggio −0,25) a bocca spalancata.
- .40–.85: escono tre getti di nebbia velenosa. Il modello disegna gli sbuffi alla bocca, il gioco i getti lungo le strisce. Le teste tremano piano (6 Hz, ampiezza 0,8). Nella fase 2 le tre teste girano insieme di o.sweep (in rad).
- .85–1: tossiscono (sbuffi verdi dalle narici a .87 e .92), si scrollano e tornano a posto.

AGGUATO DAL PROFONDO (ambush, 2,8 s)
Il tratto .35–.65 si ripete senza salti finché il gioco vuole.
- .00–.15: le tre teste si alzano insieme e sibilano (bocca 0,6, alette aperte); la luce del veleno scende dalla gola nell'acqua.
- .15–.30: si tuffano nella sua acqua una dopo l'altra (sinistra .17, destra .22, mezzo .27), con tre spruzzi; i ventagli spariscono per ultimi.
- .30–.85:
  - I colli restano come tre archi che entrano ed escono dall'acqua (due gobbe ciascuno, come un serpente di mare) e scorrono piano verso fuori.
  - Tra .35 e .65 le gobbe avanzano esattamente di un passo, così le pose a .35 e a .65 sono uguali.
  - Bolle lungo i colli. Sotto la superficie, intorno alla gobba, brillano piano le tre gemme.
  - Le mani stringono il bordo e la gobba respira più forte.
- .85–1: le teste tornano su dalla sua acqua (mezzo .86, sinistra .89, destra .92), si scrollano le gocce e ti guardano.
Le teste che sbucano dal pavimento le disegna il gioco con N3.hydra2Head.

IL GIUDIZIO DELLA PALUDE (decree, 2,2 s)
- .00–.25: la testa di mezzo si alza dritta e altissima ([−2, 0, +16]), col ventaglio tutto aperto e la gemma accesa. Le teste di lato si abbassano fino all'acqua ai suoi fianchi ([+8, ±6, −40], beccheggio −0,5, ventagli chiusi, occhi su di te): è la posa che si riconosce da lontano. La luce del collo di mezzo scende nell'acqua e l'acqua si accende di lime.
- .30 e .45: le mani si alzano (z 14) e schiaffeggiano l'acqua due volte, con spruzzi e cerchi: la palude risponde.
- .30–.70: la gemma pulsa tre volte, sempre più forte.
- .71: la testa di mezzo fa un cenno secco in giù (beccheggio −0,5 in .03): è il decreto. Le teste di lato si rialzano di scatto (.71–.76).
- .80–1: si assesta, i ventagli tornano socchiusi.

SI TUFFA (dive, 1,2 s)
- .00–.10: le teste si inarcano come cigni.
- Si tuffano una dopo l'altra (sinistra .10, destra .20, mezzo .32), con gli spruzzi.
- .30–.45: le mani lasciano il bordo e scivolano giù.
- .45–.90: la gobba affonda (z da 0 a −50) in un gorgo di schiuma; gli anelli dell'acqua girano.
- .90–1: per ultime spariscono le punte del ventaglio di mezzo, e l'acqua si stringe in un piccolo gorgo (raggio da 74 a 24).

RIEMERGE (rise, 1,0 s)
- p 0: l'acqua è già aperta e ribolle (raggio 74).
- .00, .06, .12: le tre teste escono per prime, basse e larghe come un fiore che si apre (yaw in fuori 0,3), con colonne di spruzzi.
- .20: la gobba sbuca in mezzo con un'onda (z da −40 a +4, poi a 0 entro .35): è il colpo.
- .30 e .38: le mani si posano sul bordo con due schiaffi.
- .60–1: le teste si scrollano l'acqua (±0,12 a 5 Hz, che si spegne) e sibilano insieme guardandoti (bocca 0,5, alette aperte), mentre le gocce ricadono.

SGUARDO DEL TERZO OCCHIO (gaze, 2,0 s, solo nella fase 2)
- .00–.10: le tre teste si avvicinano davanti al corpo (le teste di lato a y ±16, quella di mezzo a [+12, 0, +4]).
- .10–.55: ondeggiano insieme a forma di otto, lente e perfette (y ±10 e z ±5 a frequenza doppia): una sola mente. I terzi occhi si spalancano, le iridi diventano spirali che girano (1,5 giri al secondo) e dai ventagli partono anelli viola.
- .55: lampo degli occhi, un bagliore viola morbido (.55–.60).
- .55–.80: continuano a ondeggiare più piano (ampiezza ×0,6).
- .80–1: si separano e tornano a posto.

APRE IL TERZO OCCHIO (rage, 2,8 s, inizio della fase 2)
- .00–.20: per la prima volta le teste perdono il tempo: si ritraggono ognuna per conto suo e tremano, sfasate (6 Hz).
- .25–.40: tornano insieme e ti guardano.
- .42, .50, .58: i terzi occhi si aprono uno dopo l'altro (sinistra, destra, mezzo): clic, clic, CLIC. La palpebra scivola via in .04 e sotto c'è l'iride viola con la fessura e la lucina.
- .60–.75: si alza dall'acqua sulle mani (gobba +10). Le mani escono dal bordo e sbattono sulla pietra a .72 ([60, ±54, 0], gomiti alti). I ventagli si spiegano del tutto, con le membrane accese.
- .78–.95: ruggito a tre voci (bocche aperte a 1, teste su di +0,3). L'acqua diventa viola-nera: i colori passano a quelli della fase 2 in questo tratto.
- .95–1: posa di riposo della fase 2.

ASPETTO DELLA FASE 2 (o.p2)
- Gobba, radici e spalle 10 più su: la gorgiera è tutta in vista e i gomiti sono alti. Teste 9 più su: la punta di mezzo arriva a circa 128.
- Ventagli sempre aperti e accesi.
- Nove occhi: i tre terzi occhi guardano sempre te.
- Scaglie più cupe col bordo viola; veleno e acqua viola.
- Da ferma respira più svelta.

ENTRATA (enter, 4,2 s; BOSS_INTRO.hydra 4,2, oggi 4,4)
- 0–0,8 s (p 0–.19): si vede solo la sua acqua, che diventa nera e gira piano, con le bolle.
- 0,8 s (p .19): sei occhi d'oro si aprono tutti nello stesso istante sotto l'acqua e guardano l'eroe; sopra di loro tre lucine verdi (le gemme).
- 1,2–2,0 s (p .29–.48): affiorano per primi i tre ventagli, perfettamente insieme, dritti, con l'acqua che cola dalle punte.
- 2,0–2,8 s (p .48–.67): le teste salgono lente sui colli, gocciolanti, senza mai staccare gli occhi dall'eroe. A 2,6 e a 2,75 s (p .62 e .655) le due mani escono e si posano sul bordo con due schiaffi d'acqua.
- 2,8–3,4 s (p .67–.81): il dorso si solleva con un'onda. Le teste si aprono a ventaglio, i ventagli si spiegano viola, le pinne del dorso si alzano.
- 3,4–4,0 s (p .81–.95): ruggito a tre voci in accordo, a bocche aperte.
- 4,0–4,2 s (p .95–1): le tre teste piegano il capo di lato insieme, di scatto, verso l'eroe (rollio 0,3).
Prende il posto dell'entrata di oggi (gli occhi che girano, le teste che escono a scatti).

SCONFITTA (die, 4,0 s; il momento clou per la barra e per «sconfitto» è a 2,4 s, cioè p .6)
- 0–0,5 s (p 0–.125): lampo bianco morbido; le teste si ritraggono e chiudono gli occhi.
- 0,5–1,2 s (p .125–.30): per la prima volta vanno davvero fuori tempo. Ognuna ondeggia per conto suo, stordita, con le stelline da cartone; i ventagli si chiudono e le gemme si spengono una a una.
- 1,2–1,9 s (p .30–.475): le teste di lato si afflosciano e scivolano in acqua una dopo l'altra, con spruzzo e bolle.
- 1,9–2,4 s (p .475–.60): resta la testa di mezzo. Ti guarda un'ultima volta, fa un sibilo lungo e stanco e affonda piano; a 2,4 s va sotto.
- 2,4–3,3 s (p .60–.825): le mani lasciano il bordo e scivolano giù. L'acqua si schiarisce fino al verde-azzurro limpido, e la luce verde lascia l'acqua come lucciole che salgono (6–8, 3 con LOWFX).
- 3,3–4,0 s (p .825–1): l'acqua si calma; sotto la superficie si intravedono le punte del ventaglio di mezzo, poi una bolla, e più niente. L'ultimo fotogramma resta fermo finché la stanza si chiude.
Niente pezzi e niente ferite: si addormenta e la palude guarisce.

PRESA IN GIRO (taunt, 1,1 s)
- .00–.50: le tre teste fanno un balletto perfettamente insieme, come tre coriste. Dondolano a destra, a sinistra, a destra (y ±6, rollio ±0,1).
- .50–.80: le lingue guizzano a onda (sinistra .52, mezzo .58, destra .64).
- .80–1: la testa di mezzo piega il capo (rollio 0,35) con gli occhi socchiusi e il sorrisetto con le due zannette; quelle di lato ridacchiano scuotendosi (z ±1,5 a 7 Hz).
- Con o.call (la chiamata quando le stai lontano): da .75 una mano si alza (z 20) e l'artiglio fa due volte «vieni qui».

VOCE (la fa il cervello; qui per il carattere)
Tre voci che sibilano in accordo, come un coro: la testa di mezzo nel mezzo, le altre una sopra e una sotto. Risata in canone «sss-ha… sss-ha… SSS-HA». Una ninna nanna a bocca chiusa nello Sguardo. Niente «ptù»: è della Piovra.

DISEGNI DA ESPORTARE
Hanno lo stesso aspetto del modello e stanno nello stesso file, come N3.golemSlab.
- N3.hydra2Mouths(face, anim, p, o): per le teste s −1, 0, +1 restituisce {m bocca, f punto del pavimento sotto la bocca, e punto tra gli occhi, g terzo occhio, up se la testa è fuori dall'acqua}. Sono px dello schermo dal punto di disegno, a sc 1; la posa è la stessa del disegno, ma non disegna niente. Al gioco serve per palle, strisce, cono e luci.
- N3.hydra2Head(x, y, face, anim, p, sc, o): la testa che sbuca da una macchia d'acqua nera ('burst', 1,6 s).
  - .00–.20: la macchia si apre (raggio da 0 a 24); sotto la superficie due occhi d'oro guardano in su e sbattono a .12.
  - .20–.56: la macchia aspetta, le bolle si fanno più fitte, l'acqua trema.
  - .56: la testa schizza fuori in verticale con 40 di collo, a bocca spalancata, dentro un velo d'acqua.
  - .60: le fauci si chiudono (CIAC).
  - .60–.875: ondeggia e ti guarda, col ventaglio aperto; sibila e gocciola.
  - .875–1: riaffonda con un «gulp» e la macchia si chiude.
  - Opzioni: o.who (−1, 0, 1; la testa di mezzo è più grande, con 5 stecche) e o.p2.
- N3.hydra2Under(x, y, a, p, sc, o): sotto il pavimento, nel Tuffo. Un'increspatura scura di 30×14 con le tre gemme accese a triangolo e i sei occhi d'oro appena visibili, una scia a V indietro lungo a, bolle. p gira in 0,6 s per l'increspatura; o.p2.
- N3.hydra2Stain(x, y, k, sc, o): l'acqua nera che si apre sul pavimento dove riemerge. k va da 0 a 1, raggio fino a o.r (74 di base); bordo chiaro, le tre gemme che si accendono con k, bolle; o.p2.
- N3.hydra2Glob(x, y, z, r, sc, o): la palla di veleno in volo (r 7 di base). Tre toni, lime o viola, lucina bianca, due gocce di scia (o.vx, o.vy); bagliore solo senza LOWFX.
- N3.hydra2Pool(x, y, r, k, sc, o): la pozza di veleno (r 26 di base; k è la vita da 0 a 1, per entrare e sparire). Liquido acceso col centro più scuro, bordo tratteggiato, bolle che scoppiano, bagliore morbido.
  - o.boil (0–1, nel Giudizio): ribolle forte, la superficie si alza, schizza.
  - o.dry: macchia secca.
  - o.p2.
- N3.hydra2Geyser(x, y, k, r, sc, o): la colonna di veleno. Da .00 a .25 sale fino a 60, da .25 a .70 sta e ribolle con le gocce che cadono, da .70 a 1 ricade in uno schizzo. Lime o viola.

OPZIONI DEL MODELLO E REGISTRAZIONE
- o.p2.
- o.tg: i tre bersagli del morso [dx, dy] in px dello schermo dal punto di disegno (lato s −1, mezzo, lato s +1). Le teste di lato li prendono per il segno di gy.
- o.tg2: i due bersagli del secondo morso dei lati, nella fase 2.
- o.sweep: il giro delle teste nel Soffio, in rad.
- o.td: la distanza dell'eroe in px, per far convergere gli occhi (180 di base).
- o.call: la presa in giro come chiamata.
- o.noGlob: niente palla che esce dalla bocca nella Salva.
- o.noFx: niente effetti della mossa (spruzzi, gocce, schegge, nebbia).
- reg('hydra2', {n: 'Idra della Palude', g: 'boss', sc: 1, an: [le 16 mosse], dur, lab}).
- «Prima e dopo» come golem2.js: N3.meta.hydra2.old col modello di oggi.

COSA EVITARE
- Niente regina, trono, corona di metallo.
- Niente ninfea, gorgo che tira né inchiostro: sono della Piovra.
- I terzi occhi sempre da cartone (iride tonda, lucina, palpebra), mai un taglio nella carne.
- Niente denti oltre le due zannette per testa.
- Colli mai più sottili di 7,5, mai incrociati, mai in un ordine diverso dalla posa di riposo.
- Niente spine sotto i 3 px.

## Le mosse del modello

| id | nome | secondi | descrizione |
|---|---|---|---|
| `idle` | Ferma | 3.2 | Ciclo chiuso; p 0 è il ritratto per la miniatura dell'arena (tre teste a ventaglio verso di te). La gobba e l'acqua respirano, con due cerchi a .10 e .60. Respiro a ventaglio delle teste: si aprono inspirando, a specchio; le teste arrivano .06 dopo il collo, i ventagli .10 dopo. Lo sguardo sta sempre sull'eroe, tutte insieme. Occhi che sbattono insieme a .62. Lingue a onda a .35, .38, .41. Tra .45 e .55 la testa di mezzo socchiude la bocca e si vede la luce lime in gola. Artigli che battono sul bordo: sinistra .15, .20, .25; destra .65, .70, .75. Goccia dalle zanne a .80, cerchietto sull'acqua a .90. Coda che si arriccia, gemme che pulsano. Fase 2: due respiri per ciclo, terzi occhi aperti. |
| `walk` | Nuota | 1.6 | Ciclo. La gobba scivola con la scia a V; un'onda passa sulle pinne, sfasata di 1,1 rad dall'una all'altra. I colli fanno insieme il gesto dei cigni (4 avanti e 4 indietro), le teste puntate sull'eroe. Le mani remano a turno: la sinistra da 0 a .5, la destra da .5 a 1. La coda ondeggia di ±0,25. L'acqua viaggia con lei. |
| `hit` | Colpita | 0.7 | Le tre teste si ritraggono insieme di scatto (8 indietro, 4 su), con occhi e ventagli chiusi fino a .5. La gobba affonda di 3 e l'acqua schizza. Serve solo al foglio. |
| `bite` | Morso a Tenaglia | 2 | Da .00 a .40: forbice. Le teste di lato si aprono larghe e indietro, quella di mezzo va indietro e in alto a S; ventagli aperti; il veleno sale in fretta nei tre colli; la gemma lampeggia a .12 e .28; le mani si spostano in fuori sul bordo. Da .40 a .44 carica. A .48 le teste di lato mordono i bersagli di lato di o.tg, coi colli srotolati sul pavimento; strattoni a .52 e .56. Nella fase 1 tornano a riposo entro .80. Da .54 a .62 la testa di mezzo si avvolge; a .64 morde o.tg[1] (TCHAK, l'Idra si sporge) e resta piantata fino a 1. Fase 2: da .52 le teste di lato restano a mezz'aria, seguono o.tg2 e mordono di nuovo a .95. |
| `stuck` | Zanne piantate | 1 | Viene dopo il morso. La testa di mezzo resta inchiodata, collo teso come un ponte, ventaglio chiuso, gemma spenta, occhi stretti. Strattoni a .25 e .55, con le due teste libere che tirano a tempo. A .80 si libera con una pioggia di schegge, scrolla la testa e torna verso il riposo entro 1. |
| `spit` | Salva di Veleno | 1.4 | Il veleno sale nel collo di sinistra (.00–.25), di mezzo (.12–.37) e di destra (.24–.49), e il gozzo si gonfia. La testa si tira indietro a S e sputa: sinistra .30, mezzo .42, destra .54, col rinculo e una goccia dal mento. La palla si vede uscire per .08; con o.noGlob no. Fase 2: le teste di lato si riaccendono e sputano ancora a .66 e .74, viola. Si leccano le labbra insieme a .80. |
| `breath` | Soffio Velenoso | 2.4 | Da .00 a .30 le teste vanno indietro in alto e i tre colli si accendono insieme dal basso: tutta l'Idra si illumina. Da .30 a .40 scattano avanti a bocca spalancata. Da .40 a .85 i getti: sbuffi di nebbia alle bocche, teste che tremano a 6 Hz; nella fase 2 le teste girano insieme di o.sweep. Da .85 a 1 tossiscono (sbuffi dalle narici a .87 e .92) e si scrollano. |
| `ambush` | Agguato dal Profondo | 2.8 | Il tratto .35–.65 si ripete senza salti. Da .00 a .15 le teste si alzano e sibilano, e la luce scende dalla gola nell'acqua. Da .15 a .30 si tuffano nella sua acqua: sinistra .17, destra .22, mezzo .27. Da .30 a .85 i colli restano come tre archi da serpente di mare che scorrono piano; tra .35 e .65 avanzano esattamente di un passo. Bolle, gemme che brillano sotto la superficie, mani strette al bordo. Da .85 a 1 le teste tornano su (mezzo .86, sinistra .89, destra .92) e si scrollano. |
| `decree` | Il Giudizio della Palude | 2.2 | Da .00 a .25 la testa di mezzo si alza altissima col ventaglio aperto e la gemma accesa; le teste di lato si abbassano fino all'acqua ai suoi fianchi; la luce del collo di mezzo scende nell'acqua e l'acqua si accende di lime. A .30 e .45 le mani schiaffeggiano l'acqua. Da .30 a .70 la gemma pulsa tre volte, sempre più forte. A .71 cenno secco in giù (il decreto) e le teste di lato si rialzano di scatto. Da .80 a 1 si assesta. |
| `dive` | Si tuffa | 1.2 | Da .00 a .10 le teste si inarcano come cigni. Si tuffano: sinistra .10, destra .20, mezzo .32. Da .30 a .45 le mani lasciano il bordo. Da .45 a .90 la gobba affonda (z fino a −50) in un gorgo di schiuma. Da .90 a 1 spariscono le punte del ventaglio di mezzo e l'acqua si stringe in un gorgo (raggio da 74 a 24). |
| `rise` | Riemerge | 1 | L'acqua è aperta e ribolle già da p 0. Le teste escono per prime, basse e larghe come un fiore, a .00, .06, .12. A .20 la gobba sbuca con un'onda: è il colpo. A .30 e .38 due schiaffi delle mani sul bordo. Da .60 a 1 le teste si scrollano l'acqua e sibilano insieme, guardandoti. |
| `gaze` | Sguardo del Terzo Occhio (fase 2) | 2 | Da .00 a .10 le tre teste si avvicinano davanti al corpo. Da .10 a .55 ondeggiano insieme a forma di otto; i terzi occhi spalancati diventano spirali che girano (1,5 giri al secondo) e dai ventagli partono anelli viola. A .55 il lampo viola degli occhi. Da .55 a .80 ondeggiano più piano; da .80 a 1 tornano a posto. |
| `rage` | Apre il terzo occhio (fase 2) | 2.8 | Da .00 a .20 le teste perdono il tempo per la prima volta e tremano ognuna per conto suo. Da .25 a .40 tornano insieme e ti guardano. A .42, .50 e .58 i terzi occhi si aprono (clic, clic, CLIC). Da .60 a .75 si alza sulle mani (gobba +10), che sbattono sulla pietra a .72; i ventagli si spiegano accesi. Da .78 a .95 ruggito a tre voci, e i colori passano al viola della fase 2. Da .95 a 1 posa della fase 2. |
| `taunt` | Presa in giro | 1.1 | Da .00 a .50 balletto perfettamente insieme, come tre coriste: destra, sinistra, destra. Da .50 a .80 lingue a onda (.52, .58, .64). Da .80 a 1 la testa di mezzo piega il capo, occhi socchiusi e sorrisetto con le zannette; quelle di lato ridacchiano. Con o.call da .75 una mano si alza e l'artiglio fa due volte «vieni qui». |
| `enter` | Entrata | 4.2 | Da 0 a .19 c'è solo la sua acqua nera che gira, con le bolle. A .19 sei occhi d'oro si aprono insieme sotto l'acqua, con le tre gemme sopra. Da .29 a .48 affiorano i tre ventagli, insieme. Da .48 a .67 le teste salgono gocciolanti; a .62 e .655 le mani si posano sul bordo con due schiaffi. Da .67 a .81 il dorso si solleva con un'onda e i ventagli e le pinne si spiegano. Da .81 a .95 ruggito a tre voci. Da .95 a 1 le teste piegano il capo di lato insieme, di scatto. |
| `die` | Sconfitta | 4 | Da 0 a .125 lampo morbido, occhi chiusi. Da .125 a .30 le teste vanno fuori tempo, stordite, con le stelline; le gemme si spengono. Da .30 a .475 le teste di lato si afflosciano in acqua. Da .475 a .60 la testa di mezzo ti guarda, sibila e affonda: a .60 è il clou. Da .60 a .825 le mani scivolano via, l'acqua si schiarisce e salgono le lucciole (6–8, 3 con LOWFX). Da .825 a 1 l'acqua si calma: le punte del ventaglio sott'acqua, una bolla. L'ultimo fotogramma resta fermo. |

## Le abilità nel gioco

CERVELLO: src/js/89-idra-nuova.js

BASE
- Si accende solo se c'è N3.hydra2, come il Golem.
- Il modello nuovo prende il posto di N3.hydra; il disegno di oggi resta come N3.meta.hydra.old.
- EUPD.hydra è nuovo. Ogni stato ha il nome di una mossa del modello e il colpo vero parte nel suo fotogramma (b3at).
- Tempo del cervello: dt × 1,15 nella fase 2, oltre a bossLvl().spd, che nell'arena 7 vale già 1,22–1,25.
- n3Move va avvolto per l'Idra, perché il modello vada allo stesso passo del cervello (nel gioco l'Idra non è tra i boss più veloci nella fase 2):
  - per le sue mosse restituisce [e.st, min(.999, b3k(e))];
  - per l'Agguato la p che decide il cervello (il giro .35–.65);
  - nell'entrata ['enter', iT/4,2].
- Non alzare la fase 2 sopra 1,15 senza allungare le mosse: i tempi qui sotto tengono ogni avviso legato ai fotogrammi sopra 0,6 s veri fino a una velocità totale di 1,45.
- Lo stato di riposo si chiama 'walk', così b3free, la presa in giro e la chiamata di 88 funzionano.
  - Fase 1: non si sposta (e.moving false, il modello fa idle) e guarda l'eroe (e.face = a).
  - Fase 2: nuota verso l'eroe a 45 px/s (navAngle, tempo del boss) fino a 130 px, sempre a 84 px dai muri.
- B3S.add('hydra'). Lo stato 'taunt' lo gestisce il cervello come il Golem: tick, guarda l'eroe, poi 'walk' per 0,6–1 s.
- I danni sono prima di DMG(). Non fanno danno a chi sta scattando o è invulnerabile (P.dashT > 0 o P.inv > 0).
- Gli avvisi sono rossi (229,72,77) come quelli del Golem: dischi che si riempiono con l'ombra che cresce, bordo che lampeggia.

NUMERI FISSI
- ET.hydra: r 34 (oggi 30), hp 5.600 come oggi, cdmg 24.
- BOSS_INTRO.hydra 4,2.
- BDEATH.hydra = {dur 4, clou 2,4, snd 'bubble'}.
- B2H.hydra = 100.
- B2T.hydra = [['110,220,120','199,125,255'],'200,255,150'].
- RUNEC.idra = ['150,255,90','199,125,255'].
- BBFX.hydra = {c:'#33784a', f:'#e2aaff', k:'burst', s:'bubble'}.
- All'inizio l'Idra sta al centro della pozza della stanza: e.x = G.swampPool.x, e.y = G.swampPool.y − 8. Così la sua acqua (148×81) copre la pozza (148×80) senza un doppio bordo.

CONVERSIONE E BOCCHE
- o.tg e o.tg2 sono in px dello schermo dal punto di disegno (e.x, e.y+8); il modello li converte da sé.
- Le bocche vere vengono da N3.hydra2Mouths(e.f3, mossa, p, {p2}), più (e.x, e.y+8). Le palle partono da m (la bocca); le strisce e il cono da f (il pavimento sotto la bocca).
- N3G.opt.hydra = e => ({tg, tg2, sweep, td: distanza dall'eroe, call, noGlob: true}).

SCELTA E ORDINE
- A = Morso se l'eroe è entro 165 px dal centro dell'Idra, altrimenti Salva.
- Fase 1: A, Soffio, Agguato, Giudizio, A, Tuffo, poi da capo. Pausa tra le mosse di 1,0–1,3 s in 'walk'.
- Fase 2, dopo la Furia: Sguardo, A, Salva, Soffio, Agguato, Giudizio, Tuffo, poi da capo. Pausa di 0,7–0,9 s nuotando.
- Lo Sguardo è sempre seguito da A e non viene mai due volte di fila, né subito dopo il Giudizio o l'Agguato (l'ordine lo garantisce).
- Se a terra ci sono meno di 2 pozze sue, il Giudizio diventa una Salva.
- Tempi: secondi del modello a velocità 1; tra parentesi i secondi veri nell'arena 7, nella fase 1 (÷1,25) e nella fase 2 (÷1,44).

1. MORSO A TENAGLIA (bite 2,0 s, poi stuck 1,0 s)
- A p 0 fissa la direzione (e.lf) e mette tre dischi rossi:
  - quello di mezzo (r 32) dove sei;
  - quelli di lato (r 28) a ±56 px, di traverso rispetto alla linea dall'Idra a te; al massimo a 190 px dall'Idra e dentro la stanza.
- Tempi: i lati si riempiono fino a p .48 (0,96 s; 0,77 / 0,67), il mezzo fino a p .64 (1,28 s; 1,02 / 0,89).
- Danni: a p .48, 16 a chi è in un disco di lato (r + P.r·0,4); a p .64, 22 a chi è nel disco di mezzo.
- Fase 2: a p .50 mette due dischi di lato nuovi (r 28) a ±56 px dalla posizione dell'eroe in quel momento (questi sono o.tg2), pieni a p .95 (0,9 s; 0,63 s veri): 16.
- Dopo, 'stuck' per 1 s: non attacca e ogni colpo fa +50% (la prima volta nella partita compare «Colpo alla testa!», come «Colpo al cuore!» del Golem).
- Come si schiva: un passo avanti o indietro (di lato si finisce tra i denti) o lo scatto. Per il secondo morso della fase 2 basta non spostarsi di lato.
- Arena: crepe dove battono le mascelle (stamp 'cracks'); al morso di mezzo ENV2.rocks(x, y, 120, 1) e qualche goccia dai muri (ENV2.fall(B3N(4))).

2. SALVA DI VELENO (spit 1,4 s)
- Palle a pallonetto dalle bocche vere a p .30 (sinistra), .42 (mezzo), .54 (destra). Nella fase 2 anche a .66 (sinistra) e .74 (destra), viola.
- Bersagli, nell'ordine:
  - dove sei;
  - dove stai andando (posizione + P.vxs/P.vys × 0,5 s);
  - 40 px di lato, a caso;
  - nella fase 2: dove vai più 40 px dall'altro lato;
  - di nuovo dove sei.
- Volo di 0,9 s veri, arco alto 100. Disegno in aria: N3.hydra2Glob.
- Avviso: un disco rosso r 26 che si riempie per tutto il volo, con l'ombra che cresce.
- All'arrivo: 13 nel disco, e resta una pozza r 26 (5 s; 6 s nella fase 2).
- Come si schiva: si esce dai dischi.

3. SOFFIO VELENOSO (breath 2,4 s)
- A p .02 fissa la direzione e mette tre strisce rosse a righe larghe 26, una dal punto f sotto ogni bocca: quella di mezzo verso di te, le altre a ±25°.
- Sono lunghe fino a 380 px e si fermano al primo ostacolo (totem, massi, muri, come g2reach). Da p .30 diventano piene e lampeggiano.
- Da p .40 a .85, i getti: la nebbia corre lungo la striscia a 700 px/s partendo dalla bocca. Fa 18 una volta sola a chi è dentro (distanza dall'asse < 13 + P.r·0,5) dietro il fronte della nebbia.
- Avviso: 0,91 s (0,73 / 0,63).
- Come si schiva: tra due strisce, dietro un totem (i due totem in basso sono il riparo), oppure, se sei vicino a lei, uscendo dal ventaglio di lato.
- Fase 2: da p .30 compaiono le frecce sulle strisce; da .40 a .85 strisce e teste (o.sweep) girano insieme di 14° verso il lato dove ti muovi (a caso se sei fermo). Sono al massimo circa 100 px/s a 300 px: sempre meno dell'eroe.
- Arena: macchie tossiche lungo le strisce (ENV2.mark('toxic') ogni 60 px), erba e canne appassite (wiltGrass), torce che tremano lime per 1 s.

4. AGGUATO DAL PROFONDO (ambush 2,8 s)
- Il modello va da p 0 a .35 (le teste vanno sotto da p .30). Poi il cervello tiene la p nel giro .35–.65 finché i tre sbuchi non sono finiti, e infine la porta da .65 a 1.
- Tre sbuchi, nell'ordine sinistra, destra, mezzo: il primo a p .30, gli altri ogni 0,8 s veri (0,45 s nella fase 2).
- Ogni sbuco:
  1. Una macchia nera (r 24) con due occhi d'oro compare sotto di te e ti segue per 0,3 s (0,25 s nella fase 2), a 160 px/s al massimo, poi si ferma.
  2. Un disco rosso (r 28; r 34 per la testa di mezzo) si riempie per 0,6 s.
  3. La testa schizza fuori: N3.hydra2Head con o.who; il cervello passa la p in modo che lo scatto cada a p .56.
  4. Danno: 18 (22 la testa di mezzo).
  5. La testa resta su 0,5 s guardandoti, riaffonda in 0,2 s e lascia una pozza r 26 (5 s; 6 s nella fase 2).
- Le macchie non stanno mai su un ostacolo né fuori dalla stanza (si spostano sul punto libero più vicino), e mai due a meno di 40 px.
- Le teste si disegnano coi pericoli in aria (drawHazards2Air) oppure, se si può, in ordine di y con l'eroe.
- Intanto il corpo resta nella sua acqua coi colli ad arco e si colpisce normalmente: è il momento di tirargli addosso.
- Come si schiva: continuare a muoversi, oppure lo scatto.
- Arena: a ogni sbuco crepe e uno spruzzo (ENV2.splash). Finché le teste sono sotto, tutte le pozze della stanza si increspano (G.ripples su G.puddles).

5. IL GIUDIZIO DELLA PALUDE (decree 2,2 s; solo con almeno 2 pozze sue a terra)
- A p .30, il primo schiaffo:
  - tutte le sue pozze ribollono (o.boil);
  - compaiono 5 punti nuovi che ribollono (r 24), in cerchio a 80 px dalla tua posizione di quel momento. Si saltano quelli fuori dalla stanza o a meno di 20 px da un ostacolo; in tutto al massimo 11 punti;
  - ogni punto ha il bordo rosso che lampeggia.
- A p .71, il cenno (0,9 s; 0,72 / 0,63): tutti diventano geyser (N3.hydra2Geyser).
  - Danno: 16 a chi ci sta dentro (r + P.r·0,4) nei primi 0,35 s, una volta per geyser.
  - Le pozze scoppiate si consumano e resta una macchia secca.
- Fase 2: un secondo cerchio di 7 punti a 140 px, segnato insieme al primo, scoppia 0,55 s veri dopo.
- Il centro è sicuro: chi resta fermo dentro la corona si salva. Chi sta su una pozza deve uscirne e restare dentro il cerchio.
- È il contrario dell'Agguato: lì ci si muove, qui si sta fermi.
- Arena: le pozze della stanza ribollono e sputano (solo da vedere) e cadono gocce verdi dai muri.

6. TUFFO E RIEMERSIONE (dive 1,2 s, sotto il pavimento, rise 1,0 s)
- Da p .50 del tuffo e.hidden = true: non si colpisce.
- Da p 1: e.alpha = 0 (il modello non si disegna più) e le luci (N3.hydra2Under) viaggiano sotto il pavimento dal posto vecchio al nuovo in 1,0 s veri.
- Il posto nuovo:
  - tra 140 e 240 px da te, a 84 px dai muri, a 60 px dagli ostacoli, mai davanti alla porta;
  - 20 tentativi; se nessuno va bene, il più lontano da te tra quelli buoni.
- A 0,6 s dalla partenza delle luci si apre la macchia (N3.hydra2Stain), con l'avviso: un disco rosso r 60 con le sei tacche (come l'orologio del Golem) e un anello tratteggiato fin dove arriva l'onda (r 200), per 0,9 s veri.
- Poi:
  1. e.x/e.y passano al posto nuovo, e.alpha = 1, e.hidden false, e parte 'rise'.
  2. A p .20: 24 nel disco (60 + P.r·0,4) e un'onda da 14 (G.waves fino a 200 px; si salta con lo scatto).
  3. Nella fase 2 anche 16 gocce viola a raggiera (shootE a 135 px/s, 10 di danno; un tipo nuovo disegnato con N3.hydra2Glob piccolo).
- Arena: tutte le pozze della stanza si increspano, i totem tremano (ENV2.rocks(x, y, 140, 1)), spruzzo grande (ENV2.splash 22).

7. SGUARDO DEL TERZO OCCHIO (gaze 2,0 s; solo nella fase 2)
- A p .05 fissa la direzione (e.lf). Il cono parte dal punto f sotto la bocca di mezzo: apertura 44°, lunghezza 300 px.
- Disegno: bordo rosso tratteggiato, dentro anelli viola che vengono verso di te; dietro ogni ostacolo nel cono una zona scura (l'ombra).
- Al lampo, a p .55 (1,0 s; 0,69 s veri), resti incantato per 1,3 s se:
  - sei nel cono;
  - la linea dalla bocca a te non tocca un ostacolo;
  - non stai scattando (P.dashT ≤ 0).
- Incantato vuol dire lento come nel fango (il cervello tiene acceso P.mire), con spirali viola sopra la testa. Lo scatto rompe subito l'incanto.
- Non fa danno; dopo viene sempre A.
- Come si evita: uscendo di lato dal cono, dietro un totem, oppure scattando al lampo.

8. FURIA (rage 2,8 s)
- Parte a metà vita, ma mai durante Tuffo, Agguato o Sguardo: aspetta che finiscano.
- Non attacca e toglie di mezzo i proiettili (G.eproj), le palle in volo, gli avvisi, le strisce e le macchie. Le pozze restano e diventano viola.
- Subito:
  - fascia «L'Idra apre il terzo occhio!» · «Fase 2»;
  - bossRage(e, '199,125,255');
  - barra rossa;
  - b3say('angry').
- A p .42, .50 e .58: un clic. A .72: scossa 8 e crepe sotto le mani (stamp 'cracks' ai punti delle mani). A .78: tre anelli d'urto.
- Torce viola per il resto dello scontro: ENV2.torches(['#9a52d8','#e2aaff','#fff4ff'], '199,125,255', 999).
- Poi lo Sguardo.

ALTRO
- Contatto col corpo: 24, come oggi.
- bossExtra (l'anello di sfere rosa delle arene 5–8): per l'Idra parte solo in 'walk' e mai entro 1 s da un suo avviso. Fuori da 'walk' il suo tempo aspetta (va avvolto bossExtra), così non si somma alle mosse.

PERICOLI (G.hy, come G.g2 del Golem)
- Si azzerano in buildRoom; si aggiornano col dt vero in update; si disegnano avvolgendo drawHazards2Ground e drawHazards2Air.
- Contiene: warn (dischi, strisce, cono, anello), globs, pools, boils e geysers, stains e heads, under, lanes, cone.
- Pozze:
  - x, y, r 26, vita 5 s (6 s nella fase 2), al massimo 6 (la più vecchia secca);
  - 5 di danno ogni 0,5 s con P.poisonCd, come le zone del gioco, mai mentre scatti;
  - lime nella fase 1, viola nella fase 2;
  - bordo tratteggiato e bolle, così non si confondono con le pozze della stanza.
- I disegni sono quelli del modello (N3.hydra2…), con una riserva semplice se mancano.

LUCI
- ELIGHT.hydra sulle tre bocche (N3.hydra2Mouths, r 50, .55), niente mentre è nascosta.
- Senza LOWFX, anche una luce piccola (r 30, .3) su ogni pozza.

ENTRATA (bossIntro per 'hydra', 4,2 s; il modello fa 'enter' col tempo dell'entrata)
- 0 s: bolle e ronzio (sfx 'creep').
- 0,8 s: gli occhi si aprono ('shimmer').
- 1,3 s: spruzzi dei ventagli.
- 2,6 e 2,75 s: due schiaffi d'acqua (ENV2.splash, scossa 2).
- 2,8 s: il dorso si solleva; scossa 7, spruzzo grande, vfxBlast verde.
- 3,4 s: b3say('cry') (o il ruggito), scossa 6, tre anelli d'acqua.
- 4,0 s: un clic.
- e.em resta a .999 fino a 2,8 s, così l'alone aspetta.
- Alla fine 'walk' per 0,9 s, ed e.si = −1.

SCONFITTA
- snapBoss → {live:1}. BDIE.hydra fa recitare al modello 'die' (4 s):
  - setup: b3say('die'), sfx 'bubble';
  - tick: le bolle; da 2,4 s le pozze sue seccano in scintille e spariscono entro 3,3 s.
- Il corpo resta finché la stanza si chiude (corpseLeft).
- La riga di vittoria resta: «Le lucciole tornano a brillare».

VOCE E PERSONALITÀ (B3VO.VB.hydra, come il Golem)
- Tre voci che sibilano in accordo: la stessa frase a f, f·1,19 e f·0,84, con un soffio sopra. Volume medio 0,07–0,11.
- Le battute:
  - cry: un sibilo-ruggito in accordo minore che si gonfia, con le bolle sotto.
  - angry: l'accordo che stona, tre clic, il ruggito.
  - laugh: «sss-ha… sss-ha… SSS-HA» in canone (sinistra, destra, mezzo).
  - laugh2 (la chiamata): un ronzio basso «mm-mm» e un sibilo lungo.
  - hurt: tre «tsk!» corti insieme.
  - c_bite: un respiro secco «hhk», poi «tchak-tchak… TCHAK».
  - c_spit: un gorgoglio che sale «glglgl», poi «pff-pff-pff» (niente «ptù», è della Piovra).
  - c_breath: un lungo respiro a tre voci.
  - c_ambush: un «blub» profondo e tre sibili che scendono, con le bolle.
  - c_decree: un accordo basso e solenne, coi due schiaffi.
  - c_dive: un gorgoglio che va sotto.
  - c_gaze: una ninna nanna a bocca chiusa, a tre voci, che ondeggia (un carillon stonato, l'eco della musica del menu).
  - die: un accordo che scende e affoga in una bolla.
  - win: una risatina sibilante, tutte e tre all'unisono.
- B3CUE.hydra = {bite:'c_bite', spit:'c_spit', breath:'c_breath', ambush:'c_ambush', decree:'c_decree', dive:'c_dive', gaze:'c_gaze'}.
- Mentre il veleno sale nel collo, si sente il gorgoglio che sale (come il «tum-tum» del Golem), col tempo del boss.
- La presa in giro e la chiamata sono la mossa 'taunt'; per la chiamata si passa o.call.
- Le voci si preparano nelle stanze della sua arena (B3VO.prep('hydra')).

DA SPEGNERE DEL BOSS DI OGGI (il modello fa tutto)
- EUPD.hydra e i morsi a caso di e.heads: non crearlo più.
- ETELE.hydra.
- ELIGHT.hydra di oggi (hydraHead).
- B2.hydra.back, front, pre e post: i bagliori, le creste 2D (righe 204–205 di 51-boss2-mondi.js), le gocce e gli occhi sott'acqua (hyEyes).
- L'entrata di 55-idra-entrata.js (bossIntro3 per hydra).
- BDIE.hydra di oggi.
- Il sibilo di 57 legato a h._q.
- Il caso 'hydra' di b2react.
- Non usare e.sink.
- Le bolle dell'aura (51, riga 52) restano.

DA TENERE
- La stanza «Pozza dell'Idra»: la pozza nel terzo alto, canne, ossa, fango, il cerchio di rune 'idra'.
- I due totem in basso: sono i ripari.
- Nome, titolo, la musica del boss, la riga di vittoria, la vita 5.600.
- Nessun servitore: oggi non ne ha e non ne servono.

BCL
R.hydra = {
- n: "L'Idra della Palude", arena: 6, p2: true;
- enter() come il Golem, con l'arena 6;
- moves: ['bite','stuck','spit','breath','ambush','decree','dive','rise'];
- moves2: ['rage','gaze'];
- hz(): conta avvisi, palle, pozze, geyser, macchie e teste, strisce, cono, onde, gocce;
- voice: ['cry','laugh','angry','die']
}.

MISURE
- node tests/boss2diff.js hydra contro l'Idra di oggi (morso 20, sputo 13 più l'acido, uscita 22 più onda 14, soffio 18; da fermo circa 10 vite al minuto nel caso peggiore): la nuova non deve fare di più.
- Da fermo è la pozza che fa più male: se serve, vita della pozza 4 s o danno 4.
- La stanza col boss va disegnata in 3,5 ms al massimo.

MODELLO FINTO (anteprime/boss2/hydra_stub.js)
- Il modello di oggi (N3.hydra) con le mosse nuove:
  - bite → bite; stuck → bite a p .55; spit → spit; breath → breath;
  - ambush → dive da .14 a .42, poi fermo; decree → breath da 0 a .3;
  - dive → dive da 0 a .42; rise → dive da .6 a 1;
  - gaze → idle; rage → hit; taunt → idle;
  - enter → dive da .6 a 1; die → dive da 0 a .42.
- N3.hydra2Mouths approssimato con le teste di oggi ([14, ∓44, 68] e [18, 0, 86]); le altre esportazioni con disegni semplici.

## Voti del direttore artistico

VOTI (severi; il metro è il Golem approvato: sagoma che si legge da lontano, un segnale di luce che avvisa i colpi, timore senza horror, anticipo lungo e colpo secco, fase 2 che cambia aspetto e abilità, fattibile bene con la cassetta C3).

«regina» · 8,4/10 · VINCE ed è la base.
Pro:
- La sagoma più forte: un tridente su una base larga. Da lontano si leggono tre strisce chiare (i ventri dei colli), sei occhi d'oro, tre ventagli viola e due mani sul bordo.
- Il segnale più chiaro. Il veleno sale luminoso sulla striscia d'avorio del collo della testa che sta per colpire: è grande, continuo e si legge anche in piccolo. È il cuore del Golem rifatto per un'idra.
- La paura giusta per la Classica: è calma e perfetta, tre teste e una sola mente che ti fissano e sbattono gli occhi insieme.
- Abilità legate tra loro e alla sua arena. Le pozze della Salva diventano i geyser del Giudizio, e la Palude Avvelenata è proprio l'arena delle pozze di veleno che ribollono. I due totem fanno da riparo.
- Fase 2 che cambia davvero: le gemme erano occhi, si alza dall'acqua, arriva lo Sguardo.
- Entrata e sconfitta con un'idea sola: sempre insieme, poi per la prima volta fuori tempo.
- Voce a coro con la ninna nanna ipnotica.
- Scheda completa e costruibile.
Contro:
- La regalità («Regina», trono, corone) si scontra col Re Rospo, il re della palude con la corona d'oro (arena 3), e con la Regina dei Ghiacci dell'arena subito dopo. Un testo come «La Regina apre gli occhi!» confonderebbe un bambino.
- L'Agguato è lungo e intricato: teste che escono da tre pozze e sputano da tre parti, poi la macchia, e intanto il corpo resta nascosto per circa 4 s.
- Colli fino a 230 px. Col pavimento schiacciato a 0,55 sono 420 unità di collo.
- Il secondo morso della fase 2 ha 0,65 s di avviso, che diventano meno di 0,5 s veri: nell'arena 7 i boss vanno già a 1,22–1,25 (bossLvl().spd).

«abisso» · 7,8/10.
Pro:
- La personalità più simpatica: il Capo, Zanna e Veleno, e il Litigio che ti guadagni schivando bene.
- Le luci lungo i colli.
- Gli occhi che nuotano sotto il pavimento nel Tuffo: vedi dove uscirà.
- L'Agguato da sotto, col corpo che resta lì e si può colpire.
- La sconfitta con le lucciole, che chiude sulla riga di vittoria che il gioco ha già («Le lucciole tornano a brillare»).
Contro:
- Il bisticcio da cartone toglie timore proprio dove Denis lo chiede.
- Tre teste diverse e il nodo di tre colli triplicano il lavoro e non si ordinano bene in 3D.
- Otto mosse, più le pozze-portale della fase 2, che la proposta stessa teme confondano.
- «Abisso» è già il nome della modalità senza fine.
- Il suo verde-acqua si stacca poco dal pavimento dell'arena 7, che con la tinta diventa grigio-verdeazzurro.
- Le pozze di veleno, la personalità della sua arena, restano ai margini.

«alghe» · 7,0/10.
Pro:
- L'idea più originale: tronchi che aprono gli occhi.
- Falciata e Deriva sono mosse belle.
- La corteccia che cade e fa da riparo richiama gli spallacci del Golem.
- Ha visto il difetto tecnico vero di oggi: le bocche e i bagliori stanno nei punti del disegno 2D, mentre servono le bocche vere date dal modello.
Contro:
- Smette di essere un'idra: le teste di legno la avvicinano alla Strega delle Radici e agli alberi morti, e dei tronchi con gli occhi fanno più sorridere che paura.
- Troppi pezzi piccoli (alghe, radici, ninfee, funghi, lucciole): su una testa di 30×17 px non si leggono e costano da disegnare.
- Il segnale fatto di lucciole è debole; con LOWFX restano quattro puntini.
- Lucciole e ninfee sono la personalità della Palude delle Lucciole (arena 3), non della Palude Avvelenata.
- I colori non tengono conto della tinta dell'arena 7 (hue-rotate 70°): il pavimento diventa della stessa famiglia del suo verde petrolio.

COSA ENTRA NEL DESIGN FINALE
- Base «regina», ma senza regalità. Il nome del design è «l'Antica della Pozza Nera»: le creste sono ventagli d'osso e non corone, e la fase 2 si chiama «il terzo occhio».
- I colli arrivano fino a 190 px e si srotolano dall'acqua.
- La fase 2 va a 1,15 invece che a 1,25, così ogni avviso resta sopra 0,6 s veri anche nell'arena 7.
- L'Agguato è rifatto.
Dall'«abisso»:
- L'Agguato da sotto il pavimento, col corpo che resta e si può colpire: macchie nere con due occhi d'oro che ti seguono e poi si fermano.
- Nel Tuffo, le luci che nuotano sotto il pavimento e il disco con le sei tacche dove uscirà.
- Le stelline e le lucciole della sconfitta.
- Da ferma, la bocca che si apre appena con la luce verde in fondo alla gola.
Dall'«alghe»:
- Le bocche vere esportate dal modello (N3.hydra2Mouths) per palle, strisce, cono e luci.
- Il bersaglio del morso dato dal gioco e raggiunto esattamente.
- L'occhio che si apre come momento di paura: qui sono i terzi occhi della Furia.
