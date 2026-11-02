// =====================================================================
// 112. MOSSBOUND TRIPLA A · I NEMICI IN 3D VERO (anteprima a parte, con 110 e 111).
// Ogni nemico fatto di triangoli. Il gioco decide tutto come sempre (la mossa, il punto della mossa, la direzione, l'élite, il colpito, la
// mossa «Si prepara», la caduta): il suo drawEnemy si fa una volta «a vuoto» e si legge con cosa chiamerebbe il modello. Poi:
// - i nemici col corpo dell'Arciere (goblin, scheletro, scheletrino, negromante…) sono il corpo 3D dell'eroe con il loro vestito, la loro
//   arma e la loro testa (la testa dipinta del gioco, come gli eroi con la testa diversa);
// - gli altri sono rifatti pezzo per pezzo dalle stesse pose dei loro disegni (i conti copiati, i disegni non cambiano): lo slime che hai
//   scelto tu (la gelatina che trema, il teschio dentro, gli occhi gialli che respirano, la bocca coi denti storti), …
// Le pose di ogni mossa si fanno una volta (16–20 a mossa) e la scheda grafica passa dall'una all'altra; pochi millisecondi a fotogramma per
// quelle nuove. Chi non è ancora rifatto resta una cartolina. Sotto ognuno la sua ombra morbida.
// =====================================================================
const T3N={cap:null,hum:new Set(['goblin','skeleton','necro','bonelet','pyro','bomber']),B:{},K:new Map(),bad:{},built:0,ms:0,n:0,
  NF:{idle:16,walk:16,attack:20,prep:12,hit:12,die:20,dash:12,summon:20,shoot:20,rise:16},LOOP:{idle:1,walk:1,prep:1}};
for(const id of Object.keys(N3)){if(id==='meta'||id==='order'||typeof N3[id]!=='function')continue;const f=N3[id];
  N3[id]=function(x,y,face,anim,p,sc,o){if(T3N.cap){T3N.cap.push({id,x,y,face,anim,p,sc:sc||1,o:o||{},al:ctx.globalAlpha});if(T3N.hum.has(id))return f.apply(this,arguments);return}return f.apply(this,arguments)}}
// what the game would draw now for this enemy (or this body that is dying): the last call to its model, and to the hero's body
function t3Cap(fn){if(!T3E.dc){const c=document.createElement('canvas');c.width=c.height=2;T3E.dc=c.getContext('2d')}T3N.cap=[];T3E.cap=[];const sv=ctx,ns=noShadow;ctx=T3E.dc;noShadow=true;
  try{fn()}catch(e){t3Err(e)}finally{ctx=sv;noShadow=ns}const n=T3N.cap,h=T3E.cap;T3N.cap=null;T3E.cap=null;return{n:n.length?n[n.length-1]:null,h:h.length?h[h.length-1]:null}}
// ------------------------------------------------------------------ the poses made once: (type, move, frame) → mesh; between two frames the
// graphics card slides; a frame not made yet waits for the nearest one made
function t3KMesh(type,anim,i,can){const key=type+'|'+anim+'|'+i;let m=T3N.K.get(key);if(m)return m;if(!can())return null;const B=T3N.B[type],NF=T3N.NF[anim]||16,LP=T3N.LOOP[anim];
  const p=LP?i/NF:i/(NF-1);let mb;try{mb=B(anim,Math.min(.999,p))}catch(e){t3Err(e);T3N.bad[type]=1;return null}if(!mb||mb.P.length/3>65000)return null;
  m=v3Up(mb);if(mb.splitI!=null)m.splitI=mb.splitI;T3N.K.set(key,m);T3N.built++;if(T3N.K.size>T3N.maxK){const k0=T3N.K.keys().next().value;v3Free(T3N.K.get(k0));T3N.K.delete(k0)}return m}
T3N.maxK=1400;
function t3KF(type,anim,p,can){const NF=T3N.NF[anim]||16,LP=T3N.LOOP[anim],f=LP?((p%1)+1)%1*NF:Math.max(0,Math.min(1,p))*(NF-1),i0=Math.floor(f),i1=LP?(i0+1)%NF:Math.min(NF-1,i0+1),kf=f-i0;
  let a=t3KMesh(type,anim,i0%NF,can);if(!a){for(let d=1;d<NF&&!a;d++){a=T3N.K.get(type+'|'+anim+'|'+((i0-d+NF)%NF))||T3N.K.get(type+'|'+anim+'|'+((i0+d)%NF))}
    // (none of this move made yet: this one is made now anyway, a few a frame, so the old picture never comes back in its place)
    if(!a)a=t3KMesh(type,anim,i0%NF,()=>T3N.force-->0);if(!a)return null;return{m:a,m2:null,kf:0}}
  const b=t3KMesh(type,anim,i1,can);return{m:a,m2:b&&b.nv===a.nv?b:null,kf}}
// ------------------------------------------------------------------ the kit for the bodies: places in the body's frame (x forward, y to its
// left, z up, in the drawing's units), colours [r, g, b, a] (a below 255: it glows by itself), the outline's thickness per piece (mb.W)
const t3c=(h,a)=>{const q=v3rgb(h);return[q[0],q[1],q[2],a==null?255:a]};
const t3mix=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k,a[3]==null?255:a[3]];
function t3W(mb,from,w){mb.W=mb.W||[];const n=mb.P.length/3;for(let i=from;i<n;i++)mb.W[i]=w}
// an ellipsoid: centre, radii, colour from the normal (fn) or one colour, the shape bent by shp(dir) (a factor on the radius); a flat bottom
// at z = floor (the jelly sitting on the floor); o.X: then moved by the body's frame (squash, lean, turn)
function t3Ell(mb,C,R,col,o){o=o||{};const nl=o.nl||22,nb=o.nb||14,rows=[],v0=mb.P.length/3;
  for(let j=0;j<=nb;j++){const th=j/nb*Math.PI,row=[];for(let i=0;i<=nl;i++){const ph=i/nl*Math.PI*2,d=[Math.sin(th)*Math.cos(ph),Math.sin(th)*Math.sin(ph),Math.cos(th)],k=o.shp?o.shp(d,ph,th):1;
    let p=[C[0]+d[0]*R[0]*k,C[1]+d[1]*R[1]*k,C[2]+d[2]*R[2]*k*(d[2]<0&&o.low?o.low:1)];if(o.floor!=null&&p[2]<o.floor)p[2]=o.floor+(p[2]-o.floor)*.04;
    let n=RG.nrm([d[0]/R[0],d[1]/R[1],d[2]/R[2]]);const c=typeof col==='function'?col(n,d):col;if(o.X){p=o.X.T(p);n=RG.nrm(o.X.Rd(n))}row.push(v3V(mb,p,n,c))}rows.push(row)}
  for(let j=0;j<nb;j++)for(let i=0;i<nl;i++){const a=rows[j][i],b=rows[j][i+1],c=rows[j+1][i+1],d=rows[j+1][i];if(j>0)v3T(mb,a,b,c);if(j<nb-1)v3T(mb,a,c,d)}
  if(o.w!=null)t3W(mb,v0,o.w);return mb}
