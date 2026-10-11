// ---------- meta 2: heroes, talents, sets, evolutions, missions, achievements, settings ----------
(function migrate(){const d={sel:'c1',done:{},inf:{best:0,top:[]},best2:{room:0,gold:0},best3:{room:0,gold:0},best4:{room:0,gold:0},hero:'arciere',heroes:{arciere:1},tal:{},
  stats:{kills:{},bosses:{},elites:0,rooms:0,chests:0,dash:0,maxLvl:0,evos:0,gold:0,runs:0,wins:0,nohitAny:0},daily:{day:'',list:[]},free:{next:0,n:0},ach:{},title:null,frame:'base',
  set:{vib:true,left:false,q:'auto',mv:.8,sv:.8}};
  for(const k in d){if(SAVE[k]==null)SAVE[k]=d[k];else if(typeof d[k]==='object'&&!Array.isArray(d[k])&&typeof SAVE[k]==='object')for(const j in d[k])if(SAVE[k][j]==null)SAVE[k][j]=d[k][j]}
  if(SAVE.best&&SAVE.best.room>=6)SAVE.done.golem=true;
})();
const vib=p=>{if(!SAVE.set.vib||INTRO.on)return;try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};

// --- heroes ---
const HEROES=[
  {id:'arciere',n:'Arciere',price:0,d:'Equilibrato in tutto, il veterano della cripta.',start:'Occhio di falco: +10% critico',sk:'crit',mods:{},style:{},proj:'arrow'},
  {id:'cacciatrice',n:'Cacciatrice',price:3000,d:'Rapidissima e sfuggente, ma fragile.',start:'Frecce diagonali fin da subito',sk:'diag',mods:{hp:.8,spd:1.25,dash:.75},
    style:{bighood:false,body:'#8a3a5a',hood:'#d9962e',skin:'#f0c8a8',hair:'#e0a63a',bowCol:'#c94a6a',hoodTip:false,ponytail:true,belt:'#5e2440'},proj:'arrow',pcol:'#ff8ab8'},
  {id:'balestriere',n:'Balestriere',price:7000,d:'Lento e corazzato: ogni dardo è un macigno.',start:'Perforazione fin da subito',sk:'pierce',mods:{hp:1.3,atk:1.35,aspd:.8,spd:.9},
    style:{bighood:false,body:'#6b6f78',hood:'#4a3626',skin:'#e8b890',held:'xbow',bowCol:'#6b4a2a',helm:true,hoodTip:false,sc:1.05,belt:'#3a2a1d'},proj:'bolt',pcol:'#dfe4ea'},
  {id:'druida',n:'Druida',price:12000,d:'Le radici lo proteggono e lo curano.',start:'Una lama rotante, più salute e rigenerazione',sk:'orbit',mods:{hp:1.2,atk:1.2,regen:1.5},
    style:{bighood:false,body:'#3f6a2a',hood:'#2c4a1e',skin:'#e8c8a0',held:'staff',eyeCol:'#9fff7a',hoodTip:true,antlers:true,quiver:false,belt:'#6b4a2a'},proj:'leaf',pcol:'#7bf0a8'}];
const HERO_BY={};HEROES.forEach(h=>HERO_BY[h.id]=h);

// --- talents ---
const TAL=[
  {id:'vig',n:'Vigore',d:l=>`+${12*l} salute`,max:10,base:90,ic:'hp',f:(p,l)=>{p.maxhp+=12*l;p.hp=p.maxhp}},
  {id:'frz',n:'Forza',d:l=>`+${2*l} attacco`,max:10,base:105,ic:'atk',f:(p,l)=>{p.atk+=2*l}},
  {id:'rip',n:'Ripresa',d:l=>`Cura del ${4*l}% a ogni stanza`,max:5,base:180,ic:'heal',f:(p,l)=>{p.roomHeal=.04*l}},
  {id:'fort',n:'Fortuna',d:l=>`+${5*l}% oro raccolto`,max:8,base:140,ic:'gold',f:(p,l)=>{p.goldMul+=.05*l}},
  {id:'agi',n:'Agilità',d:l=>`Scatto più rapido del ${5*l}%`,max:6,base:150,ic:'dash',f:(p,l)=>{p.dashMax*=1-.05*l}},
  {id:'stu',n:'Studio',d:l=>`+${6*l}% esperienza`,max:8,base:120,ic:'xp',f:(p,l)=>{p.xpMul=1+.06*l}}];
