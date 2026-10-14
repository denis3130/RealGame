// =====================================================================
// WHO DO YOU WANT TO BE? (Denis, 14 October) At the very first launch, before the intro, the player picks the hero to «be»: the
// Arciere or the Cacciatrice. The one picked is free and is the hero of the story (the intro shows him or her); the other one is
// unlocked later in the hero tab for 3.000 gold, like the other heroes. Shown once: the choice stays in SAVE.starter. Old saves (runs
// played or the intro already seen) never see it and keep the Arciere. The heroes are the game's 3D models (EROE.arciere), alive on
// their rune stones: they breathe and look around; the one you tap jumps, draws the bow and shoots an arrow into the sky.
// This file runs after the boot (59): at the first launch the intro is already waiting on its «tap to start», so the choice covers it,
// and the tap that confirms starts the intro (it also unlocks the sound on phones).
// =====================================================================
const SCE_IDS=['arciere','cacciatrice'],SCE_PRICE=HERO_BY.cacciatrice.price||3000;
// rgb: the colour of the runes and the light; face: how much each one is turned towards the middle; aim: where the arrow goes
const SCE_INFO={arciere:{rgb:'92,222,200',hex:'#5cdec8',the:"l'Arciere",it:'lo',face:-.42,aim:.95,ph:0,twang:null},
  cacciatrice:{rgb:'255,140,190',hex:'#ff8cbe',the:'la Cacciatrice',it:'la',face:.42,aim:-.95,ph:1.3,twang:'arco_ricurvo'}};
const SCE={on:false,el:null,sel:null,done:false,cards:[],raf:0,time:0,last:0,manual:false,tilt:.9,lift:3,cant:1,bgK:'',bgImg:null,flies:null};
const sceStarter=()=>SCE_IDS.includes(SAVE.starter)?SAVE.starter:'arciere';
// the price of the first two heroes follows the choice: the one you picked is yours, the other costs 3.000 gold
for(const id of SCE_IDS)Object.defineProperty(HERO_BY[id],'price',{configurable:true,enumerable:true,get:()=>sceStarter()===id?0:SCE_PRICE});
const sceNeeded=()=>!SAVE.starter&&!SAVE.introSeen&&!(SAVE.runs>0);
// the intro tells the story of your hero: the Cacciatrice takes the Arciere's place (the other heroes are not in it)
function sceIntroHero(){if(!P)return;const id=SCE_IDS.includes(SAVE.hero)?SAVE.hero:sceStarter();if(id==='arciere')return;const h=HERO_BY[id];
  Object.assign(P,{hero:id,style:heroStyle0(id),proj:h.proj,pcol:h.pcol||null})}
{const _ih=iHero;iHero=function(){_ih();sceIntroHero()}}

