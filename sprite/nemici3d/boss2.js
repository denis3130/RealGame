// I boss del secondo giro della modalità Classica rifatti in 3D come l'Arciere: la Salamandra di Lava, l'Idra della Palude e il Mimic.
// Stessi colori e stesse parti di oggi nel gioco, dipinti con la cassetta C3 (base3d.js); ogni mossa dipende solo da p (0..1).
// - Salamandra di Lava: una lucertola arancione lunga, testa tonda con grandi occhi gialli, quattro zampe dorate che strisciano come
//   una vera lucertola (il corpo si piega a C a ogni passo, la coda ondeggia), strisce scure, spine rosso scuro e macchie di lava che
//   si accendono a onda sulla schiena. Mosse: fermo, cammina, sputa fuoco, si tuffa sotto terra ed esplode fuori, corsa di fuoco, colpita.
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,stepper,ball,seg,tri,hull,rim,run,dk,lt,rgba,poly,line,bbox,chull,softBox,
  look,blink,keys,bump,sstep,hitK,frame,IDF,vol,ellAt,ellN,chain,spot,leaf,eyes,ellFace,stars,parts,reg,shine,wa,ik,surfLine}=C,R0=C.R;

// ------------------------------------------------------------------ shared helpers
// a closed ring of m points round the centre c, across the axes sv (side) and uv (up), half sizes ry, rz
function ring(c,sv,uv,ry,rz,m){const out=[];for(let j=0;j<m;j++){const t=j/m*TAU;out.push(add(c,add(mul(sv,Math.cos(t)*ry),mul(uv,Math.sin(t)*rz))))}return out}
// an ellipsoid as rings from the bottom pole to the top one: centre c, radii r along the axes F = {u, v, w}
// (a0, a1: the latitudes it spans, from -π/2 at the bottom to π/2 at the top; a pole is a single point)
function ellRows(c,r,F,n,m,a0,a1){a0=a0==null?-Math.PI/2:a0;a1=a1==null?Math.PI/2:a1;const rows=[];for(let i=0;i<=n;i++){const a=a0+i/n*(a1-a0),z=Math.sin(a),rr=Math.cos(a),row=[],mm=rr<1e-3?1:m;
  for(let j=0;j<mm;j++){const t=j/m*TAU;row.push(add(c,add(add(mul(F.u,Math.cos(t)*rr*r[0]),mul(F.v,Math.sin(t)*rr*r[1])),mul(F.w,z*r[2]))))}rows.push(row)}return rows}
// the points of a convex piece given as rings, cut by the level z = zc (the ground, the water): the points above it and the points
// where its edges cross it, so the hull of what is left is the piece sliced flat at that level
function cutRows(rows,zc){const out=[],n=rows.length;
  for(let i=0;i<n;i++){const r=rows[i],m=r.length;for(let j=0;j<m;j++){const a=r[j],da=a[2]-zc;if(da>=0)out.push(a);
    const b=r[(j+1)%m];if(da*(b[2]-zc)<0)out.push(lerp3(a,b,da/(a[2]-b[2])));
    if(i<n-1){const r2=rows[i+1],c=r2[j%r2.length];if(da*(c[2]-zc)<0)out.push(lerp3(a,c,da/(a[2]-c[2])))}
    if(i>0&&m===1){const r0=rows[i-1];for(const c of r0)if(da*(c[2]-zc)<0)out.push(lerp3(a,c,da/(a[2]-c[2])))}}}
  return out}
// is any point of these rings below the level zc?
const below=(rows,zc)=>{if(zc==null)return false;for(const r of rows)for(const q of r)if(q[2]<zc)return true;return false};
const flat=rows=>[].concat(...rows);
// a convex screen polygon grown outward by d (or shrunk when d < 0): every corner moves out along both of its sides. Filling the grown
// polygon in ink and then the polygon itself in colour gives the thick outline without stroking it (a stroke with round joins costs more)
function grow(h,d){const n=h.length;let ar=0;for(let i=0;i<n;i++){const a=h[i],b=h[(i+1)%n];ar+=a[0]*b[1]-b[0]*a[1]}const sg=ar>0?1:-1,N=[];
  for(let i=0;i<n;i++){const a=h[i],b=h[(i+1)%n],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;N.push([sg*dy/l,-sg*dx/l])}
  const out=[];for(let i=0;i<n;i++){const n1=N[(i+n-1)%n],n2=N[i],k=d/Math.max(.35,1+n1[0]*n2[0]+n1[1]*n2[1]);out.push([h[i][0]+(n1[0]+n2[0])*k,h[i][1]+(n1[1]+n2[1])*k])}return out}
// C3.vol without stroking: the hull of the points seen by the camera, grown in ink, three soft tones inside, the warm rim
function vol2(V0,pts3,col,o){o=o||{};const pts=chull(pts3.map(q=>V0.P(q)));if(pts.length<3)return pts;const lw=o.lw||2.5;
  poly(grow(pts,lw/2));ctx.fillStyle=INK;ctx.fill();poly(grow(pts,-lw/2));ctx.fillStyle=o.fill||softBox(bbox(pts),col,o.kl,o.kd);ctx.fill();if(!o.noRim)C.rimPoly(pts,o.rim||.3);return pts}
// a convex volume from rings (C3.vol), sliced at the level zc when it is given
const blob=(V0,rows,col,o)=>vol2(V0,o&&below(rows,o.cut)?cutRows(rows,o.cut):flat(rows),col,o);
// a bendy body: one ring every few units along a spine, drawn as one piece without seams (every outline first, then every fill), sliced
// at the level o.cut. Returns the screen hulls (to clip the markings inside it), or null when nothing is above the cut
function tube(V0,R,col,o){o=o||{};const zc=o.cut,H=[];
  for(let i=0;i<R.length-1;i++){const pts=below([R[i],R[i+1]],zc)?cutRows([R[i],R[i+1]],zc):R[i].concat(R[i+1]);if(pts.length<3)continue;const h=chull(pts.map(q=>V0.P(q)));if(h.length>2)H.push(h)}
  if(!H.length)return null;const lw=o.lw||2.5;polys(H.map(h=>grow(h,lw)));ctx.fillStyle=INK;ctx.fill();
  polys(H);ctx.fillStyle=o.fill||softBox(bbox([].concat(...H)),col,o.kl,o.kd);ctx.fill();return H}
// one path made of several polygons (their union); clip to it
function polys(H){ctx.beginPath();for(const h of H){ctx.moveTo(h[0][0],h[0][1]);for(let i=1;i<h.length;i++)ctx.lineTo(h[i][0],h[i][1]);ctx.closePath()}}
const clipH=H=>{polys(H);ctx.clip()};
// shapes added to the current path (so many pieces of one colour are filled at once): a capsule round two screen circles, a circle,
// a flat disc on a surface (centre c, normal n, radius r) as the screen ellipse it projects to
function capsP(a,ra,b,rb){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);if(d<=Math.abs(ra-rb)+.01){const q=ra>=rb?a:b,r=Math.max(ra,rb);ctx.moveTo(q[0]+r,q[1]);ctx.arc(q[0],q[1],r,0,TAU);return}
  const an=Math.atan2(dy,dx),f=Math.acos(cl((ra-rb)/d,-1,1));ctx.moveTo(a[0]+Math.cos(an+f)*ra,a[1]+Math.sin(an+f)*ra);ctx.arc(a[0],a[1],ra,an+f,an+TAU-f);ctx.arc(b[0],b[1],rb,an-f,an+f);ctx.closePath()}
const ballP=(q,r)=>{ctx.moveTo(q[0]+r,q[1]);ctx.arc(q[0],q[1],Math.max(.05,r),0,TAU)};
function discP(V0,c,n,r){let u=cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u),o=V0.P(c),A=V0.P(add(c,mul(u,r))),B=V0.P(add(c,mul(v,r))),a=[A[0]-o[0],A[1]-o[1]],b=[B[0]-o[0],B[1]-o[1]],
  p=a[0]*a[0]+b[0]*b[0],q=a[1]*a[1]+b[1]*b[1],s=a[0]*a[1]+b[0]*b[1],m=(p+q)/2,d=Math.sqrt((p-q)*(p-q)/4+s*s),rx=Math.sqrt(m+d),ry=Math.sqrt(Math.max(1e-4,m-d)),ph=.5*Math.atan2(2*s,p-q);
  ctx.moveTo(o[0]+rx*Math.cos(ph),o[1]+rx*Math.sin(ph));ctx.ellipse(o[0],o[1],rx,ry,ph,0,TAU)}
// the warm rim along the lit edge of a tube: for every ring the point of its outline farthest toward the light, pulled 1.9 px inside
function tubeRim(V0,R,al){const Q=R.map(r=>{let x=0,y=0;const p=r.map(q=>V0.P(q));for(const q of p){x+=q[0];y+=q[1]}return{c:[x/p.length,y/p.length],p}}),pts=[];
  for(let i=0;i<Q.length;i++){const a=Q[Math.max(0,i-1)].c,b=Q[Math.min(Q.length-1,i+1)].c;let nx=-(b[1]-a[1]),ny=b[0]-a[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;if(nx*-.55+ny*-.83<0){nx=-nx;ny=-ny}
    let m=-1e9;for(const q of Q[i].p)m=Math.max(m,(q[0]-Q[i].c[0])*nx+(q[1]-Q[i].c[1])*ny);pts.push([Q[i].c[0]+nx*(m-1.9),Q[i].c[1]+ny*(m-1.9)])}
  const b=bbox(pts),cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,Rr=Math.max(b[2]-b[0],b[3]-b[1])/2+4,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.2,cy+Rr*.2);
  g.addColorStop(0,wa(al||.3));g.addColorStop(1,wa(0));ctx.save();ctx.strokeStyle=g;ctx.lineWidth=1.3;ctx.lineCap='round';ctx.lineJoin='round';line(pts);ctx.stroke();ctx.restore()}
// the shadow of a long body: a soft ellipse under every few points of its spine, all in one path (no darker overlaps)
function longShadow(V0,x,y,sc,pts,al){if(typeof noShadow!=='undefined'&&noShadow)return;const k=C.KR();ctx.fillStyle=`rgba(0,0,0,${al==null?.28:al})`;ctx.beginPath();
  for(const[c,r] of pts){const q=V0.P(c[0],c[1],0);ctx.moveTo(x+(q[0]+r)*sc,y+q[1]*sc);ctx.ellipse(x+q[0]*sc,y+q[1]*sc,r*sc,r*.55*k*sc,0,0,TAU)}ctx.fill()}
