// ===================================================================== CLASSICA NUOVA (anteprima, 20 ottobre)
// Denis: «ok creami le cose che mi hai elencato su una cosa a parte senza intaccare il progetto principale». Questo file NON è in
// src/ordine.txt: lo mette python3 anteprime/mk_classica.py in una copia del gioco (ramo classica-nuova). CN.on lo spegne.
// 1 bivi tra le stanze (cnRoute*), 2 stanze con un obiettivo (CN_OBJ), 3 famiglie di abilità che si fondono (CN_FAM), 4 reliquie (CN_REL),
// 5 mappa del mondo con le stelle al posto della scalata delle coppe (cnMap*), 6 bracieri della fiamma, 7 Torre della settimana (cnTower*),
// 8 Corsa dei boss (cnRush*). Tutto avvolge funzioni del gioco; il salvataggio nuovo sta in SAVE.cn (stelle, reliquie trovate, record).
const CN={on:true,next:null,last:null,fx:[],swap:null,dash:false,err:0,sel:0,sub:null,pool:null};
function cnS(){const S=SAVE.cn||(SAVE.cn={});S.stars=S.stars||{};S.relics=S.relics||{};S.tower=S.tower||{};S.rush=S.rush||{};S.rew=S.rew||0;return S}
const cnErr=err=>{if(CN.err++<6)console.error('classica nuova:',err)};
const cnBoss=i=>ARENAS[i].bt||BOSSZ[ARENAS[i].boss]||'golem';
const cnBits=i=>cnS().stars[i]||0;
const cnStarN=i=>{const b=cnBits(i);return(b&1)+(b>>1&1)+(b>>2&1)};
const cnTot=()=>ARENAS.reduce((s,_,i)=>s+cnStarN(i),0);
const cnOpen=i=>i===0||!!cnS().all||cnStarN(i-1)>0;
const cnLit=()=>ARENAS.filter((_,i)=>cnBits(i)&1).length;
function cnPick(){const S=cnS();let p=S.pick;if(p==null||!ARENAS[p]||!cnOpen(p)){p=0;for(let i=0;i<ARENAS.length;i++)if(cnOpen(i))p=i}return p}
const CN_T3=420,CN_REW=6;   // la terza stella: l'arena in meno di 7 minuti; un premio della fiamma ogni 6 stelle
const CN_GOALS=["Vinci l'arena",'Finisci con più di metà salute','Finisci in meno di 7 minuti'];
const cnRgb=h=>{const n=parseInt(h.slice(1),16);return`${n>>16&255},${n>>8&255},${n&255}`};
const cnMS=s=>{s=Math.round(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const cnWeek=()=>Math.floor((Date.now()/864e5+3)/7);   // cambia il lunedì
function cnRng(salt){let h=2166136261;const s='w'+cnWeek()+'|'+salt;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return((h>>>0)%1e6)/1e6}}
// aspetta che non ci sia una scelta aperta, una pausa o un passaggio di stanza
function cnLater(fn,d){const go=()=>{if(!G||G.ended||!started)return;if(modal||paused||G.state==='trans'||G.state==='dead'){setTimeout(go,250);return}try{fn()}catch(err){cnErr(err)}};setTimeout(go,d||0)}

// ---------------------------------------------------------------- disegni (40×40, come le icone delle abilità)
const CNI={
  sword:`<path d="M30 4h6v6L18 28l-6-6z" fill="#dfe4ea" ${S2}/><path d="M28 6L14 20" stroke="#9aa3ad" stroke-width="2"/><path d="M9 21l10 10-3 3L6 24z" fill="#8a5a20" ${S2}/><path d="M7 29l4 4-4 4-4-4z" fill="#ffc93c" ${S2}/>`,
  skull:`<path d="M9 13L3 4l10 5M31 13l6-9-10 5" fill="#e8dcc0" ${S2}/><path d="M8 20a12 12 0 0 1 24 0v5l-3 2v6H11v-6l-3-2z" fill="#f6ead2" ${S2}/><circle cx="15" cy="20" r="3.6" fill="#e5484d" ${S2}/><circle cx="25" cy="20" r="3.6" fill="#e5484d" ${S2}/><path d="M17 33v-4M20 33v-4M23 33v-4" stroke="#1b1612" stroke-width="2"/>`,
  crown:`<path d="M5 30L3 11l9 8 8-13 8 13 9-8-2 19z" fill="#ffc93c" ${S2}/><path d="M6 30h28v5H6z" fill="#e0a020" ${S2}/><circle cx="20" cy="22" r="3.4" fill="#e5484d" ${S2}/><circle cx="11" cy="25" r="2.2" fill="#2fb3a6"/><circle cx="29" cy="25" r="2.2" fill="#2fb3a6"/>`,
  hour:`<path d="M10 4h20M10 36h20" stroke="#8a5a20" stroke-width="5" stroke-linecap="round"/><path d="M12 6h16c0 9-6 10-6 14s6 5 6 14H12c0-9 6-10 6-14s-6-5-6-14z" fill="#f6ead2" ${S2}/><path d="M15 32c1-5 4-5 5-8 1 3 4 3 5 8z" fill="#ffc93c"/><path d="M16 11h8" stroke="#ffc93c" stroke-width="3" stroke-linecap="round"/>`,
  totem:`<path d="M12 36h16l-2-7H14z" fill="#5a4636" ${S2}/><rect x="13" y="19" width="14" height="10" rx="3" fill="#8f6c48" ${S2}/><rect x="14" y="9" width="12" height="10" rx="3" fill="#a07a52" ${S2}/><circle cx="17" cy="14" r="1.8" fill="#9ff07a"/><circle cx="23" cy="14" r="1.8" fill="#9ff07a"/><circle cx="17" cy="24" r="1.8" fill="#9ff07a"/><circle cx="23" cy="24" r="1.8" fill="#9ff07a"/><path d="M14 9l-5-6 7 3M26 9l5-6-7 3" fill="#e8dcc0" ${S2}/>`,
  wave:`<path d="M3 22c4-4 7-4 11 0s7 4 11 0 7-4 12 0v14H3z" fill="#ff8a3c" ${S2}/><path d="M3 30c4-3 7-3 11 0s7 3 11 0 7-3 12 0" fill="none" stroke="#ffc93c" stroke-width="2.4"/><path d="M14 16V5M26 16V8M9 12l5 4 5-4M21 12l5 4 5-4" fill="none" stroke="#f6ead2" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  chest:`<path d="M5 18h30v16H5z" fill="#a0642a" ${S2}/><path d="M5 18c0-8 6-12 15-12s15 4 15 12z" fill="#c07a34" ${S2}/><path d="M5 18h30M12 7v27M28 7v27" stroke="#ffc93c" stroke-width="3"/><rect x="16" y="15" width="8" height="9" rx="2" fill="#ffc93c" ${S2}/>`,
  lamp:`<path d="M20 2v5" stroke="#1b1612" stroke-width="3"/><path d="M11 8h18l-3 4H14z" fill="#3b332b" ${S2}/><path d="M13 12h14l-2 18H15z" fill="#ffd27a" ${S2}/><path d="M20 17c2 3 3 5 3 7a3 3 0 0 1-6 0c0-2 1-4 3-7z" fill="#fff6c8"/><path d="M12 30h16v4H12z" fill="#3b332b" ${S2}/>`,
  drop:`<path d="M20 4c7 9 11 15 11 21a11 11 0 0 1-22 0c0-6 4-12 11-21z" fill="#7fd3f0" ${S2}/><path d="M15 25a5 5 0 0 0 5 5" stroke="#f6ead2" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  bag:`<path d="M14 9h12l-3 5h-6z" fill="#8a5a20" ${S2}/><path d="M17 14h6c8 4 11 10 11 15 0 4-3 7-7 7H13c-4 0-7-3-7-7 0-5 3-11 11-15z" fill="#c07a34" ${S2}/><circle cx="20" cy="26" r="5" fill="#ffc93c" ${S2}/>`,
  flame:`<path d="M20 3c4 7 12 11 12 21a12 12 0 0 1-24 0c0-6 4-9 6-13 1 4 3 6 5 6 0-6 0-9 1-14z" fill="#c48ae8" ${S2}/><path d="M20 22c3 3 5 5 5 8a5 5 0 0 1-10 0c0-3 3-5 5-8z" fill="#f4e6ff"/>`,
  coin:`<circle cx="20" cy="20" r="14" fill="#ffc93c" ${S2}/><circle cx="20" cy="20" r="9" fill="none" stroke="#c08a10" stroke-width="2.5"/><path d="M20 14v12" stroke="#c08a10" stroke-width="3" stroke-linecap="round"/>`,
  medal:`<path d="M12 3h6l4 11h-6zM28 3h-6l-4 11h6z" fill="#e5484d" ${S2}/><circle cx="20" cy="25" r="11" fill="#c9cfd6" ${S2}/><path d="M20 19l2 4 4 .5-3 3 1 4-4-2-4 2 1-4-3-3 4-.5z" fill="#ffc93c" stroke="#1b1612" stroke-width="1.4" stroke-linejoin="round"/>`};
const CN_EVI={fontana:'drop',mercante:'bag',altare:'flame',tesoro:'chest',oro:'coin',sfida:'medal'},CN_EVC={fontana:'#7fd3f0',mercante:'#ffc93c',altare:'#c48ae8',tesoro:'#ffd84a',oro:'#ffc93c',sfida:'#c9cfd6'};
const CN_STAR='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21.1l1.5-7L2 9.3l7-.8z" fill="currentColor" stroke="#191714" stroke-width="2" stroke-linejoin="round"/></svg>';
const CN_BRAZ='<svg viewBox="0 0 24 32" aria-hidden="true"><path class="fl" d="M12 1c3 5 7 7 7 12a7 7 0 0 1-14 0c0-4 3-6 4-9 1 3 2 4 3 4 0-3 0-5 0-7z"/><path d="M2.5 15h19l-3.5 6H6z" fill="#5a4636" stroke="#191714" stroke-width="2" stroke-linejoin="round"/><path d="M10 21h4v6h-4z" fill="#3b332b" stroke="#191714" stroke-width="2"/><path d="M6 29h12" stroke="#191714" stroke-width="3" stroke-linecap="round"/></svg>';
const CN_LOCK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#191714" stroke-width="4.6"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#b8a990" stroke-width="2"/><rect x="5" y="10" width="14" height="11" rx="2.5" fill="#b8a990" stroke="#191714" stroke-width="2"/><circle cx="12" cy="15" r="1.8" fill="#191714"/></svg>';
const cnIco=(k,c)=>`<svg viewBox="0 0 40 40" aria-hidden="true"${c?` style="--c:${c}"`:''}>${CNI[k]||ICON[k]||''}</svg>`;

// ---------------------------------------------------------------- 3 famiglie di abilità e fusioni
// c: il colore della famiglia; t: lo stesso, scuro, per le scritte sulle carte color pergamena
const CN_FAM={fuoco:{n:'Fuoco',c:'#ff8a3c',t:'#c2410c',ids:['fire','braci'],fu:'fu_inferno'},gelo:{n:'Gelo',c:'#7fd3f0',t:'#1b6f93',ids:['ice','brina'],fu:'fu_bufera'},
  veleno:{n:'Veleno',c:'#8fd14f',t:'#3f7a24',ids:['poison','spore'],fu:'fu_peste'},fulmine:{n:'Fulmine',c:'#bfe9ff',t:'#3a56a8',ids:['light','statica'],fu:'fu_tempesta'}};
const cnFamOf=id=>Object.keys(CN_FAM).find(k=>CN_FAM[k].ids.includes(id));
SK.push(
  {id:'braci',n:'Scia di braci',d:'Lo scatto lascia fiamme a terra',max:1,f:()=>{P.cnBraci=1}},
  {id:'brina',n:'Brina',d:'I nemici vicini a te rallentano',max:1,f:()=>{P.cnBrina=1}},
  {id:'spore',n:'Spore',d:'I nemici avvelenati, cadendo, lasciano una nube di veleno',max:1,f:()=>{P.cnSpore=1}},
  {id:'statica',n:'Carica statica',d:'Ogni scatto scaglia un fulmine su tre nemici',max:1,f:()=>{P.cnStat=1}},
  {id:'fu_inferno',evo:1,fuse:'fuoco',req:['fire','braci'],n:'Inferno',d:'Chi brucia, cadendo, esplode in fiamme',max:1,f:()=>{P.cnInferno=1;P.burnMul=(P.burnMul||1)*1.3}},
  {id:'fu_bufera',evo:1,fuse:'gelo',req:['ice','brina'],n:'Bufera',d:'Ogni 6 secondi una bufera congela i nemici intorno a te',max:1,f:()=>{P.cnBufera=1}},
  {id:'fu_peste',evo:1,fuse:'veleno',req:['poison','spore'],n:'Peste',d:"Il veleno salta da un nemico all'altro e fa il doppio",max:1,f:()=>{P.cnPeste=1;P.poison=(P.poison||1)*2}},
  {id:'fu_tempesta',evo:1,fuse:'fulmine',req:['light','statica'],n:'Tempesta',d:'I fulmini cadono il doppio e stordiscono',max:1,f:()=>{P.cnTemp=1;P.light=(P.light||0)+2}});
for(const s of SK)if(s.fuse)s.cond=()=>s.req.every(r=>P.skills[r]);
Object.assign(SKR,{braci:1,brina:1,spore:1,statica:2});
Object.assign(ICON,{
  braci:`<path d="M4 34h32" stroke="#5a4636" stroke-width="4" stroke-linecap="round"/><path d="M9 33c-2-5 1-8 3-11 1 3 3 4 3 4 0-4 1-7 3-9 2 5 6 8 5 16zM24 33c-1-4 1-6 3-8 1 2 2 3 2 3 1-3 2-4 3-5 1 4 2 7 0 10z" fill="#ff8a3c" ${S2}/><path d="M3 15h9M2 21h7M5 9h8" stroke="#2fb3a6" stroke-width="3" stroke-linecap="round"/>`,
  brina:`<circle cx="20" cy="20" r="15" fill="none" stroke="#7fd3f0" stroke-width="3" stroke-dasharray="5 4"/><circle cx="20" cy="20" r="6" fill="#2fb3a6" ${S2}/><path d="M20 3v6M20 31v6M3 20h6M31 20h6M8 8l4 4M28 28l4 4M32 8l-4 4M8 32l4-4" stroke="#dff4ff" stroke-width="2.4" stroke-linecap="round"/>`,
  spore:`<path d="M10 32c2-6 6-9 10-9s8 3 10 9z" fill="#9a5bc8" ${S2}/><circle cx="20" cy="17" r="9" fill="#8fd14f" ${S2}/><circle cx="16" cy="15" r="2" fill="#3f6a2a"/><circle cx="23" cy="19" r="1.6" fill="#3f6a2a"/><circle cx="8" cy="9" r="3" fill="#b8e88a" ${S2}/><circle cx="32" cy="8" r="2.4" fill="#b8e88a" ${S2}/><circle cx="33" cy="17" r="1.8" fill="#b8e88a"/>`,
  statica:`<path d="M5 30h9l-4 7" fill="none" stroke="#2fb3a6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 2L12 20h8l-3 15 14-19h-8z" fill="#bfe9ff" ${S2}/><path d="M30 26l5 3M31 33l4-1M3 22l5 1" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`,
  fu_inferno:`${GOLDR}<path d="M20 5c4 6 11 10 11 19a11 11 0 0 1-22 0c0-6 4-8 6-12 1 4 3 5 5 5 0-5-1-8 0-12z" fill="#ff6a2a" ${S2}/><path d="M20 20c3 3 5 5 5 8a5 5 0 0 1-10 0c0-3 3-5 5-8z" fill="#ffe27a"/><circle cx="9" cy="10" r="2" fill="#ffc93c"/><circle cx="31" cy="11" r="1.6" fill="#ffc93c"/>`,
  fu_bufera:`${GOLDR}<path d="M20 5v30M7 12l26 16M33 12L7 28" stroke="#dff4ff" stroke-width="3.4" stroke-linecap="round"/><circle cx="20" cy="20" r="6" fill="#7fd3f0" ${S2}/><path d="M9 33c5-3 9-3 13 0" stroke="#7fd3f0" stroke-width="2.4" fill="none"/>`,
  fu_peste:`${GOLDR}<circle cx="14" cy="22" r="7" fill="#8fd14f" ${S2}/><circle cx="26" cy="15" r="6" fill="#8fd14f" ${S2}/><circle cx="25" cy="28" r="4.6" fill="#b8e88a" ${S2}/><path d="M18 18l4-2M19 25l3 1" stroke="#3f6a2a" stroke-width="2.4"/>`,
  fu_tempesta:`${GOLDR}<path d="M8 13a8 6 0 0 1 12-6 8 6 0 0 1 13 4 5 5 0 0 1-2 9H10a5 5 0 0 1-2-7z" fill="#9aa3ad" ${S2}/><path d="M17 20l-4 8h5l-2 8 9-11h-5l3-5z" fill="#ffe27a" ${S2}/>`});
// le carte: la famiglia di ogni abilità e, quando c'è, l'annuncio della fusione
{const _os=openSkills;openSkills=function(){const r=_os.apply(this,arguments);try{if(CN.on)cnDecorate()}catch(err){cnErr(err)}return r}}
function cnDecorate(){$('skList').querySelectorAll('.sk').forEach(b=>{const s=offer[+b.dataset.i];if(!s)return;
  if(s.fuse){const F=CN_FAM[s.fuse],t=b.querySelector('.evotag');if(t)t.textContent='FUSIONE · '+F.n;b.classList.add('cnfu');b.style.setProperty('--fc',F.c);return}
  const fk=cnFamOf(s.id);if(!fk)return;const F=CN_FAM[fk],have=F.ids.filter(id=>P.skills[id]).length,other=F.ids.find(id=>id!==s.id),div=b.querySelector('div');if(!div)return;
  const em=document.createElement('em');em.className='cnfam';em.style.setProperty('--fc',F.t);
  em.textContent=P.skills[other]&&!P.skills[s.id]&&!P.skills[F.fu]?`${F.n}: con questa, FUSIONE!`:`Famiglia del ${F.n.toLowerCase()} · ${have} di 2`;div.appendChild(em)})}
{const _pk=pick;pick=function(i){const s=offer[i],had=s&&P.skills[s.id];const r=_pk.apply(this,arguments);
  try{if(CN.on&&s&&s.fuse&&!had&&P.skills[s.id]){const F=CN_FAM[s.fuse];banner('FUSIONE!',s.n,1.8);G.waves.push({x:P.x,y:P.y,r:6,max:130,dmg:0,hit:true,rgb:cnRgb(F.c)});vfxBlast(P.x,P.y-10,cnRgb(F.c),90,{sparks:18})}}catch(err){cnErr(err)}return r}}
{const _lt=lightning;lightning=function(e){const r=_lt.apply(this,arguments);try{if(CN.on&&P.cnTemp)for(const o of G.enemies)if(!o.dead&&!isBoss(o.type)&&Math.hypot(o.x-e.x,o.y-e.y)<150)o.daze=Math.max(o.daze||0,.6)}catch(err){}return r}}
function cnStatic(){const T=G.enemies.filter(e=>canHit(e)&&Math.hypot(e.x-P.x,e.y-P.y)<260).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y)).slice(0,3);
  let px=P.x,py=P.y-12;for(const e of T){fxPush({k:'bolt',x:px,y:py,x2:e.x,y2:e.y-e.r,t:.25,max:.25});fxPush({k:'flash',x:e.x,y:e.y-e.r,rgb:'170,220,255',r:30,t:.16,max:.16});
    hurtE(e,P.atk*.8,false,true);if(P.cnTemp&&!isBoss(e.type))e.daze=Math.max(e.daze||0,.7);px=e.x;py=e.y-e.r}
  if(T.length)sfx('thunder',0,P.x)}
