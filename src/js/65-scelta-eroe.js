// =====================================================================
// THE MAKING OF THE HERO (Denis, 14 October: «vorrei che fosse la scelta come quella dei dark souls»). At the very first launch the
// intro plays first, then this screen, like the character creation of Dark Souls: black all round, a light from above, the four heroes
// listed on the left (the Arciere and the Cacciatrice can be picked; the Balestriere and the Druida are there with their padlock and
// their price), the hero in 3D in the middle under the light, turning slowly (a finger turns him, a tap makes him shoot), his numbers on
// the right, his story underneath. Then the second step, the gift to start with (a sack of gold, crystals, a silver chest, the falcon
// ring, the phoenix feather), floating in the light in 3D in front of the hero. Then «Il viaggio ha inizio» and the menu.
// The hero picked is free and is yours; the other one of the first two costs 3.000 gold in the hero tab (SAVE.starter); the
// Balestriere and the Druida keep their prices. Shown once: a save that has a starter, or games played, never sees it again; closed
// half way, it comes back over the menu.
// =====================================================================
const SCE_IDS=['arciere','cacciatrice','balestriere','druida'],SCE_FREE=['arciere','cacciatrice'],SCE_PRICE=HERO_BY.cacciatrice.price||3000;
// rgb: the colour of the runes, the sparks and the name; the: with its article; it: the pronoun after «sbloccar»
const SCE_INFO={arciere:{rgb:'92,222,200',hex:'#5cdec8',the:"l'Arciere",it:'lo',twang:null},
  cacciatrice:{rgb:'255,140,190',hex:'#ff8cbe',the:'la Cacciatrice',it:'la',twang:'arco_ricurvo'},
  balestriere:{rgb:'150,190,255',hex:'#a9c8ff',the:'il Balestriere',it:'lo'},
  druida:{rgb:'123,240,168',hex:'#7bf0a8',the:'il Druida',it:'lo'}};
const SCE_LORE={arciere:'Il veterano della cripta: equilibrato in tutto, non ha un punto debole e non perde mai la calma.',
  cacciatrice:'Rapidissima e sfuggente: colpisce di lato e sparisce prima che il nemico si giri. Ma bastano pochi colpi a fermarla.',
  balestriere:'Lento e corazzato. Ogni dardo è un macigno: trapassa i nemici e li spinge via.',
  druida:'Parla con il bosco: le radici lo proteggono e lo curano mentre combatte.'};
const SCE={on:false,el:null,step:1,sel:null,gift:null,done:false,raf:0,time:0,last:0,manual:false,yaw:Math.PI/2-.5,vel:0,drag:null,
  hero:null,prev:null,gcur:null,gprev:null,emb:[],motes:null,fog:null,bgK:'',bgImg:null,lay:null,low:false,ema:0,slow:0,err:0,
  tilt:.9,lift:3,cant:1,fin:null};
const sceStarter=()=>SCE_FREE.includes(SAVE.starter)?SAVE.starter:'arciere';
// the price of the first two heroes follows the choice: the one you picked is yours, the other costs 3.000 gold
for(const id of SCE_FREE)Object.defineProperty(HERO_BY[id],'price',{configurable:true,enumerable:true,get:()=>sceStarter()===id?0:SCE_PRICE});
// a new player: no hero picked yet, no games played, no hero but the Arciere the save gives everybody
const sceNeeded=()=>!SAVE.starter&&!(SAVE.runs>0)&&Object.keys(SAVE.heroes||{}).every(k=>k==='arciere');
const sceFree=id=>SCE_FREE.includes(id);

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

// ------------------------------------------------------------------ the look (Dark Souls: black, thin gold rules, serif capitals)
function sceFonts(){if($('sceFont'))return;const l=document.createElement('link');l.id='sceFont';l.rel='stylesheet';
  l.href='https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=EB+Garamond:ital,wght@0,500;1,500&display=swap';document.head.appendChild(l)}
