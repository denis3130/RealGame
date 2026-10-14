// =====================================================================
// MENU 2: the home like the big phone games (the hero on a rune stone, buttons on both sides,
// equipment, the arena card, the play row), the explorer level, the wheel of fortune in the menu,
// weekly missions with activity chests, rewards for achievements and for the daily challenge
// =====================================================================
// --- explorer level: runs, missions and challenges give experience, every level pays out
if(!SAVE.acct||!(SAVE.acct.lvl>=1))SAVE.acct={lvl:1,xp:0};
function acct(){return SAVE.acct}
function acctNeed(l){return 100+40*(l-1)}
function acctRew(l){return{gold:Math.min(1500,60+40*l),gems:l%5===0?15:3}}
function acctXP(v){const A=SAVE.acct;A.xp+=Math.max(0,Math.round(v||0));let up=0;
  while(A.xp>=acctNeed(A.lvl)){A.xp-=acctNeed(A.lvl);A.lvl++;up++;const r=acctRew(A.lvl);SAVE.gold+=r.gold;SAVE.gems=(SAVE.gems||0)+r.gems;achPop('Livello esploratore '+A.lvl+'!',`+${r.gold} oro e +${r.gems} cristalli`,'trophy')}
  save();if(!$('menu').hidden)renderGold();return up}
{const _px=passXP;passXP=function(v){const r=_px(v);acctXP(v);return r}}
// --- the best room reached in every arena (shown on the arena card)
if(!SAVE.bestA){SAVE.bestA={};[['best',0],['best2',1],['best3',2],['best4',3]].forEach(([k,i])=>{if(SAVE[k]&&SAVE[k].room)SAVE.bestA[i]=SAVE[k].room})}
function bestRoom(i){return SAVE.bestA[i]||0}
{const _e=endRun;endRun=function(win,quit){const g=G,was=g&&!g.ended;_e.apply(this,arguments);if(!was)return;
  if(g.mode!=='inf'&&!g.daily){const i=g.arena||0;SAVE.bestA[i]=Math.max(bestRoom(i),g.room)}
  if(win&&!g.daily&&g.mode!=='inf')mprog('win',null,1);save()}}
// --- missions: daily and weekly, activity points open three chests every week
const WPOOL=[
  {k:'kill',t:'any',g:600,n:'Sconfiggi 600 nemici'},{k:'boss',t:'any',g:3,n:'Sconfiggi 3 boss'},{k:'win',g:3,n:'Conquista 3 volte la tua arena'},
  {k:'chest',g:8,n:'Apri 8 casse'},{k:'elite',g:25,n:'Sconfiggi 25 nemici élite'},{k:'gold',g:3000,n:'Raccogli 3.000 oro nelle partite'},
  {k:'dash',g:250,n:'Usa lo scatto 250 volte'},{k:'evo',g:4,n:'Ottieni 4 evoluzioni'},{k:'wheel',g:5,n:'Gira la ruota della fortuna 5 volte'},
  {k:'chal',g:3,n:'Gioca 3 sfide del giorno',req:'daily'},{k:'inf',g:15,n:"Raggiungi la stanza 15 dell'Abisso",req:'inf'}];
const WREW=[{chest:'argento'},{gold:400},{gems:10}];
const WK_T=[100,250,450],WK_R=[{chest:'argento'},{chest:'oro'},{gems:30}],MPTS={d:20,w:60},MBONUS=5;
function weekKey(){const d=new Date(),day=(d.getDay()+6)%7,m=new Date(d.getFullYear(),d.getMonth(),d.getDate()-day);return m.getFullYear()+'-'+(m.getMonth()+1)+'-'+m.getDate()}
function weekEnd(){const d=new Date(),day=(d.getDay()+6)%7;return new Date(d.getFullYear(),d.getMonth(),d.getDate()-day+7)}
function ensureWeekly(){const k=weekKey();if(SAVE.weekly&&SAVE.weekly.wk===k)return SAVE.weekly;
  let h=0;for(const ch of k+'|sett')h=(h*31+ch.charCodeAt(0))>>>0;const rnd=()=>{h=(Math.imul(h,1103515245)+12345)>>>0;return h/4294967296};
  const pool=WPOOL.map((m,i)=>i).filter(i=>!WPOOL[i].req||modeOpen(WPOOL[i].req)),list=[];
  while(list.length<3&&pool.length){const i=pool.splice(Math.floor(rnd()*pool.length),1)[0];list.push({i,p:0,done:false,claimed:false,r:list.length})}
  SAVE.weekly={wk:k,list,pts:0,got:{}};save();return SAVE.weekly}
{const _mp=mprog;mprog=function(k,t,v,abs){_mp(k,t,v,abs);const W=ensureWeekly();
  for(const m of W.list){const M=WPOOL[m.i];if(!M||M.k!==k||m.done)continue;if(M.t&&t!==undefined&&t!==null&&!inGrp(t,M.t))continue;if(M.t&&M.t!=='any'&&(t===undefined||t===null))continue;
    m.p=abs?Math.max(m.p,v):m.p+v;if(m.p>=M.g){m.p=M.g;m.done=true;achPop('Missione della settimana',M.n,'mission');sfx('upgrade')}}}}
const wrewTxt=r=>{const R=WREW[r];return R.gold?R.gold+' oro':R.gems?R.gems+' cristalli':rwName(R.chest)};
function misReady(){ensureDaily();const W=ensureWeekly(),D=SAVE.daily;let n=D.list.filter(m=>m.done&&!m.claimed).length+W.list.filter(m=>m.done&&!m.claimed).length;
  if(D.list.length&&D.list.every(m=>m.claimed)&&!D.bonus)n++;WK_T.forEach((th,i)=>{if(W.pts>=th&&!W.got[i])n++});return n}
