// Mossbound · la cassetta del 3D vero (K3D): i pezzi della formula per ogni cosa in 3D (sprite/mostri3d/LEGGIMI.md, «La formula per il 3D»).
// Conti e giri (quaternioni), IK a due ossa, i passi (stepper), le forme fatte di triangoli (Mesh, ball, tube, anche con la sezione schiacciata),
// lo scheletro (skel, solve, mix, joints), le ombre cotte (bake), il modello per MB3 (pack) e i pezzi comuni degli zombie, presi dal disegno di
// oggi di sprite/mostri/disegno_mostri.js (ZC: i colori; zHead: la testa con le orbite, gli occhi, la bocca sulla mascella, i denti, i capelli,
// la crepa cucita e la cicatrice; zArm: il braccio ossuto col gomito nodoso, la manica stracciata, la mano con tre dita a uncino e gli artigli).
// La usano sprite/mostri3d/zombie.js e sprite/mostri3d/strisciante.js, e va caricata prima di loro (in Node la prendono con require).
// Spazio dei modelli: x a sinistra della cosa, y in su, z davanti; le unità sono quelle del disegno 2D.
(function(root){'use strict';
// ---------------------------------------------------------------- little maths
const TAU=Math.PI*2,cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k,sm=k=>{k=cl(k,0,1);return k*k*(3-2*k)},ez=k=>{k=cl(k,0,1);return k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2};
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len=a=>Math.hypot(a[0],a[1],a[2]),nrm=a=>{const l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l]},
  lerp3=(a,b,k)=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k),lerp(a[2],b[2],k)],hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s)};
const hex=h=>{const v=parseInt(h.slice(1),16);return[(v>>16&255)/255,(v>>8&255)/255,(v&255)/255]},mixc=(a,b,k)=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k),lerp(a[2],b[2],k)];
// ---------------------------------------------------------------- quaternions (x, y, z, w) and rotations
const Q0=()=>[0,0,0,1],qmul=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]],
  qax=(ax,an)=>{const l=len(ax)||1,s=Math.sin(an/2)/l;return[ax[0]*s,ax[1]*s,ax[2]*s,Math.cos(an/2)]},
  qrot=(q,v)=>{const[x,y,z,w]=q,ix=w*v[0]+y*v[2]-z*v[1],iy=w*v[1]+z*v[0]-x*v[2],iz=w*v[2]+x*v[1]-y*v[0],iw=-x*v[0]-y*v[1]-z*v[2];
    return[ix*w+iw*-x+iy*-z-iz*-y,iy*w+iw*-y+iz*-x-ix*-z,iz*w+iw*-z+ix*-y-iy*-x]},
  qnl=(a,b,w)=>{const d=a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3],k=d<0?-w:w,u=1-w,o=[a[0]*u+b[0]*k,a[1]*u+b[1]*k,a[2]*u+b[2]*k,a[3]*u+b[3]*k],l=Math.hypot(...o)||1;return o.map(v=>v/l)},
  // rotation from three columns (an orthonormal frame)
  qmat=(X,Y,Zc)=>{const m00=X[0],m10=X[1],m20=X[2],m01=Y[0],m11=Y[1],m21=Y[2],m02=Zc[0],m12=Zc[1],m22=Zc[2],t=m00+m11+m22;let x,y,z,w;
    if(t>0){const s=Math.sqrt(t+1)*2;w=s/4;x=(m21-m12)/s;y=(m02-m20)/s;z=(m10-m01)/s}else if(m00>m11&&m00>m22){const s=Math.sqrt(1+m00-m11-m22)*2;w=(m21-m12)/s;x=s/4;y=(m01+m10)/s;z=(m02+m20)/s}
    else if(m11>m22){const s=Math.sqrt(1+m11-m00-m22)*2;w=(m02-m20)/s;x=(m01+m10)/s;y=s/4;z=(m12+m21)/s}else{const s=Math.sqrt(1+m22-m00-m11)*2;w=(m10-m01)/s;x=(m02+m20)/s;y=(m12+m21)/s;z=s/4}
    const l=Math.hypot(x,y,z,w)||1;return[x/l,y/l,z/l,w/l]},
  // the rotation that takes the frame (x0, bend y0) to (x1, bend y1): a bone that points somewhere new, bending the same way
  qframe=(x0,y0,x1,y1)=>{const ya=nrm(sub(y0,mul(x0,dot(y0,x0)))),yb=nrm(sub(y1,mul(x1,dot(y1,x1)))),za=cross(x0,ya),zb=cross(x1,yb);
    const A=qmat(x0,ya,za),Bq=qmat(x1,yb,zb);return qmul(Bq,[-A[0],-A[1],-A[2],A[3]])},
  rx=a=>qax([1,0,0],a),ry=a=>qax([0,1,0],a),rz=a=>qax([0,0,1],a),qq=(...qs)=>qs.reduce((a,b)=>qmul(a,b),Q0());
