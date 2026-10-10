// Mossbound — poligono di prova delle armi zombie: the hero with the guns, zombies rising from the ground, ammunition, the Bara delle
// Sorprese. Uses the game's own drawing and sound code (shim.js) and the weapons code (armi.js, window.ARMI).
(()=>{
const A=ARMI,$=id=>document.getElementById(id),cv=$('cv'),C2=cv.getContext('2d');
const AW=300,AH=500,L=12,R=AW-12,TOP=52,BOT=AH-12;
let DPR=1,SC=1;
function resize(){const w=cv.clientWidth||AW;DPR=Math.min(3,window.devicePixelRatio||1);SC=w/AW;cv.width=Math.round(AW*SC*DPR);cv.height=Math.round(AH*SC*DPR)}
window.addEventListener('resize',resize);
// ---------------------------------------------------------------- pictures
const IMG={};function img(src){if(IMG[src])return IMG[src];const im=new Image();im.src=src;IMG[src]=im;return im}
const HERO_A=img('eroe_a.webp'),HERO_B=img('eroe_b.webp');
const ZD={zombie:{n:'Zombie della cripta',walk:{im:img('mostri/zombie_walk.webp'),n:8,fps:8},attack:{im:img('mostri/zombie_attack.webp'),n:8,fps:10},cell:136,foot:[68,116],hp:120,spd:19,r:10,h:44,coin:25},
  strisciante:{n:'Zombie strisciante',walk:{im:img('mostri/strisciante_walk.webp'),n:8,fps:6},cell:120,foot:[60,75.3],hp:90,spd:14,r:11,h:20,coin:25},
  hound:{n:'Segugio infernale',walk:{im:img('mostri/hound_walk.webp'),n:12,fps:18},cell:132,foot:[66,111.3],hp:70,spd:46,r:11,h:30,coin:35}};
// sheet rows: front, front-right, right, back-right, back, back-left, left, front-left
const rowOf=a=>((Math.round((Math.PI/2-a)/(Math.PI/4))%8)+8)%8;
// ---------------------------------------------------------------- the floor (drawn once): dark earth and old stones of a graveyard
const floor=document.createElement('canvas');
function makeFloor(){const K=2;floor.width=AW*K;floor.height=AH*K;const g=floor.getContext('2d');g.scale(K,K);
  g.fillStyle='#3a3027';g.fillRect(0,0,AW,AH);let s=7;const r=()=>(s=(s*9301+49297)%233280)/233280;
  for(let i=0;i<260;i++){const x=r()*AW,y=r()*AH,w=10+r()*16,h=7+r()*9;g.fillStyle=`rgba(${70+r()*30|0},${60+r()*24|0},${48+r()*20|0},${.35+r()*.3})`;g.beginPath();g.ellipse(x,y,w*.5,h*.5,r()*.6-.3,0,Math.PI*2);g.fill();
    g.strokeStyle='rgba(20,14,10,.35)';g.lineWidth=1;g.stroke()}
  for(let i=0;i<40;i++){const x=r()*AW,y=r()*AH;g.fillStyle=`rgba(90,120,50,${.12+r()*.15})`;g.beginPath();g.ellipse(x,y,8+r()*14,4+r()*6,0,0,Math.PI*2);g.fill()}
  for(let i=0;i<120;i++){const x=r()*AW,y=r()*AH;g.strokeStyle=`rgba(110,140,60,${.25+r()*.3})`;g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*3,y-3-r()*4);g.stroke()}
  // the walls of the yard: a low stone border
  g.fillStyle='#231c16';g.fillRect(0,0,AW,TOP-6);g.fillRect(0,0,L-2,AH);g.fillRect(R+2,0,AW,AH);g.fillRect(0,BOT+2,AW,AH);
  for(let x=0;x<AW;x+=24){g.fillStyle='#4a4038';g.fillRect(x+1,TOP-20,22,14);g.strokeStyle='#15100c';g.lineWidth=2;g.strokeRect(x+1,TOP-20,22,14);g.fillStyle='rgba(255,240,210,.1)';g.fillRect(x+3,TOP-18,18,3)}
  const vg=g.createRadialGradient(AW/2,AH*.55,AH*.2,AW/2,AH*.55,AH*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.5)');g.fillStyle=vg;g.fillRect(0,0,AW,AH)}
// gravestones along the top wall (behind everything)
const STONES=[[30,58,1],[104,56,.9],[198,57,1.1],[268,59,.95]];
function lapide(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ink(2.5);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,1,11,3.5,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(-9,-16);ctx.quadraticCurveTo(-9,-25,0,-25);ctx.quadraticCurveTo(9,-25,9,-16);ctx.lineTo(9,0);ctx.closePath();ctx.fillStyle='#7d7a72';ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,245,225,.18)';ctx.fillRect(-7,-21,3,18);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(4,-20,4,19);ctx.strokeStyle='rgba(30,26,22,.6)';ctx.lineWidth=1.4;
  ctx.beginPath();ctx.moveTo(-4,-14);ctx.lineTo(4,-14);ctx.moveTo(-4,-10);ctx.lineTo(3,-10);ctx.stroke();ctx.fillStyle='rgba(110,150,60,.7)';ctx.beginPath();ctx.ellipse(-5,-1,5,2.4,0,0,Math.PI*2);ctx.fill();ctx.restore()}
// ---------------------------------------------------------------- state
const ST={coins:1500,kills:0,t:0,shake:0,msg:null,next:false,started:false};
const hero={x:150,y:400,face:-Math.PI/2,walk:0,moving:false,gun:'pistola',guns:{},aim:-Math.PI/2,fire:false};
function gunCtl(id){return hero.guns[id]||(hero.guns[id]=A.nuova(id))}
gunCtl('pistola');
const Z=[],BUL=[],ROCK=[],PICK=[],TXT=[],FLY=[];
const SPOTS=[[82,150],[220,158],[80,302],[222,312]];let spot=0;
const bara=A.nuovaBara(SPOTS[0][0],SPOTS[0][1]);
// ---------------------------------------------------------------- input
const keys={},ptr={x:AW/2,y:200,down:false,id:null,mouse:false},joy={on:false,id:null,x0:0,y0:0,x:0,y:0},TOUCH=matchMedia('(pointer:coarse)').matches;
const JOY={x:54,y:AH-60,r:38},BTN={fire:{x:AW-50,y:AH-64,r:32,lab:'Spara'},rel:{x:AW-40,y:AH-130,r:23,lab:'Ricarica'},use:{x:AW-96,y:AH-122,r:23,lab:'Bara'}};
function toLocal(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*AW,(e.clientY-r.top)/r.height*AH]}
const near=(p,b)=>Math.hypot(p[0]-b.x,p[1]-b.y)<b.r+6;
cv.addEventListener('pointerdown',e=>{e.preventDefault();start();const p=toLocal(e);cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);
  if(e.pointerType==='touch'||TOUCH){if(near(p,BTN.rel)){reload();return}if(near(p,BTN.use)){useBara();return}
    if(Math.hypot(p[0]-JOY.x,p[1]-JOY.y)<JOY.r*1.5&&!joy.on){joy.on=true;joy.id=e.pointerId;joy.x0=JOY.x;joy.y0=JOY.y;joy.x=p[0];joy.y=p[1];return}
    if(near(p,BTN.fire)){ptr.down=true;ptr.id=e.pointerId;ptr.auto=true;return}}
  if(tapBara(p))return;
  ptr.down=true;ptr.id=e.pointerId;ptr.auto=false;ptr.x=p[0];ptr.y=p[1];ptr.mouse=e.pointerType==='mouse'});
