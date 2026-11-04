// Mossbound · lo zombie base in 3D vero (Denis, 3 novembre: «mi piace come l'hai fatto il modello in 3d in questa immagine che mi hai mandato
// senza meshy», «non serve accedere a meshy continua cosi»). È il nostro Zombie della cripta (CR.zombie di sprite/mostri/disegno_mostri.js:
// stesse misure, stessi pezzi, stessi colori), costruito nel codice come un modello vero: triangoli, uno scheletro con le ossa e i pesi, le
// ombre morbide cotte dove i pezzi si toccano; lo disegna sprite/mostri3d/mb3.js (tre toni come la lanterna, contorno spesso, luna sui bordi,
// occhi che brillano). Il disegno 2D di oggi non cambia.
// ZB3.build() → il modello (lo prende MB3.gpu/MB3.draw); ZB3.solve(M, ZB3.pose(mossa, p, o)) → la posa (posti e giri delle ossa);
// ZB3.mix(a, b, w) sfuma due pose; ZB3.joints(M, posa) → le matrici per il disegno. Ogni mossa dipende solo da p (0..1): ZB3.MOSSE.
// Spazio del modello: x a sinistra dello zombie, y in su, z davanti; unità come quelle del disegno 2D (alto circa 42).
(function(root){'use strict';
const TAU=Math.PI*2,cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k,sm=k=>{k=cl(k,0,1);return k*k*(3-2*k)},ez=k=>{k=cl(k,0,1);return k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2};
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len=a=>Math.hypot(a[0],a[1],a[2]),nrm=a=>{const l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l]},
  lerp3=(a,b,k)=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k),lerp(a[2],b[2],k)],hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s)};
const hex=h=>{const v=parseInt(h.slice(1),16);return[(v>>16&255)/255,(v>>8&255)/255,(v&255)/255]},mixc=(a,b,k)=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k),lerp(a[2],b[2],k)];
// the colours of the zombie of today (ZC of disegno_mostri.js), plus the ink of the lines
const Z={skin:hex('#88a46a'),skinD:hex('#647e4e'),rot:hex('#3f5233'),cloth:hex('#3b4956'),clothD:hex('#27313b'),pants:hex('#3d342c'),shoe:hex('#2a2420'),sole:hex('#141110'),
  bone:hex('#e6dcc0'),socket:hex('#141010'),eye:hex('#d9f45c'),mouth:hex('#2a0c0c'),gum:hex('#6a1a1a'),nail:hex('#1e1a14'),ink:hex('#1b1612'),hair:hex('#241d18')};
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
// ---------------------------------------------------------------- the skeleton (S = his left, +x; D = his right, -x)
const BN=['root','bacino','schiena','petto','collo','testa','mascella','spallaS','braccioS','avambraccioS','manoS','ditaS','punteS',
  'spallaD','braccioD','avambraccioD','manoD','ditaD','punteD','cosciaS','stincoS','piedeS','cosciaD','stincoD','piedeD'];
const BI={};BN.forEach((n,i)=>{BI[n]=i});
const PAR={bacino:'root',schiena:'bacino',petto:'schiena',collo:'petto',testa:'collo',mascella:'testa'};
for(const sd of['S','D']){Object.assign(PAR,{['spalla'+sd]:'petto',['braccio'+sd]:'spalla'+sd,['avambraccio'+sd]:'braccio'+sd,['mano'+sd]:'avambraccio'+sd,['dita'+sd]:'mano'+sd,
  ['punte'+sd]:'dita'+sd,['coscia'+sd]:'bacino',['stinco'+sd]:'coscia'+sd,['piede'+sd]:'stinco'+sd})}
const ARM={L1:5.8,L2:5.8},LEG={L1:4.3,L2:4.3},PV=[0,13.4,0],CH=[0,21.4,4.2],HC=[0,33.4,7],HR=8.2,ANK=2.0;
const aDir=s=>nrm([.34*s,-1,.22]);
function bindPose(){const P={root:[0,0,0],bacino:PV,schiena:[0,17,1.9],petto:CH,collo:[0,27.2,5.4],testa:[0,29.2,6.2],mascella:[0,30.4,9.2]};
  for(const s of[1,-1]){const sd=s>0?'S':'D',sh=[7*s,24.4,4.2],d=aDir(s);P['spalla'+sd]=[3.2*s,26,4.4];P['braccio'+sd]=sh;P['avambraccio'+sd]=add(sh,mul(d,ARM.L1));
    P['mano'+sd]=add(P['avambraccio'+sd],mul(d,ARM.L2));P['dita'+sd]=add(P['mano'+sd],mul(d,1.6));P['punte'+sd]=add(P['dita'+sd],mul(d,2.6));
    const hip=[3.4*s,10.1,0],an=[4.4*s,ANK,.8],[kn]=ik(hip,an,LEG.L1,LEG.L2,[0,.15,1]);P['coscia'+sd]=hip;P['stinco'+sd]=kn;P['piede'+sd]=an}
  return BN.map(n=>P[n])}
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
// paint(pt, t along 0..1, angle, ring point) → {c, k, w}; a piece seen also from inside goes in the cloth mesh (its material is dbl)
function tube(m,pts,rads,sides,paint,o){o=o||{};const n=pts.length,rings=[];let T=nrm(sub(pts[1],pts[0])),U=o.up?nrm(sub(o.up,mul(T,dot(o.up,T)))):perp(T);
  const L=[0];for(let i=1;i<n;i++)L.push(L[i-1]+len(sub(pts[i],pts[i-1])));const LT=L[n-1]||1;
  for(let i=0;i<n;i++){const Ti=i===0?nrm(sub(pts[1],pts[0])):i===n-1?nrm(sub(pts[n-1],pts[n-2])):nrm(sub(pts[i+1],pts[i-1]));
    U=nrm(sub(U,mul(Ti,dot(U,Ti))));const V=cross(Ti,U),ring=[];
    for(let j=0;j<sides;j++){const an=j/sides*TAU,dr=add(mul(U,Math.cos(an)),mul(V,Math.sin(an)));let r=rads[i],p=add(pts[i],mul(dr,r));
      if(i===n-1&&o.rag1){const tl=o.rag1(an);p=add(p,mul(Ti,tl.len));p=add(p,mul(dr,tl.out||0))}
      const pa=paint(p,L[i]/LT,an,i);ring.push(m.v(p,dr,pa.c,pa.k,pa.w))}rings.push({ring,T:Ti,U,V,c:pts[i],r:rads[i]})}
  for(let i=0;i<n-1;i++)for(let j=0;j<sides;j++){const a=rings[i].ring[j],b=rings[i].ring[(j+1)%sides],c=rings[i+1].ring[(j+1)%sides],d=rings[i+1].ring[j];m.t(a,b,c);m.t(a,c,d)}
  const cap=(rg,dir,kind,end)=>{if(kind==='open'||!kind)return;const C=rg.c,steps=kind==='point'?1:3;let prev=rg.ring;
    for(let s=1;s<=steps;s++){const k=s/steps,th=k*Math.PI/2,rr=rg.r*Math.cos(th),off=kind==='point'?rg.r*(o.tip||1.6):rg.r*Math.sin(th);
      if(s===steps){const p=add(C,mul(dir,off)),pa=paint(p,end,0,-1),ci=m.v(p,dir,pa.c,pa.k,pa.w);for(let j=0;j<sides;j++){const a=prev[j],b=prev[(j+1)%sides];if(dir===rg.T||dot(dir,rg.T)>0)m.t(a,b,ci);else m.t(a,ci,b)}break}
      const ring=[];for(let j=0;j<sides;j++){const an=j/sides*TAU,dr=add(mul(rg.U,Math.cos(an)),mul(rg.V,Math.sin(an))),p=add(add(C,mul(dir,off)),mul(dr,rr)),pa=paint(p,end,an,-1);
        ring.push(m.v(p,nrm(add(mul(dr,Math.cos(th)),mul(dir,Math.sin(th)))),pa.c,pa.k,pa.w))}
      for(let j=0;j<sides;j++){const a=prev[j],b=prev[(j+1)%sides],c=ring[(j+1)%sides],d=ring[j];if(dot(dir,rg.T)>0){m.t(a,b,c);m.t(a,c,d)}else{m.t(a,c,b);m.t(a,d,c)}}prev=ring}};
  cap(rings[0],mul(rings[0].T,-1),o.cap0,0);cap(rings[n-1],rings[n-1].T,o.cap1,1);return rings}