// two-bone IK (like ik() of disegno_mostri.js): from a toward t, bones L1 and L2, the joint bends toward `pole`. → [joint, reached point, bend]
function ik(a,t,L1,L2,pole){let d=sub(t,a),dl=len(d);const mx=L1+L2-.02;if(dl>mx){t=add(a,mul(d,mx/dl));d=sub(t,a);dl=mx}if(dl<.01)dl=.01;
  const u=mul(d,1/dl);let w=sub(pole,mul(u,dot(pole,u)));const wl=len(w);w=wl<1e-4?[0,0,1]:mul(w,1/wl);
  const x=(L1*L1-L2*L2+dl*dl)/(2*dl),h=Math.sqrt(Math.max(0,L1*L1-x*x));return[add(add(a,mul(u,x)),mul(w,h)),t,w]}
// feet or hands that step (stepper() of disegno_mostri.js): planted for `share` of the cycle sliding back, then swung forward and lifted
const stepper=(p,share)=>(k,S,H)=>{const q=((p+k)%1+1)%1;if(q<share)return{x:S-q/share*2*S,z:0,up:0};const u=(q-share)/(1-share);return{x:-S+ez(u)*2*S,z:Math.sin(u*Math.PI)*H,up:Math.sin(u*Math.PI)}};
// the colours of the zombies of today (ZC of disegno_mostri.js), plus the ink of the lines; pants and shoes a little lighter (at night they looked black)
const ZC={skin:hex('#88a46a'),skinD:hex('#647e4e'),rot:hex('#3f5233'),cloth:hex('#3b4956'),clothD:hex('#27313b'),pants:hex('#3d342c'),shoe:hex('#2a2420'),sole:hex('#141110'),
  bone:hex('#e6dcc0'),socket:hex('#141010'),eye:hex('#d9f45c'),mouth:hex('#2a0c0c'),gum:hex('#6a1a1a'),nail:hex('#1e1a14'),ink:hex('#1b1612'),hair:hex('#241d18')};
// what a point is for the paint of mb3.js: [kind (1 skin, 2 shirt, 3 trousers, 4 leather, 5 bone, 6 dark inside, 9 light), blood, baked shadow, outline]
const K=(kind,blood,ol)=>[kind,blood||0,0,ol===undefined?1:ol];
// a frame round direction d: ex towards the left (+x) for a face looking forward; [ex, ey, d] turns the right way
const frameOf=d=>{const ex=nrm(cross([0,1,0],d)),ey=cross(d,ex);return{ex,ey}};
// ---------------------------------------------------------------- the mesh: pieces with their colour, what they are, their bones
// vertex: place, normal, colour, k = [what it is, blood, baked shadow, outline], w = [[bone, weight] …]
function Mesh(){const m={P:[],N:[],C:[],K:[],J:[],W:[],I:[],G:[]};let grp=0;
  m.group=g=>{grp=g};
  m.v=(p,n,c,k,w)=>{const i=m.P.length/3;m.P.push(p[0],p[1],p[2]);m.N.push(n[0],n[1],n[2]);m.C.push(c[0],c[1],c[2],1);m.K.push(k[0],k[1]||0,0,k[3]===undefined?1:k[3]);
    const ws=w.slice().sort((a,b)=>b[1]-a[1]).slice(0,4),t=ws.reduce((s,x)=>s+x[1],0)||1;for(let j=0;j<4;j++){m.J.push(ws[j]?ws[j][0]:0);m.W.push(ws[j]?ws[j][1]/t:0)}m.G.push(grp);return i};
  m.t=(a,b,c)=>{m.I.push(a,b,c)};return m}