function t3Sph(mb,c,r,col,o){o=o||{};const v0=mb.P.length/3;v3Sphere(mb,c,r,col,o.nl||10,o.nb||7);if(o.w!=null)t3W(mb,v0,o.w)}
function t3Cone(mb,b,tip,r,col,o){o=o||{};const{sub,nrm,cross,add,mul,len}=RG,N=o.N||6,u=nrm(sub(tip,b));let v=cross(u,[0,0,1]);if(len(v)<.2)v=cross(u,[1,0,0]);v=nrm(v);const w=cross(u,v),v0=mb.P.length/3,ring=[];
  for(let i=0;i<N;i++){const a=i/N*Math.PI*2,d=add(mul(v,Math.cos(a)),mul(w,Math.sin(a)));ring.push(v3V(mb,add(b,mul(d,r)),nrm(add(d,mul(u,.4))),col))}const t=v3V(mb,tip,u,col),c0=v3V(mb,b,mul(u,-1),col);
  for(let i=0;i<N;i++){v3T(mb,ring[i],ring[(i+1)%N],t);v3T(mb,c0,ring[(i+1)%N],ring[i])}if(o.w!=null)t3W(mb,v0,o.w)}
// a strip between two lines of points (the lips of a mouth, a band), closed at the ends
function t3Strip(mb,A,B,n,col,o){o=o||{};const v0=mb.P.length/3,ia=A.map(p=>v3V(mb,p,n,col)),ib=B.map(p=>v3V(mb,p,n,col));for(let i=0;i<A.length-1;i++){v3T(mb,ia[i],ia[i+1],ib[i+1]);v3T(mb,ia[i],ib[i+1],ib[i])}if(o.w!=null)t3W(mb,v0,o.w)}
// a glowing eye: the dark ball, the coloured iris that glows (alpha < 255), the white spark of light
function t3Eye(mb,c,n,r,ir,irCol,o){o=o||{};const{add,mul}=RG;t3Sph(mb,c,r,o.dark||[26,42,16,255],{nl:10,nb:7,w:.45});t3Sph(mb,add(c,mul(n,r*.55)),ir,irCol,{nl:9,nb:6,w:0});
  t3Sph(mb,add(add(c,mul(n,r*.82)),o.spark||[0,0,r*.35]),ir*.38,[255,255,250,120],{nl:6,nb:4,w:0})}
// ------------------------------------------------------------------ SLIME (sprite/nemici/disegno_nemici.js slime, the one Denis chose; cap1.js
// slimeOf for 'prep', 'hit' and 'die'): the same squash, hop, lean and open mouth for every move
const T3SLV={slime:{sc:1.15,gel:'#5f9a3a',gelD:'#3f6a2a',gelF:'#2f4f20'},bigslime:{sc:1.7,gel:'#4f8a30',gelD:'#335a22',gelF:'#26401a'},magmaslime:{sc:1.05,gel:'#ff7a2e',gelD:'#b8401a',gelF:'#7a2a10',glow:1}};
function t3SlimePose(anim,p){const TAU0=Math.PI*2,ph=p*TAU0,cl0=(v,a,b)=>v<a?a:v>b?b:v,ez0=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  let sq=1,hop=0,lean=0,open=.2,sx=1,sz=1,dy=0,dx=0,melt=0,puddle=0;
  const base=(an,pp)=>{const p2=pp*TAU0;if(an==='walk'){const sm=(a,b,x)=>{const t=cl0((x-a)/(b-a),0,1);return t*t*(3-2*t)},k=cl0((pp-.22)/.38,0,1),u1=sm(.2,.25,pp),u2=sm(.58,.63,pp),q0=pp<.22?1-.25*ez0(pp/.22):.75,q2=pp<.72?.68+.1*cl0((pp-.6)/.12,0,1):.78+.22*ez0((pp-.72)/.28);
      const L=(a,b,t)=>a+(b-a)*t;sq=L(L(q0,1.22-.1*k,u1),q2,u2);hop=Math.sin(k*Math.PI)*7;lean=1.5*u1*(1-u2)}
    else if(an==='attack'){if(pp<.3){const k=ez0(pp/.3);lean=-2.6*k;sq=1-.14*k;open=.2+.8*k}else if(pp<.45){const k=ez0((pp-.3)/.15);lean=-2.6+10.6*k;sq=.86+.3*k;open=1}else{const k=ez0((pp-.45)/.55);lean=8*(1-k);sq=1.16-.16*k;open=1-k*.8}}
    else{sq=1+.05*Math.sin(p2);open=.15+.08*Math.sin(p2*2);const lurch=pp>.64&&pp<.74?Math.sin((pp-.64)/.1*Math.PI)*2.2:0;lean=lurch}};
  if(anim==='prep'){const b=Math.sin(ph*2);base('attack',.24+.03*b);sx=1+.04*b;sz=1-.03*b;dy=Math.sin(ph*5)*.55}
  else if(anim==='hit'){const kb=p<.25?p/.25:Math.pow(1-(p-.25)/.75,2);base('idle',p);dx=-4*kb;sx=1+.14*kb;sz=1-.16*kb}
  else if(anim==='die'){base('idle',.1+.3*p);melt=ez0(cl0(p/.62,0,1));puddle=ez0(cl0((p-.15)/.7,0,1));sx=1+.7*melt;sz=1-.86*melt}
  else base(anim,p);
  return{sq,hop,lean,open,sx,sz,dx,dy,melt,puddle,ph}}
function t3SlimeMB(type){const V=T3SLV[type]||T3SLV.slime,gel=t3c(V.gel),gelD=t3c(V.gelD),gelF=t3c(V.gelF),gelL=V.glow?t3c('#ffc070'):t3c('#8fd05a'),bone=t3c('#e6dcc0'),dark=t3c('#140808');
  return(anim,p)=>{const A=t3SlimePose(anim,p),mb=v3MB(),k=V.sc,r=11,rx=r/Math.sqrt(A.sq),rz=8*A.sq,C=[A.lean*.5+A.dx,A.dy,rz+A.hop],R=[rx*A.sx,rx*A.sx*.96,rz*1.02*A.sz],S=q=>[q[0]*k,q[1]*k,q[2]*k];
    const Cs=[C[0],C[1],C[2]*(A.melt?1-.6*A.melt:1)],Ck=S(Cs),Rk=R.map(v=>v*k);
    // the skull drifting inside, the eyes, the mouth with the crooked teeth (drawn first: the jelly over them is see-through)
    const sk=[Cs[0]-1+Math.sin(A.ph*.5)*1.2,Cs[1]+.6,Cs[2]-1+Math.cos(A.ph)*.8];t3Sph(mb,S(sk),r*.3*k,t3mix(bone,gel,.25),{nl:10,nb:7,w:0});
    for(const sd of[-1,1])t3Sph(mb,S([sk[0]+r*.24,sk[1]+sd*1.15,sk[2]+.4]),.95*k,[30,22,14,255],{nl:6,nb:4,w:0});
    const at=(az,lat,out)=>{const d=[Math.cos(lat)*Math.cos(az),Math.cos(lat)*Math.sin(az),Math.sin(lat)];return[Ck[0]+d[0]*(Rk[0]+(out||0)),Ck[1]+d[1]*(Rk[1]+(out||0)),Ck[2]+d[2]*(Rk[2]*(d[2]<0?1.08:.92)+(out||0))]};
    const nrmAt=(az,lat)=>RG.nrm([Math.cos(lat)*Math.cos(az)/Rk[0],Math.cos(lat)*Math.sin(az)/Rk[1],Math.sin(lat)/Rk[2]]);
    // (the eyes high on the front and the mouth in the middle, as in its drawing; when it melts they shrink away into the jelly)
    const fz=1-Math.min(1,Math.max(0,(A.melt-.5)/.38)),z0=.01;
    {const ey=.4,el=.5;for(const sd of[-1,1]){const az=sd*ey,c=at(az,el,-.4*k),n=nrmAt(az,el);t3Eye(mb,c,n,Math.max(z0,r*.19*k*fz),Math.max(z0,r*.12*k*fz),[233,255,122,110],{dark:[26,42,16,255]})}
      // the mouth: a wide dark gash on the front, its height opening with the strike; eight teeth up, five down
      const mw=.6*fz+.01,ml=-.04,mh=(.06+A.open*.24)*fz,N=9,up=[],lo=[];for(let i=0;i<N;i++){const t=i/(N-1),az=-mw+t*2*mw,sag=Math.sin(t*Math.PI);up.push(at(az,ml+.03-.02*sag,.25*k));lo.push(at(az,ml-mh*sag-.02*fz,.25*k))}
      t3Strip(mb,up,lo,nrmAt(0,ml),dark,{w:.5});
      for(let i=0;i<8;i++){const t=(i+.5)/8,az=-mw*.85+t*2*mw*.85,b=at(az,ml+.01,.45*k),hh=(.05+.06*Math.abs(Math.sin(i*2.7)))*(1+A.open*.6)*fz;t3Cone(mb,b,at(az,ml-hh,.5*k),Math.max(z0,.45*k*fz),bone,{N:4,w:.25})}
      for(let i=0;i<5;i++){const t=(i+.5)/5,az=-mw*.6+t*2*mw*.6,sag=Math.sin(t*Math.PI),b=at(az,ml-mh*sag,.45*k),hh=(.04+.05*Math.abs(Math.sin(i*3.1)))*(1+A.open*.6)*fz;t3Cone(mb,b,at(az,ml-mh*sag+hh,.5*k),Math.max(z0,.4*k*fz),bone,{N:4,w:.25})}}
    mb.split=mb.P.length/3;mb.splitI=mb.I.length;
    // the jelly: wobbling, sagging below, a flat sole on the floor; darker and dirtier at the base, lighter up top on the left
    t3Ell(mb,Ck,Rk,(n)=>{const z=n[2];let c=t3mix(gelF,gelD,Math.min(1,Math.max(0,(z+.85)/.45)));c=t3mix(c,gel,Math.min(1,Math.max(0,(z+.35)/.5)));if(z>.25&&n[1]>-.2)c=t3mix(c,gelL,Math.min(.55,(z-.25)*.9));return c},
      {nl:24,nb:16,floor:.2,low:1.12,shp:(d,ph)=>1+.045*Math.sin(ph*3+A.ph*2+1)+.03*Math.sin(ph*5-A.ph),w:1});
    // the puddle when it melts
    {const pr=A.puddle>0?(9+16*A.puddle)*k:.05;t3Ell(mb,[0,0,A.puddle>0?.3:-.5],[pr,pr*.9,A.puddle>0?1.2*k:.05],(n)=>t3mix(gelD,gel,n[2]>0?.5:0),{nl:18,nb:6,floor:A.puddle>0?.15:null,w:.6})}
    return mb}}
