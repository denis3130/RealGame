// ---------------- chapter 3 bosses ----------------
function toadMouth(e,ang){return{x:e.x+Math.cos(ang)*e.r*.55,y:e.y-22-e.z+Math.sin(ang)*e.r*.3}}
EUPD.toad=(e,dt,sm,a,d)=>{
  if(!e.p2&&e.hp<e.max*.5){e.p2=true;banner('Il Re Rospo si gonfia di rabbia','Fase 2',1.6);bossRage(e,'200,240,90');$('bossBar').classList.add('rage');shake(8);sfx('croak',2,e.x)}
  const sp=e.p2?1.25:1;e.stT-=dt*sp;e.sac=Math.max(0,(e.sac||0)-dt*1.5);
  const seq=e.p2?['tongue','mega','bubbles','tongue','spawn','flop']:['tongue','flop','bubbles','tongue','spawn','flop'];
  if(e.st==='walk'){e.face=a;e.hopT=(e.hopT||0)+dt*sp;const ph=e.hopT%.8;
    if(ph<.38){const na=navAngle(e);moveCircle(e,Math.cos(na)*80*dt*sp,Math.sin(na)*80*dt*sp);e.z=Math.sin(ph/.38*Math.PI)*14;e.moving=true}
    else{if(e.z>0){e.z=0;stepFx(e.x,e.y+8,true);G.shake=Math.max(G.shake,1.5)}e.moving=false}
    if(e.stT<=0&&e.z<=0){e.st=seq[e.si++%seq.length];e.sub='a';e.n=e.st==='mega'?3:1;e.moving=false;
      e.stT=e.st==='tongue'?.75:e.st==='bubbles'?.8:e.st==='spawn'?.7:.5;
      if(e.st==='flop'||e.st==='mega'){e.sx=e.x;e.sy=e.y;e.tx=clamp(P.x,L+e.r,R-e.r);e.ty=clamp(P.y,TOP+e.r,BOT-e.r)}
      if(e.st==='tongue'){e.ta=a;e.thit=false}}}
  else if(e.st==='tongue'){
    if(e.sub==='a'){if(e.stT>.22)e.ta=a;e.face=e.ta;if(e.stT<=0){e.sub='b';e.stT=.2;e.tl=0;sfx('tongue',0,e.x)}}
    else{if(e.sub==='b'){e.tl=Math.min(1,e.tl+dt/.2);if(e.stT<=0){e.sub='c';e.stT=.32}}else{e.tl=Math.max(0,e.stT/.32);if(e.stT<=0){e.tl=0;toWalk(e);return}}
      const m=toadMouth(e,e.ta),len=250*e.tl,ex=m.x+Math.cos(e.ta)*len,ey=m.y+Math.sin(e.ta)*len,dx=ex-m.x,dy=ey-m.y,tt=clamp(((P.x-m.x)*dx+(P.y-6-m.y)*dy)/Math.max(1,dx*dx+dy*dy),0,1);
      if(!e.thit&&e.sub==='b'&&Math.hypot(m.x+dx*tt-P.x,m.y+dy*tt-P.y+6)<11+P.r&&P.inv<=0&&P.dashT<=0){e.thit=true;hurtP(Math.round(20*DMG()));P.pull={x:e.x,y:e.y+e.r,t:.38,sp:280};e.sub='c';e.stT=.32}}}
  else if(e.st==='flop'||e.st==='mega'){
    if(e.sub==='a'){e.face=Math.atan2(e.ty-e.y,e.tx-e.x);if(e.stT<=0){e.sub='air';e.stT=.75;sfx('dash',0,e.x)}}
    else{const p=clamp(1-e.stT/.75,0,1);e.x=e.sx+(e.tx-e.sx)*p;e.y=e.sy+(e.ty-e.sy)*p;e.z=Math.sin(p*Math.PI)*120;
      if(e.stT<=0){e.z=0;moveCircle(e,0,0);G.waves.push({x:e.x,y:e.y,r:e.r,max:e.p2?300:230,dmg:Math.round(16*DMG()),hit:false,rgb:'150,230,90'});
        if(Math.hypot(P.x-e.x,P.y-e.y)<e.r+16)hurtP(Math.round(24*DMG()));const n=e.p2?14:10,o=rand(0,1);for(let i=0;i<n;i++)shootE(e.x,e.y-10,o+i*TAU/n,140,6,11,'poison');
        for(let i=0;i<3;i++){const an=rand(0,TAU);addZone(e.x+Math.cos(an)*40,e.y+Math.sin(an)*26,22,2.6,'acid')}
        stamp('crater',e.x,e.y,34);vfxBlast(e.x,e.y,'150,230,90',110,{debris:['#5a6a3a','#3e4a28','#8a9a5a'],n:22,sparks:10,spcol:['#c8f07a','#7bd65a'],dust:14,spore:10,sporeRgb:'170,240,110'});shake(9);sfx('boom',0,e.x);sfx('splash',1,e.x);dustRing(e.x,e.y);
        if(--e.n>0){e.sub='a';e.stT=.3;e.sx=e.x;e.sy=e.y;e.tx=clamp(P.x,L+e.r,R-e.r);e.ty=clamp(P.y,TOP+e.r,BOT-e.r)}else toWalk(e)}}}
  else if(e.st==='bubbles'){e.face=a;if(e.sub==='a'){e.sac=Math.min(1,e.sac+dt*3);if(e.stT<=0){const n=e.p2?13:9;for(let i=0;i<n;i++){shootE(e.x,e.y-16,a+(i-(n-1)/2)*.2,rand(70,105),9,12,'bubble');G.eproj[G.eproj.length-1].ph=rand(0,9);G.eproj[G.eproj.length-1].life=6}sfx('bubble',0,e.x);e.sub='b';e.stT=.4}}else if(e.stT<=0)toWalk(e)}
  else if(e.st==='spawn'){e.face=a;e.sac=Math.min(1,e.sac+dt*3);if(e.stT<=0){const have=G.enemies.filter(o=>o.type==='tadpole').length,k=Math.min(e.p2?4:3,7-have);const m=toadMouth(e,a);
      for(let i=0;i<k;i++){const t=makeE('tadpole',clamp(m.x+rand(-20,20),L+12,R-12),clamp(m.y+20+rand(-8,8),TOP+12,BOT-12),.25);G.enemies.push(t)}sfx('croak',1,e.x);toWalk(e)}}
};
EDRAW.toad=e=>{const B=basis(e.face),x=e.x,y=e.y-e.z,air=e.st==='flop'||e.st==='mega'?e.sub==='air':false,crouch=(e.st==='flop'||e.st==='mega')&&e.sub==='a'?1:0,
  body=e.p2?'#7a7a2a':'#6a8a3a',dark=e.p2?'#4a4a1a':'#4a6a2a',belly='#e0d8a0',warts=e.p2?'#ff9a3c':'#3f5a22';
  if(e.st==='tongue'&&e.tl>0){const m=toadMouth(e,e.ta),len=250*e.tl,ex=m.x+Math.cos(e.ta)*len,ey=m.y+Math.sin(e.ta)*len;
    ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(ex,ey);ctx.stroke();ctx.strokeStyle='#e86a8a';ctx.lineWidth=7;ctx.stroke();ctx.strokeStyle='rgba(255,220,230,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(m.x,m.y-1);ctx.lineTo(ex,ey-1);ctx.stroke();ink(2.5);circ(ex,ey,7);fs('#e86a8a')}
  ctx.save();ctx.translate(x,y);if(B.side)ctx.scale(B.f,1);ink(3);
  const ox=B.side?6:B.v==='s34'?Math.cos(B.qa)*6*B.f:0,sq=1-crouch*.15;ctx.scale(1,sq);
  // back legs: folded haunches, or hanging down in the air
  if(air){for(const s of [-1,1]){ctx.strokeStyle=INK;ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(s*18,-14);ctx.lineTo(s*26,6);ctx.lineTo(s*20,18);ctx.stroke();ctx.strokeStyle=body;ctx.lineWidth=6;ctx.stroke()}}
  else for(const s of B.side?[-1]:[-1,1]){ell(s*27-(B.side?6:0),-10,15,12,s*.3);fs(dark);ink(3);ell(s*33-(B.side?6:0),2,9,4.5);fs(body)}
  // the body
  ell(0,-26,B.side?30:36,28);fs(body);
  ctx.fillStyle=warts;for(const[wx,wy,wr] of [[-20,-36,4],[18,-40,3.4],[-8,-46,3],[24,-24,3.6],[-26,-20,3],[6,-34,2.6]]){if(B.back||Math.abs(wx)>12||wy<-40){circ(wx,wy,wr);ctx.fill()}}
  if(e.p2){ctx.save();ctx.globalCompositeOperation='lighter';for(const[wx,wy] of [[-20,-36],[18,-40],[24,-24]])glow('255,150,60',x+wx,y+wy,8,.4+.2*Math.sin(G.t*6+wx));ctx.restore()}
  if(!B.back){ctx.fillStyle=belly;ell(ox,-16,B.side?16:24,14);ctx.fill();
    // throat sac swelling
    const sac=e.sac||0;if(sac>.05){ink(2);circ(ox+(B.side?8:0),-12+sac*4,6+sac*14);const g=ctx.createRadialGradient(ox-4,-16,2,ox,-12,6+sac*14);g.addColorStop(0,'#fff8d8');g.addColorStop(1,'#e8d890');ctx.fillStyle=g;ctx.fill();ctx.stroke()}
    // the wide mouth
    ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.beginPath();if(B.side){ctx.moveTo(-6,-28);ctx.quadraticCurveTo(14,-22,30,-30)}else{ctx.moveTo(ox-24,-30);ctx.quadraticCurveTo(ox,-22,ox+24,-30)}ctx.stroke();
    if(e.st==='tongue'&&e.sub!=='a'){ctx.fillStyle='#5a1f2e';ell(ox+(B.side?20:0),-27,8,4);ctx.fill()}
    for(const s of B.side?[1]:[-1,1]){ink(1.8);ell(ox+s*12+(B.side?10:0),-1,7,3);fs(body)}}
  // eyes on top, crown between them
  const eyes=B.side?[10]:[-15,15];for(const k of eyes){const ex=k+ox*.5;ink(2.6);circ(ex,-50,9.5);fs(body);if(!B.back){circ(ex+(B.side?2:0),-51,6.5);fs('#ffcf3c');ctx.fillStyle=INK;ctx.fillRect(ex-5+(B.side?2:0),-52.2,10,2.6);ctx.fillStyle='#fff';circ(ex-2,-54,1.6);ctx.fill()}}
  ctx.save();ctx.translate(ox*.5,-58);ctx.rotate(e.p2?.22:-.08);ink(2);ctx.beginPath();ctx.moveTo(-10,4);ctx.lineTo(-11,-7);ctx.lineTo(-5,-2);ctx.lineTo(0,-10);ctx.lineTo(5,-2);ctx.lineTo(11,-7);ctx.lineTo(10,4);ctx.closePath();fs('#ffd23c');ctx.fillStyle='#e5484d';circ(0,-1,2);ctx.fill();ctx.restore();
  ctx.restore();
  if(air){ctx.fillStyle='rgba(150,230,90,.6)';for(let i=0;i<3;i++){circ(x+rand(-20,20),y+20+rand(0,10),2);ctx.fill()}}};
ESHADOW.toad=e=>{const sz=1-Math.min(.5,e.z/200);shadow(e.x,e.y+6,40*sz,13*sz,.4)};
ELIGHT.toad=(e,Lt)=>{if(e.p2)Lt(e.x,e.y-26,100,.6)};

function hydraHead(e,h){const rx=e.x+h.s*36+Math.sin(e.t*1.6+h.s*2)*4,ry=e.y-58-(h.s===0?16:0)+Math.cos(e.t*1.3+h.s*2)*3-(e.sink||0)*40;
  if(h.ext>0){const k=h.ext;return{x:rx+(h.tx-rx)*k,y:ry+(h.ty-10-ry)*k,rx,ry}}return{x:rx,y:ry,rx,ry}}
EUPD.hydra=(e,dt,sm,a,d)=>{
  if(!e.heads)e.heads=[-1,0,1].map((s,i)=>({s,t:1+i*.7,st:'idle',ext:0,open:0,tx:e.x,ty:e.y,k:0}));
  if(!e.p2&&e.hp<e.max*.5){e.p2=true;banner("L'Idra si infuria",'Fase 2',1.6);bossRage(e,'170,120,255');$('bossBar').classList.add('rage');shake(8);sfx('roar',0,e.x)}
  const sp=e.p2?1.3:1;e.face=a;e.stT-=dt*sp;
  for(const h of e.heads){h.open=Math.max(0,h.open-dt*3);
    if(h.st==='idle'){if(e.st==='walk'&&!e.hidden){h.t-=dt*sp;if(h.t<=0){if(d<200&&Math.random()<.55){h.st='bwarn';h.k=.7;const hp=hydraHead(e,h);let tx=P.x,ty=P.y;const dd=Math.hypot(tx-hp.rx,ty-hp.ry);if(dd>190){tx=hp.rx+(tx-hp.rx)/dd*190;ty=hp.ry+(ty-hp.ry)/dd*190}h.tx=clamp(tx,L+16,R-16);h.ty=clamp(ty,TOP+16,BOT-16)}else{h.st='spit';h.k=.5}}}}
    else if(h.st==='spit'){h.k-=dt*sp;h.open=1;if(h.k<=0){const hp=hydraHead(e,h),n=e.p2?2:1;for(let i=0;i<n;i++)lob(hp.x,hp.y,P.x+rand(-34,34)+(P.vxs||0)*.4,P.y+rand(-34,34)+(P.vys||0)*.4,{kind:'poison',dur:.9,r:22,dmg:13,h:100,delay:i*.18});sfx('eshot','poison',hp.x);h.st='idle';h.t=rand(1.5,2.5)}}
    else if(h.st==='bwarn'){h.k-=dt*sp;h.open=Math.min(1,h.open+dt*4);if(h.k<=0){h.st='bite';h.k=.14;sfx('chomp',1,h.tx)}}
    else if(h.st==='bite'){h.k-=dt;h.ext=Math.min(1,h.ext+dt/.14);if(h.k<=0){h.st='hold';h.k=.22;if(Math.hypot(P.x-h.tx,P.y-h.ty)<28+P.r*.5&&P.inv<=0&&P.dashT<=0)hurtP(Math.round(20*DMG()));stepFx(h.tx,h.ty,true);G.shake=Math.max(G.shake,3)}}
    else if(h.st==='hold'){h.k-=dt;if(h.k<=0){h.st='back';h.k=.3}}
    else if(h.st==='back'){h.k-=dt;h.ext=Math.max(0,h.k/.3);if(h.k<=0){h.ext=0;h.st='idle';h.t=rand(1.3,2.2)}}}
  if(e.st==='walk'){e.moving=false;if(e.stT<=0&&e.heads.every(h=>h.st==='idle')){e.st=e.p2&&(e.si++%2===1)?'breath':'dive';e.sub='a';e.stT=e.st==='dive'?.5:1.1;
      if(e.st==='breath'){const n=e.p2?5:3;for(let k=0;k<n;k++)G.lines.push({x:e.x,y:e.y-40,a:a+(k-(n-1)/2)*.32,len:340,w:24,warn:.85+k*.12,act:.5,hit:false,col:'poison',act0:.5,dmg:18});sfx('creep',1,e.x)}}}
  else if(e.st==='dive'){
    if(e.sub==='a'){e.sink=Math.min(1,1-e.stT/.5);e.hidden=e.sink>.6;if(e.stT<=0){let tx=e.x,ty=e.y;for(let i=0;i<20;i++){tx=rand(L+60,R-60);ty=rand(TOP+70,BOT-120);if(Math.hypot(tx-P.x,ty-P.y)>130&&!G.rocks.some(k=>Math.hypot(k.x-tx,k.y-ty)<k.r+40))break}
        e.tx=tx;e.ty=ty;e.sub='under';e.stT=1;e.hidden=true;G.ripples.push({x:e.x,y:e.y,r:10,max:60,a:1});sfx('splash',1,e.x)}}
    else if(e.sub==='under'){e.hidden=true;if(Math.random()<.5)G.fx.push({k:'bub',x:e.tx+rand(-30,30),y:e.ty+rand(-14,14),t:.6,r:rand(2,4)});
      if(e.stT<=0){e.x=e.tx;e.y=e.ty;e.sub='up';e.stT=.4;e.hidden=false;const n=e.p2?16:12;for(let i=0;i<n;i++)shootE(e.x,e.y-14,i*TAU/n,135,6,12,'poison');
        G.waves.push({x:e.x,y:e.y,r:e.r,max:200,dmg:Math.round(14*DMG()),hit:false,rgb:'150,230,90'});if(Math.hypot(P.x-e.x,P.y-e.y)<e.r+20)hurtP(Math.round(22*DMG()));
        vfxBlast(e.x,e.y,'120,200,140',100,{sparks:12,spcol:['#c8f0d8','#7bd6a0','#ffffff'],dust:0,debris:['#3f7a4a','#2a5a34','#8fd0a8'],n:16,spore:10,sporeRgb:'150,240,170'});shake(8);sfx('splash',2,e.x);sfx('roar',0,e.x)}}
    else{e.sink=Math.max(0,e.stT/.4);if(e.stT<=0){e.sink=0;toWalk(e);e.stT=rand(5,7)}}}
  else if(e.st==='breath'){for(const h of e.heads)h.open=1;if(e.stT<=0){toWalk(e);e.stT=rand(4,6)}}
};
EDRAW.hydra=e=>{if(!e.heads)return;const x=e.x,y=e.y,sink=e.sink||0;if(e.st==='dive'&&e.sub==='under'){ctx.strokeStyle=`rgba(150,255,170,${.5+.3*Math.sin(G.t*20)})`;ctx.lineWidth=3;ell(e.tx,e.ty,46,20);ctx.stroke();return}
  const body=e.p2?'#3a5a5a':'#3f7a4a',belly='#a8d0a0',eye=e.p2?'#c48aff':'#ffd23c';
  // water ring around the body
  ctx.fillStyle='rgba(20,40,30,.75)';ell(x,y+2,48,20);ctx.fill();ctx.strokeStyle=`rgba(190,240,190,${.35+.15*Math.sin(G.t*3)})`;ctx.lineWidth=1.5;ell(x,y+2,50+Math.sin(G.t*2)*2,21);ctx.stroke();
  ctx.save();ctx.beginPath();ctx.rect(x-110,y-200,220,202);ctx.clip();ctx.translate(0,sink*40);ctx.translate(x,y);ctx.scale(1.22,1.22);ctx.translate(-x,-y);
  // body: a scaly mound with dorsal fins
  ink(3);ell(x,y-14,40,26);fs(body);ctx.fillStyle='rgba(0,0,0,.18)';for(let i=-3;i<=3;i++){ctx.beginPath();ctx.arc(x+i*10,y-10+Math.abs(i)*2,5,0,Math.PI);ctx.fill()}
  for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(x+i*13-6,y-34+Math.abs(i)*3);ctx.lineTo(x+i*13,y-48+Math.abs(i)*5);ctx.lineTo(x+i*13+6,y-34+Math.abs(i)*3);ctx.closePath();ink(2.2);fs(e.p2?'#7a4aa8':'#2a5a34')}
  // necks then heads
  const heads=e.heads.slice().sort((p,q)=>Math.abs(q.s)-Math.abs(p.s));
  for(const h of heads){const hp=hydraHead(e,h),rx=x+h.s*16,ry=y-28,cx=(rx+hp.x)/2+h.s*18,cy=Math.min(ry,hp.y)-26;
    ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=15;ctx.beginPath();ctx.moveTo(rx,ry);ctx.quadraticCurveTo(cx,cy,hp.x,hp.y+6);ctx.stroke();ctx.strokeStyle=body;ctx.lineWidth=10;ctx.stroke();ctx.strokeStyle=belly;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(rx+2,ry+2);ctx.quadraticCurveTo(cx+3,cy+4,hp.x+2,hp.y+8);ctx.stroke();
    const ang=h.ext>0?Math.atan2(h.ty-hp.ry,h.tx-hp.rx):Math.atan2(P.y-hp.y,P.x-hp.x),op=h.open;ctx.save();ctx.translate(hp.x,hp.y);ctx.rotate(ang*.5+(Math.cos(ang)<0?Math.PI*.0:0));const fl=Math.cos(ang)<0?-1:1;ctx.scale(fl,1);
    ink(2.4);// lower jaw
    ctx.save();ctx.rotate(op*.45);ctx.beginPath();ctx.moveTo(-4,2);ctx.lineTo(16,3);ctx.lineTo(14,7);ctx.lineTo(-6,8);ctx.closePath();fs(belly);ctx.restore();
    ctx.save();ctx.rotate(-op*.3);ctx.beginPath();ctx.moveTo(-10,-6);ctx.quadraticCurveTo(-4,-12,10,-8);ctx.lineTo(19,-2);ctx.quadraticCurveTo(18,2,12,3);ctx.lineTo(-10,5);ctx.closePath();fs(body);
    ctx.fillStyle='#f6ead2';if(op>.2)for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(8+k*4,2);ctx.lineTo(9.5+k*4,6);ctx.lineTo(11+k*4,2);ctx.fill()}
    ctx.fillStyle=eye;ctx.shadowColor=eye;ctx.shadowBlur=8;ell(4,-5,3.4,2.2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle=INK;ctx.fillRect(3.5,-6.6,1,3.2);
    ink(1.8);ctx.beginPath();ctx.moveTo(-6,-8);ctx.lineTo(-12,-15);ctx.lineTo(-3,-10);ctx.closePath();fs(e.p2?'#7a4aa8':'#2a5a34');ctx.restore();
    ctx.restore()}
  ctx.restore();
  // the water in front of the body
  ctx.strokeStyle='rgba(20,40,30,.85)';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(x,y+2,46,18,0,.15,Math.PI-.15);ctx.stroke();ctx.strokeStyle='rgba(190,240,190,.5)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x,y-1,44,16,0,.3,Math.PI-.3);ctx.stroke()};
ESHADOW.hydra=e=>{};
ELIGHT.hydra=(e,Lt)=>{if(e.heads)for(const h of e.heads){const hp=hydraHead(e,h);Lt(hp.x,hp.y,50,.55)}};
const ETELE={};
ETELE.hydra=e=>{if(!e.heads)return;for(const h of e.heads)if(h.st==='bwarn'||h.st==='bite'){const p=h.st==='bwarn'?1-h.k/.7:1;ctx.strokeStyle=`rgba(229,72,77,${.5+.3*Math.sin(G.t*24)})`;ctx.lineWidth=2.5;circ(h.tx,h.ty,28);ctx.stroke();ctx.fillStyle=`rgba(229,72,77,${.1+p*.25})`;circ(h.tx,h.ty,28*p);ctx.fill()}};
ETELE.toad=e=>{if(e.st==='tongue'&&e.sub==='a'){const m=toadMouth(e,e.ta);ctx.save();ctx.translate(m.x,m.y);ctx.rotate(e.ta);ctx.fillStyle=`rgba(229,72,77,${.12+.1*Math.sin(G.t*22)})`;ctx.fillRect(0,-11,250,22);ctx.strokeStyle='rgba(229,72,77,.7)';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.strokeRect(0,-11,250,22);ctx.setLineDash([]);ctx.restore()}
  if((e.st==='flop'||e.st==='mega')&&e.sub==='air'){const p=1-e.stT/.75;ctx.strokeStyle='rgba(229,72,77,.7)';ctx.lineWidth=3;circ(e.tx,e.ty,e.r+16);ctx.stroke();ctx.fillStyle=`rgba(229,72,77,${.1+p*.25})`;circ(e.tx,e.ty,(e.r+16)*p);ctx.fill()}};
ETELE.mosquito=e=>{if(e.st==='aim'){ctx.strokeStyle=`rgba(229,72,77,${e.stT>.22?.35:.8})`;ctx.lineWidth=e.stT>.22?2:3;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(e.ca)*170,e.y+Math.sin(e.ca)*170);ctx.stroke();ctx.setLineDash([])}};
ETELE.croc=e=>{if(e.st==='rise'){const p=1-e.stT/.55;ctx.strokeStyle=`rgba(229,72,77,${.5+.3*Math.sin(G.t*24)})`;ctx.lineWidth=2.5;circ(e.x,e.y,e.r+22);ctx.stroke();ctx.fillStyle=`rgba(229,72,77,${.08+p*.22})`;circ(e.x,e.y,(e.r+22)*p);ctx.fill()}};