// a frame round direction d (for tubes: then carried along without twisting)
function perp(d){const a=Math.abs(d[1])<.9?[0,1,0]:[1,0,0];return nrm(cross(d,a))}
// a tube along points (radius at each), sides round it; o.cap0/o.cap1 'ball' | 'point' | 'open'; o.rag1: teeth on the open end;
// o.flat = [fu, fv]: the section squashed into an ellipse (a strip of cloth, a flat tooth), u along o.up; use 'point' or 'open' ends with it;
// paint(pt, t along 0..1, angle, ring point) → {c, k, w}. Pieces of cloth go in their own mesh (see pack): MB3 draws only their outside,
// and through an opening you see the dark of the outline
function tube(m,pts,rads,sides,paint,o){o=o||{};const n=pts.length,rings=[];let T=nrm(sub(pts[1],pts[0])),U=o.up?nrm(sub(o.up,mul(T,dot(o.up,T)))):perp(T);
  const L=[0];for(let i=1;i<n;i++)L.push(L[i-1]+len(sub(pts[i],pts[i-1])));const LT=L[n-1]||1,F=o.flat;
  for(let i=0;i<n;i++){const Ti=i===0?nrm(sub(pts[1],pts[0])):i===n-1?nrm(sub(pts[n-1],pts[n-2])):nrm(sub(pts[i+1],pts[i-1]));
    U=nrm(sub(U,mul(Ti,dot(U,Ti))));const V=cross(Ti,U),ring=[];
    for(let j=0;j<sides;j++){const an=j/sides*TAU;let dr,nn,r=rads[i],p;
      if(F){const ca=Math.cos(an),sa=Math.sin(an);dr=add(mul(U,ca*F[0]),mul(V,sa*F[1]));nn=nrm(add(mul(U,ca/F[0]),mul(V,sa/F[1])));p=add(pts[i],mul(dr,r))}
      else{dr=add(mul(U,Math.cos(an)),mul(V,Math.sin(an)));nn=dr;p=add(pts[i],mul(dr,r))}
      if(i===n-1&&o.rag1){const tl=o.rag1(an);p=add(p,mul(Ti,tl.len));p=add(p,mul(dr,tl.out||0))}
      const pa=paint(p,L[i]/LT,an,i);ring.push(m.v(p,nn,pa.c,pa.k,pa.w))}rings.push({ring,T:Ti,U,V,c:pts[i],r:rads[i]})}
  for(let i=0;i<n-1;i++)for(let j=0;j<sides;j++){const a=rings[i].ring[j],b=rings[i].ring[(j+1)%sides],c=rings[i+1].ring[(j+1)%sides],d=rings[i+1].ring[j];m.t(a,b,c);m.t(a,c,d)}
  const cap=(rg,dir,kind,end)=>{if(kind==='open'||!kind)return;const C=rg.c,steps=kind==='point'?1:3;let prev=rg.ring;
    for(let s=1;s<=steps;s++){const k=s/steps,th=k*Math.PI/2,rr=rg.r*Math.cos(th),off=kind==='point'?rg.r*(o.tip||1.6):rg.r*Math.sin(th);
      if(s===steps){const p=add(C,mul(dir,off)),pa=paint(p,end,0,-1),ci=m.v(p,dir,pa.c,pa.k,pa.w);for(let j=0;j<sides;j++){const a=prev[j],b=prev[(j+1)%sides];if(dir===rg.T||dot(dir,rg.T)>0)m.t(a,b,ci);else m.t(a,ci,b)}break}
      const ring=[];for(let j=0;j<sides;j++){const an=j/sides*TAU,dr=add(mul(rg.U,Math.cos(an)),mul(rg.V,Math.sin(an))),p=add(add(C,mul(dir,off)),mul(dr,rr)),pa=paint(p,end,an,-1);
        ring.push(m.v(p,nrm(add(mul(dr,Math.cos(th)),mul(dir,Math.sin(th)))),pa.c,pa.k,pa.w))}
      for(let j=0;j<sides;j++){const a=prev[j],b=prev[(j+1)%sides],c=ring[(j+1)%sides],d=ring[j];if(dot(dir,rg.T)>0){m.t(a,b,c);m.t(a,c,d)}else{m.t(a,c,b);m.t(a,d,c)}}prev=ring}};
  cap(rings[0],mul(rings[0].T,-1),o.cap0,0);cap(rings[n-1],rings[n-1].T,o.cap1,1);return rings}
// a ball (an ellipsoid with radii r along the axes ax=[X,Y,Z], turning like the right hand: Z = X × Y); shape(d) can push the surface
// in or out; paint(p, d) → {c, k, w}
function ball(m,c,r,seg,rings,paint,o){o=o||{};const ax=o.ax||[[1,0,0],[0,1,0],[0,0,1]],start=m.P.length/3,rows=[];
  const at=(th,ph)=>{const d=[Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)],w=add(add(mul(ax[0],d[0]*r[0]),mul(ax[1],d[1]*r[1])),mul(ax[2],d[2]*r[2])),
    dir=nrm(w);let k=o.shape?o.shape(dir):0;return{p:add(c,add(w,mul(dir,k))),d:dir}};
  const top=at(0,0),pt=paint(top.p,top.d),it=m.v(top.p,top.d,pt.c,pt.k,pt.w);
  for(let j=1;j<rings;j++){const row=[];for(let i=0;i<seg;i++){const q=at(j/rings*Math.PI,i/seg*TAU),pa=paint(q.p,q.d);row.push(m.v(q.p,q.d,pa.c,pa.k,pa.w))}rows.push(row)}
  const bot=at(Math.PI,0),pb=paint(bot.p,bot.d),ib=m.v(bot.p,bot.d,pb.c,pb.k,pb.w);
  for(let i=0;i<seg;i++)m.t(it,rows[0][(i+1)%seg],rows[0][i]);
  for(let j=0;j<rows.length-1;j++)for(let i=0;i<seg;i++){const a=rows[j][i],b=rows[j][(i+1)%seg],cc=rows[j+1][(i+1)%seg],d=rows[j+1][i];m.t(a,b,cc);m.t(a,cc,d)}
  const L=rows[rows.length-1];for(let i=0;i<seg;i++)m.t(ib,L[i],L[(i+1)%seg]);
  if(o.shape||o.renorm)smoothNormals(m,start,m.P.length/3);return{start,end:m.P.length/3}}
