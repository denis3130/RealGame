// LA FENICE DELLA FORGIA rifatta: «la Fenice Imperiale» (Denis, 15 ottobre: «rivisita tutti i boss, rendili più creepy e fatti meglio sia
// da fermi che nelle animazioni», «un po' più cupi», «falli possenti, belli, fighi, che diano timore nello sfidarli»; 16 ottobre, dopo il
// Golem: «sì, fai gli altri 12»). Titolo che resta: «Rinasce dalla sua cenere». L'imperatrice di fuoco della Forgia degli Dei: un rapace
// regale cremisi e oro, più alto del Golem (122 in punta al pennacchio, tre volte l'eroe). Ti guarda dall'alto del becco a uncino con due
// occhi d'oro bianco incandescenti in una maschera scura da falco, sotto un cipiglio d'oro a V e un diadema con l'occhio degli dei (la gemma
// menta degli stendardi dell'arena). A riposo è una regina sul trono: ali chiuse come un mantello fino a terra col bordo d'oro, una corona di
// cinque pennacchi di fiamma, dietro uno strascico di cinque piume lunghe stese sul pavimento con gli occhi di fiamma in punta. Nel petto,
// sotto la gorgiera d'oro a smerli, batte il Cuore di Forgia (una brace bianca in una spilla d'oro): prima di ogni colpo batte due volte e
// una perla di luce corre lungo i rachidi delle penne fino al pezzo che colpirà (è il suo avviso, come il cuore del Golem). Brucia mentre
// combatte: le punte delle piume diventano cenere man mano che perde vita (o.ash). A metà vita si chiude in un uovo di cenere che batte tre
// volte mentre il fuoco degli dei (fili menta) sale dal pavimento, e rinasce azzurra (cobalto e oro bianco), più grande, con una corona di
// sole di fiamme azzurre e sette piume nello strascico. Sconfitta torna cenere e dall'uovo esce un pulcino. Resta della Classica: forme
// robuste, contorno scuro spesso, colori pieni, occhi che brillano con la lucina, niente denti, niente sangue, ferite o cuciture.
// Metodo dello spaventapasseri (scheletro 3D proiettato con V(face), gambe a due ossa con ik, ordine di disegno dalla posa di riposo, la
// testa con la sua telecamera che resta ferma nello spazio come quella dei falchi); dipinta come la lanterna (tre toni, bordo caldo,
// bagliori morbidi). Unità del modello a sc 1: x avanti, y di lato, z in su; l'origine è a terra tra i piedi.
// Mosse: idle, walk (vola), hit, fan / fan2 (Ventaglio dell'Impero), dive / redive (Picchiata della Cometa), grounded (Ali a terra), rise,
// wings / wings2 (Ali dell'Impero), sweep (Ruota di Fiamme), rain (Pioggia di Braci), judge (Sguardo del Giudizio), rebirth (Rinascita),
// taunt (Presa in giro), enter (Entrata), die (Sconfitta). Opzioni: o.p2 (seconda fase), o.z (altezza data dal gioco: nella Picchiata
// prende il posto della sua curva; nelle altre mosse si somma al volo che disegna il modello), o.noFx, o.gap / o.gap2 (la prima delle due
// corsie scure del Ventaglio, 0..8, -1 nessuna), o.chain (la Picchiata non atterra), o.anvil (finisce contro un'incudine), o.dir (verso
// della Ruota, ±1), o.ash (cenere sulle punte, 0..0,35), o.veil (strascico velato, 0..1). Con LOWFX niente bagliori, fiammelle, pozza di
// luce, scie, braci, scintille né fili animati; restano il fuoco che corre (l'avviso), la cenere sulle punte e il cuore che batte.
// Le corsie del Ventaglio: la corsia i (0..9) vola nel corpo lungo θi = (i - 4,5)·12° (+6°·s del cervello); le corsie 0-4 sono le cinque
// remiganti più lunghe dell'ala dal lato y < 0 (0 la più esterna), le 5-9 quelle dell'ala y > 0 (9 la più esterna), come b3pt nel gioco.
// Disegni per il gioco con lo stesso aspetto: N3.phoenixFeather (la piuma in volo o piantata), N3.phoenixEmber (la penna che cade nella
// Pioggia), N3.phoenixShard (la scheggia del guscio), N3.phoenixShadow (l'ombra delle ali nell'entrata), N3.phoenixSweep (l'angolo della
// frusta nella Ruota) e N3.phoenixInfo (le cifre del modello: corsie, colpi, battute, battiti del cuore); gli stessi anche col nome
// N3.phoenix2<Nome>. Modello 'phoenix2': nel gioco prende il nome 'phoenix' (src/js/89-fenice-nuova.js).
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,rim,run,cmix,poly,bbox,
  rotX,rotY,rotZ,keys,sstep,hitK,frame,ellAt,ellN,AXES,chain,floor,parts,reg,shine,smooth,chull,ik}=C;

// ------------------------------------------------------------------ helpers (as in golem2.js)
const trem=(p,a,b,hz,dur)=>{const w=Math.min(.03,(b-a)/3);return sstep(a,a+w,p)*(1-sstep(b-w,b,p))*Math.sin((p-a)*TAU*hz*dur)};
const fxOn=o=>!o.noFx&&!LOWFX;
const cheat=(face,k)=>{const dv=Math.atan2(Math.sin(Math.PI/2-face),Math.cos(Math.PI/2-face));return k*Math.sin(dv)*cl((Math.PI-Math.abs(dv))/(Math.PI/2),0,1)};
// a smooth pulse centred on c, w wide; a ramp up a..b and down c..d; a flash that fades in w
const pls=(p,c,w)=>{const d=Math.abs(p-c)/(w/2);return d>=1?0:.5+.5*Math.cos(d*Math.PI)};
const rise=(p,a,b,c,d)=>sstep(a,b,p)*(1-sstep(c,d,p));
const flash=(p,a,w)=>p<a||p>a+w?0:1-(p-a)/w;
const ga=(k,f)=>{if(k<=.004)return;const a0=ctx.globalAlpha;ctx.globalAlpha=a0*Math.min(1,k);f();ctx.globalAlpha=a0};
// many little round marks as one path (one fill)
const dots=(pts,r)=>{ctx.beginPath();for(const q of pts){ctx.moveTo(q[0]+r,q[1]);ctx.arc(q[0],q[1],r,0,TAU)}};
const strokeRuns=(runs,col,w)=>{if(!runs.length)return;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();for(const r of runs){ctx.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)ctx.lineTo(r[i][0],r[i][1])}ctx.stroke()};
// draws f() as one picture faded to k (no outlines showing through), as in golem2.js
const OCS=[];let OCL=0;
function fadeDraw(f,q,r,k){if(k>=.99){f();return}if(k<=.01)return;const T=ctx.getTransform(),S=Math.hypot(T.a,T.b),dx=T.a*q[0]+T.c*q[1]+T.e,dy=T.b*q[0]+T.d*q[1]+T.f,R=Math.ceil(r*S+6),W=2*R;
  const lv=OCL;let OC=OCS[lv];if(!OC)OC=OCS[lv]=document.createElement('canvas');if(OC.width<W||OC.height<W)OC.width=OC.height=W;const oc=OC.getContext('2d');oc.setTransform(1,0,0,1,0,0);oc.clearRect(0,0,W,W);
  oc.setTransform(T.a,T.b,T.c,T.d,T.e-(dx-R),T.f-(dy-R));const saved=ctx;ctx=oc;OCL++;try{f()}finally{ctx=saved;OCL--}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha*=k;ctx.drawImage(OC,0,0,W,W,dx-R,dy-R,W,W);ctx.restore()}
// draws f() once into its own picture (slot n) and returns a function that pastes it with the alpha k: a piece that changes layer is pasted
// whole in the layer behind and faded in the layer in front, without drawing it twice
const SNP=[];
function snap(n,f,q,r){const T=ctx.getTransform(),S=Math.hypot(T.a,T.b),dx=T.a*q[0]+T.c*q[1]+T.e,dy=T.b*q[0]+T.d*q[1]+T.f,R=Math.ceil(r*S+6),W=2*R;
  let OC=SNP[n];if(!OC)OC=SNP[n]=document.createElement('canvas');if(OC.width<W||OC.height<W)OC.width=OC.height=W;const oc=OC.getContext('2d');oc.setTransform(1,0,0,1,0,0);oc.clearRect(0,0,W,W);
  oc.setTransform(T.a,T.b,T.c,T.d,T.e-(dx-R),T.f-(dy-R));const saved=ctx;ctx=oc;OCL++;try{f()}finally{ctx=saved;OCL--}
  return k=>{if(k<=.01)return;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha*=Math.min(1,k);ctx.drawImage(OC,0,0,W,W,dx-R,dy-R,W,W);ctx.restore()}}
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
// three tones from the upper left (light, base, shadow) over a screen box
function grad3(b,T){const w=b[2]-b[0],h=b[3]-b[1],cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,R=Math.max(w,h,2)*.64,g=ctx.createRadialGradient(cx-w*.24,cy-h*.26,R*.06,cx-w*.04,cy+h*.04,R);
  g.addColorStop(0,T.l);g.addColorStop(.34,T.b);g.addColorStop(.9,T.d);return g}
function svol3(V0,pts3,T,o){o=o||{};const pts=o.scr?pts3:hullE(pts3.map(q=>V0.P(q)),.08);if(pts.length<3)return pts;ctx.lineJoin='round';const pa=pts.path=smoothP(pts);ctx.fillStyle=o.fill||grad3(bbox(pts),T);ctx.fill(pa);
  if(!o.noInk){ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2.5;ctx.stroke(pa)}if(o.rim)rimP(pts,o.rim);return pts}
function rimP(pts,al){const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0)/2,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.15,cy+Rr*.15),kx=1-1.9/Math.max(1,(x1-x0)/2),ky=1-1.9/Math.max(1,(y1-y0)/2);
  g.addColorStop(0,C.wa(al));g.addColorStop(1,C.wa(0));ctx.beginPath();for(const q of pts)ctx.lineTo(cx+(q[0]-cx)*kx,cy+(q[1]-cy)*ky);ctx.closePath();ctx.strokeStyle=g;ctx.lineWidth=1.3;ctx.stroke()}