function grantR(r){if(r.gold){SAVE.gold+=r.gold;sfx('coin');toast(`+${r.gold.toLocaleString('it-IT')} oro`)}if(r.gems){SAVE.gems=(SAVE.gems||0)+r.gems;sfx('gem');toast(`+${r.gems} cristalli`)}save();renderGold();if(r.chest){closeSheet();openChest(r.chest)}}
let misSeg='d';
function fillMissions(){ensureDaily();const W=ensureWeekly(),D=SAVE.daily,t=new Date(),mid=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1);
  const wk=`<div class="wk"><b>Punti della settimana: ${W.pts}</b>${WK_T.map((th,i)=>{const st=W.got[i]?'got':W.pts>=th?'ready':'',r=WK_R[i];return `<button class="wkc ${st}" data-wkc="${i}" aria-label="Premio a ${th} punti">${r.chest?rwIcon(r.chest):'<span class="bigGem"></span>'}<small>${st==='got'?'Preso':r.gems?th+' · '+r.gems:th}</small></button>`}).join('')}<div class="wkBar"><i style="width:${Math.min(100,W.pts/WK_T[2]*100)}%"></i>${WK_T.slice(0,2).map(th=>`<u style="left:${th/WK_T[2]*100}%"></u>`).join('')}</div></div>`;
  const row=(M,m,j,kind,rew)=>`<div class="mis ${m.claimed?'claimed':m.done?'done':''}"><div><b>${M.n}</b><div class="bar ${m.done?'full':''}"><i style="width:${Math.min(1,m.p/M.g)*100}%"></i><span>${Math.floor(m.p).toLocaleString('it-IT')}/${M.g.toLocaleString('it-IT')}</span></div><em class="mpts">+${kind==='d'?MPTS.d:MPTS.w} punti</em></div>${m.claimed?'<em class="mok">Ritirata</em>':m.done?`<button class="btn mclaim" data-${kind==='d'?'m':'wm'}="${j}">Ritira ${rew}</button>`:`<em class="mrew">${rew}</em>`}</div>`;
  let body;
  if(misSeg==='d'){const all=D.list.length&&D.list.every(m=>m.claimed);
    body=D.list.map((m,j)=>row(MPOOL[m.i],m,j,'d',rewTxt(m.r))).join('')+`<div class="mbonus ${all&&!D.bonus?'ready':''}"><div><b>Forziere del giorno</b><span>${D.bonus?'Preso! Torna domani.':'Ritira tutte e 3 le missioni'}</span></div>${D.bonus?'<em class="mok">Preso</em>':all?`<button class="btn mclaim" data-mbonus="1">Ritira +${MBONUS} <i class="gemS"></i></button>`:`<em class="mrew">+${MBONUS} cristalli</em>`}</div><p class="lead">Si rinnovano tra <b>${fmtH(mid-t)}</b>.</p>`}
  else body=W.list.map((m,j)=>row(WPOOL[m.i],m,j,'w',wrewTxt(m.r))).join('')+`<p class="lead">Nuove missioni tra <b>${fmtH(weekEnd()-t)}</b>.</p>`;
  const html=`<h2>Missioni</h2><div class="seg mseg"><button class="${misSeg==='d'?'on':''}" data-mseg="d">Del giorno</button><button class="${misSeg==='w'?'on':''}" data-mseg="w">Della settimana</button></div>${wk}${body}<button class="btn alt close">Chiudi</button>`;
  if(html!==lastSheetHTML){$('sheet').innerHTML=html;lastSheetHTML=html}}
function renderMissions(){const n=misReady(),html=`${SCROLL_SVG}<small>Missioni</small>${n?`<em class="pip">${n}</em>`:''}`;
  const el=$('misBtn');el.classList.toggle('hot',!!n);if(html!==lastMisHTML){el.innerHTML=html;lastMisHTML=html}if(SHEET==='mis')fillMissions()}
// --- achievements pay crystals
const ACH_R={first:5,slime:10,k1000:20,golem:10,witch:15,salam:10,smith:20,toad:10,hydra:25,yeti:10,queen:30,nohit:15,elite:15,inf15:10,inf30:30,evo:15,heroes:30,chests:20,legend:40};
if(!SAVE.achC)SAVE.achC={};
function achReady(){return ACH.filter(a=>SAVE.ach[a.id]&&!SAVE.achC[a.id]).length}
// --- daily challenge: three medals by score, the podium on top
const CHAL_T=[{s:4000,n:'Bronzo',c:'#e0955a',r:{gold:150}},{s:8000,n:'Argento',c:'#eef3f7',r:{gems:5}},{s:14000,n:'Oro',c:'#ffd84a',r:{chest:'argento'}}];
const tierTxt=r=>r.gold?r.gold+' oro':r.gems?r.gems+' cristalli':CHESTS[r.chest].n;
function chalEnd(win,quit){const C=ensureChal(),score=quit?0:chalScore(win);C.tries++;const bonus=[];
  if(!quit){const first=!C.done;C.done=true;if(score>C.best)C.best=score;if(first)passXP(60);mprog('chal',null,1);C.tiers=C.tiers||{};
    CHAL_T.forEach((T,i)=>{if(C.best>=T.s&&!C.tiers[i]){C.tiers[i]=1;const r=T.r;if(r.gold)SAVE.gold+=r.gold;if(r.gems)SAVE.gems=(SAVE.gems||0)+r.gems;if(r.chest)earnChest(r.chest);bonus.push(`Medaglia ${T.n}: ${tierTxt(r)}`)}});
    const L=chalBoard(),pos=L.findIndex(x=>x.me)+1;if(pos>0&&pos<=3&&!C.top){C.top=true;SAVE.gems=(SAVE.gems||0)+10;bonus.push('Podio: +10 cristalli')}
    return{score,pos,bonus:bonus.join(' · ')}}return{score:0,pos:0,bonus:''}}
function fillChal(){const C=ensureChal(),T=chalToday(),L=chalBoard(),t=new Date(),mid=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1),open=modeOpen('daily'),tiers=C.tiers||{};lastSheetHTML='';
  const mods=T.mods.map(id=>CHAL_MODS.find(m=>m.id===id));
  $('sheet').innerHTML=`<h2>Sfida del giorno</h2><p class="lead">${modeOf(T.ch).n} · uguale per tutti, cambia tra <b>${fmtH(mid-t)}</b></p>
    <div class="cmods">${mods.map(m=>`<div class="cmod ${m.good?'good':'bad'}"><b>${m.n}</b><span>${m.d}</span></div>`).join('')}</div>
    <div class="tiers">${CHAL_T.map((x,i)=>`<div class="tier ${tiers[i]?'got':''}" style="--tc:${x.c}"><i></i><b>${x.n}</b><small>${x.s.toLocaleString('it-IT')} punti<br>${tiers[i]?'Preso!':tierTxt(x.r)}</small></div>`).join('')}</div>
    <p class="lead small">Più vai avanti, più punti fai. Nei primi 3 della classifica: <b>+10 cristalli</b>. Le coppe non cambiano.</p>
    <div class="board">${L.map((x,i)=>`<div class="brow ${x.me?'me':''}"><span class="bpos">${i+1}</span><b>${x.me?(SAVE.pname||'Tu')+' (tu)':x.n}</b><span class="bsc">${x.s.toLocaleString('it-IT')}</span></div>`).join('')}</div>
    ${open?`<button class="btn go bigPlay" data-playmode="daily">${C.done?'Riprova la sfida':'Gioca la sfida'}</button>`:'<p class="lead" style="text-align:center">Si apre dopo la prima partita.</p>'}<button class="btn alt close">Chiudi</button>`}
