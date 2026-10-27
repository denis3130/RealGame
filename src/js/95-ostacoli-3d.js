// ===================================================================== OSTACOLI IN 3D (Classica nuova: anteprima dal 20 ottobre, nel gioco dal 27 ottobre)
// Denis: «trasforma ogni cosa/ostacolo che è in 2d in 3d anche in game». Ogni ostacolo delle stanze (i 28 tipi dei quattro mondi) rifatto
// come volumi 3D visti dalla telecamera dei mostri (C3.V: lo schermo è x, y·0,55 − z) e dipinto come loro: tre toni su ogni pezzo, bordo
// illuminato, contorno scuro spesso, la luce dall'alto a sinistra. Stesse forme, stessi colori e stessa grandezza di prima, così la stanza
// si legge come sempre; i pezzi squadrati sono girati un poco a caso, così si vedono due facce. Ogni ostacolo fermo è dipinto una volta in
// un'immagine (come rockSprite in 47) insieme ai mucchietti 3D davanti alla base; le parti vive (fiamme, bagliori, bolle, canne che
// ondeggiano, il braccio del pupazzo, le liane) si disegnano sopra a ogni fotogramma. L'usura taglia il disegno 3D e i pezzi che cadono sono
// sassi 3D. Gli ostacoli dei boss rifatti (rocce del Golem, incudini del Fabbro, gabbia della Piovra…) restano i loro, già in 3D.
// In src/ordine.txt dopo 94. OB3.on = false rimette il disegno di prima.
const OB3={on:true,face:Math.PI/2,M:{},B:{},L:{},bad:{},n:0,ms:0};
const OQ=(sx,sd,z)=>[sd||0,-(sx||0),z||0];        // a point by screen right, toward us and up (before the obstacle's own turn)
const oH=(i,s)=>{const v=Math.sin(i*127.1+s*311.7)*43758.5453;return v-Math.floor(v)};   // 0..1, fixed for an obstacle
const oL3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];

// ------------------------------------------------------------------ the painting tools (on top of the prologue's: proCam, pRound, pShade)
// flat faces ([normal, [3D corners]]): every outline first, thick, then the faces we see in their own light over it, with thin edges, so a
// hollow shape (the anvil's horn, an arch) keeps its outline; o.cf(n) gives a face its own colour, o.face(n, q, pts) paints on it
function oFaces(K,F,col,o){o=o||{};const{V0}=K,vis=[];
  for(const f of F){const v=V0.F(f[0]);if(v>.01){let cx=0,cy=0,cz=0;for(const q of f[1]){cx+=q[0];cy+=q[1];cz+=q[2]}const m=f[1].length;vis.push({n:f[0],q:f[1],p:f[1].map(q=>V0.P(q)),d:V0.D(cx/m,cy/m,cz/m)})}}
  vis.sort((a,b)=>a.d-b.d);ctx.lineJoin='round';ctx.lineCap='round';
  if(!o.noInk){ctx.strokeStyle=INK;ctx.lineWidth=(o.lw||2.4)*2;for(const f of vis){C3.poly(f.p);ctx.stroke()}}
  for(const f of vis){const c0=o.cf?o.cf(f.n,f.q):col,sh=pShade(K,f.n,c0),b=C3.bbox(f.p);C3.poly(f.p);
    const g=ctx.createLinearGradient(b[0],b[1],b[2],b[3]);g.addColorStop(0,C3.lt(sh,.1));g.addColorStop(1,C3.dk(sh,.18));ctx.fillStyle=g;ctx.fill();
    ctx.strokeStyle=C3.dk(c0,.62);ctx.lineWidth=o.ew||.7;ctx.stroke();if(o.face)o.face(f.n,f.q,f.p)}
  return vis}
// a box: base centre c, w deep (toward us), d wide, h high, turned by o.a
function oBox(K,c,w,d,h,col,o){o=o||{};const a=o.a||0,ca=Math.cos(a),sa=Math.sin(a),hw=w/2,hd=d/2,T=(x,y,z)=>[c[0]+x*ca-y*sa,c[1]+x*sa+y*ca,c[2]+z];
  return oFaces(K,[[[0,0,1],[T(-hw,-hd,h),T(hw,-hd,h),T(hw,hd,h),T(-hw,hd,h)]],[[ca,sa,0],[T(hw,hd,0),T(hw,-hd,0),T(hw,-hd,h),T(hw,hd,h)]],[[-ca,-sa,0],[T(-hw,-hd,0),T(-hw,hd,0),T(-hw,hd,h),T(-hw,-hd,h)]],
    [[-sa,ca,0],[T(-hw,hd,0),T(hw,hd,0),T(hw,hd,h),T(-hw,hd,h)]],[[sa,-ca,0],[T(hw,-hd,0),T(-hw,-hd,0),T(-hw,-hd,h),T(hw,-hd,h)]]],col,o)}
// a slab cut to a profile [[u (right), z (up)], ...] (counterclockwise as we look at it), d thick, turned by o.a
function oExtrude(K,c,prof,d,col,o){o=o||{};const a=o.a||0,ca=Math.cos(a),sa=Math.sin(a),T=(x,u,z)=>{const y=-u;return[c[0]+x*ca-y*sa,c[1]+x*sa+y*ca,c[2]+z]},R=v=>[v[0]*ca-v[1]*sa,v[0]*sa+v[1]*ca,v[2]];
  const n=prof.length,F=[[R([1,0,0]),prof.map(p=>T(d/2,p[0],p[1]))],[R([-1,0,0]),prof.slice().reverse().map(p=>T(-d/2,p[0],p[1]))]];
  for(let i=0;i<n;i++){const p=prof[i],q=prof[(i+1)%n],du=q[0]-p[0],dz=q[1]-p[1],l=Math.hypot(du,dz)||1;F.push([R([0,-dz/l,-du/l]),[T(d/2,p[0],p[1]),T(d/2,q[0],q[1]),T(-d/2,q[0],q[1]),T(-d/2,p[0],p[1])]])}
  return oFaces(K,F,col,o)}
// an upright prism of n sides (radius r, top radius o.rt, height h, turned by o.a) with a pointed tip (o.tip) or a flat top; o.lean [x, y]
// tilts it from its base
function oPrism(K,c,n,r,h,col,o){o=o||{};const a0=o.a||0,tip=o.tip||0,lx=o.lean?o.lean[0]:0,ly=o.lean?o.lean[1]:0,rt=o.rt==null?r:o.rt,
    T=(x,y,z)=>[c[0]+x+lx*z,c[1]+y+ly*z,c[2]+z],ring=(rr,z)=>{const q=[];for(let i=0;i<n;i++){const t=a0+i/n*TAU;q.push(T(Math.cos(t)*rr,Math.sin(t)*rr,z))}return q};
  const B=ring(r,0),U=ring(rt,h),F=[];
  for(let i=0;i<n;i++){const j=(i+1)%n,tm=a0+(i+.5)/n*TAU;F.push([C3.nrm([Math.cos(tm),Math.sin(tm),(r-rt)/Math.max(1,h)]),[B[i],B[j],U[j],U[i]]])}
  if(tip>0){const A=T(0,0,h+tip);for(let i=0;i<n;i++){const j=(i+1)%n,tm=a0+(i+.5)/n*TAU;F.push([C3.nrm([Math.cos(tm)*tip,Math.sin(tm)*tip,rt*.9]),[U[i],U[j],A]])}}
  else F.push([[0,0,1],U]);
  return oFaces(K,F,col,o)}
// a point on a dome (centre c, radii across R, deep Ry, high H) toward the azimuth az (0 = toward us before the turn) and elevation el
const oDome=(c,R,Ry,H,az,el)=>[c[0]+Math.cos(az)*Ry*Math.cos(el),c[1]+Math.sin(az)*R*Math.cos(el),c[2]+H*Math.sin(el)];
// the azimuth that faces the camera
const oFront=V0=>Math.atan2(V0.c,V0.s);
// a line on a surface: 3D points projected, a dark groove and a lit lip under it
function oGroove(V0,pts,al,lw){const p=pts.map(q=>V0.P(q));ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=`rgba(0,0,0,${al||.3})`;ctx.lineWidth=lw||1.5;C3.line(p);ctx.stroke();
  ctx.strokeStyle=`rgba(255,255,255,${(al||.3)*.35})`;ctx.lineWidth=(lw||1.5)*.7;C3.line(p.map(q=>[q[0]+.7,q[1]+.8]));ctx.stroke()}
// a rock: a lumpy dome, soft and round like the monsters, with two or three cuts on the side we see, a lit top; o.moss / o.snow: a cap
function oRock(K,c,R,Ry,H,col,sd,o){o=o||{};const{V0}=K,pts=[],az0=oFront(V0);
  for(let j=0;j<=5;j++){const el=j/5*Math.PI/2,ce=Math.cos(el),se=Math.sin(el);for(let i=0;i<14;i++){if(j===5&&i)break;const az=i/14*TAU,
    w=1+.13*Math.sin(az*3+sd*2.3+j)+.07*Math.sin(az*5+sd*1.1)-.04*j/5;pts.push([c[0]+Math.cos(az)*Ry*ce*w,c[1]+Math.sin(az)*R*ce*w,c[2]+H*se*(j===5?1:.97+.06*Math.sin(az*2+sd))])}}
  const hull=C3.vol(V0,pts,col,{lw:o.lw||2.4,kl:.26,kd:.5,rim:.32});
  ctx.save();C3.poly(hull);ctx.clip();
  if(!o.small){const D=(a,e)=>oDome(c,R*1.02,Ry*1.02,H,az0+a,e);oGroove(V0,[D(.25,1.05),D(-.05,.62),D(-.42,.32)],.3,1.7);oGroove(V0,[D(-.05,.62),D(.3,.18)],.26,1.4)}
  if(o.moss){for(let i=0;i<5;i++){const a=az0+(oH(i,sd)-.5)*2.4,e=.95+oH(i+5,sd)*.5,p=oDome(c,R,Ry,H,a,Math.min(1.45,e)),n=C3.nrm([p[0]-c[0],p[1]-c[1],(p[2]-c[2])*R/Math.max(1,H)]);
      C3.spot(V0,p,n,R*(.18+oH(i+9,sd)*.16),C3.dk(o.moss,.2));C3.spot(V0,[p[0],p[1],p[2]+.6],n,R*(.12+oH(i+9,sd)*.12),o.moss)}
    C3.spot(V0,[c[0],c[1],c[2]+H],[0,0,1],R*.42,C3.dk(o.moss,.15));C3.spot(V0,[c[0],c[1]+R*.08,c[2]+H+.5],[0,0,1],R*.3,C3.lt(o.moss,.12))}
  const q=V0.P(oDome(c,R,Ry,H,az0+.75,.85));ctx.fillStyle='rgba(255,255,255,.2)';ctx.beginPath();ctx.ellipse(q[0],q[1],R*.3,R*.14,-.3,0,TAU);ctx.fill();ctx.restore();
  if(o.snow){const sp=[];for(let j=0;j<=3;j++){const el=j/3*Math.PI/2;for(let i=0;i<14;i++){if(j===3&&i)break;const az=i/14*TAU,w=.9+.07*Math.sin(az*4+sd*3);
      sp.push([c[0]+Math.cos(az)*Ry*.86*w*Math.cos(el),c[1]+Math.sin(az)*R*.9*w*Math.cos(el),c[2]+H*.5+H*.56*Math.sin(el)])}}
    C3.vol(V0,sp,'#f4f8ff',{lw:1.8,kl:.1,kd:.28,rim:.2})}
  return hull}
// the visible half of a band round an upright cylinder (radius R, from z0 to z1): scarves, belts, painted rings
function oBand(K,c,R,z0,z1,col,o){o=o||{};const{V0}=K,a0=oFront(V0),top=[],bot=[];for(let i=0;i<=16;i++){const a=a0-Math.PI/2+i/16*Math.PI,x=c[0]+Math.cos(a)*R,y=c[1]+Math.sin(a)*R;top.push(V0.P([x,y,c[2]+z1]));bot.push(V0.P([x,y,c[2]+z0]))}
  const p=top.concat(bot.reverse());C3.poly(p);const b=C3.bbox(p),g=ctx.createLinearGradient(b[0],0,b[2],0);g.addColorStop(0,C3.lt(col,.18));g.addColorStop(.5,col);g.addColorStop(1,C3.dk(col,.35));
  ctx.fillStyle=g;ctx.fill();if(o.lw!==0){ctx.strokeStyle=INK;ctx.lineWidth=o.lw||1.4;ctx.lineJoin='round';ctx.stroke()}return p}
// a thin stem: a 3D curve (quadratic: a, control b, end e) as the game draws its stems, the ink under the colour
function oStem(V0,a,b,e,col,w){const p=[];for(let i=0;i<=8;i++){const t=i/8,u=1-t;p.push(V0.P([u*u*a[0]+2*u*t*b[0]+t*t*e[0],u*u*a[1]+2*u*t*b[1]+t*t*e[1],u*u*a[2]+2*u*t*b[2]+t*t*e[2]]))}
  ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=w+2;C3.line(p);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w;C3.line(p);ctx.stroke();return p}
// a picture on a flat face: corners a (bottom left), b (bottom right), c (top right), d (top left) → (u, v) in 0..1 to the screen
const oMap=(V0,a,b,c,d)=>(u,v)=>V0.P([a[0]+(b[0]-a[0])*u+(d[0]-a[0])*v+(a[0]-b[0]+c[0]-d[0])*u*v,a[1]+(b[1]-a[1])*u+(d[1]-a[1])*v+(a[1]-b[1]+c[1]-d[1])*u*v,a[2]+(b[2]-a[2])*u+(d[2]-a[2])*v+(a[2]-b[2]+c[2]-d[2])*u*v]);
// the corners of a box face as oMap wants them (bottom left, bottom right, top right, top left as we see it)
function oCorners(V0,q){const s=q.map(p=>V0.P(p)),lo=[0,1,2,3].sort((i,j)=>s[j][1]-s[i][1]).slice(0,2).sort((i,j)=>s[i][0]-s[j][0]),hi=[0,1,2,3].filter(i=>!lo.includes(i)).sort((i,j)=>s[i][0]-s[j][0]);
  return[q[lo[0]],q[lo[1]],q[hi[1]],q[hi[0]]]}
const oEll=(M,cu,cv,ru,rv,n)=>{const p=[];for(let i=0;i<(n||14);i++){const t=i/(n||14)*TAU;p.push(M(cu+Math.cos(t)*ru,cv+Math.sin(t)*rv))}return p};
const oFill=(p,col,lw)=>{C3.poly(p);ctx.fillStyle=col;ctx.fill();if(lw){ctx.strokeStyle=INK;ctx.lineWidth=lw;ctx.lineJoin='round';ctx.stroke()}};

// ------------------------------------------------------------------ the models: (camera, obstacle, r, height, seed, stone palette, theme, flag)
const OM=OB3.M;
// a boulder: the big rock, moss on top in the moss world, two pebbles at its foot
OM.boulder=(K,k,r,h,sd,S,th)=>{const mo=th==='muschio'||th==='radici'?S.moss:null;oRock(K,[0,0,0],r*1.02,r*.92,Math.max(h,r*.95),S.mid,sd,{moss:mo});
  oRock(K,OQ(-r*.86,r*.62,0),r*.17,r*.15,r*.16,S.lo,sd+5,{small:1,lw:1.8})};
// a pillar: plinth, fluted shaft, a capital or a broken top; a band of crystal in the crystal caves, a crack of lava when the Golem rages
OM.pillar=(K,k,r,h,sd,S,th,fl)=>{const{V0}=K,w=r*.65,br=sd%2>1,a0=oFront(V0),H=h+7;
  pRound(K,[0,0,0],[[0,r*1.15],[7,r*1.12]],S.mid,{m:20,lw:2.4,kl:.24,kd:.45});
  pRound(K,[0,0,7],[[0,w],[h-(br?4:0),w*.95]],S.mid,{m:18,lw:2.4,kl:.3,kd:.5,rim:.3});
  for(const f of[-.9,-.45,0,.45,.9]){const a=a0+f;oGroove(V0,[[Math.cos(a)*w*1.01,Math.sin(a)*w*1.01,10],[Math.cos(a)*w*.97,Math.sin(a)*w*.97,H-(br?6:3)]],.2,1.3)}
  if(br){const R=[],T=[];for(let i=0;i<12;i++){const t=i/12*TAU;R.push([Math.cos(t)*w*.95,Math.sin(t)*w*.95,H-4]);T.push([Math.cos(t)*w*.95,Math.sin(t)*w*.95,H+(i%2?-3:3)+Math.sin(sd*7+i)*2.5])}
    const F=[];for(let i=0;i<12;i++){const j=(i+1)%12,t=(i+.5)/12*TAU;F.push([[Math.cos(t),Math.sin(t),0],[R[i],R[j],T[j],T[i]]])}F.push([[0,0,1],T]);oFaces(K,F,S.mid,{cf:n=>n[2]>.5?S.hi:S.mid,lw:2.2})}
  else{pRound(K,[0,0,H],[[0,w*.98],[3,w*1.28]],S.mid,{m:18,lw:2.2});pRound(K,[0,0,H+3],[[0,w*1.36],[6,w*1.36]],S.hi,{m:18,lw:2.3,kl:.3,kd:.4})}
  oGroove(V0,[[Math.cos(a0+.2)*w,Math.sin(a0+.2)*w,H-12],[Math.cos(a0-.05)*w,Math.sin(a0-.05)*w,H-22],[Math.cos(a0+.12)*w,Math.sin(a0+.12)*w,H-30]],.4,1.6);
  if(th==='cristalli'){const z=7+h*.45;oBand(K,[0,0,0],w*1.03,z,z+7,'#78c8e6',{lw:1.2});ctx.save();ctx.globalCompositeOperation='lighter';oBand(K,[0,0,0],w*1.04,z+2,z+4.5,'#a0ebff',{lw:0});ctx.restore()}
  if(fl){ctx.save();ctx.strokeStyle='rgba(255,122,46,.85)';ctx.lineWidth=2;ctx.lineCap='round';C3.line([[a0-.2,12],[a0,26],[a0-.15,38]].map(([a,z])=>V0.P([Math.cos(a)*w*1.02,Math.sin(a)*w*1.02,z])));ctx.stroke();ctx.restore()}};
