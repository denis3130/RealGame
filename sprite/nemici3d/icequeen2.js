// LA REGINA DEI GHIACCI rifatta: «l'Imperatrice di Cristallo» (Denis, 15 ottobre: «rivisita tutti i boss, rendili più creepy e fatti
// meglio sia da fermi che nelle animazioni», «un po' più cupi», «falli possenti, belli, fighi, che diano timore nello sfidarli»; 16
// ottobre, dopo il Golem: «sì, fai gli altri 12»). Un'imperatrice altissima e immobile, piantata a terra come un monumento: l'abito è un
// iceberg di ghiaccio profondo a facce di gemma che si allarga fino a terra con l'orlo frastagliato di punte; il corpetto di velluto
// indaco col fiocco di neve ricamato d'argento; le maniche a campana di seta brinata che pendono coi ghiaccioli; i capelli blu mezzanotte
// con lo chignon e due ciocche lisce; il viso di porcellana con due occhi azzurri che brillano sotto una frangia di ghiaccioli; dietro
// la testa una corona a raggiera di sette stalattiti. Nella destra lo scettro d'argento col cristallo che pulsa.
// Non corre e non si scompone mai: scivola sul ghiaccio sempre girata verso di te. Prima di ogni incantesimo la corona si accende punta
// dopo punta come un orologio (tin… tin… tin… TIN): con la punta di mezzo parte il colpo. Punto debole: la gemma sulla fronte, scoperta
// nell'Incoronazione e quando la corona si incrina. Fase 2, «Notte Polare»: l'abito si riempie di stelle, dietro le spalle il Ventaglio
// d'Inverno, la corona più alta e viola, la gemma crepata. Resta della Classica: bella come una regina delle fiabe, occhi con la lucina,
// nessun dente, niente sangue, ferite né cuciture.
// Metodo dello spaventapasseri: scheletro 3D proiettato con V(face), braccia a due ossa (ik), ordine di disegno dalla posa di riposo (un
// pezzo attaccato al corpo sta davanti o dietro secondo la faccia del corpo su cui sta), la testa con la sua telecamera (HR: gira,
// annuisce, si piega; corona, frangia, capelli e chignon la seguono, le ciocche a metà); dipinta come la lanterna (tre toni, bordo caldo,
// il filo lilla della sala sul lato in ombra, bagliori morbidi), il ghiaccio a facce piatte coi toni netti come una gemma.
// Mosse: idle, walk, hit, lances, crown, nova, mirror, emerge, cast, stunned, gaze, waltz, rage, taunt, enter, die.
// Opzioni: o.p2 (seconda fase), o.ghost (il riflesso: più chiaro, trasparente, una crepa, niente ombra, corona spenta), o.mv (walk: la
// direzione del moto rispetto a dove guarda), o.sweep (±1: il verso dello Sguardo), o.rev (le lance e il gesto da destra a sinistra),
// o.crown (0..1: la corona tutta accesa), o.curve (±1: il verso delle curve del Valzer), o.noFx, o.z (altezza data dal gioco).
// La testa nello Sguardo: angolo = o.sweep × (−60° + 120°·(p − 0,32)/0,60) rispetto al corpo, positivo verso la sua destra (l'angolo del
// mondo face + angolo), la stessa formula del cono del gioco.
// Disegni per il gioco con lo stesso aspetto: N3.icequeen2Lance, icequeen2Pillar, icequeen2Spike, icequeen2Mirror, icequeen2Ice,
// icequeen2Shard, icequeen2Flake (nel gioco prendono il nome icequeen…).
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,tri,hull,rim,run,cmix,lt,poly,bbox,
  rotX,rotY,rotZ,look,keys,sstep,hitK,frame,ellAt,ellN,AXES,caps,chain,floor,parts,reg,shine,chull,ik,inward,bump,smooth}=C;
const{shadeLimb,glowTop,wa}=C.R;
const DEG=Math.PI/180;

// ------------------------------------------------------------------ small helpers (as in golem2.js)
const fxOn=o=>!o.noFx&&!LOWFX;
const cheat=(face,k)=>{const dv=Math.atan2(Math.sin(Math.PI/2-face),Math.cos(Math.PI/2-face));return k*Math.sin(dv)*cl((Math.PI-Math.abs(dv))/(Math.PI/2),0,1)};
const pls=(p,c,w)=>{const d=Math.abs(p-c)/(w/2);return d>=1?0:.5+.5*Math.cos(d*Math.PI)};
const plw=(p,c,w)=>Math.max(pls(p,c,w),pls(p,c-1,w),pls(p,c+1,w));
const rise=(p,a,b,c,d)=>sstep(a,b,p)*(1-sstep(c,d,p));
const flash=(p,a,w)=>p<a||p>a+w?0:1-(p-a)/w;
const ga=(k,f)=>{if(k<=.004)return;const a0=ctx.globalAlpha;ctx.globalAlpha=a0*Math.min(1,k);f();ctx.globalAlpha=a0};
const kv=(K,p)=>keys(K,p);
const strokeRuns=(runs,col,w)=>{if(!runs.length)return;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();for(const r of runs){ctx.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)ctx.lineTo(r[i][0],r[i][1])}ctx.stroke()};
const rgbA=(rgb,a)=>`rgba(${rgb},${a.toFixed(3)})`;

// ------------------------------------------------------------------ painting (three tones, gems with flat faces)
function grad3(b,T){const w=b[2]-b[0],h=b[3]-b[1],cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,R=Math.max(w,h,2)*.64,g=ctx.createRadialGradient(cx-w*.24,cy-h*.26,R*.06,cx-w*.04,cy+h*.04,R);
  g.addColorStop(0,T.l);g.addColorStop(.34,T.b);g.addColorStop(.9,T.d);return g}
function limbGrad(qa,qb,r,T){let nx=-(qb[1]-qa[1]),ny=qb[0]-qa[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;if(nx+ny>0){nx=-nx;ny=-ny}const mx=(qa[0]+qb[0])/2,my=(qa[1]+qb[1])/2;
  if(l<r*.6){nx=-.7;ny=-.7}const g=ctx.createLinearGradient(mx+nx*r,my+ny*r,mx-nx*r,my-ny*r);g.addColorStop(0,T.l);g.addColorStop(.42,T.b);g.addColorStop(1,T.d);return g}
// how lit a face with the unit normal n is (warm light from the upper left and a little from the front)
function lit(V0,n){const o=V0.P(0,0,0),q=V0.P(n);return cl(.55+.45*(-.55*(q[0]-o[0])-.7*(q[1]-o[1]))+.2*V0.F(n),0,1)}
const tone=(T,k)=>{let r=T._r;if(!r){r=T._r=[];for(let i=0;i<=16;i++){const u=i/16;r.push(u<.5?cmix(T.d,T.b,u*2):cmix(T.b,T.l,u*2-1))}}return r[Math.round(cl(k,0,1)*16)]};
function fnorm(f){let x=0,y=0,z=0;for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length];x+=(a[1]-b[1])*(a[2]+b[2]);y+=(a[2]-b[2])*(a[0]+b[0]);z+=(a[0]-b[0])*(a[1]+b[1])}return nrm([x,y,z])}
const cen=f=>{let x=0,y=0,z=0;for(const q of f){x+=q[0];y+=q[1];z+=q[2]}const n=f.length||1;return[x/n,y/n,z/n]};
// the outline of an ellipsoid on the screen, exactly (a parallel projection of an ellipsoid is an ellipse), as in golem2.js
const SILT={};
function ellSil(V0,C0,Rd,F,T,n){F=F||AXES;n=n||14;const tp=T||(q=>q),o=V0.P(tp(C0));let sxx=0,sxy=0,syy=0;
  for(let k=0;k<3;k++){const ax=k===0?F.u:k===1?F.v:F.w,r=Rd[k],q=V0.P(tp([C0[0]+ax[0]*r,C0[1]+ax[1]*r,C0[2]+ax[2]*r])),dx=q[0]-o[0],dy=q[1]-o[1];sxx+=dx*dx;sxy+=dx*dy;syy+=dy*dy}
  const l11=Math.sqrt(Math.max(sxx,1e-6)),l21=sxy/l11,l22=Math.sqrt(Math.max(syy-l21*l21,1e-6));let tb=SILT[n];if(!tb){tb=SILT[n]=[];for(let i=0;i<n;i++){const t=(i+.5)/n*TAU;tb.push([Math.cos(t),Math.sin(t)])}}
  const out=new Array(n);for(let i=0;i<n;i++){const c=tb[i][0],s=tb[i][1];out[i]=[o[0]+l11*c,o[1]+l21*c+l22*s]}return out}
function smoothP(pts){const n=pts.length,pa=new Path2D();pa.moveTo((pts[n-1][0]+pts[0][0])/2,(pts[n-1][1]+pts[0][1])/2);
  for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];pa.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}pa.closePath();return pa}
// a smooth convex shape from screen points (already a hull) in three tones; the path stays on the points (pts.path) for clipping
function svol(pts,T,o){o=o||{};if(pts.length<3)return pts;ctx.lineJoin='round';const pa=pts.path=smoothP(pts);ctx.fillStyle=o.fill||grad3(bbox(pts),T);ctx.fill(pa);
  if(!o.noInk){ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2.5;ctx.stroke(pa)}if(o.rim)rimP(pts,o.rim);if(o.lil)rimL(pts,o.lil);return pts}
// a limb's shade without a clip: a darker band along its dark side and a warm thread along its lit side (inside the limb, butt ends)
function shade2(A2,B2,r,col,al){let dx=B2[0]-A2[0],dy=B2[1]-A2[1];const l=Math.hypot(dx,dy);if(l<.8)return;dx/=l;dy/=l;let nx=-dy,ny=dx;if(nx+ny>0){nx=-nx;ny=-ny}
  const a=[A2[0]+dx*l*.12,A2[1]+dy*l*.12],b=[B2[0]-dx*l*.12,B2[1]-dy*l*.12];ctx.lineCap='butt';ctx.strokeStyle=col;ctx.lineWidth=r*.62;seg([a[0]-nx*r*.5,a[1]-ny*r*.5],[b[0]-nx*r*.5,b[1]-ny*r*.5]);ctx.stroke();
  ctx.strokeStyle=wa(al||.17);ctx.lineWidth=Math.max(.5,r*.3);seg([a[0]+nx*r*.5,a[1]+ny*r*.5],[b[0]+nx*r*.5,b[1]+ny*r*.5]);ctx.stroke();ctx.lineCap='round'}
// the warm rim inside an outline on the lit side; the cold lilac light of the hall on the shadow side
function rimP(pts,al){const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0)/2,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.15,cy+Rr*.15),kx=1-1.9/Math.max(1,(x1-x0)/2),ky=1-1.9/Math.max(1,(y1-y0)/2);
  g.addColorStop(0,wa(al));g.addColorStop(1,wa(0));ctx.beginPath();for(const q of pts)ctx.lineTo(cx+(q[0]-cx)*kx,cy+(q[1]-cy)*ky);ctx.closePath();ctx.strokeStyle=g;ctx.lineWidth=1.3;ctx.stroke()}
const LIL='180,165,255';
function rimL(pts,al){const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0,2)/2,g=ctx.createLinearGradient(cx+Rr*.05,cy+Rr*.05,cx+Rr*.9,cy+Rr*.9),kx=1-1.7/Math.max(1,(x1-x0)/2),ky=1-1.7/Math.max(1,(y1-y0)/2);
  g.addColorStop(0,`rgba(${LIL},0)`);g.addColorStop(1,`rgba(${LIL},${al})`);ctx.beginPath();for(const q of pts)ctx.lineTo(cx+(q[0]-cx)*kx,cy+(q[1]-cy)*ky);ctx.closePath();ctx.strokeStyle=g;ctx.lineWidth=1.2;ctx.stroke()}
// an axis frame from a direction d (the third axis) and a hint for the first
function frm(d,h){d=nrm(d);h=h||[1,0,0];let u=sub(h,mul(d,dot(h,d)));if(len(u)<.15)u=sub([0,0,1],mul(d,d[2]));if(len(u)<.15)u=sub([0,1,0],mul(d,d[1]));u=nrm(u);return[u,cross(d,u),d]}
// a crystal: the hull in its darkest tone, every face toward us in its own tone, a thin light seam on the edges that look at the light,
// the thick outline. Vs: 3D points (after the frame), Fs: arrays of indices. o: kb (more light), wt (whiter: a flash), lw, seam (colour),
// glow ([rgb, alpha]: a soft light inside), noInk. Returns the screen hull
function cryst(V0,Vs,Fs,T,o){o=o||{};const S=Vs.map(q=>V0.P(q)),H=chull(S);if(H.length<3)return null;ctx.lineJoin='round';
  poly(H);ctx.fillStyle=o.base||T.d;ctx.fill();const c=cen(Vs),wt=o.wt||0;let eP=null;
  for(let i=0;i<Fs.length;i++){const f=Fs[i],pts=f.map(j=>Vs[j]);let n=fnorm(pts);if(dot(n,sub(cen(pts),c))<0)n=mul(n,-1);const v=V0.F(n);if(v<=.01)continue;
    let col=tone(T,lit(V0,n)+(o.kb||0));if(wt>0)col=cmix(col,'#ffffff',wt);
    ctx.beginPath();let sx=0,sy=0;for(const j of f){ctx.lineTo(S[j][0],S[j][1]);sx+=S[j][0];sy+=S[j][1]}ctx.closePath();ctx.fillStyle=col;ctx.fill();
    if(o.seam!==false&&v>.1){sx/=f.length;sy/=f.length;for(let e=0;e<f.length;e++){const a=S[f[e]],b=S[f[(e+1)%f.length]],ex=b[0]-a[0],ey=b[1]-a[1],el=Math.hypot(ex,ey);if(el<1)continue;
      let nx=ey/el,ny=-ex/el;if(nx*((a[0]+b[0])/2-sx)+ny*((a[1]+b[1])/2-sy)<0){nx=-nx;ny=-ny}if(-.6*nx-.8*ny<.3)continue;
      if(!eP)eP=new Path2D();eP.moveTo(a[0]-nx*.6,a[1]-ny*.6);eP.lineTo(b[0]-nx*.6,b[1]-ny*.6)}}}
  if(eP){ctx.strokeStyle=o.seam||'rgba(240,252,255,.7)';ctx.lineWidth=.9;ctx.lineCap='round';ctx.stroke(eP)}
  if(o.glow&&!LOWFX){const q=V0.P(o.glow[2]||c);ctx.save();poly(H);ctx.clip();shine(o.glow[0],q[0],q[1],o.glow[3]||8,o.glow[1]);ctx.restore()}
  if(!o.noInk){poly(H);ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2;ctx.stroke()}return H}
// many crystals at once (they do not overlap much): the hulls, then the faces grouped by tone, the seams, the outlines, each in one pass.
// items: [{Vs, Fs, T, kb, wt}]; o.lw, o.seam
function crystB(V0,items,o){o=o||{};const bases=new Map(),faces=new Map(),hulls=[];let eP=null;
  for(const it of items){const S=it.Vs.map(q=>V0.P(q)),H=chull(S);if(H.length<3)continue;hulls.push(H);let b=bases.get(it.T.d);if(!b)bases.set(it.T.d,b=[]);b.push(H);
    const c=cen(it.Vs),wt=it.wt||0;
    for(const f of it.Fs){const pts=f.map(j=>it.Vs[j]);let n=fnorm(pts);if(dot(n,sub(cen(pts),c))<0)n=mul(n,-1);const v=V0.F(n);if(v<=.01)continue;
      let k=lit(V0,n)+(it.kb||0);if(o.q)k=Math.round(k*o.q)/o.q;let col=tone(it.T,k);if(wt>0)col=cmix(col,'#ffffff',wt);let g=faces.get(col);if(!g)faces.set(col,g=[]);const sp=f.map(j=>S[j]);g.push(sp);
      if(o.seam!==false&&v>.1){let sx=0,sy=0;for(const q of sp){sx+=q[0];sy+=q[1]}sx/=sp.length;sy/=sp.length;
        for(let e=0;e<sp.length;e++){const a=sp[e],b2=sp[(e+1)%sp.length],ex=b2[0]-a[0],ey=b2[1]-a[1],el=Math.hypot(ex,ey);if(el<1)continue;
          let nx=ey/el,ny=-ex/el;if(nx*((a[0]+b2[0])/2-sx)+ny*((a[1]+b2[1])/2-sy)<0){nx=-nx;ny=-ny}if(-.6*nx-.8*ny<.3)continue;if(!eP)eP=new Path2D();eP.moveTo(a[0]-nx*.6,a[1]-ny*.6);eP.lineTo(b2[0]-nx*.6,b2[1]-ny*.6)}}}}
  if(!hulls.length)return hulls;ctx.lineJoin='round';
  for(const[col,hs] of bases){ctx.beginPath();for(const H of hs)polyAdd(H);ctx.fillStyle=col;ctx.fill()}
  for(const[col,fs] of faces){ctx.beginPath();for(const f of fs)polyAdd(f);ctx.fillStyle=col;ctx.fill()}
  if(eP){ctx.strokeStyle=o.seam||'rgba(240,252,255,.7)';ctx.lineWidth=.9;ctx.lineCap='round';ctx.stroke(eP)}
  ctx.beginPath();for(const H of hulls)polyAdd(H);ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2;ctx.stroke();return hulls}
// a crystal point: from the base centre b along the unit axis d, L long, a base of n corners (radius w) turned so that one corner looks
// along `up`, the top cut flat (a blunt point of radius w·tk). Returns {V, F, tip}
function spikeG(b,d,L,w,n,up,tk,tw){d=nrm(d);const[u,v]=frm(d,up||[0,0,1]),V=[],F=[];tk=tk==null?.2:tk;const tip=add(b,mul(d,L));
  for(let i=0;i<n;i++){const a=i/n*TAU+(tw||0);V.push(add(b,add(mul(u,Math.cos(a)*w),mul(v,Math.sin(a)*w))))}
  for(let i=0;i<n;i++){const a=i/n*TAU+(tw||0);V.push(add(tip,add(mul(u,Math.cos(a)*w*tk),mul(v,Math.sin(a)*w*tk))))}
  for(let i=0;i<n;i++){const j=(i+1)%n;F.push([i,j,n+j,n+i])}F.push(Array.from({length:n},(_,i)=>n+i));return{V,F,tip}}
// draws f() as one picture faded to k (no outlines showing through), as in golem2.js (a stack of small canvases)
const polyAdd=pts=>{ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath()};
const OCS=[];let OCL=0;
function fadeDraw(f,q,r,k){if(k>=.99){f();return}if(k<=.01)return;const T=ctx.getTransform(),S=Math.hypot(T.a,T.b),dx=T.a*q[0]+T.c*q[1]+T.e,dy=T.b*q[0]+T.d*q[1]+T.f,R=Math.ceil(r*S+6),W=2*R;
  const lv=OCL;let OC=OCS[lv];if(!OC)OC=OCS[lv]=document.createElement('canvas');if(OC.width<W||OC.height<W)OC.width=OC.height=W;const oc=OC.getContext('2d');oc.setTransform(1,0,0,1,0,0);oc.clearRect(0,0,W,W);
  oc.setTransform(T.a,T.b,T.c,T.d,T.e-(dx-R),T.f-(dy-R));const saved=ctx;ctx=oc;OCL++;try{f()}finally{ctx=saved;OCL--}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha*=k;ctx.drawImage(OC,0,0,W,W,dx-R,dy-R,W,W);ctx.restore()}
// draws f() clipped to the outside of a path (a part behind a body: only what sticks out shows) and, faded to k, the part inside it (it
// comes in front of the body as it turns toward us; at k 0 it is behind, at 1 in front)
function layered(f,path,k){if(k>=.995||!path){f();return}ctx.save();ctx.beginPath();ctx.rect(-1e4,-1e4,2e4,2e4);polyAdd(path);ctx.clip('evenodd');f();ctx.restore();
  if(k>.005){ctx.save();poly(path);ctx.clip();ga(k,f);ctx.restore()}}

