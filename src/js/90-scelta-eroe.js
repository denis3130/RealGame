// =====================================================================
// THE MAKING OF THE HERO (Denis, 14 October: «vorrei che fosse la scelta come quella dei dark souls», then «migliora il tutto»). At the
// very first launch the intro plays first, then this screen, like the character creation of Dark Souls: black all round, a hard light
// from above, the hero big in 3D in the middle of it, turning slowly (a finger turns him, a tap makes him shoot), dark panels over the
// scene. First a warning (Denis, 15 October: «un allert prima della creazione che ti avverte che potrai cambiare aspetto ecc del pg solo
// pagando dopo che l'hai creato»), then four steps:
//   I   Classe   the five heroes that can be picked on the left (Arciere, Cacciatrice, Bardo, Alchimista, Ninja; Denis, 15 October:
//                «rimuovi il balestriere ed il druida dalla creazione»: they are bought in the hero tab as before), each one comes onto
//                the stone his own way (the Arciere drops from above, the Cacciatrice spins in, the Bardo plays a chord, the Alchimista
//                and the Ninja come out of a puff of smoke), his numbers on the right, his story underneath;
//   II  Aspetto  his mantle (the game's mantles, SKINS: changed later in the Profile like the ones of the pass) and his own look:
//                skin, eyes and their colour, brows, scars and marks, hair and its colour, accessories (SAVE.look, every hero; the camera
//                comes close to his face); changed later at the barber in the Profile, for crystals;
//   III Dono     the gift to start with, in 3D on the rune stone in the hero's place (a sack of gold, crystals, a silver chest, the
//                falcon ring, the phoenix feather);
//   IV  Nome     his name (SAVE.pname, seen in the Profile), a summary, «Inizia»: he shoots into the sky, «Il viaggio ha inizio».
// The hero picked is free and is yours; the other four cost 3.000 gold each in the hero tab (SAVE.starter); the Balestriere and the
// Druida keep their prices. Shown once: a save that has a starter, or games played, never sees it again; closed
// half way, it comes back over the menu.
// =====================================================================
const SCE_IDS=STARTERS,SCE_FREE=STARTERS,SCE_PRICE=3000;
// rgb: the colour of the runes, the sparks and the name; the: with its article; ent: how he comes onto the stone; snd: his shot's sound and
// rel: when it leaves him (part of the move)
const SCE_INFO={arciere:{rgb:'92,222,200',hex:'#5cdec8',the:"l'Arciere",twang:null,ent:'drop'},cacciatrice:{rgb:'255,140,190',hex:'#ff8cbe',the:'la Cacciatrice',twang:'arco_ricurvo',ent:'spin'},
  bardo:{rgb:'255,206,90',hex:'#ffce5a',the:'il Bardo',ent:'chord',snd:'chord',rel:.02},alchimista:{rgb:'123,240,106',hex:'#8af27a',the:"l'Alchimista",ent:'smoke',snd:'flask',rel:.54,smoke:'120,200,100'},
  ninja:{rgb:'184,166,255',hex:'#b8a6ff',the:'il Ninja',ent:'shadow',snd:'star',rel:.48,smoke:'110,92,170'},
  balestriere:{rgb:'150,190,255',hex:'#a9c8ff',the:'il Balestriere'},druida:{rgb:'123,240,168',hex:'#7bf0a8',the:'il Druida'}};
const SCE_LORE={arciere:'Il veterano della cripta: equilibrato in tutto, non ha un punto debole e non perde mai la calma.',
  cacciatrice:'Rapidissima e sfuggente: colpisce di lato e sparisce prima che il nemico si giri. Ma bastano pochi colpi a fermarla.',
  balestriere:'Lento e corazzato. Ogni dardo è un macigno: trapassa i nemici e li spinge via.',
  druida:'Parla con il bosco: le radici lo proteggono e lo curano mentre combatte.',
  bardo:'Gira la cripta con il liuto in spalla. Le sue note saltano da un nemico all\'altro, e quando canta la sua ballata anche i mostri si fermano ad ascoltare.',
  alchimista:'Ha passato la vita tra fiale e alambicchi. Ogni fiala che lancia scoppia in una nube di veleno che resta a terra: meglio stargli lontano.',
  ninja:'Il più veloce di tutti, e il più fragile. Lancia tre stelline alla volta, poi sparisce in una nuvola di fumo prima che tu lo veda.'};
const SCE_STEPS=[{t:'Chi vuoi essere?',l:'Classe'},{t:'Il tuo aspetto',l:'Aspetto'},{t:'Scegli un dono',l:'Dono'},{t:'Come ti chiami?',l:'Nome'}],SCE_NUM=['I','II','III','IV'];
// the mantles: '' is the hero's own colours; the others are skins of the game (SKINS), which every save owns
const SCE_MANTI=[{id:'',n:'Originale',d:'I colori di sempre.'},
  {id:'brace',n:'Brace',sk:'Manto di brace',d:'Rosso come il fuoco del Cuore del Vulcano.',body:'#8a2a1e',hood:'#d4492f',belt:'#4a2a1a'},
  {id:'muschio',n:'Muschio',sk:'Manto di muschio',d:'Verde come la cripta dove tutto comincia.',body:'#3f7a2a',hood:'#6cae3c',belt:'#6b4a2a'},
  {id:'notte',n:'Notte',sk:'Manto della notte',d:'Blu come il cielo sopra i Picchi di Brina.',body:'#26386e',hood:'#4a6bc4',belt:'#8a6a3a'},
  {id:'strega',n:'Strega',sk:'Manto della strega',d:'Viola come le radici della Strega.',body:'#4e3278',hood:'#8c5cc4',belt:'#3a2a1d'},
  {id:'corvo',n:'Corvo',sk:'Manto del corvo',d:'Nero come le ali dei corvi del camposanto.',body:'#2e313a',hood:'#4d5260',belt:'#8a5a2a'},
  // more mantles (Denis, 15 October: «mantelli nuovi»)
  {id:'reale',n:'Reale',sk:'Manto reale',d:"Viola e oro, come i re dell'Età Antica.",body:'#4b2a72',hood:'#d4a83a',belt:'#2a1a3a'},
  {id:'ghiaccio',n:'Ghiaccio',sk:'Manto di ghiaccio',d:'Bianco e azzurro come la neve dei Picchi.',body:'#4f86b8',hood:'#e6f0f8',belt:'#2e4a6a'},
  {id:'tramonto',n:'Tramonto',sk:'Manto del tramonto',d:'I colori del cielo quando il sole scende sui campi.',body:'#c8542a',hood:'#f2a83a',belt:'#5a2a1a'},
  {id:'mare',n:'Mare',sk:'Manto del mare',d:'Blu profondo e spuma bianca, come le onde.',body:'#1f4f8a',hood:'#46b8c8',belt:'#e8d8b0'},
  {id:'ciliegio',n:'Ciliegio',sk:'Manto del ciliegio',d:'Rosa come i fiori di ciliegio in primavera.',body:'#b04a7a',hood:'#f39ac0',belt:'#5a2440'},
  {id:'brace_nera',n:'Rubino',sk:'Manto di rubino',d:'Nero come la notte, con il rosso di un rubino.',body:'#24222a',hood:'#b8283a',belt:'#4a4a54'}];
const SCE_MANTO=Object.fromEntries(SCE_MANTI.map(m=>[m.id,m]));
for(const m of SCE_MANTI)if(m.id&&!SKINS[m.id]){SKINS[m.id]={n:m.sk,body:m.body,hood:m.hood,belt:m.belt,crea:1,group:'crea'};if(!WARD_D[m.id])WARD_D[m.id]=m.d}
// (the Guardaroba's row was drawn at load by 72, before these were there: again, with the cloak you wear)
try{wardRefresh()}catch(e){}
// they belong to every save, also to one put back as it was (the intro restores the save from a copy taken before this file runs) or
// loaded from a code: given again when the save has lost them
function sceOwnSkins(){SAVE.skins=SAVE.skins||{};for(const m of SCE_MANTI)if(m.id)SAVE.skins[m.id]=1}
sceOwnSkins();
// the portrait at the top was drawn before these mantles existed: drawn again
try{renderTop.k=null;renderTop()}catch(e){}
// ------------------------------------------------------------------ the hero's own look (Denis, 14 October: «nella creazione del pg si possa
// modificare a piacimento tra occhi cicatrici ecc.», then «migliora il design di tutto… aggiungi più cose… la grandezza delle cose tranne degli
// accessori… i capelli che coprono tutta la testa sotto il cappuccio anche dove non si vede… fai anche senza cappuccio»): ready-made choices
// for each part, shown as little drawn tiles, a colour where it makes sense, a size for every part but the accessories and the colours.
// It is you, whichever hero you play (SAVE.look, applied by heroStyle); the heroes keep their own pieces (the Druida's antlers and green eyes,
// the Balestriere's helmet, the Cacciatrice's ponytail, which takes the colour of the hair). Changed later at the barber, for crystals.
// The drawing is in sprite/eroe3d/disegno_eroe.js (S.look); a look with every part as it was draws the hero as always
const SCE_PELLE=[{id:'pesca',n:'Pesca',c:null,d:'La pelle di sempre.'},{id:'porcellana',n:'Porcellana',c:'#fbe2d4',d:'Chiara come la porcellana.'},{id:'rosata',n:'Rosata',c:'#f6d3c2',d:'Chiara, con un po\' di rosa.'},
  {id:'dorata',n:'Dorata',c:'#e2b07c',d:'Scaldata dal sole delle strade.'},{id:'olivastra',n:'Olivastra',c:'#d2a676',d:'Calda come il legno d\'ulivo.'},{id:'ambrata',n:'Ambrata',c:'#c68a58',d:'Color miele scuro.'},
  {id:'bruna',n:'Bruna',c:'#9a6440',d:'Bruna come la terra del bosco.'},{id:'scura',n:'Scura',c:'#6e452c',d:'Scura come il legno di noce.'},
  {id:'lunare',n:'Lunare',c:'#d9e0ef',d:'Pallida come la luna sopra i Picchi.'},{id:'muschio',n:'Muschio',c:'#b9dca6',d:'Un velo verde: viene dalla cripta di muschio.'}];
const SCE_OCCHI=[{id:'tondi',n:'Tondi',d:'Due occhi neri e lucidi: quelli di sempre.'},{id:'grandi',n:'Grandi',d:'Grandi e luccicanti: non gli sfugge niente.'},
  {id:'decisi',n:'Decisi',d:'Lo sguardo di chi non torna mai indietro.'},{id:'assonnati',n:'Assonnati',d:'Sembra annoiato. Sembra.'},
  {id:'felini',n:'Felini',d:'Occhi da gatto: vedono anche nel buio della cripta.'},{id:'piccoli',n:'Piccoli',d:'Due puntini: piccoli ma attentissimi.'},
  {id:'ciglia',n:'Ciglia',d:'Ciglia lunghe che sbattono come ali di farfalla.'},{id:'tristi',n:'Malinconici',d:'Ha visto tante cripte. Ma non molla mai.'},
  {id:'felici',n:'Felici',d:'Sorride anche con gli occhi.'},{id:'spalancati',n:'Spalancati',d:'Tutto lo stupisce: ogni stanza è una scoperta.'},
  {id:'stellati',n:'Stellati',d:'Una stella in ogni occhio: sogna in grande.'}];
const SCE_IRIDE=[{id:'scuri',n:'Scuri',c:null},{id:'nocciola',n:'Nocciola',c:'#8a5a2b'},{id:'azzurri',n:'Azzurri',c:'#4aa3e8'},{id:'verdi',n:'Verdi',c:'#4fb04a'},
  {id:'ambra',n:'Ambra',c:'#e3a22e'},{id:'viola',n:'Viola',c:'#9a6ad8'},{id:'grigi',n:'Grigi',c:'#9ca8b4'},{id:'rosa',n:'Rosa',c:'#e87fb0'},{id:'ghiaccio',n:'Ghiaccio',c:'#8fd6f2'}];
const SCE_SOPR=[{id:'nessuna',n:'Nessuna',d:'Come sempre: tutto il viso agli occhi.'},{id:'sottili',n:'Sottili',d:'Sottili e ordinate.'},
  {id:'folte',n:'Folte',d:'Folte come il muschio sulle pietre.'},{id:'decise',n:'Aggrottate',d:'Guai a chi lo sfida.'},
  {id:'alzate',n:'Alzate',d:'Sempre un po\' sorpreso da tutto.'},{id:'spezzate',n:'Spezzate',d:'Un vecchio graffio le ha divise in due.'},
  {id:'unite',n:'Unite',d:'Un sopracciglio solo, da un occhio all\'altro.'},{id:'arcuate',n:'Arcuate',d:'Alte e sottili, eleganti.'},
  {id:'puntini',n:'Puntini',d:'Due puntini, come i nobili di una volta.'},{id:'cespugliose',n:'Cespugliose',d:'Un cespuglio di rovi sopra ogni occhio.'}];
const SCE_BOCCA=[{id:'nessuna',n:'Nessuna',d:'Come sempre: parla con gli occhi.'},{id:'sorriso',n:'Sorriso',d:'Un sorriso tranquillo.'},
  {id:'sorrisone',n:'Sorrisone',d:'Una risata pronta per ogni vittoria.'},{id:'ghigno',n:'Ghigno',d:'Ha già un piano. Forse due.'},
  {id:'dentino',n:'Dentino',d:'Un dentino che spunta quando sorride.'},{id:'broncio',n:'Broncio',d:'Non gli piace perdere. Neanche a carte.'},
  {id:'lingua',n:'Linguaccia',d:'Una linguaccia ai mostri della cripta.'},{id:'fischio',n:'Fischietto',d:'Fischietta mentre esplora.'},
  {id:'denti',n:'Denti',d:'Un sorriso con tutti i denti.'},{id:'sorpreso',n:'Sorpreso',d:'Oh! Un forziere!'},{id:'neutra',n:'Serio',d:'Concentrato sulla prossima stanza.'}];
const SCE_SEGNI=[{id:'nessuno',n:'Nessuno',d:'Il viso pulito.'},{id:'cicatrice',n:'Cicatrice',d:'Un ricordo del primo Golem, chiuso da tempo.'},
  {id:'graffio',n:'Graffio',d:'Un pipistrello passato troppo vicino.'},{id:'lentiggini',n:'Lentiggini',d:'Un cielo di lentiggini sulle guance.'},
  {id:'pittura',n:'Pittura',d:'Due strisce blu, come i guerrieri antichi.',dc:'Due strisce dipinte, come i guerrieri antichi.'},{id:'cerotto',n:'Cerotto',d:'Si è sbucciato e non l\'ha detto a nessuno.'},
  {id:'runa',n:'Runa',d:'Una runa di muschio che brilla piano sulla guancia.',dc:'Una runa che brilla piano sulla guancia.'},{id:'neo',n:'Neo',d:'Un piccolo neo vicino alla bocca.'},
  {id:'croce',n:'Croce',d:'Una cicatrice a croce: lo Yeti graffia forte.'},{id:'lacrima',n:'Lacrima',d:'Una lacrima dipinta, come i giullari.'},
  {id:'stella',n:'Stella',d:'Una stella d\'oro dipinta sulla guancia.',dc:'Una stella dipinta sulla guancia.'},{id:'baffi',n:'Baffi da gatto',d:'Tre baffi per guancia, dipinti col carbone.',dc:'Tre baffi per guancia, dipinti col pennello.'},
  {id:'macchia',n:'Voglia',d:'Una macchia sulla tempia: ce l\'ha da quando è nato.'}];
// (the first, «Corti», is the hero of always: under the hood nothing of them shows)
const SCE_CAPELLI=[{id:'nascosti',n:'Corti',d:'Corti e in ordine: col cappuccio alzato restano tutti sotto.'},{id:'ciuffo',n:'Ciuffo',d:'Un ciuffo ribelle che scappa sempre fuori.'},
  {id:'frangia',n:'Frangia',d:'Una frangia dritta sulla fronte.'},{id:'spettinati',n:'Spettinati',d:'Appena svegliato, o appena uscito da una battaglia.'},
  {id:'lunghi',n:'Lunghi',d:'Lunghi fino alle spalle: escono anche dal cappuccio.'},{id:'riccioli',n:'Riccioli',d:'Una nuvola di riccioli.'},
  {id:'caschetto',n:'Caschetto',d:'Un caschetto tondo che copre le orecchie.'},{id:'treccine',n:'Treccine',d:'Due trecce legate con un nastro.'},
  {id:'coda',n:'Coda',d:'Una coda tirata indietro: esce dal cappuccio.'},{id:'chignon',n:'Chignon',d:'Raccolti in uno chignon con lo spillone.'},
  {id:'cresta',n:'Cresta',d:'Una cresta da guerriero, i lati rasati.'},{id:'rasati',n:'Rasati',d:'Cortissimi: niente può tirarglieli.'},
  {id:'mossi',n:'Mossi',d:'Mossi come le onde della palude.'}];
const SCE_COLCAP=[{id:'castani',n:'Castani',c:'#8a5a32'},{id:'neri',n:'Neri',c:'#3a2e2a'},{id:'biondi',n:'Biondi',c:'#e8c060'},{id:'rossi',n:'Rossi',c:'#c8582a'},
  {id:'bianchi',n:'Bianchi',c:'#ece6dc'},{id:'cenere',n:'Cenere',c:'#a19c94'},{id:'muschio',n:'Muschio',c:'#5fae3c'},{id:'viola',n:'Viola',c:'#8a5ad0'},
  {id:'blu',n:'Blu notte',c:'#3d5fa8'},{id:'rosa',n:'Rosa',c:'#e48fb2'}];
const SCE_BARBA=[{id:'nessuna',n:'Nessuna',d:'Il viso liscio di sempre.'},{id:'baffetti',n:'Baffetti',d:'Due baffetti ben curati.'},
  {id:'baffoni',n:'Baffoni',d:'Baffoni arricciati, da vero esploratore.'},{id:'pizzetto',n:'Pizzetto',d:'Un pizzetto a punta sul mento.'},
  {id:'barbetta',n:'Barbetta',d:'Una barbetta corta lungo la mascella.'},{id:'barba',n:'Barba',d:'Una barba folta: tiene caldo nelle notti dei Picchi.'},
  {id:'lunga',n:'Barba lunga',d:'Lunga e morbida, come i vecchi saggi.'},{id:'intrecciata',n:'Intrecciata',d:'Lunga, con una treccia e un nastro in fondo.'}];
// the colours of their own (Denis, 14 October: «oltre la grandezza si può selezionare il colore degli occhi, capelli ecc»): the first of each
// list follows something else (sp: the hair's, the mark's own, the one the game picks so that it stands out from the mantle) and shows it
const SCE_COLPEL=[{id:'capelli',n:'Dei capelli',sp:1},...SCE_COLCAP];
const SCE_COLPIT=[{id:'naturale',n:'Naturale',sp:1},{id:'rosso',n:'Rosso',c:'#d8443a'},{id:'arancio',n:'Arancio',c:'#ee8a2a'},{id:'oro',n:'Oro',c:'#f2c23e'},
  {id:'verde',n:'Verde',c:'#46b85a'},{id:'azzurro',n:'Azzurro',c:'#5fb4f0'},{id:'blu',n:'Blu',c:'#3f68d0'},{id:'viola',n:'Viola',c:'#9058d0'},{id:'rosa',n:'Rosa',c:'#ee7aa8'},
  {id:'bianco',n:'Bianco',c:'#f2ede2'},{id:'nero',n:'Nero',c:'#2c2830'}];
const SCE_COLBOC=[{id:'naturale',n:'Naturale',sp:1},{id:'rosso',n:'Rosso',c:'#c8323c'},{id:'rosa',n:'Rosa',c:'#e0708a'},{id:'corallo',n:'Corallo',c:'#e8684a'},
  {id:'prugna',n:'Prugna',c:'#7a2e5a'},{id:'viola',n:'Viola',c:'#7a48b0'},{id:'blu',n:'Blu',c:'#3a58b0'},{id:'nero',n:'Nero',c:'#2a2026'}];
const SCE_COLACC=[{id:'auto',n:'Automatico',sp:1},{id:'rosso',n:'Rosso',c:'#d24b3e'},{id:'arancio',n:'Arancio',c:'#e8862a'},{id:'oro',n:'Oro',c:'#f0c64a'},
  {id:'verde',n:'Verde',c:'#4aa84e'},{id:'azzurro',n:'Azzurro',c:'#4fa8e0'},{id:'blu',n:'Blu',c:'#3f6ad0'},{id:'viola',n:'Viola',c:'#8a5ac8'},{id:'rosa',n:'Rosa',c:'#e87aa8'},
  {id:'bianco',n:'Bianco',c:'#f0ebe0'},{id:'nero',n:'Nero',c:'#2e2a30'}];
const SCE_COLCOP=[{id:'auto',n:'Originale',sp:1},...SCE_COLACC.slice(1)];
const SCE_COLTAT=[{id:'naturale',n:'Inchiostro',sp:1},...SCE_COLPIT.slice(1)];
// the marks that take a colour, with their own (the scars, the freckles, the mole and the birthmark stay as they are)
const SCE_MARKCOL={pittura:'#3f86d8',runa:'#5fe07c',lacrima:'#5fb4f0',stella:'#f6c94b',baffi:'#4a3020',cerotto:'#f6dcae'};
// the accessories with a colour of their own when «Automatico» (the stones of the crown); the others take the one that stands out
const SCE_ACCFIX={benda:'#2a211c',occhialetti:'#d4a84a',maschera:'#3a2f45',coroncina:'#e5484d'};
const SCE_ORECCHIE=[{id:'tonde',n:'Tonde',d:'Orecchie tonde: col cappuccio alzato restano sotto.'},{id:'punta',n:'A punta',d:'Orecchie a punta da elfo: escono dal cappuccio.'},
  {id:'lunghe',n:'Lunghe',d:'Lunghe e a punta: sentono un goblin a cento passi.'},{id:'gatto',n:'Da gatto',d:'Orecchie da gatto: sul cappuccio, o tra i capelli.'},
  {id:'orso',n:'Da orso',d:'Due orecchie tonde da orsetto.'},{id:'coniglio',n:'Da coniglio',d:'Lunghe orecchie da coniglio, sempre all\'erta.'}];
// (Denis, 14 October: «se non si seleziona il cappuccio toglilo completamente dall'outfit»: without it nothing of the hood is left, not even
// on the shoulders; an old «giu», the hood lowered, is read as «senza»)
// the hats (Denis, 15 October: «più cose nell'aspetto»: cappelli) are in the same part: on the bare head, each with its own colour
const SCE_CAPPUCCIO=[{id:'su',n:'Cappuccio',d:'Il cappuccio in testa, come sempre: pronto per la cripta.'},{id:'senza',n:'Niente',d:'Niente in testa: si vedono i capelli e le orecchie.'},
  {id:'berretto',n:'Berretto',d:'Un berretto morbido tirato da una parte, come i musici.'},{id:'punta',n:'Da mago',d:"Alto e a punta, con le stelline d'oro."},
  {id:'paglia',n:'Paglia',d:'Un cappello di paglia a tesa larga, per il sole dei campi.'},{id:'cilindro',n:'Cilindro',d:'Elegante come un mago da palcoscenico.'},
  {id:'elmo',n:'Elmo cornuto',d:'Un elmo con le corna: fa paura anche al Golem.'},{id:'bandana',n:'Bandana',d:'Rossa a pois, annodata dietro come i pirati.'},
  {id:'pompon',n:'Di lana',d:'Un berretto di lana col pompon, per i Picchi di Brina.'}];