const talCost=(t,l)=>Math.round(t.base*Math.pow(l+1,1.6));
const TICON={hp:ICON.hp,atk:ICON.atk,heal:ICON.heal,dash:ICON.dash,
  gold:'<circle cx="20" cy="22" r="12" fill="#ffc93c" '+S2+'/><circle cx="20" cy="22" r="7" fill="none" stroke="#b07a10" stroke-width="2.5"/><path d="M16 9l4-6 4 6" fill="#ffc93c" '+S2+'/>',
  xp:'<path d="M20 4l12 16-12 16L8 20z" fill="#8cf0b8" '+S2+'/><path d="M20 4v32M8 20h24" stroke="#1b1612" stroke-width="1.5" opacity=".4"/>'};

// --- new items and equipment sets ---
ITEMS.push(
  {id:'anello_brace',slot:'anello',rar:2,n:'Anello di brace',base:{crit:.04,atk:2},per:{crit:.012,atk:1},tint:{a:'#c87533',b:'#ff7a2e'}},
  {id:'arco_ossidiana',slot:'arma',rar:3,n:"Arco d'ossidiana",base:{atk:11,aspd:.06},per:{atk:3.2,aspd:.02},tint:{a:'#2a2530',b:'#ff7a2e'},perk:'Le frecce sono infuocate',perkf:p=>p.fire=true},
  {id:'corazza_lava',slot:'armatura',rar:3,n:'Corazza di lava',base:{hp:50,atk:3},per:{hp:15,atk:1},tint:{a:'#6a2a1e',b:'#ff7a2e'},perk:'Inizi con le frecce laterali',perkf:p=>p.side=1});
for(const it of ITEMS)ITEM[it.id]=it;
const SETS=[
  {id:'foresta',n:'Set della Foresta',items:['arco_spine','corazza_muschio'],d:'+15% salute e rigenerazione raddoppiata',f:p=>{const a=Math.round(p.maxhp*.15);p.maxhp+=a;p.hp+=a;p.regen=(p.regen||0)*2+.2}},
  {id:'ombra',n:"Set dell'Ombra",items:['mantello_ombra','anello_falco'],d:'+12% critico e scatto più rapido del 15%',f:p=>{p.crit+=.12;p.dashMax*=.85}},
  {id:'drago',n:'Set del Drago',items:['arco_fenice','cuore_drago'],d:'+25% attacco e la rinascita ti cura del tutto',f:p=>{p.atk*=1.25;p.reviveFull=true}},
  {id:'viandante',n:'Set del Viandante',items:['arco_ricurvo','amuleto_luna'],d:'+25% oro e +10% velocità',f:p=>{p.goldMul+=.25;p.spd*=1.1}},
  {id:'vulcano',n:'Set del Vulcano',items:['arco_ossidiana','corazza_lava'],d:'Bruciatura doppia e immunità al fuoco a terra',f:p=>{p.burnMul=2;p.fireRes=true}}];
const eqIds=()=>SLOTS.map(s=>SAVE.eq[s]).filter(Boolean);
const activeSets=()=>SETS.filter(s=>s.items.every(i=>eqIds().includes(i)));
const setOf=id=>SETS.find(s=>s.items.includes(id));

