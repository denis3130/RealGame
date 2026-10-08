// =====================================================================
// THE BEAST OF THE ABYSS (preview): the colossal skeleton around the arena wakes up and becomes the boss.
// Entrance: the camera pulls back over the abyss, everything shakes, the ribs drop into the dark, two huge bony hands
// climb out and grab the wall on either side of the gate, the skull rises and smashes the gate with its head:
// until it is beaten, nobody gets through. It is hit on the skull. Its hands slam, sweep, rake and stab the arena.
// Phase 1 green eyes, phase 2 violet, phase 3 red (tail sweeps and the floor breaks into the abyss).
// =====================================================================
BOSSES.add('beast');
Object.assign(ET,{beast:{r:44,hp:3400,cdmg:18,gold:220,name:"La Bestia dell'Abisso",title:'Il paesaggio si sveglia'}});
Object.assign(ECOL,{beast:'#d8cfb2'});Object.assign(XPV,{beast:0});Object.assign(MAT_OF,{beast:'bone'});Object.assign(BOSS_INTRO,{beast:6.6});
const BE={col:['120,235,80','190,110,255','255,80,50'],name:['','Si alza dalle ossa','La furia dell’abisso']};
const bePh=e=>e.hp>e.max*.66?0:e.hp>e.max*.33?1:2;
const beCanHurt=()=>P.inv<=0&&P.dashT<=0;
const beMouth=e=>({x:e.x,y:TOP+54});
const ease=k=>k<0?0:k>1?1:k*k*(3-2*k),lerp=(a,b,k)=>a+(b-a)*k;
const beBeast=()=>G.enemies&&G.enemies.find(e=>e.type==='beast'&&!e.dead);
function beAdd(h){(G.beH=G.beH||[]).push(Object.assign({t:0,hit:false},h))}
const BONE='#cbc69c',BONES='#7f7b58',BONEH='#ece7be';
const beBone=(pts,w,col)=>{ctx.lineCap='round';ctx.lineJoin='round';const path=()=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y))};
  path();ctx.strokeStyle=INK;ctx.lineWidth=w+6;ctx.stroke();path();ctx.strokeStyle=col||BONE;ctx.lineWidth=w;ctx.stroke();ctx.save();ctx.translate(-w*.12,-w*.2);path();ctx.strokeStyle=BONEH;ctx.lineWidth=w*.3;ctx.stroke();ctx.restore();
  ctx.save();ctx.translate(0,w*.22);path();ctx.strokeStyle='rgba(127,123,88,.8)';ctx.lineWidth=w*.3;ctx.stroke();ctx.restore()};

