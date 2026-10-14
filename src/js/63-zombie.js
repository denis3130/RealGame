// =====================================================================
// THE ZOMBIE MODE IN THE GAME (Denis, 12-13 October: «nel gioco vero, giocabile dal menu, appena ci sono le ondate»). On the home, two tabs
// above the arena card, «Classica» and «Zombie» (SAVE.modo, remembered). In Zombie the card shows the Camposanto dei Corvi with the record
// round, a tap on it opens the sheet with the rules, and «Gioca» walks into the crypt and comes out on the zombie map (anteprime/zombie/:
// motore.js, prop.js, prop_fattoria.js, partita.js, area_mappa.js). The map is built the first time (a short wait) and set back as it was for
// every new match. At the end the match's gold (10·R²+30·R) goes into the save with the record round, pass experience and the game count;
// «Menu» comes back here. Sfida and Abisso stay classic. While the map is on, the classic loop draws nothing and the menu music is off.
// =====================================================================
const ZG={ctl:null,on:false,wait:false,last:null,thumb:null};
// the save: the chosen mode and the zombie records (old saves get them here, new ones from defSave). «Nuovo!» on the Zombie tab only after
// the first classic game (a brand new player starts with the Classica, the mode for everyone) and until the first zombie match
{const _d=defSave;defSave=function(){return Object.assign(_d(),{modo:'classica',zRec:0,zN:0,zKills:0})}}
for(const[k,v] of[['modo','classica'],['zRec',0],['zN',0],['zKills',0]])if(SAVE[k]==null)SAVE[k]=v;
const zMode=()=>SAVE.modo==='zombie';
// while the map is on, the classic loop stands still (no menu, no game drawn under the map)
{const _l=loop;loop=function(now){if(ZG.on){last=now;requestAnimationFrame(loop);return}_l(now)}}
// the menu music fades out on the map (the zombie mode's own music comes with the audio, phase 8); showMenu starts it again
function zMusicOff(){if(!AU.ctx||!AU.cur)return;const old=AU.cur;old.bus.gain.setTargetAtTime(0,AU.ctx.currentTime,.5);setTimeout(()=>{try{old.bus.disconnect()}catch(e){}},4000);AU.cur=null}
// ------------------------------------------------------------------ the look: the tabs, the zombie card
{const st=document.createElement('style');st.textContent=`
.modeTabs{position:relative;z-index:4;display:flex;justify-content:center;gap:5px;margin:0 0 -3px;pointer-events:none}
.modeTabs button{pointer-events:auto;position:relative;min-width:84px;padding:5px 13px 6px;border:3px solid var(--crInk);border-bottom:0;border-radius:11px 11px 0 0;background:linear-gradient(#3a3630,#2a2622);
  font-family:var(--display);font-size:13.5px;line-height:1;color:#b8ae98;text-shadow:var(--tol-s);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:color .2s}
.modeTabs button.on{color:#fff;background:linear-gradient(#26221e,#161412);box-shadow:inset 0 2px 0 rgba(255,255,255,.07)}
.modeTabs button[data-modo=zombie].on{color:#c4f08e}.modeTabs button:active{transform:translateY(1px)}
.modeTabs .nw{position:absolute;top:3px;left:calc(100% + 5px);white-space:nowrap;padding:2px 5px 3px;border:2px solid var(--crInk);border-radius:8px;background:linear-gradient(#b4f57a,#4cb328);font-family:var(--display);font-size:9.5px;line-height:1;color:#fff;text-shadow:var(--tol-s);animation:bob 1s infinite}
.chapCard.zmb{background:linear-gradient(100deg,rgba(16,14,12,.93) 32%,rgba(16,14,12,.2) 62%,rgba(16,14,12,.45)),var(--thumb,none) center/cover,#1b1f1a}.chapCard.zmb .ck{color:#a6e06a}.chapCard.zmb .zr{display:flex;flex-direction:column;align-items:flex-end;gap:1px;min-width:88px;font-family:var(--display);color:#fff;text-shadow:var(--tol-s)}
.chapCard.zmb .zr small{font-size:11px;color:#cfc6b0}.chapCard.zmb .zr b{font-weight:400;font-size:19px;line-height:1}.chapCard.zmb .zr b i{font-style:normal;color:#ff6a58}
.chapCard.zmb .rtrack .rn.on{background:#a6e06a;box-shadow:0 0 6px rgba(166,224,106,.7)}
@media (prefers-reduced-motion:reduce){.modeTabs .nw{animation:none}}`;document.head.appendChild(st)}
{const t=document.createElement('div');t.className='modeTabs';t.id='modeTabs';$('chapCard').before(t);}
function renderModeTabs(){const z=zMode(),html=`<button data-modo="classica" class="${z?'':'on'}">Classica</button><button data-modo="zombie" class="${z?'on':''}">Zombie${(SAVE.zN||0)===0&&(SAVE.runs||0)>=1&&!z?'<i class="nw">Nuovo!</i>':''}</button>`;
  const el=$('modeTabs');if(el._h!==html){el.innerHTML=html;el._h=html}}
