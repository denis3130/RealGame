// I nemici e i boss della modalità Classica rifatti in 3D come l'Arciere (sprite/eroe3d/disegno_eroe.js): stesso scheletro 3D
// proiettato con V(face) dalla cassetta CR._rig (sprite/mostri/disegno_mostri.js), stessa pittura dell'eroe (tre toni che sfumano
// l'uno nell'altro con la luce calda dall'alto a sinistra, contorno scuro spesso, bordo illuminato), stesse forme di oggi nel gioco:
// ogni mostro resta quello che i bambini conoscono, solo che gira a 360 gradi e si muove meglio.
// Questo file è la cassetta degli attrezzi (C3) e il registro dei mostri (N3); i mostri stanno negli altri file della cartella.
// Firma di ogni mostro: N3.<nome>(x, y, face, anim, p, sc, o): x, y = il punto dei piedi; face = direzione (π/2 = verso chi guarda);
// anim = 'idle' | 'walk' | 'attack' | 'hit' (più le mosse speciali dei boss); p = 0..1 lungo la mossa (l'ultimo fotogramma si collega al
// primo); sc = grandezza; o = opzioni del mostro. N3.meta[nome] = {n: nome italiano, g: gruppo, sc, an: mosse, dur: secondi per mossa}.
// Va eseguito dopo disegno_mostri.js, dentro la funzione principale del gioco (usa ctx, ink, ell, shadow, glow, INK, LOWFX, G.t).
window.N3=window.N3||{meta:{},order:[]};
window.C3=(()=>{
const R=CR._rig,{cam,KR,TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,Vat,stepper,NOSTEP,shine:shine0,ball,seg,tri,hull,on,wa,rim,glowTop,run,starS,ik}=R;
// a soft light that follows the alpha it is drawn with (the game's glow() sets its own alpha, so a fading part, or the old pose fading
// under the new one, kept its glows at full strength); the zombies keep CR's own shine, so their sheets stay identical
const shine=(rgb,x,y,r,a,ry)=>shine0(rgb,x,y,r,a*ctx.globalAlpha,ry);

// ------------------------------------------------------------------ colours: '#rgb', '#rrggbb' or 'rgb(r,g,b)'; mixes are cached
const RGB={};
function rgbOf(c){if(RGB[c])return RGB[c];let r=0,g=0,b=0;
  if(c[0]==='#'){let h=c.slice(1);if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];const n=parseInt(h,16);r=n>>16&255;g=n>>8&255;b=n&255}
  else{const m=c.match(/[\d.]+/g)||[0,0,0];r=+m[0];g=+m[1];b=+m[2]}
  return RGB[c]=[r,g,b]}
const MX={};
function cmix(a,b,k){k=Math.round(cl(k,0,1)*24)/24;if(k<=0)return a;if(k>=1)return b;const id=a+'|'+b+'|'+k;if(MX[id])return MX[id];
  const A=rgbOf(a),B=rgbOf(b);return MX[id]=`rgb(${Math.round(A[0]+(B[0]-A[0])*k)},${Math.round(A[1]+(B[1]-A[1])*k)},${Math.round(A[2]+(B[2]-A[2])*k)})`}
const dk=(c,k)=>cmix(c,'#0d1418',k),lt=(c,k)=>cmix(c,'#ffffff',k),rgbs=c=>rgbOf(c).join(',');
const rgba=(c,a)=>{const q=rgbOf(c);return`rgba(${q[0]},${q[1]},${q[2]},${a})`};

// ------------------------------------------------------------------ the hero's helpers
function chull(pts){pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
  for(const q of pts){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}
  for(let i=pts.length-1;i>=0;i--){const q=pts[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}
  lo.pop();up.pop();return lo.concat(up)}
const poly=pts=>{ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.closePath()};
const line=pts=>{ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1])};
// a closed smooth path through screen points (quadratic curves through the midpoints): round blobs from few points
function smooth(pts){const n=pts.length;ctx.beginPath();const m=i=>[(pts[i][0]+pts[(i+1)%n][0])/2,(pts[i][1]+pts[(i+1)%n][1])/2];let s=m(n-1);ctx.moveTo(s[0],s[1]);
  for(let i=0;i<n;i++){const e=m(i);ctx.quadraticCurveTo(pts[i][0],pts[i][1],e[0],e[1])}ctx.closePath()}
