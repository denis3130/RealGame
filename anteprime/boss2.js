// =====================================================================
// BOSS 2 (preview): richer bosses. Every boss breathes; each one gets its own living details, anchored to its body:
// orbiting stones, smoke, embers, drool, flies, frost breath, glints... Particles respect LOWFX.
// =====================================================================
let BOSS2=true;
const B2={};
function b2tick(e){const now=G.t||0,dt=Math.min(.05,Math.max(0,now-(e._b2t==null?now:e._b2t)));e._b2t=now;if(!e._b2p)e._b2p=[];
  const L=e._b2p;for(let i=L.length-1;i>=0;i--){const p=L[i];p.t+=dt;if(p.gy!=null&&p.y>=p.gy&&p.k==='drip'){L[i]={k:'splash',x:p.x,y:p.gy,t:0,life:.35,vx:0,vy:0,col:p.col};continue}
    if(p.t>=p.life){L.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g||0)*dt;if(p.drag){p.vx*=1-p.drag*dt;p.vy*=1-p.drag*dt}}
  return dt}
const b2emit=(e,p)=>{if(LOWFX||!e._b2p||e._b2p.length>70)return;e._b2p.push(Object.assign({t:0,vx:0,vy:0},p))};
const b2every=(e,key,per,dt)=>{e['_b2e'+key]=(e['_b2e'+key]||0)+dt;if(e['_b2e'+key]>=per){e['_b2e'+key]=0;return true}return false};
function b2draw(e){const L=e._b2p;if(!L||!L.length)return;
  for(const p of L){const k=1-p.t/p.life;
    switch(p.k){
      case 'smoke':ctx.fillStyle=`rgba(${p.col||'70,62,58'},${.38*k})`;circ(p.x,p.y,(p.r||3)+(1-k)*7);ctx.fill();break;
      case 'vapor':ctx.fillStyle=`rgba(235,246,255,${.55*k})`;circ(p.x,p.y,(p.r||3)+(1-k)*6);ctx.fill();break;
      case 'dust':ctx.fillStyle=`rgba(${p.col||'205,195,175'},${.42*k})`;circ(p.x,p.y,(p.r||3)+(1-k)*5);ctx.fill();break;
      case 'pebble':ink(1.4);circ(p.x,p.y,p.r||2);fs(p.col||'#7d7568');break;
      case 'drip':ctx.fillStyle=p.col;ctx.beginPath();ctx.ellipse(p.x,p.y,1.8,2.6,0,0,TAU);ctx.fill();break;
      case 'splash':ctx.strokeStyle=p.col;ctx.globalAlpha=k;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(p.x,p.y,2+(1-k)*7,1+(1-k)*3,0,0,TAU);ctx.stroke();ctx.globalAlpha=1;break;
      case 'snow':ctx.fillStyle=`rgba(255,255,255,${.9*Math.min(1,k*3)})`;circ(p.x+Math.sin(p.t*3+p.ph)*3,p.y,p.r||1.5);ctx.fill();break;
      case 'leaf':ctx.save();ctx.translate(p.x+Math.sin(p.t*2.5+p.ph)*6,p.y);ctx.rotate(p.t*3+p.ph);ctx.globalAlpha=Math.min(1,k*2);ink(1);ell(0,0,3.6,1.8);fs(p.col||'#6fa040');ctx.restore();ctx.globalAlpha=1;break;
      case 'bubble':ctx.strokeStyle=`rgba(${p.col||'190,255,170'},${.8*k})`;ctx.lineWidth=1.2;circ(p.x,p.y,p.r||2);ctx.stroke();break;
      case 'coin':ctx.fillStyle=`rgba(255,215,90,${k})`;ctx.beginPath();ctx.ellipse(p.x,p.y,2.6*Math.abs(Math.cos(p.t*8+p.ph))+.4,2.6,0,0,TAU);ctx.fill();break;
      case 'mote':{const ex=p.e?p.e.x:p.x,ey=p.e?p.e.y:p.y,an=p.a+p.t*2.4,rr=p.rad*(1-p.t/p.life*.4),px=ex+Math.cos(an)*rr,py=ey-p.h0-p.t*46+Math.sin(an)*rr*.35;ctx.save();ctx.globalCompositeOperation='lighter';glow(p.col,px,py,7,.7*Math.sin(k*Math.PI));ctx.fillStyle=`rgba(255,255,255,${.9*Math.sin(k*Math.PI)})`;circ(px,py,1.1);ctx.fill();ctx.restore();break}
      case 'conv':{const q=1-k,ex=p.e.x,ey=p.e.y-p.h,px=ex+Math.cos(p.a)*p.rad*(1-q*q),py=ey+Math.sin(p.a)*p.rad*(1-q*q)*.6;ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${p.col},${.9*q})`;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+(ex-px)*.18,py+(ey-py)*.18);ctx.stroke();glow(p.col,px,py,5,.8*q);ctx.restore();break}
      case 'ring':{const r=(p.r0||10)+(p.r1-(p.r0||10))*(1-k);ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${p.col},${.85*k})`;ctx.lineWidth=(p.w||4)*k+1;ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*(p.fl||.45),0,0,TAU);ctx.stroke();ctx.restore();break}
      case 'flame':{const s=(p.r||5)*(.5+k*.7);ctx.save();ctx.globalCompositeOperation='lighter';glow(p.col||'255,140,50',p.x,p.y,s*2.2,.6*k);ctx.restore();ctx.fillStyle=k>.5?'#ffd86b':'#ff8a3c';ctx.beginPath();ctx.moveTo(p.x,p.y-s*1.6);ctx.quadraticCurveTo(p.x+s,p.y,p.x,p.y+s*.6);ctx.quadraticCurveTo(p.x-s,p.y,p.x,p.y-s*1.6);ctx.fill();break}
      case 'ember':case 'spark':case 'glint':ctx.save();ctx.globalCompositeOperation='lighter';
        if(p.k==='ember'){glow(p.col||'255,140,50',p.x,p.y,6*k+2,.8*k);ctx.fillStyle=`rgba(255,230,170,${k})`;circ(p.x,p.y,1.1);ctx.fill()}
        else if(p.k==='spark'){ctx.strokeStyle=`rgba(255,220,120,${k})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.035,p.y-p.vy*.035);ctx.stroke()}
        else{const s=(p.r||5)*Math.sin(k*Math.PI);ctx.strokeStyle=`rgba(255,255,255,${k})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(p.x-s,p.y);ctx.lineTo(p.x+s,p.y);ctx.moveTo(p.x,p.y-s);ctx.lineTo(p.x,p.y+s);ctx.stroke();glow(p.col||'255,255,255',p.x,p.y,s*1.6,.5*k)}
        ctx.restore();break}}}

// ---------- each boss's own world: the ground under it, its aura, the way it charges an attack ----------
// colours come from the boss itself (its skin, its eyes, its material), never a generic glow
const B2H={golem:62,witch:56,salamander:30,smith:72,toad:62,hydra:80,yeti:72,icequeen:60,mimic:34};
const B2CALM=new Set(['walk','idle','move','show','hover','swim','float','wander','rest','chase','sit',undefined,null,'']);
const B2HEAVY={golem:1,yeti:1,toad:1,smith:1};
// [halo, charge colour, aura particle]
const B2T={golem:[['150,200,110','255,120,40'],'200,180,140'],witch:[['120,70,160','255,140,60'],'200,140,255'],salamander:[['255,120,40','255,90,30'],'255,170,60'],
  smith:[['255,130,40','255,90,30'],'255,240,200'],toad:[['170,210,90','255,170,60'],'190,240,255'],hydra:[['80,190,150','160,110,230'],'170,255,120'],
  yeti:[['200,235,255','255,140,140'],'255,255,255'],icequeen:[['170,215,255','200,170,255'],'210,240,255'],mimic:[['255,200,80','255,120,60'],'255,215,90']};