function sceCss(){if($('sceCss'))return;const s=document.createElement('style');s.id='sceCss';s.textContent=`
#sceScr{--g:#d8b46a;--gh:#f6e2a8;--tx:#e9dcc0;--dim:#9a8f79;--se:"Cinzel",Georgia,"Times New Roman",serif;--bo:"EB Garamond",Georgia,"Times New Roman",serif;
  position:absolute;inset:0;z-index:96;overflow:hidden;background:#050403;color:var(--tx);font-family:var(--bo);display:flex;flex-direction:column;
  touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
#sceScr *,#sceScr *::before,#sceScr *::after{box-sizing:border-box}
#sceCv{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
#sceScr>:not(#sceCv){position:relative;z-index:1}
.sceTop{flex:none;text-align:center;padding:clamp(12px,2.6vh,24px) 16px 0;animation:sceIn .9s .1s ease-out backwards}
.sceTop small{display:block;font:500 10.5px/1 var(--se);letter-spacing:.34em;text-transform:uppercase;color:var(--dim)}
.sceTop h1{margin:7px 0 0;font:700 clamp(21px,6.4vw,30px)/1.08 var(--se);letter-spacing:.05em;color:var(--gh);text-shadow:0 0 18px rgba(255,196,110,.22),0 2px 0 #000;white-space:nowrap}
.sceRule{display:flex;align-items:center;justify-content:center;gap:8px;margin:8px auto 0;width:min(78%,300px)}
.sceRule::before,.sceRule::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(216,180,106,0),rgba(216,180,106,.6))}
.sceRule::after{background:linear-gradient(90deg,rgba(216,180,106,.6),rgba(216,180,106,0))}
.sceRule i{width:6px;height:6px;transform:rotate(45deg);background:var(--g);box-shadow:0 0 8px rgba(255,205,130,.7)}
.sceSteps{display:flex;justify-content:center;gap:16px;margin:7px 0 0;padding:0;list-style:none;font:500 10.5px var(--se);letter-spacing:.2em;text-transform:uppercase;color:#625a4c}
.sceSteps li{transition:color .3s}.sceSteps li.on{color:var(--g)}.sceSteps b{font-weight:700;margin-right:5px}
.sceMid{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1.2fr) minmax(0,.95fr);align-items:center;width:100%;max-width:560px;margin:0 auto;padding:0 8px}
.sceCol{min-width:0;align-self:start;margin-top:clamp(2px,1.6vh,18px);animation:sceIn .8s .25s ease-out backwards;transition:opacity .35s,transform .35s}
.sceCol{text-shadow:0 0 6px #000,0 0 3px #000,0 1px 0 #000}
.sceCol h2{margin:0 0 5px;padding:0 0 5px 2px;font:500 10px var(--se);letter-spacing:.24em;text-transform:uppercase;color:var(--dim);border-bottom:1px solid rgba(216,180,106,.28)}
.sceStats h2{text-align:right;padding:0 2px 5px 0}
.sceRow{position:relative;display:block;width:100%;margin:0;padding:clamp(8px,1.6vh,12px) 4px clamp(8px,1.6vh,12px) 15px;border:0;background:none;color:#b3a78e;text-align:left;cursor:pointer;
  font:500 clamp(12.5px,3.85vw,16px)/1.1 var(--se);letter-spacing:.01em;transition:color .2s,background .2s}
.sceRow::before{content:'';position:absolute;left:3px;top:calc(clamp(8px,1.6vh,12px) + .55em);width:6px;height:6px;margin-top:-3px;background:var(--g);box-shadow:0 0 8px rgba(255,205,130,.9);transform:rotate(45deg) scale(0);transition:transform .2s}
.sceRow.on{color:#fff4d8;background:linear-gradient(90deg,rgba(216,180,106,.2),rgba(216,180,106,0) 90%)}
.sceRow.on::before{transform:rotate(45deg) scale(1)}
.sceRow b{font-weight:500;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sceRow.g b{white-space:normal;line-height:1.08}
.sceRow small{display:flex;align-items:center;gap:4px;margin-top:4px;font:500 11px/1 var(--se);letter-spacing:.04em;color:#8a7f6b}
.sceRow.lock b{color:#857b69}.sceRow.lock.on b{color:#d4c9b0}
.sceLk{display:inline-block;width:10px;height:11px;flex:none}
.sceCoin,.sceGem{display:inline-block;width:12px;height:12px;flex:none;vertical-align:-1px;background:var(--coinImg) center/contain no-repeat}.sceGem{background-image:var(--gemImg)}
.sceStage{align-self:stretch;min-height:0;cursor:grab;touch-action:none}
.sceStats{text-align:right}
.sceStats dl{margin:0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:clamp(4px,1.1vh,8px) 6px;align-items:baseline}
.sceStats dt{font:500 clamp(10.5px,3.1vw,12.5px) var(--se);color:#a2967f;letter-spacing:.02em;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sceStats dd{margin:0;font:700 clamp(13px,3.9vw,16px) var(--se);color:#f2e7cd;font-variant-numeric:tabular-nums;white-space:nowrap}
.sceStats dd.up{color:#8cc4ff}.sceStats dd.dn{color:#ff9187}.sceStats dd i{font-style:normal;font-size:.62em;margin-left:2px;vertical-align:.15em}
.sceStats dd .sceCoin,.sceStats dd .sceGem{width:13px;height:13px;margin-left:3px;vertical-align:-2px}
.sceBot{flex:none;width:100%;max-width:560px;margin:0 auto;padding:0 12px clamp(12px,2.2vh,22px);animation:sceIn .8s .35s ease-out backwards;transition:opacity .4s}
.sceDesc{position:relative;padding:clamp(8px,1.4vh,12px) 14px clamp(9px,1.5vh,13px);border:1px solid rgba(216,180,106,.34);background:linear-gradient(rgba(16,12,9,.9),rgba(7,5,4,.94));
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.7),inset 0 0 22px rgba(0,0,0,.6),0 0 26px rgba(0,0,0,.7)}
.sceDesc::before,.sceDesc::after{content:'';position:absolute;top:-4px;width:7px;height:7px;transform:rotate(45deg);background:#0a0806;border:1px solid rgba(216,180,106,.6)}
.sceDesc::before{left:-4px}.sceDesc::after{right:-4px}
.sceDesc h3{margin:0;font:700 clamp(15px,4.6vw,19px)/1.15 var(--se);letter-spacing:.05em;color:var(--c,var(--gh))}
.sceDesc p{margin:4px 0 0;font:italic 500 clamp(13.5px,3.9vw,15.5px)/1.28 var(--bo);color:#e4d8bd}
.sceDesc ul{margin:6px 0 0;padding:0;list-style:none;font:500 clamp(12.5px,3.6vw,14px)/1.3 var(--bo);color:#cdbfa2}
.sceDesc li{display:flex;gap:6px;align-items:baseline}.sceDesc li::before{content:'';flex:none;width:5px;height:5px;transform:rotate(45deg) translateY(-2px);background:var(--g);opacity:.8}
.sceDesc li b{color:var(--c,var(--gh));font-weight:500}
.sceDesc .sceLkNote{color:#e8c37a}
.sceBtns{display:flex;gap:10px;justify-content:center;margin-top:clamp(8px,1.4vh,12px)}
.sceBtn{min-width:118px;min-height:46px;padding:10px 16px 11px;border:1px solid rgba(216,180,106,.5);background:linear-gradient(rgba(42,33,25,.94),rgba(16,12,10,.97));color:#efdfbb;cursor:pointer;
  font:700 14px/1 var(--se);letter-spacing:.14em;text-transform:uppercase;box-shadow:inset 0 1px 0 rgba(255,232,186,.14),0 0 0 1px #000,0 6px 16px rgba(0,0,0,.6);transition:transform .08s,opacity .3s,filter .2s}
.sceBtn:active{transform:translateY(2px) scale(.98)}
.sceGo{flex:1;max-width:260px;border-color:rgba(246,214,140,.85);color:#fff2cf;background:linear-gradient(rgba(92,70,40,.96),rgba(40,30,20,.98));
  box-shadow:inset 0 1px 0 rgba(255,236,190,.3),0 0 0 1px #000,0 0 18px rgba(255,196,100,.28),0 6px 16px rgba(0,0,0,.6)}
.sceGo:not([disabled]){animation:sceGlow 2.4s ease-in-out infinite}
.sceGo[disabled]{cursor:default;color:#a39885;border-color:rgba(216,180,106,.3);background:linear-gradient(rgba(34,29,25,.95),rgba(16,13,11,.98));box-shadow:0 0 0 1px #000}
.sceGo[disabled] .sceLk{margin-right:7px;vertical-align:-1px}
.sceBack{display:none}#sceScr.s2 .sceBack{display:block}
.sceBand{position:absolute!important;left:0;right:0;top:50%;height:96px;margin-top:-48px;z-index:4!important;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;
  background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.8) 28%,rgba(0,0,0,.8) 72%,rgba(0,0,0,0))}
.sceBand span{font:700 clamp(19px,6.2vw,32px) var(--se);color:#f3d79c;text-transform:uppercase;white-space:nowrap;text-shadow:0 0 24px rgba(255,186,90,.6),0 0 3px #000;letter-spacing:.08em}
#sceScr.band .sceBand{animation:sceBand 2.7s ease-out forwards}#sceScr.band .sceBand span{animation:sceSpace 2.7s ease-out forwards}
.sceFade{position:absolute!important;inset:0;z-index:5!important;background:#000;opacity:0;pointer-events:none;transition:opacity .5s}
#sceScr.fin .sceTop,#sceScr.fin .sceCol,#sceScr.fin .sceBot{opacity:0;transition:opacity .5s;pointer-events:none}
#sceScr.go .sceFade{opacity:1}
#sceScr.out{pointer-events:none;background:transparent}#sceScr.out>:not(.sceFade){display:none}#sceScr.out.clear .sceFade{opacity:0}
.sceSwap{animation:sceSwap .35s ease-out}
@keyframes sceIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes sceSwap{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
@keyframes sceGlow{50%{box-shadow:inset 0 1px 0 rgba(255,236,190,.3),0 0 0 1px #000,0 0 28px rgba(255,196,100,.5),0 6px 16px rgba(0,0,0,.6)}}
@keyframes sceBand{0%{opacity:0}16%{opacity:1}74%{opacity:1}100%{opacity:0}}
@keyframes sceSpace{from{letter-spacing:.05em}to{letter-spacing:.12em}}
@keyframes sceShake{20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
.sceNo{animation:sceShake .35s}
@media (max-height:600px){.sceTop small,.sceSteps{display:none}.sceDesc ul li:nth-child(n+2){display:none}.sceBtn{min-height:42px}}
@media (max-width:340px){.sceRow{padding-left:12px}.sceStats dt{font-size:10px}}
@media (prefers-reduced-motion:reduce){.sceTop,.sceCol,.sceBot,.sceGo:not([disabled]),.sceSwap{animation:none}}
`;document.head.appendChild(s)}
const SCE_LOCK='<svg class="sceLk" viewBox="0 0 10 11" aria-hidden="true"><path d="M2.6 5V3.4a2.4 2.4 0 0 1 4.8 0V5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="4.6" width="8" height="6" rx="1.2" fill="currentColor"/><rect x="4.4" y="6.6" width="1.2" height="2.2" rx=".6" fill="#000" opacity=".55"/></svg>';
const sceNum=n=>Number(n).toLocaleString('it-IT');

