// =====================================================================
// LOADING (punti 52 e 53 del piano di Denis, 13 ottobre: «approfittane ogni volta che si apre l'app dopo averla chiusa che parte la intro
// per non far buggare il gioco», e il caricamento intelligente, «molto importante»).
// - The page shows #boot (src/pagina.html) at once, before the game's code is even read: the code waits in <script type="text/mossbound">
//   and the loader in coda.html runs it after the first paint, so the phone never shows a blank page. Its icons move by CSS only, so they
//   keep moving while the phone is busy reading the code.
// - LOAD: that same screen for the start of the app (the classic look: the stone with the moss sprout) and for the way into the zombie map
//   (the zombie look: a hand out of the earth): show(kind, text), prog(k) with the real progress, hide().
// - At every cold start the game gets ready behind the screen: the menu is drawn a few times, the fonts arrive, the 3D hero and pets are
//   drawn once; then «Tocca per iniziare»: the tap opens the audio (the phone wants a touch for that) and the screen fades on the menu, or
//   the first time on the trailer. In the test browser (navigator.webdriver) nobody taps: the code runs at once as before and goes on.
// - IDLE: small jobs for when the phone has nothing to do, one at a time (the 3D models of all enemies and bosses drawn once off screen,
//   so the first time one appears in a room it doesn't stutter).
// - The zombie map is built in pieces (ZM.bootAsync) behind the zombie loading screen, with its real progress (src/js/63-zombie.js).
// - Memory: when the app goes in the background with the zombie map built but off, its biggest picture (the baked ground, 30 MB) is dropped;
//   the next way in bakes it again behind the loading screen. iOS closes first the apps in the background that use the most memory.
// =====================================================================
const TIPS={classic:['Da fermo l\'eroe tira da solo: muoviti per schivare, fermati per colpire.','Alla stanza 5 ti aspettano i Campioni: due nemici d\'élite insieme.',
    'Alla stanza 10 c\'è il custode dell\'arena.','Ogni livello in partita ti fa scegliere un\'abilità nuova.','Porta fino a due compagni: si scelgono nella scheda Compagni.',
    'I boss lasciano cristalli: con i cristalli si sbloccano compagni e casse.','Le coppe aprono arene nuove, con nemici e boss nuovi.'],
  zombie:['Ogni zombie abbattuto vale monete da spendere sulla mappa.','Tieni premuto per comprare: armi a muro, cancello, Bara delle Sorprese.',
    'La Lanterna delle Anime ti rialza una volta quando cadi.','Ogni 5 round arriva qualcosa di più grosso.','Oltre il cancello di ferro c\'è la Fattoria dei Corvi.',
    'Trascina il dito sulla destra dello schermo per girare la visuale.']};
const LOAD={on:false,kind:null,k:0,el:$('boot'),ht:0,
  q(s){return this.el?this.el.querySelector(s):null},
  show(kind,txt){const b=this.el;if(!b)return;clearTimeout(this.ht);b.hidden=false;b.classList.remove('out','wait');b.classList.toggle('zombie',kind==='zombie');b.classList.toggle('classic',kind!=='zombie');
    this.q('.bt-logo').textContent=kind==='zombie'?'Camposanto dei Corvi':'Mossbound';this.q('.bt-txt').textContent=txt||'';this.q('.bt-go').hidden=true;
    const T=TIPS[kind==='zombie'?'zombie':'classic'];this.q('.bt-tip').textContent=T[Math.floor(Math.random()*T.length)];
    this.k=0;this.bar(0);this.on=true;this.kind=kind},
  // the bar only goes forward
  prog(k){if(!this.el)return;k=Math.max(this.k,Math.min(1,k||0));this.k=k;this.el.classList.remove('wait');this.bar(k)},
  bar(k){const i=this.q('.bt-bar i');if(i)i.style.width=(k*100).toFixed(1)+'%'},
  hide(now){const b=this.el;this.on=false;if(!b)return;clearTimeout(this.ht);if(now||RM){b.hidden=true;b.classList.remove('out');return}
    b.classList.add('out');this.ht=setTimeout(()=>{b.hidden=true;b.classList.remove('out')},470)}};
// ------------------------------------------------------------------ small jobs when the phone has nothing to do
const IDLE={q:[],busy:false,
  add(f){this.q.push(f);this.go()},
  go(){if(this.busy||!this.q.length)return;this.busy=true;const run=dl=>{this.busy=false;const t0=performance.now();
      // one job at a time, a few if they are quick; never while a battle or the zombie map is on (their frames come first)
      while(this.q.length&&performance.now()-t0<6&&(!dl||dl.timeRemaining()>3)){if(started&&!paused||ZG.on||LOAD.on&&LOAD.kind==='zombie')break;const f=this.q.shift();try{f()}catch(e){console.error(e)}}
      if(this.q.length)setTimeout(()=>this.go(),started&&!paused||ZG.on?1500:120)};
    if(window.requestIdleCallback)requestIdleCallback(run,{timeout:1500});else setTimeout(run,60)}};
// a 3D model drawn once in a small canvas off screen: its code gets ready (the first frame with it in a room doesn't stutter)
const WARMC=document.createElement('canvas');WARMC.width=WARMC.height=96;
function warmDraw(f){const g=WARMC.getContext('2d'),sv=ctx;ctx=g;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,96,96);try{f()}finally{ctx=sv}}
function warmModels(){if(typeof N3==='undefined'||!N3.meta)return;for(const id of Object.keys(N3.meta)){if(typeof N3[id]!=='function')continue;const M=N3.meta[id],an=(M.an||['idle']).slice(0,6);
  for(const a of an)IDLE.add(()=>warmDraw(()=>{try{N3[id](48,80,Math.PI/2,a,.35,(M.sc||1)*.5,{noFx:LOWFX})}catch(e){}}))}}