// ------------------------------------------------------------------ colours (light / base / shadow)
const T3=(l,b,d)=>({l,b,d}),mixT=(a,b,k)=>k<=0?a:k>=1?b:T3(cmix(a.l,b.l,k),cmix(a.b,b.b,k),cmix(a.d,b.d,k));
const mixRgb=(a,b,k)=>{if(k<=0)return a;if(k>=1)return b;const A=a.split(',').map(Number),B=b.split(',').map(Number);return A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')};
// phase 1, «gelo reale»: deep ice, indigo velvet, frosted silk, porcelain, midnight hair, the cyan of the eyes and of the crystal
const K1={gown:T3('#BDEBFF','#3F86D6','#1D3486'),gcore:'#111A52',gedge:'#EAFBFF',glight:'110,205,255',
  ice:T3('#F2FCFF','#9ADAFF','#3F7FD0'),vel:T3('#5A66D6','#2E368F','#161B52'),emb:'#DCE8FF',silv:'#E6ECFA',bgem:'#78E6FF',
  silk:T3('#E6EEFF','#A9BCF0','#5A6CC0'),sice:'#E8FAFF',skin:T3('#F6F9FF','#D9E4F6','#A3B3DA'),cheek:'200,180,255',
  hair:T3('#4B5C9E','#232D63','#0F1433'),hstr:'#A9C4F0',brow:'#232D63',lid:'#1B1A3A',esh:'96,96,208',
  iris:'#9FF6FF',eyeC:'#FFFFFF',eglow:'140,235,255',lips:'#4B3D8F',mole:'#EAFBFF',
  cice:T3('#FFFFFF','#A8E6FF','#3F80D6'),clit:'170,235,255',circ:T3('#E6ECFA','#9AA8CC','#56628E'),
  gem:'#3D5BFF',gemL:'#C9D2FF',gemG:'120,150,255',sil:T3('#DCE4F6','#8F9CC6','#3E4A7E'),spir:'#DFF6FF',
  cry:T3('#FFFFFF','#8FE8FF','#2F8FD8'),cglow:'150,235,255',mist:'220,240,255',star:'#FFFFFF',star2:'#FFE9A8',
  fan:T3('#F2EEFF','#A996F0','#4E3DA8')};
// phase 2, «notte polare»: the gown full of night and stars, violet ice, the white and violet eyes
const K2=Object.assign({},K1,{gown:T3('#D9CCFF','#6A55D0','#221A6E'),gcore:'#120C3D',gedge:'#F2ECFF',glight:'190,160,255',ice:T3('#F6F2FF','#C9B8FF','#6A4FD6'),
  vel:T3('#4A3A9A','#241A5C','#0E0A2A'),emb:'#E6D8FF',silk:T3('#E8DEFF','#A796E6','#5A48A8'),sice:'#E6DCFF',hstr:'#B9A8F0',iris:'#F0E6FF',eglow:'200,160,255',
  lips:'#3A2470',cice:T3('#FFFFFF','#D2C2FF','#6A4FD6'),clit:'210,180,255',gem:'#9A6CFF',gemL:'#E6D8FF',gemG:'190,140,255',cry:T3('#FFFFFF','#C9B0FF','#6A3FD8'),cglow:'200,170,255'});
// a palette between the phases (k2) and, for the reflection, lighter (gh): mixes are cached
const PALC={};
function pal(k2,gh){k2=Math.round(cl(k2,0,1)*24)/24;const id=k2+'|'+(gh?1:0);if(PALC[id])return PALC[id];const K={};
  for(const k in K1){const a=K1[k],b=K2[k];K[k]=typeof a==='string'?(a[0]==='#'?cmix(a,b,k2):mixRgb(a,b,k2)):mixT(a,b,k2)}
  if(gh){const L=c=>cmix(c,'#ffffff',.25),LR=c=>mixRgb(c,'255,255,255',.25);for(const k in K){const c=K[k];K[k]=typeof c==='string'?(c[0]==='#'?L(c):LR(c)):T3(L(c.l),L(c.b),L(c.d))}}
  return PALC[id]=K}

// ------------------------------------------------------------------ the body at rest (x forward, y to her right, z up; 0,0,0 the floor point)
// the gown: an iceberg of nine uneven sides (rings at 0, 20, 40, 58; the one at 20 turned by half a side: triangles like a cut gem)
const GA=.92,NS=9,ST=TAU/NS,GF=[1.06,.94,1,1.08,.95,1.03,.97,1.05,.92],GPR=[[0,38],[8,36],[20,30],[36,21],[50,15],[58,12.5]];
const rG=z=>{if(z<=GPR[0][0])return GPR[0][1];for(let i=0;i<GPR.length-1;i++){const a=GPR[i],b=GPR[i+1];if(z<=b[0])return lerp(a[1],b[1],(z-a[0])/(b[0]-a[0]))}return GPR[GPR.length-1][1]};
const GRZ=[0,19,39,58],GRR=[34.5,27.6,18.6,12.5],GROT=[0,1,0,0],GJZ=[0,2.2,-1.6,1.4,-2.4,1.8,-1,2.6,-1.8];
const gfR=(j,i)=>GRR[j]*(GROT[j]?(GF[(i+NS-1)%NS]+GF[i%NS])/2:GF[i%NS]);
const ringV=(j,i)=>{const t=(i+(GROT[j]?0:.5))*ST,r=gfR(j,i),jz=j===1||j===2?GJZ[(i*(j===1?1:4)+j)%NS]:0;return[Math.cos(t)*r*GA,Math.sin(t)*r,GRZ[j]+jz]};
const GM=(()=>{const V=[],F=[],I=(j,i)=>j*NS+((i%NS)+NS)%NS;for(let j=0;j<4;j++)for(let i=0;i<NS;i++)V.push(ringV(j,i));
  for(let i=0;i<NS;i++){F.push([I(0,i),I(0,i+1),I(1,i+1)],[I(1,i),I(1,i+1),I(0,i)],[I(1,i),I(1,i+1),I(2,i)],[I(2,i-1),I(2,i),I(1,i)],[I(2,i),I(2,i+1),I(3,i+1),I(3,i)])}
  F.push(Array.from({length:NS},(_,i)=>I(3,i)));const N=F.map(f=>{const pts=f.map(i=>V[i]),c=cen(pts);let n=fnorm(pts);if(dot(n,sub(c,[0,0,c[2]*.6]))<0)n=mul(n,-1);return n});
  return{V,F,N,Z:F.map(f=>cen(f.map(i=>V[i]))[2])}})();
// the radius of the gown's faces at the angle t (0 in front, + to her right) and the height z (the flat faces as chords)
function ringR(j,t){const u=((t/ST-(GROT[j]?0:.5))%NS+NS)%NS,i=Math.floor(u),a=(u-i)*ST,ra=gfR(j,i),rb=gfR(j,i+1);return ra*rb*Math.sin(ST)/(ra*Math.sin(a)+rb*Math.sin(ST-a))}
function gR(t,z){let j=0;while(j<2&&z>GRZ[j+1])j++;const k=cl((z-GRZ[j])/(GRZ[j+1]-GRZ[j]),0,1);return lerp(ringR(j,t),ringR(j+1,t),k)}
const gS=(t,z,out)=>{const r=gR(t,z)+(out||0);return[Math.cos(t)*r*GA,Math.sin(t)*r,z]};
const gN=(t,z)=>nrm([Math.cos(t)/GA,Math.sin(t),(gR(t,z-1.5)-gR(t,z+1.5))/3]);
// the jagged hem: twelve points of ice round the foot of the gown, long ones touching the floor and short ones (they grow in the night)
const HJ=[[0,1,0],[.12,.7,1.5],[-.05,.9,-.8],[.06,.55,.6],[-.1,1,1],[.04,.8,-.4],[.08,.95,.4],[-.06,.6,1.2],[0,1,-1],[.1,.75,.5],[-.08,.85,1.6],[.03,.65,-.6]];
const HEMF=[[0,1,3],[1,2,3]];
const HEM=Array.from({length:12},(_,k)=>{const[jt,jl,jz]=HJ[k],t=k/12*TAU+jt*.5,w=TAU/24*(1+jt),lg=k%2===0,r1=lg?37.4+jl*1.2:33.8+jl*1.4,z1=lg?0:3.6+jz,r2=r1+(lg?3.6:2.8),z2=lg?0:Math.max(1.2,z1-2);
  return{t,lg,L:gS(t-w,9.5+jz*.5,0),R:gS(t+w,9.5-jz*.5,0),M:gS(t,15.5+jz,1.3),T1:[Math.cos(t)*r1*GA,Math.sin(t)*r1,z1],T2:[Math.cos(t)*r2*GA,Math.sin(t)*r2,z2]}});
// the seracs growing out of the gown: angle, height, how much they point up, length, base; the two at the back only in the night
const SPK=[{t:100*DEG,z:30,e:35*DEG,L:16,w:3.1,p1:1},{t:-100*DEG,z:30,e:35*DEG,L:16,w:3.1,p1:1},{t:-28*DEG,z:10,e:32*DEG,L:13,w:2.7,p1:1},
  {t:160*DEG,z:22,e:35*DEG,L:14,w:2.8,p1:0},{t:-160*DEG,z:22,e:35*DEG,L:14,w:2.8,p1:0}];
// the stars of the night on the gown: angle, height, size, warm
const STARS=[[-.3,10,2.4,0],[.45,16,2,0],[1.2,8,2.2,1],[-1.05,24,2,0],[.1,30,2.6,0],[.85,36,1.8,0],[-.6,40,2,0],[1.6,22,2,0],[-1.7,14,2.2,0],[2.3,30,2,0],
  [-2.4,26,1.8,1],[2.9,12,2,0],[-2.9,40,1.8,0],[.35,48,1.7,0]];
// the bodice: rings of ellipses (height, depth, width); the V of the neckline, the snowflake embroidered on the chest
const CRS=[[55.5,10,12],[64,9.5,11],[72,11,14],[78,10,15],[81.5,6.5,10]];
const crAt=z=>{if(z<=CRS[0][0])return[CRS[0][1],CRS[0][2]];for(let i=0;i<CRS.length-1;i++){const a=CRS[i],b=CRS[i+1];if(z<=b[0]){const k=(z-a[0])/(b[0]-a[0]);return[lerp(a[1],b[1],k),lerp(a[2],b[2],k)]}}const l=CRS[CRS.length-1];return[l[1],l[2]]};
// a point on the front of the bodice (y across, z up) and the normal there
const cAt=(y,z,out)=>{const[rx,ry]=crAt(z),u=cl(y/ry,-.98,.98),x=rx*Math.sqrt(1-u*u);return add([x,y,z],mul(nrm([x/(rx*rx),y/(ry*ry),0]),out||0))};
const cN=(y,z)=>{const[rx,ry]=crAt(z),u=cl(y/ry,-.98,.98),x=rx*Math.sqrt(1-u*u);return nrm([x/(rx*rx),y/(ry*ry),0])};
// the head: its ellipsoid round HC; the hair, the circlet, the fringe, the bun, the crown of seven stalactites (in the head's own frame)
const HC=[1,0,96],HRD=[11.8,12.5,12.2];
const MCI=nrm([.26,0,.97]),UCI=nrm([.97,0,-.26]),BCI=37*DEG;   // the circlet: a small circle on the head round MCI, BCI wide
const ciDir=th=>nrm(add(mul(MCI,Math.cos(BCI)),mul(add(mul(UCI,Math.cos(th)),[0,Math.sin(th),0]),Math.sin(BCI))));
const GEMD=ciDir(0);
// the stalactites: angle from the upright in the plane tilted 20° back (+ to her right), length, base, length in the night
const CFC=[-5,0,8],CDIR=a=>[-Math.sin(20*DEG)*Math.cos(a),Math.sin(a),Math.cos(20*DEG)*Math.cos(a)],CFN=[Math.cos(20*DEG),0,Math.sin(20*DEG)];
const CS=[[0,24,5.5,34],[25,19,4.6,26],[-25,19,4.6,26],[50,14,3.8,19],[-50,14,3.8,19],[75,10,3.2,13],[-75,10,3.2,13]].map(([a,L,W,L2])=>{const d=CDIR(a*DEG);
  // where the ray from the centre of the fan leaves the hair (the base of the stalactite)
  const R=add(HRD,[1,1,1]),o=[CFC[0]/R[0],CFC[1]/R[1],CFC[2]/R[2]],dd=[d[0]/R[0],d[1]/R[1],d[2]/R[2]],A2=dot(dd,dd),B2=2*dot(o,dd),C2=dot(o,o)-1,t=(-B2+Math.sqrt(B2*B2-4*A2*C2))/(2*A2);
  return{a:a*DEG,L,W,L2,d,t,b:add(CFC,mul(d,t)),n:nrm([(CFC[0]+d[0]*t)/(R[0]*R[0]),(CFC[1]+d[1]*t)/(R[1]*R[1]),(CFC[2]+d[2]*t)/(R[2]*R[2])])}});
const CORD=[5,3,1,0,2,4,6];   // from her right to her left (the screen's left to right when she looks at you)
// the scepter: 112 long; at rest its foot is on the floor on her right, a little forward, the top leaning in toward her
const SL=112,SKG=.589,SF0=[14,40,0],SD0=nrm([-4,-13,112]),HL0=[9.5,-6.5,61];
// the fan of winter (second phase): nine blades behind the neck in the plane tilted 25° back
const FB=[-8,0,82],FNR=[Math.cos(25*DEG),0,Math.sin(25*DEG)],FBL=[[0,54],[20,52],[-20,52],[40,50],[-40,50],[60,46],[-60,46],[80,40],[-80,40]].map(([a,L])=>({a:a*DEG,L}));
const FDIR=a=>[-Math.sin(25*DEG)*Math.cos(a),Math.sin(a),Math.cos(25*DEG)*Math.cos(a)];

// ------------------------------------------------------------------ the moves (every one depends only on p; idle and walk close on themselves)
const MV=['idle','walk','hit','lances','crown','nova','mirror','emerge','cast','stunned','gaze','waltz','rage','taunt','enter','die'];
const DUR={idle:3,walk:1.4,hit:.6,lances:2,crown:2.6,nova:2.6,mirror:1.6,emerge:.9,cast:1.4,stunned:1.5,gaze:3.4,waltz:3.6,rage:2.6,taunt:1.2,enter:3.4,die:4};
// the crown's clock: the outer pair, the middle pair, the inner pair, the middle point (the blow), when they all go out together
const CLK={lances:[.30,.45,.60,.76,.90],crown:[.04,.08,.12,.16,9],nova:[.16,.26,.36,.46,.54],mirror:[.05,.12,.19,.26,.45],waltz:[.03,.06,.09,.12,.9],enter:[.76,.80,.84,.88,.92]};
function clock(A,c,p){const on=t=>sstep(t,t+.012,p),off=1-sstep(c[4],c[4]+.1,p);A.lit=[on(c[3]),on(c[2]),on(c[2]),on(c[1]),on(c[1]),on(c[0]),on(c[0])].map(v=>v*off);
  A.tin=[c[0],c[1],c[2],c[3]].map(t=>flash(p,t,.05))}
// the scepter held in the right hand by the grip G with its axis D (its foot follows)
const grip=(A,G,D,kg)=>{A.sD=nrm(D);A.kg=kg==null?SKG:kg;A.sF=sub(G,mul(A.sD,A.kg*SL))};
function qPose(anim,p,o){const ph=p*TAU,P2=!!o.p2&&anim!=='enter'&&anim!=='rage',
  A={p2:P2,B:[0,0,0],yaw:0,lean:0,roll:0,wl:0,wr:0,wy:0,sink:0,br:.5,sh:.3,hy:0,hp:-.05,hr:0,blink:.55,low:0,wide:0,brow:P2?1:0,mouth:-.3,
    hL:HL0.slice(),lp:'waist',lcurl:[0,0,0],tap:0,lpn:null,lfd:null,
    sF:SF0.slice(),sD:SD0.slice(),kg:SKG,hold:'R',kgL:0,sFront:0,sUp:0,
    lit:[0,0,0,0,0,0,0],tin:null,glint:-1,clen:P2?1:0,cfly:-1,cgrow:null,ctilt:0,gemX:0,gemCrack:P2?1:0,gemF:0,
    night:P2?99:-1,gW:0,band:-1,gcr:-1,spk:P2?1:0,sice:P2?1:0,fan:P2?[1,1,1,1,1,1,1,1,1]:null,fanX:0,
    cry:.55,cw:0,cfl:0,cfc:null,gL:.3,sw:0,
    k2e:P2?1:0,k2v:P2?1:0,k2s:P2?1:0,k2i:P2?1:0,k2c:P2?1:0,
    cut:-1,wipe:-1,eyesTo:-1,gone:0,lag:[0,0],still:0,lances:null,small:null,rays:0,hm:null,crownOff:null,scFall:null,mound:0,fx:[]};
  const fx=(k,t,o2)=>{if(t>=0&&t<1)A.fx.push(Object.assign({k,t},o2||{}))};
  if(anim==='walk'){// SCIVOLA: no steps; the whole body slides, always turned toward you; a waltz of three beats (a dip on each, a lift on the
    // "one"), the lean toward where she goes, the sleeves and the locks left behind, the scepter carried off the floor
    const mv=o.mv||0,cm=Math.cos(mv),sm=Math.sin(mv);A.lean=.052*cm;A.roll=.052*sm+.021*Math.sin(ph);
    A.sink=.5*(plw(p,0,.14)+pls(p,1/3,.14)+pls(p,2/3,.14));A.B[2]=.8*plw(p,.07,.16);
    A.sF=add(SF0,[0,0,5]);A.sD=nrm(add(SD0,[.07*cm,.07*sm,0]));A.lag=[-4*cm,-4*sm];A.hy=look(p,.03);A.cry=.55+.1*Math.sin(ph);A.sw=.6*Math.sin(2*ph)}
  else if(anim==='hit'){// COLPITA: a start backward, the head turned away offended with the chin up; a band of white light runs down the gown
    const k=hitK(p);A.B=[-1.5*k,0,0];A.hy=.21*k;A.hp=-.05-.1*k;A.blink=lerp(.55,.35,cl(k,0,1));A.band=p<.4?58*(1-p/.4):-1;A.cry=.6}
  else if(anim==='lances'){// LANCE DI CRISTALLO: the scepter goes up over and behind the head, the lances grow on an arc over her, flash one by
    // one; the crown counts; the conductor's gesture throws them one after the other (the game takes each one at its moment)
    const n=P2?7:5,rv=o.rev?-1:1,ry=v=>[v[0],v[1]*(v[1]<0||v[3]?rv:1),v[2]];
    const GK=[[0,[12,32,66]],[.12,[2,25,92]],[.62,[2,25,92]],[.76,[4,rv>0?14:26,104]],[.90,[14,rv>0?27:6,80]],[.97,[12,32,66]],[1,[12,32,66]]];
    const DK=[[0,SD0],[.12,[-.25,-.35,1]],[.62,[-.25,-.35,1]],[.76,[-.1,-.6*rv,1]],[.90,[.35,.7*rv,.55]],[.97,SD0],[1,SD0]];
    grip(A,kv(GK,p),kv(DK,p));if(p>.95)A.sF[2]=Math.max(0,A.sF[2]);
    A.hL=kv([[0,HL0],[.12,[18,-22,78]],[.76,[18,-22,78]],[.90,[16,-20,74]],[1,HL0]],p);A.lp=p>.04&&p<.96?'open':'waist';A.lpn=[1,0,0];A.lfd=[.15,-.2,1];
    clock(A,CLK.lances,p);A.blink=.55+.25*rise(p,.30,.50,.90,1);A.hp=-.05-.06*rise(p,.1,.3,.9,1);A.hy=.08*rv*rise(p,.62,.76,.76,.9)-.08*rv*rise(p,.76,.88,.9,1);
    A.lances={n,rv,g:Array.from({length:n},(_,k)=>sstep(.10+.03*k,.15+.03*k,p)),f:Array.from({length:n},(_,k)=>pls(p,.32+.036*k,.05)),
      gone:Array.from({length:n},(_,k)=>p>=.76+.025*(rv>0?k:n-1-k))};
    A.cry=.6+.3*rise(p,.1,.3,.9,1);A.cfl=Math.max(flash(p,.76,.08),.5*flash(p,.30,.06));A.wl=-.03*rise(p,.1,.3,.9,1);
    fx('puff',(p-.97)/.03*.4,{at:SF0})}
  else if(anim==='crown'){// INCORONAZIONE: a royal nod, the hand to the heart; the head thrown back: the seven stalactites fly up spinning; the
    // bare circlet shows the gem; the raised hand gives the order, the stalactites grow again, the hand closes one finger at a time and snaps
    A.hp=kv([[0,-.05],[.16,.244],[.18,-.28],[.21,-.24],[.56,-.2],[.74,-.12],[.93,-.08],[1,-.05]],p);
    A.hL=kv([[0,HL0],[.10,[11,-5,73]],[.16,[11,-5,73]],[.24,[26,-15,84]],[.92,[26,-15,84]],[.94,[27,-14,82]],[1,HL0]],p);
    if(p>.08&&p<.97){A.lp=p<.2?'chest':'down';A.lpn=p<.2?[-1,0,0]:[0,0,-1];A.lfd=p<.2?[0,1,.2]:[1,.15,0];
      A.lcurl=[0,1,2].map(j=>sstep(.58+.11*j,.68+.11*j,p));if(p>.925)A.lcurl=[1,1,1];A.lth=sstep(.925,.935,p)}
    clock(A,CLK.crown,p);A.cfly=p>=.16&&p<.27?(p-.16)/.11:-1;A.cgone=p>=.27&&p<.56;
    if(p>=.56)A.cgrow=[.56,.60,.60,.65,.65,.70,.70].map(t=>sstep(t,t+.05,p));
    A.gemX=rise(p,.16,.18,.72,.74);A.blink=.55;A.br=.5+.3*Math.sin(ph);
    fx('crack',(p-.16)/.12)}
  else if(anim==='nova'){// FIOCCO REALE: the scepter up in both hands, planted in the ice in front of her; she leans on it, the crystal turns
    // white, the gown lights up from below, the crown counts; the flash; the scepter stuck (two tugs), torn out
    const out=sstep(.95,1,p),tug=Math.max(pls(p,.62,.06),pls(p,.78,.06)),DP=[-.2,.25,1];
    A.sF=kv([[0,SF0],[.07,[22,7,22]],[.11,[22,0,0]],[.95,[22,0,0]],[.975,[18,20,7]],[1,SF0]],p);A.sD=nrm(kv([[0,SD0],[.07,[-.1,.15,1]],[.11,DP],[.95,DP],[1,SD0]],p));
    if(tug>0)A.sD=nrm(add(A.sD,[-.09*tug,-.03*tug,0]));
    A.hold='RL';A.kg=.68;A.kgL=.6;A.sFront=p>.03&&p<.97?1:0;
    const lean=rise(p,.09,.16,.92,.98);A.wl=.15*lean-.07*tug;A.B[0]=-1.2*tug;A.hp=-.05+.26*lean-.1*out;A.blink=.55+.25*rise(p,.0,.08,.92,1);
    clock(A,CLK.nova,p);A.cw=sstep(.11,.46,p)*(1-sstep(.5,.7,p));A.gL=.3+.45*sstep(.11,.46,p)*(1-sstep(.5,.75,p));A.gW=flash(p,.46,.03)*1;A.cfl=flash(p,.46,.08);
    A.cry=.6+.4*sstep(.11,.46,p)*(1-sstep(.5,.7,p));
    fx('fcrack',(p-.11)/.89,{at:[22,0,0]});fx('puff',(p-.11)/.12,{at:[22,0,0]});fx('puff',(p-.62)/.12,{at:[22,0,0]});fx('puff',(p-.78)/.12,{at:[22,0,0]});fx('chips',(p-.95)/.05*.5,{at:[22,0,0]})}
  else if(anim==='mirror'){// SALA DEGLI SPECCHI: a slow pirouette like the dancer of a music box, the sleeves open; she points the scepter, a
    // lilac flash; she melts into snow from the hem up, the eyes last
    const sp=ez(cl(p/.30,0,1));A.yaw=TAU*sp;const op=Math.sin(Math.PI*cl(p/.30,0,1));A.lag=[0,0];A.spinOut=op;
    A.hL=lerp3(HL0,[6,-30,76],op);A.lp=op>.15?'open':'waist';A.lpn=[0,0,-1];A.lfd=[0,-1,0];
    clock(A,CLK.mirror,p);
    const pt=rise(p,.30,.40,.52,.6);grip(A,lerp3([12,32,66],[18,24,80],pt),lerp3(SD0,[.62,-.15,.74],pt));if(p<.3)A.sF[2]+=6*op;
    A.cc=rise(p,.4,.45,.5,.55);A.cfl=flash(p,.45,.08);A.cfc='200,170,255';A.blink=.55+.2*rise(p,.3,.4,.55,.6);
    if(p>=.55){A.cut=130*ez(cl((p-.55)/.30,0,1));A.eyesTo=.85}if(p>=.85)A.gone=1;
    fx('melt',(p-.55)/.40)}
  else if(anim==='emerge'){// ESCE DALLO SPECCHIO: she comes out of the glass from the top down (the point of the scepter, the crown and the face,
    // then the gown), sparkles on the cut; a little bow with a cold smile
    A.wipe=p<.45?ez(p/.45):-1;const bw=rise(p,.45,.58,.66,.80);A.sink=3*bw;A.hp=-.05+.17*bw;A.mouth=lerp(-.3,.9,rise(p,.45,.55,.8,.95));A.blink=.55-.1*bw}
  else if(anim==='cast'){// TIRO DALLO SPECCHIO: the arm out, the scepter aimed at you; three little lances grow on the crystal; a snap of the
    // wrist throws them
    const k=sstep(0,.10,p)*(1-sstep(.86,1,p)),fl=pls(p,.79,.08);grip(A,lerp3([12,32,66],[17,21,73],k),lerp3(SD0,nrm(add([.74,-.15,.66],[.12*fl,0,-.12*fl])),k),lerp(SKG,.62,k));
    if(p>.96)A.sF[2]=Math.max(0,A.sF[2]);A.sFront=k>.3?1:0;
    A.small={g:[.15,.32,.50].map(t=>sstep(t,t+.06,p)),gone:p>=.76};A.cry=.6+.3*k;A.cfl=flash(p,.76,.08);A.blink=.55+.2*k;A.hp=-.05+.04*k}
  else if(anim==='stunned'){// CORONA INCRINATA: the gem flashes with a white crack, a start, the round eyes; the left hand holds the crown,
    // the head bent, small shards fall, the eyelids tremble offended; she sets the crown straight with a royal gesture and a little «hm!»
    const k=sstep(0,.06,p)*(1-sstep(.12,.3,p));A.B=[-2*k,0,0];A.gemX=1-sstep(.85,1,p);A.gemF=flash(p,0,.12);A.gemCrack=Math.max(A.gemCrack,1-sstep(.85,1,p));
    const hold=rise(p,.10,.20,.78,.90);A.hr=-.21*hold;A.hp=-.05+.05*hold-.12*pls(p,.86,.06);
    A.hL=kv([[0,HL0],[.12,HL0],[.20,[4,-14,103]],[.70,[4,-14,103]],[.78,[6,-13,105]],[.90,[10,-6,72]],[1,HL0]],p);if(p>.12&&p<.92){A.lp='crown';A.lpn=[0,1,0];A.lfd=[.3,.2,1]}
    A.blink=p<.12?lerp(.55,1.2,sstep(0,.04,p)):p<.7?.8+.18*Math.sin(TAU*3*1.5*(p-.12)):lerp(.8,.55,sstep(.7,.95,p));A.wide=p<.12?sstep(0,.04,p):1-sstep(.12,.3,p);
    A.ctilt=.2*hold*(1-sstep(.7,.85,p));fx('shards',(p-.12)/.6)}
  else if(anim==='gaze'){// SGUARDO D'INVERNO: frozen; the eyes shut, the crown goes dark, the fringe chimes, the head turns to where the sweep
    // starts; the eyes open round and white with two short rays; only the head turns, at a steady speed (the game's cone the same)
    const s=o.sweep||1,a0=-60*DEG*s;A.still=1;A.br=.5;A.sh=.3;
    A.hy=p<.04?0:p<.26?a0*ez((p-.04)/.22):p<.32?a0:p<.92?s*(-60+120*(p-.32)/.60)*DEG:lerp(60*DEG*s,0,ez((p-.92)/.08));
    A.blink=p<.04?.55:p<.26?lerp(.55,0,sstep(.04,.24,p)):p<.32?lerp(0,1.25,sstep(.26,.31,p)):p<.92?1.25:lerp(1.25,.55,sstep(.92,.99,p));
    A.wide=p>=.26&&p<.95?sstep(.26,.31,p)*(1-sstep(.92,.95,p)):0;A.rays=p>=.27&&p<.93?sstep(.27,.32,p)*(1-sstep(.9,.93,p)):0;A.hp=p>.92?-.05-.06*sstep(.92,.97,p):-.05;
    A.sw=p>.04&&p<.3?Math.sin(TAU*14*(p-.04)*3.4/3.4)*(1-sstep(.2,.3,p)):0;A.k2e=1}
  else if(anim==='waltz'){// VALZER DELLA TORMENTA: a ballroom bow; three arcs with a whole turn on each (the game moves her), the arms open, the
    // gown leaning into the curve, a lift on every "one"; a pirouette on the spot getting faster; the arms flung open; she stops upright
    const cv=o.curve||1;let yw=0;
    if(p<.12){const b=Math.sin(Math.PI*p/.12);A.sink=4*b;A.wl=.12*b;A.hp=-.05+.12*b}
    else if(p<.70){yw=3*TAU*(p-.12)/.58;const arc=Math.min(2,Math.floor((p-.12)/(.58/3)));A.roll=.105*cv*(arc%2?-1:1)*Math.sin(Math.PI*cl(((p-.12)%(.58/3))/(.58/3)*1.02,0,1));
      A.B[2]=2*Math.max(pls(p,.14,.06),pls(p,.333,.06),pls(p,.527,.06))}
    else if(p<.95){const k=(p-.70)/.25;yw=3*TAU+2*TAU*k*k}else yw=5*TAU;
    A.yaw=yw;const open=p<.12?sstep(.02,.1,p):p<.70?1:p<.95?1-sstep(.7,.92,p):p<.98?sstep(.95,.97,p)*(1-sstep(.97,1,p)):0;
    A.spinOut=p>=.12&&p<.95?(p<.7?1:1-sstep(.85,.95,p)):0;
    A.hL=lerp3(HL0,[5,-33,78],Math.max(open,p<.12?sstep(0,.1,p):0));A.lp=open>.2?'open':'waist';A.lpn=[0,0,-1];A.lfd=[0,-1,.1];
    const cross0=[[.3,.8,.5],[.62,-.25,.75]];grip(A,lerp3([12,32,66],[10,30,74],open),lerp3(SD0,nrm(lerp3(cross0[0],cross0[1],p>.95?1:0)),Math.max(open,.0)),lerp(SKG,.55,open));
    if(open<.05)A.sF[2]=Math.max(0,A.sF[2]);
    clock(A,CLK.waltz,p);A.fanX=.14*rise(p,0,.1,.95,1);A.blink=.62;A.hp+=-.04;A.k2e=1;
    fx('snow',p,{ring:p>.7&&p<.95?(p-.7)/.25:0})}
  else if(anim==='rage'){// NOTTE POLARE: the gem cracks with a snap, she stiffens; for the first time she lowers her head, the scepter in both
    // hands; the night rises in the gown from the hem, the stars light up as it passes, the points grow; the fan of winter opens blade by
    // blade; she lifts her head, the crown grows violet, the eyes open white and violet; the scepter to the sky, a flash
    const night=sstep(.30,.62,p);A.night=p<.30?-1:58*night+(p>.62?40:0);A.gemCrack=sstep(0,.03,p);A.gemF=flash(p,0,.1);
    const low=rise(p,.12,.30,.66,.82);A.hp=-.05+.4*low-.06*sstep(.82,.9,p);A.blink=p<.12?lerp(.55,1.15,sstep(0,.04,p)):p<.7?lerp(1.15,.5,sstep(.12,.3,p)):p<.78?.5:lerp(.5,1,sstep(.78,.84,p))*(1-.3*sstep(.92,1,p));
    A.wide=p<.12?sstep(0,.04,p):0;A.k2e=sstep(.77,.8,p);A.brow=sstep(.74,.82,p);A.k2c=sstep(.66,.82,p);A.clen=A.k2c;A.k2v=night;A.k2s=sstep(.45,.62,p);A.k2i=night;
    A.spk=night;A.sice=sstep(.50,.62,p);A.fan=[.40,.43,.43,.46,.46,.49,.49,.52,.52].map(t=>sstep(t,t+.025,p));
    const two=rise(p,.12,.24,.80,.86),sky=rise(p,.82,.88,.94,1);
    if(sky>0)grip(A,lerp3([18,6,74],[6,22,104],sky),lerp3([-.05,0,1],[-.08,.05,1],sky));else{A.sF=lerp3(SF0,[18,0,8],two);A.sD=nrm(lerp3(SD0,[-.05,0,1],two))}
    if(two>.02&&sky<.02){A.hold='RL';A.kg=lerp(SKG,.62,two);A.kgL=.55;A.sFront=two>.4?1:0}
    A.B[1]=.6*Math.sin(TAU*9*p)*(1-sstep(.02,.12,p))*sstep(0,.01,p);A.cfl=flash(p,.86,.1);A.cry=.6+.3*sky;A.lean=.03*low;
    fx('ring',(p-.86)/.14)}
  else if(anim==='taunt'){// PRESA IN GIRO: the frost gathers in her left hand into a little oval mirror; she admires herself turning her head;
    // she looks at you over it and laughs (the shoulders bounce three times, the eyes two half moons); the mirror melts into snow
    const up=rise(p,.0,.18,.88,1);A.hL=lerp3(HL0,[17,-12,90],up);A.lp=up>.1?'mirror':'waist';A.lpn=[-1,0,0];A.lfd=[0,0,1];
    A.hm={k:sstep(.02,.18,p),melt:sstep(.85,1,p),glint:pls(p,.6,.08)};
    A.hy=p<.5?.21*Math.sin(TAU*(p-.18)/.32)*rise(p,.18,.24,.44,.5):0;A.hp=-.05+.1*rise(p,.18,.26,.45,.52)-.06*rise(p,.5,.56,.85,.95);
    const lau=Math.max(pls(p,.55,.07),pls(p,.65,.07),pls(p,.75,.07));A.sh=.3+2*lau;A.br=.5+.5*lau;A.low=.85*rise(p,.5,.55,.82,.88);A.mouth=lerp(-.3,2.2,rise(p,.2,.3,.85,.95));
    A.blink=.55+.15*rise(p,.18,.26,.45,.5)}
  else if(anim==='enter'){// ENTRATA, «Specchio, specchio…»: the mirror of ice behind her alone; her dark shape in the glass, the two eyes
    // first; she steps out of the rippling glass from the top down; the mirror cracks and shatters into frost; the chin up, the crown counts
    // once; the foot of the scepter strikes the floor
    A.mirH={k:p,frost:sstep(0,.18,p),shape:sstep(.18,.26,p),eyes:sstep(.28,.30,p),rip:rise(p,.32,.36,.56,.6),crack:sstep(.58,.64,p),shat:p>=.66?(p-.66)/.08:-1};
    A.gone=p<.32?1:0;A.wipe=p>=.32&&p<.58?ez((p-.32)/.26):-1;A.hp=-.05-.08*rise(p,.74,.8,.95,1);
    clock(A,CLK.enter,p);const st=rise(p,.86,.89,.92,.93);if(p>.86&&p<.95){A.sF=add(SF0,[0,0,7*st]);}A.blink=.55+.2*rise(p,.74,.8,.92,1);
    fx('puff',(p-.92)/.08,{at:SF0,big:1});fx('ring',(p-.92)/.08)}
  else if(anim==='die'){// L'ULTIMO INCHINO: the blow makes her step back for the first time, the crown slips; she straightens, regal to the end,
    // and makes a slow deep curtsy, the eyes close; cracks of white light climb the gown; at the climax she melts into a whirl of snowflakes
    // and glitter; the crown stays in the air, falls with a «tin» and bounces, losing a stalactite; the scepter falls across; a soft mound
    const back=sstep(0,.1,p)*(1-sstep(.12,.3,p)),cur=rise(p,.14,.40,.9,1);A.B=[-6*back,0,0];A.ctilt=.26*sstep(0,.08,p)*(1-sstep(.14,.3,p));
    A.sink=10*cur;A.wl=.35*cur;A.hp=-.05+.32*cur;A.blink=lerp(.55,0,sstep(.28,.42,p));A.eglowK=1-sstep(.44,.56,p);
    A.hL=lerp3(HL0,[2,-31,62],cur);A.lp=cur>.2?'open':'waist';A.lpn=[0,0,-1];A.lfd=[0,-1,-.2];
    grip(A,lerp3([12,32,66],[8,34,62],cur),lerp3(SD0,nrm([.1,.25,1]),cur));if(p<.58)A.sF[2]=Math.max(0,A.sF[2]);
    A.gcr=p>=.42?80*sstep(.42,.56,p):-1;A.cut=p>=.56?130*sstep(.56,.62,p):-1;if(p>=.62)A.gone=1;
    // the crown: on her head until the climax, then alone in the air (z 100), falling, bouncing, on the mound
    if(p>=.575){const k=p<.62?0:p<.70?ez((p-.62)/.08):1,bz=p>=.70&&p<.76?6*Math.sin(Math.PI*(p-.70)/.06):0,mz=8*sstep(.70,.90,p);
      A.crownOff={pos:[4,-2,lerp(100,3+mz,k)+bz],tilt:lerp(.1,1.15,k)+(p>.7?.15*Math.sin(Math.PI*cl((p-.7)/.06,0,1)):0),spin:lerp(0,.7,k),lost:p>=.70?sstep(.70,.86,p):-1,glow:1-sstep(.84,1,p)}}
    if(p>=.58){const k=ez(cl((p-.58)/.14,0,1)),bz=p>=.72&&p<.78?2.5*Math.sin(Math.PI*(p-.72)/.06):0;A.scFall={k,bz,mz:8*sstep(.70,.90,p)}}
    A.mound=sstep(.70,.90,p);A.cry=.6*(1-sstep(.6,1,p));
    fx('vortex',(p-.55)/.35);fx('fall',(p-.70)/.30)}
  else if(anim==='idle'||true){// FERMA: a statue; only small things move, slow and regular: the breath (the chest 1 px, the shoulders .6), a puff
    // of cold breath, the head following you and lifting the chin, the slow blink, the glint running along the crown, the crystal and the
    // light inside the gown breathing together, the fringe swaying, two impatient taps of the fingers, mist out of the hem
    A.br=.5-.5*Math.cos(ph);A.sh=.6*A.br;A.hy=look(p,.07);A.hp=-.05-.105*rise(p,.30,.45,.70,.85);
    A.blink=.55*(1-bump((p-.78)/.12));A.glint=p>=.10&&p<.40?(p-.10)/.04:-1;A.cry=.45+.25*A.br;A.gL=.25+.15*A.br;A.sw=Math.sin(2*ph);
    A.tap=Math.max(pls(p,.905,.04),pls(p,.955,.04));fx('breath',(p-.5)/.24);fx('mist',p)}
  if(P2&&anim!=='rage'){A.brow=1}
  if(o.crown>0&&!A.gone){A.lit=A.lit.map(v=>Math.max(v,o.crown))}
  return A}

// ------------------------------------------------------------------ pieces
// THE GOWN: the faces of the iceberg, each in its own tone (the night rising from the hem in the change of phase, the white of a flash, the
// band of light of a blow, the white cracks of the defeat), a thin light seam on the edges toward the light, the light inside, the stars
function gownDraw(V0,X,A,gh,J){const{P,F}=V0,sk=A.sink>0?1-A.sink/58:1,gw=A.sink>0?1+.3*A.sink/58:1,
    W=GM.V.map(q=>X.T([q[0]*gw,q[1]*gw,q[2]*sk])),S=W.map(q=>P(q)),H=chull(S);J.gH=H;if(H.length<3)return;
  const KP=k=>pal(k,gh),night=A.night,nk=z=>night<0?0:sstep(night+5,night-5,z);
  ctx.lineJoin='round';poly(H);ctx.fillStyle=KP(A.p2?1:nk(10)).gcore;ctx.fill();
  const groups=new Map(),seam=new Path2D();let ns=0;
  for(let i=0;i<GM.F.length;i++){const f=GM.F[i],n=X.Rd(GM.N[i]),v=F(n);if(v<=.01)continue;const pn=P(n);
    const z=GM.Z[i],T=KP(A.p2?1:nk(z)).gown;let k=Math.round((.24+(cl(.55+.45*(-.55*pn[0]-.7*pn[1])+.2*v,0,1)-.62)*1.55+.1*(1-z/58))*10)/10;
    let col=tone(T,k);if(A.gW>0)col=cmix(col,'#ffffff',.85*A.gW);if(A.band>=0){const b=Math.exp(-(((z-A.band)/8)**2));if(b>.02)col=cmix(col,'#ffffff',.55*b)}
    let g=groups.get(col);if(!g)groups.set(col,g=[]);g.push(f);
    // the seam on the edges toward the light
    if(v>.08&&k>.42){let sx=0,sy=0;for(const j of f){sx+=S[j][0];sy+=S[j][1]}sx/=f.length;sy/=f.length;
      for(let e=0;e<f.length;e++){const a=S[f[e]],b=S[f[(e+1)%f.length]],ex=b[0]-a[0],ey=b[1]-a[1],el=Math.hypot(ex,ey);if(el<1.5)continue;let nx=ey/el,ny=-ex/el;
        if(nx*((a[0]+b[0])/2-sx)+ny*((a[1]+b[1])/2-sy)<0){nx=-nx;ny=-ny}if(-.6*nx-.8*ny<.25)continue;seam.moveTo(a[0]-nx*.7,a[1]-ny*.7);seam.lineTo(b[0]-nx*.7,b[1]-ny*.7);ns++}}}
  for(const[col,fs] of groups){ctx.beginPath();for(const f of fs){ctx.moveTo(S[f[0]][0],S[f[0]][1]);for(let e=1;e<f.length;e++)ctx.lineTo(S[f[e]][0],S[f[e]][1]);ctx.closePath()}ctx.fillStyle=col;ctx.fill()}
  if(ns){ctx.strokeStyle=rgbA('234,251,255',.5);ctx.lineWidth=.9;ctx.lineCap='round';ctx.stroke(seam)}
  ctx.save();poly(H);ctx.clip();
  // the light inside the ice, low in front (it breathes with the crystal); still on slow phones
  if(!gh){const q=P(X.T([12,0,14])),gl=KP(A.p2?1:nk(14)).glight;if(!LOWFX)shine(gl,q[0],q[1],30,A.gL*.6);else{const g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],30);g.addColorStop(0,rgbA(gl,.22));g.addColorStop(1,rgbA(gl,0));ctx.fillStyle=g;ctx.fillRect(q[0]-30,q[1]-30,60,60)}}
  // the stars of the night (each lights up when the night passes it), only on the faces that look at us
  if((A.p2||night>0)&&!LOWFX){const pw=new Path2D(),pc=new Path2D(),gl=[];
    for(let i=0;i<STARS.length;i++){const[t,z,s0,w]=STARS[i],al=A.p2?1:sstep(z-2,z+4,night);if(al<.5)continue;const n=X.Rd(gN(t,z)),v=F(n);if(v<.15)continue;
      const q=P(X.T(gS(t,z*sk,.3))),tw=.6+.4*Math.sin((G.t||0)*TAU*(.35+.12*(i%4))+i*1.7),r=s0*(.8+.25*tw),pa=w?pc:pw;
      pa.moveTo(q[0],q[1]-r*1.5);pa.lineTo(q[0]+r*.3,q[1]-r*.3);pa.lineTo(q[0]+r*1.5,q[1]);pa.lineTo(q[0]+r*.3,q[1]+r*.3);pa.lineTo(q[0],q[1]+r*1.5);pa.lineTo(q[0]-r*.3,q[1]+r*.3);pa.lineTo(q[0]-r*1.5,q[1]);pa.lineTo(q[0]-r*.3,q[1]-r*.3);pa.closePath();
      if(i%3===0||w)gl.push([q,r,tw,w])}
    ctx.fillStyle=K1.star;ctx.fill(pw);ctx.fillStyle=K1.star2;ctx.fill(pc);for(const[q,r,tw,w] of gl)shine(w?'255,233,168':'255,255,255',q[0],q[1],r*3,.35*tw)}
  // the cracks of white light that climb the gown when she is defeated
  if(A.gcr>0){const runs=[];for(let i=0;i<9;i++){const t0=i/9*TAU+.2,pts=[];let br=null;for(let j=0;j<=6;j++){const z=j*9.6;if(z>A.gcr+.01)break;const t=t0+(j%2?.09:-.07)+.03*j*Math.sin(i*2.7),n=X.Rd(gN(t,z));
      if(F(n)<.02){if(pts.length>1)runs.push(pts.slice());pts.length=0;continue}const q=P(X.T(gS(t,z*sk,.2)));pts.push(q);if(j===2||j===4){const tb=t+(i%2?.16:-.16),zb=z+6;if(zb<=A.gcr)runs.push([q,P(X.T(gS(tb,zb*sk,.2)))])}}if(pts.length>1)runs.push(pts)}
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';strokeRuns(runs,'rgba(200,235,255,.45)',3.2);ctx.restore()}strokeRuns(runs,'#ffffff',1.1)}
  ctx.restore();
  poly(H);ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke();rimP(H,.24);rimL(H,.32)}
