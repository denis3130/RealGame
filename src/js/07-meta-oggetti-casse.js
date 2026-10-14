// ---------- meta progression: items, cards, chests, save ----------
const RAR=[{n:'Comune',c:'#b5b8bb',d:'#4a4b4d'},{n:'Non comune',c:'#6cc24a',d:'#2f5a22'},{n:'Raro',c:'#4d97ff',d:'#1d3f78'},{n:'Epico',c:'#b874e6',d:'#4a2766'},{n:'Leggendario',c:'#ffb020',d:'#6e4a0c'}];
const SLOTS=['arma','armatura','anello','amuleto'];
const SLOTN={arma:'Arma',armatura:'Armatura',anello:'Anello',amuleto:'Amuleto'};
const STATN={atk:['Attacco',v=>'+'+Math.round(v)],hp:['Salute',v=>'+'+Math.round(v)],aspd:["Velocità d'attacco",v=>'+'+Math.round(v*100)+'%'],crit:['Critico',v=>'+'+Math.round(v*100)+'%'],dash:['Ricarica scatto',v=>'-'+Math.round(v*100)+'%'],gold:['Oro raccolto',v=>'+'+Math.round(v*100)+'%']};
const ITEMS=[
  {id:'arco_frassino',slot:'arma',rar:0,n:'Arco di frassino',base:{atk:4},per:{atk:2},tint:{a:'#a4703d',b:'#d9b27a'}},
  {id:'arco_ricurvo',slot:'arma',rar:1,n:'Arco ricurvo',base:{atk:6,aspd:.05},per:{atk:2.5,aspd:.02},tint:{a:'#7a4a2a',b:'#6cc24a'}},
  {id:'balestra',slot:'arma',rar:2,n:'Balestra leggera',base:{atk:10},per:{atk:3.5},tint:{a:'#6b4a2a',b:'#4d97ff'},perk:'Le frecce trapassano un nemico in più',perkf:p=>p.pierce++},
  {id:'arco_tuono',slot:'arma',rar:3,n:'Arco del tuono',base:{atk:9,aspd:.1},per:{atk:3,aspd:.02},tint:{a:'#2b3f6b',b:'#ffd84a'},perk:'Le frecce richiamano fulmini sui nemici',perkf:p=>p.light=(p.light||0)+1},
  {id:'arco_fenice',slot:'arma',rar:4,n:'Arco della fenice',base:{atk:14,aspd:.1},per:{atk:4,aspd:.03},tint:{a:'#d9442e',b:'#ffb020'},perk:'Le frecce sono infuocate',perkf:p=>p.fire=true},
  {id:'giubba',slot:'armatura',rar:0,n:'Giubba di cuoio',base:{hp:20},per:{hp:8},tint:{a:'#2fb3a6',b:'#23877d'}},
  {id:'cotta',slot:'armatura',rar:1,n:'Cotta di maglia',base:{hp:35},per:{hp:12},tint:{a:'#8a97a2',b:'#5d6872'}},
  {id:'mantello_ombra',slot:'armatura',rar:2,n:"Mantello d'ombra",base:{hp:25,dash:.1},per:{hp:10,dash:.03},tint:{a:'#5a4682',b:'#3a2c58'}},
  {id:'corazza_muschio',slot:'armatura',rar:3,n:'Corazza di muschio',base:{hp:60},per:{hp:18},tint:{a:'#5f9e3c',b:'#3f7a2a'},perk:'Rigeneri 1 punto salute ogni 2 secondi',perkf:p=>p.regen=.5},
  {id:'anello_rame',slot:'anello',rar:0,n:'Anello di rame',base:{crit:.02},per:{crit:.01},tint:{a:'#c87533',b:'#e8a060'}},
  {id:'anello_falco',slot:'anello',rar:2,n:'Anello del falco',base:{crit:.05,atk:3},per:{crit:.015,atk:1},tint:{a:'#c9cfd6',b:'#4d97ff'}},
  {id:'anello_vento',slot:'anello',rar:3,n:'Anello del vento',base:{aspd:.12},per:{aspd:.03},tint:{a:'#c9cfd6',b:'#7fe0f0'},perk:'Inizi con la freccia posteriore',perkf:p=>p.rear=1},
  {id:'anello_gelo',slot:'anello',rar:4,n:'Anello del gelo eterno',base:{crit:.06,aspd:.08},per:{crit:.015,aspd:.02},tint:{a:'#ffd86b',b:'#bfe9ff'},perk:'Le frecce rallentano i nemici',perkf:p=>p.ice=true},
  {id:'amuleto_osso',slot:'amuleto',rar:0,n:"Amuleto d'osso",base:{gold:.05},per:{gold:.03},tint:{a:'#8a6a4a',b:'#e8e2d0'}},
  {id:'amuleto_luna',slot:'amuleto',rar:1,n:'Amuleto lunare',base:{hp:15,gold:.08},per:{hp:5,gold:.03},tint:{a:'#c9cfd6',b:'#c7d2ff'}},
  {id:'amuleto_lame',slot:'amuleto',rar:3,n:'Amuleto delle lame',base:{atk:5},per:{atk:2},tint:{a:'#9aa3ad',b:'#dfe4ea'},perk:'Inizi con una lama rotante',perkf:p=>p.orbit++},
  {id:'cuore_drago',slot:'amuleto',rar:4,n:'Cuore di drago',base:{hp:50,atk:6},per:{hp:12,atk:2},tint:{a:'#ffd86b',b:'#e5484d'},perk:'Una volta per partita ti rialzi con metà salute',perkf:p=>p.revive=1}];
