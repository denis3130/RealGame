// ===================================================================== CLASSICA NUOVA (anteprima, 20 ottobre)
// Denis: «ok creami le cose che mi hai elencato su una cosa a parte senza intaccare il progetto principale». Questo file NON è in
// src/ordine.txt: lo mette python3 anteprime/mk_classica.py in una copia del gioco (ramo classica-nuova). CN.on lo spegne.
// Seconda versione (Denis: «mi piace la grafica delle cose che hai aggiunto ma non la meccanica […] ispirandoti ai giochi più in foga»,
// poi le sue risposte alle domande): la partita d'arena sono 5 minuti di ondate e poi il boss (cnWave*); la Furia a catena (CN_FU); le
// carte con la rarità a sorpresa (CN_RAR); le evoluzioni spettacolari (CN_EVO); la Nemesi, il nemico che ti uccide, si prende l'oro della
// partita e torna a cercarti (cnNem*: buffa o spavalda, e per le spavalde un po' di sangue: «aggiungi pure il sangue se necessario»).
// Restano della prima versione la mappa del mondo coi bracieri (senza stelle), il menu con «Premi», le élite coi poteri (CN_AFX), la Torre
// e la Corsa dei boss con le reliquie. Il salvataggio nuovo sta in SAVE.cn (vittorie, record, reliquie, Torre, Corsa, Nemesi, oro dei custodi).
const CN={on:true,next:null,last:null,fx:[],err:0,sel:0,sub:null,pool:null,poolR:0,bub:[],lances:[],dr:[],rar:null,revEnd:0,revTok:0,forceRar:null,gAcc:0,gSkip:0,wS:-1};
function cnS(){const S=SAVE.cn||(SAVE.cn={});S.stars=S.stars||{};S.relics=S.relics||{};S.tower=S.tower||{};S.rush=S.rush||{};S.best=S.best||{};S.nem=S.nem||[];S.nemOut=S.nemOut||[];S.bossGold=S.bossGold||{};return S}
const cnErr=err=>{if(CN.err++<6)console.error('classica nuova:',err)};
const cnBoss=i=>ARENAS[i].bt||BOSSZ[ARENAS[i].boss]||'golem';
const cnWon=i=>!!((cnS().stars[i]||0)&1);   // stars[i]: il primo bit è la vittoria (le stelle di prima non ci sono più)
const cnOpen=i=>i===0||!!cnS().all||cnWon(i-1);
const cnLit=()=>ARENAS.filter((_,i)=>cnWon(i)).length;
function cnPick(){const S=cnS();let p=S.pick;if(p==null||!ARENAS[p]||!cnOpen(p)){p=0;for(let i=0;i<ARENAS.length;i++)if(cnOpen(i))p=i}return p}
// una partita della Classica nuova: arena a ondate, Torre o Corsa (non l'Abisso di sempre né la sfida del giorno)
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
function cnGiveAfx(e,n,ks){if(!e||isBoss(e.type)||e.cnAnchor)return;ks=ks||shuffle(Object.keys(CN_AFX)).slice(0,n);e.cnAfx=ks;e.cnCalm=0;e.cnSh=e.cnShM=0;
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

// ---------------------------------------------------------------- 1 ondate a tempo (come la modalità a tempo di Archero 2, Megabonk, Survivor.io)
// l'arena di oggi (460×820); 5 minuti di ondate sempre più fitte, un'ondata grande ogni minuto con le élite, poi la stanza del boss.
// G.room sale da 1 a 9 col tempo, così vita, danno e cadenza dei nemici crescono come stanza dopo stanza. Un segnaposto invisibile
// (cnAnchor) tiene la stanza aperta: non si chiude mai finché le ondate non sono finite.
const CN_WV={dur:300,cap0:6,cap1:12,max:16,gap0:1.45,gap1:.5,bigs:[60,120,180,240]};   // max: mai più di 16 insieme (i modelli 3D sono la parte che costa)
Object.defineProperty(ET,'cnanchor',{value:{r:1,hp:1,cdmg:0,gold:0,name:'',title:''},enumerable:false,configurable:true});ECOL.cnanchor='#000000';XPV.cnanchor=0;
function cnAnchor(){if(G.enemies.some(e=>e.cnAnchor))return;const e=makeE('cnanchor',AW/2,TOP-400,1e9);if(SAVE.seen)delete SAVE.seen.cnanchor;e.cnAnchor=1;e.spawn=1e9;e.hidden=true;G.enemies.push(e)}
function cnWaveStart(){const S=cnS(),n=cnNemWanted();G.cnW={t:0,sp:.8,bi:0,done:false,nemT:n?rand(70,200):-1,nemId:n?n.id:null};cnAnchor();CN.wS=-1;
  banner('Ondate · 5 minuti','Resisti fino al custode',2.6);$('roomChip').classList.add('cnw');cnWaveHud(CN_WV.dur)}
function cnWavePool(){if(CN.poolR!==G.room||!CN.pool){CN.poolR=G.room;CN.pool=compositionFor(G.room).filter(t=>ET[t]&&!isBoss(t)&&t!=='cnanchor')}return CN.pool.length?CN.pool:['slime']}
function cnWaveSpot(r){for(let k=0;k<30;k++){const x=rand(L+30,R-30),y=rand(TOP+46,BOT-60),d=Math.hypot(x-P.x,y-P.y);if(d<165||d>480)continue;if(G.rocks.some(q=>Math.hypot(q.x-x,q.y-y)<q.r+r+12))continue;return{x,y}}return freeSpot(r,TOP+40,BOT-80)}
function cnWaveSpawn(n,elite){const pool=cnWavePool();for(let i=0;i<n;i++){const t=pk(pool),s=cnWaveSpot(ET[t].r);G.enemies.push(makeE(t,s.x,s.y,.9,elite?true:eliteRoll(t)))}}
function cnBigWave(n){banner('Ondata '+(n+1)+'!',n>=4?"L'ultima, poi il custode":'Arrivano in tanti',1.8);sfx('roar');shake(2);const room=CN_WV.max-G.enemies.filter(e=>!e.dead&&!e.cnAnchor).length,el=n>=3?2:1;
  cnWaveSpawn(el,true);cnWaveSpawn(clamp(Math.min(2+n,room-el),0,6))}
function cnWaveTick(dt){const W=G.cnW;if(!W||W.done||G.state!=='play')return;W.t+=dt;const k=Math.min(1,W.t/CN_WV.dur),room=Math.min(9,1+Math.floor(k*9));if(room!==G.room)G.room=room;
  const alive=G.enemies.filter(e=>!e.dead&&!e.cnAnchor).length,cap=Math.round(CN_WV.cap0+(CN_WV.cap1-CN_WV.cap0)*k);
  W.sp-=dt;if(W.sp<=0){W.sp=CN_WV.gap0+(CN_WV.gap1-CN_WV.gap0)*k;if(alive<cap)cnWaveSpawn(alive<cap-4&&k>.25?2:1)}
  if(!alive&&W.t>2)cnWaveSpawn(2);
  if(W.bi<CN_WV.bigs.length&&W.t>=CN_WV.bigs[W.bi]){W.bi++;cnBigWave(W.bi)}
  if(W.nemT>0&&W.t>=W.nemT){W.nemT=-1;cnNemInvade()}
  if(W.t>=CN_WV.dur)cnWaveEnd()}
// alla fine il bottino rimasto a terra è tuo, i nemici fuggono nel fumo e si va dal custode
function cnWaveEnd(){const W=G.cnW;W.done=true;let g=0;for(const c of G.coins)g+=c.gr?1:(1+Math.floor(effRoom()/5));G.coins=[];if(g){G.gold+=g;text(P.x,P.y-52,'+'+g+' oro','#ffd84a',15)}
  let xp=0;for(const o of G.orbs)xp+=o.v;G.orbs=[];if(xp)gainXp(xp);
  for(const e of G.enemies)if(!e.dead&&!e.cnAnchor&&!(e.spawn>0))for(let q=0;q<5;q++)G.fx.push({k:'puff',x:e.x+rand(-10,10),y:e.y-e.r,vx:rand(-50,50),vy:rand(-60,-10),t:rand(.3,.5),r:rand(4,8)});
  G.enemies=[];G.eproj=[];$('roomChip').classList.remove('cnw');
  banner('Il custode si risveglia!',ARENAS[G.arena||0].n,1.8);sfx('roar');shake(4);
  G.prevState='play';G.state='trans';G.fadeDir=1;G.fade=0}
// nelle ondate la stanza non si ripulisce mai: esperienza e monete volano da sole verso l'eroe poco dopo essere cadute (le prende il gioco)
function cnWaveMagnet(dt){for(const o of G.orbs){if(!(o.t>.9))continue;const dx=P.x-o.x,dy=P.y-6-o.y,d=Math.hypot(dx,dy)||1,sp=Math.min(d,(220+o.t*260)*dt);o.x+=dx/d*sp;o.y+=dy/d*sp;o.vx=o.vy=0}
  for(const c of G.coins){if(!(c.t>1.1))continue;const dx=P.x-c.x,dy=P.y-c.y,d=Math.hypot(dx,dy)||1,sp=Math.min(d,(240+c.t*240)*dt);c.x+=dx/d*sp;c.y+=dy/d*sp;c.vx*=.6;c.vy*=.6}}
function cnWaveHud(s){cnEnsure();const el=$('cnWaveTxt');if(!el)return;el.textContent=cnMS(s);$('roomChip').classList.toggle('hot',s<=10&&s>0)}

// ---------------------------------------------------------------- 2 Furia a catena (come Devil May Cry e Hi-Fi Rush)
// uccidere di fila senza farti colpire fa salire la Furia; senza uccisioni cala, un colpo preso la spezza; moltiplica oro ed esperienza;
// a SSS l'eroe prende fuoco: danni +30% e frecce che bruciano
const CN_FU=[{l:'D',w:'Deciso',n:3,m:1.1,c:'#a9bdd0'},{l:'C',w:'Carico',n:8,m:1.2,c:'#7bd88f'},{l:'B',w:'Brutale',n:15,m:1.35,c:'#3fd0c9'},{l:'A',w:'Assurdo',n:24,m:1.5,c:'#ffd84a'},
  {l:'S',w:'Spietato',n:36,m:1.7,c:'#ff9a3c'},{l:'SS',w:'Sanguinario',n:52,m:2,c:'#ff5a4a'},{l:'SSS',w:'Sovrumano',n:72,m:2.5,c:'#e48aff'}];
function cnFuria(){return G.cnF||(G.cnF={n:0,lv:-1,idle:0,max:-1})}
function cnFuLv(n){let l=-1;for(let i=0;i<CN_FU.length;i++)if(n>=CN_FU[i].n)l=i;return l}
const cnFuMul=()=>{const F=G&&G.cnF;return F&&F.lv>=0?CN_FU[F.lv].m:1};
function cnFuAdd(v){const F=cnFuria();F.n+=v;F.idle=0;cnFuCheck()}
function cnFuCheck(){const F=cnFuria(),l=cnFuLv(F.n);if(l===F.lv)return;const up=l>F.lv;F.lv=l;if(l>F.max)F.max=l;P.cnBlaze=l>=CN_FU.length-1;cnFuHud(true,up);if(up)cnFuSting(l)}
function cnFuTick(dt){const F=cnFuria();F.idle+=dt;if(F.idle>2.6&&F.n>0){F.n=Math.max(0,F.n-dt*(2.5+F.n*.07));cnFuCheck()}cnFuHud(false);
  if(P.cnBlaze&&!LOWFX&&Math.random()<dt*22)CN.fx.push({k:'ember',x:P.x+rand(-12,12),y:P.y-rand(4,30),vx:rand(-14,14),vy:rand(-70,-30),t:.6,max:.6})}
function cnFuHit(){const F=cnFuria();if(F.n<=0)return;const was=F.lv;F.n*=.35;F.idle=0;cnFuCheck();if(was>=2){text(P.x,P.y-60,'Furia spezzata!','#ff8a7a',14);tone(420,110,.3,'sawtooth',.05)}}
function cnFuSting(l){const f=[392,440,494,523,587,659,784][l]||523;tone(f,f*1.5,.12,'square',.035);tone(f*1.25,f*2,.14,'triangle',.04,.07);if(l>=4)tone(f*1.5,f*3,.22,'sawtooth',.03,.14);
  if(l>=CN_FU.length-1){sfx('shimmer',2);tone(110,55,.6,'sawtooth',.05,.05)}vib([20])}
function cnFuHud(force,up){const F=cnFuria();let el=$('cnFu');if(!el){el=document.createElement('div');el.id='cnFu';el.innerHTML='<b></b><span></span><i><u></u></i><small></small>';$('banner').parentElement.appendChild(el)}
  const now=performance.now();if(!force&&now-(CN.fuT||0)<90)return;CN.fuT=now;const l=F.lv,R=l>=0?CN_FU[l]:null,nx=CN_FU[l+1],hid=l<0;if(el.hidden!==hid)el.hidden=hid;
  if(force||el._l!==l){el._l=l;el.querySelector('b').textContent=R?R.l:'·';el.querySelector('span').textContent=R?R.w:'Furia';
    el.querySelector('small').textContent=R?'×'+String(R.m).replace('.',',')+' oro ed esperienza':'';el.style.setProperty('--fc',R?R.c:'#a9bdd0');el.classList.toggle('sss',l>=CN_FU.length-1);
    if(up){el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')}}
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
// spavalda. Nelle ondate la più ricercata invade la partita col tuo sacco sulle spalle e ti prende in giro; battila e ti riprendi l'oro più
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
  if(!k||k.cnAnchor){k=null;let bd=280;for(const e of G.enemies){if(e.dead||e.cnAnchor||e.spawn>0||isBoss(e.type))continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;k=e}}
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
function cnNemInvade(){const n=cnS().nem.find(q=>q.id===G.cnW.nemId);if(!n||!ET[n.type])return;const s=cnWaveSpot(ET[n.type].r);
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
      for(let i=0;i<3;i++){const ph=t*7+i*2.1+f.x*.1,hx=f.x+(i-1)*f.r*.45,hh=(6+3*Math.sin(ph))*fl;ctx.fillStyle=i%2?'#ffc93c':'#ff8a3c';ctx.beginPath();ctx.moveTo(hx-3.4,f.y);ctx.quadraticCurveTo(hx+Math.sin(ph)*2,f.y-hh*1.7,hx+3.4,f.y);ctx.fill()}}
    else if(f.k==='meteor'){const p=1-a,x=f.e&&!f.e.dead?f.e.x:f.x,y=f.e&&!f.e.dead?f.e.y:f.y,r=12+26*p;ctx.strokeStyle=`rgba(255,110,50,${.25+.55*p})`;ctx.lineWidth=2.5;ell(x,y+4,r,r*.45);ctx.stroke();ctx.fillStyle=`rgba(40,10,0,${.25*p})`;ell(x,y+4,r*.8,r*.36);ctx.fill()}
    else if(f.k==='scorch'){ctx.fillStyle=`rgba(40,18,8,${.45*a})`;ell(f.x,f.y+3,f.r,f.r*.45);ctx.fill();if(!LOWFX&&a>.6){glow('255,120,40',f.x,f.y,f.r,.2*(a-.6)/.4)}}
    else if(f.k==='bomb'){const p=1-a,bl=Math.sin(t*(10+p*22))>0;ctx.save();ctx.fillStyle=`rgba(255,70,40,${.08+.2*p})`;ell(f.x,f.y,f.r,f.r*.55);ctx.fill();ctx.strokeStyle=`rgba(255,${bl?220:90},70,.85)`;ctx.lineWidth=2.5;ctx.setLineDash([6,5]);ell(f.x,f.y,f.r,f.r*.55);ctx.stroke();ctx.setLineDash([]);ctx.restore();
      ink(2.4);circ(f.x,f.y-7,8);fs('#3b332b');ctx.strokeStyle='#8a5a20';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(f.x+5,f.y-13);ctx.quadraticCurveTo(f.x+9,f.y-19,f.x+12,f.y-17);ctx.stroke();
      if(bl&&!LOWFX)glow('255,220,120',f.x+12,f.y-17,8,.9);ctx.fillStyle='#ffe27a';circ(f.x+12,f.y-17,2.2);ctx.fill()}
    else if(f.k==='portal'){const p=1-a,s=Math.sin(Math.min(1,p*2.2)*Math.PI/2)*(a<.15?a/.15:1),r=40*s;if(r<1)continue;ctx.save();if(!LOWFX){ctx.globalCompositeOperation='lighter';glow('220,40,40',f.x,f.y,r*2,.5*s);ctx.globalCompositeOperation='source-over'}
      ctx.fillStyle='rgba(20,0,0,.85)';ell(f.x,f.y,r,r*.45);ctx.fill();ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(255,${60+i*40},60,${.7-.15*i})`;ctx.beginPath();ctx.ellipse(f.x,f.y,r*(1-i*.22),r*.45*(1-i*.22),0,t*(3+i)+i,t*(3+i)+i+4.2);ctx.stroke()}ctx.restore()}}
  for(const e of G.enemies){if(!(e.cnAfx||e.cnName)||e.dead||e.spawn>0||e.hidden)continue;
    if(e.cnBig){ctx.strokeStyle=e.cnNem?'rgba(220,50,50,.6)':'rgba(255,201,60,.6)';ctx.lineWidth=3;ell(e.x,e.y+4,e.r*1.7,e.r*.7);ctx.stroke()}
    if(e.cnGel){ctx.save();ctx.fillStyle='rgba(200,240,255,.07)';ell(e.x,e.y+4,64,53);ctx.fill();ctx.strokeStyle='rgba(200,240,255,.5)';ctx.lineWidth=2;ctx.setLineDash([3,6]);ctx.lineDashOffset=t*10;ell(e.x,e.y+4,64,53);ctx.stroke();ctx.setLineDash([]);ctx.restore()}
    if(e.cnFur&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,80,50',e.x,e.y,e.r*1.8,.22+.08*Math.sin(t*9));ctx.restore()}}
  const F=G.cnF;if(F&&F.lv>=4&&!LOWFX&&G.state!=='dead'){const c=cnRgb(CN_FU[F.lv].c);ctx.save();ctx.globalCompositeOperation='lighter';glow(c,P.x,P.y+4,34+4*Math.sin(t*8),.32);ctx.restore()}
  if(P.cnCyclone&&G.state==='play'){ctx.save();ctx.lineWidth=3;for(let i=0;i<3;i++){const a0=t*(4+i)+i*2.1;ctx.strokeStyle=`rgba(190,235,255,${.28-.06*i})`;ctx.beginPath();ctx.ellipse(P.x,P.y-6,62-i*9,(62-i*9)*.8,0,a0,a0+2.2);ctx.stroke()}ctx.restore()}}
function cnDrawMeteor(f){const p=1-f.t/f.max,x=f.e&&!f.e.dead?f.e.x:f.x,y=f.e&&!f.e.dead?f.e.y:f.y,sx=x+130*(1-p),sy=y-340*(1-p)-8;ctx.save();
  if(!LOWFX){ctx.globalCompositeOperation='lighter';for(let i=1;i<=5;i++){const q=Math.min(1,1-p+i*.05);glow('255,140,50',x+130*q,y-340*q-8,14-i,.3)}glow('255,200,90',sx,sy,26,.8);ctx.globalCompositeOperation='source-over'}
  ink(2.2);circ(sx,sy,8.5);fs('#5a2a14');ctx.fillStyle='#ff8a3c';circ(sx-2,sy-2,5);ctx.fill();ctx.fillStyle='#ffe27a';circ(sx-3,sy-3,2.4);ctx.fill();ctx.restore()}
function cnDrawDragon(d){ctx.save();const n=d.tr.length;
  if(!LOWFX){ctx.globalCompositeOperation='lighter';for(let i=0;i<n;i+=2){const[x,y]=d.tr[i],k=i/n;glow('255,140,50',x,y,10+18*k,.12+.25*k)}ctx.globalCompositeOperation='source-over'}
  for(let i=0;i<n;i+=2){const[x,y]=d.tr[i],k=i/n;ctx.fillStyle=`rgba(255,${(150+80*k)|0},60,${(.3+.5*k).toFixed(2)})`;circ(x,y,3+7*k);ctx.fill()}
  ctx.translate(d.x,d.y);ctx.rotate(d.a);const fl=Math.sin(G.t*30)*1.5;
  ctx.fillStyle='rgba(255,170,60,.85)';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-6,-6+i*4);ctx.lineTo(-24-i*3+fl,-12+i*8);ctx.lineTo(-10,-2+i*4);ctx.fill()}
  ink(2.2);ctx.beginPath();ctx.moveTo(24,0);ctx.quadraticCurveTo(15,-10,0,-10);ctx.lineTo(-10,-14);ctx.lineTo(-6,-4);ctx.lineTo(-12,0);ctx.lineTo(-6,4);ctx.lineTo(-10,14);ctx.lineTo(0,10);ctx.quadraticCurveTo(15,10,24,0);ctx.closePath();
  const g=ctx.createLinearGradient(-12,0,24,0);g.addColorStop(0,'#e0441a');g.addColorStop(1,'#ffe27a');ctx.fillStyle=g;ctx.fill();ctx.stroke();
  ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(22,1.5);ctx.lineTo(7,3.5);ctx.stroke();ctx.fillStyle='#fff6c8';circ(7,-4.5,2.4);ctx.fill();ctx.fillStyle='#191714';circ(7.8,-4.5,1.1);ctx.fill();
  ink(1.8);ctx.beginPath();ctx.moveTo(-2,-9);ctx.lineTo(-15,-19);ctx.lineTo(-6,-7);ctx.closePath();fs('#fff1c8');ctx.beginPath();ctx.moveTo(-2,9);ctx.lineTo(-15,19);ctx.lineTo(-6,7);ctx.closePath();fs('#fff1c8');ctx.restore()}
function cnDrawAir(){const t=G.t;
  for(const f of CN.fx){
    if(f.k==='star'){const p=1-f.t/f.max,e=f.e,x=e?e.x:f.x,y=(e?e.y-e.r:f.y)-4,sx=x+90*(1-p),sy=y-280*(1-p);
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,230,140,.45)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(sx+46,sy-140);ctx.lineTo(sx,sy);ctx.stroke();glow('255,230,140',sx,sy,24,.8);ctx.restore();
      ink(2);ctx.beginPath();for(let k=0;k<10;k++){const r=k%2?3.4:8,a=k*Math.PI/5-Math.PI/2+t*6;ctx.lineTo(sx+Math.cos(a)*r,sy+Math.sin(a)*r)}ctx.closePath();fs('#fff1a8')}
    else if(f.k==='meteor')cnDrawMeteor(f);
    else if(f.k==='shard'){const a=f.t/f.max;ctx.save();ctx.translate(f.x,f.y-8);ctx.rotate(f.rot+t*9);ctx.globalAlpha=a;ink(1.4);ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(2.6,2);ctx.lineTo(-2.6,2);ctx.closePath();fs('#dff4ff');ctx.restore()}
    else if(f.k==='ember'){const a=f.t/f.max;ctx.fillStyle=`rgba(255,${(140+90*a)|0},60,${a.toFixed(2)})`;circ(f.x,f.y,1.8+a);ctx.fill()}}
  for(const d of CN.dr)cnDrawDragon(d);
  if(P.cnBlaze&&G.state!=='dead'){ctx.save();if(!LOWFX){ctx.globalCompositeOperation='lighter';glow('255,120,40',P.x,P.y-14,42,.32+.1*Math.sin(t*12));ctx.globalCompositeOperation='source-over'}
    for(let i=0;i<6;i++){const ph=t*8+i*1.7,ax=P.x+Math.cos(i*1.05+t*1.5)*11,h=13+6*Math.sin(ph);ctx.fillStyle=i%2?'rgba(255,201,60,.8)':'rgba(255,110,40,.75)';ctx.beginPath();ctx.moveTo(ax-4,P.y-1);ctx.quadraticCurveTo(ax+Math.sin(ph)*3,P.y-1-h*1.7,ax+4,P.y-1);ctx.fill()}ctx.restore()}
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
{const _ue=updEnemy;updEnemy=function(e,dt){if(e.cnAnchor)return;if(CN.on&&e.cnSayQ&&!(e.spawn>0)){const k=e.cnSayQ;e.cnSayQ=null;cnNemTalk(e,k,true)}
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
  if(P.cnBlaze&&!dot){dmg*=1.3;if(!isBoss(e.type)){e.burn=Math.max(e.burn||0,2);if(!(e.burnTick>0))e.burnTick=.3}}
  // l'élite con lo scudo: lo scudo prende il colpo per primo e torna dopo 4 secondi senza colpi
  if(e.cnAfx){e.cnCalm=0;if(e.cnSh>0&&dmg>0){const a=Math.min(e.cnSh,dmg);e.cnSh-=a;e.cnShT=4;e.cnShF=.12;dmg-=a;if(e.cnSh<=0)cnShBreak(e);if(dmg<=.01){G.fx.push({k:'spark',x:e.x+rand(-9,9),y:e.y-e.r-e.z,t:.15});return}}}
  const r=_he.call(this,e,dmg,crit,dot);
  try{if(e.cnNem&&!dot&&!e.dead){if(e.hp<e.max*.3&&!e.cnLow){e.cnLow=1;cnNemTalk(e,'low',true)}else if(Math.random()<.4)cnNemTalk(e,'hurt')}
    if(P.cnThunder&&!dot&&!CN.inTh&&(e.cnThT||0)<G.t&&Math.random()<.35){e.cnThT=G.t+.6;cnThunder(e)}}catch(err){cnErr(err)}
  return r}}
{const _ke=killE;killE=function(e,noLoot){const was=e.dead,boss=isBoss(e.type);const r=_ke.apply(this,arguments);
  try{if(CN.on&&G&&!was&&!e.cnAnchor){const run=cnRun();
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
  try{G.cnA=null;G.tower=null;G.rush=null;G.relics=[];G.cnKills=0;G.cnWave=false;G.cnW=null;G.cnF=null;CN.fx=[];CN.last=null;CN.gAcc=0;CN.gSkip=0;CN.vol=0;CN.metT=null;CN.drT=null;CN.dr=[];CN.lances=[];CN.bub=[];CN.evoT=0;
    if(nx==='tower'&&G.mode==='inf'){CN.last='tower';G.tower={wk:cnWeek(),mods:cnTowerMods()};for(const m of G.tower.mods)m.f();const s=_ms.apply(this,arguments),k=s.findIndex(q=>q.c===20);return s.slice(0,k+1)}
    if(nx==='rush'){const list=cnRushList();if(list.length){CN.last='rush';G.rush={list,i:0,beat:0};cnRushSet(0);return[{c:ROOMS}]}}
    if(G.mode==='camp'&&!G.daily){const a=cnPick();G.cnA=a;G.arena=a;G.chapter=ARENAS[a].ch;G.diff=ARENAS[a].diff;G.bossLvl=null;G.cnWave=true;return[{c:1},{c:ROOMS}]}}catch(err){cnErr(err)}
  return _ms.apply(this,arguments)}}
{const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{if(CN.on&&G)cnRoomSetup()}catch(err){cnErr(err)}return r}}
function cnRoomSetup(){G.cnBlocked=false;G.cnRT=0;CN.fx=[];CN.lances=[];CN.dr=[];CN.bub=[];CN.pool=null;cnHud('');const run=cnRun();cnEnsure();$('roomChip').classList.remove('cnw','hot');if(!run)cnFuHide();
  if(G.tower&&!G.event&&!isBossRoom(G.room))banner('Torre · Piano '+G.room,G.tower.mods.map(m=>m.n).join(' · '),2.2);
  if(G.rush&&!G.event){const sm=$('banner').querySelector('small');if(sm)sm.textContent=`Corsa dei boss · ${G.rush.i+1} di ${G.rush.list.length}`}
  if(G.cnWave&&G.cnA!=null&&!G.event&&!G.cnW&&!isBossRoom(G.room))cnWaveStart();
  const b=run&&G.enemies.find(e=>isBoss(e.type));if(b){const g=cnS().bossGold[b.type];if(g)cnLater(()=>banner(ET[b.type].name,`Ha il tuo oro: ${g} · battilo per riprenderlo`,2.6),3000)}}
{const _rc=onRoomClear;onRoomClear=function(){const r=_rc.apply(this,arguments);try{if(CN.on&&G&&G.tower&&!G.event&&isBossRoom(G.room)&&G.room<20)cnLater(()=>cnRelicOffer('Premio del custode'),1400)}catch(err){cnErr(err)}return r}}
{const _ns=nextStep;nextStep=function(){if(!CN.on||!G)return _ns.apply(this,arguments);
  try{if(G.rush){cnRushSet(G.rush.i);P.queue=[];buildRoom();return}if(G.tower&&!G.seq[G.si+1]){endRun(true);return}}catch(err){cnErr(err)}
  return _ns.apply(this,arguments)}}
{const _up=update;update=function(dt){if(!CN.on||!G||!P)return _up.apply(this,arguments);const u0=P.ult||0,g0=G.gold;
  try{if(G.cnW&&!G.cnW.done&&G.state==='play')cnWaveTick(dt)}catch(err){cnErr(err)}const r=_up.apply(this,arguments);try{cnPost(dt,u0,g0)}catch(err){cnErr(err)}return r}}
function cnPost(dt,u0,g0){for(const b of CN.bub)if(G.state!=='dead')b.t-=dt;if(CN.bub.length)CN.bub=CN.bub.filter(b=>b.t>0);
  if(G.state==='trans'||G.state==='dead')return;const run=cnRun();cnAfxTick(dt);
  if(run){cnFuTick(dt);const d=G.gold-g0-CN.gSkip;CN.gSkip=0;if(d>0){CN.gAcc+=d*(cnFuMul()-1);const add=Math.floor(CN.gAcc);if(add>0){G.gold+=add;CN.gAcc-=add}}
    if(G.cnW&&!G.cnW.done){const s=Math.max(0,Math.ceil(CN_WV.dur-G.cnW.t));if(s!==CN.wS){CN.wS=s;cnWaveHud(s)}cnWaveMagnet(dt)}cnEvoTick(dt)}
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
  const T0=SAVE.trophies||0,mode=G.rush?'rush':G.tower?'tower':G.cnA!=null?'arena':null,a=G.cnA,wt=G.cnW?(G.cnW.done?CN_WV.dur:G.cnW.t):0,fuMax=G.cnF?G.cnF.max:-1,boss=!!(G.cnW&&G.cnW.done);
  if(mode==='rush'&&win)G.rush.beat++;
  // chi ti ha ucciso si prende l'oro della partita (ritirarsi invece lo lascia a te)
  let stolen=0;if(run&&!win&&!quit){if(G.cnKiller===undefined)cnNemOnDeath();stolen=Math.max(0,Math.round(G.gold||0));G.gold=0}
  const r=_er.apply(this,arguments);
  try{cnHud('');cnFuHide();$('roomChip').classList.remove('cnw','hot');CN.next=CN.last;
    if(mode==='rush'||mode==='tower'){const o=JSON.parse(snap);for(const k of keep)if(k in o)SAVE[k]=o[k];else delete SAVE[k]}
    if(mode==='arena'){if((SAVE.trophies||0)<T0)SAVE.trophies=T0;const old=S.stars[a]||0,first=win&&!(old&1);if(win)S.stars[a]=old|1;if(first&&ARENAS[a+1])S.pick=a+1;   // la prima vittoria apre e propone l'arena dopo
      const B=S.best[a]||(S.best[a]={t:0,fu:-1,win:false});B.t=Math.max(B.t||0,Math.round(wt));B.fu=Math.max(B.fu==null?-1:B.fu,fuMax);if(win)B.win=true;
      $('eTr').innerHTML=`<div class="cnEndW"><span><b>${cnMS(Math.min(wt,CN_WV.dur))}</b><small>di ondate</small></span><span><b style="color:${fuMax>=0?CN_FU[fuMax].c:'#8f846e'}">${fuMax>=0?CN_FU[fuMax].l:'–'}</b><small>Furia massima</small></span></div>
        ${first?`<div class="cnLitL">${CN_BRAZ}Hai riacceso il braciere di ${ARENAS[a].n}!</div>`:''}`;
      $('eRoom').textContent=cnMS(Math.min(wt,CN_WV.dur));const lab=$('eRoom').nextElementSibling;if(lab)lab.textContent='Ondate';
      const hint=$('endReward').querySelector('.hint');if(hint&&/stanza 3/.test(hint.textContent))hint.textContent=`Resisti almeno ${cnMS(CN_WV.dur*2/9)} alle ondate per guadagnare una cassa.`;
      if(!win)$('endText').textContent=quit?`Ti sei ritirato dopo ${cnMS(wt)} di ondate. L'oro raccolto resta tuo.`:boss?`Il custode ti ha fermato a un passo dalla fine.`:`Hai resistito ${cnMS(wt)} alle ondate.`}
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
$('againBtn').onclick=()=>{if(CN.on)CN.next=CN.last;startRun()};
{const _sm=showMenu;showMenu=function(){CN.next=null;cnFuHide();const c=$('roomChip');if(c)c.classList.remove('cnw','hot');return _sm.apply(this,arguments)}}

// ---------------------------------------------------------------- la mappa del mondo coi bracieri della fiamma
{const _rc=renderChap;renderChap=function(){if(!CN.on||zMode())return _rc.apply(this,arguments);try{cnChap()}catch(err){cnErr(err);_rc.apply(this,arguments)}}}
$('chapCard').onclick=()=>{sfx('ui');if(zMode())openSheet('zombie');else if(CN.on)cnMapOpen();else setTab('tabRoad')};
function cnChap(){const i=cnPick(),A=ARENAS[i],S=cnS(),B=S.best[i]||{},lit=cnLit(),tt=B.win?6:Math.min(5,Math.floor((B.t||0)/60));let tr='';
  for(let m=1;m<=6;m++){const boss=m===6;tr+=(m>1?`<i class="rl ${m<=tt?'on':''}"></i>`:'')+`<span class="rn ${boss?'boss':''} ${m<=tt?'on':''} ${m===tt+1?'next':''}">${boss?SKULL_SVG(true):''}</span>`}
  const nem=S.nem.length,html=`<div><span class="ck">Arena ${i+1}${cnWon(i)?` <i class="cnCkB">${CN_BRAZ}</i>`:''}</span><h3>${A.n}</h3></div><div class="ctr"><span class="trNow cnTr">${CN_BRAZ}${lit}/${ARENAS.length}</span><div class="trBar"><i style="width:${lit/ARENAS.length*100}%"></i><span>${nem?`${nem} ${nem===1?'Nemesi ti cerca':'Nemesi ti cercano'}`:`Bracieri accesi: ${lit} su ${ARENAS.length}`}</span></div></div><div class="rtrack">${tr}<em>Mappa ›</em></div>`;
  const el=$('chapCard');if(el._h!==html){el.innerHTML=html+'<i class="candle l"></i><i class="candle r"></i>';el._h=html;el.style.setProperty('--ac',A.col);el.style.setProperty('--thumb',`url(${arenaThumb(i)})`)}}
function cnMapOpen(){cnEnsure();CN.sel=cnPick();CN.sub=null;cnMapRender();$('cnMap').hidden=false;const sc=$('cnMapIn').querySelector('.cnPath'),n=$('cnMapIn').querySelector('.cnN.sel');if(sc&&n)sc.scrollTop=n.offsetTop-sc.clientHeight/2+40}
function cnMapClose(){$('cnMap').hidden=true;renderChap()}
function cnMapRender(){const el=$('cnMapIn'),S=cnS();if(CN.sub==='tower')return cnTowerRender(el);if(CN.sub==='rush')return cnRushRender(el);if(CN.sub==='rel')return cnRelRender(el);if(CN.sub==='nem')return cnNemRender(el);
  const N=ARENAS.length,lit=cnLit(),H=N*100+46,cur=cnPick(),sc=el.querySelector('.cnPath'),top=sc?sc.scrollTop:null;
  let fire='';for(let i=0;i<N;i++)fire+=`<i class="cnBr ${cnWon(i)?'on':''}" style="--ac:${ARENAS[i].col}">${CN_BRAZ}</i>`;
  const pts=[];let nodes='';for(let i=0;i<N;i++){const y=H-58-i*100,x=50+Math.sin(i*1.3)*27;pts.push([x,y]);const op=cnOpen(i),B=S.best[i]||{};
    nodes+=`<button class="cnN ${op?'':'lock'} ${CN.sel===i?'sel':''} ${i===cur?'cur':''} ${x<50?'l':'r'}" data-a="${i}" style="left:${x}%;top:${y}px;--ac:${ARENAS[i].col}"><span class="cnPic"><img src="${arenaThumb(i)}" alt="">${op?'':`<b class="cnLk">${CN_LOCK}</b>`}<em>${i+1}</em></span><span class="cnNm">${ARENAS[i].n}<i class="cnSt">${cnWon(i)?`<b class="on">${CN_BRAZ}</b>`:op&&B.t?`<small>${cnMS(B.t)}</small>`:''}</i></span></button>`}
  let seg='';for(let i=1;i<N;i++){const[a,b]=[pts[i-1],pts[i]];seg+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${cnOpen(i)?'on':''}"/>`}
  const a=CN.sel,A=ARENAS[a],B=S.best[a]||{},op=cnOpen(a),bt=cnBoss(a),found=CN_REL.filter(r=>S.relics[r.id]).length,RL=cnRushList().length,T=S.tower,bg=S.bossGold[bt];
  el.innerHTML=`<header class="cnHd"><button class="cnX" aria-label="Chiudi">‹</button><h2>Mappa del mondo</h2><span class="cnTot">${CN_BRAZ}${lit}<small>/${N}</small></span></header>
    <div class="cnFire"><div class="cnBrs">${fire}</div><div class="cnFl"><span>La fiamma · ${lit} ${lit===1?'braciere acceso':'bracieri accesi'} su ${N}</span><span>Batti il custode per riaccendere il suo</span></div></div>
    <div class="cnPath"><div class="cnPin" style="height:${H}px"><svg class="cnLine" viewBox="0 0 100 ${H}" preserveAspectRatio="none">${seg}</svg>${nodes}</div></div>
    <div class="cnSel" style="--ac:${A.col}"><div class="cnSh"><img src="${arenaThumb(a)}" alt=""><div><span class="ck">Arena ${a+1}</span><h3>${A.n}</h3><small>Custode: ${ET[bt].name}${bg?` · <b class="cnGoldT">ha il tuo oro: ${bg}</b>`:''}</small></div></div>
      <ul class="cnRec2"><li><b>${B.t?cnMS(B.t):'–'}</b><small>Record di ondate</small></li><li><b style="color:${B.fu>=0?CN_FU[B.fu].c:'inherit'}">${B.fu>=0?CN_FU[B.fu].l:'–'}</b><small>Furia massima</small></li><li><b>${B.win?'Vinta':'Da vincere'}</b><small>Il custode</small></li></ul>
      ${op?`<button class="btn cnPlay">Gioca · 5 minuti di ondate</button>`:`<p class="cnLockP">${CN_LOCK} Vinci «${ARENAS[a-1].n}» per aprirla</p>`}</div>
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
  el.innerHTML=cnSubHead('Ricercati')+`<div class="cnSub"><p class="cnLead">Chi ti batte si prende l'oro della partita e torna a cercarti nelle ondate, col tuo sacco sulle spalle. Battilo e ti riprendi tutto, più la taglia.</p>
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

// ---------------------------------------------------------------- schermate e stile
function cnEnsure(){if($('cnMap'))return;const w=$('wrap'),mk=(id,inner)=>{const d=document.createElement('div');d.className='screen cnScr';d.id=id;d.hidden=true;d.innerHTML=`<div class="${inner}" id="${id}In"></div>`;w.appendChild(d);return d};
  mk('cnRel','cnRelBox');mk('cnMap','cnMapBox');
  for(const id of['cnRed','cnSlash']){const d=document.createElement('div');d.id=id;w.appendChild(d)}
  const chip=$('roomChip');if(chip&&!$('cnWaveTxt')){const s=document.createElement('span');s.id='cnWaveTxt';chip.appendChild(s)}
  const st=document.createElement('style');st.textContent=CN_CSS;document.head.appendChild(st)}
const CN_CSS=`
#cnHud{position:absolute;left:50%;top:calc(104px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:6;pointer-events:none;font-family:var(--display);font-size:17px;color:#fff;text-shadow:var(--tol);
  background:rgba(20,14,10,.66);border:2px solid #191714;border-radius:14px;padding:3px 12px 4px;white-space:nowrap;display:flex;gap:8px;align-items:baseline}
#cnHud b{color:var(--gold);font-weight:400}#cnHud[hidden]{display:none}
#cnWaveTxt{display:none}#roomChip.cnw #roomTxt{display:none}#roomChip.cnw #cnWaveTxt{display:inline;font-variant-numeric:tabular-nums}
#roomChip.cnw.hot{animation:cnPulse .5s ease-in-out infinite alternate}#roomChip.cnw.hot #cnWaveTxt{color:#ff8a7a}
#cnFu{position:absolute;right:10px;top:calc(122px + env(safe-area-inset-top,0px));z-index:6;pointer-events:none;display:flex;flex-direction:column;align-items:flex-end;gap:2px;--fc:#a9bdd0}
#cnFu[hidden]{display:none}
#cnFu b{display:block;font-family:var(--display);font-weight:400;font-size:46px;line-height:.9;color:var(--fc);font-style:italic;transform:skewX(-8deg);
  text-shadow:0 4px 0 #191714,-2px -2px 0 #191714,2px -2px 0 #191714,-2px 2px 0 #191714,2px 2px 0 #191714,0 0 16px var(--fc)}
#cnFu span{font-family:var(--display);font-size:14px;color:#fff;text-shadow:var(--tol);letter-spacing:.06em;text-transform:uppercase}
#cnFu i{display:block;width:86px;height:7px;border:2px solid #191714;border-radius:5px;background:rgba(0,0,0,.5);overflow:hidden}
#cnFu u{display:block;height:100%;background:linear-gradient(90deg,var(--fc),#fff);transform-origin:left center;transform:scaleX(0);transition:transform .12s linear}
#cnFu small{font-size:10.5px;font-weight:800;color:#ffe9a8;text-shadow:var(--tol)}
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
@keyframes cnFuPop{0%{transform:skewX(-8deg) scale(2.3);opacity:.15}60%{transform:skewX(-8deg) scale(.9);opacity:1}100%{transform:skewX(-8deg) scale(1)}}
@keyframes cnFuFire{from{text-shadow:0 4px 0 #191714,-2px -2px 0 #191714,2px -2px 0 #191714,-2px 2px 0 #191714,2px 2px 0 #191714,0 0 12px #ff8a3c,0 -6px 18px #ff5a1a}
  to{text-shadow:0 4px 0 #191714,-2px -2px 0 #191714,2px -2px 0 #191714,-2px 2px 0 #191714,2px 2px 0 #191714,0 0 22px #e48aff,0 -10px 26px #ffc93c}}
@keyframes cnRedA{0%{opacity:0}18%{opacity:1}100%{opacity:0}}@keyframes cnSlashA{0%{opacity:0;transform:scale(1.25)}12%{opacity:1;transform:scale(1)}70%{opacity:.85}100%{opacity:0}}
@keyframes cnLand{0%{transform:scale(.86)}60%{transform:scale(1.06)}100%{transform:none}}
@media (prefers-reduced-motion:reduce){.cnRelC,.cnN.sel .cnPic,.cnBr.on .fl,#cnFu.pop b,#cnFu.sss b,.sk.cnLand,.sk.cnLeg::after,#cnPremi,#roomChip.cnw.hot{animation:none}}`;

cnEnsure();cnPremiInit();
