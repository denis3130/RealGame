// La cassetta dei boss della Classica rifatti (C3K): gli attrezzi che il Golem nuovo (golem2.js) si era scritto da sé, messi qui una volta
// sola per i boss fatti dopo (Fabbro, Idra, Mimic, Burattinaio, Piovra, Cervo): calotte sulle sfere e sugli ellissoidi (ellCap, outCap,
// sunkDraw), contorni esatti degli ellissoidi (ellSil) e inviluppi stabili (hullE), volumi lisci dipinti in tre toni (svol3), solidi a
// facce (facets, boxF, stoneF), fasce intorno agli arti (band), arti (cyl, limbGrad), un disegno sfumato tutto insieme (fadeDraw), polvere,
// colori a tre toni (T3, mixT) e qualche rotazione. Va dopo base3d.js e prima dei modelli che la usano.
window.C3K=(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,tri,hull,rim,run,cmix,poly,bbox,
  sp,rotY,rotZ,look,blink,keys,sstep,hitK,frame,vol,ellPts,ellAt,ellN,AXES,caps,chain,disc3,leaf,eyes,floor,parts,reg,shine,smooth,chull,ik,stepper}=C;
// ------------------------------------------------------------------ helpers (as in boss1.js and boss3.js)
const dir=(t,e)=>[Math.cos(e)*Math.cos(t),Math.cos(e)*Math.sin(t),Math.sin(e)];
const trem=(p,a,b,hz,dur)=>{const w=Math.min(.03,(b-a)/3);return sstep(a,a+w,p)*(1-sstep(b-w,b,p))*Math.sin((p-a)*TAU*hz*dur)};
const fxOn=o=>!o.noFx&&!LOWFX;
const cheat=(face,k)=>{const dv=Math.atan2(Math.sin(Math.PI/2-face),Math.cos(Math.PI/2-face));return k*Math.sin(dv)*cl((Math.PI-Math.abs(dv))/(Math.PI/2),0,1)};
// a smooth pulse centred on c, w wide; a ramp up a..b and down c..d; a flash that fades in w
const pls=(p,c,w)=>{const d=Math.abs(p-c)/(w/2);return d>=1?0:.5+.5*Math.cos(d*Math.PI)};
const rise=(p,a,b,c,d)=>sstep(a,b,p)*(1-sstep(c,d,p));
const flash=(p,a,w)=>p<a||p>a+w?0:1-(p-a)/w;
const clipTo=hp=>{if(hp.path)ctx.clip(hp.path);else{smooth(hp);ctx.clip()}};
// draws f() with the alpha multiplied by k (no save and restore)
const ga=(k,f)=>{if(k<=.004)return;const a0=ctx.globalAlpha;ctx.globalAlpha=a0*Math.min(1,k);f();ctx.globalAlpha=a0};
const strokeRuns=(runs,col,w)=>{if(!runs.length)return;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();for(const r of runs){ctx.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)ctx.lineTo(r[i][0],r[i][1])}ctx.stroke()};
// the visible part of a cap on an ellipsoid (from boss1.js): leaves the path in ctx, returns {full, rim} or false
// (the directions of a cap that does not move on its ellipsoid are kept: o.ck names it, as in golem2b.js)
const ECC={};let ECN=0;
function ellCap(V0,X,Cc,Rd,Fr,n,al,N,o){Fr=Fr||AXES;N=N||36;o=o||{};const alv=o.alv||al,ck=o.ck!=null?o.ck+'|'+N+'|'+al.toFixed(3)+'|'+alv.toFixed(3)+'|'+n.join():null;let b,bd;
  if(ck&&ECC[ck]){b=ECC[ck].b;bd=ECC[ck].bd}else{n=nrm(n);let u=o.u?sub(o.u,mul(n,dot(o.u,n))):cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u);
    const at=(t,k)=>{const c=Math.cos(t),s=Math.sin(t),a=k/Math.sqrt((c/al)*(c/al)+(s/alv)*(s/alv));return add(mul(n,Math.cos(a)),add(mul(u,c*Math.sin(a)),mul(v,s*Math.sin(a))))};
    b=[];bd=[];for(let i=0;i<N;i++){const t=i/N*TAU,m=at(t,1);b.push(m);bd.push(o.rf?at(t,o.rf(t)):m)}if(ck){if(++ECN>300){for(const k in ECC)delete ECC[k];ECN=0}ECC[ck]={b,bd}}}
  const S=m=>V0.P(X.T(ellAt(Cc,Rd,Fr,m))),g=nrm([V0.F(X.Rd(Fr.u))/Rd[0],V0.F(X.Rd(Fr.v))/Rd[1],V0.F(X.Rd(Fr.w))/Rd[2]]),f=[];
  for(let i=0;i<N;i++){const m=b[i];f.push(m[0]*g[0]+m[1]*g[1]+m[2]*g[2])}
  const nv=f.filter(x=>x>=0).length;if(!nv)return false;
  if(nv===N){const pts=bd.map(S);poly(pts);return{full:true,rim:pts}}
  let s0=0;for(let i=0;i<N;i++)if(f[i]<0&&f[(i+1)%N]>=0){s0=(i+1)%N;break}
  const cut=(a,c)=>{const k=f[a]/(f[a]-f[c]);return nrm(lerp3(b[a],b[c],k))},rn=[cut((s0-1+N)%N,s0)],rd=[rn[0]];let i=s0;while(f[i]>=0){rn.push(b[i]);rd.push(bd[i]);i=(i+1)%N}rn.push(cut((i-1+N)%N,i));rd.push(rn[rn.length-1]);
  let e1=cross(g,[0,0,1]);if(len(e1)<.2)e1=cross(g,[0,1,0]);e1=nrm(e1);const e2=cross(g,e1),ang=m=>Math.atan2(dot(m,e2),dot(m,e1)),nm=a=>((a%TAU)+TAU)%TAU;
  const a0=ang(rn[rn.length-1]),a1=ang(rn[0]),ccw=nm(a1-a0),span=ccw<=Math.PI?ccw:-(TAU-ccw);
  const M=Math.max(2,Math.ceil(Math.abs(span)/.2)),lb=[];for(let k=1;k<M;k++){const a=a0+span*k/M;lb.push(add(mul(e1,Math.cos(a)),mul(e2,Math.sin(a))))}
  poly(rd.concat(lb).map(S));return{full:false,rim:rd.map(S)}}