function fillAbyss(){const open=modeOpen('inf'),T=SAVE.inf.top||[];lastSheetHTML='';
  $('sheet').innerHTML=`<h2>L'Abisso</h2><p class="lead">Stanze senza fine, sempre più dure, e le coppe non cambiano. Alla stanza 5, 10 e 20 ti aspettano casse sempre più ricche.</p>
    <div class="abTop"><span><b>${SAVE.inf.best||0}</b>Record</span><span><b>${T.length}</b>Discese</span><span><b>${(T[0]&&T[0].kills)||0}</b>Nemici nel record</span></div>
    ${T.length?`<div class="board">${T.map((r,i)=>`<div class="brow"><span class="bpos">${i+1}</span><b>Stanza ${r.room}</b><span class="bsc">${HERO_BY[r.hero]?HERO_BY[r.hero].n:''}</span></div>`).join('')}</div>`:''}
    ${open?`<button class="btn go bigPlay" data-playmode="inf">Scendi nell'Abisso</button>`:'<p class="lead" style="text-align:center">Sconfiggi il Golem di Muschio per aprirlo.</p>'}<button class="btn alt close">Chiudi</button>`}
// --- chests: the free one and the four slots, behind the «Casse» button
function slotHTML(s,i){if(!s)return '<div class="slot empty"><span>Vuoto</span></div>';const st=slotState(s),c=CHESTS[s.type];let lab;
  if(st==='ready')lab='<b>Apri!</b><small>&nbsp;</small>';
  else if(st==='unlocking')lab=`<b>${fmtT(s.end-Date.now())}</b><small>${s.confirm?'Tocca ancora: '+skipCost(s)+' oro':'Apri ora: '+skipCost(s)+' oro'}</small>`;
  else lab=anyUnlocking()?`<b>In attesa</b><small>${fmtT(c.time*1000)}</small>`:`<b>Sblocca</b><small>${fmtT(c.time*1000)}</small>`;
  return `<button class="slot ${st}" data-i="${i}" aria-label="${c.n}">${chestSVG(s.type,false)}${lab}</button>`}
function fillChests(){const ready=Date.now()>=SAVE.free.next,type=(SAVE.free.n+1)%3===0?'argento':'legno';
  const html=`<h2>Casse</h2><div class="freeRow ${ready?'hot':''}">${chestSVG(type,false)}<div><b>${CHESTS[type].n} gratis</b><span>${ready?'Pronta da aprire!':'Si riempie tra '+fmtH(SAVE.free.next-Date.now())}</span></div>${ready?'<button class="btn go" data-free="1">Apri</button>':''}</div>
    <p class="lead">Vinci casse giocando, dalla stanza 3 in poi: aspettano qui e si sbloccano una alla volta.</p><div class="slots cslots">${SAVE.slots.map(slotHTML).join('')}</div><button class="btn alt close">Chiudi</button>`;
  if(html!==lastSheetHTML){$('sheet').innerHTML=html;lastSheetHTML=html}}
function takeFree(){if(Date.now()<SAVE.free.next){toast('Si riempie ogni 4 ore: torna più tardi');return}if(CHbusy)return;SAVE.free.n++;const type=SAVE.free.n%3===0?'argento':'legno';SAVE.free.next=Date.now()+4*3600e3;save();closeSheet();openChest(type)}
function renderChestBtn(){const fr=Date.now()>=SAVE.free.next,sl=SAVE.slots.filter(Boolean),rd=sl.filter(s=>slotState(s)==='ready'),un=sl.find(s=>slotState(s)==='unlocking'),lk=sl.find(s=>slotState(s)==='locked'),n=rd.length+(fr?1:0);
  let ic,lab;if(n){ic=chestSVG(rd.length?rd[0].type:'legno',false);lab='Apri!'}else if(un){ic=chestSVG(un.type,false);lab=fmtT(un.end-Date.now()).replace(/ \d+s$/,'')}else if(lk){ic=chestSVG(lk.type,false);lab='Sblocca'}else{ic=chestSVG('legno',false);lab=fmtH(SAVE.free.next-Date.now()).replace(/ \d+s$/,'')}
  const html=`${ic}<small>${lab}</small>${n?`<em class="pip">${n}</em>`:lk&&!un?'<i class="bang">!</i>':''}`,el=$('chestBtn');el.classList.toggle('hot',!!n);if(el._h!==html){el.innerHTML=html;el._h=html}}
$('chestBtn').onclick=()=>openSheet('chests');
// --- the ≡ menu and the crystals sheet
const MORE_IC={prof:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3c-6 0-10 5-10 11v4l-2 9h24l-2-9v-4c0-6-4-11-10-11z" fill="#c2b078" stroke="#191714" stroke-width="2.2" stroke-linejoin="round"/><path d="M10 17c0-4 2.7-7.4 6-7.4s6 3.4 6 7.4v3H10z" fill="#191714"/><circle cx="13.4" cy="16.6" r="1.6" fill="#fff"/><circle cx="18.6" cy="16.6" r="1.6" fill="#fff"/></svg>',
  ach:'<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M11 3h7l4 13h-7zM29 3h-7l-4 13h7z" fill="#e5484d" stroke="#191714" stroke-width="2.2" stroke-linejoin="round"/><circle cx="20" cy="25.5" r="11" fill="#ffd84a" stroke="#191714" stroke-width="2.4"/><circle cx="20" cy="25.5" r="7" fill="#f2a400"/></svg>',
  set:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4l2.6 3.4 4.2-1.1.6 4.3 4 1.6-1.9 3.8 1.9 3.8-4 1.6-.6 4.3-4.2-1.1L16 28l-2.6-3.4-4.2 1.1-.6-4.3-4-1.6L6.5 16l-1.9-3.8 4-1.6.6-4.3 4.2 1.1z" fill="#d9cdaa" stroke="#191714" stroke-width="2" stroke-linejoin="round"/><circle cx="16" cy="16" r="4.5" fill="#191714"/></svg>',
  guide:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 6c4-2 8-2 11 1 3-3 7-3 11-1v20c-4-2-8-2-11 1-3-3-7-3-11-1z" fill="#f4e7c8" stroke="#191714" stroke-width="2.2" stroke-linejoin="round"/><path d="M16 7v20" stroke="#191714" stroke-width="2"/></svg>'};
function fillMore(){lastSheetHTML='';$('sheet').innerHTML=`<h2>Menu</h2><div class="moreBtns"><button data-more="prof">${MORE_IC.prof}Profilo</button><button data-more="ach">${MORE_IC.ach}Traguardi</button><button data-more="set">${MORE_IC.set}Impostazioni</button><button data-more="guide">${MORE_IC.guide}Guida</button></div><button class="btn alt close">Chiudi</button>`}
function fillGems(){lastSheetHTML='';const src=[['Cristalli nelle stanze','Rompi i cristalli e i sacchi che trovi giocando'],['Boss','Ogni boss sconfitto ne lascia 2'],['Missioni','Il forziere del giorno e i premi della settimana'],['Ruota della fortuna','Un giro gratis ogni giorno'],['Accesso giornaliero','Il 2° e il 5° giorno'],['Traguardi','Ogni traguardo raggiunto'],['Cammino e Pass','Tanti premi lungo la strada'],['Livello esploratore','A ogni livello che sali'],['Sfida del giorno',"La medaglia d'argento e il podio"]];
  $('sheet').innerHTML=`<h2>Cristalli</h2><p class="lead">Servono per i compagni, il Pass d'oro, le offerte, l'oro della bottega, la ruota e per rinascere in partita. Non si comprano: si guadagnano giocando!</p><div class="gsrc">${src.map(([b,s])=>`<span class="bigGem" style="width:17px;height:17px;margin:7px"></span><div><b>${b}</b><span>${s}</span></div>`).join('')}</div><button class="btn alt close">Chiudi</button>`}
$('tbMenu').onclick=()=>openSheet('more');
{const _os=openSheet;openSheet=function(kind){if(kind==='chests'||kind==='more'||kind==='gems'||kind==='abyss'){SHEET=kind;sfx('ui');lastSheetHTML='';({chests:fillChests,more:fillMore,gems:fillGems,abyss:fillAbyss})[kind]();$('sheetScr').hidden=false;return}return _os(kind)}}
// clicks inside the sheets added by the new menu
$('sheet').addEventListener('pointerdown',e=>{const b=e.target.closest('.slot[data-i]');if(!b)return;e.preventDefault();tapSlot(+b.dataset.i)});
$('sheet').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.free){takeFree();return}
  if(b.dataset.playmode){const m=b.dataset.playmode;closeSheet();goPlay(m);return}
  if(b.dataset.more){const k=b.dataset.more;sfx('ui');if(k==='prof'){closeSheet();setTab('tabProfile')}else if(k==='ach'){closeSheet();profSeg='ach';setTab('tabProfile')}else openSheet(k);return}
  if(b.dataset.mseg){misSeg=b.dataset.mseg;sfx('ui');fillMissions();return}
  if(b.dataset.wm!=null){if(CHbusy)return;const W=ensureWeekly(),m=W.list[+b.dataset.wm];if(!m||!m.done||m.claimed)return;m.claimed=true;W.pts+=MPTS.w;passXP(40);const R=WREW[m.r];save();grantR(R);if(!R.chest){fillMissions();renderMissions()}return}
  if(b.dataset.mbonus){const D=SAVE.daily;if(D.bonus||!D.list.every(m=>m.claimed))return;D.bonus=true;grantR({gems:MBONUS});fillMissions();renderMissions();return}
  if(b.dataset.wkc!=null){if(CHbusy)return;const W=ensureWeekly(),i=+b.dataset.wkc;if(W.got[i]||W.pts<WK_T[i])return;W.got[i]=1;save();const R=WK_R[i];grantR(R);if(!R.chest){fillMissions();renderMissions()}return}});
