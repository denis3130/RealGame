# Salamandra di Lava: il design finale

(Deciso dal direttore artistico tra tre proposte, 16 ottobre. Tipo nel gioco: `salamander`; modello `sprite/nemici3d/salamander2.js`.)

## Il design

SALAMANDRA DI LAVA · «la Regina del Vulcano»

Nel gioco nome e titolo restano «Salamandra di Lava» e «Regina delle pendici». Modello 'salamander2' in sprite/nemici3d/salamander2.js. Dopo il sì di Denis prende il posto di 'salamander' e il disegno di oggi resta come N3.meta.salamander.old (pagina «prima e dopo»).

1. IDEA
È una salamandra pezzata enorme, carminio e oro, lunga come quattro eroi e mezzo, che sta dritta come su un trono. Porta tre segni da regina cresciuti sul corpo:
- una corona di cinque punte d'ossidiana incastonata nel cranio;
- una gorgiera di dieci petali di magma intorno al collo, che batte come un cuore di brace;
- lo scettro: una goccia d'ossidiana in punta alla coda lunghissima.
Si muove lenta e solenne, con la testa sempre ferma e puntata su di te come un rettile che ha già scelto la preda; poi colpisce all'improvviso.
Fa timore per tre motivi: è enorme e calma; dal suo sorriso lungo filtra la luce della fornace che ha dentro; quando sparisce sotto il pavimento la vedi arrivare solo dalla corona, che taglia la pietra come la pinna di uno squalo, e da due occhi ambra a filo del pavimento.
È figa perché ogni colpo si legge: il collare si apre come un sole e la sua luce corre nella parte che sta per colpire.
A metà vita cambia pelle: esce incandescente dalla pelle vecchia, con la corona in fiamme, e la pelle vuota resta nella stanza come riparo.
Resta della Classica: forme robuste da giocattolo, colori pieni, occhi grandi con la lucina, due zannette, niente sangue, ferite o cuciture. È «un po' più cupa» di oggi: carminio profondo, ossidiana viola scuro, ombre forti, sguardo da regina cattiva.

2. MISURE
Le misure sono a sc 1: un'unità del modello è un px del gioco. L'Arciere 3D è alto circa 37.
Assi del corpo: x in avanti, y verso la sua sinistra (+) e la sua destra (−), z in alto.
Origine: il punto del gioco (e.x, e.y), sotto il petto tra le zampe davanti. I piedi stanno a z 0 (il gioco disegna i modelli 8 px sotto il punto, come tutti gli N3).
- Lunghezza da distesa: 172. Muso a x +46, punta dello scettro a x −126. La coda, scettro compreso, misura 86 dai fianchi.
- Altezze da ferma: schiena alle spalle 41, cima della testa 64, punta della corona 92, scettro alzato 40.
- Da ritta sulle zampe di dietro (Eruzione, entrata, muta, uscita dal Tuffo): 124 in punta alla corona. Alzata sulle zampe davanti (Sputafuoco): 102.
- Larghezza: 68 ai piedi davanti (±34), 76 col collare aperto.
- Nel gioco: raggio 30 sul punto del gioco (oggi 24); alone e barra (B2H) 92; luce sotto di lei 140.
- Oggi è una lucertolina arancione lunga 106 e alta 30: la nuova è lunga quasi il doppio e alta il triplo. Girata verso l'eroe occupa circa 70 × 130 px di schermo, come il Golem.