const b2halo=e=>{const c=B2T[e.type];return c?(e.p2?c[0][1]:c[0][0]):'255,255,255'};
const b2seed=e=>{if(e._b2sd==null)e._b2sd=Math.random()*1000;let s=e._b2sd;return()=>{s=(s*9301+49297)%233280;return s/233280}};
const B2G={
  // moss creeping out over cracked stone, little mushrooms sprouting; in phase 2 the cracks fill with lava
  golem(e){const rn=b2seed(e),x=e.x,y=e.y+2,R=e.r*1.9,t=G.t||0;ctx.lineCap='round';
    for(let i=0;i<9;i++){const a=rn()*TAU;let px=x+Math.cos(a)*e.r*.7,py=y+Math.sin(a)*e.r*.3;ctx.strokeStyle=e.p2?`rgba(255,${110+50*Math.sin(t*3+i)|0},40,.85)`:'rgba(20,14,10,.55)';ctx.lineWidth=e.p2?2:1.6;ctx.beginPath();ctx.moveTo(px,py);for(let k=0;k<3;k++){px+=Math.cos(a+rn()-.5)*R*.22;py+=Math.sin(a+rn()-.5)*R*.1;ctx.lineTo(px,py)}ctx.stroke()}
    if(e.p2){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,110,30',x,y,R*1.1,.25,R*.45);ctx.restore()}
    for(let i=0;i<10;i++){const a=rn()*TAU,d=rn()*.5+.75,px=x+Math.cos(a)*R*d,py=y+Math.sin(a)*R*d*.42;ctx.fillStyle=e.p2?'#3a2a1c':pk(['#3f6a2a','#4f8a34','#5f9a3a']);ctx.beginPath();ctx.ellipse(px,py,rn()*6+4,rn()*2+2,0,0,TAU);ctx.fill()}
    if(!e.p2)for(let i=0;i<6;i++){const a=rn()*TAU,px=x+Math.cos(a)*R*.95,py=y+Math.sin(a)*R*.4,gr=Math.min(1,(t%60)*.5+.3),s=(2.6+rn()*1.6)*gr;ink(1.2);ctx.fillStyle='#efe3c8';ctx.fillRect(px-.9,py-s*1.6,1.8,s*1.6);ctx.strokeRect(px-.9,py-s*1.6,1.8,s*1.6);ctx.beginPath();ctx.ellipse(px,py-s*1.6,s*1.1,s*.75,0,Math.PI,0);ctx.closePath();fs(rn()<.5?'#d65b5b':'#c9a26a')}},
  // roots crawling from under her robe, purple berries, a pool of dark violet mist
  witch(e){const rn=b2seed(e),x=e.x,y=e.y+4,t=G.t||0;ctx.fillStyle='rgba(40,16,60,.35)';ctx.beginPath();ctx.ellipse(x,y,46,18,0,0,TAU);ctx.fill();ctx.lineCap='round';
    for(let i=0;i<8;i++){const a=i/8*TAU+rn()*.4,len=34+rn()*16,cx=x+Math.cos(a+.4)*len*.6,cy=y+Math.sin(a+.4)*len*.25,ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len*.42,cur=Math.sin(t*1.2+i)*3;
      for(const[c,w] of [[INK,5],[e.p2?'#6a3a2a':'#4a3424',2.6]]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(cx,cy+cur,ex,ey);ctx.stroke()}
      if(i%2===0){ink(1.2);circ(ex,ey,2.6);fs(e.p2?'#ff8a3c':'#a15ad0');ctx.fillStyle='rgba(255,255,255,.7)';circ(ex-.8,ey-.8,.8);ctx.fill()}}},
  // the floor scorched black under her, a puddle of lava where her head drips
  salamander(e){const tr=e.trail||[{x:e.x,y:e.y}];for(let i=0;i<=7;i++){const p=tr[Math.max(0,tr.length-1-i*6)];ctx.fillStyle='rgba(20,8,4,.28)';ctx.beginPath();ctx.ellipse(p.x,p.y+3,e.r*1.15,e.r*.5,0,0,TAU);ctx.fill()}
    const t=G.t||0;ctx.save();ctx.globalCompositeOperation='lighter';glow('255,110,30',e.x,e.y+3,e.r*1.6,.4+.1*Math.sin(t*3),e.r*.6);ctx.restore()},
  // a bed of glowing coals and soot around the forge-master
  smith(e){const rn=b2seed(e),x=e.x,y=e.y+6,t=G.t||0;ctx.fillStyle='rgba(16,12,10,.4)';ctx.beginPath();ctx.ellipse(x,y,44,16,0,0,TAU);ctx.fill();
    for(let i=0;i<22;i++){const a=rn()*TAU,d=rn(),px=x+Math.cos(a)*42*d,py=y+Math.sin(a)*15*d,f=.5+.5*Math.sin(t*(3+rn()*4)+i);ctx.fillStyle=f>.6?'#ffd86b':f>.3?'#ff7a2e':'#7a2a10';ctx.beginPath();ctx.ellipse(px,py,1.4+rn()*1.8,1+rn(),0,0,TAU);ctx.fill()}
    ctx.save();ctx.globalCompositeOperation='lighter';glow('255,110,40',x,y,48,.22+.06*Math.sin(t*5),18);ctx.restore()},
  // swamp water with lily pads bobbing round the king, one with a pink flower
  toad(e){if(e.z>4)return;const rn=b2seed(e),x=e.x,y=e.y+4,t=G.t||0;ctx.fillStyle='rgba(40,70,50,.4)';ctx.beginPath();ctx.ellipse(x,y,e.r*2.2,e.r*.85,0,0,TAU);ctx.fill();
    for(let k=0;k<2;k++){const q=((t*.45+k/2)%1);ctx.strokeStyle=`rgba(210,240,200,${.4*(1-q)})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(x,y,e.r*(1+q*1.3),e.r*(1+q*1.3)*.4,0,0,TAU);ctx.stroke()}
    for(let i=0;i<5;i++){const a=rn()*TAU,d=1.25+rn()*.6,px=x+Math.cos(a)*e.r*d+Math.sin(t*.8+i)*2,py=y+Math.sin(a)*e.r*d*.4+Math.cos(t+i)*1,s=5+rn()*3,n=rn()*TAU;ink(1.4);ctx.beginPath();ctx.ellipse(px,py,s,s*.55,0,n+.35,n+TAU-.35);ctx.lineTo(px,py);ctx.closePath();fs(pk(['#4f8a34','#5f9a3a','#6aa848']));
      if(i===0){ctx.fillStyle='#f2a0c8';for(let k=0;k<5;k++){ctx.beginPath();ctx.ellipse(px+Math.cos(k*1.26)*2,py-2+Math.sin(k*1.26)*1.2,1.8,1.1,k*1.26,0,TAU);ctx.fill()}ctx.fillStyle='#ffd23c';circ(px,py-2,1);ctx.fill()}}},
  hydra(e){const t=G.t||0;ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<4;k++)glow(e.p2?'150,100,220':'110,220,120',e.x+Math.sin(t*.5+k*1.6)*50,e.y-6+Math.cos(t*.4+k)*8,40,.12);ctx.restore()},
  // frost spreading over the floor in white crystal branches
  yeti(e){const rn=b2seed(e),x=e.x,y=e.y+3,t=G.t||0;ctx.fillStyle='rgba(235,245,255,.35)';ctx.beginPath();ctx.ellipse(x,y,e.r*1.8,e.r*.7,0,0,TAU);ctx.fill();ctx.lineCap='round';
    for(let i=0;i<10;i++){const a=i/10*TAU+rn()*.3,L0=e.r*(1.6+rn()*.8)*(.85+.15*Math.sin(t*.8+i));ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=1.6;const ex=x+Math.cos(a)*L0,ey=y+Math.sin(a)*L0*.42;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*e.r*.6,y+Math.sin(a)*e.r*.25);ctx.lineTo(ex,ey);
      for(const u of [.55,.8]){const bx=x+Math.cos(a)*L0*u,by=y+Math.sin(a)*L0*u*.42;for(const sd of [-1,1]){ctx.moveTo(bx,by);ctx.lineTo(bx+Math.cos(a+sd*.8)*6,by+Math.sin(a+sd*.8)*6*.42)}}ctx.stroke()}},
  // her emblem: a great snowflake turning slowly on the ice
  icequeen(e){if(e.hidden)return;const x=e.x,y=e.y+6,t=G.t||0,R=40,rgb=e.p2?'210,180,255':'200,235,255';ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x,y,R*1.2,.25,R*.5);ctx.lineCap='round';
    for(let i=0;i<6;i++){const a=t*.2+i/6*TAU,c=Math.cos(a),s=Math.sin(a),P=(d)=>[x+c*d,y+s*d*.45],Q=(d,o)=>[x+Math.cos(a+o)*d,y+Math.sin(a+o)*d*.45];ctx.strokeStyle=`rgba(${rgb},.6)`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...P(6));ctx.lineTo(...P(R));
      for(const[d,w] of [[R*.45,.32],[R*.72,.22]]){ctx.moveTo(...P(d));ctx.lineTo(...Q(d+8,w));ctx.moveTo(...P(d));ctx.lineTo(...Q(d+8,-w))}ctx.stroke()}
    ctx.strokeStyle=`rgba(${rgb},.35)`;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(x,y,R*1.08,R*1.08*.45,0,0,TAU);ctx.stroke();ctx.restore()},
  // a little hoard: coins and a couple of jewels scattered round the chest
  mimic(e){const rn=b2seed(e),x=e.x,y=e.y+6,t=G.t||0;ctx.save();ctx.globalCompositeOperation='lighter';glow('255,200,80',x,y,40,.18,14);ctx.restore();
    for(let i=0;i<14;i++){const a=rn()*TAU,d=.7+rn()*.6,px=x+Math.cos(a)*34*d,py=y+Math.sin(a)*13*d;ink(1);ctx.beginPath();ctx.ellipse(px,py,3,1.5,0,0,TAU);fs(pk(['#ffd23c','#f2b800','#ffe46e']))}
    for(let i=0;i<3;i++){const a=rn()*TAU,px=x+Math.cos(a)*30,py=y+Math.sin(a)*11;ink(1.2);ctx.beginPath();ctx.moveTo(px,py-3);ctx.lineTo(px+2.6,py);ctx.lineTo(px,py+2);ctx.lineTo(px-2.6,py);ctx.closePath();fs(['#e5484d','#3fa0ff','#5fd06a'][i]);if(Math.sin(t*3+i*2)>.85){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,255,255',px,py-1,5,.8);ctx.restore()}}}};
// what floats up around each boss
function b2aura(e,dt){const h=B2H[e.type]||50,ty=e.type;if(ty==='golem')return;
  if(ty==='golem'&&b2every(e,'au',.12,dt))b2emit(e,e.p2?{k:'ember',x:e.x+rand(-26,26),y:e.y-rand(10,50),vx:rand(-8,8),vy:-rand(20,40),life:1}:{k:'mote',e,a:rand(0,TAU),rad:e.r*rand(1,1.4),h0:rand(0,20),life:1.6,col:'200,230,120'});
  else if(ty==='witch'&&b2every(e,'au',.1,dt))b2emit(e,{k:'mote',e,a:rand(0,TAU),rad:e.r*rand(1,1.6),h0:rand(0,20),life:1.4,col:e.p2?'255,150,70':Math.random()<.5?'170,110,230':'140,240,200'});
  else if(ty==='salamander'||ty==='smith'){if(b2every(e,'au',.08,dt))b2emit(e,{k:'ember',x:e.x+rand(-24,24),y:e.y-rand(4,h*.6),vx:rand(-10,10),vy:-rand(30,55),life:rand(.7,1.1)});if(ty==='smith'&&b2every(e,'so',.3,dt))b2emit(e,{k:'smoke',x:e.x+rand(-14,14),y:e.y-h*.8,vy:-rand(14,22),life:1.3,r:3,col:'40,36,34'})}
  else if(ty==='hydra'&&b2every(e,'au',.18,dt))b2emit(e,{k:'bubble',x:e.x+rand(-46,46),y:e.y+rand(-6,8),vy:-rand(6,12),life:.9,r:rand(1.6,3.2),col:e.p2?'200,160,255':'170,255,120'});
  else if(ty==='yeti'&&b2every(e,'au',.05,dt))b2emit(e,{k:'mote',e,a:rand(0,TAU),rad:e.r*rand(1.3,1.9),h0:rand(-10,30),life:1.1,col:'240,250,255'});
  else if(ty==='icequeen'&&b2every(e,'au',.14,dt))b2emit(e,{k:'glint',x:e.x+rand(-34,34),y:e.y-rand(10,60),life:.5,r:3.5,col:e.p2?'210,180,255':'200,235,255'});
  else if(ty==='mimic'&&b2every(e,'au',.3,dt))b2emit(e,{k:'coin',x:e.x+rand(-24,24),y:e.y-e.z-rand(10,24),vy:-rand(16,26),life:.9,ph:rand(0,9)})}
function b2back(e,dt){if(e.type==='golem')return;const t=G.t||0,rgb=b2halo(e),h=B2H[e.type]||50,z=e.z||0;
  if(B2G[e.type])B2G[e.type](e);
  ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,e.x,e.y-z-h*.55,h*1.1,(.24+.06*Math.sin(t*1.7))*(e.intro>0?.6:1));ctx.restore();
  // phase 2: fire around the feet only for the bosses whose rage is fire
  if(e.p2&&(e.type==='golem'||e.type==='witch'||e.type==='smith'||e.type==='salamander'||e.type==='toad')&&!LOWFX&&b2every(e,'p2f',.06,dt)){const an=rand(0,TAU),r=e.r*rand(.8,1.25);b2emit(e,{k:'flame',x:e.x+Math.cos(an)*r,y:e.y+Math.sin(an)*r*.45,vy:-rand(30,55),life:rand(.4,.7),r:rand(3,6),col:'255,130,40'})}}
function b2front(e,dt){const h=B2H[e.type]||50,c=B2T[e.type][1];b2aura(e,dt);
  if(e._b2st!==e.st){const prev=e._b2st;e._b2st=e.st;if(prev!==undefined&&!B2CALM.has(e.st)&&!(e.intro>0)){for(let i=0;i<16;i++)b2emit(e,{k:'conv',e,a:i/16*TAU,rad:rand(55,80),h:h*.5,life:.42,col:c});b2emit(e,{k:'ring',x:e.x,y:e.y,r0:e.r,r1:e.r*3.2,life:.5,col:c,w:5})}}
  if(B2HEAVY[e.type]&&e.moving&&!(e.z>2)&&b2every(e,'st',.42,dt)){b2emit(e,{k:'ring',x:e.x,y:e.y+4,r0:e.r*.6,r1:e.r*1.9,life:.45,col:e.type==='yeti'?'240,250,255':e.type==='toad'?'200,240,210':'210,195,170',w:3});for(let i=0;i<3;i++)b2emit(e,{k:e.type==='yeti'?'snow':'dust',x:e.x+rand(-e.r,e.r),y:e.y+4,vx:rand(-25,25),vy:-rand(5,15),drag:3,life:.5,r:3,ph:0})}}
{const _de=drawEnemy;drawEnemy=function(e){const S=B2[e.type];if(!BOSS2||!S||e.dead){_de(e);return}
  const dt=b2tick(e),hide=e.hidden||(e.st==='burrow'&&e.sub==='under')||(e.spawn>0)||(e.type==='hydra'&&(e.sink||0)>.6);
  if(!hide){b2back(e,dt);if(S.back)S.back(e,dt)}
  const br=e.intro>0||hide?0:Math.sin((G.t||0)*(S.br||2.2)+e.x*.013)*(S.bra||.02);
  ctx.save();ctx.translate(e.x,e.y);ctx.scale(1-br*.6,1+br);ctx.translate(-e.x,-e.y);_de(e);ctx.restore();
  if(!hide){if(S.front)S.front(e,dt);b2front(e,dt)}b2draw(e)}}
// helpers for the signature pieces
const b2shard=(x,y,w,hgt,rot,fill,rgb,al)=>{ctx.save();ctx.translate(x,y);ctx.rotate(rot);ink(2);ctx.beginPath();ctx.moveTo(0,-hgt);ctx.lineTo(w,-hgt*.55);ctx.lineTo(w*.7,0);ctx.lineTo(-w*.7,0);ctx.lineTo(-w,-hgt*.55);ctx.closePath();fs(fill);
  ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.moveTo(0,-hgt*.95);ctx.lineTo(w*.35,-hgt*.55);ctx.lineTo(w*.15,-hgt*.1);ctx.lineTo(-w*.1,-hgt*.5);ctx.closePath();ctx.fill();ctx.restore();
  if(rgb){ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x+Math.sin(rot)*hgt*.5,y-Math.cos(rot)*hgt*.5,hgt*.9,al||.5);ctx.restore()}};
const b2fl=(x,y,s,sway,col)=>{ink(2);ctx.beginPath();ctx.moveTo(x+sway,y-s*2.2);ctx.quadraticCurveTo(x+s*1.1,y-s*.6,x+s*.55,y+s*.2);ctx.quadraticCurveTo(x,y+s*.6,x-s*.55,y+s*.2);ctx.quadraticCurveTo(x-s*1.1,y-s*.6,x+sway,y-s*2.2);ctx.closePath();fs(col||'#ff8a3c');
  ctx.fillStyle='#ffd86b';ctx.beginPath();ctx.moveTo(x+sway*.6,y-s*1.3);ctx.quadraticCurveTo(x+s*.5,y-s*.2,x,y+s*.25);ctx.quadraticCurveTo(x-s*.5,y-s*.2,x+sway*.6,y-s*1.3);ctx.fill()};
const b2add=(rgb,x,y,r,a)=>{ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x,y,r,a);ctx.restore()};

// --- GOLEM: stones orbiting him, moss with a flower and a mushroom on the shoulders, glowing eyes and rune, pebbles falling as he walks
{const rocks=(e,front)=>{if(e.st==='roll')return;const z=e.z||0;for(let i=0;i<3;i++){const a=(G.t||0)*1.1+i*TAU/3,s=Math.sin(a);if((s>0)!==front)continue;
    const px=e.x+Math.cos(a)*46,py=e.y-30-z+s*13+Math.sin((G.t||0)*2+i)*3,r=5+i%2*1.5;
    ctx.fillStyle='rgba(0,0,0,.18)';ell(px,e.y+4,r,r*.4);ctx.fill();
    ink(2);ctx.beginPath();for(let k=0;k<6;k++){const q=k/6*TAU+a,rr=r*(.8+.2*Math.sin(k*2.3+i));k?ctx.lineTo(px+Math.cos(q)*rr,py+Math.sin(q)*rr*.85):ctx.moveTo(px+Math.cos(q)*rr,py+Math.sin(q)*rr*.85)}ctx.closePath();fs(e.p2?'#6e655c':'#857b6c');
    ctx.fillStyle='rgba(255,255,255,.22)';ell(px-r*.3,py-r*.35,r*.4,r*.22);ctx.fill();
    if(e.p2){ctx.strokeStyle='#ff7a2e';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(px-r*.5,py);ctx.lineTo(px,py-r*.3);ctx.lineTo(px+r*.4,py+r*.2);ctx.stroke();b2add('255,120,40',px,py,10,.5)}
    else{ctx.fillStyle='#6fa040';ell(px+r*.1,py-r*.6,r*.5,r*.22);ctx.fill()}}};
  B2.golem={br:1.6,bra:.022,back:e=>rocks(e,false),front:(e,dt)=>{rocks(e,true);if(e.st==='roll'){if(b2every(e,'d',.06,dt))b2emit(e,{k:'dust',x:e.x+rand(-20,20),y:e.y+2,vx:rand(-20,20),vy:-rand(5,20),life:.6,r:4});return}
    const B=basis(e.face),v=B.v,f=B.f,z=e.z||0,cr=(e.st==='leap'&&e.sub==='a')||(e.st==='roll'&&e.sub==='a')?7:0,W=(lx,ly)=>[e.x+lx*f,e.y-z+ly];
    // moss, a flower and a little mushroom on the shoulders (lava cracks in phase 2)
    const sh=[W(-14,-48+cr),W(13,-50+cr)];
    if(!e.p2){ctx.lineCap='round';for(const[i,[sx,sy]] of sh.entries())for(let b=0;b<4;b++){const sw=Math.sin((G.t||0)*2.4+b+i)*1.4;ctx.strokeStyle=b%2?'#5a8a32':'#86c050';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(sx-4+b*2.6,sy+2);ctx.lineTo(sx-5+b*2.8+sw,sy-4-b%2*2.5);ctx.stroke()}
      {const[fx,fy]=sh[0];ctx.strokeStyle='#4f8a34';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(fx+2,fy+1);ctx.lineTo(fx+3+Math.sin((G.t||0)*2)*1.5,fy-9);ctx.stroke();const px=fx+3+Math.sin((G.t||0)*2)*1.5,py=fy-10;ctx.fillStyle='#f2a0c8';for(let k=0;k<5;k++){circ(px+Math.cos(k*1.26)*2,py+Math.sin(k*1.26)*1.6,1.5);ctx.fill()}ctx.fillStyle='#ffd23c';circ(px,py,1.2);ctx.fill()}
      {const[mx,my]=sh[1];ink(1.4);ctx.fillStyle='#efe3c8';ctx.fillRect(mx+1,my-5,2.4,5);ctx.strokeRect(mx+1,my-5,2.4,5);ctx.beginPath();ctx.ellipse(mx+2.2,my-5,4.6,3,0,Math.PI,0);ctx.closePath();fs('#d65b5b');ctx.fillStyle='#fff';circ(mx+.8,my-6.5,.8);ctx.fill()}}
    else for(const[i,[sx,sy]] of sh.entries())if(b2every(e,'em'+i,.18,dt))b2emit(e,{k:'ember',x:sx+rand(-6,6),y:sy,vx:rand(-8,8),vy:-rand(25,45),life:rand(.6,1),col:'255,130,50'});
    if(!B.back){const hx=v==='s'?0:v==='s34'?7:12,hy=-48+cr,eyeC=e.p2?'255,90,60':'127,224,240',pul=.6+.4*Math.sin((G.t||0)*3);
      const eyes=v==='s'?[hx-5,hx+5]:v==='s34'?[hx-2,hx+6]:[hx+7];for(const ex of eyes){const[a,b]=W(ex,hy+1);b2add(eyeC,a,b,9,.55*pul)}
      const rx=v==='s'?0:v==='s34'?6:10,[cx,cy]=W(rx,-22+cr);b2add(e.p2?'255,120,40':'140,220,90',cx,cy,16,.35+.25*Math.sin((G.t||0)*2.2))}
    if(e.moving&&b2every(e,'p',.25,dt))b2emit(e,{k:'pebble',x:e.x+rand(-22,22),y:e.y-z-rand(20,44),vy:rand(-20,10),g:420,gy:e.y,life:.6,r:rand(1.4,2.4),col:e.p2?'#6e655c':'#857b6c'})}}}

// --- WITCH: roots writhing at her feet, three spore lanterns circling her, leaves falling around
B2.witch={br:1.8,bra:.02,back:e=>{const t=G.t||0;ctx.lineCap='round';for(let i=0;i<6;i++){const a=i/6*TAU+.3,bx=e.x+Math.cos(a)*16,by=e.y+Math.sin(a)*6,len=16+6*Math.sin(t*1.7+i),sw=Math.sin(t*2.2+i*1.7)*7;
    const ex=bx+Math.cos(a)*len+sw,ey=by+Math.sin(a)*len*.45-6-Math.abs(Math.sin(t*1.3+i))*6,cx=bx+Math.cos(a)*len*.5-sw*.5,cy=by-8;
    for(const[c,w] of [[INK,5],[e.p2?'#6a3a2a':'#5a3f2a',2.8],['rgba(255,220,170,.25)',1]]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(cx,cy,ex,ey);ctx.stroke()}
    if(i%2===0){ctx.fillStyle=e.p2?'#ff8a3c':'#7bbf4a';ell(ex,ey,2.6,1.4,a);ctx.fill()}}},
  front:(e,dt)=>{const t=G.t||0,rgb=e.p2?'255,140,60':'123,240,192';
    for(let i=0;i<3;i++){const a=t*1.3+i*TAU/3,px=e.x+Math.cos(a)*30,py=e.y-34+Math.sin(a)*10+Math.sin(t*2.6+i)*3;
      ctx.strokeStyle='rgba(30,40,30,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px,py-6);ctx.lineTo(px,py-11);ctx.stroke();
      ink(1.6);ctx.beginPath();ctx.ellipse(px,py,3.6,5,0,0,TAU);fs(e.p2?'#c45a20':'#3f8a6a');b2add(rgb,px,py,13,.5+.3*Math.sin(t*4+i));ctx.fillStyle='rgba(255,255,230,.9)';circ(px-1,py-1.5,1.1);ctx.fill()}
    if(b2every(e,'lf',.35,dt))b2emit(e,{k:'leaf',x:e.x+rand(-30,30),y:e.y-rand(50,70),vy:rand(14,24),life:2.4,ph:rand(0,9),col:e.p2?pk(['#c4602a','#e08a3a']):pk(['#6fa040','#86b84a','#4f8a34'])})}};

// --- SALAMANDER: smoke from the nostrils, embers lifting off her back, the dorsal spikes lighting up in a wave
B2.salamander={br:3,bra:.012,front:(e,dt)=>{const t=G.t||0,tr=e.trail||[{x:e.x,y:e.y}];
    for(let i=7;i>=1;i--){const p=tr[Math.max(0,tr.length-1-i*6)],r=e.r*(1-i*.1),w=Math.max(0,Math.sin(t*5-i*.9));b2add('255,170,60',p.x,p.y-8-r*.9,7+w*6,.25+w*.5)}
    if(b2every(e,'em',.07,dt)){const p=tr[Math.max(0,tr.length-1-randi(1,7)*6)];b2emit(e,{k:'ember',x:p.x+rand(-6,6),y:p.y-14,vx:rand(-10,10),vy:-rand(30,60),life:rand(.6,1.1)})}
    if(b2every(e,'sm',.22,dt)){const a=Q8(e.face)*Math.PI/4;for(const s of [-1,1]){const lx=e.r*1.18,ly=s*e.r*.22;b2emit(e,{k:'smoke',x:e.x+Math.cos(a)*lx-Math.sin(a)*ly,y:e.y-10+Math.sin(a)*lx+Math.cos(a)*ly,vx:Math.cos(a)*14,vy:-rand(14,24),life:.9,r:2,col:'60,52,48'})}}}};

// --- SMITH: the forge in his chest breathes fire, smoke puffs from his shoulders, sparks fly when the hammer lands
B2.smith={br:1.7,bra:.016,front:(e,dt)=>{const t=G.t||0;b2add('255,120,40',e.x,e.y-30,20,.35+.2*Math.sin(t*3)+(e.p2?.15:0));
    if(b2every(e,'sm',.5,dt))for(const s of [-1,1])b2emit(e,{k:'smoke',x:e.x+s*11,y:e.y-50,vx:s*4,vy:-rand(18,26),life:1.2,r:2.4,col:'60,56,54'});
    if(b2every(e,'em',.16,dt))b2emit(e,{k:'ember',x:e.x+rand(-12,12),y:e.y-rand(30,50),vx:rand(-10,10),vy:-rand(25,45),life:rand(.7,1.1)});
    const slam=e.st==='slam'&&e.sub==='b';if(slam&&!e._b2slam){e._b2slam=1;const sx=e.sx!=null?e.sx:e.x,sy=e.sy!=null?e.sy:e.y;for(let i=0;i<16;i++){const a=rand(-Math.PI,0),s=rand(80,190);b2emit(e,{k:'spark',x:sx,y:sy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:380,life:rand(.35,.6)})}}if(!slam)e._b2slam=0}};

// --- TOAD KING: flies buzzing around his head, a glint on the crown, drool dripping from the corners of his mouth, bubbles at his feet
B2.toad={br:2,bra:.028,front:(e,dt)=>{const t=G.t||0,B=basis(e.face),z=e.z||0,ox=B.side?6:B.v==='s34'?Math.cos(B.qa)*6*B.f:0,sf=B.side?B.f:1;
    for(let i=0;i<3;i++){const a=t*(2.4+i*.5)+i*2.1,fx=e.x+Math.cos(a)*(30+i*5),fy=e.y-z-56+Math.sin(a*1.7)*10;ctx.fillStyle='rgba(255,255,255,.7)';const fl=Math.abs(Math.sin(t*60+i));ell(fx-2,fy-2,2.4,1.2*fl+.3,-.5);ctx.fill();ell(fx+2,fy-2,2.4,1.2*fl+.3,.5);ctx.fill();ctx.fillStyle=INK;circ(fx,fy,1.6);ctx.fill()}
    if(b2every(e,'gl',1.6,dt))b2emit(e,{k:'glint',x:e.x+ox*.5*sf+rand(-6,6),y:e.y-z-64,life:.5,r:5,col:'255,230,120'});
    if(!B.back&&!z&&b2every(e,'dr',.9,dt)){const s=B.side?1:pk([-1,1]),mx=e.x+(B.side?30*B.f:ox+s*23),my=e.y-29;b2emit(e,{k:'drip',x:mx,y:my,vy:10,g:200,gy:e.y+2,life:2,col:'rgba(200,240,170,.9)'})}
    if(b2every(e,'bu',.5,dt))b2emit(e,{k:'bubble',x:e.x+rand(-34,34),y:e.y+rand(0,6),vy:-rand(6,12),life:.8,r:rand(1.5,3)})}};

// --- HYDRA: venom dripping from every mouth into the water, bubbles and mist on the pool, eyes that glow
B2.hydra={br:1.5,bra:.012,back:e=>{const t=G.t||0;ctx.save();ctx.globalCompositeOperation='lighter';glow(e.p2?'170,120,255':'150,255,170',e.x,e.y-4,70,.12+.05*Math.sin(t*1.4),26);ctx.restore()},
  front:(e,dt)=>{if(!e.heads)return;const t=G.t||0,sink=e.sink||0;
    for(const h of e.heads){const p=hydraHead(e,h);b2add(e.p2?'190,140,255':'200,255,120',p.x,p.y-2,10,.35+.2*Math.sin(t*3+h.s));
      if(sink<.3&&b2every(e,'v'+(h.s+1),.6+.25*(h.s+1),dt))b2emit(e,{k:'drip',x:p.x+rand(-3,3),y:p.y+8,vy:20,g:260,gy:e.y+rand(-2,6),life:2,col:e.p2?'rgba(200,160,255,.95)':'rgba(170,255,120,.95)'})}
    if(b2every(e,'bu',.25,dt))b2emit(e,{k:'bubble',x:e.x+rand(-46,46),y:e.y+rand(-6,8),vy:-rand(5,10),life:.9,r:rand(1.4,3),col:e.p2?'210,180,255':'190,255,170'})}};

// --- YETI: frosty breath clouds, snow falling around him, frost glittering on his fur
B2.yeti={br:1.7,bra:.022,front:(e,dt)=>{const B=basis(e.face),v=B.v,z=e.z||0,cr=e.st==='leap'&&e.sub==='a'?8:0;
    if(!B.back&&b2every(e,'br',1.3,dt)){const hx=v==='s'?0:v==='s34'?7:12,mx=e.x+(hx+(B.side?12:0))*B.f,my=e.y-z-50+cr,dir=B.side?B.f:Math.cos(e.face)*.6;for(let i=0;i<4;i++)b2emit(e,{k:'vapor',x:mx,y:my,vx:dir*rand(14,26)+rand(-5,5),vy:rand(2,10),drag:1.5,life:rand(.7,1),r:2+i*.6})}
    if(b2every(e,'sn',.12,dt))b2emit(e,{k:'snow',x:e.x+rand(-50,50),y:e.y-z-rand(70,90),vy:rand(18,28),life:2.4,ph:rand(0,9),r:rand(1,1.8)});
    if(b2every(e,'gl',.45,dt))b2emit(e,{k:'glint',x:e.x+rand(-24,24),y:e.y-z-30+rand(-24,20),life:.45,r:3.5,col:'200,240,255'})}};

// --- ICE QUEEN: three big crystals orbiting her (in front and behind), freezing mist at her feet, frost falling from her wings
{const shards=(e,front)=>{const t=G.t||0;for(let i=0;i<3;i++){const a=t*.9+i*TAU/3,s=Math.sin(a);if((s>0)!==front)continue;const px=e.x+Math.cos(a)*42,py=e.y-34+s*12+Math.sin(t*2+i)*3;
    ctx.save();ctx.translate(px,py);ctx.rotate(Math.sin(t+i)*.3);ink(1.8);ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(4.5,-1);ctx.lineTo(2.5,8);ctx.lineTo(-2.5,8);ctx.lineTo(-4.5,-1);ctx.closePath();fs(e.p2?'#c8b8ff':'#bfe6ff');
    ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(2,-1);ctx.lineTo(0,5);ctx.closePath();ctx.fill();ctx.restore();b2add(e.p2?'190,160,255':'170,225,255',px,py,14,.35*(e.alpha==null?1:e.alpha))}};
  B2.icequeen={br:1.4,bra:.012,back:e=>{if(e.hidden)return;const t=G.t||0;ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++)glow('200,235,255',e.x+Math.sin(t*.7+i*2)*16,e.y+8,26,.16,8);ctx.restore();shards(e,false)},
    front:(e,dt)=>{if(e.hidden)return;shards(e,true);if(b2every(e,'fr',.15,dt))b2emit(e,{k:'snow',x:e.x+rand(-28,28),y:e.y-rand(36,50),vy:rand(14,24),life:1.6,ph:rand(0,9),r:rand(.9,1.5)})}}}

// --- MIMIC: gold glinting inside its mouth, drool from its tongue, a sly glint on the lock to lure you in, dust when it lands
B2.mimic={br:2.6,bra:.03,front:(e,dt)=>{const t=e.t||0,B=basis(e.face),side=B.side,z=e.z||0,m=e.intro>0?1:(e.mouth||0),chew=e.st==='walk'?Math.abs(Math.sin(t*6))*.35:0,op=Math.max(m,chew),S=1.4,W=(lx,ly)=>[e.x+lx*S*B.f,e.y-z+ly*S],H=13,bw=side?17*.8:17;
    if(!B.back&&op>=.05){const ex=side?bw*.35:0;
      for(const dx of [-6,0,6]){const[cx,cy]=W(ex+dx,-H+1);ctx.fillStyle='#ffd23c';ink(1.2);ctx.beginPath();ctx.ellipse(cx,cy,2.4,1.4,0,0,TAU);ctx.fill();ctx.stroke()}
      if(b2every(e,'gl',.5,dt)){const[cx,cy]=W(ex+rand(-8,8),-H);b2emit(e,{k:'glint',x:cx,y:cy,life:.4,r:3.5,col:'255,220,120'})}
      const tg=Math.sin(t*8)*3,[tx,ty]=W(ex+(side?14:5)+tg,-H+10+op*8);if(b2every(e,'dr',.45,dt))b2emit(e,{k:'drip',x:tx,y:ty,vy:15,g:240,gy:e.y+4,life:2,col:'rgba(240,200,210,.95)'})}
    else if(!B.back&&!z){if(b2every(e,'lu',1.4,dt)){const[lx,ly]=W(0,-H);b2emit(e,{k:'glint',x:lx,y:ly-2,life:.6,r:6,col:'255,230,140'})}if(b2every(e,'co',.5,dt)){const[lx,ly]=W(rand(-12,12),-H);b2emit(e,{k:'coin',x:lx,y:ly,vy:-rand(14,24),life:.9,ph:rand(0,9)})}}
    if(e._b2z>6&&z<1)for(let i=0;i<8;i++){const a=i/8*TAU;b2emit(e,{k:'dust',x:e.x+Math.cos(a)*18,y:e.y+4+Math.sin(a)*6,vx:Math.cos(a)*30,vy:Math.sin(a)*10-5,drag:3,life:.5,r:3})}e._b2z=z}};

// ===================== signature pieces =====================
// GOLEM: a cluster of living crystals on his back, glowing veins running from the rune across his body
{const g=B2.golem,ob=g.back,of=g.front;
  const crystals=(e)=>{const B=basis(e.face),f=B.f,z=e.z||0,cr=(e.st==='leap'&&e.sub==='a')?7:0,t=G.t||0,bx=e.x-2*f,by=e.y-z-56+cr,sw=Math.sin(t*1.3)*3,top=[bx+sw*.6,by-30];
    // trunk and two branches, mossy wood
    ctx.lineCap='round';for(const[c,w] of [[INK,8],['#6b4a2a',5]]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(bx,by+6);ctx.quadraticCurveTo(bx-4*f,by-14,...top);ctx.moveTo(bx-1*f,by-12);ctx.quadraticCurveTo(bx-12*f,by-18,bx-16*f+sw,by-26);ctx.moveTo(bx+1*f,by-18);ctx.quadraticCurveTo(bx+10*f,by-22,bx+14*f+sw,by-32);ctx.stroke()}
    // leafy crown in three clumps; in phase 2 the leaves are burning
    const clumps=[[top[0],top[1]-6,13],[bx-16*f+sw,by-28,9],[bx+14*f+sw,by-34,10]];
    for(const[cx,cy,r] of clumps){ink(2.4);ctx.beginPath();for(let k=0;k<8;k++){const a=k/8*TAU,q=r*(k%2?.82:1.05);ctx.lineTo(cx+Math.cos(a)*q,cy+Math.sin(a)*q*.85)}ctx.closePath();fs(e.p2?'#c4602a':'#4f8a34');
      ctx.fillStyle=e.p2?'#ff9a3c':'#7bbf4a';ctx.beginPath();ctx.ellipse(cx-r*.25,cy-r*.3,r*.55,r*.38,0,0,TAU);ctx.fill();
      if(e.p2){b2fl(cx,cy-r*.6,r*.35*(1+.2*Math.sin(t*12+cx)),Math.sin(t*9+cy)*2)}else{ctx.fillStyle='#f2a0c8';circ(cx+r*.4,cy-r*.1,1.6);ctx.fill()}}
    // fireflies living in the little tree
    if(!e.p2){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const a=t*1.4+i*1.6,px=top[0]+Math.cos(a)*18,py=top[1]+Math.sin(a*1.3)*10,bl=.4+.6*Math.max(0,Math.sin(t*3+i*2));glow('220,255,120',px,py,7,.7*bl);ctx.fillStyle=`rgba(255,255,220,${bl})`;circ(px,py,1.2);ctx.fill()}ctx.restore()}};
  g.back=(e,dt)=>{if(e.st!=='roll'&&!basis(e.face).back)crystals(e);ob(e,dt)};
  g.front=(e,dt)=>{of(e,dt);if(e.st==='roll')return;const B=basis(e.face);if(B.back){crystals(e);return}
    const f=B.f,z=e.z||0,cr=(e.st==='leap'&&e.sub==='a')||(e.st==='roll'&&e.sub==='a')?7:0,v=B.v,rx=v==='s'?0:v==='s34'?6:10,t=G.t||0,rgb=e.p2?'255,140,50':'150,255,150',W=(lx,ly)=>[e.x+lx*f,e.y-z+ly+cr];
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
    for(const path of [[[rx,-22],[rx-10,-30],[-20,-34],[-26,-26]],[[rx,-22],[rx+9,-31],[18,-38],[24,-30]],[[rx,-22],[rx-8,-12],[-18,-8]],[[rx,-22],[rx+8,-12],[19,-6]]]){
      const pts=path.map(([a,b])=>W(a,b));const pulse=(Math.sin(t*3-path.length)+1)/2;
      ctx.strokeStyle=`rgba(${rgb},${.35+.4*pulse})`;ctx.lineWidth=2.2;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();
      const q=(t*.8)%1,i0=Math.min(pts.length-2,Math.floor(q*(pts.length-1))),u=q*(pts.length-1)-i0,px=pts[i0][0]+(pts[i0+1][0]-pts[i0][0])*u,py=pts[i0][1]+(pts[i0+1][1]-pts[i0][1])*u;glow(rgb,px,py,6,.9)}
    ctx.restore()}}

// WITCH: a halo of thorny roots turning behind her head, its buds glowing
{const w=B2.witch,ob=w.back;w.back=(e,dt)=>{ob(e,dt);const t=G.t||0,cx=e.x,cy=e.y-8-Math.sin(t*2.5)*3-19*1.35,R=30,rgb=e.p2?'255,150,60':'130,80,190';
  ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,cx,cy,R*1.5,.35);ctx.restore();ctx.lineCap='round';
  for(let i=0;i<10;i++){const a0=t*.35+i/10*TAU,a1=a0+TAU/10*.8,mid=(a0+a1)/2;const p0=[cx+Math.cos(a0)*R,cy+Math.sin(a0)*R],p1=[cx+Math.cos(a1)*R,cy+Math.sin(a1)*R],pc=[cx+Math.cos(mid)*R*1.18,cy+Math.sin(mid)*R*1.18];
    for(const[c,lw] of [[INK,6],[e.p2?'#6a3a2a':'#5a3f2a',3.4]]){ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(...p0);ctx.quadraticCurveTo(...pc,...p1);ctx.stroke()}
    const sx=cx+Math.cos(mid)*R*1.12,sy=cy+Math.sin(mid)*R*1.12;ink(1.4);ctx.beginPath();ctx.moveTo(sx+Math.cos(mid)*7,sy+Math.sin(mid)*7);ctx.lineTo(sx+Math.cos(mid+1.6)*2.4,sy+Math.sin(mid+1.6)*2.4);ctx.lineTo(sx+Math.cos(mid-1.6)*2.4,sy+Math.sin(mid-1.6)*2.4);ctx.closePath();fs('#3a2a1c');
    if(i%2===0){const bx=cx+Math.cos(a0)*R,by=cy+Math.sin(a0)*R;ink(1.4);circ(bx,by,3.2);fs(e.p2?'#ff8a3c':'#a15ad0');ctx.fillStyle='rgba(255,255,255,.75)';circ(bx-1,by-1,1);ctx.fill();ctx.save();ctx.globalCompositeOperation='lighter';glow(e.p2?'255,150,60':'170,110,230',bx,by,10,.6+.3*Math.sin(t*4+i));ctx.restore()}}}}

// SALAMANDER: living flames dancing along her whole back, the floor glowing under her
{const s=B2.salamander,of=s.front;s.back=(e)=>{const tr=e.trail||[{x:e.x,y:e.y}];ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<=7;i+=2){const p=tr[Math.max(0,tr.length-1-i*6)];glow('255,90,30',p.x,p.y+2,34,.22,14)}ctx.restore()};
  s.front=(e,dt)=>{of(e,dt);const t=G.t||0,tr=e.trail||[{x:e.x,y:e.y}];for(let i=7;i>=1;i--){const p=tr[Math.max(0,tr.length-1-i*6)],r=e.r*(1-i*.1);for(let k=-1;k<=1;k++){const fl=1+.25*Math.sin(t*14+i*1.7+k*2);b2fl(p.x+k*r*.35,p.y-8-r*.85,r*.22*fl*(k?0.8:1.1),Math.sin(t*9+i+k)*2.4)}
    ctx.save();ctx.globalCompositeOperation='lighter';glow('255,150,50',p.x,p.y-8-r,r*1.1,.35);ctx.restore()}
    {const a=Q8(e.face)*Math.PI/4,hx=e.x+Math.cos(a)*e.r*.4,hy=e.y-10+Math.sin(a)*e.r*.4,fl=1+.2*Math.sin(t*12);b2fl(hx-Math.sin(a)*4,hy-e.r*.75,e.r*.3*fl,Math.sin(t*8)*3);b2fl(hx+Math.sin(a)*4,hy-e.r*.7,e.r*.24*fl,Math.sin(t*9+1)*3)}}}

// SMITH: a mane of fire blazing behind his head and shoulders
{const sm=B2.smith,ob=sm.back;sm.back=(e,dt)=>{if(ob)ob(e,dt);const t=G.t||0,cx=e.x,cy=e.y-19*1.9,big=e.p2?1.35:1;
  for(let i=0;i<9;i++){const an=-Math.PI*(.08+.84*i/8),r=22,fx=cx+Math.cos(an)*r,fy=cy+Math.sin(an)*r*.95,s=(5.5+3*Math.sin(t*11+i*1.9))*big*(i===4?1.4:i%2?1:1.15);b2fl(fx,fy,s,Math.sin(t*8+i)*3,i%2?'#ff6a1a':'#ff8a3c')}
  for(const sd of [-1,1])for(let k=0;k<2;k++){const fx=cx+sd*(15+k*6),fy=cy+19+k*3,s=(5+2*Math.sin(t*12+k+sd))*big;b2fl(fx,fy,s,Math.sin(t*9+k)*2)}
  ctx.save();ctx.globalCompositeOperation='lighter';glow('255,130,40',cx,cy-6,60*big,.35+.1*Math.sin(t*7));ctx.restore()}}

// TOAD KING: a swarm of fireflies and a crown jewel that shines; ripples spread in the swamp water under him
{const td=B2.toad,of=td.front;td.back=(e,dt)=>{const t=G.t||0;if(!(e.z>4))for(let k=0;k<3;k++){const q=((t*.5+k/3)%1);ctx.strokeStyle=`rgba(200,240,170,${.45*(1-q)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y+4,e.r*(.9+q*1.4),e.r*(.9+q*1.4)*.4,0,0,TAU);ctx.stroke()}};
  td.front=(e,dt)=>{of(e,dt);const t=G.t||0,B=basis(e.face),z=e.z||0,ox=B.side?6:B.v==='s34'?Math.cos(B.qa)*6*B.f:0,sf=B.side?B.f:1,cx=e.x+ox*.5*sf,cy=e.y-z-60;
    ctx.save();ctx.globalCompositeOperation='lighter';glow('255,90,90',cx,cy+1,10,.6+.3*Math.sin(t*3));glow('255,220,120',cx,cy-4,26,.25);
    for(let i=0;i<12;i++){const a=t*(.6+i%3*.2)+i*.52,r=40+Math.sin(t*.7+i)*12,px=e.x+Math.cos(a)*r,py=e.y-z-30+Math.sin(a*1.3)*22,bl=.4+.6*Math.max(0,Math.sin(t*3+i*1.7));glow(e.p2?'255,170,60':'210,255,90',px,py,8,.6*bl);ctx.fillStyle=`rgba(255,255,220,${bl})`;circ(px,py,1.3);ctx.fill()}
    if(!B.back){const sac=.5+.5*Math.sin(t*2);glow('255,230,150',e.x+ox*sf,e.y-z-14,18+sac*8,.18+sac*.12)}ctx.restore()}}

// HYDRA: spiked crests flaring behind every head, a cloud of venom over the pool
{const hy=B2.hydra,ob=hy.back;hy.back=(e,dt)=>{ob(e,dt);if(!e.heads)return;const t=G.t||0,col=e.p2?'#6a4aa8':'#2f7a5a',rgb=e.p2?'170,120,230':'140,220,120';
  for(const h of e.heads){const p=hydraHead(e,h);for(let k=-2;k<=2;k++){const an=-Math.PI/2+k*.38+Math.sin(t*3+h.s)*.06,len=(k===0?20:15-Math.abs(k)*1.5)*(1+.08*Math.sin(t*5+k));ink(1.8);ctx.beginPath();ctx.moveTo(p.x+Math.cos(an-.16)*7,p.y-4+Math.sin(an-.16)*7);ctx.lineTo(p.x+Math.cos(an)*len,p.y-4+Math.sin(an)*len);ctx.lineTo(p.x+Math.cos(an+.16)*7,p.y-4+Math.sin(an+.16)*7);ctx.closePath();fs(col);ctx.fillStyle='#ffd23c';circ(p.x+Math.cos(an)*(len-2),p.y-4+Math.sin(an)*(len-2),1.8);ctx.fill()}
    ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,p.x,p.y-12,20,.35);ctx.restore()}
  ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<4;k++)glow(rgb,e.x+Math.sin(t*.5+k*1.6)*50,e.y-10+Math.cos(t*.4+k)*8,40,.1);ctx.restore()}}

