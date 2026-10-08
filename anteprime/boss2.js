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
    ctx.strokeStyle=`rgba(${rgb},.35)`;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(x,y,R*1.08,R*1.08*.45,0,0,TAU);ctx.stroke();ctx.restore()}
};
// what floats up around each boss
function b2aura(e,dt){const h=B2H[e.type]||50,ty=e.type;if(ty==='golem')return;
  if(ty==='golem'&&b2every(e,'au',.12,dt))b2emit(e,e.p2?{k:'ember',x:e.x+rand(-26,26),y:e.y-rand(10,50),vx:rand(-8,8),vy:-rand(20,40),life:1}:{k:'mote',e,a:rand(0,TAU),rad:e.r*rand(1,1.4),h0:rand(0,20),life:1.6,col:'200,230,120'});
  else if(ty==='witch'&&b2every(e,'au',.1,dt))b2emit(e,{k:'mote',e,a:rand(0,TAU),rad:e.r*rand(1,1.6),h0:rand(0,20),life:1.4,col:e.p2?'255,150,70':Math.random()<.5?'170,110,230':'140,240,200'});
  else if(ty==='salamander'||ty==='smith'){if(b2every(e,'au',.08,dt))b2emit(e,{k:'ember',x:e.x+rand(-24,24),y:e.y-rand(4,h*.6),vx:rand(-10,10),vy:-rand(30,55),life:rand(.7,1.1)});if(ty==='smith'&&b2every(e,'so',.3,dt))b2emit(e,{k:'smoke',x:e.x+rand(-14,14),y:e.y-h*.8,vy:-rand(14,22),life:1.3,r:3,col:'40,36,34'})}
  else if(ty==='hydra'&&b2every(e,'au',.18,dt))b2emit(e,{k:'bubble',x:e.x+rand(-46,46),y:e.y+rand(-6,8),vy:-rand(6,12),life:.9,r:rand(1.6,3.2),col:e.p2?'200,160,255':'170,255,120'});
  else if(ty==='yeti'&&b2every(e,'au',.05,dt))b2emit(e,{k:'mote',e,a:rand(0,TAU),rad:e.r*rand(1.3,1.9),h0:rand(-10,30),life:1.1,col:'240,250,255'});
  else if(ty==='icequeen'&&b2every(e,'au',.14,dt))b2emit(e,{k:'glint',x:e.x+rand(-34,34),y:e.y-rand(10,60),life:.5,r:3.5,col:e.p2?'210,180,255':'200,235,255'});}
function b2back(e,dt){if(e.type==='golem')return;const t=G.t||0,rgb=b2halo(e),h=B2H[e.type]||50,z=e.z||0;
  if(B2G[e.type])B2G[e.type](e);
  ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,e.x,e.y-z-h*.55,h*1.1,(.24+.06*Math.sin(t*1.7))*(e.intro>0?.6:1));ctx.restore();
  // phase 2: fire around the feet only for the bosses whose rage is fire
  if(e.p2&&(e.type==='golem'||e.type==='witch'||e.type==='smith'||e.type==='salamander'||e.type==='toad')&&!LOWFX&&b2every(e,'p2f',.06,dt)){const an=rand(0,TAU),r=e.r*rand(.8,1.25);b2emit(e,{k:'flame',x:e.x+Math.cos(an)*r,y:e.y+Math.sin(an)*r*.45,vy:-rand(30,55),life:rand(.4,.7),r:rand(3,6),col:'255,130,40'})}}