// a head split at the mouth into a top and a jaw: the hull of one or more ellipsoids E = [{c, r}] (centres and radii in the head's own axes
// F = {u forward, v right, w up}, round the head's centre hc), cut by the plane of the mouth at the height hz; the jaw turns down by ja
// round a hinge at the back of the cut. top(d)/jaw(d): a point given in the head's axes; dome/bowl: rings of the two pieces (for vol);
// floor/palate: the rims of the cut on the jaw and on the top; lip(t, k): the rim of the mouth at angle t on the top (k = 0) or the jaw
function splitHead(hc,F,E,hz,ja,n,m){const top=d=>add(hc,add(add(mul(F.u,d[0]),mul(F.v,d[1])),mul(F.w,d[2])));let hx=1e9;
  for(const e of E){const zl=cl((hz-e.c[2])/e.r[2],-.98,.98);e.zl=zl;e.rr=Math.sqrt(1-zl*zl);hx=Math.min(hx,e.c[0]-e.rr*e.r[0])}hx*=.92;
  const cs=Math.cos(ja),sn=Math.sin(ja),jaw=d=>{const a=d[0]-hx,b=d[2]-hz;return top([hx+a*cs+b*sn,d[1],hz+b*cs-a*sn])},
    band=(e,z0,z1,fn,nn)=>{const rows=[],a0=Math.asin(z0),a1=Math.asin(z1);for(let i=0;i<=nn;i++){const a=a0+(a1-a0)*i/nn,z=Math.sin(a),q=Math.cos(a),row=[],mm=q<1e-3?1:m;
      for(let j=0;j<mm;j++){const t=j/m*TAU;row.push(fn([e.c[0]+Math.cos(t)*q*e.r[0],e.c[1]+Math.sin(t)*q*e.r[1],e.c[2]+z*e.r[2]]))}rows.push(row)}return rows},
    dome=[],bowl=[],floor=[],palate=[];
  for(const e of E){const d=band(e,e.zl,1,top,n),b=band(e,-1,e.zl,jaw,Math.max(2,n>>1));dome.push(...d);bowl.push(...b);palate.push(...d[0]);floor.push(...b[b.length-1])}
  const lipL=t=>{let best=null,bd=-1e9;for(const e of E){const d=[e.c[0]+Math.cos(t)*e.rr*e.r[0],e.c[1]+Math.sin(t)*e.rr*e.r[1],hz],k=d[0]*Math.cos(t)+d[1]*Math.sin(t);if(k>bd){bd=k;best={d,e}}}return best};
  return{top,jaw,dome,bowl,floor,palate,hz,lip:(t,k)=>(k?jaw:top)(lipL(t).d),lipN:t=>{const e=lipL(t).e;return ellN(e.r,F,[Math.cos(t)*e.rr,Math.sin(t)*e.rr,e.zl])},wJ:add(mul(F.u,sn),mul(F.w,cs))}}
// where a pair of eyes sits on a head (as C3.eyes: never on the outline, the far eye slides in beside the near one and narrows until
// it is gone), without drawing them; then eyeC draws each one without clipping (cheaper), every part kept inside the eye
function eyeSpots(h,Rh,o){const d=o.dir,E=[-1,1].map(sd=>{const r=o.at(nrm([d[0],sd*d[1],d[2]]));return{sd,v:r.v,q:r.q,rx:o.rx*Math.pow(Math.max(0,r.v-(o.v0||0)*.5),o.fall||.7)}}).filter(e=>e.v>(o.v0||.08)).sort((a,b)=>b.v-a.v);
  if(E.length)E[0].q=C.inward(h,Rh,E[0].q,o.a||.6,o.b||.74);
  if(E.length>1){const n=E[0],f=E[1];f.q=C.inward(h,Rh,f.q,(o.a||.6)-.1,(o.b||.74)-.08);const gap=Math.hypot(f.q[0]-n.q[0],f.q[1]-n.q[1])-n.rx-(o.gap==null?.8:o.gap);f.rx=Math.min(f.rx,Math.max(0,gap))}
  return E.filter(e=>e.rx>=.6)}
// a cartoon eye: the white (or yellow) with its outline, a coloured iris, a round pupil or a slit, a point of light; o.shut: two strokes
function eyeC(q,rx,ry,o,h){const sq=(o.blink==null?1:o.blink)*(1-.35*(o.squint||0)),sy=ry*Math.max(.12,sq);
  if(o.shut){const dir=h&&h[0]>=q[0]?1:-1;ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(q[0]-dir*rx*.9,q[1]-ry*.6);ctx.lineTo(q[0]+dir*rx*.8,q[1]);ctx.lineTo(q[0]-dir*rx*.9,q[1]+ry*.6);ctx.stroke();return}
  ctx.beginPath();ctx.ellipse(q[0],q[1],rx,sy,0,0,TAU);ctx.fillStyle=o.white;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=o.lw||1.3;ctx.stroke();if(sq<.25)return;
  if(o.iris){ctx.fillStyle=o.iris;ctx.beginPath();ctx.ellipse(q[0],q[1],rx*.86,sy*.86,0,0,TAU);ctx.fill()}
  ctx.fillStyle='#1b1612';ctx.beginPath();if(o.pupil==='slit')ctx.ellipse(q[0],q[1],Math.max(.4,rx*.2),sy*.74,0,0,TAU);else ctx.ellipse(q[0]+rx*.06,q[1]+sy*.04,rx*.5,sy*.52,0,0,TAU);ctx.fill();
  if(rx>1.2){ctx.fillStyle='#fff';ball([q[0]-rx*.32,q[1]-sy*.36],Math.max(.35,Math.min(rx,sy)*.24));ctx.fill()}}
// a fierce brow over an eye, slanting down toward the middle of the face
function brow(e,h,ry,w){const q=e.q,dir=h[0]>=q[0]?1:-1;ctx.strokeStyle=INK;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q[0]-dir*e.rx*1.08,q[1]-ry*1.15);ctx.quadraticCurveTo(q[0],q[1]-ry*1.3,q[0]+dir*e.rx*1,q[1]-ry*.8);ctx.stroke()}
// bigger dizzy stars for the bosses
function bstars(c0,r,a,sz){if(a<=0)return;for(let i=0;i<3;i++){const an=G.t*5+i*TAU/3;R0.starS(c0[0]+Math.cos(an)*r,c0[1]+Math.sin(an)*r*.33*C.KR(),sz||2.8,a)}}
// how much a limb on the far side of the body is darkened
const farK=f=>cl(-f*1.5,0,.9);

// ------------------------------------------------------------------ SALAMANDRA DI LAVA (drawSalamander, salamUpd, B2.salamander)
// The game draws her from above: an orange oval head with two yellow eyes and two golden legs, then a train of orange segments
// (darker and lighter in turn) with a dark red spike on each, flames and embers on her back. Here she is a real lizard of the same colours:
// a round head with big yellow eyes and a wide grin with two little fangs, a long body striped darker and lighter, dark red spikes along
// the spine, glowing lava spots between the stripes that light up in a wave, four golden legs with splayed toes, a long tail.
const SA={body:'#e35a22',band:'#c43d18',jaw:'#f39248',spike:'#7a1f0e',leg:'#ffb020',eye:'#ffd86b',lava:'#ffd86b',lavaE:'#ff8a24',mouth:'#5a1206',tongue:'#e8707a',fang:'#fff6e0'};
// the spine: arc length s from the front end (inside the head) to the tip of the tail; [s, half width, half height] of the body there
const SLT=106,SXF=12,SSH=16,SHP=40;
const SPR=[[0,8,7],[8,12,9.5],[16,15,11],[28,16,11.5],[40,14.5,10.5],[48,11,8.5],[64,7.5,6.2],[80,4.8,4.2],[96,2.6,2.4],[106,1,1]];
const sprof=s=>{for(let i=0;i<SPR.length-1;i++){const a=SPR[i],b=SPR[i+1];if(s<=b[0]){const k=(s-a[0])/(b[0]-a[0]);return[lerp(a[1],b[1],k),lerp(a[2],b[2],k)]}}return[.9,.9]};
const sclr=s=>s<44?2.4:Math.max(.5,2.4-(s-44)/30*1.9);
const SSS=[0,6,12,18,24,31,38,45,52,60,68,77,86,96,106];
// the stripes (dark), the spikes on them, the lava spots between them
const SBANDS=[10,22,34,46,58,70,82,94],SSPOTS=[16,28,40,52,64,76];
// rest feet [front left, front right, hind left, hind right] (x, y) and where each leg starts on the spine
const SFEET=[[-4,-23],[-4,23],[-31,-23],[-31,23]],SLEG=[[SSH,-1],[SSH,1],[SHP,-1],[SHP,1]];
// the dive path: on the ground behind the hole (a >= 0), then curving down into it (a < 0); its height is the belly's
const SHX=34,SRC=9;
function sdive(a){if(a>=0)return{p:[SHX-a,0,0],n:[0,0,1]};const L=-a,th0=1.25,arc=SRC*th0;
  if(L<=arc){const t=L/SRC;return{p:[SHX+SRC*Math.sin(t),0,-SRC*(1-Math.cos(t))],n:[Math.sin(t),0,Math.cos(t)]}}
  const e=[SHX+SRC*Math.sin(th0),0,-SRC*(1-Math.cos(th0))],d=[Math.cos(th0),0,-Math.sin(th0)];return{p:add(e,mul(d,L-arc)),n:[Math.sin(th0),0,Math.cos(th0)]}}
// the spine for the pose A: centres, half sizes, and the frame of every ring (t forward, v right, w up), through the body's frame X
function sspine(A,X){const S=[];
  for(const s of SSS){const[ry0,rz0]=sprof(s),bw=s>6&&s<48?Math.sin(Math.PI*(s-6)/42):0,ry=ry0*(1+A.breath*bw),rz=rz0*(1+A.breath*bw*.7);
    // the C bend of the trunk between the shoulders and the hips; the neck and the tail go on along the slopes there (less for the neck)
    const u=(s-SSH)/(SHP-SSH);let y=u<0?Math.PI*u*.5:u<=1?Math.sin(Math.PI*u):-Math.PI*(u-1)*.75;y*=-A.bend;y+=A.turn*(s-28)*(s-28)*.0045;
    if(s>SHP){const k=(s-SHP)/(SLT-SHP);y+=A.tw*Math.pow(k,1.25)*Math.sin(A.tp-k*4.4)}
    const lift=A.lift*Math.pow(Math.max(0,1-s/SHP),1.5),curl=s>66?A.curl*Math.pow((s-66)/40,2):0;let c,n=null;
    if(A.dive>0){const a=SHX-SXF+s-A.dive,d=sdive(a),h=sclr(s)+rz+(a>=0?lift+curl:0);c=add(add(d.p,[0,a>=0?y:y*.3,0]),mul(d.n,h));n=d.n}
    else c=[SXF-s,y,sclr(s)+rz+lift+curl];
    S.push({s,c:X.T(c),ry,rz,n:n&&X.Rd(n)})}
  for(let i=0;i<S.length;i++){const a=S[Math.max(0,i-1)].c,b=S[Math.min(S.length-1,i+1)].c,t=nrm(sub(a,b));let v=cross(S[i].n||[0,0,1],t);
    if(len(v)<.2)v=cross([0,1,0],t);v=nrm(v);S[i].t=t;S[i].v=v;S[i].w=nrm(cross(t,v))}
  return S}
// a point on the body at arc length s, angle th round it (0 = its right side, π/2 = the top, π = its left side), pushed out by `out`, and its normal
function ssurf(S,s,th,out){let i=0;while(i<S.length-2&&S[i+1].s<s)i++;const a=S[i],b=S[i+1],k=cl((s-a.s)/(b.s-a.s),0,1),c=lerp3(a.c,b.c,k),v=nrm(lerp3(a.v,b.v,k)),w=nrm(lerp3(a.w,b.w,k)),
  ry=lerp(a.ry,b.ry,k)+(out||0),rz=lerp(a.rz,b.rz,k)+(out||0),cs=Math.cos(th),sn=Math.sin(th);
  return{p:add(c,add(mul(v,cs*ry),mul(w,sn*rz))),n:nrm(add(mul(v,cs/ry),mul(w,sn/rz))),t:nrm(lerp3(a.t,b.t,k)),ry,rz}}