for(const id of['slime','bigslime','magmaslime'])T3N.B[id]=t3SlimeMB(id);
// the jelly see-through over its skull, eyes and mouth: the mesh in two parts (before and after mb.split), the second drawn with alpha
T3N.split={slime:.84,bigslime:.88,magmaslime:.9};
// ------------------------------------------------------------------ more of the kit: an ellipsoid along its own axes; a spot painted on a
// surface (a very thin ellipsoid lying on it: eyes, cheeks, mouths, the cap's white spots); a line on a surface (a thin tube); a flat membrane
// with a little thickness, so its outline goes all round (wings); a pointed leaf with a thickness (ears, leaves); the dizzy stars. Every piece
// is always made, even when it is not there (then it is tiny, inside the body): so two poses have the same corners and slide into each other
function t3EllA(mb,C,U,R,col,o){o=o||{};const[u,v,w]=U,nl=o.nl||12,nb=o.nb||8,rows=[],v0=mb.P.length/3;
  for(let j=0;j<=nb;j++){const th=j/nb*Math.PI,row=[];for(let i=0;i<=nl;i++){const ph=i/nl*Math.PI*2,d0=Math.cos(th),d1=Math.sin(th)*Math.cos(ph),d2=Math.sin(th)*Math.sin(ph);
    const p=[0,1,2].map(k=>C[k]+u[k]*d0*R[0]+v[k]*d1*R[1]+w[k]*d2*R[2]),n=RG.nrm([0,1,2].map(k=>u[k]*d0/R[0]+v[k]*d1/R[1]+w[k]*d2/R[2]));
    row.push(v3V(mb,p,n,typeof col==='function'?col(n,d0,d1,d2):col))}rows.push(row)}
  for(let j=0;j<nb;j++)for(let i=0;i<nl;i++){const a=rows[j][i],b=rows[j][i+1],c=rows[j+1][i+1],d=rows[j+1][i];if(j>0)v3T(mb,a,b,c);if(j<nb-1)v3T(mb,a,c,d)}
  if(o.w!=null)t3W(mb,v0,o.w)}
// across and up on a surface whose normal is n
function t3Tan(n){const{nrm,cross,len}=RG;let v=cross([0,0,1],n);if(len(v)<.15)v=cross([1,0,0],n);v=nrm(v);return[v,cross(n,v)]}
// a spot on the surface at c (normal n): rx across, ry up, th thick; o.rot turns it in its plane
function t3Dot(mb,c,n,rx,ry,col,o){o=o||{};const th=o.th||.35,{add,mul}=RG;let[v,w]=t3Tan(n);if(o.rot){const cr=Math.cos(o.rot),sr=Math.sin(o.rot),v2=add(mul(v,cr),mul(w,sr));w=add(mul(w,cr),mul(v,-sr));v=v2}
  t3EllA(mb,add(c,mul(n,-th*.25)),[n,v,w],[th,Math.max(.015,rx),Math.max(.015,ry)],col,{nl:o.nl||12,nb:o.nb||6,w:o.w==null?0:o.w})}
function t3Line(mb,pts,r,col,o){o=o||{};const v0=mb.P.length/3;v3Tube(mb,pts,pts.map((_,i)=>Array.isArray(r)?r[i]:r),col,o.N||5);t3W(mb,v0,o.w==null?0:o.w)}
// a flat membrane: its outline Q in its own plane ([a, b], the triangles TRI), at(a, b) → the point in the body, thickness th along n; the
// side n looks at coloured colF, the other colB
function t3Membrane(mb,Q,TRI,at,n,th,colF,colB,o){o=o||{};const{add,mul,sub,nrm,cross,dot}=RG,v0=mb.P.length/3,P3=Q.map(([a,b])=>at(a,b)),N=P3.length,h=th/2;
  const top=P3.map(p=>v3V(mb,add(p,mul(n,h)),n,colF)),bot=P3.map(p=>v3V(mb,add(p,mul(n,-h)),mul(n,-1),colB));
  for(const[a,b,c] of TRI){v3T(mb,top[a],top[b],top[c]);v3T(mb,bot[a],bot[b],bot[c])}
  let ar=0;for(let i=0;i<N;i++)ar+=dot(cross(P3[i],P3[(i+1)%N]),n);
  for(let i=0;i<N;i++){const j=(i+1)%N,e=sub(P3[j],P3[i]),s=nrm(ar>0?cross(e,n):cross(n,e));
    const a=v3V(mb,add(P3[i],mul(n,h)),s,colF),b=v3V(mb,add(P3[j],mul(n,h)),s,colF),c=v3V(mb,add(P3[j],mul(n,-h)),s,colB),d=v3V(mb,add(P3[i],mul(n,-h)),s,colB);v3T(mb,a,b,c);v3T(mb,a,c,d)}
  if(o.w!=null)t3W(mb,v0,o.w)}
