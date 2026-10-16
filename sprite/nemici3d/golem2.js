// IL GOLEM DI MUSCHIO rifatto: «il Colosso della Cripta» (Denis, 15 ottobre: «rivisita tutti i boss, rendili più creepy e fatti meglio sia
// da fermi che nelle animazioni», «un po' più cupi», «falli possenti, belli, fighi, che diano timore nello sfidarli»; si parte dal Golem).
// Un colosso di ardesia scolpito nella pietra della cripta, rimasto in ginocchio per secoli finché il muschio non l'ha coperto come un
// mantello: spalle enormi, testa bassa incassata, due occhi verde menta sotto un sopracciglio di pietra a V, pugni più grandi della testa
// appoggiati sulle nocche, una corona di cinque pietre ritte sulla schiena. Nel petto un cuore di runa che batte lento (tum-tum… silenzio):
// prima di ogni colpo la sua luce corre nelle vene di pietra fino al braccio o alle gambe che stanno per colpire (è il suo avviso). A metà
// vita il cuore si spacca e dentro c'è la lava. Resta della Classica: forme tonde da giocattolo, colori pieni, occhi con la lucina, due
// zannette, niente sangue né ferite. Metodo dello spaventapasseri: scheletro 3D proiettato con V(face), braccia e gambe a due ossa (ik),
// ordine di disegno dalla posa di riposo, testa con la sua telecamera; dipinto come la lanterna (tre toni, bordo caldo, bagliori morbidi).
// Mosse: idle, walk, hit, leap (Schianto), stuck (Pugni incastrati), throw (Frana), fault (Faglia), curl / roll / unroll (Valanga),
// beam (Raggio del Cuore, solo fase 2), rage (il cuore si spacca), taunt (Presa in giro), enter (il Risveglio), die (torna pietra).
// Opzioni: o.p2 (seconda fase), o.z (altezza data dal gioco nel salto), o.spin (giro della palla nella Valanga), o.bump (schiacciata
// del rimbalzo, da 1 a 0), o.noFx (niente effetti della mossa). Con LOWFX niente bagliori, sassi roventi, polvere né schegge, e le
// strisce e i ciuffi di muschio restano fermi.
// Disegni per il gioco con lo stesso aspetto: N3.golemSlab (la lastra), N3.golemRock (masso della Frana o spallaccio caduto),
// N3.golemFang (zanna della Faglia), N3.golemShard (scheggia rovente). Modello definitivo 'golem2' (dalla proposta A, golem2a.js, con le
// migliorie del direttore artistico): nel gioco prende il nome 'golem' (src/js/89-golem-nuovo.js). Rispetto ad A: nella Valanga le braccia
// restano piene (i massi delle spalle si rimpiccioliscono, i pugni affondano nella palla), faccia più bassa e avanti col sopracciglio a V
// più ripido (stringendo gli occhi scende solo la punta interna), spallacci a lastra curva più piccoli col bordo d'arenaria e la tacca di
// runa, muschio più cupo (luce solo in alto, bordo verde scuro), vene delle spalle ad arco sui fianchi del petto, pietre cadute dietro il
// cumulo, riapertura più morbida col rimbalzo, statua più grigia, nocche meno lucide; disegno più leggero (inviluppo filtrato, Path2D,
// cuscini di muschio e pietre ritte calcolati una volta).
// Revisione dopo i tre critici (direzioni, animazioni, «quanto è figo»): sopracciglio diviso per lato (quello lontano dietro il cranio e
// rientrato, mai sopra l'occhio), bocca aperta che si vede, spallacci come piastre a scudo attaccate al masso (niente scambi girando),
// massi delle spalle che affondano nel petto (tagliati dove entrano), pietre ritte piccole sulla gobba e tagliate dove la gobba le copre,
// braccio in quattro pezzi (omero, avambraccio col bracciale, gomito, pugno) ordinati da dove sta il pugno (alzato: alla sua altezza),
// pugni alti nello Schianto, testa indietro e cuore aperto in vista nei Pugni incastrati, fiatone vero nella riapertura, nocche e ciuffi
// che non sembrano facce, muschio delle spalle sfrangiato solo all'esterno, anelli delle ginocchia scuri, pittura più cupa col bordo caldo
// su tutti i pezzi grandi, radice del raggio sopra tutto, sassi roventi fuori dalle braccia (risucchiati dal cuore nel raggio, fermi da
// caduti), lastra grande come la buca, luce che corre con la perla e lava che dorme nella fase 2, pietra chiave e moncherini continui
// nella sconfitta.
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,tri,hull,rim,run,cmix,poly,bbox,
  sp,rotY,rotZ,look,blink,keys,sstep,hitK,frame,vol,ellPts,ellAt,ellN,AXES,caps,chain,disc3,leaf,eyes,floor,parts,reg,shine,smooth,chull,ik,stepper}=C;
const{shadeLimb}=C.R;

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
// phase 1: cold bluish slate (it stands out on the warm floor of the crypt), sandstone, moss, the mint light of the heart
const K1={slate:T3('#a3aeae','#6a767a','#3a4347'),gap:'#1f2529',stone:T3('#8e9a9c','#59656a','#2f373b'),paul:T3('#7d898e','#545f66','#2c353a'),knuck:T3('#9aa5a6','#808b8d','#525d61'),
  sand:T3('#dcc99c','#a8946a','#6b5a3c'),moss:T3('#82bc46','#4b822e','#2d5421'),mE:'#22401a',tip:'#c0e874',ember:'#c0e874',emberK:0,
  cap:'#dcfff2',stem:'#e9e2c8',capRgb:'140,255,210',capOpen:1,
  core:'#f0fff8',lite:'#6dffc0',glow:'90,255,170',off:'#2e6650',rs:T3('#4c585d','#2f373b','#1b2124'),
  hcore:'#f0fff8',hlite:'#6dffc0',hglow:'90,255,170',gem:T3('#e9fff6','#6dffc0','#1f8a62'),
  sock:'#101416',pupil:'#eafff6',eye:'110,255,190',tusk:'#e9e0c6',mouth:'#241a14',mlight:'90,255,170',dust:'196,184,160',candle:'#ffd27a',candleRgb:'255,190,90'};
// phase 2: blackened slate, lava in the cracks, the veins and the runes, orange eyes, scorched moss with embers, the mushrooms shut
const K2={slate:T3('#8a9293','#535b5e','#2a3033'),gap:'#161a1d',stone:T3('#78828a','#474f53','#262c30'),paul:K1.paul,knuck:T3('#848c8d','#646c6e','#3c4245'),
  sand:T3('#c4ad80','#8f7a52','#54452c'),moss:T3('#6f8a3a','#3b6526','#24401a'),mE:'#7a6a2e',tip:'#7a6a2e',ember:'#ffb347',emberK:1,
  cap:'#8aa39a',stem:'#a9a48e',capRgb:'0,0,0',capOpen:0,
  core:'#fff0b8',lite:'#ff7a2e',glow:'255,120,40',off:'#5a2416',rs:T3('#4a3e36','#2e2622','#1a1412'),
  hcore:'#fff4d6',hlite:'#ffb347',hglow:'255,140,50',gem:T3('#fff4d6','#ffb347','#c2461c'),
  sock:'#160c08',pupil:'#fff2c0',eye:'255,90,40',tusk:'#e2d6b8',mouth:'#241a14',mlight:'255,120,40',dust:'255,170,90',candle:'#ffd27a',candleRgb:'255,190,90'};
// a palette between the two phases (k2) and toward the grey of a statue (st): mixes are cached
const PALC={},STONE='#6b655c',COOL='#6b6f70';
function pal(k2,st){k2=Math.round(cl(k2,0,1)*24)/24;st=Math.round(cl(st,0,1)*24)/24;const id=k2+'|'+st;if(PALC[id])return PALC[id];const K={};
  for(const k in K1){const a=K1[k],b=K2[k];K[k]=typeof a==='number'?lerp(a,b,k2):typeof a==='string'?(a[0]==='#'?cmix(a,b,k2):mixRgb(a,b,k2)):mixT(a,b,k2)}
  if(st>0){const sT=t=>T3(cmix(t.l,STONE,st),cmix(t.b,STONE,st),cmix(t.d,STONE,st));for(const k of['slate','stone','paul','sand','moss','knuck','rs'])K[k]=sT(K[k]);for(const k of['tip','cap','stem','mE'])K[k]=cmix(K[k],STONE,st);K.off=cmix(K.off,STONE,Math.min(1,st*1.6))}
  return PALC[id]=K}
// the lava cooling to grey stone (the defeat of the second phase)
function cooled(K,c){if(c<=0)return K;const id='c'+Math.round(c*12);if(K[id])return K[id];return K[id]=Object.assign({},K,{lite:cmix(K.lite,COOL,c),core:cmix(K.core,COOL,c),hlite:cmix(K.hlite,COOL,c),hcore:cmix(K.hcore,COOL,c),off:cmix(K.off,'#3d4245',c)})}

// ------------------------------------------------------------------ the body at rest (x forward, y to its right, z up; 0,0,0 the floor point)
// the torso: chest, pelvis, hump in one convex volume; the ball it curls into
const TC=[[4,0,56],[-2,0,30],[-10,0,66]],TR=[[22,30,24],[16,21,14],[18,25,20]],BC=[0,0,33],BR=36,BRZ=32,BRR=[BR,BR,BRZ];
const HC=[23,0,68],HRD=[12.5,13.5,12];               // the head (its own frame round HC): low and pushed forward, sunk between the shoulders
const SHC=[0,34,70],SHR=[18,16,15],SHPAD=[3,3,4];      // the shoulder boulders (y × side), the cushion of moss grows them by SHPAD
const SHJ=[2,36,66],LUA=24,LFA=26;                     // the shoulder joint, upper arm, forearm
const FR=[14,13,12.5],HIP=[-4,15,30],LTH=13,LSH=13,FOOTR=[12,10,7];
const HM=nrm([.8,0,-.6]);                             // where the heart sits on the chest ellipsoid
// the five standing stones: base and lean at rest (t: the side it leans to, a: how much), height, radii, a twist, the chipped corner, the
// slot as a tooth of the ball (angle from the top toward the front), where it lies after the defeat
const SG=[{b:[-16,0,84],t:[-1,0,0],a:.21,h:26,r0:6.5,r1:4,tw:.2,chip:2,slot:0,lie:[-21,0,5.2],ld:[-1,0,0]},
  {b:[-12,-13,81],t:[0,-1,0],a:.38,h:19,r0:5.2,r1:3.2,tw:.5,chip:5,slot:1.257,lie:[-25,-6,4.2],ld:[-.951,-.309,0]},
  {b:[-12,13,81],t:[0,1,0],a:.38,h:19,r0:5.2,r1:3.2,tw:.1,chip:1,slot:-1.257,lie:[-25,6,4.2],ld:[-.951,.309,0]},
  {b:[-12,-20,76],t:[0,-1,0],a:.56,h:12,r0:4,r1:2.6,tw:.35,chip:6,slot:2.513,lie:[-31,-10,3.2],ld:[-.866,-.5,0]},
  {b:[-12,20,76],t:[0,1,0],a:.56,h:12,r0:4,r1:2.6,tw:.7,chip:3,slot:-2.513,lie:[-31,10,3.2],ld:[-.866,.5,0]}];
for(const s of SG)s.d=nrm(add(mul([0,0,1],Math.cos(s.a)),mul(s.t,Math.sin(s.a))));
// the strips of moss hanging from each cushion: angle from the front toward the outside, length
const STRIPS=[[1.25,14],[2.0,16],[2.6,12]];
// the strands under the mantle of the hump: angle round, elevation, length
const STRANDS=[[2.72,.36,13],[3.3,.3,15],[3.85,.4,11]];
// the mound of moss-covered boulders it crumbles into when it is defeated: [x, y, z, r]
const MOUND=[[0,0,16,21],[-12,-14,12,16],[-12,14,12,16],[9,-16,10,14],[9,16,10,14],[-5,0,30,15]];
// the little white flowers that open on the moss of the mound: [boulder, direction on it, size]
const MFLOW=[[3,[.35,-.2,1],1],[4,[.42,.25,1],.85],[1,[.15,-.4,1],.9]];

// ------------------------------------------------------------------ marks on the torso: veins, cracks, chisel marks
// where the ray from O3 along r leaves the torso (the union of its ellipsoids): the point and the normal there
const O3=[0,0,46];
function tsurf(r,Cs,Rs){let best=-1e9,bi=0;for(let i=0;i<Cs.length;i++){const C0=Cs[i],R=Rs[i],o=[(O3[0]-C0[0])/R[0],(O3[1]-C0[1])/R[1],(O3[2]-C0[2])/R[2]],d=[r[0]/R[0],r[1]/R[1],r[2]/R[2]];
    const a=dot(d,d),b=2*dot(o,d),c=dot(o,o)-1,D=b*b-4*a*c;if(D<0)continue;const t=(-b+Math.sqrt(D))/(2*a);if(t>best){best=t;bi=i}}
  const p=add(O3,mul(r,Math.max(0,best))),C0=Cs[bi],R=Rs[bi];return{p,n:nrm([(p[0]-C0[0])/(R[0]*R[0]),(p[1]-C0[1])/(R[1]*R[1]),(p[2]-C0[2])/(R[2]*R[2])])}}
// a path over the torso through key points [ellipsoid, direction] (sub-samples between them), as rays from O3 with their length fractions
function mkPath(ks,n){const G=ks.map(([i,m])=>ellAt(TC[i],TR[i],AXES,nrm(m))),rays=[];for(let k=0;k<G.length-1;k++)for(let j=0;j<n;j++)rays.push(nrm(sub(lerp3(G[k],G[k+1],j/n),O3)));
  rays.push(nrm(sub(G[G.length-1],O3)));const rest=rays.map(r=>tsurf(r,TC,TR));let Lt=0;const f=[0];for(let k=1;k<rest.length;k++){Lt+=len(sub(rest[k].p,rest[k-1].p));f.push(Lt)}
  return{rays,rest,f:f.map(v=>v/(Lt||1))}}
// the six veins from the heart: 0-1 up to the shoulders (left, right) in two arcs along the flanks of the chest (seen from the front),
// 2-3 down to the hips, 4-5 round under the ribs
const VEINS=([
  mkPath([[0,HM],[0,dir(-.55,-.06)],[0,dir(-1.1,.45)]],4),mkPath([[0,HM],[0,dir(.55,-.06)],[0,dir(1.1,.45)]],4),
  mkPath([[0,HM],[0,dir(-.35,-.85)],[1,dir(-.6,-.2)]],4),mkPath([[0,HM],[0,dir(.35,-.85)],[1,dir(.6,-.2)]],4),
  mkPath([[0,HM],[0,dir(-1.3,-.3)],[0,dir(-1.9,-.1)]],4),mkPath([[0,HM],[0,dir(1.3,-.3)],[0,dir(1.9,-.1)]],4)]);
// the five cracks: front left flank, front right flank, middle of the back, left of the back, right of the pelvis
const CRACKS=[mkPath([[0,dir(-1,.25)],[0,dir(-.8,.05)],[0,dir(-.7,-.15)]],3),mkPath([[0,dir(1.1,.3)],[0,dir(.9,.12)],[0,dir(.95,-.08)]],3),
  mkPath([[2,dir(3.05,.12)],[2,dir(3.22,-.12)],[1,dir(3.08,.3)],[1,dir(3.2,.02)]],3),mkPath([[2,dir(-2.55,.05)],[2,dir(-2.4,-.25)],[1,dir(-2.5,.1)]],3),mkPath([[1,dir(1.8,0)],[1,dir(2,-.3)]],3)];
// four chisel marks, barely there, on the front of the chest
const CHISEL=[mkPath([[0,dir(-.42,.36)],[0,dir(-.3,.44)]],2),mkPath([[0,dir(.32,.5)],[0,dir(.46,.42)]],2),mkPath([[0,dir(.6,.06)],[0,dir(.66,.2)]],2),mkPath([[0,dir(-.62,-.02)],[0,dir(-.54,.1)]],2)];
// the cracks of the ball: directions in the ball's own frame (they turn with it)
const BCRACKS=[[[.5,.3,.81],[.62,.15,.77],[.7,.22,.68]],[[-.3,-.62,.72],[-.42,-.7,.58],[-.38,-.8,.46]],[[-.8,.42,-.42],[-.66,.5,-.56],[-.7,.62,-.35]],[[.2,-.6,-.77],[.32,-.72,-.62]]].map(c=>c.map(nrm));
// the samples of a path on the torso now (Cs, Rs: the torso's ellipsoids, null = at rest): screen point, facing, fraction
function pathNow(V0,X,pa,Cs,Rs){const out=[];for(let i=0;i<pa.rays.length;i++){const s=Cs?tsurf(pa.rays[i],Cs,Rs):pa.rest[i];out.push({q:V0.P(X.T(s.p)),v:V0.F(X.Rd(s.n)),f:pa.f[i]})}return out}
// the runs of the samples that face us, only between the fractions a and b
function runsIn(S,a,b,v0){const out=[];let cur=[];const cut=()=>{if(cur.length>1)out.push(cur);cur=[]};
  for(let i=1;i<S.length;i++){const r=S[i-1],s=S[i],lo=Math.max(a,r.f),hi=Math.min(b,s.f);if(hi<=lo||(r.v+s.v)/2<=v0){cut();continue}
    const k0=(lo-r.f)/((s.f-r.f)||1),k1=(hi-r.f)/((s.f-r.f)||1),q0=[lerp(r.q[0],s.q[0],k0),lerp(r.q[1],s.q[1],k0)],q1=[lerp(r.q[0],s.q[0],k1),lerp(r.q[1],s.q[1],k1)];
    if(!cur.length)cur.push(q0);cur.push(q1);if(hi<s.f)cut()}cut();return out}
// a crack: a dark line with a thin lit lip under it; lava (grown to the fraction lv) over it in the second phase
function crackDraw(S,K,lv,cool){const R=runsIn(S,0,1,.04);if(!R.length)return;strokeRuns(R.map(r=>r.map(q=>[q[0]+.7,q[1]+.9])),'rgba(255,248,230,.17)',1.2);strokeRuns(R,'rgba(22,18,16,.78)',1.6);
  if(lv>0){const L=runsIn(S,0,lv,.04);if(!L.length)return;if(!LOWFX&&cool<1){ctx.save();ctx.globalCompositeOperation='lighter';strokeRuns(L,`rgba(${K.glow},${.38*(1-cool)})`,4.4);ctx.restore()}
    strokeRuns(L,K.lite,2);strokeRuns(L,K.core,.8)}}
// a vein: a groove with a thread of light in it (always seen); lit from the heart outward between the fractions of w = [tail, head, alpha]
function veinLit(S,K,w){if(!w||w[2]<=.01||w[1]<=w[0])return;const L=runsIn(S,w[0],w[1],.05);if(!L.length)return;ctx.save();ctx.globalAlpha*=w[2];
  if(!LOWFX){ctx.globalCompositeOperation='lighter';strokeRuns(L,`rgba(${K.glow},.35)`,5);ctx.globalCompositeOperation='source-over'}strokeRuns(L,K.lite,2.6);strokeRuns(L,K.core,1);
  // the head of the light while it runs: a pearl of light
  if(w[1]<.995&&w[2]>.3){const r=L[L.length-1],q=r[r.length-1];if(!LOWFX)shine(K.glow,q[0],q[1],9,.5);ctx.fillStyle=K.core;ball(q,2.5);ctx.fill()}ctx.restore()}

