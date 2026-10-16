# Yeti delle Vette: il design finale

(Deciso dal direttore artistico tra tre proposte, 16 ottobre. Tipo nel gioco: `yeti`; modello `sprite/nemici3d/yeti2.js`.)

## Il design

LO YETI DELLE VETTE · «LA MONTAGNA CHE RESPIRA»
Cosa resta di oggi:
- nome e titolo nel gioco («Yeti delle Vette», «Il ruggito della valanga»);
- l'arena 4 «Picchi di Brina» («Lo Yeti delle Vette dorme in cima»);
- la Tana dello Yeti coi quattro blocchi di ghiaccio;
- la musica yetiM;
- la frase della fase 2 «Lo Yeti scatena la valanga»;
- la morte già approvata da Denis: gela e va in frantumi.
Il modello è 'yeti2' in sprite/nemici3d/yeti2.js: reg('yeti2',{n:'Yeti delle Vette',g:'boss',sc:1,an:[idle, walk, hit, leap, bound, pound, snowball, breath, gasp, roar, claws, rage, taunt, enter, die],dur,lab}). Nel gioco prende il nome 'yeti'. Il disegno di oggi resta come N3.meta.yeti2.old, per il «prima e dopo».

IDEA
Un gigante antichissimo delle vette, curvo ma in piedi, alto il triplo dell'eroe.
- Il pelo è blu ghiacciaio. Sopra porta un mantello di neve che gli copre gobba, spalle e cima della testa, come la neve sulla cima di un monte; dalla cima della gobba il vento strappa una bandiera di neve.
- Ha grandi corna da montone scure a spirale, con la brina sul bordo.
- Criniera e barba sono d'argento, con un ghiacciolo in punta alla barba.
- Il muso è blu notte, con due occhi azzurro ghiaccio che brillano sotto due sopracciglia di brina.
- Le braccia sono lunghissime e gli pendono fino alle ginocchia; le mani sono scure, con quattro artigli di ghiaccio.
Fa timore perché è una montagna che respira: sta fermo e ti fiuta, e prima di ogni colpo prende un respiro enorme che gli gonfia tutto il pelo e risucchia la neve della stanza. È figo perché da lontano è una vetta innevata con due occhi accesi, e quando ulula la montagna gli risponde con la valanga.
Resta della Classica: forme tonde e robuste, colori pieni, occhi grandi con la lucina, due zannette, niente sangue, ferite o cuciture. Ha anche i suoi momenti buffi: si scrolla come un cane, ansima con la lingua fuori, si batte le mani per togliersi la neve, ride «hoo-hoo-hoo».

IL SEGNALE CHE AVVISA I COLPI: IL RESPIRO
Prima di ogni attacco prende fiato (A.inh da 0 a 1 dentro la mossa):
- Il pelo si gonfia e si rizza:
  - i raggi dei volumi crescono fino all'8% (12% nel Soffio);
  - le ciocche si allungano del 35% e si aprono verso fuori fino a 35°;
  - la criniera si allarga;
  - la sagoma cresce e si vede da tutte le direzioni.
- La bandiera di neve smette di andare col vento e si piega verso la bocca. Fiocchi e brina corrono in bocca a spirale (12 fiocchi, da 70 px a 0).
- Le luci si accendono:
  - gli occhi si accendono di più (alone +60%);
  - sul mantello si accendono quattro brillii a stella;
  - nel Soffio la bocca si socchiude e la gola si illumina d'azzurro.
- Si sente il fiato risucchiato che sale, con tre note di vetro: mi, sol, si, l'accordo del suo tema.
Il colpo parte con lo sbuffo (A.exh): una nuvola di brina dalla bocca e dalle narici («HAH!»), e il pelo si riabbassa.
Dopo il Soffio e il Ruggito resta SENZA FIATO: pelo afflosciato, testa bassa, lingua fuori, occhi socchiusi e spenti, sbuffi corti. È il momento di colpirlo.
La regola per un bambino: «Prende fiato: scappa. Ha il fiatone: colpiscilo.» Nel Golem la luce del cuore corre nel braccio che colpisce; qui si gonfia tutto il corpo e la stanza gli soffia in bocca.

SAGOMA E MISURE
A sc 1, in unità del modello (px). x avanti, y a destra, z in su, origine a terra tra i piedi.
- È una «A» morbida e massiccia, come un monte:
  - in alto la gobba innevata è il punto più alto (z 112);
  - davanti e più in basso c'è la testa con criniera e corna (cima della testa 100, corna 104);
  - le spalle sono larghe (giunti a ±38, z 88);
  - sotto vengono il torace a botte, la pancia, gambe corte e storte nascoste dal pelo, piedi grandi;
  - ai lati due colonne di braccia pendono fino alle ginocchia, con le mani a z 28.
- È larga 108 con le mani (±54) e 116 con le ciocche. È tre volte l'Arciere 3D (37 px) e alta come il Golem (110).
- In piedi (Pioggia, Ruggito, Artigli, Furia, Presa in giro) si raddrizza tutto: la testa arriva a 136, le mani alzate a 160.
- A quattro zampe (atterraggi dei balzi) è alto 70 e lungo 110.
- Nella fase 2 i cristalli delle corna arrivano a 120.
- Nel gioco: raggio 34 (oggi 32). L'ombra a terra è 46×15 a .45, scura per staccarlo dal pavimento chiaro. Alone e barra con B2H.yeti 100.

LE QUATTRO DIREZIONI
- Davanti:
  - la vetta bianca della gobba spunta dietro e sopra la testa;
  - il muso blu notte è incorniciato dalla criniera argento e dalle spirali delle corna, con gli occhi accesi al centro;
  - la barba sta sul petto scuro;
  - le braccia blu sono ai lati, con le mani scure e gli artigli chiari;
  - i piedi hanno le unghie di ghiaccio.
- Tre quarti: si vede tutto insieme, con la testa girata verso l'eroe; si legge la lunghezza delle braccia.
- Lato: il profilo del gigante curvo:
  - la gobba alta dietro, con la bandiera;
  - la testa avanti e più bassa, col muso e una zannetta;
  - la spirale intera del corno intorno all'orecchio;
  - il braccio vicino che pende come una colonna fino al ginocchio, con la frangia.
- Dietro:
  - la gobba coperta di neve come una cima, col bordo a onde e i ghiaccioli;
  - la bandiera che sventola;
  - le corna che spuntano ai lati;
  - sotto, il pelo blu della schiena a ciocche e le braccia ai fianchi.

NON SOMIGLIA AGLI ALTRI
- Golem:
  - sta in piedi, niente pugni chiusi a terra né andatura sulle nocche; le mani sono aperte, con gli artigli;
  - sulla schiena niente pietre o punte all'insù: solo neve morbida e ghiaccioli all'ingiù;
  - niente luce nel petto;
  - niente onde d'urto;
  - la testa sta avanti e alta con le corna, mai incassata;
  - è blu e bianco, il Golem grigio e verde.
- Cervo d'Aurora: corna scure da montone, mai luminose nella fase 1. I cristalli arrivano solo nella fase 2, in blu di ghiacciaio, mai coi colori dell'aurora.
- Regina dei Ghiacci: niente diadema né specchi, e mai la parola «tormenta».

SCHELETRO E PEZZI NELLA POSA DI RIPOSO
Metodo dello spaventapasseri, con la cassetta C3 come golem2.js e boss3.js.
- Piedi: [2, ±18, 0], ellissoide [14, 10, 6,5]. Pianta blu notte coi cuscinetti chiari, tre unghie di ghiaccio davanti (chain di 5 px), pelo sulle caviglie.
- Gambe: a due ossa con ik. Anca [−4, ±15, 33], ginocchio in avanti (polo [1, 0, 0]), coscia 19, stinco 18. Coperte fino al ginocchio da 8 ciuffi di pelo a punta per gamba.
- Corpo:
  - pancia [−3, 0, 40] r [23, 27, 19];
  - petto a botte [6, 0, 66] r [27, 36, 25]: davanti c'è la pelle blu notte (ellCap verso [1, 0, .1], ampiezza .6), in parte sotto la barba;
  - gobba [−9, 0, 90] r [25, 33, 22], con la cima a 112;
  - i tre volumi sono un solo inviluppo convesso, come il torso del Golem, col contorno di ciocche a punta.
- Testa:
  - centro [28, 0, 84], r [16, 17, 16], con la sua telecamera: guarda l'eroe, con il cheat come gli altri boss;
  - muso [41, 0, 78], r [9,5, 12, 8,5]: la maschera blu notte a cuore;
  - naso largo [49, 0, 80];
  - bocca a [48, 0, 73], larga 11.