// a leg: two bones with the IK elbow (or knee) bent out and up, orange at the root fading to gold, a golden foot with a pad and three
// splayed round toes on the ground. Every outline first, then the foot, then the leg over it (no seams)
function sleg(V0,a,f,pole,k,o){const[kn,t]=ik(a,f,8.6,8.2,pole),A2=V0.P(a),K2=V0.P(kn),T2=V0.P(t),c0=dk(SA.body,k*.45),c1=dk(SA.leg,k*.5),fp=add(f,[0,0,1]),q=V0.P(fp),r=2.7;
  const fd=nrm(sub(f,a)),d0=nrm([fd[0]+o.fx,fd[1],0]),sd=[-d0[1],d0[0],0],T=[];for(let i=-1;i<=1;i++){const d=nrm(add(d0,mul(sd,i*.7)));T.push([V0.P(add(fp,mul(d,r*.6))),V0.P(add(fp,add(mul(d,r*2.3),[0,0,-r*.35])))])}
  ctx.beginPath();capsP(A2,5.25,K2,4.45);capsP(K2,4.45,T2,3.95);for(const[b,e] of T)capsP(b,r*.58+1.2,e,r*.66+1.2);ballP(q,r+1.2);ctx.fillStyle=INK;ctx.fill();
  ctx.beginPath();for(const[b,e] of T)capsP(b,r*.58,e,r*.66);ballP(q,r);ctx.fillStyle=c1;ctx.fill();
  if(!LOWFX){ctx.beginPath();for(const[b,e] of T)ballP([e[0]-.3,e[1]-.35],r*.3);ctx.fillStyle=lt(c1,.35);ctx.fill()}
  const g=ctx.createLinearGradient(A2[0],A2[1],T2[0],T2[1]);g.addColorStop(0,c0);g.addColorStop(.45,c0);g.addColorStop(.8,c1);g.addColorStop(1,c1);
  ctx.beginPath();capsP(A2,2.85,K2,2.05);capsP(K2,2.05,T2,1.55);ctx.fillStyle=g;ctx.fill();rim(A2,4,K2,3.2,.22)}