const ITEM={};ITEMS.forEach(i=>ITEM[i.id]=i);
// every bow shoots its own way: shape in hand, projectile, speed, push, sound
const WEAP={
  arco_frassino:{bow:'plain',proj:'arrow',spd:1,d:'Frecce di legno classiche, affidabili.'},
  arco_ricurvo:{bow:'recurve',proj:'arrow',spd:1.15,fl:'#6cc24a',trail:'190,240,160',d:'Punte ricurve: le frecce volano più veloci.'},
  balestra:{held:'xbow',proj:'bolt',spd:1.35,kb:2.3,trail:'205,218,235',d:'Dardi d\'acciaio rapidissimi che spingono via i nemici.'},
  arco_tuono:{bow:'thunder',proj:'arrow',spd:1.2,fl:'#9fd4ff',trail:'150,210,255',d:'Frecce cariche di tuono: ogni tanto un fulmine colpisce i nemici.'},
  arco_fenice:{bow:'phoenix',proj:'flame',spd:1.1,trail:'255,140,60',d:'Frecce di fuoco che lasciano una scia di braci.'}};
const MAXLV=10,CARDS=[2,4,6,10,15,20,30,40,50],COST=[40,90,160,260,400,600,900,1300,1900];
const needCards=l=>CARDS[l-1]||0,upCost=(it,l)=>Math.round((COST[l-1]||0)*(1+it.rar*.4));
// from level 5 on an upgrade also asks the mode's material (Classic items: «Essenza di muschio», zombie things: «Rottami»; src/js/68-economia.js)
const MATCOST=[0,0,0,0,10,20,35,55,80],matCost=l=>MATCOST[l-1]||0;
const CHESTS={
  legno:{n:'Cassa di legno',cards:6,gold:[20,40],time:15,odds:[70,25,5,0,0],price:150},
  argento:{n:"Cassa d'argento",cards:14,gold:[60,120],time:45,odds:[48,32,15,5,0],price:480},
  oro:{n:"Cassa d'oro",cards:28,gold:[150,280],time:90,odds:[30,32,22,12,4],price:1300}};
const CHC={legno:{body:'#9b6a3a',dark:'#6b4422',band:'#5a5f68',lock:'#c9cfd6'},argento:{body:'#8a96a3',dark:'#5d6874',band:'#e3eaf0',lock:'#4d97ff'},oro:{body:'#d0921f',dark:'#8a5a10',band:'#ffe08a',lock:'#e5484d'}};
const SAVE_KEY='cripta_save_v1';
function defSave(){return{gold:60,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},
  slots:[{type:'legno',state:'ready'},null,null,null],best:{room:0,gold:0},runs:0}}