// how a ball (centre c0, radius r, in the body's frame) sticks out of an ellipsoid (from boss1.js): null clear, false inside, else the cap
function outCap(X,Cc,Rd,Fr,c0,r,k){const R2=mul(Rd,k),d=sub(c0,Cc),u=[dot(d,Fr.u)/R2[0],dot(d,Fr.v)/R2[1],dot(d,Fr.w)/R2[2]],l=len(u);if(l<1e-4)return false;
  const m=mul(u,1/l),n=ellN(R2,Fr,m),h=dot(sub(c0,ellAt(Cc,R2,Fr,m)),n);if(h>=r)return null;if(h<=-r)return false;return{n:X.Rd(n),al:Math.acos(cl(-h/r,-1,1))}}
function capPts(V0,q,Rr,n,al){n=nrm(n);let u=cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u),ca=Math.cos(al),sa=Math.sin(al),N=36,b=[],f=[];
  for(let i=0;i<N;i++){const t=i/N*TAU,m=add(mul(n,ca),add(mul(u,Math.cos(t)*sa),mul(v,Math.sin(t)*sa)));b.push(m);f.push(V0.F(m))}
  const nv=f.filter(x=>x>=0).length;if(!nv)return false;if(nv===N){const pts=b.map(m=>sp(V0,q,Rr,m));return{pts,rim:pts,full:true}}
  let s0=0;for(let i=0;i<N;i++)if(f[i]<0&&f[(i+1)%N]>=0){s0=(i+1)%N;break}
  const cut=(a,c)=>{const k=f[a]/(f[a]-f[c]);return nrm(lerp3(b[a],b[c],k))},rn=[cut((s0-1+N)%N,s0)];let i=s0;while(f[i]>=0){rn.push(b[i]);i=(i+1)%N}rn.push(cut((i-1+N)%N,i));
  const rim=rn.map(m=>sp(V0,q,Rr,m)),a0=Math.atan2(rim[0][1]-q[1],rim[0][0]-q[0]),a1=Math.atan2(rim[rim.length-1][1]-q[1],rim[rim.length-1][0]-q[0]);
  const nm=a=>((a%TAU)+TAU)%TAU,ccw=nm(a0-a1),span=ccw<=Math.PI?ccw:-(TAU-ccw),M=Math.max(2,Math.ceil(Math.abs(span)/.15)),pts=rim.slice();
  for(let k=1;k<M;k++){const a=a1+span*k/M;pts.push([q[0]+Math.cos(a)*Rr,q[1]+Math.sin(a)*Rr])}return{pts,rim,full:false}}
