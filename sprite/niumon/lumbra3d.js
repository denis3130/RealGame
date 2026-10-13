// Lumbra, il Niumon d'ombra, in 3D nello stile dei mostri di Mossbound (cassetta C3 di sprite/nemici3d/base3d.js, scheletro proiettato
// con V(face) di CR._rig): la sua versione «a volumi» chiesta da Denis il 13 ottobre («una tua versione del niumon», uguale al disegno ma
// nel mio stile). Proporzioni, testa, cresta e code di fumo ricalcate sul suo disegno di lato (1 unità = 25 px del disegno); la faccia
// è quella del disegno di fronte (occhi viola a mandorla, cattivi, sorrisetto a «w»). Dipinto come gli altri mostri: colori pieni,
// contorno scuro, tre toni con la luce calda dall'alto a sinistra, bordo illuminato; niente grana a matita.
// Le fiamme del pelo sono volumi veri, come si fa quando un disegno diventa un modello 3D: ciuffi che escono dal corpo, salgono, si
// piegano all'indietro e chiudono la punta a uncino (le onde del disegno). Corpo e ciuffi sono dipinti come un pezzo solo (prima tutti i
// contorni, poi tutti i colori), così il contorno spesso sta solo sulla sagoma; i ciuffi davanti al corpo hanno una linea sottile.
// Firma N3.lumbra(x, y, face, anim, p, sc, o); per ora solo 'idle' (respira, si guarda intorno, sbatte gli occhi, le fiamme tremano).
(()=>{const C=C3,{TAU,cl,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,frame,look,blink,rotX,rotY,rotZ,cmix,chull,bbox,parts,reg,ik,rim,softBox,rimPoly,poly,sstep}=C;
const shadeLimb=CR._rig.shadeLimb;

// ------------------------------------------------------------------ colours: grey fur, violet smoke, violet eyes (from the drawings)
const LC={fur:'#a19bab',furD:'#4a4456',head:'#b3adbb',smoke:'#8a63d6',smokeL:'#c9b2f6',
  irisD:'#3b2b78',iris:'#8a63e0',irisL:'#d9c9fc',pupil:'#15111c',sock:'#2a2236',shadow:'40,28,70'};
// the outline on the silhouette (visible width, body units) and the thin line of a tuft lying in front of the body
const OW=.85,IW=.45;

// ------------------------------------------------------------------ geometry
function catmull(P,n){const out=[];for(let i=0;i<P.length-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)];
  for(let j=0;j<n;j++){const t=j/n,t2=t*t,t3=t2*t;out.push(p1.map((_,k)=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3)))}}
  out.push(P[P.length-1].slice());return out}
function ringFrame(R,i){const a=R[Math.max(0,i-1)],b=R[Math.min(R.length-1,i+1)];let tx=b[0]-a[0],tz=b[1]-a[1];const tl=Math.hypot(tx,tz)||1;tx/=tl;tz/=tl;
  let nx=-tz,nz=tx;if(nz<0||(Math.abs(nz)<1e-6&&nx<0)){nx=-nx;nz=-nz}return[nx,nz]}
// a body swept along a spine in the x-z plane: [x, z, r, ry] (spine point, radius across it in that plane, half width); egg-shaped rings
function sweep(V0,T,S,egg){const R=catmull(S,3),out=[],e=egg||0;let prev=null;
  for(let i=0;i<R.length;i++){const[nx,nz]=ringFrame(R,i),r=R[i],ring=[];for(let j=0;j<20;j++){const t=j/20*TAU,c=Math.cos(t),s=Math.sin(t);ring.push(V0.P(T([r[0]+nx*c*r[2],s*r[3]*(1-e*c),r[1]+nz*c*r[2]])))}
    if(prev)out.push(chull(prev.concat(ring)));prev=ring}
  return out}
// a point on such a body (k along it 0..1, angle an round it from the up side, sd the side), sunk by sink, and its outward normal
function onSweep(S,k,an,sd,sink,egg){const R=catmull(S,3),e=egg||0,f=(kk,aa)=>{const u=cl(kk,0,1)*(R.length-1),i=Math.min(R.length-2,Math.floor(u)),q=u-i,r=R[i].map((v,j)=>lerp(v,R[i+1][j],q)),
    [nx,nz]=ringFrame(R,i),c=Math.cos(aa),s=Math.sin(aa);return[r[0]+nx*c*r[2],s*r[3]*(1-e*c)*sd,r[1]+nz*c*r[2]]},p=f(k,an),
    dk=sub(f(k+.02,an),f(k-.02,an)),da=sub(f(k,an+.05),f(k,an-.05)),u=cl(k,0,1)*(R.length-1),i=Math.min(R.length-2,Math.floor(u)),mid=[lerp(R[i][0],R[i+1][0],u-i),0,lerp(R[i][1],R[i+1][1],u-i)];
  let n=nrm(cross(da,dk));if(dot(n,sub(p,mid))<0)n=mul(n,-1);return{p:sub(p,mul(n,sink||0)),n}}