function loadSave(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s&&s.items)return Object.assign(defSave(),s)}catch(e){}return defSave()}
// items renamed between versions: old saves keep their cards and their level (the Arco delle spine became the Arco del tuono)
function migrateItems(s){const R={arco_spine:'arco_tuono'};if(!s||!s.items)return s;for(const[o,n] of Object.entries(R)){if(s.items[o]){if(!s.items[n])s.items[n]=s.items[o];else{s.items[n].cards=(s.items[n].cards||0)+(s.items[o].cards||0);s.items[n].lvl=Math.max(s.items[n].lvl||1,s.items[o].lvl||1)}delete s.items[o]}if(s.eq&&s.eq.arma===o)s.eq.arma=n}return s}
let SAVE=migrateItems(loadSave());for(const k of ['gold','gems','runs'])if(typeof SAVE[k]!=='number'||!isFinite(SAVE[k]))SAVE[k]=k==='gold'?(defSave().gold):0;

// ===================== ARENAS & TROPHIES =====================
// Edit freely: t = trophies needed, ch = which chapter's rooms/bosses it uses, diff = enemy strength, tint = colour shift of the camp scene.
// ogni arena ha il suo boss (boss: la zona del boss, alla stanza 10); le arene 9-12 riusano i custodi finché non ci sono i 4 boss nuovi
const ARENAS=[
  {t:0,   n:'Cripta di Muschio',    ch:1,diff:1,boss:'golem',   col:'#8fd14f',tint:'',d:"Il Golem di Muschio custodisce l'uscita."},
  {t:300, n:'Cuore del Vulcano',    ch:2,diff:1.08,boss:'magma',   col:'#ff8a3c',tint:'',d:'La Salamandra di Lava ti aspetta nel fuoco.'},
  {t:700, n:'Palude delle Lucciole',ch:3,diff:1.16,boss:'rospo',   col:'#c8f04a',tint:'',d:'Il Re Rospo regna sullo stagno.'},
  {t:1200,n:'Picchi di Brina',      ch:4,diff:1.24,boss:'yeti',   col:'#9fe6ff',tint:'',d:'Lo Yeti delle Vette dorme in cima.'},
  {t:1800,n:'Cripta Risvegliata',   ch:1,diff:1.4,boss:'radici', col:'#c48ae8',tint:'hue-rotate(235deg) saturate(1.15)',d:'La Strega delle Radici si è svegliata. Oro +48%.'},
  {t:2500,n:'Vulcano Furioso',      ch:2,diff:1.52,boss:'fabbro',col:'#ff5a3c',tint:'saturate(1.5) hue-rotate(-12deg) brightness(1.05)',d:"Il Fabbro Infernale batte sull'incudine. Oro +60%."},
  {t:3300,n:'Palude Avvelenata',    ch:3,diff:1.64,boss:'idra', col:'#b06ad8',tint:'hue-rotate(70deg) saturate(1.25)',d:"L'Idra della Palude ha più teste che pazienza. Oro +72%."},
  {t:4200,n:'Ghiacciaio Eterno',    ch:4,diff:1.76,boss:'regina',col:'#7f9cff',tint:'hue-rotate(25deg) saturate(1.3) brightness(.95)',d:'La Regina dei Ghiacci non perdona. Oro +84%.'},
  {t:5200,n:'Cripta delle Ombre',   ch:1,diff:1.95,boss:'radici', col:'#6a8cff',tint:'brightness(.78) contrast(1.2) saturate(.7) hue-rotate(200deg)',d:'Le ombre hanno occhi. Oro +96%.'},
  {t:6400,n:'Forgia degli Dei',     ch:2,diff:2.12,boss:'fabbro', col:'#7ff0c0',tint:'hue-rotate(110deg) saturate(1.5) brightness(1.08)',d:'Il metallo canta, gli dei osservano. Oro +108%.'},
  {t:7800,n:'Palude Maledetta',     ch:3,diff:2.3,boss:'idra', col:'#e07ae8',tint:'hue-rotate(250deg) saturate(1.3) brightness(.9)',d:'Nessuno torna da qui da cent’anni. Oro +120%.'},
  {t:10000,n:'Vetta di Mossbound',  ch:4,diff:2.5,boss:'regina', col:'#ffd84a',tint:'sepia(.35) saturate(1.6) brightness(1.08)',d:'La cima del mondo. Solo i migliori arrivano qui. Oro +132%.'}];
