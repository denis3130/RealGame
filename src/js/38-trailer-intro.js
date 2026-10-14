// =====================================================================
// THE TRAILER: 24 seconds of the real game, shot by shot, cut on the music.
// Everything on screen is the engine itself (same rooms, monsters, bosses, effects);
// a director only places the actors, moves the hero and the camera, and writes the big words.
// It never touches the save: a copy is taken before and put back after.
// The four heroes are in it (Denis, 14 October: «aggiungi anche gli altri pg nel filmato»): yours leads it (at the first launch, before
// the making of the hero, the Arciere), each of the other three has a world, and at the end all four stand together under the title.
// =====================================================================
const iEase=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
const iLerp=(a,b,k)=>a+(b-a)*clamp(k,0,1);
function iCam(z,x,y){const hw=AW/(2*z),hh=AH/(2*z);G.cam={z,x:clamp(x,hw,AW-hw),y:clamp(y,hh,AH-hh)}}
function iOnce(id){if(INTRO.st[id])return false;INTRO.st[id]=1;return true}
function iGoTo(x,y){INTRO.inp={x,y,m:Math.min(1,Math.hypot(x,y))}}
function iStop(){INTRO.inp={x:0,y:0,m:0}}
function iSay(txt,sub,col,dur){const el=$('iCap'),W=$('introScr').clientWidth||360,fsz=Math.round(Math.min(62,W*.86/(txt.length*.7)));
  el.innerHTML=`<b style="color:${col||'#ffd84a'};font-size:${fsz}px">${txt}</b>${sub?`<small>${sub}</small>`:''}`;el.style.setProperty('--d',(dur||1.7)+'s');
  el.classList.remove('go');void el.offsetWidth;el.classList.add('go')}
function iFlash(k){const el=$('iFlash');el.className='';void el.offsetWidth;el.className=k||'w'}
// the actors
function iFoe(type,x,y,spawn,o){const e=makeE(type,x,y,spawn==null?0:spawn);e.hp=e.max=P.atk*(o&&o.hp||.7);if(type==='skeleton'){e.sh=0;e.shMax=0}if(o&&o.cd!=null)e.cd=o.cd;G.enemies.push(e);return e}
// the cast: yours first, then the others (the other of the first two, the Balestriere, the Druida)
function iCast(){const main=SAVE.heroes&&SAVE.heroes[SAVE.hero]&&HERO_BY[SAVE.hero]?SAVE.hero:SAVE.starter==='cacciatrice'?'cacciatrice':'arciere';
  return[main,...['arciere','cacciatrice','balestriere','druida'].filter(i=>i!==main)]}
// the hero of the shot: only the look and the shots change (the numbers of the trailer stay)
function iAs(id){const h=HERO_BY[id];if(!h||!P)return;Object.assign(P,{hero:id,style:heroStyle0(id),proj:h.proj,pcol:h.pcol||null,pspd:h.proj==='bolt'?720:h.proj==='leaf'?520:560})}
// the others standing beside him at the end (drawn with the room, in depth order: 45-render)
function iDrawCast(a){drawRig(a.x,a.y,a.face,0,false,a.style,{})}
function iHero(){P=makeP();
  Object.assign(P,{hero:'arciere',proj:'arrow',pcol:null,pspd:560,wk:null,trail:null,kbm:1,style:heroStyle0('arciere'),atk:40,aspd:2.6,multi:2,front:1,diag:1,side:0,rear:0,fan:0,giant:0,
    crit:.25,critMul:2,maxhp:320,hp:320,need:1e9,ric:0,pierce:0,orbit:0,storm:false,light:0,fire:false,ice:false,dashMax:.3,dashCd:0,revive:0,shield:0,vamp:0,regen:0,poison:0,ult:0,spd:150});
  G={mode:'camp',chapter:1,room:2,gold:0,kills:0,t:4.9,fade:0,shake:0,state:'cine',bannerT:0,seq:[{c:2}],si:0,event:null,orbs:[],lvlT:0,curseHp:1,diff:1,arena:0,darkN:9,wheelAt:-1};
  G.pet={id:'muschietto',x:P.x-26,y:P.y+8,t:0,cd:1,hcd:0,face:-Math.PI/2,att:0,hop:0,happy:0,moving:false};INTRO.cast=null;iAs(iCast()[0])}