function oval(V0,T,Cc,Rd){const o=V0.P(T(Cc)),Lc=[0,1,2].map(i=>{const e=[0,0,0];e[i]=Rd[i];const q=V0.P(T(add(Cc,e)));return[q[0]-o[0],q[1]-o[1]]});
  let a=0,b=0,d=0;for(const l of Lc){a+=l[0]*l[0];b+=l[0]*l[1];d+=l[1]*l[1]}const m=(a+d)/2,r=Math.sqrt(((a-d)/2)**2+b*b),rot=.5*Math.atan2(2*b,a-d),rx=Math.sqrt(m+r),ry=Math.sqrt(Math.max(.01,m-r));
  return{c:o,rx,ry,rot,path:()=>{ctx.beginPath();ctx.ellipse(o[0],o[1],rx,ry,rot,0,TAU)},sub:()=>{ctx.moveTo(o[0]+rx*Math.cos(rot),o[1]+rx*Math.sin(rot));ctx.ellipse(o[0],o[1],rx,ry,rot,0,TAU)},
    pts:n=>{const P=[];for(let i=0;i<n;i++){const t=i/n*TAU,c=Math.cos(t)*rx,s=Math.sin(t)*ry;P.push([o[0]+c*Math.cos(rot)-s*Math.sin(rot),o[1]+c*Math.sin(rot)+s*Math.cos(rot)])}return P}}}
const polyPath=pts=>()=>{ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.closePath()};
const polySub=pts=>{ctx.moveTo(pts[0][0],pts[0][1]);for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.closePath()};
function capsule(a,ra,b,rb){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);ra=Math.max(.05,ra);rb=Math.max(.05,rb);ctx.beginPath();
  if(d<=Math.abs(ra-rb)+.01){const q=ra>=rb?a:b;ctx.arc(q[0],q[1],Math.max(ra,rb),0,TAU);return}
  const an=Math.atan2(dy,dx),f=Math.acos(cl((ra-rb)/d,-1,1));ctx.arc(a[0],a[1],ra,an+f,an+TAU-f);ctx.arc(b[0],b[1],rb,an-f,an+f);ctx.closePath()}

// ------------------------------------------------------------------ tubes (tufts, smoke, legs): screen points P2 and radii rs
// the outline of a tube on the screen as one line: down one side from the root, round the tip, back up the other side (not across the root)
function tubeEdge(P2,rs){const n=P2.length,Lp=[],Rp=[];for(let i=0;i<n;i++){const a=P2[Math.max(0,i-1)],b=P2[Math.min(n-1,i+1)];let tx=b[0]-a[0],ty=b[1]-a[1];const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;
    Lp.push([P2[i][0]-ty*rs[i],P2[i][1]+tx*rs[i]]);Rp.push([P2[i][0]+ty*rs[i],P2[i][1]-tx*rs[i]])}
  return Lp.concat(Rp.reverse())}
// a tuft's spine: it leaves the surface at base along n, bends toward w (over the angle `bend`, mostly near the tip, so the tip hooks
// back down like the waves of the drawing), length L, base radius r0 tapering to a point
function tuft(base,n,w,L,r0,bend,N){N=N||12;n=nrm(n);w=sub(w,mul(n,dot(w,n)));w=len(w)<1e-3?nrm(cross(n,[0,1,0])):nrm(w);const pts=[],rs=[];let p=sub(base,mul(n,r0*.45));
  for(let i=0;i<=N;i++){const s=i/N,th=.12*bend*s+.88*bend*Math.pow(s,2.8);if(i)p=add(p,mul(add(mul(n,Math.cos(th)),mul(w,Math.sin(th))),L/N));pts.push(p);rs.push(r0*Math.pow(1-s,.9)+.1)}
  return{pts,rs}}
// a group painted as one piece: shapes (closed paths) and tubes ({P2, rs, back, near, fill}); every outline first, then the tubes behind,
// the shapes, the tubes in front, the thin line round the tubes lying in front of the body, the tones of the tubes
function piece(shapes,tubes,fill){ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=OW*2;for(const f of shapes){f();ctx.stroke()}
  ctx.fillStyle=INK;for(const t of tubes){for(let i=0;i<t.P2.length-1;i++){capsule(t.P2[i],t.rs[i]+OW,t.P2[i+1],t.rs[i+1]+OW);ctx.fill()}}
  for(const t of tubes)if(t.back)tubeFill(t);
  ctx.fillStyle=fill;for(const f of shapes){f();ctx.fill()}
  for(const t of tubes)if(!t.back)tubeFill(t)}
function tubeFill(t){ctx.fillStyle=t.fill;for(let i=0;i<t.P2.length-1;i++){capsule(t.P2[i],t.rs[i],t.P2[i+1],t.rs[i+1]);ctx.fill()}
  if(!LOWFX&&!t.flat)shadeLimb(t.P2,t.rs,t.dark||'rgba(29,23,41,.22)',t.light==null?.2:t.light);
  if(t.near){const E=tubeEdge(t.P2,t.rs),k=Math.max(2,Math.round(t.P2.length*.18));ctx.strokeStyle=INK;ctx.lineWidth=IW;ctx.lineJoin='round';ctx.lineCap='round';
    ctx.beginPath();const m=E.length;for(let i=k;i<m-k;i++)ctx.lineTo(E[i][0],E[i][1]);ctx.stroke()}}