- Corna da montone:
  - chain di 7 punti: [24, ±13, 94] → [16, ±22, 101] → [7, ±27, 94] → [5, ±29, 82] → [12, ±29, 72] → [21, ±26, 70] → punta in su [27, ±24, 75], vicino alla guancia;
  - spessore da 6 a 1,6, cinque anelli in rilievo, la brina sul bordo di sopra;
  - la lontana si disegna prima del cranio, la vicina dopo; di lato la spirale passa dietro l'occhio.
- Criniera: ciocche argento sulle guance e sotto le corna, più 4 lingue lunghe (2 per lato) che scendono sulle spalle.
- Sopracciglia di brina: due ciuffi argento sopra gli occhi (direzioni [1, ±.42, .42]) che pendono in fuori come grondaie di neve.
- Barba: 3 lingue dal mento [44, 0, 68] fino a z 50, quella in mezzo più lunga, con un ghiacciolo in punta. Segue la mascella quando la bocca si apre.
- Braccia:
  - a due ossa con ik: spalla [6, ±38, 88], omero 28, avambraccio 27;
  - il gomito va fuori e indietro (polo [−.5, ±.8, −.1]); la mano a riposo è in [14, ±46, 28];
  - l'omero è coperto di ciuffi, l'avambraccio è più grosso (raggio da 10 a 8);
  - sotto l'avambraccio c'è una frangia di 3 lingue (12–16 px) con un ghiacciolino in punta.
- Mani: palmo [8, 7, 6] blu notte coi cuscinetti chiari, 4 artigli di ghiaccio curvi (chain di 9 px; nella fase 2 lame da 18). Si aprono negli schiaffi e negli artigli, si chiudono a metà quando cammina.
- Mantello di neve:
  - è un ellCap col bordo a onde sulla gobba, sulla cima della testa tra le corna e sulle spalle;
  - dietro scende fino a z 70;
  - sotto il bordo pendono 8 ghiaccioli piccoli (4–7 px);
  - ha puntini e due pieghe d'ombra.
- Bandiera di neve: 3 sbuffi bianchi (foglie affusolate con la coda trasparente, 24–34 px) dalla cima della gobba [−12, 0, 111], portati dal vento.
- Ordine di disegno: lo decide la posa di riposo (parts + run):
  - piedi, gamba lontana, braccio lontano quando è dietro;
  - pancia, petto e gobba col mantello;
  - gamba vicina;
  - testa: corno lontano, cranio, criniera, viso, corno vicino;
  - barba, braccio vicino, effetti.
  Le braccia alzate si ordinano da dove sta la mano, come nel Golem.

PITTURA
Come lo Zombie della lanterna:
- tre toni su ogni pezzo;
- luce fredda dall'alto a sinistra (la luna), col bordo illuminato rim;
- un filo caldo delle torce arancioni della Tana, in basso a sinistra sui pezzi grandi;
- contorno INK spesso: 2,6–3 sui pezzi grandi, 1,6–2 sui piccoli;
- shadeLimb su braccia e gambe, glowTop sulle punte di artigli, ghiaccioli e corna;
- segni leggeri: riccioli a «u» del pelo (4–5 per volume) e puntini sulla neve;
- bagliori morbidi solo su occhi, gola, brillii del mantello e cristalli della fase 2.

PALETTE · FASE 1 «Neve della vetta»
- Mantello di neve: #ffffff / #e6eff9 / #a9bedb; pieghe #8ea6c8; puntini #cfe3f7.
- Criniera, sopracciglia e barba: argento, un po' più blu della neve, così i due bianchi si separano: #f2f6fb / #d0dceb / #8b9fbe.
- Pelo del corpo, blu ghiacciaio: #a9bce2 / #6c84bd / #3a4a80; fondo tra le ciocche #283466; riccioli #c9d6f0 in luce e #2c3868 in ombra.
- Pelle (muso, petto, palmi, piante): #56649c / #333d72 / #1c2248. Naso #141a38 con la lucina #8a96c8.
- Corna: #8f93ad / #585b7a / #2f3150; anelli #3f4262; brina sul bordo #e4f1ff.
- Artigli e unghie: #effcff / #a6e3f7 / #4f97c9, venatura #ffffff. Ghiaccioli: #f4fdff / #a8def5 / #5aa3cf.
- Occhi:
  - iride #8ff0ff, centro #e8fdff, lucina #ffffff;
  - alone 120,225,255 che pulsa col respiro;
  - spenti #4f8fae, senza alone.
- Bocca e fiato:
  - bocca #2a1d45, lingua #6b3f72 (viola, mai rossa);
  - gola accesa da #9fe9ff a #eafcff;
  - zannette #f6f1e2, ombra #cfc6ad;
  - fiato rgba(235,248,255,.75).