// ------------------------------------------------------------------ the screen
function sceOpen(){if(SCE.on)return;sceCss();sceFonts();
  const el=document.createElement('div');el.id='sceScr';el.className='s1';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','sceTitle');
  el.innerHTML=`<canvas id="sceCv" aria-hidden="true"></canvas>
    <header class="sceTop"><small>Creazione dell'eroe</small><h1 id="sceTitle">Chi vuoi essere?</h1><div class="sceRule"><i></i></div>
      <ol class="sceSteps"><li class="on"><b>I</b>Classe</li><li><b>II</b>Dono</li></ol></header>
    <main class="sceMid"><nav class="sceCol sceList" aria-label="Scelta"></nav><div class="sceStage" aria-hidden="true"></div><section class="sceCol sceStats" aria-live="polite"></section></main>
    <footer class="sceBot"><div class="sceDesc" aria-live="polite"></div>
      <div class="sceBtns"><button class="sceBtn sceBack">‹ Indietro</button><button class="sceBtn sceGo">Avanti ›</button></div></footer>
    <div class="sceBand"><span>Il viaggio ha inizio</span></div><div class="sceFade"></div>`;
  $('wrap').appendChild(el);
  SCE.menuWas=!$('menu').hidden;if(SCE.menuWas)$('menu').hidden=true;
  const stats={};for(const id of SCE_IDS)stats[id]=sceStats(id);
  Object.assign(SCE,{on:true,el,step:1,sel:null,gift:null,done:false,time:0,last:performance.now(),stats,hero:null,prev:null,gcur:null,gprev:null,emb:[],motes:null,fog:null,
    bgK:'',fin:null,drag:null,vel:0,yaw:Math.PI/2-.5,low:!!SCE.low,ema:0,slow:0,err:0});
  el.querySelector('.sceList').addEventListener('click',e=>{const r=e.target.closest('.sceRow');if(!r)return;if(SCE.step===1)scePick(r.dataset.id);else sceGiftPick(r.dataset.id)});
  el.querySelector('.sceGo').addEventListener('click',()=>sceGo());
  el.querySelector('.sceBack').addEventListener('click',()=>sceBack());
  sceStageInput(el.querySelector('.sceStage'));
  el.addEventListener('pointerdown',()=>{initAudio();if(AU.cur==null||AU.cur.name!=='scelta')playMusic('scelta')},{capture:true});
  sceList();scePick('arciere',true);sceDescFit();
  try{document.fonts.ready.then(()=>{if(SCE.on)sceDescFit()})}catch(e){}
  playMusic('scelta');
  cancelAnimationFrame(SCE.raf);SCE.raf=requestAnimationFrame(sceLoop)}
// closing: the black stays a moment and then lifts off the menu (fade: false takes it all away at once)
function sceClose(fade){SCE.on=false;cancelAnimationFrame(SCE.raf);if(SCE.menuWas){SCE.menuWas=false;$('menu').hidden=false}const el=SCE.el;SCE.el=null;if(!el)return;
  if(!fade){el.remove();return}el.classList.add('out');requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('clear')));setTimeout(()=>el.remove(),800)}
const sceT=()=>SCE.time;
// the left column: the four heroes or the five gifts
function sceList(){const L=SCE.el.querySelector('.sceList');
  if(SCE.step===1)L.innerHTML='<h2>Classe</h2>'+SCE_IDS.map(id=>{const h=HERO_BY[id],lk=!sceFree(id);
    return `<button class="sceRow${lk?' lock':''}" data-id="${id}" aria-pressed="false"><b>${h.n}</b>${lk?`<small>${SCE_LOCK}${sceNum(h.price)}<i class="sceCoin"></i></small>`:''}</button>`}).join('');
  else L.innerHTML='<h2>Dono</h2>'+SCE_GIFTS.map(g=>`<button class="sceRow g" data-id="${g.id}" aria-pressed="false"><b>${g.n}</b></button>`).join('');
  L.classList.remove('sceSwap');void L.offsetWidth;L.classList.add('sceSwap');
  const id=SCE.step===1?SCE.sel:SCE.gift;for(const r of L.querySelectorAll('.sceRow')){const on=r.dataset.id===id;r.classList.toggle('on',on);r.setAttribute('aria-pressed',on?'true':'false')}}