// normals again from the faces (after the surface was pushed in: the sockets, the mouth)
function smoothNormals(m,s,e){const N=new Float64Array((e-s)*3),P=m.P;for(let t=0;t<m.I.length;t+=3){const a=m.I[t],b=m.I[t+1],c=m.I[t+2];if(a<s||a>=e)continue;
    const ux=P[b*3]-P[a*3],uy=P[b*3+1]-P[a*3+1],uz=P[b*3+2]-P[a*3+2],vx=P[c*3]-P[a*3],vy=P[c*3+1]-P[a*3+1],vz=P[c*3+2]-P[a*3+2],x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;
    for(const q of[a,b,c]){N[(q-s)*3]+=x;N[(q-s)*3+1]+=y;N[(q-s)*3+2]+=z}}
  for(let i=s;i<e;i++){const x=N[(i-s)*3],y=N[(i-s)*3+1],z=N[(i-s)*3+2],l=Math.hypot(x,y,z);if(l>1e-9){m.N[i*3]=x/l;m.N[i*3+1]=y/l;m.N[i*3+2]=z/l}}}
// ---------------------------------------------------------------- the skeleton
// skel(BN, PAR, bind, chains, follow): BN the names of the bones (root first, every parent before its children), PAR name → parent,
// bind the places in the rest pose (the bones are not turned there), chains the two-bone limbs solved with the IK, follow the chains that go
// through points given by the move (a tail, a spine on the ground, a rope).
// A chain: {a, b, c: upper, lower and end bone; g, s: where its spec is in the move (sp[g][s]); L1, L2; pole: the default pole; y0: the bend
//   in the rest pose; target(ch, wp, rootP, rootQ, sp) → the point to reach; end(ch, wr of the lower bone, rootQ) → the turn of the end bone}.
// A follow chain: {bones: [names], g: sp[g] = the points of the bones (one more for the end of the last bone, if end is given), end: the end of
//   the last bone in the rest pose, up: a direction square to the chain in the rest pose (sp[g].up the same in the move), for its twist}.
function skel(BN,PAR,bind,chains,follow){const BI={};BN.forEach((n,i)=>{BI[n]=i});const at=new Array(BN.length).fill(null),fo=new Array(BN.length).fill(null);
  for(const c of chains||[])at[BI[c.a]]=c;for(const f of follow||[]){f.ix=f.bones.map(b=>BI[b]);fo[f.ix[0]]=f}
  return{BN,BI,PAR,bind,chains:chains||[],follow:follow||[],at,fo}}
// a move's spec: {root:{p, q, yawQ}, r:{bone: local turn}, emK, sp[g][s] for the chains, sp[g] for the follow chains}
// → {wp: places, wr: turns (in the space of the model), emK}
function solve(S,sp){const B=S.bind,BN=S.BN,BI=S.BI,PAR=S.PAR,n=BN.length,wp=new Array(n),wr=new Array(n),r=sp.r||{},done=new Uint8Array(n);
  const rootQ=sp.root&&sp.root.q||Q0(),rootP=sp.root&&sp.root.p||[0,0,0];wp[0]=rootP;wr[0]=rootQ;
  const fk=j=>{const pa=BI[PAR[BN[j]]];wr[j]=qmul(wr[pa],r[BN[j]]||Q0());wp[j]=add(wp[pa],qrot(wr[pa],sub(B[j],B[pa])))};
  for(let j=1;j<n;j++){if(done[j])continue;const f=S.fo[j];
    if(f&&sp[f.g]){const P=sp[f.g],ix=f.ix,n1=ix.length,u0=f.up||[1,0,0],u1=P.up||u0;
      for(let i=0;i<n1;i++){const q=ix[i];let b0,b1,p0,p1;
        if(i<n1-1){b0=B[q];b1=B[ix[i+1]];p0=P[i];p1=P[i+1]}else if(f.end&&P.length>n1){b0=B[q];b1=f.end;p0=P[i];p1=P[n1]}else{b0=B[ix[i-1]];b1=B[q];p0=P[i-1];p1=P[i]}
        wp[q]=P[i];wr[q]=qframe(nrm(sub(b1,b0)),u0,nrm(sub(p1,p0)),u1);done[q]=1}continue}
    fk(j);const c=S.at[j];if(!c)continue;const ch=sp[c.g]&&sp[c.g][c.s];if(!ch)continue;
    const j1=BI[c.b],j2=BI[c.c],T=c.target(ch,wp,rootP,rootQ,sp),pole=qrot(rootQ,ch.pole||c.pole),[E,Tt,w]=ik(wp[j],T,c.L1,c.L2,pole);
    const x0=nrm(sub(B[j1],B[j])),x0b=nrm(sub(B[j2],B[j1]));
    wr[j]=qframe(x0,c.y0,nrm(sub(E,wp[j])),w);wp[j1]=E;wr[j1]=qframe(x0b,c.y0,nrm(sub(Tt,E)),w);wp[j2]=Tt;wr[j2]=c.end(ch,wr[j1],rootQ);done[j1]=done[j2]=1}
  return{wp,wr,emK:sp.emK===undefined?1:sp.emK}}