// ---------- the hands ----------
const HREST=side=>({x:AW/2+side*178,y:TOP-20,z:0,ang:Math.PI/2,spread:1,curl:.25});
function beHandsInit(){G.beHands=[-1,1].map(side=>Object.assign({side,vis:0,act:null},HREST(side)))}
const hFree=()=>G.beHands&&G.beHands.every(h=>!h.act);
function hGo(h,tx,ty,tz,k){h.x+=(tx-h.x)*k;h.y+=(ty-h.y)*k;h.z+=(tz-h.z)*k}
function hPose(h,ang,spread,curl,k){let da=ang-h.ang;while(da>Math.PI)da-=TAU;while(da<-Math.PI)da+=TAU;h.ang+=da*k;h.spread+=(spread-h.spread)*k;h.curl+=(curl-h.curl)*k}
function beImpact(x,y,r,dmg,big){shake(big?13:9);G.hitstop=Math.max(G.hitstop||0,big?.08:.05);sfx('boom',0,x);sfx('rock','urn',x);
  fxPush({k:'ring2',x,y,rgb:'230,215,190',r0:r*.6,r1:r*2.4,t:.45,max:.45,w:9});fxPush({k:'ring2',x,y,rgb:'255,255,255',r0:r*.3,r1:r*1.4,t:.25,max:.25,w:5});
  dustRing(x,y,18);ENV2.chunks(x,y,16,[stonePal().hi,stonePal().mid,stonePal().lo],170);ENV2.rocks(x,y,r*2.2,3);ENV2.wiltGrass(x,y,r*1.2);
  // the palm print: a crater with five finger holes
  const c=fx;c.save();c.setTransform(2,0,0,2,0,0);const g=c.createRadialGradient(x,y,4,x,y,r);g.addColorStop(0,'rgba(0,0,0,.5)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.ellipse(x,y,r,r*.62,0,0,TAU);c.fill();
  c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=2;for(let i=0;i<9;i++){const a=i/9*TAU+rand(-.2,.2);let px=x+Math.cos(a)*r*.4,py=y+Math.sin(a)*r*.25;c.beginPath();c.moveTo(px,py);for(let j=0;j<3;j++){px+=Math.cos(a+rand(-.4,.4))*r*.3;py+=Math.sin(a+rand(-.4,.4))*r*.18;c.lineTo(px,py)}c.stroke()}
  c.fillStyle='rgba(8,5,4,.75)';for(let i=0;i<4;i++){c.beginPath();c.ellipse(x-21+i*14,y+r*.55,4,2.6,0,0,TAU);c.fill()}c.restore();
  if(beCanHurt()&&Math.hypot(P.x-x,(P.y-y)*1.15)<r+P.r*.5){hurtP(Math.round(dmg*DMG()));const a=Math.atan2(P.y-y,P.x-x);P.x=clamp(P.x+Math.cos(a)*30,L+10,R-10);P.y=clamp(P.y+Math.sin(a)*30,TOP+10,BOT-10)}}
function gouge(pts){const c=fx;c.save();c.setTransform(2,0,0,2,0,0);c.lineCap='round';for(const[x0,y0,x1,y1] of pts){c.strokeStyle='rgba(0,0,0,.32)';c.lineWidth=3.4;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();c.strokeStyle='rgba(255,255,255,.1)';c.lineWidth=1.2;c.beginPath();c.moveTo(x0+1.5,y0+1.5);c.lineTo(x1+1.5,y1+1.5);c.stroke()}c.restore()}
const HACT={
  // lifts, follows the hero with its shadow, comes down with all its weight, stays dug in, then goes back to the wall
  slam(h,a,dt){const T1=.45,T2=a.fast?.38:.7,T3=.1,T4=.5,T5=.5,t=a.t,k=1-Math.exp(-dt*10);if(a.tx==null){a.tx=clamp(P.x+(a.off||0),L+40,R-40);a.ty=clamp(P.y,TOP+60,BOT-30)}
    if(t<T1+T2){if(t>T1){a.tx+=(clamp(P.x+(a.off||0),L+40,R-40)-a.tx)*Math.min(1,dt*2.6);a.ty+=(clamp(P.y,TOP+60,BOT-30)-a.ty)*Math.min(1,dt*2.6)}hGo(h,a.tx,a.ty,150+Math.sin(t*9)*6,k);hPose(h,Math.PI/2,1.7,.05,k);a.warn=1}
    else if(t<T1+T2+T3){h.z=Math.max(0,h.z-dt*150/T3*1.2);h.x=a.tx;h.y=a.ty;a.warn=1}
    else if(t<T1+T2+T3+T4){if(!a.hit){a.hit=1;h.z=0;beImpact(a.tx,a.ty,56,24,a.big)}h.z=0;hPose(h,Math.PI/2,1.9,0,k);a.warn=0}
    else if(t<T1+T2+T3+T4+T5){const r=HREST(h.side);hGo(h,r.x,r.y,40,k*.9);hPose(h,r.ang,r.spread,r.curl,k)}else return true},
  // the hand lies at the wall, then sweeps the whole row of the arena, claws scraping the floor
  sweep(h,a,dt){const T1=.5,T2=.95,T3=.6,T4=.6,t=a.t,k=1-Math.exp(-dt*10),sx=h.side<0?L-6:R+6,ex=h.side<0?R+40:L-40,dir=h.side<0?0:Math.PI;if(a.y==null)a.y=clamp(P.y,TOP+90,BOT-30);
    if(t<T1){hGo(h,sx,a.y,25,k);hPose(h,dir,.8,.4,k);a.warn=1}
    else if(t<T1+T2){h.x=sx+Math.sin(t*50)*2;h.y=a.y;h.z=8;hPose(h,dir,.8,.45,k);a.warn=1}
    else if(t<T1+T2+T3){const u=ease((t-T1-T2)/T3);h.x=lerp(sx,ex,u);h.y=a.y;h.z=4;a.warn=0;if(!a.snd){a.snd=1;sfx('crumble',.7,h.x);shake(5)}
      if(Math.random()<.8)G.fx.push({k:'puff',x:h.x,y:a.y+10,vx:rand(-30,30),vy:-12,t:.45,r:rand(5,9)});
      if(!a.hit&&beCanHurt()&&Math.abs(P.y-a.y)<30+P.r*.5&&Math.abs(P.x-h.x)<42){a.hit=1;hurtP(Math.round(22*DMG()));P.x=clamp(P.x+(h.side<0?50:-50),L+10,R-10)}}
    else if(t<T1+T2+T3+T4){if(!a.gg){a.gg=1;gouge([-14,-5,4,13].map(o=>[L+4,a.y+o,R-4,a.y+o+rand(-3,3)]));ENV2.rocks(AW/2,a.y,AW,1)}const r=HREST(h.side);hGo(h,r.x,r.y,60,k*.8);hPose(h,r.ang,r.spread,r.curl,k)}else return true},
  // raises the claws above the gate and rakes the arena from top to bottom, leaving four furrows
  rake(h,a,dt){const T1=.5,T2=.85,T3=.5,T4=.6,t=a.t,k=1-Math.exp(-dt*10);if(a.x==null)a.x=clamp(P.x,L+40,R-40);
    if(t<T1){hGo(h,a.x,TOP+120,40,k);hPose(h,Math.PI/2,1.25,.15,k);a.warn=1}
    else if(t<T1+T2){h.x=a.x+Math.sin(t*40)*1.5;h.y=TOP+120;h.z=40+Math.sin(t*6)*5;a.warn=1}
    else if(t<T1+T2+T3){const u=ease((t-T1-T2)/T3);h.x=a.x;h.y=lerp(TOP+120,BOT-10,u);h.z=Math.max(0,h.z-dt*600);a.warn=0;if(!a.snd){a.snd=1;sfx('crumble',.8,a.x);shake(6)}
      if(Math.random()<.7)for(const o of [-24,-8,8,24])if(Math.random()<.3)G.fx.push({k:'puff',x:a.x+o,y:h.y+30,vx:rand(-10,10),vy:-14,t:.4,r:rand(3,6)});
      if(!a.hit&&beCanHurt()&&Math.abs(P.y-(h.y+30))<26&&[-24,-8,8,24].some(o=>Math.abs(P.x-(a.x+o))<7+P.r*.6)){a.hit=1;hurtP(Math.round(20*DMG()))}}
    else if(t<T1+T2+T3+T4){if(!a.gg){a.gg=1;gouge([-24,-8,8,24].map(o=>[a.x+o,TOP+100,a.x+o+rand(-4,4),BOT-6]));ENV2.rocks(a.x,AH/2,AH,1)}const r=HREST(h.side);hGo(h,r.x,r.y,80,k*.8);hPose(h,r.ang,r.spread,r.curl,k)}else return true},
  // a finger stabs the floor again and again, walking toward the hero
  stab(h,a,dt){const n=5,per=.36,k=1-Math.exp(-dt*14);if(!a.pts){a.pts=[];const sx=h.x,sy=TOP+60;for(let i=0;i<n;i++){const u=(i+1)/n;a.pts.push({x:clamp(lerp(sx,P.x,u)+rand(-14,14),L+20,R-20),y:clamp(lerp(sy,P.y,u),TOP+50,BOT-20)})}}
    const t=a.t-.4;if(t<0){hGo(h,a.pts[0].x,a.pts[0].y,70,k);hPose(h,Math.PI/2,.55,.55,k);return}
    const i=Math.floor(t/per),f=t/per-i;if(i>=n){const r=HREST(h.side);hGo(h,r.x,r.y,60,k*.6);hPose(h,r.ang,r.spread,r.curl,k);return a.t>.4+n*per+.6}
    const p=a.pts[i];a.cur=i;h.x+=(p.x-h.x)*k;h.y+=(p.y-h.y)*k;h.z=f<.6?60*(1-f/.6)+10:0;
    if(f>=.6&&a.last!==i){a.last=i;beImpact(p.x,p.y,24,14,false)}}};
function hStart(h,k,o){h.act=Object.assign({k,t:0},o||{})}
function beHandsUpd(dt){if(!G.beHands)return;for(const h of G.beHands){if(!h.vis)continue;if(h.act){h.act.t+=dt;if(HACT[h.act.k](h,h.act,dt)){h.act=null}}
  else{const r=HREST(h.side),k=1-Math.exp(-dt*5);hGo(h,r.x,r.y+Math.sin((G.t||0)*1.3+h.side)*2,r.z,k);hPose(h,r.ang,r.spread,r.curl+.05*Math.sin((G.t||0)*2+h.side),k)}}}
// drawing a hand and its arm
function beDrawHand(h){if(!h.vis)return;const s=1+Math.max(0,h.z)/220,x=h.x,y=h.y-h.z*.85,rot=h.ang-Math.PI/2,fdx=Math.cos(h.ang),fdy=Math.sin(h.ang),K=INK;
  ctx.save();ctx.globalAlpha*=h.vis;
  // arm: shoulder far out in the dark, elbow bent outward, two bones in the forearm
  const wx=x-fdx*20*s,wy=y-fdy*20*s,sx=AW/2+h.side*270,sy=-170,mx=(sx+wx)/2,my=(sy+wy)/2,dx=wx-sx,dy=wy-sy,ln=Math.hypot(dx,dy)||1,nx=-dy/ln,ny=dx/ln,b=Math.min(80,ln*.22);
  let ex=mx+nx*b,ey=my+ny*b;if(Math.abs(mx-nx*b-AW/2)>Math.abs(ex-AW/2)){ex=mx-nx*b;ey=my-ny*b}
  beBone([[sx,sy],[ex,ey]],22,BONES);ink(3);circ(ex,ey,13);fs(BONE);
  const fx2=-(wy-ey)/(Math.hypot(wx-ex,wy-ey)||1),fy2=(wx-ex)/(Math.hypot(wx-ex,wy-ey)||1);beBone([[ex+fx2*5,ey+fy2*5],[wx+fx2*6,wy+fy2*6]],10);beBone([[ex-fx2*5,ey-fy2*5],[wx-fx2*5,wy-fy2*5]],8,BONES);
  ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);
  // palm and wrist bones
  ink(3);ctx.beginPath();ctx.moveTo(-23,-22);ctx.quadraticCurveTo(0,-31,23,-22);ctx.lineTo(25,6);ctx.quadraticCurveTo(0,13,-25,6);ctx.closePath();fs(BONE);
  ctx.fillStyle='rgba(127,123,88,.7)';for(const[a2,b2] of [[-14,-18],[-2,-20],[10,-18],[-8,-8],[5,-8]]){ctx.beginPath();ctx.ellipse(a2,b2,5,3.6,0,0,TAU);ctx.fill()}
  ctx.strokeStyle=BONEH;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-18,-24);ctx.quadraticCurveTo(0,-29,16,-24);ctx.stroke();
  // fingers: three phalanges each and a claw
  const base=[-17,-6,5,16],lens=[[14,11,9],[17,13,10],[16,12,9],[12,9,7]];
  for(let i=0;i<4;i++){let px=base[i],py=8,th=(i-1.5)*.17*h.spread;const sh=1-h.curl*.5;
    for(let j=0;j<3;j++){const l=lens[i][j]*sh,nx2=px+Math.sin(th)*l,ny2=py+Math.cos(th)*l;ctx.lineCap='round';ctx.strokeStyle=K;ctx.lineWidth=10-j*1.6;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(nx2,ny2);ctx.stroke();ctx.strokeStyle=j===0?BONE:j===1?'#c2bc92':BONES;ctx.lineWidth=6.5-j*1.4;ctx.stroke();
      ink(1.6);circ(px,py,3.6-j*.5);fs(BONE);px=nx2;py=ny2;th+=(i-1.5)*.06*h.spread}
    ink(1.6);ctx.beginPath();ctx.moveTo(px-3,py-1);ctx.lineTo(px+Math.sin(th)*9,py+Math.cos(th)*9);ctx.lineTo(px+3,py-1);ctx.closePath();fs('#efe6c8')}
  // thumb on the inner side
  {const tx=-h.side*24,a2=-h.side*.9;let px=tx,py=-6;for(let j=0;j<2;j++){const l=12-j*3,nx2=px+Math.sin(a2+j*-h.side*.3)*l*-h.side*-1,ny2=py+Math.cos(a2)*l*.8;ctx.strokeStyle=K;ctx.lineWidth=9-j*2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(nx2,ny2);ctx.stroke();ctx.strokeStyle=BONE;ctx.lineWidth=6-j*1.5;ctx.stroke();px=nx2;py=ny2}
    ink(1.6);ctx.beginPath();ctx.moveTo(px-3,py);ctx.lineTo(px-h.side*-6,py+7);ctx.lineTo(px+3,py);ctx.closePath();fs('#efe6c8')}
  ctx.restore()}