// a sarcophagus: the stone chest, a lid with a low ridge, the round seal with a little skull on the front, cracks
OM.tomb=(K,k,r,h,sd,S)=>{const{V0}=K,D=r*1.1,W=r*2,a=(oH(1,sd)-.5)*.5;
  oBox(K,[0,0,0],D,W,h,S.mid,{a,face:(n,q)=>{if(Math.abs(n[2])>.5)return;const M=oMap(V0,...oCorners(V0,q));
    if(V0.F(n)>.35&&Math.abs(n[0]*Math.cos(a)+n[1]*Math.sin(a))>.9){oFill(oEll(M,.5,.5,.13,.2,16),S.hi,2);ctx.fillStyle=INK;oFill(oEll(M,.46,.53,.03,.045,8),INK);oFill(oEll(M,.54,.53,.03,.045,8),INK)}
    ctx.strokeStyle='rgba(0,0,0,.33)';ctx.lineWidth=1.4;C3.line([M(.78,1),M(.72,.8),M(.76,.62)]);ctx.stroke();C3.line([M(.12,0),M(.18,.25),M(.14,.45)]);ctx.stroke()}});
  oBox(K,[0,0,h],D*1.12,W*1.08,3.5,S.mid,{a,cf:n=>n[2]>.5?S.hi:S.mid,lw:2.2});
  const ca=Math.cos(a),sa=Math.sin(a),T=(x,y,z)=>[x*ca-y*sa,x*sa+y*ca,z],hw=D*.56,hd=W*.54,z0=h+3.5,z1=z0+5;
  oFaces(K,[[C3.nrm([ca*.6,sa*.6,1]),[T(hw,-hd,z0),T(hw,hd,z0),T(0,hd,z1),T(0,-hd,z1)]],[C3.nrm([-ca*.6,-sa*.6,1]),[T(-hw,hd,z0),T(-hw,-hd,z0),T(0,-hd,z1),T(0,hd,z1)]],
    [[-sa,ca,0],[T(hw,hd,z0),T(-hw,hd,z0),T(0,hd,z1)]],[[sa,-ca,0],[T(-hw,-hd,z0),T(hw,-hd,z0),T(0,-hd,z1)]]],S.hi,{lw:2.2})};
// urns: one or two pots of terracotta with a light zigzag round the belly, the dark mouth
OM.urn=(K,k,r,h,sd,S)=>{const{V0}=K,a0=oFront(V0);
  const pot=(c,s)=>{const H=s*1.5;pRound(K,c,[[0,s*.42],[H*.18,s*.76],[H*.45,s*.86],[H*.72,s*.62],[H*.8,s*.4]],'#a8623a',{m:18,lw:2.2,kl:.32,kd:.45,rim:.3});
    pRound(K,[c[0],c[1],c[2]+H*.78],[[0,s*.36],[H*.17,s*.36]],'#9a5634',{m:14,lw:2});pRound(K,[c[0],c[1],c[2]+H*.93],[[0,s*.5],[H*.07,s*.52]],'#c07a4a',{m:16,lw:2});
    C3.disc3(V0,[c[0],c[1],c[2]+H*1.005],[0,0,1],s*.38,{N:16});ctx.fillStyle='#3a2216';ctx.fill();
    const z=[];for(let i=0;i<=8;i++){const a=a0-1.15+i*.2875;z.push(V0.P([c[0]+Math.cos(a)*s*.87,c[1]+Math.sin(a)*s*.87,c[2]+H*(.46+(i%2?.06:-.02))]))}ctx.strokeStyle='#f0c48a';ctx.lineWidth=1.6;ctx.lineJoin='round';C3.line(z);ctx.stroke()};
  pot(OQ(-r*.25,0,0),r*.72);if(r>14)pot(OQ(r*.55,r*.35,0),r*.45)};
// a gravestone: an arch-topped slab on its mound of earth, three lines carved in it, tufts of grass at its foot
OM.gravestone=(K,k,r,h,sd,S)=>{const{V0}=K,w=r*1.25,d=r*.42,a=(oH(2,sd)-.5)*.5;
  C3.vol(V0,C3.ellPts([0,0,0],[r*.7,r*1.05,r*.24],null,3,14,0),'#4a3b2c',{lw:2.2,kl:.2,kd:.4,rim:.15});
  const prof=[[-w/2,0],[w/2,0],[w/2,h-w/2]];for(let i=1;i<12;i++){const t=i/12*Math.PI;prof.push([Math.cos(t)*w/2,h-w/2+Math.sin(t)*w/2])}prof.push([-w/2,h-w/2]);
  oExtrude(K,[0,0,1],prof,d,S.mid,{a,face:(n,q)=>{if(V0.F(n)<.3||Math.abs(n[2])>.3||q.length<6)return;const s=q.map(p=>V0.P(p)),cx=s.reduce((m,p)=>m+p[0],0)/s.length;ctx.strokeStyle='rgba(0,0,0,.36)';ctx.lineWidth=1.5;
    for(const ly of[.45,.62,.76]){const z=h*ly,A=V0.P([q[0][0],q[0][1],1+z]),B=V0.P([q[1][0],q[1][1],1+z]),m=[(A[0]+B[0])/2,(A[1]+B[1])/2],dx=(B[0]-A[0])*.28,dy=(B[1]-A[1])*.28;ctx.beginPath();ctx.moveTo(m[0]-dx,m[1]-dy);ctx.lineTo(m[0]+dx,m[1]+dy);ctx.stroke()}}});
  for(const[sx,sdp] of[[-w*.62,r*.25],[w*.58,r*.3],[-w*.28,r*.42]]){const b=OQ(sx,sdp,0);for(const s of[-1,1])C3.leaf(V0,b,[0,s*.4,1],[0,1,0],6,1.6,'#5f8a34',{lw:1.1})}};
// a stump: roots running over the floor, the trunk with its bark, the cut face with its rings, a little red mushroom
OM.stump=(K,k,r,h,sd,S)=>{const{V0}=K,H=h+8,w=r*.95,a0=oFront(V0),roots=[-2.4,-1.1,.3,1.7].map((t,i)=>{const a=t+sd*.3;return{a:[Math.cos(a)*w*.8,Math.sin(a)*w*.8,5],b:[Math.cos(a)*r*1.3,Math.sin(a)*r*1.3,0],d:V0.D(Math.cos(a),Math.sin(a),0)}});
  const root=R=>{C3.caps(V0,R.a,4,oL3(R.a,R.b,.55),2.6,'#6b4a2a',{lw:2.2,kl:.3,kd:.5});C3.caps(V0,oL3(R.a,R.b,.5),2.7,R.b,1.2,'#6b4a2a',{lw:2.2,kl:.3,kd:.5})};
  for(const R of roots)if(R.d<0)root(R);
  pRound(K,[0,0,0],[[0,w*1.04],[H*.5,w*.98],[H,w*.95]],'#6b4a2a',{m:18,lw:2.4,kl:.3,kd:.55,rim:.28});
  for(const f of[-1,-.35,.3,.95]){const a=a0+f;oGroove(V0,[[Math.cos(a)*w,Math.sin(a)*w,2],[Math.cos(a+.06)*w*.97,Math.sin(a+.06)*w*.97,H*.55],[Math.cos(a)*w*.96,Math.sin(a)*w*.96,H-3]],.3,1.4)}
  C3.disc3(V0,[0,0,H],[0,0,1],w*.95,{N:24});ctx.fillStyle='#c9a26a';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke();
  ctx.strokeStyle='rgba(110,70,40,.55)';ctx.lineWidth=1.3;for(const rr of[.65,.35]){C3.disc3(V0,[0,0,H],[0,0,1],w*rr,{N:20});ctx.stroke()}
  for(const R of roots)if(R.d>=0)root(R);
  const m=OQ(w*.78,w*.55,0);pRound(K,m,[[0,1.2],[4,1.1]],'#ece0c6',{m:10,lw:1.4});pRound(K,[m[0],m[1],3.6],[[0,4],[1.6,3.6],[3.4,.2]],'#d65b5b',{m:12,lw:1.6,kl:.35});
  ctx.fillStyle='#fff3e0';for(const[dy,dz] of[[-1.4,5.3],[1.2,4.8]]){const q=V0.P([m[0]+1.8,m[1]+dy,dz]);ctx.beginPath();ctx.arc(q[0],q[1],.7,0,TAU);ctx.fill()}};
// a crystal cluster: hexagonal shards with pointed tips, pale on the side of the light and violet in the shade (the glow lives on top); the
// shards the hits have broken off (k.cs of 4 still standing, CRY_LOSE) leave a low stump with the pale ice of the break on top
const CRY_SH=[[0,0,1,0],[-.55,.15,.7,-.35],[.55,.2,.75,.3],[.15,.3,.55,.05]];   // the shards: across, toward us, size, tilt
const CRY_LOSE=[3,1,2],CRY_STUB=.2;   // the order they break off in (the main shard last, with the burst), the stump left of a shard
const cryLeft=k=>k.cs==null?4:k.cs,cryLost=k=>CRY_LOSE.slice(0,4-cryLeft(k));
OM.crystal=(K,k,r,h,sd,S)=>{const{V0}=K,lost=cryLost(k);C3.vol(V0,C3.ellPts([0,0,0],[r*.6,r*.95,2.5],null,2,14,0),S.lo,{lw:2,kl:.15,kd:.3,rim:.1});
  const sh=CRY_SH.map(([ox,oy,sz,tl],i)=>({c:OQ(ox*r,oy*r*1.1,0),sz,tl,i})).sort((a,b)=>V0.D(a.c)-V0.D(b.c));
  for(const s of sh){const H=h*s.sz,R=r*.36*s.sz;
    if(lost.includes(s.i)){oPrism(K,s.c,6,R,H*CRY_STUB,'#6fc9e8',{a:sd+s.i,lean:[0,-s.tl*.6],lw:2,cf:n=>n[2]>.9?'#e6fbff':n[1]>.35?'#c9f3ff':n[1]<-.35?'#6a4fc4':'#7fd0ec'});continue}
    oPrism(K,s.c,6,R,H*.72,'#6fc9e8',{tip:H*.28,a:sd+s.i,lean:[0,-s.tl*.6],lw:2,cf:n=>n[1]>.35?'#c9f3ff':n[1]<-.35?'#6a4fc4':'#7fd0ec'});
    const a=V0.P([s.c[0]+R*.3,s.c[1],H*.1]),b=V0.P([s.c[0]+R*.3-s.tl*0,s.c[1]-s.tl*.6*H*.85,H*.92]);ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}};
// a brazier: three iron legs, the round bowl, the coals (the flame lives on top)
OM.brazier=(K,k,r,h,sd,S)=>{const{V0}=K;
  for(let i=0;i<3;i++){const t=-Math.PI/2+i*TAU/3+.3;C3.caps(V0,[Math.cos(t)*r*.72,Math.sin(t)*r*.72,0],1.9,[Math.cos(t)*r*.3,Math.sin(t)*r*.3,15],1.6,'#5a5f68',{lw:2.2,kl:.35,kd:.4})}
  pRound(K,[0,0,13],[[0,r*.32],[3.5,r*.72],[7,r*.95]],'#4a4f58',{m:20,lw:2.4,kl:.35,kd:.5,rim:.3});
  C3.disc3(V0,[0,0,20],[0,0,1],r*.9,{N:22});ctx.fillStyle='#2a1a14';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
  for(let i=0;i<6;i++){const t=i/6*TAU+sd,q=[Math.cos(t)*r*.48,Math.sin(t)*r*.55,20.5];C3.sball(V0,q,2.3,i%2?'#ff6a2a':'#c8401a',{lw:1.2,kl:.5,kd:.3,rim:.1})}};
// a pile of skulls on crossed bones
OM.skulls=(K,k,r,h,sd,S)=>{const{V0}=K;C3.vol(V0,C3.ellPts([0,0,0],[r*.6,r,2.4],null,2,14,0),'#3e352b',{lw:2,kl:.15,kd:.3,rim:.1});
  for(const[a,b] of[[OQ(-r*.9,-r*.1,2.5),OQ(r*.8,r*.25,2.5)],[OQ(-r*.6,r*.35,2.5),OQ(r*.9,-r*.2,2.5)]]){C3.caps(V0,a,2.4,b,2.4,'#e8e2d0',{lw:2,kl:.3,kd:.35});C3.sball(V0,a,2.8,'#e8e2d0',{lw:1.6});C3.sball(V0,b,2.8,'#e8e2d0',{lw:1.6})}
  const af=oFront(V0);for(const[sx,sdp,z,s] of[[0,-r*.2,11,6],[-r*.4,r*.15,5.5,5.5],[r*.45,r*.25,5,5]]){const c=OQ(sx,sdp,z),f=[Math.cos(af),Math.sin(af),0],sd2=[-Math.sin(af),Math.cos(af),0];
    C3.sball(V0,c,s,'#e8e2d0',{lw:2,kl:.35,kd:.35});for(const e of[-1,1]){const p=[c[0]+f[0]*s*.82+sd2[0]*e*s*.36,c[1]+f[1]*s*.82+sd2[1]*e*s*.36,c[2]+s*.1];C3.spot(V0,p,C3.nrm([f[0]*.9+sd2[0]*e*.3,f[1]*.9+sd2[1]*e*.3,.15]),s*.27,'#1b1612')}
    const m=V0.P([c[0]+f[0]*s*.86,c[1]+f[1]*s*.86,c[2]-s*.52]);ctx.fillStyle=INK;ctx.fillRect(m[0]-s*.3,m[1]-s*.08,s*.6,s*.18);ctx.fillStyle='#e8e2d0';for(let j=-1;j<=1;j++)ctx.fillRect(m[0]+j*s*.2-.5,m[1]-s*.06,1,s*.12)}};
// a thorn bush: round clumps bristling with thorns, violet berries
OM.thorns=(K,k,r,h,sd,S,th,fl)=>{const{V0}=K,col=fl?'#4a5a2a':'#3f6a2a',bl=[[-.5,0,.72],[.5,.05,.66],[0,-.4,.74],[-.15,.18,.6]].map(([ox,oy,s],i)=>({c:OQ(ox*r,oy*r*1.4,8+s*r*.25),rr:r*s*.8,i})).sort((a,b)=>V0.D(a.c)-V0.D(b.c));
  for(const b of bl){const sp=[];for(let j=0;j<9;j++){const az=j/9*TAU+sd+b.i,el=(j%3-1)*.5;sp.push({n:[Math.cos(az)*Math.cos(el),Math.sin(az)*Math.cos(el),Math.sin(el)]})}
    const spike=s=>{const p=[b.c[0]+s.n[0]*b.rr*.9,b.c[1]+s.n[1]*b.rr*.9,b.c[2]+s.n[2]*b.rr*.9],e=[b.c[0]+s.n[0]*b.rr*1.45,b.c[1]+s.n[1]*b.rr*1.45,b.c[2]+s.n[2]*b.rr*1.45];C3.caps(V0,p,2.2,e,.3,C3.dk(col,.25),{lw:1.4,noRim:1})};
    for(const s of sp)if(V0.F(s.n)<0)spike(s);C3.sball(V0,b.c,b.rr,col,{lw:2.4,kl:.3,kd:.5});for(const s of sp)if(V0.F(s.n)>=0)spike(s)}
  for(const[bx,by,bz] of[[-.3,.1,1.25],[.35,.2,1.05],[0,.45,.75]])C3.sball(V0,OQ(bx*r,by*r,8+bz*r*.4),2.4,'#b06ad8',{lw:1.2,kl:.5,kd:.3})};
// basalt: three hexagonal columns, a crack of lava in the floor before them
OM.basalt=(K,k,r,h,sd,S)=>{const{V0}=K;ctx.save();ctx.strokeStyle='#ff7a2e';ctx.lineWidth=1.6;ctx.lineCap='round';C3.line([OQ(-r*.8,r*.3,0),OQ(-r*.3,r*.8,0),OQ(r*.2,r*.55,0)].map(q=>V0.P(q)));ctx.stroke();ctx.restore();
  const cl=[[-r*.45,-r*.15,.75,r*.5],[r*.4,-r*.1,1,r*.5],[0,r*.4,.55,r*.55]].map(([sx,sdp,hm,w],i)=>({c:OQ(sx,sdp,0),hm,w,i})).sort((a,b)=>V0.D(a.c)-V0.D(b.c));
  for(const c of cl)oPrism(K,c.c,6,c.w*.9,h*c.hm,'#3d3430',{a:.3+c.i*.5+sd,lw:2.4,cf:n=>n[2]>.5?'#6a5c54':'#3d3430',face:(n,q,p)=>{if(n[2]>.5){ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;const m=p.reduce((s,v)=>[s[0]+v[0]/p.length,s[1]+v[1]/p.length],[0,0]);ctx.beginPath();ctx.moveTo(p[0][0]*.6+m[0]*.4,p[0][1]*.6+m[1]*.4);ctx.lineTo(m[0],m[1]);ctx.lineTo(p[3][0]*.6+m[0]*.4,p[3][1]*.6+m[1]*.4);ctx.stroke()}}})};
