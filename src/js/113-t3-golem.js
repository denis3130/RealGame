// =====================================================================
// 113. MOSSBOUND TRIPLA A · IL GOLEM DI MUSCHIO IN 3D VERO (anteprima a parte, con 110–112).
// Il Colosso della Cripta fatto di volumi veri: il busto d'ardesia (petto, bacino e gobba col manto di muschio), la testa bassa infossata
// tra le spalle con le due lastre di arenaria della fronte, le orbite scure con la luce color menta, la mascella che si apre con le zanne;
// i due massi delle spalle col cuscino di muschio e lo spallaccio; le braccia a due ossa coi pugni enormi e le nocche; le gambe con
// l'anello di arenaria al ginocchio e i piedi a lastra; le cinque pietre ritte sulla gobba; il cuore di runa sul petto incastonato nella
// chiave di volta e le sei vene che si accendono; le crepe. Ogni posa è quella del suo modello (golem2.js: gPose, letta senza disegnare;
// i conti delle braccia, delle gambe, della testa e delle pietre copiati): si chiude a palla e rotola con le pietre come denti, nella
// fase 2 l'ardesia si annerisce, le crepe si riempiono di lava e gli occhi diventano arancio; quando cade torna pietra e crolla in un
// mucchio di massi. I pezzi sono fatti una volta; a ogni fotogramma si spostano soltanto (niente pose da preparare, niente scatti).
// =====================================================================
const T3GL={M:null,bad:false,n:0};
function t3GK(){const m=typeof N3!=='undefined'&&N3.meta&&N3.meta.golem2;return m&&m.k3||null}
// (a colour of the palettes as a tint: '#rrggbb', 'rgb(r,g,b)' of the mixed palettes, or 'r,g,b' of the glows)
const t3rgbT=(s,a)=>{let q;if(!s)q=[128,128,128];else if(s[0]==='#')q=v3rgb(s);else q=(s.match(/[\d.]+/g)||[128,128,128]).map(Number);return[q[0]/255,q[1]/255,q[2]/255,a==null?1:a]};
const t3mixT=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k,1];
// ------------------------------------------------------------------ the pieces (white: the colour is the tint of each piece; the glowing
// ones with alpha 0, so they shine by themselves)
function t3GMesh(){if(T3GL.M)return T3GL.M;const K=t3GK(),M={},W=[255,255,255,255],E=[255,255,255,0],{add,mul,nrm,sub,cross}=RG;
  {const mb=v3MB();v3Sphere(mb,[0,0,0],1,W,24,16);M.sph=v3Up(mb)}
  {const mb=v3MB();v3Sphere(mb,[0,0,0],1,W,14,9);M.sph2=v3Up(mb)}
  {const mb=v3MB();v3Sphere(mb,[0,0,0],1,E,12,8);M.sphE=v3Up(mb)}
  {const mb=v3MB();v3Tube(mb,[[0,0,0],[1,0,0]],[1,1],W,12);M.stick=v3Up(mb)}
  {const mb=v3MB();t3Cone(mb,[0,0,0],[0,0,1],1,W,{N:7});M.cone=v3Up(mb)}
  // a rounded box (the sandstone of the brow and the jaw, the keystone): a superellipsoid, its normals from its own surface
  {const mb=v3MB(),nl=16,nb=10,e=.28,sp=(v,k)=>Math.sign(v)*Math.pow(Math.abs(v),k),f=(th,ph)=>[sp(Math.sin(th),e)*sp(Math.cos(ph),e),sp(Math.sin(th),e)*sp(Math.sin(ph),e),sp(Math.cos(th),e)],rows=[];
    for(let j=0;j<=nb;j++){const th=j/nb*Math.PI,row=[];for(let i=0;i<=nl;i++){const ph=i/nl*Math.PI*2,p=f(th,ph),d=.003,a=sub(f(Math.min(Math.PI,th+d),ph),f(Math.max(0,th-d),ph)),b=sub(f(th,ph+d),f(th,ph-d));
      let n=cross(a,b);if(RG.len(n)<1e-9)n=p;n=nrm(n);if(RG.dot(n,p)<0)n=mul(n,-1);row.push(v3V(mb,p,n,W))}rows.push(row)}
    for(let j=0;j<nb;j++)for(let i=0;i<nl;i++){const a=rows[j][i],b=rows[j][i+1],c=rows[j+1][i+1],d=rows[j+1][i];if(j>0)v3T(mb,a,b,c);if(j<nb-1)v3T(mb,a,c,d)}M.box=v3Up(mb)}
  // a cap: the top of the unit sphere above z = .25, its edge a little wavy (moss, the pauldron)
  {const mb=v3MB(),nl=22,nb=7,rows=[];for(let j=0;j<=nb;j++){const row=[];for(let i=0;i<=nl;i++){const ph=i/nl*Math.PI*2,tm=Math.acos(.25)+.1*Math.sin(ph*5+.7)+.05*Math.sin(ph*9),th=j/nb*tm,
      d=[Math.sin(th)*Math.cos(ph),Math.sin(th)*Math.sin(ph),Math.cos(th)];row.push(v3V(mb,d,d,W))}rows.push(row)}
    for(let j=0;j<nb;j++)for(let i=0;i<nl;i++){const a=rows[j][i],b=rows[j][i+1],c=rows[j+1][i+1],d=rows[j+1][i];if(j>0)v3T(mb,a,b,c);v3T(mb,a,c,d)}
    // (under the rim a band that turns in, so the cap has a thickness from the side)
    const last=rows[nb],inner=last.map((ix,i)=>{const p=[mb.P[ix*3],mb.P[ix*3+1],mb.P[ix*3+2]];return v3V(mb,mul(p,.86),mul(p,-1),W)});for(let i=0;i<nl;i++){v3T(mb,last[i],inner[i+1],last[i+1]);v3T(mb,last[i],inner[i],inner[i+1])}
    M.cap=v3Up(mb)}
  {const mb=v3MB(),nl=22,nb=6,rows=[];for(let j=0;j<=nb;j++){const row=[];for(let i=0;i<=nl;i++){const ph=i/nl*Math.PI*2,tm=Math.acos(.52)+.14*Math.sin(ph*4+.3)+.07*Math.sin(ph*7+1),th=j/nb*tm,
      d=[Math.sin(th)*Math.cos(ph),Math.sin(th)*Math.sin(ph),Math.cos(th)];row.push(v3V(mb,d,d,W))}rows.push(row)}
    for(let j=0;j<nb;j++)for(let i=0;i<nl;i++){const a=rows[j][i],b=rows[j][i+1],c=rows[j+1][i+1],d=rows[j+1][i];if(j>0)v3T(mb,a,b,c);v3T(mb,a,c,d)}
    const last=rows[nb],inner=last.map(ix=>{const p=[mb.P[ix*3],mb.P[ix*3+1],mb.P[ix*3+2]];return v3V(mb,mul(p,.9),mul(p,-1),W)});for(let i=0;i<nl;i++){v3T(mb,last[i],inner[i+1],last[i+1]);v3T(mb,last[i],inner[i],inner[i+1])}
    M.cap2=v3Up(mb)}
  // the standing stones: a tapered octagon (twist, a chipped corner of the top), base at 0 along +z
  M.stone=K.SG.map(s=>{const mb=v3MB(),N=8,ring=(z,r)=>{const R=[];for(let i=0;i<N;i++){const a=i/N*Math.PI*2+s.tw,rr=r*(1+.08*Math.sin(i*2.1+s.tw*5));R.push([Math.cos(a)*rr,Math.sin(a)*rr,z])}return R},
      r0=ring(-2,s.r0),r1=ring(s.h*.82,s.r1),top=[0,0,s.h];r1[s.chip%N][2]-=s.h*.16;
    for(let i=0;i<N;i++){const j=(i+1)%N,n=nrm(cross(sub(r0[j],r0[i]),sub(r1[i],r0[i]))),o=n[0]*r0[i][0]+n[1]*r0[i][1]<0?mul(n,-1):n;v3Quad(mb,r0[i],r0[j],r1[j],r1[i],o,W);
      const nt=nrm(cross(sub(r1[j],r1[i]),sub(top,r1[i]))),ot=nt[2]<0?mul(nt,-1):nt;const a=v3V(mb,r1[i],ot,W),b=v3V(mb,r1[j],ot,W),c=v3V(mb,top,ot,W);v3T(mb,a,b,c)}
    return v3Up(mb)});
  // the veins (six, each its own: they light up one at a time) and the cracks, as thin tubes on the torso at rest
  const tube=(pts,r,col)=>{const mb=v3MB();t3Line(mb,pts,r,col,{N:5});return v3Up(mb)};
  M.veins=K.VEINS.map(pa=>tube(pa.rest.map(q=>add(q.p,mul(q.n,.5))),1.05,E));
  {const mb=v3MB();for(const pa of K.CRACKS)t3Line(mb,pa.rest.map(q=>add(q.p,mul(q.n,.3))),.75,W,{N:5});M.cracks=v3Up(mb)}
  {const mb=v3MB();for(const pa of K.CRACKS)t3Line(mb,pa.rest.map(q=>add(q.p,mul(q.n,.35))),.9,E,{N:5});M.lava=v3Up(mb)}
  return T3GL.M=M}