const SCE_HAT=id=>id&&id!=='su'&&id!=='senza'&&id!=='giu';
// the tattoos (Denis, 15 October): ink on the skin, a colour and a size of their own
const SCE_TATUAGGI=[{id:'nessuno',n:'Nessuno',d:'La pelle pulita.'},{id:'tribale',n:'Tribale',d:'Linee curve sulla guancia, come gli antichi esploratori.'},
  {id:'fulmine',n:'Fulmine',d:'Un fulmine sulla guancia: veloce come un temporale.'},{id:'luna',n:'Luna',d:'Una falce di luna sulla fronte.'},
  {id:'puntini',n:'Tre puntini',d:"Tre puntini sotto l'occhio, uno per ogni boss battuto."},{id:'artigli',n:'Artigli',d:"Tre righe come i graffi di un orso, ma disegnate con l'inchiostro."},
  {id:'spirale',n:'Spirale',d:'Una spirale che gira come il vento della cripta.'},{id:'onde',n:'Onde',d:'Due piccole onde sotto gli occhi.'},
  {id:'cuore',n:'Cuore',d:'Un cuoricino sulla guancia.'}];
const SCE_ACC=[{id:'nessuno',n:'Nessuno',d:'Niente di più.'},{id:'benda',n:'Benda',d:'Un occhio coperto: l\'altro vede per due.'},
  {id:'occhialetti',n:'Occhialetti',d:'Tondi e d\'oro, per leggere le rune.'},{id:'sciarpa',n:'Sciarpa',d:'Fatta a maglia, per le notti fredde dei Picchi.'},
  {id:'piuma',n:'Piuma',d:'Una piuma infilata nel cappuccio, o tra i capelli.'},{id:'fascia',n:'Fascia',d:'Una fascia legata dietro la testa.'},
  {id:'orecchino',n:'Orecchino',d:'Un cerchietto d\'oro con una pietra.'},{id:'fiore',n:'Fiore',d:'Un fiore raccolto nel bosco, sopra l\'orecchio.'},
  {id:'maschera',n:'Maschera',d:'Una maschera da bandito: nessuno ti riconoscerà.'},{id:'collana',n:'Collana',d:'Perline colorate e tre zanne di lupo.'},
  {id:'coroncina',n:'Coroncina',d:'Una piccola corona d\'oro: il re della cripta.'}];
// the parts, in the order of the tabs (the camera goes from the whole hero to the head, to the face and back to the shoulders): key in the
// look, the list, the colours (a second key; the first colour may follow something else, sp), the size (a key of look.k), how the camera looks at him
// (face: close on the face; head: the whole head, turning; bust: head and shoulders; else the whole hero) and how its tiles are drawn (prev)
const SCE_CATS=[{id:'manto',n:'Mantello',d:'Il colore del mantello: lo cambi quando vuoi nel Profilo.',prev:'body'},
  {id:'cappuccio',n:'Copricapo',list:SCE_CAPPUCCIO,key:'cappuccio',cols:SCE_COLCOP,ckey:'colCop',cn:'Colore',cam:'bust',prev:'hat'},
  {id:'capelli',n:'Capelli',list:SCE_CAPELLI,key:'capelli',cols:SCE_COLCAP,ckey:'colCap',cn:'Colore',size:'capelli',cam:'head',prev:'hair'},
  {id:'orecchie',n:'Orecchie',list:SCE_ORECCHIE,key:'orecchie',size:'orecchie',cam:'head',prev:'head'},
  {id:'pelle',n:'Pelle',list:SCE_PELLE,key:'pelle',cam:'face',prev:'face'},
  {id:'occhi',n:'Occhi',list:SCE_OCCHI,key:'occhi',cols:SCE_IRIDE,ckey:'iride',cn:'Colore',size:'occhi',cam:'face',prev:'eyes'},
  {id:'sopr',n:'Sopracciglia',list:SCE_SOPR,key:'sopr',cols:SCE_COLPEL,ckey:'colSopr',cn:'Colore',size:'sopr',cam:'face',prev:'brows'},
  {id:'bocca',n:'Bocca',list:SCE_BOCCA,key:'bocca',cols:SCE_COLBOC,ckey:'colBocca',cn:'Colore',size:'bocca',cam:'face',prev:'mouth'},
  {id:'segni',n:'Segni',list:SCE_SEGNI,key:'segno',cols:SCE_COLPIT,ckey:'colSegno',cn:'Colore',size:'segno',cam:'face',prev:'marks'},
  {id:'tatuaggi',n:'Tatuaggi',list:SCE_TATUAGGI,key:'tatuaggio',cols:SCE_COLTAT,ckey:'colTat',cn:'Colore',size:'tatuaggio',cam:'face',prev:'marks'},
  {id:'barba',n:'Barba',list:SCE_BARBA,key:'barba',cols:SCE_COLPEL,ckey:'colBarba',cn:'Colore',size:'barba',cam:'bust',prev:'chin'},
  {id:'acc',n:'Accessori',list:SCE_ACC,key:'acc',cols:SCE_COLACC,ckey:'colAcc',cn:'Colore',cam:'bust',prev:'bust'}];
const SCE_CAT=Object.fromEntries(SCE_CATS.map(c=>[c.id,c]));
const LOOK_DEF={pelle:'pesca',occhi:'tondi',iride:'scuri',sopr:'nessuna',bocca:'nessuna',segno:'nessuno',capelli:'nascosti',colCap:'castani',barba:'nessuna',orecchie:'tonde',cappuccio:'su',acc:'nessuno',
  colSopr:'capelli',colBocca:'naturale',colSegno:'naturale',colBarba:'capelli',colAcc:'auto',tatuaggio:'nessuno',colTat:'naturale',colCop:'auto'};
// the sizes: from .7 to 1.3, 1 as drawn
const LOOK_K=['capelli','occhi','sopr','bocca','segno','tatuaggio','barba','orecchie'],LOOK_KMIN=.7,LOOK_KMAX=1.3;
const lkFind=(L,id)=>L.find(o=>o.id===id)||L[0];
const LOOK_LIST={pelle:SCE_PELLE,occhi:SCE_OCCHI,iride:SCE_IRIDE,sopr:SCE_SOPR,bocca:SCE_BOCCA,segno:SCE_SEGNI,capelli:SCE_CAPELLI,colCap:SCE_COLCAP,barba:SCE_BARBA,orecchie:SCE_ORECCHIE,cappuccio:SCE_CAPPUCCIO,acc:SCE_ACC,
  colSopr:SCE_COLPEL,colBocca:SCE_COLBOC,colSegno:SCE_COLPIT,colBarba:SCE_COLPEL,colAcc:SCE_COLACC,tatuaggio:SCE_TATUAGGI,colTat:SCE_COLTAT,colCop:SCE_COLCOP};
// a part that is not there has no size (no brows, no mouth, no mark, no beard)
const LOOK_NONE={sopr:'nessuna',bocca:'nessuna',segno:'nessuno',barba:'nessuna',tatuaggio:'nessuno'};
// a look with only known choices (anything else, or missing, is the part as it was); the sizes in their range, 1 for a part that is not there
// the colour of a part that is not there is the colour of always (so it is not a change)
const LOOK_CPART={colSopr:['sopr','nessuna'],colBocca:['bocca','nessuna'],colBarba:['barba','nessuna'],colAcc:['acc','nessuno'],colTat:['tatuaggio','nessuno']};
const sceLook=lk=>{const o={};for(const k in LOOK_DEF){let v=lk&&lk[k];if(k==='cappuccio'&&v==='giu')v='senza';o[k]=v&&LOOK_LIST[k].some(x=>x.id===v)?v:LOOK_DEF[k]}
  for(const k in LOOK_CPART){const[p,none]=LOOK_CPART[k];if(o[p]===none)o[k]=LOOK_DEF[k]}if(!SCE_MARKCOL[o.segno])o.colSegno=LOOK_DEF.colSegno;if(!SCE_HAT(o.cappuccio))o.colCop=LOOK_DEF.colCop;
  const K=lk&&lk.k||{};o.k={};for(const k of LOOK_K){const v=+K[k];o.k[k]=isFinite(v)&&v>0&&o[k]!==LOOK_NONE[k]?Math.round(Math.min(LOOK_KMAX,Math.max(LOOK_KMIN,v))*100)/100:1}return o};
// how many parts differ from the hero of always (a size counts as one more)
const sceLookN=lk=>{if(!lk)return 0;const L=sceLook(lk);let n=0;for(const k in LOOK_DEF)if(L[k]!==LOOK_DEF[k])n++;for(const k of LOOK_K)if(L.k[k]!==1)n++;return n};
const hxMix=(a,b,k)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),f=(s)=>Math.round(((A>>s)&255)*(1-k)+((B>>s)&255)*k);return'#'+((1<<24)|(f(16)<<16)|(f(8)<<8)|f(0)).toString(16).slice(1)};
const hxDist=(a,b)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);let d=0;for(const s of[16,8,0])d+=Math.abs(((A>>s)&255)-((B>>s)&255));return d};
// the colour of the scarf, the feather, the band, the flower, the stone of the earring: the one that stands out most from the mantle
function accCol(S){let best='#d24b3e',bd=-1;for(const c of['#d24b3e','#e8d6a8','#3f7fd0','#f0c64a']){const d=Math.min(hxDist(c,S.hood||'#23877d'),hxDist(c,S.body||'#2fb3a6'));if(d>bd){bd=d;best=c}}return best}
// a style with the look on it (the hero's own skin stays with «Pesca»; nothing changes when every part is as it was)
function sceLookStyle(S,lk){if(!lk||!sceLookN(lk))return S;const L=sceLook(lk),P=lkFind(SCE_PELLE,L.pelle),I=lkFind(SCE_IRIDE,L.iride),C=lkFind(SCE_COLCAP,L.colCap),k=L.k;
  // a colour picked for the part (the first of its list is the colour of always: none of its own)
  const own=(Ls,id)=>{const o=lkFind(Ls,id);return o.sp?undefined:o.c},ac=own(SCE_COLACC,L.colAcc);
  const look={eyes:L.occhi,iris:I.c,brows:L.sopr,browCol:hxMix(own(SCE_COLPEL,L.colSopr)||C.c,'#1b1612',.42),mouth:L.bocca,lipCol:own(SCE_COLBOC,L.colBocca),mark:L.segno,markCol:own(SCE_COLPIT,L.colSegno),
    hair:L.capelli,hairCol:C.c,beard:L.barba,beardCol:own(SCE_COLPEL,L.colBarba),ears:L.orecchie,hood:L.cappuccio,hatCol:own(SCE_COLCOP,L.colCop),
    tattoo:L.tatuaggio,tatCol:own(SCE_COLTAT,L.colTat),tatK:k.tatuaggio,
    acc:L.acc,accCol:ac||accCol(S),accFix:ac,eyeK:k.occhi,browK:k.sopr,mouthK:k.bocca,markK:k.segno,hairK:k.capelli,beardK:k.barba,earK:k.orecchie,
    // the parts left as they were: there the heroes with a hat, a hood, hair or a beard of their own (style.look0) keep theirs
    def:{hood:L.cappuccio===LOOK_DEF.cappuccio,hatCol:L.colCop===LOOK_DEF.colCop,hair:L.capelli===LOOK_DEF.capelli,hairCol:L.colCap===LOOK_DEF.colCap,beard:L.barba===LOOK_DEF.barba,beardCol:L.colBarba===LOOK_DEF.colBarba}};
  const o={...S,look};if(P.c)o.skin=P.c;if(S.ponytail&&L.colCap!==LOOK_DEF.colCap)o.hair=C.c;return o}
let heroStyleBase=heroStyle;
{const _hs=heroStyle;heroStyleBase=function(){const K=SAVE.skin&&SKINS[SAVE.skin];if(K&&K.crea&&!(SAVE.skins&&SAVE.skins[SAVE.skin]))sceOwnSkins();return _hs.apply(this,arguments)};
  heroStyle=function(){return sceLookStyle(heroStyleBase.apply(this,arguments),SAVE.look)}}
{const _rp=renderProfile;renderProfile=function(){sceOwnSkins();const r=_rp.apply(this,arguments);try{sceBarberRow()}catch(e){}return r}}
// the Guardaroba (72): the hero trying the outfits on is you too (your look); the outfits' pictures are drawn again when the hero or the look change
{const _ws=wardStyle;wardStyle=function(){return sceLookStyle(_ws.apply(this,arguments),SAVE.look)}}
wardOrigIcon=function(){return iconCv('s3:orig',x=>{x.translate(48,72);x.scale(2.1,2.1);const sv=noShadow;noShadow=false;
  try{drawRig(0,0,Math.PI/2-.42,0,false,sceLookStyle({...heroStyle0(SAVE.hero),held:null,quiver:false},SAVE.look),{})}finally{noShadow=sv}})};
{let sig='';const chk=()=>{const s=SAVE.hero+'|'+JSON.stringify(SAVE.look||0);if(s===sig)return;sig=s;for(const k of Object.keys(ICON2))if(k.startsWith('s3:'))delete ICON2[k]};
  const _si=skinIcon;skinIcon=function(){chk();return _si.apply(this,arguments)};const _wo=wardOrigIcon;wardOrigIcon=function(){chk();return _wo.apply(this,arguments)}}
// names offered (the dice gives another one); the player can write his own
const SCE_NAMES=['Bruma','Ortica','Tasso','Gufo','Ruggine','Ghianda','Selce','Brina','Falco','Rovo','Cenere','Scintilla','Salice','Ginepro','Volpe','Nebbia','Tempesta',
  'Smeraldo','Quercia','Faggio','Lince','Airone','Grifo','Corteccia','Lampo','Vischio','Mirtillo','Pietra'];
const SCE={on:false,el:null,step:1,sel:null,manto:'',gift:null,name:'',done:false,raf:0,time:0,last:0,manual:false,yaw:Math.PI/2-.5,vel:0,drag:null,
  hero:null,prev:null,gcur:null,gprev:null,mode:'hero',modeT:-9,kz:null,cx:null,cy:null,emb:[],motes:null,fog:null,bgK:'',bgImg:null,can:{},low:false,ema:0,slow:0,err:0,
  tilt:.9,lift:3,cant:1,fin:null,pulse:-9,look:{...LOOK_DEF},cat:'manto',barber:false,warn:false,smk:[]};
const sceStarter=starterId;
// the price of the five follows the choice: the one you picked is yours, the others cost 3.000 gold
for(const id of SCE_FREE)Object.defineProperty(HERO_BY[id],'price',{configurable:true,enumerable:true,get:()=>sceStarter()===id?0:SCE_PRICE});
// a new player: no hero picked yet, no games played, no hero but the Arciere the save gives everybody
const sceNeeded=()=>!SAVE.starter&&!(SAVE.runs>0)&&Object.keys(SAVE.heroes||{}).every(k=>k==='arciere');
const sceFree=id=>SCE_FREE.includes(id);
// the hero as he looks on this screen: his style with the mantle picked
function sceStyle(id){const S=SCE.barber?heroStyleBase(id):heroStyle0(id),M=!SCE.barber&&SCE_MANTO[SCE.manto||''],st0=M&&M.body?{...S,body:M.body,hood:M.hood,belt:M.belt}:S,st=sceLookStyle(st0,SCE.look);return id==='druida'&&!st.eyes?{...st,eyes:st.eyeCol}:st}

// ------------------------------------------------------------------ the gifts
// rows: what you get, as the right column shows it; give(): into the save
const SCE_GIFTS=[
  {id:'oro',n:"Sacco d'oro",rgb:'255,205,110',d:"Un sacco pesante, pieno di monete ancora tiepide. Con l'oro migliori l'equipaggiamento e compri casse in bottega.",
   rows:[['Oro','+500','coin']],give(){SAVE.gold=(SAVE.gold||0)+500}},
  {id:'cristalli',n:'Cristalli',rgb:'120,220,255',d:'Cristalli presi dalle rocce della cripta: brillano anche al buio. Servono per i compagni, la ruota e la rinascita.',
   rows:[['Cristalli','+30','gem']],give(){SAVE.gems=(SAVE.gems||0)+30}},
  {id:'cassa',n:"Cassa d'argento",rgb:'200,225,255',d:"Una cassa chiusa da chissà quanto tempo, con dentro carte oggetto e oro. La trovi pronta da aprire tra le tue casse.",
   rows:[['Carte',CHESTS.argento.cards],['Oro',CHESTS.argento.gold.join('–')]],
   give(){const i=SAVE.slots.findIndex(s=>!s);if(i>=0)SAVE.slots[i]={type:'argento',state:'ready'};else SAVE.gold=(SAVE.gold||0)+CHESTS.argento.price}},
  {id:'anello',n:'Anello del falco',rgb:'120,170,255',d:"Un anello d'argento con una pietra blu: chi lo porta vede i punti deboli dei nemici. Lo indossi da subito.",
   rows:[['Rarità','Raro'],['Critico','+5%'],['Attacco','+3']],
   give(){SAVE.items=SAVE.items||{};if(!SAVE.items.anello_falco)SAVE.items.anello_falco={lvl:1,cards:0};SAVE.eq=SAVE.eq||{};if(!SAVE.eq.anello)SAVE.eq.anello='anello_falco'}},
  {id:'piuma',n:'Piuma della fenice',rgb:'255,140,70',d:'Una piuma che non smette mai di scaldare. La prima volta che cadi in battaglia prende fuoco e ti rialzi.',
   rows:[['Rinascite','+1']],give(){SAVE.piuma=(SAVE.piuma||0)+1}}];
const SCE_GIFT=Object.fromEntries(SCE_GIFTS.map(g=>[g.id,g]));
// the phoenix feather: the first fall in battle (when no dragon's heart is left) burns it and you get up again
{const _d=die;die=function(){if(!INTRO.on&&G&&G.mode&&!G.ended&&G.state!=='dead'&&P&&!(P.revive>0)&&(SAVE.piuma||0)>0){SAVE.piuma--;save();
    P.hp=P.maxhp;P.inv=2.4;shake(7);vib([40,30,90]);banner('Piuma della fenice','Ti rialzi',1.8);sfx('rise');sfx('pick');
    try{vfxBlast(P.x,P.y-10,'255,150,60',150,{fire:10,sparks:26,spcol:['#fff1a8','#ffb040','#ff6a2a'],dust:8});fxPush({k:'flash',x:P.x,y:P.y-10,r:190,rgb:'255,190,110',t:.35,max:.35})}catch(e){}
    for(const e of G.enemies)if(!isBoss(e.type)){const a=Math.atan2(e.y-P.y,e.x-P.x);moveCircle(e,Math.cos(a)*50,Math.sin(a)*50)}return}
  return _d.apply(this,arguments)}}

// ------------------------------------------------------------------ the hero's numbers (the game's own: makeP with that hero)
function sceStats(id){const keepH=SAVE.hero,keepP=P;let q=null;try{SAVE.hero=id;q=makeP()}catch(e){}finally{SAVE.hero=keepH;P=keepP}
  return q?{hp:Math.round(q.maxhp),atk:Math.round(q.atk),aspd:q.aspd,spd:Math.round(q.spd),crit:q.crit,dash:q.dashMax}:null}