const TROPHY='<svg class="tro" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5H3v1.2a4.3 4.3 0 0 0 4.3 4.1M18 5h3v1.2a4.3 4.3 0 0 1-4.3 4.1" fill="none" stroke="#0b1326" stroke-width="2"/><path d="M6 3h12v4.5a6 6 0 0 1-12 0z" fill="#ffd23c" stroke="#0b1326" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 13.2h4l1 3.8H9z" fill="#e8a41c" stroke="#0b1326" stroke-width="1.8" stroke-linejoin="round"/><rect x="7" y="17" width="10" height="4.2" rx="1" fill="#8a5a20" stroke="#0b1326" stroke-width="1.8"/><path d="M8.8 5.2v2.2a3.4 3.4 0 0 0 1.8 2.9" stroke="#fff6c0" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>';
const LOCK='<svg class="lk" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 9V7a4 4 0 0 1 8 0v2" fill="none" stroke="#0b1326" stroke-width="2.4"/><rect x="4" y="9" width="12" height="9" rx="2" fill="#9aa6b8" stroke="#0b1326" stroke-width="1.8"/></svg>';
// the rewards outside a match that used to be chests are packs now (punto 30: the chests come only from the matches): a reward written as a
// chest type gives the pack of that rarity, of the mode you are in (src/js/69-bustine.js); these names and pictures are for the reward lists
function rwRar(type){return{legno:'c',argento:'r',oro:'e',cristallo:'l'}[type]||'c'}
function rwMode(){return SAVE.modo==='zombie'?'zombie':'classica'}
function rwName(type,mode){const r=rwRar(type),m=mode||rwMode();return(m==='zombie'?'Bustina Zombie ':'Bustina ')+{c:'Comune',r:'Rara',e:'Epica',l:'Leggendaria',i:'Implacabile'}[r]}
function rwImgSrc(type,mode){try{return packImg(mode||rwMode(),rwRar(type),96)}catch(e){return''}}
function rwIcon(type,mode){const s=rwImgSrc(type,mode);return s?`<img class="pkI" src="${s}" alt="">`:chestSVG(type,false)}
function arenaIdx(t){let i=0;for(let k=0;k<ARENAS.length;k++)if(t>=ARENAS[k].t)i=k;return i}
// save migration: old players who already beat chapter 1 start at the volcano
if(SAVE.trophies==null){SAVE.trophies=SAVE.done&&SAVE.done.c1?ARENAS[1].t:0;SAVE.trBest=SAVE.trophies}
if(!SAVE.road)SAVE.road={};if(SAVE.sel!=='inf'&&SAVE.sel!=='daily')SAVE.sel='arena';
// trophies for one run: a win pays more when you finish healthy; a defeat costs less the deeper you got
const trWin=()=>32+Math.round(8*Math.max(0,P.hp)/Math.max(1,P.maxhp)),trLose=room=>Math.max(6,32-3*(room-1));
// rewards along the trophy road, every 100 trophies; each arena gate gives a gold chest
function roadList(){if(roadList.c)return roadList.c;const L=[];for(let t=100;t<=10000;t+=100){const ai=ARENAS.findIndex(a=>a.t===t);let r;
  if(t===500)r={k:'petc',v:'lucciola',n:10};else if(ai>0)r={k:'chest',v:'oro',arena:ai};else{const k=(t/100)%3;r=k===1?{k:'gold',v:80+Math.floor(t/500)*60}:k===2?{k:'gems',v:5+Math.floor(t/1500)*5}:{k:'chest',v:t<1000?'legno':t<3000?'argento':'oro'}}
  L.push({t,...r})}return roadList.c=L}