cv.addEventListener('pointermove',e=>{const p=toLocal(e);if(joy.on&&e.pointerId===joy.id){joy.x=p[0];joy.y=p[1];return}
  if(e.pointerType==='mouse'){ptr.mouse=true;ptr.x=p[0];ptr.y=p[1]}else if(ptr.down&&e.pointerId===ptr.id&&!ptr.auto){ptr.x=p[0];ptr.y=p[1]}});
const up=e=>{if(joy.on&&e.pointerId===joy.id){joy.on=false;return}if(e.pointerId===ptr.id){ptr.down=false;ptr.id=null}};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('keydown',e=>{if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON')&&e.key===' ')return;const k=e.key.toLowerCase();keys[k]=true;
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();start();
  if(k==='r')reload();if(k==='e')useBara();const n=parseInt(k);if(n>=1&&n<=8)equip(A.ORDINE[n-1]);if(k==='q')cycle(-1)});
window.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
cv.addEventListener('wheel',e=>{e.preventDefault();cycle(e.deltaY>0?1:-1)},{passive:false});
function start(){initAudio();if(!ST.started){ST.started=true;$('start').hidden=true;const r=cv.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)cv.parentElement.scrollIntoView({block:'center',behavior:'smooth'})}}
// ---------------------------------------------------------------- the guns in hand
function equip(id){if(!id||hero.gun===id)return;const g0=hero.guns[hero.gun];if(g0){g0.annulla();if(g0.mot){g0.spinV=0;A.motore(g0,hero.x)}}hero.gun=id;gunCtl(id);
  A.suono(id,'presa',hero.x);chips();}
function cycle(d){const i=A.ORDINE.indexOf(hero.gun);equip(A.ORDINE[(i+d+8)%8])}
function reload(){start();const g=gunCtl(hero.gun);g.ricarica()}
// ---------------------------------------------------------------- the coffin
function useBara(){start();if(bara.st==='offre'){bara.prendi();return}if(!bara.vicino(hero.x,hero.y)){say('Avvicinati alla bara');return}
  if(bara.st!=='ferma')return;if(ST.coins<A.BARA.prezzo){say('Servono '+A.BARA.prezzo+' monete');return}
  ST.coins-=A.BARA.prezzo;bara.paga(hero.x,hero.y,hero.gun);if(ST.next){bara.forza(true);ST.next=false;$('fuga').checked=false}}
function tapBara(p){const dx=p[0]-bara.x,dy=p[1]-(bara.y-14);if(Math.abs(dx)<44&&Math.abs(dy)<34&&(bara.st==='offre'||bara.st==='ferma'&&bara.vicino(hero.x,hero.y))){useBara();return true}return false}
function say(t){ST.msg={t,life:2}}
// ---------------------------------------------------------------- zombies
let spawnT=1.2;
function spawn(){const kinds=['zombie','zombie','zombie','strisciante','strisciante','hound'],k=kinds[Math.random()*kinds.length|0],D=ZD[k];
  for(let tries=0;tries<20;tries++){const x=L+24+Math.random()*(R-L-48),y=TOP+26+Math.random()*(AH*.46);
    if(Math.hypot(x-hero.x,y-hero.y)<130||Math.hypot(x-bara.x,(y-bara.y)*1.4)<60||Z.some(z=>Math.hypot(z.x-x,z.y-y)<30))continue;
    Z.push({k,D,x,y,hp:D.hp,face:Math.atan2(hero.y-y,hero.x-x),st:'sale',t:0,ft:Math.random()*5,hit:0,vx:0,vy:0,id:Math.random()});
    gemito(x,.6);return}}