function iRoom(ch,room,o){o=o||{};
  Object.assign(G,{chapter:ch,room,event:null,seq:[{c:room}],si:0,cam:null,slowT:0,hitstop:0,ultFx:null,meteorRain:false,kc:0});
  buildRoom();G.state='cine';G.door=false;document.querySelectorAll('.kcPop').forEach(o=>o.remove());
  if(!o.keep)G.enemies=[];
  if(o.lay){const th=themeOf(room);G.rocks=o.lay.map(([x,y,r])=>({x,y,r,seed:Math.random()*10,kind:pickKind(th,r)}));fields={}}
  P.x=o.x==null?AW/2:o.x;P.y=o.y==null?BOT-90:o.y;P.face=o.face==null?-Math.PI/2:o.face;P.queue=[];P.inv=0;P.dashCd=0;P.dashT=0;P.ivx=P.ivy=0;P.spin=0;
  if(G.pet){G.pet.x=P.x-26;G.pet.y=P.y+10}iStop();INTRO.hold=!!o.hold;sfx('dash')}
function iLevelBurst(){sfx('levelup');for(let i=0;i<22;i++){const a=i/22*TAU;G.fx.push({k:'lvl',x:P.x,y:P.y-8,vx:Math.cos(a)*170,vy:Math.sin(a)*110,t:.5})}
  G.waves.push({x:P.x,y:P.y,r:6,max:90,dmg:0,hit:true,col:'lvl'});text(P.x,P.y-56,'LIVELLO SU!','#9cef5e',19)}