// ------------------------------------------------------------------ the look
function sceCss(){if($('sceCss'))return;const s=document.createElement('style');s.id='sceCss';s.textContent=`
#sceScr{position:absolute;inset:0;z-index:96;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(8px,2.2vh,16px);
  padding:calc(14px + env(safe-area-inset-top,0px)) 14px calc(14px + env(safe-area-inset-bottom,0px));overflow-x:hidden;overflow-y:auto;background:#07060a;
  color:#fff;font-family:var(--body);touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
#sceBg{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
#sceScr>:not(#sceBg){position:relative;z-index:1}
.sceHead{text-align:center;animation:sceDrop .55s cubic-bezier(.2,1.5,.4,1) backwards}
.sceHead small{display:block;font:400 14px var(--display);color:#ffd84a;letter-spacing:.12em;text-transform:uppercase;text-shadow:var(--tol-s)}
.sceHead h1{margin:2px 0 0;font:400 clamp(34px,10.4vw,46px)/1.02 var(--display);color:#fff;text-shadow:var(--tol),0 0 26px rgba(0,0,0,.8);white-space:nowrap}
.sceHead p{margin:6px 0 0;font-size:15px;line-height:1.25;color:#efe4c8;text-shadow:0 1px 0 #000,0 0 10px #000}
.sceCards{display:flex;gap:10px;width:100%;max-width:430px}
.sceCard{position:relative;flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;margin:0;padding:0 0 10px;border-radius:16px;
  border:3px solid #191714;background:linear-gradient(#433a30,#2a241e 46%,#1f1a16);box-shadow:inset 0 2px 0 rgba(255,255,255,.14),0 5px 0 #191714;
  color:#fff;font-family:var(--body);text-align:center;cursor:pointer;overflow:hidden;transition:transform .24s cubic-bezier(.2,1.6,.4,1),box-shadow .25s,border-color .25s;
  animation:sceRise .6s cubic-bezier(.2,1.4,.4,1) backwards}
.sceCard:nth-child(2){animation-delay:.08s}
.sceCard canvas{display:block;width:100%;height:auto;aspect-ratio:5/6;background:radial-gradient(70% 62% at 50% 58%,rgba(var(--cr),.24),rgba(var(--cr),0) 70%)}
.sceCard::after{content:'';position:absolute;inset:0;border-radius:13px;background:rgba(8,6,5,.5);opacity:0;transition:opacity .25s;pointer-events:none}
.sceCard.off::after{opacity:1}
.sceCard.off{transform:scale(.96)}
.sceCard.on{transform:scale(1.035);border-color:#ffe066;box-shadow:inset 0 2px 0 rgba(255,255,255,.2),0 0 0 2px #191714,0 0 24px rgba(var(--cr),.55),0 5px 0 #191714}
.sceOk{position:absolute;top:8px;right:8px;width:30px;height:30px;border-radius:50%;border:2.5px solid #191714;background:linear-gradient(#b4f57a,#4cb328);
  box-shadow:0 2px 0 #191714;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.3);transition:opacity .2s,transform .3s cubic-bezier(.2,1.8,.4,1)}
.sceOk svg{width:17px;height:17px}
.sceCard.on .sceOk{opacity:1;transform:scale(1)}
.sceName{margin-top:-4px;font:400 clamp(19px,5.6vw,23px)/1 var(--display);color:#fff;text-shadow:var(--tol);white-space:nowrap}
.sceD{display:block;margin:5px 8px 0;min-height:2.4em;font-size:12.5px;line-height:1.2;color:#e9ddc2}
.sceSt{width:100%;margin:7px 0 0;padding:0 10px;list-style:none;display:flex;flex-direction:column;gap:3px}
.sceSt li{display:flex;align-items:center;justify-content:space-between;gap:6px;font:400 12.5px var(--display);color:#d9cdb0;text-shadow:var(--tol-s)}
.sceSt i{display:inline-flex;gap:2px}
.sceSt i b{width:9px;height:9px;border-radius:2.5px;border:1.5px solid #191714;background:rgba(0,0,0,.4)}
.sceSt i b.on{background:linear-gradient(#fff,var(--c) 45%);box-shadow:0 0 5px rgba(var(--cr),.6)}
.sceStart{margin:8px 8px 0;font:400 12.5px/1.15 var(--display);color:#ffd84a;text-shadow:var(--tol-s)}
.sceUlt{margin:3px 8px 0;font-size:11.5px;line-height:1.15;color:#cfc3a6}
.sceUlt b{color:var(--c);font-weight:700}
.sceFoot{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;max-width:430px;animation:sceRise .6s .16s cubic-bezier(.2,1.4,.4,1) backwards}
.sceGo{min-width:250px;max-width:100%;padding:11px 22px 13px;border:3px solid #191714;border-radius:14px;cursor:pointer;font:400 clamp(22px,6.6vw,27px)/1 var(--display);color:#fff;
  text-shadow:var(--tol);background:linear-gradient(#b4f57a 0%,#68d13a 48%,#4cb328 52%,#5cc232 100%);
  box-shadow:inset 0 3px 0 rgba(255,255,255,.6),inset 0 -4px 0 rgba(0,0,0,.18),0 5px 0 #191714;transition:transform .08s}
.sceGo:not([disabled]){animation:sceBreath 1.5s ease-in-out infinite}
.sceGo:active{transform:translateY(3px) scale(.98);box-shadow:inset 0 3px 0 rgba(255,255,255,.5),0 2px 0 #191714}
.sceGo[disabled]{cursor:default;color:#e2dacb;background:linear-gradient(#8f877b,#6c655b 50%,#5f584f 52%,#676056);box-shadow:inset 0 2px 0 rgba(255,255,255,.25),0 4px 0 #191714}
.sceNote{margin:0;max-width:330px;font-size:13px;line-height:1.25;text-align:center;color:#e3d7bb;text-shadow:0 1px 0 #000,0 0 8px #000}
.sceNote b{color:#ffd84a;font-weight:700}
.sceFade{position:absolute;inset:0;z-index:5!important;background:#000;opacity:0;pointer-events:none;transition:opacity .45s}
#sceScr.go .sceFade{opacity:1}
#sceScr.out{pointer-events:none;background:transparent}#sceScr.out>:not(.sceFade){display:none}#sceScr.out.clear .sceFade{opacity:0}
#sceScr.pick .sceCard.off{transform:translateY(24px) scale(.9);opacity:0;transition:transform .5s,opacity .4s}
#sceScr.pick .sceCard.on{transform:translateX(calc(50% + 5px)) scale(1.08);transition:transform .55s cubic-bezier(.3,1.3,.5,1)}
#sceScr.pick .sceCard.on+.sceCard.off{transform:translateX(24px) scale(.9)}#sceScr.pick .sceCard.off+.sceCard.on{transform:translateX(calc(-50% - 5px)) scale(1.08)}
#sceScr.pick .sceHead,#sceScr.pick .sceFoot{opacity:0;transition:opacity .35s}
@keyframes sceDrop{from{opacity:0;transform:translateY(-26px) scale(1.15)}to{opacity:1;transform:none}}
@keyframes sceRise{from{opacity:0;transform:translateY(34px)}to{opacity:1;transform:none}}
@keyframes sceBreath{50%{transform:scale(1.045)}}
@media (max-height:640px){.sceCard canvas{aspect-ratio:1/1}.sceHead p{display:none}.sceUlt{display:none}}
@media (max-height:540px){.sceD{display:none}}
@media (prefers-reduced-motion:reduce){.sceHead,.sceCard,.sceFoot,.sceGo:not([disabled]){animation:none}}
`;document.head.appendChild(s)}

