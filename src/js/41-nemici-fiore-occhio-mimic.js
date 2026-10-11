// ---------- new enemies: eye flower, shadow eye, and the mimic mini boss ----------
Object.assign(ET,{
  eyeflower:{r:13,hp:62,cdmg:10,gold:3},
  shadoweye:{r:12,hp:52,cdmg:11,gold:3},
  mimic:{r:24,hp:900,cdmg:24,gold:45,name:'Il Mimic',title:'La cassa sbagliata'}});
Object.assign(ECOL,{eyeflower:'#c8407a',shadoweye:'#5a3a7a',mimic:'#8a5a32'});
Object.assign(XPV,{eyeflower:6,shadoweye:6,mimic:60});
// beams: lines drawn with their own colour (shadow eye stare, mimic tongue)
function drawBeamLine(l){const C=l.col==='purple'?['190,110,255','230,190,255']:l.col==='poison'?['110,220,70','220,255,180']:['229,72,77','255,170,170'];ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.a);
  if(l.warn>0){ctx.fillStyle=`rgba(${C[0]},${.12+.1*Math.sin(G.t*22)})`;ctx.fillRect(0,-l.w/2,l.len,l.w);ctx.strokeStyle=`rgba(${C[0]},.75)`;ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.strokeRect(0,-l.w/2,l.len,l.w);ctx.setLineDash([])}
  else{const k=Math.max(0,l.act/(l.act0||.3));ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(0,-l.w/2,0,l.w/2);g.addColorStop(0,`rgba(${C[0]},0)`);g.addColorStop(.5,`rgba(${C[1]},${.95*k})`);g.addColorStop(1,`rgba(${C[0]},0)`);ctx.fillStyle=g;ctx.fillRect(0,-l.w/2,l.len,l.w);
    ctx.fillStyle=`rgba(255,255,255,${.8*k})`;ctx.fillRect(0,-1.2,l.len,2.4)}
  ctx.restore()}

// --- eye flower: rooted turret, the eye follows you, spits thorn fans ---
function eyeflowerUpd(e,dt,a,d){e.face=a;
  if(e.wind>0){e.wind-=dt;if(e.wind<=0){const n=e.elite?5:3;for(let k=0;k<n;k++)shootE(e.x,e.y-26,a+(k-(n-1)/2)*.24,175,5,11,'thorn');e.cd=rand(1.7,2.4);e.recoil=.25}}
  else{e.cd-=dt*FR();if(e.cd<=0&&d<300&&clearLine(e.x,e.y-20,P.x,P.y-6,5))e.wind=.6}
  e.recoil=Math.max(0,(e.recoil||0)-dt)}
