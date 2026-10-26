// ===================================================================== ALBERO DELLE ABILITÀ (anteprima della Classica nuova, 21 ottobre)
// Denis: «fai in modo che nella modalità classica ci sia una nuova funzione di progressione: tutte le abilità che si possono prendere
// giocando appunto alla modalità classica, per averle potenziate devi livellarle nel menu apposito. deve essere bello e pulito con una non
// so che di magico», poi «il menu dei potenziamenti in battaglia nella modalità classica dovrà essere tipo uno di quei menu che per ogni
// abilità si va sempre più giù per migliorarla o aggiungerci altre cose più op». Le sue risposte: l'albero sta fuori dalla partita (in
// partita le tre carte restano, e l'abilità che prendi arriva con i passi che hai sbloccato); i passi si pagano in oro; l'albero scende a
// bivi e in fondo c'è la mossa più forte del ramo scelto; il ramo si cambia quando vuoi; subito nell'anteprima.
// Ogni abilità (SK) ha cinque passi: I e II dritti, III un bivio (più forte oppure una cosa nuova), IV dritto, V il bivio finale tra due
// mosse leggendarie. Valgono nelle partite della Classica (arena, Torre, Corsa, Abisso), non nella sfida del giorno, che è uguale per tutti.
// Questo file NON è in src/ordine.txt: lo mette python3 anteprime/mk_classica.py dopo 94 e 95. TR.on lo spegne.

// ---------------------------------------------------------------- 1 gli alberi, i costi, il salvataggio
const TR={on:true,err:0,cnt:{},hA:null,hE:null,cur:null,aim:null,grp:null,z:[],fx:[],t:{},sel:null,node:null};
const trErr=err=>{if(TR.err++<6)console.error('albero delle abilità:',err)};
const TR_COST=[100,250,500,1000,2000];                // oro per i passi I … V
const TR_RF=5;                                        // cristalli a passo per il rimborso di un albero (tutto l'oro torna)
const TR_ROM=['I','II','III','IV','V'];
// i gruppi nella striscia del menu, da sinistra a destra
const TR_GRP=[['Frecce',['front','multi','diag','side','rear','giant']],['Traiettorie',['ric','pierce','wallb']],['Elementi',['fire','ice','poison','light']],
  ['Lame e passi',['orbit','dash','boots']],['Forza',['atk','aspd','crit']],['Vita',['hp','heal','shield','vamp']]];
const TR_IDS=TR_GRP.flatMap(g=>g[1]);
// g: il segno del passo (danno, velocità, in più, effetto, difesa, cura, tempo, scoppio, stella delle mosse leggendarie)
const S1=(g,n,d)=>({g,n,d});
const TRD={
  front:{c:'#ffd24a',s:[S1('dmg','Punte di ferro','Le frecce dritte fanno +15% di danno.'),
    S1('spd','Tiro teso','Le frecce dritte volano più veloci e spingono indietro i nemici.'),
    [S1('more','Fila in più','Quando la prendi hai subito una freccia dritta in più.'),S1('fx','Frecce gemelle','Una freccia dritta che sconfigge un nemico si divide in due.')],
    S1('dmg',"Punte d'acciaio",'Le frecce dritte fanno altro +20% di danno.'),
    [S1('star','Lance di luce','Ogni 4 attacchi le frecce dritte diventano lance di luce che trapassano tutto.'),S1('star','Salva del capitano','Ogni 6 secondi parte una salva di nove frecce dritte, in tre file.')]]},
  multi:{c:'#ffa24a',s:[S1('dmg','Corda svelta','Le raffiche in più fanno +15% di danno.'),
    S1('spd','Ritmo','Le raffiche in più partono più ravvicinate.'),
    [S1('more','Terza corda','Quando la prendi hai subito una raffica in più.'),S1('fx','Raffica a ventaglio','Le raffiche in più si aprono a ventaglio e prendono più nemici.')],
    S1('dmg',"Corda d'argento",'Le raffiche in più fanno altro +20% di danno.'),
    [S1('star','Tempesta di frecce','Ogni 5 attacchi scocchi il doppio delle raffiche.'),S1('star','Eco di luce',"Dopo ogni attacco un'eco di luce riscocca la prima raffica.")]]},
  diag:{c:'#f2e27a',s:[S1('dmg','Ventaglio','Le frecce diagonali fanno +15% di danno.'),
    S1('spd','Ventaglio largo','Le frecce diagonali si aprono di più e volano più lontano.'),
    [S1('more','Coppia in più',"Quando la prendi hai subito un'altra coppia di frecce diagonali."),S1('fx','Frecce ricurve','Le frecce diagonali curvano verso i nemici.')],
    S1('dmg',"Ventaglio d'acciaio",'Le frecce diagonali fanno altro +20% di danno.'),
    [S1('star','Boomerang','Le frecce diagonali girano come lame e tornano da te, colpendo ancora.'),S1('star','Pioggia obliqua','Quando colpiscono, tre frecce cadono dal cielo intorno al nemico.')]]},
  side:{c:'#9fe06a',s:[S1('dmg','Braccia larghe','Le frecce laterali fanno +20% di danno.'),
    S1('more','Guardia','Le frecce laterali trapassano un nemico in più.'),
    [S1('more','Doppio lato','Due frecce per lato invece di una.'),S1('fx','Spine','Le frecce laterali lasciano a terra spine che pungono i nemici.')],
    S1('dmg','Braccia forti','Le frecce laterali fanno altro +25% di danno.'),
    [S1('star','Stella a otto punte','Ogni 4 attacchi scocchi frecce in otto direzioni intorno a te.'),S1('star','Guardiani di luce','Due lucciole ai tuoi fianchi tirano insieme a te.')]]},
  rear:{c:'#ef8a62',s:[S1('dmg','Occhi dietro','La freccia alle spalle fa +20% di danno.'),
    S1('fx','Freccia che cerca','La freccia alle spalle gira verso il nemico più vicino.'),
    [S1('more','Due alle spalle','Due frecce alle spalle invece di una.'),S1('fx','Ritirata','Quando scatti, tre frecce partono alle tue spalle.')],
    S1('dmg',"Spalle d'acciaio",'La freccia alle spalle fa altro +25% di danno.'),
    [S1('star','Coda di cometa','La freccia alle spalle diventa una cometa che lascia fuoco a terra.'),S1('star','Contrattacco','Quando ti colpiscono rispondi con cinque frecce.')]]},
  giant:{c:'#e3a462',s:[S1('dmg','Più grande','La freccia gigante fa +20% di danno.'),
    S1('fx','Spintone','La freccia gigante spinge via i nemici che colpisce.'),
    [S1('time','Più spesso','La freccia gigante arriva ogni 2 attacchi invece che ogni 3.'),S1('aoe','Freccia che scoppia','La freccia gigante scoppia quando si ferma.')],
    S1('dmg','Gigante di ferro','La freccia gigante fa altro +30% di danno.'),
    [S1('star','Freccia del titano','Ogni tre frecce giganti, una enorme che attraversa la stanza e fa tremare tutto.'),S1('star','Gigante che si apre','Al primo nemico la freccia gigante si apre in cinque frecce grandi.')]]},
  ric:{c:'#7bdc8a',s:[S1('dmg','Salto forte','A ogni salto la freccia fa +15% di danno in più.'),
    S1('spd','Salto lungo','La freccia salta su nemici più lontani.'),
    [S1('more','Salto doppio','Quando la prendi la freccia salta subito una volta in più.'),S1('fx','Scintilla','A ogni salto una scintilla colpisce i nemici vicini.')],
    S1('dmg','Salto feroce','A ogni salto altro +15% di danno in più.'),
    [S1('star','Rimbalzo infinito','La freccia continua a saltare finché trova nemici, fino a 12 volte.'),S1('star','Scoppio finale','Finiti i salti, la freccia scoppia.')]]},
  pierce:{c:'#b6e05a',s:[S1('dmg','Punta sottile','Dopo il primo nemico la freccia fa +15% di danno.'),
    S1('fx','Crepa','I nemici trapassati prendono +15% di danno per 3 secondi.'),
    [S1('more','Trapasso doppio','Quando la prendi la freccia trapassa subito un nemico in più.'),S1('fx','Schegge','Ogni nemico trapassato lancia due schegge ai lati.')],
    S1('dmg','Punta di diamante','Dopo il primo nemico altro +20% di danno.'),
    [S1('star','Trapassa tutto','Le frecce trapassano tutti i nemici e crescono a ogni colpo.'),S1('star','Stella di schegge','Ogni tre nemici trapassati la freccia scoppia in dodici schegge.')]]},
  wallb:{c:'#cdb88e',s:[S1('dmg','Sponda forte','Dopo il rimbalzo sul muro la freccia fa +20% di danno.'),
    S1('fx','Sponda viva','Rimbalzando sul muro la freccia punta al nemico più vicino.'),
    [S1('more','Sponda doppia','Quando la prendi la freccia rimbalza subito una volta in più.'),S1('aoe','Sponda di scintille','Rimbalzando sul muro la freccia fa scoppiare una scintilla.')],
    S1('dmg',"Sponda d'acciaio",'Dopo il rimbalzo altro +25% di danno.'),
    [S1('star','Biliardo','Rimbalzando sul muro la freccia si divide in due.'),S1('star','Muri che tirano','Ogni 4 secondi i muri tirano sei frecce sui nemici.')]]},
  fire:{c:'#ff7a2a',s:[S1('dmg','Brace','Il fuoco fa +20% di danno.'),
    S1('time','Fuoco lungo','Il fuoco dura un secondo in più.'),
    [S1('dmg','Fuoco vivo','Il fuoco fa altro +30% di danno.'),S1('fx','Fiamme che saltano','Un nemico che brucia e cade incendia quelli vicini.')],
    S1('dmg','Cenere ardente','Il fuoco fa altro +20% di danno.'),
    [S1('star','Terra in fiamme','I nemici che bruciano lasciano fiamme a terra.'),S1('star','Vampata','Un nemico che cade bruciando esplode in una vampata.')]]},
  ice:{c:'#7fd8ff',s:[S1('time','Brina lunga','Il rallentamento dura di più.'),
    S1('dmg','Gelo che morde','I nemici rallentati prendono +10% di danno.'),
    [S1('dmg','Gelo profondo','I nemici rallentati prendono altro +15% di danno.'),S1('fx','Ghiaccio che si spacca','Ogni quarto colpo su un nemico rallentato lo congela per un attimo.')],
    S1('fx','Aria gelida','I nemici vicini a te sono sempre un po\' rallentati.'),
    [S1('star','Tormenta','Ogni 7 secondi una tormenta colpisce e rallenta tutti i nemici.'),S1('star','Statue di ghiaccio','I nemici rallentati che cadono esplodono in schegge di ghiaccio.')]]},
  poison:{c:'#9be04a',s:[S1('dmg','Veleno forte','Il veleno fa +20% di danno.'),
    S1('time','Veleno lento','Il veleno dura due secondi in più.'),
    [S1('more','Veleno denso','Il veleno si accumula fino a 6 volte invece di 4.'),S1('fx','Nube velenosa','Un nemico avvelenato che cade lascia una nube velenosa.')],
    S1('dmg','Veleno nero','Il veleno fa altro +30% di danno.'),
    [S1('star','Contagio','Il veleno passa da solo ai nemici vicini.'),S1('star','Veleno che scoppia','Al massimo del veleno il nemico scoppia in una nube che fa molto male.')]]},
  light:{c:'#a8d8ff',s:[S1('dmg','Scarica','Il fulmine fa +25% di danno.'),
    S1('more','Cielo pieno','Il fulmine salta su un nemico in più.'),
    [S1('time','Tempesta','Il fulmine cade più spesso.'),S1('fx','Scossa','Il fulmine stordisce i nemici per un attimo.')],
    S1('dmg','Alta tensione','Il fulmine fa altro +25% di danno.'),
    [S1('star','Temporale','Ogni 6 secondi cadono cinque fulmini sui nemici.'),S1('star','Nuvola amica','Una nuvola nera ti segue e lancia fulmini sui nemici.')]]},
  orbit:{c:'#bfcbdb',s:[S1('dmg','Lame affilate','Le lame fanno +25% di danno.'),
    S1('spd','Filo tagliente','Le lame colpiscono più spesso.'),
    [S1('more','Lama in più','Quando la prendi hai subito una lama in più.'),S1('fx','Lame di fuoco','Le lame incendiano i nemici.')],
    S1('dmg',"Lame d'argento",'Le lame fanno altro +25% di danno.'),
    [S1('star','Corona di lame','Ogni 5 secondi le lame volano sui nemici e tornano da te.'),S1('star','Scudo di lame','Le lame fermano i colpi dei nemici.')]]},
  dash:{c:'#4fd1c5',s:[S1('time','Passo leggero','Lo scatto si ricarica il 10% più in fretta.'),
    S1('spd','Passo lungo','Lo scatto ti porta più lontano.'),
    [S1('time',"Passo d'aria",'Lo scatto si ricarica altro 15% più in fretta.'),S1('fx','Passo di fuoco','Lo scatto lascia una scia di fiamme.')],
    S1('def','Passo sicuro','Dopo lo scatto sei intoccabile un attimo di più.'),
    [S1('star','Doppio passo','Puoi scattare due volte di fila.'),S1('star',"Ombra che scoppia","Scattando lasci un'ombra che scoppia sui nemici.")]]},
  boots:{c:'#d8a86e',s:[S1('spd','Suole buone','Stivali leggeri dà +3% di velocità in più.'),
    S1('def','Schivata','Mentre corri a volte schivi i colpi (5%).'),
    [S1('spd',"Suole d'aria",'Stivali leggeri dà altro +5% di velocità.'),S1('fx','Scia di vento','Correndo lasci una scia di vento che rallenta i nemici.')],
    S1('def','Piedi agili','La schivata sale al 10%.'),
    [S1('star','Corsa del vento','Dopo due secondi di corsa vai velocissimo e schivi di più.'),S1('star','Passi di tuono','Ogni tre secondi di corsa un tuono colpisce i nemici vicini.')]]},
  atk:{c:'#e3e9f1',s:[S1('dmg','Cote','Punte affilate dà +3% di attacco in più.'),
    S1('dmg','Cote fine','Punte affilate dà altro +3%.'),
    [S1('more','Acciaio buono','Punte affilate dà altro +5%.'),S1('fx','Colpo pesante','Ogni quinto colpo fa il doppio del danno.')],
    S1('dmg','Lama nobile','Punte affilate dà altro +4%.'),
    [S1('star','Colpo del gigante','Contro i nemici quasi illesi fai +40% di danno.'),S1('star','Colpo di grazia','I nemici sotto il 15% di vita cadono subito; i boss prendono +30%.')]]},
  aspd:{c:'#ffe066',s:[S1('spd','Corda nuova',"Corda tesa dà +3% di velocità d'attacco in più."),
    S1('spd','Corda doppia','Corda tesa dà altro +3%.'),
    [S1('more',"Corda d'oro",'Corda tesa dà altro +5%.'),S1('fx','Mano calda','Ogni nemico sconfitto ti fa tirare più veloce per 3 secondi (fino a +30%).')],
    S1('spd','Corda di seta','Corda tesa dà altro +4%.'),
    [S1('star','Frenesia','Sotto metà salute tiri il 50% più veloce.'),S1('star',"Raffica d'oro",'Ogni 8 secondi, per 2 secondi tiri al doppio della velocità.')]]},
  crit:{c:'#ff6b6b',s:[S1('more','Occhio attento','Occhio di falco dà +2% di critico in più.'),
    S1('dmg','Colpo preciso','I critici fanno +20% di danno.'),
    [S1('more',"Occhio d'aquila",'Occhio di falco dà altro +3% di critico.'),S1('fx','Critico a catena','Un critico fa saltare una scintilla sul nemico più vicino.')],
    S1('dmg','Mano ferma','I critici fanno altro +20% di danno.'),
    [S1('star','Colpo perfetto','Ogni 5 secondi il colpo dopo è un critico enorme (×4).'),S1('star','Stella cadente','Un critico su quattro fa cadere una stella che scoppia.')]]},
  hp:{c:'#ff7f8e',s:[S1('heal','Linfa','Cuore di quercia dà +5% di salute in più.'),
    S1('def','Corteccia','Prendi il 5% di danno in meno.'),
    [S1('heal','Quercia antica','Cuore di quercia dà altro +10% di salute.'),S1('heal','Linfa che cura','Recuperi un poco di salute ogni secondo.')],
    S1('def','Radici profonde','Prendi altro 5% di danno in meno.'),
    [S1('star','Cuore del bosco','Una volta per stanza, sotto il 30% di salute ti curi del 40%.'),S1('star','Corteccia di pietra','Ogni 8 secondi la corteccia ti copre: il colpo dopo fa metà danno.')]]},
  heal:{c:'#ff9ec4',s:[S1('heal','Pozione grande','La pozione cura il 10% in più.'),
    S1('spd','Pozione frizzante','Bevendo la pozione corri più veloce per 4 secondi.'),
    [S1('heal','Pozione doppia','La pozione cura altro 15% in più.'),S1('fx','Pozione di scorta','Una volta a partita, sotto il 20% di salute bevi da solo una pozione.')],
    S1('heal','Erbe buone','Anche i cuori raccolti curano il 25% in più.'),
    [S1('star','Cerchio della vita','Bevendo la pozione si apre un cerchio di luce che ti cura per 5 secondi.'),S1('star','Pozione esplosiva','Bevendo la pozione la bottiglia scoppia e respinge i nemici.')]]},
  shield:{c:'#6fcf6f',s:[S1('time','Muschio fitto','Lo scudo torna un secondo prima.'),
    S1('fx','Muschio che spinge','Quando lo scudo para, respinge i nemici vicini.'),
    [S1('time','Muschio rapido','Lo scudo torna altri 1,5 secondi prima.'),S1('heal','Scudo che cura','Quando lo scudo para ti curi del 5%.')],
    S1('def','Muschio antico','Dopo una parata sei intoccabile un attimo di più.'),
    [S1('star','Doppio scudo','Lo scudo para due colpi prima di sparire.'),S1('star','Scudo di spine','Quando lo scudo para, lancia otto spine intorno a te.')]]},
  vamp:{c:'#e8557a',s:[S1('heal','Sete','Ogni nemico sconfitto cura il 50% in più.'),
    S1('heal','Sorso dei forti','I nemici élite sconfitti curano cinque volte tanto.'),
    [S1('heal','Sete grande','Ogni nemico sconfitto cura altro 50% in più.'),S1('def',"Scudo d'anima",'La cura che avanza diventa uno scudo che para i colpi.')],
    S1('heal','Sete profonda','Ogni nemico sconfitto cura altro 50% in più.'),
    [S1('star','Festa','Ogni 10 nemici sconfitti senza farti colpire ti curi del 20%.'),S1('star','Patto della luna','Sotto il 30% di salute la cura dei nemici sconfitti triplica.')]]}};