// a pointed leaf with a thickness: from the base b along d (length L), W wide across s, T thick; col(normal, t along it, angle round it)
// (sin(angle) > 0: the side cross(d, s) looks at)
function t3Leaf(mb,b,d,s,L,W,T,col,o){o=o||{};const{add,mul,nrm,cross}=RG;d=nrm(d);s=nrm(s);const n=nrm(cross(d,s)),NL=o.nl||7,NR=o.nr||10,rows=[],v0=mb.P.length/3,rd=o.round||.7,tip=o.tip==null?1:o.tip,bend=o.bend||0;
  for(let j=0;j<=NL;j++){const t=j/NL,pf=Math.sin(Math.PI*Math.pow(t,rd))*(1-(1-tip)*t)+(o.base||0)*(1-t),wt=Math.max(.01,W/2*pf),tt=Math.max(.01,T/2*pf),c=add(add(b,mul(d,t*L)),mul(n,bend*t*t*L*.4)),row=[];
    for(let i=0;i<=NR;i++){const a=i/NR*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);row.push(v3V(mb,add(c,add(mul(s,ca*wt),mul(n,sa*tt))),nrm(add(mul(s,ca/wt),mul(n,sa/tt))),typeof col==='function'?col(null,t,a):col))}rows.push(row)}
  for(let j=0;j<NL;j++)for(let i=0;i<NR;i++){const a=rows[j][i],b=rows[j][i+1],c=rows[j+1][i+1],e=rows[j+1][i];v3T(mb,a,b,c);v3T(mb,a,c,e)}
  if(o.w!=null)t3W(mb,v0,o.w)}
// a little star of light (six points, so it is a star from every side)
function t3Spark(mb,p,r,col){const{add,mul}=RG;for(const d of[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])t3Cone(mb,p,add(p,mul(d,r)),r*.36,col,{N:4,w:0})}
// the dizzy stars: three going round over the head (k how much they are there, ph the turn)
function t3Stars(mb,c,R,k,ph){for(let i=0;i<3;i++){const a=ph+i/3*Math.PI*2;t3Spark(mb,[c[0]+Math.cos(a)*R,c[1]+Math.sin(a)*R,c[2]+Math.sin(a*2)*1.2],Math.max(.01,2.2*k),[255,214,90,140])}}
// a point on an ellipsoid (centre C, radii R) toward m, moved by (lat, up) along it and back on its skin, out by `out`: [point, normal] in
// the ellipsoid's own space
function t3OnE(C,R,m,lat,up,out){const{add,mul,nrm,sub}=RG;m=nrm(m);const n0=nrm([m[0]/R[0],m[1]/R[1],m[2]/R[2]]),s0=[C[0]+m[0]*R[0],C[1]+m[1]*R[1],C[2]+m[2]*R[2]],[v,w]=t3Tan(n0),q=add(s0,add(mul(v,lat||0),mul(w,up||0))),d=sub(q,C),m2=nrm([d[0]/R[0],d[1]/R[1],d[2]/R[2]]);
  const s=[C[0]+m2[0]*R[0],C[1]+m2[1]*R[1],C[2]+m2[2]*R[2]],n=nrm([m2[0]/R[0],m2[1]/R[1],m2[2]/R[2]]);return[add(s,mul(n,out||0)),n]}
// a face's pieces on an ellipsoid of a body that moves with the frame X: dots and lines placed by (direction, across, up)
function t3Face(mb,X,C,R){const{nrm}=RG,P=(m,lat,up,out)=>{const[s,n]=t3OnE(C,R,m,lat,up,out);return[X.T(s),nrm(X.Rd(n))]};
  return{P,
    dot:(m,lat,up,rx,ry,col,o)=>{const[c,n]=P(m,lat,up,0);t3Dot(mb,c,n,rx,ry,col,o)},
    line:(m,pts,r,col,o)=>{t3Line(mb,pts.map(([l,u])=>P(m,l,u,.12)[0]),r,col,o)},
    // eyes: a dark (or coloured) oval with its point of light, squeezed shut into a line
    eye:(m,rx,ry,col,A,o)=>{o=o||{};const op=A.shut?0:Math.max(.12,A.blink*(1-.35*(A.squint||0))),sh=A.shut?1:0;
      t3Dot(mb,...P(m,0,0,0),rx*(1-sh*.98),ry*op*(1-sh*.98)+.015,col,{th:o.th||.4});
      t3Dot(mb,...P(m,0,0,.02),rx*.95*sh+.015,.32*sh+.015,o.ink||[27,22,18,255],{th:.4});
      const k=op>.4&&!sh?Math.min(1,(op-.4)*10):0;const[c]=P(m,rx*.34,ry*op*.42,.32);t3Sph(mb,c,Math.max(.01,(o.lr||.48)*k),[255,252,240,110],{nl:6,nb:4,w:0})}}}
// ------------------------------------------------------------------ PIPISTRELLO (cap1.js bat): the purple ball that is head and body, the
// two ears pink inside, the yellow eyes that glow, the fangs; the wings of membrane with their long fingers, flapping round the body's axis
const T3BT={body:t3c('#8a5bc4'),wing:t3c('#5b3a87'),wingB:t3c('#4a2f70'),earIn:t3c('#e7a3c8'),eye:t3c('#ffc93c',150),fang:t3c('#fff6e0'),fing:[40,22,62,255],dark:t3c('#4a1818'),tongue:t3c('#e07a8a'),ink:t3c('#1b1612')};
const T3WING=[[5,3.4],[20,11.5],[18.2,2.4],[16.4,-4.4],[12.4,.8],[8.8,-6.8],[5.2,-3.2]],T3WTRI=[[0,1,2],[0,2,4],[2,3,4],[0,4,6],[4,5,6]];
function t3BatPose(anim,p){const{TAU,cl,ez,keys,sstep,hitK,look,blink}=C3,ph=p*TAU,Z0=17,r=10;
  const A={B:[0,0,0],lean:0,roll:0,s:0,yaw:0,flap:0,fold:0,blink:1,shut:0,open:0,squint:0,stars:0};
  if(anim==='walk'){const f=Math.sin(ph*3);A.flap=f;A.B=[0,0,1.4*Math.sin(ph*3+1.2)];A.lean=.24;A.roll=.1*Math.sin(ph);A.yaw=.12*Math.sin(ph)}
  else if(anim==='attack'){const v=keys([[0,[0,0,0]],[.35,[-3,4.5,-.4]],[.5,[11,-5,.7]],[.62,[8,-3,.45]],[1,[0,0,0]]],p);A.B=[v[0],0,v[1]];A.lean=v[2];
    {const w1=1-sstep(.3,.38,p),w3=sstep(.58,.66,p);A.flap=Math.sin(ph*4.5)*w1+Math.sin(ph*3)*w3-.25*(1-w1-w3)}A.fold=p>.36&&p<.64?Math.sin((p-.36)/.28*Math.PI):0;
    A.open=sstep(.16,.2,p)*(1-sstep(.64,.68,p));A.squint=.8*sstep(.27,.33,p)*(1-sstep(.57,.63,p))}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-3.5*kb,0,1.5*kb];A.lean=-.35*kb;A.roll=.16*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;A.flap=Math.sin(ph*2)*.4;A.fold=.5*Math.max(0,kb)}
  else if(anim==='prep'){A.B=[-3+.25*Math.sin(ph*5),0,4.2+.6*Math.sin(ph*2)];A.lean=-.38;A.flap=.55+.3*Math.sin(ph*5);A.open=1;A.squint=.75}
  else if(anim==='die'){const k1=ez(cl(p/.16,0,1)),k2=cl((p-.16)/.56,0,1),fall=k2*k2,land=p>.72?(p-.72)/.28:0;
    A.B=[-3*k1,0,1.2*k1*(1-fall)+(-Z0+r*.85)*fall+(land>0?1.6*Math.sin(land*Math.PI)*Math.exp(-land*3):0)];A.yaw=k2*TAU*1.25;A.lean=-.3*k1*(1-k2)-.15*k2;A.roll=.45*k2;
    A.fold=k2<1?.8*Math.sin(k2*Math.PI):0;A.flap=p<.72?Math.sin(ph*5)*(1-k2)-.6*k2:-.6;A.shut=1;A.open=1-sstep(.26,.32,p);A.stars=land>0?.85-.35*land:0}
  else{A.flap=Math.sin(ph*2);A.B=[0,0,1.6*Math.sin(ph)];A.yaw=look(p,.4);A.blink=blink(p,.55,.07)}
  return A}