function drawEyeflower(e){const B=basis(e.face),x=e.x,y=e.y,t=e.t,w=e.wind>0?1-e.wind/.6:0,rc=e.recoil||0;
  ctx.save();ctx.translate(x,y);ink(2.5);
  // leaves at the base
  for(const[s,r] of [[-1,.5],[1,-.5],[-.5,.2],[.5,-.2]]){ctx.fillStyle=Math.abs(s)>.6?'#4f8a34':'#3f7a2a';ctx.beginPath();ctx.ellipse(s*11,6,9,4.5,r,0,TAU);ctx.fill();ctx.stroke()}
  // thorny vines curling at the sides
  const vine=(sd,h,ph)=>{const sw=Math.sin(t*1.6+ph)*2;ctx.beginPath();ctx.moveTo(sd*5,4);ctx.bezierCurveTo(sd*14,-4,sd*(16+sw),-h*.6,sd*(10+sw),-h);ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle='#5f9e3c';ctx.lineWidth=2.6;ctx.stroke();
    ctx.fillStyle='#e8d8a0';for(const q of [.35,.6,.85]){const px=sd*(5+(14-5)*q+sw*q),py=4-(h+4)*q;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+sd*3,py-1.5);ctx.lineTo(px,py-2.6);ctx.closePath();ctx.fill()}
    ink(1.6);ctx.fillStyle='#c8407a';ctx.beginPath();ctx.ellipse(sd*(10+sw),-h-2,2.4,3.4,sd*.4,0,TAU);ctx.fill();ctx.stroke();ink(2.5)};
  vine(-1,22,0);vine(1,18,2);
  // stem
  const hx=B.lx*3,hy=-30+rc*6;ctx.strokeStyle=INK;ctx.lineWidth=6.5;ctx.beginPath();ctx.moveTo(0,5);ctx.quadraticCurveTo(-4,-12,hx,hy+6);ctx.stroke();ctx.strokeStyle='#5f9e3c';ctx.lineWidth=3.6;ctx.stroke();
  ctx.fillStyle='#e8d8a0';for(const q of [-6,-14]){ctx.beginPath();ctx.moveTo(-2,q);ctx.lineTo(-6,q-1);ctx.lineTo(-2.4,q-3);ctx.closePath();ctx.fill()}
  // flower head: petals, then the eye (front) or the green back (back views)
  ctx.translate(hx,hy);const open=1+w*.25,petal=B.back?'#9a2f5f':'#c8407a';ink(2.2);
  if(B.side){for(let i=0;i<6;i++){const a=(i/6-.5)*Math.PI*1.1;ctx.fillStyle=i%2?petal:'#d65b8f';ctx.beginPath();ctx.ellipse(-2+Math.cos(a)*7*open,Math.sin(a)*12*open,5,3.2,a,0,TAU);ctx.fill();ctx.stroke()}}
  else{for(let i=0;i<8;i++){const a=i/8*TAU+.2;ctx.fillStyle=i%2?petal:(B.back?'#a8467f':'#e0609a');ctx.beginPath();ctx.ellipse(Math.cos(a)*10*open,Math.sin(a)*10*open,6.5,4,a,0,TAU);ctx.fill();ctx.stroke()}}
  if(B.back){circ(0,0,8.5);fs('#4f8a34');ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1.2;for(let i=0;i<5;i++){const a=i/5*TAU;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*7,Math.sin(a)*7);ctx.stroke()}ink(2.2)}
  else{const ex=B.side?3:B.v==='s34'?1.5:0,er=B.side?6.2:8;ctx.beginPath();ctx.ellipse(ex,0,B.side?er*.75:er,er,0,0,TAU);fs(w>0?`rgb(255,${226-w*90|0},${180-w*120|0})`:'#f4e6b8');
    const px=ex+B.lx*2.4,py=B.ly*2;ctx.fillStyle='#1b1612';ctx.beginPath();ctx.ellipse(px,py,1.6+w*.6,4.6-w,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.8)';circ(ex-2.4,-2.6,1.4);ctx.fill();
    if(w>0)glow('255,90,90',ex,0,16,w*.5)}
  ctx.restore()}

// --- shadow eye: drifts through walls, stares, then fires a beam ---
function shadoweyeUpd(e,dt,sm,a,d){
  if(e.stare>0){e.stare-=dt;e.moving=false;if(e.stare>.3)e.aimA=a;e.face=e.aimA;if(e.stare<=0){e.cd=rand(2.2,3);e.recoil=.3}return}
  const want=d<120?-1:d>180?1:0,sa=want===0?a+Math.PI/2*e.side:a,dir=want===0?1:want;
  moveCircle(e,Math.cos(sa)*dir*62*sm*dt,Math.sin(sa)*dir*62*sm*dt,true);if(Math.random()<dt*.35)e.side*=-1;e.face=a;e.moving=true;
  e.cd-=dt*FR();e.recoil=Math.max(0,(e.recoil||0)-dt);
  if(e.cd<=0){e.stare=.85;e.aimA=a;const n=e.elite?3:1;for(let k=0;k<n;k++)G.lines.push({x:e.x,y:e.y-14,a:a+(k-(n-1)/2)*.32,len:430,w:12,warn:.85,act:.22,act0:.22,hit:false,col:'purple',dmg:15})}}