// the soft shadow of the outside falling inside a piece (dark away from the light, light toward it): its three tones. clip: the piece's
// subpaths; hull: a simple outline round it
function innerShade(clip,hull,dark,light){if(LOWFX)return;const bb=bbox(hull),m=ctx.getTransform(),s=Math.hypot(m.a,m.b),R=Math.max(bb[2]-bb[0],bb[3]-bb[1]),M=R*.8;
  const ring=()=>{ctx.beginPath();ctx.rect(bb[0]-M,bb[1]-M,bb[2]-bb[0]+2*M,bb[3]-bb[1]+2*M);polySub(hull)};
  ctx.save();ctx.beginPath();clip();ctx.clip('nonzero');ctx.fillStyle='#000';
  if(dark){ctx.shadowColor=dark;ctx.shadowBlur=R*.15*s;ctx.shadowOffsetX=-R*.06*s;ctx.shadowOffsetY=-R*.08*s;ring();ctx.fill('evenodd')}
  if(light){ctx.shadowColor=light;ctx.shadowBlur=R*.12*s;ctx.shadowOffsetX=R*.05*s;ctx.shadowOffsetY=R*.06*s;ring();ctx.fill('evenodd')}
  ctx.restore()}

// ------------------------------------------------------------------ the flame curls of the fur, traced on Denis's drawing (u: up from the
// root, v: toward the side the curl falls to): 'wave' a breaking wave whose tip hooks back down; 'blade' a long thin crescent (by the
// eyes). Seen from in front or behind a curl turns smoothly into a symmetric flame (SYM), so it never flips. They are added to the piece
// they grow from and painted with it (all the outlines first, then all the colours): on the silhouette they make the drawing's flaming
// edge; where they lie over the body they melt into it
const CURL={wave:[[-.35,-.55],[-.04,-.55],[.12,-.44],[.45,-.4],[.73,-.27],[.91,0],[1,.36],[.98,.73],[.91,1],[.73,1.18],[.6,1.15],[.55,.95],[.67,.85],[.73,.64],[.64,.4],[.36,.36],[.09,.4],[-.04,.55],[-.35,.55]],
  blade:[[-.3,-.22],[0,-.22],[.28,-.22],[.56,-.14],[.8,.02],[.96,.22],[1.02,.4],[.86,.24],[.6,.13],[.32,.14],[0,.2],[-.3,.2]]};
const SYM={};for(const k in CURL){const T=CURL[k],n=T.length,u0=Math.min(...T.map(q=>q[0])),u1=Math.max(...T.map(q=>q[0])),vm=T.reduce((s,q)=>s+q[1],0)/n,h=(n-1)/2,
  W=.5*(Math.max(...T.map(p=>p[1]))-Math.min(...T.map(p=>p[1])));SYM[k]=T.map((q,i)=>{const t=i<=h?i/h:(n-1-i)/h,u=u0+(u1-u0)*t,w=(T[0][1]<T[n-1][1]?1:-1)*W*Math.pow(Math.max(0,1-Math.pow(Math.max(0,t-.04)/.96,1.8)),.8);return[u,vm*.3+(i<=h?-w:w)]})}
// a curl on the screen from its root b (3D), rise d and the way it falls c (3D directions), height L, width W
function curl(V0,b,d,c,L,W,kind,sway){const q=V0.P(b),o=V0.P(0,0,0),Pd=sub(V0.P(d),o),Pc=sub(V0.P(c),o),dl=Math.hypot(Pd[0],Pd[1]),ud=dl>1e-4?[Pd[0]/dl,Pd[1]/dl]:[0,-1],ul=Math.max(dl,.5),pp=[-ud[1],ud[0]];
  const a=Pc[0]*ud[0]+Pc[1]*ud[1],bb=Pc[0]*pp[0]+Pc[1]*pp[1],t=cl(Math.abs(bb)/.6,0,1),b2=(bb>=0?1:-1)*Math.max(Math.abs(bb),.6),U=[ud[0]*ul*L,ud[1]*ul*L],Wv=[(ud[0]*a*.35+pp[0]*b2)*W,(ud[1]*a*.35+pp[1]*b2)*W];
  const T=CURL[kind]||CURL.wave,Sm=SYM[kind]||SYM.wave,k=t*t*(3-2*t);
  return T.map(([u,v],i)=>{if(k<1){u=lerp(Sm[i][0],u,k);v=lerp(Sm[i][1]*(bb>=0?1:-1),v,k)}v+=(sway||0)*u*u;return[q[0]+U[0]*u+Wv[0]*v,q[1]+U[1]*u+Wv[1]*v]})}
function smoothPath(pts){const n=pts.length,m=i=>[(pts[i][0]+pts[(i+1)%n][0])/2,(pts[i][1]+pts[(i+1)%n][1])/2];ctx.beginPath();let s=m(n-1);ctx.moveTo(s[0],s[1]);
  for(let i=0;i<n;i++){const e=m(i);ctx.quadraticCurveTo(pts[i][0],pts[i][1],e[0],e[1])}ctx.closePath()}
