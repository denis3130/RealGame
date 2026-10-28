// ===================================================================== CLASSICA NUOVA (anteprima dal 20 ottobre, nel gioco dal 27 ottobre)
// Denis: «ok creami le cose che mi hai elencato su una cosa a parte senza intaccare il progetto principale», poi, dopo l'anteprima (ramo
// classica-nuova, pagina python3 anteprime/mk_classica.py): «Tutto nel gioco». In src/ordine.txt dopo 101, prima di 95 e 96. CN.on lo spegne.
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
  if(S.brv<2){S.brv=2;for(const k in S.br)if(S.br[k]>=CN_BRN0[Math.min(2,Math.floor((+k+1)/4))])S.br[k]=Math.max(S.br[k],cnBrNeed(+k))}   // a bridge finished with the old lengths stays finished
  // the saves of the game before the islands: the arenas the trophies had opened stay open (their bridges built, their braziers lit) and
  // the hero stands on the last one; «apri tutte le arene» is only in the preview (anteprime/mk_classica.py sets MB_ANTEPRIMA)
  if(!S.mig){S.mig=1;const top=arenaIdx(Math.max(SAVE.trBest||0,SAVE.trophies||0));for(let k=0;k<top;k++){S.br[k]=Math.max(S.br[k]||0,cnBrNeed(k));S.stars[k]=(S.stars[k]|0)|1}if(top&&S.pick==null)S.pick=top}
  if(S.all&&!window.MB_ANTEPRIMA)S.all=0;
  return S}