// two poses blended (w = how much of a)
function mix(a,b,w){if(!b||w>=1)return a;if(w<=0)return b;return{wp:a.wp.map((p,i)=>lerp3(b.wp[i],p,w)),wr:a.wr.map((q,i)=>qnl(b.wr[i],q,w)),emK:lerp(b.emK,a.emK,w)}}
// the matrices of the bones for MB3.draw (bind = the places in the rest pose)
function joints(B,P,out){const n=B.length,J=out||new Float32Array(n*16);
  for(let j=0;j<n;j++){const[x,y,z,w]=P.wr[j],o=j*16,x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;
    const m0=1-(yy+zz),m1=xy+wz,m2=xz-wy,m4=xy-wz,m5=1-(xx+zz),m6=yz+wx,m8=xz+wy,m9=yz-wx,m10=1-(xx+yy),b=B[j];
    J[o]=m0;J[o+1]=m1;J[o+2]=m2;J[o+3]=0;J[o+4]=m4;J[o+5]=m5;J[o+6]=m6;J[o+7]=0;J[o+8]=m8;J[o+9]=m9;J[o+10]=m10;J[o+11]=0;
    J[o+12]=P.wp[j][0]-(m0*b[0]+m4*b[1]+m8*b[2]);J[o+13]=P.wp[j][1]-(m1*b[0]+m5*b[1]+m9*b[2]);J[o+14]=P.wp[j][2]-(m2*b[0]+m6*b[1]+m10*b[2]);J[o+15]=1}
  return J}
// ---------------------------------------------------------------- the soft shadow where pieces meet, and the model for MB3
// OCC: balls that stand for the pieces, [centre, radius, group]; a piece does not shadow itself (same group) nor the pieces skip(g, gg) says;
// ground(p, g) adds the shadow near the ground
function bake(M,OCC,skip,ground){for(let i=0;i<M.P.length/3;i++){const p=[M.P[i*3],M.P[i*3+1],M.P[i*3+2]],n=[M.N[i*3],M.N[i*3+1],M.N[i*3+2]],g=M.G[i];let o=0;
    for(const[c,r,gg] of OCC){if(gg===g||skip(g,gg))continue;const v=sub(c,p),dd=len(v);if(dd<r*.8)continue;const ct=dot(n,v)/dd;if(ct<=0)continue;o+=ct*r*r/(dd*dd)}
    if(ground)o+=ground(p,g);
    M.K[i*4+2]=cl(o*.75,0,.72)}}
// into the shape MB3 wants: meshes = [[mesh, material] …]; mats[0] the body, mats[1] the cloth
function pack(S,meshes,mats,o){o=o||{};const B=S.bind,BN=S.BN,BI=S.BI,PAR=S.PAR;
  const prim=(M,mat)=>({pos:Float32Array.from(M.P),nrm:Float32Array.from(M.N),uv:null,col:Float32Array.from(M.C),knd:Float32Array.from(M.K),jnt:Float32Array.from(M.J),wgt:Float32Array.from(M.W),
    idx:Uint32Array.from(M.I),mat,node:0});
  const nodes=BN.map((n,i)=>({i,name:n,t:[0,0,0],r:[0,0,0,1],s:[1,1,1],m:null,kids:[],parent:PAR[n]===undefined?-1:BI[PAR[n]]}));
  const ibm=new Float32Array(BN.length*16);BN.forEach((n,j)=>{const o=j*16;ibm[o]=ibm[o+5]=ibm[o+10]=ibm[o+15]=1;ibm[o+12]=-B[j][0];ibm[o+13]=-B[j][1];ibm[o+14]=-B[j][2]});
  let tri=0,vert=0;for(const[m] of meshes){tri+=m.I.length;vert+=m.P.length}
  return{nodes,order:BN.map((_,i)=>i),skin:{joints:BN.map((_,i)=>i),ibm},imgs:[],mats:mats||[{name:'pelle'},{name:'stoffa',dbl:true}],prims:meshes.map(([m,mat])=>prim(m,mat)),
    clips:[],byName:BI,ns:o.ns===undefined?.3:o.ns,bind:B,tri:tri/3,vert:vert/3,skel:S}}