// --- evolutions ---
SK.push(
  {id:'evo_chain',evo:1,req:['fire','ric'],n:'Catene di fuoco',d:"Le fiamme saltano da un nemico all'altro",max:1,f:()=>P.chain=true},
  {id:'evo_frost',evo:1,req:['ice','pierce'],n:'Zero assoluto',d:'I colpi possono congelare i nemici',max:1,f:()=>P.freeze=true},
  {id:'evo_rain',evo:1,req:['multi','front'],n:'Pioggia di frecce',d:'Ogni 4 raffiche, una corona di dardi',max:1,f:()=>P.rain=true},
  {id:'evo_blades',evo:1,req:['orbit','dash'],n:'Tempesta di lame',d:'Lame più ampie, e lo scatto le scaglia',max:1,f:()=>{P.storm=true;P.orbit++}},
  {id:'evo_lethal',evo:1,req:['crit','atk'],n:'Colpo letale',d:'I critici fanno il triplo dei danni',max:1,f:()=>P.critMul=3},
  {id:'evo_fan',evo:1,req:['diag','side'],n:'Ventaglio mortale',d:'Due dardi in più a ventaglio, più forti',max:1,f:()=>P.fan=true});
for(const s of SK)if(s.evo)s.cond=()=>s.req.every(r=>P.skills[r]);
const EVO_OF={};for(const s of SK)if(s.evo)for(const r of s.req)(EVO_OF[r]=EVO_OF[r]||[]).push(s);
const GOLDR='<circle cx="20" cy="20" r="17" fill="#3a2a10" stroke="#ffc93c" stroke-width="2.5"/>';
Object.assign(ICON,{
  evo_chain:GOLDR+'<path d="M8 28l8-10 6 6 10-14" fill="none" stroke="#ff8a3c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="28" r="3.5" fill="#ffc93c" '+S2+'/><circle cx="22" cy="24" r="3.5" fill="#ffc93c" '+S2+'/><circle cx="32" cy="10" r="3.5" fill="#ffc93c" '+S2+'/>',
  evo_frost:GOLDR+'<path d="M20 6l6 9-6 19-6-19z" fill="#bfe9ff" '+S2+'/><path d="M9 14l22 12M31 14L9 26" stroke="#7fd3f0" stroke-width="3" stroke-linecap="round"/>',
  evo_rain:GOLDR+'<g stroke="#ffd86b" stroke-width="2.5" stroke-linecap="round">'+[0,1,2,3,4,5,6,7].map(i=>{const a=i*Math.PI/4;return `<path d="M${20+Math.cos(a)*5} ${20+Math.sin(a)*5}L${20+Math.cos(a)*14} ${20+Math.sin(a)*14}"/>`}).join('')+'</g><circle cx="20" cy="20" r="4" fill="#ffc93c" '+S2+'/>',
  evo_blades:GOLDR+'<g transform="translate(20 20)">'+[0,1,2].map(i=>`<path transform="rotate(${i*120})" d="M0 -15l5 9-5 3-5-3z" fill="#dfe4ea" ${S2}/>`).join('')+'</g><circle cx="20" cy="20" r="4" fill="#2fb3a6" '+S2+'/>',
  evo_lethal:GOLDR+'<circle cx="20" cy="20" r="10" fill="none" stroke="#e5484d" stroke-width="3"/><path d="M20 4v10M20 26v10M4 20h10M26 20h10" stroke="#ffd86b" stroke-width="3"/><circle cx="20" cy="20" r="3" fill="#e5484d"/>',
  evo_fan:GOLDR+'<g stroke="#ffd86b" stroke-width="2.6" stroke-linecap="round">'+[-60,-30,0,30,60].map(d=>{const a=(d-90)*Math.PI/180;return `<path d="M20 32L${20+Math.cos(a)*15} ${32+Math.sin(a)*24}"/>`}).join('')+'</g>'});