// --- achievements: claim the crystals from the profile or from the home button
document.addEventListener('click',e=>{const b=e.target.closest('[data-achc]');if(!b||b.disabled)return;const id=b.dataset.achc;if(!SAVE.ach[id]||SAVE.achC[id])return;
  SAVE.achC[id]=1;const v=ACH_R[id]||5;SAVE.gems=(SAVE.gems||0)+v;save();renderGold();sfx('gem');vib(25);toast(`+${v} cristalli`);renderProfile();renderSide()});
$('achBtn').onclick=()=>{sfx('ui');profSeg='ach';setTab('tabProfile')};
// --- the home: hero on the stone, equipment, arena card, play row
function homeMode(){const i=arenaIdx(SAVE.trophies||0),A=ARENAS[i];return{...modeOf(A.ch),kind:'Arena '+(i+1),n:A.n,d:A.d,mc:A.col,arena:i}}
const SKULL_SVG=k=>`<svg viewBox="0 0 20 20" aria-hidden="true">${k?'<path d="M5 5.5L6 1.8l2.2 2.4L10 1l1.8 3.2L14 1.8l1 3.7z" fill="#ffd84a" stroke="#191714" stroke-width="1.3" stroke-linejoin="round"/>':''}<path d="M10 ${k?4.6:2.4}C5.8 ${k?4.6:2.4} 3.2 ${k?7.2:5} 3.2 ${k?10.4:8.8}c0 2.1 1 3.4 2.3 4.2V18h9v-3.8c1.3-.8 2.3-2.1 2.3-4.2C16.8 ${k?7.2:5} 14.2 ${k?4.6:2.4} 10 ${k?4.6:2.4}z" fill="#f0e8d8" stroke="#191714" stroke-width="1.7" stroke-linejoin="round"/><circle cx="7.4" cy="${k?11:9.4}" r="1.9" fill="#191714"/><circle cx="12.6" cy="${k?11:9.4}" r="1.9" fill="#191714"/><path d="M8.3 18v-2M10 18v-2M11.7 18v-2" stroke="#191714" stroke-width="1.3"/></svg>`;
function renderChap(){const T=SAVE.trophies||0,i=arenaIdx(T),A=ARENAS[i],N=ARENAS[i+1],b=bestRoom(i),pct=N?clamp((T-A.t)/(N.t-A.t),0,1)*100:100;
  let tr='';for(let r=1;r<=ROOMS;r++){const boss=isBossRoom(r);tr+=(r>1?`<i class="rl ${r<=b?'on':''}"></i>`:'')+`<span class="rn ${boss?'boss':''} ${r===5?'elite':''} ${r<=b?'on':''} ${r===b+1?'next':''}">${boss?SKULL_SVG(r===ROOMS):''}</span>`}
  const html=`<div><span class="ck">Arena ${i+1}</span><h3>${A.n}</h3></div><div class="ctr"><span class="trNow">${TROPHY}${T.toLocaleString('it-IT')}</span><div class="trBar"><i style="width:${pct}%"></i><span>${N?'Arena '+(i+2)+': '+N.t.toLocaleString('it-IT'):'Arena massima!'}</span></div></div><div class="rtrack">${tr}<em>${b>=ROOMS?'Conquistata!':'Record '+b+'/'+ROOMS}</em></div>`;
  const el=$('chapCard');if(el._h!==html){el.innerHTML=html+'<i class="candle l"></i><i class="candle r"></i>';el._h=html;el.style.setProperty('--ac',A.col);el.style.setProperty('--thumb',`url(${arenaThumb(i)})`)}}