function sceMark(id){for(const r of SCE.el.querySelectorAll('.sceRow')){const on=r.dataset.id===id;r.classList.toggle('on',on);r.setAttribute('aria-pressed',on?'true':'false')}}
function sceHeroText(id){const h=HERO_BY[id],I=SCE_INFO[id],U=typeof ULT!=='undefined'&&ULT[id],S=SCE.stats[id],B=SCE.stats.arciere,lk=!sceFree(id);
  SCE.el.querySelector('.sceStats').innerHTML='<h2>Statistiche</h2><dl>'+SCE_ROWS.map(([k,n,f,dir])=>{if(!S)return'';const v=S[k],b=B?B[k]:v,d=id==='arciere'?0:Math.sign((v-b)*dir)*(Math.abs(v-b)>1e-6?1:0);
    return `<dt>${n}</dt><dd class="${d>0?'up':d<0?'dn':''}">${f(v)}${d?`<i>${d>0?'▲':'▼'}</i>`:''}</dd>`}).join('')+'</dl>';
  const D=SCE.el.querySelector('.sceDesc');D.style.setProperty('--c',I.hex);
  D.innerHTML=`<h3>${h.n}</h3><p>${SCE_LORE[id]||h.d}</p><ul><li><span>${h.start}</span></li>${U?`<li><span>Super: <b>${U.n}</b></span></li>`:''}
    ${lk?`<li class="sceLkNote"><span>Si sblocca nella scheda Eroi per ${sceNum(h.price)} oro.</span></li>`:''}</ul>`;
  const go=SCE.el.querySelector('.sceGo');go.disabled=lk;go.innerHTML=lk?`${SCE_LOCK}Bloccato`:'Avanti ›'}
function sceDescFit(){if(!SCE.el)return;const D=SCE.el.querySelector('.sceDesc');D.style.minHeight='0px';let mx=0;
  for(const id of SCE_IDS){sceHeroText(id);mx=Math.max(mx,D.offsetHeight)}for(const g of SCE_GIFTS){sceGiftText(g.id);mx=Math.max(mx,D.offsetHeight)}
  if(SCE.step===1)sceHeroText(SCE.sel);else sceGiftText(SCE.gift);D.style.minHeight=Math.ceil(mx)+'px'}
function sceGiftText(id){const g=SCE_GIFT[id];
  SCE.el.querySelector('.sceStats').innerHTML='<h2>Contenuto</h2><dl>'+g.rows.map(([n,v,ic])=>`<dt>${n}</dt><dd>${v}${ic==='coin'?'<i class="sceCoin"></i>':ic==='gem'?'<i class="sceGem"></i>':''}</dd>`).join('')+'</dl>';
  const D=SCE.el.querySelector('.sceDesc');D.style.setProperty('--c','#f6e2a8');D.innerHTML=`<h3>${g.n}</h3><p>${g.d}</p>`;
  const go=SCE.el.querySelector('.sceGo');go.disabled=false;go.textContent='Inizia'}
// picking a hero: the old one sinks into the dark, the new one comes up into the light
function scePick(id,quiet){if(SCE.done||!SCE.on||SCE.step!==1||!HERO_BY[id])return;const t=sceT();
  if(!quiet){initAudio();sceSnd(sceFree(id)?'move':'lock')}
  if(SCE.sel===id){if(SCE.hero&&t-SCE.hero.act>1.6)SCE.hero.act=t;return}
  if(SCE.hero)SCE.prev={...SCE.hero,t0:t};
  SCE.sel=id;SCE.hero={id,act:-1,in:t,anim:'idle',bl:null,lastA:null,shot:false,face:SCE.yaw};
  for(let i=0;i<(LOWFX||SCE.low?6:14);i++)sceEmber(SCE_INFO[id].rgb,true);
  sceMark(id);sceHeroText(id)}
function sceGiftPick(id,quiet){if(SCE.done||!SCE.on||SCE.step!==2||!SCE_GIFT[id])return;const t=sceT();
  if(!quiet){initAudio();sceSnd('move')}
  if(SCE.gift===id){if(SCE.gcur)SCE.gcur.pop=t;return}
  if(SCE.gcur)SCE.gprev={...SCE.gcur,t0:t};
  SCE.gift=id;SCE.gcur={id,t0:t,pop:t};for(let i=0;i<(LOWFX||SCE.low?5:12);i++)sceEmber(SCE_GIFT[id].rgb,true,true);
  sceMark(id);sceGiftText(id)}
function sceGo(){if(SCE.done||!SCE.on)return;initAudio();
  if(SCE.step===1){if(!sceFree(SCE.sel)){sceSnd('lock');const b=SCE.el.querySelector('.sceGo');b.classList.remove('sceNo');void b.offsetWidth;b.classList.add('sceNo');if(SCE.hero)SCE.hero.no=sceT();return}
    sceSnd('ok');SCE.step=2;SCE.el.className='s2';sceStepUi();sceList();sceGiftPick(SCE.gift||SCE_GIFTS[0].id,true);if(SCE.gcur)SCE.gcur.t0=SCE.gcur.pop=sceT();return}
  sceFinish()}
function sceBack(){if(SCE.done||!SCE.on||SCE.step!==2)return;sceSnd('back');SCE.step=1;SCE.el.className='s1';sceStepUi();
  if(SCE.gcur)SCE.gprev={...SCE.gcur,t0:sceT()};SCE.gcur=null;sceList();sceHeroText(SCE.sel)}
function sceStepUi(){const s=SCE.step;SCE.el.querySelector('#sceTitle').textContent=s===1?'Chi vuoi essere?':'Scegli un dono';
  SCE.el.querySelectorAll('.sceSteps li').forEach((li,i)=>li.classList.toggle('on',i===s-1))}
// the end: the gift flies into the hero, he shoots into the sky, «Il viaggio ha inizio», the menu
function sceFinish(){if(SCE.done||!SCE.on||!sceFree(SCE.sel)||!SCE.gift)return;SCE.done=true;const id=SCE.sel,g=SCE_GIFT[SCE.gift],t=sceT();
  // the choice: the hero picked is the one you own and play; the other one of the first two is for sale in the hero tab
  const hs={};for(const k in SAVE.heroes||{})if(!sceFree(k))hs[k]=SAVE.heroes[k];hs[id]=1;
  SAVE.starter=id;SAVE.hero=id;SAVE.heroes=hs;SAVE.dono=g.id;try{g.give()}catch(e){}heroView=id;heroConfirm=null;
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE))}catch(e){}
  if(INTRO.on&&INTRO.snap){try{const s=JSON.parse(INTRO.snap);for(const k of['starter','hero','heroes','dono','gold','gems','slots','items','eq','piuma'])s[k]=SAVE[k];INTRO.snap=JSON.stringify(s)}catch(e){}}
  SCE.fin={t0:t};SCE.el.classList.add('fin');sceSnd('ok');
  setTimeout(()=>{if(SCE.el){SCE.el.classList.add('band');sceSnd('band')}},1350);
  setTimeout(()=>{if(SCE.el)SCE.el.classList.add('go')},3700);
  setTimeout(()=>sceDone(g),4250)}