// a zombie's groan as it comes out of the ground: a low hoarse voice through two vowel shapes, wobbling, and the earth crumbling
function gemito(x,v){if(!AU.ctx||!AU.on.sfx)return;const c=AU.ctx,t=c.currentTime+.01,f0=VR(95,.15),o=osc('sawtooth',f0,t,t+1),f1=filt('bandpass',VR(420,.1),4),f2=filt('bandpass',VR(950,.1),6),gg=c.createGain(),lf=osc('sine',5.5,t,t+1),lg=c.createGain();
  AU.pan=Math.max(-.7,Math.min(.7,(x-180)/200));lg.gain.value=6;lf.connect(lg);lg.connect(o.frequency);o.frequency.setValueAtTime(f0,t);o.frequency.linearRampToValueAtTime(f0*.78,t+.9);o.connect(f1);o.connect(f2);f1.connect(gg);f2.connect(gg);
  gg.gain.setValueAtTime(.0001,t);gg.gain.linearRampToValueAtTime(.09*v,t+.18);gg.gain.exponentialRampToValueAtTime(.0005,t+.95);route(gg,null,.35);
  fNoise(t,.6,'lowpass',420,.7,.22*v,{brown:true,att:.08});for(let i=0;i<3;i++)M.stone(t+.08+i*.16,.28*v);AU.pan=0}
function hurt(z,dmg,dx,dy,kb){if(z.st==='muore')return;z.hp-=dmg;z.hit=1;const l=Math.hypot(dx,dy)||1;z.vx+=dx/l*kb;z.vy+=dy/l*kb;
  TXT.push({x:z.x+(Math.random()-.5)*8,y:z.y-z.D.h-4,t:0,txt:String(Math.round(dmg)),col:dmg>=50?'#ffd86b':'#fff6e6'});
  A.fxAdd({k:'schizzo',x:z.x,y:z.y-z.D.h*.5,life:.4,seed:Math.random()*6,col:'rgba(150,205,80,.95)'});
  if(z.hp<=0){z.st='muore';z.t=0;ST.kills++;const c=z.D.coin;ST.coins+=c;TXT.push({x:z.x,y:z.y-z.D.h-14,t:0,txt:'+'+c,col:'#ffd23f',coin:true});
    if(Math.random()<.22)PICK.push({x:z.x,y:z.y,tipo:dropType(),t:0});
    if(AU.ctx){const t=AU.ctx.currentTime;M.flesh(t,1.2);M.bone(t+.05,.8)}}
  else if(AU.ctx&&Math.random()<.6)M.flesh(AU.ctx.currentTime,.6)}
// what the boxes hold: often the ammunition of the gun in hand
function dropType(){const mine=A.DATI[hero.gun].mun;if(Math.random()<.6)return mine;const all=['piccole','grosse','cartucce','razzi'];return all[Math.random()*4|0]}
const AMMO_OF={piccole:['pistola','revolver','mitraglietta'],grosse:['mitra','mitragliatrice'],cartucce:['pompa','tattica'],razzi:['lanciarazzi']};
// ---------------------------------------------------------------- shooting
function heroB(){return basis(hero.face)}
function heroBob(){return hero.moving?Math.abs(Math.sin(walkQ()))*1.6:0}
const walkQ=()=>Math.floor(((hero.walk%(Math.PI*2))+Math.PI*2)%(Math.PI*2)/(Math.PI*2)*8)/8*Math.PI*2;
// a point of the gun (from inManoPunti, the hero's frame) on the screen
function rigPt(q){const B=heroB();return[hero.x+q[0]*B.f,hero.y-heroBob()+q[1]]}
function fire(ev,g){const id=hero.gun,D=A.DATI[id],B=heroB(),P=A.inManoPunti(id,B,g.pose()),mz=rigPt(P.muzzle),ang=hero.aim;
  if(id==='lanciarazzi'){ROCK.push({x:mz[0],y:mz[1],ang:ang+(ev.ang[0]||0),v:D.spd,t:0,d:0,smk:0});const bk=rigPt(P.back);
    for(let i=0;i<6;i++)A.fxAdd({k:'fumo',x:bk[0],y:bk[1],r:7+Math.random()*5,life:.9+Math.random()*.4,vx:-Math.cos(ang)*(40+Math.random()*40)+(Math.random()-.5)*30,vy:-Math.sin(ang)*(40+Math.random()*40)+(Math.random()-.5)*30,drag:3,dark:false});
    ST.shake=Math.max(ST.shake,.25);return}
  for(const da of ev.ang){const a=ang+da,sp=D.spd*(D.pel>1?(.85+Math.random()*.3):1);BUL.push({x:mz[0],y:mz[1],vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,kind:D.colpo,dmg:D.dmg,pierce:D.pierce||0,hits:[],d:0,range:D.range*(D.pel>1?(.8+Math.random()*.35):1),id})}
  A.fxAdd({k:'fumo',x:mz[0]+Math.cos(ang)*4,y:mz[1]+Math.sin(ang)*4,r:D.pel>1?6:3.5,life:.45,vx:Math.cos(ang)*14,vy:Math.sin(ang)*14-6,drag:4});
  if(D.pel>1||id==='revolver')ST.shake=Math.max(ST.shake,.12)}