// ---------------------------------------------------------------- the zombie parts (zHead and zArm of disegno_mostri.js, in 3D)
// zHead(m, o): a big round head with hollow sockets, eyes that glow deep inside with a white spark, a mouth too wide dug into the face, four
// crooked teeth above (one longer) and three below on the jaw, the lower face that goes with the jaw, a dark back of the mouth, a few hairs, the
// stitched crack on the back and (o.scar !== false) the stitched scar on his right. o: c (centre), R, bi (bone name → index), head/jaw (the
// names of the bones), eyeK (size of the eyes: 1 for R 8.2, they grow with the head like in the 2D drawing), group (for the baked shadow);
// under a helmet (the miner) rot: false and hair: false (no rotten patch, no hairs); deadEye: 'S' or 'D', the socket of that eye is empty
function zHead(m,o){const Z=o.Z||ZC,HCc=o.c,R=o.R,bi=o.bi,hb=o.head||'testa',jb=o.jaw||'mascella',ek=o.eyeK===undefined?1:o.eyeK;
  const eyes=[{d:nrm([-.4,.16,.8]),big:1.15},{d:nrm([.4,.16,.8]),big:.9}],MO=nrm([0,-.5,.8]);
  const ell=(d,c,ax,ay)=>{const f=frameOf(c),q=sub(d,mul(c,dot(d,c))),x=dot(q,f.ex),y=dot(q,f.ey);return{e:(x/ax)*(x/ax)+(y/ay)*(y/ay),x,y,front:dot(d,c)}};
  const spots=[[[.6,.62,-.45],.22],[[-.35,.38,-.85],.2],[[-.8,.55,.15],.16],[[-.15,.95,-.3],.15],[[.85,-.15,.45],.17],[[.25,-.75,-.6],.2]].map(([d,s])=>[nrm(d),s]);
  const ROT=nrm([.5,.85,-.15]);
  const mouthAt=d=>ell(d,MO,Math.sin(.52)*.98,Math.sin(.27)),sock=d=>eyes.map(E=>({E,q:ell(d,E.d,Math.sin(.3*E.big),Math.sin(.34*E.big))}));
  const headShape=d=>{let k=0;for(const{E,q} of sock(d))if(q.front>0&&q.e<1.25)k-=R*.2*Math.pow(1-Math.min(1,q.e/1.25),.7);
    const mq=mouthAt(d);if(mq.front>0&&mq.e<1.2)k-=R*.17*Math.pow(1-Math.min(1,mq.e/1.2),.6);return k};
  const jawW=d=>{const mq=mouthAt(d);const below=sm((-mq.y-.02)/.14),near=sm((mq.front-Math.cos(1.05))/(Math.cos(.55)-Math.cos(1.05)));return below*near};
  m.group(o.group===undefined?1:o.group);
  ball(m,HCc,[R,R*.97,R],44,30,(p,d)=>{let c=Z.skin.slice(),kind=1,blood=0;
      for(const[s,sz] of spots){const a=dot(d,s);c=mixc(c,Z.skinD,sm((a-Math.cos(sz*1.25))/(Math.cos(sz*.8)-Math.cos(sz*1.25)))*.9)}
      if(o.rot!==false){const a=dot(d,ROT);c=mixc(c,Z.rot,sm((a-Math.cos(.36))/(Math.cos(.22)-Math.cos(.36)))*.95)}
      for(const{E,q} of sock(d)){if(q.front<=0)continue;c=mixc(c,mixc(Z.skinD,Z.rot,.5),sm((1.6-q.e)/.5)*.8);if(q.e<1)c=mixc(c,Z.socket,sm((1-q.e)/.35));if(q.e<1)kind=6}
      const mq=mouthAt(d);if(mq.front>0){c=mixc(c,mixc(Z.skinD,Z.rot,.4),sm((1.5-mq.e)/.4)*.7);if(mq.e<1){c=mixc(Z.gum,Z.mouth,sm((.55-mq.y/Math.sin(.27))/.4));kind=6}
        if(mq.y<0&&mq.e>.9&&mq.e<2.6)blood=.7*sm((mq.e-.9)/.3)*(1-sm((mq.e-1.8)/.8))}
      const wj=jawW(d);return{c,k:K(kind,blood),w:wj>0?[[bi(hb),1-wj],[bi(jb),wj]]:[[bi(hb),1]]}},{shape:headShape});
  // the back of the mouth: a dark ball inside the head, so an open mouth is never a hole
  ball(m,add(HCc,mul(MO,R*.45)),[R*.42,R*.3,R*.32],12,8,()=>({c:Z.mouth,k:K(6,0,0),w:[[bi(hb),.55],[bi(jb),.45]]}));
  // eyes: little lights deep in the sockets, with a white spark
  for(const E of eyes){if(o.deadEye&&o.deadEye===(E.d[0]>0?'S':'D'))continue;const er=1.02*E.big*ek,cen=add(HCc,mul(E.d,R-R*.2*.82+er*.35));
    ball(m,cen,[er,er,er*.8],12,8,()=>({c:Z.eye,k:K(9,0,0),w:[[bi(hb),1]]}),{ax:[frameOf(E.d).ex,frameOf(E.d).ey,E.d]});
    const f=frameOf(E.d),sp=add(add(cen,mul(E.d,er*.72)),add(mul(f.ex,-er*.42),mul(f.ey,er*.42)));ball(m,sp,[er*.3,er*.3,er*.2],8,6,()=>({c:[1,1,1],k:K(9,0,0),w:[[bi(hb),1]]}))}
  // teeth: four crooked ones above (one longer), three below on the jaw
  const onFace=(x,y,dz)=>{const f=frameOf(MO),dd=nrm(add(add(MO,mul(f.ex,x)),mul(f.ey,y))),k=headShape(dd);return add(HCc,mul(dd,R+k+(dz||0)))};
  const tooth=(base,dir,len,r,bn,seed)=>{const f=frameOf(MO),tw=(hash(seed)-.5)*.5,d2=nrm(add(dir,add(mul(f.ex,tw),mul(MO,.25))));
    tube(m,[base,add(base,mul(d2,len*.6)),add(base,mul(d2,len))],[r,r*.8,r*.35],7,(p,t)=>({c:mixc(mixc(Z.bone,[.62,.55,.38],.35*(1-t)),Z.bone,t*.6),k:K(5,0,.3),w:[[bi(bn),1]]}),{cap0:'open',cap1:'point',tip:.5})};
  {const f=frameOf(MO),ay=Math.sin(.27);for(let i=0;i<4;i++){const x=(-.75+i*.5)*Math.sin(.52)*.98;tooth(onFace(x,ay*.62,.25),mul(f.ey,-1),i===1?2.5:1.6+hash(i+3)*.5,.6,hb,i)}
    for(let i=0;i<3;i++){const x=(-.5+i*.5)*Math.sin(.52)*.98;tooth(onFace(x,-ay*.7,.25),f.ey,1.3+hash(i+9)*.5,.55,jb,i+20)}}
  // a few hairs on top, a stitched crack on the back, a scar on his right
  if(o.hair!==false)for(let i=-1.5;i<=1.5;i++){const d=nrm([-.5*i,1,-.25+.1*Math.abs(i)]),r0=add(HCc,mul(d,R*.96)),mid=add(r0,[-i*.55,2.1,-.35]),tip=add(r0,[-i*1.45,3.1-.3*Math.abs(i),-1.1]);
    tube(m,[r0,mid,tip],[.36,.26,.12],6,()=>({c:Z.hair,k:K(0,0,.45),w:[[bi(hb),1]]}),{cap0:'open',cap1:'point',tip:.6})}
  const line=(cdir,pts,r)=>{const f=frameOf(cdir),P=[];for(const[x,y] of pts){const dd=nrm(add(add(cdir,mul(f.ex,x/R)),mul(f.ey,y/R)));P.push(add(HCc,mul(dd,R*.995+r*.4)))}
    tube(m,P,P.map(()=>r),5,()=>({c:Z.ink,k:K(0,0,0),w:[[bi(hb),1]]}),{cap0:'ball',cap1:'ball'})};
  {const cb=nrm([-.1,.25,-1]);line(cb,[[-3,-2],[-1.5,-1],[0,0],[1.3,-1.2],[2.6,-2.4]],.28);for(let i=0;i<3;i++){const x=-2.4+i*2.2;line(cb,[[x-.8,-2.6+i*.4+1.1],[x+.8,-.4+i*.4-1.1]],.22)}}
  if(o.scar!==false){const cs=nrm([-1,-.1,.15]);line(cs,[[-2,-2],[0,0],[2,2]],.26);line(cs,[[-1.4,.6],[-.2,-.8]],.2);line(cs,[[.4,1.8],[1.6,.4]],.2)}
  return{MO,headShape,eyes}}