T3N.B.bat=(anim,p)=>{const{add,sub,mul,nrm,dot,cross}=RG,A=t3BatPose(anim,p),Z0=17,r=10,X=C3.frame(A,Z0),Cb=[0,0,Z0],mb=v3MB(),B=T3BT;
  // the wings: a membrane through the shoulder, its fingers from the shoulder to the points of the edge
  for(const sd of[-1,1]){const th=.55*A.flap,Sd=nrm([-.48-A.fold*.8,sd*Math.cos(th),Math.sin(th)]),up=[0,-sd*Math.sin(th),Math.cos(th)],U=nrm(sub(up,mul(Sd,dot(up,Sd)))),sh=[0,sd*6.5,Z0+1];
    const at=(u,w)=>X.T(add(sh,add(mul(Sd,u*1.08),mul(U,w*1.08)))),nf=mul(nrm(X.Rd(cross(Sd,U))),sd);
    t3Membrane(mb,T3WING,T3WTRI,at,nf,.9,B.wing,B.wingB,{w:.55});const s0=at(5,0);for(const i of[1,3,5])t3Line(mb,[s0,at(T3WING[i][0]*.93,T3WING[i][1]*.93)],[.42,.22],B.fing)}
  // the ears: two points on top, pink inside
  for(const sd of[-1,1]){const b=X.T(add(Cb,mul(nrm([-.05,sd*.46,.88]),r*.72))),d=nrm(X.Rd([-.1,sd*.38,1])),sv=nrm(X.Rd([0,1,0]));
    t3Leaf(mb,b,d,sv,8.6,4.6,2.2,(n,t,a)=>Math.sin(a)<-.4&&t>.18&&t<.8?B.earIn:B.body,{w:.8,round:.62,tip:.1,base:.25})}
  // the body
  t3Ell(mb,X.T(Cb),[r,r,r],B.body,{nl:22,nb:14,w:1});
  // the face: the glowing yellow eyes, the mouth (closed with two fangs, or open with the tongue)
  const F=t3Face(mb,X,Cb,[r,r,r]);for(const sd of[-1,1])F.eye([1,sd*.38,.14],2.25,2.5,B.eye,A,{lr:.55});
  const o=A.open,hh=1.9,wo=2.6*.85,mc=[1,0,-.32];
  F.dot(mc,0,-hh*.3,wo*o+.015,hh*o+.015,B.dark,{th:.45});F.dot(mc,0,-hh*.82,wo*.62*o+.015,hh*.42*o+.015,B.tongue,{th:.55});
  {const w=2,bow=.8,pts=[];for(let i=0;i<=6;i++){const t=i/6;pts.push([(2*t-1)*w,-((1-t)*(1-t)*-.3+2*t*(1-t)*bow+t*t*-.3)])}F.line(mc,pts,.38*(1-o)+.01,B.ink)}
  for(const sd of[-1,1]){const lat=sd*(1-o)*1+sd*o*wo*.48,top=(1-o)*-(.8*.375+.1-.4)+o*(-hh*.3+hh*.8),len=(1-o)*1.9+o*1.6,[b,n]=F.P(mc,lat,top,.15),[tp]=F.P(mc,lat,top-len,.4);t3Cone(mb,b,tp,.42,B.fang,{N:5,w:.2})}
  t3Stars(mb,X.T([0,0,Z0+r+4]),8,A.stars,p*Math.PI*4);
  return mb};
// ------------------------------------------------------------------ FUNGO (cap1.js mushroom): a cream stem with a little face under a purple
// cap with white spots (raised a little, like the real ones), two round stumps for feet; the cap fills up and lets out a puff of spores
const T3MC={cap:t3c('#9a5bc8'),capD:t3c('#5b2f7a'),spot:t3c('#efe4f7'),stem:t3c('#ece0c6'),stemU:[160,120,160,255],foot:t3c('#c9b89a'),gill:t3c('#e9dcc4'),gillL:t3c('#c49c86'),
  blush:t3mix(t3c('#ece0c6'),[192,128,122,255],.62),ink:t3c('#1b1612'),dark:t3c('#4a1818'),glow:[190,120,230,150],sp1:[190,130,240,110],sp2:[226,196,255,110]};
const T3SPOTS=[[.45,.42,3.7],[-.62,.6,3.4],[1.5,.28,3],[2.45,.66,3.6],[-2.2,.34,3.2],[3.3,.24,2.8],[-1.4,1.06,2.8],[.95,1.12,2.6],[-2.95,.82,2.4],[2.05,1.24,2.2]];
function t3MushPose(anim,p){const{TAU,cl,ez,sstep,hitK,look,blink,stepper}=C3,ph=p*TAU;
  const A={B:[0,0,0],lean:0,roll:0,s:0,yaw:0,cap:0,capY:0,fL:[0,-5,0],fR:[0,5,0],blink:1,shut:0,squint:0,mouth:0,puff:-1,stars:0,glow:0};
  if(anim==='walk'){const st=stepper(p,.5),a=st(0,2.4,2.2),b=st(.5,2.4,2.2),up=Math.abs(Math.sin(ph));A.fL=[a.x,-5,a.z];A.fR=[b.x,5,b.z];
    A.B=[0,-.5*Math.sin(ph),1.1*up];A.roll=-.08*Math.sin(ph);A.lean=.06;A.s=-.03+.05*up;A.capY=.4-.8*up;A.cap=.02*Math.cos(ph*2)}
  else if(anim==='attack'){const k1=ez(cl(p/.35,0,1)),k2=ez(cl((p-.35)/.15,0,1)),k3=ez(cl((p-.5)/.5,0,1));
    A.s=p<.35?-.14*k1:p<.5?-.14+.32*k2:.18*(1-k3)-.05*Math.sin(k3*Math.PI*3)*(1-k3);
    A.cap=p<.35?.04*k1:p<.5?.04+.2*k2:.24*(1-k3);A.squint=p<.5?k1:1-k3;A.mouth=sstep(.4,.44,p)*(1-sstep(.7,.74,p));A.puff=p>=.48?(p-.48)/.52:-1;A.lean=-.05*k1*(1-k3)}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.3*kb;A.B=[-2.4*kb,0,.4*kb];A.s=-.1*kb;A.roll=.06*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;A.capY=-1*kb}
  else if(anim==='prep'){const b=Math.sin(ph*2);A.s=-.12+.025*b;A.cap=.07+.035*(.5+.5*b);A.capY=-.5+.3*b;A.squint=.85;A.lean=-.06;A.B=[.22*Math.sin(ph*5),0,0];A.glow=.55+.35*(.5+.5*b)}
  else if(anim==='die'){const k1=ez(cl(p/.18,0,1)),k2=ez(cl((p-.18)/.54,0,1)),wob=p>.72?.05*Math.sin((p-.72)*30)*Math.exp(-(p-.72)*9):0;A.lean=-.28*k1*(1-k2)+.12*k2;A.roll=1.32*k2+wob;
    A.B=[-1.4*k1,0,.5*k1*(1-k2)+5.2*k2];A.s=-.1*k1-.12*k2;A.capY=-2.4*k2;A.cap=-.04*k2;A.shut=1;A.mouth=1-sstep(.36,.42,p);A.puff=p>=.6?(p-.6)/.4:-1}
  else{const b=Math.sin(ph);A.s=.025*b;A.cap=.04*Math.sin(ph+.5);A.capY=.4*Math.sin(ph-.4);A.yaw=look(p,.35);A.blink=blink(p,.62,.08)}
  return A}
