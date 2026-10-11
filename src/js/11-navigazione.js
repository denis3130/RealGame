// ---------- navigation: flow field toward the player + line of sight ----------
const CELL=12;let GC=Math.ceil((R-L)/CELL),GRW=Math.ceil((BOT-TOP)/CELL);
let fields={};
const NB=[[1,0,10],[-1,0,10],[0,1,10],[0,-1,10],[1,1,14],[1,-1,14],[-1,1,14],[-1,-1,14]];
function cellOf(x,y){return[clamp(Math.floor((x-L)/CELL),0,GC-1),clamp(Math.floor((y-TOP)/CELL),0,GRW-1)]}
function field(inf){
  const f=fields[inf];if(f&&f.t>0)return f;
  const N=GC*GRW,blk=new Uint8Array(N),dist=new Int32Array(N).fill(1e9);
  for(let j=0;j<GRW;j++)for(let i=0;i<GC;i++){const x=L+(i+.5)*CELL,y=TOP+(j+.5)*CELL;for(const k of G.rocks)if(Math.hypot(x-k.x,y-k.y)<k.r+inf){blk[j*GC+i]=1;break}}
  let [si,sj]=cellOf(P.x,P.y);
  if(blk[sj*GC+si]){let bd=1e9,bi=si,bj=sj;for(let j=0;j<GRW;j++)for(let i=0;i<GC;i++)if(!blk[j*GC+i]){const d=(i-si)**2+(j-sj)**2;if(d<bd){bd=d;bi=i;bj=j}}si=bi;sj=bj}
  const buckets=[],push=(c,idx)=>{(buckets[c]||(buckets[c]=[])).push(idx)};
  dist[sj*GC+si]=0;push(0,sj*GC+si);
  for(let c=0;c<buckets.length;c++){const b=buckets[c];if(!b)continue;
    for(let q=0;q<b.length;q++){const idx=b[q];if(dist[idx]!==c)continue;const i=idx%GC,j=(idx/GC)|0;
      for(const[dx,dy,w] of NB){const ni=i+dx,nj=j+dy;if(ni<0||nj<0||ni>=GC||nj>=GRW)continue;const n=nj*GC+ni;if(blk[n])continue;
        if(dx&&dy&&(blk[j*GC+ni]||blk[nj*GC+i]))continue;const nc=c+w;if(nc<dist[n]){dist[n]=nc;push(nc,n)}}}}
  return fields[inf]={dist,blk,t:.25};
}
function clearLine(x1,y1,x2,y2,pad){const dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy||1;
  for(const k of G.rocks){const t=clamp(((k.x-x1)*dx+(k.y-y1)*dy)/l2,0,1);if(Math.hypot(x1+dx*t-k.x,y1+dy*t-k.y)<k.r+pad)return false}return true}