$('modeTabs').addEventListener('click',e=>{const b=e.target.closest('button[data-modo]');if(!b||ZG.wait)return;const m=b.dataset.modo;if(SAVE.modo===m)return;SAVE.modo=m;save();sfx('ui');vib(12);renderPlay()});
// the picture behind the zombie card: the night graveyard with a Lantern zombie and a zombie on the right, drawn once with the monsters' code
function zThumb(){if(ZG.thumb)return ZG.thumb;const W=420,H=112,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),saved=ctx,gy=H*.7;
  const sk=g.createLinearGradient(0,0,0,H);sk.addColorStop(0,'#121726');sk.addColorStop(.69,'#252b3d');sk.addColorStop(.7,'#1d2619');sk.addColorStop(1,'#11160f');g.fillStyle=sk;g.fillRect(0,0,W,H);
  g.fillStyle='rgba(225,232,255,.14)';g.beginPath();g.arc(W*.9,20,20,0,TAU);g.fill();g.fillStyle='rgba(225,232,255,.8)';g.beginPath();g.arc(W*.9,20,9,0,TAU);g.fill();
  // the graves and the iron fence against the sky
  g.fillStyle='#0b0f0b';for(const[x,w,h] of[[W*.47,15,26],[W*.55,11,18],[W*.97,13,22],[W*.86,9,14]]){g.beginPath();g.moveTo(x-w/2,gy);g.lineTo(x-w/2,gy-h+w/2);g.arc(x,gy-h+w/2,w/2,Math.PI,0);g.lineTo(x+w/2,gy);g.fill()}
  for(let x=W*.4;x<W;x+=8)g.fillRect(x,gy-14,2.2,14);g.fillRect(W*.4,gy-11,W*.6,2);
  ctx=g;try{if(window.CR){if(CR.zombie)CR.zombie(W*.58,H*.95,Math.PI/2-.45,'idle',.6,2);if(CR.lanterna)CR.lanterna(W*.82,H*.97,Math.PI/2+.35,'idle',.3,1.75)}}catch(e){}finally{ctx=saved}
  const fog=g.createLinearGradient(0,gy-10,0,H);fog.addColorStop(0,'rgba(120,150,130,0)');fog.addColorStop(1,'rgba(120,150,130,.2)');g.fillStyle=fog;g.fillRect(0,gy-10,W,H-gy+10);
  try{ZG.thumb=c.toDataURL('image/jpeg',.85)}catch(e){ZG.thumb=''}return ZG.thumb}