const roadReady=()=>roadList().filter(n=>(SAVE.trBest||0)>=n.t&&!SAVE.road[n.t]).length;
function rewardLabel(n){return n.k==='petc'?`<img class="rpet" src="${petIcon(n.v)}" alt="">${n.n} carte ${PET_BY[n.v].n}`:n.k==='pet'?`<img class="rpet" src="${petIcon(n.v)}" alt="">Compagno: ${PET_BY[n.v].n}`:n.k==='gold'?`<i class="coin"></i>${n.v} oro`:n.k==='gems'?`<i class="gemS"></i>${n.v} cristalli`:rwName(n.v,'classica')}
function fillRoad(){const T=SAVE.trophies||0,B=SAVE.trBest||0,L=roadList().reverse();let html=`<h2>Cammino delle coppe</h2><p class="lead">Hai ${TROPHY}<b>${T}</b> coppe, record ${B}. I premi si sbloccano con il tuo record.</p><div class="road">`;
  let placed=false;
  for(const n of L){const st=SAVE.road[n.t]?'done':B>=n.t?'ready':'lock';
    if(!placed&&T>=n.t){placed=true;html+=`<div class="rhere">Sei qui ${TROPHY}${T}</div>`}
    if(n.arena)html+=`<div class="rarena" style="--ac:${ARENAS[n.arena].col}"><span>Arena ${n.arena+1}</span><b>${ARENAS[n.arena].n}</b></div>`;
    html+=`<div class="rnode ${st}${n.arena?' big':''}"><span class="rt">${TROPHY}${n.t}</span><span class="rr">${n.k==='chest'?`<span class="rch">${rwIcon(n.v,'classica')}</span>`:''}${rewardLabel(n)}</span>${st==='ready'?`<button class="btn go" data-road="${n.t}">Riscatta</button>`:st==='done'?'<em class="ok">Preso</em>':LOCK}</div>`}
  if(!placed)html+=`<div class="rhere">Sei qui ${TROPHY}${T}</div>`;
  html+=`<div class="rarena" style="--ac:${ARENAS[0].col}"><span>Arena 1</span><b>${ARENAS[0].n}</b></div></div><button class="btn alt close">Chiudi</button>`;
  $('sheet').innerHTML=html;setTimeout(()=>{const h=$('sheet').querySelector('.rhere');if(h)h.scrollIntoView({block:'center'})},30)}

// a new arena: a big reveal the next time you are back at the camp
function showArenaUp(i){const A=ARENAS[i],el=$('arenaUpScr');
  el.innerHTML=`<div class="vsRays"></div><div class="auBox"><span class="vsKind">Nuova arena sbloccata!</span><div class="auPic"><canvas id="auCv" width="360" height="270" style="filter:${A.tint||'none'}"></canvas><span class="auNum">Arena ${i+1}</span></div><span class="ribbon" style="--ac:${A.col}">${A.n}</span><p>${A.d}</p><p class="auTr">${TROPHY}${A.t} coppe</p><button class="btn go" id="auOk">Fantastico!</button></div>`;
  el.hidden=false;try{const c=$('auCv').getContext('2d');c.drawImage(campBg(modeOf(A.ch)),0,0,360,270)}catch(e){}
  sfx('victory');vib([40,30,40,30,120]);$('auOk').onclick=()=>{sfx('ui');el.hidden=true;renderPlay()}}

function save(){if(INTRO.on)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE))}catch(e){}}

function itemStats(it,l){const o={};for(const k in it.base)o[k]=it.base[k]+(it.per[k]||0)*(l-1);return o}
function gear(){const t={atk:0,hp:0,aspd:0,crit:0,dash:0,gold:0},perks=[];
  for(const s of SLOTS){const id=SAVE.eq[s];if(!id||!SAVE.items[id])continue;const it=ITEM[id],st=itemStats(it,SAVE.items[id].lvl);for(const k in st)t[k]+=st[k];if(it.perkf)perks.push(it.perkf)}
  return{t,perks}}