// the points of the hem and the seracs: the ones that turn away go behind the gown (only what sticks out of it shows)
function hemDraw(V0,X,A,gh,J){const{F}=V0,sk=A.sink>0?1-A.sink/58:1,gw=A.sink>0?1+.3*A.sink/58:1,tr=q=>X.T([q[0]*gw,q[1]*gw,q[2]*sk]),back=[],front=[];
  for(const h of HEM){const g=A.p2?1:A.night>=0?sstep(-2,8,A.night):0,Tp=lerp3(h.T1,h.T2,g),Vs=[h.L,h.M,h.R,Tp].map(tr),f=F(X.Rd(nrm([Math.cos(h.t),Math.sin(h.t),.3])));
    if(f>-.3)(f>0?front:back).push({Vs,Fs:HEMF,T:pal(A.p2?1:g,gh).ice,kb:-.1})}
  for(const s of SPK){const g=A.p2?1:A.night>=0?sstep(s.z-4,s.z+6,A.night):0,kL=s.p1?1+.5*g:g;if(kL<.05)continue;
    const b=gS(s.t,s.z,-1),d=nrm([Math.cos(s.e)*Math.cos(s.t),Math.cos(s.e)*Math.sin(s.t),Math.sin(s.e)]),G=spikeG(b,d,s.L*kL,s.w*(s.p1?1:Math.min(1,g*1.4)),4,[0,0,1],.24,.4),
      Vs=G.V.map(tr),f=F(X.Rd(gN(s.t,s.z)));if(f>-.45)(f>0?front:back).push({Vs,Fs:G.F,T:pal(A.p2?1:g,gh).ice,kb:.04})}
  if(back.length&&J.gH){ctx.save();ctx.beginPath();ctx.rect(-1e4,-1e4,2e4,2e4);polyAdd(J.gH);ctx.clip('evenodd');crystB(V0,back,{lw:1.5,seam:false,q:6});ctx.restore()}
  crystB(V0,front,{lw:1.5,q:8})}