// the zombie card: the map's name, the record round, ten rounds with the bosses at 5 and 10 lit up to the record
function renderZCard(){const R=SAVE.zRec||0;let tr='';for(let r=1;r<=10;r++){const boss=r%5===0;tr+=(r>1?`<i class="rl ${r<=R?'on':''}"></i>`:'')+`<span class="rn ${boss?'boss':''} ${r<=R?'on':''} ${r===R+1?'next':''}">${boss?SKULL_SVG(r===10):''}</span>`}
  const html=`<div><span class="ck">Modalità Zombie</span><h3>Camposanto dei Corvi</h3></div><div class="zr"><small>Record</small><b>${R?'Round <i>'+R+'</i>':'—'}</b></div><div class="rtrack">${tr}<em>${R>10?'Oltre il round 10!':'Ogni 5 round un boss'}</em></div>`;
  const el=$('chapCard');if(el._h!==html){el.innerHTML=html+'<i class="candle l"></i><i class="candle r"></i>';el._h=html;el.style.setProperty('--ac','#8fcf5a');el.style.setProperty('--thumb',`url(${zThumb()})`)}el.classList.add('zmb')}
{const _rc=renderChap;renderChap=function(){renderModeTabs();if(zMode()){renderZCard();return}$('chapCard').classList.remove('zmb');_rc()}}
// a tap on the card: the road of the cups in Classica, the zombie sheet in Zombie
$('chapCard').onclick=()=>{sfx('ui');if(zMode())openSheet('zombie');else setTab('tabRoad')};
function fillZombie(){lastSheetHTML='';const R=SAVE.zRec||0;
  $('sheet').innerHTML=`<h2>Modalità Zombie</h2><p class="lead">Il camposanto si sveglia a ondate: a ogni round più zombie, più veloci e più forti, e ogni 5 round un boss. Con le monete degli zombie apri il cancello della Fattoria dei Corvi, compri le armi sui muri, tenti la Bara delle Sorprese e la Lanterna delle Anime, che ti rialza una volta. Quando cadi la partita finisce: più round superi, più oro porti a casa.</p>
    <div class="abTop"><span><b>${R}</b>Record</span><span><b>${SAVE.zN||0}</b>Partite</span><span><b>${(SAVE.zKills||0).toLocaleString('it-IT')}</b>Zombie uccisi</span></div>
    <button class="btn go bigPlay" data-zplay="1">Entra nel camposanto</button><button class="btn alt close">Chiudi</button>`}
{const _os=openSheet;openSheet=function(kind){if(kind==='zombie'){SHEET=kind;sfx('ui');fillZombie();$('sheetScr').hidden=false;return}return _os(kind)}}
$('sheet').addEventListener('click',e=>{const b=e.target.closest('button[data-zplay]');if(!b)return;closeSheet();zGo()});
// ------------------------------------------------------------------ playing: Gioca in Zombie walks into the crypt, then the map
{const _gp=goPlay;goPlay=function(mode){if(mode==='arena'&&zMode()){zGo();return}return _gp(mode)}}
function zGo(){if(ZG.on||ZG.wait||CAMP.walk>0)return;initAudio();sfx('door');ZG.wait=true;
  if(RM||$('tabPlay').hidden||$('menu').hidden){zEnter();return}CAMP.walk=CAMP.t;setTimeout(()=>{CAMP.walk=0;zEnter()},1700)}
function zEnter(){if(ZG.on){ZG.wait=false;return}
  if(ZG.ctl&&ZM.W.ground){zStart();return}
  // the first time the map is built in pieces behind the zombie loading screen (src/js/65-caricamento.js), with its real progress: the phone
  // never freezes; after the app was in the background only its ground is baked again. The first frames of the map, the slow ones, are
  // drawn behind the screen, which fades a moment later
  LOAD.show('zombie','Il camposanto si risveglia…');const passo=k=>LOAD.prog(k);
  (ZG.ctl?ZM.ricuoci({passo}).then(()=>ZG.ctl):ZM.bootAsync(ZM.AREE.mappa,{game:true,fine:zFine,esci:zExit,passo})).then(ctl=>{ZG.ctl=ctl;zStart();
    requestAnimationFrame(()=>requestAnimationFrame(()=>LOAD.hide()))},e=>{console.error(e);LOAD.hide(true);ZG.wait=false;toast('Il camposanto non si apre: riprova')})}
// the hero on the map is the Arciere in 3D with the equipment of the menu (armour, ring, amulet, skin) and a zombie gun in hand
function zStart(){ZG.wait=false;ZG.on=true;ZG.last=null;if(SHEET)closeSheet();$('menu').hidden=true;$('wrap').classList.remove('inmenu');zMusicOff();
  try{ZM.stile(heroStyle('arciere'))}catch(e){}ZG.ctl.nuova();ZG.ctl.start()}
// the end of a match (from partita.js, once): the gold, the record, the counts, the pass; returns {rec} for «Nuovo record!»
function zFine(oro,R,kills){const rec=R>(SAVE.zRec||0),st=SAVE.stats;SAVE.gold=(SAVE.gold||0)+oro;if(st){st.gold+=oro;st.runs++}SAVE.runs=(SAVE.runs||0)+1;
  SAVE.zRec=Math.max(SAVE.zRec||0,R);SAVE.zN=(SAVE.zN||0)+1;SAVE.zKills=(SAVE.zKills||0)+kills;mprog('gold',null,oro);
  passXP(R*8+Math.min(80,kills*.6)+Math.floor(R/5)*25);const extra=zLuckyEnd(R);checkAch();save();ZG.last={oro,R,kills,rec};return{rec,extra}}
// back to the menu
function zExit(){if(!ZG.on)return;ZG.ctl.stop();ZG.on=false;showMenu();const L=ZG.last;if(L&&L.oro>0)setTimeout(()=>toast(`+${L.oro.toLocaleString('it-IT')} oro dal camposanto`),350)}