// ------------------------------------------------------------------ the moves (every one depends only on p; idle and walk close on themselves)
const MV=['idle','walk','hit','leap','stuck','throw','fault','curl','roll','unroll','beam','rage','taunt','enter','die'];
const DUR={idle:3,walk:1.2,hit:.6,leap:1.8,stuck:1,throw:1.6,fault:1.4,curl:.8,roll:1,unroll:1,beam:3.1,rage:2.8,taunt:1,enter:3.2,die:4};
const H0L=[16,-41,13],H0R=[16,41,13],CF0L=[8,-10,33],CF0R=[8,10,33];   // the fists at rest; tucked into the ball
// the pop of the ball opening (k 0..1): it bursts out at an even pace (the least change from one frame to the next), slows down to 6% past
// the end at k .7, then settles back to 1
const popK=k=>{if(k<=0)return 0;if(k>=1)return 1;if(k<.7){const u=k/.7,a=2/1.6;return 1.06*(u<.6?a*u:a*.6+a*(u-.6)-a*(u-.6)*(u-.6)/.8)}return 1.06-.06*sstep(.7,1,k)};
const kv=(K,p)=>keys(K,p),v3=(K,p)=>keys(K,p);
function gPose(anim,p,o){const ph=p*TAU,P2=!!o.p2&&anim!=='enter',A={B:[0,0,0],lean:0,roll:0,s:0,sx:0,yaw:0,lift:0,hy:0,hp:0,hx:0,hz:0,jaw:0,brow:0,blink:1,squint:0,eyeL:1,eyeR:1,glow:1,
    hL:H0L.slice(),hR:H0R.slice(),fL:[3,-18,0],fR:[3,18,0],heart:0,hg:1,dslide:0,drot:0,gem:0,gspin:0,keyCrack:P2?1:0,
    vein:[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],brL:0,brR:0,fiL:0,fiR:0,kn:0,sr:0,shL:0,shR:0,sway:0,mb:0,st:[0,0,0,0,0],
    curl:0,spin:0,k2:P2?1:0,grp:null,statue:0,stg:null,cool:0,lava:P2?1:0,paul:P2?0:1,pfly:-1,rocks:P2?1:0,rockFall:0,candle:P2?[1,1,1,1,1]:[0,0,0,0,0],
    wflash:0,beam:0,tufts:0,tfall:-1,mossX:1,fall:[0,0,0,0,0],drop:0,fistOff:0,crumble:0,key:-1,keyGlow:0,flowers:0,armIn:0,fx:[]};
  const beat=(c,a,w)=>{A.heart=Math.max(A.heart,(a==null?1:a)*pls(p,c,w||.06))};
  const fx=(k,t,o2)=>{if(t>=0&&t<1)A.fx.push(Object.assign({k,t},o2||{}))};
  const allLit=k=>{for(let i=0;i<6;i++)A.vein[i]=[0,k,k>0?1:0];A.brL=A.brR=A.fiL=A.fiR=A.kn=k;A.sr=Math.max(A.sr,k)};
  if(anim==='walk'){const st=stepper(p,.5),a=st(0,11,5),b=st(.5,11,5);A.fR=[3+a.x,18,a.z];A.fL=[3+b.x,-18,b.z];
    const imp=Math.max(0,Math.cos(TAU*2*(p-.04)));A.B=[0,0,-2*imp];A.s=-.03*imp;beat(.03,.3,.08);beat(.53,.3,.08);
    A.roll=-.07*Math.sin(ph);A.yaw=.06*Math.sin(ph);A.lean=.1;A.sway=.15*Math.sin(TAU*2*(p-.1));A.mb=.25*imp;
    if(P2){// on its knuckles like a gorilla: the left fist goes with the right foot, the right fist with the left foot
      A.lean=.2;A.B[2]-=3;const c1=st(0,9,6),c2=st(.5,9,6);A.hL=[20+c1.x,-41,13+c1.z];A.hR=[20+c2.x,41,13+c2.z];
      for(const[c,sd] of[[0,-1],[.5,1]])fx('dust',(((p-c)%1+1)%1)/.12,{at:[29+9,sd*41,0],n:4,r:6})}
    else{const sw=-Math.cos(TAU*(p-.08)),xR=9*sw,xL=-9*sw,zf=x=>13+2.5*(x/9)*(x/9)+1.5*Math.max(0,x/9);A.hR=[16+xR,41,zf(xR)];A.hL=[16+xL,-41,zf(xL)];
      for(const c of[.33,.83])for(const sd of[-1,1])fx('dust',(((p-c)%1+1)%1)/.14,{at:[24,sd*43,0],n:3,r:4,al:.35})}
    for(const[c,sd] of[[0,1],[.5,-1]])fx('dust',(((p-c)%1+1)%1)/.16,{at:[14,sd*18,0],n:5,r:9})}
  else if(anim==='leap'){// SCHIANTO: crouches (the light runs down into the legs), springs up (.333), raises both fists over the head, hammers
    // them down (.833) and stays with them in the floor (the next move is 'stuck')
    const K=[[0,[0,0,0,16,41,13,0]],[.12,[-.06,.08,-2,6,41,16,.25]],[.30,[-.18,.22,-6,-12,40,20,.5]],[.333,[-.18,.22,-6,-12,40,20,.5]],
      [.37,[.12,.06,0,6,54,44,.3]],[.41,[.11,-.01,0,6,44,94,.2]],[.45,[.10,-.04,0,0,22,124,.1]],[.70,[.06,-.04,0,0,24,124,.2]],[.80,[.02,.15,0,26,20,40,.5]],
      [.833,[-.24,.30,-4,24,18,12,.6]],[.9,[-.2,.22,-6,25,18,8,.4]],[1,[-.16,.16,-7,26,18,4,.3]]];
    const v=kv(K,p);A.s=v[0];A.lean=v[1];A.B=[0,0,v[2]];A.hR=[v[3],v[4],v[5]];A.hL=[v[3],-v[4],v[5]];A.squint=v[6];
    beat(.06,1,.07);beat(.18,1,.07);
    {const hd=sstep(.10,.20,p),al=1-sstep(.38,.48,p);if(p>.1)A.vein[2]=A.vein[3]=[0,hd,al];A.kn=sstep(.20,.28,p)*(1-sstep(.4,.5,p))}
    {const hd=sstep(.40,.47,p),al=1-sstep(.86,.96,p);if(p>.4)A.vein[0]=A.vein[1]=[0,hd,al];A.brL=A.brR=sstep(.45,.50,p)*al;A.fiL=A.fiR=sstep(.50,.55,p)*al}
    const up=sstep(.10,.30,p)*(1-sstep(.36,.5,p));A.st=A.st.map(()=>.17*up);A.sr=Math.max(A.heart,up*.7);
    if(p>.22&&p<.333)A.B[1]=.6*trem(p,.22,.333,8,1.8);
    const air=p>.333&&p<.833?Math.sin((p-.333)/.5*Math.PI):0;A.lift=34*air;
    if(p>.333&&p<.833){const k=sstep(.333,.42,p)*(1-sstep(.76,.833,p));A.fL=[3,-18,8*k];A.fR=[3,18,8*k]}
    A.jaw=.6*rise(p,.43,.48,.68,.74);
    if(p>=.833){const k=(p-.833)/.167;A.mb=Math.exp(-k*4)*Math.cos(k*13)}
    fx('dust',(p-.25)/.12,{at:[2,0,0],n:7,r:24,al:.4});fx('dust',(p-.833)/.167,{at:[32,20,0],n:6,r:11});fx('dust',(p-.833)/.167,{at:[32,-20,0],n:6,r:11});
    A.heart=Math.max(A.heart,flash(p,.833,.08));A.hg=1+.6*Math.max(pls(p,.06,.07),pls(p,.18,.07))+flash(p,.833,.12)}
  else if(anim==='stuck'){// PUGNI INCASTRATI: the fists are in the floor up to the wrists, the keystone half open and shining; two tugs, then
    // it tears them out (.78), the doors shut with a thud and it shrugs twice
    const K=[[0,[.16,-.16,-7]],[.78,[.16,-.16,-7]],[.86,[.06,-.04,-1]],[1,[0,0,0]]],v=kv(K,p);A.lean=v[0];A.s=v[1];A.B=[0,0,v[2]];
    const yank=Math.max(pls(p,.27,.08),pls(p,.57,.08));A.B[0]-=3*yank;A.roll=.04*yank*(p<.4?1:-1);A.lean-=.04*yank;
    const HK=[[0,[26,18,4]],[.78,[26,18,4]],[.84,[24,30,22]],[.94,[18,38,15]],[1,[16,41,13]]],h=v3(HK,p);A.hR=h;A.hL=[h[0],-h[1],h[2]];
    if(p<.78){A.hR[2]+=1.5*yank;A.hL[2]+=1.5*yank}
    const op=sstep(0,.15,p)*(1-sstep(.80,.84,p));A.dslide=3*op;A.hg=1+.8*op;A.heart=.55*op+.35*pls(p,.84,.05);A.squint=.3*op;A.sr=A.heart;
    {const hb=sstep(.02,.15,p)*(1-sstep(.78,.86,p));A.hx-=6*hb;A.hz+=3*hb;A.hp-=.35*hb}
    A.shL=A.shR=3*(pls(p,.89,.06)+pls(p,.96,.06));A.mb=.3*yank;
    fx('pebs',(p-.25)/.18,{at:[26,0,0]});fx('pebs',(p-.55)/.18,{at:[26,0,0]});fx('clods',(p-.78)/.2,{at:[26,18,0]});fx('clods',(p-.78)/.2,{at:[26,-18,0]});
    fx('pebs',(p-.89)/.11,{at:[2,34,84],fall:1});fx('pebs',(p-.89)/.11,{at:[2,-34,84],fall:1})}
  else if(anim==='throw'){// FRANA: the light runs down the left arm; the fist goes into the floor and tears out a whole slab (.20), both hands
    // lift it over the head, it trembles there, then it is hurled with the whole body (.50); a clap of the hands to clean them
    const K=[[0,[0,0,0]],[.14,[.18,-.2,-.06]],[.28,[.16,-.12,-.04]],[.42,[-.06,0,.04]],[.48,[-.1,0,.03]],[.50,[.28,0,-.04]],[.75,[.28,0,-.04]],[.90,[.05,0,0]],[1,[0,0,0]]];
    const v=kv(K,p);A.lean=v[0];A.yaw=v[1];A.s=v[2];
    A.hL=v3([[0,[16,-41,13]],[.14,[30,-22,10]],[.20,[30,-22,4]],[.30,[29,-25,13]],[.42,[10,-20,100]],[.48,[6,-20,102]],[.50,[28,-20,100]],[.56,[56,-28,42]],[.75,[52,-28,36]],
      [.88,[24,-24,40]],[.91,[26,-5,40]],[.93,[26,-10,43]],[.95,[26,-5,40]],[.97,[20,-30,25]],[1,[16,-41,13]]],p);
    A.hR=v3([[0,[16,41,13]],[.14,[20,40,16]],[.30,[29,4,15]],[.42,[10,20,100]],[.48,[6,20,102]],[.50,[28,20,100]],[.56,[56,28,42]],[.75,[52,28,36]],
      [.88,[24,24,40]],[.91,[26,5,40]],[.93,[26,10,43]],[.95,[26,5,40]],[.97,[20,30,25]],[1,[16,41,13]]],p);
    if(p>.42&&p<.48){const t=.7*trem(p,.42,.48,8,1.6);A.B[1]=t;A.hL[2]+=t;A.hR[2]+=t}
    A.vein[0]=[0,sstep(0,.05,p),1-sstep(.5,.6,p)];A.brL=sstep(.05,.09,p)*(1-sstep(.5,.6,p));A.fiL=sstep(.09,.14,p)*(1-sstep(.5,.6,p));
    A.heart=Math.max(.6*rise(p,.28,.34,.5,.56),pls(p,.03,.06));A.sr=A.heart;A.squint=.5*rise(p,.1,.2,.5,.6);A.jaw=.35*rise(p,.46,.49,.54,.62);
    {const k=sstep(.50,.56,p)*(1-sstep(.9,1,p));A.fL=[3+8*k,-18,2.5*Math.sin(Math.PI*sstep(.5,.56,p))*(p<.56?1:0)]}
    // the slab: up out of the floor into both hands, over the head, away (the game draws it from .52)
    if(p>=.2&&p<.52){let c,tilt=0;const mid=lerp3(A.hL,A.hR,.5);
      if(p<.3){const k=ez((p-.2)/.1);c=lerp3([30,-22,-7],add(mid,[2,0,15]),k);tilt=.35*Math.sin(k*Math.PI)}
      else if(p<.48)c=add(mid,[2,0,15]);else{const k=(p-.48)/.04;c=lerp3(add(lerp3(A.hL,A.hR,.5),[2,0,15]),[52,0,120],ez(cl(k,0,1)));tilt=-.25*cl(k,0,1)}
      if(p<.5||fxOn(o))A.slab={c,tilt,k:sstep(.2,.24,p)};
      fx('dirt',(p-.24)/.24,{slab:1})}
    fx('fcrack',(p-.14)/.3,{at:[30,-22,0]});fx('dust',(p-.2)/.16,{at:[30,-22,0],n:5,r:10});
    for(const c of[.91,.95])fx('dust',(p-c)/.06,{at:[26,0,40],n:4,r:5,al:.45})}
  else if(anim==='fault'){// FAGLIA: the light runs down the right arm, the fist goes up over the shoulder (leaning back), then it is driven into
    // the floor up to the wrist (.45-.50); held, then torn out (.70-.78)
    const K=[[0,[0,0,0]],[.05,[-.02,0,0]],[.40,[-.12,.15,.02]],[.45,[-.12,.15,.02]],[.50,[.25,0,-.15]],[.70,[.25,0,-.12]],[.78,[.15,0,-.06]],[1,[0,0,0]]];
    const v=kv(K,p);A.lean=v[0];A.yaw=v[1];A.s=v[2];
    A.hR=v3([[0,[16,41,13]],[.05,[16,46,20]],[.16,[16,56,46]],[.28,[8,48,86]],[.40,[-2,36,118]],[.45,[0,36,120]],[.475,[24,34,66]],[.50,[30,22,2]],[.70,[30,22,2]],[.78,[24,32,22]],[1,[16,41,13]]],p);
    A.hL=v3([[0,[16,-41,13]],[.08,[18,-40,13]],[.85,[18,-40,13]],[1,[16,-41,13]]],p);
    A.vein[1]=[0,sstep(0,.05,p),1-sstep(.55,.7,p)];A.brR=sstep(.05,.10,p)*(1-sstep(.55,.7,p));A.fiR=sstep(.10,.16,p)*(1-sstep(.55,.7,p));
    A.squint=.6*rise(p,.05,.12,.5,.6);A.jaw=.25*rise(p,.1,.2,.45,.52);beat(.03,.8,.06);A.heart=Math.max(A.heart,flash(p,.5,.08));A.hg=1+flash(p,.5,.1);A.sr=A.heart;
    if(p>.5&&p<.7){const t=.5*trem(p,.5,.7,7,1.4);A.B[1]=t;A.shR=.8*t}
    fx('dust',(p-.48)/.2,{at:[34,22,0],n:8,r:14});fx('clods',(p-.70)/.2,{at:[30,22,0]})}
  else if(anim==='curl'||anim==='roll'){// VALANGA: it lights up all over, tucks the head into the chest, wraps its arms round the body and becomes
    // a ball with the standing stones for teeth; it spins on the spot (curl), then rolls (roll, the game turns it with o.spin)
    if(anim==='curl'){const pre=sstep(0,.3,p),c=ez(cl((p-.25)/.35,0,1));A.curl=c;allLit(sstep(0,.15,p)*(1-c));A.sr=1;
      A.s=-.12*pre*(1-c);A.lean=.2*pre*(1-c);A.squint=.7*pre;A.hx=-8*c;A.hz=-26*c;
      const w=sstep(.2,.55,p),tk=sstep(.6,.97,c);A.hL=lerp3(lerp3(H0L,[16,-18,30],w),CF0L,tk);A.hR=lerp3(lerp3(H0R,[16,18,30],w),CF0R,tk);A.fL=lerp3([3,-18,0],[0,-12,14],c);A.fR=lerp3([3,18,0],[0,12,14],c);A.armIn=c;
      A.spin=p<.6?0:-TAU*(1-ez((p-.6)/.4));if(p>.6)A.B[0]=2*Math.sin(TAU*4*(p-.6)*.8)*(1-sstep(.9,1,p));
      fx('dust',(p-.6)/.4*2%1,{at:[6,0,0],n:6,r:24,al:.4});fx('dust',((p-.6)/.4*2+.5)%1*(p>.6?1:-1),{at:[-6,0,0],n:6,r:20,al:.35})}
    else{A.curl=1;A.armIn=1;A.spin=o.spin!=null&&o.spin!==0?o.spin:p*TAU;A.B=[0,0,2.5*Math.abs(Math.sin(2*ph))];const bm=cl(o.bump||0,0,1);A.sx=-.18*bm;A.s=.1*bm;A.sr=1;
      A.hx=-8;A.hz=-26;A.hL=CF0L.slice();A.hR=CF0R.slice();A.fL=[0,-12,14];A.fR=[0,12,14];
      fx('dust',(p*2)%1,{at:[-28,0,0],n:5,r:16,al:.45});fx('dust',(p*2+.5)%1,{at:[-34,0,0],n:4,r:12,al:.35})}}
  else if(anim==='unroll'){// SI RIAPRE: pop! (0-.26: the ball bursts open past its size by 6% and settles) the stones stand up again one after
    // the other (.02 apart, as in the entrance), the head comes out; it gets its breath back crouched on its knuckles, then shakes the dust
    // off its shoulders
    const POP=.26,k=cl(p/POP,0,1),f=popK(k),c=1-f;A.curl=Math.max(0,c);A.armIn=A.curl;A.spin=o.spin||0;
    A.stc=[0,1,2,3,4].map(i=>Math.max(0,1-popK(cl((p-.02*i)/POP,0,1))));
    const crouch=sstep(.1,.26,p)*(1-sstep(.75,.95,p)),env=sstep(.26,.32,p)*crouch,br=p>.26&&p<.75?Math.sin(TAU*6.12*(p-.26)):0;
    A.s=-.08*crouch+.045*br*env+Math.max(0,-c);A.lean=.15*crouch;A.B=[0,0,-3*crouch];
    A.hx=-8*A.curl;A.hz=-26*A.curl+2*Math.sin(Math.PI*cl((p-.12)/.16,0,1));
    A.st=[0,1,2,3,4].map(i=>2.3*Math.max(0,popK(cl((p-.02*i)/POP,0,1))-1));
    const out=sstep(.06,.24,p);A.hL=lerp3(lerp3(CF0L,[20,-40,13],out),H0L,sstep(.78,1,p));A.hR=lerp3(lerp3(CF0R,[20,40,13],out),H0R,sstep(.78,1,p));
    A.fL=lerp3([0,-12,14],[3,-18,0],sstep(0,.7,k));A.fR=lerp3([0,12,14],[3,18,0],sstep(0,.7,k));
    const hb=sstep(.2,.3,p)*(1-sstep(.7,.8,p));
    A.hy=.15*Math.sin(TAU*1.6*(p-.26))*(1-sstep(.45,.75,p))*sstep(.26,.3,p);A.hp=.12*crouch-.1*br*env-.25*hb;A.hx-=5*hb;A.jaw=.2*Math.max(0,-br)*env;A.squint=.6*crouch;A.sr=.6*(1-sstep(.12,.32,p));
    A.shL=A.shR=2.5*Math.max(0,br)*env+3*(pls(p,.82,.06)+pls(p,.92,.06));
    fx('dust',(p-.04)/.3,{at:[0,0,0],n:9,r:30,al:.45});
    for(const c2 of[.35,.51,.67])fx('mouth',(p-c2)/.12,{steam:P2,big:1});
    fx('pebs',(p-.82)/.16,{at:[2,34,84],fall:1});fx('pebs',(p-.82)/.16,{at:[2,-34,84],fall:1})}
  else if(anim==='beam'){// RAGGIO DEL CUORE (second phase): feet planted wide, arms open, the keystone opens like two doors, the gem spins and
    // swells; locked (.417, two flashes), the beam (.646-.854: the model draws only its root at the heart), the doors slam shut
    A.k2=1;A.lava=1;A.paul=0;A.rocks=1;A.candle=[1,1,1,1,1];A.keyCrack=1;
    const w=sstep(0,.10,p)*(1-sstep(.9,1,p)),ar=sstep(0,.15,p)*(1-sstep(.88,1,p));A.fL=[3,-18-6*w,2*Math.sin(Math.PI*cl(p/.1,0,1))*(p<.1?1:0)];A.fR=[3,18+6*w,2*Math.sin(Math.PI*cl((p-.02)/.1,0,1))*(p>.02&&p<.12?1:0)];
    A.hL=lerp3(H0L,[14,-80,40],ar);A.hR=lerp3(H0R,[14,80,40],ar);
    const tr=(p<.646?sstep(.15,.417,p):p<.854?1.2:1-sstep(.854,.9,p))*Math.sin(TAU*7*p*3.1),tr2=Math.sin(TAU*7*p*3.1+1.7);A.hL[2]+=tr;A.hR[2]+=tr2*Math.abs(tr)/1.2*1.2;
    const op=sstep(.05,.25,p)*(1-sstep(.86,.90,p));A.drot=1.05*op;A.dslide=4*op;A.gem=sstep(.05,.417,p)*(1-sstep(.86,.9,p));A.gspin=p*3.1*7;
    A.squint=1*rise(p,.05,.15,.86,.92);A.lean=-.05*ar;A.heart=.5+.5*op;A.hg=1+.6*op+flash(p,.417,.08)+.8*flash(p,.45,.04)+.8*flash(p,.52,.04);A.sr=A.heart;
    allLit(.8*op);
    if(p>=.646&&p<.854){const k=(p-.646)/.208;A.beam=Math.sin(Math.PI*Math.min(1,k*1.2))||.001;A.B[0]=-3*sstep(.646,.68,p);A.lean-=.1*sstep(.646,.68,p)}
    else if(p>=.854){A.B[0]=-3*(1-sstep(.854,.95,p));A.lean-=.1*(1-sstep(.854,.95,p))}
    A.jaw=Math.max(A.jaw,.4*rise(p,.62,.66,.84,.88));
    {const k=sstep(.04,.3,p)*(1-sstep(.9,1,p));A.rockIn=k;A.rocks=1-sstep(.75,1,k)}
    fx('suck',(p-.05)/.37);fx('steam',(p-.86)/.14)}
  else if(anim==='rage'){// IL CUORE SI SPACCA: staggers back, falls on the right knee, the keystone cracks with a white flash, the green turns
    // orange from the heart outward, the pauldrons fly off, it rises with the arms wide (the tips of the stones light up like candles), it roars
    const K=[[0,[0,0,0,0]],[.12,[-.12,-3,0,0]],[.22,[.15,0,-10,0]],[.45,[.15,0,-10,0]],[.62,[0,0,0,.02]],[.66,[-.04,0,0,.04]],[.70,[-.08,0,0,.06]],[.92,[-.08,0,0,.06]],[1,[.08,0,-1,0]]];
    const v=kv(K,p);A.lean=v[0];A.B=[v[1],0,v[2]];A.s=v[3];
    if(p<.12)A.heart=.5+.5*Math.abs(Math.sin(p*26));
    A.fR=v3([[0,[3,18,0]],[.12,[3,18,0]],[.22,[-14,18,0]],[.45,[-14,18,0]],[.62,[3,18,0]],[1,[3,18,0]]],p);
    A.hR=v3([[0,[16,41,13]],[.12,[10,44,20]],[.22,[24,34,12]],[.45,[24,34,12]],[.62,[6,56,48]],[.92,[6,56,48]],[1,[16,41,13]]],p);
    A.hL=v3([[0,[16,-41,13]],[.12,[10,-44,20]],[.22,[16,-40,14]],[.45,[16,-40,14]],[.62,[6,-56,48]],[.92,[6,-56,48]],[1,[16,-41,13]]],p);
    const kH=sstep(.22,.30,p),kB=sstep(.22,.40,p),kM=sstep(.30,.40,p),kE=sstep(.31,.33,p),kS=sstep(.34,.36,p);A.k2=kB;A.grp={h:kH,b:kB,m:kM,e:kE,s:kS,t:kB};
    A.lava=sstep(.28,.40,p);A.keyCrack=sstep(.22,.24,p);A.wflash=flash(p,.22,.05);
    A.paul=p<.42?1:0;A.pfly=p>=.42&&p<.62?(p-.42)/.2:-1;
    A.candle=[.50,.53,.56,.59,.62].map(t=>sstep(t,t+.02,p));
    const roar=rise(p,.66,.72,.88,.94);A.hp=-.3*roar+.1*rise(p,.12,.2,.4,.5);A.jaw=.45*roar;A.hg=1+1.2*roar+.5*kH;A.heart=Math.max(A.heart,.4+.6*roar,kH*.5);A.squint=.4*rise(p,.12,.16,.6,.66);
    A.sr=Math.max(A.heart*.6,kH);allLit(Math.max(.3*kH,roar)*(p>.22?1:0));
    if(p>.66&&p<.92)A.B[1]=.4*trem(p,.66,.92,7,2.8);
    {const e2=sstep(.92,1,p);A.hz-=3*e2;A.hp+=.08*e2;A.rocks=sstep(.92,.98,p);A.rockFall=1-sstep(.94,1,p)}
    fx('pdust',(p-.62)/.25);fx('ring',(p-.68)/.22,{rgb:'255,170,90'});fx('steam',(p-.3)/.25)}
  else if(anim==='hit'){const k=hitK(p);A.lean=-.1*k;A.B=[-3*k,0,0];A.hp=-.15*k;A.squint=.8*(1-sstep(.36,.44,p));A.heart=.6*(pls(p,.1,.06)+pls(p,.22,.06));A.sr=A.heart;
    A.hL[0]-=3*k;A.hR[0]-=3*k;fx('chips',p/.4)}
  else if(anim==='taunt'){// PRESA IN GIRO: stands tall looking down at you, thumps the right side of its chest twice, then a laugh of dust
    const K=[[0,[0,0,0]],[.15,[.05,-.1,.12]],[.85,[.05,-.1,.12]],[1,[0,0,0]]],v=kv(K,p);A.s=v[0];A.lean=v[1];A.hp=v[2];
    A.hR=v3([[0,[16,41,13]],[.15,[46,20,66]],[.24,[46,20,66]],[.28,[36,12,56]],[.34,[44,19,64]],[.42,[46,20,66]],[.48,[46,20,66]],[.52,[36,12,56]],[.58,[44,19,64]],[.85,[40,30,40]],[1,[16,41,13]]],p);
    for(const c of[.28,.52]){A.heart=Math.max(A.heart,flash(p,c,.1));A.hg=Math.max(A.hg,1+flash(p,c,.12))}A.sr=A.heart;
    const vib=Math.sin(TAU*6*(p-.28))*Math.exp(-Math.max(0,p-.28)*14)*(p>.28?1:0)+Math.sin(TAU*6*(p-.52))*Math.exp(-Math.max(0,p-.52)*14)*(p>.52?1:0);A.st=A.st.map((s,i)=>.05*vib*(i%2?1:-1));
    A.jaw=.25*Math.max(pls(p,.65,.07),pls(p,.75,.07));A.squint=.5*rise(p,.58,.62,.86,.92);A.mb=.2*vib;
    for(const c of[.65,.75])fx('mouth',(p-c)/.12,{steam:P2})}
  else if(anim==='enter'){// IL RISVEGLIO: a statue on its knees, grey and covered in moss; two beats of the heart light the cracks and the eyes;
    // it pushes itself up on its fists (the moss tears off, the stones straighten one by one, the colour comes back from the heart outward),
    // looks round, pounds the floor and roars
    const K=[[0,[-14,.35,.5,0]],[.30,[-14,.35,.5,0]],[.355,[-14,.33,.16,0]],[.40,[-14,.33,.16,0]],[.65,[0,-.05,-.1,.06]],[.80,[0,-.08,-.05,.06]],[.84,[0,.02,0,-.12]],[.86,[0,.02,0,-.04]],[.9,[0,-.04,-.25,.04]],[.96,[0,-.04,-.25,.04]],[1,[0,0,0,0]]];
    const v=kv(K,p);A.B=[0,0,v[0]];A.lean=v[1];A.hp=v[2];A.s=v[3];A.hz=-2*(1-sstep(.4,.65,p));
    const kneel=1-sstep(.4,.62,p);A.fL=lerp3([3,-18,0],[-12,-18,0],kneel);A.fR=lerp3([3,18,0],[-12,18,0],kneel);
    const HKs=[[0,[26,32,12]],[.4,[26,32,12]],[.5,[22,36,13]],[.65,[16,41,13]],[.80,[20,34,30]],[.84,[26,26,12]],[.92,[24,30,13]],[1,[16,41,13]]],h=v3(HKs,p);A.hR=h;A.hL=[h[0],-h[1],h[2]];
    const off=[.26,-.35,.17,-.44,.52];A.st=off.map((o2,i)=>{const t=[.44,.49,.53,.57,.61][i],k=sstep(t,t+.04,p);return o2*(1-k)-Math.sign(o2)*.14*Math.sin(Math.PI*cl((p-t-.02)/.05,0,1))*(p>t+.02?1:0)});
    const stv=(a,m)=>(m||.45)*(1-sstep(a,a+.1,p));A.statue=stv(.4);A.stg={torso:stv(.40),head:stv(.45),arms:stv(.50),ends:stv(.55),stones:stv(.55,.55),moss:stv(.45,.55)};
    A.heart=Math.max(.6*pls(p,.25,.05),pls(p,.35,.05),.9*rise(p,.86,.88,.96,.99));A.hg=1+pls(p,.35,.06)+rise(p,.86,.88,.96,.99);
    A.vflash=Math.max(pls(p,.255,.04),.8*pls(p,.355,.04));for(let i=0;i<6;i++)A.vein[i]=[0,1,A.vflash];
    A.eyeL=sstep(.36,.39,p);A.eyeR=sstep(.40,.43,p);A.eflL=flash(p,.36,.04);A.eflR=flash(p,.40,.04);A.sr=Math.max(A.heart,A.vflash);
    A.mossX=1+.3*(1-sstep(.44,.5,p));A.tufts=p<.45?1:0;A.tfall=p>=.45&&p<.75?(p-.45)/.3:-1;
    A.hy=v3([[0,[0]],[.65,[0]],[.70,[-.35]],[.75,[.35]],[.80,[0]],[1,[0]]],p)[0];
    A.jaw=.45*rise(p,.85,.87,.97,.995);A.glow=1+.3*rise(p,.86,.88,.96,.99);
    fx('dust',(p-.84)/.14,{at:[30,26,0],n:6,r:10});fx('dust',(p-.84)/.14,{at:[30,-26,0],n:6,r:10});fx('ring',(p-.86)/.13,{rgb:'196,184,160'});
    fx('mossfall',A.tfall);for(const t of[.44,.49,.53,.57,.61])fx('pebs',(p-t-.03)/.08,{at:[-10,0,86],fall:1,few:1})}
  else if(anim==='die'){// TORNA PIETRA: staggers, three ever weaker beats, falls on its knees; the light leaves the body from the hands and the
    // feet toward the heart, the eyes go out, a last weak beat (the climax, .55); the stones fall back one by one, the fists come off and
    // roll away, it sits and crumbles into a mound of mossy boulders; the keystone rolls out, glows one last time; fireflies, flowers
    const stag=1-sstep(.15,.3,p);A.lean=v3([[0,[0]],[.1,[-.15]],[.15,[-.15]],[.30,[.2]],[.55,[.25]],[.7,[.3]],[1,[.3]]],p)[0];A.B=[-4*sstep(0,.1,p)*stag,0,-14*sstep(.15,.30,p)];
    A.roll=.05*Math.sin(TAU*6*p*4)*sstep(0,.03,p)*stag;A.hp=.3*sstep(.15,.35,p)+.25*sstep(.4,.6,p);A.hz=-3*sstep(.4,.6,p);
    beat(.03,1,.04);beat(.08,.7,.04);beat(.14,.4,.04);beat(.55,.35,.05);A.hg=1+.3*A.heart;
    A.cool=P2?sstep(.15,.35,p):0;A.rocks=P2?1:0;A.rockFall=P2?sstep(0,.12,p):0;
    A.fL=v3([[0,[3,-18,0]],[.15,[3,-18,0]],[.2,[-12,-18,0]],[1,[-12,-18,0]]],p);A.fR=v3([[0,[3,18,0]],[.22,[3,18,0]],[.3,[-12,18,0]],[1,[-12,18,0]]],p);
    A.hR=v3([[0,[16,41,13]],[.15,[12,42,16]],[.30,[26,30,12]],[1,[26,30,12]]],p);A.hL=v3([[0,[16,-41,13]],[.2,[18,-38,13]],[.3,[20,-36,13]],[1,[20,-36,13]]],p);
    // the light: a last surge, then it leaves from the hands and the feet toward the heart
    const sg=rise(p,.3,.35,.36,.4);A.fiL=A.fiR=Math.max(sg,(1-sstep(.36,.38,p))*sstep(.3,.35,p));A.brL=A.brR=sstep(.3,.35,p)*(1-sstep(.4,.42,p));A.kn=sstep(.3,.35,p)*(1-sstep(.43,.45,p));
    {const hd=1-sstep(.45,.52,p);for(let i=0;i<6;i++)A.vein[i]=[0,hd,p>.3&&p<.53?sstep(.3,.35,p):0]}
    A.eyeR=1-sstep(.48,.50,p);A.eyeL=1-sstep(.51,.53,p);A.glow=1-.5*sstep(.3,.5,p);A.sr=Math.max(A.heart,sg)*(p<.55?1:0);
    A.fall=[.56,.59,.62,.65,.68].map(t=>{const k=cl((p-t)/.05,0,1);return k<1?ez(k):1-.08*Math.sin(Math.PI*cl((p-t-.05)/.04,0,1))});
    A.fistOff=sstep(.62,.80,p);A.armIn=sstep(.62,.80,p)*.6;A.crumble=sstep(.70,.85,p);A.drop=sstep(.70,.82,p);
    A.key=p>=.70?sstep(.85,.92,p):-1;A.hdim=1-sstep(.5,.6,p);A.keyGlow=pls(p,.905,.03);A.flowers=sstep(.90,1,p);A.candle=A.candle.map(c=>c*(1-sstep(.15,.3,p)));A.lava=P2?1:0;A.keyCrack=P2?1:0;
    for(const t of[.56,.59,.62,.65,.68])fx('dust',(p-t-.04)/.1,{at:[-30,0,0],n:4,r:10,al:.4});fx('dust',(p-.79)/.16,{at:[-34,0,0],n:7,r:15,al:.4});fx('dust',(p-.7)/.2,{at:[0,0,0],n:9,r:30,al:.45});fx('fly',(p-.9)/.1)}
  else{// FERMO: slow deep breaths (the chest swells, the shoulders and their moss rise), two beats of the heart send a wave of light up to the
    // shoulders, two puffs of dust on the breath out, the head looks round, the stone lid of the brow comes down, the right knuckles tap
    // impatiently, a pebble rolls off the left shoulder
    const b=Math.sin(ph);A.s=.016*b;A.B=[0,0,.3*b];A.shL=A.shR=1.5*(.5+.5*b);
    if(P2){beat(.10,1);beat(.18,.85);beat(.26,.7)}else{beat(.10,1);beat(.22,.8)}
    {const k=(p-.10)/.2;if(k>0&&k<1.6){const hd=ez(cl(k,0,1)),tl=ez(cl((k-.3)/.9,0,1));A.vein[0]=A.vein[1]=[tl*.8,hd,1-sstep(.8,1.5,k)]}}
    A.sr=A.heart;A.hg=1+.25*A.heart;A.hy=look(p,.35);A.blink=blink(p,.62,.09);A.brow=2*(1-A.blink);A.glow=.85+.15*Math.sin(ph*2);
    const tap=Math.max(pls(p,.78,.045),pls(p,.83,.045),pls(p,.88,.045));A.hR=[16,41,13+3*tap];A.sway=.12*Math.sin(TAU*(p-.15));
    for(const c of[.55,.63])fx('mouth',(p-c)/.14,{steam:P2});for(const c of[.80,.85,.90])fx('dust',(p-c)/.07,{at:[26,42,0],n:4,r:5,al:.4});
    if(!P2)fx('pebble',(p-.30)/.20)}
  // the second phase stoops (not when it curls up into the ball)
  if(P2&&anim!=='rage'){const k=1-A.curl;A.lean+=.08*k;A.hz-=3*k;A.hp+=.08*k}
  return A}