function iHiss(){if(!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.01;try{fNoise(t,.45,'highpass',2600,.7,.05,{f2:5600,att:.03});fNoise(t,.12,'bandpass',900,1,.04)}catch(e){}}

const SHOTS=[
  // 0 · the crypt is quiet. The hero takes a drag of his moss stick... then the skeletons wake up, and the stick falls.
  {at:0,setup(){iHero();iRoom(1,2,{hold:true,x:AW/2,y:470,face:Math.PI/2,lay:[[66,300,18],[294,300,18],[100,560,15],[260,560,15]]});INTRO.stick=true;INTRO.drop=null;INTRO.ex=null;iFlash('b');iCam(2.3,AW/2,458)},
   tick(lt){
    if(lt<2.2)iCam(iLerp(2.3,2.5,lt/2.2),AW/2,iLerp(458,452,lt/2.2));
    else if(lt<3.3){const k=iEase(Math.min(1,(lt-2.2)/.22));iCam(iLerp(2.5,3.3,k),AW/2+iLerp(0,4,k),iLerp(452,P.y-6,k))}
    else{const k=iEase(Math.min(1,(lt-3.3)/.7));iCam(iLerp(3.3,1,k),AW/2+iLerp(4,0,k),iLerp(P.y-6,AH/2,k))}
    if(lt>=1.7&&iOnce('wake')){sfx('creep',0,AW/2);for(const[t,x,y] of [['skeleton',100,170],['skeleton',180,140],['skeleton',260,170],['goblin',130,250],['goblin',230,250],['bat',60,220],['bat',300,220],['slime',150,330],['slime',210,330]])iFoe(t,x,y,1.4)}
    if(lt>=2.25&&iOnce('drop')){sfx('death','skeleton',AW/2);shake(1.5);G.slowT=.9;INTRO.stick=false;INTRO.drop={x:P.x+4.8,gy:P.y+9,t0:G.t};INTRO.ex=G.t}
    if(lt>=2.95&&iOnce('turn')){P.face=-Math.PI/2}
    if(lt>=3.3&&iOnce('whoosh'))sfx('dash')}},
  // 1 · first blood
  {at:4,setup(){INTRO.hold=false;iSay('COLPISCI!','','#ffd84a',1.6);G.cam=null},
   tick(lt){if(lt<.9)iStop();else if(lt<1.3)iGoTo(1,0);else iStop();
    if(lt>=.9&&iOnce('bats')){iFoe('bat',L+10,230,.3);iFoe('bat',R-10,200,.3);iFoe('slime',300,330,.5)}}},
  // 2 · the volcano: fireballs, bombs and meteors, and a hero who isn't there any more
  {at:6,setup(){iFlash('w');iRoom(2,2,{x:80,y:540,lay:[[66,250,18],[294,250,18]]});iAs(iCast()[1]);iSay('SCHIVA!','','#ff9a3c',1.6);
    iFoe('imp',120,170,0,{cd:.15});iFoe('imp',250,150,0,{cd:.35});iFoe('imp',300,300,0,{cd:.55});iFoe('pyro',180,230,0,{cd:.3});iFoe('bomber',70,330,0,{cd:.2});iFoe('magmaslime',230,420,0);iFoe('magmaslime',140,360,0);
    meteor(150,505,0,30,0);meteor(225,470,.15,30,0)},
   tick(lt){if(lt<.75)iGoTo(1,-.45);else if(lt<1.0)iGoTo(.2,-1);else iStop();
    if(lt>=.32&&iOnce('d1'))dash();if(lt>=.8&&iOnce('d2'))dash()}},
  // 3 · the swamp: arrows that bounce, lightning that jumps
  {at:8,setup(){iFlash('w');iRoom(3,2,{x:200,y:520,lay:[[66,260,16],[294,260,16]]});iAs(iCast()[2]);iSay('4 MONDI!','Cripta · Vulcano · Palude · Ghiaccio','#9cef5e',1.8);
    Object.assign(P,{ric:2,light:3,multi:2,front:2,diag:1});
    iFoe('frog',100,200);iFoe('frog',260,200);iFoe('frog',180,300);iFoe('mosquito',60,350);iFoe('mosquito',300,360);iFoe('mosquito',180,160);const c=iFoe('croc',120,400);c.st='out'},
   tick(lt){if(lt<.45)iGoTo(-.6,-.8);else iStop()}},
  // 4 · the ice: a level up, spinning blades, a hero who walks into the wolves
  {at:10,setup(){iFlash('w');iRoom(4,2,{x:AW/2,y:490,lay:[[80,230,18],[280,230,18]]});iAs(iCast()[3]);iSay('PIÙ FORTE!','a ogni livello','#8fe8ff',1.7);
    Object.assign(P,{ric:0,light:0,orbit:3,storm:true,multi:2,front:2,diag:2});iLevelBurst();
    iFoe('wolf',60,210,0,{cd:.2});iFoe('wolf',300,210,0,{cd:.35});iFoe('wolf',70,340,0,{cd:.1});iFoe('wolf',290,340,0,{cd:.25});iFoe('snowspirit',140,150);iFoe('snowspirit',220,150)},
   tick(lt){if(lt>.45&&lt<1.15)iGoTo(0,-1);else iStop()}},
  // 5 · the Golem falls from the ceiling
  {at:12,setup(){iFlash('w');iRoom(1,5,{x:AW/2,y:530,hold:true});iAs(iCast()[0]);Object.assign(P,{orbit:0,storm:false,front:1,diag:1});iCam(1,AW/2,AH/2)},
   tick(lt){
    if(lt<2)iCam(iLerp(1,1.1,lt/2),AW/2,iLerp(320,340,lt/2));else if(lt<2.15)iCam(iLerp(1.1,1.22,(lt-2)/.15),AW/2,340);else iCam(iLerp(1.22,1.06,(lt-2.15)/.5)+Math.max(0,lt-2.65)*.04,AW/2,340);
    if(lt>=.85&&iOnce('golem')){const e=makeE('golem',AW/2,250,0);e.hp=e.max=99999;G.enemies.push(e)}
    if(lt>=2&&iOnce('cap'))iSay('BOSS GIGANTI!','','#ff6a4a',1.8)}},
  // 6 · the Hydra rises from the swamp
  {at:16,setup(){iFlash('w');iRoom(3,10,{x:AW/2,y:545,hold:true,keep:true});for(const e of G.enemies){e.hp=e.max=99999}iCam(1,AW/2,AH/2)},
   tick(lt){iCam(iLerp(1,1.16,iEase(Math.min(1,lt/2))),AW/2,iLerp(320,300,lt/2))}},
  // 7 · the final blow: the Yeti is furious, the hero unleashes the rain of arrows
  {at:18,setup(){iFlash('w');iRoom(4,5,{x:AW/2,y:530,hold:true,keep:true});
    for(const e of G.enemies){Object.assign(e,{intro:0,iT:99,yy:null,z:0,em:null,fa:null,hole:0,y:250,st:'walk',stT:2.5,hp:P.atk*1.4})}P.ult=100},
   tick(lt){if(lt>=.15&&iOnce('ult')){useUlt();iSay('SUPER ABILITÀ!','','#7fffe0',1.05)}
    if(lt>=.95&&iOnce('safety')){const b=G.enemies.find(e=>isBoss(e.type)&&!e.dead);if(b)hurtE(b,b.hp+1,true)}}},
  // 8 · the title
  {at:20,setup(){$('introScr').classList.add('logo');const bd=$('bossDown');if(!bd.hidden){bd.classList.add('out');setTimeout(()=>{bd.hidden=true},400)}iFlash('w');INTRO.hold=true;iStop();
    INTRO.camFrom=G.cam?{...G.cam}:{z:1,x:AW/2,y:AH/2};
    // (the companion steps out of the picture: the four heroes stand alone)
    const C=iCast();P.x=clamp(P.x,L+70,R-110);P.face=Math.PI/2;INTRO.gx=P.x+18;G.pet=null;
    INTRO.cast=[[C[1],-36,.2],[C[2],36,-.12],[C[3],72,-.24]].map(([id,dx,f])=>({id,x:P.x+dx,y:P.y,face:Math.PI/2+f,style:heroStyle0(id)}))},
   tick(lt){const f=INTRO.camFrom,k=iEase(Math.min(1,lt/4.5));iCam(iLerp(f.z,1.7,k),iLerp(f.x,INTRO.gx||P.x,k),iLerp(f.y,P.y-30,k))}}];

// the trailer score: a heartbeat, four worlds (one bar each), the giants, the final blow, the title
TRACKS.trailer={bpm:120,
  mel:[[[0,76,3],[3,76,1],[4,79,2],[6,81,2],[8,84,4],[12,83,2],[14,81,2]],[[0,77,3],[3,77,1],[4,81,2],[6,84,2],[8,86,4],[12,84,2],[14,81,2]],
       [[0,79,3],[3,79,1],[4,83,2],[6,86,2],[8,91,4],[12,86,2],[14,83,2]],[[0,80,4],[4,83,4],[8,88,6],[14,86,2]]],
  play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16);if(bar>=12)return;
    if(bar<2){
      if(step===0)vPad(tr,t,[45,52,57],spb*32,.13,420);
      if(step===16)vChoir(tr,t,[57,60,64],spb*16,.08);
      if(s===0||s===3)dTaiko(tr,t,(s===0?.3:.18)*(bar?1.35:1));
      if(step===18)vBell(tr,t,88,1.8,.05);
      if(bar===1&&s>=8){dTom(tr,t,.06+(s-8)*.035,150+(s-8)*14);if(s>=12)dShaker(tr,t,.03+(s-12)*.02)}
      return}
    if(bar<6){const R=[45,41,43,40][bar-2],C=[[57,60,64],[57,60,65],[55,59,62],[56,59,64]][bar-2];
      if(s===0){vPad(tr,t,C,spb*16,.1,1300);vBrass(tr,t,R+12,spb*2.5,.1);vBrass(tr,t,R+19,spb*2.5,.07);dTaiko(tr,t,.95)}
      if(s%2===0)vBass(tr,t,R+(s%8===6?12:0),spb*1.7,.22);
      vHarp(tr,t,C[s%3]+12+(s%8>=4?12:0),.35,.04);
      for(const[ss,m,l] of this.mel[bar-2])if(ss===s)vBrass(tr,t,m-12,spb*l*.92,.065);
      if(s===3||s===6||s===8||s===10||s===11||s===14)dTaiko(tr,t,{3:.5,6:.6,8:.8,10:.45,11:.5,14:.65}[s]);
      if(s===4||s===12)dFrame(tr,t,.5);dShaker(tr,t,s%2?.05:.03);return}
    if(bar===6){
      if(s===0){vPad(tr,t,[33,40,45],spb*16,.16,300);vChoir(tr,t,[45,48,52],spb*16,.1);dDrum(tr,t,.7,70,30,1.2,200,.4)}
      if(s===8)dDrum(tr,t,.5,70,30,1,200,.3);
      if(s%4===0)vBell(tr,t,93,.5,.025);
      if(s>=10)dTom(tr,t,.08+(s-10)*.045,120+(s-10)*20);return}
    if(bar===7||bar===8){const R=bar===7?33:29,C=bar===7?[57,60,64]:[53,57,60];
      if(s===0){dDrum(tr,t,1,95,28,1.4,300,.6);dTaiko(tr,t,1);vChoir(tr,t,C,spb*16,.14);vBrass(tr,t,R+12,spb*6,.12);vBrass(tr,t,R+19,spb*6,.09);vBass(tr,t,R,spb*14,.3)}
      if(s===8)dTaiko(tr,t,.85);if(s===4||s===12)dFrame(tr,t,.6);if(s===14||s===15)dTom(tr,t,.3,s===14?140:110);
      if(s%4===2)vBass(tr,t,R+12,spb*1.5,.15);dShaker(tr,t,s%2?.03:.015);return}
    if(bar===9){
      if(s===0){vPad(tr,t,[56,59,64],spb*16,.1,1500);vBrass(tr,t,52,spb*2,.1);dTaiko(tr,t,1)}
      if(s%2===0)vBass(tr,t,40+(s%4?12:0),spb*1.5,.22);
      if([3,6,8,10,11,13,14,15].includes(s))dTaiko(tr,t,.4+s*.035);if(s===4||s===12)dFrame(tr,t,.55);dShaker(tr,t,.05);
      if(s>=8)vBrass(tr,t,64+[0,2,4,5,7,9,11,12][s-8],spb*.9,.06);return}
    if(step===160){dDrum(tr,t,1,90,30,1.6,300,.7);dTaiko(tr,t,1);vChoir(tr,t,[57,61,64,69],spb*32,.16);vBrass(tr,t,45,spb*8,.13);vBrass(tr,t,52,spb*8,.1);vBrass(tr,t,57,spb*8,.08);vBass(tr,t,33,spb*28,.3);vBell(tr,t,81,3,.06);vBell(tr,t,88,3,.04)}
    if(bar===10&&s%4===0&&s)vHarp(tr,t,[69,73,76,81][s/4|0],1.6,.06);
    if(bar===11&&s===0)vHarp(tr,t,81,2.4,.05)}};