// ------------------------------------------------------------------ the screen
function sceCardHtml(id){const h=HERO_BY[id],m=h.mods||{},I=SCE_INFO[id],U=typeof ULT!=='undefined'&&ULT[id];
  const pips=v=>{const n=clamp(Math.round(3*v),1,5);let s='';for(let k=0;k<5;k++)s+=`<b class="${k<n?'on':''}"></b>`;return `<i aria-hidden="true">${s}</i>`};
  return `<button class="sceCard" data-id="${id}" style="--c:${I.hex};--cr:${I.rgb}" aria-pressed="false">
    <canvas aria-hidden="true"></canvas><span class="sceOk" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9" fill="none" stroke="#191714" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 10.5l4 4 8-9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <b class="sceName">${h.n}</b><span class="sceD">${h.d}</span>
    <ul class="sceSt"><li>Salute${pips(m.hp||1)}</li><li>Attacco${pips(m.atk||1)}</li><li>Velocità${pips(m.spd||1)}</li></ul>
    <span class="sceStart">★ ${h.start}</span>${U?`<span class="sceUlt">Super: <b>${U.n}</b></span>`:''}</button>`}
function sceOpen(){if(SCE.on)return;sceCss();
  // the intro waits under the choice, frozen on its «tap to start» (if the sound was already on and it had started, it goes back there)
  if(INTRO.on&&!INTRO.splash){INTRO.splash=true;$('introScr').classList.add('splash');
    if(AU.cur&&AU.cur.name==='trailer'){try{AU.cur.bus.gain.setTargetAtTime(0,AU.ctx.currentTime,.05)}catch(e){}AU.cur=null}}
  const el=document.createElement('div');el.id='sceScr';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','sceTitle');
  el.innerHTML=`<canvas id="sceBg" aria-hidden="true"></canvas>
    <div class="sceHead"><small>Prima di partire</small><h1 id="sceTitle">Chi vuoi essere?</h1><p>Scegli il tuo eroe: nella storia sarai tu.</p></div>
    <div class="sceCards">${SCE_IDS.map(sceCardHtml).join('')}</div>
    <div class="sceFoot"><button class="sceGo" disabled>Tocca un eroe</button><p class="sceNote">L'altro eroe potrai sbloccarlo più avanti, nella scheda Eroi.</p></div>
    <div class="sceFade"></div>`;
  $('wrap').appendChild(el);
  Object.assign(SCE,{on:true,el,sel:null,done:false,time:0,last:performance.now(),flies:null,low:false,ema:0,slow:0,err:0,
    cards:[...el.querySelectorAll('.sceCard')].map(b=>({id:b.dataset.id,btn:b,cv:b.querySelector('canvas'),act:-1,face:Math.PI/2+SCE_INFO[b.dataset.id].face,
      anim:'idle',bl:null,lastA:null,shot:false,emb:[],ember:0}))});
  el.addEventListener('click',e=>{const c=e.target.closest('.sceCard');if(c){scePick(c.dataset.id);return}if(e.target.closest('.sceGo'))sceConfirm()});
  cancelAnimationFrame(SCE.raf);SCE.raf=requestAnimationFrame(sceLoop)}