function beDrawHandShadow(h){if(!h.vis||h.y<TOP-10)return;const s=1+h.z/220,a=.38*Math.max(.25,1-h.z/260)*h.vis;ctx.fillStyle=`rgba(0,0,0,${a})`;ctx.beginPath();ctx.ellipse(h.x,h.y+10,44*s,16*s,0,0,TAU);ctx.fill()}

// ---------- the fight ----------
EUPD.beast=(e,dt,sm,a,d)=>{e.x=AW/2;e.y=TOP+34;e.face=Math.PI/2;e.moving=false;const ph=bePh(e);
  if(ph>(e.ph||0)){e.ph=ph;banner(ET.beast.name,BE.name[ph],1.8);bossRage(e,BE.col[ph]);$('bossBar').classList.toggle('rage',ph===2);shake(14);sfx('roar',0,e.x);ENV2.fall(14);
    for(const h of G.beHands)h.z=70;e.st='walk';e.stT=1.6;G.beH=(G.beH||[]).filter(h=>h.k==='pit')}
  const sp=ph===2?1.2:1;e.stT=(e.stT==null?2:e.stT)-dt*sp;e.jaw=Math.max(0,(e.jaw||0)-dt*1.5);
  const H=G.beHands,pick=()=>H[(e.hi=(e.hi||0)+1)%2];
  if(e.st==='walk'){if(e.stT<=0&&hFree()){const seqs=[['slam','bones','slam','sweep','slam','bones','sweep'],['rake','double','breath','sweep','rain','rake','double'],['stab','tail','double','rake','pits','breath','stab','sweep']];
      const sq=seqs[ph];e.st=sq[(e.si=(e.si||0)+1)%sq.length];e.sub='a';e.stT=.8;
      if(e.st==='slam'){hStart(pick(),'slam',{big:ph>0});e.st='walk';e.stT=ph===0?1.6:1.2}
      else if(e.st==='double'){hStart(H[0],'slam',{off:-50,big:true});hStart(H[1],'slam',{off:50,fast:true,big:true});e.st='walk';e.stT=1.6}
      else if(e.st==='sweep'){hStart(pick(),'sweep');if(ph===2){const o=H.find(h=>!h.act);if(o)setTimeout(()=>{if(o&&!o.act)hStart(o,'sweep',{y:clamp(P.y-150,TOP+90,BOT-30)})},700)}e.st='walk';e.stT=1.8}
      else if(e.st==='rake'){hStart(pick(),'rake');if(ph===2){const o=H.find(h=>!h.act);setTimeout(()=>{if(o&&!o.act)hStart(o,'rake')},600)}e.st='walk';e.stT=1.8}
      else if(e.st==='stab'){hStart(pick(),'stab');e.st='walk';e.stT=2.2}}}
  else if(e.st==='bones'){e.jaw=1;if(e.stT<=0){const m=beMouth(e),n=ph===0?7:9,a0=Math.atan2(P.y-m.y,P.x-m.x);for(let k=0;k<n;k++)shootE(m.x,m.y,a0+(k-(n-1)/2)*.17,170,7,12,'arrow');sfx('chomp',0,e.x);e.st='walk';e.stT=rand(1.2,1.7)}}
  else if(e.st==='breath'){if(e.sub==='a'){e.jaw=1;const m=beMouth(e),a0=Math.atan2(P.y-m.y,P.x-m.x),n=ph===2?4:3;for(let k=0;k<n;k++)beAdd({k:'breath',a:a0+(k-(n-1)/2)*.42,sw:(k%2?1:-1)*.22,len:820,w:30,warn:1,act:1.3});e.sub='b';e.stT=2.4;sfx('incoming',0,e.x)}
    else{e.jaw=1;if(e.stT<=0){e.st='walk';e.stT=rand(1.2,1.6)}}}
  else if(e.st==='rain'){if(e.sub==='a'){const n=ph===2?10:7;for(let i=0;i<n;i++){const x=i===0?P.x:rand(L+30,R-30),y=i===0?P.y:rand(TOP+90,BOT-40);beAdd({k:'fall',x,y,r:26,warn:1.1+i*.12,act:.01})}e.sub='b';e.stT=2;sfx('quake',0,e.x)}
    else if(e.stT<=0){e.st='walk';e.stT=rand(1,1.5)}}
  else if(e.st==='tail'){if(e.sub==='a'){const side=Math.random()<.5?-1:1,y=clamp(P.y,TOP+140,BOT-30);beAdd({k:'tail',side,y,w:44,warn:1.1,act:1});beAdd({k:'tail',side:-side,y:clamp(y+rand(-220,-140),TOP+140,BOT-30),w:44,warn:2.2,act:1});e.sub='b';e.stT=3.4;sfx('creep',2,e.x)}
    else if(e.stT<=0){e.st='walk';e.stT=rand(1,1.4)}}
  else if(e.st==='pits'){if(e.sub==='a'){const pits=(G.beH||[]).filter(h=>h.k==='pit').length;if(pits<10){for(let i=0;i<2;i++){const row=Math.floor((pits+i)/5),x=L+40+((pits+i)%5)*((R-L-80)/4)+rand(-12,12),y=BOT-36-row*72;beAdd({k:'pit',x,y,r:34,warn:1.4,act:1e9})}sfx('quake',0,e.x)}e.sub='b';e.stT=1.6}
    else if(e.stT<=0){e.st='walk';e.stT=rand(1,1.4)}}};