function cnBlizzard(){let n=0;for(const e of G.enemies){if(e.dead||e.spawn>0||e.intro>0||Math.hypot(e.x-P.x,e.y-P.y)>130)continue;if(isBoss(e.type))e.slow=Math.max(e.slow||0,2);else e.frozen=Math.max(e.frozen||0,1.4);n++}
  CN.fx.push({k:'snow',x:P.x,y:P.y+4,t:.6,max:.6,r:130});sfx('freeze',0,P.x);if(n)text(P.x,P.y-50,'Bufera!','#bfe9ff',15)}
function cnBlast(x,y,R,k,f){G.fx.push({k:'boom',x,y,r:R,t:.35});for(const o of G.enemies){if(!canHit(o)||Math.hypot(o.x-x,o.y-y)>R+o.r)continue;hurtE(o,P.atk*k,false,true);if(f&&!o.dead)f(o)}sfx('boom',0,x)}

// ---------------------------------------------------------------- 4 reliquie
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
function cnRelicOffer(){if(!G||G.ended)return;const own=new Set(G.relics||[]),pool=CN_REL.filter(r=>!own.has(r.id));if(!pool.length)return;const opts=shuffle(pool.slice()).slice(0,2),S=cnS();cnEnsure();
  $('cnRelIn').innerHTML=`<span class="tag">Premio dell'élite</span><h2>Scegli una reliquia</h2><p class="hint">Resta con te fino alla fine della partita. Quelle che trovi entrano nella tua collezione.</p>
    <div class="cnRels">${opts.map((r,k)=>`<button class="cnRelC" data-k="${k}" style="--rc:${r.c};animation-delay:${k*.12}s"><span class="cnRelI">${cnRelIco(r.id)}</span>${S.relics[r.id]?'':'<em class="cnNew">Nuova!</em>'}<b>${r.n}</b><span>${r.d}</span></button>`).join('')}</div>`;
  $('cnRelIn').querySelectorAll('.cnRelC').forEach(b=>b.onclick=()=>{const r=opts[+b.dataset.k];$('cnRel').hidden=true;modal=false;paused=false;r.f();(G.relics=G.relics||[]).push(r.id);S.relics[r.id]=(S.relics[r.id]||0)+1;save();
    sfx('levelup');banner('Reliquia!',r.n,1.6);vfxBlast(P.x,P.y-12,cnRgb(r.c),80,{sparks:16})});
  modal=true;paused=true;$('cnRel').hidden=false;sfx('shimmer',2)}

