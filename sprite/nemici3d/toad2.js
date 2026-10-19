// IL RE ROSPO rifatto: «il Tiranno delle Lucciole» (Denis, 15 ottobre: «rivisita tutti i boss, rendili più creepy e fatti meglio sia da
// fermi che nelle animazioni», «un po' più cupi», «falli possenti, belli, fighi, che diano timore nello sfidarli»; il secondo dopo il Golem).
// Il rospo più grosso e prepotente della Palude delle Lucciole: per diventare re si è ingozzato delle lucciole della sua palude, per questo
// è enorme e la loro luce gli vive dentro, nella pancia che brilla come una lanterna e nelle verruche della schiena. Siede come su un trono:
// corona d'oro troppo piccola e storta, cappa corta di velluto di tifa col bordo di piumino bianco (il suo ermellino), colletto di sette tife
// ritte dietro la testa. Ti guarda dall'alto in basso, palpebre a mezz'asta sotto due creste ossee, sorriso storto con due zannette.
// Prima di ogni colpo la luce delle lucciole gli corre dentro fino al punto da cui partirà, e gli occhi si spalancano (è il suo avviso, come
// il cuore del Golem). A metà vita si mangia le ultime lucciole della stanza e la sua luce diventa brace. Sconfitto le sputa tutte in una
// fontana di luce, si sgonfia e torna un rospetto qualunque che si tuffa nel fango: resta la corona. Resta un boss della Classica: forme
// tonde da giocattolo, colori pieni, occhi grandi con la lucina, due zannette tonde, niente sangue né ferite.
// Metodo dello spaventapasseri: scheletro 3D proiettato con V(face), braccia e gambe a due ossa (ik), ordine di disegno dalla posa di riposo;
// dipinto come la lanterna (tre toni, bordo illuminato della luce delle torce, bagliori morbidi). Design: docs/boss-classici-design/toad.md.
// Mosse: idle, walk, hit, tongue (Linguata), stuck (Lingua incollata), sweep (Frustata), flop (Panciata), bubbles (Rutto di bolle),
// drum (Tamburo di pancia), rain (Pioggia di lucciole), rage (Furia: il passaggio alla fase 2, lo disegna da sola), taunt (Presa in giro),
// enter (cade dal cielo), die (si sgonfia e torna un rospetto). Frustata e Pioggia sono solo della fase 2: disegnate sempre così, anche
// senza o.p2.
// Opzioni: o.p2 (seconda fase), o.z (altezza data dal gioco nella Panciata e nei balzi), o.tip ([dx, dy] sullo schermo rispetto a (x, y):
// la punta della lingua), o.side (+1 / -1: il lato da cui parte la Frustata), o.chain (Panciata della Tripla, dalla pancia schiacciata),
// o.point (angolo rispetto a dove guarda: la pozza indicata alla fine del Tamburo), o.noFlies (niente lucciole intorno), o.noFx.
// Con LOWFX niente bagliori, lucine che girano, lucciole intorno, piumino che vola né schizzi; tife e cappa ferme.
// Disegni per il gioco con lo stesso aspetto: N3.toadBubble, N3.toadFly, N3.toadMud, N3.toadCrown.
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,hull,run,cmix,poly,bbox,
  sp,rotX,rotY,rotZ,keys,sstep,hitK,frame,AXES,floor,parts,reg,smooth,chull,ik,stepper}=C;
// points and normals of an ellipsoid without the in-between arrays (they are called hundreds of times a frame)
const ellAt=(Cc,Rd,F,m)=>{const a=m[0]*Rd[0],b=m[1]*Rd[1],c=m[2]*Rd[2];if(!F||F===AXES)return[Cc[0]+a,Cc[1]+b,Cc[2]+c];
  const u=F.u,v=F.v,w=F.w;return[Cc[0]+u[0]*a+v[0]*b+w[0]*c,Cc[1]+u[1]*a+v[1]*b+w[1]*c,Cc[2]+u[2]*a+v[2]*b+w[2]*c]};
const ellN=(Rd,F,m)=>{const a=m[0]/Rd[0],b=m[1]/Rd[1],c=m[2]/Rd[2];let x=a,y=b,z=c;if(F&&F!==AXES){const u=F.u,v=F.v,w=F.w;x=u[0]*a+v[0]*b+w[0]*c;y=u[1]*a+v[1]*b+w[1]*c;z=u[2]*a+v[2]*b+w[2]*c}
  const l=Math.sqrt(x*x+y*y+z*z)||1;return[x/l,y/l,z/l]};

// ------------------------------------------------------------------ helpers (as in golem2.js)
const dir=(t,e)=>[Math.cos(e)*Math.cos(t),Math.cos(e)*Math.sin(t),Math.sin(e)];
const trem=(p,a,b,hz,dur)=>{const w=Math.min(.03,(b-a)/3);return sstep(a,a+w,p)*(1-sstep(b-w,b,p))*Math.sin((p-a)*TAU*hz*dur)};
const fxOn=o=>!o.noFx&&!LOWFX;
const pls=(p,c,w)=>{const d=Math.abs(p-c)/(w/2);return d>=1?0:.5+.5*Math.cos(d*Math.PI)};
const rise=(p,a,b,c,d)=>sstep(a,b,p)*(1-sstep(c,d,p));
const flash=(p,a,w)=>p<a||p>a+w?0:1-(p-a)/w;
const cyc=(p,c)=>((p-c)%1+1)%1;
// a soft light added over what is drawn (as C3.shine, without saving the whole state: the model draws many of them)
const shine=(rgb,x,y,r,a,ry)=>{if(LOWFX||!(a>.004))return;const o=ctx.globalCompositeOperation,a0=ctx.globalAlpha;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a0*Math.min(1,a);ctx.drawImage(glowSprite(rgb),x-r,y-(ry||r),r*2,(ry||r)*2);ctx.globalAlpha=a0;ctx.globalCompositeOperation=o};
const ga=(k,f)=>{if(k<=.004)return;const a0=ctx.globalAlpha;ctx.globalAlpha=a0*Math.min(1,k);f();ctx.globalAlpha=a0};
const mir=q=>[q[0],-q[1],q[2]],sdv=(q,sd)=>[q[0],sd*q[1],q[2]];
const strokeRuns=(runs,col,w)=>{if(!runs.length)return;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();for(const r of runs){if(r.length<2)continue;ctx.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)ctx.lineTo(r[i][0],r[i][1])}ctx.stroke()};
// how a ball (centre c0, radius r, in the body's frame) sticks out of an ellipsoid: null clear, false inside, else the cap
function outCap(X,Cc,Rd,Fr,c0,r,k){const R2=mul(Rd,k),d=sub(c0,Cc),u=[dot(d,Fr.u)/R2[0],dot(d,Fr.v)/R2[1],dot(d,Fr.w)/R2[2]],l=len(u);if(l<1e-4)return false;
  const m=mul(u,1/l),n=ellN(R2,Fr,m),h=dot(sub(c0,ellAt(Cc,R2,Fr,m)),n);if(h>=r)return null;if(h<=-r)return false;return{n:X.Rd(n),al:Math.acos(cl(-h/r,-1,1))}}
function capPts(V0,q,Rr,n,al,N0){n=nrm(n);let u=cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u),ca=Math.cos(al),sa=Math.sin(al),N=N0||22,b=[],f=[];
  for(let i=0;i<N;i++){const t=i/N*TAU,m=add(mul(n,ca),add(mul(u,Math.cos(t)*sa),mul(v,Math.sin(t)*sa)));b.push(m);f.push(V0.F(m))}
  const nv=f.filter(x=>x>=0).length;if(!nv)return false;if(nv===N){const pts=b.map(m=>sp(V0,q,Rr,m));return{pts,rim:pts,full:true}}
  let s0=0;for(let i=0;i<N;i++)if(f[i]<0&&f[(i+1)%N]>=0){s0=(i+1)%N;break}
  const cut=(a,c)=>{const k=f[a]/(f[a]-f[c]);return nrm(lerp3(b[a],b[c],k))},rn=[cut((s0-1+N)%N,s0)];let i=s0;while(f[i]>=0){rn.push(b[i]);i=(i+1)%N}rn.push(cut((i-1+N)%N,i));
  const rim=rn.map(m=>sp(V0,q,Rr,m)),a0=Math.atan2(rim[0][1]-q[1],rim[0][0]-q[0]),a1=Math.atan2(rim[rim.length-1][1]-q[1],rim[rim.length-1][0]-q[0]);
  const nm=a=>((a%TAU)+TAU)%TAU,ccw=nm(a0-a1),span=ccw<=Math.PI?ccw:-(TAU-ccw),M=Math.max(2,Math.ceil(Math.abs(span)/.15)),pts=rim.slice();
  for(let k=1;k<M;k++){const a=a1+span*k/M;pts.push([q[0]+Math.cos(a)*Rr,q[1]+Math.sin(a)*Rr])}return{pts,rim,full:false}}
// draws f() (round the screen point q, radius r) clipped to the part that sticks out (oc from outCap), with a crease where it goes in
function sunkDraw(V0,q,r,oc,f,crease){if(oc===false)return;if(!oc){f();return}const big=oc.al>Math.PI/2,n=big?mul(oc.n,-1):oc.n,al=big?Math.PI-oc.al:oc.al,R1=r+1.6,cp=capPts(V0,q,R1,n,al,r>14?22:14);
  if(big&&!cp){f();return}if(!big&&!cp)return;
  ctx.save();ctx.beginPath();if(big){ctx.arc(q[0],q[1],R1+2,0,TAU);ctx.closePath()}ctx.moveTo(cp.pts[0][0],cp.pts[0][1]);for(const w of cp.pts)ctx.lineTo(w[0],w[1]);ctx.closePath();ctx.clip(big?'evenodd':'nonzero');f();ctx.restore();
  // the crease where it goes in: the edge of the same cap, drawn at the ball's own radius
  if(cp.rim.length>1){const k=r/R1;ctx.beginPath();for(const w of cp.rim)ctx.lineTo(q[0]+(w[0]-q[0])*k,q[1]+(w[1]-q[1])*k);if(cp.full)ctx.closePath();ctx.strokeStyle=crease||'rgba(16,30,14,.75)';ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()}}
// puffs round a 3D point (k 0..1: spreading and fading)
function puffs(V0,c,k,n,r,rgb,al,up){if(k<0||k>=1)return;for(let i=0;i<n;i++){const a=i/n*TAU+.4,d=r*(.4+k*.9),q=V0.P(add(c,[Math.cos(a)*d,Math.sin(a)*d,k*(up||6)+(i%2)*2]));ctx.fillStyle=`rgba(${rgb},${(al||.5)*(1-k)})`;ball(q,2.2+k*4);ctx.fill()}}

// ------------------------------------------------------------------ painting: three tones, the rim of the torches' light
function grad3(b,T){const w=b[2]-b[0],h=b[3]-b[1],cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,R=Math.max(w,h,2)*.64,g=ctx.createRadialGradient(cx-w*.24,cy-h*.26,R*.06,cx-w*.04,cy+h*.04,R);
  g.addColorStop(0,T.l);g.addColorStop(.34,T.b);g.addColorStop(.9,T.d);return g}
// the big masses: the light only on the upper left, deep shadow on the far side («un po' più cupi»)
function gradDeep(b,T){const w=b[2]-b[0],h=b[3]-b[1],cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,R=Math.max(w,h,2)*.7,g=ctx.createRadialGradient(cx-w*.26,cy-h*.3,R*.04,cx-w*.06,cy+h*.02,R);
  g.addColorStop(0,T.l);g.addColorStop(.26,T.b);g.addColorStop(.72,cmix(T.b,T.d,.62));g.addColorStop(1,T.d);return g}
// the outline of an ellipsoid on the screen, exactly (a parallel projection of an ellipsoid is an ellipse)
const SILT={};
function ellSil(V0,C0,Rd,F,T,n){F=F||AXES;n=n||14;const tp=T||(q=>q),o=V0.P(tp(C0));let sxx=0,sxy=0,syy=0;
  for(let k=0;k<3;k++){const ax=k===0?F.u:k===1?F.v:F.w,r=Rd[k],q=V0.P(tp([C0[0]+ax[0]*r,C0[1]+ax[1]*r,C0[2]+ax[2]*r])),dx=q[0]-o[0],dy=q[1]-o[1];sxx+=dx*dx;sxy+=dx*dy;syy+=dy*dy}
  const l11=Math.sqrt(Math.max(sxx,1e-6)),l21=sxy/l11,l22=Math.sqrt(Math.max(syy-l21*l21,1e-6));let tb=SILT[n];if(!tb){tb=SILT[n]=[];for(let i=0;i<n;i++){const t=(i+.5)/n*TAU;tb.push([Math.cos(t),Math.sin(t)])}}
  const out=new Array(n);for(let i=0;i<n;i++){const c=tb[i][0],s=tb[i][1];out[i]=[o[0]+l11*c,o[1]+l21*c+l22*s]}return out}
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
function smoothP(pts){const n=pts.length,pa=new Path2D();pa.moveTo((pts[n-1][0]+pts[0][0])/2,(pts[n-1][1]+pts[0][1])/2);
  for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];pa.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}pa.closePath();return pa}
// the rim: the light of the torches (lime in the first phase, orange in the second) inside an outline, fading away from the upper left
function rimP(pts,rgb,al,closed){const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0,2)/2,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.15,cy+Rr*.15),
  kx=1-1.9/Math.max(2,(x1-x0)/2),ky=1-1.9/Math.max(2,(y1-y0)/2);g.addColorStop(0,`rgba(${rgb},${al})`);g.addColorStop(1,`rgba(${rgb},0)`);
  ctx.beginPath();for(const q of pts)ctx.lineTo(cx+(q[0]-cx)*kx,cy+(q[1]-cy)*ky);if(closed!==false)ctx.closePath();ctx.strokeStyle=g;ctx.lineWidth=1.4;ctx.stroke()}
function svol3(V0,pts3,T,o){o=o||{};const pts=o.scr?pts3:hullE(pts3.map(q=>V0.P(q)),.08);if(pts.length<3)return pts;ctx.lineJoin='round';const pa=pts.path=smoothP(pts);ctx.fillStyle=o.fill||grad3(bbox(pts),T);ctx.fill(pa);
  if(!o.noInk){ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2.5;ctx.stroke(pa)}if(o.rim)rimP(pts,o.rgb,o.rim);return pts}