function salamander(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU,fx=!o.noFx;
  // the pose: body frame (B, lean, roll, s), spine (bend: the C bend of the trunk, turn, tw/tp: the wave down the tail, lift: the front
  // rears up, curl: the tip of the tail, breath), head (hy look, hp nod up > 0, hr tilt, jaw 0..1), feet (room, x y z; tuck: folded to the
  // body), face (blink, squint, shut), dive: how far she has slid into her hole, hole: the hole's opening, fire: the fireball, glow: lava
  const A={B:[0,0,0],lean:0,roll:0,s:0,bend:0,turn:0,tw:0,tp:0,lift:0,curl:0,breath:0,hy:0,hp:0,hr:0,jaw:0,blink:1,squint:0,shut:0,
    feet:SFEET.map(f=>[f[0],f[1],0]),fBody:0,dive:0,hole:0,holeX:SHX+3,fire:-1,glow:.55,wave:1,stars:0,dust:-1};
  if(anim==='walk'||anim==='circle'){const fast=anim==='circle',st=stepper(p,fast?.5:.62),S=fast?6.4:5.6,H=fast?4.6:3.2,a=st(0,S,H),b=st(.5,S,H);
    // diagonal pairs: front left with hind right, then front right with hind left; the trunk bows away from the foot that reaches forward
    A.feet=[[SFEET[0][0]+a.x,-23,a.z],[SFEET[1][0]+b.x,23,b.z],[SFEET[2][0]+b.x,-23,b.z],[SFEET[3][0]+a.x,23,a.z]];
    A.bend=(fast?4.2:3)*Math.cos(ph);A.tw=fast?8:5.5;A.tp=ph+1;A.hy=.06*Math.cos(ph);A.hp=.03*Math.sin(ph*2);A.B=[0,0,.35*Math.abs(Math.sin(ph))];A.roll=.03*Math.sin(ph);
    A.wave=2;A.curl=1.5;A.blink=blink(p,.3,.08);
    if(fast){// the fire run: low and fast, curving round to her right and leaning into it, the mouth a little open, the lava blazing
      A.turn=1;A.roll+=.14;A.B[2]-=1;A.hp-=.08;A.jaw=.18;A.glow=1;A.squint=.35;A.dust=p}}
  else if(anim==='spit'){// .0-.28 rears up high, head back, the mouth glowing with fire (the lava lights up in a wave toward the head),
    // .28-.36 snaps forward and down with the jaws wide: the fireball, .36-.5 holds, .5-1 settles back with a shake of the head
    const K=[[0,[0,0,0,0,0,.55,1.5]],[.28,[12,.55,.22,-3,.8,1.05,7]],[.36,[2.5,.06,.8,3.5,0,1.1,1]],[.5,[2.5,.02,.68,2.5,0,.95,2]],[.7,[.6,.04,.1,.4,0,.7,2]],[1,[0,0,0,0,0,.55,1.5]]];
    const v=keys(K,p);A.lift=v[0];A.hp=v[1];A.jaw=v[2];A.B=[v[3],0,0];A.squint=v[4];A.glow=v[5];A.curl=v[6];A.fire=p>.22&&p<.6?(p-.22)/.38:-1;
    A.hr=p>.5?.1*Math.sin((p-.5)/.5*TAU*2)*(1-(p-.5)/.5):0;A.tw=2+4*bump(cl((p-.28)/.4,0,1));A.tp=ph*2;A.wave=-2;A.breath=p<.28?.07*ez(p/.28):.07*(1-ez(cl((p-.28)/.2,0,1)));
    A.feet[0][0]+=2*v[0]/12;A.feet[1][0]+=2*v[0]/12}
  else if(anim==='burrow'){// .0-.1 noses down, tail up, .1-.44 slides into her hole head first (the hind legs kick), the hole closes over her,
    // .58-.84 bursts up out of the ground nose first with the jaws open and the legs spread, flops forward, lands with a squash, settles
    if(p<.1){const k=ez(p/.1);A.hp=-.35*k;A.lift=-2*k;A.curl=5*k;A.squint=k;A.B=[0,0,-.8*k];A.hole=k*.7}
    else if(p<.58){const k=cl((p-.1)/.34,0,1);A.dive=Math.pow(k,1.3)*(SLT+SHX-SXF+30);A.hp=-.35;A.squint=1;A.curl=5*(1-k);A.tw=4;A.tp=ph*6;A.fBody=1;A.lift=-2;
      A.hole=p<.46?.7+.3*cl((p-.1)/.1,0,1):1-ez(cl((p-.46)/.1,0,1));A.dust=cl((p-.1)/.34,0,1)}
    else{const K=[[.58,[-34,-1.15,.75,.15]],[.66,[-12,-1,.8,.2]],[.72,[3,-.62,.6,.12]],[.78,[8,-.22,.35,.04]],[.84,[0,.04,.1,-.14]],[.9,[-.8,0,0,-.06]],[1,[0,0,0,0]]];
      const v=keys(K,p);A.B=[0,0,v[0]];A.lean=v[1];A.jaw=v[2];A.s=v[3];A.fBody=p<.82?2:0;A.hp=p<.72?.15:-.15*bump(cl((p-.72)/.2,0,1));A.squint=p<.72?.5:0;
      A.tw=5*bump(cl((p-.74)/.24,0,1));A.tp=ph*3;A.glow=.55+.5*bump(cl((p-.58)/.3,0,1));A.hole=p<.6?ez((p-.58)/.02):p<.8?1:1-ez(cl((p-.8)/.12,0,1));A.holeX=2}}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-4*kb,0,.6*kb];A.lift=3.5*kb;A.hp=.38*kb;A.hy=.15*kb;A.jaw=.3*Math.max(0,kb);A.s=-.05*kb;A.roll=.06*kb;
    A.tw=6*kb;A.tp=ph*2;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;A.curl=3*kb}
  else{// idle: she breathes, looks round slowly, the tip of the tail curls and uncurls, the lava pulses along her back
    A.breath=.035*Math.sin(ph);A.hy=look(p,.38);A.hp=.05*Math.sin(ph+.5);A.blink=blink(p,.7,.07);A.tw=1.8;A.tp=ph;A.curl=1.6+1.2*Math.sin(ph);A.B=[0,0,.25*Math.sin(ph)]}
  if(o.p2)A.glow=Math.min(1.25,A.glow+.35);
  const X=frame(A,8),S=sspine(A,X),cut=A.dive>0||A.B[2]<0?0:null;
  // the feet: on the ground in the room; during the dive and the burst they go with the body, tucked against it
  const roots=SLEG.map(([s,sd])=>{const q=ssurf(S,s,sd>0?-.35:Math.PI+.35);return q.p}),
    feet=A.feet.map((f,i)=>A.fBody===1?add(roots[i],X.Rd([i<2?-5:-9,SLEG[i][1]*(i<2?5:7),-(i<2?5:4)])):A.fBody===2?add(roots[i],X.Rd([i<2?4:-3,SLEG[i][1]*11,-7])):[f[0]+A.B[0],f[1]+A.B[1],f[2]]);
  // the head: on the front of the spine, turned by the look; cranium on top, the jaw hinged at the back under it
  const f0=S[0],Hc=add(add(f0.c,mul(f0.t,9.5)),mul(f0.w,7));let hu=nrm(add(mul(f0.t,Math.cos(A.hy)),mul(f0.v,Math.sin(A.hy))));hu=nrm(add(mul(hu,Math.cos(A.hp)),mul(f0.w,Math.sin(A.hp))));
  let hv=nrm(cross(f0.w,hu)),hw=nrm(cross(hu,hv));if(A.hr){const c=Math.cos(A.hr),s=Math.sin(A.hr),v2=add(mul(hv,c),mul(hw,s));hw=add(mul(hw,c),mul(hv,-s));hv=v2}
  const HF={u:hu,v:hv,w:hw},hl=(a,b,c)=>add(Hc,add(add(mul(hu,a),mul(hv,b)),mul(hw,c)));
  // the shadow: under the spine (only what is above the ground), smaller when she is up in the air
  {const sh=[];for(let i=0;i<S.length;i+=2){const q=S[i];if(q.c[2]+q.rz<0)continue;sh.push([q.c,q.ry*1.15*(1-cl((q.c[2]-q.rz-2)/40,0,.4))])}if(Hc[2]>-8)sh.push([Hc,14]);longShadow(V0,x,y,sc,sh,.26)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),dT=D([SXF-28,0,10]);
  // the hole she dives into and bursts out of: a dark pit with a glowing rim of lava where her spine goes through the ground
  let hq=[A.holeX,0],hr=17;for(let i=0;i<S.length-1;i++){const a=S[i].c,b=S[i+1].c;if((a[2]>0)!==(b[2]>0)){const k=a[2]/(a[2]-b[2]);hq=[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];hr=lerp(S[i].ry,S[i+1].ry,k)+5;break}}
  const pit=()=>{const q=P(hq[0],hq[1],0),r=hr*A.hole,k=C.KR();ctx.beginPath();for(let i=0;i<14;i++){const a=i/14*TAU,rr=r*(.88+.14*Math.sin(i*2.7+1));ctx.lineTo(q[0]+Math.cos(a)*rr,q[1]+Math.sin(a)*rr*.55*k)}ctx.closePath()};
  if(A.hole>0){L.add(-1e4,()=>{const q=P(hq[0],hq[1],0),r=hr*A.hole,k=C.KR();if(!LOWFX&&fx)shine('255,120,40',q[0],q[1],r*2.2,.5*A.hole,r*1.1*k);
      pit();ctx.fillStyle='#2a1208';ink(2.4);ctx.fill();ctx.stroke();ctx.save();ctx.clip();const g=ctx.createRadialGradient(q[0],q[1]+r*.3*k,1,q[0],q[1],r);
      g.addColorStop(0,`rgba(255,210,100,${.9*A.hole})`);g.addColorStop(.45,`rgba(255,110,30,${.6*A.hole})`);g.addColorStop(1,'rgba(120,30,10,0)');ctx.fillStyle=g;ctx.fillRect(q[0]-r,q[1]-r,r*2,r*2);ctx.restore()});
    // the near lip of the hole goes over her where she goes in or comes out
    L.add(1e4,()=>{const q=P(hq[0],hq[1],0),r=hr*A.hole,k=C.KR();ctx.save();ctx.beginPath();ctx.rect(q[0]-r-4,q[1]+1,2*r+8,r);ctx.clip();pit();ctx.strokeStyle='#5a2a14';ctx.lineWidth=3.2;ctx.stroke();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();ctx.restore()})}
  // the legs come out from under the body, so they are always drawn before it (in the order of their rest places)
  for(let i=0;i<4;i++){const[s,sd]=SLEG[i],r=roots[i];if(r[2]<1.5)continue;const k=farK(F(0,sd,0)),rest=[i<2?SXF-SSH:SXF-SHP,sd*20,5];
    L.add(dT-100+D(rest)*.01,()=>sleg(V0,r,feet[i],[i<2?-.25:.3,sd,1.15],k,{fx:i<2?.4:-.1}))}
  // the body and the tail: stripes, spikes along the spine, lava spots that light up in a wave
  L.add(dT,()=>{const R=S.map(q=>ring(q.c,q.v,q.w,q.ry,q.rz,12)),H=tube(V0,R,SA.body,{cut,kl:.2,kd:.3});if(!H)return;
    ctx.save();clipH(H);
    // the darker stripes across the back (the game's segments are darker and lighter in turn)
    ctx.beginPath();for(const sb of SBANDS){const w=4.2*(sb<50?1:1-(sb-50)/80);let cur=[];const flush=()=>{if(cur.length>1){ctx.moveTo(cur[0][0][0],cur[0][0][1]);for(const q of cur)ctx.lineTo(q[0][0],q[0][1]);for(let j=cur.length-1;j>=0;j--)ctx.lineTo(cur[j][1][0],cur[j][1][1]);ctx.closePath()}cur=[]};
      for(let j=0;j<=7;j++){const th=.08*Math.PI+j/7*.84*Math.PI,a=ssurf(S,sb-w,th,.05),b=ssurf(S,sb+w,th,.05);if(F(a.n)>.02&&(cut==null||a.p[2]>0))cur.push([P(a.p),P(b.p)]);else flush()}flush()}
    ctx.fillStyle=rgba(SA.band,.9);ctx.fill();
    // the lava spots: an orange rim and a bright core that swells as the wave of light runs along her back, a glow over each pair
    const SPx=[];for(const ss of SSPOTS){const br=cl(A.glow*(.62+.38*Math.sin(ph*A.wave-ss*.13)),0,1.3);for(const sd of[-1,1]){const q=ssurf(S,ss,Math.PI/2+sd*.62,.05);if(cut!=null&&q.p[2]<.5)continue;if(F(q.n)<=.08)continue;SPx.push([q,br])}
      if(!LOWFX&&fx){const q=ssurf(S,ss,Math.PI/2,.5);if(cut==null||q.p[2]>0){const c=P(q.p);shine('255,150,50',c[0],c[1],q.ry*1.25,.34*br)}}}
    ctx.beginPath();for(const[q] of SPx)discP(V0,q.p,q.n,q.ry*.34);ctx.fillStyle=SA.lavaE;ctx.fill();
    ctx.beginPath();for(const[q,br] of SPx)discP(V0,q.p,q.n,q.ry*(.16+.14*cl(br,0,1.2)));ctx.fillStyle=cmix2(SA.lava,'#fff4c0',cl(A.glow-.5,0,.6));ctx.fill();
    ctx.restore();if(!LOWFX)tubeRim(V0,cut!=null?R.filter(r=>r[0][2]>1):R,.3);
    // the spikes along the spine (all of one colour: they are filled together)
    ctx.beginPath();for(const sb of SBANDS){const q=ssurf(S,sb,Math.PI/2,-.3);if(cut!=null&&q.p[2]<.5)continue;const h=3.6*(q.rz/9)+1,r=1.7*(q.rz/9)+.7,b=q.p,tip=add(add(b,mul(q.n,h)),mul(q.t,-h*.45)),sd=nrm(cross(q.n,q.t)),pts=[P(tip)];
      for(let i=0;i<8;i++){const a=i/8*TAU;pts.push(P(add(b,add(mul(q.t,Math.cos(a)*r),mul(sd,Math.sin(a)*r)))))}const h2=chull(pts);ctx.moveTo(h2[0][0],h2[0][1]);for(const p2 of h2)ctx.lineTo(p2[0],p2[1]);ctx.closePath()}
    ctx.fillStyle=SA.spike;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.lineJoin='round';ctx.stroke()});
  // the head (with its own frame: it turns on the neck)
  const dH=D([SXF+9.5,0,16]);
  L.add(dH,()=>{const ja=A.jaw*.62,rC=[17,17.5,11.8],cC=hl(0,0,1),Hd=splitHead(Hc,HF,[{c:[0,0,1],r:rC}],1-.22*rC[2],ja,5,16),hc=cut!=null?0:null,fv=F(hu);
    // the fireball between the jaws (an effect of the move: the game shoots its own fire); behind the head when she faces away
    const fball=()=>{if(!fx||A.fire<0)return;const k=A.fire,m=add(lerp3(Hd.lip(0,0),Hd.lip(0,1),.5),mul(hu,1+k*6)),q=P(m),
      r=k<.35?2+k/.35*4.4:6.4*(1-(k-.35)/.65)+.4;if(!LOWFX)shine('255,140,40',q[0],q[1],r*3.4,.6*(1-k*.5));ink(1.6);ball(q,r);ctx.fillStyle=C.softBall(q,r,SA.lava,.55,.25);ctx.fill();ctx.stroke();
      ctx.fillStyle='rgba(255,255,235,.92)';ball([q[0]-r*.28,q[1]-r*.3],r*.4);ctx.fill()};
    if(fv<-.1)fball();
    // the jaw (lighter: the throat); when it drops, the inside of the mouth shows on top of it: a tongue, the fire glowing in it
    blob(V0,Hd.bowl,SA.jaw,{cut:hc,kl:.18,kd:.25,rim:.2});
    if(ja>.03&&F(Hd.wJ)>.02){const fl=Hd.floor.filter(q=>hc==null||q[2]>0).map(q=>P(q));if(fl.length>2){const h=chull(fl);poly(h);ctx.fillStyle=SA.mouth;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();
      ctx.beginPath();discP(V0,Hd.jaw([rC[0]*.28,0,Hd.hz+.3]),Hd.wJ,rC[0]*.26);ctx.fillStyle=SA.tongue;ctx.fill();
      if(A.fire>=0||A.glow>.9){const m=P(Hd.jaw([rC[0]*.45,0,Hd.hz])),g=ctx.createRadialGradient(m[0],m[1],1,m[0],m[1],11);g.addColorStop(0,'rgba(255,240,160,.95)');g.addColorStop(1,'rgba(255,120,30,0)');poly(h);ctx.fillStyle=g;ctx.fill()}}}
    // the top of the head: big and round
    const hp=blob(V0,Hd.dome,SA.body,{cut:hc,kl:.2,kd:.28});if(hp.length<3){if(fv>=-.1)fball();return}
    // the palate when the head is up so high that its underside shows; the lip: a wide grin round the front; two little fangs
    if(ja>.03&&F(mul(HF.w,-1))>.02){poly(chull(Hd.palate.map(q=>P(q))));ctx.fillStyle=dk(SA.mouth,.2);ctx.fill()}
    {let r=[];ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.lineCap='round';ctx.lineJoin='round';
      for(let i=0;i<=12;i++){const t=-1.35+i/12*2.7,q=Hd.lip(t,0);if(F(Hd.lipN(t))>.06&&(hc==null||q[2]>0))r.push(P(q));else if(r.length){if(r.length>1){line(r);ctx.stroke()}r=[]}}if(r.length>1){line(r);ctx.stroke()}}
    for(const sd of[-1,1]){const t=sd*.36;if(F(Hd.lipN(t))<.12)continue;const b=Hd.lip(t,0),q=P(b),e=P(add(b,mul(hw,-(2.6+ja*2.4))));
      ctx.fillStyle=SA.fang;ctx.strokeStyle=INK;ctx.lineWidth=.8;tri(q[0],q[1]-.4,e[0],e[1],1.1)}
    // the nostrils, the eyes, the brows
    for(const sd of[-1,1]){const n=nrm([.94,sd*.2,.28]),q=ellAt(cC,rC,HF,n);if(F(ellN(rC,HF,n))<.1)continue;const s=P(q);ctx.fillStyle='rgba(60,12,4,.75)';ctx.beginPath();ctx.ellipse(s[0],s[1],1,.7,0,0,TAU);ctx.fill()}
    const fc=ellFace(V0,IDF,cC,rC,HF);
    // the big yellow eyes with fierce little brows slanting down toward the snout
    const E=eyeSpots(fc.h,17,{at:fc.at,dir:[.6,.5,.62],rx:4.6,fall:.5,a:.5,b:.66,gap:.6}),eo={white:SA.eye,lw:1.5,blink:A.blink,squint:A.squint,shut:A.shut};
    for(const e of E){eyeC(e.q,e.rx,5.3,eo,fc.h);if(!A.shut&&e.rx>1.2)brow(e,fc.h,5.3*(1-.3*A.squint),2)}
    if(fv>=-.1)fball()});
  run(L);
  if(A.stars>0)bstars(P(add(Hc,[0,0,17])),13,A.stars);
  ctx.restore()}
const cmix2=(a,b,k)=>C.cmix(a,b,k);
reg('salamander',{n:'Salamandra di Lava',g:'boss',sc:1,an:['idle','walk','spit','burrow','circle','hit'],dur:{idle:2.6,walk:.9,spit:1.1,burrow:1.8,circle:.5,hit:.7},
  lab:{idle:'Ferma',walk:'Cammina',spit:'Sputa fuoco',burrow:'Si tuffa sotto terra',circle:'Corsa di fuoco',hit:'Colpita'}},salamander);