// ------------------------------------------------------------------ pieces
// a leaf of moss (strips, tufts, collars): an almond from b along d (length L, half width W across s), the tip bent along its normal; the
// back colour when it turns away; a light vein
function mleaf(V0,b,d,s,L,W,col,o){o=o||{};const n=nrm(cross(d,s)),bend=o.bend||0,tip=add(add(b,mul(d,L)),mul(n,bend*L*.4)),mid=add(add(b,mul(d,L*.48)),mul(n,bend*L*.1)),B=V0.P(b),T=V0.P(tip),M1=V0.P(add(mid,mul(s,W*2))),M2=V0.P(add(mid,mul(s,-W*2)));
  ctx.beginPath();ctx.moveTo(B[0],B[1]);ctx.quadraticCurveTo(M1[0],M1[1],T[0],T[1]);ctx.quadraticCurveTo(M2[0],M2[1],B[0],B[1]);ctx.closePath();ctx.fillStyle=o.back&&V0.F(n)<0?o.back:col;ctx.fill();
  ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=o.lw||1.8;ctx.stroke();if(o.vein){const a=V0.P(add(b,mul(d,L*.14))),e=V0.P(add(add(b,mul(d,L*.74)),mul(n,bend*L*.22)));ctx.strokeStyle=o.vein;ctx.lineWidth=1;ctx.lineCap='round';seg(a,e);ctx.stroke()}}
// the moss: a cushion grown on an ellipsoid (centre Cc, radii Rd + pad) round the direction m: a bumpy edge, soft green, light tufts, bright
// tips (embers in the second phase). Returns false when none of it faces us
function mossCap(V0,X,Cc,Rd,m,al,alv,seed,K,o){o=o||{};al=Math.round(al*100)/100;alv=Math.round(alv*100)/100;const R2=add(Rd,o.pad||[0,0,0]),r=ellCap(V0,X,Cc,R2,AXES,m,al,o.N||22,{alv,u:o.u||[0,0,1],ck:o.spun?null:'m'+seed,rf:t=>1+.1*Math.sin(t*7+seed)+.05*Math.sin(t*13+seed*2)});if(!r)return false;
  const q=V0.P(X.T(ellAt(Cc,R2,AXES,m))),w=(o.w||12),h=(o.h||9),bb=[q[0]-w,q[1]-h,q[0]+w,q[1]+h];
  ctx.fillStyle=mossGrad(bb,K.moss);ctx.fill();ctx.lineJoin='round';ctx.strokeStyle=K.mE;ctx.lineWidth=o.lw||2;ctx.stroke();
  let u=cross(m,[0,0,1]);if(len(u)<.2)u=[1,0,0];u=nrm(u);const w2=cross(m,u),dots=[[],[]];
  for(const[a,b2,rr,kind] of MOSSDOTS){const mm=nrm(add(m,add(mul(w2,a*al),mul(u,b2*alv))));if(V0.F(X.Rd(ellN(R2,AXES,mm)))<=.25)continue;const s=V0.P(X.T(ellAt(Cc,R2,AXES,mm)));dots[kind].push([s[0],s[1],rr*(o.k||1)])}
  for(let k=0;k<2;k++){if(!dots[k].length)continue;ctx.beginPath();for(const[x0,y0,r0] of dots[k]){ctx.moveTo(x0+r0,y0);ctx.arc(x0,y0,r0,0,TAU)}ctx.fillStyle=k?(K.emberK>.5?K.ember:K.tip):K.moss.l;ctx.fill()}
  return r}