// draws f() (round the screen point q, radius r) clipped to the part that sticks out (oc from outCap), with a crease where it goes in
function sunkDraw(V0,q,r,oc,f){if(oc===false)return;if(!oc){f();return}const big=oc.al>Math.PI/2,n=big?mul(oc.n,-1):oc.n,al=big?Math.PI-oc.al:oc.al,R1=r+1.6,cp=capPts(V0,q,R1,n,al);
  if(big&&!cp){f();return}if(!big&&!cp)return;
  ctx.save();ctx.beginPath();if(big){ctx.arc(q[0],q[1],R1+2,0,TAU);ctx.closePath()}ctx.moveTo(cp.pts[0][0],cp.pts[0][1]);for(const w of cp.pts)ctx.lineTo(w[0],w[1]);ctx.closePath();ctx.clip(big?'evenodd':'nonzero');f();ctx.restore();
  const c2=capPts(V0,q,r,n,al);if(c2&&c2.rim.length>1){ctx.save();ctx.beginPath();for(const w of c2.rim)ctx.lineTo(w[0],w[1]);if(c2.full)ctx.closePath();ctx.strokeStyle='rgba(20,16,12,.8)';ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.restore()}}
// a ball sunk into the floor (centre height z): the cap above the floor
const floorCap=(z,r)=>z>=r-1.2?null:z<=-r?false:{n:[0,0,1],al:Math.acos(cl(-z/r,-1,1))};   // (a ball that only touches the floor is drawn whole)
// draws f() as one picture faded to k (no outlines showing through), as in boss3.js (a new canvas is 300 x 150: both of its sides are
// checked, or the bottom of the picture was cut off)
const OCS=[];let OCL=0;
function fadeDraw(f,q,r,k){if(k>=.99){f();return}if(k<=.01)return;const T=ctx.getTransform(),S=Math.hypot(T.a,T.b),dx=T.a*q[0]+T.c*q[1]+T.e,dy=T.b*q[0]+T.d*q[1]+T.f,R=Math.ceil(r*S+6),W=2*R;
  const lv=OCL;let OC=OCS[lv];if(!OC)OC=OCS[lv]=document.createElement('canvas');if(OC.width<W||OC.height<W)OC.width=OC.height=W;const oc=OC.getContext('2d');oc.setTransform(1,0,0,1,0,0);oc.clearRect(0,0,W,W);
  oc.setTransform(T.a,T.b,T.c,T.d,T.e-(dx-R),T.f-(dy-R));const saved=ctx;ctx=oc;OCL++;try{f()}finally{ctx=saved;OCL--}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha*=k;ctx.drawImage(OC,0,0,W,W,dx-R,dy-R,W,W);ctx.restore()}
// puffs round a 3D point (k 0..1: spreading and fading)
function dust(V0,c,k,n,r,rgb,al){if(k<0||k>=1)return;for(let i=0;i<n;i++){const a=i/n*TAU+.4,d=r*(.4+k*.9),q=V0.P(add(c,[Math.cos(a)*d,Math.sin(a)*d,k*6+(i%2)*2]));ctx.fillStyle=`rgba(${rgb||'196,184,160'},${(al||.5)*(1-k)})`;ball(q,2.4+k*4.5);ctx.fill()}}

// ------------------------------------------------------------------ painting: three tones, faceted stone
// three tones from the upper left (light, base, shadow) over a screen box
function grad3(b,T){const w=b[2]-b[0],h=b[3]-b[1],cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,R=Math.max(w,h,2)*.64,g=ctx.createRadialGradient(cx-w*.24,cy-h*.26,R*.06,cx-w*.04,cy+h*.04,R);
  g.addColorStop(0,T.l);g.addColorStop(.34,T.b);g.addColorStop(.9,T.d);return g}