// the curls of a swept body: rings at k (0..1 along it), all round each ring; rise = the surface normal leaning up/back, fall = backward
// (up on the belly). Only those near the silhouette are kept (the others would hide inside the body anyway). Returns shapes for piece()
function furCurls(V0,T,R,S,egg,ks,ans,size,fk,i0,lean){const out=[];let i=i0||0;
  for(const k of ks)for(const an of ans)for(const sd of an===0||an>3.1?[1]:[-1,1]){const q=onSweep(S,k,an,sd,.25,egg),v=V0.F(R(q.n));i++;if(Math.abs(v)>.5)continue;
    const up=an>2.2?[-.6,0,-.5]:[-.35,0,.35],rise=nrm(add(q.n,mul(up,lean==null?.6:lean))),fall=an>2.2?[-1,0,.6]:[-1,0,.1],L=size(k,an);
    const pts=curl(V0,T(q.p),R(rise),R(fall),L,L*.78,'wave',fk(i,.1));out.push(()=>smoothPath(pts))}
  return out}

// ------------------------------------------------------------------ the body (units: 1 = 25 px of Denis's drawings; x forward, y right, z up)
const TSW=[[14.6,13.8,1.8,2],[13.8,14,4.8,4],[11.8,14.8,6.8,5.3],[8.6,15.8,7.6,5.7],[4.5,16.3,7.3,5.5],[1,16.5,6.7,5.2],[-2,16.4,6.1,4.9],[-4.8,15.7,5.2,4.8],[-7.4,14.8,4.2,4.5],[-9.4,14.2,3.2,3.8],[-10.6,14,1.7,2.3],[-11,14,.5,.7]];
// the head (head frame, origin HPOS in the body): a teardrop from the face up and back to the top of the head; cheeks and snout; the crest
const HPOS=[11.8,0,20.2];
const TEAR=[[2.4,-1.6,6.6,6.6],[1.4,1.2,6.3,6.3],[.2,3.4,5.7,5.4],[-1.2,5.6,4.6,4.2],[-2.6,7.2,3.4,3.1],[-3.6,8.2,2.2,2.2]];
const CHEEK=[[1.6,0,-3.6],[5.2,6.8,3.8]],SNOUT=[[6.6,0,-5],[1.7,2.2,1.5]];
// the crest (head frame [x, z, radius]): up from the top of the head, back, and the tip hooked down (traced on the side view)
const CREST=[[-1,4.6,4],[-1.8,7.6,3.4],[-3,10,2.6],[-4.6,11.9,1.9],[-6.4,13,1.35],[-8.1,13,.95],[-9.2,12.2,.62],[-9.5,11.1,.36],[-9.1,10.3,.14]];
const LEGS=[{fr:1,sd:-1,h:[7.4,-3.8,12.6],f:[8.2,-5.1,0]},{fr:1,sd:1,h:[7.4,3.8,12.6],f:[8.2,5.1,0]},{fr:-1,sd:-1,h:[-6,-3.8,12.8],f:[-11.4,-4.9,0]},{fr:-1,sd:1,h:[-6,3.8,12.8],f:[-11.4,4.9,0]}];
// the smoke, in the body (traced on the side view: [x, z, radius]): the plume from behind the shoulders, the tail from the rump
const PLUME=[[4.5,25.4,1.7],[2,26.8,1.75],[-.6,27,1.8],[-3,26,1.85],[-5.3,25.2,1.95],[-7.6,25,2.1],[-9.4,26.2,2.3],[-10.6,28.4,2.45],[-11.4,30.6,2.5],[-12.8,32.4,2.4],[-14.8,32.9,2.3],
  [-16.8,32.2,2.15],[-18.6,31.8,2],[-20.4,32.6,1.85],[-21.8,33.8,1.6],[-23.2,34.7,1.3],[-24.5,34.8,.9],[-25.2,34.1,.45],[-25,33.4,.15]];
const TAIL=[[-6.4,20.4,2.3],[-8.2,19.2,2.5],[-10.2,17.8,2.7],[-12.4,16.9,2.8],[-14.8,16.7,2.8],[-16.9,17.9,2.65],[-18.5,19.9,2.4],[-19.4,21.7,2.05],[-20.2,22.5,1.65],[-21,22.2,1.25],[-21.4,21.3,.85],[-21.2,20.5,.4]];
const HEEL=[[0,0,1.3],[-1.2,1,1.5],[-2,2.2,1.5],[-1.8,3.4,1.35],[-2.4,4.4,1.2],[-3.6,5,1.05],[-4.4,5.8,.85],[-4.8,6.8,.65],[-5.4,7.4,.42],[-6.2,7.6,.2]];
const EYE={az:.74,el:-.3,re:3.1};
// the tufts of the torso: [k along it, angle round it (0 up, π/2 the side), length, base radius, bend, rise tilt (up), bend toward]
const TT=[[.16,.75,10,2.2,3.1,[-.25,.45,1],[-1,0,0]],[.34,.15,6.6,1.55,3.1,[-.3,.2,1],[-1,0,0]],[.5,.2,6.6,1.55,3.1,[-.3,.2,1],[-1,0,0]],[.66,.25,6.4,1.5,3.1,[-.4,.2,1],[-1,0,0]],
  [.84,.4,6.4,1.5,3,[-.8,.25,.6],[-.6,0,-1]],[.3,1.5,6.2,1.45,2.9,[-.2,1,.3],[-.5,0,1]],[.52,1.45,6.2,1.45,2.9,[-.2,1,.3],[-.5,0,1]],[.74,1.35,6,1.4,2.9,[-.3,1,.3],[-.5,0,1]],
  [.94,1.1,6,1.4,2.9,[-.6,.7,.4],[-1,0,.5]],[.24,2.5,5.6,1.35,2.8,[-.3,.5,-1],[-1,0,0]],[.44,2.55,5.6,1.35,2.8,[-.3,.5,-1],[-1,0,0]],[.64,2.5,5.4,1.3,2.8,[-.3,.5,-1],[-1,0,0]],
  [.82,2.3,5.2,1.3,2.8,[-.5,.6,-.8],[-1,0,0]],[.03,2,6.4,1.6,2.9,[.5,.35,-.8],[-1,0,0]],[.1,2.65,5.6,1.45,2.9,[.1,.4,-1],[-1,0,0]]];