function sceDone(g){if(!SCE.on)return;sceClose(true);playMusic('menu');
  try{if(!INTRO.on){renderGold();renderPlay();renderWho()}}catch(e){}
  setTimeout(()=>{try{if(!INTRO.on)toast(`Dono: ${g.n}${g.id==='oro'?' (+500 oro)':g.id==='cristalli'?' (+30 cristalli)':g.id==='cassa'?' (tra le tue casse)':''}`)}catch(e){}},700)}
// keys: up and down (or the arrows left and right, W/S, A/D) move in the list, Enter or Space go on, Esc goes back
addEventListener('resize',()=>{if(SCE.on)setTimeout(sceDescFit,60)});
addEventListener('keydown',e=>{if(!SCE.on)return;e.stopImmediatePropagation();if(SCE.done){e.preventDefault();return}
  const ids=SCE.step===1?SCE_IDS:SCE_GIFTS.map(g=>g.id),cur=SCE.step===1?SCE.sel:SCE.gift,i=Math.max(0,ids.indexOf(cur)),c=e.code;
  const mv=d=>{e.preventDefault();const j=Math.max(0,Math.min(ids.length-1,i+d));if(SCE.step===1)scePick(ids[j]);else sceGiftPick(ids[j])};
  if(c==='ArrowUp'||c==='KeyW'||c==='ArrowLeft'||c==='KeyA')mv(-1);
  else if(c==='ArrowDown'||c==='KeyS'||c==='ArrowRight'||c==='KeyD')mv(1);
  else if(c==='Enter'||c==='Space'||c==='NumpadEnter'){e.preventDefault();sceGo()}
  else if(c==='Escape'||c==='Backspace'){e.preventDefault();sceBack()}},true);
// the finger on the hero: drag sideways to turn him, a tap makes him show what he can do
function sceStageInput(st){
  st.addEventListener('pointerdown',e=>{if(SCE.done)return;initAudio();SCE.drag={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,t:performance.now(),t0:performance.now(),moved:false};try{st.setPointerCapture(e.pointerId)}catch(_){}});
  st.addEventListener('pointermove',e=>{const d=SCE.drag;if(!d||d.id!==e.pointerId)return;const now=performance.now(),dx=e.clientX-d.x;d.x=e.clientX;
    if(Math.abs(e.clientX-d.x0)>7||Math.abs(e.clientY-d.y0)>7)d.moved=true;const a=-dx*.0135;SCE.yaw+=a;const dt=Math.max(.008,(now-d.t)/1000);SCE.vel=a/dt;d.t=now});
  const up=e=>{const d=SCE.drag;if(!d||d.id!==e.pointerId)return;SCE.drag=null;if(performance.now()-d.t>120)SCE.vel=0;
    if(!d.moved&&performance.now()-d.t0<420){if(SCE.step===1&&SCE.hero){if(sceT()-SCE.hero.act>1.6)SCE.hero.act=sceT()}else if(SCE.gcur)SCE.gcur.pop=sceT()}};
  st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up)}

// ------------------------------------------------------------------ sounds and music (the game's own instruments)
function sceSnd(k){if(!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.005;AU.pan=0;try{
  if(k==='move'){fNoise(t,.11,'bandpass',VR(1500,.06),1.2,.05,{att:.012,f2:2300});vBell(null,t+.01,[79,81,83,86][randi(0,3)],.7,.007)}
  else if(k==='back'){fNoise(t,.1,'bandpass',900,1.1,.05,{att:.01,f2:620})}
  else if(k==='lock'){M.metal(t,.22,VR(700,.05),.35);M.metal(t+.07,.16,VR(560,.05),.3);fThump(t,190,90,.07,.12)}
  else if(k==='ok'){fThump(t,130,46,.6,.34,.4);fNoise(t,.5,'lowpass',420,.7,.12,{brown:true,att:.02,rev:.6});vBell(null,t+.02,62,2.6,.03);vBell(null,t+.03,74,2.2,.018)}
  else if(k==='band'){fThump(t,90,36,1.2,.4,.6);vChoir(null,t,[50,57,62,66],3.2,.07);vBell(null,t+.05,74,4,.03);vBell(null,t+.06,81,3.5,.016);fNoise(t,1.6,'lowpass',260,.7,.1,{brown:true,att:.3,rev:.7})}
  else if(k==='absorb'){whoosh(t,.45,500,2400,.16,.3);vBell(null,t+.36,86,1.4,.02);vBell(null,t+.4,93,1.2,.012)}}catch(e){}}
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
function sceMove(H,t){const T=H.act>=0&&t>=H.act?t-H.act:1e9,TILT=SCE.tilt;
  const M={anim:'idle',p:((t/2.6)%1+1)%1,pull:0,tilt:0,hop:0,sq:0,squint:null,show:0,side:1};
  if(sceBow(H.id)){if(T<.28){const k=T/.28;Object.assign(M,{anim:'aim',p:0,tilt:TILT*sceEz(k),hop:3.6*Math.sin(k*Math.PI),sq:k<.2?-.05*Math.sin(k/.2*Math.PI):0,show:sceEz(k*1.4)})}
    else if(T<.82){const k=(T-.28)/.42;Object.assign(M,{anim:'aim',p:0,pull:sceEz(Math.min(1,k)),tilt:TILT,squint:.25+.35*Math.min(1,k),show:1,sq:T<.36?.06*Math.sin((T-.28)/.08*Math.PI):0})}
    else if(T<1.34){const k=(T-.82)/.52;Object.assign(M,{anim:'shoot',p:.5+.5*Math.min(1,k),tilt:TILT,show:1})}
    else if(T<1.9)M.show=1-sceEz((T-1.34)/.56)}
  else{const D=H.id==='balestriere'?1.5:1.35;if(T<D){Object.assign(M,{anim:'shoot',p:T/D,show:sceEz(Math.min(1,T/.25))})}else if(T<D+.5)M.show=1-sceEz((T-D)/.5)}
  return M}
// a hero at the stage's point, through the hero layer (so fading and the darkening of the locked ones never show one piece through another)
function sceHeroAt(H,t,dt,X,Y,k,alpha,dark){const M=sceMove(H,t),id=H.id,I=SCE_INFO[id];
  if(M.anim==='shoot'&&!H.shot){H.shot=true;if(sceBow(id))sfx('bow',I.twang);else if(id==='balestriere')sfx('bow','balestra');else sfx('summon');for(let i=0;i<(LOWFX||SCE.low?3:7);i++)sceEmber(I.rgb,true)}
  if(M.anim==='idle'&&H.shot&&t-H.act>2)H.shot=false;
  if(M.anim!==H.anim){if(H.lastA&&!(H.anim==='aim'&&M.anim==='shoot'))H.bl={A:H.lastA,t0:t,d:M.anim==='idle'?.32:.24};H.anim=M.anim}
  // the face: the turntable (SCE.yaw), and during the show three quarters towards us so the shot is seen
  const show=sceBow(id)?Math.PI/2+.95:Math.PI/2+.55;let d=show-SCE.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));let face=SCE.yaw+d*M.show;
  if(H.no!=null&&t-H.no<.4)face+=.12*Math.sin((t-H.no)*40)*(1-(t-H.no)/.4);
  const S=heroStyle0(id),style=id==='druida'&&!S.eyes?{...S,eyes:S.eyeCol}:S;
  const draw=()=>EROE.arciere(X,Y,face,M.anim,M.p,k,{style,moss:2,pull:M.pull,tweak:A=>{
    if(M.tilt)sceTilt(A,M.tilt,M.tilt/SCE.tilt);
    if(H.bl){const w=sceEz((t-H.bl.t0)/H.bl.d);if(w>=1)H.bl=null;else{sceMix(A,H.bl.A,1-w);if(M.anim!=='idle'&&w<.9)A.pinch=false}}
    if(M.hop||M.sq){A.B=[A.B[0],A.B[1],A.B[2]+M.hop];A.s=(A.s||0)+M.sq}
    if(M.squint!=null)A.squint=Math.max(A.squint||0,M.squint);
    H.lastA=sceSnap(A)}});
  sceLayer(X,Y,k,draw,alpha,dark)}