// closing: the cards go, the black stays a moment and then lifts off whatever comes next (fade: false takes it all away at once)
function sceClose(fade){SCE.on=false;cancelAnimationFrame(SCE.raf);SCE.cards=[];const el=SCE.el;SCE.el=null;if(!el)return;
  if(!fade){el.remove();return}el.classList.add('out');requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('clear')));setTimeout(()=>el.remove(),700)}
const sceT=()=>SCE.time;
function scePick(id){if(SCE.done||!SCE.on)return;initAudio();const t=sceT(),again=SCE.sel===id;SCE.sel=id;
  for(const c of SCE.cards){const on=c.id===id;c.btn.classList.toggle('on',on);c.btn.classList.toggle('off',!on);c.btn.setAttribute('aria-pressed',on?'true':'false');
    if(!on)c.act=-1;else if(!again||t-c.act>1.35){c.act=t;c.shot=false;for(let i=0;i<(LOWFX?7:16);i++)sceEmber(c,true)}}
  sfx('ui');
  const I=SCE_INFO[id],O=SCE_INFO[SCE_IDS.find(x=>x!==id)],go=SCE.el.querySelector('.sceGo');go.disabled=false;go.textContent=`Sarò ${I.the}!`;
  const other=O.the.charAt(0).toUpperCase()+O.the.slice(1);
  SCE.el.querySelector('.sceNote').innerHTML=`${other} potrai sbloccar${O.it} più avanti nella scheda Eroi, per <b>${SCE_PRICE.toLocaleString('it-IT')} oro</b>.`}
function sceConfirm(){if(!SCE.sel||SCE.done||!SCE.on)return;SCE.done=true;initAudio();const id=SCE.sel,t=sceT();
  // the choice: the hero picked is the one you own and play; the other one is for sale in the hero tab
  SAVE.starter=id;SAVE.hero=id;if(id==='cacciatrice')SAVE.heroes={cacciatrice:1};else{SAVE.heroes=SAVE.heroes||{};SAVE.heroes.arciere=1}
  heroView=id;heroConfirm=null;
  // save() stays quiet while the intro is on, and the intro puts back the save it copied: the choice goes in both
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE))}catch(e){}
  if(INTRO.on&&INTRO.snap){try{const s=JSON.parse(INTRO.snap);s.starter=SAVE.starter;s.hero=SAVE.hero;s.heroes=SAVE.heroes;INTRO.snap=JSON.stringify(s)}catch(e){}}
  sceIntroHero();
  const c=SCE.cards.find(q=>q.id===id);if(c&&t-c.act>1.35){c.act=t;c.shot=false}if(c)for(let i=0;i<(LOWFX?8:22);i++)sceEmber(c,true);
  sfx('upgrade');SCE.el.classList.add('pick');
  setTimeout(()=>{if(SCE.el)SCE.el.classList.add('go')},1250);
  setTimeout(()=>{sceClose(true);if(INTRO.on){sceIntroHero();iGo()}else if(!playIntro(false))showMenu()},1750)}
// keys: arrows (or A/D) pick, Enter or Space confirm; nothing reaches the intro or the game under the choice
addEventListener('keydown',e=>{if(!SCE.on)return;e.stopImmediatePropagation();
  if(SCE.done){e.preventDefault();return}
  if(e.code==='ArrowLeft'||e.code==='KeyA'){e.preventDefault();scePick(SCE_IDS[0])}
  else if(e.code==='ArrowRight'||e.code==='KeyD'){e.preventDefault();scePick(SCE_IDS[1])}
  else if((e.code==='Enter'||e.code==='Space'||e.code==='NumpadEnter')&&SCE.sel){e.preventDefault();sceConfirm()}},true);