const sce1=v=>(Math.round(v*10)/10).toLocaleString('it-IT',{minimumFractionDigits:1,maximumFractionDigits:1});
// label, value, which way is better (the dash: less is better)
const SCE_ROWS=[['hp','Salute',v=>v,1],['atk','Attacco',v=>v,1],['aspd','Cadenza',sce1,1],['spd','Velocità',v=>v,1],['crit','Critico',v=>Math.round(v*100)+'%',1],['dash','Scatto',v=>sce1(v)+' s',-1]];
// a name: letters, numbers, spaces and a few signs (it is shown in the Profile and in the rankings), at most 14
const sceClean=v=>String(v||'').replace(/[<>&"`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,14);
const sceRandName=()=>{let n;do n=SCE_NAMES[randi(0,SCE_NAMES.length-1)];while(n===SCE.name&&SCE_NAMES.length>1);return n};

// ------------------------------------------------------------------ the look (Dark Souls: black, thin gold rules, serif capitals, dark panels)
function sceFonts(){if($('sceFont'))return;const l=document.createElement('link');l.id='sceFont';l.rel='stylesheet';
  l.href='https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=EB+Garamond:ital,wght@0,500;1,500&display=swap';document.head.appendChild(l)}
function sceCss(){if($('sceCss'))return;const s=document.createElement('style');s.id='sceCss';s.textContent=`
#sceScr{--g:#d8b46a;--gh:#f6e2a8;--tx:#e9dcc0;--dim:#9a8f79;--se:"Cinzel",Georgia,"Times New Roman",serif;--bo:"EB Garamond",Georgia,"Times New Roman",serif;
  position:absolute;inset:0;z-index:96;overflow:hidden;background:#030202;color:var(--tx);font-family:var(--bo);display:flex;flex-direction:column;
  touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
#sceScr *,#sceScr *::before,#sceScr *::after{box-sizing:border-box}
#sceCv{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
#sceScr>:not(#sceCv){position:relative;z-index:1}
.sceTop{flex:none;text-align:center;padding:clamp(8px,1.6vh,22px) 12px 0;animation:sceIn .9s .1s ease-out backwards}
.sceTop small{display:block;font:500 10px/1 var(--se);letter-spacing:.34em;text-transform:uppercase;color:var(--dim)}
.sceTop h1{margin:6px 0 0;font:700 clamp(21px,6.3vw,30px)/1.08 var(--se);letter-spacing:.05em;color:var(--gh);text-shadow:0 0 18px rgba(255,196,110,.22),0 2px 0 #000;white-space:nowrap}
.sceRule{display:flex;align-items:center;justify-content:center;gap:8px;margin:7px auto 0;width:min(78%,300px)}
.sceRule::before,.sceRule::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(216,180,106,0),rgba(216,180,106,.6))}
.sceRule::after{background:linear-gradient(90deg,rgba(216,180,106,.6),rgba(216,180,106,0))}
.sceRule i{width:6px;height:6px;transform:rotate(45deg);background:var(--g);box-shadow:0 0 8px rgba(255,205,130,.7)}
.sceSteps{display:flex;justify-content:center;gap:12px;margin:6px 0 0;padding:0;list-style:none;font:500 9.5px var(--se);letter-spacing:.16em;text-transform:uppercase;color:#7a6f5b;white-space:nowrap;text-shadow:0 0 5px #000,0 0 2px #000}
.sceSteps li{transition:color .3s}.sceSteps li.on{color:var(--gh)}.sceSteps li.ok{color:#a8946a}.sceSteps b{font-weight:700;margin-right:4px}
.sceMid{position:relative;flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(0,1.16fr) minmax(0,1.04fr) minmax(0,1.04fr);width:100%;max-width:560px;margin:0 auto;padding:0 8px}
.sceCol{min-width:0;align-self:start;margin-top:clamp(4px,1.4vh,14px);padding:6px 6px 7px;background:linear-gradient(rgba(8,6,5,.84),rgba(8,6,5,.62));
  border:1px solid rgba(216,180,106,.14);border-top-color:rgba(216,180,106,.36);box-shadow:0 10px 26px rgba(0,0,0,.5);text-shadow:0 0 6px #000,0 1px 0 #000;
  animation:sceIn .8s .25s ease-out backwards;transition:opacity .35s}
.sceCol.empty{visibility:hidden}
.sceCol h2{margin:0 0 4px;padding:0 0 5px 2px;font:500 9.5px var(--se);letter-spacing:.24em;text-transform:uppercase;color:var(--dim);border-bottom:1px solid rgba(216,180,106,.26)}
.sceStats h2{text-align:right;padding:0 2px 5px 0}
.sceRow{position:relative;display:block;width:100%;margin:0;padding:clamp(6px,1.1vh,10px) 3px clamp(6px,1.1vh,10px) 14px;border:0;background:none;color:#b3a78e;text-align:left;cursor:pointer;
  font:500 clamp(12.5px,3.75vw,15.5px)/1.1 var(--se);letter-spacing:.01em;transition:color .2s,background .2s}
.sceRow::before{content:'';position:absolute;left:3px;top:calc(clamp(6px,1.1vh,10px) + .55em);width:6px;height:6px;margin-top:-3px;background:var(--g);box-shadow:0 0 8px rgba(255,205,130,.9);transform:rotate(45deg) scale(0);transition:transform .2s}
.sceRow.on{color:#fff4d8;background:linear-gradient(90deg,rgba(216,180,106,.22),rgba(216,180,106,0) 92%)}
.sceRow.on::before{transform:rotate(45deg) scale(1)}
.sceRow b{font-weight:500;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sceRow.g b{white-space:normal;line-height:1.08}
.sceRow small{display:flex;align-items:center;gap:4px;margin-top:3px;font:500 10.5px/1 var(--se);letter-spacing:.04em;color:#8a7f6b}
.sceRow.lock b{color:#857b69}.sceRow.lock.on b{color:#d4c9b0}
.sceRow.m b{display:flex;align-items:center;gap:7px}
.sceDot{flex:none;width:13px;height:13px;border-radius:50%;border:1.5px solid #120e0b;background:linear-gradient(135deg,var(--a) 0 52%,var(--b) 52% 100%);box-shadow:0 0 0 1px rgba(216,180,106,.35)}
.sceDot.o{background:conic-gradient(#5cdec8 0 25%,#ff8cbe 0 50%,#a9c8ff 0 75%,#7bf0a8 0)}
.sceLk{display:inline-block;width:10px;height:11px;flex:none}
.sceCoin,.sceGem{display:inline-block;width:12px;height:12px;flex:none;vertical-align:-1px;background:var(--coinImg) center/contain no-repeat}.sceGem{background-image:var(--gemImg)}
.sceStage{grid-column:2;grid-row:1;align-self:stretch;min-height:0;cursor:grab;touch-action:none}
.sceList{grid-column:1;grid-row:1}.sceStats{grid-column:3;grid-row:1;text-align:right}
.sceStats dl{margin:0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:clamp(3px,.9vh,7px) 6px;align-items:baseline}
.sceStats dt{font:500 clamp(10px,3vw,12px) var(--se);color:#a2967f;letter-spacing:.02em;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sceStats dd{margin:0;font:700 clamp(12.5px,3.8vw,15.5px) var(--se);color:#f2e7cd;font-variant-numeric:tabular-nums;white-space:nowrap}
.sceStats dt{padding-bottom:3px;background:linear-gradient(90deg,rgba(226,190,118,.6) 0 calc(var(--v,0)*100%),rgba(216,180,106,.12) 0) left bottom/100% 2px no-repeat}
.sceStats dd.up{color:#8cc4ff}.sceStats dd.dn{color:#ff9187}.sceStats dd i{font-style:normal;font-size:.62em;margin-left:2px;vertical-align:.15em}
.sceStats dd .sceCoin,.sceStats dd .sceGem{width:13px;height:13px;margin-left:3px;vertical-align:-2px}
.sceNameBox{position:absolute;left:50%;top:clamp(4px,1.4vh,14px);width:min(300px,86%);transform:translateX(-50%);z-index:2;display:none;text-align:center;animation:sceIn .5s ease-out backwards}
#sceScr.s4 .sceNameBox{display:block}
.sceNameBox label{display:block;margin-bottom:5px;font:500 9.5px var(--se);letter-spacing:.24em;text-transform:uppercase;color:var(--dim);text-shadow:0 0 6px #000}
.sceNameRow{display:flex;align-items:stretch;border:1px solid rgba(246,214,140,.6);background:linear-gradient(rgba(10,8,6,.9),rgba(6,5,4,.94));box-shadow:0 0 0 1px #000,0 0 22px rgba(255,190,100,.18),0 10px 26px rgba(0,0,0,.55)}
.sceNameRow input{flex:1;min-width:0;margin:0;padding:10px 12px;border:0;outline:0;background:none;color:#fff3d2;font:700 clamp(17px,5.2vw,21px) var(--se);letter-spacing:.06em;text-align:center;
  -webkit-user-select:text;user-select:text;caret-color:var(--g)}
.sceNameRow input::placeholder{color:#7d725f}
.sceDice{flex:none;width:46px;border:0;border-left:1px solid rgba(216,180,106,.35);background:none;color:var(--g);cursor:pointer;display:flex;align-items:center;justify-content:center}
.sceDice svg{width:22px;height:22px}.sceDice:active svg{transform:rotate(25deg) scale(.92)}
.sceBot{flex:none;width:100%;max-width:560px;margin:0 auto;padding:0 12px clamp(8px,1.4vh,20px);animation:sceIn .8s .35s ease-out backwards;transition:opacity .4s}
.sceDesc{position:relative;padding:clamp(7px,1.3vh,11px) 14px clamp(8px,1.4vh,12px);border:1px solid rgba(216,180,106,.34);background:linear-gradient(rgba(16,12,9,.9),rgba(7,5,4,.94));
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.7),inset 0 0 22px rgba(0,0,0,.6),0 0 26px rgba(0,0,0,.7)}
.sceDesc::before,.sceDesc::after{content:'';position:absolute;top:-4px;width:7px;height:7px;transform:rotate(45deg);background:#0a0806;border:1px solid rgba(216,180,106,.6)}
.sceDesc::before{left:-4px}.sceDesc::after{right:-4px}
.sceDesc h3{margin:0;font:700 clamp(15px,4.5vw,19px)/1.15 var(--se);letter-spacing:.05em;color:var(--c,var(--gh))}
.sceDesc p{margin:4px 0 0;font:italic 500 clamp(13.5px,3.9vw,15.5px)/1.28 var(--bo);color:#e4d8bd}
.sceDesc ul{margin:5px 0 0;padding:0;list-style:none;font:500 clamp(12.5px,3.6vw,14px)/1.3 var(--bo);color:#cdbfa2}
.sceDesc li{display:flex;gap:6px;align-items:baseline}.sceDesc li::before{content:'';flex:none;width:5px;height:5px;transform:rotate(45deg) translateY(-2px);background:var(--g);opacity:.8}
.sceDesc li b{color:var(--c,var(--gh));font-weight:500}
.sceSum{display:grid!important;gap:2px}
.sceSum li{cursor:pointer;justify-content:space-between;padding:3px 0;border-bottom:1px solid rgba(216,180,106,.12)}.sceSum li::before{display:none}
.sceSum li span{font:500 10.5px var(--se);letter-spacing:.16em;text-transform:uppercase;color:var(--dim)}
.sceSum li b{font:700 clamp(13px,3.8vw,15px) var(--se);color:#f2e6c8;letter-spacing:.03em;text-align:right}
.sceSum li b::after{content:' ›';color:var(--g)}
/* the panels of the steps are as high as their longest text (measured: --dh); the look has its own, always the same */
#sceScr:not(.s2) .sceDesc{min-height:var(--dh,0px)}
/* step I and III: a little picture in each row of the list (the hero's head, the gift) */
.sceRow.p{display:flex;align-items:center;gap:6px;padding-left:12px}
.sceRow.p::before{left:2px;top:50%}
.scePic{flex:none;width:27px;height:27px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#2e251d,#0e0b09 75%);box-shadow:0 0 0 1px rgba(216,180,106,.28);transition:box-shadow .2s}
.sceRow.on .scePic{box-shadow:0 0 0 1.5px var(--gh),0 0 10px rgba(255,205,130,.45)}
.sceRow.p>span{min-width:0;flex:1}
.sceRow.p b{font:500 clamp(13.5px,3.9vw,16px)/1.05 var(--bo);letter-spacing:.01em}
.sceRow.lock .scePic{opacity:.7}
/* step II: the parts as icons on top, the choices as drawn tiles, the colour and the size underneath; the hero alone over the panel */
#sceScr.s2 .sceList,#sceScr.s2 .sceStats{display:none}
#sceScr.s2 .sceStage{grid-column:1/4}
#sceScr.s2 .sceDesc{padding:clamp(5px,.9vh,8px) 12px clamp(7px,1.1vh,10px)}
.sceTabs{display:flex;gap:1px;margin:0 -5px 4px;padding:0 0 5px;border-bottom:1px solid rgba(216,180,106,.22)}
.sceTab{position:relative;flex:1 1 0;min-width:0;height:34px;margin:0;padding:0;border:0;border-radius:4px;background:none;color:#8d826c;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:color .2s,background .25s}
.sceTab svg{width:21px;height:21px;transition:transform .2s}
.sceTab.on{color:var(--gh);background:radial-gradient(closest-side,rgba(216,180,106,.2),rgba(216,180,106,0))}
.sceTab.on svg{transform:scale(1.12);filter:drop-shadow(0 0 5px rgba(255,205,130,.55))}
.sceTab.on::after{content:'';position:absolute;bottom:-9px;left:50%;width:6px;height:6px;margin-left:-3px;transform:rotate(45deg);background:var(--g);box-shadow:0 0 6px rgba(255,205,130,.8)}
.sceTab.mod::before{content:'';position:absolute;top:3px;right:calc(50% - 13px);width:5px;height:5px;border-radius:50%;background:#e8c37a;box-shadow:0 0 4px rgba(255,205,130,.7)}
.sceLkHd{display:flex;align-items:center;gap:7px;min-height:30px}
.sceLkHd h3{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sceLkHd h3 small{font:500 10px var(--se);letter-spacing:.2em;text-transform:uppercase;color:var(--dim);margin-right:7px;vertical-align:.12em}
.sceIco{flex:none;width:30px;height:30px;margin:0;padding:0;border:1px solid rgba(216,180,106,.4);border-radius:50%;background:radial-gradient(circle at 50% 35%,rgba(70,54,36,.9),rgba(16,12,9,.95));color:var(--gh);cursor:pointer;
  display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 1px #000;transition:opacity .2s,transform .1s}
.sceIco svg{width:17px;height:17px}.sceIco:active{transform:scale(.9)}.sceIco[disabled]{opacity:.28;cursor:default}
.sceIco.spin svg{animation:sceSpin .45s ease-out}
#sceScr .sceLkP{margin:1px 0 0;height:2.5em;overflow:hidden;font:italic 500 clamp(12.5px,3.5vw,14px)/1.25 var(--bo);color:#d6c9ad}
.sceTiles{display:grid;gap:5px;justify-content:center;align-content:center;margin:4px 0 0}
.sceTile{position:relative;width:var(--ts);height:var(--ts);margin:0;padding:0;border:1px solid rgba(216,180,106,.2);border-radius:5px;overflow:hidden;cursor:pointer;
  background:radial-gradient(circle at 50% 36%,#32281f,#130f0c 70%);box-shadow:inset 0 0 0 1px rgba(0,0,0,.6);transition:border-color .2s,box-shadow .2s,transform .12s}
.sceTile canvas{display:block;width:100%;height:100%;opacity:0;transition:opacity .25s}.sceTile canvas.ok{opacity:1}
.sceTile.on{border-color:var(--gh);box-shadow:inset 0 0 12px rgba(255,205,130,.22),0 0 0 1px rgba(246,226,168,.45),0 0 12px rgba(255,205,130,.4)}
.sceTile.on::after{content:'';position:absolute;top:4px;right:4px;width:6px;height:6px;transform:rotate(45deg);background:var(--g);box-shadow:0 0 5px rgba(255,205,130,.9)}
.sceTile:active{transform:scale(.94)}
.sceTile.sw{background:none}.sceTile.sw canvas{opacity:1}
.sceRowC,.sceRowK{display:flex;align-items:center;gap:8px;height:30px}
.sceRowC>span,.sceRowK>span{flex:none;width:clamp(70px,20vw,88px);font:500 9.5px/1.15 var(--se);letter-spacing:.1em;text-transform:uppercase;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sceRowC em{display:block;margin-top:1px;font:700 11.5px/1.15 var(--se);font-style:normal;letter-spacing:.03em;text-transform:none;color:#f2e7cd;overflow:hidden;text-overflow:ellipsis}
.sceRowC em.l{font-size:clamp(9.5px,2.9vw,10.5px);letter-spacing:0}
.sceSws{display:flex;flex:1;min-width:0;justify-content:space-between;align-items:center}
.sceSw{flex:none;width:clamp(17px,5.3vw,22px);height:clamp(17px,5.3vw,22px);margin:0;padding:0;border-radius:50%;border:2px solid #120e0b;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.35),rgba(255,255,255,0) 45%),var(--c);
  cursor:pointer;box-shadow:0 0 0 1px rgba(216,180,106,.3);transition:transform .15s,box-shadow .2s}
.sceSw.on{transform:scale(1.18);box-shadow:0 0 0 2px var(--gh),0 0 10px rgba(255,205,130,.6)}.sceSw.no{background:radial-gradient(circle at 35% 30%,#6a5a50,#1b1612 70%)}
.sceSw.sp{position:relative}.sceSw.sp::after{content:'';position:absolute;inset:2px;border-radius:50%;border:1.5px dashed rgba(255,250,235,.9)}
.sceSws.many .sceSw{width:clamp(15px,4.7vw,20px);height:clamp(15px,4.7vw,20px)}
.sceSws.off,.sceRowC.off{opacity:.3;pointer-events:none}
.sceK{-webkit-appearance:none;appearance:none;flex:1;min-width:0;height:28px;margin:0;padding:0;background:none;cursor:pointer}
.sceK:focus{outline:none}
.sceK::-webkit-slider-runnable-track{height:4px;border-radius:2px;background:linear-gradient(90deg,transparent calc(50% - 1px),rgba(255,240,200,.7) calc(50% - 1px) calc(50% + 1px),transparent calc(50% + 1px)),linear-gradient(90deg,var(--g) 0 var(--v,50%),rgba(216,180,106,.2) var(--v,50%) 100%)}
.sceK::-moz-range-track{height:4px;border-radius:2px;background:rgba(216,180,106,.2)}.sceK::-moz-range-progress{height:4px;border-radius:2px;background:var(--g)}
.sceK::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-7px;border:2px solid #120e0b;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fff6da,#e2bf72 55%,#8a6a2a);box-shadow:0 0 0 1px rgba(246,226,168,.7),0 0 10px rgba(255,205,130,.55)}
.sceK::-moz-range-thumb{width:14px;height:14px;border:2px solid #120e0b;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fff6da,#e2bf72 55%,#8a6a2a);box-shadow:0 0 0 1px rgba(246,226,168,.7),0 0 10px rgba(255,205,130,.55)}
.sceKv{flex:none;width:48px;height:26px;margin:0;padding:0;border:0;background:none;color:#f2e7cd;font:700 13px var(--se);font-variant-numeric:tabular-nums;text-align:right;cursor:pointer}
.sceKv.n{color:#a8946a;font-weight:500}
.sceRowK.off{opacity:.3;pointer-events:none}
#sceScr.barber .sceSteps{visibility:hidden}
/* step IV: the summary with its little pictures */
#sceScr .sceSum li{gap:9px;align-items:center}.sceSum li span{flex:1}.sceSum .scePic{width:26px;height:26px}.sceSum .sceDot{width:20px;height:20px;margin:0 3px}
@keyframes sceSpin{from{transform:rotate(-200deg) scale(.7)}to{transform:none}}
.sceBtns{display:flex;gap:10px;justify-content:center;margin-top:clamp(7px,1.3vh,11px)}
.sceBtn{min-width:118px;min-height:46px;padding:10px 16px 11px;border:1px solid rgba(216,180,106,.5);background:linear-gradient(rgba(42,33,25,.94),rgba(16,12,10,.97));color:#efdfbb;cursor:pointer;
  font:700 14px/1 var(--se);letter-spacing:.14em;text-transform:uppercase;box-shadow:inset 0 1px 0 rgba(255,232,186,.14),0 0 0 1px #000,0 6px 16px rgba(0,0,0,.6);transition:transform .08s,opacity .3s,filter .2s}
.sceBtn:active{transform:translateY(2px) scale(.98)}
.sceGo{flex:1;max-width:260px;border-color:rgba(246,214,140,.85);color:#fff2cf;background:linear-gradient(rgba(92,70,40,.96),rgba(40,30,20,.98));
  box-shadow:inset 0 1px 0 rgba(255,236,190,.3),0 0 0 1px #000,0 0 18px rgba(255,196,100,.28),0 6px 16px rgba(0,0,0,.6)}
.sceGo:not([disabled]){animation:sceGlow 2.4s ease-in-out infinite}
.sceGo[disabled]{cursor:default;color:#a39885;border-color:rgba(216,180,106,.3);background:linear-gradient(rgba(34,29,25,.95),rgba(16,13,11,.98));box-shadow:0 0 0 1px #000}
.sceGo[disabled] .sceLk{margin-right:7px;vertical-align:-1px}
.sceGo small{display:block;margin-top:3px;font:500 10px/1 var(--bo);letter-spacing:.04em;text-transform:none;color:#b8a988}.sceGo[disabled]{padding-top:7px;padding-bottom:7px}
.sceBack{display:none}#sceScr:not(.s1) .sceBack{display:block}
.sceBand{position:absolute!important;left:0;right:0;top:50%;height:110px;margin-top:-55px;z-index:4!important;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;
  background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.82) 26%,rgba(0,0,0,.82) 74%,rgba(0,0,0,0))}
.sceBand span{display:block;text-align:center;font:700 clamp(19px,6.2vw,32px) var(--se);color:#f3d79c;text-transform:uppercase;white-space:nowrap;text-shadow:0 0 24px rgba(255,186,90,.6),0 0 3px #000;letter-spacing:.08em}
.sceBand small{display:block;margin-bottom:4px;font:500 clamp(11px,3.4vw,14px) var(--se);letter-spacing:.36em;color:#cdb78a}
#sceScr.band .sceBand{animation:sceBand 2.7s ease-out forwards}#sceScr.band .sceBand span{animation:sceSpace 2.7s ease-out forwards}
.sceFade{position:absolute!important;inset:0;z-index:5!important;background:#000;opacity:0;pointer-events:none;transition:opacity .5s}
#sceScr.fin .sceTop,#sceScr.fin .sceCol,#sceScr.fin .sceBot,#sceScr.fin .sceNameBox{opacity:0;transition:opacity .5s;pointer-events:none}
#sceScr.go .sceFade{opacity:1}
#sceScr.out{pointer-events:none;background:transparent}#sceScr.out>:not(.sceFade){display:none}#sceScr.out.clear .sceFade{opacity:0}
.sceSwap{animation:sceSwap .35s ease-out}
@keyframes sceIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.sceNameBox{animation-name:sceInX}@keyframes sceInX{from{opacity:0;transform:translate(-50%,-8px)}to{opacity:1;transform:translateX(-50%)}}
@keyframes sceSwap{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
@keyframes sceGlow{50%{box-shadow:inset 0 1px 0 rgba(255,236,190,.3),0 0 0 1px #000,0 0 28px rgba(255,196,100,.5),0 6px 16px rgba(0,0,0,.6)}}
@keyframes sceBand{0%{opacity:0}16%{opacity:1}74%{opacity:1}100%{opacity:0}}
@keyframes sceSpace{from{letter-spacing:.05em}to{letter-spacing:.12em}}
@keyframes sceShake{20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
.sceNo{animation:sceShake .35s}
/* the warning before it all */
.sceWarn{position:absolute!important;inset:0;z-index:6!important;display:flex;align-items:center;justify-content:center;padding:18px;background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,.5),rgba(0,0,0,.88));
  animation:sceWarnIn .6s ease-out backwards;transition:opacity .45s}
.sceWarn.out{opacity:0;pointer-events:none}
.sceWarnBox{position:relative;width:min(340px,100%);padding:18px 18px 16px;text-align:center;border:1px solid rgba(216,180,106,.5);background:linear-gradient(rgba(20,15,11,.97),rgba(8,6,5,.98));
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.7),inset 0 0 26px rgba(0,0,0,.6),0 0 40px rgba(0,0,0,.85),0 0 34px rgba(255,190,100,.1);animation:sceIn .7s .15s ease-out backwards;text-shadow:0 1px 0 #000}
.sceWarnBox::before,.sceWarnBox::after{content:'';position:absolute;top:-4px;width:7px;height:7px;transform:rotate(45deg);background:#0a0806;border:1px solid rgba(216,180,106,.7)}
.sceWarnBox::before{left:-4px}.sceWarnBox::after{right:-4px}
.sceWarnBox small{display:block;font:500 10px/1 var(--se);letter-spacing:.3em;text-transform:uppercase;color:var(--dim)}
.sceWarnBox h2{margin:8px 0 0;font:700 clamp(19px,5.6vw,24px)/1.1 var(--se);letter-spacing:.05em;color:var(--gh);text-shadow:0 0 16px rgba(255,196,110,.25),0 2px 0 #000}
.sceWarnBox p{margin:10px 0 0;font:italic 500 clamp(14px,4vw,16px)/1.36 var(--bo);color:#e4d8bd}
.sceWarnBox p b{font-style:normal;font-weight:600;color:var(--gh)}
.sceWarnBox p.sm{margin-top:8px;font-size:clamp(12.5px,3.5vw,14px);color:#a89c84}
.sceWarnBox .sceBtn{margin-top:15px;min-width:160px;border-color:rgba(246,214,140,.85);color:#fff2cf;background:linear-gradient(rgba(92,70,40,.96),rgba(40,30,20,.98));animation:sceGlow 2.4s ease-in-out infinite}
@keyframes sceWarnIn{from{opacity:0}}
@media (max-width:370px){.sceSteps li:not(.on) span{display:none}.sceSteps{gap:10px}.sceRow.m b{gap:5px}.sceDot{width:12px;height:12px}}
@media (max-height:800px){.sceTop small{display:none}.sceTop h1{margin-top:0}}
@media (max-height:600px){.sceSteps{display:none}.sceDesc ul li:nth-child(n+2){display:none}.sceSum li:nth-child(n+2){display:flex!important}.sceBtn{min-height:42px}}
@media (max-width:340px){.sceCol{padding:5px 4px 6px}.sceRow{padding-left:12px;font-size:12px}.sceRow::before{left:2px}.sceRow.m b{gap:5px}.sceStats dt{font-size:9.5px}}
@media (max-height:640px){#sceScr .sceLkP{display:none}}
@media (max-width:370px){.sceRow.p{gap:4px;padding-left:10px}.sceRow.p::before{left:1px}.sceRow.p .scePic{width:22px;height:22px}.sceRow.p b{font-size:13px}.sceRowC>span,.sceRowK>span{letter-spacing:.04em}}
@media (max-width:359px){.sceTab svg{width:18px;height:18px}.sceIco{width:27px;height:27px}.sceTabs{margin:0 -7px 4px}}
@media (prefers-reduced-motion:reduce){.sceTop,.sceCol,.sceBot,.sceGo:not([disabled]),.sceSwap,.sceNameBox,.sceIco.spin svg,.sceWarn,.sceWarnBox,.sceWarnBox .sceBtn{animation:none}}
`;document.head.appendChild(s)}
const SCE_LOCK='<svg class="sceLk" viewBox="0 0 10 11" aria-hidden="true"><path d="M2.6 5V3.4a2.4 2.4 0 0 1 4.8 0V5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="4.6" width="8" height="6" rx="1.2" fill="currentColor"/><rect x="4.4" y="6.6" width="1.2" height="2.2" rx=".6" fill="#000" opacity=".55"/></svg>';
const SCE_DICE='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="8.5" r="1.6" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.6" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.6" fill="currentColor"/></svg>';
const sceNum=n=>Number(n).toLocaleString('it-IT');

// ------------------------------------------------------------------ the screen
function sceOpen(op){if(SCE.on)return;op=op||{};sceCss();sceFonts();
  const el=document.createElement('div');el.id='sceScr';el.className='s1';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','sceTitle');
  el.innerHTML=`<canvas id="sceCv" aria-hidden="true"></canvas>
    <header class="sceTop"><small>Creazione dell'eroe</small><h1 id="sceTitle">${SCE_STEPS[0].t}</h1><div class="sceRule"><i></i></div>
      <ol class="sceSteps">${SCE_STEPS.map((s,i)=>`<li class="${i?'':'on'}"><b>${SCE_NUM[i]}</b><span>${s.l}</span></li>`).join('')}</ol></header>
    <main class="sceMid"><nav class="sceCol sceList" aria-label="Scelta"></nav><div class="sceStage" aria-hidden="true"></div><section class="sceCol sceStats" aria-live="polite"></section>
      <div class="sceNameBox"><label for="sceNameIn">Il nome del tuo eroe</label><div class="sceNameRow"><input id="sceNameIn" maxlength="14" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="done" placeholder="Il tuo nome"><button class="sceDice" aria-label="Un altro nome a caso">${SCE_DICE}</button></div></div></main>
    <footer class="sceBot"><div class="sceDesc" aria-live="polite"></div>
      <div class="sceBtns"><button class="sceBtn sceBack">‹ Indietro</button><button class="sceBtn sceGo">Avanti ›</button></div></footer>
    <div class="sceBand"><span><small></small>Il viaggio ha inizio</span></div><div class="sceFade"></div>`;
  $('wrap').appendChild(el);
  SCE.menuWas=!$('menu').hidden;if(SCE.menuWas)$('menu').hidden=true;
  const stats={};for(const id of SCE_IDS)stats[id]=sceStats(id);
  const nm=sceClean(SAVE.pname);
  Object.assign(SCE,{on:true,el,step:1,sel:null,manto:'',gift:null,name:nm&&nm!=='Esploratore'?nm:'',done:false,time:0,last:performance.now(),stats,hero:null,prev:null,gcur:null,gprev:null,
    mode:'hero',modeT:-9,kz:null,cx:null,cy:null,zl:1,emb:[],smk:[],motes:null,fog:null,bgK:'',fin:null,drag:null,vel:0,yaw:Math.PI/2-.5,low:!!SCE.low,ema:0,slow:0,err:0,pulse:-9,
    look:sceLook(SAVE.look),cat:'manto',barber:false,warn:!op.barber});
  // the warning first: after the making the look is changed only at the barber, paying; the hero comes onto the stone when it is closed
  if(SCE.warn){const w=document.createElement('div');w.className='sceWarn';w.setAttribute('role','alertdialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-labelledby','sceWarnT');w.setAttribute('aria-describedby','sceWarnP');
    w.innerHTML=`<div class="sceWarnBox"><small>Prima di cominciare</small><h2 id="sceWarnT">Scegli con cura</h2><div class="sceRule"><i></i></div>
      <p id="sceWarnP">Una volta creato l'eroe, il suo <b>aspetto</b> si cambia solo dal barbiere, <b>pagando in cristalli</b>, e gli <b>altri eroi</b> si comprano con l'oro nella scheda Eroi.</p>
      <p class="sm">Il nome e il mantello li cambi quando vuoi nel Profilo.</p><button class="sceBtn sceOk">Ho capito</button></div>`;
    el.appendChild(w);w.querySelector('.sceOk').addEventListener('click',sceWarnOk);setTimeout(()=>{if(SCE.warn)sceSnd('warn')},250)}
  if(!SCE.name)SCE.name=sceRandName();
  const inp=el.querySelector('#sceNameIn');inp.value=SCE.name;
  inp.addEventListener('input',()=>{SCE.name=sceClean(inp.value);sceNameShow()});
  inp.addEventListener('focus',()=>{initAudio();try{inp.select()}catch(e){}});
  inp.addEventListener('blur',()=>{const v=sceClean(inp.value);if(v!==inp.value)inp.value=v;SCE.name=v;sceNameShow()});
  el.querySelector('.sceDice').addEventListener('click',()=>{initAudio();sceSnd('move');SCE.name=sceRandName();inp.value=SCE.name;sceNameShow();if(SCE.hero)SCE.hero.act=sceT()});
  el.querySelector('.sceList').addEventListener('click',e=>{const r=e.target.closest('.sceRow');if(!r)return;if(SCE.step===1)scePick(r.dataset.id);else if(SCE.step===3)sceGiftPick(r.dataset.id)});
  const D=el.querySelector('.sceDesc');
  D.addEventListener('click',e=>{const T=e.target;let b;
    if(b=T.closest('[data-cat]'))sceCatPick(b.dataset.cat);else if(b=T.closest('.sceTile'))sceLookPick(b.dataset.id);else if(b=T.closest('.sceSw'))sceLookPick(b.dataset.sw,true);
    else if(b=T.closest('[data-act]')){const a=b.dataset.act;if(a==='rnd')sceLookRandom();else if(a==='reset')sceLookReset();else if(a==='k1')sceLookSize(1,true)}
    else if(b=T.closest('[data-go]'))sceToStep(+b.dataset.go)});
  D.addEventListener('input',e=>{if(e.target.classList.contains('sceK'))sceLookSize(+e.target.value/100,false)});
  D.addEventListener('change',e=>{if(e.target.classList.contains('sceK'))sceLookSize(+e.target.value/100,true)});
  el.querySelector('.sceGo').addEventListener('click',()=>sceGo());
  el.querySelector('.sceBack').addEventListener('click',()=>sceBack());
  sceStageInput(el.querySelector('.sceStage'));
  el.addEventListener('pointerdown',()=>{initAudio();if(AU.cur==null||AU.cur.name!=='scelta')playMusic('scelta')},{capture:true});
  if(op.barber)sceBarberSet(el);else{sceList();scePick('arciere',true)}sceDescFit();
  try{document.fonts.ready.then(()=>{if(SCE.on)sceDescFit()})}catch(e){}
  playMusic('scelta');
  cancelAnimationFrame(SCE.raf);SCE.raf=requestAnimationFrame(sceLoop)}
// the warning read: it fades and the hero comes onto the stone
function sceWarnOk(){if(!SCE.on||!SCE.warn||!SCE.el)return;SCE.warn=false;initAudio();sceSnd('ok');const w=SCE.el.querySelector('.sceWarn');if(w){w.classList.add('out');setTimeout(()=>w.remove(),450)}
  if(SCE.hero){SCE.hero.in=sceT()+.2;SCE.hero.es=0}}
// closing: the black stays a moment and then lifts off the menu (fade: false takes it all away at once)
function sceClose(fade){SCE.on=false;cancelAnimationFrame(SCE.raf);if(SCE.menuWas){SCE.menuWas=false;$('menu').hidden=false}const el=SCE.el;SCE.el=null;if(!el)return;
  if(!fade){el.remove();return}el.classList.add('out');requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('clear')));setTimeout(()=>el.remove(),800)}