// a convex volume with a smooth outline painted in three tones; returns the hull (for clipping)
// the outline of an ellipsoid on the screen, exactly: a parallel projection of an ellipsoid is an ellipse, so its n points come straight from
// the three projected half axes (no hull of a cloud of points). F: its axes; T: the affine map to the body (X.T, a head's T) or none
const SILT={};
function ellSil(V0,C0,Rd,F,T,n){F=F||AXES;n=n||14;const tp=T||(q=>q),o=V0.P(tp(C0));let sxx=0,sxy=0,syy=0;
  for(let k=0;k<3;k++){const ax=k===0?F.u:k===1?F.v:F.w,r=Rd[k],q=V0.P(tp([C0[0]+ax[0]*r,C0[1]+ax[1]*r,C0[2]+ax[2]*r])),dx=q[0]-o[0],dy=q[1]-o[1];sxx+=dx*dx;sxy+=dx*dy;syy+=dy*dy}
  const l11=Math.sqrt(Math.max(sxx,1e-6)),l21=sxy/l11,l22=Math.sqrt(Math.max(syy-l21*l21,1e-6));let tb=SILT[n];if(!tb){tb=SILT[n]=[];for(let i=0;i<n;i++){const t=(i+.5)/n*TAU;tb.push([Math.cos(t),Math.sin(t)])}}
  const out=new Array(n);for(let i=0;i<n;i++){const c=tb[i][0],s=tb[i][1];out[i]=[o[0]+l11*c,o[1]+l21*c+l22*s]}return out}
// the convex hull of screen points that always drops the points nearly on a line (steady from one frame to the next), the points inside
// the octagon of the extreme points dropped before the sort (Akl–Toussaint), as in golem2b.js
function preHull(pts){const n=pts.length;if(n<24)return pts.slice();let a=pts[0],b=a,c=a,d=a,e=a,f=a,g=a,h=a;
  for(let i=1;i<n;i++){const q=pts[i],x=q[0],y=q[1];if(x<a[0])a=q;if(x>b[0])b=q;if(y<c[1])c=q;if(y>d[1])d=q;
    if(x+y<e[0]+e[1])e=q;if(x+y>f[0]+f[1])f=q;if(x-y<g[0]-g[1])g=q;if(x-y>h[0]-h[1])h=q}
  const O=[a,e,c,h,b,f,d,g],Ed=[];for(let i=0;i<8;i++){const p=O[i],q=O[(i+1)%8],ex=q[0]-p[0],ey=q[1]-p[1];if(ex*ex+ey*ey>1e-8)Ed.push(p[0],p[1],ex,ey)}
  if(Ed.length<12)return pts.slice();const out=[];
  for(let i=0;i<n;i++){const q=pts[i];let inside=true;for(let k=0;k<Ed.length;k+=4)if(Ed[k+2]*(q[1]-Ed[k+1])-Ed[k+3]*(q[0]-Ed[k])<=1e-6){inside=false;break}if(!inside)out.push(q)}
  return out}
function hullE(pts,E){pts=preHull(pts).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];E=E||0;
  for(const q of pts){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=E)lo.pop();lo.push(q)}
  for(let i=pts.length-1;i>=0;i--){const q=pts[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=E)up.pop();up.push(q)}
  lo.pop();up.pop();return lo.concat(up)}
// a smooth closed outline through screen points as a Path2D (filled, stroked and clipped with the same path)
function smoothP(pts){const n=pts.length,pa=new Path2D();pa.moveTo((pts[n-1][0]+pts[0][0])/2,(pts[n-1][1]+pts[0][1])/2);
  for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];pa.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}pa.closePath();return pa}
function svol3(V0,pts3,T,o){o=o||{};const pts=o.scr?pts3:hullE(pts3.map(q=>V0.P(q)),.08);if(pts.length<3)return pts;ctx.lineJoin='round';const pa=pts.path=smoothP(pts);ctx.fillStyle=o.fill||grad3(bbox(pts),T);ctx.fill(pa);
  if(!o.noInk){ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2.5;ctx.stroke(pa)}if(o.rim)rimP(pts,o.rim);return pts}