// ------------------------------------------------------------------ IDRA DELLA PALUDE (EDRAW.hydra, EUPD.hydra, 55-idra-entrata.js, B2.hydra)
// The game draws a green scaly mound in the water with five dark fins on top and three serpent heads on long necks (a light stripe down
// each neck), glowing yellow eyes with a slit, a lighter jaw that opens on little teeth, a spike at the back of each head; in the
// second phase the skin turns grey-green and the fins and eyes purple. Here the same pieces are volumes: the mound is a dome with rows
// of scales, the fins are cones, the necks are smooth tubes, every head is a top and a jaw with its own frame (it turns and nods on its
// own), with slit eyes that glow, two little fangs, a crest of three spikes. The game can drive each head (o.heads).
const HY={body:'#3f7a4a',belly:'#a8d0a0',fin:'#2a5a34',eye:'#ffd23c',eyeRgb:'255,210,60',mouth:'#4a1a1a',tongue:'#e07a8a',fang:'#f6ead2',venom:'#9be05a',venomRgb:'150,230,90'};
const HY2={body:'#3a5a5a',fin:'#7a4aa8',eye:'#c48aff',eyeRgb:'196,138,255',venom:'#c8a0ff',venomRgb:'190,150,255'};
const HYB=[34,47,36],HYE=[{c:[-3,0,.5],r:[10,10,8.6]},{c:[6.5,0,-.6],r:[10.5,7,5.8]}],HYC=[-3,0,.5],HYCR=[10,10,8.6];
// the three necks: where each starts on the mound and where its head rests
const HYN=[{s:-1,base:[9,-21,28],rest:[14,-44,68]},{s:0,base:[13,0,31],rest:[18,0,86]},{s:1,base:[9,21,28],rest:[14,44,68]}];
// the fins on the mound: a crown round its back behind the necks, [angle round the mound (π = the back), length, base radius]
const HYF=[[2.04,11,4.2],[2.64,14,4.8],[3.14,17,5.3],[3.64,14,4.8],[4.24,11,4.2]];
// a neck from the base b to the back of the head (centre hc, forward hu, up hw): a cubic curve leaving the mound upward and entering
// the head from below behind it; sw bows it sideways, fw forward. Returns its rings (round, radius from 7.2 down to 5.2)
function hneck(b,hc,hu,hw,sw,fw,m){const e=add(add(hc,mul(hu,-7)),mul(hw,-3.5)),L=len(sub(e,b)),c1=add(b,[fw,sw*.6,L*.42]),c2=add(add(e,mul(hw,-L*.34)),add(mul(hu,-L*.1),[fw*.5,sw,0])),N=7,C=[],R=[];
  for(let i=0;i<=N;i++){const t=i/N,u=1-t;C.push(add(add(mul(b,u*u*u),mul(c1,3*u*u*t)),add(mul(c2,3*u*t*t),mul(e,t*t*t))))}
  for(let i=0;i<=N;i++){const tg=nrm(sub(C[Math.min(N,i+1)],C[Math.max(0,i-1)])),ref=nrm(lerp3([1,0,0],hu,i/N));let fr=sub(ref,mul(tg,dot(ref,tg)));if(len(fr)<.15)fr=sub([0,0,-1],mul(tg,-tg[2]));fr=nrm(fr);
    const v=nrm(cross(tg,fr)),r=lerp(8.4,6.2,i/N);R.push({c:C[i],t:tg,f:fr,v,r,ring:ring(C[i],v,fr,r,r,m)})}return R}
function hydra(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU,fx=!o.noFx,K=o.p2?Object.assign({},HY,HY2):HY,wl=o.water==null?0:o.water;
  // the body (B, lean, roll, s, breath) and every head: off (from its rest place), yaw (> 0 to its right), pitch (> 0 up), roll, open (the jaw),
  // sw/fw (how the neck bows), blink, squint, shut, glob (the venom it spits), mist (the poison breath)
  const A={B:[0,0,0],lean:0,roll:0,s:0,breath:0,fin:0,finW:0,stars:0},H=HYN.map(()=>({off:[0,0,0],yaw:0,pitch:-.1,roll:0,open:0,sw:0,fw:0,blink:1,squint:0,shut:0,glob:-1,mist:-1,alive:true}));
  const who=o.who==null?1:o.who;
  if(anim==='walk'){// it swims: the mound rocks and glides, a wave runs through the three necks and along the fins
    A.B=[0,0,1.2*Math.sin(ph*2)];A.roll=.04*Math.sin(ph);A.lean=.03*Math.sin(ph*2+1);A.finW=1;
    H.forEach((h,i)=>{const q=ph-i*.9;h.sw=7*Math.sin(q);h.off=[1.5*Math.cos(q),3*Math.sin(q-.6),1.5*Math.sin(q*2)];h.yaw=-.12*Math.sin(q-.6);h.pitch=-.1;h.open=.08;h.blink=blink(p,.2+i*.27,.07)})}
  else if(anim==='bite'){// one head (o.who, the middle one by default) rears back with its jaws wide open (.0-.45), strikes forward and down to the
    // ground (.45-.53), snaps shut and holds there (.53-.72), pulls back up (.72-1); the other two hiss and watch
    const Kb=[[0,[0,0,0,-.1,0,0]],[.45,[-12,0,10,.25,1,-5]],[.53,[50,0,-68,-.6,.25,12]],[.56,[47,0,-69,-.55,0,10]],[.72,[44,0,-66,-.5,0,9]],[1,[0,0,0,-.1,0,0]]];
    H.forEach((h,i)=>{if(i===who){const v=keys(Kb,p);h.off=[v[0],v[1],v[2]];h.pitch=v[3];h.open=v[4];h.fw=v[5];h.squint=p>.4&&p<.75?.6:0;if(p>.53&&p<.72)h.yaw=.08*Math.sin((p-.53)*70)*(1-(p-.53)/.19)}
      else{const k=bump(cl(p/.9,0,1));h.yaw=(HYN[who].rest[1]-HYN[i].rest[1])*.006*k;h.pitch=-.1-.15*k;h.open=.35*k;h.off=[-3*k,0,3*k];h.blink=blink(p,.15+i*.3,.07)}})}
  else if(anim==='spit'){// one head rears up and back (.0-.35), lobs a ball of venom forward and up (.35-.45), then settles
    const Ks=[[0,[0,0,-.1,0]],[.35,[-9,9,.45,.3]],[.45,[9,2,.2,1]],[.6,[4,1,0,.5]],[1,[0,0,-.1,0]]];
    H.forEach((h,i)=>{if(i===who){const v=keys(Ks,p);h.off=[v[0],0,v[1]];h.pitch=v[2];h.open=v[3];h.glob=p>.36&&p<.8?(p-.36)/.44:-1;h.squint=p<.45?.5:0}
      else{h.yaw=look(p+i*.3,.2);h.off=[0,0,1.5*Math.sin(ph+i)];h.blink=blink(p,.3+i*.3,.07)}})}
  else if(anim==='dive'){// all three rear up hissing (.0-.14), plunge into the water one after the other and the mound sinks (.14-.42); under
    // the water (.42-.6); they burst out again one at a time, the middle one first (.6-.84), the mound heaves up, and they roar (.84-1)
    const st=[.04,.08,0],up=[.06,0,.12];A.B=[0,0,p<.42?-50*ez(cl((p-.18)/.24,0,1)):p<.6?-50:-50*(1-ez(cl((p-.62)/.24,0,1)))];
    H.forEach((h,i)=>{let z=0,pi=0,op=0;if(p<.14){const k=ez(p/.14);z=9*k;pi=.35*k;op=.8*k}
      else if(p<.6){const k=ez(cl((p-.14-st[i])/.2,0,1));z=9-130*k;pi=.35-1.1*k;op=.8*(1-k)}
      else{const k=ez(cl((p-.6-up[i])/.16,0,1)),k2=ez(cl((p-.76-up[i])/.16,0,1));z=-130+140*k-10*k2;pi=-.75+1.3*k-.6*k2;op=k*(1-k2)+.25*k2*(1-cl((p-.9)/.1,0,1))}
      h.off=[0,0,z];h.pitch=-.1+pi;h.open=op;h.sw=4*Math.sin(ph*3+i)*sstep(.6,.64,p)*(1-sstep(.86,.9,p));h.squint=op>.5?.5:0})}
  else if(anim==='breath'){// the three heads rear back and fill up (.0-.3), thrust forward with the jaws wide (.3-.4) and pour out the
    // poison breath (.4-.8, the game draws the beams), then settle
    const Kr=[[0,[0,0,-.1,0]],[.3,[-7,8,.4,.3]],[.4,[10,-8,-.25,1]],[.8,[8,-6,-.2,1]],[1,[0,0,-.1,0]]];
    H.forEach((h,i)=>{const v=keys(Kr,cl(p-(i-1)*.02,0,1));h.off=[v[0],0,v[1]];h.pitch=v[2];h.open=v[3];h.yaw=(i-1)*.1*sstep(.27,.33,p)*(1-sstep(.77,.83,p));if(p>.4&&p<.8)h.off[2]+=.8*sstep(.4,.43,p)*(1-sstep(.77,.8,p))*Math.sin((p-.4)*TAU*8*1.6+i*2);
      h.mist=p>.36&&p<.84?(p-.36)/.48:-1;h.squint=p>.3&&p<.8?.7:p<.3?.3:0})}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-4*kb,0,0];A.lean=-.07*kb;A.s=-.04*kb;A.stars=p<.75?1-p/.75:0;
    H.forEach((h,i)=>{h.off=[-7*kb,(i-1)*3*kb,4*kb];h.pitch=-.1+.4*kb;h.open=.55*Math.max(0,kb);h.shut=p<.5?1:0;h.sw=-(i-1)*3*kb})}
  else{// idle: the necks sway slowly, each head looks round on its own, now and then a little hiss; the mound breathes
    A.breath=.02*Math.sin(ph);A.B=[0,0,.5*Math.sin(ph)];A.fin=.08*Math.sin(ph);
    H.forEach((h,i)=>{const q=ph+i*2.1;h.off=[1.2*Math.sin(q),1.5*Math.sin(q+1),1.6*Math.sin(q+.5)];h.sw=3*Math.sin(q);h.yaw=look((p+i*.37)%1,.32);
      h.pitch=-.1+.06*Math.sin(q*2);h.open=.18*Math.max(0,Math.sin(q-1))**3;h.blink=blink(p,(.2+i*.31)%1,.07)})}
  // the game may drive the heads: alive, open (0..1), a (look, added), z (raise, added), ext (0..1: a bite reaching to the ground in front)
  if(o.heads)o.heads.forEach((g,i)=>{const h=H[i];if(!h||!g)return;if(g.alive===false)h.alive=false;if(g.open!=null)h.open=Math.max(h.open,g.open);if(g.a)h.yaw+=g.a;if(g.z)h.off[2]+=g.z;
    if(g.ext){const k=cl(g.ext,0,1);h.off=lerp3(h.off,[48,0,-68],k);h.pitch=lerp(h.pitch,-.55,k)}});
  const X=frame(A,10);
  if(o.water==null&&!(typeof noShadow!=='undefined'&&noShadow)){const q=P(A.B[0],A.B[1],0),k=C.KR(),al=.32*cl(1+A.B[2]/30,0,1);if(al>0){ctx.fillStyle=`rgba(0,0,0,${al})`;ctx.beginPath();ctx.ellipse(x+q[0]*sc,y+q[1]*sc,50*sc,50*.55*k*sc,0,0,TAU);ctx.fill()}}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),dB=D([0,0,14]);
  // the mound: a dome of scales cut at the water (or the ground), five fins along its top
  L.add(dB,()=>{const Rb=[HYB[0]*(1+A.breath),HYB[1]*(1+A.breath),HYB[2]*(1+A.breath*1.4)],rows=ellRows([0,0,0],Rb,C.AXES,4,18,0).map(r=>r.map(X.T)),hp=blob(V0,rows,K.body,{cut:wl,kl:.2,kd:.3});if(hp.length<3)return;
        // rows of scales: little dark half discs facing us (away from the outline, so they need no clipping)
    ctx.beginPath();for(const[el,n,r] of[[.24,16,5.2],[.6,12,4.4]])for(let k=0;k<n;k++){const az=k/n*TAU+el*2,m=[Math.cos(az)*Math.cos(el),Math.sin(az)*Math.cos(el),Math.sin(el)],c=X.T(ellAt([0,0,0],Rb,null,m)),nn=X.Rd(ellN(Rb,null,m));
      if(F(nn)<.3||c[2]<wl+1)continue;const hz=nrm(cross(nn,[0,0,1])),dn=nrm(cross(hz,nn)),q0=P(add(c,mul(hz,r)));ctx.moveTo(q0[0],q0[1]);for(let j=1;j<=4;j++){const t=j/4*Math.PI,q=P(add(c,add(mul(hz,Math.cos(t)*r),mul(dn,-Math.sin(t)*r*.8))));ctx.lineTo(q[0],q[1])}ctx.closePath()}
    ctx.fillStyle='rgba(10,30,15,.2)';ctx.fill();
    // the fins: dark cones along the top of the back, rippling when it swims
    ctx.beginPath();for(let i=0;i<HYF.length;i++){const[az,fl,fr]=HYF[i],el=.82,m=[Math.cos(az)*Math.cos(el),Math.sin(az)*Math.cos(el),Math.sin(el)],b=X.T(add(ellAt([0,0,0],Rb,null,m),[0,0,-1.5])),wv=A.finW*.3*Math.sin(ph*2-i*1.1)+A.fin,
      ax=X.Rd(nrm(add(add(mul(ellN(Rb,null,m),.55),[0,0,.8]),[wv*Math.cos(az),wv*Math.sin(az),0]))),tip=add(b,mul(ax,fl)),u=nrm(cross(ax,[0,0,1])),v=nrm(cross(ax,u)),pts=[P(tip)];if(b[2]<wl)continue;
      for(let j=0;j<8;j++){const t=j/8*TAU;pts.push(P(add(b,add(mul(u,Math.cos(t)*fr),mul(v,Math.sin(t)*fr)))))}const h=chull(pts);ctx.moveTo(h[0][0],h[0][1]);for(const q of h)ctx.lineTo(q[0],q[1]);ctx.closePath()}
    ctx.fillStyle=K.fin;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.lineJoin='round';ctx.stroke()});
  // the necks and the heads, each with its own frame; a neck goes behind or over its head as the rest pose says
  H.forEach((h,i)=>{if(!h.alive)return;const n=HYN[i],base=X.T(n.base),hc=X.T(add(n.rest,h.off)),yw=h.yaw+n.s*.3,
      hu=nrm(X.Rd([Math.cos(h.pitch)*Math.cos(yw),Math.cos(h.pitch)*Math.sin(yw),Math.sin(h.pitch)])),hv=nrm(cross(X.Rd([0,0,1]),hu)),hw=nrm(cross(hu,hv)),HF={u:hu,v:hv,w:hw},
      rest=add(n.rest,[-7,0,-3.5]),neckFirst=D(rest)<D(n.rest);
    L.add(D(n.base)+.01*i,()=>{const NK=hneck(base,hc,hu,hw,h.sw*(n.s||1),h.fw,10);
      const neck=()=>{const Hn=tube(V0,NK.map(q=>q.ring),K.body,{cut:wl,kl:.22,kd:.3});if(!Hn)return;
        // the light stripe down the front of the neck
        let r=[];ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=K.belly;const flush=()=>{if(r.length>1){ctx.lineWidth=3.6;line(r);ctx.stroke()}r=[]};
        for(const q of NK){const sp=add(q.c,mul(q.f,q.r*.58));if(F(q.f)>.12&&sp[2]>wl+1)r.push(P(sp));else flush()}flush()};
      if(neckFirst)neck();hhead(V0,hc,HF,h,K,wl,fx);if(!neckFirst)neck()})});
  run(L);
  if(A.stars>0&&H[1].alive)bstars(P(X.T(add(HYN[1].rest,add(H[1].off,[0,0,14])))),14,A.stars);
  ctx.restore()}