const MOSSDOTS=[[-.35,.1,1.6,0],[.05,.25,1.8,0],[.38,.02,1.5,0],[-.2,.42,.9,1],[.4,.36,.8,1]];
// the moss is lit only in its top third (the base green and its shadow below): darker, so the eyes and the heart lead («un po' più cupi»)
function mossGrad(b,T){const w=b[2]-b[0],h=b[3]-b[1],cx=(b[0]+b[2])/2,R=Math.max(w,h,2)*.78,g=ctx.createRadialGradient(cx-w*.14,b[1]+h*.1,R*.04,cx-w*.04,b[1]+h*.32,R);
  g.addColorStop(0,T.l);g.addColorStop(.3,T.b);g.addColorStop(.78,T.d);g.addColorStop(1,T.d);return g}
// a little glowing mushroom: the foot c, the way it grows, its size; closed and dim in the second phase
function shroom(V0,c,up,s,K){const{P}=V0,b=P(c),t=P(add(c,mul(up,3*s))),op=K.capOpen,rx=3*s*(.6+.4*op),ry=2*s*(1.35-.35*op);
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.4*s+1.6;seg(b,t);ctx.stroke();ctx.strokeStyle=K.stem;ctx.lineWidth=2.4*s;seg(b,t);ctx.stroke();
  ctx.beginPath();ctx.ellipse(t[0],t[1]+.2,rx,ry,0,Math.PI,TAU);ctx.closePath();ctx.fillStyle=K.cap;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.75)';ball([t[0]-rx*.35,t[1]-ry*.45],.6*s);ctx.fill()}
// a rounded slab of sandstone or slate (the brow, the jaw): the smooth hull of a bevelled box, its top face lighter
function slabDraw(V0,c,E,Hs,b,T,o){o=o||{};const hp=svol3(V0,boxV(c,E,Hs,b),T,{lw:o.lw||2.2});if(o.noTop)return hp;const FS=boxF(c,E,Hs,b);
  const top=FS[o.top==null?5:o.top],n=fnorm(top),up=dot(n,sub(cen(top),c))<0?mul(n,-1):n,v=V0.F(up);
  if(v>.05){ctx.save();clipTo(hp);ctx.globalAlpha*=cl(v*3,0,1);ctx.beginPath();for(const q of top){const s=V0.P(q);ctx.lineTo(s[0],s[1])}ctx.closePath();ctx.fillStyle=o.topCol||T.l;ctx.fill();ctx.restore()}
  return hp}