// a limb's shading: across it, from the lit side (upper left) through the base to the dark side
function limbGrad(qa,qb,r,T){let nx=-(qb[1]-qa[1]),ny=qb[0]-qa[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;if(nx+ny>0){nx=-nx;ny=-ny}const mx=(qa[0]+qb[0])/2,my=(qa[1]+qb[1])/2;
  if(l<r*.6){nx=-.7;ny=-.7}const g=ctx.createLinearGradient(mx+nx*r,my+ny*r,mx-nx*r,my-ny*r);g.addColorStop(0,T.l);g.addColorStop(.42,T.b);g.addColorStop(1,T.d);return g}
// the visible part of a cap on an ellipsoid (from golem2.js): leaves the path in ctx, returns {full, rim} or false
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
// a round section on the screen (the circle of radius r round c in the plane of the unit axes u, v)
const TRG={};const trg=N=>TRG[N]||(TRG[N]=Array.from({length:N},(_,i)=>[Math.cos(i/N*TAU),Math.sin(i/N*TAU)]));
function ringS(V0,c,u,v,r,N){const o=V0.P(c),a=V0.P(c[0]+u[0]*r,c[1]+u[1]*r,c[2]+u[2]*r),b=V0.P(c[0]+v[0]*r,c[1]+v[1]*r,c[2]+v[2]*r),ax=a[0]-o[0],ay=a[1]-o[1],bx=b[0]-o[0],by=b[1]-o[1],T=trg(N),out=new Array(N);
  for(let i=0;i<N;i++){const cs=T[i][0],sn=T[i][1];out[i]=[o[0]+ax*cs+bx*sn,o[1]+ay*cs+by*sn]}return out}
function frm(d,h){d=nrm(d);let u=sub(h||[1,0,0],mul(d,dot(h||[1,0,0],d)));if(len(u)<.15)u=sub([0,0,1],mul(d,d[2]));if(len(u)<.15)u=sub([0,1,0],mul(d,d[1]));u=nrm(u);return[u,cross(d,u),d]}
// puffs round a 3D point (k 0..1: spreading and fading)
function dust(V0,c,k,n,r,rgb,al){if(k<0||k>=1)return;for(let i=0;i<n;i++){const a=i/n*TAU+.4,d=r*(.4+k*.9),q=V0.P(add(c,[Math.cos(a)*d,Math.sin(a)*d,k*6+(i%2)*2]));ctx.fillStyle=`rgba(${rgb||'196,184,160'},${(al||.5)*(1-k)})`;ball(q,2.4+k*4.5);ctx.fill()}}
// a ring on the floor (a shock wave): centre c, radius r
function ring0(V0,c,r,rgb,a,w){if(a<=0)return;const pts=[];for(let i=0;i<32;i++){const t=i/32*TAU;pts.push(V0.P(add(c,[Math.cos(t)*r,Math.sin(t)*r,0])))}
  ctx.save();ctx.strokeStyle=`rgba(${rgb},${a})`;ctx.lineWidth=w||3;poly(pts);ctx.stroke();ctx.restore()}

// ------------------------------------------------------------------ colours: three tones per piece (light, base, shadow)
const T3=(l,b,d)=>({l,b,d}),mixT=(a,b,k)=>k<=0?a:k>=1?b:T3(cmix(a.l,b.l,k),cmix(a.b,b.b,k),cmix(a.d,b.d,k));
const mixRgb=(a,b,k)=>{if(k<=0)return a;if(k>=1)return b;const A=a.split(',').map(Number),B=b.split(',').map(Number);return A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')};
// phase 1: crimson and beaten gold; the shadows are wine, the light only on the rims, the eyes, the crown, the tips and the heart
const K1={plum:T3('#ff6a3c','#c42a1c','#5e0f14'),cloak:T3('#d8361e','#8e1a18','#3a080c'),armor:T3('#ffd36a','#ff9a2a','#a4460e'),thread:'#ffe7a0',
  fR:'#a8201a',fM:'#ff5a1f',fT:'#ffc23c',fE:'#fff1c0',fU:'#6a1214',fUd:'#3a0a0e',rach:'#ffe0a0',mant:'#ff8a2a',
  gold:T3('#fff2b0','#ffc83c','#a86e12'),ham:'#c8901e',
  beak:T3('#ffc66a','#cc7420','#64300e'),btip:'#3a1a0a',cere:'#ffc83c',nost:'#3a1a10',throat:'#5a0a10',
  mask:'#2e0a10',maskE:'#6a1420',eye:'#fffaf0',ring:'#ffd27a',eglow:'255,240,200',slit:'#2a0a08',trail:'255,200,120',
  gem:T3('#e0fff4','#7ff0c0','#1e7a5a'),gpup:'#0e3a2a',gglow:'127,240,192',
  tars:T3('#ffd060','#ffb020','#a8640e'),scale:'#c8801a',claw:T3('#6a5448','#3a2a24','#1e1612'),
  trS:'#c42a1c',trM:'#ff5a1f',trT:'#ffc23c',trEye:'#e8341c',trRing:'#ffd84a',trHeart:'#fffaf0',
  h0:'#ffffff',h1:'#fff2c4',h2:'#ffb347',hglow:'255,190,90',
  fire:'255,120,40',hot:'255,225,150',pool:'255,150,60',ember:'#7a1a10',emberL:'#c8401a'};
// phase 2 («il fuoco degli dei»): cobalt and white gold, the shadows night blue
const K2={plum:T3('#8cc4ff','#3a74e8','#1a3684'),cloak:T3('#5a9cff','#2550b8','#0c1a50'),armor:T3('#ffffff','#cfeaff','#6a9ad0'),thread:'#fff4c8',
  fR:'#2448a8',fM:'#3a8ae8',fT:'#9fe0ff',fE:'#f0fbff',fU:'#142a6a',fUd:'#0a1640',rach:'#e8f6ff',mant:'#7fc4ff',
  gold:T3('#ffffff','#ffe8a0','#b8963a'),ham:'#c8a64a',
  beak:T3('#fff0c8','#d8b060','#7a5a22'),btip:'#2a2414',cere:'#ffe8a0',nost:'#2a2010',throat:'#0c1438',
  mask:'#0c1438',maskE:'#24408a',eye:'#f0fbff',ring:'#7fd4ff',eglow:'200,235,255',slit:'#0c1438',trail:'159,224,255',
  gem:T3('#f0fffa','#9ffcd8','#1e8a66'),gpup:'#0e3a2a',gglow:'150,255,215',
  tars:T3('#ffffff','#ffe8a0','#b8963a'),scale:'#c8a64a',claw:T3('#4a5a7a','#1e2a44','#0e1424'),
  trS:'#3a74e8',trM:'#5aa4f0',trT:'#9fe0ff',trEye:'#3a8ae8',trRing:'#fff4c8',trHeart:'#ffffff',
  h0:'#ffffff',h1:'#e8f6ff',h2:'#bfe8ff',hglow:'140,210,255',
  fire:'120,200,255',hot:'220,245,255',pool:'120,190,255',ember:'#1a2a6a',emberL:'#3a6ac8'};
const ASH=T3('#d8d0c6','#a69c92','#6a625a'),EMB='#ff8a3a',EGG=T3('#6a5e58','#3a3230','#1e1816'),GREY=T3('#9a938c','#6e6862','#45403c');
// a palette between the two phases (k2) and toward the grey of the ash (g: the defeat), cached
const PALC={};
function pal(k2,g){k2=Math.round(cl(k2,0,1)*24)/24;g=Math.round(cl(g||0,0,1)*16)/16;const id=k2+'|'+g;if(PALC[id])return PALC[id];const K={};
  for(const k in K1){const a=K1[k],b=K2[k];K[k]=typeof a==='string'?(a[0]==='#'?cmix(a,b,k2):mixRgb(a,b,k2)):mixT(a,b,k2)}
  if(g>0){const gT=t=>T3(cmix(t.l,GREY.l,g),cmix(t.b,GREY.b,g),cmix(t.d,GREY.d,g));for(const k in K){const v=K[k];if(typeof v==='object')K[k]=gT(v);else if(v[0]==='#')K[k]=cmix(v,k==='eye'?'#e8e4de':GREY.b,g);else K[k]=mixRgb(v,'150,144,138',g)}}
  K.blue=k2>.5;return PALC[id]=K}

// ------------------------------------------------------------------ the body at rest (x forward, y to one side, z up; 0,0,0 the floor point)
const TC=[[8,0,50],[2,0,32],[-8,0,60]],TR=[[19,20,22],[15,16,12],[17,21,14]];   // chest, belly, back: one convex volume
const HC=[24,0,89],HRD=[16,12,12.2];                                              // the head, in its own camera
const NK=[[12,0,70],[17,0,79],[21,0,85]],NKR=[12.5,11.5,10.5];                       // the neck, mostly hidden by the gorget
const GC=[12,0,70],GRR=14,GTL=20*Math.PI/180;                                    // the gorget: centre, radius, tilt forward
const SHO=[-4,19,64],HIP=[-2,10,30],TROOT=[-16,0,30],HEART=[26,0,57];
const HM=nrm([(HEART[0]-TC[0][0])/TR[0][0]/TR[0][0],0,(HEART[2]-TC[0][2])/TR[0][2]/TR[0][2]]);   // the heart's normal on the chest
// the folded wing (a mantle down the flank, a long shield): the joints (shoulder, elbow, wrist, hand) and four sections of its coverts
// (front: the edge of beaten gold where the bones run, out: the bulge, back, in: against the body). Mirrored by the side sd
const FJ=[[-3,20,66],[0,28,49],[5,27,30],[-9,21,15]];
const FSEC=[[[2,21,68],[-6,25,71],[-14,15,69],[-5,16,65]],[[6,27.5,52],[-7,32.5,53],[-20,16,55],[-6,21,51]],[[6.5,26.5,31],[-9,31,33],[-24,14,37],[-8,20,31]],[[-9,20,15],[-16,22.5,17],[-23,13,22],[-15,15,15]]];
// the open wing: the bones (humerus, forearm, hand) and the covert band behind them
const BL=[18,24,22],BW=[15,12,8,3.5];
// the feathers: 9 primaries on the hand (46..30, the longest outside), 7 secondaries on the forearm (30..24)
const PRL=[46,44,42,40,38,36,34,32,30],SEL=[30,29,28,27,26,25,24];

// ------------------------------------------------------------------ the moves (every one depends only on p; idle and walk close on themselves)
const MV=['idle','walk','hit','fan','fan2','dive','redive','grounded','rise','wings','wings2','sweep','rain','judge','rebirth','taunt','enter','die'];
const DUR={idle:3,walk:1.3,hit:.6,fan:1.6,fan2:2.3,dive:2.2,redive:1.6,grounded:1.1,rise:.5,wings:1.6,wings2:2.2,sweep:2.4,rain:3,judge:2.6,rebirth:3.4,taunt:1.2,enter:3.4,die:4};
// the double beat of the heart before each move («tum-tum»), in the move's p: the brain plays its thump here
const BEATS={idle:[.08,.20],walk:[],hit:[],fan:[.01,.05],fan2:[.00,.03],dive:[.00,.04],redive:[.02],grounded:[],rise:[],wings:[.00,.04],wings2:[.00,.04,.45],
  sweep:[.00,.04],rain:[.00,.04],judge:[.02,.06],rebirth:[.36,.46,.56],taunt:[],enter:[],die:[]};
// the wing states: u 0 mantle .. 1 open; r raise (+ up), s sweep (+ forward), t twist (the chord turns from back toward up), k extension
// (1 straight .. 0 the wrists bent), sp the fan of the feathers (0 along the bones .. 1 open), sh a tremble, lift the mantle lifting off
const WD={u:0,r:0,s:0,t:0,k:1,sp:1,sh:0,lift:0};
const WS=o=>Object.assign({},WD,o);
const WK=['u','r','s','t','k','sp','sh','lift'];
const wl=(a,b,k)=>{const o={};for(const n of WK)o[n]=lerp(a[n],b[n],k);return o};
// keyframes of wing states: [[p, state], ...], eased between keys
function wkeys(K,p){for(let i=0;i<K.length-1;i++){const a=K[i],b=K[i+1];if(p>=a[0]&&p<=b[0])return wl(a[1],b[1],ez((p-a[0])/Math.max(1e-6,b[0]-a[0])))}return Object.assign({},K[K.length-1][1])}
const MANT=WS({}),SPREAD=WS({u:1,r:.1,s:.05}),HIGH=WS({u:1,r:1,s:-.2,k:.75,sp:.85}),LOWB=WS({u:1,r:-.5,s:.1}),
  FANW=WS({u:1,r:.16,s:-.6,t:1.4,k:.8,sp:1}),FANB=WS({u:1,r:-.15,s:.45,t:.4,k:.95,sp:.95}),COMET=WS({u:1,r:.12,s:-1.25,k:.45,sp:.15}),
  FLAT=WS({u:1,r:-.42,s:.12,k:.95,sp:.95}),SICK=WS({u:1,r:.05,s:1.7,k:.9,sp:.8}),WRAP=WS({u:.8,r:-.55,s:1.5,t:-.3,k:.75,sp:.4}),
  HALF=WS({u:1,r:.25,s:-.1,k:.7,sp:.6}),BRAKE=WS({u:1,r:.35,s:.3,t:-.2,sp:1}),HOVER=WS({u:1,r:.45,s:-.05,k:.9,sp:.95});
const kv=(K,p)=>keys(K,p);
// the lanes of the Fan: lane i (0..9) is the primary j of the wing on the side sd (0-4: sd -1, j = i; 5-9: sd +1, j = 9 - i)
const LANE_T=[.22,.19,.16,.13,.10,.10,.13,.16,.19,.22];
const smoothK=k=>{k=cl(k,0,1);return k*k*(3-2*k)};
// one beat of the wings (k 0..1: down fast, then up), between the raised and the lowered state
const beatW=(k,hi,lo)=>k<.35?wl(hi,lo,ez(k/.35)):wl(lo,hi,ez((k-.35)/.65));
function pPose(anim,p,o){const ph=p*TAU,P2=!!o.p2&&anim!=='rebirth',A={B:[0,0,0],lean:0,roll:0,yaw:0,s:0,sx:0,lift:0,zc:null,bob:0,
    fL:[3,-10,0],fR:[3,10,0],tuck:0,grip:1,wL:WS({}),wR:WS({}),
    tr:{floor:1,whip:0,trail:0,hang:0,wrap:0,fan:1,wave:0,wph:0,curl:0,lenK:1,whips:P2?2:1,ang:0,z:0,lift:0},
    hy:0,hp:.12,hx:0,hz:0,hr:0,jaw:0,blink:1,squint:0,slit:0,brow:0,glow:1,eyeOn:1,eflash:0,
    cOn:[1,1,1,1,1],cSq:0,cFl:0,cLag:0,heart:0,hg:1,
    heat:{w0:0,w1:0,tr:0,lg:0,hd:0},runs:[],lane:null,gone:null,grow:null,gem:0,
    k2:P2?1:0,sun:P2?1:0,sunOn:null,sunBreak:-1,gray:null,egg:null,bird:1,comet:0,shr:0,fx:[]};
  const beat=(c,a,w)=>{const k=(a==null?1:a)*pls(p,c,w||.06);A.heart=Math.max(A.heart,k);A.hg=Math.max(A.hg,1+.35*k)};
  const fx=(k,t,o2)=>{if(t>=0&&t<1)A.fx.push(Object.assign({k,t},o2||{}))};
  const both=w=>{A.wL=Object.assign({},w);A.wR=Object.assign({},w)};
  const run=(g,k,al)=>{if(k>0&&(al==null||al>.01))A.runs.push({g,k:cl(k,0,1),a:al==null?1:al})};
  const lanes=()=>{if(!A.lane){A.lane=new Array(10).fill(0);A.gone=new Array(10).fill(0);A.grow=new Array(10).fill(1)}};
  const gapOf=(g,d)=>g==null?d:g;
  if(anim==='walk'){// VOLA: glides 16 off the floor, one slow powerful beat per cycle: down fast (.00-.40, the wings open to 180), up slow
    // with the wrists bent; the body leans forward and rises 3 after the beat; the head stays on you; legs tucked, the train waving behind
    const dn=p<.4?ez(p/.4):1,up=p<.4?0:ez((p-.4)/.6);
    const w=p<.4?wl(WS({u:1,r:.95,s:-.18,k:.7,sp:.8}),WS({u:1,r:-.5,s:.08,k:1,sp:1}),dn):wl(WS({u:1,r:-.5,s:.08,k:1,sp:1}),WS({u:1,r:.95,s:-.18,k:.7,sp:.8}),up);
    if(p>=.4){const m=Math.sin(Math.PI*up);w.k=lerp(w.k,.55,m);w.sp=lerp(w.sp,.72,m);w.t=-.35*m}both(w);
    A.lift=16+3*Math.sin(TAU*(p-.32));A.bob=3*Math.sin(TAU*(p-.32));A.lean=.35;A.tuck=1;A.grip=0;A.hp=.12-.35*.8;
    Object.assign(A.tr,{floor:0,trail:1,fan:.55,wave:5,wph:p*2,lenK:.92});
    A.cLag=-.05*Math.sin(TAU*(p-.2));beat(.03,.25,.08);fx('ashring',(p-.38)/.3)}
  else if(anim==='hit'){// COLPITA (only for the pages and the voice): the head goes back, three feathers fly off and turn to ash in the air, the
    // crown trembles, the eyes narrow; at .45 she is in pose again
    const k=hitK(p);A.hp=.12-.4*k;A.hx=-3*k;A.B=[-3*k,0,0];A.lean=-.08*k;A.squint=.75*(1-sstep(.36,.44,p));A.cLag=.25*k*Math.sin(p*40);A.heart=.5*pls(p,.08,.08);
    both(WS({lift:.25*k,sh:k*Math.sin(p*60)}));fx('pluck',p/.9)}
  else if(anim==='fan'||anim==='fan2'){// VENTAGLIO DELL'IMPERO: she rises with the chest out, the heart beats twice, the light climbs into both wings;
    // the wings open behind her up into an imperial fan (the remiges a half circle behind the head), the lanes light up two by two from the
    // inside out (the two of the gap stay dark), brighter and brighter; a tremendous beat forward, the lit feathers fly off (the game
    // shoots here), the dark quills stay; she folds the mantle back, the feathers grow again with a puff of sparks.
    // Fan2 (second phase): two fans, the second aimed again with a gap of its own
    lanes();const two=anim==='fan2',g1=gapOf(o.gap,3),g2=gapOf(o.gap2,6);
    if(!two){beat(.01);beat(.05);both(wkeys([[0,MANT],[.05,MANT],[.42,FANW],[.5,FANB],[.8,MANT],[1,MANT]],p));
      run('w0',sstep(.05,.15,p),1-sstep(.2,.3,p));run('w1',sstep(.05,.15,p),1-sstep(.2,.3,p));
      for(let i=0;i<10;i++){const dark=i===g1||i===g1+1;A.lane[i]=dark?0:sstep(LANE_T[i],LANE_T[i]+.03,p)*(.65+.35*sstep(.22,.42,p))*(p<.5?1:0);A.gone[i]=!dark&&p>=.5&&p<.8?1:0;
        A.grow[i]=!dark&&p>=.8?lerp(.3,1,sstep(.8,1,p)):1}
      const k=rise(p,0,.05,.42,.5);A.s=.03*k;A.lean=-.08*k+.16*rise(p,.42,.48,.52,.65);A.hp=.12-.12*sstep(.05,.3,p)*(1-sstep(.45,.6,p));A.hx=4*rise(p,.42,.48,.52,.65);
      A.cSq=rise(p,.42,.47,.52,.62);A.jaw=.8*rise(p,.43,.46,.54,.62);A.squint=.4*rise(p,.1,.2,.5,.6);fx('regrow',(p-.8)/.2);fx('shot',(p-.5)/.2)}
    else{beat(0);beat(.03);both(wkeys([[0,MANT],[.02,MANT],[.3,FANW],[.36,FANB],[.48,FANW],[.62,FANW],[.72,FANB],[.9,MANT],[1,MANT]],p));
      run('w0',sstep(.02,.1,p),1-sstep(.14,.22,p));run('w1',sstep(.02,.1,p),1-sstep(.14,.22,p));run('w0',sstep(.4,.48,p),1-sstep(.52,.6,p));run('w1',sstep(.4,.48,p),1-sstep(.52,.6,p));
      const T2=[.14,.12,.10,.08,.06,.06,.08,.10,.12,.14];
      for(let i=0;i<10;i++){const dA=i===g1||i===g1+1,dB=i===g2||i===g2+1;
        if(p<.36){A.lane[i]=dA?0:sstep(T2[i],T2[i]+.02,p)*(.7+.3*sstep(.14,.3,p))}
        else if(p<.72){const gA=!dA&&p<.4;A.gone[i]=gA?1:0;if(!dB&&p>=.4){A.grow[i]=lerp(.3,1,sstep(.4,.52,p));A.lane[i]=sstep(.4,.46,p)}else if(dB&&!dA){A.lane[i]=0}else A.lane[i]=0;
          if(dA&&!dB)A.lane[i]=0;if(!dA&&!dB&&p<.4)A.lane[i]=0}
        else{A.gone[i]=!dB&&p<.85?1:0;A.grow[i]=!dB&&p>=.85?lerp(.3,1,sstep(.85,1,p)):1;A.lane[i]=0}}
      const k=rise(p,0,.03,.3,.36),k2=rise(p,.3,.34,.38,.46)+rise(p,.66,.7,.74,.82);A.s=.03*k;A.lean=-.08*k+.16*k2;A.hx=4*k2;A.cSq=k2;A.jaw=.8*k2;A.squint=.4*rise(p,.05,.12,.85,.92);
      A.hp=.12-.12*rise(p,.02,.2,.8,.92);fx('regrow',(p-.85)/.15);fx('shot',(p-.36)/.2);fx('shot',(p-.72)/.2)}}
  else if(anim==='dive'||anim==='redive'){// PICCHIATA DELLA COMETA: the heart beats, the fire runs into the talons and the crown; she crouches with the wings
    // high, two huge beats and she rises (260), at the top she closes into an arrow and becomes a comet (a drop of fire, her shape inside),
    // a white flash in the eyes and the slit: she aims; the dive (the game moves her along the line); she brakes with the wings wide and the
    // talons forward, slides through the sparks and lies on her wings (Ali a terra). o.anvil: she crashes into it; o.chain: she brakes in
    // the air at 30 and stays there for the second dive. Redive (second phase): hovering at 30 she turns, closes and dives again
    const re=anim==='redive',t0=re?.25:.3,t1=re?.45:.42,t2=.62,chain=!!o.chain&&!re,anv=!!o.anvil;
    if(!re){beat(0);beat(.04);run('lg',sstep(.01,.1,p),1-sstep(.3,.4,p));run('hd',sstep(.01,.1,p),1-sstep(.3,.4,p))}else{beat(.02)}
    A.heat.lg=sstep(.05,.12,p)*(1-sstep(.62,.7,p));A.heat.hd=A.heat.lg;
    // the height (the game's o.z takes its place)
    let z;if(!re){const up=p<.12?0:p<.3?smoothK((p-.12)/.18):1;z=p<t1?260*up+6*Math.sin(Math.PI*cl((p-.16)/.08,0,1))*(p<.3?1:0):p<t2?lerp(260,12,smoothK((p-t1)/(t2-t1))):chain?lerp(12,30,sstep(t2,.7,p)):p<.8?4:4*(1-sstep(.8,.86,p))}
    else z=p<t1?30:p<t2?lerp(30,12,smoothK((p-t1)/(t2-t1))):p<.8?4:4*(1-sstep(.8,.86,p));A.zc=z;
    if(!re){const b1=cl((p-.12)/.1,0,1),b2=cl((p-.21)/.09,0,1);
      if(p<.12){both(wl(MANT,HIGH,sstep(0,.1,p)));A.s=-.1*sstep(0,.1,p);A.B[2]=-3*sstep(0,.1,p);A.lean=.12*sstep(0,.1,p)}
      else if(p<.3){both(p<.21?beatW(b1,HIGH,LOWB):beatW(b2,HIGH,LOWB));A.tuck=sstep(.12,.2,p);A.grip=0;A.lean=lerp(.12,-.1,sstep(.12,.3,p))}
      else if(p<t1){both(wl(HIGH,COMET,sstep(.3,.36,p)));A.tuck=1;A.grip=0;A.lean=lerp(-.1,.95,sstep(.3,.4,p))}}
    else{if(p<t0){both(wl(HOVER,WS({u:1,r:-.1,s:.1}),.5+.5*Math.sin(p/t0*TAU*1.5)));A.tuck=1;A.grip=0;A.lean=.15}else if(p<t1){both(wl(HOVER,COMET,sstep(t0,t0+.08,p)));A.tuck=1;A.grip=0;A.lean=lerp(.15,.95,sstep(t0,t1-.04,p))}}
    if(p>=t0&&p<t2){A.comet=sstep(t0,t0+.06,p)*(1-sstep(t2-.03,t2+.02,p));A.cSq=sstep(t0,t0+.05,p);Object.assign(A.tr,{floor:0,trail:1,fan:.15,wave:p>=t1?3:0,wph:p*4,lenK:1});
      if(p>=t1){both(COMET);A.tuck=1;A.grip=0;A.lean=.95}A.eflash=flash(p,re?.4:.38,.06);A.slit=sstep(re?.4:.38,(re?.4:.38)+.02,p)*(1-sstep(t2,t2+.05,p));A.hp=.12+.2*sstep(t0,t1,p)}
    if(p>=t2){const k=(p-t2)/(1-t2);
      if(chain){both(wl(BRAKE,HOVER,sstep(t2,.75,p)));A.tuck=lerp(.4,1,sstep(.7,.85,p));A.grip=0;A.lean=lerp(.6,.15,sstep(t2,.72,p));A.fL=[14,-10,0];A.fR=[14,10,0];fx('sparks',(p-t2)/.15,{at:[10,0,30]})}
      else{const br=1-sstep(.62,.66,p);
        if(p<.8){both(wl(BRAKE,FLAT,sstep(.66,.8,p)));A.lean=lerp(.6,.2,sstep(t2,.7,p));A.tuck=lerp(1,0,sstep(t2,.66,p));A.grip=1;A.fL=[12-6*k,-10,0];A.fR=[12-6*k,10,0];
          A.B[0]=-14*Math.sin(Math.PI*cl((p-t2)/.18,0,1));fx('scrape',(p-t2)/.18);fx('sparks',(p-t2)/.12,{at:[14,0,4]})}
        else{both(FLAT);A.lean=.2}
        A.B[2]-=16*sstep(.7,.9,p);A.hp=.12-.15*br;A.jaw=.4*sstep(.8,.95,p);A.squint=.5*sstep(.8,.95,p);A.cOn=[1,1,1,1,1].map(()=>lerp(1,.15,sstep(.75,.95,p)));
        if(anv){const c=flash(p,t2,.12);A.hp-=.55*c;A.hx-=5*c;A.wflash=flash(p,t2,.08);both(wl(wl(BRAKE,SICK,.6),FLAT,sstep(.68,.8,p)));fx('anvil',(p-t2)/.2)}}}}
  else if(anim==='grounded'){// ALI A TERRA (a cycle): stretched on her wings, flat on the floor, the belly down; the head up but tired, the beak
    // half open, panting (two breaths a cycle); the crown reduced to embers; the heart uncovered and beating fast: it is the target
    const b=Math.sin(ph*2);both(wl(FLAT,WS({u:1,r:-.38,s:.14,k:.93,sp:.93}),.5+.5*b));A.wL.sh=A.wR.sh=.25*Math.sin(TAU*7*p);A.B=[0,0,-16+.6*b];A.lean=.2;A.s=.03*b;
    A.hp=.02-.06*b;A.jaw=.35+.15*b;A.squint=.55;A.blink=C.blink(p,.5,.12);A.cOn=[.15,.15,.15,.15,.15];A.heart=.55+.45*Math.abs(Math.sin(TAU*3*p));A.hg=1.25+.3*Math.abs(Math.sin(TAU*3*p));
    A.fL=[-6,-12,0];A.fR=[-6,12,0];A.glow=.7}
  else if(anim==='rise'){// SI RIALZA: she pushes on her wings and rises; a shake, the wings fold into the mantle; the crown lights again
    const k=sstep(0,.5,p);both(p<.5?wl(FLAT,WS({u:1,r:.3,s:0,k:.85,sp:.9}),k):wl(WS({u:1,r:.3,s:0,k:.85,sp:.9}),MANT,sstep(.5,1,p)));A.B=[0,0,-16*(1-k)];A.lean=.2*(1-k);
    if(p>.5){A.wL.sh=A.wR.sh=Math.sin(TAU*6*(p-.5)*.5)*(1-sstep(.75,.95,p));A.B[1]=.6*trem(p,.5,.8,8,.5)}A.cOn=[1,1,1,1,1].map(()=>lerp(.15,1,sstep(.6,1,p)));
    A.fL=lerp3([-6,-12,0],[3,-10,0],k);A.fR=lerp3([-6,12,0],[3,10,0],k);A.hp=.12-.1*(1-k);A.squint=.5*(1-k)}
  else if(anim==='wings'||anim==='wings2'){// ALI DELL'IMPERO: the heart beats, the fire runs along the leading edge of both wings; she glides forward
    // opening them, straightens with the chest out and spreads them wide (220), the head back and the beak open; then she slams them shut in
    // front of her like two sickles of fire meeting before her chest (a burst of flame before the beak); she holds, then folds the mantle.
    // Wings2: twice, turning round to you (the game turns her) in between
    const two=anim==='wings2';beat(0);beat(.04);
    if(!two){both(wkeys([[0,MANT],[.2,WS({u:1,r:.25,s:0,sp:.6})],[.45,SPREAD],[.52,SICK],[.75,SICK],[.88,WS({u:1,r:.1,s:.4,sp:.7})],[1,MANT]],p));
      const L=sstep(.06,.42,p),out=1-sstep(.52,.62,p);run('w0',L,out);run('w1',L,out);A.heat.w0=A.heat.w1=.8*L*out;
      const st=rise(p,.2,.3,.45,.52);A.lean=.1*rise(p,0,.1,.15,.2)-.25*st+.12*rise(p,.45,.5,.6,.75);A.hp=.12-.32*st+.1*rise(p,.45,.5,.6,.75);A.jaw=.8*rise(p,.3,.36,.5,.56);A.hx=-2*st;A.cFl=.6*st;
      fx('vampa',(p-.5)/.14);A.squint=.5*rise(p,.45,.5,.7,.8)}
    else{both(wkeys([[0,MANT],[.17,WS({u:1,r:.25,s:0,sp:.6})],[.3,SPREAD],[.38,SICK],[.45,SICK],[.6,SPREAD],[.72,SPREAD],[.8,SICK],[.88,SICK],[1,MANT]],p));
      const L1=sstep(.04,.3,p)*(1-sstep(.38,.44,p)),L2=sstep(.45,.6,p)*(1-sstep(.8,.86,p));run('w0',sstep(.04,.3,p),1-sstep(.38,.44,p));run('w1',sstep(.04,.3,p),1-sstep(.38,.44,p));
      run('w0',sstep(.45,.6,p),1-sstep(.8,.86,p));run('w1',sstep(.45,.6,p),1-sstep(.8,.86,p));A.heat.w0=A.heat.w1=.8*Math.max(L1,L2);beat(.45,.7);
      const st=rise(p,.17,.25,.3,.38)+rise(p,.6,.65,.72,.8);A.lean=-.22*st+.12*(rise(p,.3,.36,.42,.5)+rise(p,.78,.82,.9,.98));A.hp=.12-.3*st;A.jaw=.8*st;A.cFl=.6*st;
      fx('vampa',(p-.37)/.12);fx('vampa',(p-.79)/.12)}}
  else if(anim==='sweep'){// RUOTA DI FIAMME: the heart beats, the fire runs down the train from its root to the tips, the eyes of flame light
    // up; she glides to you opening the wings flat, plants herself; the train rises off the floor and straightens into one whip (two in the
    // second phase, to her right and left) at floor level; one whole turn (slow, fast, braking: the same curve as N3.phoenixSweep), the wings
    // a wheel; a ring of fire spreads from her feet (.84); she stops, the train falls back into its fan, she shakes her head
    const dr=o.dir===-1?-1:1;beat(0);beat(.04);run('tr',sstep(.06,.3,p),1-sstep(.8,.86,p));A.heat.tr=sstep(.06,.3,p)*(1-sstep(.8,.9,p));
    const op=sstep(0,.15,p)*(1-sstep(.84,1,p));both(wl(MANT,WS({u:1,r:.05,s:0,k:1,sp:1}),op));
    const wk=sstep(.15,.3,p)*(1-sstep(.8,.92,p)),turn=dr*TAU*smoothK((p-.3)/.5);A.yaw=turn;A.B[2]=-4*wk;A.s=-.05*wk;A.tr.whip=wk;A.tr.whips=P2?2:1;
    const av=(p>.3&&p<.8)?6*smoothK((p-.3)/.5)*(1-smoothK((p-.3)/.5)):0;A.cLag=-.5*av*dr*0+.35*av;A.hy=turn-dr*.25*av/1.5+.25*Math.sin(TAU*3*cl((p-.88)/.1,0,1))*(p>.88&&p<.98?1:0);
    A.fL=[3-2*wk,-12,0];A.fR=[3-2*wk,12,0];A.squint=.4*wk;fx('firering',(p-.84)/.11)}
  else if(anim==='rain'){// PIOGGIA DI BRACI: the heart beats, the fire runs into the three longest remiges of each wing; she climbs with strong
    // beats to 60, hangs there and beats down hard three times (four in the second phase): at each beat three burning feathers of each wing
    // come off and fall spinning (the model draws their first 20, then the game, N3.phoenixEmber); the crown flares; she comes down in a
    // spiral (one turn) and lands with a beat that lifts the ash
    beat(0);beat(.04);run('w0',sstep(.02,.12,p),1);run('w1',sstep(.02,.12,p),1);lanes();
    const BT=P2?[.22,.38,.54,.70]:[.24,.48,.72];
    A.lift=p<.18?60*smoothK(p/.18):p<.85?60+3*Math.sin(TAU*4*p):60*(1-smoothK((p-.85)/.14));A.tuck=sstep(0,.08,p)*(1-sstep(.9,.98,p));A.grip=1-A.tuck;
    let w=wl(HIGH,LOWB,.5+.5*Math.sin(TAU*5*p));for(const c of BT){const d=p-c+.06;if(d>0&&d<.16)w=beatW(d/.16,HIGH,WS({u:1,r:-.65,s:.15}))}
    if(p<.04)w=wl(MANT,HIGH,p/.04);if(p>.94)w=wl(w,MANT,sstep(.94,1,p));both(w);A.lean=.08;A.hp=.25;
    A.yaw=p>.85?TAU*smoothK((p-.85)/.13):0;A.hy=A.yaw;
    const he=sstep(.04,.12,p)*(1-sstep(.85,.9,p));for(const i of[0,1,2,7,8,9])A.lane[i]=he;
    for(const c of BT){const d=p-c;if(d>=0&&d<.1){for(const i of[0,1,2,7,8,9]){A.grow[i]=lerp(.3,1,sstep(.02,.1,d))}A.cFl=Math.max(A.cFl,1-d/.1)}fx('drop',d/.12,{c})}
    Object.assign(A.tr,{floor:1-A.tuck,trail:A.tuck,fan:lerp(1,.6,A.tuck),wave:4,wph:p*3});fx('ashland',(p-.96)/.04)}
  else if(anim==='judge'){// SGUARDO DEL GIUDIZIO (second phase): she straightens, the crown of sun flares, the head comes down at you, the slit in
    // the eyes, the eye of the gods lights up; the fire climbs the neck; she stares (the head follows you slowly, the trails of the eyes
    // grow), the half open wings tremble; three sharp nods (.25, .42, .59), the eye of the gods flashing at each; then the eyes calm down
    beat(.02);beat(.06);run('hd',sstep(.04,.15,p),1-sstep(.8,.9,p));A.heat.hd=sstep(.06,.15,p)*(1-sstep(.8,.9,p));
    const k=sstep(0,.15,p)*(1-sstep(.8,1,p));both(wl(MANT,HALF,k));A.wL.sh=A.wR.sh=k*Math.sin(TAU*6*2.6*p)*.6;A.lean=-.08*k;A.s=.02*k;
    let nod=0;for(const c of[.25,.42,.59]){const d=p-c;if(d>=0&&d<.09)nod=Math.max(nod,d<.03?ez(d/.03):1-ez((d-.03)/.06))}
    A.hp=.12+.18*k+.35*nod;A.slit=sstep(.05,.15,p)*(1-sstep(.8,.9,p));A.gem=Math.max(.6*k,...[.25,.42,.59].map(c=>flash(p,c,.12)));A.squint=.35*k;A.cFl=.5*k;A.sunFl=k;A.trailK=k;
    A.hy=.15*Math.sin(TAU*(p-.15)/.65)*k+.2*Math.sin(TAU*2*cl((p-.82)/.16,0,1))*(p>.82&&p<.98?1:0)}
  else if(anim==='rebirth'){// RINASCITA (the change of phase, her rage): a broken cry, the flames tremble and sink, she falls; she wraps herself in her
    // wings like a royal cloak and the train winds round her: a cocoon of fire; it hardens into a great egg of black ash with golden cracks
    // that beats three times (1.04, 1.07, 1.12) while six threads of mint light (the fire of the gods) climb into it from the floor; the
    // cracks open, the egg bursts (.64); she is reborn blue, rises, spreads the wings wide (240), the crown of sun lights one tongue at a
    // time, and she cries
    const P2b=p>=.64;A.k2=sstep(.64,.74,p);A.sun=sstep(.8,.92,p);A.sunOn=Array.from({length:10},(_,i)=>sstep(.8+i*.012,.82+i*.012,p));
    if(p<.64){A.tr.whips=1;
      const fall=sstep(.04,.12,p);A.jaw=.9*rise(p,0,.03,.08,.12);A.hp=.12-.3*rise(p,0,.03,.08,.12)+.3*fall;A.B[2]=-10*fall;A.s=-.08*fall;A.cOn=[1,1,1,1,1].map(()=>lerp(1,.2,sstep(.03,.12,p)));
      A.B[1]=.8*trem(p,0,.12,9,3.4);both(wl(MANT,WRAP,sstep(.12,.26,p)));A.tr.wrap=sstep(.12,.28,p);A.tr.floor=1-A.tr.wrap;A.tuck=fall*.6;
      A.egg={k:sstep(.25,.32,p),s:1+.04*pls(p,.36,.05)+.07*pls(p,.46,.05)+.12*pls(p,.56,.05),cr:sstep(.28,.36,p)*(.4+.2*sstep(.34,.38,p)+.2*sstep(.44,.48,p)+.2*sstep(.54,.58,p)),
        blue:sstep(.36,.6,p),thr:sstep(.3,.36,p),open:sstep(.56,.64,p),dark:sstep(.2,.3,p)};A.bird=1-sstep(.3,.32,p);A.ashAll=sstep(.2,.3,p)}
    else{const k=sstep(.64,.78,p);A.burst=(p-.64)/.3;both(wkeys([[.64,WRAP],[.78,WS({u:1,r:.35,s:0,k:.9,sp:.9})],[.9,WS({u:1,r:.15,s:.05,k:1,sp:1})],[1,WS({u:1,r:.12,s:.05,k:1,sp:1})]],p));
      A.B[2]=-10*(1-k);A.lean=-.15*sstep(.78,.9,p);A.hp=.12-.35*rise(p,.82,.86,.96,1);A.jaw=.9*rise(p,.84,.87,.95,.98);A.cFl=.5*rise(p,.8,.86,.95,1);A.wspan=sstep(.78,.9,p)}}
  else if(anim==='taunt'){// PRESA IN GIRO: she raises her head and looks down the beak at you, the eyes half shut with the slit; a regal snap of the
    // half open wings as if brushing off dust (a puff of flame from the crown at .40); the beak opens three times «kek-kek-kek»; she folds
    // the wings, turns the head aside in disdain and stares at you again
    const up=sstep(0,.3,p)*(1-sstep(.8,1,p));A.hp=.12-.32*up;A.lean=-.06*up;A.squint=.6*up;A.slit=up;
    both(wkeys([[0,MANT],[.3,MANT],[.4,WS({u:1,r:.32,s:-.15,k:.75,sp:.7})],[.62,WS({u:1,r:.28,s:-.1,k:.72,sp:.66})],[.8,MANT],[1,MANT]],p));
    A.jaw=.7*Math.max(pls(p,.48,.07),pls(p,.58,.07),pls(p,.68,.07));A.cFl=flash(p,.4,.15);fx('puff',(p-.4)/.25);
    A.hy=.55*rise(p,.82,.86,.92,.98);A.hr=-.15*rise(p,.82,.86,.92,.98)}
  else if(anim==='enter'){// ENTRATA: not there (in the sky: the game draws the shadow of the wings); a column of fire falls on the circle of runes
    // and inside it she comes down slowly (160 to 0) in her mantle, the train hanging under her like the tail of a comet, the eyes shut, the
    // crown out; she lands softly, the train falls behind her and opens into its fan; two white flashes, the eyes open, the crown lights one
    // plume at a time from the sides to the middle; the wings spread wide, the column bursts into a ring of sparks, the head up, the cry; she
    // folds the mantle and lowers the head at you
    A.vis=sstep(.22,.24,p);A.lift=p<.5?160*(1-smoothK((p-.22)/.28)):0;A.col=p>=.22&&p<.8?(p-.22)/.58:-1;
    const land=rise(p,.5,.54,.56,.62);A.s=-.06*land;A.B[2]=-2*land;
    Object.assign(A.tr,{floor:sstep(.52,.62,p),hang:1-sstep(.5,.6,p),fan:lerp(.25,1,sstep(.52,.62,p)),wave:2,wph:p*2});A.tuck=p<.5?.5:0;
    A.eyeOn=sstep(.6,.62,p);A.eflash=flash(p,.62,.06);A.blink=A.eyeOn>0?1:0;
    A.cOn=[.64,.66,.70,.68,.64].map((t,i)=>sstep(t,t+.02,p));
    both(wkeys([[0,MANT],[.72,MANT],[.8,WS({u:1,r:.15,s:.05,k:1,sp:1})],[.9,WS({u:1,r:.12,s:.05,k:1,sp:1})],[1,MANT]],p));
    const cry=rise(p,.72,.78,.88,.92);A.hp=.12-.4*cry+.12*(1-A.eyeOn);A.jaw=.9*rise(p,.78,.8,.88,.9);A.lean=-.12*cry;A.cFl=.6*cry;fx('burstring',(p-.76)/.2)}
  else if(anim==='die'){// SCONFITTA: a broken cry, she staggers (the crown of sun breaks into sparks, the plumes go out from the middle to the sides);
    // a last heavy beat lifts her 10 and drops her on her knees with the wings on the floor; the feathers turn to grey ash from the tips
    // toward the body; a last regal gesture: she wraps herself in her wings and hides the head under one; she crumbles into a mound of ash
    // with a little ember in it (the climax, .55); the ash flies off in flakes and a little golden egg is left; it cracks, the top lifts,
    // and the chick of fire pops out and blinks
    A.jaw=.9*rise(p,0,.03,.1,.15);A.hp=.12-.3*rise(p,0,.03,.1,.15);A.B[1]=.8*trem(p,0,.15,8,4);A.sunBreak=P2?(p-.04)/.2:-1;A.sun=P2?1-sstep(.04,.06,p):0;
    A.cOn=[.12,.08,.04,.08,.12].map(t=>1-sstep(t,t+.03,p));
    const bt=p>=.15&&p<.35;both(p<.15?MANT:p<.35?wkeys([[.15,MANT],[.18,HIGH],[.26,LOWB],[.32,FLAT],[.35,FLAT]],p):p<.5?FLAT:wl(FLAT,WRAP,sstep(.5,.62,p)));
    A.B[2]=10*rise(p,.18,.24,.24,.3)-14*sstep(.28,.32,p);A.lean=.15*sstep(.28,.4,p);A.fL=[-6,-12,0];A.fR=[-6,12,0];if(p<.28){A.fL=[3,-10,0];A.fR=[3,10,0]}
    A.gray={w:sstep(.3,.42,p),tr:sstep(.32,.44,p),cr:sstep(.3,.4,p),body:sstep(.42,.55,p),head:sstep(.45,.55,p)};A.eyeOn=1-sstep(.45,.52,p);A.eyeGrey=sstep(.45,.52,p);A.glow=1-sstep(.4,.5,p);
    A.hide=sstep(.52,.62,p);A.hp+=.5*A.hide;A.hz=-6*A.hide;A.mound={k:sstep(.55,.7,p),ember:sstep(.55,.6,p)*(1-sstep(.84,.9,p)),fly:sstep(.7,.85,p),egg:sstep(.72,.8,p),crack:sstep(.85,.95,p),chick:sstep(.95,1,p),p};
    A.bird=1-sstep(.58,.68,p);A.heart=.4*pls(p,.55,.05)}
  else{// FERMA: a queen on her throne: the chest swells once a cycle, the heart beats twice, the head looks slowly round the room and
    // comes back to stare down the beak at you, a slow blink; a wave runs down the train, a talon scrapes the floor (.30), she shakes her
    // feathers (.70-.85: the mantle lifts a little and trembles twice), three embers fall
    const b=Math.sin(ph);A.s=.02*b;A.B=[0,0,.4*b];A.breath=.5+.5*b;beat(.08,1);beat(.20,.8);
    const lk=Math.sin(ph)*(.55+.45*Math.cos(ph*2));A.hy=.38*lk*(1-sstep(.75,.95,p))*sstep(0,.08,p);A.hp=.12-.06*Math.abs(lk);A.blink=C.blink(p,.62,.1);
    A.tr.wave=2;A.tr.wph=p;A.cLag=.05*Math.sin(ph-.6);A.glow=.85+.15*Math.sin(ph*2);
    const sc=pls(p,.30,.08);A.fR=[3-3*sc,10,2*sc];fx('spark',(p-.31)/.12,{at:[6,10,0]});
    const sh=rise(p,.70,.73,.82,.85);A.wL.lift=A.wR.lift=.6*sh;A.wL.sh=A.wR.sh=sh*Math.sin(TAU*6*3*(p-.70));fx('embers',(p-.74)/.26)}
  if(P2&&anim!=='rebirth'&&anim!=='die')A.sun=1;
  return A}

// ------------------------------------------------------------------ pieces
// a flame licking up from a screen point (the game's time makes it flicker, never the pose)
// (inside lickB the flames wait and are painted together: one fill per colour and strength)
let LKB=null;
function lick(q,r,rgb,hot,a,seed,dx){if(a<=.02||LOWFX)return;const f=[q,r,rgb,hot,Math.min(1,a),seed,dx||0];if(LKB)LKB.push(f);else lickN([f])}
function lickN(L){const a0=ctx.globalAlpha,M=new Map(),t0=(G.t||0)*7;for(const f of L){const k=f[2]+'|'+f[3]+'|'+Math.round(f[4]*32);let g=M.get(k);if(!g)M.set(k,g=[]);g.push(f)}
  for(const g of M.values()){const a=Math.round(g[0][4]*32)/32;
    for(const hp of[0,1]){ctx.beginPath();for(const[q,r,,,,seed,dx] of g){const t=t0+seed*3.1,h=r*(2.2+.5*Math.sin(t)),sw=.35*r*Math.sin(t*1.3+seed)+dx*r;
        if(!hp){ctx.moveTo(q[0]-r,q[1]);ctx.quadraticCurveTo(q[0]-r*.9,q[1]-h*.55,q[0]+sw,q[1]-h);ctx.quadraticCurveTo(q[0]+r*.9,q[1]-h*.55,q[0]+r,q[1]);ctx.closePath()}
        else{ctx.moveTo(q[0]-r*.55,q[1]);ctx.quadraticCurveTo(q[0]-r*.5,q[1]-h*.35,q[0]+sw*.6,q[1]-h*.62);ctx.quadraticCurveTo(q[0]+r*.5,q[1]-h*.35,q[0]+r*.55,q[1]);ctx.closePath()}}
      ctx.globalAlpha=a0*a*(hp?1:.85);ctx.fillStyle=`rgb(${hp?g[0][3]:g[0][2]})`;ctx.fill()}}ctx.globalAlpha=a0}
const lickB=f=>{const was=LKB;LKB=[];try{f()}finally{const L=LKB;LKB=was;if(L.length)lickN(L)}};
// the gradient of a flame feather from its root (q0) to its tip (q1): root, middle, tip; the outer part turned to ash (a: the share from the
// tip) with a line of embers at the border; heat (the fire running in it) brightens it toward the incandescent edge and relights the ash
function fStops(g,cR,cM,cT,cE,ash,heat){const h=heat||0,a=(ash||0)*(1-h),R=h>0?cmix(cR,cE,.35*h):cR,M=h>0?cmix(cM,cE,.55*h):cM,T=h>0?cmix(cT,cE,.75*h):cT;g.addColorStop(0,R);g.addColorStop(.48,M);
  if(a>.01){const e=1-a;g.addColorStop(Math.max(.5,e-.07),T);g.addColorStop(e,EMB);g.addColorStop(Math.min(1,e+.05),ASH.l);g.addColorStop(1,ASH.b)}else g.addColorStop(1,T);return g}
const fGrad=(q0,q1,cR,cM,cT,cE,ash,heat)=>fStops(ctx.createLinearGradient(q0[0],q0[1],q1[0],q1[1]),cR,cM,cT,cE,ash,heat);
// a feather's outline on the screen into the path pa (root, outer vane, tip, inner vane): [root, tip, outer, inner]
function fPath(pa,P,b,d,s,L,W,wo,wi,bend){const n=cross(d,s),bn=bend||0,tip=add(add(b,mul(d,L)),mul(n,bn*L*.3)),mid=add(add(b,mul(d,L*.5)),mul(n,bn*L*.08)),B=P(b),Tq=P(tip),M1=P(add(mid,mul(s,W*wo))),M2=P(add(mid,mul(s,-W*wi)));
  pa.moveTo(B[0],B[1]);pa.quadraticCurveTo(M1[0],M1[1],Tq[0],Tq[1]);pa.quadraticCurveTo(M2[0],M2[1],B[0],B[1]);pa.closePath();return[B,Tq,M1,M2]}
// a flight feather: a flat vane in 3D from the root b along d (length L), the narrow outer vane toward s (half width W·wo) and the wide inner
// one away from it (W·wi), bent along its normal; two sided (the underside darker); the rachis, the incandescent outer edge. Returns the tip
function feather(V0,b,d,s,L,W,K,o){o=o||{};const{P,F}=V0,n=cross(d,s),bend=o.bend||0,tip=add(add(b,mul(d,L)),mul(n,bend*L*.3)),mid=add(add(b,mul(d,L*.5)),mul(n,bend*L*.08));
  const B=P(b),Tq=P(tip),M1=P(add(mid,mul(s,W*(o.wo||1.3)))),M2=P(add(mid,mul(s,-W*(o.wi||2.1))));
  ctx.beginPath();ctx.moveTo(B[0],B[1]);ctx.quadraticCurveTo(M1[0],M1[1],Tq[0],Tq[1]);ctx.quadraticCurveTo(M2[0],M2[1],B[0],B[1]);ctx.closePath();
  const up=o.under!=null?o.under:F(n)<0,h=o.heat||0;
  ctx.fillStyle=o.fill||(up&&!o.flat?fGrad(B,Tq,K.fUd,K.fU,cmix(K.fU,K.fM,.35),K.fE,o.ash,h*.6):fGrad(B,Tq,o.cR||K.fR,o.cM||K.fM,o.cT||K.fT,K.fE,o.ash,h));ctx.fill();
  ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=o.lw||1.7;ctx.stroke();
  if(o.fine!==false&&L>9){const r0=P(add(b,mul(d,L*.08))),r1=P(add(b,mul(d,L*.82)));ctx.strokeStyle=up?'rgba(255,170,140,.18)':`rgba(255,226,170,${.3+.5*h})`;ctx.lineWidth=.8;ctx.lineCap='round';seg(r0,r1);ctx.stroke();
    if(!up&&h>.25){const e0=P(add(add(b,mul(d,L*.2)),mul(s,W*.35))),e1=P(add(add(b,mul(d,L*.5)),mul(s,W*.62)));ctx.strokeStyle=`rgba(255,255,255,${.9*sstep(.25,.7,h)})`;ctx.lineWidth=1.1;
      ctx.beginPath();ctx.moveTo(e0[0],e0[1]);ctx.quadraticCurveTo(e1[0],e1[1],lerp(e1[0],Tq[0],.75),lerp(e1[1],Tq[1],.75));ctx.stroke()}}
  return Tq}

// the open wing's skeleton from its state (body frame): shoulder, elbow, wrist, hand tip; the frame (a span, c chord, n top normal)
function wingOpen(sd,w,shr){const ca=Math.cos(w.t),sa=Math.sin(w.t),R=v=>rotZ(rotX(v,sd*w.r),-sd*w.s);
  const a=R([0,sd,0]),c=R([-ca,0,sa]),n=R([sa,0,ca]),k=w.k,th=[lerp(.62,.1,k),lerp(-.7,0,k),lerp(1.9,.07,k)],dI=t=>add(mul(a,Math.cos(t)),mul(c,Math.sin(t)));
  const S=[SHO[0],sd*SHO[1],SHO[2]+(shr||0)],E=add(S,mul(dI(th[0]),BL[0])),Wr=add(E,mul(dI(th[1]),BL[1])),T=add(Wr,mul(dI(th[2]),BL[2]));
  return{a,c,n,th,dI,J:[S,E,Wr,T]}}
// the wing now (body frame): from the folded mantle (u 0) to the open skeleton (u 1): the joints, four sections of the coverts
// [front, out, back, in] with their outward normals, and every feather's root, direction, side, normal and length
const myS=(q,sd)=>[q[0],sd*q[1],q[2]];
function wingNow(sd,w,A){const O=wingOpen(sd,w,A.shr),u=cl(w.u,0,1),my=q=>myS(q,sd),th=2.4;
  // the mantle lifting off its flank (it turns out round the shoulder) and trembling
  const lift=w.lift||0,tr=w.sh||0,S0=my(FJ[0]),Lm=q=>{if(!lift&&!tr)return q;const d=sub(q,S0),ang=sd*(.3*lift+.035*tr);return add(S0,add(rotX(d,ang),[0,0,.6*tr]))};
  const nF=nrm(my([-.2,1,.05])),J=[],SEC=[],Nn=[];
  for(let i=0;i<4;i++){const jo=O.J[i],cw=BW[i]*(i===0?1.15:1),fo=[jo,add(add(jo,mul(O.c,cw*.45)),mul(O.n,th)),add(jo,mul(O.c,cw)),add(add(jo,mul(O.c,cw*.45)),mul(O.n,-th))],ff=FSEC[i].map(q=>Lm(my(q)));
    J.push(lerp3(Lm(my(FJ[i])),jo,u));SEC.push(ff.map((q,k)=>lerp3(q,fo[k],u)));Nn.push(nrm(lerp3(nF,O.n,u)))}
  const F=[],sp=w.sp,thA=O.th,nf=nrm(lerp3(nF,O.n,u)),nfP=nrm(lerp3(nrm(my([-.35,.55,.75])),O.n,u));
  // the primaries along the hand, from the tip (j 0) to the wrist; folded, they point back and in, and the five long ones cross behind the heels
  for(let j=0;j<9;j++){const ob=lerp3(O.J[3],O.J[2],j/8*.9),od=O.dI(thA[2]+lerp(.07+.02*j,j/8*1.22,sp));
    const fd=nrm(my([-.66,-.6+.03*j,-.22+.025*j])),fb=Lm(j<5?add(add(my(FJ[3]),my([-4,-1.5,1.5+.9*j])),mul(fd,-3.2*j)):add(lerp3(my(FJ[3]),my(FJ[2]),.45),my([-6,-1,0]))),fl=j<5?30:20;
    const b=lerp3(fb,ob,u),d=nrm(lerp3(fd,od,u)),s=nrm(cross(nfP,d));F.push({p:1,j,b,d,s,n:nfP,L:lerp(fl,PRL[j],u)})}
  // the secondaries along the forearm, from the wrist (i 0) to the elbow; folded, they hang down and back under the coverts
  for(let i=0;i<7;i++){const ob=lerp3(O.J[2],O.J[1],i/6),od=O.dI(thA[1]+lerp(.15+.03*i,1.6+.07*i,sp));
    const fb=Lm(add(lerp3(my(FJ[2]),my(FJ[1]),i/6),my([-8,-2,4]))),fd=nrm(my([-.55,-.15,-.82]));
    const b=lerp3(fb,ob,u),d=nrm(lerp3(fd,od,u)),s=nrm(cross(nfP,d));F.push({p:0,j:i,b,d,s,n:nfP,L:lerp(11+i*.5,SEL[i],u)})}
  return{O,J,SEC,Nn,F,u}}
// the coverts of a wing (body points through the frame X): folded, the mantle (crimson, warmer toward the bottom, three rows of scallops,
// the edge of beaten gold where the bones run); open, the band of gold scales along the arm. One outline round its three pieces, no seams
function slabDraw(V0,X,WN,sd,K,o){const{P,F}=V0,u=WN.u,S=WN.SEC.map(sec=>sec.map(q=>P(X.T(q)))),H=[];
  for(let i=0;i<3;i++){const h=hullE(S[i].concat(S[i+1]),.05);if(h.length>2){h.path=smoothP(h);H.push(h)}}if(!H.length)return null;
  const fo=F(X.Rd(WN.Nn[1])),under=fo<-.1,all=[];for(const h of H)for(const q of h)all.push(q);const bb=bbox(all),ug=sstep(.3,.95,u);
  // the three pieces as one path (the same winding, so it fills their union): one outline, one fill
  const UP=new Path2D();for(const h of H)UP.addPath(h.path);
  ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=5.4;ctx.stroke(UP);
  const T=under?T3(K.fU,cmix(K.fUd,K.fU,.5),K.fUd):mixT(K.cloak,K.gold,ug);ctx.fillStyle=grad3(bb,T);ctx.fill(UP);
  if(!under&&u<.95){// warmer toward the bottom; three rows of feathers on the outer face (scalloped bands, the lowest drawn first), their edges lit
    {const t=P(X.T(WN.SEC[1][1])),b=P(X.T(WN.SEC[3][1])),g=ctx.createLinearGradient(t[0],t[1],b[0],b[1]);g.addColorStop(0,'rgba(255,138,42,0)');g.addColorStop(1,K.blue?`rgba(140,200,255,${.6*(1-u)})`:`rgba(255,140,40,${.6*(1-u)})`);ctx.fillStyle=g;ctx.fill(UP)}
    if(fo>.08){const k0=cl((fo-.08)*4,0,1)*(1-sstep(.25,.7,u));ctx.save();ctx.globalAlpha*=k0;ctx.clip(UP);
      const at=(f,t)=>{const sg=Math.min(2,Math.floor(f*3)),k=f*3-sg,fr=lerp3(WN.SEC[sg][0],WN.SEC[sg+1][0],k),bk=lerp3(WN.SEC[sg][2],WN.SEC[sg+1][2],k),ou=lerp3(WN.SEC[sg][1],WN.SEC[sg+1][1],k),c=t<.5?lerp3(fr,ou,t*2):lerp3(ou,bk,(t-.5)*2);return P(X.T(add(c,mul(WN.Nn[sg],.6))))};
      const rows=[[.78,4,cmix(K.cloak.b,K.mant,.55)],[.52,4,cmix(K.cloak.b,K.mant,.22)],[.27,3,K.cloak.b]];
      for(const[f,nn,col] of rows){const top0=at(Math.max(0,f-.5),-.1),top1=at(Math.max(0,f-.5),1.1),edge=[];
        for(let i=0;i<=nn*4;i++){const t=i/(nn*4),lob=Math.pow(Math.sin(Math.PI*((i%4)/4)),.6),fq=f+.075*lob*(1-.3*t);edge.push(at(Math.min(1,fq+.04*t),lerp(-.05,1.05,t)))}
        ctx.beginPath();for(const q of edge)ctx.lineTo(q[0],q[1]);ctx.lineTo(top1[0],top1[1]);ctx.lineTo(top0[0],top0[1]);ctx.closePath();ctx.fillStyle=col;ctx.fill();
        ctx.beginPath();for(const q of edge)ctx.lineTo(q[0],q[1]);ctx.lineJoin='round';ctx.strokeStyle='rgba(30,4,8,.75)';ctx.lineWidth=1.5;ctx.stroke();
        ctx.beginPath();for(const q of edge)ctx.lineTo(q[0],q[1]-1.1);ctx.strokeStyle=K.blue?'rgba(220,240,255,.35)':'rgba(255,200,140,.35)';ctx.lineWidth=.9;ctx.stroke()}
      ctx.restore()}}
  if(!under){const hh=chull(all);if(hh.length>2)C.rimPoly(hh,.3)}
  // the edge of beaten gold wrapping the front of the wing, from the shoulder down to the hand (where the bones run); hidden when the front
  // of the wing turns away
  const fe=F(X.Rd(nrm(add(sub(WN.SEC[1][0],WN.SEC[1][2]),mul(WN.Nn[1],6)))));if(fe>-.15){ctx.save();ctx.globalAlpha*=cl((fe+.15)*4,0,1);const e=WN.SEC.map((sec,i)=>{const f=sec[0],a=lerp3(f,sec[1],.5),b=lerp3(f,sec[3],.42);return[P(X.T(a)),P(X.T(f)),P(X.T(b))]}),Q=[],R=[];
    for(let i=0;i<4;i++){Q.push(e[i][0]);R.push(e[i][2])}const sh=Q.concat(R.reverse());{ctx.lineJoin='round';smooth(sh);const g=ctx.createLinearGradient(e[0][1][0],e[0][1][1],e[3][1][0],e[3][1][1]);
    g.addColorStop(0,K.gold.l);g.addColorStop(.45,K.gold.b);g.addColorStop(1,K.gold.d);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
    ctx.strokeStyle='rgba(255,252,230,.7)';ctx.lineWidth=1;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<3;i++)ctx.lineTo(lerp(e[i][1][0],e[i][0][0],.4),lerp(e[i][1][1],e[i][0][1],.4));ctx.stroke();
    ctx.fillStyle=K.ham;dots([0,1,2].map(i=>[lerp(e[i][1][0],e[i+1][1][0],.5),lerp(e[i][1][1],e[i+1][1][1],.5)]),.7);ctx.fill()}ctx.restore()}
  return H}
// the whole wing: the feathers first (under the coverts: secondaries, then primaries from the wrist out), then the coverts; the light that
// runs along it, the fringe of fire of the second phase; returns the tips that carry a little flame
let J0={};
function wingDraw(V0,X,WN,sd,K,A,o){const{P,F}=V0,u=WN.u,ash=o.ash||0,heat=A.heat[sd<0?'w0':'w1']||0,lane=A.lane,gone=A.gone,grow=A.grow,out=[],tips=[];
  const laneOf=f=>f.p===1&&f.j<5?(sd<0?f.j:9-f.j):-1,un=F(X.Rd(WN.O.n))<0&&u>.5;
  // the shared gradients (a radial one round the wrist for the primaries, one across the forearm for the secondaries, one for the underside)
  const qW=P(X.T(WN.J[2])),f0=WN.F[0],qT=P(X.T(add(f0.b,mul(f0.d,f0.L)))),RP=Math.max(8,Math.hypot(qT[0]-qW[0],qT[1]-qW[1]));let gP,gS;
  if(un){gP=gS=fGrad(qW,qT,K.fUd,K.fU,cmix(K.fU,K.fM,.35),K.fE,ash,0)}
  else{gP=ctx.createRadialGradient(qW[0],qW[1],RP*.12,qW[0],qW[1],RP);gP.addColorStop(0,K.fR);gP.addColorStop(.45,K.fM);if(ash>.01){const e=1-ash;gP.addColorStop(Math.max(.5,e-.07),K.fT);gP.addColorStop(e,EMB);gP.addColorStop(Math.min(1,e+.05),ASH.l);gP.addColorStop(1,ASH.b)}else gP.addColorStop(1,K.fT);
    const s0=WN.F[9],s6=WN.F[15],qa=P(X.T(lerp3(s0.b,s6.b,.5))),qb=P(X.T(add(lerp3(s0.b,s6.b,.5),mul(nrm(lerp3(s0.d,s6.d,.5)),(s0.L+s6.L)/2))));gS=fGrad(qa,qb,K.fR,K.fM,K.fT,K.fE,ash,0)}
  // a feather's outline on the screen (root, outer vane, tip, inner vane), its tip
  const outl=(f,L,W,wo,wi,pa)=>{const b=X.T(f.b),d=X.Rd(f.d),s2=X.Rd(f.s),n=cross(d,s2),tip=add(add(b,mul(d,L)),mul(n,.05*L*.3)),mid=add(add(b,mul(d,L*.5)),mul(n,.05*L*.08)),B=P(b),Tq=P(tip),M1=P(add(mid,mul(s2,W*wo))),M2=P(add(mid,mul(s2,-W*wi)));
    pa.moveTo(B[0],B[1]);pa.quadraticCurveTo(M1[0],M1[1],Tq[0],Tq[1]);pa.quadraticCurveTo(M2[0],M2[1],B[0],B[1]);pa.closePath();return[B,Tq,M1]};
  // folded, the long primaries cross behind her: where they are behind the body they go under its outline (seen from the front)
  const behind=o.cut&&u<.5&&J0.body&&J0.body.path&&V0.D(X.T(add(WN.F[0].b,mul(WN.F[0].d,WN.F[0].L))))<V0.D(X.T(TC[1]))-2;
  if(behind){ctx.save();if(!J0.cutP){J0.cutP=new Path2D();J0.cutP.rect(-1e4,-1e4,2e4,2e4);J0.cutP.addPath(J0.body.path)}ctx.clip(J0.cutP,'evenodd')}
  // the feathers that are not lit nor gone: one outline and one fill for the secondaries, then for the primaries (folded: only the five long
  // tips, the rest is under the coverts); thin lines between them; the lit ones and the quills on their own, over them
  const solo=[],seps=[];
  for(const grp of[1,0]){const isP=grp===0,pa=new Path2D();let n=0;
    for(let k=isP?8:6;k>=0;k--){if(isP&&u<.2&&k>4)continue;if(!isP&&u<.2)continue;const f=WN.F[isP?k:9+k],li=laneOf(f),lit=li>=0&&lane?lane[li]:0,gn=li>=0&&gone?gone[li]:0,gw=li>=0&&grow?grow[li]:1,hk=Math.max(heat*(isP?1:.6),lit);
      if(gn>=1||hk>.05){solo.push({f,li,lit,gn,gw,hk,isP});continue}
      const r=outl(f,f.L*gw,isP?4:4.4,isP?1.1:1.2,isP?1.9:2,pa);n++;if(k>0)seps.push(r);if(isP&&f.j<3&&u>.25)out.push({q:r[1],a:sstep(.25,.6,u),ash});if(u>.5&&(isP||f.j%2===0))tips.push(r[1])}
    if(n){ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=3.4;ctx.stroke(pa);ctx.fillStyle=isP?gP:gS;ctx.fill(pa)}
    // the lines between the feathers (along each one's outer edge) and the light along the shafts of the primaries
    if(seps.length){ctx.beginPath();for(const[B,Tq,M1] of seps){ctx.moveTo(lerp(B[0],M1[0],.35),lerp(B[1],M1[1],.35));ctx.quadraticCurveTo(M1[0],M1[1],lerp(M1[0],Tq[0],.7),lerp(M1[1],Tq[1],.7))}ctx.strokeStyle=un?'rgba(10,2,4,.5)':'rgba(70,10,6,.62)';ctx.lineWidth=1.1;ctx.stroke();
      if(isP&&!un&&u>.5){ctx.beginPath();for(const[B,Tq] of seps){ctx.moveTo(lerp(B[0],Tq[0],.12),lerp(B[1],Tq[1],.12));ctx.lineTo(lerp(B[0],Tq[0],.8),lerp(B[1],Tq[1],.8))}ctx.strokeStyle='rgba(255,226,170,.32)';ctx.lineWidth=.8;ctx.stroke()}
      seps.length=0}}
  for(const z of solo){const f=z.f;if(z.gn>=1){// the quill left on the wing: the root of the feather, short and dark
      const tq=P(X.T(add(f.b,mul(f.d,f.L*.3))));ctx.strokeStyle=INK;ctx.lineWidth=3.6;ctx.lineCap='round';seg(P(X.T(f.b)),tq);ctx.stroke();ctx.strokeStyle=K.plum.d;ctx.lineWidth=1.8;ctx.stroke();continue}
    const tq=feather(V0,X.T(f.b),X.Rd(f.d),X.Rd(f.s),f.L*z.gw,z.isP?4:4.4,K,{wo:z.isP?1.1:1.2,wi:z.isP?1.9:2,ash,heat:z.hk,lw:z.isP?1.7:1.5,bend:.05,under:un});
    if(u>.5)tips.push(tq);if(z.isP&&f.j<3&&u>.25)out.push({q:tq,a:sstep(.25,.6,u)*(1+1.2*z.hk),ash})}
  if(behind)ctx.restore();
  slabDraw(V0,X,WN,sd,K,o);
  // the second phase: the remiges end in tongues of blue fire (one path along the trailing edge, one gradient)
  if(A.k2>.5&&u>.5&&!LOWFX&&tips.length>3){const c=qW,Q=tips.map(q=>[q[0]+(q[0]-c[0])*.12,q[1]+(q[1]-c[1])*.12]),t=(G.t||0)*9+sd;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=sstep(.5,.8,u)*(A.k2-.5)*2;const g=ctx.createRadialGradient(c[0],c[1],10,c[0],c[1],80);g.addColorStop(0,'rgba(240,251,255,.9)');g.addColorStop(.6,'rgba(159,224,255,.7)');g.addColorStop(1,'rgba(90,160,255,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(tips[0][0],tips[0][1]);for(let i=0;i<Q.length;i++){const q=Q[i],r=tips[i],f=1+.25*Math.sin(t+i*1.7);ctx.quadraticCurveTo(q[0]+(q[0]-r[0])*f*2.2,q[1]+(q[1]-r[1])*f*2.2-2,r[0],r[1])}ctx.closePath();ctx.fill();ctx.restore()}
  // the light running along it (from the shoulder to the tip of the longest primary)
  for(const r of A.runs)if(r.g===(sd<0?'w0':'w1')){const path=[X.T(WN.J[0]),X.T(WN.J[1]),X.T(WN.J[2]),X.T(WN.J[3]),X.T(add(WN.F[0].b,mul(WN.F[0].d,WN.F[0].L*(grow?grow[sd<0?0:9]:1)*.95)))].map(q=>P(q));runDraw(path,cl((r.k-.25)/.75,0,1),r.a,K)}
  return out}
// the light that runs (the warning before the blow): a bright thread from the start of the path to k (by length), a pearl of white light
// at its head; LOWFX: no glow, only the colour
function runDraw(path,k,al,K){if(k<=0||al<=.01)return;let Lt=0;const segs=[];for(let i=1;i<path.length;i++){const l=Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]);segs.push(l);Lt+=l}
  let left=Lt*k;const pts=[path[0]];for(let i=1;i<path.length&&left>0;i++){const l=segs[i-1];if(left>=l){pts.push(path[i]);left-=l}else{const t=left/l;pts.push([lerp(path[i-1][0],path[i][0],t),lerp(path[i-1][1],path[i][1],t)]);left=0}}
  ctx.save();ctx.globalAlpha*=al;ctx.lineCap='round';ctx.lineJoin='round';
  if(!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${K.fire},.45)`;ctx.lineWidth=5;ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.globalCompositeOperation='source-over'}
  ctx.strokeStyle=K.fE;ctx.lineWidth=1.8;ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.stroke();
  if(k<.995){const q=pts[pts.length-1];if(!LOWFX)shine(K.hot,q[0],q[1],10,.7);ctx.fillStyle='#ffffff';ball(q,2.4);ctx.fill()}ctx.restore()}

// ------------------------------------------------------------------ the model
function phoenix2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};anim=MV.includes(anim)?anim:'idle';const V0=V(face),{P,D,F}=V0,A=pPose(anim,p,o),fx=fxOn(o);
  const dive=anim==='dive'||anim==='redive',lift=dive?(o.z!=null?o.z/sc:A.zc||0):A.lift+(o.z||0)/sc;A.B[2]+=lift;
  const k2=A.k2,S2=1+.06*k2,ash=A.k2>.5&&anim==='rebirth'?0:cl(o.ash||0,0,.35),gy=A.gray||{},ag=A.ashAll||0;
  const K=pal(k2,Math.max(ag*.85,gy.body||0)),Kw=pal(k2,Math.max(ag*.85,gy.w||0)),Kt=pal(k2,Math.max(ag*.85,gy.tr||0)),Kh=pal(k2,Math.max(ag*.85,gy.head||0)),Kc=pal(k2,Math.max(ag*.85,gy.cr||0));
  const X=frame(A,30),vis=A.vis==null?1:A.vis;
  // the floor: the pool of light that follows her like a torch, the shadow (smaller when she flies)
  if(!LOWFX&&vis>0){const q=P(A.B[0],A.B[1],0);shine(K.pool,x+q[0]*sc,y+q[1]*sc,70*sc*S2,.16*vis*(A.mound?1-A.mound.fly:1),70*sc*S2*.55*C.KR())}
  if(vis>0&&A.bird>.02)floor(V0,x,y,sc*S2,[A.B[0],A.B[1],0],30,12,.42*vis,lift);
  ctx.save();ctx.translate(x,y);ctx.scale(sc*S2,sc*S2);const L=parts(),LB=parts(),J={fl:[]};
  // ---------------- the effects on the floor and the column of fire behind her (the entrance)
  if(A.col>=0&&fx)L.add(-2000,()=>columnDraw(V0,A.col,K,0));
  if(A.comet>0)L.add(-1900,()=>cometDraw(V0,X,A,K,0));
  if(fx)for(const e of A.fx)fxFloor(V0,X,L,e,A,K);
  if(A.egg&&A.egg.k>0)L.add(500,()=>eggDraw(V0,A,K));
  if(A.mound)L.add(480,()=>moundDraw(V0,A,K,fx));
  if(A.burst!=null&&A.burst>=0&&A.burst<1)L.add(990,()=>burstDraw(V0,A.burst,K,fx));
  // ---------------- the bird (as one picture while it turns into the egg or the mound)
  if(A.bird>.02&&vis>0){
    // the train: five long feathers on the floor behind her (seven in the second phase); in front of the legs when she turns her back
    const TS=trainSpines(X,A);J.TS=TS;const dTr=-500+(A.tr.whip>.3?D(TS.mid)-D(X.T([0,0,20])):D(X.T([-22,0,20])))*.1;
    LB.add(A.tr.whip>.3?(D(TS.mid)>D(X.T([0,0,20]))?150:-1000):dTr,()=>trainDraw(V0,X,A,Kt,o,ash,TS));
    // the legs (behind the body, the far one first)
    for(const sd of[-1,1])LB.add(-500+D(X.T([HIP[0],sd*HIP[1],HIP[2]]))*.1,()=>legDraw(V0,X,A,K,sd,lift));
    // the wings: behind the body, between the body and the head, or in front of the head, from the rest pose (the mantle on its flank) or,
    // open, from where the wrist is; the change is a short fade of the copy in front over the one behind, never a jump
    const chest=X.T(TC[0]),Hc=X.T(add(HC,[A.hx,0,A.hz-A.bob*.8]));J.Hc=Hc;
    for(const sd of[-1,1]){const w=sd<0?A.wL:A.wR,WN=wingNow(sd,w,A),m=1-sstep(.22,.42,WN.u),Wq=X.T(WN.J[2]);J['w'+sd]=WN;
      const fl=F(X.Rd([0,sd,0])),l1m=sstep(-.42,-.3,fl),l1o=sstep(-2.5,2.5,D(Wq)-D(chest)),l2o=sstep(-2.5,2.5,D(Wq)-D(Hc));
      const l1=m*l1m+(1-m)*l1o,l2=(1-m)*l2o,lev=l1+l1*l2,s0=Math.min(2,Math.floor(lev)),fr=s0>1?0:lev-s0,slot=[-700,100,300],dw=D(Wq)*.01;
      const draw=()=>{J0=J;const fl2=wingDraw(V0,X,WN,sd,Kw,A,{ash,cut:s0>0});J.fl.push(...fl2)};
      if(fr<.06||fr>.94||OCL>2)LB.add(slot[s0+(fr>=.5?1:0)]+dw,draw);
      else{let blit=null;LB.add(slot[s0]+dw,()=>{const pts=WN.J.map(q=>P(X.T(q)));for(let j=0;j<16;j+=3){const f=WN.F[j];pts.push(P(X.T(add(f.b,mul(f.d,f.L)))))}
          const b=bbox(pts),c=[(b[0]+b[2])/2,(b[1]+b[3])/2];blit=snap(sd<0?0:1,draw,c,Math.max(b[2]-b[0],b[3]-b[1])/2+12);blit(1)});LB.add(slot[s0+1]+dw,()=>{if(blit)blit(fr)})}}
    // the body: one volume, the armour of the chest, the neck, the gorget, the heart
    LB.add(0,()=>bodyDraw(V0,X,A,K,J));
    // the head (its own camera)
    LB.add(200,()=>headDraw(V0,X,A,Kh,Hc,face,ash,J,Kc));
    // the flames on the tips of the three longest remiges (the game's clock)
    LB.add(900,()=>{if(!fx)return;lickB(()=>{for(const f of J.fl)lick(f.q,2.6*(1-.6*f.ash/.35),Kw.fire,Kw.hot,Math.min(1,f.a),f.q[0]*.1)})});
    // the comet's fire over her shape
    if(A.comet>0)LB.add(950,()=>cometDraw(V0,X,A,K,1));
    if(A.bird<.99){const LBs=LB.slice();L.add(400,()=>fadeDraw(()=>run(LBs),P(X.T([0,0,50])),150,A.bird))}else for(const e of LB)L.push(e)}
  if(A.col>=0&&fx)L.add(2000,()=>columnDraw(V0,A.col,K,1));
  if(fx)for(const e of A.fx)fxAir(V0,X,L,e,A,K,J);
  run(L);ctx.restore()}

// the train: the spines of its feathers now (floor, whip, trail in flight, hanging, wrapped round her in the cocoon)
const TRA=[0,-13,13,-26,26].map(a=>a*Math.PI/180),TRL=[100,88,88,76,76],TRA2=[0,-11,11,-22,22,-33,33].map(a=>a*Math.PI/180),TRL2=[112,100,100,88,88,76,76];
function trainSpines(X,A){const T=A.tr,r0=X.T(TROOT),f=X.Rd([1,0,0]),fl=Math.hypot(f[0],f[1])||1,bk=[-f[0]/fl,-f[1]/fl,0],sideV=[-bk[1],bk[0],0],P2=A.k2>.5,AN=P2?TRA2:TRA,LN=P2?TRL2:TRL,n=AN.length,S=[];
  for(let i=0;i<n;i++){let ang=AN[i]*T.fan,Lf=LN[i]*T.lenK;
    // the whip: the feathers close into one straight lash at floor level reaching 135 from her middle (two lashes to her sides in the second
    // phase, 150)
    if(T.whip>0){const wa=T.whips>1?(AN[i]<0||(i===0&&false)?-Math.PI/2:Math.PI/2)+AN[i]*.06:AN[i]*.07,wl2=T.whips>1?149:119;ang=lerp(ang,wa,T.whip);Lf=lerp(Lf,wl2+(T.whips>1?0:-Math.abs(AN[i])*6),T.whip)}
    S.push(trainSpine(r0,bk,sideV,ang,Lf,T,i))}
  const c=S[0].pts[Math.floor(S[0].pts.length*.6)];return{S,r0,bk,sideV,mid:c,n}}
function trainSpine(r0,bk,sideV,ang,Lf,T,i){const N=9,pts=[],ws=[],dir=add(mul(bk,Math.cos(ang)),mul(sideV,Math.sin(ang))),lat=[-dir[1],dir[0],0],z0=r0[2];
  for(let k=0;k<=N;k++){const s=k/N,h=s*Lf;
    // on the floor: down to it 26 behind the root, along it with a soft S, rising at the end
    let z=(h<26?z0*Math.pow(1-h/26,2):0)+6*sstep(Lf-14,Lf,h),wv=4*Math.sin(Math.PI*2*h/Lf)*sstep(20,40,h)+T.wave*Math.sin(TAU*(h/60-T.wph))*sstep(10,50,h),hh=h,zz=z;
    let q=add(r0,add(mul(dir,hh),add(mul(lat,wv),[0,0,zz-z0])));
    if(T.whip>0){const zw=h<18?4+(z0-4)*Math.pow(1-h/18,2):4,qw=add(r0,add(mul(dir,h),[0,0,zw-z0]));q=lerp3(q,qw,T.whip)}
    if(T.trail>0){const zt=z0-h*.16-8*s*s+T.wave*.6*Math.sin(TAU*(s*1.2-T.wph)),qt=add(r0,add(mul(dir,h*.98),add(mul(lat,T.wave*.5*Math.sin(TAU*(s-T.wph))),[0,0,zt-z0])));q=lerp3(q,qt,T.trail)}
    if(T.hang>0){const qh=add(r0,add(mul(dir,h*.42),add(mul(lat,2*Math.sin(TAU*(s-T.wph))),[0,0,-h*.85])));q=lerp3(q,qh,T.hang)}
    if(T.wrap>0){const a0=Math.atan2(dir[1],dir[0])+(i%2?1:-1)*s*2.3,rr=lerp(18,28,s),qw=[r0[0]+16+Math.cos(a0)*rr,r0[1]+Math.sin(a0)*rr,lerp(z0,3,Math.min(1,s*2.2))];q=lerp3(q,qw,T.wrap)}
    pts.push(q);ws.push(s<.5?1.6:s<.8?lerp(1.6,4.4,(s-.5)/.3):lerp(4.4,2.6,(s-.8)/.2))}
  return{pts,ws,dir,lat}}
function trainDraw(V0,X,A,K,o,ash,TS){const{P}=V0,heat=A.heat.tr||0,veil=cl(o.veil||0,0,1),n=TS.n;
  const draw=()=>lickB(()=>{
    // the feathers as one shape: one outline round them all, one gradient from the root (they part a little from it)
    const pa=new Path2D(),r0=P(TS.r0);let R=8;
    for(let i=n-1;i>=0;i--){const{pts,ws,lat}=TS.S[i],m=pts.length,L1=[],R1=[];
      for(let k=0;k<m;k++){const q=pts[k];L1.push(P(add(q,mul(lat,ws[k]))));R1.push(P(add(q,mul(lat,-ws[k]))))}
      pa.addPath(smoothP(L1.concat(R1.reverse())));const t1=P(pts[m-1]);R=Math.max(R,Math.hypot(t1[0]-r0[0],t1[1]-r0[1]))}
    ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=2.8;ctx.stroke(pa);
    ctx.fillStyle=fStops(ctx.createRadialGradient(r0[0],r0[1],R*.05,r0[0],r0[1],R),K.trS,K.trM,K.trT,K.fE,ash,heat);ctx.fill(pa);
    // the eyes of flame at the tips: drops pointing to the tips, their golden rings, the white hearts
    const ak=ash/.35*.7*(1-heat),Dp=new Path2D(),Rg=new Path2D(),H=[],tips=[];
    for(let i=n-1;i>=0;i--){const{pts,lat}=TS.S[i],m=pts.length,tp=pts[m-1],d=nrm(sub(pts[m-1],pts[m-3])),e=add(tp,mul(d,-3.5)),a=P(add(e,mul(d,8))),b=P(add(e,mul(d,-4))),l=P(add(e,mul(lat,4.4))),r=P(add(e,mul(lat,-4.4))),c=P(e);
      Dp.moveTo(a[0],a[1]);Dp.bezierCurveTo(lerp(c[0],l[0],1.1)+(c[0]-a[0])*.1,lerp(c[1],l[1],1.1)+(c[1]-a[1])*.1,l[0]+(b[0]-c[0])*.9,l[1]+(b[1]-c[1])*.9,b[0],b[1]);
      Dp.bezierCurveTo(r[0]+(b[0]-c[0])*.9,r[1]+(b[1]-c[1])*.9,lerp(c[0],r[0],1.1)+(c[0]-a[0])*.1,lerp(c[1],r[1],1.1)+(c[1]-a[1])*.1,a[0],a[1]);Dp.closePath();
      const an=Math.atan2(a[1]-b[1],a[0]-b[0]);Rg.moveTo(c[0]+2.7*Math.cos(an),c[1]+2.7*Math.sin(an));Rg.ellipse(c[0],c[1],2.7,2,an,0,TAU);H.push(c);tips.push([a,i])}
    ctx.fillStyle=cmix(cmix(K.trEye,K.fE,heat*.4),ASH.b,ak);ctx.fill(Dp);ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke(Dp);
    ctx.strokeStyle=cmix(K.trRing,ASH.l,ak);ctx.stroke(Rg);ctx.fillStyle=cmix(K.trHeart,'#ffffff',heat);dots(H,1.2+.5*heat);ctx.fill();
    if(heat>.2&&!LOWFX)for(const c of H)shine(K.hot,c[0],c[1],7,.5*heat);
    if(!LOWFX&&!o.noFx&&(heat>.05||A.tr.floor>.5))for(const[a,i] of tips)lick(a,1.6+1.4*heat,K.fire,K.hot,(.45+.55*heat)*(1-.6*ash/.35),i+5);
    // three short coverts of beaten gold over the root (one shape, a thin line round the middle one)
    const r1=TS.r0,bk=TS.bk,sideV=TS.sideV,cp=new Path2D(),mp=new Path2D();let g0,g1;
    for(const j of[-1,1,0]){const d=nrm(add(mul(bk,Math.cos(j*.35)),add(mul(sideV,Math.sin(j*.35)),[0,0,-.55]))),s=nrm(cross([0,0,1],d)),b=add(r1,[0,0,2]),L=j?14:16,q=fPath(cp,P,b,d,s,L,2.6,1.3,2.1);
      if(!j){fPath(mp,P,b,d,s,L,2.6,1.3,2.1);g0=q[0];g1=q[1]}}
    ctx.strokeStyle=INK;ctx.lineWidth=3.2;ctx.stroke(cp);const gg=ctx.createLinearGradient(g0[0],g0[1],g1[0],g1[1]);gg.addColorStop(0,K.gold.d);gg.addColorStop(.48,K.gold.b);gg.addColorStop(1,K.gold.l);ctx.fillStyle=gg;ctx.fill(cp);
    ctx.strokeStyle='rgba(90,40,8,.75)';ctx.lineWidth=1;ctx.stroke(mp);
    // the light running down the train
    for(const r of A.runs)if(r.g==='tr')runDraw(TS.S[0].pts.map(q=>P(q)),cl((r.k-.2)/.8,0,1),r.a,K)});
  if(veil>.01)fadeDraw(draw,P(add(TS.r0,mul(TS.bk,50))),130,1-.6*veil);else draw()}

const fwN=X=>{const f=X.Rd([1,0,0]),l=Math.hypot(f[0],f[1])||1;return[f[0]/l,f[1]/l,0]};
// a leg: the hip on the body, the heel bending back (ik), the feathered trousers over the thigh, the golden scaled shank, the ring, the
// iron talons (three forward, one back)
function legDraw(V0,X,A,K,sd,lift){const{P,F}=V0,f=sd<0?A.fL:A.fR,tk=A.tuck,hip=X.T([HIP[0],sd*HIP[1],HIP[2]]);
  let ank=[f[0],f[1],f[2]+3+lift];if(tk>0)ank=lerp3(ank,X.T([-4,sd*9,16]),tk);
  const[heel,an]=ik(hip,ank,14,14.5,X.Rd([-1,0,.25])),fk=sstep(0,-.15,F(0,sd,0)),dk=T=>fk>0?mixT(T,T3(T.b,T.d,T.d),.3*fk):T;
  // the talons first (the shank covers their roots)
  const fd=nrm([fwN(X)[0],fwN(X)[1],0]),sd2=[-fd[1],fd[0],0],g=A.grip,hl=A.heat.lg||0,clw=hl>0?mixT(dk(K.claw),T3(K.fE,K.fT,K.fM),.7*hl):dk(K.claw);
  const toes=[[-.44,7],[0,7],[.44,7],[Math.PI,5]];
  {const T=toes.map(([a,Lt])=>{const dd=add(mul(fd,Math.cos(a)),mul(sd2,Math.sin(a))),b=add(an,[0,0,-2]),m=add(b,add(mul(dd,Lt*.55),[0,0,-1.2+1.5*(1-g)])),t=add(b,add(mul(dd,Lt*(.75+.25*g)),[0,0,-2.6+3.5*(1-g)]));return[P(b),P(m),P(t)]});
    const path=()=>{ctx.beginPath();for(const[b,m,t] of T){ctx.moveTo(b[0],b[1]);ctx.quadraticCurveTo(m[0],m[1],t[0],t[1])}};ctx.lineCap='round';ctx.lineJoin='round';
    path();ctx.strokeStyle=INK;ctx.lineWidth=4.4;ctx.stroke();ctx.strokeStyle=clw.b;ctx.lineWidth=2.4;ctx.stroke();ctx.strokeStyle=clw.l;ctx.lineWidth=.8;ctx.beginPath();for(const[b,m] of T){ctx.moveTo(b[0]-.4,b[1]-.6);ctx.lineTo(m[0]-.4,m[1]-.6)}ctx.stroke()}
  const tars=dk(K.tars);{const qh=P(heel),qa=P(an);ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=8.2;seg(qh,qa);ctx.stroke();ctx.strokeStyle=limbGrad(qh,qa,3,tars);ctx.lineWidth=5.6;ctx.stroke()}
  // three rings of scales, the spur behind
  {ctx.strokeStyle=K.scale;ctx.lineWidth=1;ctx.lineCap='round';const qh=P(heel),qa=P(an),dx=qa[0]-qh[0],dy=qa[1]-qh[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*2.6,ny=dx/l*2.6;ctx.beginPath();
    for(const t of[.3,.55,.8]){const cx=lerp(qh[0],qa[0],t),cy=lerp(qh[1],qa[1],t);ctx.moveTo(cx-nx,cy-ny);ctx.quadraticCurveTo(cx+dx/l*1.2,cy+dy/l*1.2,cx+nx,cy+ny)}ctx.stroke();
    const sp=lerp3(heel,an,.62),sb=P(sp),st=P(add(sp,add(mul(fd,-4),[0,0,-1])));ctx.fillStyle=K.gold.b;ctx.strokeStyle=INK;ctx.lineWidth=1.2;C.tri(sb[0],sb[1],st[0],st[1],1.3)}
  // the golden ring at the ankle
  {const ax=nrm(sub(an,heel)),[u,v]=frm(ax,[1,0,0]),r1=ringS(V0,add(an,mul(ax,-4.2)),u,v,3.4,12),r2=ringS(V0,add(an,mul(ax,-1.8)),u,v,3.3,12),H=chull(r1.concat(r2));poly(H);ctx.fillStyle=limbGrad(P(heel),P(an),3.4,K.gold);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke()}
  for(const r of A.runs)if(r.g==='lg')runDraw([hip,heel,an,add(an,mul(fd,7))].map(q=>P(q)),cl((r.k-.25)/.75,0,1),r.a,K);
  if(hl>.1&&!LOWFX){const q=P(an);shine(K.hot,q[0],q[1],9,.5*hl)}
  // the trousers: a soft feathered ellipsoid over the thigh, a hem of four scallops over the shank
  const cz=add(lerp3(hip,heel,.5),X.Rd([0,sd*1.2,0])),Fr={u:X.Rd([1,0,0]),v:X.Rd([0,1,0]),w:X.Rd([0,0,1])},pl=dk(K.plum);
  const hp=svol3(V0,ellSil(V0,cz,[9,7,9],Fr,null,14),pl,{lw:2.6,scr:1,rim:.24});
  {ctx.strokeStyle=pl.d;ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<4;i++){const t=(i-1.5)*.55,m=[Math.cos(t),Math.sin(t),-.5],c=add(cz,add(add(mul(Fr.u,m[0]*8),mul(Fr.v,m[1]*6)),mul(Fr.w,m[2]*8)));
      if(F(add(mul(Fr.u,m[0]),mul(Fr.v,m[1])))<.1)continue;const q=P(c);ctx.moveTo(q[0]+2.6,q[1]-1);ctx.arc(q[0],q[1]-1,2.6,0,Math.PI)}ctx.stroke()}}

// the body: the volume of three ellipsoids, the armour of feather scales on the chest and the belly of orange gold, the soft shadows, the
// neck, the gorget of ten scallops of beaten gold, the Heart of the Forge in its brooch
function bodyDraw(V0,X,A,K,J){const{P,F}=V0,pts=[];const br=1+.03*(A.breath||0);const TCc=TC,TRc=TR.map((r,i)=>i===0?[r[0]*br,r[1]*br,r[2]]:r);
  for(let i=0;i<3;i++)for(const q of ellSil(V0,TCc[i],TRc[i],null,X.T,14))pts.push(q);
  const hp=svol3(V0,hullE(pts,.08),K.plum,{lw:3,rim:.3,scr:1});J.body=hp;
  ctx.save();ctx.clip(hp.path);
  // the belly of orange gold and the armour of the chest (caps facing us)
  if(ellCap(V0,X,TCc[1],TRc[1],AXES,nrm([.75,0,-.55]),.78,28,{alv:.8,u:[0,0,1],ck:'bel'})){const b=bbox(hp);ctx.fillStyle=grad3([b[0],b[1]+(b[3]-b[1])*.4,b[2],b[3]],K.armor);ctx.fill()}
  if(ellCap(V0,X,TCc[0],TRc[0],AXES,nrm([1,0,-.05]),.72,32,{alv:1.05,u:[0,0,1],ck:'arm'})){const q=P(X.T([20,0,52]));ctx.fillStyle=C.soft(q[0]-8,q[1]-12,q[0],q[1],30,K.armor.b,.25,.3);ctx.fill();ctx.strokeStyle='rgba(90,20,10,.5)';ctx.lineWidth=1.2;ctx.stroke()}
  // the three rows of feather scales on the armour: arcs with a golden thread on their edge
  {const Ld=[];for(const[z,nn] of[[60,5],[52,6],[44,5]]){const se=(z-TCc[0][2])/TRc[0][2],ce=Math.sqrt(Math.max(0,1-se*se));for(let i=0;i<nn;i++){const t=(i-(nn-1)/2)*.24,m=[ce*Math.cos(t),ce*Math.sin(t),se],c=ellAt(TCc[0],TRc[0],AXES,m),n=X.Rd(ellN(TRc[0],AXES,m)),f=F(n);if(f<.2)continue;Ld.push([P(X.T(c)),f])}}
    ctx.lineCap='round';ctx.beginPath();for(const[q] of Ld){ctx.moveTo(q[0]+3.6*Math.cos(.3),q[1]-2+3.6*Math.sin(.3));ctx.arc(q[0],q[1]-2,3.6,.3,Math.PI-.3)}ctx.strokeStyle=K.armor.d;ctx.lineWidth=1.5;ctx.stroke();
    ctx.beginPath();for(const[q] of Ld){ctx.moveTo(q[0]+3.6*Math.cos(.45),q[1]-1.2+3.6*Math.sin(.45));ctx.arc(q[0],q[1]-1.2,3.6,.45,Math.PI-.45)}ctx.strokeStyle=K.thread;ctx.lineWidth=.8;ctx.stroke()}
  // scallops of feathers on the back and the flanks (only what faces us)
  {const Ld=[];for(const[e,ts] of[[.55,[2.3,2.8,3.3,3.8]],[.15,[1.7,2.2,2.7,3.2,3.7,4.2]],[-.25,[2.1,2.6,3.6,4.1]]])for(const t of ts){const m=[Math.cos(e)*Math.cos(t),Math.cos(e)*Math.sin(t),Math.sin(e)],ci=e>.3?2:e<-.1?1:0,n=X.Rd(ellN(TRc[ci],AXES,m)),f=F(n);if(f<.25)continue;Ld.push(P(X.T(ellAt(TCc[ci],TRc[ci],AXES,m))))}
    ctx.beginPath();for(const q of Ld){ctx.moveTo(q[0]+4,q[1]-2);ctx.arc(q[0],q[1]-2,4,0,Math.PI)}ctx.strokeStyle=K.plum.d;ctx.lineWidth=1.3;ctx.stroke()}
  // the soft shadow of the gorget and of the head on the chest
  {const q=P(X.T([18,0,62])),g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],18);g.addColorStop(0,'rgba(40,6,10,.35)');g.addColorStop(1,'rgba(40,6,10,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(q[0],q[1],18,0,TAU);ctx.fill()}
  ctx.restore();
  // the neck (mostly hidden by the gorget)
  {const N=NK.map(q=>X.T(q));chain(V0,N,NKR,K.plum.b,{lw:2.6,fill:limbGrad(P(N[0]),P(N[2]),9,K.plum),rim:.2})}
  gorgetDraw(V0,X,A,K);
  heartDraw(V0,X,A,K,J);
  // the light leaving the heart (the first stretch of each run: to the shoulders, down to the train and the legs, up the neck)
  if(A.runs.length&&J.heartQ){const h=X.T(ellAt(TC[0],TR[0],AXES,nrm([.94,0,.32])));for(const r of A.runs){let path=null;
      if(r.g==='w0'||r.g==='w1'){const sd=r.g==='w0'?-1:1;path=[h,X.T([16,sd*11,64]),X.T([SHO[0],sd*SHO[1],SHO[2]])]}
      else if(r.g==='tr')path=[h,X.T([20,0,40]),X.T([4,0,24]),X.T(TROOT)];else if(r.g==='lg')path=[h,X.T([18,0,38]),X.T([2,0,30])];else if(r.g==='hd')path=[h,X.T(NK[0]),X.T(NK[1]),X.T(NK[2])];
      if(path)runDraw(path.map(q=>P(q)),cl(r.k/.25,0,1),r.a*(r.k<.3?1:1-sstep(.3,.45,r.k)),K)}}}
// the gorget: ten scallops of beaten gold round the base of the neck (one path, a dark line between the scallops)
function gorgetDraw(V0,X,A,K){const{P,F}=V0,c=X.T(GC),n=X.Rd(nrm([Math.sin(GTL),0,Math.cos(GTL)])),u=X.Rd(nrm([Math.cos(GTL),0,-Math.sin(GTL)])),v=X.Rd([0,1,0]),N=10,M=4,out=[],inn=[];
  for(let i=0;i<N*M;i++){const t=i/(N*M)*TAU,lob=Math.sin(Math.PI*((i%M)/M)),r=GRR+3.2*lob,dr=add(mul(u,Math.cos(t)),mul(v,Math.sin(t))),fr=Math.max(0,Math.cos(t));out.push(P(add(add(c,mul(dr,r)),mul(n,-2.2*lob-2.4*fr*lob))))}
  for(let i=0;i<20;i++){const t=-i/20*TAU,dr=add(mul(u,Math.cos(t)),mul(v,Math.sin(t)));inn.push(P(add(c,add(mul(dr,8),mul(n,1.5)))))}
  const b=bbox(out);ctx.lineJoin='round';smooth(out);ctx.fillStyle=grad3(b,K.gold);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.stroke();
  // the lines between the scallops (only on the side facing us)
  ctx.strokeStyle='rgba(90,40,8,.7)';ctx.lineWidth=1.1;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<N;i++){const t=i/N*TAU,dr=add(mul(u,Math.cos(t)),mul(v,Math.sin(t)));if(F(dr)<-.2)continue;const a=P(add(c,add(mul(dr,10),mul(n,.8)))),e=P(add(add(c,mul(dr,GRR+.4)),mul(n,-.5)));ctx.moveTo(a[0],a[1]);ctx.lineTo(e[0],e[1])}ctx.stroke();
  // the hammer marks and a light on the top edge
  {const Q=[];for(let i=0;i<N;i++){const t=(i+.5)/N*TAU,dr=add(mul(u,Math.cos(t)),mul(v,Math.sin(t)));if(F(dr)<0)continue;Q.push(P(add(c,add(mul(dr,12.5),mul(n,-.2)))))}ctx.fillStyle=K.ham;dots(Q,.7);ctx.fill()}}
// the Heart of the Forge: a vertical rhombus of light in a thin gold mount with four studs, on the chest under the front of the gorget
function heartDraw(V0,X,A,K,J){const{P,F}=V0,m=HM,c=X.T(ellAt(TC[0],TR[0],AXES,nrm([.94,0,.32]))),n=X.Rd(ellN(TR[0],AXES,nrm([.94,0,.32]))),f=F(n);if(f<-.15)return;
  const up0=X.Rd([0,0,1]),side=nrm(cross(up0,n)),up=cross(n,side),bt=1+.35*A.heart,at=(a,b,h)=>add(c,add(add(mul(side,a),mul(up,b)),mul(n,h||0)));
  ctx.save();ctx.globalAlpha*=cl((f+.15)*4,0,1);
  const rh=(w,h,z)=>[at(0,h,z),at(w,0,z),at(0,-h,z),at(-w,0,z)].map(q=>P(q));
  const mo=rh(4.6,6.4,.6);poly(mo);ctx.fillStyle=grad3(bbox(mo),K.gold);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke();
  const L=rh(3*bt,4.5*bt,1.2),q=P(at(0,0,1.2));poly(L);const g=ctx.createRadialGradient(q[0],q[1]-.5,.3,q[0],q[1],5.5*bt);g.addColorStop(0,K.h0);g.addColorStop(.45,K.h1);g.addColorStop(1,K.h2);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='rgba(120,40,8,.6)';ctx.lineWidth=.8;ctx.stroke();
  ctx.fillStyle=K.gold.l;dots(mo.map(s=>[s[0]*.85+q[0]*.15,s[1]*.85+q[1]*.15]),.9);ctx.fill();
  ctx.restore();J.heartQ=q;J.heartF=f;
  if(!LOWFX&&f>-.05)shine(K.hglow,q[0],q[1],16*A.hg*(.9+.25*A.heart),(.22+.45*A.heart)*cl((f+.05)*4,0,1))}

// the head: its own camera (it turns toward you by itself and stays still in space while the body breathes and pitches, as a falcon's)
function headDraw(V0,X,A,K,Hc,face,ash,J,Kc){Kc=Kc||K;const{P,F}=V0,hy=A.hy+cheat(face,.32),hp=A.hp,HR=v=>rotZ(rotY(rotX(v,A.hr||0),hp),hy),T=q=>add(Hc,HR(q)),fwd=F(HR([1,0,0]));
  const E=m=>ellAt([0,0,0],HRD,AXES,m),EN=m=>HR(ellN(HRD,AXES,m));
  // the far brow behind the skull (it never goes over its eye)
  const BR=[-1,1].map(sd=>{const a=nrm([.86,sd*.2,.24-.12*A.squint-.06*A.brow]),b=nrm([.52,sd*.72,.42]),f=F(EN(nrm(lerp3(a,b,.5))));return{sd,a,b,f}});
  for(const w of BR)if(w.f<.12)browDraw(V0,T,HR,w,A,K,null);
  const bk=sstep(-.3,.02,fwd);if(bk<.99)beakDraw(V0,T,HR,A,K);
  // the crown of sun of the second phase: behind the head when she looks at us, in front of it when she turns her back (a short fade)
  const sk0=sstep(-.12,.12,fwd);if(A.sun>.01||A.sunBreak>=0){if(sk0>.01)ga(sk0,()=>sunDraw(V0,T,HR,A,K));}
  const sk=svol3(V0,ellSil(V0,[0,0,0],HRD,null,T,16),K.plum,{lw:2.8,rim:.3,scr:1});
  ctx.save();ctx.clip(sk.path);
  // feathers of the head: a few dark scallops on the crown and the nape
  {const Ld=[];for(const[t,e] of[[2.4,.5],[2.9,.35],[3.4,.5],[-2.4,.5],[-2.9,.35],[1.9,.75],[-1.9,.75],[2.6,.85],[-2.6,.85],[3.14,.75]]){const m=[Math.cos(e)*Math.cos(t),Math.cos(e)*Math.sin(t),Math.sin(e)];if(F(EN(m))<.2)continue;Ld.push(P(T(E(m))))}
    ctx.beginPath();for(const q of Ld){ctx.moveTo(q[0]+3,q[1]-1);ctx.arc(q[0],q[1]-1,3,0,Math.PI)}ctx.strokeStyle=K.plum.d;ctx.lineWidth=1.2;ctx.stroke()}
  // the falcon's mask: a dark band from the root of the beak to behind the eyes
  band(V0,HR,T,t=>.36-.12*(t/1.95)*(t/1.95),t=>-.3+.1*(t/1.95)*(t/1.95),-1.95,1.95,11,K.mask,K.maskE);
  // the diadem of beaten gold, seven scales, from the forehead to the sides; its hammer marks
  band(V0,HR,T,t=>1.08,t=>.74-.09*Math.abs(Math.sin((t+1.25)/2.5*7*Math.PI)),-1.25,1.25,14,null,INK,K.gold);
  {const Q=[];for(const t of[-1,-.62,-.3,.3,.62,1]){const m=[Math.cos(.92)*Math.cos(t),Math.cos(.92)*Math.sin(t),Math.sin(.92)];if(F(EN(m))<.15)continue;Q.push(P(T(mul(E(m),1.01))))}ctx.fillStyle=K.ham;dots(Q,.65);ctx.fill()}
  // the soft shadow of the brows over the eyes
  if(fwd>-.3){const q=P(T([10.5,0,4.5])),g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],13);g.addColorStop(0,'rgba(10,0,4,.28)');g.addColorStop(1,'rgba(10,0,4,0)');ctx.fillStyle=g;ctx.fillRect(q[0]-14,q[1]-14,28,28)}
  ctx.restore();
  // the eyes: incandescent white gold almonds with a gold ring and the point of light; the slit only when she judges you
  eyesDraw(V0,T,HR,A,K);
  // the near brows of gold in a V, over the top of the eyes
  for(const w of BR)if(w.f>=.12)browDraw(V0,T,HR,w,A,K,1);
  // the beak
  if(bk>.01)ga(bk,()=>beakDraw(V0,T,HR,A,K));
  // the eye of the gods on the diadem
  {const m=nrm([.55,0,.84]),f=F(EN(m));if(f>.05){const c=T(mul(E(m),1.03)),q=P(c),gk=A.gem||0;ctx.save();ctx.globalAlpha*=cl((f-.05)*4,0,1);
    if(!LOWFX)shine(K.gglow,q[0],q[1],8+7*gk,.22+.55*gk);ctx.beginPath();ctx.moveTo(q[0]-3,q[1]);ctx.quadraticCurveTo(q[0],q[1]-2.6,q[0]+3,q[1]);ctx.quadraticCurveTo(q[0],q[1]+2.6,q[0]-3,q[1]);ctx.closePath();
    ctx.fillStyle=C.soft(q[0]-1,q[1]-1,q[0],q[1],3.2,cmix(K.gem.b,K.gem.l,gk*.6),.4,.3);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke();
    ctx.fillStyle=K.gpup;ctx.beginPath();ctx.ellipse(q[0],q[1]+.1,.6,1.2,0,0,TAU);ctx.fill();ctx.fillStyle='#ffffff';ball([q[0]-1,q[1]-.6],.45);ctx.fill();ctx.restore()}}
  crownDraw(V0,T,HR,A,Kc,ash);
  if((A.sun>.01||A.sunBreak>=0)&&sk0<.99)ga(1-sk0,()=>sunDraw(V0,T,HR,A,K));
  // the trails of the eyes (second phase), longer when she judges you
  if(A.k2>.5&&!LOWFX&&fwd>-.2){const tl=8*(1+1.5*(A.trailK||0));ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
    for(const sd of[-1,1]){const m=nrm([.8,sd*.52,.04]),f=F(HR(ellN(HRD,AXES,m)));if(f<.15)continue;const c=mul(ellAt([0,0,0],HRD,AXES,m),1.02),q0=P(T(c)),q1=P(T(add(c,[-tl,sd*tl*.35,tl*.12])));
      const g=ctx.createLinearGradient(q0[0],q0[1],q1[0],q1[1]);g.addColorStop(0,`rgba(${K.trail},.8)`);g.addColorStop(1,`rgba(${K.trail},0)`);ctx.strokeStyle=g;ctx.lineWidth=2.6;seg(q0,q1);ctx.stroke()}ctx.restore()}
  // the white flash of the eyes (they open, she aims)
  if(A.eflash>0&&!LOWFX){for(const sd of[-1,1]){const m=nrm([.8,sd*.52,.04]),f=F(HR(ellN(HRD,AXES,m)));if(f<.1)continue;const q=P(T(mul(ellAt([0,0,0],HRD,AXES,m),1.02)));shine('255,255,255',q[0],q[1],16,.9*A.eflash)}}
  for(const r of A.runs)if(r.g==='hd'){const m=nrm([.8,.52,.04]);runDraw([P(T([-10,0,-9])),P(T([0,0,-3])),P(T(mul(ellAt([0,0,0],HRD,AXES,m),1.02))),P(T(mul(ellAt([0,0,0],HRD,AXES,nrm([.55,0,.84])),1.05)))],cl((r.k-.25)/.75,0,1),r.a,K)}
  J.headQ=P(Hc)}
// the crown of sun (second phase): ten tongues of blue fire on a ring of radius 20 behind the head (6 behind its middle), one path with one
// gradient, turning slowly with the game's clock; it breaks into sparks when she is defeated. LOWFX: still
function sunDraw(V0,T,HR,A,K){const{P}=V0,c=[-6,0,3],t=LOWFX?0:(G.t||0)*.5,N=10,on=A.sunOn,br=A.sunBreak,fl=1+.35*(A.sunFl||0),ks=A.sun;
  const at=(a,r)=>P(T(add(c,[0,Math.cos(a)*r,Math.sin(a)*r])));
  if(br>=0&&br<1){if(LOWFX)return;ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<N*2;i++){const a=i/(N*2)*TAU+t,q=at(a,20+br*30);ctx.fillStyle=`rgba(200,240,255,${1-br})`;ball(q,1.6*(1-br)+.4);ctx.fill()}ctx.restore();return}
  if(ks<=.01)return;const q0=P(T(c));ctx.save();if(!LOWFX)ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=Math.min(1,ks);
  const g=ctx.createRadialGradient(q0[0],q0[1],8,q0[0],q0[1],30*fl);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.55,'rgba(200,240,255,.85)');g.addColorStop(.85,'rgba(159,224,255,.6)');g.addColorStop(1,'rgba(159,224,255,0)');ctx.fillStyle=g;
  ctx.beginPath();for(let i=0;i<N;i++){const a0=i/N*TAU+t,a1=a0+TAU/N*.5,a2=a0+TAU/N,o2=on?on[i]:1,h=(20+(7+2*Math.sin((G.t||0)*6+i*1.9))*o2)*fl;
    const b0=at(a0,15),tip=at(a1+.12*Math.sin((G.t||0)*4+i),h),b1=at(a2,15),m0=at(a0+TAU/N*.2,17+(h-17)*.5);if(i===0)ctx.moveTo(b0[0],b0[1]);ctx.quadraticCurveTo(m0[0],m0[1],tip[0],tip[1]);ctx.quadraticCurveTo(at(a1+TAU/N*.3,17)[0],at(a1+TAU/N*.3,17)[1],b1[0],b1[1])}
  ctx.closePath();ctx.fill();ctx.restore()}
// a brow: a plate of beaten gold from the inner end (low, over the beak) to the outer end (high), standing a little out of the skull
function browDraw(V0,T,HR,w,A,K,near){const{P,F}=V0,ea=ellAt([0,0,0],HRD,AXES,w.a),eb=ellAt([0,0,0],HRD,AXES,w.b),na=ellN(HRD,AXES,w.a),nb=ellN(HRD,AXES,w.b),up=[0,0,1];
  const ua=nrm(sub(up,mul(na,dot(up,na)))),ub=nrm(sub(up,mul(nb,dot(up,nb)))),pts=[add(add(ea,mul(na,2.2)),mul(ua,1.7)),add(add(eb,mul(nb,2)),mul(ub,2)),add(add(eb,mul(nb,1)),mul(ub,-1.2)),add(add(ea,mul(na,1.5)),mul(ua,-1.9))].map(q=>P(T(q)));
  ctx.save();if(!near)ctx.globalAlpha*=cl(w.f*4+.6,0,1);ctx.lineJoin='round';poly(pts);ctx.fillStyle=cmix(K.gold.b,K.gold.d,.3);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke();
  ctx.strokeStyle='rgba(255,252,230,.8)';ctx.lineWidth=.9;seg([lerp(pts[0][0],pts[3][0],.2),lerp(pts[0][1],pts[3][1],.2)],[lerp(pts[1][0],pts[2][0],.2),lerp(pts[1][1],pts[2][1],.2)]);ctx.stroke();ctx.restore()}
// a band painted on the head (the mask, the diadem): between the upper and the lower edge (elevations as functions of the azimuth t),
// only where it faces us; col fills it, line strokes its edge, G3 (gold) paints it in three tones
function band(V0,HR,T,eu,el,t0,t1,N,col,line,G3){const{P,F}=V0,runs=[];let cur=[];
  for(let i=0;i<=N;i++){const t=lerp(t0,t1,i/N),a=eu(t),b=el(t),mu=[Math.cos(a)*Math.cos(t),Math.cos(a)*Math.sin(t),Math.sin(a)],ml=[Math.cos(b)*Math.cos(t),Math.cos(b)*Math.sin(t),Math.sin(b)],mm=nrm(add(mu,ml)),f=F(HR(ellN(HRD,AXES,mm)));
    if(f>-.05)cur.push([P(T(mul(ellAt([0,0,0],HRD,AXES,mu),1.01))),P(T(mul(ellAt([0,0,0],HRD,AXES,ml),1.01)))]);else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
  for(const r of runs){if(r.length<2)continue;ctx.beginPath();for(const s of r)ctx.lineTo(s[0][0],s[0][1]);for(let i=r.length-1;i>=0;i--)ctx.lineTo(r[i][1][0],r[i][1][1]);ctx.closePath();
    if(G3){const bb=bbox(r.map(s=>s[0]).concat(r.map(s=>s[1])));ctx.fillStyle=grad3(bb,G3)}else ctx.fillStyle=col;ctx.fill();ctx.lineJoin='round';ctx.strokeStyle=line;ctx.lineWidth=G3?1.3:1.2;ctx.stroke()}}
function eyesDraw(V0,T,HR,A,K){const{P,F}=V0;
  for(const sd of[-1,1]){const m=nrm([.8,sd*.52,.04]),n0=ellN(HRD,AXES,m),f=F(HR(n0));if(f<.1)continue;const c=mul(ellAt([0,0,0],HRD,AXES,m),1.01);
    // the eye's own axes on the surface: along (toward the back of the head) and up; the outer corner goes up 12°
    let eu=nrm(cross([0,0,1],n0));if(eu[0]>0)eu=mul(eu,-1);const ev=nrm(cross(eu,n0))[2]<0?mul(nrm(cross(eu,n0)),-1):nrm(cross(eu,n0));
    const ca=Math.cos(.21),sa=Math.sin(.21),eA=add(mul(eu,ca),mul(ev,sa)),eB=add(mul(ev,ca),mul(eu,-sa)),op=A.blink*(1-.42*A.squint),pts=[];
    for(let i=0;i<16;i++){const t=i/16*TAU,s=Math.sin(t),xx=3.5*Math.cos(t),yy=2.2*s*(.3+.7*Math.pow(Math.abs(s),1.2))*Math.max(.1,op)+(s>0?0:.4*(1-op));pts.push(P(T(add(c,add(mul(eA,xx),mul(eB,yy))))))}
    ctx.save();ctx.globalAlpha*=cl((f-.1)*5,0,1);const q=P(T(c)),on=A.eyeOn==null?1:A.eyeOn;
    if(!LOWFX&&op>.2&&on>.1)shine(K.eglow,q[0],q[1],10,(.32+.1*(A.glow-.85))*on*Math.min(1,f*2));
    poly(pts);const gy=A.eyeGrey||0,g=ctx.createRadialGradient(q[0]-.4,q[1]-.3,.2,q[0],q[1],3.1);g.addColorStop(0,cmix('#ffffff','#d8d4ce',gy));g.addColorStop(.55,cmix(K.eye,'#c8c4be',gy));g.addColorStop(1,cmix(K.ring,'#9a948c',gy));ctx.fillStyle=g;ctx.fill();
    if(on<1&&!(A.eyeGrey>0)){ctx.fillStyle=`rgba(${K.blue?'12,20,56':'46,10,16'},${1-on})`;ctx.fill()}
    ctx.strokeStyle=K.ring;ctx.lineWidth=1.2;ctx.lineJoin='round';ctx.stroke();ctx.strokeStyle=INK;ctx.lineWidth=.6;ctx.stroke();
    if(A.slit>.02&&op>.3){ctx.save();ctx.globalAlpha*=A.slit;const s0=P(T(add(c,mul(eB,1.7*op)))),s1=P(T(add(c,mul(eB,-1.7*op))));ctx.strokeStyle=K.slit;ctx.lineWidth=1.3;ctx.lineCap='round';seg(s0,s1);ctx.stroke();ctx.restore()}
    if(op>.45&&(on>.3||A.eyeGrey>.5)){const lq=P(T(add(c,add(mul(eA,1),mul(eB,.8*op)))));ctx.fillStyle='#ffffff';ball(lq,.75);ctx.fill()}
    ctx.restore()}}
// the hooked beak: two side faces of the upper mandible (ridge to cutting edge), the cere of gold with the nostril, the burnished tip; the
// lower mandible opens (up to 25°) on the dark throat with the white fire in it; no teeth
const BKX=[13,17,21,24.5,28,31],BKR=[6,6,5,3,-.6,-6.8],BKT=[-4.6,-4.8,-4.6,-4.2,-4.1,-6.8],BKW=[5.4,4.9,3.9,2.6,1.3,0];
function beakDraw(V0,T,HR,A,K){const{P,F}=V0,ja=A.jaw*.44;
  // the lower mandible, turned down round its hinge
  const HG=[13,0,-3],rj=q=>add(HG,rotY(sub(q,HG),ja)),lo=[[12.5,4.4,-4.4],[17,3.8,-4.6],[21.5,2.2,-4.8],[24.5,0,-5.4],[21.5,-2.2,-4.8],[17,-3.8,-4.6],[12.5,-4.4,-4.4]].map(q=>rj(q)),lob=[[13,0,-8],[18.5,0,-7.6],[22.5,0,-6.6]].map(q=>rj(q));
  if(A.jaw>.03){// the throat: dark, the white fire deep inside
    const th=[[12.5,4.2,-4.3],[20,3.2,-4.2],[25,0,-4.2],[20,-3.2,-4.2],[12.5,-4.2,-4.3]].concat(lo.slice().reverse()).map(q=>P(T(q)));poly(th);ctx.fillStyle=K.throat;ctx.fill();
    const q=P(T([14.5,0,-4.8]));if(!LOWFX)shine(K.hot,q[0],q[1],7,.6*cl(A.jaw*2,0,1));ctx.fillStyle=`rgba(255,250,235,${.85*cl(A.jaw*2,0,1)})`;ball(q,1.5);ctx.fill()}
  {const Q=lo.concat(lob.slice().reverse()).map(q=>P(T(q))),H=chull(Q);poly(H);ctx.fillStyle=grad3(bbox(H),T3(K.beak.b,K.beak.d,K.btip));ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.7;ctx.lineJoin='round';ctx.stroke()}
  // the upper mandible: the side faces that look at us, the far one first
  const ridge=BKX.map((x,i)=>[x,0,BKR[i]]),side=sd=>BKX.map((x,i)=>[x,sd*BKW[i],BKT[i]]);
  const faces=[-1,1].map(sd=>({sd,pts:ridge.concat(side(sd).reverse()),f:F(HR(nrm([.2,sd*1,.4])))})).sort((a,b)=>a.f-b.f);
  for(const fc of faces){if(fc.f<-.4)continue;const Q=fc.pts.map(q=>P(T(q)));ctx.beginPath();for(const q of Q)ctx.lineTo(q[0],q[1]);ctx.closePath();
    const bb=bbox(Q);ctx.fillStyle=grad3(bb,K.beak);ctx.fill();
    // the burnished tip: the last stretch of the face, dark
    {const n=BKX.length,tp=[fc.pts[n-3],fc.pts[n-2],fc.pts[n-1],fc.pts[n],fc.pts[n+1],fc.pts[n+2]].map(q=>P(T(q)));ctx.fillStyle=K.btip;poly(tp);ctx.fill()}
    ctx.beginPath();for(const q of Q)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.lineJoin='round';ctx.stroke()}
  // the light along the ridge, the crease along the side
  {const R=ridge.slice(0,4).map(q=>P(T(add(q,[0,0,-.4]))));ctx.strokeStyle='rgba(255,246,220,.65)';ctx.lineWidth=1.1;ctx.lineCap='round';ctx.beginPath();for(const q of R)ctx.lineTo(q[0],q[1]);ctx.stroke()}
  ctx.beginPath();for(const sd of[-1,1]){if(F(HR([0,sd,0]))<.2)continue;const cr=[[16,sd*3.4,.6],[20,sd*2.6,-.6],[23.5,sd*1.4,-2.2]].map(q=>P(T(q)));ctx.moveTo(cr[0][0],cr[0][1]);for(const q of cr)ctx.lineTo(q[0],q[1])}ctx.strokeStyle='rgba(110,50,10,.6)';ctx.lineWidth=.9;ctx.stroke();
  // the cere of gold with the nostril
  {const ce=[[12,0,5],[15.3,0,5.2],[15.3,3.8,1.8],[15.3,5,-3.6],[12,5.2,-3.8],[12,-5.2,-3.8],[15.3,-5,-3.6],[15.3,-3.8,1.8]].map(q=>P(T(q)));const H=chull(ce);poly(H);ctx.fillStyle=grad3(bbox(H),K.gold);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
    ctx.beginPath();for(const sd of[-1,1]){if(F(HR([0,sd,0]))<.1)continue;const q=P(T([14,sd*4,-.4]));ctx.moveTo(q[0]+1,q[1]);ctx.ellipse(q[0],q[1],1,.65,0,0,TAU)}ctx.fillStyle=K.nost;ctx.fill()}}
// the crown: five plumes of flame from the top of the nape, up and back (the middle one the longest), springing a little behind the head;
// a drop of fire and a little flame at each tip
const CRA=[-48,-24,0,24,48].map(a=>a*Math.PI/180),CRL=[12,18,24,18,12];
function crownDraw(V0,T,HR,A,K,ash){let G0=null;const{P,F}=V0,P2=A.k2>.5,kL=(1+.25*A.k2)*(A.crownK||1),sq=A.cSq||0,lag=A.cLag||0,tips=[];lickB(()=>{
  for(const i of[0,4,1,3,2]){const a=CRA[i]*(1-.3*sq),Lc=CRL[i]*kL*(1+.2*(A.cFl||0)),root=nrm([-.18,Math.sin(a)*.6,1]),b=mul(ellAt([0,0,0],HRD,AXES,root),.92),on=A.cOn?A.cOn[i]:1;
    const d0=nrm([-.42-.6*sq-lag,Math.sin(a)*.9,1-.5*sq]),pts=[],ws=[];for(let k=0;k<=4;k++){const s=k/4,bend=nrm(add(d0,[-.35*s*s-lag*s,0,-.15*s*s])),q=add(b,mul(bend,Lc*s));pts.push(P(T(q)));ws.push(s<.15?1+s*6:s<.6?lerp(1.9,3.1,(s-.15)/.45):lerp(3.1,.2,(s-.6)/.4))}
    const Lq=[],Rq=[];for(let k=0;k<pts.length;k++){const a0=pts[Math.max(0,k-1)],a1=pts[Math.min(pts.length-1,k+1)],dx=a1[0]-a0[0],dy=a1[1]-a0[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;Lq.push([pts[k][0]+nx*ws[k],pts[k][1]+ny*ws[k]]);Rq.push([pts[k][0]-nx*ws[k],pts[k][1]-ny*ws[k]])}
    const Q=Lq.concat(Rq.reverse());ctx.lineJoin='round';smooth(Q);const cT=on<1?cmix(K.ember,K.fT,on):K.fT,cM=on<1?cmix(K.ember,K.fM,on):K.fM;
    if(on>=.99&&!(A.heat.hd>0)){if(!G0){const r0=P(T([-2,0,10])),r1=P(T([-8,0,10+24*kL]));G0=fGrad(r0,r1,K.fR,K.fM,K.fT,K.fE,ash*.9,0)}ctx.fillStyle=G0}else ctx.fillStyle=fGrad(pts[0],pts[pts.length-1],K.fR,cM,cT,K.fE,ash*.9,A.heat.hd||0);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
    const tq=pts[pts.length-1];if(on>.3){tips.push(tq);lick(tq,2.2*(1-.6*ash/.35)*(1+.5*(A.cFl||0)),K.fire,K.hot,on,i)}}
  if(tips.length){ctx.fillStyle=cmix(K.fT,'#ffffff',.5);dots(tips,1.1);ctx.fill()}})}

// ------------------------------------------------------------------ the effects of the moves
// the column of fire of the entrance (behind her, and a thinner veil in front): it falls from the sky (k 0..1 over .22-.80), narrows when
// she lands, bursts at the end
function columnDraw(V0,k,K,front){const fall=sstep(0,.14,k),w=26*(1-.55*sstep(.52,.69,k)),al=(1-sstep(.88,.94,k))*(front?.45:1);if(al<=.01)return;
  const q=V0.P(0,0,0),top=q[1]-320,bot=lerp(top,q[1],fall);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=al;
  const g=ctx.createLinearGradient(0,top,0,bot);g.addColorStop(0,`rgba(${K.fire},0)`);g.addColorStop(.55,`rgba(${K.fire},.35)`);g.addColorStop(1,`rgba(${K.hot},.75)`);ctx.fillStyle=g;
  const t=G.t||0;ctx.beginPath();ctx.moveTo(q[0]-w*.5,top);for(let i=0;i<=8;i++){const y0=lerp(top,bot,i/8);ctx.lineTo(q[0]-w*(front?.55:1)-2*Math.sin(t*9+i*1.3),y0)}for(let i=8;i>=0;i--){const y0=lerp(top,bot,i/8);ctx.lineTo(q[0]+w*(front?.55:1)+2*Math.sin(t*8+i*1.7),y0)}ctx.closePath();ctx.fill();
  if(!front&&fall>.9){const gr=ctx.createRadialGradient(q[0],q[1],2,q[0],q[1],w*1.8);gr.addColorStop(0,`rgba(${K.hot},.6)`);gr.addColorStop(1,`rgba(${K.fire},0)`);ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(q[0],q[1],w*1.8,w*1.8*.55*C.KR(),0,0,TAU);ctx.fill()}
  ctx.restore()}
// the comet: a drop of fire round her (her shape inside), the tail away from where she goes; behind her (front 0) the glow and the tail, over
// her (front 1) a thin fire. LOWFX: a flat drop behind her
function cometDraw(V0,X,A,K,front){const c=A.comet;if(c<=.01)return;const{P}=V0,h=X.T([4,0,46]),q=P(h),td=nrm(lerp3([0,0,1],[-.8,0,.6],sstep(0,1,A.lean))),e=P(add(h,mul(td,110))),w=36;
  const dx=e[0]-q[0],dy=e[1]-q[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
  if(LOWFX){if(front)return;ctx.save();ctx.globalAlpha*=.6*c;ctx.fillStyle=`rgb(${K.fire})`;ctx.beginPath();ctx.moveTo(e[0],e[1]);ctx.quadraticCurveTo(q[0]+nx*w*1.2,q[1]+ny*w*1.2,q[0]-dx/l*w,q[1]-dy/l*w);ctx.quadraticCurveTo(q[0]-nx*w*1.2,q[1]-ny*w*1.2,e[0],e[1]);ctx.fill();ctx.restore();return}
  ctx.save();ctx.globalCompositeOperation='lighter';
  if(!front){const g=ctx.createLinearGradient(q[0],q[1],e[0],e[1]);g.addColorStop(0,`rgba(${K.hot},${.75*c})`);g.addColorStop(.35,`rgba(${K.fire},${.55*c})`);g.addColorStop(1,`rgba(${K.fire},0)`);ctx.fillStyle=g;
    const t=G.t||0;ctx.beginPath();ctx.moveTo(e[0],e[1]);ctx.quadraticCurveTo(q[0]+nx*w*1.25+3*Math.sin(t*11),q[1]+ny*w*1.25,q[0]-dx/l*w*.9,q[1]-dy/l*w*.9);ctx.quadraticCurveTo(q[0]-nx*w*1.25+3*Math.sin(t*13),q[1]-ny*w*1.25,e[0],e[1]);ctx.fill();
    shine(K.hot,q[0],q[1],w*1.6,.6*c)}
  else{const g=ctx.createRadialGradient(q[0],q[1],w*.55,q[0],q[1],w*1.15);g.addColorStop(0,`rgba(${K.fire},0)`);g.addColorStop(.7,`rgba(${K.hot},${.35*c})`);g.addColorStop(1,`rgba(${K.fire},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(q[0],q[1],w*1.15,0,TAU);ctx.fill()}
  ctx.restore()}
// the egg of ash of the rebirth: dark, cracks of gold turning blue, beating; the six threads of the fire of the gods climbing into it
const EGC=[[.3,.95],[1.35,.9],[2.4,.92],[3.4,.9],[4.4,.95],[5.4,.9]];
function eggDraw(V0,A,K){const E=A.egg,{P,F}=V0,s=E.s,C0=[0,0,27*s],R=[22*s,22*s,27*s],cc=cmix('#ffc83c','#9fe0ff',E.blue),cr=E.cr,op=E.open;
  ga(E.k,()=>{// the threads of the gods (behind the egg first)
    if(E.thr>0){const t=G.t||0;ctx.save();if(!LOWFX)ctx.globalCompositeOperation='lighter';ctx.lineCap='round';for(let i=0;i<6;i++){const a=i/6*TAU+.4,b=[Math.cos(a)*40,Math.sin(a)*40,0],e=[Math.cos(a)*10,Math.sin(a)*10,30*s],pts=[];
        for(let k=0;k<=8;k++){const u=k/8,w=2.5*Math.sin(u*Math.PI*2+t*4+i)*(1-u);pts.push(P(add(lerp3(b,e,u),[-Math.sin(a)*w,Math.cos(a)*w,0])))}
        ctx.strokeStyle=`rgba(127,240,192,${.55*E.thr})`;ctx.lineWidth=LOWFX?1.2:2.6;ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.stroke();
        if(!LOWFX){const u=((t*.8+i*.17)%1),q=P(lerp3(b,e,u));ctx.fillStyle=`rgba(220,255,240,${.9*E.thr*(1-u)})`;ball(q,1.8);ctx.fill()}}ctx.restore()}
    const hp=svol3(V0,ellSil(V0,C0,R,AXES,null,18),EGG,{lw:3,rim:.25,scr:1});
    // the cracks: zigzags from the top down the side that faces us, brighter at each beat; they open before it bursts
    ctx.save();ctx.clip(hp.path);ctx.lineCap='round';ctx.lineJoin='round';const runs=[];
    for(const[t0,e0] of EGC){const pts=[];for(let k=0;k<=6;k++){const u=k/6,t=t0+.18*Math.sin(k*2.1+t0*3),e=lerp(e0,-.35,u),m=[Math.cos(e)*Math.cos(t),Math.cos(e)*Math.sin(t),Math.sin(e)];if(F(m)<.02){if(pts.length>1)runs.push(pts.slice());pts.length=0;continue}pts.push(P(ellAt(C0,R,AXES,m)))}if(pts.length>1)runs.push(pts)}
    if(!LOWFX){ctx.globalCompositeOperation='lighter';strokeRuns(runs,`rgba(${E.blue>.5?'120,200,255':'255,170,60'},${.35+.4*cr})`,3+4*op+2*cr);ctx.globalCompositeOperation='source-over'}
    strokeRuns(runs,'#1a1210',2.2+2.4*op);strokeRuns(runs,cc,1.1+1.6*op+.8*cr);if(cr>.5)strokeRuns(runs,'#ffffff',.6*cr);ctx.restore();
    if(!LOWFX&&(cr>.3||op>0)){const q=P(C0);shine(E.blue>.5?'140,210,255':'255,190,90',q[0],q[1],40*s,.25*cr+.4*op)}})}
// the egg bursting (k 0..1 after .64): a white flash, the shells flying off, a blue ring on the floor
function burstDraw(V0,k,K,fx){const{P}=V0,q=P(0,0,30);if(fx){const a=(1-k)*(1-k);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(q[0],q[1],2,q[0],q[1],30+120*k);g.addColorStop(0,`rgba(255,255,255,${.95*a})`);g.addColorStop(.4,`rgba(190,235,255,${.6*a})`);g.addColorStop(1,'rgba(120,200,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(q[0],q[1],30+120*k,0,TAU);ctx.fill();ctx.restore();
    ring0(V0,[0,0,0],24+150*k,'140,210,255',.7*(1-k),4*(1-k)+1)}
  for(let i=0;i<8;i++){const a=i/8*TAU+.3,d=20+90*k,z=30+50*k-110*k*k;if(z<0)continue;shardDraw(V0,[Math.cos(a)*d,Math.sin(a)*d,z],a+k*7,1,{p2:1,k:1-k})}}
// a shard of the shell of ash with its glowing edge (the same as N3.phoenixShard)
function shardDraw(V0,c,rot,s,o){const q=V0.P(c),pts=[[7,0],[2,-4.6],[-5,-3.6],[-7.5,.6],[-3,4.4],[4,3.6]].map(([a,b])=>{const ca=Math.cos(rot),sa=Math.sin(rot);return[q[0]+(a*ca-b*sa)*s,q[1]+(a*sa+b*ca)*s*.8]});
  const hot=o&&o.p2?'#9fe0ff':'#ffc83c',k=o&&o.k!=null?o.k:1;if(!LOWFX&&k>.1)shine(o&&o.p2?'140,210,255':'255,170,60',q[0],q[1],10*s,.4*k);ctx.lineJoin='round';poly(pts);ctx.fillStyle=grad3(bbox(pts),EGG);ctx.fill();ctx.strokeStyle=cmix('#3a3230',hot,k);ctx.lineWidth=2.2*s;ctx.stroke();ctx.strokeStyle=INK;ctx.lineWidth=1*s;ctx.stroke()}
// the mound of ash of the defeat, the ember in it, the little golden egg, the chick
function moundDraw(V0,A,K,fx){const M=A.mound,{P}=V0,h=18*M.k*(1-.85*M.fly),r=26*(1-.25*M.fly),t=G.t||0;
  if(h>.5){const pts=[];for(let i=0;i<18;i++){const a=i/18*TAU,rr=r*(1+.08*Math.sin(i*2.7)),q=P(Math.cos(a)*rr,Math.sin(a)*rr,0);pts.push(q)}for(let i=0;i<9;i++){const a=Math.PI+i/8*Math.PI,q=P(Math.cos(a)*r*.6,Math.sin(a)*r*.6,h*(1+.08*Math.sin(i*3.1)));pts.push(q)}
    const H=chull(pts);ctx.lineJoin='round';smooth(H);ctx.fillStyle=grad3(bbox(H),T3('#a8a199','#8a837c','#5a544e'));ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.stroke();
    // little lumps of ash on it, the ember in the middle
    ctx.fillStyle='#6e6862';for(const[a,d] of[[.5,.4],[2.2,.5],[3.8,.35],[5.1,.55]]){const q=P(Math.cos(a)*r*d,Math.sin(a)*r*d,h*.6);ball(q,2.2);ctx.fill()}
    if(M.ember>0){const q=P(0,0,h*.75),pu=.7+.3*Math.sin(t*5);if(!LOWFX)shine('255,140,50',q[0],q[1],12,.6*M.ember*pu);ctx.fillStyle=cmix('#5a544e','#ff8a3a',M.ember);ball(q,3.2);ctx.fill();ctx.fillStyle=`rgba(255,240,200,${M.ember*pu})`;ball(q,1.4);ctx.fill()}}
  // the flakes of ash flying off
  if(fx&&M.fly>0&&M.fly<1)for(let i=0;i<10;i++){const u=(M.fly*1.4+i*.11)%1,a=i*2.4,q=P(Math.cos(a)*r*.6*(1+u),Math.sin(a)*r*.6*(1+u),h+u*60+(i%3)*4);ctx.fillStyle=`rgba(200,194,186,${.8*(1-u)})`;ctx.fillRect(q[0]-1.2,q[1]-1.2,2.4,2.4)}
  // the little egg: it glows gold, cracks in a zigzag, the top lifts, the chick pops out and blinks
  if(M.egg>0){const q=P(0,0,0),rx=9,ry=11,cy=q[1]-ry,cr=M.crack,ch=M.chick,lift=sstep(.5,1,cr);ctx.save();ctx.globalAlpha*=M.egg;
    if(!LOWFX)shine('255,210,120',q[0],cy,26,.45*(1-.5*ch));const eg=()=>{ctx.beginPath();ctx.ellipse(q[0],cy,rx,ry,0,0,TAU)};
    const zz=[];for(let i=0;i<=6;i++)zz.push([q[0]-rx+i*rx/3,cy-1+(i%2?-2.2:2)]);
    if(lift<=0){eg();ctx.fillStyle=C.soft(q[0]-3,cy-5,q[0],cy,13,'#fff3d0',.4,.2);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
      if(cr>0){ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.lineJoin='round';ctx.beginPath();const n=Math.ceil(1+6*cl(cr*2,0,1));for(let i=0;i<n&&i<zz.length;i++)ctx.lineTo(zz[i][0],zz[i][1]);ctx.stroke()}}
    else{// the bottom half, the chick in it, the top lifted and tipped
      ctx.save();ctx.beginPath();ctx.moveTo(q[0]-rx-2,cy-1);for(const w of zz)ctx.lineTo(w[0],w[1]);ctx.lineTo(q[0]+rx+2,q[1]+3);ctx.lineTo(q[0]-rx-2,q[1]+3);ctx.closePath();ctx.clip();eg();ctx.fillStyle=C.soft(q[0]-3,cy-5,q[0],cy,13,'#fff3d0',.4,.2);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();ctx.restore();
      if(ch>0)chickDraw([q[0],cy-1-7*ez(ch)],ch,M.p,cy);
      ctx.save();ctx.translate(q[0]+7*lift,cy-1-8*lift-5*ch);ctx.rotate(.55*lift);ctx.beginPath();ctx.moveTo(-rx-2,0);for(const w of zz)ctx.lineTo(w[0]-q[0],w[1]-(cy-1));ctx.lineTo(rx+2,0);ctx.ellipse(0,1,rx,ry,0,0,Math.PI,true);ctx.closePath();
      ctx.fillStyle='#fff3d0';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();ctx.restore()}
    ctx.restore()}}
// the chick of fire: an orange gold ball, big white eyes with the point of light, a tuft of blue flame (the reborn flame passes to it)
function chickDraw(c,k,p,clipY){const r=6.5,t=G.t||0;ctx.save();ctx.beginPath();ctx.rect(c[0]-20,c[1]-40,40,clipY-c[1]+40+2.5);ctx.clip();ink(2);ball(c,r);ctx.fillStyle=C.soft(c[0]-2.5,c[1]-3,c[0],c[1],r*1.25,'#ffb020',.4,.25);ctx.fill();ctx.stroke();ctx.restore();
  if(k<.35)return;ctx.save();ctx.globalAlpha*=sstep(.35,.6,k);const bl=C.blink(p*6,.55,.18);
  for(const sd of[-1,1]){ctx.fillStyle='#ffffff';ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(c[0]+sd*2.6,c[1]-.8,1.9,2.3*bl,0,0,TAU);ctx.fill();ctx.stroke();if(bl>.4){ctx.fillStyle='#1b1612';ball([c[0]+sd*2.4,c[1]-.4],1.1);ctx.fill();ctx.fillStyle='#fff';ball([c[0]+sd*2.4-.4,c[1]-1],.45);ctx.fill()}}
  ctx.fillStyle='#ff9a1a';ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(c[0]-1.4,c[1]+1.6);ctx.lineTo(c[0]+1.4,c[1]+1.6);ctx.lineTo(c[0],c[1]+3.4);ctx.closePath();ctx.fill();ctx.stroke();
  // the tuft of blue flame
  const f=[c[0],c[1]-r+.5],h=5+.8*Math.sin(t*9);ctx.fillStyle='#9fe0ff';ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(f[0]-2,f[1]+1);ctx.quadraticCurveTo(f[0]-1.8,f[1]-h*.6,f[0]+Math.sin(t*7),f[1]-h);ctx.quadraticCurveTo(f[0]+2,f[1]-h*.5,f[0]+2,f[1]+1);ctx.closePath();ctx.fill();ctx.stroke();
  if(!LOWFX)shine('140,210,255',f[0],f[1]-3,6,.5);ctx.restore()}
// the effects drawn on the floor (under her) and in the air
function fxFloor(V0,X,L,e,A,K){const{P,D}=V0,t=e.t;
  if(e.k==='ashring')L.add(-1500,()=>{const r=14+t*46;ring0(V0,[A.B[0],A.B[1],0],r,'200,190,175',.45*(1-t),3*(1-t)+1);dust(V0,[A.B[0],A.B[1],0],t,8,r*.8,'200,190,175',.35)});
  else if(e.k==='firering')L.add(-1500,()=>{const r=20+t*170;ring0(V0,[0,0,0],r,K.fire,.8*(1-t),6*(1-t)+1.5);ring0(V0,[0,0,0],r*.92,K.hot,.6*(1-t),2);lickB(()=>{for(let i=0;i<14;i++){const a=i/14*TAU+t*2,q=P(Math.cos(a)*r,Math.sin(a)*r,0);lick(q,3.2*(1-t*.5),K.fire,K.hot,1-t,i)}})});
  else if(e.k==='scrape')L.add(-1400,()=>{for(const sd of[-1,1])for(let i=0;i<3;i++){const u=cl(t-i*.1,0,1),q0=P(14-u*30,sd*(10+i),0),q1=P(14-u*30-10,sd*(10+i),0);ctx.strokeStyle=`rgba(40,26,20,${.5*(1-t)})`;ctx.lineWidth=1.6;ctx.lineCap='round';seg(q0,q1);ctx.stroke()}});
  else if(e.k==='ashland')L.add(-1400,()=>dust(V0,[0,0,0],t,10,30,'200,190,175',.45))}
function fxAir(V0,X,L,e,A,K,J){const{P,D}=V0,t=e.t;
  if(e.k==='spark'){const at=e.at;L.add(D(at)+40,()=>{for(let i=0;i<2;i++){const q=P(add(at,[6*t+i*2,(i-.5)*5*t,8*t-14*t*t+1]));ctx.fillStyle=`rgba(255,${200+40*i},120,${1-t})`;ball(q,1.3);ctx.fill()}})}
  else if(e.k==='embers'){L.add(800,()=>{for(let i=0;i<3;i++){const u=cl(t*1.3-i*.15,0,1);if(u<=0||u>=1)continue;const sd=i%2?1:-1,q=P(X.T([-8+i*3,sd*26,40-u*40]));lick(q,1.6,K.fire,K.hot,1-u,i);ctx.fillStyle=`rgba(255,220,150,${1-u})`;ball(q,1.1);ctx.fill()}})}
  else if(e.k==='pluck'){L.add(800,()=>{for(let i=0;i<3;i++){const c=X.T([-2-t*14,(i-1)*18,58+t*20-t*t*24]),d=nrm([Math.cos(i*2+t*6),Math.sin(i*2+t*6),.4]);ctx.save();ctx.globalAlpha*=1-sstep(.6,1,t);
      feather(V0,c,d,nrm(cross(d,[0,0,1])),10,2.2,K,{ash:.35*sstep(.2,.7,t),lw:1.4,fine:false,flat:1,under:false});ctx.restore()}})}
  else if(e.k==='regrow'||e.k==='shot'){L.add(850,()=>{for(const sd of[-1,1]){const WN=J['w'+sd];if(!WN)continue;for(let j=0;j<5;j++){const f=WN.F[j],c=X.T(add(f.b,mul(f.d,f.L*(e.k==='shot'?.35:.95)))),q=P(c);
      for(let i=0;i<2;i++){const a=j*1.3+i*2.1,d=4+t*10;ctx.fillStyle=`rgba(${K.hot},${1-t})`;ball([q[0]+Math.cos(a)*d,q[1]+Math.sin(a)*d-t*6],1.2);ctx.fill()}}}})}
  else if(e.k==='sparks'){const at=X.T(e.at);L.add(D(at)+60,()=>{for(let i=0;i<9;i++){const a=i*.7-2.8,v=20+i*4,q0=P(add(at,X.Rd([Math.cos(a)*v*t+8*t,Math.sin(a)*v*t,6*t-10*t*t]))),q1=P(add(at,X.Rd([Math.cos(a)*v*t*.7+6*t,Math.sin(a)*v*t*.7,4*t])));
      ctx.strokeStyle=`rgba(${K.hot},${1-t})`;ctx.lineWidth=1.4;ctx.lineCap='round';seg(q0,q1);ctx.stroke()}})}
  else if(e.k==='anvil'){L.add(980,()=>{const q=P(X.T([30,0,40]));if(!LOWFX)shine('255,255,255',q[0],q[1],40,.7*(1-t));for(let i=0;i<10;i++){const a=i/10*TAU,d=8+40*t;ctx.strokeStyle=`rgba(255,230,170,${1-t})`;ctx.lineWidth=1.4;seg([q[0]+Math.cos(a)*d*.6,q[1]+Math.sin(a)*d*.6],[q[0]+Math.cos(a)*d,q[1]+Math.sin(a)*d]);ctx.stroke()}})}
  else if(e.k==='vampa'){L.add(970,()=>{const Hc=J.Hc;if(!Hc)return;const q=P(add(Hc,[30+20*t,0,-6])),r=8+26*t;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],r);g.addColorStop(0,`rgba(255,255,255,${.9*(1-t)})`);g.addColorStop(.4,`rgba(${K.hot},${.7*(1-t)})`);g.addColorStop(1,`rgba(${K.fire},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(q[0],q[1],r,0,TAU);ctx.fill();ctx.restore()})}
  else if(e.k==='drop'){L.add(860,()=>{for(const sd of[-1,1]){const WN=J['w'+sd];if(!WN)continue;for(let j=0;j<3;j++){const f=WN.F[j],c0=X.T(add(f.b,mul(f.d,f.L*.8))),c=add(c0,[0,0,-20*ez(t)]),a=t*9+j*2+sd;ga(1-sstep(.75,1,t),()=>emberDraw(V0,c,a,.8,{p2:A.k2>.5}))}}})}
  else if(e.k==='puff'){L.add(960,()=>{const Hc=J.Hc;if(!Hc)return;for(let i=0;i<5;i++){const u=t,q=P(add(Hc,[-6+i*.5,(i-2)*5*u,18+u*22+i]));lick(q,3*(1-u),K.fire,K.hot,1-u,i);ctx.fillStyle=`rgba(255,200,140,${.5*(1-u)})`;ball(q,2+u*3);ctx.fill()}})}
  else if(e.k==='burstring'){L.add(-1400,()=>{const r=26+t*90;ring0(V0,[0,0,0],r,K.fire,.8*(1-t),4*(1-t)+1);for(let i=0;i<12;i++){const a=i/12*TAU,q=P(Math.cos(a)*r,Math.sin(a)*r,4+t*10);ctx.fillStyle=`rgba(${K.hot},${1-t})`;ball(q,1.6);ctx.fill()}})}}
// a burning feather falling in the Rain (a turning: its spin), the same as N3.phoenixEmber
function emberDraw(V0,c,a,s,o){const q=V0.P(c),K=o&&o.p2?K2:K1,k=o&&o.k||0,ca=Math.cos(a),sa=Math.sin(a),L=14*s*(1-.5*k);ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(a);
  if(!LOWFX)shine(K.fire,0,0,10*s,.5);const g=ctx.createLinearGradient(-L/2,0,L/2,0);g.addColorStop(0,K.fR);g.addColorStop(.5,K.fM);g.addColorStop(1,cmix(K.fT,'#ffffff',.3));ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(-L/2,0);ctx.quadraticCurveTo(0,-4*s*Math.abs(ca)-1,L/2,0);ctx.quadraticCurveTo(0,4*s*Math.abs(sa)+1.5,-L/2,0);ctx.closePath();ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();ctx.restore()}

reg('phoenix2',{n:'La Fenice della Forgia',g:'boss',sc:1,an:MV.slice(),dur:Object.assign({},DUR),
  lab:{idle:'Ferma',walk:'Vola',hit:'Colpita',fan:"Ventaglio dell'Impero",fan2:'Ventaglio doppio (fase 2)',dive:'Picchiata della Cometa',redive:'Seconda picchiata (fase 2)',
    grounded:'Ali a terra',rise:'Si rialza',wings:"Ali dell'Impero",wings2:"Ali dell'Impero doppie (fase 2)",sweep:'Ruota di Fiamme',rain:'Pioggia di Braci',
    judge:'Sguardo del Giudizio (fase 2)',rebirth:'Rinascita (fase 2)',taunt:'Presa in giro',enter:'Entrata',die:'Sconfitta'}},phoenix2);
{const OLD=N3.phoenix,M0=N3.meta.phoenix;if(OLD&&M0)N3.meta.phoenix2.old=(x,y,f,a,pp)=>OLD(x,y,f,M0.an.includes(a)?a:'idle',pp,M0.sc||1,{})}
})();