// YETI: a ridge of glowing ice spikes along his back, a little blizzard spinning round him
{const ye=B2.yeti,of=ye.front;const spikes=(e)=>{const B=basis(e.face),f=B.f,z=e.z||0,cr=e.st==='leap'&&e.sub==='a'?8:0,t=G.t||0,rgb='160,225,255',fill='#d8f2ff',pul=.4+.25*Math.sin(t*2.2);
    for(const[lx,ly,w,hg,r] of [[-22,-44,5,16,-.7],[-13,-54,6,22,-.35],[0,-60,7,28,0],[13,-54,6,22,.35],[22,-44,5,16,.7]])b2shard(e.x+lx*f,e.y-z+ly+cr,w,hg,r*f,fill,rgb,pul)};
  ye.back=(e,dt)=>{if(!basis(e.face).back)spikes(e)};
  ye.front=(e,dt)=>{if(basis(e.face).back)spikes(e);of(e,dt);if(b2every(e,'bz',.05,dt))b2emit(e,{k:'mote',e,a:rand(0,TAU),rad:e.r*rand(1.3,1.9),h0:rand(-10,30),life:rand(.9,1.3),col:'235,248,255'})}}

// ICE QUEEN: a halo of long ice spikes behind her head, and ribbons of aurora drifting behind her
{const iq=B2.icequeen,ob=iq.back;iq.back=(e,dt)=>{if(e.hidden)return;const t=G.t||0,cx=e.x,cy=e.y-8-Math.sin(t*2.5)*3-19*1.6,rgb=e.p2?'200,160,255':'170,225,255',fill=e.p2?'#d8c8ff':'#d8f0ff';
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';for(let r=0;r<2;r++){ctx.strokeStyle=`rgba(${r?'140,255,210':rgb},.22)`;ctx.lineWidth=10;ctx.beginPath();for(let k=0;k<=12;k++){const u=k/12,px=cx-60+u*120,py=cy+10+r*16+Math.sin(t*1.6+u*6+r*2)*10-Math.sin(u*Math.PI)*18;k?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.stroke()}glow(rgb,cx,cy,50,.4);ctx.restore();
  for(let i=0;i<9;i++){const an=-Math.PI*(.1+.8*i/8),len=(i===4?34:i%2?20:26)*(1+.05*Math.sin(t*3+i));b2shard(cx+Math.cos(an)*12,cy+Math.sin(an)*12,i===4?5:3.6,len,an+Math.PI/2,fill,i%2?null:rgb,.35)}
  ob(e,dt)}}