// ---------------------------------------------------------------- 2 stanze con un obiettivo
const CN_OBJ={
  resisti:{ic:'hour',n:'Resisti!',d:'Resisti 30 secondi: i nemici non smettono di arrivare'},
  totem:{ic:'totem',n:'I tre totem',d:'Rompi i tre totem: finché stanno in piedi chiamano rinforzi'},
  lava:{ic:'wave',n:'Il pavimento sale',d:'Il pavimento si allaga piano piano: sconfiggi tutti prima che salga'},
  scrigno:{ic:'chest',n:'Scrigno a tempo',d:'Sconfiggi tutti prima che il tempo finisca e lo scrigno è tuo'},
  proteggi:{ic:'lamp',n:'La lanterna',d:'Metà dei nemici vuole spegnere la lanterna: difendila'}};
const CN_LIQ={1:{n:'Il veleno sale',c:'123,211,74',c2:'#2c5a1a'},2:{n:'La lava sale',c:'255,110,40',c2:'#6a1e0c'},3:{n:'La palude sale',c:'150,170,60',c2:'#2a3612'},4:{n:"L'acqua gelida sale",c:'127,211,240',c2:'#1e4a6a'}};
const cnObjName=k=>k==='lava'?CN_LIQ[G.chapter||1].n:CN_OBJ[k].n;
Object.defineProperty(ET,'cntotem',{value:{r:15,hp:70,cdmg:0,gold:3,name:'Totem',title:''},enumerable:false,configurable:true});
ECOL.cntotem='#a07a52';XPV.cntotem=6;
function cnFree(x,y,r){for(let k=0;k<14;k++){const px=x+(k?rand(-70,70):0),py=y+(k?rand(-45,45):0);if(!G.rocks.some(q=>Math.hypot(q.x-px,q.y-py)<q.r+r+12))return{x:clamp(px,L+34,R-34),y:clamp(py,TOP+44,BOT-70)}}return{x,y}}
function cnSpawn(n,x,y){const pool=CN.pool||(CN.pool=compositionFor(G.room).filter(t=>!isBoss(t)&&ET[t]));for(let i=0;i<n;i++){const t=pk(pool.length?pool:['slime']);
  const s=x!=null?{x:clamp(x+rand(-34,34),L+24,R-24),y:clamp(y+rand(14,44),TOP+30,BOT-60)}:freeSpot(ET[t].r,TOP+40,TOP+(BOT-TOP)*.45);
  const e=makeE(t,s.x,s.y,.9,false);G.enemies.push(e);if(G.cnObj&&G.cnObj.k==='proteggi'&&Math.random()<.5)e.cnL=true}}
function cnObjStart(k){const O={k,t:0};G.cnObj=O;
  if(k==='resisti'){O.left=30;O.sp=4}
  if(k==='totem'){G.enemies=G.enemies.slice(0,Math.max(2,Math.ceil(G.enemies.length/2)));
    for(const[x,y] of [[L+80,TOP+120],[R-80,TOP+120],[AW/2,TOP+(BOT-TOP)*.44]]){const p=cnFree(x,y,24),e=makeE('cntotem',p.x,p.y,.6);if(SAVE.seen)delete SAVE.seen.cntotem;e.cnS=2.5+Math.random()*2;G.enemies.push(e)}}
  if(k==='lava'){O.y=BOT+40;O.top=TOP+(BOT-TOP)*.42;O.dt=0}
  if(k==='scrigno'){O.left=O.all=22+Math.min(10,G.room);const p=cnFree(L+(R-L)*.3,TOP+(BOT-TOP)*.42,26);O.x=p.x;O.y=p.y;(G.cc=G.cc||[]).push({st:'cn',cn:'chest',x:O.x,y:O.y,t:0})}
  if(k==='proteggi'){const p=cnFree(AW/2,(TOP+BOT)/2-10,34);O.x=p.x;O.y=p.y;O.hp=O.max=100;(G.cc=G.cc||[]).push({st:'cn',cn:'lamp',x:O.x,y:O.y,t:0});let i=0;for(const e of G.enemies)if(!isBoss(e.type)&&i++%2===0)e.cnL=true}
  banner(cnObjName(k),CN_OBJ[k].d,2.8)}
function cnObjTick(dt){const O=G.cnObj;if(!O)return;O.t+=dt;const play=G.state==='play';
  if(O.k==='resisti'){if(play&&!O.done){O.left-=dt;O.sp-=dt;if(O.sp<=0){O.sp=5.5;cnSpawn(2)}
      if(O.left<=0){O.done=true;O.win=true;for(const e of G.enemies)if(!e.dead&&!isBoss(e.type))killE(e);text(P.x,P.y-50,'Resistito!','#ffc93c',18);sfx('victory')}}
    cnHud(play&&!O.done?`<b>Resisti</b>${Math.ceil(O.left)}`:'')}
  else if(O.k==='totem'){const T=G.enemies.filter(e=>e.type==='cntotem'&&!e.dead);
    if(play)for(const e of T){if(e.spawn>0)continue;e.cnS-=dt;if(e.cnS<=0){e.cnS=5;if(G.enemies.length<11){cnSpawn(1,e.x,e.y);sfx('summon',0,e.x);for(let q=0;q<8;q++)G.fx.push({k:'puff',x:e.x+rand(-10,10),y:e.y-20,vx:rand(-40,40),vy:rand(-50,-10),t:rand(.3,.5),r:rand(4,7)})}}}
    O.win=!T.length;cnHud(play&&T.length?`<b>Totem</b>${3-T.length} di 3`:'')}
  else if(O.k==='lava'){const k=play?clamp((O.t-3)/34,0,1):0;if(play)O.y=BOT+40-(BOT+40-O.top)*k;else O.y=Math.min(BOT+40,O.y+dt*140);
    if(play&&P.y>O.y+6&&!(P.dashT>0)){O.dt-=dt;if(O.dt<=0){O.dt=.75;hurtP(Math.round(P.maxhp*.07));text(P.x,P.y-36,'Scotta!','#ff9a3c',13)}}else O.dt=Math.min(O.dt,.25);
    O.win=true;cnHud(play?`<b>${cnObjName('lava')}</b>nemici ${G.enemies.filter(e=>!e.dead).length}`:'')}
  else if(O.k==='scrigno'){if(play&&!O.lost){O.left-=dt;if(O.left<=0){O.lost=true;sfx('rock');shake(3);banner('Troppo tardi!','Lo scrigno si è chiuso',1.6);const c=(G.cc||[]).find(q=>q.cn==='chest');if(c)c.lost=1}}
    O.win=!O.lost;cnHud(play&&!O.lost?`<b>Scrigno</b>${Math.ceil(O.left)}`:'')}
  else if(O.k==='proteggi'){if(play&&!O.lost){for(const e of G.enemies)if(!e.dead&&!(e.spawn>0)&&Math.hypot(e.x-O.x,e.y-O.y)<e.r+20){O.hp-=dt*(e.elite?16:9);O.hit=.15}
      for(let i=G.eproj.length-1;i>=0;i--){const p=G.eproj[i];if(Math.hypot(p.x-O.x,p.y-(O.y-16))<(p.r||5)+14){O.hp-=Math.max(4,(p.dmg||8)*.5);O.hit=.15;G.eproj.splice(i,1)}}
      if(O.hp<=0){O.hp=0;O.lost=true;for(const e of G.enemies)e.cnL=false;sfx('glass');shake(5);banner('La lanterna si è spenta','Niente premio questa volta',1.8);vfxBlast(O.x,O.y-40,'255,200,120',60,{sparks:16})}}
    O.hit=Math.max(0,(O.hit||0)-dt);O.win=!O.lost;cnHud(play&&!O.lost?`<b>Lanterna</b>${Math.ceil(O.hp)}%`:'')}}
function cnObjReward(){const O=G.cnObj;sfx('victory');vib([30,30,60]);
  if(O.k==='scrigno'){const c=(G.cc||[]).find(q=>q.cn==='chest');if(c){c.open=1;c.ok=0}for(let i=0;i<20+G.room*2;i++){const a=rand(-Math.PI,0),s=rand(80,200);G.coins.push({x:O.x,y:O.y-10,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:-.2})}G.hearts.push({x:O.x+18,y:O.y+18,t:0})}
  if(O.k==='proteggi'){const v=Math.round(P.maxhp*.25);P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-40,'+'+v,'#7bbf4a',16)}
  banner('Obiettivo compiuto!',"Un'abilità in più",1.6);cnLater(()=>{openSkills('treasure');$('skTag').textContent='Obiettivo compiuto'},800)}
function cnHud(h){let el=$('cnHud');if(!el){el=document.createElement('div');el.id='cnHud';$('banner').parentElement.appendChild(el)}if(el._h!==h){el._h=h;el.innerHTML=h;el.hidden=!h}}
// il totem: un nemico che non si muove, si rompe a frecce e chiama rinforzi
function cnTotemUpd(e,dt){e.t+=dt;e.flash=Math.max(0,e.flash-dt);e.kbx=e.kby=0;if(e.spawn>0){e.spawn-=dt;return}e.moving=false;
  if(e.burn>0){e.burn-=dt;e.burnTick-=dt;if(e.burnTick<=0){e.burnTick=.5;hurtE(e,P.atk*.18*(P.burnMul||1),false,true);if(e.dead)return}}
  if(e.poisonT>0){e.poisonT-=dt;e.pTick=(e.pTick||0)-dt;if(e.pTick<=0){e.pTick=.5;hurtE(e,P.atk*.07*(e.poisonS||1)*(P.poison||1),false,true)}}}