// THE BODICE: the union of the bands between its rings with one outline; the neckline, the silver embroidery, the star brooch
function corsetDraw(V0,XU,A,K,J){const{P,F}=V0,N=12,br=A.br,rings=CRS.map(([z,rx,ry],i)=>{const e=i>=2?.35*br:0,out=[];for(let j=0;j<N;j++){const t=j/N*TAU;out.push(P(XU.T([Math.cos(t)*(rx+e),Math.sin(t)*(ry+e*.5),z+br*(i>=3?1:i>=2?.6:0)])))}return out});
  const hs=[];for(let i=0;i<rings.length-1;i++)hs.push(chull(rings[i].concat(rings[i+1])));let all=[];for(const h of hs)all=all.concat(h);const bb=bbox(all);
  ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=4.8;for(const h of hs){poly(h);ctx.stroke()}
  const fill=grad3(bb,K.vel),path=new Path2D();for(const h of hs){path.moveTo(h[0][0],h[0][1]);for(let i=1;i<h.length;i++)path.lineTo(h[i][0],h[i][1]);path.closePath()}
  ctx.fillStyle=fill;ctx.fill(path);J.cPath=path;
  // the velvet's sheen: a soft light down the lit side, the shadow under the bust
  {const q=P(XU.T([6,-6,70])),g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],13);g.addColorStop(0,'rgba(150,160,255,.28)');g.addColorStop(1,'rgba(150,160,255,0)');ctx.fillStyle=g;ctx.fill(path)}
  const fr=F(XU.Rd([1,0,.15]));
  if(fr>-.15){ga(cl((fr+.15)*4,0,1),()=>{const zb=br;
    // the V of the neckline: porcelain inside, a silver edge
    const V1=[cAt(-9,80.2+zb,.2),cAt(-5,76,.25),cAt(0,72.4+zb*.6,.3),cAt(5,76,.25),cAt(9,80.2+zb,.2),cAt(6,81.8+zb,.1),cAt(0,82+zb,.1),cAt(-6,81.8+zb,.1)].map(q=>P(XU.T(q)));
    poly(V1);ctx.fillStyle=K.skin.b;ctx.fill();
    ctx.strokeStyle=K.emb;ctx.lineWidth=1.1;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<5;i++)ctx.lineTo(V1[i][0],V1[i][1]);ctx.stroke();
    // the waist's silver thread
    {const pts=[];for(let i=0;i<=24;i++){const t=-1.9+i/24*3.8,[rx,ry]=crAt(60.5),n=XU.Rd(nrm([Math.cos(t)/rx,Math.sin(t)/ry,0]));if(F(n)<.04){if(pts.length>1)break;pts.length=0;continue}pts.push(P(XU.T([Math.cos(t)*(rx+.25),Math.sin(t)*(ry+.25),60.5])))}
      if(pts.length>1){ctx.strokeStyle=K.emb;ctx.lineWidth=1.1;ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.stroke()}}
    // the snowflake embroidered on the chest: six arms with little branches
    {const c0=[0,67+zb*.5],R=4.4;ctx.strokeStyle=K.emb;ctx.lineWidth=.9;ctx.beginPath();
      for(let i=0;i<6;i++){const a=i/6*TAU+Math.PI/2,ca=Math.cos(a),sa=Math.sin(a),pt=(r,da)=>P(XU.T(cAt(c0[0]+Math.cos(a+da)*r,c0[1]+Math.sin(a+da)*r,.25)));
        const a0=pt(0,0),a1=pt(R,0);ctx.moveTo(a0[0],a0[1]);ctx.lineTo(a1[0],a1[1]);const m=pt(R*.58,0);for(const s of[-1,1]){const e=pt(R*.58+1.5,s*.55);ctx.moveTo(m[0],m[1]);ctx.lineTo(e[0],e[1])}}ctx.stroke()}})}
  // the silver lacing down the back
  const fk=F(XU.Rd([-1,0,.15]));if(fk>-.1)ga(cl((fk+.1)*4,0,1),()=>{const bk=(y,z)=>{const q=cAt(y,z,.3);return P(XU.T([-q[0],q[1],q[2]]))};ctx.strokeStyle=K.emb;ctx.lineWidth=.85;ctx.lineCap='round';ctx.beginPath();
    for(let z=60;z<77;z+=3.4){const a1=bk(-2.2,z),b1=bk(2.2,z+3.4),a2=bk(2.2,z),b2=bk(-2.2,z+3.4);ctx.moveTo(a1[0],a1[1]);ctx.lineTo(b1[0],b1[1]);ctx.moveTo(a2[0],a2[1]);ctx.lineTo(b2[0],b2[1])}
    for(const y of[-2.7,2.7]){const a1=bk(y,59.5),b1=bk(y,78);ctx.moveTo(a1[0],a1[1]);ctx.lineTo(b1[0],b1[1])}ctx.stroke()});
  rimP(hs[2],.2);
  // the star brooch with its blue gem, where the neckline meets
  if(fr>0){const c=XU.T(cAt(0,74.2+br*.6,1)),q=P(c),r=3.1;ga(cl(fr*4,0,1),()=>{ctx.beginPath();for(let i=0;i<12;i++){const a=-Math.PI/2+i*Math.PI/6,rr=i%2?r*.45:r;ctx.lineTo(q[0]+Math.cos(a)*rr,q[1]+Math.sin(a)*rr*.9)}ctx.closePath();
    ctx.fillStyle=K.silv;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();ctx.fillStyle=K.bgem;ball(q,1.25);ctx.fill();ctx.fillStyle='#fff';ball([q[0]-.45,q[1]-.5],.45);ctx.fill()})}}
// the shoulder pieces: three points of ice on each shoulder
function spaulder(V0,XU,sd,A,K){const b=[0,sd*15,79.2+A.sh],list=[[nrm([0,sd*.9,.48]),10.5,2.9],[nrm([.6,sd*.62,.5]),6.5,2.1],[nrm([-.6,sd*.62,.5]),6.5,2.1]];
  crystB(V0,list.map(([d,L,w])=>{const G=spikeG(add(b,mul(d,-1)),d,L+1,w,3,[0,0,1],.22,sd*.5);return{Vs:G.V.map(q=>XU.T(q)),Fs:G.F,T:K.ice,kb:.06}}),{lw:1.6,q:6})}
// THE ARMS: the shoulder (on the body), the elbow found by the IK; the upper arm of velvet; from the elbow the bell sleeve of frosted silk
// that hangs down to the hem with its icicles; inside it the slim porcelain forearm; the hand
const LUA=19,LFA=19;
function armIK(XU,X,sd,hand,A){const S=XU.T([0,sd*15,78+A.sh*.6]),Hw=X.T(hand),pole=X.Rd(nrm(A.pole&&A.pole[sd>0?1:0]||[-.3,sd*.62,-1])),[El,W]=ik(S,Hw,LUA,LFA,pole);return{S,El,W}}
function upperArm(V0,a,K){const{P}=V0,A2=P(a.S),B2=P(a.El);chain(V0,[a.S,a.El],[3.6,3.2],K.vel.b,{lw:2.4,fill:limbGrad(A2,B2,3.6,K.vel),noRim:1});shade2(A2,B2,3.4,'rgba(10,8,40,.3)',.14)}
// the sleeve: a bell from the elbow to the wrist and the drape that hangs from it (the tip pushed out of the gown, left behind when she
// slides, flung out when she turns)
function sleeveGeo(a,X,A,sd){const fa=nrm(sub(a.W,a.El)),fz=fa[2],hang=lerp(12,6,sstep(-.25,.85,fz)),lg=A.lag||[0,0],so=A.spinOut||0,out=X.Rd([0,sd,0]);
  // the lowest point of the rim, under the cuff (left behind when she slides, flung out when she turns); then out of the gown
  let tip=add(add(a.W,mul(fa,-2)),[lg[0]+out[0]*8*so,lg[1]+out[1]*8*so,-hang+6*so]);tip[2]=Math.max(5,tip[2]);
  const bx=X.T([0,0,0]),push=q=>{const rel=sub(q,bx),zr=cl(q[2]-bx[2],0,58),rr=Math.hypot(rel[0]/GA,rel[1]),t=Math.atan2(rel[1],rel[0]/GA),rg=gR(t,zr)+3;
    return zr<57&&rr<rg?[bx[0]+rel[0]*rg/Math.max(.1,rr),bx[1]+rel[1]*rg/Math.max(.1,rr),q[2]]:q};
  tip=push(tip);const mid=push(add(lerp3(a.El,a.W,.45),[lg[0]*.5,lg[1]*.5,-hang*.55]));return{fa,tip,mid}}
// the sleeve: the bell of frosted silk from the elbow to the open cuff, its rim hanging down to the hem with three icicles; the dark lining
// where it opens toward us, soft folds fanning from the elbow, the shade toward the hem
function sleeveDraw(V0,a,g,K,A,sd){const{P,F}=V0,[u,v]=frm(g.fa,[0,0,1]),pts=[],wr=add(a.W,mul(g.fa,-.6)),tp=g.tip,side=nrm(cross([0,0,1],g.fa));
  for(let i=0;i<10;i++){const t=i/10*TAU;pts.push(P(add(a.El,add(mul(u,Math.cos(t)*3.9),mul(v,Math.sin(t)*3.9)))))}
  // the rim of the cuff: round at the top, pulled down into a rounded point at the bottom (the hang)
  const rim3=[];for(let i=0;i<18;i++){const t=i/18*TAU,c=Math.cos(t),s2=Math.sin(t),top=add(wr,add(mul(side,s2*5.6),[0,0,c*4.8]));rim3.push(c>=0?top:lerp3(add(wr,mul(side,s2*5.6)),add(tp,mul(side,s2*3.4)),Math.pow(-c,.8)))}
  for(const q of rim3)pts.push(P(q));pts.push(P(g.mid));
  const H=chull(pts);if(H.length<3)return;const b0=bbox(H),gs=ctx.createLinearGradient(0,b0[1],0,b0[3]);gs.addColorStop(0,K.silk.l);gs.addColorStop(.45,K.silk.b);gs.addColorStop(1,cmix(K.silk.b,K.silk.d,.7));
  svol(H,K.silk,{lw:2.2,fill:gs,rim:.3});
  // the lining where the cuff opens toward us
  const fo=F(g.fa);if(fo>.05){const Q=rim3.map(q=>P(lerp3(q,wr,.16)));ga(cl((fo-.05)*3.5,0,1),()=>{smooth(Q);ctx.fillStyle=cmix(K.silk.d,'#1a1440',.45);ctx.fill()})}
  // soft folds from the elbow toward the hem, the light on the upper edge
  {const e=P(add(a.El,[0,0,-1.5]));ctx.strokeStyle='rgba(60,70,160,.5)';ctx.lineWidth=1.2;ctx.lineCap='round';ctx.beginPath();for(const k of[.2,.5,.8]){const m=P(lerp3(lerp3(a.El,g.mid,.5),lerp3(wr,tp,.5),k)),t0=P(lerp3(g.mid,tp,k));ctx.moveTo(e[0],e[1]);ctx.quadraticCurveTo(m[0],m[1],t0[0],t0[1])}ctx.stroke()}
  // the hem scalloped (a soft wave just inside the hanging rim) and the frost glinting on the silk
  {const lo=rim3.filter((q,i)=>Math.cos(i/18*TAU)<-.05).map(q=>P(lerp3(q,g.mid,.1)));if(lo.length>2){ctx.strokeStyle=cmix(K.silk.d,'#2a3a78',.35);ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(lo[0][0],lo[0][1]);
    for(let i=1;i<lo.length;i++){const a0=lo[i-1],b1=lo[i];ctx.quadraticCurveTo((a0[0]+b1[0])/2,(a0[1]+b1[1])/2+1.3,b1[0],b1[1])}ctx.stroke()}}
  if(!LOWFX){ctx.fillStyle='rgba(255,255,255,.85)';for(const[k1,k2] of[[.3,.25],[.55,.6],[.75,.35],[.45,.85]]){const q=P(lerp3(lerp3(a.El,wr,k1),lerp3(g.mid,tp,k1),k2));ctx.beginPath();ctx.moveTo(q[0],q[1]-1.3);ctx.lineTo(q[0]+.6,q[1]);ctx.lineTo(q[0],q[1]+1.3);ctx.lineTo(q[0]-.6,q[1]);ctx.closePath();ctx.fill()}}
  // the icicles on the hem
  const sw=A.sw||0,ice=A.sice>0?lerp(1,1.65,A.sice):1;ctx.fillStyle=K.sice;ctx.strokeStyle='#2a3a78';ctx.lineWidth=.9;ctx.lineJoin='round';
  for(const[s2,L,up] of[[-2.6,4,1.2],[0,6,0],[2.6,4,1.2]]){const b1=add(tp,add(mul(side,s2),[0,0,up+.6])),q0=P(b1),q1=P(add(b1,[sw*.6,0,-L*ice]));
    ctx.beginPath();ctx.moveTo(q0[0]-1.4,q0[1]);ctx.lineTo(q1[0],q1[1]);ctx.lineTo(q0[0]+1.4,q0[1]);ctx.closePath();ctx.fill();ctx.stroke()}}