const bbox=pts=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of pts){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])}return[x0,y0,x1,y1]};
// soft three-tone shading: a radial gradient from a light spot (x0, y0) to the dark side, the base colour in the middle
function soft(x0,y0,x1,y1,Rr,col,kl,kd){const g=ctx.createRadialGradient(x0,y0,Rr*.06,x1,y1,Rr);g.addColorStop(0,lt(col,kl==null?.15:kl));g.addColorStop(.5,col);g.addColorStop(1,dk(col,kd==null?.28:kd));return g}
// the same for any shape, from its screen box (light from the upper left)
function softBox(b,col,kl,kd){const w=b[2]-b[0],h=b[3]-b[1],cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2;return soft(cx-w*.24,cy-h*.26,cx-w*.04,cy+h*.04,Math.max(w,h)*.72,col,kl,kd)}
const softBall=(q,r,col,kl,kd)=>soft(q[0]-r*.36,q[1]-r*.42,q[0]-r*.05,q[1]+r*.05,r*1.2,col,kl==null?.14:kl,kd==null?.3:kd);
// a warm rim inside a convex outline, fading out away from the upper left
function rimPoly(pts,al){const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0)/2,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.15,cy+Rr*.15);g.addColorStop(0,wa(al||.32));g.addColorStop(1,wa(0));
  const s=pts.map(q=>[cx+(q[0]-cx)*(1-1.9/Math.max(1,(x1-x0)/2)),cy+(q[1]-cy)*(1-1.9/Math.max(1,(y1-y0)/2))]);ctx.save();ctx.strokeStyle=g;ctx.lineWidth=1.3;poly(s);ctx.stroke();ctx.restore()}
// a point on a ball drawn as a screen circle (like ball()): the offset is squeezed so the limb of the ball lands on the circle
function sp(V0,q,Rr,m){const o=V0.P(0,0,0),pm=V0.P(m),nf=cam.zk*Math.hypot(1,cam.k/cam.zk);return[q[0]+(pm[0]-o[0])*Rr,q[1]+(pm[1]-o[1])*Rr/nf]}
// the part of a ball (screen centre q, radius Rr) inside a cap round direction n with half-angle al, as a screen path (see the hero)
function capPath(V0,q,Rr,n,al){n=nrm(n);let u=cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u),ca=Math.cos(al),sa=Math.sin(al),N=40,b=[],f=[];
  for(let i=0;i<N;i++){const t=i/N*TAU,m=add(mul(n,ca),add(mul(u,Math.cos(t)*sa),mul(v,Math.sin(t)*sa)));b.push(m);f.push(V0.F(m))}
  const vis=f.map(x=>x>=0),nv=vis.filter(Boolean).length;if(!nv)return false;
  if(nv===N){ctx.beginPath();for(const m of b){const s=sp(V0,q,Rr,m);ctx.lineTo(s[0],s[1])}ctx.closePath();return{full:true,rim:b.map(m=>sp(V0,q,Rr,m))}}
  let s0=0;for(let i=0;i<N;i++)if(!vis[i]&&vis[(i+1)%N]){s0=(i+1)%N;break}
  const rn=[];let i=s0;const cut=(a,c)=>{const fa=f[a],fc=f[c],k=fa/(fa-fc);return nrm(lerp3(b[a],b[c],k))};
  rn.push(cut((s0-1+N)%N,s0));while(vis[i]){rn.push(b[i]);i=(i+1)%N}rn.push(cut((i-1+N)%N,i));
  const pts=rn.map(m=>sp(V0,q,Rr,m)),a0=Math.atan2(pts[0][1]-q[1],pts[0][0]-q[0]),a1=Math.atan2(pts[pts.length-1][1]-q[1],pts[pts.length-1][0]-q[0]);
  // the limb inside a cap smaller than half the ball is the short way round, of a bigger one the long way (never decided from the
  // screen angle of the cap's middle: that went the wrong way round when only a sliver showed or hid)
  const norm=a=>((a%TAU)+TAU)%TAU,ccw=norm(a0-a1),inC=al<Math.PI/2?ccw<=Math.PI:ccw>Math.PI;
  ctx.beginPath();for(const s of pts)ctx.lineTo(s[0],s[1]);if(inC)ctx.arc(q[0],q[1],Rr,a1,a1+ccw,false);else ctx.arc(q[0],q[1],Rr,a1,a1-(TAU-ccw),true);ctx.closePath();
  return{full:false,rim:pts}}
const rotY=(v,a)=>{const c=Math.cos(a),s=Math.sin(a);return[v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c]};
const rotZ=(v,a)=>{const c=Math.cos(a),s=Math.sin(a);return[v[0]*c-v[1]*s,v[0]*s+v[1]*c,v[2]]};
const rotX=(v,a)=>{const c=Math.cos(a),s=Math.sin(a);return[v[0],v[1]*c-v[2]*s,v[1]*s+v[2]*c]};