// ------------------------------------------------------------------ the Golem this frame: its pose, its pieces in their places
function t3Frm(d,h){const{nrm,sub,mul,dot,cross,len}=RG;d=nrm(d);h=h||[1,0,0];let u=sub(h,mul(d,dot(h,d)));if(len(u)<.15)u=sub([0,0,1],mul(d,d[2]));if(len(u)<.15)u=sub([0,1,0],mul(d,d[1]));u=nrm(u);return[u,cross(d,u),d]}
function t3GolemItems(n,MW){const K=t3GK(),M=t3GMesh(),C=C3,{add,sub,mul,nrm,dot,cross,len}=RG,{lerp3,sstep,ez,cl,lerp,rotY,rotZ,ik}=C,o=n.o||{},sc=n.sc||1,anim=K.MV.includes(n.anim)?n.anim:'idle',p=n.p;
  const A=K.gPose(anim,p,o),lift=o.z!=null?o.z/sc:A.lift;A.B[2]+=lift;const X=C.frame(A,0),c=A.curl,fw=X.Rd([1,0,0]),items=[];
  // palettes: the second phase, the statue (the awakening), the lava cooling (the defeat of the second phase)
  const g2=k=>A.grp&&A.grp[k]!=null?A.grp[k]:A.k2,gs=k=>A.stg&&A.stg[k]!=null?A.stg[k]:A.statue;
  const KT=K.pal(g2('b'),gs('torso')),KH=K.pal(g2('b'),gs('head')),KA=K.pal(g2('b'),gs('arms')),KE=K.pal(g2('b'),gs('ends')),KS=K.pal(g2('t'),gs('stones')),KM=K.pal(g2('m'),gs('moss')),
    KL=K.cooled(K.pal(g2('h'),gs('torso')),A.cool),KY=K.pal(g2('e'),0),KC=K.cooled(K.pal(1,0),A.cool);
  const T=t3rgbT,crum=A.crumble||0,keep=1-crum,mossT=t3mixT(T(KM.moss.b),T(KM.moss.d),.22),slT=t3mixT(T(KT.slate.b),T(KT.slate.d),.12);
  // a piece: mesh, centre, the three axes already scaled (in the model: x forward, y to its right, z up, the feet at 0), its tint
  const put=(m,Cc,U,V,Wv,tint,ox)=>{if(!(len(U)>.02&&len(V)>.02&&len(Wv)>.02))return;items.push(Object.assign({m,M:v3Mul(MW,v3M4(U,V,Wv,Cc)),tint,out:.55},ox||{}))};
  // an ellipsoid in the body (its own axes, squashed and turned with the body)
  const ellB=(m,c0,R,tint,ox)=>{const q=X.T(c0);put(m,q,sub(X.T(add(c0,[R[0],0,0])),q),sub(X.T(add(c0,[0,R[1],0])),q),sub(X.T(add(c0,[0,0,R[2]])),q),tint,ox)};
  // a piece along a frame (u, v, w unit, in the model) with its half sizes
  const frmP=(m,Cc,F3,R,tint,ox)=>put(m,Cc,mul(F3[0],R[0]),mul(F3[1],R[1]),mul(F3[2],R[2]),tint,ox);
  // a limb between two points
  const limb=(a,b,r,tint,ox)=>{const d=sub(b,a),l=len(d);if(l<.01)return;const[u,v]=t3Frm(d,[0,0,1]);put(M.stick,a,d,mul(u,r),mul(v,r),tint,ox)};
  const cone=(b,tp,r,tint,ox)=>{const d=sub(tp,b);const[u,v]=t3Frm(d,[1,0,0]);put(M.cone,b,mul(u,r),mul(v,r),d,tint,ox)};
  // ---------------- the torso: chest, pelvis, hump (curling up they become one ball); the moss mantle on the hump; cracks, veins, heart
  const TCc=K.TC.map(q=>lerp3(q,K.BC,c)),TRc=K.TR.map(r=>lerp3(r,K.BRR,c));
  const sink=q=>crum>0?lerp3(q,[q[0]*.6,q[1]*.6,q[2]*.25],crum):q,shrink=k0=>k0*(1-.85*crum);
  for(let i=0;i<3;i++)ellB(M.sph,sink(TCc[i]),TRc[i].map(shrink),slT,{out:.75});
  {// the moss mantle: a cap over the hump's top and back
    const hc=sink(TCc[2]),R=TRc[2].map(shrink),ax=X.Rd(nrm([-.5,0,1])),[u,v,w]=t3Frm(ax,fw),q=X.T(add(hc,[-1,0,1.5]));if(c<.6)frmP(M.cap2,q,[u,v,w],[R[0]*1.05,R[1]*1.04,R[2]*1.07],mossT,{out:.45})}
  if(c<.15&&crum<.2){const vis=1-sstep(.02,.15,c);
    if(A.lava>0)put(M.lava,X.T([0,0,0]),sub(X.T([1,0,0]),X.T([0,0,0])),sub(X.T([0,1,0]),X.T([0,0,0])),sub(X.T([0,0,1]),X.T([0,0,0])),t3mixT(T(KC.off),T(KC.lite),cl(.55+.45*Math.max(A.sr,A.heart),0,1)*(1-A.cool*.8)*A.lava),{out:0});
    else put(M.cracks,X.T([0,0,0]),sub(X.T([1,0,0]),X.T([0,0,0])),sub(X.T([0,1,0]),X.T([0,0,0])),sub(X.T([0,0,1]),X.T([0,0,0])),T(KL.gap),{out:0});
    // (the veins: dark grooves that light up)
    for(let i=0;i<6;i++){const v=A.vein[i]||[0,0,0],lit=cl(v[1]*(v[2]==null?1:v[2]),0,1)*vis;put(M.veins[i],X.T([0,0,0]),sub(X.T([1,0,0]),X.T([0,0,0])),sub(X.T([0,1,0]),X.T([0,0,0])),sub(X.T([0,0,1]),X.T([0,0,0])),t3mixT(T(KL.gap),T(KL.lite),lit),{out:0})}}
  {// the heart: a gem of light set in the keystone of sandstone on the chest; it beats
    const R0=TRc[0],hm=K.HM,pH=add(TCc[0],[hm[0]*R0[0],hm[1]*R0[1],hm[2]*R0[2]]),nH=nrm([hm[0]/R0[0],hm[1]/R0[1],hm[2]/R0[2]]),nw=nrm(X.Rd(nH)),[u,v]=t3Frm(nw,[0,0,1]),q=X.T(pH),hk=(A.hg||1)*(1+.12*A.heart);
    if(c<.4&&crum<.5){frmP(M.box,add(q,mul(nw,-.8)),[u,v,nw],[8.5,6.5,3.2],T(KT.sand.b),{out:.45});
      const lit=cl(.35+.65*Math.max(A.heart,A.sr||0),0,1);frmP(M.sphE,add(q,mul(nw,1.6)),[u,v,nw],[4.6*hk,3.5*hk,2.2],t3mixT(T(KL.off),T(KL.hcore),lit),{out:.25})}}
  // ---------------- the standing stones on the hump (teeth of the ball; fallen when it is defeated)
  for(let i=0;i<5;i++){const s=K.SG[i],ci=A.stc?A.stc[i]:c;let b,d;const ex=A.st[i];let d0=s.d;if(ex){const ax=nrm(cross([0,0,1],s.t));d0=t3RotAx(s.d,ax,ex)}b=X.T(s.b);d=X.Rd(d0);
    if(A.fall[i]>0){const back=X.Rd(nrm([-1,s.t[1]*.35,-.12]));d=nrm(add(mul(d,1-A.fall[i]),mul(back,A.fall[i])))}
    if(c>0||ci>0){const th0=Math.atan2(s.b[0],s.b[2]-K.BC[2]),r0=Math.hypot(s.b[0],s.b[2]-K.BC[2]);let th1=s.slot+A.spin;th1=th0+Math.atan2(Math.sin(th1-th0),Math.cos(th1-th0));
      const th=lerp(th0,th1,c),rr=lerp(r0,K.BR-3,c),zk=lerp(1,K.BRZ/K.BR,c),bb=[K.BC[0]+Math.sin(th)*rr,lerp(s.b[1],0,c),K.BC[2]+Math.cos(th)*rr*zk];
      const thd=lerp(th0,th1,ci),rad=nrm([Math.sin(thd)/K.BR,0,Math.cos(thd)/K.BRZ]),dd=rotY(d0,thd-th0);b=X.T(bb);d=X.Rd(nrm(lerp3(dd,rad,ci)))}
    if(A.drop>0){b=lerp3(b,s.lie,ez(A.drop));d=nrm(lerp3(d,nrm(s.ld),ez(A.drop)))}
    const[u,v,w]=t3Frm(d,fw);frmP(M.stone[i],b,[u,v,w],[1,1,1],T(KS.stone.b),{out:.5});
    if(A.candle&&A.candle[i]>.02){const tp=add(b,mul(w,s.h+1.5));frmP(M.sphE,tp,[u,v,w],[1.2,1.2,2.2].map(x=>x*A.candle[i]),T(KS.candle||'#ffd27a'),{out:0})}}
  // ---------------- the head: low between the shoulders, it looks where its pose says; it sinks into the ball when it curls up
  {const hyR=A.hy-A.yaw,hpR=A.hp-A.lean*.8,HR=v=>X.Rd(rotZ(rotY(v,hpR),hyR)),hc0=sink(lerp3(add(K.HC,[A.hx,0,A.hz]),K.BC,c*.8)),hs=shrink(1-.55*c),Hc=X.T(hc0),Tq=q=>add(Hc,HR(mul(q,hs))),H=K.HRD;
    const hx=HR([1,0,0]),hy=HR([0,1,0]),hz=HR([0,0,1]),HF=[hx,hy,hz];
    if(hs>.08){put(M.sph,Hc,mul(hx,H[0]*hs),mul(hy,H[1]*hs),mul(hz,H[2]*hs),T(KH.slate.b),{out:.7});
      // the jaw (turns down round its hinge and drops), its tusks; the dark of the open mouth with its light
      const ja=A.jaw,HG=[2,0,-5],jd=2.5*cl(ja/.45,0,1),rj=q=>{const r=add(HG,rotY(sub(q,HG),ja));r[2]-=jd;return r},rjd=v=>HR(rotY(v,ja));
      frmP(M.sph2,Tq([8.5,0,-5.6]),HF,[4.8*hs,9.5*hs,3.4*hs],t3mixT(T(KH.mouth),T(KH.mlight),.5*cl(ja*3,0,1)),{out:0});
      frmP(M.box,Tq(rj([9,0,-8])),[rjd([1,0,0]),rjd([0,1,0]),rjd([0,0,1])],[5.5*hs,12*hs,4*hs],T(KH.sand.b),{out:.5});
      for(const sd of[-1,1])cone(Tq(rj([13.6,sd*8.5,-5.4])),Tq(rj([15.4,sd*9.7,.6])),1.35*hs,T(KH.tusk),{out:.3});
      // the brow: two slabs of sandstone in a V over the eyes (they come down when it blinks or frowns)
      for(const sd of[-1,1]){const dz=A.brow,a=[7,sd*15.5,6.2-dz],b=[12,sd*1.6,.6-dz-2.4*A.squint],e1=nrm(sub(b,a)),e2=nrm(sub([1,0,0],mul(e1,e1[0])));let e3=nrm(cross(e1,e2));if(e3[2]<0)e3=mul(e3,-1);
        const cM=lerp3(a,b,.5),L=len(sub(b,a));frmP(M.box,Tq(cM),[HR(e1),HR(e2),HR(e3)],[(L/2+1.4)*hs,2.7*hs,2.1*hs],T(KH.sand.b),{out:.45})}
      // the eyes: dark sockets with a point of mint light (each on its own: they light up and go out one at a time)
      const sq=Math.max(.12,A.blink*(1-.35*A.squint));
      for(const sd of[-1,1]){const m=nrm([1,sd*.5,-.2]),sp=[m[0]*H[0],m[1]*H[1],m[2]*H[2]],nn=HR(nrm([m[0]/H[0],m[1]/H[1],m[2]/H[2]])),[u,v]=t3Frm(nn,hz);
        frmP(M.sph2,Tq(mul(sp,.9)),[nn,u,v],[2.4*hs,4.2*hs,3.3*hs*Math.max(.35,sq)],T(KY.sock),{out:0});
        const on=(sd<0?A.eyeL:A.eyeR)*(A.glow>0?1:0),r=2.6*(.35+.65*on)*hs;if(on>.02){const e0=add(Tq(mul(sp,.95)),mul(nn,.3));frmP(M.sphE,e0,[nn,u,v],[r*.6,r*1.15,r*sq],t3mixT(T(KY.sock),T(KY.eye),Math.min(1,on*(.75+.25*(A.glow||1)))),{out:0});frmP(M.sphE,add(e0,mul(nn,r*.35)),[nn,u,v],[r*.35,r*.42,r*.42*sq],t3mixT(T(KY.sock),T(KY.pupil),on),{out:0})}}}}
  // ---------------- the legs: two bones, the knee ring of sandstone, the big foot of slate
  for(const sd of[-1,1]){const f=sd<0?A.fL:A.fR,fc=sink([f[0],f[1],f[2]+6+lift]),hip=X.T(sink([K.HIP[0],sd*K.HIP[1],K.HIP[2]])),ank=add(fc,[-2,0,6]),[kn,an]=ik(hip,ank,K.LTH*keep+.01,K.LSH*keep+.01,X.Rd([1,0,-.6]));
    const lk=shrink(1);limb(hip,kn,11*lk,T(KE.slate.b),{out:.6});const sd2=nrm(sub(an,kn)),a=add(kn,mul(sd2,-1)),b=add(kn,mul(sd2,3.4));limb(a,b,11.6*lk,T(KE.sand.b),{out:.5});
    limb(b,an,10.6*lk,T(KE.slate.b),{out:.6});put(M.sph2,kn,[10.8*lk,0,0],[0,10.8*lk,0],[0,0,10.8*lk],T(KE.slate.b),{out:.6});
    const fd=nrm([fw[0],fw[1],0]),Ef=[fd,nrm(cross([0,0,1],fd)),[0,0,1]];frmP(M.sph,fc,Ef,K.FOOTR.map(x=>x*lk),T(KE.slate.b),{out:.65})}
  // ---------------- the shoulders and the arms (curling into the ball the boulders shrink into it, the arms wrap it, the fists sink in)
  {const ain=A.armIn||0,shK=1-sstep(.15,.8,ain),ak=1-sstep(.65,.97,ain);
    for(const sd of[-1,1]){const sh=sd<0?A.shL:A.shR,XS=sink(lerp3([K.SHC[0],sd*K.SHC[1],K.SHC[2]+sh],[0,sd*24,52],1-shK)),Rs=mul(K.SHR,shK*keep);
      if(shK>.02){ellB(M.sph,XS,Rs,T(KA.slate.b),{out:.7});const q=X.T(XS);
        {const ax=X.Rd(nrm([-.1,sd*.25,1])),F3=t3Frm(ax,fw);frmP(M.cap2,add(q,mul(ax,.8)),F3,[Rs[0]*1.05+1,Rs[1]*1.05+1,Rs[2]*1.08+1.5],mossT,{out:.45})}
        if(A.paul>0&&shK>.15){const ax=X.Rd(nrm([.18,sd,.22])),F3=t3Frm(ax,[0,0,1]);frmP(M.cap,q,F3,[Rs[2]*1.12,Rs[0]*1.1,Rs[1]*1.14],T(KA.paul.b),{out:.55})}}
      const fist0=sd<0?A.hL:A.hR,S=X.T(sink(lerp3([K.SHJ[0],sd*K.SHJ[1],K.SHJ[2]+sh],[2,sd*16,44],ain))),fc=sink([fist0[0],fist0[1],fist0[2]+lift]);
      const wT0=add(fc,mul(nrm(sub(S,fc)),11)),wd=len(sub(wT0,S)),sl=(1-.45*sstep(.35,.85,ain))*Math.max(.05,keep),wT=wd<19*sl?add(S,mul(wd>.5?nrm(sub(wT0,S)):X.Rd([0,sd,0]),19*sl)):wT0;
      const[El,Wr]=ik(S,wT,K.LUA*sl,K.LFA*sl,X.Rd(lerp3([-.5,sd,-.2],[.2,sd*.75,-.65],sstep(.15,.7,ain)))),FC=add(Wr,sub(fc,wT)),fwz=nrm(sub(Wr,FC)),[fu,fv]=t3Frm(fwz,fw);
      const ar=(.4+.6*ak)*keep;limb(S,El,10.5*ar,T(KA.slate.b),{out:.6});put(M.sph2,El,[10*ar,0,0],[0,10*ar,0],[0,0,10*ar],T(KA.slate.b),{out:.6});limb(El,Wr,9.4*ar,T(KA.slate.b),{out:.6});
      // the fist: a great block of slate, four knuckles, the rune on its back that lights when the blow is coming
      const fk=(.55+.45*ak)*keep,FE=[fu,fv,fwz];frmP(M.sph,FC,FE,K.FR.map(x=>x*fk),T(KE.slate.b),{out:.7});
      for(let k=0;k<4;k++){const y=(k-1.5)*.52,kp=add(FC,add(mul(fwz,-K.FR[2]*.62*fk),add(mul(fu,K.FR[0]*.5*fk),mul(fv,y*K.FR[1]*fk))));frmP(M.sph2,kp,FE,[3.4*fk,3*fk,3.2*fk],T(KE.knuck.b),{out:.35})}
      const lit=sd<0?A.fiL:A.fiR;if(lit>.02){const rp=add(FC,mul(fu,K.FR[0]*.92*fk));frmP(M.sphE,rp,[fu,fv,fwz],[1.2,4.5*fk,1.6*fk],t3mixT(T(KL.off),T(KL.core),cl(lit,0,1)),{out:0})}}}
  // ---------------- the mound of mossy boulders it crumbles into
  if(crum>0)K.MOUND.forEach(([x,y,z,r],i)=>{const k=ez(cl(crum*1.25-i*.05,0,1));if(k<=0)return;const q=X.T([x,y,z*k]),rr=r*k;
    ellB(M.sph,[x,y,z*k],[rr*1.05,rr,rr*.86],T(KT.slate.b),{out:.7});const ax=[0,0,1],F3=t3Frm(ax,fw);frmP(M.cap,add(q,[0,0,rr*.15]),F3,[rr*1.02,rr*.98,rr*.8],T(KM.moss.b),{out:.45})});
  return{items,A}}