// MIMIC: a cursed purple aura, a ring of gold coins spinning around it, chains with a padlock floating
{const mm=B2.mimic,of=mm.front;mm.back=(e,dt)=>{const t=G.t||0;ctx.save();ctx.globalCompositeOperation='lighter';glow('255,190,70',e.x,e.y-e.z-16,46,.3+.1*Math.sin(t*4));ctx.restore();
  for(let i=0;i<8;i++){const a=t*1.6+i/8*TAU;if(Math.sin(a)>0)continue;const px=e.x+Math.cos(a)*38,py=e.y-e.z-16+Math.sin(a)*12;ctx.fillStyle='#ffd23c';ink(1.4);ctx.beginPath();ctx.ellipse(px,py,4*Math.abs(Math.cos(t*5+i))+.6,4,0,0,TAU);ctx.fill();ctx.stroke()}};
  mm.front=(e,dt)=>{of(e,dt);const t=G.t||0;
    for(let i=0;i<8;i++){const a=t*1.6+i/8*TAU;if(Math.sin(a)<=0)continue;const px=e.x+Math.cos(a)*38,py=e.y-e.z-16+Math.sin(a)*12;ctx.fillStyle='#ffd23c';ink(1.4);ctx.beginPath();ctx.ellipse(px,py,4*Math.abs(Math.cos(t*5+i))+.6,4,0,0,TAU);ctx.fill();ctx.stroke();ctx.save();ctx.globalCompositeOperation='lighter';glow('255,215,90',px,py,8,.5);ctx.restore()}
    const cx=e.x+Math.sin(t*1.2)*6,cy=e.y-e.z-62+Math.sin(t*2)*4;ctx.strokeStyle=INK;ctx.lineWidth=1.4;for(let k=0;k<5;k++){const lx=cx-14+k*7,ly=cy-6+Math.sin(t*3+k)*2;ctx.fillStyle='#9aa3ad';ctx.beginPath();ctx.ellipse(lx,ly,3.6,2.2,k%2?.6:-.6,0,TAU);ctx.stroke()}
    ink(1.8);ctx.beginPath();ctx.rect(cx-5,cy-2,10,9);fs('#d9a640');ctx.beginPath();ctx.arc(cx,cy-2,3.6,Math.PI,0);ctx.stroke();ctx.fillStyle=INK;circ(cx,cy+2,1.2);ctx.fill();
    if(e.st==='chomp'||(e.mouth||0)>.5)if(b2every(e,'pf',.06,dt))b2emit(e,{k:'coin',x:e.x+rand(-10,10),y:e.y-e.z-22,vx:rand(-40,40),vy:-rand(40,70),g:260,life:.7,ph:rand(0,9)})}}