// ------------------------------------------------------------------ the heroes: poses and blends
// every change of move starts from the pose drawn last and slides into the new one, so nothing jumps
const SCE_K=['B','lean','roll','s','sx','hd','hy','hp','grip','aim','up','hR','fL','fR','draw','nock','squint','jig','sway'];
function sceSnap(A){const o={};for(const k of SCE_K){const v=A[k];o[k]=Array.isArray(v)?v.slice():v}return o}
const sceNrm=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l]};
function sceMix(A,F,k){for(const n of SCE_K){const a=A[n],b=F[n];if(a==null||b==null)continue;if(Array.isArray(a))A[n]=a.map((v,i)=>v+(b[i]-v)*k);else if(typeof a==='number')A[n]=a+(b-a)*k}
  A.aim=sceNrm(A.aim);A.up=sceNrm(A.up)}
// the bow raised towards the sky: bow, string and string hand turn together round the shoulder; on the way up the bow also stands
// upright (k: 0..1), so from the side you see its whole curve, and the whole thing rises a little above the face
function sceTilt(A,f,k){if(!f)return;const c=Math.cos(f),s=Math.sin(f),o=[4,0,13],rot=v=>[v[0]*c-v[2]*s,v[1],v[0]*s+v[2]*c],lift=(SCE.lift||0)*k,
  rp=v=>{const d=rot([v[0]-o[0],v[1]-o[1],v[2]-o[2]]);return[d[0]+o[0],d[1]+o[1],d[2]+o[2]+lift]};A.grip=rp(A.grip);A.hR=rp(A.hR);A.aim=rot(A.aim);A.up=rot(A.up);
  const a=A.aim,u=sceNrm([-a[0]*a[2],-a[1]*a[2],1-a[2]*a[2]]);A.up=sceNrm(A.up.map((v,i)=>v+(u[i]-v)*k*(SCE.cant==null?1:SCE.cant)))}
const sceEz=k=>k<=0?0:k>=1?1:k*k*(3-2*k);
// what the hero does now: T is the time since you tapped him (the jump, the draw, the shot, back to rest)
function sceMove(c,t){const I=SCE_INFO[c.id],T=c.act>=0?t-c.act:1e9,rest=Math.PI/2+I.face,shoot=Math.PI/2+I.aim,TILT=SCE.tilt;
  const M={anim:'idle',p:(((t+I.ph)/2.6)%1+1)%1,pull:0,tilt:0,hop:0,sq:0,squint:null,face:rest};
  if(T<.28){const k=T/.28;Object.assign(M,{anim:'aim',p:0,pull:0,tilt:TILT*sceEz(k),hop:3.6*Math.sin(k*Math.PI),sq:k<.2?-.05*Math.sin(k/.2*Math.PI):0,face:shoot})}
  else if(T<.82){const k=(T-.28)/.42;Object.assign(M,{anim:'aim',p:0,pull:sceEz(Math.min(1,k)),tilt:TILT,squint:.25+.35*Math.min(1,k),face:shoot,sq:T<.36?.06*Math.sin((T-.28)/.08*Math.PI):0})}
  else if(T<1.34){const k=(T-.82)/.52;Object.assign(M,{anim:'shoot',p:.5+.5*Math.min(1,k),tilt:TILT,face:shoot})}
  else if(T<1.8)M.face=rest;
  return M}