// the tufts of the head (on the teardrop): the crescent by the eye, the jowl, the cheek, the sides of the crown, the back of the head
const HTF=[[.2,1.2,7,1.1,1.5,[-.2,.6,1],[-1,0,0]],[.04,2,8.5,1.9,3,[-.6,.7,.1],[0,0,1]],[0,1.7,6,1.4,2.9,[.1,1,-.4],[-1,0,0]],[.48,1.2,6,1.35,3,[-.2,.8,.6],[-1,0,0]],
  [.3,2.5,5.8,1.35,2.9,[-.7,.4,-.4],[-1,0,0]],[.7,1.5,5,1.15,3,[-.4,.8,.5],[-1,0,0]]];

function lumbra(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU;
  const A={B:[0,0,0],lean:0,roll:0,yaw:0,s:0,sx:0,H:HPOS.slice(),hp:0,hy:0,hr:0,blink:1,squint:0,fl:ph,wv:ph};
  {const b=Math.sin(ph);A.s=.012*b;A.H=[HPOS[0],0,HPOS[2]+.25*b];A.hy=look(p,.25);A.hp=.03*Math.sin(ph*2+1);A.blink=blink(p,.34,.07)}
  if(o.pose)Object.assign(A,o.pose);
  const X=frame(A,12),hR=v=>X.Rd(rotZ(rotY(rotX(v,A.hr),-A.hp),A.hy)),hT=q=>X.T(add(A.H,rotZ(rotY(rotX(q,A.hr),-A.hp),A.hy)));
  const fk=(i,a)=>a*Math.sin(A.fl*(1+i%2)+i*1.7);
  // the shadow: violet, soft
  {const c=P(X.T([0,0,0]).slice(0,2).concat(0));ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const ax=P(21,0,0),ay=P(0,9,0),rx=Math.max(Math.hypot(ax[0],ax[1]),Math.hypot(ay[0],ay[1])),ry=Math.max(2.5,Math.abs(ax[1])+Math.abs(ay[1]));
    const g=ctx.createRadialGradient(0,0,1,0,0,rx);g.addColorStop(0,`rgba(${LC.shadow},.42)`);g.addColorStop(.6,`rgba(${LC.shadow},.22)`);g.addColorStop(1,`rgba(${LC.shadow},0)`);
    ctx.fillStyle=g;ctx.translate(c[0],c[1]);ctx.scale(1,ry/rx);ctx.beginPath();ctx.arc(0,0,rx,0,TAU);ctx.fill();ctx.restore()}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  const dB=D(X.T([0,0,16])),dH=D(hT([0,0,0]))+1;
  // ---------------------------------------------------------------- the torso and its tufts
  const torso=sweep(V0,X.T,TSW,.08),tHull=chull([].concat(...torso)),tBB=bbox(tHull),bodyFill=softBox([tBB[0]-5,tBB[1]-8,tBB[2]+5,tBB[3]+3],LC.fur,.34,.46);
  const tTubes=[];TT.forEach((t,i)=>{for(const sd of[-1,1]){const q=onSweep(TSW,t[0],t[1],sd,.3,.08),n=nrm(add(mul(q.n,.25),[t[5][0],t[5][1]*sd,t[5][2]])),w=[t[6][0],t[6][1]*sd,t[6][2]];
    const s=tuft(q.p,n,w,t[2],t[3],t[4]+fk(i*2+(sd>0),.12)),P2=s.pts.map(z=>P(X.T(z))),v=F(X.Rd(q.n));tTubes.push({P2,rs:s.rs,fill:bodyFill,back:v<0,near:v>.25,big:t[2]>8})}});
  const tCurls=furCurls(V0,X.T,X.Rd,TSW,.08,[.1,.22,.34,.46,.58,.7,.82,.93],[0,.45,.9,1.35,1.8,2.25,2.7,3.14],(k,an)=>(an<.3?3.4:an>2.2?3.8:4.4)*(1-.3*Math.abs(k-.5)),fk,0);
  L.add(dB,()=>{piece(torso.map(polyPath).concat(tCurls),tTubes.filter(t=>t.big),bodyFill);
    innerShade(()=>{for(const t of torso)polySub(t)},tHull,'rgba(26,20,40,.48)','rgba(255,248,240,.38)');rimPoly(tHull,.3)});
  // ---------------------------------------------------------------- the legs, under the body, each with its tufts (elbow or hock, the
  // outer side) and the violet flame behind the heel
  LEGS.forEach((l,i)=>{const far=F(X.Rd([0,l.sd,0]))<0,hip=X.T(l.h),pw=add(l.f,[A.B[0],A.B[1],0]);
    L.add(dB-40+(far?-10:0)+D(hip)*.01,()=>{let pts,rs;
      if(l.fr>0){const wr=add(pw,[-.3,0,2.4]),IK=ik(hip,wr,6,5.6,X.Rd([-1,0,.1]));pts=[hip,IK[0],IK[1]];rs=[2.5,2.1,1.85]}
      else{const hk=add(pw,[-1.1,0,4.4]),IK=ik(hip,hk,7.4,6.2,X.Rd([1,0,-.2]));pts=[hip,IK[0],IK[1],add(pw,[-.4,0,1.5])];rs=[3.3,2.3,1.5,1.65]}
      const P2=pts.map(P),pawC=add(pw,[.5,0,1.25]),PE=oval(V0,q=>q,pawC,[2.6,2.2,1.35]),col=far?cmix(LC.fur,LC.furD,.32):LC.fur,fill=softBox(bbox(P2.concat(PE.pts(8))),col,.28,.42);
      const out=X.Rd([0,l.sd,0]),ts=[];
      if(l.fr>0)ts.push(tuft(add(lerp3(pts[0],pts[1],.85),X.Rd([-1.4,0,0])),X.Rd([-1,0,.35]),X.Rd([.1,0,1]),6,1.45,2.9),tuft(add(lerp3(pts[1],pts[2],.45),X.Rd([-1.2,0,0])),X.Rd([-1,0,.2]),X.Rd([.1,0,1]),5,1.25,2.9),
        tuft(add(lerp3(pts[0],pts[1],.5),mul(out,1.6)),add(out,X.Rd([-.3,0,.4])),X.Rd([-.3,0,1]),5.4,1.35,2.9));
      else ts.push(tuft(add(lerp3(pts[2],pts[1],.12),X.Rd([-1.1,0,.3])),X.Rd([-1,0,.55]),X.Rd([.1,0,1]),6.2,1.45,2.9),tuft(add(lerp3(pts[0],pts[1],.5),mul(out,2.2)),add(out,X.Rd([-.4,0,.5])),X.Rd([-.3,0,1]),6.2,1.6,2.9),
        tuft(add(lerp3(pts[0],pts[1],.15),X.Rd([-2.6,0,.6])),X.Rd([-1,0,.4]),X.Rd([0,0,1]),6.4,1.7,3));
      const tubes=ts.map(s=>({P2:s.pts.map(P),rs:s.rs,fill,back:F(sub(s.pts[2],s.pts[0]))<-.2,near:F(out)>.3}));
      tubes.push({P2,rs,fill});
      piece([()=>PE.path()],tubes,fill);
      for(const ty of[-.65,.65]){const q3=[];for(let j=0;j<=5;j++){const t=j/5,an=-.1+t*1.25;q3.push(add(pawC,X.Rd([Math.cos(an)*2.6*.98,ty*(1-.15*t),Math.sin(an)*1.35*.98-.2])))}
        if(F(X.Rd([1,ty*.4,.3]))>0){ctx.strokeStyle=INK;ctx.lineWidth=OW*.5;ctx.lineCap='round';ctx.beginPath();for(const q of q3){const s=P(q);ctx.lineTo(s[0],s[1])}ctx.stroke()}}
      if(l.fr<0){const base=add(pts[2],X.Rd([-1.2,0,-.8])),P3=HEEL.map(([hx,hz],j)=>P(add(base,X.Rd([hx,Math.sin(A.wv*1.3+j*.9)*.12*j,hz]))));
        const g=ctx.createLinearGradient(P3[0][0],P3[0][1],P3[P3.length-1][0],P3[P3.length-1][1]);g.addColorStop(0,cmix(LC.fur,LC.smoke,.6));g.addColorStop(.35,LC.smoke);g.addColorStop(1,LC.smokeL);
        piece([],[{P2:P3,rs:HEEL.map(h=>h[2]),fill:g,dark:'rgba(40,20,90,.3)'}],g)}})});
  // ---------------------------------------------------------------- the smoke: the tail from the rump, the plume from behind the shoulders,
  // grey at the root and violet toward the end, a soft glow at the tip, little tufts along it bending back toward the root
  const smoke=(PTS,every,ph0)=>{const pts3=PTS.map(([sx,sz],j)=>X.T([sx,Math.sin(A.wv+j*.45+ph0)*.06*j,sz+Math.sin(A.wv+j*.6+ph0)*.05*j])),P2=pts3.map(P),rs=PTS.map(q=>q[2]);
    const a=P2[0],e=P2[P2.length-1],g=ctx.createLinearGradient(a[0],a[1],e[0],e[1]);g.addColorStop(0,LC.fur);g.addColorStop(.28,cmix(LC.fur,LC.smoke,.45));g.addColorStop(.6,LC.smoke);g.addColorStop(1,LC.smokeL);
    if(!LOWFX&&!o.noFx){ctx.save();ctx.globalCompositeOperation='lighter';const t=P2[P2.length-3];glow('140,100,230',t[0],t[1],8,.2);ctx.restore()}
    const tubes=[];for(let i=1;i<pts3.length-3;i+=every){const dir=nrm(sub(pts3[i+1],pts3[i-1]));for(const sd of[-1,1]){const side=nrm(cross(dir,X.Rd([0,sd,0])));
      const s=tuft(add(pts3[i],mul(side,rs[i]*.55)),side,mul(dir,-1),rs[i]*2.3,rs[i]*.5,3,9);tubes.push({P2:s.pts.map(P),rs:s.rs,fill:g,dark:'rgba(40,20,90,.22)'})}}
    tubes.push({P2,rs,fill:g,dark:'rgba(40,20,90,.26)',light:.22});piece([],tubes,g)};
  {const root=X.T([-6.4,0,20.4]);L.add(D(root)-1.5,()=>smoke(TAIL,2,0))}
  {const root=X.T([4.5,0,25.4]);L.add(Math.min(dH,D(root))-1.5,()=>smoke(PLUME,2,1.3))}
  // ---------------------------------------------------------------- the head: teardrop, cheeks, snout, crest and tufts as one piece; the face
  const head=sweep(V0,hT,TEAR,0),CK=oval(V0,hT,CHEEK[0],CHEEK[1]),SN=oval(V0,hT,SNOUT[0],SNOUT[1]),hHull=chull([].concat(...head).concat(CK.pts(20),SN.pts(16))),hBB=bbox(hHull);
  const headFill=softBox([hBB[0]-4,hBB[1]-9,hBB[2]+4,hBB[3]+2],LC.head,.4,.44);
  const headSubs=()=>{for(const h of head)polySub(h);CK.sub();SN.sub()},headPath=()=>{ctx.beginPath();headSubs()};
  L.add(dH,()=>{const tubes=[];
    {const Q=CREST.map(([cx,cz,r],j)=>P(hT([cx+(j>4?fk(9,.12)*(j-4):0),0,cz])));tubes.push({P2:Q,rs:CREST.map(c=>c[2]),fill:headFill})}
    HTF.forEach((t,i)=>{for(const sd of[-1,1]){const q=onSweep(TEAR,t[0],t[1],sd,.3,0),n=nrm(add(mul(q.n,.25),[t[5][0],t[5][1]*sd,t[5][2]])),w=[t[6][0],t[6][1]*sd,t[6][2]];
      const s=tuft(q.p,n,w,t[2],t[3],t[4]+fk(i*2+(sd>0),.1)),P2=s.pts.map(z=>P(hT(z))),v=F(hR(q.n));tubes.push({P2,rs:s.rs,fill:headFill,back:v<0,near:v>.25,tuft:1,big:t[2]>8})}});
    const hCurls=furCurls(V0,hT,hR,TEAR,0,[.05,.2,.35,.5,.65,.8],[.6,1.1,1.6,2.1,2.6,3.1],(k,an)=>an>2.4?3.2:3.8,fk,500,.7);
    for(const sd of[-1,1]){const q=onSweep(TEAR,.18,1.15,sd,.4,0),v=F(hR(q.n));if(Math.abs(v)<.82){const pts=curl(V0,hT(q.p),hR(nrm(add(mul(q.n,.5),[-.25,0,1]))),hR([-1,0,.2]),6.4,2.6,'blade',fk(sd>0?7:8,.06));hCurls.push(()=>smoothPath(pts))}}
    piece(head.map(polyPath).concat([()=>CK.path(),()=>SN.path()]).concat(hCurls),tubes.filter(t=>!t.tuft||t.big),headFill);
    innerShade(headSubs,hHull,'rgba(26,20,40,.46)','rgba(255,250,244,.55)');rimPoly(hHull,.32);
    ctx.save();headPath();ctx.clip();drawFace(V0,hT,hR,A);ctx.restore()});
  C.run(L);
  ctx.restore()}