const sceT=()=>SCE.time;
// the left column of each step (the second has none: the hero alone over the panel; the fourth neither: the name sits on the stage)
function sceList(){const L=SCE.el.querySelector('.sceList'),s=SCE.step;let h='';
  if(s===1)h='<h2>Classe</h2>'+SCE_IDS.map(id=>{const H=HERO_BY[id],lk=!sceFree(id);
    return `<button class="sceRow p${lk?' lock':''}" data-id="${id}" aria-pressed="false"><canvas class="scePic" data-hero="${id}" aria-hidden="true"></canvas><span><b>${H.n}</b>${lk?`<small>${SCE_LOCK}${sceNum(H.price)}<i class="sceCoin"></i></small>`:''}</span></button>`}).join('');
  else if(s===3)h='<h2>Dono</h2>'+SCE_GIFTS.map(g=>`<button class="sceRow g p" data-id="${g.id}" aria-pressed="false"><canvas class="scePic" data-gift="${g.id}" aria-hidden="true"></canvas><span><b>${g.n}</b></span></button>`).join('');
  L.innerHTML=h;L.classList.toggle('empty',s===2||s===4);
  L.classList.remove('sceSwap');void L.offsetWidth;if(s===1||s===3)L.classList.add('sceSwap');
  scePics(L);if(s===1||s===3)sceMark(s===1?SCE.sel:SCE.gift)}
function sceMark(id){for(const r of SCE.el.querySelectorAll('.sceList .sceRow')){const on=r.dataset.id===id;r.classList.toggle('on',on);r.setAttribute('aria-pressed',on?'true':'false')}}
// the little pictures of the lists and of the summary: the hero's head (with his look and his mantle; darker when locked), the gift
function scePic(cv,draw){const s=cv.clientWidth;if(!(s>4))return;const dpr=Math.min(window.devicePixelRatio||1,2.5),W=Math.round(s*dpr);if(cv.width!==W){cv.width=W;cv.height=W}
  const g=cv.getContext('2d'),sv=ctx,gt=G.t;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,W);ctx=g;G.t=1.3;
  try{g.setTransform(dpr,0,0,dpr,0,0);draw(s,g)}catch(e){}finally{ctx=sv;G.t=gt}}
function scePics(root){for(const cv of root.querySelectorAll('canvas.scePic')){const h=cv.dataset.hero,gi=cv.dataset.gift;
  if(h&&HERO_BY[h])scePic(cv,(s,g)=>{const dr=h==='druida',R=s*(dr?.25:.3);EROE.testa(s*.5,s*(dr?.64:.56),Math.PI/2-.4,R/10,{style:sceStyle(h),p:.3});
    if(!sceFree(h)){g.globalCompositeOperation='source-atop';g.fillStyle='rgba(10,10,14,.5)';g.fillRect(0,0,s,s);g.globalCompositeOperation='source-over'}});
  else if(gi&&window.C3&&SCE_G3[gi])scePic(cv,s=>{const flat=gi==='anello'||gi==='piuma',k=s/(gi==='piuma'?37:gi==='cassa'?27:gi==='cristalli'?27:31);
    ctx.translate(s*.5,s*(gi==='piuma'?.92:.84));ctx.scale(k,k);SCE_G3[gi](C3.V(flat?Math.PI/2+.6:.75),1.3,C3)})}}
// the texts of each step: the right column and the panel underneath
function sceHeroText(id){const h=HERO_BY[id],I=SCE_INFO[id],U=typeof ULT!=='undefined'&&ULT[id],S=SCE.stats[id],B=SCE.stats.arciere,lk=!sceFree(id),R=SCE.el.querySelector('.sceStats');
  // each number with a bar: how it stands against the best of the four (the dash: the shortest is the best)
  const ex=k=>{const v=SCE_IDS.map(i=>SCE.stats[i]&&SCE.stats[i][k]).filter(v=>v>0);return v.length?[Math.min(...v),Math.max(...v)]:[1,1]};
  R.classList.remove('empty');R.innerHTML='<h2>Statistiche</h2><dl>'+SCE_ROWS.map(([k,n,f,dir])=>{if(!S)return'';const v=S[k],b=B?B[k]:v,d=id==='arciere'?0:Math.sign((v-b)*dir)*(Math.abs(v-b)>1e-6?1:0),[lo,hi]=ex(k),fr=Math.max(.06,Math.min(1,dir>0?v/hi:lo/v));
    return `<dt style="--v:${fr.toFixed(3)}">${n}</dt><dd class="${d>0?'up':d<0?'dn':''}">${f(v)}${d?`<i>${d>0?'▲':'▼'}</i>`:''}</dd>`}).join('')+'</dl>';
  const D=SCE.el.querySelector('.sceDesc');D.style.setProperty('--c',I.hex);
  D.innerHTML=`<h3>${h.n}</h3><p>${SCE_LORE[id]||h.d}</p><ul><li><span>${h.start}</span></li>${U?`<li><span>Super: <b>${U.n}</b></span></li>`:''}</ul>`;
  // a locked one: the button says so, and where he is unlocked
  const go=SCE.el.querySelector('.sceGo');go.disabled=lk;go.innerHTML=lk?`<span>${SCE_LOCK}Bloccato</span><small>${sceNum(h.price)} oro nella scheda Eroi</small>`:'Avanti ›'}
// ------------------------------------------------------------------ step II: the look. The hero alone over the panel (the camera on the part:
// the whole hero for the mantle, the head turning for the hair and the ears, the face, the head and shoulders); in the panel the parts as
// icons, the part and the choice with the dice (a whole look at random) and the arrow back (this part as it was), a line about it, the
// choices as drawn tiles, the colour, the size
const SCE_ICON={manto:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3.6h6l1.3 2.6L20.2 20H3.8L7.7 6.2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.7 6.6L7.6 19.6M14.3 6.6l2.1 13" stroke="currentColor" stroke-width="1.1" opacity=".5"/><circle cx="12" cy="6.2" r="1.8" fill="currentColor"/></svg>',
  cappuccio:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.6 17.6c3.2 2 15.6 2 18.8 0-2.2-.9-4.4-1.4-6.4-1.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M7.4 16.4c.3-4.8 2.3-9.2 6.4-12.4.5 3.6.4 7 2.2 12.2-3 .9-5.8.9-8.6.2z" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M7.6 14.2q4.3 1.2 8.4-.4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  tatuaggi:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5c3 3.5 5 6.4 5 9.2a5 5 0 0 1-10 0c0-2.8 2-5.7 5-9.2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 9.6c1.4 1.6 2.2 2.8 2.2 3.8a2.2 2.2 0 0 1-4.4 0c0-1 .8-2.2 2.2-3.8z" fill="currentColor" opacity=".55"/><path d="M4 20.5h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="1.6 2.2"/></svg>',
  capelli:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17c0-6 3-11 7.5-11 3.2 0 5.5 2.4 6 5.2M9 17c0-4 1.6-7 4.2-7.4M13 17c0-2.4 1-4.2 2.6-4.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  orecchie:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.3 10.2C8.3 6.2 10.9 3.6 14.1 3.6s5.6 2.5 5.6 5.8c0 2.4-1.3 3.6-2.5 4.6-1.1 1-1.5 2-1.7 3.4-.3 2-1.7 3.1-3.5 3.1-1.6 0-2.8-.9-3.3-2.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.7 10.1c0-1.8 1.1-3 2.5-3s2.3 1.1 2.3 2.4c0 1.2-.8 1.8-1.5 2.4-.6.5-.9 1.1-.9 1.9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  pelle:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 4.5a7.5 7.5 0 0 1 0 15z" fill="currentColor" opacity=".6"/></svg>',
  occhi:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.8" fill="currentColor"/></svg>',
  sopr:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.5q4-3.4 7.5-.6M13 8.9q3.5-2.8 7.5.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="7.5" cy="14.5" r="2" fill="currentColor"/><circle cx="16.5" cy="14.5" r="2" fill="currentColor"/></svg>',
  bocca:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12c2.5-2.8 5.1-3.4 6.7-2.2.8.6 1.3.6 1.8.6s1 0 1.8-.6c1.6-1.2 4.2-.6 6.7 2.2-2.5 3.6-5.3 5.2-8.5 5.2s-6-1.6-8.5-5.2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3.5 12Q12 14.4 20.5 12C18 15.6 15.2 17.2 12 17.2S6 15.6 3.5 12z" fill="currentColor" opacity=".45"/></svg>',
  segni:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 6.8l2.6 9.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="14.6" cy="14.2" r="1" fill="currentColor"/><circle cx="16.4" cy="12.1" r="1" fill="currentColor"/></svg>',
  barba:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8c-.2 7.4 3 12.8 7 12.8S19.2 15.4 19 8c-1.5 2-3.2 2.9-4.6 2.2-.9-.5-1.5-.7-2.4-.7s-1.5.2-2.4.7C8.2 10.9 6.5 10 5 8z" fill="currentColor" fill-opacity=".4" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8.6 13.8q3.4 2 6.8 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  acc:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7.5" cy="13" r="3.8" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="16.5" cy="13" r="3.8" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M11.3 12.4q.7-.9 1.4 0M3.7 12.2L2.2 10.4M20.3 12.2l1.5-1.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'};
const SCE_UNDO='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.2a7.2 7.2 0 1 1-.4 6.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5.2 4.6v4.9h4.9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// the parts on this screen (at the barber the mantle stays in the Profile, where it is free)
const sceCats=()=>SCE.barber?SCE_CATS.filter(c=>c.id!=='manto'):SCE_CATS;
const sceLookCur=()=>SCE.cat==='manto'?SCE.manto:SCE.look[SCE_CAT[SCE.cat].key];
// the size of a part (1 when it has none, or it is not there)
const sceSizeOf=c=>{const K=SCE.look.k||{};return c.size&&SCE.look[c.key]!==LOOK_NONE[c.key]&&K[c.size]>0?K[c.size]:1};
// a part changed from the hero of always: its choice, its own colour (not the hair's, shown with the beard), its size
const sceCatMod=c=>c.id==='manto'?!!SCE.manto:SCE.look[c.key]!==LOOK_DEF[c.key]||!!(c.ckey&&!c.cshare&&SCE.look[c.ckey]!==LOOK_DEF[c.ckey])||sceSizeOf(c)!==1;
// what the heroes' own pieces hide: under the Balestriere's helmet the brows, the ears on top of the head, the headband and the crown
// (the hair shows round his face and under the helmet's rim)
const sceHides=(id,k,v)=>id==='balestriere'&&(k==='sopr'&&v!=='nessuna'||k==='orecchie'&&(v==='gatto'||v==='orso'||v==='coniglio')||k==='acc'&&(v==='fascia'||v==='coroncina')||k==='cappuccio'&&SCE_HAT(v)||k==='tatuaggio'&&v==='luna')
  ||id==='ninja'&&(k==='bocca'&&v!=='nessuna'||k==='barba'&&v!=='nessuna'||k==='segno'&&!SCE_NINJA_OK[v]||k==='tatuaggio'&&!SCE_NINJA_OK[v]);
// (what shows over the Ninja's mask: the scar through the eye, the rune and the moon up on the face)
const SCE_NINJA_OK={nessuno:1,cicatrice:1,runa:1,luna:1};
function sceLookUI(){const el=SCE.el,C=SCE_CAT[SCE.cat],D=el.querySelector('.sceDesc'),opts=C.id==='manto'?SCE_MANTI:C.list;el.querySelector('.sceStats').classList.add('empty');
  const tabs=`<div class="sceTabs" role="tablist" aria-label="Le parti">${sceCats().map(c=>`<button class="sceTab" data-cat="${c.id}" role="tab" aria-label="${c.n}" title="${c.n}">${SCE_ICON[c.id]}</button>`).join('')}</div>`;
  const hd=`<div class="sceLkHd"><h3></h3><button class="sceIco" data-act="rnd" aria-label="Un aspetto a caso" title="Un aspetto a caso">${SCE_DICE}</button><button class="sceIco" data-act="reset" aria-label="Questa parte com'era" title="Questa parte com'era">${SCE_UNDO}</button></div><p class="sceLkP"></p>`;
  const tiles=`<div class="sceTiles" role="listbox" aria-label="${C.n}">${opts.map(o=>`<button class="sceTile" data-id="${o.id}" role="option" aria-label="${o.n}" title="${o.n}"><canvas aria-hidden="true"></canvas></button>`).join('')}</div>`;
  const rc=C.cols?`<div class="sceRowC"><span>${C.cn}<em></em></span><div class="sceSws${C.cols.length>10?' many':''}">${C.cols.map(o=>`<button class="sceSw${o.sp?' sp':o.c?'':' no'}" data-sw="${o.id}" style="--c:${o.c||'#1b1612'}" aria-label="${o.n}" title="${o.n}"></button>`).join('')}</div></div>`:'';
  const rk=C.size?`<div class="sceRowK"><span>Grandezza</span><input class="sceK" type="range" min="${Math.round(LOOK_KMIN*100)}" max="${Math.round(LOOK_KMAX*100)}" step="1" value="100" aria-label="Grandezza"><button class="sceKv" data-act="k1" aria-label="Grandezza di sempre" title="Grandezza di sempre"></button></div>`:'';
  D.style.setProperty('--c','#f6e2a8');D.innerHTML=tabs+hd+tiles+rc+rk;
  const T=D.querySelector('.sceTiles');T.classList.remove('sceSwap');void T.offsetWidth;T.classList.add('sceSwap');
  sceTilesLayout();sceLookSync()}
// the tiles fill the same room in every part (the panel never changes height): two rows of tiles plus the colour and the size underneath;
// a part with fewer rows underneath or fewer choices gets bigger tiles
function sceTilesLayout(){const D=SCE.el&&SCE.el.querySelector('.sceDesc'),T=D&&D.querySelector('.sceTiles');if(!T)return;const C=SCE_CAT[SCE.cat],n=T.children.length,cs=getComputedStyle(D);
  const W=D.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),g=5,ROW=30,rows=(C.cols?1:0)+(C.size?1:0);if(!(W>40))return;
  const ts0=Math.max(34,Math.min(54,Math.floor((W-6*g)/7))),av=2*ts0+g+(2-rows)*ROW;
  let b=null;for(let r=1;r<=3;r++){const c=Math.ceil(n/r),ts=Math.min(n<4?92:66,(W-(c-1)*g)/c,(av-(r-1)*g)/r);if(!b||ts>b.ts+.5)b={c,ts}}
  const ts=Math.floor(b.ts);T.style.setProperty('--ts',ts+'px');T.style.gridTemplateColumns=`repeat(${b.c},${ts}px)`;T.style.height=av+'px';SCE.ts=ts}