// --- run stats, missions, achievements hooks ---
const GROUPS={swamp:['frog','mosquito','croc','snail','tadpole'],ice:['wolf','snowspirit','icesentinel'],slime:['slime','bigslime','magmaslime'],fire:['magmaslime','imp','pyro','obsidian'],bat:['bat'],skeleton:['skeleton'],goblin:['goblin']};
const inGrp=(t,g)=>g==='any'||g===t||(GROUPS[g]||[]).includes(t);
const kc=(s,g)=>Object.entries(s.kills).reduce((a,[t,n])=>a+(inGrp(t,g)?n:0),0);
const MPOOL=[
  {k:'kill',t:'slime',g:30,n:'Sconfiggi 30 slime'},{k:'kill',t:'skeleton',g:15,n:'Sconfiggi 15 scheletri'},{k:'kill',t:'bat',g:20,n:'Sconfiggi 20 pipistrelli'},
  {k:'kill',t:'goblin',g:15,n:'Sconfiggi 15 goblin arcieri'},{k:'kill',t:'any',g:120,n:'Sconfiggi 120 nemici'},{k:'elite',g:5,n:'Sconfiggi 5 nemici élite'},
  {k:'boss',t:'golem',g:1,n:'Sconfiggi il Golem di Muschio'},{k:'nohit',t:'golem',g:1,n:'Batti il Golem senza farti colpire'},{k:'nohit',t:'any',g:1,n:'Batti un boss senza farti colpire'},
  {k:'room',g:8,n:'Raggiungi la stanza 8 in una partita'},{k:'gold',g:250,n:'Raccogli 250 oro nelle partite'},{k:'chest',g:2,n:'Apri 2 casse'},
  {k:'dash',g:40,n:'Usa lo scatto 40 volte'},{k:'lvl',g:10,n:'Raggiungi il livello 10 in una partita'},{k:'evo',g:1,n:"Ottieni un'evoluzione"},
  {k:'kill',t:'fire',g:25,n:'Sconfiggi 25 creature di fuoco',req:'c2'},{k:'boss',t:'salamander',g:1,n:'Sconfiggi la Salamandra di Lava',req:'c2'},{k:'inf',g:12,n:"Raggiungi la stanza 12 dell'Abisso",req:'inf'},
  {k:'kill',t:'swamp',g:30,n:'Sconfiggi 30 creature della palude',req:'c3'},{k:'boss',t:'toad',g:1,n:'Sconfiggi il Re Rospo',req:'c3'},{k:'kill',t:'ice',g:25,n:'Sconfiggi 25 creature del gelo',req:'c4'},{k:'boss',t:'yeti',g:1,n:'Sconfiggi lo Yeti delle Vette',req:'c4'}];
const MREW=[{gold:80},{gold:120},{chest:'legno'},{gold:160},{chest:'argento'}];
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const modeOpen=id=>id==='inf'?(!!SAVE.done.golem||(SAVE.trBest||0)>=ARENAS[1].t):id==='c2'?((SAVE.trBest||0)>=ARENAS[1].t||!!SAVE.done.c1):id==='daily'?(SAVE.runs||0)>=1:id==='c3'?(SAVE.trBest||0)>=ARENAS[2].t:id==='c4'?(SAVE.trBest||0)>=ARENAS[3].t:true;
function ensureDaily(){const t=today();if(SAVE.daily.day===t)return;
  let h=0;for(const ch of t)h=(h*31+ch.charCodeAt(0))>>>0;const rnd=()=>{h=(Math.imul(h,1103515245)+12345)>>>0;return h/4294967296};
  const pool=MPOOL.map((m,i)=>i).filter(i=>!MPOOL[i].req||modeOpen(MPOOL[i].req)),list=[];
  while(list.length<3&&pool.length){const j=Math.floor(rnd()*pool.length);const i=pool.splice(j,1)[0];if(list.some(o=>MPOOL[o.i].k===MPOOL[i].k&&MPOOL[o.i].t===MPOOL[i].t))continue;list.push({i,p:0,done:false,claimed:false,r:Math.floor(rnd()*MREW.length)})}
  SAVE.daily={day:t,list};save()}