// zArm(m, shirt, o): a thin bony arm (a tube that narrows to the wrist), the elbow knob on the outside of the bend, a tight torn sleeve with
// three teeth hanging down the arm (in the cloth mesh), a small palm with three long hooked fingers and black claws.
// o: s (1 his left, -1 his right), sd ('S' | 'D'), sh, el, wr (shoulder, elbow, wrist in the rest pose, in a straight line along d), L1, L2,
// bi, knob (where the elbow knob sits), sleeveK (how far down the upper arm the sleeve goes), sleeveR (size of the sleeve), g and hg (groups of
// the arm and of the hand), hand {dir (where the fingers point), fw (across the palm), pd (the back of the hand: the fingers hook the other
// way)}: by default along the arm; hs: size of the hand; fs: length of the fingers; cloth, clothD: the colours of the sleeve (the shirt's);
// fist {axis}: a fist closed round a handle along axis (the miner's pick) instead of the open hand. The bones: braccio, avambraccio, mano, dita,
// punte, spalla + sd
function zArm(m,shirt,o){const Z=o.Z||ZC,s=o.s,sd=o.sd,sh=o.sh,el=o.el,wr=o.wr,d=o.d,bi=o.bi,ib=bi('braccio'+sd),ie=bi('avambraccio'+sd),ih=bi('mano'+sd);
  const hs=o.hs===undefined?1:o.hs,fs=o.fs===undefined?1:o.fs,sr=o.sleeveR===undefined?1:o.sleeveR;
  m.group(o.g);
  const armW=p=>{const t=dot(sub(p,sh),d)/o.L1;if(t<.82)return[[ib,1]];if(t<1.18){const k=sm((t-.82)/.36);return[[ib,1-k],[ie,k]]}
    const t2=dot(sub(p,el),d)/o.L2;if(t2<.86)return[[ie,1]];const k=sm((t2-.86)/.28);return[[ie,1-k],[ih,k]]};
  const pts=[sub(sh,mul(d,1.2)),sh,lerp3(sh,el,.5),el,lerp3(el,wr,.5),wr,add(wr,mul(d,.8))],rads=[1.75,1.75,1.3,1.5,1.12,1.05,1.0];
  tube(m,pts,rads,14,(p,t)=>({c:mixc(Z.skin,Z.skinD,.15+.35*t),k:K(1,0,cl(dot(sub(p,sh),d)/1.5,0,1)),w:armW(p)}),{cap0:'ball',cap1:'ball'});
  // the elbow knob, on the outside of the bend
  {const kc=add(el,mul(o.knob,.55));ball(m,kc,[1.5,1.5,1.5],12,8,(p)=>({c:Z.skin,k:K(1),w:[[ib,.5],[ie,.5]]}))}
  // the sleeve: tight, torn, three teeth hanging down the arm
  const sl0=sub(sh,mul(d,1.6)),sl1=add(sh,mul(d,o.L1*o.sleeveK)),clo=o.cloth||Z.cloth,cloD=o.clothD||Z.clothD;shirt.group(o.g);
  tube(shirt,[sl0,sh,lerp3(sh,sl1,.5),sl1],[2.35*sr,2.4*sr,2.3*sr,2.15*sr],16,(p,t)=>({c:mixc(clo,cloD,.15),k:K(2,0,cl(t*2,0,1)),w:t<.35?[[bi('spalla'+sd),1-sm(t/.35)],[ib,sm(t/.35)]]:[[ib,1]]}),
    {cap0:'open',cap1:'open',rag1:an=>({len:Math.max(0,Math.sin(an*1.5+(s>0?.4:2.2)))*1.6*(1+.4*hash(an*3+s)),out:.05})});
  // the hand and its fingers (or a fist round a handle)
  m.group(o.hg);
  if(o.fist){const A=nrm(o.fist.axis),fc=add(wr,mul(d,1.5*hs)),kn=mul(nrm(cross(d,A)),-s),up=nrm(cross(A,kn));
    // the fist: long along the handle, the four knuckles in a row on the outside, the thumb across them, the black claws peeping under them
    ball(m,fc,[2.05*hs,2.0*hs,2.45*hs],14,10,()=>({c:mixc(Z.skin,Z.skinD,.2),k:K(1),w:[[ih,1]]}),{ax:[kn,up,A]});
    for(let i=0;i<4;i++){const q=add(add(fc,mul(kn,1.55*hs)),mul(A,(i-1.5)*1.08*hs));ball(m,q,[.78*hs,.72*hs,.62*hs],10,7,()=>({c:Z.skin,k:K(1,0,.6),w:[[ih,1]]}),{ax:[kn,up,A]});
      if(i<3){const c0=add(add(add(fc,mul(kn,1.1*hs)),mul(up,-1.5*hs)),mul(A,(i-1)*1.08*hs));tube(m,[c0,add(c0,mul(up,-.55*hs)),add(add(c0,mul(up,-.95*hs)),mul(kn,-.35*hs))],[.36*hs,.26*hs,.05],6,()=>({c:Z.nail,k:K(4,.4,.5),w:[[ih,1]]}),{cap0:'ball',cap1:'point',tip:.3})}}
    {const t0=add(add(fc,mul(kn,.6*hs)),mul(A,-1.9*hs)),t1=add(add(add(fc,mul(kn,1.9*hs)),mul(up,.9*hs)),mul(A,-.2*hs));tube(m,[t0,lerp3(t0,t1,.5),t1],[.62*hs,.58*hs,.5*hs],8,()=>({c:mixc(Z.skin,Z.skinD,.15),k:K(1,0,.7),w:[[ih,1]]}),{cap0:'ball',cap1:'ball'})}
    return{fc,A,kn,up}}
  const H=o.hand,hd=H?H.dir:d,fw=H?H.fw:nrm(cross(d,[0,0,1]))/* across the palm */,pd=H?H.pd:nrm(cross(fw,d))/* the back of the hand */,palm=add(wr,mul(hd,1.15*hs));
  ball(m,palm,[1.55*hs,1.85*hs,1.05*hs],14,10,(p)=>({c:Z.skin,k:K(1),w:[[ih,1]]}),{ax:[fw,mul(hd,1),pd]});
  for(let k=-1;k<=1;k++){const dir=nrm(add(hd,mul(fw,k*.38))),b0=add(add(palm,mul(dir,1.3*hs)),mul(fw,k*.65*hs)),kn=add(b0,mul(dir,2.4*fs)),tp=add(add(kn,mul(dir,2.2*fs)),mul(pd,-.9*fs)),cw=add(add(tp,mul(dir,.9*fs)),mul(pd,-1.3*fs));
    const fl=k?.88:1,P=[b0,lerp3(b0,kn,.5),kn,lerp3(kn,tp,.5),tp,cw].map((q,i)=>i?add(b0,mul(sub(q,b0),fl)):q),ifn=bi('dita'+sd),ipt=bi('punte'+sd);
    tube(m,P,[.66*hs,.6*hs,.6*hs,.52*hs,.45*hs,.06*hs],8,(p,t,an,i)=>({c:i>=4?Z.nail:mixc(Z.skin,Z.skinD,.3+t*.3),k:i>=4?K(4,.55,.6):K(1,0,.75),w:i<=1?[[ih,1-i*.3],[ifn,i*.3]]:i===2?[[ifn,.6],[ipt,.4]]:[[ipt,1]]}),{cap0:'ball',cap1:'point',tip:.3})}
  return{fw,pd,hd,palm}}
const K3D={TAU,cl,lerp,sm,ez,add,sub,mul,dot,cross,len,nrm,lerp3,hash,hex,mixc,Q0,qmul,qax,qrot,qnl,qmat,qframe,rx,ry,rz,qq,ik,stepper,ZC,K,frameOf,
  Mesh,perp,tube,ball,smoothNormals,skel,solve,mix,joints,bake,pack,zHead,zArm};
if(typeof module!=='undefined'&&module.exports)module.exports=K3D;else root.K3D=K3D;
})(typeof window!=='undefined'?window:this);