// il salvataggio: SAVE.cn.tr[id] = {lv: passi comprati (0…5), f3 e f5: il lato dei bivi (0 a sinistra, 1 a destra)}
function trS(){const S=cnS();return S.tr||(S.tr={})}
const trLv=id=>{const o=trS()[id];return o?o.lv|0:0};
function trHas(id,s,b){const o=trS()[id];if(!o||(o.lv|0)<s)return false;if(b==null)return true;return((s===3?o.f3:o.f5)|0)===b}
const trStep=(id,s)=>TRD[id].s[s-1];
const trSide=(id,s)=>{const o=trS()[id];return o?((s===3?o.f3:o.f5)|0):0};
// la partita in cui valgono: la Classica (arena, Torre, Corsa, Abisso), non la sfida del giorno né il trailer
const trRun=()=>TR.on&&!!G&&!!P&&!G.daily&&!(typeof INTRO!=='undefined'&&INTRO.on)&&!zMode();
// il passo vale adesso: in partita, con l'abilità presa
const trOn=(id,s,b)=>trRun()&&!!P.skills&&(P.skills[id]||0)>0&&trHas(id,s,b);

// ---------------------------------------------------------------- 2 in partita: le prese, le frecce, i colpi, le uccisioni
// le carte dei numeri: quanto dà in più ogni passo rispetto alla carta (Punte affilate +20% → +23% col passo I…)
const TR_STAT={atk:[.03,.03,.05,.04],aspd:[.03,.03,.05,.04]};
const trN=k=>{TR.n[k]=(TR.n[k]||0)+1};
function trReset(){Object.assign(TR,{n:{},cnt:{},z:[],fx:[],t:{},att:0,gc:0,gN:0,hits:0,hA:null,hE:null,cur:null,aim:null,grp:null,vk:0,lance:-1,dep:0,
  dch:0,perf:0,bark:0,soul:0,feast:0,scorta:false,roomN:0,hpRoom:-1,hot:0,hotT:0,fizT:0,goldT:0,runT:0,runT2:0,fac:{aspd:1,spd:1},sh2:false,
  echo:[],salvo:[],orbOut:0,orbT:0,mx:0,my:0,dx:0,dy:0,wind:0,live:[],shS:-9,cntT:-9})}
trReset();
{const _nr=newRun;newRun=function(){const r=_nr.apply(this,arguments);try{trReset()}catch(err){trErr(err)}return r}}
{const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{TR.z=[];TR.fx=[];TR.echo=[];TR.salvo=[];TR.roomN++;if(TR.orbOut&&P){P.orbit+=TR.orbOut;TR.orbOut=0}}catch(err){trErr(err)}return r}}
// quando un'abilità entra (carta, mercante, altare, ruota, l'abilità con cui parte l'eroe): i passi che valgono a ogni presa e quelli della prima
function trSync(){if(!trRun()||!P.skills)return;const C=TR.cnt;for(const id in P.skills){const n=P.skills[id]|0,h=C[id]|0;if(n>h){C[id]=n;if(TRD[id])for(let k=h+1;k<=n;k++)try{trTook(id,k)}catch(err){trErr(err)}}}}
function trStatB(id){const v=TR_STAT[id];return(trOn(id,1)?v[0]:0)+(trOn(id,2)?v[1]:0)+(trOn(id,3,0)?v[2]:0)+(trOn(id,4)?v[3]:0)}
function trTook(id,k){const first=k===1;
  if(first){const ex={front:'front',multi:'multi',diag:'diag',ric:'ric',pierce:'pierce',orbit:'orbit',wallb:'wb'}[id];if(ex&&trOn(id,3,0))P[ex]=(P[ex]||0)+1}
  if(id==='atk'){const b=trStatB('atk');if(b)P.atk*=(1.2+b)/1.2}
  else if(id==='aspd'){const b=trStatB('aspd');if(b)P.aspd*=(1.2+b)/1.2}
  else if(id==='crit')P.crit+=(trOn('crit',1)?.02:0)+(trOn('crit',3,0)?.03:0);
  else if(id==='hp'){const b=(trOn('hp',1)?.05:0)+(trOn('hp',3,0)?.1:0);if(b){const a=Math.round(P.maxhp*b/1.2);P.maxhp+=a;P.hp+=a}}
  else if(id==='boots'){const b=(trOn('boots',1)?.03:0)+(trOn('boots',3,0)?.05:0);if(b)P.spd=(P.spd||150)*(1.15+b)/1.15}
  else if(id==='dash'){if(trOn('dash',1))P.dashMax*=.9;if(trOn('dash',3,0))P.dashMax*=.85}
  else if(id==='heal')trPotion();
  else if(id==='shield'&&trOn('shield',5,0))TR.sh2=false}
// la pozione bevuta: più cura, la corsa frizzante, il cerchio della vita, la bottiglia che scoppia
function trPotion(){trN('potion');const b=(trOn('heal',1)?.1:0)+(trOn('heal',3,0)?.15:0);if(b){const v=Math.round(P.maxhp*b);P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-52,'+'+v,'#ff9ec4',14)}
  if(trOn('heal',2))TR.fizT=4;
  if(trOn('heal',5,0))trZone('life',P.x,P.y,48,5);
  if(trOn('heal',5,1)){trAoe(P.x,P.y,80,1.5,{kb:260});vfxBlast(P.x,P.y-10,'255,160,210',80,{sparks:18,spcol:['#ffd0e6','#ff9ec4','#ffffff'],dust:6});trGlass(P.x,P.y-14);sfx('glass',0,P.x);shake(4)}}
// colpi ad area dei passi: sempre «di contorno» (dot), così non fanno partire altri effetti dei colpi
function trAoe(x,y,r,k,o){o=o||{};let n=0;TR.dep++;try{for(const e of G.enemies.slice()){if(!canHit(e)||e===o.skip||Math.hypot(e.x-x,e.y-y)>r+e.r)continue;n++;hurtE(e,P.atk*k,false,true);
  if(o.kb&&!e.dead&&!isBoss(e.type)){const a=Math.atan2(e.y-y,e.x-x);e.kbx=(e.kbx||0)+Math.cos(a)*o.kb;e.kby=(e.kby||0)+Math.sin(a)*o.kb}if(o.f&&!e.dead)o.f(e)}}finally{TR.dep--}return n}
function trZone(k,x,y,r,t){const cap=LOWFX?10:22;if(TR.z.length>=cap){const i=TR.z.findIndex(q=>q.k===k);TR.z.splice(i<0?0:i,1)}TR.z.push({k,x,y,r,t,max:t,tick:Math.random()*.5,s:Math.random()*99})}
function trPush(f){if(TR.fx.length<(LOWFX?70:180))TR.fx.push(f)}
// una freccia dei passi (gemelle, salve, schegge, spine…): con un gruppo suo, così non riceve i bonus di un altro gruppo
function trShot(x,y,a,m,grp,o){TR.grp=grp;const n0=G.arrows.length;try{arrow(x,y,a,m)}finally{TR.grp=null}const ar=G.arrows[n0];if(ar&&o)Object.assign(ar,o);return ar}
function trBurn(e,t){e.burn=Math.max(e.burn||0,t);if(!(e.burnTick>=0))e.burnTick=0}
function trGlass(x,y){if(LOWFX)return;for(let i=0;i<8;i++){const a=rand(0,TAU),s=rand(90,190);fxPush({k:'streak',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-60,g:420,t:rand(.25,.45),max:.45,col:pk(['#ffd0e6','#fff','#ff9ec4']),w:2})}}
function trLight(rgb,x,y,r,t){fxPush({k:'flash',x,y,rgb,r,t,max:t})}

// --- la raffica: quale raffica dell'attacco è (la coda dei colpi la sa), i passi che contano gli attacchi
function trQueue(){const Q=P.queue;if(!Q||Q.trW)return;Q.trW=1;
  Q.push=function(){for(const q of arguments)if(q&&q.trK==null&&typeof q.t==='number'){q.trK=Math.round(q.t/.12);if(q.trK>0&&trOn('multi',2))q.t*=.7}return Array.prototype.push.apply(this,arguments)}}
{const _vo=volley;volley=function(a){if(!trRun())return _vo.apply(this,arguments);
  let k=0;const Q=P.queue;for(let i=Q.length-1;i>=0;i--)if(Q[i].t<=0){k=Q[i].trK||0;break}
  const echo=!!TR.echoing;if(k===0&&!echo)TR.att++;
  let aim=a;if(k>0&&trOn('multi',3,1))aim=a+(k%2?1:-1)*.15*Math.ceil(k/2);
  if(P.giant&&!echo&&trOn('giant',3,0))G.gv=(++TR.gc%2===0)?2:0;
  if(k===0&&!echo&&trOn('front',5,0)&&TR.att%4===0)TR.lance=TR.att;
  TR.aim=aim;TR.vk=k;let r;try{r=_vo.call(this,aim)}finally{TR.aim=null}
  try{if(!echo){
    if(P.side&&trOn('side',3,0)){trShot(P.x,P.y-6,aim+Math.PI/2+.2,.7,'side');trShot(P.x,P.y-6,aim-Math.PI/2-.2,.7,'side')}
    if(P.rear&&trOn('rear',3,0)){trShot(P.x,P.y-6,aim+Math.PI+.22,.7,'rear');trShot(P.x,P.y-6,aim+Math.PI-.22,.7,'rear')}
    if(k===0){
      if(trOn('side',5,0)&&TR.att%4===0){for(let i=0;i<8;i++)trShot(P.x,P.y-6,aim+i*TAU/8+TAU/16,.8,'star8',{trK:'star8'});trLight('255,236,150',P.x,P.y-10,46,.2);tone(880,1320,.12,'triangle',.03)}
      if(trOn('multi',5,0)&&TR.att%5===0){trN('storm5');const n=P.multi,st=trOn('multi',2)?.084:.12;for(let j=0;j<n;j++)P.queue.push({t:(n+j)*st,trK:n+j});trLight('255,190,90',P.x,P.y-10,36,.18)}
      if(trOn('multi',5,1))TR.echo.push({t:.3});
      if(trOn('side',5,1)&&TR.wisp)for(const w of TR.wisp.p){const tg=nearest(w.x,w.y);if(tg)trShot(w.x,w.y,Math.atan2(tg.y-tg.r-w.y,tg.x-w.x),.5,'wisp',{trK:'wisp',pierce:0,ric:0,wb:0})}}}}catch(err){trErr(err)}
  return r}}
// --- ogni freccia: il suo gruppo (dalla raffica) e i bonus dei passi
class TrHit extends Set{add(e){if(this.ar){TR.hA=this.ar;TR.hE=e}return super.add(e)}}
{const _ar=arrow;arrow=function(x,y,a,m){const n0=G?G.arrows.length:0;const r=_ar.apply(this,arguments);
  try{if(trRun())for(let i=n0;i<G.arrows.length;i++)trTag(G.arrows[i],a,m)}catch(err){trErr(err)}return r}}
function trTag(ar,a,m){if(ar.trM)return;const h=new TrHit();h.ar=ar;ar.hit=h;ar.trM=1;ar.trN=0;
  let g=TR.grp||'x';if(!TR.grp&&TR.aim!=null&&!ar.blade){const d=Math.abs(angDiff(TR.aim,a));
    if(m===2.4)g='giant';else if(m===1&&d<.01)g='front';else if(m===.8&&d>.3&&Math.abs(d/.42-Math.round(d/.42))<.03)g='diag';
    else if(m===.7&&Math.abs(d-Math.PI/2)<.01)g='side';else if(m===.7&&Math.abs(d-Math.PI)<.01)g='rear'}
  ar.trG=g;const sp=f=>{ar.vx*=f;ar.vy*=f};
  if(TR.echoing){ar.trM*=.5;ar.trK='echo'}
  if(TR.aim!=null&&TR.vk>0)ar.trM*=(trOn('multi',1)?1.15:1)*(trOn('multi',4)?1.2:1);
  if(g==='front'){ar.trM*=(trOn('front',1)?1.15:1)*(trOn('front',4)?1.2:1);if(trOn('front',2)){sp(1.25);ar.trKb=1}
    if(TR.lance===TR.att&&trOn('front',5,0)){ar.pierce=99;ar.trM*=1.4;ar.trK='lance';ar.life=Math.max(ar.life,1.6)}}
  else if(g==='diag'){ar.trM*=(trOn('diag',1)?1.15:1)*(trOn('diag',4)?1.2:1);
    if(trOn('diag',2)&&TR.aim!=null){const da=angDiff(TR.aim,a)*.2,c=Math.cos(da),s=Math.sin(da),vx=ar.vx;ar.vx=vx*c-ar.vy*s;ar.vy=vx*s+ar.vy*c;ar.a+=da;ar.life*=1.25}
    if(trOn('diag',3,1))ar.trHome=2.6;if(trOn('diag',5,0)){ar.trBoom=1;ar.trK='boom';ar.pierce=Math.max(ar.pierce,4);ar.life=Math.max(ar.life,1.8)}if(trOn('diag',5,1))ar.trSky=1}
  else if(g==='side'){ar.trM*=(trOn('side',1)?1.2:1)*(trOn('side',4)?1.25:1);if(trOn('side',2))ar.pierce++;if(trOn('side',3,1))ar.trEnd='thorn'}
  else if(g==='rear'){ar.trM*=(trOn('rear',1)?1.2:1)*(trOn('rear',4)?1.25:1);if(trOn('rear',2))ar.trHome=4;if(trOn('rear',5,0)){ar.trK='comet';ar.trComet=1}}
  else if(g==='giant'){ar.trM*=(trOn('giant',1)?1.2:1)*(trOn('giant',4)?1.3:1);if(trOn('giant',2))ar.trKb=2;if(trOn('giant',3,1))ar.trEnd='gboom';
    if(trOn('giant',5,0)&&++TR.gN%3===0){ar.trK='titan';ar.trM*=2.5;ar.pierce=99;ar.life=Math.max(ar.life,2.2);shake(5);sfx('roar');tone(110,60,.5,'sawtooth',.05)}
    if(trOn('giant',5,1))ar.trSplit=1}
  if(TR.aim!=null&&g!=='x'&&trOn('pierce',5,0)){ar.pierce=99;ar.trGrow=1}
  if(TR.grp==='twin'||TR.grp==='shard'||TR.grp==='wisp'||TR.grp==='star8'||TR.grp==='wall'||TR.grp==='thorn8')ar.trNoSplit=1}
// --- il raggio dei salti del Rimbalzo (il gioco cerca a 200 px)
{const _ne=nearest;nearest=function(x,y,skip,maxD){if(maxD===200&&skip instanceof TrHit&&trOn('ric',2))maxD=280;return _ne.call(this,x,y,skip,maxD)}}
// --- il fulmine: quando cade, i suoi colpi si riconoscono (TR.inL)
{const _li=lightning;lightning=function(e){if(!trRun())return _li.apply(this,arguments);const L0=P.light,more=trOn('light',2);TR.inL=(more?(.9+.3*L0)/(.9+.3*(L0+1)):1);if(more)P.light=L0+1;
  try{return _li.apply(this,arguments)}finally{P.light=L0;TR.inL=0}}}