function mprog(k,t,v,abs){ensureDaily();for(const m of SAVE.daily.list){const M=MPOOL[m.i];if(M.k!==k||m.done)continue;if(M.t&&t!==undefined&&t!==null&&!inGrp(t,M.t))continue;if(M.t&&M.t!=='any'&&(t===undefined||t===null))continue;
    m.p=abs?Math.max(m.p,v):m.p+v;if(m.p>=M.g){m.p=M.g;m.done=true;achPop('Missione completata',M.n,'mission');sfx('upgrade')}}}
const FRAMES={base:{n:'Semplice',c:['#6b5644','#3a2c22']},bronzo:{n:'Bronzo',c:['#e0955a','#7a4420']},argento:{n:'Argento',c:['#eef3f7','#7d8a96']},oro:{n:'Oro',c:['#ffe08a','#b07a10']},
  muschio:{n:'Muschio',c:['#a8e070','#3f6a2a']},lava:{n:'Lava',c:['#ffb070','#a8260e']},abisso:{n:'Abisso',c:['#d8a8ff','#3a1f66']},stagione:{n:'Stagione',c:['#fff6b0','#7a3cff']},palude:{n:'Palude',c:['#e0ff8a','#2f5a22']},ghiaccio:{n:'Ghiaccio',c:['#ffffff','#3a6aa8']},eroi:{n:'Compagnia',c:['#a8f0ff','#1d5a78']},leggenda:{n:'Leggenda',c:['#ffffff','#ffb020']}};
const ACH=[
  {id:'first',n:'Primo passo',d:'Completa la prima stanza',v:s=>s.rooms,g:1,title:'Novizio',frame:'bronzo'},
  {id:'slime',n:'Spazzaslime',d:'Sconfiggi 200 slime',v:s=>kc(s,'slime'),g:200,title:'Spazzaslime'},
  {id:'k1000',n:'Mille frecce',d:'Sconfiggi 1000 nemici',v:s=>kc(s,'any'),g:1000,title:'Veterano',frame:'argento'},
  {id:'golem',n:'Spaccapietre',d:'Sconfiggi il Golem di Muschio',v:s=>s.bosses.golem||0,g:1,title:'Spaccapietre'},
  {id:'witch',n:'Re della cripta',d:'Sconfiggi la Strega delle Radici',v:s=>s.bosses.witch||0,g:1,title:'Re della cripta',frame:'muschio'},
  {id:'salam',n:'Domafiamme',d:'Sconfiggi la Salamandra di Lava',v:s=>s.bosses.salamander||0,g:1,title:'Domafiamme'},
  {id:'smith',n:'Cuore di vulcano',d:'Sconfiggi il Fabbro Infernale',v:s=>s.bosses.smith||0,g:1,title:'Cuore di vulcano',frame:'lava'},
  {id:'toad',n:'Re per un giorno',d:'Sconfiggi il Re Rospo',v:s=>s.bosses.toad||0,g:1,title:'Domarospi'},
  {id:'hydra',n:'Tre teste, un arco',d:"Sconfiggi l'Idra della Palude",v:s=>s.bosses.hydra||0,g:1,title:'Signore della palude',frame:'palude'},
  {id:'yeti',n:'Valanga',d:'Sconfiggi lo Yeti delle Vette',v:s=>s.bosses.yeti||0,g:1,title:'Scalatore'},
  {id:'queen',n:'Cuore di ghiaccio',d:'Sconfiggi la Regina dei Ghiacci',v:s=>s.bosses.icequeen||0,g:1,title:'Re dei Picchi',frame:'ghiaccio'},
  {id:'nohit',n:'Intoccabile',d:'Batti un boss senza farti colpire',v:s=>s.nohitAny,g:1,title:'Intoccabile',frame:'oro'},
  {id:'elite',n:'Cacciatore di élite',d:'Sconfiggi 50 nemici élite',v:s=>s.elites,g:50,title:'Cacciatore di élite'},
  {id:'inf15',n:"Nell'Abisso",d:"Raggiungi la stanza 15 dell'Abisso",v:()=>SAVE.inf.best,g:15,title:'Esploratore'},
  {id:'inf30',n:"Signore dell'Abisso",d:"Raggiungi la stanza 30 dell'Abisso",v:()=>SAVE.inf.best,g:30,title:"Signore dell'Abisso",frame:'abisso'},
  {id:'evo',n:'Alchimista',d:'Ottieni 5 evoluzioni',v:s=>s.evos,g:5,title:'Alchimista'},
  {id:'heroes',n:'Compagnia completa',d:'Sblocca tutti gli eroi',v:()=>Object.keys(SAVE.heroes).length,g:HEROES.length,title:'Condottiero',frame:'eroi'},
  {id:'chests',n:'Cacciatore di tesori',d:'Apri 50 casse',v:s=>s.chests,g:50,title:'Cacciatore di tesori'},
  {id:'legend',n:'Leggenda vivente',d:'Porta un oggetto leggendario al livello 10',v:()=>ITEMS.some(i=>i.rar===4&&SAVE.items[i.id]&&SAVE.items[i.id].lvl>=10)?1:0,g:1,title:'Leggenda vivente',frame:'leggenda'}];