function drawShadoweye(e){const B=basis(e.face),x=e.x,y=e.y-18+Math.sin(e.t*2.4)*3,t=e.t,st=e.stare>0?1-e.stare/.85:0;
  ctx.save();ctx.translate(x,y);
  // smoky crown and orbiting motes
  for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*.3,len=3+Math.sin(t*4+i*1.7)*3+(3-Math.abs(i-3))*2,sw=Math.sin(t*3+i)*3;ctx.fillStyle=i%2?'#24162f':'#3a2550';ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(Math.cos(a-.32)*11,Math.sin(a-.32)*11);ctx.quadraticCurveTo(Math.cos(a)*(14+len)+sw,Math.sin(a)*(14+len)-4,Math.cos(a)*(16+len)+sw*1.6,Math.sin(a)*(18+len));ctx.quadraticCurveTo(Math.cos(a)*(12+len*.5),Math.sin(a)*(12+len*.5),Math.cos(a+.32)*11,Math.sin(a+.32)*11);ctx.closePath();ctx.fill();ctx.stroke()}
  for(let i=0;i<6;i++){const a=t*1.4+i*TAU/6,r=19+Math.sin(t*2+i)*2,mx=Math.cos(a)*r,my=Math.sin(a)*r*.55;if(Math.sin(a)<0){ink(1.4);circ(mx,my,2.4);fs('#2a1a3a')}}
  ink(2.5);const g=ctx.createRadialGradient(-4,-5,2,0,0,13);g.addColorStop(0,'#5a3a7a');g.addColorStop(1,'#1e1228');ctx.fillStyle=g;circ(0,0,12.5);ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(180,120,255,.25)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,8,t*.8,t*.8+2.2);ctx.stroke();
  if(!B.back){const ex=B.side?6:B.v==='s34'?3.5:0,ew=B.side?4.2:6.6;glow('190,110,255',ex,0,16,.35+st*.5);
    ctx.fillStyle='#f6e8f4';ctx.beginPath();ctx.moveTo(ex-ew,0);ctx.quadraticCurveTo(ex,-6,ex+ew,0);ctx.quadraticCurveTo(ex,6,ex-ew,0);ctx.closePath();ctx.fill();ctx.strokeStyle='#b874e6';ctx.lineWidth=1.6;ctx.stroke();
    ctx.fillStyle='#1b0f22';ctx.beginPath();ctx.ellipse(ex+B.lx*1.6,B.ly*1.2,1.2+st*.8,4.4,0,0,TAU);ctx.fill();
    ctx.strokeStyle='rgba(190,110,255,.7)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(ex-ew-3,0);ctx.lineTo(ex-ew-6,-1);ctx.moveTo(ex+ew+3,0);ctx.lineTo(ex+ew+6,-1);ctx.stroke()}
  for(let i=0;i<6;i++){const a=t*1.4+i*TAU/6,r=19+Math.sin(t*2+i)*2,mx=Math.cos(a)*r,my=Math.sin(a)*r*.55;if(Math.sin(a)>=0){ink(1.4);circ(mx,my,2.4);fs('#3a2550')}}
  ctx.restore();ink(2.5)}

