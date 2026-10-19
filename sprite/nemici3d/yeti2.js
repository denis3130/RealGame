// LO YETI DELLE VETTE rifatto: «la Montagna che Respira» (Denis, 15 ottobre: «rivisita tutti i boss, rendili più creepy e fatti meglio
// sia da fermi che nelle animazioni», «un po' più cupi», «falli possenti, belli, fighi, che diano timore nello sfidarli»; 16 ottobre, dopo
// il Golem: «sì, fai gli altri 12»). Un gigante antichissimo delle vette, curvo ma in piedi, alto il triplo dell'eroe: pelo blu ghiacciaio,
// sopra un mantello di neve che gli copre la gobba, le spalle e la cima della testa come la neve sulla cima di un monte, e dalla gobba il
// vento strappa una bandiera di neve; grandi corna scure da montone a spirale con la brina sul bordo; criniera e barba d'argento con un
// ghiacciolo in punta; il muso blu notte a cuore con due occhi azzurro ghiaccio che brillano sotto due sopracciglia di brina; braccia
// lunghissime fino alle ginocchia, mani scure con quattro artigli di ghiaccio. Il suo avviso è IL RESPIRO: prima di ogni colpo prende fiato,
// il pelo si gonfia e si rizza, la neve della stanza gli corre in bocca, gli occhi e il mantello si accendono; il colpo parte con lo sbuffo
// («HAH!»). Dopo il Soffio e il Ruggito resta senza fiato (il momento di colpirlo). Nella fase 2 «il gelo eterno»: pelo gelato a punte,
// mantello di crosta di ghiaccio, ghiaccioli lunghi, cristalli blu sulle corna, artigli che diventano lame, occhi bianchi, fiato continuo.
// Resta della Classica: forme tonde e robuste, colori pieni, occhi grandi con la lucina, due zannette, niente sangue, ferite o cuciture.
// Metodo dello spaventapasseri: scheletro 3D proiettato con V(face), braccia e gambe a due ossa (ik), la parte di sopra del corpo che si
// raddrizza su una cerniera, ordine di disegno dalla posa di riposo, testa con la sua telecamera; dipinto come la lanterna (tre toni, bordo
// freddo della luna in alto a sinistra e il filo caldo delle torce in basso a sinistra, bagliori morbidi). Design: docs/boss-classici-design/yeti.md.
// Mosse: idle, walk, hit, leap (Balzo del Gigante), bound (Balzo corto), pound (Pioggia di ghiaccioli), snowball (La palla che cresce),
// breath (Soffio gelido), gasp (Senza fiato), roar (Ruggito della valanga), claws (Artigli di ghiaccio), rage (Furia), taunt (Presa in
// giro), enter (la valanga lo porta), die (torna neve). Opzioni: o.p2 (seconda fase), o.z (altezza data dal gioco nei balzi), o.noFx.
// Con LOWFX niente bagliori, bandiera, fiocchi risucchiati, brillii, nebbia né vento (le ciocche stanno ferme).
// Disegni per il gioco con lo stesso aspetto: N3.yetiIcicle (ghiacciolo e stalattite), N3.yetiBall (palla di neve), N3.yetiShard
// (scheggia), N3.yetiCrescent (mezzaluna di gelo); gli stessi anche come N3.yeti2Icicle, ecc. Nel gioco prende il nome 'yeti'.
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,tri,rim,run,cmix,poly,bbox,
  sp,rotX,rotY,rotZ,keys,sstep,hitK,frame,ellAt,ellN,AXES,floor,parts,reg,shine,chull,ik,stepper,inward,blink}=C;
const{shadeLimb,glowTop}=C.R;

// ------------------------------------------------------------------ helpers (as in golem2.js)
const trem=(p,a,b,hz,dur)=>{const w=Math.min(.03,(b-a)/3);return sstep(a,a+w,p)*(1-sstep(b-w,b,p))*Math.sin((p-a)*TAU*hz*dur)};
const fxOn=o=>!o.noFx&&!LOWFX;
const cheat=(face,k)=>{const dv=Math.atan2(Math.sin(Math.PI/2-face),Math.cos(Math.PI/2-face));return k*Math.sin(dv)*cl((Math.PI-Math.abs(dv))/(Math.PI/2),0,1)};
const pls=(p,c,w)=>{const d=Math.abs(p-c)/(w/2);return d>=1?0:.5+.5*Math.cos(d*Math.PI)};
const rise=(p,a,b,c,d)=>sstep(a,b,p)*(1-sstep(c,d,p));
const flash=(p,a,w)=>p<a||p>a+w?0:1-(p-a)/w;
const ga=(k,f)=>{if(k<=.004)return;const a0=ctx.globalAlpha;ctx.globalAlpha=a0*Math.min(1,k);f();ctx.globalAlpha=a0};
const kv=(K,p)=>keys(K,p);
const wrap=(p,c)=>((p-c)%1+1)%1;
// the visible part of a cap on an ellipsoid (from golem2.js): leaves the path in ctx, returns {full, rim, pts} or false; o.ck caches the
// directions of a cap that does not move on its ellipsoid
const ECC={};let ECN=0;
function ellCap(V0,X,Cc,Rd,Fr,n,al,N,o){Fr=Fr||AXES;N=N||36;o=o||{};const alv=o.alv||al,ck=o.ck!=null?o.ck+'|'+N+'|'+al.toFixed(3)+'|'+alv.toFixed(3)+'|'+n.join():null;let b,bd;
  if(ck&&ECC[ck]){b=ECC[ck].b;bd=ECC[ck].bd}else{n=nrm(n);let u=o.u?sub(o.u,mul(n,dot(o.u,n))):cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u);
    const at=(t,k)=>{const c=Math.cos(t),s=Math.sin(t),a=k/Math.sqrt((c/al)*(c/al)+(s/alv)*(s/alv));return add(mul(n,Math.cos(a)),add(mul(u,c*Math.sin(a)),mul(v,s*Math.sin(a))))};
    b=[];bd=[];for(let i=0;i<N;i++){const t=i/N*TAU,m=at(t,1);b.push(m);bd.push(o.rf?at(t,o.rf(t)):m)}if(ck){if(++ECN>300){for(const k in ECC)delete ECC[k];ECN=0}ECC[ck]={b,bd}}}
  const S=m=>V0.P(X.T(ellAt(Cc,Rd,Fr,m))),g=nrm([V0.F(X.Rd(Fr.u))/Rd[0],V0.F(X.Rd(Fr.v))/Rd[1],V0.F(X.Rd(Fr.w))/Rd[2]]),f=[];
  for(let i=0;i<N;i++){const m=b[i];f.push(m[0]*g[0]+m[1]*g[1]+m[2]*g[2])}
  const nv=f.filter(x=>x>=0).length;if(!nv)return false;
  if(nv===N){const pts=bd.map(S);poly(pts);return{full:true,rim:pts,pts}}
  let s0=0;for(let i=0;i<N;i++)if(f[i]<0&&f[(i+1)%N]>=0){s0=(i+1)%N;break}
  const cut=(a,c)=>{const k=f[a]/(f[a]-f[c]);return nrm(lerp3(b[a],b[c],k))},rn=[cut((s0-1+N)%N,s0)],rd=[rn[0]];let i=s0;while(f[i]>=0){rn.push(b[i]);rd.push(bd[i]);i=(i+1)%N}rn.push(cut((i-1+N)%N,i));rd.push(rn[rn.length-1]);
  let e1=cross(g,[0,0,1]);if(len(e1)<.2)e1=cross(g,[0,1,0]);e1=nrm(e1);const e2=cross(g,e1),ang=m=>Math.atan2(dot(m,e2),dot(m,e1)),nm=a=>((a%TAU)+TAU)%TAU;
  const a0=ang(rn[rn.length-1]),a1=ang(rn[0]),ccw=nm(a1-a0),span=ccw<=Math.PI?ccw:-(TAU-ccw);
  const M=Math.max(2,Math.ceil(Math.abs(span)/.2)),lb=[];for(let k=1;k<M;k++){const a=a0+span*k/M;lb.push(add(mul(e1,Math.cos(a)),mul(e2,Math.sin(a))))}
  const pts=rd.concat(lb).map(S);poly(pts);return{full:false,rim:rd.map(S),pts}}
// a direction on a cap (centre n, angular radii al/alv, the u axis from the up hint), t round it, k of the way to its edge
function capDir(n,al,alv,uh,t,k){n=nrm(n);let u=sub(uh,mul(n,dot(uh,n)));if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u),c=Math.cos(t),s=Math.sin(t),a=k/Math.sqrt((c/al)*(c/al)+(s/alv)*(s/alv));
  return add(mul(n,Math.cos(a)),add(mul(u,c*Math.sin(a)),mul(v,s*Math.sin(a))))}
// how a ball (centre c0, radius r) sticks out of an ellipsoid: null clear, false inside, else the cap; and the drawing cut there (golem2.js)
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
function sunkDraw(V0,q,r,oc,f){if(oc===false)return;if(!oc){f();return}const big=oc.al>Math.PI/2,n=big?mul(oc.n,-1):oc.n,al=big?Math.PI-oc.al:oc.al,R1=r+1.6,cp=capPts(V0,q,R1,n,al);
  if(big&&!cp){f();return}if(!big&&!cp)return;
  ctx.save();ctx.beginPath();if(big){ctx.arc(q[0],q[1],R1+2,0,TAU);ctx.closePath()}ctx.moveTo(cp.pts[0][0],cp.pts[0][1]);for(const w of cp.pts)ctx.lineTo(w[0],w[1]);ctx.closePath();ctx.clip(big?'evenodd':'nonzero');f();ctx.restore();
  const c2=capPts(V0,q,r,n,al);if(c2&&c2.rim.length>1){ctx.save();ctx.beginPath();for(const w of c2.rim)ctx.lineTo(w[0],w[1]);if(c2.full)ctx.closePath();ctx.strokeStyle='rgba(16,20,40,.75)';ctx.lineWidth=1.8;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.restore()}}
// draws f() as one picture faded to k (no outlines showing through), as in golem2.js
const OCS=[];let OCL=0;
function fadeDraw(f,q,r,k){if(k>=.99){f();return}if(k<=.01)return;const T=ctx.getTransform(),S=Math.hypot(T.a,T.b),dx=T.a*q[0]+T.c*q[1]+T.e,dy=T.b*q[0]+T.d*q[1]+T.f,R=Math.ceil(r*S+6),W=2*R;
  const lv=OCL;let OC=OCS[lv];if(!OC)OC=OCS[lv]=document.createElement('canvas');if(OC.width<W||OC.height<W)OC.width=OC.height=W;const oc=OC.getContext('2d');oc.setTransform(1,0,0,1,0,0);oc.clearRect(0,0,W,W);
  oc.setTransform(T.a,T.b,T.c,T.d,T.e-(dx-R),T.f-(dy-R));const saved=ctx;ctx=oc;OCL++;try{f()}finally{ctx=saved;OCL--}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha*=k;ctx.drawImage(OC,0,0,W,W,dx-R,dy-R,W,W);ctx.restore()}

// ------------------------------------------------------------------ painting
// three tones from the upper left (light, base, shadow) over a screen box
function grad3(b,T){const w=b[2]-b[0],h=b[3]-b[1],cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,R=Math.max(w,h,2)*.64,g=ctx.createRadialGradient(cx-w*.24,cy-h*.26,R*.06,cx-w*.04,cy+h*.04,R);
  g.addColorStop(0,T.l);g.addColorStop(.36,T.b);g.addColorStop(.92,T.d);return g}
// the exact outline of an ellipsoid on the screen (a parallel projection of an ellipsoid is an ellipse)
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
// the cold rim of the moon on the upper left inside an outline, the warm thread of the torches of the Den on the lower left
function rims(pts,ac,aw){const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0,2)/2,kx=1-1.9/Math.max(1,(x1-x0)/2),ky=1-1.9/Math.max(1,(y1-y0)/2);
  const pa=new Path2D();let st=true;for(const q of pts){const x=cx+(q[0]-cx)*kx,y=cy+(q[1]-cy)*ky;if(st){pa.moveTo(x,y);st=false}else pa.lineTo(x,y)}pa.closePath();ctx.lineWidth=1.4;
  if(ac>0){const g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.1,cy+Rr*.1);g.addColorStop(0,`rgba(240,250,255,${ac})`);g.addColorStop(1,'rgba(240,250,255,0)');ctx.strokeStyle=g;ctx.stroke(pa)}
  if(aw>0){const g=ctx.createLinearGradient(cx-Rr*.9,cy+Rr*.8,cx-Rr*.1,cy+Rr*.05);g.addColorStop(0,`rgba(255,170,100,${aw})`);g.addColorStop(1,'rgba(255,170,100,0)');ctx.strokeStyle=g;ctx.stroke(pa)}}
// a limb's shading across it (from the lit side, upper left, through the base to the dark side); a limb along the light's diagonal has
// both sides alike, so the contrast fades there and the lit side never jumps from one side to the other
function limbGrad(qa,qb,r,T){let nx=-(qb[1]-qa[1]),ny=qb[0]-qa[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;const k=l<r*.6?1:cl(Math.abs(nx+ny)/.35,0,1);if(nx+ny>0){nx=-nx;ny=-ny}
  const mx=(qa[0]+qb[0])/2,my=(qa[1]+qb[1])/2;if(l<r*.6){nx=-.7;ny=-.7}const g=ctx.createLinearGradient(mx+nx*r,my+ny*r,mx-nx*r,my-ny*r);
  g.addColorStop(0,k<1?cmix(T.b,T.l,k):T.l);g.addColorStop(.42,T.b);g.addColorStop(1,k<1?cmix(T.b,T.d,k):T.d);return g}
// the dark side and the thin light of a limb already drawn (shadeLimb of the lantern), fading the same way
function shadeL(pts,rs,colD,al){for(let i=0;i<pts.length-1;i++){const A=pts[i],B=pts[i+1],ra=rs[i],rb=rs[i+1];let dx=B[0]-A[0],dy=B[1]-A[1];const l=Math.hypot(dx,dy);if(l<.4)continue;dx/=l;dy/=l;
    let nx=-dy,ny=dx;const k=cl(Math.abs(nx+ny)/.35,0,1);if(k<.02)continue;if(nx+ny>0){nx=-nx;ny=-ny}
    ctx.save();C.hull(A,ra,B,rb);ctx.clip();ctx.globalAlpha*=k;ctx.lineCap='round';ctx.strokeStyle=colD;ctx.lineWidth=(ra+rb)*.44;seg([A[0]-nx*ra*.66,A[1]-ny*ra*.66],[B[0]-nx*rb*.66,B[1]-ny*rb*.66]);ctx.stroke();
    ctx.strokeStyle=`rgba(255,238,205,${(al*.55).toFixed(3)})`;ctx.lineWidth=Math.max(.5,(ra+rb)*.14);seg([A[0]+nx*ra*.52,A[1]+ny*ra*.52],[B[0]+nx*rb*.52,B[1]+ny*rb*.52]);ctx.stroke();ctx.restore()}}
// the shaggy outline of a limb (screen capsule a,ra .. b,rb): tufts all along both sides, hanging and going with the wind, sizes that
// vary (fixed per tuft); s0 a seed. They stay at their place along the limb as it turns
const FURV=[1,.78,1.12,.86,1.05,.72,.95,1.18,.82,1];
function limbFur(pa,a,ra,b,rb,n,L,s0,A,W){const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(l<1)return;const tx=dx/l,ty=dy/l,wx=W?W[0]*.25*A.windK:0;
  for(const sd of[-1,1]){const nx=-ty*sd,ny=tx*sd;for(let i=0;i<n;i++){const k=(i+.5+(sd>0?.35:0))/n;if(k>1)continue;const r=lerp(ra,rb,k),bx=lerp(a[0],b[0],k)+nx*(r-2.6),by=lerp(a[1],b[1],k)+ny*(r-2.6),
      v=FURV[(i*3+s0+(sd>0?5:0))%FURV.length],ddx=nx*.8+wx,ddy=ny*.8+.75,dl=Math.hypot(ddx,ddy),Lk=L*v*(1+.3*A.inh);
      tuft(pa,[bx,by],[bx+ddx/dl*Lk,by+ddy/dl*Lk],3.1*Math.min(1.15,v),(i%2?1:-1)*.9)}}}
// two or three soft «u» curls of the fur on a limb (screen), in the light or the shade tone
function limbCurls(a,ra,b,rb,ks,K){const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(l<6)return;const tx=dx/l,ty=dy/l;ctx.lineCap='round';ctx.lineWidth=1.3;
  for(const[k,o] of ks){const r=lerp(ra,rb,k),c=[lerp(a[0],b[0],k)-ty*o*r,lerp(a[1],b[1],k)+tx*o*r],w=2.6,li=o<0;ctx.strokeStyle=li?K.curlL:K.curlD;ctx.globalAlpha=li?.65:.75;
    ctx.beginPath();ctx.moveTo(c[0]-w,c[1]-1.6);ctx.quadraticCurveTo(c[0],c[1]+3.2,c[0]+w,c[1]-1.6);ctx.stroke()}ctx.globalAlpha=1}
// the outline of a screen capsule as points (for the cold rim)
function capsPts(a,ra,b,rb){const an=Math.atan2(b[1]-a[1],b[0]-a[0]),out=[];for(let i=0;i<=6;i++){const t=an+Math.PI/2+i/6*Math.PI;out.push([a[0]+Math.cos(t)*ra,a[1]+Math.sin(t)*ra])}
  for(let i=0;i<=6;i++){const t=an-Math.PI/2+i/6*Math.PI;out.push([b[0]+Math.cos(t)*rb,b[1]+Math.sin(t)*rb])}return out}
function frm(d,h){d=nrm(d);h=h||[1,0,0];let u=sub(h,mul(d,dot(h,d)));if(len(u)<.15)u=sub([0,0,1],mul(d,d[2]));if(len(u)<.15)u=sub([0,1,0],mul(d,d[1]));u=nrm(u);return[u,cross(d,u),d]}
function lit(V0,n){const o=V0.P(0,0,0),q=V0.P(n);return cl(.55+.45*(-.55*(q[0]-o[0])-.7*(q[1]-o[1]))+.2*V0.F(n),0,1)}
const tone=(T,k)=>{let r=T._r;if(!r){r=T._r=[];for(let i=0;i<=16;i++){const u=i/16;r.push(u<.5?cmix(T.d,T.b,u*2):cmix(T.b,T.l,u*2-1))}}return r[Math.round(cl(k,0,1)*16)]};
function fnorm(f){let x=0,y=0,z=0;for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length];x+=(a[1]-b[1])*(a[2]+b[2]);y+=(a[2]-b[2])*(a[0]+b[0]);z+=(a[0]-b[0])*(a[1]+b[1])}return nrm([x,y,z])}
const cen=f=>{let c=[0,0,0];for(const q of f)c=add(c,q);return mul(c,1/f.length)};
// a faceted solid (ice): the hull in the shadow tone, each face toward us in its own tone, a light seam, the outline (from golem2.js)
function facets(V0,FS,T,o){o=o||{};const all=[];for(const f of FS)for(const q of f)all.push(q);if(all.length<3)return null;const c=cen(all),H=chull(all.map(q=>V0.P(q)));if(H.length<3)return null;
  ctx.lineJoin='round';poly(H);ctx.fillStyle=T.d;ctx.fill();
  // the faces facing us, each in its own light; their seams in one stroke (the faces never overlap)
  const sm=o.seam!==false?new Path2D():null;
  for(const f of FS){if(f.length<3)continue;let n=fnorm(f);if(dot(n,sub(cen(f),c))<0)n=mul(n,-1);const v=V0.F(n);if(v<=.01)continue;
    const S=f.map(q=>V0.P(q));ctx.beginPath();for(const s of S)ctx.lineTo(s[0],s[1]);ctx.closePath();ctx.fillStyle=tone(T,lit(V0,n)+(o.kb||0));ctx.fill();
    if(sm){sm.moveTo(S[0][0],S[0][1]);for(let i=1;i<S.length;i++)sm.lineTo(S[i][0],S[i][1]);sm.closePath()}}
  if(sm){ctx.strokeStyle=o.seamCol||'rgba(255,255,255,.35)';ctx.lineWidth=.8;ctx.stroke(sm)}
  poly(H);ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2.2;ctx.stroke();return H}
// a pointed tuft (a lock of fur, a tongue of the mane) added to the path pa: screen base b, tip t, half width w, bend (px, to its left)
function tuft(pa,b,t,w,bend){const dx=t[0]-b[0],dy=t[1]-b[1],l=Math.hypot(dx,dy);if(l<.6||w<.2)return;const nx=-dy/l,ny=dx/l,mx=(b[0]+t[0])/2+nx*bend,my=(b[1]+t[1])/2+ny*bend;
  pa.moveTo(b[0]+nx*w,b[1]+ny*w);pa.quadraticCurveTo(mx+nx*w*1.05,my+ny*w*1.05,t[0],t[1]);pa.quadraticCurveTo(mx-nx*w*.8,my-ny*w*.8,b[0]-nx*w,b[1]-ny*w);pa.closePath()}
// a union of shapes with one outline round all of them (every outline first, then every fill: no seams inside)
function union(paths,fill,lw,lw2){ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=INK;paths.forEach((pa,i)=>{if(!pa)return;ctx.lineWidth=(i&&lw2?lw2:lw)*2;ctx.stroke(pa)});ctx.fillStyle=fill;for(const pa of paths)if(pa)ctx.fill(pa)}
// a capsule (two screen circles) added to a path
function capsP(pa,a,ra,b,rb){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);if(d<=Math.abs(ra-rb)+.01){const q=ra>=rb?a:b;pa.moveTo(q[0]+Math.max(ra,rb),q[1]);pa.arc(q[0],q[1],Math.max(ra,rb),0,TAU);return}
  const an=Math.atan2(dy,dx),f=Math.acos(cl((ra-rb)/d,-1,1));pa.moveTo(a[0]+Math.cos(an+f)*ra,a[1]+Math.sin(an+f)*ra);pa.arc(a[0],a[1],ra,an+f,an+TAU-f);pa.arc(b[0],b[1],rb,an-f,an+f);pa.closePath()}
// a 4-pointed glint (the sparkles of the snow, the cracks of the claws turning into blades)
function star4(q,r,a,col){if(a<=.01)return;ctx.save();ctx.globalAlpha*=a;ctx.fillStyle=col||'#ffffff';ctx.beginPath();ctx.moveTo(q[0],q[1]-r);ctx.quadraticCurveTo(q[0],q[1],q[0]+r*.8,q[1]);ctx.quadraticCurveTo(q[0],q[1],q[0],q[1]+r);
  ctx.quadraticCurveTo(q[0],q[1],q[0]-r*.8,q[1]);ctx.quadraticCurveTo(q[0],q[1],q[0],q[1]-r);ctx.fill();ctx.restore()}
// a soft cloud of breath or snow (a few puffs; no outline)
function cloud(q,r,a,rgb){if(a<=.01)return;ctx.fillStyle=`rgba(${rgb},${a.toFixed(3)})`;ctx.beginPath();for(const[dx,dy,k] of[[0,0,1],[-.6,.15,.7],[.6,.1,.75],[-.15,-.45,.65],[.3,-.35,.6]]){ctx.moveTo(q[0]+dx*r+r*k,q[1]+dy*r);ctx.arc(q[0]+dx*r,q[1]+dy*r,r*k,0,TAU)}ctx.fill();
  if(r>2.5){ctx.fillStyle=`rgba(255,255,255,${(a*.55).toFixed(3)})`;ctx.beginPath();ctx.arc(q[0]-r*.2,q[1]-r*.25,r*.5,0,TAU);ctx.fill()}}