// ------------------------------------------------------------------ moves (every one depends only on p)
// when standing still the head looks gently one way and the other (period 1, smooth at the seam)
const look=(p,a)=>a*Math.sin(p*TAU)*(.55+.45*Math.cos(p*TAU*2));
// a blink: 1 open, dips to 0 around p0 (the eyelid takes `w` of the cycle)
const blink=(p,p0,w)=>{const d=Math.abs(((p-p0)%1+1.5)%1-.5);return d<w/2?d/(w/2):1};
// keyframes on p: [[p, value or [values]], ...], eased between keys
function keys(K,p){for(let i=0;i<K.length-1;i++){const a=K[i],b=K[i+1];if(p>=a[0]&&p<=b[0]){const k=ez((p-a[0])/Math.max(1e-6,b[0]-a[0]));
  return Array.isArray(a[1])?a[1].map((v,j)=>lerp(v,b[1][j],k)):lerp(a[1],b[1],k)}}const l=K[K.length-1][1];return Array.isArray(l)?l.slice():l}
const bump=k=>k<=0||k>=1?0:Math.sin(k*Math.PI);
const sstep=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t)};
// the knock back of 'hit': out fast, then a wobble back to standing
const hitK=p=>p<.12?ez(p/.12):Math.exp(-(p-.12)*6)*Math.cos((p-.12)*16);
// a little hop cycle (0 on the floor, up to 1 in the air) with squash on landing: returns {z, s} (s>0 taller); the stretch in the air
// fades in at take-off and out at landing, so the body never jumps from one shape to another
function hop(p,air){const a=air||.55;if(p<a){const k=p/a;return{z:Math.sin(k*Math.PI),s:(.06*Math.cos(k*TAU)+.05)*sstep(0,.15,k)*sstep(0,.15,1-k)}}const k=(p-a)/(1-a);return{z:0,s:-.16*Math.sin(k*Math.PI)}}

// ------------------------------------------------------------------ the body's frame (as the hero's): squash/stretch (s: taller > 0),
// stretch along x (sx), lean (the top goes forward > 0), roll (the top goes to the right > 0), turn (yaw, the front goes left > 0) round
// the point [0,0,Z0]; then the root offset B. Rd turns a direction the same way (no squash)
function frame(A,Z0){Z0=Z0||0;const ca=Math.cos(A.lean||0),sa=Math.sin(A.lean||0),cr=Math.cos(A.roll||0),sr=Math.sin(A.roll||0),cy=Math.cos(A.yaw||0),sy=Math.sin(A.yaw||0),
  sz=1+(A.s||0),sxy=1/Math.sqrt(Math.max(.3,sz)),sx=sxy*(1+(A.sx||0)),B=A.B||[0,0,0];
  const turn=(x,y,z)=>{const y1=y*cr+z*sr,z1=-y*sr+z*cr,x2=x*ca+z1*sa,z2=-x*sa+z1*ca;return[x2*cy-y1*sy,x2*sy+y1*cy,z2]};
  return{T:q=>{const r=turn(q[0]*sx,q[1]*sxy,(q[2]-Z0)*sz);return[r[0]+B[0],r[1]+B[1],r[2]+Z0+B[2]]},Rd:v=>turn(v[0],v[1],v[2]),Z0}}
const IDF={T:q=>q,Rd:v=>v,Z0:0};

// ------------------------------------------------------------------ shapes painted like the hero
// a convex volume given by 3D points on its surface (through the frame X): the hull of the points seen by the camera, three soft
// tones, the thick outline, the warm rim. Returns the hull (screen points) so details can be clipped inside it. o.kl/o.kd: light and
// dark of the tones; o.noRim; o.lw: outline width; o.fill: a fill instead of the soft tones; o.noInk: no outline
function vol(V0,pts3,col,o){o=o||{};const pts=chull(pts3.map(q=>V0.P(q)));if(pts.length<3)return pts;
  ctx.lineJoin='round';poly(pts);ctx.fillStyle=o.fill||softBox(bbox(pts),col,o.kl,o.kd);ctx.fill();if(!o.noInk){ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2.5;ctx.stroke()}
  if(!o.noRim)rimPoly(pts,o.rim||.3);return pts}