// --- the mimic: hops, bites, lashes its tongue, spits coins ---
function mimicUpd(e,dt,a,d){
  if(!e.p2&&e.hp<e.max*.5){e.p2=true;banner('Il Mimic è furioso','Fase 2',1.5);bossRage(e,'255,200,80');$('bossBar').classList.add('rage');shake(7);sfx('roar')}
  const sp=e.p2?1.3:1,seq=e.p2?['chomp','coins','tongue','chomp','quake','coins']:['chomp','coins','chomp','tongue'];e.stT-=dt*sp;e.mouth=Math.max(0,(e.mouth||0)-dt*3);
  if(e.st==='walk'){const na=navAngle(e);e.face=na;e.hopT=(e.hopT||0)+dt*(e.p2?9:7);e.z=Math.abs(Math.sin(e.hopT))*6;moveCircle(e,Math.cos(na)*(e.p2?95:78)*dt,Math.sin(na)*(e.p2?95:78)*dt);e.moving=true;
    if(e.stT<=0){e.z=0;e.st=seq[e.si++%seq.length];e.sub='a';e.ca=a;e.stT=e.st==='chomp'?.5:e.st==='tongue'?.6:e.st==='quake'?.55:.4;
      if(e.st==='tongue'){const n=e.p2?3:1;for(let k=0;k<n;k++)G.lines.push({x:e.x,y:e.y-8,a:a+(k-(n-1)/2)*.5,len:180,w:16,warn:.6,act:.25,act0:.25,hit:false,col:'red',dmg:22})}}}
  else if(e.st==='chomp'){if(e.sub==='a'){e.face=e.ca;e.mouth=1;if(e.stT<=0){e.sub='b';e.stT=.42;sfx('dash')}}
    else{const ox=e.x,oy=e.y;moveCircle(e,Math.cos(e.ca)*330*dt,Math.sin(e.ca)*330*dt);e.mouth=Math.abs(Math.sin(e.stT*30));if(Math.random()<.5)G.fx.push({k:'puff',x:e.x,y:e.y+8,vx:0,vy:-6,t:.3,r:5});
      if(e.stT<=0||Math.hypot(e.x-ox,e.y-oy)<1){shake(4);toWalk(e)}}}
  else if(e.st==='tongue'){e.face=e.ca;e.mouth=1;if(e.stT<=0)toWalk(e)}
  else if(e.st==='coins'){e.face=a;e.mouth=1;if(e.stT<=0){const n=e.p2?11:7;for(let k=0;k<n;k++)shootE(e.x,e.y-14,a+(k-(n-1)/2)*.16,190,6,12,'coinp');sfx('coin');vfxBlast(e.x+Math.cos(a)*14,e.y-16+Math.sin(a)*10,'255,210,90',30,{sparks:12,spcol:PAL.gold,dust:0,ring2:false});if(e.p2)for(let k=0;k<10;k++)shootE(e.x,e.y-14,k*TAU/10+G.t,120,6,12,'coinp');toWalk(e)}}
  else if(e.st==='quake'){e.z=Math.sin(Math.max(0,1-e.stT/.55)*Math.PI)*30;if(e.stT<=0){e.z=0;shake(8);sfx('boom');stamp('crater',e.x,e.y,26);dustRing(e.x,e.y,16);vfxBlast(e.x,e.y,'255,215,120',90,{debris:'stone',n:16,sparks:16,cracks:40});G.waves.push({x:e.x,y:e.y,r:10,max:190,dmg:Math.round(18*DMG()),hit:false});if(Math.hypot(P.x-e.x,P.y-e.y)<50)hurtP(Math.round(24*DMG()));toWalk(e)}}}