3. POSA DI RIPOSO «DA TRONO» (decide l'ordine di disegno)
- Il petto sta alto sulle zampe davanti, tese e aperte coi gomiti in fuori, come un varano in allerta.
- Le zampe di dietro sono accovacciate: il tronco scende dal petto ai fianchi.
- Il collo è corto e arcuato; la testa sta alta, col mento in su di 10°.
- La prima metà della coda (40 di lunghezza dai fianchi) è appoggiata a terra in una curva larga intorno al fianco destro: a 40 di coda sta a y −30.
- L'ultimo terzo della coda si alza a esse e porta lo scettro a z 40 (x −104, y −22).
- Il collare è chiuso, piegato lungo il collo (apertura 0,1).

4. LE QUATTRO DIREZIONI
- Davanti: la testa larga coi due grandi occhi ambra sotto le sopracciglia a V e il sorriso lungo col filo di luce. Sopra, la corona a ventaglio, con la punta centrale più alta. Il collare incornicia il viso (aperto è un sole largo 76). Gola e petto sono d'oro, le zampe larghe coi gomiti in fuori. Dietro sale la coda da un lato, con lo scettro.
- Di lato: un cuneo lungo che sale verso la testa. Si vedono la testa a pala, la corona come un pettine di cinque punte piegate indietro, l'anello luminoso del collare, la fila di placche scure con le fessure accese, il ventre d'oro e la coda a esse che finisce nella goccia scura.
- Dietro: la corona vista da dietro, l'anello del collare, la fila di placche con la riga di luce che viene verso di te, i fianchi a macchie d'oro, la coda che si avvicina e piega di lato con lo scettro.
- Tre quarti: la vista più bella, con testa, corona, collare e coda insieme.
- Piccola sul telefono restano tre segni: la corona (cinque punte scure), il collare (un anello di luce che si apre a sole) e la coda lunghissima con la gemma. In più si legge il contrasto tra la schiena carminio e il ventre d'oro.

5. I PEZZI (nella posa di riposo)

5.1 Spina e corpo
La spina è fatta ad anelli, come la salamandra di oggi (tube, ssurf, sspine, cutRows per i tuffi). È divisa in due pezzi, ognuno col suo posto nell'ordine di disegno:
- TRONCO: collo, petto, ventre, fianchi;
- CODA: dai fianchi alla punta (se serve per l'ordine, radice e punta separate).
Gli anelli (centro x, altezza del centro z, mezza larghezza × mezza altezza):

| Anello | x | z | Misura |
|---|---|---|---|
| collo, alla base della testa | +12 | 46 | 14 × 12 |
| petto | 0 | 23 | 27 × 18 (cima a 41) |
| ventre | −20 | 20 | 25 × 16 |
| fianchi | −40 | 17 | 20 × 14 |
| radice della coda | −50 | 12 | 13 × 11 |
| metà coda (40 di lunghezza) | | | 9 × 9 |
| ultimo terzo della coda | | | 6 × 9 (schiacciato ai lati come un tritone) |
| fine della carne (74 di lunghezza) | | | 3 × 4 |

Il ventre sta 5–8 sopra il pavimento. Per il costo bastano 12–14 anelli, con 12 punti ciascuno.

5.2 Testa
Ha la sua telecamera sul collo e la mascella a cerniera (splitHead). È piatta e larga a pala, come una salamandra gigante:
- lunga 40 (x da +6 a +46), larga 44, alta 24 (z da 40 a 64);
- centro a x +26, z 52;
- grande rispetto al petto (54): una testa da giocattolo.

5.3 Corona
- Una fascia d'ossidiana incastonata sulla nuca (x da +12 a +20, z 60–63).
- Cinque punte sfaccettate in arco, da un lato all'altro della testa (±14), piegate indietro di 20°: la centrale lunga 32 (punta a x +9, z 92), le due vicine 22, le due esterne 14.
- Sei facce per punta, una scheggiata. Su una faccia c'è un riflesso lilla, vicino alla punta un puntino bianco. Dove la fascia tocca la pelle corre una riga di magma.
- Fa parte della testa: gira e si piega con lei. Si stacca solo nella sconfitta, quando il cranio si raffredda.

5.4 Sopracciglia
Due placche d'ossidiana pesanti (12 × 5) sopra gli occhi, che scendono verso il muso a V: lo sguardo accigliato. Quella lontana va dietro il cranio e rientra, mai sopra l'occhio (come il sopracciglio del Golem).

5.5 Occhi
- Grandi: raggi 5,5 × 6,5, in alto sui lati della testa (x +34, y ±14, z 56), sotto le sopracciglia.
- Iride ambra con la pupilla a fessura, la lucina bianca in alto a sinistra e un anello scuro intorno, come il trucco di una regina.
- Nel buio brillano piano, con un alone che respira.
- Palpebre: da ferma sono aperte all'80% (lo sguardo dall'alto in basso), spalancate nei colpi, a metà nella presa in giro.
- Il battito è lento: la palpebra scende a metà, si ferma, poi chiude.

5.6 Bocca
- Una linea lunghissima intorno al muso, che sale agli angoli fin sotto gli occhi: il sorriso di una regina cattiva.
- Due zannette davanti in alto, lunghe 4.
- Chiusa: tra le labbra filtra un filo di luce di magma, come dallo sportello di una fornace.
- Aperta: rosso scuro, col magma che brilla in fondo alla gola e la lingua biforcuta.
- Due narici in punta al muso, da cui escono fili di fumo.

5.7 Collare (la gorgiera di magma, il suo cuore)
- Dieci petali tondi (22 × 12, spessi 3) su un anello di raggio 17 intorno al collo, subito dietro la testa (x +12).
- Sono scuri alla radice e accesi verso il bordo; il retro è carminio scuro.
- Ogni mossa gli dà un valore da 0 a 1:
  - 0: piegato indietro lungo il collo come un ventaglio chiuso (da ferma 0,1, che col respiro sale a 0,25);
  - 1: aperto a sole intorno alla testa, coi petali perpendicolari al collo (diametro 76).
- Due stati in più:
  - «a elmo»: piegato indietro stretto alla nuca (Tuffo);
  - «a cometa»: steso indietro piatto, con le fiamme che ne escono (Anello).
- Freddo: grigio cenere, molle, col vapore.

5.8 Placche della schiena
- Sette cupole d'ossidiana dalle spalle alla radice della coda (x da +4 a −48).
- Lunghe 14, 13, 12, 11, 10, 8, 7; larghe da 12 a 7; alte da 5 a 3.
- Tra una e l'altra corre una fessura di magma di 3 px: è la strada della luce.
- Sulla coda, otto spine d'ossidiana che rimpiccioliscono (da 5 a 2).

5.9 Macchie dei fianchi
Due file di cinque macchie d'oro di magma per lato (da x −2 a −40; raggio 5 la fila alta, 4 la bassa), come una vera salamandra pezzata. Si accendono a onda col respiro.

5.10 Ventre e gola
D'oro brunito a scaglie larghe, con righe orizzontali leggere per le pieghe della gola. D'oro anche il sotto della coda.

5.11 Zampe
Due ossa con la cinematica inversa (ik), gomiti e ginocchia in fuori, ombreggiate con shadeLimb.
- Davanti: radice a (x +2, y ±22, z 22), gomito in fuori a (y ±34, z 18), piede a (x +6, y ±32). Ossa 14 e 14, grosse da 5 a 4.
- Dietro: radice a (x −38, y ±18, z 17), ginocchio in fuori e in su a (y ±32, z 22), piede a (x −30, y ±30). Ossa 14 e 13.
- Piedi: tre dita tonde (raggio 2,8), ognuna con un artiglietto d'ossidiana, e la pianta d'oro. Quando un piede si posa, la pietra sotto si accende un attimo.

5.12 Scettro
In punta alla coda (tra 74 e 86 di lunghezza) una goccia d'ossidiana sfaccettata, lunga 12 e larga 7, col cuore di magma che si vede tra le facce. Prima della Frustata diventa bianca rovente.

5.13 Luce
- Il collare accende sul pavimento intorno a lei una pozza calda (raggio 90) che respira: corona e placche scure si stagliano contro questa luce.
- Dalle fessure salgono fili di fumo e qualche brace (non con LOWFX).

5.14 Niente sangue, ferite né cuciture
La muta è una pelle vuota e liscia, con lo spacco sulla schiena e le palpebre chiuse. La sconfitta è pietra che si raffredda.

6. COLORI
Su ogni pezzo: tre toni con la luce dall'alto a sinistra, contorno INK spesso, bordo caldo (rim) su tutti i pezzi grandi. glowTop e bagliori morbidi solo sul magma e sugli occhi. Segni leggeri: le pieghe della gola e le faccette dell'ossidiana.

FASE 1, «brace che dorme» (più cupa di oggi; ECOL resta #d94a1f)
- Pelle carminio: luce #f2683c, base #cf3a22, ombra #7a1a12.
- Oro brunito (ventre, gola, sotto della coda, piante): luce #ffd27a, base #f0a534, ombra #a8601c.
- Ossidiana (corona, sopracciglia, placche, spine, artigli, scettro): riflesso #8e7fb8, base #43355a, ombra #17111f, puntino #ece6ff. Mai nero piatto.
- Magma (fessure, macchie, filo della bocca, gola): cuore #fff3c4, giallo #ffd05a, arancio #ff8a2a, rosso #e0451c; bagliore '255,140,50'.
- Petali del collare: radice #a8281a, corpo #ff8a2a, bordo #ffd05a, retro #7a1a12.
- Occhi: iride #ffc23a, fessura #1b1612, lucina #ffffff, anello #3a1208, alone '255,190,80'.
- Bocca #5a1206, lingua #c8404a, zannette #fff6e0, fumo '70,58,56', vapore '236,230,224'.

FASE 2, «incandescente» (dopo la muta)
- Pelle nuova: luce #ffd27a, base #ff6a2a, ombra #b02a18. Su schiena e fianchi, sette isole di crosta #4a1a14 col bordo #ff9a3a. La pelle è più rossa della Fenice e del suo fuoco a terra, così non ci si confonde.
- Ventre: luce #fff1c8, base #ffc860, ombra #d8822a.
- Ossidiana come nella fase 1, con un filo di magma #ffb040 su ogni spigolo e una fiammella su ogni punta della corona. La fiammella tremola col tempo del gioco (G.t), mai con la posa; con LOWFX sta ferma.
- Collare sempre aperto, col cuore #fff6d8. Macchie #fff3c4.
- Occhi #fff1a8, con la fessura sottile #3a1206 e l'alone '255,240,180'.

LA MUTA
Luce #7e6a60, base #5a4640, ombra #2e2220. Fessure e macchie partono da #ff6a2a e si spengono fino a #2e2220 in 15 s.

CONTRASTO
Sul pavimento del Nido (#3a2f2b, con le crepe di lava arancio) si staccano la schiena carminio, il ventre d'oro e il collare acceso. L'ossidiana è un viola freddo coi riflessi lilla e il bordo caldo, e sta sempre sopra il carminio o contro la pozza di luce del collare. Gli avvisi usano sempre il rosso del gioco '229,72,77', mai l'arancione.

NEL GIOCO
- RUNEC.magma: ['255,110,40','255,215,120'] (arancio rosso, poi oro bianco).
- B2T.salamander: [['255,140,50','255,215,120'],'255,190,110'].
- BBFX.salamander: {c:'#43355a', f:'#ffb060', k:'rise', s:'ignite'} (schegge d'ossidiana e braci che salgono).

7. IL SEGNALE: IL COLLARE È IL SUO CUORE (come il cuore di runa del Golem)
Il collare respira con lei. Prima di ogni colpo si apre come un sole (più è aperto, più il colpo è vicino) e la sua luce corre lungo le fessure delle placche, con una perla di luce in testa, fino alla parte che colpirà:

| Dove corre la luce | Mossa |
|---|---|
| su per la gola fino alla bocca, che si gonfia e brilla da dentro | Sputafuoco |
| giù per la schiena fino allo scettro, che diventa bianco | Frustata |
| nelle zampe davanti, con gli artigli bianchi, mentre il collare si piega a elmo | Tuffo |
| in tutte le macchie dei fianchi, in tre onde rapide, col collare a cometa | Anello di fuoco |
| dallo scettro alla corona, con ogni fessura accesa | Eruzione |

Dopo l'Anello il collare diventa grigio cenere e sfiata vapore: è il momento di colpirla. Ogni volta che il collare si apre si sente un soffio di mantice («fff»), come il «tum-tum» del Golem.

8. FERMA (idle, 3,2 s, si chiude su sé stessa)
- Respiro lento e largo: dentro da .00 a .50, fuori da .50 a 1.
  - Petto e fianchi si gonfiano del 4%.
  - Il collare sale da 0,1 a 0,25 e si accende in cima al respiro (.40–.55), come la brace quando ci soffi.
  - Le macchie si accendono a onda dal collare alla coda: il fronte dell'onda corre da .05 a .45.
- Fumo: due fili dalle narici a .55–.70.
- Lingua: esce due volte ad assaggiare l'aria (.30–.36 e .40–.46).
- Testa: ferma e puntata (più o.look). Fa due piccoli scatti da rettile di 5°: a sinistra a .22, di nuovo dritta a .72. Ogni scatto dura 0,06 di p, con un'accelerazione morbida; tra uno e l'altro è immobile.
- Occhi: un battito lento a .85 (a metà .85–.88, pausa .88–.91, chiusi .91–.93, aperti .93–.97).
- Coda: la prima metà sta ferma a terra; l'ultimo terzo ondeggia lento come la coda di un gatto che aspetta (un'onda per ciclo). Lo scettro fa un piccolo scatto a .95 ed è tornato a posto a 1.
- Fase 2: due respiri per ciclo, collare sempre aperto che pulsa due volte, più braci, fiammelle della corona.

9. CAMMINA (walk, 1,4 s, due passi)
- Solenne come un varano, alta sulle zampe, a coppie diagonali:
  - davanti sinistra con dietro destra in volo da .00 a .50 (posano a .50);
  - davanti destra con dietro sinistra in volo da .50 a 1 (posano a 1, cioè a .00).
- Il piede si posa pesante, le dita si allargano e sotto la pianta la pietra si accende (il cervello ci lascia l'orma).
- A ogni passo il tronco si piega a esse e le spalle rollano (±0,05).
- La testa resta ferma in aria, livellata e puntata su di te: il collo compensa, più o.look. Il corpo va e la testa resta, come una gallina.
- La coda ondeggia larga, al contrario del tronco, e la punta striscia sul pavimento con le scintille: è lo strascico della regina (il cervello ci lascia la scia di braci).
- Lingua fuori a .25 e a .75. Il collare respira (0,1 → 0,2 → 0,1).

10. LE MOSSE
Ogni mossa ha preparazione, colpo e ritorno. I momenti p indicati sono quelli in cui il cervello fa partire il colpo.

10.1 SPUTAFUOCO (spit, 2,0 s)
- .00–.40, preparazione: si alza sulle zampe davanti (il petto sale di 10, la corona arriva a 102) e il collare si apre da 0 a 1. La luce corre dal collare su per la gola fino alla bocca (.08–.38). Gola e guance si gonfiano e brillano da dentro, il filo della bocca si accende, gli occhi si stringono.
- .42, .58, .74, colpi: tre scatti secchi della testa in avanti e in basso, a fauci spalancate, con un anello di fumo e scintille alla bocca. Per 0,04 di p dopo ogni colpo il modello disegna la palla che esce. Tra uno scatto e l'altro la testa si ritrae e la gola si rigonfia (.46–.56 e .62–.72).
- .78–1, ritorno: si abbassa, il collare si richiude fino a 0,1, due sbuffi di fumo dalle narici (.86 e .93).

10.2 FRUSTATA (whip, 1,7 s)
Il mezzo giro lo fa il modello; il gioco tiene ferma la direzione (quella verso l'eroe a p 0) per tutta la mossa.
- .00–.28: si gira lentamente di spalle (180°): due passi rapidi delle zampe davanti, quelle di dietro fanno perno. Intanto la coda si solleva ad arco come quella di uno scorpione, con la punta sopra i suoi fianchi: mai stesa sopra l'eroe.
- La testa non ti perde: il collo si piega di 60° e la testa gira di altri 60°, così ti guarda da sopra la spalla con un occhio (al massimo 120° in tutto). Il collare si apre da 0 a 0,6.
- .28–.58: la luce corre giù per le fessure fino allo scettro (bianco a .55). La coda sale ancora e la punta vibra (6 volte al secondo). Il collare arriva a 1.
- .60–.68, colpo: in un lampo la coda si abbatte e spazza il pavimento dietro di lei da un fianco all'altro (200°), con una scia di fuoco e scintille. Colpo a .66.
- .68–1: la coda rimbalza e si posa; da .72 si rigira verso di te (180° indietro) con uno sbuffo di fumo, e il collare si richiude.

10.3 FRUSTATA DOPPIA (whip2, 2,8 s, fase 2)
- .00–.25: il giro, con la coda che sale.
- .25–.50: la luce arriva allo scettro (bianco a .48), la coda ad arco.
- .50–.56: spazzata, colpo a .53.
- .56–.83: la coda si rialza dritta dietro di lei e lo scettro si riaccende (bianco a .80).
- .83–.88: lo schiocco. La coda cala dritta all'indietro, in linea, come una frusta. Colpo a .85.
- .88–1: si rigira.

10.4 TUFFO: SI TUFFA (burrow, 0,8 s)
- .00–.22: si alza un poco e piega il collare a elmo. La luce corre nelle zampe davanti, gli artigli diventano bianchi e scavano; sotto il petto la pietra si scioglie in una pozza di magma (raggio fino a 26).
- .22–.80: si tuffa di testa. Il corpo scivola nella pozza lungo una curva, come il tuffo di oggi (sdive, con cutRows a z 0). Le zampe di dietro scalciano e la coda entra per ultima, con un colpetto della punta.
- .80–1: restano fuori solo le cinque punte della corona; la pozza si chiude in una crepa che brilla. A p 1 il disegno è uguale a swim a p 0.

10.5 LA PINNA (swim, 0,6 s, ciclo)
- Sopra il pavimento restano solo le punte della corona (alte 14–26), che tagliano la pietra come la pinna di uno squalo.
- Davanti c'è un'onda di pietra fusa (una cresta di lastre che si alzano e ricadono, con la lava nelle crepe) e le scintille.
- Subito dietro la corona, a filo del pavimento, due occhi ambra a metà palpebra che ti guardano.
- Sotto il pavimento la segue un bagliore rosso con la forma del suo corpo (testa, tronco, coda: 150).
- Ondeggia appena e non ha ombra. Va disegnata piena, mai trasparente: è il suo avviso.

10.6 ESPLODE FUORI (breach, 1,7 s)
- .00–.45: la corona affonda; il pavimento si gonfia e ribolle in una cupola di lastre crepate, con la luce nelle crepe (raggio 40). Lei è ancora sotto.
- .45–.55, colpo: esce dritta da una colonna di lava, ritta sulla coda, alta 124, con mascelle e collare spalancati. Colpo a .48.
- .55–.76: si piega in avanti e ricade sul ventre con un tonfo (.74).
- .76–1: si scrolla la lava di dosso come un cane bagnato (le gocce volano) e si rimette in piedi, nella posa della camminata.

10.7 SALTO DEL DELFINO (leap, 1,9 s, fase 2, al posto di breach)
- .00–.40: il pavimento si gonfia come in breach.
- .40–.48: esplode fuori. Colpo a .43.
- .48–.76: fa un arco in avanti di 120, come un delfino. Il gioco la sposta e le dà l'altezza (o.z, al massimo 70 a .62). La spina segue l'arco; all'inizio la coda sta ancora uscendo dal primo buco.
- .76–.84: ricade di testa nel secondo cerchio e il pavimento si scioglie all'impatto. Colpo a .80.
- .84–1: riemerge a metà e si scrolla.
Se costa troppo, il cervello fa al suo posto un secondo Tuffo corto.

10.8 SI ACQUATTA (crouch, 0,9 s, prepara l'Anello)
- Si abbassa col ventre a terra; gli artigli affondano e diventano bianchi.
- Il collare si stende indietro, piatto, a cometa, con le fiamme che ne escono.
- Le macchie si accendono in tre onde rapide, dalla testa alla coda.
- La coda frusta una volta da una parte all'altra (.30–.70); gli occhi si stringono.
- Finisce bassa, pronta a scattare.

10.9 CORSA (run, 0,45 s, ciclo)
- Bassissima e lunga, a falcate enormi (le zampe quasi spariscono).
- La coda è tesa dietro come una frusta, il collare a cometa butta fiamme, la bocca è socchiusa.
- o.curve piega la spina lungo l'anello e la fa inclinare nella curva (rollio 0,15).
- Serve anche per lo scatto prima della Frustata (con o.curve 0).

10.10 COLLARE FREDDO (pant, 1,4 s)
- Si ferma di colpo. Da .00 a .08 il collare diventa grigio cenere e molle, e il vapore sibila tra le scaglie.
- I fianchi si gonfiano e sgonfiano veloci (quattro volte tra .00 e .75); la bocca è aperta con la lingua fuori, la testa bassa.
- .75–1: il collare si riaccende petalo per petalo, dal centro verso i lati (dieci luci), e lei rialza la testa.

10.11 ERUZIONE (erupt, 2,2 s, fase 2)
- .00–.36: si alza sulle zampe di dietro fino a tutta la sua altezza (124), con la coda piantata dietro come un treppiede e il collare tutto aperto come un sole. La luce sale dallo scettro alla corona e accende ogni fessura. Intanto il cervello le fa bere il suo fuoco dal pavimento: le braci scivolano fino alle sue zampe.
- .36–.48: ruggisce al cielo con la testa all'indietro; le punte della corona divampano.
- .48–.56: ricade sulle zampe davanti con un colpo che scuote la stanza (.52).
- .56–1: resta bassa con le zampe piantate; il collare pulsa a ogni ondata (.56, .70, .84). Poi torna alla posa della camminata.

10.12 LA MUTA (rage, 3,0 s, a metà vita)
- .00–.20: si contorce sibilando; crepe di luce corrono sulla pelle dalla corona alla coda.
- .20–.45: la pelle vecchia si spacca lungo la schiena, dalla testa alla coda, e diventa grigia; lei si inarca.
- .45–.72: scivola fuori in avanti di 30, nuova e incandescente. I colori della fase 2 compaiono sul corpo nuovo, insieme a corona e collare, che sono suoi. La pelle resta lì, vuota, con lo spacco sulla schiena (la disegna N3.salamanderHusk nella posa di riposo, con cool 0).
- .72–.86: si scrolla. La corona si accende punta per punta, con le fiammelle a .74, .77, .80, .83 e .86 (una nota ciascuna). Il collare si apre e da lì resta aperto.
- .86–1: ruggisce verso di te.

10.13 COLPITA (hit, 0,6 s)
Serve per le pagine: nel gioco i boss non la usano.
- Rinculo (hitK): la testa scatta indietro e il collare si rizza (0 → 0,7 → 0).
- Occhi strizzati, bocca aperta che sibila, un lampo bianco che corre nelle fessure.
- La corona oscilla con la testa.

11. ENTRATA (enter, 3,4 s; nessuno può colpirla)
- .00–.15: le crepe di lava del pavimento si accendono e la loro luce scorre verso il centro. Il cerchio di rune prende fuoco. Al centro il pavimento si apre in una pozza di magma che ribolle e fuma (raggio fino a 50).
- .15–.27: dal magma escono, una dopo l'altra, le punte della corona, colanti: la centrale a .15, le due vicine a .19, le due esterne a .23 (tin-tin-tin).
- .29–.41: appena sotto la superficie si aprono due occhi ambra che brillano attraverso la lava. Guardano a sinistra (.32), a destra (.36) e si fermano su di te (.40).
- .41–.51: sale la testa, col magma che cola dalle sopracciglia e dal mento; alza il mento; si vede il filo di luce della bocca.
- .51–.70: esce dalla pozza.
  - Pianta le zampe davanti sul bordo (.51, .55) e il corpo scivola fuori, pesante.
  - Il collare si accende petalo per petalo, da .56 a .68: dieci luci in crescendo.
  - La coda esce per ultima e le si avvolge intorno (.64–.72).
- .72–.86: si alza sulle zampe di dietro (.72–.76), apre il collare come un sole (.76: un'onda di luce su tutta la stanza) e ruggisce verso l'eroe (.77).
- .86–.94: ricade sulle zampe davanti (.88) e la coda frusta il pavimento dietro di lei (.90): uno schiocco, una mezzaluna di scintille e un segno bruciato.
- .94–1: si assesta nella posa della camminata; la pozza si richiude in un cratere bruciato.

12. SCONFITTA: LA CORONA CADE (die, 4,0 s; il momento clou è a .575, cioè 2,3 s)
- .00–.12: colpita, si inarca all'indietro con un lungo sibilo. Il collare si apre e si chiude a tre scatti, come un fuoco che si spegne; gli occhi sono strizzati.
- .12–.42: la luce se ne va dalla coda verso la testa.
  - Prima si spegne lo scettro (.12).
  - Poi fessure e macchie diventano grigie una a una, dalla coda al collo (.15–.40), ognuna con uno sbuffo di vapore.
  - La coda si irrigidisce in pietra nera. Nella fase 2 passa dall'arancio al nero, con più vapore.
- .42–.52: prova ancora ad alzare la testa verso di te e a ruggire, ma le escono solo un anellino di fumo e un colpo di tosse (.48); gli occhi tremolano.
- .52–.575: la fascia della corona si stacca dal cranio che si raffredda, scivola giù (.55), cade, rimbalza e rotola sul pavimento con un tintinnio di vetro (.575).
- .575–.80: la testa si abbassa e gli occhi si spengono piano (.62). Il corpo, ormai d'ossidiana, si crepa lungo le fessure e si affloscia in un mucchio di rocce nere lucide, con qualche brace (.66–.80).
- .80–1: dal mucchio sale un ricciolo di fumo.
  - L'ultima brace si alza come una lucciola (.84), fa un giro sopra la corona (.84–.94) e si infila in una crepa del pavimento, che si accende un istante (.95) e si spegne.
  - Accanto al mucchio resta la corona, con un ultimo luccichio sulla punta centrale (.98).

13. PRESA IN GIRO (taunt, 1,2 s; la stessa mossa serve anche quando ti chiama)
- .00–.25: alza il mento e ti guarda dall'alto in basso lungo il muso, con le palpebre a metà e gli angoli del sorriso in su: la regina annoiata.
- .25–.55: soffia dal naso due anelli di fumo (a .30 e a .45), che vengono verso di te allargandosi e salgono. Nella fase 2 hanno le braci dentro.
- .55–.85: batte due volte la punta della coda sul pavimento (tic a .62, tic a .76), come una regina che tamburella le dita.
- .85–1: torna ferma.

14. OPZIONI DEL MODELLO
- o.p2: fase 2.
- o.look: quanto la testa gira verso l'eroe rispetto al corpo, in radianti, al massimo ±1,2 (camminata e idle).
- o.curve: curvatura della corsa (1/raggio, col segno: positivo verso la sua sinistra).
- o.z: altezza data dal gioco nel salto del delfino.
- o.noFx: niente effetti della mossa.
Con LOWFX:
- niente bagliori, braci, fumo, vapore né scintille;
- collare e macchie a toni pieni, senza sfumature;
- fiammelle della corona ferme;
- una goccia sola al posto di tante.

15. DISEGNI DA ESPORTARE PER IL GIOCO
Hanno lo stesso aspetto del modello, come N3.golemSlab e gli altri del Golem.

N3.salamanderGlob(x, y, z, a, sc, o): la palla di magma in volo.
- x, y il punto, z l'altezza, a la direzione. Il cervello la chiama con z 0 e sc = r/7.
- Raggio 7, cuore che sfuma #fff3c4 → #ffd05a → #ff8a2a.
- Due o tre placchette di crosta d'ossidiana col riflesso lilla, contorno INK 1,6.
- Dietro, una coda di quattro scintille; intorno un bagliore '255,140,50'.
- o.p2: cuore bianco e placchette col filo di magma.

N3.salamanderGeyser(x, y, k, sc, o): il geyser di lava.
- k da −1 a 0, durante l'avviso: il pavimento che ribolle e si crepa dentro il cerchio (raggio 22).
- k da 0 a 1, lungo i suoi 0,6 s:
  - .00–.15: esplode fuori;
  - .15–.60: una colonna alta 50 (raggio 12 alla base, 8 in cima) con la corona di schizzi, una fascia di crosta scura e tre o quattro scaglie d'ossidiana che volano;
  - .60–1: ricade in una goccia (raggio 14).
- o.p2: più chiaro.

N3.salamanderPool(x, y, r, k, o): ogni suo fuoco a terra (strascico, pozze, anello, mezzaluna, gocce).
- k è il raffreddamento, da 0 a 1.
- All'inizio il magma è acceso e bolle (due o tre bolle col tempo G.t; cuore #fff3c4 → #ff8a2a → #e0451c; bagliore).
- Il magma si ritira dal bordo fino al 45% del raggio, mentre intorno cresce una crosta nera #2a1a14 con sottili crepe arancio. A 1 sparisce.
- La forma è un'ellisse irregolare r × 0,55·r; o.seed la varia.

N3.salamanderHusk(x, y, face, sc, o): la muta.
- Nella sua posa di riposo, vuota e grigia, con lo spacco lungo la schiena, le impronte grigie delle placche e le palpebre chiuse e lisce, senza corona né collare.
- o.cool da 0 a 1: fessure e macchie passano dal rosso al nero.
- o.crumble da 0 a 1: si sbriciola in cenere, a pezzi, dalla coda alla testa.
- Si disegna una volta sola in un'immagine per ogni ottavo di cool (come i rockSprite), così non costa a ogni fotogramma.

N3.salamanderPrint(x, y, a, k, o): l'orma di un piede davanti, girata lungo a.
- Cuscinetto e tre dita con la tacca dell'artiglio.
- k da 0 a 1: si accende #ffb02e, si raffredda fino a #2a1c1e, poi sparisce.
- Con LOWFX è piatta.

16. ORDINE DI DISEGNO E COSTO
L'ordine viene dalla posa di riposo (parts + run), mai dalla punta che si muove:
1. zampe lontane;
2. coda (due pezzi);
3. tronco, con macchie e placche;
4. petali del collare, ognuno col suo posto preso dalla posa a collare aperto, con un margine perché non saltino;
5. zampe vicine;
6. testa: mascella, cranio, occhi, sopracciglia;
7. corona, tagliata dove il cranio ne copre la base.
Nella Frustata la coda passa davanti alle zampe: va divisa in pezzi ordinati come le braccia del Golem. Vanno controllate tutte le otto direzioni.

Costo: la mediana deve restare sotto 1,3 ms a fotogramma (oggi 0,6, il Golem 1,2). Per starci:
- le facce della corona e dello scettro e le forme di placche e petali si calcolano una volta sola;
- un solo path per tono (tutte le spine insieme, tutte le macchie insieme);
- pochi anelli sulla spina.

17. RISCHI DA CONTROLLARE SUI FOGLI
- Nella Frustata il collo gira al massimo di 120° in tutto, e la coda si alza mentre lei si gira: non deve mai essere stesa sopra l'eroe.
- La coda lunga e la corona tra i petali vanno guardate nelle otto direzioni.
  - Da davanti la testa grande non deve coprire corona e spalle.
  - Da dietro la coda non deve coprire i fianchi.
- L'ossidiana sul pavimento scuro va provata sul Nido, nella miniatura dell'arena e in piccolo (nel prologo è disegnata a sc 0,56).
- Nella fase 2 non deve somigliare alla Fenice: la pelle resta più rossa (#ff6a2a), l'ossidiana scura, con le isole di crosta.
- Fluidità:
  - i tremolii dipendono da p, in cicli interi e sotto gli 8 Hz;
  - le fiammelle vanno col tempo del gioco G.t;
  - gli scatti della testa hanno l'accelerazione morbida.
- Il salto del delfino è la cosa più difficile: due buchi e il corpo tagliato a terra in due punti. Se costa troppo, il cervello usa il secondo Tuffo.

## Le mosse del modello

| id | nome | secondi | descrizione |
|---|---|---|---|
| `idle` | Ferma | 3.2 | Respiro lento: dentro .00–.50, fuori .50–1. Il collare sale da 0,1 a 0,25 e si accende in cima al respiro (.40–.55); le macchie si accendono a onda dal collare alla coda (.05–.45). Fumo dalle narici a .55–.70, lingua a .30–.36 e .40–.46. Testa ferma e puntata, con due scatti da rettile di 5° (a .22 e a .72, ognuno in 0,06 di p con un'accelerazione morbida). Battito lento a .85–.97. L'ultimo terzo della coda ondeggia come quello di un gatto; lo scettro scatta a .95. Fase 2: due respiri per ciclo, collare aperto che pulsa, fiammelle sulla corona (col tempo G.t). |
| `walk` | Cammina | 1.4 | Due passi a coppie diagonali: davanti sinistra e dietro destra posano a .50, le altre due a .00. Il tronco si piega a esse e le spalle rollano (±0,05). La testa resta ferma e livellata, puntata su di te (o.look). La coda ondeggia larga al contrario del tronco e la punta striscia con le scintille. La pianta si accende quando posa; la lingua esce a .25 e a .75; il collare respira (0,1 → 0,2 → 0,1). |
| `hit` | Colpita | 0.6 | Solo per le pagine. Rinculo (hitK): la testa scatta indietro e il collare si rizza (0 → 0,7 → 0). Occhi strizzati, bocca aperta che sibila, un lampo bianco che corre nelle fessure, la corona che oscilla con la testa. |
| `spit` | Sputafuoco | 2 | Da .00 a .40 si alza sulle zampe davanti (corona a 102) e il collare si apre da 0 a 1; la luce corre su per la gola (.08–.38) e gola e guance brillano da dentro. Colpi a .42, .58 e .74: tre scatti della testa a fauci spalancate, con un anello di fumo e scintille e la palla che esce dalla bocca per 0,04 di p. Tra gli scatti la gola si rigonfia (.46–.56 e .62–.72). Da .78 a 1 si abbassa, il collare torna a 0,1, due sbuffi di fumo a .86 e .93. |
| `whip` | Frustata | 1.7 | Da .00 a .28 il modello fa il mezzo giro di spalle: la direzione del gioco resta ferma. Intanto la coda si alza ad arco come quella di uno scorpione, con la punta sopra i fianchi, mai sopra l'eroe. La testa ti guarda da sopra la spalla (collo 60° più testa 60°, al massimo 120°); il collare va da 0 a 0,6. Da .28 a .58 la luce scende fino allo scettro (bianco a .55) e la punta vibra 6 volte al secondo; collare a 1. Da .60 a .68 spazzata di 200° sul pavimento dietro di lei, con scia di fuoco: colpo a .66. Da .68 la coda rimbalza; da .72 a 1 si rigira e il collare si chiude. |
| `whip2` | Frustata doppia (fase 2) | 2.8 | Da .00 a .25 il giro con la coda che sale; da .25 a .50 lo scettro diventa bianco (a .48). Da .50 a .56 la spazzata: colpo a .53. Da .56 a .83 la coda si rialza dritta dietro di lei e lo scettro torna bianco (a .80). Da .83 a .88 lo schiocco: la coda cala all'indietro in linea, colpo a .85. Da .88 a 1 si rigira. |
| `burrow` | Si tuffa | 0.8 | Da .00 a .22 piega il collare a elmo; gli artigli diventano bianchi e scavano, e la pietra si scioglie in una pozza (raggio 26). Da .22 a .80 si tuffa di testa lungo la curva del tuffo (sdive, cutRows a z 0): le zampe di dietro scalciano, la coda entra per ultima. Da .80 a 1 restano fuori solo le punte della corona e la pozza si chiude in una crepa che brilla: a p 1 il disegno è uguale a swim a p 0. |
| `swim` | La pinna (sotto il pavimento) | 0.6 | Ciclo. Le punte della corona (alte 14–26) tagliano il pavimento come la pinna di uno squalo, con davanti un'onda di pietra fusa (lastre che si alzano e ricadono, la lava nelle crepe) e le scintille. Subito dietro, due occhi ambra a filo del pavimento, a metà palpebra; sotto il pavimento il bagliore rosso del corpo (150). Ondeggia appena, niente ombra, sempre disegnata piena. |
| `breach` | Esplode fuori | 1.7 | Da .00 a .45 il pavimento si gonfia e ribolle in una cupola di lastre crepate (raggio 40): lei è ancora sotto. Da .45 a .55 esce dritta da una colonna di lava, alta 124, con fauci e collare spalancati: colpo a .48. Da .55 a .76 ricade in avanti sul ventre (tonfo a .74). Da .76 a 1 si scrolla come un cane bagnato e torna nella posa della camminata. |
| `leap` | Salto del delfino (fase 2) | 1.9 | Da .00 a .40 il pavimento si gonfia; da .40 a .48 esplode fuori, colpo a .43. Da .48 a .76 fa l'arco del delfino di 120: l'altezza o.z la dà il gioco (70 a .62) e la spina segue l'arco, con la coda che esce ancora dal primo buco. Da .76 a .84 ricade di testa nel secondo cerchio, colpo a .80. Da .84 a 1 riemerge a metà e si scrolla. |
| `crouch` | Si acquatta | 0.9 | Prepara l'Anello di fuoco. Ventre a terra, artigli bianchi che affondano, collare steso a cometa con le fiamme. Le macchie fanno tre onde rapide di luce dalla testa alla coda; la coda frusta una volta da un lato all'altro (.30–.70); occhi stretti. Finisce bassa, pronta a scattare. |
| `run` | Corsa | 0.45 | Ciclo. Bassissima e lunga, a falcate enormi, con la coda tesa dietro come una frusta, il collare a cometa che butta fiamme e la bocca socchiusa. o.curve (1/raggio, col segno) piega la spina lungo l'anello e la inclina nella curva (rollio 0,15). Serve anche per lo scatto prima della Frustata, con o.curve 0. |
| `pant` | Collare freddo | 1.4 | Da .00 a .08 il collare diventa grigio cenere e molle e il vapore sibila tra le scaglie. Fino a .75 i fianchi ansimano quattro volte, con la bocca aperta, la lingua fuori e la testa bassa. Da .75 a 1 il collare si riaccende petalo per petalo, dal centro verso i lati, e lei rialza la testa. |
| `erupt` | Eruzione (fase 2) | 2.2 | Da .00 a .36 si alza fino a 124, con la coda a treppiede e il collare tutto aperto; la luce sale dallo scettro alla corona e accende ogni fessura. Da .36 a .48 ruggisce al cielo e la corona divampa. Da .48 a .56 ricade sulle zampe davanti (colpo a terra a .52, senza danno). Da .56 a 1 resta bassa con le zampe piantate e il collare che pulsa a .56, .70 e .84, poi torna in piedi. |
| `rage` | La muta (fase 2) | 3 | Da .00 a .20 si contorce, con crepe di luce dalla corona alla coda. Da .20 a .45 la pelle si spacca lungo la schiena e diventa grigia. Da .45 a .72 esce in avanti di 30, nuova e incandescente; la muta resta al suo posto (N3.salamanderHusk, cool 0). Da .72 a .86 la corona si accende punta per punta (.74, .77, .80, .83, .86) e il collare si apre e resta aperto. Da .86 a 1 ruggisce verso di te. |
| `taunt` | Presa in giro | 1.2 | Da .00 a .25 alza il mento e ti guarda con le palpebre a metà e il sorriso in su, la regina annoiata. Da .25 a .55 due anelli di fumo (a .30 e .45) che vengono verso l'eroe allargandosi; nella fase 2 hanno le braci dentro. Da .55 a .85 due colpetti della punta della coda sul pavimento (a .62 e .76). Da .85 a 1 torna ferma. |
| `enter` | Entrata | 3.4 | Da .00 a .15 si apre al centro una pozza di magma. Escono le punte della corona a .15, .19 e .23. A .29 si aprono gli occhi nella lava: guardano a sinistra (.32), a destra (.36) e si fermano su di te (.40). Da .41 a .51 sale la testa. Da .51 a .70 esce dalla pozza (zampe sul bordo a .51 e .55, collare petalo per petalo da .56 a .68, coda da .64 a .72). Da .72 a .86 si alza ritta: collare a sole a .76, grido a .77. Ricade a .88 e frusta il pavimento a .90; da .94 a 1 si mette nella posa della camminata. |
| `die` | Sconfitta | 4 | Da .00 a .12 si inarca e il collare si apre e chiude a tre scatti. Da .12 a .42 la luce se ne va dalla coda alla testa: scettro spento a .12, poi fessure grigie a sbuffi di vapore, coda di pietra nera. Da .42 a .52 un colpo di tosse con l'anellino di fumo (.48). Da .52 a .575 la corona si stacca (.55), cade e rotola: è il clou (.575). Da .575 a .80 gli occhi si spengono (.62) e il corpo d'ossidiana si crepa e si affloscia in un mucchio. Da .80 a 1 sale il fumo; l'ultima brace si alza (.84), gira sopra la corona e si infila in una crepa (.95); ultimo luccichio della corona a .98. |

## Le abilità nel gioco

PER IL CERVELLO
File: src/js/89-salamandra-nuova.js. Si prova col modello finto anteprime/boss2/salamander_stub.js.

REGOLE E NUMERI

Accensione
- Il file si accende solo se esiste N3.salamander2. Allora N3.salamander = N3.salamander2, e N3.meta.salamander diventa la meta nuova con .old (il disegno di oggi), come fa 89-golem-nuovo.js.
- Registro BCL.salamander:
  - nome 'Salamandra di Lava', arena 1 (la seconda, «Cuore del Vulcano»), p2 true;
  - enter(): G.arena=1, poi stanza ROOMS e buildRoom();
  - moves: spit, whip, burrow, swim, breach, crouch, run, pant;
  - moves2: rage, erupt, whip2, leap;
  - hz(): conta avvisi, palle 'magma', zone s2, geyser, muta, pinna;
  - voice: cry, laugh, angry, die.
- B3S.add('salamander') e la presa in giro di 88, come per il Golem.

Mosse e tempi
- Ogni stato ha il nome di una mossa del modello, e il colpo parte nel suo fotogramma (b3go, b3tick, b3k, b3at).
- n3Move per la Salamandra:
  - negli stati-mossa restituisce [e.st, b3k(e)] (il tempo del cervello porta già la velocità);
  - 'swim' e 'run' vanno sul loro orologio;
  - 'enter' copre tutta l'entrata.
- Fase 2: tutto 1,25 volte più rapido (dt*=1,25 nel cervello). Si somma a bossLvl().spd, che nell'arena 2 arriva a 1,08: in tutto ×1,35.
- Tutti i tempi qui sotto sono nel tempo del modello. Gli avvisi delle mosse usate nella fase 2 durano almeno 0,81 s di modello, così restano sopra 0,6 s veri.

Valori
- ET.salamander: vita 2.600, contatto 22, oro 50, come oggi; raggio 30. I danni sono prima di DMG().
- Mai due attacchi insieme. Ogni danno ha un avviso a terra.
- Dopo ogni mossa cammina rand(1,1; 1,5) s (fase 2: rand(1,0; 1,3)).

Impostazioni da cambiare
- BOSS_INTRO.salamander = 3,4.
- BDEATH.salamander = {dur:4, clou:2.3, snd:'ignite'}.
- snapBoss → {live:1}: la sconfitta la recita il modello.
- B2H.salamander = 92; B2T, BBFX e RUNEC.magma come nel design.
- Luce: Lt(e.x, e.y−14, 140, .8); sotto terra (60, .6), sulla pinna.
- N3G.zm.salamander = 1 (per o.z nel salto).
- N3G.opt.salamander = e => ({look, curve}):
  - look: l'angolo verso l'eroe meno la direzione, al massimo ±1,2, solo in walk;
  - curve: e.curve || 0.
- N3G.wp.salamander: il passo della camminata preso dal suo orologio (orme e strascico a tempo).

Da spegnere
- B2.salamander.back/front (fiamme, braci e fumo 2D della scia).
- Le fiammelle della fase 2 in 51 (b2emit 'flame' per la Salamandra).
- Il cerchio rosso del 'burrow' in 16-creature.js e l'ombra 2D quando è sotto terra.
- Le reazioni di 52 legate a 'burrow'/'under' (le sostituiscono quelle del cervello).
- BDIE.salamander di oggi (la cenere che si porta via il disegno) e il ramo 'salamander' di bossIntro.

Sotto terra
Non usare e.hidden: il gioco disegnerebbe il modello al 12%. Si usano invece:
- e.shell: niente mira né colpi (canHit);
- e.air: niente danno da contatto.
Così il modello disegna pinna, occhi e bagliore pieni.

Proiettili
- Tipo nuovo 'magma': raggio 7; EPDRAW → N3.salamanderGlob(p.x, p.y, 0, p.a, r/7); TRC '255,140,50'.
- Li fermano le rocce e la muta.

Fuoco a terra
- Tutte le sue zone sono 'fire' col segno z.s2 (serve per il tetto e per l'Eruzione), disegnate da N3.salamanderPool con k = 1 − z.t/z.max.
- Il raggio che fa male si ritira col magma: z.r = r0·(1 − 0,55·k). La crosta nera non fa male.
- Il danno è quello solito del gioco: 4 ogni mezzo secondo, niente durante lo scatto.
- Tetto: 40 zone sue (24 con LOWFX); la più vecchia si spegne per prima.
- Quando una zona finisce resta una piccola bruciatura (ENV2.mark 'scorch').

LE MOSSE

1. CAMMINATA (walk)
- Velocità 50 px/s. Non viene dritta:
  - oltre 170 px si avvicina girandoti un poco intorno (direzione verso di te ±0,4);
  - tra 110 e 170 px ti gira intorno (±1,3);
  - il lato cambia ogni 2–3 s.
- La testa resta su di te (o.look).
- Strascico: ogni 0,3 s una zona di fuoco r 11 alla punta della coda (b3pt(e, −112, 0)), che dura 1,4 s (fase 2: 2,2 s).
- Orme: quando posano le zampe davanti (walk .00 e .50), N3.salamanderPrint sotto i piedi (b3pt(e, 6, ±32)). Si spengono in 1,2 s; sono solo disegno, al massimo 8.
- Frustata fuori turno: se le stai a meno di 110 px per 0,8 s mentre cammina fa la Frustata semplice, poi la sequenza riprende da dove era. Condizioni: almeno 0,5 s dopo l'ultima mossa, al massimo una ogni 5 s.

2. SPUTAFUOCO (spit, 2,0 s)
- A p 0 blocca la mira a0 su di te.
- Avviso: dalla bocca (b3pt(e, 40, 0)) un cono rosso a terra, largo 46° (fase 2: 60°) e lungo 240, che pulsa e si riempie da .00 a .76.
- Colpi dalla bocca (b3pt(e, 44, 0), alti 30) a .42, .58 e .74:
  - primo ventaglio: 5 palle a a0 + (i−2)·0,2 rad;
  - secondo: 4 palle a a0 + (i−1,5)·0,2, negli spazi del primo;
  - terzo: di nuovo 5, come il primo.
- Palle a 165 px/s, 12 di danno.
- Fase 2: 7, 6 e 7 palle a passi di 0,175 rad, 185 px/s.
- Come si schiva: uscendo dal cono di lato. I ventagli restano tutti nel cono e si alternano, quindi non c'è un buco dove stare fermi.
- Avviso: 0,84 s (veri: 0,78 nella fase 1, 0,62 nella fase 2).

3. FRUSTATA (whip, 1,7 s)
- Prima: se sei a più di 170 px, scatta verso di te. È lo stato 'rush', con la mossa 'run' del modello e o.curve 0: 230 px/s per al massimo 0,9 s, si ferma a 90 px, niente fuoco. Se resti a più di 170 px salta la Frustata e passa alla mossa dopo.
- A p 0 blocca a0 (verso di te) e tiene e.face = a0 per tutta la mossa.
- A .16 la mezzaluna rossa, dietro di lei e verso di te: un settore d'anello da 40 a 150 px dal suo punto, largo 200°, centrato su a0. Si riempie nel verso della spazzata, con la freccia.
- A .66:
  - 18 di danno se sei nella mezzaluna (non durante lo scatto);
  - 5 zone di fuoco r 14 lungo l'arco, a 110 px, che durano 1,4 s;
  - spacca le pietre temporanee nella mezzaluna, anche la muta.
- Come si schiva: uscendo oltre 150 px, o scattando attraverso la coda quando arriva.
- Avviso: 0,85 s (veri: 0,79 nella fase 1, 0,63 nella fase 2).

FRUSTATA DOPPIA (whip2, 2,8 s, fase 2, al posto della Frustata nella sequenza)
- Mezzaluna a .14, spazzata a .53 (18 di danno).
- A .54 compare una striscia rossa larga 30, da 20 a 240 px lungo a0: è dove la coda schiocca, dietro di lei, e non si rimira.
- Schiocco a .85: 20 di danno nella striscia, più una fila di zone r 12 ogni 24 px lungo la striscia (1,2 s).
- Come si schiva: prima esci dalla mezzaluna, poi fai un passo di lato.
- Avvisi: 1,09 s e 0,87 s (veri: 0,81 e 0,64).
- Nella fase 2 la Frustata fuori turno resta quella semplice.

4. TUFFO DI LAVA (burrow 0,8 s → swim → breach 1,7 s; nella fase 2 leap 1,9 s al posto di breach)

burrow
- Colpibile fino a .50; da .50 e.shell, da .80 anche e.air.
- A .22 una crepa che brilla dove entra (ENV2.mark 'cracks').

swim
- La pinna ti viene incontro a 130 px/s e gira al massimo di 2,5 rad/s: si schiva anche girandole intorno.
- Dura al massimo 1,4 s (fase 2: 1,1 s), o finché arriva a 40 px da te. e.face è la sua direzione di marcia.
- Dietro resta una crepa che brilla e si spegne in 1,5 s (solo disegno, niente danno).
- Le rocce sotto cui passa tremano (ENV2.rocks, piccolo).
- Non fa danno: avvisa soltanto.

Quando la pinna si ferma
Lì compare il cerchio rosso r 48 con le sei tacche che si riempiono, come quello del Golem, col pavimento che ribolle. Parte breach.

breach
- e.shell ed e.air fino a .45.
- A .48:
  - 22 di danno nel cerchio (raggio 48 + P.r·0,4);
  - un anello di 10 palle di magma a 140 px/s, la prima girata a caso;
  - una pozza di magma r 26 per 4 s;
  - scossa 7.
- Colpibile da .55.
- Avviso: 0,82 s (veri: 0,76). Poi cammina.

leap (fase 2)
- Cerchio 1, r 48, da p 0.
- A .25 il cerchio 2, r 40, a 120 px dal primo verso di te: dentro la stanza e mai a meno di 30 px dalle rocce.
- A .43, colpo 1: 22 di danno nel cerchio 1, anello di 12 palle, pozza r 26 per 3 s.
- Da .48 a .76 il gioco la porta dal cerchio 1 al cerchio 2 (smoothstep), con e.z = 70·sin(π·u).
- A .80, colpo 2: 18 di danno nel cerchio 2, anello di 8 palle, pozza r 22 per 3 s.
- Colpibile da .48; quando è in alto (z > 20) il gioco da solo non la fa colpire.
- Avvisi: 0,82 s e 1,05 s (veri: 0,61 e 0,77).
- Se il modello non ha 'leap': breach, poi subito un secondo burrow → swim di 0,8 s → breach.

5. ANELLO DI FUOCO (crouch 0,9 s → run → pant 1,4 s)

Scelta dell'anello (a p 0 di crouch)
- Il centro è dove sei, spostato verso il centro della stanza finché un anello di raggio rr resta ad almeno 20 px dai muri e dalle rocce.
- rr va da 125 a 95, a passi di 10 (fase 2: da 110 a 90).
- Il varco è largo 60° (fase 2: 40°) e sta subito prima del punto dell'anello più vicino a lei, dove entra: così il varco è accanto a dove finisce il giro.
- Avviso: l'anello rosso tratteggiato, con la freccia del verso e il varco segnato da due paletti di luce, da p 0 di crouch finché il giro non lo copre.

run
- Prima corre dritta, senza fuoco, fino al punto d'entrata.
- Poi percorre l'anello a 300 px/s (fase 2: 375) per 360° meno il varco, con o.curve = ±1/rr.
- Lascia zone r 15 ogni 18 px, che durano fino a fine giro più 2,2 s (fase 2: più 3 s).
- Se ti investe fa il danno di contatto (22).
- Fase 2: a un quarto, a metà e a tre quarti del giro sputa una palla di magma verso di te, dall'esterno, senza fermarsi (165 px/s, 12 di danno).

Fine del giro
- Le fiamme dell'anello si alzano un istante (0,4 s, solo luce) e lei si ferma sul bordo del varco: parte pant.
- Da .00 a .80 di pant i colpi fanno +50%. La prima volta della partita compare la scritta «Il collare è freddo!» (#ffd84a).

Come si schiva
- Restando dentro: nella fase 1 dentro non arriva niente.
- Uscendo dal varco prima che si chiuda: ti porta proprio accanto a lei, che ansima.
- Scattando attraverso il muro di fuoco: lo scatto non brucia.

Se non c'è posto per nessun anello
Fa il giro della stanza di oggi: un'ellisse 130 × 170 intorno al centro, tratteggiata durante crouch. Un giro a 300 px/s con la stessa scia, poi pant.

6. ERUZIONE (erupt, 2,2 s, solo fase 2)

.00–.36: beve la lava
- Le sue zone (z.s2) entro 260 px smettono subito di far male.
- Il cervello le toglie una alla volta, le più vicine prima; da ognuna parte una scia di braci che scivola a terra fino alle sue zampe.
- Così prima dei geyser il pavimento è pulito.

Cerchi rossi
I cerchi hanno r 24 e ribollono: dentro c'è N3.salamanderGeyser con k da −1 a 0.

| Ondata | Geyser | Distanza da lei | Compare a | Scoppia a |
|---|---|---|---|---|
| 1 | 6 | 85 px | .11 | .56 |
| 2 | 9 (girata di mezzo passo) | 160 px | .25 | .70 |
| 3 | 12 (girata di mezzo passo) | 235 px | .39 | .84 |

- In più c'è un cerchio sotto di te, nell'ondata col raggio più vicino alla tua distanza (oltre 270 px, nell'ultima), dove sei quando compare.
- Niente cerchi fuori dalla stanza, né a meno di 30 px dalle rocce o dalla muta.

Geyser
- Ognuno dura 0,6 s (N3.salamanderGeyser).
- 18 di danno se sei a meno di 24 + P.r·0,4; al massimo un colpo per ondata.
- Ognuno lascia una goccia: zona r 14 per 1,2 s.
- A .52 la ricaduta: scossa 6, niente danno.

Come si schiva
Stando nei varchi tra i geyser (le ondate si alternano) o scattando oltre un'ondata quando scoppia. Mai restare fermi, per via del cerchio sotto di te.
Avviso: 0,99 s (veri: 0,73).

7. LA MUTA (rage, 3,0 s, fase 2)

Quando
- La vita scende sotto il 50% mentre è in walk, spit, pant o taunt.
- Se è sotto terra, nell'Anello, nella Frustata o nello scatto, aspetta.

A p 0
- e.p2 = true; e.shell per tutta la mossa.
- Via le sue palle in volo (G.eproj di tipo 'magma') e i suoi avvisi.
- Niente attacchi: resta ferma, con la direzione bloccata.

A .86
- Banner «La Regina cambia pelle!» / «Fase 2».
- bossRage(e,'255,215,120'), barra rossa, cerchio di rune oro bianco.
- Scossa 8, voce 'angry'.

A p 1
- La sposta di 30 in avanti lungo e.face (moveCircle).
- Mette la muta dov'era lei, stesso punto e stessa direzione, così il disegno del modello e quello del gioco coincidono: {x, y, face, t:0, life:15}.
- La muta si disegna con N3.salamanderHusk: cool = t/15, crumble nell'ultimo 0,8 s.
- Due pietre temporanee r 20 dentro il corpo, a x +8 e x −34 della muta, girate con face:
  - segnate k.s2husk: drawRock non le disegna, perché c'è già la muta;
  - diventano solide solo quando lei è a più di 55 px, così non la spingono;
  - fermano le palle e le frecce: un riparo per i ventagli grandi della fase 2;
  - la Frustata le spacca (crumble in 0,5 s).
- Subito dopo parte l'Eruzione.

8. PRESA IN GIRO E CHIAMATA (taunt, 1,2 s)
- Funziona come per il Golem e i boss nuovi (B3S, 88-boss3-voci.js).
- Quando ti colpisce ed è libera in walk: 'taunt' con la voce 'laugh'.
- Se non la colpisci per 7 s ti chiama: 'taunt' con 'laugh2'.
- Nel cervello: stato 'taunt', e.moving false, e.face verso di te, poi walk rand(0,6; 1). Mai tra due colpi.

ORDINE DELLE MOSSE
- Fase 1 (dopo l'entrata la prima è lo Sputafuoco): spit, whip, Tuffo, spit, Anello, poi da capo. La Frustata fuori turno non conta nella sequenza.
- Fase 2: subito dopo la muta l'Eruzione, poi spit, Anello, whip2, Tuffo (col salto del delfino), erupt, poi da capo. Quindi seq2 = spit, ring, whip2, dive, erupt: l'Eruzione arriva una volta per giro, dopo il Tuffo, quando c'è fuoco da bere.

ENTRATA (3,4 s)
Il modello fa 'enter' per tutta la durata; e.em resta sotto 1 finché non è arrivata, come il Golem.

| Secondi | Cosa succede |
|---|---|
| 0 | le crepe di lava della stanza si accendono (luci più forti per 0,6 s), sfx 'creep', scossa 2 |
| 0,5–0,8 | tre 'click' per le punte della corona |
| 1,0 | 'shimmer' quando si aprono gli occhi |
| 1,75 | 'boom' basso, scossa 3, schizzi di lava (vfxBlast con debris 'lava') |
| 1,9–2,3 | dieci piccoli 'ignite' in crescendo, uno per petalo |
| 2,6 (p .77) | il grido (b3say 'cry'), scossa 6 e i tre anelli bianchi |
| 3,06 (p .90) | lo schiocco della coda: scossa 5, mezzaluna di scintille, ENV2.mark 'scorch' dietro di lei, niente danno |
| fine | cratere bruciato dove c'era la pozza (stamp 'crater' r 40) |

SCONFITTA (4 s, clou a 2,3 s)
Il modello fa 'die'. Il cervello aggiunge:
- sbuffi di vapore da .12 a .42, uno per fessura;
- al clou il tintinnio di vetro e «sconfitto»;
- braci da .575 a .80, fumo da .80;
- tra 2,3 s e 4 s le crepe di lava della stanza si spengono una a una;
- la voce 'die'.

VOCE (B3VO.VB.salamander)
Come la voce del Golem; volume medio 0,07–0,11. Si prepara nelle stanze della sua arena.
- Il suo suono: un sibilo regale da rettile, con le fusa sotto e la lava che gorgoglia.

| Clip | Quando | Com'è |
|---|---|---|
| cry | entrata | un sibilo lungo che sale e diventa un ruggito, col gorgoglio della lava (circa 1,9 s) |
| angry | la muta | un ruggito che scoppietta di fuoco |
| laugh | ti ha colpito | «hsss-hsss-hsss», una risata sibilante con le fusa |
| laugh2 | ti chiama | tre colpi secchi e un sibilo lungo verso di te |
| hurt | la colpisci forte | un «ksss!» secco |
| win | cadi tu | la risata lenta «hsss… hsss… hsss…» e un fuso soddisfatto |
| die | sconfitta | un lungo sibilo che diventa lo sfrigolio dell'acqua sulla pietra calda, poi un sospiro |

Un verso per mossa (B3CUE.salamander):
- spit → 'c_spit': un gorgoglio che sale in gola;
- whip e whip2 → 'c_whip': un ronzio basso e poi «hah!»;
- burrow → 'c_dive': un sibilo che scende;
- crouch → 'c_ring': un trillo rullato;
- erupt → 'c_erupt': un ruggito al cielo;
- pant → 'c_pant': un ansimare con lo sfiato del vapore.

Il soffio del collare, come il «tum-tum» del Golem:
- un «fff» di mantice quando il collare si apre (p .02 di spit, whip, whip2, erupt);
- un «vuff» più basso quando si piega (p .02 di burrow e crouch).

Sotto grido, rabbia, sconfitta e risata della vittoria si sente il gorgoglio della lava (rumore basso con le bolle).

L'ARENA CHE REAGISCE (ENV2, come in 52 e 87)
- Camminata: le orme si accendono; lo strascico brucia l'erba e accende il legno (ENV2.burnGrass, ENV2.ignite).
- Collare aperto (spit, erupt): le torce virano al suo rosso, ENV2.torches(['#ff3c10','#ff8a22','#ffe0a0'],'255,110,50',1.5).
- Frustata:
  - tre bruciature lungo la mezzaluna (mark 'scorch');
  - il basalto vicino trema e si scheggia (ENV2.rocks 160, 2);
  - cenere dal soffitto (ENV2.fall 5) e pezzi di basalto (ENV2.chunks).
- Pinna: la crepa che brilla e si spegne; le rocce sotto cui passa tremano.
- Uscita dal Tuffo:
  - cratere (mark 'crater');
  - pezzi di basalto e di lava (chunks 16, ['#3a2a24','#ff7a2e','#5a4038']);
  - cenere e sassolini (fall 8);
  - torce bianco-oro per 0,6 s;
  - rocce che tremano (rocks 150, 3);
  - erba bruciata e legno acceso (raggio 70).
- Anello: un anello di bruciature (mark 'scorch' ogni 40 px).
- Eruzione: trema tutto (scossa 6), cade cenere (fall 10), tutte le crepe di lava del pavimento si accendono insieme per 1,2 s.
- Sconfitta: le crepe di lava si spengono una a una.
- La barra si rompe in schegge d'ossidiana e braci (BBFX).

COSA TENERE DEL BOSS DI OGGI
- La stanza: il Nido della Salamandra, con tre pozze di lava e dieci crepe di lava nel pavimento, il cerchio di rune 'magma' e le colonne di basalto.
- Nessun servitore: oggi non ne ha, e non se ne aggiungono.
- Nome, titolo, vita 2.600, contatto 22, oro 50, esperienza 80, la musica 'salamandra', il traguardo «Domafiamme», la missione.
- Le sue tre cose di sempre, rifatte:
  - la scia di fuoco diventa lo strascico della coda;
  - lo scavare e il riemergere diventano la pinna e la colonna di lava;
  - le palle di fuoco e la corsa di fuoco diventano il cono e l'anello intorno a te.
- Funziona anche nell'Abisso (zona 'magma' ogni 40 stanze) e nella sfida del giorno: lo stesso cervello, nella stanza in cui si trova.
- Testo della guida (44, BEST): «Boss. Ventagli di magma, frustate di coda, nuota sotto il pavimento con la corona come una pinna e ti chiude in un anello di fuoco. A metà vita cambia pelle: la pelle vecchia resta e fa da riparo.»
- Il prologo (91), le anteprime e le miniature delle arene (61), la guida (44) e il trailer (38) la disegnano con N3.salamander. Ora è più grande: l'inquadratura va riguardata.

MODELLO FINTO (anteprime/boss2/salamander_stub.js)
È la Salamandra di oggi che fa le mosse nuove, per provare il cervello. Le corrispondenze:

| Mossa nuova | Mossa di oggi |
|---|---|
| spit | spit |
| whip, whip2 | circle |
| burrow | burrow (p·0,44) |
| swim | niente modello, solo un'ellisse arancio sotto la corona |
| breach, leap | burrow (da .58 a 1) |
| crouch, pant | idle |
| run | circle |
| erupt, rage | spit |
| taunt | idle |
| enter | burrow (da .58 a 1) |
| die | hit |

Tutte le mosse nuove vanno nel suo N3.meta.salamander2.an e dur, come nel modello vero.

DIFFICOLTÀ
Da misurare con node tests/boss2diff.js salamander, contro quella di oggi.
- Per l'eroe fermo che tira, la nuova fa più danno di oggi (lo Sputafuoco ha tre ventagli).
- Se è troppo dura per l'arena 2, nell'ordine:
  1. via il terzo ventaglio dello Sputafuoco nella fase 1 (restano 5 e 4);
  2. l'anello d'uscita del Tuffo da 10 a 8 palle;
  3. il varco dell'Anello più largo.
- Chi si muove prende molti meno colpi, perché ogni colpo ha il suo avviso.

## Voti del direttore artistico

GIUDIZIO (il metro è il Golem approvato: misura da boss vero, un segnale di luce che avvisa i colpi, anticipo lungo, colpo secco, assestamento, una fase 2 che cambia davvero, entrata e sconfitta recitate dal modello, presa in giro, voce, arena che reagisce)

«regina»: 8,7 su 10. VINCE.
È l'unica che parte dal titolo che il gioco le dà già («Regina delle pendici») e ne fa un personaggio. Ha tre segni da regina cresciuti sul corpo: la corona d'ossidiana, la gorgiera di magma e lo scettro in punta alla coda. È enorme e calma, con la testa ferma su di te come un rettile che ha già scelto la preda.
Ha il segnale più forte dopo il cuore del Golem. Il collare si apre come un sole (più è aperto, più il colpo è vicino) e la sua luce corre nella parte che colpirà. Quando il collare diventa grigio dice «colpiscimi».
La fase 2 cambia aspetto e gioco: con la muta esce incandescente e la pelle vuota resta come riparo. La sconfitta ha un momento che si ricorda: la corona che cade e rotola. La presa in giro ha carattere: la regina annoiata che tamburella con la coda.
Le abilità sono varie e si leggono bene: un cono, una mezzaluna dietro di lei, la pinna che caccia, la corsa, le onde che salgono dal pavimento.
Contro:
- tanti ornamenti;
- il collo che si torce a 140°;
- a fine giro la coda finirebbe stesa sopra l'eroe;
- la Corsa intorno al centro della stanza è poco personale;
- troppo fuoco a terra nella fase 2;
- colori della fase 2 vicini alla Fenice;
- è bassa per un boss vero (84 in punta).

«spirito»: 7,9 su 10.
Ha la sagoma più simpatica per i bambini (un axolotl con le branchie di fiamma) e la caccia più inquietante (gli occhi che ti cercano sotto il pavimento). La sconfitta è poetica: la brace torna nel vulcano. L'anello di fuoco intorno all'eroe, con un varco, è una trappola che si vede arrivare.
Contro:
- il corpo di lava che si scioglie e si ricompone è la cosa più difficile da costruire e da leggere;
- la testa da axolotl fa più tenerezza che timore;
- la lava sotto la crosta ricorda il Golem nella fase 2;
- il Soffio che si ferma contro le colonne è il Raggio del Golem girato di lato.

«bestia»: 7,3 su 10.
Ha ottimi comportamenti: la fame, il ghigno chiuso come lo sportello di una fornace, il fuoco della stanza che si beve, le flessioni, le orme.
Contro:
- la fornace nella pancia, dalla telecamera del gioco, non si vede;
- la crosta con la lava è di nuovo il Golem (e il Golem d'ossidiana dello stesso capitolo);
- Anello + Balzo + Fiatone copia Schianto + Pugni incastrati;
- il nome richiama la Bestia che Denis ha tolto.

DALLE ALTRE DUE ENTRANO
Dallo «spirito»:
- gli occhi ambra a filo del pavimento, subito dietro la pinna;
- nell'entrata, gli occhi che si aprono nella lava, guardano a sinistra e a destra e si fermano su di te;
- il cerchio d'uscita con le sei tacche del Golem, lo stesso segno per «qui arriva qualcosa»;
- l'anello di fuoco intorno all'eroe, col varco proprio accanto a dove lei si ferma ansimando (al posto della pista fissa);
- l'ultima brace che torna nel vulcano;
- il fuoco a terra «caldo fa male, nero no».

Dalla «bestia»:
- il sorriso chiuso con il filo di luce della fornace;
- prima dell'Eruzione si beve il suo fuoco dal pavimento, così i cerchi dei geyser si leggono su un pavimento pulito;
- il colpo di tosse con l'anellino di fumo prima che la corona scivoli;
- la frustata fuori turno se le stai addosso;
- il fuoco che si ritira dal bordo (si vede quanto dura);
- le orme che si accendono.

LE MIE CORREZIONI
- È più alta: corona a 92 da ferma e 124 da ritta (3,4 volte l'eroe); gli occhi sono più grandi.
- Nella Frustata la coda si alza mentre lei si gira, quindi non è mai stesa sopra l'eroe, e la testa gira al massimo di 120°.
- Ogni avviso è calcolato sulla velocità più alta (fase 2 nell'arena 2, ×1,35), così resta sopra 0,6 s.
- La pelle della fase 2 è più rossa, perché non si confonda col suo fuoco né con la Fenice.
- Il testo della fase 2 dice cosa succede: «La Regina cambia pelle!».
- Sotto terra è intoccabile con shell + air e non con hidden (che la farebbe disegnare al 12%).
- C'è un tetto alle sue zone di fuoco.
- L'Eruzione arriva una volta per giro, subito dopo il Tuffo, così ha fuoco da bere.

SCARTATI
- Le flessioni: divertenti, ma meno regali della regina annoiata.
- La fornace nella pancia, il Soffio, lo scioglimento, le branchie.