// points on an ellipsoid: centre C, radii [rx, ry, rz] along the axes of the frame F (u forward, v right, w up; default the body's
// axes), n rings of m points each (the poles too). cut: keep only z >= cut*rz (a dome)
function ellPts(C,Rd,F,n,m,cut){F=F||AXES;n=n||7;m=m||18;const out=[];const lo=cut==null?-1:cut;
  for(let i=0;i<=n;i++){const a=-Math.PI/2+i/n*Math.PI,z=Math.sin(a),r=Math.cos(a);if(z<lo-1e-6)continue;
    if(r<1e-3){out.push(ellAt(C,Rd,F,[0,0,z]));continue}for(let j=0;j<m;j++){const t=j/m*TAU;out.push(ellAt(C,Rd,F,[Math.cos(t)*r,Math.sin(t)*r,z]))}}
  if(cut!=null&&cut>-1){const z=cut,r=Math.sqrt(Math.max(0,1-z*z));for(let j=0;j<m;j++){const t=j/m*TAU;out.push(ellAt(C,Rd,F,[Math.cos(t)*r,Math.sin(t)*r,z]))}}
  return out}
const AXES={u:[1,0,0],v:[0,1,0],w:[0,0,1]};
// the point of an ellipsoid toward the unit direction m (in its own axes) and the surface normal there (in the body's axes)
function ellAt(C,Rd,F,m){F=F||AXES;return add(C,add(add(mul(F.u,m[0]*Rd[0]),mul(F.v,m[1]*Rd[1])),mul(F.w,m[2]*Rd[2])))}
function ellN(Rd,F,m){F=F||AXES;return nrm(add(add(mul(F.u,m[0]/Rd[0]),mul(F.v,m[1]/Rd[1])),mul(F.w,m[2]/Rd[2])))}
// an axis frame from a forward direction (and an up hint)
function axes(fwd,upH){const u=nrm(fwd);let v=cross(upH||[0,0,1],u);if(len(v)<1e-3)v=cross([0,1,0],u);v=nrm(v);const w=cross(u,v);return{u,v:mul(v,-1),w}}
// a soft ball at the 3D point c (screen circle), as the hero's head: soft fill, outline, rim
function sball(V0,c,r,col,o){o=o||{};const q=V0.P(c);ink(o.lw||2.5);ball(q,r);ctx.fillStyle=o.fill||softBall(q,r,col,o.kl,o.kd);ctx.fill();if(!o.noInk)ctx.stroke();if(!o.noRim)rim(q,r,q,r,o.rim||.3);return q}
// a soft capsule between two 3D points (radii ra, rb): limbs, necks, tails
function caps(V0,a,ra,b,rb,col,o){o=o||{};const A=V0.P(a),B=V0.P(b);ink(o.lw||2.5);hull(A,ra,B,rb);const bb=[Math.min(A[0]-ra,B[0]-rb),Math.min(A[1]-ra,B[1]-rb),Math.max(A[0]+ra,B[0]+rb),Math.max(A[1]+ra,B[1]+rb)];
  ctx.fillStyle=o.fill||softBox(bb,col,o.kl,o.kd);ctx.fill();if(!o.noInk)ctx.stroke();if(!o.noRim)rim(A,ra,B,rb,o.rim||.26);return[A,B]}
// a chain of capsules (a bendy limb, a tail, a neck) drawn without seams: every outline first, then every fill
function chain(V0,pts3,rs,col,o){o=o||{};const P2=pts3.map(q=>V0.P(q)),bb=bbox(P2.map((q,i)=>[q[0],q[1]]));bb[0]-=rs[0];bb[1]-=rs[0];bb[2]+=rs[0];bb[3]+=rs[0];
  ctx.fillStyle=INK;for(let i=0;i<P2.length-1;i++){hull(P2[i],rs[i]+(o.lw||2.5)/2+.1,P2[i+1],rs[i+1]+(o.lw||2.5)/2+.1);ctx.fill()}
  if(o.end)o.end(P2);ctx.fillStyle=o.fill||softBox(bb,col,o.kl,o.kd);for(let i=0;i<P2.length-1;i++){hull(P2[i],Math.max(.25,rs[i]-(o.lw||2.5)/2+.1),P2[i+1],Math.max(.25,rs[i+1]-(o.lw||2.5)/2+.1));ctx.fill()}
  if(!o.noRim)for(let i=0;i<P2.length-1;i++)rim(P2[i],rs[i],P2[i+1],rs[i+1],o.rim||.18);return P2}
// a flat disc in 3D (centre c, normal n, radius r): a projected circle; o.ink; returns the screen points
function disc3(V0,c,n,r,o){o=o||{};n=nrm(n);let u=cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u),N=o.N||20,pts=[];
  for(let i=0;i<N;i++){const t=i/N*TAU;pts.push(V0.P(add(c,add(mul(u,Math.cos(t)*r),mul(v,Math.sin(t)*r)))))}poly(pts);return pts}