// a soft ball painted in three tones with the outline and the rim (screen centre q)
function tball(q,r,T,rgb,lw,ra,g0){ctx.beginPath();ctx.arc(q[0],q[1],Math.max(.2,r),0,TAU);ctx.fillStyle=g0||grad3([q[0]-r,q[1]-r,q[0]+r,q[1]+r],T);ctx.fill();if(lw!==0){ctx.strokeStyle=INK;ctx.lineWidth=lw||2.2;ctx.stroke()}
  if(ra&&r>3){const g=ctx.createLinearGradient(q[0]-r*.8,q[1]-r*.8,q[0]+r*.15,q[1]+r*.15);g.addColorStop(0,`rgba(${rgb},${ra})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.beginPath();ctx.arc(q[0],q[1],r-1.7,0,TAU);ctx.strokeStyle=g;ctx.lineWidth=1.3;ctx.stroke()}}
// a limb's shading: across it, from the lit side (the light comes from the upper left) through the base to the dark side. The light's
// part across the limb has no sign to flip: a limb that turns parallel to the light gets a flatter shading, never the sides swapped
function limbGrad(qa,qb,r,T){const mx=(qa[0]+qb[0])/2,my=(qa[1]+qb[1])/2,l=Math.hypot(qb[0]-qa[0],qb[1]-qa[1]),Lx=-.7071,Ly=-.7071;let nx=Lx,ny=Ly;
  if(l>1e-3){const tx=(qb[0]-qa[0])/l,ty=(qb[1]-qa[1])/l,d=Lx*tx+Ly*ty,w=sstep(r*.3,r*.9,l);nx=Lx-d*tx*w;ny=Ly-d*ty*w}
  const m=Math.hypot(nx,ny);if(m>1e-4){nx/=m;ny/=m}else{nx=Lx;ny=Ly}const k=Math.min(1,m);
  const g=ctx.createLinearGradient(mx+nx*r,my+ny*r,mx-nx*r,my-ny*r);g.addColorStop(0,k>.97?T.l:cmix(T.b,T.l,k));g.addColorStop(.42,T.b);g.addColorStop(1,k>.97?T.d:cmix(T.b,T.d,.5+.5*k));return g}
// a limb of capsules in one piece (every outline, then every fill), shaded across, with the rim
function limb3(V0,pts3,rs,T,rgb,lw){const P2=pts3.map(q=>V0.P(q));lw=lw||2.6;ctx.fillStyle=INK;for(let i=0;i<P2.length-1;i++){hull(P2[i],rs[i]+lw/2,P2[i+1],rs[i+1]+lw/2);ctx.fill()}
  const qa=P2[0],qb=P2[P2.length-1];ctx.fillStyle=limbGrad(qa,qb,Math.max(...rs),T);for(let i=0;i<P2.length-1;i++){hull(P2[i],Math.max(.3,rs[i]-lw/2),P2[i+1],Math.max(.3,rs[i+1]-lw/2));ctx.fill()}
  if(rgb)for(let i=0;i<P2.length-1;i++){const a=P2[i],b=P2[i+1],ra=rs[i],rb=rs[i+1],cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2,R=Math.max(ra,rb)+Math.hypot(b[0]-a[0],b[1]-a[1])/2,g=ctx.createLinearGradient(cx-R*.8,cy-R*.8,cx+R*.15,cy+R*.15);
    g.addColorStop(0,`rgba(${rgb},.3)`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.strokeStyle=g;ctx.lineWidth=1.3;hull(a,Math.max(.4,ra-1.9),b,Math.max(.4,rb-1.9));ctx.stroke()}
  return P2}
// an axis frame from a direction d (the third axis) and a hint for the first
function frm(d,h){d=nrm(d);let u=sub(h||[1,0,0],mul(d,dot(h||[1,0,0],d)));if(len(u)<.15)u=sub([0,0,1],mul(d,d[2]));if(len(u)<.15)u=sub([0,1,0],mul(d,d[1]));u=nrm(u);return[u,cross(d,u),d]}
const TRG={};const trg=N=>TRG[N]||(TRG[N]=Array.from({length:N},(_,i)=>[Math.cos(i/N*TAU),Math.sin(i/N*TAU)]));
function ringS(V0,c,u,v,r,N){const o=V0.P(c),a=V0.P(c[0]+u[0]*r,c[1]+u[1]*r,c[2]+u[2]*r),b=V0.P(c[0]+v[0]*r,c[1]+v[1]*r,c[2]+v[2]*r),ax=a[0]-o[0],ay=a[1]-o[1],bx=b[0]-o[0],by=b[1]-o[1],T=trg(N),out=new Array(N);
  for(let i=0;i<N;i++){const cs=T[i][0],sn=T[i][1];out[i]=[o[0]+ax*cs+bx*sn,o[1]+ay*cs+by*sn]}return out}
// a band round a limb (the golden bracelet): the hull of two round cross sections, the rim that faces us as an ellipse edge
function band(V0,a,b,r,T,o){o=o||{};const ax=nrm(sub(b,a)),[u,v]=frm(ax,[0,0,1]),N=o.n||10,ra=ringS(V0,a,u,v,r,N),rb=ringS(V0,b,u,v,o.r2||r,N);
  const H=chull(ra.concat(rb));if(H.length<3)return null;ctx.lineJoin='round';C.poly(H);ctx.fillStyle=grad3(bbox(H),T);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2;ctx.stroke();
  const f=V0.F(ax),rm=f>0?rb:ra;if(Math.abs(f)>.12){ctx.strokeStyle=T.d;ctx.lineWidth=1.2;C.poly(rm);ctx.stroke()}return{H,ra,rb}}

// ------------------------------------------------------------------ hiding a part behind the body, at its own depth
// The screen region of an ellipsoid (centre C0, radii R, axes Fr, through the frame X) whose surface is nearer to the camera than the depth d
// (in V0.D units): a part at that depth is hidden there. Seen in parallel projection the sections of an ellipsoid across the line of sight
// are similar ellipses: the silhouette shrunk by sqrt(1-k²) and slid by k along the projected conjugate axis (k: d from the centre over
// the depth of the ellipsoid). So a limb turning behind the body goes out of sight bit by bit, never all at once
function nearReg(V0,X,C0,R,Fr,d){const r=nearAt(nearPrep(V0,X,C0,R,Fr),d);return r&&regPts(r)}
// what does not change with the depth, once a frame for each solid (the silhouette and its box only when a part is really near it)
function nearPrep(V0,X,C0,R,Fr){const o=X.T(C0),a=[sub(X.T(add(C0,mul(Fr.u,R[0]))),o),sub(X.T(add(C0,mul(Fr.v,R[1]))),o),sub(X.T(add(C0,mul(Fr.w,R[2]))),o)],
  w=[V0.D(1,0,0),V0.D(0,1,0),V0.D(0,0,1)],t=[dot(a[0],w),dot(a[1],w),dot(a[2],w)],h=Math.hypot(t[0],t[1],t[2])||1,q0=V0.P(o),An=add(add(mul(a[0],t[0]/h),mul(a[1],t[1]/h)),mul(a[2],t[2]/h)),sh=V0.P(add(o,An));
  return{d0:V0.D(o),h,q0,sx:sh[0]-q0[0],sy:sh[1]-q0[1],sil:null,bb:null,mk:()=>ellSil(V0,C0,R,Fr,X.T,16)}}
function nearSil(N){if(!N.sil){const s=N.sil=N.mk();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of s){if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1]}N.bb=[x0,y0,x1,y1]}return N.sil}
// the region at a depth: null (nothing hides there) or the section {N, k}, made into a polygon only when it is needed
// (it grows from nothing at the far edge of the solid: a part turning behind it is never bitten all at once)
function nearAt(N,d){const k=(d-N.d0)/N.h;return k>=1?null:{N,k:Math.max(0,k)}}
function regPts(r){if(Array.isArray(r))return r;const N=r.N,sil=nearSil(N),k=r.k;if(k<=0)return sil;const q0=N.q0,dx=N.sx*k,dy=N.sy*k,sc=Math.sqrt(Math.max(0,1-k*k));
  return sil.map(p=>[q0[0]+(p[0]-q0[0])*sc+dx,q0[1]+(p[1]-q0[1])*sc+dy])}
function regBox(r){if(Array.isArray(r)){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of r){if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1]}return[x0,y0,x1,y1]}
  const N=r.N;nearSil(N);const q0=N.q0,k=r.k,dx=N.sx*k,dy=N.sy*k,sc=Math.sqrt(Math.max(0,1-k*k)),b=N.bb;return[q0[0]+(b[0]-q0[0])*sc+dx,q0[1]+(b[1]-q0[1])*sc+dy,q0[0]+(b[2]-q0[0])*sc+dx,q0[1]+(b[3]-q0[1])*sc+dy]}
// a capsule and a ball added to the current path (several shapes of one colour, one fill)
function hullA(a,ra,b,rb){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);if(d<=Math.abs(ra-rb)+.01){ballA(ra>=rb?a:b,Math.max(ra,rb));return}
  const an=Math.atan2(dy,dx),f=Math.acos(cl((ra-rb)/d,-1,1)),s=an+f;ctx.moveTo(a[0]+Math.cos(s)*ra,a[1]+Math.sin(s)*ra);ctx.arc(a[0],a[1],ra,s,an+TAU-f);ctx.arc(b[0],b[1],rb,an-f,an+f);ctx.closePath()}
function ballA(q,r){r=Math.max(.1,r);ctx.moveTo(q[0]+r,q[1]);ctx.arc(q[0],q[1],r,0,TAU)}
function bbOf(V0,pts,m){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of pts){const q=V0.P(p);if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1]}return[x0-m,y0-m,x1+m,y1+m]}
// draws f() only outside the regions (each a polygon, a section {N, k} or null)
// (bb: the box on the screen of what f draws; a region that does not touch it is left out, and when one region covers it all, f is not
// drawn at all: no clip for nothing)
function inConvex(r,x,y){let s=0;for(let i=0,n=r.length;i<n;i++){const a=r[i],b=r[(i+1)%n],c=(b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]);if(c===0)continue;const g=c>0?1:-1;if(!s)s=g;else if(g!==s)return false}return true}
function behind(regs,f,bb){let n=0;const use=[];for(const r0 of regs)if(r0){if(bb){const b=regBox(r0);if(b[2]<bb[0]||b[0]>bb[2]||b[3]<bb[1]||b[1]>bb[3])continue}const r=regPts(r0);
    if(bb&&inConvex(r,bb[0],bb[1])&&inConvex(r,bb[2],bb[1])&&inConvex(r,bb[0],bb[3])&&inConvex(r,bb[2],bb[3]))return;use.push(r)}
  for(const r of use){if(!n)ctx.save();n++;ctx.beginPath();if(bb)ctx.rect(bb[0],bb[1],bb[2]-bb[0],bb[3]-bb[1]);else ctx.rect(-1e4,-1e4,2e4,2e4);ctx.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)ctx.lineTo(r[i][0],r[i][1]);ctx.closePath();ctx.clip('evenodd')}f();if(n)ctx.restore()}

// ------------------------------------------------------------------ caps on an ellipsoid: the part of it out of the body
// The part of an ellipsoid (centre C0, radii R, axes Fr) that is not inside another solid: a cap round the unit direction n (its own unit
// sphere) whose edge is where it goes in, measured once for N directions round n (inside: a test on a point of the body at rest)
function capTab(C0,R,Fr,n,inside,N,u0){n=nrm(n);let u=u0?sub(u0,mul(n,dot(u0,n))):cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u),ang=[],b=[];
  for(let i=0;i<N;i++){const t=i/N*TAU,w=add(mul(u,Math.cos(t)),mul(v,Math.sin(t))),at=a=>ellAt(C0,R,Fr,add(mul(n,Math.cos(a)),mul(w,Math.sin(a))));
    let a1=Math.PI;for(let a=.04;a<=Math.PI;a+=.04)if(inside(at(a))){a1=a;break}
    let lo=Math.max(0,a1-.04),hi=a1;if(a1<Math.PI)for(let k=0;k<14;k++){const m=(lo+hi)/2;if(inside(at(m)))hi=m;else lo=m}
    const a=a1<Math.PI?(lo+hi)/2:Math.PI*.97;ang.push(a);b.push(add(mul(n,Math.cos(a)),mul(w,Math.sin(a))))}
  return{n,u,v,ang,b,N}}
// a cap of a given shape (half-angle al along u, alv across) as a table too (the throat, the cape)
function capFix(n,al,alv,u0,N,rf){n=nrm(n);let u=u0?sub(u0,mul(n,dot(u0,n))):cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u),ang=[],b=[];N=N||32;
  for(let i=0;i<N;i++){const t=i/N*TAU,c=Math.cos(t),s=Math.sin(t),a=(rf?rf(t):1)/Math.sqrt((c/al)*(c/al)+(s/alv)*(s/alv));ang.push(a);b.push(add(mul(n,Math.cos(a)),mul(add(mul(u,c),mul(v,s)),Math.sin(a))))}
  return{n,u,v,ang,b,N}}
// a cap whose edge goes through body points (one side given, mirrored), with a wave added to the angle
function capKeys(n,u0,pts,N,wave){n=nrm(n);let u=nrm(sub(u0,mul(n,dot(u0,n))));const v=cross(n,u),K=[];
  for(const q of pts.concat(pts.filter(q=>q[1]!==0).map(mir))){const m=dirOn(q,BC,BR,FB);let t=Math.atan2(dot(m,v),dot(m,u));if(t<0)t+=TAU;K.push([t,Math.acos(cl(dot(m,n),-1,1))])}
  K.sort((a,b)=>a[0]-b[0]);const M=K.length,at=t=>{let i=0;while(i<M&&K[i][0]<=t)i++;const a=K[(i-1+M)%M],b=K[i%M];let t0=a[0],t1=b[0];if(t1<t0)t1+=TAU;let tt=t;if(tt<t0)tt+=TAU;
    const k=(tt-t0)/((t1-t0)||1),kk=k*k*(3-2*k);return lerp(a[1],b[1],kk)};
  const ang=[],b=[];for(let i=0;i<N;i++){const t=i/N*TAU,a=at(t)+(wave?wave(t):0);ang.push(a);b.push(add(mul(n,Math.cos(a)),mul(add(mul(u,Math.cos(t)),mul(v,Math.sin(t))),Math.sin(a))))}
  return{n,u,v,ang,b,N}}
const inCapT=(tab,d)=>{const th=Math.acos(cl(dot(d,tab.n),-1,1));let t=Math.atan2(dot(d,tab.v),dot(d,tab.u));if(t<0)t+=TAU;const k=t/TAU*tab.N,i0=Math.floor(k)%tab.N,i1=(i0+1)%tab.N,fr=k-Math.floor(k);return th<lerp(tab.ang[i0],tab.ang[i1],fr)};
// the part of that cap that faces us, as a path: the edge where it goes in (the crease) and the outline of the ellipsoid itself (the limb)
function capReg(V0,X,C0,R,Fr,tab){const{P,F}=V0,S=m=>P(X.T(ellAt(C0,R,Fr,m))),g=nrm([F(X.Rd(Fr.u))/R[0],F(X.Rd(Fr.v))/R[1],F(X.Rd(Fr.w))/R[2]]),b=tab.b,N=tab.N,f=new Array(N);let nv=0;
  for(let i=0;i<N;i++){const m=b[i];f[i]=m[0]*g[0]+m[1]*g[1]+m[2]*g[2];if(f[i]>=0)nv++}
  // a wavy edge can dip behind the outline for a point or two and come back: such a short gap counts as seen (one run, one region)
  if(nv>N/2&&nv<N){let runs=0;for(let i=0;i<N;i++)if(f[i]<0&&f[(i+1)%N]>=0)runs++;if(runs>1)for(let i=0;i<N;i++){if(f[i]>=0)continue;let j=i,l=0;while(f[j%N]<0&&l<N){l++;j++}if(l<=3){for(let k=i;k<i+l;k++){f[k%N]=1e-4;nv++}}i=j-1}}
  let e1=cross(g,[0,0,1]);if(len(e1)<.2)e1=cross(g,[0,1,0]);e1=nrm(e1);const e2=cross(g,e1),ang=m=>Math.atan2(dot(m,e2),dot(m,e1)),lim=a=>add(mul(e1,Math.cos(a)),mul(e2,Math.sin(a)));
  const pa=new Path2D(),addPts=(pts,close)=>{pa.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)pa.lineTo(pts[i][0],pts[i][1]);if(close)pa.closePath()},silh=()=>{const s=[];for(let k=0;k<28;k++)s.push(S(lim(k/28*TAU)));return s};
  if(nv===0){if(!inCapT(tab,g))return false;const s=silh();addPts(s,1);return{path:pa,crease:[],limb:s,ring:1}}
  if(nv===N){const pts=b.map(S);if(inCapT(tab,mul(g,-1))){const s=silh();addPts(s,1);addPts(pts,1);return{path:pa,crease:pts,limb:s,ring:1,eo:1}}addPts(pts,1);return{path:pa,crease:pts,limb:[],closed:1}}
  let s0=0;for(let i=0;i<N;i++)if(f[i]<0&&f[(i+1)%N]>=0){s0=(i+1)%N;break}
  const cut=(a,c)=>{const k=f[a]/(f[a]-f[c]);return nrm(lerp3(b[a],b[c],k))},rn=[cut((s0-1+N)%N,s0)];let i=s0,gd=0;while(f[i]>=0&&gd++<N){rn.push(b[i]);i=(i+1)%N}rn.push(cut((i-1+N)%N,i));
  const a0=ang(rn[rn.length-1]),a1=ang(rn[0]);let d=((a1-a0)%TAU+TAU)%TAU;const span=inCapT(tab,lim(a0+d/2))?d:d-TAU,M=Math.max(2,Math.ceil(Math.abs(span)/.18)),lb=[];
  for(let k=0;k<=M;k++)lb.push(S(lim(a0+span*k/M)));const cr=rn.map(S);addPts(cr.concat(lb.slice(1,-1)),1);return{path:pa,crease:cr,limb:lb}}

// ------------------------------------------------------------------ colours
const T3=(l,b,d)=>({l,b,d}),mixT=(a,b,k)=>k<=0?a:k>=1?b:T3(cmix(a.l,b.l,k),cmix(a.b,b.b,k),cmix(a.d,b.d,k));
const mixRgb=(a,b,k)=>{if(k<=0)return a;if(k>=1)return b;const A=a.split(',').map(Number),B=b.split(',').map(Number);return A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')};
// first phase: deep greens with cold shadows, the lime light of the fireflies, cinnamon velvet, gold (the skin a fifth darker than the
// design's first numbers: next to the Golem it was a cheerful puppet, and the amber eyes and the firefly warts need some dark round them)
const K1={skin:T3('#86b84e','#3f7429','#15301a'),spot:'#213d17',wet:'234,255,216',rimc:'226,242,138',
  wart:T3('#9cc463','#4f8433','#22441b'),fcore:'#f6ffc0',fcol:'#d6f55a',fglow:'214,255,90',fdim:'#7f9a3e',
  crest:T3('#86a650','#3f6227','#192e15'),crestL:'#d8e890',gland:T3('#7aa84c','#3d6a28','#1b3517'),pore:'#1a3216',gOn:0,gcore:'#ffb04a',gedge:'#c25a14',gglow:'255,140,50',
  belly:T3('#fff3c4','#ecd38c','#a8873e'),fold:'#c4a356',blight:'220,255,120',
  sac:T3('#fff8dc','#f1dc98','#b89a50'),sacLit:'#fffbe0',sacGlow:'235,255,150',sacRim:'#5a7a1c',
  eye:T3('#ffe9a0','#ffb02e','#b8680c'),eyeGlow:'255,190,70',blush:0,
  mouth:'#4a1a2c',mouthD:'#2a0c18',tongue:T3('#ffa3b8','#e8607e','#a02c4c'),tipBall:'#ffc4d2',tipGlow:'255,170,195',
  tusk:T3('#fffaf0','#efe2c0','#b8a882'),gold:T3('#fff0a0','#f2b62e','#94580c'),mud:'#5a4a2a',gem:T3('#f6ffc0','#b8f040','#4e8a14'),gemGlow:'200,255,90',
  cape:T3('#b46c3c','#7a4020','#3e1e0c'),down:T3('#fff6e2','#ece0c4','#a89a80'),ermine:'#5a3a20',
  spike:T3('#b88048','#7a4a24','#3a2210'),stem:T3('#9cb85a','#5e7e30','#2c4218'),fluff:'#fff0d8',fluffGlow:'255,190,110',
  fly:'#3a3020',ftail:'#f6ffc0',flyGlow:'214,255,90',web:'#3a6a28',splash:'90,74,48',
  light:'214,255,90',lcore:'#f6ffc0'};
// second phase: colder, deeper skin (the orange stands out and the body never melts into the olive floor), embers inside
const K2=Object.assign({},K1,{skin:T3('#7cbc70','#397444','#143422'),spot:'#1c4228',rimc:'255,192,112',
  wart:T3('#96c080','#48804c','#1c4428'),fcore:'#fff2c0',fcol:'#ffaa3a',fglow:'255,150,50',fdim:'#a8642a',
  crest:T3('#6a9a62','#2f5a36','#142a1a'),crestL:'#c8e0b0',gland:T3('#7cb070','#3a7046','#1a3a24'),gOn:1,
  belly:T3('#ffe2b0','#f4b468','#a8602a'),fold:'#c8844a',blight:'255,170,70',sacLit:'#fff0d8',sacGlow:'255,170,80',sacRim:'#9a3a12',
  eye:T3('#ffc8a0','#ff5a26','#a01e08'),eyeGlow:'255,90,40',blush:1,
  tongue:T3('#ffa0bc','#ff6f9a','#b02c58'),tipGlow:'255,170,80',gem:T3('#fff0c8','#ffb040','#a8501a'),gemGlow:'255,140,40',
  cape:T3('#a05a36','#66361b','#34190c'),down:T3('#ffe8cc','#ecd2b2','#a89074'),
  ftail:'#ffd08a',flyGlow:'255,150,50',light:'255,150,50',lcore:'#fff2c0'});
// a palette between the two phases (k2) and toward a pale, stretched skin (the defeat): mixes are cached
const PALC={},PALE=T3('#d8f0a8','#a6d070','#5e8a3c');
function pal(k2,pl){k2=Math.round(cl(k2,0,1)*24)/24;pl=Math.round(cl(pl||0,0,1)*16)/16;const id=k2+'|'+pl;if(PALC[id])return PALC[id];const K={};
  for(const k in K1){const a=K1[k],b=K2[k];K[k]=typeof a==='number'?lerp(a,b,k2):typeof a==='string'?(a[0]==='#'?cmix(a,b,k2):mixRgb(a,b,k2)):mixT(a,b,k2)}
  if(pl>0){K.skin=mixT(K.skin,PALE,pl);K.wart=mixT(K.wart,PALE,pl*.8);K.spot=cmix(K.spot,PALE.b,pl*.6)}
  return PALC[id]=K}

// ------------------------------------------------------------------ the toad at rest (x forward, y to its right, z up; 0,0,0 the floor point)
const BT=.12,FB={u:[Math.cos(BT),0,Math.sin(BT)],v:[0,1,0],w:[-Math.sin(BT),0,Math.cos(BT)]};
const BC=[-4,0,42],BR=[42,46,33];               // the body: back and head in one volume, the chin up
const YC=[18,0,27],YR=[31,37,27];               // the belly, its own volume (it shakes later than the body)
const TC=[-16,44,19],TR=[26,16,18];             // the thighs (y × side)
const HIP=[-12,40,20],LTH=21,LSH=15;            // the legs: hip, thigh bone, shin (the knee folds forward, the foot comes back under it)
const SHO=[24,33,34],LUA=22,LFA=18;             // the arms: shoulder, upper arm, forearm
const EC=[16,22,73],ER=12,EDIR=[1,.4,.35];       // the eye domes and where the eyes look (a little sideways: half the iris shows in profile)
const KC=[8,-1,76.5],KRAD=10,KHT=13,KTILT=.25;    // the crown (base centre, radius, height, crooked toward its left)
const GC=[-4,30,64],GR=[15,8,5.5];              // the glands behind the eyes (low and long: never a second eye)
const SAC0=[27,0,46],SAC1=[52,0,37];            // the throat sac at rest (inside the throat: it only shows when it swells) and swollen
const inEll=(q,C0,R,Fr)=>{const d=sub(q,C0),a=dot(d,Fr.u)/R[0],b=dot(d,Fr.v)/R[1],c=dot(d,Fr.w)/R[2];return a*a+b*b+c*c<1};
const inBody=q=>inEll(q,BC,BR,FB),inBelly=q=>inEll(q,YC,YR,AXES);
// the unit direction of a body point on an ellipsoid (for marks given as points)
const dirOn=(q,C0,R,Fr)=>{const d=sub(q,C0);return nrm([dot(d,Fr.u)/R[0],dot(d,Fr.v)/R[1],dot(d,Fr.w)/R[2]])};
// the caps: the belly and the thighs out of the body, the glands out of the body; the throat's cream, the cape (both fixed shapes)
const TABY=capTab(YC,YR,AXES,[.8,0,-.6],inBody,24,[0,0,1]);
const TABT={1:capTab(TC,TR,AXES,[-.15,.9,-.42],q=>inBody(q)||inBelly(q),24,[1,0,0]),'-1':capTab(mir(TC),TR,AXES,[-.15,-.9,-.42],q=>inBody(q)||inBelly(q),24,[1,0,0])};
const TABG={1:capTab(GC,GR,AXES,[.1,.75,.65],inBody,18,[1,0,0]),'-1':capTab(mir(GC),GR,AXES,[.1,-.75,.65],inBody,18,[1,0,0])};
const TABTH=capFix(dir(0,-.2),.36,.78,[0,0,1],20);                    // the cream of the throat, under the mouth
// the cape on the body grown 5%: its edge through key points (the collar across the nape, where the cattails stand; down the sides behind
// the glands and the flanks behind the arms; the hem across the back at the height of 40-44), smooth between them, the hem waving
// (72 points round the edge, so the trim's puffs touch; the hem waves a little, unevenly: it stays up over the six warts of the low back)
const CAPEN=nrm([-.85,0,.5]),TABC=capKeys(CAPEN,[1,0,0],[[-29,0,66],[-27,22,62],[-20,36,54],[-10,45,45],[-3,46,40],[-22,44,38],[-38,28,40],[-47,0,42]],72,t=>Math.max(0,-Math.cos(t))*(.03*Math.cos(t*9)+.012*Math.sin(t*2.6+.8)));
// where the trim runs: across the collar (between its two ends) and along the hem round the back, ending before the thighs (their
// firefly warts stay free); the front edges down the sides have none (seen from behind they would ring the cape like a plate)
const tOn=(tab,q)=>{const m=dirOn(q,BC,BR,FB);let t=Math.atan2(dot(m,tab.v),dot(m,tab.u));return t<0?t+TAU:t};
const TRC=tOn(TABC,[-27,22,62]),TRH=tOn(TABC,[-22,44,38]);
const trimW=t=>{const tc=Math.min(t,TAU-t),th=Math.abs(t-Math.PI);return Math.max(sstep(TRC+.02,TRC-.2,tc),sstep(Math.PI-TRH+.02,Math.PI-TRH-.22,th))};
const CAPEK=1.05;
// marks on the body (unit directions on its ellipsoid): the six firefly warts of the low back, the dull warts, the dark spots
const FWB=[[-44,13,40],[-42,13,30],[-34,13,21]].flatMap(q=>[q,mir(q)]).map(q=>dirOn(q,BC,BR,FB)),FWBR=[5,4.6,4];
const FWT=dirOn([-16,50,34],TC,TR,AXES);            // the firefly wart on top of each thigh (right; mirrored)
const DWB=[[2.1,.15,3.2],[-2.1,.12,3.4],[2.5,.42,2.8],[-2.45,.4,3],[1.75,-.15,2.6],[-1.8,-.1,2.7],[2.75,.7,2.5],[-2.7,.72,2.6]].map(([t,e,r])=>({m:dir(t,e),r}));
const DWT=[[[-.3,.75,.4],3.4],[[-.7,.55,.2],3],[[.2,.85,-.1],2.8],[[-.55,.75,-.3],2.6]].map(([m,r])=>({m:nrm(m),r}));
const SPB=[[2.6,.55,5.5],[-2.6,.5,5],[3.05,.8,4.6],[2.3,1.0,3.8],[-2.25,1.05,4],[2.95,.25,4.4],[-3.0,.3,4.6]].map(([t,e,r])=>({m:dir(t,e),r}));
const SPT=[[[-.6,.6,.45],5],[[-.2,.9,.2],4.2]].map(([m,r])=>({m:nrm(m),r}));
// the seven cattails: base (on the cape, at the nape), tip at rest
const CTB=[-24,-16,-8,0,8,16,24].map(y=>[-28,y,66]),CTT=[[-49,-46,97],[-44,-31,104],[-39,-15,110],[-36,0,115],[-39,15,110],[-44,31,104],[-49,46,97]];
// the points of the light that runs inside: paths over the body and the belly, rays from O3
const O3=[6,0,36],SURF=[[BC,BR,FB],[YC,YR,AXES]];
function tsurf(r){let best=-1e9,bi=0;for(let i=0;i<SURF.length;i++){const[C0,R,Fr]=SURF[i],dd=sub(O3,C0),o=[dot(dd,Fr.u)/R[0],dot(dd,Fr.v)/R[1],dot(dd,Fr.w)/R[2]],d=[dot(r,Fr.u)/R[0],dot(r,Fr.v)/R[1],dot(r,Fr.w)/R[2]];
    const a=dot(d,d),b=2*dot(o,d),c=dot(o,o)-1,Dd=b*b-4*a*c;if(Dd<0)continue;const t=(-b+Math.sqrt(Dd))/(2*a);if(t>best){best=t;bi=i}}
  const p=add(O3,mul(r,Math.max(0,best))),[C0,R,Fr]=SURF[bi],dd=sub(p,C0);return{p,n:nrm(add(add(mul(Fr.u,dot(dd,Fr.u)/(R[0]*R[0])),mul(Fr.v,dot(dd,Fr.v)/(R[1]*R[1]))),mul(Fr.w,dot(dd,Fr.w)/(R[2]*R[2]))))}}
function mkPath(pts,n){const rays=[];for(let k=0;k<pts.length-1;k++)for(let j=0;j<n;j++)rays.push(nrm(sub(lerp3(pts[k],pts[k+1],j/n),O3)));rays.push(nrm(sub(pts[pts.length-1],O3)));
  const S=rays.map(tsurf);let Lt=0;const f=[0];for(let k=1;k<S.length;k++){Lt+=len(sub(S[k].p,S[k-1].p));f.push(Lt)}return{S,f:f.map(v=>v/(Lt||1))}}
const PATHS={mouth:mkPath([[44,0,22],[46,0,34],[40,0,46],[36,0,54]],4),cheekR:mkPath([[44,0,22],[42,14,38],[30,30,52]],4),cheekL:mkPath([[44,0,22],[42,-14,38],[30,-30,52]],4),
  thighR:mkPath([[44,0,22],[30,24,12],[6,40,14]],4),thighL:mkPath([[44,0,22],[30,-24,12],[6,-40,14]],4),sac:mkPath([[44,0,22],[46,0,32],[44,0,40]],3)};

// ------------------------------------------------------------------ the moves (every one depends only on p; idle and walk close on themselves)
const MV=['idle','walk','hit','tongue','stuck','sweep','flop','bubbles','drum','rain','rage','taunt','enter','die'];
const DUR={idle:3.2,walk:1,hit:.6,tongue:1.6,stuck:1.1,sweep:1.6,flop:2,bubbles:1.8,drum:2.6,rain:2.4,rage:3,taunt:1.2,enter:3.4,die:4};
// the hands and the feet at rest (on the floor), the way the fingers point and the back of the hand
const H0=sd=>[42,sd*30,2],F0=sd=>[2,sd*56,1],HU0=sd=>nrm([1,sd*.35,0]),HW0=[0,0,1];
// a hand flat on the belly (drumming the fingers, slapping it), raised in front of it, wiping the mouth, pointing
const HB=sd=>[50,sd*19,27],HBU=sd=>nrm([.08,-sd*.28,1]),HBW=sd=>nrm([1,sd*.3,.06]),HPU=sd=>nrm([.15,-sd,.35]);   // HPU: a hand resting across the belly
const kv=(K,p)=>v3k(K,p);
// a short wobble after the moment c that dies away (hz over the move's duration dur)
const wob=(p,c,hz,dur,dec)=>p<c?0:Math.exp(-(p-c)*dur*(dec||6))*Math.sin((p-c)*TAU*hz*dur);
// the cattails' moments: up one after the other (the entrance), off like corks (the defeat)
const TUPT=[.55,.57,.59,.61,.63,.65,.67],TPOPT=[.20,.25,.30,.34,.38,.41,.44],TPOPI=[3,2,4,1,5,0,6];
function tPose(anim,p,o){const ph=p*TAU,P2=(!!o.p2||anim==='rain'||anim==='sweep')&&anim!=='rage'&&anim!=='enter',dur=DUR[anim]||1,
  A={B:[0,0,0],lean:0,roll:0,yaw:0,s:0,sx:0,lift:0,z0:0,size:P2?1.12:1,k2:P2?1:0,kr:null,pale:0,
    by:0,bs:0,bx:0,bz:0,bt:p,
    sacR:7,sacK:0,sacLit:0,sacFly:0,
    open:0,grin:0,pout:P2?1:0,lick:-1,mlit:0,cheek:[0,0],puff:0,ulit:0,
    lid:P2?-1:0,lidL:null,lidR:null,pup:P2?.35:0,look:[0,0],eyeK:1,shut:0,shutL:0,shutR:0,happy:0,crest:P2?1:0,crestUp:0,
    cz:0,ctilt:P2?.1:0,crownAt:null,crownG:0,
    sway:[0,0],tUp:null,tPop:null,fluff:P2?1:0,burst:-1,
    capeOpen:0,capeOff:-1,heap:0,
    hL:H0(-1),hR:H0(1),hlkL:0,hlkR:0,huL:HU0(-1),huR:HU0(1),hwL:HW0,hwR:HW0,curlL:[0,0,0,0],curlR:[0,0,0,0],lfL:[0,0,0,0],lfR:[0,0,0,0],ptL:0,ptR:0,
    fL:F0(-1),fR:F0(1),flk:0,
    glands:P2?1:0,belly:1,bflash:0,wave:-1,thLit:0,pearl:null,gemF:0,
    flies:P2?5:3,frev:P2?2:1,stars:0,vis:1,shadowK:1,dive:0,tongue:null,fx:[]};
  const fx=(k,t,o2)=>{if(t>=0&&t<1)A.fx.push(Object.assign({k,t},o2||{}))};
  const wide=k=>{A.lid=lerp(A.lid,-1,k);A.pup=Math.max(A.pup,.9*k);A.crest=Math.max(A.crest,k)};
  const hand=(sd,pos,lk,u,w)=>{if(sd<0){A.hL=pos;A.hlkL=lk;if(u)A.huL=u;if(w)A.hwL=w}else{A.hR=pos;A.hlkR=lk;if(u)A.huR=u;if(w)A.hwR=w}};
  const hmix=(sd,k,pos,u,w)=>{if(k<=0)return;const p0=sd<0?A.hL:A.hR,u0=sd<0?A.huL:A.huR,w0=sd<0?A.hwL:A.hwR,l0=sd<0?A.hlkL:A.hlkR;hand(sd,lerp3(p0,pos,k),lerp(l0,1,k),nrm(lerp3(u0,u,k)),nrm(lerp3(w0,w,k)))};
  if(anim==='walk'){
    if(!P2){// FASE 1: it crawls on all fours like a sumo wrestler: the left hand (.00), the right foot (.25), the right hand (.50), the left foot (.75)
      // (o.wk from the game, 0..1: how far into its stride it is; the first step grows out of the pose at rest every move ends on)
      const wk=o.wk==null?1:cl(o.wk,0,1),st=stepper(p,.75),hl=st(0,12,8),hr=st(.5,12,8),fr=st(.75,11,2),fl=st(.25,11,2);
      A.hL=[42+hl.x*wk,-30-2*hl.z/8*wk,2+hl.z*wk];A.hR=[42+hr.x*wk,30+2*hr.z/8*wk,2+hr.z*wk];A.fL=[2+fl.x*wk,-56,1+fl.z*wk];A.fR=[2+fr.x*wk,56,1+fr.z*wk];
      A.lean=wk*(.08+.025*Math.cos(ph*2));A.roll=-.075*Math.cos(ph)*wk;A.yaw=.05*Math.sin(ph)*wk;A.B[2]=-1.6*(.5+.5*Math.cos(ph*4))*wk;A.B[1]=-2*Math.cos(ph)*wk;
      A.by=-6*Math.cos(TAU*(p-.06))*wk;for(const c of[0,.25,.5,.75])A.bs+=(.03*wob(p,c,5,dur,7)+.03*wob(p+1,c,5,dur,7))*wk;
      A.sway=[2.2*Math.sin(ph*2-1)*wk,1.8*Math.sin(ph-1.4)*wk];A.cz=.8*Math.abs(Math.sin(ph*2-.5))*wk;A.ctilt+=.03*Math.sin(ph-1)*wk;A.sacR=7+1.4*(.5+.5*Math.cos(ph*2))*wk;
      if(wk>.5)for(const[c,sd] of[[0,-1],[.5,1]])fx('splash',cyc(p,c)/.2,{at:[54,sd*31,0],n:5,r:7})}
    else{// FASE 2: a heavy hop each cycle: the thighs push (.00-.10), a low flight with the belly hanging and the hands forward (.10-.45),
      // it lands on its belly (.47) squashed by 15% with a splash, a ripple runs up to the crown (.50-.80), it gathers itself again
      const K=[[0,[-.1,.1,0]],[.1,[-.13,.14,0]],[.18,[.1,-.06,-.04]],[.38,[.06,.1,0]],[.47,[-.15,.04,.12]],[.56,[.05,0,-.03]],[.66,[-.04,0,.02]],[.8,[0,0,0]],[.92,[-.07,.07,0]],[1,[-.1,.1,0]]];
      const v=kv(K,p);A.s+=v[0];A.lean=v[1];A.sx=v[2];const air=p>.1&&p<.47?Math.sin((p-.1)/.37*Math.PI):0;A.lift=16*air;A.bz=-3*air;A.bs=.05*air+.06*wob(p,.47,4,dur,4);
      for(const sd of[-1,1]){hand(sd,[42+12*air,sd*30,2+5*air],0);if(sd<0)A.fL=[2-14*air,-56,1+5*air];else A.fR=[2-14*air,56,1+5*air]}
      A.cz=5*wob(p,.6,3,dur,4)+2*air;A.sway=[-3*air+3*wob(p,.5,2.5,dur,3),1.2*Math.sin(ph*2)];
      fx('splash',(p-.47)/.3,{at:[30,0,0],n:9,r:22,big:1})}}
  else if(anim==='hit'){// COLPITO: knocked back, the belly bounces, the lids screwed shut, the crown jumps and lands more crooked, the sac
    // goes flat at once, stars over the head
    const k=hitK(p);A.lean+=-.24*k;A.B[0]=-3*k;A.bs=.07*wob(p,.04,4,dur,5);A.shut=1-sstep(.5,.62,p);A.cz+=6*Math.sin(Math.PI*cl(p/.4,0,1));A.ctilt+=.14*rise(p,.15,.35,.72,.95);
    A.sacR=7-3*rise(p,.02,.06,.5,.8);A.stars=p<.75?1-p/.75:0}
  else if(anim==='tongue'){// LINGUATA: it turns to you, the lids snap wide (.10), the light climbs from the belly up the throat to the corners
    // of the mouth (.05-.40) as it rears back; a tremble; the mouth snaps open and the tongue shoots out (.55, all out at .60), taut, then
    // reeled in (.66-.90); it swallows, licks its lips, the lids drop back
    const K=[[0,[0,0,0]],[.1,[.04,0,0]],[.4,[-.15,-.02,-.02]],[.52,[-.15,-.02,-.02]],[.55,[.1,.02,.04]],[.62,[.08,.01,.03]],[.66,[.06,0,0]],[.9,[0,0,0]],[1,[0,0,0]]];
    const v=kv(K,p);A.lean+=v[0];A.s+=v[1];A.sx+=v[2];if(p>.4&&p<.52)A.B[1]=.6*trem(p,.4,.52,6,dur);
    wide(sstep(.085,.11,p)*(1-sstep(.9,.98,p)));A.grin=.7*rise(p,.1,.2,.52,.55);
    // (the belly goes dim as its light leaves it: the pearl reads as the light on its way)
    A.pearl={path:'mouth',f:sstep(.05,.36,p),a:1-sstep(.5,.56,p)};A.mlit=sstep(.32,.4,p)*(1-sstep(.55,.6,p));A.ulit=.8*rise(p,.1,.35,.55,.62);A.belly=1-.45*rise(p,.08,.22,.55,.7);
    A.sacR=7+4*rise(p,.1,.4,.52,.56)+4*pls(p,.93,.07);A.open=sstep(.545,.56,p)*(1-sstep(.88,.93,p));
    const tl=p<.55?0:p<.6?ez((p-.55)/.05):p<.66?1:p<.9?1-ez((p-.66)/.24):0;if(tl>0)A.tongue={l:tl,wob:p>.6&&p<.66?Math.sin((p-.6)*TAU*8*dur)*sstep(.6,.61,p)*(1-sstep(.64,.66,p)):0,mode:'out'};
    A.lick=p>.93?(p-.93)/.07:-1}
  else if(anim==='stuck'){// LINGUA INCOLLATA: the tongue stuck to where it hit, the light gone from the throat, the belly dull: helpless. The
    // eyes goggle, the crests up; two yanks (.15, .45); it tears free (.70), the tongue snaps back like an elastic and it reels back;
    // it shakes its head twice, licks its lips
    // (the surprise comes in over the first .07: the tongue had the cruel aim face a moment before)
    const yank=Math.max(pls(p,.15,.09),pls(p,.45,.09)),ein=sstep(0,.07,p);A.B[0]=4*yank;A.lean+=.06+.08*yank-.06*sstep(.68,.72,p);A.bs=.06*(wob(p,.16,5,dur,6)+wob(p,.46,5,dur,6));
    if(p>=.7)A.lean-=.2*Math.sin(Math.PI*cl((p-.7)/.18,0,1));A.belly=lerp(1,.25,sstep(0,.1,p))+.75*sstep(.75,1,p);
    A.lid=lerp(-1,.7,yank)*(1-sstep(.85,1,p));A.eyeK=1+.12*ein*(1-sstep(.72,.8,p))-.04*yank;A.pup=lerp(.9,.55,ein)*(1-sstep(.75,.9,p));A.crestUp=ein*(1-sstep(.72,.9,p));A.crest=1-ein+(P2?sstep(.75,.95,p):0);
    A.open=1-sstep(.7,.76,p);const tl=p<.7?1:1-ez(cl((p-.7)/.07,0,1));if(tl>0)A.tongue={l:tl,wob:.9*(Math.sin((p-.15)*TAU*7*dur)*pls(p,.17,.12)+Math.sin((p-.45)*TAU*7*dur)*pls(p,.47,.12)),mode:'stuck',snap:p>=.7};
    const sh=rise(p,.77,.8,.95,.99);A.yaw+=.14*Math.sin(TAU*2*(p-.77)/.2)*sh;A.lick=p>.9?(p-.9)/.1:-1}
  else if(anim==='sweep'){// FRUSTATA (second phase): it turns its front toward the side o.side, the tongue hangs out of that corner of the
    // mouth (.20-.48), the light climbs into that cheek; a tremble; the tongue sweeps 110° in front of it (.52-.70) and the body turns with
    // it, the belly swinging the other way late; reeled in (.70-.85), it smacks its lips and turns back
    const sd=o.side<0?-1:1,y0=.5*sd*sstep(0,.45,p),sw=sstep(.52,.7,p);let yw=p<.52?y0:lerp(.5*sd,-.5*sd,ez(sw));if(p>.7)yw=-.5*sd*(1-sstep(.72,1,p));A.yaw+=yw;
    A.by=6*sd*(rise(p,.05,.4,.52,.6)-2*rise(p,.56,.7,.75,.95));if(p>.45&&p<.52)A.B[1]=.6*trem(p,.45,.52,6,dur);
    wide(sstep(.07,.1,p)*(1-sstep(.88,.97,p)));A.cheek=sd<0?[sstep(.15,.45,p)*(1-sstep(.52,.6,p)),0]:[0,sstep(.15,.45,p)*(1-sstep(.52,.6,p))];
    A.pearl={path:sd<0?'cheekL':'cheekR',f:sstep(.04,.4,p),a:1-sstep(.48,.54,p)};A.grin=.5*rise(p,.1,.2,.5,.55);A.lean+=-.05*rise(p,.1,.4,.5,.55)+.06*rise(p,.52,.55,.66,.72);
    A.belly=1-.4*rise(p,.06,.2,.5,.66);
    A.open=sstep(.18,.24,p)*(1-sstep(.84,.88,p))*.75+.25*pls(p,.9,.04)+.2*pls(p,.96,.04);
    const hg=p<.2?0:p<.47?sstep(.2,.3,p):1-sstep(.47,.53,p),tl=p<.48?0:p<.53?sstep(.48,.53,p):p<.7?1:p<.85?1-ez((p-.7)/.15):0;
    if(hg>0||tl>0)A.tongue={l:tl,h:hg,mode:'sweep',side:sd,ang:p<.52?55*sd:lerp(55*sd,-55*sd,ez(sw)),wob:p<.47?Math.sin(p*TAU*3*dur)*.6*sstep(.25,.3,p):0}}
  else if(anim==='flop'){// PANCIATA: it crouches, the belly pressed flat (.00-.30), the light runs down into the thighs and up over all the
    // warts (the belly goes dark); a shove (.30); up spread-eagled, leaning back with the belly showing, the cape flying open; it turns
    // over and falls on its belly (SPLAT .75: flat and wide, a flash inside, splashes); a ripple up to the crown; it pushes itself up
    // (the dive is held until it touches the floor: stretched, belly first; it squashes flat in one frame at the contact and stays there a
    // moment. The second and third of the Triple start from that pose: the game passes them on just after the splat)
    const ch=!!o.chain,S0=ch?[-.35,.3,.18,-.35]:[0,0,0,0];
    const K=[[0,S0],[.12,[-.1,.05,.06,-.1]],[.28,[-.18,.1,.1,-.2]],[.30,[-.2,.1,.1,-.2]],[.335,[.14,-.08,-.12,.08]],[.42,[.06,-.02,-.35,.04]],[.5,[.04,0,-.35,.04]],[.6,[0,0,.3,0]],[.7,[0,0,.9,0]],
      [.745,[.05,-.04,.95,.05]],[.752,[-.35,.3,.18,-.35]],[.78,[-.33,.28,.17,-.3]],[.815,[-.1,.12,.12,.12]],[.865,[-.16,.15,.1,-.06]],[.9,[-.13,.12,.08,0]],[1,[0,0,0,0]]];
    const v=kv(K,p);A.s=v[0];A.sx=v[1];A.lean=v[2];A.bs=v[3];A.z0=34;
    if(p>.22&&p<.3)A.B[1]=.6*trem(p,.22,.3,7,dur);
    const air=p>.3&&p<.75?Math.sin(Math.PI*(p-.3)/.45):0;A.lift=150*air;A.B[2]=-3*rise(p,.05,.25,.3,.32)-2*rise(p,.75,.78,.86,.95);
    // the limbs: planted while crouching and after the splat, spread in the air (in the body's axes)
    const fl=rise(p,.3,.345,.71,.75);A.hlkL=A.hlkR=A.flk=fl;
    // (the second and third of the Triple start from the splat, the hands and the feet still spread)
    const HA=sd=>v3k([[0,ch?[50,sd*46,2]:[42,sd*30,2]],[ch?.12:.2,[45,sd*36,2]],[.3,[45,sd*36,2]],[.36,[30,sd*58,34]],[.5,[16,sd*68,46]],[.62,[40,sd*64,32]],[.72,[52,sd*50,16]],[.75,[50,sd*46,2]]],p);
    const FA=sd=>v3k([[0,ch?[-2,sd*64,1]:[2,sd*56,1]],[ch?.12:.2,[0,sd*60,1]],[.3,[0,sd*60,1]],[.36,[-12,sd*70,8]],[.5,[-24,sd*80,18]],[.62,[-32,sd*72,18]],[.72,[-14,sd*62,6]],[.75,[-2,sd*64,1]]],p);
    if(p<.78)for(const sd of[-1,1]){const h=HA(sd),f=FA(sd);if(sd<0){A.hL=h;A.fL=f}else{A.hR=h;A.fR=f}A[sd<0?'huL':'huR']=nrm(lerp3(HU0(sd),[.5,sd*.8,-.1],fl))}
    else if(p>=.75&&p<.95){const k=sstep(.88,.95,p);A.hL=lerp3([50,-46,2],H0(-1),k);A.hR=lerp3([50,46,2],H0(1),k);A.fL=lerp3([-2,-64,1],F0(-1),k);A.fR=lerp3([-2,64,1],F0(1),k)}
    A.capeOpen=rise(p,.33,.42,.62,.72);A.sway=[-8*air*Math.cos(Math.PI*(p-.3)/.45)+5*wob(p,.75,3,dur,4),4*air*Math.sin(p*TAU*2*dur)];
    wide(sstep(.04,.07,p)*(1-sstep(.9,.98,p)));A.crest=Math.max(A.crest,.8*rise(p,.05,.1,.75,.85));
    A.pearl={path:'thigh',f:sstep(.05,.16,p),a:1-sstep(.15,.18,p)};A.thLit=rise(p,.12,.16,.3,.4);A.wave=p>.14&&p<.32?(p-.14)/.18:-1;A.belly=1-.75*rise(p,.05,.15,.7,.75)+1.2*flash(p,.75,.1);
    A.bflash=flash(p,.75,.08);A.cz=6*Math.sin(Math.PI*cl((p-.8)/.1,0,1))+2*air;A.ctilt+=.06*air;A.open=.3*rise(p,.33,.38,.5,.6);A.grin=.4*rise(p,.05,.1,.3,.33);
    A.shut=rise(p,.745,.755,.79,.82)*.8;
    fx('splash',(p-.75)/.25,{at:[34,0,0],n:12,r:34,big:1});fx('ring',(p-.75)/.25,{r:40,rgb:'190,235,170'});fx('drips',(p-.33)/.3);
    // the chained ones carry on what the splat before them left: the eyes screwed shut, the flash dying in the belly, the splash, the ring
    if(ch){const q=p+.005;A.shut=Math.max(A.shut,.8*(1-sstep(.035,.07,p)));A.bflash=Math.max(A.bflash,flash(q,0,.08));A.belly+=1.2*flash(q,0,.1);
      fx('splash',q/.25,{at:[34,0,0],n:12,r:34,big:1});fx('ring',q/.25,{r:40,rgb:'190,235,170'})}}
  else if(anim==='bubbles'){// RUTTO DI BOLLE: the sac swells into a lantern with four fireflies going round inside (.00-.55), the cheeks puff,
    // the eyes wide then bulging; a comic tremble; the BURP (.60): the mouth wide open, the head snaps forward, the sac empties at once and
    // a stream of bubbles; the mouth stays open, blowing; it wipes its mouth with the back of the right hand
    const sw=sstep(0,.55,p),em=sstep(.6,.66,p);A.sacK=sw*(1-em);A.sacR=7+17*sw*(1-em);A.sacLit=sstep(.05,.3,p)*(1-em);A.sacFly=A.sacLit;A.puff=rise(p,.1,.4,.58,.62);
    wide(sstep(.04,.07,p)*(1-sstep(.84,.95,p)));A.eyeK=1+.1*rise(p,.35,.45,.62,.7);A.pearl={path:'sac',f:sstep(.03,.2,p),a:1-sstep(.2,.26,p)};
    if(p>.45&&p<.55){A.B[1]=.7*trem(p,.45,.55,6,dur);A.roll=.03*trem(p,.45,.55,6,dur)}
    const K=[[0,[0,0]],[.5,[-.1,.02]],[.59,[-.12,.02]],[.62,[.16,-.03]],[.68,[.1,0]],[.8,[.05,0]],[1,[0,0]]],v=kv(K,p);A.lean+=v[0];A.s+=v[1];
    A.open=sstep(.595,.61,p)*(1-.3*sstep(.66,.7,p))*(1-sstep(.8,.86,p));A.ulit=.5*A.sacLit;
    // the wipe with the back of the right hand
    {const w=rise(p,.8,.86,.95,1);if(w>0){const k=sstep(.86,.94,p);hmix(1,w,lerp3([45,16,50],[45,-8,53],k),nrm([-.2,-1,.3]),nrm([1,0,.15]));A.curlR=[.6,.6,.6,.6].map(c=>c*w)}}
    fx('bubbles',(p-.6)/.22)}
  else if(anim==='drum'){// TAMBURO DI PANCIA: it raises both hands in front of its belly and leans back, the light gathers in the belly; it
    // beats it (.32 left, .52 right, .74 both; four in the second phase): the belly gives under the hand, flashes, ripples three times;
    // after the last it hums like a gong; then it lowers the left hand and points the right forefinger at a puddle (o.point)
    const hits=P2?[[.32,-1],[.46,1],[.60,-1],[.76,0]]:[[.32,-1],[.52,1],[.74,0]],last=hits[hits.length-1][0],up=sstep(0,.2,p)*(1-sstep(.86,.95,p));
    A.lean+=-.12*sstep(0,.2,p)*(1-sstep(.86,1,p));A.belly=1+.8*rise(p,0,.2,.86,.95);wide(sstep(.02,.05,p)*(1-sstep(.9,.99,p)));A.grin=.4*up;
    A.pearl={path:'sac',f:0,a:0};A.ulit=.6*up;
    for(const sd of[-1,1]){let pos=[52,sd*24,44];for(const[c,h] of hits){if(h!==0&&h!==sd)continue;const d=p-c,w=h===0?1.3:1;
        if(d>-.07&&d<.06){const pre=d<0?sstep(-.07,-.03,d)*(1-sstep(-.02,0,d)):0,on=d<0?sstep(-.02,0,d):1-sstep(.02,.06,d);pos=lerp3(lerp3(pos,[48,sd*26,52],pre*w),HB(sd),on)}}
      hand(sd,lerp3(H0(sd),pos,up),up,nrm(lerp3(HU0(sd),HBU(sd),up)),nrm(lerp3(HW0,HBW(sd),up)))}
    for(const[c,h] of hits){const k=h===0?1.4:1;A.bflash=Math.max(A.bflash,flash(p,c,.06)*k*.8);A.bs+=-.16*k*pls(p,c+.01,.04)+.06*k*wob(p,c+.02,4,dur,5);A.bx+=-3*k*pls(p,c+.01,.04);A.by+=h*-5*pls(p,c+.01,.05);A.B[2]-=1.5*k*pls(p,c+.01,.04);
      A.cz+=4*k*Math.sin(Math.PI*cl((p-c)/.08,0,1));if(h===0)A.lean+=-.1*rise(p,c,c+.02,c+.06,c+.12);fx('splash',(p-c)/.16,{at:[20,-50,0],n:4,r:6});fx('splash',(p-c)/.16,{at:[20,50,0],n:4,r:6});fx('ring',(p-c)/.18,{r:30,rgb:'210,240,130',lo:1})}
    if(p>last)A.bs+=.03*Math.sin((p-last)*TAU*9*dur*.25)*(1-sstep(last,.88,p));
    // pointing at the puddle, with the hand on its side; a puddle behind it: the eyes go first, the body turns half way, the arm goes up and
    // out over the shoulder (never inside the body). The gem of the crown flashes twice, slowly
    {const pk=rise(p,.86,.91,.97,1),a0=o.point!=null?o.point:.55,a=Math.atan2(Math.sin(a0),Math.cos(a0)),sg=a<0?-1:1;
      if(pk>0){const tn=sg*.55*sstep(.8,1.9,Math.abs(a))*pk,aa=cl(a-tn,-2.1,2.1),up=sstep(1.1,2,Math.abs(aa));A.yaw+=tn;A.look=[-sg*.9*pk*sstep(.3,1,Math.abs(a)),A.look[1]];
        hmix(sg,pk,[30+38*Math.cos(aa),sg*26+38*Math.sin(aa)+sg*6*up,34+18*up],nrm([Math.cos(aa),Math.sin(aa),-.05+.35*up]),[0,0,1]);if(sg<0)A.ptL=pk;else A.ptR=pk}
      A.gemF=pls(p,.855,.04)+pls(p,.98,.04)}}
  else if(anim==='rain'){// PIOGGIA DI LUCCIOLE (second phase): it rears back with its mouth to the sky, the belly glowing orange, the light up
    // the throat; three coughs (.35, .45, .55), each spitting a spurt of fireflies; it watches them go up grinning, then sits back
    const K=[[0,[0,0]],[.3,[-.35,.02]],[.8,[-.35,.02]],[1,[0,0]]],v=kv(K,p);A.lean+=v[0];A.s+=v[1];A.belly=1+.7*rise(p,0,.15,.6,.8);
    A.pearl={path:'mouth',f:sstep(.05,.3,p),a:1-sstep(.33,.36,p)};A.ulit=.7*rise(p,.05,.25,.6,.8);
    for(const c of[.35,.45,.55]){A.lean+=-.1*pls(p,c+.01,.05);A.sacR-=2.2*pls(p,c+.01,.05);A.open=Math.max(A.open,.9*pls(p,c+.01,.07));fx('jet',(p-c)/.14)}
    A.grin=rise(p,.55,.6,.8,.9);A.open=Math.max(A.open,.25*rise(p,.55,.6,.78,.85));A.look=[0,-.8*rise(p,.1,.3,.8,.9)]}
  else if(anim==='rage'){// FURIA: it draws its own change to the second phase. It backs off, the crown slides askew; it pounds the floor
    // (.15, .25, .35); three gulps of air (.38-.55: the game draws the fireflies of the room flying into its mouth); it swells 12% and the
    // colour changes from the belly outward (.45-.62), the glands light up; red eyes for good (.60); the huge croak (.62-.85), the cattails
    // stand stiff and their spikes burst into glowing down (.70); a sulky pant
    const kc=sstep(.45,.62,p);A.size=1+.12*kc;A.k2=kc;A.kr={belly:sstep(.45,.52,p),skin:sstep(.48,.6,p),warts:sstep(.47,.6,p),eye:sstep(.59,.61,p),cape:sstep(.5,.62,p)};A.glands=sstep(.55,.62,p);
    // (the spikes swell and give way to the down over .69-.73, each with a little flash: no shape changes in one frame)
    A.pout=sstep(.62,.8,p);A.ctilt=.1*sstep(.02,.12,p);A.fluff=sstep(.69,.73,p);A.burst=p>=.7&&p<1?(p-.7)/.3:-1;A.flies=3+2*sstep(.45,.6,p);A.frev=1;
    A.B[0]=-4*rise(p,0,.12,.8,1);A.lean=-.08*rise(p,0,.1,.14,.2);wide(sstep(.01,.04,p));A.crest=sstep(.58,.62,p);A.crestUp=.7*rise(p,.02,.06,.3,.4);
    // the pounding: left, right, both (the fingers curled into fists)
    for(const[c,h] of[[.15,-1],[.25,1],[.35,0]])for(const sd of[-1,1]){if(h!==0&&h!==sd)continue;const up=rise(p,c-.065,c-.035,c-.012,c),pos=lerp3(H0(sd),h===0?[42,sd*32,60]:[44,sd*40,54],up);
      if(Math.abs(p-c)<.07)hand(sd,pos,0,nrm(lerp3(HU0(sd),[.25,sd*.15,1],up)),nrm(lerp3(HW0,[1,sd*.25,-.2],up)));fx('mud',(p-c)/.2,{at:[44,sd*31,0]})}
    {const f=rise(p,.08,.12,.36,.4);A.curlL=A.curlR=[f,f,f,f]}
    for(const c of[.15,.25,.35]){A.cz+=3*Math.sin(Math.PI*cl((p-c)/.08,0,1));A.bs+=.05*wob(p,c,5,dur,6)}
    A.open=Math.max(.5*rise(p,.38,.41,.53,.56),0);for(const c of[.42,.47,.52])A.sacR+=4*pls(p,c,.04);
    const cr=rise(p,.62,.66,.82,.88);A.sacK=cr;A.sacR+=23*cr;A.sacLit=cr;if(p>.62&&p<.85){A.B[1]=.9*trem(p,.62,.85,6,dur);A.s+=.02*trem(p,.62,.85,6,dur)}
    A.belly=1+.6*rise(p,.45,.55,.85,.95);A.wave=p>.45&&p<.62?(p-.45)/.17:-1;A.sway=[0,0];
    // it ends as its idle of the second phase begins
    {const e=sstep(.85,1,p);A.sway=[-.94*e,-.96*e];A.cz+=-.36*e;A.look=[.12*e,0];A.bs+=-.012*e;A.pup=lerp(A.pup,.35,e)}
    fx('seeds',A.burst);fx('mud2',(p-.35)/.2,{at:[44,0,0]})}
  else if(anim==='taunt'){// PRESA IN GIRO: it leans back, pats its belly twice with the right hand, laughs «gro-gro-gro» with the sac swelling
    // at each laugh and the eyes shut with glee, then opens one eye, points the left forefinger at you and runs its tongue over its lips
    const lb=sstep(0,.12,p)*(1-sstep(.9,1,p));A.lean+=-.12*lb;
    {const k=rise(p,.03,.1,.36,.5),d=Math.max(pls(p,.15,.06),pls(p,.35,.06));hmix(1,k,add(HB(1),[6*(1-d)+3,0,2]),HPU(1),HBW(1))}
    for(const c of[.15,.35])A.bs+=.05*wob(p,c+.01,5,dur,6);
    for(const c of[.4,.55,.7]){A.sacR+=5.5*pls(p,c+.02,.1);A.cz+=2.5*pls(p,c+.02,.08);A.open=Math.max(A.open,.35*pls(p,c+.01,.08));A.B[2]+=1.2*pls(p,c+.02,.08)}
    A.sacK=.3*rise(p,.36,.42,.74,.8);A.happy=[rise(p,.37,.4,.8,.84),rise(p,.37,.4,.97,1)];
    {const k=rise(p,.8,.86,.96,1);hmix(-1,k,[58,-44,56],nrm([1,.12,.28]),nrm([0,-.35,1]));if(k>0)A.ptL=k}
    A.lick=p>.86?(p-.86)/.14:-1;A.grin=.6}
  else if(anim==='enter'){// ENTRATA: it falls out of the sky. Unseen (.00-.26), its shadow grows (.26-.45); it drops spread-eagled on its
    // belly, the belly lit (.30-.45; the crown flies off upward at .32); THUD (.45): squashed very wide; it wobbles like jelly and sits up,
    // the cattails spring up one by one (.55-.67); the crown falls back onto its head, crooked, with a glint (.62-.68); the eyes open (.66);
    // the sac swells and the royal croak (.74); it settles with its crooked smirk and drums two fingers on its belly
    A.vis=p<.3?0:1;A.shadowK=sstep(.26,.45,p);A.z0=34;
    const fall=p<.45?1-Math.pow(cl((p-.3)/.15,0,1),2):0;A.lift=360*fall;
    const K=[[0,[0,0,.55,0]],[.3,[.06,-.05,.55,.06]],[.44,[.1,-.08,.5,.06]],[.45,[-.4,.35,.2,-.35]],[.5,[-.1,.18,.12,.15]],[.55,[-.22,.2,.08,-.08]],[.6,[-.08,.08,.04,.04]],[.66,[-.03,.03,0,0]],[.72,[0,0,0,0]],[1,[0,0,0,0]]];
    const v=kv(K,p);A.s=v[0];A.sx=v[1];A.lean=v[2];A.bs=v[3];
    const fl=1-sstep(.45,.5,p);A.hlkL=A.hlkR=A.flk=fl;
    if(fl>0)for(const sd of[-1,1]){const h=lerp3(H0(sd),[30,sd*60,36],fl),f=lerp3(F0(sd),[-24,sd*70,14],fl);if(sd<0){A.hL=h;A.fL=f}else{A.hR=h;A.fR=f}}
    A.belly=1+.6*(1-sstep(.45,.6,p));A.bflash=flash(p,.45,.08);A.shut=1-sstep(.64,.67,p);A.lid=lerp(.4,0,sstep(.66,.72,p));
    A.tUp=TUPT.map(t=>{const k=cl((p-t)/.03,0,1);return k<1?k*k:1+.18*Math.sin(Math.PI*cl((p-t-.03)/.04,0,1))});
    // the crown: off at .32, back from the sky .62-.68 (a little bounce), a glint
    if(p<.68){A.crownAt=p<.32?null:p<.4?{dz:900*Math.pow((p-.32)/.08,1.4),spin:(p-.32)*30}:p<.62?{dz:1e4,spin:0}:{dz:420*Math.pow(1-(p-.62)/.06,2),spin:(.68-p)*20}}
    A.cz=3*Math.sin(Math.PI*cl((p-.68)/.05,0,1));A.ctilt=.1*Math.sin(Math.PI*cl((p-.68)/.06,0,1));A.crownG=flash(p,.68,.08);
    // the royal croak
    // (the sac swells over a fifth of a second, full when the croak starts at .74, and goes down with the voice)
    const cr=rise(p,.69,.745,.88,.93);A.sacK=cr;A.sacR=7+17*cr;A.sacLit=cr;if(p>.74&&p<.88)A.B[1]=.8*trem(p,.74,.88,6,dur);
    A.grin=.6*sstep(.88,.94,p);{const k=rise(p,.88,.92,.97,1);hmix(1,k,add(HB(1),[3,0,2]),HPU(1),HBW(1));A.lfR=[0,.8*pls(p,.935,.025),.8*pls(p,.955,.025),0]}
    A.sway=[6*wob(p,.6,2.5,dur,3),0];
    fx('splash',(p-.45)/.25,{at:[0,0,0],n:14,r:46,big:1});fx('ring',(p-.45)/.25,{r:50,rgb:'190,235,170'});fx('ring',(p-.5)/.25,{r:50,rgb:'190,235,170'});fx('ring',(p-.55)/.25,{r:50,rgb:'190,235,170'})}
  else if(anim==='die'){// SCONFITTA: it reels, the crown flies off and lands in front of its left; it swells trembling to 1.45 times, the skin
    // pale and tight, the light inside growing until it is a lantern and turning back to the green-yellow of the fireflies, the cattails
    // popping off like corks; the CLIMAX (.50): a huge burp, a fountain of fireflies; it goes down like a balloon with two swerves, the cape
    // slides off into a heap; it shrinks, whole, to an ordinary little toad that blinks, looks at the crown, hops and dives into the mud
    const inf=sstep(.1,.45,p),def1=sstep(.5,.7,p),def2=sstep(.7,.85,p),base=P2?1.12:1;
    A.size=base*(1+.45*inf)*(1-.586*def1)*(1-.733*def2);A.size*=1+.02*trem(p,.1,.45,5,dur);
    A.pale=sstep(.15,.45,p);A.k2=(P2?1:0)*(1-sstep(.1,.4,p));A.kr=null;A.glands=A.k2;A.belly=1+1.5*rise(p,.15,.45,.5,.6);A.ulit=A.belly>1.2?.6:0;
    // the face: the eyes really bulge as it swells (no lid, tiny pupils, the crests up in fright, the domes trembling), screwed shut for the
    // burp, then dazed (half shut, rolling) until the little toad blinks; the mouth an «O» to the sky, never a grin
    const bul=rise(p,.1,.22,.46,.5),daz=rise(p,.56,.6,.65,.7);
    A.eyeK=1+.4*bul+.05*bul*Math.sin(p*dur*TAU*6);A.lid=lerp(lerp(-1,.45,sstep(.56,.62,p)),0,sstep(.68,.74,p));A.pup=.95*bul;A.crestUp=rise(p,.1,.2,.46,.52);
    A.shut=rise(p,.47,.49,.55,.58);A.look=[.5*Math.cos((p-.56)*TAU*7)*daz,.35*Math.sin((p-.56)*TAU*7)*daz];A.oh=rise(p,.44,.47,.56,.62);
    A.crest=(P2?1:0)*(1-sstep(.08,.2,p));A.pout=(P2?1:0)*(1-sstep(.3,.5,p));
    A.fluff=P2?1:0;A.tPop=TPOPI.map(i=>p<TPOPT[i]?-1:(p-TPOPT[i])/.14);
    const st=1-sstep(.08,.14,p);A.lean=-.15*sstep(0,.05,p)*st+v3k([[.4,[0]],[.48,[-.55]],[.54,[-.12]],[.7,[0]]],p)[0];A.B[0]=-3*sstep(0,.05,p)*st;A.roll=.06*Math.sin(p*TAU*3*dur*.5)*st*sstep(0,.03,p);
    A.roll+=-.3*pls(p,.56,.06)+.3*pls(p,.63,.06);A.B[1]=-8*pls(p,.56,.07)+8*pls(p,.63,.07);
    A.open=rise(p,.47,.5,.56,.62);A.bflash=sstep(.493,.502,p)*(1-sstep(.502,.6,p));A.sacR=7+6*rise(p,.15,.4,.48,.5);
    // the crown: off at once, a spin in the air, down in front of its left (and it stays there, the room's: drawn apart)
    A.crownAt=p<.02?null:{die:cl((p-.02)/.2,0,1)};
    A.capeOff=p<.62?-1:(p-.62)/.08;A.heap=p<.62?0:1;
    // the little toad: blinks (.76), looks at the crown (.78-.85), hops (.85-.9) and dives into the mud (.89-.93)
    if(p>.7){A.lid=lerp(A.lid,1,pls(p,.76,.03));A.look=[-.8*rise(p,.77,.8,.86,.88),.3*rise(p,.77,.8,.86,.88)];A.yaw+=-.35*rise(p,.77,.82,.85,.88)}
    {const hp=p>.85&&p<.92?Math.sin(Math.PI*(p-.85)/.07):0;A.lift=7*hp/Math.max(.1,A.size);A.dive=sstep(.895,.935,p);A.lean+=.5*sstep(.86,.9,p)}
    A.vis=p<.94?1:0;A.flies=p<.5?(P2?5:3):0;
    fx('fountain',(p-.5)/.3);fx('ring',(p-.9)/.1,{r:10,rgb:'190,235,170',lo:1,world:1});fx('crownfly',p>.93?(p-.93)/.07:-1)}
  else{// FERMO
    if(!P2){// the throne: a slow breath (the belly follows late and ripples twice), a wave of light up the warts, it looks left and right
      // (the eyes first), a heavy blink (.62), the four fingers of the right hand drum on its belly (.70-.84), it licks its lips (.86-.96)
      const inh=p<.5?sstep(0,.5,p):1-sstep(.5,1,p),q=cyc(p,.06),inhB=q<.5?sstep(0,.5,q):1-sstep(.5,1,q);
      A.B[2]=2*inh;A.s=.014*inh;A.bs=.03*inhB+.016*Math.sin((p-.5)/.06*TAU)*rise(p,.5,.52,.6,.62);A.sacR=7+2.4*rise(p,.02,.45,.5,.95);
      A.wave=p>.1&&p<.6?(p-.1)/.5:-1;
      const lkB=-.2*rise(p,.15,.21,.3,.36)+.2*rise(p,.4,.45,.5,.55),lkE=-.2*rise(p,.12,.16,.28,.32)+.2*rise(p,.37,.41,.48,.51);A.yaw=lkB;A.look=[cl(-(lkE-lkB)*6,-1,1),0];
      A.lid=sstep(.59,.62,p)*(1-sstep(.62,.68,p));
      {const up=sstep(.63,.7,p)*(1-sstep(.84,.9,p));hmix(1,up,HB(1),HPU(1),HBW(1));for(let j=0;j<4;j++)A.lfR[j]=.15*up+.75*pls(p,.715+j*.03,.035)*up}
      A.lick=p>.86&&p<.96?(p-.86)/.1:-1;
      A.sway=[1.6*Math.sin(ph-.9),1.2*Math.sin(2*ph-1.3)];A.cz=.4*Math.sin(ph-.7);A.ctilt+=.02*Math.sin(ph-1.1)}
    else{// the second phase: short angry pants, the belly jolting, wide red eyes, the sulk with the tusks showing; five orange fireflies
      // and the glowing down go round twice
      const b=.5-.5*Math.cos(ph*4),j=Math.pow(Math.max(0,Math.sin(ph*4-.5)),3);A.B[2]=1.4*b;A.s=.02*b;A.bs=.05*j-.012;A.sacR=7+2.2*b;
      A.sway=[1.2*Math.sin(ph*2-.9),1*Math.sin(ph*4-1.3)];A.cz=.5*Math.sin(ph*4-.8);A.yaw=.04*Math.sin(ph*2);A.look=[.25*Math.sin(ph*2+.5),0];A.wave=(p*2)%1;A.bt=p*2}}
  if(LOWFX)A.sway=[0,0];   // with few effects the cattails and the cape stand still (they still spring up and pop off)
  return A}
// keyframes (of numbers or points), held at the first key before it and at the last after it
function v3k(K,p){if(p<=K[0][0]){const f=K[0][1];return Array.isArray(f)?f.slice():f}return keys(K,p)}

// ------------------------------------------------------------------ the body's frame
// squashed and stretched on its floor point (so a squashed body stays on the floor), then turned round the point [0,0,z0] (the middle of
// the body when it flies, the floor point when it sits), then moved by B. Rd turns a direction the same way
function frame2(A){const ca=Math.cos(A.lean||0),sa=Math.sin(A.lean||0),cr=Math.cos(A.roll||0),sr=Math.sin(A.roll||0),cy=Math.cos(A.yaw||0),sy=Math.sin(A.yaw||0),
  sz=1+(A.s||0),sxy=1/Math.sqrt(Math.max(.3,sz)),sx=sxy*(1+(A.sx||0)),B=A.B||[0,0,0],Z0=A.z0||0;
  const turn=(x,y,z)=>{const y1=y*cr+z*sr,z1=-y*sr+z*cr,x2=x*ca+z1*sa,z2=-x*sa+z1*ca;return[x2*cy-y1*sy,x2*sy+y1*cy,z2]};
  return{T:q=>{const x=q[0]*sx,y=q[1]*sxy,z=q[2]*sz-Z0,y1=y*cr+z*sr,z1=-y*sr+z*cr,x2=x*ca+z1*sa,z2=-x*sa+z1*ca;return[x2*cy-y1*sy+B[0],x2*sy+y1*cy+B[1],z2+Z0+B[2]]},Rd:v=>turn(v[0],v[1],v[2])}}
function invFrame2(A){const ca=Math.cos(A.lean||0),sa=Math.sin(A.lean||0),cr=Math.cos(A.roll||0),sr=Math.sin(A.roll||0),cy=Math.cos(A.yaw||0),sy=Math.sin(A.yaw||0),
  sz=1+(A.s||0),sxy=1/Math.sqrt(Math.max(.3,sz)),sx=sxy*(1+(A.sx||0)),B=A.B||[0,0,0],Z0=A.z0||0;
  return q=>{const X0=q[0]-B[0],Y0=q[1]-B[1],W0=q[2]-B[2]-Z0,x2=X0*cy+Y0*sy,y1=-X0*sy+Y0*cy,x=x2*ca-W0*sa,z1=x2*sa+W0*ca,y=y1*cr-z1*sr,z=y1*sr+z1*cr;return[x/sx,y/sxy,(z+Z0)/sz]}}
// the rotation that takes the unit vector a to b (as a function on vectors)
function rotBetween(a,b){a=nrm(a);b=nrm(b);const c=dot(a,b),ax=cross(a,b),s=len(ax);if(s<1e-5)return v=>v.slice();const k=nrm(ax),an=Math.atan2(s,c);return v=>rotAx(v,k,an)}
function rotAx(v,ax,a){const c=Math.cos(a),s=Math.sin(a);return add(add(mul(v,c),mul(cross(ax,v),s)),mul(ax,dot(ax,v)*(1-c)))}
// the palette of the change of phase: the belly first, then the skin, the warts, the eyes, the cape (rage)
function palOf(A){const K=pal(A.k2,A.pale);if(!A.kr)return K;const r=A.kr,Kb=pal(r.belly,A.pale),Kw=pal(r.warts,A.pale),Ke=pal(r.eye,A.pale),Kc=pal(r.cape,A.pale);
  return Object.assign({},pal(r.skin,A.pale),{belly:Kb.belly,fold:Kb.fold,blight:Kb.blight,sacLit:Kb.sacLit,sacGlow:Kb.sacGlow,sacRim:Kb.sacRim,light:Kb.light,lcore:Kb.lcore,
    fcore:Kw.fcore,fcol:Kw.fcol,fglow:Kw.fglow,fdim:Kw.fdim,eye:Ke.eye,eyeGlow:Ke.eyeGlow,blush:Ke.blush,cape:Kc.cape,down:Kc.down,gem:Kc.gem,gemGlow:Kc.gemGlow,gOn:A.glands})}

// ------------------------------------------------------------------ the model
function toad2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};anim=MV.includes(anim)?anim:'idle';const V0=V(face),{P,D,F}=V0,A=tPose(anim,p,o),fx=fxOn(o);
  const SS=sc*A.size,gz=o.z!=null&&(anim==='flop'||anim==='walk'),lift=gz?o.z/SS:A.lift;A.B[2]+=lift;if(A.dive>0)A.B[2]-=110*A.dive;
  const X=frame2(A),XI=invFrame2(A),K=palOf(A),fw=X.Rd([1,0,0]),fF=F(fw);
  if(A.shadowK>0&&A.dive<.9)floor(V0,x,y,SS,[A.B[0],A.B[1],0],52*(.4+.6*A.shadowK),17*(.4+.6*A.shadowK),.42*A.shadowK*(1-A.dive),Math.max(0,lift));
  // the room's own things of the defeat: the crown on the floor, the heap of velvet (drawn at the size it had before it swelled)
  const base=sc*(o.p2?1.12:1);
  if(anim==='die'){ctx.save();ctx.translate(x,y);ctx.scale(base,base);floorThings(V0,A,K,p,fx);ctx.restore()}
  if(A.vis<=0){if(fx&&anim==='enter'){}return}
  ctx.save();ctx.translate(x,y);ctx.scale(SS,SS);
  if(A.dive>0){const q=P([12,0,0]);ctx.beginPath();ctx.rect(-400,-600,800,600+q[1]);ctx.clip()}
  const L=parts(),J={};
  // the belly now (it shakes on its own), the thighs (they follow the thigh bone)
  const YCc=[YC[0]+A.bx,A.by,YC[2]+A.bz],YRc=[YR[0]*(1-.3*A.bs),YR[1]*(1-.3*A.bs),YR[2]*(1+A.bs)];
  const footAt=sd=>{const f=sd<0?A.fL:A.fR,w=[f[0],f[1],f[2]+lift];return A.flk<=0?w:A.flk>=1?X.T(f):lerp3(w,X.T(f),A.flk)};
  const legOf=sd=>{const fc=footAt(sd),hip=X.T(sdv(HIP,sd)),off=[-8,-sd,4],ank=add(fc,A.flk>0?lerp3(off,X.Rd(off),A.flk):off),[kn,an]=ik(hip,ank,LTH,LSH,X.Rd([1,sd*.55,.15]));
    const b0=nrm(sub(sdv([4,52,14],sd),sdv(HIP,sd))),bone=nrm(sub(XI(kn),sdv(HIP,sd))),Rw=rotBetween(b0,bone);return{hip,kn,an,fc,Rw}};
  const LG={'-1':legOf(-1),1:legOf(1)};
  // ---------------- the body: one mass (back, head, belly, thighs) painted inside; then the glands and the cape over it
  L.add(0,()=>massDraw(V0,X,A,K,J,LG,YCc,YRc,face));
  // ---------------- the eye domes (with the eyes, the lids, the crests), the crown
  for(const sd of[-1,1]){const c=X.T(sdv(EC,sd)),od=X.Rd(nrm(sdv([.47,.52,.72],sd))),front=F(od)>-.05;
    L.add((front?1000:-1000)+D(c),()=>domeDraw(V0,X,A,K,sd,c,front))}
  if(!A.crownAt)L.add(1000+D(X.T(add(KC,[0,0,6]))),()=>crownDraw(V0,X,A,K));
  else if(A.crownAt.die!=null&&A.crownAt.die<1){// the defeat: it flies off the head, spins and lands in front of its left (drawn at the size it had)
    const k=A.crownAt.die,kb=base/SS,h0=mul(X.T(add(KC,[0,0,6])),1/kb),T0=[26,-50,3.2],e=ez(k),cw=add(lerp3(h0,T0,e),[0,0,46*Math.sin(Math.PI*Math.min(1,k*1.15))*(1-k)+5*Math.abs(Math.sin(k*TAU*1.5))*sstep(.7,1,k)]);
    L.add(1000+D(mul(cw,kb))+30,()=>{ctx.save();ctx.scale(kb,kb);crownFree(V0,cw,k*TAU*2.2+1.1*e,lerp(KTILT,1.25,sstep(.5,.85,k)),K,A);ctx.restore()})}
  else if(A.crownAt.dz!=null&&A.crownAt.dz<600){const c=X.T(add(KC,[0,0,A.crownAt.dz]));L.add(1000+D(c),()=>{const sp0=A.crownAt.spin;crownAt(V0,q=>X.T(add(KC,add([0,0,A.crownAt.dz],rotZ(sub(q,KC),sp0)))),v=>X.Rd(rotZ(v,sp0)),KC,KTILT,K,A)})}
  // ---------------- the seven cattails (behind the head seen from the front, over the cape seen from behind)
  // (one popped off like a cork goes in front of the body or behind it from where it flies: never over the face while behind the head)
  {const dB=D(X.T(BC));for(let i=0;i<7;i++){const tp=A.tPop?A.tPop[i]:-1;if(tp>=1)continue;const nb=X.Rd(nrm([-.7,CTB[i][1]/40,.7])),mid=X.T(lerp3(CTB[i],CTT[i],.5));
    let front=F(nb)>0,dd=D(mid);if(tp>=0){const kk=tp;dd=D(X.T(add(lerp3(CTB[i],CTT[i],.5),[-14*kk,(i-3)*9*kk,95*kk-35*kk*kk])));front=dd>dB}
    L.add((front?1000:-1000)+dd,()=>cattail(V0,X,A,K,i))}}
  // ---------------- the throat sac (a small one sits high, under the chin: the throat swelling, not a button on the chest)
  // (it is drawn over the body and the body hides it from where its tip is: seen from behind or at the side it slides behind the chest bit
  // by bit, never all at once)
  {const r=Math.min(A.sacR,27),sc0=add(lerp3(SAC0,SAC1,A.sacK),[0,0,-.55*Math.max(0,r-18)+4*(1-sstep(10,18,r))]),c=X.T(sc0),oc=outCap(X,BC,BR,FB,sc0,r,1);
    if(oc!==false){const dT=oc?D(add(c,mul(oc.n,r))):D(c);L.add(1000+Math.min(D(c),dT),()=>{const q=P(c);
      behind([nearAt(NB,dT)],()=>sunkDraw(V0,q,r,oc,()=>sacDraw(V0,q,r,A,K),`rgba(120,96,40,${(.6*sstep(15,21,r)).toFixed(3)})`),[q[0]-r-4,q[1]-r-4,q[0]+r+4,q[1]+r+4])})}}
  // ---------------- the arms: upper arm, the shoulder, the forearm with the golden bracelet, the hand
  // (the thighs now, for hiding the limbs behind them)
  const THS={};for(const sd of[-1,1]){const g=LG[sd],h=sdv(HIP,sd);THS[sd]={c:add(h,g.Rw(sub(sdv(TC,sd),h))),F:{u:g.Rw([1,0,0]),v:g.Rw([0,1,0]),w:g.Rw([0,0,1])}}}
  const NB=nearPrep(V0,X,BC,BR,FB),NY=nearPrep(V0,X,YCc,YRc,AXES),NT={'-1':nearPrep(V0,X,THS[-1].c,TR,THS[-1].F),'1':nearPrep(V0,X,THS[1].c,TR,THS[1].F)},
    hideAt=(sd,d)=>[nearAt(NB,d),nearAt(NY,d),nearAt(NT[sd],d)];
  for(const sd of[-1,1]){const h0=sd<0?A.hL:A.hR,lk=sd<0?A.hlkL:A.hlkR,hw=[h0[0],h0[1],h0[2]+lift],hc=lk<=0?hw:lk>=1?X.T(h0):lerp3(hw,X.T(h0),lk),
      S=X.T(sdv(SHO,sd)),HF=handFrame(A,sd,X,lk),W0=add(hc,mul(HF.u,-6.5)),Wt=add(W0,mul(HF.w,4.5)),[El,W]=ik(S,Wt,LUA,LFA,X.Rd([-.15,sd,-.35]));
    J['arm'+sd]={S,El,W,hc};L.add(1000+D(lerp3(El,hc,.5)),()=>armDraw(V0,X,A,K,sd,S,El,W,hc,HF,hideAt))}
  // ---------------- the legs: the shin along the thigh, the webbed foot
  for(const sd of[-1,1]){const g=LG[sd];L.add(1000+D(lerp3(g.kn,g.an,.5)),()=>legDraw(V0,X,A,K,sd,g,hideAt))}
  // ---------------- the tongue: out of the mouth; while the mouth shows it is drawn over the body and the head hides what goes behind it,
  // bit by bit (the root slides behind the cheek); only when the mouth is on the far side is it all behind
  if(A.tongue){const m0=X.T(ellAt(BC,BR,FB,mouthDir(0,A,.12*A.open))),tg=tongueGeo(V0,X,A,m0,o,SS);L.add(1000+Math.max(D(m0),tg.dTip)+20,()=>tongueDraw(V0,X,A,K,m0,tg,NB))}
  // ---------------- the fireflies going round it (and the glowing down of the second phase)
  if(!o.noFlies&&!LOWFX&&A.flies>0){const n=Math.ceil(A.flies),n0=Math.floor(A.flies),m=A.flies-n0,dc=D(X.T(BC));for(let i=0;i<n;i++){const al=i<n0?1:m,a=TAU*p*A.frev+(i<n0&&m>0?lerp(i*TAU/n0,i*TAU/n,m):i*TAU/n),R=58+8*((i*5)%3)/2,h=62+22*Math.sin(TAU*p*A.frev*2+i*1.9)+4*(i%2),
      q3=[R*Math.cos(a)+A.B[0],R*Math.sin(a)+A.B[1],h+lift*.6],k=.5+.5*Math.sin(TAU*p*Math.round(2*DUR[anim])+i*2.1);L.add((D(q3)>dc?1000:-1000)+D(q3),()=>{const a0=ctx.globalAlpha;ctx.globalAlpha=a0*al;flyAt(P(q3),k,K,1,A.k2>.5);ctx.globalAlpha=a0})}
    if(A.k2>.5&&A.fluff)for(let i=0;i<3;i++){const a=-TAU*p*A.frev+i*TAU/3+.6,R=48+6*i,h=96+10*Math.sin(TAU*p*A.frev+i),q3=[R*Math.cos(a)+A.B[0],R*Math.sin(a)+A.B[1],h+lift*.6];
      L.add((D(q3)>dc?1000:-1000)+D(q3),()=>{const q=P(q3);if(!LOWFX)shine(K.fluffGlow,q[0],q[1],6,.4);ctx.fillStyle=K.fluff;ctx.strokeStyle='rgba(60,40,20,.5)';ctx.lineWidth=.8;ball(q,1.8);ctx.fill();ctx.stroke()})}}
  // ---------------- stars over the head (hit)
  if(A.stars>0)L.add(3000,()=>{const c0=P(X.T([0,0,104]));for(let i=0;i<3;i++){const an=p*TAU*2+i*TAU/3;C.starS(c0[0]+Math.cos(an)*22,c0[1]+Math.sin(an)*7,3.2,A.stars)}});
  // ---------------- the effects of the moves
  if(fx)for(const e of A.fx)fxDraw(V0,X,L,e,A,K,J,lift,o);
  run(L);
  ctx.restore()}

// ------------------------------------------------------------------ the mass of the body
function massDraw(V0,X,A,K,J,LG,YCc,YRc,face){const{P,F,D}=V0,rgb=K.rimc;
  const tF=sd=>{const g=LG[sd];return{u:g.Rw([1,0,0]),v:g.Rw([0,1,0]),w:g.Rw([0,0,1])}},thC=sd=>{const g=LG[sd],h=sdv(HIP,sd);return add(h,g.Rw(sub(sdv(TC,sd),h)))};
  const thF={'-1':tF(-1),1:tF(1)},thCc={'-1':thC(-1),1:thC(1)},BRc=A.puff>0?[BR[0],BR[1]*(1+.05*A.puff),BR[2]]:BR;
  const sil=ellSil(V0,BC,BRc,FB,X.T,18).concat(ellSil(V0,YCc,YRc,AXES,X.T,16),ellSil(V0,thCc[-1],TR,thF[-1],X.T,14),ellSil(V0,thCc[1],TR,thF[1],X.T,14));
  const H=hullE(sil,.08),hp=svol3(V0,H,K.skin,{lw:3,scr:1,rim:.42,rgb,fill:gradDeep(bbox(H),K.skin)});J.hull=hp;
  ctx.save();ctx.clip(hp.path);
  const onB=m=>({q:P(X.T(ellAt(BC,BR,FB,m))),v:F(X.Rd(ellN(BR,FB,m)))});
  // the dark spots of the back, the dull warts of the flanks, the firefly warts of the low back
  // (near the outline they grow out of nothing: turning, no dot ever pops in or out)
  {ctx.beginPath();let any=false;for(const s of SPB){const r=onB(s.m);if(r.v<.08)continue;const k=sstep(.08,.34,r.v);if(k<.05)continue;any=true;const n=X.Rd(ellN(BR,FB,s.m)),c=X.T(ellAt(BC,BR,FB,s.m));spotPath(V0,c,n,s.r*k)}
    if(any){ctx.fillStyle=K.spot;ctx.globalAlpha*=.75;ctx.fill();ctx.globalAlpha/=.75}}
  {const W=[];for(const w of DWB){const r=onB(w.m);if(r.v<.12)continue;const rr=w.r*sstep(.12,.45,r.v);if(rr>.4)W.push({q:r.q,r:rr})}wartsDraw(W,K)}
  for(let i=0;i<FWB.length;i++){const r=onB(FWB[i]);if(r.v<.05)continue;fwartDraw(r.q,FWBR[i>>1],K,wartLit(A,i>>1),cl((r.v-.05)*5,0,1))}
  // the wet sheen on the back and the head (small and soft: the skin is deep, not shiny plastic)
  {const b=bbox(hp),w=b[2]-b[0],h=b[3]-b[1],cx=b[0]+w*.34,cy=b[1]+h*.24,g=ctx.createRadialGradient(cx,cy,1,cx,cy,w*.22);g.addColorStop(0,`rgba(${K.wet},.18)`);g.addColorStop(1,`rgba(${K.wet},0)`);
    ctx.save();ctx.translate(cx,cy);ctx.scale(1,.55);ctx.translate(-cx,-cy);ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,w*.22,0,TAU);ctx.fill();ctx.restore()}
  // the throat's cream under the mouth
  {const r=capReg(V0,X,BC,BR,FB,TABTH);if(r){const c=P(X.T(ellAt(BC,BR,FB,TABTH.n))),bb=bbox(r.limb.length?r.crease.concat(r.limb):r.crease),R=Math.max(bb[2]-bb[0],bb[3]-bb[1],4)*.6,g=ctx.createRadialGradient(c[0],c[1]+2,1,c[0],c[1],R);
    g.addColorStop(0,K.belly.l);g.addColorStop(.62,K.belly.b);g.addColorStop(1,`rgba(${C.rgbs(K.belly.b)},.15)`);ctx.fillStyle=g;ctx.fill(r.path)}}
  // the thighs and the belly: the belly goes over a thigh unless that thigh is nearer (they never touch: a plane between them decides)
  const bellyFront=sd=>F(X.Rd(nrm([1,-.3*sd,.05])))>0,paintTh=sd=>thighPaint(V0,X,A,K,sd,thCc[sd],thF[sd]),paintY=()=>bellyPaint(V0,X,A,K,YCc,YRc,J);
  for(const sd of[-1,1])if(bellyFront(sd))paintTh(sd);paintY();for(const sd of[-1,1])if(!bellyFront(sd))paintTh(sd);
  // the light that runs under the skin, the lit cheek, the glowing thighs
  pearlDraw(V0,X,A,K);
  for(const i of[0,1]){const k=A.cheek[i];if(k<=.01)continue;const sd=i?1:-1,m=mouthDir(sd*.8,A,-.12),v=F(X.Rd(ellN(BR,FB,m)));if(v<.05)continue;const q=P(X.T(ellAt(BC,BR,FB,m)));
    if(!LOWFX)shine(K.light,q[0],q[1],16,.7*k);ctx.fillStyle=`rgba(${C.rgbs(K.lcore)},${.7*k})`;ball(q,3.2);ctx.fill()}
  if(A.thLit>.01&&!LOWFX)for(const sd of[-1,1]){const c=X.T(thCc[sd]),v=F(X.Rd(thF[sd].v.map(t=>t*sd)));if(v>-.2){const q=P(c);shine(K.light,q[0],q[1],24,.45*A.thLit)}}
  // the mouth (from cheek to cheek), the double chin, the tusks; the warm red of the cheeks in the second phase
  mouthDraw(V0,X,A,K);
  if(K.blush>.01)for(const sd of[-1,1]){const m=dir(sd*.62,.42),v=F(X.Rd(ellN(BR,FB,m)));if(v<.1)continue;const q=P(X.T(ellAt(BC,BR,FB,m))),g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],9);
    g.addColorStop(0,`rgba(255,96,64,${.35*K.blush*Math.min(1,v*2)})`);g.addColorStop(1,'rgba(255,96,64,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(q[0],q[1],9,6,0,0,TAU);ctx.fill()}
  // the light of the belly from below on the chin and the mouth (the dark touch)
  if(!LOWFX&&(A.ulit>.01||A.belly>1.05)){const q=P(X.T(ellAt(BC,BR,FB,dir(0,.02))));shine(K.blight,q[0],q[1]+2,30,.22*Math.max(A.ulit,(A.belly-1)*.6),18)}
  // deep shadow at the bottom
  {const b=bbox(hp),g=ctx.createLinearGradient(0,b[1]+(b[3]-b[1])*.62,0,b[3]);g.addColorStop(0,'rgba(10,22,12,0)');g.addColorStop(1,'rgba(10,22,12,.45)');ctx.fillStyle=g;ctx.fill(hp.path)}
  ctx.restore();
  // the glands behind the eyes (over the outline: they bulge out of it)
  for(const sd of[-1,1])glandDraw(V0,X,A,K,sd);
  // the cape of velvet with its trim of down (it slides off in the defeat: then it is the room's)
  if(A.capeOff<0)capeDraw(V0,X,A,K)}
const spotPath=(V0,c,n,r)=>{n=nrm(n);let u=cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u);for(let i=0;i<10;i++){const t=i/10*TAU,rr=r*(1+.12*Math.sin(i*2.7)),q=V0.P(add(c,add(mul(u,Math.cos(t)*rr),mul(v,Math.sin(t)*rr))));if(i===0)ctx.moveTo(q[0],q[1]);else ctx.lineTo(q[0],q[1])}ctx.closePath()};
// dull warts: raised bumps (base, a lighter top, the dark edge), drawn together. W: [{q, r}]
function wartsDraw(W,K){if(!W.length)return;ctx.beginPath();for(const w of W){ctx.moveTo(w.q[0]+w.r,w.q[1]);ctx.arc(w.q[0],w.q[1],w.r,0,TAU)}ctx.fillStyle=K.wart.b;ctx.fill();ctx.strokeStyle='rgba(16,34,14,.65)';ctx.lineWidth=1.1;ctx.stroke();
  ctx.beginPath();for(const w of W){const r=w.r*.55,x=w.q[0]-w.r*.25,y=w.q[1]-w.r*.3;ctx.moveTo(x+r,y);ctx.arc(x,y,r,0,TAU)}ctx.fillStyle=K.wart.l;ctx.globalAlpha*=.7;ctx.fill();ctx.globalAlpha/=.7}
// a firefly wart: a bump of light (lit 0..1: dim to bright)
function fwartDraw(q,r,K,lit,k){ga(k,()=>{if(!LOWFX)shine(K.fglow,q[0],q[1],r*(2.8+1.8*lit),.4+.5*lit);ctx.beginPath();ctx.arc(q[0],q[1],r,0,TAU);ctx.fillStyle=cmix(K.fdim,K.fcol,.45+.55*lit);ctx.fill();ctx.strokeStyle='rgba(20,34,12,.85)';ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle=cmix(K.fcol,K.fcore,.3+.7*lit);ball([q[0]-r*.08,q[1]-r*.1],r*.58);ctx.fill();ctx.fillStyle='rgba(255,255,245,.9)';ball([q[0]-r*.3,q[1]-r*.36],r*.24);ctx.fill()})}
// the wave of light over the firefly warts: from the tail to the head (rows: 0 the highest of the low back .. 2 the lowest, 3 the thighs)
// (at rest they glow at .45, always a little: from behind the dark mass has its lights)
function wartLit(A,i){const base=i===3?Math.max(.45,A.thLit||0):.45;if(A.wave<0)return base;const c=A.wave*1.4-.2,pos=[.75,.5,.25,0][i];return Math.max(base,.45+.55*Math.max(0,1-Math.abs(c-pos)/.3))}
// the light that runs under the skin before a blow: a pearl of light with its trail along a path of the body
function pearlDraw(V0,X,A,K){const pr=A.pearl;if(!pr||pr.a<=.01||pr.f<=.001)return;const fin=sstep(0,.1,pr.f);const names=pr.path==='thigh'?['thighL','thighR']:[pr.path];
  for(const nm of names){const pa=PATHS[nm],S=pa.S,fs=pa.f,f=pr.f,pts=[];
    for(let i=0;i<S.length;i++){if(fs[i]>f)break;if(fs[i]<f-.35)continue;pts.push({q:V0.P(X.T(S[i].p)),v:V0.F(X.Rd(S[i].n)),k:1-(f-fs[i])/.35})}
    let hi=0;while(hi<fs.length-2&&fs[hi+1]<f)hi++;const k=cl((f-fs[hi])/((fs[hi+1]-fs[hi])||1),0,1),hq=V0.P(X.T(lerp3(S[hi].p,S[hi+1].p,k))),hv=V0.F(X.Rd(nrm(lerp3(S[hi].n,S[hi+1].n,k))));pts.push({q:hq,v:hv,k:1});
    // (a dark halo under the light so it reads on the cream belly too; with few effects a white bead with its outline)
    ctx.save();ctx.globalAlpha*=pr.a*fin;ctx.lineCap='round';const lc=C.rgbs(K.lcore);
    for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];if(a.v<.03||b.v<.03)continue;const al=.6*b.k;
      ctx.strokeStyle=`rgba(20,40,10,${.3*b.k})`;ctx.lineWidth=2.2*b.k+3;seg(a.q,b.q);ctx.stroke();
      if(!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${K.light},${al*.45})`;ctx.lineWidth=7*b.k+2;seg(a.q,b.q);ctx.stroke();ctx.globalCompositeOperation='source-over'}
      ctx.strokeStyle=`rgba(${lc},${al})`;ctx.lineWidth=2.2*b.k+.6;seg(a.q,b.q);ctx.stroke()}
    const hk=1-sstep(.88,1,f);if(hv>.03&&hk>0){ctx.globalAlpha*=hk;const rr=4*(.6+.4*hk);ctx.fillStyle='rgba(20,40,10,.5)';ball(hq,rr+2);ctx.fill();
      if(LOWFX){ctx.fillStyle='#ffffff';ball(hq,3.5);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke()}
      else{shine(K.light,hq[0],hq[1],15,.85);ctx.fillStyle=K.lcore;ball(hq,rr);ctx.fill();ctx.fillStyle='#ffffff';ball([hq[0]-.6,hq[1]-.7],rr*.45);ctx.fill()}}
    ctx.restore()}}