// everything on the panel as the look is now (without building it again)
function sceLookSync(){const el=SCE.el;if(!el||SCE.step!==2)return;const C=SCE_CAT[SCE.cat],D=el.querySelector('.sceDesc');if(!D.querySelector('.sceTiles'))return;
  for(const b of D.querySelectorAll('.sceTab')){const c=SCE_CAT[b.dataset.cat],on=c.id===SCE.cat;b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false');b.classList.toggle('mod',sceCatMod(c))}
  const cur=sceLookCur(),opts=C.id==='manto'?SCE_MANTI:C.list,o=opts.find(x=>x.id===cur)||opts[0];
  for(const t of D.querySelectorAll('.sceTile')){const on=t.dataset.id===o.id;t.classList.toggle('on',on);t.setAttribute('aria-selected',on?'true':'false')}
  D.querySelector('.sceLkHd h3').innerHTML=`<small>${C.n}</small>${o.n}`;
  // a line about it (the heroes' own pieces stay)
  let p=o.d||C.d||'';const dr=SCE.sel==='druida';if(o.dc&&C.cols&&!lkFind(C.cols,SCE.look[C.ckey]).sp)p=o.dc;
  if(C.id==='manto'&&!o.id)p=`I colori di sempre ${(SCE_INFO[SCE.sel]||SCE_INFO.arciere).the.replace(/^l'/,"dell'").replace(/^la /,'della ').replace(/^il /,'del ')}. Lo cambi quando vuoi nel Profilo.`;
  else if(C.id==='occhi'&&dr)p='Il Druida tiene i suoi occhi verdi: cambiano la forma e la grandezza.';
  else if(sceHides(SCE.sel,C.key,o.id))p=SCE.sel==='ninja'?`Sotto la maschera del Ninja ${C.id==='bocca'?'la bocca non si vede':C.id==='barba'?'la barba non si vede':C.id==='tatuaggi'?'questo tatuaggio non si vede':'questo segno non si vede'}: sugli altri eroi sì.`
    :`Sotto l'elmo del Balestriere ${C.id==='sopr'?'le sopracciglia non si vedono':C.id==='orecchie'?'queste orecchie non si vedono':C.id==='cappuccio'?'il cappello non ci sta':C.id==='tatuaggi'?'la luna non si vede':o.id==='fascia'?'la fascia non si vede':'la corona non si vede'}: sugli altri eroi sì.`;
  else if(C.id==='capelli'&&SCE.sel==='cacciatrice'&&o.id==='nascosti')p='Il colore va anche alla coda della Cacciatrice.';
  D.querySelector('.sceLkP').textContent=p;
  if(C.cols){const R=D.querySelector('.sceRowC'),S=R.querySelector('.sceSws'),sp=sceColSp(C);R.classList.toggle('off',sceColOff(C));
    for(const w of S.children){const on=w.dataset.sw===SCE.look[C.ckey];w.classList.toggle('on',on);w.setAttribute('aria-pressed',on?'true':'false');if(w.classList.contains('sp'))w.style.setProperty('--c',sp)}
    const em=R.querySelector('em'),cn=C.id==='occhi'&&dr?'Verdi':lkFind(C.cols,SCE.look[C.ckey]).n;em.textContent=cn;em.classList.toggle('l',cn.length>9)}
  if(C.size){const R=D.querySelector('.sceRowK'),inp=R.querySelector('.sceK'),v=Math.round(sceSizeOf(C)*100);R.classList.toggle('off',SCE.look[C.key]===LOOK_NONE[C.key]||sceHides(SCE.sel,C.key,SCE.look[C.key]));if(+inp.value!==v)inp.value=v;sceKShow(R,v)}
  D.querySelector('[data-act="reset"]').disabled=!sceCatMod(C);
  sceBarberBtn();sceTilesQueue()}
// a part whose colour cannot change now: the Druida's eyes, a part that is not there or does not show, a mark that takes no colour
function sceColOff(C){if(!C.cols)return true;const v=SCE.look[C.key];if(C.id==='occhi')return SCE.sel==='druida';if(C.id==='segni')return!SCE_MARKCOL[v];if(C.id==='cappuccio')return!SCE_HAT(v)||sceHides(SCE.sel,C.key,v);
  return v===LOOK_NONE[C.key]||v==='nessuno'||sceHides(SCE.sel,C.key,v)}
// the colour shown by the first swatch (the one that follows something else)
function sceColSp(C){const L=SCE.look,hair=lkFind(SCE_COLCAP,L.colCap).c;
  if(C.ckey==='colSopr')return hxMix(hair,'#1b1612',.42);if(C.ckey==='colBarba')return hair;if(C.ckey==='colBocca')return'#8a3a2e';
  if(C.ckey==='colSegno')return SCE_MARKCOL[L.segno]||SCE_MARKCOL.pittura;if(C.ckey==='colTat')return'#2e4c8c';
  if(C.ckey==='colCop')return(EROE.hatCol&&EROE.hatCol[L.cappuccio])||'#c8323c';
  if(C.ckey==='colAcc'){if(SCE_ACCFIX[L.acc])return SCE_ACCFIX[L.acc];try{return accCol(sceStyle(SCE.sel||'arciere'))}catch(e){return'#d24b3e'}}
  return'#1b1612'}
function sceKShow(R,v){const b=R.querySelector('.sceKv');b.textContent=v+'%';b.classList.toggle('n',v===100);R.querySelector('.sceK').style.setProperty('--v',((v-LOOK_KMIN*100)/((LOOK_KMAX-LOOK_KMIN)*100)*100).toFixed(1)+'%')}
// how a tile looks at the hero: his head alone (testa) or the hero from the waist up (body); f: the face; s: the radius of the head in
// tiles; (x, y): where the centre of the head goes; hood: the hood lowered (the hair shows whole)
const SCE_TILE={head:{f:Math.PI/2-.45,s:.32,x:.5,y:.58},hair:{f:Math.PI/2-.75,s:.32,x:.47,y:.5,hood:'senza'},hat:{f:Math.PI/2-.42,s:.24,x:.5,y:.72},face:{f:Math.PI/2-.3,s:.58,x:.35,y:.36},
  marks:{f:Math.PI/2,s:.74,x:.5,y:.3},eyes:{f:Math.PI/2-.3,s:.92,x:.24,y:.4},brows:{f:Math.PI/2-.3,s:.92,x:.24,y:.5},mouth:{f:Math.PI/2-.3,s:1.1,x:.18,y:-.1},
  chin:{f:Math.PI/2-.35,s:.42,x:.4,y:.22},bust:{body:1,f:Math.PI/2-.4,s:.34,x:.5,y:.43},body:{body:1,f:Math.PI/2-.4,s:.27,x:.5,y:.36}};
// the hero's style with that choice in that part (the rest of the look as it is now)
function sceTileStyle(C,id,T){const kl=SCE.look,km=SCE.manto;
  try{if(C.id==='manto')SCE.manto=id;else{SCE.look={...kl,[C.key]:id};if(T.hood)SCE.look.cappuccio=T.hood}return sceStyle(SCE.sel||'arciere')}finally{SCE.look=kl;SCE.manto=km}}
function sceTileDraw(cv,C,id,ts){const T=SCE_TILE[C.prev]||SCE_TILE.head,dpr=Math.min(window.devicePixelRatio||1,LOWFX||SCE.low?1.5:2.5),W=Math.max(8,Math.round(ts*dpr));
  if(cv.width!==W){cv.width=W;cv.height=W}const g=cv.getContext('2d'),st=sceTileStyle(C,id,T),sv=ctx,gt=G.t;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,W);ctx=g;G.t=1.3;
  try{g.setTransform(dpr,0,0,dpr,0,0);const R=T.s*ts;
    if(T.body)EROE.arciere(ts*T.x,ts*T.y+2.6*R,T.f,'idle',.3,R/10,{style:st,moss:false,noFx:true});else EROE.testa(ts*T.x,ts*T.y,T.f,R/10,{style:st,p:.3})}
  catch(e){}finally{ctx=sv;G.t=gt}cv.classList.add('ok')}
// a tile is drawn again only when what it shows has changed; the one picked first, then a few per frame
function sceTilesQueue(){const T=SCE.el&&SCE.el.querySelector('.sceTiles');if(!T)return;const C=SCE_CAT[SCE.cat],ts=SCE.ts||48,key=JSON.stringify([SCE.sel,C.id==='manto'?'':SCE.manto,{...SCE.look,[C.key]:0},ts]),q=[];
  for(const b of T.children){const cv=b.firstChild,k=key+'|'+b.dataset.id;if(cv.dataset.k!==k)q.push({cv,C,id:b.dataset.id,k,ts,on:b.classList.contains('on')?1:0})}
  q.sort((a,b)=>b.on-a.on);SCE.tq=q}
function sceTilesTick(){const q=SCE.tq;if(!q||!q.length)return;const t0=performance.now(),lim=LOWFX||SCE.low?3:6;
  do{const it=q.shift();if(it.cv.isConnected){sceTileDraw(it.cv,it.C,it.id,it.ts);it.cv.dataset.k=it.k}}while(q.length&&performance.now()-t0<lim)}
// the button of the barber (in the making of the hero it is just «Avanti»)
function sceBarberBtn(){const go=SCE.el.querySelector('.sceGo');go.disabled=false;
  if(!SCE.barber){go.textContent='Avanti ›';return}
  const ch=sceLookChanged();go.innerHTML=ch?`Conferma · ${BARBER_PRICE}<i class="sceGem" style="margin-left:5px;width:14px;height:14px;vertical-align:-2px"></i>`:'Esci'}
const BARBER_PRICE=20;
const sceLookChanged=()=>JSON.stringify(sceLook(SCE.look))!==JSON.stringify(sceLook(SAVE.look));
// a part: its tiles, the camera on it
function sceCatPick(id){if(SCE.done||!SCE.on||SCE.step!==2||!SCE_CAT[id]||(SCE.barber&&id==='manto'))return;initAudio();if(SCE.cat!==id){sceSnd('move');SCE.cat=id;sceLookUI()}}
// a choice (col: a colour of the part)
function sceLookPick(id,col){if(SCE.done||!SCE.on||SCE.step!==2)return;const C=SCE_CAT[SCE.cat];if(C.id==='manto'&&!col){sceMantoPick(id);return}
  const key=col?C.ckey:C.key,L=col?C.cols:C.list;if(!key||!L||!L.some(o=>o.id===id)||(col&&sceColOff(C)))return;initAudio();sceSnd('move');
  if(SCE.look[key]!==id){SCE.look[key]=id;SCE.pulse=sceT();const o=lkFind(L,id),rgb=o.c?rgbStr(o.c):'255,226,180';for(let i=0;i<(LOWFX||SCE.low?4:10);i++)sceEmber(rgb,true);if(SCE.hero&&C.cam==='face')SCE.hero.blink=sceT()}
  sceLookSync()}
// the size (v: .7 to 1.3). While the finger slides only the hero and the numbers follow; the tiles are drawn again when it lets go
function sceLookSize(v,done){if(SCE.done||!SCE.on||SCE.step!==2)return;const C=SCE_CAT[SCE.cat];if(!C.size||SCE.look[C.key]===LOOK_NONE[C.key])return;
  v=Math.round(Math.min(LOOK_KMAX,Math.max(LOOK_KMIN,v))*100)/100;const was=sceSizeOf(C);
  if(v!==was){SCE.look.k={...(SCE.look.k||{}),[C.size]:v};const a=Math.round(was*20),b=Math.round(v*20);if(a!==b||v===1){initAudio();sceSnd(v===1?'mid':'tick')}}
  if(done){sceLookSync();return}
  const D=SCE.el.querySelector('.sceDesc'),R=D.querySelector('.sceRowK');if(R)sceKShow(R,Math.round(v*100));
  for(const b of D.querySelectorAll('.sceTab'))b.classList.toggle('mod',sceCatMod(SCE_CAT[b.dataset.cat]));D.querySelector('[data-act="reset"]').disabled=!sceCatMod(C);sceBarberBtn()}
// this part as it was (its choice, its colour, its size)
function sceLookReset(){if(SCE.done||!SCE.on||SCE.step!==2)return;const C=SCE_CAT[SCE.cat];if(!sceCatMod(C))return;initAudio();sceSnd('back');
  const b=SCE.el.querySelector('[data-act="reset"]');if(b){b.classList.remove('spin');void b.offsetWidth;b.classList.add('spin')}
  if(C.id==='manto'){sceMantoPick('',true);return}
  SCE.look[C.key]=LOOK_DEF[C.key];if(C.ckey&&!C.cshare)SCE.look[C.ckey]=LOOK_DEF[C.ckey];if(C.size)SCE.look.k={...(SCE.look.k||{}),[C.size]:1};
  SCE.pulse=sceT();if(SCE.hero&&C.cam==='face')SCE.hero.blink=sceT();sceLookSync()}
// a whole look at random (and a mantle, while the hero is being made): most of the time the hood up, natural hair, no beard
function sceLookRandom(){if(SCE.done||!SCE.on||SCE.step!==2)return;initAudio();sceSnd('dice');
  const r=Math.random,any=L=>L[randi(0,L.length-1)].id,or=(L,none,p)=>r()<p?none:any(L.filter(o=>o.id!==none)),nat=['castani','neri','biondi','rossi','bianchi','cenere'];
  let L;do L={pelle:any(SCE_PELLE),occhi:any(SCE_OCCHI),iride:or(SCE_IRIDE,'scuri',.35),sopr:or(SCE_SOPR,'nessuna',.3),bocca:or(SCE_BOCCA,'nessuna',.3),segno:or(SCE_SEGNI,'nessuno',.45),
    capelli:any(SCE_CAPELLI),colCap:r()<.72?nat[randi(0,nat.length-1)]:any(SCE_COLCAP),barba:or(SCE_BARBA,'nessuna',.65),orecchie:or(SCE_ORECCHIE,'tonde',.55),cappuccio:r()<.5?'su':r()<.3?'senza':any(SCE_CAPPUCCIO.slice(2)),acc:or(SCE_ACC,'nessuno',.45),tatuaggio:or(SCE_TATUAGGI,'nessuno',.7),
    colTat:r()<.7?'naturale':any(SCE_COLTAT),colCop:r()<.6?'auto':any(SCE_COLCOP),
    colSopr:r()<.75?'capelli':any(SCE_COLPEL),colBocca:r()<.7?'naturale':any(SCE_COLBOC),colSegno:r()<.6?'naturale':any(SCE_COLPIT),colBarba:r()<.75?'capelli':any(SCE_COLPEL),colAcc:r()<.5?'auto':any(SCE_COLACC)};
  while(!sceLookN(L));
  SCE.look=sceLook(L);if(!SCE.barber&&r()<.6)SCE.manto=any(SCE_MANTI);
  const t=sceT();SCE.pulse=t;if(SCE.hero)SCE.hero.blink=t;for(let i=0;i<(LOWFX||SCE.low?6:16);i++)sceEmber(['255,226,180','255,190,120','190,220,255'][i%3],true);
  const b=SCE.el.querySelector('[data-act="rnd"]');if(b){b.classList.remove('spin');void b.offsetWidth;b.classList.add('spin')}
  sceLookSync()}
function sceGiftText(id){const g=SCE_GIFT[id],R=SCE.el.querySelector('.sceStats');R.classList.remove('empty');
  R.innerHTML='<h2>Contenuto</h2><dl>'+g.rows.map(([n,v,ic])=>`<dt>${n}</dt><dd>${v}${ic==='coin'?'<i class="sceCoin"></i>':ic==='gem'?'<i class="sceGem"></i>':''}</dd>`).join('')+'</dl>';
  const D=SCE.el.querySelector('.sceDesc');D.style.setProperty('--c','#f6e2a8');D.innerHTML=`<h3>${g.n}</h3><p>${g.d}</p>`;
  const go=SCE.el.querySelector('.sceGo');go.disabled=false;go.textContent='Avanti ›'}
// the summary of the last step (a tap on a line goes back to that step)
function sceSummary(){if(!SCE.el||SCE.step!==4)return;SCE.el.querySelector('.sceStats').classList.add('empty');
  const D=SCE.el.querySelector('.sceDesc'),H=HERO_BY[SCE.sel],m=SCE_MANTO[SCE.manto]||SCE_MANTI[0],g=SCE_GIFT[SCE.gift],n=sceLookN(SCE.look);D.style.setProperty('--c',SCE_INFO[SCE.sel].hex);
  D.innerHTML=`<h3>${SCE.name||'Il tuo eroe'}</h3><ul class="sceSum"><li data-go="1"><canvas class="scePic" data-hero="${SCE.sel}" aria-hidden="true"></canvas><span>Classe</span><b>${H.n}</b></li>`+
    `<li data-go="2"><i class="sceDot${m.id?'':' o'}" style="--a:${m.hood||'#fff'};--b:${m.body||'#000'}"></i><span>Aspetto</span><b>${m.n}${n?` · ${n} ritocch${n>1?'i':'o'}`:''}</b></li>`+
    `<li data-go="3"><canvas class="scePic" data-gift="${g?g.id:''}" aria-hidden="true"></canvas><span>Dono</span><b>${g?g.n:'—'}</b></li></ul>`;
  scePics(D);const go=SCE.el.querySelector('.sceGo');go.disabled=false;go.textContent='Inizia'}
// while you write: only the name over the summary changes (rebuilding it would lose a tap on its lines when the keyboard closes)
const sceNameShow=()=>{const h=SCE.el&&SCE.step===4&&SCE.el.querySelector('.sceDesc h3');if(h)h.textContent=SCE.name||'Il tuo eroe'};
function sceText(){const s=SCE.step;if(s===1)sceHeroText(SCE.sel);else if(s===2)sceLookUI();else if(s===3)sceGiftText(SCE.gift);else sceSummary()}
// the panels of steps I, III and IV are as high as the longest of their texts (measured once, and again when the fonts arrive or the screen
// turns), so the buttons never jump; the panel of the look has its own height, the same for every part
function sceDescFit(){if(!SCE.el||SCE.fin||SCE.done)return;const el=SCE.el,D=el.querySelector('.sceDesc'),keep=SCE.step,cls=el.className;el.style.setProperty('--dh','0px');let mx=0;
  if(!SCE.barber){const gk=SCE.gift;try{el.className='s1';for(const id of SCE_IDS){sceHeroText(id);mx=Math.max(mx,D.offsetHeight)}
      el.className='s3';for(const g of SCE_GIFTS){sceGiftText(g.id);mx=Math.max(mx,D.offsetHeight)}
      el.className='s4';SCE.step=4;if(!SCE.gift)SCE.gift=SCE_GIFTS[4].id;sceSummary();mx=Math.max(mx,D.offsetHeight)}
    finally{SCE.gift=gk;SCE.step=keep;el.className=cls}}
  el.style.setProperty('--dh',Math.ceil(mx)+'px');sceText()}
// picking a hero: the old one sinks into the dark, the new one comes up into the light
function scePick(id,quiet){if(SCE.done||!SCE.on||SCE.step!==1||!HERO_BY[id])return;const t=sceT();
  if(!quiet){initAudio();sceSnd(sceFree(id)?'move':'lock')}
  if(SCE.sel===id){if(SCE.hero&&t-SCE.hero.act>1.6)SCE.hero.act=t;return}
  if(SCE.hero)SCE.prev={...SCE.hero,t0:t};
  SCE.sel=id;SCE.hero={id,act:-1,in:SCE.warn?1e9:t,anim:'idle',bl:null,lastA:null,shot:false,ent:true,es:0};
  for(let i=0;i<(LOWFX||SCE.low?6:14);i++)sceEmber(SCE_INFO[id].rgb,true);
  sceMark(id);sceHeroText(id)}
// a mantle: the cloth takes the colour in a flash of light
function sceMantoPick(id,quiet){if(SCE.done||!SCE.on||SCE.step!==2||!SCE_MANTO[id])return;if(!quiet){initAudio();sceSnd('move')}
  if(SCE.manto!==id){SCE.manto=id;SCE.pulse=sceT();const m=SCE_MANTO[id],rgb=m.hood?rgbStr(m.hood):SCE_INFO[SCE.sel].rgb;for(let i=0;i<(LOWFX||SCE.low?6:16);i++)sceEmber(rgb,true)}
  sceLookSync()}
const rgbStr=h=>{const n=parseInt(h.slice(1),16);return`${n>>16&255},${n>>8&255},${n&255}`};
function sceGiftPick(id,quiet){if(SCE.done||!SCE.on||SCE.step!==3||!SCE_GIFT[id])return;const t=sceT();
  if(!quiet){initAudio();sceSnd('move')}
  if(SCE.gift===id){if(SCE.gcur)SCE.gcur.pop=t;return}
  if(SCE.gcur)SCE.gprev={...SCE.gcur,t0:t};
  SCE.gift=id;SCE.gcur={id,t0:t,pop:t};for(let i=0;i<(LOWFX||SCE.low?5:12);i++)sceEmber(SCE_GIFT[id].rgb,true,true);
  sceMark(id);sceGiftText(id)}
// from one step to another: the title, the marks over the steps, the columns; the hero leaves the stone to the gift and comes back
function sceToStep(n){if(SCE.done||!SCE.on||n===SCE.step||n<1||n>4)return;if(n>1&&!sceFree(SCE.sel))return;const from=SCE.step,t=sceT();SCE.step=n;SCE.el.className='s'+n;
  SCE.el.querySelector('#sceTitle').textContent=SCE_STEPS[n-1].t;SCE.el.querySelectorAll('.sceSteps li').forEach((li,i)=>{li.classList.toggle('on',i===n-1);li.classList.toggle('ok',i<n-1)});
  if(n===3){if(!SCE.gift)SCE.gift=SCE_GIFTS[0].id;SCE.mode='gift';SCE.modeT=t;SCE.gcur={id:SCE.gift,t0:t+.18,pop:t+.18};SCE.gprev=null}
  else if(from===3){SCE.mode='hero';SCE.modeT=t;if(SCE.gcur)SCE.gprev={...SCE.gcur,t0:t,into:n===4};SCE.gcur=null;if(SCE.hero){SCE.hero.in=t+.12}
    if(n===4){for(let i=0;i<(LOWFX||SCE.low?10:24);i++)sceEmber(SCE_GIFT[SCE.gift].rgb,true);SCE.pulse=t+.25;sceSnd('absorb')}}
  sceList();sceText();if(n===4){const i=SCE.el.querySelector('#sceNameIn');if(i.value!==SCE.name)i.value=SCE.name}}
function sceGo(){if(SCE.done||!SCE.on)return;initAudio();if(SCE.barber){sceBarberDone();return}
  if(SCE.step===1&&!sceFree(SCE.sel)){sceSnd('lock');const b=SCE.el.querySelector('.sceGo');b.classList.remove('sceNo');void b.offsetWidth;b.classList.add('sceNo');if(SCE.hero)SCE.hero.no=sceT();return}
  if(SCE.step<4){sceSnd('ok');sceToStep(SCE.step+1);return}
  sceFinish()}
