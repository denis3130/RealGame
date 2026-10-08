// ===================== EPICO: pavimento vivo nelle fughe + battaglie con più impatto (anteprima) =====================
window.SEAMS=true;window.EPIC=true;
// ---------- floor: life grows in the joints between the slabs and inside their cracks ----------
const SEAMPAL={
  moss:{ink:'rgba(14,18,8,.6)',dk:'#2e5220',md:'#4a842c',lt:'#8cc450',fl:['#f2d36b','#f6ead2','#e8a0d0']},
  teal:{ink:'rgba(10,20,20,.55)',dk:'#24504a',md:'#3f8a7e',lt:'#8fe0cc',fl:['#bff6ff','#e8fbff']},
  swamp:{ink:'rgba(12,14,4,.7)',dk:'#3a4a18',md:'#62781e',lt:'#a8c040',fl:['#f0e070','#ffffff']},
  ash:{ink:'rgba(8,5,4,.7)',dk:'#1c1411',md:'#3a2b24',lt:'#6a5246',fl:[]},
  ice:{ink:'rgba(40,60,90,.35)',dk:'#e2eef8',md:'#f6fbff',lt:'#ffffff',fl:[]}};
function seamKind(th){return LAVAZ.includes(th)?'ash':isIce(th)?'ice':isSwamp(th)?'swamp':th==='cristalli'?'teal':'moss'}
function seamLife(){
  if(!window.SEAMS||!G.slabs)return;const th=themeOf(G.room),kind=seamKind(th),C=SEAMPAL[kind],c=fx;c.save();c.setTransform(2,0,0,2,0,0);
  // where things grow: corners, along the walls, around the obstacles and a few patches in the open
  const Z=[];for(const [x,y] of [[L,TOP],[R,TOP],[L,BOT],[R,BOT]])if(Math.random()<.8)Z.push({x,y,r:rand(90,150)});
  for(let i=0;i<6;i++){const left=Math.random()<.5;Z.push({x:left?L:R,y:rand(TOP+60,BOT-60),r:rand(70,120)})}
  for(let i=0;i<3;i++)Z.push({x:rand(L+60,R-60),y:rand(TOP+80,BOT-80),r:rand(50,85)});
  for(const k of G.rocks)if(!k.temp&&Math.random()<.75)Z.push({x:k.x,y:k.y,r:k.r+rand(30,60)});
  const nz=(x,y)=>.5+.25*Math.sin(x*.09+y*.05)+.25*Math.sin(x*.031-y*.077+1.7);
  const n2=(x,y)=>{const a=.5+.5*Math.sin(x*.23+y*.19+Math.sin(x*.061-y*.043)*3.1);return clamp((a-.28)/.5,0,1)};
  const I0=(x,y)=>{let v=0;for(const z of Z){const d=Math.hypot(x-z.x,y-z.y);if(d<z.r)v=Math.max(v,1-d/z.r)}return clamp(v*(.55+.7*nz(x,y)),0,1)};
  const I=(x,y)=>I0(x,y)*(.25+.75*n2(x,y));
  const wet=(x,y)=>(G.puddles||[]).some(p=>Math.abs(p.x-x)<p.rx+4&&Math.abs(p.y-y)<p.ry+4)||G.rocks.some(k=>!k.temp&&Math.hypot(k.x-x,k.y-y)<k.r*.7);
  // the joints: top and left edge of every slab (the others are shared with the neighbours)
  const segs=[];for(const [x,y,w,h] of G.slabs){if(y>TOP+1)segs.push([x,y,Math.min(x+w,R),y]);if(x>L+1)segs.push([x,y,x,Math.min(y+h,BOT)])}
  const pts=[];for(const [x1,y1,x2,y2] of segs){const len=Math.hypot(x2-x1,y2-y1),n=Math.ceil(len/2.5);for(let i=0;i<=n;i++){const x=x1+(x2-x1)*i/n,y=y1+(y2-y1)*i/n,v=I(x,y);if(v>.18&&!wet(x,y))pts.push([x,y,v,x1===x2])}}
  const cpts=[];for(const p of G.slabCracks||[])for(let k=1;k<p.length;k++){const [a,b]=[p[k-1],p[k]],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2.5);for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,y=a[1]+(b[1]-a[1])*i/n,v=I(x,y);if(v>.3&&!wet(x,y))cpts.push([x,y,v*.7])}}
  const blob=(x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,r,r*.8,0,0,TAU);c.fill()};
  const all=pts.concat(cpts);
  if(kind==='ash'){
    // soot packed in the joints, embers glowing where it is thickest
    for(const [x,y,v] of all)blob(x+rand(-.6,.6),y+rand(-.6,.6),1+v*3.4,C.ink);
    for(const [x,y,v] of all)if(Math.random()<.6)blob(x+rand(-1,1),y+rand(-1,1),.6+v*1.4,Math.random()<.5?C.md:C.lt);
    c.save();c.globalCompositeOperation='lighter';for(const [x,y,v] of all)if(v>.5&&Math.random()<.55){c.shadowColor='#ff6a1a';c.shadowBlur=5;blob(x,y,.5+v*.8,`rgba(255,${(110+v*90)|0},40,${.35+v*.4})`)}c.restore();
    // a few joints keep breathing with light
    const hot=pts.filter(p=>p[2]>.62);G.floorCracks=G.floorCracks||[];for(let i=0;i<Math.min(4,hot.length);i++){const p=pk(hot);const vert=p[3],ln=[];for(let k=-3;k<=3;k++)ln.push(vert?[p[0],p[1]+k*5]:[p[0]+k*5,p[1]]);G.floorCracks.push({pts:ln,rgb:'255,120,40',ph:rand(0,9)})}
  }else if(kind==='ice'){
    // snow packed into the joints and frost feathers creeping onto the slabs
    for(const [x,y,v] of all)blob(x+.8,y+1.4,1.4+v*3.8,'rgba(60,90,135,.38)');
    for(const [x,y,v] of all)blob(x,y,1+v*3.2,v>.5?C.md:C.dk);
    for(const [x,y,v] of all)if(v>.35&&Math.random()<.3)blob(x-.5,y-.8,.6+v*1.8,C.lt);
    c.strokeStyle='rgba(235,248,255,.55)';c.lineWidth=.8;c.lineCap='round';
    for(const [x,y,v,vert] of pts)if(v>.45&&Math.random()<.07){let a=vert?(Math.random()<.5?0:Math.PI):(Math.random()<.5?Math.PI/2:-Math.PI/2),px=x,py=y;const len=4+v*12;
      for(let s=0;s<3;s++){const nx=px+Math.cos(a)*len/3,ny=py+Math.sin(a)*len/3;c.beginPath();c.moveTo(px,py);c.lineTo(nx,ny);for(const sd of [-1,1]){c.moveTo(px+(nx-px)*.5,py+(ny-py)*.5);c.lineTo(px+(nx-px)*.5+Math.cos(a+sd*.8)*len*.18,py+(ny-py)*.5+Math.sin(a+sd*.8)*len*.18)}c.stroke();px=nx;py=ny;a+=rand(-.3,.3)}}
  }else{
    // moss: a dark bed sunk in the joint, the green cushion on top, lit tips and little spills onto the slab edges
    for(const [x,y,v] of all)blob(x+.5,y+1,1.2+v*4,C.ink);
    if(kind==='swamp')for(const [x,y,v] of pts)if(v>.4&&Math.random()<.25)blob(x,y,1.4+v*2,'rgba(30,40,20,.55)');
    for(const [x,y,v] of all)blob(x+rand(-.7,.7),y+rand(-.7,.7),.9+v*3.4,v>.5?C.md:C.dk);
    for(const [x,y,v] of all)if(v>.3&&Math.random()<.22)blob(x+rand(-1.2,.6),y-v*1.6+rand(-.6,.2),.5+v*1.6,v>.55?C.lt:C.md);
    for(const [x,y,v,vert] of pts)if(v>.55&&Math.random()<.06){const o=rand(2,4+v*4),sx=vert?(Math.random()<.5?-o:o):rand(-2,2),sy=vert?rand(-2,2):(Math.random()<.5?-o:o);blob(x+sx,y+sy,1+v*1.6,C.dk);blob(x+sx-.4,y+sy-.5,.6+v,C.md)}
    if(kind==='swamp'){c.fillStyle='rgba(220,240,180,.35)';for(const [x,y,v] of pts)if(v>.5&&Math.random()<.04){c.fillRect(x-1.5,y-.5,3,1)}}
  }
  // junctions: where four slabs meet the plants push up the most
  const J=[];for(const [x,y] of G.slabs){if(x<=L+1||y<=TOP+1)continue;const v=I(x,y);if(v>.5&&!wet(x,y))J.push({x,y,v})}
  G.seamJ=J;
  if(kind!=='ash'&&kind!=='ice')for(const j of J){if(Math.random()<.55)grassTuft(c,j.x,j.y+1,[C.md,C.lt,C.dk],.7+j.v*.6);
    if(C.fl.length&&j.v>.72&&Math.random()<.35)for(let k=0;k<4;k++){const a=k*1.57+rand(-.3,.3),fx0=j.x+Math.cos(a)*3.2,fy0=j.y-2+Math.sin(a)*2.2;c.fillStyle=pk(C.fl);c.beginPath();c.arc(fx0,fy0,1.3,0,TAU);c.fill()}}
  if(kind==='teal')for(const j of J)if(j.v>.6&&Math.random()<.5){for(let k=0;k<3;k++){const a=-Math.PI/2+(k-1)*.55,h=4+j.v*6*(k===1?1.3:1);c.save();c.translate(j.x+(k-1)*2,j.y);c.rotate(a+Math.PI/2);c.fillStyle='#bff2ff';c.strokeStyle='#1b2a30';c.lineWidth=.9;c.beginPath();c.moveTo(-1.6,0);c.lineTo(0,-h);c.lineTo(1.6,0);c.closePath();c.fill();c.stroke();c.restore()}}
  if(kind==='ice')for(const j of J)if(j.v>.65&&Math.random()<.4){c.fillStyle='rgba(255,255,255,.9)';c.beginPath();c.ellipse(j.x,j.y,3+j.v*3,1.6+j.v*1.4,0,0,TAU);c.fill()}
  c.restore()}
{const _rf=renderFloor;renderFloor=function(){
  // same floor for the same room, so Prima/Dopo compares the same slabs
  const key=(G.room||0)+'|'+(G.si||0)+'|'+(G.chapter||1);if(G._fsKey!==key){G._fsKey=key;G._fs=(Math.random()*1e9)|0}
  const mr=Math.random;let s=G._fs||1;Math.random=()=>((s=Math.imul(s^(s>>>15),2246822519)+0x9e3779b9|0)>>>0)/4294967296;
  try{_rf.apply(this,arguments);seamLife()}finally{Math.random=mr}}}