// a head of the hydra: a wedge of two ellipsoids (the round back of the head and the long snout) split at the mouth; a crest of three spikes,
// the lighter jaw, the mouth with the tongue and two little fangs, the nostrils, slit eyes that glow; the venom it spits, the mist of its breath
function hhead(V0,hc,HF,h,K,wl,fx){const{P,F}=V0,ja=h.open*.75,Hd=splitHead(hc,HF,HYE.map(e=>({c:e.c,r:e.r})),-2.2,ja,3,12),hu=HF.u,hw=HF.w,fv=F(hu);
  if(hc[2]+10<wl)return;
  // the crest: three dark spikes fanning out at the back of the head (over the head when we see it from behind)
  const crest=()=>{ctx.beginPath();for(const[dy,l2] of[[-.6,8],[0,11],[.6,8]]){const b=Hd.top([-7.5,dy*4.5,6]),ax=nrm(add(add(mul(hu,-.5),mul(HF.v,dy*.75)),mul(hw,.9))),tip=add(b,mul(ax,l2)),
    u=nrm(cross(ax,hw)),v=nrm(cross(ax,u)),pts=[P(tip)];if(b[2]<wl)continue;for(let j=0;j<6;j++){const t=j/6*TAU;pts.push(P(add(b,add(mul(u,Math.cos(t)*2.6),mul(v,Math.sin(t)*2.6)))))}
    const g=chull(pts);ctx.moveTo(g[0][0],g[0][1]);for(const q of g)ctx.lineTo(q[0],q[1]);ctx.closePath()}ctx.fillStyle=K.fin;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.lineJoin='round';ctx.stroke()};
  const back=F(mul(hu,-1))>.25;if(!back)crest();
  // the venom ball and the mist come out of the mouth (effects of the move; the game throws its own venom and draws the breath)
  const mouthAt=k=>add(lerp3(Hd.lip(0,0),Hd.lip(0,1),.5),mul(hu,k));
  const glob=()=>{if(!fx||h.glob<0)return;const k=h.glob,m=add(mouthAt(2+k*30),[0,0,16*Math.sin(k*Math.PI)]),q=P(m),r=k<.15?2+k/.15*5:7*(1-k*.6);
    if(!LOWFX)shine(K.venomRgb,q[0],q[1],r*3,.45*(1-k));ink(1.4);ball(q,r);ctx.fillStyle=C.softBall(q,r,K.venom,.45,.25);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.8)';ball([q[0]-r*.3,q[1]-r*.3],r*.32);ctx.fill()};
  const mist=()=>{if(!fx||h.mist<0||LOWFX)return;const k=h.mist;for(let j=0;j<4;j++){const u=(k*2.4+j/4)%1,m=add(mouthAt(3+u*20),[0,0,u*4]),q=P(m);ctx.fillStyle=`rgba(${K.venomRgb},${.45*(1-u)*Math.min(1,k*5)*(1-k*.6)})`;ball(q,2.5+u*7);ctx.fill()}};
  if(fv<-.1){glob();mist()}
  // the jaw (lighter), the inside of the mouth with the tongue when it opens
  blob(V0,Hd.bowl,K.belly,{cut:wl,kl:.15,kd:.25,rim:.2});
  if(ja>.04&&F(Hd.wJ)>.02){const fl=Hd.floor.filter(q=>q[2]>wl).map(q=>P(q));if(fl.length>2){const g=chull(fl);poly(g);ctx.fillStyle=K.mouth;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
    ctx.beginPath();discP(V0,Hd.jaw([3,0,Hd.hz+.3]),Hd.wJ,3.6);ctx.fillStyle=K.tongue;ctx.fill()}}
  const hp=blob(V0,Hd.dome,K.body,{cut:wl,kl:.22,kd:.3});
  if(hp.length>2){
    if(ja>.04&&F(mul(hw,-1))>.02){poly(chull(Hd.palate.map(q=>P(q))));ctx.fillStyle=dk(K.mouth,.2);ctx.fill()}
    {let r=[];ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.lineCap='round';for(let i=0;i<=12;i++){const t=-1.45+i/12*2.9,q=Hd.lip(t,0);if(F(Hd.lipN(t))>.03&&q[2]>wl)r.push(P(q));else if(r.length){if(r.length>1){line(r);ctx.stroke()}r=[]}}if(r.length>1){line(r);ctx.stroke()}}
    // the nostrils at the tip of the snout
    const sc2=Hd.top(HYE[1].c);for(const sd of[-1,1]){const m=nrm([.95,sd*.2,.3]);if(F(ellN(HYE[1].r,HF,m))<.1)continue;const q=P(ellAt(sc2,HYE[1].r,HF,m));ctx.fillStyle='rgba(10,30,15,.7)';ctx.beginPath();ctx.ellipse(q[0],q[1],.9,.6,0,0,TAU);ctx.fill()}
    // the eyes: yellow with a slit, glowing, on the round back of the head where the snout begins
    const fc=ellFace(V0,IDF,Hd.top(HYC),HYCR,HF);if(!LOWFX&&!h.shut)for(const sd of[-1,1]){const e=fc.at(nrm([.55,sd*.6,.55]));if(e.v>.15)shine(K.eyeRgb,e.q[0],e.q[1],8,.45*e.v)}
    const E=eyeSpots(fc.h,10,{at:fc.at,dir:[.55,.6,.55],rx:3.5,fall:.55,a:.5,b:.64,gap:.5,v0:.2}),eo={white:lt(K.eye,.4),iris:K.eye,pupil:'slit',lw:1.2,blink:h.blink,squint:h.squint,shut:h.shut};
    // with a fierce brow ridge over each, slanting down toward the snout
    for(const e of E){eyeC(e.q,e.rx,4,eo,fc.h);if(!h.shut&&e.rx>1.1)brow(e,fc.h,4*(1-.3*h.squint),1.7)}
    if(ja>.15)for(const sd of[-1,1]){const t=sd*.32;if(F(Hd.lipN(t))<.1)continue;const b=Hd.lip(t,0),q=P(b),e=P(add(b,mul(hw,-(1.8+ja*2.4))));ctx.fillStyle=K.fang;ctx.strokeStyle=INK;ctx.lineWidth=.8;tri(q[0],q[1]-.3,e[0],e[1],1.05)}}
  if(back)crest();
  if(fv>=-.1){glob();mist()}}
reg('hydra',{n:'Idra della Palude',g:'boss',sc:1,an:['idle','walk','bite','spit','dive','breath','hit'],dur:{idle:3,walk:1.6,bite:1.4,spit:1.1,dive:2.6,breath:1.6,hit:.8},
  lab:{idle:'Ferma',walk:'Nuota',bite:'Morso',spit:'Sputa veleno',dive:'Si tuffa e riaffiora',breath:'Soffio velenoso',hit:'Colpita'}},hydra);

// ------------------------------------------------------------------ IL MIMIC (drawMimicDS, mimicUpd)
// The game draws a rotten chest standing on two long pale legs with the knees bent backward, two long pale arms hanging to the floor with
// three claws each, a lid that breathes over a row of teeth, a dark tongue hanging over the front, metal bands and a lock. Here the chest
// is a real box of planks with its bands, rivets, moss and lock, the lid is hinged on the back edge and opens on two rows of teeth; legs
// and arms have two bones with IK and knobbly joints; the tongue is a soft chain that hangs, sways and lashes out.
const MI={wood:'#5a3a22',woodL:'#76502e',woodD:'#38220f',band:'#7a5a2a',bandL:'#b08a40',skin:'#9d968a',skinD:'#6a645b',claw:'#e8e0cc',
  mouth:'#2a0808',teeth:'#efe6c8',tongue:'#8a2a3a',coin:'#ffc93c'};