// --- i colpi: di chi sono (freccia, lama, fiamma, veleno, fulmine) e quanto valgono coi passi
{const _he=hurtE;hurtE=function(e,dmg,crit,dot){if(!trRun()||!e||e.dead)return _he.apply(this,arguments);
  let ar=null;if(!dot&&TR.hA&&TR.hE===e){ar=TR.hA;TR.hA=TR.hE=null;if(Math.abs(dmg-P.atk*ar.m*(crit?(P.critMul||2):1))>1e-6)ar=null}
  let k=1;const boss=isBoss(e.type);
  if(ar){if(ar.trP0==null){ar.trP0=ar.pierce;ar.trR0=ar.ric}const j=ar.trN;k*=ar.trM;
    if(j>0&&ar.trR0>0)k*=1+((trOn('ric',1)?.15:0)+(trOn('ric',4)?.15:0))*j;
    if(j>0&&ar.trP0>0)k*=1+(trOn('pierce',1)?.15:0)+(trOn('pierce',4)?.2:0);
    if(ar.trW>0)k*=(trOn('wallb',1)?1.2:1)*(trOn('wallb',4)?1.25:1);
    if(ar.trGrow)k*=Math.min(1.6,1+.08*j);
    let perf=false;if(TR.perf&&trOn('crit',5,0)){trN('perf');perf=true;TR.perf=0;TR.t.perf=5;k*=4/(crit?(P.critMul||2):1);crit=true;
      text(e.x,e.y-e.r-40,'PERFETTO!','#ffe27a',20);G.texts[G.texts.length-1].pop=1;trLight('255,236,160',e.x,e.y-e.r,60,.25);tone(1320,1980,.18,'triangle',.05);shake(3)}
    if(crit&&!perf)k*=(trOn('crit',2)?1.2:1)*(trOn('crit',4)?1.2:1);
    if(trOn('atk',3,1)&&++TR.hits%5===0){k*=2;trLight('255,255,255',e.x,e.y-e.r,30,.14)}
    if(trOn('atk',5,0)&&e.hp>e.max*.7)k*=1.4}
  else if(dot){if(dmg===P.atk*.18*(P.burnMul||1))k*=1+(trOn('fire',1)?.2:0)+(trOn('fire',3,0)?.3:0)+(trOn('fire',4)?.2:0);
    else if(e.poisonS&&dmg===P.atk*.07*e.poisonS*(P.poison||1))k*=1+(trOn('poison',1)?.2:0)+(trOn('poison',4)?.3:0);
    if(TR.inL)k*=TR.inL*(1+(trOn('light',1)?.25:0)+(trOn('light',4)?.25:0))}
  const orb=!dot&&!crit&&e.orbCd===.35&&dmg===P.atk*.6;if(orb)k*=1+(trOn('orbit',1)?.25:0)+(trOn('orbit',4)?.25:0);
  if(e.slow>0)k*=1+(trOn('ice',2)?.1:0)+(trOn('ice',3,0)?.15:0);
  if(e.trVul>0)k*=1.15;
  if(boss&&trOn('atk',5,1)&&e.hp<e.max*.15)k*=1.3;
  const s0=e.poisonS||0,sl0=e.slow||0,wasSlow=sl0>0;
  TR.cur=ar;let r;try{r=_he.call(this,e,dmg*k,crit,dot)}finally{TR.cur=null}
  try{trAfterHit(e,ar,crit,dot,orb,s0,wasSlow)}catch(err){trErr(err)}
  return r}}
function trAfterHit(e,ar,crit,dot,orb,s0,wasSlow){const boss=isBoss(e.type),alive=!e.dead;
  if(!dot){
    if(P.fire&&alive&&trOn('fire',2)&&e.burn===2.5)e.burn=3.5;
    if(P.ice&&alive&&trOn('ice',1)&&e.slow===1.8)e.slow=2.6;
    if(P.poison&&alive){if(trOn('poison',2)&&e.poisonT===3)e.poisonT=5;const mx=trOn('poison',3,0)?6:4;if(mx>4)e.poisonS=Math.min(6,s0+1);
      if(trOn('poison',5,1)&&e.poisonS>=mx&&TR.dep<3){e.poisonS=1;trN('pburst');trPoisonBurst(e)}}
    if(alive&&wasSlow&&trOn('ice',3,1)&&(e.trIc=(e.trIc||0)+1)>=4){e.trIc=0;if(boss)e.slow=Math.max(e.slow,3);else{e.frozen=Math.max(e.frozen||0,.8);text(e.x,e.y-e.r-30,'GELO','#bfe9ff',13)}}}
  if(orb&&alive){if(trOn('orbit',2))e.orbCd=.24;if(trOn('orbit',3,1))trBurn(e,2.5)}
  if(TR.inL&&alive&&!boss&&trOn('light',3,1))e.trStun=Math.max(e.trStun||0,.55);
  if(alive&&!boss&&trOn('atk',5,1)&&e.hp<e.max*.15&&e.hp>0&&TR.dep<3){trN('grace');TR.dep++;try{text(e.x,e.y-e.r-34,'GRAZIA','#ffe27a',13);_hurtKill(e)}finally{TR.dep--}}
  if(!ar)return;const j=ar.trN++;
  if(ar.trKb&&alive&&!boss&&e.type!=='plant'&&e.type!=='eyeflower'){const f=ar.trKb===2?190:55;e.kbx=(e.kbx||0)+Math.cos(ar.a)*f;e.kby=(e.kby||0)+Math.sin(ar.a)*f;if(ar.trKb===2&&!LOWFX)dustRing(e.x,e.y,6)}
  if(ar.trP0>0&&trOn('pierce',2))e.trVul=3;
  if(ar.trP0>0&&ar.pierce>0&&ar.pierce<90&&trOn('pierce',3,1)&&!ar.trNoSplit)for(const s of[-1,1])trShot(e.x,e.y-6,ar.a+s*Math.PI/2,.35,'shard',{trK:'shard',pierce:0,ric:0,wb:0,life:.35});
  if(trOn('pierce',5,1)&&ar.trP0>0&&!ar.trNoSplit&&(j+1)%3===0){trN('shards');for(let i=0;i<12;i++)trShot(e.x,e.y-6,i*TAU/12,.35,'shard',{trK:'shard',pierce:0,ric:0,wb:0,life:.4});trLight('210,255,140',e.x,e.y-e.r,40,.2);sfx('glass',0,e.x)}
  if(j>0&&ar.trR0>0&&trOn('ric',3,1)){trAoe(e.x,e.y,40,.3,{skip:e});trLight('170,255,190',e.x,e.y-e.r,28,.14)}
  if(ar.trR0>0&&trOn('ric',5,0)&&ar.ric===0&&ar.trN<12){ar.ric=1;ar.vx*=1.06;ar.vy*=1.06}
  if(ar.trR0>0&&trOn('ric',5,1)&&ar.ric===0&&ar.pierce===0&&!ar.trB){ar.trB=1;trN('ricboom');trAoe(e.x,e.y,70,1.2,{skip:e});vfxBlast(e.x,e.y-8,'150,255,170',70,{sparks:16,dust:4});sfx('boom',0,e.x)}
  if(ar.trSky){ar.trSky=0;trN('sky');for(let i=0;i<3;i++){const a=rand(0,TAU),d=rand(18,34);trPush({k:'sky',x:e.x+Math.cos(a)*d,y:e.y+Math.sin(a)*d*.7,t:.35+i*.08,max:.35+i*.08})}}
  if(ar.trSplit&&!ar.trNoSplit){ar.trSplit=0;trN('split');for(let i=-2;i<=2;i++)trShot(e.x,e.y-6,ar.a+i*.25,1,'x',{trK:'big5',trNoSplit:1});trLight('255,200,120',e.x,e.y-e.r,44,.2)}
  if(crit&&trOn('crit',3,1)){const o=nearest(e.x,e.y,new Set([e]),150);if(o){fxPush({k:'bolt',x:e.x,y:e.y-e.r,x2:o.x,y2:o.y-o.r,t:.2,max:.2});TR.dep++;try{hurtE(o,P.atk*.5,false,true)}finally{TR.dep--}}}
  if(crit&&trOn('crit',5,1)&&Math.random()<.25)trPush({k:'star',x:e.x+rand(-10,10),y:e.y,t:.45,max:.45});
  if(trOn('light',3,0)&&P.light&&alive&&j%2===0)G.lc=(G.lc||0)+1}
// un colpo che fa cadere il nemico (il Colpo di grazia)
function _hurtKill(e){hurtE(e,e.hp+1,false,true)}
function trPoisonBurst(e){trAoe(e.x,e.y,55,1.4,{skip:e,f:o=>{o.poisonS=Math.min(4,(o.poisonS||0)+2);o.poisonT=Math.max(o.poisonT||0,3)}});
  vfxBlast(e.x,e.y-10,'150,230,80',60,{sparks:10,spcol:['#c8ff8a','#9be04a','#e8ffd0'],dust:0});trPush({k:'cloud',x:e.x,y:e.y,t:.7,max:.7,r:52,rgb:'140,220,70'});tone(180,90,.3,'sawtooth',.03)}
// --- le uccisioni: gemelle, fiamme, nubi, statue di ghiaccio, la sete, la mano calda, la festa
{const _ke=killE;killE=function(e,noLoot){if(!trRun()||!e||e.dead)return _ke.apply(this,arguments);
  const st={burn:e.burn>0,pois:e.poisonT>0&&e.poisonS>0,cold:e.slow>0||e.frozen>0,ar:TR.cur,hp0:P.hp,elite:!!e.elite};
  const r=_ke.apply(this,arguments);if(noLoot)return r;
  try{trOnKill(e,st)}catch(err){trErr(err)}return r}}
function trOnKill(e,st){const deep=TR.dep<3;
  if(st.ar&&st.ar.trG==='front'&&!st.ar.trNoSplit&&trOn('front',3,1)){const T=G.enemies.filter(o=>canHit(o)&&o!==e).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y)).slice(0,2);
    for(let i=0;i<2;i++){const o=T[i],a=o?Math.atan2(o.y-o.r-e.y,o.x-e.x):st.ar.a+(i?.5:-.5);trShot(e.x,e.y-6,a,.6,'twin',{trK:'twin'})}trN('twin');trLight('255,226,120',e.x,e.y-e.r,26,.14)}
  if(st.burn&&trOn('fire',3,1))for(const o of G.enemies)if(canHit(o)&&Math.hypot(o.x-e.x,o.y-e.y)<70+o.r)trBurn(o,2.5);
  if(st.burn&&trOn('fire',5,1)&&deep){trN('vamp_fire');trAoe(e.x,e.y,60,1,{skip:e,f:o=>trBurn(o,2.5)});vfxBlast(e.x,e.y-10,'255,140,50',64,{fire:10,sparks:12,dust:0});if(G.t-TR.shS>.1){TR.shS=G.t;sfx('boom',0,e.x)}}
  if(st.pois&&trOn('poison',3,1))trZone('pois',e.x,e.y,34,3);
  if(st.cold&&trOn('ice',5,1)&&deep){trN('statue');trAoe(e.x,e.y,62,.5,{skip:e,f:o=>{if(isBoss(o.type))o.slow=Math.max(o.slow||0,1.5);else o.frozen=Math.max(o.frozen||0,.8)}});
    for(let k=0;k<(LOWFX?4:9);k++){const a=k/9*TAU+rand(-.2,.2),s=rand(120,210);trPush({k:'ice',x:e.x,y:e.y-8,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.7,t:.42,max:.42,rot:rand(0,6)})}
    trLight('170,230,255',e.x,e.y-e.r,50,.18);if(G.t-TR.shS>.1){TR.shS=G.t;sfx('glass',0,e.x)}}
  if(P.vamp&&trOn('vamp',1)){   // la sete: la cura dei nemici sconfitti cresce; quella che avanza può diventare uno scudo
    const base=P.vamp*2;let mul=1+.5+(trOn('vamp',3,0)?.5:0)+(trOn('vamp',4)?.5:0);if(st.elite&&trOn('vamp',2))mul*=5;if(trOn('vamp',5,1)&&st.hp0<P.maxhp*.3)mul*=3;
    const tot=base*mul,extra=tot-base;if(extra>0)P.hp=Math.min(P.maxhp,P.hp+extra);
    if(trOn('vamp',3,1)){const over=Math.max(0,st.hp0+tot-P.maxhp);if(over>0)TR.soul=Math.min(P.maxhp*.2,TR.soul+over)}}
  if(trOn('vamp',5,0)&&++TR.feast>=10){TR.feast=0;trN('feast');const v=Math.round(P.maxhp*.2);P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-50,'Festa! +'+v,'#ff8fb0',15);vfxBlast(P.x,P.y-12,'255,120,160',60,{sparks:14,dust:0});sfx('heal')}
  if(trOn('aspd',3,1)){TR.hot=Math.min(3,TR.hot+1);TR.hotT=3}}
// --- le carte: i passi entrano subito dopo la scelta (dopo la rarità a sorpresa, che ricalcola le carte dei numeri)
{const _pk=pick;pick=function(i){const r=_pk.apply(this,arguments);try{if(trRun())trSync()}catch(err){trErr(err)}return r}}
// --- i nemici storditi dalla Scossa stanno fermi un attimo; la Crepa si spegne col tempo
{const _ue=updEnemy;updEnemy=function(e,dt){if(e.trVul>0)e.trVul-=dt;if(e.trStun>0){e.trStun-=dt;if(!isBoss(e.type)&&!(e.intro>0)){e.moving=false;return}}return _ue.apply(this,arguments)}}
// --- lo scatto: più lungo, più sicuro, doppio, con la ritirata, il fuoco e l'ombra
{const _da=dash;dash=function(){if(!trRun()||!started||paused)return _da.apply(this,arguments);
  const c0=P.dashCd,x0=P.x,y0=P.y;let extra=false;
  if(c0>0){if(!(TR.dch>0&&trOn('dash',5,0)))return _da.apply(this,arguments);P.dashCd=0;extra=true}
  const r=_da.apply(this,arguments);
  if(extra){P.dashCd=c0;TR.dch=0;trN('dash2');tone(700,1100,.1,'triangle',.03)}else if(c0<=0&&P.dashCd>0)TR.dch=trOn('dash',5,0)?1:0;else return r;
  try{if(trOn('dash',2))P.dashT=.2;if(trOn('dash',4))P.inv=Math.max(P.inv,.5);
    if(trOn('dash',5,1))trPush({k:'shadow',x:x0,y:y0,t:.55,max:.55});
    if(P.rear&&trOn('rear',3,1)){const a=Math.atan2(P.dvy,P.dvx)+Math.PI;for(const s of[-.25,0,.25])trShot(P.x,P.y-6,a+s,.7,'rear')}
    TR.dx=x0;TR.dy=y0}catch(err){trErr(err)}
  return r}}
// --- i colpi presi: schivata, corteccia, scudo d'anima, le parate dello scudo, il contrattacco
{const _hp=hurtP;hurtP=function(d){if(!trRun()||INTRO.on||P.inv>0||P.dashT>0||G.state==='dead')return _hp.apply(this,arguments);
  const parry=!!(P.shield&&P.shCd<=0);
  if(!parry){let dg=0;if(P.moving){if(trOn('boots',2))dg+=trOn('boots',4)?.1:.05;if(trOn('boots',5,0)&&TR.runT>2)dg+=.15}
    if(dg&&Math.random()<dg){trN('dodge');P.inv=.35;text(P.x,P.y-42,'SCHIVATO','#e8f4ff',14);trLight('230,245,255',P.x,P.y-10,30,.15);tone(900,1500,.08,'triangle',.03);return}
    let k=(trOn('hp',2)?.95:1)*(trOn('hp',4)?.95:1);
    if(TR.bark&&trOn('hp',5,1)){TR.bark=0;trN('bark');TR.t.bark=8;k*=.5;for(let i=0;i<(LOWFX?3:7);i++){const a=rand(0,TAU),s=rand(60,140);trPush({k:'bark',x:P.x,y:P.y-12,vx:Math.cos(a)*s,vy:Math.sin(a)*s-50,t:.5,max:.5,rot:rand(0,6)})}sfx('rock');text(P.x,P.y-56,'CORTECCIA','#d8b48a',13)}
    if(k!==1)d=Math.max(1,Math.round(d*k));
    if(TR.soul>=1){const a=Math.min(TR.soul,d);TR.soul-=a;d-=Math.round(a);if(d<=0){P.inv=.35;text(P.x,P.y-42,'PARATO','#d9a0ff',14);trLight('200,140,255',P.x,P.y-10,34,.16);tone(500,800,.1,'triangle',.03);return}}}
  const hp0=P.hp,cd0=P.shCd;const r=_hp.call(this,d);
  try{if(parry&&cd0<=0&&P.shCd>0)trParry();
    if(P.hp<hp0){TR.feast=0;if(trOn('rear',5,1)&&G.t-TR.cntT>.5&&G.state!=='dead'){TR.cntT=G.t;const o=nearest(P.x,P.y),a=o?Math.atan2(o.y-o.r-P.y,o.x-P.x):P.face;
      for(let i=-2;i<=2;i++)trShot(P.x,P.y-6,a+i*.16,.8,'x',{trK:'counter'});trLight('255,120,90',P.x,P.y-10,36,.16);sfx('bow')}}}catch(err){trErr(err)}
  return r}}