// ------------------------------------------------------------------ the thighs: their own volume over the mass (shade, crease, outline)
function thighPaint(V0,X,A,K,sd,Cc,Fr){const{P,F}=V0,r=capReg(V0,X,Cc,TR,Fr,TABT[sd]);if(!r)return;const out=F(X.Rd(Fr.v.map(v=>v*sd)));
  const k=cl((out+.25)*3,0,1);if(k<=.01)return;
  ga(k,()=>{const q=P(X.T(Cc)),bb=[q[0]-30,q[1]-26,q[0]+30,q[1]+22],eo=r.eo?'evenodd':'nonzero';ctx.fillStyle=grad3(bb,K.skin);ctx.fill(r.path,eo);
    ctx.save();ctx.clip(r.path,eo);
    {ctx.beginPath();let any=false;for(const s of SPT){const m=sdv(s.m,sd),n=X.Rd(ellN(TR,Fr,m)),v=F(n);if(v<.1)continue;any=true;spotPath(V0,X.T(ellAt(Cc,TR,Fr,m)),n,s.r)}
      if(any){ctx.fillStyle=K.spot;ctx.globalAlpha*=.7;ctx.fill();ctx.globalAlpha/=.7}}
    {const W=[];for(const w of DWT){const m=sdv(w.m,sd),v=F(X.Rd(ellN(TR,Fr,m)));if(v<.15)continue;const rr=w.r*sstep(.15,.45,v);if(rr>.4)W.push({q:P(X.T(ellAt(Cc,TR,Fr,m))),r:rr})}wartsDraw(W,K)}
    {const m=sdv(FWT,sd),v=F(X.Rd(ellN(TR,Fr,m)));if(v>.05)fwartDraw(P(X.T(ellAt(Cc,TR,Fr,m))),4.4,K,wartLit(A,3),cl((v-.05)*5,0,1))}
    ctx.restore();
    strokeRuns([r.crease],'rgba(16,34,14,.55)',2);strokeRuns([r.limb],INK,2.4);if(r.limb.length>2)rimP(r.limb,K.rimc,.3,false)})}