function heroStyle(id){const s0=heroStyle0(id),K=SAVE.skin&&SAVE.skins&&SAVE.skins[SAVE.skin]&&SKINS[SAVE.skin];return K?{...s0,body:K.body,hood:K.hood,belt:K.belt,skinId:SAVE.skin}:s0}
function heroStyle0(id){const h=HERO_BY[id||SAVE.hero]||HEROES[0],a=SAVE.eq.armatura&&ITEM[SAVE.eq.armatura],w=SAVE.eq.arma&&ITEM[SAVE.eq.arma],base0={...HERO,...h.style};
  const W=w&&WEAP[w.id],gear={armor:a?a.id:null,ring:SAVE.eq.anello||null,amu:SAVE.eq.amuleto||null};
  if(W&&base0.held==='bow'){gear.held=W.held||'bow';gear.bowKind=W.bow}
  const base={...base0,...gear};
  if(h.id==='arciere')return{...base,hid:h.id,body:a?a.tint.a:HERO.body,hood:a?a.tint.b:HERO.hood,bowCol:w?w.tint.a:HERO.bowCol};
  return{...base,hid:h.id,bowCol:w&&base.held!=='staff'?w.tint.a:base.bowCol,belt:a?a.tint.a:base.belt}}
function pickOdds(o){const s=o.reduce((a,b)=>a+b,0);let r=Math.random()*s;for(let i=0;i<o.length;i++){r-=o[i];if(r<0)return i}return 0}
function rollChest(type){
  const c=CHESTS[type];let left=c.cards;const n=Math.min(4,2+Math.floor(c.cards/10)),out={};
  for(let s=0;s<n&&left>0;s++){let cnt=s===n-1?left:Math.max(1,Math.round(left*rand(.3,.5)));left-=cnt;
    let rar=pickOdds(c.odds),pool=ITEMS.filter(i=>i.rar===rar);while(!pool.length&&rar>0){rar--;pool=ITEMS.filter(i=>i.rar===rar)}
    const it=pool[randi(0,pool.length-1)];cnt=Math.max(1,Math.round(cnt/(1+rar*.7)));out[it.id]=(out[it.id]||0)+cnt}
  const pc={legno:[.35,1,2],argento:[.6,2,4],oro:[.9,3,6]}[type];
  if(pc&&Math.random()<pc[0]){const w=PETS.map(q=>[q.id,(type==='legno'?[0,8,2,.5]:type==='argento'?[0,6,3,1]:[0,4,3,2])[q.rar]]),tot=w.reduce((a,b)=>a+b[1],0);let r=Math.random()*tot,id=w[0][0];for(const[k,v]of w){r-=v;if(r<0){id=k;break}}
    out['pet:'+id]=randi(pc[1],pc[2])}
  return{cards:Object.entries(out).map(([id,n])=>({id,n})).sort((a,b)=>CI(a.id).rar-CI(b.id).rar),gold:randi(c.gold[0],c.gold[1])}}
// what a reward card shows, for item cards and pet cards alike
function CI(id,c){if(id.startsWith('pet:')){const pid=id.slice(4),p=PET_BY[pid],o=SAVE.pets.owned[pid],svg=`<img class="cpet" src="${petIcon(pid)}" alt="">`;
    if(c&&c.unlocked)return{n:p.n,rar:p.rar,svg,o:{lvl:1,cards:p.unlock},need:p.unlock,sub:'Compagno',max:false,ready:'Compagno sbloccato!'};
    if(o)return{n:p.n,rar:p.rar,svg,o:{lvl:o.lvl,cards:o.cards||0},need:petNeed(o.lvl),sub:`Livello ${o.lvl} · Compagno`,max:o.lvl>=PETMAX,ready:'Pronto da migliorare!'};
    return{n:p.n,rar:p.rar,svg,o:{lvl:0,cards:SAVE.pets.cards[pid]||0},need:p.unlock,sub:'Compagno · da sbloccare',max:false,ready:'Compagno sbloccato!'}}
  const it=ITEM[id],o=SAVE.items[id]||{lvl:1,cards:0};return{n:it.n,rar:it.rar,svg:itemSVG(it),o,need:needCards(o.lvl),sub:`Livello ${o.lvl} · ${SLOTN[it.slot]}`,max:o.lvl>=MAXLV,ready:'Pronto da migliorare!'}}