function sceDrawHero(c,t,dt){const M=sceMove(c,t),I=SCE_INFO[c.id];
  // the shot: the twang when the string is let go
  if(M.anim==='shoot'&&!c.shot){c.shot=true;sfx('bow',I.twang);for(let i=0;i<(LOWFX?3:6);i++)sceEmber(c,true)}
  if(M.anim!==c.anim){if(c.lastA&&!(c.anim==='aim'&&M.anim==='shoot'))c.bl={A:c.lastA,t0:t,d:M.anim==='idle'?.32:.24};c.anim=M.anim}
  {let d=M.face-c.face;d=Math.atan2(Math.sin(d),Math.cos(d));c.face+=d*(1-Math.exp(-dt*(c.act>=0&&t-c.act<1.34?11:5)))}
  const S=heroStyle0(c.id);
  EROE.arciere(0,8,c.face,M.anim,M.p,1,{style:S,moss:2,pull:M.pull,tweak:A=>{
    sceTilt(A,M.tilt,M.tilt/SCE.tilt);
    if(c.bl){const w=sceEz((t-c.bl.t0)/c.bl.d);if(w>=1)c.bl=null;else{sceMix(A,c.bl.A,1-w);if(M.anim!=='idle'&&w<.9)A.pinch=false}}
    if(M.hop||M.sq){A.B=[A.B[0],A.B[1],A.B[2]+M.hop];A.s=(A.s||0)+M.sq}
    if(M.squint!=null)A.squint=Math.max(A.squint||0,M.squint);
    c.lastA=sceSnap(A)}})}
// sparks rising from the runes: a few all the time, a burst when you pick the hero
function sceEmber(c,burst){c.emb.push({x:(Math.random()*2-1)*(burst?16:19),y:(Math.random()*2-1)*3,vx:(Math.random()*2-1)*(burst?14:3),vy:-(burst?22+Math.random()*30:12+Math.random()*14),l:0,max:burst?.7+Math.random()*.6:1.2+Math.random()*1.2,s:burst?1.3:1})}
function sceCard(c,t,dt){const low=LOWFX||SCE.low,cv=c.cv,dpr=Math.min(window.devicePixelRatio||1,low?1.25:2),w=cv.clientWidth,h=cv.clientHeight;if(w<4||h<4)return;
  const W=Math.round(w*dpr),H=Math.round(h*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
  const x=cv.getContext('2d'),I=SCE_INFO[c.id],on=SCE.sel===c.id,k=Math.min(W/66,H/84);
  const saved=ctx,gt=G.t;ctx=x;G.t=t;
  try{x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,H);x.setTransform(k,0,0,k,W/2,H*.8);
    // a soft light from above on the one you picked
    if(on&&!low){const g=x.createLinearGradient(0,-80,0,8);g.addColorStop(0,`rgba(${I.rgb},0)`);g.addColorStop(1,`rgba(${I.rgb},.2)`);x.fillStyle=g;x.beginPath();x.moveTo(-12,-80);x.lineTo(12,-80);x.lineTo(30,6);x.lineTo(-30,6);x.closePath();x.fill()}
    c.rt=(c.rt||0)+dt*(on?1.6:1);drawRuneStone(0,0,1,I.rgb,c.rt);
    c.ember+=dt*(low?2:on?7:3);while(c.ember>1){c.ember--;sceEmber(c,false)}
    x.save();x.globalCompositeOperation='lighter';
    for(let i=c.emb.length-1;i>=0;i--){const e=c.emb[i];e.l+=dt;if(e.l>=e.max){c.emb.splice(i,1);continue}e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=.97;e.vy*=.985;
      const a=Math.sin(e.l/e.max*Math.PI);x.fillStyle=`rgba(${I.rgb},${.75*a})`;x.fillRect(e.x-.6*e.s,e.y-.6*e.s,1.2*e.s,1.2*e.s);if(!low)glow(I.rgb,e.x,e.y,3.2*e.s,.35*a)}
    x.restore();
    sceDrawHero(c,t,dt)}
  catch(e){if(!SCE.err){SCE.err=1;console.error(e)}}
  finally{ctx=saved;G.t=gt}}