function trParry(){trN('parry');
  if(trOn('shield',5,0)&&!TR.sh2){TR.sh2=true;P.shCd=0}else{TR.sh2=false;P.shCd=Math.max(.5,P.shCd-(trOn('shield',1)?1:0)-(trOn('shield',3,0)?1.5:0))}
  if(trOn('shield',2)){trAoe(P.x,P.y,90,0,{kb:240});trPush({k:'ring',x:P.x,y:P.y,t:.35,max:.35,r:90,rgb:'150,230,120'})}
  if(trOn('shield',3,1)){const v=Math.round(P.maxhp*.05);P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-56,'+'+v,'#9fe06a',13)}
  if(trOn('shield',4))P.inv=Math.max(P.inv,.9);
  if(trOn('shield',5,1)){for(let i=0;i<8;i++)trShot(P.x,P.y-8,i*TAU/8,.8,'thorn8',{trK:'thorn8'});sfx('bow')}}
// --- a ogni passo del gioco
{const _up=update;update=function(dt){const on=trRun()&&started&&!paused;let pre=null;
  if(on)try{trQueue();trSync();pre=trPre()}catch(err){trErr(err)}
  const r=_up.apply(this,arguments);
  if(on&&G&&!G.ended&&pre)try{trPost(dt,pre)}catch(err){trErr(err)}
  return r}}
function trPre(){TR.hA=TR.hE=null;const live=[];for(const ar of G.arrows){if(!ar.trM)continue;if(ar.wb>0)ar._wb=ar.wb;if(ar.trEnd)live.push(ar)}
  return{live,h0:G.hearts.length,hp0:P.hp,px:P.x,py:P.y}}
function trPost(dt,pre){const play=G.state==='play',foes=play&&G.enemies.some(canHit);
  // le frecce: rimbalzi sui muri, frecce che cercano, boomerang, comete
  const now=new Set(G.arrows);
  for(const ar of G.arrows){if(!ar.trM)continue;
    if(ar._wb!=null&&ar.wb<ar._wb)trBounce(ar);ar._wb=null;
    if(ar.trHome&&!ar.trRet){const t=nearest(ar.x,ar.y,ar.hit,180);if(t){const da=angDiff(Math.atan2(ar.vy,ar.vx),Math.atan2(t.y-t.r-ar.y,t.x-ar.x)),v=Math.hypot(ar.vx,ar.vy),na=Math.atan2(ar.vy,ar.vx)+clamp(da,-ar.trHome*dt,ar.trHome*dt);ar.vx=Math.cos(na)*v;ar.vy=Math.sin(na)*v;ar.a=na}}
    if(ar.trBoom){ar.trBt=(ar.trBt||0)+dt;if(!ar.trRet&&ar.trBt>.42){ar.trRet=1;ar.hit.clear();ar.pierce=Math.max(ar.pierce,4)}
      if(ar.trRet){const dx=P.x-ar.x,dy=P.y-8-ar.y,d=Math.hypot(dx,dy),v=Math.max(420,Math.hypot(ar.vx,ar.vy));ar.vx=dx/d*v;ar.vy=dy/d*v;ar.a=Math.atan2(ar.vy,ar.vx);ar.life=Math.max(ar.life,.3);if(d<18||ar.trBt>1.9)ar.life=0}}
    if(ar.trComet){ar.trCd=(ar.trCd||0)+Math.hypot(ar.vx,ar.vy)*dt;if(ar.trCd>24){ar.trCd=0;trZone('fire',ar.x,ar.y+6,15,2)}}}
  for(const ar of pre.live)if(!now.has(ar))trArrowEnd(ar);
  // l'eco della raffica e le salve
  for(let i=TR.echo.length-1;i>=0;i--){const q=TR.echo[i];q.t-=dt;if(q.t>0)continue;TR.echo.splice(i,1);const tg=nearest(P.x,P.y);if(!tg||!play)continue;
    const keep=[G.gv,G.volN,CN.vol];TR.echoing=true;try{volley(Math.atan2(tg.y-P.y,tg.x-P.x))}finally{TR.echoing=false;G.gv=keep[0];G.volN=keep[1];CN.vol=keep[2]}}
  for(let i=TR.salvo.length-1;i>=0;i--){const q=TR.salvo[i];q.t-=dt;if(q.t>0)continue;TR.salvo.splice(i,1);const tg=nearest(P.x,P.y);if(!tg)continue;const a=Math.atan2(tg.y-tg.r-P.y,tg.x-P.x),nx=Math.cos(a+Math.PI/2),ny=Math.sin(a+Math.PI/2);
    for(const o of[-10,0,10])trShot(P.x+nx*o,P.y-6+ny*o,a,.8,'front');sfx('bow')}
  // i tempi delle mosse leggendarie
  const T=TR.t,tick=(k,first,per,f)=>{if(T[k]==null)T[k]=first;T[k]-=dt;if(T[k]<=0){if(f()===false)T[k]=.4;else T[k]=per}};
  if(foes){
    if(trOn('front',5,1))tick('salvo',3,6,()=>{TR.salvo.push({t:0},{t:.1},{t:.2});trLight('255,220,120',P.x,P.y-10,40,.2);tone(523,784,.25,'square',.03)});
    if(trOn('ice',5,0))tick('bliz',4,7,trBlizzard);
    if(trOn('light',5,0))tick('storm',3,6,trStorm);
    if(trOn('wallb',5,1)&&P.wb)tick('walls',2,4,trWalls);
    if(trOn('orbit',5,0)&&P.orbit>0&&!TR.orbOut)tick('crown',2.5,5,trCrown);
    if(trOn('light',5,1))tick('cloud',1.4,1.4,trCloudBolt)}
  if(trOn('crit',5,0)&&!TR.perf){T.perf=(T.perf==null?5:T.perf)-dt;if(T.perf<=0){TR.perf=1;tone(1568,2093,.12,'triangle',.025)}}
  if(trOn('aspd',5,1)&&play){T.gold=(T.gold==null?8:T.gold)-dt;if(T.gold<=0){T.gold=8;TR.goldT=2;trLight('255,214,90',P.x,P.y-12,50,.25);tone(784,1568,.3,'triangle',.04)}}
  if(trOn('hp',5,1)&&!TR.bark){T.bark=(T.bark==null?0:T.bark)-dt;if(T.bark<=0)TR.bark=1}
  if(TR.goldT>0)TR.goldT-=dt;if(TR.hotT>0){TR.hotT-=dt;if(TR.hotT<=0)TR.hot=0}if(TR.fizT>0)TR.fizT-=dt;
  // le lame tornano
  if(TR.orbOut){TR.orbT-=dt;if(TR.orbT<=0||!G.arrows.some(a=>a.trCrown)){P.orbit+=TR.orbOut;TR.orbOut=0}}
  // velocità che cambiano per un po': mano calda, frenesia, raffica d'oro; corsa del vento, pozione frizzante
  {const f=(1+.1*(trOn('aspd',3,1)?TR.hot:0))*(trOn('aspd',5,0)&&P.hp<P.maxhp*.5?1.5:1)*(TR.goldT>0?2:1);if(f!==TR.fac.aspd){P.aspd*=f/TR.fac.aspd;TR.fac.aspd=f}}
  if(P.moving&&G.state!=='dead'){TR.runT+=dt;TR.runT2+=dt}else{TR.runT=Math.max(0,TR.runT-dt*3);TR.runT2=0}
  {const f=(trOn('boots',5,0)&&TR.runT>2?1.3:1)*(TR.fizT>0?1.25:1);if(f!==TR.fac.spd){P.spd=(P.spd||150)*f/TR.fac.spd;TR.fac.spd=f}}
  if(trOn('boots',5,1)&&foes&&TR.runT2>=3){TR.runT2=0;trThunderSteps()}
  // scie: il fuoco dello scatto, il vento della corsa
  if(P.dashT>0&&trOn('dash',3,1)){const d=Math.hypot(P.x-TR.dx,P.y-TR.dy);if(d>14){TR.dx=P.x;TR.dy=P.y;trZone('fire',P.x,P.y+4,14,1.8)}}
  if(P.moving&&trOn('boots',3,1)){TR.wind+=Math.hypot(P.x-pre.px,P.y-pre.py);if(TR.wind>22){TR.wind=0;trZone('wind',P.x,P.y+4,19,1.5)}}
  // il corpo: linfa, cuore del bosco, pozione di scorta, erbe buone, lo scudo che torna doppio
  if(G.state!=='dead'&&P.hp>0){
    if(trOn('hp',3,1)&&P.hp<P.maxhp)P.hp=Math.min(P.maxhp,P.hp+P.maxhp*.006*dt);
    if(trOn('hp',5,0)&&P.hp<P.maxhp*.3&&TR.hpRoom!==TR.roomN){TR.hpRoom=TR.roomN;trN('heart');const v=Math.round(P.maxhp*.4);P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-50,'Cuore del bosco +'+v,'#9fe06a',14);
      vfxBlast(P.x,P.y-14,'150,230,120',70,{sparks:16,spcol:PAL.leaf,debris:'leaf',n:8,dust:0});sfx('heal');tone(392,784,.4,'triangle',.04)}
    if(trOn('heal',3,1)&&!TR.scorta&&P.hp<P.maxhp*.2){TR.scorta=true;const v=Math.round(P.maxhp*.35);P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-50,'Pozione di scorta! +'+v,'#ff9ec4',14);trPotion();trLight('255,160,210',P.x,P.y-12,44,.2);sfx('heal')}
    if(trOn('heal',4)&&G.hearts.length<pre.h0&&P.hp>pre.hp0){const v=Math.round((P.hp-pre.hp0)*.25);if(v>0)P.hp=Math.min(P.maxhp,P.hp+v)}}
  if(trOn('shield',5,0)&&P.shield&&P.shCd>0&&TR.sh2&&P.shCd>.6)TR.sh2=false;
  // il mondo intorno: aria gelida, contagio, terra in fiamme, scudo di lame
  if(play){
    if(trOn('ice',4))for(const e of G.enemies)if(canHit(e)&&Math.hypot(e.x-P.x,e.y-P.y)<70+e.r)e.slow=Math.max(e.slow||0,.25);
    if(trOn('poison',5,0)){T.cont=(T.cont==null?1:T.cont)-dt;if(T.cont<=0){T.cont=1;trContagion()}}
    if(trOn('fire',5,0))for(const e of G.enemies)if(e.burn>0&&canHit(e)){e.trFl=(e.trFl||0)-dt;if(e.trFl<=0){e.trFl=.6;trZone('fire',e.x,e.y+3,16,2)}}
    if(trOn('orbit',5,1)&&P.orbit>0&&G.eproj.length)trBladeShield()}
  // le lucciole guardiane e la nuvola amica
  if(trOn('side',5,1)){const W=TR.wisp||(TR.wisp={p:[{x:P.x,y:P.y},{x:P.x,y:P.y}]});W.p.forEach((w,i)=>{const s=i?1:-1,a=P.face+s*Math.PI/2,tx=P.x+Math.cos(a)*24,ty=P.y-26+Math.sin(G.t*3+i*2)*4+Math.sin(a)*8,k=Math.min(1,dt*10);w.x+=(tx-w.x)*k;w.y+=(ty-w.y)*k})}else TR.wisp=null;
  if(trOn('light',5,1)){const C=TR.cloud||(TR.cloud={x:P.x,y:P.y-80,f:0});const k=Math.min(1,dt*4);C.x+=(P.x-C.x)*k;C.y+=(P.y-82-C.y)*k;if(C.f>0)C.f-=dt}else TR.cloud=null;
  // le zone a terra e gli effetti
  trZones(dt);trFxStep(dt)}
// la freccia che tocca il muro: Sponda forte, viva, di scintille, Biliardo
function trBounce(ar){ar.trW=(ar.trW||0)+1;
  if(trOn('wallb',2)){const t=nearest(ar.x,ar.y,null,600);if(t){const v=Math.hypot(ar.vx,ar.vy),a=Math.atan2(t.y-t.r-ar.y,t.x-ar.x);ar.vx=Math.cos(a)*v;ar.vy=Math.sin(a)*v;ar.a=a}}
  if(trOn('wallb',3,1)){trAoe(ar.x,ar.y,36,.4);trLight('255,230,170',ar.x,ar.y,24,.14);if(!LOWFX)for(let i=0;i<4;i++)fxPush({k:'streak',x:ar.x,y:ar.y,vx:rand(-120,120),vy:rand(-120,120),t:.2,max:.2,col:'#ffe9b0',w:1.6})}
  if(trOn('wallb',5,0)&&!ar.trNoSplit&&!ar.trSplitW){ar.trSplitW=1;const a=Math.atan2(ar.vy,ar.vx)+(Math.random()<.5?.35:-.35);trShot(ar.x,ar.y,a,ar.m,'x',{wb:0,trSplitW:1,trW:1,pierce:ar.pierce,ric:0})}}
// la freccia che sparisce: spine a terra, la freccia gigante che scoppia
function trArrowEnd(ar){if(ar.trEnd==='thorn')trZone('thorn',ar.x,ar.y+4,20,3);
  else if(ar.trEnd==='gboom'){trAoe(ar.x,ar.y,70,1.4);vfxBlast(ar.x,ar.y,'255,190,110',72,{fire:6,sparks:16,debris:'stone',n:6});sfx('boom',0,ar.x);shake(3)}}
function trBlizzard(){const T=G.enemies.filter(canHit);if(!T.length)return false;trN('bliz');TR.dep++;try{for(const e of T){hurtE(e,P.atk*.6,false,true);if(!e.dead)e.slow=Math.max(e.slow||0,3)}}finally{TR.dep--}
  for(let i=0;i<(LOWFX?24:70);i++)trPush({k:'snow',x:rand(L-40,R),y:rand(TOP-60,BOT),vx:rand(160,260),vy:rand(60,120),t:rand(.6,1.1),max:1.1,r:rand(1.2,2.8)});
  trLight('220,240,255',(L+R)/2,(TOP+BOT)/2,260,.3);sfx('glass');tone(300,120,.8,'sine',.04);shake(2)}
function trStorm(){const T=G.enemies.filter(canHit).sort(()=>Math.random()-.5).slice(0,5);if(!T.length)return false;
  T.forEach((e,i)=>trPush({k:'zap',e,t:.01+i*.09,max:.1}));sfx('thunder');shake(3)}
function trBolt(x,y,e,k){trN('bolt');fxPush({k:'bolt',x,y,x2:e.x,y2:e.y-e.r,t:.25,max:.25});trLight('170,220,255',e.x,e.y-e.r,40,.18);TR.inL=1;TR.dep++;try{hurtE(e,P.atk*k,false,true)}finally{TR.inL=0;TR.dep--}}
function trCloudBolt(){const C=TR.cloud;if(!C)return false;const e=nearest(C.x,C.y+80,null,260);if(!e)return false;C.f=.25;trBolt(C.x,C.y+8,e,.8);if(G.t-TR.shS>.25){TR.shS=G.t;sfx('thunder',0,e.x)}}
function trWalls(){const T=G.enemies.filter(canHit);if(!T.length)return false;for(let i=0;i<6;i++){const e=pk(T),s=randi(0,3),x=s===0?L+4:s===1?R-4:rand(L+20,R-20),y=s===2?TOP+4:s===3?BOT-4:rand(TOP+20,BOT-20);
  trShot(x,y,Math.atan2(e.y-e.r-y,e.x-x),.7,'wall',{trK:'wall',wb:0,ric:0});if(!LOWFX)fxPush({k:'puff',x,y,vx:0,vy:-10,t:.4,r:6})}sfx('rock')}
function trCrown(){const n=P.orbit,R0=P.storm?60:44;let k=0;for(let i=0;i<n;i++){const a=G.t*3.6+i*TAU/n,bx=P.x+Math.cos(a)*R0,by=P.y-6+Math.sin(a)*R0,t=nearest(bx,by,null,320);
    const ar=trShot(bx,by,t?Math.atan2(t.y-t.r-by,t.x-bx):a,1,'x',{blade:true,trBoom:1,trCrown:1,pierce:5,ric:0,wb:0,life:2});if(ar)k++}
  if(!k)return false;trN('crown');TR.orbOut=n;P.orbit=0;TR.orbT=2.2;sfx('dash');tone(660,330,.2,'square',.03)}
function trBladeShield(){const n=P.orbit,R0=P.storm?60:44;for(let i=0;i<n;i++){const a=G.t*3.6+i*TAU/n,bx=P.x+Math.cos(a)*R0,by=P.y-6+Math.sin(a)*R0;
  for(let j=G.eproj.length-1;j>=0;j--){const q=G.eproj[j];if(Math.hypot(q.x-bx,q.y-by)<(q.r||5)+9){G.eproj.splice(j,1);trN('bshield');G.fx.push({k:'spark',x:q.x,y:q.y,t:.2});if(G.t-TR.shS>.15){TR.shS=G.t;tone(1200,800,.06,'square',.02)}}}}}