// ------------------------------------------------------------------ colours
const T3=(l,b,d)=>({l,b,d}),mixT=(a,b,k)=>k<=0?a:k>=1?b:T3(cmix(a.l,b.l,k),cmix(a.b,b.b,k),cmix(a.d,b.d,k));
const mixRgb=(a,b,k)=>{if(k<=0)return a;if(k>=1)return b;const A=a.split(',').map(Number),B=b.split(',').map(Number);return A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')};
// phase 1, «Neve della vetta»: glacier blue fur under a mantle of snow, silver mane, night blue skin, dark ram horns, ice claws, icy eyes
const K1={fur:T3('#a9bce2','#6c84bd','#3a4a80'),gap:'#283466',curlL:'#c9d6f0',curlD:'#2c3868',tip:'#a9bce2',
  snow:T3('#ffffff','#e6eff9','#a9bedb'),fold:'#8ea6c8',dots:'#cfe3f7',
  mane:T3('#f2f6fb','#d0dceb','#8b9fbe'),
  skin:T3('#56649c','#333d72','#1c2248'),nose:'#141a38',noseL:'#8a96c8',pad:'#8390c4',
  horn:T3('#8f93ad','#585b7a','#2f3150'),ring:'#3f4262',frost:'#e4f1ff',
  claw:T3('#effcff','#a6e3f7','#4f97c9'),ice:T3('#f4fdff','#a8def5','#5aa3cf'),
  iris:'#8ff0ff',core:'#e8fdff',eye:'120,225,255',
  mouth:'#2a1d45',tongue:'#6b3f72',thr:'#9fe9ff',thrC:'#eafcff',tusk:T3('#fffbf0','#f6f1e2','#cfc6ad'),
  breath:'235,248,255',band:0,tipK:0};
// phase 2, «Il gelo eterno»: frozen fur with frosted tips, a crust of ice for a mantle, white eyes, blades
const K2={fur:T3('#9db3e8','#4c63a6','#24306a'),gap:'#161f4a',curlL:'#dcecff',curlD:'#1a2452',tip:'#eaf6ff',
  snow:T3('#f6fdff','#c3ecfb','#6fb3dc'),fold:'#6aa2cf',dots:'#ffffff',
  mane:T3('#eef8ff','#b9d6ee','#6788b4'),
  skin:T3('#4a5890','#2b3466','#161b3c'),nose:'#0f1430',noseL:'#a6c4ee',pad:'#7088c2',
  horn:T3('#8f93ad','#585b7a','#2f3150'),ring:'#3f4262',frost:'#f6fcff',
  claw:T3('#ffffff','#b8efff','#4e9fdc'),ice:T3('#e6faff','#8fd0f2','#3f7fb6'),
  iris:'#f4ffff',core:'#ffffff',eye:'90,180,255',
  mouth:'#2a1d45',tongue:'#6b3f72',thr:'#d0f6ff',thrC:'#ffffff',tusk:T3('#fffbf0','#f6f1e2','#cfc6ad'),
  breath:'185,225,255',band:1,tipK:1};
const CRY=T3('#e8fbff','#7cc6f2','#2f6fb8'),CRYRGB='110,190,255',BLADE=T3('#ffffff','#b8efff','#4e9fdc'),BLADERGB='150,225,255';
// the glass it turns into when it is defeated (blue ice from the feet up)
const GLS={fur:T3('#e4f7ff','#9ad3f0','#4f8cc2'),gap:'#3a6a9e',curlL:'#ffffff',curlD:'#4a7fb4',mane:T3('#ffffff','#cdeefc','#7fb6dc'),skin:T3('#cfeefc','#86c0e4','#4479ae'),
  snow:T3('#ffffff','#e2f6ff','#9ccbe8'),claw:T3('#ffffff','#c8f2ff','#68aede')};
const PALC={};
function pal(k2,g){k2=Math.round(cl(k2,0,1)*24)/24;g=Math.round(cl(g||0,0,1)*12)/12;const id=k2+'|'+g;if(PALC[id])return PALC[id];const K={};
  for(const k in K1){const a=K1[k],b=K2[k];K[k]=typeof a==='number'?lerp(a,b,k2):typeof a==='string'?(a[0]==='#'?cmix(a,b,k2):mixRgb(a,b,k2)):mixT(a,b,k2)}
  if(g>0)for(const k in GLS){const a=K[k],b=GLS[k];K[k]=typeof a==='string'?cmix(a,b,g):mixT(a,b,g)}
  return PALC[id]=K}

// ------------------------------------------------------------------ the body at rest (x forward, y to its right, z up; 0,0,0 the floor point)
const BC=[-2,0,41],BR=[21,25,17];              // the belly (it stays with the hips)
const CC=[6,0,65],CR3=[25,32,23];               // the barrel chest      } on the upper body: it straightens round PIV
const UC=[-10,0,89],UR=[22,30,25];               // the hump, top at 112  }
const PIV=[-3,0,46];
const HC0=[32,0,88],HRD=[16,17,16];             // the head (its own camera), the face toward +x
const SHJ=[0,39,80],DLT=[-2,39,80],DLR=12.5;     // the shoulder joint, the shoulder (a round mass under the snow)
const LUA=29,LFA=29;                            // the long arms: the hands hang to the knees
const HIP=[-3,14,32],LTH=19,LSH=18,FR=[15,11,7];
const H0=sd=>[14,sd*46,18],F0=sd=>[2,sd*18,0],H2=sd=>[24,sd*42,28];   // the hands at rest (first and second phase), the feet
// the hand at rest, the right hand's values (fingers, palm; mirrored for the left): claws down by the ice; in the second phase the blades forward
const FD0=[.22,.06,-1],PN0=[.55,-.85,0],FD2=[1,.15,-.3],PN2=[0,-1,-.2],FWD=[1,0,0],DN=[0,0,-1];
// the snow mantle on the hump: a cap round MN, wider at the back (it comes down to z 70), a wavy edge
const MN=nrm([-.42,0,.91]),MAL=.98,MALV=1.18;
// (the edge: a few soft waves and, at the back, three big tongues of snow, the middle one longest)
const tng=(d,w)=>{d=Math.atan2(Math.sin(d),Math.cos(d));return Math.exp(-(d/w)*(d/w))};
const rfM=t=>(1.04-.14*Math.cos(t))*(1+.03*Math.sin(5*t+1.3)+.02*Math.sin(11*t+.4))+.17*tng(t-Math.PI,.3)+.09*tng(t-Math.PI-1.05,.26)+.09*tng(t-Math.PI+1.05,.26);
// the bare night-blue skin of the chest, under the beard
const SKN=nrm([1,0,.12]),SKA=.38,SKAV=.42;
// directions on a sphere, evenly spread (the roots of the tufts)
function fib(n){const out=[],g=Math.PI*(3-Math.sqrt(5));for(let i=0;i<n;i++){const z=1-2*(i+.5)/n,r=Math.sqrt(1-z*z),t=i*g;out.push([Math.cos(t)*r,Math.sin(t)*r,z])}return out}
const inE=(q,C0,R,k)=>{const a=(q[0]-C0[0])/(R[0]*k),b=(q[1]-C0[1])/(R[1]*k),c=(q[2]-C0[2])/(R[2]*k);return a*a+b*b+c*c<1};
let SEED=7;const rnd=()=>{SEED=(SEED*9301+49297)%233280;return SEED/233280};
// the tufts of the outline of the torso: tied to directions of each volume (computed once), drawn only near the outline, so the shaggy edge
// never crawls as it turns. Left out: buried in another volume, under the snow of the hump, on the bare skin of the chest
const VOL=[[BC,BR],[CC,CR3],[UC,UR]],TUF=[[],[],[]];
{const D=fib(72),MU=nrm(sub([0,0,1],mul(MN,MN[2]))),MVv=cross(MN,MU);
  VOL.forEach(([C0,R],i)=>{for(const m of D){const q=ellAt(C0,R,null,m);let bur=false;VOL.forEach(([C1,R1],j)=>{if(j!==i&&inE(q,C1,R1,.96))bur=true});if(bur)continue;
    if(i===2){const a=Math.acos(cl(dot(m,MN),-1,1)),t=Math.atan2(dot(m,MVv),dot(m,MU)),lim=rfM(t)/Math.hypot(Math.cos(t)/MAL,Math.sin(t)/MALV);if(a<lim*.98)continue}
    if(i===1&&Math.acos(cl(dot(m,SKN),-1,1))<.55)continue;
    const low=cl(-m[2],0,1);TUF[i].push({m,L:(9+3.5*rnd())*(1+.2*low*(i===0?0:1)),w:5+1.8*rnd(),b:(rnd()-.5)*3,ph:rnd()*TAU})}})}
// the locks of the fur: V marks hanging down, on the front, the sides and the back: [volume, direction, size]
const CURL=[[0,[.72,.48,-.34],1],[0,[.62,-.5,-.12],.9],[0,[.35,.85,.0],.9],[0,[.3,-.88,-.12],.9],[0,[-.3,.85,-.2],.9],[0,[-.2,-.9,.06],.85],[0,[-.85,.3,-.2],1],
  [1,[.5,.8,-.15],1],[1,[.42,-.84,-.32],.9],[1,[.1,.95,.15],.9],[1,[.16,-.95,.02],.85],
  [2,[-.85,.45,-.45],1],[2,[-.95,-.12,-.18],1.05],[2,[-.4,.9,-.4],.9],[2,[-.48,-.86,-.2],.9],[2,[-.7,.7,.05],.85],[2,[-.62,-.74,.18],.8],
  [2,[.3,.85,.3],.9],[2,[.38,-.86,.08],.9],
  [0,[-.95,.05,-.5],1.1],[0,[-.75,.6,-.55],.95],[0,[-.8,-.55,-.38],.9],[0,[-.95,-.3,.15],.9],[2,[-.98,.25,-.62],.95],[1,[-.3,.95,-.4],.85],[1,[-.36,-.93,-.18],.8]].map(([i,m,k],j)=>({i,m:nrm(m),k,h:j%2?-1:1}));
// the icicles over the thighs (second phase): directions on the belly
const BICE=[[.45,.6,-.66],[.45,-.6,-.66],[-.15,.8,-.58],[-.15,-.8,-.58]].map(nrm);
// the icicles under the edge of the mantle: [t round the cap, length]
const MICE=[[-1.42,4.5],[-1.27,7.5],[-1.07,4],[-.07,9],[.08,12.5],[.25,5.5],[1.03,7.5],[1.22,4.5]].map(([t,l])=>({t:Math.PI+t,l,m:capDir(MN,MAL,MALV,[0,0,1],Math.PI+t,rfM(Math.PI+t)*.97)}));
// the dots and the two folds of the snow: directions on the mantle cap
const MDOT=[[.4,.35],[1.2,.6],[2.2,.5],[2.9,.75],[3.5,.4],[4.2,.65],[5.1,.5],[5.8,.3],[3.14,.15],[.8,.8],[5.4,.82]].map(([t,k])=>capDir(MN,MAL,MALV,[0,0,1],t,k*rfM(t)));
const MFOLD=[[[2.2,.3],[2.5,.56],[2.72,.86]],[[4.08,.3],[3.78,.56],[3.56,.86]]].map(f=>f.map(([t,k])=>capDir(MN,MAL,MALV,[0,0,1],t,k*rfM(t))));
const MSPK=[[.3,.45],[2.4,.62],[3.4,.6],[5.2,.55]].map(([t,k])=>capDir(MN,MAL,MALV,[0,0,1],t,k*rfM(t)));
// four long locks of the fur of the back hanging out from under the edge of the mantle: [t round the cap, length, width]
const MLOCK=[[Math.PI-.5,17,4.6],[Math.PI+.42,19,5],[Math.PI-1.45,13,4],[Math.PI+1.5,14,4.2]].map(([t,L,w])=>({m:capDir(MN,MAL,MALV,[0,0,1],t,rfM(t)*1.02),L,w}));

// ------------------------------------------------------------------ the head (local: [0,0,0] its centre, x the face)
const MUZ=[12.5,0,-7.5],MUR=[9.5,11.5,7.6],JAWC=[10.5,0,-13.5],JAWR=[8,9.6,4.6],JHG=[1,0,-10.5];
const EYED=nrm([1,.5,.33]);
const HSN=nrm([-.35,0,1]);                       // the snow on the top of the head, between the horns
const rfH=t=>1+.08*Math.sin(4*t+.6)+.05*Math.sin(9*t);
const MSK=nrm([1,0,.06]);                        // the night-blue mask, a heart: a notch on top, two lobes round the eyes
const rfK=t=>{const u=Math.abs(((t+Math.PI)%TAU+TAU)%TAU-Math.PI);return u<.75?lerp(.62,1.12,ez(u/.75)):u<1.7?lerp(1.12,1,ez((u-.75)/.95)):lerp(1,.86,ez((u-1.7)/1.44))};
// the ram horns: a spiral round the ear (7 points, local), its thickness, the rings
const HORN=[[-1,10,11.5],[-9,19.5,14.5],[-16,26.5,7],[-17,31,-4],[-10,33.5,-12],[-1,33,-13.5],[5,32,-7.5]].map(q=>[q[0]*.9,q[1]*.9,q[2]]),HORNR=[7,6.8,6.2,5.3,4.2,3,1.6];
const HBASE=nrm([-.1,.66,.75]);
// the crystals of the second phase along each horn: [segment, k along it, size]
const HCRY=[[1,.3,.75],[1,.85,.95],[2,.6,1.25],[3,.4,1],[4,.3,.8],[4,.9,.6]];
// the mane: silver tufts round the face (cheeks, under the horns) and four long tongues down on the shoulders: [direction, length, width, how
// much it hangs]
const MANE=[[[.58,.76,-.3],7,3.1,.45],[[.42,.84,-.5],7.5,3.2,.55],[[.2,.92,-.35],6.5,3,.4],
  [[.32,.9,-.45],15,3,.9],[[.08,.95,-.4],13,2.8,.92]].map(([d,L,w,h])=>({d:nrm(d),L,w,h}));
// the beard: three tongues from the chin (local to the jaw), the middle one longer
const BEARD=[[[13,0,-16.5],[15.5,0,-33],4.2],[[11.5,-5,-16],[13,-8.5,-28],3.2],[[11.5,5,-16],[13,8.5,-28],3.2]];

// ------------------------------------------------------------------ the moves (every one depends only on p; idle and walk close on themselves)
const lin=(K,p)=>{if(p<=K[0][0])return K[0][1];for(let i=0;i<K.length-1;i++){const a=K[i],b=K[i+1];if(p<=b[0])return lerp(a[1],b[1],(p-a[0])/(b[0]-a[0]))}return K[K.length-1][1]};
const SINK=[[.16,80],[.36,78],[.42,74],[.445,68],[.47,50],[.5,28],[.53,12],[.56,0]];
const MV=['idle','walk','hit','leap','bound','pound','snowball','breath','gasp','roar','claws','rage','taunt','enter','die'];
const DUR={idle:3,walk:1.3,hit:.6,leap:2.4,bound:1.3,pound:2.2,snowball:2,breath:3,gasp:1.4,roar:3,claws:1.9,rage:3,taunt:1.2,enter:3.4,die:4};
function yPose(anim,p,o){const ph=p*TAU,P2=!!o.p2&&anim!=='enter'&&anim!=='rage';
  const A={B:[0,0,0],lean:.1,roll:0,yaw:0,s:0,sx:0,rear:0,bz:0,hx:0,hz:0,hp:0,hy:0,hr:0,jaw:0,tongue:0,blink:1,squint:0,smile:0,eyeOn:1,dim:0,ek:P2?1:0,
    inh:0,infl:0,fluff:0,windK:1,wph:p*2,flagM:0,flagUp:0,flagOff:0,flap:0,wrev:0,blz:P2?1:0,spark:0,throat:0,suck:-1,cpulse:null,tink:0,
    hL:H0(-1),hR:H0(1),gL:.35,gR:.35,fdL:null,fdR:null,pnL:null,pnR:null,poL:null,poR:null,fL:F0(-1),fR:F0(1),bl1:0,bl2:0,curlIdx:0,
    k2:P2?1:0,crys:P2?1:0,blade:P2?1:0,ice:-1,crack:0,shat:-1,lift:0,ball:null,ball2:null,sink:0,mound:-1,chunks:-1,snowEyes:0,fade:1,fx:[]};
  const fx=(k,t,o2)=>{if(t>=0&&t<1)A.fx.push(Object.assign({k,t},o2||{}))};
  const hk=(K,sd)=>kv(K.map(([t,v])=>[t,[v[0],sd*v[1],v[2]]]),p);   // the same keys for both hands (or feet), mirrored
  // how a hand turns and grips along the move, eased like the places: [[p, fingers, palm, grip], ...] in the right hand's values (mirrored
  // for the left); never a jump of the claws, nor of the wrist that follows them
  const ho=(K,sd)=>{const r=kv(K.map(([t,f,n,g])=>[t,[f[0],sd*f[1],f[2],n[0],sd*n[1],n[2],g]]),p),fd=nrm([r[0],r[1],r[2]]),pn=nrm([r[3],r[4],r[5]]);
    if(sd<0){A.fdL=fd;A.pnL=pn;A.gL=r[6]}else{A.fdR=fd;A.pnR=pn;A.gR=r[6]}};
  const ho2=K=>{ho(K,-1);ho(K,1)};
  // keys whose path bends round a control point ([p, place, control]): the hand goes round the shoulder, never through it
  const kb=K=>{for(let i=0;i<K.length-1;i++){const a=K[i],b=K[i+1];if(p>=a[0]&&p<=b[0]){const u=ez((p-a[0])/Math.max(1e-6,b[0]-a[0]));if(!b[2])return lerp3(a[1],b[1],u);const c=b[2];
    return[0,1,2].map(j=>(1-u)*(1-u)*a[1][j]+2*u*(1-u)*c[j]+u*u*b[1][j])}}return K[K.length-1][1].slice()};
  const hb=(K,sd)=>kb(K.map(([t,v,c])=>c?[t,[v[0],sd*v[1],v[2]],[c[0],sd*c[1],c[2]]]:[t,[v[0],sd*v[1],v[2]]]));
  // where the elbow points (in the body, the right arm's values), eased: out and back unless a move lifts it
  const PO0=[-.5,.8,-.1],po=(K,sd)=>{const r=nrm(mr(kv(K,p),sd));if(sd<0)A.poL=r;else A.poR=r};
  const mr=(v,sd)=>[v[0],sd*v[1],v[2]];
  // bent over with the hands on the knees, spent (the end of the breath and of the howl flows into it: «Senza fiato» starts there)
  const gaspTo=w=>{if(w<=0)return;A.lean=lerp(A.lean,.45,w);A.rear=lerp(A.rear,-.08,w);A.B[2]=lerp(A.B[2],-4,w);A.hp=lerp(A.hp,.35,w);A.tongue=lerp(A.tongue,1,w);A.jaw=lerp(A.jaw,.45,w);
    A.infl=lerp(A.infl,-.04,w);A.fluff=lerp(A.fluff,-.18,w);A.dim=lerp(A.dim,1,w);A.flagOff=lerp(A.flagOff,1,w);A.squint=lerp(A.squint,.4,w);
    for(const sd of[-1,1]){const k=sd<0?'L':'R';A['h'+k]=add(lerp3(A['h'+k],[16,sd*30,26],w),[0,sd*10*Math.sin(Math.PI*w),0]);A['fd'+k]=nrm(lerp3(A['fd'+k]||mr(FD0,sd),FWD,w));A['pn'+k]=nrm(lerp3(A['pn'+k]||mr(PN0,sd),DN,w));A['g'+k]=lerp(A['g'+k],.5,w)}};
  if(anim==='walk'){// CAMMINA: two heavy steps, the body dips and rolls over the planted foot, the long arms swing against the legs and the
    // claws scrape the snow at the bottom of the swing; the head stays on the hero. At .25 and .75 it goes through its rest pose
    const st=stepper(p,.5),S=P2?16:13.65,a=st(0,S,5),b=st(.5,S,5);A.fR=[2+a.x,18,a.z];A.fL=[2+b.x,-18,b.z];
    const imp=Math.max(0,Math.cos(TAU*2*(p-.03)));A.B[2]=-2*imp;A.s=-.02*imp;A.roll=-.05*Math.sin(ph);A.yaw=.03*Math.sin(ph);A.lean=.1+.03*imp;A.flap=imp;
    const sw=Math.cos(ph);
    if(P2){A.hR=[24-9*sw,42,28+3*sw*sw];A.hL=[24+9*sw,-42,28+3*sw*sw];for(const sd of[-1,1])ho([[0,FD2,PN2,.2],[1,FD2,PN2,.2]],sd);A.B[2]-=4;A.lean+=.08}
    else{A.hR=[14-12*sw,46,18+7*sw*sw];A.hL=[14+12*sw,-46,18+7*sw*sw];A.gL=A.gR=.35+.25*sw*sw}
    fx('snow',wrap(p,0)/.2,{at:[16,18,0],n:4,r:7});fx('snow',wrap(p,.5)/.2,{at:[16,-18,0],n:4,r:7});
    if(!P2){fx('scrape',wrap(p,.2)/.16,{sd:1});fx('scrape',wrap(p,.7)/.16,{sd:-1})}else fx('mist',p)}
  else if(anim==='hit'){// COLPITO: the head goes back, the eyes squeeze, a wave runs through the fur, snow falls off the shoulders
    const k=hitK(p);A.lean=.1-.14*k;A.B=[-3*k,0,0];A.hp=-.3*k;A.squint=.9*(1-sstep(.36,.44,p));A.fluff=.18*pls(p,.22,.3)-.05*pls(p,.5,.3);A.flap=pls(p,.1,.2);
    A.hL=add(H0(-1),[-4*k,-3*k,7*k]);A.hR=add(H0(1),[-4*k,3*k,7*k]);fx('fall',p/.7)}
  else if(anim==='leap'){// BALZO DEL GIGANTE: crouches with the arms back (the claws rasp the ice at .10 and .16, the big breath), springs at .22
    // with the puff, flies with the arms open wide and forward, the claws fanned out (the game gives the height), the legs tucked; reaches
    // for the floor from .74, lands on all fours at .80 (a ring of snow), rises growling, shakes the snow off its head at .90
    const v=kv([[0,[.1,0,0,0]],[.16,[.34,-10,-.04,0]],[.22,[.36,-11,-.05,0]],[.26,[-.04,-1,.07,.16]],[.36,[.02,0,.03,.1]],[.7,[.08,0,0,.04]],[.8,[.52,-14,-.08,0]],[.87,[.4,-9,-.03,0]],[1,[.1,0,0,0]]],p);
    A.lean=v[0];A.B[2]=v[1];A.s=v[2];A.rear=v[3];
    const HK=[[0,H0(1)],[.12,[-14,40,24]],[.22,[-17,40,26]],[.27,[24,52,72]],[.36,[22,60,64]],[.72,[22,60,60]],[.76,[28,52,38]],[.8,[31,34,5]],[.87,[29,36,9]],[1,H0(1)]];A.hL=hk(HK,-1);A.hR=hk(HK,1);
    for(const c of[.10,.16]){const k=pls(p,c,.05);A.hL[2]-=4*k;A.hR[2]-=4*k;A.hL[0]-=4*k;A.hR[0]-=4*k}
    ho2([[0,FD0,PN0,.35],[.12,[.05,.06,-1],PN0,.4],[.22,[0,.1,-1],PN0,.45],[.27,[.65,.6,.3],[.2,-.4,-.9],.05],[.36,[.5,.85,.1],[0,.1,-1],0],[.72,[.5,.85,.05],[0,.1,-1],0],
      [.77,[.9,.35,-.3],[.1,0,-1],0],[.8,[1,.15,-.1],[0,0,-1],.05],[.88,[1,.12,-.2],[.05,0,-1],.15],[1,FD0,PN0,.35]]);
    const air=p>.22&&p<.8?(p-.22)/.58:-1,t=air>=0?Math.sin(Math.PI*air):0;A.lift=60*t;
    A.fR=hk([[0,F0(1)],[.21,F0(1)],[.3,[-3,17,8]],[.5,[-4,17,13]],[.7,[-3,18,8]],[.79,[-2,20,0]],[.88,[-2,20,0]],[1,F0(1)]],1);A.fL=hk([[0,F0(1)],[.21,F0(1)],[.3,[-3,17,8]],[.5,[-4,17,13]],[.7,[-3,18,8]],[.79,[-2,20,0]],[.88,[-2,20,0]],[1,F0(1)]],-1);
    A.inh=sstep(.02,.2,p)*(1-sstep(.22,.27,p));A.infl=.08*A.inh;A.flagUp=t;A.fluff=.15*t;
    A.jaw=.35*rise(p,.82,.86,.93,.97);A.squint=.5*rise(p,.1,.15,.2,.24)+.4*rise(p,.82,.86,.93,.97);A.hy=.32*trem(p,.88,.97,6,2.4);A.hp=.1*rise(p,.0,.12,.2,.24)+.12*rise(p,.8,.84,.9,.98);
    fx('scrape',(p-.1)/.12,{sd:1,back:1});fx('scrape',(p-.16)/.12,{sd:-1,back:1});fx('hah',(p-.22)/.2);fx('ring',(p-.8)/.2);fx('snow',(p-.8)/.2,{at:[30,0,0],n:9,r:30});fx('fall',(p-.88)/.12,{head:1})}
  else if(anim==='bound'){// BALZO CORTO (fase 2): a short crouch with a short breath, a low hop with the arms forward, lands on hands and feet
    const v=kv([[0,[.1,0,0]],[.2,[.32,-6,-.03]],[.25,[.32,-6,-.03]],[.29,[0,-1,.05]],[.72,[.12,0,0]],[.8,[.45,-10,-.06]],[.88,[.32,-6,-.02]],[1,[.1,0,0]]],p);
    A.lean=v[0];A.B[2]=v[1];A.s=v[2];
    const HK=[[0,H0(1)],[.2,[-8,42,24]],[.25,[-10,42,26]],[.32,[26,52,56]],[.7,[26,54,50]],[.75,[30,46,30]],[.8,[31,34,5]],[.88,[28,36,10]],[1,H0(1)]];A.hL=hk(HK,-1);A.hR=hk(HK,1);
    ho2([[0,FD0,PN0,.35],[.2,[.05,.06,-1],PN0,.3],[.25,[0,.1,-1],PN0,.3],[.32,[.65,.65,.15],[.1,-.2,-1],.1],[.7,[.65,.65,.05],[.1,-.1,-1],.1],[.76,[.95,.25,-.3],[.1,0,-1],.1],[.8,[1,.15,-.1],[0,0,-1],.1],[.9,[1,.12,-.2],[.05,0,-1],.2],[1,FD0,PN0,.35]]);
    const air=p>.25&&p<.8?(p-.25)/.55:-1,t=air>=0?Math.sin(Math.PI*air):0;A.lift=30*t;A.inh=.6*sstep(.02,.22,p)*(1-sstep(.25,.3,p));A.infl=.05*A.inh;A.flagUp=.6*t;
    const FK=[[0,F0(1)],[.24,F0(1)],[.33,[-3,17,6]],[.52,[-3,17,9]],[.7,[-3,18,5]],[.79,[-2,20,0]],[.88,[-2,20,0]],[1,F0(1)]];A.fR=hk(FK,1);A.fL=hk(FK,-1);
    fx('hah',(p-.25)/.16,{small:1});fx('ring',(p-.8)/.18,{small:1});fx('snow',(p-.8)/.18,{at:[30,0,0],n:6,r:20})}
  else if(anim==='pound'){// PIOGGIA DI GHIACCIOLI: it rears up to its full height (on its toes), the arms going out to the sides and then up with
    // the claws open, the big breath; holds and trembles; slaps the floor with the left hand (.42), the right (.56), both with all its weight
    // (.74); stays bent and lifts its head to the ceiling growling (it calls the ice); comes back
    const v=kv([[0,[.1,0,0,0]],[.2,[-.12,.36,6,0]],[.37,[-.12,.38,6,0]],[.42,[.44,.02,-8,-.1]],[.48,[.24,.12,-3,-.04]],[.53,[.24,.14,-2,.04]],[.56,[.44,.02,-8,.1]],
      [.62,[.06,.3,3,0]],[.66,[.06,.3,3,0]],[.74,[.52,0,-10,0]],[.88,[.5,0,-10,0]],[1,[.1,0,0,0]]],p);
    A.lean=v[0];A.rear=v[1];A.B[2]=v[2];A.roll=v[3];
    A.hL=hb([[0,H0(1)],[.1,[-2,70,86]],[.2,[6,52,128]],[.37,[6,52,132]],[.42,[36,30,5],[52,72,64]],[.5,[30,36,14]],[.56,[26,40,18]],[.64,[0,46,118],[40,80,64]],[.665,[0,46,120]],[.74,[40,14,5],[64,82,72]],[.88,[40,14,5]],[1,H0(1)]],-1);
    A.hR=hb([[0,H0(1)],[.1,[-2,70,86]],[.2,[6,52,128]],[.37,[6,52,132]],[.43,[20,54,118]],[.5,[10,54,126]],[.56,[36,30,5],[52,72,64]],[.585,[32,34,14]],[.645,[0,46,118],[40,80,64]],[.665,[0,46,120]],[.74,[40,14,5],[64,82,72]],[.88,[40,14,5]],[1,H0(1)]],1);
    if(p>.26&&p<.37){const t=.9*trem(p,.26,.37,o.p2?5.6:7,2.2);A.hL[2]+=t;A.hR[2]-=t;A.B[1]=.5*t}
    const UPF=[.1,.3,1],DESC=[.8,.25,.45],DESCN=[.5,-.1,-.8],LOW=[.9,.1,-.2],LOWN=[.2,0,-1],RISE=[.3,.6,.7],RISEN=[.7,-.5,.3];
    ho([[0,FD0,PN0,.35],[.1,RISE,RISEN,.15],[.2,UPF,FWD,0],[.37,UPF,FWD,0],[.4,DESC,DESCN,0],[.42,FWD,DN,0],[.5,LOW,LOWN,.1],[.56,LOW,LOWN,.1],[.6,DESC,DESCN,.05],[.64,UPF,FWD,0],[.665,UPF,FWD,0],[.7,DESC,DESCN,0],[.74,FWD,DN,0],[.88,FWD,DN,0],[1,FD0,PN0,.35]],-1);
    ho([[0,FD0,PN0,.35],[.1,RISE,RISEN,.15],[.2,UPF,FWD,0],[.5,UPF,FWD,0],[.53,DESC,DESCN,0],[.56,FWD,DN,0],[.585,LOW,LOWN,.1],[.615,DESC,DESCN,.05],[.645,UPF,FWD,0],[.665,UPF,FWD,0],[.7,DESC,DESCN,0],[.74,FWD,DN,0],[.88,FWD,DN,0],[1,FD0,PN0,.35]],1);
    const up=rise(p,.06,.2,.37,.42),up2=rise(p,.58,.64,.66,.74);
    A.inh=sstep(.02,.24,p)*(1-sstep(.37,.42,p));A.infl=.08*A.inh;A.spark=A.inh;A.suck=p<.26?p/.26:-1;A.flagM=.7*A.inh;
    A.hp=-.25*up-.15*up2+.1*pls(p,.42,.1)+.1*pls(p,.56,.1)-.6*rise(p,.76,.8,.86,.9)+.15*pls(p,.74,.08);A.hz=6*up+4*up2;A.jaw=.35*rise(p,.77,.8,.86,.9)+.25*Math.max(pls(p,.42,.05),pls(p,.56,.05),pls(p,.74,.05));
    A.squint=.6*rise(p,.08,.2,.37,.42);
    for(const[c,at] of[[.42,[36,-30,0]],[.56,[36,30,0]],[.74,[40,0,0]]]){fx('hah',(p-c)/.14,{small:c<.7?1:0});fx('snow',(p-c)/.18,{at,n:7,r:c<.7?14:22});fx('crack',(p-c)/Math.min(.4,.995-c),{at,r:c<.7?22:30})}}
  else if(anim==='snowball'){// LA PALLA CHE CRESCE: bends down and rolls the snow with both hands (a ball grows to r 14), takes it to its side,
    // a bowler's wind-up (the body turned, the arm back and low, the breath), releases it along the floor at .60 (the game draws it from
    // there), stays low watching it, straightens and claps the snow off its hands (.88, .95). Second phase: one ball in each hand
    const r=14*sstep(.04,.22,p),ro=TAU*3*cl(p/.24,0,1),w0=sstep(0,.06,p),wH=sstep(.2,.26,p);
    const CLAP=[.3,0,1],CLAPN=[0,-1,0],PALM=[.4,-.3,1],PALMF=[.6,0,.3],ROLL=[.4,0,-1],ROLLN=[0,-1,0],THR=[.3,0,-1],THRN=[.9,0,.3],REL=[1,0,-.15],RELN=[.15,0,1],FOL=[.95,.1,-.2],FOLN=[.2,-.2,1],LOW=[.6,.05,-.8],LOWN=PN0,DOWN=[1,0,0],DOWNN=[.3,-.9,0];
    if(!P2){const v=kv([[0,[.1,0,0]],[.06,[.42,-6,0]],[.24,[.44,-6,0]],[.38,[.2,-2,.1]],[.52,[.3,-6,.5]],[.56,[.3,-6,.5]],[.6,[.46,-8,-.05]],[.64,[.5,-8,-.15]],[.82,[.44,-7,-.1]],[.9,[.12,0,0]],[1,[.1,0,0]]],p);
      A.lean=v[0];A.B[2]=v[1];A.yaw=v[2];
      const bcAt=q=>q<.24?[36,0,14*sstep(.04,.22,q)]:kv([[.24,[36,0,14]],[.3,[22,30,20]],[.38,[6,44,30]],[.52,[-20,48,22]],[.56,[-22,48,20]],[.6,[30,16,14]]],q),bc=bcAt(Math.min(p,.6)),hold=q=>add(bcAt(q),[-6,4,-12]);
      if(p<.6)A.ball={c:bc,r:Math.max(1,r),spin:p<.24?ro:ro+(p-.24)*8,held:p<.24?0:1};
      const rL=[36+4*Math.cos(ro),-(r+6),5+r*.7+2*Math.sin(ro)],rR=[36-4*Math.cos(ro),r+6,5+r*.7-2*Math.sin(ro)];
      if(p<.26)A.hR=lerp3(lerp3(H0(1),rR,w0),hold(Math.max(p,.24)),wH);
      else if(p<.6)A.hR=hold(p);
      else A.hR=kv([[.6,hold(.6)],[.64,[40,20,8]],[.8,[38,22,10]],[.86,[30,8,48]],[.88,[30,6,50]],[.915,[28,20,52]],[.95,[30,6,50]],[1,H0(1)]],p);
      const rL24=[40,-20,14.8];A.hL=p<.24?lerp3(H0(-1),rL,w0):kv([[.24,rL24],[.38,[24,-40,30]],[.52,[32,-30,42]],[.6,[18,-42,28]],[.8,[22,-40,26]],[.86,[30,-8,48]],[.88,[30,-6,50]],[.915,[28,-20,52]],[.95,[30,-6,50]],[1,H0(-1)]],p);
      ho([[0,FD0,PN0,.35],[.06,ROLL,ROLLN,.15],[.2,ROLL,ROLLN,.15],[.26,PALMF,PALM,.3],[.52,PALMF,PALM,.3],[.57,THR,THRN,.2],[.62,REL,RELN,.1],[.7,FOL,FOLN,.2],[.8,LOW,LOWN,.3],[.86,CLAP,CLAPN,0],[.95,CLAP,CLAPN,0],[.975,DOWN,DOWNN,.2],[1,FD0,PN0,.35]],1);
      ho([[0,FD0,PN0,.35],[.06,ROLL,ROLLN,.15],[.24,ROLL,ROLLN,.15],[.3,FD0,PN0,.25],[.8,FD0,PN0,.3],[.86,CLAP,CLAPN,0],[.95,CLAP,CLAPN,0],[.975,DOWN,DOWNN,.2],[1,FD0,PN0,.35]],-1);
      A.inh=.7*sstep(.38,.56,p)*(1-sstep(.6,.64,p));A.infl=.06*A.inh;A.flagM=.5*A.inh;A.hp=.15*rise(p,.02,.08,.2,.26)+.1*rise(p,.6,.64,.8,.86);
      fx('snow',(p-.02)/.24,{at:[36,0,0],n:5,r:12});fx('hah',(p-.6)/.16,{small:1});for(const c of[.88,.95])fx('clap',(p-c)/.1)}
    else{const v=kv([[0,[.1,0,0]],[.06,[.42,-6,0]],[.24,[.44,-6,0]],[.38,[.2,-3,0]],[.5,[.25,-5,0]],[.52,[.46,-8,-.3]],[.6,[.3,-6,0]],[.66,[.46,-8,.3]],[.8,[.4,-7,0]],[.9,[.12,0,0]],[1,[.1,0,0]]],p);
      A.lean=v[0];A.B[2]=v[1];A.yaw=v[2];
      const bLAt=q=>q<.24?[32,-16-14*sstep(.04,.22,q)*.3,14*sstep(.04,.22,q)]:kv([[.24,[32,-20,14]],[.38,[0,-46,24]],[.5,[-20,-48,20]],[.52,[30,-16,14]]],q),
        bRAt=q=>q<.24?[32,16+14*sstep(.04,.22,q)*.3,14*sstep(.04,.22,q)]:kv([[.24,[32,20,14]],[.38,[0,46,24]],[.5,[-20,48,20]],[.6,[-22,48,20]],[.66,[30,16,14]]],q);
      const hold=(q,sd)=>add(sd<0?bLAt(q):bRAt(q),[-5,sd*4,-11]);
      if(p<.52)A.ball={c:bLAt(p),r:Math.max(1,r),spin:ro,held:p<.24?0:-1};if(p<.66)A.ball2={c:bRAt(p),r:Math.max(1,r),spin:ro+1,held:p<.24?0:1};
      const rL=[32+4*Math.cos(ro),-16-r*.3-r-3,4+r*.6],rR=[32-4*Math.cos(ro),16+r*.3+r+3,4+r*.6],rL24=[36,-37.2,12.4],rR24=[28,37.2,12.4];
      if(p<.26){A.hL=lerp3(lerp3(H0(-1),p<.24?rL:rL24,w0),hold(Math.max(p,.24),-1),wH);A.hR=lerp3(lerp3(H0(1),p<.24?rR:rR24,w0),hold(Math.max(p,.24),1),wH)}
      else{A.hL=p<.52?hold(p,-1):kv([[.52,hold(.52,-1)],[.56,[40,-20,8]],[.6,[36,-24,10]],[.8,[36,-24,12]],[.86,[30,-6,50]],[.88,[30,-6,50]],[.915,[28,-20,52]],[.95,[30,-6,50]],[1,H0(-1)]],p);
        A.hR=p<.66?hold(p,1):kv([[.66,hold(.66,1)],[.7,[40,20,8]],[.8,[36,24,12]],[.86,[30,6,50]],[.88,[30,6,50]],[.915,[28,20,52]],[.95,[30,6,50]],[1,H0(1)]],p)}
      ho([[0,FD0,PN0,.35],[.06,ROLL,ROLLN,.15],[.2,ROLL,ROLLN,.15],[.26,PALMF,PALM,.3],[.44,PALMF,PALM,.3],[.49,THR,THRN,.2],[.54,REL,RELN,.1],[.62,FOL,FOLN,.2],[.8,LOW,LOWN,.3],[.86,CLAP,CLAPN,0],[.95,CLAP,CLAPN,0],[.975,DOWN,DOWNN,.2],[1,FD0,PN0,.35]],-1);
      ho([[0,FD0,PN0,.35],[.06,ROLL,ROLLN,.15],[.2,ROLL,ROLLN,.15],[.26,PALMF,PALM,.3],[.58,PALMF,PALM,.3],[.63,THR,THRN,.2],[.68,REL,RELN,.1],[.75,FOL,FOLN,.2],[.8,LOW,LOWN,.3],[.86,CLAP,CLAPN,0],[.95,CLAP,CLAPN,0],[.975,DOWN,DOWNN,.2],[1,FD0,PN0,.35]],1);
      A.inh=.7*sstep(.36,.5,p)*(1-sstep(.52,.56,p));A.infl=.06*A.inh;A.flagM=.5*A.inh;
      fx('hah',(p-.52)/.14,{small:1});fx('hah',(p-.66)/.14,{small:1});for(const c of[.88,.95])fx('clap',(p-c)/.1)}}
  else if(anim==='breath'){// SOFFIO GELIDO: the great breath (it rises, the head and the chest go back, the fur bristles, the mane opens, the
    // flag bends to the mouth, the snow of the room runs into it, the sparkles; from .25 the mouth ajar with the throat lit); .42 the head snaps
    // forward, the jaws wide (a flash); it leans into its blast (the model draws its first 60 px), its own wind pushes back the fur and the
    // flag; from .80 it closes the mouth and bends over, spent: «Senza fiato» goes on from there
    const pre=sstep(0,.4,p)*(1-sstep(.42,.45,p)),blow=rise(p,.42,.45,.78,.84);A.inh=pre;A.infl=.12*pre;A.bz=4*pre;A.rear=.2*pre-.04*blow;A.lean=.1+.2*blow;
    A.hp=-.4*pre-.08*blow;A.hx=4*blow;A.hz=-1.5*blow;A.flagM=pre;A.suck=p<.42?p/.42:-1;A.spark=pre;A.jaw=Math.max(.36*rise(p,.24,.3,.4,.43),blow);A.throat=Math.max(sstep(.25,.4,p)*(1-sstep(.42,.45,p)),blow);
    A.squint=.5*pre;A.wrev=blow;
    A.hL=kv([[0,H0(-1)],[.3,[8,-56,36]],[.42,[8,-56,38]],[.46,[16,-52,30]],[.8,[16,-52,30]],[1,[16,-52,30]]],p);A.hR=kv([[0,H0(1)],[.3,[8,56,36]],[.42,[8,56,38]],[.46,[16,52,30]],[.8,[16,52,30]],[1,[16,52,30]]],p);
    const OPEN=[.3,.5,-.8],OPENN=[.6,-.8,-.1];ho2([[0,FD0,PN0,.35],[.3,OPEN,OPENN,0],[.8,OPEN,OPENN,0],[1,OPEN,OPENN,.2]]);
    if(blow>0){const t=.5*trem(p,.44,.8,o.p2?5.6:7,3);A.B[1]+=t;A.hy+=.02*t}
    gaspTo(sstep(.8,1,p));
    fx('mflash',(p-.42)/.08);fx('cone',(p-.42)/.38);fx('pant',(p-.86)/.14)}
  else if(anim==='gasp'){// SENZA FIATO: bent over with the hands on its knees (as the breath or the howl left it), the head hanging, the tongue
    // out, the fur flat, four short puffs, the eyes spent; it shakes its head and straightens at the end
    const b=1-sstep(.85,1,p),pump=Math.max(pls(p,.12,.08),pls(p,.34,.08),pls(p,.56,.08),pls(p,.78,.08));
    A.lean=lerp(.1,.45,b)+.04*pump;A.rear=-.08*b;A.B[2]=-4*b-1.2*pump;A.hp=.35*b-.1*pump;A.tongue=b;A.jaw=lerp(0,.45,b)+.15*pump;A.infl=-.04*b;A.fluff=-.18*b;A.dim=b;A.flagOff=b;A.squint=.4*b;
    for(const sd of[-1,1]){const k=sd<0?'L':'R';A['h'+k]=lerp3(H0(sd),[16,sd*30,26],b);A['fd'+k]=nrm(lerp3(mr(FD0,sd),FWD,b));A['pn'+k]=nrm(lerp3(mr(PN0,sd),DN,b));A['g'+k]=lerp(.35,.5,b)}
    A.hy=.3*trem(p,.85,.98,6,1.4);
    for(const c of[.12,.34,.56,.78])fx('pant',(p-c)/.16)}
  else if(anim==='roar'){// RUGGITO DELLA VALANGA: rears up and beats its chest with the fists (.10 left, .18 right, .26 left: a white ring each),
    // the breath fills it; throws the head back and howls at the sky, the arms wide and high, a column of breath, the whole body shaking;
    // falls back hunched and pants, bent over: «Senza fiato» goes on from there
    const up=sstep(0,.08,p)*(1-sstep(.7,.82,p));A.rear=.4*up;A.lean=lerp(.1,-.1,up);A.B[2]=5*up;
    const bt=[[.10,-1],[.18,1],[.26,-1]],fist=sd=>{let h=[24,sd*28,82];for(const[c,s2] of bt)if(s2===sd)h=lerp3(h,[34,sd*12,78],pls(p,c,.08));return h};
    const k=sstep(.3,.36,p),c0=sstep(0,.06,p);for(const sd of[-1,1]){const h=lerp3(lerp3(H0(sd),fist(sd),c0),[-2,sd*64,110],k);if(sd<0)A.hL=h;else A.hR=h}
    ho2([[0,FD0,PN0,.35],[.06,[1,0,.2],[0,-1,0],1],[.3,[1,0,.2],[0,-1,0],1],[.36,[.2,.6,.8],FWD,0],[.68,[.2,.6,.8],FWD,0],[1,[.2,.6,.8],FWD,0]]);
    A.inh=sstep(.02,.3,p)*(1-sstep(.3,.34,p));A.infl=.08*A.inh;A.spark=A.inh;A.suck=p<.3?p/.3:-1;A.flagM=.7*A.inh;
    const how=rise(p,.3,.36,.66,.72);A.hp=-.7*how;A.jaw=Math.max(how,.3*Math.max(pls(p,.78,.06),pls(p,.9,.06)));A.throat=how;A.squint=.5*how;A.blz=Math.max(A.blz,how);
    if(how>0){const tz=o.p2?.8:1,t=trem(p,.32,.7,7*tz,3);A.B[1]+=.8*t;A.B[0]+=.4*trem(p,.32,.7,5*tz,3)}
    for(const[c] of bt){fx('chest',(p-c)/.22);A.bz-=1.5*pls(p,c,.05)}
    gaspTo(sstep(.7,1,p));
    fx('column',(p-.32)/.4);fx('pant',(p-.78)/.12);fx('pant',(p-.9)/.1)}
  else if(anim==='claws'){// ARTIGLI DI GHIACCIO (fase 2): rises with the right arm cocked high behind its head, the light runs along the blades;
    // slashes the air diagonally (.48, three white lines), the swing turns it and the left arm rises; the second slash the other way (.66)
    A.lean=kv([[0,[.1]],[.3,[-.05]],[.44,[-.05]],[.5,[.3]],[.58,[.05]],[.62,[.05]],[.66,[.32]],[.8,[.2]],[1,[.1]]],p)[0];A.B[2]=3*rise(p,.05,.3,.44,.5);
    A.yaw=kv([[0,[0]],[.3,[.15]],[.46,[.18]],[.52,[-.3]],[.62,[-.4]],[.68,[.2]],[.84,[.05]],[1,[0]]],p)[0];
    A.hR=hb([[0,H0(1)],[.25,[-10,30,128],[38,86,92]],[.44,[-12,30,130]],[.48,[30,12,38],[56,40,110]],[.56,[30,6,34]],[.7,[24,30,30]],[1,H0(1)]],1);
    A.hL=hb([[0,H0(1)],[.44,[20,48,30]],[.5,[22,52,36]],[.58,[-10,30,128],[46,92,100]],[.62,[-12,30,130]],[.66,[30,12,38],[56,40,110]],[.74,[30,6,34]],[.9,[20,42,24]],[1,H0(1)]],-1);
    po([[0,PO0],[.12,[-.4,.8,.2]],[.25,[-.3,.6,.7]],[.44,[-.2,.6,.75]],[.5,[.2,.7,.6]],[.6,[-.1,.8,.3]],[.8,PO0],[1,PO0]],1);
    po([[0,PO0],[.44,PO0],[.5,[-.4,.8,.2]],[.58,[-.3,.6,.7]],[.62,[-.2,.6,.75]],[.68,[.2,.7,.6]],[.78,[-.1,.8,.3]],[.92,PO0],[1,PO0]],-1);
    const COCK=[-.2,.1,1],COCKN=[1,0,.2],SL=[1,-.4,-.4],SLN=[.2,-.3,-.9],RISE=[.4,.6,.4],RISEN=[.6,-.6,.4];
    ho([[0,FD0,PN0,.35],[.12,RISE,RISEN,.1],[.25,COCK,COCKN,0],[.44,COCK,COCKN,0],[.48,SL,SLN,0],[.56,[1,-.3,-.3],SLN,0],[.7,[.9,.2,-.3],[.3,-.6,-.6],.1],[1,FD0,PN0,.35]],1);
    ho([[0,FD0,PN0,.35],[.44,FD0,PN0,.3],[.52,RISE,RISEN,.1],[.58,COCK,COCKN,0],[.62,COCK,COCKN,0],[.66,SL,SLN,0],[.74,[1,-.3,-.3],SLN,0],[.9,[.6,.1,-.6],[.4,-.7,-.3],.2],[1,FD0,PN0,.35]],-1);
    A.bl1=sstep(.05,.28,p)*(1-sstep(.5,.6,p));A.bl2=sstep(.5,.6,p)*(1-sstep(.68,.78,p));
    A.inh=.8*sstep(.05,.3,p)*(1-sstep(.46,.5,p));A.infl=.06*A.inh;A.flagM=.5*A.inh;A.squint=.6*rise(p,.2,.3,.66,.75);A.jaw=.5*Math.max(pls(p,.48,.06),pls(p,.66,.06));
    fx('slash',(p-.47)/.22,{sd:1});fx('slash',(p-.65)/.22,{sd:-1});fx('hah',(p-.48)/.12,{small:1});fx('hah',(p-.66)/.12,{small:1});fx('pant',(p-.8)/.12)}
  else if(anim==='rage'){// FURIA: staggers and shakes its head; rears up and beats its chest four times ever harder: each beat the frost runs over
    // the fur and freezes it (the colours to the second phase in four soft steps), the icicles grow, the mantle turns to a crust; the horns
    // creak (crystals from the root to the tip), the claws freeze into blades in three cracks; it howls at the sky (frost bursts out, the
    // eyes turn white, the flag becomes a little blizzard); it settles into the rest of the second phase
    A.lean=kv([[0,[.1]],[.08,[-.08]],[.12,[-.05]],[.2,[-.12]],[.45,[-.12]],[.5,[-.05]],[.62,[-.12]],[.9,[-.12]],[1,[.18]]],p)[0];A.B[0]=-4*rise(p,0,.06,.1,.16);
    A.rear=.35*rise(p,.12,.2,.9,1);A.B[2]=4*rise(p,.12,.2,.9,1)-4*sstep(.9,1,p);
    A.hy=.35*trem(p,.02,.12,4,3);
    const bts=[[.16,-1],[.24,1],[.32,-1],[.40,1]];let kk=0;for(const[c] of bts)kk+=.25*sstep(c,c+.03,p);A.k2=kk;
    const fist=sd=>{let h=[24,sd*28,82];for(const[c,s2] of bts)if(s2===sd)h=lerp3(h,[34,sd*12,78],pls(p,c,.08));return h};
    const how=rise(p,.62,.68,.86,.9);
    for(const sd of[-1,1]){const a=lerp3(H0(sd),[0,sd*44,36],sstep(0,.08,p)),b=lerp3(a,fist(sd),sstep(.12,.16,p)),c=lerp3(b,[22,sd*40,48],sstep(.45,.5,p)),
        e=sstep(.9,1,p),d=add(lerp3(lerp3(c,[-2,sd*64,110],sstep(.62,.68,p)),H2(sd),e),[0,sd*12*Math.sin(Math.PI*e),0]);if(sd<0)A.hL=d;else A.hR=d}
    ho2([[0,FD0,PN0,.35],[.08,[.4,.3,-.8],[.6,-.7,0],.3],[.12,[.4,.3,-.8],[.6,-.7,0],.3],[.16,[1,0,.2],[0,-1,0],1],[.45,[1,0,.2],[0,-1,0],1],[.5,[.6,.3,.6],[0,-1,0],.1],[.62,[.6,.3,.6],[0,-1,0],.1],
      [.68,[.2,.6,.8],FWD,0],[.9,[.2,.6,.8],FWD,0],[1,FD2,PN2,.2]]);
    A.crys=sstep(.46,.6,p);A.blade=.44*sstep(.5,.51,p)+.34*sstep(.54,.55,p)+.22*sstep(.58,.59,p);
    A.hp=-.7*how+.12*rise(p,.45,.5,.58,.62)+.06*sstep(.9,1,p);A.jaw=Math.max(how,.3*Math.max(...bts.map(([c])=>pls(p,c,.05))));A.throat=how;A.squint=.4*rise(p,.14,.2,.6,.66);
    A.ek=sstep(.63,.66,p);A.blz=sstep(.62,.72,p);A.inh=.6*rise(p,.5,.6,.62,.66);A.infl=.05*A.inh;
    if(how>0){const t=trem(p,.64,.88,5.5,3);A.B[1]+=.8*t}
    for(const[c] of bts){fx('chest',(p-c)/.2,{frost:1});A.bz-=1.5*pls(p,c,.05)}fx('crac',(p-.5)/.12);
    fx('frost',(p-.62)/.3);fx('column',(p-.64)/.26)}
  else if(anim==='taunt'){// PRESA IN GIRO «Vieni qui»: leans toward you and holds out its long arm (the one on our side) palm up, out to the side
    // of its body, and beckons twice with the whole hand, the four claws closing; straightens and laughs «hoo-hoo-hoo» in three puffs, the
    // eyes narrowed as if smiling, the fangs showing
    const ts=o.tsd||1,lk=rise(p,0,.15,.52,.66),la=rise(p,.56,.66,.86,.94);A.lean=.1+.15*lk-.08*la;A.rear=.12*la;A.hp=-.1*lk-.18*la;
    const cu=Math.max(pls(p,.3,.1),pls(p,.45,.1)),h=hk([[0,H0(1)],[.15,[30,50,40]],[.22,[42,56,70]],[.52,[42,56,70]],[.66,[30,52,46]],[.92,[18,47,22]],[1,H0(1)]],ts);
    const hh=add(h,[-4*cu,-ts*2*cu,3*cu]);if(ts<0)A.hL=hh;else A.hR=hh;
    ho([[0,FD0,PN0,.35],[.15,[.8,.3,.3],[.2,-.4,.9],.2],[.22,[1,.4,.15],[0,0,1],.1],[.52,[1,.4,.15],[0,0,1],.1],[.66,[.6,.2,-.6],[.4,-.6,.3],.3],[1,FD0,PN0,.35]],ts);
    {const k=ts<0?'L':'R',fd=A['fd'+k],pn=A['pn'+k];A['fd'+k]=nrm(lerp3(fd,pn,.75*cu));A['g'+k]+=.75*cu}
    A.curlIdx=.4*cu;A.tsd=ts;
    A.jaw=la*(.25+.15*Math.max(pls(p,.62,.07),pls(p,.72,.07),pls(p,.82,.07)));A.smile=la;A.bz=-1.2*Math.max(pls(p,.62,.06),pls(p,.72,.06),pls(p,.82,.06));
    for(const c of[.62,.72,.82])fx('pant',(p-c)/.12)}
  else if(anim==='enter'){// ENTRATA «la valanga lo porta»: a front of snow slides in from behind and heaps into a mound; the mound breathes; two
    // eyes open in the snow and the tips of the horns come out; the horns break through, then the head and the shoulders, the mound splits
    // into clods that roll away; it shakes like a dog; the great breath; it roars forward and stands at rest
    A.sink=p<.16?lerp(130,80,ez(p/.16)):(lin(SINK,p-.01)+lin(SINK,p)+lin(SINK,p+.01))/3;A.B[2]=-A.sink;
    // (he rears up only once he is out of the snow: under it he stays curled, the hump inside the mound)
    A.rear=.4*rise(p,.47,.53,.56,.62);A.hp=-.25*rise(p,.47,.53,.56,.6);A.lean=.1-.1*rise(p,.47,.53,.56,.62);
    A.mound=p<.16?p/.16:p<.56?1:-1;A.heave=rise(p,.34,.42,.5,.56);A.crater=sstep(.42,.56,p);A.chunks=p>=.46&&p<.76?(p-.46)/.3:-1;
    A.snowEyes=rise(p,.3,.34,.44,.47);A.eyeOn=sstep(.3,.34,p);
    const sh=p>.56&&p<.68?(p-.56)/.12:-1;if(sh>=0){A.yaw=.35*Math.sin(sh*TAU*1.5)*Math.sin(Math.PI*sh);A.hy=-.5*A.yaw;A.fluff=.3*Math.sin(Math.PI*sh)}
    const br=sstep(.68,.78,p)*(1-sstep(.8,.83,p));A.inh=br;A.infl=.1*br;A.spark=br;A.suck=p>.68&&p<.8?(p-.68)/.12:-1;A.flagM=.7*br;A.bz=3*br;A.hp+=-.3*br;
    const ro=rise(p,.8,.84,.92,.98);A.lean+=.22*ro;A.hp+=.15*ro;A.jaw=ro;A.throat=ro*.6;A.squint=.4*ro;
    A.hL=kv([[0,H0(-1)],[.5,H0(-1)],[.8,[10,-50,30]],[.84,[18,-52,26]],[.92,[18,-52,26]],[1,H0(-1)]],p);A.hR=kv([[0,H0(1)],[.5,H0(1)],[.8,[10,50,30]],[.84,[18,52,26]],[.92,[18,52,26]],[1,H0(1)]],p);
    A.flagOff=1-sstep(.5,.6,p);A.windK=sstep(.45,.6,p);
    fx('ring',(sh>=0?sh:-1),{spray:1});fx('puffm',(p-.2)/.1);fx('puffm',(p-.27)/.1);fx('cloud',(p-.84)/.16)}
  else if(anim==='die'){// SCONFITTA «torna neve»: staggers, the eyes flicker; falls on its right knee and right hand, the wind stops, the last
    // breath flies away; the frost rises from the floor and turns the fur to blue glass from the feet up, the eyes go out, white cracks run up
    // the body; .55 it shatters: eight big pieces of ice fly out and fall round, the snow bursts, the horns fall, bounce and lie crossed on
    // the little mound of snow it leaves, like a small peak; flakes; everything fades
    const st=1-sstep(.12,.2,p);A.lean=kv([[0,[.1]],[.06,[-.08]],[.12,[-.05]],[.24,[.3]],[1,[.3]]],p)[0];A.B=[-3*sstep(0,.06,p)*st,0,-12*sstep(.14,.26,p)];A.roll=.04*trem(p,0,.12,4,4)+.08*sstep(.14,.26,p);
    A.fR=kv([[0,[2,18,0]],[.14,[2,18,0]],[.24,[-16,18,0]],[1,[-16,18,0]]],p);
    A.hR=kv([[0,H0(1)],[.14,[16,48,26]],[.24,[28,34,5]],[1,[28,34,5]]],p);A.hL=kv([[0,H0(-1)],[.2,[14,-46,22]],[.3,[20,-34,22]],[1,[20,-34,22]]],p);
    ho([[0,FD0,PN0,.35],[.14,[.5,.05,-.85],[.4,-.6,-.4],.3],[.24,FWD,DN,.2],[1,FWD,DN,.2]],1);
    A.hp=.3*sstep(.14,.3,p);A.eyeOn=p<.16?.6+.4*Math.cos(p/.16*TAU*2):1;A.windK=1-sstep(.12,.2,p);A.flagOff=sstep(.12,.22,p);A.dim=sstep(.3,.5,p)*.6;
    A.jaw=.4*rise(p,.16,.2,.28,.32);A.ice=sstep(.32,.55,p);A.crack=sstep(.45,.55,p);A.shat=p>=.55?(p-.55)/.45:-1;A.eyeOn*=1-sstep(.46,.52,p);
    A.fade=1-sstep(.85,1,p);fx('lastb',(p-.16)/.3)}
  else{// FERMO: in piedi curvo, peso avanti; un respiro lento, la mano destra gratta il ghiaccio, fiuta l'aria (fase 2: il pelo gelato sta fermo)
    const br=sstep(0,.45,p)*(1-sstep(.45,.75,p));A.inh=.25*br;A.infl=.025*br;A.bz=2*br;
    A.blink=blink(p,.35,.1);
    if(!P2){const scr=rise(p,.5,.6,.74,.84),HK=[[0,H0(1)],[.5,H0(1)],[.58,[24,45,14]],[.62,[13,44,11]],[.66,[24,45,14]],[.70,[13,44,11]],[.77,[18,46,16]],[.86,H0(1)],[1,H0(1)]];
      A.hR=kv(HK,p);A.roll=.06*scr;A.lean=.1+.1*scr;A.B[2]=-2*scr;A.fdR=nrm(lerp3(FD0,[.7,.1,-.8],scr));
      fx('scrape',(p-.6)/.12,{sd:1});fx('scrape',(p-.68)/.12,{sd:1})}
    const sn=Math.max(pls(p,.82,.06),pls(p,.90,.06)),snu=rise(p,.77,.8,.93,.97);A.hp=-.2*snu-.06*sn;A.hz=1.5*snu;A.hy=.05*Math.sin(ph)*(1-snu);
    fx('nose',(p-.5)/.14);fx('nose',(p-.58)/.14);
    if(P2){A.tink=Math.max(pls(p,.2,.06),pls(p,.7,.06));A.cpulse=Math.max(pls(p,.3,.12),pls(p,.46,.12));fx('mist',p)}}
  if(A.sink>0)for(const h of[A.hL,A.hR,A.fL,A.fR])h[2]-=A.sink;
  // the second phase: lower, the blades forward. Every move starts and ends in this rest of its phase (the howl and the breath only start in
  // it, the gasp only ends in it: they flow one into the other); still and hit all through; the walk goes through it at .25 and .75
  if(P2&&anim!=='walk'){const r2=anim==='idle'||anim==='hit'?1:anim==='breath'||anim==='roar'||anim==='die'?1-sstep(0,.1,p):anim==='gasp'?sstep(.9,1,p):1-rise(p,0,.1,.9,1);
    if(r2>.0001){A.B[2]-=4*r2;A.lean+=.08*r2;
      for(const sd of[-1,1]){const k=sd<0?'L':'R';A['h'+k]=add(A['h'+k],mul([10,-4*sd,10],r2));A['fd'+k]=nrm(lerp3(A['fd'+k]||mr(FD0,sd),mr(FD2,sd),r2));
        A['pn'+k]=nrm(lerp3(A['pn'+k]||mr(PN0,sd),mr(PN2,sd),r2));A['g'+k]=lerp(A['g'+k],.2,r2)}}}
  return A}

// ------------------------------------------------------------------ frames
// the upper body (chest, hump, shoulders, head) straightens round PIV by A.rear and rises with the breath (A.bz)
function upper(X,A){const r=-(A.rear||0),c=Math.cos(r),s=Math.sin(r),bz=A.bz||0;
  return{T:q=>{const x=q[0]-PIV[0],z=q[2]-PIV[2];return X.T([PIV[0]+x*c+z*s,q[1],PIV[2]-x*s+z*c+bz])},Rd:v=>X.Rd([v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c])}}

// ------------------------------------------------------------------ the torso: belly, chest and hump as one shaggy shape; the bare skin;
// the curls; the mantle of snow with its icicles and sparkles
// the fur's three tones: a soft light high on the left, the base, the deep blue low on the right
function furGrad(b,T){const w=b[2]-b[0],h=b[3]-b[1],R=Math.max(w,h,2),g=ctx.createRadialGradient(b[0]+w*.3,b[1]+h*.16,R*.02,b[0]+w*.4,b[1]+h*.3,R*.86);
  g.addColorStop(0,cmix(T.l,T.b,.42));g.addColorStop(.1,cmix(T.l,T.b,.8));g.addColorStop(.28,T.b);g.addColorStop(.74,T.d);g.addColorStop(1,T.d);return g}
function torsoDraw(V0,X,XU,A,K,J){const{P,F}=V0,inf=A.infl,vs=[{C:BC,R:mul(BR,1+inf*.5),T:X},{C:CC,R:mul(CR3,1+inf),T:XU},{C:UC,R:mul(UR,1+inf),T:XU}];
  const pts=[];for(const v of vs)for(const q of ellSil(V0,v.C,v.R,null,v.T.T,16))pts.push(q);const H=hullE(pts,.08);if(H.length<3)return;const hp=smoothP(H);J.thull=H;J.tpath=hp;
  // the tufts: they grow as their root comes to the outline; they hang, open out with the breath, go with the wind; one shaggy shape with
  // the body (one outline round all), the clumps that overlap outside the body parted by a deep blue line
  const tp=new Path2D(),W=J.W,hang=lerp(.5,.16,A.k2),Lk=(1+.35*A.inh+A.fluff)*lerp(1,1.22,A.k2),wk=lerp(1,.7,A.k2),op=.45*A.inh+A.fluff,wv=A.windK*(LOWFX?0:1);
  for(let i=0;i<3;i++){const v=vs[i];for(const t of TUF[i]){const n=v.T.Rd(ellN(v.R,null,t.m)),f=F(n),af=Math.abs(f);if(af>.42)continue;const k=1-sstep(.1,.42,af);if(k<.05)continue;
    const s=v.T.T(ellAt(v.C,v.R,null,t.m)),gust=.16+.12*Math.sin(A.wph*TAU+t.ph);
    const d=nrm(add(add(mul(n,1-hang+op),[0,0,-hang*(1-op*.6)]),mul(W,gust*wv*(1-A.k2*.6))));
    tuft(tp,P(add(s,mul(n,-2.8))),P(add(s,mul(d,t.L*k*Lk))),t.w*k*wk,t.b*(1-.6*A.k2))}}
  const bb=bbox(H);ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.stroke(hp);ctx.lineWidth=3.4;ctx.stroke(tp);
  // the cold rim of the moon on the upper left of the outline, the warm thread of the torches of the Den on the lower left: light strokes
  // under the fill, so only their outer half shows, on the dark outline
  {const w=bb[2]-bb[0],h=bb[3]-bb[1];for(const[x0,y0,x1,y1,al,rgb] of[[bb[0],bb[1]+h*.25,bb[0]+w*.4,bb[1]+h*.45,.75,'225,240,255'],[bb[0],bb[3]-h*.05,bb[0]+w*.42,bb[1]+h*.5,.8,'255,170,100']]){
    const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,`rgba(${rgb},${al})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.strokeStyle=g;ctx.lineWidth=2.8;ctx.stroke(hp);ctx.lineWidth=2.2;ctx.stroke(tp)}}
  const g=furGrad(bb,K.fur);ctx.fillStyle=g;ctx.fill(hp);ctx.fill(tp);
  {ctx.save();const out=new Path2D();out.rect(-1e4,-1e4,2e4,2e4);out.addPath(hp);ctx.clip(out,'evenodd');ctx.globalAlpha*=.8;ctx.strokeStyle=K.gap;ctx.lineWidth=1.2;ctx.stroke(tp);
    if(A.k2>.02){ctx.globalAlpha=A.k2;ctx.strokeStyle=K.tip;ctx.lineWidth=.9;ctx.stroke(tp)}ctx.restore()}
  // the deep shade low down (it stands out of the pale floor)
  {const gr=ctx.createLinearGradient(0,bb[1]+(bb[3]-bb[1])*.5,0,bb[3]+8);gr.addColorStop(0,'rgba(14,18,48,0)');gr.addColorStop(1,'rgba(14,18,48,.45)');ctx.fillStyle=gr;ctx.fill(hp);ctx.fill(tp)}
  ctx.save();ctx.clip(hp);
  // the bare night-blue skin of the chest (a ragged edge where the fur grows over it)
  {const r=ellCap(V0,XU,CC,mul(CR3,1+inf),AXES,SKN,SKA,28,{alv:SKAV,u:[0,0,1],ck:'skin',rf:t=>1+.1*Math.sin(t*7+.5)});
    if(r){const b2=bbox(r.pts);ctx.fillStyle=grad3(b2,K.skin);ctx.fill();ctx.strokeStyle=K.gap;ctx.lineWidth=1.2;ctx.stroke()}}
  // the curls of the fur
  // (soft «u» curls, like locks hanging: never a «V»)
  ctx.lineCap='round';ctx.lineJoin='round';for(const c of CURL){const v=vs[c.i],n=v.T.Rd(ellN(v.R,null,c.m)),f=F(n);if(f<.16)continue;const s=v.T.T(ellAt(v.C,v.R,null,c.m)),[u,w]=frm(n,[0,0,1]),k=c.k*3.4,
      hk=c.h,a=P(add(s,add(mul(w,k*hk),mul(u,k*.6)))),b=P(add(s,add(mul(u,-k*1.15),mul(w,-k*.15*hk)))),e=P(add(s,add(mul(w,-k*.75*hk),mul(u,-k*.2)))),li=lit(V0,n)>.6;
    ctx.globalAlpha=cl((f-.16)*4,0,1)*(li?.7:.8);ctx.strokeStyle=li?K.curlL:K.curlD;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(b[0],b[1],e[0],e[1]);ctx.stroke()}ctx.globalAlpha=1;
  ctx.restore();
  // the long locks of the back fur out from under the mantle (the mantle covers their roots)
  {const pl=new Path2D(),R2=mul(UR,1+A.infl),W=J.W;let any=false;for(const lk of MLOCK){const n=XU.Rd(ellN(R2,AXES,lk.m)),f=F(n),kf=sstep(.02,.3,f);if(kf<=.01)continue;
      const r0=XU.T(ellAt(UC,R2,AXES,lk.m)),d=nrm(add(add(mul(n,.3+.25*A.inh+A.fluff),[0,0,-1]),mul(W,.22*A.windK*(LOWFX?0:1+.3*Math.sin(A.wph*TAU+lk.L))))),
        tip=add(r0,mul(d,lk.L*(1+.25*A.inh)*lerp(1,1.15,A.k2)*kf));tuft(pl,P(add(r0,mul(d,-4))),P(tip),lk.w*kf,1.4);any=true}
    if(any){union([pl],furGrad(bb,K.fur),2.4);ctx.save();ctx.clip(pl);ctx.strokeStyle=K.curlD;ctx.globalAlpha=.55;ctx.lineWidth=1.1;ctx.stroke(pl);ctx.restore()}}
  if(A.k2>.05)for(const m of BICE){const v=vs[0],n=X.Rd(ellN(v.R,null,m)),f=F(n);if(f<-.1)continue;const q3=X.T(ellAt(v.C,v.R,null,m));ga(cl((f+.1)*5,0,1)*sstep(.05,.4,A.k2),()=>icicle(V0,add(q3,[0,0,-1]),9*A.k2,2.2,K.ice))}
  mantleDraw(V0,XU,A,K,J)}
function mantleDraw(V0,XU,A,K,J){const{P,F}=V0,R2=add(mul(UR,1+A.infl),[2.4,2.4,2.4]),r=ellCap(V0,XU,UC,R2,AXES,MN,MAL,44,{alv:MALV,u:[0,0,1],ck:'mt',rf:rfM});if(!r)return;
  const bb=bbox(r.pts);ctx.fillStyle=grad3(bb,K.snow);ctx.fill();ctx.lineJoin='round';ctx.lineCap='round';snowEdge(r);
  // the dots of the snow, its two folds, the band of light of the crust (second phase)
  ctx.save();ctx.beginPath();for(const q of r.pts)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.clip();
  const kb=K.band;
  if(kb<.98)ga(1-kb,()=>{ctx.fillStyle=K.dots;ctx.beginPath();for(const m of MDOT){const n=XU.Rd(ellN(R2,AXES,m));if(F(n)<.2)continue;const q=P(XU.T(ellAt(UC,R2,AXES,m)));ctx.moveTo(q[0]+1.3,q[1]);ctx.arc(q[0],q[1],1.3,0,TAU)}ctx.fill()});
  // (the crust of ice of the second phase: short cracks and the edges of a few facets where the snow had its dots)
  if(kb>.02)ga(kb,()=>{ctx.lineCap='round';ctx.lineJoin='round';for(let i=0;i<MDOT.length;i++){const m=MDOT[i],n=XU.Rd(ellN(R2,AXES,m));if(F(n)<.2)continue;const c=XU.T(ellAt(UC,R2,AXES,m)),[u,v]=frm(n,[0,0,1]);
    if(i%3===2){const a=P(add(c,add(mul(u,4.5),mul(v,-3.5)))),b=P(add(c,add(mul(u,-3.5),mul(v,4.5))));ctx.strokeStyle='rgba(40,90,150,.6)';ctx.lineWidth=1.4;seg(a,b);ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1;seg([a[0]+1.2,a[1]-1],[b[0]+1.2,b[1]-1]);ctx.stroke()}
    else{const pts=[[0,0],[2.4,1.5],[3.6,-.7],[6,.5]].map(([x0,y0])=>P(add(c,add(mul(v,x0-3),mul(u,y0)))));ctx.strokeStyle='rgba(40,90,150,.62)';ctx.lineWidth=1.15;ctx.beginPath();for(const w of pts)ctx.lineTo(w[0],w[1]);ctx.stroke()}}});
  ctx.lineCap='round';for(const f of MFOLD){const S=[];for(const m of f){const n=XU.Rd(ellN(R2,AXES,m));if(F(n)<.1)continue;S.push(P(XU.T(ellAt(UC,R2,AXES,m))))}
    if(S.length>1)for(const[dy,col,lw] of[[1.1,K.fold,1.6],[-.6,'rgba(255,255,255,.9)',1.2]]){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(S[0][0],S[0][1]+dy);if(S.length>2)ctx.quadraticCurveTo(S[1][0],S[1][1]+dy,S[2][0],S[2][1]+dy);else ctx.lineTo(S[1][0],S[1][1]+dy);ctx.stroke()}}
  // (the band of light of the crust: a bright stroke and a thin one under it)
  if(kb>.02){const c=[(bb[0]+bb[2])/2,(bb[1]+bb[3])/2],w=bb[2]-bb[0];ga(kb,()=>{ctx.lineCap='round';ctx.strokeStyle='rgba(255,255,255,.92)';ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(c[0]-w*.35,c[1]-2);ctx.quadraticCurveTo(c[0]-w*.05,c[1]-w*.18,c[0]+w*.25,c[1]-w*.12);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(c[0]-w*.28,c[1]+4);ctx.quadraticCurveTo(c[0]-w*.02,c[1]-w*.09,c[0]+w*.2,c[1]-w*.04);ctx.stroke()})}
  ctx.restore();
  rims(r.pts,.6,0);
  // the icicles hanging from its edge (longer in the second phase)
  for(const c of MICE){const n=XU.Rd(ellN(R2,AXES,c.m)),f=F(n);if(f<-.18)continue;const q3=XU.T(ellAt(UC,R2,AXES,c.m));
    ga(cl((f+.18)*5,0,1),()=>icicle(V0,add(q3,[0,0,1.2]),c.l*lerp(1,2,A.k2),2.4,K.ice));if(A.tink>.05&&!LOWFX&&c.t>2.6&&c.t<3.7){const q=P(add(q3,[0,0,-c.l*lerp(1,2,A.k2)*.8]));star4(q,3.5*A.tink,A.tink)}}
  // the four sparkles that light up with the breath
  if(A.spark>.02&&!LOWFX)MSPK.forEach((m,i)=>{const n=XU.Rd(ellN(R2,AXES,m));if(F(n)<.15)return;const q=P(XU.T(ellAt(UC,R2,AXES,m))),tw=.7+.3*Math.sin(A.wph*TAU*2+i*1.7);
    shine('90,170,255',q[0],q[1],8,.55*A.spark);star4(q,4.6*A.spark*tw,A.spark,'#8ff0ff')})}
// the outline of a cap of snow: deep blue along its edge on the fur, the thick ink where it is the outline of the body
function snowEdge(r,lw){ctx.strokeStyle='#283466';ctx.lineWidth=1.8;ctx.beginPath();for(const q of r.rim)ctx.lineTo(q[0],q[1]);if(r.full)ctx.closePath();ctx.stroke();
  if(!r.full){const n=r.rim.length;ctx.strokeStyle=INK;ctx.lineWidth=lw||2.8;ctx.beginPath();ctx.moveTo(r.rim[n-1][0],r.rim[n-1][1]);for(let i=n;i<r.pts.length;i++)ctx.lineTo(r.pts[i][0],r.pts[i][1]);ctx.lineTo(r.rim[0][0],r.rim[0][1]);ctx.stroke()}}
// a little icicle hanging from the 3D point c (length l, half width w at the top)
function icicle(V0,c,l,w,T){const a=V0.P(c),b=V0.P(add(c,[0,0,-l]));ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(a[0]-w,a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(a[0]+w,a[1]);ctx.closePath();
  ctx.fillStyle=T.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();ctx.fillStyle=T.l;ctx.beginPath();ctx.moveTo(a[0]-w*.7,a[1]+.4);ctx.lineTo(b[0]-.2,b[1]-1);ctx.lineTo(a[0]-w*.05,a[1]+.4);ctx.closePath();ctx.fill()}

// ------------------------------------------------------------------ the flag of snow that the wind tears off the top of the hump: plumes that
// widen and thin out downwind into flakes, like the banner of snow on a peak (a little blizzard of five in the second phase)
function flagDraw(V0,XU,A,J){if(LOWFX||A.flagOff>=.99)return;const{P}=V0,b0=XU.T([-12,0,UC[2]+UR[2]*(1+A.infl)+1]),W=J.W,n=A.blz>.5?5:3,side=nrm(cross(W,[0,0,1])),off=1-A.flagOff;
  for(let i=0;i<n;i++){const ph=A.wph*TAU+i*2.1,fl=Math.sin(ph)*.3+.15*Math.sin(ph*2+i)+.35*A.flap*(i%2?1:-1),L=[32,25,36,23,29][i]*(1+.12*Math.sin(ph+1))*(.5+.5*off);
    let d=nrm(add(add(W,[0,0,.2+.12*(i%3)]),mul(side,fl*.55+(i-1)*.16)));
    if(A.flagM>0)d=nrm(lerp3(d,nrm(sub(J.mouth,b0)),A.flagM));if(A.flagUp>0)d=nrm(lerp3(d,[0,0,1],A.flagUp*.75));if(A.wrev>0)d=nrm(lerp3(d,J.back,A.wrev));
    const b=add(b0,add(mul(side,(i-1)*3),[-(i%2)*2,0,0])),m=add(b,add(mul(d,L*.5),[0,0,L*.08*Math.sin(ph)])),e=add(b,add(mul(d,L),[0,0,-L*(.1+.08*fl)]));
    const qb=P(b),qm=P(m),qe=P(e),dx=qe[0]-qb[0],dy=qe[1]-qb[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,w=(A.blz>.5?4.2:5.4)*(.6+.4*off),a=(.9-.06*i)*off;
    const g=ctx.createLinearGradient(qb[0],qb[1],qe[0],qe[1]);g.addColorStop(0,`rgba(255,255,255,${a})`);g.addColorStop(.5,`rgba(240,248,255,${.62*a})`);g.addColorStop(1,'rgba(230,242,255,0)');
    // narrow at the peak, wide downwind, a round soft end
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(qb[0]+nx*1.4,qb[1]+ny*1.4);ctx.quadraticCurveTo(qm[0]+nx*w*1.1,qm[1]+ny*w*1.1,qe[0]+nx*w*.8,qe[1]+ny*w*.8);
    ctx.quadraticCurveTo(qe[0]+dx/l*w*1.2,qe[1]+dy/l*w*1.2,qe[0]-nx*w*.6,qe[1]-ny*w*.6);ctx.quadraticCurveTo(qm[0]-nx*w*.55,qm[1]-ny*w*.55,qb[0]-nx*1.4,qb[1]-ny*1.4);ctx.closePath();ctx.fill();
    // the flakes it lets go
    for(let j=0;j<2;j++){const u=((A.wph*1.5+i*.37+j*.5)%1),q=P(add(e,add(mul(d,u*14),[0,0,-u*6+(j?3:-2)])));ctx.fillStyle=`rgba(255,255,255,${(.8*(1-u)*off).toFixed(3)})`;ball(q,1.1);ctx.fill()}}}

// ------------------------------------------------------------------ legs: short and bowed under the fur, big night-blue feet with ice nails
function legGeo(X,A,sd,lift){const f=sd<0?A.fL:A.fR,fc=[f[0],f[1],f[2]+6+lift],hip=X.T([HIP[0],sd*HIP[1],HIP[2]]),ank=add(fc,[-3,0,5]),[kn]=ik(hip,ank,LTH,LSH,X.Rd([1,0,-.25]));return{hip,kn,ank,fc}}
function legDraw(V0,X,A,K,sd,g,J){const{P,F}=V0,fw=X.Rd([1,0,0]),fd=nrm([fw[0],fw[1],0]),sv=nrm(cross([0,0,1],fd)),E={u:fd,v:sv,w:[0,0,1]},fk=sstep(0,-.2,F(0,sd,0));
  const Ks=fk>0?mixT(K.skin,T3(K.skin.b,K.skin.d,K.skin.d),.3*fk):K.skin,Kf=fk>0?mixT(K.fur,T3(K.fur.b,K.fur.d,K.fur.d),.3*fk):K.fur;
  // the foot: a big night-blue pad, three ice nails in front
  const fp=ellSil(V0,g.fc,FR,E,null,14);ctx.lineJoin='round';poly(fp);ctx.fillStyle=grad3(bbox(fp),Ks);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke();
  if(F(fd)>-.35){for(const s of[-5.5,0,5.5]){const b=add(g.fc,add(mul(fd,12),add(mul(sv,s),[0,0,-2.5]))),e=add(b,add(mul(fd,5.5),[0,0,-2.5])),qa=P(b),qb=P(e);ctx.fillStyle=K.claw.b;ctx.strokeStyle=INK;ctx.lineWidth=1.3;tri(qa[0],qa[1],qb[0],qb[1],2.2);ctx.fillStyle=K.claw.l;ball([lerp(qa[0],qb[0],.3),lerp(qa[1],qb[1],.3)-.6],.7);ctx.fill()}
    ctx.strokeStyle='rgba(14,18,48,.55)';ctx.lineWidth=1.2;ctx.lineCap='round';ctx.beginPath();for(const s of[-2.8,2.8]){const a=P(add(g.fc,add(mul(fd,8),add(mul(sv,s),[0,0,4])))),b=P(add(g.fc,add(mul(fd,13),add(mul(sv,s*1.1),[0,0,1]))));ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}ctx.stroke()}
  // the shin, the ruff of tufts at the knee and at the ankle, as one furry shape
  const pb=new Path2D(),pa=new Path2D(),qk=P(g.kn),qa=P(g.ank);capsP(pb,qk,8.8,qa,7.6);const ax=nrm(sub(g.ank,g.kn)),[u,v]=frm(ax,fw),W=J.W;
  for(const[c,r,L,n] of[[g.ank,7.4,7.5,6]])for(let i=0;i<n;i++){const a=i/n*TAU+(sd>0?.3:0),rd=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),f=F(rd);if(Math.abs(f)>.75)continue;
    const s=add(c,mul(rd,r)),d=nrm(add(add(mul(rd,.55),[0,0,-1]),mul(W,.12*A.windK)));tuft(pa,P(add(s,mul(rd,-2.5))),P(add(s,mul(d,L*(1-.5*Math.abs(f))))),3.2,(i%2?1:-1))}
  union([pb,pa],grad3([qk[0]-12,qk[1]-10,qa[0]+12,qa[1]+10],Kf),2.6,1.6);
  shadeL([qk,qa],[7,6],'rgba(14,18,48,.25)',.12)}

// ------------------------------------------------------------------ arms: the shoulder under the snow, the long furry arm, the fringe under
// the forearm with its little icicles, the night-blue hand with four ice claws (blades in the second phase)
// the two bones of an arm like ik, but the elbow never snaps straight: near full reach it unbends softly (the wrist still goes where
// it must; the forearm stretches a few px at most)
function ik2(a,t,L1,L2,pole){const d=sub(t,a),dl=len(d),mx=L1+L2,s=.9*mx,m=.985*mx;if(dl<=s)return ik(a,t,L1,L2,pole);
  const de=s+(m-s)*(1-Math.exp(-(dl-s)/(m-s))),u=mul(d,1/dl),[E]=ik(a,add(a,mul(u,de)),L1,L2,pole);return[E,add(a,mul(u,Math.min(dl,mx-.02)))]}
function armGeo(sd,A,XU,lift){const S=XU.T([SHJ[0],sd*SHJ[1],SHJ[2]]),h0=sd<0?A.hL:A.hR,pc=[h0[0],h0[1],h0[2]+lift],fdh=nrm((sd<0?A.fdL:A.fdR)||[.22,sd*.06,-1]),
    wT=sub(pc,mul(fdh,7)),[El,Wr]=ik2(S,wT,LUA,LFA,XU.Rd((sd<0?A.poL:A.poR)||[-.5,sd*.8,-.1])),fa=nrm(sub(Wr,El)),fd=nrm(add(mul(fa,.4),mul(fdh,.6)));
  let pnh=(sd<0?A.pnL:A.pnR)||[.55,-sd*.85,0],pn=sub(pnh,mul(fd,dot(pnh,fd)));if(len(pn)<.2)pn=cross(fd,[0,0,1]);pn=nrm(pn);
  return{S,El,W:Wr,fa,fd,pn,Pc:add(Wr,mul(fd,7.5)),sd}}
function shoulderDraw(V0,XU,A,K,sd,J){const{P,F}=V0,c=XU.T([DLT[0],sd*DLT[1],DLT[2]]),r=DLR*(1+A.infl*.5),q=P(c),fk=sstep(0,-.25,F(XU.Rd([.15,sd,0])));
  const Kf=fk>0?mixT(K.fur,T3(K.fur.b,K.fur.d,K.fur.d),.3*fk):K.fur;
  // a round mass of fur with a few locks along its lower edge
  const pb=new Path2D(),pa=new Path2D();pb.moveTo(q[0]+r,q[1]);pb.arc(q[0],q[1],r,0,TAU);const W=J.W;
  for(let i=0;i<7;i++){const a=i/7*TAU,rd=XU.Rd(nrm([Math.cos(a)*.7,sd*.55,Math.sin(a)*.8-.35])),f=F(rd);if(Math.abs(f)>.6)continue;const s=add(c,mul(rd,r)),d=nrm(add(add(mul(rd,.6),[0,0,-.7]),mul(W,.15*A.windK)));
    tuft(pa,P(add(s,mul(rd,-2.5))),P(add(s,mul(d,8*(1-Math.abs(f)*.8)*(1+.3*A.inh)))),3.2,1)}
  union([pb,pa],grad3([q[0]-r,q[1]-r,q[0]+r,q[1]+r],Kf),2.8,1.6);
  // the snow lying on top, toward the back (thin, a wavy edge, two little icicles)
  const R2=[r+1.4,r+1.4,r+1.4],XS={T:q3=>add(c,XU.Rd(q3)),Rd:XU.Rd},sn=[-.4,sd*.28,1],sr=ellCap(V0,XS,[0,0,0],R2,AXES,sn,.74,24,{alv:.86,u:[1,0,0],ck:'sh'+sd,rf:t=>1+.12*Math.sin(5*t+sd)});
  if(sr){ctx.fillStyle=grad3(bbox(sr.pts),K.snow);ctx.fill();ctx.lineJoin='round';ctx.lineCap='round';snowEdge(sr,2.4)}
  for(const t of[2.2,3.6]){const m=capDir(sn,.74,.86,[1,0,0],t,.97*(1+.12*Math.sin(5*t+sd))),n=XU.Rd(m),f=F(n);if(f<-.15)continue;ga(cl((f+.15)*5,0,1),()=>icicle(V0,add(c,XU.Rd(mul(m,r+1.2))),lerp(4,8,A.k2),1.8,K.ice))}}
function upperArmDraw(V0,g,A,K,J){const{P,F}=V0,a=P(g.S),b=P(g.El),pb=new Path2D(),pa=new Path2D();capsP(pb,a,9.6,b,9);limbFur(pa,a,9.6,b,9,4,8.5,g.sd>0?0:3,A,J.Wsc);
  const fk=sstep(0,-.25,F(sub(g.El,J.bodyC||g.S))),Kf=fk>0?mixT(K.fur,T3(K.fur.b,K.fur.d,K.fur.d),.3*fk):K.fur;
  union([pb,pa],limbGrad(a,b,10,Kf),2.8,1.6);shadeL([a,b],[8,7.5],'rgba(14,18,48,.22)',.12);limbCurls(a,9.6,b,9,[[.42,-.3],[.7,.35]],K);rims(capsPts(a,9.6,b,9),.5,.2)}
function forearmPath(V0,g,A,J){const{P,F}=V0,a=P(g.El),b=P(g.W),pb=new Path2D(),pa=new Path2D();capsP(pb,a,10.2,b,8.4);const ax=g.fa,W=J.W;limbFur(pa,a,10.2,b,8.4,4,8,g.sd>0?2:7,A,J.Wsc);
  // the fringe: three tongues hanging from the outer back of the forearm, a little icicle at each tip
  let ob=sub(J.XU.Rd([-.45,g.sd,-.2]),mul(ax,dot(J.XU.Rd([-.45,g.sd,-.2]),ax)));ob=len(ob)<.2?cross(ax,[0,0,1]):nrm(ob);const tips=[];
  for(const[k,L] of[[.18,11],[.42,13],[.66,10]]){const s=add(lerp3(g.El,g.W,k),mul(ob,8.5)),d=nrm(add(add(mul(ob,.45),[0,0,-1]),mul(W,.18*A.windK))),e=add(s,mul(d,L*(1+.2*A.inh)*lerp(1,1.15,A.k2)));
    tuft(pa,P(add(s,mul(ob,-3))),P(e),3.6,1.2);tips.push(e)}
  // a cuff of fur at the wrist
  const[u,v]=frm(ax,[0,0,1]);for(let i=0;i<5;i++){const t=i/5*TAU+.4,rd=add(mul(u,Math.cos(t)),mul(v,Math.sin(t))),f=F(rd);if(Math.abs(f)>.7)continue;const s=add(lerp3(g.El,g.W,.88),mul(rd,8)),d=nrm(add(mul(rd,.5),mul(ax,.9)));
    tuft(pa,P(add(s,mul(rd,-2.5))),P(add(s,mul(d,6.5))),3,i%2?.8:-.8)}
  return{pb,pa,tips,a,b}}
function forearmDraw(V0,g,A,K,J){const{P,F}=V0,fp=forearmPath(V0,g,A,J),fk=sstep(0,-.25,F(XUside(J,g.sd))),Kf=fk>0?mixT(K.fur,T3(K.fur.b,K.fur.d,K.fur.d),.3*fk):K.fur;
  union([fp.pb,fp.pa],limbGrad(fp.a,fp.b,11,Kf),2.8,1.6);shadeL([fp.a,fp.b],[8.6,7],'rgba(14,18,48,.22)',.12);limbCurls(fp.a,10.2,fp.b,8.4,[[.3,-.35],[.55,.3],[.78,-.2]],K);rims(capsPts(fp.a,10.2,fp.b,8.4),.5,.2);
  for(const e of fp.tips)icicle(V0,add(e,[0,0,1.5]),lerp(3.5,7,A.k2),1.5,K.ice)}
const XUside=(J,sd)=>J.XU.Rd([0,sd,0]);
// the hand: a big night-blue mitten (light pads on the palm), four curved ice claws; grip 0 open .. 1 closed; blade 0..1 (the second phase)
function handDraw(V0,g,A,K,J){const{P,F}=V0,fd=g.fd,pn=g.pn,sv=nrm(cross(fd,pn)),Pc=g.Pc,sd=g.sd,gr=sd<0?A.gL:A.gR,bl=A.blade,E={u:fd,v:sv,w:pn};
  const ix=sd>0&&A.curlIdx>0?0:-1,lt=sd>0?A.bl1:A.bl2;const claws=[];for(let i=0;i<4;i++){const o=(i-1.5)*3.4*(1+.25*(1-gr)),b=add(Pc,add(mul(fd,7.2),add(mul(sv,o),mul(pn,1.2)))),L=lerp(11,19,bl)*(i===ix?1+.15*A.curlIdx:1),cu=i===ix?lerp(.3,1.7,A.curlIdx):lerp(lerp(.55,1.05,gr),.15,bl),
      dd=nrm(add(mul(fd,1),mul(sv,o*.04*(1-gr)))),m=add(b,add(mul(dd,L*.55),mul(pn,L*.12*cu))),e=add(b,add(mul(dd,L*(1-.25*cu)),mul(pn,L*.5*cu)));claws.push({b,m,e,o})}
  const clawDraw=()=>{const T=bl>.01?mixT(K.claw,BLADE,bl):K.claw;for(const c of claws){const qa=P(c.b),qm=P(c.m),qe=P(c.e),dx=qe[0]-qa[0],dy=qe[1]-qa[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,w=lerp(2.5,2.6,bl);
      ctx.beginPath();ctx.moveTo(qa[0]+nx*w,qa[1]+ny*w);ctx.quadraticCurveTo(qm[0]+nx*w*.8,qm[1]+ny*w*.8,qe[0],qe[1]);ctx.quadraticCurveTo(qm[0]-nx*w*.4,qm[1]-ny*w*.4,qa[0]-nx*w,qa[1]-ny*w);ctx.closePath();
      ctx.fillStyle=T.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();ctx.strokeStyle=T.l;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(qa[0]+nx*w*.3,qa[1]+ny*w*.3);ctx.quadraticCurveTo(qm[0]+nx*w*.4,qm[1]+ny*w*.4,lerp(qm[0],qe[0],.6),lerp(qm[1],qe[1],.6));ctx.stroke();
      glowTop(qe,1.6,.35)}};
  // the claws curl toward the palm: in front of the hand while the palm or the fingers face us
  const cf=F(nrm(add(fd,mul(pn,.6))))>0;if(!cf)clawDraw();
  // the mitten and its four knuckles as one shape
  const pts=ellSil(V0,Pc,[8,7.4,6],E,null,14),hpth=new Path2D(),kp=new Path2D();poly(pts);hpth.addPath(new Path2D());{let st=true;for(const q of pts){if(st){hpth.moveTo(q[0],q[1]);st=false}else hpth.lineTo(q[0],q[1])}hpth.closePath()}
  for(const c of claws){const q=P(add(c.b,mul(fd,-1.4)));kp.moveTo(q[0]+2.9,q[1]);kp.arc(q[0],q[1],2.9,0,TAU)}
  union([hpth,kp],grad3(bbox(pts),K.skin),2.4,1.4);
  {const f=F(pn);if(f>.15){ctx.save();ctx.globalAlpha*=cl((f-.15)*4,0,1);ctx.fillStyle=K.pad;for(const[a,b,r] of[[-1.5,0,3.2],[3.6,-3,1.7],[3.6,0,1.7],[3.6,3,1.7]]){const q=P(add(Pc,add(mul(fd,a),add(mul(sv,b),mul(pn,5.6)))));ctx.beginPath();ctx.ellipse(q[0],q[1],r,r*.8,0,0,TAU);ctx.fill()}ctx.restore()}}
  rims(pts,.35,0);
  if(cf)clawDraw();
  // the light of the blades of the second phase; the light that runs along them from the knuckles to the tips before a slash
  if(bl>.3&&!LOWFX)for(const c of claws){const q=P(c.e);shine(BLADERGB,q[0],q[1],6,.35*bl)}
  if(lt>.01){ctx.save();ctx.lineCap='round';for(const c of claws){const qa=P(c.b),qe=P(c.e),u=Math.min(1,lt*1.15),q=[lerp(qa[0],qe[0],u),lerp(qa[1],qe[1],u)];
    ctx.strokeStyle='#ffffff';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(qa[0],qa[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();if(!LOWFX)shine(BLADERGB,q[0],q[1],7,.6);star4(q,2.6,1)}ctx.restore()}}

// ------------------------------------------------------------------ the head
function headDraw(V0,Hc,HR,A,K,J,oc){
  const{P,F}=V0,T=q=>add(Hc,HR(q)),fwd=F(HR([1,0,0])),h=P(Hc),ja=A.jaw,jr=ja*.62,
  rj=q=>{const r=add(JHG,rotY(sub(q,JHG),jr));r[2]-=2.2*ja;return r},W=J.W;
  const at=m=>({q:P(T(ellAt([0,0,0],HRD,null,m))),v:F(HR(ellN(HRD,null,m)))});
  const LH=[];const add2=(d,f)=>LH.push({d,f});
  // the mane: two shaggy shapes, the tufts whose root faces us over the skull, the others behind it
  const mane=[new Path2D(),new Path2D()],op=.6*A.inh+A.fluff;
  for(const sd of[-1,1])for(const t of MANE){const m=[t.d[0],sd*t.d[1],t.d[2]],n=HR(ellN(HRD,null,m)),f=F(n),s=T(ellAt([0,0,0],HRD,null,m)),
      d=nrm(add(add(mul(n,1-t.h+op*.6),[0,0,-t.h]),mul(W,.18*A.windK*(LOWFX?0:1+.4*Math.sin(A.wph*TAU+sd+t.L)))));
    tuft(mane[f>0?1:0],P(add(s,mul(n,-2.5))),P(add(s,mul(d,t.L*(1+.35*op)))),t.w,sd*1.2)}
  const mg=grad3([h[0]-26,h[1]-24,h[0]+26,h[1]+30],K.mane);
  add2(-2,()=>union([mane[0]],mg,2.2));
  // the skull, the snow between the horns, the night-blue mask
  // (cut where it goes into the chest, without a line: the fur of the chest shows there)
  const cp=oc?capPts(V0,h,17.6,mul(oc.n,-1),Math.PI-oc.al):null;
  add2(0,()=>{if(cp){ctx.save();ctx.beginPath();ctx.rect(-1e4,-1e4,2e4,2e4);ctx.moveTo(cp.pts[0][0],cp.pts[0][1]);for(const w of cp.pts)ctx.lineTo(w[0],w[1]);ctx.closePath();ctx.clip('evenodd')}
    const sk=ellSil(V0,[0,0,0],HRD,null,T,16);ctx.lineJoin='round';poly(sk);ctx.fillStyle=grad3(bbox(sk),K.fur);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.8;ctx.stroke();
    const R2=add(HRD,[1.6,1.6,1.6]),sr=ellCap(V0,{T,Rd:HR},[0,0,0],R2,AXES,HSN,.62,26,{alv:.82,u:[1,0,0],ck:'hs',rf:rfH});
    if(sr){ctx.fillStyle=grad3(bbox(sr.pts),K.snow);ctx.fill();ctx.lineJoin='round';ctx.lineCap='round';snowEdge(sr,2.4)}
    const mk=ellCap(V0,{T,Rd:HR},[0,0,0],add(HRD,[.2,.2,.2]),AXES,MSK,.92,30,{alv:1.02,u:[0,0,1],ck:'mk',rf:rfK});
    if(mk){ctx.fillStyle=grad3(bbox(mk.pts),K.skin);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke()}
    rims(sk,.45,.25);if(cp)ctx.restore()});
  // the eyes: almond, icy blue, a light centre and a point of light, a soft glow that breathes; the far one slides in and narrows
  add2(1,()=>eyesDraw(V0,T,HR,A,K,h,at,J));
  // the brows of frost (each over the skull while it faces us; never over the eyes)
  for(const sd of[-1,1]){const fb=F(HR(nrm([.85,sd*.45,.5])));add2(fb>0?1.5:-1,()=>browDraw(V0,T,HR,A,K,sd,J))}
  // the muzzle: the jaw, the mouth, the snout with the nose, the two little fangs; sunk into the skull
  add2(fwd>-.25?2:-1.5,()=>muzzleDraw(V0,T,HR,A,K,rj,fwd));
  add2(2.5,()=>union([mane[1]],mg,2.2));
  // the beard under the chin (behind the head when it looks away)
  add2(fwd>-.3?1.8:-4,()=>beardDraw(V0,T,HR,A,K,rj,J));
  if(A.tongue>.05)add2(4.5,()=>tongueDraw(V0,T,HR,A,K,rj,fwd));
  // the roots of the horns, out of the top of the skull: over all of the head while where they come out faces us, else behind it
  // (as they turn away the part of them past a line that sweeps from the base to the tip goes behind the head, the rest stays over it,
  // so a root never jumps from over the head to under it)
  for(const r of J.roots||[]){const f=()=>hornDraw(V0,J.hornT,HR,A,K,r.sd,0,2),k=sstep(.12,-.12,r.f);if(k<=.001){add2(9,f);continue}if(k>=.999){add2(-9,f);continue}
    const b=P(T([HORN[0][0],r.sd*HORN[0][1],HORN[0][2]])),e=P(T([HORN[2][0],r.sd*HORN[2][1],HORN[2][2]])),ux=e[0]-b[0],uy=e[1]-b[1],ul=Math.hypot(ux,uy)||1,u=[ux/ul,uy/ul],v=[-u[1],u[0]],
      ext=ul+10,sw=lerp(-10,ext,k),m=[b[0]+u[0]*sw,b[1]+u[1]*sw],half=back=>{const kk=back?-1e4:1e4,o=back?.6:-.6,c=[m[0]+u[0]*o,m[1]+u[1]*o],pa=new Path2D();pa.moveTo(c[0]+v[0]*1e4,c[1]+v[1]*1e4);
        pa.lineTo(c[0]-v[0]*1e4,c[1]-v[1]*1e4);pa.lineTo(c[0]-v[0]*1e4+u[0]*kk,c[1]-v[1]*1e4+u[1]*kk);pa.lineTo(c[0]+v[0]*1e4+u[0]*kk,c[1]+v[1]*1e4+u[1]*kk);pa.closePath();return pa};
    add2(-9,()=>{ctx.save();ctx.clip(half(true));f();ctx.restore()});add2(9,()=>{ctx.save();ctx.clip(half(false));f();ctx.restore()})}
  LH.sort((a,b)=>a.d-b.d);for(const e of LH)e.f()}
// a horn, or a piece of it (segments i0..i1-1: the root out of the skull, the spiral round the ear), all its pieces in the same light
function hornDraw(V0,T,HR,A,K,sd,i0,i1){const{P,F}=V0,pts=HORN.map(q=>T([q[0],sd*q[1],q[2]])),S=pts.map(P),n=S.length;i0=i0||0;i1=i1==null?n-1:i1;
  // the outline round the piece, then the fill, the rings, the frost on its top edge
  ctx.lineCap='round';ctx.lineJoin='round';ctx.fillStyle=INK;for(let i=i0;i<i1;i++){C.hull(S[i],HORNR[i]+1.4,S[i+1],HORNR[i+1]+1.4);ctx.fill()}
  const bb=bbox(S);bb[0]-=6;bb[1]-=6;bb[2]+=6;bb[3]+=6;ctx.fillStyle=grad3(bb,K.horn);for(let i=i0;i<i1;i++){C.hull(S[i],HORNR[i]-1.2,S[i+1],HORNR[i+1]-1.2);ctx.fill()}
  shadeL(S.slice(i0,i1+1),HORNR.slice(i0,i1+1).map(r=>r-1),'rgba(20,18,40,.3)',.14);
  // the rings in relief across the horn: one path for the dark grooves, one for the light ridges (one where two pieces meet)
  {const gr=new Path2D(),rd=new Path2D();for(const[i,k] of[[0,.55],[1,.3],[1,1],[2,.45],[3,.3],[3,.85]]){if(i<i0||i>=i1)continue;const a=lerp3(pts[i],pts[i+1],k),ax=nrm(sub(pts[i+1],pts[i])),[u,v]=frm(ax,[0,0,1]),r=lerp(HORNR[i],HORNR[i+1],k)-1.1;
      const e=sub(V0.P(add(a,u)),V0.P(a)),side=Math.abs(e[0])+Math.abs(e[1])>.4?u:v,q0=P(add(a,mul(side,r))),q1=P(add(a,mul(side,-r))),qc=P(add(a,mul(ax,1.6))),qd=P(add(a,mul(ax,-1.2)));
      gr.moveTo(q0[0],q0[1]);gr.quadraticCurveTo(qc[0],qc[1],q1[0],q1[1]);rd.moveTo(q0[0],q0[1]);rd.quadraticCurveTo(qd[0],qd[1],q1[0],q1[1])}
    ctx.lineCap='round';ctx.strokeStyle=K.ring;ctx.lineWidth=1.5;ctx.stroke(gr);ctx.strokeStyle='rgba(200,206,235,.45)';ctx.lineWidth=1;ctx.stroke(rd)}
  // the frost along the top edge
  if(i0<3){ctx.strokeStyle=K.frost;ctx.lineWidth=1.5;ctx.beginPath();for(let i=i0;i<=Math.min(3,i1);i++){const q=P(add(pts[i],[0,0,HORNR[i]*.75]));if(i>i0)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1])}ctx.stroke()}
  if(i1===n-1)glowTop(S[n-1],2,.4);
  // the crystals of the second phase, growing along the spiral from the root to the tip
  if(A.crys>0)crystals(V0,T,A,sd,pts,i0,i1)}
function crystals(V0,T,A,sd,pts,i0,i1){const{P,F}=V0;for(let j=0;j<HCRY.length;j++){const[i,k,s]=HCRY[j],g=cl((A.crys-j/HCRY.length*.75)/.25,0,1);if(g<=0||i<i0||i>=i1)continue;
  const a=lerp3(pts[i],pts[i+1],k),ax=nrm(sub(pts[i+1],pts[i])),out=nrm(sub(a,T([0,0,0]))),d=nrm(add(mul(out,1),mul(ax,.25))),L=(9+8*s)*ez(g),w=3.2*s*ez(g),[u,v]=frm(d,ax),b=add(a,mul(d,lerp(HORNR[i],HORNR[i+1],k)*.6));
  const tip=add(b,mul(d,L)),FS=[];for(let q=0;q<4;q++){const t0=q/4*TAU+.4,t1=(q+1)/4*TAU+.4,c0=add(b,add(mul(u,Math.cos(t0)*w),mul(v,Math.sin(t0)*w))),c1=add(b,add(mul(u,Math.cos(t1)*w),mul(v,Math.sin(t1)*w)));FS.push([c0,c1,tip])}
  facets(V0,FS,CRY,{lw:1.4});if(!LOWFX){const q=P(add(b,mul(d,L*.55)));shine(CRYRGB,q[0],q[1],5+3*s,.3*g*(A.cpulse!=null?.7+.6*A.cpulse:1))}}}
function eyesDraw(V0,T,HR,A,K0,h,at,J){let K=K0;const{P}=V0,inh=A.inh,big=1+.15*inh,rx0=4.6*big,ry0=3.5*big,E=[-1,1].map(sd=>{const r=at([EYED[0],sd*EYED[1],EYED[2]]);return{sd,v:r.v,q:r.q,rx:rx0*Math.pow(Math.max(0,r.v),.7)}}).filter(e=>e.v>.08).sort((a,b)=>b.v-a.v);
  if(E.length)E[0].q=inward(h,16,E[0].q,.62,.78);if(E.length>1){const n=E[0],f=E[1];f.q=inward(h,16,f.q,.52,.7);const gap=Math.hypot(f.q[0]-n.q[0],f.q[1]-n.q[1])-n.rx-1;f.rx=Math.min(f.rx,Math.max(0,gap))}
  // (taking a breath the eyes open wide and light up: the squint gives way)
  J.eyes=E;if(J.KE)K=J.KE;const sq=A.blink*(1-.45*A.squint*(1-.65*inh)),on=A.eyeOn,dim=A.dim;
  for(const e of E){if(e.rx<.6)continue;const ry=ry0*Math.max(.1,sq),q=e.q,rx=e.rx;
    // spent (out of breath): dark half moons under heavy lids, plain to see
    if(dim>.5){ctx.save();ctx.globalAlpha*=on;const hr=ry0*.62;ctx.beginPath();ctx.moveTo(q[0]-rx,q[1]-hr*.2);ctx.quadraticCurveTo(q[0],q[1]+hr*1.9,q[0]+rx,q[1]-hr*.2);ctx.closePath();
      ctx.fillStyle=cmix('#4f8fae','#2d5f80',(dim-.5)*1.2);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke();ctx.beginPath();ctx.moveTo(q[0]-rx*1.08,q[1]-hr*.35);ctx.quadraticCurveTo(q[0],q[1]-hr*.75,q[0]+rx*1.08,q[1]-hr*.35);ctx.lineWidth=1.8;ctx.stroke();ctx.restore();continue}
    // almond: the outer corner a little higher (a stern look); when it smiles the lower lid rises
    const pa=new Path2D();pa.moveTo(q[0]-rx,q[1]+ry*.15);pa.quadraticCurveTo(q[0]-rx*.1,q[1]-ry*1.5,q[0]+rx,q[1]-ry*.25);pa.quadraticCurveTo(q[0]+rx*.1,q[1]+ry*(1.2-2.25*A.smile),q[0]-rx,q[1]+ry*.15);pa.closePath();
    if(sq<.2){ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(q[0]-rx,q[1]);ctx.quadraticCurveTo(q[0],q[1]+ry0*.5,q[0]+rx,q[1]-ry0*.2);ctx.stroke();continue}
    // flat light round it on slow phones while it breathes in (no glow there)
    if(LOWFX&&inh>.05&&dim<.5){ctx.fillStyle=`rgba(140,230,255,${(.35*inh*on).toFixed(3)})`;ctx.beginPath();ctx.ellipse(q[0],q[1],rx*1.7,ry*1.9+1,0,0,TAU);ctx.fill();
      ctx.strokeStyle=`rgba(200,248,255,${(.8*inh*on).toFixed(3)})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(q[0],q[1],rx+1.6,ry+1.6,0,0,TAU);ctx.stroke()}
    const ir0=dim>0?cmix(K.iris,'#4f8fae',dim):K.iris,iris=inh>.02?cmix(ir0,'#e8fdff',.6*inh):ir0,core=dim>0?cmix(K.core,'#6fa6c2',dim):inh>.02?cmix(K.core,'#ffffff',inh):K.core;
    const g=ctx.createRadialGradient(q[0]-rx*.1,q[1]-ry*.1,.3,q[0],q[1],rx*1.1);g.addColorStop(0,core);g.addColorStop(.55,iris);g.addColorStop(1,cmix(iris,'#2d6f9a',.35));
    ctx.save();ctx.globalAlpha*=on;ctx.fillStyle=g;ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=1.4+.9*A.smile;ctx.stroke(pa);if(A.smile>.3){ctx.strokeStyle=K.iris;ctx.lineWidth=1.1*A.smile;ctx.stroke(pa)}
    // a pale line under the eye, the point of light
    if(A.smile<.5){ctx.strokeStyle='rgba(200,240,255,.55)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(q[0]-rx*.65,q[1]+ry*1.05+.9);ctx.quadraticCurveTo(q[0],q[1]+ry*1.3+1.1,q[0]+rx*.7,q[1]+ry*.7+.9);ctx.stroke()}
    if(dim<.6&&sq>.45&&A.smile<.5){ctx.fillStyle='#ffffff';ball([q[0]-rx*.3,q[1]-ry*.36],Math.min(1.3,.45+rx*.18));ctx.fill()}ctx.restore()}
  // the glow, over everything of the face (it breathes)
  if(!LOWFX&&dim<.95)for(const e of E){if(e.rx<.6||sq<.25)continue;if(A.smile>.3){shine(K.eye,e.q[0],e.q[1]-1,7,.35*on);continue}shine(K.eye,e.q[0],e.q[1],9*(1+.6*inh),(.42+.25*inh)*on*(1-dim)*Math.min(1,e.v*2))}}
function browDraw(V0,T,HR,A,K,sd,J){const{P}=V0,dn=1.8*A.squint,on=-(1.5*A.inh),
    pts=[[13.8,sd*2.6,6.6-dn+on*.2],[13.6,sd*6.2,8.6-dn*.6+on*.4],[11.8,sd*10,9.4-dn*.2+on*.6],[9.4,sd*13.2,7.4+on],[8.4,sd*14.6,3.8+on*.5]].map(q=>P(T(q)));
  // the brow as a thick crescent: its lower edge follows the eye, its upper edge bulges; it droops to a point at the outer end
  const up=[],lo=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;let nx=dy/l,ny=-dx/l;if(ny>0){nx=-nx;ny=-ny}
    const w=[1.4,2.3,2.4,1.8,.2][i];up.push([pts[i][0]+nx*w,pts[i][1]+ny*w]);lo.push([pts[i][0]-nx*w*.55,pts[i][1]-ny*w*.55])}
  const pa=new Path2D();pa.moveTo(up[0][0],up[0][1]);for(let i=1;i<up.length;i++)pa.quadraticCurveTo(up[i-1][0]*.25+up[i][0]*.75,up[i-1][1]*.25+up[i][1]*.75,up[i][0],up[i][1]);
  for(let i=lo.length-1;i>=0;i--)pa.lineTo(lo[i][0],lo[i][1]);pa.closePath();
  // never over the eyes
  let cut=false;if(J.eyes){for(const ey of J.eyes){if(ey.rx<.6)continue;if(!cut){ctx.save();ctx.beginPath();ctx.rect(-1e4,-1e4,2e4,2e4);cut=true}ctx.moveTo(ey.q[0]+ey.rx+.6,ey.q[1]);ctx.ellipse(ey.q[0],ey.q[1],ey.rx+.6,3.4,0,0,TAU)}if(cut)ctx.clip('evenodd')}
  ctx.lineJoin='round';ctx.fillStyle=grad3(bbox(up.concat(lo)),K.mane);ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke(pa);
  if(cut)ctx.restore()}
function muzzleDraw(V0,T,HR,A,K,rj,fwd){const{P,F}=V0,ja=A.jaw,jr=ja*.62,Hc=T([0,0,0]);
  const XJ={T:q=>T(rj(q)),Rd:v=>HR(rotY(v,jr))},XH={T,Rd:HR};
  const muz=()=>{const pts=ellSil(V0,MUZ,MUR,null,T,16);ctx.lineJoin='round';poly(pts);ctx.fillStyle=grad3(bbox(pts),K.skin);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.stroke();rims(pts,.4,0);
    // the nose: wide and flat, two nostrils, a point of light
    const nm=nrm([.78,0,.5]),nn=HR(ellN(MUR,null,nm)),fn=F(nn);if(fn>.05){const c=T(ellAt(MUZ,MUR,null,nm)),[u,v]=frm(nn,HR([0,0,1])),q=P(c);ctx.save();ctx.globalAlpha*=cl((fn-.05)*4,0,1);
      const pn=[[-4.4,-.4],[0,-2.2],[4.4,-.4],[2,2],[-2,2]].map(([a,b])=>P(add(c,add(mul(v,a),mul(u,b)))));ctx.beginPath();ctx.moveTo(pn[0][0],pn[0][1]);ctx.quadraticCurveTo(pn[1][0],pn[1][1],pn[2][0],pn[2][1]);ctx.quadraticCurveTo(pn[3][0]+1,pn[3][1]+1,(pn[3][0]+pn[4][0])/2,(pn[3][1]+pn[4][1])/2);ctx.quadraticCurveTo(pn[4][0]-1,pn[4][1]+1,pn[0][0],pn[0][1]);ctx.closePath();
      ctx.fillStyle=K.nose;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();ctx.fillStyle=K.noseL;ball(P(add(c,add(mul(v,-1.6),mul(u,-.9)))),.9);ctx.fill();ctx.restore()}};
  const jaw=()=>{const pts=ellSil(V0,JAWC,JAWR,null,XJ.T,14);ctx.lineJoin='round';poly(pts);ctx.fillStyle=grad3(bbox(pts),K.skin);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke()};
  // the mouth: wide and straight, closed a dark line; open a dark violet oval between the lips (at least as tall as the jaw opens, so it reads
  // from above too), the throat that lights up in its middle, the tongue at the bottom
  const hole=()=>{if(fwd<-.12)return;const up=[];for(let i=0;i<=6;i++){const t=-1+i/3;up.push(P(T(ellAt(MUZ,MUR,null,nrm([.8,t*.62,-.56])))))}
    ctx.save();ctx.globalAlpha*=cl((fwd+.12)*4,0,1);ctx.lineCap='round';ctx.lineJoin='round';
    if(ja<.06){ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.beginPath();for(const q of up)ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.restore();return}
    const qj=P(T(rj(ellAt(JAWC,JAWR,null,nrm([.86,0,.42]))))),w=Math.hypot(up[6][0]-up[0][0],up[6][1]-up[0][1])/2,a0=Math.atan2(up[6][1]-up[0][1],up[6][0]-up[0][0]),
      top=up[3],hh=Math.max(qj[1]-top[1],2+9*ja)*.5,c=[top[0],top[1]+hh*.92],rx=w*(.62+.25*ja),ry=hh;
    ctx.beginPath();ctx.ellipse(c[0],c[1],rx,ry,a0,0,TAU);ctx.fillStyle=K.mouth;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();ctx.clip();
    if(A.throat>.3&&LOWFX){ctx.fillStyle=K.thr;ctx.beginPath();ctx.ellipse(c[0],c[1]-ry*.1,rx*.8,ry*.75,a0,0,TAU);ctx.fill()}
    else if(A.throat>.02){const r=Math.min(rx,ry)*1.1,g=ctx.createRadialGradient(c[0],c[1]-ry*.15,.3,c[0],c[1]-ry*.15,r);g.addColorStop(0,`rgba(${K.thrC==='#ffffff'?'255,255,255':'234,252,255'},${.95*A.throat})`);g.addColorStop(.4,`rgba(159,233,255,${.6*A.throat})`);g.addColorStop(1,'rgba(120,200,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(c[0],c[1]-ry*.15,r,0,TAU);ctx.fill()}
    ctx.fillStyle=K.tongue;ctx.beginPath();ctx.ellipse(c[0],c[1]+ry*.75,rx*.6,ry*.42,a0,0,TAU);ctx.fill();ctx.restore();
    if(A.throat>.3&&!LOWFX)shine(K.eye,c[0],c[1],10,.5*A.throat)};
  const fangs=()=>{if(fwd<-.1)return;ctx.save();ctx.globalAlpha*=cl((fwd+.1)*4,0,1);for(const sd of[-1,1]){const b=T(rj([16.8,sd*(6.4+1.2*ja),-11.8])),e=T(rj([17.4,sd*(7.2+1.4*ja),-7.4+2.4*ja])),qa=P(b),qb=P(e);ctx.fillStyle=K.tusk.b;ctx.strokeStyle=INK;ctx.lineWidth=1.1;tri(qa[0],qa[1],qb[0],qb[1],1.5);
    ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=.6;seg([qa[0]-.5,qa[1]-.3],[lerp(qa[0],qb[0],.6)-.3,lerp(qa[1],qb[1],.6)]);ctx.stroke()}ctx.restore()};
  const all=()=>{jaw();muz();hole();fangs()};
  // sunk into the skull: cut where it goes in (no swap with the skull as the head turns)
  const oc=outCap(XH,[0,0,0],HRD,AXES,MUZ,10.5,1),q=P(T(MUZ));if(fwd>-.25)sunkDraw(V0,q,12,oc,all);else all()}
function tongueDraw(V0,T,HR,A,K,rj,fwd){const{P}=V0;
  if(A.tongue<.05||fwd<-.1)return;const a=P(T(rj([16,0,-12.5]))),b=P(T(rj([19+2*A.tongue,0,-15-6*A.tongue]))),w=3.2;ctx.save();ctx.globalAlpha*=cl((fwd+.1)*4,0,1);
    ctx.beginPath();ctx.moveTo(a[0]-w,a[1]);ctx.quadraticCurveTo(b[0]-w*1.2,b[1]-1,b[0],b[1]+1.5);ctx.quadraticCurveTo(b[0]+w*1.2,b[1]-1,a[0]+w,a[1]);ctx.closePath();ctx.fillStyle=K.tongue;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
    ctx.strokeStyle='rgba(40,20,50,.6)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(a[0],a[1]+1);ctx.lineTo(lerp(a[0],b[0],.7),lerp(a[1],b[1],.7));ctx.stroke();ctx.restore()}
function beardDraw(V0,T,HR,A,K,rj,J){const{P}=V0,pa=new Path2D(),W=J.W,tips=[],sw=LOWFX?0:.25*A.windK*Math.sin(A.wph*TAU+.8);
  for(const[b,e,w] of BEARD){const bb=T(rj(b)),ee0=T(rj(e)),d=sub(ee0,bb),ee=add(add(bb,d),add(mul(W,sw*len(d)*.5),[0,0,0]));tuft(pa,P(bb),P(ee),w,b[1]?b[1]*.15:.6);tips.push({e:ee,mid:!b[1]})}
  union([pa],grad3(bbox(tips.map(t=>P(t.e)).concat([P(T(rj([11,0,-15])))])),K.mane),2);
  // the icicle at the tip of the middle tongue (longer in the second phase; three in it)
  for(const t of tips){if(!t.mid&&A.k2<.3)continue;icicle(V0,add(t.e,[0,0,2]),(t.mid?6:4)*lerp(1,2,A.k2),t.mid?2:1.5,K.ice)}}

// ------------------------------------------------------------------ snowballs, ice: the pieces it makes and throws (the game uses them too)
// Rodrigues: v turned round the unit axis ax by a
function rotAx(v,ax,a){const c=Math.cos(a),s=Math.sin(a);return add(add(mul(v,c),mul(cross(ax,v),s)),mul(ax,dot(ax,v)*(1-c)))}
const BLUMP=[[.6,.3,.74],[-.5,.62,.6],[.2,-.8,.56],[-.7,-.35,.6],[.1,.2,-.97]].map(nrm),BSEAM=nrm([.25,1,.15]);
// a ball of snow (centre c, radius r) rolled by spin round the axis across dv (the way it rolls): lumps and a seam that turn with it
function ballDraw(V0,c,r,spin,dv,p2){const{P,F}=V0,q=P(c);if(r<.8)return;const ax=nrm(cross(nrm([dv[0],dv[1],0]),[0,0,1])),rt=v=>rotAx(v,len(ax)>.1?ax:[0,1,0],spin);
  ctx.lineJoin='round';ball(q,r);const g=ctx.createRadialGradient(q[0]-r*.42,q[1]-r*.46,r*.06,q[0]-r*.12,q[1]-r*.08,r*1.18);
  g.addColorStop(0,'#ffffff');g.addColorStop(.42,p2?'#dff4ff':'#eef4fb');g.addColorStop(.8,p2?'#8fc4ea':'#a6bcdc');g.addColorStop(1,p2?'#6a9fd0':'#8aa2c8');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=r>10?2.6:2;ctx.stroke();
  ctx.save();ball(q,r-1);ctx.clip();
  // the seam (a band of packed snow) and the lumps
  {const n=rt(BSEAM);let u=cross(n,[0,0,1]);if(len(u)<.2)u=[1,0,0];u=nrm(u);const w=cross(n,u),S=[];for(let i=0;i<=24;i++){const t=i/24*TAU,m=add(mul(u,Math.cos(t)),mul(w,Math.sin(t)));S.push(F(m)>0?P(add(c,mul(m,r*.98))):null)}
    ctx.strokeStyle=p2?'rgba(90,150,210,.55)':'rgba(120,145,190,.5)';ctx.lineWidth=Math.max(1,r*.12);ctx.lineCap='round';ctx.beginPath();let on=false;for(const s2 of S){if(!s2){on=false;continue}if(on)ctx.lineTo(s2[0],s2[1]);else{ctx.moveTo(s2[0],s2[1]);on=true}}ctx.stroke()}
  for(let i=0;i<BLUMP.length;i++){const m=rt(BLUMP[i]),f=F(m);if(f<.15)continue;const s2=P(add(c,mul(m,r*.86))),rr=r*(.2+.04*i)*Math.min(1,f*2);ctx.fillStyle=i%2?'rgba(255,255,255,.85)':(p2?'rgba(110,170,225,.45)':'rgba(140,165,205,.45)');ctx.beginPath();ctx.ellipse(s2[0],s2[1],rr,rr*.8,0,0,TAU);ctx.fill()}
  if(p2){ctx.fillStyle='#ffffff';for(const[a,b] of[[-.35,-.4],[.25,-.15],[-.1,.3]]){star4([q[0]+a*r,q[1]+b*r],r*.18,.9)}}
  ctx.restore();rims([[q[0]-r,q[1]],[q[0],q[1]-r],[q[0]+r,q[1]],[q[0],q[1]+r]],.5,.2)}
// an icicle falling with its tip down (tip at c): long L, w its radius at the top, three faces (each in its tone), a white streak, the tip lit;
// o.big: the giant stalactite (ridges across it, a cap of snow on top)
function icicleBig(V0,c,L,w,T,o){o=o||{};const{P}=V0,tip=add(c,[0,0,0]),cs=[0,1,2].map(i=>{const a=Math.PI/2+.5+i*TAU/3;return add(c,[Math.cos(a)*w,Math.sin(a)*w,L])});
  const FS=[[cs[0],cs[1],tip],[cs[1],cs[2],tip],[cs[2],cs[0],tip],[cs[0],cs[1],cs[2]]],H=facets(V0,FS,T,{lw:o.big?2.6:1.9,seamCol:'rgba(255,255,255,.5)'});if(!H)return;
  const qt=P(tip),qa=P(lerp3(cs[0],cs[1],.35)),qb=P(lerp3(cs[1],cs[2],.65));
  if(o.big){ctx.save();poly(H);ctx.clip();ctx.strokeStyle='rgba(40,90,150,.5)';ctx.lineWidth=1.3;for(const k of[.32,.55,.76]){const l=P(lerp3(tip,cs[1],k)),r=P(lerp3(tip,cs[2],k)),m=P(lerp3(tip,lerp3(cs[1],cs[2],.5),k));
      ctx.beginPath();ctx.moveTo(l[0],l[1]);ctx.quadraticCurveTo(m[0],m[1]+2.5,r[0],r[1]);ctx.stroke()}ctx.restore()}
  ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=o.big?2.2:1.3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(qa[0],qa[1]+2);ctx.lineTo(lerp(qa[0],qt[0],.78),lerp(qa[1],qt[1],.78));ctx.stroke();
  if(o.big){// the cap of snow: a lumpy crown hanging over the top edge
    const pts=[];for(let i=0;i<12;i++){const a=i/12*TAU,r=w*1.22*(1+.08*Math.sin(i*2.6));pts.push(P(add(c,[Math.cos(a)*r,Math.sin(a)*r,L+(i%2?1:3)-(Math.sin(a)>0?2:0)])))}
    const top=P(add(c,[0,0,L+7]));pts.push(top);const Hs=chull(pts);ctx.lineJoin='round';const pa=smoothP(Hs);ctx.fillStyle=grad3(bbox(Hs),K1.snow);ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke(pa);
    ctx.fillStyle='#ffffff';ball([top[0]-w*.4,top[1]+2],1.6);ctx.fill()}
  if(!LOWFX)shine('200,240,255',qt[0],qt[1]-2,o.big?11:7,.5);ctx.fillStyle='#ffffff';ball([qt[0],qt[1]-(o.big?3:1.8)],o.big?1.7:1.1);ctx.fill();glowTop(qb,o.big?5:2.5,.25)}
// the pieces of ice that splash on the floor (k 0..1)
function splash(V0,c,k,n,sz,T){const{P}=V0;for(let i=0;i<n;i++){const a=i/n*TAU+.3+(i%2)*.4,v=(16+8*(i%3))*sz,z=Math.max(0,(14+6*(i%2))*sz*k-34*sz*k*k)+1,q=P(add(c,[Math.cos(a)*v*k,Math.sin(a)*v*k,z]));
    ctx.save();ctx.globalAlpha*=1-sstep(.7,1,k);ctx.translate(q[0],q[1]);ctx.rotate(a+k*5);ctx.fillStyle=i%2?T.l:T.b;ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(0,-2.6*sz);ctx.lineTo(1.8*sz,1.4*sz);ctx.lineTo(-1.8*sz,1.2*sz);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
  const q=P(c);cloud([q[0],q[1]-3*sz-4*k*sz],(4+6*k)*sz,.55*(1-k),'235,246,255')}
// a big faceted piece of ice (the defeat): centre c, size s, turned by the angle a round the axis ax
function iceChunk(V0,c,s,a,ax,T){const F0=[[1,0,.2],[-.6,.8,.1],[-.5,-.8,0],[0,0,1],[.2,.1,-1]],V=[[1.1,.1,.2],[-.6,.9,.3],[-.7,-.8,.2],[.1,-.2,1.2],[.2,.3,-.9],[.5,.7,-.2],[.4,-.7,.6]].map(v=>add(c,mul(rotAx(v,ax,a),s)));
  const FS=[[0,5,1,3],[1,2,3],[2,6,0,3],[0,6,4,5],[1,5,4,2],[2,4,6]].map(f=>f.map(i=>V[i]));facets(V0,FS,T,{lw:2,seamCol:'rgba(255,255,255,.55)'})}

// ------------------------------------------------------------------ the entrance: the mound of snow it comes out of
const MCH=[[-.4,-1,0,.95],[.7,.2,.2,1],[2.1,.9,.1,.9],[3.3,.6,.3,.85],[4.4,.3,.1,1.05],[5.5,.8,.2,.9]];   // the clods: [angle, roll, tilt, size]
function domeDraw(V0,c,rx,rz,T,o){o=o||{};const{P}=V0,pts=[],dx=(o.dx||rx)/rx;for(const k of[0,.35,.65,.85,1]){const z=k*rz,r=rx*Math.sqrt(Math.max(0,1-k*k));for(let i=0;i<16;i++){const a=i/16*TAU;pts.push(P(add(c,[Math.cos(a)*r*dx,Math.sin(a)*r,z])))}}
  const H=chull(pts);if(H.length<3)return H;ctx.lineJoin='round';const pa=smoothP(H);ctx.fillStyle=grad3(bbox(H),T);ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2.6;ctx.stroke(pa);rims(H,.6,.25);
  if(o.dots){ctx.fillStyle=K1.dots;for(const[a,b] of[[-.4,-.5],[.3,-.35],[.1,-.65],[-.2,-.2],[.45,-.6]]){const q=P(add(c,[0,0,0]));ball([q[0]+a*rx,q[1]+b*rz*.9],1.3);ctx.fill()}}return H}
// the mound of the entrance: centred under his chest and head; it heaves (wider, a little taller) as he pushes up
const MC=[4,0,0],moundR=A=>{const h=A.heave||0;return[40+12*h,40+16*h,42+6*h]};
// part 'back': the inside of the crater behind him (before his body); 'front': the avalanche sliding in, then the mound in front of him (its
// part under the rim of the crater, the broken lip, the cracks while it heaves, the eyes that open in the snow, the tips of the horns)
function moundDraw(V0,A,p,J,fx,part){const{P,D}=V0,k=A.mound;if(k<0)return;
  // the front of the avalanche sliding in from behind (a wall of snow with balls rolling in it), then the mound
  if(k<1){if(part==='back')return;const u=ez(k),c=[MC[0]-100*(1-u),0,0],w=lerp(35,40,u),dx=lerp(22,40,u),h=lerp(30,42,u),T=K1.snow,sp=fx?rise(k,0,.06,.55,.95):0,back=V0.F([-1,0,.3])>0,pw=[];
    // the powder thrown up behind the moving wall (in front of it when we look from behind)
    for(let i=0;i<4&&sp>0;i++){const q=P(add(c,[-dx*(.4+.25*i),(i%2?1:-1)*(5+6*i),h*(.82+.1*Math.sin(i*1.9+k*11))+i*3]));pw.push(()=>cloud(q,8+3*i,(.42-.07*i)*sp,'232,242,255'))}
    if(!back)for(const f of pw)f();
    domeDraw(V0,c,w,h,T,{dots:1,dx});
    // the balls come up out of the snow at its crest, roll down its leading face and sink back into it (cut where they are still in the
    // snow, never faded in); they melt into the mound as it stops
    for(let i=0;i<3;i++){const t=(k*1.2+i*.37)%1,el=lerp(1.25,.4,t),az=(i-1)*.8,ca=Math.cos(el),sv=[dx*ca*Math.cos(az),w*ca*Math.sin(az),h*Math.sin(el)],
        n=nrm([sv[0]/(dx*dx),sv[1]/(w*w),sv[2]/(h*h)]),r=9+1.5*(i%2),cb=add(add(c,sv),mul(n,r*(-.95+1.5*Math.sin(Math.PI*t)))),al=sstep(-.05,.2,V0.F(n))*(1-sstep(.7,.95,k));
      if(al<.02)continue;const oc=outCap({T:q=>q,Rd:v=>v},c,[dx,w,h],AXES,cb,r,1);if(oc===false)continue;ga(al,()=>sunkDraw(V0,P(cb),r,oc,()=>ballDraw(V0,cb,r,t*5+i*2,[1,0,0],false)))}
    if(back)for(const f of pw)f();return}
  const[Rx,Ry,Rz0]=moundR(A),br=1+.035*Math.sin((p-.16)/.14*TAU*1.5)*rise(p,.16,.18,.28,.3),Rz=Rz0*br,c=A.crater||0,zc=Rz*(1-c),cr=A.heave||0;
  const ring=(z,n,rr)=>{const f=Math.sqrt(Math.max(0,1-(z/Rz)*(z/Rz))),out=[];for(let i=0;i<n;i++){const t=i/n*TAU,q=rr?rr(t):1;out.push(add(MC,[Math.cos(t)*Rx*br*f*q,Math.sin(t)*Ry*br*f*q,z]))}return out};
  const rim=c>.001?ring(zc,28,t=>1+.06*Math.sin(5*t+.7)+.035*Math.sin(11*t+.2)).map((q,i)=>add(q,[0,0,1.6*Math.sin(i*1.7)*Math.min(1,c*4)])):null,rimS=rim?rim.map(q=>P(q)):null;
  if(part==='back'){if(!rim)return;// the inside of the crater behind him: snow in the shade, darker deep down
    const dk=1-sstep(.55,.9,c);if(dk<=.01)return;poly(rimS);const b=bbox(rimS),g=ctx.createLinearGradient(0,b[1],0,b[3]);g.addColorStop(0,'#cdd9ec');g.addColorStop(1,'#8aa0c4');ctx.save();ctx.globalAlpha*=dk;ctx.fillStyle=g;ctx.fill();ctx.restore();return}
  const pts=[];for(const kz of[0,.35,.65,.85,1])for(const q of ring(kz*zc,16))pts.push(P(q));if(rimS)for(const q of rimS)pts.push(q);const H=chull(pts);if(H.length<3)return;
  const fo=1-sstep(.78,1,c);if(fo<=.01)return;ctx.save();ctx.globalAlpha*=fo;const hp=smoothP(H),pa=new Path2D();pa.addPath(hp);if(rimS){pa.moveTo(rimS[0][0],rimS[0][1]);for(const q of rimS)pa.lineTo(q[0],q[1]);pa.closePath()}
  ctx.fillStyle=grad3(bbox(H),K1.snow);ctx.fill(pa,'evenodd');ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke(hp);rims(H,.6,.25);
  ctx.save();ctx.clip(pa,'evenodd');
  {const q0=P(add(MC,[0,0,0]));ctx.fillStyle=K1.dots;for(const[a,b] of[[-.4,-.5],[.3,-.35],[.1,-.65],[-.2,-.2],[.45,-.6]]){ball([q0[0]+a*Ry,q0[1]+b*Rz*.9],1.3);ctx.fill()}}
  // the cracks while it heaves (on our side, from the top down)
  if(cr>.02){for(const az of[-1.1,-.35,.4,1.15]){const S=[];for(let j=0;j<=4;j++){const el=lerp(1.3,1.3-.85*cr,j/4),a=az+Math.atan2(V0.c,V0.s)+.12*Math.sin(j*2.3+az*3),f=Math.cos(el);
        S.push(add(MC,[Math.cos(a)*Rx*br*f,Math.sin(a)*Ry*br*f,Rz*Math.sin(el)]))}
      if(D(S[2])<D(add(MC,[0,0,Rz*.6])))continue;const Q=S.map(P);for(const[col,lw,dy] of[['rgba(40,62,120,.6)',2,0],['rgba(255,255,255,.85)',1,-1]]){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();for(const q of Q)ctx.lineTo(q[0]+(dy?.6:0),q[1]+dy);ctx.stroke()}}}
  // the eyes that open in the snow: where his real eyes are under it (so they become his eyes as he comes out), the far one only while
  // it faces us; the tips of the horns poking out of the top
  if(A.snowEyes>0&&J.eyeQ){ctx.globalAlpha*=A.snowEyes;for(const e of J.eyeQ){const q=e.q,w=Math.min(1,e.v*2.5);if(!LOWFX)shine(K1.eye,q[0],q[1],9,.6*w);
      ctx.fillStyle='#283466';ctx.beginPath();ctx.ellipse(q[0],q[1],4.8*w+.6,3.1,0,0,TAU);ctx.fill();ctx.fillStyle=K1.iris;ctx.beginPath();ctx.ellipse(q[0],q[1],3.7*w,2.2*Math.min(1,A.snowEyes*1.6),0,0,TAU);ctx.fill();
      ctx.fillStyle='#ffffff';ball([q[0]-1.1*w,q[1]-.7],.9);ctx.fill()}}
  ctx.restore();
  const hk=sstep(0,.3,A.snowEyes)*(1-sstep(.4,.44,p));if(hk>.01)for(const sd of[-1,1]){const qa=P(add(MC,[6,sd*20,36])),qb=P(add(MC,[0,sd*26,44]));ctx.save();ctx.globalAlpha*=hk;ctx.fillStyle=K1.horn.b;ctx.strokeStyle=INK;ctx.lineWidth=1.6;tri(qa[0],qa[1],qb[0],qb[1],3.4);ctx.restore()}
  // the broken lip of the crater on our side: a blue shade on it and a bright edge of fresh snow just under it
  if(rim){const dc=D(add(MC,[0,0,zc]));let s0=-1;for(let i=0;i<28;i++)if(D(rim[i])>=dc&&D(rim[(i+27)%28])<dc){s0=i;break}
    if(s0>=0){const arc=[];for(let j=0;j<28;j++){const i=(s0+j)%28;if(D(rim[i])<dc)break;arc.push(rimS[i])}
      if(arc.length>1){ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#283466';ctx.lineWidth=1.8;ctx.beginPath();for(const q of arc)ctx.lineTo(q[0],q[1]);ctx.stroke();
        ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=1.6;ctx.beginPath();for(const q of arc)ctx.lineTo(q[0],q[1]+2.2);ctx.stroke()}}}ctx.restore()}
function chunksDraw(V0,A,L,D){const k=A.chunks;if(k<0)return;const dm=D(add(MC,[0,0,30]));for(let i=0;i<MCH.length;i++){const[a,ro,ti,s2]=MCH[i],u=ez(Math.min(1,k*1.3)),d=30+36*u,
      z=Math.max(0,26*s2*(1-u)+8*Math.sin(Math.PI*Math.min(1,k*1.6))),c=add(MC,[Math.cos(a)*d,Math.sin(a)*d,z]),r=12.5*s2*(1-.65*k);
    if(r<1.5)continue;const near=D(c)>dm,dd=near?(A.sink>0?10000+D(c)*.01:D(c)+60):D(c)-60;
    L.add(dd,()=>{ctx.save();ctx.globalAlpha*=1-sstep(.75,1,k);const q=V0.P(c);ctx.translate(q[0],q[1]);ctx.rotate(ro*k*3+ti*.5);const pts=[];
      for(let j=0;j<9;j++){const b=j/9*TAU,w=1+.22*Math.sin(j*2.7+i*1.3)+.12*Math.cos(j*4.1+i);pts.push([Math.cos(b)*r*w,Math.sin(b)*r*.7*w-r*.35])}
      ctx.lineJoin='round';C.smooth(pts);ctx.fillStyle=grad3(bbox(pts),T3('#ffffff','#dbe7f6','#8aa4cb'));ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
      ctx.save();C.smooth(pts);ctx.clip();ctx.fillStyle='rgba(110,140,195,.42)';ctx.beginPath();ctx.ellipse(r*.25,r*.25,r*.95,r*.42,-.2,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.ellipse(-r*.25,-r*.62,r*.45,r*.18,-.15,0,TAU);ctx.fill();ctx.restore();ctx.restore()})}}
// the clip of a body sunk into the floor: only what is above the front edge of its hole in the floor
function floorClip(V0,c,rx,ry){const{P}=V0,pts=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push(P(add(c,[Math.cos(a)*rx,Math.sin(a)*ry,0])))}let l=0,r=0;pts.forEach((q,i)=>{if(q[0]<pts[l][0])l=i;if(q[0]>pts[r][0])r=i});
  const lower=[];for(let i=0;i<32;i++){const j=(l+i)%32;lower.push(pts[j]);if(j===r)break}const lo2=[];for(let i=0;i<32;i++){const j=(l-i+32)%32;lo2.push(pts[j]);if(j===r)break}
  const arc=lower.reduce((s2,q)=>s2+q[1],0)/lower.length>lo2.reduce((s2,q)=>s2+q[1],0)/lo2.length?lower:lo2,a0=arc[0],a1=arc[arc.length-1];
  ctx.beginPath();ctx.moveTo(-1e4,-1e4);ctx.lineTo(-1e4,a0[1]);for(const q of arc)ctx.lineTo(q[0],q[1]);ctx.lineTo(1e4,a1[1]);ctx.lineTo(1e4,-1e4);ctx.closePath();ctx.clip()}

// ------------------------------------------------------------------ the defeat: glass, cracks, the shards, the horns on the little mound
const CRK=[[[0,[.8,.3,-.6]],[0,[.95,.2,-.1]],[1,[.85,.35,-.3]],[1,[.8,.4,.1]],[2,[-.1,.7,.6]]],[[0,[.75,-.4,-.5]],[0,[.9,-.25,0]],[1,[.85,-.45,-.2]],[1,[.6,-.7,.3]]],
  [[0,[-.6,.6,-.5]],[0,[-.85,.4,0]],[2,[-.8,.5,-.3]],[2,[-.7,.3,.4]]],[[0,[-.7,-.5,-.4]],[2,[-.85,-.4,-.4]],[2,[-.75,-.45,.2]],[2,[-.4,-.3,.85]]]].map(c=>c.map(([i,m])=>({i,m:nrm(m)})));
const SHD=[[0,[0,0,60],13,[.9,.1,.4]],[1,[10,22,50],11.5,[.2,1,.2]],[2,[10,-22,50],11.5,[.2,-1,.2]],[3,[-14,12,40],12,[-.8,.7,.3]],[4,[-14,-12,40],11.5,[-.8,-.7,.3]],[5,[6,0,86],11,[.6,0,.8]],[6,[-6,30,70],10.5,[-.3,1,.5]],[7,[-6,-30,70],10.5,[-.3,-1,.5]]];
const SHT=[T3('#d4f0ff','#78b8e2','#386aa6'),T3('#e0f6ff','#6aaee0','#2c5c9c')];
// the blades of the second phase that fall with it: [from (the hands at the end of its fall), the way they fly]
const BLD=[[[30,34,8],[.5,.85,.6]],[[34,28,8],[.95,.25,.7]],[[22,-34,24],[.4,-.9,.5]],[[26,-28,24],[.9,-.4,.8]]];
function bladePiece(V0,c,L0,a,ax,T){const r=v=>add(c,rotAx(v,ax,a)),tip=r([L0,0,0]),bk=r([-L0*.3,0,0]),S=[r([0,2.8,0]),r([0,0,1.5]),r([0,-2.8,0]),r([0,0,-1.5])],FS=[];
  for(let i=0;i<4;i++){FS.push([S[i],S[(i+1)%4],tip]);FS.push([S[(i+1)%4],S[i],bk])}facets(V0,FS,T,{lw:1.6,seamCol:'rgba(255,255,255,.6)'})}
function shardsDraw(V0,A,L,D,J){const k=A.shat,n=LOWFX?4:8;for(let i=0;i<n;i++){const s=SHD[LOWFX?i*2:i],v=nrm(s[3]),T=Math.min(1,k/.45),air=T<1,t=ez(T),c0=s[1],hor=[v[0]*46,v[1]*46],
      c=[c0[0]+hor[0]*t,c0[1]+hor[1]*t,air?Math.max(s[2]*.7,c0[2]+60*T*v[2]*1.4-(c0[2]+40)*T*T):s[2]*.7],an=air?T*6+i:6+i;
    L.add(D(c)+5,()=>iceChunk(V0,c,s[2],an,nrm([.3,.7,.5]),mixT(SHT[0],SHT[1],A.k2)))}
  if(A.k2>.5)for(let i=0;i<(LOWFX?2:4);i++){const[c0,v0]=BLD[LOWFX?i*2:i],v=nrm(v0),T=Math.min(1,k/.4),t=ez(T),air=T<1,
      c=[c0[0]+v[0]*40*t,c0[1]+v[1]*40*t,air?Math.max(3,c0[2]+70*T*v[2]-(c0[2]+50)*T*T):3],an=air?T*7+i:7+i;
    L.add(D(c)+5,()=>bladePiece(V0,c,16,an,nrm([.2,.5,.8]),BLADE))}}
function remainsDraw(V0,A,L,D,J){const k=A.shat,{P}=V0,mk=sstep(0,.4,k);
  // the little mound of snow (60 x 26) and the two horns crossed on top, like a small peak
  if(mk>0)L.add(D([0,0,0])-1,()=>domeDraw(V0,[0,0,0],30*(.6+.4*mk),26*mk,K1.snow,{dots:1}));
  // the horns: they fall tumbling from where the head was, bounce once on the snow and lie crossed on top of it, the coils up
  for(const sd of[-1,1]){const fall=cl(k/.3,0,1),bz=k>.3&&k<.45?Math.sin((k-.3)/.15*Math.PI)*7:0,top=[0,0,26*mk+1],st=J.hornAt[sd<0?0:1],
      vr=[V0.c,-V0.s,0],vt=[V0.s,V0.c,0],ca=Math.cos(sd*.62),sa=Math.sin(sd*.62),
      rest=v=>{const X0=-sd*(v[0]+5.4)*.86,Z0=(v[2]-.5)*.86,xr=X0*ca-Z0*sa,zr=X0*sa+Z0*ca;return add(add(top,[0,0,9]),add(add(mul(vr,xr+sd*9.5),[0,0,zr]),mul(vt,(v[1]-20)*.2+sd*.6)))},
      tum=v=>add(st,rotY(rotX([v[0]*.82,(v[1]-9)*.82*sd,v[2]*.82],fall*5*sd),fall*3)),w=ez(fall),
      pts=HORN.map(q=>{const v=[q[0],q[1],q[2]];return k<.3?lerp3(tum(v),rest(v),w):add(rest(v),[0,0,bz])}),c=pts[2];
    L.add(D(top)+2+(sd>0?.5:0),()=>{const S=pts.map(P);
      ctx.lineCap='round';ctx.fillStyle=INK;for(let i=0;i<S.length-1;i++){C.hull(S[i],HORNR[i]*.82+1.3,S[i+1],HORNR[i+1]*.82+1.3);ctx.fill()}const bb=bbox(S);ctx.fillStyle=grad3([bb[0]-5,bb[1]-5,bb[2]+5,bb[3]+5],J.KH.horn);
      for(let i=0;i<S.length-1;i++){C.hull(S[i],HORNR[i]*.82-1,S[i+1],HORNR[i+1]*.82-1);ctx.fill()}ctx.strokeStyle=J.KH.frost;ctx.lineWidth=1.3;ctx.beginPath();for(let i=0;i<4;i++){const q=P(add(pts[i],[0,0,HORNR[i]*.6]));i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}ctx.stroke()})}
  // the flash of the shattering, the snow bursting, the flakes falling
  L.add(999,()=>{const c=P([0,0,50]);if(k<.15&&!LOWFX){const a=1-k/.15,g=ctx.createRadialGradient(c[0],c[1],2,c[0],c[1],60);g.addColorStop(0,`rgba(255,255,255,${.9*a})`);g.addColorStop(.4,`rgba(220,245,255,${.5*a})`);g.addColorStop(1,'rgba(220,245,255,0)');ctx.fillStyle=g;ball(c,60);ctx.fill()}
    if(k<.5)for(let i=0;i<10;i++){const a=i/10*TAU,u=k/.5,q=P([Math.cos(a)*(10+40*u),Math.sin(a)*(10+40*u),20+30*Math.sin(Math.PI*u)+(i%3)*8]);cloud(q,4+8*u,.8*(1-u),'244,250,255')}
    if(!LOWFX)for(let i=0;i<12;i++){const u=(k*1.6+i/12)%1,q=P([Math.sin(i*2.3)*40,Math.cos(i*1.7)*36,90*(1-u)+5]);ctx.fillStyle=`rgba(255,255,255,${.8*Math.sin(Math.PI*u)*(1-sstep(.7,1,k))})`;ball(q,1.4);ctx.fill()}})}

// ------------------------------------------------------------------ the model
function yeti2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};anim=MV.includes(anim)?anim:'idle';p=cl(p,0,1);if(anim==='taunt'&&!o.tsd)o=Object.assign({},o,{tsd:Math.cos(face)>=0?1:-1});
  const V0=V(face),{P,D,F}=V0,A=yPose(anim,p,o),fx=fxOn(o);
  const lift=o.z!=null?o.z/sc:A.lift;A.B[2]+=lift;const X=frame(A,0),XU=upper(X,A),K=pal(A.k2,0);
  // the wind is fixed in the world: toward the right of the screen and a little up
  const W=nrm([Math.cos(face),-Math.sin(face),.3]),fw=X.Rd([1,0,0]);
  const hc0=add(HC0,[A.hx,0,A.hz]),Hc=XU.T(hc0),hyR=A.hy-A.yaw+cheat(face,.3),hpR=A.hp-.8*(A.lean-A.rear),HR=v=>XU.Rd(rotZ(rotY(rotX(v,A.hr),hpR),hyR));
  const J={Wsc:[1,-.15],W:A.wrev>0?nrm(lerp3(W,nrm(add(mul(fw,-1),[0,0,.2])),A.wrev)):W,XU,back:nrm(mul(fw,-1)),mouth:add(Hc,HR([21,0,-11])),KE:A.ek!==A.k2?pal(A.ek,0):null};
  // the defeat: the glass from the feet up (by the height of each piece), the remains after .55
  const gl=A.ice>=0?z=>cl((A.ice*150-z)/18+.5,0,1):null,Kz=z=>gl?pal(A.k2,gl(z)):K;J.KG=pal(A.k2,1);J.KH=Kz(90);
  if(A.shat>=0){J.hornAt=[-1,1].map(sd=>add(Hc,HR([-12,sd*28,0])));ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
    if(A.fade>.03)floor(V0,0,0,1,[0,0,0],34,12,.35*A.fade,0);shardsDraw(V0,A,L,D,J);remainsDraw(V0,A,L,D,J);
    if(A.fade<.99){const LL=L.slice().sort((a,b)=>a.d-b.d);fadeDraw(()=>{for(const e of LL){ink(2.4);e.f()}},P([0,0,30]),90,A.fade)}else run(L);ctx.restore();return}
  const shK=A.sink>0?sstep(30,0,A.sink):1;
  if(shK>.02)floor(V0,x,y,sc,[A.B[0],A.B[1],0],46,15,.45*shK,lift);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),dT=D(XU.T(CC));
  L.add(dT,()=>torsoDraw(V0,X,XU,A,Kz(50),J));
  L.add(dT+.2,()=>flagDraw(V0,XU,A,J));
  for(const sd of[-1,1]){const g=legGeo(X,A,sd,lift);L.add(dT-100+D(X.T([HIP[0],sd*HIP[1],HIP[2]]))*.01,()=>legDraw(V0,X,A,Kz(8),sd,g,J))}
  // the order round the torso: a part is in front of it or behind it by where it is against the torso's axis (the belly low, the chest,
  // the hump high) along the view, so the swap comes when the part is beside the torso's outline and nothing jumps as it turns; high over
  // the torso a part comes forward as it rises (the camera looks down). The shoulders, the head and the spirals of the horns, close by the
  // hump, swap by the side of the hump they are on (its normal toward them, facing us or not). The arm hangs as a chain: the shoulder
  // over the upper arm, the upper arm over the forearm, unless the forearm rises or reaches toward us
  const axAt=z=>z<65?lerp3(X.T(BC),XU.T(CC),cl((z-41)/24,0,1)):lerp3(XU.T(CC),XU.T(UC),cl((z-65)/24,0,1)),
    sig=q=>{const a=axAt(q[2]-lift);return(q[0]-a[0])*V0.s+(q[1]-a[1])*V0.c+.55*Math.max(0,q[2]-lift-95)},E0=XU.Rd([1,0,0]),E1=XU.Rd([0,1,0]),E2=XU.Rd([0,0,1]),
    tside=(q,C0,R0)=>{const d=sub(q,XU.T(C0)),m=nrm([dot(d,E0)/R0[0],dot(d,E1)/R0[1],dot(d,E2)/R0[2]]);return F(add(add(mul(E0,m[0]/R0[0]),mul(E1,m[1]/R0[1])),mul(E2,m[2]/R0[2])))},
    // how clear of a volume of the upper body the ray from a point toward us passes (in its radii: below 0 the volume hides the point)
    clr=(q,C0,R0)=>{const d=sub(q,XU.T(C0)),v=[V0.s,V0.c,.55],p=[dot(d,E0)/R0[0],dot(d,E1)/R0[1],dot(d,E2)/R0[2]],w=[dot(v,E0)/R0[0],dot(v,E1)/R0[1],dot(v,E2)/R0[2]],
      t=Math.max(0,-dot(p,w)/dot(w,w));return len(add(p,mul(w,t)))-1},
    // a part going from in front of the torso to behind it (k 0 .. 1): drawn twice, what is past a line sweeping over it from the side of
    // the torso before the torso, the rest after it, so it slides behind the torso's outline and nothing jumps
    split=(f,dF,dB,q3,c3,ext,k,fB)=>{fB=fB||f;if(k<=.001){L.add(dF,f);return}if(k>=.999){L.add(dB,fB);return}
      const c0=P(q3),t0=P(c3),ux=c0[0]-t0[0],uy=c0[1]-t0[1],ul=Math.hypot(ux,uy)||1,u=[ux/ul,uy/ul],v=[-u[1],u[0]],sw=lerp(-ext,ext,k),
        half=back=>{const o=back?sw+.6:sw-.6,kk=back?-1e4:1e4,m=[c0[0]+u[0]*o,c0[1]+u[1]*o],pa=new Path2D();pa.moveTo(m[0]+v[0]*1e4,m[1]+v[1]*1e4);pa.lineTo(m[0]-v[0]*1e4,m[1]-v[1]*1e4);
          pa.lineTo(m[0]-v[0]*1e4+u[0]*kk,m[1]-v[1]*1e4+u[1]*kk);pa.lineTo(m[0]+v[0]*1e4+u[0]*kk,m[1]+v[1]*1e4+u[1]*kk);pa.closePath();return pa};
      L.add(dB,()=>{ctx.save();ctx.clip(half(true));fB();ctx.restore()});L.add(dF,()=>{ctx.save();ctx.clip(half(false));f();ctx.restore()})};
  J.hands=[];
  for(const sd of[-1,1]){const g=armGeo(sd,A,XU,lift),sh=XU.T([DLT[0],sd*DLT[1],DLT[2]]),ks=sstep(.1,-.1,tside(sh,UC,UR)),dsF=Math.max(dT+.5,dT+sig(sh)),dsB=Math.min(dT-.5,dT+sig(sh)),
      mu=lerp3(g.S,g.El,.5),mf=lerp3(g.El,g.W,.5),hump=XU.T(UC),rs=Math.max(0,D(mu)-D(sh))*sstep(-5,10,g.El[2]-g.S[2]);J.hands[sd<0?0:1]=g;
    split(()=>shoulderDraw(V0,XU,A,Kz(88),sd,J),dsF,dsB,sh,hump,24,ks);
    const Kua=Kz(70),uaD=()=>upperArmDraw(V0,g,A,Kua,J);
    split(uaD,dsF-.3+rs,dsB-.3+rs,sh,hump,24,ks);const dua=lerp(dsF,dsB,ks>.5?1:0)-.3+rs;
    // the forearm goes where its hand is against the torso; against the upper arm by which of the two is nearer to us at the elbow: it is
    // drawn after the upper arm, and the end of the upper arm is drawn again over the elbow, wiped in from its end as it comes in front (so
    // the two never swap at once as it turns). With the torso between the two, what is behind it stays behind it (clipped to outside it)
    const zh=g.Pc[2]-lift,dF0=dT+sig(g.Pc),same=(dF0-dT)*(dua-dT)>0,Ka=Kz(Math.max(0,zh)),wup=sstep(-2.5,2.5,D(lerp3(g.El,g.S,.3))-D(lerp3(g.El,g.W,.3)));
    const outT=()=>{if(!J.tpath)return;const pa=new Path2D();pa.rect(-1e4,-1e4,2e4,2e4);pa.addPath(J.tpath);ctx.clip(pa,'evenodd')};
    const wipe=t=>{if(wup<=.01)return;const a=P(g.S),b=P(g.El),ux=b[0]-a[0],uy=b[1]-a[1],l=Math.hypot(ux,uy);if(l<2)return;const u=[ux/l,uy/l],v=[-u[1],u[0]],s=lerp(12,-Math.min(13,l*.4),wup),
        m=[b[0]+u[0]*s,b[1]+u[1]*s];ctx.save();if(t)outT();ctx.beginPath();ctx.moveTo(m[0]+v[0]*1e3,m[1]+v[1]*1e3);ctx.lineTo(m[0]-v[0]*1e3,m[1]-v[1]*1e3);
        ctx.lineTo(m[0]-v[0]*1e3+u[0]*1e3,m[1]-v[1]*1e3+u[1]*1e3);ctx.lineTo(m[0]+v[0]*1e3+u[0]*1e3,m[1]+v[1]*1e3+u[1]*1e3);ctx.closePath();ctx.clip();ink(2.4);uaD();ctx.restore()};
    const hb=[A.ball,A.ball2].find(b=>b&&b.held===sd),hbD=hb?()=>ballDraw(V0,add(hb.c,[0,0,lift]),hb.r,hb.spin,[1,0,0],A.k2>.5):null,bf=hb&&F(g.pn)>0,hf=F(g.fd)>-.85;
    const fa=()=>{if(hb&&!bf)hbD();if(hf){forearmDraw(V0,g,A,Ka,J);handDraw(V0,g,A,Ka,J)}else{handDraw(V0,g,A,Ka,J);forearmDraw(V0,g,A,Ka,J)}if(bf)hbD()};
    if(same)L.add(Math.max(dF0,dua+.05),()=>{fa();wipe(false)});
    else if(dF0>dua)L.add(dF0,()=>{fa();wipe(true)});
    else{L.add(dF0,fa);L.add(dua+.01,()=>{ctx.save();outT();ink(2.4);fa();ctx.restore();wipe(true)})}}
  // the head: in front of the torso while the hump's side toward it faces us, behind it when that side turns away; in front, the skull is
  // cut where it goes into the chest (only the skull: the face, the mane and the beard never). Toward the swap it goes behind the torso
  // little by little, from its back: the part of it past a line that sweeps over it is drawn before the torso, the rest after it, so at
  // the swap it is all behind and nothing jumps. The roots of the horns go with it
  const KH=Kz(84),hS=tside(Hc,UC,UR),hfr=hS>0,dH=hfr?Math.max(dT+.5,dT+sig(Hc)):Math.min(dT-.5,dT+sig(Hc)),oc=hfr?outCap(XU,CC,mul(CR3,1+A.infl),AXES,hc0,16.2,1):null,hsw=hfr?sstep(.3,0,hS):0;
  J.dH=dH;const T=q=>add(Hc,HR(q)),dHc=D(Hc),roots=[-1,1].map(sd=>({sd,f:F(HR([HBASE[0],sd*HBASE[1],HBASE[2]]))}));J.roots=roots;J.hornT=T;
  // (the cut of the skull where it goes into the chest only on the part drawn after the torso)
  split(()=>headDraw(V0,Hc,HR,A,KH,J,oc||null),dH,Math.min(dT-.5,dT+sig(Hc)),Hc,XU.T(CC),34,hsw,()=>headDraw(V0,Hc,HR,A,KH,J,null));
  // the spirals of the horns round the ears: their own depth, against the skull, the shoulder and the torso
  for(const sd of[-1,1]){const pts=HORN.map(q=>T([q[0],sd*q[1],q[2]]));
    let c=[0,0,0];for(let i=2;i<pts.length;i++)c=add(c,pts[i]);c=mul(c,1/(pts.length-2));
    const kh=sstep(.22,-.22,Math.min(clr(c,UC,add(mul(UR,1+A.infl),[2.4,2.4,2.4])),clr(c,CC,mul(CR3,1+A.infl)))),ah=D(c)>dHc;let dF=Math.max(dT+.5,dT+sig(c)),dB=Math.min(dT-.5,dT+sig(c));
    if(hfr)dF=ah?Math.max(dF,dH+.06):Math.min(dF,dH-.06);else dB=ah?Math.max(dB,dH+.06):Math.min(dB,dH-.06);
    split(()=>hornDraw(V0,T,HR,A,KH,sd,2,pts.length-1),dF,dB,c,XU.T(UC),20,kh)}
  // the snowballs in its hands
  for(const b of[A.ball,A.ball2]){if(!b||b.held)continue;const c=add(b.c,[0,0,lift]),ax=X.T(BC);L.add(dT+(c[0]-ax[0])*V0.s+(c[1]-ax[1])*V0.c+.5,()=>ballDraw(V0,c,b.r,b.spin,[1,0,0],A.k2>.5))}
  // the defeat: the cracks running up the body (over everything of it)
  if(A.crack>0)L.add(998,()=>cracksDraw(V0,X,XU,A));
  if(fx){for(const e of A.fx)fxDraw(V0,X,XU,L,e,A,J,Hc,HR,K);
    if(A.suck>=0&&A.suck<1)L.add(999,()=>suckDraw(V0,A,J));
    if(A.k2>.5&&anim!=='gasp'&&anim!=='die')L.add(D(J.mouth)+20,()=>wispDraw(V0,A,J,K))}
  // the entrance: the mound covers the body sunk in it, the clods roll away
  if(A.mound>=0){const MR=moundR(A);J.eyeQ=[-1,1].map(sd=>{const m=[EYED[0],sd*EYED[1],EYED[2]];let E=add(Hc,HR(ellAt([0,0,0],HRD,null,m)));const d=sub(E,MC),nr=Math.hypot(d[0]/MR[0],d[1]/MR[1],d[2]/MR[2]);
      if(nr>.94)E=add(MC,mul(d,.94/nr));return{q:P(E),v:F(HR(ellN(HRD,null,m)))}}).filter(e=>e.v>.1);
    L.add(9999,()=>moundDraw(V0,A,p,J,fx,'front'))}
  if(A.chunks>=0)chunksDraw(V0,A,L,D);
  if(A.sink>0){const LL=L.slice().sort((a,b)=>a.d-b.d),front=LL.filter(e=>e.d>=9000||e.d>500),body=LL.filter(e=>!(e.d>=9000||e.d>500));
    // under the snow until it breaks out; then what is still in the floor hides behind the base of the mound, which sinks as it rises
    if(A.mound>=1&&A.crater>.001){const[Rx,Ry]=moundR(A);moundDraw(V0,A,p,J,fx,'back');ctx.save();floorClip(V0,MC,Rx,Ry);for(const e of body){ink(2.4);e.f()}ctx.restore()}
    for(const e of front){ink(2.4);e.f()}}
  else run(L);
  ctx.restore()}
function cracksDraw(V0,X,XU,A){const{P,F}=V0,vs=[{C:BC,R:BR,T:X},{C:CC,R:CR3,T:XU},{C:UC,R:UR,T:XU}];ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  for(const c of CRK){const S=[];for(let i=0;i<c.length;i++){const v=vs[c[i].i],m=c[i].m,n=v.T.Rd(ellN(v.R,null,m));S.push({q:P(v.T.T(ellAt(v.C,v.R,null,m))),f:F(n)})}
    const n=Math.max(2,Math.ceil(S.length*A.crack));ctx.beginPath();let on=false;for(let i=0;i<n;i++){const s2=S[i];if(s2.f<.05){on=false;continue}let q=s2.q;if(i===n-1&&n<S.length+1){const fr=S.length*A.crack-(n-1);if(i>0)q=[lerp(S[i-1].q[0],q[0],cl(fr,0,1)),lerp(S[i-1].q[1],q[1],cl(fr,0,1))]}
      if(on)ctx.lineTo(q[0]+(i%2?1.5:-1.5),q[1]);else{ctx.moveTo(q[0],q[1]);on=true}}
    ctx.strokeStyle='rgba(30,60,110,.6)';ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle='#ffffff';ctx.lineWidth=1.5;ctx.stroke()}
  ctx.restore()}
// the flakes of the room sucked into the mouth in a spiral (the breath before every blow)
function suckDraw(V0,A,J){if(LOWFX)return;const{P}=V0,m=P(J.mouth);for(let i=0;i<12;i++){const u=(A.suck*1.8+i/12)%1,r=70*(1-u),a=i/12*TAU+u*5;const q=[m[0]+Math.cos(a)*r,m[1]+Math.sin(a)*r*.6];
  const al=Math.sin(Math.PI*u),rf=1.3+1.3*(1-u);ctx.fillStyle=`rgba(255,255,255,${(.95*al).toFixed(3)})`;ctx.strokeStyle=`rgba(40,70,140,${(.7*al).toFixed(3)})`;ctx.lineWidth=.8;ball(q,rf);ctx.fill();ctx.stroke();
  ctx.fillStyle=`rgba(120,200,255,${(.9*al).toFixed(3)})`;ball(q,rf*.45);ctx.fill()}}
// the thread of breath of the second phase, always drifting from the mouth
function wispDraw(V0,A,J,K){if(LOWFX)return;const{P}=V0;for(let i=0;i<3;i++){const u=(A.wph*.5+i/3)%1,c=add(add(J.mouth,mul(J.W,8+u*22)),[0,0,u*10]),q=P(c);cloud(q,1.6+u*3.2,.4*Math.sin(Math.PI*u),K.breath)}}

// ------------------------------------------------------------------ the effects of the moves
function fxDraw(V0,X,XU,L,e,A,J,Hc,HR,K){const{P,D}=V0,t=e.t,br=K.breath,mouth=J.mouth,fwd=HR([1,0,0]);
  if(e.k==='nose'){const m0=add(Hc,HR([22,0,-4]));L.add(D(m0)+30,()=>{for(const sd of[-1,1]){const u=t,q=P(add(add(m0,HR([3+u*8,sd*(2+u*4),-1-u*3])),mul(J.W,u*10)));cloud(q,1.6+u*3.4,.5*(1-u)*Math.min(1,u*6),br)}})}
  else if(e.k==='scrape'){const g=J.hands&&J.hands[e.sd<0?0:1];if(!g)return;const fw=X.Rd([1,0,0]),f0=nrm([fw[0],fw[1],0]),sv=[-f0[1],f0[0],0],o0=e.back?-4:8,c=[g.Pc[0]+f0[0]*o0,g.Pc[1]+f0[1]*o0,0];
    // two scratches in the ice behind the claws (pale, with a blue edge under them so they read on the white floor), a puff of snow
    L.add(-850,()=>{const k=sstep(0,.35,t),al=1-sstep(.55,1,t);if(al<=.01)return;ctx.save();ctx.globalAlpha*=al;
      for(const o of[-2.8,2.8]){const a=P(add(c,mul(sv,o))),b=P(add(add(c,mul(sv,o*1.25)),mul(f0,-15*k)));taper([a[0],a[1]+.9],[b[0],b[1]+.9],1.7,'rgba(60,92,150,.5)');taper(a,b,1.2,'rgba(250,253,255,.95)')}ctx.restore()});
    L.add(D(c)+20,()=>{const u=sstep(0,.6,t);cloud(P(add(c,[0,0,3+8*u])),2+4*u,.5*(1-u),'236,246,255')})}
  else if(e.k==='hah'||e.k==='pant'||e.k==='cloud'){const big=e.k==='cloud'?1.6:e.k==='pant'?.55:e.small?.75:1.15;L.add(D(mouth)+40,()=>{for(let i=0;i<5;i++){const u=cl(t*1.25-i*.06,0,1);if(u<=0||u>=1)continue;
      const q=P(add(add(mouth,mul(fwd,(4+u*20)*big)),add(mul(J.W,u*8),[0,0,(i-2)*1.6*big+u*4])));cloud(q,(2+u*6)*big,.62*(1-u)*Math.min(1,u*5),br)}})}
  else if(e.k==='snow'){const c=e.at;L.add(D(c)+25,()=>{const n=e.n||6,r=e.r||10;for(let i=0;i<n;i++){const a=i/n*TAU+.5,d=r*(.35+t*.9),q=P(add(c,[Math.cos(a)*d,Math.sin(a)*d,t*10+(i%2)*3]));cloud(q,2.2+t*4.5,.6*(1-t),'240,248,255')}})}
  else if(e.k==='ring'){L.add(e.spray?D([0,0,40])+80:-800,()=>{const r=(e.small?14:22)+t*(e.small?36:58),pts=[];if(e.spray){for(let i=0;i<18;i++){const a=i/18*TAU,q=P([Math.cos(a)*(30+t*40),Math.sin(a)*(30+t*40),60-t*30+(i%3)*6]);ctx.fillStyle=`rgba(240,250,255,${.8*(1-t)})`;ball(q,1.6);ctx.fill()}return}
      for(let i=0;i<28;i++){const a=i/28*TAU;pts.push(P([A.B[0]+Math.cos(a)*r,A.B[1]+Math.sin(a)*r,0]))}ctx.strokeStyle=`rgba(240,248,255,${.7*(1-t)})`;ctx.lineWidth=4*(1-t)+1;poly(pts);ctx.stroke();
      for(let i=0;i<10;i++){const a=i/10*TAU+.3,q=P([Math.cos(a)*r,Math.sin(a)*r,2+4*t]);cloud(q,2.5+t*4,.5*(1-t),'240,248,255')}})}
  else if(e.k==='crack'){L.add(-900,()=>{const k=sstep(0,.25,t),al=1-sstep(.7,1,t);ctx.save();ctx.globalAlpha*=al;ctx.lineCap='round';
      for(let i=0;i<5;i++){const a=i/5*TAU+.4;const pts=[];for(let j=0;j<=4;j++){const r=4+j*(e.r||20)/4*k;pts.push(P(add(e.at,[Math.cos(a+Math.sin(j*2.1+i)*.3)*r,Math.sin(a+Math.sin(j*2.1+i)*.3)*r,0])))}
        ctx.strokeStyle='rgba(40,70,120,.55)';ctx.lineWidth=2.4;ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1.1;ctx.stroke()}ctx.restore()})}
  else if(e.k==='chest'){const c=XU.T([30,0,54]),n=XU.Rd([1,0,.15]);L.add(J.dH!=null?J.dH-.1:D(c)+50,()=>{const[u,v]=frm(n,[0,0,1]),r=6+t*30,pts=[];for(let i=0;i<24;i++){const a=i/24*TAU;pts.push(P(add(c,add(mul(u,Math.cos(a)*r),mul(v,Math.sin(a)*r)))))}
      ctx.strokeStyle=e.frost?`rgba(190,235,255,${.85*(1-t)})`:`rgba(255,255,255,${.8*(1-t)})`;ctx.lineWidth=3.5*(1-t)+.8;poly(pts);ctx.stroke();if(e.frost&&!LOWFX)for(let i=0;i<6;i++){const q=pts[i*4];star4(q,3*(1-t),1-t,'#e8fbff')}})}
  else if(e.k==='mflash'){L.add(999,()=>{const q=P(mouth),a=1-t,g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],22);g.addColorStop(0,`rgba(255,255,255,${.9*a})`);g.addColorStop(.5,`rgba(200,240,255,${.45*a})`);g.addColorStop(1,'rgba(200,240,255,0)');ctx.fillStyle=g;ball(q,22);ctx.fill()})}
  else if(e.k==='cone'){// the root of the blast: the first 60 px of the white-blue wind from the mouth along the body (the game draws the cone, along
    // e.face: the head is turned toward us a little), soft: three layers narrower and brighter inward, puffs along it, flakes and sparks
    const fw=X.Rd([1,0,0]),d0=nrm([fw[0],fw[1],0]),end=X.T([106,0,44]),side=nrm(cross(d0,[0,0,1])),hw=A.k2>.5?22:34;
    L.add(Math.max(D(mouth),D(end))+30,()=>{const a=Math.min(1,t*8)*(1-sstep(.85,1,t)),q0=P(mouth),q1=P(end);
      for(const[wk,al] of[[1,.22],[.7,.3],[.42,.42]]){const sp1=P(add(end,mul(side,hw*wk))),sp2=P(add(end,mul(side,-hw*wk)));
        const g=ctx.createLinearGradient(q0[0],q0[1],q1[0],q1[1]);g.addColorStop(0,`rgba(255,255,255,${(al*1.6*a).toFixed(3)})`);g.addColorStop(.55,`rgba(205,238,255,${(al*a).toFixed(3)})`);g.addColorStop(1,'rgba(200,236,255,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(q0[0],q0[1]-2*wk);ctx.quadraticCurveTo((q0[0]+sp1[0])/2,(q0[1]+sp1[1])/2-5*wk,sp1[0],sp1[1]);ctx.quadraticCurveTo(q1[0]+(q1[0]-q0[0])*.08,q1[1]+(q1[1]-q0[1])*.08,sp2[0],sp2[1]);
        ctx.quadraticCurveTo((q0[0]+sp2[0])/2,(q0[1]+sp2[1])/2+5*wk,q0[0],q0[1]+2*wk);ctx.closePath();ctx.fill()}
      for(const[u,r] of[[.3,5],[.58,8],[.86,11]]){const w=Math.sin(t*TAU*1.5+u*7)*.25,c=P(add(lerp3(mouth,end,u),mul(side,w*14)));cloud(c,r*(.8+.3*Math.sin(t*9+u*5)),.32*a,'232,246,255')}
      for(let i=0;i<9;i++){const u=(t*3.2+i/9)%1,w=(i%3-1)*.8*u,c=add(add(mouth,mul(sub(end,mouth),u)),mul(side,w*hw*.75)),q=P(c);ctx.fillStyle=`rgba(255,255,255,${.9*a*Math.sin(Math.PI*u)})`;if(i%3===0&&!LOWFX)star4(q,2.6,a*Math.sin(Math.PI*u));else{ball(q,1.3);ctx.fill()}}})}
  else if(e.k==='column'){L.add(D(mouth)+60,()=>{for(let i=0;i<7;i++){const u=(t*2.4+i/7)%1,q=P(add(mouth,[(i%2?2:-2)*u,0,6+u*48]));cloud(q,3+u*7,.55*Math.sin(Math.PI*u)*(1-sstep(.85,1,t)),br)}})}
  else if(e.k==='slash'){const sd=e.sd,a0=sd>0?[-10,30,128]:[-10,-30,128],a1=sd>0?[40,-20,20]:[40,20,20];L.add(999,()=>{const k=sstep(0,.3,t),al=1-sstep(.45,1,t);ctx.save();ctx.globalAlpha*=al;ctx.lineCap='round';
      for(let j=-1;j<=1;j++){const off=[0,0,j*5],m=add(lerp3(a0,a1,.5),[22,0,12]),S=[];for(let i=0;i<=10;i++){const u=i/10*k,b=add(add(lerp3(lerp3(a0,m,u),lerp3(m,a1,u),u),off),[0,0,0]);S.push(P(b))}
        ctx.strokeStyle='rgba(120,200,255,.5)';ctx.lineWidth=5;ctx.beginPath();for(const q of S)ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.stroke()}ctx.restore()})}
  else if(e.k==='clap'){const g=J.hands;if(!g)return;const c=lerp3(g[0].Pc,g[1].Pc,.5);L.add(D(c)+30,()=>{for(let i=0;i<6;i++){const a=i/6*TAU,q=P(add(c,[Math.cos(a)*(3+t*12),Math.sin(a)*(3+t*12),Math.sin(a*2)*4+t*4]));cloud(q,1.8+t*3,.7*(1-t),'240,248,255')}})}
  else if(e.k==='fall'){const pts=e.head?[add(Hc,HR([-4,-8,16])),add(Hc,HR([-4,8,16]))]:[XU.T([DLT[0],-DLT[1],DLT[2]+10]),XU.T([DLT[0],DLT[1],DLT[2]+10])];
    L.add(990,()=>{for(const c of pts)for(let i=0;i<4;i++){const u=cl(t*1.2-i*.08,0,1);if(u<=0||u>=1)continue;const q=P(add(c,[(i-1.5)*3,(i%2?2:-2)*u*6,-u*u*50])),r=1.5+i*.3,an=i*1.3+u*4;
      ctx.fillStyle=`rgba(80,112,175,${(.35*(1-u)).toFixed(3)})`;ctx.beginPath();ctx.ellipse(q[0]+.4,q[1]+.8,r*1.15,r*.8,an,0,TAU);ctx.fill();
      ctx.fillStyle=`rgba(250,253,255,${(1-u).toFixed(3)})`;ctx.beginPath();ctx.ellipse(q[0],q[1],r*1.15,r*.8,an,0,TAU);ctx.moveTo(q[0]+r*1.2,q[1]-r*.3);ctx.ellipse(q[0]+r*.6,q[1]-r*.3,r*.6,r*.5,0,0,TAU);ctx.fill()}})}
  else if(e.k==='frost'){L.add(999,()=>{for(let i=0;i<16;i++){const a=i/16*TAU,u=t,r=20+u*70,q=P([Math.cos(a)*r,Math.sin(a)*r,40+20*Math.sin(i*1.3)*(1-u)]);cloud(q,3+u*6,.75*(1-u),'228,246,255');if(i%4===0&&!LOWFX)star4(q,4*(1-u),1-u)}})}
  else if(e.k==='crac'){const g=J.hands;if(!g)return;L.add(999,()=>{for(const h of g){const q=P(add(h.Pc,mul(h.fd,9)));if(!LOWFX)shine(BLADERGB,q[0],q[1],12,.7*(1-t));star4(q,7*(1-t),1-t)}})}
  else if(e.k==='mist'){L.add(-700,()=>{for(let i=0;i<6;i++){const a=i/6*TAU+t*TAU,r=24+8*Math.sin(t*TAU*2+i),q=P([Math.cos(a)*r,Math.sin(a)*r*1.1,2]);cloud(q,6+2*Math.sin(t*TAU+i),.22,'200,230,255')}})}
  else if(e.k==='puffm'){L.add(99999,()=>{const q=P([MC[0],0,44]);for(let i=0;i<4;i++){const u=t,c=[q[0]+(i-1.5)*6*u,q[1]-u*18-(i%2)*3];cloud(c,2+u*5,.65*(1-u),'235,248,255')}})}
  else if(e.k==='lastb'){L.add(999,()=>{for(let i=0;i<7;i++){const u=cl(t*1.2-i*.05,0,1);if(u<=0||u>=1)continue;const q=P(add(add(mouth,mul(fwd,6+u*8)),add(mul(W0(J),u*46),[0,0,u*26+(i-3)*3*u])));cloud(q,4+u*11,.55*(1-u)*Math.min(1,u*5),br)}})}}
const W0=J=>J.W;
function taper(a,b,w,col){const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(l<.5)return;const nx=-dy/l*w,ny=dx/l*w;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(a[0]+nx,a[1]+ny);ctx.quadraticCurveTo((a[0]+b[0])/2+nx*.6,(a[1]+b[1])/2+ny*.6,b[0],b[1]);ctx.quadraticCurveTo((a[0]+b[0])/2-nx*.6,(a[1]+b[1])/2-ny*.6,a[0]-nx,a[1]-ny);ctx.closePath();ctx.fill()}

// ------------------------------------------------------------------ for the game: the pieces of its attacks, with the same look
// N3.yetiIcicle(x, y, z, sc, o): the icicle that falls (x, y: its point on the floor; z: the height of its tip), 26 long and 9 wide, three
// faces, a white streak, the lit tip; o.big: the giant stalactite (58 x 22, ridges, snow on top); o.shatter (0..1): the pieces that splash
// on the floor (6 shards and a puff, drawn at the floor point); o.p2: the colours of the second phase. No shadow (the brain draws it)
N3.yetiIcicle=function(x,y,z,sc,o){o=o||{};sc=sc||1;const T=o.p2?K2.ice:K1.ice,V0=V(Math.PI/2);ctx.save();
  if(o.shatter!=null){ctx.translate(x,y);ctx.scale(sc,sc);splash(V0,[0,0,0],cl(o.shatter,0,1),o.big?9:6,o.big?2:1.4,T);ctx.restore();return}
  ctx.translate(x,y-(z||0));ctx.scale(sc,sc);icicleBig(V0,[0,0,0],o.big?58:26,o.big?12.5:5.2,T,{big:!!o.big});ctx.restore()};
// N3.yetiBall(x, y, r, spin, sc, o): the snowball of radius r resting on the floor at (x, y); spin: how far it has rolled (the lumps and the
// seam turn round the axis across o.dir, the angle on the floor it rolls along); o.p2: a crust of frost; o.shadow: its soft shadow
N3.yetiBall=function(x,y,r,spin,sc,o){o=o||{};sc=sc||1;r=r||14;const V0=V(Math.PI/2),a=o.dir||0;ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  if(o.shadow){ctx.fillStyle='rgba(16,22,40,.32)';ctx.beginPath();ctx.ellipse(0,1,r*1.05,r*.42,0,0,TAU);ctx.fill()}
  ballDraw(V0,[0,0,r],r,spin||0,[Math.sin(a),-Math.cos(a),0],!!o.p2);ctx.restore()};
// N3.yetiShard(x, y, z, a, sc, o): a faceted shard of ice 12 long flying along the angle a (on the screen), a short trail behind it
N3.yetiShard=function(x,y,z,a,sc,o){o=o||{};sc=sc||1;const T=o.p2?K2.ice:K1.ice;ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);ctx.rotate(a||0);
  if(!LOWFX){const g=ctx.createLinearGradient(-20,0,-3,0);g.addColorStop(0,'rgba(200,240,255,0)');g.addColorStop(1,'rgba(220,246,255,.7)');ctx.strokeStyle=g;ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(-3,0);ctx.stroke();shine('180,235,255',0,0,10,.4)}
  const pts=[[7,0],[2,-3.2],[-4.5,-2.6],[-6,.2],[-3.5,2.9],[2.5,2.8]];ctx.lineJoin='round';poly(pts);ctx.fillStyle=T.d;ctx.fill();
  ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(2,-3.2);ctx.lineTo(-4.5,-2.6);ctx.lineTo(-1,0);ctx.closePath();ctx.fillStyle=T.l;ctx.fill();
  ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(-1,0);ctx.lineTo(-3.5,2.9);ctx.lineTo(2.5,2.8);ctx.closePath();ctx.fillStyle=T.b;ctx.fill();
  poly(pts);ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();ctx.fillStyle='#ffffff';ball([3.5,-1],.9);ctx.fill();ctx.restore()};
