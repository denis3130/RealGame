// ===================================================================== CLASSICA NUOVA (anteprima, 20 ottobre)
// Denis: «ok creami le cose che mi hai elencato su una cosa a parte senza intaccare il progetto principale». Questo file NON è in
// src/ordine.txt: lo mette python3 anteprime/mk_classica.py in una copia del gioco (ramo classica-nuova). CN.on lo spegne.
// Seconda versione (Denis: «mi piace la grafica delle cose che hai aggiunto ma non la meccanica […] ispirandoti ai giochi più in foga»,
// poi le sue risposte alle domande): la Furia a catena (CN_FU); le
// carte con la rarità a sorpresa (CN_RAR); le evoluzioni spettacolari (CN_EVO); la Nemesi, il nemico che ti uccide, si prende l'oro della
// partita e torna a cercarti (cnNem*: buffa o spavalda, e per le spavalde un po' di sangue: «aggiungi pure il sangue se necessario»).
// Restano della prima versione la mappa del mondo coi bracieri (senza stelle), il menu con «Premi», le élite coi poteri (CN_AFX), la Torre
// e la Corsa dei boss con le reliquie. Il salvataggio nuovo sta in SAVE.cn (vittorie, record, reliquie, Torre, Corsa, Nemesi, oro dei custodi).
// Poi (Denis: «è troppo rotta come modalità quella dei 5minuti […] siamo veramente troppo op», «togliamola per ora, e togli quell'effetto
// delle fiamme sul personaggio», «il moltiplicatore ecc non deve durare tutto il tempo ma una manciata di secondi»): via le ondate a tempo
// (commit 22ea83a), la partita d'arena torna alle 10 stanze di sempre; via le fiamme dell'SSS; il moltiplicatore della Furia dura qualche
// secondo dopo ogni rango nuovo (CN_FUT).
const CN={on:true,next:null,last:null,fx:[],err:0,sel:0,sub:null,bub:[],lances:[],dr:[],rar:null,revEnd:0,revTok:0,forceRar:null,gAcc:0,gSkip:0};
function cnS(){const S=SAVE.cn||(SAVE.cn={});S.stars=S.stars||{};S.relics=S.relics||{};S.tower=S.tower||{};S.rush=S.rush||{};S.best=S.best||{};S.nem=S.nem||[];S.nemOut=S.nemOut||[];S.bossGold=S.bossGold||{};S.br=S.br||{};S.inc=S.inc||{};
  if(!S.brv){S.brv=1;for(const k in S.stars)if(S.stars[k]&1)S.br[k]=cnBrNeed(+k)}   // the islands an older preview had opened stay open (their bridge is built)
  return S}
const cnErr=err=>{if(CN.err++<6)console.error('classica nuova:',err)};
const cnBoss=i=>ARENAS[i].bt||BOSSZ[ARENAS[i].boss]||'golem';
const cnWon=i=>!!((cnS().stars[i]||0)&1);   // stars[i]: il primo bit è la vittoria (le stelle di prima non ci sono più)
// the bridge of stones from island i to the next (Denis: «aggiungi ponte di pietra»): the next island opens only when it is finished; every run
// brings stones (cnStones), a victory about half a bridge; the bridges get longer each round of four islands
const CN_BRN=[100,130,160],CN_BRS=12;   // stones for a bridge (by the round of the island it leads to); stones drawn on a bridge
const cnBrNeed=i=>CN_BRN[Math.min(2,Math.floor((i+1)/4))];
const cnBrHave=i=>Math.min(cnBrNeed(i),cnS().br[i]||0);
const cnBrDone=i=>cnBrHave(i)>=cnBrNeed(i);
const cnBrStones=(have,need)=>Math.floor(CN_BRS*have/need+1e-9);
const cnOpen=i=>i===0||!!cnS().all||cnBrDone(i-1);
const cnLit=()=>ARENAS.filter((_,i)=>cnWon(i)).length;
function cnPick(){const S=cnS();let p=S.pick;if(p==null||!ARENAS[p]||!cnOpen(p)){p=0;for(let i=0;i<ARENAS.length;i++)if(cnOpen(i))p=i}return p}
// una partita della Classica nuova: arena, Torre o Corsa (non l'Abisso di sempre né la sfida del giorno)
const cnRun=()=>CN.on&&!!G&&!G.daily&&(G.cnA!=null||!!G.tower||!!G.rush);
const cnRgb=h=>{const n=parseInt(h.slice(1),16);return`${n>>16&255},${n>>8&255},${n&255}`};
const cnMS=s=>{s=Math.round(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const cnWeek=()=>Math.floor((Date.now()/864e5+3)/7);   // cambia il lunedì
function cnRng(salt){let h=2166136261;const s='w'+cnWeek()+'|'+salt;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return((h>>>0)%1e6)/1e6}}
// aspetta che non ci sia una scelta aperta, una pausa o un passaggio di stanza
function cnLater(fn,d){const go=()=>{if(!G||G.ended||!started)return;if(modal||paused||G.state==='trans'||G.state==='dead'){setTimeout(go,250);return}try{fn()}catch(err){cnErr(err)}};setTimeout(go,d||0)}
function cnRR(x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h)}
function cnWrap(t,w){const out=[];let line='';for(const word of t.split(' ')){const s=line?line+' '+word:word;if(ctx.measureText(s).width>w&&line){out.push(line);line=word}else line=s}if(line)out.push(line);return out}

// ---------------------------------------------------------------- disegni (40×40, come le icone delle abilità)
const CNI={
  crown:`<path d="M5 30L3 11l9 8 8-13 8 13 9-8-2 19z" fill="#ffc93c" ${S2}/><path d="M6 30h28v5H6z" fill="#e0a020" ${S2}/><circle cx="20" cy="22" r="3.4" fill="#e5484d" ${S2}/><circle cx="11" cy="25" r="2.2" fill="#2fb3a6"/><circle cx="29" cy="25" r="2.2" fill="#2fb3a6"/>`,
  totem:`<path d="M12 36h16l-2-7H14z" fill="#5a4636" ${S2}/><rect x="13" y="19" width="14" height="10" rx="3" fill="#8f6c48" ${S2}/><rect x="14" y="9" width="12" height="10" rx="3" fill="#a07a52" ${S2}/><circle cx="17" cy="14" r="1.8" fill="#9ff07a"/><circle cx="23" cy="14" r="1.8" fill="#9ff07a"/><circle cx="17" cy="24" r="1.8" fill="#9ff07a"/><circle cx="23" cy="24" r="1.8" fill="#9ff07a"/><path d="M14 9l-5-6 7 3M26 9l5-6-7 3" fill="#e8dcc0" ${S2}/>`,
  fiamma:`<path d="M20 3c4 7 12 11 12 21a12 12 0 0 1-24 0c0-6 4-9 6-13 1 4 3 6 5 6 0-6 0-9 1-14z" fill="#ff8a3c" ${S2}/><path d="M20 21c3 3 5 5 5 8a5 5 0 0 1-10 0c0-3 3-5 5-8z" fill="#ffe27a"/>`,
  gift:`<path d="M6 17h28v18H6z" fill="#e5484d" ${S2}/><path d="M4 11h32v7H4z" fill="#ff6a5a" ${S2}/><path d="M17 11h6v24h-6z" fill="#ffc93c" ${S2}/><path d="M20 11c-3-7-11-8-11-3 0 3 6 3 11 3zM20 11c3-7 11-8 11-3 0 3-6 3-11 3z" fill="#ffc93c" ${S2}/>`,
  poster:`<path d="M8 4h24l-1.5 32H9.5z" fill="#ead6a6" ${S2}/><path d="M12 10h16" stroke="#7a2a24" stroke-width="3.4" stroke-linecap="round"/><circle cx="20" cy="21" r="6.5" fill="#8a5a20" ${S2}/><circle cx="17.6" cy="20" r="1.4" fill="#ffd84a"/><circle cx="22.4" cy="20" r="1.4" fill="#ffd84a"/><path d="M13 31h14" stroke="#5a4636" stroke-width="2.6" stroke-linecap="round"/><path d="M27 5l5 5" stroke="#c0392b" stroke-width="2.6" stroke-linecap="round"/>`};
const CN_BRAZ='<svg viewBox="0 0 24 32" aria-hidden="true"><path class="fl" d="M12 1c3 5 7 7 7 12a7 7 0 0 1-14 0c0-4 3-6 4-9 1 3 2 4 3 4 0-3 0-5 0-7z"/><path d="M2.5 15h19l-3.5 6H6z" fill="#5a4636" stroke="#191714" stroke-width="2" stroke-linejoin="round"/><path d="M10 21h4v6h-4z" fill="#3b332b" stroke="#191714" stroke-width="2"/><path d="M6 29h12" stroke="#191714" stroke-width="3" stroke-linecap="round"/></svg>';
const CN_LOCK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#191714" stroke-width="4.6"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#b8a990" stroke-width="2"/><rect x="5" y="10" width="14" height="11" rx="2.5" fill="#b8a990" stroke="#191714" stroke-width="2"/><circle cx="12" cy="15" r="1.8" fill="#191714"/></svg>';
const cnIco=(k,c)=>`<svg viewBox="0 0 40 40" aria-hidden="true"${c?` style="--c:${c}"`:''}>${CNI[k]||ICON[k]||''}</svg>`;

// ---------------------------------------------------------------- reliquie (solo nella Torre: una dopo ogni custode)
const CN_REL=[
  {id:'specchio',n:'Specchio di sponda',d:'Le frecce rimbalzano sui muri, ma fanno il 15% in meno',c:'#9fd8ff',f:()=>{P.wb=(P.wb||0)+1;P.atk*=.85},
    i:`<path d="M20 3l14 8v18l-14 8-14-8V11z" fill="#9fd8ff" ${S2}/><path d="M13 12l6-4M12 18l11-8" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><path d="M20 3v34" stroke="#5a8ab0" stroke-width="1.6"/>`},
  {id:'stivali',n:'Stivali di brace',d:'Ogni scatto lascia una scia di fuoco',c:'#ff8a3c',f:()=>{P.cnBraci=1},
    i:`<path d="M12 4h11v18l9 5c3 2 3 8-1 8H9V20z" fill="#8a5a20" ${S2}/><path d="M9 29h24" stroke="#1b1612" stroke-width="2.4"/><path d="M27 18c-1-4 2-6 3-9 2 3 4 5 3 9" fill="#ff8a3c" ${S2}/><path d="M12 10h11" stroke="#c07a34" stroke-width="3"/>`},
  {id:'calice',n:'Calice del vampiro',d:'Ogni 10 nemici sconfitti recuperi il 12% della salute',c:'#e5484d',f:()=>{P.cnCalice=1},
    i:`<path d="M9 5h22c0 11-5 16-11 16S9 16 9 5z" fill="#ffc93c" ${S2}/><path d="M11 9h18c-1 6-4 9-9 9s-8-3-9-9z" fill="#c0392b"/><path d="M20 21v9M12 35h16l-3-5H15z" fill="#e0a020" ${S2}/>`},
  {id:'calamita',n:"Calamita d'oro",d:'Le monete volano da te e valgono il 30% in più',c:'#ffc93c',f:()=>{P.cnMag=1;P.goldMul=(P.goldMul||1)*1.3},
    i:`<path d="M8 5h8v13a4 4 0 0 0 8 0V5h8v13a12 12 0 0 1-24 0z" fill="#e5484d" ${S2}/><path d="M8 5h8v6H8zM24 5h8v6h-8z" fill="#dfe4ea" ${S2}/><circle cx="31" cy="31" r="6" fill="#ffc93c" ${S2}/>`},
  {id:'occhio',n:'Occhio del cacciatore',d:'Il primo colpo su ogni nemico fa il doppio',c:'#7bbf4a',f:()=>{P.cnEye=1},
    i:`<path d="M3 20c5-8 11-12 17-12s12 4 17 12c-5 8-11 12-17 12S8 28 3 20z" fill="#f6ead2" ${S2}/><circle cx="20" cy="20" r="7" fill="#7bbf4a" ${S2}/><circle cx="20" cy="20" r="3" fill="#1b1612"/><circle cx="22" cy="17.5" r="1.4" fill="#fff"/>`},
  {id:'guscio',n:'Guscio di tartaruga',d:'Uno scudo para un colpo ogni pochi secondi',c:'#2fb3a6',f:()=>{P.shield=(P.shield||0)+1;P.shCd=0},
    i:`<path d="M5 26c0-11 7-19 15-19s15 8 15 19z" fill="#2fb3a6" ${S2}/><path d="M14 26l-2-8 8-6 8 6-2 8M20 12v-5M12 18H7M28 18h5" fill="none" stroke="#1b6a62" stroke-width="2.4" stroke-linejoin="round"/><path d="M3 26h34" stroke="#1b1612" stroke-width="3" stroke-linecap="round"/>`},
  {id:'bomba',n:'Cuore di bomba',d:'I nemici esplodono quando cadono',c:'#ff6a3c',f:()=>{P.cnBomb=1},
    i:`<circle cx="18" cy="23" r="12" fill="#3b332b" ${S2}/><path d="M26 13l4-4" stroke="#8a5a20" stroke-width="3.4" stroke-linecap="round"/><path d="M31 3l1 4 4 1-4 1-1 4-1-4-4-1 4-1z" fill="#ffc93c"/><path d="M12 18a7 7 0 0 1 5-4" stroke="#9aa3ad" stroke-width="2.6" fill="none" stroke-linecap="round"/>`},
  {id:'furia',n:"Furia dell'orso",d:'Sotto un terzo della salute: attacco +50% e passo più svelto',c:'#c0392b',f:()=>{P.cnFury=1},
    i:`<path d="M8 6c4 9 4 20 0 30M17 4c4 10 4 22 0 32M26 6c4 9 4 20 0 30" fill="none" stroke="#1b1612" stroke-width="6" stroke-linecap="round"/><path d="M8 6c4 9 4 20 0 30M17 4c4 10 4 22 0 32M26 6c4 9 4 20 0 30" fill="none" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/>`},
  {id:'clessidra',n:'Clessidra rotta',d:'La Super si carica il doppio più in fretta',c:'#c48ae8',f:()=>{P.cnUlt=1},
    i:`<path d="M10 4h20M10 36h20" stroke="#5a4636" stroke-width="4.4" stroke-linecap="round"/><path d="M12 6h16c0 9-6 10-6 14s6 5 6 14H12c0-9 6-10 6-14s-6-5-6-14z" fill="#e7d8ff" ${S2}/><path d="M15 32c1-5 4-5 5-8 1 3 4 3 5 8z" fill="#c48ae8"/><path d="M26 9l-5 6 3 2-4 5" stroke="#1b1612" stroke-width="1.8" fill="none"/>`},
  {id:'piuma',n:'Piuma del passero',d:'Il primo colpo che prendi in ogni stanza non ti fa niente',c:'#f6ead2',f:()=>{P.cnPiuma=1},
    i:`<path d="M31 4C17 6 9 15 8 30l3 1C17 21 22 15 31 4z" fill="#f6ead2" ${S2}/><path d="M8 30L4 37M11 25l9-2M14 19l9-3M18 13l8-3" stroke="#b8a990" stroke-width="2.2" stroke-linecap="round"/>`},
  {id:'radice',n:'Radice antica',d:"Salute massima +40%, ma il passo è un po' più lento",c:'#8a5a20',f:()=>{const a=Math.round(P.maxhp*.4);P.maxhp+=a;P.hp+=a;P.spd=(P.spd||150)*.9},
    i:`<circle cx="20" cy="13" r="9" fill="#7bbf4a" ${S2}/><path d="M18 20h4l1 6 6 6-3 2-5-5-1 7h-4l-1-7-5 5-3-2 6-6z" fill="#8a5a20" ${S2}/>`},
  {id:'stella',n:'Stella cadente',d:'Ogni 8 secondi una stella cade sul nemico più vicino',c:'#ffe27a',f:()=>{P.cnStar=1},
    i:`<path d="M33 3L19 17" stroke="#ffe27a" stroke-width="4" stroke-linecap="round" opacity=".6"/><path d="M17 12l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#ffe27a" ${S2}/>`}];
const CN_RB=Object.fromEntries(CN_REL.map(r=>[r.id,r]));
const cnRelIco=id=>{const r=CN_RB[id];return r?`<svg viewBox="0 0 40 40" aria-hidden="true">${r.i}</svg>`:''};
function cnRelicOffer(tag){if(!G||G.ended)return;const own=new Set(G.relics||[]),pool=CN_REL.filter(r=>!own.has(r.id));if(!pool.length)return;const opts=shuffle(pool.slice()).slice(0,2),S=cnS();cnEnsure();
  $('cnRelIn').innerHTML=`<span class="tag">${tag||'Premio del custode'}</span><h2>Scegli una reliquia</h2><p class="hint">Resta con te fino alla fine della partita. Quelle che trovi entrano nella tua collezione.</p>
    <div class="cnRels">${opts.map((r,k)=>`<button class="cnRelC" data-k="${k}" style="--rc:${r.c};animation-delay:${k*.12}s"><span class="cnRelI">${cnRelIco(r.id)}</span>${S.relics[r.id]?'':'<em class="cnNew">Nuova!</em>'}<b>${r.n}</b><span>${r.d}</span></button>`).join('')}</div>`;
  $('cnRelIn').querySelectorAll('.cnRelC').forEach(b=>b.onclick=()=>{const r=opts[+b.dataset.k];$('cnRel').hidden=true;modal=false;paused=false;r.f();(G.relics=G.relics||[]).push(r.id);S.relics[r.id]=(S.relics[r.id]||0)+1;save();
    sfx('levelup');banner('Reliquia!',r.n,1.6);vfxBlast(P.x,P.y-12,cnRgb(r.c),80,{sparks:16})});
  modal=true;paused=true;$('cnRel').hidden=false;sfx('shimmer',2)}

// ---------------------------------------------------------------- élite coi poteri
// ogni élite ha un potere scritto sopra la testa (due dall'arena 4 o dalla stanza 8); in cambio ha meno vita (×2,2 invece di ×2,6)
// e la vita dei nemici cresce meno da una stanza all'altra (+14% invece di +20%)
const CN_AFX={scudo:{n:'Scudo',c:'#8fdcff'},divide:{n:'Si divide',c:'#9df07a'},bomba:{n:'Esplosivo',c:'#ff9a4a'},furia:{n:'Furioso',c:'#ff6a5a'},gelo:{n:'Gelido',c:'#cfefff'},rigenera:{n:'Rigenera',c:'#d9a8ff'}};
const CN_HPROOM=.14;
const cnAfxN=()=>(G.arena||0)>=3||G.room>=8?2:1;
const cnAfxOk=()=>CN.on&&G&&!G.daily&&(G.mode==='camp'||!!G.tower);
function cnMakeElite(e){if(e.elite)return;e.elite=true;e.hp*=2.2;e.max=e.hp;e.r=Math.round(e.r*1.2);e.gold*=3;e.cdmg=Math.round(e.cdmg*1.3)}
function cnGiveAfx(e,n,ks){if(!e||isBoss(e.type))return;ks=ks||shuffle(Object.keys(CN_AFX)).slice(0,n);e.cnAfx=ks;e.cnCalm=0;e.cnSh=e.cnShM=0;
  e.cnFur=ks.includes('furia');e.cnGel=ks.includes('gelo');e.cnReg=ks.includes('rigenera');e.cnDiv=ks.includes('divide');e.cnBo=ks.includes('bomba');
  if(ks.includes('scudo')){e.cnSh=e.cnShM=Math.round(e.max*.35);e.cnShT=0}}
{const _mk=makeE;makeE=function(t,x,y,sp,el){const e=_mk.apply(this,arguments);try{if(el&&e&&e.elite&&!e.cnAfx&&!isBoss(t)&&cnAfxOk()){e.hp*=2.2/2.6;e.max=e.hp;cnGiveAfx(e,cnAfxN())}}catch(err){cnErr(err)}return e}}
{const _hm=hpMul;hpMul=function(){if(CN.on&&G&&G.mode==='camp'&&!G.daily)return(1+(effRoom()-1)*CN_HPROOM)*(G.diff||1)*firstK('firstHp');return _hm.apply(this,arguments)}}
function cnShBreak(e){sfx('glass',0,e.x);vfxBlast(e.x,e.y-e.r-e.z,'150,220,255',46,{sparks:10});text(e.x,e.y-e.r*2-e.z-26,'Scudo rotto!','#bfe9ff',12)}
function cnSplit(e){sfx('summon',0,e.x);for(const s of[-1,1]){const x=clamp(e.x+s*(e.r+6),L+22,R-22),y=clamp(e.y+rand(-8,8),TOP+30,BOT-50),o=makeE(e.type,x,y,.25,false);
    o.cnSplit=1;o.hp=o.max=Math.max(5,o.max*.5);o.r=Math.max(8,Math.round(o.r*.85));o.gold=Math.max(1,Math.ceil((o.gold||1)/2));G.enemies.push(o)}
  for(let q=0;q<10;q++)G.fx.push({k:'puff',x:e.x+rand(-12,12),y:e.y-14,vx:rand(-60,60),vy:rand(-60,-10),t:rand(.3,.5),r:rand(4,7)})}
// scudo che torna, cura di chi rigenera, il gelo che rallenta l'eroe vicino
function cnAfxTick(dt){for(const e of G.enemies){if(!e.cnAfx||e.dead||e.spawn>0)continue;e.cnShF=Math.max(0,(e.cnShF||0)-dt);
    if(e.cnShM&&e.cnSh<e.cnShM){e.cnShT-=dt;if(e.cnShT<=0)e.cnSh=Math.min(e.cnShM,e.cnSh+e.cnShM*dt)}
    if(e.cnReg){e.cnCalm+=dt;e.cnRegOn=e.cnCalm>1.6&&e.hp<e.max;if(e.cnRegOn)e.hp=Math.min(e.max,e.hp+e.max*.05*dt)}
    if(e.cnGel&&G.state==='play'&&!(P.dashT>0)&&Math.hypot(e.x-P.x,(e.y-P.y)*1.2)<64)P.mire=Math.max(P.mire||0,.12)}}

// ---------------------------------------------------------------- 1 la partita d'arena: le 10 stanze di sempre
// le ondate a tempo (5 minuti, poi il custode) sono tolte per ora (Denis: «togliamola per ora»): il codice è nel commit 22ea83a.
// Un posto libero lontano dall'eroe (tra 165 e 480 px), per la Nemesi che invade
function cnSpot(r){for(let k=0;k<30;k++){const x=rand(L+30,R-30),y=rand(TOP+46,BOT-60),d=Math.hypot(x-P.x,y-P.y);if(d<165||d>480)continue;if(G.rocks.some(q=>Math.hypot(q.x-x,q.y-y)<q.r+r+12))continue;return{x,y}}return freeSpot(r,TOP+40,BOT-80)}

// ---------------------------------------------------------------- 2 Furia a catena (come Devil May Cry e Hi-Fi Rush)
// uccidere di fila senza farti colpire fa salire la Furia; senza uccisioni cala, un colpo preso la spezza; ogni rango nuovo moltiplica
// oro ed esperienza per qualche secondo: «non deve durare tutto il tempo ma una manciata di secondi»
const CN_FU=[{l:'D',w:'Deciso',n:3,m:1.1,c:'#a9bdd0'},{l:'C',w:'Carico',n:8,m:1.2,c:'#7bd88f'},{l:'B',w:'Brutale',n:15,m:1.35,c:'#3fd0c9'},{l:'A',w:'Assurdo',n:24,m:1.5,c:'#ffd84a'},
  {l:'S',w:'Spietato',n:36,m:1.7,c:'#ff9a3c'},{l:'SS',w:'Sanguinario',n:52,m:2,c:'#ff5a4a'},{l:'SSS',w:'Sovrumano',n:72,m:2.5,c:'#e48aff'}];
const CN_FUT=6;   // secondi del moltiplicatore dopo ogni rango nuovo; un colpo preso lo spegne
function cnFuria(){return G.cnF||(G.cnF={n:0,lv:-1,idle:0,max:-1,bt:0,bm:1})}
function cnFuLv(n){let l=-1;for(let i=0;i<CN_FU.length;i++)if(n>=CN_FU[i].n)l=i;return l}
const cnFuMul=()=>{const F=G&&G.cnF;return F&&F.bt>0?F.bm:1};
function cnFuAdd(v){const F=cnFuria();F.n+=v;F.idle=0;cnFuCheck()}
function cnFuCheck(){const F=cnFuria(),l=cnFuLv(F.n);if(l===F.lv)return;const up=l>F.lv;F.lv=l;if(l>F.max)F.max=l;if(up){F.bt=CN_FUT;F.bm=CN_FU[l].m}cnFuHud(true,up);if(up)cnFuSting(l)}
function cnFuTick(dt){const F=cnFuria();F.idle+=dt;if(F.bt>0)F.bt=Math.max(0,F.bt-dt);if(F.idle>2.6&&F.n>0){F.n=Math.max(0,F.n-dt*(2.5+F.n*.07));cnFuCheck()}cnFuHud(false)}
function cnFuHit(){const F=cnFuria();F.bt=0;if(F.n<=0)return;const was=F.lv;F.n*=.35;F.idle=0;cnFuCheck();if(was>=2){text(P.x,P.y-60,'Furia spezzata!','#ff8a7a',14);tone(420,110,.3,'sawtooth',.05)}}
function cnFuSting(l){const f=[392,440,494,523,587,659,784][l]||523;tone(f,f*1.5,.12,'square',.035);tone(f*1.25,f*2,.14,'triangle',.04,.07);if(l>=4)tone(f*1.5,f*3,.22,'sawtooth',.03,.14);
  if(l>=CN_FU.length-1){sfx('shimmer',2);tone(110,55,.6,'sawtooth',.05,.05)}vib([20])}
function cnFuHud(force,up){const F=cnFuria();let el=$('cnFu');if(!el){el=document.createElement('div');el.id='cnFu';el.innerHTML='<b></b><span></span><i><u></u></i><small></small>';$('banner').parentElement.appendChild(el)}
  const now=performance.now();if(!force&&now-(CN.fuT||0)<90)return;CN.fuT=now;const l=F.lv,R=l>=0?CN_FU[l]:null,nx=CN_FU[l+1],hid=l<0;if(el.hidden!==hid)el.hidden=hid;
  if(force||el._l!==l){el._l=l;el.querySelector('b').textContent=R?R.l:'·';el.querySelector('span').textContent=R?R.w:'Furia';el.style.setProperty('--fc',R?R.c:'#a9bdd0');
    if(up){el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')}}
  const bs=F.bt>0?'×'+String(F.bm).replace('.',',')+' oro ed esperienza'+' · '+Math.ceil(F.bt)+' s':'';
  if(el._s!==bs){el._s=bs;el.querySelector('small').textContent=bs;el.classList.toggle('burst',!!bs);el.classList.toggle('sss',!!bs&&l>=CN_FU.length-1)}
  const lo=R?R.n:0,hi=nx?nx.n:lo+1,k=nx?clamp((F.n-lo)/(hi-lo),0,1):1,w=Math.round(k*50);if(el._w!==w){el._w=w;el.querySelector('u').style.transform=`scaleX(${(w/50).toFixed(2)})`}}
function cnFuHide(){const el=$('cnFu');if(el)el.hidden=true}

// ---------------------------------------------------------------- 3 carte con la rarità a sorpresa (come Megabonk e Brotato)
// ogni carta esce Comune, Rara, Epica o Leggendaria: le carte dei numeri crescono (Attacco +20/30/45/70%), le altre aggiungono danno e,
// leggendarie, un livello in più. Più è alta la Furia quando sali di livello, più escono rare. Le carte arrivano coperte e si girano;
// quelle rare girano come una slot prima di fermarsi.
const CN_RAR=[{n:'Comune',c:'#c9cfd6',d:'#6b7480'},{n:'Rara',c:'#4aa8ff',d:'#1d5fa8'},{n:'Epica',c:'#b98aff',d:'#6a2fb0'},{n:'Leggendaria',c:'#ffc21a',d:'#b86a00'}];
const CN_STATR={atk:[20,30,45,70],hp:[20,30,45,70],aspd:[20,30,45,70],crit:[10,15,22,35],heal:[40,60,80,100],dash:[30,38,46,56],boots:[15,22,30,45]};
const CN_STATD={atk:p=>`Attacco +${p}%`,hp:p=>`Salute massima +${p}%`,aspd:p=>`Velocità d'attacco +${p}%`,crit:p=>`Colpo critico +${p}%`,heal:p=>`Recuperi il ${p}% della salute`,
  dash:p=>`Ricarica dello scatto −${p}%`,boots:p=>`Velocità di movimento +${p}%`};
const CN_RBON=[0,8,16,25];
function cnRarRoll(){if(CN.forceRar!=null)return CN.forceRar;const F=G.cnF,r=(F?F.lv:-1)+1,w=[64-4*r,24+2*r,9+1.4*r,3+.6*r];let x=Math.random()*(w[0]+w[1]+w[2]+w[3]);
  for(let i=0;i<4;i++){x-=w[i];if(x<0)return i}return 0}
const cnRar2=(s,k,lv)=>k===3&&s.max>1&&!CN_STATR[s.id]&&lv<=s.max-2;   // la leggendaria dà due livelli (lv: il livello prima della scelta)
function cnRarDesc(s,k){const st=CN_STATR[s.id];if(st)return CN_STATD[s.id](st[k]);let d=s.d;if(cnRar2(s,k,P.skills[s.id]||0))d+=' · <b>due livelli</b>';if(k>0)d+=` · <b>+${CN_RBON[k]}% danno</b>`;return d}
function cnRarDeal(){const tok=++CN.revTok;CN.rar=offer.map(s=>s.evo?-1:cnRarRoll());const btns=[...$('skList').querySelectorAll('.sk')];
  btns.forEach(b=>{const i=+b.dataset.i,s=offer[i],k=CN.rar[i];if(!s)return;if(k<0){b.classList.add('cnEvoC');return}
    b.classList.remove('r0','r1','r2');b.classList.add('cnr','cnr'+k);b.style.setProperty('--rc',CN_RAR[k].c);b.style.setProperty('--rd',CN_RAR[k].d);
    const em=b.querySelector('em.rar');if(em)em.textContent=CN_RAR[k].n;const sp=b.querySelector('div>span');if(sp)sp.innerHTML=cnRarDesc(s,k);cnEvoHint(b,s)});
  const fast=LOWFX||matchMedia('(prefers-reduced-motion: reduce)').matches;CN.revEnd=performance.now()+(fast?200:260+btns.length*360+700);
  btns.forEach((b,j)=>{const k=CN.rar[+b.dataset.i];if(k==null)return;b.classList.add('cnHid');const t0=fast?40:200+j*360;
    if(k>0&&!fast){let s=0;const spin=()=>{if(tok!==CN.revTok||!b.isConnected)return;s++;b.style.setProperty('--sc',CN_RAR[s%4].c);tone(640+s*45,640+s*45,.025,'square',.018);if(s<5+k*3)setTimeout(spin,45+s*10);else cnRarLand(b,k,tok)};
      setTimeout(()=>{if(tok!==CN.revTok)return;b.classList.add('cnSpin');spin()},t0)}
    else setTimeout(()=>cnRarLand(b,k,tok),t0)})}
// sotto le carte, le evoluzioni nuove: «Sblocca» quando questa carta la completa, «Verso» quando ne fa parte
function cnEvoHint(b,s){const div=b.querySelector('div');if(!div)return;let h=b.querySelector('.evoh');
  const mx=id=>{const B=SK.find(q=>q.id===id);return B?B.max:1},vs=CN_EVO.filter(v=>!P.skills[v.id]&&(v.base===s.id||v.with===s.id));
  const done=vs.find(v=>(P.skills[v.base]||0)+(v.base===s.id?1:0)>=mx(v.base)&&(v.with===s.id||P.skills[v.with]));
  const txt=done?`Sblocca «${done.n}»!`:vs.length?`Verso «${vs[0].n}»`:'';if(!txt){if(h)h.remove();return}
  if(!h){h=document.createElement('em');h.className='evoh';div.appendChild(h)}h.textContent=txt;h.classList.toggle('cnSoft',!done)}
function cnRarLand(b,k,tok){if(tok!=null&&tok!==CN.revTok)return;b.classList.remove('cnHid','cnSpin');b.classList.add('cnLand');
  if(k<0){tone(523,1046,.3,'triangle',.05);tone(784,1568,.4,'triangle',.04,.1);return}
  if(k===0)tone(520,620,.08,'triangle',.03);else if(k===1)tone(660,990,.12,'triangle',.045);else if(k===2){tone(660,990,.12,'triangle',.05);tone(880,1320,.16,'triangle',.045,.08)}
  else{sfx('shimmer',2);tone(523,1046,.25,'square',.04);tone(659,1318,.25,'square',.035,.06);tone(784,1568,.35,'triangle',.05,.12);b.classList.add('cnLeg')}}
function cnRarSkip(){CN.revTok++;CN.revEnd=0;$('skList').querySelectorAll('.sk').forEach(b=>{const k=CN.rar?CN.rar[+b.dataset.i]:null;if(k==null)return;b.classList.remove('cnHid','cnSpin');b.classList.add('cnLand');if(k===3)b.classList.add('cnLeg')})}
function cnRarApply(s,k,pre){const st=CN_STATR[s.id];
  if(st){const p=st[k]/100;
    if(s.id==='atk')P.atk=pre.atk*(1+p);else if(s.id==='aspd')P.aspd=pre.aspd*(1+p);else if(s.id==='crit')P.crit=pre.crit+p;
    else if(s.id==='hp'){const a=Math.round(pre.maxhp*p);P.maxhp=pre.maxhp+a;P.hp=Math.min(P.maxhp,pre.hp+a)}
    else if(s.id==='heal')P.hp=Math.min(P.maxhp,pre.hp+P.maxhp*p);else if(s.id==='dash')P.dashMax=pre.dashMax*(1-p);else if(s.id==='boots')P.spd=(pre.spd||150)*(1+p);
    return}
  if(cnRar2(s,k,pre.lv)&&(P.skills[s.id]||0)<s.max){s.f();P.skills[s.id]=(P.skills[s.id]||0)+1}
  P.atk*=1+CN_RBON[k]/100}

// ---------------------------------------------------------------- 4 evoluzioni spettacolari (come Vampire Survivors)
// un'abilità al massimo con la compagna giusta diventa una versione enorme e diversa da vedere; nella Classica nuova prendono il posto
// delle sei evoluzioni di sempre (che restano nell'Abisso e nella sfida del giorno)
const CN_EVO=[
  {id:'ev_meteore',n:'Pioggia di meteore',base:'multi',with:'fire',d:'Ogni pochi secondi tre meteore infuocate piombano sui nemici',f:()=>{P.cnMeteor=1},
    i:`${GOLDR}<path d="M31 6L17 20" stroke="#ff8a3c" stroke-width="5" stroke-linecap="round" opacity=".75"/><circle cx="15" cy="23" r="8" fill="#5a2a14" ${S2}/><circle cx="13" cy="21" r="4" fill="#ff8a3c"/><circle cx="12" cy="20" r="1.8" fill="#ffe27a"/><path d="M6 34c3-2 6-2 9 0s6 2 9 0" stroke="#ff8a3c" stroke-width="2.4" fill="none"/>`},
  {id:'ev_lancia',n:'Lancia di ghiaccio',base:'pierce',with:'ice',d:'Le frecce diventano lance che trapassano tutto e alla fine scoppiano in schegge che gelano',f:()=>{P.cnLance=1},
    i:`${GOLDR}<path d="M34 6l-9 3 6 6z" fill="#dff4ff" ${S2}/><path d="M30 10L11 29l-3-1 1-3L28 6z" fill="#9fd8ff" ${S2}/><path d="M8 32l-3 3M11 35l-2 2M5 29l-2 1" stroke="#dff4ff" stroke-width="2.4" stroke-linecap="round"/>`},
  {id:'ev_tuono',n:'Catena del tuono',base:'ric',with:'light',d:'Ogni colpo può scatenare un fulmine che salta su tre nemici e li stordisce',f:()=>{P.cnThunder=1},
    i:`${GOLDR}<path d="M22 3L10 21h8l-4 16 15-21h-8l4-13z" fill="#bfe9ff" ${S2}/><path d="M28 24l6 3M27 31l5 4M6 12l5 2" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`},
  {id:'ev_ciclone',n:'Ciclone di lame',base:'orbit',with:'dash',d:'Cinque lame enormi in un vortice; lo scatto le scaglia',f:()=>{P.storm=true;P.orbit+=2;P.cnCyclone=1},
    i:`${GOLDR}<circle cx="20" cy="20" r="13" fill="none" stroke="#9fd8ff" stroke-width="2" stroke-dasharray="4 4"/><path d="M33 20l4-7 1 10-7 5z" fill="#dfe4ea" ${S2}/><path d="M7 20l-4 7-1-10 7-5z" fill="#dfe4ea" ${S2}/><path d="M20 7l7-4-10-1-5 7z" fill="#dfe4ea" ${S2}/><circle cx="20" cy="20" r="5" fill="#2fb3a6" ${S2}/>`},
  {id:'ev_drago',n:'Freccia del drago',base:'front',with:'crit',d:'Ogni 4 secondi un drago di fuoco attraversa la stanza e trapassa tutti',f:()=>{P.cnDragon=1},
    i:`${GOLDR}<path d="M35 20c-4-6-10-8-16-7l-6-5 1 6-6 2 6 3-4 5 7-2c5 3 12 3 18-2z" fill="#ff8a3c" ${S2}/><circle cx="28" cy="18" r="1.8" fill="#191714"/><path d="M8 23c-2 3-4 5-6 6" stroke="#ffc93c" stroke-width="2.4" stroke-linecap="round"/>`},
  {id:'ev_piume',n:'Corona di piume',base:'diag',with:'side',d:"Ogni terza raffica, una corona di dodici piume d'oro tutto intorno",f:()=>{P.cnFeather=1},
    i:`${GOLDR}<path d="M20 4c5 6 6 14 0 22-6-8-5-16 0-22z" fill="#ffc93c" ${S2}/><path d="M20 8v22" stroke="#8a5a20" stroke-width="2"/><path d="M8 14c4 3 5 8 2 13M32 14c-4 3-5 8-2 13" stroke="#ffc93c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M14 34h12" stroke="#ffe27a" stroke-width="3" stroke-linecap="round"/>`}];
for(const s of SK)if(s.evo&&!s.cnEvo){const c0=s.cond;s.cond=()=>!cnRun()&&(!c0||c0())}
for(const v of CN_EVO){const B=SK.find(q=>q.id===v.base);ICON[v.id]=v.i;
  SK.push({id:v.id,evo:1,cnEvo:1,req:[v.base,v.with],n:v.n,d:v.d,max:1,f:v.f,cond:()=>cnRun()&&!P.skills[v.id]&&(P.skills[v.base]||0)>=(B?B.max:1)&&!!P.skills[v.with]})}
function cnEvoBurst(s){banner('EVOLUZIONE!',s.n,2.2);sfx('levelup');tone(392,784,.3,'square',.04);tone(523,1046,.3,'square',.04,.1);tone(659,1318,.45,'triangle',.05,.2);shake(5);vib([40,30,90]);
  G.waves.push({x:P.x,y:P.y,r:6,max:170,dmg:0,hit:true,col:'lvl'});vfxBlast(P.x,P.y-12,'255,214,90',130,{sparks:26});CN.evoT=1.6}
function cnBlast(x,y,R,k,f){G.fx.push({k:'boom',x,y,r:R,t:.35});for(const o of G.enemies){if(!canHit(o)||Math.hypot(o.x-x,o.y-y)>R+o.r)continue;hurtE(o,P.atk*k,false,true);if(f&&!o.dead)f(o)}sfx('boom',0,x)}
function cnShatter(x,y){for(const o of G.enemies){if(!canHit(o)||Math.hypot(o.x-x,o.y-y)>64+o.r)continue;hurtE(o,P.atk*.5,false,true);if(o.dead)continue;if(isBoss(o.type))o.slow=Math.max(o.slow||0,1.2);else o.frozen=Math.max(o.frozen||0,.8)}
  if(!LOWFX)for(let k=0;k<8;k++){const a=k/8*TAU+rand(-.2,.2),s=rand(140,220);CN.fx.push({k:'shard',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.7,t:.42,max:.42,rot:rand(0,6)})}
  fxPush({k:'flash',x,y,rgb:'170,230,255',r:48,t:.18,max:.18});if(G.t-(CN.shS==null?-9:CN.shS)>.12){CN.shS=G.t;sfx('glass',0,x)}}
function cnThunder(e){CN.inTh=true;try{let from=e;const hit=new Set([e]);for(let j=0;j<3;j++){let b=null,bd=170;for(const o of G.enemies){if(!canHit(o)||hit.has(o))continue;const d=Math.hypot(o.x-from.x,o.y-from.y);if(d<bd){bd=d;b=o}}if(!b)break;hit.add(b);
    G.fx.push({k:'bolt',x:from.x,y:from.y-from.r,x2:b.x,y2:b.y-b.r,t:.25,max:.25});G.fx.push({k:'flash',x:b.x,y:b.y-b.r,rgb:'170,220,255',r:30,t:.16,max:.16});hurtE(b,P.atk*.6,false,true);if(!b.dead&&!isBoss(b.type))b.daze=Math.max(b.daze||0,.35);from=b}
  if(hit.size>1&&G.t-(CN.thS==null?-9:CN.thS)>.3){CN.thS=G.t;sfx('thunder',0,e.x)}}finally{CN.inTh=false}}
function cnEvoTick(dt){
  if(P.cnMeteor){CN.metT=(CN.metT==null?1:CN.metT)-dt;if(CN.metT<=0&&G.state==='play'){const T=G.enemies.filter(canHit).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y)).slice(0,3);
    if(T.length){CN.metT=2.6;T.forEach((e,j)=>{const m=.75+j*.12;CN.fx.push({k:'meteor',e,x:e.x,y:e.y,t:m,max:m})});tone(300,90,.5,'sawtooth',.03)}else CN.metT=.5}}
  if(P.cnDragon){CN.drT=(CN.drT==null?2:CN.drT)-dt;if(CN.drT<=0&&G.state==='play'){const e=nearest(P.x,P.y);if(e){CN.drT=4;const a=Math.atan2(e.y-e.r-(P.y-10),e.x-P.x);CN.dr.push({x:P.x,y:P.y-10,a,t:0,hit:new Set(),tr:[]});sfx('roar');tone(160,70,.45,'sawtooth',.05)}else CN.drT=.5}}
  for(const d of CN.dr){d.t+=dt;d.x+=Math.cos(d.a)*540*dt;d.y+=Math.sin(d.a)*540*dt;d.tr.push([d.x,d.y]);if(d.tr.length>16)d.tr.shift();
    for(const e of G.enemies){if(!canHit(e)||d.hit.has(e))continue;if(Math.hypot(e.x-d.x,e.y-e.r-d.y)<e.r+24){d.hit.add(e);hurtE(e,P.atk*3*(P.critMul||2),true);fxPush({k:'flash',x:e.x,y:e.y-e.r,rgb:'255,180,80',r:36,t:.16,max:.16})}}
    if(d.x<L-60||d.x>R+60||d.y<TOP-80||d.y>BOT+60||d.t>2.4)d.dead=1}
  if(CN.dr.length)CN.dr=CN.dr.filter(d=>!d.dead);
  if(CN.lances.length)for(let i=CN.lances.length-1;i>=0;i--){const q=CN.lances[i];if(G.arrows.includes(q))continue;CN.lances.splice(i,1);cnShatter(q.x,q.y)}
  if(CN.evoT>0)CN.evoT-=dt}

// ---------------------------------------------------------------- 5 la Nemesi (come Shadow of Mordor e le invasioni di Dark Souls)
// chi ti uccide si prende l'oro della partita e diventa la tua Nemesi (al massimo tre): un nome, un titolo, i poteri delle élite, buffa o
// spavalda. In una stanza a caso della partita d'arena la più ricercata invade col tuo sacco sulle spalle e ti prende in giro; battila e ti riprendi l'oro più
// la taglia in cristalli; se ti batte ancora diventa più forte e si tiene tutto. Se ti uccide un custode, è lui a tenersi l'oro.
const CN_NEMN=['Grugno','Zanna','Muffo','Brodo','Ciuffo','Sgorbio','Ghigno','Scheggia','Spillo','Torvo','Fango','Ossobuco','Brontolo','Graffio','Rospone','Mastino','Pustola','Brufolo'];
const CN_NEMT={buffa:['il Prepotente','lo Sbruffone','il Dispettoso','il Mangiamonete','il Furbetto','dai Piedi Puzzolenti','il Ruttone','il Ladruncolo'],
  spavalda:['il Senza Pietà','il Macellaio','il Cacciatore di Eroi','il Tagliagole','dalla Zanna Nera','dagli Occhi Rossi',"l'Ombra che Ride",'lo Spezzaossa']};
const CN_NEML={
  buffa:{invade:['Toc toc! Chi è? La tua Nemesi!','Ehi! Ho ancora il tuo oro, nyeh nyeh!','Sono tornato! Ti sono mancato?'],
    hit:['Preso! Che lumacone!','Ahia! Ah no, ahia per te!','Troppo lento, troppo lento!'],hurt:['Ehi! Così non vale!','Non sulla faccia!','Mammaaa!'],
    low:['Aspetta aspetta, facciamo pace?','Era uno scherzo! Giuro!'],wins:['Evviva! Il tuo oro è mio! Nyeh!','Balla con me, perdente!','Grazie per l\'oro, eh!'],
    beaten:['Nooo, il mio sacco d\'oro!','Me la paghi… la prossima volta!']},
  spavalda:{invade:['Sei tornato. Bene. Avevo ancora fame.','Il tuo oro pesa. Vieni a riprendertelo.','Ti stavo aspettando, eroe.'],
    hit:['Debole.','Sanguini già?','Questo è niente.'],hurt:['Tutto qui?','Ti farò pagare anche questo.','Un graffio.'],
    low:['Non… è… finita.','Finiscimi, se ne hai il coraggio.'],wins:["In ginocchio. Come l'altra volta.",'Il tuo oro, la tua gloria: miei.','Nessuno sfugge a me.'],
    beaten:['Impossibile…','Questa volta… hai vinto tu.']}};
const cnNemFull=n=>n.name+' '+n.title;
const cnNemBounty=n=>5+5*n.lvl;
function cnNemNew(type){const tn=Math.random()<.5?'buffa':'spavalda';return{id:'n'+Date.now().toString(36)+randi(0,999),type,name:pk(CN_NEMN),title:pk(CN_NEMT[tn]),tone:tn,lvl:1,afx:[pk(Object.keys(CN_AFX))],gold:0,wins:0}}
function cnNemWanted(){const L=cnS().nem.filter(n=>ET[n.type]&&!isBoss(n.type));return L.sort((a,b)=>b.gold-a.gold||b.lvl-a.lvl)[0]||null}
// la voce: sillabe finte fatte col codice, acute e saltellanti per le buffe, basse e strascicate per le spavalde
function cnVoice(tn,len){if(!AU.ctx||!AU.on.sfx)return;const n=clamp(Math.round(len/4),3,9);for(let i=0;i<n;i++){if(tn==='buffa'){const f=rand(420,780);tone(f,f*rand(.8,1.3),.06,i%2?'square':'triangle',.026,i*.075)}else{const f=rand(95,170);tone(f,f*rand(.7,.95),.09,'sawtooth',.04,i*.1)}}}
function cnNemTalk(e,k,force){if(!e||!e.cnTone)return;const now=G.t||0;if(!force&&now-(e.cnSayT==null?-9:e.cnSayT)<2.6)return;const L=CN_NEML[e.cnTone][k];if(!L)return;e.cnSayT=now;const txt=pk(L);
  CN.bub=CN.bub.filter(b=>b.e!==e);CN.bub.push({e,x:e.x,y:e.y,txt,t:2.6,max:2.6});cnVoice(e.cnTone,txt.length)}
// chi ha colpito l'eroe: il nemico che si stava muovendo (N3G.cur) o il colpo più vicino, che porta chi l'ha tirato (cnSrc)
function cnProjSrc(){let b=null,bd=1e9;for(const p of G.eproj){if(!p.cnSrc)continue;const d=Math.hypot(P.x-p.x,P.y-6-p.y);if(d<bd){bd=d;b=p}}return b&&bd<P.r+(b.r||5)+16?b.cnSrc:null}
function cnNemOnDeath(){const H=G.cnLastHit;let k=H&&G.t-H.t<3?H.e:null;
  // un colpo senza autore (onde, pericoli, colpi ad area dei custodi): il nemico più vicino, se no il custode della stanza
  if(!k){let bd=280;for(const e of G.enemies){if(e.dead||e.spawn>0||isBoss(e.type))continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;k=e}}
    if(!k)k=G.enemies.find(e=>isBoss(e.type)&&!e.dead)||null}
  if(!k){G.cnKiller=null;return}
  G.cnKiller={type:k.type,boss:isBoss(k.type),nem:k.cnNem||null};if(isBoss(k.type))return;
  if(!k.cnNem){const n=cnNemNew(k.type);G.cnNewNem=n;k.cnName=cnNemFull(n);k.cnTone=n.tone;k.cnNewN=1}else G.cnNewNem=null;
  if(!k.dead){k.cnDance=1;cnNemTalk(k,'wins',true)}
  if(k.cnTone==='spavalda')cnBlood()}
function cnNemCommit(gold){const S=cnS(),K=G.cnKiller;if(!K)return{kind:'lost',gold};
  if(K.boss){S.bossGold[K.type]=(S.bossGold[K.type]||0)+gold;return{kind:'boss',type:K.type,gold}}
  let n=K.nem?S.nem.find(q=>q.id===K.nem):null;
  if(n){n.lvl=Math.min(5,n.lvl+1);n.gold+=gold;n.wins++;if(n.afx.length<3){const free=Object.keys(CN_AFX).filter(k=>!n.afx.includes(k));n.afx.push(pk(free))}return{kind:'up',n,gold}}
  n=G.cnNewNem||cnNemNew(K.type);n.gold+=gold;n.wins=1;n.d=Date.now();
  if(S.nem.length>=3){S.nem.sort((a,b)=>b.gold-a.gold);S.nem.length=2}S.nem.push(n);return{kind:'new',n,gold}}
// la più ricercata invade una stanza a caso della partita d'arena (dalla 3 alla 8, mai i Campioni né il custode; dopo un evento, la stanza dopo)
function cnNemPlan(){const n=cnNemWanted();G.cnNem=n?{id:n.id,r:pk([3,4,6,7,8]),done:false}:null}
function cnNemCheck(){const M=G.cnNem;if(!M||M.done||G.cnA==null||G.event||G.room<M.r||isBossRoom(G.room)||champRoom()||cnNoNem())return;M.done=true;cnNemInvade()}
function cnNemInvade(){const n=cnS().nem.find(q=>q.id===(G.cnNem&&G.cnNem.id));if(!n||!ET[n.type])return;const s=cnSpot(ET[n.type].r);
  CN.fx.push({k:'portal',x:s.x,y:s.y,t:1.6,max:1.6,n});sfx('roar');shake(3);cnRed();banner('Invasione!',`«${cnNemFull(n)}» è tornato per te`,2.6)}
function cnNemSpawn(n,x,y){const e=makeE(n.type,x,y,1.1,true);e.max*=1.4+.45*n.lvl;e.hp=e.max;cnGiveAfx(e,0,n.afx.slice());e.r=Math.round(e.r*1.1);e.gold=(e.gold||1)*2;
  Object.assign(e,{cnNem:n.id,cnTone:n.tone,cnName:cnNemFull(n),cnLvl:n.lvl,cnSack:n.gold,cnBig:1,cnSayQ:'invade'});G.enemies.push(e)}
function cnNemDown(e){const S=cnS(),n=S.nem.find(q=>q.id===e.cnNem);if(!n)return;S.nem=S.nem.filter(q=>q!==n);
  S.nemOut.unshift({name:n.name,title:n.title,type:n.type,tone:n.tone,lvl:n.lvl,gold:n.gold,d:Date.now()});S.nemOut=S.nemOut.slice(0,8);
  const gems=cnNemBounty(n),deco=Math.min(24,n.gold);CN.gSkip+=n.gold-deco;G.gold+=n.gold-deco;
  for(let i=0;i<deco;i++){const a=rand(0,TAU),s=rand(60,200);G.coins.push({x:e.x,y:e.y-10,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:-.1,gr:1})}
  G.gemsRun=(G.gemsRun||0)+gems;banner('Nemesi sconfitta!',`Ti riprendi ${n.gold} oro e ${gems} cristalli`,2.8);
  CN.bub.push({e:null,x:e.x,y:e.y-e.r*2-40,txt:pk(CN_NEML[n.tone].beaten),t:2.4,max:2.4});cnVoice(n.tone,22);
  sfx('victory');shake(5);vib([40,30,80]);vfxBlast(e.x,e.y-14,'255,214,90',110,{sparks:24});if(n.tone==='spavalda')for(let i=0;i<5;i++)G.decals.push({x:e.x+rand(-22,22),y:e.y+rand(-8,10),r:rand(4,9),col:'#5e0b0b',seed:Math.random()*9});save()}
function cnBossGoldBack(type){const S=cnS(),g=S.bossGold[type];if(!g)return;delete S.bossGold[type];CN.gSkip+=g;G.gold+=g;text(P.x,P.y-64,'+'+g+' oro ripreso','#ffd84a',18);sfx('coin');save()}
function cnRed(){cnEnsure();const s=$('cnRed');s.classList.remove('on');void s.offsetWidth;s.classList.add('on')}
function cnBlood(){cnEnsure();const s=$('cnSlash');s.classList.remove('on');void s.offsetWidth;s.classList.add('on');
  for(let i=0;i<4;i++)G.decals.push({x:P.x+rand(-18,18),y:P.y+rand(-6,10),r:rand(4,9),col:'#5e0b0b',seed:Math.random()*9})}
// il ritratto per i manifesti: il modello 3D del nemico disegnato in una tela sua
function cnPortrait(cv,type,tn){const c=cv.getContext('2d'),W=cv.width,H=cv.height,saved=ctx,ns=noShadow;c.setTransform(1,0,0,1,0,0);
  const g=c.createRadialGradient(W/2,H*.45,4,W/2,H*.5,W*.7);g.addColorStop(0,tn==='spavalda'?'#5a2a20':'#4a5a34');g.addColorStop(1,'#1a1410');c.fillStyle=g;c.fillRect(0,0,W,H);
  try{ctx=c;noShadow=true;const M=N3&&N3.meta?N3.meta[type]:null;if(N3&&N3[type]&&!(N3G&&N3G.bad[type])){const sc=H/(ET[type]&&ET[type].r>16?78:58)*(M&&M.sc||1);c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(W/2,H*.9,W*.26,H*.06,0,0,TAU);c.fill();N3[type](W/2,H*.9,Math.PI/2,'idle',.3,sc,{noFx:true})}
    else{c.fillStyle=ECOL[type]||'#7bbf4a';c.beginPath();c.arc(W/2,H*.6,H*.25,0,TAU);c.fill()}}catch(err){cnErr(err)}finally{ctx=saved;noShadow=ns}
  if(tn==='spavalda'){c.fillStyle='rgba(110,12,12,.85)';for(let i=0;i<7;i++){const x=W*(.72+.2*Math.sin(i*2.1)),y=H*(.14+.1*Math.cos(i*1.7));c.beginPath();c.arc(x,y,2+((i*7)%5),0,TAU);c.fill()}}}

// ---------------------------------------------------------------- disegni sul pavimento e in aria
function cnDrawGround(){const t=G.t;
  for(const f of CN.fx){const a=clamp(f.t/f.max,0,1);
    if(f.k==='fire'){const fl=Math.min(1,f.t*2);if(!LOWFX)glow('255,130,50',f.x,f.y,f.r*1.7,.24*fl);ctx.fillStyle=`rgba(90,30,10,${.4*fl})`;ell(f.x,f.y,f.r,f.r*.45);ctx.fill();
      if(OB3.on&&!LOWFX){for(let i=0;i<2;i++)flame(f.x+(i?.5:-.5)*f.r*.6,f.y+1,.34*fl,O3FIRE,f.x*.1+i*2.7)}
      else for(let i=0;i<3;i++){const ph=t*7+i*2.1+f.x*.1,hx=f.x+(i-1)*f.r*.45,hh=(6+3*Math.sin(ph))*fl;ctx.fillStyle=i%2?'#ffc93c':'#ff8a3c';ctx.beginPath();ctx.moveTo(hx-3.4,f.y);ctx.quadraticCurveTo(hx+Math.sin(ph)*2,f.y-hh*1.7,hx+3.4,f.y);ctx.fill()}}
    else if(f.k==='meteor'){const p=1-a,x=f.e&&!f.e.dead?f.e.x:f.x,y=f.e&&!f.e.dead?f.e.y:f.y,r=12+26*p;ctx.strokeStyle=`rgba(255,110,50,${.25+.55*p})`;ctx.lineWidth=2.5;ell(x,y+4,r,r*.45);ctx.stroke();ctx.fillStyle=`rgba(40,10,0,${.25*p})`;ell(x,y+4,r*.8,r*.36);ctx.fill()}
    else if(f.k==='scorch'){ctx.fillStyle=`rgba(40,18,8,${.45*a})`;ell(f.x,f.y+3,f.r,f.r*.45);ctx.fill();if(!LOWFX&&a>.6){glow('255,120,40',f.x,f.y,f.r,.2*(a-.6)/.4)}}
    else if(f.k==='bomb'){const p=1-a,bl=Math.sin(t*(10+p*22))>0;ctx.save();ctx.fillStyle=`rgba(255,70,40,${.08+.2*p})`;ell(f.x,f.y,f.r,f.r*.55);ctx.fill();ctx.strokeStyle=`rgba(255,${bl?220:90},70,.85)`;ctx.lineWidth=2.5;ctx.setLineDash([6,5]);ell(f.x,f.y,f.r,f.r*.55);ctx.stroke();ctx.setLineDash([]);ctx.restore();
      {ctx.save();const K=proCam(OB3.face,f.x,f.y+1,1),{V0}=K;C3.sball(V0,[0,0,8],8,'#3b332b',{lw:2.4,kl:.45,kd:.4,rim:.3});pRound(K,OQ(3.5,-1,13),[[0,2.6],[2.4,2.4]],'#6a6258',{m:10,lw:1.4});
        const e=oStem(V0,OQ(3.5,-1,15.4),OQ(8,-2,22),OQ(12,0,19),'#8a5a20',1.6).pop();if(bl&&!LOWFX)glow('255,220,120',e[0],e[1],8,.9);ctx.fillStyle='#ffe27a';ctx.beginPath();ctx.arc(e[0],e[1],2.2,0,TAU);ctx.fill();ctx.restore()}}
    else if(f.k==='portal'){const p=1-a,s=Math.sin(Math.min(1,p*2.2)*Math.PI/2)*(a<.15?a/.15:1),r=40*s;if(r<1)continue;ctx.save();if(!LOWFX){ctx.globalCompositeOperation='lighter';glow('220,40,40',f.x,f.y,r*2,.5*s);ctx.globalCompositeOperation='source-over'}
      ctx.fillStyle='rgba(20,0,0,.85)';ell(f.x,f.y,r,r*.45);ctx.fill();ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(255,${60+i*40},60,${.7-.15*i})`;ctx.beginPath();ctx.ellipse(f.x,f.y,r*(1-i*.22),r*.45*(1-i*.22),0,t*(3+i)+i,t*(3+i)+i+4.2);ctx.stroke()}ctx.restore()}}
  for(const e of G.enemies){if(!(e.cnAfx||e.cnName)||e.dead||e.spawn>0||e.hidden)continue;
    if(e.cnBig){ctx.strokeStyle=e.cnNem?'rgba(220,50,50,.6)':'rgba(255,201,60,.6)';ctx.lineWidth=3;ell(e.x,e.y+4,e.r*1.7,e.r*.7);ctx.stroke()}
    if(e.cnGel){ctx.save();ctx.fillStyle='rgba(200,240,255,.07)';ell(e.x,e.y+4,64,53);ctx.fill();ctx.strokeStyle='rgba(200,240,255,.5)';ctx.lineWidth=2;ctx.setLineDash([3,6]);ctx.lineDashOffset=t*10;ell(e.x,e.y+4,64,53);ctx.stroke();ctx.setLineDash([]);ctx.restore()}
    if(e.cnFur&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,80,50',e.x,e.y,e.r*1.8,.22+.08*Math.sin(t*9));ctx.restore()}}
  if(P.cnCyclone&&G.state==='play'){ctx.save();ctx.lineWidth=3;for(let i=0;i<3;i++){const a0=t*(4+i)+i*2.1;ctx.strokeStyle=`rgba(190,235,255,${.28-.06*i})`;ctx.beginPath();ctx.ellipse(P.x,P.y-6,62-i*9,(62-i*9)*.8,0,a0,a0+2.2);ctx.stroke()}ctx.restore()}}
function cnDrawMeteor(f){const p=1-f.t/f.max,x=f.e&&!f.e.dead?f.e.x:f.x,y=f.e&&!f.e.dead?f.e.y:f.y,sx=x+130*(1-p),sy=y-340*(1-p)-8;ctx.save();
  if(!LOWFX){ctx.globalCompositeOperation='lighter';for(let i=1;i<=5;i++){const q=Math.min(1,1-p+i*.05);glow('255,140,50',x+130*q,y-340*q-8,14-i,.3)}glow('255,200,90',sx,sy,26,.8);ctx.globalCompositeOperation='source-over'}
  const K=proCam(OB3.face+p*6,sx,sy+8,1),{V0}=K;oRock(K,[0,0,-8],9,8.5,16,'#5a2a14',f.max*7,{small:1,lw:2.2});const a0=oFront(V0);
  for(const[da,e,r,c] of[[.5,.9,4.2,'#ff8a3c'],[-.4,.5,3,'#ff8a3c'],[.6,1,2,'#ffe27a']]){const q=oDome([0,0,-8],9,8.5,16,a0+da,e),n=C3.nrm([q[0],q[1],(q[2]+8)*.6]);C3.spot(V0,q,n,r,c)}ctx.restore()}
function cnDrawDragon(d){ctx.save();const n=d.tr.length;
  if(!LOWFX){ctx.globalCompositeOperation='lighter';for(let i=0;i<n;i+=2){const[x,y]=d.tr[i],k=i/n;glow('255,140,50',x,y,10+18*k,.12+.25*k)}ctx.globalCompositeOperation='source-over'}
  for(let i=0;i<n;i+=2){const[x,y]=d.tr[i],k=i/n;ctx.fillStyle=`rgba(255,${(150+80*k)|0},60,${(.3+.5*k).toFixed(2)})`;circ(x,y,3+7*k);ctx.fill()}
  const K=proCam(OB3.face,d.x,d.y+14,1),{V0}=K,f=cnGQ(Math.cos(d.a),Math.sin(d.a),0),fl=Math.hypot(f[0],f[1])||1,u=[f[0]/fl,f[1]/fl,0],s=[-u[1],u[0],0],t=G.t,
    at=(k,w,z)=>[u[0]*k+s[0]*w,u[1]*k+s[1]*w,14+(z||0)],sp=[],rs=[];
  for(let i=0;i<7;i++){const k=-i*5.5,w=Math.sin(t*12-i*.9)*i*.7;sp.push(at(k,w,-i*.4));rs.push(Math.max(1.2,5.6-i*.7))}
  const wing=sd=>{const fl2=Math.sin(t*18)*.9;C3.leaf(V0,at(-4,sd*3,1),[s[0]*sd,s[1]*sd,fl2],[u[0],u[1],0],15,6,'#ff9a3c',{lw:1.6,bend:.4,back:'#c84a1a'})};
  const far=V0.F(s)>0?-1:1;wing(far);C3.chain(V0,sp.slice().reverse(),rs.slice().reverse(),'#e0441a',{lw:2,kl:.45,kd:.35});
  const hd=at(5,0,1.5);C3.caps(V0,at(-1,0,.5),4.6,hd,4.2,'#f0662a',{lw:2,kl:.5,kd:.3});C3.caps(V0,hd,3.8,at(10,0,.5),2.6,'#ffb050',{lw:1.8,kl:.5,kd:.3});
  for(const sd of[-1,1])C3.caps(V0,at(3,sd*2.4,5),1.4,at(-3,sd*4.4,10),.3,'#fff1c8',{lw:1.2,noRim:1});
  const ey=at(6.5,far*-2.6,3.4);C3.sball(V0,ey,1.9,'#fff6c8',{lw:.9,kl:.3,kd:.2,rim:.1});const e2=V0.P(ey);ctx.fillStyle='#191714';ctx.beginPath();ctx.arc(e2[0]+.6,e2[1],1,0,TAU);ctx.fill();
  wing(-far);ctx.restore()}
function cnDrawAir(){const t=G.t;
  for(const f of CN.fx){
    if(f.k==='star'){const p=1-f.t/f.max,e=f.e,x=e?e.x:f.x,y=(e?e.y-e.r:f.y)-4,sx=x+90*(1-p),sy=y-280*(1-p);
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,230,140,.45)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(sx+46,sy-140);ctx.lineTo(sx,sy);ctx.stroke();glow('255,230,140',sx,sy,24,.8);ctx.restore();
      ctx.save();const K=proCam(OB3.face+t*6,sx,sy+8,1),pr=[];for(let k=0;k<10;k++){const r=k%2?3.6:8.4,a=-k*Math.PI/5+Math.PI/2;pr.push([Math.cos(a)*r,8+Math.sin(a)*r])}
      oExtrude(K,[0,0,0],pr,3.2,'#ffe27a',{lw:1.8,ew:.4,cf:n=>Math.abs(n[0])>.9?'#fff1a8':'#e0a830'});ctx.restore()}
    else if(f.k==='meteor')cnDrawMeteor(f);
    else if(f.k==='shard'){const a=f.t/f.max;ctx.save();ctx.translate(f.x,f.y-8);ctx.rotate(f.rot+t*9);ctx.globalAlpha=a;ink(1.4);ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(2.6,2);ctx.lineTo(-2.6,2);ctx.closePath();fs('#dff4ff');ctx.restore()}
    else if(f.k==='ember'){const a=f.t/f.max;ctx.fillStyle=`rgba(255,${(140+90*a)|0},60,${a.toFixed(2)})`;circ(f.x,f.y,1.8+a);ctx.fill()}}
  for(const d of CN.dr)cnDrawDragon(d);
  if(CN.evoT>0){const a=Math.min(1,CN.evoT/1.6);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(0,P.y-230,0,P.y);g.addColorStop(0,'rgba(255,214,90,0)');g.addColorStop(1,`rgba(255,214,90,${(.55*a).toFixed(2)})`);ctx.fillStyle=g;ctx.fillRect(P.x-26,P.y-230,52,232);ctx.restore()}}
{const _do=drawOrbs;drawOrbs=function(){if(CN.on&&G&&P)try{cnDrawGround()}catch(err){cnErr(err)}return _do.apply(this,arguments)}}
{const _db=drawBoulders;drawBoulders=function(){const r=_db.apply(this,arguments);if(CN.on&&G&&P)try{cnDrawAir()}catch(err){cnErr(err)}return r}}
// sopra a tutto: la bolla dello scudo, i nomi dei poteri e delle Nemesi sopra la barra, la corona, le frasi delle Nemesi
function cnDrawAfx(){ctx.save();ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.lineJoin='round';
  for(const e of G.enemies){if(!(e.cnAfx||e.cnName)||e.dead||e.hidden||e.spawn>0||e.intro>0)continue;const fly=e.type==='bat'||e.type==='wisp'||e.type==='mosquito'||e.type==='snowspirit',w=Math.max(22,e.r*2)*1.3,hy=e.y-e.r*2-e.z-14-(fly?12:0)-(e.cnBig?e.r*.36:0);
    if(e.cnSh>0){const k=e.cnSh/e.cnShM,cy=e.y-e.r*.95-e.z;ctx.save();ctx.globalAlpha=.14+.16*k+(e.cnShF>0?.3:0);ctx.fillStyle='#8fdcff';ell(e.x,cy,e.r*1.5,e.r*1.7);ctx.fill();
      ctx.globalAlpha=.45+.35*k;ctx.strokeStyle='#e4f6ff';ctx.lineWidth=2;ell(e.x,cy,e.r*1.5,e.r*1.7);ctx.stroke();ctx.restore();ctx.fillStyle='#8fdcff';ctx.fillRect(e.x-w/2,hy-3,w*k,2.5)}
    ctx.font='11px "Lilita One", sans-serif';
    if(e.cnRegOn){ctx.fillStyle='#b8f08a';ctx.fillText('+',e.x+e.r*.9,hy-2-((G.t*30+e.x)%14))}
    let ty=hy-6;if(e.cnAfx){const A=e.cnAfx.map(k=>CN_AFX[k]),ws=A.map(a=>ctx.measureText(a.n).width),gap=9,tw=ws.reduce((s,v)=>s+v,0)+gap*(A.length-1);let x=e.x-tw/2;
      for(let i=0;i<A.length;i++){const cx=x+ws[i]/2;ctx.lineWidth=3.2;ctx.strokeStyle=INK;ctx.strokeText(A[i].n,cx,ty);ctx.fillStyle=A[i].c;ctx.fillText(A[i].n,cx,ty);x+=ws[i]+gap;
        if(i<A.length-1){ctx.fillStyle='#e6dcc0';ctx.beginPath();ctx.arc(x-gap/2,ty-4,1.6,0,TAU);ctx.fill()}}ty-=15}
    if(e.cnName){ctx.font='12px "Lilita One", sans-serif';const nm=e.cnName+(e.cnLvl>1?' '+'★'.repeat(e.cnLvl):''),nw=ctx.measureText(nm).width+16,px=clamp(e.x,Math.max(L,G.vx||0)+nw/2+2,Math.min(R,(G.vx||0)+VW)-nw/2-2);
      cnRR(px-nw/2,ty-12,nw,16,5);ctx.fillStyle=e.cnTone==='spavalda'?'rgba(96,12,12,.94)':'rgba(70,46,14,.94)';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#ffd84a';ctx.fillText(nm,px,ty);
      if(e.cnNewN&&G.state==='dead'){ctx.font='10px "Lilita One", sans-serif';ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.strokeText('NUOVA NEMESI',px,ty-16);ctx.fillStyle='#ff6a5a';ctx.fillText('NUOVA NEMESI',px,ty-16)}ty-=18}
    if(e.cnBig&&!e.cnNem){const cx=e.x,cy=ty-6;ink(2);ctx.beginPath();ctx.moveTo(cx-10,cy+5);ctx.lineTo(cx-11,cy-5);ctx.lineTo(cx-5,cy);ctx.lineTo(cx,cy-8);ctx.lineTo(cx+5,cy);ctx.lineTo(cx+11,cy-5);ctx.lineTo(cx+10,cy+5);ctx.closePath();fs('#ffc93c')}}
  ctx.restore();cnDrawBubbles()}
function cnDrawBubbles(){if(!CN.bub.length)return;ctx.save();ctx.font='12px "Lilita One", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  for(const b of CN.bub){const e=b.e,al=Math.min(1,b.t*3,(b.max-b.t)*6);if(al<=0)continue;if(e&&!e.dead){b.x=e.x;b.y=e.y-e.r*2-e.z-(e.cnName?(e.cnAfx?70:54):40)-(e.cnBig?e.r*.36:0)}
    const lines=cnWrap(b.txt,150),w=Math.max(...lines.map(l=>ctx.measureText(l).width))+18,h=lines.length*15+10,v0=Math.max(L,G.vx||0),v1=Math.min(R,(G.vx||0)+VW),bx=clamp(b.x,v0+w/2+4,v1-w/2-4),by=Math.max((G.vy||0)+h/2+70,b.y-h/2);
    ctx.globalAlpha=al;cnRR(bx-w/2,by-h/2,w,h,8);ctx.fillStyle='#fff8e6';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke();
    ctx.beginPath();ctx.moveTo(clamp(b.x,bx-w/2+10,bx+w/2-10)-5,by+h/2-1);ctx.lineTo(clamp(b.x,bx-w/2+10,bx+w/2-10),by+h/2+8);ctx.lineTo(clamp(b.x,bx-w/2+10,bx+w/2-10)+6,by+h/2-1);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#fff8e6';ctx.fillRect(clamp(b.x,bx-w/2+10,bx+w/2-10)-4,by+h/2-3,9,3);
    ctx.fillStyle='#2a1d12';lines.forEach((l,i)=>ctx.fillText(l,bx,by-h/2+12+i*15))}
  ctx.restore()}
function cnDrawSack(e){const s=8+Math.min(7,Math.log2(1+e.cnSack/40)*1.6),x=e.x+e.r*.95,y=e.y-e.r*.7-e.z+Math.sin(G.t*6+e.x)*1.5;
  ink(2);ctx.beginPath();ctx.moveTo(x-s*.55,y-s*.75);ctx.quadraticCurveTo(x-s*1.05,y+s*.6,x,y+s*.75);ctx.quadraticCurveTo(x+s*1.05,y+s*.6,x+s*.55,y-s*.75);ctx.closePath();fs('#a0642a');
  ctx.fillStyle='#ffd84a';circ(x-s*.25,y-s*.86,s*.2);ctx.fill();circ(x+s*.22,y-s*.92,s*.17);ctx.fill();
  ctx.strokeStyle='#5a3a1a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-s*.5,y-s*.6);ctx.lineTo(x+s*.5,y-s*.6);ctx.stroke();
  ctx.fillStyle='#ffc93c';circ(x,y+s*.12,s*.3);ctx.fill();ink(1.2);ctx.stroke()}
function cnDrawArrowX(a){if(a.tr)drawTrail(a,a.cnK==='lance'?'180,230,255':'255,214,110',a.cnK==='lance'?5:3);ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.a);
  if(a.cnK==='lance'){if(!LOWFX){ctx.globalCompositeOperation='lighter';glow('150,220,255',0,0,20,.45);ctx.globalCompositeOperation='source-over'}
    const g=ctx.createLinearGradient(-24,0,16,0);g.addColorStop(0,'rgba(190,235,255,.2)');g.addColorStop(.4,'#bfeaff');g.addColorStop(1,'#ffffff');
    ink(2);ctx.beginPath();ctx.moveTo(17,0);ctx.lineTo(4,-4.6);ctx.lineTo(-20,-2.6);ctx.lineTo(-25,0);ctx.lineTo(-20,2.6);ctx.lineTo(4,4.6);ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-16,0);ctx.stroke()}
  else{ctx.strokeStyle='#8a5a20';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(8,0);ctx.stroke();ink(1.6);ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(4,-3.2);ctx.lineTo(4,3.2);ctx.closePath();fs('#fff1c8');
    ctx.beginPath();ctx.moveTo(-3,0);ctx.quadraticCurveTo(-10,-8,-17,-5);ctx.lineTo(-12,0);ctx.lineTo(-17,5);ctx.quadraticCurveTo(-10,8,-3,0);ctx.closePath();ink(1.4);fs('#ffc93c');
    if(!LOWFX&&Math.sin(G.t*20+a.x)>.6){ctx.fillStyle='#fff6c8';circ(-8,rand(-4,4),1.4);ctx.fill()}}
  ctx.restore()}

// ---------------------------------------------------------------- avvolgimenti dei nemici, dei colpi, dei danni e delle uccisioni
{const _ue=updEnemy;updEnemy=function(e,dt){if(CN.on&&e.cnSayQ&&!(e.spawn>0)){const k=e.cnSayQ;e.cnSayQ=null;cnNemTalk(e,k,true)}
  return _ue.call(this,e,CN.on&&e.cnFur&&!(e.spawn>0)&&!(e.frozen>0)?dt*1.4:dt)}}
{const _de=drawEnemy;drawEnemy=function(e){if(!CN.on||!e||!(e.cnBig||e.cnSack!=null||e.cnDance))return _de.apply(this,arguments);ctx.save();
  try{if(e.cnBig){ctx.translate(e.x,e.y);ctx.scale(1.18,1.18);ctx.translate(-e.x,-e.y)}
    if(e.cnDance&&G.state==='dead'){const t=G.t*9;ctx.translate(e.x,e.y);ctx.rotate(Math.sin(t)*.16);ctx.translate(-e.x,-e.y-Math.abs(Math.sin(t))*7)}
    const r=_de.apply(this,arguments);if(e.cnSack!=null&&!(e.spawn>0))cnDrawSack(e);return r}finally{ctx.restore()}}}
{const _sf=shadowFor;shadowFor=function(e){if(e&&e.cnBig&&CN.on){ctx.save();ctx.translate(e.x,e.y);ctx.scale(1.18,1.18);ctx.translate(-e.x,-e.y);try{return _sf.apply(this,arguments)}finally{ctx.restore()}}return _sf.apply(this,arguments)}}
{const _dbr=drawBars;drawBars=function(){const r=_dbr.apply(this,arguments);if(CN.on&&G)try{cnDrawAfx()}catch(err){cnErr(err)}return r}}
// ogni colpo nemico sa chi l'ha tirato: serve a sapere chi ti ha ucciso
{const _sh=shootE;shootE=function(){const n0=G&&G.eproj?G.eproj.length:0;const r=_sh.apply(this,arguments);try{const e=N3G.cur;if(e&&G&&G.eproj)for(let i=n0;i<G.eproj.length;i++)if(!G.eproj[i].cnSrc)G.eproj[i].cnSrc=e}catch(err){}return r}}
{const _hp=hurtP;hurtP=function(d){if(!CN.on||!G||!P)return _hp.apply(this,arguments);
  if(P.cnPiuma&&!G.cnBlocked&&!(P.inv>0)&&!(P.dashT>0)&&G.state==='play'&&d>0&&!INTRO.on){G.cnBlocked=true;P.inv=.7;text(P.x,P.y-42,'Parato!','#f6ead2',15);sfx('block');return}
  const run=cnRun(),hp0=P.hp,wasDead=G.state==='dead',src=run?(N3G.cur||cnProjSrc()):null;const r=_hp.apply(this,arguments);
  try{if(run&&P.hp<hp0){if(src)G.cnLastHit={e:src,t:G.t};cnFuHit();if(src&&src.cnNem&&!src.dead&&P.hp>0)cnNemTalk(src,'hit')}
    if(run&&G.state==='dead'&&!wasDead)cnNemOnDeath()}catch(err){cnErr(err)}
  return r}}
{const _he=hurtE;hurtE=function(e,dmg,crit,dot){if(!CN.on||!P||!e||e.dead||(e.intro>0)||e.hidden)return _he.call(this,e,dmg,crit,dot);
  if(P.cnEye&&!dot&&!e.cnEyed){e.cnEyed=1;dmg*=2}if(P.cnFury&&P.hp<P.maxhp/3)dmg*=1.5;
  // l'élite con lo scudo: lo scudo prende il colpo per primo e torna dopo 4 secondi senza colpi
  if(e.cnAfx){e.cnCalm=0;if(e.cnSh>0&&dmg>0){const a=Math.min(e.cnSh,dmg);e.cnSh-=a;e.cnShT=4;e.cnShF=.12;dmg-=a;if(e.cnSh<=0)cnShBreak(e);if(dmg<=.01){G.fx.push({k:'spark',x:e.x+rand(-9,9),y:e.y-e.r-e.z,t:.15});return}}}
  const r=_he.call(this,e,dmg,crit,dot);
  try{if(e.cnNem&&!dot&&!e.dead){if(e.hp<e.max*.3&&!e.cnLow){e.cnLow=1;cnNemTalk(e,'low',true)}else if(Math.random()<.4)cnNemTalk(e,'hurt')}
    if(P.cnThunder&&!dot&&!CN.inTh&&(e.cnThT||0)<G.t&&Math.random()<.35){e.cnThT=G.t+.6;cnThunder(e)}}catch(err){cnErr(err)}
  return r}}
{const _ke=killE;killE=function(e,noLoot){const was=e.dead,boss=isBoss(e.type);const r=_ke.apply(this,arguments);
  try{if(CN.on&&G&&!was){const run=cnRun();
    if(run)cnFuAdd(boss?6:e.elite?3:1);
    if(!boss){if(!noLoot&&P.cnCalice&&++G.cnKills%10===0){const v=Math.round(P.maxhp*.12);P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-40,'+'+v,'#e5484d',16);sfx('heal')}
      if(P.cnBomb&&!noLoot)cnBlast(e.x,e.y,52,.35)}
    if(e.cnAfx&&!noLoot&&G.state==='play'){if(e.cnDiv)cnSplit(e);if(e.cnBo){CN.fx.push({k:'bomb',x:e.x,y:e.y,t:1.2,max:1.2,r:64,dmg:Math.max(6,Math.round((e.cdmg||12)*1.1))});sfx('rock',0,e.x)}}
    if(e.cnNem)cnNemDown(e);
    if(boss&&run)cnBossGoldBack(e.type)}}catch(err){cnErr(err)}
  return r}}
{const _gx=gainXp;gainXp=function(v){if(cnRun())v*=cnFuMul();return _gx.call(this,v)}}
{const _ks=killStreak;killStreak=function(){if(cnRun())return;return _ks.apply(this,arguments)}}   // nella Classica nuova la Furia prende il posto di «Doppia! Tripla!…»
{const _os=openSkills;openSkills=function(){const r=_os.apply(this,arguments);try{if(cnRun()&&(skMode==='level'||skMode==='treasure'))cnRarDeal();else CN.rar=null}catch(err){cnErr(err)}return r}}
{const _pk=pick;pick=function(i){if(cnRun()&&CN.revEnd&&performance.now()<CN.revEnd){cnRarSkip();return}
  const s=offer[i],k=CN.rar?CN.rar[i]:null,had=s?P.skills[s.id]||0:0,pre={atk:P.atk,aspd:P.aspd,crit:P.crit,maxhp:P.maxhp,hp:P.hp,dashMax:P.dashMax,spd:P.spd,lv:had};
  const r=_pk.apply(this,arguments);
  try{if(cnRun()&&s&&(P.skills[s.id]||0)>had){if(k>0)cnRarApply(s,k,pre);if(s.cnEvo)cnEvoBurst(s)}}catch(err){cnErr(err)}
  if($('skScr').hidden){CN.rar=null;CN.revEnd=0}return r}}
// le frecce delle evoluzioni: lance di ghiaccio e piume d'oro
{const _ar=arrow;arrow=function(){const n0=G?G.arrows.length:0;const r=_ar.apply(this,arguments);
  try{if(cnRun()&&P.cnLance&&!CN.fth)for(let i=n0;i<G.arrows.length;i++){const q=G.arrows[i];if(q.blade||q.cnK||q.flask||q.note||q.star)continue;q.cnK='lance';q.pierce=99;q.m*=1.15;q.life=Math.max(q.life,1.1);CN.lances.push(q)}}catch(err){cnErr(err)}return r}}
{const _vo=volley;volley=function(a){const r=_vo.apply(this,arguments);
  try{if(cnRun()&&P.cnFeather&&(CN.vol=(CN.vol||0)+1)%3===0){const n0=G.arrows.length;CN.fth=true;try{for(let k=0;k<12;k++)arrow(P.x,P.y-6,a+k*TAU/12,.75)}finally{CN.fth=false}for(let i=n0;i<G.arrows.length;i++)if(!G.arrows[i].cnK)G.arrows[i].cnK='feather'}}catch(err){cnErr(err)}return r}}
{const _da=drawArrow;drawArrow=function(a){if(CN.on&&a&&a.cnK){try{cnDrawArrowX(a);return}catch(err){cnErr(err)}}return _da.apply(this,arguments)}}

// ---------------------------------------------------------------- la partita: sequenza, stanze, passi
{const _nr=newRun;newRun=function(){if(CN.on&&CN.next==='tower'){const s=SAVE.sel;SAVE.sel='inf';try{return _nr.apply(this,arguments)}finally{SAVE.sel=s}}return _nr.apply(this,arguments)}}
function cnRushSet(i){const a=G.rush.list[i];G.arena=a;G.chapter=ARENAS[a].ch;G.diff=ARENAS[a].diff;G.bossLvl=null;G.room=ROOMS;G.event=null}
const cnRushList=()=>ARENAS.map((_,i)=>i).filter(i=>cnS().all||cnWon(i));
{const _ms=makeSeqFor;makeSeqFor=function(){const nx=CN.next;CN.next=null;if(!CN.on||!G)return _ms.apply(this,arguments);
  try{cnIncRestore();G.cnInc=false;G.cnA=null;G.tower=null;G.rush=null;G.relics=[];G.cnKills=0;G.cnNem=null;G.cnF=null;G.cnMode=null;G.cnTw=null;G.cnTr=null;G.cnHoles=null;G.cnCol=null;G.cnRise=null;G.cnPick=null;G.cnClimb=[];CN.fx=[];CN.last=null;CN.gAcc=0;CN.gSkip=0;CN.vol=0;CN.metT=null;CN.drT=null;CN.dr=[];CN.lances=[];CN.bub=[];CN.evoT=0;
    if(nx==='tower'&&G.mode==='inf'){CN.last='tower';G.tower={wk:cnWeek(),mods:cnTowerMods()};for(const m of G.tower.mods)m.f();const s=_ms.apply(this,arguments),k=s.findIndex(q=>q.c===20);return s.slice(0,k+1)}
    if(nx==='rush'){const list=cnRushList();if(list.length){CN.last='rush';G.rush={list,i:0,beat:0};cnRushSet(0);return[{c:ROOMS}]}}
    if(G.mode==='camp'&&!G.daily){const a=cnPick();G.cnA=a;G.arena=a;G.chapter=ARENAS[a].ch;G.diff=ARENAS[a].diff;G.bossLvl=null;G.cnInc=!!CN.incRun&&cnIncOk(a);CN.incRun=false;if(G.cnInc)cnIncStart();cnNemPlan();G.cnMode=cnModeOf(a);if(G.cnMode==='torre'){G.cnTw={plan:cnTowPlan(a),f:1};return G.cnTw.plan.map(q=>({c:q.c}))}}}catch(err){cnErr(err)}
  return _ms.apply(this,arguments)}}
{const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{if(CN.on&&G)cnRoomSetup()}catch(err){cnErr(err)}return r}}
function cnRoomSetup(){G.cnBlocked=false;G.cnRT=0;CN.fx=[];CN.lances=[];CN.dr=[];CN.bub=[];cnHud('');const run=cnRun();cnEnsure();if(!run)cnFuHide();
  if(G.tower&&!G.event&&!isBossRoom(G.room))banner('Torre · Piano '+G.room,G.tower.mods.map(m=>m.n).join(' · '),2.2);
  if(G.rush&&!G.event){const sm=$('banner').querySelector('small');if(sm)sm.textContent=`Corsa dei boss · ${G.rush.i+1} di ${G.rush.list.length}`}
  cnNemCheck();cnMoSetup();if(G.cnInc&&!G.event&&!G.cnIncB)G.cnIncB=1;   // the banner of the Incubo comes after the one of the room (cnPost)
  const b=run&&G.enemies.find(e=>isBoss(e.type));if(b){const g=cnS().bossGold[b.type];if(g)cnLater(()=>banner(ET[b.type].name,`Ha il tuo oro: ${g} · battilo per riprenderlo`,2.6),3000)}}
{const _rc=onRoomClear;onRoomClear=function(){const r=_rc.apply(this,arguments);try{if(CN.on&&G&&G.tower&&!G.event&&isBossRoom(G.room)&&G.room<20)cnLater(()=>cnRelicOffer('Premio del custode'),1400)}catch(err){cnErr(err)}return r}}
{const _ns=nextStep;nextStep=function(){if(!CN.on||!G)return _ns.apply(this,arguments);
  try{if(G.rush){cnRushSet(G.rush.i);P.queue=[];buildRoom();return}if(G.tower&&!G.seq[G.si+1]){endRun(true);return}}catch(err){cnErr(err)}
  return _ns.apply(this,arguments)}}
{const _up=update;update=function(dt){if(!CN.on||!G||!P)return _up.apply(this,arguments);const u0=P.ult||0,g0=G.gold;
  const r=_up.apply(this,arguments);try{cnPost(dt,u0,g0)}catch(err){cnErr(err)}return r}}
function cnPost(dt,u0,g0){if(G.cnInc){cnIncTick(dt);if(G.cnIncB===1&&!(G.bannerT>0)&&G.state==='play'){G.cnIncB=2;banner("Prova dell'Incubo",'Nemici più forti · il custode è già arrabbiato · oro doppio',2.8)}}for(const b of CN.bub)if(G.state!=='dead')b.t-=dt;if(CN.bub.length)CN.bub=CN.bub.filter(b=>b.t>0);
  if(G.state==='trans'||G.state==='dead')return;const run=cnRun();cnAfxTick(dt);
  if(run){cnFuTick(dt);const d=G.gold-g0-CN.gSkip;CN.gSkip=0;if(d>0){CN.gAcc+=d*(cnFuMul()-1);const add=Math.floor(CN.gAcc);if(add>0){G.gold+=add;CN.gAcc-=add}}cnEvoTick(dt)}
  // le reliquie della Torre
  const dash=P.dashT>0;
  if(dash&&P.cnBraci){CN.braT=(CN.braT||0)-dt;if(CN.braT<=0){CN.braT=.045;CN.fx.push({k:'fire',x:P.x,y:P.y+4,t:2.2,max:2.2,r:15,tk:0})}}
  if(P.cnMag)for(const c of G.coins){if(!(c.t>.35))continue;const dx=P.x-c.x,dy=P.y-c.y,dd=Math.hypot(dx,dy);if(dd>6&&dd<260){const s=Math.min(dd,(240+c.t*220)*dt);c.x+=dx/dd*s;c.y+=dy/dd*s;c.vx*=.8;c.vy*=.8}}
  if(P.cnFury){const low=P.hp<P.maxhp/3;if(low!==!!P.cnFuryOn){P.cnFuryOn=low;P.spd=(P.spd||150)*(low?1.2:1/1.2);if(low){text(P.x,P.y-46,'Furia!','#e5484d',15);sfx('roar')}}}
  if(P.cnUlt&&P.ult>u0&&u0<100){const was=P.ult>=100;P.ult=Math.min(100,P.ult+(P.ult-u0));if(!was&&P.ult>=100){sfx('shimmer',2);$('ultBtn').classList.add('full')}}
  if(P.cnStar&&G.state==='play'){CN.starT=(CN.starT==null?4:CN.starT)-dt;if(CN.starT<=0){const e=nearest(P.x,P.y);if(e){CN.starT=8;CN.fx.push({k:'star',x:e.x,y:e.y,t:.55,max:.55,e})}else CN.starT=1}}
  if(G.cnNoHeart)G.hearts.length=0;
  if(G.cnClock&&G.state==='play'&&!G.event){G.cnRT+=dt;const left=G.cnClock-G.cnRT;if(left<=0){G.cnCT=(G.cnCT||0)-dt;if(G.cnCT<=0){G.cnCT=2;hurtP(Math.round(P.maxhp*.05))}}
    cnHud(left>0?`<b>Tempo</b>${Math.ceil(left)}`:'<b>Tempo scaduto!</b>')}else if(G.cnClock)cnHud('');
  for(const f of CN.fx){f.t-=dt;
    if(f.k==='fire'&&(f.tk-=dt)<=0){f.tk=.4;for(const e of G.enemies){if(!canHit(e)||Math.hypot(e.x-f.x,(e.y-f.y)*1.4)>f.r+e.r*.6)continue;e.burn=Math.max(e.burn||0,1.6);if(!(e.burnTick>0))e.burnTick=.2}}
    else if(f.k==='star'&&f.t<=0&&!f.hit){f.hit=1;const e=f.e;if(e&&!e.dead){fxPush({k:'flash',x:e.x,y:e.y-e.r,rgb:'255,230,140',r:46,t:.2,max:.2});hurtE(e,P.atk*1.6,true);for(const o of G.enemies)if(o!==e&&canHit(o)&&Math.hypot(o.x-e.x,o.y-e.y)<46)hurtE(o,P.atk*.5,false,true);sfx('magic',0,e.x)}}
    else if(f.k==='bomb'&&f.t<=0&&!f.hit){f.hit=1;G.fx.push({k:'boom',x:f.x,y:f.y,r:f.r,t:.35});sfx('boom',0,f.x);shake(3);if(G.state==='play'&&!(P.dashT>0)&&Math.hypot(P.x-f.x,(P.y-f.y)*1.15)<f.r)hurtP(f.dmg)}
    else if(f.k==='meteor'&&f.t<=0&&!f.hit){f.hit=1;const al=f.e&&!f.e.dead,x=al?f.e.x:f.x,y=al?f.e.y:f.y;cnBlast(x,y,58,2,o=>{o.burn=Math.max(o.burn||0,2.5);if(!(o.burnTick>0))o.burnTick=.2});CN.fx.push({k:'scorch',x,y,t:3.5,max:3.5,r:44});shake(2)}
    else if(f.k==='portal'&&!f.done&&f.max-f.t>=.6){f.done=1;cnNemSpawn(f.n,f.x,f.y)}
    else if(f.k==='shard'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=.92;f.vy*=.92}
    else if(f.k==='ember'){f.x+=f.vx*dt;f.y+=f.vy*dt}}
  CN.fx=CN.fx.filter(f=>f.t>0)}
function cnHud(h){let el=$('cnHud');if(!el){el=document.createElement('div');el.id='cnHud';$('banner').parentElement.appendChild(el)}if(el._h!==h){el._h=h;el.innerHTML=h;el.hidden=!h}}

// ---------------------------------------------------------------- Torre della settimana (con le reliquie) e Corsa dei boss
const CN_TMODS=CHAL_MODS.concat([
  {id:'sangue',n:'Sete di sangue',d:'Ogni nemico sconfitto ti cura un poco',good:1,f:()=>{P.vamp=(P.vamp||0)+1.5}},
  {id:'nocure',n:'Niente cuori',d:'I nemici non lasciano cuori',f:()=>{G.cnNoHeart=true}},
  {id:'tempo',n:'Contro il tempo',d:'Dopo 40 secondi su un piano perdi salute',f:()=>{G.cnClock=40}}]);
function cnTowerMods(){const r=cnRng('mods'),g=CN_TMODS.filter(m=>m.good),b=CN_TMODS.filter(m=>!m.good),out=[g[Math.floor(r()*g.length)]];for(let k=0;k<2;k++)out.push(b.splice(Math.floor(r()*b.length),1)[0]);return out}
function cnTowerBoard(){const r=cnRng('board'),names=RIVALS.slice(),L=[];for(let i=0;i<9;i++){const j=Math.floor(r()*names.length);L.push({n:names.splice(j,1)[0],s:Math.max(2,Math.round(3+r()*r()*17))})}
  const T=cnS().tower;if(T.wk===cnWeek()&&T.best)L.push({n:SAVE.pname||'Tu',s:T.best,me:1});L.sort((a,b)=>b.s-a.s||(a.me?-1:1));return L}
function cnRushNext(){const R=G.rush;R.beat++;R.i++;const nxt=cnBoss(R.list[R.i]),v=Math.round(P.maxhp*.35);P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-40,'+'+v,'#7bbf4a',16);
  banner('Custode sconfitto!',`Prossimo: ${ET[nxt].name} (${R.i+1} di ${R.list.length})`,2.4);G.door=true;sfx('door');if(!$('bossBar').classList.contains('dying'))$('bossBar').hidden=true;
  cnLater(()=>{openSkills('treasure');$('skTag').textContent='Corsa dei boss'},1000)}

// ---------------------------------------------------------------- la fine della partita: oro rubato, record, bracieri
{const _er=endRun;endRun=function(win,quit){if(!CN.on||!G||G.ended)return _er.apply(this,arguments);
  if(G.rush&&win&&!quit&&G.rush.i<G.rush.list.length-1){try{cnRushNext();return}catch(err){cnErr(err)}}
  const S=cnS(),run=cnRun(),keep=['trophies','trBest','arenaUp','inf','best','best2','best3','best4','bestA','done'],snap=JSON.stringify(Object.fromEntries(keep.filter(k=>k in SAVE).map(k=>[k,SAVE[k]])));
  const T0=SAVE.trophies||0,mode=G.rush?'rush':G.tower?'tower':G.cnA!=null?'arena':null,a=G.cnA,fuMax=G.cnF?G.cnF.max:-1;
  if(mode==='rush'&&win)G.rush.beat++;
  // chi ti ha ucciso si prende l'oro della partita (ritirarsi invece lo lascia a te)
  let stolen=0;if(run&&!win&&!quit){if(G.cnKiller===undefined)cnNemOnDeath();stolen=Math.max(0,Math.round(G.gold||0));G.gold=0}
  if(G.cnInc&&win)G.gold=Math.round((G.gold||0)*2);   // the Incubo: double gold
  const r=_er.apply(this,arguments);
  try{cnHud('');cnFuHide();CN.next=CN.last;
    if(mode==='rush'||mode==='tower'){const o=JSON.parse(snap);for(const k of keep)if(k in o)SAVE[k]=o[k];else delete SAVE[k]}
    // the islands open by their bridges, not by the trophies (no «new arena» screen)
    if(mode==='arena'){if((SAVE.trophies||0)<T0)SAVE.trophies=T0;{const o=JSON.parse(snap);if('arenaUp' in o)SAVE.arenaUp=o.arenaUp;else delete SAVE.arenaUp}const old=S.stars[a]||0,first=win&&!(old&1);if(win)S.stars[a]=old|1;
      const B=S.best[a]||(S.best[a]={fu:-1,win:false});B.fu=Math.max(B.fu==null?-1:B.fu,fuMax);if(win)B.win=true;
      const brL=cnBridgeAdd(a,win),incL=G.cnInc?cnIncEnd(a,win):'';
      $('eTr').innerHTML=`<div class="cnEndW"><span><b style="color:${fuMax>=0?CN_FU[fuMax].c:'#8f846e'}">${fuMax>=0?CN_FU[fuMax].l:'–'}</b><small>Furia massima</small></span></div>
        ${first?`<div class="cnLitL">${CN_BRAZ}Hai riacceso il braciere di ${ARENAS[a].n}!</div>`:''}${brL}${incL}`;
      if(!win&&quit)$('endText').textContent=`Ti sei ritirato alla stanza ${G.room}. L'oro raccolto resta tuo.`}
    if(mode==='tower'){const wk=cnWeek(),fl=win?20:G.room;if(S.tower.wk!==wk)S.tower={wk,best:0};const rec=fl>(S.tower.best||0)&&!quit;if(rec)S.tower.best=fl;const pos=cnTowerBoard().findIndex(q=>q.me)+1;
      $('endTag').textContent='Torre della settimana';$('endTitle').textContent=win?'TORRE CONQUISTATA':quit?'RITIRATA':rec?'NUOVO RECORD':'SEI CADUTO';
      $('endText').textContent=win?'Hai salito tutti i venti piani della Torre!':`Sei arrivato al piano ${fl} di 20.`;$('eRoom').textContent=fl;
      $('eTr').innerHTML=`<div class="trline">${pos?`${pos}° nella classifica della settimana · `:''}record: piano ${S.tower.best||0}</div>`}
    if(mode==='rush'){const R=S.rush,n=G.rush.beat,all=win&&n>=G.rush.list.length,tm=G.t;if(n>(R.best||0))R.best=n;if(all&&G.rush.list.length>=ARENAS.length&&(!R.time||tm<R.time))R.time=tm;
      $('endTag').textContent='Corsa dei boss';$('endTitle').textContent=all?'VITTORIA':quit?'RITIRATA':'SEI CADUTO';
      $('endText').textContent=all?`Hai battuto tutti i ${n} custodi in ${cnMS(tm)}.`:`Hai battuto ${n} ${n===1?'custode':'custodi'} su ${G.rush.list.length}.`;$('eRoom').textContent=n;
      $('eTr').innerHTML=`<div class="trline">Record: ${R.best||0} di fila${R.time?' · tutti e 12 in '+cnMS(R.time):''}</div>`}
    if(run&&!win&&!quit)cnEndNem(cnNemCommit(stolen));
    save()}catch(err){cnErr(err)}
  return r}}
function cnEndNem(res){const el=$('eTr');if(!el)return;
  if(res.kind==='new'||res.kind==='up'){const n=res.n,line=pk(CN_NEML[n.tone].wins);
    el.insertAdjacentHTML('beforeend',`<div class="cnDeath ${n.tone}"><canvas width="128" height="128"></canvas><div><span class="cnWT">${res.kind==='new'?'Nuova Nemesi':'La tua Nemesi è più forte'}</span><b>${cnNemFull(n)}</b>
      <p>${res.gold?`Si è preso il tuo oro: <b>${res.gold}</b>`:'Non avevi oro, ma ora ti dà la caccia'}${res.kind==='up'?` · Liv. ${n.lvl}`:''}</p><em>«${line}»</em></div></div>`);
    const cv=el.querySelector('.cnDeath canvas');if(cv)cnPortrait(cv,n.type,n.tone)}
  else if(res.kind==='boss'&&res.gold)el.insertAdjacentHTML('beforeend',`<div class="cnLitL cnBossL">${ET[res.type]?ET[res.type].name:'Il custode'} si tiene il tuo oro (${res.gold}): battilo per riprenderlo</div>`);
  else if(res.gold)el.insertAdjacentHTML('beforeend',`<div class="cnLitL cnBossL">Il tuo oro (${res.gold}) è caduto nel buio</div>`)}
$('againBtn').onclick=()=>{if(CN.on){CN.next=CN.last;CN.incRun=!!(G&&G.cnInc)}startRun()};   // after an Incubo, «Gioca ancora» is the Incubo again
{const _sm=showMenu;showMenu=function(){CN.next=null;cnFuHide();return _sm.apply(this,arguments)}}

// ---------------------------------------------------------------- la mappa del mondo coi bracieri della fiamma
{const _rc=renderChap;renderChap=function(){if(!CN.on||zMode())return _rc.apply(this,arguments);try{cnChap()}catch(err){cnErr(err);_rc.apply(this,arguments)}}}
$('chapCard').onclick=()=>{sfx('ui');if(zMode())openSheet('zombie');else if(CN.on)cnMapOpen();else setTab('tabRoad')};
function cnChap(){const i=cnPick(),A=ARENAS[i],S=cnS(),lit=cnLit(),mo=cnModeOf(i),tr=cnTrack(i);
  const nem=S.nem.length,html=`<div><span class="ck">Arena ${i+1}${cnWon(i)?` <i class="cnCkB">${CN_BRAZ}</i>`:''}<i class="cnMoT" style="--mc:${CN_MO[mo].c}">${cnMoIco(mo)}${CN_MO[mo].n}</i></span><h3>${A.n}</h3></div><div class="ctr"><span class="trNow cnTr">${CN_BRAZ}${lit}/${ARENAS.length}</span><div class="trBar"><i style="width:${lit/ARENAS.length*100}%"></i><span>${nem?`${nem} ${nem===1?'Nemesi ti cerca':'Nemesi ti cercano'}`:`Bracieri accesi: ${lit} su ${ARENAS.length}`}</span></div></div>${tr}<em>Mappa ›</em></div>`;
  const el=$('chapCard');if(el._h!==html){el.innerHTML=html+'<i class="candle l"></i><i class="candle r"></i>';el._h=html;el.style.setProperty('--ac',A.col);el.style.setProperty('--thumb',`url(${arenaThumb(i)})`)}}
function cnMapOpen(){cnEnsure();CN.sel=cnPick();CN.sub=null;cnMapRender();$('cnMap').hidden=false;const sc=$('cnMapIn').querySelector('.cnPath'),n=$('cnMapIn').querySelector('.cnN.sel');if(sc&&n)sc.scrollTop=n.offsetTop-sc.clientHeight/2+40}
function cnMapClose(){$('cnMap').hidden=true;renderChap()}
function cnMapRender(){const el=$('cnMapIn'),S=cnS();if(CN.sub==='tower')return cnTowerRender(el);if(CN.sub==='rush')return cnRushRender(el);if(CN.sub==='rel')return cnRelRender(el);if(CN.sub==='nem')return cnNemRender(el);
  const N=ARENAS.length,lit=cnLit(),H=N*100+46,cur=cnPick(),sc=el.querySelector('.cnPath'),top=sc?sc.scrollTop:null;
  let fire='';for(let i=0;i<N;i++)fire+=`<i class="cnBr ${cnWon(i)?'on':''}" style="--ac:${ARENAS[i].col}">${CN_BRAZ}</i>`;
  const pts=[];let nodes='';for(let i=0;i<N;i++){const y=H-58-i*100,x=50+Math.sin(i*1.3)*27;pts.push([x,y]);const op=cnOpen(i);
    nodes+=`<button class="cnN ${op?'':'lock'} ${CN.sel===i?'sel':''} ${i===cur?'cur':''} ${x<50?'l':'r'}" data-a="${i}" style="left:${x}%;top:${y}px;--ac:${ARENAS[i].col}"><span class="cnPic"><img src="${arenaThumb(i)}" alt="">${op?'':`<b class="cnLk">${CN_LOCK}</b>`}<em>${i+1}</em></span><span class="cnNm"><i class="cnMoN" style="--mc:${CN_MO[cnModeOf(i)].c}">${cnMoIco(cnModeOf(i))}</i>${ARENAS[i].n}<i class="cnSt">${cnWon(i)?`<b class="on">${CN_BRAZ}</b>`:op&&cnRecTxt(i)?`<small>${cnRecTxt(i)}</small>`:''}</i></span></button>`}
  let seg='';for(let i=1;i<N;i++){const[a,b]=[pts[i-1],pts[i]];seg+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${cnOpen(i)?'on':''}"/>`}
  const a=CN.sel,A=ARENAS[a],B=S.best[a]||{},op=cnOpen(a),bt=cnBoss(a),found=CN_REL.filter(r=>S.relics[r.id]).length,RL=cnRushList().length,T=S.tower,bg=S.bossGold[bt];
  el.innerHTML=`<header class="cnHd"><button class="cnX" aria-label="Chiudi">‹</button><h2>Mappa del mondo</h2><span class="cnTot">${CN_BRAZ}${lit}<small>/${N}</small></span></header>
    <div class="cnFire"><div class="cnBrs">${fire}</div><div class="cnFl"><span>La fiamma · ${lit} ${lit===1?'braciere acceso':'bracieri accesi'} su ${N}</span><span>Batti il custode per riaccendere il suo</span></div></div>
    <div class="cnPath"><div class="cnPin" style="height:${H}px"><svg class="cnLine" viewBox="0 0 100 ${H}" preserveAspectRatio="none">${seg}</svg>${nodes}</div></div>
    <div class="cnSel ${op?'':'lock'}" style="--ac:${A.col}"><div class="cnSh"><img src="${arenaThumb(a)}" alt=""><div><span class="ck">Arena ${a+1}</span><h3>${A.n}</h3><span class="cnMoL" style="--mc:${CN_MO[cnModeOf(a)].c}">${cnMoIco(cnModeOf(a))}<b>${CN_MO[cnModeOf(a)].n}</b> · ${cnMoSub(a)}</span><small>Custode: ${op?ET[bt].name:'???'}${bg?` · <b class="cnGoldT">ha il tuo oro: ${bg}</b>`:''}</small></div></div>
      <ul class="cnRec2"><li><b>${cnRecTxt(a)||'–'}</b><small>${cnModeOf(a)==='torre'?'Piano migliore':'Stanza migliore'}</small></li><li><b style="color:${B.fu>=0?CN_FU[B.fu].c:'inherit'}">${B.fu>=0?CN_FU[B.fu].l:'–'}</b><small>Furia massima</small></li><li><b>${B.win?'Vinta':'Da vincere'}</b><small>Il custode</small></li></ul>
      ${op?`<button class="btn cnPlay">Gioca</button>`:`<p class="cnLockP">${CN_LOCK} Finisci il ponte da «${ARENAS[a-1].n}»: ${cnBrHave(a-1)}/${cnBrNeed(a-1)} pietre</p>`}</div>
    <div class="cnModes"><button class="cnMode" data-sub="tower" style="--mc:#c48ae8">${cnIco('totem')}<b>Torre</b><small>${T.wk===cnWeek()&&T.best?'Piano '+T.best:'Della settimana'}</small></button>
      <button class="cnMode" data-sub="rush" style="--mc:#e5484d">${cnIco('crown')}<b>Corsa dei boss</b><small>${RL?RL+' custodi':'Chiusa'}</small></button>
      <button class="cnMode" data-sub="rel" style="--mc:#ffc93c">${cnRelIco('stella')}<b>Reliquie</b><small>${found} di ${CN_REL.length}</small></button>
      <button class="cnMode" data-sub="nem" style="--mc:#c0392b">${cnIco('poster')}<b>Ricercati</b><small>${S.nem.length?S.nem.length+' ti cercano':'Nessuno'}</small>${S.nem.length?`<i class="cnBadge">${S.nem.length}</i>`:''}</button></div>
    <label class="cnAll"><input type="checkbox" ${S.all?'checked':''}> Solo nell'anteprima: apri tutte le arene</label>`;
  if(top!=null)el.querySelector('.cnPath').scrollTop=top;
  el.querySelector('.cnX').onclick=()=>{sfx('ui');cnMapClose()};
  el.querySelectorAll('.cnN').forEach(n=>n.onclick=()=>{CN.sel=+n.dataset.a;sfx('ui');cnMapRender()});
  const pl=el.querySelector('.cnPlay');if(pl)pl.onclick=()=>{S.pick=a;save();$('cnMap').hidden=true;renderChap();goPlay('arena')};
  el.querySelectorAll('.cnMode').forEach(m=>m.onclick=()=>{CN.sub=m.dataset.sub;sfx('ui');cnMapRender();el.scrollTop=0});
  el.querySelector('.cnAll input').onchange=e=>{S.all=e.target.checked;save();cnMapRender()}}
function cnSubHead(t){return`<header class="cnHd"><button class="cnX" aria-label="Indietro">‹</button><h2>${t}</h2><span></span></header>`}
function cnSubWire(el){el.querySelector('.cnX').onclick=()=>{sfx('ui');CN.sub=null;cnMapRender()};const g=el.querySelector('.cnGo');if(g)g.onclick=()=>{CN.next=g.dataset.go;$('cnMap').hidden=true;goPlay('arena')}}
function cnTowerRender(el){const wk=cnWeek(),mods=cnTowerMods(),T=cnS().tower,best=T.wk===wk?T.best||0:0,ms=((wk+1)*7-3)*864e5-Date.now();
  el.innerHTML=cnSubHead('Torre della settimana')+`<div class="cnSub"><div class="cnBig" style="--mc:#c48ae8">${cnIco('totem')}</div><p class="cnLead">Venti piani, un custode ogni cinque e una reliquia dopo ognuno. Le regole cambiano ogni lunedì.</p>
    <h4>Le regole di questa settimana</h4><ul class="cnMods">${mods.map(m=>`<li class="${m.good?'g':'b'}"><b>${m.n}</b><span>${m.d}</span></li>`).join('')}</ul>
    <p class="cnRec">Il tuo record: <b>${best?'piano '+best:'nessuno'}</b> · si cambia tra ${fmtH(ms)}</p>
    <h4>Classifica della settimana</h4><ol class="cnBoard">${cnTowerBoard().map((r,i)=>`<li class="${r.me?'me':''}"><i>${i+1}</i><span>${r.n}</span><b>Piano ${r.s}</b></li>`).join('')}</ol>
    <button class="btn cnGo" data-go="tower">Entra nella Torre</button></div>`;cnSubWire(el)}
function cnRushRender(el){const L=cnRushList(),R=cnS().rush;
  el.innerHTML=cnSubHead('Corsa dei boss')+`<div class="cnSub"><div class="cnBig" style="--mc:#e5484d">${cnIco('crown')}</div><p class="cnLead">Tutti i custodi che hai già battuto, uno dopo l'altro. Tra un boss e l'altro scegli un'abilità e recuperi un po' di salute.</p>
    <ul class="cnRush">${ARENAS.map((A,i)=>{const ok=L.includes(i);return`<li class="${ok?'ok':''}" style="--ac:${A.col}"><i>${i+1}</i><span>${ok?ET[cnBoss(i)].name:'???'}</span><small>${ok?A.n:'Batti il custode di «'+A.n+'»'}</small></li>`}).join('')}</ul>
    <p class="cnRec">Record: <b>${R.best||0}</b> custodi di fila${R.time?' · tutti e 12 in '+cnMS(R.time):''}</p>
    ${L.length?`<button class="btn cnGo" data-go="rush">Inizia la corsa · ${L.length} ${L.length===1?'custode':'custodi'}</button>`:`<p class="cnLockP">${CN_LOCK} Batti almeno un custode per aprire la corsa</p>`}</div>`;cnSubWire(el)}
function cnRelRender(el){const S=cnS();
  el.innerHTML=cnSubHead('Reliquie')+`<div class="cnSub"><p class="cnLead">Si trovano nella Torre della settimana, una dopo ogni custode. Ognuna cambia le regole fino alla fine della partita.</p>
    <div class="cnRelG">${CN_REL.map(r=>S.relics[r.id]?`<div class="cnRelB" style="--rc:${r.c}"><span class="cnRelI">${cnRelIco(r.id)}</span><b>${r.n}</b><span>${r.d}</span><small>Trovata ${S.relics[r.id]} ${S.relics[r.id]===1?'volta':'volte'}</small></div>`
      :`<div class="cnRelB no"><span class="cnRelI">?</span><b>???</b><span>Ancora da trovare</span></div>`).join('')}</div></div>`;cnSubWire(el)}
// la bacheca dei Ricercati: le Nemesi coi loro manifesti, i custodi che tengono il tuo oro, quelle già sconfitte
function cnNemRender(el){const S=cnS(),bg=Object.entries(S.bossGold).filter(([,g])=>g>0);
  el.innerHTML=cnSubHead('Ricercati')+`<div class="cnSub"><p class="cnLead">Chi ti batte si prende l'oro della partita e torna a cercarti in un'altra partita, col tuo sacco sulle spalle. Battilo e ti riprendi tutto, più la taglia.</p>
    ${S.nem.length?`<div class="cnWants">${S.nem.map(n=>`<div class="cnWant ${n.tone}"><span class="cnWT">Ricercato</span><canvas width="176" height="176" data-t="${n.type}" data-tone="${n.tone}"></canvas><b>${n.name}</b><small>${n.title}</small>
      <i class="cnLv">${'★'.repeat(n.lvl)}<s>${'★'.repeat(5-n.lvl)}</s></i><span class="cnAf">${n.afx.map(k=>`<em style="--c:${CN_AFX[k].c}">${CN_AFX[k].n}</em>`).join('')}</span>
      <span class="cnTaglia">Taglia: <b>${n.gold}</b> oro + <b>${cnNemBounty(n)}</b> cristalli</span><small class="cnWins">Ti ha battuto ${n.wins} ${n.wins===1?'volta':'volte'}</small></div>`).join('')}</div>`
      :`<p class="cnEmpty">Nessuno ti dà la caccia. Per ora.</p>`}
    ${bg.length?`<h4>Custodi col tuo oro</h4><ul class="cnList">${bg.map(([t,g])=>`<li><span>${ET[t]?ET[t].name:t}</span><b>${g} oro</b></li>`).join('')}</ul>`:''}
    ${S.nemOut.length?`<h4>Sconfitti</h4><ul class="cnList">${S.nemOut.map(n=>`<li class="out"><span>${cnNemFull(n)}</span><b>${n.gold} oro ripreso</b></li>`).join('')}</ul>`:''}</div>`;
  cnSubWire(el);el.querySelectorAll('.cnWant canvas').forEach(c=>cnPortrait(c,c.dataset.t,c.dataset.tone))}

// ---------------------------------------------------------------- il menu con meno bottoni
// nella Classica a sinistra resta un solo bottone, «Premi», che apre Missioni, Accesso, Ruota e Traguardi; a destra restano Pass e Casse
// (il Cammino delle coppe non serve più con la mappa, le Offerte stanno nella Bottega). La Zombie resta com'è.
const CN_PREMI=[['misBtn','Missioni','Del giorno e della settimana'],['loginBtn','Accesso','Un premio ogni giorno'],['wheelBtn','Ruota','Un giro gratis al giorno'],['achBtn','Traguardi','Si riscattano in cristalli']];
function cnPremiReady(id){const b=$(id);if(!b)return false;if(id==='achBtn'){const p=$('achPip');return!!p&&!p.hidden}return b.classList.contains('hot')}
function cnPremiInit(){const col=document.querySelector('#tabPlay .sideBtns.l');if(!col||$('cnPremiBtn'))return;
  const b=document.createElement('button');b.className='qbtn cnSide';b.id='cnPremiBtn';b.setAttribute('aria-label','Premi');
  b.innerHTML=`<svg viewBox="0 0 40 40" aria-hidden="true">${CNI.gift}</svg><small>Premi</small><em class="pip" id="cnPremiN" hidden></em>`;col.insertBefore(b,col.firstChild);
  const pan=document.createElement('div');pan.id='cnPremi';pan.hidden=true;col.parentElement.appendChild(pan);
  b.onclick=ev=>{ev.stopPropagation();sfx('ui');if(pan.hidden){cnPremiFill();pan.hidden=false}else pan.hidden=true};
  document.addEventListener('pointerdown',ev=>{if(!pan.hidden&&!pan.contains(ev.target)&&!b.contains(ev.target))pan.hidden=true},true);
  // il bottone si accende quando uno dei quattro è pronto (si guardano i bottoni nascosti, che il gioco tiene aggiornati come sempre)
  const mo=new MutationObserver(()=>cnPremiSync());for(const[id] of CN_PREMI){const q=$(id);if(q)mo.observe(q,{attributes:true,attributeFilter:['class']})}
  const ap=$('achPip');if(ap)mo.observe(ap,{attributes:true,attributeFilter:['hidden'],childList:true,characterData:true,subtree:true});cnPremiSync()}
function cnPremiSync(){const b=$('cnPremiBtn');if(!b)return;const n=CN_PREMI.filter(q=>cnPremiReady(q[0])).length,p=$('cnPremiN');b.classList.toggle('hot',n>0);
  if(p.hidden!==!n)p.hidden=!n;if(p.textContent!==String(n))p.textContent=n;if(!$('cnPremi').hidden)cnPremiFill()}
function cnPremiFill(){const pan=$('cnPremi');
  pan.innerHTML=`<b class="cnPrT">Premi</b>`+CN_PREMI.map(([id,n,d])=>{const q=$(id),sv=q&&q.querySelector('svg'),hot=cnPremiReady(id);
    return`<button class="cnPrR ${hot?'hot':''}" data-id="${id}"><span class="cnPrI">${sv?sv.outerHTML:''}</span><span class="cnPrX"><b>${n}</b><small>${hot?'Da ritirare!':d}</small></span></button>`}).join('');
  pan.querySelectorAll('.cnPrR').forEach(r=>r.onclick=()=>{pan.hidden=true;sfx('ui');$(r.dataset.id).click()})}

// ---------------------------------------------------------------- 6 la scalata a giro: una modalità per arena
// Denis: «dovremmo modificare la scalata delle arene e metterci modalità diverse ogni tot […] la modalità che abbiamo già va bene, si
// inizierà così a inizio game», poi le sue risposte: una modalità per arena, a giro (1, 4, 7, 10 le stanze; 2, 5, 8, 11 la torre che sale;
// 3, 6, 9, 12 le trappole), ognuna col suo custode. Torre: niente isole come Archero, una piattaforma che sale un piano per ondata; 10
// piani nelle arene 2 e 5, 20 col campione ogni 5 nelle 8 e 11; l'esperienza come nelle stanze. Trappole: «tutte e 3» le stanze (percorso,
// trappole e nemici, fuga dal crollo) e il custode alla fine, tra le trappole che colpiscono anche lui.
const CN_MO={stanze:{n:'Le stanze',c:'#e8d6b0'},torre:{n:'La torre che sale',c:'#8fd0ff'},trappole:{n:'Le trappole',c:'#ffab6a'}};
const cnModeOf=a=>['stanze','torre','trappole'][(a|0)%3];
const cnFloorsOf=a=>a<6?10:20;
const cnMoSub=a=>{const m=cnModeOf(a);return m==='torre'?(cnFloorsOf(a)===10?'Dieci piani, poi il custode':'Venti piani, un campione ogni cinque'):m==='trappole'?'Percorsi, trappole e crolli, poi il custode':'Dieci stanze, poi il custode'};
const CN_MOI={stanze:'<path d="M5 21V10a7 7 0 0 1 14 0v11z" fill="#6b5640" stroke="#191714" stroke-width="2.2" stroke-linejoin="round"/><path d="M9 21v-8a3 3 0 0 1 6 0v8" fill="#191714"/>',
  torre:'<path d="M6 22V8h12v14z" fill="#5d6c7a" stroke="#191714" stroke-width="2.2" stroke-linejoin="round"/><path d="M5 8V4h3v2h2V4h4v2h2V4h3v4z" fill="#7d8c9a" stroke="#191714" stroke-width="2" stroke-linejoin="round"/><path d="M12 19v-7m-3 3 3-3 3 3" fill="none" stroke="#bfe6ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  trappole:'<circle cx="12" cy="12" r="7.5" fill="#8a8f96" stroke="#191714" stroke-width="2"/><path d="M12 1.5l2 3.2h-4zM22.5 12l-3.2 2v-4zM12 22.5l-2-3.2h4zM1.5 12l3.2-2v4z" fill="#c9ced4" stroke="#191714" stroke-width="1.4" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.6" fill="#ff8a3c" stroke="#191714" stroke-width="1.6"/>'};
const cnMoIco=m=>`<svg viewBox="0 0 24 24" aria-hidden="true">${CN_MOI[m]||''}</svg>`;
// il colore delle cose che vengono dal mondo dell'arena (1 muschio e ombre, 2 vulcano, 3 palude, 4 ghiaccio)
const CN_WRGB=['200,200,200','170,120,255','255,120,50','150,220,80','150,210,255'];
const cnWorld=()=>Math.max(1,Math.min(4,G.chapter||1));
const CN_FLY={bat:1,wisp:1,mosquito:1,snowspirit:1};
const cnFlies=o=>!!o&&o!==P&&!!CN_FLY[o.type];

// il segnaposto invisibile tiene aperto un piano finché arrivano altri nemici o finché non scegli il premio
Object.defineProperty(ET,'cnanchor',{value:{r:1,hp:1,cdmg:0,gold:0,name:'',title:''},enumerable:false,configurable:true});ECOL.cnanchor='#000000';XPV.cnanchor=0;
function cnAnchorOn(){if(G.enemies.some(e=>e.cnAnchor))return;const e=makeE('cnanchor',AW/2,TOP-400,1e9);if(SAVE.seen)delete SAVE.seen.cnanchor;e.cnAnchor=1;e.spawn=1e9;e.hidden=true;G.enemies.push(e)}
function cnAnchorOff(){G.enemies=G.enemies.filter(e=>!e.cnAnchor)}
{const _ue=updEnemy;updEnemy=function(e){if(e&&e.cnAnchor)return;return _ue.apply(this,arguments)}}

// ---------------------------------------------------------------- la torre che sale
// ogni piano: c = la stanza di cui ha la forza (vita, danno, nemici, esperienza come nelle stanze); k: n normale, e i Campioni (due élite),
// m il campione del piano (un'élite grande con tre poteri), p il piano del premio (la fonte o l'altare), b il custode
function cnTowPlan(a){const N=cnFloorsOf(a),Q=[];
  if(N===10)for(let f=1;f<=10;f++)Q.push({c:f,k:f===10?'b':f===5?'e':f===8?'p':'n'});
  else{const C=[1,1,2,2,3,3,3,4,4,6,6,6,7,7,8,8,8,9,9,10];for(let f=1;f<=20;f++)Q.push({c:C[f-1],k:f===20?'b':f%5===0?'m':f===8||f===16?'p':'n'})}
  return Q}
const CN_RISE={wait:1.6,len:2.6,swap:1.3};
function cnTowSetup(){const T=G.cnTw;if(!T)return;const f=G.si+1,q=T.plan[f-1]||{c:G.room,k:'n'};T.f=f;T.k=q.k;T.g2=null;
  if(T.px!=null){P.x=T.px;P.y=T.py;T.px=null;cnUnstick(P);for(const pt of G.pets||[]){pt.x=clamp(P.x+(pt.slot?26:-26),L+12,R-12);pt.y=P.y+8}}
  if(f>1&&q.k!=='b'&&q.k!=='p')cnHolesMake(f);
  if(q.k==='b')return;   // il custode: la sua stanza e la sua entrata, come sempre
  const late=G.cnRise?Math.max(0,CN_RISE.len-G.cnRise.t):0;let list=G.enemies.splice(0);
  if(q.k==='p'){cnAnchorOn();cnShrines(late);return}
  if(T.plan.length>10&&q.k==='n')list=list.slice(0,Math.max(2,Math.round(list.length*.65)));
  if(q.k==='m')list=cnMiniBoss(list,late);
  const n1=q.k==='m'?list.length:Math.ceil(list.length*.6);cnClimbIn(list.slice(0,n1),late);
  if(list.length>n1){T.g2={list:list.slice(n1),t:8+late,th:n1>=4?1:0};cnAnchorOn()}
  if(q.k==='e')cnLater(()=>banner('I Campioni del piano','Due élite coi poteri',2),late*1000)}
// i nemici salgono dall'abisso e si arrampicano sul bordo della piattaforma (a sinistra, a destra o in basso, mai addosso all'eroe)
function cnEdgeSpot(r){for(let i=0;i<40;i++){const s=Math.random(),side=s<.37?0:s<.74?1:2;let x,y;
    if(side===0){x=L+r+8;y=rand(TOP+100,BOT-70)}else if(side===1){x=R-r-8;y=rand(TOP+100,BOT-70)}else{x=rand(L+50,R-50);y=BOT-r-8}
    if(Math.hypot(x-P.x,y-P.y)<160||G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+r+8)||cnInHole(x,y,r+8))continue;return{x,y,side}}
  const s=freeSpot(r,TOP+60,BOT-60);return{x:s.x,y:s.y,side:3}}
function cnClimbIn(list,late){for(const e of list){const s=cnEdgeSpot(e.r);e.x=s.x;e.y=s.y;e.spawn=(late||0)+.85+Math.random()*.7;G.enemies.push(e);
    if(!cnFlies(e)&&!isBoss(e.type))G.cnClimb.push({x:s.x,y:s.y,side:s.side,t:e.spawn,max:e.spawn,r:e.r})}}
function cnMiniBoss(list,late){const pool=list.filter(e=>!isBoss(e.type));if(!pool.length)return list;
  const big=pool.reduce((a,b)=>((ET[b.type]||{}).hp||0)>((ET[a.type]||{}).hp||0)?b:a);
  const e=makeE(big.type,AW/2,TOP+200,1.2,true);e.max*=3.2;e.hp=e.max;e.r=Math.round(e.r*1.2);cnGiveAfx(e,0,shuffle(Object.keys(CN_AFX)).slice(0,3));
  e.cnName='Campione del piano';e.cnBig=1;e.cnMini=1;e.gold=(e.gold||2)*4;
  cnLater(()=>{banner('Il Campione del piano!',`${(ET[big.type]||{}).name||''} con tre poteri`,2.2);sfx('roar');shake(3)},late*1000+300);
  return[e,...pool.filter(o=>o!==big).slice(0,3)]}
// il piano del premio: la fonte ti cura, l'altare ti dà un'abilità; ne prendi una, l'altra si sbriciola
function cnShrines(late){const y=TOP+(BOT-TOP)*.42;G.cnPick=[{k:'fonte',x:AW/2-82,y,t:0},{k:'altare',x:AW/2+82,y,t:0}];
  const n=G.rocks.length;G.rocks=G.rocks.filter(k=>!G.cnPick.some(q=>Math.hypot(k.x-q.x,k.y-q.y)<k.r+64));if(G.rocks.length!==n)fields={};
  cnLater(()=>banner('Il piano del premio',"La fonte ti cura, l'altare ti dà un'abilità",2.6),late*1000)}
function cnShrineTick(dt){const S=G.cnPick;if(!S)return;for(const s of S)s.t+=dt;if(S.done){S.dt=(S.dt||0)+dt;if(S.dt>.9){G.cnPick=null;cnAnchorOff()}return}
  if(G.state!=='play'||G.cnRise)return;
  for(const s of S){if(Math.hypot(P.x-s.x,(P.y-s.y)*1.2)>30)continue;S.done=1;s.used=1;
    if(s.k==='fonte'){const v=Math.round(P.maxhp*.4);P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-44,'+'+v,'#7bbf4a',18);sfx('heal');vfxBlast(s.x,s.y-20,'120,220,255',70,{sparks:14})}
    else{sfx('shimmer',2);vfxBlast(s.x,s.y-20,'255,214,90',70,{sparks:16});openSkills('treasure')}
    for(const o of S)if(o!==s){o.gone=1;vfxBlast(o.x,o.y-10,'200,190,170',40,{debris:'stone',n:8,dust:6});sfx('rock',0,o.x)}
    break}}
// la piattaforma sale: si aspetta che monete ed esperienza arrivino all'eroe, poi trema, attraversa il solaio del piano di sopra
// (un attimo di buio: lì cambia il piano) e si ferma col tonfo
function cnTowTick(dt){const T=G.cnTw;if(!T)return;for(const f of CN.fx)if(f.k==='tdeb')f.y+=f.vy*dt;
  if(T.g2&&G.state==='play'&&!G.cnRise){T.g2.t-=dt;const alive=G.enemies.filter(e=>!e.dead&&!e.cnAnchor).length;
    if(alive<=T.g2.th||T.g2.t<=0){const g=T.g2;T.g2=null;cnClimbIn(g.list,0);cnAnchorOff();sfx('roar');text(P.x,P.y-60,'Ne arrivano altri!','#ffd84a',14)}}
  const last=T.f>=T.plan.length;
  if(G.state==='cleared'&&!last&&!G.cnRise){G.clearT=1e9;T.w=(T.w||0)+dt;if(T.w>=CN_RISE.wait||(!G.coins.length&&!G.orbs.length&&T.w>.7)){T.w=0;cnRiseGo()}}
  const R=G.cnRise;if(!R)return;R.t+=dt;
  if(!R.sw&&R.t>=CN_RISE.swap){R.sw=1;cnRiseSwap()}
  if(R.sw&&!R.thud&&R.t>=CN_RISE.swap+.45){R.thud=1;shake(2.5);sfx('boom',0,P.x);tone(70,40,.45,'triangle',.06);vib([25])}
  if(R.t>=CN_RISE.len){G.cnRise=null;cnTowHud(true)}
  if(!LOWFX||Math.random()<.3)for(let i=0;i<(R.sw?1:3);i++)if(Math.random()<dt*14)CN.fx.push({k:'tdeb',x:rand(G.vx||L,(G.vx||L)+VW),y:(G.vy||TOP)-20,vy:rand(520,820),t:1,max:1,s:rand(1.5,3.5),dk:Math.random()<.5})}
function cnRiseGo(){const T=G.cnTw;G.cnRise={t:0};banner('Il piano sale',`Piano ${T.f+1} di ${T.plan.length}`,1.6);
  shake(1.5);tone(52,38,1.3,'sawtooth',.045);tone(78,60,1.3,'triangle',.05,.05);sfx('door',0,P.x)}
function cnRiseSwap(){const T=G.cnTw;let xp=0,g=0;for(const o of G.orbs)xp+=o.v;for(const c of G.coins)g+=c.gr?1:(1+Math.floor(effRoom()/5));G.orbs=[];G.coins=[];
  if(g)G.gold+=g;if(xp)gainXp(xp);T.px=P.x;T.py=P.y;nextStep();tone(110,220,.5,'triangle',.04,.1)}
// i buchi dei piani: si vede l'abisso; chi cammina ci gira intorno (chi vola no), i colpi ci passano sopra
function cnHolesMake(f){const H=G.cnHoles=[],n=f<=2?1:randi(1,3);
  for(let i=0,tries=0;i<n&&tries<90;tries++){const r=rand(30,44),x=rand(L+r+34,R-r-34),y=rand(TOP+130,BOT-150);
    if(Math.hypot(x-P.x,y-P.y)<r+120||G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+r+50)||H.some(h=>Math.hypot(h.x-x,h.y-y)<h.r+r+130))continue;
    const parts=[{x,y,r}],m=randi(0,2);for(let j=0;j<m;j++){const a=rand(0,TAU),d=r*rand(.5,.8);parts.push({x:x+Math.cos(a)*d,y:y+Math.sin(a)*d*.7,r:r*rand(.55,.8)})}
    H.push({x,y,r,parts,seed:1+Math.random()*1000,path:null,lip:null});i++}
  fields={}}
const cnInHole=(x,y,m)=>!!(G&&G.cnHoles)&&G.cnHoles.some(h=>h.parts.some(p=>Math.hypot((x-p.x)/(p.r+(m||0)),(y-p.y)/(p.r*.62+(m||0)))<1));
function cnHolePush(o){const m=o.r*.6;for(const h of G.cnHoles)for(const p of h.parts){const ax=p.r+m,ay=p.r*.62+m,ex=(o.x-p.x)/ax,ey=(o.y-p.y)/ay,d=Math.hypot(ex,ey);
    if(d<1){if(d<.001){o.y=p.y+ay;continue}o.x=p.x+ex/d*ax;o.y=p.y+ey/d*ay}}}
function cnUnstick(o){if(G.cnHoles)cnHolePush(o);for(const k of G.rocks){const ex=o.x-k.x,ey=o.y-k.y,d=Math.hypot(ex,ey)||1,m=o.r+k.r;if(d<m){o.x=k.x+ex/d*m;o.y=k.y+ey/d*m}}
  o.x=clamp(o.x,L+o.r,R-o.r);o.y=clamp(o.y,TOP+o.r+20,BOT-o.r)}
{const _mc=moveCircle;moveCircle=function(o,dx,dy,ign){const r=_mc.apply(this,arguments);if(!ign&&G&&G.cnHoles&&G.cnHoles.length&&!cnFlies(o))try{cnHolePush(o);o.x=clamp(o.x,L+o.r,R-o.r)}catch(err){cnErr(err)}return r}}
{const _fd=field;field=function(inf){if(!G||!G.cnHoles||!G.cnHoles.length)return _fd.apply(this,arguments);const f=fields[inf];if(f&&f.t>0)return f;
  const r0=G.rocks;G.rocks=r0.concat(...G.cnHoles.map(h=>h.parts.map(p=>({x:p.x,y:p.y,r:p.r*.78}))));try{return _fd.apply(this,arguments)}finally{G.rocks=r0}}}
{const _fs=freeSpot;freeSpot=function(r){let s=_fs.apply(this,arguments);if(G&&G.cnHoles&&G.cnHoles.length)for(let i=0;i<14&&cnInHole(s.x,s.y,r+10);i++)s=_fs.apply(this,arguments);return s}}

// ---------------------------------------------------------------- le trappole
// stanze a giro: 1, 4, 7 percorso (solo trappole, la porta aperta, tre traguardi: tempo, nessun colpo, tutte le monete); 2, 5, 8 trappole e
// nemici (la 5 coi Campioni); 3, 6, 9 fuga dal crollo (il pavimento crolla da dietro, pochi nemici, la porta aperta); 10 il custode tra
// le trappole. Le trappole colpiscono anche i nemici e il custode. Lame che girano sui binari, travi runiche che scorrono, spuntoni a tempo,
// sfiati del mondo (fiamma d'ombra, lava, veleno, brina).
const CN_TRK=['','corso','misto','fuga','corso','misto','fuga','corso','misto','fuga','boss'];
const CN_TRN={corso:'Il percorso delle trappole',misto:'Trappole e nemici',fuga:'Il pavimento crolla!'};
const CN_VENT=['','Fiamma d\'ombra','Getto di lava','Geyser di veleno','Soffio di brina'];
function cnTrapSetup(){const kind=CN_TRK[G.room]||'misto',tier=Math.floor((G.cnA||0)/3),T=G.cnTr={kind,list:[],t:0,hit:false,coins:[],xp:0,done:false,tier,sp:1+.07*tier};
  const xpOf=list=>list.reduce((s,e)=>s+(XPV[e.type]||4)*(e.elite?3:1),0);
  if(kind==='corso'){T.xp=xpOf(G.enemies);G.enemies=[];cnTrCourse(T);T.lim=Math.round(15+2*tier);cnLater(()=>banner(CN_TRN.corso,'Tempo, nessun colpo, tutte le monete',2.4),1200)}
  else if(kind==='fuga'){const keep=G.enemies.filter(e=>cnFlies(e)||(ET[e.type]||{}).r<=14).slice(0,2);if(keep.length<2)keep.push(...G.enemies.filter(e=>!keep.includes(e)).slice(0,2-keep.length));
    T.xp=xpOf(G.enemies.filter(e=>!keep.includes(e)));G.enemies=keep;for(const e of keep){e.y=Math.min(BOT-80,e.y+260)}
    cnTrRun(T);G.door=true;G.cnCol={y:BOT+30,v:0,t:-2,cd:0,chunks:[]};cnLater(()=>banner(CN_TRN.fuga,"Corri verso l'uscita",2),200);sfx('rock');shake(2)}
  else if(kind==='boss'){cnTrBoss(T)}
  else{cnTrMixed(T);cnLater(()=>banner(CN_TRN.misto,'Le trappole fanno male anche a loro',2),2600)}
  fields={}}
const cnTrFree=(x,y,m)=>!G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+m);
function cnTrClear(y0,y1){const n=G.rocks.length;G.rocks=G.rocks.filter(k=>k.y<y0||k.y>y1);if(G.rocks.length!==n)fields={}}
function cnSaw(T,x1,y1,x2,y2,ph,sp){T.list.push({k:'saw',x1,y1,x2,y2,ph:ph||0,sp:(sp||1.4)*T.sp,r:17,x:x1,y:y1,rot:0,v:0})}
function cnBeam(T,y1,y2,gapR,ph){const g=78;T.list.push({k:'beam',xa:gapR?L+6:L+g,xb:gapR?R-g:R-6,y1,y2,ph:ph||0,sp:.9*T.sp,y:y1})}
function cnSpikes(T,x,y,w,ph){T.list.push({k:'spk',x,y,w,h:40,ph:ph||0,per:2.6/T.sp,st:0,u:0})}
function cnVent(T,x,y,ph){T.list.push({k:'vent',x,y,r:24,ph:ph||0,per:3.2/T.sp,st:0,u:0})}
// il percorso: quattro fasce dal basso all'uscita, le monete a zig zag tra le fasce
function cnTrCourse(T){const W=R-L,mid=AW/2,b1=BOT-170,b2=BOT-330,b3=TOP+(BOT-TOP)*.42,b4=TOP+150,fl=Math.random()<.5;
  cnTrClear(TOP+80,BOT-90);
  cnSaw(T,L+44,b1,mid-24,b1,0);cnSaw(T,mid+24,b1,R-44,b1,Math.PI);
  cnBeam(T,b2-46,b2+46,fl,0);
  const sw=(W-40)/4;for(let i=0;i<4;i++)cnSpikes(T,L+20+sw*(i+.5),b3,sw-14,i%2?1.3:0);
  for(let i=0;i<3;i++)cnVent(T,L+W*(i+1)/4,b4,i*1.05);
  const pts=[[mid,BOT-100],[fl?R-70:L+70,b1-70],[mid,b2+80],[fl?L+70:R-70,b2-90],[mid+(fl?-60:60),b3+60],[mid,b3-70],[fl?R-80:L+80,b4+60],[mid,b4-60],[mid,TOP+60]];
  T.coins=pts.map(([x,y])=>({x,y,got:0}))}
function cnTrRun(T){const W=R-L,mid=AW/2;cnTrClear(TOP+80,BOT-60);
  cnSaw(T,L+40,BOT-300,R-40,BOT-300,0,1.1);cnSaw(T,L+40,TOP+(BOT-TOP)*.44,R-40,TOP+(BOT-TOP)*.44,Math.PI,1.2);
  const sw=(W-40)/3;for(let i=0;i<3;i++)cnSpikes(T,L+20+sw*(i+.5),TOP+(BOT-TOP)*.62,sw-18,i*.9);
  cnVent(T,mid-90,TOP+170,0);cnVent(T,mid+90,TOP+170,1.6)}
function cnTrMixed(T){const tries=(f)=>{for(let i=0;i<40;i++){const x=rand(L+70,R-70),y=rand(TOP+110,BOT-170);if(Math.hypot(x-P.x,y-P.y)<170||!cnTrFree(x,y,46)||T.list.some(o=>Math.hypot((o.x??o.x1)-x,(o.y??o.y1)-y)<120))continue;f(x,y);return}};
  tries((x,y)=>{const d=rand(70,110);cnSaw(T,clamp(x-d,L+30,R-30),y,clamp(x+d,L+30,R-30),y,0,1.2)});
  tries((x,y)=>{const d=rand(60,95);cnSaw(T,x,clamp(y-d,TOP+60,BOT-120),x,clamp(y+d,TOP+60,BOT-120),1.4,1.1)});
  tries((x,y)=>Math.random()<.5?cnVent(T,x,y,.8):cnSpikes(T,x,y,90,.5));
  if(T.tier>=1)tries((x,y)=>cnVent(T,x,y,2))}
function cnTrBoss(T){cnSaw(T,L+30,TOP+130,L+30,BOT-130,0,.8);cnSaw(T,R-30,TOP+130,R-30,BOT-130,Math.PI,.8);cnVent(T,L+80,BOT-90,0);cnVent(T,R-80,BOT-90,1.6)}
function cnTrTick(dt){const T=G.cnTr;if(!T)return;if(G.state==='dead'||G.state==='trans')return;T.t+=dt;const tt=T.t,w=cnWorld();
  for(const o of T.list){
    if(o.k==='saw'){const s=(1-Math.cos(tt*o.sp+o.ph))/2,nx=o.x1+(o.x2-o.x1)*s,ny=o.y1+(o.y2-o.y1)*s;o.v=Math.hypot(nx-o.x,ny-o.y)/Math.max(dt,1e-3);o.x=nx;o.y=ny;o.rot+=dt*14;
      if(Math.hypot(P.x-o.x,(P.y-o.y)*1.25)<o.r+P.r*.6)cnTrHit(16,o);cnTrEnemies(o,e=>Math.hypot(e.x-o.x,(e.y-o.y)*1.25)<o.r+e.r*.6);
      if(!LOWFX&&o.v>40&&Math.random()<dt*10)fxPush({k:'spark',x:o.x+rand(-o.r,o.r),y:o.y+rand(-3,3),t:.18})}
    else if(o.k==='beam'){const s=(1-Math.cos(tt*o.sp+o.ph))/2;o.y=o.y1+(o.y2-o.y1)*s;const hit=e=>e.x>o.xa-e.r*.5&&e.x<o.xb+e.r*.5&&Math.abs(e.y-(o.y-9))<12+e.r*.45;
      if(hit(P))cnTrHit(14,o);cnTrEnemies(o,hit)}
    else{const p=((tt+o.ph)%o.per+o.per)%o.per/o.per,st=o.k==='spk'?(p<.55?0:p<.75?1:2):(p<.6?0:p<.78?1:2);
      if(st!==o.st){o.st=st;if(st===2){if(o.k==='spk'){sfx('click',0,o.x);tone(900,300,.08,'square',.02)}else{tone(w===2?120:w===4?900:200,w===4?300:60,.45,'sawtooth',.035);if(!LOWFX)vfxBlast(o.x,o.y-30,CN_WRGB[w],34,{sparks:8})}}}
      o.u=st===2?Math.min(1,o.u+dt*9):Math.max(0,o.u-dt*4);
      if(st===2){const hit=o.k==='spk'?e=>Math.abs(e.x-o.x)<o.w/2+e.r*.3&&Math.abs(e.y-o.y)<o.h/2+e.r*.3:e=>Math.hypot(e.x-o.x,(e.y-o.y)/.62)<o.r+e.r*.5;
        if(hit(P)){cnTrHit(o.k==='spk'?12:14,o);if(o.k==='vent'&&w===4)P.mire=Math.max(P.mire||0,1.2)}cnTrEnemies(o,hit)}}}
  if(T.kind==='corso'||T.kind==='fuga')cnTrExit(T);
  if(T.coins.length)for(const c of T.coins)if(!c.got&&Math.hypot(P.x-c.x,P.y-c.y)<20){c.got=1;G.gold+=2+Math.floor(effRoom()/5);sfx('coin',0,c.x);fxPush({k:'spark',x:c.x,y:c.y-6,t:.25});
    if(!T.coins.some(q=>!q.got))text(P.x,P.y-50,'Tutte le monete!','#ffd84a',15)}
  if(T.kind==='corso'&&!T.done){const left=Math.max(0,T.lim-tt),got=T.coins.filter(c=>c.got).length;
    cnHud(`<span class="${left>0?'':'ko'}"><b>Tempo</b>${Math.ceil(left)}</span><span class="${T.hit?'ko':''}"><b>Colpi</b>${T.hit?'✗':'0'}</span><span><b>Monete</b>${got}/${T.coins.length}</span>`)}}
function cnTrHit(base,o){if(G.state==='dead'||P.inv>0||P.dashT>0)return;const h0=P.hp;hurtP(Math.round(base*DMG()));if(P.hp<h0&&G.cnTr){G.cnTr.hit=true;if(o&&o.k==='saw'&&!LOWFX)vfxBlast(P.x,P.y-10,'255,230,180',26,{sparks:8})}}
function cnTrEnemies(o,hit){for(const e of G.enemies){if(!canHit(e)||e.cnAnchor||cnFlies(e)||!hit(e)||e.cnTrT>G.t)continue;e.cnTrT=G.t+.8;const b=isBoss(e.type);
    hurtE(e,b?e.max*.02:e.max*.16,false,true);if(!b&&e.cnTrT){e.vx=(e.vx||0)+(e.x-(o.x??e.x))*2;e.vy=(e.vy||0)+(e.y-(o.y??e.y))*2}}}
// l'uscita: percorso (tre traguardi e il premio) e fuga (chi resta indietro cade col pavimento)
function cnTrExit(T){if(T.done||P.y>TOP+8||Math.abs(P.x-AW/2)>DOORW+6)return;T.done=true;
  if(T.xp)gainXp(T.xp);
  if(T.kind==='fuga'){for(const e of G.enemies)if(!e.dead&&!isBoss(e.type)){e.dead=true;fxPush({k:'puff',x:e.x,y:e.y-e.r,vx:0,vy:-20,t:.4,r:8})}G.enemies=G.enemies.filter(e=>!e.dead);G.cnCol=null;
    banner('Ce l\'hai fatta!','Il pavimento è crollato alle tue spalle',1.4);return}
  const ok=[T.t<=T.lim,!T.hit,T.coins.every(c=>c.got)],n=ok.filter(Boolean).length,g=n*15;G.gold+=g;G.gemsRun=(G.gemsRun||0)+n;
  if(n===3){const v=Math.round(P.maxhp*.2);P.hp=Math.min(P.maxhp,P.hp+v)}
  cnHud('');banner(n===3?'Percorso perfetto!':'Percorso superato',`${'★'.repeat(n)}${'☆'.repeat(3-n)} · +${g} oro · +${n} cristall${n===1?'o':'i'}${n===3?' · cura':''}`,2.2);
  sfx(n===3?'levelup':'coin');T.res=ok}
// la fuga: il crollo sale dal fondo; chi resta sotto la linea cade (l'eroe no: un colpo e un salto in avanti)
function cnColTick(dt){const C=G.cnCol;if(!C||G.state==='dead'||G.state==='trans'||(G.cnTr&&G.cnTr.done))return;C.t+=dt;if(C.t<0){if(C.t>-.5&&Math.random()<dt*20&&!LOWFX)fxPush({k:'puff',x:rand(L,R),y:BOT-4,vx:0,vy:-10,t:.4,r:5});return}
  const vmax=58+4*(G.cnTr?G.cnTr.tier:0);C.v=Math.min(vmax,C.v+dt*40);const y0=C.y;C.y=Math.max(TOP+30,C.y-C.v*dt);
  C.cd-=dt;if(C.cd<=0){C.cd=.55;tone(46,34,.6,'sawtooth',.035);if(Math.random()<.5)shake(.8)}
  if(!LOWFX||Math.random()<.4)for(let i=0;i<2;i++)if(Math.random()<dt*16)C.chunks.push({x:rand(L,R),y:C.y+rand(0,8),vy:rand(20,60),w:rand(8,18),t:0,s:Math.random()});
  for(const ch of C.chunks){ch.t+=dt;ch.vy+=520*dt;ch.y+=ch.vy*dt}C.chunks=C.chunks.filter(ch=>ch.t<1.1);
  if(P.y+4>C.y&&!(P.dashT>0)){const v=Math.round(P.maxhp*.18);if(!(P.inv>0)){P.hp=Math.max(1,P.hp-v);text(P.x,P.y-40,'-'+v,'#ff6a5a',16);sfx('hurt');vib([30])}
    P.y=C.y-70;P.inv=Math.max(P.inv||0,1.2);shake(3);if(G.cnTr)G.cnTr.hit=true;vfxBlast(P.x,P.y+40,'200,190,170',40,{debris:'stone',n:8,dust:8})}
  for(const e of G.enemies)if(!e.dead&&!e.cnAnchor&&!cnFlies(e)&&!isBoss(e.type)&&e.y>C.y+4&&!(e.spawn>0)){killE(e,true);fxPush({k:'puff',x:e.x,y:e.y,vx:0,vy:30,t:.5,r:10})}
  const n=G.rocks.length;G.rocks=G.rocks.filter(k=>k.y<C.y-k.r*.3);if(G.rocks.length!==n){fields={};sfx('rock')}
  if(G.cnTr)G.cnTr.list=G.cnTr.list.filter(o=>(o.k==='saw'?Math.min(o.y1,o.y2):o.k==='beam'?o.y1:o.y)<C.y-10);
  if(y0>=BOT&&C.y<BOT)sfx('rock')}

// ---------------------------------------------------------------- collegamenti: stanze, aggiornamento, disegno, HUD
function cnMoSetup(){G.cnHoles=null;G.cnTr=null;G.cnCol=null;G.cnClimb=[];G.cnPick=null;
  if(G.cnA!=null&&!G.event){if(G.cnMode==='torre')cnTowSetup();else if(G.cnMode==='trappole')cnTrapSetup()}
  cnTowHud(true)}
{const _up=update;update=function(dt){const on=CN.on&&G&&P&&G.cnMode&&G.cnMode!=='stanze';
  if(on)try{cnTowTick(dt);cnShrineTick(dt);cnTrTick(dt);cnColTick(dt)}catch(err){cnErr(err)}
  const r=_up.apply(this,arguments);
  if(on)try{const CL=G.cnClimb||[];for(const c of CL)c.t-=dt;if(CL.length)G.cnClimb=CL.filter(c=>c.t>-.5);cnTowHud(false)}catch(err){cnErr(err)}return r}}
// in fuga la porta è aperta anche coi nemici in giro: chi esce li lascia indietro
{const _up=update;update=function(dt){const r=_up.apply(this,arguments);try{if(CN.on&&G&&G.cnTr&&G.cnTr.kind==='fuga'&&G.door&&G.state==='play'&&P.y<TOP-14){for(const e of G.enemies)e.dead=true;G.enemies=[]}}catch(err){cnErr(err)}return r}}
function cnTowHud(force){const T=G&&G.cnTw,on=!!(T&&G.cnMode==='torre'&&started&&!G.ended);let el=$('cnTow');
  if(!el){if(!on)return;el=document.createElement('div');el.id='cnTow';$('banner').parentElement.appendChild(el);const c=$('roomChip');if(c&&!$('cnFlTxt')){const s=document.createElement('span');s.id='cnFlTxt';c.appendChild(s)}}
  const c=$('roomChip');if(c)c.classList.toggle('cnw',on);if(el.hidden===on)el.hidden=!on;if(!on)return;
  const key=T.f+'|'+(G.cnRise?1:0);if(!force&&el._k===key)return;el._k=key;const N=T.plan.length,f=T.f||1;
  $('cnFlTxt').textContent=f+'/'+N;
  let h=`<b>Piano ${f}<small>/${N}</small></b><ol>`;for(let i=f;i<=Math.min(N,f+5);i++){const k=T.plan[i-1].k;h+=`<li class="k-${k}${i===f?' now':''}">${k==='b'?SKULL_SVG(true):CN_TWI[k]}</li>`}
  if(f+5<N)h+=`<li class="k-b far">${SKULL_SVG(true)}</li>`;el.innerHTML=h+'</ol>'}
const CN_TWI={n:'<svg viewBox="0 0 16 16"><path d="M12.5 2.5 6 9l1 1 6.5-6.5zM4.5 8.5l3 3M3 13l2-2" stroke="#e8e0d0" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  e:'<svg viewBox="0 0 16 16"><path d="M2 12 3 5l3 3 2-4 2 4 3-3 1 7z" fill="#ffd23c" stroke="#191714" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  m:'<svg viewBox="0 0 16 16"><path d="M4 13V8a4 4 0 0 1 8 0v5z" fill="#c9524a" stroke="#191714" stroke-width="1.4"/><path d="M4 8 1.5 3.5 5 6M12 8l2.5-4.5L11 6" fill="#e8e0d0" stroke="#191714" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  p:'<svg viewBox="0 0 16 16"><path d="M4 3h8l-1 5a3 3 0 0 1-6 0zM8 11v2M5 14h6" fill="#7fd8c0" stroke="#191714" stroke-width="1.4" stroke-linejoin="round"/></svg>'};
{const _do=drawOrbs;drawOrbs=function(){if(CN.on&&G&&P&&G.cnMode)try{cnMoGround()}catch(err){cnErr(err)}return _do.apply(this,arguments)}}
{const _db=drawBoulders;drawBoulders=function(){const r=_db.apply(this,arguments);if(CN.on&&G&&P&&G.cnMode)try{cnMoAir()}catch(err){cnErr(err)}return r}}
function cnMoGround(){const t=G.t,w=cnWorld();
  if(G.cnHoles)for(const h of G.cnHoles)cnDrawHole(h,w);
  if(G.cnCol)cnDrawCollapse(G.cnCol,w);
  if(G.cnRise&&!G.cnRise.sw){const R=G.cnRise,vy=G.vy||TOP;ctx.save();for(let i=0;i<4;i++){const y=vy+((R.t*760+i*230)%(VH+260))-130;const g=ctx.createLinearGradient(0,y-40,0,y+40);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,'rgba(10,8,14,.22)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(L-40,y-40,R-L+80,80)}ctx.restore()}
  if(G.cnTr)for(const o of G.cnTr.list){if(o.k==='saw')cnDrawRail(o);else if(o.k==='beam')cnDrawBeamRails(o)}
  if(G.cnTr)for(const o of G.cnTr.list){if(o.k==='spk')cnDrawSpikes(o,w);else if(o.k==='vent')cnDrawVent(o,w,t)}
  for(const c of G.cnClimb||[])cnDrawClimb(c);
  if(G.cnPick)for(const s of G.cnPick)cnDrawShrine(s,t);
  if(G.cnTr)for(const o of G.cnTr.list){if(o.k==='saw')cnDrawSaw(o,w);else if(o.k==='beam')cnDrawBeam(o,w,t)}
  if(G.cnTr&&G.cnTr.coins.length)for(const c of G.cnTr.coins)if(!c.got){const k=.4+.6*Math.abs(Math.cos(t*3.2+c.x*.37+c.y*.11));ctx.fillStyle='rgba(0,0,0,.25)';ell(c.x,c.y+5,4.5,1.6);ctx.fill();
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,214,90',c.x,c.y-2,14,.25);ctx.restore()}
    cnCoin3(c.x,c.y,t*3.2+c.x*.37+c.y*.11,1)}}
// a coin of gold standing on its edge and spinning: its two faces, the rim between them, a star on the face we see
function cnCoin3(x,y,sp,s){ctx.save();const K=proCam(OB3.face,x,y,1),{V0}=K,n=[Math.cos(sp),Math.sin(sp),0],c=[0,0,6.5*s],r=5.8*s,th=1.1*s,f=V0.F(n)>=0?1:-1;
  const A=C3.disc3(V0,[c[0]-n[0]*th,c[1]-n[1]*th,c[2]],n,r,{N:16}),B=C3.disc3(V0,[c[0]+n[0]*th,c[1]+n[1]*th,c[2]],n,r,{N:16}),H=C3.chull(A.concat(B));
  C3.poly(H);ctx.fillStyle='#b07a1a';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.lineJoin='round';ctx.stroke();
  const F=f>0?B:A;C3.poly(F);const b=C3.bbox(F),g=ctx.createLinearGradient(b[0],b[1],b[2],b[3]);g.addColorStop(0,'#fff0a0');g.addColorStop(.5,'#ffd84a');g.addColorStop(1,'#d89a20');ctx.fillStyle=g;ctx.fill();
  const q=[c[0]+n[0]*th*f*1.05,c[1]+n[1]*th*f*1.05,c[2]];C3.spot(V0,q,[n[0]*f,n[1]*f,0],r*.55,'rgba(176,122,26,.55)');C3.spot(V0,[q[0],q[1],q[2]+.4],[n[0]*f,n[1]*f,0],r*.3,'rgba(255,248,210,.85)');ctx.restore()}
function cnMoAir(){const t=G.t,w=cnWorld();
  if(G.cnTr)for(const o of G.cnTr.list)if(o.k==='vent'&&o.u>0)cnDrawJet(o,w,t);
  if(G.cnCol)for(const ch of G.cnCol.chunks){const a=1-ch.t/1.1,s=ch.w*(1-ch.t*.5);if(a<=0||s<1)continue;ctx.save();ctx.globalAlpha=a;
    oBox(proCam(OB3.face+ch.t*4*(ch.s-.5),ch.x,ch.y,1),[0,0,-s*.3],s*.9,s,s*.6,ch.s<.5?'#6b5d4c':'#4f4538',{lw:1.5,ew:.4,cf:n=>n[2]>.5?(ch.s<.5?'#6b5d4c':'#544a3c'):(ch.s<.5?'#4f4538':'#3a3229')});ctx.restore()}
  const R=G.cnRise;if(R){for(const f of CN.fx)if(f.k==='tdeb'){const a=f.t/f.max;ctx.globalAlpha=Math.min(1,a*1.5);if(f.dk){ctx.fillStyle='#3b342c';ctx.fillRect(f.x,f.y,f.s,f.s)}else{ctx.strokeStyle='rgba(230,220,200,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x,f.y-18);ctx.stroke()}ctx.globalAlpha=1}
    const s=CN_RISE.swap,a=R.t<s-.35?0:R.t<s?(R.t-(s-.35))/.35:R.t<s+.4?1-(R.t-s)/.4:0;if(a>0){ctx.fillStyle=`rgba(6,5,8,${(.92*a).toFixed(3)})`;ctx.fillRect((G.vx||0)-20,(G.vy||0)-20,VW+40,VH+40)}}}
// i disegni, con la telecamera dei mostri (y schiacciata a 0,55–0,62, z in su) e i tre toni della lanterna
function cnHolePath(h){if(h.path)return h.path;const pth=new Path2D();let s=h.seed;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280};
  for(const p of h.parts){const n=18;for(let i=0;i<n;i++){const a=i/n*TAU,rr=p.r*(.84+.2*rnd()),x=p.x+Math.cos(a)*rr,y=p.y+Math.sin(a)*rr*.62;i?pth.lineTo(x,y):pth.moveTo(x,y)}pth.closePath()}
  h.rub=[];for(let i=0;i<7;i++){const p=h.parts[i%h.parts.length],a=rnd()*TAU;h.rub.push({x:p.x+Math.cos(a)*p.r*1.05,y:p.y+Math.sin(a)*p.r*.66,s:2+rnd()*3.5})}
  return h.path=pth}
function cnDrawHole(h,w){const pth=cnHolePath(h),top=h.y-h.r*.62-10,bot=h.y+h.r*.62+6;
  ctx.save();ctx.clip(pth);
  const g=ctx.createLinearGradient(0,top,0,bot);g.addColorStop(0,'#6e6152');g.addColorStop(.35,'#3a3129');g.addColorStop(1,'#1d1814');ctx.fillStyle=g;ctx.fillRect(h.x-h.r*2,top-10,h.r*4,bot-top+20);
  ctx.translate(0,15);const d=ctx.createLinearGradient(0,top,0,bot+15);d.addColorStop(0,'#05040a');d.addColorStop(.7,'#0c0a12');d.addColorStop(1,`rgba(${CN_WRGB[w]},.35)`);ctx.fillStyle=d;ctx.fill(pth);ctx.translate(0,-15);
  if(!LOWFX){ctx.globalCompositeOperation='lighter';glow(CN_WRGB[w],h.x,h.y+h.r*.4,h.r*1.15,.26,h.r*.5);ctx.globalCompositeOperation='source-over';
    ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.2;for(let i=0;i<4;i++){const x=h.x-h.r*.6+i*h.r*.4;ctx.beginPath();ctx.moveTo(x,top+4);ctx.lineTo(x+3,top+15);ctx.stroke()}}
  ctx.restore();
  ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.stroke(pth);ctx.strokeStyle='rgba(255,240,210,.18)';ctx.lineWidth=1.2;ctx.save();ctx.translate(0,2);ctx.stroke(pth);ctx.restore();
  for(const r of h.rub){ctx.save();oRock(proCam(OB3.face,r.x,r.y,1),[0,0,0],r.s,r.s*.9,r.s*.7,'#6a5d4e',r.s*7,{small:1,lw:1.3});ctx.restore()}}
function cnDrawCollapse(C,w){const y=C.y;if(y>BOT+20)return;const x0=L-60,x1=R+60;ctx.save();
  const pth=new Path2D();pth.moveTo(x0,y);for(let x=x0,i=0;x<=x1;x+=18,i++)pth.lineTo(x,y+((i*37)%11)-5);pth.lineTo(x1,BOT+120);pth.lineTo(x0,BOT+120);pth.closePath();
  const d=ctx.createLinearGradient(0,y,0,BOT+120);d.addColorStop(0,'#06050a');d.addColorStop(.6,'#0d0b12');d.addColorStop(1,`rgba(${CN_WRGB[w]},.3)`);ctx.fillStyle=d;ctx.fill(pth);
  ctx.save();ctx.clip(pth);const f=ctx.createLinearGradient(0,y-6,0,y+20);f.addColorStop(0,'#6e6152');f.addColorStop(1,'#2a231d');ctx.fillStyle=f;ctx.beginPath();ctx.moveTo(x0,y-8);for(let x=x0,i=0;x<=x1;x+=18,i++)ctx.lineTo(x,y+((i*37)%11)-5+16);ctx.lineTo(x1,y-8);ctx.closePath();ctx.fill();ctx.restore();
  ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();for(let x=x0,i=0;x<=x1;x+=18,i++){const yy=y+((i*37)%11)-5;i?ctx.lineTo(x,yy):ctx.moveTo(x,yy)}ctx.stroke();
  if(!LOWFX){ctx.globalCompositeOperation='lighter';glow('255,90,60',(L+R)/2,y-10,(R-L)*.6,.12,30);ctx.globalCompositeOperation='source-over'}
  ctx.restore();
  ctx.save();ctx.globalAlpha=.55+.25*Math.sin(G.t*9);ctx.strokeStyle='#ff7a5a';ctx.lineWidth=2;ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(L,y-26);ctx.lineTo(R,y-26);ctx.stroke();ctx.restore()}
// --- the traps in 3D (Denis: «trasforma ogni cosa/ostacolo che è in 2d in 3d anche in game»): the monsters' camera at the trap's foot, a
// pixel a unit; a step of y on the floor is y/0,55 toward us (cnGQ), as for the obstacles (95)
function cnDrawRail(o){ctx.save();const K=proCam(OB3.face,o.x1,o.y1,1),{V0}=K,e=cnGQ(o.x2-o.x1,o.y2-o.y1,0),L=Math.hypot(e[0],e[1]),a=Math.atan2(e[1],e[0]),m=[e[0]/2,e[1]/2,0],ca=Math.cos(a),sa=Math.sin(a);
  const slot=[[-L/2-3,-3],[L/2+3,-3],[L/2+3,3],[-L/2-3,3]].map(([u,v])=>V0.P([m[0]+u*ca-v*sa,m[1]+u*sa+v*ca,0]));C3.poly(slot);ctx.fillStyle='#14110f';ctx.fill();
  for(const v of[-4,4])oBox(K,[m[0]-v*sa,m[1]+v*ca,0],L+6,1.8,1.8,'#5b6168',{a,lw:1.2,ew:.4,cf:n=>n[2]>.5?'#9aa2aa':'#5b6168'});
  for(const q of[[0,0,0],e])pRound(K,q,[[0,4.6],[4,4.2],[5.5,3]],'#5b6168',{m:12,lw:1.6,kl:.4,kd:.4});ctx.restore()}
const cnGQ=(dx,dy,z)=>OQ(dx,dy/.55,z);
function cnDrawBeamRails(o){ctx.save();for(const x of[o.xa-5,o.xb+5]){const K=proCam(OB3.face,x,o.y1-12,1),l=(o.y2+16-o.y1)/.55;oBox(K,[l/2,0,0],l,3,2.2,'#4a4f55',{lw:1.3,ew:.4,cf:n=>n[2]>.5?'#7a8088':'#4a4f55'})}ctx.restore()}
const CN_SAWC=['','#4a4560','#5a3a30','#4f5a3a','#6a8aa0'],CN_SAWL=['','#8f88b8','#ffb07a','#a8b878','#d8f0ff'];
function cnDrawSaw(o,w){const x=o.x,y=o.y,r=o.r,z=7;ctx.save();ctx.fillStyle='rgba(0,0,0,.36)';ell(x,y+3,r*1.25,r*.7);ctx.fill();
  if(o.v>30&&!LOWFX){const dx=(o.x2-o.x1),dy=(o.y2-o.y1),l=Math.hypot(dx,dy)||1,s=Math.sign(Math.sin(G.cnTr.t*o.sp+o.ph))||1;ctx.strokeStyle='rgba(230,235,240,.22)';ctx.lineWidth=2;
    for(let k=1;k<=2;k++){ctx.beginPath();ctx.ellipse(x-dx/l*s*k*7,y-z-dy/l*s*k*4,r*(1.15-k*.08),r*.58*(1.15-k*.08),0,0,TAU);ctx.stroke()}}
  const K=proCam(OB3.face,x,y,1),{V0}=K;
  // the teeth (lit on the side of the light), then the blade over their roots, a thin steel disc
  ctx.lineJoin='round';for(let i=0;i<12;i++){const a=o.rot+i*TAU/12,T=(b,k)=>V0.P([Math.cos(b)*r*k,Math.sin(b)*r*k,z+1.2]);C3.poly([T(a-.22,.9),T(a+.1,1.34),T(a+.14,.9)]);
    ctx.fillStyle=Math.sin(a)>0?'#e4e8ec':'#9aa2aa';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke()}
  pRound(K,[0,0,z],[[0,r],[2.6,r]],'#5d656e',{m:26,lw:2.4,kl:.45,kd:.5,rim:.3});
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=2;ctx.lineCap='round';C3.line(Array.from({length:9},(_,j)=>{const b=Math.PI*.45+j*.09;return V0.P([Math.cos(b)*r*.84,Math.sin(b)*r*.84,z+2.7])}));ctx.stroke();
  C3.disc3(V0,[0,0,z+2.7],[0,0,1],r*.62,{N:22});ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.2;ctx.stroke();
  for(let i=0;i<3;i++){const a=o.rot*.9+i*TAU/3;C3.spot(V0,[Math.cos(a)*r*.45,Math.sin(a)*r*.45,z+2.7],[0,0,1],r*.13,'#16130f')}
  if(w===2&&!LOWFX){ctx.globalCompositeOperation='lighter';const q=V0.P([0,0,z]);glow('255,110,40',q[0],q[1],r*1.5,.32);ctx.globalCompositeOperation='source-over';C3.disc3(V0,[0,0,z+1.3],[0,0,1],r*1.02,{N:26});ctx.strokeStyle='rgba(255,140,60,.8)';ctx.lineWidth=1.6;ctx.stroke()}
  if(w===4){C3.disc3(V0,[r*.15,r*.25,z+2.8],[0,0,1],r*.42,{N:16});ctx.fillStyle='rgba(220,245,255,.35)';ctx.fill()}
  pRound(K,[0,0,z+2.6],[[0,r*.27],[2.2,r*.24]],'#2a2622',{m:14,lw:1.6,kl:.3,kd:.3});C3.disc3(V0,[0,0,z+4.9],[0,0,1],r*.12,{N:12});ctx.fillStyle=`rgb(${CN_WRGB[w]})`;ctx.fill();
  if(!LOWFX){ctx.globalCompositeOperation='lighter';const q=V0.P([0,0,z+5]);glow(CN_WRGB[w],q[0],q[1],r*.5,.35);ctx.globalCompositeOperation='source-over'}
  ctx.restore()}
function cnDrawBeam(o,w,t){const y=o.y,hz=12,dp=16,x0=o.xa,x1=o.xb,W=x1-x0;ctx.save();ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x0+4,y-2,W,7);
  const K=proCam(OB3.face,(x0+x1)/2,y,1),{V0}=K,n=Math.floor(W/34),pul=.55+.45*Math.sin(t*5),c0=[-dp/2,0,0];
  oBox(K,c0,dp,W,hz,'#6a5e50',{lw:2.2,cf:n=>n[2]>.5?'#a89a84':'#6a5e50',face:(nn,q)=>{if(nn[0]<.5)return;const M=oMap(V0,...oCorners(V0,q));ctx.strokeStyle=`rgba(${CN_WRGB[w]},${(.6+.4*pul).toFixed(2)})`;ctx.lineWidth=1.6;ctx.lineCap='round';
    for(let i=0;i<n;i++){const u=(17+i*34)/W;C3.line([M(u-4/W,.25),M(u,.75),M(u+4/W,.25)]);ctx.stroke()}
    ctx.strokeStyle='rgba(255,245,220,.3)';ctx.lineWidth=1.2;C3.line([M(.01,.95),M(.99,.95)]);ctx.stroke()}});
  if(!LOWFX){ctx.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const q=V0.P([0,W/2-17-i*34,hz/2]);glow(CN_WRGB[w],q[0],q[1],9,.35*pul)}ctx.globalCompositeOperation='source-over'}
  for(const s of[-1,1])oBox(K,[c0[0],s*(W/2+3),0],dp+3,6,hz+3,'#4a4f55',{lw:1.6,cf:n=>n[2]>.5?'#7a8088':'#4a4f55'});
  ctx.restore()}
function cnDrawSpikes(o,w){const cols=Math.max(2,Math.round(o.w/22)),dx=o.w/cols,u=o.u;ctx.save();const K=proCam(OB3.face,o.x,o.y,1),{V0}=K;
  oBox(K,[0,0,0],o.h*.62/.55,o.w,2,'#4e443a',{lw:1.6,ew:.4,cf:n=>n[2]>.5?'#6e6152':'#3a3129'});
  for(let j=0;j<2;j++)for(let i=0;i<cols;i++){const c=cnGQ(-o.w/2+dx*(i+.5),-o.h*.15+j*o.h*.3,2.1);
    if(o.st===1&&!LOWFX){const q=V0.P(c);ctx.save();ctx.globalCompositeOperation='lighter';glow('255,90,60',q[0],q[1],8,.35);ctx.restore()}
    C3.disc3(V0,c,[0,0,1],3.6,{N:12});ctx.fillStyle=o.st===1?'#5a1e18':'#120f0d';ctx.fill();
    if(u>0)oPrism(K,c,4,3.2,.1,'#c9ced4',{tip:13*u,a:.78,lw:1.2,ew:.4,cf:n=>n[1]>0?'#e8ecf0':'#8a9098'})}
  ctx.restore()}
const CN_VC=['','#2a1e3a','#3a1a10','#24341a','#2a3a48'];
function cnDrawVent(o,w,t){const x=o.x,y=o.y,r=o.r;ctx.save();ctx.fillStyle='rgba(0,0,0,.3)';ell(x,y+3,r*1.15,r*.7);ctx.fill();const K=proCam(OB3.face,x,y,1),{V0}=K;
  pRound(K,[0,0,0],[[0,r],[3.6,r*.96]],'#7d7162',{m:22,lw:2.2,kl:.35,kd:.45});C3.disc3(V0,[0,0,3.7],[0,0,1],r*.64,{N:20});ctx.fillStyle=CN_VC[w];ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
  for(let i=-1;i<=1;i++)oBox(K,OQ(i*r*.3,0,2.6),r*1.15,1.8,1.2,'#2a2622',{lw:1,ew:.3,cf:n=>n[2]>.5?'#4a4440':'#1a1714'});
  if(o.st===1&&!LOWFX){ctx.globalCompositeOperation='lighter';glow(CN_WRGB[w],x,y,r*1.2,.35+.2*Math.sin(t*20));ctx.globalCompositeOperation='source-over';
    for(let i=0;i<3;i++){const a=t*6+i*2.1,q=V0.P([Math.cos(a)*r*.35,Math.sin(a)*r*.35,4+((t*30+i*7)%14)]);ctx.fillStyle=`rgba(${CN_WRGB[w]},.7)`;circ(q[0],q[1],1.8);ctx.fill()}}
  ctx.restore()}
function cnDrawJet(o,w,t){const x=o.x,y=o.y,H=95*o.u,r=o.r*.85;ctx.save();
  const add=w!==3;if(add)ctx.globalCompositeOperation='lighter';
  const c=CN_WRGB[w],g=ctx.createLinearGradient(0,y,0,y-H);g.addColorStop(0,`rgba(${c},.85)`);g.addColorStop(.6,`rgba(${c},.45)`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(x-r,y);ctx.quadraticCurveTo(x-r*.6+Math.sin(t*17)*3,y-H*.5,x-r*.35,y-H);ctx.lineTo(x+r*.35,y-H);ctx.quadraticCurveTo(x+r*.6+Math.sin(t*13)*3,y-H*.5,x+r,y);ctx.closePath();ctx.fill();
  if(!LOWFX){glow(c,x,y-H*.3,r*1.6,.35*o.u);for(let i=0;i<5;i++){const k=((t*2.2+i*.21)%1),px=x+Math.sin(i*7+t*9)*r*.6;ctx.fillStyle=`rgba(${w===2?'255,220,120':w===4?'235,250,255':w===3?'200,255,150':'220,190,255'},${(1-k)*.8})`;circ(px,y-H*k,2.2*(1-k*.5));ctx.fill()}}
  ctx.restore()}
function cnDrawClimb(c){const k=1-c.t/c.max;if(k<0||k>1.4)return;ctx.save();ctx.globalAlpha=Math.min(1,k*3)*(c.t<0?Math.max(0,1+c.t*2):1);
  const out=c.side===0?[-1,0]:c.side===1?[1,0]:[0,1],x=c.x+out[0]*(c.r+2),y=c.y+out[1]*(c.r*.6+2);ctx.fillStyle='rgba(0,0,0,.35)';ell(x,y,c.r*1.1,c.r*.45);ctx.fill();
  // two hands gripping the edge: the palm and three fingers bent over toward the floor
  const K=proCam(OB3.face,x,y,1),{V0}=K,o3=cnGQ(-out[0],-out[1],0),ol=Math.hypot(o3[0],o3[1])||1,f=[o3[0]/ol,o3[1]/ol,0],sd=[-f[1],f[0],0];
  for(const s of[-1,1]){const h=[sd[0]*s*c.r*.6,sd[1]*s*c.r*.6,1.5];C3.sball(V0,h,3.4,'#7d6e5c',{lw:1.3,kl:.35,kd:.4,rim:.2});
    for(let i=-1;i<=1;i++){const b=[h[0]+f[0]*2.2+sd[0]*i*1.8,h[1]+f[1]*2.2+sd[1]*i*1.8,2.4],e=[b[0]+f[0]*3.2,b[1]+f[1]*3.2,.5];C3.caps(V0,b,1.1,e,.8,'#7d6e5c',{lw:1,noRim:1})}}
  if(!LOWFX&&Math.random()<.3)fxPush({k:'puff',x:x+rand(-6,6),y,vx:0,vy:-12,t:.35,r:4});
  ctx.restore()}
function cnDrawShrine(s,t){if(s.gone)return;const x=s.x,y=s.y,a=s.used?Math.max(0,1-(G.cnPick&&G.cnPick.dt||0)*1.2):1;ctx.save();ctx.globalAlpha=a;
  ctx.fillStyle='rgba(0,0,0,.32)';ell(x,y+4,30,11);ctx.fill();ctx.save();const K=proCam(OB3.face,x,y,1),{V0}=K;
  if(s.k==='fonte'){pRound(K,[0,0,0],[[0,25],[3,23],[11,22],[13.5,24.5]],'#a89a86',{m:26,lw:2.2,kl:.35,kd:.45});C3.disc3(V0,[0,0,13.6],[0,0,1],24,{N:26});ctx.fillStyle='#c9bca6';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
    C3.disc3(V0,[0,0,13.8],[0,0,1],18,{N:24});ctx.fillStyle='#3a8fb8';ctx.fill();C3.disc3(V0,[2,4,13.9],[0,0,1],8,{N:16});ctx.fillStyle='rgba(170,235,255,.35)';ctx.fill();
    if(!LOWFX){ctx.globalCompositeOperation='lighter';glow('120,220,255',0,-20,30,.35+.1*Math.sin(t*3));ctx.globalCompositeOperation='source-over'}
    for(let i=0;i<3;i++){const k=(t*.8+i/3)%1;C3.sball(V0,[Math.sin(i*2.1)*6,Math.cos(i*2.1)*4,15+k*24],2.2*(1-k)+.3,'#d8f4ff',{lw:.8,kl:.5,kd:.2,rim:.1})}}
  else{oBox(K,[0,0,0],18,46,13,'#8c7e6a',{lw:2.2,cf:n=>n[2]>.5?'#c9bca6':'#7a6c5a'});oPrism(K,[0,0,13],4,9,27,'#7a6c5a',{rt:6.5,a:.78,lw:2,cf:n=>n[2]>.5?'#a89a86':n[1]>0?'#8c7e6a':'#625646'});
    const z=46+Math.sin(t*4);if(!LOWFX){ctx.globalCompositeOperation='lighter';const q=V0.P([0,0,z]);glow('255,214,90',q[0],q[1],28,.4+.1*Math.sin(t*4));ctx.globalCompositeOperation='source-over'}
    C3.sball(V0,[0,0,z],6+Math.sin(t*4),'#ffd84a',{lw:1.8,kl:.6,kd:.2,rim:.3})}
  ctx.restore();ctx.font='12px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=INK;const lb=s.k==='fonte'?'Fonte · cura':'Altare · abilità';ctx.strokeText(lb,x,y+20);ctx.fillStyle='#f6ead2';ctx.fillText(lb,x,y+20);
  ctx.restore()}
// la fine della partita nella torre: il piano a cui sei arrivato e il record
{const _er=endRun;endRun=function(win,quit){const T=G&&G.cnTw,a=G&&G.cnA,f=T?(win?T.plan.length:T.f||1):0;const r=_er.apply(this,arguments);
  try{const lab=$('eRoom').nextElementSibling;if(lab)lab.textContent='Stanza';   // a tower before leaves «Piano» there
    if(CN.on&&T&&a!=null){const S=cnS(),B=S.best[a]||(S.best[a]={fu:-1,win:false});B.fl=Math.max(B.fl||0,f);save();
    $('eRoom').textContent=f;if(lab)lab.textContent='Piano';
    if(!win&&!quit)$('endText').textContent=`Sei arrivato al piano ${f} di ${T.plan.length} della torre.`}
    $('cnTow')&&($('cnTow').hidden=true);const c=$('roomChip');if(c)c.classList.remove('cnw');cnHud('')}catch(err){cnErr(err)}return r}}
{const _sm=showMenu;showMenu=function(){const el=$('cnTow');if(el)el.hidden=true;const c=$('roomChip');if(c)c.classList.remove('cnw');return _sm.apply(this,arguments)}}
const cnNoNem=()=>(G.cnMode==='trappole'&&/corso|fuga/.test(CN_TRK[G.room]||''))||(G.cnMode==='torre'&&!!G.cnTw&&(G.cnTw.plan[G.si]||{}).k==='p');
const cnRecTxt=i=>{if(cnModeOf(i)==='torre'){const f=(cnS().best[i]||{}).fl||0;return f?f+'/'+cnFloorsOf(i):''}const b=bestRoom(i);return b?b+'/'+ROOMS:''};
// la striscia della scheda dell'arena: le stanze, i piani della torre (i Campioni, il premio, il custode) o le stanze delle trappole
function cnTrack(i){const m=cnModeOf(i),B=cnS().best[i]||{};let tr='';
  if(m==='torre'){const Q=cnTowPlan(i),b=B.fl||0,N=Q.length;for(let f=1;f<=N;f++){const q=Q[f-1],boss=q.k==='b';tr+=(f>1?`<i class="rl ${f<=b?'on':''}"></i>`:'')+`<span class="rn ${boss?'boss':''} ${q.k==='e'||q.k==='m'?'elite':''} ${q.k==='p'?'prem':''} ${f<=b?'on':''} ${f===b+1?'next':''}">${boss?SKULL_SVG(true):''}</span>`}return`<div class="rtrack${N>10?' cn20':''}">`+tr}
  const b=bestRoom(i);for(let r=1;r<=ROOMS;r++){const boss=isBossRoom(r),k=m==='trappole'&&!boss?CN_TRK[r]:'';tr+=(r>1?`<i class="rl ${r<=b?'on':''}"></i>`:'')+`<span class="rn ${boss?'boss':''} ${r===5?'elite':''} ${k?'k-'+k:''} ${r<=b?'on':''} ${r===b+1?'next':''}">${boss?SKULL_SVG(r===ROOMS):''}</span>`}
  return'<div class="rtrack">'+tr}

// ---------------------------------------------------------------- 7 il cammino delle isole (la schermata principale della Classica)
// Denis: «e faremo in modo che si avanzi così come vedi nelle immagini» (le isole dei capitoli di Archero 2), poi le sue risposte: al posto
// della cripta l'isola dell'arena con l'eroe in piedi sopra, che scorrendo col dito salta all'isola dopo; ogni isola un pezzo del suo mondo
// sospeso sull'abisso come nel prologo (nebbia, la luce del mondo, il suo custode che dorme sopra); sotto il braciere, «Completata», il
// record e la modalità; Torre, Corsa, Reliquie e Ricercati in una fila sopra Gioca. Le isole usano gli attrezzi del prologo (proCam,
// pSlab, pBox, pRound…); i pezzi fermi di ogni isola sono dipinti una volta in una tela loro (ISL.cache) e copiati.
const ISL={cur:null,view:null,drag:null,jump:null,go:null,cache:new Map(),lay:null,t:0,lastPick:null};
const CNI_R=100,CNI_SY=1.38,CNI_DEP=40,CNI_FACE=Math.PI/2+.16,CNI_HERO=1.55,CNI_BOSS=.62;
// the path goes north (Denis, 20 ottobre notte: «anziché far le isole alla destra facciamole da nord, così il ponte si vede per dritto»):
// island i stands CNI_GAP units north of island i-1 and the ones further north are drawn smaller (CNI_PD), as things far away
const CNI_GAP=380,CNI_PD=1700,CNI_HOLD=.45;
const IP=(sx,sy,z)=>[sy,-sx,z||0];   // a point of an island by screen directions: sx to the right, sy toward you, z up
// north and east of the path in the islands' own coordinates (the islands are turned a little for the camera, the path is not): north is
// straight up the screen, east straight to the right
const CNI_C=Math.cos(CNI_FACE),CNI_S=Math.sin(CNI_FACE),CNI_NV=[-CNI_S,-CNI_C,0],CNI_EV=[CNI_C,-CNI_S,0];
const cnChain=(n,e,z)=>[n*CNI_NV[0]+e*CNI_EV[0],n*CNI_NV[1]+e*CNI_EV[1],z||0];   // n north, e east, z up: a point of the island
const cnIslNE=p=>[p[0]*CNI_NV[0]+p[1]*CNI_NV[1],p[0]*CNI_EV[0]+p[1]*CNI_EV[1]];      // and back: [north, east] of a point
const cnV=()=>ISL.V||(ISL.V=C3.V(CNI_FACE));
const cnLt=()=>ISL.Lt||(ISL.Lt=C3.nrm([-CNI_C*.55+CNI_S*.35,CNI_S*.55+CNI_C*.35,.78]));
const CN_ISW=[null,
  {top:'#6f9a4a',side:'#4a3f34',edge:'#eaffb8',stone:'#9a9686',path:'#a8a08a',light:'170,235,130',sky:['#08161a','#123a2c'],fog:'120,180,140',deco:['#ff6a5a','#ffd84a','#c890ff','#ffffff']},
  {top:'#634238',side:'#2e1d19',edge:'#ffb27a',stone:'#55494a',path:'#4a3a36',light:'255,130,50',sky:['#160806','#3e160a'],fog:'160,90,60',deco:['#ff7a30','#ffd070']},
  {top:'#5f8040',side:'#3a3424',edge:'#e8f8a0',stone:'#7a7a62',path:'#8a7a5a',light:'190,240,110',sky:['#07130c','#1e3414'],fog:'120,170,100',deco:['#e070ff','#ffe066','#ffffff']},
  {top:'#eef6fc',side:'#7d93ab',edge:'#ffffff',stone:'#c4d4e4',path:'#cfe0f0',light:'160,215,255',sky:['#0a1426','#1c3456'],fog:'170,200,240',deco:['#9fdcff','#ffffff']}];
const cnIslW=i=>CN_ISW[Math.max(1,Math.min(4,ARENAS[i].ch||1))];
const cnIslG=i=>Math.floor(i/4);   // the round: 0 the first four arenas, 1 the second, 2 the third
const cnIslOn=()=>CN.on&&!zMode()&&!$('tabPlay').hidden;
const cnMixC=(a,b,k)=>{const p=s=>[1,3,5].map(j=>parseInt(s.slice(j,j+2),16)),A=p(a),B=p(b);return'#'+A.map((v,j)=>Math.round(v+(B[j]-v)*k).toString(16).padStart(2,'0')).join('')};
// where the hero stands (in front, beside the path) and the guardian sleeps (on the right), the gate on the left, the brazier before it
const CI_HERO=IP(-34,44),CI_BOSS=IP(84,-28),CI_GATE=IP(-92,-36),CI_BRAZ=IP(-112,18);
// the world of an island for the things borrowed from the rooms (95): its name and its stones
const cnIslTh=ch=>['muschio','muschio','cenere','palude','brina'][ch]||'muschio';
const cnIslPal=ch=>ch===3?stonePal3('palude'):ch===4?stonePal3('brina'):ch===2?{hi:'#6e6058',mid:'#4d423c',lo:'#2e2622',moss:'#e8641c'}:{hi:'#a39684',mid:'#7d7262',lo:'#554c40',moss:'#6fa040'};
function cnIslSync(anim){const p=cnPick(),B=CN.brAnim;
  if(B&&anim&&ARENAS[B.i+1]){CN.brAnim=null;ISL.cur=B.i;ISL.view=B.i;ISL.jump=null;ISL.go=null;const t0=performance.now();
    // the camera looks at the bridge, the stones of the run fall in place one by one; a finished bridge, the hero walks over it
    ISL.hold={v:B.i+CNI_HOLD,from:t0+450,until:t0+(B.done?2600:2900)};ISL.brA={i:B.i,from:B.from,to:B.to,t0:(t0+900)/1000};
    if(B.done&&cnOpen(B.i+1))setTimeout(()=>{if(ISL.cur===B.i&&!ISL.drag){ISL.hold=null;cnIslMove(B.i,B.i+1);sfx('ui');tone(330,660,.18,'triangle',.03)}},2700);
    return}
  if(ISL.cur==null||!anim||!cnOpen(p)){ISL.cur=p;ISL.view=p;ISL.jump=null;ISL.go=null;return}
  if(p!==ISL.cur){const a=ISL.cur;ISL.view=a;setTimeout(()=>{if(ISL.cur===a&&!ISL.drag){cnIslMove(a,p);sfx('ui');tone(330,660,.18,'triangle',.03)}},700)}}
// the hero goes to island b: on foot over the bridge to the next island or the one before, with a jump further
function cnIslMove(a,b){ISL.cur=b;ISL.go=b;const w=Math.abs(b-a)===1?cnIslWay(a,b):null;ISL.jump=w?{a,b,t:0,way:w,dur:Math.max(1,w.len/230)}:{a,b,t:0,dur:.75}}
// ------------------------------------------------ the place of everything on the canvas (canvas pixels)
// the name on top, the line under the island at the bottom; between them, from the bottom up: the island you are on, its bridge going
// north, the front of the next island with the pillars of the bridge's end; as wide as 62% of the screen at most
function cnIslLay(){const W=campCv.width,H=campCv.height,cr=campCv.getBoundingClientRect(),dpr=W/Math.max(1,cr.width),r=el=>el.getBoundingClientRect();
  const top=(r($('topbar')).bottom-cr.top)*dpr,pill=(r($('heroPill')).top-cr.top)*dpr,lab=top+6*dpr,titleB=lab+40*dpr,info=pill-13*dpr,low=info-15*dpr;
  // the names stay between the buttons on the left and on the right (and the zombie hand that hangs on the right, src/js/67-menu-modi.js)
  const sl=document.querySelector('#homeStage .sideBtns.l'),sr=document.querySelector('#homeStage .sideBtns.r'),zh=$('zHand'),zq=zh&&zh.offsetParent?r(zh):null;
  let tl=sl?(r(sl).right-cr.left)*dpr+6*dpr:W*.17,tr=sr?(r(sr).left-cr.left)*dpr-6*dpr:W*.83;if(zq&&(zq.top-cr.top)*dpr<titleB)tr=Math.min(tr,(zq.left-cr.left)*dpr-4*dpr);
  const f1=CNI_PD/(CNI_PD+CNI_GAP),up=.55*f1*(CNI_GAP-CNI_R)+30*f1,dn=.55*CNI_R,
    k=Math.max(.2*dpr,Math.min(W*.62/(2*CNI_R*CNI_SY),(low-titleB)/(up+dn))),cy=(titleB+low)/2+(up-dn)/2*k;
  return{W,H,dpr,top,pill,k,cx:W/2,cy,info,lab,titleB,tl,tr,hs:CNI_HERO,pairPx:.55*k*CNI_GAP*f1}}
// where island j is on the screen now: its middle, how big (the further north the smaller), the gentle bob of all of them together
function cnIslAt(j,L,t,nob){const d=Math.max(-CNI_PD*.55,(j-ISL.view)*CNI_GAP),f=CNI_PD/(CNI_PD+d);return{j,x:L.cx,y:L.cy-.55*L.k*d*f+(nob?0:Math.sin(t*.9)*2.2*L.dpr*f),f,k:L.k*f}}
const cnIslS=(A,p)=>{const q=cnV().P(p);return[A.x+q[0]*A.k,A.y+q[1]*A.k]};
// how far the edge of island j is from its middle going north (or south) along the path: the same uneven edge as pSlab
function cnIslRim(j,north){const sd=j*1.7+.4,dx=north?CNI_NV[0]:-CNI_NV[0],dy=north?CNI_NV[1]:-CNI_NV[1],a=Math.atan2(dy/CNI_SY,dx),
  r=CNI_R*(1+.07*Math.sin(a*3+sd)+.045*Math.sin(a*7+sd*2.1)+.025*Math.sin(a*13+sd*.7));return r*Math.hypot(Math.cos(a),Math.sin(a)*CNI_SY)}
// ------------------------------------------------ the still pieces of an island, painted once
function cnIslImg(i,L){const won=cnWon(i),op=cnOpen(i),key=i+'|'+L.k.toFixed(3)+'|'+(won?1:0)+(op?1:0)+(LOWFX?1:0)+'|n';let c=ISL.cache.get(key);if(c){ISL.cache.delete(key);ISL.cache.set(key,c);return c}
  const k=L.k,w=Math.ceil(2*(CNI_R*CNI_SY+26)*k),h=Math.ceil(300*k),ox=w/2,oy=Math.ceil(152*k),cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const saved=ctx;ctx=cv.getContext('2d');try{ctx.save();const K=proCam(CNI_FACE,ox,oy,k);cnIslPaint(i,K,won,op);ctx.restore();
    ctx.globalCompositeOperation='source-atop';const lg=ctx.createLinearGradient(w*.15,0,w*.85,h);lg.addColorStop(0,'rgba(255,248,225,.13)');lg.addColorStop(.55,'rgba(0,0,0,0)');lg.addColorStop(1,'rgba(10,8,30,.28)');ctx.fillStyle=lg;ctx.fillRect(0,0,w,h);
    // a locked island (Denis: «oscura tutte le arene non accessibili»): almost black, only its outline, the lock on it
    if(!op){ctx.fillStyle='rgba(5,6,12,.84)';ctx.fillRect(0,0,w,h)}ctx.globalCompositeOperation='source-over';
    if(!op){ctx.save();cnIslLock(proCam(CNI_FACE,ox,oy,k),-CI_GATE[1],CI_GATE[0]);ctx.restore()}}catch(err){cnErr(err)}finally{ctx=saved}
  c={cv,ox,oy};ISL.cache.set(key,c);while(ISL.cache.size>6)ISL.cache.delete(ISL.cache.keys().next().value);return c}
// where the water (the lava, the ice) leaves the island: its edge in front, on the right
function cnIslFallPt(i){const sd=i*1.7+.4,d=IP(.75,.66),a=Math.atan2(d[1]/CNI_SY,d[0]),r=CNI_R*(1+.07*Math.sin(a*3+sd)+.045*Math.sin(a*7+sd*2.1)+.025*Math.sin(a*13+sd*.7));return[Math.cos(a)*r*.985,Math.sin(a)*r*CNI_SY*.985,0]}
// the pool, the stream and the fall of each world: [water, its light, the pool's rim]
const CNI_FALL=[null,['#4f9cd0','#d8f2ff','#3a4a40'],['#ff6a20','#ffd070','#2a1a14'],['#2f5a44','#b8e8d0','#183022'],['#a8d4f0','#ffffff','#7d93ab']];
function cnIslPaint(i,K,won,op){const{V0}=K,Wd=cnIslW(i),ch=ARENAS[i].ch||1,g=cnIslG(i),ac=ARENAS[i].col,P=p=>V0.P(p),D=p=>V0.D(p);
  const mix=(c,q)=>g?cnMixC(c,ac,q*g):c,top=mix(Wd.top,.14),stone=mix(Wd.stone,.12),side=mix(Wd.side,.1),seed=i*1.7+.4,gx=-CI_GATE[1],gy=CI_GATE[0],SP=cnIslPal(ch),TH=cnIslTh(ch);
  // under the island a big rock hangs into the dark; then the ground, an uneven slab with its side; on top only the stains of the world
  cnIslUnder(K,ch,side,seed);
  pSlab(K,CNI_R,CNI_DEP,top,side,seed,{sy:CNI_SY,edge:Wd.edge,mark:T=>cnIslMarks(i,K,ch,Wd,mix)});
  if(ch===4)for(let j=0;j<26;j++){const a=-Math.PI*.44+j/25*Math.PI*.88,r=CNI_R*(.97+.05*Math.sin(a*3+seed)),p=[Math.cos(a)*r,Math.sin(a)*r*CNI_SY,0];if(V0.F([Math.cos(a),Math.sin(a),0])<.1)continue;pCone(K,p,2.4+prH(j,5)*2.4,-(7+prH(j,6)*14),'#d4ecfb',{m:6,lw:1})}
  // roots and grass hanging from the edge
  if(ch===1||ch===3)for(let j=0;j<15;j++){const a=-Math.PI*.42+j/14*Math.PI*.84,r=CNI_R*.98,o=[Math.cos(a),Math.sin(a)*CNI_SY],p=[o[0]*r,o[1]*r,-2],l=12+prH(j,9)*16;
    oStem(V0,p,[p[0]+o[0]*3,p[1]+o[1]*3+(prH(j,7)-.5)*4,-2-l*.55],[p[0]+o[0]*1.5,p[1]+(prH(j,8)-.5)*6,-2-l],ch===1?'#5a8a3a':'#4a6a2a',1.3)}
  // the water of the world running from its pool to the edge and falling down the side
  const E=cnIslFallPt(i),S0=[E[0]*.56,E[1]*.56,0];cnIslFall(K,ch,E);
  // what lies flat on the ground first (the path, pools, moss, ice), then what stands on it, far to near
  const flat=[],parts=[],F=(sx,sy,f)=>flat.push({d:D(IP(sx,sy)),f}),R=(sx,sy,f,dz)=>parts.push({d:D(IP(sx,sy))+(dz||0),f}),
    at=(p,f)=>()=>{const q=P(p);ctx.save();ctx.translate(q[0],q[1]);try{f()}finally{ctx.restore()}},
    // one of the rooms' things (95) standing here, r wide and h high
    OMd=(sx,sy,kind,r,h,sd)=>{const M=typeof OB3!=='undefined'&&OB3.M[kind];if(M)R(sx,sy,at(IP(sx,sy),()=>M(K,{kind,r,seed:sd,x:0,y:0},r,h,sd,SP,TH,false)))};
  const free=(sx,sy)=>cnIslFree(sx,sy)&&Math.hypot(sx-(-S0[1]),sy-S0[0])>26&&cnIslOffStream(sx,sy,S0,E);
  // the path: from where the bridge from the south lands, past the hero, to the bridge going north; a branch to the gate
  {const nS=-cnIslRim(i,false)+8,nN=cnIslRim(i,true)-8;for(let j=0;j<=10;j++){const n=plerp(nS,nN,j/10),e=Math.sin(j*1.7+seed)*3,c=cnChain(n,e),w=15+(j%3)*1.5;flat.push({d:D(c),f:()=>cnIslStone(K,c,w*.95,w*.6,1.8,mix(Wd.path,.08),seed+j)})}
    const b0=cnChain(-6,0),gf=IP(gx+4,gy+12);for(let j=1;j<=4;j++){const u=j/5,c=[plerp(b0[0],gf[0],u),plerp(b0[1],gf[1],u),0];flat.push({d:D(c),f:()=>cnIslStone(K,c,11,8,1.6,mix(Wd.path,.08),seed+20+j)})}}
  // the pool of the world (its water runs to the fall)
  flat.push({d:D(S0)-1,f:()=>cnIslPool(K,S0,ch===2?24:28,ch===2?13:15,CNI_FALL[ch][0],ch===4?'rgba(255,255,255,.5)':ch===2?'#ffc060':'rgba(220,245,255,.35)',CNI_FALL[ch][2],seed)});
  if(ch===3)flat.push({d:D(S0),f:()=>{for(const[dx,dy,r,f] of[[-12,2,5,'#ff8ad8'],[9,-5,4.2,0],[15,6,3.4,'#ffe066'],[-4,-9,3,0]])cnIslPad(K,[S0[0]+dy,S0[1]-dx,.5],r,f,seed+dx)}});
  if(ch===4)flat.push({d:D(S0),f:()=>{ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=1;ctx.lineCap='round';for(const[o,l] of[[-6,14],[3,10]]){C3.line([[S0[0]+o,S0[1]-l,.4],[S0[0]+o+2,S0[1],.4],[S0[0]+o,S0[1]+l*.8,.4]].map(P));ctx.stroke()}}});
  for(let j=0;j<11;j++){const t=j/11*TAU+seed,c=[S0[0]+Math.cos(t)*(ch===2?14:16),S0[1]+Math.sin(t)*(ch===2?26:30),0];R(-c[1],c[0],()=>oRock(K,c,2.4+prH(j,seed)*1.8,2.3,2.1,ch===4?'#dfeefa':ch===2?'#2e2628':C3.dk(Wd.stone,.15),seed+j,{small:1,lw:1.1}))}
  // the gate of the arena: an arch of stone on two pillars, its dark mouth (the light of the arena lives in it)
  parts.push({d:D(CI_GATE),f:()=>cnIslGate(K,gx,gy,stone,ac,g,op)});
  // the brazier of the fire: lit once the arena is won (the flame is alive, drawn on top); cold ash and stones before
  parts.push({d:D(CI_BRAZ),f:()=>{const B=CI_BRAZ;pRound(K,B,[[0,8.5],[3,7.5],[4,5],[12,3.8]],stone,{m:16,lw:1.6});
    for(let j=0;j<3;j++){const t=j/3*TAU+.4;C3.caps(V0,[B[0]+Math.cos(t)*4,B[1]+Math.sin(t)*4,11],1.2,[B[0]+Math.cos(t)*9,B[1]+Math.sin(t)*9,17],1,'#3a3434',{lw:1.2,noRim:1})}
    pRound(K,[B[0],B[1],12],[[0,4.5],[3,8.5],[6,11.5],[7.5,11]],'#45403e',{m:18,lw:1.7,kl:.35,kd:.45,rim:.3});C3.disc3(V0,[B[0],B[1],19.6],[0,0,1],10,{N:20});ctx.fillStyle=won?'#4a1e0a':'#1e1a18';ctx.fill();
    for(let j=0;j<7;j++){const t=j/7*TAU+seed,rr=j%2?3:6;C3.sball(V0,[B[0]+Math.cos(t)*rr,B[1]+Math.sin(t)*rr,20.3],1.8,won?'#c8401a':'#4a4440',{lw:.9,kl:.35,kd:.3,rim:.1})}}});
  // a lantern of stone on each side of the path (lit at night: the light is alive)
  if(ch===1||ch===3)for(const[n,e] of CNI_LAMPS){const c=cnChain(n,e);parts.push({d:D(c),f:()=>cnIslLantern(K,c,stone)})}
  const scatter=(n,s,f)=>{for(let j=0;j<n;j++){const a=prH(j,seed+s)*TAU,r=.22+prH(j,seed+s+1)*.72,sx=Math.cos(a)*r*CNI_R*CNI_SY,sy=Math.sin(a)*r*CNI_R;if(free(sx,sy))f(sx,sy,j)}};
  if(ch===1){R(-124,-10,()=>cnIslPillar(K,IP(-124,-10),stone,34));R(102,-62,()=>cnIslPillar(K,IP(102,-62),stone,22));R(-46,-86,()=>cnIslPillar(K,IP(-46,-86),stone,15));
    // the graves of the crypt round the guardian, an old tree heavy with moss behind the gate
    for(const[sx,sy,a] of[[118,4,.15],[124,-24,-.2],[40,-70,.2],[68,-76,-.1],[-62,-70,.1]])R(sx,sy,()=>cnIslGrave(K,IP(sx,sy),stone,a));
    R(-114,-52,()=>cnIslOak(K,IP(-114,-52),seed),-2);
    for(const[sx,sy,c] of[[-80,64,'#ff5a4a'],[-66,74,'#ffb040'],[-104,-26,'#c060f0'],[18,-80,'#ffb040'],[106,58,'#ff5a4a'],[-124,32,'#c060f0']])if(cnIslFree(sx,sy))R(sx,sy,()=>cnIslShroom(K,IP(sx,sy),c));
    for(const[sx,sy] of[[-128,46],[128,-46],[30,-90],[-24,78]])if(cnIslFree(sx,sy))R(sx,sy,()=>cnIslRock(K,IP(sx,sy),9,mix('#8a8676',.1),'#6aa04a'));
    // cushions of moss, ferns, tufts of grass and little flowers all over
    scatter(16,2,(sx,sy,j)=>F(sx,sy,()=>cnIslMoss(K,IP(sx,sy),4+prH(j,seed+4)*6,'#82b850',seed+j)));
    scatter(9,30,(sx,sy,j)=>R(sx,sy,()=>cnIslFern(K,IP(sx,sy),j%2?'#5f9a3c':'#4f8a34',seed+j)));
    scatter(36,9,(sx,sy,j)=>R(sx,sy,()=>{cnIslTuft(K,IP(sx,sy),j%2?'#9ad86a':'#7cc050',3,seed+j);if(j%3===0)cnIslFlower(K,IP(sx+3,sy+1),Wd.deco[j%Wd.deco.length])}))}
  else if(ch===2){R(64,-66,()=>cnIslVolcano(K,IP(64,-66),mix('#5a3e36',.1)));
    for(const[sx,sy,hh] of[[-118,-26,30],[-104,-12,20],[-128,-6,14],[-100,-36,25],[-114,-44,17]])R(sx,sy,()=>oPrism(K,IP(sx,sy),6,7,hh,mix('#3e3639',.1),{a:sx*.1,lw:1.5,cf:n=>n[2]>.5?'#5a4e52':'#3e3639'}));
    for(const[sx,sy] of[[118,22],[-96,48],[30,-88],[-30,80]])if(cnIslFree(sx,sy))R(sx,sy,()=>cnIslRock(K,IP(sx,sy),8,'#2e2628','#ff7a30'));
    OMd(-66,70,'obsidian',9,16,seed+1);OMd(122,-6,'obsidian',8,14,seed+2);OMd(-78,-78,'deadtree',11,44,seed+3);OMd(-120,30,'lavarock',9,10,seed+4);
    if(g>=1)R(18,-62,()=>{pBox(K,IP(18,-62),8,6,8,'#3a3d42',{lw:1.4});pBox(K,IP(18,-62,8),8,18,6,'#4a4f56',{lw:1.4})});
    scatter(10,5,(sx,sy,j)=>R(sx,sy,()=>oRock(K,IP(sx,sy),2+prH(j,seed+6)*2,2,1.8,'#2a2224',seed+j,{small:1,lw:1})))}
  else if(ch===3){R(104,-56,()=>{const b=IP(104,-56);C3.caps(V0,b,5.5,IP(102,-56,46),2.8,'#4e3e30',{lw:1.5});for(const[dx,z,l] of[[12,30,17],[-14,36,14],[6,44,11]])C3.caps(V0,IP(102,-56,z),2.1,IP(102+dx,-56-l*.3,z+l*.7),.8,'#4e3e30',{lw:1.1,noRim:true})});
    for(const[sx,sy] of[[30,6],[124,36],[-84,-62],[-126,8]])if(cnIslFree(sx,sy))R(sx,sy,()=>cnIslReeds(K,IP(sx,sy),seed+sx));
    for(const[sx,sy,c] of[[-76,66,'#d070ff'],[-106,-40,'#ffd040'],[-118,40,'#d070ff']])if(cnIslFree(sx,sy))R(sx,sy,()=>cnIslShroom(K,IP(sx,sy),c));
    OMd(-58,-80,'totem',9,40,seed+1);OMd(-120,30,'stump',9,12,seed+2);OMd(124,-14,'stump',8,10,seed+3);
    scatter(12,2,(sx,sy,j)=>F(sx,sy,()=>cnIslMoss(K,IP(sx,sy),4+prH(j,seed+4)*5,'#5a7a32',seed+j)));
    scatter(26,9,(sx,sy,j)=>R(sx,sy,()=>{cnIslTuft(K,IP(sx,sy),j%2?'#7aa04a':'#5f8a3a',3,seed+j);if(j%4===0)cnIslFlower(K,IP(sx+3,sy+1),Wd.deco[j%Wd.deco.length])}))}
  else{for(const[sx,sy,r,hh,c] of[[64,-70,10,44,'#9fdcff'],[80,-58,7,28,'#c6ecff'],[48,-60,5,18,'#8ccff8'],[118,-40,7,26,'#b4e4ff'],[-30,-84,4,14,'#d8f2ff']])if(Math.hypot(sx-84,sy+28)>30)R(sx,sy,()=>pCone(K,IP(sx,sy),r,hh,c,{m:6,lw:1.4}));
    for(const[sx,sy,r] of[[-70,66,14],[-120,-6,11],[110,50,9],[-40,-70,9]])if(cnIslFree(sx,sy))R(sx,sy,()=>pRound(K,IP(sx,sy),[[0,r],[r*.4,r*.82],[r*.7,r*.42],[r*.82,.1]],'#f6fbff',{m:16,lw:1.4}));
    OMd(-118,-34,'snowpine',11,44,seed+1);OMd(-66,-80,'snowpine',9,34,seed+2);OMd(124,30,'snowpine',9,36,seed+3);OMd(98,8,'snowman',10,0,seed+4);OMd(-128,36,'snowrock',9,9,seed+5);
    scatter(8,6,(sx,sy,j)=>R(sx,sy,()=>oPrism(K,IP(sx,sy),5,2.2+prH(j,seed)*1.4,3+prH(j,seed+1)*3,'#c6ecff',{tip:2.5,a:sx,lw:1.1,cf:n=>n[1]>0?'#eefaff':'#8ccff8'})))}
  flat.sort((a,b)=>a.d-b.d);for(const f of flat)f.f();pRun(parts)}
// the two lanterns of stone along the path: [north, east]
const CNI_LAMPS=[[-62,26],[44,-26]];
// nothing on the stream
function cnIslOffStream(sx,sy,S0,E){const p=IP(sx,sy),dx=E[0]-S0[0],dy=E[1]-S0[1],u=clamp(((p[0]-S0[0])*dx+(p[1]-S0[1])*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(p[0]-S0[0]-u*dx,p[1]-S0[1]-u*dy)>12}
// the rock that hangs under the island: rings of stone getting narrower to a tip, its layers, the dark that swallows it; stones (or icicles)
// hanging from it
function cnIslUnder(K,ch,side,sd){const{V0}=K,pts=[],col=C3.dk(side,.12),RG=[[-CNI_DEP*.5,.72],[-CNI_DEP-10,.55],[-CNI_DEP-30,.36],[-CNI_DEP-48,.17]];
  for(const[z,rk] of RG)for(let j=0;j<18;j++){const a=j/18*TAU+sd,w=1+.14*Math.sin(a*3+sd*2+z*.1)+.06*Math.sin(a*7+sd);pts.push([Math.cos(a)*CNI_R*rk*w,Math.sin(a)*CNI_R*rk*w*CNI_SY,z])}
  pts.push([4,-6,-CNI_DEP-68]);
  const hull=C3.vol(V0,pts,col,{lw:2,kl:.22,kd:.55,rim:.12}),a0=oFront(V0);
  ctx.save();C3.poly(hull);ctx.clip();ctx.lineCap='round';
  for(const[z,rk] of[[-CNI_DEP-4,.62],[-CNI_DEP-18,.48],[-CNI_DEP-34,.33]]){const q=[];for(let j=0;j<=16;j++){const a=a0-1.45+j/16*2.9,w=1+.1*Math.sin(a*5+sd+z);q.push(V0.P([Math.cos(a)*CNI_R*rk*w,Math.sin(a)*CNI_R*rk*w*CNI_SY,z+Math.sin(j*1.3+sd)*2]))}
    ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=2;C3.line(q);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;C3.line(q.map(p=>[p[0],p[1]+1.6]));ctx.stroke()}
  const b=C3.bbox(hull),g=ctx.createLinearGradient(0,b[1],0,b[3]);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.42,'rgba(4,6,10,.3)');g.addColorStop(1,'rgba(4,6,10,.95)');ctx.fillStyle=g;ctx.fillRect(b[0]-2,b[1]-2,b[2]-b[0]+4,b[3]-b[1]+4);ctx.restore();
  for(let j=0;j<7;j++){const a=a0+(prH(j,sd)-.5)*2.4,rk=.2+prH(j,sd+1)*.36,zr=rk>.55?plerp(-CNI_DEP-10,-CNI_DEP*.5,(rk-.55)/.17):rk>.36?plerp(-CNI_DEP-30,-CNI_DEP-10,(rk-.36)/.19):plerp(-CNI_DEP-48,-CNI_DEP-30,(rk-.17)/.19);
    pCone(K,[Math.cos(a)*CNI_R*rk*.92,Math.sin(a)*CNI_R*rk*.92*CNI_SY,zr+2],2.5+prH(j,sd+2)*3.5,-(7+prH(j,sd+3)*12),ch===4?'#bcd8ec':C3.dk(side,.25),{m:6,lw:1.2,kl:.2,kd:.5})}}
// the stream from the pool to the edge and its fall down the side of the island, fading into the dark (lava glows, ice stands still)
function cnIslFall(K,ch,E){const{V0}=K,C=CNI_FALL[ch],P=p=>V0.P(p),dn=CNI_DEP+44,w=ch===4?12:ch===3?7:9;
  const S0=[E[0]*.56,E[1]*.56,0],dx=E[0]-S0[0],dy=E[1]-S0[1],l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l,band=[];
  for(let j=0;j<=8;j++){const u=j/8,c=[S0[0]+dx*u+Math.sin(u*7)*1.5*nx,S0[1]+dy*u+Math.sin(u*7)*1.5*ny,.3],h=(w*.5)*(.8+u*.3);band.push(P([c[0]+nx*h,c[1]+ny*h,.3]));band.unshift(P([c[0]-nx*h,c[1]-ny*h,.3]))}
  C3.poly(band);ctx.fillStyle=C3.dk(C[0],.15);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();ctx.strokeStyle=C[1];ctx.globalAlpha=.6;ctx.lineWidth=.9;C3.line(band.slice(0,9).map(q=>[q[0]+.6,q[1]+.4]));ctx.stroke();ctx.globalAlpha=1;
  const t0=P(E),hw=w*.62,y0=t0[1],y1=y0+dn,g=ctx.createLinearGradient(0,y0,0,y1);
  g.addColorStop(0,C[0]);g.addColorStop(.55,C3.dk(C[0],.25));g.addColorStop(1,ch===2?'rgba(120,20,8,0)':'rgba(10,20,30,0)');
  ctx.beginPath();ctx.moveTo(t0[0]-hw,y0);ctx.quadraticCurveTo(t0[0]-hw*1.15,y0+dn*.5,t0[0]-hw*1.4,y1);ctx.lineTo(t0[0]+hw*1.4,y1);ctx.quadraticCurveTo(t0[0]+hw*1.15,y0+dn*.5,t0[0]+hw,y0);ctx.closePath();
  ctx.fillStyle=g;ctx.fill();ctx.save();ctx.globalAlpha=.7;ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(t0[0]-hw,y0);ctx.quadraticCurveTo(t0[0]-hw*1.15,y0+dn*.5,t0[0]-hw*1.3,y0+dn*.7);ctx.moveTo(t0[0]+hw,y0);ctx.quadraticCurveTo(t0[0]+hw*1.15,y0+dn*.5,t0[0]+hw*1.3,y0+dn*.7);ctx.stroke();ctx.restore();
  ctx.save();ctx.globalAlpha=.55;ctx.strokeStyle=C[1];ctx.lineCap='round';for(const o of[-.45,.05,.5]){ctx.lineWidth=o?1:1.6;ctx.beginPath();ctx.moveTo(t0[0]+hw*o,y0+2);ctx.lineTo(t0[0]+hw*o*1.3,y0+dn*.6);ctx.stroke()}ctx.restore();
  if(ch===4)for(let j=0;j<4;j++){const x=t0[0]-hw*1.1+j*hw*.72;ctx.fillStyle='#e8f6ff';ctx.strokeStyle='rgba(60,90,120,.8)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x-2,y0+dn*.62);ctx.lineTo(x+2,y0+dn*.62);ctx.lineTo(x,y0+dn*.62+6+j%2*4);ctx.closePath();ctx.fill();ctx.stroke()}}
// a lantern of stone: base, post, the lamp with its little windows (the light is drawn alive), a roof and a knob
function cnIslLantern(K,c,stone){const lit='#ffd27a';pBox(K,c,9,9,3,C3.dk(stone,.12),{lw:1.5});pBox(K,[c[0],c[1],3],4.4,4.4,11,stone,{lw:1.4});pBox(K,[c[0],c[1],14],9,9,2,C3.lt(stone,.04),{lw:1.4});
  pBox(K,[c[0],c[1],16],6.6,6.6,7,stone,{lw:1.4,face:(n,q,pts)=>{if(Math.abs(n[2])>.5)return;const m=pts.reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4],[0,0]);ctx.fillStyle=lit;ctx.fillRect(m[0]-1.4,m[1]-1.8,2.8,3.6)}});
  pRound(K,[c[0],c[1],23],[[0,7.2],[2.4,5.2],[5.2,.6]],C3.lt(stone,.06),{m:4,lw:1.4});C3.sball(K.V0,[c[0],c[1],29.5],1.6,stone,{lw:1})}
// an old tree of the crypt: a crooked trunk, roots, branches and a crown of round leaves, moss hanging from it
function cnIslOak(K,c,sd){const{V0}=K,tr='#5a4632',lv=['#4f8a3a','#5f9a44','#6aa84c','#7ab85a'];
  for(const[dx,dy] of[[6,-7],[-5,8],[7,6]])C3.caps(V0,[c[0]+dx*.25,c[1]+dy*.25,3],3.2,[c[0]+dx*1.6,c[1]+dy*1.6,0],1.4,tr,{lw:1.8,kl:.25,kd:.5});
  C3.caps(V0,c,6.5,[c[0]-2,c[1]+3,36],4,tr,{lw:2,kl:.25,kd:.5});C3.caps(V0,[c[0]-1,c[1]+2,25],2.8,[c[0]-3,c[1]+15,39],1.5,tr,{lw:1.6});C3.caps(V0,[c[0]-1,c[1]+1,27],2.6,[c[0]+2,c[1]-13,41],1.4,tr,{lw:1.6});
  const bl=[[0,0,50,15],[-3,14,44,11],[2,-14,45,11],[6,4,58,10],[-6,-3,56,9]].map(([dx,dy,z,r])=>({p:[c[0]+dx,c[1]+dy,z],r,d:V0.D([c[0]+dx,c[1]+dy,z])}));bl.sort((a,b)=>a.d-b.d);
  bl.forEach((q,j)=>C3.sball(V0,q.p,q.r,lv[j%4],{lw:2,kl:.35,kd:.45,rim:.25}));
  ctx.strokeStyle='#6a9a3a';ctx.lineWidth=1.2;ctx.lineCap='round';for(const[dx,dy,z,l] of[[-8,12,40,12],[9,-10,41,10],[2,9,38,14]]){const a=V0.P([c[0]+dx,c[1]+dy,z]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(a[0]+1.5,a[1]+l*.5,a[0]-.5,a[1]+l);ctx.stroke()}}
// a fern: leaves bending out from the middle
const cnIslFern=(K,c,col,sd)=>{for(let b=0;b<6;b++){const a=sd*1.3+b*1.05;C3.leaf(K.V0,c,[Math.cos(a)*.75,Math.sin(a)*.75,.62],[-Math.sin(a),Math.cos(a),0],8+prH(b,sd)*4,2.4,col,{lw:.8,bend:.45})}};
// a flat stone set in the ground (a slab of the path, the ice of a pond): an uneven 8-gon rw across, rd deep, h high
function cnIslStone(K,c,rw,rd,h,col,sd){const ring=[],up=[];for(let j=0;j<8;j++){const t=j/8*TAU+sd,k=.85+prH(j,sd*7)*.3;ring.push([c[0]+Math.cos(t)*rd*k,c[1]+Math.sin(t)*rw*k,c[2]]);up.push([c[0]+Math.cos(t)*rd*k*.9,c[1]+Math.sin(t)*rw*k*.9,c[2]+h])}
  const F=[[[0,0,1],up]];for(let j=0;j<8;j++){const t=(j+.5)/8*TAU+sd;F.push([C3.nrm([Math.cos(t),Math.sin(t),.5]),[ring[j],ring[(j+1)%8],up[(j+1)%8],up[j]]])}
  oFaces(K,F,col,{lw:1.1,ew:.4,cf:n=>n[2]>.9?C3.lt(col,.08):C3.dk(col,.25)})}
// nothing standing on the path and the bridges' feet, on the hero's place (his companions beside him), by the lanterns, on the gate and its
// path, the brazier, the guardian
function cnIslFree(sx,sy){const[n,e]=cnIslNE(IP(sx,sy)),[hn,he]=cnIslNE(CI_HERO),[gn,ge]=cnIslNE(IP(-88,-24));
  if(Math.abs(e)<(Math.abs(n)>66?30:17))return false;
  if(((n-hn)/26)**2+((e-he)/58)**2<1)return false;
  if(Math.hypot(sx+92,sy+36)<32||Math.hypot(sx+112,sy-18)<17||Math.hypot(sx-84,sy+28)<36)return false;
  for(const[ln,le] of CNI_LAMPS)if(Math.hypot(n-ln,e-le)<12)return false;
  const dx=gn+6,dy=ge,u=clamp(((n+6)*dx+e*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(n+6-u*dx,e-u*dy)>13}
const cnIslMoss=(K,c,r,col,sd)=>C3.vol(K.V0,C3.ellPts(c,[r*.6,r,r*.32],null,3,12,0),col,{lw:1,kl:.35,kd:.35,rim:.15});
const cnIslTuft=(K,c,col,n,sd)=>{for(let b=0;b<n;b++){const a=sd*2+b*2.1;C3.leaf(K.V0,c,[Math.cos(a)*.38,Math.sin(a)*.38,1],[-Math.sin(a),Math.cos(a),0],4+prH(b,sd)*2.5,.9,col,{lw:.7,bend:.25})}};
const cnIslFlower=(K,c,col)=>{oStem(K.V0,c,[c[0],c[1],c[2]+3],[c[0]+.5,c[1],c[2]+5.5],'#5a8a32',.9);C3.sball(K.V0,[c[0]+.5,c[1],c[2]+6.2],1.5,col,{lw:.8,kl:.4,kd:.25,rim:.1})};
// a pool sunk in the ground: the surface (rd deep, rw across), its lighter shine and a dark rim
function cnIslPool(K,c,rw,rd,col,shine,rim,sd){const{V0}=K,pt=(k,z)=>{const q=[];for(let j=0;j<24;j++){const t=j/24*TAU,w=1+.06*Math.sin(t*3+sd);q.push(V0.P([c[0]+Math.cos(t)*rd*k*w,c[1]+Math.sin(t)*rw*k*w,c[2]+z]))}return q};
  C3.poly(pt(1.06,.05));ctx.fillStyle=rim;ctx.fill();C3.poly(pt(1,.15));ctx.fillStyle=col;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
  const s=pt(.45,.2).map(q=>[q[0]-rw*.22,q[1]-rd*.12]);C3.poly(s);ctx.fillStyle=shine;ctx.fill()}
// a lily pad floating (with a notch), a flower on some
function cnIslPad(K,c,r,f,sd){const{V0}=K,q=[V0.P(c)];for(let j=0;j<=14;j++){const t=sd+.35+j/14*(TAU-.7);q.push(V0.P([c[0]+Math.cos(t)*r*.8,c[1]+Math.sin(t)*r,c[2]]))}
  C3.poly(q);ctx.fillStyle='#62aa40';ctx.fill();ctx.strokeStyle='#2e5a22';ctx.lineWidth=.8;ctx.stroke();if(f)C3.sball(V0,[c[0],c[1],c[2]+1.6],1.9,f,{lw:.8,kl:.45,kd:.25,rim:.1})}
// reeds: stems that bend, two cattails
function cnIslReeds(K,c,sd){const{V0}=K;for(let j=0;j<6;j++){const b=[c[0]+(prH(j,sd)-.5)*3,c[1]-(j-2.5)*1.4,c[2]],h=22+j%2*5,t=[b[0],b[1]-(j-2.5)*2.6,h];
    oStem(V0,b,[b[0],b[1]-(j-2.5)*1.2,h*.55],t,'#3e6a2a',1.3);if(j===1||j===4)C3.caps(V0,[t[0],t[1],t[2]-1.5],2,[t[0],t[1],t[2]-8.5],2,'#7a4a24',{lw:1,kl:.35,kd:.4,rim:.15})}}
// the volcano: the cone, the crater with its glowing lava, a stream of lava running down the side toward us
function cnIslVolcano(K,c,col){const{V0}=K,prof=[[0,34],[14,26],[30,14],[38,10]],rr=z=>{for(let j=0;j<prof.length-1;j++){const a=prof[j],b=prof[j+1];if(z<=b[0])return plerp(a[1],b[1],(z-a[0])/(b[0]-a[0]))}return prof[prof.length-1][1]};
  pRound(K,c,prof,col,{m:22});C3.disc3(V0,[c[0],c[1],38.2],[0,0,1],9.6,{N:22});ctx.fillStyle='#ff6a20';ctx.fill();C3.disc3(V0,[c[0]-1,c[1]+1,38.4],[0,0,1],5.4,{N:18});ctx.fillStyle='#ffd070';ctx.fill();
  const a0=oFront(V0)+.4,st=[];for(let z=37;z>=3;z-=3){const a=a0+.12*Math.sin(z*.25),r=rr(z)*1.02;st.push(V0.P([c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r,z]))}
  ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#5a1e0a';ctx.lineWidth=3.6;C3.line(st);ctx.stroke();ctx.strokeStyle='#ff7a30';ctx.lineWidth=2.4;ctx.stroke();ctx.strokeStyle='#ffd070';ctx.lineWidth=.9;ctx.stroke()}
// two chains across a locked gate (links of iron, one turned each way) and the padlock where they cross
function cnIslLock(K,gx,gy){const{V0}=K;for(const[z0,z1] of[[34,8],[8,34]]){const pts=[];for(let j=0;j<=12;j++){const u=j/12;pts.push(IP(gx-15+u*30,gy+4,plerp(z0,z1,u)-Math.sin(u*Math.PI)*5))}
    for(let j=0;j<=12;j++){const p=pts[j],q=pts[Math.min(12,j+1)],o=pts[Math.max(0,j-1)],d=C3.nrm([q[0]-o[0],q[1]-o[1],q[2]-o[2]]),n=j%2?[1,0,0]:C3.nrm(C3.cross(d,[1,0,0]));
      const ring=C3.disc3(V0,p,n,1.8,{N:12});ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke();C3.poly(ring);ctx.strokeStyle=j%2?'#b4b4be':'#8a8a94';ctx.lineWidth=1.3;ctx.stroke()}}
  const c=IP(gx,gy+5,15);oBox(K,c,3.4,10,9,'#c09a44',{lw:1.4,cf:n=>n[2]>.5?'#e0be66':'#c09a44'});const sh=[];for(let j=0;j<=10;j++){const t=j/10*Math.PI;sh.push(V0.P(IP(gx+Math.cos(t)*3.5,gy+5,24+Math.sin(t)*4.4)))}
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=3.2;C3.line(sh);ctx.stroke();ctx.strokeStyle='#b4b4be';ctx.lineWidth=1.5;ctx.stroke();C3.spot(V0,IP(gx,gy+6.8,19),[1,0,0],1.3,INK)}
// the arch of the arena: two pillars, a round arch of blocks with its keystone, the dark mouth (from the 2nd round banners, the 3rd spikes)
function cnIslGate(K,gx,gy,stone,ac,g,op){const{V0}=K,P=p=>V0.P(p),r0=17,ri=13,zt=32,arc=(r,z)=>{const a=[];for(let j=0;j<=12;j++){const u=Math.PI-j/12*Math.PI;a.push(IP(gx+Math.cos(u)*r,gy,z+Math.sin(u)*r))}return a};
  const mouth=[IP(gx-ri,gy,0),...arc(ri,zt),IP(gx+ri,gy,0)].map(P);C3.poly(mouth);ctx.fillStyle='#0a0706';ctx.fill();
  pBox(K,IP(gx-r0+2,gy),10,8,zt,stone,{lw:1.6});pBox(K,IP(gx+r0-2,gy),10,8,zt,stone,{lw:1.6});
  const A=arc(r0-2,zt);for(let j=0;j<A.length-1;j++)C3.caps(V0,A[j],4.4,A[j+1],4.4,j%2?stone:C3.lt(stone,.06),{lw:1.3,noRim:true});
  pBox(K,IP(gx,gy,zt+r0-6),7,9,8,C3.lt(stone,.12),{lw:1.4});
  // banners of cloth hanging before the pillars, cut in a swallowtail
  if(g>=1)for(const s of[-1,1]){const x=gx+s*(r0-2),y=gy+5,q=[IP(x-4.5,y,zt-2),IP(x+4.5,y,zt-2),IP(x+4.5,y,zt-22),IP(x,y,zt-17),IP(x-4.5,y,zt-22)];
    oFaces(K,[[[1,0,0],q],[[-1,0,0],q.slice().reverse()]],ac,{lw:1.2,ew:.4});C3.spot(V0,IP(x,y+.3,zt-9),[1,0,0],2,C3.lt(ac,.35))}
  if(g>=2)for(let j=-2;j<=2;j++)pCone(K,IP(gx+j*7,gy,zt+r0+1-Math.abs(j)*2.5),2.4,8-Math.abs(j)*1.6,C3.dk(stone,.25),{m:6,lw:1})}
const cnIslPillar=(K,c,stone,hh)=>{const{V0}=K,a0=oFront(V0)+.3;pRound(K,c,[[0,9],[3,8],[hh-4,7.2],[hh,8]],stone,{m:12});C3.spot(V0,[c[0],c[1],hh+.3],[0,0,1],6.6,'#6aa04a');C3.spot(V0,[c[0]-1,c[1]+1,hh+.6],[0,0,1],3.6,'#86c050');
  oStem(V0,[c[0]+Math.cos(a0)*7.6,c[1]+Math.sin(a0)*7.6,hh-1],[c[0]+Math.cos(a0)*8.2,c[1]+Math.sin(a0)*8.2,hh-8],[c[0]+Math.cos(a0+.1)*7.6,c[1]+Math.sin(a0+.1)*7.6,hh-14],'#4a7a2a',1.2)};
const cnIslGrave=(K,c,stone,a)=>{const{V0}=K;pBox(K,c,4,12,16,cnMixC(stone,'#6a6a60',.35),{a,lw:1.4});const ca=Math.cos(a),sa=Math.sin(a);if(V0.F([ca,sa,0])<.05)return;
  const Fp=(u,z)=>V0.P([c[0]+2.1*ca-u*sa,c[1]+2.1*sa+u*ca,z]);ctx.strokeStyle='rgba(0,0,0,.42)';ctx.lineWidth=1.1;ctx.lineCap='round';C3.line([Fp(-2.5,11),Fp(2.5,11)]);ctx.stroke();C3.line([Fp(0,14),Fp(0,7)]);ctx.stroke()};
const cnIslShroom=(K,c,col)=>{const{V0}=K,a0=oFront(V0);pRound(K,c,[[0,1.8],[5,1.8],[6,6],[8.6,5],[10,.1]],col,{m:10,lw:1.2});
  for(const[da,r] of[[.7,1.3],[-.6,1.1],[0,.9]])C3.spot(V0,[c[0]+Math.cos(a0+da)*3.4,c[1]+Math.sin(a0+da)*3.4,9.3],C3.nrm([Math.cos(a0+da)*.5,Math.sin(a0+da)*.5,1]),r,'rgba(255,255,255,.92)')};
const cnIslRock=(K,c,r,col,moss)=>{pRound(K,c,[[0,r],[r*.5,r*.9],[r*.9,r*.5],[r,.1]],col,{m:9,lw:1.4});ctx.save();ctx.globalAlpha*=.88;C3.spot(K.V0,[c[0],c[1],r*.96],[0,0,1],r*.52,moss);ctx.restore()};
// the stains on the top of the slab (clipped to it): only flat things, each world its own
function cnIslMarks(i,K,ch,Wd,mix){const{V0}=K,P=p=>V0.P(p),seed=i*3.1;
  const blob=(n,col,a0,s0,s1,yk)=>{ctx.fillStyle=col;for(let j=0;j<n;j++){const a=prH(j,seed+a0)*TAU,r=16+prH(j,seed+a0+1)*80,q=P([Math.cos(a)*r,Math.sin(a)*r*CNI_SY,0]);ctx.beginPath();ctx.ellipse(q[0],q[1],s0+prH(j,seed+a0+2)*s1,(s0+prH(j,seed+a0+3)*s1)*(yk||.36),0,0,TAU);ctx.fill()}};
  if(ch===1){blob(10,'rgba(150,200,90,.4)',2,5,9);blob(10,'rgba(60,90,40,.35)',6,4,6)}
  else if(ch===2){blob(8,'rgba(30,20,18,.45)',2,6,10);ctx.lineCap='round';for(let j=0;j<8;j++){let a=prH(j,seed)*TAU,r=24+prH(j,seed+1)*56,q=P([Math.cos(a)*r,Math.sin(a)*r*CNI_SY,0]);ctx.strokeStyle='#ff7a30';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q[0],q[1]);for(let s=0;s<4;s++){a+=(prH(j*4+s,seed+2)-.5)*.9;r+=8;q=P([Math.cos(a)*r,Math.sin(a)*r*CNI_SY,0]);ctx.lineTo(q[0],q[1])}ctx.stroke();ctx.strokeStyle='rgba(255,230,140,.8)';ctx.lineWidth=.8;ctx.stroke()}}
  else if(ch===3)blob(10,'rgba(70,60,36,.4)',2,6,9);
  else blob(14,'rgba(120,170,220,.22)',2,8,10)}
// ------------------------------------------------ one frame of the home: the abyss, the islands and their bridges, the hero, the names
function cnIsles(dt){campResize();CAMP.t+=dt;const t=CAMP.t;if(G)G.t=t;const L=ISL.lay=cnIslLay(),saved=ctx;ctx=campX;
  if(ISL.cur==null)cnIslSync(false);
  try{cnIslStep(dt,L);ctx.setTransform(1,0,0,1,0,0);
    const v=ISL.view,i0=Math.max(0,Math.floor(v)),i1=Math.min(ARENAS.length-1,i0+1),f=v-i0,A=cnIslW(i0),B=cnIslW(i1);
    // the abyss: the sky of the world you look at, its light from below, far rocks and stars that go down as you go north, fog
    const sky=ctx.createLinearGradient(0,0,0,L.H);sky.addColorStop(0,cnMixC(A.sky[0],B.sky[0],f));sky.addColorStop(1,cnMixC(A.sky[1],B.sky[1],f));ctx.fillStyle=sky;ctx.fillRect(0,0,L.W,L.H);
    const sh=L.H*.62;for(let j=0;j<70;j++){const x=(j*97.3)%L.W,y=L.top+((j*53.7+v*L.pairPx*.1)%sh+sh)%sh,tw=.35+.65*Math.abs(Math.sin(t*1.1+j*1.7));ctx.fillStyle=`rgba(255,250,230,${(tw*.55).toFixed(2)})`;ctx.fillRect(x,y,1.5*L.dpr,1.5*L.dpr)}
    if(!LOWFX){const gl=i=>cnIslW(i).light;pLight(L.cx,L.cy+CNI_R*.55*L.k*2.6,L.W*.8,f<.5?gl(i0):gl(i1),.3,L.W*.36)}
    cnIslFar(L,t,v);
    // the islands from the furthest to the nearest; each bridge after the island it leads to (it lies on its ground) and before the one it
    // leaves from (its foot goes under that island's edge)
    const vr=Math.round(v);
    // (the island behind you goes away as you leave it: only its bridge still comes up to yours)
    for(let i=Math.min(ARENAS.length-1,vr+2);i>=Math.max(0,vr-1);i--){const Ai=cnIslAt(i,L,t),al=clamp(1-(v-i-.55)/.4,0,1);if(al>0&&Ai.y-160*Ai.k<L.H&&Ai.y+150*Ai.k>0){ctx.save();ctx.globalAlpha=al;cnIslDraw(i,Ai,L,t);ctx.restore()}if(i>0)cnIslBridge(i-1,L,t)}
    cnIslFadeLow(L,A,B,f);
    if(cnIncView())cnIncSky(L,t,1-Math.min(1,Math.abs(v-Math.round(v))*2.2));   // fades while scrolling to an island without it
    ISL.pv=ISL.view;
    cnIslHero(L,t);cnPlayLbl();
    if(!LOWFX)pFog(L.W,L.cy+CNI_R*.4*L.k,L.info,t,f<.5?A.fog:B.fog,.1,4,13);
    cnIslText(L,t);
    cnIslVig(L)}
  finally{ctx.setTransform(1,0,0,1,0,0);ctx=saved}}
// under the line below your island the picture goes back into the sky: the island behind you and the feet of its bridge do not show
// through the empty boxes of the chests
function cnIslFadeLow(L,A,B,f){const y0=L.info+4*L.dpr,y1=Math.min(L.H,L.pill+30*L.dpr);if(y0>=L.H)return;const c0=cnMixC(A.sky[0],B.sky[0],f),c1=cnMixC(A.sky[1],B.sky[1],f),sk=y=>cnMixC(c0,c1,clamp(y/L.H,0,1));
  const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,`rgba(${cnRgb(sk(y0))},0)`);g.addColorStop(1,`rgba(${cnRgb(sk(y1))},1)`);ctx.fillStyle=g;ctx.fillRect(0,y0,L.W,y1-y0);
  if(y1<L.H){const g2=ctx.createLinearGradient(0,y1,0,L.H);g2.addColorStop(0,sk(y1));g2.addColorStop(1,sk(L.H));ctx.fillStyle=g2;ctx.fillRect(0,y1,L.W,L.H-y1)}}
// the camera follows the finger, then settles on an island; while the hero walks over a bridge it goes with him
function cnIslStep(dt,L){const J=ISL.jump;if(J){J.t+=dt;if(J.t>=J.dur){ISL.jump=null;cnIslLand(J.b)}}
  if(ISL.drag)return;if(J&&J.way){const u=Math.min(1,J.t/J.dur),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;ISL.view=J.a+(J.b-J.a)*e;return}
  const now=performance.now(),H=ISL.hold;if(H&&now>H.until)ISL.hold=null;
  const target=ISL.hold&&now>=ISL.hold.from?ISL.hold.v:ISL.go!=null?ISL.go:Math.round(ISL.view);ISL.view+=(target-ISL.view)*Math.min(1,dt*(ISL.jump?5:9));if(Math.abs(target-ISL.view)<.002){ISL.view=target;if(ISL.go===target&&!ISL.jump)ISL.go=null}}
function cnIslLand(i){tone(150,80,.14,'triangle',.05);ISL.dust={i,t:0};vib([12])}
// far rocks floating in the abyss, slower than the islands (they give the depth)
function cnIslFar(L,t,v){ctx.save();for(let j=0;j<7;j++){const s=.25+prH(j,3)*.35,x=((prH(j,1)*L.W*2.2+t*3*s)%(L.W*1.6)+L.W*1.6)%(L.W*1.6)-L.W*.3,hh=L.H*.5,y=L.top+(((prH(j,2)*hh+v*L.pairPx*s*.35)%hh)+hh)%hh,r=(18+prH(j,4)*30)*L.dpr*s;
    ctx.fillStyle=`rgba(4,6,10,${(.35+s*.5).toFixed(2)})`;ctx.beginPath();ctx.ellipse(x,y,r,r*.32,0,Math.PI,0);ctx.lineTo(x+r*.5,y+r*.5);ctx.lineTo(x,y+r*.95);ctx.lineTo(x-r*.45,y+r*.45);ctx.closePath();ctx.fill()}ctx.restore()}
function cnIslDraw(i,A,L,t){const c=cnIslImg(i,L),won=cnWon(i),op=cnOpen(i),W=cnIslW(i),ac=cnRgb(ARENAS[i].col),k=A.k,ch=ARENAS[i].ch||1,S=p=>cnIslS(A,p);
  ctx.save();
  if(!LOWFX)pLight(A.x,A.y+CNI_R*.55*k*1.6,CNI_R*1.5*k,W.light,op?.16:.04,CNI_R*.6*k);
  if(Math.abs(A.f-1)<.002)ctx.drawImage(c.cv,Math.round(A.x-c.ox),Math.round(A.y-c.oy));else ctx.drawImage(c.cv,A.x-c.ox*A.f,A.y-c.oy*A.f,c.cv.width*A.f,c.cv.height*A.f);
  // the live parts: the arena's glow in the gate, the brazier's flame, the lanterns, the fall, the world (lava, fireflies, snow), the guardian
  if(op){const g=S([CI_GATE[0],CI_GATE[1],16]),pul=.7+.3*Math.sin(t*1.8+i);pLight(g[0],g[1],22*k,ac,.5*pul,26*k);for(let j=0;j<5;j++){const q=(t*.3+j/5)%1;ctx.fillStyle=`rgba(${ac},${(1-q)*.8})`;ctx.fillRect(g[0]+Math.sin(j*2.1+t)*8*k,g[1]+20*k-q*30*k,1.4*L.dpr,1.4*L.dpr)}}
  if(won){const b=S([CI_BRAZ[0],CI_BRAZ[1],17]);pLight(b[0],b[1],26*k,'255,170,70',.55);pFlame(b[0],b[1],16*k,9*k,1,t+i,LOWFX);if(!LOWFX)cnSparks(b[0],b[1]-10*k,k,t+i)}
  if(op&&(ch===1||ch===3))for(const[n,e] of CNI_LAMPS){const q=S(cnChain(n,e,19.5)),fl=LOWFX?1:.85+.15*Math.sin(t*9+n);pLight(q[0],q[1],16*k,'255,200,110',.42*fl,14*k)}
  if(op&&!LOWFX&&CNI_FALL[ch])cnIslFallFx(i,S,k,t,ch);
  if(ch===2&&!LOWFX&&op){const q=S(IP(64,-66,38));pLight(q[0],q[1],20*k,'255,110,40',.5+.2*Math.sin(t*2));for(let j=0;j<4;j++){const u=(t*.12+j/4)%1;ctx.fillStyle=`rgba(70,50,46,${(.35*(1-u)).toFixed(2)})`;ctx.beginPath();ctx.arc(q[0]-u*14*k+Math.sin(u*6+j)*3*k,q[1]-u*40*k,(3+u*9)*k,0,TAU);ctx.fill()}}
  if(!LOWFX&&op){const cc=S([0,0,0]);if(ch===3)pMotes(t,cc[0],cc[1]-30*k,200*k,80*k,12,'210,255,120',.9,.6,40+i);else if(ch===4)pMotes(t,cc[0],cc[1]-20*k,250*k,150*k,16,'240,248,255',.7,-1.2,50+i);else if(ch===1)pMotes(t,cc[0],cc[1]-24*k,210*k,90*k,10,'190,255,150',.7,.5,60+i);else pMotes(t,cc[0],cc[1]-30*k,190*k,100*k,12,'255,160,80',.8,1.4,70+i)}
  if(op&&(!won||cnIncOn(i)))cnIslBoss(i,A,t,op,L,cnIncOn(i));
  if(op&&(cnS().inc[i]||{}).win)cnIncMoon(S([CI_GATE[0],CI_GATE[1],60]),k,t);
  if(ISL.dust&&ISL.dust.i===i){ISL.dust.t+=1/60;const d=ISL.dust.t,h=S(CI_HERO);if(d<.5){ctx.fillStyle=`rgba(220,210,190,${(.5*(1-d/.5)).toFixed(2)})`;for(let j=0;j<6;j++){const a=j/6*TAU;ctx.beginPath();ctx.arc(h[0]+Math.cos(a)*d*60*k,h[1]+Math.sin(a)*d*14*k,(4-d*5)*k,0,TAU);ctx.fill()}}else ISL.dust=null}
  ctx.restore()}
// the fall moving: light streaks running down it, a little mist (lava: a glow)
function cnIslFallFx(i,S,k,t,ch){const E=cnIslFallPt(i),q=S(E),C=CNI_FALL[ch],dn=(CNI_DEP+44)*k,hw=(ch===4?12:ch===3?7:9)*.62*k;if(ch===4)return;
  if(ch===2)pLight(q[0],q[1]+dn*.3,18*k,'255,120,40',.45,dn*.5);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=ch===2?'rgba(255,220,140,.5)':'rgba(230,248,255,.42)';ctx.lineCap='round';
  for(let j=0;j<4;j++){const u=(t*(ch===3?.35:.6)+j/4)%1,x=q[0]+(j/3-.5)*hw*1.4*(1+u*.3),y=q[1]+u*dn*.75;ctx.lineWidth=(1.4-u*.8)*k;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+7*k);ctx.stroke()}ctx.restore()}
// the guardian of the arena asleep on its island (it breathes slowly, «z» float up); awake and red in the Incubo
function cnIslBoss(i,A,t,op,L,awake){const bt=cnBoss(i),M=N3.meta&&N3.meta[bt];if(!N3[bt])return;const k=A.k,q=cnIslS(A,CI_BOSS),sc=(M&&M.sc||1)*CNI_BOSS,p=(t*(awake?.42:.18)+i*.13)%1;
  ctx.save();ctx.translate(q[0],q[1]);ctx.scale(k,k);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,2,22*sc,6*sc,0,0,TAU);ctx.fill();
  if(awake&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,40,30',0,-30*sc,60*sc,.35+.1*Math.sin(t*3));ctx.restore()}
  try{N3[bt](0,0,Math.PI/2+.75,'idle',p,sc,{noFx:true})}catch(err){}ctx.restore();
  if(op&&!awake)for(let j=0;j<3;j++){const u=((t*.35+j/3)%1),zx=q[0]-8*k+u*16*k+Math.sin(u*5+j)*4*k,zy=q[1]-(70*sc+u*40)*k;ctx.save();ctx.globalAlpha=Math.sin(u*Math.PI)*.85;ctx.font=`${Math.round((8+u*6)*k)}px "Lilita One", sans-serif`;ctx.textAlign='center';ctx.lineWidth=2*L.dpr;ctx.strokeStyle=INK;ctx.strokeText('z',zx,zy);ctx.fillStyle='#e8f0ff';ctx.fillText('z',zx,zy);ctx.restore()}}
// ------------------------------------------------ the hero's way over a bridge (from the middle of island lo = min(a, b)): chain points
// [north, east, high]; from his place to the path, along it to the edge, over the bridge, along the next island's path to his place there
function cnIslWay(a,b){const lo=Math.min(a,b),[hn,he]=cnIslNE(CI_HERO),G0=cnBrGeo(lo),pts=[[hn,he,0],[hn+16,0,0],[G0.a0-6,0,0]];
  for(let j=1;j<=10;j++){const u=j/10,n=G0.a0+G0.len*u;pts.push([n,0,cnBrZ(G0,n)])}
  pts.push([G0.a1+8,0,0],[CNI_GAP+hn+16,0,0],[CNI_GAP+hn,he,0]);if(b<a)pts.reverse();
  let len=0;const cum=[0];for(let j=1;j<pts.length;j++){len+=Math.hypot(pts[j][0]-pts[j-1][0],pts[j][1]-pts[j-1][1],pts[j][2]-pts[j-1][2]);cum.push(len)}return{pts,cum,len,lo}}
// a point of the way (d units along it): [north, east, high] from island lo's middle
function cnWayAt(w,d){d=clamp(d,0,w.len);let j=1;while(j<w.cum.length-1&&w.cum[j]<d)j++;const a=w.pts[j-1],b=w.pts[j],u=(d-w.cum[j-1])/Math.max(.001,w.cum[j]-w.cum[j-1]);return[plerp(a[0],b[0],u),plerp(a[1],b[1],u),plerp(a[2],b[2],u)]}
// a point by the path anywhere (n from island lo's middle) on the screen: on an island its own picture, on a bridge the bridge's
function cnChainScr(lo,n,e,z,L,t){let i=lo;while(n>CNI_GAP*.5+1&&i<ARENAS.length-1){n-=CNI_GAP;i++}while(n<-CNI_GAP*.5-1&&i>0){n+=CNI_GAP;i--}
  if(n>0&&i<ARENAS.length-1){const G0=cnBrGeo(i);if(n>G0.a0){const M=cnBrMap(i,L,t);const p=M.S(n,e,z);return[p[0],p[1],M.K(n)]}}
  if(n<0&&i>0){const G0=cnBrGeo(i-1),m=n+CNI_GAP;if(m<G0.a1){const M=cnBrMap(i-1,L,t);const p=M.S(m,e,z);return[p[0],p[1],M.K(m)]}}
  const A=cnIslAt(i,L,t),q=cnIslS(A,cnChain(n,e,z));return[q[0],q[1],A.k]}
// the hero on his island (and the companions), his walk over a bridge or his jump, his walk into the gate when you press «Gioca»
function cnIslHero(L,t){const J=ISL.jump,K0=cnV(),P0=K0.P(CI_HERO);let x,y,s,fade=1;
  const at=i=>{const A=cnIslAt(i,L,t);return[A.x+P0[0]*A.k,A.y+P0[1]*A.k,A.k]};
  if(J&&J.way){const W=J.way,u=Math.min(1,J.t/J.dur),ea=.12,cc=2*ea*(1-ea),dd=W.len*(u<ea?u*u/cc:u>1-ea?1-(1-u)*(1-u)/cc:(u-ea/2)/(1-ea)),p=cnWayAt(W,dd),q=cnChainScr(W.lo,p[0],p[1],p[2],L,t),p2=cnWayAt(W,dd+4),q2=cnChainScr(W.lo,p2[0],p2[1],p2[2],L,t);
    const face=Math.atan2((q2[1]-q[1])/.55,q2[0]-q[0]||1e-6),sc=L.hs*q[2];
    // the companions walk after him
    if(SAVE.pets)petEq().forEach((id,j)=>{const pd=dd-(26+j*22);if(pd<0)return;const pp=cnWayAt(W,pd),pq=cnChainScr(W.lo,pp[0],pp[1],pp[2],L,t),ps=L.hs*pq[2]*.5;ctx.save();ctx.translate(pq[0]+(j?-1:1)*6*pq[2],pq[1]);ctx.scale(ps,ps);ctx.fillStyle='rgba(0,0,0,.3)';ell(0,2,9,3);ctx.fill();drawPetSprite(id,0,0,{t:t+j*.7,face,moving:true,att:0,happy:0,hop:0});ctx.restore()});
    ctx.save();ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(q[0],q[1]+2*sc,12*sc,3.6*sc,0,0,TAU);ctx.fill();ctx.translate(q[0],q[1]);ctx.scale(sc,sc);noShadow=false;mossOn=1;drawRig(0,0,face,dd*.24,true,heroStyle(),{});mossOn=0;ctx.restore();
    CAMP.hero=null;return}
  if(J){const u=Math.min(1,J.t/J.dur),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2,a=at(J.a),b=at(J.b);x=plerp(a[0],b[0],e);y=plerp(a[1],b[1],e)-Math.sin(u*Math.PI)*L.pairPx*.5;s=L.hs*plerp(a[2],b[2],e)}
  else{const h=at(ISL.cur);[x,y]=h;s=L.hs*h[2];if(y<-60*L.dpr||y>L.H+60*L.dpr){CAMP.hero=null;return}}
  if(CAMP.walk>0){const A=cnIslAt(ISL.cur,L,t),q=Math.min(1,(t-CAMP.walk)/1.4),g=K0.P(CI_GATE);x+=(g[0]-P0[0])*A.k*q;y+=(g[1]-P0[1])*A.k*q;s*=1-.3*q;fade=q<.7?1:Math.max(0,1-(q-.7)/.3)}
  ctx.save();ctx.globalAlpha=fade;ctx.fillStyle='rgba(0,0,0,.35)';if(!J){ctx.beginPath();ctx.ellipse(x,y+2*s,12*s,3.6*s,0,0,TAU);ctx.fill()}
  drawHomeHero(x,y,s,t);ctx.restore();
  if(!J&&!CAMP.walk&&SAVE.pets)petEq().forEach((id,i)=>{const px=x+(i?-1:1)*22*s,py=y+3*s,ps=s*.5;ctx.save();ctx.translate(px,py);ctx.scale(ps,ps);ctx.fillStyle='rgba(0,0,0,.3)';ell(0,2,9,3);ctx.fill();drawPetSprite(id,0,0,{t:t+i*.7,face:i?0:Math.PI,moving:false,att:0,happy:0,hop:0});ctx.restore()});
  CAMP.hero=J||CAMP.walk?null:{x,y,w:18*s,h:50*s,dpr:L.dpr}}
// on top the island's number and name, under them its mode (and the switch of the Incubo); under the island, the brazier and the record
function cnIslText(L,t){ISL.incBtn=null;const v=ISL.view,i=Math.max(0,Math.min(ARENAS.length-1,Math.round(v))),a=1-Math.min(1,Math.abs(v-i)*2.2),A=ARENAS[i],mo=cnModeOf(i),op=cnOpen(i),won=cnWon(i),d=L.dpr;if(a<=.02)return;
  ctx.save();ctx.globalAlpha=a;ctx.textAlign='left';ctx.lineJoin='round';const font=n=>`${Math.round(n*d)}px "Lilita One", sans-serif`,out=(s,x,y,c,w)=>{ctx.lineWidth=w*d;ctx.strokeStyle=INK;ctx.strokeText(s,x,y);ctx.fillStyle=c;ctx.fillText(s,x,y)};
  const tag=`ARENA ${i+1}`,room=L.tr-L.tl,mid=w=>clamp(L.cx,L.tl+w/2,L.tr-w/2);ctx.font=font(12);const tw=ctx.measureText(tag).width,gap=7*d;let ns=21;ctx.font=font(ns);let nw=ctx.measureText(A.n).width;
  while(ns>13&&tw+gap+nw>room){ns-=1;ctx.font=font(ns);nw=ctx.measureText(A.n).width}
  let y=L.lab+20*d;const x0=mid(tw+gap+nw)-(tw+gap+nw)/2;ctx.font=font(12);out(tag,x0,y-1.5*d,A.col,3.2);ctx.font=font(ns);out(A.n,x0+tw+gap,y,'#fff7e6',4.6);
  y+=20*d;ctx.font=font(12);const mn=CN_MO[mo].n,mw=ctx.measureText(mn).width+30*d,inc=op&&cnIncOk(i),iw=inc?cnIncW(L):0,rw=mw+(inc?iw+8*d:0),x1=mid(rw)-rw/2;
  cnRR(x1,y-12.5*d,mw,18*d,8*d);ctx.fillStyle='rgba(0,0,0,.45)';ctx.fill();cnMoGlyph(mo,x1+11*d,y-3.5*d,d);out(mn,x1+21*d,y+.5*d,CN_MO[mo].c,3);
  if(inc)cnIncPill(L,x1+mw+8*d,y-13.5*d,a,t);
  ctx.textAlign='center';y=L.info;ctx.font=font(14);const rec=cnRecTxt(i),iwn=(cnS().inc[i]||{}).win,io=cnIncOn(i),line=!op?`Finisci il ponte: ${cnBrHave(i-1)}/${cnBrNeed(i-1)} pietre`:io?(iwn?'Incubo vinto · oro doppio a ogni vittoria':'Incubo: nemici più forti · oro doppio'):won?(iwn?'Completata · Incubo vinto':'Completata'):rec?`Record ${rec}`:'Da conquistare';
  const full=won&&rec&&!io?`${line} · ${rec}`:line,lw=ctx.measureText(full).width,bx=L.cx-lw/2-6*d;cnIslBraz(bx,y-4*d,d*1.25,won,t);out(full,L.cx+10*d,y,io?'#ff9a9a':won?'#ffd84a':op?'#f2e6cc':'#c9b9a0',3.4)
  ctx.restore()}
function cnMoGlyph(mo,x,y,d){ctx.save();ctx.translate(x,y);ctx.scale(d*.55,d*.55);ctx.lineWidth=2;ctx.strokeStyle=INK;ctx.lineJoin='round';
  if(mo==='torre'){ctx.fillStyle='#8fd0ff';ctx.beginPath();ctx.rect(-6,-6,12,14);ctx.fill();ctx.stroke();ctx.beginPath();ctx.rect(-7.5,-10,15,4);ctx.fill();ctx.stroke()}
  else if(mo==='trappole'){ctx.fillStyle='#c9ced4';ctx.beginPath();for(let j=0;j<16;j++){const r=j%2?5:9,a=j/16*TAU;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ff8a3c';ctx.beginPath();ctx.arc(0,0,2.4,0,TAU);ctx.fill()}
  else{ctx.fillStyle='#e8d6b0';ctx.beginPath();ctx.moveTo(-7,9);ctx.lineTo(-7,-2);ctx.arc(0,-2,7,Math.PI,0);ctx.lineTo(7,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=INK;ctx.fillRect(-2.5,1,5,8)}
  ctx.restore()}
function cnIslBraz(x,y,d,on,t){ctx.save();const K=proCam(CNI_FACE,x,y+d*2,d*.62),{V0}=K;
  for(let j=0;j<3;j++){const a=j/3*TAU+.5;C3.caps(V0,[Math.cos(a)*7,Math.sin(a)*7,0],1.3,[Math.cos(a)*4,Math.sin(a)*4,6],1.1,'#3a2e24',{lw:1.4,noRim:1})}
  pRound(K,[0,0,5],[[0,4],[3,8.5],[5,10]],'#5a4636',{m:16,lw:1.6,kl:.35,kd:.45});C3.disc3(V0,[0,0,10.2],[0,0,1],9,{N:18});ctx.fillStyle=on?'#4a1e0a':'#2a2624';ctx.fill();
  for(let j=0;j<5;j++){const a=j/5*TAU;C3.sball(V0,[Math.cos(a)*4.6,Math.sin(a)*4.6,10.8],1.6,on?'#ff7a2a':'#7a7064',{lw:.8,kl:.4,kd:.3,rim:.1})}
  if(on){const q=V0.P([0,0,11]);pFlame(q[0],q[1],17,6.5,1,t,LOWFX);if(!LOWFX)cnSparks(q[0],q[1]-8,.7,t)}ctx.restore()}
// sparks that rise from a fire and fade, drifting (the islands' braziers)
function cnSparks(x,y,k,t){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const u=(t*(.5+i*.11)+i*.23)%1,sx=x+(Math.sin(t*2+i*2.4)*4+(i%2?1:-1)*u*9)*k,sy=y-u*38*k,sz=(2.2-u*1.6)*k;
  ctx.fillStyle=u<.4?`rgba(255,240,180,${(1-u).toFixed(2)})`:`rgba(255,150,60,${((1-u)*.9).toFixed(2)})`;ctx.fillRect(sx-sz/2,sy-sz/2,sz,sz)}ctx.restore()}
// the edges of the screen a little darker (painted once for each size)
function cnIslVig(L){const key=L.W+'x'+L.H;let c=ISL.vig;if(!c||c.key!==key){c=ISL.vig=document.createElement('canvas');c.key=key;c.width=Math.max(1,L.W>>2);c.height=Math.max(1,L.H>>2);const x=c.getContext('2d'),g=x.createRadialGradient(c.width/2,c.height*.5,c.height*.25,c.width/2,c.height*.5,c.height*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=g;x.fillRect(0,0,c.width,c.height)}
  ctx.drawImage(c,0,0,L.W,L.H)}
// ------------------------------------------------ the home's canvas: the islands instead of the crypt (the Zombie keeps its fire)
{const _dc=drawCamp;drawCamp=function(dt){if(!CN.on||(!MM.tr&&zMode()))return _dc.apply(this,arguments);glowTick();const T=MM.tr;
  if(!T){cnIsles(dt);return}
  // the change of mode (the same sweep as src/js/67-menu-modi.js, with the islands as the Classic side)
  const el=CAMP.t-T.t0,w=mez(clamp((el-.12)/.95,0,1)),W=campCv.width,H=campCv.height,toZ=T.to==='zombie';if(el>.62)modeMid();if(el>=MM.DUR){modeFinish();return drawCamp(0)}
  const kOld=toZ?1:1-mez(clamp(el/.45,0,1)),kNew=toZ?mez(clamp((el-.75)/.6,0,1)):1;
  if(T.from==='zombie'){CAMP.t+=dt;G.t=CAMP.t;drawCampZ(dt,kOld)}else cnIsles(dt);
  const edge=x=>T.dir<0?W*(1-w)+x:W*w-x,sl=H*.18;campX.save();campX.setTransform(1,0,0,1,0,0);campX.beginPath();
  if(T.dir<0){campX.moveTo(edge(0)+sl,0);campX.lineTo(W+2,0);campX.lineTo(W+2,H);campX.lineTo(edge(0)-sl,H)}else{campX.moveTo(-2,0);campX.lineTo(edge(0)+sl,0);campX.lineTo(edge(0)-sl,H);campX.lineTo(-2,H)}
  campX.closePath();campX.clip();if(toZ)drawCampZ(dt,kNew);else{const t0=CAMP.t;cnIsles(dt);CAMP.t=t0}campX.restore()}}
// ------------------------------------------------ the finger: sideways it moves the islands (in the Classic it does not change mode any more:
// the zombie hand does), a tap on a side island goes there, a tap on the name opens the map
{const st=$('homeStage');
  st.addEventListener('pointerdown',e=>{if(!cnIslOn()||MM.tr||e.target.closest('button'))return;ISL.hold=null;ISL.drag={x:e.clientX,y:e.clientY,v0:ISL.view,t:performance.now(),id:e.pointerId,moved:false,ax:null,lv:ISL.view,lt:performance.now(),vel:0}},true);
  st.addEventListener('pointermove',e=>{const D=ISL.drag;if(!D||D.id!==e.pointerId||!ISL.lay)return;const dx=e.clientX-D.x,dy=e.clientY-D.y;
    // up and down along the path (the next island is up: the finger going down brings it), or sideways as before (to the left the next)
    if(!D.moved&&Math.hypot(dx,dy)>9){D.moved=true;D.ax=Math.abs(dy)>Math.abs(dx)?'y':'x'}if(!D.moved)return;e.stopImmediatePropagation();
    const L=ISL.lay,now=performance.now(),v=clamp(D.v0+(D.ax==='y'?dy*L.dpr/L.pairPx:-dx*L.dpr/(L.W*.55)),-.35,ARENAS.length-.65);
    D.vel=(v-D.lv)/Math.max(1,now-D.lt);D.lv=v;D.lt=now;ISL.view=v},true);
  const end=e=>{const D=ISL.drag;if(!D||D.id!==e.pointerId)return;ISL.drag=null;if(!D.moved){cnIslTap(e);return}e.stopImmediatePropagation();MM.eatNext=true;
    cnIslGo(clamp(Math.round(ISL.view+D.vel*80),0,ARENAS.length-1))};
  st.addEventListener('pointerup',end,true);st.addEventListener('pointercancel',e=>{if(ISL.drag&&ISL.drag.id===e.pointerId){ISL.drag=null;cnIslGo(clamp(Math.round(ISL.view),0,ARENAS.length-1))}},true)}
function cnIslGo(j){ISL.go=j;if(j===ISL.cur){sfx('ui');return}
  if(cnOpen(j)){const a=ISL.cur;cnIslMove(a,j);const S=cnS();S.pick=j;save();sfx('ui');tone(330,660,.18,'triangle',.03);renderPlay()}else{sfx('ui');tone(220,160,.2,'square',.02)}}
function cnIslTap(e){const L=ISL.lay;if(!L)return;const r=campCv.getBoundingClientRect(),x=(e.clientX-r.left)*L.dpr,y=(e.clientY-r.top)*L.dpr;
  const ib=ISL.incBtn;if(ib&&x>ib[0]&&x<ib[2]&&y>ib[1]&&y<ib[3]){ISL.inc=!ISL.inc;sfx('ui');if(ISL.inc){tone(160,90,.5,'sawtooth',.03);vib([20,30,20])}else tone(330,520,.15,'triangle',.03);cnPlayLbl();return}
  if(y<L.lab+42*L.dpr&&y>L.lab-10*L.dpr&&Math.abs(x-L.cx)<L.W*.34){sfx('ui');cnMapOpen();return}
  // a tap on the bridge or on the island beyond it goes there (an island still closed says how to open it)
  const v=Math.round(ISL.view),A=cnIslAt(v,L,CAMP.t);if(y>L.titleB&&y<A.y-CNI_R*.5*A.k&&Math.abs(x-L.cx)<L.W*.42&&v<ARENAS.length-1){if(cnOpen(v+1))cnIslGo(v+1);else{toast(`Finisci il ponte da «${ARENAS[v].n}»: ${cnBrHave(v)}/${cnBrNeed(v)} pietre`);sfx('ui')}}}
// «Gioca» plays the island you see; a locked one tells you how to open it
{const _gp=goPlay;goPlay=function(mode){if(CN.on&&mode==='arena'&&!zMode()&&ISL.cur!=null&&!CN.next){const v=ISL.go!=null?ISL.go:Math.round(ISL.view);
    if(!cnOpen(v)){toast(`Finisci il ponte da «${ARENAS[v-1].n}»: ${cnBrHave(v-1)}/${cnBrNeed(v-1)} pietre`);sfx('ui');return}if(v!==cnPick()){const S=cnS();S.pick=v;save()}
    CN.incRun=!!ISL.inc&&cnIncOk(v)}
  return _gp.apply(this,arguments)}}
// back to the menu: the hero is on the island of the arena to play (after a first victory he jumps to the next one)
{const _sm=showMenu;showMenu=function(){const r=_sm.apply(this,arguments);try{if(CN.on)cnIslSync(true)}catch(err){cnErr(err)}return r}}
// the four modes of the map in a row above «Gioca»; the arena card goes (its island says it all)
function cnModeRow(){if(!CN.on)return;cnEnsure();let el=$('cnModeRow');if(!el){el=document.createElement('div');el.id='cnModeRow';const pr=document.querySelector('#tabPlay .playRow');pr.parentNode.insertBefore(el,pr)}
  const S=cnS(),T=S.tower,RL=cnRushList().length,found=CN_REL.filter(r=>S.relics[r.id]).length,nm=S.nem.length,h=`<button class="cnMode" data-sub="tower" style="--mc:#c48ae8">${cnIco('totem')}<b>Torre</b><small>${T.wk===cnWeek()&&T.best?'Piano '+T.best:'Settimana'}</small></button>
    <button class="cnMode" data-sub="rush" style="--mc:#e5484d">${cnIco('crown')}<b>Corsa</b><small>${RL?RL+' custodi':'Chiusa'}</small></button>
    <button class="cnMode" data-sub="rel" style="--mc:#ffc93c">${cnRelIco('stella')}<b>Reliquie</b><small>${found} di ${CN_REL.length}</small></button>
    <button class="cnMode" data-sub="nem" style="--mc:#c0392b">${cnIco('poster')}<b>Ricercati</b><small>${nm?nm+' ti cercano':'Nessuno'}</small>${nm?`<i class="cnBadge">${nm}</i>`:''}</button>`;
  if(el._h!==h){el._h=h;el.innerHTML=h;el.querySelectorAll('.cnMode').forEach(m=>m.onclick=()=>{sfx('ui');cnMapOpen();CN.sub=m.dataset.sub;CN.subOnly=true;cnMapRender()})}}
{const _rp=renderPlay;renderPlay=function(){const r=_rp.apply(this,arguments);try{cnModeRow()}catch(err){cnErr(err)}return r}}
// from the row, the back arrow of a mode closes the map (the islands are the map now)
{const _sw=cnSubWire;cnSubWire=function(el){_sw.apply(this,arguments);const x=el.querySelector('.cnX');if(x&&CN.subOnly){x.onclick=()=>{CN.subOnly=false;sfx('ui');CN.sub=null;cnMapClose()}}}}
{const _mo=cnMapOpen;cnMapOpen=function(){CN.subOnly=false;return _mo.apply(this,arguments)}}
// the sideways swipe of src/js/67-menu-modi.js never changes the mode while the finger is moving the islands
{const _ms=modeSwitch;modeSwitch=function(){if(CN.on&&!zMode()&&ISL.drag)return;return _ms.apply(this,arguments)}}

// ---------------------------------------------------------------- 8 il ponte di pietre, la Prova dell'Incubo, le arene chiuse al buio
// Denis: «non fare in modo che si possa passare da un'isola all'altra solo vincendo una partita da 10 round» → «più difficile», poi «aggiungi
// ponte di pietra e prova dell'incubo a parte perché la voglio provare», e «oscura tutte le arene non accessibili così che non si vedono i boss».
// Il ponte: ogni partita porta pietre (3 per ogni stanza o piano superato, il custode 25 in più: una vittoria fa circa metà ponte); finito il
// ponte l'isola dopo si apre e l'eroe ci passa. L'Incubo, a parte: sulle isole vinte un interruttore «Incubo» sotto il nome; nemici più forti,
// più élite, il custode già arrabbiato, la stanza rossa; oro doppio e 3 cristalli se vinci, una luna rossa sull'isola; niente pietre.
const CN_STONE='<svg viewBox="0 0 24 24"><path d="M2.5 15.5l4.2-6.4h9.6l5.2 6.4-4.4 4.6H6.8z" fill="#9a9384" stroke="#1b1612" stroke-width="2" stroke-linejoin="round"/><path d="M6.7 9.1l3.1 6.4h11.4M9.8 15.5l-3 4.6" fill="none" stroke="#1b1612" stroke-width="1.3" opacity=".55"/><path d="M8 10.4h7.4" stroke="#fff" stroke-width="1.2" opacity=".35"/></svg>';
const CN_MOON='<svg viewBox="0 0 24 24"><path d="M15.5 3.2A9 9 0 1 0 20.8 16 7.2 7.2 0 0 1 15.5 3.2z" fill="#e5484d" stroke="#1b1612" stroke-width="2" stroke-linejoin="round"/></svg>';
// the stones a run brings: 3 for each room (or floor) passed, 25 more for the custode; the Incubo none
function cnStones(win){if(G.cnInc)return 0;const T=G.cnTw,N=T?T.plan.length:ROOMS,passed=win?N:Math.max(0,(T?(T.f||1):(G.room||1))-1);return Math.round(30*passed/N)+(win?25:0)}
function cnBridgeAdd(a,win){const S=cnS(),nx=ARENAS[a+1];if(!nx||S.all)return'';const need=cnBrNeed(a),had=Math.min(need,S.br[a]||0);if(had>=need)return'';
  const st=cnStones(win);if(st<=0)return'';const now=Math.min(need,had+st),done=now>=need;S.br[a]=now;
  CN.brAnim={i:a,from:cnBrStones(had,need),to:cnBrStones(now,need),done};if(done)S.pick=a+1;
  return`<div class="cnBridge${done?' done':''}">${CN_STONE}<span>${done?`Il ponte è finito! <b>${nx.n}</b> è aperta`:`Ponte verso <b>${nx.n}</b> · +${st} pietre`}</span><i><em style="width:${Math.round(now/need*100)}%"></em></i><small>${now}/${need}</small></div>`}
// ------------------------------------------------ the bridge of stone to the next island, straight north (Denis: «il ponte lo voglio fatto
// decisamente molto meglio rispetto ad com'è ora. sembra troppo piatto»): a hump-backed bridge paved with slabs, a balustrade of little pillars
// under a stone rail on each side, four tall pillars with lanterns at its two ends, the world hanging from its edges (vines, moss, icicles,
// embers); while it is not finished its stones stop where the work is, then a walkway of planks with ropes, and the next stones waiting
const CNB={hw:24,pw:4.6,hb:10,rh:3,H:22,st:2.6,cw:2.6};   // half the deck, the balustrade's width, its pillars, the rail, the hump, the step, the ledge
function cnBrGeo(i){const a0=cnIslRim(i,true)-1,a1=CNI_GAP-cnIslRim(i+1,false)+6;return{a0,a1,len:a1-a0}}
const cnBrZ=(G0,n)=>CNB.st+CNB.H*Math.sin(Math.PI*clamp((n-G0.a0)/G0.len,0,1));
// the bridge's picture: island i's own at its foot, island i+1's at the other end, sliding from one to the other (so both ends sit on their
// islands and the far end is smaller, as the far island)
function cnBrMap(i,L,t,nob){const A=cnIslAt(i,L,t,nob),B=cnIslAt(i+1,L,t,nob),G0=cnBrGeo(i),w=n=>{const u=(n-G0.a0)/G0.len;return u<=0?0:u>=1?1:u*u*(3-2*u)};
  return{A,B,G:G0,K:n=>{const q=w(n);return A.k+(B.k-A.k)*q},z:n=>cnBrZ(G0,n),
    S:(n,e,z)=>{const q=w(n),xa=A.x+e*A.k,ya=A.y-(.55*n+z)*A.k,xb=B.x+e*B.k,yb=B.y-(.55*(n-CNI_GAP)+z)*B.k;return[xa+(xb-xa)*q,ya+(yb-ya)*q]}}}
// a face of the bridge turned to [north, east, up] in the light (as pShade)
const cnBrSh=(nn,ne,nz,col)=>{const L=cnLt(),n=C3.nrm([nn*CNI_NV[0]+ne*CNI_EV[0],nn*CNI_NV[1]+ne*CNI_EV[1],nz]),l=C3.dot(n,L);return l>=0?C3.lt(col,.3*l):C3.dk(col,-.5*l)};
const cnQ=(p,fill,lw,ink)=>{C3.poly(p);ctx.fillStyle=fill;ctx.fill();if(lw>0){ctx.strokeStyle=ink||INK;ctx.lineWidth=lw;ctx.stroke()}};
// a block of the bridge seen from the south: its face toward us and its top (a: its south face, d deep, e across, w wide, z0 up to z0 + h)
function cnBrBox(P,a,d,e,w,z0,h,col,lw,dy){const f=[P(a,e-w/2,z0,dy),P(a,e+w/2,z0,dy),P(a,e+w/2,z0+h,dy),P(a,e-w/2,z0+h,dy)],tp=[f[3],f[2],P(a+d,e+w/2,z0+h,dy),P(a+d,e-w/2,z0+h,dy)];
  cnQ(f,cnBrSh(-1,0,0,col),lw);cnQ(tp,cnBrSh(0,0,1,col),lw)}
function cnIslBridge(i,L,t){if(!ARENAS[i+1])return;const M=cnBrMap(i,L,t),{a0,a1}=M.G,d=L.dpr;
  const foot=M.S(a0,0,0),far=M.S(a1,0,48);if(far[1]>L.H+30*d||foot[1]<-30*d)return;
  const S=cnS(),an=ISL.brA&&ISL.brA.i===i,key=ISL.view.toFixed(4)+'|'+L.k.toFixed(3)+'|'+L.W+'x'+L.H+'|'+[cnBrDone(i)||!!S.all,cnBrHave(i),cnOpen(i),!!S.all,LOWFX].join(),C=(ISL.bc||(ISL.bc={}))[i];
  // with the camera still the bridge is painted once in a picture of its own and copied; the lanterns' lights and the vines stay alive
  if(!an&&!ISL.drag&&!(C&&C.key===key)&&ISL.pv===ISL.view)cnBrBake(i,L,t,key);
  const B=ISL.bc[i];if(!an&&!ISL.drag&&B&&B.key===key){ctx.drawImage(B.cv,B.x,B.y+Math.sin(t*.9)*2.2*d*(M.A.f+M.B.f)/2);cnBrPaint(i,L,t,M,{vines:true,lights:true});return}
  cnBrPaint(i,L,t,M,{vines:true,body:true,lights:true})}
function cnBrBake(i,L,t,key){const M=cnBrMap(i,L,t,true),{a0,a1}=M.G,po=CNB.hw+CNB.pw,d=L.dpr,pts=[M.S(a0,-po-40,-4),M.S(a0,po+90,-4),M.S(a1,-po-30,60),M.S(a1,po+90,60),M.S((a0+a1)/2,po+90,30)];
  const x0=Math.max(0,Math.floor(Math.min(...pts.map(p=>p[0])))),x1=Math.min(L.W,Math.ceil(Math.max(...pts.map(p=>p[0])))),y0=Math.max(-20*d,Math.floor(Math.min(...pts.map(p=>p[1]))-8*d)),y1=Math.min(L.H+20*d,Math.ceil(Math.max(...pts.map(p=>p[1]))+14*d));
  if(x1-x0<4||y1-y0<4)return;const old=ISL.bc[i],cv=old&&old.cv.width===x1-x0&&old.cv.height===y1-y0?old.cv:document.createElement('canvas');cv.width=x1-x0;cv.height=y1-y0;
  const keep=ctx;ctx=cv.getContext('2d');try{ctx.setTransform(1,0,0,1,-x0,-y0);cnBrPaint(i,L,t,M,{body:true})}catch(err){cnErr(err)}finally{ctx=keep}ISL.bc[i]={cv,x:x0,y:y0,key}}
function cnBrPaint(i,L,t,M,o){const{a0,a1,len}=M.G,d=L.dpr;
  const S=cnS(),need=cnBrNeed(i),done=cnBrDone(i)||!!S.all,N=CN_BRS,n=done?N:cnBrStones(cnBrHave(i),need),an=ISL.brA&&ISL.brA.i===i?ISL.brA:null,now=performance.now()/1000;
  // from an island still closed the bridge is in the dark as the island (only planks: nobody brings stones there yet)
  const dim=!cnOpen(i)&&!S.all,dk=c=>dim?cnMixC(c,'#06070c',.82):c,wood=c=>dk(c);
  const Wa=cnIslW(i),Wb=cnIslW(i+1),stone=dk(cnMixC(cnMixC(Wa.stone,Wb.stone,.5),'#c8bca4',.35)),deckC=cnMixC(stone,'#ffffff',dim?0:.06),railC=cnMixC(stone,'#ffffff',dim?0:.16),ledC=cnMixC(stone,'#0d1418',.18),chA=ARENAS[i].ch||1,chB=ARENAS[i+1].ch||1,
    row=j=>a0+len*j/N,chOf=a=>(a-a0)/len<.5?chA:chB,hw=CNB.hw,po=hw+CNB.pw,lw=a=>1.1*M.K(a);
  // a row of stones that is falling in place (those of the last run, one after another, each with its knock)
  const vis=j=>{const y0=M.S(row(j),0,0)[1],y1=M.S(row(j+1),0,40)[1];return Math.min(y0,y1)<L.H+20*d&&Math.max(y0,y1)>-20*d};
  const drop=j=>{if(j<0||j>=N||!vis(j))return{dy:0,al:0,on:false};if(!an||j<an.from||j>=an.to)return{dy:0,al:1,on:j<n};const q=clamp((now-an.t0-(j-an.from)*.2)/.42,0,1);if(q<=0)return{dy:0,al:0,on:false};
    if(q>=1&&!an['s'+j]){an['s'+j]=1;tone(120+j*9,60,.12,'triangle',.045)}return{dy:-(1-q*q)*70*M.K(row(j)),al:q,on:true}};
  const P=(a,e,z,dy)=>{const p=M.S(a,e,z);return[p[0],p[1]+(dy||0)]};
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  // 1 what hangs from the edges of the stones (behind everything): vines, moss, icicles, cold embers
  if(o.vines)for(let j=0;j<N;j++){const D=drop(j);if(!D.on||D.al<1)continue;for(const h of[.3,.75]){const a=row(j+h);for(const s of[-1,1]){if(prH(j*4+h*4+(s>0),i+3)<.35)continue;const ch=chOf(a),top=P(a,s*(po+CNB.cw),M.z(a)-1.4),k=M.K(a),L2=(8+prH(j*2+(s>0),i+3)*12)*k,sw=LOWFX?0:Math.sin(t*1.2+j+s)*1.6*k;
    if(ch===4){ctx.fillStyle='#e6f4ff';ctx.strokeStyle='rgba(60,90,120,.85)';ctx.lineWidth=.8*k;for(const o of[-2.4,1.8]){ctx.beginPath();ctx.moveTo(top[0]+o*k-1.5*k,top[1]);ctx.lineTo(top[0]+o*k+1.5*k,top[1]);ctx.lineTo(top[0]+o*k,top[1]+L2*(o<0?.8:.55));ctx.closePath();ctx.fill();ctx.stroke()}}
    else if(ch===2){ctx.fillStyle='#2a2224';ctx.beginPath();ctx.moveTo(top[0]-2.2*k,top[1]);ctx.lineTo(top[0]+2.2*k,top[1]);ctx.lineTo(top[0],top[1]+L2*.5);ctx.closePath();ctx.fill();if(!LOWFX){ctx.fillStyle=`rgba(255,${120+Math.round(60*Math.sin(t*3+j))},40,.9)`;ctx.beginPath();ctx.arc(top[0],top[1]+L2*.5,1.1*k,0,TAU);ctx.fill()}}
    else{ctx.strokeStyle=ch===3?'#3e5a2a':'#4f8a34';ctx.lineWidth=1.4*k;ctx.beginPath();ctx.moveTo(top[0],top[1]);ctx.quadraticCurveTo(top[0]+sw+s*1.5*k,top[1]+L2*.5,top[0]+sw*1.4,top[1]+L2);ctx.stroke();
      if(ch===1){ctx.fillStyle='#6aa84c';for(const f of[.45,.85]){ctx.beginPath();ctx.ellipse(top[0]+sw*f*1.2+s*1.6*k,top[1]+L2*f,2*k,1.2*k,s*.6,0,TAU);ctx.fill()}}}}}}
  // the lanterns' lights (alive)
  if(o.lights&&done&&!dim)for(const s of[-1,1]){cnBrPillar(M,P,a1-4,s*(po+6),stone,i+1,t,true,false,1);cnBrPillar(M,P,a0+2,s*(po+6),stone,i,t,true,true,1)}
  if(!o.body){ctx.restore();return}
  // 2 the pillars at the far end (a finished bridge)
  if(done)for(const s of[-1,1])cnBrPillar(M,P,a1-4,s*(po+6),stone,i+1,t,!dim,false);
  // 3 where the stones are not yet: two beams and planks on them, posts with a rope on each side
  if(!done){const b0=row(n);for(const s of[-1,1]){const pts=[];for(let j=0;j<=12;j++){const a=plerp(b0,a1,j/12);pts.push(P(a,s*(hw-5),M.z(a)-1.6))}ctx.strokeStyle=INK;ctx.lineWidth=5.4*M.K(b0);C3.line(pts);ctx.stroke();ctx.strokeStyle=wood('#6a4a2e');ctx.lineWidth=3.6*M.K(b0);C3.line(pts);ctx.stroke()}
    for(let j=N*2-1;j>=n*2;j--){const a=a0+len*(j+.5)/(N*2),z=M.z(a)-.6,k=M.K(a),tilt=(prH(j,i)-.5)*1.4,wc=wood(prH(j,i+1)>.5?'#a8804e':'#8e6c42');
      const T=[P(a-2.4,-hw-1,z+tilt),P(a-2.4,hw+1,z-tilt),P(a+2.4,hw+1,z-tilt),P(a+2.4,-hw-1,z+tilt)],F=[P(a-2.4,-hw-1,z+tilt-1.5),P(a-2.4,hw+1,z-tilt-1.5),T[1],T[0]];
      cnQ(F,wood('#4a3422'),.9*k);cnQ(T,cnBrSh(0,0,1,wc),.9*k);ctx.strokeStyle='rgba(60,40,24,.45)';ctx.lineWidth=.6*k;ctx.beginPath();const m0=P(a,-hw,z+tilt*.9),m1=P(a,hw,z-tilt*.9);ctx.moveTo(m0[0],m0[1]);ctx.lineTo(m1[0],m1[1]);ctx.stroke()}
    for(const s of[-1,1]){const posts=[];for(let j=n;j<=N;j+=2){const a=Math.min(a1-3,row(j)+1.5),z=M.z(a),k=M.K(a),e=s*(hw+1.4);posts.push([a,e,z]);cnBrBox(P,a,1.6,e,1.8,z-1.6,11,wood('#6a4a2e'),1*k)}
      if(posts.length>1){const rp=[];for(let q=0;q<posts.length-1;q++){const A0=posts[q],B0=posts[q+1];for(let u=0;u<=6;u++){const a=plerp(A0[0],B0[0],u/6);rp.push(P(a,A0[1],plerp(A0[2],B0[2],u/6)+8.6-Math.sin(Math.PI*u/6)*2.4))}}
        ctx.strokeStyle=INK;ctx.lineWidth=2.2*M.K(row(n));C3.line(rp);ctx.stroke();ctx.strokeStyle=wood('#d8c08a');ctx.lineWidth=1.1*M.K(row(n));C3.line(rp);ctx.stroke()}}}
  // 4 the deck: rows of slabs, four across (two of them shifted half a slab), lit by their slope; the ledge along both sides; the step at the
  // foot; the shadow of the left balustrade on the slabs
  for(let j=N-1;j>=0;j--){const D=drop(j);if(!D.on)continue;ctx.save();ctx.globalAlpha*=D.al;const s0=row(j),s1=row(j+1),z0=M.z(s0),z1=M.z(s1),sl=(z1-z0)/(s1-s0),k=M.K(s0);
    for(const s of[-1,1]){const e0=s*po,e1=s*(po+CNB.cw);cnQ([P(s0,e0,z0-.7,D.dy),P(s0,e1,z0-.7,D.dy),P(s1,e1,z1-.7,D.dy),P(s1,e0,z1-.7,D.dy)],cnBrSh(-sl,0,1,ledC),.9*k)}
    for(const[e0,e1,off] of[[-po,-hw/2,0],[-hw/2,0,.5],[0,hw/2,0],[hw/2,po,.5]]){const cuts=off?[s0,(s0+s1)/2,s1]:[s0,s1];
      for(let c=0;c<cuts.length-1;c++){const ca=cuts[c],cb=cuts[c+1],za=M.z(ca),zb=M.z(cb),col=cnMixC(deckC,'#7a6e5c',prH(j*5+c+e0,i)*.32);
        cnQ([P(ca,e0,za,D.dy),P(ca,e1,za,D.dy),P(cb,e1,zb,D.dy),P(cb,e0,zb,D.dy)],cnBrSh(-sl,0,1,col),.85*k,C3.dk(deckC,.55))}}
    ctx.fillStyle='rgba(20,14,10,.2)';C3.poly([P(s0,-hw,z0+.05,D.dy),P(s0,-hw+5.5,z0+.05,D.dy),P(s1,-hw+5.5,z1+.05,D.dy),P(s1,-hw,z1+.05,D.dy)]);ctx.fill();
    const cj=chOf(s0);if(cj===4){ctx.fillStyle='rgba(250,253,255,.85)';const q=P((s0+s1)/2,(prH(j,i)-.5)*hw*1.4,(z0+z1)/2+.2,D.dy);ctx.beginPath();ctx.ellipse(q[0],q[1],5*k,1.8*k,0,0,TAU);ctx.fill()}
    else if(cj===1||cj===3){ctx.fillStyle=cj===1?'rgba(110,170,70,.7)':'rgba(80,110,50,.65)';const q=P(s0+2,(prH(j,i+9)>.5?1:-1)*hw*.8,z0+.2,D.dy);ctx.beginPath();ctx.ellipse(q[0],q[1],3.8*k,1.4*k,0,0,TAU);ctx.fill()}
    else if(cj===2&&prH(j,i+4)>.55){ctx.strokeStyle='rgba(255,120,40,.75)';ctx.lineWidth=.9*k;const q0=P(s0+1,(prH(j,i+2)-.5)*hw,z0+.1,D.dy),q1=P(s1-1,(prH(j,i+3)-.5)*hw,z1+.1,D.dy);ctx.beginPath();ctx.moveTo(q0[0],q0[1]);ctx.lineTo((q0[0]+q1[0])/2+2*k,(q0[1]+q1[1])/2);ctx.lineTo(q1[0],q1[1]);ctx.stroke()}
    if(j===0)cnQ([P(a0,-po-CNB.cw,0,D.dy),P(a0,po+CNB.cw,0,D.dy),P(a0,po+CNB.cw,z0,D.dy),P(a0,-po-CNB.cw,z0,D.dy)],cnBrSh(-1,0,.15,ledC),1.1*k);
    ctx.restore()}
  // 5 the balustrade: little pillars (their face to the south and their top) twice a row on each side, the rail on them, moss or snow on it
  for(let q=N*2;q>=0;q--){const j=Math.floor(q/2),D=drop(Math.min(j,N-1)),D2=q%2===0&&j>0?drop(j-1):D,R0=D.on?D:D2.on?D2:null;if(!R0||(q===N*2&&!done))continue;
    const a=q===0?a0+2:q===N*2?a1-2:a0+len*q/(N*2),z=M.z(a),k=M.K(a);ctx.save();ctx.globalAlpha*=R0.al;
    for(const s of[-1,1])cnBrBox(P,a-1.1,2.2,s*(hw+CNB.pw/2),q%2?3:4,z,CNB.hb,railC,lw(a),R0.dy);
    ctx.restore()}
  for(let j=N-1;j>=0;j--){const D=drop(j);if(!D.on)continue;const s0=j===0?a0+.6:row(j),s1=j===N-1?a1-.6:row(j+1),k=M.K(s0);ctx.save();ctx.globalAlpha*=D.al;
    for(const s of[-1,1]){const e0=s*(hw-.6),e1=s*(po+.6),z0=M.z(s0)+CNB.hb,z1=M.z(s1)+CNB.hb,sl=(z1-z0)/(s1-s0),r=CNB.rh,ch=chOf(s0);
      cnQ([P(s0,e0,z0,D.dy),P(s0,e1,z0,D.dy),P(s0,e1,z0+r,D.dy),P(s0,e0,z0+r,D.dy)],cnBrSh(-1,0,0,railC),lw(s0));
      const top=[P(s0,e0,z0+r,D.dy),P(s0,e1,z0+r,D.dy),P(s1,e1,z1+r,D.dy),P(s1,e0,z1+r,D.dy)];cnQ(top,cnBrSh(-sl,0,1,C3.lt(railC,.05)),lw(s0));
      ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=.9*k;ctx.beginPath();const h0=P(s0,s*(hw+.2),z0+r,D.dy),h1=P(s1,s*(hw+.2),z1+r,D.dy);ctx.moveTo(h0[0],h0[1]);ctx.lineTo(h1[0],h1[1]);ctx.stroke();
      if(ch===4||((ch===1||ch===3)&&prH(j*2+(s>0),i+5)>.45)){const m=P((s0+s1)/2,s*(hw+CNB.pw*.5),(z0+z1)/2+r+.3,D.dy);ctx.fillStyle=ch===4?'#f6fbff':ch===1?'#7ab85a':'#5a7a32';ctx.beginPath();ctx.ellipse(m[0],m[1],(ch===4?4:3)*k,1.4*k,0,0,TAU);ctx.fill()}}
    ctx.restore()}
  // 6 the next stones waiting where the work is
  if(!done){const a=n>0?row(n)-4:a0+10,z=M.z(a),k=M.K(a);for(const[da,e,h] of[[0,6,0],[0,14,0],[3,10,4.6]])cnBrBox(P,a+da,6,e,7,z+h,4.6,C3.lt(stone,.06),1.1*k)}
  // 7 the pillars at the foot, their lanterns lit on a finished bridge
  for(const s of[-1,1])cnBrPillar(M,P,a0+2,s*(po+6),stone,i,t,done&&!dim,true);
  // 8 how many stones (a bridge not finished, from an island you can play)
  if(!done&&cnOpen(i)&&P(a0+len*.5,0,0)[1]<L.info-24*d){const am=a0+len*.5,q=P(am,po+34,M.z(am)+4),txt=`${cnBrHave(i)}/${need}`;ctx.font=`${Math.round(11.5*d)}px "Lilita One", sans-serif`;const w=ctx.measureText(txt).width+27*d;
    cnRR(q[0]-w/2,q[1]-10*d,w,17*d,8*d);ctx.fillStyle='rgba(0,0,0,.62)';ctx.fill();ctx.save();const K=proCam(CNI_FACE,q[0]-w/2+9.5*d,q[1]+1.5*d,.62*d);oBox(K,[0,0,0],7,9,3,'#9a9384',{lw:1.2,ew:.3,cf:nn=>nn[2]>.5?'#c8c0ae':'#7a7466'});ctx.restore();
    ctx.textAlign='left';ctx.lineWidth=2.6*d;ctx.strokeStyle=INK;ctx.strokeText(txt,q[0]-w/2+18*d,q[1]+3*d);ctx.fillStyle='#e8dcc0';ctx.fillText(txt,q[0]-w/2+18*d,q[1]+3*d)}
  ctx.restore()}
// a pillar at an end of the bridge: plinth, round column, cap and an iron lantern (lit on a finished bridge); at the far end the banner of
// the arena it leads to
function cnBrPillar(M,P,a,e,stone,j,t,lit,near,light){const z=M.z(a)-CNB.st,k=M.K(a),lw=1.2*k,ac=ARENAS[j]?ARENAS[j].col:'#c0392b';
  if(light){const q=P(a-3.5,e,z+36.6),fl=LOWFX?1:.82+.18*Math.sin(t*8+a+e);pLight(q[0],q[1],26*k,'255,190,90',.5*fl,20*k);if(!LOWFX)pFlame(q[0],q[1]+2*k,6*k,2.8*k,1,t+a,false);return}
  cnBrBox(P,a-6,12,e,14,z,6,C3.dk(stone,.1),lw);
  // the column: a round shaft lit from the left
  const c0=P(a,e-4,z+6),c1=P(a,e+4,z+6),c2=P(a,e+3.6,z+28),c3=P(a,e-3.6,z+28),g=ctx.createLinearGradient(c0[0],0,c1[0],0);g.addColorStop(0,C3.lt(stone,.28));g.addColorStop(.45,stone);g.addColorStop(1,C3.dk(stone,.34));cnQ([c0,c1,c2,c3],g,lw);
  if(!near){const b=[P(a-.5,e-4.4,z+26),P(a-.5,e+4.4,z+26),P(a-.5,e+4.4,z+9),P(a-.5,e,z+12.5),P(a-.5,e-4.4,z+9)];cnQ(b,ac,lw);ctx.fillStyle='rgba(255,255,255,.22)';C3.poly([b[0],b[1],P(a-.5,e+4.4,z+22),P(a-.5,e-4.4,z+22)]);ctx.fill()}
  cnBrBox(P,a-5,10,e,12.5,z+28,4,C3.lt(stone,.08),lw);
  // the lantern: an iron cage with its light, a little roof
  cnBrBox(P,a-3.4,6.8,e,7,z+32,9,'#2e2a2a',lw);const w0=P(a-3.5,e-2,z+34),w1=P(a-3.5,e+2,z+39.4);ctx.fillStyle=lit?'#ffd27a':'#4a4038';ctx.fillRect(Math.min(w0[0],w1[0]),Math.min(w0[1],w1[1]),Math.abs(w1[0]-w0[0]),Math.abs(w1[1]-w0[1]));
  cnQ([P(a-4.2,e-5,z+41),P(a-4.2,e+5,z+41),P(a,e,z+46)],cnBrSh(-1,0,.4,'#3a3434'),lw)}
// the Incubo: on for the island you look at if it is won and the switch is on
// the Incubo is there on the won islands (in the preview, with «apri tutte le arene», on all of them, to try it)
const cnIncOk=i=>cnWon(i)||!!cnS().all;
const cnIncOn=i=>!!ISL.inc&&i!=null&&cnIncOk(i)&&cnOpen(i);
const cnIncView=()=>cnIncOn(Math.round(ISL.view));
// the whole scene goes red and dark (the hero stays himself, drawn after)
function cnIncSky(L,t,a){if(!(a>0))return;ctx.save();ctx.globalAlpha=a;ctx.globalCompositeOperation='multiply';ctx.fillStyle='rgb(255,150,150)';ctx.fillRect(0,0,L.W,L.H);ctx.globalCompositeOperation='source-over';
  if(!LOWFX){const g=ctx.createRadialGradient(L.cx,L.cy,L.W*.2,L.cx,L.cy,L.H*.75);g.addColorStop(0,'rgba(80,0,10,0)');g.addColorStop(1,'rgba(60,0,8,.45)');ctx.fillStyle=g;ctx.fillRect(0,0,L.W,L.H);
    ctx.globalCompositeOperation='lighter';glow('255,40,40',L.cx,L.cy-CNI_R*.45*L.k,L.W*.42,.12+.05*Math.sin(t*2))}ctx.restore()}
// a crescent moon of red (the islands where the Incubo was won, the switch)
function cnMoonAt(x,y,r,col){ctx.save();ctx.beginPath();ctx.rect(x-r*2,y-r*2,r*4,r*4);ctx.arc(x+r*.5,y-r*.32,r*.84,0,TAU,true);ctx.clip();ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=col;ctx.fill();ctx.lineWidth=Math.max(1,r*.22);ctx.strokeStyle=INK;ctx.stroke();ctx.restore()}
function cnIncMoon(q,k,t){if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,60,60',q[0],q[1],16*k,.35+.1*Math.sin(t*2.5));ctx.restore()}cnMoonAt(q[0],q[1]-Math.sin(t*1.4)*2*k,6*k,'#e5484d')}
// the switch under the name of a won island
const cnIncW=L=>{ctx.save();ctx.font=`${Math.round(12*L.dpr)}px "Lilita One", sans-serif`;const w=ctx.measureText('Incubo').width+34*L.dpr;ctx.restore();return w};
function cnIncPill(L,x0,y0,a,t){const d=L.dpr,on=!!ISL.inc,txt='Incubo',w=cnIncW(L),h=20*d;ctx.save();ctx.globalAlpha=a;ctx.font=`${Math.round(12*d)}px "Lilita One", sans-serif`;
  if(on&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,60,60',x0+w/2,y0+h/2,w*.75,.22+.08*Math.sin(t*4));ctx.restore()}
  cnRR(x0,y0,w,h,10*d);ctx.fillStyle=on?'#b0182a':'rgba(30,6,10,.72)';ctx.fill();ctx.lineWidth=1.6*d;ctx.strokeStyle=on?'#ffb0b0':'#c0392b';ctx.stroke();
  cnMoonAt(x0+13*d,y0+h/2,5.6*d,on?'#fff0f0':'#e5484d');ctx.textAlign='left';ctx.lineWidth=3*d;ctx.strokeStyle=INK;ctx.strokeText(txt,x0+23*d,y0+h*.72);ctx.fillStyle=on?'#ffffff':'#ff9a9a';ctx.fillText(txt,x0+23*d,y0+h*.72);
  ctx.restore();if(a>.5)ISL.incBtn=[x0-4*d,y0-5*d,x0+w+4*d,y0+h+5*d]}
function cnPlayLbl(){const b=$('playBtn');if(!b)return;const on=CN.on&&!zMode()&&ISL.view!=null&&cnIncOn(ISL.go!=null?ISL.go:Math.round(ISL.view));if(b._inc===on)return;b._inc=on;b.classList.toggle('cnInc',on);const sp=b.querySelector('span');if(sp)sp.textContent=on?'Incubo':'Gioca'}
{const _zm=modeSwitch;modeSwitch=function(){const r=_zm.apply(this,arguments);try{cnPlayLbl()}catch(err){}return r}}
// the run of the Incubo: more life, more damage, elites everywhere (the knobs of DIFF changed for the run and given back after)
function cnIncStart(){if(!CN.incD)CN.incD={...DIFF};Object.assign(DIFF,{eliteBase:.3,eliteRoom:.04,eliteMax:.75,eliteFrom:1,eliteFirstArena:0,bossFirst:1,firstHp:1,firstDmg:1});G.diff=(G.diff||1)*1.5+.1;G.cnIncB=0}
function cnIncRestore(){if(CN.incD){Object.assign(DIFF,CN.incD);CN.incD=null}}
// the custode already angry: its rage starts as soon as it can fight (every custode gets angry under half its life: the bar is shown full again
// right after), never later than 5 seconds
function cnIncTick(dt){for(const e of G.enemies){if(!isBoss(e.type)||e.dead)continue;
  if(!e.cnIncA){if(e.intro>0||e.spawn>0)continue;e.cnIncA=1;e.cnIncH=e.hp;e.cnIncT=0;e.max=e.hp/.49}
  else if(e.cnIncA===1){e.cnIncT+=dt;if(e.p2||e.reborn||e.tkRage||e.raged||e.cnIncT>5){e.cnIncA=2;e.max=Math.max(e.cnIncH,e.hp)}}}}
// the end of an Incubo run: the record, 3 crystals for a victory (the gold was doubled before the end counted it)
function cnIncEnd(a,win){cnIncRestore();const S=cnS(),I=S.inc[a]||(S.inc[a]={win:false,room:0}),reached=G.cnTw?(G.cnTw.f||1):(G.room||1),first=win&&!I.win;I.room=Math.max(I.room||0,win?ROOMS:reached);
  if(win){I.win=true;SAVE.gems=(SAVE.gems||0)+3}$('endTag').textContent="Prova dell'Incubo";
  return`<div class="cnIncL">${CN_MOON}<span>${win?`${first?'Incubo vinto per la prima volta!':'Incubo vinto!'} Oro doppio e 3 cristalli`:`L'Incubo ti ha fermato ${G.cnTw?'al piano':'alla stanza'} ${reached}`}</span></div>`}
// the room of the Incubo: everything a little red, the edges dark red
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(CN.on&&G&&G.cnInc&&started)cnIncTint()}catch(err){cnErr(err)}return r}}
function cnIncTint(){const W=cv.width,H=cv.height;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='multiply';ctx.fillStyle='rgb(255,200,200)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over';
  if(!LOWFX){let g=CN.incG;if(!g||g.w!==W||g.h!==H){const c=document.createElement('canvas');c.width=Math.max(1,W>>2);c.height=Math.max(1,H>>2);const x=c.getContext('2d'),gr=x.createRadialGradient(c.width/2,c.height/2,Math.min(c.width,c.height)*.3,c.width/2,c.height/2,Math.max(c.width,c.height)*.72);
    gr.addColorStop(0,'rgba(90,0,10,0)');gr.addColorStop(1,'rgba(90,0,10,.42)');x.fillStyle=gr;x.fillRect(0,0,c.width,c.height);g=CN.incG={c,w:W,h:H}}ctx.drawImage(g.c,0,0,W,H)}ctx.restore()}
{const _sm2=showMenu;showMenu=function(){try{cnIncRestore()}catch(err){}return _sm2.apply(this,arguments)}}

// ---------------------------------------------------------------- schermate e stile
function cnEnsure(){if($('cnMap'))return;const w=$('wrap'),mk=(id,inner)=>{const d=document.createElement('div');d.className='screen cnScr';d.id=id;d.hidden=true;d.innerHTML=`<div class="${inner}" id="${id}In"></div>`;w.appendChild(d);return d};
  mk('cnRel','cnRelBox');mk('cnMap','cnMapBox');
  for(const id of['cnRed','cnSlash']){const d=document.createElement('div');d.id=id;w.appendChild(d)}
  const st=document.createElement('style');st.textContent=CN_CSS;document.head.appendChild(st)}
const CN_CSS=`
#cnHud{position:absolute;left:50%;top:calc(104px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:6;pointer-events:none;font-family:var(--display);font-size:17px;color:#fff;text-shadow:var(--tol);
  background:rgba(20,14,10,.66);border:2px solid #191714;border-radius:14px;padding:3px 12px 4px;white-space:nowrap;display:flex;gap:8px;align-items:baseline}
#cnHud b{color:var(--gold);font-weight:400}#cnHud[hidden]{display:none}
#cnFu{position:absolute;right:10px;top:calc(122px + env(safe-area-inset-top,0px));z-index:6;pointer-events:none;display:flex;flex-direction:column;align-items:flex-end;gap:2px;--fc:#a9bdd0}
#cnFu[hidden]{display:none}
#cnFu b{display:block;font-family:var(--display);font-weight:400;font-size:46px;line-height:.9;color:var(--fc);font-style:italic;transform:skewX(-8deg);
  text-shadow:0 4px 0 #191714,-2px -2px 0 #191714,2px -2px 0 #191714,-2px 2px 0 #191714,2px 2px 0 #191714,0 0 16px var(--fc)}
#cnFu span{font-family:var(--display);font-size:14px;color:#fff;text-shadow:var(--tol);letter-spacing:.06em;text-transform:uppercase}
#cnFu i{display:block;width:86px;height:7px;border:2px solid #191714;border-radius:5px;background:rgba(0,0,0,.5);overflow:hidden}
#cnFu u{display:block;height:100%;background:linear-gradient(90deg,var(--fc),#fff);transform-origin:left center;transform:scaleX(0);transition:transform .12s linear}
#cnFu small{font-size:10.5px;font-weight:800;color:#ffe9a8;text-shadow:var(--tol)}
#cnFu.burst small{font-size:12px;color:#ffd84a;transform-origin:right center;animation:cnFuBurst .45s ease-in-out infinite alternate}
#cnFu.pop b{animation:cnFuPop .45s cubic-bezier(.2,1.6,.4,1)}
#cnFu.sss b{color:#ffe27a;animation:cnFuFire .35s ease-in-out infinite alternate}
#cnRed,#cnSlash{position:absolute;inset:0;pointer-events:none;z-index:7;opacity:0}
#cnRed{background:radial-gradient(120% 90% at 50% 50%,transparent 45%,rgba(200,20,20,.55))}#cnRed.on{animation:cnRedA 1.3s ease-out}
#cnSlash{background:radial-gradient(circle at 38% 58%,rgba(110,8,8,.8) 0 1.2%,transparent 1.4%),radial-gradient(circle at 61% 41%,rgba(110,8,8,.75) 0 .9%,transparent 1.1%),radial-gradient(circle at 47% 53%,rgba(120,8,8,.7) 0 .7%,transparent .9%),linear-gradient(118deg,transparent 43%,rgba(90,4,4,.55) 45.5%,rgba(150,12,12,.85) 47.5%,rgba(205,34,34,.92) 48.8%,rgba(130,8,8,.8) 50.5%,rgba(80,4,4,.4) 52%,transparent 54%),linear-gradient(118deg,transparent 55%,rgba(130,8,8,.45) 56.2%,rgba(170,20,20,.55) 57%,transparent 58.4%)}#cnSlash.on{animation:cnSlashA 1.1s ease-out}
.cnScr{z-index:40}.cnScr .tag{text-align:center}
.cnRelBox{width:100%;max-width:440px;display:flex;flex-direction:column;align-items:center;gap:12px;color:#fff;text-align:center}
.cnRelBox h2{font-family:var(--display);font-weight:400;font-size:30px;margin:0;color:#fff;text-shadow:var(--tol)}
.cnRelBox .hint{margin:0;color:#dbd0b0;font-size:14px;max-width:340px}
.cnRels{display:flex;gap:12px;width:100%;justify-content:center}
.cnRelC,.cnRelB{position:relative;flex:1 1 0;max-width:190px;min-width:0;display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 10px 14px;border:3px solid #191714;border-radius:18px;
  background:radial-gradient(90% 60% at 50% 18%,color-mix(in srgb,var(--rc) 28%,transparent),transparent 70%),linear-gradient(#3b332b,#211b17);box-shadow:0 5px 0 #191714;color:#fff;font-family:var(--body);cursor:pointer;animation:cnIn .42s cubic-bezier(.2,1.4,.4,1) both}
.cnRelI{width:64px;height:64px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--rc) 45%,#120e0b),#120e0b 72%);border:3px solid #191714;box-shadow:0 0 18px color-mix(in srgb,var(--rc) 55%,transparent)}
.cnRelI svg{width:44px;height:44px}.cnRelC b,.cnRelB b{font-family:var(--display);font-weight:400;font-size:17px;text-shadow:var(--tol);line-height:1.1}.cnRelC>span:not(.cnRelI),.cnRelB>span:not(.cnRelI){font-size:13px;line-height:1.2;color:#e6dcc0}
.cnNew{position:absolute;top:-10px;right:-6px;font-style:normal;font-family:var(--display);font-size:13px;color:#191714;background:var(--gold);border:2px solid #191714;border-radius:9px;padding:1px 7px;transform:rotate(6deg)}
.cnMapBox{position:absolute;inset:0;display:flex;flex-direction:column;gap:8px;padding:8px 14px 10px;color:#fff;font-family:var(--body);overflow:hidden;
  background:radial-gradient(120% 60% at 50% 0%,#2b2f3d,transparent 60%),radial-gradient(100% 50% at 50% 100%,#2a1f18,transparent 70%),#141015}
.cnHd{display:flex;align-items:center;gap:10px;flex:0 0 auto}.cnHd h2{flex:1;margin:0;font-family:var(--display);font-weight:400;font-size:24px;text-shadow:var(--tol);text-align:center}
.cnX{width:40px;height:40px;border-radius:12px;border:3px solid #191714;background:#4d4237;color:#fff;font-family:var(--display);font-size:26px;line-height:1;box-shadow:0 3px 0 #191714;cursor:pointer}
.cnTot{min-width:40px;display:flex;align-items:center;gap:3px;font-family:var(--display);font-size:20px;color:var(--gold);text-shadow:var(--tol)}.cnTot svg{width:18px;height:24px}.cnTot .fl,.cnTr .fl,.cnCkB .fl,.cnSt .fl{fill:#ff8a3c}.cnTot small{font-size:13px;color:#dbd0b0}
.cnFire{flex:0 0 auto;background:rgba(0,0,0,.35);border:2px solid #191714;border-radius:14px;padding:6px 8px}
.cnBrs{display:flex;justify-content:space-between}.cnBr{width:22px;height:29px;display:block}.cnBr svg{width:100%;height:100%;overflow:visible}.cnBr .fl{fill:#2a231d;stroke:#191714;stroke-width:1.5}
.cnBr.on .fl{fill:var(--ac);filter:drop-shadow(0 0 4px var(--ac));animation:cnFlick 1.3s ease-in-out infinite alternate;transform-origin:50% 90%}
.cnFl{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:3px;font-size:12.5px;color:#dbd0b0;flex-wrap:wrap}.cnFl span+span{color:#8f846e}
.cnPath{flex:1 1 auto;min-height:120px;overflow-y:auto;overflow-x:hidden;border-radius:14px;background:repeating-linear-gradient(0deg,rgba(255,255,255,.02) 0 2px,transparent 2px 26px)}
.cnPin{position:relative}.cnLine{position:absolute;left:0;top:0;width:100%;height:100%}.cnLine line{stroke:#3b332b;stroke-width:7;stroke-linecap:round;vector-effect:non-scaling-stroke;stroke-dasharray:2 12}
.cnLine line.on{stroke:#b8a990}
.cnN{position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;gap:8px;background:none;border:0;padding:0;color:#fff;cursor:pointer;font-family:var(--body)}.cnN.l{flex-direction:row}.cnN.r{flex-direction:row-reverse}
.cnPic{position:relative;width:66px;height:66px;flex:0 0 auto;border-radius:50%;border:3px solid #191714;box-shadow:0 0 0 3px var(--ac),0 5px 0 3px #191714;overflow:hidden;background:#211b17}
.cnPic img{width:100%;height:100%;object-fit:cover}.cnPic em{position:absolute;left:50%;bottom:-2px;transform:translateX(-50%);font-style:normal;font-family:var(--display);font-size:15px;color:#fff;text-shadow:var(--tol)}
.cnN.lock .cnPic img{filter:grayscale(1) brightness(.45)}.cnLk{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}.cnLk svg{width:28px;height:28px}
.cnN.sel .cnPic{box-shadow:0 0 0 3px #fff,0 0 0 6px var(--ac),0 0 22px var(--ac),0 5px 0 6px #191714;animation:cnPulse 1.1s ease-in-out infinite alternate}
.cnN.cur .cnPic::after{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:inset 0 0 14px var(--ac)}
.cnNm{display:flex;flex-direction:column;gap:2px;font-family:var(--display);font-size:14px;line-height:1.05;text-shadow:var(--tol);max-width:120px;text-align:left}.cnN.r .cnNm{text-align:right;align-items:flex-end}
.cnSt{display:inline-flex}.cnSt b{width:15px;height:20px;display:block}.cnSt svg{width:100%;height:100%;display:block}.cnSt small{font-family:var(--body);font-size:11px;color:#b8a990}
.cnCkB{display:inline-block;width:12px;height:16px;vertical-align:-3px}.cnCkB svg{width:100%;height:100%}
.cnSel{flex:0 0 auto;display:flex;flex-direction:column;gap:6px;padding:9px 10px;border:3px solid #191714;border-radius:16px;background:linear-gradient(#3b332b,#211b17);box-shadow:0 4px 0 #191714,inset 0 0 0 2px color-mix(in srgb,var(--ac) 35%,transparent)}
.cnSh{display:flex;gap:10px;align-items:center}.cnSh img{width:74px;height:44px;object-fit:cover;border-radius:9px;border:2px solid #191714}.cnSh .ck{font-size:12px;color:var(--ac);font-weight:800;letter-spacing:.05em;text-transform:uppercase}
.cnSh h3{margin:0;font-family:var(--display);font-weight:400;font-size:19px;line-height:1.05;text-shadow:var(--tol)}.cnSh small{color:#dbd0b0;font-size:12.5px}.cnGoldT{color:var(--gold);font-weight:800}
.cnRec2{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.cnRec2 li{display:flex;flex-direction:column;align-items:center;padding:4px 2px;border-radius:10px;background:rgba(0,0,0,.28)}
.cnRec2 b{font-family:var(--display);font-weight:400;font-size:18px;text-shadow:var(--tol);font-variant-numeric:tabular-nums}.cnRec2 small{font-size:11px;color:#b8a990}
.cnPlay{font-size:19px;padding:8px 14px}
.cnLockP{margin:0;display:flex;align-items:center;justify-content:center;gap:6px;color:#dbd0b0;font-size:13.5px;text-align:center}.cnLockP svg{width:20px;height:20px;flex:0 0 auto}
.cnModes{flex:0 0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.cnMode{position:relative;min-width:0;display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 3px 7px;border:3px solid #191714;border-radius:14px;
  background:linear-gradient(color-mix(in srgb,var(--mc) 30%,#3b332b),#211b17);box-shadow:0 4px 0 #191714;color:#fff;cursor:pointer;font-family:var(--body)}
.cnMode svg{width:28px;height:28px}.cnMode b{font-family:var(--display);font-weight:400;font-size:13.5px;text-shadow:var(--tol);line-height:1.05;text-align:center}.cnMode small{font-size:10.5px;color:#dbd0b0;line-height:1.1;text-align:center}
.cnBadge{position:absolute;top:-8px;right:-6px;min-width:20px;height:20px;border-radius:10px;background:#e5484d;border:2px solid #191714;color:#fff;font-style:normal;font-family:var(--display);font-size:12px;line-height:16px;text-align:center}
.cnAll{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;color:#8f846e}.cnAll input{width:16px;height:16px;accent-color:#ffc93c}
.cnSub{flex:1 1 auto;overflow-y:auto;display:flex;flex-direction:column;gap:9px;align-items:stretch;padding-bottom:6px}
.cnBig{align-self:center;width:84px;height:84px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,color-mix(in srgb,var(--mc) 50%,#120e0b),#120e0b 70%);border:3px solid #191714;box-shadow:0 0 26px color-mix(in srgb,var(--mc) 55%,transparent)}
.cnBig svg{width:58px;height:58px}.cnLead{margin:0;text-align:center;color:#e6dcc0;font-size:14px;line-height:1.3}
.cnSub h4{margin:4px 0 0;font-family:var(--display);font-weight:400;font-size:16px;color:var(--gold);text-shadow:var(--tol)}
.cnMods{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:5px}.cnMods li{display:flex;flex-direction:column;padding:6px 10px;border:2px solid #191714;border-radius:11px;background:#2e2620}
.cnMods li b{font-family:var(--display);font-weight:400;font-size:15px}.cnMods li span{font-size:12.5px;color:#dbd0b0}.cnMods li.g b{color:#9df07a}.cnMods li.b b{color:#ff8a7a}
.cnRec{margin:0;text-align:center;font-size:13.5px;color:#dbd0b0}.cnRec b{color:#fff}
.cnBoard{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px}.cnBoard li{display:flex;align-items:center;gap:8px;padding:4px 10px;border-radius:9px;background:rgba(0,0,0,.28);font-size:14px}
.cnBoard li i{font-style:normal;font-family:var(--display);width:22px;color:#b8a990}.cnBoard li span{flex:1}.cnBoard li b{font-family:var(--display);font-weight:400;color:var(--gold)}.cnBoard li.me{background:rgba(255,201,60,.18);box-shadow:inset 0 0 0 2px rgba(255,201,60,.5)}
.cnRush{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:5px}.cnRush li{display:grid;grid-template-columns:auto 1fr;column-gap:6px;align-items:center;padding:5px 8px;border:2px solid #191714;border-radius:10px;background:#211b17;opacity:.6}
.cnRush li i{grid-row:span 2;font-style:normal;font-family:var(--display);font-size:16px;color:#5b4f42}.cnRush li span{font-family:var(--display);font-size:13.5px;line-height:1.05}.cnRush li small{font-size:10.5px;color:#b8a990;line-height:1.1}
.cnRush li.ok{opacity:1;background:linear-gradient(90deg,color-mix(in srgb,var(--ac) 28%,#2e2620),#211b17)}.cnRush li.ok i{color:var(--ac)}
.cnRelG{display:grid;grid-template-columns:1fr 1fr;gap:8px}.cnRelB{max-width:none;cursor:default;padding:10px 8px;animation:none}.cnRelB small{font-size:11px;color:var(--gold)}
.cnRelB.no{--rc:#5b4f42;opacity:.75}.cnRelB.no .cnRelI{font-family:var(--display);font-size:30px;color:#8f846e}
.cnGo{margin-top:4px}
.cnWants{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,190px));justify-content:center;gap:12px;padding:4px 2px}
.cnWant{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 8px 11px;border:3px solid #191714;border-radius:6px;background:linear-gradient(#f1dfb4,#d6ba84);color:#2a1d12;box-shadow:0 5px 0 #191714;transform:rotate(-1.2deg)}
.cnWant:nth-child(2n){transform:rotate(1.5deg)}
.cnWT{font-family:var(--display);font-size:19px;letter-spacing:.14em;color:#7a2a24;text-transform:uppercase;line-height:1}
.cnWant canvas{width:100px;height:100px;border:3px solid #2a1d12;border-radius:4px;background:#2b2420}
.cnWant b{font-family:var(--display);font-weight:400;font-size:18px;line-height:1}.cnWant>small{font-size:12px;font-weight:800;color:#5a4636;text-align:center}
.cnLv{font-style:normal;color:#c08a10;letter-spacing:2px;font-size:13px}.cnLv s{text-decoration:none;color:rgba(42,29,18,.25)}
.cnAf{display:flex;flex-wrap:wrap;gap:3px;justify-content:center}.cnAf em{font-style:normal;font-size:10.5px;font-weight:800;padding:1px 6px;border-radius:8px;background:#2a1d12;color:var(--c)}
.cnTaglia{font-size:12.5px;text-align:center}.cnTaglia b{color:#7a2a24}.cnWins{font-size:11px;color:#7a5a3a}
.cnWant.spavalda::after{content:"";position:absolute;right:-7px;top:26px;width:52px;height:52px;pointer-events:none;opacity:.88;
  background:radial-gradient(circle at 42% 40%,#6e0f0f 0 28%,transparent 29%),radial-gradient(circle at 78% 72%,#7a1414 0 13%,transparent 14%),radial-gradient(circle at 18% 82%,#5a0b0b 0 9%,transparent 10%),radial-gradient(circle at 70% 20%,#6e0f0f 0 7%,transparent 8%)}
.cnWant.buffa::after{content:"Nyeh!";position:absolute;left:-8px;top:30px;transform:rotate(-14deg);font-family:var(--display);font-size:13px;color:#fff;background:#e5484d;border:2px solid #191714;border-radius:8px;padding:0 6px}
.cnEmpty{margin:18px 0;text-align:center;font-family:var(--display);font-size:17px;color:#8f846e}
.cnList{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}.cnList li{display:flex;justify-content:space-between;gap:8px;padding:5px 10px;border-radius:9px;background:rgba(0,0,0,.28);font-size:13.5px}
.cnList li b{color:var(--gold);font-weight:800;white-space:nowrap}.cnList li.out span{text-decoration:line-through;color:#b8a990}
.cnDeath{margin-top:8px;display:flex;align-items:center;gap:10px;padding:8px 10px;border:3px solid #191714;border-radius:8px;background:linear-gradient(#f1dfb4,#d6ba84);color:#2a1d12;text-align:left;box-shadow:0 4px 0 #191714;position:relative}
.cnDeath canvas{width:64px;height:64px;flex:0 0 auto;border:3px solid #2a1d12;border-radius:4px}.cnDeath b{display:block;font-family:var(--display);font-weight:400;font-size:17px;line-height:1.05}
.cnDeath p{margin:2px 0;font-size:12.5px}.cnDeath p b{display:inline;font-size:13px;color:#7a2a24}.cnDeath em{font-size:12.5px;color:#5a4636}.cnDeath .cnWT{font-size:13px}
.cnDeath.spavalda::after{content:"";position:absolute;right:6px;top:4px;width:34px;height:34px;opacity:.85;background:radial-gradient(circle at 40% 40%,#6e0f0f 0 30%,transparent 31%),radial-gradient(circle at 75% 75%,#7a1414 0 14%,transparent 15%)}
.cnEndW{display:flex;justify-content:center;gap:22px}.cnEndW span{display:flex;flex-direction:column;align-items:center}.cnEndW b{font-family:var(--display);font-weight:400;font-size:28px;text-shadow:var(--tol);font-variant-numeric:tabular-nums}.cnEndW small{font-size:12px;color:#dbd0b0}
.cnLitL{margin-top:4px;display:flex;align-items:center;justify-content:center;gap:6px;font-family:var(--display);font-size:15px;color:var(--gold);text-shadow:var(--tol);text-align:center}
.cnLitL svg{width:20px;height:26px}.cnLitL .fl{fill:#ff8a3c}.cnBossL{color:#ff9a8a}.cnTr svg{width:16px;height:21px;vertical-align:-4px}
.sk.cnr{border-color:var(--rc);box-shadow:0 5px 0 var(--ink),0 0 0 2px var(--rc),0 0 16px color-mix(in srgb,var(--rc) 50%,transparent)}
.sk.cnr em.rar{color:#fff;background:var(--rd);border-radius:8px;padding:1px 8px;text-shadow:0 1px 0 #191714}
.sk.cnr span b{color:var(--rd);font-family:inherit;font-size:inherit;font-weight:800}
.sk.cnr3{background:linear-gradient(170deg,#fff3c4,#f0c868)}
.sk.cnLeg::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.55) 50%,transparent 65%);transform:translateX(-100%);animation:shine 1.8s ease-in-out infinite}
.sk.cnHid,.sk.cnSpin{pointer-events:auto}
.sk .evoh.cnSoft{color:#8a6a4a;font-weight:700}
.sk.cnHid::before,.sk.cnSpin::before{content:"?";position:absolute;inset:-3px;z-index:4;border-radius:14px;border:3px solid #191714;display:flex;align-items:center;justify-content:center;font-family:var(--display);font-size:46px;color:rgba(255,240,210,.85);text-shadow:var(--tol);
  background:repeating-linear-gradient(45deg,#4d4237 0 9px,#3b332b 9px 18px)}
.sk.cnSpin::before{background:radial-gradient(circle,color-mix(in srgb,var(--sc) 70%,#fff),var(--sc) 60%,#191714);color:#fff;box-shadow:0 0 22px var(--sc)}
.sk.cnLand{animation:cnLand .38s cubic-bezier(.2,1.6,.4,1)}
.sk.cnEvoC.cnHid::before{background:radial-gradient(circle,#ffe27a,#b86a00 70%,#3a2a10);content:"★";color:#fff}
#menu:not(.zmode) #tabPlay .sideBtns.l>.qbtn:not(.cnSide){display:none!important}
#menu:not(.zmode) #roadSide,#menu:not(.zmode) #offerBtn{display:none!important}
#menu.zmode .cnSide,#menu.zmode #cnPremi{display:none!important}
#cnPremi{position:absolute;left:74px;top:106px;z-index:8;width:min(236px,calc(100% - 92px));display:flex;flex-direction:column;gap:6px;padding:9px;border:3px solid #191714;border-radius:16px;
  background:linear-gradient(#3b332b,#211b17);box-shadow:0 6px 0 #191714,0 10px 30px rgba(0,0,0,.5);animation:cnIn .28s cubic-bezier(.2,1.4,.4,1) both}
#cnPremi[hidden]{display:none}
.cnPrT{font-family:var(--display);font-weight:400;font-size:17px;color:var(--gold);text-shadow:var(--tol);text-align:center}
.cnPrR{display:flex;align-items:center;gap:9px;padding:6px 8px;border:2px solid #191714;border-radius:12px;background:#2e2620;color:#fff;cursor:pointer;font-family:var(--body);text-align:left}
.cnPrR.hot{background:linear-gradient(90deg,rgba(255,201,60,.32),#2e2620);box-shadow:inset 0 0 0 2px rgba(255,201,60,.6)}
.cnPrI{width:38px;height:38px;flex:0 0 auto;display:flex;align-items:center;justify-content:center}.cnPrI svg{width:34px;height:34px}
.cnPrX{display:flex;flex-direction:column;min-width:0}.cnPrX b{font-family:var(--display);font-weight:400;font-size:15.5px;text-shadow:var(--tol)}.cnPrX small{font-size:11.5px;color:#dbd0b0}.cnPrR.hot small{color:var(--gold);font-weight:800}
@keyframes cnIn{from{opacity:0;transform:translateY(18px) scale(.92)}to{opacity:1;transform:none}}
@keyframes cnPulse{to{filter:brightness(1.25)}}@keyframes cnFlick{to{transform:scaleY(1.12) scaleX(.94)}}
@keyframes cnFuBurst{from{transform:scale(1)}to{transform:scale(1.1)}}
@keyframes cnFuPop{0%{transform:skewX(-8deg) scale(2.3);opacity:.15}60%{transform:skewX(-8deg) scale(.9);opacity:1}100%{transform:skewX(-8deg) scale(1)}}
@keyframes cnFuFire{from{text-shadow:0 4px 0 #191714,-2px -2px 0 #191714,2px -2px 0 #191714,-2px 2px 0 #191714,2px 2px 0 #191714,0 0 12px #ff8a3c,0 -6px 18px #ff5a1a}
  to{text-shadow:0 4px 0 #191714,-2px -2px 0 #191714,2px -2px 0 #191714,-2px 2px 0 #191714,2px 2px 0 #191714,0 0 22px #e48aff,0 -10px 26px #ffc93c}}
@keyframes cnRedA{0%{opacity:0}18%{opacity:1}100%{opacity:0}}@keyframes cnSlashA{0%{opacity:0;transform:scale(1.25)}12%{opacity:1;transform:scale(1)}70%{opacity:.85}100%{opacity:0}}
@keyframes cnLand{0%{transform:scale(.86)}60%{transform:scale(1.06)}100%{transform:none}}
#cnTow{position:absolute;left:50%;top:calc(104px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:6;pointer-events:none;display:flex;align-items:center;gap:7px;
  background:rgba(20,14,10,.7);border:2px solid #191714;border-radius:14px;padding:3px 9px 3px 11px;font-family:var(--display);color:#fff;text-shadow:var(--tol);white-space:nowrap}
#cnTow[hidden]{display:none}#cnTow b{font-size:15px;font-weight:400}#cnTow b small{font-size:11px;opacity:.75;margin-left:1px}
#cnTow ol{display:flex;gap:3px;margin:0;padding:0;list-style:none;align-items:center}
#cnTow li{width:19px;height:19px;border-radius:50%;background:#2a2219;border:2px solid #191714;display:grid;place-items:center;opacity:.85}
#cnTow li svg{width:12px;height:12px;display:block}#cnTow li.now{width:25px;height:25px;border-color:#ffd84a;opacity:1;box-shadow:0 0 8px rgba(255,216,74,.55)}
#cnTow li.now svg{width:15px;height:15px}#cnTow li.k-e{background:#5a4010}#cnTow li.k-m{background:#5e1c1c}#cnTow li.k-p{background:#17483d}#cnTow li.k-b{background:#33203f}#cnTow li.far{margin-left:6px;opacity:.6}
#cnFlTxt{display:none}#roomChip.cnw #roomTxt{display:none}#roomChip.cnw #cnFlTxt{display:inline;font-variant-numeric:tabular-nums}
#cnHud span{display:inline-flex;gap:5px;align-items:baseline}#cnHud span.ko,#cnHud span.ko b{color:#ff8a7a}
.cnMoT{display:inline-flex;align-items:center;gap:3px;margin-left:6px;padding:0 6px 0 3px;border-radius:8px;background:rgba(0,0,0,.38);color:var(--mc);font-style:normal;font-size:11px;letter-spacing:.02em;vertical-align:middle;text-transform:none}
.cnMoT svg{width:14px;height:14px}
.cnMoL{display:flex;align-items:center;gap:4px;font-size:12px;color:#e8dcc4;margin:2px 0 1px}.cnMoL svg{width:16px;height:16px;flex:none}.cnMoL b{color:var(--mc);font-weight:400}
.cnMoN{display:inline-grid;place-items:center;width:18px;height:18px;margin-right:4px;vertical-align:-4px;border-radius:50%;background:#241c15;border:1.5px solid var(--mc)}.cnMoN svg{width:13px;height:13px}
.rtrack.cn20 .rn{width:7px;height:7px;border-width:1.5px}.rtrack.cn20 .rn.boss svg{width:18px;height:18px}.rtrack.cn20 .rl{margin:0}
.rtrack .rn.prem{border-color:#5fd0b0;background:#1e4a40}.rtrack .rn.prem.on{background:#7fd8c0}
.rtrack .rn.k-corso{border-color:#ffab6a}.rtrack .rn.k-fuga{border-color:#ff7a5a;border-radius:50%;transform:none}
#cnModeRow{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:2px 10px 8px;position:relative;z-index:2}
#menu.zmode #cnModeRow{display:none}#menu:not(.zmode) #chapCard{display:none}
#cnModeRow .cnMode{padding:5px 2px 4px;min-height:0}#cnModeRow .cnMode svg{width:24px;height:24px}#cnModeRow .cnMode b{font-size:12.5px}#cnModeRow .cnMode small{font-size:9.5px}
.cnBridge,.cnIncL{display:flex;align-items:center;gap:8px;margin:8px auto 0;max-width:340px;padding:7px 10px;border-radius:12px;background:rgba(0,0,0,.38);border:2px solid #5a4e3c;font-size:13px;line-height:1.25;color:#f2e6cc;text-align:left}
.cnBridge svg,.cnIncL svg{width:22px;height:22px;flex:0 0 auto}.cnBridge span,.cnIncL span{flex:1;min-width:0}.cnBridge i{display:block;width:64px;height:8px;border-radius:5px;background:#2a231c;overflow:hidden;flex:0 0 auto}
.cnBridge i em{display:block;height:100%;background:linear-gradient(90deg,#8f8a7e,#d8ccb0)}.cnBridge small{font-size:11px;color:#c9b99a;flex:0 0 auto}
.cnBridge.done{border-color:#ffd84a;box-shadow:0 0 14px rgba(255,216,74,.35)}.cnBridge.done i em{background:linear-gradient(90deg,#ffd84a,#fff3b0)}.cnIncL{border-color:#c0392b;color:#ffd6d6}
.cnN.lock .cnPic img,.cnSel.lock .cnSh img{filter:brightness(.1) saturate(0)}
#menu:not(.zmode) #homeStage{touch-action:none}   /* the islands go up and down under the finger (in the Zombie the page scrolls as before) */
#playBtn.cnInc{background:linear-gradient(180deg,#e5484d,#8a1020)!important;box-shadow:0 0 22px rgba(255,60,60,.55),inset 0 -4px 0 rgba(0,0,0,.25)!important;color:#fff}
@media (prefers-reduced-motion:reduce){.cnRelC,.cnN.sel .cnPic,.cnBr.on .fl,#cnFu.pop b,#cnFu.sss b,#cnFu.burst small,.sk.cnLand,.sk.cnLeg::after,#cnPremi{animation:none}}`;

cnEnsure();cnPremiInit();