T3N.B.mushroom=(anim,p)=>{const{add,mul,nrm}=RG,A=t3MushPose(anim,p),X=C3.frame(A,0),mb=v3MB(),M=T3MC,sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
  // the feet
  for(const[sd,f] of[[-1,A.fL],[1,A.fR]]){const c=add(f,[0,0,3.4]);t3Ell(mb,anim==='die'?X.T(c):add(c,[A.B[0],A.B[1],0]),[3.6,3.4,3.4],M.foot,{nl:12,nb:8,w:.7})}
  // the stem: cream, shaded purple right under the cap (glowing purple when it gets ready)
  const Cb=[0,0,15],Rb=[7.2,9,13],gl=A.glow;
  t3Ell(mb,Cb,Rb,(n,d)=>{const z=d[2];let c=t3mix(M.stem,M.stemU,.4*sm(.45,.95,z));if(gl>0&&z>.3)c=t3mix(c,M.glow,gl*sm(.3,.9,z));return c},{nl:20,nb:12,w:1,X});
  // its face: the dark eyes with their point of light, the rosy cheeks, a smile (a round open mouth when it puffs)
  const F=t3Face(mb,X,Cb,Rb);for(const sd of[-1,1]){F.eye([1,sd*.38,.05],1.85,2.25,M.ink,A,{lr:.46});F.dot([1,sd*.62,-.08],0,0,1.8,1.1,M.blush,{th:.3})}
  const mo=A.mouth;F.dot([1,0,-.2],0,0,.95*mo+.015,1.4*mo+.015,M.dark,{th:.4});
  {const w=1.9,bow=1.5,pts=[];for(let i=0;i<=6;i++){const t=i/6;pts.push([(2*t-1)*w,-((1-t)*(1-t)*-.3+2*t*(1-t)*bow+t*t*-.3)*.6])}F.line([1,0,-.18],pts,.36*(1-mo)+.01,M.ink)}
  // the cap: a purple dome cut a little under its middle, darker where it curls under; the gills below; the white spots on it
  const capC=[0,0,26.6+A.capY],cs=1+A.cap,Rc=[17*cs,17*cs,10.8*(1+A.cap*.6)],cut=-.12,thM=Math.acos(cut),NL=26,NB=10,rows=[],v0=mb.P.length/3;
  for(let j=0;j<=NB;j++){const th=j/NB*thM,row=[];for(let i=0;i<=NL;i++){const ph=i/NL*Math.PI*2,d=[Math.sin(th)*Math.cos(ph),Math.sin(th)*Math.sin(ph),Math.cos(th)];
    const q=[capC[0]+d[0]*Rc[0],capC[1]+d[1]*Rc[1],capC[2]+d[2]*Rc[2]],n=nrm([d[0]/Rc[0],d[1]/Rc[1],d[2]/Rc[2]]);row.push(v3V(mb,X.T(q),nrm(X.Rd(n)),t3mix(M.cap,M.capD,.75*sm(.22,-.1,d[2]))))}rows.push(row)}
  for(let j=0;j<NB;j++)for(let i=0;i<NL;i++){const a=rows[j][i],b=rows[j][i+1],c=rows[j+1][i+1],e=rows[j+1][i];if(j>0)v3T(mb,a,b,c);v3T(mb,a,c,e)}t3W(mb,v0,1);
  {const zc=capC[2]+cut*Rc[2],rr=Math.sqrt(1-cut*cut)*.985,dn=nrm(X.Rd([0,0,-1])),c0=v3V(mb,X.T([0,0,zc-.2]),dn,M.gillL),ring=[];
    for(let i=0;i<=NL;i++){const ph=i/NL*Math.PI*2;ring.push(v3V(mb,X.T([Math.cos(ph)*Rc[0]*rr,Math.sin(ph)*Rc[1]*rr,zc]),dn,i%2?M.gill:M.gillL))}for(let i=0;i<NL;i++)v3T(mb,c0,ring[i],ring[i+1])}
  for(const[t,e,r] of T3SPOTS){const m=[Math.cos(t)*Math.cos(e),Math.sin(t)*Math.cos(e),Math.sin(e)],q=[capC[0]+m[0]*Rc[0],capC[1]+m[1]*Rc[1],capC[2]+m[2]*Rc[2]],n=nrm([m[0]/Rc[0],m[1]/Rc[1],m[2]/Rc[2]]);
    t3Dot(mb,X.T(q),nrm(X.Rd(n)),r*cs,r*cs,M.spot,{th:.75,nl:12,nb:6})}
  // the puff of spores: a ring of purple specks bursting out from under the cap and drifting up
  {const k=A.puff;for(let i=0;i<14;i++){const a=i/14*Math.PI*2+.3,on=k>=0?(1-k)*Math.min(1,k*8):0,rr=14+Math.max(0,k)*26*(.7+.3*Math.sin(i*2.3)),
      q=on>0?[Math.cos(a)*rr,Math.sin(a)*rr,16+k*10+Math.sin(i*1.7)*4*k]:[0,0,15];t3Sph(mb,q,Math.max(.01,(1.4+Math.max(0,k)*2.2)*on),i%3?M.sp1:M.sp2,{nl:6,nb:4,w:0})}}
  t3Stars(mb,X.T([0,0,43]),9,A.stars,p*Math.PI*4);
  return mb};
// ------------------------------------------------------------------ PIANTA (cap1.js plant): the pink flower on its green stem with two leaves on the
// floor, seven petals round the yellow face with the mouth and three white teeth (green behind); it looks at you, sways, the petals turn
const T3PL={leaf:t3c('#4f8a34'),stem:t3c('#5f9e3c'),petal:t3c('#d65ba8'),petalB:t3c('#a8467f'),disc:t3c('#f2d36b'),back:t3c('#4f8a34'),mouth:t3c('#5a1f2e'),tooth:t3c('#fff6e0')};
function t3PlantPose(anim,p){const{TAU,cl,ez,lerp,sstep,hitK,look}=C3,ph=p*TAU,A={sway:0,head:1,open:.3,spin:0,lean:0,stars:0,flare:0,yaw:0,droop:0,fall:-1};
  if(anim==='attack'){const k1=ez(cl(p/.42,0,1)),k2=cl((p-.42)/.08,0,1),k3=ez(cl((p-.5)/.5,0,1));A.head=1+.18*k1*(1-k3);A.open=p<.42?.3+.7*k1:1-.7*k3;A.lean=p<.42?-.18*k1:p<.5?lerp(-.18,.2,k2):.2*(1-k3);
    A.flare=p<.5?k1:1-k3;A.spin=p*.5;A.sway=.04*Math.sin(ph)}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.32*kb;A.sway=.12*kb;A.stars=p<.75?1-p/.75:0;A.open=lerp(.8,.3,sstep(.34,.46,p));A.head=1-.06*kb}
  else if(anim==='prep'){const b=Math.sin(ph*2);A.head=1.14+.04*b;A.open=.85+.12*b;A.lean=-.16+.02*Math.sin(ph*5);A.flare=.85;A.spin=p*.3;A.sway=.025*Math.sin(ph*5)}
  else if(anim==='die'){const k1=ez(cl(p/.18,0,1)),k2=ez(cl((p-.18)/.55,0,1));A.lean=-.3*k1*(1-k2)+1.15*k2;A.droop=k2;A.head=1-.06*k1-.14*k2;A.open=lerp(.8,.05,k2);A.flare=-.9*k2;
    A.sway=.05*Math.sin(ph*3)*(1-k2);A.fall=p>.4?(p-.4)/.6:-1}
  else{A.sway=.07*Math.sin(ph);A.lean=.03*Math.sin(ph*2);A.spin=p;A.open=.3+.12*Math.sin(ph*2);A.yaw=look(p,.25)}
  return A}