function sceBack(){if(SCE.done||!SCE.on||SCE.step<2)return;sceSnd('back');if(SCE.barber){sceBarberClose(false);return}const a=document.activeElement;if(a&&a.id==='sceNameIn')a.blur();sceToStep(SCE.step-1)}
// ------------------------------------------------------------------ the barber (Profilo → Aspetto): the same screen, only the look of the face, the
// hair and the accessories, on the hero in the field with his mantle. Changing costs crystals (Denis: «a pagamento»), only when
// something changed and only on «Conferma»; «Annulla» or Esc leave it as it was
function sceBarberRow(){const el=$('barber');if(!el)return;const n=sceLookN(SAVE.look);
  el.innerHTML=`<div class="barberRow"><p>${n?`${n} ritocch${n>1?'i':'o'} al tuo eroe.`:'Il tuo eroe è come il primo giorno.'} Viso, capelli, barba, orecchie e accessori si cambiano dal barbiere.</p><button class="btn" id="barberGo">✂ Barbiere · ${BARBER_PRICE}<i class="gemI"></i></button></div>`;
  $('barberGo').onclick=()=>{try{sfx('ui')}catch(e){}sceOpen({barber:true})}}
function sceBarberSet(el){const id=HERO_BY[SAVE.hero]?SAVE.hero:'arciere',t=sceT();Object.assign(SCE,{barber:true,step:2,sel:id,manto:'',cat:'capelli',look:sceLook(SAVE.look),yaw:Math.PI/2-.35});
  SCE.hero={id,act:-1,in:t,anim:'idle',bl:null,lastA:null,shot:false};el.className='s2 barber';
  el.querySelector('.sceTop small').textContent='Cambia aspetto';el.querySelector('#sceTitle').textContent='Il barbiere';el.querySelector('.sceBack').textContent='‹ Annulla';
  for(let i=0;i<(LOWFX||SCE.low?6:14);i++)sceEmber(SCE_INFO[id].rgb,true);sceList();sceText()}
function sceBarberDone(){if(!sceLookChanged()){sceSnd('back');sceBarberClose(false);return}
  if((SAVE.gems||0)<BARBER_PRICE){sceSnd('lock');const b=SCE.el.querySelector('.sceGo');b.classList.remove('sceNo');void b.offsetWidth;b.classList.add('sceNo');
    const p=SCE.el.querySelector('.sceDesc p');if(p)p.textContent=`Servono ${BARBER_PRICE} cristalli: ne hai ${SAVE.gems||0}.`;return}
  SAVE.gems-=BARBER_PRICE;SAVE.look=sceLookN(SCE.look)?sceLook(SCE.look):null;try{save()}catch(e){}SCE.done=true;sceSnd('ok');const t=sceT();SCE.pulse=t;if(SCE.hero)SCE.hero.act=t+.1;
  for(let i=0;i<(LOWFX||SCE.low?8:20);i++)sceEmber(SCE_INFO[SCE.sel].rgb,true);setTimeout(()=>sceBarberClose(true),1200)}
function sceBarberClose(paid){if(!SCE.on||!SCE.el)return;SCE.done=true;SCE.el.classList.add('go');
  setTimeout(()=>{sceClose(true);playMusic('menu');try{renderGold();renderTop.k=null;renderTop();renderProfile();renderPlay()}catch(e){}if(paid)try{toast('Nuovo aspetto!')}catch(e){}},paid?480:300)}
// the end: he shoots into the sky, «Il viaggio ha inizio» with his name, the menu
function sceFinish(){if(SCE.done||!SCE.on||!sceFree(SCE.sel)||!SCE.gift)return;const inp=SCE.el.querySelector('#sceNameIn');
  SCE.name=sceClean(inp?inp.value:SCE.name)||SCE.name||sceRandName();if(inp){inp.value=SCE.name;inp.blur()}
  SCE.done=true;const id=SCE.sel,g=SCE_GIFT[SCE.gift],t=sceT();
  // the choice: the hero picked is the one you own and play; the other one of the first two is for sale in the hero tab
  const hs={};for(const k in SAVE.heroes||{})if(!sceFree(k))hs[k]=SAVE.heroes[k];hs[id]=1;
  sceOwnSkins();SAVE.starter=id;SAVE.hero=id;SAVE.heroes=hs;SAVE.dono=g.id;SAVE.pname=SCE.name;SAVE.skin=SCE.manto||null;SAVE.look=sceLookN(SCE.look)?sceLook(SCE.look):null;try{g.give()}catch(e){}heroView=id;heroConfirm=null;
  // written now even while the prologue is on (save() waits for its end): in three blocks like save() (07)
  try{saveCheck(SAVE)}catch(e){}try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveBlocks(SAVE)))}catch(e){}
  if(INTRO.on&&INTRO.snap){try{const s=JSON.parse(INTRO.snap);for(const k of['starter','hero','heroes','dono','pname','skin','skins','look','gold','gems','slots','items','eq','piuma'])s[k]=SAVE[k];INTRO.snap=JSON.stringify(s)}catch(e){}}
  SCE.fin={t0:t};SCE.el.classList.add('fin');SCE.el.querySelector('.sceBand small').textContent=SCE.name;sceSnd('ok');if(SCE.hero)SCE.hero.act=t+.2;
  for(let i=0;i<(LOWFX||SCE.low?8:20);i++)sceEmber(SCE_INFO[id].rgb,true);
  setTimeout(()=>{if(SCE.el){SCE.el.classList.add('band');sceSnd('band')}},1350);
  setTimeout(()=>{if(SCE.el)SCE.el.classList.add('go')},3700);
  setTimeout(()=>sceDone(g),4250)}
function sceDone(g){if(!SCE.on)return;sceClose(true);playMusic('menu');
  try{if(!INTRO.on){renderGold();renderPlay();renderWho();renderTop.k=null;renderTop()}}catch(e){}
  setTimeout(()=>{try{if(!INTRO.on)toast(`Dono: ${g.n}${g.id==='oro'?' (+500 oro)':g.id==='cristalli'?' (+30 cristalli)':g.id==='cassa'?' (tra le tue casse)':''}`)}catch(e){}},700)}
// keys: up and down (or left and right, W/S, A/D) move in the list, Enter or Space go on, Esc goes back; in the look left and right
// (A/D) change the part, up and down the choice, Q and E the colour, - and + the size, R a look at random, Delete the part as it was;
// while writing the name only Enter (done) and Esc count
addEventListener('resize',()=>{if(SCE.on)setTimeout(sceDescFit,60)});
addEventListener('keydown',e=>{if(!SCE.on)return;e.stopImmediatePropagation();
  if(e.target&&e.target.id==='sceNameIn'){if(e.key==='Enter'){e.preventDefault();e.target.blur();sceGo()}else if(e.key==='Escape'){e.preventDefault();e.target.blur()}return}
  if(SCE.done){e.preventDefault();return}
  if(SCE.warn){e.preventDefault();if(e.code==='Enter'||e.code==='Space'||e.code==='NumpadEnter'||e.code==='Escape')sceWarnOk();return}
  const s=SCE.step,C2=s===2&&SCE_CAT[SCE.cat],ids=s===1?SCE_IDS:s===2?(C2.id==='manto'?SCE_MANTI:C2.list).map(o=>o.id):s===3?SCE_GIFTS.map(g=>g.id):[],cur=s===1?SCE.sel:s===2?sceLookCur():SCE.gift,i=Math.max(0,ids.indexOf(cur)),c=e.code;
  const mv=d=>{e.preventDefault();if(!ids.length)return;const j=Math.max(0,Math.min(ids.length-1,i+d));if(s===1)scePick(ids[j]);else if(s===2)sceLookPick(ids[j]);else sceGiftPick(ids[j])};
  const part=d=>{e.preventDefault();const L=sceCats(),j=(L.findIndex(o=>o.id===SCE.cat)+d+L.length)%L.length;sceCatPick(L[j].id)};
  const colour=d=>{e.preventDefault();if(!C2||!C2.cols||sceColOff(C2))return;const L=C2.cols,j=(L.findIndex(o=>o.id===SCE.look[C2.ckey])+d+L.length)%L.length;sceLookPick(L[j].id,true)};
  const size=d=>{e.preventDefault();if(C2&&C2.size)sceLookSize(sceSizeOf(C2)+d*.05,true)};
  if(s===2&&(c==='ArrowLeft'||c==='KeyA'))part(-1);else if(s===2&&(c==='ArrowRight'||c==='KeyD'))part(1);
  else if(s===2&&(c==='KeyQ'||c==='KeyE'))colour(c==='KeyQ'?-1:1);
  else if(s===2&&(c==='Minus'||c==='NumpadSubtract'||c==='Equal'||c==='NumpadAdd'||c==='BracketRight'))size(c==='Minus'||c==='NumpadSubtract'?-1:1);
  else if(s===2&&c==='KeyR'){e.preventDefault();sceLookRandom()}
  else if(s===2&&c==='Delete'){e.preventDefault();sceLookReset()}
  else if(c==='ArrowUp'||c==='KeyW'||c==='ArrowLeft'||c==='KeyA')mv(-1);
  else if(c==='ArrowDown'||c==='KeyS'||c==='ArrowRight'||c==='KeyD')mv(1);
  else if(c==='Enter'||c==='Space'||c==='NumpadEnter'){e.preventDefault();sceGo()}
  else if(c==='Escape'||c==='Backspace'){e.preventDefault();sceBack()}},true);
// the finger on the hero: drag sideways to turn him, a tap makes him show what he can do
function sceStageInput(st){
  st.addEventListener('pointerdown',e=>{if(SCE.done)return;initAudio();SCE.drag={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,t:performance.now(),t0:performance.now(),moved:false};try{st.setPointerCapture(e.pointerId)}catch(_){}});
  st.addEventListener('pointermove',e=>{const d=SCE.drag;if(!d||d.id!==e.pointerId)return;const now=performance.now(),dx=e.clientX-d.x;d.x=e.clientX;
    if(Math.abs(e.clientX-d.x0)>7||Math.abs(e.clientY-d.y0)>7)d.moved=true;const a=-dx*.0135;SCE.yaw+=a;const dt=Math.max(.008,(now-d.t)/1000);SCE.vel=a/dt;d.t=now});
  const up=e=>{const d=SCE.drag;if(!d||d.id!==e.pointerId)return;SCE.drag=null;if(performance.now()-d.t>120)SCE.vel=0;
    if(!d.moved&&performance.now()-d.t0<420){if(SCE.mode==='hero'&&SCE.hero){if(sceT()-SCE.hero.act>1.6)SCE.hero.act=sceT()}else if(SCE.gcur)SCE.gcur.pop=sceT()}};
  st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up)}

// ------------------------------------------------------------------ sounds and music (the game's own instruments)
function sceSnd(k){if(!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.005;AU.pan=0;try{
  if(k==='move'){fNoise(t,.11,'bandpass',VR(1500,.06),1.2,.05,{att:.012,f2:2300});vBell(null,t+.01,[79,81,83,86][randi(0,3)],.7,.007)}
  else if(k==='back'){fNoise(t,.1,'bandpass',900,1.1,.05,{att:.01,f2:620})}
  else if(k==='lock'){M.metal(t,.22,VR(700,.05),.35);M.metal(t+.07,.16,VR(560,.05),.3);fThump(t,190,90,.07,.12)}
  else if(k==='ok'){fThump(t,130,46,.6,.34,.4);fNoise(t,.5,'lowpass',420,.7,.12,{brown:true,att:.02,rev:.6});vBell(null,t+.02,62,2.6,.03);vBell(null,t+.03,74,2.2,.018)}
  else if(k==='band'){fThump(t,90,36,1.2,.4,.6);vChoir(null,t,[50,57,62,66],3.2,.07);vBell(null,t+.05,74,4,.03);vBell(null,t+.06,81,3.5,.016);fNoise(t,1.6,'lowpass',260,.7,.1,{brown:true,att:.3,rev:.7})}
  else if(k==='absorb'){whoosh(t,.45,500,2400,.16,.3);vBell(null,t+.36,86,1.4,.02);vBell(null,t+.4,93,1.2,.012)}
  else if(k==='dice'){for(let i=0;i<4;i++)fNoise(t+i*.055+Math.random()*.02,.03,'bandpass',VR(2600,.15),2,.06,{att:.002});vBell(null,t+.26,[81,84,88][randi(0,2)],.9,.012)}
  else if(k==='tick'){fNoise(t,.018,'highpass',3200,.8,.03,{att:.001})}
  else if(k==='mid'){fNoise(t,.02,'highpass',2600,.8,.04,{att:.001});vBell(null,t,86,.5,.008)}
  // the entrances: the air of a fall and the landing, a spin, a puff of smoke; the warning's low bell
  else if(k==='fall'){whoosh(t,.4,300,1800,.12)}
  else if(k==='land'){fThump(t,140,50,.25,.4,.2);fNoise(t,.28,'lowpass',900,.8,.14,{brown:true,att:.01})}
  else if(k==='spin'){whoosh(t,.3,600,2600,.12);whoosh(t+.22,.3,800,3000,.1);vBell(null,t+.5,84,.9,.012)}
  else if(k==='poof'){fNoise(t,.45,'bandpass',800,.7,.16,{f2:240,att:.03,rev:.3});fNoise(t,.2,'highpass',3800,.8,.04,{att:.02});vBell(null,t+.08,77,1.2,.012)}
  else if(k==='warn'){vBell(null,t,57,2.6,.03);vBell(null,t+.02,69,2.2,.014);fThump(t,90,40,.6,.18,.4)}}catch(e){}}
// slow, warm and a little solemn: D minor, a pad that breathes, a low harp, a choir now and then, a bell, the crackle of a fire
TRACKS.scelta={bpm:54,ch:[[50,53,57],[46,50,53],[53,57,60],[48,52,55]],
  play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%8,C=this.ch[bar%4];
    if(s===0){vPad(tr,t,C,spb*16,.1,650);vBass(tr,t,C[0]-12,spb*15,.15)}
    if(s===0&&(bar===2||bar===6))vChoir(tr,t,[C[0]+12,C[2]+12],spb*16,.045);
    if(s%4===0)vHarp(tr,t,C[(s/4)%3]+12+(s===12?12:0),spb*5,.032);
    if(s===10&&bar%2===1)vHarp(tr,t,C[2]+24,spb*4,.018);
    if(bar===7&&s===8)vBell(tr,t,C[0]+24,3,.022);
    if(AU.on.sfx&&Math.random()<.22)try{fNoise(t+Math.random()*spb,.012,'highpass',2400+Math.random()*2200,.7,.012+Math.random()*.022)}catch(e){}}};
{const _pm=playMusic;playMusic=function(name){if((SCE.on||SCE.wait)&&name==='menu')name='scelta';return _pm.call(this,name)}}

// ------------------------------------------------------------------ the heroes: poses and blends
// every change of move starts from the pose drawn last and slides into the new one, so nothing jumps
const SCE_K=['B','lean','roll','s','sx','hd','hy','hp','grip','aim','up','hR','fL','fR','draw','nock','squint','jig','sway'];
function sceSnap(A){const o={};for(const k of SCE_K){const v=A[k];o[k]=Array.isArray(v)?v.slice():v}return o}
const sceNrm=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l]};
function sceMix(A,F,k){for(const n of SCE_K){const a=A[n],b=F[n];if(a==null||b==null)continue;if(Array.isArray(a))A[n]=a.map((v,i)=>v+(b[i]-v)*k);else if(typeof a==='number')A[n]=a+(b-a)*k}
  if(A.aim)A.aim=sceNrm(A.aim);if(A.up)A.up=sceNrm(A.up)}
// the bow raised towards the sky: bow, string and string hand turn together round the shoulder; on the way up the bow also stands
// upright (k: 0..1), so from the side you see its whole curve, and the whole thing rises a little above the face
function sceTilt(A,f,k){if(!f)return;const c=Math.cos(f),s=Math.sin(f),o=[4,0,13],rot=v=>[v[0]*c-v[2]*s,v[1],v[0]*s+v[2]*c],lift=(SCE.lift||0)*k,
  rp=v=>{const d=rot([v[0]-o[0],v[1]-o[1],v[2]-o[2]]);return[d[0]+o[0],d[1]+o[1],d[2]+o[2]+lift]};A.grip=rp(A.grip);A.hR=rp(A.hR);A.aim=rot(A.aim);A.up=rot(A.up);
  const a=A.aim,u=sceNrm([-a[0]*a[2],-a[1]*a[2],1-a[2]*a[2]]);A.up=sceNrm(A.up.map((v,i)=>v+(u[i]-v)*k*(SCE.cant==null?1:SCE.cant)))}
const sceEz=k=>k<=0?0:k>=1?1:k*k*(3-2*k);
const sceBow=id=>id==='arciere'||id==='cacciatrice';
// what the hero does now: T is the time since you tapped him. The archers jump, raise the bow to the sky and shoot; the Balestriere
// fires a bolt and reloads; the Druida swings his staff and throws his leaves
function sceMove(H,t){const T=H.act>=0&&t>=H.act?t-H.act:1e9,TILT=SCE.tilt,E=H.ent?t-H.in:1e9;
  const M={anim:'idle',p:((t/2.6)%1+1)%1,pull:0,tilt:0,hop:0,sq:0,squint:null,show:0,spin:0};
  // the entrance, just picked (a tap during it waits): the Arciere drops from above and lands bending his knees, the Cacciatrice spins in
  // one turn and a half, the Bardo strums a chord turned towards us, the Alchimista and the Ninja rise out of the smoke (the Ninja from
  // a crouch, with a little jump)
  if(E>=0&&E<1.5&&T>=1e9){const en=(SCE_INFO[H.id]||{}).ent;
    if(en==='drop'){if(E<.42){const k=E/.42;M.hop=30*(1-k*k)}else if(E<.64)M.sq=-.1*Math.sin((E-.42)/.22*Math.PI)}
    else if(en==='spin'){if(E<.8){M.spin=-TAU*1.5*(1-sceEz(E/.8));M.hop=6*Math.sin(E/.8*Math.PI)}}
    else if(en==='chord'){if(E>=.12&&E<1.42){M.anim='shoot';M.p=Math.min(.999,(E-.12)/1.3);M.show=sceEz(Math.min(1,(E-.12)/.25))*(E>1.17?1-sceEz((E-1.17)/.25):1)}}
    else if(en==='smoke'){if(E<.5)M.sq=-.1*(1-sceEz(E/.5));else if(E<.8)M.hop=4*Math.sin((E-.5)/.3*Math.PI)}
    else if(en==='shadow'){if(E<.45)M.sq=-.16*(1-sceEz(E/.45));else if(E<.75)M.hop=7*Math.sin((E-.45)/.3*Math.PI)}
    return M}
  if(sceBow(H.id)){if(T<.28){const k=T/.28;Object.assign(M,{anim:'aim',p:0,tilt:TILT*sceEz(k),hop:3.6*Math.sin(k*Math.PI),sq:k<.2?-.05*Math.sin(k/.2*Math.PI):0,show:sceEz(k*1.4)})}
    else if(T<.82){const k=(T-.28)/.42;Object.assign(M,{anim:'aim',p:0,pull:sceEz(Math.min(1,k)),tilt:TILT,squint:.25+.35*Math.min(1,k),show:1,sq:T<.36?.06*Math.sin((T-.28)/.08*Math.PI):0})}
    else if(T<1.34){const k=(T-.82)/.52;Object.assign(M,{anim:'shoot',p:.5+.5*Math.min(1,k),tilt:TILT,show:1})}
    else if(T<1.9)M.show=1-sceEz((T-1.34)/.56)}
  else{const D=H.id==='balestriere'?1.5:1.35;if(T<D){Object.assign(M,{anim:'shoot',p:T/D,show:sceEz(Math.min(1,T/.25))})}else if(T<D+.5)M.show=1-sceEz((T-D)/.5)}
  return M}
// the entrance's sparks, smoke and sound (at its start; the Arciere's when he lands)
function sceEntFx(H,t){const I=SCE_INFO[H.id]||{},E=t-H.in,low=LOWFX||SCE.low;if(!H.ent||E<0||H.es>=2)return;
  if(I.ent==='drop'){if(!H.es){H.es=1;sceSnd('fall')}if(E>=.42){H.es=2;sceSnd('land');for(let i=0;i<(low?6:16);i++)sceEmber('230,215,180',true);sceSmoke('200,185,160',low?3:7,.7,true)}return}
  H.es=2;
  if(I.ent==='spin'){sceSnd('spin');for(let i=0;i<(low?8:20);i++)sceEmber(I.rgb,true)}
  else if(I.ent==='chord'){setTimeout(()=>{if(SCE.on&&SCE.hero===H)try{sfx('nh','chord')}catch(e){}},120);for(let i=0;i<(low?8:18);i++)sceEmber(I.rgb,true)}
  else if(I.smoke){sceSnd('poof');sceSmoke(I.smoke,low?5:12,1);for(let i=0;i<(low?5:12);i++)sceEmber(I.rgb,true)}}
// a hero at the stage's point, through the hero layer (fading, the darkening of the locked ones and the light from above)
function sceHeroAt(H,t,dt,X,Y,k,alpha,dark,light){const M=sceMove(H,t),id=H.id,I=SCE_INFO[id];if(H===SCE.hero)sceEntFx(H,t);
  const act=H.act>=0&&t>=H.act;
  if(M.anim==='shoot'&&!H.shot&&(act||!I.snd)&&(!I.rel||M.p>=I.rel)){H.shot=true;if(sceBow(id))sfx('bow',I.twang);else if(id==='balestriere')sfx('bow','balestra');else if(I.snd==='chord')sfx('nh','chord');else if(I.snd)sfx('bow',I.snd);else sfx('summon');for(let i=0;i<(LOWFX||SCE.low?3:7);i++)sceEmber(I.rgb,true)}
  if(M.anim==='idle'&&H.shot&&t-H.act>2)H.shot=false;
  if(M.anim!==H.anim){if(H.lastA&&!(H.anim==='aim'&&M.anim==='shoot'))H.bl={A:H.lastA,t0:t,d:M.anim==='idle'?.32:.24};H.anim=M.anim}
  // the face: the turntable (SCE.yaw), and during the show three quarters towards us so the shot is seen
  const show=sceBow(id)?Math.PI/2+.95:Math.PI/2+.55;let d=show-SCE.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));let face=SCE.yaw+d*M.show+M.spin;
  if(H.no!=null&&t-H.no<.4)face+=.12*Math.sin((t-H.no)*40)*(1-(t-H.no)/.4);
  const style=sceStyle(id);
  // (close on his face he takes the moss stick out of his mouth, so nothing covers it)
  const draw=()=>EROE.arciere(X,Y,face,M.anim,M.p,k,{style,moss:sceZoom()?false:2,pull:M.pull,tweak:A=>{
    if(M.tilt)sceTilt(A,M.tilt,M.tilt/SCE.tilt);
    if(H.bl){const w=sceEz((t-H.bl.t0)/H.bl.d);if(w>=1)H.bl=null;else{sceMix(A,H.bl.A,1-w);if(M.anim!=='idle'&&w<.9)A.pinch=false}}
    if(M.hop||M.sq){A.B=[A.B[0],A.B[1],A.B[2]+M.hop];A.s=(A.s||0)+M.sq}
    if(M.squint!=null)A.squint=Math.max(A.squint||0,M.squint);
    // a blink when something on the face changes (he tries it on)
    if(H.blink!=null){const u=(t-H.blink)/.24;if(u>=0&&u<1)A.blink=Math.min(A.blink==null?1:A.blink,Math.abs(1-2*u))}
    H.lastA=sceSnap(A)}});
  // standing still he fits a smaller box (the Balestriere's crossbow, the Druida's antlers); moving, the bow raised to the sky
  sceLayer(X,Y,k,draw,alpha,dark,light,M.anim==='idle'&&!M.show&&!H.bl?SCE_BOX:null)}