function b2front(e,dt){const h=B2H[e.type]||50,c=B2T[e.type][1];b2aura(e,dt);
  if(e._b2st!==e.st){const prev=e._b2st;e._b2st=e.st;if(prev!==undefined&&!B2CALM.has(e.st)&&!(e.intro>0)){for(let i=0;i<16;i++)b2emit(e,{k:'conv',e,a:i/16*TAU,rad:rand(55,80),h:h*.5,life:.42,col:c});b2emit(e,{k:'ring',x:e.x,y:e.y,r0:e.r,r1:e.r*3.2,life:.5,col:c,w:5})}}
  if(B2HEAVY[e.type]&&e.moving&&!(e.z>2)&&b2every(e,'st',.42,dt)){b2emit(e,{k:'ring',x:e.x,y:e.y+4,r0:e.r*.6,r1:e.r*1.7,life:.35,col:e.type==='yeti'?'200,215,230':e.type==='toad'?'150,190,160':'150,135,115',w:2});for(let i=0;i<3;i++)b2emit(e,{k:e.type==='yeti'?'snow':'dust',x:e.x+rand(-e.r,e.r),y:e.y+4,vx:rand(-25,25),vy:-rand(5,15),drag:3,life:.5,r:3,ph:0})}}
{const _de=drawEnemy;drawEnemy=function(e){const S=B2[e.type];if(!BOSS2||!S||S.plain||e.dead){_de(e);return}
  // during an entrance the details appear only once the boss is really in the room (out of the ground, through the door, faded in, landed)
  const entering=e.intro>0&&e.type!=='hydra'&&((e.em!=null&&e.em<1)||(e.fa!=null&&e.fa<1)||e.yy!=null||(e.z||0)>20||(e.hole>0&&e.em!=null));
  const dt=b2tick(e),hide=entering||e.hidden||(e.st==='burrow'&&e.sub==='under')||(e.spawn>0)||(e.type==='hydra'&&(e.sink||0)>.6);
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

// MIMIC: plain (redrawn below as the Dark Souls mimic), it only keeps the arena reactions
B2.mimic={plain:1};

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
      // the mouth now sits high on its legs: the tongue and the coins come out of it
      if(ns==='tongue')for(const l of G.lines)if(l.col==='red'&&Math.abs(l.y-(y-8))<.5)l.y=y-30;
      if(ps==='coins')for(const p of G.eproj)if(Math.abs(p.y-(y-14))<.5&&Math.hypot(p.x-x,p.y-y)<30)p.y=y-28;
      if(ns==='quake'||ps==='quake'&&pb==='a'){ENV2.rocks(x,y,180,2);ENV2.fall(8);ENV2.mark('cracks',x,y,44);ENV2.chunks(x,y,12,[S.hi,S.mid,S.lo],140)}
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

// =====================================================================
// THE MIMIC, Dark Souls style: a rotten chest that stands up on long, thin, pale legs with backward knees,
// long arms hanging to the floor with clawed fingers. The lid breathes, showing teeth; a tongue hangs out.
// Front, side and back views; it unfolds out of the chest when it wakes up.
// =====================================================================
function drawMimicDS(e){const B=basis(e.face),side=B.side,back=B.back,f=B.f,t=G.t||0,ph=e.hopT||0,moving=e.st==='walk',x=e.x,gy=e.y+12;
  const it=e.intro>0?(e.iT||0):9,legK=e.intro>0?clamp((it-.45)/.6,0,1):1,armK=e.intro>0?clamp((it-.7)/.55,0,1):1;
  const wind=e.st==='chomp'&&e.sub==='a',lunge=e.st==='chomp'&&e.sub==='b',quake=e.st==='quake',spit=e.st==='coins'||e.st==='tongue';
  const crouch=wind?.7:quake?.75:1,legs=legK*crouch,bob=moving?Math.abs(Math.sin(ph))*2.2:0,z=quake?(e.z||0):0;
  const twitch=(t%3.3)<.16?Math.sin(t*90)*1.6:0,shake=e.intro>0&&it<.45?Math.sin(t*70)*2.2:0;
  const breath=.1+.07*Math.sin(t*1.7),chew=moving?Math.abs(Math.sin(t*6))*.25:0,introOp=e.intro>0?clamp((it-1.05)/.35,0,1):0;
  const op=Math.max(e.intro>0?introOp:(e.mouth||0),e.intro>0?0:Math.max(breath,chew));
  const W=side?15:20,hip=22*legs,yb=-hip-2-bob,yt=yb-22,K='#1b1612';
  const skin='#9d968a',skinD='#6a645b',wood='#5a3a22',woodD='#38220f',woodL='#76502e',band='#7a5a2a',bandL='#b08a40';
  ctx.save();ctx.translate(x+twitch+shake,gy-z);ctx.scale(f,1);if(lunge&&side)ctx.rotate(.14);
  const limb=(pts,w,col)=>{ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.strokeStyle=K;ctx.lineWidth=w+3;ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke();
    ctx.fillStyle=col;ctx.strokeStyle=K;ctx.lineWidth=1.4;for(let i=1;i<pts.length-1;i++){ctx.beginPath();ctx.arc(pts[i][0],pts[i][1],w*.62,0,TAU);ctx.fill();ctx.stroke()}};
  const claws=(hx,hy,dir,len,col,up)=>{ctx.lineCap='round';for(let k=-1;k<=1;k++){const a=dir+k*.42,mx=hx+Math.cos(a)*len*.55,my=hy+Math.sin(a)*len*.55,ex=hx+Math.cos(a+(up?-.5:.5)*.6)*len,ey=hy+Math.sin(a+(up?-.5:.5)*.6)*len;
    ctx.strokeStyle=K;ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(hx,hy);ctx.quadraticCurveTo(mx,my,ex,ey);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=1.8;ctx.stroke();ctx.fillStyle='#e8e0cc';ctx.beginPath();ctx.arc(ex,ey,1.1,0,TAU);ctx.fill()}};
  // --- arms: hanging to the floor, raised wide before the bite, reaching forward in the lunge
  const arm=(s,far)=>{if(armK<.02)return;const sx=side?(far?-3:3):s*W,sy=yt+7,col=far?skinD:skin;let ex,ey,hx,hy,dir,up=false;
    if(wind||quake){ex=sx+(side?8:s*16);ey=yt-8;hx=sx+(side?14:s*22);hy=yt-24;dir=-Math.PI/2+(side?.6:s*.5);up=true}
    else if(lunge||spit){ex=sx+(side?14:s*12);ey=yb-4;hx=sx+(side?30:s*18);hy=yb-10;dir=side?0:(s>0?-.2:Math.PI+.2)}
    else{const sw=Math.sin(t*2+s)*2.5+(moving?Math.sin(ph+(s>0?0:Math.PI))*5:0);ex=sx+(side?6+sw*.4:s*12);ey=yb+3;hx=sx+(side?9+sw:s*(9+sw*.4));hy=-4;dir=Math.PI/2+(side?-.3:s*-.25)}
    ex=sx+(ex-sx)*armK;ey=sy+(ey-sy)*armK;hx=sx+(hx-sx)*armK;hy=sy+(hy-sy)*armK;limb([[sx,sy],[ex,ey],[hx,hy]],3.4,col);claws(hx,hy,dir,9*armK,col,up)};
  // --- legs: thin, pale, the knees bent the wrong way
  const leg=(hx,s,far,phase)=>{if(legs<.02)return;const lift=moving?Math.max(0,Math.sin(ph+phase))*7:0,col=far?skinD:skin;
    const fx=side?hx+(moving?Math.sin(ph+phase)*10:0):hx*1.6,fy=-lift,hy=-hip-bob,kx=side?(hx+fx)/2-10*legs:hx*2.3+s*3,ky=hy*.45-lift*.4;
    limb([[hx,hy],[kx,ky],[fx,fy]],3.6,col);claws(fx,fy,side?0:(s>0?.3:Math.PI-.3),6,col,false)};
  // --- the chest
  const chest=()=>{ctx.beginPath();ctx.rect(-W,yt,W*2,yb-yt);ctx.fillStyle=vGrad(-W,W,woodL,wood,woodD);ctx.fill();ctx.strokeStyle=K;ctx.lineWidth=2.6;ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.2;for(const yy of [yt+7,yt+14]){ctx.beginPath();ctx.moveTo(-W+2,yy);ctx.lineTo(W-2,yy+(Math.sin(yy)*1));ctx.stroke()}
    ctx.strokeStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.moveTo(-W*.3,yt+3);ctx.lineTo(-W*.15,yt+9);ctx.lineTo(-W*.35,yt+13);ctx.stroke();
    for(const bx of side?[-W+3,W-6]:[-W+3,W-6]){ctx.fillStyle=band;ctx.fillRect(bx,yt,3.5,yb-yt);ctx.strokeStyle=K;ctx.lineWidth=1.6;ctx.strokeRect(bx,yt,3.5,yb-yt);ctx.fillStyle=bandL;for(const ry of [yt+4,yb-4]){ctx.beginPath();ctx.arc(bx+1.75,ry,1.2,0,TAU);ctx.fill()}}
    ctx.fillStyle=band;ctx.fillRect(-W,yb-4,W*2,3);ctx.strokeStyle=K;ctx.lineWidth=1.6;ctx.strokeRect(-W,yb-4,W*2,3);
    ctx.fillStyle='rgba(60,80,40,.55)';ctx.beginPath();ctx.ellipse(-W*.55,yb-2,4,1.6,0,0,TAU);ctx.ellipse(W*.4,yt+18,3,1.3,0,0,TAU);ctx.fill()};
  const teethRow=(x0,x1,y0,dir,n,big)=>{ctx.fillStyle='#efe6c8';ctx.strokeStyle=K;ctx.lineWidth=1.1;for(let i=0;i<n;i++){const u=(i+.5)/n,tx=x0+(x1-x0)*u,h=(big?6:4)*(.7+.5*Math.abs(Math.sin(i*2.7)));ctx.beginPath();ctx.moveTo(tx-2.2,y0);ctx.lineTo(tx+Math.sin(i)*.8,y0+dir*h);ctx.lineTo(tx+2.2,y0);ctx.closePath();ctx.fill();ctx.stroke()}};
  const tongue=(x0,y0,dx)=>{const len=(10+op*24)*(e.intro>0?introOp:1);if(len<3)return;const sw=Math.sin(t*3.4)*4,ex=x0+dx*len*.35+sw,ey=y0+len;ctx.lineCap='round';
    for(const[c,w] of [[K,8],['#8a2a3a',5.4]]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(x0+dx*6,y0+len*.5,ex,ey);ctx.stroke()}
    ctx.strokeStyle='rgba(230,140,150,.6)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x0-1,y0+2);ctx.quadraticCurveTo(x0+dx*5,y0+len*.5,ex-1,ey-2);ctx.stroke();
    const d=(t*1.3)%1;ctx.fillStyle='rgba(220,230,200,.8)';ctx.beginPath();ctx.ellipse(ex,ey+3+d*12,1.3,2+d,0,0,TAU);ctx.fill()};
  if(side){arm(0,true);leg(-5,0,true,Math.PI)}else{arm(-1,false);arm(1,false)}
  if(!side){leg(-9,-1,false,0);leg(9,1,false,Math.PI)}
  chest();
  if(back){// the back of the lid and its hinges; no teeth from behind
    const gp=op*10;ctx.fillStyle='#0d0806';ctx.fillRect(-W+1,yt-gp,W*2-2,gp);ctx.beginPath();ctx.moveTo(-W,yt-gp);ctx.quadraticCurveTo(0,yt-gp-12,W,yt-gp);ctx.lineTo(W,yt-gp+3);ctx.lineTo(-W,yt-gp+3);ctx.closePath();ctx.fillStyle=wood;ctx.fill();ctx.strokeStyle=K;ctx.lineWidth=2.6;ctx.stroke();
    for(const hx of [-W*.5,W*.5]){ctx.fillStyle=band;ctx.fillRect(hx-3,yt-gp-3,6,8);ctx.strokeStyle=K;ctx.lineWidth=1.4;ctx.strokeRect(hx-3,yt-gp-3,6,8)}}
  else if(side){// the lid hinges at the back and opens towards where it looks
    const ang=-op*.95;ctx.save();ctx.beginPath();ctx.moveTo(-W,yt);ctx.lineTo(W+2,yt);ctx.lineTo(W+2+Math.cos(ang)*0,yt);ctx.lineTo(-W+Math.cos(ang)*(W*2+2),yt+Math.sin(ang)*(W*2+2));ctx.closePath();ctx.fillStyle='#2a0808';ctx.fill();
    ctx.save();ctx.globalCompositeOperation='lighter';glow('150,60,30',W*.4,yt-op*8,14*op+2,.5*op);ctx.restore();ctx.restore();
    teethRow(-W*.2,W,yt,-1,5,true);
    ctx.save();ctx.translate(-W,yt);ctx.rotate(ang);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(W,-12,W*2+2,0);ctx.lineTo(W*2+2,3);ctx.lineTo(0,3);ctx.closePath();ctx.fillStyle=wood;ctx.fill();ctx.strokeStyle=K;ctx.lineWidth=2.6;ctx.stroke();
    ctx.strokeStyle=band;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(W,-12,W*2+2,0);ctx.stroke();if(op>.08)teethRow(W*.8,W*2,3,1,4,false);ctx.restore();
    if(op>.15)tongue(W*.75,yt-1,1);leg(5,0,false,0);arm(0,false)}
  else{// front: the lid lifts, two rows of teeth, the dark throat, the tongue spilling over the edge
    const gp=op*16;if(gp>1){ctx.beginPath();ctx.ellipse(0,yt-gp*.45,W-2,gp*.62+1,0,0,TAU);ctx.fillStyle='#2a0808';ctx.fill();ctx.strokeStyle=K;ctx.lineWidth=2;ctx.stroke();
      ctx.save();ctx.globalCompositeOperation='lighter';glow('150,60,30',0,yt-gp*.4,W*.8,.45*op);ctx.restore();teethRow(-W+3,W-3,yt,-1,7,true);teethRow(-W+4,W-4,yt-gp,1,6,false)}
    else teethRow(-W+5,W-5,yt+.5,-1,7,false);
    ctx.beginPath();ctx.moveTo(-W,yt-gp);ctx.quadraticCurveTo(0,yt-gp-12,W,yt-gp);ctx.lineTo(W,yt-gp+3);ctx.lineTo(-W,yt-gp+3);ctx.closePath();ctx.fillStyle=woodL;ctx.fill();ctx.strokeStyle=K;ctx.lineWidth=2.6;ctx.stroke();
    ctx.strokeStyle=band;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(-W,yt-gp);ctx.quadraticCurveTo(0,yt-gp-12,W,yt-gp);ctx.stroke();
    ctx.fillStyle=band;ctx.fillRect(-3,yt-gp-2,6,6);ctx.strokeStyle=K;ctx.lineWidth=1.4;ctx.strokeRect(-3,yt-gp-2,6,6);ctx.fillStyle=K;ctx.fillRect(-.8,yt-gp,1.6,2.6);
    if(op>.15)tongue(2,yt-1,.3)}
  ctx.restore()}
{const _dm=drawMimic;drawMimic=function(e){if(BOSS2)drawMimicDS(e);else _dm(e)}}

// =====================================================================
// THE WITCH'S SANCTUARY: an ancient floor swallowed by the forest. A ritual dais of stone in the middle with her sign
// (three roots knotted together) carved and glowing; thick roots coming out of the walls and breaking the slabs;
// glowing purple mushrooms, moss, flowers and fallen petals; the lights breathe while she lives
// =====================================================================
VARIANTS.radici.forEach(v=>{v.roots=0});
function bakeWitchFloor(){const c=fx,cx=AW/2,cy=TOP+(BOT-TOP)*.45,R0=101,ry=.62,lights=[];G.witchLights=lights;c.save();c.setTransform(2,0,0,2,0,0);c.lineCap='round';c.lineJoin='round';
  // the sanctuary is darker and violet at the edges
  {const g=c.createRadialGradient(cx,cy,60,cx,cy,Math.max(AW,AH)*.75);g.addColorStop(0,'rgba(20,10,30,0)');g.addColorStop(1,'rgba(20,8,32,.5)');c.fillStyle=g;c.fillRect(0,0,AW,AH)}
  // moss carpets in the corners and along the walls
  for(let i=0;i<70;i++){const edge=Math.random()<.7,x=edge?(Math.random()<.5?rand(L,L+70):rand(R-70,R)):rand(L,R),y=rand(TOP,BOT),r=rand(5,14);c.fillStyle=pk(['rgba(63,106,42,.55)','rgba(79,138,52,.5)','rgba(47,82,32,.6)']);c.beginPath();c.ellipse(x,y,r,r*.55,0,0,TAU);c.fill();c.fillStyle='rgba(140,200,90,.18)';c.beginPath();c.ellipse(x-r*.2,y-r*.2,r*.5,r*.25,0,0,TAU);c.fill()}
  // thick living roots: out of the walls, across the slabs, towards the dais
  const rubble=(sx,sy,w)=>{for(let i=0;i<5;i++){const a=rand(0,TAU),px=sx+Math.cos(a)*w*rand(.7,1.3),py=sy+Math.sin(a)*w*.55,s=rand(3,6.5);c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(px+1,py+2,s,s*.45,0,0,TAU);c.fill();c.fillStyle=pk(G.env.floor);c.beginPath();c.moveTo(px-s,py);c.lineTo(px-s*.3,py-s*.75);c.lineTo(px+s,py-s*.35);c.lineTo(px+s*.5,py+s*.45);c.closePath();c.fill();c.strokeStyle='#1b1612';c.lineWidth=1.1;c.stroke();c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.moveTo(px-s*.3,py-s*.75);c.lineTo(px+s,py-s*.35);c.lineTo(px,py-s*.2);c.closePath();c.fill()}
    c.fillStyle='rgba(10,6,4,.75)';c.beginPath();c.ellipse(sx,sy+1,w*.75,w*.32,0,0,TAU);c.fill()};
  const root=(x0,y0,x1,y1,w)=>{const mx=(x0+x1)/2+rand(-50,50),my=(y0+y1)/2+rand(-30,30),N=44,P=[],ph=rand(0,9),len=Math.hypot(x1-x0,y1-y0);
    for(let i=0;i<=N;i++){const u=i/N,bx=(1-u)**2*x0+2*(1-u)*u*mx+u*u*x1,by=(1-u)**2*y0+2*(1-u)*u*my+u*u*y1,ux=(1-u)**2,dx=2*(1-u)*(mx-x0)+2*u*(x1-mx),dy=2*(1-u)*(my-y0)+2*u*(y1-my),dl=Math.hypot(dx,dy)||1,wig=Math.sin(u*len*.045+ph)*7*(1-u*.5);
      P.push([bx-dy/dl*wig,by+dx/dl*wig,w*(1-u*.72)])}
    // the root dives under the floor and comes back up: visible arcs
    const vis=u=>!(u>.34&&u<.42)&&!(u>.66&&u<.72);
    const seg=(from,to,fn)=>{for(let i=from+1;i<=to;i++)fn(P[i-1],P[i],i)};
    const runs=[];let st=null;for(let i=0;i<=N;i++){const v=vis(i/N);if(v&&st===null)st=i;if((!v||i===N)&&st!==null){runs.push([st,v?i:i-1]);st=null}}
    for(const[a0,a1] of runs){
      seg(a0,a1,(p0,p1)=>{c.strokeStyle='rgba(0,0,0,.38)';c.lineWidth=p1[2]+5;c.beginPath();c.moveTo(p0[0]+4,p0[1]+6);c.lineTo(p1[0]+4,p1[1]+6);c.stroke()});
      for(const[col,add,lift] of [['#1b1612',3.6,0],['#4a3424',0,0],['#5f4430',-.35,.12],['#7a5a3e',-.7,.24]])seg(a0,a1,(p0,p1)=>{c.strokeStyle=col;c.lineWidth=Math.max(1,p1[2]*(1+Math.min(0,add))+(add>0?add:0));c.beginPath();c.moveTo(p0[0],p0[1]-p0[2]*lift);c.lineTo(p1[0],p1[1]-p1[2]*lift);c.stroke()});
      // bark: grooves running along the root
      for(const off of [-.28,.05,.3]){c.strokeStyle='rgba(25,15,8,.5)';c.lineWidth=1;c.beginPath();seg(a0,a1,(p0,p1,i)=>{if(i===a0+1)c.moveTo(p0[0],p0[1]+p0[2]*off);if(i%3)c.lineTo(p1[0],p1[1]+p1[2]*off);else c.moveTo(p1[0],p1[1]+p1[2]*off)});c.stroke()}
      // moss on its back, little rootlets
      for(let i=a0+2;i<a1-1;i+=5){const[x,y,ww]=P[i];if(Math.random()<.7){c.fillStyle='#3f6a2a';c.beginPath();c.ellipse(x,y-ww*.3,ww*.5,ww*.2,0,0,TAU);c.fill();c.fillStyle='#6fa040';c.beginPath();c.ellipse(x-ww*.1,y-ww*.38,ww*.28,ww*.1,0,0,TAU);c.fill()}
        if(Math.random()<.45){const a=rand(0,TAU),l=rand(12,22);for(const[col,lw] of [['#1b1612',3.6],['#4a3424',1.8]]){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*l*.6,y+Math.sin(a)*l*.3+4,x+Math.cos(a)*l,y+Math.sin(a)*l*.5);c.stroke()}}}
      // where it goes under or comes out, the slabs are broken
      if(a0>0)rubble(P[a0][0],P[a0][1],P[a0][2]);if(a1<N)rubble(P[a1][0],P[a1][1],P[a1][2])}
    rubble(P[2][0],P[2][1],P[2][2]*.9);return P};
  const ends=[[L-4,rand(TOP+40,TOP+160)],[R+4,rand(TOP+60,TOP+200)],[L-4,rand(BOT-260,BOT-120)],[R+4,rand(BOT-240,BOT-100)],[rand(L+40,cx-60),TOP-2],[rand(cx+60,R-40),TOP-2],[rand(L+60,R-60),BOT+2]];
  const roots=ends.map(([x,y])=>{const a=Math.atan2(cy-y,cx-x),d=Math.hypot(cx-x,(cy-y))-R0*1.05;return root(x,y,x+Math.cos(a)*d,y+Math.sin(a)*d*.9,rand(19,26))});
  // the ritual dais
  {c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(cx+3,cy+5,R0+8,(R0+8)*ry,0,0,TAU);c.fill();
    const g=c.createLinearGradient(0,cy-R0*ry,0,cy+R0*ry);g.addColorStop(0,'#6e7466');g.addColorStop(1,'#4a5046');c.fillStyle=g;c.beginPath();c.ellipse(cx,cy,R0+6,(R0+6)*ry,0,0,TAU);c.fill();c.strokeStyle='#1b1612';c.lineWidth=2.6;c.stroke();
    c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=1.2;for(let k=0;k<16;k++){const a=k/16*TAU;c.beginPath();c.moveTo(cx+Math.cos(a)*(R0*.82),cy+Math.sin(a)*R0*.82*ry);c.lineTo(cx+Math.cos(a)*(R0+6),cy+Math.sin(a)*(R0+6)*ry);c.stroke()}
    c.fillStyle='#3a4038';c.beginPath();c.ellipse(cx,cy,R0*.8,R0*.8*ry,0,0,TAU);c.fill();c.strokeStyle='#1b1612';c.lineWidth=2;c.stroke();
    c.strokeStyle='rgba(255,255,255,.1)';c.lineWidth=1.4;c.beginPath();c.ellipse(cx,cy-1.5,R0+4,(R0+4)*ry,0,Math.PI*1.05,Math.PI*1.95);c.stroke();
    // runes carved in the outer ring
    c.strokeStyle='rgba(20,10,30,.7)';c.lineWidth=1.8;for(let k=0;k<16;k++){const a=k/16*TAU+TAU/32,px=cx+Math.cos(a)*R0*.91,py=cy+Math.sin(a)*R0*.91*ry;c.save();c.translate(px,py);c.scale(1,ry);c.rotate(a+Math.PI/2);c.beginPath();const g2=k%4;
      if(g2===0){c.moveTo(-3,3);c.lineTo(0,-4);c.lineTo(3,3)}else if(g2===1){c.moveTo(0,-4);c.lineTo(0,4);c.moveTo(-3,-1);c.lineTo(3,1)}else if(g2===2){c.arc(0,0,3,0,Math.PI*1.5)}else{c.moveTo(-3,-3);c.lineTo(3,3);c.moveTo(3,-3);c.lineTo(-3,3)}c.stroke();c.restore();lights.push({x:px,y:py,r:7,rgb:'190,120,255',ph:k})}
    // her sign: three roots knotted together
    c.save();c.translate(cx,cy);c.scale(1,ry);for(let k=0;k<3;k++){const a=k/3*TAU-Math.PI/2;c.save();c.rotate(a);for(const[col,lw] of [['#1b1612',7],['#2a1f2e',4]]){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(R0*.55,-R0*.2,R0*.55,R0*.35,R0*.1,R0*.42);c.stroke()}c.restore()}
    c.strokeStyle='rgba(140,255,200,.55)';c.lineWidth=1.4;for(let k=0;k<3;k++){const a=k/3*TAU-Math.PI/2;c.save();c.rotate(a);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(R0*.55,-R0*.2,R0*.55,R0*.35,R0*.1,R0*.42);c.stroke();c.restore()}
    c.fillStyle='#1b1612';c.beginPath();c.arc(0,0,9,0,TAU);c.fill();c.fillStyle='#7bf0c0';c.beginPath();c.arc(0,0,4.5,0,TAU);c.fill();c.restore();lights.push({x:cx,y:cy,r:46,rgb:'120,240,190',ph:0,big:1})}
  // glowing mushrooms where the roots meet the floor, purple flowers and petals
  const shroom=(x,y,s)=>{for(let i=0;i<3;i++){const px=x+(i-1)*s*1.4+rand(-2,2),py=y+(i%2)*2,h=s*(1+(i===1)*.5);c.fillStyle='#e8dcc8';c.strokeStyle='#1b1612';c.lineWidth=1.2;c.beginPath();c.rect(px-1.2,py-h*1.2,2.4,h*1.2);c.fill();c.stroke();
    c.beginPath();c.ellipse(px,py-h*1.2,h*.85,h*.55,0,Math.PI,0);c.closePath();c.fillStyle=i%2?'#7a3ab0':'#9a5ad0';c.fill();c.stroke();c.fillStyle='#e8c8ff';for(const[dx,dy] of [[-.35,-.25],[.3,-.4],[0,-.15]]){c.beginPath();c.arc(px+dx*h,py-h*1.2+dy*h,.9,0,TAU);c.fill()}lights.push({x:px,y:py-h*1.2,r:12+h,rgb:'190,110,255',ph:rand(0,9)})}};
  for(const P of roots){const[x,y,w]=P[Math.floor(rand(8,20))];shroom(x+rand(-6,6),y+w*.6+4,rand(5,6.5))}
  for(let i=0;i<4;i++)shroom(rand(L+20,R-20),Math.random()<.5?rand(TOP+20,TOP+80):rand(BOT-80,BOT-20),rand(4.5,6));
  for(let i=0;i<26;i++){const x=rand(L+10,R-10),y=rand(TOP+10,BOT-10);if(Math.hypot(x-cx,(y-cy)/ry)<R0+10)continue;if(Math.random()<.5){c.fillStyle=pk(['#c48ae8','#e8a0d0','#a15ad0']);for(let k=0;k<5;k++){c.beginPath();c.arc(x+Math.cos(k*1.26)*2,y+Math.sin(k*1.26)*1.5,1.4,0,TAU);c.fill()}c.fillStyle='#ffd23c';c.beginPath();c.arc(x,y,.9,0,TAU);c.fill()}
    else{c.fillStyle=pk(['rgba(196,138,232,.75)','rgba(232,160,208,.7)']);c.beginPath();c.ellipse(x,y,2.4,1.2,rand(0,3),0,TAU);c.fill()}}
  c.restore()}
{const _mt=makeTufts;makeTufts=function(){_mt();if(G.witchLights&&G.tufts){const cx=AW/2,cy=TOP+(BOT-TOP)*.45;G.tufts=G.tufts.filter(t=>Math.hypot(t.x-cx,(t.y-cy)/.62)>112)}}}
{const _rf=renderFloor;renderFloor=function(){_rf();if(BOSS2&&themeOf(G.room)==='radici'&&G.variant&&G.variant.rune==='witch')bakeWitchFloor();else G.witchLights=null}}
{const _fg=drawFloorGlow;drawFloorGlow=function(){_fg();const W=BOSS2&&G.witchLights;if(!W)return;const t=G.t||0,p2=G.enemies&&G.enemies.some(e=>e.p2);ctx.save();ctx.globalCompositeOperation='lighter';
  for(const l of W){const a=l.big?.22+.1*Math.sin(t*1.4):.32+.22*Math.sin(t*2+l.ph);glow(p2&&!l.big?'255,140,60':l.rgb,l.x,l.y,l.r,a,l.big?l.r*.62:l.r*.7)}
  for(let k=0;k<5;k++)glow('130,70,180',AW/2+Math.sin(t*.3+k*1.3)*(AW*.35),TOP+(BOT-TOP)*(.2+k*.15)+Math.cos(t*.25+k)*20,90,.07,40);ctx.restore()}}

// =====================================================================
// HYDRA: a creepier rise. The pool boils with a sick light, three pairs of yellow eyes circle under the water and stop
// to stare at you; the heads breach one at a time, twitching, streaming water; the fins show, then the body heaves up.
// The same staggered rise when it dives and comes back during the fight
// =====================================================================
Object.assign(BOSS_INTRO,{hydra:4.4});
const HY_D={'0':1.5,'-1':2.0,'1':2.35},HY_UP={'0':0,'-1':.18,'1':.32};
{const _hh=hydraHead;hydraHead=function(e,h){const p=_hh(e,h);if(BOSS2&&(h._dy||h._jx)){p.x+=h._jx||0;p.y+=h._dy||0;p.rx+=h._jx||0;p.ry+=h._dy||0}return p}}
{const _bi3=bossIntro3;bossIntro3=function(e,t,t0,at,roar){if(!(BOSS2&&e.type==='hydra'))return _bi3(e,t,t0,at,roar);
  e.em=null;e.hole=0;
  // the heads exist from the very start of the entrance (in the game they were only made when the fight began, so the hydra was invisible during its entrance)
  if(!e.heads)e.heads=[-1,0,1].map((s,i)=>({s,t:1+i*.7,st:'idle',ext:0,open:0,tx:e.x,ty:e.y,k:0}));
  if(t0===0){sfx('creep',1,e.x);shake(2)}
  if(t<3.2&&Math.random()<.7)G.fx.push({k:'bub',x:e.x+rand(-44,44),y:e.y+rand(-16,16),t:.6,r:rand(2,5)});
  if(at(.6)||at(1.15)){shake(2.5);sfx('creep',1,e.x);G.ripples.push({x:e.x,y:e.y,r:6,max:70,a:.9})}
  for(const s of ['0','-1','1'])if(at(HY_D[s])){sfx('splash',1,e.x);const hx=e.x+(+s)*36;G.ripples.push({x:hx,y:e.y,r:4,max:40,a:1});ENV2.splash(hx,e.y,8,'#cfe9d8')}
  if(at(3.0)){shake(7);sfx('splash',2,e.x);ENV2.splash(e.x,e.y,22,'#cfe9d8');vfxBlast(e.x,e.y,'120,200,140',100,{sparks:10,spcol:['#c8f0d8','#7bd6a0','#ffffff'],dust:0,debris:['#3f7a4a','#2a5a34','#8fd0a8'],n:16,ring2:false})}
  if(at(3.8)){roar();sfx('roar',0,e.x);G.ripples.push({x:e.x,y:e.y,r:10,max:110,a:1})}
  for(const h of e.heads||[])h.open=t>3.75&&t<4.35?1:t>1.5&&t<3.7?.25+.25*Math.sin(t*7+h.s):0;
  return true}}
const hyEyes=(x,y,t,k,s,stare)=>{if(k<=0)return;const a=t*1.3+s*2.1,r=stare?0:26,ex=x+Math.cos(a)*r,ey=y+Math.sin(a)*r*.35,bl=(Math.sin(t*2.3+s*4)>.93)?.1:1;
  ctx.fillStyle=`rgba(0,10,5,${.4*k})`;ctx.beginPath();ctx.ellipse(ex,ey+2,14,6,0,0,TAU);ctx.fill();k*=.85;
  ctx.save();ctx.globalCompositeOperation='lighter';glow('255,200,60',ex,ey,16,.35*k*bl);for(const o of [-5,5]){glow('255,210,60',ex+o,ey,8,.8*k*bl);ctx.fillStyle=`rgba(255,240,150,${k*bl})`;ctx.beginPath();ctx.ellipse(ex+o,ey,2.6,1.6*bl+.3,o*.04,0,TAU);ctx.fill()}ctx.restore();
  ctx.fillStyle=`rgba(0,0,0,${.8*k*bl})`;for(const o of [-5,5]){ctx.fillRect(ex+o-.5,ey-1.4,1,2.8)}};
{const hy=B2.hydra,ob=hy.back,of=hy.front;
  hy.pre=e=>{if(!e.heads)return;const t=G.t||0;
    if(e.intro>0){const it=e.iT||0;for(const h of e.heads)h._q=clamp((it-HY_D[h.s])/.85,0,1);e.sink=1.6*(1-clamp((it-3)/.8,0,1))}
    else if(e.st==='dive'&&e.sub==='up'){const u=1-(e.sink||0);for(const h of e.heads){const d=HY_UP[h.s];h._q=clamp((u-d)/(1-d),0,1)}}
    else if(e.st==='dive'&&e.sub==='a'){const u=1-(e.sink||0);for(const h of e.heads)h._q=u}
    else for(const h of e.heads)h._q=1;
    for(const h of e.heads){const k=1-h._q;h._dy=k*95+(e.intro>0?Math.min(1.6,e.sink||0)*30:0);const n=Math.sin(Math.floor(t*9)*12.9898+h.s*78.233)*43758.5453;h._jx=k>0&&k<1?(Math.sin(t*37+h.s*5)*3+((n-Math.floor(n))-.5)*9)*k:0;
      if(h._qp!=null&&h._qp<=0&&h._q>0)b2emit(e,{k:'ring',x:e.x+h.s*36,y:e.y,r0:4,r1:34,life:.5,col:'200,240,210',w:3});h._qp=h._q}};
  hy.back=(e,dt)=>{const t=G.t||0;
    // under the water: the eyes circle, then stop and stare
    // the crests stay under the water line too
    ctx.save();ctx.beginPath();ctx.rect(e.x-200,e.y-320,400,322);ctx.clip();ob(e,dt);ctx.restore()};
  hy.front=(e,dt)=>{of(e,dt);if(!e.heads)return;for(const h of e.heads)if(h._q>.1&&h._q<1&&b2every(e,'wd'+h.s,.07,dt)){const p=hydraHead(e,h);b2emit(e,{k:'drip',x:p.x+rand(-7,7),y:p.y+4,vy:10,g:300,gy:e.y+rand(-2,4),life:1.5,col:'rgba(200,235,215,.9)'})}};
  hy.post=e=>{if(!e.heads)return;const t=G.t||0;
    if(e.intro>0){const it=e.iT||0;ctx.save();ctx.globalCompositeOperation='lighter';glow('120,220,90',e.x,e.y,70,.18+.1*Math.sin(t*5),26);ctx.restore();
      for(const h of e.heads)if(!(clamp((it-HY_D[h.s])/.85,0,1)>0))hyEyes(e.x+h.s*30,e.y-2,t,clamp(it/.5,0,1),h.s,it>1.1)}
    if(e.st==='dive'&&e.sub==='under'&&e.tx!=null){const k=clamp((1-(e.stT||0))/.3,0,1);for(const s of [-1,0,1])hyEyes(e.tx+s*30,e.ty-2,t,k,s,(e.stT||1)<.45)}
  }}
{const _de2=drawEnemy;drawEnemy=function(e){const S=BOSS2&&B2[e.type];if(S&&S.pre&&!e.dead)S.pre(e);_de2(e);if(S&&S.post&&!e.dead)S.post(e)}}