const infOf=e=>e.r<=13?14:e.r<=20?22:36;
function navAngle(e){
  let want=Math.atan2(P.y-e.y,P.x-e.x);
  if(!clearLine(e.x,e.y,P.x,P.y,e.r*.85)){const f=field(infOf(e)),[i,j]=cellOf(e.x,e.y);let best=f.dist[j*GC+i],bi=-1,bj=-1;
    for(const[dx,dy] of NB){const ni=i+dx,nj=j+dy;if(ni<0||nj<0||ni>=GC||nj>=GRW)continue;if(dx&&dy&&(f.blk[j*GC+ni]||f.blk[nj*GC+i]))continue;
      const d=f.dist[nj*GC+ni];if(d<best){best=d;bi=ni;bj=nj}}
    if(bi>=0)want=Math.atan2(TOP+(bj+.5)*CELL-e.y,L+(bi+.5)*CELL-e.x)}
  e.nav=e.nav==null?want:e.nav+angDiff(e.nav,want)*.35;
  return e.nav;
}
function dash(){
  if(!started||paused||P.dashCd>0)return;
  const inp=input();let a=inp.m>.1?Math.atan2(inp.y,inp.x):P.face;
  P.dashT=.16;P.dvx=Math.cos(a)*560;P.dvy=Math.sin(a)*560;P.dashCd=P.dashMax;P.inv=Math.max(P.inv,.28);P.face=a;sfx('dash');
  for(let i=0;i<6;i++)G.fx.push({k:'puff',x:P.x,y:P.y+6,vx:rand(-40,40),vy:rand(-40,40),t:rand(.25,.45),r:rand(4,7)});
}
const canHit=e=>!e.dead&&!(e.spawn>0)&&!e.hidden&&!(e.intro>0)&&!(e.z>20)&&!(e.shell>0)&&!(e.rise>0);
function nearest(x,y,skip,maxD){let b=null,bd=maxD||1e9;for(const e of G.enemies){if(!canHit(e)||(skip&&skip.has(e)))continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd){bd=d;b=e}}return b}
function arrow(x,y,a,m){const v=P.pspd||560;G.arrows.push({wb:P.wb||0,x,y,a,vx:Math.cos(a)*v,vy:Math.sin(a)*v,m,pierce:P.pierce,ric:P.ric,hit:new Set(),life:1.4})}
function volley(a){
  const n=P.front;for(let i=0;i<n;i++){const off=(i-(n-1)/2)*9;arrow(P.x+Math.cos(a+Math.PI/2)*off,P.y-6+Math.sin(a+Math.PI/2)*off,a,1)}
  for(let d=1;d<=P.diag;d++){arrow(P.x,P.y-6,a+.42*d,.8);arrow(P.x,P.y-6,a-.42*d,.8)}
  if(P.side){arrow(P.x,P.y-6,a+Math.PI/2,.7);arrow(P.x,P.y-6,a-Math.PI/2,.7)}
  if(P.rear)arrow(P.x,P.y-6,a+Math.PI,.7);
  if(P.fan){arrow(P.x,P.y-6,a+.8,1);arrow(P.x,P.y-6,a-.8,1)}
  if(P.giant&&(G.gv=(G.gv||0)+1)%3===0){arrow(P.x,P.y-6,a,2.4);const g=G.arrows[G.arrows.length-1];g.big=true;g.pierce+=3}
  if(P.rain&&(G.volN=(G.volN||0)+1)%4===0)for(let i=0;i<12;i++)arrow(P.x,P.y-6,a+i*TAU/12,.6);
  sfx('bow',P.wk||P.proj);
}
function shootE(x,y,a,sp,r,dmg,kind){sfx('eshot',kind,x);sp*=Math.min(1.7,1+(effRoom()-1)*.035);dmg=Math.round(dmg*DMG());G.eproj.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,a,r,dmg,kind,life:6})}
function text(x,y,t,col,size){G.texts.push({x,y,t,col,size:size||14,life:.8})}
function shake(v){G.shake=Math.min(10,G.shake+v);if(v>=5&&G.debris)fallingPebbles(Math.min(8,Math.round(v)))}
function dustRing(x,y,n){for(let i=0;i<(n||14);i++){const a=rand(0,TAU),s=rand(60,140);G.fx.push({k:'puff',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6,t:rand(.3,.6),r:rand(4,8)})}}
function hurtP(d){if(INTRO.on)return;if(P.inv>0||P.dashT>0||G.state==='dead')return;if(P.shield&&P.shCd<=0){P.shCd=P.shield>1?6:9;P.inv=.45;vfxBlast(P.x,P.y-10,'150,230,120',42,{sparks:12,spcol:PAL.leaf,dust:0,debris:'leaf',n:6});text(P.x,P.y-42,'PARATO','#9fe06a',14);sfx('block');return}P.hp-=d;P.inv=.7;shake(5);text(P.x,P.y-40,'-'+d,'#e5484d',16);sfx('hurt');if(G.trial)G.trial.hit=true;if(P.hp<=0)die()}
function die(){if(INTRO.on){P.hp=P.maxhp;return}if(P.revive>0){P.revive--;P.hp=Math.round(P.maxhp*(P.reviveFull?1:.5));P.inv=2;shake(6);banner('Cuore di drago','Ti rialzi',1.6);sfx('pick');return}P.hp=0;G.state='dead';G.deathT=0;G.slowT=0;duckMusic(.4);vib([80,60,160]);if(canRevive())setTimeout(()=>{if(G.state==='dead'&&!G.ended)openRevive()},1300);else setTimeout(()=>endRun(false),1800)}
// skeleton shield: blocks frontal arrows until it has taken enough hits, then splinters
function skShield(e){if(e.sh==null){e.shMax=e.elite?7:4;e.sh=e.shMax}return e.sh}
function breakShield(e,a){e.sh=0;e.shHit=0;e.stun=1;e.wind=0;e.lunge=0;e.cd=Math.max(e.cd,1.4);
  text(e.x,e.y-38,'SCUDO ROTTO!','#ffc93c',16);G.texts[G.texts.length-1].pop=1;shake(3);G.hitstop=Math.max(G.hitstop||0,.06);sfx('shieldBreak',0,e.x);
  const fx=Math.cos(e.face),fy=Math.sin(e.face),sx=e.x+fx*11,sy=e.y-6+fy*8;
  for(let i=0;i<16;i++)G.fx.push({k:'chunk',x:sx,y:sy,vx:rand(-150,150)+Math.cos(a)*90,vy:rand(-170,60)+Math.sin(a)*90,t:rand(.35,.7),r:rand(1.6,3.4),col:pk(['#8a5a32','#6b4a2a','#9aa3ad','#c9cfd6'])});
  G.fx.push({k:'spark',x:sx,y:sy,t:.3});moveCircle(e,Math.cos(a)*12,Math.sin(a)*12)}