// hazards that are not hands: breath, falling bones, tail, pits
{const _u=update;update=function(dt){_u(dt);const e=beBeast();
  if(G.beCam){if(e)G.cam=beCamNow(e);G.vx=0;G.vy=0}
  if(e&&!(e.intro>0))beHandsUpd(dt);
  if(!G.beH||!G.beH.length)return;if(!e){G.beH=G.beH.filter(h=>h.k==='pit');if(!G.beH.length)return}
  for(let i=G.beH.length-1;i>=0;i--){const h=G.beH[i];if(h.warn>0){h.warn-=dt;if(h.warn<=0)beFire(h);continue}h.t+=dt;
    if(h.k==='breath'&&e){const m=beMouth(e),a=h.a+h.sw*Math.sin(h.t/h.act*Math.PI),dx=Math.cos(a)*h.len,dy=Math.sin(a)*h.len,u=clamp(((P.x-m.x)*dx+(P.y-m.y)*dy)/(dx*dx+dy*dy),0,1);h.cur=a;
      if(beCanHurt()&&Math.hypot(m.x+dx*u-P.x,m.y+dy*u-P.y)<h.w/2+P.r*.4){h.tick=(h.tick||0)-dt;if(h.tick<=0){h.tick=.35;hurtP(Math.round(10*DMG()))}}}
    else if(h.k==='tail'){const u=h.t/h.act,x=h.side<0?L-30+(R-L+60)*u:R+30-(R-L+60)*u;h.x=x;if(!h.hit&&beCanHurt()&&Math.abs(P.y-h.y)<h.w/2+P.r*.5&&Math.abs(P.x-x)<40){h.hit=true;hurtP(Math.round(24*DMG()));P.x=clamp(P.x+(h.side<0?40:-40),L+10,R-10)}
      if(Math.random()<.6)G.fx.push({k:'puff',x,y:h.y+12,vx:rand(-20,20),vy:-10,t:.4,r:rand(4,8)})}
    else if(h.k==='pit'){const dd=Math.hypot(P.x-h.x,(P.y-h.y)*1.4);if(dd<h.r){const a=Math.atan2(P.y-h.y,P.x-h.x)||-Math.PI/2;P.x=clamp(h.x+Math.cos(a)*(h.r+4),L+8,R-8);P.y=clamp(h.y+Math.sin(a)*(h.r+4)/1.4,TOP+8,BOT-8);if(beCanHurt()){hurtP(Math.round(12*DMG()));text(P.x,P.y-40,"L'abisso!",'#c48ae8',13)}}}
    if(h.t>=h.act)G.beH.splice(i,1)}}}