function playIntro(force){if(INTRO.on)return true;if(!force&&SAVE.introSeen)return false;if(started&&$('menu').hidden)return false;
  INTRO.snap=JSON.stringify(SAVE);INTRO.on=true;INTRO.shot=-1;INTRO.st={};INTRO.t=0;
  $('menu').hidden=true;$('endScr').hidden=true;$('pauseScr').hidden=true;$('sheetScr').hidden=true;$('wrap').classList.remove('inmenu');$('wrap').classList.add('intro');
  const sc=$('introScr');sc.hidden=false;sc.className='';$('iCap').className='';
  started=true;paused=true;iHero();iRoom(1,2,{hold:true,x:AW/2,y:470,face:Math.PI/2});G.cam={z:2.3,x:AW/2,y:458};INTRO.stick=true;
  if(!AU.ctx||AU.ctx.state!=='running'){INTRO.splash=true;sc.classList.add('splash')}else iGo();
  return true}
function iGo(){if(!INTRO.on)return;INTRO.splash=false;$('introScr').classList.remove('splash');initAudio();duckMusic(1);
  INTRO.start=performance.now()+120;INTRO.last=performance.now();INTRO.shot=-1;paused=false;playMusic('trailer')}
function introTick(now){if(!INTRO.on||INTRO.splash)return;
  if(now-INTRO.last>250)INTRO.start+=now-INTRO.last-16;// the tab slept: the film waits
  INTRO.last=now;const t=(now-INTRO.start)/1000;INTRO.t=t;if(t<0)return;
  let k=0;for(let i=0;i<SHOTS.length;i++)if(t>=SHOTS[i].at)k=i;
  if(k!==INTRO.shot){INTRO.shot=k;INTRO.st={};SHOTS[k].setup()}
  SHOTS[k].tick(t-SHOTS[k].at,t);P.hp=P.maxhp;
  if(t>=INTRO.end)introEnd()}