const MX=15,MY=20,MZ0=24,MZ1=46;
// the lid in its own frame: lx from the hinge on the back edge (0) to the front edge (30), ly across, lz up from the rim; its top is arched
const mtop=(lx,ly)=>2.5+6*Math.sqrt(Math.max(0,1-(ly/MY)**2))*(1-.35*((lx-MX)/MX)**2);
const MLID=(()=>{const P=[];for(const lx of[0,30])for(const ly of[-MY,MY])P.push([lx,ly,0]);for(let i=0;i<=4;i++)for(let j=0;j<=6;j++){const lx=i*7.5,ly=-MY+j*MY/3;P.push([lx,ly,mtop(lx,ly)])}return P})();
// a pale bony limb: two bones with the IK joint, a knob on it, every outline first, then the hand or foot, then the fills
function mlimb(V0,a,f,L1,L2,pole,w,col,end){const[kn,t]=ik(a,f,L1,L2,pole),A2=V0.P(a),K2=V0.P(kn),T2=V0.P(t),r=w/2;
  ctx.beginPath();capsP(A2,r+1.5,K2,r*.9+1.5);capsP(K2,r*.9+1.5,T2,r*.75+1.5);ballP(K2,r*1.3+1.5);ctx.fillStyle=INK;ctx.fill();if(end)end(t,kn);
  ctx.beginPath();capsP(A2,r,K2,r*.9);capsP(K2,r*.9,T2,r*.75);ballP(K2,r*1.3);ctx.fillStyle=col;ctx.fill();if(!LOWFX){rim(A2,r,K2,r*.9,.28);rim(K2,r*.9,T2,r*.75,.24)}return{kn,t}}