// the heart: a coin of sandstone (radius 9.5, lifted 1.5) with four notches; the rune stone in it (radius 6.8) split down the middle into two
// doors with the rhombus rune; open, the dark hole and the turning gem. c: centre, n: normal, up: its top, K: palette, A: the pose
function coin(V0,c,n,up,K,A,o){o=o||{};const{P,F}=V0;n=nrm(n);const u=nrm(cross(up,n)),v=cross(n,u),f=F(n);
  const at=(a,b,h)=>add(c,add(add(mul(u,a),mul(v,b)),mul(n,h||0))),ring=(r,h,N)=>{const R=[];for(let i=0;i<N;i++){const t=i/N*TAU;R.push(P(at(Math.cos(t)*r,Math.sin(t)*r,h)))}return R};
  const lo=ring(9.5,0,16),hi=ring(9.5,1.5,16),H=chull(lo.concat(hi));ctx.lineJoin='round';
  poly(H);ctx.fillStyle=K.sand.d;ctx.fill();poly(hi);ctx.fillStyle=grad3(bbox(hi),K.sand);ctx.fill();
  ctx.strokeStyle='rgba(255,246,220,.35)';ctx.lineWidth=.9;poly(ring(8.6,1.5,16));ctx.stroke();poly(H);ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.stroke();
  ctx.strokeStyle=K.sand.d;ctx.lineWidth=1.5;ctx.lineCap='round';ctx.beginPath();for(const a of[.785,2.356,3.927,5.498]){const q0=P(at(Math.cos(a)*9.2,Math.sin(a)*9.2,1.5)),q1=P(at(Math.cos(a)*7.2,Math.sin(a)*7.2,1.5));ctx.moveTo(q0[0],q0[1]);ctx.lineTo(q1[0],q1[1])}ctx.stroke()
  const R6=6.8,op=A.drot>.01||A.dslide>.05;
  if(op){poly(ring(R6,1.4,18));ctx.fillStyle='#101416';ctx.fill();
    // the gem: an octahedron turning round the normal, swelling out of the hole
    if(A.gem>.01){const gr=(6+3*A.gem)*sstep(0,.2,A.gem+.05),gu=add(mul(u,Math.cos(A.gspin)),mul(v,Math.sin(A.gspin))),gv=cross(n,gu),z0=1.4;
      vol(V0,[at(0,0,z0+gr*.95),at(0,0,z0-gr*.4),add(at(0,0,z0+gr*.15),mul(gu,gr*.72)),add(at(0,0,z0+gr*.15),mul(gu,-gr*.72)),add(at(0,0,z0+gr*.15),mul(gv,gr*.72)),add(at(0,0,z0+gr*.15),mul(gv,-gr*.72))],K.gem.b,{lw:1.4,kl:.55,kd:.35,rim:.5})}}
  // the two doors (they slide out and swing on their outer hinges); closed, one stone with a slit
  if(!op){const Q=ring(R6,1.6,14);poly(Q);ctx.fillStyle=grad3(bbox(Q),K.rs);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();const s0=P(at(0,R6,1.6)),s1=P(at(0,-R6,1.6));ctx.strokeStyle='#101416';ctx.lineWidth=1;seg(s0,s1);ctx.stroke()}
  for(const sd of[-1,1]){const th=A.drot,s=A.dslide,pts=[];const D=(a,b)=>{const d=a-R6;return at(sd*(R6+s+d*Math.cos(th)),b,1.6+(-d)*Math.sin(th))};
    for(let i=0;i<=10;i++){const t=-Math.PI/2+i/10*Math.PI;pts.push(D(Math.cos(t)*R6,Math.sin(t)*R6))}
    if(op){const Q=pts.map(P);poly(Q);ctx.fillStyle=grad3(bbox(Q),K.rs);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke()}
    // half of the rhombus rune, lit by the beat
    const rr=[D(0,4),D(2.5,0),D(0,-4)].map(P),lt=A.heart*(o.dim==null?1:o.dim);ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();for(const q of rr)ctx.lineTo(q[0],q[1]);ctx.strokeStyle=cmix(K.off,K.hlite,cl(lt*1.3,0,1));ctx.lineWidth=1.9;ctx.stroke();
    if(lt>.35){ctx.strokeStyle=K.hcore;ctx.lineWidth=.8;ctx.stroke()}}
  // the crack of the second phase across the keystone
  if(A.keyCrack>.01){const z=[[-1.5,5.6],[.6,2.4],[-.9,.2],[1.4,-2.6],[-.4,-5.8]].map(([a,b])=>P(at(a,b,1.7+(op?2:0))));ctx.save();ctx.globalAlpha*=A.keyCrack;ctx.beginPath();for(const q of z)ctx.lineTo(q[0],q[1]);
    if(!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${K.hglow},.5)`;ctx.lineWidth=3.2;ctx.stroke();ctx.globalCompositeOperation='source-over'}ctx.strokeStyle=K.hlite;ctx.lineWidth=1.4;ctx.stroke();ctx.restore()}
  return at}

// the inverse of the body's frame (C3.frame with Z0 = 0): a point of the world back into the body's own axes (the fists live in the world)
function invFrame(A){const ca=Math.cos(A.lean||0),sa=Math.sin(A.lean||0),cr=Math.cos(A.roll||0),sr=Math.sin(A.roll||0),cy=Math.cos(A.yaw||0),sy=Math.sin(A.yaw||0),
  sz=1+(A.s||0),sxy=1/Math.sqrt(Math.max(.3,sz)),sx=sxy*(1+(A.sx||0)),B=A.B||[0,0,0];
  return q=>{const X0=q[0]-B[0],Y0=q[1]-B[1],Z0=q[2]-B[2],x2=X0*cy+Y0*sy,y1=-X0*sy+Y0*cy,x=x2*ca-Z0*sa,z1=x2*sa+Z0*ca,y=y1*cr-z1*sr,z=y1*sr+z1*cr;return[x/sx,y/sxy,z/sz]}}
// ------------------------------------------------------------------ the model
function golem2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};anim=MV.includes(anim)?anim:'idle';const V0=V(face),{P,D,F}=V0,A=gPose(anim,p,o),fx=fxOn(o);
  if(LOWFX)A.sway=0;   // slow phones: the strips and the tufts of moss hang still
  const lift=o.z!=null?o.z/sc:A.lift;A.B[2]+=lift;const X=frame(A,0),c=A.curl,fw=X.Rd([1,0,0]),fF=F(fw);
  // palettes (the second phase, the statue, both by groups when they change from the heart outward)
  const g2=n=>A.grp&&A.grp[n]!=null?A.grp[n]:A.k2,gs=n=>A.stg&&A.stg[n]!=null?A.stg[n]:A.statue;
  const KT=pal(g2('b'),gs('torso')),KH=pal(g2('b'),gs('head')),KA=pal(g2('b'),gs('arms')),KE=pal(g2('b'),gs('ends')),KS=pal(g2('t'),gs('stones')),
    KM=pal(g2('m'),gs('moss')),KL=cooled(pal(g2('h'),gs('torso')),A.cool),KY=pal(g2('e'),0),KF=pal(g2('s'),gs('moss')),KC=cooled(pal(1,0),A.cool);
  // the torso now (curling into the ball)
  const TCc=c>0?TC.map(q=>lerp3(q,BC,c)):TC,TRc=c>0?TR.map(r=>lerp3(r,BRR,c)):TR,cs=Math.cos(A.spin),sn=Math.sin(A.spin),FrB={u:[cs,0,-sn],v:[0,1,0],w:[sn,0,cs]};
  floor(V0,x,y,sc,[A.B[0],A.B[1],0],lerp(50,40,c)*(A.crumble>0?1-.15*A.crumble:1),lerp(16,14,c),.45,lift);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),LB=parts(),dT=D(4,0,56),J={};
  // ---------------- the torso: the slate, its shade, the cracks, the chisel marks, the veins; the moss mantle; the heart; as a ball, its band
  LB.add(dT,()=>{const pts=[];for(let i=0;i<3;i++)for(const q of ellSil(V0,TCc[i],TRc[i],null,X.T,14))pts.push(q);const hp=svol3(V0,hullE(pts,.08),KT.slate,{lw:3,rim:.32,scr:1});J.thull=hp;
    const vis=1-sstep(.15,.55,c);ctx.save();
    {const b=bbox(hp),g=ctx.createLinearGradient(0,b[1]+(b[3]-b[1])*.42,0,b[3]);g.addColorStop(0,'rgba(8,12,14,0)');g.addColorStop(1,'rgba(8,12,14,.42)');ctx.fillStyle=g;ctx.fill(hp.path);ctx.clip(hp.path)}
    if(vis>.02){ctx.save();ctx.globalAlpha*=vis;
      // the soft shadows of the shoulder boulders on the sides of the chest
      if(c<.2)for(const sd of[-1,1]){const sq=P(X.T([2,sd*30,56])),g=ctx.createRadialGradient(sq[0],sq[1],1,sq[0],sq[1],20);g.addColorStop(0,'rgba(8,12,14,.34)');g.addColorStop(1,'rgba(8,12,14,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sq[0],sq[1],20,0,TAU);ctx.fill()}
      // the soft shadow of the head on the chest
      {const hq=P(X.T(add(HC,[A.hx,0,A.hz]))),sy=hq[1]+13,g=ctx.createRadialGradient(hq[0]+1.5,sy,1,hq[0]+1.5,sy,17);g.addColorStop(0,'rgba(10,8,8,.34)');g.addColorStop(1,'rgba(10,8,8,0)');
        ctx.save();ctx.translate(0,sy);ctx.scale(1,.5);ctx.translate(0,-sy);ctx.fillStyle=g;ctx.beginPath();ctx.arc(hq[0]+1.5,sy,17,0,TAU);ctx.fill();ctx.restore()}
      const Cs=c>0?TCc:null,Rs=c>0?TRc:null;
      {const CR=CRACKS.map(pa=>pathNow(V0,X,pa,Cs,Rs)),R=[];for(const S of CR)for(const r of runsIn(S,0,1,.04))R.push(r);strokeRuns(R.map(r=>r.map(q=>[q[0]+.7,q[1]+.9])),'rgba(255,248,230,.17)',1.2);strokeRuns(R,'rgba(22,18,16,.78)',1.6);
        if(A.lava>0){const LR=[],hot=cl(Math.max(A.sr,A.heart),0,1);for(const S of CR)for(const r of runsIn(S,0,A.lava,.04))LR.push(r);if(LR.length){if(!LOWFX&&A.cool<1&&hot>.05){ctx.globalCompositeOperation='lighter';strokeRuns(LR,`rgba(${KC.glow},${.38*(1-A.cool)*hot})`,4.4);ctx.globalCompositeOperation='source-over'}
          ctx.save();ctx.globalAlpha*=.6+.4*hot;strokeRuns(LR,KC.lite,1.4+.6*hot);ctx.restore();if(hot>.05){ctx.save();ctx.globalAlpha*=hot;strokeRuns(LR,KC.core,.8);ctx.restore()}}}
        // the four chisel marks, barely there, on the front of the chest
        {const R=[];for(const pa of CHISEL)for(const r of runsIn(pathNow(V0,X,pa,Cs,Rs),0,1,.15))R.push(r);strokeRuns(R,'rgba(255,248,230,.2)',1.1)}
        const VS=VEINS.map(pa=>pathNow(V0,X,pa,Cs,Rs)),G2=[];for(const S of VS)for(const r of runsIn(S,0,1,.05))G2.push(r);strokeRuns(G2,KL.gap,2.4);strokeRuns(G2,KL.off,1);
        VS.forEach((S,i)=>veinLit(S,KL,A.vein[i]))}
      ctx.restore()}
    // the ball: the cracks that turn with it, the band of runes along its teeth, moss on its flanks
    if(c>.45){const bk=sstep(.45,.85,c);ctx.save();ctx.globalAlpha*=bk;
      for(const cr of BCRACKS){const S=[];for(let i=0;i<cr.length;i++)for(let j=0;j<(i<cr.length-1?3:1);j++){const m=i<cr.length-1?nrm(lerp3(cr[i],cr[i+1],j/3)):cr[i],wv=add(add(mul(FrB.u,m[0]),mul(FrB.v,m[1])),mul(FrB.w,m[2]));
        S.push({q:P(X.T(ellAt(BC,BRR,AXES,wv))),v:F(X.Rd(ellN(BRR,AXES,wv))),f:S.length})}const n=S.length-1;S.forEach(s=>s.f/=n||1);crackDraw(S,KC,A.lava,A.cool)}
      const band=[];for(let i=0;i<=48;i++){const a=i/48*TAU+A.spin,wv=[Math.sin(a),0,Math.cos(a)];band.push({q:P(X.T(ellAt(BC,add(BRR,[.3,.3,.3]),AXES,wv))),v:F(X.Rd(ellN(BRR,AXES,wv))),f:i/48})}
      const R=runsIn(band,0,1,.02);strokeRuns(R,KT.gap,5.4);strokeRuns(R,cmix(KL.off,KL.lite,.55+.45*A.sr),3.2);if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';strokeRuns(R,`rgba(${KL.glow},.3)`,7);ctx.restore()}strokeRuns(R,KL.core,1);
      // little rhombus runes on the band, between the teeth
      for(let i=0;i<5;i++){const a=SG[0].slot+Math.PI/5+i*TAU/5+A.spin,wv=[Math.sin(a),0,Math.cos(a)],f=F(X.Rd(ellN(BRR,AXES,wv)));if(f<.15)continue;const q=P(X.T(ellAt(BC,add(BRR,[.5,.5,.5]),AXES,wv)));
        ctx.save();ctx.globalAlpha*=cl((f-.15)*4,0,1);ctx.beginPath();ctx.moveTo(q[0],q[1]-3.6);ctx.lineTo(q[0]+2.4,q[1]);ctx.lineTo(q[0],q[1]+3.6);ctx.lineTo(q[0]-2.4,q[1]);ctx.closePath();ctx.fillStyle=KL.core;ctx.fill();ctx.strokeStyle=KT.gap;ctx.lineWidth=1;ctx.stroke();ctx.restore()}
      ctx.restore()}
    ctx.restore();
    if(c>.45){const bk=sstep(.45,.85,c);ctx.save();ctx.globalAlpha*=bk;const spun=m=>add(add(mul(FrB.u,m[0]),mul(FrB.v,m[1])),mul(FrB.w,m[2]));
      for(const[m,s,a] of[[[0,1,0],1.3,.34],[[0,-1,0],4.1,.34],[nrm([Math.sin(1.9),.5,Math.cos(1.9)]),2.2,.28],[nrm([Math.sin(-.63),-.5,Math.cos(-.63)]),5.2,.28]])mossCap(V0,X,BC,BRR,nrm(spun(m)),a,a*.8,s,KM,{pad:[2,2,2],w:12,h:10,spun:1});
      ctx.restore()}
    // the mantle of moss over the hump, between the stones, a few strands hanging from its lower edge
    const mv=1-sstep(.2,.6,c);if(mv>.02){ctx.save();ctx.globalAlpha*=mv;
      for(const[t,e,Ls] of STRANDS){const m=dir(t,e),n=X.Rd(ellN(add(TRc[2],[3,3,3]),AXES,m));if(F(n)<-.1)continue;const b=X.T(ellAt(TCc[2],add(TRc[2],[3,3,3]),AXES,m)),d=nrm(add(mul(n,.3),X.Rd([A.sway*.4,0,-1])));mleaf(V0,b,d,nrm(cross(d,n)),Ls,3.4,KM.moss.b,{back:KM.moss.d,bend:.45,lw:1.7,vein:KM.moss.l})}
      mossCap(V0,X,TCc[2],TRc[2],dir(Math.PI,.95),1.0*A.mossX**.5,.8*A.mossX**.5,2.3,KM,{pad:[3,3,3],w:26,h:16,lw:2.2,N:22});ctx.restore()}
    // the heart on the chest
    if(vis>.02&&A.key<0){const m=HM,cc=X.T(ellAt(TCc[0],TRc[0],AXES,m)),nn=X.Rd(ellN(TRc[0],AXES,m)),fh=F(nn);
      if(fh>-.1){ctx.save();ctx.globalAlpha*=vis*cl((fh+.1)*5,0,1);coin(V0,add(cc,mul(nn,-.5)),nn,X.Rd([0,0,1]),KL,A);ctx.restore();
        const q=P(add(cc,mul(nn,2)));J.heartQ=q;
        // its light and the white flash go over everything (see the piece after the legs): nothing in front of the chest swaps with them
        const gk=(A.statue>.3&&A.heart<.05)?0:1;J.hglow={q,r:16*A.hg*(.85+.15*A.heart),a:(.18+.5*A.heart)*vis*gk*(1-A.cool)*(A.hdim==null?1:A.hdim)*cl((fh+.1)*5,0,1)}}}});
  LB.add(997,()=>{const g=J.hglow;if(!g)return;if(!LOWFX)shine(KL.hglow,g.q[0],g.q[1],g.r,g.a);if(A.wflash>0){const gr=ctx.createRadialGradient(g.q[0],g.q[1],1,g.q[0],g.q[1],24);gr.addColorStop(0,`rgba(255,255,255,${.95*A.wflash})`);gr.addColorStop(.45,`rgba(255,245,220,${.5*A.wflash})`);gr.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=gr;ball(g.q,24);ctx.fill()}});
  // ---------------- the root of the beam: drawn last, so it shows from every side
  if(A.beam>0&&A.key<0){const cc=X.T(ellAt(TCc[0],TRc[0],AXES,HM)),nn=X.Rd(ellN(TRc[0],AXES,HM)),q=P(add(cc,mul(nn,2)));L.add(999,()=>{const d=nrm(add(X.Rd([1,0,0]),[0,0,-.05])),e=P(add(cc,mul(d,20)));
    ctx.save();if(!LOWFX)ctx.globalCompositeOperation='lighter';ctx.lineCap='round';for(const[w,col,al] of[[16,'255,120,40',.35],[9,'255,190,90',.7],[4,'255,250,220',1]]){ctx.strokeStyle=`rgba(${col},${al*A.beam})`;ctx.lineWidth=w;seg(q,e);ctx.stroke()}
    ctx.restore();ctx.fillStyle=`rgba(255,250,225,${.9*A.beam})`;ball(q,4.5*A.beam+1);ctx.fill()})}
  // ---------------- the legs: two bones, the knee ring of sandstone, the big foot; always behind the torso
  const legOf=sd=>{const f=sd<0?A.fL:A.fR,fc=[f[0],f[1],f[2]+6+lift],hip=X.T([HIP[0],sd*HIP[1],HIP[2]]),ank=add(fc,[-2,0,6]),[kn,an]=ik(hip,ank,LTH,LSH,X.Rd([1,0,-.6]));return{hip,kn,an,fc}};
  for(const sd of[-1,1]){const g=legOf(sd);J['leg'+sd]=g;const fk=sstep(0,-.15,F(0,sd,0));
    LB.add(dT-100+D([HIP[0],sd*HIP[1],HIP[2]])*.01,()=>{const col=pal(g2('b'),gs('ends')),T=fk>0?mixT(col.slate,T3(col.slate.b,col.slate.d,col.slate.d),.25*fk):col.slate;
      if(Math.abs(F(0,sd,0))>.55)chain(V0,[g.hip,g.kn],[11,10.8],T.b,{lw:2.8,fill:limbGrad(P(g.hip),P(g.kn),11,T)});
      // the knee ring: a short capital of sandstone round the knee, with a notch of rune in front
      const sd2=nrm(sub(g.an,g.kn)),a=add(g.kn,mul(sd2,-.5)),b=add(g.kn,mul(sd2,3)),shin=()=>cyl(V0,b,10.7,g.an,10.5,T),ks0=T3(col.sand.b,col.sand.d,'#4a3d29'),ks=fk>0?mixT(ks0,T3(ks0.b,ks0.d,ks0.d),.25*fk):ks0,bd=()=>band(V0,a,b,11.2,ks,{r2:11,lw:2.2});
      if(F(sd2)>0){bd();shin()}else{shin();bd()}
      {const nf=nrm(sub(X.Rd([1,0,0]),mul(sd2,dot(X.Rd([1,0,0]),sd2)))),q=P(add(lerp3(a,b,.5),mul(nf,12.6))),fv=F(nf);if(fv>.1){ctx.save();ctx.globalAlpha*=cl((fv-.1)*4,0,1);
        ctx.strokeStyle=cmix(KL.off,KL.lite,A.kn);ctx.lineWidth=2.2;ctx.lineCap='round';seg([q[0],q[1]-2.4],[q[0],q[1]+2.4]);ctx.stroke();if(A.kn>.3){ctx.strokeStyle=KL.core;ctx.lineWidth=.9;ctx.stroke();if(!LOWFX)shine(KL.glow,q[0],q[1],7,.4*A.kn)}ctx.restore()}}
      // the foot: a big slab of slate with three stubby toes
      const fd=nrm([fw[0],fw[1],0]),E={u:fd,v:nrm(cross([0,0,1],fd)),w:[0,0,1]},hp=svol3(V0,ellSil(V0,g.fc,FOOTR,E,null,14),T,{lw:2.6,scr:1,rim:.22});
      if(F(fd)>-.2){ctx.strokeStyle='rgba(16,20,24,.5)';ctx.lineWidth=1.3;ctx.lineCap='round';ctx.beginPath();for(const s2 of[-.3,.3]){const e0=P(add(g.fc,add(mul(E.u,8),add(mul(E.v,s2*9),[0,0,1])))),e1=P(add(g.fc,add(mul(E.u,11.5),add(mul(E.v,s2*9.5),[0,0,-2]))));ctx.moveTo(e0[0],e0[1]);ctx.lineTo(e1[0],e1[1])}ctx.stroke();
        // the light that runs down into the legs before a jump shows in the grooves of the toes (the knees hide under the belly)
        if(A.kn>.05){ctx.save();if(!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${KL.glow},${.35*A.kn})`;ctx.lineWidth=5;ctx.stroke();ctx.globalCompositeOperation='source-over'}ctx.globalAlpha*=Math.min(1,A.kn*1.5);ctx.strokeStyle=KL.lite;ctx.lineWidth=1.6;ctx.stroke();ctx.restore()}}})}
  // ---------------- the shoulders and the arms. Curling into the ball they wrap it and stay solid: the boulders shrink into it, the arms
  // thin out, the fists sink into the body (no part ever turns see-through); in the ball the parts that wrap its far side go behind it
  const ain=A.armIn,shK=1-sstep(.15,.8,ain),ak=1-sstep(.65,.97,ain),akw=Math.min(1,ak*3),XI=ain>0?invFrame(A):null,BCw=X.T(BC);
  const XS=sd=>{const sh=sd<0?A.shL:A.shR;return lerp3([SHC[0],sd*SHC[1],SHC[2]+sh],[0,sd*24,52],1-shK)};
  const ballD=(q,d0,k)=>c<.5?d0:dT+(F(sub(q,BCw))>-.05?1.5+k:-1.5-k);
  for(const sd of[-1,1]){const fist0=sd<0?A.hL:A.hR,S=X.T(lerp3([SHJ[0],sd*SHJ[1],SHJ[2]+(sd<0?A.shL:A.shR)],[2,sd*16,44],ain)),fc=[fist0[0],fist0[1],fist0[2]+lift],
      wT0=add(fc,mul(nrm(sub(S,fc)),11)),wd=len(sub(wT0,S)),sl=1-.45*sstep(.35,.85,ain),wT=wd<19*sl?add(S,mul(wd>.5?nrm(sub(wT0,S)):X.Rd([0,sd,0]),19*sl)):wT0,
      [El,W]=ik(S,wT,LUA*sl,LFA*sl,X.Rd(lerp3([-.5,sd,-.2],[.2,sd*.75,-.65],sstep(.15,.7,ain)))),FC=add(W,sub(fc,wT)),fwz=nrm(sub(W,FC)),[fu,fv]=frm(fwz,fw),FE={u:fu,v:mul(fv,1),w:fwz};
    J['arm'+sd]={S,El,W,FC,FE};const fk=sstep(0,-.15,F(0,sd,0)),KAs=KA,lite=(sd<0?A.brL:A.brR),fl=(sd<0?A.fiL:A.fiR);
    const Tsl=fk>0?mixT(KAs.slate,T3(KAs.slate.b,KAs.slate.d,KAs.slate.d),.25*fk):KAs.slate,sh0=XS(sd),dS=D([SHC[0],sd*SHC[1],SHC[2]]);let dSh=dS+6;
    // the shoulder boulder, its cushion of moss, the mushrooms, the pauldron (they shrink together into the ball)
    if(shK>.02){const shoulder=()=>{const Cw=XS(sd),Rs=mul(SHR,shK),pts=ellSil(V0,Cw,Rs,null,X.T,14),pa=(A.paul>0||(A.pfly>=0&&A.pfly<.06))&&shK>.15;
        svol3(V0,pts,Tsl,{lw:3,scr:1,rim:.28});
        // the pauldron hugs the boulder: only its side that faces us shows (nothing to swap as the body turns); the moss goes over its top
        if(pa)ga(A.pfly>=0?1-A.pfly/.06:1,()=>paulCap(V0,X,Cw,Rs,sd,KAs,KL,lite));
        const mk=A.mossX*(1-.25*A.mb);mossCap(V0,X,Cw,Rs,dir(0,1.35),.78*mk**.4,.78*mk**.4,sd<0?1.1:3.7,KM,{pad:[3*shK,3*shK,4*mk*shK],w:16*shK,h:11*shK,N:16});
        if(sd<0&&ain<.3){const gq=P(X.T(ellAt(Cw,add(Rs,SHPAD),AXES,dir(-.9,1.15))));if(KF.capOpen>.3&&!LOWFX)shine(KF.capRgb,gq[0],gq[1]-3,6,.15*KF.capOpen)}
        if(sd<0&&ain<.3)for(const[t,e,s] of[[-.9,1.15,1],[-1.25,1.0,.8]]){const m=dir(t,e),n=X.Rd(ellN(add(Rs,SHPAD),AXES,m));if(F(n)<.05)continue;const fp=X.T(ellAt(Cw,add(Rs,SHPAD),AXES,m));shroom(V0,fp,nrm(add(n,[0,0,.6])),s,KF)}
        if(!cutS)strips(Cw)};
      // standing (not curling) the boulder sinks into the chest: while the part of it out of the chest faces us (or nearly) it goes over
      // the torso, cut where it goes into the chest (that part is inside the chest, never seen); turned away, it goes behind the torso
      let cutS=null;
      if(c<=0&&ain<=0){const Cw=XS(sd),oc=outCap(X,TC[0],TR[0],AXES,Cw,18.5*shK,1);
        if(oc&&F(oc.n)>-.2){cutS=oc;dSh=Math.max(dS+6,dT+.3);LB.add(dSh,()=>{sunkDraw(V0,P(X.T(Cw)),18.5*shK,cutS,shoulder);strips(Cw)})}
        else{dSh=oc===false?dS+6:Math.min(dS+6,dT-.3);LB.add(dSh,shoulder)}}
      else LB.add(ballD(X.T(sh0),dS+6,.3),shoulder)}
    // the strips of moss hanging from the edge of the cushion: drawn with the boulder they lie on, each fading out as it turns away from
    // us (nothing to swap); they shorten as the boulder shrinks
    const strips=Cw=>{if(shK<=.08)return;const R2=add(mul(SHR,shK),mul(SHPAD,shK)),sw=LOWFX?0:A.sway+.08*A.mb,w=Math.max(.35,shK);
      for(const[t,Ls] of STRIPS){const m=dir(sd*t,.5),n=X.Rd(ellN(R2,AXES,m)),fv=F(n);if(fv<=.01)continue;const b=X.T(ellAt(Cw,R2,AXES,m)),d=nrm(add(mul(n,.35),X.Rd([sw*.6,0,-1]))),s2=nrm(cross(d,n));
        ga(cl(fv*8,0,1),()=>{// a ragged strip: two leaves side by side, the second shorter
          mleaf(V0,add(b,mul(s2,-1.1*w)),d,s2,Ls*shK,2.4*w,KM.moss.b,{back:KM.moss.d,bend:.5,lw:1.7});mleaf(V0,add(b,mul(s2,1.6*w)),nrm(add(d,mul(s2,.18))),s2,.68*Ls*shK,2.2*w,KM.moss.b,{back:KM.moss.d,bend:.45,lw:1.7})})}};
    // the arm in four pieces: the upper arm (the boulder covers where it joins), the forearm with its bracer of sandstone, the round
    // elbow over both (no seam that jumps when they swap), the fist. Hanging or held in front, the forearm goes with its fist (behind
    // the body seen from the back); raised, it goes with the shoulder (under the boulder, never over it). It thins out at the end of the
    // curl; the fist sinks into the floor or, curling, into the body
    const fistCap=()=>{if(XI){const oc=outCap(X,TCc[0],TRc[0],AXES,XI(FC),13.6,lerp(.9,1,c));if(oc!==null)return oc}return floorCap(FC[2],13.6)};
    // the hand (forearm and fist) goes where its fist is: on the floor plan at the height of the shoulders (as the boulders) while it is
    // lower, at its own height when it is raised higher (over a shoulder it is in front of it: the camera looks down)
    const dU=Math.min(dS+5.5,dSh-.5),Fm=lerp3(El,W,.5),fUp=F(nrm(sub(El,W))),dF=lerp(D([FC[0],FC[1],Math.max(70,FC[2]-lift)]),D([16,sd*41,70]),sstep(0,.05,ain));   // (curling into the ball: where the fist was at rest)
    const fore=(Wn,kk)=>{const w=kk==null?1:kk,Wf=Wn||W,r1=10.5*ak*(.5+.5*w),r2=12*ak*(.5+.5*w);if(len(sub(Wf,El))>1){cyl(V0,Wf,r2,El,r1,Tsl);rim(P(El),r1,P(Wf),r2,.22)}
      if(ak<=.12||w<.35)return;const ba=lerp3(El,Wf,.42),bb=lerp3(El,Wf,.6),ra=lerp(r1,r2,.42)+1.4*ak,rb=lerp(r1,r2,.6)+1.4*ak;band(V0,ba,bb,ra,KAs.sand,{r2:rb,lw:2.2});
      // the rune notch on the outside of the bracer, facing up
      if(ak<.6)return;const ax=nrm(sub(Wf,El)),out=nrm(add(X.Rd([0,sd,0]),[0,0,.8])),on=nrm(sub(out,mul(ax,dot(out,ax)))),fv2=F(on);
      if(fv2>.05){const m0=lerp3(ba,bb,.5),q0=P(add(add(m0,mul(on,lerp(ra,rb,.5)-.2)),mul(ax,-2.6))),q1=P(add(add(m0,mul(on,lerp(ra,rb,.5)-.2)),mul(ax,2.6)));ctx.save();ctx.globalAlpha*=cl((fv2-.05)*4,0,1);
        ctx.lineCap='round';if(lite>.05&&!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${KL.glow},${.4*lite})`;ctx.lineWidth=6;seg(q0,q1);ctx.stroke();ctx.globalCompositeOperation='source-over'}
        ctx.strokeStyle=KAs.sand.d;ctx.lineWidth=3;seg(q0,q1);ctx.stroke();ctx.strokeStyle=cmix(KL.off,KL.lite,lite);ctx.lineWidth=1.6;seg(q0,q1);ctx.stroke();if(lite>.4){ctx.strokeStyle=KL.core;ctx.lineWidth=.7;seg(q0,q1);ctx.stroke()}ctx.restore()}};
    const elbow=()=>{const q=P(El),r=11*ak;ctx.beginPath();ctx.arc(q[0],q[1],r,0,TAU);ctx.fillStyle=grad3([q[0]-r,q[1]-r,q[0]+r,q[1]+r],Tsl);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.6*akw;ctx.stroke()};
    if(ak>.12)LB.add(ballD(lerp3(S,El,.5),dU,.1),()=>chain(V0,[S,El],[8.5*ak,9.5*ak],Tsl.b,{lw:2.8*akw,fill:limbGrad(P(S),P(El),9.5*ak,Tsl),rim:.22}));
    // the forearm and its fist in one piece: the fist over the forearm, and the forearm again over the fist as it comes toward us (it
    // fades in, so the two never swap at once)
    // (the round elbow goes with the forearm: over the upper arm when the hand is in front of it, under its round end when it is behind)
    // (when the fists come off, the forearm shrinks into the elbow, which stays with the body as the end of the stump)
    const handPiece=(FCx,FEx,cap,kk,lt)=>()=>{const Wf=kk==null?W:lerp3(El,W,kk),arm=ak>.12,fa=()=>{if(kk==null||kk>.03)fore(Wf,kk);elbow()},fi=()=>sunkDraw(V0,P(FCx),13.6,cap,()=>fistDraw(V0,FCx,FEx,sd,KE,KL,KM,lt,A));
      if(!arm){fi();return}if(fUp>=.3){fi();fa()}else{fa();fi();if(fUp>0)ga(sstep(0,.3,fUp),fa)}};
    // the fists come off and roll away when it is defeated: the same forearm shrinks into the elbow, the fist rolls out from where it was
    // (as the body crumbles the stump goes with it, the fist stays where it rolled to)
    if(A.fistOff>0){const k=A.fistOff,kk=1-sstep(.1,.7,k),FCd=[FC[0]+3*k,FC[1]+sd*18*ez(k),lerp(FC[2],13,ez(k))],FE2={u:rotXv(FE.u,sd*k*5),v:rotXv(FE.v,sd*k*5),w:rotXv(FE.w,sd*k*5)};
      if(A.crumble<=0)LB.add(dF,handPiece(FCd,FE2,floorCap(FCd[2],13.6),kk,fl*(1-k)));
      else{if(ak>.12)LB.add(dF-.1,()=>{if(kk>.03)fore(lerp3(El,W,kk),kk);elbow()});L.add(dF,()=>sunkDraw(V0,P(FCd),13.6,floorCap(FCd[2],13.6),()=>fistDraw(V0,FCd,FE2,sd,KE,KL,KM,fl*(1-k),A)))}}
    else LB.add(ballD(lerp3(W,FC,.5),dF,.2),handPiece(FC,FE,fistCap(),null,fl))}
  // ---------------- the standing stones: on the hump; teeth of the ball; crooked in the statue; fallen when it is defeated
  for(let i=0;i<5;i++){const s=SG[i],ci=A.stc?A.stc[i]:c;let b,d;
    {// upright, with its extra lean
      const ex=A.st[i];let d0=s.d;if(ex){const ax=nrm(cross([0,0,1],s.t));d0=rotAx(s.d,ax,ex)}b=X.T(s.b);d=X.Rd(d0);
      if(A.fall[i]>0){const back=X.Rd(nrm([-1,s.t[1]*.35,-.12]));d=nrm(add(mul(d,1-A.fall[i]),mul(back,A.fall[i])))}
      if(c>0||ci>0){// sliding round the ball to its slot (the ball turns with the spin; the big one ends on top). The base goes with the body;
        // opening, each stone keeps its tooth's tilt a moment longer (ci) and then stands up, one after the other
        const th0=Math.atan2(s.b[0],s.b[2]-BC[2]),r0=Math.hypot(s.b[0],s.b[2]-BC[2]);let th1=s.slot+A.spin;th1=th0+Math.atan2(Math.sin(th1-th0),Math.cos(th1-th0));
        const th=lerp(th0,th1,c),rr=lerp(r0,BR-3,c),zk=lerp(1,BRZ/BR,c),bb=[BC[0]+Math.sin(th)*rr,lerp(s.b[1],0,c),BC[2]+Math.cos(th)*rr*zk];
        const thd=lerp(th0,th1,ci),rad=nrm([Math.sin(thd)/BR,0,Math.cos(thd)/BRZ]),dd=rotYa(d0,thd-th0);b=X.T(bb);d=X.Rd(nrm(lerp3(dd,rad,ci)))}
      if(A.drop>0){b=lerp3(b,s.lie,ez(A.drop));d=nrm(lerp3(d,nrm(s.ld),ez(A.drop)))}}
    // upright on the hump a stone always goes over the torso; while the hump under its foot turns away from us it is cut where the torso
    // covers it (its foot is behind the hump): no swap with the torso, nor with the pieces in front of it, as the body turns
    const ballOrd=c>=.5,nb=lerp(F(X.Rd(ellN(TR[2],AXES,nrm(sub(s.b,TC[2]))))),F(d),sstep(0,.5,c)),dm=D(add(b,mul(d,s.h*.5))),crum=A.crumble>0&&A.fall[i]>0,
      dd=ballOrd?(F(d)<0?dT-1:dT+1):crum?(nb<=0?Math.min(dm,dT-.6):Math.max(dm,dT+.6)):Math.max(dT+.5,D(s.b)-2),cutT=!ballOrd&&!crum&&nb<=0;
    L.add(dd,()=>{const draw=()=>stoneDraw(V0,b,d,i,KS,KL,KM,KF,A,c>.3||A.drop>0);if(!cutT||!J.thull||!J.thull.path){draw();return}
      if(!J.tcut){J.tcut=new Path2D();J.tcut.rect(-1e4,-1e4,2e4,2e4);J.tcut.addPath(J.thull.path)}ctx.save();ctx.clip(J.tcut,'evenodd');draw();ctx.restore()})}
  // ---------------- the head: its own camera (it keeps looking at you while the body sways); it sinks into the chest when it curls up
  const hyR=A.hy-A.yaw+cheat(face,.3)*(1-c),hpR=A.hp-A.lean*.8,HR=v=>X.Rd(rotZ(rotY(v,hpR),hyR)),hc0=add(HC,[A.hx,0,A.hz]),Hc=X.T(hc0);
  const headF=()=>headDraw(V0,Hc,HR,A,KH,KM,KY,KL);
  LB.add(D(HC)+3,c>0?()=>sunkDraw(V0,P(Hc),15,outCap(X,TCc[0],TRc[0],AXES,hc0,15,lerp(.92,1,c)),headF):headF);
  // the four tufts of moss of the statue (on the head and the shoulders), then falling off
  if(A.tufts||A.tfall>=0){const k=A.tfall<0?0:A.tfall;for(const[i,c0,sz] of TUFTS){const p0=i<2?add(Hc,HR(c0)):X.T([c0[0],c0[1],c0[2]]),e=ez(cl(k/.45,0,1)),end=[p0[0]+(i%2?6:-6)*e+c0[1]*.2*e,p0[1]*(1+.25*e),2.5],
      q3=k>0?add(lerp3(p0,end,e),[0,0,(1-e)*e*14]):p0,al=1-sstep(.6,1,k);L.add(D(q3)+(k>0?2:4),()=>{ctx.save();ctx.globalAlpha*=al;tuft(V0,q3,sz,KM,k*6+i);ctx.restore()})}}
  // ---------------- the second phase: three hot stones going round the chest (with the room's clock, not the move's)
  if(A.rocks&&c<.3&&!LOWFX){const t=anim==='die'?(G.t||0)-4*p+Math.min(4*p,.48):(G.t||0);for(let i=0;i<3;i++){const be=t*TAU/2.4+i*TAU/3-face,fallK=A.rockFall,pz=lerp(56+3*Math.sin(t*2.2+i*2),4,ez(fallK)),pr0=[A.B[0]+68*Math.cos(be),A.B[1]+68*Math.sin(be),pz+lift*(1-fallK)],pr=A.rockIn>0?lerp3(pr0,X.T([24,0,44]),ez(A.rockIn)):pr0;L.add(D(pr),()=>ga(A.rocks,()=>hotRock(V0,pr,4.5,i*1.7+t*3*(1-fallK),fallK)))}}
  // ---------------- the slab in its hands, the pauldrons flying off
  if(A.slab){const s=A.slab,cy=Math.cos(A.yaw),sy=Math.sin(A.yaw),c3=add(s.c,[0,0,lift]);L.add(D(c3)+1,()=>slabAt(V0,c3,s.tilt,[cy,sy,0],[-sy,cy,0],A.k2>.5||!!o.p2,c3[2]<8?1:null))}
  if(A.pfly>=0){const k=A.pfly;for(const sd of[-1,1]){const pz=k<.4?lerp(PAUL[2],100,ez(k/.4)):100*(1-Math.pow((k-.4)/.6,2)),pp=[lerp(PAUL[0],-4,k),sd*lerp(PAUL[1],72,k),Math.max(8,pz)],rot=k*TAU*1.5;
    L.add(D(pp)+3,()=>ga(sstep(0,.06,k),()=>{const tilt=sd*PTILT,E=[[1,0,0],rotXv([0,1,0],tilt+sd*rot),rotXv([0,0,1],tilt+sd*rot)].map(X.Rd);pauldron(V0,X.T(pp),E,KA,sd,0,KL)}))}}
  // ---------------- the defeat: the mound of boulders, the keystone rolling out, the flowers
  if(A.crumble>0){const m=A.crumble;L.add(dT-.5,()=>{ctx.save();ctx.globalAlpha*=sstep(0,.6,m);mound(V0,X,KT,KM,KH,A,face);ctx.restore()})}
  if(A.key>=0){const k=A.key,a0=X.T(ellAt(TC[0],TR[0],AXES,HM)),endp=[30,0,4],pos=lerp3(a0,endp,ez(k)),zb=pos[2]+Math.sin(Math.PI*k)*10*(1-k),
      n0=X.Rd(ellN(TR[0],AXES,HM)),n=nrm(lerp3(n0,nrm([.5,.15,.86]),ez(k))),q3=[pos[0],pos[1],Math.max(4,zb)];
    L.add(D(q3)+8,()=>{const KK=Object.assign({},KL);const at=coin(V0,q3,n,nrm(lerp3(X.Rd([0,0,1]),[1,0,0],ez(k))),KK,{drot:0,dslide:0,gem:0,heart:A.keyGlow,keyCrack:A.keyCrack});
      if(!LOWFX&&A.keyGlow>0){const q=P(q3);shine(K1.hglow,q[0],q[1],18,.6*A.keyGlow)}})}
  // ---------------- the body as one picture fading into the mound
  if(A.crumble>0){const m=A.crumble,LBs=LB.slice().sort((a,b)=>a.d-b.d);L.add(dT,()=>fadeDraw(()=>{for(const e of LBs){ink(2.4);e.f()}},P(X.T([4,0,48])),88,1-m))}
  else for(const e of LB)L.push(e);
  // ---------------- the effects of the moves
  if(fx)for(const e of A.fx)fxDraw(V0,X,L,e,A,J,Hc,HR,KT,KL,face,lift);
  run(L);
  ctx.restore()}
const rotXv=(v,a)=>{const c=Math.cos(a),s=Math.sin(a);return[v[0],v[1]*c-v[2]*s,v[1]*s+v[2]*c]};
const rotYa=(v,a)=>rotY(v,a);
// v turned round the unit axis ax by a (Rodrigues)
function rotAx(v,ax,a){const c=Math.cos(a),s=Math.sin(a);return add(add(mul(v,c),mul(cross(ax,v),s)),mul(ax,dot(ax,v)*(1-c)))}
const PAUL=[3,52,73],PTILT=.23;   // where the pauldron starts its flight (its middle on the boulder), how much its top leans in
// the pauldron on the shoulder: a plate of slate that hugs the outside of the boulder (a patch of the boulder grown by its thickness, its
// outline a shield: straight on the sides, a rounded point below); a rim of sandstone shows under its lower edge, the rune notch in its
// middle lights with the bracer. Only what faces us is drawn
const PM=nrm([.18,1,.22]),PAL=.6,PAV=.6,shieldF=t=>1-.18*Math.max(0,-Math.cos(t))*Math.sin(t)*Math.sin(t)*1.6;
function paulCap(V0,X,Cw,Rs,sd,K,KL,lite){const{P,F}=V0,m=[PM[0],sd*PM[1],PM[2]],Rp=add(Rs,[3.6,3.6,3.6]),Rr=add(Rs,[3,3,3]),ms=nrm(add(m,[-.04,0,-.26]));
  const q=P(X.T(ellAt(Cw,Rp,AXES,m))),bb=[q[0]-11,q[1]-11,q[0]+11,q[1]+11];
  let r=ellCap(V0,X,Cw,Rr,AXES,ms,PAL+.06,24,{alv:PAV+.05,u:[0,0,1],ck:'pr'+sd,rf:shieldF});
  if(r){ctx.fillStyle=grad3(bb,K.sand);ctx.fill();ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke()}
  r=ellCap(V0,X,Cw,Rp,AXES,m,PAL,24,{alv:PAV,u:[0,0,1],ck:'pp'+sd,rf:shieldF});if(!r)return;
  ctx.fillStyle=grad3(bb,K.paul);ctx.fill();ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.stroke();if(r.rim&&r.rim.length>2)rimOpen(r.rim,.3,r.full);
  // the rune notch, down the middle of the plate
  const n=X.Rd(ellN(Rp,AXES,m)),fo=F(n);if(fo>.05){const up=nrm(sub([0,0,1],mul(m,m[2]))),q0=P(X.T(ellAt(Cw,Rp,AXES,nrm(add(m,mul(up,-.2)))))),q1=P(X.T(ellAt(Cw,Rp,AXES,nrm(add(m,mul(up,.16))))));
    ctx.save();ctx.globalAlpha*=cl((fo-.05)*4,0,1);ctx.lineCap='round';const lt=lite||0;
    if(lt>.05&&!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${KL.glow},${.4*lt})`;ctx.lineWidth=5.5;seg(q0,q1);ctx.stroke();ctx.globalCompositeOperation='source-over'}
    ctx.strokeStyle=K.gap;ctx.lineWidth=2.8;seg(q0,q1);ctx.stroke();ctx.strokeStyle=cmix(KL.off,KL.lite,lt);ctx.lineWidth=1.5;seg(q0,q1);ctx.stroke();if(lt>.4){ctx.strokeStyle=KL.core;ctx.lineWidth=.6;seg(q0,q1);ctx.stroke()}ctx.restore()}}