// the layer: a box round the figure (in device pixels), cleared, drawn, darkened if asked, then laid on the canvas
function sceLayer(X,Y,k,draw,alpha,dark){const m=ctx.getTransform(),dp=m.a;
  if(alpha>=.995&&!dark){draw();return}if(alpha<=.004)return;
  const L=X-46*k,T=Y-82*k,R=X+46*k,B=Y+20*k,x0=Math.floor(L*dp+m.e),y0=Math.floor(T*dp+m.f),w=Math.ceil((R-L)*dp)+2,h=Math.ceil((B-T)*dp)+2;
  if(!SCE.lay)SCE.lay=document.createElement('canvas');const c=SCE.lay;if(c.width<w)c.width=w;if(c.height<h)c.height=h;
  const g=c.getContext('2d'),saved=ctx;g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,w,h);g.setTransform(dp,0,0,dp,m.e-x0,m.f-y0);
  ctx=g;try{draw()}finally{ctx=saved}
  if(dark){g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=`rgba(${dark[0]},${dark[1]})`;g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over'}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=Math.min(1,alpha);ctx.drawImage(c,0,0,w,h,x0,y0,w,h);ctx.restore()}

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
    const face=V0.F(n),vane=left.concat(right.reverse()).map(q=>V0.P(q)),bb=C.bbox(vane);
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
// a gift at the screen point (x, y), k times bigger, floating, turning; a = fading in/out, pop = the little jump when it is picked
function sceGiftAt(G0,t,X,Y,k,alpha){const C=window.C3;if(!C||!SCE_G3[G0.id])return;const tt=t-G0.t0,pp=t-(G0.pop==null?G0.t0:G0.pop),pop=pp<.5?Math.sin(pp/.5*Math.PI)*(1-pp/.5):0,
    rise=sceEz(Math.min(1,tt/.45)),sc=k*(.72+.28*rise)*(1+.16*pop),fl=Math.sin(t*1.6)*1.4*k,flat=G0.id==='anello'||G0.id==='piuma',
    face=flat?Math.PI/2+.8*Math.sin(t*.8)+pop*1.4:t*.75+pop*2.2;
  // its shadow on the floor and the light under it
  const lift=8*k;ctx.save();ctx.globalAlpha=.3*alpha;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(X,Y,7.5*k,2.4*k,0,0,TAU);ctx.fill();ctx.restore();
  if(!LOWFX&&!SCE.low){ctx.save();ctx.globalCompositeOperation='lighter';glow(SCE_GIFT[G0.id].rgb,X,Y-lift-10*k+fl,22*k,.24*alpha*(1+pop));ctx.restore()}
  sceLayer(X,Y-lift+fl,sc,()=>{ctx.save();ctx.translate(X,Y-lift+fl);ctx.scale(sc,sc);try{SCE_G3[G0.id](C.V(face),t,C)}finally{ctx.restore()}},alpha,null)}

// ------------------------------------------------------------------ the dark around: far pillars in the black, the light from above, the floor
function sceBgImg(w,h,S){const key=w+'x'+h+':'+Math.round(S.x)+','+Math.round(S.y)+','+Math.round(S.k*10);if(SCE.bgK===key&&SCE.bgImg)return SCE.bgImg;
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
  const g=x.createRadialGradient(S.x,S.y-26*S.k,10,S.x,S.y-26*S.k,Math.max(w,h)*.8);g.addColorStop(0,'#1d1712');g.addColorStop(.35,'#0e0b09');g.addColorStop(1,'#030202');x.fillStyle=g;x.fillRect(0,0,w,h);
  // pillars and arches far away, barely there
  x.save();x.globalAlpha=.55;for(const[px,pw,ph] of[[.06,.07,.72],[.24,.05,.62],[.76,.05,.62],[.94,.07,.72]]){const X=w*px,W=w*pw,top=h*(1-ph)-S.k*6,gg=x.createLinearGradient(X-W,0,X+W,0);
    gg.addColorStop(0,'rgba(30,25,21,0)');gg.addColorStop(.35,'rgba(44,37,31,.9)');gg.addColorStop(.6,'rgba(26,22,19,.9)');gg.addColorStop(1,'rgba(20,16,14,0)');x.fillStyle=gg;x.fillRect(X-W,top,W*2,h-top)}
  x.restore();
  // the floor: a darker band with the pool of light, the cone of light from above
  const fy=S.y,fl=x.createLinearGradient(0,fy-30*S.k,0,h);fl.addColorStop(0,'rgba(0,0,0,0)');fl.addColorStop(.25,'rgba(8,6,5,.65)');fl.addColorStop(1,'rgba(2,1,1,.95)');x.fillStyle=fl;x.fillRect(0,fy-30*S.k,w,h);
  x.save();x.globalCompositeOperation='lighter';
  const pool=x.createRadialGradient(S.x,fy,4,S.x,fy,46*S.k);pool.addColorStop(0,'rgba(255,214,150,.22)');pool.addColorStop(.5,'rgba(255,190,120,.08)');pool.addColorStop(1,'rgba(255,170,100,0)');
  x.setTransform(1,0,0,.34,0,fy*.66);x.fillStyle=pool;x.beginPath();x.arc(S.x,fy,46*S.k,0,TAU);x.fill();x.setTransform(1,0,0,1,0,0);
  const top=Math.max(0,S.y-98*S.k),bot=fy+4*S.k;
  for(let i=0;i<6;i++){const sp=i/5,cw0=(5+4*sp)*S.k,cw1=(26+14*sp)*S.k,cone=x.createLinearGradient(0,top,0,bot);cone.addColorStop(0,'rgba(255,232,180,.055)');cone.addColorStop(.6,'rgba(255,220,160,.025)');cone.addColorStop(1,'rgba(255,210,150,.008)');
    x.fillStyle=cone;x.beginPath();x.moveTo(S.x-cw0,top);x.lineTo(S.x+cw0,top);x.lineTo(S.x+cw1,bot);x.lineTo(S.x-cw1,bot);x.closePath();x.fill()}
  x.restore();
  const v=x.createRadialGradient(S.x,h*.48,Math.min(w,h)*.3,S.x,h*.5,Math.max(w,h)*.78);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.75)');x.fillStyle=v;x.fillRect(0,0,w,h);
  SCE.bgK=key;return SCE.bgImg=c}