// ------------------------------------------------------------------ the night behind: the crypt of the camp, far and blurred, fireflies
function sceBgImg(w,h){const k=w+'x'+h;if(SCE.bgK===k&&SCE.bgImg)return SCE.bgImg;const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0b1426');g.addColorStop(.42,'#131d24');g.addColorStop(.75,'#0f130f');g.addColorStop(1,'#060505');x.fillStyle=g;x.fillRect(0,0,w,h);
  try{x.globalAlpha=.3;x.drawImage(glowSprite('225,232,255'),w*.8-150,h*.07-150,300,300);x.globalAlpha=1;x.fillStyle='#e9ecf6';x.beginPath();x.arc(w*.8,h*.07,13,0,TAU);x.fill();
    x.fillStyle='rgba(0,0,0,.1)';x.beginPath();x.arc(w*.8-4,h*.07-3,4,0,TAU);x.arc(w*.8+5,h*.07+4,2.6,0,TAU);x.fill()}catch(e){}
  for(let i=0;i<70;i++){const sx=(i*97.3)%w,sy=(i*53.7)%(h*.38);x.fillStyle=`rgba(255,250,230,${.15+.45*((i*7)%10)/10})`;x.fillRect(sx,sy,1.2,1.2)}
  // the camp (the crypt with its gate), stretched across the bottom half, blurred and dark
  try{const im=tintBg(homeMode()),s=Math.max(w/360,h*.6/270)*1.05,iw=360*s,ih=270*s,t2=document.createElement('canvas');t2.width=w;t2.height=h;const y=t2.getContext('2d');
    y.drawImage(im,(w-iw)/2,h-ih*.98,iw,ih);const m=y.createLinearGradient(0,h-ih*.98,0,h);m.addColorStop(0,'rgba(0,0,0,0)');m.addColorStop(.32,'rgba(0,0,0,1)');m.addColorStop(1,'#000');
    y.globalCompositeOperation='destination-in';y.fillStyle=m;y.fillRect(0,0,w,h);
    if(HASF)x.filter='blur(3px) brightness(.5) saturate(.85)';else x.globalAlpha=.5;x.drawImage(t2,0,0);x.filter='none';x.globalAlpha=1}catch(e){}
  const v=x.createRadialGradient(w/2,h*.46,Math.min(w,h)*.25,w/2,h*.5,Math.max(w,h)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.72)');x.fillStyle=v;x.fillRect(0,0,w,h);
  SCE.bgK=k;return SCE.bgImg=c}
function sceBg(t){const cv=$('sceBg');if(!cv)return;const w=Math.max(1,cv.clientWidth|0),h=Math.max(1,cv.clientHeight|0);if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}
  const x=cv.getContext('2d');x.drawImage(sceBgImg(w,h),0,0);
  if(!SCE.flies){SCE.flies=[];for(let i=0;i<(LOWFX?8:20);i++)SCE.flies.push({x:Math.random(),y:.35+Math.random()*.65,s:.6+Math.random()*.9,ph:Math.random()*TAU,v:.01+Math.random()*.02})}
  x.save();x.globalCompositeOperation='lighter';
  for(const f of SCE.flies){const fx=(f.x+Math.sin(t*.3+f.ph)*.03)*w,fy=((f.y-t*f.v)%1+1)%1*h,a=(.35+.65*Math.max(0,Math.sin(t*1.7+f.ph*3)))*.55;
    try{x.globalAlpha=a*.5;x.drawImage(glowSprite('170,255,110'),fx-9*f.s,fy-9*f.s,18*f.s,18*f.s)}catch(e){}x.globalAlpha=a;x.fillStyle='#e8ffb0';x.fillRect(fx-.8,fy-.8,1.6,1.6)}
  x.restore()}
// one step of the screen (the tests step it by hand with SCE.manual, to look at every frame of a move)
function sceTick(dt){SCE.time+=dt;const t=SCE.time;try{sceBg(t)}catch(e){}for(const c of SCE.cards)sceCard(c,t,dt)}
// a slow phone (frames longer than 30 ms for a second and a half): smaller canvases and no glows, like LOWFX
function sceLoop(now){if(!SCE.on)return;const raw=Math.max(0,(now-SCE.last)/1000),dt=Math.min(.05,raw);SCE.last=now;
  if(!SCE.manual&&raw<.25&&SCE.time>.6){SCE.ema=(SCE.ema||raw)+(raw-(SCE.ema||raw))*.06;SCE.slow=SCE.ema>.03?(SCE.slow||0)+raw:0;if(SCE.slow>1.5)SCE.low=true}
  if(!SCE.manual)sceTick(dt);SCE.raf=requestAnimationFrame(sceLoop)}

// while you choose, the game under the choice does not draw (the intro is frozen anyway)
{const _l=loop;loop=function(now){if(SCE.on){last=now;requestAnimationFrame(loop);return}_l(now)}}
// at the very first launch the choice comes before everything
if(sceNeeded())sceOpen();