$('chapCard').onclick=()=>{sfx('ui');setTab('tabRoad')};
function renderGearRow(){const html=SLOTS.map(s=>{const id=SAVE.eq[s];if(!id||!SAVE.items[id])return `<button class="hgs empty" data-slot="${s}" aria-label="${SLOTN[s]}">+<small>${SLOTN[s]}</small></button>`;
    const it=ITEM[id],o=SAVE.items[id],r=RAR[it.rar];return `<button class="hgs" data-id="${id}" data-slot="${s}" style="--rc:${r.c};--rc2:${r.d}" aria-label="${it.n}">${canUpgrade(id)?'<em class="up">▲</em>':''}${itemSVG(it)}<b>Liv. ${o.lvl}</b></button>`}).join('');
  const el=$('homeGear');if(el._h!==html){el.innerHTML=html;el._h=html}}
$('homeGear').addEventListener('click',e=>{const b=e.target.closest('.hgs');if(!b)return;sfx('ui');if(b.dataset.id&&SAVE.items[b.dataset.id])openItem(b.dataset.id);else openPicker(b.dataset.slot)});
const CHAL_SVG='<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2.5l3.3 5.8 6.5-1.4-1.4 6.5 5.8 3.3-5.8 3.3 1.4 6.5-6.5-1.4L20 30.9l-3.3-5.8-6.5 1.4 1.4-6.5-5.8-3.3 5.8-3.3-1.4-6.5 6.5 1.4z" fill="#ffd84a" stroke="#191714" stroke-width="2.2" stroke-linejoin="round"/><circle cx="20" cy="16.7" r="6.6" fill="#ff8a3c" stroke="#191714" stroke-width="2"/><path d="M17.5 16.8l2 2 3.5-4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 37l8-5 8 5" fill="none" stroke="#191714" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ABYSS_SVG='<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16.5" fill="#1d1230" stroke="#191714" stroke-width="2.4"/><path d="M9 20a11 11 0 1 1 11 11 8 8 0 1 1 8-8 5 5 0 1 1-5-5" fill="none" stroke="#c48ae8" stroke-width="2.8" stroke-linecap="round"/><circle cx="20.5" cy="20" r="2.6" fill="#f4e6ff"/></svg>';
function renderModesRow(){const C=ensureChal(),dO=modeOpen('daily'),iO=modeOpen('inf');
  const ch=`${CHAL_SVG}<b>Sfida</b><small>${!dO?'Dopo 1 partita':C.done?'Record '+C.best.toLocaleString('it-IT'):'Nuova!'}</small>${dO&&!C.done?'<i class="bang">!</i>':''}`,
    ab=`${ABYSS_SVG}<b>Abisso</b><small>${iO?'Record '+(SAVE.inf.best||0):'Batti il Golem'}</small>`;
  const c=$('chalBtn'),a=$('abyssBtn');if(c._h!==ch){c.innerHTML=ch;c._h=ch}if(a._h!==ab){a.innerHTML=ab;a._h=ab}c.classList.toggle('lock',!dO);a.classList.toggle('lock',!iO)}
$('chalBtn').onclick=()=>openSheet('chal');$('abyssBtn').onclick=()=>openSheet('abyss');
function renderPlay(){renderChap();renderGearRow();renderModesRow();renderMissions();renderChestBtn();renderSide();$('heroPillN').textContent=(HERO_BY[SAVE.hero]||HEROES[0]).n;if(SHEET==='chests')fillChests()}
$('heroPill').onclick=()=>{sfx('ui');heroView=SAVE.hero;setTab('tabHero')};
// tapping the hero on the stone opens the heroes
$('homeStage').addEventListener('click',e=>{if(e.target.closest('button'))return;const H=CAMP.hero;if(!H)return;const r=campCv.getBoundingClientRect(),x=(e.clientX-r.left)*H.dpr,y=(e.clientY-r.top)*H.dpr;
  if(Math.abs(x-H.x)<H.w&&y<H.y+H.w*.3&&y>H.y-H.h){sfx('ui');heroView=SAVE.hero;setTab('tabHero')}});
function goPlay(mode){SAVE.sel=mode;save();if(!modeOpen(mode)){toast('Questa porta è ancora chiusa');return}if(CAMP.walk>0)return;initAudio();sfx('door');CAMP.walk=CAMP.t;
  if(RM||$('tabPlay').hidden||$('menu').hidden){CAMP.walk=0;startRun();return}setTimeout(()=>{CAMP.walk=0;startRun()},1700)}
// --- side buttons: login, missions, wheel, achievements | pass, road, chests, offers
function renderSide(){const lr=loginReady(),rr=roadReady(),pr=passReady(),wf=wheelFree(),ar=achReady();
  $('loginBtn').classList.toggle('hot',lr);$('loginBang').hidden=!lr;$('offerBang').hidden=true;$('roadSideBang').hidden=true;$('roadSide').classList.toggle('hot',!!rr);
  $('passBang').hidden=!pr;$('passBtn').classList.toggle('hot',!!pr);$('passLvl').textContent=passLvl();
  $('wheelBtn').classList.toggle('hot',wf);$('wheelBang').hidden=!wf;$('achPip').hidden=!ar;$('achPip').textContent=ar}
function renderBadges(){const g=SAVE.gold;
  $('heroBadge').hidden=!(HEROES.some(h=>!SAVE.heroes[h.id]&&g>=h.price)||TAL.some(t=>{const l=SAVE.tal[t.id]||0;return l<t.max&&g>=talCost(t,l)}));
  $('gearBadge').hidden=!ITEMS.some(i=>canAffordUp(i.id));
  $('petBadge').hidden=!PETS.some(p=>{const o=SAVE.pets.owned[p.id];if(!o)return (SAVE.gems||0)>=p.gems;return o.lvl<PETMAX&&(o.cards||0)>=petNeed(o.lvl)&&g>=petCost(o.lvl)});
  $('shopBadge').hidden=!freeReady();if(!$('tabPlay').hidden)renderSide()}