// a spot painted on a surface (point c with normal n): a small disc in the tangent plane, fading in as it turns toward us; o.lw: outline
function spot(V0,c,n,r,col,o){o=o||{};const f=V0.F(n);if(f<=(o.v0||0))return;ctx.save();ctx.globalAlpha*=cl((f-(o.v0||0))*4,0,1);disc3(V0,c,n,r,{N:o.N||14});ctx.fillStyle=col;ctx.fill();
  if(o.lw){ctx.strokeStyle=o.ink||INK;ctx.lineWidth=o.lw;ctx.stroke()}ctx.restore()}
// a leaf, a petal, a fin, an ear: a flat almond in 3D from the base b along d (length L), as wide as W across s; bend: how much the
// tip curls along n (the leaf's normal = d × s). Two sided: o.back colours the side that turns away; o.ell: a rounded petal (an
// ellipse) instead of an almond. Returns its screen points
function leaf(V0,b,d,s,L,W,col,o){o=o||{};d=nrm(d);s=nrm(s);const n=nrm(cross(d,s)),bend=o.bend||0,N=10,pts=[],tip=o.tip==null?1:o.tip;
  const at=(k,w)=>add(add(add(b,mul(d,k*L)),mul(s,w)),mul(n,bend*k*k*L*.4));
  const prof=k=>(o.ell?Math.sqrt(Math.max(0,1-(2*k-1)*(2*k-1))):Math.sin(Math.PI*Math.pow(k,o.round||.8)))*(1-(1-tip)*k);
  for(let i=0;i<=N;i++){const k=i/N,w=W*prof(k);pts.push(V0.P(at(k,w)))}
  for(let i=N-1;i>0;i--){const k=i/N,w=W*prof(k);pts.push(V0.P(at(k,-w)))}
  const f=V0.F(n),c=o.back&&f<0?o.back:col;ctx.lineJoin='round';poly(pts);ctx.fillStyle=o.flat?c:softBox(bbox(pts),c,o.kl==null?.18:o.kl,o.kd==null?.22:o.kd);ctx.fill();
  if(!o.noInk){ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2;ctx.stroke()}
  if(o.vein){const a=V0.P(at(.08,0)),e=V0.P(at(.85,0));ctx.strokeStyle=o.vein;ctx.lineWidth=1;ctx.lineCap='round';seg(a,e);ctx.stroke()}
  return pts}
// a solid of revolution (a body like the hero's gumdrop): rings from the profile [[height above Z0, radius]...], depth AX times the width;
// through the frame X. Returns the 3D points (draw them with vol)
function revo(prof,AX,X,Z0,m){m=m||22;const out=[];for(const[dz,r] of prof)for(let i=0;i<m;i++){const t=i/m*TAU;out.push(X.T([Math.cos(t)*r*AX,Math.sin(t)*r,(Z0||0)+dz]))}return out}
// a point on that body (angle t round it, 0 = in front, π/2 = its right; height z), pushed out by `out`, and its normal
function revoAt(prof,AX,Z0,t,z,out){const rAt=dz=>{if(dz<=prof[0][0])return prof[0][1];for(let i=0;i<prof.length-1;i++){const a=prof[i],b=prof[i+1];if(dz<=b[0])return lerp(a[1],b[1],(dz-a[0])/(b[0]-a[0]))}return prof[prof.length-1][1]};
  const dz=z-(Z0||0),r=rAt(dz)+(out||0),sl=rAt(dz+.5)-rAt(dz-.5);return{p:[Math.cos(t)*r*AX,Math.sin(t)*r,z],n:nrm([Math.cos(t)/AX,Math.sin(t),-sl])}}