// sparks rising from the runes (gift: from the gift)
function sceEmber(rgb,burst,gift){SCE.emb.push({rgb,gift:!!gift,x:(Math.random()*2-1)*(burst?15:18),y:(gift?-16:0)+(Math.random()*2-1)*3,vx:(Math.random()*2-1)*(burst?13:3),vy:-(burst?20+Math.random()*28:10+Math.random()*13),l:0,max:burst?.7+Math.random()*.7:1.3+Math.random()*1.3,s:burst?1.3:1})}
// where the hero stands: the middle of the stage, his feet near its bottom, as big as the stage allows
function sceSpot(){const st=SCE.el&&SCE.el.querySelector('.sceStage'),cv=$('sceCv');if(!st||!cv)return null;const a=st.getBoundingClientRect(),b=cv.getBoundingClientRect();
  const H=a.height,W=a.width,k=Math.max(1.6,Math.min(H*.62/44,(W+18)/24));return{x:a.left-b.left+W/2,y:a.top-b.top+H-Math.min(H*.08,8*k),k}}
function sceDraw(t,dt){const cv=$('sceCv');if(!cv)return;const low=LOWFX||SCE.low,dpr=Math.min(window.devicePixelRatio||1,low?1.25:2),w=cv.clientWidth,h=cv.clientHeight;if(w<4||h<4)return;
  const W=Math.round(w*dpr),H=Math.round(h*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
  const S=sceSpot();if(!S)return;const x=cv.getContext('2d'),saved=ctx,gt=G.t;ctx=x;G.t=t;
  try{x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.drawImage(sceBgImg(W,H,{x:S.x*dpr,y:S.y*dpr,k:S.k*dpr}),0,0);x.setTransform(dpr,0,0,dpr,0,0);
    const step2=SCE.step===2&&!SCE.fin,fin=SCE.fin?t-SCE.fin.t0:-1,k=S.k;
    // fog drifting over the floor
    if(!low){if(!SCE.fog){SCE.fog=[];for(let i=0;i<7;i++)SCE.fog.push({x:Math.random(),y:Math.random(),s:.7+Math.random()*.6,v:(.008+Math.random()*.012)*(i%2?1:-1)})}
      for(const f of SCE.fog){const fx=((f.x+t*f.v)%1+1)%1*(w+240)-120,fy=S.y-6*k+f.y*24*k;x.globalAlpha=.07*f.s;x.drawImage(glowSprite('200,190,175'),fx-90*f.s,fy-16*f.s,180*f.s,32*f.s)}x.globalAlpha=1}
    // the rune stone under his feet, in his colour
    const I=SCE_INFO[SCE.sel]||SCE_INFO.arciere,lk=!sceFree(SCE.sel);SCE.rt=(SCE.rt||0)+dt*(lk?.5:1.2);
    drawRuneStone(S.x,S.y,k*.62,lk?'150,150,170':I.rgb,SCE.rt);
    SCE.ember=(SCE.ember||0)+dt*(low?2:5);while(SCE.ember>1){SCE.ember--;if(SCE.hero)sceEmber(lk?'170,170,190':I.rgb,false)}
    sceEmbers(x,S,dt,low,false);
    // the heroes: the one going away sinks into the dark, the new one comes up into the light; in the second step he waits in the dark
    // behind the gift; at the end the light comes back on him
    const dim=step2?.45:fin>=0?Math.max(0,.45*(1-Math.min(1,fin/.6)))*(SCE.step===2?1:0):0;
    const hk=id=>k*(id==='druida'?.86:1);
    if(SCE.prev){const a=1-sceEz((t-SCE.prev.t0)/.3);if(a<=0)SCE.prev=null;else sceHeroAt(SCE.prev,t,dt,S.x,S.y-(1-a)*3*k,hk(SCE.prev.id),a,['8,8,12',(.35+.4*(1-a)).toFixed(3)])}
    if(SCE.hero){const a=sceEz((t-SCE.hero.in-.08)/.34),dk=lk?.42:dim;sceHeroAt(SCE.hero,t,dt,S.x,S.y+(1-a)*4*k,hk(SCE.hero.id),a,dk>.01?['6,6,10',dk.toFixed(3)]:null);
      if(a<1&&a>0&&!low){x.save();x.globalCompositeOperation='lighter';glow('255,236,200',S.x,S.y-24*k,26*k,.35*(1-a));x.restore()}}
    // a padlock swinging in front of a locked hero
    if(lk&&SCE.step===1&&SCE.hero){const sw=Math.sin(t*2.1)*.18,px=S.x+9.5*k,py=S.y-9*k;x.save();x.translate(px,py);x.rotate(sw);x.scale(k*.42,k*.42);sceLockDraw(x);x.restore()}
    // the gift in the light, in front of the hero; at the end it flies into him
    const gX=S.x,gY=S.y+3*k;
    if(SCE.gprev){const a=1-sceEz((t-SCE.gprev.t0)/.25);if(a<=0)SCE.gprev=null;else sceGiftAt(SCE.gprev,t,gX,gY,k*.8,a)}
    if(SCE.gcur){if(fin<0)sceGiftAt(SCE.gcur,t,gX,gY,k*.8,sceEz((t-SCE.gcur.t0)/.3));
      else if(fin<.6){const q=sceEz(fin/.6);sceGiftAt(SCE.gcur,t,gX,gY-q*12*k,k*.8*(1-.85*q),1-q*q)}
      else if(!SCE.fin.hit){SCE.fin.hit=true;sceSnd('absorb');for(let i=0;i<(low?10:26);i++)sceEmber(SCE_GIFT[SCE.gcur.id].rgb,true,true);if(SCE.hero)SCE.hero.act=t+.25}}
    if(fin>=.55&&fin<1.1&&!low){x.save();x.globalCompositeOperation='lighter';glow('255,236,190',S.x,S.y-26*k,30*k,.5*(1-(fin-.55)/.55));x.restore()}
    // dust in the light, sparks
    if(!low){if(!SCE.motes){SCE.motes=[];for(let i=0;i<26;i++)SCE.motes.push({u:Math.random()*2-1,v:Math.random(),s:.5+Math.random(),ph:Math.random()*TAU})}
      x.save();x.globalCompositeOperation='lighter';for(const m of SCE.motes){const vv=((m.v-t*.018*m.s)%1+1)%1,yy=S.y-96*k*vv+4*k,ww=(7+27*(1-vv))*k*.9,xx=S.x+m.u*ww+Math.sin(t*.4+m.ph)*3*k,a=.28*Math.sin(vv*Math.PI)*(.5+.5*Math.sin(t*1.3+m.ph));
        x.fillStyle=`rgba(255,236,190,${a.toFixed(3)})`;x.fillRect(xx,yy,1.3,1.3)}x.restore()}
    sceEmbers(x,S,dt,low,true)}
  catch(e){if(!SCE.err){SCE.err=1;console.error(e)}}
  finally{ctx=saved;G.t=gt}}
// the sparks of the hero (behind him) or of the gift (in front), in units of k/2.4 round the hero's feet
function sceEmbers(x,S,dt,low,gift){x.save();x.translate(S.x,S.y);x.scale(S.k/2.4,S.k/2.4);x.globalCompositeOperation='lighter';
  for(let i=SCE.emb.length-1;i>=0;i--){const e=SCE.emb[i];if(e.gift!==gift)continue;e.l+=dt;if(e.l>=e.max){SCE.emb.splice(i,1);continue}e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=.97;e.vy*=.985;
    const a=Math.sin(e.l/e.max*Math.PI),oy=gift?-12*2.4:0;x.fillStyle=`rgba(${e.rgb},${(.8*a).toFixed(3)})`;x.fillRect(e.x-.7*e.s,e.y+oy-.7*e.s,1.4*e.s,1.4*e.s);if(!low)glow(e.rgb,e.x,e.y+oy,3.4*e.s,.32*a)}
  x.restore()}
function sceLockDraw(x){x.lineJoin='round';x.strokeStyle=INK;x.lineWidth=2.4;x.beginPath();x.moveTo(-5,0);x.lineTo(-5,-5);x.arc(0,-5,5,Math.PI,0);x.lineTo(5,0);x.stroke();
  x.strokeStyle='#b7bcc4';x.lineWidth=1.3;x.stroke();
  const g=x.createLinearGradient(0,-1,0,11);g.addColorStop(0,'#ffd86b');g.addColorStop(1,'#b8781a');x.fillStyle=g;x.beginPath();x.roundRect?x.roundRect(-8,-1,16,12,2.5):x.rect(-8,-1,16,12);x.fill();x.strokeStyle=INK;x.lineWidth=2;x.stroke();
  x.fillStyle=INK;x.beginPath();x.arc(0,4,1.8,0,TAU);x.fill();x.fillRect(-.8,4,1.6,4);x.fillStyle='rgba(255,255,255,.4)';x.fillRect(-6.4,.6,4,1.4)}
// one step of the screen (the tests step it by hand with SCE.manual, to look at every frame)
function sceTick(dt){SCE.time+=dt;const t=SCE.time;
  // the turntable: slowly round, the finger's push fading back into it
  // at the end he turns to face us and stays there
  if(SCE.fin){let d=(Math.PI/2-.35)-SCE.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));SCE.yaw+=d*(1-Math.exp(-dt*5));SCE.vel=0}
  else if(!SCE.drag){const auto=.32;SCE.vel+=(auto-SCE.vel)*(1-Math.exp(-dt*1.6));SCE.yaw+=SCE.vel*dt}
  sceDraw(t,dt)}