T3N.B.plant=(anim,p)=>{const{add,mul,nrm,cross,dot}=RG,A=t3PlantPose(anim,p),mb=v3MB(),C=T3PL,TAU=Math.PI*2;
  for(const[a,L0] of[[Math.PI/2+.12,20],[-Math.PI/2-.12,20],[Math.PI*.98,12]]){const d=[Math.cos(a)*.97,Math.sin(a)*.97,.16],sv=[-Math.sin(a),Math.cos(a),0],b=[Math.cos(a)*1.2,Math.sin(a)*1.2,1];
    t3Leaf(mb,b,d,sv,L0,L0*.8,1.3,C.leaf,{w:.6,bend:-.45,round:.7})}
  const top=[1.2+A.lean*6+A.droop*4,A.sway*10,20.5-A.droop*13],stem=[0,.25,.5,.75,1].map(k=>[Math.sin(k*Math.PI)*-1.6+top[0]*k*k,top[1]*k*k,k*top[2]]);
  {const v0=mb.P.length/3;v3Tube(mb,stem,[1.9,1.8,1.7,1.6,1.5],C.stem,8);t3W(mb,v0,.6)}
  const fwd=nrm(C3.rotZ(C3.rotY([1,0,.56],-A.lean),A.yaw)),Hc=add(top,mul(fwd,2.2)),hk=A.head,u=nrm(cross([0,0,1],fwd)),w=cross(fwd,u),dq=(a,b,z)=>add(add(add(Hc,mul(u,a*hk)),mul(w,b*hk)),mul(fwd,(z||0)*hk));
  // the petals (two-sided: pink toward the face, darker behind), cupped toward the face, turning slowly
  for(let i=0;i<7;i++){const a=(i+A.spin)*TAU/7,dir=add(mul(u,Math.cos(a)),mul(w,Math.sin(a))),side=add(mul(u,-Math.sin(a)),mul(w,Math.cos(a))),b=dq(Math.cos(a)*5.4,Math.sin(a)*5.4,-.4),pd=nrm(add(dir,mul(fwd,.28-.25*A.flare))),
      nn=nrm(cross(pd,side)),fr=dot(nn,fwd)>0?1:-1;t3Leaf(mb,b,pd,side,11.6*hk,10.4*hk,1.3,(n,t,an)=>Math.sin(an)*fr>0?C.petal:C.petalB,{w:.55,bend:.5*fr,round:.6})}
  // the face: a thick disc, yellow in front and green behind; the mouth with three teeth hanging from its top
  t3EllA(mb,dq(0,0,.1),[fwd,u,w],[1.5*hk,7.6*hk,7.6*hk],(n,d0)=>d0>0?C.disc:C.back,{nl:20,nb:8,w:.7});
  const op=A.open,mt=-1.2+1.6+2.2*op;t3Dot(mb,dq(0,-1.2,1.45),fwd,4.3*hk,(1.6+2.2*op)*hk,C.mouth,{th:.5});
  for(const tx of[-2,0,2])t3Cone(mb,dq(tx,mt-.3,1.55),dq(tx,mt-1.9,1.6),.85*hk,C.tooth,{N:4,w:.2});
  t3Sph(mb,dq(-3.6,3.8,1.6),1.2*hk,[255,255,255,170],{nl:6,nb:4,w:0});
  // wilting: two petals come off and float down, turning
  for(let j=0;j<2;j++){const uu=A.fall>=0?Math.min(1,Math.max(0,A.fall*1.25-j*.25)):0,on=uu>0&&uu<.98,q=add(Hc,[(j?-4:5)+Math.sin(uu*5+j)*3,(j?5:-3)*uu,8-uu*Math.max(4,Hc[2]+6)]),a=uu*4+j;
    t3Leaf(mb,q,[Math.cos(a),Math.sin(a),.2],[-Math.sin(a),Math.cos(a),0],on?9:.05,on?4:.05,.8,C.petal,{w:.4,round:.6})}
  t3Stars(mb,add(Hc,[0,0,12]),9,A.stars,p*TAU*2);return mb};
// ------------------------------------------------------------------ FUOCO FATUO (cap1.js wisp): a floating drop of light, round below and pointed above,
// lilac at the tip and sky blue at the bottom, two dark eyes; the tip sways like a flame; it shines (and lights the room round it)
const T3WP={top:t3c('#b9a2ee',205),bot:t3c('#6cc8ec',205),eye:t3c('#2a1f4a'),lite:[255,255,255,120]},T3WPR=[[0,0],[1.4,6.6],[3.6,9.4],[6.4,10.4],[9.4,9.8],[12.4,8],[15.6,5.4],[19,3],[22.6,1.3],[26.8,0]];
function t3WispPose(anim,p){const{TAU,cl,ez,hitK,look,blink}=C3,ph=p*TAU,A={B:[0,0,0],lean:0,roll:0,s:0,yaw:0,sway:0,blink:1,squint:0,shut:0,stars:0,fade:1,pulse:-1,ring:0,charge:0,spark:-1};
  if(anim==='walk'){A.B=[0,0,1.6*Math.sin(ph*2)];A.lean=.22;A.sway=-.9+.5*Math.sin(ph*2);A.yaw=.1*Math.sin(ph)}
  else if(anim==='attack'){const k1=ez(cl(p/.4,0,1)),k3=ez(cl((p-.5)/.5,0,1));A.s=p<.4?.14*k1:p<.5?.14-.3*(p-.4)/.1:-.16*(1-k3);A.squint=p<.5?k1:1-k3;A.pulse=p>=.46?(p-.46)/.54:-1;A.sway=Math.sin(ph*3)*.4;A.B=[0,0,1.2*Math.sin(ph)]}
  else if(anim==='tele'){const k=p<.38?1-ez(p/.38):p<.6?0:ez((p-.6)/.4);A.fade=k;A.s=-.5*(1-k);A.ring=p>.3&&p<.75?Math.sin((p-.3)/.45*Math.PI):0;A.sway=Math.sin(ph*2)*.6}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-3*kb,0,1.2*kb];A.lean=-.35*kb;A.roll=.1*kb;A.s=-.1*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0}
  else if(anim==='prep'){const b=Math.sin(ph*2);A.s=.12+.03*b;A.squint=.8;A.sway=Math.sin(ph*4)*.55;A.B=[0,0,1.5+.8*b];A.charge=.6+.4*(.5+.5*b)}
  else if(anim==='die'){const k1=ez(cl(p/.15,0,1)),k2=cl((p-.15)/.7,0,1);A.fade=(1-k2)*(.78+.22*Math.sin(ph*6));A.s=-.15*k1-.5*k2;A.yaw=k2*TAU;A.B=[-2*k1,0,-4*k2];A.shut=1;A.sway=Math.sin(ph*3)*.6;A.spark=p>.25?(p-.25)/.75:-1}
  else{A.B=[0,0,2*Math.sin(ph)];A.sway=.7*Math.sin(ph*2);A.yaw=look(p,.3);A.blink=blink(p,.4,.07)}
  return A}