// the four tufts of moss of the statue: [index, where (head frame for 0-1, body for 2-3), size]
const TUFTS=[[0,[-1,-5,12.5],1],[1,[1,6,12],.85],[2,[0,-30,88],1.1],[3,[4,34,88],1]];
function tuft(V0,c,s,K,seed){const{P}=V0,q=P(c),r=5*s;ctx.lineJoin='round';const pts=[];for(let i=0;i<9;i++){const a=i/9*TAU,rr=r*(1+.18*Math.sin(i*2.7+seed));pts.push([q[0]+Math.cos(a)*rr,q[1]+Math.sin(a)*rr*.62-2*s])}
  smooth(pts);ctx.fillStyle=grad3(bbox(pts),K.moss);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke();ctx.fillStyle=K.moss.l;ball([q[0]-r*.3,q[1]-r*.55],1.4*s);ctx.fill();ball([q[0]+r*.3,q[1]-r*.35],1.1*s);ctx.fill()}
// a pauldron: a slab of light slate standing on the outside of the shoulder (the top leans in), its lower edge of sandstone
// a plate bent round an axis along x (a pauldron that wraps the shoulder): half length hx, half thickness t, bend radius rb at its middle,
// from the angle a0 to a1 (0 = the middle, + up); in its own axes (x forward, y out, z up). Its corners and its faces with their normals
// are made once; plateDraw turns them with the axes E (y mirrored by sd), scales by k, moves to c, paints the faces that look at us in
// their tone and the thick outline round them all
const PLT={};
function plateT(hx,t,rb,a0,a1,n){const id=[hx,t,rb,a0,a1,n].join();let T=PLT[id];if(T)return T;const V=[],at=(x,j,side)=>{const a=a0+(a1-a0)*j/n,r=rb+side*t,w=shieldW(a);return[x*w,r*Math.cos(a)-rb,r*Math.sin(a)]};
  // corners: for each row j, [outer -x, outer +x, inner +x, inner -x]
  for(let j=0;j<=n;j++)V.push(at(-hx,j,1),at(hx,j,1),at(hx,j,-1),at(-hx,j,-1));const I=(j,q)=>j*4+q,F=[];
  for(let j=0;j<n;j++){const am=a0+(a1-a0)*(j+.5)/n,co=Math.cos(am),si=Math.sin(am);F.push({i:[I(j,0),I(j,1),I(j+1,1),I(j+1,0)],n:[0,co,si],o:1},{i:[I(j,3),I(j,2),I(j+1,2),I(j+1,3)],n:[0,-co,-si]})}
  const sx=q=>{const a=[];for(let j=0;j<=n;j++)a.push(I(j,q===1?1:0));for(let j=n;j>=0;j--)a.push(I(j,q===1?2:3));return a};F.push({i:sx(1),n:[1,0,0],e:1},{i:sx(0),n:[-1,0,0],e:1});
  F.push({i:[I(0,0),I(0,1),I(0,2),I(0,3)],n:[0,Math.sin(a0),-Math.cos(a0)],e:1},{i:[I(n,0),I(n,1),I(n,2),I(n,3)],n:[0,-Math.sin(a1),Math.cos(a1)],e:1});
  return PLT[id]={V,F}}
// the outline of the pauldron, a shield: as wide as it is at the top, narrowing to a rounded point below (a: the angle along its bend)
const shieldW=a=>a>=0?1-.1*(a/.62)*(a/.62):Math.sqrt(Math.max(.06,1-.8*(a/.66)*(a/.66)));
// the faces of a bent plate that look at us, each in its tone (the edges a little lighter, so the curve reads from the side), the outer
// face lit from the upper left, the thick outline round them all
function plateDraw(V0,c,E,sd,k,TT,T,lw){const{P,F}=V0,e0=E[0],e1=mul(E[1],sd),e2=E[2],W=q=>[c[0]+(e0[0]*q[0]+e1[0]*q[1]+e2[0]*q[2])*k,c[1]+(e0[1]*q[0]+e1[1]*q[1]+e2[1]*q[2])*k,c[2]+(e0[2]*q[0]+e1[2]*q[1]+e2[2]*q[2])*k];
  const PV=TT.V.map(q=>P(W(q))),H=hullE(PV,.02);if(H.length<3)return H;ctx.lineJoin='round';poly(H);ctx.fillStyle=T.b;ctx.fill();
  for(const f of TT.F){const m=f.n,n=[e0[0]*m[0]+e1[0]*m[1]+e2[0]*m[2],e0[1]*m[0]+e1[1]*m[1]+e2[1]*m[2],e0[2]*m[0]+e1[2]*m[1]+e2[2]*m[2]];if(F(n)<=.01)continue;
    ctx.beginPath();for(const i of f.i)ctx.lineTo(PV[i][0],PV[i][1]);ctx.closePath();ctx.fillStyle=tone(T,lit(V0,n)+(f.o?.04:f.e?.1:0));ctx.fill()}
  poly(H);ctx.strokeStyle=INK;ctx.lineWidth=lw||2.4;ctx.stroke();return H}
const PLATE=plateT(10.5,1.8,18,-.62,.62,6),PRIMT=plateT(10.7,2.2,18,-.7,-.5,1);   // the pauldron (21 wide, a shield bent round the shoulder), its rim of sandstone
// the notch of rune on the outer face of a flying or fallen pauldron: the screen ends of the groove (a along the bend)
const plateNotch=(V0,c,E,sd,k)=>{const ou=mul(E[1],sd),r=18+1.85,on=a=>V0.P(add(c,add(mul(ou,(r*Math.cos(a)-18)*k),mul(E[2],r*Math.sin(a)*k))));return[on(-.22),on(.16)]};
function pauldron(V0,c,E,K,sd,lite,KL,k){k=k==null?1:k;const{F}=V0,ou=mul(E[1],sd),fo=F(ou);
  plateDraw(V0,c,E,sd,k,PRIMT,K.sand,2);plateDraw(V0,c,E,sd,k,PLATE,K.paul,2.4);
  // the rune notch in the middle of the outer face, lit with the bracer when the light runs down the arm
  if(fo>.05&&k>.6){const[q0,q1]=plateNotch(V0,c,E,sd,k),lt=lite||0;ctx.save();ctx.globalAlpha*=cl((fo-.05)*4,0,1);ctx.lineCap='round';
    if(lt>.05&&!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${KL.glow},${.4*lt})`;ctx.lineWidth=5.5;seg(q0,q1);ctx.stroke();ctx.globalCompositeOperation='source-over'}
    ctx.strokeStyle=K.gap;ctx.lineWidth=2.8;seg(q0,q1);ctx.stroke();ctx.strokeStyle=cmix(KL.off,KL.lite,lt);ctx.lineWidth=1.5;seg(q0,q1);ctx.stroke();if(lt>.4){ctx.strokeStyle=KL.core;ctx.lineWidth=.6;seg(q0,q1);ctx.stroke()}ctx.restore()}}
// a fist: a big round block of slate on its knuckles (three polished knuckles in front, low), the grooves of the fingers, the thumb on the side
// toward the body, the rune on its back (lit with the arm) and a tuft of moss
function fistDraw(V0,c,E,sd,K,KL,KM,lite,A){const{P,F}=V0,Fr={u:E.u,v:E.v,w:E.w},at=m=>add(c,add(add(mul(E.u,m[0]*FR[0]),mul(E.v,m[1]*FR[1])),mul(E.w,m[2]*FR[2]))),nAt=m=>nrm(add(add(mul(E.u,m[0]/FR[0]),mul(E.v,m[1]/FR[1])),mul(E.w,m[2]/FR[2])));
  const KN=[-1,0,1].map(k=>nrm([.9,k*.42,-.2])),kn=m=>{const q=add(at(mul(m,.9)),[0,0,0]);return q};
  const back=[],front=[];for(const m of KN)(F(nAt(m))<0?back:front).push(m);
  const knks=ms=>{if(!ms.length)return;ctx.beginPath();const Q=ms.map(m=>P(kn(m)));for(const q of Q){ctx.moveTo(q[0]+3.7,q[1]);ctx.arc(q[0],q[1],3.7,0,TAU)}ctx.fillStyle=K.knuck.b;ctx.fill();ctx.strokeStyle='rgba(16,20,24,.55)';ctx.lineWidth=1.1;ctx.stroke();ctx.beginPath();for(const q of Q){ctx.moveTo(q[0]+.3,q[1]-1.1);ctx.arc(q[0]-.8,q[1]-1.1,1.1,0,TAU)}ctx.fillStyle=K.knuck.l;ctx.fill()};
  knks(back);
  const hp=svol3(V0,ellSil(V0,c,FR,Fr,null,14),K.slate,{lw:3,scr:1,rim:.28});
  ctx.save();
  // the grooves between the fingers, over the front of the fist
  ctx.strokeStyle='rgba(16,20,24,.5)';ctx.lineWidth=1.4;ctx.lineCap='round';ctx.beginPath();for(const k of[-.21,.21]){let st=true;for(let j=0;j<=4;j++){const e=-.5+j/4*.95,m=nrm([Math.cos(e),k,Math.sin(e)]);if(F(nAt(m))>.08){const q=P(at(m));if(st){ctx.moveTo(q[0],q[1]);st=false}else ctx.lineTo(q[0],q[1])}else st=true}}ctx.stroke();
  // the rune on the back of the hand: a rhombus that lights with the arm
  {const m=nrm([.45,sd*.42,.78]),n=nAt(m),fv=F(n);if(fv>.08){const o=at(m),[u2,v2]=frm(n,E.w),pts=[[0,4],[2.6,0],[0,-4],[-2.6,0]].map(([a,b])=>P(add(o,add(mul(v2,a),mul(u2,b)))));ctx.save();ctx.globalAlpha*=cl((fv-.08)*4,0,1);
    ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.closePath();if(lite>.05&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${KL.glow},${.4*lite})`;ctx.lineWidth=5;ctx.stroke();ctx.restore()}
    ctx.strokeStyle=K.gap;ctx.lineWidth=2.8;ctx.stroke();ctx.strokeStyle=cmix(KL.off,KL.lite,lite);ctx.lineWidth=1.5;ctx.stroke();if(lite>.4){ctx.strokeStyle=KL.core;ctx.lineWidth=.6;ctx.stroke()}ctx.restore()}}
  ctx.restore();
  // the tuft of moss on the back of the fist
  {const m=nrm(add(add(mul(E.w,.85),mul(E.u,-.25)),mul(E.v,sd*.45))),n=nAt(m);if(F(n)>-.1){const q=P(at(mul(m,1.04))),pts=[];for(let i=0;i<8;i++){const a2=i/8*TAU;pts.push([q[0]+Math.cos(a2)*4.6*(1+.15*Math.sin(i*2.3)),q[1]+Math.sin(a2)*3*(1+.15*Math.cos(i*1.9))-1])}
    ctx.lineJoin='round';smooth(pts);ctx.fillStyle=KM.moss.d;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();ctx.fillStyle=KM.moss.b;ball([q[0]-1.4,q[1]-1.6],1.2);ctx.fill();ball([q[0]+1.5,q[1]-1.2],.9);ctx.fill()}}
  // the thumb on the inner side, the knuckles in front
  {const m0=nrm([.5,-sd*.85,.15]),n=nAt(m0);if(F(n)>-.15){const a=at(mul(m0,.85)),b=add(a,add(mul(E.u,6),mul(E.w,-3)));caps(V0,a,3.2,b,2.9,K.slate.b,{lw:1.6,fill:K.slate.b,noRim:1})}}
  knks(front)}