// a hand: the palm (porcelain), three slim fingers and the thumb. fd: where the fingers point, pn: where the palm looks, cu: the curl of
// each finger (0 open, 1 closed), th: the thumb folded
function handDraw(V0,W,fd,pn,cu,th,K,tap){const{P}=V0;fd=nrm(fd);pn=nrm(sub(pn,mul(fd,dot(pn,fd))));const sd=nrm(cross(fd,pn)),pc=add(W,mul(fd,2.4));
  const fing=[];for(let j=0;j<3;j++){const c=cu?cu[j]||0:0,b=add(add(pc,mul(fd,1.9)),mul(sd,(j-1)*1.45)),d1=nrm(add(mul(fd,Math.cos(c*1.2)),mul(pn,Math.sin(c*1.2)))),m=add(b,mul(d1,3.2)),
    d2=nrm(add(mul(fd,Math.cos(c*2.4)),mul(pn,Math.sin(c*2.4)))),e=add(m,mul(d2,2.6)),lift=j>0&&tap?mul(pn,-2*tap):[0,0,0];fing.push([b,add(m,lift),add(e,lift)])}
  const t0=add(pc,mul(sd,-2.2)),t1=add(t0,mul(nrm(add(mul(fd,.6),add(mul(sd,-.5),mul(pn,.4*(th||0))))),3.4));
  const q=P(pc),path=pa=>{ctx.beginPath();for(const f of pa){const a=P(f[0]);ctx.moveTo(a[0],a[1]);for(let i=1;i<f.length;i++){const b=P(f[i]);ctx.lineTo(b[0],b[1])}}};
  ctx.lineCap='round';ctx.lineJoin='round';path([[t0,t1]]);ctx.strokeStyle=INK;ctx.lineWidth=3.6;ctx.stroke();ctx.strokeStyle=K.skin.l;ctx.lineWidth=2.1;ctx.stroke();
  ink(1.4);ball(q,3.05);ctx.fillStyle=K.skin.b;ctx.fill();ctx.stroke();ctx.fillStyle=K.skin.l;ball([q[0]-.8,q[1]-.9],1.6);ctx.fill();
  path(fing);ctx.strokeStyle=INK;ctx.lineWidth=3.5;ctx.stroke();ctx.strokeStyle=K.skin.l;ctx.lineWidth=2.1;ctx.stroke()}
// THE SCEPTER: burnished silver, the pointed foot, the spiral of ice up the shaft, the claw of three silver fingers holding the crystal
function scepterDraw(V0,A,X,K,J){const{P,F}=V0,F0=X.T(A.sF),D=X.Rd(A.sD),at=u=>add(F0,mul(D,u)),[u,v]=frm(D,[1,0,0]);
  // the foot: a point of four faces
  {const a0=P(at(7)),t0=P(at(0)),sx=P(add(at(7),mul(u,2.4))),sy=P(add(at(7),mul(u,-2.4)));ctx.beginPath();ctx.moveTo(sx[0],sy[1]>sx[1]?sx[1]:sx[1]);ctx.moveTo(sx[0],sx[1]);ctx.lineTo(t0[0],t0[1]);ctx.lineTo(sy[0],sy[1]);ctx.closePath();ctx.fillStyle=K.sil.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.lineJoin='round';ctx.stroke()}
  const a=at(6),b=at(100),qa=P(a),qb=P(b);chain(V0,[a,b],[1.9,1.9],K.sil.b,{lw:1.5,fill:limbGrad(qa,qb,1.9,K.sil),noRim:1});
  // the spiral of ice (three turns)
  {const runs=[];let cur=[];for(let i=0;i<=30;i++){const s=70+i/30*28,ph=i/30*3*TAU,nr=add(mul(u,Math.cos(ph)),mul(v,Math.sin(ph)));if(F(nr)>0)cur.push(P(add(at(s),mul(nr,1.9))));else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
    strokeRuns(runs,INK,2.6);strokeRuns(runs,K.spir,1.4)}
  // the collar and the claw
  {const q=P(at(100));ink(1.6);ball(q,2.7);ctx.fillStyle=grad3([q[0]-3,q[1]-3,q[0]+3,q[1]+3],K.circ);ctx.fill();ctx.stroke()}
  const cc=at(106.5),cr=7,cK=pal(A.cc>0?Math.max(A.k2c,A.cc):A.k2c,J.gh).cry,glow=A.cfc||pal(A.k2c,J.gh).cglow,fingers=[0,1,2].map(i=>{const t=i/3*TAU+.5,o2=add(mul(u,Math.cos(t)),mul(v,Math.sin(t)));
    return[at(100.5),add(at(102.5),mul(o2,4.2)),add(at(107),mul(o2,6.6)),add(at(111),mul(o2,3.6))]});
  const fb=fingers.filter(f=>F(sub(f[2],cc))<0),ff=fingers.filter(f=>F(sub(f[2],cc))>=0),claw=fs=>{if(!fs.length)return;ctx.beginPath();for(const f of fs){const a=P(f[0]);ctx.moveTo(a[0],a[1]);for(let i=1;i<f.length;i++){const b=P(f[i]);ctx.lineTo(b[0],b[1])}}
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=3.4;ctx.stroke();ctx.strokeStyle=K.circ.l;ctx.lineWidth=1.7;ctx.stroke()};
  claw(fb);
  // the crystal: an octahedron that pulses (the colour of the spell, white in the flash)
  {const tp=at(106.5+7.5),bt=at(106.5-6.5),R=[0,1,2,3].map(i=>{const t=i/4*TAU+.4;return add(cc,add(mul(u,Math.cos(t)*cr*.82),mul(v,Math.sin(t)*cr*.82)))}),Vs=[tp,bt].concat(R),
      Fs=[[0,2,3],[0,3,4],[0,4,5],[0,5,2],[1,3,2],[1,4,3],[1,5,4],[1,2,5]],q=P(cc),wt=Math.max(A.cw*.8,A.cfl*.9);
    if(!LOWFX&&!J.gh)shine(glow,q[0],q[1],cr*3.6,A.cry*(1+.6*A.cfl));
    cryst(V0,Vs,Fs,cK,{lw:1.5,kb:.3,wt});J.cryQ=q}
  claw(ff);
  if(A.cfl>.05&&!LOWFX&&!J.gh){const q=J.cryQ,g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],16);g.addColorStop(0,`rgba(255,255,255,${.85*A.cfl})`);g.addColorStop(.5,rgbA(glow,.4*A.cfl));g.addColorStop(1,rgbA(glow,0));ctx.fillStyle=g;ball(q,16);ctx.fill()}
  return at}
// THE HEAD (its own frame: T turns a point of the head into the body's, HR a direction): the porcelain ball, the hair, the bun, the face,
// the circlet with the gem, the fringe of icicles, the seven stalactites (the ones behind the head first)
function stalGeo(i,A,alone){const s=CS[i],k2=A.k2c,L0=lerp(s.L,s.L2,A.clen);let L=L0,b=s.b;
  if(A.cgrow)L=L0*A.cgrow[i];if(alone){b=add(CFC,mul(s.d,1.5));L=L0+s.t-1.5}
  return{b,L,W:s.W,d:s.d,k2}}
function stalItem(T,i,g,A,K){const li=(A.lit&&A.lit[i])||0,gl=A.glint>=0?bump(cl((A.glint-CORD.indexOf(i)+.5)/1.6,0,1)):0,G=spikeG(g.b,g.d,g.L,g.W*.6,4,CFN,.22,0);
  return{Vs:G.V.map(T),Fs:G.F,T:K.cice,kb:-.06+.4*li+.3*gl,wt:.15*gl,li}}
function stalGlow(V0,T,g,li,K,gh){if(li<=.05||gh)return;const q=V0.P(T(add(g.b,mul(g.d,g.L*.8))));shine(K.clit,q[0],q[1],7,.55*li);ctx.save();ctx.globalAlpha*=li;glowTop(q,3.5,.4);ctx.restore()}
function stalDraw(V0,T,HR,i,g,A,K,gh){if(g.L<.6)return;const it=stalItem(T,i,g,A,K);crystB(V0,[it],{lw:1.6});stalGlow(V0,T,g,it.li,K,gh)}
function headDraw(V0,T,HR,Hc,A,K,J,gh){const{P,F}=V0,h=P(Hc),fw=F(HR([1,0,0]));
  // the stalactites (none while they are away; regrowing from the stubs): behind the head, in front of it, and the few turning between
  const showC=!A.cgone&&A.cfly<0&&!A.crownOff,back=[],front=[],mid=[];
  if(showC||A.cgrow)for(let i=0;i<7;i++){const g=stalGeo(i,A);if(g.L<.6)continue;const kf=sstep(-.12,.12,F(HR(CS[i].n))),e={i,g,kf,it:stalItem(T,i,g,A,K)};(kf<=0?back:kf>=1?front:mid).push(e)}
  const glows=l=>{for(const e of l)stalGlow(V0,T,e.g,e.it.li,K,gh)};
  if(back.length){crystB(V0,back.map(e=>e.it),{lw:1.6,q:6,seam:false});glows(back)}
  // the bun (behind the head unless the back of the head looks at us)
  const bunC=[-11.6,0,4.2],bunN=nrm(bunC),fb=F(HR(bunN)),bun=()=>{const c=T(bunC),pr=ellSil(V0,c,[5.6,6.4,5.6],null,null,12);svol(pr,K.hair,{lw:2.2});
    const q=P(c);ctx.strokeStyle='rgba(120,140,210,.5)';ctx.lineWidth=1.1;ctx.lineCap='round';ctx.beginPath();ctx.arc(q[0]-.8,q[1]-.6,3.6,3.5,5.3);ctx.stroke();
    ctx.strokeStyle='rgba(8,10,30,.4)';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(q[0]+.8,q[1]+.4,2.4,.2,2.2);ctx.stroke()};
  // the head, the hair
  const sk=ellSil(V0,[0,0,0],HRD,null,T,16);svol(sk,K.skin,{lw:2.6,rim:.3});
  hairCap(V0,T,HR,K);
  if(fb<=.3)layered(bun,sk,sstep(-.12,.1,fb));
  if(mid.length){const sil=ellSil(V0,[0,0,0],add(HRD,[1,1,1]),null,T,16);for(const e of mid)layered(()=>{crystB(V0,[e.it],{lw:1.6});stalGlow(V0,T,e.g,e.it.li,K,gh)},sil,e.kf)}
  // the face (eyes, brows, nose, mouth, cheeks, the frost mark)
  let E=[];if(fw>-.35)E=faceDraw(V0,T,HR,Hc,A,K,gh);
  // the circlet, the gem, the fringe; the stalactites in front
  circlet(V0,T,HR,A,K,gh,showC||!!A.cgrow);
  if(front.length){crystB(V0,front.map(e=>e.it),{lw:1.6,q:8});glows(front)}
  if(fb>.3)bun();
  // the stubs of the stalactites while they are away
  if(A.cgone||A.cfly>=0){const st=[];for(let i=0;i<7;i++){const s2=CS[i];if(F(HR(s2.n))<-.05)continue;st.push(stalItem(T,i,{b:s2.b,L:2.6,W:s2.W*.85,d:s2.d},{lit:[],glint:-1},K))}if(st.length)crystB(V0,st,{lw:1.4})}
  // the glow of the eyes over all of it; the rays of the Gaze
  const eg=A.eglowK==null?1:A.eglowK;J.Eq=E.filter(e=>e.rx>.6).map(e=>e.q);
  if(!LOWFX&&eg>0)for(const e of E){if(e.rx<.6)continue;const op=Math.min(1,A.blink);if(op<.12)continue;shine(K.eglow,e.q[0],e.q[1]+.3,(gh?7:9)*(.8+.3*A.wide),(gh?.3:.55)*eg*sstep(.12,.45,op)*Math.min(1,e.v*2))}
  if(A.rays>0&&E.length&&!gh){for(const e of E){if(e.rx<.6)continue;const d=HR(nrm([1,0,-.08])),q2=P(add(T([11,e.sd*4.2,-.8]),mul(d,26)));
    const g=ctx.createLinearGradient(e.q[0],e.q[1],q2[0],q2[1]);g.addColorStop(0,rgbA(K.eglow,.7*A.rays));g.addColorStop(1,rgbA(K.eglow,0));ctx.save();if(!LOWFX)ctx.globalCompositeOperation='lighter';ctx.strokeStyle=g;ctx.lineCap='round';
      ctx.lineWidth=3.2;seg(e.q,q2);ctx.stroke();ctx.lineWidth=1.2;ctx.strokeStyle=rgbA('255,255,255',.6*A.rays);seg(e.q,[(e.q[0]+q2[0])/2,(e.q[1]+q2[1])/2]);ctx.stroke();ctx.restore()}}
  J.E=E;return{sk}}
// the hair cap: the part of a cap on the hair's ellipsoid (a little bigger than the head) that looks at us, the limb taken the right way
// round (the part of the limb inside the cap)
const HN=nrm([-.5,0,.87]),HU=nrm(sub([0,0,1],mul(HN,HN[2]))),HV=cross(HN,HU),HAL=1.36,HAV=1.62;
const hairIn=m=>{const c=dot(m,HN),x=dot(m,HU),y=dot(m,HV),th=Math.acos(cl(c,-1,1)),ph=Math.atan2(y,x),lim=1/Math.sqrt((Math.cos(ph)/HAL)**2+(Math.sin(ph)/HAV)**2);return th<lim*(1+.04*Math.sin(ph*5))};
const HRB=Array.from({length:26},(_,i)=>{const ph=i/26*TAU,lim=1/Math.sqrt((Math.cos(ph)/HAL)**2+(Math.sin(ph)/HAV)**2)*(1+.04*Math.sin(ph*5));return nrm(add(mul(HN,Math.cos(lim)),mul(add(mul(HU,Math.cos(ph)),mul(HV,Math.sin(ph))),Math.sin(lim))))});
function hairCap(V0,T,HR,K){const{P,F}=V0,R2=add(HRD,[.9,.9,.9]),S=m=>P(T([m[0]*R2[0],m[1]*R2[1],m[2]*R2[2]]));
  // the camera's direction in the hair's normalized space
  const g=nrm([F(HR([1,0,0]))/R2[0],F(HR([0,1,0]))/R2[1],F(HR([0,0,1]))/R2[2]]),f=HRB.map(m=>dot(m,g)),N=HRB.length,nv=f.filter(x=>x>=0).length;if(!nv)return null;
  let pts;
  if(nv===N)pts=HRB.map(S);
  else{let s0=0;for(let i=0;i<N;i++)if(f[i]<0&&f[(i+1)%N]>=0){s0=(i+1)%N;break}const cut=(a,c)=>{const k=f[a]/(f[a]-f[c]);return nrm(lerp3(HRB[a],HRB[c],k))};
    const rn=[cut((s0-1+N)%N,s0)];let i=s0;while(f[i]>=0){rn.push(HRB[i]);i=(i+1)%N}rn.push(cut((i-1+N)%N,i));
    let e1=cross(g,[0,0,1]);if(len(e1)<.2)e1=cross(g,[0,1,0]);e1=nrm(e1);const e2=cross(g,e1),ang=m=>Math.atan2(dot(m,e2),dot(m,e1)),nm=a=>((a%TAU)+TAU)%TAU;
    const a0=ang(rn[rn.length-1]),a1=ang(rn[0]),ccw=nm(a1-a0),mid=a0+ccw/2,mm=add(mul(e1,Math.cos(mid)),mul(e2,Math.sin(mid))),span=hairIn(mm)?ccw:-(TAU-ccw);
    const M=Math.max(2,Math.ceil(Math.abs(span)/.18)),lb=[];for(let k=1;k<M;k++){const a=a0+span*k/M;lb.push(add(mul(e1,Math.cos(a)),mul(e2,Math.sin(a))))}pts=rn.concat(lb).map(S)}
  const b=bbox(pts);ctx.lineJoin='round';poly(pts);const gr=ctx.createRadialGradient(b[0]+(b[2]-b[0])*.32,b[1]+(b[3]-b[1])*.2,1,b[0]+(b[2]-b[0])*.45,b[1]+(b[3]-b[1])*.5,Math.max(b[2]-b[0],b[3]-b[1])*.7);
  gr.addColorStop(0,K.hair.l);gr.addColorStop(.38,K.hair.b);gr.addColorStop(1,K.hair.d);ctx.fillStyle=gr;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke();
  // the sheen of the hair (a soft arc), the parting down the middle under the circlet
  {const R=[[],[]];for(let i=0;i<=7;i++){const t=.15+i*.17;for(let j=0;j<2;j++){const m=nrm([-.1+.32*Math.cos(t)-.18*j,Math.sin(t)*.92,.6+.1*j]);if(F(HR(m))>.08)R[j].push(S(m));else if(R[j].length>1)break}}
    if(R[0].length>1)strokeRuns([R[0]],'rgba(120,140,215,.55)',2.2);if(R[1].length>1)strokeRuns([R[1]],'rgba(150,170,230,.32)',1)}
  {const run=[];for(let i=0;i<=5;i++){const m=nrm([.7-i*.1,0,.72+i*.05]);if(F(HR(m))>.05)run.push(S(m))}if(run.length>1)strokeRuns([run],'rgba(8,10,30,.55)',1)}
  return pts}
// a pair of eyes and the rest of the face; returns the eyes (for their glow)
function faceDraw(V0,T,HR,Hc,A,K,gh){const{P,F}=V0,h=P(Hc),Rh=12.4,R2=HRD,at=m=>({q:P(T(ellAt([0,0,0],R2,null,m))),v:F(HR(ellN(R2,null,m)))});
  const E=[-1,1].map(sd=>{const m=nrm([1,sd*.36,-.07]),r=at(m);return{sd,v:r.v,q:r.q,rx:2.75*Math.pow(Math.max(0,r.v),.7)}}).filter(e=>e.v>.08).sort((a,b)=>b.v-a.v);
  if(E.length)E[0].q=inward(h,Rh,E[0].q,.6,.74);if(E.length>1){const n=E[0],f=E[1];f.q=inward(h,Rh,f.q,.5,.66);const gap=Math.hypot(f.q[0]-n.q[0],f.q[1]-n.q[1])-n.rx-1;f.rx=Math.min(f.rx,Math.max(0,gap))}
  // (her proud half-shut lids read as shut at the size of the game, a dark line under the crown: the eyes open and cold, the lids only a
  // little heavy; closed stays closed)
  const op=A.blink<.12?A.blink:Math.min(1.25,.45+A.blink),wd=A.wide||0,ry=2.5*(1+.18*wd);
  // the cheeks, the eye shadow
  for(const sd of[-1,1]){const r=at(nrm([1,sd*.5,-.22]));if(r.v<.2)continue;const q=inward(h,Rh,r.q,.66,.8);ctx.fillStyle=rgbA(K.cheek,.22*sstep(.2,.4,r.v));ctx.beginPath();ctx.ellipse(q[0],q[1],2*Math.pow(r.v,.7),1.2,0,0,TAU);ctx.fill()}
  for(const e of E){if(e.rx<.6)continue;ctx.fillStyle=rgbA(K.esh,.35*Math.min(1,e.v*1.6));ctx.beginPath();ctx.ellipse(e.q[0],e.q[1]-ry*.85,e.rx*1.3,ry*.85,0,0,TAU);ctx.fill()}
  for(const e of E){if(e.rx<.6)continue;eyeDraw(e.q,e.rx,ry,op,A.low,wd,e.q[0]<h[0]?-1:1,K,e.v,gh)}
  // the brows: thin, high and arched, of the colour of the hair (in the night the inner ends come down)
  for(const sd of[-1,1]){const pts=[[1,sd*.13,lerp(.2,.09,A.brow)],[.94,sd*.37,.3-.03*A.brow],[.79,sd*.58,.21]].map(m=>at(nrm(m)));if(pts[1].v<.14)continue;
    const near=E.length&&E[0].sd===sd,qs=pts.map(r=>inward(h,Rh,r.q,near?.6:.5,near?.74:.66));ctx.strokeStyle=K.brow;ctx.lineWidth=.95;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(qs[0][0],qs[0][1]-wd*.8);ctx.quadraticCurveTo(qs[1][0],qs[1][1]-1.1-wd*1.2,qs[2][0],qs[2][1]-wd*.5);ctx.stroke()}
  // the nose: one little stroke; the lips, small and shut
  {const r=at(nrm([1,0,-.2]));if(r.v>.2){const q=inward(h,Rh,r.q,.62,.8);ctx.strokeStyle='rgba(120,130,190,.6)';ctx.lineWidth=.9;ctx.lineCap='round';seg([q[0]+.2,q[1]-1.2],[q[0]+.7,q[1]+.5]);ctx.stroke()}}
  {const r=at(nrm([1,0,-.4]));if(r.v>.15){const q=inward(h,Rh,r.q,.62,.8),w=2.2*Math.max(.45,Math.pow(r.v,.6)),bw=A.mouth;ctx.strokeStyle=K.lips;ctx.lineWidth=1.4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q[0]-w,q[1]-.2);ctx.quadraticCurveTo(q[0],q[1]+bw,q[0]+w,q[1]-.2);ctx.stroke();
    ctx.fillStyle=rgbA('75,61,143',.35);ctx.beginPath();ctx.ellipse(q[0],q[1]+.9+Math.max(0,bw)*.3,w*.55,.6,0,0,TAU);ctx.fill()}}
  // the frost mark under her left eye: a tiny six-armed flake
  {const r=at(nrm([1,-.44,-.26]));if(r.v>.25){const q=inward(h,Rh,r.q,.64,.78);ctx.strokeStyle=K.mole;ctx.lineWidth=.7;ctx.beginPath();for(let i=0;i<3;i++){const a=i/3*Math.PI+.3;ctx.moveTo(q[0]-Math.cos(a)*1.3,q[1]-Math.sin(a)*1.3);ctx.lineTo(q[0]+Math.cos(a)*1.3,q[1]+Math.sin(a)*1.3)}ctx.stroke()}}
  return E}