// --- tabs
const TABS=['tabHero','tabGear','tabPlay','tabPets','tabShop','tabRoad','tabProfile'];
function setTab(id){for(const t of TABS)$(t).hidden=t!==id;{const s=$(id);s.classList.remove('tabIn');void s.offsetWidth;s.classList.add('tabIn')}
  $('menu').classList.toggle('home',id==='tabPlay');document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===id));
  if(id==='tabHero')renderHero();if(id==='tabGear')renderGear();if(id==='tabPets'){renderPets();$('petHead').textContent=`Con te: ${petEq().length}/${PET_SLOTS}`}
  if(id==='tabShop')renderShop();if(id==='tabRoad')renderRoad();if(id==='tabProfile')renderProfile();if(id==='tabPlay')renderPlay();$('menuMain').scrollTop=0;renderBadges()}
function setShopPage(id){shopPage=id;const el=$(id);if(el&&!$('tabShop').hidden)setTimeout(()=>{const m=$('menuMain');m.scrollTop=Math.max(0,el.offsetTop-m.offsetTop-6)},0)}
document.addEventListener('click',e=>{if(e.target.closest('[data-back]')){sfx('ui');setTab('tabPlay')}});
// --- heroes: the showcase and the talents; armoury: equipment, collection and sets
function renderHero(){
  const h=HERO_BY[heroView]||HEROES[0],own=SAVE.heroes[h.id],sel=SAVE.hero===h.id;
  $('hName').textContent=h.n;$('heroInfo').innerHTML=`${h.d}<br><span class="start">Inizia con: ${h.start}</span><br><span class="start ult">Abilità: <b>${ULT[h.id].n}</b>. ${ULT[h.id].d}</span>`;
  $('hAct').innerHTML=sel?'<span class="using">In campo</span>':own?'<button class="btn bigGreen" data-hact="use">Porta in campo</button>':`<button class="btn" data-hact="buy">${heroConfirm===h.id?'Conferma':'Sblocca'} ${COIN}${h.price.toLocaleString('it-IT')}</button>`;
  $('hDots').innerHTML=HEROES.map(x=>`<i class="${x.id===h.id?'on':''} ${SAVE.heroes[x.id]?'':'lock'}"></i>`).join('');
  $('stage').classList.toggle('locked',!own);
  const keep=SAVE.hero;SAVE.hero=h.id;const q=previewStats();SAVE.hero=keep;
  $('hPower').textContent=powerOf(q).toLocaleString('it-IT');
  const rows=[['atk',Math.round(q.atk),'Attacco'],['hp',q.maxhp,'Salute'],['aspd',q.aspd.toFixed(2),'Colpi/s'],['crit',Math.round(q.crit*100)+'%','Critico'],['dash',q.dashMax.toFixed(1)+'s','Scatto'],['spd',Math.round(q.spd/1.5)+'%','Velocità'],['gold','+'+Math.round((q.goldMul-1)*100)+'%','Oro'],['regen',q.regen?q.regen.toFixed(1):'0','Rigenera']];
  $('stats').innerHTML=rows.map(([k,v,l])=>`<div>${sico(k)}<b>${v}</b><small>${l}</small></div>`).join('');
  renderTalents();renderGear();checkAch();renderWho();renderBadges();if(!$('tabPets').hidden)renderPets();renderGearRow();$('heroPillN').textContent=(HERO_BY[SAVE.hero]||HEROES[0]).n}
function renderGear(){
  const eqHTML=s=>{const id=SAVE.eq[s];return id&&SAVE.items[id]?`<div class="eqslot">${icard(id,`data-slot="${s}"`)}</div>`:`<div class="eqslot"><button class="icard empty" data-slot="${s}" aria-label="${SLOTN[s]}"><span>+</span><small>${SLOTN[s]}</small></button></div>`};
  $('eqL').innerHTML=eqHTML('arma')+eqHTML('armatura');$('eqR').innerHTML=eqHTML('anello')+eqHTML('amuleto');
  const order=ITEMS.slice().sort((a,b)=>SLOTS.indexOf(a.slot)-SLOTS.indexOf(b.slot)||b.rar-a.rar);
  $('coll').innerHTML=order.map(it=>icard(it.id)).join('');
  $('collCount').textContent=`${Object.keys(SAVE.items).length} di ${ITEMS.length} trovati`;
  $('gearPow').innerHTML=`Potenza <b>${powerOf(previewStats()).toLocaleString('it-IT')}</b>`;renderSets()}
$('tabGear').addEventListener('click',onHeroTap);
{const _ci=closeItem;closeItem=function(){_ci();if(!$('menu').hidden){if(!$('tabPlay').hidden)renderPlay();if(!$('tabGear').hidden)renderGear()}}}
// --- the wheel of fortune lives in the menu: one free spin a day, then a video or crystals
const WH_ADS=3,WH_COST=[20,40,60,80,100];
function wheelState(){const t=today();if(!SAVE.wheel||SAVE.wheel.day!==t)SAVE.wheel={day:t,free:0,ads:0,paid:0};return SAVE.wheel}
function wheelFree(){return wheelState().free<1}
const WH_IMG={};
function whImg(k){if(WH_IMG[k])return WH_IMG[k];const im=new Image();im.src=k.startsWith('pet:')?petIcon(k.slice(4)):k==='card'?svgURL(CARD_SVG):CHC[k]?rwImgSrc(k,'classica'):svgURL(chestSVG(k,false).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));return WH_IMG[k]=im}
const CARD_SVG='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48"><rect x="7" y="4" width="28" height="38" rx="4" fill="#4d97ff" stroke="#191714" stroke-width="3" transform="rotate(10 21 23)"/><rect x="4" y="6" width="28" height="38" rx="4" fill="#f4e7c8" stroke="#191714" stroke-width="3"/><path d="M18 14l3 6 6.5.8-4.8 4.4 1.2 6.4-5.9-3.2-5.9 3.2 1.2-6.4-4.8-4.4 6.5-.8z" fill="#ffd84a" stroke="#191714" stroke-width="2" stroke-linejoin="round"/></svg>';
function whCards(){const w=[[0,6],[1,4],[2,2],[3,.6]],tot=w.reduce((a,b)=>a+b[1],0);let r=Math.random()*tot,rar=0;for(const[k,v] of w){r-=v;if(r<0){rar=k;break}}
  const pool=ITEMS.filter(i=>i.rar===rar),it=pool[randi(0,pool.length-1)],n=[8,5,3,2][rar],o=SAVE.items[it.id];
  if(!o){SAVE.items[it.id]={lvl:1,cards:n-1};if(!SAVE.eq[it.slot])SAVE.eq[it.slot]=it.id}else o.cards+=n;return `+${n} carte: ${it.n}`}