function introEnd(){if(!INTRO.on)return;INTRO.on=false;INTRO.splash=false;
  const sc=$('introScr');sc.hidden=true;sc.className='';$('iCap').className='';$('wrap').classList.remove('intro');
  if(INTRO.snap){try{const s=JSON.parse(INTRO.snap);for(const k of Object.keys(SAVE))delete SAVE[k];Object.assign(SAVE,s)}catch(e){}INTRO.snap=null}
  SAVE.introSeen=1;save();
  const bd=$('bossDown');bd.hidden=true;bd.classList.remove('out');clearTimeout(bossDown.t);document.querySelectorAll('.kcPop').forEach(o=>o.remove());
  bannerEl.classList.remove('show');$('bossBar').hidden=true;INTRO.drop=null;INTRO.ex=null;INTRO.stick=false;INTRO.cast=null;mossOn=0;
  started=false;paused=true;newRun();initAudio();showMenu()}
// the moss stick, once it has fallen from his mouth: drops, bounces, glows on the floor, then goes out
function introWorld(){if(INTRO.ex!=null){const t=G.t-INTRO.ex;if(t<.8){const sc=t<.1?t/.1*1.35:1.35-.35*Math.min(1,(t-.1)/.12),a=t<.62?1:1-(t-.62)/.18;
    ctx.save();ctx.globalAlpha=Math.max(0,a);ctx.translate(P.x+11,P.y-38);ctx.rotate(.12);ctx.scale(sc,sc);ctx.font='19px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=4.5;ctx.strokeStyle=INK;ctx.strokeText('!',0,0);ctx.fillStyle='#ffd84a';ctx.fillText('!',0,0);ctx.restore()}}
  const d=INTRO.drop;if(!d)return;const t=G.t-d.t0;let z,rot,dx;
  if(t<.34){const k=t/.34;z=18.5*(1-k*k);rot=.42+k*1.6;dx=k*5}
  else if(t<.52){const k=(t-.34)/.18;z=4*Math.sin(k*Math.PI);rot=2.02+k*.5;dx=5+k*3}else{z=0;rot=2.52;dx=8}
  if(t>=.34&&!d.tic){d.tic=1;sfx('click',0,d.x);G.fx.push({k:'spark',x:d.x+dx,y:d.gy,t:.18})}
  const lit=t<.62?1:Math.max(0,1-(t-.62)/.2);if(lit<=0&&!d.out){d.out=1;iHiss();for(let i=0;i<3;i++)G.fx.push({k:'puff',x:d.x+dx+3,y:d.gy-2,vx:rand(-6,6),vy:-14,t:.6,r:2.5})}
  const x=d.x+dx,y=d.gy-z;ctx.fillStyle=`rgba(0,0,0,${.25*(1-z/19)})`;ell(d.x+dx,d.gy+1,4,1.4);ctx.fill();
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);mossRect(-2.9,-.95,5.8,1.9,.9);ctx.fillStyle=lit>0?'#4f8a34':'#3d5a2c';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#8fd14f';ctx.fillRect(-2,-.5,.8,.55);ctx.fillRect(-.4,-.1,.8,.55);
  if(lit>0){ctx.globalCompositeOperation='lighter';glow('150,255,90',2.9,0,5*lit,.6*lit);ctx.globalCompositeOperation='source-over';ctx.fillStyle='#c9ff7a';circ(2.9,0,.95*lit);ctx.fill()}
  ctx.restore();
  if(lit>0)for(let k=0;k<3;k++){const q=(G.t*.42+k/3)%1,tx=x+Math.cos(rot)*2.9,ty=y+Math.sin(rot)*2.9;ctx.fillStyle=`rgba(185,238,150,${(1-q)*.3*lit})`;circ(tx+q*2+Math.sin(G.t*2.1+k*2)*1.6*q,ty-1.5-q*12,.55+q*2);ctx.fill()}}
$('iSkip').addEventListener('click',e=>{e.stopPropagation();initAudio();introEnd()});
$('iPlay').addEventListener('click',e=>{e.stopPropagation();introEnd()});
$('introScr').addEventListener('pointerdown',e=>{if(INTRO.splash&&!e.target.closest('#iSkip')){e.preventDefault();iGo()}});
addEventListener('keydown',e=>{if(!INTRO.on)return;if(e.code==='Escape')introEnd();else if(INTRO.splash&&(e.code==='Enter'||e.code==='Space'))iGo()});