// an almond eye that shines: the cyan iris with its white core and the point of light, the thick dark upper lid with its little flick
// up at the outer corner (out: which side of the screen the outer corner is). op: how open (.55 half, 1 open, 1.25 round and big); low:
// the lower lid up (half moons)
function eyeDraw(q,rx,ry,op,low,wd,out,K,v,gh){const x=q[0],y=q[1],o=Math.max(0,op),ix=x-out*rx,ox=x+out*rx*1.05,iy=y+.35,oy=y-ry*.28,lo=y+ry*(.74+.22*(wd||0))-ry*1.55*(low||0);
  // the upper lid: from straight across the middle (half shut) to the round top of the eye (open); the inner end a little lower (proud)
  const lidC=y-ry*(2*Math.min(1.3,o)-1)*1.02,li=iy+.25*(1-Math.min(1,o)),lo2=y+ry*.62;
  if(o<.12){ctx.strokeStyle=K.lid;ctx.lineWidth=1.25;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(ix,iy);ctx.quadraticCurveTo(x,lo2+.4,ox,oy+.5);ctx.lineTo(ox+out*1.4,oy-.5);ctx.stroke();return}
  const lid=()=>{ctx.moveTo(ix,li);ctx.quadraticCurveTo(x-out*rx*.15,Math.min(lidC,lo-.4),ox,oy)};
  const lw2=Math.max(lo,lidC+.9),cy=(lidC+lw2)/2,alm=k=>{const X2=v=>x+(v-x)*k,Y2=v=>cy+(v-cy)*k;ctx.beginPath();ctx.moveTo(X2(ix),Y2(li));ctx.quadraticCurveTo(X2(x-out*rx*.15),Y2(Math.min(lidC,lo-.4)),X2(ox),Y2(oy));ctx.quadraticCurveTo(X2(x),Y2(lw2),X2(ix),Y2(li));ctx.closePath()};
  // (a deep rim and a full iris: the pale cyan alone did not stand out of the porcelain, and the eyes read as shut)
  alm(1);ctx.fillStyle=cmix(K.iris,'#16306e',.68);ctx.fill();alm(.74);ctx.fillStyle=cmix(K.iris,'#1e8ad8',.42);ctx.fill();alm(.5);ctx.fillStyle=K.iris;ctx.fill();
  const hc=Math.min(ry*.34,(lw2-lidC)*.26);if(hc>.25){ctx.fillStyle=K.eyeC;ctx.beginPath();ctx.ellipse(x+out*.2,cy+.15,rx*.24,hc,0,0,TAU);ctx.fill()}
  if(o>.3){ctx.fillStyle='#ffffff';ball([x-out*rx*.3,lidC+(lw2-lidC)*.32],.45+.08*rx);ctx.fill()}
  // the heavy lid and its flick, the fine lower lid
  ctx.strokeStyle=K.lid;ctx.lineWidth=1.15;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();lid();ctx.lineTo(ox+out*1.5,oy-1.1);ctx.stroke();
  ctx.strokeStyle='rgba(27,26,58,.7)';ctx.lineWidth=.75;ctx.beginPath();ctx.moveTo(ix+out*.2,li+.15);ctx.quadraticCurveTo(x,Math.max(lo,lidC+.9)+.2,ox-out*.15,oy+.25);ctx.stroke()}