// N3.yetiCrescent(x, y, a, w, k, sc, o): the crescent of frost w wide flying along the angle a (its middle on (x, y), a little over the floor):
// a white-blue arc with its front edge lit, three scratches inside, a little icicle at each end; k (0..1) its life: it comes within .1 and
// fades after .9
N3.yetiCrescent=function(x,y,a,w,k,sc,o){o=o||{};sc=sc||1;w=w||80;k=cl(k==null?.5:k,0,1);const al=sstep(0,.1,k)*(1-sstep(.9,1,k)),gr=.6+.4*sstep(0,.1,k);if(al<=.01)return;
  ctx.save();ctx.translate(x,y-10);ctx.scale(sc,sc);ctx.rotate(a||0);ctx.globalAlpha*=al;const h=w/2*gr,d=w*.24;
  if(!LOWFX){const g=ctx.createRadialGradient(d*.4,0,1,d*.4,0,h*1.1);g.addColorStop(0,'rgba(150,225,255,.35)');g.addColorStop(1,'rgba(150,225,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(d*.4,0,h*1.1,0,TAU);ctx.fill()}
  // the crescent: the outer arc in front, the inner one behind, thick in the middle and pointed at the ends
  ctx.beginPath();ctx.moveTo(-2,-h);ctx.quadraticCurveTo(d*2.4,0,-2,h);ctx.quadraticCurveTo(d*.35,0,-2,-h);ctx.closePath();
  const g2=ctx.createLinearGradient(-d*.2,0,d*1.3,0);g2.addColorStop(0,'#7cc6f2');g2.addColorStop(.55,'#d8f6ff');g2.addColorStop(1,'#ffffff');ctx.fillStyle=g2;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.lineJoin='round';ctx.stroke();
  ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(d*.1,-h*.8);ctx.quadraticCurveTo(d*2.05,0,d*.1,h*.8);ctx.stroke();
  // three scratches of the claws
  ctx.strokeStyle='rgba(40,100,170,.65)';ctx.lineWidth=1.3;for(const j of[-.42,0,.42]){ctx.beginPath();ctx.moveTo(d*.35,h*j-4);ctx.lineTo(d*.95,h*j+3);ctx.stroke()}
  // a little icicle at each end
  for(const sd of[-1,1]){ctx.fillStyle='#e6faff';ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,sd*(h-2));ctx.lineTo(-9,sd*(h+4));ctx.lineTo(2.5,sd*(h-5));ctx.closePath();ctx.fill();ctx.stroke()}
  ctx.restore()};
for(const n of['Icicle','Ball','Shard','Crescent'])N3['yeti2'+n]=N3['yeti'+n];

reg('yeti2',{n:'Yeti delle Vette',g:'boss',sc:1,an:MV.slice(),dur:Object.assign({},DUR),
  lab:{idle:'Fermo',walk:'Cammina',hit:'Colpito',leap:'Balzo del Gigante',bound:'Balzo corto',pound:'Pioggia di ghiaccioli',snowball:'La palla che cresce',breath:'Soffio gelido',
    gasp:'Senza fiato',roar:'Ruggito della valanga',claws:'Artigli di ghiaccio',rage:'Furia (fase 2)',taunt:'Presa in giro',enter:'Entrata',die:'Sconfitta'}},yeti2);
// «Prima e dopo»: the Yeti of today (kept now: once the game puts this model in place of N3.yeti, N3.yeti is the new one)
{const OLD=N3.yeti,M0=N3.meta.yeti;if(M0&&M0.old)N3.meta.yeti2.old=M0.old;else if(OLD&&M0&&OLD!==yeti2)N3.meta.yeti2.old=(x,y,f,a,pp)=>OLD(x,y,f,M0.an.includes(a)?a:'idle',pp,M0.sc||1,{})}
})();