function checkAch(){for(const a of ACH){if(SAVE.ach[a.id])continue;if(a.v(SAVE.stats)>=a.g){SAVE.ach[a.id]=Date.now();achPop('Traguardo sbloccato',a.n+(a.title?' · titolo «'+a.title+'»':''),'trophy')}}}
const popQ=[];let popBusy=false,popCur=null,popGen=0;
function achPop(tag,txt,kind){if(INTRO.on)return;popQ.push({tag,txt,kind});if(!popBusy)nextPop()}
function nextPop(){
  // never cover the boss bar: missions and trophies wait until the boss fight is over
  if(popQ.length&&started&&$('menu').hidden&&!$('bossBar').hidden){popBusy=true;clearTimeout(nextPop.w);nextPop.w=setTimeout(nextPop,800);return}
  const p=popQ.shift(),el=$('achPop');if(!p||!el){popBusy=false;popCur=null;return}popBusy=true;popCur=p;const g=++popGen;
  el.querySelector('.apI').innerHTML=kind2svg(p.kind);el.querySelector('.apT').textContent=p.tag;el.querySelector('.apX').textContent=p.txt;
  el.classList.remove('show');void el.offsetWidth;el.classList.add('show');if(p.kind==='trophy')vib([30,40,30]);
  setTimeout(()=>{if(g!==popGen)return;el.classList.remove('show');setTimeout(()=>{if(g===popGen){popCur=null;nextPop()}},350)},2600)}
function kind2svg(k){return k==='mission'?'<svg viewBox="0 0 40 40"><rect x="8" y="5" width="24" height="31" rx="3" fill="#f6ead2" '+S2+'/><path d="M13 15l3 3 6-7M13 26h14" fill="none" stroke="#2fb3a6" stroke-width="3" stroke-linecap="round"/></svg>'
  :k==='unlock'?'<svg viewBox="0 0 40 40"><rect x="9" y="17" width="22" height="18" rx="3" fill="#ffc93c" '+S2+'/><path d="M14 17v-5a6 6 0 0 1 12 0" fill="none" stroke="#1b1612" stroke-width="3"/></svg>'
  :'<svg viewBox="0 0 40 40"><path d="M12 6h16v8a8 8 0 0 1-16 0z" fill="#ffc93c" '+S2+'/><path d="M12 9H6c0 6 3 8 7 8M28 9h6c0 6-3 8-7 8" fill="none" stroke="#1b1612" stroke-width="2.5"/><path d="M17 22h6v6h-6zM12 34h16v-4H12z" fill="#b07a10" '+S2+'/></svg>'}