// the circlet of silver round the head, the sapphire on the forehead (covered by frost, or bare and shining), the fringe of icicles
function circlet(V0,T,HR,A,K,gh,fringe){const{P,F}=V0,R2=mul(HRD,1.07),N=26,runs=[];let cur=[];
  for(let i=0;i<=N;i++){const th=i/N*TAU,m=ciDir(th),v=F(HR(ellN(HRD,null,m)));if(v>-.02)cur.push(P(T(ellAt([0,0,0],R2,null,m))));else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
  strokeRuns(runs,INK,3.8);strokeRuns(runs,K.circ.b,2.2);strokeRuns(runs.map(r=>r.map(q=>[q[0],q[1]-.6])),K.circ.l,.8);
  // the fringe: seven little icicles of clear ice hanging from the circlet over the forehead (thin, uneven, no dark outline: never a row of teeth)
  if(fringe){const sw=A.sw||0,FL=[3.2,4.4,4.8,5.8,4.6,4.2,3.4];ctx.lineJoin='round';const pa=new Path2D();let n=0;
    for(let j=0;j<7;j++){const th=(j-3)*16*DEG,m=ciDir(th),nm=ellN(HRD,null,m);if(F(HR(nm))<.08)continue;const b=ellAt([0,0,0],mul(HRD,1.05),null,m),dn=nrm(sub([0,0,-1],mul(nm,-nm[2]))),
      tip=add(add(b,mul(dn,FL[j])),[0,sw*.5,0]),sd=nrm(cross(dn,nm)),q0=P(T(add(b,mul(sd,-.8)))),q1=P(T(add(b,mul(sd,.8)))),q2=P(T(tip));pa.moveTo(q0[0],q0[1]);pa.lineTo(q2[0],q2[1]);pa.lineTo(q1[0],q1[1]);pa.closePath();n++}
    if(n){ctx.fillStyle='rgba(207,242,255,.92)';ctx.fill(pa);ctx.strokeStyle='rgba(70,120,200,.75)';ctx.lineWidth=.6;ctx.stroke(pa)}}
  // the gem on the forehead
  const gn=ellN(HRD,null,GEMD),fv=F(HR(gn));if(fv>.05){const c=T(ellAt([0,0,0],mul(HRD,1.1),null,GEMD)),q=P(c),up=P(T(add(ellAt([0,0,0],mul(HRD,1.1),null,GEMD),[0,0,2.8]))),ux=up[0]-q[0],uy=up[1]-q[1],ul=Math.hypot(ux,uy)||1,
    vx=uy/ul,vy=-ux/ul,hh=2.9,hw=2.3*Math.min(1,fv*1.6+.2),X2=A.gemX,pr=[[q[0]+ux/ul*hh,q[1]+uy/ul*hh],[q[0]+vx*hw,q[1]+vy*hw],[q[0]-ux/ul*hh,q[1]-uy/ul*hh],[q[0]-vx*hw,q[1]-vy*hw]];
    if(X2>.02&&!LOWFX&&!gh)shine(K.gemG,q[0],q[1],10+4*Math.sin((G.t||0)*TAU*1.6),(.5+.3*Math.sin((G.t||0)*TAU*1.6))*X2);
    const gc=X2>.5?K.gem:cmix(K.gem,'#cfefff',.55*(1-X2));ctx.lineJoin='round';poly(pr);ctx.fillStyle=gc;ctx.fill();ctx.fillStyle=cmix(gc,'#ffffff',.35);ctx.beginPath();ctx.moveTo(pr[0][0],pr[0][1]);ctx.lineTo(pr[3][0],pr[3][1]);ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.fill();
    poly(pr);ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();ctx.fillStyle=K.gemL;ball([q[0]-hw*.3,q[1]-hh*.3],.6);ctx.fill();
    // the crack (second phase, or when the crown is struck), the white flash
    if(A.gemCrack>.02){ctx.save();ctx.globalAlpha*=A.gemCrack;ctx.strokeStyle='#ffffff';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(pr[0][0],pr[0][1]);ctx.lineTo(q[0]+vx*.8,q[1]+vy*.8-.6);ctx.lineTo(q[0]-vx*.6,q[1]-vy*.6+.6);ctx.lineTo(pr[2][0],pr[2][1]);ctx.stroke();ctx.restore()}
    if(A.gemF>.02){const g=ctx.createRadialGradient(q[0],q[1],.5,q[0],q[1],9);g.addColorStop(0,`rgba(255,255,255,${.9*A.gemF})`);g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ball(q,9);ctx.fill()}}}
// the two locks: from the temples down the cheeks to the shoulders and in front of them (the top follows the head, the rest half of it)
function lockPts(T,XU,sd,A){const lg=A.lag||[0,0],R2=add(HRD,[.6,.6,.6]),top=T(ellAt([0,0,0],R2,null,nrm([.2,sd*.95,.12]))),rest=[[4.6,sd*11.9,90.2],[4.4,sd*11,85.4],[6.6,sd*12.8,79.8],[9.2,sd*11.6,72.6]],w=[.62,.38,.18,0];
  return[top].concat(rest.map((q,j)=>{const b=XU.T(q),hd=T(sub(q,HC)),r=lerp3(b,hd,w[j]),k=(j+1)/4;return add(r,[lg[0]*.5*k,lg[1]*.5*k,0])}))}
function lockDraw(V0,pts,K){const rs=[2.2,2.6,2.5,2.2,1.5];chain(V0,pts,rs,K.hair.b,{lw:2.2,fill:limbGrad(V0.P(pts[0]),V0.P(pts[4]),3.4,K.hair),noRim:1});
  const S=pts.map(q=>V0.P(q));strokeRuns([S.map((q,i)=>[q[0]-rs[i]*.35,q[1]])],rgbA('169,196,240',.45),.8);strokeRuns([S.slice(1).map((q,i)=>[q[0]+rs[i+1]*.3,q[1]+.2])],rgbA('169,196,240',.3),.7)}
// THE FAN OF WINTER (second phase): nine blades of crystal behind the neck, half see-through with a white edge
function fanDraw(V0,XU,A,K,gh){const{P,F}=V0,base=XU.T(FB),nf=XU.Rd(FNR),br=Math.sin(((A.br==null?.5:A.br)-.5)*Math.PI)*4*DEG,T=K.fan,bl=[];
  for(let i=0;i<9;i++){const b=FBL[i],o=A.fan[i];if(o<.02)continue;const sg=Math.sign(b.a),a=b.a+sg*(br+A.fanX),d=XU.Rd(FDIR(a)),L=b.L*o,s2=nrm(cross(d,nf)),w=Math.min(1,o*1.5),
      at=(k,ww)=>P(add(add(base,mul(d,4+L*k)),mul(s2,ww*w)));bl.push({d:V0.D(add(base,mul(d,4+L*.5))),R:[at(0,0),at(.25,-3.6),at(.52,-5.2),at(.78,-3.8),at(1,0)],Lf:[at(0,0),at(.25,3.6),at(.52,5.2),at(.78,3.8),at(1,0)]})}
  if(!bl.length)return;bl.sort((a,b)=>a.d-b.d);
  // a blade of crystal: two flat halves along its ridge, the one toward the light lighter (the halves swap their tones as the fan turns away)
  const f=F(nf),light=f>=0,half=(k)=>{ctx.beginPath();for(const e of bl){const h=k?e.Lf:e.R;ctx.moveTo(h[0][0],h[0][1]);for(let i=1;i<h.length;i++)ctx.lineTo(h[i][0],h[i][1]);ctx.closePath()}};
  const a0=ctx.globalAlpha;if(!LOWFX&&!gh)ctx.globalAlpha=a0*.8;ctx.lineJoin='round';
  half(1);ctx.fillStyle=tone(T,light?.78:.42);ctx.fill();half(0);ctx.fillStyle=tone(T,light?.5:.3);ctx.fill();
  ctx.beginPath();for(const e of bl){const h=e.Lf.concat(e.R.slice(1,4).reverse());ctx.moveTo(h[0][0],h[0][1]);for(let i=1;i<h.length;i++)ctx.lineTo(h[i][0],h[i][1]);ctx.closePath()}ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
  ctx.beginPath();for(const e of bl){ctx.moveTo(e.Lf[0][0],e.Lf[0][1]);ctx.lineTo(e.Lf[4][0],e.Lf[4][1]);for(let i=1;i<4;i++){if(i===1)ctx.moveTo(e.Lf[1][0],e.Lf[1][1]);else ctx.lineTo(e.Lf[i][0],e.Lf[i][1])}}ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=.9;ctx.stroke();
  ctx.globalAlpha=a0}
// THE MIRROR OF THE ENTRANCE (and of the hall): an arch of ice framed in silver filigree, the glass of the night. c: the floor point of its
// middle, its plane facing +x (frame X); W, H: size; o: frost (the frost climbing the frame), rip (rings on the glass), crack (0..3 lines),
// shat (0..1 going to pieces), eyes (her two eyes in the glass), shape (her dark shape), inside (dark shape back in it), p2
function mirrorPts(c,W,H,n){const pts=[],r=W/2,zc=H-r;n=n||12;for(let i=0;i<=4;i++)pts.push([c[0],c[1]-r,c[2]+zc*i/4]);for(let i=1;i<n;i++){const a=Math.PI-i/n*Math.PI;pts.push([c[0],c[1]+Math.cos(a)*r,c[2]+zc+Math.sin(a)*r])}
  for(let i=0;i<=4;i++)pts.push([c[0],c[1]+r,c[2]+zc*(1-i/4)]);return pts}
const MSH=Array.from({length:11},(_,i)=>({u:(i*.37+.08)%1,w:(i*.61+.13)%1,r:i*.9+.3,s:.8+(i%3)*.25}));
// the mirror: an arch of ice in a thick frame of silver with scrolls and a crystal on top, the glass of the night (a streak of light, rings
// when it ripples like water, cracks from its upper left corner); in pieces, shards that fall and turn into frost
function mirrorDraw(V0,X,c,W,H,o,K){const{P}=V0,fw=Math.max(4.5,W*.085),out=mirrorPts(c,W,H).map(q=>P(X.T(q))),inn=mirrorPts([c[0]+.4,c[1],c[2]+fw*.8],W-2*fw,H-fw*1.7).map(q=>P(X.T(q)));
  const sh=o.shat==null?-1:o.shat,T=o.p2?T3('#F2ECFF','#B7A6EA','#5A4AA8'):T3('#F2F6FF','#AAB6D8','#56628E');if(sh>=1)return null;
  const b=bbox(inn);
  if(sh<0){ctx.lineJoin='round';
    // the frame: the arch filled with silver, its inner edge dark, a light edge on its upper left
    poly(out);ctx.fillStyle=grad3(bbox(out),T);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.stroke();
    // the glass of the night
    poly(inn);const g=ctx.createLinearGradient(b[0],b[1],b[2],b[3]);g.addColorStop(0,o.p2?'#5a4ab8':'#4a6cc0');g.addColorStop(.55,o.p2?'#2a2070':'#1e2f74');g.addColorStop(1,'#101a48');ctx.fillStyle=g;ctx.fill();
    ctx.save();poly(inn);ctx.clip();
    if(o.drawIn)o.drawIn(inn);
    {const t=o.gl==null?.3:o.gl,x0=b[0]+(b[2]-b[0])*(t*1.6-.3),hh=b[3]-b[1],gg=ctx.createLinearGradient(x0-8,0,x0+12,0);gg.addColorStop(0,'rgba(255,255,255,0)');gg.addColorStop(.5,'rgba(220,240,255,.3)');gg.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=gg;ctx.beginPath();ctx.moveTo(x0-6,b[3]);ctx.lineTo(x0+hh*.25,b[1]);ctx.lineTo(x0+hh*.25+8,b[1]);ctx.lineTo(x0+2,b[3]);ctx.closePath();ctx.fill()}
    if(o.rip>0){const q=[(b[0]+b[2])/2,b[1]+(b[3]-b[1])*.45],R=(b[2]-b[0])*.6;ctx.strokeStyle=`rgba(190,225,255,${.5*o.rip})`;ctx.lineWidth=1.2;for(let i=0;i<3;i++){const r=((o.rk||0)*R+i*R/3)%R+2;ctx.beginPath();ctx.ellipse(q[0],q[1],r,r*1.3,0,0,TAU);ctx.stroke()}}
    if(o.crack>0){const s0=[b[0]+(b[2]-b[0])*.12,b[1]+(b[3]-b[1])*.1],k=o.crack,W2=b[2]-b[0],H2=b[3]-b[1];ctx.lineCap='round';ctx.lineJoin='round';
      for(const[w,col] of[[2.4,'rgba(20,30,70,.5)'],[1,'rgba(240,250,255,.95)']]){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();
        for(const[dx,dy,j] of[[.55,.5,.1],[.9,.2,-.08],[.25,.85,.06],[.7,.95,-.05]]){ctx.moveTo(s0[0],s0[1]);const e=[s0[0]+W2*dx*k,s0[1]+H2*dy*k];ctx.lineTo(lerp(s0[0],e[0],.33)+W2*j,lerp(s0[1],e[1],.33));ctx.lineTo(lerp(s0[0],e[0],.66)-W2*j*.6,lerp(s0[1],e[1],.66));ctx.lineTo(e[0],e[1])}ctx.stroke()}}
    ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=1.5;poly(inn);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1;ctx.lineCap='round';ctx.beginPath();for(let i=1;i<9;i++){const q=out[i];ctx.lineTo(q[0]+.9,q[1]+.9)}ctx.stroke();
    // the frost that climbs the frame from the floor
    if(o.frost>0){const n=out.length,m=Math.round(n/2*o.frost);ctx.strokeStyle='rgba(240,250,255,.9)';ctx.lineWidth=1.8;ctx.beginPath();for(let i=0;i<=m&&i<n/2;i++){const a2=out[i],e2=out[n-1-i];if(i===0){ctx.moveTo(a2[0],a2[1])}else ctx.lineTo(a2[0],a2[1])}
      for(let i=0;i<=m&&i<n/2;i++){const e2=out[n-1-i];if(i===0)ctx.moveTo(e2[0],e2[1]);else ctx.lineTo(e2[0],e2[1])}ctx.stroke()}
    // the scrolls of silver on the top and the crystal on the apex
    const ap=P(X.T([c[0]+.6,c[1],c[2]+H+1])),s1=P(X.T([c[0]+.6,c[1]-W*.22,c[2]+H-W*.05])),s2=P(X.T([c[0]+.6,c[1]+W*.22,c[2]+H-W*.05])),rr=Math.max(2,W*.06);
    ctx.lineWidth=2.6;ctx.strokeStyle=INK;ctx.beginPath();ctx.arc(s1[0],s1[1],rr,.3,Math.PI*1.7);ctx.moveTo(s2[0]+rr,s2[1]);ctx.arc(s2[0],s2[1],rr,Math.PI*1.3,Math.PI*2.7);ctx.stroke();
    ctx.lineWidth=1.2;ctx.strokeStyle=T.l;ctx.stroke();
    const cr=Math.max(2,W*.05);ctx.beginPath();ctx.moveTo(ap[0],ap[1]-cr*2);ctx.lineTo(ap[0]+cr,ap[1]-cr*.6);ctx.lineTo(ap[0],ap[1]+cr*.5);ctx.lineTo(ap[0]-cr,ap[1]-cr*.6);ctx.closePath();ctx.fillStyle=o.p2?'#C9B0FF':'#9FF6FF';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
    if(!LOWFX)shine(o.p2?'200,170,255':'150,235,255',ap[0],ap[1]-cr*.6,cr*3,.4)}
  else{// in pieces: shards of glass and of the frame fall and turn into frost on the floor
    const W2=b[2]-b[0],H2=b[3]-b[1],k=sh;
    for(const m of MSH){const x0=b[0]+W2*m.w,y0=b[1]+H2*m.u,fall=k*k*(H2*.55+20*m.u),x=x0+(m.w-.5)*k*W2*.6,y=Math.min(y0+fall,b[3]+4),al=1-sstep(.55,1,k);ctx.save();ctx.globalAlpha*=al;ctx.translate(x,y);ctx.rotate(k*(2+m.r));
      const z=m.s*Math.max(3,W*.08);ctx.fillStyle=m.u>.5?'#9fc6ee':'#dff2ff';ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-z);ctx.lineTo(z*.7,z*.5);ctx.lineTo(-z*.6,z*.6);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
    // the frost where they land
    ctx.fillStyle=`rgba(235,248,255,${.6*sstep(.4,1,k)*(1-sstep(.9,1,k)*.5)})`;ctx.beginPath();ctx.ellipse((b[0]+b[2])/2,b[3]+2,W2*.6,W2*.18,0,0,TAU);ctx.fill()}
  return inn}

// ------------------------------------------------------------------ the model
function icequeen2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};anim=MV.includes(anim)?anim:'idle';p=cl(p,0,1);
  if(o.ghost&&!o._in){const oo=Object.assign({},o,{_in:1});const V0=V(face);fadeDraw(()=>icequeen2(x,y,face,anim,p,sc,oo),[x,y-62*sc],100*sc,.6);return}
  const gh=!!o.ghost,A=qPose(anim,p,o),V0=V(face),{P,D,F}=V0,fx=fxOn(o)&&!gh;if(gh){A.lit=A.lit.map(()=>0);A.glint=-1}
  const lift=o.z!=null?o.z/sc:0;A.B[2]+=lift;
  const X=frame(A,0),Wf=frame({lean:A.wl,roll:A.wr,yaw:A.wy},58),XU={T:q=>{const w=Wf.T(q);return X.T([w[0],w[1],w[2]-A.sink])},Rd:v=>X.Rd(Wf.Rd(v))};
  const K=pal(A.p2?1:0,gh),KV=pal(A.k2v,gh),KS=pal(A.k2s,gh),KE=pal(A.k2e,gh),KI=pal(A.k2i,gh),KC=pal(A.k2c,gh),J={gh};
  const Ko=Object.assign({},K,{vel:KV.vel,emb:KV.emb,silk:KS.silk,sice:KS.sice,ice:KI.ice,iris:KE.iris,eglow:KE.eglow,cice:KC.cice,clit:KC.clit,gem:KC.gem,gemL:KC.gemL,gemG:KC.gemG,lips:KE.lips,hstr:KS.hstr});
  // the shadow (none for a reflection; it comes and goes with her when she steps out of a mirror or melts into snow)
  const shK=A.gone?0:A.cut>=0?1-sstep(0,60,A.cut):A.wipe>=0?sstep(.45,1,A.wipe):1;
  if(!gh&&shK>0)floor(V0,x,y,sc,[A.B[0],A.B[1],0],40*(A.sink>0?1+.15*A.sink/10:1),15,.4*shK,lift);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  // the cuts of the moves (only her body, never the props or the effects): the wipe out of the mirror (top down), the melt into snow (hem up)
  let clipY=null;
  if(A.wipe>=0){const top=P(X.T([0,0,146]))[1]-6,bot=P(X.T([40,0,0]))[1]+14;clipY=lerp(top,bot,A.wipe)}
  if(A.cut>=0)clipY=P(X.T([0,0,A.cut]))[1]+lerp(14,-4,A.cut/130);
  const L=parts(),dC=0,LB=parts();
  // ---------------- the mirror of the entrance (behind her): as tall as she is, the glass of the night
  if(A.mirH){const m=A.mirH;L.add(-2000,()=>{const c=[-16,0,0];mirrorDraw(V0,X,c,72,140,{frost:m.frost,rip:m.rip,rk:m.k*4,crack:m.crack,shat:m.shat,gl:m.k*3%1,p2:false,
      drawIn:inn=>{const k=m.shape*(m.k<.58?1:0);if(k>.01){ctx.save();ctx.globalAlpha*=.7*k;ctx.fillStyle='#121A40';ctx.strokeStyle='#121A40';ctx.lineJoin='round';ctx.lineCap='round';
        // her dark shape in the glass (the part of her still in it while she steps out)
        if(clipY!=null){ctx.beginPath();ctx.rect(-400,clipY,800,600);ctx.clip()}
        const S=GM.V.map(q=>P(X.T(q))),H=chull(S);poly(H);ctx.fill();const hc=P(XU.T(HC));ctx.beginPath();ctx.ellipse(hc[0],hc[1],13,14.5,0,0,TAU);ctx.fill();
        const c1=P(XU.T([0,0,58])),c2=P(XU.T([0,0,80]));ctx.lineWidth=26;seg(c1,c2);ctx.stroke();
        for(let i=0;i<7;i++){const s=CS[i],a=P(XU.T(add(HC,s.b))),b=P(XU.T(add(HC,add(s.b,mul(s.d,s.L)))));ctx.lineWidth=4.5;seg(a,b);ctx.stroke()}
        const s0=P(X.T(SF0)),s1=P(X.T(add(SF0,mul(SD0,112))));ctx.lineWidth=3.5;seg(s0,s1);ctx.stroke();ctx.restore()}
        if(m.eyes>0&&m.k<.42){const hc=P(XU.T([12,0,95]));for(const s of[-1,1]){const q=[hc[0]-s*4.2,hc[1]+.4];if(!LOWFX)shine('140,235,255',q[0],q[1],7,.6*m.eyes);ctx.fillStyle=`rgba(159,246,255,${m.eyes})`;ball(q,1.3);ctx.fill()}}}},Ko)})}
  if(!A.gone){
  // ---------------- the fan behind her
  const fanOn=A.fan&&A.fan.some(v=>v>.02),fanBehind=F(XU.Rd(FNR))>=0;
  if(fanOn&&fanBehind)LB.add(-1000,()=>fanDraw(V0,XU,A,Ko,gh));
  // ---------------- the gown, its points, the seracs; the bodice; the shoulders
  LB.add(dC-3,()=>{gownDraw(V0,X,A,gh,J);hemDraw(V0,X,A,gh,J)});
  LB.add(dC-2,()=>corsetDraw(V0,XU,A,Ko,J));
  for(const sd of[-1,1]){const fs=F(XU.Rd(nrm([0,sd,.9])));LB.add(fs>0?dC+1.2:dC-2.6,()=>spaulder(V0,XU,sd,A,Ko))}
  LB.add(dC-1.5,()=>{const a=XU.T([0,0,78.5]),b=XU.T([.8,0,86.5]);caps(V0,a,3.5,b,3.4,Ko.skin.b,{lw:2.3,fill:limbGrad(P(a),P(b),3.5,Ko.skin),noRim:1});shade2(P(a),P(b),3.45,'rgba(60,70,140,.22)',.14)});
  // ---------------- the arms: each piece in front of or behind the body by the face of the body it lies on
  const scep=A.hold!=='none',sAt=u=>add(A.sF,mul(A.sD,u));
  for(const sd of[-1,1]){const hand=sd>0?(scep?sAt(A.kg*SL):[12,32,66]):(A.hold==='RL'?sAt(A.kgL*SL):A.hL),a=armIK(XU,X,sd,hand,A),g=sleeveGeo(a,X,A,sd);
    const fsh=F(XU.Rd([0,sd,0])),dU=fsh>-.2?dC+1:dC-4.6;LB.add(dU,()=>upperArm(V0,a,Ko));
    // the sleeve: by the face of the body under its drape
    const bx=X.T([0,0,0]),mid=lerp3(a.El,g.tip,.5),rel=sub(mid,bx),nr=nrm([rel[0]/GA,rel[1],0]),fs=F(nr)+(mid[2]-bx[2]>64?.0:0);
    LB.add(fs>-.05?dC+1.5:dC-4.5,()=>sleeveDraw(V0,a,g,sd>0?Ko:Ko,A,sd));
    // the hand: the right one holds the scepter (drawn with it); the left one by where it is (on the body, by the head)
    if(sd<0){const W=a.W,hRel=sub(W,X.T([0,0,W[2]-bx[2]]));let dH;
      if(A.hold==='RL'){dH=null}
      else if(W[2]-bx[2]>86){const hc=XU.T(HC),fh=F(nrm(sub(W,hc)));dH=fh>0?dC+10.5:dC+9.5}
      else{const zr=cl(W[2]-bx[2],56,82),[rx,ry]=crAt(zr),nn=nrm([hRel[0]/(rx*rx),hRel[1]/(ry*ry),0]),out=Math.hypot(hRel[0]/rx,hRel[1]/ry);dH=F(nn)>-.02||out>1.6&&fsh>-.2?dC+2:dC-5}
      const lh=()=>{const fd=A.lfd?X.Rd(A.lfd):nrm(sub(a.W,a.El)),pn=A.lpn?X.Rd(A.lpn):X.Rd([-1,0,0]);
        if(A.lp==='waist'){handDraw(V0,a.W,X.Rd([.1,1,-.4]),X.Rd([-1,0,0]),[.15,.2,.25],.3,Ko,A.tap)}
        else if(A.lp==='mirror'&&A.hm){handDraw(V0,a.W,fd,pn,[.8,.85,.9],.8,Ko,0);handMirror(V0,X,a.W,A,Ko)}
        else handDraw(V0,a.W,fd,pn,A.lcurl,A.lth,Ko,0)};
      if(dH!=null)LB.add(dH,lh);else J.lh=lh}}
  // ---------------- the scepter (and the hands on it): in front or behind by its place at rest (on her right), in front when she holds
  // it out in front of her, behind the head when it is raised over it
  if(scep){const mid=sAt(56),hc=XU.T(HC),cr=X.T(sAt(106)),bx=X.T([0,0,0]);let dS;
    if(A.sFront)dS=dC+3.5;
    else if(cr[2]-bx[2]>100&&Math.hypot(cr[0]-hc[0],cr[1]-hc[1])<20){dS=F(nrm(sub(cr,hc)))>0?dC+10.6:dC+9.4}
    else{const rel=sub(X.T(sAt(56)),bx),fsc=F(nrm([rel[0]/GA,rel[1],0]));dS=fsc>-.05?dC+3.5:dC-6}
    LB.add(dS,()=>{const at=scepterDraw(V0,A,X,Ko,J);
      const aR=armIK(XU,X,1,sAt(A.kg*SL),A),Wr=aR.W,sD=X.Rd(A.sD);handDraw(V0,add(Wr,mul(sD,-1.6)),sD,X.Rd([-.6,-.3,0]),[.95,.95,.95],.9,Ko,0);
      if(J.lh)J.lh()})}
  // ---------------- the locks
  const hyT=A.hy+(anim==='gaze'?0:cheat(face,.22)),HR=v=>XU.Rd(rotZ(rotX(rotY(v,A.hp),A.hr),hyT)),Hc=XU.T([HC[0],HC[1],HC[2]+.6*A.br]),T=q=>add(Hc,HR(q));
  for(const sd of[-1,1]){const ft=F(HR(nrm([.2,sd*.95,.12]))),fsf=F(XU.Rd(nrm([.6,sd*.6,.5])));LB.add(ft>0?dC+12:fsf>0?dC+5:dC-2.5,()=>lockDraw(V0,lockPts(T,XU,sd,A),Ko))}
  // ---------------- the head
  LB.add(dC+10,()=>headDraw(V0,T,HR,Hc,A,Ko,J,gh));
  // ---------------- the lances growing over her head (the game takes each one as it flies)
  if(A.lances){const ln=A.lances,n=ln.n,dA=(P2a=>P2a?14:16)(n>5)*DEG,pA=(n>5?13:15)*DEG;
    for(let k=0;k<n;k++){if(ln.gone[k]||ln.g[k]<.02)continue;const ph=(k-(n-1)/2)*pA,c=XU.T([4,34*Math.sin(ph),112+34*Math.cos(ph)]),d=X.Rd(nrm([Math.cos((k-(n-1)/2)*dA),Math.sin((k-(n-1)/2)*dA),-.2]));
      LB.add(dC+11+(V0.D(c)-V0.D(XU.T([4,0,112])))*.01,()=>lanceDraw(V0,c,d,26*ln.g[k],{p2:A.p2,fl:ln.f[k],born:1-ln.g[k],gh}))}}
  if(A.small&&!A.small.gone){const cr=X.T(sAt(106.5)),d0=X.Rd(A.sD);for(let k=0;k<3;k++){const g=A.small.g[k];if(g<.02)continue;const d=X.Rd(rotZ(A.sD,(k-1)*14*DEG)),c=add(cr,mul(d,9+3*g));LB.add(dC+3.6,()=>lanceDraw(V0,c,d,26*.75*g,{p2:A.p2,small:1,born:1-g,gh}))}}
  // ---------------- the fan in front of her (seen from behind)
  if(fanOn&&!fanBehind)LB.add(1000,()=>fanDraw(V0,XU,A,Ko,gh));
  // ---------------- the stalactites flying off (the Coronation)
  if(A.cfly>=0){const k=A.cfly;for(let i=0;i<7;i++){const s=CS[i],b0=T(s.b),d=HR(s.d),z=k*k*80+k*20,c=add(add(b0,mul(d,k*14)),[0,0,z]);if(c[2]>160)continue;
    LB.add(dC+12,()=>{const ax=nrm([Math.sin(i*1.7),Math.cos(i*2.3),.4]),rot=v=>{const a=k*TAU*1.4*(i%2?1:-1),cc=Math.cos(a),ss=Math.sin(a);return add(add(mul(v,cc),mul(cross(ax,v),ss)),mul(ax,dot(ax,v)*(1-cc)))};
      const G=spikeG([0,0,0],rot(d),s.L,s.W*.5,4,rot(HR(CFN)),.2,0),Vs=G.V.map(q=>add(c,q));cryst(V0,Vs,G.F,Ko.cice,{lw:1.8,kb:.3});if(!LOWFX&&!gh){const q=P(c);shine(Ko.clit,q[0],q[1],8,.5*(1-k))}})}}
  }
  // ---------------- the crown alone (the defeat), the scepter falling, the mound of snow
  if(A.crownOff){const c=A.crownOff,pos=X.T(c.pos),R=v=>X.Rd(rotZ(rotX(v,c.tilt),c.spin)),Tc=q=>add(pos,R(sub(q,[-2,0,9]))),dd=V0.D(pos);
    L.add(dd+20,()=>{const Ac={lit:[0,0,0,0,0,0,0],glint:-1,clen:A.clen,k2c:A.k2c,cgrow:null},items=[];for(let i=0;i<7;i++){if(c.lost>=0&&i===6)continue;items.push(stalItem(Tc,i,stalGeo(i,Ac,1),Ac,Ko))}
      const back=items.filter(it=>V0.D(it.Vs[it.Vs.length-1])<dd),front=items.filter(it=>V0.D(it.Vs[it.Vs.length-1])>=dd);if(back.length)crystB(V0,back,{lw:1.6});
      circlet(V0,Tc,R,{gemX:c.glow*.6,gemCrack:A.gemCrack,gemF:0,sw:0},Ko,gh,false);if(front.length)crystB(V0,front,{lw:1.6})});
    if(c.lost>=0){const k=c.lost,b=X.T([6+k*20,-4-k*16,2+(1-k)*7]),d=X.Rd(nrm([.3,-.8,.15]));L.add(V0.D(b)+20,()=>{const s2=CS[6],G=spikeG(b,d,s2.L,s2.W*.6,4,[0,0,1],.22,k*3);crystB(V0,[{Vs:G.V,Fs:G.F,T:Ko.cice,kb:0}],{lw:1.6})})}}
  if(A.scFall){const f=A.scFall,k=f.k,F0=add(lerp3([1.7,18.2,0],[-42,30,0],k),[0,0,f.bz]),D0=nrm(lerp3(nrm([.1,.25,1]),[.82,-.57,.075*f.mz/8],k)),A2=Object.assign({},A,{sF:F0,sD:D0,cfl:0,cw:0});
    const mid=X.T(add(F0,mul(D0,56)));L.add(V0.D(mid)+15,()=>scepterDraw(V0,A2,X,Ko,J))}
  if(A.mound>0){L.add(-900,()=>moundDraw(V0,X,A.mound,Ko))}
  // ---------------- the effects of the moves
  if(fx)for(const e of A.fx)fxDraw(V0,X,XU,L,e,A,Ko,J);
  // the body (cut by the move), then the rest, all in one order
  for(const e of LB){e.cut=1;L.push(e)}
  if(clipY!=null){L.sort((a,b)=>a.d-b.d);for(const e of L){ink(2.4);if(e.cut){ctx.save();ctx.beginPath();ctx.rect(-400,-600,800,clipY+600);ctx.clip();e.f();ctx.restore()}else e.f()}
    // sparkles along the cut; the eyes go last
    if(!LOWFX&&!gh&&!A.gone){for(let i=0;i<9;i++){const xx=-26+i*6.5+Math.sin(i*2.3+p*20)*2,q=[xx,clipY+Math.sin(i*1.7+p*30)*1.5];ctx.fillStyle=`rgba(235,250,255,${.55+.4*Math.sin(i+p*40)})`;ball(q,1.1+.6*Math.sin(i*3+p*25));ctx.fill()}}
    if(A.eyesTo>0&&p<A.eyesTo&&J.Eq){for(const q of J.Eq){if(q[1]<clipY)continue;if(!LOWFX)shine('140,235,255',q[0],q[1],8,.6);ctx.fillStyle='#9FF6FF';ball(q,1.3);ctx.fill()}}}
  else run(L);
  ctx.restore()}
// a lance of crystal: four faces, a white heart, a blue glow; born from a sparkle; fl: its white flash
function lanceDraw(V0,c,d,Lg,o){if(Lg<.8)return;const K=pal(o.p2?1:0,o.gh),u=frm(d,[0,0,1])[0],G=spikeG(add(c,mul(d,-Lg*.5)),d,Lg,(o.small?1.8:2.4),4,u,.08,.6);
  if(!LOWFX&&!o.gh){const q=V0.P(c);shine(o.p2?'200,170,255':'150,235,255',q[0],q[1],Lg*.5,.22+.35*(o.fl||0))}
  cryst(V0,G.V,G.F,o.gh?pal(0,1).cice:K.cice,{lw:1.6,kb:.18+.4*(o.fl||0),wt:.6*(o.fl||0)});
  const a=V0.P(add(c,mul(d,-Lg*.35))),b=V0.P(add(c,mul(d,Lg*.4)));ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=.9;ctx.lineCap='round';seg(a,b);ctx.stroke();
  if(o.born>.05&&!LOWFX){const q=V0.P(add(c,mul(d,Lg*.5)));shine('255,255,255',q[0],q[1],5+6*o.born,.6*o.born)}}
// the little oval mirror of the taunt in her left hand
function handMirror(V0,X,W,A,K){const m=A.hm,k=m.k*(1-m.melt);if(k<.03)return;const{P}=V0,c=add(W,X.Rd([.5,1.2,7.5])),q=P(c),rx=4.5*k,ry=6*k;
  ctx.save();ctx.fillStyle=K.circ.b;ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(q[0],q[1],rx+1.3,ry+1.3,0,0,TAU);ctx.fill();ctx.stroke();
  const g=ctx.createLinearGradient(q[0]-rx,q[1]-ry,q[0]+rx,q[1]+ry);g.addColorStop(0,'#e8f6ff');g.addColorStop(.5,'#9fc6ee');g.addColorStop(1,'#5a76b8');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU);ctx.fill();
  if(m.glint>0){ctx.fillStyle=`rgba(255,255,255,${.9*m.glint})`;ctx.beginPath();ctx.moveTo(q[0]-rx*.5,q[1]+ry*.4);ctx.lineTo(q[0]+rx*.4,q[1]-ry*.6);ctx.lineTo(q[0]+rx*.65,q[1]-ry*.35);ctx.lineTo(q[0]-rx*.2,q[1]+ry*.6);ctx.closePath();ctx.fill()}
  ctx.strokeStyle=K.circ.l;ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(q[0],q[1],rx+.6,ry+.6,0,-2.4,-.8);ctx.stroke();ctx.restore();
  if(m.melt>0&&!LOWFX)for(let i=0;i<5;i++){const u=(m.melt*1.4+i*.2)%1;ctx.fillStyle=`rgba(235,248,255,${.8*(1-u)})`;ball([q[0]+Math.sin(i*2.1)*4,q[1]-ry+u*14],1.2);ctx.fill()}}