// ===================== GOLEM: simple again, like the original, with just a few cracks in the stone =====================
B2.golem={br:1.6,bra:.012,front:(e)=>{if(e.st==='roll')return;const B=basis(e.face),z=e.z||0,cr=(e.st==='leap'&&e.sub==='a')||(e.st==='roll'&&e.sub==='a')?7:0,v=B.v;
  ctx.save();ctx.translate(e.x,e.y-z);ctx.scale(B.f,1);
  const crack=(pts,lava)=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y+cr):ctx.moveTo(x,y+cr));ctx.strokeStyle=lava?'#ff7a2e':'rgba(28,22,18,.75)';ctx.lineWidth=lava?1.8:1.5;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
    if(!lava){ctx.save();ctx.translate(.8,.9);ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y+cr):ctx.moveTo(x,y+cr));ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1;ctx.stroke();ctx.restore()}};
  ctx.save();ctx.beginPath();ctx.ellipse(0,-25+cr,B.side?24:31,25-cr*.5,0,0,TAU);ctx.clip();
  crack([[-27,-30],[-20,-27],[-18,-21],[-12,-19]],e.p2);crack([[24,-12],[18,-9],[17,-3]],e.p2);if(B.back)crack([[-4,-44],[0,-36],[-3,-28],[2,-22]],e.p2);
  ctx.restore();
  if(!B.back){const hx=v==='s'?0:v==='s34'?7:12,hy=-48+cr;ctx.save();ctx.beginPath();ctx.arc(hx,hy,12,0,TAU);ctx.clip();crack([[hx+3,-60],[hx+5,-55],[hx+2,-52]],e.p2);ctx.restore()}
  if(e.p2){ctx.restore();ctx.save();ctx.globalCompositeOperation='lighter';glow('255,110,40',e.x-15*B.f,e.y-z-24+cr,8,.35+.2*Math.sin((G.t||0)*6));ctx.restore();return}
  ctx.restore()}};