// a standing stone (faceted slate, darker than the body): its rune (a stroke and a dot) on the side that looks out, a collar of three little
// leaves of moss at its foot, its tip lit like a candle in the second phase
function stoneDraw(V0,b,d,i,K,KL,KM,KF,A,clip){if(clip){stoneClip(V0,b,d,i,K,A);return}const s=SG[i],{F,P}=V0;
  // its corners, straight from the fixed angles of the stone (no faces built: the stone is one smooth shape with seams)
  const tb=s.tb||(s.tb=Array.from({length:8},(_,k)=>{const a=k/8*TAU+s.tw,m=(k+.5)/8*TAU+s.tw;return[Math.cos(a),Math.sin(a),Math.cos(m),Math.sin(m),k===s.chip?-s.h*.18:k===(s.chip+1)%8?-s.h*.07:0]}));
  const[u,v]=frm(d,[1,0,0]),r0=s.r0*1.04,r2=s.r1*.82,h=s.h,R=(k,z,r)=>{const t=tb[k];return[b[0]+d[0]*z+(u[0]*t[0]+v[0]*t[1])*r,b[1]+d[1]*z+(u[1]*t[0]+v[1]*t[1])*r,b[2]+d[2]*z+(u[2]*t[0]+v[2]*t[1])*r]};
  const PV=new Array(16);for(let k=0;k<8;k++){PV[k]=P(R(k,-2,r0));PV[8+k]=P(R(k,h+tb[k][4],r2))}
  const col=i<3?[.4,3.3].map(a=>nrm(add(mul(u,Math.cos(a+s.tw)),mul(v,Math.sin(a+s.tw))))):[],leafAt=m=>{const bb=add(b,add(mul(m,s.r0*.9),mul(d,.5)));mleaf(V0,bb,nrm(add(mul(m,.85),mul(d,-.35))),nrm(cross(m,d)),6,2.6,KM.moss.b,{back:KM.moss.d,lw:1.6,bend:.3})};
  for(const m of col)if(F(m)<0)leafAt(m);
  const H=chull(PV);if(H.length<3)return;const qb=P(b),qt=P(add(b,mul(d,h*.6)));ctx.lineJoin='round';poly(H);ctx.fillStyle=limbGrad(qb,qt,s.r0*.95,K.stone);ctx.fill();
  // the seams between the sides that face us, the lit top, the outline
  const tp=(r0-r2)/(h+2),sideN=k=>{const t=tb[k];return[u[0]*t[2]+v[0]*t[3]+d[0]*tp,u[1]*t[2]+v[1]*t[3]+d[1]*tp,u[2]*t[2]+v[2]*t[3]+d[2]*tp]},vis=new Array(8);for(let k=0;k<8;k++)vis[k]=F(sideN(k))>0;
  ctx.beginPath();for(let k=0;k<8;k++)if(vis[k]&&vis[(k+7)%8]){const e0=PV[k],e1=PV[8+k];ctx.moveTo(e0[0],e0[1]);ctx.lineTo(e1[0],e1[1])}ctx.strokeStyle='rgba(16,20,24,.32)';ctx.lineWidth=1;ctx.stroke();
  const fd=F(d);if(fd>0){ctx.beginPath();for(let k=8;k<16;k++)ctx.lineTo(PV[k][0],PV[k][1]);ctx.closePath();ctx.fillStyle=K.stone.l;ctx.fill()}
  poly(H);ctx.strokeStyle=INK;ctx.lineWidth=2.3;ctx.stroke();
  // the rune on the side that looks out (back or to its side): a stroke and a dot
  if(s.rf==null){let bd2=-2;for(let k=0;k<8;k++){const t=tb[k],dd=dot(nrm([t[2],t[3],0]),[dot(s.t,frm(s.d,[1,0,0])[0]),dot(s.t,frm(s.d,[1,0,0])[1]),0]);if(dd>bd2){bd2=dd;s.rf=k}}}
  {const k=s.rf,fv=F(nrm(sideN(k)));if(fv>.12){const k2=(k+1)%8,b0=lerp3(R(k,-2,r0),R(k2,-2,r0),.5),t0=lerp3(R(k2,h+tb[k2][4],r2),R(k,h+tb[k][4],r2),.5),q0=P(lerp3(b0,t0,.3)),q1=P(lerp3(b0,t0,.6)),q2=P(lerp3(b0,t0,.76)),lt=A.sr;
    ga(cl((fv-.12)*4,0,1),()=>{ctx.lineCap='round';if(lt>.05&&!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${KL.glow},${.35*lt})`;ctx.lineWidth=4.5;seg(q0,q1);ctx.stroke();ctx.globalCompositeOperation='source-over'}
    ctx.strokeStyle=cmix(KL.off,KL.lite,lt);ctx.lineWidth=1.8;seg(q0,q1);ctx.stroke();ctx.fillStyle=ctx.strokeStyle;ball(q2,1.1);ctx.fill();if(lt>.4){ctx.strokeStyle=KL.core;ctx.lineWidth=.7;seg(q0,q1);ctx.stroke()}})}}
  // the candle at the tip (second phase)
  const cd=A.candle[i];if(cd>.02){ctx.save();ctx.globalAlpha*=cd;if(fd>0){ctx.beginPath();for(let k=8;k<16;k++)ctx.lineTo(PV[k][0],PV[k][1]);ctx.closePath();ctx.fillStyle=K1.candle;ctx.fill()}
    const q=P(add(b,mul(d,h)));if(!LOWFX)shine(K1.candleRgb,q[0],q[1],9,.55*cd);ctx.fillStyle='#fffbe8';ball(q,1.2);ctx.fill();ctx.restore()}
  for(const m of col)if(F(m)>=0)leafAt(m);
  // two little mushrooms at the foot of the big stone
  if(i===0&&A.drop<=0)for(const[a,sz] of[[2.2,.85],[3.2,.7]]){const m=nrm(add(mul(u,Math.cos(a)),mul(v,Math.sin(a))));if(F(m)<-.1)continue;shroom(V0,add(b,add(mul(m,s.r0+1.2),mul(d,1))),d,sz,KF)}}
// a stone cut at the floor (the teeth of the ball, the stones fallen in the defeat): its faces, each in its tone
function stoneClip(V0,b,d,i,K,A){const s=SG[i],sf=stoneF(b,d,s.h,s.r0,s.r1,s.tw,s.chip),faces=sf.F.map(clipZ).filter(f=>f.length>2);if(!faces.length)return;facets(V0,faces,K.stone,{lw:2.3,seam:false});
  const cd=A.candle[i];if(cd>.02){const q=V0.P(sf.tip);ctx.save();ctx.globalAlpha*=cd;if(!LOWFX)shine(K1.candleRgb,q[0],q[1],9,.55*cd);ctx.fillStyle='#fffbe8';ball(q,1.2);ctx.fill();ctx.restore()}}
// the head (see the model): Hc its centre, HR turns its directions into the body's
function headDraw(V0,Hc,HR,A,K,KM,KY,KL){const{P,F}=V0,T=q=>add(Hc,HR(q)),fwd=F(HR([1,0,0])),ja=A.jaw,HG=[2,0,-5],jd=2.5*cl(ja/.45,0,1);
  // the jaw turns down round its hinge and drops a little more, so the open mouth shows
  const rj=q=>{const r=add(HG,rotY(sub(q,HG),ja));r[2]-=jd;return r},rjd=v=>rotY(v,ja);
  const jaw=()=>{const E=[HR(rjd([1,0,0])),HR(rjd([0,1,0])),HR(rjd([0,0,1]))],cc=T(rj([9,0,-8]));slabDraw(V0,cc,E,[5.5,12,4],1.6,K.sand,{lw:2.4,noTop:1});
    // the tufts of moss on the chin
    for(const sd of[-1,1]){const b0=T(rj([8,sd*11,-11])),d=HR(rjd(nrm([.15,sd*.3,-1]))),s=HR(rjd([1,0,0]));mleaf(V0,b0,nrm(add(d,[A.sway*.5,0,0])),s,6,2.6,KM.moss.b,{back:KM.moss.d,lw:1.5,bend:.4})}};
  const tusks=()=>{if(fwd>-.2){ctx.save();ctx.globalAlpha*=cl((fwd+.2)*3,0,1);for(const sd of[-1,1]){const b0=T(rj([14,sd*8.5,-5])),tp=T(rj([15.2,sd*9.6,.2])),qa=P(b0),qb=P(tp);ctx.fillStyle=K.tusk;ctx.strokeStyle=INK;ctx.lineWidth=1.2;tri(qa[0],qa[1],qb[0],qb[1],1.25);
        ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=.6;seg([qa[0]-.4,qa[1]-.5],[lerp(qa[0],qb[0],.7)-.3,lerp(qa[1],qb[1],.7)]);ctx.stroke()}ctx.restore()}};
  // the brow: two slabs of sandstone in a V, each from its outer end a (higher) to its inner end b (lower, over the nose). The one on the
  // side that turns away, or both when the face turns away, draws its outer end in toward the middle (no horn standing out of the
  // profile or the back of the head). Each goes over the skull while it faces us, behind it when it does not
  const BR=[-1,1].map(sd=>{const dz=A.brow,fs=F(HR([0,sd,0])),kIn=Math.max(sstep(.05,.5,-fs),sstep(-.05,-.5,fwd)),a=lerp3([7,sd*15.5,6.2-dz],[8.5,sd*9,2.6-dz],kIn),b=[12,sd*1.6,.6-dz-2.4*A.squint],
    e1=nrm(sub(b,a)),e2=nrm(sub([1,0,0],mul(e1,e1[0])));let e3=nrm(cross(e1,e2));if(e3[2]<0)e3=mul(e3,-1);return{sd,a,b,e1,e2,e3,fb:F(HR(ellN(HRD,null,nrm(lerp3(a,b,.45)))))}});
  const brow=(w,E)=>{const{a,b,e1,e2,e3}=w,blk=(c0,h1,h2,h3)=>{const out=[];for(const s1 of[-1,1])for(const s2 of[-1,1])for(const s3 of[-1,1])out.push(T(add(c0,add(add(mul(e1,s1*h1),mul(e2,s2*h2)),mul(e3,s3*h3)))));return out};
    const cB=add(b,mul(e1,-.6)),cM=lerp3(a,b,.45),cA=add(a,mul(e1,1));
    // over the face it never hides more than the top of an eye (an eye slid in toward the middle as the head turns stays whole)
    let cut=false;if(E){for(const e of E){if(e.rx<.6)continue;const sq=A.blink*(1-.35*A.squint);if(sq<.25)continue;const sy=3.1*Math.max(.12,sq);if(!cut){ctx.save();ctx.beginPath();ctx.rect(-1e4,-1e4,2e4,2e4);cut=true}
      const cx=e.q[0],cy=e.q[1]+sy*.35,rx=e.rx*1.05+.4,ry=sy*.92;ctx.moveTo(cx+rx,cy);ctx.ellipse(cx,cy,rx,ry,0,0,TAU)}if(cut)ctx.clip('evenodd')}
    svol3(V0,blk(cB,1.6,2.9,2.5).concat(blk(cM,2,2.6,1.9),blk(cA,1.6,2.1,1.3)),K.sand,{lw:2.2});
    // the light on its top edge
    const tp=[T(add(cA,add(mul(e3,1.3),mul(e2,-.6)))),T(add(add(cM,mul(e3,2)),mul(e2,-.6))),T(add(cB,add(mul(e3,2.5),mul(e2,-.8))))].map(P);
    ctx.strokeStyle='rgba(255,246,220,.55)';ctx.lineWidth=1.4;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();for(const q of tp)ctx.lineTo(q[0],q[1]);ctx.stroke();
    // the eye under it lights the stone from below
    const on=w.sd<0?A.eyeL:A.eyeR;if(E&&!LOWFX&&on>.05&&A.glow>0){const lo=[T(add(cA,add(mul(e3,-1.3),mul(e2,1.2)))),T(add(add(cM,mul(e3,-1.9)),mul(e2,1.5))),T(add(cB,add(mul(e3,-2.5),mul(e2,1.7))))].map(P);
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${KY.eye},${.35*Math.min(1,A.glow)*on})`;ctx.lineWidth=1.6;ctx.beginPath();for(const q of lo)ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.restore()}
    if(cut)ctx.restore()};
  jaw();
  for(const w of BR)if(w.fb<=.02)brow(w,null);
  const sk=svol3(V0,ellSil(V0,[0,0,0],HRD,null,T,14),K.slate,{lw:3,rim:.3,scr:1});
  if(fwd>-.2&&ja>.03)mouthHole();
  const at=m=>({q:P(T(ellAt([0,0,0],HRD,null,m))),v:F(HR(ellN(HRD,null,m)))}),h=P(Hc);let E=[];
  ctx.save();clipTo(sk);
  // the dark of the brow over the eyes, a crack on the top of the head
  if(fwd>-.4){const a0=P(T([10.5,-8,-1])),a1=P(T([10.5,8,-1])),cq=P(T([11.5,0,-1.2])),w=Math.hypot(a1[0]-a0[0],a1[1]-a0[1])/2+3.5;ctx.fillStyle=`rgba(8,12,14,${.42*cl((fwd+.4)*2,0,1)})`;ctx.beginPath();ctx.ellipse(cq[0],cq[1],w,4.4,Math.atan2(a1[1]-a0[1],a1[0]-a0[0]),0,TAU);ctx.fill()}
  {const ms=[[-.5,.85],[-.42,.62],[-.55,.42]].map(a=>dir(a[0],a[1])),pts=[];for(const m of ms){const n=HR(ellN(HRD,null,m));if(F(n)>.05)pts.push(P(T(ellAt([0,0,0],HRD,null,m))))}
    if(pts.length>1){ctx.save();ctx.translate(.6,.8);strokeRuns([pts],'rgba(255,248,230,.17)',1.1);ctx.restore();strokeRuns([pts],'rgba(22,18,16,.75)',1.5)}}
  // the eyes: dark sockets with a point of mint light (each eye on its own: they light up and go out one at a time)
  E=eyes(null,h,13,{at,dir:[1,.5,-.2],kind:'dark',col:KY.sock,rx:4,ry:3.1,light:false,blink:A.blink,squint:A.squint,a:.62,b:.8,gap:1.6});
  const sq=A.blink*(1-.35*A.squint);for(const e of E){if(e.rx<.6)continue;const on=e.sd<0?A.eyeL:A.eyeR;if(on<=.01||sq<.25)continue;const sy=3.1*Math.max(.12,sq),r=Math.min(e.rx*.8,sy)*.62*(.35+.65*on),c0=[e.q[0],e.q[1]+sy*.12];
    ctx.fillStyle=LOWFX?`rgb(${KY.eye})`:cmix(KY.sock,KY.pupil,.35);ctx.beginPath();ctx.ellipse(c0[0],c0[1],Math.min(e.rx,r*1.55),Math.min(sy,r*1.4),0,0,TAU);ctx.fill();
    ctx.fillStyle=KY.pupil;ball(c0,r);ctx.fill();ctx.fillStyle='#ffffff';ball([c0[0]-r*.38,c0[1]-r*.4],r*.36+.12);ctx.fill()}
  ctx.restore();
  tusks();
  for(const w of BR)if(w.fb>.02)brow(w,E);
  // the glow of the eyes, over the brow (they pulse with the heart); the spark when an eye lights up (the Awakening)
  if(!LOWFX)for(const e of E){if(e.rx<.6)continue;const on=e.sd<0?A.eyeL:A.eyeR,fl=(e.sd<0?A.eflL:A.eflR)||0;if(fl>0)shine(KY.eye,e.q[0],e.q[1],16,fl*Math.min(1,e.v*2));if(on<=.01||sq<.12)continue;
    shine(KY.eye,e.q[0],e.q[1]+1,11*(.6+.4*on),.62*A.glow*on*(.85+.3*A.heart)*Math.min(1,e.v*2)*sstep(.12,.45,sq))}
  function mouthHole(){const up=[],lo=[];for(let i=0;i<=6;i++){const y=-8+i*(16/6);up.push(P(T([Math.sqrt(Math.max(0,1-(y/13.5)**2-(3.8/12)**2))*12.5+.2,y,-3.8])));lo.push(P(T(rj([14.2,8-i*(16/6),-4.4]))))}
    const pts=up.concat(lo);ctx.save();poly(pts);ctx.fillStyle=K.mouth;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.lineJoin='round';ctx.stroke();ctx.clip();const q=P(T(rj([11,0,-6])));
    if(!LOWFX)shine(K.mlight,q[0],q[1],8,.4*cl(ja*3,0,1));else{ctx.fillStyle=`rgba(${K.mlight},.3)`;ball(q,3);ctx.fill()}ctx.restore()}}
// a hot stone of the second phase: dark slate with a crack of lava, a faint glow (falling, it goes out)
function hotRock(V0,c,r,rot,cool){const q=V0.P(c),pts=[];for(let i=0;i<7;i++){const a=i/7*TAU+rot*.3;pts.push([q[0]+Math.cos(a)*r*(1+.15*Math.sin(i*2.3)),q[1]+Math.sin(a)*r*(1+.12*Math.cos(i*1.7))])}
  if(cool<.9)shine('255,120,40',q[0],q[1],r*2.6,.45*(1-cool));ctx.lineJoin='round';smooth(pts);ctx.fillStyle=grad3(bbox(pts),K2.stone);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke();
  ctx.strokeStyle=cmix('#ff7a2e',COOL,cool);ctx.lineWidth=1.2;ctx.lineCap='round';ctx.beginPath();const a=rot;ctx.moveTo(q[0]+Math.cos(a)*r*.6,q[1]+Math.sin(a)*r*.6);ctx.lineTo(q[0]+Math.cos(a+2)*r*.1,q[1]+Math.sin(a+2)*r*.1);ctx.lineTo(q[0]+Math.cos(a+3.3)*r*.55,q[1]+Math.sin(a+3.3)*r*.55);ctx.stroke()}
// the mound of mossy boulders, the head on top (the stone sleeps again), three little white flowers
function mound(V0,X,K,KM,KH,A,face){const{P,D,F}=V0,L=parts(),I={T:q=>q,Rd:v=>v};
  MOUND.forEach(([x,y,z,r],j)=>{const c=[x,y,z],R=[r,r*.95,r*.82];L.add(D(c),()=>{svol3(V0,ellSil(V0,c,R,null,null,16),K.slate,{lw:2.6,scr:1});
    mossCap(V0,I,c,R,nrm([-.25,y*.025,1]),1.0,.9,x+y,KM,{pad:[1.5,1.5,1.5],w:r,h:r*.6,lw:1.8});
    // its little white flowers, opening at the very end
    if(A.flowers>0)for(const[bj,m,sz] of MFLOW){if(bj!==j)continue;const mm=nrm(m);if(F(ellN(R,AXES,mm))<.1)continue;flower(P(add(ellAt(c,add(R,[1.6,1.6,1.6]),AXES,mm),[0,0,.3])),A.flowers*sz,x)}})});
  const Hc=[3,0,41],HR=v=>rotZ(rotY(v,.25),.1);L.add(D(Hc)+2,()=>headDraw(V0,Hc,HR,{jaw:0,brow:1.5,squint:0,blink:1,eyeL:0,eyeR:0,glow:0,heart:0,sway:0},KH,KM,pal(0,0),pal(0,0)));
  run(L)}
// a little white flower (five petals, a yellow middle), k its size 0..1
function flower(q,k,seed){if(k<=.02)return;ctx.fillStyle='#ffffff';ctx.strokeStyle=INK;ctx.lineWidth=.8;
  for(let j=0;j<5;j++){const a=j/5*TAU+seed;ball([q[0]+Math.cos(a)*2*k,q[1]+Math.sin(a)*1.5*k],1.6*k);ctx.fill();ctx.stroke()}
  for(let j=0;j<5;j++){const a=j/5*TAU+seed;ball([q[0]+Math.cos(a)*2*k,q[1]+Math.sin(a)*1.5*k],Math.max(.1,1.6*k-.5));ctx.fill()}ctx.fillStyle='#ffd84a';ball(q,1.1*k);ctx.fill()}
// the slab torn from the floor (the model's own while in its hands, the game's in flight): floor stone, moss on two edges, earth under it,
// mint cracks (lava in the second phase); cut at the floor while it comes out of it
const SLK=18/13;   // the slab: 36 x 36 x 9.6 (the moss, the earth and the cracks below are laid out for 26 and scaled)
function slabAt(V0,c,tilt,fx0,fy0,p2,zc){const fx=nrm(fx0),fy=nrm(fy0),E=[rotAx(fx,fy,tilt),fy,rotAx(cross(fx,fy),fy,tilt)],FS=boxF(c,E,[18,18,4.8],0);
  let faces=FS;if(zc!=null)faces=FS.map(clipZ).filter(f=>f.length>2);if(!faces.length)return;
  const{P,F}=V0,up=E[2],at=(a,b,h)=>add(c,add(add(mul(E[0],a*SLK),mul(E[1],b*SLK)),mul(up,h)));
  // the clods of earth under it (only out of the floor): drawn first, the slab covers all but what hangs below it (as in golem2b.js)
  if(zc==null||c[2]>8)for(const[a,b,rr] of[[-6,4,3.2],[5,-3,2.8],[2,8,2.4]]){const q=at(a,b,-6.2);if(q[2]<0)continue;const s=P(q);ctx.fillStyle='#4a3a2c';ctx.strokeStyle=INK;ctx.lineWidth=1.4;ball(s,rr*1.3);ctx.fill();ctx.stroke()}
  const r=facets(V0,faces,SLAB,{lw:2.4,seam:false});if(!r)return;
  if(F(up)>.05){ctx.save();poly(r.H);ctx.clip();
    // two thick bands of moss along two edges of the top (a soft bumpy band, dark green edge, light tufts), three cracks
    const mz=5.4,band=(p0,p1,q0,q1)=>{const pts=[at(p0[0],p0[1],mz),at(p1[0],p1[1],mz),at(q1[0],q1[1],mz),at(q0[0],q0[1],mz)].map(q=>P(q));smooth(pts);ctx.fillStyle='#4b822e';ctx.fill();ctx.strokeStyle='#22401a';ctx.lineWidth=1.3;ctx.stroke()};
    band([-13.6,-13.6],[13.6,-13.6],[-13.6,-8],[13.6,-9.4]);band([-13.6,-13.6],[-13.6,13.6],[-9,-13.6],[-8,13.6]);
    ctx.fillStyle='#82bc46';for(const[a,b] of[[-10.4,-11],[3.9,-11.2],[-11.2,2.6],[-10.9,9.1]]){ball(P(at(a,b,mz)),1.6);ctx.fill()}
    const cr=[[[-4,-6],[1,-2],[-1,3],[4,8]],[[3,-6],[7,-2]],[[-6,4],[-2,7]]];for(const z of cr){const pts=z.map(([a,b])=>P(at(a,b,4.9)));ctx.lineCap='round';ctx.lineJoin='round';
      if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=p2?'rgba(255,120,40,.45)':'rgba(90,255,170,.4)';ctx.lineWidth=3.6;ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.restore()}
      ctx.strokeStyle='rgba(20,16,14,.8)';ctx.lineWidth=2.2;ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.strokeStyle=p2?'#ff7a2e':'#6dffc0';ctx.lineWidth=1.2;ctx.stroke()}
    ctx.restore()}
  rimP(r.H,.22)}
const SLAB=T3('#7d7262','#625849','#3e372e');
// the effects of the moves (only when the game does not draw its own and the phone is fast)
function fxDraw(V0,X,L,e,A,J,Hc,HR,K,KL,face,lift){const{P,D}=V0,t=e.t;
  if(e.k==='dust'){L.add(D(e.at)+30,()=>dust(V0,e.at,t,e.n||6,e.r||10,K.dust,e.al||.5))}
  else if(e.k==='mouth'){const m0=add(Hc,HR([16,0,-6]));L.add(D(m0)+(V0.F(HR([1,0,0]))<-.15?-60:20),()=>{   // (behind the body when the head looks away)
    for(let i=0;i<3;i++){const u=cl(t*1.2-i*.12,0,1);if(u<=0||u>=1)continue;const q=P(add(m0,HR([4+u*12,(i-1)*3*u,2+u*8+i])));
      ctx.fillStyle=e.steam?`rgba(235,238,240,${.5*(1-u)})`:`rgba(${K.dust},${.55*(1-u)})`;ball(q,e.big?3+u*6:1.6+u*4);ctx.fill()}})}
  else if(e.k==='pebble'){const a=J['arm-1'];if(!a)return;const top=X.T([2,-34,86]),o1=X.T([-2,-49,70]),pts=[top,o1,add(lerp3(a.S,a.El,.6),[0,-9,0]),add(a.El,[0,-11,-2]),add(lerp3(a.El,a.W,.7),[2,-12,0]),[a.FC[0]+6,a.FC[1]-16,2.2],[a.FC[0]+12,a.FC[1]-20,2.2]];
    const k=t*(pts.length-1),i=Math.min(pts.length-2,Math.floor(k)),u=k-i,q3=lerp3(pts[i],pts[i+1],u),hop=Math.sin(u*Math.PI)*2*(i<pts.length-2?1:0);const qq=add(q3,[0,0,hop]);
    L.add(D(qq)+60,()=>{const q=P(qq);ctx.fillStyle=K.slate.b;ctx.strokeStyle=INK;ctx.lineWidth=1.3;ball(q,2.2);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.35)';ball([q[0]-.6,q[1]-.8],.7);ctx.fill()})}
  else if(e.k==='pebs'){const n=e.few?2:4;for(let i=0;i<n;i++){const a=i*2.4+1,vx=Math.cos(a)*14,vy=Math.sin(a)*14,z0=e.at[2],vz=e.fall?2:26,g=e.fall?95:110,zt=z0+vz*t-g*t*t;if(zt<1.5&&!e.fall)continue;
      const q3=[e.at[0]+vx*t,e.at[1]+vy*t+(e.fall?Math.sign(e.at[1]||1)*6*t:0),Math.max(1.5,zt)];L.add(D(q3)+40,()=>{const q=P(q3);ctx.fillStyle=K.slate.b;ctx.strokeStyle=INK;ctx.lineWidth=1;ball(q,1.7);ctx.fill();ctx.stroke()})}}
  else if(e.k==='clods'){for(let i=0;i<4;i++){const a=i*1.7+.4,v=12+i*3,q3=[e.at[0]+Math.cos(a)*v*t,e.at[1]+Math.sin(a)*v*t,4+38*t-60*t*t];if(q3[2]<0)continue;L.add(D(q3)+40,()=>{const q=P(q3);ctx.fillStyle='#4a3a2c';ctx.strokeStyle=INK;ctx.lineWidth=1.2;ball(q,2.3-i*.2);ctx.fill();ctx.stroke()})}}
  else if(e.k==='fcrack'){L.add(-900,()=>{const k=sstep(0,.3,t),al=1-sstep(.75,1,t);ctx.save();ctx.globalAlpha*=al;ctx.strokeStyle='rgba(18,12,8,.75)';ctx.lineWidth=1.8;ctx.lineCap='round';
      for(let i=0;i<4;i++){const a=i/4*TAU+.5;ctx.beginPath();for(let j=0;j<=4;j++){const r=7+j*4.2*k,q=P(add(e.at,[Math.cos(a+Math.sin(j*2.1+i)*.25)*r,Math.sin(a+Math.sin(j*2.1+i)*.25)*r,0]));ctx.lineTo(q[0],q[1])}ctx.stroke()}ctx.restore()})}
  else if(e.k==='dirt'){if(!A.slab)return;const c=A.slab.c;for(let i=0;i<3;i++){const u=(t*2+i/3)%1,q3=add(c,[Math.sin(i*2.3)*8,Math.cos(i*1.9)*8,-4-u*40]);if(q3[2]<0)continue;L.add(D(q3)+1,()=>{const q=P(q3);ctx.fillStyle=`rgba(74,58,44,${1-u})`;ball(q,1.4);ctx.fill()})}}
  else if(e.k==='chips'){const c=add(X.T(ellAt(TC[0],TR[0],AXES,HM)),[0,0,0]);for(let i=0;i<3;i++){const a=(i-1)*.7,q3=add(c,X.Rd([6+t*22,Math.sin(a)*t*22,10*t-20*t*t+i]));L.add(D(q3)+40,()=>{const q=P(q3);ctx.fillStyle=K.slate.l;ctx.strokeStyle=INK;ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(q[0],q[1]-2.2);ctx.lineTo(q[0]+1.8,q[1]+1.4);ctx.lineTo(q[0]-1.8,q[1]+1);ctx.closePath();ctx.fill();ctx.stroke()})}}
  else if(e.k==='suck'){L.add(999,()=>{if(!J.heartQ)return;const q=J.heartQ;for(let i=0;i<8;i++){const u=(t*2.2+i/8)%1,a=i/8*TAU+u*4,r=46*(1-u);const s=[q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.7];ctx.fillStyle=`rgba(255,${200+40*u|0},120,${.85*Math.sin(u*Math.PI)})`;ball(s,1.6+u);ctx.fill()}})}
  else if(e.k==='steam'){L.add(998,()=>{for(let i=0;i<6;i++){const u=(t*1.6+i/6)%1,c=X.T([lerp(-8,20,(i*.37)%1),(i%3-1)*16,46+i*4]),q=P(add(c,[0,0,u*22]));ctx.fillStyle=`rgba(230,234,236,${.4*(1-u)*Math.sin(Math.min(1,t*4)*Math.PI/2)})`;ball(q,2+u*5);ctx.fill()}})}
  else if(e.k==='ring'){L.add(-800,()=>{const r=20+t*70,pts=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push(P([A.B[0]+Math.cos(a)*r,A.B[1]+Math.sin(a)*r,0]))}ctx.strokeStyle=`rgba(${e.rgb},${.6*(1-t)})`;ctx.lineWidth=4*(1-t)+1;poly(pts);ctx.stroke();
      for(let i=0;i<10;i++){const a=i/10*TAU+.3,q=P([Math.cos(a)*r,Math.sin(a)*r,2+3*t]);ctx.fillStyle=`rgba(${e.rgb},${.45*(1-t)})`;ball(q,3+t*5);ctx.fill()}})}
  else if(e.k==='pdust'){for(const sd of[-1,1]){const at=[-4,sd*72,0];L.add(D(at)+20,()=>dust(V0,at,t,7,12,K.dust,.55))}}
  else if(e.k==='fly'){L.add(999,()=>{for(let i=0;i<3;i++){const u=cl(t*1.3-i*.15,0,1);if(u<=0||u>=1)continue;const q=P([[-4,-8,30],[6,10,28],[0,2,40]][i].map((v,j)=>j===2?v+u*30:v+Math.sin(u*6+i)*3));
      if(!LOWFX)shine('140,255,210',q[0],q[1],7,.6*Math.sin(u*Math.PI));ctx.fillStyle=`rgba(220,255,240,${Math.sin(u*Math.PI)})`;ball(q,1.3);ctx.fill()}})}
  else if(e.k==='mossfall'){}}

// ------------------------------------------------------------------ for the game: the pieces of its attacks, with the same look
// N3.golemSlab(x, y, z, rot, sc, o): the slab in flight (x, y: the floor point, z: the height, rot: its tumble; o.p2 lava). The brain's
// short form (x, yScreen, rot, p2) works too
N3.golemSlab=function(x,y,z,rot,sc,o){if(typeof arguments[3]==='boolean'){o={p2:!!arguments[3]};rot=z;z=0;sc=1}o=o||{};sc=sc||1;
  const V0=V(Math.PI/2);ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);slabAt(V0,[0,0,0],rot||0,rotZ([1,0,0],(rot||0)*.4),rotZ([0,1,0],(rot||0)*.4),!!o.p2,null);ctx.restore()};
// N3.golemRock(x, y, z, r, spin, sc, o): a boulder; o.kind 'floor' (floor stone with moss, the Landslide) or 'slate' (a fallen pauldron);
// o.p2 lava cracks that cool with o.cool. The brain's short form (x, yScreen, r, rot, p2, seed) works too
N3.golemRock=function(x,y,z,r,spin,sc,o){if(typeof arguments[4]==='boolean'){o={p2:!!arguments[4],seed:arguments[5]||0};spin=arguments[3];r=arguments[2];z=0;sc=1}
  o=o||{};sc=sc||1;r=r||14;const V0=V(Math.PI/2);ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);
  if(o.kind==='slate'){const E=[rotZ([1,0,0],spin||0),rotZ([0,1,0],spin||0),[0,0,1]],k=r/16;pauldronLying(V0,[0,0,5.4*k],E,pal(0,0),k)}
  else boulder(V0,r,spin||0,o.seed||0,!!o.p2,o.cool==null?0:o.cool);ctx.restore()};