function hurtE(e,dmg,crit,dot){
  if(e.dead)return;
  if(e.intro>0||e.hidden){G.fx.push({k:'spark',x:e.x,y:e.y-e.r,t:.15});return}
  if(e.frozen>0)dmg*=1.3;e.hp-=dmg;e.flash=.08;
  text(e.x+rand(-6,6),e.y-e.r-14-e.z,Math.round(dmg),dot?'#ff9a3c':crit?'#ffc93c':'#ffffff',crit?20:dot?12:14);if(crit){G.texts[G.texts.length-1].pop=1;G.hitstop=Math.max(G.hitstop||0,isBoss(e.type)?.06:.035)}
  if(!dot){if(P.poison){e.poisonS=Math.min(4,(e.poisonS||0)+1);e.poisonT=3}if(P.fire)e.burn=2.5;if(P.ice)e.slow=1.8;sfx('hit',{c:crit,t:e.type},e.x);if(P.freeze&&!isBoss(e.type)&&!(e.frozen>0)&&Math.random()<.2&&e.hp>0){e.frozen=1.2;text(e.x,e.y-e.r-30,'GELO','#bfe9ff',13)}if(P.chain&&P.fire&&e.hp>0)fireChain(e)}
  if(e.hp<=0)killE(e);
}
const ECOL={slime:'#8fd14f',bigslime:'#6fbf3f',bat:'#8a5bc4',goblin:'#7bbf4a',plant:'#d65ba8',skeleton:'#d9d2c0',mushroom:'#9a5bc8',wisp:'#7fd3f0',beetle:'#e0662a',golem:'#8c8478',witch:'#5a7a3a'};
// boss defeated: slow motion and a golden splash
function bossBarReset(){const bb=$('bossBar');clearTimeout(bossBarDie.t);bb.classList.remove('dying','shatter','fall','rise','burst');bb.querySelectorAll('.bbShard').forEach(x=>x.remove());$('bossFill').style.transition=''}
// how each boss's bar breaks: the colour of the pieces, the flash, and the way they go (stone falls, embers rise, water bursts), with its sound
const BBFX={golem:{c:'#6f7a56',f:'#c8d49a',k:'fall',s:'crumble'},witch:{c:'#2e6a4a',f:'#9ff0c0',k:'rise',s:'bloom'},salamander:{c:'#7a2a12',f:'#ffb060',k:'rise',s:'ignite'},smith:{c:'#4a4a56',f:'#e8ecf4',k:'fall',s:'rock'},
  toad:{c:'#3f7a24',f:'#c8ff6a',k:'burst',s:'splash'},hydra:{c:'#1e5a6a',f:'#8ff0ff',k:'burst',s:'bubble'},yeti:{c:'#6a8aa0',f:'#f0fbff',k:'fall',s:'icicles'},icequeen:{c:'#3a4a9a',f:'#dff4ff',k:'rise',s:'frost'},mimic:{c:'#8a5a10',f:'#ffe27a',k:'fall',s:'coin'}};