function whPet(){const w=[['spiritello',2],['funghetto',2],['lucciola',1.5],['corvetto',1.5],['draghetto',1]],tot=8;let r=Math.random()*tot,id='spiritello';for(const[k,v] of w){r-=v;if(r<0){id=k;break}}
  const u=addPetCards(id,3);if(u)achPop('Nuovo compagno!',PET_BY[id].n+': trovalo nella scheda Compagni','unlock');return u?`${PET_BY[id].n}: nuovo compagno!`:`+3 carte ${PET_BY[id].n}`}
const ai0=()=>arenaIdx(SAVE.trophies||0);
WHEEL.length=0;WHEEL.push(
  {n:'Oro',ic:'coin',c:['#ffe27a','#d98a00'],w:1.5,f:()=>{const v=100+40*ai0();SAVE.gold+=v;return `+${v} oro`}},
  {n:'Carte',ic:'card',c:['#9fd0ff','#2a6fd8'],w:1.3,f:whCards},
  {n:'Cristalli',ic:'gem',c:['#8fe6ff','#2a8fb8'],w:1,f:()=>{SAVE.gems=(SAVE.gems||0)+5;return '+5 cristalli'}},
  {n:'Bustina',ic:'legno',c:['#c8f08a','#4c8a2c'],w:1,chest:'legno',f:()=>rwName('legno','classica')},
  {n:'Tesoro',ic:'coin',c:['#fff2a8','#e0a000'],w:.6,f:()=>{const v=300+100*ai0();SAVE.gold+=v;return `+${v} oro`}},
  {n:'Compagno',ic:'pet:spiritello',c:['#c8f8e0','#3f8a6a'],w:.8,f:whPet},
  {n:'Rara',ic:'argento',c:['#cfe2ff','#3f74d0'],w:.5,chest:'argento',f:()=>rwName('argento','classica')},
  {n:'JACKPOT',ic:'crown',c:['#fff2a8','#e0a000'],w:.25,jack:1,chest:'oro',f:()=>{SAVE.gems=(SAVE.gems||0)+25;return rwName('oro','classica')+' + 25 cristalli'}});
{const _wi=whIcon;whIcon=function(x,k,s){if(k==='card'||k==='legno'||k==='argento'||k.startsWith('pet:')){const im=whImg(k);if(icoOk(im)){x.save();x.scale(s,s);const w=k==='card'?30:k.startsWith('pet:')?40:28,h=k==='card'?36:k.startsWith('pet:')?40:42;x.drawImage(im,-w/2,-h/2-(k==='card'?3:0),w,h);x.restore()}return}return _wi(x,k,s)}}
function whButtons(){const W=wheelState(),go=$('whGo'),ad=$('whAd'),gm=$('whGem'),fr=W.free<1,cost=WH_COST[W.paid];
  go.hidden=!fr;go.textContent='Gira gratis!';go.disabled=false;go.classList.toggle('pulse',fr);
  ad.hidden=fr||W.ads>=WH_ADS;ad.disabled=false;ad.innerHTML=`Guarda un video <small>(${WH_ADS-W.ads} oggi)</small>`;
  gm.hidden=fr||cost==null;if(cost!=null){gm.innerHTML=`Gira · <i class="gemS"></i>${cost}`;gm.disabled=(SAVE.gems||0)<cost}
  $('whSub').textContent=fr?'Un giro gratis ogni giorno!':cost==null&&W.ads>=WH_ADS?'Per oggi basta così: torna domani!':'Il giro gratis torna domani'}
function openWheel(){if(!$('menu').hidden&&CHbusy)return;wheelState();WH.a=WH.a||0;WH.spin=false;WH.win=-1;WH.parts=[];WH.prize=null;$('whRes').innerHTML='';$('whRes').className='whRes';$('whAdScr').hidden=true;whButtons();$('whScr').hidden=false;sfx('shimmer',2);if(!WH.raf)WH.raf=requestAnimationFrame(whLoop)}
$('wheelBtn').onclick=()=>{sfx('ui');openWheel()};
function whClose(){if(WH.spin||!$('whAdScr').hidden)return;$('whScr').hidden=true;const pz=WH.prize;WH.prize=null;renderGold();if(!$('tabPlay').hidden)renderPlay();if(pz&&pz.chest)setTimeout(()=>openChest(pz.chest),200)}
$('whX').onclick=()=>{sfx('ui');whClose()};
function whSpin(kind){if(WH.spin)return;const W=wheelState();
  if(kind==='free'){if(W.free>=1)return;W.free++}else if(kind==='ad'){if(W.ads>=WH_ADS)return;W.ads++}else{const c=WH_COST[W.paid];if(c==null||(SAVE.gems||0)<c)return;SAVE.gems-=c;W.paid++;renderGold()}
  save();WH.spin=true;WH.win=-1;$('whRes').innerHTML='';['whGo','whAd','whGem'].forEach(id=>{$(id).disabled=true});$('whGo').classList.remove('pulse');sfx('dash');mprog('wheel',null,1);
  const n=WHEEL.length,tot=WHEEL.reduce((a,w)=>a+w.w,0);let r=Math.random()*tot,k=0;for(;k<n;k++){r-=WHEEL[k].w;if(r<0)break}k=Math.min(k,n-1);
  const start=WH.a,off=(Math.random()-.5)*TAU/n*.7,target=Math.ceil(start/TAU)*TAU+TAU*6-k/n*TAU+off,dur=4600,t0=performance.now();let last=Math.floor((start*n/TAU)+.5);
  const step=now=>{const q=Math.min(1,(now-t0)/dur),e=q<.08?q*q/.16:1-Math.pow(1-(q-.04)/.96,3.2);WH.a=start+(target-start)*Math.max(0,Math.min(1,e));
    const peg=Math.floor(WH.a*n/TAU+.5);if(peg!==last){last=peg;WH.flap=1;sfx('click')}
    if(q<1){requestAnimationFrame(step);return}
    WH.spin=false;WH.win=k;const w=WHEEL[k],res=w.f();WH.prize=w.chest?{chest:w.chest}:null;save();renderGold();whBurst(w.jack);
    $('whRes').innerHTML=`<span class="whPrize${w.jack?' jack':''}" style="--a:${w.c[0]};--b:${w.c[1]}"><b>${w.jack?'JACKPOT!':'Hai vinto'}</b>${res}</span>`;
    sfx(w.jack?'levelup':'upgrade');if(w.jack){setTimeout(()=>sfx('coin'),150);setTimeout(()=>sfx('gem'),300)}vib(w.jack?[60,40,60,40,160]:[30,30,60]);
    whButtons();if(WH.prize){$('whGo').hidden=false;$('whGo').disabled=false;$('whGo').textContent='Apri la cassa!';['whAd','whGem'].forEach(id=>$(id).hidden=true)}};requestAnimationFrame(step)}