T3N.B.wisp=(anim,p)=>{const{add,mul,nrm,sub}=RG,A=t3WispPose(anim,p),Z0=10,X=C3.frame(A,Z0),mb=v3MB(),C=T3WP,s=Math.max(.04,A.fade*(1+.25*A.charge*0)),c0=[0,0,Z0+10],S=q=>add(c0,mul(sub(q,c0),s)),N=20,rows=[];
  // the drop: rings from the bottom to the tip, the upper ones pushed sideways like a flame; it glows by itself, lilac above, blue below
  for(let j=0;j<T3WPR.length;j++){const[dz,rr]=T3WPR[j],a0=T3WPR[Math.max(0,j-1)],a1=T3WPR[Math.min(T3WPR.length-1,j+1)],ddz=a1[0]-a0[0],dr=a1[1]-a0[1],k=Math.min(1,Math.max(0,(dz-9)/15)),off=A.sway*6*k*k,col=t3mix(C.bot,C.top,Math.min(1,dz/22)),row=[];
    for(let i=0;i<=N;i++){const t=i/N*Math.PI*2,ct=Math.cos(t),st=Math.sin(t);row.push(v3V(mb,X.T(S([ct*rr,st*rr+off,Z0+dz])),nrm(X.Rd([ct*ddz,st*ddz,-dr])),col))}rows.push(row)}
  {const v0=mb.P.length/3;for(let j=0;j<rows.length-1;j++)for(let i=0;i<N;i++){v3T(mb,rows[j][i],rows[j][i+1],rows[j+1][i+1]);v3T(mb,rows[j][i],rows[j+1][i+1],rows[j+1][i])}t3W(mb,v0,.8)}
  t3Ell(mb,X.T(S([0,-4,Z0+8])),[1.3*s,2.2*s,3*s],C.lite,{nl:8,nb:5,w:0});
  // the eyes (they shrink with it when it fades)
  {const Ce=S([0,0,Z0+6.6]),Re=[10.6*s,10.6*s,9.6*s],F=t3Face(mb,X,Ce,Re);for(const sd of[-1,1])F.eye([1,sd*.34,.1],1.85*s,2.9*s,C.eye,A,{lr:.5})}
  // dying: little sparks scattering
  for(let j=0;j<7;j++){const k=A.spark,on=k>=0&&k<1,a=j/7*Math.PI*2+.4,r=(6+Math.max(0,k)*22)*(.7+.3*Math.sin(j*2.3)),q=on?[Math.cos(a)*r,Math.sin(a)*r,Z0+6+k*10*Math.sin(j*1.7+1)]:[0,0,Z0+8];
    t3Sph(mb,q,on?(1.6-k)+.4:.01,j%2?C.top:C.bot,{nl:5,nb:4,w:0})}
  t3Stars(mb,X.T([0,0,Z0+27]),7,A.stars,p*Math.PI*4);return mb};
// ------------------------------------------------------------------ an enemy this frame
const T3BODIES=new Map();
function t3BodyFor(R){let m=T3BODIES.get(R.prof);if(!m){m=v3BodyMesh(R.prof,R.bz,R.ax);T3BODIES.set(R.prof,m)}return m}
function t3EnemyDraw(e){if(T3N.bad[e.type])return false;const c=t3Cap(()=>drawEnemy(e));if(!c.n&&!c.h)return true;const t=G.t||0;
  const esc=(e.elite||G.giant&&!isBoss(e.type))&&!e.type.includes('slime')?1.22:1,fl=e.flash>0?Math.min(1,e.flash/.08):0;
  // (e.t3face: a direction chosen from outside, for the sheets of the four directions)
  if(e.t3face!=null){if(c.n)c.n.face=e.t3face;if(c.h)c.h.face=e.t3face}
  if(c.h){// a body like the hero's: its own clothes, weapon and head
    const h=c.h,hz=N3G.zm[e.type]?0:Math.max(0,e.z||0),cc=Object.assign({},h,{sc:(h.sc||1)*esc,y:h.y+hz,lz:hz});let H;try{H=t3HeroItems(cc)}catch(er){t3Err(er);T3N.bad[e.type]=1;return false}
    t3Shadow(h.x,h.y+hz,(e.r||12)*1.05*esc,(e.r||12)*.55*esc,.4*(1-Math.min(1,hz/60)));t3Draw3(H.items,{H:H.imp?null:{R:H.R,MF:H.MF,a:H.a,Hw:H.Hw},al:h.al<.99?Math.max(.3,h.al):1,fl,flc:[1,1,1]});if(H.imp)t3HeadCard(H.R,H.Hw,H.a);return true}
  const n=c.n,B=T3N.B[n.id];if(!B)return false;const t0=performance.now(),can=()=>performance.now()-t0<(T3.low?3:5)&&T3N.msF<(T3.low?4:7);
  const K=t3KF(n.id,n.anim,n.p,()=>{const ok=can();return ok});if(!K)return false;T3N.msF+=performance.now()-t0;
  const lz=N3G.zm[e.type]||N3G.jp[e.type]?0:Math.max(0,e.z||0),sc=(n.sc||1)*esc*T3CHK,M=t3CharM(n.face,sc,n.x,n.y+lz,lz);
  const r=(e.r||12)*esc;if(n.anim!=='die')t3Shadow(n.x,n.y+lz,r*1.1,r*.6,.42*(1-Math.min(1,(e.z||0)/60)));
  const sp=T3N.split[n.id],al=n.al<.99?Math.max(.25,n.al):1;
  if(sp&&K.m.splitI!=null){const si=K.m.splitI;t3Draw3([{m:K.m,m2:K.m2,kf:K.kf,M,out:.35,fl,first:0,count:si}],{al,fl});
    t3Draw3([{m:K.m,m2:K.m2,kf:K.kf,M,out:.5,fl,first:si}],{al:Math.min(al,sp),fl,ink:1});return true}
  t3Draw3([{m:K.m,m2:K.m2,kf:K.kf,M,out:.5,fl}],{al,fl});return true}
T3N.msF=0;T3N.force=3;T3H.pre.push(()=>{T3N.msF=0;T3N.force=3});
function t3RegEnemies(){for(const id of Object.keys(T3N.B))T3H.enemy[id]=t3EnemyDraw;for(const id of T3N.hum)T3H.enemy[id]=t3EnemyDraw}
t3RegEnemies();
// the bodies that are dying (the game's live corpses: their 'die' move), as the living
T3H.corpse=function(cp){const c=t3Cap(()=>drawCorpse(cp));if(!c.n&&!c.h)return false;
  if(c.h){const h=c.h;let H;try{H=t3HeroItems(h)}catch(er){return false}t3Draw3(H.items,{H:H.imp?null:{R:H.R,MF:H.MF,a:H.a,Hw:H.Hw},al:h.al<.99?Math.max(.2,h.al):1});if(H.imp)t3HeadCard(H.R,H.Hw,H.a);return true}
  const n=c.n;if(!T3N.B[n.id]||T3N.bad[n.id])return false;const t0=performance.now(),K=t3KF(n.id,n.anim,n.p,()=>performance.now()-t0<4&&T3N.msF<7);if(!K)return false;
  const sc=(n.sc||1)*T3CHK,M=t3CharM(n.face,sc,n.x,n.y,0);t3Draw3([{m:K.m,m2:K.m2,kf:K.kf,M,out:.5}],{al:n.al<.99?Math.max(.15,n.al):1});return true};