function beFire(h){
  if(h.k==='fall'){shake(4);sfx('rock','urn',h.x);ENV2.chunks(h.x,h.y,10,[BONE,BONES,BONEH],120);ENV2.mark('crater',h.x,h.y,16);if(beCanHurt()&&Math.hypot(P.x-h.x,P.y-h.y)<h.r+P.r*.4)hurtP(Math.round(16*DMG()))}
  else if(h.k==='tail'){sfx('boom',0,h.side<0?L:R);shake(5)}
  else if(h.k==='breath'){sfx('roar',0,AW/2)}
  else if(h.k==='pit'){shake(9);sfx('crumble',1.2,h.x);ENV2.chunks(h.x,h.y,16,[stonePal().hi,stonePal().mid,stonePal().lo],120);
    const c=fx;c.save();c.setTransform(2,0,0,2,0,0);c.fillStyle='#050308';c.beginPath();for(let k=0;k<14;k++){const a=k/14*TAU,q=h.r*(.86+.2*Math.sin(k*2.7+h.x));k?c.lineTo(h.x+Math.cos(a)*q,h.y+Math.sin(a)*q*.7):c.moveTo(h.x+Math.cos(a)*q,h.y+Math.sin(a)*q*.7)}c.closePath();c.fill();
    c.strokeStyle='#1b1612';c.lineWidth=3;c.stroke();c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=1.2;c.stroke();c.restore();
    for(const k of G.rocks)if(!k.temp&&Math.hypot(k.x-h.x,k.y-h.y)<h.r+k.r){k.dmg=99;k.hit=.4}}}