function grant(rew){for(const c of rew.cards){if(c.id.startsWith('pet:')){const pid=c.id.slice(4),o=SAVE.pets.owned[pid];c.prev=o?o.cards||0:SAVE.pets.cards[pid]||0;if(addPetCards(pid,c.n)){c.isNew=true;c.unlocked=true}continue}const o=SAVE.items[c.id];if(!o){SAVE.items[c.id]={lvl:1,cards:c.n-1};c.isNew=true;const sl=ITEM[c.id].slot;if(!SAVE.eq[sl])SAVE.eq[sl]=c.id}else o.cards+=c.n}SAVE.gold+=rew.gold;save()}
function earnChest(type){const i=SAVE.slots.findIndex(s=>!s);
  if(i<0){const g={legno:30,argento:80,oro:200}[type];SAVE.gold+=g;return{full:true,gold:g}}
  SAVE.slots[i]={type,state:'locked'};return{slot:i}}
function slotState(s){if(s.state==='unlocking'&&Date.now()>=s.end)s.state='ready';return s.state}
const anyUnlocking=()=>SAVE.slots.some(s=>s&&slotState(s)==='unlocking');
function fmtT(ms){const t=Math.max(0,Math.ceil(ms/1000));return t>=60?Math.floor(t/60)+'m '+String(t%60).padStart(2,'0')+'s':t+'s'}
const skipCost=s=>Math.max(5,Math.ceil((s.end-Date.now())/6000)*5);
const canUpgrade=id=>{const o=SAVE.items[id];return o&&o.lvl<MAXLV&&o.cards>=needCards(o.lvl)};
const canAffordUp=id=>canUpgrade(id)&&SAVE.gold>=upCost(ITEM[id],SAVE.items[id].lvl)&&((SAVE.mat&&SAVE.mat.ess)||0)>=matCost(SAVE.items[id].lvl);

// ---------- SVG art for menu ----------
const I_='#1b1612';
function chestSVG(type,open){const c=CHC[type];
  const glow=open?`<ellipse cx="40" cy="34" rx="30" ry="9" fill="#fff6c8" opacity=".9"/><path d="M40 34 L14 -8 M40 34 L40 -12 M40 34 L66 -8 M40 34 L2 14 M40 34 L78 14" stroke="#ffe08a" stroke-width="4" stroke-linecap="round" opacity=".6"/>`:'';
  const lid=open?`<g transform="translate(-2,-16) rotate(-16 10 32)"><path d="M10 32 V22 Q40 4 70 22 V32 Z" fill="${c.dark}" stroke="${I_}" stroke-width="3" stroke-linejoin="round"/><path d="M22 31 V12 M58 31 V12" stroke="${c.band}" stroke-width="5"/></g>`
    :`<path d="M10 32 V22 Q40 4 70 22 V32 Z" fill="${c.dark}" stroke="${I_}" stroke-width="3" stroke-linejoin="round"/><path d="M22 31 V12 M58 31 V12" stroke="${c.band}" stroke-width="5"/><path d="M16 20 Q40 8 64 20" stroke="#fff" stroke-opacity=".25" stroke-width="2" fill="none"/>`;
  return `<svg viewBox="0 -14 80 84" aria-hidden="true">${glow}<ellipse cx="40" cy="66" rx="30" ry="4" fill="#000" opacity=".3"/><rect x="10" y="32" width="60" height="32" rx="4" fill="${c.body}" stroke="${I_}" stroke-width="3"/><rect x="13" y="35" width="54" height="6" fill="#fff" opacity=".12"/><path d="M22 32 V64 M58 32 V64" stroke="${c.band}" stroke-width="5"/><path d="M10 48 H70" stroke="${I_}" stroke-opacity=".25" stroke-width="2"/>${lid}${open?'':`<rect x="34" y="28" width="12" height="14" rx="2" fill="${c.lock}" stroke="${I_}" stroke-width="2.5"/><circle cx="40" cy="34" r="2" fill="${I_}"/>`}</svg>`}