// =====================================================================
// THE ARENA REACTS: every blow of a boss leaves a mark on the room. Obstacles shake and crack, stones and icicles fall
// from above, fire scorches the floor and sets wood alight, grass burns, frost spreads, roots and flowers stay on the floor,
// water splashes into new puddles, the torches change colour with the magic
// =====================================================================
const ENV2={
  rocks(x,y,R,dmg){for(const k of G.rocks){const d=Math.hypot(k.x-x,k.y-y)-k.r;if(d>R)continue;const f=1-Math.max(0,d)/R;k.hit=Math.max(k.hit||0,.1+.22*f);if(!k.temp&&dmg)k.dmg=(k.dmg||0)+dmg*f;
    for(let i=0;i<2;i++)G.fx.push({k:'puff',x:k.x+rand(-k.r,k.r)*.6,y:k.y-kH(k)*rand(.4,1),vx:rand(-24,24),vy:rand(-14,6),t:rand(.3,.6),r:rand(3,6)});
    if(isIce(themeOf(G.room)))for(let i=0;i<3;i++)G.debris.push({x:k.x+rand(-k.r,k.r),y:k.y,z:kH(k)*rand(.6,1),vx:rand(-30,30),vy:rand(-10,10),vz:rand(40,90),col:'#ffffff',s:rand(1.4,2.4),rot:0,vr:rand(-6,6),life:1.4})}},
  // chunks of floor thrown up around an impact
  chunks(x,y,n,cols,R){for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(40,R||120);G.debris.push({x:x+Math.cos(a)*8,y:y+Math.sin(a)*4,z:2,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.5,vz:rand(120,260),col:pk(cols),s:rand(1.8,3.4),rot:rand(0,TAU),vr:rand(-12,12),life:2.2})}},
  // things falling from the ceiling: stones, or icicles in the frozen rooms
  fall(n,ice){if(!ice){fallingPebbles(n);return}for(let i=0;i<n;i++)G.debris.push({x:rand(L+10,R-10),y:rand(TOP+10,BOT-10),z:rand(180,300),vx:0,vy:0,vz:-10,col:pk(['#e8f6ff','#bfe9ff','#ffffff']),s:rand(2.2,3.6),rot:Math.PI/2,vr:0,life:3.2,fall:true})},
  // the torches burn in the colour of the magic for a while
  torches(cols,light,sec){if(!G.env)return;if(!G.env._base)G.env={...G.env,_base:G.env};G.env.torch=cols;G.env.light=light;G._tT=sec;for(const t of G.torches||[])for(let i=0;i<5;i++)G.embers.push({k:'ember',x:t.x+rand(-3,3),y:t.y-16,vx:rand(-20,20),vy:rand(-70,-30),life:rand(.5,1),max:1,ph:rand(0,9)})},
  burnGrass(x,y,r){if(!G.tufts)return;for(let i=G.tufts.length-1;i>=0;i--){const t=G.tufts[i];if(Math.hypot(t.x-x,(t.y-y)*1.6)<r){G.tufts.splice(i,1);for(let k=0;k<3;k++)G.embers.push({k:'ember',x:t.x+rand(-4,4),y:t.y-4,vx:rand(-10,10),vy:rand(-50,-20),life:rand(.4,.9),max:.9,ph:rand(0,9)});G.fx.push({k:'puff',x:t.x,y:t.y-4,vx:0,vy:-14,t:.5,r:4})}}},
  wiltGrass(x,y,r){if(!G.tufts)return;for(let i=G.tufts.length-1;i>=0;i--){const t=G.tufts[i];if(Math.hypot(t.x-x,(t.y-y)*1.6)<r){G.tufts.splice(i,1);G.debris.push({x:t.x,y:t.y,z:6,vx:rand(-10,10),vy:0,vz:20,col:'#6a5a2a',s:2,rot:0,vr:2,life:1.6,leaf:true})}}},
  ignite(x,y,r){for(const k of G.rocks){if(!WOOD2[k.kind]||k.temp)continue;if(Math.hypot(k.x-x,k.y-y)<r+k.r&&!(k.burn>0)){k.burn=4.5;k.burnt=1}}},
  // marks left on the floor for the rest of the fight
  mark(kind,x,y,r){const c=fx;c.save();c.setTransform(2,0,0,2,0,0);c.lineCap='round';c.lineJoin='round';
    if(kind==='scorch'||kind==='cracks'||kind==='crater'){c.restore();stamp(kind,x,y,r);return}
    if(kind==='frost'){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(235,248,255,.55)');g.addColorStop(1,'rgba(235,248,255,0)');c.fillStyle=g;c.beginPath();c.ellipse(x,y,r,r*.5,0,0,TAU);c.fill();
      c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=1.2;for(let i=0;i<9;i++){const a=i/9*TAU+rand(-.2,.2),L0=r*rand(.6,1);c.beginPath();c.moveTo(x,y);const ex=x+Math.cos(a)*L0,ey=y+Math.sin(a)*L0*.5;c.lineTo(ex,ey);for(const u of [.45,.7]){const bx=x+(ex-x)*u,by=y+(ey-y)*u;for(const s of [-1,1]){c.moveTo(bx,by);c.lineTo(bx+Math.cos(a+s*.8)*5,by+Math.sin(a+s*.8)*2.5)}}c.stroke()}}
    else if(kind==='roots'){for(let i=0;i<5;i++){const a=rand(0,TAU),len=r*rand(.6,1.1),cx=x+Math.cos(a+.5)*len*.5,cy=y+Math.sin(a+.5)*len*.25,ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len*.5;for(const[col,w] of [['#1b1612',4.5],['#4a3424',2.4]]){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(cx,cy,ex,ey);c.stroke()}
      if(Math.random()<.6){c.fillStyle='#4f8a34';c.beginPath();c.ellipse(ex,ey,3,1.6,a,0,TAU);c.fill()}}}
    else if(kind==='bloom'){for(let i=0;i<7;i++){const a=rand(0,TAU),d=rand(.2,1)*r,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.5;c.strokeStyle='#4f8a34';c.lineWidth=1.2;c.beginPath();c.moveTo(px,py+3);c.lineTo(px,py);c.stroke();const col=pk(['#c48ae8','#f2a0c8','#f6ead2']);c.fillStyle=col;for(let k=0;k<5;k++){c.beginPath();c.arc(px+Math.cos(k*1.26)*1.9,py+Math.sin(k*1.26)*1.5,1.3,0,TAU);c.fill()}c.fillStyle='#ffd23c';c.beginPath();c.arc(px,py,.9,0,TAU);c.fill()}}
    else if(kind==='toxic'){for(let i=0;i<4;i++){const px=x+rand(-r,r)*.6,py=y+rand(-r,r)*.3,rr=r*rand(.3,.55);const g=c.createRadialGradient(px,py,0,px,py,rr);g.addColorStop(0,'rgba(120,200,60,.5)');g.addColorStop(1,'rgba(120,200,60,0)');c.fillStyle=g;c.beginPath();c.ellipse(px,py,rr,rr*.5,0,0,TAU);c.fill()}}
    else if(kind==='puddle'){const rx=r,ry=r*.5,pts=[...Array(12)].map((_,k)=>{const a=k/12*TAU,q=1+rand(-.12,.12);return[x+Math.cos(a)*rx*q,y+Math.sin(a)*ry*q]});const sh=(sc)=>{c.beginPath();pts.forEach(([px,py],k)=>{const X=x+(px-x)*sc,Y=y+(py-y)*sc;k?c.lineTo(X,Y):c.moveTo(X,Y)});c.closePath()};
      sh(1.2);c.fillStyle='rgba(0,0,0,.16)';c.fill();const g=c.createLinearGradient(0,y-ry,0,y+ry);g.addColorStop(0,'rgba(20,34,28,.88)');g.addColorStop(1,'rgba(80,110,90,.6)');sh(1);c.fillStyle=g;c.fill();c.strokeStyle='rgba(255,255,255,.2)';c.lineWidth=1.2;c.beginPath();c.moveTo(x-rx*.4,y+ry*.2);c.lineTo(x+rx*.1,y+ry*.2);c.stroke();
      (G.puddles=G.puddles||[]).push({x,y,rx:rx*.9,ry:ry*.9})}
    else if(kind==='coins'){for(let i=0;i<8;i++){const px=x+rand(-r,r),py=y+rand(-r,r)*.45;c.fillStyle=pk(['#ffd23c','#f2b800','#c98a0c']);c.strokeStyle='#1b1612';c.lineWidth=.8;c.beginPath();c.ellipse(px,py,2.6,1.3,0,0,TAU);c.fill();c.stroke()}}
    c.restore()},
  splash(x,y,n,col){for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(30,110);G.debris.push({x,y,z:4,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.5,vz:rand(120,240),col,s:1.8,rot:0,vr:0,life:2,drop:true})}for(let k=0;k<3;k++)G.ripples.push({x,y,r:4+k*6,max:30+k*16,a:1})}};