function rimP(pts,al){const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0)/2,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.15,cy+Rr*.15),kx=1-1.9/Math.max(1,(x1-x0)/2),ky=1-1.9/Math.max(1,(y1-y0)/2);
  g.addColorStop(0,C.wa(al));g.addColorStop(1,C.wa(0));ctx.beginPath();for(const q of pts)ctx.lineTo(cx+(q[0]-cx)*kx,cy+(q[1]-cy)*ky);ctx.closePath();ctx.strokeStyle=g;ctx.lineWidth=1.3;ctx.stroke()}
// the same warm rim along an outline that may be open (the visible part of a cap's edge)
function rimOpen(pts,al,closed){const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0,2)/2,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.15,cy+Rr*.15),k=1-1.6/Math.max(2,Rr);
  g.addColorStop(0,C.wa(al));g.addColorStop(1,C.wa(0));ctx.beginPath();for(const q of pts)ctx.lineTo(cx+(q[0]-cx)*k,cy+(q[1]-cy)*k);if(closed)ctx.closePath();ctx.strokeStyle=g;ctx.lineWidth=1.3;ctx.stroke()}
// how lit a face with the unit normal n is: the warm light comes from the upper left of the screen and a little from the front
function lit(V0,n){const o=V0.P(0,0,0),q=V0.P(n);return cl(.55+.45*(-.55*(q[0]-o[0])-.7*(q[1]-o[1]))+.2*V0.F(n),0,1)}
const tone=(T,k)=>{let r=T._r;if(!r){r=T._r=[];for(let i=0;i<=16;i++){const u=i/16;r.push(u<.5?cmix(T.d,T.b,u*2):cmix(T.b,T.l,u*2-1))}}return r[Math.round(cl(k,0,1)*16)]};
function fnorm(f){let x=0,y=0,z=0;for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length];x+=(a[1]-b[1])*(a[2]+b[2]);y+=(a[2]-b[2])*(a[0]+b[0]);z+=(a[0]-b[0])*(a[1]+b[1])}return nrm([x,y,z])}
const cen=f=>{let c=[0,0,0];for(const q of f)c=add(c,q);return mul(c,1/f.length)};
// a faceted solid (a carved stone): the hull filled with the shadow tone, each face toward us in its own tone, a light seam on the edges,
// the thick outline round the hull. FS: faces (3D points after the frame). Returns {H, faces: [{f, n, v}]} of the faces toward us
function facets(V0,FS,T,o){o=o||{};let all=o.verts;if(!all){all=[];for(const f of FS)for(const q of f)all.push(q)}if(all.length<3)return null;const c=cen(all),H=chull(all.map(q=>V0.P(q)));if(H.length<3)return null;
  ctx.lineJoin='round';poly(H);ctx.fillStyle=T.d;ctx.fill();const vis=[];
  for(const f of FS){if(f.length<3)continue;let n=fnorm(f);if(dot(n,sub(cen(f),c))<0)n=mul(n,-1);const v=V0.F(n);if(v<=.01)continue;vis.push({f,n,v});
    ctx.beginPath();for(const q of f){const s=V0.P(q);ctx.lineTo(s[0],s[1])}ctx.closePath();ctx.fillStyle=tone(T,lit(V0,n)+(o.kb||0));ctx.fill();
    if(o.seam!==false){ctx.strokeStyle='rgba(255,246,225,.16)';ctx.lineWidth=.8;ctx.stroke()}}
  poly(H);ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2.4;ctx.stroke();return{H,vis}}
// the faces of a box with bevelled edges: centre c, axes E (unit), half sizes Hs, bevel b (6 faces, 12 edges, 8 corners)
function boxF(c,E,Hs,b){const out=[],V3=(i,s)=>{let q=c;for(let a=0;a<3;a++)q=add(q,mul(E[a],s[a]*(a===i?Hs[a]:Hs[a]-b)));return q};
  for(let i=0;i<3;i++)for(const si of[-1,1]){const j=(i+1)%3,k=(i+2)%3,f=[];for(const[sj,sk] of[[-1,-1],[1,-1],[1,1],[-1,1]]){const s=[0,0,0];s[i]=si;s[j]=sj;s[k]=sk;f.push(V3(i,s))}out.push(f)}
  if(b>0){for(let i=0;i<3;i++){const j=(i+1)%3,k=(i+2)%3;for(const si of[-1,1])for(const sj of[-1,1]){const s0=[0,0,0],s1=[0,0,0];s0[i]=si;s0[j]=sj;s0[k]=-1;s1[i]=si;s1[j]=sj;s1[k]=1;out.push([V3(i,s0),V3(i,s1),V3(j,s1),V3(j,s0)])}}
    for(const s0 of[-1,1])for(const s1 of[-1,1])for(const s2 of[-1,1]){const s=[s0,s1,s2];out.push([V3(0,s),V3(1,s),V3(2,s)])}}
  return out}