const SCE_BOX=[27,53,9];
// a canvas kept for the layers, grown when needed
function sceCan(n,w,h){let c=SCE.can[n];if(!c)c=SCE.can[n]=document.createElement('canvas');if(c.width<w)c.width=w;if(c.height<h)c.height=h;return c}
// the layer: a box round the figure (in device pixels), cleared, drawn, darkened if asked, then laid on the canvas. light (0..1): the hard
// light from above of Dark Souls: the feet go into the shade, the top gets warm light and a bright edge where the light hits
function sceLayer(X,Y,k,draw,alpha,dark,light,bx){const m=ctx.getTransform(),dp=m.a,low=LOWFX||SCE.low;
  if(alpha<=.004)return;if(alpha>=.995&&!dark&&!light){draw();return}
  // the box, cut to the canvas (a figure close to the camera can be bigger than the screen)
  bx=bx||[29,71,10];const L=X-bx[0]*k,T=Y-bx[1]*k,R=X+bx[0]*k,B=Y+bx[2]*k,x0=Math.max(0,Math.floor(L*dp+m.e)),y0=Math.max(0,Math.floor(T*dp+m.f)),
    w=Math.min(ctx.canvas.width,Math.ceil(R*dp+m.e)+2)-x0,h=Math.min(ctx.canvas.height,Math.ceil(B*dp+m.f)+2)-y0;if(w<1||h<1)return;
  const c=sceCan('lay',w,h),g=c.getContext('2d'),saved=ctx;g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,w,h);g.setTransform(dp,0,0,dp,m.e-x0,m.f-y0);
  ctx=g;try{draw()}finally{ctx=saved}
  g.setTransform(1,0,0,1,0,0);
  const yy=v=>v*dp+m.f-y0;
  // the shade: only the lower part of the box (the legs and the feet)
  if(light){const y1=Math.max(0,Math.floor(yy(Y-26*k)));g.globalCompositeOperation='source-atop';const gr=g.createLinearGradient(0,y1,0,yy(Y+3*k));gr.addColorStop(0,'rgba(6,5,10,0)');gr.addColorStop(1,`rgba(6,5,10,${(.55*light).toFixed(3)})`);g.fillStyle=gr;g.fillRect(0,y1,w,h-y1)}
  if(dark){g.globalCompositeOperation='source-atop';g.fillStyle=`rgba(${dark[0]},${dark[1]})`;g.fillRect(0,0,w,h)}
  g.globalCompositeOperation='source-over';
  ctx.save();ctx.setTransform(1,0,0,1,0,0);const a0=Math.min(1,alpha);ctx.globalAlpha=a0;ctx.drawImage(c,0,0,w,h,x0,y0,w,h);
  if(light&&!low){// the light passes at half size (they are soft): a second layer masked by the figure
    const hw=Math.ceil(w/2),hh=Math.ceil(h/2),c2=sceCan('lit',hw,hh),q=c2.getContext('2d'),cx=(X*dp+m.e-x0)/2,cy=yy(Y-60*k)/2;q.setTransform(1,0,0,1,0,0);
    // the warm light on the head and the shoulders, only on him (the top 60% of the box)
    const th=Math.ceil(hh*.62);q.globalCompositeOperation='copy';q.drawImage(c,0,0,w,th*2,0,0,hw,th);q.globalCompositeOperation='source-in';const rg=q.createRadialGradient(cx,cy,0,cx,cy,18*k*dp);
    rg.addColorStop(0,'rgba(255,236,200,.55)');rg.addColorStop(.5,'rgba(255,226,186,.2)');rg.addColorStop(1,'rgba(255,220,180,0)');q.fillStyle=rg;q.fillRect(0,0,hw,th);
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a0*light*.6;ctx.drawImage(c2,0,0,hw,th,x0,y0,w,th*2);
    // the bright edge: what has nothing over it (the figure moved down a little and cut away), stronger near the top
    const s=Math.max(1,Math.round(.15*k*dp));q.globalCompositeOperation='copy';q.drawImage(c,0,0,w,h,0,0,hw,hh);q.globalCompositeOperation='destination-out';q.drawImage(c,0,0,w,h,0,s,hw,hh);
    q.globalCompositeOperation='source-in';const eg=q.createLinearGradient(0,yy(Y-64*k)/2,0,yy(Y-4*k)/2);eg.addColorStop(0,'rgba(255,240,205,1)');eg.addColorStop(1,'rgba(255,214,160,.25)');q.fillStyle=eg;q.fillRect(0,0,hw,hh);
    ctx.globalAlpha=a0*light*.75;ctx.drawImage(c2,0,0,hw,hh,x0,y0,w,hh*2)}
  ctx.restore()}

// ------------------------------------------------------------------ the gifts in 3D (the C3 toolkit of the 3D monsters, painted like them:
// three soft tones, the thick dark outline, the warm rim). Each one turns with `face`; (0, 0) is the point under it, z up
const SCE_G3={
  // a sack of rough cloth tied with a rope, coins peeping out of the top, two coins flying round it
  oro(V0,t,C){const{vol,revo,IDF,surfLine}=C,orb=[0,1].map(i=>{const a=t*1.1+i*Math.PI;return{c:[Math.cos(a)*12.5,Math.sin(a)*12.5,8+3*Math.sin(t*1.6+i*2)],a}}),dc=V0.D(0,0,8);
    const coin=(c,n,r)=>{n=C.nrm(n);const back=C.add(c,C.mul(n,-.8));ctx.lineJoin='round';C.disc3(V0,back,n,r);ctx.fillStyle='#b5620a';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();
      const pts=C.disc3(V0,c,n,r),b=C.bbox(pts);ctx.fillStyle=C.soft(b[0]+(b[2]-b[0])*.3,b[1]+(b[3]-b[1])*.3,(b[0]+b[2])/2,(b[1]+b[3])/2,Math.max(b[2]-b[0],b[3]-b[1])*.7,'#f5b82a',.45,.25);ctx.fill();ctx.stroke();
      if(V0.F(n)>.15){C.disc3(V0,c,n,r*.6);ctx.strokeStyle='rgba(176,96,8,.8)';ctx.lineWidth=.9;ctx.stroke();const q=V0.P(C.add(c,C.mul(n,.1)));ctx.fillStyle='rgba(255,250,215,.85)';ctx.beginPath();ctx.arc(q[0]-r*.32,q[1]-r*.3,r*.2,0,C.TAU);ctx.fill()}};
    const toUs=w=>C.nrm([V0.s+w[0],V0.c+w[1],.55+w[2]]);
    for(const o of orb)if(V0.D(o.c)<dc)coin(o.c,toUs([.5*Math.cos(o.a*2),.5*Math.sin(o.a*2),.2]),2.9);
    const B=[[0,5.2],[1.4,7.6],[3.8,9.3],[6.8,9.4],[9.6,7.8],[12,5.4],[13.3,4.3]];vol(V0,revo(B,1,IDF,0,20),'#c99a5c',{kl:.22,kd:.36});
    // folds of the cloth, the patch
    const rAt=z=>{for(let i=1;i<B.length;i++)if(z<=B[i][0])return C.lerp(B[i-1][1],B[i][1],(z-B[i-1][0])/(B[i][0]-B[i-1][0]));return B[B.length-1][1]};
    for(const a0 of[-.7,.15,.9,1.8,2.7,3.6,4.6,5.5])surfLine(V0,IDF,k=>{const z=13-k*7,r=rAt(z)+.05,a=a0+k*.25;return{p:[Math.cos(a)*r,Math.sin(a)*r,z],n:[Math.cos(a),Math.sin(a),.2]}},'rgba(92,60,28,.4)',1,true);
    C.spot(V0,[Math.cos(2.2)*9.35,Math.sin(2.2)*9.35,6],[Math.cos(2.2),Math.sin(2.2),0],2.6,'#a87a44',{lw:1,N:4});
    // the cloth above the rope, gathered and open at the top, with the coins inside
    const T=[[13.2,3.9],[14.6,4.9],[16.3,5.8],[17,5.5]];vol(V0,revo(T,1,IDF,0,16),'#b98a4e',{kl:.2,kd:.3});
    if(V0.F(0,0,1)>0){C.disc3(V0,[0,0,16.9],[0,0,1],4.7);ctx.fillStyle='#3a2410';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
      for(const[x,y,z,nx,ny] of[[-1.7,-1.3,17.7,-.3,-.4],[1.6,.9,18.1,.4,.2],[.2,2,17.5,.1,.6],[-.3,-.2,19.1,.15,-.1]])coin([x,y,z],C.add([nx,ny,1],C.mul(toUs([0,0,0]),.6)),2.7)}
    surfLine(V0,IDF,a=>({p:[Math.cos(a)*4.5,Math.sin(a)*4.5,13.4],n:[Math.cos(a),Math.sin(a),0]}),'#8a5a2b',1.7,false,null,true);
    const kn=[Math.cos(.5)*4.8,Math.sin(.5)*4.8,13.4];if(V0.F(Math.cos(.5),Math.sin(.5),0)>0){C.caps(V0,kn,1.15,C.add(kn,[.8,.6,-4.2]),.9,'#9a6834',{lw:1.2});C.caps(V0,kn,1.15,C.add(kn,[1.2,-.8,-3.4]),.9,'#8a5a2b',{lw:1.2});C.sball(V0,kn,1.8,'#9a6834',{lw:1.3})}
    for(const o of orb)if(V0.D(o.c)>=dc)coin(o.c,toUs([.5*Math.cos(o.a*2),.5*Math.sin(o.a*2),.2]),2.9)},
  // a cluster of crystals growing from a dark stone, light inside
  cristalli(V0,t,C){const{vol}=C;vol(V0,C.ellPts([0,0,1.8],[9,8.5,3],null,4,14),'#57504a',{kl:.16,kd:.42});
    const X=[{b:[0,0,2.5],d:[0,0,1],h:15,r:3.3},{b:[3.4,3,2],d:[.35,.3,1],h:9,r:2.4},{b:[-3.1,2.6,2],d:[-.38,.3,1],h:7.5,r:2.1},{b:[2.2,-3.5,2],d:[.3,-.42,1],h:8.5,r:2.2},{b:[-2.8,-2.9,1.8],d:[-.35,-.35,1],h:5.5,r:1.8}];
    const draw=x=>{const w=C.nrm(x.d);let u=C.cross(w,[0,1,0]);if(C.len(u)<.2)u=C.cross(w,[1,0,0]);u=C.nrm(u);const v=C.cross(w,u),pts=[],hex=[],top=[];
      for(let i=0;i<6;i++){const a=i/6*C.TAU+.3,o=C.add(C.mul(u,Math.cos(a)*x.r),C.mul(v,Math.sin(a)*x.r)),p0=C.add(x.b,o),p1=C.add(p0,C.mul(w,x.h));pts.push(p0,p1);hex.push(p0);top.push(p1)}
      const ap=C.add(x.b,C.mul(w,x.h+x.r*1.5));pts.push(ap);
      const hull=C.chull(pts.map(q=>V0.P(q))),bb=C.bbox(hull),g=ctx.createLinearGradient(bb[0],bb[1],bb[2],bb[3]);g.addColorStop(0,'#e9fdff');g.addColorStop(.42,'#62d2f2');g.addColorStop(1,'#5a46c8');
      vol(V0,pts,'#5fd0f0',{fill:g,lw:2.2,rim:.45});
      // the edge nearest to us, lit, and the facets of the tip
      let bi=0,bd=-1e9;for(let i=0;i<6;i++){const dd=V0.D(hex[i]);if(dd>bd){bd=dd;bi=i}}
      const e0=V0.P(hex[bi]),e1=V0.P(top[bi]),e2=V0.P(ap);ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(e0[0],e0[1]);ctx.lineTo(e1[0],e1[1]);ctx.lineTo(e2[0],e2[1]);ctx.stroke();
      const n1=V0.P(top[(bi+1)%6]),n5=V0.P(top[(bi+5)%6]);ctx.strokeStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.moveTo(n1[0],n1[1]);ctx.lineTo(e1[0],e1[1]);ctx.lineTo(n5[0],n5[1]);ctx.stroke()};
    X.slice().sort((a,b)=>V0.D(a.b)-V0.D(b.b)).forEach(draw);
    const c=V0.P(0,0,9);if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';C.shine('110,215,255',c[0],c[1],15,.3+.08*Math.sin(t*2.3));ctx.restore()}
    const tw=(t*.8)%1;if(tw<.25){const q=V0.P(0,0,20.5);C.starS(q[0]+1,q[1],2.4*Math.sin(tw/.25*Math.PI),1)}},
  // the silver chest of the game (its colours), the lid lifting a little now and then with light spilling out
  cassa(V0,t,C){const{vol}=C,c=CHC.argento,ph=(t%4.4)/4.4,th=ph>.6&&ph<.95?.34*Math.sin((ph-.6)/.35*Math.PI):0;
    const box=(x0,x1,y0,y1,z0,z1)=>[[x0,y0,z0],[x1,y0,z0],[x0,y1,z0],[x1,y1,z0],[x0,y0,z1],[x1,y0,z1],[x0,y1,z1],[x1,y1,z1]];
    const rot=q=>{const dx=q[0]+6,dz=q[2]-10,cc=Math.cos(th),s=Math.sin(th);return[-6+dx*cc-dz*s,q[1],10+dx*s+dz*cc]};
    const lidPts=(r,y0,y1)=>{const o=[];for(let i=0;i<=10;i++){const a=i/10*Math.PI;for(const y of[y0,y1])o.push(rot([Math.cos(a)*r,y,10+Math.sin(a)*r]))}return o};
    // a strip on a flat face (only when the face looks at us)
    const strip=(pts,n,col)=>{if(V0.F(n)<=.02)return;const s=pts.map(q=>V0.P(q));C.poly(s);ctx.fillStyle=col;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke()};
    vol(V0,box(-6,6,-9,9,0,10),c.body,{kl:.26,kd:.4});
    // the four sides: the ones turned away from the light a little darker, every edge drawn
    const o0=V0.P(0,0,0),shade=n=>{const q=V0.P(n);return Math.max(0,Math.min(.3,(q[0]-o0[0])*.32+.06))};
    for(const[n,f] of[[[1,0,0],[[6,-9,0],[6,9,0],[6,9,10],[6,-9,10]]],[[-1,0,0],[[-6,-9,0],[-6,9,0],[-6,9,10],[-6,-9,10]]],[[0,1,0],[[-6,9,0],[6,9,0],[6,9,10],[-6,9,10]]],[[0,-1,0],[[-6,-9,0],[6,-9,0],[6,-9,10],[-6,-9,10]]]])
      strip(f,n,`rgba(10,14,20,${shade(n).toFixed(3)})`);
    for(const y of[-5.4,5.4]){strip([[6.02,y-1.1,0],[6.02,y+1.1,0],[6.02,y+1.1,10],[6.02,y-1.1,10]],[1,0,0],c.band);strip([[-6.02,y-1.1,0],[-6.02,y+1.1,0],[-6.02,y+1.1,10],[-6.02,y-1.1,10]],[-1,0,0],c.band)}
    if(th>.03){const q=V0.P(rot([6,0,10.6]));if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';C.shine('255,230,150',q[0],q[1],14,.55*th/.34);ctx.restore()}}
    vol(V0,lidPts(6,-9,9),c.dark,{kl:.24,kd:.38});
    // the bands over the lid, on the part that faces us
    for(const y of[-5.4,5.4]){const seg=[];for(let i=0;i<=12;i++){const a=i/12*Math.PI;seg.push({a,v:V0.F([Math.cos(a+th),0,Math.sin(a+th)])})}
      const vis=seg.filter(s=>s.v>.02);if(vis.length<2)continue;const A=[],Bk=[];for(const s of vis){A.push(V0.P(rot([Math.cos(s.a)*6.08,y-1.1,10+Math.sin(s.a)*6.08])));Bk.push(V0.P(rot([Math.cos(s.a)*6.08,y+1.1,10+Math.sin(s.a)*6.08])))}
      C.poly(A.concat(Bk.reverse()));ctx.fillStyle=c.band;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke()}
    // the lock on the front, under the lid
    if(V0.F(1,0,0)>.05){strip([[6.05,-1.9,5.2],[6.05,1.9,5.2],[6.05,1.9,9.6],[6.05,-1.9,9.6]],[1,0,0],'#c9d3dc');const q=V0.P(6.1,0,7.6);ctx.fillStyle=c.lock;ctx.beginPath();ctx.arc(q[0],q[1],1.25,0,C.TAU);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(q[0]-.6,q[1]-.7,.5,.5)}},
  // the falcon ring: a silver ring standing up, a blue stone in its setting
  anello(V0,t,C){const R0=6.4,cz=10.5,n=C.nrm([1,0,.35]),u=[0,1,0],v=C.nrm(C.cross(n,u)),N=30,pts=[];
    for(let i=0;i<=N;i++){const a=i/N*C.TAU;pts.push(C.add([0,0,cz],C.add(C.mul(u,Math.cos(a)*R0),C.mul(v,Math.sin(a)*R0))))}
    const dc=V0.D(0,0,cz),back=[],front=[];for(let i=0;i<N;i++){const m=C.lerp3(pts[i],pts[i+1],.5);(V0.D(m)<dc?back:front).push(i)}
    const run=ids=>{if(!ids.length)return;// consecutive pieces as one chain each
      const groups=[];let g=[ids[0]];for(let j=1;j<ids.length;j++){if(ids[j]===ids[j-1]+1)g.push(ids[j]);else{groups.push(g);g=[ids[j]]}}groups.push(g);
      if(groups.length>1&&groups[0][0]===0&&groups[groups.length-1][groups[groups.length-1].length-1]===N-1){const l=groups.pop();groups[0]=l.concat(groups[0])}
      for(const gr of groups){const P3=gr.map(i=>pts[i]);P3.push(pts[(gr[gr.length-1]+1)%N]);C.chain(V0,P3,P3.map(()=>1.55),'#c9cfd6',{kl:.4,kd:.42,lw:2})}};
    run(back);run(front);
    const top=C.add([0,0,cz],C.mul(v,R0+1.2));C.sball(V0,top,2.9,'#aeb6c0',{lw:1.8,kl:.35,kd:.4});
    for(const a of[0,1.57,3.14,4.71]){const q=C.add(top,C.add(C.mul(u,Math.cos(a)*2.2),C.mul(n,Math.sin(a)*2.2)));if(V0.F(C.sub(q,top))>-.2){const s=V0.P(q);ctx.fillStyle='#dfe4ea';ctx.beginPath();ctx.arc(s[0],s[1],.8,0,C.TAU);ctx.fill()}}
    const g=C.add(top,C.mul(v,.9)),q=V0.P(g);C.sball(V0,g,2.3,'#4d97ff',{lw:1.4,kl:.55,kd:.45});
    ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(q[0]-.8,q[1]-.9,.7,0,C.TAU);ctx.fill();
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';C.shine('110,165,255',q[0],q[1],9,.35+.1*Math.sin(t*3));ctx.restore()}
    const tw=(t*.7+.4)%1;if(tw<.22)C.starS(q[0]+2,q[1]-2,2.2*Math.sin(tw/.22*Math.PI),1)},
  // the phoenix feather: red, orange and gold, the shaft, the barbs, little flames at the tip
  piuma(V0,t,C){const L=27,d=C.nrm([.22,0,1]),s=[0,1,0],n=C.nrm(C.cross(d,s)),b0=[-2.2,0,1.5],bend=.28+.03*Math.sin(t*1.7);
    const at=(k,w)=>C.add(C.add(C.add(b0,C.mul(d,k*L)),C.mul(s,w)),C.mul(n,bend*k*k*L*.4));
    const wid=k=>k<.16?0:(k<.5?Math.sin((k-.16)/.34*Math.PI/2):Math.sqrt(Math.max(0,1-Math.pow((k-.5)/.5,2.2))))*5.4;
    const left=[],right=[];for(let i=0;i<=24;i++){const k=.16+i/24*.84,nt=i%3===1?.82:1;left.push(at(k,wid(k)*nt));right.push(at(k,-wid(k)*.82*(i%3===2?.86:1)))}
    const face=V0.F(n),vane=left.concat(right.reverse()).map(q=>V0.P(q));
    const g=ctx.createLinearGradient(...V0.P(at(.16,0)),...V0.P(at(1,0)));
    if(face>=0){g.addColorStop(0,'#ffe07a');g.addColorStop(.35,'#ff9a3a');g.addColorStop(.75,'#ff5a2e');g.addColorStop(1,'#d63228')}else{g.addColorStop(0,'#f2b04a');g.addColorStop(.4,'#e5702c');g.addColorStop(1,'#a8261e')}
    if(!LOWFX){const q=V0.P(at(.75,0));ctx.save();ctx.globalCompositeOperation='lighter';C.shine('255,140,60',q[0],q[1],16,.32+.08*Math.sin(t*5));ctx.restore()}
    ctx.lineJoin='round';C.poly(vane);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
    // the barbs, inside the vane
    ctx.save();C.poly(vane);ctx.clip();ctx.strokeStyle=face>=0?'rgba(150,40,10,.38)':'rgba(90,20,10,.4)';ctx.lineWidth=.8;ctx.beginPath();
    for(let k=.2;k<.97;k+=.06)for(const sd of[1,-1]){const a=V0.P(at(k,0)),b=V0.P(at(Math.min(1,k+.09),sd*wid(k)*1.05));ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}ctx.stroke();
    const hi=V0.P(at(.4,wid(.4)*.5));ctx.fillStyle='rgba(255,240,190,.25)';ctx.beginPath();ctx.ellipse(hi[0],hi[1],2.4,4.6,-.3,0,C.TAU);ctx.fill();ctx.restore();
    // the shaft: bare at the bottom, pale gold along the vane
    const sh=[];for(let i=0;i<=12;i++)sh.push(V0.P(at(i/12*.97,0)));ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.8;C.line(sh.slice(0,4));ctx.stroke();ctx.strokeStyle='#fff1c4';ctx.lineWidth=1.3;C.line(sh);ctx.stroke();
    // little flames licking at the tip
    for(let i=0;i<3;i++){const k=.82+i*.07,ph=t*6+i*2.1,q=V0.P(at(k,(i-1)*2.2)),hh=3+1.6*Math.sin(ph),w=1.5;ctx.fillStyle=i===1?'#ffd25a':'#ff8a2e';ctx.globalAlpha=.85;
      ctx.beginPath();ctx.moveTo(q[0]-w,q[1]);ctx.quadraticCurveTo(q[0]-w*.6,q[1]-hh*.6,q[0]+Math.sin(ph*1.3)*.8,q[1]-hh);ctx.quadraticCurveTo(q[0]+w*.7,q[1]-hh*.5,q[0]+w,q[1]);ctx.closePath();ctx.fill();ctx.globalAlpha=1}}};
// a gift standing in the hero's place on the stone: rising from it, floating, turning; a = fading in/out, pop = the little jump when
// it is picked again or tapped; in the light from above like the heroes
function sceGiftAt(G0,t,X,Y,k,alpha,light){const C=window.C3;if(!C||!SCE_G3[G0.id])return;const tt=t-G0.t0,pp=t-(G0.pop==null?G0.t0:G0.pop),pop=pp>0&&pp<.5?Math.sin(pp/.5*Math.PI)*(1-pp/.5):0,
    rise=sceEz(Math.min(1,Math.max(0,tt)/.5)),sc=k*(.78+.22*rise)*(1+.14*pop),fl=Math.sin(t*1.6)*1.3*k,flat=G0.id==='anello'||G0.id==='piuma',
    face=flat?Math.PI/2+.8*Math.sin(t*.8)+pop*1.4:t*.75+pop*2.2,lift=(4+6*rise)*k;
  // its shadow on the stone, the light under it
  ctx.save();ctx.globalAlpha=.32*alpha;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(X,Y,(8-2*rise)*k,(2.6-.6*rise)*k,0,0,TAU);ctx.fill();ctx.restore();
  if(!LOWFX&&!SCE.low){ctx.save();ctx.globalCompositeOperation='lighter';glow(SCE_GIFT[G0.id].rgb,X,Y-lift-10*k+fl,24*k,.26*alpha*(1+pop));ctx.restore()}
  sceLayer(X,Y-lift+fl,sc,()=>{ctx.save();ctx.translate(X,Y-lift+fl);ctx.scale(sc,sc);try{SCE_G3[G0.id](C.V(face),t,C)}finally{ctx.restore()}},alpha,null,light,SCE_GBOX)}
// the box round a gift (measured on all five, turning and popping: at most 18 to the sides, 36 up, 7 down)
const SCE_GBOX=[20,39,9];

// ------------------------------------------------------------------ the dark around: far pillars in the black, the floor; the light is drawn every frame
function sceBgImg(w,h,S,dpr){const fy=S.y*dpr,kq=Math.round(S.k*3)/3,key=w+'x'+h+':'+Math.round(fy/8)+':'+Math.round(S.x*dpr/8)+':'+kq;if(SCE.bgK===key&&SCE.bgImg)return SCE.bgImg;
  const c=SCE.bgImg||document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
  const g=x.createRadialGradient(w/2,fy-h*.22,10,w/2,fy-h*.22,Math.max(w,h)*.75);g.addColorStop(0,'#17120e');g.addColorStop(.32,'#0b0907');g.addColorStop(1,'#020101');x.fillStyle=g;x.fillRect(0,0,w,h);
  // pillars and arches far away, barely there
  x.save();x.globalAlpha=.5;for(const[px,pw,ph] of[[.05,.07,.74],[.23,.05,.6],[.77,.05,.6],[.95,.07,.74]]){const X=w*px,W=w*pw,top=h*(1-ph),gg=x.createLinearGradient(X-W,0,X+W,0);
    gg.addColorStop(0,'rgba(30,25,21,0)');gg.addColorStop(.35,'rgba(42,35,29,.9)');gg.addColorStop(.6,'rgba(24,20,17,.9)');gg.addColorStop(1,'rgba(20,16,14,0)');x.fillStyle=gg;x.fillRect(X-W,top,W*2,h-top)}
  x.restore();
  // the floor: a darker band under the stone
  const fl=x.createLinearGradient(0,fy-h*.06,0,h);fl.addColorStop(0,'rgba(0,0,0,0)');fl.addColorStop(.25,'rgba(6,5,4,.7)');fl.addColorStop(1,'rgba(1,1,1,.96)');x.fillStyle=fl;x.fillRect(0,fy-h*.06,w,h);
  const v=x.createRadialGradient(w/2,h*.5,Math.min(w,h)*.28,w/2,h*.5,Math.max(w,h)*.76);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.8)');x.fillStyle=v;x.fillRect(0,0,w,h);
  x.setTransform(dpr,0,0,dpr,0,0);sceLight(x,{x:S.x,y:S.y,k:kq},Math.max(0,S.y-110*kq),1,6);
  SCE.bgK=key;return SCE.bgImg=c}