function itemSVG(it){const a=it.tint.a,b=it.tint.b;let g='';
  if(it.slot==='arma'){
    if(it.id==='balestra')g=`<path d="M6 24 H40" stroke="${I_}" stroke-width="8" stroke-linecap="round"/><path d="M6 24 H40" stroke="${a}" stroke-width="4.5" stroke-linecap="round"/><path d="M31 7 Q24 24 31 41" fill="none" stroke="${I_}" stroke-width="7" stroke-linecap="round"/><path d="M31 7 Q24 24 31 41" fill="none" stroke="#a7b0ba" stroke-width="3.5" stroke-linecap="round"/><path d="M31 7 L18 24 L31 41" fill="none" stroke="#f6ead2" stroke-width="1.3"/><path d="M44 24 L37 20 L37 28Z" fill="#e8ecf0" stroke="${I_}" stroke-width="1.6"/><circle cx="12" cy="24" r="3.5" fill="${b}" stroke="${I_}" stroke-width="2"/>`;
    else g=`<path d="M16 5 Q39 24 16 43" fill="none" stroke="${I_}" stroke-width="7.5" stroke-linecap="round"/><path d="M16 5 Q39 24 16 43" fill="none" stroke="${a}" stroke-width="4" stroke-linecap="round"/><path d="M16 5 L16 43" stroke="#f6ead2" stroke-width="1.4"/><path d="M5 24 H38" stroke="${I_}" stroke-width="4.5" stroke-linecap="round"/><path d="M5 24 H37" stroke="#d9b27a" stroke-width="2"/><path d="M45 24 L36 19 L36 29Z" fill="#e8ecf0" stroke="${I_}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="27.5" cy="24" r="3.6" fill="${b}" stroke="${I_}" stroke-width="2"/>`}
  else if(it.slot==='armatura')g=`<path d="M14 10 L20 7 Q24 12 28 7 L34 10 L40 21 L33 24 L32 42 H16 L15 24 L8 21 Z" fill="${a}" stroke="${I_}" stroke-width="2.5" stroke-linejoin="round"/><path d="M15 31 H33 V35 H15Z" fill="#8a5a20" stroke="${I_}" stroke-width="1.6"/><rect x="22" y="30.5" width="4" height="5" fill="#ffc93c" stroke="${I_}" stroke-width="1.2"/><path d="M20 7 Q24 16 28 7" fill="${b}" stroke="${I_}" stroke-width="2" stroke-linejoin="round"/><path d="M17 14 L19 26" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>`;
  else if(it.slot==='anello')g=`<circle cx="24" cy="29" r="11" fill="none" stroke="${I_}" stroke-width="8.5"/><circle cx="24" cy="29" r="11" fill="none" stroke="${a}" stroke-width="4.5"/><path d="M16 15 L24 6 L32 15 L24 22Z" fill="${b}" stroke="${I_}" stroke-width="2.2" stroke-linejoin="round"/><path d="M20.5 12.5 L24 9" stroke="#fff" stroke-width="1.6" opacity=".85"/>`;
  else g=`<path d="M11 5 L24 25 L37 5" fill="none" stroke="${I_}" stroke-width="4.5"/><path d="M11 5 L24 25 L37 5" fill="none" stroke="${a}" stroke-width="2.2" stroke-dasharray="3 2"/><circle cx="24" cy="31" r="11" fill="${a}" stroke="${I_}" stroke-width="2.5"/><circle cx="24" cy="31" r="6" fill="${b}" stroke="${I_}" stroke-width="2"/><circle cx="21.8" cy="28.8" r="1.8" fill="#fff" opacity=".85"/>`;
  return `<svg viewBox="0 0 48 48" aria-hidden="true">${g}</svg>`}
function cardBar(id){const o=SAVE.items[id];if(!o)return '';if(o.lvl>=MAXLV)return `<div class="bar full"><i style="width:100%"></i><span>MAX</span></div>`;
  const need=needCards(o.lvl),p=Math.min(1,o.cards/need);return `<div class="bar ${p>=1?'full':''}"><i style="width:${p*100}%"></i><span>${o.cards}/${need}</span></div>`}
function icard(id,extra){const it=ITEM[id],o=SAVE.items[id],r=RAR[it.rar];
  return `<button class="icard ${o?'':'locked'}" data-id="${id}" style="--rc:${r.c};--rc2:${r.d}" ${extra||''}>${o&&canUpgrade(id)?'<em class="up">▲</em>':''}${itemSVG(it)}<span class="lv">${o?'Liv. '+o.lvl:'?'}</span>${o?cardBar(id):'<div class="bar"><span>da trovare</span></div>'}</button>`}