function boxV(c,E,Hs,b){const out=[];for(const s0 of[-1,1])for(const s1 of[-1,1])for(const s2 of[-1,1]){const s=[s0,s1,s2];for(let i=0;i<3;i++){let q=c;for(let a=0;a<3;a++)q=add(q,mul(E[a],s[a]*(a===i?Hs[a]:Hs[a]-b)));out.push(q)}}return out}
// an axis frame from a direction d (the third axis) and a hint for the first
function frm(d,h){d=nrm(d);let u=sub(h||[1,0,0],mul(d,dot(h||[1,0,0],d)));if(len(u)<.15)u=sub([0,0,1],mul(d,d[2]));if(len(u)<.15)u=sub([0,1,0],mul(d,d[1]));u=nrm(u);return[u,cross(d,u),d]}
// a standing stone: an eight-sided prism from the base b along d, h tall, r0 at the base, r1 at the shoulder, a low rounded top with one
// corner chipped off. Returns its faces (sides first, in order round it) and the top point
function stoneF(b,d,h,r0,r1,tw,chip){const[u,v]=frm(d,[1,0,0]),ring=(z,r,dz)=>{const R=[];for(let i=0;i<8;i++){const a=i/8*TAU+tw;R.push(add(add(b,mul(d,z+(dz?dz(i):0))),add(mul(u,Math.cos(a)*r),mul(v,Math.sin(a)*r))))}return R};
  const R0=ring(-2,r0*1.04),R2=ring(h,r1*.82,i=>i===chip?-h*.18:i===(chip+1)%8?-h*.07:0),tip=add(b,mul(d,h)),F=[];
  for(let i=0;i<8;i++){const j=(i+1)%8;F.push([R0[i],R0[j],R2[j],R2[i]])}F.push(R2.slice())
  return{F,tip,R0,R2,V:R0.concat(R2)}}
// a band round a limb (a bracer, the ring of a knee): the hull of two round cross sections at a and b, radius r; the near edge lit.
// Returns the screen points of the two rims
// a round section on the screen: the circle of radius r round c in the plane of the unit axes u, v (projected straight: the projection is linear)
const TRG={};const trg=N=>TRG[N]||(TRG[N]=Array.from({length:N},(_,i)=>[Math.cos(i/N*TAU),Math.sin(i/N*TAU)]));
function ringS(V0,c,u,v,r,N){const o=V0.P(c),a=V0.P(c[0]+u[0]*r,c[1]+u[1]*r,c[2]+u[2]*r),b=V0.P(c[0]+v[0]*r,c[1]+v[1]*r,c[2]+v[2]*r),ax=a[0]-o[0],ay=a[1]-o[1],bx=b[0]-o[0],by=b[1]-o[1],T=trg(N),out=new Array(N);
  for(let i=0;i<N;i++){const cs=T[i][0],sn=T[i][1];out[i]=[o[0]+ax*cs+bx*sn,o[1]+ay*cs+by*sn]}return out}
function band(V0,a,b,r,T,o){o=o||{};const ax=nrm(sub(b,a)),[u,v]=frm(ax,[0,0,1]),N=12,ra=ringS(V0,a,u,v,r,N),rb=ringS(V0,b,u,v,o.r2||r,N);
  const H=chull(ra.concat(rb));if(H.length<3)return null;ctx.lineJoin='round';poly(H);ctx.fillStyle=grad3(bbox(H),T);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2.2;ctx.stroke();
  // the rim that faces us (the one on the side the axis points away from) shows as an ellipse edge
  const f=V0.F(ax),rim=f>0?rb:ra;if(Math.abs(f)>.12){ctx.strokeStyle=T.d;ctx.lineWidth=1.3;poly(rim);ctx.stroke();
    if(o.core){const c0=f>0?b:a,rr=(f>0?(o.r2||r):r)-o.inset,Q=ringS(V0,c0,u,v,rr,N);ctx.globalAlpha*=cl((Math.abs(f)-.12)*5,0,1);poly(Q);ctx.fillStyle=o.core;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();ctx.globalAlpha/=cl((Math.abs(f)-.12)*5,0,1)||1}}
  return{H,ra,rb}}