// player creation shared by runs and the hero screen preview
function applyMeta(p){const h=HERO_BY[SAVE.hero]||HEROES[0],m=h.mods;
  p.spd=150*(m.spd||1);if(m.hp){p.maxhp=Math.round(p.maxhp*m.hp);p.hp=p.maxhp}if(m.atk)p.atk*=m.atk;if(m.aspd)p.aspd*=m.aspd;if(m.dash)p.dashMax*=m.dash;if(m.regen)p.regen=(p.regen||0)+m.regen;
  p.proj=h.proj;p.pcol=h.pcol;p.pspd=h.proj==='bolt'?720:h.proj==='leaf'?520:560;p.hero=h.id;
  {const W=SAVE.eq.arma&&WEAP[SAVE.eq.arma];p.wk=null;p.kbm=h.proj==='bolt'?1.6:1;p.trail=null;
   if(W&&h.proj==='arrow'){p.wk=SAVE.eq.arma;p.proj=W.proj;p.pspd=Math.round((W.proj==='bolt'?620:560)*W.spd);p.kbm=W.kb||1;p.trail=W.trail||null;if(W.fl&&!h.pcol)p.pcol=W.fl}}
  const s=SK.find(x=>x.id===h.sk);if(s){s.f();p.skills[s.id]=(p.skills[s.id]||0)+1}
  for(const t of TAL){const l=SAVE.tal[t.id]||0;if(l)t.f(p,l)}
  for(const st of activeSets())st.f(p);
  p.style=heroStyle()}
function previewStats(){const keep=P;const q=makeP();P=keep;return q}

// wrappers: tracking without touching the core functions
{const _ke=killE;killE=function(e,noLoot){const was=e.dead;_ke(e,noLoot);if(was||noLoot||!G||G.mode===undefined||INTRO.on)return;const st=SAVE.stats;
  st.kills[e.type]=(st.kills[e.type]||0)+1;mprog('kill',e.type,1);if(e.elite){st.elites++;mprog('elite',null,1)}
  if(isBoss(e.type)){st.bosses[e.type]=(st.bosses[e.type]||0)+1;mprog('boss',e.type,1);vib([90,50,160]);
    if(!G.bossDmg){st.nohitAny++;mprog('nohit',e.type,1);text(e.x,e.y-70,'INTOCCABILE!','#ffc93c',22);G.texts[G.texts.length-1].pop=1}
    if(e.type==='golem'&&!SAVE.done.golem){SAVE.done.golem=true;achPop('Nuova modalità','L\'Abisso è sbloccato','unlock')}}
  checkAch()}}
{const _hp=hurtP;hurtP=function(d){const h=P.hp;_hp(d);if(P.hp<h){G.bossDmg=true;vib(35)}}}
{const _sh=shake;shake=function(v){_sh(v);if(v>=8&&started)vib(45)}}
{const _ds=dash;dash=function(){const c=P&&P.dashCd;_ds();if(started&&!paused&&c<=0&&P.dashT>0){SAVE.stats.dash++;mprog('dash',null,1);
  if(P.storm){for(let i=0;i<8;i++){arrow(P.x,P.y-6,i*TAU/8+G.t,.6);const a=G.arrows[G.arrows.length-1];a.blade=true;a.pierce=3;a.ric=0}}}}}
{const _gx=gainXp;gainXp=function(v){const l=P.lvl;_gx(v*(P.xpMul||1));if(P.lvl>l){vib(20);mprog('lvl',null,P.lvl,true)}}}
{const _oc=openChest;openChest=function(t){if(!CHbusy){SAVE.stats.chests++;mprog('chest',null,1);checkAch();save()}return _oc(t)}}
{const _pk=pick;pick=function(i){const s=offer[i],had=s&&P.skills[s.id];_pk(i);if(s&&s.evo&&!had&&P.skills[s.id]){SAVE.stats.evos++;mprog('evo',null,1);banner('EVOLUZIONE!',s.n,1.8);sfx('levelup');vib([40,30,80]);startAura(s.id);
  for(let k=0;k<30;k++){const a=k/30*TAU;G.fx.push({k:'lvl',x:P.x,y:P.y-8,vx:Math.cos(a)*220,vy:Math.sin(a)*150,t:.6,gold:true})}checkAch()}}}