// a lava rock: a dark rock split by grooves (the glow in them lives on top)
OM.lavarock=(K,k,r,h,sd,S)=>{oRock(K,[0,0,0],r*1.02,r*.92,Math.max(h,r*.95),'#3a302b',sd,{small:1});const{V0}=K,a0=oFront(V0),D=(a,e)=>V0.P(oDome([0,0,0],r*1.03,r*.93,Math.max(h,r*.95),a0+a,e));
  ctx.strokeStyle='#160f0c';ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';C3.line([D(.5,1.05),D(.1,.6),D(-.45,.82)]);ctx.stroke();C3.line([D(.1,.6),D(.2,.12)]);ctx.stroke()};
OB3.lavaCr=(K,r,h)=>{const{V0}=K,a0=oFront(V0),D=(a,e)=>V0.P(oDome([0,0,0],r*1.03,r*.93,Math.max(h,r*.95),a0+a,e));return[[D(.5,1.05),D(.1,.6),D(-.45,.82)],[D(.1,.6),D(.2,.12)]]};
// obsidian: three black glass shards with an orange glint
OM.obsidian=(K,k,r,h,sd,S)=>{const{V0}=K;C3.vol(V0,C3.ellPts([0,0,0],[r*.55,r*.95,2],null,2,14,0),'#1e1a1c',{lw:2,kl:.1,kd:.3,rim:.1});
  const sh=[[0,0,1,0],[-.55,.15,.7,-.35],[.55,.2,.75,.3]].map(([ox,oy,sz,tl],i)=>({c:OQ(ox*r,oy*r*1.1,0),sz,tl,i})).sort((a,b)=>V0.D(a.c)-V0.D(b.c));
  for(const s of sh){const H=h*s.sz,R=r*.4*s.sz;oPrism(K,s.c,5,R,H*.7,'#1b1820',{tip:H*.3,rt:R*.75,a:sd*2+s.i,lean:[0,-s.tl*.6],lw:2,cf:n=>n[1]>.3?'#5a4a66':n[1]<-.3?'#0e0c10':'#221d28'});
    const a=V0.P([s.c[0]+R*.5,s.c[1]+R*.1,H*.15]),b=V0.P([s.c[0]+R*.3,s.c[1]-s.tl*.6*H*.8,H*.88]);ctx.strokeStyle='rgba(255,140,80,.6)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}};
// an anvil on its wooden block
OM.anvil=(K,k,r,h,sd,S)=>{const{V0}=K,a=(oH(3,sd)-.5)*.6;
  oBox(K,[0,0,0],r*.95,r*1.3,r*.72,'#6b4a2a',{a,cf:n=>n[2]>.5?'#a87a4a':'#6b4a2a',face:(n,q)=>{if(Math.abs(n[2])>.5)return;const M=oMap(V0,...oCorners(V0,q));ctx.strokeStyle='rgba(40,24,12,.35)';ctx.lineWidth=1;for(const u of[.3,.62]){ctx.beginPath();const p0=M(u,.05),p1=M(u+.04,.95);ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.stroke()}}});
  const P=[[-.45,0],[.35,0],[.45,.25],[1.2,.3],[1.24,.42],[.7,.55],[-1.05,.55],[-.95,.32],[-.5,.25]].map(([u,z])=>[u*r,z*r]);
  oExtrude(K,[0,0,r*.72],P,r*.52,'#5a5f68',{a,lw:2.4,cf:n=>n[2]>.5?'#8a929c':'#5a5f68'});
  const ca=Math.cos(a),sa=Math.sin(a),T=(x,u,z)=>{const y=-u;return V0.P([x*ca-y*sa,x*sa+y*ca,z])},A=T(r*.26,-r*.95,r*1.26),B=T(r*.26,r*.6,r*1.26);ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke()};
// a cauldron: three stubby legs, the black pot, its rim (the boiling lives on top)
OM.cauldron=(K,k,r,h,sd,S)=>{const{V0}=K;for(let i=0;i<3;i++){const t=-Math.PI/2+i*TAU/3+.3;C3.caps(V0,[Math.cos(t)*r*.62,Math.sin(t)*r*.62,0],2.2,[Math.cos(t)*r*.45,Math.sin(t)*r*.45,9],2.4,'#24242a',{lw:2,kl:.3,kd:.3})}
  pRound(K,[0,0,6],[[0,r*.45],[5,r*.86],[11,r*.96],[17,r*.86]],'#2a2a30',{m:20,lw:2.4,kl:.35,kd:.3,rim:.35});
  pRound(K,[0,0,22],[[0,r*.9],[2.6,r*.9]],'#3a3a40',{m:20,lw:2.2,kl:.35,kd:.3});C3.disc3(V0,[0,0,24.6],[0,0,1],r*.74,{N:22});ctx.fillStyle='#1a1214';ctx.fill()};
// a crate: planks, a diagonal brace, two iron bands
OM.crate=(K,k,r,h,sd,S)=>{const{V0}=K,a=(oH(4,sd)-.5)*.7;
  oBox(K,[0,0,0],r*1.7,r*1.9,h,'#8a6038',{a,cf:n=>n[2]>.5?'#b8884e':'#8a6038',face:(n,q)=>{const M=oMap(V0,...oCorners(V0,q));ctx.strokeStyle='rgba(50,30,14,.4)';ctx.lineWidth=1.1;
    if(n[2]>.5){for(const v of[.33,.66]){const p0=M(.03,v),p1=M(.97,v);ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.stroke()}return}
    for(const v of[.5]){const p0=M(.02,v),p1=M(.98,v);ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.stroke()}
    ctx.strokeStyle='rgba(30,18,8,.5)';ctx.lineWidth=2.2;let p0=M(.08,.08),p1=M(.92,.92);ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.stroke();ctx.strokeStyle='rgba(220,170,110,.4)';ctx.lineWidth=1;ctx.stroke();
    for(const[v0,v1] of[[.2,.3],[.72,.82]])oFill([M(0,v0),M(1,v0),M(1,v1),M(0,v1)],'#5a5f68',1.1);ctx.fillStyle='#c9cfd6';for(const[u,v] of[[.12,.25],[.88,.25],[.12,.77],[.88,.77]]){const p=M(u,v);ctx.fillRect(p[0]-.7,p[1]-.7,1.4,1.4)}}})};
// a dead tree: roots, the leaning trunk with a broken crown, two snapped branches, a hollow knot (the vines live on top)
OM.deadtree=(K,k,r,h,sd,S)=>{const{V0}=K,w=r*.55,ln=Math.sin(sd*5)*r*.18,col='#4a3c30',sp=z=>OQ(ln*(z/h),0,z),roots=[-2.5,-1.2,.2,1.5].map(t=>{const a=t+sd*.2;return{a:[Math.cos(a)*w*.9,Math.sin(a)*w*.9,4],b:[Math.cos(a)*r*1.25,Math.sin(a)*r*1.25,0],d:V0.D(Math.cos(a),Math.sin(a),0)}});
  const root=R=>{C3.caps(V0,R.a,3.6,oL3(R.a,R.b,.55),2.2,col,{lw:2.2,kl:.25,kd:.5});C3.caps(V0,oL3(R.a,R.b,.5),2.3,R.b,1,col,{lw:2.2,kl:.25,kd:.5})};
  for(const R of roots)if(R.d<0)root(R);
  const br=[[-1,.62,r*.9],[1,.78,r*.7]].map(([s,hy,len])=>{const b=sp(h*hy),e=OQ(ln*hy+s*(w*.7+len),r*.1*s,h*hy+len*.5);return{b,e,m:oL3(b,e,.55),s,len,d:V0.D(e)}});
  for(const B of br)if(B.d<V0.D(sp(h*.7)))C3.caps(V0,B.b,3,B.e,1.2,col,{lw:2.2});
  {const pts=[];for(const[f,rr] of[[0,1.45],[.06,1.18],[.18,1],[.45,.9],[.75,.8],[1,.72]]){const c=sp(h*f);for(let i=0;i<14;i++){const a=i/14*TAU,j=1+.06*Math.sin(a*3+sd*4+f*5);pts.push([c[0]+Math.cos(a)*w*rr*j,c[1]+Math.sin(a)*w*rr*j,c[2]])}}
    C3.vol(V0,pts,col,{lw:2.4,kl:.25,kd:.5,rim:.25})}
  for(const[dx,dz] of[[-.7,2],[-.25,9],[.15,4],[.45,11],[.75,5]]){const b=sp(h-2),e=[b[0]+(oH(dz,sd)-.5)*3,b[1]-dx*w*1.05,h+dz];C3.caps(V0,[b[0],b[1]-dx*w*.75,h-4],3,e,.35,col,{lw:1.8})}
  for(const B of br)if(B.d>=V0.D(sp(h*.7))){C3.caps(V0,B.b,3,B.e,1.2,col,{lw:2.2});C3.caps(V0,B.m,1.6,[B.m[0]+r*.1,B.m[1]-B.s*B.len*.12,B.m[2]-B.len*.3],.5,col,{lw:1.6})}
  const af=oFront(V0),kn=sp(h*.42);C3.spot(V0,[kn[0]+Math.cos(af)*w*.92,kn[1]+Math.sin(af)*w*.92,kn[2]],[Math.cos(af),Math.sin(af),0],w*.32,'#1a140e',{lw:1.6});
  for(const f of[-.6,.1,.55]){const a=af+f;oGroove(V0,[[sp(4)[0]+Math.cos(a)*w*1.1,sp(4)[1]+Math.sin(a)*w*1.1,4],[sp(h*.5)[0]+Math.cos(a)*w*.9,sp(h*.5)[1]+Math.sin(a)*w*.9,h*.5],[sp(h-6)[0]+Math.cos(a)*w*.7,sp(h-6)[1]+Math.sin(a)*w*.7,h-6]],.32,1.3)}};
OB3.L.deadtree=(K,k,r,h,sd,t)=>{const{V0}=K,w=r*.55,ln=Math.sin(sd*5)*r*.18;ctx.strokeStyle='rgba(60,70,40,.85)';ctx.lineWidth=1.2;ctx.lineCap='round';
  for(const vx of[-.5,.4]){const s=V0.P(OQ(vx*w+ln*.85,w*.6,h*.85)),q=Math.sin(t*1.3+vx*5)*2,e=Math.sin(t*1.1+vx)*3;ctx.beginPath();ctx.moveTo(s[0],s[1]);ctx.quadraticCurveTo(s[0]+q,s[1]+r*.5,s[0]+e,s[1]+r*.9);ctx.stroke()}};
// a totem: a carved pole with two faces (red and yellow eyes, bared teeth), a red band, a frog's head on top
OM.totem=(K,k,r,h,sd,S)=>{const{V0}=K,w=r*.62,a=(oH(5,sd)-.5)*.5;C3.vol(V0,C3.ellPts([0,0,0],[r*.55,r*.9,2.4],null,2,14,0),'#3a2a1d',{lw:2,kl:.15,kd:.3,rim:.1});
  oBox(K,[0,0,0],w*2,w*2,h,'#8a6038',{a,cf:n=>n[2]>.5?'#a8784a':'#8a6038',face:(n,q)=>{if(Math.abs(n[2])>.5)return;const M=oMap(V0,...oCorners(V0,q)),fr=V0.F(n)>.45;
    ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1.4;for(const v of[.2,.62]){const p0=M(0,v),p1=M(1,v);ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.stroke()}
    oFill([M(0,.47),M(1,.47),M(1,.52),M(0,.52)],'#e5484d',1);if(!fr)return;
    for(const[v,col] of[[.32,'#e5484d'],[.76,'#ffd86b']]){for(const u of[.29,.71]){oFill(oEll(M,u,v,.12,.045,12),col,1.6);oFill(oEll(M,u,v,.045,.02,8),INK)}
      oFill([M(.25,v-.11),M(.75,v-.11),M(.68,v-.15),M(.32,v-.15)],'#2a1a10',1.2);ctx.fillStyle='#f6ead2';for(let i=0;i<5;i++){const u=.3+i*.1;C3.poly([M(u-.035,v-.11),M(u,v-.135),M(u+.035,v-.11)]);ctx.fill()}}}});
  C3.vol(V0,C3.ellPts([0,0,h],[w*1.15,w*1.3,w*.62],null,4,16,0),'#5f9e3c',{lw:2.4,kl:.3,kd:.45});
  const af=oFront(V0);for(const s of[-1,1]){const c=[Math.cos(af)*w*.25-Math.sin(af)*s*w*.7,Math.sin(af)*w*.25+Math.cos(af)*s*w*.7,h+w*.55];C3.sball(V0,c,w*.34,'#7bbf4a',{lw:2,kl:.35,kd:.4});
    C3.spot(V0,[c[0]+Math.cos(af)*w*.3,c[1]+Math.sin(af)*w*.3,c[2]+w*.04],[Math.cos(af),Math.sin(af),.3],w*.14,'#1b1612')}};
// a mound of mud (the bubbles live on top)
OM.mudmound=(K,k,r,h,sd,S)=>{const{V0}=K,H=h+4,pts=[];for(let j=0;j<=4;j++){const el=j/4*Math.PI/2;for(let i=0;i<16;i++){if(j===4&&i)break;const az=i/16*TAU,w=1+.06*Math.sin(az*3+sd);pts.push([Math.cos(az)*r*.8*w*Math.cos(el),Math.sin(az)*r*1.1*w*Math.cos(el),H*Math.pow(Math.sin(el),.8)])}}
  const hull=C3.vol(V0,pts,'#5a4a30',{lw:2.4,kl:.3,kd:.5,rim:.25});ctx.save();C3.poly(hull);ctx.clip();const a0=oFront(V0);
  oGroove(V0,[-.9,-.3,.3,.9].map(f=>oDome([0,0,0],r*1.1,r*.8,H,a0+f,.55+.08*Math.sin(f*3))),.3,1.3);const q=V0.P(oDome([0,0,0],r*1.1,r*.8,H,a0+.6,.8));ctx.fillStyle='rgba(255,240,200,.2)';ctx.beginPath();ctx.ellipse(q[0],q[1],r*.35,r*.14,-.2,0,TAU);ctx.fill();ctx.restore()};
OB3.L.mudmound=(K,k,r,h,sd,t)=>{const{V0}=K,H=h+4,a0=oFront(V0);for(let i=0;i<(LOWFX?2:3);i++){const q=(t*.55+i*.37+sd)%1,p=oDome([0,0,0],r*1.1,r*.8,H,a0+Math.sin(i*2.4+sd)*.9,.45+.2*Math.cos(i*1.7)),br=q<.85?1+q*4:0;
  if(br>0)C3.sball(V0,p,br,'#6a5a3a',{lw:1.2,kl:.6,kd:.3,rim:.2});else{const s=V0.P(p);ctx.strokeStyle='rgba(120,100,70,.8)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(s[0],s[1],5,2.6,0,0,TAU);ctx.stroke()}}};
// reeds: a patch of wet mud; the stems, leaves and cattails live on top (they sway)
OM.reeds=(K,k,r,h,sd,S)=>{const{V0}=K;C3.vol(V0,C3.ellPts([0,0,0],[r*.55,r*.85,2.2],null,2,14,0),'#3e3a24',{lw:2,kl:.2,kd:.3,rim:.1})};
OB3.L.reeds=(K,k,r,h,sd,t)=>{const{V0}=K,st=[-.7,-.35,0,.3,.6,-.15,.45].map((o,i)=>({o,i,c:OQ(o*r,((i*53)%7/7-.5)*r*.6,0)})).sort((a,b)=>V0.D(a.c)-V0.D(b.c));
  for(const s of st){const sw=LOWFX?0:Math.sin(t*1.4+s.i*1.3+sd)*2.2,top=[s.c[0],s.c[1]-s.o*4-sw,h*(.75+((s.i*37)%10)/40)],mid=[s.c[0],s.c[1]-sw*.3,h*.5];
    if(s.i%2)C3.leaf(V0,[s.c[0],s.c[1],h*.15],[0,-(Math.sign(s.o)||1)*.8,.6],[1,0,0],h*.42,2.2,'#7a8a3a',{lw:1.2,bend:.25});
    oStem(V0,s.c,mid,top,s.i%2?'#6a7a32':'#8a9a44',2);
    if(s.i%2===0){C3.caps(V0,[top[0],top[1],top[2]-2],2.4,[top[0],top[1]-sw*.05,top[2]-11],2.4,'#6b3f22',{lw:1.6,kl:.35,kd:.4});oStem(V0,top,[top[0],top[1],top[2]+2],[top[0],top[1]-sw*.2,top[2]+4],'#3a3020',1)}}};
// a stone lantern: post, ledge, the lamp box with its panes, a pyramid roof (the light lives on top)
OM.lantern=(K,k,r,h,sd,S)=>{const{V0}=K,w=r*.5,a=(oH(6,sd)-.5)*.5;C3.vol(V0,C3.ellPts([0,0,0],[r*.5,r*.8,2],null,2,14,0),S.lo,{lw:2,kl:.15,kd:.3,rim:.1});
  oBox(K,[0,0,0],w*1.1,w*1.1,h*.55,S.mid,{a,cf:n=>n[2]>.5?S.hi:S.mid});oBox(K,[0,0,h*.55],w*1.9,w*1.9,h*.07,S.mid,{a,cf:n=>n[2]>.5?S.hi:S.mid,lw:2.2});
  oBox(K,[0,0,h*.62],w*1.5,w*1.5,h*.24,'#2a2a20',{a,lw:2.2,face:(n,q)=>{if(Math.abs(n[2])>.5)return;const M=oMap(V0,...oCorners(V0,q));oFill([M(.16,.12),M(.84,.12),M(.84,.88),M(.16,.88)],'rgba(200,255,140,.35)')}});
  oPrism(K,[0,0,h*.86],4,w*1.45,h*.03,S.mid,{a:a+Math.PI/4,tip:h*.2,lw:2.2,cf:n=>n[2]>.5?S.hi:S.mid});C3.sball(V0,[0,0,h*1.1],2.2,S.hi,{lw:1.4})};
OB3.L.lantern=(K,k,r,h,sd,t)=>{const{V0}=K,w=r*.5,a=(oH(6,sd)-.5)*.5,p=.75+.25*Math.sin(t*3+sd),c=V0.P([0,0,h*.74]);ctx.save();ctx.globalCompositeOperation='lighter';glow('200,255,110',c[0],c[1],26,.55*p);
  const ca=Math.cos(a),sa=Math.sin(a),hw=w*.75;for(const[nx,ny] of[[1,0],[0,1],[0,-1],[-1,0]]){const n=[nx*ca-ny*sa,nx*sa+ny*ca,0];if(V0.F(n)<.05)continue;const e=[-n[1],n[0],0],o=[n[0]*hw*1.01,n[1]*hw*1.01];
    const M=(u,v)=>V0.P([o[0]+e[0]*hw*(u*2-1)*.68,o[1]+e[1]*hw*(u*2-1)*.68,h*.62+h*.24*(.12+v*.76)]);C3.poly([M(0,0),M(1,0),M(1,1),M(0,1)]);ctx.fillStyle=`rgba(220,255,140,${(.55*p*V0.F(n)+.15).toFixed(3)})`;ctx.fill()}
  ctx.restore();if(!LOWFX)for(let i=0;i<3;i++){const an=t*2.2+i*2.1,q=V0.P([Math.cos(an)*w*.9,Math.sin(an)*w*.9,h*.74+Math.sin(an*1.3)*h*.08]);ctx.fillStyle='#fbffd8';ctx.beginPath();ctx.arc(q[0],q[1],1.2,0,TAU);ctx.fill()}};
// a swamp rock: wet and dark where the water reached, shiny spots
OM.swamprock=(K,k,r,h,sd,S)=>{const{V0}=K,H=Math.max(h,r*.95),hull=oRock(K,[0,0,0],r*1.02,r*.92,H,S.mid,sd,{moss:S.moss});ctx.save();C3.poly(hull);ctx.clip();
  const a0=oFront(V0),ln=[];for(let i=0;i<=16;i++){const a=a0-Math.PI/2+i/16*Math.PI;ln.push(V0.P(oDome([0,0,0],r*1.05,r*.95,H,a,.32+.05*Math.sin(i*1.7+sd))))}const b=C3.bbox(hull);ln.push([b[2]+4,b[3]+6],[b[0]-4,b[3]+6]);
  C3.poly(ln);ctx.fillStyle='rgba(20,30,20,.38)';ctx.fill();ctx.fillStyle='rgba(255,255,255,.3)';for(const[a,e,s] of[[.5,.7,1],[-.35,.5,.45]]){const q=V0.P(oDome([0,0,0],r,r*.9,H,a0+a,e));ctx.beginPath();ctx.ellipse(q[0],q[1],r*.22*s,r*.09*s,-.3,0,TAU);ctx.fill()}ctx.restore()};
// a block of ice with something frozen inside, snow on top
OM.iceblock=(K,k,r,h,sd,S)=>{const{V0}=K,w=r*.95,a=(oH(7,sd)-.5)*.6,what=Math.floor(sd*3)%3;
  ctx.save();ctx.globalAlpha*=.8;
  if(what===0){C3.vol(V0,C3.ellPts([0,0,h*.5],[w*.25,w*.55,h*.17],null,4,12),'#4a6a8a',{lw:1.6,kl:.3,kd:.4});oFaces(K,[[[1,0,0],[[0,-w*.45,h*.5],[0,-w*.8,h*.68],[0,-w*.8,h*.32]]],[[-1,0,0],[[0,-w*.45,h*.5],[0,-w*.8,h*.32],[0,-w*.8,h*.68]]]],'#4a6a8a',{lw:1.4})}
  else if(what===1){C3.sball(V0,[0,0,h*.5],w*.32,'#c9c2b0',{lw:1.6});const af=oFront(V0);for(const s of[-1,1])C3.spot(V0,[Math.cos(af)*w*.28-Math.sin(af)*s*w*.12,Math.sin(af)*w*.28+Math.cos(af)*s*w*.12,h*.52],[Math.cos(af),Math.sin(af),0],w*.08,INK)}
  else{C3.caps(V0,OQ(-w*.5,0,h*.22),1.8,OQ(w*.4,0,h*.75),1.2,'#c9cfd6',{lw:1.6});C3.caps(V0,OQ(-w*.3,0,h*.28),.9,OQ(-w*.62,0,h*.4),.9,'#8a6a44',{lw:1.4})}
  ctx.restore();
  ctx.save();ctx.globalAlpha*=.62;oBox(K,[0,0,0],w*1.6,w*2,h,'#a0d7f0',{a,lw:2.3,cf:n=>n[2]>.5?'#e8f8ff':n[1]>.3?'#c4ecff':'#7fb6dc',face:(n,q)=>{if(Math.abs(n[2])>.5||V0.F(n)<.4)return;const M=oMap(V0,...oCorners(V0,q));
    oFill([M(.06,.92),M(.45,.92),M(.06,.4)],'rgba(255,255,255,.55)');ctx.strokeStyle='rgba(60,100,140,.5)';ctx.lineWidth=1;C3.line([M(.78,.85),M(.86,.55),M(.8,.22)]);ctx.stroke()}});ctx.restore();
  const sp=[];for(let j=0;j<=2;j++){const el=j/2*Math.PI/2;for(let i=0;i<16;i++){if(j===2&&i)break;const az=i/16*TAU,ww=.92+.08*Math.sin(az*5+sd*3);const x=-w*.15+Math.cos(az)*w*.5*ww*Math.cos(el),y=w*.2+Math.sin(az)*w*.62*ww*Math.cos(el);sp.push([x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a),h-1+3.2*Math.sin(el)])}}
  C3.vol(V0,sp,'#f4f8ff',{lw:1.8,kl:.1,kd:.22,rim:.2})};
// a snowy pine: four tiers of dark needles, snow on each, a snowball on the tip
OM.snowpine=(K,k,r,h,sd,S)=>{const{V0}=K;C3.caps(V0,[0,0,0],3.6,[0,0,10],3.2,'#4a3524',{lw:2,kl:.3,kd:.4});
  for(let i=0;i<4;i++){const z=8+i*h*.21,tw=r*(1.18-i*.23),th=h*.33,col=i%2?'#26443f':'#2c4e48',N=14,B=[],A=[0,0,z+th],F=[];
    for(let j=0;j<N;j++){const a=j/N*TAU+i*.4+sd,rr=tw*(j%2?.8:1);B.push([Math.cos(a)*rr,Math.sin(a)*rr,z+(j%2?th*.1:0)])}
    for(let j=0;j<N;j++){const p=B[j],q=B[(j+1)%N],m=[(p[0]+q[0])/2,(p[1]+q[1])/2];F.push([C3.nrm([m[0]*th*.9,m[1]*th*.9,tw*tw*.7]),[p,q,A]])}
    oFaces(K,F,col,{lw:2.1,ew:.5,face:(n,q,P)=>{if(n[2]<.2||Math.sin(Math.atan2(n[1],n[0])*7+i)<-.2)return;const L=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];C3.poly([P[0],P[1],L(P[1],P[2],.2),L(P[0],P[2],.16)]);
      ctx.fillStyle=n[1]>-.2?'#f4f9ff':'#cfdcec';ctx.fill();ctx.strokeStyle='rgba(70,100,130,.5)';ctx.lineWidth=.6;ctx.stroke()}});
    const SN=[],As=[0,0,z+th+.4];for(let j=0;j<N;j++){const a=j/N*TAU+i*.4+sd+.2,rr=tw*.5*(j%2?.82:1);SN.push([Math.cos(a)*rr,Math.sin(a)*rr,z+th*.5+(j%2?th*.06:0)])}
    const FS=[];for(let j=0;j<N;j++){const p=SN[j],q=SN[(j+1)%N],m=[(p[0]+q[0])/2,(p[1]+q[1])/2];FS.push([C3.nrm([m[0]*th*.5,m[1]*th*.5,tw*tw*.25]),[p,q,As]])}
    oFaces(K,FS,'#f4f8ff',{lw:1.2,ew:.3,cf:()=>'#eef6ff'})}
  C3.sball(V0,[0,0,8+h*.88+h*.06],3,'#ffffff',{lw:1.6,kl:.2,kd:.2})};
// a frozen warrior: a stone hero with a hammer on a round plinth, inside a shell of ice
OM.frozenstatue=(K,k,r,h,sd,S)=>{const{V0}=K;pRound(K,[0,0,0],[[0,r*.95],[7,r*.88]],'#8a96a2',{m:20,lw:2.4,kl:.3,kd:.45});
  const st={body:'#8a96a2',hood:'#6e7a86',skin:'#a8b4c0',foot:'#5e6a76',held:null,helm:true,belt:'#5e6a76',eyeCol:'#5e6a76',hoodTip:false},f=Math.PI*.62+((sd*10|0)%3-1)*.4,q=V0.P([0,0,7]);
  if(typeof EROE!=='undefined'&&EROE.arciere)oStatue(()=>EROE.arciere(q[0],q[1]+8*1.15,f,'idle',.25,1.15,{style:st,noFx:true}),-30,-78,60,92);
  const sh=[],H=h+6;for(let i=0;i<10;i++){const az=i/10*TAU,j=.85+oH(i,sd)*.3;sh.push([Math.cos(az)*r*.95*j,Math.sin(az)*r*1.05*j,3],[Math.cos(az+.3)*r*.85*j,Math.sin(az+.3)*r*.95*j,H*(.55+oH(i+20,sd)*.25)])}
  sh.push([r*.1,-r*.2,H+4],[-r*.2,r*.25,H]);const hull=C3.chull(sh.map(p=>V0.P(p)));C3.poly(hull);ctx.fillStyle='rgba(170,220,250,.36)';ctx.fill();ctx.strokeStyle='rgba(60,110,150,.75)';ctx.lineWidth=1.6;ctx.lineJoin='round';ctx.stroke();
  const b=C3.bbox(hull);ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.moveTo(b[0]+(b[2]-b[0])*.12,b[1]+(b[3]-b[1])*.38);ctx.lineTo(b[0]+(b[2]-b[0])*.3,b[1]+(b[3]-b[1])*.08);ctx.lineTo(b[0]+(b[2]-b[0])*.36,b[1]+(b[3]-b[1])*.24);ctx.closePath();ctx.fill()};
// something drawn in colour (fn, in the box x0, y0, w, h of the current units) made all of grey stone, tinted cold: drawn on a canvas of its
// own, a grey copy with the same outline put back
function oStatue(fn,x0,y0,w,h){const m=ctx.getTransform(),S=Math.max(1,Math.hypot(m.a,m.b)),W=Math.ceil(w*S),H=Math.ceil(h*S);if(W<2||H<2||W>1600||H>1600)return;
  const A=document.createElement('canvas'),B=document.createElement('canvas');A.width=B.width=W;A.height=B.height=H;const a=A.getContext('2d'),b=B.getContext('2d'),keep=ctx;
  ctx=a;try{a.setTransform(S,0,0,S,-x0*S,-y0*S);fn()}catch(e){}finally{ctx=keep}
  b.drawImage(A,0,0);b.globalCompositeOperation='saturation';b.fillStyle='#808080';b.fillRect(0,0,W,H);b.globalCompositeOperation='destination-in';b.drawImage(A,0,0);
  b.globalCompositeOperation='source-atop';b.fillStyle='rgba(120,150,185,.28)';b.fillRect(0,0,W,H);
  ctx.save();ctx.translate(x0,y0);ctx.scale(1/S,1/S);ctx.drawImage(B,0,0);ctx.restore()}
// a snowman: three balls of snow, a stick arm (the other waves on top), coal buttons and eyes, a carrot, a red scarf, a black hat
const oSnowM=r=>{const r1=r*.78,r2=r*.58,r3=r*.42,z1=r1*.9,z2=z1+r1*.75+r2*.6,z3=z2+r2*.75+r3*.6;return{r1,r2,r3,z1,z2,z3}};
const oSnowArm=(V0,r2,z2,s,wave)=>{const a=[0,s*r2*.8,z2],b=[0,s*r2*1.7,z2+r2*(.5+wave)],c=[0,s*r2*2,z2+r2*.95];C3.caps(V0,a,1.4,b,1.2,'#5a3f2a',{lw:1.6,noRim:1});C3.caps(V0,b,1.2,c,.8,'#5a3f2a',{lw:1.6,noRim:1})};
OM.snowman=(K,k,r,h,sd,S)=>{const{V0}=K,{r1,r2,r3,z1,z2,z3}=oSnowM(r),af=oFront(V0),f=[Math.cos(af),Math.sin(af),0],sv=[-Math.sin(af),Math.cos(af),0],on=(c,R,u,v)=>{const n=C3.nrm([f[0]+sv[0]*u,f[1]+sv[1]*u,v]);return{p:[c[0]+n[0]*R,c[1]+n[1]*R,c[2]+n[2]*R],n}};
  const snow={lw:2.2,kl:.6,kd:.28,rim:.2};C3.sball(V0,[0,0,z1],r1,'#e4eef8',snow);C3.sball(V0,[0,0,z2],r2,'#e4eef8',snow);oSnowArm(V0,r2,z2,1,0);
  for(const v of[-.25,.2]){const s=on([0,0,z2],r2,0,v);C3.spot(V0,s.p,s.n,1.6,'#1b1612')}
  C3.sball(V0,[0,0,z3],r3,'#e4eef8',snow);oBand(K,[0,0,0],r3*.98,z3-r3*.86,z3-r3*.5,'#e5484d',{lw:1.4});
  const tl=on([0,0,z3-r3*.68],r3,-.55,0);C3.caps(V0,tl.p,1.8,[tl.p[0]+f[0]*1.5,tl.p[1]+f[1]*1.5,tl.p[2]-r3*.95],1.6,'#e5484d',{lw:1.4,noRim:1});
  for(const u of[-.38,.38]){const s=on([0,0,z3+r3*.18],r3,u,.12);C3.spot(V0,s.p,s.n,1.5,'#1b1612')}
  for(let i=0;i<5;i++){const u=-.32+i*.16,s=on([0,0,z3-r3*.32],r3,u,-.3+Math.abs(u)*.5);C3.spot(V0,s.p,s.n,.8,'#1b1612')}
  const n0=on([0,0,z3-r3*.02],r3,0,0);C3.caps(V0,n0.p,1.9,[n0.p[0]+f[0]*r3*1.15+sv[0]*r3*.2,n0.p[1]+f[1]*r3*1.15+sv[1]*r3*.2,n0.p[2]-r3*.15],.3,'#ff8a3c',{lw:1.2,noRim:1});
  pRound(K,[0,0,z3+r3*.72],[[0,r3*1.05],[r3*.2,r3*1.05]],'#2a2a30',{m:16,lw:1.8,kl:.25,kd:.3});pRound(K,[0,0,z3+r3*.9],[[0,r3*.7],[r3*.72,r3*.68]],'#2a2a30',{m:16,lw:1.8,kl:.3,kd:.35});
  oBand(K,[0,0,0],r3*.71,z3+r3*.92,z3+r3*1.1,'#7a2a2a',{lw:1})};
OB3.L.snowman=(K,k,r,h,sd,t)=>{const{r2,z2}=oSnowM(r);oSnowArm(K.V0,r2,z2,-1,LOWFX?0:Math.sin(t*2+sd)*.12)};
// a snowy rock: the rock with a cap of snow
OM.snowrock=(K,k,r,h,sd,S)=>{oRock(K,[0,0,0],r*1.02,r*.92,Math.max(h,r*.95),S.mid,sd,{snow:1})};

// ------------------------------------------------------------------ the live parts (every frame, over the picture)
OB3.L.crystal=(K,k,r,h,sd,t)=>{const{V0}=K,dm=k.chmax?1-k.chp/k.chmax:0,gl=.5+.5*Math.sin(t*(2+dm*4)+sd),c=V0.P([0,0,h*.5]),lost=cryLost(k);
  ctx.save();ctx.globalCompositeOperation='lighter';glow('127,224,240',c[0],c[1],r*1.8,.18+gl*.16+dm*.1);
  for(const i of lost){const s=CRY_SH[i],H=h*s[2],q=V0.P([s[1]*r*1.1,-s[0]*r-s[3]*.6*H*CRY_STUB,H*CRY_STUB]);glow('200,245,255',q[0],q[1],r*.8*s[2],.3+.12*Math.sin(t*3+i))}
  // a hit: the light inside flares up and fades (k.cf, the time of the hit)
  const e=k.cf!=null?(G.t||0)-k.cf:9;if(e>=0&&e<.3){const f=1-e/.3;glow('230,252,255',c[0],c[1]-h*.08,r*(1+.6*(1-f)),.6*f);glow('140,225,255',c[0],c[1],r*2.6,.22*f)}
  // once it has been hit, now and then a star of light runs up to the point of a shard (more often as it weakens); the whole crystal
  // stays as it always was
  const u=t*(.42+dm*.5)+sd*.37,q=u%1;if(dm>0&&q<.2){const left=[0,1,2,3].filter(i=>!lost.includes(i)),i=left[Math.floor(u)%left.length],s=CRY_SH[i],H=h*s[2],p=V0.P([s[1]*r*1.1,-s[0]*r-s[3]*.6*H,H]);
    cryStar(p[0],p[1],(1.5+r*.06)*Math.sin(q/.2*Math.PI),u*3)}
  ctx.restore()};
OB3.L.brazier=(K,k,r,h,sd,t)=>{const q=K.V0.P([0,0,20]);flame(q[0],q[1],1.45,themeOf(G.room)==='radici'?ENV.radici.torch:ENV.muschio.torch,sd)};
OB3.L.lavarock=(K,k,r,h,sd,t)=>{const p=.7+.3*Math.sin(t*2+sd),cr=OB3.lavaCr(K,r,h);ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=`rgba(255,${120+60*p|0},40,.95)`;ctx.lineWidth=1.8;for(const l of cr){C3.line(l);ctx.stroke()}
  ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,220,140,${(.35*p).toFixed(3)})`;ctx.lineWidth=.8;for(const l of cr){C3.line(l);ctx.stroke()}const c=K.V0.P([0,0,r*.5]);glow('255,120,40',c[0],c[1],r*1.2,.25*p);ctx.restore()};
OB3.L.cauldron=(K,k,r,h,sd,t)=>{const{V0}=K,p=.7+.3*Math.sin(t*3+sd);C3.disc3(V0,[0,0,24.4],[0,0,1],r*.7,{N:22});ctx.fillStyle=`rgb(255,${110+50*p|0},40)`;ctx.fill();
  ctx.save();ctx.globalCompositeOperation='lighter';const c=V0.P([0,0,25]);glow('255,150,60',c[0],c[1],r*.9,.3*p);ctx.restore();
  for(let i=0;i<(LOWFX?1:2);i++){const q=(t*.8+i*.5+sd)%1,b=[Math.sin(i*3+t)*r*.3,Math.cos(i*2+t*.7)*r*.4,25+q*6];C3.sball(V0,b,2*(1-q)+.5,'#ffd86b',{lw:.8,kl:.5,kd:.2,rim:.1})}};

// ------------------------------------------------------------------ the foot: little mounds of the world's stuff and a few stones before the base
function oFoot(K,k,r,sd,th,side){const{V0}=K,M=footMat(th),S=stonePal(),n=r>=20?6:5,list=[],moss=!LAVAZ.includes(th)&&!isIce(th)&&!isSwamp(th)&&th!=='cristalli';
  for(let i=0;i<n;i++){const a=(i+.5)/n*TAU+(oH(i,sd)-.5)*.5+sd,w=r*(.3+oH(i+9,sd)*.18);list.push({m:1,c:[Math.cos(a)*r*(.92+oH(i+3,sd)*.12),Math.sin(a)*r*(.92+oH(i+3,sd)*.12),0],w,i})}
  for(let i=0;i<4;i++){const a=oH(i+20,sd)*TAU;list.push({m:0,c:[Math.cos(a)*r*(1.12+oH(i+23,sd)*.25),Math.sin(a)*r*(1.12+oH(i+23,sd)*.25),0],w:1.6+oH(i+26,sd)*1.7,i})}
  const d0=V0.D(0,0,0);list.sort((a,b)=>V0.D(a.c)-V0.D(b.c));
  for(const f of list){const d=V0.D(f.c)-d0;if(side<0&&d>=0||side>0&&d<0)continue;
    if(!f.m){oRock(K,f.c,f.w,f.w*.9,f.w*.75,S.mid,sd+f.i*3,{small:1,lw:1.3});continue}
    const w=f.w,c=f.c,a=Math.atan2(c[1],c[0]),u=[Math.cos(a),Math.sin(a),0],v=[-Math.sin(a),Math.cos(a),0];
    C3.vol(V0,C3.ellPts(c,[w*.62,w,w*.5],{u,v,w:[0,0,1]},3,12,0),M[1],{lw:1.6,kl:.4,kd:.4,rim:.2});
    if(moss)for(let b=0;b<3;b++)C3.leaf(V0,[c[0]+v[0]*(1-b)*w*.45,c[1]+v[1]*(1-b)*w*.45,w*.38],[0,0,1],v,3+b%2*2.5,1.1,b%2?'#5a8a32':'#86c050',{lw:.9});
    else if(LAVAZ.includes(th)){const q=V0.P([c[0]+u[0]*w*.2,c[1]+u[1]*w*.2,w*.42]);ctx.fillStyle='rgba(255,170,60,.95)';ctx.beginPath();ctx.arc(q[0],q[1],1.3,0,TAU);ctx.fill()}
    else if(isSwamp(th))C3.leaf(V0,[c[0],c[1],w*.4],[0,0,1],v,8,1.4,'#7a8a3a',{lw:1,bend:.3});}}

// the floor round an obstacle of the crystal caves without the little glowing crystals (Denis: «togliere quei microcristalli attorno agli
// ostacoli»); the rest as in 47: the floor darker near it, cracks under the weight (not under a crystal, in any world: they would show
// where it stood once it bursts), chipped flakes, the bed of the world's stuff
{const _gp=groundPatch;groundPatch=function(c,k,th){if(!OB3.on||th!=='cristalli'&&k.kind!=='crystal')return _gp.apply(this,arguments);const x=k.x,y=k.y,r=k.r,M=footMat(th);
  c.save();c.translate(x,y+2);c.scale(1,.5);const g=c.createRadialGradient(0,0,r*.3,0,0,r*2.2);g.addColorStop(0,'rgba(14,9,6,.62)');g.addColorStop(.5,'rgba(14,9,6,.24)');g.addColorStop(1,'rgba(14,9,6,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,r*2.2,0,TAU);c.fill();c.restore();
  if(k.kind!=='crystal')for(let i=0;i<3;i++){const a=rand(0,TAU);let px=x+Math.cos(a)*r*1.02,py=y+Math.sin(a)*r*.46;const pts=[[px,py]];for(let j=0;j<2;j++){px+=Math.cos(a+rand(-.5,.5))*rand(3,6);py+=Math.sin(a+rand(-.5,.5))*rand(1.5,3.5);pts.push([px,py])}
    c.strokeStyle='rgba(0,0,0,.36)';c.lineWidth=1.1;c.beginPath();pts.forEach((p,j)=>j?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();
    c.strokeStyle='rgba(255,255,255,.08)';c.lineWidth=1;c.beginPath();pts.forEach((p,j)=>j?c.lineTo(p[0]+.8,p[1]+.8):c.moveTo(p[0]+.8,p[1]+.8));c.stroke()}
  for(let i=0;i<5;i++){const a=rand(0,TAU),d=rand(1.15,1.7),px=x+Math.cos(a)*r*d,py=y+Math.sin(a)*r*.5*d,s=rand(1.6,3.2),rot=rand(0,TAU);
    c.save();c.translate(px,py);c.rotate(rot);c.beginPath();c.moveTo(-s,0);c.lineTo(-s*.2,-s*.7);c.lineTo(s,-s*.2);c.lineTo(s*.4,s*.6);c.closePath();c.fillStyle='rgba(0,0,0,.35)';c.save();c.translate(.8,1);c.fill();c.restore();
    c.fillStyle=pk(ENV[th]?ENV[th].floor:G.env.floor);c.fill();c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=.9;c.beginPath();c.moveTo(-s,0);c.lineTo(-s*.2,-s*.7);c.lineTo(s,-s*.2);c.stroke();c.restore()}
  for(let i=0;i<9;i++){const a=i/9*TAU+rand(-.2,.2),px=x+Math.cos(a)*r*rand(.9,1.2),py=y+Math.sin(a)*r*.46,w=r*rand(.3,.5);c.fillStyle=M[0];c.globalAlpha=.55;c.beginPath();c.ellipse(px,py+1,w,w*.42,0,0,TAU);c.fill();c.globalAlpha=1}}}

// ------------------------------------------------------------------ painting an obstacle, the picture, the wear
// the camera of an obstacle at (x, y): the monsters' camera, a pixel a unit (squared obstacles turn by their own seed inside the model)
function ob3Cam(x,y){return proCam(OB3.face,x,y,1)}
const ob3Fl=(k,th)=>(th==='golem'||th==='radici')&&G.enemies&&G.enemies.some(e=>e.p2)?1:0;
function ob3Use(k){return OB3.on&&!!OM[k.kind]&&!OB3.bad[k.kind]&&!k.g2&&!k.f2&&!k.oc&&!k.qk&&!k.sl2husk&&!k._no3d}
// the model alone (o.foot: with the mounds before it; o.live: with its living parts at time t)
function ob3Model(k,dx,o){o=o||{};const th=themeOf(G.room),S=stonePal(),r=k.r,h=kH(k),sd=k.seed||1,t0=performance.now();ctx.save();
  try{const K=ob3Cam(k.x+(dx||0),k.y);if(o.foot)oFoot(K,k,r,sd,th,-1);OM[k.kind](K,k,r,h,sd,S,th,ob3Fl(k,th));if(o.foot)oFoot(K,k,r,sd,th,1);if(o.live&&OB3.L[k.kind])OB3.L[k.kind](K,k,r,h,sd,G.t||0)}
  catch(err){OB3.bad[k.kind]=1;console.error('ostacolo 3D '+k.kind,err)}finally{ctx.restore();OB3.n++;OB3.ms+=performance.now()-t0}}
// the living parts only, at the obstacle's place
function ob3Live(k,dx){const f=OB3.L[k.kind];if(!f)return;ctx.save();try{const K=ob3Cam(k.x+(dx||0),k.y);f(K,k,k.r,kH(k),k.seed||1,G.t||0)}catch(err){OB3.bad[k.kind]=1;console.error(err)}finally{ctx.restore()}}
// a worn obstacle: the pieces knocked off lie at its foot as stones, the bites cut out of the picture with a dark broken edge (as in 19)
function ob3Worn(k,st){const bites=wearBites(k,st);if(!bites.length){ob3Model(k,0,{foot:1});return}
  const S=stonePal(),wood=k.kind==='stump'||k.kind==='thorns'||k.kind==='crate'||k.kind==='totem'||k.kind==='deadtree',metal=k.kind==='anvil'||k.kind==='cauldron'||k.kind==='brazier',
    pal=k.kind==='thorns'?'#4f8a34':wood?'#6b4a2a':metal?'#5f5f68':S.mid;
  ctx.save();try{const K=ob3Cam(k.x,k.y);for(const bt of bites.slice().sort((a,b)=>a.gy-b.gy)){const s=Math.max(2.4,k.r*.3);oRock(K,OQ(bt.gx,bt.gy/.55,0),s,s*.85,s*.7,pal,k.seed+bt.rot,{small:1,lw:1.8})}}finally{ctx.restore()}
  ctx.save();try{oFoot(ob3Cam(k.x,k.y),k,k.r,k.seed||1,themeOf(G.room),-1)}finally{ctx.restore()}
  const b=wearBox(k),T=ctx.getTransform(),dx0=Math.floor(T.a*b.x0+T.c*b.y0+T.e),dy0=Math.floor(T.b*b.x0+T.d*b.y0+T.f),w=Math.ceil(b.w*Math.abs(T.a))+2,h=Math.ceil(b.h*Math.abs(T.d))+2;
  if(w<4||h<4||w>2400||h>2400){ob3Model(k,0,{foot:1});return}
  const c=WEAR.c;if(c.width<w)c.width=w;if(c.height<h)c.height=h;const o=c.getContext('2d');o.setTransform(1,0,0,1,0,0);o.globalCompositeOperation='source-over';o.globalAlpha=1;o.clearRect(0,0,w,h);
  o.setTransform(T.a,T.b,T.c,T.d,T.e-dx0,T.f-dy0);const keep=ctx;ctx=o;try{ob3Model(k,0)}finally{ctx=keep}
  const path=()=>{o.beginPath();for(const bt of bites){bt.p.forEach((p,i)=>i?o.lineTo(k.x+p[0],k.y+p[1]):o.moveTo(k.x+p[0],k.y+p[1]));o.closePath()}};
  o.globalAlpha=1;o.globalCompositeOperation='destination-out';path();o.fillStyle='#000';o.fill();
  o.globalCompositeOperation='source-atop';o.lineJoin='round';path();o.strokeStyle=wood?'rgba(235,195,135,.45)':'rgba(0,0,0,.16)';o.lineWidth=9;o.stroke();o.strokeStyle=INK;o.lineWidth=5;o.stroke();
  o.globalCompositeOperation='source-over';ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.drawImage(c,0,0,w,h,dx0,dy0,w,h);ctx.restore();
  ctx.save();try{oFoot(ob3Cam(k.x,k.y),k,k.r,k.seed||1,themeOf(G.room),1)}finally{ctx.restore()}}
// the picture of a still obstacle (model, wear and foot), as big as it is on the canvas, shaded darker at the base and lit from above like the
// others (47), made again only when the wear, the world, the Golem's rage or the canvas changes
function ob3Sprite(k){const th=themeOf(G.room),fl=ob3Fl(k,th),SS=Math.min(3,Math.max(1.5,Math.round(cv.width/VW*2)/2)),st=wearSt(k),key=k.kind+'|'+th+'|'+st+'|'+fl+'|'+SS+(k.kind==='crystal'?'|'+cryLeft(k):'');
  if(k._s3&&k._s3.key===key)return k._s3;
  const r=k.r,H=kH(k)+(k.kind==='frozenstatue'?r*1.2:0),x0=k.x-r*2.8-6,y0=k.y-H-r*2.6-14,w=r*5.6+12,h=H+r*3.9+20,c=k._s3&&k._s3.c||document.createElement('canvas');c.width=Math.ceil(w*SS);c.height=Math.ceil(h*SS);
  const o=c.getContext('2d');o.setTransform(SS,0,0,SS,-x0*SS,-y0*SS);const keep=ctx,hit=k.hit;ctx=o;k.hit=0;try{if(st)ob3Worn(k,st);else ob3Model(k,0,{foot:1})}finally{ctx=keep;k.hit=hit}
  o.setTransform(SS,0,0,SS,-x0*SS,-y0*SS);o.globalCompositeOperation='source-atop';
  let g=o.createLinearGradient(0,k.y+r*.5,0,k.y-Math.min(30,Math.max(10,kH(k)*.55)));g.addColorStop(0,'rgba(12,8,6,.42)');g.addColorStop(1,'rgba(12,8,6,0)');o.fillStyle=g;o.fillRect(x0,y0,w,h);
  g=o.createLinearGradient(0,k.y-kH(k)-r*1.2,0,k.y-kH(k)*.35);g.addColorStop(0,'rgba(255,236,200,.14)');g.addColorStop(1,'rgba(255,236,200,0)');o.fillStyle=g;o.fillRect(x0,y0,w,h);
  o.fillStyle=`rgba(${(G.env&&G.env.light)||'255,200,140'},.05)`;o.fillRect(x0,y0,w,h);o.globalCompositeOperation='source-over';
  return k._s3={key,c,x0,y0,ss:SS}}
// what the bosses of the arena do to an obstacle (as 52 and the Phoenix do over the old drawing): the burning, the heat
function ob3Over(k){if(ctx!==MAINCTX)return;const h=kH(k);
  if(typeof BOSS2!=='undefined'&&BOSS2&&k.burn>0){const t=G.t||0,f=Math.min(1,k.burn/1.2);ctx.save();ctx.globalCompositeOperation='lighter';glow('255,120,40',k.x,k.y-h*.6,k.r*2.2,.45*f);ctx.restore();
    for(let i=-1;i<=1;i++)flame(k.x+i*k.r*.45,k.y-h*(.42+.25*(i===0)),k.r*.034*f*(1+.15*Math.sin(t*12+i*2)),O3FIRE,k.x*.1+i*2)}
  if(typeof PXON!=='undefined'&&PXON&&k.pxHot>(G.t||0)){const f=Math.min(1,(k.pxHot-G.t)/1.2),rgb=k.pxB?'120,190,255':'255,90,40';
    ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,k.x,k.y-h*.5,k.r*2.4,(.45+.1*Math.sin(G.t*14))*f);ctx.fillStyle=`rgba(${rgb},${.35*f})`;ell(k.x,k.y-h*.75,k.r*.9,k.r*.35);ctx.fill();ctx.restore()}}
{const _d=drawRock;
  drawRock=function(k){if(!ob3Use(k))return _d.apply(this,arguments);
    const dx=k.hit>0?Math.sin(G.t*90)*k.hit*14:0;
    if(k._raw){ob3Model(k,0);return}                                    // the bare model: the wear finds its outline in it
    if(k.temp||ctx!==MAINCTX){const f=k.temp?Math.min(1,k.life/.6):1;ctx.save();ctx.globalAlpha*=f;try{const st=wearSt(k);if(st)ob3Worn(k,st);else ob3Model(k,dx,{foot:!k.temp,live:1})}finally{ctx.restore()}ob3Over(k);return}
    const sp=ob3Sprite(k),S=sp.ss;ctx.drawImage(sp.c,Math.round((sp.x0+dx)*S)/S,Math.round(sp.y0*S)/S,sp.c.width/S,sp.c.height/S);
    ob3Live(k,dx);ob3Over(k)}}

// ------------------------------------------------------------------ the other things of the room in 3D: what you pick up (coins, crystals, the
// green orbs, hearts), the fountain, the altar and the treasure chest of the event rooms, the rocks and anvils the bosses throw, the bands of
// thorns. Each at its own foot with the same camera; on a slow phone (LOWFX) the coins, crystals and orbs keep their pictures
const o3K=(x,y,f)=>proCam(f==null?OB3.face:f,x,y,1);
// a coin of gold spinning on its edge: two faces, the rim between them, a star of light on the face we see (also the course's coins in 94)
function o3Coin(x,y,sp,s,z){ctx.save();const K=o3K(x,y),{V0}=K,n=[Math.cos(sp),Math.sin(sp),0],c=[0,0,(z||6.5)*s],r=5.8*s,th=1.1*s,f=V0.F(n)>=0?1:-1;
  const A=C3.disc3(V0,[c[0]-n[0]*th,c[1]-n[1]*th,c[2]],n,r,{N:16}),B=C3.disc3(V0,[c[0]+n[0]*th,c[1]+n[1]*th,c[2]],n,r,{N:16}),H=C3.chull(A.concat(B));
  C3.poly(H);ctx.fillStyle='#b07a1a';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.lineJoin='round';ctx.stroke();
  const F=f>0?B:A;C3.poly(F);const b=C3.bbox(F),g=ctx.createLinearGradient(b[0],b[1],b[2],b[3]);g.addColorStop(0,'#fff0a0');g.addColorStop(.5,'#ffd84a');g.addColorStop(1,'#d89a20');ctx.fillStyle=g;ctx.fill();
  const q=[c[0]+n[0]*th*f*1.05,c[1]+n[1]*th*f*1.05,c[2]];C3.spot(V0,q,[n[0]*f,n[1]*f,0],r*.55,'rgba(176,122,26,.55)');C3.spot(V0,[q[0],q[1],q[2]+.4],[n[0]*f,n[1]*f,0],r*.3,'rgba(255,248,210,.85)');ctx.restore()}
// a crystal: a blue bipyramid turning slowly (its glow and twinkle stay the game's)
function o3Gem(x,y,s,a,sp){ctx.save();if(a!=null)ctx.globalAlpha*=a;const K=o3K(x,y+6*s),{V0}=K,cf=n=>n[1]>.3?'#d8f6ff':n[1]<-.3?'#3a6ad8':n[2]>0?'#7fd0ff':'#4f8ae8';
  oPrism(K,[0,0,1.5*s],6,4.6*s,.1,'#6fb8f0',{a:sp,tip:-1,lw:1.4,ew:.4,cf,rt:4.6*s});oPrism(K,[0,0,1.5*s],6,4.6*s,.1,'#6fb8f0',{a:sp,tip:7*s,lw:1.4,ew:.4,cf});
  const p=V0.P([0,0,1.5*s]);ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p[0]-2*s,p[1]-1*s);ctx.lineTo(p[0]-.6*s,p[1]-6*s);ctx.stroke();ctx.restore()}
// a green orb of experience: a little octahedron spinning in its glow
function o3Orb(x,y,sp){ctx.save();const K=o3K(x,y+4),{V0}=K,cf=n=>n[1]>.3?'#c8ffe0':n[1]<-.3?'#2fa868':'#6ff0a8';
  const A=[0,0,7.5],B=[0,0,.5],R=[];for(let i=0;i<4;i++){const t=sp+i*Math.PI/2;R.push([Math.cos(t)*3.3,Math.sin(t)*3.3,4])}const F=[];
  for(let i=0;i<4;i++){const j=(i+1)%4,t=sp+(i+.5)*Math.PI/2;F.push([C3.nrm([Math.cos(t),Math.sin(t),.8]),[R[i],R[j],A]],[C3.nrm([Math.cos(t),Math.sin(t),-.8]),[R[j],R[i],B]])}
  oFaces(K,F,'#6ff0a8',{lw:1.2,ew:.3,cf});ctx.restore()}
// a heart: a thick heart of red turning slowly
const O3HEART=(()=>{const p=[];for(let i=0;i<=24;i++){const t=i/24*TAU,x=16*Math.pow(Math.sin(t),3),y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);p.push([x*.42,y*.42+7])}return p.reverse()})();
function o3Heart(x,y,sp){ctx.save();const K=o3K(x,y,OB3.face+sp),{V0}=K;oExtrude(K,[0,0,3],O3HEART,3.4,'#e5484d',{lw:1.6,ew:.4,cf:n=>Math.abs(n[0])>.9?'#f06a6a':'#b02a30'});ctx.restore()}
{const _o=drawOrbs;
  drawOrbs=function(){if(!OB3.on||LOWFX||ctx!==MAINCTX||!G)return _o.apply(this,arguments);
    try{if(OB3.hold){G.coins=OB3.hold[0];G.hearts=OB3.hold[1];OB3.hold=null}
      // what the others draw on the floor at this moment (the Classica nuova's traps and marks) without the old orbs
      const ko=G.orbs;G.orbs=[];try{_o.apply(this,arguments)}finally{G.orbs=ko}
      for(const o of G.orbs){const b=Math.sin(G.t*5+o.ph)*1.5;glow('120,255,170',o.x,o.y-3+b,9,.5);o3Orb(o.x,o.y+b,G.t*2+o.ph)}
      for(const c of G.coins){ctx.fillStyle='rgba(0,0,0,.25)';ell(c.x,c.y+5,4.5,1.6);ctx.fill();o3Coin(c.x,c.y+4,G.t*3.2+c.x*.37+c.y*.11,1)}
      for(const h of G.hearts){ctx.fillStyle='rgba(0,0,0,.25)';ell(h.x,h.y+5,6,2);ctx.fill();o3Heart(h.x,h.y+4+Math.sin(G.t*4+h.x)*2,G.t*1.6+h.x)}
      // the render draws the coins and hearts again right after: it gets empty lists, given back at the wall (or at the next frame)
      OB3.hold=[G.coins,G.hearts];G.coins=[];G.hearts=[]}catch(err){if(OB3.hold){G.coins=OB3.hold[0];G.hearts=OB3.hold[1];OB3.hold=null}console.error(err);return _o.apply(this,arguments)}}}
{const _w=drawWallBack;drawWallBack=function(){if(OB3.hold){G.coins=OB3.hold[0];G.hearts=OB3.hold[1];OB3.hold=null}return _w.apply(this,arguments)}}
{const _g=drawGem;drawGem=function(x,y,s,a){if(!OB3.on||LOWFX||ctx!==MAINCTX)return _g.apply(this,arguments);try{o3Gem(x,y,s||1,a,(G.t||0)*1.4+x*.05)}catch(err){_g.apply(this,arguments)}}}
// ------------------------------------------------------------------ the fountain of life (Denis: «migliora la fontana della vita»): a fountain in
// two tiers of pale stone with gilded bands, carved flutes on its basin and a vine round its pedestal; the water of life, aquamarine and
// glowing, falls from a scalloped bowl in eight threads onto the basin with little splashes, and on top a stone bud holds the seed of life,
// a light that breathes and pours four little arcs of water into the bowl; motes of light rise from the water. When you drink, a column of
// light, the water drains (1.4 s) and the seed goes out. The same fountain, smaller, is the tower's spring. On a slow phone (LOWFX) fewer
// motes, no glints, the threads behind and the splashes left out.
const FN={st:'#ab9b7d',lt:'#d2c3a1',dk:'#83765e',ft:'#7a6e58',gold:'#e8bd4c',gl:'#f7dc84',moss:'#5f9e3c',wd:'#0f7584',wm:'#24adaa',wh:'#86f2dc',wE:'#2b4247',vine:'#3f7f30',leaf:'#76c456',cache:new Map()};
const fnMix=(a,b,k)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),c=(x,y)=>Math.round(x+(y-x)*k);
  return`rgb(${c(A>>16,B>>16)},${c(A>>8&255,B>>8&255)},${c(A&255,B&255)})`};
// how full it is: 1 full, 0 drained (p.fnT: the time it was drunk)
const fnFull=p=>!p.used?1:p.fnT==null?0:clamp(1-((G.t||0)-p.fnT)/1.4,0,1);
// the side of a ring that faces us (from the azimuth that faces the camera, half a turn round)
const fnFront=(V0,r,z,n)=>{const a0=oFront(V0),pts=[];for(let i=0;i<=n;i++){const a=a0-Math.PI/2+i/n*Math.PI;pts.push([Math.cos(a)*r,Math.sin(a)*r,z])}return pts};
// a gilded band round the front of a ring
function fnBand(V0,r,z,lw){const pts=fnFront(V0,r,z,28).map(q=>V0.P(q));ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=lw+1.6;C3.line(pts);ctx.stroke();ctx.strokeStyle=FN.gold;ctx.lineWidth=lw;C3.line(pts);ctx.stroke();
  ctx.strokeStyle='rgba(255,246,205,.75)';ctx.lineWidth=lw*.35;C3.line(pts.map(q=>[q[0],q[1]-lw*.3]));ctx.stroke()}
// a water surface (a disc at z): deep at the rim, light in the middle, the shade of the rim on it, the sky in it, ripples, glints, its glow
function fnWater(V0,r,z,full,t,o){o=o||{};const c=V0.P([0,0,z]);C3.disc3(V0,[0,0,z],[0,0,1],r,{N:28});
  const g=ctx.createRadialGradient(c[0]-r*.12,c[1]-r*.1,1,c[0],c[1],r*1.02);g.addColorStop(0,fnMix(FN.wh,FN.wE,1-full));g.addColorStop(.5,fnMix(FN.wm,FN.wE,1-full));g.addColorStop(1,fnMix(FN.wd,FN.wE,1-full));
  ctx.fillStyle=g;ctx.fill();ctx.save();C3.disc3(V0,[0,0,z],[0,0,1],r,{N:28});ctx.clip();
  ctx.strokeStyle='rgba(0,30,40,.35)';ctx.lineWidth=r*.12;C3.disc3(V0,[0,0,z],[0,0,1],r,{N:28});ctx.stroke();
  if(full>.02){ctx.strokeStyle=`rgba(230,255,250,${(.3*full).toFixed(3)})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(c[0],c[1]-r*.24,r*.62,r*.14,0,Math.PI*1.12,Math.PI*1.88);ctx.stroke();
    ctx.lineWidth=1;for(let k=0;k<3;k++){const q=((t*.45+k/3)%1),rr=q*r*.92+1;ctx.strokeStyle=`rgba(225,255,248,${(.36*(1-q)*full).toFixed(3)})`;C3.disc3(V0,[0,0,z+.05],[0,0,1],rr,{N:22});ctx.stroke()}
    if(!LOWFX)for(let k=0;k<3;k++){const a=t*.35+k*2.1,rr=r*(.35+.22*k),q=V0.P([Math.cos(a)*rr,Math.sin(a)*rr,z+.1]),w=2.2+k*.8;ctx.strokeStyle=`rgba(255,255,255,${(.6*full*(.6+.4*Math.sin(t*2.3+k))).toFixed(3)})`;
      ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(q[0],q[1],w,w*.3,0,Math.PI*1.1,Math.PI*1.9);ctx.stroke()}}
  ctx.restore();if(full>.02){ctx.save();ctx.globalCompositeOperation='lighter';glow('110,250,215',c[0],c[1],r*1.15,(.14+.05*Math.sin(t*2.2+(o.ph||0)))*full);ctx.restore()}}
// a thread of water: out over the bowl's lip, then falling onto the basin, a gleam running down it
function fnThread(V0,a,full,t,k){const ca=Math.cos(a),sa=Math.sin(a),pts=[];for(let j=0;j<=9;j++){const u=j/9,r=17.6+4.4*Math.sqrt(u),z=29.4-16.8*u*u;pts.push(V0.P([ca*r,sa*r,z]))}
  ctx.lineCap='round';ctx.strokeStyle=`rgba(25,140,150,${(.5*full).toFixed(3)})`;ctx.lineWidth=2.3;C3.line(pts);ctx.stroke();ctx.strokeStyle=`rgba(170,255,238,${(.75*full).toFixed(3)})`;ctx.lineWidth=1.1;C3.line(pts);ctx.stroke();
  if(!LOWFX){const q=(t*1.6+k*.37)%1,i0=Math.min(7,Math.floor(q*8));ctx.strokeStyle=`rgba(255,255,255,${(.9*full).toFixed(3)})`;ctx.lineWidth=1;C3.line(pts.slice(i0,i0+3));ctx.stroke()}}
// the stone parts, painted once (for each size of the canvas) and copied: the basin; the pedestal with its vine and the bowl; the lotus bud
const FN_BOX=[[-40,-38,80,63],[-21,-45,42,41],[-14,-52,28,29]];
function fnStone(K,id){const{V0}=K,a0=oFront(V0);
  if(id===0){
    // the plinth, the fluted basin with its gilded band and moss at the foot, the lip, the inner wall
    pRound(K,[0,0,0],[[0,35.8],[1.6,35.4],[2.3,34.2]],FN.ft,{m:30,lw:2.4,kl:.2,kd:.5,rim:.2});
    pRound(K,[0,0,1.6],[[0,33.8],[1.4,32],[8.4,31.8],[10,33.6],[11.9,34.4]],FN.st,{m:30,lw:2.4,kl:.22,kd:.52,rim:.28});
    for(let i=0;i<9;i++){const a=a0-1.25+i/8*2.5,ca=Math.cos(a),sa=Math.sin(a);oGroove(V0,[[ca*32.1,sa*32.1,4.2],[ca*32.1,sa*32.1,9.8]],.42,1.8)}
    fnBand(V0,32,3.1,1.6);
    for(const[da,n] of[[-.85,3],[.35,2],[1.05,3]]){const a=a0+da;for(let k=0;k<n;k++){const b=a+(k-(n-1)/2)*.06,q=[Math.cos(b)*35,Math.sin(b)*35,1.8];
      C3.leaf(V0,q,[Math.cos(b)*.5,Math.sin(b)*.5,1],[-Math.sin(b),Math.cos(b),0],3+(k%2)*1.6,1.6,k%2?FN.moss:FN.leaf,{lw:.8,bend:.3})}}
    C3.disc3(V0,[0,0,13.5],[0,0,1],34.4,{N:30});ctx.fillStyle=FN.lt;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke();
    C3.disc3(V0,[0,0,13.55],[0,0,1],29.8,{N:30});ctx.fillStyle=FN.dk;ctx.fill();ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;ctx.stroke();return}
  if(id===1){
    // the pedestal with a ring of moulding and a vine, the deep scalloped bowl with its gilded band
    pRound(K,[0,0,12],[[0,7.4],[1.6,6.2],[6,5],[9.5,5.2],[11,6.8]],FN.st,{m:20,lw:2.1,kl:.24,kd:.5,rim:.3});
    const pts=[];for(let i=0;i<=30;i++){const u=i/30,a=a0-.9+u*2.2,z=13+u*8.6,r=5.1+Math.max(0,(z-20.5)*1.3);pts.push(V0.P([Math.cos(a)*(r+.3),Math.sin(a)*(r+.3),z]))}
    ctx.lineCap='round';ctx.strokeStyle='rgba(20,40,15,.6)';ctx.lineWidth=2;C3.line(pts);ctx.stroke();ctx.strokeStyle=FN.vine;ctx.lineWidth=1.1;C3.line(pts);ctx.stroke();
    for(const[u,sd] of[[.22,1],[.52,-1],[.82,1]]){const a=a0-.9+u*2.2,z=13+u*8.6,r=5.3+Math.max(0,(z-20.5)*1.3),q=[Math.cos(a)*r,Math.sin(a)*r,z];
      C3.leaf(V0,q,[Math.cos(a+sd*.9),Math.sin(a+sd*.9),.45],[0,0,1],3.8,1.9,FN.leaf,{lw:.8})}
    pRound(K,[0,0,21],[[0,6.8],[2.4,10.6],[5.4,15],[7.4,17.2],[8.8,17.6]],FN.st,{m:26,lw:2.1,kl:.24,kd:.5,rim:.32});fnBand(V0,16.6,27.9,1.3);
    const rim=[];for(let i=0;i<48;i++){const a=i/48*TAU,r=17.4+1*Math.cos(a*8-Math.PI);rim.push(V0.P([Math.cos(a)*r,Math.sin(a)*r,29.8]))}C3.poly(rim);ctx.fillStyle=FN.lt;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
    C3.disc3(V0,[0,0,29.85],[0,0,1],14.6,{N:26});ctx.fillStyle=FN.dk;ctx.fill();return}
  // the golden lotus: a short neck, six open petals and four closed round the seed (the seed is drawn live), back petals first
  pRound(K,[0,0,29.6],[[0,4.4],[1.6,3.1],[3.6,3.4]],FN.st,{m:16,lw:1.8,kl:.24,kd:.5,rim:.3});
  const pet=(a,len,wid,up,col)=>{const d=[Math.cos(a)*(1-up),Math.sin(a)*(1-up),up*1.6];C3.leaf(V0,[Math.cos(a)*2.4,Math.sin(a)*2.4,33.2],d,[-Math.sin(a),Math.cos(a),0],len,wid,col,{lw:1.3,bend:.35})};
  const P6=[0,1,2,3,4,5].map(k=>k/6*TAU+.25).sort((x,y)=>Math.cos(x-a0)-Math.cos(y-a0)),P4=[0,1,2,3].map(k=>k/4*TAU+.65).sort((x,y)=>Math.cos(x-a0)-Math.cos(y-a0));
  for(const a of P6)if(Math.cos(a-a0)<0)pet(a,8,4.2,.42,FN.gold);
  for(const a of P4)pet(a,5.6,3.1,.78,FN.gl);
  for(const a of P6)if(Math.cos(a-a0)>=0)pet(a,8,4.2,.42,FN.gold)}
function fnCached(K,id,S){const SS=Math.min(3,Math.max(1.5,Math.round(cv.width/VW*2)/2))*S,key=id+'|'+SS.toFixed(2);let c=FN.cache.get(key);const B=FN_BOX[id];
  if(!c){c=document.createElement('canvas');c.width=Math.ceil(B[2]*SS);c.height=Math.ceil(B[3]*SS);const o=c.getContext('2d'),keep=ctx;ctx=o;o.setTransform(SS,0,0,SS,-B[0]*SS,-B[1]*SS);
    try{fnStone(K,id)}finally{ctx=keep}FN.cache.set(key,c)}
  ctx.drawImage(c,B[0],B[1],B[2],B[3])}
function fnDraw(K,p,t,S){const{V0}=K,full=fnFull(p),lo=LOWFX,a0=oFront(V0);if(S!==1)ctx.scale(S,S);
  const live=ctx!==MAINCTX,st=id=>live?fnStone(K,id):fnCached(K,id,S);
  st(0);const wz=plerp(9.8,12.6,full);fnWater(V0,plerp(28.3,29.4,full),wz,full,t,{ph:0});
  // the splashes where the threads fall
  const th=[];for(let k=0;k<6;k++){const a=k/6*TAU+.5;th.push({a,k,front:Math.cos(a-a0)>=0})}
  if(full>.05&&!lo)for(const h of th){const q=(t*1.9+h.k*.29)%1,c=[Math.cos(h.a)*22,Math.sin(h.a)*22,wz+.2];ctx.strokeStyle=`rgba(230,255,250,${(.65*(1-q)*full).toFixed(3)})`;ctx.lineWidth=1;C3.disc3(V0,c,[0,0,1],1+q*3.4,{N:12});ctx.stroke()}
  // the threads behind, the pedestal and the bowl, the bowl's water, the threads in front
  if(full>.02&&!lo)for(const h of th)if(!h.front)fnThread(V0,h.a,full,t,h.k);
  st(1);fnWater(V0,14.3,plerp(27.9,29.45,full),full,t,{ph:1.3});
  if(full>.02)for(const h of th)if(h.front)fnThread(V0,h.a,full,t,h.k);
  // the seed of life in the bud, breathing light, and four little arcs of water from it into the bowl
  const arcs=[];for(let k=0;k<4;k++){const a=k/4*TAU+.4;arcs.push({a,k,front:Math.cos(a-a0)>=0})}
  const arc=h=>{const ca=Math.cos(h.a),sa=Math.sin(h.a),pts=[];for(let j=0;j<=10;j++){const u=j/10,r=1.6+u*11.6,z=40.6-u*11+5.4*4*u*(1-u);pts.push(V0.P([ca*r,sa*r,z]))}
    ctx.lineCap='round';ctx.strokeStyle=`rgba(25,140,150,${(.45*full).toFixed(3)})`;ctx.lineWidth=2;C3.line(pts);ctx.stroke();ctx.strokeStyle=`rgba(170,255,238,${(.85*full).toFixed(3)})`;ctx.lineWidth=1;C3.line(pts);ctx.stroke();
    ctx.fillStyle=`rgba(245,255,252,${full.toFixed(3)})`;const q=(t*1.6+h.k*.25)%1,i=Math.min(9,Math.floor(q*10));ctx.beginPath();ctx.arc(pts[i][0],pts[i][1],1.2,0,TAU);ctx.fill()};
  if(full>.02)for(const h of arcs)if(!h.front)arc(h);
  st(2);const sz=37.4+Math.sin(t*1.6)*.45;C3.sball(V0,[0,0,sz],3.6,fnMix('#e4fff0','#7d8a86',1-full),{lw:1.4,kl:.6,kd:.28,rim:.4});
  if(full>.02)for(const h of arcs)if(h.front)arc(h);
  if(full>.02){const q=V0.P([0,0,sz]);ctx.save();ctx.globalCompositeOperation='lighter';glow('170,255,215',q[0],q[1],13+2*Math.sin(t*2.4),(.5+.18*Math.sin(t*2.4))*full);glow('230,255,240',q[0],q[1],4.5,.7*full);
    // motes of light rising from the water
    const n=lo?2:5;for(let i=0;i<n;i++){const u=(t/3.4+i/n)%1,a=i*2.4+t*.25,r=9+((i*.37)%1)*14,z=14+u*46,m=V0.P([Math.cos(a)*r,Math.sin(a)*r,z]),al=Math.sin(u*Math.PI)*full,mx=m[0]+Math.sin(t*2+i)*2;
      glow('160,255,205',mx,m[1],5.5,.5*al);ctx.fillStyle=`rgba(240,255,245,${(.9*al).toFixed(3)})`;ctx.fillRect(mx-.8,m[1]-.8,1.6,1.6)}
    ctx.restore()}}
// the fountain, the altar and the treasure of the event rooms (the merchant is the 3D one of 64)
OB3.P={
  fontana:(K,p,t)=>fnDraw(K,p,t,1),
  altare:(K,p,t)=>{const{V0}=K;oBox(K,[0,0,0],22,52,24,'#3a3440',{lw:2.4,cf:n=>n[2]>.5?'#4a4252':'#3a3440',face:(n,q)=>{if(n[0]<.5)return;const M=oMap(V0,...oCorners(V0,q));ctx.strokeStyle=p.used?'rgba(140,90,180,.3)':'rgba(190,120,255,.85)';ctx.lineWidth=2;ctx.lineCap='round';
      for(const u of[.23,.5,.77]){C3.line([M(u-.08,.75),M(u,.33),M(u+.08,.75)]);ctx.stroke()}}});
    oBox(K,[0,0,24],26,60,6,'#4a4252',{lw:2.2,cf:n=>n[2]>.5?'#5a5266':'#4a4252'});
    for(const s of[-1,1]){const c=OQ(s*34,2,5);C3.sball(V0,c,5,'#e0d9c4',{lw:1.5,kl:.35,kd:.35});const af=oFront(V0);for(const e of[-1,1])C3.spot(V0,[c[0]+Math.cos(af)*4.3-Math.sin(af)*e*1.8,c[1]+Math.sin(af)*4.3+Math.cos(af)*e*1.8,c[2]+.6],[Math.cos(af),Math.sin(af),.1],1.2,INK)}
    if(!p.used){const q=V0.P([0,0,30]);flame(q[0],q[1],1.3,['#7a2fd0','#c07aff','#f4e6ff'],1)}},
  tesoro:(K,p,t)=>{const{V0}=K,open=p.used,face=(n,q)=>{if(Math.abs(n[2])>.5)return;const M=oMap(V0,...oCorners(V0,q));for(const u of[.25,.75])oFill([M(u-.05,0),M(u+.05,0),M(u+.05,1),M(u-.05,1)],'#ffe08a',1)};
    oBox(K,[0,0,0],28,48,22,'#b0791c',{lw:2.4,cf:n=>n[2]>.5?'#c88a24':'#b0791c',face});
    if(open){C3.disc3(V0,[0,0,22.2],[0,0,1],13,{N:18});ctx.fillStyle='#ffd84a';ctx.fill();const lid=[];for(let i=0;i<=8;i++){const a=i/8*Math.PI;lid.push([Math.cos(a)*14,Math.sin(a)*12])}
      oExtrude(K,[-14-6,0,22],lid.map(([u,z])=>[u*.5,z+6]),48,'#8a5a10',{a:Math.PI/2,lw:2.2,cf:n=>'#8a5a10'})}
    else{const lid=[[-14,0],[14,0]];for(let i=1;i<8;i++){const a=i/8*Math.PI;lid.push([Math.cos(a)*14,Math.sin(a)*10])}
      oExtrude(K,[0,0,22],lid,48,'#8a5a10',{a:Math.PI/2,lw:2.4,cf:n=>n[2]>.3?'#a06a14':'#8a5a10'});oBox(K,[14.5,0,15],2,10,10,'#e5484d',{lw:1.4});
      const q=V0.P([0,0,20]);glow('255,210,90',q[0],q[1],40,.25+.1*Math.sin(t*3))}}};
{const _p=drawProp;drawProp=function(p){const f=OB3.on&&OB3.P[p.kind];if(!f)return _p.apply(this,arguments);
  ctx.save();try{f(o3K(p.x,p.y),p,G.t||0)}catch(err){ctx.restore();OB3.P[p.kind]=null;console.error(err);return _p.apply(this,arguments)}ctx.restore();
  if(!p.used){ctx.font='13px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=INK;const t=EVENTS[p.kind].n;ctx.strokeText(t,p.x,p.y+30);ctx.fillStyle='#f6ead2';ctx.fillText(t,p.x,p.y+30)}}}
// the rocks and anvils the bosses throw: the rock tumbling in 3D, the anvil turning, their shadow growing as they come down
{const _b=drawBoulders;drawBoulders=function(){if(!OB3.on||!G||!G.boulders.length)return _b.apply(this,arguments);const keep=G.boulders;
  try{for(const b of keep){if(b.t<0)continue;const p=clamp(b.t/b.dur,0,1),x=b.sx+(b.tx-b.sx)*p,gy=b.sy+(b.ty-b.sy)*p,h=Math.sin(p*Math.PI)*90;shadow(x,gy+6,10*(.6+p*.4),4);
    ctx.save();if(b.kind==='anvil'){const K=o3K(x,gy-h+6,OB3.face+p*7);OM.anvil(K,{},15,14,3,stonePal(),'forgia');glow('255,140,60',x,gy-h,16,.35)}
    else{const K=o3K(x,gy-h+8,OB3.face+p*9);oRock(K,[0,0,-6],11,10,14,'#857b6c',b.sx*.1,{lw:2.2})}ctx.restore()}
    G.boulders=[];_b.apply(this,arguments)}finally{G.boulders=keep}}}
// the bands of thorns that come out of the floor: cones of thorn and root, each lit on one side
{const _h=drawHazardsGround;drawHazardsGround=function(){if(!OB3.on||!G)return _h.apply(this,arguments);const keep=G.bands,kz=G.zones,act=keep.filter(b=>b.style!=='ice'&&!(b.warn>0)),fz=kz.filter(z=>z.kind==='fire'&&!z.pxb);
  if(!act.length&&!fz.length)return _h.apply(this,arguments);G.bands=keep.filter(b=>!act.includes(b));G.zones=kz.filter(z=>!fz.includes(z));try{_h.apply(this,arguments)}finally{G.bands=keep;G.zones=kz}
  // the fire on the floor: the scorched round, its dashed edge, then little flames of the new fire dancing on it
  for(const z of fz){const a=Math.min(1,z.t/.4)*Math.min(1,(z.max-z.t)/.3+.2),b=Math.min(1,z.t/.4);ctx.fillStyle=`rgba(255,90,20,${.28*a})`;circ(z.x,z.y,z.r);ctx.fill();
    ctx.strokeStyle=`rgba(255,170,70,${.5*a})`;ctx.lineWidth=2;ctx.setLineDash([4,5]);circ(z.x,z.y,z.r);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=`rgba(60,20,8,${.3*a})`;ctx.beginPath();ctx.ellipse(z.x,z.y+2,z.r*.7,z.r*.36,0,0,TAU);ctx.fill();
    const n=LOWFX?2:4;for(let i=0;i<n;i++){const an=i*1.7+z.x*.1,rr=z.r*.5*((i%2)+.4);flame(z.x+Math.cos(an)*rr,z.y+Math.sin(an)*rr*.6+4,.42*b*(.85+.15*Math.sin(G.t*3+i)),O3FIRE,z.x*.07+i*1.9)}}
  for(const b of act){const rect=b.h?[L,b.pos-b.w/2,R-L,b.w]:[b.pos-b.w/2,TOP,b.w,BOT-TOP];ctx.fillStyle='rgba(60,40,25,.45)';ctx.fillRect(...rect);const len=b.h?R-L:BOT-TOP,sc=Math.min(1,(.45-b.act)/.08+.3);
    for(let s=8;s<len;s+=13){const cx=b.h?L+s:b.pos+((s*7)%9-4),cy=b.h?b.pos+((s*7)%9-4):TOP+s,hh=16*sc,col=s%26<13?'#5f9e3c':'#7a5a3a';
      ctx.beginPath();ctx.moveTo(cx-5,cy+6);ctx.lineTo(cx,cy+6-hh);ctx.lineTo(cx+5,cy+6);ctx.quadraticCurveTo(cx,cy+8.5,cx-5,cy+6);ctx.closePath();ctx.fillStyle=C3.dk(col,.3);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.lineJoin='round';ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx-5,cy+6);ctx.lineTo(cx,cy+6-hh);ctx.lineTo(cx+.6,cy+7.6);ctx.quadraticCurveTo(cx-3,cy+7.4,cx-5,cy+6);ctx.closePath();ctx.fillStyle=C3.lt(col,.12);ctx.fill()}}}}
// the twin chests (one is a Mimic), when the new Mimic's 3D chest is not there: a chest of wood with two bands of brass, a round lid that opens backward on its hinge, the lock; the
// Mimic shows red eyes and teeth in the slit as it shakes. The "?" over them stays the game's
{const _t=drawTwinChest;drawTwinChest=function(c){if(!OB3.on||typeof MM2ON!=='undefined'&&MM2ON&&N3.mimicChest)return _t.apply(this,arguments);   // the Mimic's own 3D chest (89) firstconst drop=c.st==='drop'?Math.max(0,1-c.t/.55):0,h=drop*drop*260;if(c.t<0)return;
  const sh=c.st==='shake'?Math.sin(c.k*(30+c.k*30))*(1+c.k*3):0,sq=c.st==='poof'?Math.max(0,1-c.k/.5):1,open=c.st==='open'?Math.min(1,c.k/.35):0,grow=c.st==='shake'?1+c.k*.12:1,k=c.st==='shake'?Math.min(1,c.k/.8):0;
  if(drop<1)shadow(c.x,c.y+6,22*(1-drop*.6),7,.35);if(sq<=.01)return _t.call(this,{...c,t:-1});
  ctx.save();try{const K=proCam(OB3.face,c.x+sh,c.y-h+4,sq*grow*1.35),{V0}=K,wood='#7a4e2a',band='#d9a640',D=15,W=36,H=16,
      bands=(n,q)=>{if(Math.abs(n[2])>.5)return;const M=oMap(V0,...oCorners(V0,q));for(const u of[.16,.84])oFill([M(u-.05,0),M(u+.05,0),M(u+.05,1),M(u-.05,1)],band,1)};
    oBox(K,[0,0,0],D,W,H,wood,{lw:2.2,cf:n=>n[2]>.5?'#8a5e36':wood,face:bands});
    if(open>0){C3.disc3(V0,[0,0,H+.2],[0,0,1],D*.42,{N:16});ctx.fillStyle='#ffe08a';ctx.fill();const q=V0.P([0,0,H+4]);ctx.save();ctx.globalCompositeOperation='lighter';glow('255,215,90',q[0],q[1],40,.6*open);ctx.restore()}
    if(k>0){const fr=V0.P([D/2,0,H]);ctx.fillStyle=`rgba(229,48,26,${k})`;for(const e of[-6,6]){ctx.beginPath();ctx.ellipse(fr[0]+e,fr[1]-.5,2.4,1.4*k+.2,0,0,TAU);ctx.fill()}
      ctx.fillStyle='#f4ecd8';for(let i=0;i<5;i++){const a=V0.P([D/2+.3,-14+i*7,H]),b=V0.P([D/2+.3,-11.5+i*7,H-3*k]),e=V0.P([D/2+.3,-9+i*7,H]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(e[0],e[1]);ctx.fill()}}
    // the lid: a half round of wood across the chest, turned back on its hinge as it opens
    const ang=-open*1.9,hu=-D/2,lid=[[-D/2,0],[D/2,0]];for(let i=1;i<8;i++){const a=i/8*Math.PI;lid.push([Math.cos(a)*D/2,Math.sin(a)*D*.48])}
    const rl=lid.map(([u,z])=>{const du=u-hu,ca=Math.cos(ang),sa=Math.sin(ang);return[hu+du*ca-z*sa,du*sa+z*ca]});
    oExtrude(K,[0,0,H],rl,W,wood,{a:Math.PI/2,lw:2.2,cf:n=>n[2]>.3?'#8a5e36':wood,face:bands});
    if(open<.1)oBox(K,[D/2+.6,0,H-4],1.6,7,7,band,{lw:1.4})}catch(err){console.error(err)}finally{ctx.restore()}
  if(c.st==='idle'&&G.state==='cleared'&&!G.ccChosen){const b=Math.sin(G.t*5)*3;glow('255,215,90',c.x,c.y-10,34,.25+.1*Math.sin(G.t*4));ctx.fillStyle='#ffc93c';ink(2.5);ctx.beginPath();ctx.moveTo(c.x,c.y-34+b);ctx.lineTo(c.x-7,c.y-44+b);ctx.lineTo(c.x+7,c.y-44+b);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.font='13px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.strokeText('?',c.x,c.y-48+b);ctx.fillStyle='#fff';ctx.fillText('?',c.x,c.y-48+b)}}}

// ------------------------------------------------------------------ the fire, a little better everywhere (Denis: «migliorare leggermente l'effetto del fuoco in generale»):
// the game's flame (torches, braziers, the altar) with two side tongues that lick up on their own, a white-hot heart at the base, a lick
// of flame that breaks off the tip and rises, and sparks that drift up and fade (one on a slow phone); the same colours and size as before.
// Made of it: the fire on the floor, the burning obstacles, the burning enemies (two little flames on their shoulders)
const O3FIRE=['#ff6a1a','#ffb030','#fff0a0'];
{const _fl=flame;flame=function(x,y,s,cols,ph){if(!OB3.on||!cols||cols.length<3||cols.some(c=>typeof c!=='string'||c.length!==7))return _fl.apply(this,arguments);ph=ph||0;   // hexA (09): #rrggbb + alpha
  const t=G.t||0,n=k=>Math.sin(t*11+k+ph)*.5+Math.sin(t*17.3+k*2+ph)*.3+Math.sin(t*5.1+k*3)*.2;
  ctx.save();ctx.globalCompositeOperation='lighter';
  glow(hexRgb(cols[1]),x,y-8*s,30*s*(1+.08*n(9)),.5);if(!LOWFX)glow(hexRgb(cols[2]),x,y-3*s,11*s,.3);
  const tongue=(dx,w,h,col,k)=>{const bx=x+dx*s,tip=n(k)*3.2*s+dx*s*.6,hh=h*s*(1+.2*n(k+1));ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(bx-w*s,y);
    ctx.bezierCurveTo(bx-w*s*1.15,y-hh*.42,bx+tip-w*s*.32,y-hh*.74,bx+tip,y-hh);ctx.bezierCurveTo(bx+tip+w*s*.32,y-hh*.74,bx+w*s*1.15,y-hh*.42,bx+w*s,y);ctx.closePath();ctx.fill()};
  const sl=.5+.5*Math.max(0,Math.sin(t*7.3+ph)),sr=.5+.5*Math.max(0,Math.sin(t*6.1+ph+2.1));
  tongue(-4.2,3.6,15*sl,hexA(cols[0],.7),11);tongue(4.2,3.6,14*sr,hexA(cols[0],.7),13);
  tongue(0,7,25,hexA(cols[0],.87),1);tongue(0,5.2,18,hexA(cols[1],.93),4);tongue(0,2.8,10.5,cols[2],7);
  ctx.fillStyle='rgba(255,252,236,.45)';ctx.beginPath();ctx.ellipse(x,y-4.2*s,2.2*s,3.4*s,0,0,TAU);ctx.fill();
  {const u=(t*1.7+ph*.37)%1,lx=x+n(5)*2*s,ly=y-(20+u*16)*s,lw=(2.4-u*1.8)*s,lh=(6-u*3)*s;ctx.fillStyle=hexA(cols[1],(1-u)*.8);ctx.beginPath();ctx.moveTo(lx-lw,ly);
    ctx.quadraticCurveTo(lx-lw*.6,ly-lh*.6,lx,ly-lh);ctx.quadraticCurveTo(lx+lw*.6,ly-lh*.6,lx+lw,ly);ctx.quadraticCurveTo(lx,ly+lw*.8,lx-lw,ly);ctx.fill()}
  const N=LOWFX?1:3;for(let i=0;i<N;i++){const u=(t*(.9+i*.23)+i*.31+ph*.17)%1,ex=x+(Math.sin(t*2.7+i*2.3+ph)*3+(i%2?1:-1)*u*5)*s,ey=y-(14+u*30)*s,sz=(1.7-u)*s;if(sz<=.25)continue;
    ctx.fillStyle=u<.45?hexA(cols[2],1-u):hexA(cols[1],(1-u)*.9);ctx.fillRect(ex-sz/2,ey-sz/2,sz,sz)}
  ctx.restore()}}
{const _de=drawEnemy;drawEnemy=function(e){const r=_de.apply(this,arguments);try{if(OB3.on&&e&&e.burn>0&&!e.dead&&!(e.spawn>0)&&ctx===MAINCTX){const k=Math.min(1,e.burn/.6),h=e.r*1.15+(e.z||0);
    for(const sd of[-1,1])flame(e.x+sd*e.r*.42,e.y-h*(sd>0?1:.85),.3*k*(e.r/14),O3FIRE,(e.x+sd)*.13)}}catch(err){}return r}}

// ------------------------------------------------------------------ the crystal that breaks: its hit and its burst remade (Denis: «cambia
// animazione quando si rompono senza mettere quelle linee a zigzag quando la si colpisce»). No cracks any more: a hit lights the crystal from
// inside, knocks off a few chips that tinkle to the floor and lights a star where the arrow struck; at every quarter of its life a shard
// breaks off whole and flies away turning (a glittering stump stays, the light leaking from it); the last hit bursts it: a flash, the last
// shards and pieces of its heart fly in 3D turning in the light and crumble into glitter where they land, a ring of cold light runs over the
// floor, stars rise and a frost of crystal dust stays where it stood, no crater. The same hits as before (5, or 8 for the big ones), the
// same crystals dropped. On a slow phone (LOWFX) fewer pieces, chips and stars.
const CRY={lights:[]},CRY_G=700;
const CRY_C=[['#e6fbff','#7fd0ec'],['#d9f3ff','#5fb0e0'],['#ece2ff','#8f72dc']];   // the chips: the half in the light and the other
const cryRot=(v,k,th)=>{const c=Math.cos(th),s=Math.sin(th),d=k[0]*v[0]+k[1]*v[1]+k[2]*v[2];
  return[v[0]*c+(k[1]*v[2]-k[2]*v[1])*s+k[0]*d*(1-c),v[1]*c+(k[2]*v[0]-k[0]*v[2])*s+k[1]*d*(1-c),v[2]*c+(k[0]*v[1]-k[1]*v[0])*s+k[2]*d*(1-c)]};
function cryFrame(ax){const a=C3.nrm(ax),h=Math.abs(a[0])<.9?[1,0,0]:[0,1,0],b=C3.nrm(C3.cross(a,h));return[a,b,C3.cross(a,b)]}
// a star of light: four long points and its glow (in the current light mode)
function cryStar(x,y,s,rot,a){if(!(s>.2))return;a=a==null?1:a;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(rot)*.35);glow('190,240,255',0,0,s*3.4,.5*a);
  ctx.fillStyle=`rgba(242,253,255,${(.95*a).toFixed(3)})`;ctx.beginPath();const L=s*2.3,W=s*.3;ctx.moveTo(0,-L);ctx.lineTo(W,-W);ctx.lineTo(L,0);ctx.lineTo(W,W);ctx.lineTo(0,L);ctx.lineTo(-W,W);ctx.lineTo(-L,0);ctx.lineTo(-W,-W);
  ctx.closePath();ctx.fill();ctx.restore()}
// a chip of crystal that flies off (x, y on the floor, z above it), bounces once and lies there fading; a star that rises and fades
function cryChip(x,y,a,sp,z){fxPush({k:'cryc',x,y,z:z||6,ux:Math.cos(a)*sp,uy:Math.sin(a)*sp*.6,uz:rand(80,170),rot:rand(0,TAU),vr:rand(-16,16),s:rand(1.3,2.4),c:randi(0,2),t:rand(.55,.85),max:.85,b:0})}
function cryTw(x,y,s,life,uy){fxPush({k:'cryT',x,y,s,t:life,max:life,rot:rand(0,TAU),uy:uy||0})}
// a piece of crystal in the air: a six-sided column with its point (tip) or broken at both ends, centred on c in the obstacle's own space,
// its length along F[0]; the broken faces are the pale ice of the inside, the others shaded like the crystal
function cryPiece(K,c,F,L,R,tip,sd){const n=6,[ea,eb,ec]=F,P=(s,u,v)=>[c[0]+ea[0]*s+eb[0]*u+ec[0]*v,c[1]+ea[1]*s+eb[1]*u+ec[1]*v,c[2]+ea[2]*s+eb[2]*u+ec[2]*v],
    rad=t=>[eb[0]*Math.cos(t)+ec[0]*Math.sin(t),eb[1]*Math.cos(t)+ec[1]*Math.sin(t),eb[2]*Math.cos(t)+ec[2]*Math.sin(t)],tl=tip?Math.min(L*.4,R*1.7):0,s0=-L/2,s1=L/2-tl,
    ring=(s,rr,j)=>{const q=[];for(let i=0;i<n;i++){const t=i/n*TAU+sd,w=rr*(j?1+.1*Math.sin(i*2.3+sd*3):1);q.push(P(s+(j?(oH(i,sd+j)-.5)*R*.55:0),Math.cos(t)*w,Math.sin(t)*w))}return q};
  const B=ring(s0,R*.94,1),U=ring(s1,R,tip?0:2),F2=[];
  for(let i=0;i<n;i++){const j=(i+1)%n;F2.push([rad((i+.5)/n*TAU+sd),[B[i],B[j],U[j],U[i]]])}
  if(tip){const A=P(L/2,0,0);for(let i=0;i<n;i++){const j=(i+1)%n,r0=rad((i+.5)/n*TAU+sd);F2.push([C3.nrm([r0[0]*tl+ea[0]*R*.9,r0[1]*tl+ea[1]*R*.9,r0[2]*tl+ea[2]*R*.9]),[U[i],U[j],A]])}}
  else{const nn=ea.slice();nn.br=1;F2.push([nn,U.slice().reverse()])}
  {const nn=[-ea[0],-ea[1],-ea[2]];nn.br=1;F2.push([nn,B.slice()])}
  return oFaces(K,F2,'#6fc9e8',{lw:R>4?1.5:1.1,ew:.6,cf:n=>n.br?'#e6fbff':n[1]>.35?'#c9f3ff':n[1]<-.35?'#6a4fc4':'#7fd0ec'})}
// a piece that flies: p and v in the obstacle's own space round (cx, cy) (v from the floor speed: toward us = vy/.55, across = −vx), its
// frame turning about w
function cryFrag(cx,cy,p,F,L,R,tip,v,w,spin,sd){fxPush({k:'cry3',cx,cy,p:p.slice(),F,L,R,tip,v,w,spin,th:0,sd,t:3,max:3})}
const cryVel=(dir,sp,up)=>[Math.sin(dir)*sp/.55,-Math.cos(dir)*sp,up];
const crySpin=()=>C3.nrm([rand(-1,1),rand(-1,1),rand(-.5,.5)]);
// where a piece lands it crumbles: chips, a puff of glitter, a star, a tinkle
function cryCrumble(f){const x=f.cx-f.p[1],y=f.cy+f.p[0]*.55,n=LOWFX?1:Math.round(2+f.R*.25);for(let i=0;i<n;i++)cryChip(x,y,rand(0,TAU),rand(25,70),2);
  cryTw(x,y-3,1.5+f.R*.16,.36);fxPush({k:'cryD',x,y,r:f.R*2.4,t:.5,max:.5});sfx('cryChip',0,x)}
// a shard broken off by a hit: it flies away from the middle turning, chips and a star at the stump
function cryShardOff(k,i,a){const s=CRY_SH[i],r=k.r,H=kH(k)*s[2],R=r*.36*s[2],ly=-s[3]*.6,z0=H*CRY_STUB,L=H-z0,zc=z0+L/2,
    out=Math.hypot(s[0],s[1])>.01?Math.atan2(s[1]*.6,s[0]):a,dir=out+rand(-.45,.45);
  cryFrag(k.x,k.y,[s[1]*r*1.1,-s[0]*r+ly*zc,zc],cryFrame([0,ly,1]),L,R,true,cryVel(dir,rand(55,95),rand(150,210)),crySpin(),rand(7,12)*(Math.random()<.5?-1:1),(k.seed||1)+i);
  const bx=k.x+s[0]*r,by=k.y+s[1]*r*.6;for(let j=0;j<(LOWFX?1:2);j++)cryChip(bx,by,dir+rand(-.8,.8),rand(35,80),z0+2);cryTw(bx,by-z0-2,2.2,.42);sfx('cryChip',0,bx)}
// the burst
function cryBurst(k){const r=k.r,h=kH(k),lost=cryLost(k),lo=LOWFX,sd=k.seed||1,ix=G.rocks.indexOf(k);if(ix>=0)G.rocks.splice(ix,1);fields={};shake(lo?2:3);
  fxPush({k:'flash',x:k.x,y:k.y-h*.5,rgb:'205,246,255',r:r*3.2,t:.32,max:.32});
  fxPush({k:'ring2',x:k.x,y:k.y,rgb:'130,215,255',r0:r*.5,r1:r*3.8,t:.6,max:.6,w:6});
  if(!lo)fxPush({k:'ring2',x:k.x,y:k.y,rgb:'235,250,255',r0:r*.3,r1:r*2.3,t:.38,max:.38,w:3});
  CRY.lights.push({x:k.x,y:k.y-h*.4,r:140,t:.7,max:.7});
  // the shards still standing fly (the main one in two pieces), each from where it stood
  for(let i=0;i<4;i++){if(lost.includes(i))continue;const s=CRY_SH[i],H=h*s[2],R=r*.36*s[2],ly=-s[3]*.6,out=Math.hypot(s[0],s[1])>.01?Math.atan2(s[1]*.6,s[0]):rand(0,TAU);
    for(const[f0,f1,tp] of (i===0&&!lo?[[0,.5,0],[.5,1,1]]:[[0,1,1]])){const z0=H*f0,L=H*(f1-f0),zc=z0+L/2,dir=out+rand(-.7,.7);
      cryFrag(k.x,k.y,[s[1]*r*1.1,-s[0]*r+ly*zc,zc],cryFrame([0,ly,1]),L,R*(tp?1:1.05),!!tp,cryVel(dir,rand(50,120)*(tp?1:.7),rand(170,260)*(tp?1:.8)),crySpin(),rand(6,12)*(Math.random()<.5?-1:1),sd+i*3+f0)}}
  // pieces of its heart
  for(let j=0;j<(lo?1:3);j++)cryFrag(k.x,k.y,[0,0,h*rand(.2,.45)],cryFrame([rand(-1,1),rand(-1,1),rand(.3,1)]),r*rand(.45,.75),r*rand(.16,.24),Math.random()<.5,
    cryVel(rand(0,TAU),rand(60,130),rand(160,240)),crySpin(),rand(7,13),sd+10+j);
  for(let j=0;j<(lo?3:8);j++)cryTw(k.x+rand(-r,r)*.9,k.y-rand(4,h*1.1),rand(1.7,3.1),rand(.45,.85),rand(-40,-12));
  for(let j=0;j<(lo?4:8);j++)cryChip(k.x+rand(-r,r)*.4,k.y+rand(-3,3),rand(0,TAU),rand(40,120),rand(4,h*.6));
  cryFrost(k);sfx('cryBurst',0,k.x)}
// where it stood: a frost of pale light on the floor, little pieces lying flat with their lit half, glitter; no lines
function cryFrost(k){const c=fx,x=k.x,y=k.y,r=k.r;c.save();c.setTransform(2,0,0,2,0,0);c.translate(x,y+1);c.scale(1,.5);
  const g=c.createRadialGradient(0,0,0,0,0,r*1.9);g.addColorStop(0,'rgba(205,242,255,.34)');g.addColorStop(.55,'rgba(140,210,240,.14)');g.addColorStop(1,'rgba(140,210,240,0)');
  c.fillStyle=g;c.beginPath();c.arc(0,0,r*1.9,0,TAU);c.fill();c.restore();
  for(let i=0;i<(LOWFX?3:5);i++){const a=rand(0,TAU),d=rand(.15,1.3)*r,s=rand(1.2,2.4),C=CRY_C[randi(0,2)];c.save();c.setTransform(2,0,0,2,0,0);c.translate(x+Math.cos(a)*d,y+Math.sin(a)*d*.5);c.rotate(rand(0,TAU));c.scale(1,.6);
    c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(.5,1.2,s*1.1,s*.55,0,0,TAU);c.fill();
    c.beginPath();c.moveTo(0,-s*1.5);c.lineTo(s*.8,0);c.lineTo(0,s*1.5);c.lineTo(-s*.8,0);c.closePath();c.fillStyle=C[1];c.fill();
    c.beginPath();c.moveTo(0,-s*1.5);c.lineTo(s*.8,0);c.lineTo(0,s*1.5);c.closePath();c.fillStyle=C[0];c.fill();c.restore()}
  c.save();c.setTransform(2,0,0,2,0,0);c.fillStyle='rgba(232,250,255,.6)';for(let i=0;i<(LOWFX?5:10);i++){const a=rand(0,TAU),d=rand(.1,1.8)*r;c.fillRect(x+Math.cos(a)*d,y+Math.sin(a)*d*.5,.8,.8)}c.restore()}
// the hit
{const _rh=rockHit;rockHit=function(k,x,y,a,big){if(!OB3.on||!k||k.kind!=='crystal'||k.temp)return _rh.apply(this,arguments);
  k.hit=.14;k.cf=G.t||0;sfx('rock','crystal',x);
  for(let i=0;i<(LOWFX?1:3);i++)cryChip(x,y,a+Math.PI+rand(-1.1,1.1),rand(40,95)*(big?1.4:1),rand(4,14));cryTw(x+rand(-3,3),y-rand(4,10),2.4,.32);
  if(k.breaking)return;if(!k.chmax){k.chmax=k.r>=20?8:5;k.chp=k.chmax}k.chp-=big?2:1;
  if(k.chp>0){const cs=Math.max(1,Math.ceil(k.chp/k.chmax*4));while(cryLeft(k)>cs){const i=CRY_LOSE[4-cryLeft(k)];k.cs=cryLeft(k)-1;cryShardOff(k,i,a)}}
  else breakCrystal(k)}}
// the burst, for every way a crystal is destroyed (its last hit, a chest falling on it)
{const _sr=shatterRock;shatterRock=function(k){if(!OB3.on||!k||k.kind!=='crystal')return _sr.apply(this,arguments);cryBurst(k)}}
// the pieces, chips and stars move with the game's clock (the lists of the effects empty with the room)
{const _u=update;update=function(dt){_u(dt);if(!OB3.on||!G||!G.fx)return;
  for(const f of G.fx){if(f.k==='cry3'){if(f.done)continue;f.p[0]+=f.v[0]*dt;f.p[1]+=f.v[1]*dt;f.v[2]-=CRY_G*dt;f.p[2]+=f.v[2]*dt;f.th+=f.spin*dt;if(f.v[2]<0&&f.p[2]<=f.R*.8){f.done=1;f.t=0;cryCrumble(f)}}
    else if(f.k==='cryc'){f.uz-=CRY_G*dt;f.z+=f.uz*dt;f.x+=f.ux*dt;f.y+=f.uy*dt;f.rot+=f.vr*dt;if(f.z<=0){f.z=0;if(!f.b){f.b=1;f.uz=-f.uz*.3;f.ux*=.45;f.uy*=.45;f.vr*=.4}else{f.uz=0;f.ux*=.85;f.uy*=.85;f.vr*=.9}}}
    else if(f.k==='cryT')f.y+=f.uy*dt}
  for(const l of CRY.lights)l.t-=dt;if(CRY.lights.length)CRY.lights=CRY.lights.filter(l=>l.t>0)}}
{const _b=buildRoom;buildRoom=function(){CRY.lights=[];return _b.apply(this,arguments)}}
// the drawing of the pieces (in 3D, with their shadow and a little glow), the chips, the stars and the puffs of glitter
FXDRAW.cry3=f=>{if(f.done)return;const F=f.F.map(e=>cryRot(e,f.w,f.th)),hz=Math.max(0,f.p[2]);
  ctx.fillStyle=`rgba(10,20,30,${(.28*Math.max(0,1-hz/70)).toFixed(3)})`;ctx.beginPath();ctx.ellipse(f.cx-f.p[1],f.cy+f.p[0]*.55,f.R*1.4,f.R*.6,0,0,TAU);ctx.fill();
  ctx.save();try{const K=ob3Cam(f.cx,f.cy);cryPiece(K,f.p,F,f.L,f.R,f.tip,f.sd);const q=K.V0.P(f.p);ctx.globalCompositeOperation='lighter';glow('150,230,255',q[0],q[1],f.R*3,.24)}catch(err){f.done=1}finally{ctx.restore()}};
FXDRAW.cryc=f=>{const a=Math.min(1,f.t/.3),s=f.s,C=CRY_C[f.c]||CRY_C[0];
  if(f.z>1){ctx.fillStyle=`rgba(10,20,30,${(.22*a).toFixed(3)})`;ctx.beginPath();ctx.ellipse(f.x,f.y,s*1.1,s*.45,0,0,TAU);ctx.fill()}
  ctx.save();ctx.translate(f.x,f.y-f.z);ctx.rotate(f.rot);ctx.globalAlpha=a;ctx.beginPath();ctx.moveTo(0,-s*1.5);ctx.lineTo(s*.8,0);ctx.lineTo(0,s*1.5);ctx.lineTo(-s*.8,0);ctx.closePath();
  ctx.fillStyle=C[1];ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke();ctx.beginPath();ctx.moveTo(0,-s*1.5);ctx.lineTo(s*.8,0);ctx.lineTo(0,s*1.5);ctx.closePath();ctx.fillStyle=C[0];ctx.fill();
  if(Math.sin(f.rot*2.7)>.8){ctx.globalCompositeOperation='lighter';glow('220,248,255',0,-s*.4,s*2.2,.55*a)}ctx.restore()};
FXDRAW.cryT=f=>{const p=1-f.t/f.max;ctx.save();ctx.globalCompositeOperation='lighter';cryStar(f.x,f.y,f.s*Math.sin(Math.min(1,p*1.15)*Math.PI),f.rot+p*2);ctx.restore()};
FXDRAW.cryD=f=>{const p=1-f.t/f.max,r=f.r*(.6+.6*p);ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(f.x,f.y-1);ctx.scale(1,.5);const g=ctx.createRadialGradient(0,0,0,0,0,r);
  g.addColorStop(0,`rgba(180,235,255,${(.32*(1-p)).toFixed(3)})`);g.addColorStop(1,'rgba(180,235,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.restore()};
// the light of the burst in the room's light map, fading
{const _lf=lwFill;lwFill=function(){if(OB3.on&&CRY.lights.length){const spr=glowSprite('0,0,0');lx.save();lx.globalCompositeOperation='destination-out';
    for(const l of CRY.lights){lx.globalAlpha=Math.min(1,.95*l.t/l.max);lx.drawImage(spr,l.x-l.r,l.y-l.r,l.r*2,l.r*2)}lx.restore()}return _lf.apply(this,arguments)}}
// the sounds: a chip (two glassy clinks and a little bell) and the burst (a falling run of bells and a cold hiss over the shatter of the game)
{const _s=sfx;sfx=function(k,arg,x){if(k!=='cryChip'&&k!=='cryBurst')return _s.apply(this,arguments);if(!AU.ctx||!AU.on.sfx)return;
  const now=performance.now();if(now-(AU.last[k]||0)<(k==='cryChip'?55:150))return;AU.last[k]=now;const t=AU.ctx.currentTime+.005;AU.pan=x==null?0:Math.max(-.7,Math.min(.7,(x-180)/200));
  try{if(k==='cryChip'){M.glass(t,.8,VR(3000,.1));M.glass(t+.025,.45,VR(3900,.1));vBell(null,t+.015,91+randi(0,5),.45,.028)}
    else{[98,94,91,86,82].forEach((m,i)=>vBell(null,t+.05+i*.06,m,1.2-i*.12,.042));fNoise(t+.04,.8,'highpass',6500,.6,.07,{rev:.6})}}catch(err){}AU.pan=0}}

// ------------------------------------------------------------------ the sip at the fountain of life: a column of light, a ring of green light,
// motes that swirl from the water round the hero and rise, a bubbling gulp and two bells; then the water drains (fnFull). The same at the
// tower's spring, which now is the fountain of life, smaller (its old drawing comes back with OB3.on = false)
function fnSip(x,y,S){fxPush({k:'fnC',x,y:y-6*S,h:160*S,w:40*S,t:1.2,max:1.2});
  fxPush({k:'ring2',x,y,rgb:'140,255,200',r0:12*S,r1:90*S,t:.6,max:.6,w:5});fxPush({k:'flash',x,y:y-26*S,rgb:'190,255,225',r:60*S,t:.3,max:.3});
  const n=LOWFX?6:14;for(let i=0;i<n;i++)fxPush({k:'fnM',x0:x,y0:y-26*S,a:i/n*TAU,sp:rand(.8,1.2),t:1.3,max:1.3});sfx('fnSip',0,x)}
{const _ue=updEvent;updEvent=function(dt){const p=G&&G.prop,was=!!(p&&p.kind==='fontana'&&!p.used),r=_ue.apply(this,arguments);if(OB3.on&&was&&p.used){p.fnT=G.t||0;fnSip(p.x,p.y,1)}return r}}
{const _st=cnShrineTick;cnShrineTick=function(dt){const S=G&&G.cnPick,f=S&&S.find(s=>s.k==='fonte'&&!s.used),r=_st.apply(this,arguments);if(OB3.on&&f&&f.used){f.fnT=G.t||0;fnSip(f.x,f.y,.74)}return r}}
{const _ds=cnDrawShrine;cnDrawShrine=function(s,t){if(!OB3.on||!s||s.k!=='fonte'||s.gone)return _ds.apply(this,arguments);
  const x=s.x,y=s.y,a=s.used?Math.max(0,1-(G.cnPick&&G.cnPick.dt||0)*1.2):1;ctx.save();ctx.globalAlpha=a;ctx.fillStyle='rgba(0,0,0,.32)';ell(x,y+4,30,11);ctx.fill();
  ctx.save();try{fnDraw(proCam(OB3.face,x,y,1),{used:!!s.used,fnT:s.fnT},t,.74)}catch(err){console.error(err)}finally{ctx.restore()}
  ctx.font='12px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.strokeText('Fonte · cura',x,y+20);ctx.fillStyle='#f6ead2';ctx.fillText('Fonte · cura',x,y+20);ctx.restore()}}
// the column of light, soft at the edges, fading; a mote that swirls from the fountain to the hero and rises
FXDRAW.fnC=f=>{const p=1-f.t/f.max,a=Math.sin(Math.min(1,p*2.2)*Math.PI*.5)*(1-p),w=f.w*(1-p*.3);ctx.save();ctx.globalCompositeOperation='lighter';
  const g=ctx.createLinearGradient(0,f.y-f.h,0,f.y);g.addColorStop(0,'rgba(160,255,210,0)');g.addColorStop(.55,`rgba(160,255,210,${(.42*a).toFixed(3)})`);g.addColorStop(1,`rgba(205,255,235,${(.62*a).toFixed(3)})`);
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(f.x,f.y-f.h/2,w/2,f.h/2,0,0,TAU);ctx.fill();glow('170,255,215',f.x,f.y,w*1.4,.4*a);ctx.restore()};
FXDRAW.fnM=f=>{const p=1-f.t/f.max,k=Math.min(1,p*1.6),ang=f.a+p*5*f.sp,r=(1-p)*26+8,x=plerp(f.x0,P.x,k)+Math.cos(ang)*r,y=plerp(f.y0,P.y-20,k)+Math.sin(ang)*r*.5-p*60,al=Math.sin(Math.min(1,p*1.25)*Math.PI);
  ctx.save();ctx.globalCompositeOperation='lighter';glow('150,255,200',x,y,6,.55*al);ctx.fillStyle=`rgba(240,255,245,${(.95*al).toFixed(3)})`;ctx.fillRect(x-1,y-1,2,2);ctx.restore()};
// the gulp: a bubble that rises, the water, two little bells
{const _s=sfx;sfx=function(k,arg,x){if(k!=='fnSip')return _s.apply(this,arguments);if(!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.005;AU.pan=x==null?0:Math.max(-.7,Math.min(.7,(x-180)/200));
  try{fThump(t,180,560,.18,.22,.2);fNoise(t+.02,.35,'lowpass',1400,.8,.12,{f2:500,att:.02,rev:.3});[86,93].forEach((m,i)=>vBell(null,t+.1+i*.08,m,1,.035))}catch(err){}AU.pan=0}}