function gunEvents(ev,g){const id=hero.gun,B=heroB(),P=A.inManoPunti(id,B,g.pose()),qa=B.qa,fl=Math.cos(qa)<-.02?-1:1,feet=hero.y+8;
  for(const e of ev){if(e.k==='sparo')fire(e,g);
    else if(e.k==='suono')A.suono(id,e.w,hero.x);
    else if(e.k==='bossolo'){const q=rigPt(id==='revolver'?P.mag:P.eject||P.muzzle);A.espelli(id,q[0],q[1],qa,fl,Math.max(2,feet-q[1]),e.n)}
    else if(e.k==='caricatore'){const q=rigPt(P.mag);A.espelliCar(id,q[0],q[1],qa,fl,Math.max(2,feet-q[1]))}}}
// cases ringing on the floor when they bounce
const _fxAdd=A.fxAdd;
function onBounce(p){if(!AU.ctx)return;if(p.k==='bossolo'){if(p.b<=1&&Math.random()<.7)A.suono(p.kind==='ottone'?'pistola':'pompa','bossolo',p.x)}else if(p.k==='caricatore'&&p.b<=1){const t=AU.ctx.currentTime;M.metal(t,.35,p.id==='mitragliatrice'?380:760,.3);fThump(t,220,110,.06,.25)}}
// ---------------------------------------------------------------- update
function update(dt){ST.t+=dt;G.t=ST.t;
  // move
  let mx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),my=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
  if(joy.on){const dx=joy.x-joy.x0,dy=joy.y-joy.y0,l=Math.hypot(dx,dy);if(l>6){mx=dx/Math.max(l,JOY.r);my=dy/Math.max(l,JOY.r)}}
  const ml=Math.hypot(mx,my),D=A.DATI[hero.gun],spd=92*(1-(D.slow||0));hero.moving=ml>.1;
  if(hero.moving){const k=Math.min(1,ml);hero.x+=mx/ml*k*spd*dt;hero.y+=my/ml*k*spd*dt;hero.walk+=dt*spd*.11;
    hero.x=Math.max(L+12,Math.min(R-12,hero.x));hero.y=Math.max(TOP+14,Math.min(BOT-10,hero.y));
    // the coffin is solid
    const dx=hero.x-bara.x,dy=(hero.y-bara.y)*2;if(bara.st!=='sotto'&&Math.abs(dx)<36&&Math.abs(dy)<26){if(Math.abs(dx)/36>Math.abs(dy)/26)hero.x=bara.x+Math.sign(dx)*36;else hero.y=bara.y+Math.sign(dy)*13}}
  // aim: the mouse, the finger, or the nearest zombie with the fire button; else where it walks
  let aimSet=false;
  if(ptr.down&&ptr.auto){let best=null,bd=1e9;for(const z of Z){if(z.st==='muore'||z.st==='sale')continue;const d=Math.hypot(z.x-hero.x,z.y-hero.y);if(d<bd){bd=d;best=z}}
    if(best){hero.aim=Math.atan2(best.y-best.D.h*.5-(hero.y-10),best.x-hero.x);aimSet=true}}
  if(!aimSet&&ptr.down&&!ptr.auto||!aimSet&&ptr.mouse){hero.aim=Math.atan2(ptr.y-(hero.y-8),ptr.x-hero.x);aimSet=true}
  if(!aimSet&&hero.moving)hero.aim=Math.atan2(my,mx);
  hero.face=hero.aim;
  // the guns: the one in hand fires; holding the trigger keeps firing (each frame is a new press for the single-shot ones)
  const g=gunCtl(hero.gun),hold=ptr.down||!!keys[' '];if(hold&&!g.D.auto&&g.mag>0&&g.st!=='ricarica')g.prev=false;
  const ev=g.update(dt,hold);gunEvents(ev,g);A.motore(g,hero.x);
  for(const id in hero.guns)if(id!==hero.gun){const o=hero.guns[id];o.update(dt,false)}
  if(g.mag<=0&&g.res<=0&&hold&&!ST.msg)say('Munizioni finite: raccogli le casse!');
  // bullets
  for(let i=BUL.length-1;i>=0;i--){const b=BUL[i],sx=b.vx*dt,sy=b.vy*dt;b.x+=sx;b.y+=sy;b.d+=Math.hypot(sx,sy);let dead=false;
    for(const z of Z){if(z.st==='muore'||z.st==='sale'||b.hits.includes(z))continue;const cx=z.x,cy=z.y-z.D.h*.5,dx=cx-b.x,dy=cy-b.y;
      if(dx*dx+dy*dy<(z.D.r+3)*(z.D.r+3)){b.hits.push(z);hurt(z,b.dmg,b.vx,b.vy,b.kind==='pal'?22:b.kind==='p44'?30:12);if(b.hits.length>b.pierce){dead=true;break}}}
    if(!dead&&(b.x<L||b.x>R||b.y<TOP-10||b.y>BOT)){dead=true;A.fxAdd({k:'scintille',x:b.x,y:b.y,life:.25,seed:Math.random()*9})}
    if(!dead&&b.d>b.range)dead=true;if(dead)BUL.splice(i,1)}
  // rockets
  for(let i=ROCK.length-1;i>=0;i--){const r=ROCK[i],D=A.DATI.lanciarazzi;r.t+=dt;r.v+=D.acc*dt;const sx=Math.cos(r.ang)*r.v*dt,sy=Math.sin(r.ang)*r.v*dt;r.x+=sx;r.y+=sy;r.d+=Math.hypot(sx,sy);r.smk+=dt;
    if(r.smk>(LOWFX?.06:.025)){r.smk=0;A.fxAdd({k:'fumo',x:r.x-Math.cos(r.ang)*12,y:r.y-Math.sin(r.ang)*12,r:3+Math.random()*2.5,life:.7,vx:(Math.random()-.5)*10,vy:-8,drag:2})}
    let boom=r.x<L||r.x>R||r.y<TOP-10||r.y>BOT||r.d>D.range;for(const z of Z){if(z.st==='muore'||z.st==='sale')continue;if(Math.hypot(z.x-r.x,z.y-z.D.h*.5-r.y)<z.D.r+5){boom=true;break}}
    if(boom){ROCK.splice(i,1);esplodi(r.x,r.y)}}
  // zombies
  spawnT-=dt;const alive=Z.filter(z=>z.st!=='muore').length;if(spawnT<=0&&ST.started){spawnT=1.5+Math.random()*1.7;if(alive<6)spawn()}
  for(let i=Z.length-1;i>=0;i--){const z=Z[i];z.t+=dt;z.hit=Math.max(0,z.hit-dt*6);z.x+=z.vx*dt;z.y+=z.vy*dt;z.vx*=Math.pow(.004,dt);z.vy*=Math.pow(.004,dt);
    if(z.st==='sale'){if(z.t>=.9){z.st='walk';z.t=0}continue}
    if(z.st==='muore'){if(z.t>=.8)Z.splice(i,1);continue}
    const dx=hero.x-z.x,dy=hero.y-z.y,d=Math.hypot(dx,dy);z.face=Math.atan2(dy,dx);
    if(d>18){const v=z.D.spd*(z.k==='hound'?1:1+.15*Math.sin(z.t*3+z.id*9));z.x+=dx/d*v*dt;z.y+=dy/d*v*dt;z.ft+=dt*z.D.walk.fps;if(z.st==='attack'){z.st='walk'}}
    else{if(z.st!=='attack'){z.st='attack';z.at=0}z.at=(z.at||0)+dt;if(z.D.attack)z.ft=z.at*z.D.attack.fps;else z.ft+=dt*z.D.walk.fps*1.6;
      if(Math.floor((z.at-dt)/.9)!==Math.floor(z.at/.9)){ST.shake=Math.max(ST.shake,.15);hero.ouch=.25;if(AU.ctx){M.flesh(AU.ctx.currentTime,.8)}}}
    for(const o of Z){if(o===z||o.st==='muore')continue;const ex=z.x-o.x,ey=z.y-o.y,e=Math.hypot(ex,ey);if(e<18&&e>.1){z.x+=ex/e*(18-e)*.5*dt*8;z.y+=ey/e*(18-e)*.5*dt*8}}
    if(bara.st!=='sotto'){const bx=z.x-bara.x,by=(z.y-bara.y)*2;if(Math.abs(bx)<38&&Math.abs(by)<28){if(Math.abs(bx)/38>Math.abs(by)/28)z.x=bara.x+Math.sign(bx||1)*38;else z.y=bara.y+Math.sign(by||1)*14}}
    z.x=Math.max(L+8,Math.min(R-8,z.x));z.y=Math.max(TOP+10,Math.min(BOT-6,z.y))}
  hero.ouch=Math.max(0,(hero.ouch||0)-dt);
  // pickups
  for(let i=PICK.length-1;i>=0;i--){const p=PICK[i];p.t+=dt;if(Math.hypot(p.x-hero.x,p.y-hero.y)<18){PICK.splice(i,1);let first=null;
      for(const id of AMMO_OF[p.tipo]){const o=gunCtl(id),D=A.DATI[id];o.res=Math.min(D.res*2,o.res+(id==='lanciarazzi'?2:D.mag*2));first=first||id}
      A.suono(first,'presa',p.x);TXT.push({x:p.x,y:p.y-18,t:0,txt:{piccole:'Munizioni piccole',grosse:'Munizioni grosse',cartucce:'Cartucce',razzi:'Razzi'}[p.tipo],col:'#bff7a6'})}
    else if(p.t>25)PICK.splice(i,1)}
  // the coffin
  const bev=bara.update(dt);for(const e of bev){if(e.k==='suono')A.suonoBara(e.w,bara.x);
    else if(e.k==='offerta'){const D=A.DATI[e.id],RR=A.RAR[D.rar];bara.label={txt:D.n,sub:RR.n,col:RR.c}}
    else if(e.k==='presa'){FLY.push({id:e.id,x0:e.x,y0:e.y,t:0});bara.label=null}
    else if(e.k==='rimborso'){ST.coins+=e.n;TXT.push({x:bara.x,y:bara.y-40,t:0,txt:'+'+e.n,col:'#ffd23f',coin:true});say('Ti ridà le monete!')}
    else if(e.k==='via'){let s;do{s=Math.random()*SPOTS.length|0}while(s===spot);spot=s;bara.next=SPOTS[s]}}
  if(bara.st!=='offre')bara.label=null;
  for(let i=FLY.length-1;i>=0;i--){const f=FLY[i];f.t+=dt;if(f.t>=.45){FLY.splice(i,1);const o=gunCtl(f.id),D=A.DATI[f.id];o.mag=Math.max(o.mag,D.mag);o.res=Math.max(o.res,D.res);equip(f.id);
    TXT.push({x:hero.x,y:hero.y-44,t:0,txt:D.n+'!',col:A.RAR[D.rar].c})}}
  A.fxUpdate(dt);for(const p of A.FX)if(!p.onBounce&&(p.k==='bossolo'||p.k==='caricatore'))p.onBounce=onBounce;
  for(let i=TXT.length-1;i>=0;i--){TXT[i].t+=dt;if(TXT[i].t>1.1)TXT.splice(i,1)}
  if(ST.msg){ST.msg.life-=dt;if(ST.msg.life<=0)ST.msg=null}
  ST.shake=Math.max(0,ST.shake-dt*1.4)}