function bossBarDie(type){const bb=$('bossBar');if(bb.hidden||bb.classList.contains('dying'))return;bb.classList.add('dying');const f=$('bossFill');f.style.transition='width .35s ease-in';f.style.width='0%';
  const X=BBFX[type]||{c:'#3a2a24',f:'#e25a5f',k:'fall',s:'click'};bb.style.setProperty('--sc',X.c);bb.style.setProperty('--sf',X.f);bb.classList.add(X.k);
  clearTimeout(bossBarDie.t);bossBarDie.t=setTimeout(()=>{const box=bb.querySelector('div'),n=X.k==='burst'?14:10;
    for(let i=0;i<n;i++){const sh=document.createElement('i');sh.className='bbShard';sh.style.left=(i/n*100)+'%';sh.style.width=(100/n+.6)+'%';const c=i-(n-1)/2;sh.style.setProperty('--dx',(c*rand(5,10)+rand(-4,4)).toFixed(1)+'px');sh.style.setProperty('--dy',rand(-34,34).toFixed(0)+'px');sh.style.setProperty('--r',(c*rand(6,12)+rand(-20,20)).toFixed(0)+'deg');sh.style.animationDelay=(X.k==='rise'?Math.random()*.12:Math.abs(c)*.03).toFixed(2)+'s';box.appendChild(sh)}
    bb.classList.add('shatter');sfx(X.s);shake(4);bossBarDie.t=setTimeout(()=>{bb.hidden=true;bossBarReset()},1200)},460)}
function bossDown(name){const el=$('bossDown');$('bdName').textContent=name||'';el.classList.remove('out');el.hidden=false;el.style.animation='none';void el.offsetWidth;el.style.animation='';vib([80,40,80,40,200]);
  setTimeout(()=>sfx('levelup'),350);clearTimeout(bossDown.t);bossDown.t=setTimeout(()=>{el.classList.add('out');setTimeout(()=>{el.hidden=true},400)},2300)}
// kills in quick succession
const KC=[[2,'Doppia!','#9ff0ff'],[3,'Tripla!','#9df07a'],[4,'Quadrupla!','#ffd84a'],[5,'Strage!','#ff8a5a'],[8,'Inarrestabile!','#ff6ad5']];
function killStreak(n){let k=KC[0];for(const c of KC)if(n>=c[0])k=c;const el=document.createElement('div');el.className='kcPop';el.style.color=k[2];el.innerHTML=`${k[1]}<small>${n} di fila</small>`;
  $('banner').parentElement.appendChild(el);setTimeout(()=>el.remove(),950);document.querySelectorAll('.kcPop').forEach(o=>{if(o!==el)o.remove()});sfx('shimmer',Math.min(3,n-1));if(n>=4)vib(20)}