$('whGo').onclick=()=>{if(WH.prize&&WH.prize.chest){const c=WH.prize.chest;WH.prize=null;$('whScr').hidden=true;if(!$('tabPlay').hidden)renderPlay();openChest(c);return}whSpin('free')};
$('whGem').onclick=()=>whSpin('gem');
// the video: a placeholder until the game has a real advertising service
$('whAd').onclick=()=>{const W=wheelState();if(WH.spin||W.ads>=WH_ADS)return;sfx('ui');const sc=$('whAdScr');sc.hidden=false;let n=5;$('whAdT').textContent=n;
  const iv=setInterval(()=>{n--;$('whAdT').textContent=n;if(n<=0){clearInterval(iv);sc.hidden=true;whSpin('ad')}},1000)};
// --- the companions page: how many are with you
{const _rp=renderPets;renderPets=function(){_rp();const h=$('petHead');if(h)h.textContent=`Con te: ${petEq().length}/${PET_SLOTS}`}}
// --- the home scene: the hero standing on a rune stone in front of the crypt
const HOME_Y=236;
const RUNES=[[[0,-2,0,2],[0,-2,1.5,-.7]],[[0,-2,0,2],[0,0,1.5,-1.3],[0,0,1.5,1.3]],[[-1.2,-2,1.2,2],[1.2,-2,-1.2,2]],[[0,-2,0,2],[-1.3,-.4,1.3,-.4]],[[-1.2,2,0,-2],[0,-2,1.2,2]],[[0,-2,0,2],[0,-2,1.4,0],[1.4,0,0,.6]]];
function drawRuneStone(x,y,s,col,t){ctx.save();ctx.translate(x,y);ctx.scale(s,s);const pul=.72+.28*Math.sin(t*2.1);
  // light pooling on the ground, a soft beam rising from the runes
  if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(col,0,2,46,.2*pul);const g=ctx.createLinearGradient(0,-70,0,0);g.addColorStop(0,`rgba(${col},0)`);g.addColorStop(1,`rgba(${col},${.13*pul})`);ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(-12,-70);ctx.lineTo(12,-70);ctx.lineTo(18,0);ctx.closePath();ctx.fill();ctx.restore()}
  else{ctx.save();ctx.globalCompositeOperation='lighter';glow(col,0,2,40,.16);ctx.restore()}
  // the slab: dark side, carved blocks, a lit top
  ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(1.5,6.5,27,8.6,0,0,TAU);ctx.fill();
  ctx.fillStyle='#2a2521';ctx.beginPath();ctx.ellipse(0,4,25,7.4,0,0,TAU);ctx.fill();ctx.fillRect(-25,0,50,4);
  ctx.strokeStyle=INK;ctx.lineWidth=2.3;ctx.lineJoin='round';ctx.beginPath();ctx.ellipse(0,4,25,7.4,0,0,Math.PI);ctx.stroke();ctx.beginPath();ctx.moveTo(-25,0);ctx.lineTo(-25,4);ctx.moveTo(25,0);ctx.lineTo(25,4);ctx.stroke();
  ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=1;for(const a of [.3,.85,1.45,2.05,2.65]){const px=Math.cos(a)*25,py=Math.sin(a)*7.4;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py+4);ctx.stroke()}
  const tg=ctx.createLinearGradient(0,-7.4,0,7.4);tg.addColorStop(0,'#7c7464');tg.addColorStop(1,'#4b453b');ctx.fillStyle=tg;ctx.beginPath();ctx.ellipse(0,0,25,7.4,0,0,TAU);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.3;ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(0,-.4,23.4,6.7,0,Math.PI*1.08,Math.PI*1.92);ctx.stroke();
  // cracks and a few tufts on the rim
  ctx.strokeStyle='rgba(20,16,12,.55)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-21,-2.5);ctx.lineTo(-17,-1.2);ctx.lineTo(-15.5,-2.8);ctx.moveTo(14,3.6);ctx.lineTo(17.5,2.2);ctx.lineTo(20.5,3.4);ctx.moveTo(4,-6.4);ctx.lineTo(5.5,-4.8);ctx.stroke();
  // the carved ring and its runes, glowing with the colour of the arena
  ctx.strokeStyle='rgba(18,14,11,.75)';ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(0,0,19,5.5,0,0,TAU);ctx.stroke();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${col},${.6*pul})`;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(0,0,19,5.5,0,0,TAU);ctx.stroke();
  for(let k=0;k<10;k++){const a=k/10*TAU+t*.1,px=Math.cos(a)*15,py=Math.sin(a)*4.3,f=.35+.65*Math.max(0,Math.sin(t*1.5+k*1.7));ctx.strokeStyle=`rgba(${col},${f*pul})`;ctx.lineWidth=.85;ctx.beginPath();
    for(const[x0,y0,x1,y1] of RUNES[k%RUNES.length]){ctx.moveTo(px+x0*.75,py+y0*.42);ctx.lineTo(px+x1*.75,py+y1*.42)}ctx.stroke()}
  glow(col,0,0,7,.25*pul);ctx.restore();ctx.restore()}
function drawHomeHero(x,y,s,t){const br=Math.sin(t*1.7)*.016,look=Math.sin(t*.37)*.42+Math.sin(t*.13)*.2,k=(t+2.1)%8,hop=k<.42?Math.sin(k/.42*Math.PI)*3.2:0,land=k>=.42&&k<.6?Math.sin((k-.42)/.18*Math.PI)*.06:0;
  ctx.save();ctx.translate(x,y-hop*s);ctx.scale(s*(1+land),s*(1+br-land));noShadow=false;mossOn=1;drawRig(0,0,Math.PI/2-.2+look,0,false,heroStyle(),{});mossOn=0;ctx.restore()}