// a piece of limb with a flat end at a (radius ra: it goes into a band there) and a round end at b (radius rb), three tones and the dark side
function cyl(V0,a,ra,b,rb,T){const ax=nrm(sub(b,a)),[u,v]=frm(ax,[0,0,1]),pts=ringS(V0,a,u,v,ra,10),qa=V0.P(a),qb=V0.P(b),tb=trg(10);for(let i=0;i<10;i++)pts.push([qb[0]+tb[i][0]*rb,qb[1]+tb[i][1]*rb]);
  const H=chull(pts);if(H.length<3)return;ctx.lineJoin='round';poly(H);ctx.fillStyle=limbGrad(qa,qb,Math.max(ra,rb),T);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.8;ctx.stroke()}
// a limb's shading: across it, from the lit side (upper left) through the base to the dark side
function limbGrad(qa,qb,r,T){let nx=-(qb[1]-qa[1]),ny=qb[0]-qa[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;if(nx+ny>0){nx=-nx;ny=-ny}const mx=(qa[0]+qb[0])/2,my=(qa[1]+qb[1])/2;
  if(l<r*.6){nx=-.7;ny=-.7}const g=ctx.createLinearGradient(mx+nx*r,my+ny*r,mx-nx*r,my-ny*r);g.addColorStop(0,T.l);g.addColorStop(.42,T.b);g.addColorStop(1,T.d);return g}
// cut a face at the floor (the teeth of the ball dig into it)
function clipZ(f){const out=[];for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length];if(a[2]>=0)out.push(a);if((a[2]>=0)!==(b[2]>=0)){const k=a[2]/(a[2]-b[2]);out.push(lerp3(a,b,k))}}return out}

// ------------------------------------------------------------------ colours
const T3=(l,b,d)=>({l,b,d}),mixT=(a,b,k)=>k<=0?a:k>=1?b:T3(cmix(a.l,b.l,k),cmix(a.b,b.b,k),cmix(a.d,b.d,k));
const mixRgb=(a,b,k)=>{if(k<=0)return a;if(k>=1)return b;const A=a.split(',').map(Number),B=b.split(',').map(Number);return A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')};
// ------------------------------------------------------------------ the body's frame turned back (a body point to the rest pose)
function invFrame(A){const ca=Math.cos(A.lean||0),sa=Math.sin(A.lean||0),cr=Math.cos(A.roll||0),sr=Math.sin(A.roll||0),cy=Math.cos(A.yaw||0),sy=Math.sin(A.yaw||0),
  sz=1+(A.s||0),sxy=1/Math.sqrt(Math.max(.3,sz)),sx=sxy*(1+(A.sx||0)),B=A.B||[0,0,0];
  return q=>{const X0=q[0]-B[0],Y0=q[1]-B[1],Z0=q[2]-B[2],x2=X0*cy+Y0*sy,y1=-X0*sy+Y0*cy,x=x2*ca-Z0*sa,z1=x2*sa+Z0*ca,y=y1*cr-z1*sr,z=y1*sr+z1*cr;return[x/sx,y/sxy,z/sz]}}
const rotXv=(v,a)=>{const c=Math.cos(a),s=Math.sin(a);return[v[0],v[1]*c-v[2]*s,v[1]*s+v[2]*c]};
function rotAx(v,ax,a){const c=Math.cos(a),s=Math.sin(a);return add(add(mul(v,c),mul(cross(ax,v),s)),mul(ax,dot(ax,v)*(1-c)))}
return{dir,trem,fxOn,cheat,pls,rise,flash,clipTo,ga,strokeRuns,ellCap,outCap,capPts,sunkDraw,floorCap,fadeDraw,dust,grad3,ellSil,preHull,hullE,smoothP,svol3,rimP,rimOpen,lit,tone,fnorm,cen,facets,boxF,boxV,frm,stoneF,trg,ringS,band,cyl,limbGrad,clipZ,T3,mixT,mixRgb,invFrame,rotXv,rotAx}})();