// ------------------------------------------------------------------ the start of the app
const BOOTS={t0:performance.now(),ready:false,gone:false,frames:0,auto:!!navigator.webdriver};
// the menu drawn behind the screen counts its frames (the first ones are the slow ones). While the screen covers everything the menu under it is not drawn (all the phone goes to the loading): during the way into the zombie
// map, and at the start once the menu has been drawn a few times, until the tap (then it is drawn again at once, under the fading screen)
{const _l=loop;loop=function(now){if(LOAD.on&&(LOAD.kind==='zombie'||BOOTS.ready&&!BOOTS.gone)){last=now;requestAnimationFrame(loop);return}if(!BOOTS.gone)BOOTS.frames++;_l(now)}}
// the first time ever the trailer plays after the tap (playIntro): its music, not the menu's, when the audio opens
if(!SAVE.introSeen&&!BOOTS.auto)AU.want=null;
function bootGo(){if(BOOTS.gone)return;BOOTS.gone=true;if(!BOOTS.auto)initAudio();LOAD.hide(BOOTS.auto);
  if(!SAVE.introSeen&&playIntro(false)){
    // the audio opens a moment after the tap on some phones: the trailer waits for it (else its own «tocca» stays, as before)
    if(INTRO.splash&&!BOOTS.auto){let n=0;const w=setInterval(()=>{if(!INTRO.on||!INTRO.splash||++n>30){clearInterval(w);return}if(AU.ctx&&AU.ctx.state==='running'){clearInterval(w);iGo()}},50)}}
  else if(!BOOTS.auto)playMusic('menu');
  // what is left to get ready, little by little in the menu: the picture of the zombie card, then every 3D model
  IDLE.add(()=>{try{zThumb()}catch(e){}});warmModels()}
function bootReady(){if(BOOTS.ready)return;BOOTS.ready=true;LOAD.prog(1);if(BOOTS.auto){bootGo();return}
  LOAD.q('.bt-txt').textContent='Pronto!';const go=LOAD.q('.bt-go');go.hidden=false;
  const tap=e=>{if(e)e.preventDefault();LOAD.el.removeEventListener('click',tap);removeEventListener('keydown',key);bootGo()},key=e=>{if(e.key==='Enter'||e.key===' ')tap(e)};
  LOAD.el.addEventListener('click',tap);addEventListener('keydown',key)}
(function startUp(){if(!LOAD.el)return;LOAD.on=true;LOAD.kind='classic';
  // the test browser goes on at once, but after the last file of the game has run (the trailer keeps a copy of the save: it must be the whole one)
  if(BOOTS.auto){setTimeout(bootReady,0);return}
  LOAD.q('.bt-txt').textContent='Il muschio si risveglia…';LOAD.prog(.4);
  const T=TIPS.classic;LOAD.q('.bt-tip').textContent=T[Math.floor(Math.random()*T.length)];
  // the fonts of the game (canvas text needs them before drawing), at most 2 s (no network: the fonts of the system)
  const fonts=document.fonts&&document.fonts.load?Promise.race([Promise.all(['400 20px "Lilita One"','500 16px "Baloo 2"','700 16px "Baloo 2"'].map(f=>document.fonts.load(f).catch(()=>{}))),
    new Promise(r=>setTimeout(r,2000))]):Promise.resolve();
  let fk=false;fonts.then(()=>{fk=true});
  // the 3D heroes and pets drawn once (the menu draws only the one in use)
  const jobs=[];for(const h of HEROES)jobs.push(()=>warmDraw(()=>{for(const[w,m] of[[0,false],[2.4,true]])drawRig(48,80,Math.PI/2,w,m,heroStyle0(h.id),{})}));
  // (the pets keep their turn and their fade between moves in N3G.pf: the real ones in the menu must not notice the warm-up)
  for(const pt of PETS)jobs.push(()=>warmDraw(()=>{const k=N3G.pf[pt.id];N3G.pf[pt.id]={};try{drawPetSprite(pt.id,48,80,{face:Math.PI/2,t:0});drawPetSprite(pt.id,48,80,{face:Math.PI/2,t:.3,moving:true,hop:2})}
    finally{if(k)N3G.pf[pt.id]=k;else delete N3G.pf[pt.id]}}));
  const n0=jobs.length;
  const step=()=>{const t0=performance.now();while(jobs.length&&performance.now()-t0<10){try{jobs.shift()()}catch(e){}}
    // the bar: the code is read (40%), the heroes (to 70%), the menu's first frames and the fonts (to 100%)
    const k=.4+.3*(1-jobs.length/Math.max(1,n0))+.15*Math.min(1,BOOTS.frames/8)+(fk?.15:0);LOAD.prog(Math.min(.99,k));
    if(!jobs.length&&BOOTS.frames>=8&&fk){bootReady();return}
    // never more than 6 s behind the screen, whatever happens
    if(performance.now()-BOOTS.t0>6000){bootReady();return}
    setTimeout(step,jobs.length?0:60)};
  setTimeout(step,0)})();
// ------------------------------------------------------------------ memory: the zombie map's ground when the app goes in the background
document.addEventListener('visibilitychange',()=>{if(document.hidden&&ZG.ctl&&!ZG.on&&!ZG.wait&&ZM.libera)ZM.libera()});