function mimic(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU,fx=!o.noFx;
  // the pose: the chest (B, lean > 0 forward, roll, s), the lid (op 0..1), the feet (room) and the hands (body), the tongue (tl: how far it
  // hangs, tx: how far it lashes forward, sw: its sway), the claws (hu: 1 when the hands point up), coins, stars
  const A={B:[0,0,0],lean:0,roll:0,s:0,op:.1+.07*Math.sin(ph),feet:[[0,-14,0],[0,14,0]],hands:[[5,-31,3],[5,31,3]],hu:0,tl:.5,tx:0,sw:Math.sin(ph*2),coins:-1,stars:0,glow:0};
  if(anim==='walk'){// a scuttle: the legs step in turn, the chest bobs on every step, the long arms swing like crutches, the lid chatters
    const st=stepper(p,.5),a=st(0,9,7),b=st(.5,9,7);A.feet=[[a.x,-14,a.z],[b.x,14,b.z]];A.B=[0,0,2.4*Math.abs(Math.sin(ph))-1];A.roll=.05*Math.sin(ph);A.lean=.06;
    A.hands=[[5-8*Math.cos(ph),-31,3+3*Math.max(0,Math.sin(ph+Math.PI))],[5+8*Math.cos(ph),31,3+3*Math.max(0,Math.sin(ph))]];A.op=.12+.22*Math.abs(Math.sin(ph*3));A.tl=.55;A.sw=Math.sin(ph*2)*1.5}
  else if(anim==='chomp'){// .0-.45 crouches with the arms raised wide and the lid wide open, .45-.75 lunges forward chomping three times
    // with the arms reaching, .75-1 settles back
    const K=[[0,[0,0,0,0,.1]],[.45,[-3,-6,-.12,1,1]],[.52,[12,1,.28,0,1]],[.75,[10,0,.18,0,.4]],[1,[0,0,0,0,.1]]],v=keys(K,p);
    A.B=[v[0],0,v[1]];A.lean=v[2];A.hu=v[3];A.op=p<.45?.1+.9*ez(p/.45):p<.75?.25+.75*Math.abs(Math.cos((p-.45)/.3*Math.PI*3)):lerp(1,v[4],ez(cl((p-.75)/.1,0,1)));A.tl=.3;A.glow=1-sstep(.72,.85,p);
    const up=v[3],reach=bump(cl((p-.45)/.4,0,1));A.hands=[-1,1].map(sd=>[lerp(lerp(5,4,up),26,reach),sd*lerp(lerp(31,30,up),17,reach),lerp(lerp(3,66,up),34,reach)]);
    A.feet=[[v[0]*.4,-14,0],[v[0]*.4,14,0]]}
  else if(anim==='tongue'){// .0-.3 opens wide and leans back, the tongue curled inside, .3-.48 the tongue lashes out along the floor,
    // .48-.7 it whips there, .7-1 it rolls back in
    A.op=p<.3?.1+.9*ez(p/.3):p<.75?1:1-.85*ez((p-.75)/.25);A.lean=p<.3?-.12*ez(p/.3):p<.5?-.12+.22*ez((p-.3)/.2):.1*(1-ez(cl((p-.5)/.5,0,1)));A.glow=p<.8?1:0;
    A.tl=p<.3?.5*(1-p/.3):0;A.tx=p<.3?0:p<.48?ez((p-.3)/.18):p<.7?1:1-ez((p-.7)/.3);A.sw=p>.4&&p<.75?Math.sin((p-.4)*45)*(1-(p-.4)/.35):0;A.B=[-2*A.lean*10,0,0]}
  else if(anim==='coins'){// .0-.35 rears back and swells, the lid wide open, .35-.5 heaves forward and spits a fan of coins, .5-1 settles
    const K=[[0,[0,0,.1]],[.35,[-.2,.05,1]],[.48,[.22,-.04,1]],[.7,[.05,0,.5]],[1,[0,0,.1]]],v=keys(K,p);A.lean=v[0];A.s=v[1];A.op=v[2];A.coins=p>.36&&p<.85?(p-.36)/.49:-1;A.glow=p<.7?1:0;A.tl=.2;
    A.hands=[-1,1].map(sd=>[5-6*v[0],sd*(31+8*Math.max(0,-v[0])*4),3+20*Math.max(0,-v[0])])}
  else if(anim==='quake'){// .0-.25 crouches deep, .25-.55 jumps high with the legs hanging and the arms up, .55-.62 slams down (the arms hit the floor,
    // the lid bangs open), .62-1 shakes and settles
    const K=[[0,[0,0,.1,0]],[.25,[-8,.12,.2,.6]],[.4,[30,-.05,.5,1]],[.55,[18,0,.3,.8]],[.6,[-6,-.15,1,0]],[.72,[-1,.04,.6,0]],[1,[0,0,.1,0]]],v=keys(K,p);
    A.B=[0,0,v[0]];A.s=v[1];A.op=v[2];A.hu=v[3];const air=Math.max(0,v[0]);A.feet=[[0,-14,air*.75],[0,14,air*.75]];A.B[1]=p>.6&&p<.8?1.2*Math.sin((p-.6)*90)*(1-(p-.6)/.2):0;
    A.hands=[-1,1].map(sd=>[lerp(5,6,v[3]),sd*lerp(lerp(31,36,cl((p-.56)/.06,0,1)*(1-sstep(.7,.8,p))),30,v[3]),lerp(3+air*.7,64,v[3])]);A.glow=sstep(.53,.57,p)*(1-sstep(.76,.84,p))}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-4*kb,0,1.2*kb];A.lean=-.18*kb;A.roll=.06*kb;A.op=p<.12?.02:.1+.5*Math.max(0,kb);A.stars=p<.75?1-p/.75:0;
    A.hands=[-1,1].map((sd,i)=>[5-6*kb,sd*(31+6*kb),3+16*Math.max(0,kb)+(i?4:0)*kb]);A.tl=.3}
  else{// idle: the lid breathes, the tongue sways, now and then the whole chest twitches
    A.B=[0,0,.5*Math.sin(ph)];if(p>.55&&p<.6)A.B[1]=1.4*Math.sin((p-.55)*500);A.hands=[[5+1.5*Math.sin(ph+1),-31,3],[5+1.5*Math.sin(ph-1),31,3]]}
  if(o.p2)A.glow=Math.max(A.glow,.5);
  const X=frame(A,35),th=A.op*1.05,lid=q=>X.T([-MX+q[0]*Math.cos(th)-q[2]*Math.sin(th),q[1],MZ1+q[0]*Math.sin(th)+q[2]*Math.cos(th)]),lidD=v=>X.Rd([v[0]*Math.cos(th)-v[2]*Math.sin(th),v[1],v[0]*Math.sin(th)+v[2]*Math.cos(th)]);
  {const q=P(A.B[0],A.B[1],0),air=cl(A.B[2]/40,0,.5);if(!(typeof noShadow!=='undefined'&&noShadow)){ctx.fillStyle=`rgba(0,0,0,${.34*(1-air)})`;ctx.beginPath();ctx.ellipse(x+q[0]*sc,y+q[1]*sc,32*sc*(1-air*.5),32*.42*C.KR()*sc*(1-air*.5),0,0,TAU);ctx.fill()}}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),dT=D([0,0,35]);
  // the legs under the chest: the knees bent backward and out, three claws on each foot
  for(let i=0;i<2;i++){const sd=i?1:-1,k=farK(F(0,sd,0)),col=C.cmix(MI.skin,MI.skinD,k);
    L.add(dT-100+D([0,sd*9,0])*.01,()=>{const hip=X.T([0,sd*9,MZ0-1]),f=add(A.feet[i],[A.B[0]*.5,A.B[1],0]);
      mlimb(V0,hip,add(f,[0,0,1.2]),20,17,[-.7,sd*1.7,.1],3.8,col,t=>R0.claw(V0,t,nrm([1,sd*.45,-.5]),1.5,col,MI.claw,[0,0,-1],5.5))})}
  // the long arms hanging from the sides of the chest, three long claws on each hand
  for(let i=0;i<2;i++){const sd=i?1:-1,k=farK(F(0,sd,0)),col=C.cmix(MI.skin,MI.skinD,k),sh=[0,sd*MY,MZ1-7];
    L.add(D(add(sh,[0,sd*8,0])),()=>{const s3=X.T(sh),h3=X.T(A.hands[i]),fd=nrm(lerp3([.25,sd*.1,-1],[.1,sd*.2,1],A.hu));
      mlimb(V0,s3,h3,21,18,[-.15,sd*1,.15+.4*A.hu],3.4,col,t=>R0.claw(V0,t,X.Rd(fd),1.7,col,MI.claw,X.Rd([.2,-sd,0]),8.5))})}
  // the chest: the faces we see, planks, bands with rivets, moss; the dark mouth and the lower teeth when the lid lifts
  L.add(dT,()=>{const cr=[];for(const zz of[MZ0,MZ1])for(const[xx,yy] of[[MX,-MY],[MX,MY],[-MX,MY],[-MX,-MY]])cr.push(X.T([xx,yy,zz]));
    const h=chull(cr.map(q=>P(q)));poly(grow(h,1.3));ctx.fillStyle=INK;ctx.fill();
    const FACES=[[[1,0,0],[0,1,2,3].map(i=>[i<2?MX:MX,0,0])]];
    const fc=[{n:[1,0,0],q:[[MX,-MY],[MX,MY]]},{n:[0,1,0],q:[[MX,MY],[-MX,MY]]},{n:[-1,0,0],q:[[-MX,MY],[-MX,-MY]]},{n:[0,-1,0],q:[[-MX,-MY],[MX,-MY]]}];
    const vis=fc.map(f=>F(X.Rd(f.n))>.02),lines=[],bands=[],rivets=[],moss=[];
    fc.forEach((f,k)=>{if(!vis[k])return;const[a,b]=f.q,pt=(u,z)=>P(X.T([lerp(a[0],b[0],u),lerp(a[1],b[1],u),z])),nr=X.Rd(f.n),sx=nr[0]*V0.c-nr[1]*V0.s,lf=.5*nr[2]-.55*sx,
        col=lf>0?lt(MI.wood,lf*.32):dk(MI.wood,-lf*.4),pts=[pt(0,MZ0),pt(1,MZ0),pt(1,MZ1),pt(0,MZ1)];
      poly(pts);ctx.fillStyle=softBox(bbox(pts),col,.12,.22);ctx.fill();
      // planks, two straps running up the face, the band round the bottom, a crack on the front, moss
      for(const z of[MZ1-7,MZ1-14])lines.push([pt(.03,z),pt(.97,z+(k%2?.5:-.4))]);
      const L2=Math.hypot(b[0]-a[0],b[1]-a[1]),bw=1.75/L2;for(const u of[3.8/L2+bw,1-3.8/L2-bw]){bands.push([pt(u-bw,MZ0),pt(u+bw,MZ0),pt(u+bw,MZ1),pt(u-bw,MZ1)]);rivets.push(pt(u,MZ0+4.5),pt(u,MZ1-2))}
      bands.push([pt(0,MZ0),pt(1,MZ0),pt(1,MZ0+3),pt(0,MZ0+3)]);
      if(k===0){lines.push([pt(.36,MZ1-3),pt(.42,MZ1-8),pt(.34,MZ1-12)]);moss.push([pt(.24,MZ0+2.2),5,1.8],[pt(.7,MZ1-17),3.4,1.4])}
      if(k===1)moss.push([pt(.55,MZ0+5),4,1.6])});
    ctx.fillStyle='rgba(60,80,40,.55)';ctx.beginPath();for(const[q,rx,ry] of moss){ctx.moveTo(q[0]+rx,q[1]);ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU)}ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1.2;ctx.lineCap='round';ctx.beginPath();for(const l of lines){ctx.moveTo(l[0][0],l[0][1]);for(const q of l)ctx.lineTo(q[0],q[1])}ctx.stroke();
    ctx.beginPath();for(const b of bands){ctx.moveTo(b[0][0],b[0][1]);for(const q of b)ctx.lineTo(q[0],q[1]);ctx.closePath()}ctx.fillStyle=MI.band;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.lineJoin='round';ctx.stroke();
    ctx.beginPath();for(const q of rivets)ballP(q,1.1);ctx.fillStyle=MI.bandL;ctx.fill();
    // the corners between two faces we see
    ctx.beginPath();for(let k=0;k<4;k++)if(vis[k]&&vis[(k+1)%4]){const c=fc[k].q[1],a=P(X.T([c[0],c[1],MZ0])),b=P(X.T([c[0],c[1],MZ1]));ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
    // the mouth: the dark inside of the chest, glowing, a row of teeth round the rim
    if(th>.02){const top=[[MX,-MY],[MX,MY],[-MX,MY],[-MX,-MY]].map(c=>P(X.T([c[0]-.5*Math.sign(c[0]),c[1]-.5*Math.sign(c[1]),MZ1])));poly(top);ctx.fillStyle=MI.mouth;ctx.fill();
      if(!LOWFX&&A.op>.2){const m=P(X.T([4,0,MZ1])),g=ctx.createRadialGradient(m[0],m[1],1,m[0],m[1],20);g.addColorStop(0,`rgba(${A.glow>.5?'200,90,40':'150,60,30'},${.75*Math.min(1,A.op)})`);g.addColorStop(1,'rgba(150,60,30,0)');poly(top);ctx.fillStyle=g;ctx.fill()}
      const T=[];const edge=(a,b,n,hgt,inw)=>{for(let i=0;i<n;i++){const u=(i+.5)/n,c=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],e=nrm([b[0]-a[0],b[1]-a[1],0]),hh=hgt*(.75+.35*Math.abs(Math.sin(i*2.7)));
        T.push([P(X.T([c[0]-e[0]*1.8,c[1]-e[1]*1.8,MZ1])),P(X.T([c[0]+inw[0]*.8,c[1]+inw[1]*.8,MZ1+hh])),P(X.T([c[0]+e[0]*1.8,c[1]+e[1]*1.8,MZ1]))])}};
      edge([-MX+2,-MY+1],[MX-2,-MY+1],4,3.6,[0,1]);edge([-MX+2,MY-1],[MX-2,MY-1],4,3.6,[0,-1]);edge([-MX+1,-MY+3],[-MX+1,MY-3],4,3.2,[1,0]);edge([MX-1,-MY+3],[MX-1,MY-3],7,4.6,[-1,0]);
      ctx.beginPath();for(const t of T){ctx.moveTo(t[0][0],t[0][1]);ctx.lineTo(t[1][0],t[1][1]);ctx.lineTo(t[2][0],t[2][1]);ctx.closePath()}ctx.fillStyle=MI.teeth;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.stroke()}
    C.rimPoly(h,.22)});
  // the lid: hinged on the back edge, arched on top, a band along its front edge, the lock; its teeth and its dark underside when it opens
  L.add(D([0,0,MZ1+5]),()=>{const pts=MLID.map(lid),h=chull(pts.map(q=>P(q)));poly(grow(h,1.3));ctx.fillStyle=INK;ctx.fill();poly(grow(h,-1.2));ctx.fillStyle=softBox(bbox(h),MI.woodL,.16,.3);ctx.fill();
    if(F(lidD([0,0,-1]))>.02&&th>.05){const u=[[0,-MY],[30,-MY],[30,MY],[0,MY]].map(c=>P(lid([c[0],c[1],0])));poly(u);ctx.fillStyle=dk(MI.woodD,.2);ctx.fill();
      ctx.beginPath();for(let i=0;i<6;i++){const ly=-MY+3.4+i*(2*MY-6.8)/5,hh=3.6*(.8+.3*Math.abs(Math.sin(i*1.9))),a=P(lid([29.5,ly-1.8,0])),b=P(lid([28.8,ly,-hh])),c=P(lid([29.5,ly+1.8,0]));ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath()}
      ctx.fillStyle=MI.teeth;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.stroke()}
    // the planks of the lid (grooves across it) and two straps over its arch from the hinges to the front
    {const top=F(lidD([0,0,1]))>.05;if(top){ctx.beginPath();for(const lx of[10,20]){for(let j=0;j<=8;j++){const ly=-MY+1+j*(2*MY-2)/8,q=P(lid([lx,ly,mtop(lx,ly)]));j?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}}ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.1;ctx.stroke();
      for(const ly of[-13.5,13.5]){const r=[];for(let i=0;i<=6;i++){const lx=i*5;r.push(P(lid([lx,ly,mtop(lx,ly)+.15])))}ctx.lineCap='butt';ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=5.6;line(r);ctx.stroke();ctx.strokeStyle=MI.band;ctx.lineWidth=3.4;ctx.stroke();
        ctx.fillStyle=MI.bandL;for(const i of[1,5]){ball(r[i],1);ctx.fill()}}}}
    // the band along the front edge of the arch and the one along the back, then the lock and the hinges
    for(const[lx,nx] of[[30,1],[0,-1]]){if(F(lidD([nx,0,.35]))<.05)continue;const r=[];for(let j=0;j<=10;j++){const ly=-MY+j*MY/5;r.push(P(lid([lx,ly,mtop(lx,ly)-.6])))}
      ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=4.4;line(r);ctx.stroke();ctx.strokeStyle=MI.band;ctx.lineWidth=2.4;ctx.stroke()}
    if(F(lidD([1,0,0]))>.05){const q=[[30.4,-3,2.4],[30.4,3,2.4],[30.4,3,-3.6],[30.4,-3,-3.6]].map(c=>P(lid(c)));poly(q);ctx.fillStyle=MI.band;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();
      const k1=P(lid([30.5,0,-.2])),k2=P(lid([30.5,0,-2.4]));ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(k1[0],k1[1]);ctx.lineTo(k2[0],k2[1]);ctx.stroke();
      const r1=P(lid([30.5,-2,1.5]));ctx.fillStyle=MI.bandL;ball(r1,.7);ctx.fill()}
    if(F(lidD([-1,0,.2]))>.05){ctx.beginPath();for(const ly of[-10,10]){const q=[[-.3,ly-3,4],[-.3,ly+3,4],[-.3,ly+3,-3],[-.3,ly-3,-3]].map(c=>P(lid(c)));ctx.moveTo(q[0][0],q[0][1]);for(const c of q)ctx.lineTo(c[0],c[1]);ctx.closePath()}ctx.fillStyle=MI.band;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke()}
    C.rimPoly(h,.3)});
  // the tongue: from inside the mouth over the front edge, hanging and swaying, or lashing out along the floor
  if(th>.04||A.tx>0)L.add(D([MX,0,40]),()=>{const e=X.T([MX+.5,0,MZ1+.6]),b0=X.T([4,0,MZ1-1]),len=(10+A.op*24)*A.tl,sw=A.sw;let pts;
    if(A.tx>0){const Lx=A.tx*56;pts=[b0,e];for(let i=1;i<=5;i++){const u=i/5;pts.push(add(e,X.Rd([u*Lx,Math.sin(u*5+p*30)*3*sw*u+Math.sin(u*3)*2*A.tx,-u*(MZ1-2)*Math.min(1,u*1.6)])))}}
    else{if(len<2)return;pts=[b0,e];for(let i=1;i<=4;i++){const u=i/4;pts.push(add(e,X.Rd([2+u*2+sw*2*u*u,sw*1.5*u*u,-u*len])))}}
    const P2=chain(V0,pts,pts.map((q,i)=>lerp(3.2,1.9,i/(pts.length-1))),MI.tongue,{noRim:1,kl:.2,kd:.3});
    ctx.strokeStyle='rgba(230,140,150,.6)';ctx.lineWidth=1.3;ctx.lineCap='round';ctx.beginPath();for(let i=1;i<P2.length;i++){const q=P2[i];i===1?ctx.moveTo(q[0]-.8,q[1]-.6):ctx.lineTo(q[0]-.8,q[1]-.6)}ctx.stroke();
    if(!LOWFX&&fx&&A.tx===0){const t=P2[P2.length-1],d=(p*2)%1;ctx.fillStyle=`rgba(220,230,200,${.8*(1-d)})`;ctx.beginPath();ctx.ellipse(t[0],t[1]+3+d*10,1.3,2+d,0,0,TAU);ctx.fill()}});
  // the coins it spits (an effect of the move: the game shoots its own coins)
  if(fx&&A.coins>=0)L.add(D([MX+20,0,40]),()=>{const k=A.coins;for(let i=0;i<6;i++){const a=(i-2.5)*.28,d=6+k*46*(.85+.15*Math.sin(i*2.1)),q=P(X.T([MX+d*Math.cos(a),d*Math.sin(a),MZ1+2+18*Math.sin(Math.min(1,k*1.2)*Math.PI)*(.7+.3*Math.cos(i))]));
    const fl=Math.abs(Math.cos(k*14+i*1.3));ctx.globalAlpha=Math.min(1,(1-k)*2.5);ink(1.2);ctx.fillStyle=MI.coin;ctx.beginPath();ctx.ellipse(q[0],q[1],2.8*fl+.6,2.8,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.ellipse(q[0]-.7*fl,q[1]-.8,.8*fl+.2,.8,0,0,TAU);ctx.fill()}ctx.globalAlpha=1});
  run(L);
  if(A.stars>0)bstars(P(X.T([0,0,MZ1+16])),15,A.stars);
  ctx.restore()}
reg('mimic',{n:'Il Mimic',g:'boss',sc:1,an:['idle','walk','chomp','tongue','coins','quake','hit'],dur:{idle:2.4,walk:.9,chomp:1.1,tongue:1,coins:.9,quake:1.1,hit:.7},
  lab:{idle:'Fermo',walk:'Zampetta',chomp:'Morso',tongue:'Frustata di lingua',coins:'Sputa monete',quake:'Salto',hit:'Colpito'}},mimic);
})();