// the belly: cream in front and underneath (lit from inside), green on the flanks, four soft folds, three little lights going round inside it
function bellyPaint(V0,X,A,K,YCc,YRc,J){const{P,F}=V0,r=capReg(V0,X,YCc,YRc,AXES,TABY);if(!r)return;const eo=r.eo?'evenodd':'nonzero';
  const fm=nrm([.9,0,-.4]),q0=P(X.T(ellAt(YCc,YRc,AXES,fm))),lt=cl(A.belly,0,2.5),sk=C.rgbs(K.skin.b),skd=C.rgbs(K.skin.d);J.bellyQ=q0;
  {const g=ctx.createRadialGradient(q0[0]-3,q0[1]-7,2,q0[0],q0[1]-4,42),hi=cmix(K.belly.b,K.belly.l,cl(.35+.65*lt,0,1));g.addColorStop(0,lt>1?cmix(hi,'#ffffff',cl((lt-1)*.4,0,.7)):hi);g.addColorStop(.5,lt<.6?cmix(K.belly.d,K.belly.b,lt/.6):K.belly.b);g.addColorStop(1,K.belly.d);ctx.fillStyle=g;ctx.fill(r.path,eo)}
  ctx.save();ctx.clip(r.path,eo);
  // the green flanks: a ring round the cream (wider than tall, so the cream reaches up under the chin)
  {ctx.save();ctx.translate(q0[0],q0[1]-4);ctx.scale(1,.78);const g=ctx.createRadialGradient(0,0,1,0,0,46);g.addColorStop(0,`rgba(${sk},0)`);g.addColorStop(.6,`rgba(${sk},0)`);g.addColorStop(.84,`rgba(${sk},.9)`);g.addColorStop(1,`rgba(${skd},1)`);
    ctx.fillStyle=g;ctx.fillRect(-80,-80,160,160);ctx.restore()}
  // four soft folds across the front
  {const runs=[];for(const e of[.4,.16,-.1,-.36]){let run=[];for(let i=0;i<=10;i++){const t=-.85+i*.17,m=nrm([Math.cos(e)*Math.cos(t),Math.cos(e)*Math.sin(t),Math.sin(e)]);
      if(F(X.Rd(ellN(YRc,AXES,m)))>.2)run.push(P(X.T(ellAt(YCc,YRc,AXES,m))));else if(run.length){runs.push(run);run=[]}}if(run.length)runs.push(run)}
    ctx.globalAlpha*=.5;strokeRuns(runs,K.fold,1.3);ctx.globalAlpha/=.5}
  // the fireflies it swallowed, glowing inside (three soft lights going round), a flash when it is struck
  if(!LOWFX&&lt>.05){const t=A.bt||0;for(let i=0;i<3;i++){const a=t*TAU+i*TAU/3,m=nrm([1,Math.sin(a)*.55,-.25+Math.cos(a)*.35]),q=P(X.T(ellAt(YCc,YRc,AXES,m)));shine(K.blight,q[0],q[1],8+2*i+2*(lt-1),.3*Math.min(lt,1.6))}
    if(lt>1.02)shine(K.blight,q0[0],q0[1]-6,40,.25*(lt-1));if(A.bflash>0)shine(K.blight,q0[0],q0[1]-6,46,.55*A.bflash)}
  ctx.restore();
  strokeRuns([r.crease],'rgba(120,96,40,.45)',1.8);strokeRuns([r.limb],INK,2.4)}