function drawMimic(e){const B=basis(e.face),v=B.v,x=e.x,y=e.y-e.z,t=e.t,m=e.intro>0?1:(e.mouth||0),chew=e.st==='walk'?Math.abs(Math.sin(t*6))*.35:0,op=Math.max(m,chew);
  const W=17,H=13,wood='#7a4e2a',woodD='#5a3620',band='#d9a640',bandD='#8a6420';
  ctx.save();ctx.translate(x,y);ctx.scale(B.f*1.4,1.4);ink(2.5);
  // legs
  const lw=Math.sin(e.hopT||0)*2;for(const[lx,ly] of [[-11,9],[11,9],[-6,11],[6,11]]){ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(lx*.8,4);ctx.lineTo(lx+(ly>10?lw:-lw),ly);ctx.stroke();ctx.strokeStyle=bandD;ctx.lineWidth=2.6;ctx.stroke();circ(lx+(ly>10?lw:-lw),ly,2.4);fs(band)}
  const side=B.side,back=B.back,bw=side?W*.8:W;
  // body box
  ctx.beginPath();ctx.rect(-bw,-H,bw*2,H+5);ctx.fillStyle=vGrad(-bw,bw,wood,woodD,'#3e2414');ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.2;for(const yy of [-8,-3]){ctx.beginPath();ctx.moveTo(-bw+2,yy);ctx.lineTo(bw-2,yy);ctx.stroke()}ink(2.5);
  for(const bx of side?[-bw+3,bw-5]:[-bw+4,bw-7]){ctx.fillStyle=band;ctx.fillRect(bx,-H,3.5,H+5);ctx.strokeRect(bx,-H,3.5,H+5)}
  ctx.fillStyle=band;ctx.fillRect(-bw,1,bw*2,3);ctx.strokeRect(-bw,1,bw*2,3);
  if(back||(op<.05)){// closed lid
    ctx.beginPath();ctx.moveTo(-bw,-H);ctx.quadraticCurveTo(0,-H-12,bw,-H);ctx.closePath();ctx.fillStyle=wood;ctx.fill();ctx.stroke();
    ctx.strokeStyle=band;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-bw,-H);ctx.quadraticCurveTo(0,-H-12,bw,-H);ctx.stroke();ink(2.5);
    if(!back){ctx.fillStyle=band;ctx.fillRect(-3,-H-3,6,6);ctx.strokeRect(-3,-H-3,6,6)}
    if(back&&op>.3){ctx.fillStyle='#e8dcc4';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-bw+3+i*8,-H);ctx.lineTo(-bw+6+i*8,-H+4);ctx.lineTo(-bw+9+i*8,-H);ctx.fill()}}}
  else{// open mouth: inside, teeth, tongue, lid with the eye
    const ex=side?bw*.35:0,gap=4+op*10;
    ctx.fillStyle='#3a0e10';ctx.beginPath();ctx.ellipse(ex,-H,bw-1,gap*.6,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle='#f4ecd8';ink(1.2);for(let i=0;i<5;i++){const tx=-bw+4+i*(bw*2-8)/4;ctx.beginPath();ctx.moveTo(tx-2.6,-H-1);ctx.lineTo(tx,-H+3.5);ctx.lineTo(tx+2.6,-H-1);ctx.closePath();ctx.fill();ctx.stroke()}
    const tg=Math.sin(t*8)*3,tx2=ex+(side?14:5)+tg,ty2=-H+10+op*8;ctx.lineCap='round';for(const[c,lw] of [[INK,9],['#d64550',6]]){ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(ex,-H+1);ctx.quadraticCurveTo(ex+(side?10:-4)+tg,-H+8,tx2,ty2);ctx.stroke()}ctx.strokeStyle='rgba(120,20,30,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ex+1,-H+3);ctx.quadraticCurveTo(ex+(side?9:-3)+tg,-H+8,tx2-1,ty2-2);ctx.stroke();ink(2.5);
    ctx.save();ctx.translate(0,-H);ctx.rotate(side?-.4*op:0);const ly=-gap;
    ctx.beginPath();ctx.moveTo(-bw,ly);ctx.quadraticCurveTo(0,ly-12,bw,ly);ctx.lineTo(bw,ly+3);ctx.lineTo(-bw,ly+3);ctx.closePath();ctx.fillStyle=wood;ctx.fill();ink(2.5);ctx.stroke();
    ctx.strokeStyle=band;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-bw,ly);ctx.quadraticCurveTo(0,ly-12,bw,ly);ctx.stroke();
    ctx.fillStyle='#f4ecd8';ink(1.2);for(let i=0;i<5;i++){const tx=-bw+4+i*(bw*2-8)/4;ctx.beginPath();ctx.moveTo(tx-2.6,ly+3);ctx.lineTo(tx,ly+7.5);ctx.lineTo(tx+2.6,ly+3);ctx.closePath();ctx.fill();ctx.stroke()}
    const eyx=side?bw*.4:B.v==='s34'?3:0;glow('255,60,40',eyx,ly-5,12,.5);ink(1.8);circ(eyx,ly-5,4.4);fs(band);circ(eyx,ly-5,3);fs('#e5301a');ctx.fillStyle='#1b1612';ctx.beginPath();ctx.ellipse(eyx+B.lx,ly-5,.9,2.4,0,0,TAU);ctx.fill();ctx.fillStyle='#fff';circ(eyx-1,ly-6.4,.9);ctx.fill();
    ctx.restore()}
  ctx.restore();if(e.p2)glow('255,200,80',x,y-10,40,.18);ink(2.5)}
function drawCoinProj(p){glow('255,210,90',p.x,p.y,12,.35);if(icoOk(ICO.coin)){const k=.15+.85*Math.abs(Math.cos(G.t*12+p.x)),w=p.r*2.8;ctx.drawImage(ICO.coin,p.x-w*k/2,p.y-w/2,w*k,w);return}ink(1.8);ctx.save();ctx.translate(p.x,p.y);ctx.scale(Math.abs(Math.cos(G.t*12+p.x)),1);circ(0,0,p.r);fs('#ffc93c');ctx.fillStyle='rgba(255,255,255,.7)';circ(-1.5,-1.5,1.6);ctx.fill();ctx.restore()}