// ------------------------------------------------------------------ the face: big almond eyes, angry (the upper lid slants down toward
// the nose), violet irises lighter at the bottom, a slit pupil, two lights; the little "w" smirk under the snout
function drawFace(V0,hT,hR,A){const{P,F}=V0,E=[],T0=TEAR[0],Rr=T0[2];
  for(const sd of[-1,1]){const md=[Math.cos(EYE.el)*Math.cos(EYE.az),sd*Math.cos(EYE.el)*Math.sin(EYE.az),Math.sin(EYE.el)],c=[T0[0]+md[0]*Rr,md[1]*T0[3],T0[1]+md[2]*Rr],n=nrm([md[0]/Rr,md[1]/T0[3],md[2]/Rr]),v=F(hR(n));if(v<-.05)continue;
    const up=nrm(sub([0,0,1],mul(n,n[2]))),u=mul(nrm(cross(up,n)),sd),re=EYE.re,R0=6.6;
    const o0=P(hT(c)),su=sub(P(hT(add(c,u))),o0),sv=sub(P(hT(add(c,up))),o0),sn=sub(P(hT(add(c,n))),o0),lu=Math.hypot(su[0],su[1]),kk=sstep(.08,.45,v),
      m=lu<.8?lerp(1,.8/Math.max(.05,lu),kk):1,su2=[su[0]*m,su[1]*m];
    const at=(eu,ew)=>{const d2=(eu*eu+ew*ew)*re*re,b=-d2/(2*R0);return[o0[0]+su2[0]*eu*re+sv[0]*ew*re+sn[0]*b,o0[1]+su2[1]*eu*re+sv[1]*ew*re+sn[1]*b]};E.push({sd,v,at})}
  E.sort((a,b)=>a.v-b.v);
  for(const e of E){const{at}=e,op=A.blink*(1-.3*A.squint);if(e.v<.03)continue;
    const I=[-1,-.32],O=[.8,.6],P1=[1.38,-.82],P2=[.18,-1.75],up=[],lo=[];for(let i=0;i<=10;i++){const t=i/10;up.push([lerp(I[0],O[0],t),lerp(I[1],O[1],t)+.1*Math.sin(Math.PI*t)])}
    for(let i=1;i<10;i++){const t=i/10,a=(1-t)**3,b=3*(1-t)**2*t,c=3*(1-t)*t*t,d=t**3;lo.push([a*O[0]+b*P1[0]+c*P2[0]+d*I[0],a*O[1]+b*P1[1]+c*P2[1]+d*I[1]])}
    const lid=up.map(([a,b],i)=>{const j=cl(lo.length-1-Math.round(i*(lo.length-1)/10),0,lo.length-1);return[a,lerp(lo[j][1]+.1,b,op)]});
    const shape=lid.concat(lo).map(q=>at(q[0],q[1]));ctx.save();ctx.globalAlpha*=cl(e.v*5,0,1);
    ctx.beginPath();for(const q of shape)ctx.lineTo(q[0],q[1]);ctx.closePath();
    const bt=bbox(shape),g=ctx.createLinearGradient(0,bt[1],0,bt[3]);g.addColorStop(0,LC.sock);g.addColorStop(.35,'#5d48a8');g.addColorStop(1,'#f3edfe');ctx.fillStyle=g;ctx.fill();
    if(op>.15){ctx.save();ctx.clip();
      const circ=(cu,cw,ru,rw)=>{const pts=[];for(let i=0;i<22;i++){const t=i/22*TAU;pts.push(at(cu+Math.cos(t)*ru,cw+Math.sin(t)*rw))}return pts},iris=circ(.06,-.3,.88,.92),ib=bbox(iris);
      const gi=ctx.createLinearGradient(0,ib[1],0,ib[3]);gi.addColorStop(0,LC.irisD);gi.addColorStop(.45,LC.iris);gi.addColorStop(1,LC.irisL);ctx.fillStyle=gi;poly(iris);ctx.fill();
      ctx.strokeStyle='rgba(36,24,74,.6)';ctx.lineWidth=.3;poly(circ(.05,-.3,.56,.58));ctx.stroke();
      ctx.fillStyle=LC.pupil;poly(circ(.03,-.28,.28,.5));ctx.fill();
      ctx.strokeStyle='rgba(24,20,34,.35)';ctx.lineWidth=.9;ctx.beginPath();for(const q of lid)ctx.lineTo(...at(q[0],q[1]-.14));ctx.stroke();
      ctx.fillStyle='#fff';poly(circ(-.24,.06,.26,.27));ctx.fill();poly(circ(.36,-.78,.1,.105));ctx.fill();
      ctx.restore()}
    ctx.strokeStyle=INK;ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=1.25;ctx.beginPath();for(const q of lid)ctx.lineTo(...at(q[0],q[1]));ctx.lineTo(...at(1.05,lid[10][1]+.12));ctx.stroke();
    ctx.lineWidth=.65;ctx.beginPath();ctx.lineTo(...at(O[0],O[1]));for(const q of lo)ctx.lineTo(...at(q[0],q[1]));ctx.lineTo(...at(I[0],I[1]));ctx.stroke();
    ctx.restore()}
  const[sc0,sr]=SNOUT,pts=[];for(let i=0;i<=16;i++){const s=-1+i/8,a=s*.95,mid=.12*Math.exp(-s*s*40),m=nrm([Math.cos(a)*.7,Math.sin(a),-.62-.12*(1-s*s)+.34*Math.max(0,Math.abs(s)-.7)+mid]),q=C.ellAt(sc0,sr,C.AXES,m),v=F(hR(C.ellN(sr,C.AXES,m)));pts.push({q:P(hT(q)),v})}
  ctx.strokeStyle=INK;ctx.lineWidth=.6;ctx.lineCap='round';let open=false;ctx.beginPath();for(const t of pts){if(t.v>.02){if(!open){ctx.moveTo(t.q[0],t.q[1]);open=true}else ctx.lineTo(t.q[0],t.q[1])}else open=false}ctx.stroke()}

reg('lumbra',{n:'Lumbra',g:'niumon',sc:1,an:['idle'],dur:{idle:2.8},lab:{idle:'Fermo'}},lumbra);
})();