function cnDrawTotem(e){if(e.spawn>.5)return;const x=e.x,y=e.y,t=G.t+e.x*.01,c=ARENAS[G.arena||0].col,rgb=cnRgb(c),k=e.cnS!=null?clamp(1-e.cnS/1.2,0,1):0,fl=e.flash>0,up=e.spawn>0?e.spawn/.5:0;
  ctx.save();if(up)ctx.globalAlpha=1-up;
  if(k>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${rgb},${.7*k})`;ctx.lineWidth=3;ell(x,y+2,18+12*k,7+5*k);ctx.stroke();ctx.restore()}
  ink(2.5);ell(x,y+1,16,6.5);fs('#4a3d30');
  const seg=[['#6a4e34','#a07a52'],['#5c4430','#8f6c48'],['#6a4e34','#a07a52']];
  for(let i=0;i<3;i++){const by=y-3-i*13.5,w=12.5-i*1.1;ctx.beginPath();ctx.moveTo(x-w,by);ctx.lineTo(x-w+1.4,by-13.5);ctx.lineTo(x+w-1.4,by-13.5);ctx.lineTo(x+w,by);ctx.closePath();
    const g=ctx.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,seg[i][0]);g.addColorStop(.42,seg[i][1]);g.addColorStop(1,seg[i][0]);ink(2.4);ctx.fillStyle=fl?'#fff':g;ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(255,240,210,.22)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-w+3,by-12);ctx.lineTo(x+w-4,by-12);ctx.stroke();
    const ey=by-8.5,pu=.5+.5*Math.sin(t*4+i*1.7);if(!LOWFX)glow(rgb,x,ey,10,.2+.25*pu+.3*k);ctx.fillStyle=c;circ(x-4.2,ey,2);ctx.fill();circ(x+4.2,ey,2);ctx.fill();
    ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x-4,by-3.6);ctx.lineTo(x-1.5,by-2.4);ctx.lineTo(x+1.5,by-3.6);ctx.lineTo(x+4,by-2.4);ctx.stroke()}
  const hy=y-43.5;ink(2.2);for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(x+s*9,hy);ctx.quadraticCurveTo(x+s*17,hy-10,x+s*8,hy-17);ctx.lineTo(x+s*5,hy-1);ctx.closePath();fs('#e8dcc0')}
  const f=clamp(e.hp/e.max,0,1);ctx.lineWidth=4.5;ctx.strokeStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.arc(x,hy-25,6.5,0,TAU);ctx.stroke();ctx.strokeStyle='#e5484d';ctx.lineWidth=3.2;ctx.beginPath();ctx.arc(x,hy-25,6.5,-Math.PI/2,-Math.PI/2+TAU*f);ctx.stroke();
  ctx.restore()}
// la lanterna da difendere e lo scrigno a tempo stanno nella lista delle casse gemelle (G.cc): ordinati con gli altri e solidi
let cnDT0=null;
{const _dt=drawTwinChest;cnDT0=_dt;drawTwinChest=function(c){if(c&&c.cn){try{cnDrawCC(c)}catch(err){cnErr(err)}return}return _dt.apply(this,arguments)}}
function cnDrawCC(c){const O=G.cnObj,x=c.x,y=c.y,t=G.t;
  if(c.cn==='lamp'){const on=O&&O.k==='proteggi'&&!O.lost,hp=on?O.hp/O.max:0,hit=on&&O.hit>0,ly=y-50;
    shadow(x,y+3,16,6,.35);ink(2.5);ell(x,y,15,6);fs('#3b332b');ctx.beginPath();ctx.rect(x-3,y-38,6,36);fs('#5a4636');
    if(on&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,200,110',x,ly,48+6*Math.sin(t*3),.3+.25*hp);ctx.restore()}
    ink(2.5);ctx.beginPath();ctx.moveTo(x-10,ly-11);ctx.lineTo(x+10,ly-11);ctx.lineTo(x+8,ly+11);ctx.lineTo(x-8,ly+11);ctx.closePath();fs(on?(hit?'#ffffff':'#ffd27a'):'#4a4036');
    ctx.beginPath();ctx.moveTo(x-12,ly-11);ctx.lineTo(x,ly-20);ctx.lineTo(x+12,ly-11);ctx.closePath();fs('#3b332b');ctx.beginPath();ctx.rect(x-9,ly+11,18,3.5);fs('#3b332b');
    if(on){const f=1+.15*Math.sin(t*9);ctx.fillStyle='#fff6c8';ctx.beginPath();ctx.ellipse(x,ly+3,2.8*f,5.4*f,0,0,TAU);ctx.fill()}
    if(on){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(x-19,ly-33,38,7);ctx.fillStyle=hp>.35?'#ffc93c':'#e5484d';ctx.fillRect(x-18,ly-32,36*hp,5)}}
  else if(c.cn==='chest'){if(c.open)c.ok=Math.min(1,(c.ok||0)+.03);
    cnDT0({x,y,st:c.open?'open':'idle',t:1,k:c.open?c.ok:0,bad:false,crush:[]});
    if(c.lost){ctx.save();ctx.globalAlpha=.6;ctx.fillStyle='#211b17';ell(x,y-10,22,16);ctx.fill();ctx.restore();ink(3);ctx.beginPath();ctx.moveTo(x-18,y-22);ctx.lineTo(x+18,y+2);ctx.moveTo(x+18,y-22);ctx.lineTo(x-18,y+2);ctx.strokeStyle='#9aa3ad';ctx.stroke()}
    else if(O&&O.k==='scrigno'&&!c.open&&G.state==='play'){const f=clamp(O.left/O.all,0,1);ctx.lineWidth=5;ctx.strokeStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.arc(x,y-44,9,0,TAU);ctx.stroke();
      ctx.strokeStyle=f>.3?'#ffc93c':'#e5484d';ctx.lineWidth=3.4;ctx.beginPath();ctx.arc(x,y-44,9,-Math.PI/2,-Math.PI/2+TAU*f);ctx.stroke()}}}

// ---------------------------------------------------------------- disegni sul pavimento e in aria
function cnDrawLiquid(O){const Lq=CN_LIQ[G.chapter||1],y0=O.y,t=G.t;if(y0>BOT+30)return;ctx.save();
  ctx.beginPath();ctx.moveTo(L,BOT+6);ctx.lineTo(L,y0);for(let x=L;x<=R;x+=10)ctx.lineTo(x,y0+Math.sin(x*.05+t*2.2)*3+Math.sin(x*.13-t*1.4)*1.5);ctx.lineTo(R,BOT+6);ctx.closePath();
  const g=ctx.createLinearGradient(0,y0,0,y0+140);g.addColorStop(0,`rgba(${Lq.c},.88)`);g.addColorStop(1,Lq.c2);ctx.fillStyle=g;ctx.fill();
  ctx.strokeStyle='rgba(255,250,230,.7)';ctx.lineWidth=2.5;ctx.beginPath();for(let x=L;x<=R;x+=10){const yy=y0+Math.sin(x*.05+t*2.2)*3+Math.sin(x*.13-t*1.4)*1.5;x===L?ctx.moveTo(x,yy):ctx.lineTo(x,yy)}ctx.stroke();
  if(!LOWFX){ctx.globalCompositeOperation='lighter';glow(Lq.c,AW/2,y0,(R-L)*.55,.3,26);for(let i=0;i<7;i++){const bx=L+((i*67+t*14)%(R-L)),by=y0+18+(i*37)%Math.max(20,BOT-y0-10),r=2+(i%3)+Math.sin(t*3+i)*1;ctx.strokeStyle=`rgba(255,255,230,.35)`;ctx.lineWidth=1.4;circ(bx,by,r);ctx.stroke()}}
  ctx.restore()}
function cnDrawGround(){const O=G.cnObj;if(O&&O.k==='lava')cnDrawLiquid(O);
  for(const f of CN.fx){const a=clamp(f.t/f.max,0,1);
    if(f.k==='fire'){const fl=Math.min(1,f.t*2);if(!LOWFX)glow('255,130,50',f.x,f.y,f.r*1.7,.24*fl);ctx.fillStyle=`rgba(90,30,10,${.4*fl})`;ell(f.x,f.y,f.r,f.r*.45);ctx.fill();
      for(let i=0;i<3;i++){const ph=G.t*7+i*2.1+f.x*.1,hx=f.x+(i-1)*f.r*.45,hh=(6+3*Math.sin(ph))*fl;ctx.fillStyle=i%2?'#ffc93c':'#ff8a3c';ctx.beginPath();ctx.moveTo(hx-3.4,f.y);ctx.quadraticCurveTo(hx+Math.sin(ph)*2,f.y-hh*1.7,hx+3.4,f.y);ctx.fill()}}
    else if(f.k==='cloud'){const k=Math.min(1,f.t)*Math.min(1,(f.max-f.t)*4);ctx.fillStyle=`rgba(150,225,90,${.26*k})`;for(let i=0;i<5;i++){const a2=i*1.26+G.t*.7;ell(f.x+Math.cos(a2)*f.r*.4,f.y-6+Math.sin(a2)*f.r*.22,f.r*.55,f.r*.32);ctx.fill()}}
    else if(f.k==='snow'){const p=1-a;ctx.strokeStyle=`rgba(210,242,255,${.85*a})`;ctx.lineWidth=4;ell(f.x,f.y,f.r*p,f.r*p*.55);ctx.stroke();ctx.fillStyle=`rgba(210,242,255,${.16*a})`;ell(f.x,f.y,f.r*p,f.r*p*.55);ctx.fill()}}
  if(P.cnBrina&&G.state==='play'){ctx.strokeStyle='rgba(190,235,255,.26)';ctx.lineWidth=2;ctx.setLineDash([4,7]);ctx.lineDashOffset=-G.t*8;ell(P.x,P.y+6,95,52);ctx.stroke();ctx.setLineDash([])}}
function cnDrawAir(){for(const f of CN.fx)if(f.k==='star'){const p=1-f.t/f.max,e=f.e,x=e?e.x:f.x,y=(e?e.y-e.r:f.y)-4,sx=x+90*(1-p),sy=y-280*(1-p);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,230,140,.45)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(sx+46,sy-140);ctx.lineTo(sx,sy);ctx.stroke();glow('255,230,140',sx,sy,24,.8);ctx.restore();
  ink(2);ctx.beginPath();for(let k=0;k<10;k++){const r=k%2?3.4:8,a=k*Math.PI/5-Math.PI/2+G.t*6;ctx.lineTo(sx+Math.cos(a)*r,sy+Math.sin(a)*r)}ctx.closePath();fs('#fff1a8')}}
{const _do=drawOrbs;drawOrbs=function(){if(CN.on&&G)try{cnDrawGround()}catch(err){cnErr(err)}return _do.apply(this,arguments)}}
{const _db=drawBoulders;drawBoulders=function(){const r=_db.apply(this,arguments);if(CN.on&&G)try{cnDrawAir()}catch(err){cnErr(err)}return r}}

// ---------------------------------------------------------------- avvolgimenti dei nemici, dei danni e delle uccisioni
{const _ue=updEnemy;updEnemy=function(e,dt){if(e.type==='cntotem'){cnTotemUpd(e,dt);return}
  const O=CN.on&&G&&G.cnObj;if(O&&O.k==='proteggi'&&!O.lost&&e.cnL&&!(e.spawn>0)&&!isBoss(e.type)){const px=P.x,py=P.y;P.x=O.x;P.y=O.y;CN.swap=e;try{return _ue.apply(this,arguments)}finally{P.x=px;P.y=py;CN.swap=null}}
  return _ue.apply(this,arguments)}}
{const _de=drawEnemy;drawEnemy=function(e){if(e&&e.type==='cntotem'){try{cnDrawTotem(e)}catch(err){cnErr(err)}return}return _de.apply(this,arguments)}}
{const _sf=shadowFor;shadowFor=function(e){if(e&&e.type==='cntotem'){if(!(e.spawn>.5))shadow(e.x,e.y+4,17,6,.38);return}return _sf.apply(this,arguments)}}
{const _hp=hurtP;hurtP=function(d){if(CN.on&&G&&P){if(CN.swap){const O=G.cnObj;if(O&&!O.lost){O.hp-=Math.max(4,d*.5);O.hit=.15}return}
    if(P.cnPiuma&&!G.cnBlocked&&!(P.inv>0)&&!(P.dashT>0)&&G.state==='play'&&d>0&&!INTRO.on){G.cnBlocked=true;P.inv=.7;text(P.x,P.y-42,'Parato!','#f6ead2',15);sfx('block');return}}
  return _hp.apply(this,arguments)}}
{const _he=hurtE;hurtE=function(e,dmg,crit,dot){if(CN.on&&P&&e&&!e.dead&&!(e.intro>0)&&!e.hidden){if(P.cnEye&&!dot&&!e.cnEyed){e.cnEyed=1;dmg*=2}if(P.cnFury&&P.hp<P.maxhp/3)dmg*=1.5}return _he.call(this,e,dmg,crit,dot)}}
{const _ke=killE;killE=function(e,noLoot){const was=e.dead,burn=e.burn>0,psn=e.poisonT>0,boss=isBoss(e.type);const r=_ke.apply(this,arguments);
  try{if(CN.on&&G&&!was&&!boss){
    if(!noLoot&&P.cnCalice&&++G.cnKills%10===0){const v=Math.round(P.maxhp*.12);P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-40,'+'+v,'#e5484d',16);sfx('heal')}
    if(P.cnInferno&&burn)cnBlast(e.x,e.y,70,.6,o=>{o.burn=Math.max(o.burn||0,2.5)});else if(P.cnBomb&&!noLoot)cnBlast(e.x,e.y,52,.35);
    if(P.cnSpore&&psn)CN.fx.push({k:'cloud',x:e.x,y:e.y,t:3,max:3,r:40,tk:0});
    if(e.type==='cntotem'){sfx('crumble',0,e.x);shake(3);for(let q=0;q<14;q++)G.fx.push({k:'chunk',x:e.x,y:e.y-22,vx:rand(-130,130),vy:rand(-170,30),t:rand(.3,.6),r:rand(2,4),col:'#8f6c48'})}}}catch(err){cnErr(err)}
  return r}}

// ---------------------------------------------------------------- la partita: sequenza, stanze, passi
{const _nr=newRun;newRun=function(){if(CN.on&&CN.next==='tower'){const s=SAVE.sel;SAVE.sel='inf';try{return _nr.apply(this,arguments)}finally{SAVE.sel=s}}return _nr.apply(this,arguments)}}
function cnRushSet(i){const a=G.rush.list[i];G.arena=a;G.chapter=ARENAS[a].ch;G.diff=ARENAS[a].diff;G.bossLvl=null;G.room=ROOMS;G.event=null}
const cnRushList=()=>ARENAS.map((_,i)=>i).filter(i=>cnS().all||cnBits(i)&1);
{const _ms=makeSeqFor;makeSeqFor=function(){const nx=CN.next;CN.next=null;if(!CN.on||!G)return _ms.apply(this,arguments);
  try{G.cnA=null;G.tower=null;G.rush=null;G.relics=[];G.cnKills=0;CN.fx=[];CN.last=null;
    if(nx==='tower'&&G.mode==='inf'){CN.last='tower';G.tower={wk:cnWeek(),mods:cnTowerMods()};for(const m of G.tower.mods)m.f();const s=_ms.apply(this,arguments),k=s.findIndex(q=>q.c===20);return s.slice(0,k+1)}
    if(nx==='rush'){const list=cnRushList();if(list.length){CN.last='rush';G.rush={list,i:0,beat:0};cnRushSet(0);return[{c:ROOMS}]}}
    if(G.mode==='camp'&&!G.daily){const a=cnPick();G.cnA=a;G.arena=a;G.chapter=ARENAS[a].ch;G.diff=ARENAS[a].diff;G.bossLvl=null;G.cnRoute={det:0,lastEv:null,lastObj:null,path:[]};
      return Array.from({length:ROOMS},(_,k)=>({c:k+1}))}}catch(err){cnErr(err)}
  return _ms.apply(this,arguments)}}
{const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{if(CN.on&&G)cnRoomSetup()}catch(err){cnErr(err)}return r}}
function cnRoomSetup(){G.cnObj=null;G.cnBlocked=false;G.cnRT=0;CN.pool=null;cnHud('');const v=G.cnVar,ok=G.cnObjK;G.cnVar=null;G.cnObjK=null;
  if(G.tower&&!G.event&&!isBossRoom(G.room))banner('Torre · Piano '+G.room,G.tower.mods.map(m=>m.n).join(' · '),2.2);
  if(G.rush&&!G.event)$('banner').querySelector('small')&&($('banner').querySelector('small').textContent=`Corsa dei boss · ${G.rush.i+1} di ${G.rush.list.length}`);
  if(G.event||!v)return;
  if(v==='elite'){let n=0;for(const e of G.enemies)if(!isBoss(e.type)&&!e.elite&&n<2){e.elite=true;e.hp*=2.6;e.max=e.hp;e.r=Math.round(e.r*1.2);e.gold*=3;e.cdmg=Math.round(e.cdmg*1.3);n++}
    G.cnRelic=true;banner('Stanza '+G.room+' · Élite','Premio: una reliquia',2.4)}
  if(v==='obj'&&ok)cnObjStart(ok)}
{const _rc=onRoomClear;onRoomClear=function(){const r=_rc.apply(this,arguments);try{if(CN.on&&G){
    if(G.cnObj&&G.cnObj.k==='totem')G.cnObj.win=true;   // la stanza si chiude quando tutti, totem compresi, sono caduti
    if(G.cnObj&&G.cnObj.win&&!G.cnObj.paid){G.cnObj.paid=true;cnObjReward()}
    if(G.cnRelic){G.cnRelic=false;cnLater(cnRelicOffer,900)}
    if(G.tower&&!G.event&&isBossRoom(G.room)&&G.room<20)cnLater(cnRelicOffer,1400)}}catch(err){cnErr(err)}return r}}
{const _ns=nextStep;nextStep=function(){if(!CN.on||!G)return _ns.apply(this,arguments);
  try{if(G.rush){cnRushSet(G.rush.i);P.queue=[];buildRoom();return}
    if(G.tower&&!G.seq[G.si+1]){endRun(true);return}
    if(G.cnA!=null){const o=cnRouteOpts();if(o&&o.length>1){cnRouteShow(o);return}if(o&&o.length===1){cnRouteApply(o[0]);return}}}catch(err){cnErr(err)}
  return _ns.apply(this,arguments)}}
{const _up=update;update=function(dt){if(!CN.on||!G||!P)return _up.apply(this,arguments);const u0=P.ult||0;
  try{cnPre()}catch(err){cnErr(err)}const r=_up.apply(this,arguments);try{cnPost(dt,u0)}catch(err){cnErr(err)}return r}}
// «Resisti»: finché il tempo non finisce c'è sempre qualcuno che sta arrivando, così la stanza non si chiude prima
function cnPre(){const O=G.cnObj;if(O&&O.k==='resisti'&&!O.done&&G.state==='play'&&!G.enemies.some(e=>e.spawn>0)&&G.enemies.filter(e=>!e.dead).length<=3)cnSpawn(2)}
function cnPost(dt,u0){if(G.state==='trans'||G.state==='dead')return;cnObjTick(dt);
  const dash=P.dashT>0;if(dash&&!CN.dash&&P.cnStat)cnStatic();CN.dash=dash;
  if(dash&&P.cnBraci){CN.braT=(CN.braT||0)-dt;if(CN.braT<=0){CN.braT=.045;CN.fx.push({k:'fire',x:P.x,y:P.y+4,t:2.2,max:2.2,r:15,tk:0})}}
  if(P.cnBrina)for(const e of G.enemies)if(!e.dead&&Math.hypot(e.x-P.x,e.y-P.y)<95)e.slow=Math.max(e.slow||0,.25);
  if(P.cnBufera){CN.bufT=(CN.bufT==null?3:CN.bufT)-dt;if(CN.bufT<=0&&G.state==='play'&&G.enemies.some(e=>canHit(e))){CN.bufT=6;cnBlizzard()}}
  if(P.cnPeste){CN.pesT=(CN.pesT||0)-dt;if(CN.pesT<=0){CN.pesT=.8;for(const e of G.enemies){if(e.dead||!(e.poisonT>0))continue;let b=null,bd=85;
    for(const o of G.enemies){if(o===e||o.dead||o.poisonT>0||!canHit(o))continue;const d=Math.hypot(o.x-e.x,o.y-e.y);if(d<bd){bd=d;b=o}}if(b){b.poisonS=Math.max(1,b.poisonS||0);b.poisonT=3;G.fx.push({k:'spark',x:b.x,y:b.y-b.r,t:.25})}}}}
  if(P.cnMag)for(const c of G.coins){if(!(c.t>.35))continue;const dx=P.x-c.x,dy=P.y-c.y,d=Math.hypot(dx,dy);if(d>6&&d<260){const s=Math.min(d,(240+c.t*220)*dt);c.x+=dx/d*s;c.y+=dy/d*s;c.vx*=.8;c.vy*=.8}}
  if(P.cnFury){const low=P.hp<P.maxhp/3;if(low!==!!P.cnFuryOn){P.cnFuryOn=low;P.spd=(P.spd||150)*(low?1.2:1/1.2);if(low){text(P.x,P.y-46,'Furia!','#e5484d',15);sfx('roar')}}}
  if(P.cnUlt&&P.ult>u0&&u0<100){const was=P.ult>=100;P.ult=Math.min(100,P.ult+(P.ult-u0));if(!was&&P.ult>=100){sfx('shimmer',2);$('ultBtn').classList.add('full')}}
  if(P.cnStar&&G.state==='play'){CN.starT=(CN.starT==null?4:CN.starT)-dt;if(CN.starT<=0){const e=nearest(P.x,P.y);if(e){CN.starT=8;CN.fx.push({k:'star',x:e.x,y:e.y,t:.55,max:.55,e})}else CN.starT=1}}
  if(G.cnNoHeart)G.hearts.length=0;
  if(G.cnClock&&G.state==='play'&&!G.event){G.cnRT+=dt;const left=G.cnClock-G.cnRT;if(left<=0){G.cnCT=(G.cnCT||0)-dt;if(G.cnCT<=0){G.cnCT=2;hurtP(Math.round(P.maxhp*.05))}}
    if(!G.cnObj)cnHud(left>0?`<b>Tempo</b>${Math.ceil(left)}`:'<b>Tempo scaduto!</b>')}else if(G.cnClock&&!G.cnObj)cnHud('');
  for(const f of CN.fx){f.t-=dt;
    if((f.k==='fire'||f.k==='cloud')&&(f.tk-=dt)<=0){f.tk=.4;for(const e of G.enemies){if(!canHit(e)||Math.hypot(e.x-f.x,(e.y-f.y)*1.4)>f.r+e.r*.6)continue;
      if(f.k==='fire'){e.burn=Math.max(e.burn||0,1.6);if(!(e.burnTick>0))e.burnTick=.2}else{e.poisonS=Math.min(4,(e.poisonS||0)+1);e.poisonT=3}}}
    if(f.k==='star'&&f.t<=0&&!f.hit){f.hit=1;const e=f.e;if(e&&!e.dead){fxPush({k:'flash',x:e.x,y:e.y-e.r,rgb:'255,230,140',r:46,t:.2,max:.2});hurtE(e,P.atk*1.6,true);for(const o of G.enemies)if(o!==e&&canHit(o)&&Math.hypot(o.x-e.x,o.y-e.y)<46)hurtE(o,P.atk*.5,false,true);sfx('magic',0,e.x)}}}
  CN.fx=CN.fx.filter(f=>f.t>0)}

// ---------------------------------------------------------------- 1 bivi tra le stanze
function cnObjPick(){const R=G.cnRoute,ks=Object.keys(CN_OBJ).filter(k=>k!==R.lastObj);return pk(ks)}
function cnRouteOpts(){const R=G.cnRoute;if(!R)return null;const fromEv=!!G.event,next=G.room+1;if(!fromEv&&G.room>=ROOMS)return null;
  if(next>=ROOMS){const o=[{k:'boss',room:ROOMS}];if(!fromEv&&R.lastEv!=='fontana')o.push({k:'ev',ev:'fontana'});return o}
  const o=[{k:'normal',room:next,champ:next===5}],okObj=next!==G.ccRoom;
  if(next===5){if(okObj)o.push({k:'obj',room:next,obj:cnObjPick()})}
  else o.push(okObj&&Math.random()<.55?{k:'obj',room:next,obj:cnObjPick()}:{k:'elite',room:next});
  if(!fromEv&&next>=3&&R.det<4&&Math.random()<.8){const evs=Object.keys(EVENTS).filter(k=>k!==R.lastEv&&(k!=='sfida'||next>=4));if(evs.length)o.push({k:'ev',ev:pk(evs)})}
  return o}
function cnRouteApply(o){G.si++;if(P.roomHeal&&!G.event)P.hp=Math.min(P.maxhp,P.hp+Math.round(P.maxhp*P.roomHeal));const R=G.cnRoute;
  if(o.k==='ev'){R.det++;R.lastEv=o.ev;G.event=o.ev;R.path.push({r:G.room,k:'ev',ev:o.ev})}
  else{G.event=null;G.room=o.room;G.cnVar=o.k==='obj'||o.k==='elite'?o.k:null;G.cnObjK=o.obj||null;if(o.obj)R.lastObj=o.obj;R.path.push({r:o.room,k:o.k})}
  buildRoom()}
function cnCard(o){
  if(o.k==='normal')return o.champ?{c:'#ffc93c',i:'skull',n:'Campioni',d:'Due élite ti sbarrano la strada',r:'Premio: tante monete'}:{c:'#c9cfd6',i:'sword',n:'Battaglia',d:'Una stanza come sempre',r:'Premio: monete ed esperienza'};
  if(o.k==='elite')return{c:'#ff6a5a',i:'skull',n:'Élite',d:'Due nemici élite, più forti e più ricchi',r:'Premio: una reliquia'};
  if(o.k==='obj')return{c:'#ffc93c',i:CN_OBJ[o.obj].ic,n:cnObjName(o.obj),d:CN_OBJ[o.obj].d,r:"Premio: un'abilità in più"};
  if(o.k==='boss'){const t=cnBoss(G.arena||0);return{c:'#e5484d',i:'crown',n:ET[t].name,d:"Il custode dell'arena",r:'Premio: la vittoria'}}
  const E=EVENTS[o.ev]||{n:o.ev,sub:''};return{c:CN_EVC[o.ev]||'#7fd3f0',i:CN_EVI[o.ev]||'drop',n:E.n,d:E.sub,r:'Una sosta, poi la strada continua'}}
function cnTrack(){const R=G.cnRoute,done=G.room;let h='';for(let r=1;r<=ROOMS;r++){const p=R.path.find(q=>q.r===r&&q.k!=='ev'),ev=R.path.some(q=>q.k==='ev'&&q.r===r);
  h+=(r>1?`<i class="cnl ${r<=done?'on':''}"></i>`:'')+`<span class="cnd ${r<=done?'on':''} ${r===done+1?'nx':''} ${r===ROOMS?'boss':''} k-${p?p.k:''}"></span>`+(ev?'<b class="cnev"></b>':'')}return h}
function cnRouteShow(opts){cnEnsure();const A=ARENAS[G.arena||0];
  $('cnRouteIn').innerHTML=`<span class="tag">Arena ${(G.arena||0)+1} · ${A.n}</span><h2>Scegli la strada</h2><div class="cnTrack">${cnTrack()}</div>
    <div class="cnDoors">${opts.map((o,k)=>{const c=cnCard(o);return`<button class="cnDoor" data-k="${k}" style="--dc:${c.c};animation-delay:${k*.1}s"><span class="cnArch">${cnIco(c.i)}</span><b>${c.n}</b><span>${c.d}</span><em>${c.r}</em></button>`}).join('')}</div>
    ${(G.relics||[]).length?`<div class="cnRelRow"><small>Le tue reliquie</small>${G.relics.map(id=>`<i title="${CN_RB[id].n}">${cnRelIco(id)}</i>`).join('')}</div>`:''}`;
  $('cnRouteIn').querySelectorAll('.cnDoor').forEach(b=>b.onclick=()=>{if($('cnRoute').hidden)return;const o=opts[+b.dataset.k];$('cnRoute').hidden=true;sfx('door');
    try{cnRouteApply(o)}catch(err){cnErr(err)}G.prevState=G.state;G.state='trans';G.fadeDir=-1;G.fadeHold=3;G.fade=1;modal=false;paused=false});
  modal=true;paused=true;$('cnRoute').hidden=false;sfx('pick')}

// ---------------------------------------------------------------- 7 Torre della settimana
const CN_TMODS=CHAL_MODS.concat([
  {id:'sangue',n:'Sete di sangue',d:'Ogni nemico sconfitto ti cura un poco',good:1,f:()=>{P.vamp=(P.vamp||0)+1.5}},
  {id:'nocure',n:'Niente cuori',d:'I nemici non lasciano cuori',f:()=>{G.cnNoHeart=true}},
  {id:'tempo',n:'Contro il tempo',d:'Dopo 40 secondi su un piano perdi salute',f:()=>{G.cnClock=40}}]);
function cnTowerMods(){const r=cnRng('mods'),g=CN_TMODS.filter(m=>m.good),b=CN_TMODS.filter(m=>!m.good),out=[g[Math.floor(r()*g.length)]];for(let k=0;k<2;k++)out.push(b.splice(Math.floor(r()*b.length),1)[0]);return out}
function cnTowerBoard(){const r=cnRng('board'),names=RIVALS.slice(),L=[];for(let i=0;i<9;i++){const j=Math.floor(r()*names.length);L.push({n:names.splice(j,1)[0],s:Math.max(2,Math.round(3+r()*r()*17))})}
  const T=cnS().tower;if(T.wk===cnWeek()&&T.best)L.push({n:SAVE.pname||'Tu',s:T.best,me:1});L.sort((a,b)=>b.s-a.s||(a.me?-1:1));return L}

// ---------------------------------------------------------------- 8 Corsa dei boss
function cnRushNext(){const R=G.rush;R.beat++;R.i++;const nxt=cnBoss(R.list[R.i]),v=Math.round(P.maxhp*.35);P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-40,'+'+v,'#7bbf4a',16);
  banner('Custode sconfitto!',`Prossimo: ${ET[nxt].name} (${R.i+1} di ${R.list.length})`,2.4);G.door=true;sfx('door');if(!$('bossBar').classList.contains('dying'))$('bossBar').hidden=true;
  cnLater(()=>{openSkills('treasure');$('skTag').textContent='Corsa dei boss'},1000)}

// ---------------------------------------------------------------- la fine della partita: stelle, bracieri, record
{const _er=endRun;endRun=function(win,quit){if(!CN.on||!G||G.ended)return _er.apply(this,arguments);
  if(G.rush&&win&&!quit&&G.rush.i<G.rush.list.length-1){try{cnRushNext();return}catch(err){cnErr(err)}}
  const S=cnS(),keep=['trophies','trBest','arenaUp','inf','best','best2','best3','best4','bestA','done'],snap=JSON.stringify(Object.fromEntries(keep.filter(k=>k in SAVE).map(k=>[k,SAVE[k]])));
  const T0=SAVE.trophies||0,mode=G.rush?'rush':G.tower?'tower':G.cnA!=null?'arena':null,a=G.cnA,tot0=cnTot(),hpK=P.hp/Math.max(1,P.maxhp),time=G.t;
  if(mode==='rush'&&win)G.rush.beat++;
  const r=_er.apply(this,arguments);
  try{cnHud('');CN.next=CN.last;
    if(mode==='rush'||mode==='tower'){const o=JSON.parse(snap);for(const k of keep)if(k in o)SAVE[k]=o[k];else delete SAVE[k]}
    if(mode==='arena'){if((SAVE.trophies||0)<T0)SAVE.trophies=T0;
      const bits=(win?1:0)|(win&&hpK>=.5?2:0)|(win&&time<=CN_T3?4:0),old=S.stars[a]||0,nw=bits&~old;S.stars[a]=old|bits;if(win&&!(old&1)&&ARENAS[a+1])S.pick=a+1;   // la prima vittoria apre e propone l'arena dopo
      const tot1=cnTot(),rew=Math.floor(tot1/CN_REW)-Math.floor(tot0/CN_REW);let rewH='';if(rew>0){SAVE.gold+=300*rew;SAVE.gems=(SAVE.gems||0)+10*rew;rewH=`<div class="cnRewL">Premio della fiamma: +${300*rew} oro e +${10*rew} cristalli</div>`}
      $('eTr').innerHTML=`<div class="cnEnd">${[0,1,2].map(k=>`<span class="s ${bits>>k&1?'on':''} ${nw>>k&1?'new':''}" style="--d:${.25+k*.28}s">${CN_STAR}</span>`).join('')}</div>
        <ul class="cnEndG">${CN_GOALS.map((g,k)=>`<li class="${bits>>k&1?'ok':''}">${g}</li>`).join('')}</ul><div class="trline">${tot1} stelle su ${ARENAS.length*3} · ${cnMS(time)}</div>
        ${win&&!(old&1)?`<div class="cnLitL">${CN_BRAZ}Hai riacceso il braciere di ${ARENAS[a].n}!</div>`:''}${rewH}`}
    if(mode==='tower'){const wk=cnWeek(),fl=win?20:G.room;if(S.tower.wk!==wk)S.tower={wk,best:0};const rec=fl>(S.tower.best||0)&&!quit;if(rec)S.tower.best=fl;const pos=cnTowerBoard().findIndex(q=>q.me)+1;
      $('endTag').textContent='Torre della settimana';$('endTitle').textContent=win?'TORRE CONQUISTATA':quit?'RITIRATA':rec?'NUOVO RECORD':'SEI CADUTO';
      $('endText').textContent=win?'Hai salito tutti i venti piani della Torre!':`Sei arrivato al piano ${fl} di 20.`;$('eRoom').textContent=fl;
      $('eTr').innerHTML=`<div class="trline">${pos?`${pos}° nella classifica della settimana · `:''}record: piano ${S.tower.best||0}</div>`}
    if(mode==='rush'){const R=S.rush,n=G.rush.beat,all=win&&n>=G.rush.list.length,tm=G.t;if(n>(R.best||0))R.best=n;if(all&&G.rush.list.length>=ARENAS.length&&(!R.time||tm<R.time))R.time=tm;
      $('endTag').textContent='Corsa dei boss';$('endTitle').textContent=all?'VITTORIA':quit?'RITIRATA':'SEI CADUTO';
      $('endText').textContent=all?`Hai battuto tutti i ${n} custodi in ${cnMS(tm)}.`:`Hai battuto ${n} ${n===1?'custode':'custodi'} su ${G.rush.list.length}.`;$('eRoom').textContent=n;
      $('eTr').innerHTML=`<div class="trline">Record: ${R.best||0} di fila${R.time?' · tutti e 12 in '+cnMS(R.time):''}</div>`}
    save()}catch(err){cnErr(err)}
  return r}}
$('againBtn').onclick=()=>{if(CN.on)CN.next=CN.last;startRun()};
{const _sm=showMenu;showMenu=function(){CN.next=null;return _sm.apply(this,arguments)}}

// ---------------------------------------------------------------- 5 la mappa del mondo · 6 i bracieri della fiamma
{const _rc=renderChap;renderChap=function(){if(!CN.on||zMode())return _rc.apply(this,arguments);try{cnChap()}catch(err){cnErr(err);_rc.apply(this,arguments)}}}
$('chapCard').onclick=()=>{sfx('ui');if(zMode())openSheet('zombie');else if(CN.on)cnMapOpen();else setTab('tabRoad')};
function cnChap(){const i=cnPick(),A=ARENAS[i],b=bestRoom(i),n=cnStarN(i),tot=cnTot(),lit=cnLit();let tr='';
  for(let r=1;r<=ROOMS;r++){const boss=r===ROOMS;tr+=(r>1?`<i class="rl ${r<=b?'on':''}"></i>`:'')+`<span class="rn ${boss?'boss':''} ${r<=b?'on':''} ${r===b+1?'next':''}">${boss?SKULL_SVG(true):''}</span>`}
  const html=`<div><span class="ck">Arena ${i+1} <i class="cnCkS">${[0,1,2].map(k=>`<b class="${k<n?'on':''}">${CN_STAR}</b>`).join('')}</i></span><h3>${A.n}</h3></div><div class="ctr"><span class="trNow cnTr">${CN_STAR}${tot}/${ARENAS.length*3}</span><div class="trBar"><i style="width:${lit/ARENAS.length*100}%"></i><span>Bracieri accesi: ${lit} su ${ARENAS.length}</span></div></div><div class="rtrack">${tr}<em>Mappa ›</em></div>`;
  const el=$('chapCard');if(el._h!==html){el.innerHTML=html+'<i class="candle l"></i><i class="candle r"></i>';el._h=html;el.style.setProperty('--ac',A.col);el.style.setProperty('--thumb',`url(${arenaThumb(i)})`)}}
const cnStarsH=i=>{const n=cnStarN(i);return[0,1,2].map(k=>`<b class="${k<n?'on':''}">${CN_STAR}</b>`).join('')};
function cnMapOpen(){cnEnsure();CN.sel=cnPick();CN.sub=null;cnMapRender();$('cnMap').hidden=false;const sc=$('cnMapIn').querySelector('.cnPath'),n=$('cnMapIn').querySelector('.cnN.sel');if(sc&&n)sc.scrollTop=n.offsetTop-sc.clientHeight/2+40}
function cnMapClose(){$('cnMap').hidden=true;renderChap()}
function cnMapRender(){const el=$('cnMapIn'),S=cnS();if(CN.sub==='tower')return cnTowerRender(el);if(CN.sub==='rush')return cnRushRender(el);if(CN.sub==='rel')return cnRelRender(el);
  const N=ARENAS.length,tot=cnTot(),lit=cnLit(),nextAt=(Math.floor(tot/CN_REW)+1)*CN_REW,H=N*100+46,cur=cnPick(),sc=el.querySelector('.cnPath'),top=sc?sc.scrollTop:null;
  let fire='';for(let i=0;i<N;i++)fire+=`<i class="cnBr ${cnBits(i)&1?'on':''}" style="--ac:${ARENAS[i].col}">${CN_BRAZ}</i>`;
  const pts=[];let nodes='';for(let i=0;i<N;i++){const y=H-58-i*100,x=50+Math.sin(i*1.3)*27;pts.push([x,y]);const op=cnOpen(i);
    nodes+=`<button class="cnN ${op?'':'lock'} ${CN.sel===i?'sel':''} ${i===cur?'cur':''} ${x<50?'l':'r'}" data-a="${i}" style="left:${x}%;top:${y}px;--ac:${ARENAS[i].col}"><span class="cnPic"><img src="${arenaThumb(i)}" alt="">${op?'':`<b class="cnLk">${CN_LOCK}</b>`}<em>${i+1}</em></span><span class="cnNm">${ARENAS[i].n}<i class="cnSt">${cnStarsH(i)}</i></span></button>`}
  let seg='';for(let i=1;i<N;i++){const[a,b]=[pts[i-1],pts[i]];seg+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${cnOpen(i)?'on':''}"/>`}
  const a=CN.sel,A=ARENAS[a],b=cnBits(a),op=cnOpen(a),bt=cnBoss(a),found=CN_REL.filter(r=>S.relics[r.id]).length,RL=cnRushList().length,T=S.tower;
  el.innerHTML=`<header class="cnHd"><button class="cnX" aria-label="Chiudi">‹</button><h2>Mappa del mondo</h2><span class="cnTot">${CN_STAR}${tot}<small>/${N*3}</small></span></header>
    <div class="cnFire"><div class="cnBrs">${fire}</div><div class="cnFl"><span>La fiamma · ${lit} bracieri accesi su ${N}</span><span class="cnRw"><i style="width:${(tot%CN_REW)/CN_REW*100}%"></i><b>Premio a ${nextAt}${CN_STAR}</b></span></div></div>
    <div class="cnPath"><div class="cnPin" style="height:${H}px"><svg class="cnLine" viewBox="0 0 100 ${H}" preserveAspectRatio="none">${seg}</svg>${nodes}</div></div>
    <div class="cnSel" style="--ac:${A.col}"><div class="cnSh"><img src="${arenaThumb(a)}" alt=""><div><span class="ck">Arena ${a+1}</span><h3>${A.n}</h3><small>Custode: ${ET[bt].name}</small></div></div>
      <ul class="cnGoals">${CN_GOALS.map((g,k)=>`<li class="${b>>k&1?'ok':''}">${CN_STAR}<span>${g}</span></li>`).join('')}</ul>
      ${op?`<button class="btn cnPlay">Gioca</button>`:`<p class="cnLockP">${CN_LOCK} Vinci «${ARENAS[a-1].n}» per aprirla</p>`}</div>
    <div class="cnModes"><button class="cnMode" data-sub="tower" style="--mc:#c48ae8">${cnIco('totem')}<b>Torre</b><small>${T.wk===cnWeek()&&T.best?'Piano '+T.best:'Della settimana'}</small></button>
      <button class="cnMode" data-sub="rush" style="--mc:#e5484d">${cnIco('crown')}<b>Corsa dei boss</b><small>${RL?RL+' custodi':'Chiusa'}</small></button>
      <button class="cnMode" data-sub="rel" style="--mc:#ffc93c">${cnRelIco('stella')}<b>Reliquie</b><small>${found} di ${CN_REL.length}</small></button></div>
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
  el.innerHTML=cnSubHead('Reliquie')+`<div class="cnSub"><p class="cnLead">Si trovano scegliendo le stanze élite e sui piani dei custodi della Torre. Ognuna cambia le regole fino alla fine della partita.</p>
    <div class="cnRelG">${CN_REL.map(r=>S.relics[r.id]?`<div class="cnRelB" style="--rc:${r.c}"><span class="cnRelI">${cnRelIco(r.id)}</span><b>${r.n}</b><span>${r.d}</span><small>Trovata ${S.relics[r.id]} ${S.relics[r.id]===1?'volta':'volte'}</small></div>`
      :`<div class="cnRelB no"><span class="cnRelI">?</span><b>???</b><span>Ancora da trovare</span></div>`).join('')}</div></div>`;cnSubWire(el)}

// ---------------------------------------------------------------- schermate e stile
function cnEnsure(){if($('cnMap'))return;const w=$('wrap'),mk=(id,inner)=>{const d=document.createElement('div');d.className='screen cnScr';d.id=id;d.hidden=true;d.innerHTML=`<div class="${inner}" id="${id}In"></div>`;w.appendChild(d);return d};
  mk('cnRoute','cnRouteBox');mk('cnRel','cnRelBox');mk('cnMap','cnMapBox');
  const st=document.createElement('style');st.textContent=CN_CSS;document.head.appendChild(st)}
const CN_CSS=`
#cnHud{position:absolute;left:50%;top:calc(104px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:6;pointer-events:none;font-family:var(--display);font-size:17px;color:#fff;text-shadow:var(--tol);
  background:rgba(20,14,10,.66);border:2px solid #191714;border-radius:14px;padding:3px 12px 4px;white-space:nowrap;display:flex;gap:8px;align-items:baseline}