function trContagion(){for(const e of G.enemies){if(!canHit(e)||!(e.poisonT>0&&e.poisonS>0))continue;let b=null,bd=70;for(const o of G.enemies){if(o===e||!canHit(o)||o.poisonT>0)continue;const d=Math.hypot(o.x-e.x,o.y-e.y)-o.r;if(d<bd){bd=d;b=o}}
  if(b){trN('cont');b.poisonS=Math.max(b.poisonS||0,1);b.poisonT=3;trPush({k:'drop',x:e.x,y:e.y-e.r,x2:b.x,y2:b.y-b.r,t:.35,max:.35})}}}
function trThunderSteps(){trN('thsteps');const n=trAoe(P.x,P.y,90,1);for(const e of G.enemies)if(canHit(e)&&Math.hypot(e.x-P.x,e.y-P.y)<90+e.r)fxPush({k:'bolt',x:e.x,y:e.y-200,x2:e.x,y2:e.y-e.r,t:.22,max:.22});
  trPush({k:'ring',x:P.x,y:P.y,t:.4,max:.4,r:90,rgb:'170,220,255'});if(n||!LOWFX)sfx('thunder',0,P.x);shake(2)}
// le zone a terra (fuoco, spine, nubi velenose, vento, il cerchio della vita)
function trZones(dt){for(let i=TR.z.length-1;i>=0;i--){const z=TR.z[i];z.t-=dt;if(z.t<=0){TR.z.splice(i,1);continue}
  if(z.k==='life'){if(Math.hypot(P.x-z.x,P.y-z.y)<z.r&&P.hp>0&&G.state!=='dead')P.hp=Math.min(P.maxhp,P.hp+P.maxhp*.03*dt);continue}
  z.tick-=dt;if(z.tick>0)continue;z.tick=.5;
  for(const e of G.enemies){if(!canHit(e)||Math.hypot(e.x-z.x,e.y-z.y)>z.r+e.r*.6)continue;
    if(z.k==='fire')trBurn(e,1.5);else if(z.k==='wind')e.slow=Math.max(e.slow||0,.6);
    else if(z.k==='pois'){e.poisonS=Math.min(trOn('poison',3,0)?6:4,(e.poisonS||0)+1);e.poisonT=Math.max(e.poisonT||0,3)}
    else if(z.k==='thorn'){TR.dep++;try{hurtE(e,P.atk*.25,false,true)}finally{TR.dep--}}}}}
// gli effetti dei passi che si muovono e fanno qualcosa quando finiscono (frecce dal cielo, stelle cadenti, l'ombra che scoppia)
function trFxStep(dt){for(let i=TR.fx.length-1;i>=0;i--){const f=TR.fx[i];f.t-=dt;if(f.vx!=null){f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.k==='bark'){f.vy+=380*dt}}
  if(f.t>0)continue;TR.fx.splice(i,1);
  if(f.k==='sky'){trN('skyHit');trAoe(f.x,f.y,24,.45);if(!LOWFX)fxPush({k:'puff',x:f.x,y:f.y,vx:0,vy:-8,t:.3,r:5})}
  else if(f.k==='star'){trN('star');trAoe(f.x,f.y,55,1);vfxBlast(f.x,f.y-6,'255,236,150',56,{sparks:14,spcol:['#fff6c0','#ffe27a','#ffffff'],dust:0});tone(1046,1568,.15,'triangle',.03)}
  else if(f.k==='zap'){if(!f.e.dead&&canHit(f.e))trBolt(f.e.x,f.e.y-260,f.e,1)}
  else if(f.k==='shadow'){trN('shadow');trAoe(f.x,f.y,65,1.2);vfxBlast(f.x,f.y-10,'170,110,255',66,{sparks:14,spcol:['#d9b8ff','#9a6aff','#ffffff'],dust:0});sfx('boom',0,f.x)}}}

// ---------------------------------------------------------------- 3 come si vedono in battaglia
const trRgb=h=>{const n=parseInt(h.slice(1),16);return`${n>>16&255},${n>>8&255},${n&255}`};
// a terra, sotto i nemici: fuoco, spine, nubi velenose, vento, il cerchio della vita, il bersaglio delle frecce dal cielo, l'ombra che sta per scoppiare
function trDrawGround(){const t=G.t;
  for(const z of TR.z){const a=Math.min(1,z.t*2,(z.max-z.t)*6),r=z.r;
    if(z.k==='fire'){if(!LOWFX)glow('255,130,50',z.x,z.y,r*1.7,.22*a);ctx.fillStyle=`rgba(80,26,8,${.35*a})`;ell(z.x,z.y,r,r*.45);ctx.fill();
      if(OB3&&OB3.on&&!LOWFX&&typeof flame==='function'){flame(z.x,z.y+1,.3*a,O3FIRE,z.s)}
      else for(let i=0;i<3;i++){const ph=t*7+i*2.1+z.s,hx=z.x+(i-1)*r*.45,hh=(5+3*Math.sin(ph))*a;ctx.fillStyle=i%2?'#ffc93c':'#ff8a3c';ctx.beginPath();ctx.moveTo(hx-3,z.y);ctx.quadraticCurveTo(hx+Math.sin(ph)*2,z.y-hh*1.7,hx+3,z.y);ctx.fill()}}
    else if(z.k==='thorn'){ctx.save();ctx.globalAlpha=a;for(let i=0;i<5;i++){const an=z.s+i*1.26,d=r*(.25+.5*((i*37)%10)/10),x=z.x+Math.cos(an)*d,y=z.y+Math.sin(an)*d*.45,h=7+((i*13)%4);
      ink(1.4);ctx.fillStyle=i%2?'#7bbf4a':'#5f9e3c';ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x+.5,y-h);ctx.lineTo(x+3,y);ctx.closePath();ctx.fill();ctx.stroke()}ctx.restore()}
    else if(z.k==='pois'){if(!LOWFX)glow('150,230,70',z.x,z.y,r*1.4,.2*a);ctx.fillStyle=`rgba(110,190,50,${.3*a})`;ell(z.x,z.y,r,r*.5);ctx.fill();ctx.strokeStyle=`rgba(200,255,140,${.35*a})`;ctx.lineWidth=1.5;ell(z.x,z.y,r,r*.5);ctx.stroke();
      if(!LOWFX)for(let i=0;i<3;i++){const p=(t*.8+i/3+z.s)%1,bx=z.x+Math.cos(z.s+i*2.1)*r*.5,by=z.y+Math.sin(z.s+i*2.1)*r*.22-p*14;ctx.fillStyle=`rgba(200,255,140,${(1-p)*.7*a})`;circ(bx,by,2+p*2);ctx.fill()}}
    else if(z.k==='wind'){ctx.save();ctx.globalAlpha=.55*a;ctx.strokeStyle='#e8f4ff';ctx.lineWidth=1.6;for(let i=0;i<2;i++){const an=t*6+i*Math.PI+z.s;ctx.beginPath();ctx.ellipse(z.x,z.y,r*(.5+.25*i),r*(.22+.1*i),0,an,an+2.2);ctx.stroke()}ctx.restore()}
    else if(z.k==='life'){const p=.5+.5*Math.sin(t*4);if(!LOWFX)glow('150,255,170',z.x,z.y,r*1.6,.22*a);ctx.save();ctx.globalAlpha=a;ctx.fillStyle=`rgba(120,230,140,${.14+.06*p})`;ell(z.x,z.y,r,r*.5);ctx.fill();
      ctx.strokeStyle='#bfffcf';ctx.lineWidth=2;ell(z.x,z.y,r,r*.5);ctx.stroke();ctx.lineWidth=1.2;ell(z.x,z.y,r*.72,r*.36);ctx.stroke();
      for(let i=0;i<8;i++){const an=t*.8+i*TAU/8,x=z.x+Math.cos(an)*r*.86,y=z.y+Math.sin(an)*r*.43;ctx.fillStyle='#eaffef';ctx.beginPath();ctx.moveTo(x,y-3);ctx.lineTo(x+2,y);ctx.lineTo(x,y+3);ctx.lineTo(x-2,y);ctx.closePath();ctx.fill()}ctx.restore()}}
  for(const f of TR.fx){const p=1-f.t/f.max;
    if(f.k==='sky'){ctx.strokeStyle=`rgba(255,240,200,${.35+.5*p})`;ctx.lineWidth=1.6;ctx.setLineDash([3,3]);ell(f.x,f.y,12*(1-p*.5),5*(1-p*.5));ctx.stroke();ctx.setLineDash([])}
    else if(f.k==='star'){ctx.strokeStyle=`rgba(255,236,150,${.3+.5*p})`;ctx.lineWidth=2;ell(f.x,f.y,30*(1-p*.4),13*(1-p*.4));ctx.stroke()}
    else if(f.k==='shadow'){const s=.6+.4*p,bl=Math.sin(t*(12+p*30))>0;if(!LOWFX)glow('150,90,255',f.x,f.y-10,40*s,.35+.3*p);ctx.fillStyle='rgba(40,20,70,.55)';ell(f.x,f.y+2,14*s,6*s);ctx.fill();
      ctx.save();ctx.globalAlpha=.75;ctx.fillStyle=bl?'#3a2268':'#24123f';ctx.beginPath();ctx.ellipse(f.x,f.y-11,8*s,12*s,0,0,TAU);ctx.fill();ctx.fillStyle='#d9b8ff';circ(f.x-2.5*s,f.y-14*s,1.4);ctx.fill();circ(f.x+2.5*s,f.y-14*s,1.4);ctx.fill();ctx.restore();
      ctx.strokeStyle=`rgba(200,160,255,${.4+.4*p})`;ctx.lineWidth=1.6;ctx.setLineDash([5,4]);ell(f.x,f.y+2,65*(.35+.65*p),28*(.35+.65*p));ctx.stroke();ctx.setLineDash([])}}}
// in aria: frecce dal cielo, stelle cadenti, schegge, corteccia, nubi, gocce del contagio, anelli, neve; le lucciole e la nuvola; le luci sull'eroe
function trDrawAir(){const t=G.t;
  for(const f of TR.fx){const p=1-f.t/f.max;
    if(f.k==='sky'){const h=130*(1-p),x=f.x,y=f.y-h;ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/2);ink(2.2);ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(6,0);ctx.stroke();ctx.strokeStyle='#d9b27a';ctx.lineWidth=1.3;ctx.stroke();
      ctx.fillStyle='#e8ecf0';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(4,-3.4);ctx.lineTo(4,3.4);ctx.closePath();ink(1.2);ctx.fill();ctx.stroke();ctx.restore();if(!LOWFX)glow('255,240,200',x,y,10,.35)}
    else if(f.k==='star'){const sx=f.x+70*(1-p),sy=f.y-190*(1-p);if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,230,140,.55)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+26,sy-70);ctx.stroke();ctx.restore();glow('255,236,150',sx,sy,22,.7)}
      trStar(sx,sy,7,t*6,'#fff3b0')}
    else if(f.k==='ice'){const a=f.t/f.max;ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.rot+p*6);ctx.globalAlpha=a;ink(1.2);ctx.fillStyle='#dff4ff';ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(2.4,0);ctx.lineTo(0,5);ctx.lineTo(-2.4,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
    else if(f.k==='bark'){const a=f.t/f.max;ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.rot+p*8);ctx.globalAlpha=a;ink(1.2);ctx.fillStyle='#8a5a32';ctx.beginPath();ctx.moveTo(-4,-3);ctx.lineTo(4,-2);ctx.lineTo(3,3);ctx.lineTo(-3,2);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
    else if(f.k==='cloud'){const r=f.r*(.5+.6*p);ctx.fillStyle=`rgba(${f.rgb},${.32*(1-p)})`;ell(f.x,f.y-6,r,r*.55);ctx.fill()}
    else if(f.k==='drop'){const x=plerp(f.x,f.x2,p),y=plerp(f.y,f.y2,p)-Math.sin(p*Math.PI)*22;ctx.fillStyle='#9be04a';ink(1.2);circ(x,y,2.6);ctx.fill();ctx.stroke()}
    else if(f.k==='ring'){ctx.strokeStyle=`rgba(${f.rgb},${.8*(1-p)})`;ctx.lineWidth=4*(1-p)+1;ell(f.x,f.y,f.r*(.2+.8*p),f.r*(.2+.8*p)*.5);ctx.stroke()}
    else if(f.k==='snow'){ctx.fillStyle=`rgba(240,250,255,${Math.min(1,f.t*3)*.85})`;circ(f.x,f.y,f.r);ctx.fill()}}
  const W=TR.wisp;if(W)for(const w of W.p){const fl=Math.sin(t*22+w.x)*.5+.5;if(!LOWFX)glow('220,255,150',w.x,w.y,16,.55);
    ctx.save();ctx.translate(w.x,w.y);ctx.fillStyle='rgba(235,255,210,.8)';ctx.strokeStyle=INK;ctx.lineWidth=1.1;for(const s of[-1,1]){ctx.beginPath();ctx.ellipse(s*4.5,-2,4,2+fl*1.4,s*.6,0,TAU);ctx.fill();ctx.stroke()}
      ink(1.4);ctx.fillStyle='#f6ffd0';circ(0,0,3.6);ctx.fill();ctx.stroke();ctx.fillStyle='#ffffff';circ(-1,-1,1.2);ctx.fill();ctx.restore()}
  const C=TR.cloud;if(C){const x=C.x,y=C.y+Math.sin(t*2)*3,fl=C.f>0;if(fl&&!LOWFX)glow('190,225,255',x,y,46,.6);
    ctx.save();ink(2);const B=[[-14,2,9],[-4,-4,11],[8,-1,10],[16,4,7],[0,5,10]];ctx.fillStyle=fl?'#8a93a6':'#4b5161';for(const b of B){circ(x+b[0],y+b[1],b[2]);ctx.fill()}
      ctx.beginPath();for(const b of B)ctx.arc(x+b[0],y+b[1],b[2],0,TAU);ctx.stroke();for(const b of B){ctx.fillStyle=fl?'#aab3c6':'#5d6475';circ(x+b[0],y+b[1],b[2]-1.6);ctx.fill()}
      ctx.fillStyle=fl?'#c9d2e4':'#727a8c';for(const b of B.slice(1,3)){circ(x+b[0]-2,y+b[1]-3,b[2]*.55);ctx.fill()}ctx.restore()}
  // sull'eroe: lo scudo doppio, la corteccia pronta, lo scudo d'anima, la raffica d'oro, il colpo perfetto pronto
  if(G.state==='dead')return;const hx=P.x,hy=P.y;
  if(P.shield&&P.shCd<=0&&trOn('shield',5,0)&&!TR.sh2){const pu=.5+.5*Math.sin(t*3+1);ctx.strokeStyle=`rgba(190,255,150,${.3+.2*pu})`;ctx.lineWidth=1.6;ell(hx,hy-10,25,28);ctx.stroke()}
  if(TR.bark&&trOn('hp',5,1)){ctx.save();ctx.globalAlpha=.75;ink(1.2);for(let i=0;i<5;i++){const an=t*.6+i*TAU/5,x=hx+Math.cos(an)*15,y=hy+2+Math.sin(an)*6;ctx.fillStyle=i%2?'#8a5a32':'#a87444';ctx.beginPath();ctx.ellipse(x,y,4,2.4,an,0,TAU);ctx.fill();ctx.stroke()}ctx.restore()}
  if(TR.soul>=1&&!LOWFX)glow('190,130,255',hx,hy-12,22+18*TR.soul/(P.maxhp*.2),.3+.2*Math.sin(t*4));
  if(TR.goldT>0){if(!LOWFX)glow('255,214,90',hx,hy-12,34,.4+.2*Math.sin(t*20));if(Math.random()<.4)fxPush({k:'lvl',x:hx+rand(-12,12),y:hy-rand(0,30),vx:0,vy:-30,t:.4,gold:1})}
  if(TR.perf&&trOn('crit',5,0)){const s=4+1.5*Math.sin(t*8);trStar(hx+Math.cos(P.face)*12,hy-24,s,t*2,'#fff3b0');if(!LOWFX)glow('255,236,160',hx+Math.cos(P.face)*12,hy-24,12,.5)}}