// a ball (an ellipsoid with radii r along the axes ax=[X,Y,Z]); shape(d) can push the surface in or out; paint(p, d) → {c, k, w}
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
// ---------------------------------------------------------------- the zombie
function build(){const B=bindPose(),m=Mesh(),bi=n=>BI[n],bp=n=>B[BI[n]],K=(kind,blood,ol)=>[kind,blood||0,0,ol===undefined?1:ol];
  // · the head: a big round ball, hollow sockets, a mouth too wide; the lower face goes with the jaw
  const HCc=HC,R=HR,eyes=[{d:nrm([-.4,.16,.8]),big:1.15},{d:nrm([.4,.16,.8]),big:.9}],MO=nrm([0,-.5,.8]),open=0;
  const frameOf=d=>{const ex=nrm(cross([0,1,0],d)),ey=cross(d,ex);return{ex,ey}};// ex: towards his left (+x) for a face looking forward; [ex, ey, d] turns the right way
  const ell=(d,c,ax,ay)=>{const f=frameOf(c),q=sub(d,mul(c,dot(d,c))),x=dot(q,f.ex),y=dot(q,f.ey);return{e:(x/ax)*(x/ax)+(y/ay)*(y/ay),x,y,front:dot(d,c)}};
  const spots=[[[.6,.62,-.45],.22],[[-.35,.38,-.85],.2],[[-.8,.55,.15],.16],[[-.15,.95,-.3],.15],[[.85,-.15,.45],.17],[[.25,-.75,-.6],.2]].map(([d,s])=>[nrm(d),s]);
  const ROT=nrm([.5,.85,-.15]);
  const mouthAt=d=>ell(d,MO,Math.sin(.52)*.98,Math.sin(.27)),sock=d=>eyes.map(E=>({E,q:ell(d,E.d,Math.sin(.3*E.big),Math.sin(.34*E.big))}));
  const headShape=d=>{let k=0;for(const{E,q} of sock(d))if(q.front>0&&q.e<1.25)k-=R*.2*Math.pow(1-Math.min(1,q.e/1.25),.7);
    const mq=mouthAt(d);if(mq.front>0&&mq.e<1.2)k-=R*.17*Math.pow(1-Math.min(1,mq.e/1.2),.6);return k};
  const jawW=d=>{const mq=mouthAt(d);const below=sm((-mq.y-.02)/.14),near=sm((mq.front-Math.cos(1.05))/(Math.cos(.55)-Math.cos(1.05)));return below*near};
  m.group(1);
  ball(m,HCc,[R,R*.97,R],44,30,(p,d)=>{let c=Z.skin.slice(),kind=1,blood=0;
      for(const[s,sz] of spots){const a=dot(d,s);c=mixc(c,Z.skinD,sm((a-Math.cos(sz*1.25))/(Math.cos(sz*.8)-Math.cos(sz*1.25)))*.9)}
      {const a=dot(d,ROT);c=mixc(c,Z.rot,sm((a-Math.cos(.36))/(Math.cos(.22)-Math.cos(.36)))*.95)}
      for(const{E,q} of sock(d)){if(q.front<=0)continue;c=mixc(c,mixc(Z.skinD,Z.rot,.5),sm((1.6-q.e)/.5)*.8);if(q.e<1)c=mixc(c,Z.socket,sm((1-q.e)/.35));if(q.e<1)kind=6}
      const mq=mouthAt(d);if(mq.front>0){c=mixc(c,mixc(Z.skinD,Z.rot,.4),sm((1.5-mq.e)/.4)*.7);if(mq.e<1){c=mixc(Z.gum,Z.mouth,sm((.55-mq.y/Math.sin(.27))/.4));kind=6}
        if(mq.y<0&&mq.e>.9&&mq.e<2.6)blood=.7*sm((mq.e-.9)/.3)*(1-sm((mq.e-1.8)/.8))}
      const wj=jawW(d);return{c,k:K(kind,blood),w:wj>0?[[bi('testa'),1-wj],[bi('mascella'),wj]]:[[bi('testa'),1]]}},{shape:headShape});
  // the back of the mouth: a dark ball inside the head, so an open mouth is never a hole
  ball(m,add(HCc,mul(MO,R*.45)),[R*.42,R*.3,R*.32],12,8,()=>({c:Z.mouth,k:K(6,0,0),w:[[bi('testa'),.55],[bi('mascella'),.45]]}));
  // eyes: little lights deep in the sockets, with a white spark
  for(const E of eyes){const er=1.02*E.big,cen=add(HCc,mul(E.d,R-R*.2*.82+er*.35));
    ball(m,cen,[er,er,er*.8],12,8,()=>({c:Z.eye,k:K(9,0,0),w:[[bi('testa'),1]]}),{ax:[frameOf(E.d).ex,frameOf(E.d).ey,E.d]});
    const f=frameOf(E.d),sp=add(add(cen,mul(E.d,er*.72)),add(mul(f.ex,-er*.42),mul(f.ey,er*.42)));ball(m,sp,[er*.3,er*.3,er*.2],8,6,()=>({c:[1,1,1],k:K(9,0,0),w:[[bi('testa'),1]]}))}
  // teeth: four crooked ones above (one longer), three below on the jaw
  const onFace=(x,y,dz)=>{const f=frameOf(MO),dd=nrm(add(add(MO,mul(f.ex,x)),mul(f.ey,y))),k=headShape(dd);return add(HCc,mul(dd,R+k+(dz||0)))};
  const tooth=(base,dir,len,r,bn,seed)=>{const f=frameOf(MO),tw=(hash(seed)-.5)*.5,d2=nrm(add(dir,add(mul(f.ex,tw),mul(MO,.25))));
    tube(m,[base,add(base,mul(d2,len*.6)),add(base,mul(d2,len))],[r,r*.8,r*.35],7,(p,t)=>({c:mixc(mixc(Z.bone,[.62,.55,.38],.35*(1-t)),Z.bone,t*.6),k:K(5,0,.3),w:[[bi(bn),1]]}),{cap0:'open',cap1:'point',tip:.5})};
  {const f=frameOf(MO),ay=Math.sin(.27);for(let i=0;i<4;i++){const x=(-.75+i*.5)*Math.sin(.52)*.98;tooth(onFace(x,ay*.62,.25),mul(f.ey,-1),i===1?2.5:1.6+hash(i+3)*.5,.6,'testa',i)}
    for(let i=0;i<3;i++){const x=(-.5+i*.5)*Math.sin(.52)*.98;tooth(onFace(x,-ay*.7,.25),f.ey,1.3+hash(i+9)*.5,.55,'mascella',i+20)}}
  // a few hairs on top, a stitched crack on the back, a scar on his right
  for(let i=-1.5;i<=1.5;i++){const d=nrm([-.5*i,1,-.25+.1*Math.abs(i)]),r0=add(HCc,mul(d,R*.96)),mid=add(r0,[-i*.55,2.1,-.35]),tip=add(r0,[-i*1.45,3.1-.3*Math.abs(i),-1.1]);
    tube(m,[r0,mid,tip],[.36,.26,.12],6,()=>({c:Z.hair,k:K(0,0,.45),w:[[bi('testa'),1]]}),{cap0:'open',cap1:'point',tip:.6})}
  const line=(cdir,pts,r)=>{const f=frameOf(cdir),P=[];for(const[x,y] of pts){const dd=nrm(add(add(cdir,mul(f.ex,x/R)),mul(f.ey,y/R)));P.push(add(HCc,mul(dd,R*.995+r*.4)))}
    tube(m,P,P.map(()=>r),5,()=>({c:Z.ink,k:K(0,0,0),w:[[bi('testa'),1]]}),{cap0:'ball',cap1:'ball'})};
  {const cb=nrm([-.1,.25,-1]);line(cb,[[-3,-2],[-1.5,-1],[0,0],[1.3,-1.2],[2.6,-2.4]],.28);for(let i=0;i<3;i++){const x=-2.4+i*2.2;line(cb,[[x-.8,-2.6+i*.4+1.1],[x+.8,-.4+i*.4-1.1]],.22)}
    const cs=nrm([-1,-.1,.15]);line(cs,[[-2,-2],[0,0],[2,2]],.26);line(cs,[[-1.4,.6],[-.2,-.8]],.2);line(cs,[[.4,1.8],[1.6,.4]],.2)}
  // · the neck: short, the head sits almost on the shoulders
  m.group(2);
  {const a=[0,27.4,5.5],b=[0,30.2,6.5];tube(m,[a,lerp3(a,b,.5),b],[3.9,3.6,3.4],16,(p,t)=>({c:mixc(Z.skinD,Z.skin,.4+t*.5),k:K(1),w:t<.5?[[bi('petto'),.5-t],[bi('collo'),.5+t]]:[[bi('collo'),1.5-t],[bi('testa'),t-.5]]}),{cap0:'open',cap1:'open'})}
  // · the shirt: a torn tube from below the hips to the collar, a hole on the front over the ribs, buttons on the back, a tear
  m.group(3);
  const A=nrm(sub(CH,PV)),HOLE=nrm([.55,-.1,.82]),TEAR=nrm([-.85,.35,-.5]);
  const holeIn=p=>{const d=nrm(sub(p,CH)),f=frameOf(HOLE),q=sub(d,mul(HOLE,dot(d,HOLE))),x=dot(q,f.ex),y=dot(q,f.ey),an=Math.atan2(y,x),
    jag=1+.22*Math.sin(an*7+1.3)+.12*Math.sin(an*13+.4);return dot(d,HOLE)>0&&(x*x/(.42*.42)+y*y/(.34*.34))<jag*jag};
  const torsoW=p=>{const t=dot(sub(p,PV),A)/len(sub(CH,PV));if(t<.15)return[[bi('bacino'),1]];if(t<.55){const k=sm((t-.15)/.4);return[[bi('bacino'),1-k],[bi('schiena'),k]]}
    const k=sm((t-.55)/.45);return[[bi('schiena'),1-k],[bi('petto'),k]]};
  const shirt=Mesh();shirt.group(3);
  {const ring=[],LC=len(sub(CH,PV));ring.push([add(PV,[0,-3.5,-.35]),6.2],[add(PV,[0,-2.6,-.25]),6.35],[add(PV,[0,-1.3,-.1]),6.5],[PV,6.55]);
    for(const t of[.25,.5,.75])ring.push([lerp3(PV,CH,t),lerp(6.55,8.45,t)+Math.sin(t*Math.PI)*.35]);ring.push([CH,8.45]);
    for(const th of[.3,.6,.85,1.02])ring.push([add(CH,mul(A,8.45*Math.sin(th))),8.45*Math.cos(th)]);ring.push([add(CH,mul(A,8.45*.9)),3.85]);
    const pts=ring.map(r=>r[0]),rads=ring.map(r=>r[1]);
    const rings=tube(shirt,pts,rads,40,(p,t,an,i)=>{const nearH=sm((1.15-(()=>{const d=nrm(sub(p,CH));const f=frameOf(HOLE),q=sub(d,mul(HOLE,dot(d,HOLE)));return Math.hypot(dot(q,f.ex)/.42,dot(q,f.ey)/.34)})())/.6)*(dot(nrm(sub(p,CH)),HOLE)>0?1:0);
        const collar=sm((t-.82)/.12)*sm((dot(nrm(sub(p,CH)),[0,-.2,1])-.1)/.5);let c=mixc(Z.cloth,Z.clothD,sm((.25-t)/.25)*.5);
        return{c,k:K(2,Math.max(nearH*.85,collar*.55)),w:torsoW(p)}},
      {cap0:'open',cap1:'open',up:[0,0,1],rag1:null});
    // the ragged hem: the first ring hangs down in teeth (like the 2D trunk), the cloth folds in a little on the inside
    const r0=rings[0];for(let j=0;j<r0.ring.length;j++){const an=j/r0.ring.length*TAU,v=r0.ring[j],tl=Math.max(0,Math.sin(an*4.5+.6))*(.9+.8*hash(j*.37))+(j%3===0?.4:0);
      shirt.P[v*3+1]-=tl;shirt.P[v*3]*=1.02;shirt.P[v*3+2]=PV[2]-.4+(shirt.P[v*3+2]-(PV[2]-.4))*1.02}
    // the hole: its triangles go, the edge stays torn
    const I=shirt.I,keep=[];for(let t=0;t<I.length;t+=3){let inn=0;for(let q=0;q<3;q++){const v=I[t+q];if(holeIn([shirt.P[v*3],shirt.P[v*3+1],shirt.P[v*3+2]]))inn++}if(inn<2)keep.push(I[t],I[t+1],I[t+2])}shirt.I=keep}
  // under the hole: the rotten chest and the ribs
  m.group(3);
  {const f=frameOf(HOLE);ball(m,CH,[7.35,7.35,7.35],28,20,(p,d)=>({c:mixc(mixc(Z.rot,Z.socket,.45),Z.skinD,.12+.2*hash(Math.floor(d[0]*40)+Math.floor(d[1]*40)*7)),k:K(1,.45),w:torsoW(p)}));
    for(let i=0;i<3;i++){const y=(-.2+i*.17),n=i===2?2:4,P=[];for(let k=-n;k<=n;k++){const dd=nrm(add(add(HOLE,mul(f.ex,k*.1+(i===2?-.12:0))),mul(f.ey,y+.03*(n*n-k*k)*.22)));P.push(add(CH,mul(dd,7.55)))}
      tube(m,P,P.map((_,k)=>.3-Math.abs(k-n)*.03),7,()=>({c:mixc(Z.bone,[.75,.68,.5],.25),k:K(5,.3,.45),w:[[bi('petto'),1]]}),{cap0:'ball',cap1:'ball'})}}
  // three green buttons down the back
  for(let i=0;i<3;i++){const d=nrm([0,.55-i*.42,-1]),c=add(CH,mul(d,8.35)),f=frameOf(d);ball(m,c,[1.3,1.3,.55],12,8,()=>({c:Z.skinD,k:K(4,0,.55),w:[[bi('petto'),1]]}),{ax:[f.ex,f.ey,d]})}
  // a tear across the lower back, and the stitches of a patch on his right flank
  {const f=frameOf(TEAR),P=[[-1,-3],[1.2,0],[-.4,2.6],[1,4]].map(([x,y])=>{const dd=nrm(add(add(TEAR,mul(f.ex,x/6.5)),mul(f.ey,y/6.5)));return add(lerp3(PV,CH,.2),mul(dd,6.95))});
    tube(m,P,P.map(()=>.3),5,()=>({c:Z.ink,k:K(0,0,0),w:[[bi('bacino'),1]]}),{cap0:'ball',cap1:'ball'})}
  // · the arms: thin and bony, a knobbly elbow, a tight torn sleeve, a small palm with three long hooked fingers and black claws
  for(const s of[1,-1]){const sd=s>0?'S':'D',sh=bp('braccio'+sd),el=bp('avambraccio'+sd),wr=bp('mano'+sd),d=aDir(s),ib=bi('braccio'+sd),ie=bi('avambraccio'+sd),ih=bi('mano'+sd);
    m.group(10+(s>0?0:1));
    const armW=p=>{const t=dot(sub(p,sh),d)/ARM.L1;if(t<.82)return[[ib,1]];if(t<1.18){const k=sm((t-.82)/.36);return[[ib,1-k],[ie,k]]}
      const t2=dot(sub(p,el),d)/ARM.L2;if(t2<.86)return[[ie,1]];const k=sm((t2-.86)/.28);return[[ie,1-k],[ih,k]]};
    const pts=[sub(sh,mul(d,1.2)),sh,lerp3(sh,el,.5),el,lerp3(el,wr,.5),wr,add(wr,mul(d,.8))],rads=[1.75,1.75,1.3,1.5,1.12,1.05,1.0];
    tube(m,pts,rads,14,(p,t)=>({c:mixc(Z.skin,Z.skinD,.15+.35*t),k:K(1,0,cl(dot(sub(p,sh),d)/1.5,0,1)),w:armW(p)}),{cap0:'ball',cap1:'ball'});
    // the elbow knob, on the outside of the bend
    {const pole=nrm([.6*s,-.3,-1]),kc=add(el,mul(pole,.55));ball(m,kc,[1.5,1.5,1.5],12,8,(p)=>({c:Z.skin,k:K(1),w:[[ib,.5],[ie,.5]]}))}
    // the sleeve: tight, torn, three teeth hanging down the arm
    const sl0=sub(sh,mul(d,1.6)),sl1=add(sh,mul(d,ARM.L1*.36));shirt.group(10+(s>0?0:1));
    tube(shirt,[sl0,sh,lerp3(sh,sl1,.5),sl1],[2.35,2.4,2.3,2.15],16,(p,t)=>({c:mixc(Z.cloth,Z.clothD,.15),k:K(2,0,cl(t*2,0,1)),w:t<.35?[[bi('spalla'+sd),1-sm(t/.35)],[ib,sm(t/.35)]]:[[ib,1]]}),
      {cap0:'open',cap1:'open',rag1:an=>({len:Math.max(0,Math.sin(an*1.5+(s>0?.4:2.2)))*1.6*(1+.4*hash(an*3+s)),out:.05})});
    // the hand and its fingers
    m.group(12+(s>0?0:1));
    const fw=nrm(cross(d,[0,0,1]))/* across the palm */,pd=nrm(cross(fw,d))/* where the palm faces */,palm=add(wr,mul(d,1.15));
    ball(m,palm,[1.55,1.85,1.05],14,10,(p)=>({c:Z.skin,k:K(1),w:[[ih,1]]}),{ax:[fw,mul(d,1),pd]});
    for(let k=-1;k<=1;k++){const dir=nrm(add(d,mul(fw,k*.38))),b0=add(add(palm,mul(dir,1.3)),mul(fw,k*.65)),kn=add(b0,mul(dir,2.4)),tp=add(add(kn,mul(dir,2.2)),mul(pd,-.9)),cw=add(add(tp,mul(dir,.9)),mul(pd,-1.3));
      const fl=k?.88:1,P=[b0,lerp3(b0,kn,.5),kn,lerp3(kn,tp,.5),tp,cw].map((q,i)=>i?add(b0,mul(sub(q,b0),fl)):q),ifn=bi('dita'+sd),ipt=bi('punte'+sd);
      tube(m,P,[.66,.6,.6,.52,.45,.06],8,(p,t,an,i)=>({c:i>=4?Z.nail:mixc(Z.skin,Z.skinD,.3+t*.3),k:i>=4?K(4,.55,.6):K(1,0,.75),w:i<=1?[[ih,1-i*.3],[ifn,i*.3]]:i===2?[[ifn,.6],[ipt,.4]]:[[ipt,1]]}),{cap0:'ball',cap1:'point',tip:.3})}}
  // · the legs: torn trousers, a bony ankle, a big old shoe flat on the ground
  for(const s of[1,-1]){const sd=s>0?'S':'D',hp=bp('coscia'+sd),kn=bp('stinco'+sd),an=bp('piede'+sd),it=bi('coscia'+sd),is=bi('stinco'+sd),ift=bi('piede'+sd);
    m.group(20+(s>0?0:1));
    const legW=p=>{const ab=sub(kn,hp),t=dot(sub(p,hp),ab)/dot(ab,ab);if(t<.15)return[[bi('bacino'),.5-t*2],[it,.5+t*2]];if(t<.8)return[[it,1]];if(t<1.15){const k=sm((t-.8)/.35);return[[it,1-k],[is,k]]}return[[is,1]]};
    const hem=add(an,[0,1.2,0]);shirt.group(20+(s>0?0:1));
    tube(shirt,[add(hp,[0,1.6,0]),hp,lerp3(hp,kn,.5),kn,lerp3(kn,hem,.5),hem],[2.45,2.5,2.4,2.25,2.15,2.3],16,(p,t)=>({c:mixc(Z.pants,[.12,.1,.085],sm((t-.6)/.4)*.4),k:K(3,s<0&&t>.45&&t<.62?.6:0),w:legW(p)}),
      {cap0:'open',cap1:'open',rag1:a=>({len:Math.max(0,Math.sin(a*2.5+s))*1.1*(1+.5*hash(a*5+s*3)),out:.12})});
    tube(m,[lerp3(kn,an,.55),add(an,[0,.4,0]),add(an,[0,-.6,.15])],[1.15,1.05,1.1],10,(p,t)=>({c:mixc(Z.skinD,Z.rot,.3),k:K(1),w:t<.5?[[is,1]]:[[is,.4],[ift,.6]]}),{cap0:'open',cap1:'open'});
    const heel=add(an,[0,-.15,-1.5]),toe=add(an,[s*.15,-.35,2.9]);
    tube(m,[heel,lerp3(heel,toe,.35),lerp3(heel,toe,.7),toe],[1.95,2.05,2.1,2.0],16,(p,t)=>({c:p[1]<.7?Z.sole:Z.shoe,k:K(4,0,1),w:[[ift,1]]}),{cap0:'ball',cap1:'ball',up:[s,0,0]})}
  // the soles flat on the ground
  for(let i=0;i<m.P.length/3;i++)if(m.G[i]>=20&&m.P[i*3+1]<.25&&m.K[i*4]===4){m.P[i*3+1]=.25}
  // · the soft shadow where pieces meet (balls that stand for the pieces; a piece does not shadow itself)
  const OCC=[[HC,HR,1],[CH,8.4,3],[PV,6.4,3],[lerp3(PV,CH,.5),7.4,3],[[0,28.6,5.9],3.8,2]];
  for(const s of[1,-1]){const sd=s>0?'S':'D',sh=bp('braccio'+sd),el=bp('avambraccio'+sd),wr=bp('mano'+sd),g=10+(s>0?0:1);
    for(let k=0;k<=4;k++)OCC.push([lerp3(sh,el,k/4),1.5,g]);for(let k=1;k<=4;k++)OCC.push([lerp3(el,wr,k/4),1.2,g]);OCC.push([add(wr,mul(aDir(s),2.5)),1.9,12+(s>0?0:1)]);
    const hp=bp('coscia'+sd),kn=bp('stinco'+sd),an=bp('piede'+sd),gl=20+(s>0?0:1);for(let k=0;k<=3;k++)OCC.push([lerp3(hp,kn,k/3),2.4,gl]);for(let k=1;k<=3;k++)OCC.push([lerp3(kn,an,k/3),2.2,gl]);OCC.push([add(an,[0,-.2,.8]),2.1,gl])}
  const bake=M=>{for(let i=0;i<M.P.length/3;i++){const p=[M.P[i*3],M.P[i*3+1],M.P[i*3+2]],n=[M.N[i*3],M.N[i*3+1],M.N[i*3+2]],g=M.G[i];let o=0;
      for(const[c,r,gg] of OCC){if(gg===g||(g===1&&gg===2)||(g===2&&gg===1)||(g>=12&&g<=13&&gg===g-2))continue;const v=sub(c,p),dd=len(v);if(dd<r*.8)continue;const ct=dot(n,v)/dd;if(ct<=0)continue;o+=ct*r*r/(dd*dd)}
      o+=cl((2.5-p[1])/2.5,0,1)*.25*(g>=20?1:0);// near the ground
      M.K[i*4+2]=cl(o*.75,0,.72)}};
  bake(m);bake(shirt);
  // ---- into the shape MB3 wants: one piece seen from outside, one also from inside (shirt, sleeves, trousers)
  const prim=(M,mat)=>({pos:Float32Array.from(M.P),nrm:Float32Array.from(M.N),uv:null,col:Float32Array.from(M.C),knd:Float32Array.from(M.K),jnt:Float32Array.from(M.J),wgt:Float32Array.from(M.W),
    idx:Uint32Array.from(M.I),mat,node:0});
  const nodes=BN.map((n,i)=>({i,name:n,t:[0,0,0],r:[0,0,0,1],s:[1,1,1],m:null,kids:[],parent:PAR[n]===undefined?-1:BI[PAR[n]]}));
  const ibm=new Float32Array(BN.length*16);BN.forEach((n,j)=>{const o=j*16;ibm[o]=ibm[o+5]=ibm[o+10]=ibm[o+15]=1;ibm[o+12]=-B[j][0];ibm[o+13]=-B[j][1];ibm[o+14]=-B[j][2]});
  const M={nodes,order:BN.map((_,i)=>i),skin:{joints:BN.map((_,i)=>i),ibm},imgs:[],mats:[{name:'pelle'},{name:'stoffa',dbl:true}],prims:[prim(m,0),prim(shirt,1)],
    clips:[],byName:BI,ns:.3,bind:B,tri:(m.I.length+shirt.I.length)/3,vert:(m.P.length+shirt.P.length)/3};
  return M}