#cnHud b{color:var(--gold);font-weight:400}#cnHud[hidden]{display:none}
.cnScr{z-index:40}.cnScr .tag{text-align:center}
.cnRouteBox,.cnRelBox{width:100%;max-width:440px;display:flex;flex-direction:column;align-items:center;gap:12px;color:#fff;text-align:center}
.cnRouteBox h2,.cnRelBox h2{font-family:var(--display);font-weight:400;font-size:30px;margin:0;color:#fff;text-shadow:var(--tol)}
.cnRelBox .hint{margin:0;color:#dbd0b0;font-size:14px;max-width:340px}
.cnTrack{display:flex;align-items:center;justify-content:center;padding:8px 10px;background:rgba(0,0,0,.4);border:2px solid #191714;border-radius:14px;max-width:100%}
.cnd{width:13px;height:13px;border-radius:50%;background:#3b332b;border:2px solid #191714;flex:0 0 auto}.cnd.on{background:#b8a990}.cnd.on.k-elite{background:#ff6a5a}.cnd.on.k-obj{background:#ffc93c}
.cnd.nx{background:#fff;box-shadow:0 0 0 3px rgba(255,201,60,.5),0 0 12px #ffc93c;animation:cnPulse 1s ease-in-out infinite alternate}.cnd.boss{width:18px;height:18px;background:#7a2a24}.cnd.boss.nx{background:#e5484d}
.cnl{width:10px;height:3px;background:#3b332b;flex:0 0 auto}.cnl.on{background:#b8a990}.cnev{width:8px;height:8px;transform:rotate(45deg);background:#7fd3f0;border:1.5px solid #191714;margin:0 -1px;flex:0 0 auto}
.cnDoors{display:flex;gap:9px;width:100%;justify-content:center;align-items:stretch}
.cnDoor{flex:1 1 0;max-width:146px;min-width:0;display:flex;flex-direction:column;align-items:center;gap:5px;padding:0 7px 12px;border:3px solid #191714;border-radius:64px 64px 14px 14px;
  background:linear-gradient(180deg,#5b4f42,#3b332b 45%,#211b17);box-shadow:0 5px 0 #191714,inset 0 0 0 2px rgba(255,240,210,.07);color:#fff;cursor:pointer;font-family:var(--body);animation:cnIn .42s cubic-bezier(.2,1.4,.4,1) both}
.cnArch{width:100%;aspect-ratio:1/1.08;border-radius:58px 58px 6px 6px;margin-top:7px;background:radial-gradient(62% 56% at 50% 62%,var(--dc),transparent 74%),#120e0b;display:flex;align-items:center;justify-content:center;
  box-shadow:inset 0 -12px 18px rgba(0,0,0,.65),inset 0 0 0 2px #191714;overflow:hidden}
.cnArch svg{width:56%;height:56%;filter:drop-shadow(0 3px 0 rgba(0,0,0,.55));animation:cnBob 2.4s ease-in-out infinite}
.cnDoor b{font-family:var(--display);font-size:17px;font-weight:400;text-shadow:var(--tol);line-height:1.05}
.cnDoor>span:not(.cnArch){font-size:12.5px;line-height:1.18;color:#e6dcc0;flex:1}.cnDoor em{font-style:normal;font-size:12.5px;font-weight:800;color:var(--dc);line-height:1.12;text-shadow:0 1px 0 #191714}
.cnDoor:active{transform:translateY(3px);box-shadow:0 2px 0 #191714}
.cnRelRow{display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap}.cnRelRow small{width:100%;color:#b8a990;font-size:12px}.cnRelRow i{width:32px;height:32px;display:block;background:rgba(0,0,0,.35);border:2px solid #191714;border-radius:9px;padding:2px}
.cnRels{display:flex;gap:12px;width:100%;justify-content:center}

.cnRelC,.cnRelB{background:linear-gradient(#3b332b,#211b17)}.cnRelI{background:#120e0b}.cnMode{background:linear-gradient(#4d4237,#211b17)}.cnBig{background:#120e0b}.cnRush li.ok{background:#2e2620}
.cnRelC,.cnRelB{position:relative;flex:1 1 0;max-width:190px;min-width:0;display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 10px 14px;border:3px solid #191714;border-radius:18px;
  background:radial-gradient(90% 60% at 50% 18%,color-mix(in srgb,var(--rc) 28%,transparent),transparent 70%),linear-gradient(#3b332b,#211b17);box-shadow:0 5px 0 #191714;color:#fff;font-family:var(--body);cursor:pointer;animation:cnIn .42s cubic-bezier(.2,1.4,.4,1) both}
.cnRelI{width:64px;height:64px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--rc) 45%,#120e0b),#120e0b 72%);border:3px solid #191714;box-shadow:0 0 18px color-mix(in srgb,var(--rc) 55%,transparent)}
.cnRelI svg{width:44px;height:44px}.cnRelC b,.cnRelB b{font-family:var(--display);font-weight:400;font-size:17px;text-shadow:var(--tol);line-height:1.1}.cnRelC>span:not(.cnRelI),.cnRelB>span:not(.cnRelI){font-size:13px;line-height:1.2;color:#e6dcc0}
.cnNew{position:absolute;top:-10px;right:-6px;font-style:normal;font-family:var(--display);font-size:13px;color:#191714;background:var(--gold);border:2px solid #191714;border-radius:9px;padding:1px 7px;transform:rotate(6deg)}
.cnMapBox{position:absolute;inset:0;display:flex;flex-direction:column;gap:8px;padding:8px 14px 10px;color:#fff;font-family:var(--body);overflow:hidden;
  background:radial-gradient(120% 60% at 50% 0%,#2b2f3d,transparent 60%),radial-gradient(100% 50% at 50% 100%,#2a1f18,transparent 70%),#141015}
.cnHd{display:flex;align-items:center;gap:10px;flex:0 0 auto}.cnHd h2{flex:1;margin:0;font-family:var(--display);font-weight:400;font-size:24px;text-shadow:var(--tol);text-align:center}
.cnX{width:40px;height:40px;border-radius:12px;border:3px solid #191714;background:#4d4237;color:#fff;font-family:var(--display);font-size:26px;line-height:1;box-shadow:0 3px 0 #191714;cursor:pointer}
.cnTot{min-width:40px;display:flex;align-items:center;gap:3px;font-family:var(--display);font-size:20px;color:var(--gold);text-shadow:var(--tol)}.cnTot svg{width:22px;height:22px;color:var(--gold)}.cnTot small{font-size:13px;color:#dbd0b0}
.cnFire{flex:0 0 auto;background:rgba(0,0,0,.35);border:2px solid #191714;border-radius:14px;padding:6px 8px}
.cnBrs{display:flex;justify-content:space-between}.cnBr{width:22px;height:29px;display:block}.cnBr svg{width:100%;height:100%;overflow:visible}.cnBr .fl{fill:#2a231d;stroke:#191714;stroke-width:1.5}
.cnBr.on .fl{fill:var(--ac);filter:drop-shadow(0 0 4px var(--ac));animation:cnFlick 1.3s ease-in-out infinite alternate;transform-origin:50% 90%}
.cnFl{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:3px;font-size:12.5px;color:#dbd0b0}
.cnRw{position:relative;flex:0 0 120px;height:18px;border:2px solid #191714;border-radius:9px;background:#211b17;overflow:hidden;display:flex;align-items:center;justify-content:center}
.cnRw i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(#ffd84a,#e0a020)}.cnRw b{position:relative;font-weight:800;font-size:11.5px;color:#fff;text-shadow:var(--tol);display:flex;align-items:center;gap:2px}.cnRw svg{width:12px;height:12px;color:var(--gold)}
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
.cnSt,.cnCkS{display:inline-flex;gap:1px}.cnSt b,.cnCkS b{width:15px;height:15px;color:#3b332b}.cnSt b.on,.cnCkS b.on{color:var(--gold)}.cnSt svg,.cnCkS svg{width:100%;height:100%;display:block}.cnCkS{vertical-align:-2px;margin-left:4px}
.cnSel{flex:0 0 auto;display:flex;flex-direction:column;gap:6px;padding:9px 10px;border:3px solid #191714;border-radius:16px;background:linear-gradient(#3b332b,#211b17);box-shadow:0 4px 0 #191714,inset 0 0 0 2px color-mix(in srgb,var(--ac) 35%,transparent)}
.cnSh{display:flex;gap:10px;align-items:center}.cnSh img{width:74px;height:44px;object-fit:cover;border-radius:9px;border:2px solid #191714}.cnSh .ck{font-size:12px;color:var(--ac);font-weight:800;letter-spacing:.05em;text-transform:uppercase}
.cnSh h3{margin:0;font-family:var(--display);font-weight:400;font-size:19px;line-height:1.05;text-shadow:var(--tol)}.cnSh small{color:#dbd0b0;font-size:12.5px}
.cnGoals{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}.cnGoals li{display:flex;align-items:center;gap:6px;font-size:13px;color:#b8a990}.cnGoals svg{width:16px;height:16px;color:#3b332b;flex:0 0 auto}
.cnGoals li.ok{color:#fff}.cnGoals li.ok svg{color:var(--gold)}.cnPlay{font-size:20px;padding:8px 14px}
.cnLockP{margin:0;display:flex;align-items:center;justify-content:center;gap:6px;color:#dbd0b0;font-size:13.5px;text-align:center}.cnLockP svg{width:20px;height:20px;flex:0 0 auto}
.cnModes{flex:0 0 auto;display:flex;gap:8px}.cnMode{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 4px 7px;border:3px solid #191714;border-radius:14px;
  background:linear-gradient(color-mix(in srgb,var(--mc) 30%,#3b332b),#211b17);box-shadow:0 4px 0 #191714;color:#fff;cursor:pointer;font-family:var(--body)}
.cnMode svg{width:30px;height:30px}.cnMode b{font-family:var(--display);font-weight:400;font-size:14.5px;text-shadow:var(--tol);line-height:1.05}.cnMode small{font-size:11.5px;color:#dbd0b0;line-height:1.1}
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
.sk .cnfam{display:block;font-style:normal;font-size:12px;font-weight:800;color:var(--fc);margin-top:2px}.sk.cnfu{box-shadow:0 0 0 3px var(--fc),0 0 22px var(--fc)}
.cnEnd{display:flex;justify-content:center;gap:4px}.cnEnd .s{width:46px;height:46px;color:#3b332b;transform:scale(.6);opacity:.6;animation:cnStar .5s cubic-bezier(.2,1.6,.4,1) var(--d) forwards}
.cnEnd .s.on{color:var(--gold)}.cnEnd .s:nth-child(2){transform:translateY(-6px) scale(.6)}.cnEnd svg{width:100%;height:100%;filter:drop-shadow(0 3px 0 #191714)}
.cnEndG{list-style:none;margin:2px 0 0;padding:0;font-size:12.5px;color:#8f846e;display:flex;flex-direction:column;gap:1px}.cnEndG li.ok{color:#e6dcc0}.cnEndG li::before{content:"✗ ";color:#e5484d}.cnEndG li.ok::before{content:"✓ ";color:#9df07a}
.cnLitL,.cnRewL{margin-top:4px;display:flex;align-items:center;justify-content:center;gap:6px;font-family:var(--display);font-size:15px;color:var(--gold);text-shadow:var(--tol)}
.cnLitL svg{width:20px;height:26px}.cnLitL .fl{fill:#ff8a3c}.cnTr svg{width:20px;height:20px;color:var(--gold);vertical-align:-3px}
@keyframes cnIn{from{opacity:0;transform:translateY(18px) scale(.92)}to{opacity:1;transform:none}}
@keyframes cnBob{50%{transform:translateY(-4px)}}@keyframes cnPulse{to{filter:brightness(1.25)}}@keyframes cnFlick{to{transform:scaleY(1.12) scaleX(.94)}}
@keyframes cnStar{to{transform:scale(1);opacity:1}}
@media (prefers-reduced-motion:reduce){.cnDoor,.cnRelC,.cnArch svg,.cnN.sel .cnPic,.cnBr.on .fl,.cnd.nx{animation:none}.cnEnd .s{animation:none;transform:none;opacity:1}}`;

cnEnsure();