// the swaying tufts now only grow out of the joints
{const _mt=makeTufts;makeTufts=function(){if(!window.SEAMS)return _mt();G.tufts=[];const th=themeOf(G.room),C=TUFT[th];if(!C||LOWFX||!G.seamJ)return;
  for(const j of G.seamJ.slice().sort((a,b)=>b.v-a.v)){if(G.tufts.length>=12)break;if(G.tufts.some(t=>Math.hypot(t.x-j.x,t.y-j.y)<30))continue;if(G.rocks.some(k=>Math.hypot(k.x-j.x,k.y-j.y)<k.r+10))continue;G.tufts.push({x:j.x+rand(-2,2),y:j.y+1,n:randi(4,7),h:rand(7,11),ph:rand(0,TAU),b:0,c:C})}}}

// ---------- battles: a little more weight on every hit and kill ----------
const efx=f=>{if(!window.EPIC)return;if(!G.efx)G.efx=[];if(G.efx.length<160)G.efx.push(f)};
{const _a=arrow;arrow=function(x,y,a,m){_a(x,y,a,m);if(!window.EPIC)return;efx({k:'muzzle',x:x+Math.cos(a)*6,y:y+Math.sin(a)*6,a,t:0,max:.12,rgb:P.fire?'255,150,60':P.ice?'150,220,255':'255,236,180'})}}
{const _h=hurtE;hurtE=function(e,dmg,crit,dot){const was=e.dead;_h(e,dmg,crit,dot);if(!window.EPIC||dot||was||e.intro>0||e.hidden)return;
  const a=Math.atan2(e.y-P.y,e.x-P.x);efx({k:'hit',x:e.x-Math.cos(a)*e.r*.6,y:e.y-e.r*.7-(e.z||0),a,t:0,max:crit?.22:.14,crit,rgb:crit?'255,210,90':'255,255,255'});}}
{const _k=killE;killE=function(e,noLoot){const was=e.dead;_k(e,noLoot);if(!window.EPIC||was||noLoot)return;
  const col=(ECOL[e.type]||'#ffffff'),boss=isBoss(e.type),big=e.elite||boss;
  efx({k:'ring',x:e.x,y:e.y-(e.z||0),t:0,max:big?.6:.38,r:e.r*(big?4.2:2.6),rgb:big?'255,215,120':'255,245,225'});
  efx({k:'flash',x:e.x,y:e.y-e.r*.6-(e.z||0),t:0,max:big?.35:.2,r:e.r*(big?5:3),rgb:big?'255,200,110':'255,240,210'});
  if(!LOWFX)for(let i=0;i<(big?14:7);i++){const an=rand(0,TAU),sp=rand(140,big?420:300);efx({k:'spark',x:e.x,y:e.y-e.r*.6-(e.z||0),vx:Math.cos(an)*sp,vy:Math.sin(an)*sp*.7-60,t:0,max:rand(.25,.45),rgb:big?'255,215,120':'255,240,200'})}
  G.pz=Math.max(G.pz||0,big?.055:.018);if(e.elite&&!boss){G.hitstop=Math.max(G.hitstop||0,.09);shake(3)}
  // the last enemy of a room goes down in slow motion
  if(!boss&&!G.event&&G.enemies&&!G.enemies.some(o=>!o.dead&&o!==e&&!o.ally)){G.slowT=Math.max(G.slowT||0,.75);G.pz=Math.max(G.pz,.07);efx({k:'ring',x:e.x,y:e.y,t:0,max:.8,r:150,rgb:'255,220,140',w:5})}}}
{const _d=dash;dash=function(){const before=P.dashCd;_d();if(window.EPIC&&P.dashT>0&&before<=0)G.dashTrail=.2}}
{const _u=update;update=function(dt){_u(dt);if(!G)return;G.pz=(G.pz||0)*Math.pow(.003,dt);if(G.pz<.0005)G.pz=0;
  if(G.efx)for(let i=G.efx.length-1;i>=0;i--){const f=G.efx[i];f.t+=dt;if(f.k==='spark'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=520*dt;f.vx*=Math.pow(.05,dt)}if(f.t>=f.max)G.efx.splice(i,1)}
  if(window.EPIC&&P&&P.dashT>0&&G.dashTrail>0&&!LOWFX)efx({k:'ghost',x:P.x,y:P.y,t:0,max:.28,a:Math.atan2(P.dvy||0,P.dvx||1)})}}