// a slow phone (frames longer than 30 ms for a second and a half): smaller canvas, no fog, no dust, like LOWFX
function sceLoop(now){if(!SCE.on)return;const raw=Math.max(0,(now-SCE.last)/1000),dt=Math.min(.05,raw);SCE.last=now;
  if(!SCE.manual&&raw<.25&&SCE.time>.6){SCE.ema=(SCE.ema||raw)+(raw-(SCE.ema||raw))*.06;SCE.slow=SCE.ema>.03?(SCE.slow||0)+raw:0;if(SCE.slow>1.5)SCE.low=true}
  if(!SCE.manual)sceTick(dt);SCE.raf=requestAnimationFrame(sceLoop)}

// while you choose, the game under the choice does not draw
{const _l=loop;loop=function(now){if(SCE.on){last=now;requestAnimationFrame(loop);return}_l(now)}}
// first the intro, then the making of the hero: at the end of the intro (or with «Salta») the screen opens over the menu
{const _ie=introEnd;introEnd=function(){const need=INTRO.on&&sceNeeded();if(need)SCE.wait=true;try{_ie.apply(this,arguments)}finally{SCE.wait=false}if(need&&sceNeeded()&&!SCE.on)sceOpen()}}
// the fonts come while the intro plays; a save that was closed half way through the choice gets it again over the menu
if(sceNeeded()){sceFonts();if(!INTRO.on)sceOpen()}