- Bordi e ombra: bordo freddo rgba(240,250,255,.55), bordo caldo rgba(255,170,100,.35), ombra a terra rgba(16,22,40,.45).
Perché questi colori: il pavimento della Tana è quasi bianco (#bccbd8, #b1c1cf, #c6d4e0, #a8b8c7).
- Il bianco sta solo in alto, mai oltre un terzo della sagoma.
- La massa del corpo è più scura e più satura del pavimento.
- Il blu notte del viso e delle mani è la parte più scura, così gli occhi sono la prima cosa che si vede.

PALETTE · FASE 2 «Il gelo eterno»
- Pelo ghiacciato: #9db3e8 / #4c63a6 / #24306a, fondo #161f4a, punte brinate #eaf6ff.
- Mantello, diventato crosta di ghiaccio: #f6fdff / #c3ecfb / #6fb3dc, banda di riflesso #ffffff.
- Criniera e barba gelate: #eef8ff / #b9d6ee / #6788b4. Ghiaccioli lunghi: #e6faff / #8fd0f2 / #3f7fb6.
- Cristalli delle corna: #e8fbff / #7cc6f2 / #2f6fb8, anima 110,190,255.
- Lame: #ffffff / #b8efff / #4e9fdc, alone 150,225,255.
- Pelle: #4a5890 / #2b3466 / #161b3c.
- Occhi bianchi #f4ffff con alone 90,180,255 e una piccola scia. Gola #d0f6ff.
- Fiato continuo rgba(185,225,255,.8); nebbia fredda rgba(200,230,255,.3).
Niente occhi rossi come oggi: la rabbia è il blu del ghiacciaio.

NELLA STANZA
- RUNEC.yeti ['150,215,255', '90,160,255'] (il bianco di oggi della fase 2 sparisce sul pavimento).
- B2T.yeti [['150,215,255','90,160,255'],'235,245,255'].
- B2H.yeti 100.
- ECOL.yeti '#6c84bd'.
- Avvisi rossi 229,72,77, come nel resto del gioco.

FACCIA E OCCHI
- Una maschera blu notte a cuore, incorniciata dalla criniera.
- La fronte è pesante e brinata. Le sopracciglia di brina tengono gli occhi in ombra senza coprirli, anche visti dall'alto; quando è arrabbiato scendono con la punta interna.
- Gli occhi sono grandi, a mandorla (rx 3,6, ry 2,8), azzurro ghiaccio, col centro chiaro e la lucina. Pulsano piano col respiro; le palpebre battono lente.
- Il naso è largo e schiacciato, con due narici per gli sbuffi.
- La bocca è larga e dritta, con due zannette d'avorio che salgono dal labbro di sotto, e sono le sole due. Aperta è buia viola, con la lingua viola e la gola che si accende.
- Lo sguardo è fisso: la testa resta puntata sull'eroe mentre il corpo ondeggia.

VENTO E PELO
- Il vento è fisso nel mondo: va verso destra sullo schermo e un po' in alto, ed è portato nelle coordinate del modello da face. Così bandiera, criniera, barba e frange vanno sempre dalla stessa parte anche quando gira.
- Fa due onde lente per giro, con frequenze intere in p, così ogni mossa si chiude su sé stessa. Le punte si muovono più delle radici.
- Le ciocche del contorno:
  - sono legate a direzioni del corpo calcolate una volta;
  - si disegnano solo vicino al bordo, come furBall di boss1.js, ma a punta e pendenti (niente batuffoli tondi da pecora);
  - così il bordo non striscia quando gira.
- Con LOWFX le ciocche stanno ferme e la bandiera non c'è.

FERMO, CAMMINA, COLPITO
- idle (3,0 s):
  - In piedi curvo, braccia appese con gli artigli vicino al ghiaccio.
  - Un respiro lento: inspira da .00 a .45 (petto e gobba salgono di 2 px, A.inh .25), espira da .45 a .75 con sbuffi dalle narici a .50 e .58.
  - Palpebre lente a .35.
  - La mano destra gratta il ghiaccio a .62 e .70 («tic… tic»).
  - Fiuta l'aria col muso alto a .82 e .90; la testa segue l'eroe.
  - Fase 2: pelo rigido (si muovono solo le punte), ghiaccioli che tintinnano a .2 e .7, nebbia fredda ai piedi, un filo di fiato continuo, i cristalli che pulsano due volte.
- walk (1,3 s, due passi; 42 px/s nel gioco):
  - Il piede destro posa a .00, il sinistro a .50. A ogni posata il corpo affonda di 2 px, con uno sbuffo di neve, e rolla di ±.08.
  - Le braccia pendolano al contrario delle gambe (±12 px); gli artigli strisciano sulla neve a .22 e .72.
  - La testa resta ferma sull'eroe e la bandiera sbatte a ogni passo.
  - Fase 2: più basso (−4), passo da ±16, le lame avanti.
- hit (0,6 s): la testa va indietro, gli occhi si strizzano, un'onda corre nel pelo e la neve cade dalle spalle. Serve solo alle pagine.

LE MOSSE
Ogni mossa dipende solo da p. A p 0 e p 1 c'è la posa di riposo (tranne enter e die), e ogni tremolio sta sotto gli 8 Hz.

leap (2,4 s) «Balzo del Gigante»
- .00–.22, preparazione:
  - si accuccia (−10, busto avanti .25) con le mani indietro a [−14, ±40, 30];
  - raspa il ghiaccio a .10 e .16;
  - prende fiato fino a A.inh 1 (a .20).
- .22, colpo: scatta in alto con lo sbuffo, le braccia lanciate avanti.
- .22–.80, in aria:
  - l'altezza la dà il gioco con o.z; da solo fa un arco di 60;
  - braccia aperte avanti con gli artigli spalancati (mani a [30, ±48, 60]), gambe raccolte, pelo e bandiera verso l'alto;
  - da .74 allunga le mani verso terra.
- .80, atterraggio a quattro zampe: mani a [30, ±34, 0], piedi a [−2, ±20, 0], corpo schiacciato −14, anello di neve.
- .80–1, ritorno: si rialza ringhiando; a .90 scuote la neve dalla testa.

bound (1,3 s) «Balzo corto», solo nella fase 2
- .00–.25: si accuccia (−6, A.inh .6).
- .25: scatta.
- .25–.80: volo basso (o.z; da solo un arco di 30).
- .80: atterra su mani e piedi, con un anello piccolo.
- .80–1: si rialza.

pound (2,2 s) «Pioggia di ghiaccioli»
- .00–.26, preparazione:
  - si raddrizza tutto: busto −.35, sulle punte +6;
  - braccia larghe in alto con gli artigli aperti (mani a [10, ±52, 132]);
  - prende fiato fino a A.inh 1 (a .24).
- .26–.40: resta in alto e trema.
- Colpi: a ogni schiaffo uno sbuffo, la neve esplode e il ghiaccio si crepa.
  - .42: schiaffo della mano sinistra a terra, in [36, −30, 0];
  - .56: schiaffo della destra, in [36, 30, 0];
  - .74: tutte e due insieme con tutto il peso, in [40, 0, 0] (corpo −10, busto avanti .45).
- .74–.88: resta chino, alza la testa al soffitto (−.6) e ringhia: chiama il ghiaccio.
- .88–1: ritorno.

snowball (2,0 s) «La palla che cresce»
- .00–.24: si china (busto .4) e arrotola la neve con le due mani; la palla cresce fino a r 14.
- .24–.38: la porta al fianco con la destra, in [4, 40, 30].
- .38–.56, carica da bocciatore:
  - busto girato +.5;
  - braccio destro indietro e in basso, in [−24, 44, 18];
  - prende fiato fino a A.inh .7.
- .60, lancio rasoterra:
  - il braccio spazza il pavimento fino a [40, 20, 6];
  - la palla lascia la mano: da qui in poi la disegna il gioco;
  - il corpo segue avanti con lo sbuffo.
- .60–.82: resta basso a guardarla.
- .82–1: si raddrizza e si batte le mani a .88 e .95.
- Con o.p2: una palla per mano, carica corta (.38–.50), lancio della sinistra a .52 e della destra a .66.

breath (3,0 s) «Soffio gelido»
- .00–.42, il grande respiro:
  - si alza di +4; testa −.4 e busto −.2 indietro;
  - petto e gobba si gonfiano del 12%;
  - il pelo si rizza e la criniera si apre;
  - la bandiera si piega verso la bocca e i fiocchi entrano in bocca a spirale;
  - sul mantello si accendono i brillii;
  - da .25 la bocca è socchiusa con la gola accesa;
  - occhi stretti (.5).
- .42, colpo: la testa scatta avanti (+.2), le fauci si spalancano mostrando le zannette, lampo alla bocca.
- .42–.80, il soffio:
  - il modello disegna solo i primi 60 px del vento bianco-azzurro, con fiocchi e scintille; il cono intero lo disegna il gioco;
  - si appoggia dentro il soffio (busto avanti .2);
  - il suo stesso vento gli spinge indietro pelo e bandiera.
- .80–1: chiude la bocca e il pelo si affloscia.
- Nella fase 2 la posa è la stessa: il gioco gli gira il corpo per la spazzata.

gasp (1,4 s) «Senza fiato»
- Piegato in avanti (.45), con le mani sulle ginocchia in [16, ±30, 28] e la testa che pende (+.35).
- La lingua è fuori e il pelo afflosciato (−4%).
- Fa quattro sbuffi corti, a .12, .34, .56 e .78.
- Gli occhi sono spenti; niente bandiera e niente brillii.
- .85–1: scuote la testa e si raddrizza.

roar (3,0 s) «Ruggito della valanga», solo nella fase 2
Il nome 'roar' resta, perché lo usa il prologo.
- .00–.30:
  - si raddrizza tutto e si batte il petto coi pugni a .10, .18 e .26;
  - a ogni colpo un anello bianco esce dal petto;
  - prende fiato fino a A.inh 1 (a .30).
- .30–.70:
  - butta la testa indietro (−.7) e ulula al cielo a bocca spalancata;
  - una colonna di fiato sale, le braccia sono spalancate (mani a [0, ±60, 100]);
  - tutto il corpo trema a 7 Hz.
- .70–1: ricade curvo e ansima, con sbuffi a .78 e .90.

claws (1,9 s) «Artigli di ghiaccio», solo nella fase 2
- .00–.30:
  - si alza sulle gambe (−.15), col braccio destro caricato in alto dietro la testa, in [−10, 30, 128];
  - la luce corre sulle lame dalle nocche alle punte;
  - prende fiato.
- .48: squarcia l'aria in diagonale, da destra in alto verso sinistra in basso, fino a [40, −20, 20], con tre righe bianche nell'aria.
- .48–.64: lo slancio lo gira (−.4) e il braccio sinistro risale.
- .66: seconda artigliata nell'altra diagonale, fino a [40, 20, 20].
- .66–1: ritorno.

rage (3,0 s) «Furia», il passaggio alla fase 2
Non fa danni. Dipende solo da A.k2, non da o.p2.
- .00–.12: barcolla.
- .12–.45: si batte il petto quattro volte, sempre più forte (.16, .24, .32, .40):
  - a ogni colpo la brina corre sul pelo dal petto in fuori e lo ghiaccia;
  - il colore passa alla fase 2 in quattro scatti morbidi (A.k2 .25, .5, .75, 1);
  - le ciocche si irrigidiscono e crescono i ghiaccioli;
  - il mantello diventa una crosta di ghiaccio.
- .45–.62:
  - lungo le corna crescono i cristalli, dalla base alla punta (.46–.60);
  - gli artigli gelano in lame con tre «crac», a .50, .54 e .58 (9, poi 13, 16 e 18 px).
- .62–.90:
  - ulula al cielo, con un'esplosione di brina;
  - a .64 gli occhi diventano bianchi;
  - la bandiera diventa una piccola bufera.
- .90–1: scende nella posa della fase 2.

taunt (1,2 s) «Presa in giro»: «Vieni qui»
- .00–.15: si sporge verso l'eroe.
- .15–.55: allunga il braccio destro col palmo in su (in [56, 16, 50]) e piega due volte l'artiglio dell'indice, a .30 e .45.
- .58–.90:
  - ride «hoo-hoo-hoo» in tre sbuffi, a .62, .72 e .82;
  - ha gli occhi socchiusi come se sorridesse e le zannette in vista.
- .90–1: torna curvo.

enter (3,4 s) «Entrata: la valanga lo porta»
- .00–.16:
  - un fronte di neve (largo 70, alto 30), con 2–3 palle che ci rotolano dentro, scivola da 90 px dietro di lui fino al suo posto;
  - lì si ammucchia in un cumulo largo 80 e alto 42.
- .16–.30: il cumulo respira, con sbuffi di brina a .20 e .27.
- .30–.38: si aprono gli occhi con la lucina e spuntano le punte delle corna.
- .38–.56:
  - prima le corna sfondano la neve, poi escono testa e spalle;
  - il cumulo si spacca in 5–6 zolle che rotolano via (spariscono entro .70).
- .56–.68: si scrolla come un cane (tre torsioni di ±.35, anello di spruzzi).
- .68–.80: il grande respiro: insegna subito il suo segnale.
- .80–1: ruggisce in avanti con la nuvola di fiato; a .98 è nella posa di riposo.

die (4,0 s) «Torna neve», momento clou a .55 (2,2 s)
- .00–.12: barcolla e gli occhi tremolano.
- .12–.32:
  - cade sul ginocchio destro e sulla mano destra;
  - il vento si ferma;
  - esce l'ultimo fiato, una grande nuvola che il vento si porta via.
- .32–.55:
  - la brina sale dai piedi in su e il pelo diventa vetro azzurro (A.ice);
  - gli occhi si spengono a .50;
  - da .45 a .55 crepe bianche gli corrono su per il corpo.
- .55, va in frantumi:
  - 8 grandi pezzi di ghiaccio a facce volano fuori e ricadono intorno (dipendono solo da p);
  - la neve scoppia;
  - le corna cadono, rimbalzano una volta e restano incrociate in cima alla neve.
- .55–.85: la neve si posa in un cumulo basso (60×26) con le corna in cima, come una piccola vetta; scendono i fiocchi.
- .85–1: tutto sfuma.
Nella fase 2 è uguale, coi colori della fase 2, e cadono anche le lame.

LA FASE 2 (o.p2)
Da morbido e bianco diventa duro, blu e spigoloso, e si vede da tutte le direzioni:
- il pelo è gelato, con le ciocche dritte e taglienti;
- il mantello è una crosta di ghiaccio;
- i ghiaccioli sono lunghi il doppio: 3 sotto la barba, 6 sulle frange, 8 sul bordo del mantello, 4 sulle cosce;
- su ogni corno ci sono sei cristalli che puntano in fuori, il più grande in cima alla curva: la testa diventa una corona di ghiaccio spinosa, alta 120;
- gli artigli sono lame da 18 px;
- gli occhi sono bianchi;
- un filo di fiato esce sempre dalla bocca;
- una nebbia fredda cola dal pelo e si allarga a terra;
- la bandiera diventa una piccola bufera di cinque sbuffi;
- cammina più basso, con le lame avanti.

DISEGNI PER IL GIOCO
Li esporta il modello, con la stessa pittura.
- N3.yetiIcicle(x, y, z, sc, o): il ghiacciolo che cade.
  - x, y: il punto a terra; z: l'altezza della punta.
  - Lungo 26 e largo 9, a tre facce, col riflesso bianco e la punta che brilla.
  - o.big: la stalattite gigante (58×22, con le creste e la neve in cima).
  - o.shatter (da 0 a 1): i pezzi che schizzano a terra (6 schegge e uno sbuffo).
  - o.p2: colori della fase 2.
  - Non disegna ombra: l'ombra e il disco rosso li fa il cervello.
- N3.yetiBall(x, y, r, spin, sc, o): la palla di neve di raggio r, appoggiata a terra in (x, y).
  - spin: l'angolo di rotolamento; grumi e solco girano intorno all'asse perpendicolare a o.dir, la direzione in cui rotola.
  - Tre toni, con l'ombra blu e il bordo illuminato.
  - o.p2: crosta brinata. o.shadow: la sua ombra morbida.
  - Serve con raggio da 14 a 30 per la palla che cresce e da 22 a 26 per la valanga.
- N3.yetiShard(x, y, z, a, sc, o): una scheggia di ghiaccio a facce, lunga 12, che vola lungo a, con una scia corta.
- N3.yetiCrescent(x, y, a, w, k, sc, o): la mezzaluna di gelo larga w che vola lungo a.
  - Arco bianco-azzurro col bordo davanti acceso, tre graffi dentro e due ghiaccioli ai capi.
  - k (da 0 a 1) è la sua vita: entra entro .1 e sfuma dopo .9.
- In più N3.meta.yeti2.old: lo Yeti di oggi.

OPZIONI, LOWFX, COSTO
- Opzioni: o.p2 (fase 2), o.z (altezza dei balzi data dal gioco), o.noFx (niente effetti).
- Con LOWFX:
  - niente bagliori, fiocchi risucchiati, bandiera, brillii, nebbia e vento;
  - nella sconfitta 4 pezzi invece di 8;
  - restano il pelo che si gonfia e gli occhi e la gola schiariti a colore pieno.
- Costo: mediana di 1,3 ms al massimo a fotogramma (il Golem fa 1,2).
  - Le direzioni delle ciocche e i cristalli si calcolano una volta.
  - Ci sono 13 lingue di pelo, 3 sbuffi e 8 ghiaccioli.
  - Gli ellCap usano la cache (o.ck), come golem2.js.

CONTROLLI PER IL COSTRUTTORE
1. Foto nella stanza vera (tests/b2g_yeti_*.png), su 390×763 e su 320 px: il bianco non deve superare un terzo della sagoma, e nella fase 2 il pelo deve restare più scuro del pavimento.
2. Girandolo a 360° niente deve strisciare o saltare, e il vento va sempre dalla stessa parte dello schermo.
3. Le corna non tagliano l'occhio, e i cristalli seguono la spirale.
4. Le sopracciglia non coprono gli occhi visti dall'alto.
5. Il gomito sta sempre fuori e indietro, e la mano alzata ordina il suo braccio.
6. Il gonfiarsi cambia i raggi, mai lo scheletro: i piedi non scivolano.
7. Il prologo (91) usa N3.yeti con 'roar' e 'idle' a sc .56 e aggiunge un bagliore suo sugli occhi a z 34, azzurro, quindi il colore va bene. Dopo il sì di Denis va alzato all'altezza nuova degli occhi (circa 86 a sc 1), oppure il prologo tiene il disegno di prima. Il nuovo ruggito dura 3 s, contro 1,4 nel prologo.
8. Rifare le anteprime delle arene (61) con lo Yeti più alto: node tests/anteprime.js yeti2_test.html.

## Le mosse del modello

| id | nome | secondi | descrizione |
|---|---|---|---|
| `idle` | Fermo | 3 | In piedi curvo, peso avanti, braccia appese con gli artigli che sfiorano il ghiaccio davanti ai piedi, testa puntata sull'eroe. Un respiro lento: inspira .00–.45 (petto e gobba +2 px, pelo appena gonfio, A.inh .25), espira .45–.75 con due sbuffi di brina dalle narici a .50 e .58 portati dal vento. Palpebre lente a .35; la mano destra gratta il ghiaccio a .62 e .70 (gli artigli tirano indietro con una scia di brina); alza il muso e fiuta l'aria a .82 e .90. Bandiera di neve, criniera, barba e frange con due onde lente per giro. Fase 2: pelo gelato rigido (solo le punte), ghiaccioli che tintinnano a .2 e .7, nebbia fredda che cola ai piedi, un filo di fiato continuo, cristalli delle corna che pulsano due volte. |
| `walk` | Cammina | 1.3 | Due passi, eretto e curvo, pesante (42 px/s nel gioco). Il piede destro posa a .00, il sinistro a .50: a ogni posata il corpo affonda di 2 px con uno sbuffo di neve e rolla sopra il piede (±.08). Le braccia lunghe pendolano al contrario delle gambe (±12 px) e in fondo al pendolo gli artigli strisciano sulla neve (.22 e .72, uno spruzzo). Testa bassa e ferma sull'eroe; la bandiera sbatte a ogni passo; barba e frange in ritardo. Fase 2: più basso (−4), passo più lungo (±16), le lame avanti. |
| `hit` | Colpito | 0.6 | La testa va indietro, gli occhi si strizzano, un'onda corre nel pelo, la neve cade dalle spalle, la bandiera sussulta; poi torna alla posa. Solo per le pagine: nel gioco i boss non lo usano. |
| `leap` | Balzo del Gigante | 2.4 | Preparazione .00–.22: si accuccia (−10, busto avanti .25), braccia indietro (mani [−14, ±40, 30]), gli artigli raspano il ghiaccio a .10 e .16, prende fiato (A.inh 1 a .20: pelo gonfio, neve risucchiata, occhi accesi). Colpo .22: scatta in alto con lo sbuffo «HAH», braccia lanciate avanti. In aria .22–.80 (altezza dal gioco con o.z; da solo un arco di 60): braccia aperte in avanti con gli artigli spalancati (mani [30, ±48, 60]), gambe raccolte, pelo e bandiera verso l'alto; .74–.80 allunga le mani verso terra. Atterra a .80 a quattro zampe (mani [30, ±34, 0], piedi [−2, ±20, 0], corpo schiacciato −14) con un anello di neve. Ritorno .80–1: si rialza ringhiando, a .90 scuote la neve dalla testa. |
| `bound` | Balzo corto (fase 2) | 1.3 | Il salto corto dei Balzi della bufera: si accuccia .00–.25 (−6, fiato corto A.inh .6), scatta a .25 con un piccolo sbuffo, volo basso .25–.80 (o.z; da solo un arco di 30) con le braccia avanti, atterra a .80 su mani e piedi con un anello piccolo, si rialza .80–1. |
| `pound` | Pioggia di ghiaccioli | 2.2 | Preparazione .00–.26: si raddrizza in tutta la sua altezza (busto −.35, sulle punte +6, testa a 136), braccia larghe in alto con gli artigli aperti (mani [10, ±52, 132]), prende fiato (A.inh 1 a .24); .26–.40 resta in alto e trema. Colpi: schiaffo della mano sinistra a terra a .42 ([36, −30, 0]), della destra a .56 ([36, 30, 0]), di tutte e due insieme a .74 con tutto il peso ([40, 0, 0], corpo −10, busto avanti .45); a ogni schiaffo uno sbuffo, neve che esplode, ghiaccio che si crepa. .74–.88 resta chino e alza la testa al soffitto (−.6) ringhiando a bocca socchiusa: chiama il ghiaccio. Ritorno .88–1. |
| `snowball` | La palla che cresce | 2 | .00–.24 si china (busto avanti .4) e con le due mani arrotola la neve: tra le mani nasce una palla che cresce fino a r 14. .24–.38 la prende nella destra e la porta al fianco ([4, 40, 30]). .38–.56 carica da bocciatore: busto girato (+.5), braccio destro indietro e in basso ([−24, 44, 18]), il sinistro avanti, prende fiato (A.inh .7). Colpo .60: lancio rasoterra, il braccio spazza il pavimento fino a [40, 20, 6], la palla lascia la mano (da lì la disegna il gioco), il corpo segue avanti con lo sbuffo. .60–.82 resta basso a guardarla; .82–1 si raddrizza e si batte le mani a .88 e .95 (sbuffi di neve). Con o.p2 una palla per mano: le arrotola insieme, carica corto (.38–.50), lancia la sinistra a .52 e la destra a .66. |
| `breath` | Soffio gelido | 3 | Preparazione .00–.42, il grande respiro: si alza un poco (+4), testa (−.4) e busto (−.2) indietro, petto e gobba gonfi del 12%, tutto il pelo rizzato, la criniera aperta, la bandiera piegata verso la bocca, fiocchi che corrono in bocca a spirale, brillii sul mantello, da .25 la bocca socchiusa con la gola accesa, occhi stretti (.5), mani aperte ai fianchi. Colpo .42: la testa scatta avanti (+.2), fauci spalancate con le due zannette, lampo alla bocca. .42–.80 soffia: il modello disegna i primi 60 px del vento bianco-azzurro con fiocchi e scintille (il cono intero è del gioco), ci si appoggia dentro (busto avanti .2), il suo vento gli spinge indietro pelo e bandiera, tremito leggero. Ritorno .80–1: chiude la bocca, il pelo si affloscia, un ultimo sbuffo. Nella fase 2 la posa è uguale: il gioco gli gira il corpo per la spazzata. |
| `gasp` | Senza fiato | 1.4 | Il punto debole, dopo il Soffio e il Ruggito: piegato in avanti (.45) con le mani sulle ginocchia ([16, ±30, 28]), testa che pende (+.35), lingua fuori, pelo afflosciato (−4%), spalle che pompano con quattro sbuffi corti (.12, .34, .56, .78), occhi socchiusi e spenti (#4f8fae, niente alone), niente bandiera né brillii; .85–1 scuote la testa e si raddrizza. |
| `roar` | Ruggito della valanga | 3 | Fase 2 (il nome 'roar' resta: lo usa il prologo). .00–.30 si raddrizza in tutta la sua altezza e si batte il petto coi pugni a .10 (sinistro), .18 (destro), .26 (sinistro): un anello bianco dal petto e un sussulto a ogni colpo, il fiato che si gonfia (A.inh 1 a .30). .30–.70 butta la testa indietro (−.7) e ulula al cielo a bocca spalancata: una colonna di fiato che sale, braccia spalancate (mani [0, ±60, 100]), tutto il corpo che trema (7 Hz). .70–1 ricade curvo e ansima (sbuffi a .78 e .90). |
| `claws` | Artigli di ghiaccio (fase 2) | 1.9 | .00–.30 si alza sulle gambe (−.15) col braccio destro caricato in alto dietro la testa ([−10, 30, 128]); sulle lame la luce corre dalle nocche alle punte, prende fiato. Colpo .48: squarcia l'aria in diagonale da destra in alto a sinistra in basso (mano fino a [40, −20, 20]), lampo delle punte e tre righe bianche nell'aria. .48–.64 lo slancio lo gira (−.4) e il braccio sinistro risale ([−10, −30, 128]). Colpo .66: seconda artigliata nell'altra diagonale (fino a [40, 20, 20]). Ritorno .66–1, uno sbuffo a .80. |
| `rage` | Furia (fase 2) | 3 | Nessun danno. .00–.12 barcolla indietro e scuote la testa. .12–.45 si raddrizza e si batte il petto quattro volte sempre più forte (.16, .24, .32, .40): a ogni colpo la brina corre sul pelo dal petto in fuori e lo ghiaccia, i colori passano alla fase 2 in quattro scatti morbidi (A.k2 .25, .5, .75, 1), le ciocche si irrigidiscono, crescono i ghiaccioli sotto barba, frange e mantello, il mantello diventa crosta di ghiaccio. .45–.62 le corna scricchiolano: i cristalli crescono lungo le spirali dalla base alla punta (.46–.60); gli artigli gelano in lame in tre «crac» (.50, .54, .58: 9, 13, 16, 18 px). .62–.90 ulula al cielo (testa −.7, bocca spalancata, braccia aperte): esplosione di brina, a .64 gli occhi diventano bianchi, la bandiera diventa una piccola bufera. .90–1 scende nella posa della fase 2 (più basso, lame avanti). Dipende solo da A.k2, non da o.p2. |
| `taunt` | Presa in giro | 1.2 | «Vieni qui». .00–.15 si sporge verso l'eroe (.2). .15–.55 allunga il braccio destro lunghissimo col palmo in su ([56, 16, 50]) e piega due volte l'artiglio dell'indice (.30 e .45). .58–.90 si raddrizza, butta un po' indietro la testa e ride «hoo-hoo-hoo» in tre sbuffi (.62, .72, .82; la bocca si apre a .4), occhi socchiusi come se sorridesse, le zannette in vista, le spalle che sobbalzano. .90–1 torna curvo. |
| `enter` | Entrata | 3.4 | «La valanga lo porta». .00–.16 un fronte di neve largo 70 e alto 30, con due o tre palle che rotolano dentro, scivola da 90 px dietro di lui fino al suo posto e si ammucchia in un cumulo (largo 80, alto 42). .16–.30 il cumulo respira: sale e scende, due sbuffi di brina a .20 e .27. .30–.38 nella neve si aprono due occhi azzurri con la lucina e spuntano le punte delle corna. .38–.56 si alza: prima le corna sfondano la neve, poi testa e spalle; il cumulo si spacca in 5–6 zolle che scivolano e rotolano giù (via entro .70); resta in piedi curvo. .56–.68 si scrolla come un cane: tre torsioni (±.35), pelo in fuori, anello di spruzzi. .68–.80 il grande respiro (insegna il suo segnale). .80–1 ruggisce in avanti con la nuvola di fiato; a .98 è nella posa di riposo. |
| `die` | Sconfitta | 4 | «Torna neve», clou a .55 (2,2 s). .00–.12 barcolla, gli occhi tremolano tre volte. .12–.32 cade sul ginocchio destro e sulla mano destra, la testa si abbassa, il vento si ferma (ciocche immobili, bandiera spenta), l'ultimo fiato in una grande nuvola di brina che il vento si porta via. .32–.55 la brina sale dal pavimento: il pelo diventa vetro azzurro dai piedi in su (A.ice, brillii bianchi), gli occhi si spengono a .50, crepe bianche corrono su per il corpo (.45–.55). .55 va in frantumi: otto grandi pezzi di ghiaccio a facce volano fuori e ricadono intorno, scoppio di neve; le corna cadono, rimbalzano una volta e restano incrociate in cima alla neve. .55–.85 la neve si posa in un cumulo basso (largo 60, alto 26) con le corna in cima, come una piccola vetta; fiocchi. .85–1 pezzi e cumulo sfumano. Fase 2 uguale, coi suoi colori, e cadono anche le lame. LOWFX: quattro pezzi. |

## Le abilità nel gioco

IL CERVELLO NEL GIOCO
File src/js/89-yeti-nuovo.js, fatto come 89-golem-nuovo.js. Si accende solo se c'è N3.yeti2. Si prova prima col modello finto anteprime/boss2/yeti_stub.js: lo Yeti di oggi che fa le mosse nuove, con le durate nuove (bound → leap, breath → roar, gasp → idle, claws → pound, rage → hit, taunt → idle, enter → idle, die → hit).

COLLEGAMENTI
- Il modello nuovo:
  - N3.yeti = N3.yeti2;
  - N3.meta.yeti = la meta di yeti2, con .old (il disegno di oggi, per le pagine).
- Valori:
  - ET.yeti: r 34; hp 4.700, cdmg 25, nome e titolo come oggi;
  - BOSS_INTRO.yeti 3,4;
  - BDEATH.yeti {dur:4, clou:2.2, snd:'icicles'};
  - B2H.yeti 100;
  - B2T.yeti [['150,215,255','90,160,255'],'235,245,255'];
  - RUNEC.yeti ['150,215,255','90,160,255'];
  - ECOL.yeti '#6c84bd'.
- Da spegnere del 2D di oggi:
  - B2.yeti.back: la cresta di punte di ghiaccio, che ricorda le pietre del Golem;
  - in B2.yeti.front il fiato, i brillii e i motes calcolati sulla testa vecchia: resta solo la neve che cade intorno (l'emettitore 'sn');
  - ETELE.yeti vuoto.
- Ombra: ESHADOW.yeti a 46×15 con .45, che si rimpicciolisce con e.z. Nell'entrata è nascosta fino a 0,55 s.
- Restano B2G.yeti e B2HEAVY.
- Cosa si sostituisce, come per il Golem:
  - EUPD.yeti al posto di quello di 31-cap4-boss.js;
  - l'entrata di bossIntro3 (32): bossIntro avvolto;
  - la sconfitta BDIE.yeti con la foto (60): snapBoss → {live:1}, BDIE.yeti col modello, drawCorpse avvolto.
- n3Move avvolto per lo Yeti:
  - nell'entrata ['enter', iT/3,4];
  - in ogni stato che è una mossa del modello, tranne 'walk': [e.st, min(.999, e.mt/e.std)], con e.std la durata data a b3go.
  Così il modello va al passo del cervello. Serve perché 64 non conosce la velocità 1,25 della fase 2 dello Yeti.
- N3G.wp.yeti viene da e.wt (durata 1,3); N3G.zm.yeti resta.
- B3S.add('yeti') (voce e personalità di 88), B2CALM.add('gasp').
- B3VO.prep('yeti') nelle stanze dell'arena 4 (ARENAS[3]) e quando lo Yeti è nella stanza.

IL TEMPO
- Fase 2: tutto 1,25 volte più rapido. In EUPD.yeti dt *= (e.p2 ? 1,25 : 1), poi b3tick. Il dt arriva già moltiplicato per bossLvl().spd, che nell'arena 4 arriva a 1,18.
- Un avviso legato a una mossa dura nel tempo vero Δp·D/(sp·spd). Tutti hanno almeno 0,9 s del modello, così anche nel caso peggiore (arena 4 con tutte le coppe, in fase 2: fattore 1,475) restano sopra 0,6 s.
- I pericoli che vivono da soli (ghiaccioli, stalattite, palle, fronti della valanga, mezzelune, schegge) vanno a tempo vero, nell'update avvolto come g2update, e non si accelerano mai.
- Quando lo Yeti è in aria (e.z > 20) non si colpisce (canHit).

CAMMINATA
- 'walk' per 1,1–1,6 s del modello dopo ogni mossa: navAngle e moveCircle a 42 px/s (×1,25 nella fase 2), con e.moving = true.
- A ogni passo (fase .0 e .5 della camminata): stepFx, una scossa da 1,5 e un'orma.
- 'taunt': lo fa partire 88 mentre cammina. Nel cervello: b3tick, fermo, faccia verso l'eroe, poi 'walk' per 0,6–1 s.

FASE 1
Ordine: Balzo, Pioggia, Palla, Soffio con Senza fiato, poi da capo. A fine entrata e.si = −1, così la prima mossa è il Balzo: lo Yeti è lontano dall'eroe e ci arriva saltando.

1. BALZO DEL GIGANTE · 'leap' (2,4 s)
- .00: faccia verso l'eroe.
- .22: scatta. Sotto l'eroe compare un cerchio rosso r 54 con l'ombra scura che cresce. e.tx ed e.ty stanno dentro L+e.r…R−e.r e TOP+e.r…BOT−e.r. Fino a .40 il cerchio insegue l'eroe a 130 px/s, più piano di lui.
- .40: il cerchio si blocca, con un lampo bianco e sfx 'click'.
- .22–.80, volo:
  - u = (k−.22)/.58, posizione dal punto di partenza al cerchio con u²(3−2u);
  - e.z = 150·sin(πu).
- .80, atterraggio:
  - 26 di danno nel cerchio (distanza < 54 + P.r·.4, se l'eroe non scatta e non è invulnerabile);
  - 12 schegge 'yice' a raggiera, girate a caso: 140 px/s, r 6, 10 di danno; 16 nella fase 2;
  - una chiazza di brina che rallenta: addZone r 56, 3 s.
  - Arena: crater 36, ENV2.mark('frost', 60), ENV2.rocks(190, 3), ENV2.fall(10, true), ENV2.chunks(16, ICE_T, 150), shake 9, vib, sfx 'boom'.
- Avviso dopo il blocco: 0,96 s del modello.
- Come si schiva: uscire dal cerchio dopo il blocco, poi passare tra le schegge, che sono lente.

2. PIOGGIA DI GHIACCIOLI · 'pound' (2,2 s)
- .00:
  - la faccia si blocca (e.lf);
  - compaiono tre dischi rossi che si riempiono, nei punti del modello (g2pt con e.lf): sinistro [36, −30] r 34 fino a .42, destro [36, 30] r 34 fino a .56, davanti [40, 0] r 46 fino a .74.
- .42: 20 di danno nel disco sinistro e un ghiacciolo dove sei.
- .56: 20 nel disco destro e un ghiacciolo dove sei. Nella fase 2 i ghiaccioli sono due: dove sei e dove stai andando (P + velocità·0,6 s).
- .74: 24 nel disco davanti e due ghiaccioli (dove sei e dove stai andando).
- In tutto 4 ghiaccioli; nella fase 2 5, più la stalattite.
- Ogni ghiacciolo:
  - disco rosso r 20 e ombra che cresce per 0,85 s veri;
  - negli ultimi 0,25 s cade da z 320 (N3.yetiIcicle);
  - 14 di danno se sei nel disco;
  - si frantuma (o.shatter), lascia brina r 20 per 2,5 s, sfx 'iceBreak', shake 2.
- .80: ENV2.fall(6, true).
- Fase 2, a .86: la stalattite gigante sopra l'eroe:
  - disco rosso r 40 e ombra per 1,1 s veri;
  - 22 di danno nel disco;
  - scoppia in 6 schegge 'yice' (10, 140 px/s) e lascia brina r 40 per 3 s; shake 6.
- Arena: crepe r 22 sotto ogni mano; al colpo doppio un cratere e ENV2.rocks(150, 2).
- Come si schiva: stare lontano dalle mani e non fermarsi mai, perché ogni ghiacciolo cade dove eri.

3. LA PALLA CHE CRESCE · 'snowball' (2,0 s)
- .14: dalla mano destra parte una corsia rossa tratteggiata larga 56, con la freccia, fino al primo muro o blocco (al massimo 320 px). Segue l'eroe, girando al massimo di 90°/s.
- .40: la corsia si blocca (piena, lampo, clic).
- .60: la palla parte dal punto del modello [30, 16, 6]. Nella fase 2 le palle sono due: la sinistra a .52 da [30, −16, 6] con a−22°, la destra a .66 con a+22°.
- Come rotola, come nei cartoni:
  - parte con r 14 a 130 px/s;
  - cresce di 5 px al secondo fino a r 30 e accelera fino a 145 px/s, sempre più piano dell'eroe (150);
  - gira verso l'eroe al massimo di 55°/s;
  - sotto ha un anello rosso, che è il suo avviso mentre rotola.
- Come finisce:
  - se tocca l'eroe: 20 di danno e una spinta (160 px/s per 0,25 s), poi si sbriciola;
  - si spacca contro un blocco di ghiaccio o un muro: il blocco trema e perde la neve;
  - dopo 3,5 s si affloscia in un cumulo (frost r 26, 3 s);
  - due palle che si toccano scoppiano.
- Come si schiva: uscire dalla corsia, poi farla sbattere contro un blocco o un muro, oppure scappare.
- Nessuna mossa nuova mentre rotola: la camminata dura finché c'è una palla.

4. SOFFIO GELIDO · 'breath' (3,0 s) poi SENZA FIATO · 'gasp' (1,4 s)
- .02:
  - compare un cono rosso dal punto a terra sotto la bocca (modello [46, 0, 0]): 60°, lungo 270;
  - segue l'eroe al massimo di 70°/s;
  - si ferma contro i blocchi di ghiaccio (un raggio ogni 3°, ognuno fino al primo blocco);
  - dietro ogni blocco resta uno spicchio sicuro, a righe azzurre chiare.
- .12: il cono si blocca (lampo, clic).
- .42–.80, il soffio:
  - il fronte avanza a 520 px/s;
  - all'eroe dentro il cono, più vicino del fronte e non dietro un blocco: 8 di danno ogni 0,3 s veri (al massimo 3 volte), P.mire = max(P.mire, 1,2) (passo al 55%), una spinta di 40 px/s;
  - il cervello disegna il cono di vento e fiocchi;
  - b3say 'c_breath' a .42.
- Dopo il soffio, lungo l'asse (prima di un blocco): brina r 28 per 4 s a 70, 130, 190 e 250 px, più ENV2.mark('frost'). Le torce dentro il cono fanno b3torch('blue', 1,5).
- Poi 'gasp': i colpi fanno +50% (hurtE avvolto, come i Pugni incastrati del Golem). La prima volta nella partita compare la scritta «Senza fiato!» (#ffd84a, 18).
- Come si schiva: andare di lato, allontanarsi oltre 270 px o mettersi dietro un blocco. Poi colpirlo forte.

PASSAGGIO ALLA FASE 2 · 'rage' (3,0 s), nessun danno
- Parte a metà vita, mai in aria: se è in volo ('leap' tra .22 e .80, 'bound' tra .25 e .80) aspetta che atterri.
- All'inizio:
  - banner('Lo Yeti scatena la valanga', 'Fase 2', 1,6), bossRage(e, '90,160,255'), la barra in rabbia;
  - via G.y2 e G.eproj;
  - e.shell = 9, rimesso a 0 alla fine;
  - voce 'angry'.
- Tonfi del petto a .16, .24, .32, .40; «crac» dei cristalli a .50, .54, .58.
- .62, l'ululato: sfx 'roar', shake 8, vib, tre anelli bianchi, b3torch('blue', 4), ENV2.fall(14, true). Da qui parte la bufera.
- La prima mossa della fase 2 è il Ruggito della valanga.

FASE 2
Ordine: Ruggito con Senza fiato, Balzi della bufera, Artigli, Pioggia con la stalattite, Soffio che spazza con Senza fiato, Palla doppia, poi da capo.

5. RUGGITO DELLA VALANGA · 'roar' (3,0 s) poi 'gasp'
- .10, .18, .26: colpi sul petto (fThump, anello bianco).
- .30, l'ululato: b3say 'c_howl' con force, b3torch('blue', 3), shake fino a .70, ENV2.fall(12, true).
- Le corsie:
  - il pavimento si divide in 6 corsie, dal muro in alto a quello in basso, larghe (R−L)/6;
  - 4 sono rosse, a strisce; 2 sono libere, e una di quelle libere ha il centro a meno di 140 px dall'eroe;
  - in cima allo schermo (G.vy + 70) una freccia rossa pulsa sopra ogni corsia rossa.
- .70, prima ondata:
  - in ogni corsia rossa scende dal muro in alto un fronte di neve largo quanto la corsia e alto 44, con dentro 2 palle (N3.yetiBall r 24), a 260 px/s;
  - se ti prende (|P.y − y del fronte| < 22 + P.r e sei dentro la corsia): 20 di danno, una volta per ondata, e una spinta in giù (200 px/s per 0,25 s).
- Ripari: sotto un blocco di ghiaccio (k.x ± k.r) il fronte si spezza e resta libero fino al muro in basso; lo stesso sotto lo Yeti (e.x ± e.r).
- In fondo i fronti lasciano cumuli di neve: frost r 22, 4 s.
- Seconda ondata:
  - parte 1,4 s veri dopo la prima, con le corsie libere spostate di una e mai sulle stesse;
  - le sue corsie e le sue frecce compaiono quando parte la prima ondata.
- Nessuna mossa nuova finché ci sono fronti; poi 'gasp' (+50%).
- Come si schiva: andare nella corsia libera vicina, poi spostarsi di una; oppure mettersi sotto un blocco di ghiaccio.

6. BALZI DELLA BUFERA · 'bound', 'bound', 'leap' (una sola mossa nell'ordine)
- 'bound' (1,3 s):
  - .00: un cerchio rosso r 44 fermo dove sei;
  - .25–.80: volo, con e.z = 60·sin(πu);
  - .80: atterra; 18 di danno nel cerchio, brina r 30 per 2 s, crepe, ENV2.rocks(120, 1,5), shake 5.
- Subito dopo un secondo 'bound', poi il Balzo con 16 schegge. Il ritmo è «salto, salto, SALTO», senza camminare in mezzo.

7. ARTIGLI DI GHIACCIO · 'claws' (1,9 s)
- .00: una banda rossa larga 80 parte dalla mano destra ([30, 30, 0]) verso l'eroe e arriva fino al muro o al primo blocco; si riempie fino a .48.
- .18: una seconda banda parte dalla mano sinistra ([30, −30, 0]) verso dove sei adesso e si riempie fino a .66. Le due bande si incrociano a X.
- .48 e .66: una mezzaluna di gelo (N3.yetiCrescent, larga 80) vola lungo ogni banda a 300 px/s.
  - Danno: 16 a mezzaluna, una volta, se sei a meno di 40 + P.r·.5 dalla sua linea e a meno di 14 px dal suo centro.
  - Si rompe contro un blocco e lo crepa.
  - Lascia 4 solchi d'artigli sul pavimento.
- Come si schiva: un passo fuori da ogni banda, due volte a tempo, oppure lo scatto attraverso.

8. SOFFIO CHE SPAZZA
- Come il Soffio, ma il cono è di 40° e lungo 300.
- A .12 la spazzata si fissa: da a0 = angolo bloccato − s·55° ad a1 = angolo bloccato + s·55°, con s verso il lato con più spazio.
- L'avviso: tutto il ventaglio tratteggiato, il primo spicchio pieno e una freccia nel verso.
- Da .42 a .80 il cono gira da a0 ad a1 e porta con sé e.face. Poi 'gasp'.

9. PALLA DOPPIA: le due palle a V (vedi la mossa 3).

I PERICOLI (G.y2)
- G.y2 si rimette a posto in buildRoom e nella Furia. Contiene: warn, cone, lanes, fronts, ice, balls, cres, prints, arrows, snow.
- Si disegnano avvolgendo drawHazards2Ground (avvisi, ombre, anelli, orme, cono) e drawHazards2Air (ghiaccioli, palle, fronti, mezzelune, bufera).
- EPDRAW.yice usa N3.yetiShard; TRC.yice '150,220,255'.
- Ogni disegno del modello va in un try, con un disegno semplice di riserva, come g2art.

ENTRATA (bossIntro avvolto per 'yeti', 3,4 s)
- 0: sfx 'quake', shake 2. Neve e ghiaccio cadono dal cancello per 0,5 s; ENV2.fall(6, true).
- 0,40: arriva il fronte. Shake 5, 'boom' basso, sbuffo bianco senza danno, dustRing.
- 0,68 e 0,92: i respiri del cumulo.
- 1,02: si aprono gli occhi; voce 'growl'.
- 1,36, 1,56 e 1,77: le zolle si spaccano (sfx 'iceBreak').
- 1,97, 2,11 e 2,24: la scrollata.
- 2,31: il fiato.
- 2,72: il ruggito. Voce 'cry' con l'eco, b3torch('blue', 2), ENV2.fall(10, true), shake 6, vib, tre anelli.
- Per tutta l'entrata e.em = .999 fino a 3,3 s, poi 1. Alla fine 'walk' per 0,9 s.

SCONFITTA (BDIE.yeti come quello del Golem)
- setup: via G.y2, voce 'die', sfx 'freeze', c.live = 1.
- Fino a 2,2 s: cpart 'frost' che sale.
- 2,2 s, il clou: shake 12, 'boom' e 'icicles', neve.
- Poi la bufera si ferma.
- VINTO resta com'è.

VOCE (B3VO.VB.yeti)
- Volume e regole:
  - volume medio 0,07–0,11;
  - nessun verso sopra l'altro: almeno 2,4 s prima di un lamento, 1,2 s prima del verso di una mossa.
- La gola: profonda e cava, da gorilla, più alta del Golem (85–160 Hz).
- La firma è l'eco della montagna:
  - dopo cry, angry, c_howl, die e win lo stesso verso torna due volte;
  - a 0,38 e 0,76 s, a −8 e −14 dB, con un passa-basso;
  - si fa in b3sayMore.
- Il fiato risucchiato:
  - un soffio che sale da 500 a 2.200 Hz, con tre note di vetro mi, sol, si (MIDI 76, 79, 83);
  - quando parte nelle mosse: leap .04, bound .02, pound .04, snowball .40, breath .02, roar .02, claws .04;
  - quanto dura, in s del modello: .4, .2, .45, .3, 1,2, .6, .4;
  - nel tempo del boss: diviso per sp·spd.
- Lo sbuffo «HAH» nei colpi: leap .22, bound .25, pound .42/.56/.74, snowball .60, claws .48/.66.
- Il petto: fThump da 72 a 40 Hz.
- B3CUE.yeti, alla partenza della mossa:
  - c_leap «hrrr…»;
  - c_bound «hup!»;
  - c_pound «hrrrAH!»;
  - c_snowball «hnnf»;
  - c_roar, un ringhio corto;
  - c_claws «grrr».
- Altri versi:
  - cry «HOOOAARRGH», 2 s;
  - angry;
  - laugh «hoo-hoo-hoo»;
  - laugh2 «hrrrm… hoo?»;
  - hurt «uhnn»;
  - growl;
  - c_breath «HHHAAAA»;
  - die, un lamento nel vento;
  - win «hoo-hoo-hoo-HOOO», col tamburo del petto.
- Personalità, quella di 88: ti prende in giro quando ti colpisce; ti chiama se non lo colpisci per 7 s; si lamenta se lo colpisci forte; ride se cadi.

L'ARENA CHE REAGISCE
- Orme a tre dita (rgba(40,60,110,.28)) che svaniscono in 8 s, al massimo 14.
- Balzo: cratere, brina, blocchi che tremano, ghiaccioli finti dal soffitto.
- Pioggia: crepe sotto le mani.
- Palla: una scia di neve; i blocchi colpiti tremano.
- Soffio: un ventaglio di brina e le torce blu.
- Ruggito: tutte le torce blu, cumuli lungo il muro in basso.
- Artigli: solchi che restano.
- Fase 2, la bufera:
  - 12 strisce di neve in diagonale, alfa .18–.3, sotto gli avvisi, mai un velo;
  - con LOWFX 6 strisce ferme;
  - si ferma alla sconfitta.

COSA RESTA DEL BOSS DI OGGI
- La Tana dello Yeti con i 4 blocchi di ghiaccio.
- Nessun servitore.
- La musica yetiM.
- La frase della fase 2.
- La brina che rallenta.
- BBFX.yeti, B2G.yeti.
- Il cervello vale anche nell'Abisso (lo Yeti torna nella stanza 5 di un giro ogni quattro) e con «Stanze piccole» (6 corsie da 52 px): tutto si calcola su L, R, TOP, BOT.
- Dopo il sì di Denis vanno aggiornati: la guida (44), il prologo, le miniature delle arene.

BCL.yeti
- n 'Yeti delle Vette', arena 3, p2 true.
- enter: G.arena = 3, il suo capitolo e la sua difficoltà, G.bossLvl = null, G.room = ROOMS, G.event = null, poi buildRoom().
- moves ['leap','pound','snowball','breath','gasp'], moves2 ['rage','roar','bound','claws'].
- hz: cerchi, ghiaccioli, stalattiti, palle, schegge, cono, corsie, fronti, mezzelune, chiazze.
- voice ['cry','laugh','angry','die'].

NUMERI
Vita 4.700 e danno a contatto 25, come oggi. Danni (prima di DMG()):
- balzo 26, schegge 10;
- balzo corto 18;
- schiaffi 20/20/24, ghiaccioli 14;
- stalattite 22, più le sue schegge da 10;
- palla 20;
- soffio 8×3;
- valanga 20;
- mezzelune 16.
Si misurano con node tests/boss2diff.js yeti contro lo Yeti di oggi. Se la fase 2 pesa troppo si toglie prima il secondo Balzo corto, poi gli Artigli.

## Voti del direttore artistico

«re» 8,4/10 · «ghiacciaio» 7,4/10 · «tormenta» 6,8/10. La base è «re».

«re» (8,4). Ha il personaggio più possente e le abilità migliori:
- un gigante solenne che sta fermo come una roccia e ti fiuta;
- il Balzo che ti insegue, si ferma e cade;
- la Pioggia a ritmo (bum, bum, BUM), col soffitto che gli risponde;
- la palla di neve che cresce;
- il Soffio, che i blocchi di ghiaccio della sua stanza fermano, con il momento «Senza fiato» dopo;
- la Valanga a corsie, che finalmente rende vero il suo titolo;
- un'entrata e una sconfitta che chiudono il cerchio (la montagna si sveglia, la montagna torna neve);
- l'eco della montagna nella voce e la regola più chiara per un bambino.
Ha quattro difetti seri:
1. È bianco su un pavimento quasi bianco (#bccbd8). È il difetto dello Yeti di oggi, e nella fase 2 (#d0e4f4) peggiora.
2. La posa china sulle nocche è quella del Golem, e anche l'andatura.
3. La corona di corna di ghiaccio che si accende è il Cervo d'Aurora: anche lui ha corna di cristallo luminose ed è bianco in una stanza bianca. In più sarebbe il terzo re con la corona, dopo il Re Rospo e la Regina.
4. Le onde d'urto dopo il balzo e dopo i pugni sono del Golem, e «tormenta» è la parola della Regina.

«ghiacciaio» (7,4). Ha la soluzione di colore migliore: criniera bianca sopra un corpo blu polvere, pelle blu notte. Poi le corna da montone, il gigante buono che piace ai bambini, l'arrivo con la valanga, le tre note del suo tema nel conto. Ma il cuore del personaggio è quello del Golem:
- tre rune sul petto e, nella fase 2, la lastra che esplode e mostra il cuore (la fase 2 del Golem è proprio il cuore che si spacca);
- l'armatura di ghiaccio colato ne fa mezzo golem.
Inoltre:
- ha sette mosse, con una Zampata a sorpresa;
- toglie la morte in frantumi che Denis ha già approvato;
- l'entrata vuole la telecamera sul muro in alto, e oggi nelle stanze grandi il muro in alto è fuori inquadratura.

«tormenta» (6,8). Ha il contrasto migliore (blu tempesta) e la vetta col pennacchio di neve, l'immagine più bella delle tre. Ha anche il linguaggio del corpo e la presa in giro migliore («vieni qui» con l'artiglio). Ma:
- «Bestia» è nel titolo, e Denis ha tolto la Bestia;
- «tormenta» è la fase 2 della Regina;
- sparire nel bianco e scartare lo rendono sfuggente, non possente, con 2–2,5 s in cui non si può colpire: frustrante;
- «lento e poi uno scatto» è il linguaggio della modalità Zombie;
- gli occhi gialli rompono il prologo;
- perde il Balzo.

Il design finale.
- Da «re»: il gigante solenne, quasi tutte le abilità coi loro ritmi, il Senza fiato, la valanga a corsie, gli artigli della fase 2, l'entrata «la montagna si sveglia», la sconfitta «torna neve» col cumulo, l'eco nella voce.
- Da «ghiacciaio» e «tormenta»:
  - il pelo a due toni (corpo blu ghiacciaio sotto un mantello di neve, col bianco solo in alto), per staccarsi dal pavimento;
  - le corna scure da montone al posto della corona di ghiaccio;
  - la posa in piedi, curva, con le braccia che pendono fino alle ginocchia (mai sulle nocche).
- Dalla «tormenta»: la gobba innevata come una vetta, con la bandiera di neve che il vento strappa, e la presa in giro «Vieni qui».
- Dal «ghiacciaio»: l'arrivo con la valanga, messo dentro l'entrata di «re», e le tre note mi-sol-si nel fiato.

Cosa cambia rispetto a «re»:
- Il segnale diventa IL RESPIRO al posto della corona: il pelo si gonfia e la neve della stanza gli corre in bocca.
- La corona torna solo nella fase 2, come cristalli blu sulle corna scure.
- Via le onde d'urto.
- La palla di neve non rimbalza (sarebbe la Valanga del Golem): ti insegue crescendo, come nei cartoni, e si rompe contro i blocchi di ghiaccio.
- Via la parola «tormenta»: gli artigli diventano «Artigli di ghiaccio».
Il personaggio si chiama «la Montagna che Respira»; nel gioco nome e titolo restano quelli di oggi.