function epicDraw(){if(!G.efx||!G.efx.length)return;
  const cw=cv.width,ch=cv.height,s=Math.min(cw/VW,ch/VH),ox=(cw-VW*s)/2,oy=Math.max(0,(ch-VH*s)/2),z=1+(G.pz||0),vx=G.vx||0,vy=G.vy||0;
  if(G.cam||G.state==='dead')return;
  ctx.save();ctx.setTransform(s*z,0,0,s*z,ox+s*VW/2*(1-z),oy+s*VH/2*(1-z));ctx.translate(-vx,-vy);ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  for(const f of G.efx){const q=f.t/f.max,k=1-q;
    if(f.k==='muzzle'){glow(f.rgb,f.x,f.y,10+8*k,.7*k);ctx.strokeStyle=`rgba(${f.rgb},${.8*k})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+Math.cos(f.a)*14*k,f.y+Math.sin(f.a)*14*k);ctx.stroke()}
    else if(f.k==='hit'){const r=(f.crit?16:10)*(.6+q*.8);glow(f.rgb,f.x,f.y,r*1.8,.55*k);ctx.strokeStyle=`rgba(${f.rgb},${k})`;ctx.lineWidth=f.crit?2.6:1.8;ctx.beginPath();
      for(let i=0;i<4;i++){const a=f.a+Math.PI+(i-1.5)*.55;ctx.moveTo(f.x+Math.cos(a)*r*.35,f.y+Math.sin(a)*r*.35);ctx.lineTo(f.x+Math.cos(a)*r,f.y+Math.sin(a)*r)}ctx.stroke()}
    else if(f.k==='ring'){const r=f.r*(.25+.75*Math.pow(q,.6));ctx.strokeStyle=`rgba(${f.rgb},${.75*k})`;ctx.lineWidth=(f.w||3.5)*k+.5;ctx.beginPath();ctx.ellipse(f.x,f.y,r,r*.62,0,0,TAU);ctx.stroke()}
    else if(f.k==='flash')glow(f.rgb,f.x,f.y,f.r*(.6+q*.6),.75*k*k);
    else if(f.k==='spark'){ctx.strokeStyle=`rgba(${f.rgb},${k})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x-f.vx*.035,f.y-f.vy*.035);ctx.stroke()}
    else if(f.k==='ghost'){ctx.save();ctx.translate(f.x,f.y-10);ctx.rotate(f.a);ctx.fillStyle=`rgba(150,230,190,${.32*k})`;ctx.beginPath();ctx.ellipse(-4,0,15,8,0,0,TAU);ctx.fill();ctx.restore();
      ctx.strokeStyle=`rgba(230,255,240,${.5*k})`;ctx.lineWidth=1.5;for(const o of [-7,0,7]){const px=-Math.sin(f.a)*o,py=Math.cos(f.a)*o;ctx.beginPath();ctx.moveTo(f.x+px,f.y-10+py);ctx.lineTo(f.x+px-Math.cos(f.a)*22*k,f.y-10+py-Math.sin(f.a)*22*k);ctx.stroke()}}}
  ctx.restore()}
{const _r=render;render=function(){_r();if(window.EPIC&&G&&started)epicDraw()}}