// the hard light from above: a cone with soft edges, brighter in its middle, and the pool it makes on the floor (pulse: a mantle, a gift)
function sceLight(x,S,top,a,n){const k=S.k,bot=S.y+3*k;x.save();x.globalCompositeOperation='lighter';n=n||6;
  for(let i=0;i<n;i++){const sp=n>1?i/(n-1):.5,cw0=(4+5*sp)*k,cw1=(22+16*sp)*k,cone=x.createLinearGradient(0,top,0,bot);
    cone.addColorStop(0,`rgba(255,234,186,${(.07*a).toFixed(3)})`);cone.addColorStop(.55,`rgba(255,222,165,${(.035*a).toFixed(3)})`);cone.addColorStop(1,`rgba(255,212,150,${(.014*a).toFixed(3)})`);
    x.fillStyle=cone;x.beginPath();x.moveTo(S.x-cw0,top);x.lineTo(S.x+cw0,top);x.lineTo(S.x+cw1,bot);x.lineTo(S.x-cw1,bot);x.closePath();x.fill()}
  if(n<6){x.restore();return}
  x.save();x.translate(S.x,S.y);x.scale(1,.32);const pool=x.createRadialGradient(0,0,2,0,0,40*k);pool.addColorStop(0,`rgba(255,216,152,${(.32*a).toFixed(3)})`);pool.addColorStop(.5,`rgba(255,190,120,${(.1*a).toFixed(3)})`);pool.addColorStop(1,'rgba(255,170,100,0)');
  x.fillStyle=pool;x.beginPath();x.arc(0,0,40*k,0,TAU);x.fill();x.restore();x.restore()}
// sparks rising from the runes (gift: from the gift)
function sceEmber(rgb,burst,gift){SCE.emb.push({rgb,gift:!!gift,x:(Math.random()*2-1)*(burst?15:18),y:(Math.random()*2-1)*3,vx:(Math.random()*2-1)*(burst?13:3),vy:-(burst?20+Math.random()*28:10+Math.random()*13),l:0,max:burst?.7+Math.random()*.7:1.3+Math.random()*1.3,s:burst?1.3:1})}
// where the hero stands and how big: in the middle of the screen, the rune stone (its side goes 6.9k under his feet) just over the
// panel underneath, and as big as the screen allows: his hood (a circle 11.5k wide round a point 26k over his feet) may go behind the
// bottom corners of the panels over the scene only a little, the whole of him (44k) under the name in the fourth step
function sceSpot(){const st=SCE.el&&SCE.el.querySelector('.sceStage'),cv=$('sceCv');if(!st||!cv)return null;const a=st.getBoundingClientRect(),b=cv.getBoundingClientRect(),cx=b.left+b.width/2,A=a.bottom-3;
  // the look: the camera comes close (the face; the whole head with its hair and ears; the head and shoulders), the hero alone on the stage
  const zm=sceZoom();if(zm){const li=SCE.el.querySelector('.sceList'),lr=li&&li.offsetHeight&&!li.classList.contains('empty')?li.getBoundingClientRect():null,L0=(lr?lr.right:b.left)+4,R0=b.right-4,W=R0-L0,H=A-a.top;
    const Z=zm==='face'?[16,23,.62,.46]:zm==='head'?[25,28,.68,.53]:[24,31,.62,.38],k=Math.min(W*.9/Z[0],H*Z[2]/Z[1]),hy=a.top+H*Z[3];
    return{x:(L0+R0)/2-b.left,y:hy+26*k-b.top,k,top:a.top-b.top,zoom:zm}}
  // (how high he stands, in his units over his feet: a tall hat, the Bard's plume make him taller)
  const L=SCE.look||{},hat=SCE_HAT(L.cappuccio)&&!sceHides(SCE.sel,'cappuccio',L.cappuccio),tu=hat?(L.cappuccio==='punta'?55:L.cappuccio==='cilindro'||L.cappuccio==='elmo'?49:46):SCE.sel==='bardo'&&L.acc!=='piuma'?50:44;
  const lim=[];if(SCE.step===4){const nb=SCE.el.querySelector('.sceNameBox');if(nb&&nb.offsetHeight){const r=nb.getBoundingClientRect();lim.push({dx:-1,bot:r.bottom+8})}}
  else for(const c of SCE.el.querySelectorAll('.sceCol')){if(c.classList.contains('empty')||!c.offsetHeight)continue;const r=c.getBoundingClientRect();lim.push({dx:r.right<=cx?cx-r.right:r.left>=cx?r.left-cx:-1,bot:r.bottom})}
  const ok=k=>{const f=A-6.9*k,cy=f-26*k,R=11.5*k;for(const l of lim){if(l.dx<0){if(f-tu*k<l.bot)return false}else if(l.dx<R&&cy-Math.sqrt(R*R-l.dx*l.dx)<l.bot-.42*R)return false}return true};
  let k=Math.min((A-a.top-6)/(Math.max(44,hat?tu:44)+6.9),b.width*.94/32);while(k>1.6&&!ok(k))k-=.02;k=Math.max(1.6,k);
  return{x:b.width/2,y:A-6.9*k-b.top,k,top:a.top-b.top}}
const sceZoom=()=>{const C=SCE.step===2&&SCE_CAT[SCE.cat];return C&&C.cam||null};
function sceDraw(t,dt){const cv=$('sceCv');if(!cv)return;const low=LOWFX||SCE.low,dpr=Math.min(window.devicePixelRatio||1,low?1.25:2),w=cv.clientWidth,h=cv.clientHeight;if(w<4||h<4)return;
  const W=Math.round(w*dpr),H=Math.round(h*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
  const S0=sceSpot();if(!S0)return;
  // the camera moves softly from one step to the next (the hero a step closer, the gift)
  // close to the face there is no hard light (the colours as they are; and a figure that big would cost too much in a layer): it goes out
  // at once when the camera comes close, and comes back only when the camera is almost back
  if(SCE.kz==null||SCE.cx==null||dt<=0){SCE.kz=S0.k;SCE.cx=S0.x;SCE.cy=S0.y;SCE.zl=S0.zoom?0:1}
  else{const e=1-Math.exp(-dt*5);SCE.kz+=(S0.k-SCE.kz)*e;SCE.cx+=(S0.x-SCE.cx)*e;SCE.cy+=(S0.y-SCE.cy)*e;
    if(S0.zoom)SCE.zl*=Math.exp(-dt*16);else if(Math.abs(SCE.kz-S0.k)<S0.k*.12)SCE.zl+=(1-SCE.zl)*e}
  const S={...S0,k:SCE.kz,x:SCE.cx,y:SCE.cy},k=S.k;
  const x=cv.getContext('2d'),saved=ctx,gt=G.t;ctx=x;G.t=t;
  try{x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.drawImage(sceBgImg(W,H,S,dpr),0,0);x.setTransform(dpr,0,0,dpr,0,0);
    const fin=SCE.fin?t-SCE.fin.t0:-1,pulse=t-SCE.pulse,pl=pulse>0&&pulse<.6?Math.sin(pulse/.6*Math.PI):0,boost=1.5*pl+(fin>0&&fin<1.2?2*Math.sin(fin/1.2*Math.PI):0);
    if(boost>.02)sceLight(x,S,Math.max(0,S.y-110*k),boost,1);
    // fog drifting over the floor
    if(!low){if(!SCE.fog){SCE.fog=[];for(let i=0;i<7;i++)SCE.fog.push({x:Math.random(),y:Math.random(),s:.7+Math.random()*.6,v:(.008+Math.random()*.012)*(i%2?1:-1)})}
      for(const f of SCE.fog){const fx=((f.x+t*f.v)%1+1)%1*(w+240)-120,fy=S.y-5*k+f.y*20*k;x.globalAlpha=.07*f.s;x.drawImage(glowSprite('200,190,175'),fx-90*f.s,fy-16*f.s,180*f.s,32*f.s)}x.globalAlpha=1}
    // the rune stone under his feet, in his colour (grey for a locked hero; in the gift's colour while the gift stands on it)
    const I=SCE_INFO[SCE.sel]||SCE_INFO.arciere,lk=SCE.step===1&&!sceFree(SCE.sel),gifting=SCE.mode==='gift'&&SCE.gift;SCE.rt=(SCE.rt||0)+dt*(lk?.5:1.2);
    drawRuneStone(S.x,S.y,k*.58,lk?'150,150,170':gifting?SCE_GIFT[SCE.gift].rgb:I.rgb,SCE.rt);
    SCE.ember=(SCE.ember||0)+dt*(low?2:5);while(SCE.ember>1){SCE.ember--;if(SCE.hero)sceEmber(lk?'170,170,190':gifting?SCE_GIFT[SCE.gift].rgb:I.rgb,false)}
    sceEmbers(x,S,dt,low,false);
    // the heroes: the one going away sinks into the dark, the new one comes up into the light; when the gift takes the stone he sinks
    // too, and comes back up after it
    const hk=id=>k*(id==='druida'?.86:1),out=SCE.mode==='gift'?sceEz((t-SCE.modeT)/.32):0,lit=SCE.zl<.03?0:(1+.6*pl)*SCE.zl;
    if(SCE.prev){const a=1-sceEz((t-SCE.prev.t0)/.3);if(a<=0)SCE.prev=null;else sceHeroAt(SCE.prev,t,dt,S.x,S.y-(1-a)*3*k,hk(SCE.prev.id),a,['8,8,12',(.35+.4*(1-a)).toFixed(3)],lit)}
    if(SCE.hero&&out<1){const a=sceEz((t-SCE.hero.in-.08)/.34)*(1-out);sceHeroAt(SCE.hero,t,dt,S.x,S.y+((1-sceEz((t-SCE.hero.in-.08)/.34))*4+out*5)*k,hk(SCE.hero.id),a,lk?['6,6,10','.42']:null,lk?.5:lit);
      if(a<1&&a>0&&!low&&out===0){x.save();x.globalCompositeOperation='lighter';glow('255,236,200',S.x,S.y-24*k,26*k,.35*(1-a));x.restore()}}
    sceSmokes(x,S,dt);
    // a padlock swinging in front of a locked hero
    if(lk&&SCE.hero){const sw=Math.sin(t*2.1)*.18;x.save();x.translate(S.x+9.5*k,S.y-9*k);x.rotate(sw);x.scale(k*.42,k*.42);sceLockDraw(x);x.restore()}
    // the gift on the stone, in the hero's place; going back to the hero it sinks, going on it turns into light and flies into him
    if(SCE.gprev){const u=(t-SCE.gprev.t0)/(SCE.gprev.into?.5:.28);if(u>=1)SCE.gprev=null;
      else if(SCE.gprev.into){const q=sceEz(u);sceGiftAt(SCE.gprev,t,S.x,S.y-q*16*k,k*1.2*(1-.8*q),1-q*q,1)}
      else sceGiftAt(SCE.gprev,t,S.x,S.y+u*4*k,k*1.2,1-sceEz(u),1)}
    if(SCE.gcur)sceGiftAt(SCE.gcur,t,S.x,S.y,k*1.2,sceEz((t-SCE.gcur.t0)/.35),1);
    if(fin>=0&&fin<.7&&!low){x.save();x.globalCompositeOperation='lighter';glow('255,236,190',S.x,S.y-28*k,32*k,.45*(1-fin/.7));x.restore()}
    // dust in the light, the gift's sparks
    if(!low){if(!SCE.motes){SCE.motes=[];for(let i=0;i<30;i++)SCE.motes.push({u:Math.random()*2-1,v:Math.random(),s:.5+Math.random(),ph:Math.random()*TAU})}
      x.save();x.globalCompositeOperation='lighter';for(const m of SCE.motes){const vv=((m.v-t*.018*m.s)%1+1)%1,yy=S.y-104*k*vv+4*k,ww=(5+28*(1-vv))*k*.85,xx=S.x+m.u*ww+Math.sin(t*.4+m.ph)*3*k,a=.34*Math.sin(vv*Math.PI)*(.5+.5*Math.sin(t*1.3+m.ph));
        x.fillStyle=`rgba(255,236,190,${a.toFixed(3)})`;x.fillRect(xx,yy,1.4,1.4)}x.restore()}
    sceEmbers(x,S,dt,low,true)}
  catch(e){if(!SCE.err){SCE.err=1;console.error(e)}}
  finally{ctx=saved;G.t=gt}}
// the sparks of the hero (behind him) or of the gift (in front), in units of k/2.4 round the hero's feet
function sceEmbers(x,S,dt,low,gift){x.save();x.translate(S.x,S.y);x.scale(S.k/2.4,S.k/2.4);x.globalCompositeOperation='lighter';
  for(let i=SCE.emb.length-1;i>=0;i--){const e=SCE.emb[i];if(e.gift!==gift)continue;e.l+=dt;if(e.l>=e.max){SCE.emb.splice(i,1);continue}e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=.97;e.vy*=.985;
    const a=Math.sin(e.l/e.max*Math.PI),oy=gift?-14*2.4:0;x.fillStyle=`rgba(${e.rgb},${(.8*a).toFixed(3)})`;x.fillRect(e.x-.7*e.s,e.y+oy-.7*e.s,1.4*e.s,1.4*e.s);if(!low)glow(e.rgb,e.x,e.y+oy,3.4*e.s,.32*a)}
  x.restore()}
// puffs of smoke or dust round his feet (the entrances), in the same units as the sparks
function sceSmoke(rgb,n,s,ground){for(let i=0;i<n;i++){const a=Math.random()*TAU;
  SCE.smk.push(ground?{rgb,x:Math.cos(a)*16,y:2+Math.sin(a)*3,vx:Math.cos(a)*(28+Math.random()*30),vy:-2-Math.random()*5,r:(13+Math.random()*10)*s,l:0,max:.45+Math.random()*.3}
    :{rgb,x:(Math.random()*2-1)*24,y:-8-Math.random()*92,vx:(Math.random()*2-1)*22,vy:-4-Math.random()*12,r:(30+Math.random()*20)*s,l:0,max:.7+Math.random()*.45})}}
function sceSmokes(x,S,dt){const L=SCE.smk;if(!L||!L.length)return;x.save();x.translate(S.x,S.y);x.scale(S.k/2.4,S.k/2.4);
  for(let i=L.length-1;i>=0;i--){const f=L[i];f.l+=dt;if(f.l>=f.max){L.splice(i,1);continue}f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=.96;f.vy*=.97;const u=f.l/f.max,r=f.r*(.75+.5*u);
    x.globalAlpha=Math.min(1,u*7)*(1-u)*.85;x.drawImage(glowSprite(f.rgb),f.x-r,f.y-r,r*2,r*2)}x.globalAlpha=1;x.restore()}
function sceLockDraw(x){x.lineJoin='round';x.strokeStyle=INK;x.lineWidth=2.4;x.beginPath();x.moveTo(-5,0);x.lineTo(-5,-5);x.arc(0,-5,5,Math.PI,0);x.lineTo(5,0);x.stroke();
  x.strokeStyle='#b7bcc4';x.lineWidth=1.3;x.stroke();
  const g=x.createLinearGradient(0,-1,0,11);g.addColorStop(0,'#ffd86b');g.addColorStop(1,'#b8781a');x.fillStyle=g;x.beginPath();x.roundRect?x.roundRect(-8,-1,16,12,2.5):x.rect(-8,-1,16,12);x.fill();x.strokeStyle=INK;x.lineWidth=2;x.stroke();
  x.fillStyle=INK;x.beginPath();x.arc(0,4,1.8,0,TAU);x.fill();x.fillRect(-.8,4,1.6,4);x.fillStyle='rgba(255,255,255,.4)';x.fillRect(-6.4,.6,4,1.4)}
// one step of the screen (the tests step it by hand with SCE.manual, to look at every frame)
function sceTick(dt){SCE.time+=dt;const t=SCE.time;
  // at the end he turns to face us and stays there; otherwise the turntable: slowly round, the finger's push fading back into it
  // (while you write his name he slows down and turns his face to you)
  if(SCE.fin){let d=(Math.PI/2-.35)-SCE.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));SCE.yaw+=d*(1-Math.exp(-dt*5));SCE.vel=0}
  // (close on the face or the shoulders he looks at you; the whole head turns slowly, so the hair and the ears are seen all round)
  else if(!SCE.drag){const zm=sceZoom(),front=SCE.step===4||zm==='face'||zm==='bust',auto=front?0:zm==='head'?.42:.32;SCE.vel+=(auto-SCE.vel)*(1-Math.exp(-dt*(front?2.4:1.6)));SCE.yaw+=SCE.vel*dt;
    if(front&&Math.abs(SCE.vel)<.6){let d=(Math.PI/2-.35)-SCE.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));SCE.yaw+=d*(1-Math.exp(-dt*2.2))}}
  sceDraw(t,dt);if(SCE.step===2)sceTilesTick()}
// a slow phone (frames longer than 30 ms for a second and a half): smaller canvas, no fog, no dust, no light passes, like LOWFX
function sceLoop(now){if(!SCE.on)return;const raw=Math.max(0,(now-SCE.last)/1000),dt=Math.min(.05,raw);SCE.last=now;
  if(!SCE.manual&&raw<.25&&SCE.time>.6){SCE.ema=(SCE.ema||raw)+(raw-(SCE.ema||raw))*.06;SCE.slow=SCE.ema>.03?(SCE.slow||0)+raw:0;if(SCE.slow>1.5)SCE.low=true}
  if(!SCE.manual)sceTick(dt);SCE.raf=requestAnimationFrame(sceLoop)}

// while you choose, the game under the choice does not draw
{const _l=loop;loop=function(now){if(SCE.on){last=now;requestAnimationFrame(loop);return}_l(now)}}
// first the intro, then the making of the hero: at the end of the intro (or with «Salta») the screen opens over the menu
{const _ie=introEnd;introEnd=function(){const need=INTRO.on&&sceNeeded();if(need)SCE.wait=true;try{_ie.apply(this,arguments)}finally{SCE.wait=false}sceOwnSkins();if(need&&sceNeeded()&&!SCE.on)sceOpen()}}
// the fonts come while the intro plays; a save that was closed half way through the choice gets it again over the menu. The first time
// ever the prologue comes first: it starts at the tap on the loading screen (65) and opens the choice at its end. Behind the loading
// screen nothing is drawn: there the choice opens at the tap, before the menu's music
if(sceNeeded())sceFonts();
{const bootUp=()=>typeof BOOTS!=='undefined'&&LOAD.on&&!BOOTS.gone;if(sceNeeded()&&SAVE.introSeen&&!INTRO.on&&!bootUp())sceOpen();
  if(typeof bootGo==='function'){const _bg=bootGo;bootGo=function(){if(!BOOTS.gone&&SAVE.introSeen&&sceNeeded()&&!INTRO.on&&!SCE.on)sceOpen();
    const r=_bg.apply(this,arguments);if(sceNeeded()&&!INTRO.on&&!SCE.on)sceOpen();return r}}}