// N3.golemFang(x, y, h, k, sc, o): a fang of floor stone out of the crack (k 0..1: comes out, stays, crumbles; o.a: the way the crack
// runs on the screen; o.p2 lava at its foot). The brain's short form (x, y, k, p2, seed) works too
N3.golemFang=function(x,y,h,k,sc,o){if(typeof arguments[3]==='boolean'){o={p2:!!arguments[3],seed:arguments[4]||0};k=arguments[2];h=22;sc=1}
  o=o||{};sc=sc||1;h=h||22;fang(x,y,h,k,sc,o)};
// N3.golemShard(x, y, z, a, sc, o): a hot shard of slate (second phase) flying along a. The brain's short form (x, y, r, a) works too
N3.golemShard=function(x,y,z,a,sc,o){if(arguments.length===4){sc=(z||7)/7;z=0}o=o||{};sc=sc||1;const t=G.t||0;ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);
  if(!LOWFX)shine('255,120,40',0,0,15,.45);ctx.rotate(a||0);const pts=[[9,0],[2,-4.6],[-6,-3.2],[-9,.4],[-4,4.2],[3,4]];ctx.lineJoin='round';poly(pts);ctx.fillStyle=grad3([-9,-5,9,5],K2.stone);ctx.fill();
  ctx.strokeStyle='#ff8a3a';ctx.lineWidth=2.2;ctx.stroke();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke();ctx.strokeStyle='#ffd27a';ctx.lineWidth=1;ctx.lineCap='round';seg([-4,0],[5,-.6]);ctx.stroke();ctx.restore()};
// a boulder of the Landslide: a lumpy faceted stone of the floor, moss on top; lava cracks in the second phase
const BL=[1,.9,1.06,.94,1.03,.88,1.05,.96,.92];
function boulder(V0,r,spin,seed,p2,cool){const{P}=V0,F=[],ring=(z,rr,o2)=>{const R=[];for(let i=0;i<9;i++){const a=i/9*TAU+spin+o2;R.push([Math.cos(a)*rr*BL[(i+Math.round(seed))%9],Math.sin(a)*rr*BL[(i+3+Math.round(seed))%9],z])}return R};
  const R0=ring(0,r*.8,0),R1=ring(r*.55,r,.2),R2=ring(r*1.15,r*.62,.4),top=[0,0,r*1.35];for(let i=0;i<9;i++){const j=(i+1)%9;F.push([R0[i],R0[j],R1[j],R1[i]],[R1[i],R1[j],R2[j],R2[i]],[R2[i],R2[j],top])}F.push(R0.slice().reverse());
  const res=facets(V0,F,SLAB,{lw:2.4});if(!res)return;ctx.save();poly(res.H);ctx.clip();
  // moss on the top
  const q=P([0,0,r*1.2]);ctx.fillStyle='#4b822e';ctx.strokeStyle='#2d5421';ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU,rr=r*.55*(1+.15*Math.sin(i*2.7+seed));ctx.lineTo(q[0]+Math.cos(a)*rr,q[1]+Math.sin(a)*rr*.5-1)}ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#82bc46';ball([q[0]-r*.15,q[1]-2],1.5);ctx.fill();ball([q[0]+r*.2,q[1]-1],1.2);ctx.fill();
  if(p2){const z=[[-.6,.6],[-.1,.3],[.15,.65],[.55,.4]].map(([a,b])=>P([a*r,-r*.7,b*r*1.1]));ctx.lineCap='round';ctx.lineJoin='round';if(!LOWFX&&cool<1){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,120,40,${.45*(1-cool)})`;ctx.lineWidth=3.6;ctx.beginPath();for(const s of z)ctx.lineTo(s[0],s[1]);ctx.stroke();ctx.globalCompositeOperation='source-over'}
    ctx.strokeStyle=cmix('#ff7a2e',COOL,cool);ctx.lineWidth=1.5;ctx.beginPath();for(const s of z)ctx.lineTo(s[0],s[1]);ctx.stroke()}
  ctx.restore()}
// a fallen pauldron lying on the floor (the boulders of the change of phase)
function pauldronLying(V0,c,E,K,k){const E2=[E[0],[0,0,1],E[1]];plateDraw(V0,c,E2,1,k,PRIMT,K.sand,2);plateDraw(V0,c,E2,1,k,PLATE,K.paul,2.4);
  // the rune notch on top, dark now
  const[q0,q1]=plateNotch(V0,c,E2,1,k);ctx.lineCap='round';ctx.strokeStyle=K.gap;ctx.lineWidth=2.6;seg(q0,q1);ctx.stroke();ctx.strokeStyle=K.off;ctx.lineWidth=1.3;seg(q0,q1);ctx.stroke()}
// a fang of the Fault: a wedge of floor stone leaning forward, a tuft of moss on one side; it crumbles into chips at the end
function fang(x,y,h,k,sc,o){if(k<=0)return;const a=o.a==null?Math.PI/2:o.a,V0=V(a),{P}=V0,up=k<.15?ez(k/.15):1,cr=sstep(.8,1,k),hh=h*up*(1-.6*cr),seed=o.seed||0;
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);if(cr>0)ctx.globalAlpha*=1-cr*.7;
  const lean=.26,F=[],tip=[Math.sin(lean)*hh+1.5*Math.sin(seed),.8*Math.cos(seed),hh],b=[[-7.5,-5.5,0],[7,-5,0],[7.5,5,0],[-7,5.5,0]],m=[[-4.6,-3.6,hh*.5],[4.6,-3.8,hh*.58],[4.2,3.6,hh*.46],[-4.4,3.4,hh*.56]].map(q=>[q[0]+Math.sin(lean)*q[2],q[1],q[2]]);
  for(let i=0;i<4;i++){const j=(i+1)%4;F.push([b[i],b[j],m[j],m[i]],[m[i],m[j],tip])}
  const r=facets(V0,F,SLAB,{lw:2.1});
  if(r&&o.p2&&!LOWFX){const q=P([0,0,0]);shine('255,120,40',q[0],q[1],10,.5*(1-cr))}
  if(r){const q0=P([-6,4.5,1]),q1=P([-6,4.5,6]);ctx.fillStyle='#4b822e';ctx.strokeStyle=INK;ctx.lineWidth=1.2;ball(q0,2.4);ctx.fill();ctx.stroke();ball(lerp3([...q0,0],[...q1,0],.6),1.8);ctx.fill();ctx.stroke()}
  if(cr>0)for(let i=0;i<4;i++){const q=P([Math.cos(i*1.6+seed)*8*cr,Math.sin(i*1.6+seed)*6*cr,hh*.5*(1-cr)+2]);ctx.fillStyle='#625849';ctx.strokeStyle=INK;ctx.lineWidth=1;ball(q,2);ctx.fill();ctx.stroke()}
  ctx.restore()}

reg('golem2',{n:'Golem di Muschio',g:'boss',sc:1,an:MV.slice(),dur:Object.assign({},DUR),
  lab:{idle:'Fermo',walk:'Cammina',hit:'Colpito',leap:'Schianto',stuck:'Pugni incastrati',throw:'Frana',fault:'Faglia',curl:'Si chiude a palla',roll:'Valanga',unroll:'Si riapre',
    beam:'Raggio del Cuore',rage:'Furia (fase 2)',taunt:'Presa in giro',enter:'Entrata',die:'Sconfitta'}},golem2);
// «Prima e dopo»: the Golem of today
// (the drawing of today is kept now: once the game puts this model in place of N3.golem, N3.golem is the new one)
{const OLD=N3.golem,M0=N3.meta.golem;if(OLD&&M0)N3.meta.golem2.old=(x,y,f,a,pp)=>OLD(x,y,f,M0.an.includes(a)?a:'idle',pp,M0.sc||1,{})}
})();