// ---------------------------------------------------------------- the moves (each depends only on p, 0..1: the last frame meets the first)
// o.look: where you are, seen from him (radians round the up axis, 0 = in front): the head snaps that way
const MOSSE={fermo:{n:'Fermo',dur:6,loop:1},cammina:{n:'Cammina',dur:1.5,loop:1},corre:{n:'Corre',dur:.74,loop:1},sbuca:{n:'Sbuca da terra',dur:3.2},
  urla:{n:'Urla',dur:2.3},colpo:{n:'Colpo',dur:1.4},morso:{n:'Morso',dur:1.5},colpito:{n:'Colpito',dur:.7},muore:{n:'Muore',dur:2.8,hold:1}};
// feet that step (stepper() of disegno_mostri.js): planted for `share` of the cycle sliding back, then swung forward and lifted
const stepper=(p,share)=>(k,S,H)=>{const q=((p+k)%1+1)%1;if(q<share)return{x:S-q/share*2*S,z:0,up:0};const u=(q-share)/(1-share);return{x:-S+ez(u)*2*S,z:Math.sin(u*Math.PI)*H,up:Math.sin(u*Math.PI)}};
const FW=s=>nrm([aDir(s)[1],-aDir(s)[0],0]);// across the palm (the fingers hook round it)
function pose(id,p,o){o=o||{};p=cl(p,0,1);const ph=p*TAU,sp={root:{p:[0,0,0],q:Q0()},r:{},arm:{},leg:{},emK:1};const R=sp.r,look=cl(o.look||0,-1.2,1.2);
  const turn=(b,q)=>{R[b]=R[b]?qmul(R[b],q):q};
  const curl=(sd,k)=>{const s=sd==='S'?1:-1,ax=mul(FW(s),-1);turn('dita'+sd,qax(ax,k*.9));turn('punte'+sd,qax(ax,k*1.05))};
  const jaw=a=>turn('mascella',rx(-a*.55));
  const arm=(sd,t,pole,wrist,rel)=>{const s=sd==='S'?1:-1;sp.arm[sd]={t,rel:rel||'petto',pole:pole||[.6*s,-1,-.15],wrist:wrist||Q0()}};
  const feet=(lS,lD)=>{sp.leg.S=lS||{t:[4.4,ANK,.8]};sp.leg.D=lD||{t:[-4.4,ANK,.8]}};
  const snap=(k0,k1,k2,k3)=>p<k0?0:p<k1?sm((p-k0)/(k1-k0)):p<k2?1:1-sm((p-k2)/(k3-k2));
  switch(id){
  case 'fermo':{// still, hunched, arms hanging forward… then the head snaps round towards you, stays, and slowly comes back; a tremor now and then
    sp.root.p=[0,Math.sin(ph)*.12,0];turn('bacino',rz(Math.sin(ph)*.025));turn('schiena',rx(.08+Math.sin(ph*2)*.012));turn('petto',rx(.06));
    const g=snap(.55,.574,.8,.97);turn('collo',qq(ry(look*.38*g),rz(.1*(1-g))));turn('testa',qq(ry(look*.62*g),rz(.26*(1-g)-.05*g),rx(.12-.16*g)));
    const tr=p>.22&&p<.31?Math.sin(p*TAU*48)*Math.sin((p-.22)/.09*Math.PI):0,tr2=p>.66&&p<.7?Math.sin(p*TAU*60)*Math.sin((p-.66)/.04*Math.PI):0;
    for(const sd of['S','D']){const s=sd==='S'?1:-1,w=Math.sin(ph+s)*.4;arm(sd,[9.6*s,-1+w,9.6],[.6*s,-1,-.1],qq(rx(.12),rz(sd==='D'?tr*.3:0)));curl(sd,.35+Math.sin(ph*3+s)*.06+(sd==='D'?tr*.25:0))}
    turn('spallaD',rz(-tr2*.08));feet();jaw(.2+Math.sin(ph*2)*.06);break}
  case 'cammina':{// a limp: the left leg drags with short low steps, the right one does the work; the head bent too far, a jerk now and then
    const st=stepper(p,.56),fL=st(0,2.6,.6),fR=st(.5,4.2,2.2),spread=Math.abs(fL.x-fR.x)/6.8,bob=-spread*1.4,roll=.3-Math.sin(ph)*1.3;
    sp.root.p=[-roll*.12,bob,0];turn('bacino',qq(rz(-roll*.03),ry(Math.sin(ph)*.07)));turn('schiena',qq(rx(.12),rz(roll*.025)));turn('petto',qq(rx(.06),ry(-Math.sin(ph)*.1)));
    feet({t:[4.2,ANK+fL.z,.8+fL.x],foot:rx(fL.up*.45)},{t:[-4.5,ANK+fR.z,.8+fR.x],foot:rx(-fR.up*.2+(fR.z>0?.1:0))});
    const j=snap(.6,.62,.64,.72);turn('collo',rz(.12+j*.14));turn('testa',qq(rz(.42+j*.36),rx(.1+Math.sin(ph*2+.6)*.06),ry(j*.32)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1,sw=Math.sin(ph+(s>0?Math.PI:0))*1.1;arm(sd,[10*s,-.5+sw,10+sw*.4],[.6*s,-1,0],rx(.1));curl(sd,.3+.1*Math.sin(ph+s))}
    jaw(.32+.1*Math.sin(ph*2));break}
  case 'corre':{// hunched right over, long strides, arms grabbing the air in front
    const st=stepper(p,.42),fL=st(0,4.6,2.8),fR=st(.5,4.6,2.8),bob=-Math.abs(fL.x-fR.x)/9.2*1.6+Math.abs(Math.sin(ph*2))*.6;
    sp.root.p=[0,bob,0];turn('bacino',qq(rx(.12),ry(Math.sin(ph)*.12)));turn('schiena',rx(.22));turn('petto',qq(rx(.12),ry(-Math.sin(ph)*.14)));
    feet({t:[4.1,ANK+fL.z,.8+fL.x],foot:rx(fL.up*.5)},{t:[-4.1,ANK+fR.z,.8+fR.x],foot:rx(fR.up*.5)});
    turn('collo',rx(-.12));turn('testa',qq(rx(-.1),rz(.22+Math.sin(ph*2)*.05)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1,sw=Math.sin(ph+(s>0?Math.PI:0));arm(sd,[9.4*s,1.5+sw*2.2,11+sw*2],[.6*s,-1,0],rx(-.1));curl(sd,.55+.3*sw)}
    jaw(.55+.15*Math.sin(ph*2));break}
  case 'sbuca':{// out of the ground: the head first, slowly, with the claws coming up beside it; the hands slap down on the ground and he
    // drags himself out in two jerks, steps out, stands, and his head snaps round towards you
    const rise=p<.1?0:p<.32?.42*ez((p-.1)/.22):p<.34?.42:p<.5?.42+.18*ez((p-.34)/.16):p<.53?.6:p<.72?.6+.27*ez((p-.53)/.19):p<.9?.87+.13*ez((p-.72)/.18):1,y=-46*(1-rise);
    const tilt=.16*sm((p-.3)/.1)*(1-sm((p-.72)/.2))+.06*Math.sin(p*TAU*7)*sm((p-.34)/.05)*(1-sm((p-.7)/.05));sp.root.p=[0,y,-Math.sin(tilt)*20];sp.root.q=rx(tilt);
    // the hands: straight up beside the head while it rises, then flat on the ground beside him, pushing; at the end back to his sides
    const down=sm((p-.32)/.08),out=sm((p-.76)/.12),gD=[-8.5,1.3,7],gS=[8.8,1.3,7.6];
    for(const sd of['S','D']){const s=sd==='S'?1:-1,upT=[6.4*s,15+Math.sin(p*TAU*5+s)*.8,3.5],g=sd==='S'?gS:gD;
      if(out>=1||(p>.76&&out>.5))arm(sd,[9.6*s,-1,9.6],[.6*s,-1,-.1],rx(.12));
      else if(down<=0)arm(sd,upT,[.7*s,-.2,-1],rx(-.4));
      else{const P=add([0,y,-Math.sin(tilt)*20],[0,21.4,4.2]),wUp=add(P,upT);arm(sd,lerp3(wUp,g,down),[.6*s,-.7,-1],rx(.5),'mondo')}
      curl(sd,p<.32?.15+.1*Math.sin(p*TAU*4+s):.45)}
    sp.leg.S={t:[4.4,ANK,.8],rel:p<.9?'corpo':'terra'};sp.leg.D={t:[-4.4,ANK,.8],rel:p<.9?'corpo':'terra'};
    const g=snap(.9,.925,1.5,2);turn('schiena',rx(.12+.2*down*(1-out)));
    turn('collo',qq(rz(.3*(1-g)),ry(look*.35*g),rx(-.15*(1-down))));turn('testa',qq(rz(.32*(1-g)),rx(-.3*(1-down)-.15*down*(1-out)+.1),ry(look*.6*g)));jaw(.45+.2*Math.sin(ph*6));break}
  case 'urla':{// back, back… then the scream: head thrust up, jaw wide open, arms spread, the whole body shaking
    const k1=sm(p/.25),k2=snap(.25,.36,.76,1),tb=k2*Math.sin(p*TAU*38)*.035,pre=k1*(1-k2);
    sp.root.p=[0,-.6*pre,-1*pre];turn('schiena',rx(.06-.26*pre+.18*k2+tb));turn('petto',rx(-.2*pre+.12*k2+tb));turn('collo',rx(-.25*pre-.05*k2));turn('testa',qq(rx(-.38*pre-.32*k2+tb*2),rz(tb*3)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,lerp3(lerp3([8.2*s,-4.2,8.4],[10.5*s,1.5,-1.5],pre),[12.4*s,4.5,5.5],k2),[.6*s,-1,-.3]);curl(sd,.2+.6*pre-.15*k2);turn('spalla'+sd,rz(-s*(.18*pre+.1*k2)))}
    feet();jaw(.15+.85*k2+tb*4);sp.emK=1+.9*k2;break}
  case 'colpo':{// it rears back with both arms high over its head, then lunges and rakes them down (the attack of disegno_mostri.js)
    let up=0,reach=0,lunge=0;if(p<.35){up=ez(p/.35);lunge=-up*2}else if(p<.6){const k=ez((p-.35)/.25);up=1-k*1.3;reach=k;lunge=-2+k*7}else{const k=ez((p-.6)/.4);up=-.3*(1-k);reach=1-k;lunge=5*(1-k)}
    const upP=Math.max(0,up);sp.root.p=[0,-.5*reach,lunge*.6];turn('schiena',rx(.06-.24*upP+.3*reach));turn('petto',rx(-.12*upP+.16*reach));turn('testa',rx(-.15*upP+.2*reach));
    for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,[s*(10+upP*2-reach*2),-.5+up*15.5,10-upP*12+reach*5],[.6*s,-1+1.5*upP,-.3*upP]);curl(sd,.15+.5*reach*(p>.45?1:0));turn('spalla'+sd,rz(-s*.2*upP))}
    feet(null,{t:[-4.4,ANK+Math.max(0,Math.sin(cl((p-.33)/.3,0,1)*Math.PI))*1.6,.8+cl(lunge,0,5)*.9]});jaw(p>.25&&p<.7?.85:.25);break}
  case 'morso':{// it pulls back with the jaw wide open… snaps forward and bites, shakes its head as it tears, and comes back
    const pr=sm(p/.42),st=snap(.42,.5,.72,1),bk=pr*(1-st),sh=p>.5&&p<.7?Math.sin((p-.5)/.2*TAU*3)*sm((p-.5)/.03)*(1-sm((p-.66)/.04)):0;
    sp.root.p=[0,-.5*bk,-1.6*bk+3.4*st];turn('schiena',rx(.06-.2*bk+.36*st));turn('petto',rx(-.14*bk+.24*st));turn('collo',rx(-.28*bk+.18*st));turn('testa',qq(rx(-.34*bk+.36*st),ry(sh*.22),rz(.15*bk)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,[(7.4-2*st)*s,-1+1.2*bk,10.5+2.5*st],[.6*s,-1,-.1]);curl(sd,.2+.75*st)}
    feet(null,{t:[-4.4,ANK+Math.max(0,Math.sin(cl((p-.4)/.18,0,1)*Math.PI))*1.2,.8+2.6*st]});jaw(p<.47?pr:p<.5?pr*(1-sm((p-.47)/.03)):.15+.2*(1-st));break}
  case 'colpito':{// a jolt back, the head whipping round, then back with a wobble
    const b=p<.16?sm(p/.16):Math.exp(-(p-.16)*6.5)*Math.cos((p-.16)*13);
    sp.root.p=[0,0,-1.8*b];turn('schiena',rx(.06-.38*b));turn('petto',rx(-.22*b));turn('collo',rz(.24*b));turn('testa',qq(rx(-.55*b),rz(.38*b)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1;arm(sd,lerp3([9.6*s,-1,9.6],[11*s,2.5,3],cl(b,0,1)),[.6*s,-1,-.2]);curl(sd,.35-.2*b)}
    feet();jaw(.2+.6*cl(b,0,1));break}
  case 'muore':{// hit… the knees give way, it slumps forward onto its face, one last twitch; the eyes go out
    const hit=p<.12?sm(p/.12):p<.2?1-sm((p-.12)/.08):0,kn=sm((p-.12)/.3),fall=ez(cl((p-.42)/.34,0,1)),tw=p>.84&&p<.9?Math.sin((p-.84)/.06*TAU*2):0;
    sp.root.p=[0,-7.2*kn+hit*0,-1.2*hit+1.5*fall];
    turn('bacino',rx(.25*kn+.35*fall));turn('schiena',rx(.06-.3*hit+.25*kn+.6*fall));turn('petto',rx(.15*kn+.35*fall));turn('collo',rx(.2*kn+.15*fall));
    turn('testa',qq(rx(-.4*hit+.3*kn-.1*fall),rz(.3*kn+tw*.08)));
    for(const sd of['S','D']){const s=sd==='S'?1:-1;const dn=[6.5*s,-11,3],fl=[8.5*s,1.2,17+s];
      if(fall>.02)arm(sd,lerp3(add([0,0,0],[6.5*s,-1,8]),fl,fall),[.6*s,-1,.2],rx(.4),fall>.5?'mondo':'petto');else arm(sd,lerp3([9.6*s,-1,9.6],dn,kn),[.6*s,-1,-.15]);
      curl(sd,.5+(sd==='D'?tw*.3:0))}
    feet();jaw(.25+.4*kn);sp.emK=1-.85*sm((p-.7)/.25);break}
  default:feet()}
  return sp}
// ---------------------------------------------------------------- posing: places and turns of the bones
// spec: {root:{p,q}, r:{bone: local turn}, arm:{S|D:{t (target), rel:'petto'|'mondo', pole, wrist (local turn of the hand), curl}},
//   leg:{S|D:{t, rel:'terra'|'corpo', pole, foot (turn of the foot in the body frame)}}, jaw, look}
function solve(M,sp){const B=M.bind,n=BN.length,wp=new Array(n),wr=new Array(n),r=sp.r||{};
  const rootQ=sp.root&&sp.root.q||Q0(),rootP=sp.root&&sp.root.p||[0,0,0];wp[0]=rootP;wr[0]=rootQ;
  const fk=j=>{const pa=BI[PAR[BN[j]]];wr[j]=qmul(wr[pa],r[BN[j]]||Q0());wp[j]=add(wp[pa],qrot(wr[pa],sub(B[j],B[pa])))};
  for(let j=1;j<n;j++){const nm=BN[j];
    if(/^(braccio|coscia)/.test(nm)){const isA=nm[0]==='b',sd=nm.slice(-1),ch=isA?sp.arm&&sp.arm[sd]:sp.leg&&sp.leg[sd];fk(j);if(!ch)continue;
      const j1=BI[(isA?'avambraccio':'stinco')+sd],j2=BI[(isA?'mano':'piede')+sd],L=isA?ARM:LEG,s=sd==='S'?1:-1;
      let T=ch.t;if(isA&&ch.rel!=='mondo'){T=add(wp[BI.petto],qrot(rootQ,ch.t))}if(!isA){T=ch.rel==='corpo'?add(rootP,qrot(rootQ,ch.t)):add([rootP[0],0,rootP[2]],qrot(sp.root&&sp.root.yawQ||Q0(),ch.t))}
      const pole=qrot(rootQ,ch.pole||(isA?[.6*s,-1,-.15]:[0,.15,1])),[E,Tt,w]=ik(wp[j],T,L.L1,L.L2,pole);
      const x0=nrm(sub(B[j1],B[j])),x0b=nrm(sub(B[j2],B[j1])),y0=isA?nrm([.6*s,-.25,-1]):[0,.15,1];
      wr[j]=qframe(x0,y0,nrm(sub(E,wp[j])),w);wp[j1]=E;wr[j1]=qframe(x0b,y0,nrm(sub(Tt,E)),w);wp[j2]=Tt;
      wr[j2]=isA?qmul(wr[j1],ch.wrist||Q0()):qmul(rootQ,ch.foot||Q0());ch._done=1;continue}
    if(/^(avambraccio|mano|stinco|piede)/.test(nm)){const sd=nm.slice(-1),isA=nm[0]==='a'||nm[0]==='m',ch=isA?sp.arm&&sp.arm[sd]:sp.leg&&sp.leg[sd];if(ch&&ch._done)continue}
    fk(j)}
  if(sp.arm)for(const k in sp.arm)delete sp.arm[k]._done;if(sp.leg)for(const k in sp.leg)delete sp.leg[k]._done;
  return{wp,wr,emK:sp.emK===undefined?1:sp.emK}}
function mix(a,b,w){if(!b||w>=1)return a;if(w<=0)return b;return{wp:a.wp.map((p,i)=>lerp3(b.wp[i],p,w)),wr:a.wr.map((q,i)=>qnl(b.wr[i],q,w)),emK:lerp(b.emK,a.emK,w)}}
function joints(M,P,out){const n=BN.length,J=out||new Float32Array(n*16),B=M.bind;
  for(let j=0;j<n;j++){const[x,y,z,w]=P.wr[j],o=j*16,x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;
    const m0=1-(yy+zz),m1=xy+wz,m2=xz-wy,m4=xy-wz,m5=1-(xx+zz),m6=yz+wx,m8=xz+wy,m9=yz-wx,m10=1-(xx+yy),b=B[j];
    J[o]=m0;J[o+1]=m1;J[o+2]=m2;J[o+3]=0;J[o+4]=m4;J[o+5]=m5;J[o+6]=m6;J[o+7]=0;J[o+8]=m8;J[o+9]=m9;J[o+10]=m10;J[o+11]=0;
    J[o+12]=P.wp[j][0]-(m0*b[0]+m4*b[1]+m8*b[2]);J[o+13]=P.wp[j][1]-(m1*b[0]+m5*b[1]+m9*b[2]);J[o+14]=P.wp[j][2]-(m2*b[0]+m6*b[1]+m10*b[2]);J[o+15]=1}
  return J}
const ZB3={build,solve,mix,joints,pose,MOSSE,stepper,BN,BI,bindPose,qax,qmul,rx,ry,rz,qq,ik,Q0,ARM,LEG,PV,CH,HC,HR,ANK,aDir,sm,ez,cl,lerp,TAU,add,sub,mul,nrm,len,lerp3,hash};
if(typeof module!=='undefined'&&module.exports)module.exports=ZB3;else root.ZB3=ZB3;
})(typeof window!=='undefined'?window:this);