const WOOD2={stump:1,crate:1,deadtree:1,totem:1,reeds:1,thorns:1};
const ICE_T=['#7fd3f0','#c9f3ff','#ffffff'],ICE_L='140,210,255';
// when each boss changes move: [from state|sub] -> [to state|sub]
function b2react(e,ps,pb,ns,nb){const x=e.x,y=e.y,ice=isIce(themeOf(G.room)),S=stonePal(),stone=[S.hi,S.mid,S.lo];
  switch(e.type){
    case 'golem':
      if(ps==='leap'&&pb==='air'){ENV2.rocks(x,y,190,3);ENV2.fall(e.p2?14:9);ENV2.chunks(x,y,18,stone,150);ENV2.mark('cracks',x,y,60);ENV2.wiltGrass(x,y,70);for(const t of G.torches||[])t.ph+=2}
      if(ns==='roll'&&nb==='roll')e._rollMark=0;break;
    case 'witch':
      if(ns==='blink'&&nb==='a'){ENV2.mark('roots',x,y+4,34);ENV2.wiltGrass(x,y,50)}
      if(ps==='blink'){ENV2.mark('bloom',x,y+4,26);for(let i=0;i<10;i++)G.debris.push({x:x+rand(-20,20),y,z:rand(30,60),vx:rand(-30,30),vy:0,vz:rand(10,40),col:pk(['#c48ae8','#7bbf4a']),s:2,rot:rand(0,TAU),vr:3,life:2,leaf:true})}
      if(ns==='spiral'||ns==='summon')ENV2.torches(e.p2?['#ff3c10','#ff8a22','#ffe6a0']:['#7a2fd0','#c07aff','#f4e6ff'],e.p2?'255,120,60':'190,120,255',3);
      if(ns==='roots'){ENV2.mark('roots',P.x,P.y+4,40);ENV2.rocks(P.x,P.y,90,1);ENV2.chunks(P.x,P.y,10,['#4a3424','#5a3f2a',S.mid],90)}break;
    case 'salamander':
      if(ps==='burrow'&&pb==='under'){ENV2.mark('scorch',x,y,40);ENV2.rocks(x,y,120,2);ENV2.chunks(x,y,16,['#3a2a24','#ff7a2e','#5a4038'],140);ENV2.burnGrass(x,y,70);ENV2.ignite(x,y,70)}
      if(ns==='burrow'&&nb==='a')ENV2.mark('cracks',x,y,30);break;
    case 'smith':
      if(ps==='slam'&&pb==='a'){const sx=e.sx!=null?e.sx:x,sy=e.sy!=null?e.sy:y;ENV2.rocks(sx,sy,150,4);ENV2.mark('cracks',sx,sy,62);ENV2.mark('scorch',sx,sy,36);ENV2.chunks(sx,sy,16,['#3a3a42','#ff7a2e','#5f5f68'],160);ENV2.fall(8);ENV2.burnGrass(sx,sy,70);ENV2.ignite(sx,sy,80);
        ENV2.torches(['#ffffff','#ffd86b','#ff8a22'],'255,220,160',1.2)}
      if(ns==='rain'||ns==='anvil')ENV2.fall(6);break;
    case 'toad':
      if((ps==='flop'||ps==='mega')&&pb==='air'){const big=ps==='mega';ENV2.splash(x,y,big?26:14,'#bfe9d0');ENV2.rocks(x,y,big?200:120,big?3:1.5);ENV2.mark('puddle',x+rand(-10,10),y+8,big?40:26);ENV2.chunks(x,y,8,['#46432a','#68643c'],110);if(big)ENV2.fall(8)}break;
    case 'hydra':
      if(ns==='dive'&&nb==='under'||ps==='dive'&&pb==='under'){ENV2.splash(x,y,22,'#cfe9d8');for(const p of G.puddles||[])G.ripples.push({x:p.x,y:p.y,r:3,max:p.rx,a:.9});ENV2.rocks(x,y,140,1)}
      if(ns==='breath'){const a=Math.atan2(P.y-y,P.x-x);for(let d=60;d<260;d+=50){const px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;ENV2.mark('toxic',px,py,30);ENV2.wiltGrass(px,py,30)}}break;
    case 'yeti':
      if((ps==='leap'&&pb==='air')||(ps==='pound'&&pb==='a')){ENV2.rocks(x,y,180,3);ENV2.fall(10,true);ENV2.mark('frost',x,y,ps==='pound'?80:60);ENV2.chunks(x,y,14,ICE_T,140)}
      if(ns==='roar'&&nb==='b'){for(const k of G.rocks){const a=Math.atan2(k.y-y,k.x-x);for(let i=0;i<4;i++)G.debris.push({x:k.x,y:k.y,z:kH(k)*.9,vx:Math.cos(a)*rand(60,120),vy:Math.sin(a)*rand(30,60),vz:rand(30,80),col:'#ffffff',s:2,rot:0,vr:4,life:1.6})}ENV2.rocks(x,y,400,0);ENV2.torches(['#1a62ff','#7fc8ff','#f0fbff'],ICE_L,2)}
      if(ns==='avalanche')ENV2.fall(16,true);break;
    case 'icequeen':
      if(ns==='nova'&&nb==='b'||ps==='nova'){ENV2.mark('frost',x,y,90);ENV2.torches(['#1a62ff','#7fc8ff','#f0fbff'],ICE_L,2.5);ENV2.rocks(x,y,160,1)}
      if(ns==='blizzard'||ns==='storm'){ENV2.fall(8,true);ENV2.torches(['#5fb8ff','#bfe6ff','#ffffff'],ICE_L,3)}break;
    case 'mimic':
      if(ns==='quake'||ps==='quake'&&pb==='a'){ENV2.rocks(x,y,180,2);ENV2.fall(8);ENV2.mark('cracks',x,y,44);ENV2.mark('coins',x,y,40);ENV2.chunks(x,y,12,['#ffd23c','#f2b800',S.mid],140)}
      if(ps==='chomp'&&pb==='a'){for(const k of G.rocks)if(Math.hypot(k.x-x,k.y-y)<k.r+e.r+30&&!k.temp){k.hit=.3;k.dmg=(k.dmg||0)+3;ENV2.chunks(k.x,k.y,6,['#8a6038','#6b4a2a'],80)}}break}}
{const _u=update;update=function(dt){_u(dt);if(!BOSS2||!G||!G.enemies)return;
  // torches go back to their colour
  if(G._tT>0){G._tT-=dt;if(G._tT<=0&&G.env&&G.env._base)G.env=G.env._base}
  for(const e of G.enemies){if(!B2[e.type]||e.dead)continue;const key=e.st+'|'+e.sub;if(e._b2k!==key){const[ps,pb]=(e._b2k||'|').split('|');e._b2k=key;if(!(e.intro>0))b2react(e,ps,pb,e.st,e.sub)}
    // the golem's roll grinds a trail into the floor and knocks chips off the walls when it bounces
    if(e.type==='golem'&&e.st==='roll'&&e.sub==='roll'){e._rollMark=(e._rollMark||0)+dt;if(e._rollMark>.07){e._rollMark=0;ENV2.mark('cracks',e.x,e.y+6,10)}
      const sx=Math.sign(e.vx),sy=Math.sign(e.vy);if(e._rsx!=null&&(sx!==e._rsx||sy!==e._rsy)){ENV2.rocks(e.x,e.y,80,2);ENV2.chunks(e.x,e.y,8,[stonePal().mid,stonePal().lo],120);ENV2.fall(3)}e._rsx=sx;e._rsy=sy}
    // the salamander scorches the ground she crawls on
    if(e.type==='salamander'&&e.st!=='burrow'&&e.moving){e._sc=(e._sc||0)+dt;if(e._sc>.18){e._sc=0;ENV2.burnGrass(e.x,e.y,22);ENV2.ignite(e.x,e.y,8)}}}
  // fire: zones scorch the floor once, burn grass and light up wood; burning wood smokes and wears
  for(const z of G.zones||[]){if(z.kind==='fire'){if(!z._sc){z._sc=1;ENV2.mark('scorch',z.x,z.y,z.r*.8)}ENV2.burnGrass(z.x,z.y,z.r);ENV2.ignite(z.x,z.y,z.r*.6)}else if(z.kind==='frost'&&!z._sc){z._sc=1;ENV2.mark('frost',z.x,z.y,z.r)}}
  for(const k of G.rocks){if(k.burn>0){k.burn-=dt;if(Math.random()<.5)fxPush({k:'firep',x:k.x+rand(-k.r,k.r)*.6,y:k.y-kH(k)*rand(.4,1),r:rand(4,8),t:.5,max:.5});if(Math.random()<.15)G.embers.push({k:'smoke',x:k.x,y:k.y-kH(k),vx:rand(-4,4),vy:rand(-24,-12),life:1.6,max:1.8,r:4});
    if(k.burn<=0){k.dmg=(k.dmg||0)+5;k.hit=.2;ENV2.mark('scorch',k.x,k.y+2,k.r*1.3)}}}
  // boulders and falling anvils or meteors: the impact cracks what is around
  const live=new Set([...(G.boulders||[]),...(G.meteors||[])]);for(const b of G._b2live||[])if(!live.has(b)){const x=b.tx!=null?b.tx:b.x,y=b.ty!=null?b.ty:b.y;ENV2.rocks(x,y,70,2);ENV2.chunks(x,y,8,[stonePal().mid,stonePal().lo],100);if(b.r||b.kind==='anvil'){ENV2.burnGrass(x,y,30);ENV2.ignite(x,y,30)}}G._b2live=live}}
// burning wood: real flames on the obstacle
{const _dr=drawRock;drawRock=function(k){_dr(k);if(BOSS2&&k.burn>0&&ctx===MAINCTX){const t=G.t||0,h=kH(k),f=Math.min(1,k.burn/1.2);ctx.save();ctx.globalCompositeOperation='lighter';glow('255,120,40',k.x,k.y-h*.6,k.r*2.2,.45*f);ctx.restore();
  for(let i=-1;i<=1;i++)b2fl(k.x+i*k.r*.45,k.y-h*(.55+.25*(i===0)),k.r*.32*f*(1+.2*Math.sin(t*12+i*2)),Math.sin(t*9+i)*2.4)}}}