function t3RotAx(v,ax,a){const{add,mul,cross,dot}=RG,c=Math.cos(a),s=Math.sin(a);return add(add(mul(v,c),mul(cross(ax,v),s)),mul(ax,dot(ax,v)*(1-c)))}
// the hook: the boss «golem» (its new model) in 3D; if anything goes wrong it goes back to the card
T3H.enemy.golem=function(e){if(T3GL.bad||!t3GK())return false;const c=t3Cap(()=>drawEnemy(e)),n=c.n;if(!n||n.id!=='golem')return false;
  if(e.t3face!=null)n.face=e.t3face;const sc=(n.sc||1)*T3CHK,MW=t3CharM(n.face,sc,n.x,n.y,0);let R;try{R=t3GolemItems(n,MW)}catch(er){t3Err(er);T3GL.bad=true;return false}
  const cr=R.A.crumble||0,lz=(n.o&&n.o.z)||0;t3Shadow(n.x,n.y,48*sc*(1-.2*cr),30*sc*(1-.2*cr),.5*(1-Math.min(1,lz/120)));
  const fl=e.flash>0?Math.min(1,e.flash/.08):0;t3Draw3(R.items,{al:n.al<.99?Math.max(.25,n.al):1,fl,flc:[1,1,1]});T3GL.n=R.items.length;return true};
// its body when it dies (the game's corpse plays 'die')
{const _c=T3H.corpse;T3H.corpse=function(cp){if(cp&&(cp.type==='golem'||cp.t==='golem')&&!T3GL.bad&&t3GK()){const c=t3Cap(()=>drawCorpse(cp)),n=c.n;if(n&&n.id==='golem'){
    const sc=(n.sc||1)*T3CHK,MW=t3CharM(n.face,sc,n.x,n.y,0);let R;try{R=t3GolemItems(n,MW)}catch(er){t3Err(er);T3GL.bad=true;return _c?_c(cp):false}
    t3Shadow(n.x,n.y,48*sc,30*sc,.5);t3Draw3(R.items,{al:n.al<.99?Math.max(.15,n.al):1});return true}}return _c?_c(cp):false}}