const cnErr=err=>{if(CN.err++<6)console.error('classica nuova:',err)};
const cnBoss=i=>ARENAS[i].bt||BOSSZ[ARENAS[i].boss]||'golem';
const cnWon=i=>!!((cnS().stars[i]||0)&1);   // stars[i]: il primo bit è la vittoria (le stelle di prima non ci sono più)
// the bridge from island i to the next, first of stones, now of planks (Denis: «aggiungi ponte di pietra», then «saranno con le assi di legno
// che servono per costruire il ponte»): the next island opens only when it is finished; every run brings planks (cnPlanks), a victory 40;
// every bridge 10 planks longer than the one before (Denis: «dai meno mattoncini e aumenta di 10 ad isola»): 100 to the second island … 200 to
// the twelfth (the stones of a save are its planks)
const CN_BRN0=[100,130,160];   // the lengths of the first stone bridges (by the round of four islands), for the saves
const cnBrNeed=i=>100+10*i;
const cnBrHave=i=>Math.min(cnBrNeed(i),cnS().br[i]||0);
const cnBrDone=i=>cnBrHave(i)>=cnBrNeed(i);
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
  if(!h){h=document.createElement('em');h.className='evoh';const sp=div.querySelector('span');div.insertBefore(h,sp?sp.nextSibling:null)}h.textContent=txt;h.classList.toggle('cnSoft',!done)}
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
      ${op?`<button class="btn cnPlay">Gioca</button>`:`<p class="cnLockP">${CN_LOCK} Finisci il ponte da «${ARENAS[a-1].n}»: ${cnBrHave(a-1)}/${cnBrNeed(a-1)} assi</p>`}</div>
    <div class="cnModes"><button class="cnMode" data-sub="tower" style="--mc:#c48ae8">${cnIco('totem')}<b>Torre</b><small>${T.wk===cnWeek()&&T.best?'Piano '+T.best:'Della settimana'}</small></button>
      <button class="cnMode" data-sub="rush" style="--mc:#e5484d">${cnIco('crown')}<b>Corsa dei boss</b><small>${RL?RL+' custodi':'Chiusa'}</small></button>
      <button class="cnMode" data-sub="rel" style="--mc:#ffc93c">${cnRelIco('stella')}<b>Reliquie</b><small>${found} di ${CN_REL.length}</small></button>
      <button class="cnMode" data-sub="nem" style="--mc:#c0392b">${cnIco('poster')}<b>Ricercati</b><small>${S.nem.length?S.nem.length+' ti cercano':'Nessuno'}</small>${S.nem.length?`<i class="cnBadge">${S.nem.length}</i>`:''}</button></div>
    ${window.MB_ANTEPRIMA?`<label class="cnAll"><input type="checkbox" ${S.all?'checked':''}> Solo nell'anteprima: apri tutte le arene</label>`:''}`;
  if(top!=null)el.querySelector('.cnPath').scrollTop=top;
  el.querySelector('.cnX').onclick=()=>{sfx('ui');cnMapClose()};
  el.querySelectorAll('.cnN').forEach(n=>n.onclick=()=>{CN.sel=+n.dataset.a;sfx('ui');cnMapRender()});
  const pl=el.querySelector('.cnPlay');if(pl)pl.onclick=()=>{S.pick=a;save();$('cnMap').hidden=true;renderChap();goPlay('arena')};
  el.querySelectorAll('.cnMode').forEach(m=>m.onclick=()=>{CN.sub=m.dataset.sub;sfx('ui');cnMapRender();el.scrollTop=0});
  const ca=el.querySelector('.cnAll input');if(ca)ca.onchange=e=>{S.all=e.target.checked;save();cnMapRender()}}
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
// island i stands CNI_GAP units north of island i-1 and the ones further north are drawn smaller (CNI_PD), as things far away; since the
// hanging bridge (26 ottobre, «allontana le isole di tanto l'una dall'altra») 1000 instead of 380. CNI_LOW: how far under the island's middle
// its line goes (the island stays at the bottom, the bridge goes up the screen), CNI_UPN: how much of the bridge is seen above it (since the
// big bridge, 27 ottobre, «isola ecc più grandi»: 420 instead of 720, the camera closer and the islands bigger; then «il ponte e l'isola li
// voglio ancora più grandi»: 260; the rest of the bridge comes with the finger), CNI_WIDE: how much of the screen's width an island takes at
// most (the whole of it since «ancora più grandi», before 86%)
const CNI_GAP=1000,CNI_PD=1500,CNI_LOW=96,CNI_UPN=260,CNI_WIDE=1;
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
  // back from a run that brought planks: they go to the bridge by themselves and slip into their places (the show, cnBrShow*); after it the
  // hero is where he belongs (the counters and the posts wait for its prizes)
  if(B&&anim&&ARENAS[B.i+1]){CN.brAnim=null;try{cnBrShowStart(B)}catch(err){cnErr(err)}try{renderGold();renderGearRow()}catch(err){}if(ISL.brA)return}
  if(ISL.brA)return;
  ISL.rest=null;
  if(ISL.cur==null||!anim||!cnOpen(p)){ISL.cur=p;ISL.view=p;ISL.jump=null;ISL.go=null;return}
  if(p!==ISL.cur){const a=ISL.cur;ISL.view=a;setTimeout(()=>{if(ISL.cur===a&&!ISL.drag&&!ISL.brA){cnIslMove(a,p);sfx('ui');tone(330,660,.18,'triangle',.03)}},700)}}
// the hero goes to island b: over the bridge to the next island or the one before (running: the bridges are long now), with a jump further
function cnIslMove(a,b){ISL.cur=b;ISL.go=b;ISL.rest=null;const w=Math.abs(b-a)===1?cnIslWay(a,b):null;ISL.jump=w?{a,b,t:0,way:w,dur:clamp(w.len/430,1.2,2.6)}:{a,b,t:0,dur:.75}}
// ------------------------------------------------ the place of everything on the canvas (canvas pixels)
// the name on top, the line under the island at the bottom; between them, from the bottom up: the island you are on and its long bridge going
// north (its balconies of the prizes on the left, the next island far away); the island as wide as the screen at most
function cnIslLay(){const W=campCv.width,H=campCv.height,cr=campCv.getBoundingClientRect(),dpr=W/Math.max(1,cr.width),r=el=>el.getBoundingClientRect();
  const top=(r($('topbar')).bottom-cr.top)*dpr,pill=(r($('heroPill')).top-cr.top)*dpr,lab=top+6*dpr,titleB=lab+40*dpr,info=pill-13*dpr,low=info-15*dpr;
  // the names stay between the buttons on the left and on the right (and the zombie hand that hangs on the right, src/js/67-menu-modi.js)
  const sl=document.querySelector('#homeStage .sideBtns.l'),sr=document.querySelector('#homeStage .sideBtns.r'),zh=$('zHand'),zq=zh&&zh.offsetParent?r(zh):null;
  let tl=sl?(r(sl).right-cr.left)*dpr+6*dpr:W*.17,tr=sr?(r(sr).left-cr.left)*dpr-6*dpr:W*.83;if(zq&&(zq.top-cr.top)*dpr<titleB)tr=Math.min(tr,(zq.left-cr.left)*dpr-4*dpr);
  const f1=CNI_PD/(CNI_PD+CNI_GAP),fu=CNI_PD/(CNI_PD+CNI_UPN),up=.55*CNI_UPN*fu+20,dn=CNI_LOW,
    k=Math.max(.2*dpr,Math.min(W*CNI_WIDE/(2*CNI_R*CNI_SY),(low-titleB)/(up+dn))),cy=low-(dn-16)*k;   // (the island a little lower than its room: its rock goes a little behind the words under it, the towers stay under the name)
  return{W,H,dpr,top,pill,k,cx:W/2,cy,info,lab,titleB,tl,tr,hs:CNI_HERO,pairPx:.55*k*CNI_GAP*f1}}
// where a point of the path is on the screen now (n units north of island i's middle): the camera's real perspective, the further north the
// smaller and the closer together, the gentle bob of everything together; an island is drawn whole at the place and the size of its middle
function cnPathAt(i,n,L,t,nob){const d=Math.max(-CNI_PD*.55,(i-ISL.view)*CNI_GAP+n),f=CNI_PD/(CNI_PD+d);return{x:L.cx,y:L.cy-.55*L.k*d*f+(nob?0:Math.sin(t*.9)*2.2*L.dpr*f),f,k:L.k*f}}
function cnIslAt(j,L,t,nob){const A=cnPathAt(j,0,L,t,nob);A.j=j;return A}
const cnIslS=(A,p)=>{const q=cnV().P(p);return[A.x+q[0]*A.k,A.y+q[1]*A.k]};
// how far the edge of island j is from its middle going north (or south) along the path: the same uneven edge as pSlab
function cnIslRim(j,north){const sd=j*1.7+.4,dx=north?CNI_NV[0]:-CNI_NV[0],dy=north?CNI_NV[1]:-CNI_NV[1],a=Math.atan2(dy/CNI_SY,dx),
  r=CNI_R*(1+.07*Math.sin(a*3+sd)+.045*Math.sin(a*7+sd*2.1)+.025*Math.sin(a*13+sd*.7));return r*Math.hypot(Math.cos(a),Math.sin(a)*CNI_SY)}
// ------------------------------------------------ the still pieces of an island, painted once
function cnIslImg(i,L,opv){const won=cnWon(i),op=opv==null?cnOpen(i):!!opv,key=i+'|'+L.k.toFixed(3)+'|'+(won?1:0)+(op?1:0)+(LOWFX?1:0)+'|n';let c=ISL.cache.get(key);if(c){ISL.cache.delete(key);ISL.cache.set(key,c);return c}
  const k=L.k,w=Math.ceil(2*(CNI_R*CNI_SY+26)*k),h=Math.ceil(344*k),ox=w/2,oy=Math.ceil(196*k),cv=document.createElement('canvas');cv.width=w;cv.height=h;
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
  // the gate of the bridge to the next island at the back, the stumps of the bridge from the island before at the front
  if(ARENAS[i+1])parts.push({d:D(cnChain(cnIslRim(i,true)-6,0)),f:()=>cnBrPortal(K,i,op,op&&!LOWFX)});
  if(i>0)parts.push({d:D(cnChain(-cnIslRim(i,false)+6,0)),f:()=>cnBrStumps(K,i)});
  // the brazier of the fire: lit once the arena is won (the flame is alive, drawn on top); cold ash and stones before
  parts.push({d:D(CI_BRAZ),f:()=>{const B=CI_BRAZ;pRound(K,B,[[0,8.5],[3,7.5],[4,5],[12,3.8]],stone,{m:16,lw:1.6});
    for(let j=0;j<3;j++){const t=j/3*TAU+.4;C3.caps(V0,[B[0]+Math.cos(t)*4,B[1]+Math.sin(t)*4,11],1.2,[B[0]+Math.cos(t)*9,B[1]+Math.sin(t)*9,17],1,'#3a3434',{lw:1.2,noRim:1})}
    pRound(K,[B[0],B[1],12],[[0,4.5],[3,8.5],[6,11.5],[7.5,11]],'#45403e',{m:18,lw:1.7,kl:.35,kd:.45,rim:.3});C3.disc3(V0,[B[0],B[1],19.6],[0,0,1],10,{N:20});ctx.fillStyle=won?'#4a1e0a':'#1e1a18';ctx.fill();
    for(let j=0;j<7;j++){const t=j/7*TAU+seed,rr=j%2?3:6;C3.sball(V0,[B[0]+Math.cos(t)*rr,B[1]+Math.sin(t)*rr,20.3],1.8,won?'#c8401a':'#4a4440',{lw:.9,kl:.35,kd:.3,rim:.1})}}});
  // a lantern of stone on each side of the path (lit at night: the light is alive)
  if(ch===1||ch===3)for(const[n,e] of CNI_LAMPS){const c=cnChain(n,e);parts.push({d:D(c),f:()=>cnIslLantern(K,c,stone)})}
  const scatter=(n,s,f)=>{for(let j=0;j<n;j++){const a=prH(j,seed+s)*TAU,r=.22+prH(j,seed+s+1)*.72,sx=Math.cos(a)*r*CNI_R*CNI_SY,sy=Math.sin(a)*r*CNI_R;if(free(sx,sy))f(sx,sy,j)}};
  if(ch===1){R(-124,-10,()=>cnIslPillar(K,IP(-124,-10),stone,34));R(102,-62,()=>cnIslPillar(K,IP(102,-62),stone,22));R(-74,-66,()=>cnIslPillar(K,IP(-74,-66),stone,15));
    // the graves of the crypt round the guardian, an old tree heavy with moss behind the gate
    for(const[sx,sy,a] of[[118,4,.15],[124,-24,-.2],[40,-70,.2],[68,-76,-.1],[-52,-58,.1]])R(sx,sy,()=>cnIslGrave(K,IP(sx,sy),stone,a));
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
    OMd(-80,-70,'totem',9,40,seed+1);OMd(-120,30,'stump',9,12,seed+2);OMd(124,-14,'stump',8,10,seed+3);
    scatter(12,2,(sx,sy,j)=>F(sx,sy,()=>cnIslMoss(K,IP(sx,sy),4+prH(j,seed+4)*5,'#5a7a32',seed+j)));
    scatter(26,9,(sx,sy,j)=>R(sx,sy,()=>{cnIslTuft(K,IP(sx,sy),j%2?'#7aa04a':'#5f8a3a',3,seed+j);if(j%4===0)cnIslFlower(K,IP(sx+3,sy+1),Wd.deco[j%Wd.deco.length])}))}
  else{for(const[sx,sy,r,hh,c] of[[64,-70,10,44,'#9fdcff'],[80,-58,7,28,'#c6ecff'],[48,-60,5,18,'#8ccff8'],[118,-40,7,26,'#b4e4ff'],[40,-80,4,14,'#d8f2ff']])if(Math.hypot(sx-84,sy+28)>30)R(sx,sy,()=>pCone(K,IP(sx,sy),r,hh,c,{m:6,lw:1.4}));
    for(const[sx,sy,r] of[[-70,66,14],[-120,-6,11],[110,50,9],[-40,-70,9]])if(cnIslFree(sx,sy))R(sx,sy,()=>pRound(K,IP(sx,sy),[[0,r],[r*.4,r*.82],[r*.7,r*.42],[r*.82,.1]],'#f6fbff',{m:16,lw:1.4}));
    OMd(-118,-34,'snowpine',11,44,seed+1);OMd(-84,-72,'snowpine',9,34,seed+2);OMd(124,30,'snowpine',9,36,seed+3);OMd(98,8,'snowman',10,0,seed+4);OMd(-128,36,'snowrock',9,9,seed+5);
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
// nothing standing on the path and the bridges' gate and stumps, on the hero's place (his companions beside him), by the lanterns, on the gate
// and its path, the brazier, the guardian
function cnIslFree(sx,sy){const[n,e]=cnIslNE(IP(sx,sy)),[hn,he]=cnIslNE(CI_HERO),[gn,ge]=cnIslNE(IP(-88,-24));
  if(Math.abs(e)<(n>76?58:n<-80?52:Math.abs(n)>66?30:17))return false;
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
function cnIsles(dt){campResize();CAMP.t+=dt;const t=CAMP.t;if(G)G.t=t;const L=ISL.lay=cnIslLay(),saved=ctx;ctx=campX;ISL.prz=[];
  if(ISL.cur==null)cnIslSync(false);
  try{cnIslStep(dt,L);ctx.setTransform(1,0,0,1,0,0);
    const v=ISL.view,i0=Math.max(0,Math.floor(v)),i1=Math.min(ARENAS.length-1,i0+1),f=v-i0,A=cnIslW(i0),B=cnIslW(i1);
    // the abyss: the sky of the world you look at, its light from below, far rocks and stars that go down as you go north, fog
    const sky=ctx.createLinearGradient(0,0,0,L.H);sky.addColorStop(0,cnMixC(A.sky[0],B.sky[0],f));sky.addColorStop(1,cnMixC(A.sky[1],B.sky[1],f));ctx.fillStyle=sky;ctx.fillRect(0,0,L.W,L.H);
    const sh=L.H*.62;for(let j=0;j<70;j++){const x=(j*97.3)%L.W,y=L.top+((j*53.7+v*L.pairPx*.1)%sh+sh)%sh,tw=.35+.65*Math.abs(Math.sin(t*1.1+j*1.7));ctx.fillStyle=`rgba(255,250,230,${(tw*.55).toFixed(2)})`;ctx.fillRect(x,y,1.5*L.dpr,1.5*L.dpr)}
    if(!LOWFX){const gl=i=>cnIslW(i).light;pLight(L.cx,L.cy+CNI_R*.55*L.k*2.6,L.W*.8,f<.5?gl(i0):gl(i1),.3,L.W*.36)}
    cnIslFar(L,t,v);
    cnFlockStep(dt,L);
    const ice=(ARENAS[i0].ch===4?1-f:0)+(ARENAS[i1].ch===4?f:0);
    if(!LOWFX)cnIslClouds(L,t,v);
    cnSnow(L,t,ice,v,false);
    // the islands from the furthest to the nearest; each bridge after the island it leads to (it lies on its ground) and before the one it
    // leaves from (its foot goes under that island's edge)
    const vr=Math.round(v);
    // (the island behind you goes away as you leave it: only its bridge still comes up to yours)
    for(let i=Math.min(ARENAS.length-1,vr+2);i>=Math.max(0,vr-1);i--){const Ai=cnIslAt(i,L,t),al=clamp(1-(v-i-.55)/.4,0,1);if(al>0&&Ai.y-160*Ai.k<L.H&&Ai.y+150*Ai.k>0){ctx.save();ctx.globalAlpha=al;cnIslDraw(i,Ai,L,t);ctx.restore()}cnFlockDraw(i,L,t);if(i>0)cnIslBridge(i-1,L,t)}
    cnIslHaze(L,A,B,f);
    cnIslFadeLow(L,A,B,f);
    if(cnIncView())cnIncSky(L,t,1-Math.min(1,Math.abs(v-Math.round(v))*2.2));   // fades while scrolling to an island without it
    ISL.pv=ISL.view;
    {const gp=Math.floor((t+3)/11);if(ISL.gp!==gp){if(ISL.gp!=null&&!LOWFX&&prH(gp,5)<.66)cnBrSnd('vento');ISL.gp=gp}}
    cnIslHero(L,t);cnPlayLbl();
    if(!LOWFX)pFog(L.W,L.cy+CNI_R*.4*L.k,L.info,t,f<.5?A.fog:B.fog,.1,4,13);
    cnSnow(L,t,ice,v,true);
    cnIslText(L,t);
    cnIslVig(L)}
  finally{ctx.setTransform(1,0,0,1,0,0);ctx=saved}}
// far away the abyss swallows things: the top of the picture goes into the sky's colour (the far end of the bridge, the next island)
function cnIslHaze(L,A,B,f){const c=cnRgb(cnMixC(A.sky[0],B.sky[0],f)),y0=Math.max(0,L.top),y1=L.cy-210*L.k;if(y1<=y0+4)return;const g=ctx.createLinearGradient(0,y0,0,y1);
  g.addColorStop(0,`rgba(${c},.5)`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.fillRect(0,y0,L.W,y1-y0)}
// under the line below your island the picture goes back into the sky: the island behind you and the feet of its bridge do not show
// through the empty boxes of the chests
function cnIslFadeLow(L,A,B,f){const y0=L.info+4*L.dpr,y1=Math.min(L.H,L.pill+30*L.dpr);if(y0>=L.H)return;const c0=cnMixC(A.sky[0],B.sky[0],f),c1=cnMixC(A.sky[1],B.sky[1],f),sk=y=>cnMixC(c0,c1,clamp(y/L.H,0,1));
  const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,`rgba(${cnRgb(sk(y0))},0)`);g.addColorStop(1,`rgba(${cnRgb(sk(y1))},1)`);ctx.fillStyle=g;ctx.fillRect(0,y0,L.W,y1-y0);
  if(y1<L.H){const g2=ctx.createLinearGradient(0,y1,0,L.H);g2.addColorStop(0,sk(y1));g2.addColorStop(1,sk(L.H));ctx.fillStyle=g2;ctx.fillRect(0,y1,L.W,L.H-y1)}}
// the camera follows the finger, then settles on an island; while the hero walks over a bridge it goes with him
function cnIslStep(dt,L){if(ISL.brA){try{cnBrShowStep(dt,L)}catch(err){cnErr(err);cnBrShowEnd()}return}
  const J=ISL.jump;if(J){J.t+=dt;if(J.t>=J.dur){ISL.jump=null;cnIslLand(J.b)}}
  try{cnSwayStep(dt)}catch(err){cnErr(err);ISL.sw=null}
  if(J&&J.way&&J.ft!=null)J.fs=(J.fs==null?J.ft:J.fs)+cnAd(J.ft-(J.fs==null?J.ft:J.fs))*Math.min(1,dt*9);
  // over a bridge the camera follows him exactly: he stays where he always stands on the screen while the islands go by
  if(ISL.drag)return;if(J&&J.way){const p=cnWayAt(J.way,cnWayDD(J));ISL.view=J.way.lo+clamp((p[0]-cnIslNE(CI_HERO)[0])/CNI_GAP,0,1);return}
  // the camera settles on an island, or on a balcony of a bridge where the finger left it (ISL.rest)
  const target=ISL.go!=null?ISL.go:ISL.rest!=null?ISL.rest:Math.round(ISL.view);ISL.view+=(target-ISL.view)*Math.min(1,dt*(ISL.jump?5:9));if(Math.abs(target-ISL.view)<.002){ISL.view=target;if(ISL.go===target&&!ISL.jump)ISL.go=null}}
function cnIslLand(i){tone(150,80,.14,'triangle',.05);ISL.dust={i,t:0};vib([12])}
// far rocks floating in the abyss, slower than the islands (they give the depth)
function cnIslFar(L,t,v){ctx.save();for(let j=0;j<7;j++){const s=.25+prH(j,3)*.35,x=((prH(j,1)*L.W*2.2+t*3*s)%(L.W*1.6)+L.W*1.6)%(L.W*1.6)-L.W*.3,hh=L.H*.5,y=L.top+(((prH(j,2)*hh+v*L.pairPx*s*.35)%hh)+hh)%hh,r=(18+prH(j,4)*30)*L.dpr*s;
    ctx.fillStyle=`rgba(4,6,10,${(.35+s*.5).toFixed(2)})`;ctx.beginPath();ctx.ellipse(x,y,r,r*.32,0,Math.PI,0);ctx.lineTo(x+r*.5,y+r*.5);ctx.lineTo(x,y+r*.95);ctx.lineTo(x-r*.45,y+r*.45);ctx.closePath();ctx.fill()}ctx.restore()}
// ------------------------------------------------ the life round the islands (Denis, 27 ottobre: «manca qualcosa a parer mio», then «Vita
// intorno»): each world alive on its island (fireflies and butterflies over the moss; embers rising, smoke and bubbles of lava in the volcano;
// frogs on the lily pads, dragonflies and fireflies in the swamp; glints on the snow and snow falling on the ice), flocks that go by now and
// then (swallows, little fire birds, bats, white birds), clouds drifting in the abyss under the islands and fog over the far end of the
// bridge. All of it alive, a little of it with the effects down (LOWFX), nothing on an island still in the dark
// a soft light that keeps the island's own fade (glow sets the alpha)
const cnGl=(rgb,x,y,r,a,ry)=>{const a0=ctx.globalAlpha;glow(rgb,x,y,r,a*a0,ry);ctx.globalAlpha=a0};
// is this point (island units, screen directions) on the island's top, away from its edge?
const cnOnIsl=(sx,sy,m)=>{const a=sx/(CNI_R*CNI_SY),b=sy/CNI_R;return a*a+b*b<(m||.8)};
function cnIslLife(i,A,L,t,ch,won){const sd=i*3.7+1.1,low=LOWFX,E=cnIslFallPt(i),S0=[E[0]*.56,E[1]*.56,0];
  if(ch===1){cnFireflies(A,t,low?5:10,sd,'190,255,120',[12,44]);if(!low)cnButterflies(A,t,4,sd,CN_ISW[1].deco)}
  else if(ch===2){cnLavaBubbles(A,t,S0,low?1:3,sd);cnSmoke(A,t,IP(64,-66,38),low?3:6,sd);cnEmbers(A,t,low?7:16,sd,S0,IP(64,-66,38))}
  else if(ch===3){cnFrogs(i,A,t,S0,sd);cnFireflies(A,t,low?6:12,sd+5,'235,255,110',[8,34]);if(!low)cnDragonflies(A,t,S0,2,sd)}
  else{cnGlints(A,t,low?4:10,sd)}}
// fireflies wandering over the island, each lighting up and going out by itself (zr: how high they fly)
function cnFireflies(A,t,n,sd,rgb,zr){const k=A.k;ctx.save();ctx.globalCompositeOperation='lighter';
  for(let j=0;j<n;j++){const h=q=>prH(j,sd+q),sx=(h(1)-.5)*210+Math.sin(t*(.21+h(2)*.2)+h(3)*6)*26+Math.sin(t*.53+j)*8,sy=(h(4)-.5)*130+Math.cos(t*(.17+h(5)*.18)+h(6)*6)*18;
    if(!cnOnIsl(sx,sy,.95))continue;const z=zr[0]+h(7)*(zr[1]-zr[0])+Math.sin(t*(.8+h(8))+j)*5,b=Math.max(0,Math.sin(t*(.9+h(9)*.8)+h(10)*9)),a=b*b;if(a<.03)continue;
    const q=cnIslS(A,IP(sx,sy,z));if(!LOWFX)cnGl(rgb,q[0],q[1],15*k,.7*a);ctx.fillStyle=`rgba(${rgb},${(.9*a).toFixed(2)})`;ctx.beginPath();ctx.arc(q[0],q[1],2.3*k,0,TAU);ctx.fill();
    ctx.fillStyle=`rgba(255,255,225,${a.toFixed(2)})`;ctx.beginPath();ctx.arc(q[0],q[1],1.3*k,0,TAU);ctx.fill()}
  ctx.restore()}
// butterflies over the flowers: two pairs of wings that beat (now and then held up, gliding), a little body, drifting along a wandering path
// and turning where it goes; in the island's own 3D (the monsters' camera)
function cnButterflies(A,t,n,sd,cols){const V0=cnV();ctx.save();ctx.translate(A.x,A.y);ctx.scale(A.k,A.k);
  for(let j=0;j<n;j++){const h=q=>prH(j,sd+20+q),f1=.23+h(1)*.15,f2=.19+h(2)*.12,
      P=u=>[(h(3)-.5)*150+Math.sin(u*f1+h(4)*6)*34,(h(5)-.5)*90+Math.sin(u*f2*1.3+h(6)*6)*24,22+h(7)*14+Math.sin(u*1.7+j)*4],p=P(t),p2=P(t+.12);
    if(!cnOnIsl(p[0],p[1],1))continue;
    const c=IP(p[0],p[1],p[2]),c2=IP(p2[0],p2[1],p2[2]),dir=C3.nrm([c2[0]-c[0]+1e-4,c2[1]-c[1],0]),sdv=[-dir[1],dir[0],0],
      glide=Math.sin(t*.6+j*2.3)>.55,beat=glide?.75:.5+.5*Math.sin(t*(14+h(8)*5)+j*2),ang=-.2+beat*1.3,col=cols[j%cols.length],back=C3.dk(col,.3),
      W=sg=>C3.nrm([sdv[0]*sg*Math.cos(ang),sdv[1]*sg*Math.cos(ang),Math.sin(ang)]),
      wing=(sg,fw)=>{const w=W(sg),b=[c[0]+dir[0]*(fw?.8:-1),c[1]+dir[1]*(fw?.8:-1),c[2]],d=[w[0]+dir[0]*(fw?.4:-.5),w[1]+dir[1]*(fw?.4:-.5),w[2]];C3.leaf(V0,b,d,dir,fw?8.4:6,fw?4:3,fw?col:C3.lt(col,.08),{lw:1.1,ell:1,back,flat:1})};
    // the far wings, the body, the near wings (by how they face the camera)
    const near=V0.F(sdv)>0?1:-1;wing(-near,false);wing(-near,true);
    C3.caps(V0,[c[0]-dir[0]*3,c[1]-dir[1]*3,c[2]],1,[c[0]+dir[0]*2.8,c[1]+dir[1]*2.8,c[2]+.6],.95,'#3a2a22',{lw:1,noRim:1});
    wing(near,false);wing(near,true)}
  ctx.restore()}
// embers rising from the lava (its pool, the crater and the cracks), drifting east with the wind, white hot, then orange, then red, gone
function cnEmbers(A,t,n,sd,S0,cr){const k=A.k,E=CNI_EV;ctx.save();ctx.globalCompositeOperation='lighter';
  for(let j=0;j<n;j++){const h=q=>prH(j,sd+40+q),T=2+h(1)*1.8,u=(t/T+h(2))%1,cyc=Math.floor(t/T+h(2)),r=q=>prH(cyc,j*13+q+sd);
    let b;const s=h(3);if(s<.4)b=[S0[0]+(r(1)-.5)*16,S0[1]+(r(2)-.5)*30,1];else if(s<.75)b=[cr[0]+(r(1)-.5)*7,cr[1]+(r(2)-.5)*7,cr[2]-2];else b=IP((r(1)-.5)*200,(r(2)-.5)*120,2);
    const dr=u*(16+r(3)*18)+Math.sin(t*1.7+j)*3.5*u,z=b[2]+u*(56+r(4)*44),q=cnIslS(A,[b[0]+E[0]*dr,b[1]+E[1]*dr,z]),a=Math.min(1,u*6)*(1-u),sz=(2.6-u*1.3)*k;
    ctx.fillStyle=u<.3?`rgba(255,240,190,${a.toFixed(2)})`:u<.65?`rgba(255,170,70,${a.toFixed(2)})`:`rgba(230,80,40,${(a*.9).toFixed(2)})`;ctx.beginPath();ctx.arc(q[0],q[1],sz*.6,0,TAU);ctx.fill();
    if(!LOWFX&&j%2===0)cnGl('255,140,60',q[0],q[1],8*k,.4*a)}
  ctx.restore()}
// smoke from the crater: soft puffs that grow as they rise, leaning east with the wind
function cnSmoke(A,t,cr,n,sd){const k=A.k,E=CNI_EV,img=cnSmokeImg(),a0=ctx.globalAlpha;ctx.save();
  for(let j=0;j<n;j++){const u=(t*.09+j/n)%1,dr=u*u*40+Math.sin(t*.5+j)*4,z=cr[2]+u*80,q=cnIslS(A,[cr[0]+E[0]*dr,cr[1]+E[1]*dr,z]),r=(7+u*22)*k,al=.55*Math.min(1,u*5)*(1-u);
    if(al<.01)continue;ctx.globalAlpha=a0*al;ctx.drawImage(img,q[0]-r,q[1]-r*.85,r*2,r*1.7)}
  ctx.restore()}
function cnSmokeImg(){if(ISL.smk)return ISL.smk;const c=document.createElement('canvas');c.width=c.height=48;const x=c.getContext('2d'),g=x.createRadialGradient(20,20,2,24,24,24);
  g.addColorStop(0,'rgba(96,78,74,1)');g.addColorStop(.55,'rgba(70,56,54,.7)');g.addColorStop(1,'rgba(50,40,40,0)');x.fillStyle=g;x.fillRect(0,0,48,48);return ISL.smk=c}
// bubbles of lava in its pool: one swells, glows and bursts, a ring and a few drops, another somewhere else
function cnLavaBubbles(A,t,S0,n,sd){const k=A.k;ctx.save();
  for(let j=0;j<n;j++){const T=1.7+prH(j,sd+60)*1.1,u=(t/T+prH(j,sd+61))%1,cyc=Math.floor(t/T+prH(j,sd+61)),r=q=>prH(cyc,j*7+q+sd),p=[S0[0]+(r(1)-.5)*13,S0[1]+(r(2)-.5)*24,.6],q=cnIslS(A,p);
    if(u<.72){const s=(1+u/.72*3.4)*k;ctx.fillStyle='#ffb040';ctx.strokeStyle='#7a2a10';ctx.lineWidth=.7*k;ctx.beginPath();ctx.ellipse(q[0],q[1]-s*.35,s,s*.7,0,Math.PI,0);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='rgba(255,240,180,.85)';ctx.beginPath();ctx.ellipse(q[0]-s*.35,q[1]-s*.6,s*.28,s*.16,0,0,TAU);ctx.fill()}
    else{const v=(u-.72)/.28;ctx.strokeStyle=`rgba(255,200,110,${(1-v).toFixed(2)})`;ctx.lineWidth=1.4*k;ctx.beginPath();ctx.ellipse(q[0],q[1],(3+v*10)*k,(1.5+v*4.5)*k,0,0,TAU);ctx.stroke();
      ctx.fillStyle=`rgba(255,170,60,${(1-v).toFixed(2)})`;ctx.beginPath();for(let m=0;m<3;m++){const a=-Math.PI/2+(m-1)*.8,dd=v*10*k,x=q[0]+Math.cos(a)*dd,y=q[1]+Math.sin(a)*dd-v*(1-v)*18*k;ctx.moveTo(x+k,y);ctx.arc(x,y,k,0,TAU)}ctx.fill()}
    if(!LOWFX)pLight(q[0],q[1],9*k,'255,150,60',u<.72?.25*u:.4*(1-(u-.72)/.28))}
  ctx.restore()}
// glints on the snow: little stars that shine for a moment here and there on the island
function cnGlints(A,t,n,sd){const k=A.k;ctx.save();ctx.globalCompositeOperation='lighter';
  for(let j=0;j<n;j++){const T=2.2+prH(j,sd+70)*1.8,w=t/T+prH(j,sd+71),u=w%1;if(u>.3)continue;const cyc=Math.floor(w),sx=(prH(cyc,j*5+sd)-.5)*230,sy=(prH(cyc,j*5+sd+1)-.5)*150;if(!cnOnIsl(sx,sy,.8))continue;
    const a=Math.sin(u/.3*Math.PI),q=cnIslS(A,IP(sx,sy,1.5)),r=(3+a*6)*k;ctx.fillStyle=`rgba(255,255,255,${(.9*a).toFixed(2)})`;ctx.beginPath();
    ctx.moveTo(q[0],q[1]-r);ctx.quadraticCurveTo(q[0],q[1],q[0]+r*.7,q[1]);ctx.quadraticCurveTo(q[0],q[1],q[0],q[1]+r);ctx.quadraticCurveTo(q[0],q[1],q[0]-r*.7,q[1]);ctx.quadraticCurveTo(q[0],q[1],q[0],q[1]-r);ctx.fill();
    if(!LOWFX)cnGl('200,235,255',q[0],q[1],11*k,.45*a)}
  ctx.restore()}
// the frogs of the swamp, on the lily pads of its pool and on its shore: they breathe, now and then puff their throat and croak, now and then
// leap to another place and back; in the island's own 3D
const CN_FROG=[[[2,12],[-5,-9]],[[6,-15],[24,-6]],[[-9,4],[-20,16]]];   // [the two places of each frog: from the pool's middle, [x, y] of the island]
function cnFrogs(i,A,t,S0,sd){const V0=cnV(),parts=[];
  CN_FROG.forEach(([pa,pb],j)=>{const T=5.5+prH(j,sd+80)*3,w=t/T+prH(j,sd+81),u=w%1,cyc=Math.floor(w),from=cyc%2?pb:pa,to=cyc%2?pa:pb,hp=.42/T;
    let x,y,z=0,face,leap=0;const P=q=>[S0[0]+q[0],S0[1]+q[1]];
    if(u<hp){const v=u/hp,a=P(from),b=P(to);x=plerp(a[0],b[0],v);y=plerp(a[1],b[1],v);z=Math.sin(Math.PI*v)*12;face=Math.atan2(b[1]-a[1],b[0]-a[0]);leap=Math.sin(Math.PI*v)}
    else{[x,y]=P(to);face=.25*Math.sin(t*.3+j)+(j%2?.5:-.4)}
    const cw=u>.45&&u<.62?Math.max(0,Math.sin((u-.45)/.17*Math.PI*3)):0,br=1+.04*Math.sin(t*2.4+j*2);
    if(cw>.2&&u-.45<.02&&(ISL.frogT||0)<t-1){ISL.frogT=t;if(Math.abs(ISL.view-i)<.3)cnLifeSnd('rana')}
    parts.push({d:V0.D([x,y,z]),f:()=>cnFrog(V0,[x,y,z+.4],face,cw,leap,br)})});
  ctx.save();ctx.translate(A.x,A.y);ctx.scale(A.k,A.k);try{pRun(parts)}catch(err){cnErr(err)}finally{ctx.restore()}}
function cnFrog(V0,c,face,cw,leap,br){const f=[Math.cos(face),Math.sin(face),0],s=[-f[1],f[0],0],F=2.1,at=(a,b,z)=>[c[0]+(f[0]*a+s[0]*b)*F,c[1]+(f[1]*a+s[1]*b)*F,c[2]+z*F],G='#62b048',D='#4a9036',P=[],
    bl=(p,r,col,o)=>C3.sball(V0,p,r*F,col,o),cp=(a,ra,b,rb,col,o)=>C3.caps(V0,a,ra*F,b,rb*F,col,o);
  // (far to near: what faces away first)
  const R=(p,fn)=>P.push({d:V0.D(p),f:fn});
  for(const sg of[-1,1]){if(leap>.15){const k0=at(-1.4,sg*1.7,1.2),k1=at(-3.4-leap*2.4,sg*1.9,.8-leap*.6);R(k0,()=>cp(k0,.9,k1,.7,D,{lw:.8,noRim:1}))}
    else{const k0=at(-1.1,sg*2,1);R(k0,()=>bl(k0,1.25,D,{lw:.85,kl:.3,kd:.3,rim:.1}))}
    const hd=at(1.7,sg*1.3,.5);R(hd,()=>cp(at(1.2,sg*1.1,1.4),.5,hd,.45,D,{lw:.7,noRim:1}))}
  R(at(0,0,1.6),()=>C3.vol(V0,C3.ellPts(at(0,0,1.9),[2.6*br*F,2.3*br*F,1.75*br*F],C3.axes(f),5,12),G,{lw:1,kl:.35,kd:.3,rim:.25}));
  if(cw>0){const p=at(1.9,0,1.1);R(p,()=>bl(p,.9+cw*1.2,'#f4eaa4',{lw:.75,kl:.45,kd:.2,rim:.2}))}
  const look=V0.F(f)>-.25;
  for(const sg of[-1,1]){const e=at(1,sg*1.15,3.4);R(e,()=>{bl(e,1,'#74c45a',{lw:.8,kl:.35,kd:.25,rim:.15});if(!look)return;const q=V0.P(at(1.5,sg*1.2,3.55));
    ctx.fillStyle=INK;ctx.beginPath();ctx.arc(q[0],q[1],.55*F,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(q[0]-.18*F,q[1]-.22*F,.2*F,0,TAU);ctx.fill()})}
  pRun(P)}
// dragonflies over the pool: a long blue body, four wings that blur, darting from one place to the next and stopping in the air
function cnDragonflies(A,t,S0,n,sd){const V0=cnV();ctx.save();ctx.translate(A.x,A.y);ctx.scale(A.k,A.k);
  for(let j=0;j<n;j++){const T=1.5+prH(j,sd+90)*.8,w=t/T+prH(j,sd+91),u=w%1,cyc=Math.floor(w),wp=c=>[S0[0]+(prH(c,j*9+sd)-.5)*50,S0[1]+(prH(c,j*9+sd+1)-.5)*80,9+prH(c,j*9+sd+2)*9],
      a=wp(cyc),b=wp(cyc+1),e=u<.28?(1-Math.cos(u/.28*Math.PI))/2:1,c=[plerp(a[0],b[0],e),plerp(a[1],b[1],e),plerp(a[2],b[2],e)+8+Math.sin(t*5+j)],
      dir=C3.nrm([b[0]-a[0]+1e-4,b[1]-a[1],0]),sv=[-dir[1],dir[0],0],col=j%2?'#4fb8e8':'#6ad08a';
    C3.caps(V0,[c[0]-dir[0]*8,c[1]-dir[1]*8,c[2]],.8,[c[0]+dir[0]*2,c[1]+dir[1]*2,c[2]],1.3,col,{lw:.9,noRim:1});
    C3.sball(V0,[c[0]+dir[0]*3,c[1]+dir[1]*3,c[2]],1.6,col,{lw:.9,kl:.4,kd:.25,rim:.15});
    ctx.save();ctx.globalAlpha*=.6;const fl=Math.sin(t*40+j*3)*.35;
    for(const sg of[-1,1])for(const off of[1,-.8]){const d=C3.nrm([sv[0]*sg,sv[1]*sg,.25+fl]);C3.leaf(V0,[c[0]+dir[0]*off,c[1]+dir[1]*off,c[2]+.6],d,dir,8,1.7,'#e8f8ff',{lw:.7,flat:1})}
    ctx.restore()}
  ctx.restore()}
// clouds in the abyss, below the islands: soft banks of the world's colours, lit from under by its light (the lava's red in the volcano),
// drifting east; they sit in the path's own space (n along it, e across, z under the islands), so they go by with the perspective as you go
// north. Each world's cloud painted once (three shapes), copied
function cnCloudImg(ch,v){const key=ch+'_'+v,C=ISL.cld||(ISL.cld={});if(C[key])return C[key];const W=CN_ISW[Math.max(1,Math.min(4,ch))],c=document.createElement('canvas');c.width=256;c.height=112;
  const x=c.getContext('2d'),j=q=>(prH(q,v*13+ch)-.5),
    // a heap of puffs on a flat bottom: the big one in the middle, smaller ones going down to the sides, a row along the bottom
    P=[[40,78,19],[72,64,28],[112,52,38+j(1)*6],[156,58,33+j(2)*6],[194,70,25],[224,80,16],[46,86,16],[78,86,22],[114,86,26],[152,86,26],[188,86,22],[218,86,15]].map(([px,py,r],q)=>[px+j(q+3)*10,py+j(q+5)*6,r*(1+j(q+7)*.15)]);
  for(const[px,py,r] of P){const g=x.createRadialGradient(px,py,r*.3,px,py,r);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.8,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,TAU);x.fill()}
  x.globalCompositeOperation='destination-out';{const g=x.createLinearGradient(0,90,0,100);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,1)');x.fillStyle=g;x.fillRect(0,90,256,22)}
  // its colours: the moonlit top, the fog of the world, the dark underside lit by the world's light
  x.globalCompositeOperation='source-atop';const hx=n=>'#'+n.map(q=>Math.round(clamp(q,0,255)).toString(16).padStart(2,'0')).join(''),fog=hx(W.fog.split(',').map(Number)),li=hx(W.light.split(',').map(Number)),
    g=x.createLinearGradient(0,14,0,104);g.addColorStop(0,cnMixC(fog,'#ffffff',.42));g.addColorStop(.45,cnMixC(fog,'#ffffff',.08));g.addColorStop(.75,cnMixC(fog,W.sky[0],.3));g.addColorStop(1,cnMixC(cnMixC(fog,W.sky[0],.45),li,ch===2?.6:.32));x.fillStyle=g;x.fillRect(0,0,256,112);
  // each upper puff a little lighter on its top, a little darker under it (so the heap reads as puffs)
  for(const[px,py,r] of P.slice(0,6)){const g1=x.createRadialGradient(px-r*.3,py-r*.45,r*.1,px-r*.2,py-r*.3,r*.9);g1.addColorStop(0,'rgba(255,255,255,.3)');g1.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g1;x.beginPath();x.arc(px,py,r,0,TAU);x.fill();
    if(py+r*.6<88){x.strokeStyle='rgba(0,0,0,.08)';x.lineWidth=2.2;x.beginPath();x.arc(px,py+1,r-1.5,.2*Math.PI,.8*Math.PI);x.stroke()}}
  return C[key]=c}
function cnIslClouds(L,t,v){const P=[],vn=v*CNI_GAP,i0=Math.floor(v);
  for(let j=Math.max(0,i0-1);j<=Math.min(ARENAS.length-1,i0+2);j++){const ch=ARENAS[j].ch||1;
    for(let q=0;q<4;q++){const h=r=>prH(q,j*7+r+3),n=j*CNI_GAP+60+h(1)*900,d=n-vn;if(d<-320||d>2400)continue;
      const z=-(105+h(2)*180),e0=(h(3)-.5)*1500+t*(3+h(4)*5),e=((e0+750)%1500+1500)%1500-750,f=CNI_PD/(CNI_PD+Math.max(-CNI_PD*.55,d)),k=L.k*f,w=(170+h(5)*150)*k,
        x=L.cx+e*k,y=L.cy-.55*L.k*d*f-z*k+Math.sin(t*.9)*2.2*L.dpr*f;
      if(x+w*.5<0||x-w*.5>L.W||y+w*.2<0||y-w*.25>L.info)continue;   // (under the line below the island the picture goes into the sky: nothing to see there)
      const a=(.5-.22*clamp(d/2400,0,1))*clamp((750-Math.abs(e))/140,0,1);if(a<.02)continue;P.push({d,f:()=>{ctx.globalAlpha=a;ctx.drawImage(cnCloudImg(ch,q%3),x-w/2,y-w*.25,w,w*.4375)}})}}
  P.sort((a,b)=>b.d-a.d);ctx.save();for(const p of P)p.f();ctx.restore()}
// fog going over the far end of the bridge (between its deck and its live parts): two long soft banks of the world's fog, drifting east
function cnBrWisps(i,L,t,M){if(LOWFX)return;const G0=M.G,W=cnIslW(i);ctx.save();
  for(let q=0;q<2;q++){const h=r=>prH(q,i*5+r+40),n=G0.a0+G0.len*(.56+h(1)*.3),e=((h(2)*1200+t*(9+h(3)*6))%1200)-600,p=M.S(n,e,cnDeckZ(G0,n)+8+h(4)*16),k=M.K(n);
    if(p[1]<-60*L.dpr||p[1]>L.H)continue;cnGl(W.fog,p[0],p[1],(150+h(5)*80)*k,.16*clamp((600-Math.abs(e))/160,0,1),(16+h(6)*8)*k)}
  ctx.restore()}
// the snow falling over the ice (a: how much of it: the ice world on the screen), far flakes small and slow, near ones bigger and faster
// in front of everything; they go by as you go north
function cnSnow(L,t,a,v,near){if(a<=.02)return;const d=L.dpr,n=Math.round((near?40:80)*(LOWFX?.5:1)),sz=near?2.6:1.5,sp=near?62:30,Hh=L.H,Ww=L.W*1.3;ctx.save();ctx.fillStyle=`rgba(248,252,255,${((near?.85:.55)*a).toFixed(2)})`;ctx.beginPath();
  for(let j=0;j<n;j++){const h=q=>prH(j,(near?90:70)+q),x=((h(1)*Ww+t*(10+h(2)*9)*d+Math.sin(t*(.7+h(3))+j)*12*d)%Ww+Ww)%Ww-L.W*.15,
      y=(((h(4)*Hh+t*sp*d*(.7+h(5)*.6)+v*L.pairPx*(near?.5:.25))%Hh)+Hh)%Hh,r=sz*d*(.75+h(6)*.5);
    ctx.moveTo(x+r,y);ctx.arc(x,y,r,0,TAU)}ctx.fill();ctx.restore()}
// flocks: every seven to thirteen seconds a few of the world's birds go by over the island you look at (swallows over the moss, little fire
// birds over the volcano, bats over the swamp, white birds over the ice), flapping and gliding: one time across, from one side of the abyss
// to the other high in front of the towers of its bridge, the next time from behind you up along the bridge toward the next island,
// smaller and smaller in the distance
const CN_FLK=[null,{k:'bird',a:'#2c3e72',b:'#f4efe2',c:'#d8503a'},{k:'fire',a:'#ff7a2a',b:'#ffd070',c:'#fff0a0'},{k:'bat',a:'#4a3a5e',b:'#6e5a82',c:'#ffd84a'},{k:'bird',a:'#f2f7ff',b:'#ffffff',c:'#6a9ac8'}];
function cnFlockStep(dt,L){const t=CAMP.t;if(LOWFX||ISL.brA){ISL.fk=null;return}
  if(ISL.fk&&t-ISL.fk.t0>ISL.fk.D)ISL.fk=null;
  if(!ISL.fk){if(ISL.fkN==null)ISL.fkN=t+4+Math.random()*4;if(t<ISL.fkN)return;ISL.fkN=t+7+Math.random()*6;
    const g=clamp(Math.round(ISL.view),0,ARENAS.length-2);if(!ARENAS[g+1]||!cnOpenShown(g))return;const ch=ARENAS[g].ch||1,sp=ch===3?150:ch===2?190:170,m=3+Math.floor(Math.random()*3),way=ISL.fkW=ISL.fkW==='x'?'n':'x';
    ISL.fk={g,ch,t0:t,way,D:way==='x'?840/sp:1500/sp,dir:Math.random()<.5?1:-1,n:-20+Math.random()*150,e:(Math.random()-.5)*140,z:60+Math.random()*40,
      m:Array.from({length:m},(_,r)=>({dn:(r?((r%2)*2-1)*Math.ceil(r/2)*13:0)+(Math.random()-.5)*5,de:-Math.ceil(r/2)*15-Math.random()*5,dz:(Math.random()-.5)*10,ph:Math.random()*TAU}))};
    if(Math.abs(ISL.view-g)<.6)cnLifeSnd(CN_FLK[ch].k)}}
// (drawn after the island they go over; across: dn, de are the place of each in the flock across and behind; along the bridge the other way)
function cnFlockDraw(g,L,t){const F=ISL.fk;if(!F||F.g!==g)return;const M=cnBrMap(g,L,t),C=CN_FLK[F.ch],u=(t-F.t0)/F.D,X=F.way==='x',
    fd=X?cnChain(0,F.dir,0):cnChain(1,0,0),sn=X?cnChain(1,0,0):cnChain(0,1,0),fa=clamp(Math.min(u,1-u)*(X?12:7),0,1);if(fa<=0)return;
  const e0=F.dir*(-420+840*u),n0=-380+1480*u,B=F.m.map(b=>({b,n:X?F.n+b.dn:n0+b.de,e:X?e0+b.de*F.dir:F.e+b.dn})).sort((p,q)=>q.n-p.n);
  ctx.save();ctx.globalAlpha*=fa;
  try{for(const{b,n,e} of B){const bat=C.k==='bat',z=F.z+b.dz+Math.sin(t*(bat?5:1.3)+b.ph)*(bat?3:1.5)+(X?0:30*u),K=cnPlatView(M,n),V0=K.V0,c=cnChain(0,e,z),
        fl=bat?Math.sin(t*17+b.ph):C.k==='fire'?Math.sin(t*12+b.ph):(Math.sin(t*.8+b.ph)>.3?.15:Math.sin(t*11+b.ph));
      ctx.save();ctx.translate(K.o[0],K.o[1]);ctx.scale(K.k,K.k);const q=V0.P(c);ctx.translate(q[0],q[1]);ctx.scale(1.6,1.6);ctx.translate(-q[0],-q[1]);cnBird(V0,c,fd,sn,fl,C,t+b.ph);ctx.restore()}}
  catch(err){cnErr(err)}finally{ctx.restore()}}
// one of them, in the path's 3D (c its middle, fd where it flies, sn across: its wings' way): a body, its two wings beating (fl: -1 down, 1 up),
// a tail; the bat with its ears and its yellow eyes, the fire bird with a little flame for a tail and its light
function cnBird(V0,c,fd,sn,fl,C,t){const at=(a,b,z)=>[c[0]+fd[0]*a+sn[0]*b,c[1]+fd[1]*a+sn[1]*b,c[2]+z],ang=fl*.75,bat=C.k==='bat',fire=C.k==='fire',
    wing=sg=>{const d=C3.nrm([sn[0]*sg*Math.cos(ang)-fd[0]*.25,sn[1]*sg*Math.cos(ang)-fd[1]*.25,Math.sin(ang)]),bk=C3.dk(C.a,.25);
      // (a bat's wing in two lobes: the membrane between its fingers)
      if(bat){C3.leaf(V0,at(.3,sg*.6,.2),d,fd,7.2,2.6,C.a,{lw:.8,back:bk,tip:.55,bend:-.25});C3.leaf(V0,at(-.5,sg*.6,.1),C3.nrm([d[0]-fd[0]*.6,d[1]-fd[1]*.6,d[2]-.1]),fd,5.4,2,C3.dk(C.a,.1),{lw:.8,back:bk,tip:.5})}
      else C3.leaf(V0,at(.3,sg*.6,.2),d,fd,7,1.7,C.a,{lw:.8,back:bk,tip:.15,bend:.15})};
  if(fire&&!LOWFX){const q=V0.P(c);ctx.save();ctx.globalCompositeOperation='lighter';cnGl('255,150,60',q[0],q[1],9,.5);ctx.restore()}
  const near=V0.F(sn)>0?1:-1;wing(-near);
  // the tail: a fork (birds), a little flame (fire), none (bats)
  if(!bat){for(const sg of[-1,1])C3.leaf(V0,at(-2,0,0),C3.nrm([-fd[0]+sn[0]*sg*.35,-fd[1]+sn[1]*sg*.35,-.05]),sn,fire?3.4:3.8,.7,fire?C.b:C.a,{lw:.7})}
  C3.caps(V0,at(-1.9,0,0),bat?1:.85,at(1.4,0,.15),bat?1.25:1.05,bat?C.a:C.b,{lw:.8,kl:.35,kd:.3,rim:.15});
  C3.sball(V0,at(2,0,.4),bat?1.15:1,C.a,{lw:.8,kl:.35,kd:.3,rim:.15});
  if(bat){for(const sg of[-1,1])C3.leaf(V0,at(2.1,sg*.6,1.2),[0,0,1],fd,1.4,.6,C.a,{lw:.6});const q=V0.P(at(2.8,0,.5));ctx.fillStyle=C.c;for(const sg of[-1,1]){ctx.beginPath();ctx.arc(q[0]+sg*.55,q[1],.32,0,TAU);ctx.fill()}}
  else{const b0=V0.P(at(2.7,0,.4)),b1=V0.P(at(3.6,0,.2));ctx.strokeStyle=C.c;ctx.lineWidth=.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(b0[0],b0[1]);ctx.lineTo(b1[0],b1[1]);ctx.stroke()}
  wing(near)}
// the voices of the life round the islands, made by the code, quiet and rare: a frog croaking, swallows twittering, the fire birds' chirp
// and the bats' squeaks as a flock goes by
function cnLifeSnd(w){try{if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running'||document.hidden)return;const t=AU.ctx.currentTime+.02;
  if(w==='rana'){for(const d of[0,.13]){const c=AU.ctx,o=osc('square',VR(150,.05),t+d,t+d+.12),b=filt('lowpass',900,4),g=c.createGain();o.frequency.exponentialRampToValueAtTime(95,t+d+.1);
      g.gain.setValueAtTime(.0001,t+d);g.gain.linearRampToValueAtTime(.022,t+d+.015);g.gain.exponentialRampToValueAtTime(.0005,t+d+.11);o.connect(b);b.connect(g);route(g,null,.15)}}
  else if(w==='bird')for(let j=0;j<4;j++){const d=j*.11+Math.random()*.05,f=VR(3200,.12);tone(f,f*1.35,.06,'sine',.008,d);tone(f*1.2,f*.9,.05,'sine',.006,d+.06)}
  else if(w==='fire'){for(let j=0;j<3;j++)tone(VR(2400,.1),VR(3400,.1),.08,'triangle',.007,j*.14);fNoise(t,.5,'bandpass',1400,1.2,.012,{f2:2600,att:.15})}
  else if(w==='bat')for(let j=0;j<4;j++){const d=j*.09+Math.random()*.04;tone(VR(5200,.08),VR(4300,.08),.035,'sine',.006,d)}}catch(err){}}
function cnIslDraw(i,A,L,t){const won=cnWon(i),op=cnOpenShown(i),W=cnIslW(i),ac=cnRgb(ARENAS[i].col),k=A.k,ch=ARENAS[i].ch||1,S=p=>cnIslS(A,p),SH=ISL.brA,lt=SH&&SH.done&&SH.i+1===i&&SH.lit?SH.litT:1;
  ctx.save();
  if(!LOWFX)pLight(A.x,A.y+CNI_R*.55*k*1.6,CNI_R*1.5*k,W.light,op?.16:.04,CNI_R*.6*k);
  // the island the last plank opens comes out of the dark into its colours (and its live parts with it)
  const pic=c=>{if(Math.abs(A.f-1)<.002)ctx.drawImage(c.cv,Math.round(A.x-c.ox),Math.round(A.y-c.oy));else ctx.drawImage(c.cv,A.x-c.ox*A.f,A.y-c.oy*A.f,c.cv.width*A.f,c.cv.height*A.f)};
  if(lt<1){pic(cnIslImg(i,L,false));ctx.save();ctx.globalAlpha*=lt;pic(cnIslImg(i,L,true));ctx.restore();ctx.globalAlpha*=lt}else pic(cnIslImg(i,L,op));
  // the towers of the bridge to the next island: what moves in the wind, the lanterns' lights (where the swing has the lanterns)
  if(op&&ARENAS[i+1]){const th=LOWFX?[0,0]:cnPortalLive(i,A,t,op);
    for(const s of[-1,1]){const a=th[(s+1)/2]||0,hk=S(cnChain(cnPortalLamp(i,s)[0],cnPortalLamp(i,s)[1],CNB.gate-24.6)),d0=8.4*k,q=[hk[0]-Math.sin(a)*d0,hk[1]+Math.cos(a)*d0],fl=LOWFX?1:.84+.16*Math.sin(t*8+s+i);
      pLight(q[0],q[1],18*k,'255,196,100',.48*fl,15*k);if(!LOWFX)pFlame(q[0],q[1]+1.4*k,4.6*k,2.2*k,1,t+s,false)}}
  // the live parts: the arena's glow in the gate, the brazier's flame, the lanterns, the fall, the world (lava, fireflies, snow), the guardian
  if(op){const g=S([CI_GATE[0],CI_GATE[1],16]),pul=.7+.3*Math.sin(t*1.8+i);pLight(g[0],g[1],22*k,ac,.5*pul,26*k);for(let j=0;j<5;j++){const q=(t*.3+j/5)%1;ctx.fillStyle=`rgba(${ac},${(1-q)*.8})`;ctx.fillRect(g[0]+Math.sin(j*2.1+t)*8*k,g[1]+20*k-q*30*k,1.4*L.dpr,1.4*L.dpr)}}
  if(won){const b=S([CI_BRAZ[0],CI_BRAZ[1],17]);pLight(b[0],b[1],26*k,'255,170,70',.55);pFlame(b[0],b[1],16*k,9*k,1,t+i,LOWFX);if(!LOWFX)cnSparks(b[0],b[1]-10*k,k,t+i)}
  if(op&&(ch===1||ch===3))for(const[n,e] of CNI_LAMPS){const q=S(cnChain(n,e,19.5)),fl=LOWFX?1:.85+.15*Math.sin(t*9+n);pLight(q[0],q[1],16*k,'255,200,110',.42*fl,14*k)}
  if(op&&!LOWFX&&CNI_FALL[ch])cnIslFallFx(i,S,k,t,ch);
  if(ch===2&&!LOWFX&&op){const q=S(IP(64,-66,38));pLight(q[0],q[1],20*k,'255,110,40',.5+.2*Math.sin(t*2))}
  if(op&&A.y-60*k<L.H&&A.y+60*k>0)try{cnIslLife(i,A,L,t,ch,won)}catch(err){cnErr(err)}
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
// ------------------------------------------------ the hero's ways along the path (n from the middle of island lo, e across, z up): chain points
// [north, east, high]; off the path a soft curve onto it, along it (on a bridge with its sag), a soft curve off it to where he goes
function cnRoute(lo,n0,e0,n1,e1){const G0=cnBrGeo(lo),pts=[],up=n1>=n0,st=up?8:-8,
    bez=(p0,c,p2,m)=>{for(let j=0;j<=m;j++){const s=j/m,r=1-s;pts.push([r*r*p0[0]+2*r*s*c[0]+s*s*p2[0],r*r*p0[1]+2*r*s*c[1]+s*s*p2[1],0])}};
  let a=n0,b=n1;if(Math.abs(e0)>1.5){a=n0+(up?44:-44);bez([n0,e0],[n0+(a-n0)*.4,0],[a,0],6)}else pts.push([n0,0,cnDeckZ(G0,n0)]);
  if(Math.abs(e1)>1.5)b=n1+(up?-44:44);
  for(let n=a+st;up?n<b-1:n>b+1;n+=st)pts.push([n,0,cnDeckZ(G0,n)]);
  if(Math.abs(e1)>1.5)bez([b,0],[b+(n1-b)*.6,0],[n1,e1],6);else pts.push([n1,0,cnDeckZ(G0,n1)]);
  let len=0;const cum=[0];for(let j=1;j<pts.length;j++){len+=Math.hypot(pts[j][0]-pts[j-1][0],pts[j][1]-pts[j-1][1],pts[j][2]-pts[j-1][2]);cum.push(len)}return{pts,cum,len,lo}}
// from the hero's place on island a to his place on the next island or the one before
function cnIslWay(a,b){const lo=Math.min(a,b),[hn,he]=cnIslNE(CI_HERO);return b>a?cnRoute(lo,hn,he,CNI_GAP+hn,he):cnRoute(lo,CNI_GAP+hn,he,hn,he)}
// how far along the way he is (a soft start and a soft stop, the same speed in the middle)
function cnWayDD(J){const u=Math.min(1,J.t/J.dur),ea=.12,cc=2*ea*(1-ea);return J.way.len*(u<ea?u*u/cc:u>1-ea?1-(1-u)*(1-u)/cc:(u-ea/2)/(1-ea))}
const cnAd=d=>{while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return d};
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
  if(J&&J.way){const W=J.way,u=Math.min(1,J.t/J.dur),dd=cnWayDD(J),p=cnWayAt(W,dd),q=cnChainScr(W.lo,p[0],p[1],p[2],L,t),p2=cnWayAt(W,dd+12),
      g=cnChainScr(W.lo,p[0],p[1],0,L,t),g2=cnChainScr(W.lo,p2[0],p2[1],0,L,t),home=Math.PI/2-.2,wb=u<.1?1-u/.1:u>.86?(u-.86)/.14:0;
    let tf=Math.hypot(g2[0]-g[0],g2[1]-g[1])>.05?Math.atan2((g2[1]-g[1])/.55,g2[0]-g[0]):(J.ft!=null?J.ft:home);tf+=cnAd(home-tf)*wb*wb*(3-2*wb);J.ft=tf;
    // his size from his own distance to the camera (the camera follows him, so it stays the same), not from the island or the bridge
    // under his feet (he grew by a tenth stepping onto the bridge and shrank leaving it)
    const hn=cnIslNE(CI_HERO)[0],kAt=n=>{const d=(W.lo-ISL.view)*CNI_GAP+n-hn;return L.k*CNI_PD/(CNI_PD+Math.max(-CNI_PD*.55,d))};
    if(J.fs==null)J.fs=home;const face=J.fs,sc=L.hs*kAt(p[0]);
    // the companions walk after him
    if(SAVE.pets)petEq().forEach((id,j)=>{const pd=dd-(26+j*22);if(pd<0)return;const pp=cnWayAt(W,pd),pq=cnChainScr(W.lo,pp[0],pp[1],pp[2],L,t),ps=L.hs*kAt(pp[0])*.5;ctx.save();ctx.translate(pq[0]+(j?-1:1)*6*pq[2],pq[1]);ctx.scale(ps,ps);ctx.fillStyle='rgba(0,0,0,.3)';ell(0,2,9,3);ctx.fill();drawPetSprite(id,0,0,{t:t+j*.7,face,moving:true,att:0,happy:0,hop:0});ctx.restore()});
    ctx.save();ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(q[0],q[1]+2*sc,12*sc,3.6*sc,0,0,TAU);ctx.fill();ctx.translate(q[0],q[1]);ctx.scale(sc,sc);noShadow=false;mossOn=1;drawRig(0,0,face,dd*.046*Math.min(1,300/Math.max(1,W.len/J.dur)),u<.985,heroStyle(),{});mossOn=0;ctx.restore();
    CAMP.hero=null;return}
  if(J){const u=Math.min(1,J.t/J.dur),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2,a=at(J.a),b=at(J.b);x=plerp(a[0],b[0],e);y=plerp(a[1],b[1],e)-Math.sin(u*Math.PI)*L.pairPx*.5;s=L.hs*plerp(a[2],b[2],e)}
  else{const h=at(ISL.cur);[x,y]=h;s=L.hs*h[2];if(y<-60*L.dpr||y>L.H+60*L.dpr){CAMP.hero=null;return}}
  if(CAMP.walk>0){const A=cnIslAt(ISL.cur,L,t),q=Math.min(1,(t-CAMP.walk)/1.4),g=K0.P(CI_GATE);x+=(g[0]-P0[0])*A.k*q;y+=(g[1]-P0[1])*A.k*q;s*=1-.3*q;fade=q<.7?1:Math.max(0,1-(q-.7)/.3)}
  ctx.save();ctx.globalAlpha=fade;ctx.fillStyle='rgba(0,0,0,.35)';if(!J){ctx.beginPath();ctx.ellipse(x,y+2*s,12*s,3.6*s,0,0,TAU);ctx.fill()}
  drawHomeHero(x,y,s,t);ctx.restore();
  if(!J&&!CAMP.walk&&SAVE.pets)petEq().forEach((id,i)=>{const px=x+(i?-1:1)*22*s,py=y+3*s,ps=s*.5;ctx.save();ctx.translate(px,py);ctx.scale(ps,ps);ctx.fillStyle='rgba(0,0,0,.3)';ell(0,2,9,3);ctx.fill();drawPetSprite(id,0,0,{t:t+i*.7,face:i?0:Math.PI,moving:false,att:0,happy:0,hop:0});ctx.restore()});
  CAMP.hero=J||CAMP.walk?null:{x,y,w:18*s,h:50*s,dpr:L.dpr}}
// on top the island's number and name, under them its mode (and the switch of the Incubo); under the island, the brazier and the record
function cnIslText(L,t){ISL.incBtn=null;const v=ISL.view,rk=ISL.brA?null:cnStopNear(v);if(rk)cnStopText(L,t,rk);
  const i=Math.max(0,Math.min(ARENAS.length-1,Math.round(v))),a=(1-Math.min(1,Math.abs(v-i)*2.2))*(rk?1-rk.a:1),A=ARENAS[i],mo=cnModeOf(i),op=cnOpenShown(i),won=cnWon(i),d=L.dpr,SH=ISL.brA;if(a<=.02)return;
  ctx.save();ctx.globalAlpha=a;ctx.textAlign='left';ctx.lineJoin='round';const font=n=>`${Math.round(n*d)}px "Lilita One", sans-serif`,out=(s,x,y,c,w)=>{ctx.lineWidth=w*d;ctx.strokeStyle=INK;ctx.strokeText(s,x,y);ctx.fillStyle=c;ctx.fillText(s,x,y)};
  const tag=`ARENA ${i+1}`,room=L.tr-L.tl,mid=w=>clamp(L.cx,L.tl+w/2,L.tr-w/2);ctx.font=font(12);const tw=ctx.measureText(tag).width,gap=7*d;let ns=21;ctx.font=font(ns);let nw=ctx.measureText(A.n).width;
  while(ns>13&&tw+gap+nw>room){ns-=1;ctx.font=font(ns);nw=ctx.measureText(A.n).width}
  let y=L.lab+20*d;const x0=mid(tw+gap+nw)-(tw+gap+nw)/2;ctx.font=font(12);out(tag,x0,y-1.5*d,A.col,3.2);ctx.font=font(ns);out(A.n,x0+tw+gap,y,'#fff7e6',4.6);
  y+=20*d;ctx.font=font(12);const mn=CN_MO[mo].n,mw=ctx.measureText(mn).width+30*d,inc=op&&cnIncOk(i),iw=inc?cnIncW(L):0,rw=mw+(inc?iw+8*d:0),x1=mid(rw)-rw/2;
  cnRR(x1,y-12.5*d,mw,18*d,8*d);ctx.fillStyle='rgba(0,0,0,.45)';ctx.fill();cnMoGlyph(mo,x1+11*d,y-3.5*d,d);out(mn,x1+21*d,y+.5*d,CN_MO[mo].c,3);
  if(inc)cnIncPill(L,x1+mw+8*d,y-13.5*d,a,t);
  ctx.textAlign='center';y=L.info;ctx.font=font(14);const rec=cnRecTxt(i),iwn=(cnS().inc[i]||{}).win,io=cnIncOn(i),line=!op?(SH&&SH.i===i-1?'Le assi vanno al loro posto…':`Finisci il ponte: ${cnBrHave(i-1)}/${cnBrNeed(i-1)} assi`):io?(iwn?'Incubo vinto · oro doppio a ogni vittoria':'Incubo: nemici più forti · oro doppio'):won?(iwn?'Completata · Incubo vinto':'Completata'):rec?`Record ${rec}`:'Da conquistare';
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
  st.addEventListener('pointerdown',e=>{if(!cnIslOn()||MM.tr||e.target.closest('button'))return;if(ISL.brA){cnBrShowEnd();return}ISL.drag={x:e.clientX,y:e.clientY,v0:ISL.view,t:performance.now(),id:e.pointerId,moved:false,ax:null,lv:ISL.view,lt:performance.now(),vel:0}},true);
  st.addEventListener('pointermove',e=>{const D=ISL.drag;if(!D||D.id!==e.pointerId||!ISL.lay)return;const dx=e.clientX-D.x,dy=e.clientY-D.y;
    // up and down along the path (the next island is up: the finger going down brings it), or sideways as before (to the left the next)
    if(!D.moved&&Math.hypot(dx,dy)>9){D.moved=true;D.ax=Math.abs(dy)>Math.abs(dx)?'y':'x'}if(!D.moved)return;e.stopImmediatePropagation();
    const L=ISL.lay,now=performance.now(),v=clamp(D.v0+(D.ax==='y'?dy*L.dpr/L.pairPx:-dx*L.dpr/(L.W*.55)),-.35,ARENAS.length-.65);
    // the speed of the last tenth of a second (one last move in place does not stop a flick)
    (D.h||(D.h=[])).push([now,v]);while(D.h.length>1&&now-D.h[0][0]>100)D.h.shift();const h0=D.h[0];if(D.h.length>1)D.vel=(v-h0[1])/Math.max(8,now-h0[0]);D.lv=v;D.lt=now;ISL.view=v},true);
  // where the finger leaves it the camera settles on the nearest island or rock of a bridge; a flick goes on to the next island
  const end=e=>{const D=ISL.drag;if(!D||D.id!==e.pointerId)return;ISL.drag=null;if(!D.moved){cnIslTap(e);return}e.stopImmediatePropagation();MM.eatNext=true;
    const vel=performance.now()-D.lt>120?0:D.vel;ISL.fling={vel:D.vel,gap:Math.round(performance.now()-D.lt),n:D.h?D.h.length:0};cnIslSettle(ISL.view+vel*90,vel)};   // (held still before letting go: no flick)
  st.addEventListener('pointerup',end,true);st.addEventListener('pointercancel',e=>{if(ISL.drag&&ISL.drag.id===e.pointerId){ISL.drag=null;cnIslSettle(ISL.view)}},true)}
function cnIslGo(j){ISL.go=j;if(j===ISL.cur){sfx('ui');return}
  if(cnOpen(j)){const a=ISL.cur;cnIslMove(a,j);const S=cnS();S.pick=j;save();sfx('ui');tone(330,660,.18,'triangle',.03);renderPlay()}else{sfx('ui');tone(220,160,.2,'square',.02)}}
function cnIslTap(e){const L=ISL.lay;if(!L)return;const r=campCv.getBoundingClientRect(),x=(e.clientX-r.left)*L.dpr,y=(e.clientY-r.top)*L.dpr;
  const ib=ISL.incBtn;if(ib&&x>ib[0]&&x<ib[2]&&y>ib[1]&&y<ib[3]){ISL.inc=!ISL.inc;sfx('ui');if(ISL.inc){tone(160,90,.5,'sawtooth',.03);vib([20,30,20])}else tone(330,520,.15,'triangle',.03);cnPlayLbl();return}
  if(y<L.lab+42*L.dpr&&y>L.lab-10*L.dpr&&Math.abs(x-L.cx)<L.W*.34){sfx('ui');cnMapOpen();return}
  // a tap on a prize of a bridge says what it is and when it is yours
  for(const q of ISL.prz||[])if(Math.hypot(x-q.x,y-q.y)<q.r){sfx('ui');toast(q.txt);return}
  // a tap on the bridge or on the island beyond it goes there (an island still closed says how to open it)
  const v=Math.round(ISL.view),A=cnIslAt(v,L,CAMP.t);if(y>L.titleB&&y<A.y-CNI_R*.5*A.k&&Math.abs(x-L.cx)<L.W*.42&&v<ARENAS.length-1){if(cnOpen(v+1))cnIslGo(v+1);else{toast(`Finisci il ponte da «${ARENAS[v].n}»: ${cnBrHave(v)}/${cnBrNeed(v)} assi`);sfx('ui')}}}
// «Gioca» plays the island you see; a locked one tells you how to open it
// the island «Gioca» plays: the one the show takes the hero to, his own from a balcony of a bridge, or the one you look at
const cnPlayIsl=()=>ISL.brA?(ISL.brA.done?ISL.brA.i+1:ISL.brA.i):ISL.rest!=null?ISL.cur:ISL.go!=null?ISL.go:Math.round(ISL.view);
{const _gp=goPlay;goPlay=function(mode){if(CN.on&&mode==='arena'&&!zMode()&&ISL.cur!=null&&!CN.next){if(ISL.brA)cnBrShowEnd();
    const v=cnPlayIsl();if(ISL.rest!=null){ISL.rest=null;ISL.go=v}
    if(!cnOpen(v)){toast(`Finisci il ponte da «${ARENAS[v-1].n}»: ${cnBrHave(v-1)}/${cnBrNeed(v-1)} assi`);sfx('ui');return}if(v!==cnPick()){const S=cnS();S.pick=v;save()}
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

// ---------------------------------------------------------------- 8 il ponte sospeso di assi coi premi, la Prova dell'Incubo, le arene al buio
// Denis: «non fare in modo che si possa passare da un'isola all'altra solo vincendo una partita da 10 round» → «più difficile», poi «aggiungi
// ponte di pietra e prova dell'incubo a parte perché la voglio provare», e «oscura tutte le arene non accessibili così che non si vedono i boss».
// Poi (26 ottobre): «se aggiungi una specie di cosa che ha clash royale come proseguimento con le coppe, ma in questo caso saranno con le assi
// di legno che servono per costruire il ponte, il ponte deve essere fatto meglio rendilo più grande e allontana le isole di tanto l'una
// dall'altra, migliorando la posizione del ponte e l'animazione di quando si mettono nel loro apposito posto», e alle domande: «Assi e premi sul
// ponte», «Ponte sospeso di assi», «Volano e si inchiodano».
// Il ponte: ogni partita porta assi (2 per ogni stanza o piano superato, il custode 20 in più: una vittoria 40, i ponti da 100 a 200). Le isole
// sono lontane (1000 invece di 380) e il ponte è sospeso (27 ottobre, Denis: «nel ponte non fare le piccole isolette di mezzo ma un ponte più
// grande ed quindi anche isola ecc più grandi. le ricompense saranno a sinistra»): uno solo, dalle due torri di tronchi sull'isola fino
// all'isola dopo, largo, appeso a due cavi grandi che scendono dalle cime delle torri, 64 assi; a un quarto, a metà e a tre quarti, a sinistra,
// un balcone col premio del cammino (oro, cristalli o essenza, una cassa) e la sua lanterna, e dove il ponte finisce una cassa migliore, presi
// quando le assi ci arrivano. Le isole più grandi: la telecamera più vicina. Tornato dalla partita, l'eroe porta il sacco delle assi fin dove arriva il ponte, ogni asse vola dal sacco al suo
// posto e lui la inchioda; finito il ponte l'isola dopo si accende e lui ci passa. L'Incubo, a parte: sulle isole vinte un interruttore «Incubo»
// sotto il nome; nemici più forti, più élite, il custode già arrabbiato, la stanza rossa; oro doppio e 3 cristalli se vinci, una luna rossa
// sull'isola; niente assi.
const CN_PLANK='<svg viewBox="0 0 24 24"><path d="M2.6 10.4l17.2-4.6 2 2.6-.6 6.4-17.4 4.6L1.9 17z" fill="#b5864f" stroke="#1b1612" stroke-width="2" stroke-linejoin="round"/><path d="M5 13.6l14.6-3.9M5.8 16.4l9.6-2.6" stroke="#6e4826" stroke-width="1.2" opacity=".75"/><circle cx="5.2" cy="11.9" r="1" fill="#1b1612"/><circle cx="18.6" cy="8.3" r="1" fill="#1b1612"/></svg>';
const CN_COIN='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.6" fill="#ffc93c" stroke="#1b1612" stroke-width="2"/><circle cx="12" cy="12" r="4.8" fill="none" stroke="#c98a12" stroke-width="1.6"/><circle cx="9.4" cy="8.8" r="1.9" fill="#fff" opacity=".6"/></svg>';
const CN_GEM='<svg viewBox="0 0 24 24"><path d="M6.2 4.6h11.6l4 5L12 20.6 2.2 9.6z" fill="#6fd0ff" stroke="#1b1612" stroke-width="2" stroke-linejoin="round"/><path d="M2.4 9.6h19.2M9.2 4.8 7.6 9.6 12 20.2l4.4-10.6-1.6-4.8" fill="none" stroke="#1b1612" stroke-width="1.1" opacity=".45"/></svg>';
const CN_ESS='<svg viewBox="0 0 24 24"><path d="M12 2.6c4.1 5.2 6.6 8.6 6.6 12a6.6 6.6 0 0 1-13.2 0c0-3.4 2.5-6.8 6.6-12z" fill="#9fe06a" stroke="#1b1612" stroke-width="2"/><path d="M9 14.6a3.1 3.1 0 0 0 2.5 3" stroke="#fff" stroke-width="1.7" fill="none" opacity=".7" stroke-linecap="round"/></svg>';
const CN_MOON='<svg viewBox="0 0 24 24"><path d="M15.5 3.2A9 9 0 1 0 20.8 16 7.2 7.2 0 0 1 15.5 3.2z" fill="#e5484d" stroke="#1b1612" stroke-width="2" stroke-linejoin="round"/></svg>';
// the planks a run brings: 2 for each room (or floor) passed, 20 more for the custode; the Incubo none
function cnPlanks(win){if(G.cnInc)return 0;const T=G.cnTw,N=T?T.plan.length:ROOMS,passed=win?N:Math.max(0,(T?(T.f||1):(G.room||1))-1);return Math.round(20*passed/N)+(win?20:0)}
// the prizes of the road, a quarter of the bridge each (as the trophy road of Clash Royale): on the first rock a sack of gold, on the second
// crystals (essence of moss every other bridge), on the third a chest, where the bridge ends a better chest
const cnBrTh=(i,j)=>Math.round(cnBrNeed(i)*j/4);
function cnBrPrize(i,j){if(j===1)return{k:'oro',n:120+40*i};if(j===2)return i%2?{k:'ess',n:10+4*i}:{k:'gem',n:6+2*i};
  if(j===3)return{k:'cassa',t:i<2?'legno':i<6?'argento':'oro'};return{k:'cassa',t:i<3?'argento':i<7?'oro':'cristallo'}}
const cnPrizeTxt=p=>p.k==='oro'?`${p.n} oro`:p.k==='gem'?`${p.n} cristalli`:p.k==='ess'?`${p.n} Essenza di muschio`:CHESTS[p.t].n;
const cnPrizeIco=p=>p.k==='oro'?CN_COIN:p.k==='gem'?CN_GEM:p.k==='ess'?CN_ESS:chestSVG(p.t,false);
const cnPrizeCol=p=>p.k==='oro'?'#ffd84a':p.k==='gem'?'#8fe0ff':p.k==='ess'?'#b8f07a':({legno:'#e8c08a',argento:'#d8e6f2',oro:'#ffd84a',cristallo:'#9fe6ff'})[p.t]||'#ffd84a';
// a prize goes in the save as soon as the run ends (the show only shows it): a chest in a free post (or the fifth, or gold when they are full)
function cnPrizeGive(p){if(p.k==='oro')SAVE.gold+=p.n;else if(p.k==='gem')SAVE.gems=(SAVE.gems||0)+p.n;
  else if(p.k==='ess'){if(!SAVE.mat)SAVE.mat={ess:0,rot:0};SAVE.mat.ess=(SAVE.mat.ess||0)+p.n}else p.res=earnChest(p.t,true);return p}
// what a run brings to the bridge from its island: the planks, the prizes they reach, the show for the menu (and, until the show opens them,
// the prizes' gold, crystals and chests kept off the counters and the posts)
function cnBridgeAdd(a,win){const S=cnS(),nx=ARENAS[a+1];if(!nx||S.all)return'';const need=cnBrNeed(a),had=Math.min(need,S.br[a]||0);if(had>=need)return'';
  const st=cnPlanks(win);if(st<=0)return'';const now=Math.min(need,had+st),done=now>=need,got=[];S.br[a]=now;
  for(let j=1;j<=4;j++){const th=cnBrTh(a,j);if(had<th&&now>=th)got.push(Object.assign({j},cnPrizeGive(cnBrPrize(a,j))))}
  const pend={gold:0,gems:0,slots:[]};for(const p of got){if(p.k==='oro')pend.gold+=p.n;else if(p.k==='gem')pend.gems+=p.n;else if(p.res){if(p.res.full)pend.gold+=p.res.gold||0;else if(p.res.slot!=null)pend.slots.push(p.res.slot)}}
  CN.brAnim={i:a,from:cnBrLaid(a,had),to:cnBrLaid(a,now),done,got,pend};if(done)S.pick=a+1;
  return`<div class="cnBridge${done?' done':''}">${CN_PLANK}<span>${done?`Il ponte è finito! <b>${nx.n}</b> è aperta`:`Ponte verso <b>${nx.n}</b> · +${st} assi`}</span><i><em style="width:${Math.round(now/need*100)}%"></em></i><small>${now}/${need}</small></div>`+
    got.map(p=>`<div class="cnPrizeL">${cnPrizeIco(p)}<span>${p.j<4?'Premio del ponte':'Premio di fine ponte'}: <b>${cnPrizeTxt(p)}</b>${p.res&&p.res.full?` · i posti sono pieni: ${p.res.gold} oro`:p.res&&p.res.fifth?' · nella quinta':''}</span></div>`).join('')}
// ------------------------------------------------ the bridge's shape along the path (n from island i's middle, e across, z up)
// Denis, 27 ottobre: «nel ponte non fare le piccole isolette di mezzo ma un ponte più grande ed quindi anche isola ecc più grandi. le
// ricompense saranno a sinistra»: one bridge from the gate to the next island, no rocks in the middle, wider, hung from two big cables.
// hw half the deck, pd a plank along the path, pt its thickness, sag how much the deck hangs in the middle, Ns the planks of a quarter (the
// prizes are a quarter apart), pe where the hand ropes, the cables and the towers stand across, gate the towers' height (the cables leave
// from their tops), stump the anchors on the next island, rail0 / rail1 the hand ropes' height at the two ends and rdip how much more they
// hang; bal how far left the middle of a prize's balcony is, bw / bd its half width across and half depth along the path. Since «fallo
// ancora meglio il ponte» (27 ottobre): the planks lie on two beams with a cross beam every four planks (the frame waits for the planks), the
// railing stands on posts (pp across, ph high) with its ropes hanging between them, some posts carry a lantern that lights up once the planks
// have passed it, the cables carry little flags of the arena the bridge leads to, and the world of the island dresses it (CN_BRW)
const CNB={hw:42,pd:11.8,pt:2,sag:16,Ns:16,pe:48,pp:47,ph:24,je:51,lo:7,gate:106,stump:26,rail0:30,rail1:22,rdip:6,bal:70,bw:26,bd:21};
const CN_WOOD=['#a87a48','#97693b','#b88c58','#8d6238'];
// the bridge as the world of the island it leaves from makes it: its wood, its planks, its ropes, its stones (1 moss, 2 the volcano's
// charred wood, 3 the swamp's, 4 the bleached and frosty wood of the ice)
const CN_BRW=[null,
  {wood:'#7a5634',plank:CN_WOOD,rope:'#c9a46a',cable:'#b38a52',stone:'#9a9686'},
  {wood:'#4e3a2e',plank:['#8a6448','#7a5638','#94704e','#6e4a30'],rope:'#b8905e',cable:'#a07a4c',stone:'#5e5254'},
  {wood:'#6a5434',plank:['#a07a4a','#8c6a3e','#aa8656','#82623a'],rope:'#c2a066',cable:'#a8844e',stone:'#7a7a62'},
  {wood:'#7c6a5a',plank:['#bca688','#ab9474','#c8b398','#9e8a6c'],rope:'#dccba8',cable:'#c4ac84',stone:'#b8c8d8'}];
const cnBrW=i=>CN_BRW[Math.max(1,Math.min(4,(ARENAS[i]&&ARENAS[i].ch)||1))];
const CN_NA=Math.atan2(CNI_NV[1],CNI_NV[0]);   // the north of the path in the islands' own coordinates (a box laid along the path)
function cnBrGeo(i){const C=ISL.geo||(ISL.geo={});if(C[i])return C[i];
  const a0=cnIslRim(i,true)-3,a1=CNI_GAP-cnIslRim(i+1,false)+3,len=a1-a0,N=4*CNB.Ns;
  return C[i]={a0,a1,len,N,pitch:len/N,Z:[1,2,3].map(j=>a0+len*j/4)}}
// the deck's height: one long hang from the gate to the next island, flat on the islands
function cnDeckZ(G0,n){return n>G0.a0&&n<G0.a1?-CNB.sag*Math.sin(Math.PI*(n-G0.a0)/G0.len):0}
function cnPlankN(G0,g){return G0.a0+(g+.5)*G0.pitch}
// the hand ropes: tied to the towers and to the anchors, hanging a little more than the deck; the cables: from the towers' tops down to
// the hand ropes, which they reach toward the far end
function cnRailZ(G0,n){const u=clamp((n-G0.a0)/G0.len,0,1);return cnDeckZ(G0,n)+plerp(CNB.rail0,CNB.rail1,u)-CNB.rdip*Math.sin(Math.PI*u)}
function cnCableZ(G0,n){const u=clamp((n-G0.a0)/G0.len,0,1);return cnDeckZ(G0,n)+CNB.ph+3+(CNB.gate-CNB.ph-3)*Math.pow(1-u,2.2)}
const cnCableE=(G0,n)=>{const u=clamp((n-G0.a0)/G0.len,0,1);return plerp(CNB.pe,CNB.pp,Math.min(1,u*2.5))};
// the posts of the railing (a post every four planks, not at the ends: the towers and the anchors; on the left none where a balcony opens),
// and the lanterns: on the right every other post (on the left the balconies' lanterns light it: their arches would cover any there), two on
// each balcony's arch; each one lit once the planks reach it (g)
function cnBrPosts(G0){if(G0.posts)return G0.posts;const P=[];for(let j=1;j<16;j++){const n=G0.a0+4*j*G0.pitch;P.push({n,e:CNB.pp,j,lamp:j%2===0});if(j%4)P.push({n,e:-CNB.pp,j,lamp:false})}return G0.posts=P}
function cnBrLamps(G0){if(G0.lamps)return G0.lamps;const L=[];
  for(const p of cnBrPosts(G0))if(p.lamp)L.push({n:p.n,e:p.e+Math.sign(p.e)*CNB.lo,z:CNB.ph-9.2,g:4*p.j,post:1});
  G0.Z.forEach((c,b)=>{for(const e of[-CNB.bal+CNB.bw-4,-CNB.bal-CNB.bw+2.5])L.push({n:c+CNB.bd-2.5,e,z:45,g:(b+1)*CNB.Ns})});
  return G0.lamps=L}
// the planks in place with `have` of the bridge's: Ns for each quarter
function cnBrLaid(i,have){let n=0;for(let j=0;j<4;j++){const a=cnBrTh(i,j),b=cnBrTh(i,j+1);n+=Math.floor(CNB.Ns*clamp((have-a)/(b-a),0,1)+1e-9)}return n}
// the planks the bridge shows now: all of them with the preview's «all the arenas» open, the show's while it runs
function cnBrLaidNow(i){const A=ISL.brA;if(A&&A.i===i)return A.k;if(cnS().all||cnBrDone(i))return 4*CNB.Ns;return cnBrLaid(i,cnBrHave(i))}
// the j-th prize of bridge i taken (gone from its balcony)? not before the show has opened it
function cnPrizeTaken(i,j){const A=ISL.brA;if(A&&A.i===i){const g=A.got.find(p=>p.j===j);if(g)return!!g.shown}return!!cnS().all||cnBrHave(i)>=cnBrTh(i,j)}
// what an island looks like during the show: the next one stays dark until the last plank is in
const cnOpenShown=i=>{const A=ISL.brA;if(A&&A.done&&i===A.i+1&&!A.lit)return false;return cnOpen(i)};
// the bridge on the screen: the camera's real perspective (cnPathAt), a little mended so that both its ends sit right on the islands' edges
// (an island is one picture of one size all over, the perspective is not: the difference is spread along the whole bridge, a few in a hundred);
// beyond its ends the islands' own pictures
function cnBrMap(i,L,t,nob){const G0=cnBrGeo(i),A=cnPathAt(i,0,L,t,nob),B=cnPathAt(i,CNI_GAP,L,t,nob),pa=cnPathAt(i,G0.a0,L,t,nob),pb=cnPathAt(i,G0.a1,L,t,nob),
    dA=A.y-.55*G0.a0*A.k-pa.y,dB=B.y-.55*(G0.a1-CNI_GAP)*B.k-pb.y,rA=A.k/pa.k-1,rB=B.k/pb.k-1;
  const at=n=>{if(n<=G0.a0)return{x:A.x,y:A.y-.55*n*A.k,k:A.k};if(n>=G0.a1)return{x:B.x,y:B.y-.55*(n-CNI_GAP)*B.k,k:B.k};
    const u=(n-G0.a0)/G0.len,p=cnPathAt(i,n,L,t,nob);return{x:p.x,y:p.y+dA+(dB-dA)*u,k:p.k*(1+rA+(rB-rA)*u)}};
  const W=nob?null:cnSwayFn(i,G0,t);
  return{G:G0,A,B,at,sw:!!W,S:W?(n,e,z)=>{const p=at(n),o=W(n);return[p.x+(e+o[0])*p.k,p.y-((z||0)+o[1])*p.k]}:(n,e,z)=>{const p=at(n);return[p.x+e*p.k,p.y-(z||0)*p.k]},K:n=>at(n).k}}
// the bridge under the hero (Denis: «il ponte che oscilla e scricchiola quando l'eroe ci corre sopra»): while he runs over it the planks
// give under his feet and the whole bridge swings sideways and a little up and down, most in its middle and not at all where it is tied;
// after him it settles in a few seconds. ISL.sw: which bridge, how much it swings (a), how much it gives under him (b), where he is (h).
// While it moves the bridge is painted alive (it does not go into its picture)
const Z2=[0,0];
function cnSwayFn(i,G0,t){const S=ISL.sw;if(!S||S.i!==i)return null;const se=S.a*4.2*Math.sin(t*3.3),sz=S.a*1.3*Math.sin(t*4.1+1),dip=S.b*6,h=S.h;
  return n=>{const u=(n-G0.a0)/G0.len;if(u<=0||u>=1)return Z2;const env=Math.sin(Math.PI*u),q=(n-h)/80;return[se*env,(sz-dip*Math.exp(-q*q))*env]}}
function cnSwayStep(dt){const J=ISL.jump;let on=null;
  if(J&&J.way){const W=J.way,dd=cnWayDD(J),p=cnWayAt(W,dd),G0=cnBrGeo(W.lo);
    if(p[0]>G0.a0+4&&p[0]<G0.a1-4){on={i:W.lo,h:p[0]};
      // his feet on the planks (two to a turn of his run, as cnIslHero moves his legs), and now and then the wood creaking under him
      const st=Math.floor(dd*.046*Math.min(1,300/Math.max(1,W.len/J.dur))/Math.PI);if(J.st!==st){if(J.st!=null)cnBrSnd('passo');J.st=st}
      J.cr=(J.cr==null?.2:J.cr)-dt;if(J.cr<=0){J.cr=.45+Math.random()*.6;cnBrSnd('scricchiola')}}}
  let S=ISL.sw;if(!on&&!S)return;
  if(on&&(!S||on.i!==S.i))S=ISL.sw={i:on.i,a:0,b:0,h:on.h};
  if(on)S.h=on.h;
  S.a+=((on?1:0)-S.a)*Math.min(1,dt*(on?2.2:1.1));S.b+=((on?1:0)-S.b)*Math.min(1,dt*(on?7:5));
  if(!on&&S.a<.03&&S.b<.01)ISL.sw=null}
// the wind over the abyss (Denis: «Ponte vivo»): a breeze all the time and, every eleven seconds or so, a gust that comes and goes (0..1);
// none with the effects down (LOWFX)
function cnWind(t){if(LOWFX)return 0;const ph=(t+3)/11,u=ph-Math.floor(ph);return .42+.58*(u<.3?Math.pow(Math.sin(u/.3*Math.PI),2):0)}
// a thing on the bridge (a balcony, a prize) drawn in the bridge's own perspective (its far half a little smaller and squeezed, as the
// planks): the islands' camera (cnV) with its points carried through the bridge's map, in units of the place c along the path
function cnPlatView(M,c){const V=cnV(),o=M.S(c,0,0),k=M.K(c);
  return{k,o,L:cnLt(),V0:{c:V.c,s:V.s,D:V.D,F:V.F,P:(x,y,z)=>{if(Array.isArray(x)){z=x[2];y=x[1];x=x[0]}const q=M.S(c-(x*V.s+y*V.c),x*V.c-y*V.s,z||0);return[(q[0]-o[0])/k,(q[1]-o[1])/k]}}}}
// a face of the bridge turned to [north, east, up] in the light (as pShade)
const cnBrSh=(nn,ne,nz,col)=>{const L=cnLt(),n=C3.nrm([nn*CNI_NV[0]+ne*CNI_EV[0],nn*CNI_NV[1]+ne*CNI_EV[1],nz]),l=C3.dot(n,L);return l>=0?C3.lt(col,.3*l):C3.dk(col,-.5*l)};
const cnQ=(p,fill,lw,ink)=>{C3.poly(p);ctx.fillStyle=fill;ctx.fill();if(lw>0){ctx.strokeStyle=ink||INK;ctx.lineWidth=lw;ctx.stroke()}};
// ------------------------------------------------ the bridge painted: with the camera still once in a picture of its own and copied; the
// lanterns' lights, the prizes and the show alive on top. Since «Ponte vivo» (27 ottobre) the picture of a bridge that is alive (not in the
// dark, effects not down) holds its deck only: its ropes, its cables with their flags, the banners of the balconies, what hangs from its
// sides and its lanterns move in the wind and are drawn over it every frame (cnBrRopes, with the picture's own camera: no bob of their own,
// they sit exactly on its posts); while the bridge swings under the hero all of it is drawn alive
function cnIslBridge(i,L,t){if(!ARENAS[i+1])return;const M=cnBrMap(i,L,t),d=L.dpr;
  const foot=M.S(M.G.a0,0,0),far=M.S(M.G.a1,0,80);if(far[1]>L.H+30*d||foot[1]<-60*d)return;
  const S=cnS(),an=ISL.brA&&ISL.brA.i===i,alive=cnOpenShown(i)||!!S.all,still=!an&&!ISL.drag&&!M.sw,
    key=ISL.view.toFixed(4)+'|'+L.k.toFixed(3)+'|'+L.W+'x'+L.H+'|'+[cnBrLaidNow(i),cnOpenShown(i),!!S.all,LOWFX].join(),C=(ISL.bc||(ISL.bc={}))[i];
  if(still&&!(C&&C.key===key)&&ISL.pv===ISL.view)cnBrBake(i,L,t,key,alive&&!LOWFX);
  const B=ISL.bc[i];
  if(still&&B&&B.key===key){const bob=Math.sin(t*.9)*2.2*d*(M.A.f+M.B.f)/2;ctx.drawImage(B.cv,B.x,B.y+bob);
    if(B.deck){ctx.save();ctx.translate(0,bob);cnBrPaint(i,L,t,cnBrMap(i,L,t,true),'ropes');ctx.restore()}}
  else cnBrPaint(i,L,t,M);
  if(alive)cnBrWisps(i,L,t,M);
  cnBrLive(i,L,t,M)}
function cnBrBake(i,L,t,key,deck){const M=cnBrMap(i,L,t,true),G0=M.G,d=L.dpr,pts=[],wl=CNB.bal+CNB.bw+12,wr=CNB.pe+12;
  for(let q=0;q<=10;q++){const n=plerp(G0.a0-6,G0.a1+6,q/10),z=cnDeckZ(G0,n),hz=cnCableZ(G0,n)+10;pts.push(M.S(n,-wl,z-36),M.S(n,wr,z-36),M.S(n,-wl,z+50),M.S(n,-wr,hz),M.S(n,wr,hz))}
  const x0=Math.max(0,Math.floor(Math.min(...pts.map(p=>p[0])))),x1=Math.min(L.W,Math.ceil(Math.max(...pts.map(p=>p[0])))),y0=Math.max(-20*d,Math.floor(Math.min(...pts.map(p=>p[1]))-8*d)),y1=Math.min(L.H+20*d,Math.ceil(Math.max(...pts.map(p=>p[1]))+14*d));
  if(x1-x0<4||y1-y0<4)return;const old=ISL.bc[i],cv=old&&old.cv.width===x1-x0&&old.cv.height===y1-y0?old.cv:document.createElement('canvas');cv.width=x1-x0;cv.height=y1-y0;
  const keep=ctx;ctx=cv.getContext('2d');try{ctx.setTransform(1,0,0,1,-x0,-y0);cnBrPaint(i,L,t,M,deck?'deck':'all')}catch(err){cnErr(err)}finally{ctx=keep}ISL.bc[i]={cv,x:x0,y:y0,key,deck}}
// far to near: the deck with the balconies of the prizes beside it, its ropes, the cables (the towers on the island and the anchors on the
// next one are in their pictures); part: 'deck' the deck only (the picture of a bridge alive), 'ropes' what moves in the wind, all of it
// without (in the wind only when it is alive)
function cnBrPaint(i,L,t,M,part){const S=cnS(),laid=cnBrLaidNow(i),dim=!cnOpenShown(i)&&!S.all,dk=c=>dim?cnMixC(c,'#06070c',.82):c;
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  try{if(part!=='ropes')cnBrDeck(i,M,laid,dk,dim);if(part!=='deck')cnBrRopes(i,M,laid,dk,dim,dim||LOWFX?null:t)}catch(err){cnErr(err)}finally{ctx.restore()}}
// a rope: its dark outline, its colour, a thin light along its top
function cnRope(p,k,w,col){C3.line(p);ctx.strokeStyle=INK;ctx.lineWidth=(w+1.5)*k;ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w*k;ctx.stroke();
  if(w>2){ctx.save();ctx.translate(-.3*k,-.45*k);C3.line(p);ctx.strokeStyle='rgba(255,246,220,.3)';ctx.lineWidth=.55*k;ctx.stroke();ctx.restore()}}
// a long rope in the bridge's perspective, thicker near and thinner far: its points [n, e, z] in pieces of four, the outline of all of them
// first, then the colour, then the light (so the joints do not show)
function cnRopeP(M,P,w,col,hl){const q=P.map(p=>M.S(p[0],p[1],p[2])),k=P.map(p=>M.K(p[0])),C=4,H=ISL.lay?ISL.lay.H:1e9,mg=20*(ISL.lay?ISL.lay.dpr:1),
    off=j=>{const e=Math.min(q.length-1,j+C);let lo=1e9,hi=-1e9;for(let m=j;m<=e;m++){lo=Math.min(lo,q[m][1]);hi=Math.max(hi,q[m][1])}return hi<-mg||lo>H+mg};
  for(const pass of[0,1,2]){if(pass===2&&(!hl||w<=2))break;ctx.strokeStyle=pass===0?INK:pass===1?col:'rgba(255,246,220,.3)';
    for(let j=0;j<q.length-1;j+=C){if(off(j))continue;const e=Math.min(q.length-1,j+C),kk=(k[j]+k[e])/2,dx=pass===2?-.3*kk:0,dy=pass===2?-.45*kk:0;
      ctx.lineWidth=pass===0?(w+1.5)*kk:pass===1?w*kk:.55*kk;ctx.beginPath();ctx.moveTo(q[j][0]+dx,q[j][1]+dy);for(let m=j+1;m<=e;m++)ctx.lineTo(q[m][0]+dx,q[m][1]+dy);ctx.stroke()}}}
// the deck, far to near: under it the cross bracing of the frame (where planks are missing it shows over the abyss), the cross beams (one
// every four planks, their ends out beyond the planks: the posts stand on them, the world hangs things from them) and the two long beams;
// then, far to near, the planks laid (the one the show is nailing without its nails yet) with what lies on their ends and the places of
// those to come, each balcony of a prize before the planks beside it, and at each cross beam what hangs from its left end and its posts with
// their dress; the railing's ropes hanging between the posts (the rest, which moves in the wind, is cnBrRopes). What is off the screen is not
// drawn
function cnBrDeck(i,M,laid,dk,dim){const G0=M.G,N=G0.N,Ns=CNB.Ns,hw=CNB.hw,pp=CNB.pp,ph=CNB.ph,je=CNB.je,a0=G0.a0,a1=G0.a1,A=ISL.brA&&ISL.brA.i===i?ISL.brA:null,
    W=cnBrW(i),ch=(ARENAS[i]&&ARENAS[i].ch)||1,wood=dk(W.wood),sd=i*5.3+1.7,dz=n=>cnDeckZ(G0,n),nj=j=>j<=0?a0:j>=16?a1:a0+4*j*G0.pitch,
    line=(f,m)=>{const P=[];for(let q=0;q<=m;q++)P.push(f(plerp(a0-3,a1+3,q/m)));return P};
  const xb=dk(C3.dk(W.wood,.42));
  ctx.strokeStyle=xb;ctx.lineCap='round';for(let j=15;j>=0;j--){if(laid>=4*j+4)continue;const na=nj(j),nb=nj(j+1),e=(j%2?1:-1)*(hw-6),a=M.S(nb,-e,dz(nb)-CNB.pt-7),c=M.S(na,e,dz(na)-CNB.pt-7);
    ctx.lineWidth=2.6*(M.K(na)+M.K(nb))/2;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(c[0],c[1]);ctx.stroke()}
  for(let j=15;j>=1;j--){const n=nj(j),z=dz(n)-CNB.pt-2.6;cnLogS(M,[n,-je,z],[n,je,z],3.4,dk(C3.dk(W.wood,.1)),false)}
  for(const s of[-1,1])cnLogP(M,line(n=>[n,s*(hw-3),dz(n)-CNB.pt-2.8],40),5.6,wood);
  // (on the left what hangs from the cross beams goes in its place, far to near: the balconies are in its way; the rest of the sides waits for
  // the cables, cnBrRopes)
  const PO=[];for(const p of cnBrPosts(G0))(PO[p.j]||(PO[p.j]=[])).push(p);
  const side=j=>{const n=nj(j),z0=dz(n),k=M.K(n);if(cnOff(M,n,-30,ph+8))return;
    if(!dim&&j%4&&j%4!==3)cnBrHang(M,n,-1,z0,ch,sd+j*1.7,dk);
    for(const p of PO[j]||[]){const s=Math.sign(p.e),top=z0+ph;cnLogS(M,[n,p.e,z0-CNB.pt-2.6],[n,p.e,top],3.6,wood,true);
      const q=M.S(n,p.e,top);ctx.fillStyle=dk(C3.lt(W.wood,.35));ctx.strokeStyle=INK;ctx.lineWidth=.8*k;ctx.beginPath();ctx.ellipse(q[0],q[1],2.1*k,1*k,0,0,TAU);ctx.fill();ctx.stroke();
      if(!dim)cnBrDressPost(q[0],q[1],k,ch,sd+p.j*1.3+(s>0?.5:0),dk,M.S(n,p.e,z0+ph*.45))}};
  let b=2,jj=15;
  for(let g=N-1;g>=0;g--){const nc=cnPlankN(G0,g);while(b>=0&&nc<G0.Z[b]+CNB.bd){if(!cnOff(M,G0.Z[b],-30,60))cnBalcony(i,M,b,laid>=(b+1)*Ns,dk,dim);b--}
    while(jj>=1&&nc<nj(jj)){side(jj);jj--}
    if(cnOff(M,nc,-8,6))continue;
    const bn=A&&A.bn[g];
    if(g<laid){const P=cnPlankAt(G0,g,bn?2.2*Math.max(0,1-bn.t/(CN_SHOW.bnc*A.sp*.45)):0);cnPlankDraw(M,P,dk(W.plank[Math.floor(prH(g,i+2)*4)%4]),!bn||bn.nail,1);
      if(!dim&&!bn)cnBrTuft(M,G0,g,ch,sd,dk)}
    else if(!dim)cnPlankGhost(M,cnPlankAt(G0,g,0))}
  while(b>=0){if(!cnOff(M,G0.Z[b],-30,60))cnBalcony(i,M,b,laid>=(b+1)*Ns,dk,dim);b--}
  while(jj>=1){side(jj);jj--}
  // the ropes of the railing: from the tower down to each post's top and on to the anchors, hanging between them; a thinner one halfway
  for(const s of[-1,1])for(const[f,w,sg] of[[1,2.7,2.8],[.5,1.5,1.8]]){const T=[[a0-3,s*CNB.pe,CNB.rail0*f]];
    for(const p of cnBrPosts(G0))if(p.e*s>0)T.push([p.n,s*pp,dz(p.n)+ph*f]);T.push([a1+3,s*CNB.pe,CNB.rail1*f]);
    const R=[T[0]];for(let j=1;j<T.length;j++){const a=T[j-1],c=T[j],sag=sg*Math.min(2.2,(c[0]-a[0])/(4*G0.pitch));for(const u of[.25,.5,.75])R.push([plerp(a[0],c[0],u),plerp(a[1],c[1],u),plerp(a[2],c[2],u)-sag*Math.sin(Math.PI*u)]);R.push(c)}
    cnRopeP(M,R,w,dk(W.rope),w>2);
    if(!dim&&ch===4&&f===1)cnBrSnowRope(M,R,sd+s)}}
// a piece of the bridge at n (from z0 to z1 high) all off the screen? (with a margin)
function cnOff(M,n,z0,z1){const H=ISL.lay?ISL.lay.H:1e9,m=30*(ISL.lay?ISL.lay.dpr:1);return M.S(n,0,z0)[1]<-m||M.S(n,0,z1)[1]>H+m}
// what moves in the wind (Denis: «Bandierine e stendardi che sventolano, lanterne che dondolano piano, […] il vento sulle funi»), over the
// deck: the banners of the balconies and their ropes up to the cable; the hangers from the cables down to the posts' tops, the cables, heavy,
// swinging slowly, and their little flags flapping; what hangs out of the sides (on the right all of it, on the left where the balconies
// leave room) swaying, and the lanterns on their iron arms (out of the railing: its ropes do not cross them) swinging gently. (The railing's
// ropes, tied to their posts every few planks, stay with the deck: from this camera they would move too little to be seen.) (From this camera the near part of the cables, high and wide, passes over what hangs from the far sides though it is
// not in front of it: that is why the sides come after the cables.) t: the time of the wind (null: still)
function cnBrRopes(i,M,laid,dk,dim,t){const G0=M.G,pp=CNB.pp,ph=CNB.ph,a0=G0.a0,a1=G0.a1,W=cnBrW(i),ch=(ARENAS[i]&&ARENAS[i].ch)||1,sd=i*5.3+1.7,dz=n=>cnDeckZ(G0,n),
    wv=t==null?0:cnWind(t),
    cab=(n,s)=>{const u=clamp((n-a0)/G0.len,0,1),e0=s*cnCableE(G0,n),z0=cnCableZ(G0,n);if(!wv)return[n,e0,z0];const e=Math.sin(Math.PI*u);
      return[n,e0+wv*2.6*e*Math.sin(t*.9+s*1.3+u*1.6),z0+wv*1.2*e*Math.sin(t*.75+s+u*2.2)]};
  for(let b=2;b>=0;b--)if(!cnOff(M,G0.Z[b],0,90))cnBalCloth(i,M,b,dk,t,wv,cab);
  for(const s of[-1,1]){ctx.strokeStyle=dk('#4e3e28');
    for(const p of cnBrPosts(G0)){if(p.e*s<0)continue;const tz=dz(p.n)+ph,q=cab(p.n,s);if(q[2]-tz<5||cnOff(M,p.n,tz,q[2]))continue;const k=M.K(p.n),a=M.S(q[0],q[1],q[2]),c=M.S(p.n,s*pp,tz);ctx.lineWidth=1.1*k;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(c[0],c[1]);ctx.stroke()}
    const C=[];for(let q=0;q<=48;q++)C.push(cab(plerp(a0-3,a1+3,q/48),s));cnRopeP(M,C,3.6,dk(W.cable),true);
    if(!dim)cnBrFlags(M,G0,s,i,dk,t,wv,cab)}
  for(let j=15;j>=1;j--){const n=a0+4*j*G0.pitch,z0=dz(n);if(cnOff(M,n,-34,ph+6))continue;
    if(!dim){if(j%4===3)cnBrHang(M,n,-1,z0,ch,sd+j*1.7,dk,t,wv);cnBrHang(M,n,1,z0,ch,sd+j*1.7+.5,dk,t,wv)}
    if(j%2===0)cnLamp2(M,n,1,z0,!dim&&laid>=4*j,dk,cnLampTh(i,n,1,t,wv))}}
// how far a lantern on its arm swings (radians): gently in the wind, more when the bridge swings under the hero
function cnLampTh(i,n,s,t,wv){if(t==null)return 0;const S=ISL.sw;return(wv||0)*.2*Math.sin(t*1.7+n*.045+s)+(S&&S.i===i?S.a*.22*Math.sin(t*3.3-.9):0)}
// a log seen from the bridge's camera between two of its points (both about as far): its dark outline, the wood, a light along its top
// (along its left, standing)
function cnLogS(M,p,q,w,col,up){const a=M.S(p[0],p[1],p[2]),b=M.S(q[0],q[1],q[2]),k=(M.K(p[0])+M.K(q[0]))/2;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.strokeStyle=INK;ctx.lineWidth=(w+1.6)*k;ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w*k;ctx.stroke();
  const dx=up?-.24*w*k:0,dy=up?0:-.24*w*k;ctx.beginPath();ctx.moveTo(a[0]+dx,a[1]+dy);ctx.lineTo(b[0]+dx,b[1]+dy);ctx.strokeStyle=C3.lt(col,.22);ctx.lineWidth=.3*w*k;ctx.stroke()}
// a long log along the bridge (thicker near, thinner far), in pieces of four points: the outline of all, then the wood, then its light
function cnLogP(M,P,w,col){const q=P.map(p=>M.S(p[0],p[1],p[2])),k=P.map(p=>M.K(p[0])),C=4,hl=C3.lt(col,.22);ctx.lineCap='round';ctx.lineJoin='round';
  for(const pass of[0,1,2]){ctx.strokeStyle=pass===0?INK:pass===1?col:hl;
    for(let j=0;j<q.length-1;j+=C){const e=Math.min(q.length-1,j+C),kk=(k[j]+k[e])/2,dy=pass===2?-.24*w*kk:0;ctx.lineWidth=pass===0?(w+1.6)*kk:pass===1?w*kk:.3*w*kk;
      ctx.beginPath();ctx.moveTo(q[j][0],q[j][1]+dy);for(let m=j+1;m<=e;m++)ctx.lineTo(q[m][0],q[m][1]+dy);ctx.stroke()}}}
// a lantern hanging from an iron arm out of a post (the arm with its strut, the hook, the roof, the cage with its little window lit or not, the
// cap under it; its light and its flame are drawn alive): out of the railing, so that its ropes do not cross it
function cnLamp2(M,n,s,z0,lit,dk,th){const k=M.K(n),ph=CNB.ph,pp=CNB.pp,a=M.S(n,s*pp,z0+ph-3),b=M.S(n,s*(pp+CNB.lo),z0+ph-1),c=M.S(n,s*pp,z0+ph-9),m=M.S(n,s*(pp+CNB.lo*.55),z0+ph-1.9);
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  for(const[w,col] of[[2.1,INK],[1.1,dk('#4a4444')]]){ctx.strokeStyle=col;ctx.lineWidth=w*k;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.moveTo(c[0],c[1]);ctx.lineTo(m[0],m[1]);ctx.stroke()}
  if(th){ctx.translate(b[0],b[1]);ctx.rotate(th);ctx.translate(-b[0],-b[1])}
  const x=b[0],y=b[1]+1.4*k,w=7.2*k,h=9*k,top=y+2.6*k;ctx.strokeStyle=INK;ctx.lineWidth=.9*k;ctx.beginPath();ctx.moveTo(b[0],b[1]);ctx.lineTo(x,y);ctx.stroke();
  ctx.lineWidth=1.1*k;ctx.beginPath();ctx.moveTo(x-w*.62,top);ctx.lineTo(x,y);ctx.lineTo(x+w*.62,top);ctx.closePath();ctx.fillStyle=dk('#3a3434');ctx.fill();ctx.stroke();
  ctx.fillStyle=dk('#2e2a2a');cnRR(x-w/2,top,w,h,1.3*k);ctx.fill();ctx.stroke();
  ctx.fillStyle=lit?'#ffd27a':dk('#4a4038');ctx.fillRect(x-w*.3,top+h*.14,w*.6,h*.66);if(lit){ctx.fillStyle='rgba(255,250,220,.9)';ctx.fillRect(x-w*.13,top+h*.2,w*.26,h*.3)}
  ctx.lineWidth=.7*k;ctx.beginPath();ctx.moveTo(x,top+h*.14);ctx.lineTo(x,top+h*.8);ctx.moveTo(x-w*.3,top+h*.47);ctx.lineTo(x+w*.3,top+h*.47);ctx.stroke();
  ctx.lineWidth=1*k;ctx.beginPath();ctx.moveTo(x-w*.42,top+h);ctx.lineTo(x+w*.42,top+h);ctx.lineTo(x+w*.2,top+h+1.4*k);ctx.lineTo(x-w*.2,top+h+1.4*k);ctx.closePath();ctx.fillStyle=dk('#3a3434');ctx.fill();ctx.stroke();
  ctx.restore()}
// the little flags of the arena the bridge leads to, hanging from the high part of the cables (cab: where the cable is, the wind's): in the
// wind they are pushed east (where it blows) and lifted, flapping, their edges bowing
function cnBrFlags(M,G0,s,i,dk,t,wv,cab){const ac=dk((ARENAS[i+1]||ARENAS[i]).col),cr=dk('#fff2d6'),n0=G0.a0+8,n1=G0.a0+G0.len*.42,F=[[],[]],H=ISL.lay?ISL.lay.H:1e9;let j=0;
  for(let n=n0;n<n1;n+=15,j++){const m=n+10,ca=cab(n,s),cb=cab(m,s),a=M.S(ca[0],ca[1],ca[2]-.5),b=M.S(cb[0],cb[1],cb[2]-.5),k=M.K(n);if(a[1]>H||b[1]<-12*k)continue;
    const fl=wv?Math.sin(t*7.3+j*1.9+s*2):0,push=wv*(4.6+1.6*fl),lift=wv*(2.4+1.1*fl),bow=wv*1.4*Math.sin(t*9.1+j*2.3),
      tip=[(a[0]+b[0])/2+push*k,(a[1]+b[1])/2+(8-lift)*k];
    F[j%2].push([a,b,tip,bow*k])}
  ctx.lineJoin='round';
  const path=L=>{ctx.beginPath();for(const[a,b,tip,bw] of L){ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.quadraticCurveTo((b[0]+tip[0])/2+bw,(b[1]+tip[1])/2,tip[0],tip[1]);ctx.quadraticCurveTo((a[0]+tip[0])/2-bw,(a[1]+tip[1])/2,a[0],a[1]);ctx.closePath()}};
  const k=M.K(n0);for(const c of[0,1]){if(!F[c].length)continue;path(F[c]);ctx.fillStyle=c?cr:ac;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8*k;ctx.stroke()}}
// what the world hangs from the ends of the cross beams, out beyond the planks where the ropes do not hide it: moss (1), a chain with a
// glowing coal (2), a vine with its leaves and a flower (3), icicles (4)
function cnBrHang(M,n,s,z0,ch,sd,dk,t,wv){const h=prH(3,sd);if(h<.2)return;const p=M.S(n,s*(CNB.je-.8),z0-CNB.pt-3.6),th=t!=null&&ch!==4?(wv||0)*.16*Math.sin(t*1.5+sd*2.1)+(ISL.sw?ISL.sw.a*.12*Math.sin(t*3.3-1.2):0):0;
  if(th){ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(th);ctx.translate(-p[0],-p[1])}
  cnBrHangAt(p,M.K(n),h,ch,sd,dk,s);if(th)ctx.restore()}
function cnBrHangAt(p,k,h,ch,sd,dk,s){
  if(ch===1){cnHang(p[0],p[1],(8+h*14)*k,k,dk('#4f8a34'),dk('#82b850'),sd);if(h>.7)cnHang(p[0]-s*1.8*k,p[1]-.3*k,(4+h*7)*k,k,dk('#5f9a3c'),dk('#9ad86a'),sd+2)}
  else if(ch===3)cnVine(p[0],p[1],(12+h*20)*k,k,sd,dk);
  else if(ch===4){const I=[[p[0],p[1],(7+h*12)*k,(2.6+h*1.2)*k],[p[0]-s*2.2*k,p[1]-.2*k,(4+h*6)*k,(1.9+h*.8)*k]];if(h>.5)I.push([p[0]+s*1.9*k,p[1]-.1*k,(3+h*5)*k,1.7*k]);cnIcicles(I)}
  else cnChainCoal(p[0],p[1],(6+h*9)*k,k,h,dk)}
// on the ends of some planks what the world leaves there: a cushion of moss (1), ash with an ember (2), a tuft of grass (3), a drift of snow (4)
function cnBrTuft(M,G0,g,ch,sd,dk){const h=prH(g,sd+7);if(h<.66)return;const s=prH(g,sd+8)<.5?-1:1,n=cnPlankN(G0,g)+(prH(g,sd+9)-.5)*3,p=M.S(n,s*(CNB.hw-.8),cnDeckZ(G0,n)+.2),k=M.K(n),x=p[0],y=p[1];
  ctx.strokeStyle=INK;ctx.lineWidth=.7*k;
  if(ch===1){ctx.fillStyle=dk('#4f8a34');ctx.beginPath();ctx.ellipse(x,y-.4*k,3*k,1.3*k,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=dk('#8cc860');ctx.beginPath();ctx.ellipse(x-.6*k,y-.9*k,1.4*k,.55*k,0,0,TAU);ctx.fill()}
  else if(ch===2){ctx.fillStyle=dk('#5e5658');ctx.beginPath();ctx.ellipse(x,y-.4*k,2.8*k,1.1*k,0,0,TAU);ctx.fill();if(h>.85){ctx.fillStyle='#ff9a40';ctx.beginPath();ctx.arc(x+.7*k,y-.7*k,.7*k,0,TAU);ctx.fill()}}
  else if(ch===3){ctx.lineCap='round';ctx.beginPath();for(const[dx,hh,lean] of[[-1.2,4.4,-.5],[0,6,.2],[1.1,4,.7]]){ctx.moveTo(x+dx*k,y);ctx.quadraticCurveTo(x+(dx+lean*.4)*k,y-hh*.6*k,x+(dx+lean*1.6)*k,y-hh*k)}
    ctx.strokeStyle=INK;ctx.lineWidth=1.6*k;ctx.stroke();ctx.strokeStyle=dk('#6fa040');ctx.lineWidth=.8*k;ctx.stroke()}
  else{ctx.fillStyle='rgba(120,150,190,.45)';ctx.beginPath();ctx.ellipse(x+s*.4*k,y+.3*k,3.2*k,1*k,0,0,TAU);ctx.fill();
    ctx.fillStyle='#eef7ff';ctx.beginPath();ctx.moveTo(x-3*k,y);ctx.quadraticCurveTo(x-2.2*k,y-1.5*k,x-.6*k,y-1.3*k);ctx.quadraticCurveTo(x+.6*k,y-2.1*k,x+1.8*k,y-1.1*k);ctx.quadraticCurveTo(x+3*k,y-.6*k,x+3.2*k,y);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.ellipse(x-.4*k,y-1.3*k,1.2*k,.35*k,0,0,TAU);ctx.fill()}}
function cnHang(x,y,len,k,c1,c2,sd){const sw=(prH(sd,3)-.5)*5*k;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+sw*1.6,y+len*.55,x+sw,y+len);
  ctx.strokeStyle=INK;ctx.lineWidth=2.8*k;ctx.stroke();ctx.strokeStyle=c1;ctx.lineWidth=1.6*k;ctx.stroke();ctx.fillStyle=c2;ctx.strokeStyle=INK;ctx.lineWidth=.8*k;ctx.beginPath();ctx.ellipse(x+sw,y+len,2.1*k,2.6*k,0,0,TAU);ctx.fill();ctx.stroke();
  ctx.fillStyle=c2;ctx.beginPath();ctx.ellipse(x,y+1*k,3.2*k,2*k,0,0,TAU);ctx.fill()}
function cnVine(x,y,len,k,sd,dk){const sw=(prH(sd,3)-.5)*6*k;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-sw,y+len*.35,x+sw*1.4,y+len*.7,x+sw*.5,y+len);
  ctx.strokeStyle=INK;ctx.lineWidth=2.4*k;ctx.stroke();ctx.strokeStyle=dk('#4f7a2e');ctx.lineWidth=1.3*k;ctx.stroke();
  ctx.strokeStyle=INK;ctx.lineWidth=.7*k;for(const odd of[1,0]){ctx.beginPath();for(let j=1;j<=3;j++){if(j%2!==odd)continue;const u=j/3.6,lx=x+(odd?-1:1)*2.6*k+sw*u,ly=y+len*u,r=(odd?-1:1)*.7;ctx.moveTo(lx+2.8*k*Math.cos(r),ly+2.8*k*Math.sin(r));ctx.ellipse(lx,ly,2.8*k,1.4*k,r,0,TAU)}
    ctx.fillStyle=dk(odd?'#6fa040':'#86b850');ctx.fill();ctx.stroke()}
  if(prH(sd,5)>.5){ctx.fillStyle=dk(prH(sd,6)>.5?'#ff8ad8':'#ffe066');ctx.strokeStyle=INK;ctx.lineWidth=.7*k;ctx.beginPath();ctx.arc(x+sw*.5,y+len,1.9*k,0,TAU);ctx.fill();ctx.stroke()}}
function cnIcicle(x,y,len,w){cnIcicles([[x,y,len,w]])}
// a few icicles together ([x, y, length, width], the first the biggest): their ice, their edge, the light down each
function cnIcicles(I){const w0=I[0][3];ctx.beginPath();for(const[x,y,len,w] of I){ctx.moveTo(x-w/2,y);ctx.lineTo(x+w/2,y);ctx.lineTo(x+w*.08,y+len);ctx.closePath()}
  ctx.fillStyle='#e2f4ff';ctx.fill();ctx.strokeStyle='#6f93b4';ctx.lineWidth=Math.max(.6,w0*.2);ctx.lineJoin='round';ctx.stroke();
  ctx.beginPath();for(const[x,y,len,w] of I){ctx.moveTo(x-w*.18,y+w*.3);ctx.lineTo(x-w*.02,y+len*.7)}ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=Math.max(.5,w0*.16);ctx.stroke()}
function cnChainCoal(x,y,len,k,h,dk){const n=Math.max(2,Math.round(len/(2.4*k)));ctx.lineWidth=.8*k;ctx.strokeStyle=INK;ctx.fillStyle=dk('#5a5050');
  ctx.beginPath();for(let j=0;j<n;j++){const cy=y+(j+.5)*len/n,rx=(j%2?.5:1.1)*k;ctx.moveTo(x+rx,cy);ctx.ellipse(x,cy,rx,1.3*k,0,0,TAU)}ctx.fill();ctx.stroke();
  const cy=y+len+1.6*k;if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,110,40',x,cy,7*k,.5);ctx.restore()}
  ctx.fillStyle=dk('#3a2a26');ctx.strokeStyle=INK;ctx.lineWidth=.9*k;ctx.beginPath();ctx.moveTo(x-2.2*k,cy-1.2*k);ctx.lineTo(x+1.6*k,cy-1.8*k);ctx.lineTo(x+2.4*k,cy+.8*k);ctx.lineTo(x,cy+2.1*k);ctx.lineTo(x-2.4*k,cy+.9*k);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=h>.5?'#ffb050':'#ff7a30';ctx.beginPath();ctx.moveTo(x-1.1*k,cy-.3*k);ctx.lineTo(x+.9*k,cy-.6*k);ctx.lineTo(x+.4*k,cy+1*k);ctx.closePath();ctx.fill()}
// on a post's top or along it: a cushion of moss (1), an ember (2), the vine round it with a flower (3), a cap of snow (4)
function cnBrDressPost(x,y,k,ch,sd,dk,mid){const h=prH(7,sd);
  if(ch===1&&h>.35){ctx.fillStyle=dk('#6fa040');ctx.strokeStyle=INK;ctx.lineWidth=.8*k;ctx.beginPath();ctx.ellipse(x,y-.4*k,2.8*k,1.6*k,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=dk('#9ad86a');ctx.beginPath();ctx.ellipse(x-.6*k,y-.9*k,1.2*k,.6*k,0,0,TAU);ctx.fill();
    if(h>.7){ctx.strokeStyle=dk('#5f9a3c');ctx.lineWidth=1.2*k;ctx.beginPath();ctx.moveTo(x+2*k,y);ctx.quadraticCurveTo(x+3.4*k,y+5*k,x+2.6*k,y+9*k);ctx.stroke()}}
  else if(ch===2&&h>.55){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,120,40',x,y-1*k,6*k,.6);ctx.restore();ctx.fillStyle='#ffb050';ctx.beginPath();ctx.ellipse(x,y-.3*k,1.5*k,.7*k,0,0,TAU);ctx.fill()}
  else if(ch===3){if(h>.3){ctx.strokeStyle=INK;ctx.lineWidth=2.2*k;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(mid[0]-2*k,mid[1]+3*k);ctx.lineTo(mid[0]+2*k,mid[1]-1*k);ctx.moveTo(mid[0]-2*k,mid[1]-4*k);ctx.lineTo(mid[0]+2*k,mid[1]-8*k);ctx.stroke();
      ctx.strokeStyle=dk('#5f9a3c');ctx.lineWidth=1.2*k;ctx.stroke()}if(h>.72){ctx.fillStyle=dk(h>.86?'#ff8ad8':'#ffe066');ctx.strokeStyle=INK;ctx.lineWidth=.7*k;ctx.beginPath();ctx.arc(x,y-1*k,1.8*k,0,TAU);ctx.fill();ctx.stroke()}}
  else if(ch===4){ctx.fillStyle='#f4fbff';ctx.strokeStyle='#8fb0cc';ctx.lineWidth=.7*k;ctx.beginPath();ctx.ellipse(x,y-.8*k,2.6*k,1.5*k,0,0,TAU);ctx.fill();ctx.stroke()}}
// snow lying on some stretches of the ice bridge's ropes
function cnBrSnowRope(M,R,sd){ctx.lineCap='round';for(let j=1;j<R.length;j++){if(prH(j,sd)<.55)continue;const a=M.S(R[j-1][0],R[j-1][1],R[j-1][2]),b=M.S(R[j][0],R[j][1],R[j][2]),k=M.K(R[j][0]);
  ctx.beginPath();ctx.moveTo(a[0],a[1]-1.2*k);ctx.lineTo(b[0],b[1]-1.2*k);ctx.strokeStyle='#f4fbff';ctx.lineWidth=1.7*k;ctx.stroke()}}
// a plank: its eight corners [n, e, z] (top 0-3, bottom 4-7: south-west, south-east, north-east, north-west) with its own little differences
// (a seed g), lying on the deck (lift: a little higher, the bounce of the one just landed) or in flight (o: middle, spin, roll)
function cnPlankAt(G0,g,lift,o){const nc=o?o.n:cnPlankN(G0,g),z0=o?o.z:cnDeckZ(G0,nc)+(prH(g,7)-.5)*.6+(lift||0),sl=o?0:(cnDeckZ(G0,nc+1)-cnDeckZ(G0,nc-1))/2;
  const L1=CNB.hw+1.5+prH(g,3)*2.2,L2=CNB.hw+1.5+prH(g,4)*2.2,hd=CNB.pd/2*(.9+prH(g,5)*.16),yaw=(prH(g,6)-.5)*.07+(o?o.spin:0),roll=o?o.roll:0,ec=o?o.e:0;
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cr=Math.cos(roll),sr=Math.sin(roll);
  const T=(u,v,w)=>{const v2=v*cr-w*sr,w2=v*sr+w*cr,n=u*cy-v2*sy,e=u*sy+v2*cy;return[nc+n,ec+e,z0+w2+n*sl]};
  return[T(-hd,-L1,0),T(-hd,L2,0),T(hd,L2,0),T(hd,-L1,0),T(-hd,-L1,-CNB.pt),T(-hd,L2,-CNB.pt),T(hd,L2,-CNB.pt),T(hd,-L1,-CNB.pt)]}
// its faces we see (a flying plank turns: whichever faces look at the camera), the grain on its top, two nails at each end
const CN_PLF=[[[0,1,2,3],'t'],[[4,5,1,0],'s'],[[2,6,7,3],'n'],[[7,6,5,4],'b'],[[1,5,6,2],'e'],[[3,7,4,0],'w']];
function cnPlankDraw(M,P,col,nails,a){const q=P.map(p=>M.S(p[0],p[1],p[2])),k=M.K(P[0][0]);ctx.save();if(a!=null&&a<1)ctx.globalAlpha*=a;
  const nrm=(f)=>{const A=P[f[0]],B=P[f[1]],C=P[f[2]],u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],v=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];return C3.nrm([u[2]*v[1]-u[1]*v[2],u[0]*v[2]-u[2]*v[0],u[1]*v[0]-u[0]*v[1]])};   // ([north, east, up] is a left hand: the outward normal is the other way)
  for(const[f,w] of CN_PLF){const n=nrm(f);if(-n[0]+.55*n[2]<=.02)continue;   // [north, east, up]: toward the camera is south and up
    const shade=cnBrSh(n[0],n[1],n[2],w==='t'||w==='b'?col:C3.dk(col,.18));cnQ(f.map(v=>q[v]),shade,.85*k,C3.dk(col,.62));
    if(w==='t'){ctx.strokeStyle='rgba(60,36,18,.32)';ctx.lineWidth=.55*k;const g0=P[0],g1=P[1],g3=P[3],g2=P[2],m=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
      ctx.beginPath();for(const u of[.32,.7]){const A=M.S(...m(g0,g3,u)),B=M.S(...m(g1,g2,u));ctx.moveTo(plerp(A[0],B[0],.06),plerp(A[1],B[1],.06));ctx.lineTo(plerp(A[0],B[0],.94),plerp(A[1],B[1],.94))}ctx.stroke();
      if(nails){ctx.fillStyle='#2a2420';for(const ue of[.07,.93])for(const un of[.28,.72]){const A=m(m(g0,g1,ue),m(g3,g2,ue),un),s=M.S(A[0],A[1],A[2]+.1);ctx.beginPath();ctx.arc(s[0],s[1],.55*k,0,TAU);ctx.fill()}}}}
  ctx.restore()}
// the place of a plank to come: its top drawn faint
function cnPlankGhost(M,P){const q=[P[0],P[1],P[2],P[3]].map(p=>M.S(p[0],p[1],p[2])),k=M.K(P[0][0]);C3.poly(q);ctx.fillStyle='rgba(255,236,200,.035)';ctx.fill();ctx.strokeStyle='rgba(255,236,200,.1)';ctx.lineWidth=.6*k;ctx.stroke()}
// ------------------------------------------------ a balcony of a prize, on the left of the bridge (Denis: «le ricompense saranno a sinistra»):
// a floor of four planks on two beams that come out from under the deck and two braces under its outer edge; a round stone step for the
// prize; at its back an arch of two posts with a lantern on each (lit when the planks have come) and the banner of the prize's colour; a
// railing on its outer and near sides; two ropes up to the cable while it is high enough. The prize on it is alive (cnPrizeLive)
function cnBalcony(i,M,b,reached,dk,dim){const G0=M.G,c=G0.Z[b],dz=cnDeckZ(G0,c),K=cnPlatView(M,c),{V0}=K,W=cnBrW(i),E=-CNB.bal,bw=CNB.bw,bd=CNB.bd,rh=15,ah=40,
    wood=dk(W.wood),pc=dk(cnPrizeCol(cnBrPrize(i,b+1))),lit=reached&&!dim,at=(n,e,z)=>cnChain(n,e,z);
  const C=[[bd-2.5,E+bw-4],[bd-2.5,E-bw+2.5],[-(bd-2.5),E-bw+2.5],[-(bd-2.5),E+bw-4]];
  ctx.save();ctx.translate(K.o[0],K.o[1]);ctx.scale(K.k,K.k);
  try{for(const dn of[bd-5,-(bd-5)]){C3.caps(V0,at(dn,E-bw+6,dz-4),1.9,at(dn,-CNB.hw+3,dz-22),1.7,wood,{lw:1.2,noRim:1});C3.caps(V0,at(dn,-CNB.hw+10,dz-5.5),2.6,at(dn,E-bw-2,dz-5.5),2.6,wood,{lw:1.4,kl:.3,kd:.5,noRim:1})}
    for(let j=3;j>=0;j--){const n=-bd+(j+.5)*bd/2;pBox(K,at(n,E,dz-3),bd/2-1.4,2*bw,3,dk(W.plank[(j+b+1)%4]),{a:CN_NA,lw:1.1,ew:.4})}
    pRound(K,at(0,E,dz),[[0,10.5],[1.6,10.5],[2.2,9.6],[3.2,9.6]],dk(cnMixC(W.stone,'#3e3a36',.35)),{m:16,lw:1.3,kl:.3,kd:.45});
    {const r=[];for(let q=0;q<20;q++){const a=q/20*TAU;r.push(V0.P(at(Math.cos(a)*7.2,E+Math.sin(a)*7.2,dz+3.25)))}C3.poly(r);ctx.strokeStyle=C3.lt(pc,.15);ctx.lineWidth=.9;ctx.stroke()}
    const parts=[],R=(n,e,f,o)=>parts.push({d:V0.D(at(n,e,0))+(o||0),f});
    for(const q of[0,1]){const[n,e]=C[q];R(n,e,()=>{C3.caps(V0,at(n,e,dz),2,at(n,e,dz+ah),1.8,wood,{lw:1.3,kl:.3,kd:.5,noRim:1});cnLantern(K,at(n,e,dz+ah+.5),lit)})}
    R(bd-4,E,()=>{const n=bd-2.5;C3.caps(V0,at(n,C[0][1],dz+ah-3),1.6,at(n,E,dz+ah+1.5),1.6,wood,{lw:1.2,noRim:1});C3.caps(V0,at(n,E,dz+ah+1.5),1.6,at(n,C[1][1],dz+ah-3),1.6,wood,{lw:1.2,noRim:1})},1);
    for(const q of[2,3]){const[n,e]=C[q];R(n,e,()=>C3.caps(V0,at(n,e,dz),1.8,at(n,e,dz+rh+1.6),1.6,wood,{lw:1.2,kl:.3,kd:.5,noRim:1}))}
    for(const[a,q] of[[1,2],[2,3]]){const p=C[a],r=C[q];R((p[0]+r[0])/2,(p[1]+r[1])/2,()=>C3.caps(V0,at(p[0],p[1],dz+rh),1.3,at(r[0],r[1],dz+rh),1.3,wood,{lw:1.1,noRim:1}))}
    pRun(parts)}
  catch(err){cnErr(err)}finally{ctx.restore()}
  if(!dim){const ch=(ARENAS[i]&&ARENAS[i].ch)||1,k=M.K(c-bd);for(const[e,j] of[[E-bw+5,0],[E-3,1],[E+bw-9,2]]){const h=prH(j+b*3,i*7.1+3);if(h<.3)continue;cnBrHangAt(M.S(c-bd+.4,e,dz-3.3),k,h*.8,ch,i*7.1+j+b*3,dk,-1)}}}
// the banner of a balcony's prize under its arch, and its two ropes from the arch up to the cable (cab: where the cable is in the wind)
function cnBalCloth(i,M,b,dk,t,wv,cab){const G0=M.G,c=G0.Z[b],dz=cnDeckZ(G0,c),K=cnPlatView(M,c),W=cnBrW(i),E=-CNB.bal,bw=CNB.bw,bd=CNB.bd,ah=40,n=bd-2.5,pc=dk(cnPrizeCol(cnBrPrize(i,b+1)));
  ctx.save();ctx.translate(K.o[0],K.o[1]);ctx.scale(K.k,K.k);
  try{cnCloth(K,(e,z,dn)=>cnChain(n-1.8-(dn||0),e,z),E,9,dz+ah-1.5,dz+16,dz+10,pc,t,wv,b*1.7+i,dz+ah-13,3)}catch(err){cnErr(err)}finally{ctx.restore()}
  for(const e of[E+bw-4,E-bw+2.5]){const nn=c+n,m=c+bd+10,top=cab(m,-1);if(top[2]-(dz+ah)<6)continue;
    cnRopeP(M,[[nn,e,dz+ah-2],[plerp(nn,m,.5),plerp(e,top[1],.5),plerp(dz+ah-2,top[2],.5)-1.5],top],1.1,dk(W.cable))}}
// a banner hanging from its top edge (in the view K, which the canvas is already in: at(e, z, dn) its points, dn toward you; e0 its middle,
// hw half its width, zt its top, zb its bottom at the sides, zn the notch of its swallowtail, its emblem a disc zs high and rs wide): in the
// wind its cloth is pushed east (where the wind blows) and ripples, a wave running down it (each band in its light as it turns); still
// without (t null)
function cnCloth(K,at,e0,hw,zt,zb,zn,col,t,wv,ph,zs,rs){const{V0}=K,R=4,off=[],rows=[];
  for(let r=0;r<=R;r++){const u=r/R;off.push(t!=null&&wv?wv*(2.4*u+1.7*Math.pow(u,1.3)*Math.sin(t*2.6-r*.95+ph)):0)}
  for(let r=0;r<=R;r++){const z=plerp(zt,zb,r/R);rows.push([V0.P(at(e0-hw+off[r],z)),V0.P(at(e0+hw+off[r],z))])}
  const notch=V0.P(at(e0+off[R],zn)),out=[];for(let r=0;r<=R;r++)out.push(rows[r][0]);out.push(notch);for(let r=R;r>=0;r--)out.push(rows[r][1]);
  const sh=pShade(K,[-CNI_NV[0],-CNI_NV[1],0],col);ctx.lineJoin='round';C3.poly(out);ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.stroke();
  for(let r=0;r<R;r++){const sl=off[r+1]-off[r],base=plerp(.1,-.16,(r+.5)/R),k=base-clamp(sl*.08,-.22,.22),c=k>=0?C3.lt(sh,k):C3.dk(sh,-k),q=r<R-1?[rows[r][0],rows[r][1],rows[r+1][1],rows[r+1][0]]:[rows[r][0],rows[r][1],rows[r+1][1],notch,rows[r+1][0]];
    C3.poly(q);ctx.fillStyle=c;ctx.fill();ctx.strokeStyle=c;ctx.lineWidth=.5;ctx.stroke()}
  C3.poly(out);ctx.strokeStyle=C3.dk(col,.6);ctx.lineWidth=.4;ctx.stroke();
  if(zs!=null){const u=clamp((zt-zs)/(zt-zb),0,1)*R,r0=Math.floor(u),o=plerp(off[r0],off[Math.min(R,r0+1)],u-r0);C3.spot(V0,at(e0+o,zs,.4),[-CNI_NV[0],-CNI_NV[1],0],rs,C3.lt(col,.42))}}
// a post of logs: a round log, its top cut (the wood's rings), the rope wound round it twice
function cnLogPost(K,b,h,wood,dim){const{V0}=K,tp=[b[0],b[1],b[2]+h];C3.caps(V0,b,3.6,tp,3.2,wood,{lw:1.6,kl:.3,kd:.5,rim:.2});
  const q=V0.P(tp);ctx.fillStyle=dim?'#3a2c20':'#c49a68';ctx.beginPath();ctx.ellipse(q[0],q[1],3.1,1.45,0,0,TAU);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();
  ctx.strokeStyle=dim?'#2a2016':'#8a6a44';ctx.lineWidth=.5;ctx.beginPath();ctx.ellipse(q[0],q[1],1.5,.7,0,0,TAU);ctx.stroke();
  for(const z of[h-7,h-3.6]){const c=V0.P([b[0],b[1],b[2]+z]);ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.beginPath();ctx.ellipse(c[0],c[1],3.9,1.6,0,0,Math.PI);ctx.stroke();ctx.strokeStyle=dim?'#4a3c2a':'#d8b878';ctx.lineWidth=1.3;ctx.stroke()}}
// an iron lantern: its cage with the little windows (lit or not), a roof (its light is drawn alive)
function cnLantern(K,c,lit){pBox(K,c,6,6,8,'#2e2a2a',{lw:1.3,face:(n,q,pts)=>{if(Math.abs(n[2])>.5)return;const m=pts.reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4],[0,0]);ctx.fillStyle=lit?'#ffd27a':'#4a4038';ctx.fillRect(m[0]-1.5,m[1]-2,3,4)}});
  pRound(K,[c[0],c[1],c[2]+8],[[0,4.6],[3,.5]],'#3a3434',{m:6,lw:1.2})}
// a pole with an arm (dir: toward the east, or the west) and the lantern hanging from it
function cnLampPole(K,b,wood,lit,dir){const{V0}=K,h=40,E=CNI_EV,sg=dir||-1,top=[b[0],b[1],b[2]+h],ae=[b[0]+sg*8*E[0],b[1]+sg*8*E[1],b[2]+h-3];
  C3.caps(V0,b,2.4,top,2,wood,{lw:1.4,kl:.3,kd:.5});C3.caps(V0,[b[0],b[1],b[2]+h-3],1.3,ae,1.1,wood,{lw:1.2,noRim:1});
  const c0=V0.P(ae),c1=V0.P([ae[0],ae[1],ae[2]-4]);ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(c0[0],c0[1]);ctx.lineTo(c1[0],c1[1]);ctx.stroke();
  cnLantern(K,[ae[0],ae[1],ae[2]-14],lit)}
// where a balcony's lantern shines (for the live light): [n, e, z] from the balcony's middle at the deck's height
// the gate of the bridge at the back of an island: two towers, each two logs bound with rope on a block of stone, a little roof with the flag
// of the arena it leads to, the banner of that arena on its front, a lantern on an arm outward, the cable over its top and down its front
// to a stake; two beams across (the lower one over the heads) and between them the board with the number of the next arena; in the
// island's picture, in its order (live: what moves in the wind is left out, cnPortalLive draws it)
function cnBrPortal(K,i,op,live){const{V0}=K,n=cnIslRim(i,true)-6,h=CNB.gate,pe=CNB.pe,W=cnBrW(i),ch=(ARENAS[i]&&ARENAS[i].ch)||1,wood=W.wood,stone=cnMixC(W.stone,'#8a8070',.15),A1=ARENAS[i+1],ac=A1?A1.col:'#c0392b',N=CNI_NV,at=(e,z,dn)=>cnChain(n+(dn||0),e,z);
  for(const s of[-1,1]){const e=s*pe;
    pBox(K,at(e,0),20,24,10,stone,{a:CN_NA,lw:1.6});cnPortalBase(K,ch,e,at,i);
    for(const de of[s*3.6,-s*3.6])C3.caps(V0,at(e+de,9),4.2,at(e+de,h),3.6,wood,{lw:1.7,kl:.3,kd:.5,rim:.2});
    if(ch===3)cnPortalVine(K,e,at,i+s);
    for(const z of[22,54,h-14]){const c=V0.P(at(e,z));ctx.strokeStyle=INK;ctx.lineWidth=2.8;ctx.beginPath();ctx.ellipse(c[0],c[1],8.4,2.4,0,0,Math.PI);ctx.stroke();ctx.strokeStyle='#d8b878';ctx.lineWidth=1.4;ctx.stroke()}
    pRound(K,at(e,h-1),[[0,9.6],[2.2,9.6],[2.4,8.6],[10,.6]],'#5a3e28',{m:8,lw:1.4,kl:.3,kd:.5});cnPortalRoof(K,ch,e,h,at,i+s);
    C3.caps(V0,at(e,h+8),.9,at(e,h+27),.8,'#3a2c20',{lw:1,noRim:1});
    if(!live){const f=[V0.P(at(e,h+27)),V0.P(at(e+s*15,h+22.5)),V0.P(at(e,h+18))];ctx.beginPath();ctx.moveTo(f[0][0],f[0][1]);ctx.quadraticCurveTo((f[0][0]+f[1][0])/2,f[0][1]+1.5,f[1][0],f[1][1]);ctx.quadraticCurveTo((f[1][0]+f[2][0])/2,f[2][1]-1,f[2][0],f[2][1]);ctx.closePath();
      ctx.fillStyle=ac;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.lineJoin='round';ctx.stroke()}
    C3.caps(V0,at(e+s*7,h-24),1.4,at(e+s*17,h-24),1.2,wood,{lw:1.2,noRim:1});if(!live)cnLantern(K,at(e+s*17,h-37),op);
    if(!live){const bn=[at(e-5.5,h-34,-4.8),at(e+5.5,h-34,-4.8),at(e+5.5,h-70,-4.8),at(e,h-62,-4.8),at(e-5.5,h-70,-4.8)];
      oFaces(K,[[[-N[0],-N[1],0],bn],[[N[0],N[1],0],bn.slice().reverse()]],ac,{lw:1.2,ew:.4});C3.spot(V0,at(e,h-48,-5.2),[-N[0],-N[1],0],2.4,C3.lt(ac,.35))}
    const st=at(e+s*4,0,-26);C3.caps(V0,st,2.2,[st[0],st[1],st[2]+7],1.8,wood,{lw:1.2,noRim:1});if(!live)cnRope([V0.P(at(e,h+1,-2)),V0.P(at(e+s*2,h*.5,-14)),V0.P([st[0],st[1],st[2]+6])],1,2.8,W.cable)}
  for(const[z,r,w] of[[h-4,3.8,10],[h-30,3,7]])C3.caps(V0,at(-pe-w,z),r,at(pe+w,z),r,wood,{lw:1.8,kl:.3,kd:.5,rim:.2});cnPortalBeams(K,ch,pe,h,at,i);
  for(const s of[-1,1])for(const z of[h-4,h-30]){const q=V0.P(at(s*pe,z,-4));ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(q[0]-2.6,q[1]-4);ctx.lineTo(q[0]+2.6,q[1]+4);ctx.moveTo(q[0]+2.6,q[1]-4);ctx.lineTo(q[0]-2.6,q[1]+4);ctx.stroke();
    ctx.strokeStyle='#d8b878';ctx.lineWidth=1.1;ctx.stroke()}
  // the board with the number of the arena it leads to, hanging from the top beam by two ropes
  if(A1){for(const s of[-1,1]){const a=V0.P(at(s*10,h-5,-4.6)),b=V0.P(at(s*10,h-12,-4.6));ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.strokeStyle='#d8b878';ctx.lineWidth=.8;ctx.stroke()}
    pBox(K,at(0,h-26,-4.6),2.4,30,14,'#8a6238',{a:CN_NA,lw:1.4});
    const q=V0.P(at(0,h-19.5,-6));ctx.save();ctx.font='11px "Lilita One", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=3;ctx.strokeStyle=INK;
    const t=String(i+2);ctx.strokeText(t,q[0],q[1]+.6);ctx.fillStyle=ac;ctx.fillText(t,q[0],q[1]+.6);
    for(const s of[-1,1]){ctx.fillStyle=ac;ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0]+s*8,q[1]-2.4);ctx.lineTo(q[0]+s*10.4,q[1]);ctx.lineTo(q[0]+s*8,q[1]+2.4);ctx.lineTo(q[0]+s*5.6,q[1]);ctx.closePath();ctx.fill();ctx.stroke()}ctx.restore()}}
// the towers as their world dresses them: moss on the stone and on the roof, hanging from the beams (1); the stone cracked by the heat with the
// fire inside, the roof's tip black with soot (2); a vine climbing the logs and hanging from the roof and the beams (3); snow on the stone, on
// the roof and on the beams, icicles under them (4)
function cnPortalBase(K,ch,e,at,sd){const{V0}=K;
  if(ch===4)pBox(K,at(e,10),20.8,24.8,1.5,'#eef6ff',{a:CN_NA,lw:1.1});
  else if(ch===1||ch===3){pBox(K,at(e,10),20.4,24.4,1.1,ch===1?'#5f9a3c':'#5a6e34',{a:CN_NA,lw:1.1});
    for(const[de,l] of[[-7,4],[-1,6],[6,3.5]]){const p=V0.P(at(e+de,10.4,-10.3));cnHang(p[0],p[1],l+prH(de,sd)*3,1,ch===1?'#4f8a34':'#4a6a2a',ch===1?'#82b850':'#6f8a40',sd+de)}}
  else{const P=[[-7,8.4],[-4.2,5.6],[-1,6.6],[1.6,3.4],[5,4.6],[7.4,1.6]].map(([de,z])=>V0.P(at(e+de,z,-10.15)));C3.line(P);ctx.lineCap='round';ctx.lineJoin='round';
    ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke();ctx.strokeStyle='#ff8a3c';ctx.lineWidth=.9;ctx.stroke();
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';for(const q of[P[1],P[3]])glow('255,110,40',q[0],q[1],6,.45);ctx.restore()}}}
function cnPortalVine(K,e,at,sd){const{V0}=K,re=8.4,rn=5,z0=12,z1=82,turns=2.6;ctx.lineCap='round';
  for(let w=0;w<turns;w++){const P=[];for(let q=0;q<=10;q++){const th=-Math.PI/2+q/10*Math.PI,u=(w+(th+Math.PI/2)/TAU)/turns;if(u>1)break;P.push(V0.P(at(e+Math.sin(th)*re,z0+(z1-z0)*u,-Math.cos(th)*rn)))}
    if(P.length<2)continue;C3.line(P);ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke();ctx.strokeStyle='#4f7a2e';ctx.lineWidth=1.2;ctx.stroke();
    for(let q=2;q<P.length-1;q+=3){const p=P[q],r=(q+w)%2?.7:-.7;ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(r);ctx.fillStyle=(q+w)%2?'#6fa040':'#86b850';ctx.strokeStyle=INK;ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(0,0,2.6,1.3,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore()}}
  const f=V0.P(at(e+re*.4,z0+(z1-z0)*.62,-rn));ctx.fillStyle=prH(sd,5)>.5?'#ff8ad8':'#ffe066';ctx.strokeStyle=INK;ctx.lineWidth=.7;ctx.beginPath();ctx.arc(f[0],f[1],1.9,0,TAU);ctx.fill();ctx.stroke()}
function cnPortalRoof(K,ch,e,h,at,sd){const{V0}=K,rim=(a,r,z)=>V0.P(at(e+Math.sin(a)*r,z,-Math.cos(a)*r));
  if(ch===4){pRound(K,at(e,h-1),[[2,10.1],[2.6,9.4],[3,8.4],[6,5.3],[8.6,2.6],[10.4,.3]],'#eef6ff',{m:8,lw:1.2,kl:.25,kd:.3});
    for(const[a,l] of[[-.95,3],[-.35,5.5],[.25,4],[.85,6]]){const p=rim(a,9.6,h-1);cnIcicle(p[0],p[1],l+prH(a*7,sd)*2,1.7)}}
  else if(ch===1){pRound(K,at(e,h-1),[[2,10],[2.6,9.3],[3.2,8.3],[4.6,7]],'#5f9a3c',{m:8,lw:1.1,kl:.3,kd:.4});
    for(const[a,l] of[[-.7,5],[.1,7],[.8,4]]){const p=rim(a,9.6,h-1);cnHang(p[0],p[1],l,1,'#4f8a34','#82b850',sd+a*9)}}
  else if(ch===3)for(const[a,l] of[[-.6,9],[.55,12]]){const p=rim(a,9.6,h-1);cnVine(p[0],p[1],l,1,sd+a*5,c=>c)}
  else pRound(K,at(e,h-1),[[7.2,3],[10,.6]],'#2a2424',{m:8,lw:1.1,kl:.2,kd:.3})}
function cnPortalBeams(K,ch,pe,h,at,sd){const{V0}=K;
  if(ch===4){for(const[z,r,w] of[[h-4,3.8,10],[h-30,3,7]])C3.caps(V0,at(-pe-w,z+r*.72),r*.6,at(pe+w,z+r*.72),r*.6,'#eef6ff',{lw:1,noRim:1});
    for(const de of[-36,-27,-19,19,26,35]){const p=V0.P(at(de,h-33,-2.6));cnIcicle(p[0],p[1],2.6+prH(de,sd)*4,1.5)}}
  else if(ch===1||ch===3)for(const de of[-37,-24,23,36]){const p=V0.P(at(de,h-33,-2.6)),l=5+prH(de,sd)*7;if(ch===1)cnHang(p[0],p[1],l,1,'#4f8a34','#82b850',sd+de);else cnVine(p[0],p[1],l+3,1,sd+de,c=>c)}}
// where the towers' lanterns shine: [n, e, z] from the island's middle
const cnPortalLamp=(i,s)=>[cnIslRim(i,true)-6,s*(CNB.pe+17),CNB.gate-33];
// the towers' parts that live in the wind, drawn over the island's picture (A: where it is): the flag on each roof flapping (both toward the
// east, where the wind blows), the banner of the next arena rippling, the rope in front of it from the top down to its stake, the lantern
// swinging gently on its arm (its hook at the arm's end); th: how far each lantern swings
function cnPortalLive(i,A,t,op){const n=cnIslRim(i,true)-6,h=CNB.gate,pe=CNB.pe,W=cnBrW(i),A1=ARENAS[i+1],ac=A1?A1.col:'#c0392b',at=(e,z,dn)=>cnChain(n+(dn||0),e,z),wv=cnWind(t),
    V0=cnV(),K={V0,k:A.k,L:cnLt()},th=[];
  ctx.save();ctx.translate(A.x,A.y);ctx.scale(A.k,A.k);
  try{for(const s of[-1,1]){const e=s*pe;
    // the flag: its edge on the pole, four points along it waving (a wave running to its tip), the tip lifted by the wind
    {const T=[],B=[];for(let q=0;q<=4;q++){const u=q/4,wa=(1.2+wv*1.6)*u*Math.sin(t*(4.5+wv*3)-u*3.6+s+i),dz=-u*(1-wv)*3;
        T.push(V0.P(at(e+u*15,h+27-u*4.5+dz+wa))),B.push(V0.P(at(e+u*15,h+18+u*4.5+dz+wa*.8)))}
      ctx.beginPath();ctx.moveTo(T[0][0],T[0][1]);for(let q=1;q<=4;q++)ctx.lineTo(T[q][0],T[q][1]);for(let q=4;q>=0;q--)ctx.lineTo(B[q][0],B[q][1]);ctx.closePath();
      ctx.fillStyle=ac;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.lineJoin='round';ctx.stroke();
      ctx.beginPath();ctx.moveTo(T[1][0],(T[1][1]+B[1][1])/2);ctx.lineTo(T[3][0],(T[3][1]+B[3][1])/2);ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=1;ctx.stroke()}
    cnCloth(K,(ee,z,dn)=>at(ee,z,-4.8-(dn||0)),e,5.5,h-34,h-70,h-62,ac,t,wv,s*1.3+i,h-48,2.4);
    const st=at(e+s*4,0,-26);cnRope([V0.P(at(e,h+1,-2)),V0.P(at(e+s*2,h*.5,-14)),V0.P([st[0],st[1],st[2]+6])],1,2.8,W.cable);
    // the lantern, hanging from the end of its arm by a short hook
    const hk=V0.P(at(e+s*17,h-24.6)),a=wv*.17*Math.sin(t*1.6+s*1.9+i);th.push(a);
    ctx.save();ctx.translate(hk[0],hk[1]);ctx.rotate(a);ctx.translate(-hk[0],-hk[1]);
    const r0=V0.P(at(e+s*17,h-27.2));ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(hk[0],hk[1]);ctx.lineTo(r0[0],r0[1]);ctx.stroke();
    cnLantern(K,at(e+s*17,h-37),op);ctx.restore()}}
  catch(err){cnErr(err)}finally{ctx.restore()}
  return th}
// the two anchors at the front of an island where the bridge from the island before lands (its ropes and cables are tied to them), on stones
function cnBrStumps(K,i){const n=-cnIslRim(i,false)+6,W=cnBrW(Math.max(0,i-1));for(const s of[-1,1]){const b=cnChain(n,s*CNB.pe,0);pBox(K,b,12,13,5,cnMixC(W.stone,'#8a8070',.15),{a:CN_NA,lw:1.3});cnLogPost(K,[b[0],b[1],4],CNB.stump-4,W.wood,false)}}
// ------------------------------------------------ the prizes in 3D, drawn alive (they bob and shine; the show opens them): a chest with its
// iron bands and its lid (that opens), a sack of gold with the coins at its mouth, crystals, a jar of essence of moss
const CN_CHA=Math.atan2(CNI_C,CNI_S);   // the angle of the south in the islands' own coordinates (the front of a chest looks at you)
function cnChest3(K,c,type,open){const{V0}=K,C=CHC[type]||CHC.legno,at=(n,e,z)=>{const q=cnChain(n,e,z);return[c[0]+q[0],c[1]+q[1],c[2]+q[2]]},o={a:CN_CHA,lw:1.5};
  // the lid: half a log of planks along the chest, turned back round its hinge as it opens
  const lid=()=>{const F=[],R=7,ph=open*1.9,rot=(n,z)=>{const dn=n-R,dz=z-11;return[R+dn*Math.cos(ph)+dz*Math.sin(ph),11-dn*Math.sin(ph)+dz*Math.cos(ph)]},M=8,pf=[];
    for(let j=0;j<=M;j++){const th=j/M*Math.PI;pf.push(rot(-R*Math.cos(th),11+R*.78*Math.sin(th)))}
    for(let j=0;j<M;j++){const a=pf[j],b=pf[j+1],mn=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,cc=rot(0,11);F.push([C3.nrm(cnChain(mn-cc[0],0,(mz-cc[1])*1.2)),[at(a[0],-11,a[1]),at(a[0],11,a[1]),at(b[0],11,b[1]),at(b[0],-11,b[1])]])}
    F.push([C3.nrm(cnChain(0,11,0)),pf.map(p=>at(p[0],11,p[1]))],[C3.nrm(cnChain(0,-11,0)),pf.slice().reverse().map(p=>at(p[0],-11,p[1]))]);
    oFaces(K,F,C.dark,{lw:1.5,ew:.5});
    for(const e of[-6,6]){const pl=pf.map(p=>V0.P(at(p[0],e,p[1])));ctx.strokeStyle=INK;ctx.lineWidth=2.8;C3.line(pl);ctx.stroke();ctx.strokeStyle=C.band;ctx.lineWidth=1.6;ctx.stroke()}};
  if(open>.5)lid();
  pBox(K,c,14,22,11,C.body,o);
  for(const e of[-6,6])pBox(K,at(0,e,0),14.6,2.4,11.3,C.band,o);
  if(open>0){const top=[at(-6.4,-10.4,11.05),at(-6.4,10.4,11.05),at(6.4,10.4,11.05),at(6.4,-10.4,11.05)].map(p=>V0.P(p));C3.poly(top);ctx.fillStyle='#1a120c';ctx.fill();
    const m=V0.P(at(0,0,11.5));ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(m[0],m[1],0,m[0],m[1],14);g.addColorStop(0,'rgba(255,230,140,.95)');g.addColorStop(1,'rgba(255,200,80,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(m[0],m[1],14,0,TAU);ctx.fill();ctx.restore()}
  if(open<=.5)lid();
  pBox(K,at(-7.4,0,5.6),1.8,4,5.2,C.lock,{a:CN_CHA,lw:1.2});C3.spot(V0,at(-8.4,0,7.6),C3.nrm(cnChain(-1,0,0)),.8,INK)}
function cnSack3(K,c){const{V0}=K,at=(n,e,z)=>{const q=cnChain(n,e,z);return[c[0]+q[0],c[1]+q[1],c[2]+q[2]]};
  for(const[n,e,a] of[[-9,-6,.2],[-6,8,-.4],[-10,3,.9]])C3.disc3(V0,at(n,e,.6),C3.nrm([Math.sin(a)*.3,Math.cos(a)*.3,1]),2.6,{N:14}),ctx.fillStyle='#ffc93c',ctx.fill(),ctx.strokeStyle=INK,ctx.lineWidth=1,ctx.stroke();
  pRound(K,c,[[0,6.6],[2,8.6],[6,9],[9.5,7.6],[11.5,4.2],[12.5,2.8],[13.5,3.2],[15,4.6]],'#c09a62',{m:18,lw:1.6,kl:.3,kd:.45});
  const r=V0.P(at(0,0,12.5));ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(r[0],r[1],3.4,1.4,0,0,Math.PI);ctx.stroke();ctx.strokeStyle='#e8d0a0';ctx.lineWidth=1.1;ctx.stroke();
  for(const[n,e,z] of[[0,-1.4,15.4],[1,1.6,15.8],[-1.2,.6,16.4]])C3.sball(V0,at(n,e,z),1.9,'#ffc93c',{lw:.8,kl:.4,kd:.3,rim:.15});
  C3.spot(V0,at(-8.6,0,5.4),C3.nrm(cnChain(-1,0,.15)),3.2,'#ffc93c');const m=V0.P(at(-8.8,0,5.4));ctx.strokeStyle='#8a5a10';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(m[0],m[1],1.6,0,TAU);ctx.stroke()}
function cnGems3(K,c){const at=(n,e,z)=>{const q=cnChain(n,e,z);return[c[0]+q[0],c[1]+q[1],c[2]+q[2]]};
  pRound(K,c,[[0,8],[2,7],[3.4,3]],'#6a6a72',{m:12,lw:1.3});
  oPrism(K,at(2,4,2),6,2.4,8,'#5ab0f0',{tip:3,lean:[.08,-.18],lw:1.2,cf:n=>n[2]>.5?'#c8f0ff':'#5ab0f0'});
  oPrism(K,at(2,-4,2),6,2.2,7,'#a8ecff',{tip:2.6,lean:[.06,.2],lw:1.2,cf:n=>n[2]>.5?'#ffffff':'#a8ecff'});
  oPrism(K,at(-1,0,2.4),6,3.2,11,'#7fd8ff',{tip:4,lw:1.3,cf:n=>n[2]>.5?'#e8fbff':'#7fd8ff'})}
function cnJar3(K,c){const{V0}=K,at=(n,e,z)=>{const q=cnChain(n,e,z);return[c[0]+q[0],c[1]+q[1],c[2]+q[2]]};
  pRound(K,c,[[0,4.8],[1.2,6.2],[7,6.4],[9.6,4.6],[10.8,2.8],[11.6,3.2]],'#7fd860',{m:16,lw:1.5,kl:.45,kd:.35,rim:.35});
  C3.spot(V0,at(-5.6,2.4,5.6),C3.nrm(cnChain(-1,.4,.2)),1.6,'rgba(255,255,255,.75)');
  pRound(K,at(0,0,11.2),[[0,2.6],[2.4,2.4],[3,1.6]],'#a07a4a',{m:10,lw:1.1})}
// one prize alive on its place (p: the prize, c: the base in the view's own units): it bobs, a soft light under it; while the show opens it,
// it swells and goes; then its label above it (what it is) and where a tap finds it
// (ps: its size; on the balconies of the big bridge a third bigger)
function cnPrizeLive(i,j,K,c,L,t,a,ps){ps=ps||1;const p=cnBrPrize(i,j),A=ISL.brA,pop=A&&A.i===i&&A.pop&&A.pop.p.j===j?A.pop:null,d=L.dpr,kp=K.k*ps;
  const bob=LOWFX?0:Math.sin(t*2.2+j*1.7)*1.3,sw=pop?1+.35*Math.sin(Math.min(1,pop.t/.32)*Math.PI*.5):1,base=K.V0.P(c),bx=K.o[0]+base[0]*K.k,by=K.o[1]+base[1]*K.k,top=[bx,by-(30+bob)*kp];
  (ISL.przAt||(ISL.przAt={}))[i+'_'+j]=[bx,by-14*kp,kp];
  ctx.save();if(a<1)ctx.globalAlpha*=a;
  if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(cnRgb(cnPrizeCol(p)),bx,by-10*kp,(pop?34:22)*kp,pop?.55:.22+.06*Math.sin(t*3+j));ctx.restore()}
  ctx.translate(K.o[0],K.o[1]);ctx.scale(K.k,K.k);ctx.translate(base[0],base[1]);ctx.scale(sw*ps,sw*ps);ctx.translate(-base[0],-base[1]-bob);
  try{const cc=[c[0],c[1],c[2]];if(p.k==='cassa')cnChest3(K,cc,p.t,pop?Math.min(1,pop.t/.3):0);else if(p.k==='oro')cnSack3(K,cc);else if(p.k==='gem')cnGems3(K,cc);else cnJar3(K,cc)}catch(err){cnErr(err)}
  ctx.restore();
  // (the labels go under the name of the arena: they fade before it)
  const la=a*clamp((top[1]-L.titleB-18*d)/(26*d),0,1);if(!pop&&la>.02){cnPrizeLabel(top[0],top[1],p,d,la);(ISL.prz||(ISL.prz=[])).push({x:bx,y:by-18*kp,r:Math.max(26*d,26*kp),txt:`Premio del ponte: ${cnPrizeTxt(p)} · tuo a ${cnBrTh(i,j)} assi (ne hai ${cnBrHave(i)})`})}}
function cnPrizeLabel(x,y,p,d,a){const txt=p.k==='cassa'?CHEST_RAR[p.t]:'+'+p.n,col=cnPrizeCol(p);ctx.save();if(a<1)ctx.globalAlpha*=a;ctx.font=`${Math.round(11*d)}px "Lilita One", sans-serif`;
  const w=ctx.measureText(txt).width+22*d,h=16*d,x0=x-w/2,y0=y-h;cnRR(x0,y0,w,h,8*d);ctx.fillStyle='rgba(10,8,6,.66)';ctx.fill();ctx.lineWidth=1.4*d;ctx.strokeStyle=col;ctx.stroke();
  cnPrizeGlyph(p,x0+9.5*d,y0+h/2,d);ctx.textAlign='left';ctx.lineJoin='round';ctx.lineWidth=2.6*d;ctx.strokeStyle=INK;ctx.strokeText(txt,x0+17*d,y0+h*.74);ctx.fillStyle=col;ctx.fillText(txt,x0+17*d,y0+h*.74);ctx.restore()}
function cnPrizeGlyph(p,x,y,d){ctx.save();ctx.translate(x,y);ctx.scale(d,d);ctx.lineWidth=1.3;ctx.strokeStyle=INK;ctx.lineJoin='round';
  if(p.k==='oro'){ctx.fillStyle='#ffc93c';ctx.beginPath();ctx.arc(0,0,4.6,0,TAU);ctx.fill();ctx.stroke()}
  else if(p.k==='gem'){ctx.fillStyle='#6fd0ff';ctx.beginPath();ctx.moveTo(-4.6,-1.4);ctx.lineTo(-2.4,-4.2);ctx.lineTo(2.4,-4.2);ctx.lineTo(4.6,-1.4);ctx.lineTo(0,4.6);ctx.closePath();ctx.fill();ctx.stroke()}
  else if(p.k==='ess'){ctx.fillStyle='#9fe06a';ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(3.3,.4);ctx.arc(0,1.5,3.5,-.32,Math.PI+.32);ctx.closePath();ctx.fill();ctx.stroke()}
  else{const C=CHC[p.t]||CHC.legno;ctx.fillStyle=C.body;ctx.fillRect(-4.8,-1.2,9.6,5.4);ctx.strokeRect(-4.8,-1.2,9.6,5.4);ctx.fillStyle=C.dark;ctx.beginPath();ctx.moveTo(-4.8,-1.2);ctx.quadraticCurveTo(0,-6,4.8,-1.2);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=C.lock;ctx.fillRect(-1,-.2,2,2.4)}
  ctx.restore()}
// the live parts of a bridge: the lanterns of the balconies reached, the prizes waiting (not on a bridge still in the dark), how many planks it
// has where the work stops, the show
function cnBrLive(i,L,t,M){const G0=M.G,S=cnS(),d=L.dpr,dim=!cnOpenShown(i)&&!S.all,laid=cnBrLaidNow(i),Ns=CNB.Ns;if(dim)return;
  // the lanterns lit (on the posts and on the balconies' arches), each with its light and its little flame
  // (a lantern on a post's arm swings: its light goes with it, round its hook)
  const wt=LOWFX?null:t,wv=wt==null?0:cnWind(t);
  for(const l of cnBrLamps(G0)){if(laid<l.g)continue;const k=M.K(l.n);let q;
    if(l.post){const a=cnLampTh(i,l.n,1,wt,wv),b=M.S(l.n,l.e,cnDeckZ(G0,l.n)+CNB.ph-1),r=(CNB.ph-1-l.z)*k;q=[b[0]-Math.sin(a)*r,b[1]+Math.cos(a)*r]}else q=M.S(l.n,l.e,cnDeckZ(G0,l.n)+l.z);
    if(q[1]<-40*d||q[1]>L.H+40*d)continue;const fl=LOWFX?1:.84+.16*Math.sin(t*8+l.n*.07+i);
    pLight(q[0],q[1],17*k,'255,196,100',.46*fl,13*k);if(!LOWFX)pFlame(q[0],q[1]+1.2*k,3.6*k,1.8*k,1,t+l.n*.01,false)}
  for(let b=2;b>=0;b--){const c=G0.Z[b],y=M.S(c,0,0)[1],dz=cnDeckZ(G0,c);if(y<-60*d||y>L.H+60*d)continue;
    if(!cnPrizeTaken(i,b+1))cnPrizeLive(i,b+1,cnPlatView(M,c),cnChain(0,-CNB.bal,dz+3.4),L,t,1,1.3)}
  // the last prize, on the next island where the bridge ends (on the left too)
  if(!cnPrizeTaken(i,4)){const B=M.B,y=B.y;if(y>-60*d&&y<L.H+60*d)cnPrizeLive(i,4,{V0:cnV(),L:cnLt(),k:B.k,o:[B.x,B.y]},cnChain(G0.a1+18-CNI_GAP,-CNB.bal+6,0),L,t,1,1.3)}
  // the planks so far, where the work stops (on the right: the prizes are on the left)
  const A=ISL.brA&&ISL.brA.i===i?ISL.brA:null;
  if(!A&&laid<4*Ns&&!S.all){const n=cnPlankN(G0,laid),q=M.S(n,CNB.pe+40,cnDeckZ(G0,n)+4);if(q[1]>L.titleB+30*d&&q[1]<L.info-24*d){const txt=`${cnBrHave(i)}/${cnBrNeed(i)}`;
    ctx.save();ctx.font=`${Math.round(11.5*d)}px "Lilita One", sans-serif`;const w=ctx.measureText(txt).width+28*d;cnRR(q[0]-w/2,q[1]-10*d,w,17*d,8*d);ctx.fillStyle='rgba(0,0,0,.62)';ctx.fill();
      cnPlankGlyph(q[0]-w/2+10*d,q[1]-1.5*d,d);ctx.textAlign='left';ctx.lineWidth=2.6*d;ctx.strokeStyle=INK;ctx.strokeText(txt,q[0]-w/2+19*d,q[1]+3*d);ctx.fillStyle='#ecd2a2';ctx.fillText(txt,q[0]-w/2+19*d,q[1]+3*d);ctx.restore()}}
  if(A)cnBrShowLive(i,L,t,M)}
// a little plank (the labels)
function cnPlankGlyph(x,y,d){ctx.save();ctx.translate(x,y);ctx.scale(d,d);ctx.rotate(-.28);ctx.fillStyle='#b5864f';ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.rect(-6,-2.2,12,4.4);ctx.fill();ctx.stroke();
  ctx.fillStyle=INK;ctx.fillRect(-4.6,-.6,1.2,1.2);ctx.fillRect(3.4,-.6,1.2,1.2);ctx.restore()}
// ------------------------------------------------ the show of the planks (Denis: «Volano e si inchiodano», then «fai in modo che il pg non
// costruisca il ponte ma le assi si infilano da sole»): back from a run the planks go to the bridge by themselves, one after another: each
// comes flying low from your island over the planks already laid, turning, and slips into its place (it settles, dust, its nails go in by
// themselves with a spark, the knock of the wood a little higher each time); the camera goes with the front of the work. At a balcony its
// prize opens and flies to you (the gold and the crystals to their counters, a chest to its post); with the bridge finished the next island
// lights up and the hero, who waited on his island, runs over to it; otherwise the camera goes back to him. A tap ends it at once.
const CN_SHOW={fly:.42,gap:.11,bnc:.3};   // seconds: a plank's flight, from one plank to the next, its settling (A.sp shortens them when many)
function cnBrShowStart(B){if(B.from>=B.to&&!B.got.length)return;const i=B.i,n=Math.max(1,B.to-B.from);
  ISL.cur=i;ISL.view=i;ISL.jump=null;ISL.go=null;ISL.rest=null;ISL.drag=null;
  ISL.brA={i,from:B.from,to:B.to,done:B.done,got:B.got,pend:B.pend||{gold:0,gems:0,slots:[]},k:B.from,nx:B.from,fl:[],bn:{},ph:'in',t:0,st:0,
    lit:false,litT:0,pop:null,fx:[],sp:clamp(16/n,.5,1)};
  cnBrSnd('vola')}
// where the camera looks during the show: the front of the work a little up the screen (no further than the bridge's end), the balcony whose
// prize is opening, the island lighting up
function cnBrShowCam(A,G0){if(A.ph==='open')return A.i+(CNI_GAP-110)/CNI_GAP;
  const n=A.ph==='pop'&&A.pop&&A.pop.p.j<4?G0.Z[A.pop.p.j-1]-30:cnPlankN(G0,clamp(Math.max(A.k,A.nx-1),0,4*CNB.Ns-1))-115;return A.i+clamp(n/CNI_GAP,0,(G0.a1-40)/CNI_GAP)}
// the next balcony whose prize the planks are bringing (it opens before they go past it)
const cnBrPz=A=>{let b=null;for(const q of A.got)if(q.j<4&&!q.shown&&(!b||q.j<b.j))b=q;return b};
function cnBrShowStep(dt,L){const A=ISL.brA,G0=cnBrGeo(A.i),Ns=CNB.Ns,T=k=>CN_SHOW[k]*A.sp;A.t+=dt;
  // the planks in flight land in their order; the ones landed settle and get their nails
  for(const f of A.fl)f.t+=dt;
  while(A.fl.length&&A.fl[0].t>=T('fly')){const f=A.fl.shift();A.k=Math.max(A.k,f.g+1);A.bn[f.g]={t:0,nail:false};cnBrSnd('posa',f.g);cnBrPuff(A,cnPlankN(G0,f.g),3)}
  for(const g of Object.keys(A.bn)){const b=A.bn[g];b.t+=dt;if(!b.nail&&b.t>=T('bnc')*.45){b.nail=true;A.fx.push({k:'spark',n:cnPlankN(G0,+g),t:0,T:.22});if(+g%3===0)cnBrSnd('inchioda')}if(b.t>=T('bnc'))delete A.bn[g]}
  if(A.ph==='in'){if(A.t>.55){A.ph='lay';A.st=T('gap')}}
  else if(A.ph==='lay'){A.st+=dt;const pz=cnBrPz(A);
    if(pz&&A.k>=pz.j*Ns&&!A.fl.length){A.ph='pop';A.t=0;A.pop={p:pz,t:0};cnBrSnd('premio')}
    else if(A.nx<A.to&&A.st>=T('gap')&&!(pz&&A.nx>=pz.j*Ns)){const g=A.nx;A.fl.push({g,t:0,s:prH(g,A.i+11)});A.nx++;A.st=0;if(g%2===0)cnBrSnd('vola')}
    else if(A.nx>=A.to&&!A.fl.length&&!pz&&!Object.keys(A.bn).length){
      if(A.k>=4*Ns&&A.done){A.ph='open';A.t=0;A.lit=true;A.litT=0;cnBrSnd('isola');const p=A.got.find(q=>q.j===4&&!q.shown);if(p){A.pop={p,t:0};setTimeout(()=>cnBrSnd('premio'),250)}}
      else return cnBrShowEnd(true)}}
  else if(A.ph==='pop'){if(!A.pop||A.pop.t>=1.2){A.pop=null;A.ph='lay';A.st=T('gap')}}
  else if(A.ph==='open'){A.litT=Math.min(1,A.litT+dt/1.1);if(A.t>1.6&&!A.pop)return cnBrShowEnd(true)}
  if(A.pop){A.pop.t+=dt;if(!A.pop.out&&A.pop.t>=.32){A.pop.out=1;cnPrizeOut(A,A.pop.p)}if(A.ph!=='pop'&&A.pop.t>=1.2)A.pop=null}
  for(const f of A.fx)f.t+=dt;A.fx=A.fx.filter(f=>f.t<f.T);
  ISL.view+=(cnBrShowCam(A,G0)-ISL.view)*Math.min(1,dt*(A.ph==='in'?3.2:4.5))}
// the moment a prize opens: it goes from its place, the gold and the crystals fly to their counters, a chest to its post, the essence rises
function cnPrizeOut(A,p){p.shown=true;const q=ISL.przAt&&ISL.przAt[A.i+'_'+p.j],L=ISL.lay,r=campCv.getBoundingClientRect(),X=q&&L?r.left+q[0]/L.dpr:innerWidth/2,Y=q&&L?r.top+q[1]/L.dpr:innerHeight/2;
  if(q)A.fx.push({k:'burst',x:q[0],y:q[1],s:q[2],col:cnRgb(cnPrizeCol(p)),t:0,T:.9});
  if(p.k==='oro'||p.k==='gem'||p.res&&p.res.full){lastTap=[X,Y];if(p.k==='oro')A.pend.gold-=p.n;else if(p.k==='gem')A.pend.gems-=p.n;else A.pend.gold-=p.res.gold||0;renderGold()}
  else if(p.k==='ess'){if(q)A.fx.push({k:'txt',txt:`+${p.n} Essenza di muschio`,x:q[0],y:q[1],t:0,T:1.7,col:'#b8f07a'})}
  if(p.res&&p.res.slot!=null){const s=p.res.slot;cnChestFly(p.t,X,Y,s,()=>{if(A.pend)A.pend.slots=A.pend.slots.filter(v=>v!==s);const el=$('homeGear').querySelector(`[data-ps="${s}"]`);if(el){el.style.visibility='';bump(el)}cnBrSnd('cassa')})}
  if(q&&p.k==='cassa'&&p.res&&p.res.full)A.fx.push({k:'txt',txt:`Posti pieni: +${p.res.gold} oro`,x:q[0],y:q[1],t:0,T:1.7,col:'#ffd84a'})}
// a chest flying from its rock to its post under the hero (a copy of the chest's picture over the page)
function cnChestFly(type,x,y,slot,done){const el=$('homeGear').querySelector(`[data-ps="${slot}"]`);if(!el||!document.body.animate||LOWFX){done&&done();return}
  const b=el.getBoundingClientRect(),c=document.createElement('div');c.className='cnFlyChest';c.innerHTML=chestSVG(type,false);c.style.left=x+'px';c.style.top=y+'px';document.body.appendChild(c);
  const tx=b.left+b.width/2-x,ty=b.top+b.height/2-y;
  const an=c.animate([{transform:'translate(-50%,-50%) scale(.4)',opacity:0},{transform:'translate(-50%,-50%) scale(1.2)',opacity:1,offset:.22},
    {transform:`translate(calc(${tx*.35}px - 50%),calc(${Math.min(ty*.35,-70)}px - 50%)) scale(1.05)`,offset:.55},{transform:`translate(calc(${tx}px - 50%),calc(${ty}px - 50%)) scale(.55)`}],{duration:1000,easing:'ease-in-out'});
  an.onfinish=()=>{c.remove();done&&done()}}
// dust from under a plank just landed or nailed (at both its ends)
function cnBrPuff(A,n,m){if(LOWFX)m=Math.ceil(m/2);for(let j=0;j<m;j++){const s=j%2?1:-1;A.fx.push({k:'puff',n:n+(Math.random()-.5)*6,e:s*(CNB.hw-2-Math.random()*8),z:cnDeckZ(cnBrGeo(A.i),n),vn:(Math.random()-.5)*14,ve:s*(8+Math.random()*14),vz:6+Math.random()*10,t:0,T:.45+Math.random()*.25,r:2+Math.random()*2})}}
// the show's live parts on the bridge: the planks in flight, dust, the nails' sparks, the bursts of the prizes, the essence's words rising
function cnBrShowLive(i,L,t,M){const A=ISL.brA,d=L.dpr;cnBrFlyLive(A,M);
  for(const f of A.fx){const u=f.t/f.T;
    if(f.k==='puff'){const q=M.S(f.n+f.vn*f.t,f.e+f.ve*f.t,f.z+f.vz*f.t),k=M.K(f.n);ctx.fillStyle=`rgba(226,212,184,${(.5*(1-u)).toFixed(2)})`;ctx.beginPath();ctx.arc(q[0],q[1],(f.r+u*5)*k,0,TAU);ctx.fill()}
    else if(f.k==='spark'){if(LOWFX)continue;const G0=cnBrGeo(i),k=M.K(f.n);ctx.save();ctx.globalCompositeOperation='lighter';
      for(const s of[-1,1]){const e=M.S(f.n,s*(CNB.hw-3),cnDeckZ(G0,f.n)+1);for(let j=0;j<4;j++){const a=-Math.PI/2+(j-1.5)*.5+s*.3;ctx.fillStyle=`rgba(255,${200+j*12},120,${(1-u).toFixed(2)})`;ctx.fillRect(e[0]+Math.cos(a)*u*10*k,e[1]+Math.sin(a)*u*10*k,1.6*k,1.6*k)}}ctx.restore()}
    else if(f.k==='burst'){const s=f.s;ctx.save();ctx.globalCompositeOperation='lighter';if(!LOWFX){glow(f.col,f.x,f.y,(30+u*40)*s,.7*(1-u));ctx.strokeStyle=`rgba(${f.col},${(.9*(1-u)).toFixed(2)})`;ctx.lineWidth=3*s*(1-u)+1;
        for(let j=0;j<10;j++){const a=j/10*TAU+i,r0=(8+u*30)*s,r1=(14+u*46)*s;ctx.beginPath();ctx.moveTo(f.x+Math.cos(a)*r0,f.y+Math.sin(a)*r0*.7);ctx.lineTo(f.x+Math.cos(a)*r1,f.y+Math.sin(a)*r1*.7);ctx.stroke()}}
      ctx.strokeStyle=`rgba(255,250,220,${(1-u).toFixed(2)})`;ctx.lineWidth=2*s;ctx.beginPath();ctx.ellipse(f.x,f.y,(10+u*42)*s,(6+u*26)*s,0,0,TAU);ctx.stroke();ctx.restore()}
    else if(f.k==='txt'){ctx.save();ctx.globalAlpha=Math.min(1,(1-u)*2.5);ctx.font=`${Math.round(14*d)}px "Lilita One", sans-serif`;ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=3.4*d;ctx.strokeStyle=INK;
      const y=f.y-(16+u*40)*d;ctx.strokeText(f.txt,f.x,y);ctx.fillStyle=f.col;ctx.fillText(f.txt,f.x,y);ctx.restore()}}}
// the planks in flight, far to near: from your island, low over the planks already laid, turning on the way and flattening at the end, into
// their places; a little light goes with each
function cnBrFlyLive(A,M){const G0=cnBrGeo(A.i),T=CN_SHOW.fly*A.sp,W=cnBrW(A.i),F=[];
  for(const f of A.fl){const u=Math.min(1,f.t/T),e=1-Math.pow(1-u,3),n1=cnPlankN(G0,f.g),n0=n1-150-60*f.s,side=f.g%2?1:-1,n=plerp(n0,n1,e);
    F.push({f,u,n,o:{n,e:side*(12+10*f.s)*(1-e),z:plerp(cnDeckZ(G0,n0)+22,cnDeckZ(G0,n1),e)+9*Math.sin(Math.PI*e),spin:side*(1-e)*1.5,roll:(1-e)*1.1},e})}
  F.sort((a,b)=>b.n-a.n);
  for(const{f,u,o,e} of F){const a=Math.min(1,u*5);
    if(!LOWFX){const q=M.S(o.n,o.e,o.z),k=M.K(o.n);ctx.save();ctx.globalCompositeOperation='lighter';glow('255,226,150',q[0],q[1],(10+8*(1-e))*k,.32*a*(1-e*.7));ctx.restore()}
    cnPlankDraw(M,cnPlankAt(G0,f.g,0,o),W.plank[Math.floor(prH(f.g,A.i+2)*4)%4],false,a)}}
// a tap or «Gioca» ends the show at once: everything where it belongs, the prizes on the counters and in the posts
// (finishing: the camera goes back to the hero, or he, who waited on his island, runs over the bridge to the island lit: he comes into the
// picture where the camera is, the rest of the way it follows him)
function cnBrShowEnd(fin){const A=ISL.brA;if(!A)return;ISL.brA=null;for(const p of A.got)p.shown=true;const i=A.i;
  ISL.cur=A.done?i+1:i;ISL.go=null;ISL.rest=null;ISL.jump=null;ISL.bc={};
  if(!fin)ISL.view=ISL.cur;
  else if(A.done&&ARENAS[i+1]){const w=cnIslWay(i,i+1),dur=clamp(w.len/430,1.2,2.6),nT=cnIslNE(CI_HERO)[0]+(ISL.view-i)*CNI_GAP;let lo=0,hi=w.len;
    for(let j=0;j<24;j++){const m=(lo+hi)/2;if(cnWayAt(w,m)[0]<nT)lo=m;else hi=m}
    ISL.jump={a:i,b:i+1,t:clamp(lo/w.len*.88+.06,.1,.9)*dur,way:w,dur};ISL.go=i+1}
  else ISL.go=i;
  try{renderGold();renderGearRow();document.querySelectorAll('#homeGear [data-ps]').forEach(el=>el.style.visibility='')}catch(err){cnErr(err)}}
// the sounds of the bridge, made by the code (the wood and the metal of the zombie map's barriers, src/js/05-audio.js); g: the plank that lands
// (its knock goes up a little with each, from one balcony to the next)
function cnBrSnd(w,g){try{if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;const t=AU.ctx.currentTime+.01,st=s=>Math.pow(2,s/12);
  if(w==='vola')fNoise(t,.2,'bandpass',VR(700,.12),1.4,.06,{f2:2200});
  else if(w==='posa'){M.wood(t,.7,VR(g==null?210:190*Math.pow(2,(g%CNB.Ns)/20),.03));fThump(t,150,70,.06,.12)}
  else if(w==='inchioda'){M.wood(t,.65,VR(420,.05));M.metal(t+.004,.22,VR(1900,.05),.18)}
  else if(w==='premio'){[0,4,7,12].forEach((s,j)=>tone(523*st(s),523*st(s),.24,'triangle',.032,j*.07));coinClink(t+.3,1)}
  else if(w==='cassa'){M.wood(t,1,VR(180,.06));fThump(t,120,60,.12,.2)}
  else if(w==='isola'){[0,7,12,16,19].forEach((s,j)=>tone(330*st(s),330*st(s)*1.003,.9,'sine',.03,j*.09));fNoise(t,1.1,'bandpass',1800,.8,.05,{f2:500})}
  else if(w==='sacco')fNoise(t,.16,'lowpass',900,.7,.08)
  // the hero's feet on the planks, the wood creaking under him, the wind in the ropes (a gust: a breath of air and a thin whistle)
  else if(w==='passo'){M.wood(t,.2,VR(165,.08));fThump(t,105,60,.05,.045)}
  else if(w==='scricchiola')cnCreak(t,1,VR(150,.15));
  else if(w==='vento'){fNoise(t,2.8,'bandpass',VR(380,.1),.8,.03,{f2:VR(850,.1),att:1,sw:.55,brown:true});fNoise(t+.4,2.2,'bandpass',VR(1500,.08),7,.008,{f2:VR(1850,.08),att:.9,sw:.6});cnCreak(t+.9,.55,VR(120,.15))}}catch(err){}}
// a creak of wood or of a rope pulled tight: a slow rough buzz (the fibres sticking and slipping) through the body of the wood, rising a
// little and falling back
function cnCreak(t,v,f){const c=AU.ctx,d=.34+Math.random()*.24,o=osc('sawtooth',f*.25,t,t+d+.05),b=filt('bandpass',VR(f*7,.12),4.5),g=c.createGain();
  o.frequency.linearRampToValueAtTime(f*.25*VR(1.6,.15),t+d*.7);o.frequency.linearRampToValueAtTime(f*.25*VR(1.1,.1),t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.05*v,t+d*.2);g.gain.linearRampToValueAtTime(.035*v,t+d*.75);g.gain.exponentialRampToValueAtTime(.0005,t+d);o.connect(b);b.connect(g);route(g,null,.15)}
// until the show opens them, the prizes' gold and crystals are not on the counters yet, nor their chests in the posts
const cnPend=()=>ISL.brA?ISL.brA.pend:CN.brAnim?CN.brAnim.pend:null;
{const _rg=renderGold;renderGold=function(){const P=CN.on&&!zMode()?cnPend():null;if(!P)return _rg.apply(this,arguments);
  tweenNum($('mGold'),SAVE.gold-P.gold);tweenNum($('mGems'),(SAVE.gems||0)-P.gems);renderTop()}}
{const _rr=renderGearRow;renderGearRow=function(){const r=_rr.apply(this,arguments),P=CN.on&&!zMode()?cnPend():null;if(P)for(const s of P.slots){const el=$('homeGear').querySelector(`[data-ps="${s}"]`);if(el)el.style.visibility='hidden'}return r}}
// changing to the Zombie or starting a run ends the show
{const _sr=startRun;startRun=function(){if(ISL.brA)cnBrShowEnd();return _sr.apply(this,arguments)}}
{const _ms=modeSwitch;modeSwitch=function(){if(ISL.brA)cnBrShowEnd();return _ms.apply(this,arguments)}}
// ------------------------------------------------ the stops of the path: the islands and the balconies of the prizes of the bridges from the
// open islands; where the finger leaves it the camera settles on the nearest (a balcony just rests there, an island takes the hero along); a
// flick goes on to the next island
function cnIslStops(){const s=[],S=cnS();for(let i=0;i<ARENAS.length;i++){s.push({v:i,i});if(ARENAS[i+1]&&(cnOpen(i)||S.all))cnBrGeo(i).Z.forEach((c,r)=>s.push({v:i+c/CNI_GAP,i,r}))}return s}
function cnIslSettle(v,vel){if(Math.abs(vel||0)>.002){const j=clamp(vel>0?Math.ceil(ISL.view+.04):Math.floor(ISL.view-.04),0,ARENAS.length-1);ISL.rest=null;cnIslGo(j);return}   // a flick: on to the next island
  const st=cnIslStops();let b=st[0];for(const s of st)if(Math.abs(s.v-v)<Math.abs(b.v-v))b=s;
  if(b.r==null){ISL.rest=null;cnIslGo(b.i)}else{ISL.rest=b.v;ISL.go=null;sfx('ui')}}
// the balcony the camera is on (or near): which bridge, which prize, how near
function cnStopNear(v){let b=null;const S=cnS(),i0=Math.floor(v);for(const i of[i0-1,i0,i0+1]){if(!ARENAS[i]||!ARENAS[i+1]||!(cnOpen(i)||S.all))continue;
  cnBrGeo(i).Z.forEach((c,r)=>{const dd=Math.abs(v-(i+c/CNI_GAP));if(!b||dd<b.dd)b={i,r,dd}})}return b&&b.dd<.11?Object.assign(b,{a:1-Math.min(1,b.dd*9)}):null}
// the words of a balcony: the bridge it is on, its prize and when it is yours (or taken), the planks of the bridge
function cnStopText(L,t,rk){const d=L.dpr,i=rk.i,j=rk.r+1,p=cnBrPrize(i,j),th=cnBrTh(i,j),took=cnPrizeTaken(i,j),nx=ARENAS[i+1],a=rk.a;if(a<=.02)return;
  ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';ctx.lineJoin='round';const font=n=>`${Math.round(n*d)}px "Lilita One", sans-serif`,out=(s,x,y,c,w)=>{ctx.lineWidth=w*d;ctx.strokeStyle=INK;ctx.strokeText(s,x,y);ctx.fillStyle=c;ctx.fillText(s,x,y)};
  let y=L.lab+20*d;ctx.font=font(12);const tag=`PREMIO ${j}`,ttl=`Verso ${nx.n}`,tw=ctx.measureText(tag).width,gap=7*d;let ns=21;ctx.font=font(ns);let nw=ctx.measureText(ttl).width;const room=L.tr-L.tl;
  while(ns>13&&tw+gap+nw>room){ns-=1;ctx.font=font(ns);nw=ctx.measureText(ttl).width}const mid=w=>clamp(L.cx,L.tl+w/2,L.tr-w/2),x0=mid(tw+gap+nw)-(tw+gap+nw)/2;
  ctx.textAlign='left';ctx.font=font(12);out(tag,x0,y-1.5*d,'#d8b878',3.2);ctx.font=font(ns);out(ttl,x0+tw+gap,y,'#fff7e6',4.6);
  y+=20*d;ctx.textAlign='center';ctx.font=font(12);const pl=took?`Premio preso: ${cnPrizeTxt(p)}`:`Premio a ${th} assi: ${cnPrizeTxt(p)}`,pw=ctx.measureText(pl).width+30*d,px=mid(pw)-pw/2;
  cnRR(px,y-12.5*d,pw,18*d,8*d);ctx.fillStyle='rgba(0,0,0,.45)';ctx.fill();cnPrizeGlyph(p,px+12*d,y-3.5*d,d*.9);ctx.textAlign='left';out(pl,px+22*d,y+.5*d,took?'#b8ab90':cnPrizeCol(p),3);
  ctx.textAlign='center';y=L.info;ctx.font=font(14);const line=`${cnBrHave(i)}/${cnBrNeed(i)} assi per ${nx.n}`,lw=ctx.measureText(line).width;cnPlankGlyph(L.cx-lw/2-8*d,y-5*d,d*1.15);out(line,L.cx+10*d,y,'#ecd2a2',3.4);
  ctx.restore()}
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
function cnPlayLbl(){const b=$('playBtn');if(!b)return;const on=CN.on&&!zMode()&&ISL.view!=null&&cnIncOn(cnPlayIsl());if(b._inc===on)return;b._inc=on;b.classList.toggle('cnInc',on);const sp=b.querySelector('span');if(sp)sp.textContent=on?'Incubo':'Gioca'}
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
#wrap:has(>.screen:not([hidden])) :is(#cnFu,#cnHud,#cnTow){visibility:hidden}
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
.cnBridge.done{border-color:#ffd84a;box-shadow:0 0 14px rgba(255,216,74,.35)}
.cnPrizeL{display:flex;align-items:center;gap:8px;margin:5px auto 0;max-width:340px;padding:5px 10px;border-radius:12px;background:rgba(0,0,0,.3);border:2px solid #6a5a3a;font-size:13px;line-height:1.25;color:#f2e6cc;text-align:left}
.cnPrizeL svg{width:24px;height:24px;flex:0 0 auto}.cnPrizeL span{flex:1;min-width:0}.cnPrizeL b{color:var(--gold);font-weight:400;font-family:var(--display)}
.cnFlyChest{position:fixed;z-index:60;width:62px;pointer-events:none;will-change:transform}.cnFlyChest svg{width:100%;height:auto;display:block;filter:drop-shadow(0 4px 0 rgba(0,0,0,.4))}.cnBridge.done i em{background:linear-gradient(90deg,#ffd84a,#fff3b0)}.cnIncL{border-color:#c0392b;color:#ffd6d6}
.cnN.lock .cnPic img,.cnSel.lock .cnSh img{filter:brightness(.1) saturate(0)}
#menu:not(.zmode) #homeStage{touch-action:none}   /* the islands go up and down under the finger (in the Zombie the page scrolls as before) */
#playBtn.cnInc{background:linear-gradient(180deg,#e5484d,#8a1020)!important;box-shadow:0 0 22px rgba(255,60,60,.55),inset 0 -4px 0 rgba(0,0,0,.25)!important;color:#fff}
@media (prefers-reduced-motion:reduce){.cnRelC,.cnN.sel .cnPic,.cnBr.on .fl,#cnFu.pop b,#cnFu.sss b,#cnFu.burst small,.sk.cnLand,.sk.cnLeg::after,#cnPremi{animation:none}}`;

cnEnsure();cnPremiInit();