function esplodi(x,y){const D=A.DATI.lanciarazzi;A.fxAdd({k:'esplosione',x,y,s:D.splash,seed:Math.random()*99,life:.95});A.fxAdd({k:'bruciatura',x,y,r:D.splash*.42,life:9});
  A.suono('lanciarazzi','esplosione',x);ST.shake=Math.max(ST.shake,.6);
  for(const z of Z){if(z.st==='muore'||z.st==='sale')continue;const d=Math.hypot(z.x-x,z.y-z.D.h*.4-y);if(d<D.splash){hurt(z,D.dmg*(1-d/D.splash*.6),z.x-x,z.y-y+.01,80)}}}
// ---------------------------------------------------------------- drawing
function drawZ(z){const D=z.D,an=z.st==='attack'&&D.attack?D.attack:D.walk,im=an.im;if(!im.complete||!im.naturalWidth)return;
  const n=an.n,fr=Math.floor(z.ft)%n,row=rowOf(z.face),cs=D.cell,sx=fr*cs,sy=row*cs,w=cs/2,h=cs/2,x=z.x-D.foot[0]/2,y=z.y-D.foot[1]/2;
  ctx.save();
  if(z.st==='sale'){// rising out of the ground: a crack, dirt, the body coming up
    const k=Math.min(1,z.t/.9),e=1-Math.pow(1-k,2);ctx.fillStyle='rgba(20,14,10,.55)';ctx.beginPath();ctx.ellipse(z.x,z.y,12*Math.min(1,k*3),4.5*Math.min(1,k*3),0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.rect(z.x-60,z.y-80,120,80+2);ctx.clip();ctx.translate(0,(1-e)*D.h*1.1);
    if(!LOWFX){const r=Math.random;for(let i=0;i<2;i++){ctx.fillStyle='#6b4a2e';ctx.fillRect(z.x+(r()-.5)*22,z.y-r()*10-(1-e)*D.h*1.1,2,2)}}}
  if(z.st==='muore'){const k=z.t/.8;ctx.globalAlpha=1-k;ctx.translate(0,k*6)}
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(z.x,z.y+1,D.r+3,4,0,0,Math.PI*2);ctx.fill();
  ctx.drawImage(im,sx,sy,cs,cs,x,y,w,h);
  if(z.hit>0){const t=tint(im,sx,sy,cs);ctx.globalAlpha*=z.hit*.8;ctx.drawImage(t,0,0,cs,cs,x,y,w,h)}
  ctx.restore();
  if(z.st!=='muore'&&z.st!=='sale'&&z.hp<D.hp){const bw=22,f=Math.max(0,z.hp/D.hp);ctx.fillStyle=INK;ctx.fillRect(z.x-bw/2-1,z.y-D.h-9,bw+2,5);ctx.fillStyle='#3a2a20';ctx.fillRect(z.x-bw/2,z.y-D.h-8,bw,3);ctx.fillStyle='#8be05a';ctx.fillRect(z.x-bw/2,z.y-D.h-8,bw*f,3)}}
// a white copy of one frame (the flash when hit)
const TC=document.createElement('canvas');let TCk='';
function tint(im,sx,sy,cs){const k=im.src+sx+'_'+sy;if(TCk!==k){TC.width=TC.height=cs;const g=TC.getContext('2d');g.clearRect(0,0,cs,cs);g.drawImage(im,sx,sy,cs,cs,0,0,cs,cs);g.globalCompositeOperation='source-atop';g.fillStyle='#fff';g.fillRect(0,0,cs,cs);g.globalCompositeOperation='source-over';TCk=k}return TC}
function drawHero(){const B=heroB(),f=hero.moving?1+Math.floor(((hero.walk%(Math.PI*2))+Math.PI*2)%(Math.PI*2)/(Math.PI*2)*8)%8:0,row=[2,1,0,7,6,5,4,3][B.d],bob=heroBob();
  // basis d: E, SE, S, SW, W, NW, N, NE -> sheet rows: front, front-right, right, back-right, back, back-left, left, front-left
  const CW=36,CH=48,K=3,sx=f*CW*K,sy=row*CH*K,x=hero.x-18,y=hero.y-34;
  if(HERO_A.complete&&HERO_A.naturalWidth)ctx.drawImage(HERO_A,sx,sy,CW*K,CH*K,x,y,CW,CH);
  ctx.save();ctx.translate(hero.x,hero.y-bob);ctx.scale(B.f,1);A.inMano(hero.gun,B,Object.assign({hands:true,skin:'#f2c9a0'},gunCtl(hero.gun).pose()));ctx.restore();
  if(HERO_B.complete&&HERO_B.naturalWidth)ctx.drawImage(HERO_B,sx,sy,CW*K,CH*K,x,y,CW,CH);
  if(hero.ouch>0){ctx.save();ctx.globalAlpha=hero.ouch*1.6;ctx.globalCompositeOperation='lighter';glow('255,60,40',hero.x,hero.y-14,22,.5);ctx.restore()}}
function render(){const g=C2;g.setTransform(DPR*SC,0,0,DPR*SC,0,0);ctx=g;
  const sh=ST.shake*ST.shake*6;g.save();if(sh>0)g.translate((Math.random()-.5)*sh,(Math.random()-.5)*sh);
  g.drawImage(floor,0,0,AW,AH);for(const s of STONES)lapide(...s);
  A.fxDraw('suolo');
  for(const p of PICK)A.cassaMun(p.tipo,p.x,p.y,p.t+ST.t,1);
  // bodies by depth
  const list=[...Z.map(z=>({y:z.y,f:()=>drawZ(z)})),{y:hero.y,f:drawHero},{y:bara.st==='sotto'?-1e9:bara.y+6,f:()=>bara.draw()}];list.sort((a,b)=>a.y-b.y);for(const o of list)o.f();
  for(const b of BUL)A.colpo(b.kind,b.x,b.y,b.vx,b.vy,1);
  for(const r of ROCK)A.razzo(r.x,r.y,r.ang,r.t);
  A.fxDraw('aria');
  // the gun flying from the coffin to the hero
  for(const f of FLY){const k=f.t/.45,e=k*k*(3-2*k),x=f.x0+(hero.x-f.x0)*e,y=f.y0+(hero.y-20-f.y0)*e-Math.sin(k*Math.PI)*40;A.arma(f.id,x,y,k*Math.PI*2,{sc:.9})}
  // labels over the coffin
  const near=bara.vicino(hero.x,hero.y);
  if(bara.label)tag(bara.x,bara.y-78-Math.sin(ST.t*3)*2,bara.label.txt,bara.label.sub,bara.label.col,TOUCH?'Tocca la bara per prenderla':'Premi E o tocca la bara');
  else if(bara.st==='ferma'&&near)tag(bara.x,bara.y-48,'Bara delle Sorprese',A.BARA.prezzo+' monete','#ffd86b',TOUCH?'Tocca la bara per aprirla':'Premi E o tocca la bara');
  for(const t of TXT){const k=t.t/1.1;g.save();g.globalAlpha=1-Math.max(0,k-.6)/.4;g.font='bold 11px "Lilita One",system-ui,sans-serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle=INK;g.strokeText(t.txt,t.x,t.y-k*16);g.fillStyle=t.col;g.fillText(t.txt,t.x,t.y-k*16);g.restore()}
  g.restore();hud()}
function tag(x,y,a,b,col,c){const g=C2;g.save();g.font='15px "Lilita One",system-ui,sans-serif';const w=Math.max(g.measureText(a).width,90)+22;x=Math.max(w/2+4,Math.min(AW-w/2-4,x));
  g.fillStyle='rgba(27,22,18,.88)';g.strokeStyle=INK;g.lineWidth=3;g.beginPath();g.roundRect(x-w/2,y-34,w,c?50:38,10);g.fill();g.stroke();
  g.textAlign='center';g.fillStyle='#fff6e6';g.fillText(a,x,y-16);g.font='bold 11px Nunito,system-ui,sans-serif';g.fillStyle=col;g.fillText(b,x,y-3);
  if(c){g.fillStyle='#c4b79c';g.font='bold 10px Nunito,system-ui,sans-serif';g.fillText(c,x,y+10)}g.restore()}
// the gun's picture for the counter, drawn once per gun
const ICO={};function icona(id){if(ICO[id])return ICO[id];const c=document.createElement('canvas');c.width=192;c.height=120;const g=c.getContext('2d'),saved=ctx;ctx=g;g.scale(3,3);
  const M0=A.G[id],mid=(M0.len[0]+M0.len[1])/2,sc=Math.min(1.25,52/((M0.len[1]-M0.len[0])*1.35));A.arma(id,32-mid*1.35*sc,23+(id==='lanciarazzi'?4:0),0,{sc,glow:1});ctx=saved;return ICO[id]=c}
function hud(){const g=C2;g.save();
  // coins and kills
  g.fillStyle='rgba(27,22,18,.75)';g.beginPath();g.roundRect(8,8,124,30,15);g.fill();A.moneta(24,23,1.25,ST.t*3);g.font='18px "Lilita One",system-ui,sans-serif';g.fillStyle='#ffd86b';g.fillText(String(ST.coins),38,30);
  g.fillStyle='rgba(27,22,18,.75)';g.beginPath();g.roundRect(AW-104,8,96,30,15);g.fill();g.fillStyle='#f6ead2';g.font='18px "Lilita One",system-ui,sans-serif';g.textAlign='right';g.fillText(ST.kills+' zombie',AW-16,30);g.textAlign='left';
  // the gun in hand and its ammunition
  const id=hero.gun,o=gunCtl(id),D=A.DATI[id],RR=A.RAR[D.rar],bx=TOUCH?97:AW/2-78,by=AH-56,bw=TOUCH?116:156;
  g.fillStyle='rgba(27,22,18,.82)';g.strokeStyle=INK;g.lineWidth=3;g.beginPath();g.roundRect(bx,by,bw,48,12);g.fill();g.stroke();g.fillStyle=RR.c;g.fillRect(bx+8,by+44,bw-16,2);
  g.drawImage(icona(id),bx+4,by+4,64,40);
  g.textAlign='right';g.font='20px "Lilita One",system-ui,sans-serif';g.fillStyle=o.mag>0?'#fff6e6':'#ff6a4a';g.fillText(String(o.mag),bx+bw-(TOUCH?10:44),by+24);g.font='bold 11px Nunito,system-ui,sans-serif';g.fillStyle='#c4b79c';g.fillText('/ '+o.res,bx+bw-(TOUCH?10:44),by+38);
  if(!TOUCH){g.textAlign='left';g.font='bold 10px Nunito,system-ui,sans-serif';g.fillStyle=RR.c;g.fillText(D.n,bx+bw-40,by+20,38)}
  if(o.st==='ricarica'){const k=o.D.rel?Math.max(0,Math.min(1,(o.id==='pompa'||o.id==='tattica')?(o.mag/o.D.mag):o.t/o.D.rel)):0;g.fillStyle='rgba(255,216,107,.9)';g.fillRect(bx+8,by+44,(bw-16)*k,2);
    g.textAlign='center';g.font='13px "Lilita One",system-ui,sans-serif';g.lineWidth=3;g.strokeStyle=INK;g.strokeText('Ricarica…',bx+bw/2,by-6);g.fillStyle='#ffd86b';g.fillText('Ricarica…',bx+bw/2,by-6)}
  g.textAlign='left';
  // touch controls
  if(TOUCH){g.globalAlpha=.85;g.fillStyle='rgba(27,22,18,.35)';g.strokeStyle='rgba(246,234,210,.35)';g.lineWidth=3;g.beginPath();g.arc(JOY.x,JOY.y,JOY.r,0,Math.PI*2);g.fill();g.stroke();
    const jx=joy.on?Math.max(-1,Math.min(1,(joy.x-joy.x0)/JOY.r)):0,jy=joy.on?Math.max(-1,Math.min(1,(joy.y-joy.y0)/JOY.r)):0;g.fillStyle='rgba(246,234,210,.55)';g.beginPath();g.arc(JOY.x+jx*JOY.r*.55,JOY.y+jy*JOY.r*.55,17,0,Math.PI*2);g.fill();
    for(const k in BTN){const b=BTN[k];if(k==='use'&&!(bara.vicino(hero.x,hero.y)||bara.st==='offre'))continue;g.fillStyle=k==='fire'?(ptr.down&&ptr.auto?'rgba(255,106,74,.75)':'rgba(255,106,74,.5)'):'rgba(27,22,18,.6)';g.strokeStyle=INK;g.lineWidth=3;g.beginPath();g.arc(b.x,b.y,b.r,0,Math.PI*2);g.fill();g.stroke();
      g.fillStyle='#fff6e6';g.font=(k==='fire'?15:10)+'px "Lilita One",system-ui,sans-serif';g.textAlign='center';g.fillText(b.lab,b.x,b.y+4)}g.textAlign='left';g.globalAlpha=1}
  if(ST.msg){g.save();g.globalAlpha=Math.min(1,ST.msg.life*2);g.font='16px "Lilita One",system-ui,sans-serif';g.textAlign='center';g.lineWidth=4;g.strokeStyle=INK;g.strokeText(ST.msg.t,AW/2,84);g.fillStyle='#ffd86b';g.fillText(ST.msg.t,AW/2,84);g.restore()}
  if(!TOUCH&&ptr.mouse){g.strokeStyle='rgba(255,246,230,.8)';g.lineWidth=1.5;g.beginPath();g.arc(ptr.x,ptr.y,6,0,Math.PI*2);g.moveTo(ptr.x-10,ptr.y);g.lineTo(ptr.x-3,ptr.y);g.moveTo(ptr.x+3,ptr.y);g.lineTo(ptr.x+10,ptr.y);g.moveTo(ptr.x,ptr.y-10);g.lineTo(ptr.x,ptr.y-3);g.moveTo(ptr.x,ptr.y+3);g.lineTo(ptr.x,ptr.y+10);g.stroke()}
  g.restore()}
// ---------------------------------------------------------------- the weapon chips under the game
function chips(){const box=$('armi');if(!box.children.length){for(const id of A.ORDINE){const D=A.DATI[id],b=document.createElement('button');b.className='arma';b.dataset.id=id;b.setAttribute('aria-pressed','false');
    const c=document.createElement('canvas');c.width=132;c.height=60;b.append(c);const s=document.createElement('span');s.textContent=D.n;b.append(s);const r=document.createElement('small');r.textContent=A.RAR[D.rar].n;r.style.color=A.RAR[D.rar].c;b.append(r);
    b.addEventListener('click',()=>{start();equip(id)});box.append(b);
    const g=c.getContext('2d'),saved=ctx;ctx=g;g.scale(2,2);const M0=A.G[id],mid=(M0.len[0]+M0.len[1])/2,sc=Math.min(1.6,54/((M0.len[1]-M0.len[0])*1.35));A.arma(id,33-mid*1.35*sc,17+(id==='lanciarazzi'?6:2),0,{sc,glow:1});ctx=saved}}
  for(const b of box.children)b.setAttribute('aria-pressed',String(b.dataset.id===hero.gun))}
// ---------------------------------------------------------------- loop
let last=0,ema=.016,slow=0;
function frame(ts){const dt=Math.min(.05,(ts-last)/1000||.016);last=ts;ema+=(dt-ema)*.05;if(!LOWFX&&ema>.028){slow+=dt;if(slow>3)LOWFX=true}else slow=0;
  try{update(dt);render()}catch(e){console.error(e)}requestAnimationFrame(frame)}
$('fuga').addEventListener('change',e=>{ST.next=e.target.checked});
$('suoni').addEventListener('change',e=>{AU.on.sfx=e.target.checked;if(AU.sfxBus)AU.sfxBus.gain.value=e.target.checked?.8:0});
$('start').addEventListener('click',()=>start());
$('apri').addEventListener('click',()=>{start();if(bara.st==='offre'){bara.prendi();return}if(bara.st!=='ferma')return;
  // the button opens it from anywhere: the hero walks there in a hop
  if(!bara.vicino(hero.x,hero.y)){hero.x=bara.x+(hero.x<bara.x?-30:30);hero.y=bara.y+30}useBara()});
makeFloor();resize();chips();requestAnimationFrame(frame);
window.__poligono={ST,hero,Z,bara,A,update,render,ptr,keys,joy};
})();