// a line drawn on a surface: fn(k) gives {p, n} for k in 0..1 (open) or t round the body (closed), through the frame X; only where it faces us
function surfLine(V0,X,fn,col,w,open,dash,inked){const{P,F}=V0,N=open?14:40,runs=[];let cur=[];
  for(let i=0;i<=N;i++){const k=i/N,s=fn(open?k:k*TAU),v=F(X.Rd(s.n));if(v>.02)cur.push(P(X.T(s.p)));else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
  ctx.lineCap='round';ctx.lineJoin='round';if(dash)ctx.setLineDash(dash);
  for(const r of runs){if(r.length<2)continue;if(inked){ctx.strokeStyle=INK;ctx.lineWidth=w+1.8;line(r);ctx.stroke()}ctx.strokeStyle=col;ctx.lineWidth=w;line(r);ctx.stroke()}
  if(dash)ctx.setLineDash([])}

// ------------------------------------------------------------------ faces on a ball head (Vh = the head's camera, h = its screen centre, Rh)
// where a direction on the head lands on the screen, and how much it faces us
const onHead=(Vh,h,Rh,d)=>({q:sp(Vh,h,Rh*.97,nrm(d)),v:Vh.F(nrm(d))});
// a soft limit on how far from the middle of the head a feature may sit (a, b: where the limit starts and the most it reaches)
function inward(h,Rh,q,a,b){const dx=q[0]-h[0],dy=q[1]-h[1],d=Math.hypot(dx,dy)/Rh;if(d<=a)return q;const d2=a+(b-a)*(1-Math.exp(-(d-a)/(b-a)));return[h[0]+dx*d2/d,h[1]+dy*d2/d]}
// a pair of eyes on a ball head, as the hero's: no eye ever sits on the outline of the head; when the head turns the far eye slides in
// toward the middle and narrows beside the near eye until it is gone; never drawn see-through. o: dir ([fwd, side, up] of the right
// eye), nod (a function turning directions with the head's nod), kind ('dark' the hero's dark oval with a point of light | 'white' a
// cartoon eye: white, iris, pupil, light | 'glow' a coloured eye that shines | 'pip' a light in a dark socket | 'slit' a reptile's
// eye), col, iris, rx, ry, light (the point of light), blink (1 open .. 0 shut), squint, shut (squeezed shut: two strokes), look
// ([-1..1, -1..1] where the iris looks), glow (rgb), lw (outline of white eyes), a/b (inward limits), one (a single eye in the middle)
function eyes(Vh,h,Rh,o){o=o||{};const nod=o.nod||(v=>v),dir=o.dir||[1,.33,.25],rx0=o.rx||1.95,ry0=o.ry||2.3,at=o.at||(e=>({q:sp(Vh,h,Rh*.97,e),v:Vh.F(e)}));
  const E=(o.one?[0]:[-1,1]).map(sd=>{const e=nrm(nod([dir[0],sd*dir[1],dir[2]])),r=at(e);return{sd,v:r.v,q:r.q,rx:rx0*Math.pow(Math.max(0,r.v),o.fall||.7)}}).filter(e=>e.v>(o.v0==null?.08:o.v0)).sort((a,b)=>b.v-a.v);
  if(E.length)E[0].q=inward(h,Rh,E[0].q,o.a||.6,o.b||.74);
  if(E.length>1){const n=E[0],f=E[1];f.q=inward(h,Rh,f.q,(o.a||.6)-.1,(o.b||.74)-.08);const gap=Math.hypot(f.q[0]-n.q[0],f.q[1]-n.q[1])-n.rx-(o.gap==null?.8:o.gap);f.rx=Math.min(f.rx,Math.max(0,gap))}
  for(const e of E){if(e.rx<.6)continue;eye1(e.q,e.rx,ry0,o,e.v,e.sd,h)}
  return E}
function eye1(q,rx,ry,o,v,sd,h){const kind=o.kind||'dark',sq=(o.blink==null?1:o.blink)*(1-.35*(o.squint||0)),sy=ry*Math.max(.12,sq),col=o.col||'#1b1612';
  if(o.shut){const dir=h&&h[0]>=q[0]?1:-1;ctx.strokeStyle=o.shutCol||'#1b1612';ctx.lineWidth=1.3;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
    ctx.moveTo(q[0]-dir*rx*.9,q[1]-ry*.62);ctx.lineTo(q[0]+dir*rx*.8,q[1]);ctx.lineTo(q[0]-dir*rx*.9,q[1]+ry*.62);ctx.stroke();return}
  if(kind==='dark'||kind==='glow'){if(kind==='glow'&&o.glow&&sq>.22)shine(o.glow,q[0],q[1],ry*3.2,.35*Math.min(1,v*2)*sstep(.22,.38,sq));
    ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(q[0],q[1],rx,sy,0,0,TAU);ctx.fill();if(o.lw){ctx.strokeStyle=INK;ctx.lineWidth=o.lw;ctx.stroke()}
    if(o.light!==false&&sq>.4&&rx>1){ctx.save();ctx.globalAlpha*=sstep(.4,.5,sq)*sstep(1,1.2,rx);ctx.fillStyle=o.lightCol||'#fdf6e8';ball([q[0]-rx*.34,q[1]-sy*.46],o.lr||Math.min(.36+rx*.06,.7));ctx.fill();ctx.restore()}return}
  if(kind==='pip'){ctx.fillStyle=o.sock||'#2a211c';ctx.beginPath();ctx.ellipse(q[0],q[1],rx,sy,0,0,TAU);ctx.fill();if(o.lw){ctx.strokeStyle=INK;ctx.lineWidth=o.lw;ctx.stroke()}
    if(sq>.3){if(o.glow)shine(o.glow,q[0],q[1],ry*2.6,.4*Math.min(1,v*2));ctx.fillStyle=col;ball([q[0],q[1]+sy*.08],Math.min(rx,sy)*(o.pr||.48));ctx.fill();ctx.fillStyle='#fff';ball([q[0]-rx*.18,q[1]-sy*.14],Math.min(rx,sy)*.16+.1);ctx.fill()}return}
  // white or slit: a white (or coloured) eye with an outline, an iris or a slit, the pupil, a point of light, all clipped inside
  ctx.save();ctx.beginPath();ctx.ellipse(q[0],q[1],rx,sy,0,0,TAU);ctx.fillStyle=o.white||'#fff8ec';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=o.lw||1.2;ctx.stroke();
  if(sq>.25){ctx.clip();const lk=o.look||[0,0],dx=lk[0]*rx*.35,dy=lk[1]*sy*.3;
    if(kind==='slit'){ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(q[0]+dx*.5,q[1]+dy*.5,rx*.95,sy*.95,0,0,TAU);ctx.fill();ctx.fillStyle='#1b1612';ctx.beginPath();ctx.ellipse(q[0]+dx,q[1]+dy,Math.max(.35,rx*.2),sy*.78,0,0,TAU);ctx.fill()}
    else{const ir=o.iris;if(ir){ctx.fillStyle=ir;ctx.beginPath();ctx.ellipse(q[0]+dx,q[1]+dy,rx*.66,ry*.66,0,0,TAU);ctx.fill()}
      ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(q[0]+dx*1.1,q[1]+dy*1.1,rx*(ir?.36:.5),ry*(ir?.38:.52),0,0,TAU);ctx.fill()}
    if(o.light!==false){ctx.fillStyle='#fff';ball([q[0]-rx*.3+dx*.4,q[1]-ry*.34+dy*.4],Math.max(.35,Math.min(rx,ry)*.24));ctx.fill()}}
  ctx.restore()}
// a mouth on a ball head toward direction d. kind: 'smile' (a curve, bow = how much it bends), 'fangs' (a smile with two little fangs),
// 'open' (dark, a tongue, two fangs on top, open = 0..1), 'o' (a small round mouth), 'grin' (a wide curve with a row of teeth)
function mouth(Vh,h,Rh,d,o){o=o||{};const{q,v}=o.at?o.at(nrm(d)):onHead(Vh,h,Rh,d);if(v<(o.v0==null?.12:o.v0))return;const k=cl((v-(o.v0==null?.12:o.v0))*3.5,0,1),w=(o.w||2.6)*Math.max(.4,Math.pow(v,.6));
  const p=inward(h,Rh,q,.62,.8);ctx.save();ctx.globalAlpha*=k;const kind=o.kind||'smile',col=o.col||'#1b1612';
  if(kind==='smile'||kind==='fangs'||kind==='grin'){ctx.strokeStyle=col;ctx.lineWidth=o.lw||1.3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p[0]-w,p[1]-.3);ctx.quadraticCurveTo(p[0],p[1]+(o.bow==null?1.8:o.bow),p[0]+w,p[1]-.3);ctx.stroke();
    if(kind==='fangs'){ctx.fillStyle=o.fang||'#fff6e0';ctx.strokeStyle=INK;ctx.lineWidth=.7;for(const sd of[-1,1]){const fx=p[0]+sd*w*.5,fy=p[1]+(o.bow==null?1.8:o.bow)*.5*(1-.25)+.1;tri(fx,fy-.4,fx-sd*.15,fy+(o.fh||1.6),.75)}}}
  else if(kind==='open'){const op=o.open==null?1:o.open,hh=(o.h||1.6)*(.35+op*.65);ctx.fillStyle=o.dark||'#4a1818';ctx.strokeStyle=INK;ctx.lineWidth=o.lw||1.1;ctx.beginPath();ctx.ellipse(p[0],p[1]+hh*.3,w*.85,hh,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.save();ctx.clip();if(o.tongue!==false){ctx.fillStyle=o.tongue||'#e07a8a';ctx.beginPath();ctx.ellipse(p[0],p[1]+hh*1.05,w*.55,hh*.6,0,0,TAU);ctx.fill()}
    if(o.fang){ctx.fillStyle=o.fang;ctx.strokeStyle=INK;ctx.lineWidth=.6;for(const sd of[-1,1]){const fx=p[0]+sd*w*.42,fy=p[1]+hh*.3-hh;tri(fx,fy-.3,fx,fy+Math.min(hh*.9,o.fh||1.6),.7)}}ctx.restore()}
  else if(kind==='o'){ctx.fillStyle=o.dark||'#4a1818';ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.beginPath();ctx.ellipse(p[0],p[1],w*.4,(o.h||1.2),0,0,TAU);ctx.fill();ctx.stroke()}
  ctx.restore()}
// rosy cheeks on a ball head
function cheeks(Vh,h,Rh,nod,o){o=o||{};nod=nod||(v=>v);const d=o.dir||[1,.54,.04];for(const sd of[-1,1]){const c=nrm(nod([d[0],sd*d[1],d[2]])),r=o.at?o.at(c):{q:sp(Vh,h,Rh*.97,c),v:Vh.F(c)},v=r.v,k=sstep(.15,.35,v);if(k<=0)continue;
  const q=inward(h,Rh,r.q,.66,.8);ctx.fillStyle=`rgba(${o.rgb||'255,120,110'},${(o.al||.22)*k})`;ell(q[0],q[1],(o.rx||1.7)*Math.pow(v,.7),o.ry||1);ctx.fill()}}

// faces on an ellipsoid instead of a ball: at(m) for eyes/mouth/cheeks (m = unit direction in the ellipsoid's own axes) gives the
// screen point of the surface there and how much its normal faces us; h and Rh (screen centre, a radius) are for inward()
function ellFace(V0,X,C,Rd,F){return{h:V0.P(X.T(C)),at:m=>({q:V0.P(X.T(ellAt(C,Rd,F,m))),v:V0.F(X.Rd(ellN(Rd,F,m)))})}}

// ------------------------------------------------------------------ odds and ends
// the shadow on the floor under the 3D point c of the body (smaller and lighter when it is up in the air: lift = height)
function floor(V0,x,y,sc,c,rx,ry,al,lift){const q=V0.P(c[0],c[1],0),k=1-.35*cl((lift||0)/30,0,1);shadow(x+q[0]*sc,y+q[1]*sc,rx*sc*k,ry*sc*KR()*k,(al==null?.3:al)*k)}
// dizzy stars over the head
function stars(c0,r,a){if(a<=0)return;for(let i=0;i<3;i++){const an=G.t*5+i*TAU/3;starS(c0[0]+Math.cos(an)*r,c0[1]+Math.sin(an)*r*.33*KR(),1.9,a)}}
// a glowing orb (staff tops, wisps' bolts, magic): a halo, the coloured ball, a white core
function orb(q,r,col,o){o=o||{};const g=o.glow||rgbs(col);if(!LOWFX)shine(g,q[0],q[1],r*(o.halo||3.4),o.ga==null?.55:o.ga);ink(o.lw||1.6);ball(q,r);ctx.fillStyle=softBall(q,r,col,.35,.2);ctx.fill();if(o.lw!==0)ctx.stroke();ctx.fillStyle='rgba(255,255,255,.85)';ball([q[0]-r*.3,q[1]-r*.32],r*.32);ctx.fill()}
// draw the parts in their depth order (the farthest first), as the monsters do
const parts=()=>{const L=[];L.add=(d,f)=>L.push({d,f});return L};
// register a monster: N3[id] = fn, N3.meta[id] = its card
function reg(id,meta,fn){N3[id]=fn;N3.meta[id]=Object.assign({sc:1,an:['idle','walk','attack','hit'],dur:{idle:2.4,walk:1,attack:1.4,hit:.6}},meta);if(!N3.order.includes(id))N3.order.push(id)}

return{R,cam,KR,TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,Vat,stepper,NOSTEP,shine,ball,seg,tri,hull,on,wa,rim,glowTop,run,starS,ik,
  rgbOf,cmix,dk,lt,rgbs,rgba,chull,poly,line,smooth,bbox,soft,softBox,softBall,rimPoly,sp,capPath,rotX,rotY,rotZ,look,blink,keys,bump,sstep,hitK,hop,frame,IDF,
  vol,ellPts,ellAt,ellN,AXES,axes,sball,caps,chain,disc3,spot,leaf,revo,revoAt,surfLine,onHead,inward,eyes,eye1,mouth,cheeks,ellFace,floor,stars,orb,parts,reg}})();