// ---------- drawing ----------
{const _hg=drawHazards2Ground;drawHazards2Ground=function(){_hg();const e=beBeast(),t=G.t||0,col=e?BE.col[bePh(e)]:'190,110,255',blink=.45+.35*Math.sin(t*22);
  // warnings of the hands
  if(G.beHands)for(const h of G.beHands){const a=h.act;if(!a)continue;
    if(a.k==='slam'&&a.warn&&a.tx!=null){const p=clamp(a.t/1.15,0,1);ctx.strokeStyle=`rgba(229,72,77,${.55+.3*blink})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(a.tx,a.ty,56,56*.62,0,0,TAU);ctx.stroke();ctx.fillStyle=`rgba(229,72,77,${.1+p*.25})`;ctx.beginPath();ctx.ellipse(a.tx,a.ty,56*p,56*.62*p,0,0,TAU);ctx.fill()}
    else if(a.k==='sweep'&&a.warn&&a.y!=null){ctx.fillStyle=`rgba(229,72,77,${.1+.1*blink})`;ctx.fillRect(L,a.y-30,R-L,60);ctx.strokeStyle='rgba(229,72,77,.7)';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.strokeRect(L,a.y-30,R-L,60);ctx.setLineDash([]);
      ctx.fillStyle='rgba(229,72,77,.85)';const dir=h.side<0?1:-1;for(let k=0;k<4;k++){const xx=(h.side<0?L+30:R-30)+dir*(k*18+((t*70)%18));ctx.beginPath();ctx.moveTo(xx,a.y-10);ctx.lineTo(xx+dir*12,a.y);ctx.lineTo(xx,a.y+10);ctx.fill()}}
    else if(a.k==='rake'&&a.warn&&a.x!=null){ctx.strokeStyle=`rgba(229,72,77,${.5+.35*blink})`;ctx.lineWidth=3;ctx.setLineDash([9,7]);for(const o of [-24,-8,8,24]){ctx.beginPath();ctx.moveTo(a.x+o,TOP+100);ctx.lineTo(a.x+o,BOT);ctx.stroke()}ctx.setLineDash([]);ctx.fillStyle=`rgba(229,72,77,${.06+.05*blink})`;ctx.fillRect(a.x-32,TOP+100,64,BOT-TOP-100)}
    else if(a.k==='stab'&&a.pts){for(let i=(a.cur||0);i<a.pts.length;i++){const p=a.pts[i];ctx.strokeStyle=`rgba(229,72,77,${.4+.3*blink})`;ctx.lineWidth=2.5;circ(p.x,p.y,24);ctx.stroke()}}}
  if(G.beHands)for(const h of G.beHands)beDrawHandShadow(h);
  if(!G.beH)return;
  for(const h of G.beH){const warn=h.warn>0;
    if(h.k==='fall'&&warn){const p=1-h.warn/1.3;ctx.strokeStyle=`rgba(229,72,77,${.5+.3*blink})`;ctx.lineWidth=2.5;circ(h.x,h.y,h.r);ctx.stroke();ctx.fillStyle=`rgba(229,72,77,${.08+p*.25})`;circ(h.x,h.y,h.r*clamp(p,0,1));ctx.fill()}
    else if(h.k==='tail'&&warn){ctx.fillStyle=`rgba(229,72,77,${.1+.1*blink})`;ctx.fillRect(L,h.y-h.w/2,R-L,h.w);ctx.strokeStyle='rgba(229,72,77,.7)';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.strokeRect(L,h.y-h.w/2,R-L,h.w);ctx.setLineDash([])}
    else if(h.k==='breath'&&warn&&e){const m=beMouth(e);ctx.save();ctx.translate(m.x,m.y);ctx.rotate(h.a);ctx.fillStyle=`rgba(${col},${.1+.08*blink})`;ctx.fillRect(0,-h.w/2,h.len,h.w);ctx.strokeStyle=`rgba(${col},.6)`;ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.strokeRect(0,-h.w/2,h.len,h.w);ctx.setLineDash([]);ctx.restore()}
    else if(h.k==='pit'){if(warn){ctx.strokeStyle=`rgba(229,72,77,${.5+.3*blink})`;ctx.lineWidth=2.5;ctx.setLineDash([6,5]);ell(h.x,h.y,h.r,h.r*.7);ctx.stroke();ctx.setLineDash([])}
      else{ctx.save();ctx.globalCompositeOperation='lighter';glow('150,80,220',h.x,h.y+4,h.r*.9,.22+.08*Math.sin(t*2+h.x),h.r*.5);ctx.restore()}}}}}
{const _ha=drawHazards2Air;drawHazards2Air=function(){_ha();const e=beBeast(),t=G.t||0,col=e?BE.col[bePh(e)]:'190,110,255';
  // the ribs dropping into the abyss during the entrance
  if(G.beRibs)for(const r of G.beRibs){const k=clamp(((G.beRibT||0)-r.t0)/.65,0,1);if(k>=1)continue;const ox=r.sd<0?0:AW,out=r.sd*k*90,dn=k*k*160;ctx.save();ctx.globalAlpha=1-k;ctx.translate(out,dn);
    const pts=[];for(let u=0;u<=1.001;u+=.1){const ax=r.x0,ay=r.y,cx=ox+r.sd*58,cy=r.y-16,bx=ox+r.sd*62,by=r.y+56;pts.push([(1-u)*(1-u)*ax+2*(1-u)*u*cx+u*u*bx,(1-u)*(1-u)*ay+2*(1-u)*u*cy+u*u*by])}ctx.translate(r.x0,r.y);ctx.rotate(r.sd*k*.9);ctx.translate(-r.x0,-r.y);beBone(pts,14);ctx.restore()}
  if(G.beHands)for(const h of G.beHands)beDrawHand(h);
  if(!G.beH)return;
  for(const h of G.beH){
    if(h.k==='fall'&&h.warn>0){const p=1-h.warn/1.3,yy=h.y-(1-clamp(p,0,1))*320;if(p>.3){ink(2.2);circ(h.x,yy-10,8);fs('#e0d9c4');ctx.fillStyle=INK;circ(h.x-3,yy-10,2);ctx.fill();circ(h.x+3,yy-10,2);ctx.fill()}}
    else if(h.k==='tail'&&h.warn<=0&&h.x!=null){for(let k=0;k<7;k++){const x=h.x+h.side*k*26,y=h.y+Math.sin(t*12+k)*4;if(x<L-40||x>R+40)continue;ink(2.6);ctx.beginPath();ctx.ellipse(x,y,15-k,11-k*.6,0,0,TAU);fs(BONE);ctx.beginPath();ctx.moveTo(x-5,y-8);ctx.lineTo(x,y-22+k);ctx.lineTo(x+5,y-8);ctx.closePath();fs(BONE);ctx.fillStyle='rgba(127,123,88,.8)';ell(x,y+4,9-k*.5,3);ctx.fill()}}
    else if(h.k==='breath'&&h.warn<=0&&e){const m=beMouth(e),a=h.cur!=null?h.cur:h.a;ctx.save();ctx.translate(m.x,m.y);ctx.rotate(a);ctx.globalCompositeOperation='lighter';
      for(let s=10;s<h.len;s+=18){const w=h.w*(.5+s/h.len*.7);glow(col,s,Math.sin(t*20+s*.05)*4,w*.8,.5*(1-s/h.len*.6),w*.55)}ctx.restore()}}}}
// the skull: rises out of the dark behind the wall, smashes the gate, then stays with its jaw in the broken doorway
function beSkull(e){const it=e.intro>0?(e.iT||0):99,F=TOP-26;let cy=F,sc=1,vis=1,eye=1,jaw=null;
  if(it<2.8){vis=0}else if(it<4){const k=ease((it-2.8)/1.2);cy=lerp(F-250,F-24,k);sc=lerp(.72,1,k);vis=Math.min(1,k*1.6);eye=clamp((it-3.4)/.5,0,1)}
  else if(it<4.3){cy=lerp(F-24,F-62,ease((it-4)/.3))}else if(it<4.42){cy=lerp(F-62,F+10,(it-4.3)/.12)}else if(it<4.9){cy=lerp(F+10,F,ease((it-4.42)/.48))}
  if(it>=4.9&&it<6.2)jaw=it>5&&it<6?1:0;return{cy:cy+(it>=99?Math.sin((G.t||0)*1.1)*1.5:0),sc,vis,eye,jaw}}
EDRAW.beast=e=>{const t=G.t||0,x=e.x,ph=bePh(e),col=BE.col[ph],S=beSkull(e);if(S.vis<=0)return;
  const jaw=S.jaw!=null?S.jaw:(e.jaw||0)*.9+.08+.04*Math.sin(t*1.4),cy=S.cy,K=INK,dmg=1-e.hp/e.max;
  ctx.save();ctx.globalAlpha*=S.vis;ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x,TOP+14,150*S.sc,24,0,0,TAU);ctx.fill();
  ctx.translate(x,cy);ctx.scale(S.sc,S.sc);ctx.lineJoin='round';ctx.lineCap='round';
  for(const sd of [-1,1]){const p=()=>{ctx.beginPath();ctx.moveTo(sd*92,-16);ctx.bezierCurveTo(sd*140,-22,sd*176,-30,sd*186,-82)};p();ctx.strokeStyle=K;ctx.lineWidth=26;ctx.stroke();p();ctx.strokeStyle=BONES;ctx.lineWidth=19;ctx.stroke();ctx.save();ctx.translate(-sd*2,-3);p();ctx.strokeStyle=BONE;ctx.lineWidth=9;ctx.stroke();ctx.restore()}
  ctx.save();ctx.translate(0,30+jaw*30);ctx.beginPath();ctx.moveTo(-84,-26);ctx.quadraticCurveTo(-90,30,-40,48);ctx.lineTo(40,48);ctx.quadraticCurveTo(90,30,84,-26);ctx.closePath();ctx.fillStyle=BONES;ctx.fill();ctx.strokeStyle=K;ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle=BONE;ctx.beginPath();ctx.moveTo(-76,-20);ctx.quadraticCurveTo(-80,24,-38,40);ctx.lineTo(38,40);ctx.quadraticCurveTo(80,24,76,-20);ctx.closePath();ctx.fill();
  ctx.fillStyle='#efe6c8';ctx.strokeStyle=K;ctx.lineWidth=2;for(let i=0;i<9;i++){const tx=-58+i*14.5,h=10+(i%2)*5;ctx.beginPath();ctx.moveTo(tx-6,-22);ctx.lineTo(tx,-22-h);ctx.lineTo(tx+6,-22);ctx.closePath();ctx.fill();ctx.stroke()}ctx.restore();
  if(jaw>.15){ctx.fillStyle='#08040c';ctx.beginPath();ctx.ellipse(0,40,70,8+jaw*26,0,0,TAU);ctx.fill();ctx.save();ctx.globalCompositeOperation='lighter';glow(col,0,44,60,.45*jaw,26);ctx.restore()}
  ctx.beginPath();ctx.ellipse(0,0,124,74,0,0,TAU);{const g=ctx.createRadialGradient(-30,-40,10,0,0,140);g.addColorStop(0,'#e9e2c4');g.addColorStop(.55,BONE);g.addColorStop(1,'#8f8a66');ctx.fillStyle=g}ctx.fill();ctx.strokeStyle=K;ctx.lineWidth=4.5;ctx.stroke();
  ctx.save();ctx.beginPath();ctx.ellipse(0,0,124,74,0,0,TAU);ctx.clip();ctx.beginPath();ctx.ellipse(0,30,130,52,0,0,TAU);ctx.fillStyle='rgba(60,56,38,.45)';ctx.fill();
  ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${col},.22)`;ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(0,4,120,70,0,Math.PI*.15,Math.PI*.85);ctx.stroke();ctx.restore();
  ctx.beginPath();ctx.ellipse(-34,-42,48,14,-.15,Math.PI*1.05,Math.PI*1.85);ctx.strokeStyle=BONEH;ctx.lineWidth=7;ctx.stroke();
  ctx.fillStyle='#efe6c8';ctx.strokeStyle=K;ctx.lineWidth=2;for(let i=0;i<10;i++){const tx=-63+i*14,h=12+(i%3===1?6:0);ctx.beginPath();ctx.moveTo(tx-6,56);ctx.lineTo(tx,56+h);ctx.lineTo(tx+6,56);ctx.closePath();ctx.fill();ctx.stroke()}
  const cracks=[[[20,-72],[28,-54],[20,-44],[34,-30]],[[-62,-52],[-48,-44],[-52,-30]],[[70,-40],[60,-26],[72,-12],[64,0]],[[-90,-10],[-76,0],[-84,14]],[[0,-74],[-6,-60],[4,-50]]];
  // the forehead that broke the gate is cracked from the start
  cracks.forEach((c,i)=>{if(i>0&&dmg<i*.17)return;ctx.beginPath();c.forEach(([a,b],j)=>j?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.strokeStyle=K;ctx.lineWidth=2.6;ctx.stroke();if(ph>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${col},.75)`;ctx.lineWidth=1.4;ctx.stroke();ctx.restore()}});
  for(const sd of [-1,1]){ctx.beginPath();ctx.ellipse(sd*52,-18,32,25,sd*.25,0,TAU);ctx.fillStyle=K;ctx.fill();ctx.beginPath();ctx.moveTo(sd*18,-42);ctx.quadraticCurveTo(sd*52,-58-(ph===2?6:0),sd*88,-34);ctx.strokeStyle=K;ctx.lineWidth=10;ctx.stroke();ctx.strokeStyle=BONE;ctx.lineWidth=5.5;ctx.stroke()}
  ctx.fillStyle=K;ctx.beginPath();ctx.moveTo(0,22);ctx.lineTo(-12,42);ctx.lineTo(12,42);ctx.closePath();ctx.fill();
  if(S.eye>0){const lx=clamp((P.x-x)/120,-1,1)*6,ly=clamp((P.y-cy)/300,-1,1)*4;ctx.save();ctx.globalCompositeOperation='lighter';
    for(const sd of [-1,1]){const ex=sd*52+lx,ey=-16+ly,a=S.eye*(.9+.1*Math.sin(t*2));glow(col,ex,ey,34,a*.7,26);glow(col,ex,ey,16,a);glow('255,255,255',ex,ey,6,a*.9)}ctx.restore()}
  ctx.restore()};
ESHADOW.beast=()=>{};ELIGHT.beast=(e,Lt)=>{Lt(e.x,e.y-20,190,.75);for(const h of G.beHands||[])if(h.vis)Lt(h.x,h.y-h.z,90,.5)};
// ---------- the entrance ----------
const CAM_WIDE={z:.5,x:()=>AW/2,y:()=>AH/2-80},CAM_MID={z:.66,x:()=>AW/2,y:()=>TOP+170},CAM_FIGHT={z:.74,x:()=>AW/2,y:()=>AH/2-45};
const camOf=(c)=>({z:c.z,x:c.x(),y:c.y()}),camMix=(a,b,k)=>({z:lerp(a.z,b.z,k),x:lerp(a.x,b.x,k),y:lerp(a.y,b.y,k)});
function beCamNow(e){const it=e.intro>0?(e.iT||0):99;if(it<1.4)return camOf(CAM_WIDE);if(it<2.6)return camMix(camOf(CAM_WIDE),camOf(CAM_MID),ease((it-1.4)/1.2));if(it<4.7)return camOf(CAM_MID);if(it<5.9)return camMix(camOf(CAM_MID),camOf(CAM_FIGHT),ease((it-4.7)/1.2));return camOf(CAM_FIGHT)}
function beRebake(noRibs,noSkull){G.bdNoRibs=noRibs;G.bdNoSkull=noSkull;bdKey='';bakeBackdrop()}
function beHandIntro(h,t,t0){// rises out of the dark behind the wall and slams down on it
  const r=HREST(h.side),k=clamp((t-t0)/.5,0,1);h.vis=Math.min(1,k*2);h.x=r.x+(1-k)*h.side*40;h.y=lerp(-260,r.y,k*k);h.z=(1-k)*120;h.ang=Math.PI/2;h.spread=lerp(1.8,1,k);h.curl=lerp(0,.25,k)}
{const _bi3=bossIntro3;bossIntro3=function(e,t,t0,at,roar){if(e.type!=='beast')return _bi3(e,t,t0,at,roar);
  if(t0===0){sfx('quake',0,e.x);beHandsInit();G.beRibT=0}
  G.beRibT=t-.5;if(t<1.4)G.shake=Math.max(G.shake,t<.4?3:6);if(t<2.6&&Math.random()<.4)fallingPebbles(1);
  if(at(.25)){sfx('creep',0,e.x);sfx('quake',0,e.x)}
  if(at(.5)){// the ribs come loose and drop into the abyss
    G.beRibs=[];for(let y=TOP+20;y<AH-30;y+=104)for(const sd of [-1,1])G.beRibs.push({x0:sd<0?6:AW-6,y,sd,t0:rand(0,.35)});beRebake(true,false);sfx('crumble',1.2,AW/2);
    for(const r of G.beRibs)ENV2.chunks(r.sd<0?L:R,r.y,4,[BONE,BONES],80)}
  if(at(1.3)){G.beRibs=null}
  if(G.beHands){if(t>=1.5)beHandIntro(G.beHands[0],t,1.5);if(t>=2.05)beHandIntro(G.beHands[1],t,2.05)}
  for(const[tt,s] of [[2,-1],[2.55,1]])if(at(tt)){shake(11);sfx('boom',0,AW/2+s*178);ENV2.chunks(AW/2+s*178,TOP-4,14,[stonePal().hi,stonePal().mid,BONE],140);ENV2.fall(6)}
  if(at(2.8)){beRebake(true,true);sfx('creep',2,e.x)}
  if(at(3.4))sfx('shimmer',2,e.x);
  if(at(4.0))sfx('incoming',0,e.x);
  if(at(4.42)){// the head smashes the gate
    G.gateBroken=true;shake(22);G.hitstop=Math.max(G.hitstop||0,.16);sfx('boom',0,AW/2);setTimeout(()=>sfx('boom',0,AW/2),80);sfx('crumble',1.4,AW/2);vib([120,40,200]);
    fxPush({k:'flash',x:AW/2,y:TOP,r:260,rgb:'255,245,220',t:.25,max:.25});vfxBlast(AW/2,TOP+6,'230,215,190',150,{debris:['#6b6f78','#4a4f58',stonePal().mid,stonePal().hi],n:40,dust:30,sparks:20,spcol:['#ffffff','#c9cfd6']});
    for(let i=0;i<12;i++){const a=rand(.2,Math.PI-.2),s=rand(120,280);G.debris.push({x:AW/2+rand(-20,20),y:TOP+4,z:20,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.7,vz:rand(120,240),col:'#6b6f78',s:rand(2.4,4),rot:rand(0,TAU),vr:rand(-10,10),life:3})}
    // the bars and stones of the gate lie on the floor
    const c=fx;c.save();c.setTransform(2,0,0,2,0,0);c.lineCap='round';for(let i=0;i<6;i++){const x=AW/2+rand(-70,70),y=TOP+rand(14,80),a=rand(0,Math.PI),l=rand(16,30);c.strokeStyle='#1b1612';c.lineWidth=5;c.beginPath();c.moveTo(x-Math.cos(a)*l/2,y-Math.sin(a)*l/2);c.quadraticCurveTo(x+rand(-5,5),y+rand(-5,5),x+Math.cos(a)*l/2,y+Math.sin(a)*l/2);c.stroke();c.strokeStyle='#6b6f78';c.lineWidth=2.6;c.stroke()}c.restore();
    stamp('cracks',AW/2,TOP+20,70)}
  if(at(5.0)){roar();sfx('roar',0,e.x);ENV2.fall(12)}
  return true}}
// the broken gate: a dark hole with jagged stones; once the beast falls, the way is open
{const _w=drawWallBack;drawWallBack=function(){_w();if(!G.gateBroken)return;const dx=AW/2,t=G.t||0;ctx.save();doorPath();ctx.clip();ctx.fillStyle='#07050a';ctx.fillRect(dx-DOORW-4,-10,DOORW*2+8,TOP+14);
    if(G.door){const g=ctx.createRadialGradient(dx,10,2,dx,10,40);g.addColorStop(0,'rgba(255,201,60,.4)');g.addColorStop(1,'rgba(255,201,60,0)');ctx.fillStyle=g;ctx.fillRect(dx-DOORW,0,DOORW*2,TOP)}ctx.restore();
  ink(2.2);for(const[x,y,s] of [[-DOORW-6,TOP-6,9],[DOORW+5,TOP-4,8],[-DOORW+4,TOP-1,6],[DOORW-6,TOP,6],[-10,TOP+2,5],[12,TOP+3,6]]){ctx.beginPath();ctx.moveTo(dx+x-s,y+s*.4);ctx.lineTo(dx+x-s*.5,y-s*.7);ctx.lineTo(dx+x+s*.6,y-s*.5);ctx.lineTo(dx+x+s,y+s*.4);ctx.closePath();fs(stonePal().mid)}
  if(G.door){ctx.fillStyle='#ffc93c';const by=TOP+24+Math.sin(t*6)*4;ctx.beginPath();ctx.moveTo(dx,by-12);ctx.lineTo(dx+11,by);ctx.lineTo(dx+4,by);ctx.lineTo(dx+4,by+10);ctx.lineTo(dx-4,by+10);ctx.lineTo(dx-4,by);ctx.lineTo(dx-11,by);ctx.closePath();ink(2.5);ctx.fill();ctx.stroke()}}}
{const _de=drawBeastEyes;drawBeastEyes=function(){if(G.bdNoSkull||beBeast())return;_de()}}
BLOCK.beast=()=>false;
function startBeast(){G.event=null;G.chapter=G.chapter||1;G.gateBroken=false;G.bdNoRibs=false;G.bdNoSkull=false;G.beRibs=null;G.beHands=null;bdKey='';
  const sb=SAVE.set&&SAVE.set.big;if(SAVE.set)SAVE.set.big=true;buildRoom();if(SAVE.set)SAVE.set.big=sb;
  G.enemies=[];G.beH=[];G.rocks=G.rocks.filter(k=>k.y>TOP+220&&Math.abs(k.x-AW/2)>110);fields={};
  const e=makeE('beast',AW/2,TOP+34,0);G.enemies.push(e);G.beCam=true;bossBarReset();$('bossBar').hidden=false;$('bossBar').classList.remove('rage');$('bossName').textContent=ET.beast.name;
  setTimeout(()=>banner(ET.beast.name,ET.beast.title,2.6),5200);
  G.bannerT=0;bannerEl.classList.remove('show');P.x=AW/2;P.y=BOT-70;G.cam=beCamNow(e);G.vx=0;G.vy=0;playMusic('golem');return e}
// leaving the room: the camera goes back to normal
{const _b=buildRoom;buildRoom=function(){G.beCam=false;G.cam=null;G.gateBroken=false;G.beHands=null;G.beRibs=null;if(G.bdNoRibs||G.bdNoSkull){G.bdNoRibs=G.bdNoSkull=false;bdKey=''}return _b.apply(this,arguments)}}