function trStar(x,y,r,rot,col){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle=col;ctx.beginPath();for(let i=0;i<8;i++){const rr=i%2?r*.38:r,an=i*Math.PI/4;ctx.lineTo(Math.cos(an)*rr,Math.sin(an)*rr)}ctx.closePath();ctx.fill();ctx.restore()}
{const _do=drawOrbs;drawOrbs=function(){if(TR.on&&G&&P&&(TR.z.length||TR.fx.length))try{trDrawGround()}catch(err){trErr(err)}return _do.apply(this,arguments)}}
{const _db=drawBoulders;drawBoulders=function(){const r=_db.apply(this,arguments);if(TR.on&&G&&P&&trRun())try{trDrawAir()}catch(err){trErr(err)}return r}}
// le frecce dei passi
{const _da=drawArrow;drawArrow=function(a){if(!a||!a.trK||!TR.on)return _da.apply(this,arguments);try{const K=a.trK;
  if(K==='echo'||K==='twin'||K==='big5'||K==='star8'||K==='counter'||K==='titan'){
    if(!LOWFX){const c=K==='echo'?'190,230,255':K==='counter'?'255,110,80':K==='titan'?'255,190,110':'255,226,120';glow(c,a.x,a.y,K==='titan'?40:14,K==='echo'?.5:.35)}
    ctx.save();if(K==='echo')ctx.globalAlpha*=.6;const s=K==='big5'?1.35:K==='titan'?2.6:K==='twin'?.85:1;if(s!==1){ctx.translate(a.x,a.y);ctx.scale(s,s);ctx.translate(-a.x,-a.y)}_da.call(this,a);ctx.restore();return}
  if(a.tr)drawTrail(a,K==='lance'?'255,240,190':K==='comet'?'255,140,60':K==='wisp'?'220,255,170':K==='boom'?'255,230,150':'246,234,210',K==='lance'?5:K==='comet'?7:2.6);
  ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.a);
  if(K==='lance'){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,230,150',0,0,26,.55);ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(10,0);ctx.stroke();
    ctx.strokeStyle='#fff3c4';ctx.lineWidth=2.6;ctx.stroke();ctx.fillStyle='#ffe27a';ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(7,-5);ctx.lineTo(9,0);ctx.lineTo(7,5);ctx.closePath();ink(1.4);ctx.fill();ctx.stroke();
    ctx.fillStyle='#fffbe6';ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(9,-2);ctx.lineTo(9,2);ctx.closePath();ctx.fill()}
  else if(K==='boom'){ctx.rotate(G.t*18);ink(1.8);ctx.fillStyle='#ffd86b';ctx.beginPath();ctx.moveTo(-10,-6);ctx.quadraticCurveTo(0,-1,10,-6);ctx.quadraticCurveTo(4,2,0,8);ctx.quadraticCurveTo(-4,2,-10,-6);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#fff6c8';circ(0,0,1.8);ctx.fill()}
  else if(K==='comet'){if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,140,50',0,0,22,.6);ctx.restore()}ink(1.6);ctx.fillStyle='#ff8a2e';ctx.beginPath();ctx.moveTo(9,0);ctx.quadraticCurveTo(2,-7,-14,0);ctx.quadraticCurveTo(2,7,9,0);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#ffe28a';circ(3,0,4);ctx.fill();ctx.fillStyle='#fff8e0';circ(4,0,1.8);ctx.fill();if(!LOWFX&&Math.random()<.5)fxPush({k:'firep',x:a.x,y:a.y,vx:rand(-15,15),vy:rand(-40,-10),t:.3,max:.3,r:rand(3,5)})}
  else if(K==='shard'){ink(1.2);ctx.fillStyle='#d8ff8a';ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(0,-2.6);ctx.lineTo(-5,0);ctx.lineTo(0,2.6);ctx.closePath();ctx.fill();ctx.stroke()}
  else if(K==='thorn8'){ink(1.4);ctx.fillStyle='#7bbf4a';ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(-2,-2.6);ctx.lineTo(-7,0);ctx.lineTo(-2,2.6);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#c8f09a';ctx.fillRect(-4,-.6,9,1.2)}
  else if(K==='wisp'){if(!LOWFX)glow('220,255,160',0,0,12,.6);ctx.strokeStyle='#f6ffd0';ctx.lineWidth=2.4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(5,0);ctx.stroke();ctx.fillStyle='#ffffff';circ(6,0,2);ctx.fill()}
  else if(K==='wall'){ink(1.4);ctx.fillStyle='#a49a88';ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(1,-3.5);ctx.lineTo(-7,-2);ctx.lineTo(-7,2);ctx.lineTo(1,3.5);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(-4,-1.6,8,1.2)}
  else{ctx.restore();return _da.apply(this,arguments)}
  ctx.restore()}catch(err){trErr(err);return _da.apply(this,arguments)}}}

// ---------------------------------------------------------------- 4 il menu: l'Albero delle Abilità
// in alto le abilità in una striscia; sotto, l'albero di quella scelta che scende: la radice (l'abilità) nel suo cerchio di rune, i passi
// I e II, il bivio III, il passo IV e il bivio finale con le due mosse leggendarie, legati da fili di luce. Sotto, il riquadro del passo
// toccato col bottone per sbloccarlo (oro) o per cambiare ramo (gratis). Si apre dal bottone «Abilità» della schermata delle isole.
const TR_GLY={dmg:'<path d="M6 18L16.5 7.5M14 5l5-1-1 5M5 13l6 6M4.5 19.5l2-2"/>',spd:'<path d="M3 8h9M3 12h13M3 16h9M15 6.5l5 5.5-5 5.5"/>',more:'<path d="M12 5v14M5 12h14"/>',
  fx:'<path d="M12 3.5l1.9 6.6 6.6 1.9-6.6 1.9-1.9 6.6-1.9-6.6-6.6-1.9 6.6-1.9z"/>',def:'<path d="M12 3.5l7 2.8v5c0 4.6-3 7.6-7 9.4-4-1.8-7-4.8-7-9.4v-5z"/>',
  heal:'<path d="M5.5 18.5c0-7.5 5.5-13 13-13 0 7.5-5.5 13-13 13zM5.5 18.5l7.5-7.5"/>',time:'<path d="M7 4h10M7 20h10M8.2 4c0 4.6 7.6 4.9 7.6 8s-7.6 3.4-7.6 8M15.8 4c0 4.6-7.6 4.9-7.6 8s7.6 3.4 7.6 8"/>',
  aoe:'<circle cx="12" cy="12" r="3.6"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  star:'<path d="M12 3.2l2.6 5.7 6.2.7-4.6 4.2 1.3 6.1L12 16.8 6.5 19.9l1.3-6.1-4.6-4.2 6.2-.7z"/>'};
const TR_ICO='<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="#2a1f4a" stroke="#1b1612" stroke-width="2.5"/><circle cx="20" cy="20" r="12.5" fill="none" stroke="#b9a4ff" stroke-width="1.2" stroke-dasharray="2 3" opacity=".8"/>'+
  '<path d="M20 30V17M20 21l-6-5M20 19l6-6M20 24l5-3M20 30l-5 4M20 30l5 4M20 30v4" fill="none" stroke="#1b1612" stroke-width="4" stroke-linecap="round"/><path d="M20 30V17M20 21l-6-5M20 19l6-6M20 24l5-3M20 30l-5 4M20 30l5 4M20 30v4" fill="none" stroke="#ffd86b" stroke-width="2" stroke-linecap="round"/>'+
  '<circle cx="14" cy="16" r="2.6" fill="#9fe6ff" stroke="#1b1612" stroke-width="1.4"/><circle cx="26" cy="13" r="2.6" fill="#ff9ec4" stroke="#1b1612" stroke-width="1.4"/><circle cx="20" cy="15" r="2.8" fill="#fff3b0" stroke="#1b1612" stroke-width="1.4"/><circle cx="25" cy="21" r="2.2" fill="#9be04a" stroke="#1b1612" stroke-width="1.3"/></svg>';
const trDark=(h,k)=>{const n=parseInt(h.slice(1),16),f=c=>Math.round(c*k);return`rgb(${f(n>>16&255)},${f(n>>8&255)},${f(n&255)})`};
const trFmt=n=>n.toLocaleString('it-IT');
function trCss(){if($('trCss'))return;const st=document.createElement('style');st.id='trCss';st.textContent=`
#trScr{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;overflow:hidden;color:#efe9ff;font-family:var(--body);
  background:radial-gradient(120% 70% at 50% 18%,#2b2056 0%,#171233 45%,#0b0a1c 100%);--c:#ffd24a;--cd:#7a5a10}
#trScr::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.55;background:
  radial-gradient(1px 1px at 12% 18%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 78% 9%,#fff 50%,transparent 51%),radial-gradient(1.5px 1.5px at 33% 72%,#d8ccff 50%,transparent 51%),
  radial-gradient(1px 1px at 88% 58%,#fff 50%,transparent 51%),radial-gradient(1.4px 1.4px at 61% 33%,#ffe9b0 50%,transparent 51%),radial-gradient(1px 1px at 22% 48%,#fff 50%,transparent 51%),
  radial-gradient(1px 1px at 50% 90%,#cfe6ff 50%,transparent 51%),radial-gradient(1.2px 1.2px at 92% 84%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 6% 82%,#fff 50%,transparent 51%)}
#trScr .trHd{position:relative;display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top,0px)) 14px 4px}
#trScr .trX{width:40px;height:40px;flex:none;border-radius:50%;border:2.5px solid var(--ink);background:linear-gradient(#4a3f74,#2a2248);color:#f3ecff;font:28px/1 var(--display);padding:0 0 4px;cursor:pointer;box-shadow:0 3px 0 rgba(0,0,0,.45)}
#trScr h2{flex:1;min-width:0;margin:0;text-align:center;font:700 19px/1.1 "Cinzel",Georgia,serif;letter-spacing:.06em;color:#ffe9a8;text-shadow:0 0 14px rgba(255,214,110,.45),0 2px 0 #1b1612;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#trScr .trGold{flex:none;display:flex;align-items:center;gap:2px;padding:3px 10px 3px 6px;border-radius:999px;background:rgba(10,8,22,.7);border:2px solid var(--ink);box-shadow:0 0 0 1px #4b3f78;font:16px var(--display);color:#fff3c4}
#trScr .trStrip{position:relative;display:flex;align-items:flex-start;gap:7px;overflow-x:auto;overflow-y:hidden;padding:8px 14px 6px;scrollbar-width:none;flex:none;touch-action:pan-x}
#trScr .trStrip::-webkit-scrollbar{display:none}
#trScr .trSep{flex:none;width:1px;align-self:stretch;margin:4px 2px 14px;background:linear-gradient(transparent,rgba(190,170,255,.45),transparent)}
#trScr .trA{position:relative;flex:none;width:48px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:0;border:0;background:none;cursor:pointer;color:inherit}
#trScr .trA>span{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;border:2.5px solid var(--ink);background:radial-gradient(circle at 50% 35%,#3e3660,#1d1934 72%);box-shadow:0 0 0 1.5px rgba(var(--ar),.35),0 3px 0 rgba(0,0,0,.45);transition:transform .18s}
#trScr .trA svg{width:30px;height:30px}
#trScr .trA.sel>span{transform:scale(1.14);box-shadow:0 0 0 2px rgb(var(--ar)),0 0 16px rgba(var(--ar),.8),0 3px 0 rgba(0,0,0,.45)}
#trScr .trA i{display:flex;gap:2px}#trScr .trA i b{width:5px;height:5px;transform:rotate(45deg);background:rgba(200,190,240,.22)}#trScr .trA i b.on{background:rgb(var(--ar));box-shadow:0 0 4px rgb(var(--ar))}
#trScr .trA em{position:absolute;top:-3px;right:-2px;width:12px;height:12px;border-radius:50%;background:#ffd84a;border:2px solid var(--ink);font-style:normal}
#trScr .trTree{position:relative;flex:1;min-height:0;overflow-x:hidden;overflow-y:auto;scrollbar-width:none;touch-action:pan-y}
#trScr .trTree::-webkit-scrollbar{display:none}
#trScr .trIn{position:relative;margin:0 auto;max-width:520px}
#trScr canvas.trCv{position:absolute;left:0;top:0;pointer-events:none}
#trScr .trRoot{position:absolute;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;text-align:center;width:min(92%,340px)}
#trScr .trRoot .trRI{display:grid;place-items:center;width:60px;height:60px;border-radius:50%;border:3px solid var(--ink);background:radial-gradient(circle at 50% 30%,#4b4078,#1d1934 75%);box-shadow:0 0 0 2px var(--c),0 0 22px var(--c),0 4px 0 rgba(0,0,0,.5)}
#trScr .trRoot .trRI svg{width:42px;height:42px}
#trScr .trRoot b{margin-top:6px;font:21px/1.05 var(--display);color:#fff;text-shadow:0 2px 0 #1b1612,0 0 12px rgba(0,0,0,.6)}
#trScr .trRoot small{margin-top:2px;max-width:100%;font-size:13px;line-height:1.2;color:#cfc4ef;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#trScr .trN{position:absolute;width:52px;height:52px;margin:-26px 0 0 -26px;padding:0;border-radius:50%;border:2.5px solid var(--ink);cursor:pointer;display:grid;place-items:center;
  background:radial-gradient(circle at 50% 32%,#3a3456,#191629 72%);box-shadow:0 0 0 2px #514a6c,0 4px 0 rgba(0,0,0,.5);transition:transform .15s,box-shadow .2s}
#trScr .trN svg{width:25px;height:25px;fill:none;stroke:#7f789a;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
#trScr .trN.cap{width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:14px;transform:rotate(45deg)}
#trScr .trN.cap svg{transform:rotate(-45deg);width:28px;height:28px}
#trScr .trN.cap svg path{fill:rgba(127,120,154,.25)}
#trScr .trN.av{box-shadow:0 0 0 2px var(--c),0 0 14px var(--c),0 4px 0 rgba(0,0,0,.5);animation:trBr 1.7s ease-in-out infinite}
#trScr .trN.av svg{stroke:var(--c)}
#trScr .trN.on{background:radial-gradient(circle at 50% 28%,#fffbe8 0,var(--c) 34%,var(--cd) 100%);box-shadow:0 0 0 2px #fff4cf,0 0 20px var(--c),0 4px 0 rgba(0,0,0,.5)}
#trScr .trN.on svg{stroke:#1b1612}#trScr .trN.cap.on svg path{fill:#1b1612}
#trScr .trN.alt{background:radial-gradient(circle at 50% 32%,#3c3558,#1b1830 72%);box-shadow:0 0 0 2px var(--c),0 4px 0 rgba(0,0,0,.5);opacity:.85}
#trScr .trN.alt svg{stroke:var(--c);opacity:.8}
#trScr .trN.sel::after{content:"";position:absolute;inset:-9px;border-radius:inherit;border:2px dashed rgba(255,255,255,.85);animation:trSpin 9s linear infinite}
#trScr .trN.pop{animation:trPop .55s cubic-bezier(.2,1.6,.4,1)}
#trScr .trN.cap.pop{animation:trPopC .55s cubic-bezier(.2,1.6,.4,1)}
#trScr .trL{position:absolute;transform:translateX(-50%);white-space:nowrap;pointer-events:none;padding:2px 8px 3px;border-radius:9px;background:rgba(14,11,30,.8);box-shadow:0 0 0 1px rgba(150,130,220,.18);
  font:12.5px/1.15 var(--display);color:#e9e2ff;text-shadow:0 1px 0 #120f22}
#trScr .trL i{font:700 10px/1 "Cinzel",Georgia,serif;font-style:normal;letter-spacing:.08em;color:rgba(214,200,255,.7);margin-right:4px}
#trScr .trL.on{color:#fff6d8}#trScr .trL.on i{color:var(--c)}#trScr .trL.dim{color:rgba(220,210,255,.5)}
#trScr .trP{position:relative;flex:none;margin:4px 12px calc(10px + env(safe-area-inset-bottom,0px));padding:10px 14px 9px;border-radius:16px;border:2.5px solid var(--ink);
  background:linear-gradient(180deg,rgba(43,34,80,.96),rgba(20,16,40,.97));box-shadow:0 0 0 1.5px rgba(var(--ar),.55),0 0 24px rgba(var(--ar),.18),0 6px 0 rgba(0,0,0,.4)}
#trScr .trPh{display:flex;align-items:center;gap:10px}
#trScr .trPh>span{flex:none;display:grid;place-items:center;width:36px;height:36px;border-radius:50%;border:2px solid var(--ink);background:radial-gradient(circle at 50% 30%,#fffbe8 0,var(--c) 40%,var(--cd) 100%)}
#trScr .trPh>span svg{width:21px;height:21px;fill:none;stroke:#1b1612;stroke-width:2.3;stroke-linecap:round;stroke-linejoin:round}
#trScr .trPh>div{min-width:0;flex:1}
#trScr .trPh b{display:block;font:19px/1.1 var(--display);color:#fff}
#trScr .trPh small{display:block;font:700 10.5px/1.3 "Cinzel",Georgia,serif;letter-spacing:.1em;color:var(--c)}
#trScr .trPd{margin:6px 0 9px;font-size:15px;line-height:1.28;color:#e3dcfa;min-height:2.56em}
#trScr .trBtn{width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 10px 11px;border-radius:13px;border:2.5px solid var(--ink);cursor:pointer;
  font:19px/1 var(--display);color:#1b1612;background:linear-gradient(#ffe27a,#f0a812);box-shadow:inset 0 2px 0 rgba(255,255,255,.5),0 4px 0 #1b1612;text-shadow:0 1px 0 rgba(255,255,255,.4)}
#trScr .trBtn:active{transform:translateY(3px);box-shadow:inset 0 2px 0 rgba(255,255,255,.5),0 1px 0 #1b1612}
#trScr .trBtn.alt{background:linear-gradient(#c9b8ff,#7d5fe0);color:#fff;text-shadow:0 2px 0 #1b1612}
#trScr .trBtn.done{background:linear-gradient(#3b3560,#2a2548);color:#cfc4ef;text-shadow:none;cursor:default}
#trScr .trBtn.no{background:linear-gradient(#5a5470,#3e3a52);color:#d8d2ea;text-shadow:none}
#trScr .trBtn .coin{width:17px;height:17px;margin:0 0 0 4px}
#trScr .trNote{display:block;margin-top:6px;text-align:center;font-size:12.5px;line-height:1.2;color:#a99fd0}
#trScr .trRf{position:absolute;z-index:2;top:8px;right:10px;display:flex;align-items:center;gap:4px;height:30px;padding:0 10px 0 7px;border-radius:999px;border:2px solid var(--ink);cursor:pointer;
  background:linear-gradient(#433a6e,#2a2350);color:#eadfff;font:13.5px/1 var(--display);box-shadow:0 0 0 1px rgba(255,214,110,.35),0 2px 0 rgba(0,0,0,.45)}
#trScr .trRf svg{width:16px;height:16px;fill:none;stroke:#ffd86e;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
#trScr .trRf:active{transform:translateY(2px)}#trScr.in .trRf{animation:trGrow .5s cubic-bezier(.2,1.3,.4,1) both;animation-delay:.4s}
#trScr .trPh>span.rf{background:radial-gradient(circle at 50% 30%,#fff6c8 0,#ffd24a 42%,#9a6a0a 100%)}
#trScr .trPd b{color:#fff3c4;font-weight:700}#trScr .trPd .coin{margin:0 1px 0 3px}
#trScr .trRow{display:flex;gap:8px}#trScr .trRow .trBtn{flex:1;min-width:0;font-size:17px;padding:10px 6px 11px}
#trScr .trBtn.rf{background:linear-gradient(#a8ecff,#3f8fe2);color:#fff;text-shadow:0 2px 0 #1b1612}
#trScr .trBtn.rf.dim{filter:saturate(.45) brightness(.85)}
#trScr .trBtn .gemS{margin:0 2px 0 7px}
#trScr .trBtn.shake{animation:trShk .42s}
@keyframes trShk{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
@media (max-width:359px){#trScr .trRf span{display:none}#trScr .trRf{padding:0 7px}}
#trScr.in .trRoot,#trScr.in .trN,#trScr.in .trL{animation:trGrow .5s cubic-bezier(.2,1.3,.4,1) both;animation-delay:calc(var(--d,0)*1ms)}
#trScr.in .trN.cap{animation-name:trGrowC}
@keyframes trBr{50%{box-shadow:0 0 0 2px var(--c),0 0 24px var(--c),0 4px 0 rgba(0,0,0,.5)}}
@keyframes trSpin{to{transform:rotate(360deg)}}
@keyframes trPop{0%{transform:scale(.7)}60%{transform:scale(1.22)}100%{transform:scale(1)}}
@keyframes trPopC{0%{transform:rotate(45deg) scale(.7)}60%{transform:rotate(45deg) scale(1.22)}100%{transform:rotate(45deg) scale(1)}}
@keyframes trGrow{0%{opacity:0;transform:translateY(-22px) scale(.6)}100%{opacity:1}}
@keyframes trGrowC{0%{opacity:0;transform:translateY(-22px) rotate(45deg) scale(.6)}100%{opacity:1;transform:rotate(45deg)}}
#trScr .trRoot{animation-name:trGrowR}@keyframes trGrowR{0%{opacity:0;transform:translateX(-50%) scale(.6)}100%{opacity:1;transform:translateX(-50%)}}
@media (max-width:410px){#trScr h2{font-size:15.5px;line-height:1.08;white-space:normal;letter-spacing:.04em}#trScr .trGold{font-size:14.5px;padding:2px 8px 2px 5px}}
@media (prefers-reduced-motion:reduce){#trScr .trN.av,#trScr .trN.sel::after,#trScr.in .trRoot,#trScr.in .trN,#trScr.in .trL,#trScr .trBtn.shake,#trScr.in .trRf{animation:none}}
#cnTrBtn svg{width:36px;height:36px}
.sk .trPip{display:flex;align-items:center;justify-content:center;gap:3px;font:11px/1.2 var(--display);font-style:normal;color:#6a5a90}
.sk .trPip b{width:6px;height:6px;transform:rotate(45deg);border:1px solid rgba(27,22,18,.6);background:rgba(120,110,150,.25)}
.sk .trPip b.on{background:var(--tc);box-shadow:0 0 4px var(--tc)}
.sk .trPip u{text-decoration:none;margin-left:3px}
`;document.head.appendChild(st)}
// lo stato del menu: l'abilità scelta, il passo toccato, le posizioni dei passi (in px dentro l'albero), le luci che corrono e scoppiano
const TRM={id:null,s:1,b:0,pos:null,cv:null,raf:0,t0:0,fl:[],bursts:[],pulses:[],dpr:1,W:0,H:0,dragX:null,rf:false,rfO:null,rfT:[]};
function trNext(id){const lv=trLv(id);return lv>=5?null:lv+1}
function trCan(id){const n=trNext(id);return n!=null&&(SAVE.gold||0)>=TR_COST[n-1]}
function trAnyCan(){return TR_IDS.some(trCan)}
// il rimborso: tutto l'oro dei passi comprati, per 5 cristalli a passo
const trRfGold=id=>TR_COST.slice(0,trLv(id)).reduce((a,b)=>a+b,0),trRfCost=id=>TR_RF*trLv(id);
// mentre il rimborso spegne i passi uno alla volta, l'albero mostra TRM.rfO e non il salvataggio (già a zero)
const trView=id=>TRM.rfO&&TRM.rfO.id===id?TRM.rfO:{lv:trLv(id),f3:trSide(id,3),f5:trSide(id,5)};
function trRfStop(){TRM.rfT.forEach(clearTimeout);TRM.rfT=[];TRM.rfO=null;TRM.rf=false}
const TR_RFG='<path d="M4.5 12a7.5 7.5 0 1 0 2.3-5.4M4.5 4.6V9h4.4"/><circle cx="12" cy="12" r="2.9"/>';
// il bottone «Abilità» sotto «Premi»: viola quando c'è un passo che puoi pagare e non hai ancora guardato dopo l'ultima partita
function trBtnInit(){const col=document.querySelector('#tabPlay .sideBtns.l');if(!col||$('cnTrBtn'))return;
  const b=document.createElement('button');b.className='qbtn cnSide';b.id='cnTrBtn';b.setAttribute('aria-label','Albero delle Abilità');
  b.innerHTML=TR_ICO+'<small>Albero</small><em class="pip" id="cnTrN" hidden>!</em>';const pr=$('cnPremiBtn');col.insertBefore(b,pr?pr.nextSibling:col.firstChild);
  b.onclick=ev=>{ev.stopPropagation();trOpen()};trBtnSync()}
function trBtnSync(){const b=$('cnTrBtn');if(!b)return;const S=trS(),hot=trAnyCan()&&S._seen!==(SAVE.runs|0);b.classList.toggle('hot',hot);const p=$('cnTrN');if(p&&p.hidden!==!hot)p.hidden=!hot}
{const _rp=renderPlay;renderPlay=function(){const r=_rp.apply(this,arguments);try{if(TR.on&&CN.on&&!zMode()){trBtnInit();trBtnSync()}const b=$('cnTrBtn');if(b)b.hidden=!TR.on||!CN.on||zMode()}catch(err){trErr(err)}return r}}
function trOpen(){if(!TR.on)return;trCss();if(typeof sceFonts==='function')sceFonts();let el=$('trScr');
  if(!el){el=document.createElement('div');el.id='trScr';el.hidden=true;$('wrap').appendChild(el)}
  const S=trS();S._seen=SAVE.runs|0;save();trBtnSync();
  if(!TRM.id||!TRD[TRM.id])TRM.id=TR_IDS.find(trCan)||TR_IDS.find(id=>trLv(id)>0)||TR_IDS[0];
  el.innerHTML=`<header class="trHd"><button class="trX" aria-label="Indietro">‹</button><h2>Albero delle Abilità</h2><span class="trGold"><i class="coin"></i><b id="trGoldN">${trFmt(SAVE.gold||0)}</b></span></header>
    <div class="trStrip"></div><div class="trTree"><div class="trIn"><canvas class="trCv"></canvas></div></div><div class="trP"></div>`;
  el.hidden=false;el.querySelector('.trX').onclick=trClose;
  const tree=el.querySelector('.trTree');tree.addEventListener('pointerdown',e=>{TRM.dragX=e.clientX;TRM.dragY=e.clientY},{passive:true});
  tree.addEventListener('pointerup',e=>{if(TRM.dragX==null)return;const dx=e.clientX-TRM.dragX,dy=e.clientY-TRM.dragY;TRM.dragX=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6){const i=TR_IDS.indexOf(TRM.id),j=(i+(dx<0?1:-1)+TR_IDS.length)%TR_IDS.length;trSel(TR_IDS[j],true)}},{passive:true});
  removeEventListener('resize',trLayout);addEventListener('resize',trLayout);
  trStrip();trSel(TRM.id,false);sfx('ui');trChime([523,659,784],.05);
  cancelAnimationFrame(TRM.raf);TRM.t0=performance.now();const loop=()=>{if(el.hidden)return;TRM.raf=requestAnimationFrame(loop);try{trDraw()}catch(err){trErr(err)}};TRM.raf=requestAnimationFrame(loop)}
function trClose(){const el=$('trScr');if(el)el.hidden=true;cancelAnimationFrame(TRM.raf);trRfStop();removeEventListener('resize',trLayout);sfx('ui');try{renderGold();renderPlay()}catch(err){trErr(err)}}
// la striscia delle abilità, a gruppi
function trStrip(){const el=$('trScr');if(!el)return;const st=el.querySelector('.trStrip');
  st.innerHTML=TR_GRP.map(([g,ids],gi)=>(gi?'<span class="trSep"></span>':'')+ids.map(id=>{const lv=trLv(id),s=SK.find(q=>q.id===id);
    return`<button class="trA${id===TRM.id?' sel':''}" data-id="${id}" style="--ar:${trRgb(TRD[id].c)}" aria-label="${s?s.n:id}"><span><svg viewBox="0 0 40 40">${ICON[id]||''}</svg></span><i>${[1,2,3,4,5].map(k=>`<b class="${k<=lv?'on':''}"></b>`).join('')}</i></button>`}).join('')).join('');
  st.querySelectorAll('.trA').forEach(b=>b.onclick=()=>trSel(b.dataset.id,true))}
// scegli un'abilità: l'albero cresce dall'alto verso il basso
function trSel(id,snd){trRfStop();TRM.id=id;const el=$('trScr');if(!el)return;const D=TRD[id],s=SK.find(q=>q.id===id);
  el.style.setProperty('--c',D.c);el.style.setProperty('--cd',trDark(D.c,.45));el.style.setProperty('--ar',trRgb(D.c));
  el.querySelectorAll('.trA').forEach(b=>b.classList.toggle('sel',b.dataset.id===id));const sb=el.querySelector(`.trA[data-id="${id}"]`);if(sb&&sb.scrollIntoView)sb.scrollIntoView({block:'nearest',inline:'center',behavior:snd?'smooth':'auto'});
  const lv=trLv(id),nx=trNext(id);TRM.s=nx||5;TRM.b=TRM.s===3||TRM.s===5?trSide(id,TRM.s):0;
  const inn=el.querySelector('.trIn'),cv=inn.querySelector('canvas');inn.innerHTML='';inn.appendChild(cv);TRM.cv=cv;
  inn.insertAdjacentHTML('beforeend',`<button class="trRf" aria-label="Rimborsa l'albero" hidden><svg viewBox="0 0 24 24">${TR_RFG}</svg><span>Rimborsa</span></button><div class="trRoot" style="--d:0"><span class="trRI"><svg viewBox="0 0 40 40">${ICON[id]||''}</svg></span><b>${s?s.n:id}</b><small>${s?s.d:''}</small></div>`);
  let d=1;for(let k=1;k<=5;k++){const st=D.s[k-1],fork=Array.isArray(st);(fork?[0,1]:[null]).forEach(b=>{const q=fork?st[b]:st,cap=k===5;
    inn.insertAdjacentHTML('beforeend',`<button class="trN${cap?' cap':''}" data-s="${k}" data-b="${b==null?'':b}" style="--d:${d*70}" aria-label="${TR_ROM[k-1]} ${q.n}"><svg viewBox="0 0 24 24">${TR_GLY[q.g]||TR_GLY.fx}</svg></button><div class="trL" data-s="${k}" data-b="${b==null?'':b}" style="--d:${d*70}"><i>${TR_ROM[k-1]}</i>${q.n}</div>`)});d++}
  inn.querySelector('.trRf').onclick=()=>trAct('refund');
  inn.querySelectorAll('.trN').forEach(n=>n.onclick=()=>{if(TRM.rfO)return;TRM.rf=false;TRM.s=+n.dataset.s;TRM.b=n.dataset.b===''?0:+n.dataset.b;trPaint();trPanel();sfx('ui');tone(660+TRM.s*80,660+TRM.s*80,.06,'triangle',.025)});
  el.classList.remove('in');void el.offsetWidth;if(!(LOWFX||RM))el.classList.add('in');
  TRM.fl=[];TRM.bursts=[];TRM.pulses=[];trLayout();trPaint();trPanel();inn.parentElement.scrollTop=0;
  if(snd){sfx('ui');trChime([392+TR_IDS.indexOf(id)*12,523+TR_IDS.indexOf(id)*12],.03)}}
// le posizioni: la radice in alto, poi una fila per passo; i bivi a destra e a sinistra
function trLayout(){const el=$('trScr');if(!el||el.hidden||!TRM.cv)return;const tree=el.querySelector('.trTree'),inn=el.querySelector('.trIn');
  // la radice (cerchio, nome, descrizione) occupa 134 px; poi un passo ogni «row» px (74…92, secondo lo schermo); in fondo la mossa leggendaria e il suo nome
  const W=Math.min(520,tree.clientWidth),Hv=tree.clientHeight,rootB=128,row=clamp((Hv-rootB-30-76)/4,72,92),H=Math.max(Hv,Math.ceil(rootB+30+row*4+76));
  inn.style.width=W+'px';inn.style.height=H+'px';const cx=W/2,dx=Math.min(W*.27,118),pos={root:[cx,50]};
  for(let k=1;k<=5;k++){const y=rootB+30+row*(k-1)+(k===5?6:0);if(k===3||k===5){pos[k+'a']=[cx-dx,y];pos[k+'b']=[cx+dx,y]}else pos[k]=[cx,y]}
  TRM.pos=pos;TRM.W=W;TRM.H=H;TRM.row=row;
  const root=inn.querySelector('.trRoot');root.style.top='20px';
  inn.querySelectorAll('.trN,.trL').forEach(n=>{const k=+n.dataset.s,b=n.dataset.b,p=pos[k+(b===''?'':b==='0'?'a':'b')];n.style.left=p[0]+'px';n.style.top=(n.classList.contains('trL')?p[1]+(k===5?44:28):p[1])+'px'});
  const dpr=TRM.dpr=Math.min(2,devicePixelRatio||1),cv=TRM.cv;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px'}
// lo stato di ogni passo: comprato e scelto (on), comprato ma dall'altro lato del bivio (alt), il prossimo da comprare (av)
function trState(id,k,b){const V=trView(id),lv=V.lv;if(k<=lv){if(b==null||b===''||(k===3?V.f3:V.f5)===+b)return'on';return'alt'}if(k===lv+1)return'av';return'lock'}
function trPaint(){const el=$('trScr');if(!el)return;const id=TRM.id;
  el.querySelectorAll('.trN').forEach(n=>{const k=+n.dataset.s,b=n.dataset.b,s=trState(id,k,b);n.classList.toggle('on',s==='on');n.classList.toggle('alt',s==='alt');n.classList.toggle('av',s==='av');
    n.classList.toggle('sel',k===TRM.s&&(b===''||+b===TRM.b))});
  el.querySelectorAll('.trL').forEach(n=>{const k=+n.dataset.s,b=n.dataset.b,s=trState(id,k,b);n.classList.toggle('on',s==='on');n.classList.toggle('dim',s==='lock')});
  const rb=el.querySelector('.trRf');if(rb)rb.hidden=!(trLv(id)>0)||!!TRM.rfO;
  const g=$('trGoldN');if(g&&!TRM.rfO)g.textContent=trFmt(SAVE.gold||0)}
// il riquadro sotto: il passo toccato e cosa si può fare
function trPanel(){const el=$('trScr');if(!el)return;const id=TRM.id,k=TRM.s,D=TRD[id],st=D.s[k-1],fork=Array.isArray(st),b=fork?TRM.b:null,q=fork?st[b]:st,s=SK.find(x=>x.id===id),lv=trLv(id),state=trState(id,k,fork?b:'');
  if(TRM.rf&&lv>0&&!TRM.rfO)return trPanelRf(el,id,s,lv);TRM.rf=false;
  const cost=TR_COST[k-1],gold=SAVE.gold||0;let btn;
  if(state==='on')btn=`<button class="trBtn done" disabled>✓ Sbloccato</button>`;
  else if(state==='alt')btn=`<button class="trBtn alt" data-act="side">Scegli questo ramo · gratis</button>`;
  else if(state==='av')btn=gold>=cost?`<button class="trBtn" data-act="buy">Sblocca · ${trFmt(cost)}<i class="coin"></i></button>`:`<button class="trBtn no" data-act="poor">Ti mancano ${trFmt(cost-gold)}<i class="coin"></i></button>`;
  else btn=`<button class="trBtn no" data-act="lock">Prima sblocca il passo ${TR_ROM[lv]}</button>`;
  const tag=`Passo ${TR_ROM[k-1]}${fork?(k===5?' · mossa leggendaria '+(b?'B':'A'):' · bivio '+(b?'B':'A')):''}`;
  const note=fork&&state!=='lock'?(k===5?'Nel bivio vale un lato solo: lo cambi quando vuoi, gratis.':'Nel bivio vale un lato solo: lo cambi quando vuoi, gratis.'):`Vale quando prendi «${s?s.n:id}» in partita.`;
  el.querySelector('.trP').innerHTML=`<div class="trPh"><span><svg viewBox="0 0 24 24">${TR_GLY[q.g]||TR_GLY.fx}</svg></span><div><small>${tag}</small><b>${q.n}</b></div></div><p class="trPd">${q.d}</p>${btn}<small class="trNote">${note}</small>`;
  trPanelOn(el)}
const trPanelOn=el=>el.querySelectorAll('.trP [data-act]').forEach(B=>B.onclick=()=>trAct(B.dataset.act));
// il rimborso chiesto dentro la pagina: quanto oro torna, quanto costa in cristalli, «Annulla» e «Rimborsa»
function trPanelRf(el,id,s,lv){const g=trRfGold(id),c=trRfCost(id),gems=SAVE.gems||0,ok=gems>=c;
  el.querySelector('.trP').innerHTML=`<div class="trPh"><span class="rf"><svg viewBox="0 0 24 24">${TR_RFG}</svg></span><div><small>Rimborso dell'albero</small><b>${s?s.n:id}</b></div></div>
    <p class="trPd">Ti ridà tutto l'oro, <b>${trFmt(g)}</b><i class="coin"></i>: ${lv>1?`i ${lv} passi tornano chiusi`:'il passo torna chiuso'} e l'oro lo spendi dove vuoi.</p>
    <div class="trRow"><button class="trBtn no" data-act="rfNo">Annulla</button><button class="trBtn rf${ok?'':' dim'}" data-act="${ok?'rfYes':'rfPoor'}">Rimborsa<i class="gemS"></i>${c}</button></div>
    <small class="trNote">${ok?`${TR_RF} cristalli a passo · ne hai ${gems}`:`Ti mancano ${c-gems} cristalli: li trovi nelle partite e nelle missioni`}</small>`;
  trPanelOn(el)}
function trAct(act){if(TRM.rfO)return;const id=TRM.id,k=TRM.s,b=TRM.b,S=trS();
  if(act==='refund'){TRM.rf=true;trPanel();sfx('ui');tone(520,390,.12,'triangle',.03);return}
  if(act==='rfNo'){TRM.rf=false;trPanel();sfx('ui');return}
  if(act==='rfPoor'){const B=$('trScr').querySelector('.trBtn.rf');if(B){B.classList.remove('shake');void B.offsetWidth;B.classList.add('shake')}sfx('ui');tone(220,160,.2,'square',.02);vib(30);return}
  if(act==='rfYes')return trRefund(id);
  const o=S[id]||(S[id]={lv:0,f3:0,f5:0});
  if(act==='buy'){const cost=TR_COST[k-1];if((SAVE.gold||0)<cost||o.lv!==k-1)return;SAVE.gold-=cost;o.lv=k;if(k===3)o.f3=b;if(k===5)o.f5=b;save();
    trBuyFx(k,b);trPaint();trPanel();trStrip();trBtnSync();vib([20,30,40]);
    if(trNext(id)){setTimeout(()=>{if(TRM.id!==id)return;TRM.s=trNext(id);TRM.b=0;trPaint();trPanel()},900)}}
  else if(act==='side'){if(k===3)o.f3=b;else o.f5=b;save();trPaint();trPanel();const p=TRM.pos[k+(b?'b':'a')];TRM.bursts.push({x:p[0],y:p[1],t:0,big:false});sfx('ui');trChime([587,880],.04);
    const n=$('trScr').querySelector(`.trN[data-s="${k}"][data-b="${b}"]`);if(n){n.classList.remove('pop');void n.offsetWidth;n.classList.add('pop')}}
  else if(act==='poor'){toast('Serve più oro: lo trovi nelle partite');sfx('ui');tone(220,160,.2,'square',.02)}
  else{sfx('ui');tone(220,160,.2,'square',.02)}}
// la luce che scende lungo il filo fino al passo nuovo, poi lo scoppio; il suono magico
function trBuyFx(k,b){const P0=TRM.pos,to=P0[k+(k===3||k===5?(b?'b':'a'):'')],from=k===1?P0.root:k===4?P0['3'+(trSide(TRM.id,3)?'b':'a')]:P0[(k-1)+''],cap=k===5;
  TRM.pulses.push({a:from,b:to,t:0,k});setTimeout(()=>{TRM.bursts.push({x:to[0],y:to[1],t:0,big:cap});const n=$('trScr')&&$('trScr').querySelector(`.trN[data-s="${k}"][data-b="${k===3||k===5?b:''}"]`);if(n){n.classList.remove('pop');void n.offsetWidth;n.classList.add('pop')}
    if(cap){sfx('levelup');trChime([523,659,784,1046,1318],.05)}else trChime([523+k*40,659+k*40,784+k*40],.045)},420);
  sfx('upgrade');tone(330,990,.4,'sine',.03)}
function trChime(fs,v){fs.forEach((f,i)=>{tone(f,f,.35,'triangle',v,i*.07);tone(f*2,f*2,.25,'sine',v*.35,i*.07+.02)})}
// il rimborso: i passi si spengono dal più basso al primo, la luce risale il filo, l'oro di ogni passo vola al contatore; poi l'albero è di nuovo da comprare
function trRefund(id){const S=trS(),o=S[id],c=trRfCost(id),g=trRfGold(id),lv=trLv(id);if(!o||!lv||(SAVE.gems||0)<c)return;
  const g0=SAVE.gold||0,V={id,lv,f3:o.f3|0,f5:o.f5|0},el=$('trScr'),gn=$('trGoldN'),s=SK.find(x=>x.id===id),slow=LOWFX||RM,step=slow?70:160;let got=g0;
  SAVE.gems-=c;SAVE.gold=g0+g;delete S[id];save();TRM.rf=false;TRM.rfO=V;
  el.querySelector('.trP').innerHTML=`<div class="trPh"><span class="rf"><svg viewBox="0 0 24 24">${TR_RFG}</svg></span><div><small>Rimborso dell'albero</small><b>${s?s.n:id}</b></div></div>
    <p class="trPd">L'oro torna a te: <b>+${trFmt(g)}</b><i class="coin"></i>. I passi si richiudono uno alla volta…</p><button class="trBtn done" disabled>−${c}<i class="gemS"></i></button><small class="trNote">Ricompri i passi quando vuoi, anche su altri rami.</small>`;
  sfx('ui');tone(784,392,.55,'sine',.03);vib([20,30,20]);
  for(let k=lv;k>=1;k--)TRM.rfT.push(setTimeout(()=>{if(TRM.rfO!==V)return;const sd=k===3?V.f3:k===5?V.f5:'',key=k+(sd===''?'':sd?'b':'a'),p=TRM.pos&&TRM.pos[key];V.lv=k-1;trPaint();
    const n=el.querySelector(`.trN[data-s="${k}"][data-b="${sd}"]`);if(n){n.classList.remove('pop');void n.offsetWidth;n.classList.add('pop')}
    if(p){TRM.bursts.push({x:p[0],y:p[1],t:0,big:k===5,out:1});const up=k===1?TRM.pos.root:k===4?TRM.pos['3'+(V.f3?'b':'a')]:k===3||k===2?TRM.pos[(k-1)+'']:TRM.pos['4'];if(up)TRM.pulses.push({a:up,b:p,t:0,k,up:1})}
    const f=300+k*70;tone(f*1.5,f,.24,'triangle',.034);tone(f*3,f*2,.14,'sine',.012,.03);
    // le monete di questo passo volano al contatore, che sale quando arrivano
    const r=n&&n.getBoundingClientRect(),add=TR_COST[k-1],land=()=>{got+=add;if(gn&&TRM.rfO===V){gn.textContent=trFmt(got);bump(gn)}sfx('coin')};
    if(r&&r.width&&!slow){const m=k>=4?3:2;let left=m;for(let j=0;j<m;j++)TRM.rfT.push(setTimeout(()=>flyCoin(r.left+r.width/2+(j-1)*9,r.top+r.height/2,gn,()=>{if(--left===0)land()}),j*70))}else land()
  },(lv-k)*step));
  TRM.rfT.push(setTimeout(()=>{if(TRM.rfO!==V)return;TRM.rfO=null;TRM.rfT=[];if(gn)gn.textContent=trFmt(SAVE.gold||0);TRM.s=1;TRM.b=0;trPaint();trPanel();trStrip();trBtnSync();trChime([392,330,262],.035)},(lv-1)*step+(slow?150:950)))}
// la tela dietro i passi: i fili di luce, il cerchio di rune della radice, le lucciole, le luci che corrono e gli scoppi
function trDraw(){const cv=TRM.cv,P0=TRM.pos;if(!cv||!P0)return;const c=cv.getContext('2d'),dpr=TRM.dpr,t=(performance.now()-TRM.t0)/1000,id=TRM.id,D=TRD[id],rgb=trRgb(D.c),slow=LOWFX||RM;
  c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,TRM.W,TRM.H);
  // il cerchio di rune intorno all'abilità
  const R=P0.root;c.save();c.translate(R[0],R[1]);const g0=c.createRadialGradient(0,0,8,0,0,66);g0.addColorStop(0,`rgba(${rgb},.32)`);g0.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g0;c.fillRect(-80,-80,160,160);
  for(const[rr,dir,n] of[[42,1,16],[49,-1,24]]){c.save();c.rotate((slow?0:t)*.25*dir);c.strokeStyle=`rgba(${rgb},.55)`;c.lineWidth=1.2;c.beginPath();c.arc(0,0,rr,0,TAU);c.stroke();
    for(let i=0;i<n;i++){c.rotate(TAU/n);c.beginPath();if(i%4===0){c.moveTo(rr-4,0);c.lineTo(rr+4,0);c.moveTo(rr,-3);c.lineTo(rr,3)}else{c.moveTo(rr-2.5,0);c.lineTo(rr+2.5,0)}c.stroke()}c.restore()}c.restore();
  // i fili: dalla radice al passo I, poi giù fino al bivio finale
  const V=trView(id),lv=V.lv,f3=V.f3,f5=V.f5,L=[['root','1',1],['1','2',2],['2','3a',3,0],['2','3b',3,1],['3a','4',4,0],['3b','4',4,1],['4','5a',5,0],['4','5b',5,1]];
  for(const[a,b,k,side] of L){const A=P0[a==='root'?'root':a],B=P0[b];if(!A||!B)continue;const y0=a==='root'?A[1]+74:A[1]+26,y1=B[1]-(k===5?41:26);
    // a ogni filo il suo stato: acceso (comprato e sul ramo scelto), il prossimo, spento
    const viaSide=k===4?side===f3:true,lit=k<=lv&&(side==null||(k===3?side===f3:k===5?side===f5:viaSide)),next=k===lv+1&&(k!==4||side===f3),alt=k<=lv&&!lit&&(k===3||k===5);
    c.beginPath();c.moveTo(A[0],y0);const my=(y0+y1)/2;c.bezierCurveTo(A[0],my,B[0],my,B[0],y1);
    if(lit){c.strokeStyle=`rgba(${rgb},.35)`;c.lineWidth=9;c.stroke();c.strokeStyle=`rgba(${rgb},.95)`;c.lineWidth=3;c.stroke();c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=1.1;c.stroke()}
    else if(next||alt){c.setLineDash([6,6]);c.lineDashOffset=slow?0:-t*16;c.strokeStyle=`rgba(${rgb},${next?.7:.4})`;c.lineWidth=2;c.stroke();c.setLineDash([])}
    else{c.setLineDash([2,6]);c.strokeStyle='rgba(190,175,235,.22)';c.lineWidth=1.6;c.stroke();c.setLineDash([])}
    // le gocce di luce che scendono lungo i fili accesi
    if(lit&&!slow)for(let i=0;i<2;i++){const u=((t*.55+i*.5+k*.13)%1),q=trBez(A[0],y0,B[0],y1,u);const g=c.createRadialGradient(q[0],q[1],0,q[0],q[1],7);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.4,`rgba(${rgb},.6)`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.fillRect(q[0]-7,q[1]-7,14,14)}}
  // un alone dietro i passi accesi
  for(const key in P0){if(key==='root')continue;const k=+key[0],b=key[1]==='b'?1:key[1]==='a'?0:'';if(trState(id,k,b)!=='on')continue;const p=P0[key],r=k===5?54:44,g=c.createRadialGradient(p[0],p[1],8,p[0],p[1],r);
    g.addColorStop(0,`rgba(${rgb},.45)`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.fillRect(p[0]-r,p[1]-r,r*2,r*2)}
  // le lucciole che salgono
  if(!slow){if(TRM.fl.length<26&&Math.random()<.3)TRM.fl.push({x:Math.random()*TRM.W,y:TRM.H+6,v:12+Math.random()*22,s:Math.random()*6,r:1+Math.random()*1.6});
    for(let i=TRM.fl.length-1;i>=0;i--){const f=TRM.fl[i];f.y-=f.v/60;f.x+=Math.sin(t*1.3+f.s)*.3;if(f.y<-6){TRM.fl.splice(i,1);continue}const a=.35+.35*Math.sin(t*3+f.s);c.fillStyle=`rgba(${rgb},${a})`;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill()}}
  // la luce che corre al passo nuovo e gli scoppi
  for(let i=TRM.pulses.length-1;i>=0;i--){const q=TRM.pulses[i];q.t+=1/60;const u=Math.min(1,q.t/.42),y0=q.a[1]+(q.k===1?74:26),y1=q.b[1]-26,p=trBez(q.a[0],y0,q.b[0],y1,q.up?1-u:u),g=c.createRadialGradient(p[0],p[1],0,p[0],p[1],16),pc=q.up?'255,214,110':rgb;
    g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,`rgba(${pc},.8)`);g.addColorStop(1,`rgba(${pc},0)`);c.fillStyle=g;c.fillRect(p[0]-16,p[1]-16,32,32);if(u>=1)TRM.pulses.splice(i,1)}
  for(let i=TRM.bursts.length-1;i>=0;i--){const q=TRM.bursts[i];q.t+=1/60;const d=q.big?1.1:.7,u=q.t/d;if(u>=1){TRM.bursts.splice(i,1);continue}
    const R0=(q.big?110:70)*(q.out?.15+.85*(1-Math.sqrt(u)):Math.sqrt(u)),bc=q.out?'255,214,110':rgb;c.strokeStyle=`rgba(255,255,255,${.9*(1-u)})`;c.lineWidth=3*(1-u)+1;c.beginPath();c.arc(q.x,q.y,R0,0,TAU);c.stroke();c.strokeStyle=`rgba(${bc},${.8*(1-u)})`;c.lineWidth=6*(1-u);c.beginPath();c.arc(q.x,q.y,R0*.72,0,TAU);c.stroke();
    const n=q.big?18:10;for(let j=0;j<n;j++){const an=j/n*TAU+q.x,rr=R0*(.6+.5*((j*7)%5)/5);c.fillStyle=`rgba(255,${240-j*4},${180},${1-u})`;c.save();c.translate(q.x+Math.cos(an)*rr,q.y+Math.sin(an)*rr);c.rotate(an+u*4);const s=(q.big?4:3)*(1-u*.5);
      c.beginPath();for(let m=0;m<8;m++){const r2=m%2?s*.35:s,a2=m*Math.PI/4;c.lineTo(Math.cos(a2)*r2,Math.sin(a2)*r2)}c.closePath();c.fill();c.restore()}}}
function trBez(x0,y0,x1,y1,u){const my=(y0+y1)/2,v=1-u;return[v*v*v*x0+3*v*v*u*x0+3*v*u*u*x1+u*u*u*x1,v*v*v*y0+3*v*v*u*my+3*v*u*u*my+u*u*u*y1]}
// le carte in partita: sotto l'abilità i rombi dei passi sbloccati (e la mossa leggendaria, se c'è)
{const _os=openSkills;openSkills=function(){const r=_os.apply(this,arguments);try{if(trRun())trCards()}catch(err){trErr(err)}return r}}
function trCards(){document.querySelectorAll('#skList .sk').forEach(b=>{const s=offer[+b.dataset.i];if(!s||!TRD[s.id])return;const lv=trLv(s.id);if(!lv)return;const div=b.querySelector('div');if(!div||div.querySelector('.trPip'))return;
  const cap=lv>=5?TRD[s.id].s[4][trSide(s.id,5)].n:'';const em=document.createElement('em');em.className='trPip';em.style.setProperty('--tc',TRD[s.id].c);
  em.innerHTML=[1,2,3,4,5].map(k=>`<b class="${k<=lv?'on':''}"></b>`).join('')+`<u>${cap?'★ '+cap:'Albero '+TR_ROM[lv-1]}</u>`;div.appendChild(em)})}