function killE(e,noLoot){
  e.dead=true;G.kills++;if(!noLoot&&P.vamp)P.hp=Math.min(P.maxhp,P.hp+P.vamp*2);const col=ECOL[e.type];fxPush({k:'pop',x:e.x,y:e.y-e.r*.6-e.z,r:e.r*1.1,t:.3,max:.3,col});for(let q=0;q<6;q++)fxPush({k:'streak',x:e.x,y:e.y-e.r*.6,vx:rand(-200,200),vy:rand(-240,40),g:500,t:rand(.25,.45),max:.45,col,w:2.2});sfx('death',e.type,e.x);G.hitstop=Math.max(G.hitstop||0,isBoss(e.type)?.35:.05);
  G.decals.push({x:e.x,y:e.y,r:e.r*1.3,col,seed:Math.random()*9});if(G.decals.length>40)G.decals.shift();
  for(let i=0;i<12;i++)G.fx.push({k:'chunk',x:e.x,y:e.y-e.z,vx:rand(-120,120),vy:rand(-120,120),t:rand(.3,.6),r:rand(2,4),col});
  if(!noLoot){ultGain(e.elite?14:5);const coins=e.gold+randi(0,1);for(let i=0;i<coins;i++){const a=rand(0,TAU),s=rand(40,110);G.coins.push({x:e.x,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:0})}
    if(Math.random()<(e.elite?.4:.07))G.hearts.push({x:e.x,y:e.y,t:0});dropXp(e)}
  if(e.type==='bigslime')for(let i=0;i<2;i++){const s=makeE('slime',e.x+(i?12:-12),e.y,0);s.hp=s.max*=.8;G.enemies.push(s)}
  if(e.type==='mushroom')addZone(e.x,e.y,32,2.5);
  if(e.type==='magmaslime')addZone(e.x,e.y,18,1.4,'fire');
  if(!noLoot&&!isBoss(e.type)){const t=G.t||0;G.kc=t-(G.kcT??-9)<.9?(G.kc||1)+1:1;G.kcT=t;if(G.kc>=2)killStreak(G.kc)}
  if(isBoss(e.type)){G.bossKills=(G.bossKills||0)+1;G.gemsRun=(G.gemsRun||0)+2;{const bx=e.x,by=e.y;setTimeout(()=>{if(G&&!G.ended&&G.texts)text(bx,by-70,'+2 cristalli','#9fe6ff',17)},900)}G.slowT=1.1;shake(6);bossDie(e);G.eproj=[];G.bands=[];G.boulders=[];G.zones=[];G.meteors=[];G.lines=[];dustRing(e.x,e.y,24);
    for(const o of G.enemies)if(!o.dead&&o!==e)killE(o,true)}
}
function addZone(x,y,r,t,kind){G.zones.push({x,y,r,t,max:t,kind})}
function explode(e){const BR=e.elite?72:52;
  G.fx.push({k:'boom',x:e.x,y:e.y,t:.35,r:BR});shake(6);sfx('boom');stamp('scorch',e.x,e.y,40);vfxBlast(e.x,e.y,'255,160,60',BR*1.2,{fire:12,sparks:18,debris:'stone',n:8});
  if(Math.hypot(P.x-e.x,P.y-e.y)<BR)hurtP(e.elite?28:22);
  for(const o of G.enemies)if(o!==e&&!o.dead&&!isBoss(o.type)&&Math.hypot(o.x-e.x,o.y-e.y)<BR)hurtE(o,30,false);
  killE(e);
}
function makeBands(e){
  const n=e.p2?4:3;
  for(let i=0;i<n;i++){const h=i%2===0,base=h?P.y:P.x,off=i<2?0:rand(50,80)*(Math.random()<.5?-1:1);
    G.bands.push({h,pos:h?clamp(base+off,TOP+14,BOT-14):clamp(base+off,L+14,R-14),w:26,warn:.95+i*.18,act:.45,hit:false})}
}
function toWalk(e){e.st='walk';e.sub='';e.stT=isBoss(e.type)?rand(1.1,1.6):rand(1.1,1.7);e.hidden=false}