// ------------------------------------------------------------------ the mouth: a wide line from cheek to cheek, the crooked smile
// u from -1 (its left corner) to 1: a direction on the body's ellipsoid; lo: how far down the lower lip has dropped
const MOUTHAZ=1.08;
// (A.oh: the mouth an «O», the lower lip drops only in the middle and the corners stay shut: the defeat's burp, never a grin)
function mouthDir(u,A,lo){const az=u*MOUTHAZ*(1+.08*A.grin),k=u*u,oh=A.oh||0,dk=oh>0?lerp(1-k*.85,Math.max(0,1-k/.28),oh):1-k*.85,el=.245+(.17-.1*A.pout-.06*A.grin)*k+(u<0?.07*k:0)-(lo||0)*dk;return dir(az,el)}
function mouthDraw(V0,X,A,K){const{P,F}=V0,N=14,up=[],vs=[],lo=.42*A.open,at=m=>P(X.T(ellAt(BC,BR,FB,m))),vis=m=>F(X.Rd(ellN(BR,FB,m)));
  for(let i=0;i<=N;i++){const m=mouthDir(-1+2*i/N,A);vs.push(vis(m));up.push(at(m))}
  if(Math.max(...vs)<.02)return;
  // the double chin: two soft folds under the middle of the mouth (they move down with the lower lip)
  {const runs=[];for(const[e,w] of[[.02,.55],[-.12,.4]]){const run=[];for(let i=0;i<=6;i++){const t=(-1+i/3)*w,m=dir(t,e-lo*.7+.05*t*t);if(vis(m)>.1)run.push(at(m))}if(run.length>1)runs.push(run)}
    ctx.globalAlpha*=.5;strokeRuns(runs,cmix(K.belly.d,'#3a3018',.4),1.4);ctx.globalAlpha/=.5}
  let i0=-1,i1=-1;for(let i=0;i<=N;i++)if(vs[i]>.02){if(i0<0)i0=i;i1=i}
  if(lo>.01&&i1>i0){// the open mouth: a dark cave from the upper lip to the dropped lower lip, the rolled tongue in it, the light deep inside
    const low=[];for(let i=i1;i>=i0;i--)low.push(at(mouthDir(-1+2*i/N,A,lo)));const pts=up.slice(i0,i1+1).concat(low),bb=bbox(pts);
    ctx.save();C.poly(pts);ctx.fillStyle=K.mouth;ctx.fill();ctx.clip();
    {const g=ctx.createLinearGradient(0,bb[1],0,bb[3]);g.addColorStop(0,K.mouthD);g.addColorStop(1,'rgba(74,26,44,0)');ctx.fillStyle=g;ctx.fillRect(bb[0]-2,bb[1]-2,bb[2]-bb[0]+4,bb[3]-bb[1]+4)}
    const c=at(mouthDir(0,A,lo*.55));if(!LOWFX)shine(K.light,c[0],c[1],9,.45*A.open);
    if(!A.tongue){const tq=at(mouthDir(0,A,lo*.92)),w=Math.min(12,(bb[2]-bb[0])*.3);ctx.fillStyle=K.tongue.b;ctx.beginPath();ctx.ellipse(tq[0],tq[1],w,4.5,0,Math.PI,TAU);ctx.fill();ctx.fillStyle=K.tongue.l;ctx.beginPath();ctx.ellipse(tq[0]-w*.25,tq[1]-2.2,w*.35,1.2,0,0,TAU);ctx.fill()}
    ctx.restore();C.poly(pts);ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.lineJoin='round';ctx.stroke()}
  const runs=[];let cur=[];for(let i=0;i<=N;i++){if(vs[i]>.02)cur.push(up[i]);else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
  // the lower lip juts out a little: a lighter lip under the middle, its shadow
  if(lo<.05){const lr=[];for(let i=3;i<=N-3;i++){const m=mouthDir(-1+2*i/N,A,.045+lo);if(vis(m)>.05)lr.push(at(m))}
    if(lr.length>1){strokeRuns([lr],cmix(K.belly.l,K.skin.l,.4),2.4);strokeRuns([lr.map(q=>[q[0],q[1]+1.6])],'rgba(30,40,14,.35)',1.2)}}
  strokeRuns(runs,INK,2.8);
  // the line of the mouth lit by the light that climbed the throat
  if(A.mlit>.01){ctx.save();ctx.globalAlpha*=A.mlit;if(!LOWFX){ctx.globalCompositeOperation='lighter';strokeRuns(runs,`rgba(${K.light},.55)`,9);ctx.globalCompositeOperation='source-over'}strokeRuns(runs,K.lcore,2);ctx.restore()}
  // the two little tusks on the lower lip where the line is still flat (the corner's hook stays free), pointing up, round at the tip
  for(const sd of[-1,1]){const m=mouthDir(sd*.6,A,.06+lo),v=vis(m);if(v<.12)continue;const b0=X.T(ellAt(BC,BR,FB,m)),up3=X.Rd([0,0,1]),tip=add(b0,mul(up3,5)),qa=P(add(b0,mul(up3,-.6))),qb=P(tip);
    ga(cl((v-.12)*5,0,1),()=>{ctx.beginPath();hullA(qa,1.9,qb,1);ctx.fillStyle=grad3([qa[0]-2,qb[1]-1,qa[0]+2,qa[1]],K.tusk);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.7)';ball([qb[0]-.5,qb[1]+.9],.7);ctx.fill()})}
  // licking its lips: the tip of the tongue comes out of the left corner and runs over the upper lip
  if(A.lick>=0&&A.lick<1){const L=A.lick,ut=-1+1.25*Math.sin(Math.PI*L),sz=Math.sin(Math.PI*cl(L*1.15,0,1)),pts=[];for(let j=0;j<=6;j++){const u=-1.02+(ut+1.02)*j/6,m=mouthDir(u,A,-.035);if(vis(m)>.05)pts.push(at(m))}
    if(pts.length>1&&sz>.05){ctx.lineCap='round';ctx.lineJoin='round';const w=5.5*sz;strokeRuns([pts],INK,w+2.4);strokeRuns([pts],K.tongue.b,w);const e=pts[pts.length-1];ctx.fillStyle=K.tongue.l;ball([e[0]-.6,e[1]-1],w*.28);ctx.fill()}}}

// ------------------------------------------------------------------ the glands behind the eyes (lit orange in the second phase)
function glandDraw(V0,X,A,K,sd){const{P,F}=V0,Cg=sdv(GC,sd),r=capReg(V0,X,Cg,GR,AXES,TABG[sd]);if(!r)return;const q=P(X.T(Cg)),bb=[q[0]-13,q[1]-9,q[0]+13,q[1]+9],gl=cl(A.glands,0,1);
  ctx.fillStyle=grad3(bb,K.gland);ctx.fill(r.path);
  const pc=P(X.T(ellAt(Cg,GR,AXES,nrm([.1,sd*.8,.6]))));
  if(gl>.01){ctx.save();ctx.clip(r.path);ctx.globalAlpha*=gl;const g=ctx.createRadialGradient(pc[0],pc[1],.5,pc[0],pc[1],7);g.addColorStop(0,K.gcore);g.addColorStop(.55,`rgba(194,90,20,.75)`);g.addColorStop(1,`rgba(194,90,20,0)`);ctx.fillStyle=g;ctx.fill(r.path);ctx.restore();
    shine(K.gglow,pc[0],pc[1],12,.3*gl)}
  // (dull in the first phase: soft pores, the crease barely drawn, ink only on the outline, so it never reads as a second eye)
  ctx.fillStyle=gl>.5?K.gcore:K.pore;ctx.beginPath();for(const[a,b] of[[-.3,.2],[.1,.35],[.35,.05],[-.05,-.15],[.4,.4],[-.4,-.1]]){const m=nrm([a,sd*.8,.55+b]),v=F(X.Rd(ellN(GR,AXES,m)));if(v<.15)continue;ballA(P(X.T(ellAt(Cg,GR,AXES,m))),gl>.5?1.1:.85)}
  if(gl<=.5)ctx.globalAlpha*=.5;ctx.fill();if(gl<=.5)ctx.globalAlpha/=.5;
  strokeRuns([r.crease],'rgba(16,34,14,.25)',1.4);strokeRuns([r.limb],INK,2)}

// ------------------------------------------------------------------ the cape: velvet of cattail, a trim of white down with the ermine's dots
function capeDraw(V0,X,A,K){const{P,F}=V0,op=A.capeOpen||0,R2=[BR[0]*(CAPEK+.04*op),BR[1]*(CAPEK+.22*op),BR[2]*(CAPEK+.03*op)],r=capReg(V0,X,BC,R2,FB,TABC);if(!r)return;
  const eo=r.eo?'evenodd':'nonzero',q=P(X.T(ellAt(BC,R2,FB,CAPEN))),bb=[q[0]-42,q[1]-30,q[0]+42,q[1]+36];
  // the front edges have no trim: the cloth throws a soft shadow on the skin under them and they get their ink line (cloth lying on the
  // body, not a sticker cut straight)
  const N=TABC.N,fe=[];{let cur=[];for(let k=0;k<=N;k++){const i=k%N,t=i/N*TAU,m=TABC.b[i],v=F(X.Rd(ellN(R2,FB,m)));if(v>.02&&trimW(t)<.35)cur.push(P(X.T(ellAt(BC,R2,FB,m))));else if(cur.length){fe.push(cur);cur=[]}}if(cur.length)fe.push(cur)}
  if(fe.length){const a0=ctx.globalAlpha;ctx.globalAlpha=a0*.34;strokeRuns(fe.map(r=>r.map(q=>[q[0]+.8,q[1]+1.8])),'#0a160c',7.5);ctx.globalAlpha=a0}
  ctx.fillStyle=gradDeep(bb,K.cape);ctx.fill(r.path,eo);
  // the nap of the velvet: three broad soft folds from the neck down to the hem, each with a sheen beside it
  ctx.save();ctx.clip(r.path,eo);{const dk=[],lt=[];for(const s0 of[-.5,.04,.52]){let a=[],b=[];for(let j=0;j<=7;j++){const e=.3-j*.15,m=nrm(add(add(mul(CAPEN,Math.cos(e)),mul(TABC.u,Math.sin(e))),mul(TABC.v,s0*(1+.35*j/7))));
      const n=X.Rd(ellN(R2,FB,m));if(F(n)>.06){const qq=P(X.T(ellAt(BC,R2,FB,m)));a.push(qq);b.push([qq[0]-2.8,qq[1]-.7])}else if(a.length){dk.push(a);lt.push(b);a=[];b=[]}}if(a.length){dk.push(a);lt.push(b)}}
    ctx.globalAlpha*=.42;strokeRuns(dk,K.cape.d,3.6);ctx.globalAlpha*=.5;strokeRuns(lt,K.cape.l,1.5)}ctx.restore();
  strokeRuns([r.limb],INK,2.6);if(fe.length)strokeRuns(fe,INK,2.2);if(r.limb.length>2)rimP(r.limb,K.rimc,.3,false);
  trimDraw(V0,X,A,K,R2)}
// the trim of white down along the collar at the nape (it stands up a little: seen from the front it frames the head) and along the hem;
// the front edges down the flanks have none. A chain of uneven overlapping puffs, one on each of the 72 points of the edge: each grows out
// of nothing where its point turns to face us and toward the ends of the trim, so turning never makes a piece of it pop in or out. Ink
// round them all, the cold shadow of their lower half, the cream, a light on top; the ermine's dark tails on every fourth
function trimDraw(V0,X,A,K,R2){const{P,F}=V0,N=TABC.N,B=[];
  for(let i=0;i<N;i++){const t=i/N*TAU,tw=trimW(t);if(tw<=.02)continue;const m=TABC.b[i],n=X.Rd(ellN(R2,FB,m)),v=F(n);if(v<=.06)continue;
    const k=Math.min(1,2*tw)*sstep(.06,.25,v);if(k<.05)continue;B.push({q:P(add(X.T(ellAt(BC,R2,FB,m)),mul(n,1.2))),r:(3.3+1.4*(((i*37)%11)/10))*k,i})}
  if(!B.length)return;
  const puffs=(dx,dy,f,col)=>{ctx.beginPath();for(const b of B)ballA([b.q[0]+dx,b.q[1]+dy],b.r*f);ctx.fillStyle=col;ctx.fill()};
  ctx.beginPath();for(const b of B)ballA(b.q,b.r+1.2);ctx.fillStyle=INK;ctx.fill();
  puffs(0,.3,1,K.down.d);puffs(-.25,-.55,.88,K.down.b);puffs(-.9,-1.4,.34,K.down.l);
  ctx.fillStyle=K.ermine;ctx.beginPath();for(const b of B){if(b.i%6!==2||b.r<3)continue;const x=b.q[0]+.4,y=b.q[1]+1;ctx.moveTo(x+1.3,y);ctx.ellipse(x,y,1.3,2.4,0,0,TAU)}ctx.fill()}
// the cape slid off in the defeat: a heap of velvet on the floor behind it, a bit of the trim (k: 0 falling .. 1 lying), al: its fading
function heapDraw(V0,K,k,al){const{P,F}=V0,kk=cl(k,0,1),c=[-34,6,34*Math.pow(1-kk,2)],sq=1-.4*(1-kk),rr=t=>15+3*Math.sin(3*t+.5)+2*Math.sin(5*t+1.2),
    at=(t,f,z)=>{const r=rr(t)*f;return P([c[0]+Math.cos(t)*1.15*r,c[1]+Math.sin(t)*r,c[2]+z])},fd=t=>F([Math.cos(t)*1.15,Math.sin(t),0]);
  ga(al,()=>{// the crumpled velvet: a low lumpy mound on the floor
    const pts=[];for(let i=0;i<16;i++){const t=i/16*TAU;pts.push(at(t,1,0),at(t,.5,8*sq))}pts.push(P([c[0]-2,c[1]+1,c[2]+11*sq]));const H=chull(pts);
    ctx.lineJoin='round';smooth(H);ctx.fillStyle=gradDeep(bbox(H),K.cape);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
    // its folds: creases from the top down to the floor, a light ridge beside each (only those on our side)
    ctx.lineCap='round';for(const t of[.4,1.5,2.6,3.9,5.1]){if(fd(t)<.1)continue;const a=at(t,.2,10*sq),m=at(t,.62,6*sq),b=at(t,.95,1);
      ctx.strokeStyle=K.cape.d;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(m[0]+1.5,m[1],b[0],b[1]);ctx.stroke();
      ctx.strokeStyle=K.cape.l;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(a[0]-1.5,a[1]-1);ctx.quadraticCurveTo(m[0]-1,m[1]-1,b[0]-1.5,b[1]-.5);ctx.stroke()}
    // the white down of the hem, lying along the side that faces us
    const tr=[];for(let i=0;i<=12;i++){const t=-.6+i/12*3.4,f=fd(t);if(f<.05)continue;tr.push({q:at(t,1.02,2+1.5*Math.sin(i*1.7)),s:sstep(.05,.3,f)})}
    ctx.fillStyle=INK;for(const o of tr){ball(o.q,3*o.s+1.2);ctx.fill()}
    for(const o of tr){ctx.fillStyle=K.down.b;ball(o.q,3*o.s);ctx.fill();ctx.fillStyle=K.down.l;ball([o.q[0]-.8,o.q[1]-1],1.3*o.s);ctx.fill()}})}

// ------------------------------------------------------------------ the eye domes, the eyes, the lids, the crests
function domeDraw(V0,X,A,K,sd,c,front){const{P,F}=V0,q=P(c),r=ER*A.eyeK,oc=front?outCap(X,BC,BR,FB,sdv(EC,sd),r,CAPEK):null;
  const gs=grad3([q[0]-r,q[1]-r,q[0]+r,q[1]+r],K.skin),draw=()=>{tball(q,r,K.skin,K.rimc,2.6,.32,gs);eyeDraw(V0,X,A,K,sd,q,r,gs)};
  // a soft shadow on the head round the dome: a little dark round the amber, so it lights up
  if(front&&oc!==false){const g=ctx.createRadialGradient(q[0],q[1]+1.5,r*.8,q[0],q[1]+1.5,r*1.5);g.addColorStop(0,'rgba(6,18,8,.34)');g.addColorStop(1,'rgba(6,18,8,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(q[0],q[1]+1.5,r*1.5,0,TAU);ctx.fill()}
  if(front)sunkDraw(V0,q,r,oc,draw);else draw();
  crestDraw(V0,X,A,K,sd,c,q,r)}
const PUPT=[];for(let i=0;i<16;i++){const t=i/16*Math.PI*2,cs=Math.cos(t),sn=Math.sin(t);PUPT.push([Math.pow(Math.abs(cs),.55)*Math.sign(cs),Math.pow(Math.abs(sn),.7)*Math.sign(sn)])}
function eyeDraw(V0,X,A,K,sd,q,r,gs){const{F}=V0,n=X.Rd(nrm(sdv(EDIR,sd))),fv=F(n);if(fv<-.6)return;const al=.86;
  const shut=Math.max(A.shut,sd<0?A.shutL:A.shutR),hp=Array.isArray(A.happy)?A.happy[sd<0?0:1]:A.happy,lid0=sd<0&&A.lidL!=null?A.lidL:sd>0&&A.lidR!=null?A.lidR:A.lid,lid=Math.max(lid0,cl(Math.max(shut,hp)*2,0,1));
  let hu=cross(n,X.Rd([0,0,1]));if(len(hu)<.2)hu=X.Rd([0,1,0]);hu=nrm(hu);const vu=cross(hu,n),Sa=Math.sin(al);
  // shut tight (hurt, the landing) or shut with glee (a half moon): a line across the dome, never see-through
  if(shut>.5||hp>.5){const cp=capPts(V0,q,r*.985,n,.7,8);if(!cp)return;const a=sp(V0,q,r,nrm(add(n,mul(hu,-.62)))),b=sp(V0,q,r,nrm(add(n,mul(hu,.62)))),m=sp(V0,q,r,nrm(add(n,mul(vu,hp>.5?.28:-.05))));
    ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(2*m[0]-(a[0]+b[0])/2,2*m[1]-(a[1]+b[1])/2,b[0],b[1]);ctx.stroke();
    if(shut>.5&&hp<=.5){ctx.lineWidth=1.3;for(const s of[-1,1]){const e=s<0?a:b,d=[e[0]-q[0],e[1]-q[1]],l=Math.hypot(d[0],d[1])||1;seg(e,[e[0]+d[0]/l*2.6,e[1]+d[1]/l*2.6-1.4]);ctx.stroke()}}
    return}
  const cp=capPts(V0,q,r*.985,n,al,18);if(!cp)return;
  ctx.save();const ip=new Path2D();ip.moveTo(cp.pts[0][0],cp.pts[0][1]);for(const w of cp.pts)ip.lineTo(w[0],w[1]);ip.closePath();
  // the glow of the eye
  if(!LOWFX)shine(K.eyeGlow,q[0],q[1],r*1.6,.35+.25*(lid<0?-lid:0));
  // the iris: amber, lit from inside
  const ic=sp(V0,q,r,n);{const g=ctx.createRadialGradient(ic[0]-1,ic[1]-1.5,.5,ic[0],ic[1],r*.95);g.addColorStop(0,K.eye.l);g.addColorStop(.45,K.eye.b);g.addColorStop(1,K.eye.d);ctx.fillStyle=g;ctx.fill(ip)}
  ctx.clip(ip);
  // the pupil: a rounded bar across (narrower when it aims); the point of light
  {const lk=A.look,pc=nrm(add(n,add(mul(hu,lk[0]*.22),mul(vu,lk[1]*.15)))),c0=sp(V0,q,r,pc),a=sp(V0,q,r,nrm(add(pc,mul(hu,.5-.14*A.pup)))),b=sp(V0,q,r,nrm(add(pc,mul(vu,.2*(1-.7*A.pup)))));
    const ax=[a[0]-c0[0],a[1]-c0[1]],bx=[b[0]-c0[0],b[1]-c0[1]];ctx.beginPath();for(const[e,f] of PUPT)ctx.lineTo(c0[0]+ax[0]*e+bx[0]*f,c0[1]+ax[1]*e+bx[1]*f)
    ctx.closePath();ctx.fillStyle='#1a1210';ctx.fill()}
  {const hl=sp(V0,q,r,nrm(add(n,add(mul(hu,-.3),mul(vu,.12)))));ctx.fillStyle='#fff';ball(hl,Math.max(1.3,r*.15));ctx.fill();ctx.fillStyle='rgba(255,255,255,.6)';ball([hl[0]+r*.32,hl[1]+r*.28],r*.06+.3);ctx.fill()}
  // the upper lid: skin from the top of the eye down to a third of the iris at rest (0), out of sight wide open (-1), shut (1); smooth
  // through 0, so opening and dropping back never jump
  const lv=lid<0?lerp(Sa/3,Sa,Math.min(1,-lid)):lerp(Sa/3,-Sa*1.05,cl(lid,0,1));
  if(lv<Sa){const lc=capPts(V0,q,r*1.2,vu,Math.acos(cl(lv,-1,1)),16);if(lc){ctx.beginPath();for(const w of lc.pts)ctx.lineTo(w[0],w[1]);ctx.closePath();ctx.fillStyle=gs||grad3([q[0]-r,q[1]-r,q[0]+r,q[1]+r],K.skin);ctx.fill();
      const lr={rim:lc.rim.map(w=>[q[0]+(w[0]-q[0])/1.2,q[1]+(w[1]-q[1])/1.2])};if(lr.rim.length>1){ctx.beginPath();for(const w of lr.rim)ctx.lineTo(w[0],w[1]);ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.lineCap='round';ctx.stroke();
        ctx.beginPath();for(const w of lr.rim)ctx.lineTo(w[0],w[1]-1.6);ctx.strokeStyle=`rgba(${K.rimc},.35)`;ctx.lineWidth=1;ctx.stroke()}}}
  ctx.restore();
  ctx.beginPath();for(const w of cp.rim)ctx.lineTo(w[0],w[1]);if(cp.full)ctx.closePath();ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.lineJoin='round';ctx.stroke()}
// the bony crest over each dome, from the inner front end to the outer back end (the inner end goes down 4 into a cruel V when it aims):
// a thick cord in two tones with a light thread on top, drawn where it faces us (the dome hides the rest)
// (a soft shadow under it on the dome; seen from behind it fades away: no pot handles on the head)
function crestDraw(V0,X,A,K,sd,c,q,r){const{P,F}=V0,e1=nrm(sdv([8,-8,9-5*A.crest+3*A.crestUp],sd)),e2=nrm(sdv([-8,10,9],sd)),N=6,runs=[];let cur=[];
  const al=sstep(-.75,-.2,F(X.Rd(nrm(sdv(EDIR,sd)))));if(al<=.02)return;
  for(let i=0;i<=N;i++){const m=nrm(lerp3(e1,e2,i/N)),d=X.Rd(m);if(F(d)>-.05)cur.push(P(add(c,mul(d,r*1.02+1.2))));else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);if(!runs.length)return;
  ga(al,()=>{ctx.save();ctx.globalAlpha*=.3;strokeRuns(runs.map(r=>r.map(q=>[q[0]+.6,q[1]+2.4])),'#06120a',9);ctx.restore();
    strokeRuns(runs,INK,8.2);strokeRuns(runs,K.crest.d,6);strokeRuns(runs.map(r=>r.map(q=>[q[0]-.5,q[1]-.9])),K.crest.b,4);strokeRuns(runs.map(r=>r.map(q=>[q[0]-.7,q[1]-1.8])),K.crestL,1.1)})}

// ------------------------------------------------------------------ the crown: five points with little balls, the bent one, the mud, the gem
function crownDraw(V0,X,A,K){const tilt=KTILT+A.ctilt,c=add(KC,[0,0,A.cz]);crownAt(V0,q=>X.T(q),v=>X.Rd(v),c,tilt,K,A);
  if(A.crownG>0){const q=V0.P(X.T(add(c,[2,-6,14])));C.starS(q[0],q[1],5*A.crownG+1,A.crownG);if(!LOWFX)shine('255,240,170',q[0],q[1],12,.6*A.crownG)}}
function crownAt(V0,T0,R0,c,tilt,K,A){const{P,F}=V0,ca=Math.cos(tilt),sa=Math.sin(tilt),T=v=>T0(add(c,[v[0],v[1]*ca-v[2]*sa,v[1]*sa+v[2]*ca])),Rd=v=>R0([v[0],v[1]*ca-v[2]*sa,v[1]*sa+v[2]*ca]);
  const N=10,B=[],Tp=[],nf=[];
  for(let i=0;i<=N;i++){const a=i/N*TAU,pt=i%2===0,h=pt?KHT:5,rr=KRAD*(pt?1.16:1.06),bent=i===4;let tp=[Math.cos(a)*rr,Math.sin(a)*rr,h];if(bent)tp=[Math.cos(a)*rr*1.32,Math.sin(a)*rr*1.32,h-4];
    B.push(P(T([Math.cos(a)*KRAD,Math.sin(a)*KRAD,0])));Tp.push(P(T(tp)))}
  for(let i=0;i<N;i++){const a=(i+.5)/N*TAU;nf.push(F(Rd([Math.cos(a),Math.sin(a),-.1])))}
  // the faces of one side in one path (each turned the same way round, so they join without seams)
  const quads=side=>{ctx.beginPath();for(let i=0;i<N;i++){if((nf[i]>=0)!==side)continue;let Q=[B[i],B[i+1],Tp[i+1],Tp[i]];const ar=(Q[1][0]-Q[0][0])*(Q[2][1]-Q[0][1])-(Q[2][0]-Q[0][0])*(Q[1][1]-Q[0][1])+(Q[2][0]-Q[0][0])*(Q[3][1]-Q[0][1])-(Q[3][0]-Q[0][0])*(Q[2][1]-Q[0][1]);
    if(ar<0)Q=Q.reverse();ctx.moveTo(Q[0][0],Q[0][1]);for(let k=1;k<4;k++)ctx.lineTo(Q[k][0],Q[k][1]);ctx.closePath()}};
  ctx.lineJoin='round';ctx.lineCap='round';const bb=bbox(B.concat(Tp)),gf=ctx.createLinearGradient(bb[0],bb[1],bb[2],bb[3]);gf.addColorStop(0,K.gold.l);gf.addColorStop(.45,K.gold.b);gf.addColorStop(1,K.gold.d);
  const inner=cmix(K.gold.d,K.gold.b,.3);   // the inside: dark gold, never a black hole in the head
  const tipBalls=back=>{const Q=[];for(let i=0;i<N;i+=2){const a=i/N*TAU;if((F(Rd([Math.cos(a),Math.sin(a),0]))<0)===back)Q.push(Tp[i])}if(!Q.length)return;
    ctx.beginPath();for(const q of Q)ballA(q,2.3);ctx.fillStyle=K.gold.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();ctx.beginPath();for(const q of Q)ballA([q[0]-.7,q[1]-.8],.9);ctx.fillStyle=K.gold.l;ctx.fill()};
  quads(false);ctx.fillStyle=inner;ctx.fill();ctx.strokeStyle=inner;ctx.lineWidth=.8;ctx.stroke();
  ctx.beginPath();for(let i=0;i<N;i++)if(nf[i]<0){ctx.moveTo(Tp[i][0],Tp[i][1]);ctx.lineTo(Tp[i+1][0],Tp[i+1][1])}ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
  tipBalls(true);
  quads(true);ctx.fillStyle=gf;ctx.fill();ctx.strokeStyle=gf;ctx.lineWidth=.8;ctx.stroke();
  ctx.beginPath();for(let i=0;i<N;i++){if(nf[i]>=0){ctx.moveTo(Tp[i][0],Tp[i][1]);ctx.lineTo(Tp[i+1][0],Tp[i+1][1]);ctx.moveTo(B[i][0],B[i][1]);ctx.lineTo(B[i+1][0],B[i+1][1])}
    if((nf[i]>=0)!==(nf[(i+1)%N]>=0)){ctx.moveTo(B[i+1][0],B[i+1][1]);ctx.lineTo(Tp[i+1][0],Tp[i+1][1])}}ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
  // the crust of dry mud on the band (front left), the gem of light in front
  {const a=-.75,v=F(Rd([Math.cos(a),Math.sin(a),0]));if(v>.1){const m0=P(T([Math.cos(a)*KRAD*1.02,Math.sin(a)*KRAD*1.02,2.2])),m1=P(T([Math.cos(a-.35)*KRAD*1.02,Math.sin(a-.35)*KRAD*1.02,1.4]));
    ga(cl((v-.1)*5,0,1),()=>{ctx.fillStyle=K.mud;ctx.beginPath();ctx.ellipse((m0[0]+m1[0])/2,(m0[1]+m1[1])/2,Math.hypot(m1[0]-m0[0],m1[1]-m0[1])/2+1.6,1.8,Math.atan2(m1[1]-m0[1],m1[0]-m0[0]),0,TAU);ctx.fill();
      ctx.fillStyle='rgba(150,130,90,.6)';ball([m0[0]-.5,m0[1]-.6],.6);ctx.fill()})}}
  tipBalls(false);
  {const v=F(Rd([1,0,0]));if(v>0){const g=P(T([KRAD*1.04,0,5])),pu=.6+.4*Math.sin(((A&&A.bt)||0)*TAU*2),k=cl(v*4,0,1),r=2.7*Math.max(.5,v);
    ga(k,()=>{const gf=A&&A.gemF?A.gemF:0;if(!LOWFX)shine(K.gemGlow,g[0],g[1],9+5*gf,(.3+.25*pu)*(1+1.4*gf));
      // a cut gem: a rhombus with a lit upper facet
      const w=r*1.05,h=3.4;ctx.beginPath();ctx.moveTo(g[0],g[1]-h);ctx.lineTo(g[0]+w,g[1]);ctx.lineTo(g[0],g[1]+h);ctx.lineTo(g[0]-w,g[1]);ctx.closePath();ctx.fillStyle=cmix(K.gem.b,K.gem.l,.2*pu+.6*gf);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.lineJoin='round';ctx.stroke();
      ctx.beginPath();ctx.moveTo(g[0],g[1]-h+.8);ctx.lineTo(g[0]+w*.62,g[1]-.2);ctx.lineTo(g[0]-w*.62,g[1]-.2);ctx.closePath();ctx.fillStyle=cmix(K.gem.l,'#ffffff',.3+.4*gf);ctx.fill();
      ctx.beginPath();ctx.moveTo(g[0]+w*.62,g[1]+.2);ctx.lineTo(g[0],g[1]+h-.8);ctx.lineTo(g[0]-w*.2,g[1]+.2);ctx.closePath();ctx.fillStyle=K.gem.d;ctx.globalAlpha*=.55;ctx.fill();ctx.globalAlpha/=.55})}}}
// the crown on its own (fallen on the floor, spinning in the air): its centre cw (the floor point of the drawing's frame), turned round
// its axis by spin, tipped over by tilt
function crownFree(V0,cw,spin,tilt,K,A){crownAt(V0,q=>add(cw,rotZ(sub(q,cw),spin)),v=>rotZ(v,spin),cw,tilt,K,A||{})}

// ------------------------------------------------------------------ the cattails of the collar: a stem, the velvet spike, the little tip
function cattail(V0,X,A,K,i){const{P}=V0,b=CTB[i],t0=CTT[i],sw=A.sway,k=(i-3)/3,tipO=[sw[0]*(1+.3*Math.abs(k))-.5,sw[1]*.8+k*.6*sw[0],0];let tip=add(t0,tipO);
  // folded flat back on the cape (the entrance, before they spring up) and the overshoot as they stand
  const up=A.tUp?A.tUp[i]:1;if(up!==1){const d=sub(tip,b),ax=nrm(cross(nrm(d),[1,0,0]));tip=add(b,rotAx(d,ax,-(1-up)*1.45))}
  // popped off like a cork (the defeat): up and away, turning over
  const pop=A.tPop?A.tPop[i]:-1;let T=X.T,al=1;if(pop>=0){const kk=pop,mid=lerp3(b,tip,.5),off=[-14*kk,(i-3)*9*kk,95*kk-35*kk*kk],spin=kk*6*((i%2)?1:-1);T=q=>X.T(add(add(mid,rotAx(sub(q,mid),[1,0,0],spin)),off));al=1-sstep(.7,1,kk)}
  const dd=sub(tip,b),L0=len(dd),mid=add(lerp3(b,tip,.5),[-2,0,0]),at=u=>{const a=lerp3(b,mid,u),c=lerp3(mid,tip,u);return lerp3(a,c,u)};
  // (the stem is drawn from where it comes out of the collar's down: its foot never covers the trim, nor the trim it, when it turns)
  const ua=Math.min(.3,7/Math.max(L0,1)),Q=[ua,ua+(1-ua)*.25,ua+(1-ua)*.5,ua+(1-ua)*.75,1].map(at).map(T).map(P);
  ga(al,()=>{ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(Q[0][0],Q[0][1]);for(let j=1;j<Q.length;j++)ctx.lineTo(Q[j][0],Q[j][1]);ctx.strokeStyle=INK;ctx.lineWidth=4.6;ctx.stroke();ctx.strokeStyle=K.stem.b;ctx.lineWidth=2.6;ctx.stroke();
    // the spike: velvet, 15 long, ending 3 under the tip; over it the thin tip of the stem (in the second phase a puff of glowing down:
    // the spike swells, fades and the down grows out of it)
    const u1=1-3/L0,u0=u1-15/L0,s0=T(at(u0)),s1=T(at(u1)),q0=P(s0),q1=P(s1),fl=cl(A.fluff||0,0,1);
    if(fl<1)ga(1-fl,()=>{const sw=1+.4*fl;ctx.fillStyle=INK;hull(q0,(2.8+1.2)*sw,q1,(2.8+1.2)*sw);ctx.fill();ctx.fillStyle=K.spike.b;hull(q0,2.6*sw,q1,2.6*sw);ctx.fill();ctx.lineCap='round';
      ctx.strokeStyle=K.spike.d;ctx.lineWidth=1.6;seg([q0[0]+1.1,q0[1]+.5],[q1[0]+1.1,q1[1]+.5]);ctx.stroke();ctx.strokeStyle=K.spike.l;ctx.lineWidth=1.1;seg([q0[0]-1,q0[1]-.6],[q1[0]-1,q1[1]-.6]);ctx.stroke()});
    if(fl>0){const c=lerp3(s0,s1,.6);if(fl<1&&!LOWFX){const qq=P(c);shine(K.fluffGlow,qq[0],qq[1],16,.8*Math.sin(Math.PI*fl))}fluffDraw(V0,c,K,i,fl)}
    {const qt=P(T(tip));ctx.strokeStyle=INK;ctx.lineWidth=3;seg(q1,qt);ctx.stroke();ctx.strokeStyle=K.stem.l;ctx.lineWidth=1.2;seg(q1,qt);ctx.stroke()}})}
// a puff of glowing down (the cattails' spikes in the second phase): three soft round balls, a little different, no hard outline (k: its size)
function fluffDraw(V0,c,K,i,k){k=k==null?1:k;const q=V0.P(c);if(!LOWFX)shine(K.fluffGlow,q[0],q[1],12*k,.5);
  for(const[dx,dy,r] of[[-1.6,.6,3.6],[1.7,.3,3.4],[0,-1.6,3.9]]){const x=q[0]+(dx+.3*Math.sin(i*2.1+dx))*k,y=q[1]+dy*k,rr=r*k*(1+.06*Math.sin(i*1.7+r)),g=ctx.createRadialGradient(x-1,y-1.2,.4,x,y,rr);
    g.addColorStop(0,'#ffffff');g.addColorStop(.62,K.fluff);g.addColorStop(1,'rgba(242,200,144,.85)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,rr,0,TAU);ctx.fill()}
  ctx.strokeStyle='rgba(150,90,40,.28)';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(q[0],q[1]-.2,4.6*k,.2,Math.PI-.2);ctx.stroke()}

// ------------------------------------------------------------------ the throat sac (a lantern when the light runs into it)
function sacDraw(V0,q,r,A,K){const lt=cl(A.sacLit,0,1),ik=sstep(15,21,r),a0=ctx.globalAlpha;   // a small sac is a soft swelling of the throat; a big one a ball with its outline
  // (a small one melts into the cream of the chin at its edge: never a button or an egg on the chest)
  ctx.beginPath();ctx.arc(q[0],q[1],r,0,TAU);if(ik>=.98)ctx.fillStyle=grad3([q[0]-r,q[1]-r,q[0]+r,q[1]+r],K.sac);
  else{const g=ctx.createRadialGradient(q[0]-r*.2,q[1]-r*.25,r*.05,q[0],q[1],r);g.addColorStop(0,K.sac.l);g.addColorStop(.55,K.sac.b);g.addColorStop(.8,cmix(K.sac.b,K.sac.d,.5));g.addColorStop(1,`rgba(${C.rgbs(K.sac.b)},${(.15+.85*ik).toFixed(3)})`);ctx.fillStyle=g}
  ctx.fill();
  ctx.save();ctx.clip();
  // lit from inside like a paper lantern: bright in the middle, the stretched skin deeper in colour toward its rim; the fireflies in it
  if(lt>.02){const gc=`rgb(${K.sacGlow})`,g=ctx.createRadialGradient(q[0],q[1]+r*.12,r*.05,q[0],q[1],r);
    g.addColorStop(0,cmix(K.sacLit,gc,.3));g.addColorStop(.5,gc);g.addColorStop(.84,cmix(gc,K.sacRim,.5));g.addColorStop(1,K.sacRim);
    ctx.globalAlpha=a0*lt;ctx.fillStyle=g;ctx.fillRect(q[0]-r,q[1]-r,2*r,2*r);ctx.globalAlpha=a0;shine(K.sacGlow,q[0],q[1]+r*.12,r*.8,.3*lt);
    if(A.sacFly>.05)for(let i=0;i<4;i++){const a=(A.bt||0)*TAU*3+i*TAU/4,fq=[q[0]+Math.cos(a)*r*.55,q[1]+Math.sin(a)*r*.32+r*.12];
      shine(K.flyGlow,fq[0],fq[1],7,A.sacFly);ctx.fillStyle=`rgba(${C.rgbs(K.lcore)},${A.sacFly})`;ball(fq,1.7);ctx.fill()}}
  // the stretched skin: soft folds across its lower half and, on a big sac, the veins from the throat down; the shadow of the chin on top
  if(r>8){const fa=sstep(8,14,r);ctx.strokeStyle=lt>.02?cmix('#96783c',K.sacRim,lt):'#96783c';ctx.lineWidth=1.2;ctx.lineCap='round';ctx.globalAlpha=a0*(.45-.1*lt)*fa;
    for(const k of[.3,.62]){ctx.beginPath();ctx.ellipse(q[0],q[1]-r*.35,r*.92,r*(.55+k),0,.2*Math.PI,.8*Math.PI);ctx.stroke()}
    if(r>16){ctx.globalAlpha=a0*.3*sstep(16,24,r);ctx.lineWidth=1;for(const k of[-.6,-.25,.25,.6]){ctx.beginPath();ctx.ellipse(q[0],q[1],Math.abs(k)*r,r,0,k<0?Math.PI/2:-Math.PI/2,k<0?Math.PI*1.5:Math.PI/2);ctx.stroke()}}
    ctx.globalAlpha=a0}
  {const g=ctx.createLinearGradient(0,q[1]-r,0,q[1]-r*.3);g.addColorStop(0,`rgba(20,40,16,${.45*(.4+.6*ik)})`);g.addColorStop(1,'rgba(20,40,16,0)');ctx.fillStyle=g;ctx.fillRect(q[0]-r,q[1]-r,2*r,r*.7)}
  if(ik<1){const g=ctx.createLinearGradient(0,q[1]+r*.3,0,q[1]+r);g.addColorStop(0,'rgba(120,96,40,0)');g.addColorStop(1,`rgba(120,96,40,${.5*(1-ik)})`);ctx.fillStyle=g;ctx.fillRect(q[0]-r,q[1],2*r,r)}
  ctx.restore();
  if(ik>.02){ctx.beginPath();ctx.arc(q[0],q[1],r,0,TAU);ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.globalAlpha=a0*ik;ctx.stroke();ctx.globalAlpha=a0}
  ctx.fillStyle=`rgba(255,255,255,${.5*(.3+.7*ik)*(1-.4*lt)})`;ctx.beginPath();ctx.ellipse(q[0]-r*.38,q[1]-r*.3,r*.24,r*.13,-.5,0,TAU);ctx.fill()}

// ------------------------------------------------------------------ the arms and the hands
// the frame of a hand: u the way the fingers point, w the back of the hand, v across (the pose gives u and w, in the world or the body)
function handFrame(A,sd,X,lk){const u0=sd<0?A.huL:A.huR,w0=sd<0?A.hwL:A.hwR,u=nrm(lk<=0?u0:lerp3(u0,X.Rd(u0),lk));let w=lk<=0?w0:lerp3(w0,X.Rd(w0),lk);w=nrm(sub(w,mul(u,dot(w,u))));return{u,w,v:cross(w,u)}}
function armDraw(V0,X,A,K,sd,S,El,W,hc,HF,hideAt){const{P,F,D}=V0;
  // the upper arm and the forearm each hidden at its own depth (the shoulder goes into the belly, a hand on the belly stays in front of it)
  const hand=()=>behind(hideAt(sd,D(hc)),()=>handDraw(V0,A,K,sd,hc,HF),bbOf(V0,[hc],22)),dU=D(lerp3(S,El,.5)),dF=D(lerp3(El,W,.5)),
    up=()=>behind(hideAt(sd,dU),()=>limb3(V0,[S,El],[9.6,7.6],K.skin,K.rimc,2.6),bbOf(V0,[S,El],13)),fo=()=>behind(hideAt(sd,dF),()=>{limb3(V0,[El,W],[7.6,6.6],K.skin,K.rimc,2.6);const ax=nrm(sub(W,El));band(V0,add(W,mul(ax,-7)),add(W,mul(ax,-3)),7.4,K.gold,{r2:7.2,lw:2})},bbOf(V0,[El,W],11)),
    arm=()=>{if(dU<dF){up();fo()}else{fo();up()}};
  if(F(sub(hc,W))>0){arm();hand()}else{hand();arm()}}
// four fingers spread like a fan with round pads at the tips; they curl into a fist (curl), lift off (lf: drumming), the forefinger points
function handDraw(V0,A,K,sd,hc,HF){const{P,F}=V0,{u,v,w}=HF,cu=sd<0?A.curlL:A.curlR,lf=sd<0?A.lfL:A.lfR,pt=sd<0?A.ptL:A.ptR,ix=sd>0?1:2;
  const fingers=[];for(let j=0;j<4;j++){const isI=j===ix,c=pt>0?(isI?0:lerp(cu[j],1,pt)):cu[j],sp0=pt>0&&isI?(1-pt)*(j-1.5)*.42:(j-1.5)*.42*(1-.5*c),d=nrm(add(mul(u,Math.cos(sp0)),mul(v,Math.sin(sp0)))),
      b0=add(hc,add(mul(d,5-.8*c),mul(w,.5+.6*c))),Lf=(pt>0&&isI?6.5+3.5*pt:6.5)*(1-.62*c),e=add(b0,add(mul(d,Lf),mul(w,-1.2-4.2*c+4.5*lf[j])));fingers.push({b0,e,d,c})}
  const palm=()=>{const pts=[];for(let i=0;i<14;i++){const t=i/14*TAU;pts.push(P(add(hc,add(mul(u,Math.cos(t)*6.2),add(mul(v,Math.sin(t)*5.2),mul(w,Math.sin(t*2)*.3))))))}const H=chull(pts.concat([P(add(hc,mul(w,3)))]));
    ctx.lineJoin='round';smooth(H);ctx.fillStyle=grad3(bbox(H),K.skin);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke()};
  const fing=f=>{const a=P(f.b0),b=P(f.e),rp=3.2+.6*f.c,rf=2.2+1.3*f.c;ctx.beginPath();hullA(a,rf+1.2,b,rf+1.2);ballA(b,rp+1.1);ctx.fillStyle=INK;ctx.fill();
    ctx.beginPath();hullA(a,rf,b,rf);ballA(b,rp-.1);ctx.fillStyle=K.skin.b;ctx.fill();ctx.fillStyle=K.skin.l;ball([b[0]-rp*.3,b[1]-rp*.35],rp*.42);ctx.fill()};
  // the back of the hand toward us: all the fingers over the palm (a hand planted on the floor, nearly always); else all under it (one
  // test for the whole hand: turning, the fingers never reorder one by one)
  if(F(w)>0){palm();for(const f of fingers)fing(f)}else{for(const f of fingers)fing(f);palm()}}

// ------------------------------------------------------------------ the legs: the shin folded along the thigh, the webbed foot
function legDraw(V0,X,A,K,sd,g,hideAt){const{P,F,D}=V0,fl=A.flk,fd0=X.Rd(nrm([1,sd*.32,0])),fdG=nrm([fd0[0],fd0[1],0]),fd=fl>0?nrm(lerp3(fdG,X.Rd(nrm([-.2,sd*.9,-.3])),fl)):fdG,upv=fl>0?nrm(lerp3([0,0,1],X.Rd([0,0,1]),fl)):[0,0,1],
    fv=nrm(cross(upv,fd)),heel=add(g.fc,mul(fd,-6));
  const foot=()=>{const toes=[];for(let j=0;j<4;j++){const a=(j-1.5)*.36+sd*.08,d=nrm(add(mul(fd,Math.cos(a)),mul(fv,Math.sin(a)))),b0=add(heel,add(mul(d,8),mul(upv,1.2))),e=add(heel,add(mul(d,17+(j===1||j===2?2:0)),mul(upv,.8)));toes.push({b0,e,d})}
    // the web between the toes (darker), then the toes and the pads, the heel
    {const pts=[P(add(heel,mul(upv,1.5)))].concat(toes.map(t=>P(lerp3(t.b0,t.e,.85))));ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.fillStyle=K.web;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.lineJoin='round';ctx.stroke()}
    for(const t of toes){const a=P(t.b0),b=P(t.e);ctx.beginPath();hullA(a,2+1.1,b,1.8+1.1);ballA(b,2.7+1.1);ctx.fillStyle=INK;ctx.fill();ctx.beginPath();hullA(a,1.9,b,1.7);ballA(b,2.6);ctx.fillStyle=K.skin.b;ctx.fill();ctx.fillStyle=K.skin.l;ball([b[0]-.8,b[1]-1],1);ctx.fill()}
    {const pts=ellSil(V0,add(heel,add(mul(fd,3),mul(upv,2.5))),[8,6,3],{u:fd,v:fv,w:upv},null,12);smooth(pts);ctx.fillStyle=grad3(bbox(pts),K.skin);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke()}};
  const shin=()=>behind(hideAt(sd,D(lerp3(g.kn,g.an,.5))+4),()=>limb3(V0,[g.kn,g.an],[7,5.2],K.skin,K.rimc,2.5),bbOf(V0,[g.kn,g.an],10)),
    ft=()=>behind(hideAt(sd,D(add(heel,mul(fd,8)))),foot,bbOf(V0,[heel,add(heel,mul(fd,20))],13));
  if(F(fd)>0){shin();ft()}else{ft();shin()}}

// ------------------------------------------------------------------ the tongue: thick and pink, a round sticky tip with its light
// from the mouth m0 to its tip: o.tip from the game (on the screen, from the drawing's point), else in front of it (or the way of the sweep)
// The game gives the whole tip ([dx, dy] and, third, its height over the floor): the model draws the tongue to it as it is, never shorter
// (its own length t.l only without the game, and for the snap back of the stuck one). The head hides the parts of the tongue that are
// behind it, each piece at its own depth (from the mouth to the tip on the floor): the root slides behind the cheek bit by bit
function tongueGeo(V0,X,A,m0,o,SS){const{P,D}=V0,t=A.tongue,oT=o.tip?[o.tip[0]/SS,o.tip[1]/SS,(o.tip[2]!=null?o.tip[2]:8)/SS]:null;let st,b,sc=1,dTip;
  // the depth of a point on the screen at a known height (the inverse of the camera)
  const dAt=(q,z)=>{const ck=C.cam?C.cam.k:.55,cz=C.cam?C.cam.zk:1;return(q[1]+z*cz)/ck+ck/cz*z};
  if(t.mode==='sweep'){// hanging out of one corner of the mouth (h 1), then the lash across the front (its tip from the game, o.tip)
    const sd=t.side||1,h=t.h||0,corner=X.T(ellAt(BC,BR,FB,mouthDir(sd*.82,A,.06))),hangTip=add(corner,mul(X.Rd(nrm([.45,sd*.55,-.9])),17*Math.max(h,.2))),an=t.ang*Math.PI/180,
      own=add(m0,add(mul(X.Rd([Math.cos(an),Math.sin(an),0]),110*t.l),[0,0,-40*t.l])),lash=oT||P(own);
    st=lerp3([...P(corner),0],[...P(m0),0],1-h);b=lerp3([...P(hangTip),0],[lash[0],lash[1],0],1-h);sc=lerp(.75,1,1-h);dTip=lerp(D(hangTip),oT?dAt(oT,oT[2]):D(own),1-h)}
  else{st=P(m0);if(oT){const sn=t.mode==='stuck'&&t.snap;b=sn?lerp3([st[0],st[1],0],[oT[0],oT[1],0],t.l):[oT[0],oT[1],0];dTip=lerp(D(m0),dAt(oT,oT[2]),sn?t.l:1)}
    else{const q3=add(m0,add(mul(X.Rd([1,0,0]),96*t.l),[0,0,-40*t.l]));b=P(q3);dTip=D(q3)}}
  return{st,b,sc,dTip}}
function tongueDraw(V0,X,A,K,m0,G0,NB){const{D}=V0,t=A.tongue,{st,b,sc,dTip}=G0;
  const dx=b[0]-st[0],dy=b[1]-st[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,w=(t.wob||0)*5,mid=[(st[0]+b[0])/2+nx*(L*.08+w),(st[1]+b[1])/2+ny*(L*.08+w)-L*.06];
  // the curve in 16 steps, four pieces of four (each piece hidden behind the head at its own depth)
  const Q=[];for(let i=0;i<=16;i++){const u=i/16,a=(1-u)*(1-u),bb=2*u*(1-u),c=u*u;Q.push([a*st[0]+bb*mid[0]+c*b[0],a*st[1]+bb*mid[1]+c*b[1]])}
  const d0=D(m0),regs=[0,1,2,3].map(i=>NB?nearAt(NB,lerp(d0,dTip,(i+.5)/4)):null),tipReg=NB?nearAt(NB,dTip):null,rr=8*sc*(t.mode==='out'?sstep(0,.18,t.l):1);
  const strokes=(pts,cap)=>{const path=(ox,oy)=>{ctx.beginPath();ctx.moveTo(pts[0][0]+ox,pts[0][1]+oy);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0]+ox,pts[i][1]+oy)};ctx.lineCap=cap;ctx.lineJoin='round';
    path(0,0);ctx.strokeStyle=INK;ctx.lineWidth=12*sc;ctx.stroke();ctx.strokeStyle=K.tongue.b;ctx.lineWidth=8*sc;ctx.stroke();
    path(-.8,-1.6);ctx.strokeStyle=`rgba(${C.rgbs(K.tongue.l)},.8)`;ctx.lineWidth=2.2*sc;ctx.stroke();path(.8,2);ctx.strokeStyle=`rgba(${C.rgbs(K.tongue.d)},.5)`;ctx.lineWidth=1.6*sc;ctx.stroke()};
  const tip=()=>{if(t.mode==='stuck'&&!t.snap){ctx.fillStyle='rgba(255,170,195,.6)';ctx.beginPath();ctx.ellipse(b[0],b[1]+3,13,5.5,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,220,230,.5)';ctx.beginPath();ctx.ellipse(b[0]-4,b[1]+2,4,1.4,0,0,TAU);ctx.fill()}
    if(rr>.5){shine(K.tipGlow,b[0],b[1],rr*2,.35);tball(b,rr,T3(K.tipBall,K.tongue.b,K.tongue.d),null,2.4);ctx.fillStyle='rgba(255,255,255,.75)';ball([b[0]-rr*.35,b[1]-rr*.38],rr*.28);ctx.fill()}};
  if(!regs.some(r=>r)&&!tipReg){strokes(Q,'round');tip();return}
  for(let i=0;i<4;i++){const pts=Q.slice(i*4,i*4+5);behind([regs[i]],()=>strokes(pts,'butt'),bbOf0(pts,8*sc))}
  behind([tipReg],tip,[b[0]-16,b[1]-14,b[0]+16,b[1]+12])}
const bbOf0=(pts,m)=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of pts){if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1]}return[x0-m,y0-m,x1+m,y1+m]};

// ------------------------------------------------------------------ a firefly: a dark round body, two wings, the tail that glows
function flyAt(q,k,K,s,p2){s=s||1;k=cl(k,0,1);const tail=[q[0]+1.6*s,q[1]+1.4*s];if(!LOWFX)shine(p2?'255,150,50':K.flyGlow,tail[0],tail[1],8*s*(.7+.5*k),.55+.35*k);
  ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.ellipse(q[0]-1.6*s,q[1]-2.4*s,2.4*s,1.3*s,-.6,0,TAU);ctx.ellipse(q[0]+.6*s,q[1]-2.8*s,2.4*s,1.3*s,.5,0,TAU);ctx.fill();
  ctx.fillStyle=p2?'#ffd08a':K.ftail;ctx.strokeStyle='rgba(30,24,10,.8)';ctx.lineWidth=.8;ball(tail,1.9*s*(.85+.25*k));ctx.fill();ctx.stroke();
  ctx.fillStyle=K.fly;ball(q,1.7*s);ctx.fill();ctx.fillStyle='rgba(255,255,255,.8)';ball([tail[0]-.5*s,tail[1]-.6*s],.6*s);ctx.fill()}

// ------------------------------------------------------------------ the room's things of the defeat: the crown and the heap of velvet
function floorThings(V0,A,K,p,fx){const{P}=V0,T0=[26,-50,0];
  if(A.heap>0)heapDraw(V0,K,A.capeOff,1-sstep(.93,1,p));
  if(A.crownAt&&A.crownAt.die>=1){crownFree(V0,[T0[0],T0[1],3.2],1.1,1.25,K,A);
    // a firefly lands on it and blinks
    // (it blinks once a second, the same blink the game keeps when the crown stays on the floor: N3.toadFly with the phase t)
    if(p>.93&&!LOWFX){const k=cl((p-.93)/.05,0,1),q=P(lerp3([T0[0]+18,T0[1]-10,40],[T0[0]+2,T0[1]+1,14],ez(k)));flyAt(q,.5+.5*Math.sin(p*TAU*4),K,1,false)}}}

// ------------------------------------------------------------------ the effects of the moves (only when the game does not draw its own)
function fxDraw(V0,X,L,e,A,K,J,lift,o){const{P,D}=V0,t=e.t;
  if(e.k==='splash'){// water and mud thrown out of the floor: drops on arcs, a low crown of spray
    const c=e.at,n=e.n||6,r=e.r||10;for(let i=0;i<n;i++){const a=i/n*TAU+.3,d=r*(.55+1.1*t),u=cl(t*1.2,0,1),z=(e.big?26:12)*Math.sin(Math.PI*u)*(.6+.4*((i*7)%3)/2),q3=[c[0]+Math.cos(a)*d,c[1]+Math.sin(a)*d,Math.max(0,z)],up=Math.cos(Math.PI*u);
      L.add(D(q3)+(D(q3)>D(X.T(BC))?1000:-1000),()=>{const q=P(q3),al=1-sstep(.6,1,t),s0=(e.big?2.4:1.7)*(1-.35*t);ctx.fillStyle=i%3?`rgba(150,200,170,${.75*al})`:`rgba(${K.splash},${.85*al})`;
        // a drop: round below, drawn out along its flight
        ctx.beginPath();ctx.ellipse(q[0],q[1]+up*s0*.4,s0,s0*(1+.7*Math.abs(up)),0,0,TAU);ctx.fill();ctx.fillStyle=`rgba(255,255,255,${.6*al})`;ball([q[0]-s0*.3,q[1]-s0*.3],s0*.3);ctx.fill()})}}
  else if(e.k==='ring'){L.add(-3000,()=>{const r=(e.r||30)*(.3+t*(e.lo?1.2:2)),pts=[],c=e.world?[0,0]:[A.B[0],A.B[1]];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push(P([c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r,0]))}ctx.strokeStyle=`rgba(${e.rgb},${.6*(1-t)})`;ctx.lineWidth=3*(1-t)+1;C.poly(pts);ctx.stroke()})}
  else if(e.k==='drips'){for(let i=0;i<4;i++){const u=(t*2+i/4)%1,c=X.T([(i-1.5)*10,(i%2?1:-1)*24,10]),q3=[c[0],c[1],c[2]-u*40];if(q3[2]<0)continue;L.add(D(q3)+2000,()=>{const q=P(q3);ctx.fillStyle=`rgba(170,215,190,${.8*(1-u)})`;ball(q,1.5);ctx.fill()})}}
  else if(e.k==='bubbles'){// the froth of the burp: small bubbles out of the mouth along the game's rows, dropping toward the height the game's
    // bubbles fly at and fading as those come in (the game draws the real ones from the mouth on)
    const m0=X.T(ellAt(BC,BR,FB,mouthDir(0,A,.2))),fw=X.Rd([1,0,0]),sd=X.Rd([0,1,0]),wA=A.k2>.5?30:20;for(let i=0;i<5;i++){const u=cl(t*1.6-i*.12,0,1);if(u<=0||u>=1)continue;
      const an=(i-2)*wA*Math.PI/180,d=6+u*22,dz=-(m0[2]-14)*Math.min(1,d/40),q3=add(m0,add(add(mul(fw,Math.cos(an)*d),mul(sd,Math.sin(an)*d)),[0,0,dz])),al=1-sstep(.4,1,u);
      L.add(D(q3)+1500,()=>ga(al,()=>bubbleAt(P(q3),4+1.5*(i%2),i+t*6,K,A.k2>.5,0)))}}
  else if(e.k==='jet'){// fireflies spurting out of the mouth to the sky (the game's own come in over the first 40 px: these fade)
    const m0=X.T(ellAt(BC,BR,FB,mouthDir(0,A,.2)));for(let i=0;i<6;i++){const u=cl(t*1.5-i*.08,0,1);if(u<=0||u>=1)continue;const q3=add(m0,[Math.cos(i*2.1)*6*u,Math.sin(i*2.1)*6*u,8+u*40]),al=1-sstep(.5,1,u);
      L.add(D(q3)+2000,()=>ga(al,()=>flyAt(P(q3),.8,K,1,true)))}}
  else if(e.k==='mud'||e.k==='mud2'){const c=e.at;for(let i=0;i<5;i++){const a=i*1.3+.4,v=10+i*3,q3=[c[0]+Math.cos(a)*v*t,c[1]+Math.sin(a)*v*t,4+30*t-50*t*t];if(q3[2]<0)continue;
      L.add(D(q3)+(D(q3)>D(X.T(BC))?1000:-1000),()=>{const q=P(q3);ctx.fillStyle='#4a3a26';ctx.strokeStyle=INK;ctx.lineWidth=1;ball(q,2.2-i*.2);ctx.fill();ctx.stroke()})}}
  else if(e.k==='seeds'){// the spikes burst into glowing down: a little cloud of seeds that stays round it
    for(let i=0;i<10;i++){const b=CTT[i%7],u=t,a=i*2.4,q3=X.T([b[0]-6+Math.cos(a)*24*Math.sqrt(u),b[1]+Math.sin(a)*24*Math.sqrt(u),b[2]-10+10*Math.sin(u*3+i)]);
      L.add(D(q3)+1800,()=>{const q=P(q3),al=1-sstep(.7,1,u);if(!LOWFX)shine(K.fluffGlow,q[0],q[1],6,.5*al);ctx.fillStyle=`rgba(255,244,220,${al})`;ball(q,1.6);ctx.fill()})}}
  else if(e.k==='fountain'){// the huge burp of the defeat: a spiral fountain of fireflies out of the mouth (the game takes them over)
    const m0=X.T(ellAt(BC,BR,FB,mouthDir(0,A,.2)));for(let i=0;i<12;i++){const u=cl((t-i*.03)/.67,0,1);if(u<=0||u>=1)continue;const s=.7+.3*((i*7)%5)/4,ue=1-(1-u)*(1-u),a=i*2.4+ue*2.2,r=5+ue*(26+22*s),
        q3=add(m0,[Math.cos(a)*r,Math.sin(a)*r,10+ue*(80+30*s)]),fade=sstep(0,.06,u)*(1-sstep(.8,1,u));
      L.add(D(q3)+2000,()=>{const a0=ctx.globalAlpha;ctx.globalAlpha=a0*fade;flyAt(P(q3),.7+.3*Math.sin(i+u*9),K,.9+.2*s,false);ctx.globalAlpha=a0})}
    if(t<.3&&!LOWFX)L.add(2500,()=>{const q=P(m0);shine('214,255,90',q[0],q[1],60,.6*(1-t/.3))})}
  else if(e.k==='crownfly'){}}
// a bubble: clear, a thin dark green edge, a white arc of light, a bluish film, a firefly blinking in it; pop 0..1 bursts it
function bubbleAt(q,r,ph,K,p2,pop){if(pop>0){const u=pop,al=1-u;ctx.strokeStyle=`rgba(${p2?'255,190,110':'214,255,140'},${al})`;ctx.lineWidth=2*(1-u)+.6;ctx.beginPath();ctx.arc(q[0],q[1],r*(1+u*.8),0,TAU);ctx.stroke();
    ctx.fillStyle=`rgba(200,240,255,${al})`;for(let i=0;i<4;i++){const a=i*TAU/4+.5,d=r*(1+u*1.5);ball([q[0]+Math.cos(a)*d,q[1]+Math.sin(a)*d+u*4],1.3*(1-u)+.3);ctx.fill()}return}
  ctx.fillStyle='rgba(190,240,255,.2)';ball(q,r);ctx.fill();const k=.5+.5*Math.sin(ph*TAU*.5);if(!LOWFX)shine(p2?'255,150,50':K.flyGlow,q[0],q[1]+r*.15,r*1.4,.35+.35*k);
  ctx.fillStyle=p2?'#ffd08a':K.ftail;ball([q[0]+r*.1,q[1]+r*.15],r*.22*(.8+.3*k));ctx.fill();ctx.fillStyle=K.fly;ball([q[0]-r*.12,q[1]+r*.05],r*.16);ctx.fill();
  ctx.strokeStyle='rgba(30,70,40,.85)';ctx.lineWidth=1.1;ball(q,r);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=1.3;ctx.lineCap='round';ctx.beginPath();ctx.arc(q[0],q[1],r*.68,Math.PI*1.1,Math.PI*1.45);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.7)';ball([q[0]+r*.42,q[1]+r*.38],r*.09+.3);ctx.fill()}

// ------------------------------------------------------------------ for the game: the pieces of its attacks, with the same look
// N3.toadBubble(x, y, z, r, ph, sc, o): a big clear bubble with a firefly blinking in it (ph); o.p2 an orange one; o.pop 0..1 bursts it
N3.toadBubble=function(x,y,z,r,ph,sc,o){o=o||{};sc=sc||1;ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);bubbleAt([0,0],r||10,ph||0,pal(o.p2?1:0,0),!!o.p2,o.pop||0);ctx.restore()};
// N3.toadFly(x, y, z, k, sc, o): a firefly; k is the phase of its blink, in cycles (it grows with the time: .5+.5 sin(k·2π) is how bright it
// is); o.p2 an ember; o.fall 0..1: the streak of light it leaves falling from the sky
N3.toadFly=function(x,y,z,k,sc,o){o=o||{};sc=sc||1;const K=pal(o.p2?1:0,0);ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);
  if(o.fall>0){const u=o.fall,g=ctx.createLinearGradient(0,-90,0,0);g.addColorStop(0,`rgba(${o.p2?'255,150,50':'214,255,90'},0)`);g.addColorStop(1,`rgba(${o.p2?'255,200,120':'240,255,170'},${.75*Math.min(1,u*2)})`);ctx.strokeStyle=g;ctx.lineWidth=3;ctx.lineCap='round';seg([0,-90*Math.min(1,u*1.5)],[0,0]);ctx.stroke()}
  flyAt([0,0],k==null?.6:.5+.5*Math.sin(k*TAU),K,1,!!o.p2);ctx.restore()};
// N3.toadMud(x, y, r, k, sc, o): the patch of mud of the belly flop (k 0..1 its life: it spreads, stays wet and glossy with two little
// bubbles, then dries with a lighter crust and fades); darker than the floor, so it reads as a wet hole
N3.toadMud=function(x,y,r,k,sc,o){sc=sc||1;r=r||24;k=cl(k||0,0,1);const g0=sstep(0,.1,k),dry=sstep(.75,1,k),al=1-sstep(.9,1,k),R=r*(.4+.6*g0),ry=R*.55*KR();if(al<=0)return;
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.globalAlpha*=al;const pts=[];for(let i=0;i<14;i++){const a=i/14*TAU,rr=1+.1*Math.sin(i*2.3+r)+.06*Math.cos(i*3.1);pts.push([Math.cos(a)*R*rr,Math.sin(a)*ry*rr])}
  smooth(pts);ctx.fillStyle=cmix('#3a2a1c','#6a5a40',dry*.6);ctx.fill();ctx.strokeStyle=`rgba(201,183,140,${.8*(1-dry*.5)})`;ctx.lineWidth=2;ctx.stroke();
  if(dry<.9){ctx.globalAlpha*=1-dry;ctx.fillStyle='rgba(160,138,98,.55)';ctx.beginPath();ctx.ellipse(-R*.3,-ry*.35,R*.35,ry*.18,-.2,0,TAU);ctx.fill();
    for(const[a,b,s] of[[.3,.1,1],[-.1,.3,.7]]){const bq=[R*a,ry*b],bs=(2.2*s)*(.6+.4*Math.sin(k*TAU*3+a*9));ctx.strokeStyle='rgba(201,183,140,.8)';ctx.lineWidth=.8;ball(bq,bs);ctx.stroke()}}
  if(dry>0){ctx.globalAlpha=al*dry;ctx.strokeStyle='rgba(150,130,96,.8)';ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<4;i++){const a=i*1.6+.3;ctx.moveTo(Math.cos(a)*R*.15,Math.sin(a)*ry*.15);ctx.lineTo(Math.cos(a+.3)*R*.6,Math.sin(a+.3)*ry*.6)}ctx.stroke()}
  ctx.restore()};