// the mound of snow where she was (the crown and the scepter lie on it)
function moundDraw(V0,X,k,K){const{P}=V0,c=X.T([2,0,0]),r=22*k,h=8*k;if(r<1)return;const pts=[];for(let i=0;i<18;i++){const a=i/18*TAU;pts.push(P(add(c,[Math.cos(a)*r,Math.sin(a)*r*1.05,0])))}
  for(let i=0;i<9;i++){const a=Math.PI+i/8*Math.PI;pts.push(P(add(c,[Math.cos(a)*r*.7,Math.sin(a)*r*.75,h*.8])))}pts.push(P(add(c,[0,0,h])));
  const H=chull(pts);svol(H,T3('#ffffff','#dcecff','#9fb6e6'),{lw:2.2,rim:.3,lil:.35});
  ctx.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<5;i++){const q=P(add(c,[Math.cos(i*1.9)*r*.5,Math.sin(i*1.9)*r*.5,h*.9]));ball(q,.8);ctx.fill()}}
// the effects of the moves (only when the game does not draw its own and the phone is fast)
function fxDraw(V0,X,XU,L,e,A,K,J){const{P,D}=V0,t=e.t;
  if(e.k==='breath'){const m0=XU.T([14,0,92]);L.add(D(m0)+30,()=>{for(let i=0;i<3;i++){const u=cl(t*1.3-i*.15,0,1);if(u<=0||u>=1)continue;const q=P(add(m0,[3+u*4,(i-1)*1.6*u,u*6]));ctx.fillStyle=rgbA(K.mist,.5*(1-u)*Math.sin(Math.PI*Math.min(1,u*3)));ball(q,1.2+u*2.6);ctx.fill()}})}
  else if(e.k==='mist'){L.add(-850,()=>{for(let i=0;i<3;i++){const u=((t*1+i/3)%1),a=i*2.1+.6,r=34+u*16,q=P(X.T([Math.cos(a)*r,Math.sin(a)*r,1+u*2]));const rr=5+u*6;ctx.save();glow(K.mist,q[0],q[1],rr,.3*Math.sin(Math.PI*u)*ctx.globalAlpha,rr*.42);ctx.restore()}})}
  else if(e.k==='puff'){const at=X.T(e.at||SF0);L.add(D(at)+30,()=>{for(let i=0;i<6;i++){const a=i/6*TAU,d=(e.big?8:5)*(.4+t),q=P(add(at,[Math.cos(a)*d,Math.sin(a)*d,t*4+(i%2)*1.5]));ctx.fillStyle=rgbA(K.mist,.55*(1-t));ball(q,1.6+t*3);ctx.fill()}})}
  else if(e.k==='fcrack'){const at=X.T(e.at);L.add(-880,()=>{const k=sstep(0,.08,t),al=1-sstep(.8,1,t);ctx.save();ctx.globalAlpha*=al;ctx.lineCap='round';
    for(const[w,col] of[[2.4,'rgba(30,60,120,.45)'],[1,'rgba(235,250,255,.95)']]){ctx.strokeStyle=col;ctx.lineWidth=w;for(let i=0;i<6;i++){const a=i/6*TAU+.3;ctx.beginPath();for(let j=0;j<=3;j++){const r=2+j*4*k,q=P(add(at,[Math.cos(a+Math.sin(j*2.1+i)*.3)*r,Math.sin(a+Math.sin(j*2.1+i)*.3)*r,0]));ctx.lineTo(q[0],q[1])}ctx.stroke()}}ctx.restore()})}
  else if(e.k==='chips'){const at=X.T(e.at);L.add(D(at)+30,()=>{for(let i=0;i<5;i++){const a=i*1.3+.4,q=P(add(at,[Math.cos(a)*14*t,Math.sin(a)*14*t,20*t-30*t*t+2]));ctx.fillStyle='#e8f6ff';ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(q[0],q[1]-2);ctx.lineTo(q[0]+1.6,q[1]+1.2);ctx.lineTo(q[0]-1.5,q[1]+1);ctx.closePath();ctx.fill();ctx.stroke()}})}
  else if(e.k==='crack'){if(!J)return}
  else if(e.k==='shards'){const c0=XU.T([2,-6,106]);L.add(D(c0)+40,()=>{for(let i=0;i<4;i++){const u=(t*2.2+i*.27)%1,q=P(add(c0,[Math.sin(i*2.7)*5,Math.cos(i*1.9)*6-3,-u*34]));ctx.fillStyle=`rgba(232,250,255,${1-u})`;ctx.strokeStyle=`rgba(27,22,18,${.8*(1-u)})`;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(q[0],q[1]-1.8);ctx.lineTo(q[0]+1.2,q[1]+1);ctx.lineTo(q[0]-1.2,q[1]+1);ctx.closePath();ctx.fill();ctx.stroke()}})}
  else if(e.k==='melt'){L.add(1200,()=>{const n=LOWFX?6:16;for(let i=0;i<n;i++){const u=(t*1.6+i/n)%1,a=i*2.4+t*9,r=10+u*14,z=t*130*.8+u*30-10;if(z<0)continue;const q=P(X.T([Math.cos(a)*r,Math.sin(a)*r,z]));
    ctx.fillStyle=`rgba(240,250,255,${.85*Math.sin(Math.PI*u)*(1-sstep(.85,1,t))})`;ball(q,1+((i%3)*.5));ctx.fill()}})}
  else if(e.k==='vortex'){L.add(1200,()=>{const n=LOWFX?8:26;for(let i=0;i<n;i++){const u=(t*1.3+i/n)%1,a=i*.9+t*14+u*6,r=6+u*26*(1-.4*t),z=10+u*120*t+i%5*6;const q=P(X.T([Math.cos(a)*r,Math.sin(a)*r,z]));
    ctx.fillStyle=i%4===0?`rgba(170,235,255,${Math.sin(Math.PI*u)*(1-t)})`:`rgba(255,255,255,${.9*Math.sin(Math.PI*u)*(1-t*.8)})`;ball(q,.8+(i%3)*.6);ctx.fill()}})}
  else if(e.k==='fall'){L.add(1200,()=>{const n=LOWFX?4:10;for(let i=0;i<n;i++){const u=(t*2+i/n)%1,q=P(X.T([Math.sin(i*2.3)*24,Math.cos(i*1.7)*20,60*(1-u)]));ctx.fillStyle=`rgba(255,255,255,${.8*(1-t)*Math.sin(Math.PI*u)})`;ball(q,1);ctx.fill()}})}
  else if(e.k==='ring'){L.add(-800,()=>{const r=14+t*60,pts=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push(P(X.T([Math.cos(a)*r,Math.sin(a)*r,0])))}ctx.strokeStyle=rgbA('220,240,255',.6*(1-t));ctx.lineWidth=3*(1-t)+1;poly(pts);ctx.stroke()})}
  else if(e.k==='snow'){L.add(1100,()=>{const n=LOWFX?5:18,rg=e.ring||0;for(let i=0;i<n;i++){const u=(t*3+i/n)%1,a=i/n*TAU+t*TAU*3,r=lerp(30+12*Math.sin(i*1.3),26,rg),z=lerp(10+((i*37)%60),6+i%3*3,rg),q=P(X.T([Math.cos(a)*r,Math.sin(a)*r,z]));
    ctx.fillStyle=`rgba(255,255,255,${.8*Math.sin(Math.PI*u)})`;ball(q,1+(i%3)*.4);ctx.fill()}})}}
// the snowflake of the waltz and of the game: six arms with branches, white with a blue heart
function flake(q,r,a,K,al){ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(a);ctx.globalAlpha*=al==null?1:al;ctx.lineCap='round';
  for(const[w,col] of[[2.6,INK],[1.3,'#ffffff']]){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();for(let i=0;i<6;i++){const b=i/6*TAU,c=Math.cos(b),s=Math.sin(b)*.8;ctx.moveTo(0,0);ctx.lineTo(c*r,s*r);
    const m=[c*r*.55,s*r*.55];for(const sd of[-1,1]){const b2=b+sd*.7;ctx.moveTo(m[0],m[1]);ctx.lineTo(m[0]+Math.cos(b2)*r*.32,m[1]+Math.sin(b2)*r*.32*.8)}}ctx.stroke()}
  ctx.fillStyle=K?K:'#8fe8ff';ball([0,0],r*.22);ctx.fill();ctx.restore()}

// ------------------------------------------------------------------ for the game: the pieces of her attacks, with the same look
// N3.icequeen2Lance(x, y, z, a, sc, o): the lance of crystal in flight (a: its way on the screen; o.p2 violet, o.small the little ones of
// the mirror, o.ghost pale)
N3.icequeen2Lance=function(x,y,z,a,sc,o){o=o||{};sc=sc||1;const V0=V(Math.PI/2);ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);
  const d=nrm([Math.sin(a||0)/.55*.55,-Math.cos(a||0)*0-Math.cos(a||0)*1,0]),dd=[Math.sin(a||0)*1,-Math.cos(a||0),0];
  const dw=nrm([Math.sin(a||0),-Math.cos(a||0)*1,0]);
  // the screen direction (cos a, sin a) as a direction of the floor seen from above (y on the screen is x·.55 in front)
  const sx=Math.cos(a||0),sy=Math.sin(a||0),w=nrm([sy/.55,-sx,0]);lanceDraw(V0,[0,0,0],w,26*(o.small?.75:1),{p2:o.p2,small:o.small,gh:o.ghost});ctx.restore()};
// N3.icequeen2Pillar(x, y, z, k, sc, o): the stalactite of the Coronation as a pillar (z: its height while it falls, turning with o.spin;
// k: its life on the floor: 0 it plants itself, to .85 upright with a slow glint, .85-1 it melts into frost)
N3.icequeen2Pillar=function(x,y,z,k,sc,o){o=o||{};sc=sc||1;const V0=V(Math.PI/2),K=pal(o.p2?1:0,0);ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);z=z||0;k=k||0;
  const melt=sstep(.85,1,k),h=34*(1-.75*melt),sd=o.seed||0;
  if(z<=.01){// on the floor: cracks and frost round it, then the pillar upright
    const P=V0.P;ctx.strokeStyle=`rgba(235,250,255,${.8*(1-melt)})`;ctx.lineWidth=1;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<5;i++){const a=i/5*TAU+sd;const q0=P([Math.cos(a)*9,Math.sin(a)*9,0]),q1=P([Math.cos(a+.2)*(15+4*Math.sin(i+sd)),Math.sin(a+.2)*(15+4*Math.sin(i+sd)),0]);ctx.moveTo(q0[0],q0[1]);ctx.lineTo(q1[0],q1[1])}ctx.stroke();
    ctx.fillStyle=`rgba(220,240,255,${.35*(1-melt)+.25*melt})`;ctx.beginPath();ctx.ellipse(0,0,13,6,0,0,TAU);ctx.fill()}
  const ax=o.spin||0,d=z>.01?nrm([Math.sin(ax)*.6,Math.cos(ax*1.3)*.4,-1]):[0,0,1],b=z>.01?[0,0,z+17]:[0,0,0];
  const G=z>.01?spikeG(add(b,mul(d,-17)),d,34,5,4,[1,0,0],.2,ax):spikeG([0,0,-1],[0,0,1],h+1,10*(1-.3*melt),5,[1,0,0],.18,sd);
  const gl=z>.01?0:.15*Math.max(0,Math.sin(((k*7+sd)%1)*Math.PI));cryst(V0,G.V,G.F,K.cice,{lw:2,kb:.06+gl,wt:melt*.4});
  if(z<=.01&&!LOWFX){const q=V0.P([0,0,h*.75]);shine(o.p2?'210,180,255':'170,235,255',q[0],q[1],10,.25+gl)}
  ctx.restore()};
// N3.icequeen2Spike(x, y, h, k, sc, o): a point of ice out of the floor (the Royal Flake h 20, the trail of the Waltz h 16); k: .0-.15 it
// rises, to .8 it stays, .8-1 it crumbles; o.a the way of its line (it leans to the side), o.seed, o.p2
N3.icequeen2Spike=function(x,y,h,k,sc,o){o=o||{};sc=sc||1;h=h||20;k=k||0;if(k<=0||k>=1)return;const V0=V(Math.PI/2),K=pal(o.p2?1:0,0);ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  const up=k<.15?ez(k/.15):1,cr=sstep(.8,1,k),hh=h*up*(1-.6*cr),sd=o.seed||0,a=o.a==null?0:o.a,lean=[Math.cos(a+Math.PI/2)*.18+.08*Math.sin(sd),Math.sin(a+Math.PI/2)*.18,1];
  if(cr>0)ctx.globalAlpha*=1-cr*.6;const G=spikeG([0,0,-1],nrm(lean),hh+1,4.4,4,[1,0,0],.15,sd);cryst(V0,G.V,G.F,K.ice,{lw:1.8,kb:.08});
  if(cr>0){ctx.fillStyle='#e8f6ff';ctx.strokeStyle=INK;ctx.lineWidth=.9;for(let i=0;i<4;i++){const q=V0.P([Math.cos(i*1.6+sd)*7*cr,Math.sin(i*1.6+sd)*5*cr,hh*.4*(1-cr)+1.5]);ctx.beginPath();ctx.moveTo(q[0],q[1]-1.8);ctx.lineTo(q[0]+1.4,q[1]+1);ctx.lineTo(q[0]-1.4,q[1]+1);ctx.closePath();ctx.fill();ctx.stroke()}}
  ctx.restore()};
// N3.icequeen2Mirror(x, y, k, sc, o): the arched mirror of the Hall (always facing the camera): k .0-.25 it rises out of the floor; o.ripple,
// o.crack (0..3), o.shatter (0..1), o.eyes (her eyes in the glass, looking toward the angle o.look), o.inside (her dark shape), o.p2
N3.icequeen2Mirror=function(x,y,k,sc,o){o=o||{};sc=sc||1;k=k==null?1:k;const V0=V(0),up=sstep(0,.25,k),X={T:q=>[q[0],q[1],q[2]-46*(1-up)],Rd:v=>v},K=pal(o.p2?1:0,0);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);if(up<1){ctx.beginPath();ctx.rect(-40,-80,80,80);ctx.clip()}
  mirrorDraw(V0,X,[0,0,0],30,46,{frost:1,rip:o.ripple||0,rk:(G.t||0)*.6,crack:(o.crack||0)/3,shat:o.shatter>0?o.shatter:-1,p2:o.p2,gl:((G.t||0)*.25)%1,
    drawIn:inn=>{const b=bbox(inn),cx=(b[0]+b[2])/2,cy=b[1]+(b[3]-b[1])*.42;if(o.inside>0){ctx.save();ctx.globalAlpha*=.7*o.inside;ctx.fillStyle='#121A40';ctx.beginPath();ctx.moveTo(cx-12,b[3]);ctx.lineTo(cx-4,cy);ctx.lineTo(cx+4,cy);ctx.lineTo(cx+12,b[3]);ctx.fill();ctx.beginPath();ctx.ellipse(cx,cy-4,5,5.5,0,0,TAU);ctx.fill();ctx.restore()}
      if(o.eyes>0){const lk=o.look||0,dx=Math.cos(lk)*1.6,dy=Math.sin(lk)*1;for(const s of[-1,1]){const q=[cx+s*3.4+dx,cy-4+dy];if(!LOWFX)shine(o.p2?'200,160,255':'140,235,255',q[0],q[1],6,.6*o.eyes);ctx.fillStyle=o.p2?`rgba(240,230,255,${o.eyes})`:`rgba(159,246,255,${o.eyes})`;ctx.beginPath();ctx.ellipse(q[0],q[1],1.6,1.1,0,0,TAU);ctx.fill()}}}},K);
  ctx.restore()};
// N3.icequeen2Ice(x, y, k, sc, o): the block of ice round the frozen hero (30 wide, 34 tall): k .0-.15 the frost climbs, to .8 it holds
// with glints, .8-1 it cracks and breaks
N3.icequeen2Ice=function(x,y,k,sc,o){o=o||{};sc=sc||1;k=k||0;if(k<=0||k>=1)return;const V0=V(Math.PI/2),K=pal(o.p2?1:0,0);ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  const up=k<.15?ez(k/.15):1,br=sstep(.8,1,k),h=34*up;
  if(br<.5){const Vs=[],w=15,dd=11;for(const z of[0,h])for(const[a,b] of[[-1,-1],[1,-1],[1,1],[-1,1]])Vs.push([a*dd+(z?.8*b:0),b*w+(z?-.8*a:0),z]);
    ctx.save();ctx.globalAlpha*=(.78)*(1-br*2);cryst(V0,Vs,[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]],T3('#ffffff','#bfe8ff','#5f9fe0'),{lw:2.2,kb:.1});ctx.restore();
    if(!LOWFX){const q=V0.P([0,0,h*.6]);shine('170,235,255',q[0],q[1],20,.25)}
    ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1;ctx.lineCap='round';const g=Math.sin(k*TAU*3);const q0=V0.P([10,-8,h*.7]);seg([q0[0],q0[1]],[q0[0]+3,q0[1]-4]);ctx.stroke();if(g>0){const q1=V0.P([10,8,h*.35]);ctx.fillStyle='#fff';ball(q1,1.2*g);ctx.fill()}
    if(br>0){ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=1.2;const q=V0.P([11,0,h*.5]);ctx.beginPath();ctx.moveTo(q[0]-8*br*2,q[1]-10*br*2);ctx.lineTo(q[0],q[1]);ctx.lineTo(q[0]+9*br*2,q[1]+6*br*2);ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0]+2,q[1]-12*br*2);ctx.stroke()}}
  else for(let i=0;i<8;i++){const u=(br-.5)*2,a=i/8*TAU,q=V0.P([Math.cos(a)*(10+u*14),Math.sin(a)*(12+u*16),h*(.2+.1*(i%4))+u*8-u*u*22]);ctx.save();ctx.globalAlpha*=1-u;ctx.translate(q[0],q[1]);ctx.rotate(u*4+i);ctx.fillStyle=i%2?'#ffffff':'#bfe8ff';ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-3.5);ctx.lineTo(2.6,2);ctx.lineTo(-2.4,2.2);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
  ctx.restore()};
// N3.icequeen2Shard(x, y, z, a, sc, o): a small shard of ice flying along a (10 long)
N3.icequeen2Shard=function(x,y,z,a,sc,o){o=o||{};sc=sc||1;ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);if(!LOWFX)shine(o.p2?'200,170,255':'170,235,255',0,0,9,.35);ctx.rotate(a||0);
  const K=pal(o.p2?1:0,0).ice;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(0,-2.4);ctx.lineTo(-5,-.6);ctx.lineTo(-4,1.8);ctx.lineTo(1,2.2);ctx.closePath();ctx.fillStyle=K.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
  ctx.fillStyle=K.l;ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(0,-2.4);ctx.lineTo(-1.5,0);ctx.closePath();ctx.fill();ctx.restore()};
// N3.icequeen2Flake(x, y, z, a, sc, o): the snowflake of the Waltz (r 7, six arms, white with a blue heart) turning with a
N3.icequeen2Flake=function(x,y,z,a,sc,o){o=o||{};sc=sc||1;ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);if(!LOWFX)shine(o.p2?'200,170,255':'170,235,255',0,0,12,.4);flake([0,0],7,a||0,o.p2?'#C9B0FF':'#8FE8FF');ctx.restore()};

reg('icequeen2',{n:'Regina dei Ghiacci',g:'boss',p2:true,sc:1,an:MV.slice(),dur:Object.assign({},DUR),
  lab:{idle:'Fermo',walk:'Scivola',hit:'Colpita',lances:'Lance di Cristallo',crown:'Incoronazione',nova:'Fiocco Reale',mirror:'Sala degli Specchi',emerge:'Esce dallo specchio',
    cast:'Tiro dallo specchio',stunned:'Corona incrinata',gaze:"Sguardo d'Inverno (fase 2)",waltz:'Valzer della Tormenta (fase 2)',rage:'Notte Polare (fase 2)',taunt:'Presa in giro',enter:'Entrata: «Specchio, specchio…»',die:"Sconfitta: l'ultimo inchino"}},icequeen2);
// «Prima e dopo»: the Queen of today (kept now: once the game puts this model in place of N3.icequeen, N3.icequeen is the new one)
{const OLD=N3.icequeen,M0=N3.meta.icequeen;if(OLD&&M0)N3.meta.icequeen2.old=(x,y,f,a,pp)=>OLD(x,y,f,M0.an.includes(a)?a:'idle',pp,M0.sc||1,{})}
})();