// N3.toadCrown(x, y, z, rot, sc, o): the crown on its own, fallen on its side (the one left on the floor after the defeat); rot is the face
// the boss had (the same view the model's defeat draws it with, so it never turns when the game bakes it into the floor)
N3.toadCrown=function(x,y,z,rot,sc,o){o=o||{};sc=sc||1;const V0=V(rot==null?Math.PI/2:rot);ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);crownFree(V0,[0,0,3.2],1.1,1.25,pal(0,0),{});ctx.restore()};

reg('toad2',{n:'Re Rospo',g:'boss',sc:1,an:MV.slice(),dur:Object.assign({},DUR),
  lab:{idle:'Fermo',walk:'Avanza',hit:'Colpito',tongue:'Linguata',stuck:'Lingua incollata',sweep:'Frustata',flop:'Panciata',bubbles:'Rutto di bolle',drum:'Tamburo di pancia',
    rain:'Pioggia di lucciole',rage:'Furia (fase 2)',taunt:'Presa in giro',enter:'Entrata',die:'Sconfitta'}},toad2);
// «Prima e dopo»: the King Toad of today
{const OLD=N3.toad,M0=N3.meta.toad;if(OLD&&M0)N3.meta.toad2.old=(x,y,f,a,pp)=>OLD(x,y,f,M0.an.includes(a)?a:'idle',pp,M0.sc||1,{})}
})();
