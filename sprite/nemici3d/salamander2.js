// LA SALAMANDRA DI LAVA rifatta: «la Regina del Vulcano» (Denis, 15 ottobre: «rivisita tutti i boss, rendili più creepy e fatti meglio sia
// da fermi che nelle animazioni», «un po' più cupi», «falli possenti, belli, fighi, che diano timore nello sfidarli»; approvato il Golem,
// 16 ottobre: «sì, fai gli altri 12»). Una salamandra pezzata enorme, carminio e oro, lunga quattro eroi e mezzo, ritta come su un trono,
// con tre segni da regina cresciuti sul corpo: una corona di cinque punte d'ossidiana incastonata nel cranio, una gorgiera di dieci petali
// di magma intorno al collo che batte come un cuore di brace, lo scettro (una goccia d'ossidiana) in punta alla coda lunghissima. Si muove
// lenta e solenne con la testa ferma e puntata sull'eroe, poi colpisce all'improvviso. Il collare è il suo cuore: prima di ogni colpo si
// apre come un sole e la sua luce corre nelle fessure delle placche fino alla parte che colpirà (la gola, lo scettro, le zampe, le macchie).
// A metà vita cambia pelle: esce incandescente dalla pelle vecchia, con la corona in fiamme; la pelle vuota resta nella stanza come riparo.
// Resta della Classica: forme robuste da giocattolo, colori pieni, occhi grandi con la lucina, due zannette, niente sangue, ferite o
// cuciture. Metodo dello spaventapasseri: scheletro 3D proiettato con V(face), spina ad anelli (tronco e coda in pezzi, ognuno al suo posto
// nell'ordine di disegno), zampe a due ossa (ik), testa con la sua telecamera e la mascella a cerniera, corona e collare attaccati alla
// testa; dipinta come la lanterna (tre toni, bordo caldo, bagliori morbidi).
// Mosse: idle, walk, hit, spit (Sputafuoco), whip e whip2 (Frustata, doppia nella fase 2), burrow / swim / breach / leap (Tuffo di lava: si
// tuffa, la pinna, esplode fuori, il salto del delfino), crouch / run / pant (Anello di fuoco: si acquatta, la corsa, il collare freddo),
// erupt (Eruzione), rage (la Muta), taunt (Presa in giro), enter (Entrata), die (Sconfitta: la corona cade).
// Opzioni: o.p2 (seconda fase), o.look (la testa verso l'eroe rispetto al corpo, al massimo ±1,2 in tutto), o.curve (la curva della
// corsa, 1/raggio, + verso la sua sinistra), o.z (l'altezza data dal gioco nel salto del delfino), o.h1 (nel salto del delfino il primo
// buco rispetto a lei, in px: lì resta la colonna di lava), o.rush (lo scatto prima della Frustata: il collare a ventaglio, non la
// cometa dell'Anello), o.wph / o.rph (la fase della camminata o della corsa da cui parte la mossa: il primo ottavo della mossa parte da
// quella posa, l'ultimo ottavo finisce nella camminata da capo, così niente salta), o.noFx (niente effetti della mossa). Con LOWFX niente
// bagliori, braci, fumo, vapore né scintille, collare e macchie a toni pieni, fiammelle ferme.
// Disegni per il gioco con lo stesso aspetto: N3.salamanderGlob (la palla di magma), N3.salamanderGeyser (il geyser), N3.salamanderPool
// (ogni suo fuoco a terra), N3.salamanderHusk (la muta), N3.salamanderPrint (l'orma); gli stessi anche come N3.salamander2Glob ecc.
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,tri,hull,rim,run,cmix,poly,line,bbox,chull,smooth,
  rotX,rotY,rotZ,keys,bump,sstep,hitK,frame,ellAt,ellN,AXES,parts,reg,shine,ik,stepper,wa}=C;
const{shadeLimb,glowTop}=C.R;

// ------------------------------------------------------------------ helpers (as in golem2.js and boss2.js)
const fxOn=o=>!o.noFx&&!LOWFX;
const pls=(p,c,w)=>{const d=Math.abs(p-c)/(w/2);return d>=1?0:.5+.5*Math.cos(d*Math.PI)};
const rise=(p,a,b,c,d)=>sstep(a,b,p)*(1-sstep(c,d,p));
const flash=(p,a,w)=>p<a||p>a+w?0:1-(p-a)/w;
const trem=(p,a,b,hz,dur)=>{const w=Math.min(.03,(b-a)/3);return sstep(a,a+w,p)*(1-sstep(b-w,b,p))*Math.sin((p-a)*TAU*hz*dur)};
const ga=(k,f)=>{if(k<=.004)return;const a0=ctx.globalAlpha;ctx.globalAlpha=a0*Math.min(1,k);f();ctx.globalAlpha=a0};
const strokeRuns=(runs,col,w)=>{if(!runs.length)return;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();for(const r of runs){ctx.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)ctx.lineTo(r[i][0],r[i][1])}ctx.stroke()};
// a thin line of magma just inside the dark outline of a piece of obsidian (its screen hull H), pulled d px toward its middle
function edgeIn(H,d,col,al){if(!H||H.length<3||al<=.01)return;let cx=0,cy=0;for(const q of H){cx+=q[0];cy+=q[1]}cx/=H.length;cy/=H.length;ctx.beginPath();for(const q of H){const dx=q[0]-cx,dy=q[1]-cy,l=Math.hypot(dx,dy)||1,k=Math.max(0,1-d/l);ctx.lineTo(cx+dx*k,cy+dy*k)}ctx.closePath();
  const a0=ctx.globalAlpha;ctx.globalAlpha=a0*al;ctx.strokeStyle=col;ctx.lineWidth=.85;ctx.lineJoin='round';ctx.stroke();ctx.globalAlpha=a0}
const T3=(l,b,d)=>({l,b,d}),mixT=(a,b,k)=>k<=0?a:k>=1?b:T3(cmix(a.l,b.l,k),cmix(a.b,b.b,k),cmix(a.d,b.d,k));
const mixRgb=(a,b,k)=>{if(k<=0)return a;if(k>=1)return b;const A=a.split(',').map(Number),B=b.split(',').map(Number);return A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')};
// three tones from the upper left (light, base, shadow) over a screen box
function grad3(b,T){const w=b[2]-b[0],h=b[3]-b[1],cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,R=Math.max(w,h,2)*.64,g=ctx.createRadialGradient(cx-w*.24,cy-h*.26,R*.06,cx-w*.04,cy+h*.04,R);
  g.addColorStop(0,T.l);g.addColorStop(.34,T.b);g.addColorStop(.9,T.d);return g}
// how lit a face with the unit normal n is: the warm light comes from the upper left of the screen and a little from the front
function lit(V0,n){const o=V0.P(0,0,0),q=V0.P(n);return cl(.55+.45*(-.55*(q[0]-o[0])-.7*(q[1]-o[1]))+.2*V0.F(n),0,1)}
const tone=(T,k)=>{let r=T._r;if(!r){r=T._r=[];for(let i=0;i<=16;i++){const u=i/16;r.push(u<.5?cmix(T.d,T.b,u*2):cmix(T.b,T.l,u*2-1))}}return r[Math.round(cl(k,0,1)*16)]};
function fnorm(f){let x=0,y=0,z=0;for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length];x+=(a[1]-b[1])*(a[2]+b[2]);y+=(a[2]-b[2])*(a[0]+b[0]);z+=(a[0]-b[0])*(a[1]+b[1])}return nrm([x,y,z])}
const cen=f=>{let c=[0,0,0];for(const q of f)c=add(c,q);return mul(c,1/f.length)};
// the convex hull of screen points dropping the points nearly on a line (steady from one frame to the next), as in golem2.js
function hullE(pts,E){pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];E=E||0;
  for(const q of pts){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=E)lo.pop();lo.push(q)}
  for(let i=pts.length-1;i>=0;i--){const q=pts[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=E)up.pop();up.push(q)}
  lo.pop();up.pop();return lo.concat(up)}
function smoothP(pts){const n=pts.length,pa=new Path2D();pa.moveTo((pts[n-1][0]+pts[0][0])/2,(pts[n-1][1]+pts[0][1])/2);
  for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];pa.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}pa.closePath();return pa}
function rimP(pts,al){const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0)/2,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.15,cy+Rr*.15),kx=1-1.9/Math.max(1,(x1-x0)/2),ky=1-1.9/Math.max(1,(y1-y0)/2);
  g.addColorStop(0,wa(al));g.addColorStop(1,wa(0));ctx.beginPath();for(const q of pts)ctx.lineTo(cx+(q[0]-cx)*kx,cy+(q[1]-cy)*ky);ctx.closePath();ctx.strokeStyle=g;ctx.lineWidth=1.3;ctx.stroke()}
// a convex volume with a smooth outline painted in three tones (screen points or 3D points); returns the hull with its Path2D
function svol3(V0,pts3,T,o){o=o||{};const pts=o.scr?pts3:hullE(pts3.map(q=>V0.P(q)),.08);if(pts.length<3)return pts;ctx.lineJoin='round';const pa=pts.path=smoothP(pts);ctx.fillStyle=o.fill||grad3(bbox(pts),T);ctx.fill(pa);
  if(!o.noInk){ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2.5;ctx.stroke(pa)}if(o.rim)rimP(pts,o.rim);return pts}
// a faceted solid: the hull filled with the shadow tone, each face toward us in its own tone, the thick outline (as in golem2.js);
// FS: faces of 3D points, NS: their outward normals (or computed)
function facets(V0,FS,T,o,NS){o=o||{};const PM=new Map(),pr=q=>{let s=PM.get(q);if(!s){s=V0.P(q);PM.set(q,s)}return s};
  const all=[];for(const f of FS)for(const q of f)all.push(pr(q));if(all.length<3)return null;const H=chull(all);if(H.length<3)return null;
  ctx.lineJoin='round';poly(H);ctx.fillStyle=T.d;ctx.fill();const vis=[],seams=o.seam!==false?new Path2D():null,BK=new Map();let c=null;
  for(let i=0;i<FS.length;i++){const f=FS[i];if(f.length<3)continue;let n=NS?NS[i]:null;if(!n){n=fnorm(f);if(!c){c=[0,0,0];let m=0;for(const g of FS)for(const q of g){c[0]+=q[0];c[1]+=q[1];c[2]+=q[2];m++}c=mul(c,1/m)}if(dot(n,sub(cen(f),c))<0)n=mul(n,-1)}
    const v=V0.F(n);if(v<=.01)continue;vis.push({i,f,n,v});const s0=pr(f[0]),qk=o.q?Math.round(cl(lit(V0,n)+(o.kb||0),0,1)*o.q)/o.q:lit(V0,n)+(o.kb||0),key=tone(T,qk);let pa=BK.get(key);if(!pa){pa=new Path2D();BK.set(key,pa)}
    pa.moveTo(s0[0],s0[1]);for(let j=1;j<f.length;j++){const q=pr(f[j]);pa.lineTo(q[0],q[1])}pa.closePath();
    if(seams){seams.moveTo(s0[0],s0[1]);for(let j=1;j<f.length;j++){const q=pr(f[j]);seams.lineTo(q[0],q[1])}seams.closePath()}}
  for(const[col,pa] of BK){ctx.fillStyle=col;ctx.fill(pa)}
  if(seams&&vis.length){ctx.strokeStyle=o.seamCol||'rgba(236,230,255,.18)';ctx.lineWidth=.8;ctx.stroke(seams)}
  poly(H);if(!o.noInk){ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2.2;ctx.stroke()}return{H,vis,pr}}
// the same for a small gem (the points of the crown, the domes of the back): its screen points P2, faces by index FI, their normals NN
function litF(V0,n){const q0=V0.c*n[0]-V0.s*n[1],q1=(V0.s*n[0]+V0.c*n[1])*C.cam.k-n[2]*C.cam.zk;return cl(.55+.45*(-.55*q0-.7*q1)+.2*V0.F(n),0,1)}
function gem(V0,P2,FI,NN,T,o){const H=chull(P2);if(H.length<3)return null;ctx.lineJoin='round';poly(H);ctx.fillStyle=T.d;ctx.fill();const vis=[],BK=new Map();
  for(let i=0;i<FI.length;i++){const n=NN[i],v=V0.F(n);if(v<=.01)continue;vis.push(i);const f=FI[i],lt=litF(V0,n)+(o.kb||0),key=tone(T,o.q?Math.round(cl(lt,0,1)*o.q)/o.q:lt);let pa=BK.get(key);if(!pa){pa=new Path2D();BK.set(key,pa)}
    pa.moveTo(P2[f[0]][0],P2[f[0]][1]);for(let j=1;j<f.length;j++)pa.lineTo(P2[f[j]][0],P2[f[j]][1]);pa.closePath()}
  for(const[col,pa] of BK){ctx.fillStyle=col;ctx.fill(pa)}
  poly(H);ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2;ctx.stroke();return{H,vis}}
// the outline of an ellipsoid on the screen, exactly (a parallel projection of an ellipsoid is an ellipse), as in golem2.js
const SILT={};
function ellSil(V0,C0,Rd,F,T,n){F=F||AXES;n=n||14;const tp=T||(q=>q),o=V0.P(tp(C0));let sxx=0,sxy=0,syy=0;
  for(let k=0;k<3;k++){const ax=k===0?F.u:k===1?F.v:F.w,r=Rd[k],q=V0.P(tp([C0[0]+ax[0]*r,C0[1]+ax[1]*r,C0[2]+ax[2]*r])),dx=q[0]-o[0],dy=q[1]-o[1];sxx+=dx*dx;sxy+=dx*dy;syy+=dy*dy}
  const l11=Math.sqrt(Math.max(sxx,1e-6)),l21=sxy/l11,l22=Math.sqrt(Math.max(syy-l21*l21,1e-6));let tb=SILT[n];if(!tb){tb=SILT[n]=[];for(let i=0;i<n;i++){const t=(i+.5)/n*TAU;tb.push([Math.cos(t),Math.sin(t)])}}
  const out=new Array(n);for(let i=0;i<n;i++){const c=tb[i][0],s=tb[i][1];out[i]=[o[0]+l11*c,o[1]+l21*c+l22*s]}return out}
function frm(d,h){d=nrm(d);let u=sub(h||[1,0,0],mul(d,dot(h||[1,0,0],d)));if(len(u)<.15)u=sub([0,0,1],mul(d,d[2]));if(len(u)<.15)u=sub([0,1,0],mul(d,d[1]));u=nrm(u);return[u,cross(d,u),d]}
// rings, cuts at the floor, tubes (from boss2.js)
function cutRows(rows,zc){const out=[],n=rows.length;
  for(let i=0;i<n;i++){const r=rows[i],m=r.length;for(let j=0;j<m;j++){const a=r[j],da=a[2]-zc;if(da>=0)out.push(a);
    const b=r[(j+1)%m];if(da*(b[2]-zc)<0)out.push(lerp3(a,b,da/(a[2]-b[2])));
    if(i<n-1){const r2=rows[i+1],c=r2[j%r2.length];if(da*(c[2]-zc)<0)out.push(lerp3(a,c,da/(a[2]-c[2])))}
    if(i>0&&m===1){const r0=rows[i-1];for(const c of r0)if(da*(c[2]-zc)<0)out.push(lerp3(a,c,da/(a[2]-c[2])))}}}
  return out}
const below=(rows,zc)=>{if(zc==null)return false;for(const r of rows)for(const q of r)if(q[2]<zc)return true;return false};
function capsP(a,ra,b,rb){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);if(d<=Math.abs(ra-rb)+.01){const q=ra>=rb?a:b,r=Math.max(ra,rb);ctx.moveTo(q[0]+r,q[1]);ctx.arc(q[0],q[1],r,0,TAU);return}
  const an=Math.atan2(dy,dx),f=Math.acos(cl((ra-rb)/d,-1,1));ctx.moveTo(a[0]+Math.cos(an+f)*ra,a[1]+Math.sin(an+f)*ra);ctx.arc(a[0],a[1],ra,an+f,an+TAU-f);ctx.arc(b[0],b[1],rb,an-f,an+f);ctx.closePath()}
const ballP=(q,r)=>{ctx.moveTo(q[0]+r,q[1]);ctx.arc(q[0],q[1],Math.max(.05,r),0,TAU)};
// the screen ellipse of a flat disc (centre c, normal n, radius r): [cx, cy, rx, ry, angle]
function discE(V0,c,n,r,t,el){let u=null;if(t){u=sub(t,mul(n,dot(t,n)));if(len(u)<.2)u=null}if(!u){u=cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0])}u=nrm(u);const v=cross(n,u),o=V0.P(c),A=V0.P(add(c,mul(u,r*(el||1)))),B=V0.P(add(c,mul(v,r))),a=[A[0]-o[0],A[1]-o[1]],b=[B[0]-o[0],B[1]-o[1]],
  p=a[0]*a[0]+b[0]*b[0],q=a[1]*a[1]+b[1]*b[1],s=a[0]*a[1]+b[0]*b[1],m=(p+q)/2,d=Math.sqrt((p-q)*(p-q)/4+s*s);return[o[0],o[1],Math.sqrt(m+d),Math.sqrt(Math.max(1e-4,m-d)),.5*Math.atan2(2*s,p-q)]}
// a head split at the mouth into a top and a jaw (from boss2.js): the hull of the ellipsoids E (in the head's axes F round hc), cut by the
// plane of the mouth at the height hz; the jaw turns down by ja round a hinge at the back of the cut
function splitHead(hc,F,E,hz,ja,n,m){const top=d=>add(hc,add(add(mul(F.u,d[0]),mul(F.v,d[1])),mul(F.w,d[2])));let hx=1e9;
  for(const e of E){const zl=cl((hz-e.c[2])/e.r[2],-.98,.98);e.zl=zl;e.rr=Math.sqrt(1-zl*zl);hx=Math.min(hx,e.c[0]-e.rr*e.r[0])}hx*=.92;
  const cs=Math.cos(ja),sn=Math.sin(ja),jaw=d=>{const a=d[0]-hx,b=d[2]-hz;return top([hx+a*cs+b*sn,d[1],hz+b*cs-a*sn])},
    band=(e,z0,z1,fn,nn)=>{const rows=[],a0=Math.asin(z0),a1=Math.asin(z1);for(let i=0;i<=nn;i++){const a=a0+(a1-a0)*i/nn,z=Math.sin(a),q=Math.cos(a),row=[],mm=q<1e-3?1:m;
      for(let j=0;j<mm;j++){const t=j/m*TAU;row.push(fn([e.c[0]+Math.cos(t)*q*e.r[0],e.c[1]+Math.sin(t)*q*e.r[1],e.c[2]+z*e.r[2]]))}rows.push(row)}return rows},
    dome=[],bowl=[],floor=[],palate=[];
  for(const e of E){const d=band(e,e.zl,1,top,n),b=band(e,-1,e.zl,jaw,Math.max(2,n>>1));dome.push(...d);bowl.push(...b);palate.push(...d[0]);floor.push(...b[b.length-1])}
  const lipL=t=>{let best=null,bd=-1e9;for(const e of E){const d=[e.c[0]+Math.cos(t)*e.rr*e.r[0],e.c[1]+Math.sin(t)*e.rr*e.r[1],hz],k=d[0]*Math.cos(t)+d[1]*Math.sin(t);if(k>bd){bd=k;best={d,e}}}return best};
  return{top,jaw,dome,bowl,floor,palate,hz,lip:(t,k)=>(k?jaw:top)(lipL(t).d),wJ:add(mul(F.u,sn),mul(F.w,cs))}}
// puffs round a 3D point (k 0..1: spreading and fading)
function puffs(V0,c,k,n,r,rgb,al,up){if(k<0||k>=1)return;for(let i=0;i<n;i++){const a=i/n*TAU+.4,d=r*(.4+k*.9),q=V0.P(add(c,[Math.cos(a)*d,Math.sin(a)*d,k*(up||6)+(i%2)*2]));ctx.fillStyle=`rgba(${rgb},${(al||.5)*(1-k)})`;ball(q,2.4+k*4.5);ctx.fill()}}

// ------------------------------------------------------------------ colours
// phase 1, «brace che dorme»: deep carmine skin, burnished gold belly, violet obsidian, magma in the slits, a collar of embers
const K1={skin:T3('#f2683c','#cf3a22','#7a1a12'),gold:T3('#ffd27a','#f0a534','#a8601c'),obs:T3('#8e7fb8','#43355a','#17111f'),obsDot:'#ece6ff',
  core:'#fff3c4',yel:'#ffd05a',org:'#ff8a2a',red:'#e0451c',glow:'255,140,50',slit:'#3a1208',
  pRoot:'#a8281a',pBody:'#ff8a2a',pEdge:'#ffd05a',pBack:'#7a1a12',pHot:'#fff3c4',
  iris:'#ffc23a',irisD:'#e07a12',pupil:'#1b1612',eyeRing:'#3a1208',halo:'255,190,80',mouth:'#5a1206',tongue:'#c8404a',fang:'#fff6e0',
  smoke:'70,58,56',steam:'236,230,224',spot:'#ffd05a',spotE:'#e0451c',crust:'#4a1a14',crustE:'#ff9a3a',edge:null,flame:0};
// phase 2, «incandescente»: the new skin glows from inside, islands of crust, magma on the edges of the obsidian, flames on the crown
const K2=Object.assign({},K1,{skin:T3('#ffd27a','#ff6a2a','#b02a18'),gold:T3('#fff1c8','#ffc860','#d8822a'),
  pRoot:'#e0451c',pBody:'#ff8a2a',pEdge:'#ffd05a',pBack:'#b02a18',iris:'#fff1a8',irisD:'#ffb040',pupil:'#3a1206',halo:'255,240,180',spot:'#fff3c4',spotE:'#ff8a2a',
  edge:'#ffb040',flame:1,slit:'#5a1a0c'});
// the old skin (the moult) and the stone she cools into
const KH=Object.assign({},K1,{skin:T3('#7e6a60','#5a4640','#2e2220'),gold:T3('#8e7c6c','#6a5a4c','#3a2e26'),spot:'#6a5a4c',spotE:'#3a2e26'});
const KS=Object.assign({},K1,{skin:T3('#6a5e7a','#3a3046','#16111c'),gold:T3('#7a6e86','#4a4056','#1e1826'),spot:'#4a4056',spotE:'#2a2232',pRoot:'#3a3046',pBody:'#4a4056',pEdge:'#6a5e7a',pBack:'#2a2232'});
// the palette between two others (k), cached
const PALC={};
function palMix(a,b,k,id){k=Math.round(cl(k,0,1)*16)/16;if(k<=0)return a;if(k>=1)return b;const key=id+k;if(PALC[key])return PALC[key];const K={};
  for(const n in a){const x=a[n],y=b[n];K[n]=x&&typeof x==='object'?mixT(x,y,k):typeof x==='string'&&y&&typeof y==='string'?(x[0]==='#'&&y[0]==='#'?cmix(x,y,k):x.indexOf(',')>0&&y.indexOf(',')>0?mixRgb(x,y,k):(k<.5?x:y)):typeof x==='number'?lerp(x,y||0,k):(k<.5?x:y)}
  return PALC[key]=K}

// ------------------------------------------------------------------ the body at rest (x forward, y to its right, z up; 0,0,0 the game's point,
// under the chest between the front feet)
// the trunk: rings from the neck (0) to the hips (7): centre, half width, half height, how much the ring looks up (its normal)
const TRK=[[12,0,47,14,12,.62],[8.5,0,40,19.5,15,.42],[4.5,0,32.5,24,17,.22],[0,0,25,27,18,.04],[-10,0,22.5,26.5,17.5,0],[-20,0,20.5,25,16,-.02],[-30,0,18.8,23,15.4,-.06],[-40,0,17,20,15.2,-.14]];
const NT=TRK.length,HI=NT-1;
// the tail: from the hips, the length of each piece, its direction at rest (h: toward her right > 0, e: up > 0), the half sizes at its end.
// At rest it lies on the floor in a wide curve round her right flank, then its last third rises in an S and holds the sceptre up
const TSG=[11,7.9,7.9,7.9,7.9,7.9,7.9,7.9,7.9],TH0=[.15,.5,.85,1,.8,.4,0,-.3,-.45],TE0=[-.45,-.25,-.08,0,.1,.6,1,1.15,.7],
  TRD=[[13,11],[11.5,10],[10,9.5],[9,9],[7.5,9],[6,9],[5,7.5],[4,6],[3,4]],NTL=TSG.length,NS=NT+NTL,SCEP=12;
const M=12,KT=M/4,KB0=Math.round(M*9/16);   // points on every ring; the top one; where the gold of the belly starts
const RC=[],RS=[];for(let k=0;k<M;k++){RC.push(Math.cos(k/M*TAU));RS.push(Math.sin(k/M*TAU))}
// the pieces of the spine for the draw order (ring indices; each overlaps the next by one ring pair): the trunk with the root of the tail,
// the tail on the floor, the tail that rises with the sceptre
const PCS=[[0,HI+1],[HI,NT+4],[NT+3,NS-1]],PCO=[0,HI+.5,NT+3.5,99];   // (each dome or spine of the back belongs to one piece only)
// the feet at rest [front left, front right, hind left, hind right] and the roots of the legs
const FEET=[[6,-32,0],[6,32,0],[-30,-30,0],[-30,30,0]],ROOT=[[2,-22,22],[2,22,22],[-38,-15,13],[-38,15,13]],ROOTU=[3/7,3/7,1,1],
  BONE=[[14,14],[14,14],[14,13],[14,13]],LEGR=[[7,5.6],[7,5.6],[6.8,5.4],[6.8,5.4]];
// the head: its centre at rest, the neck node in its frame (it turns there), the cranium and the snout, the height of the mouth
const HC=[26,0,52],HNK=[-14,0,-5],HE=[{c:[-3,0,1],r:[16.5,20,9.2]},{c:[10.5,0,-1.4],r:[15,15.8,7]}],HZ=-3.4,
  MOUND=[-1,1].map(sd=>({sd,c:[8,sd*13.2,2.8],r:[6.4,5.8,5.6]}));   // the mounds of the eyes on top of the head
// a point on the head's surface: from (0, 0, z) outward along the angle t (0 = forward, + toward its right), the farthest of the two
function headRay(t,z,el){const d=nrm([Math.cos(t)*Math.cos(el||0),Math.sin(t)*Math.cos(el||0),Math.sin(el||0)]),o=[0,0,z];let best=-1,be=0;
  for(let i=0;i<2;i++){const e=HE[i],oo=[(o[0]-e.c[0])/e.r[0],(o[1]-e.c[1])/e.r[1],(o[2]-e.c[2])/e.r[2]],dd=[d[0]/e.r[0],d[1]/e.r[1],d[2]/e.r[2]],a=dot(dd,dd),b=2*dot(oo,dd),c=dot(oo,oo)-1,D=b*b-4*a*c;
    if(D<0)continue;const tt=(-b+Math.sqrt(D))/(2*a);if(tt>best){best=tt;be=i}}
  const p=add(o,mul(d,Math.max(0,best))),e=HE[be];return{p,n:nrm([(p[0]-e.c[0])/(e.r[0]*e.r[0]),(p[1]-e.c[1])/(e.r[1]*e.r[1]),(p[2]-e.c[2])/(e.r[2]*e.r[2])])}}
// the top of the head over (x, y): the highest of the two ellipsoids there, and the normal
function headTop(x,y){let bz=-1e9,be=0;for(let i=0;i<2;i++){const e=HE[i],u=(x-e.c[0])/e.r[0],v=(y-e.c[1])/e.r[1],q=1-u*u-v*v;if(q<=0)continue;const z=e.c[2]+e.r[2]*Math.sqrt(q);if(z>bz){bz=z;be=i}}
  if(bz<-1e8){const e=HE[0];return{p:[x,y,e.c[2]],n:nrm([x-e.c[0],y,0])}}const e=HE[be],p=[x,y,bz];return{p,n:nrm([(x-e.c[0])/(e.r[0]*e.r[0]),(y-e.c[1])/(e.r[1]*e.r[1]),(bz-e.c[2])/(e.r[2]*e.r[2])])}}
// the long smile: round the front of the snout at the mouth, rising at the corners up under the eyes (head frame)
const SMILE=[];for(let i=0;i<=18;i++){const t=-1.3+i/18*2.6,k=Math.pow(sstep(.5,1.3,Math.abs(t)),1.5),r=headRay(t,HZ+.2+8.3*k);SMILE.push({p:add(r.p,mul(r.n,.3)),n:r.n,k})}
// the eyes (head frame): centre, normal; the brows over them: outer back end, inner front end
// (each eye also keeps its own axes on the head: up, and forward toward the snout along its surface); the brow over it is a heavy plate
// from high over the back of the eye (a) to low over its front corner (b): the two make a V toward the snout, the frown of the queen
const EYE=MOUND.map(m=>{const d=nrm([.66,m.sd*.5,.36]),c0=ellAt(m.c,m.r,AXES,d),n=ellN(m.r,AXES,d),c=add(c0,mul(n,-.5)),up=nrm(sub([0,0,1],mul(n,n[2]))),
  fw=nrm(sub(sub([1,0,0],mul(n,n[0])),mul(up,up[0])));return{sd:m.sd,c,n,up,fw}});
const BROW=EYE.map(e=>{const at=(u,f,o)=>add(e.c,add(add(mul(e.up,u),mul(e.fw,f)),mul(e.n,o)));
  return{sd:e.sd,a:at(6.2,-5.4,.5),m:at(5.7,.4,1.5),b:at(3.1,6.3,1.1),up:e.up,n:nrm(add(e.n,mul(e.up,1.1))),en:e.n}});
const NOSE=[-1,1].map(sd=>{const r=headRay(sd*.24,2.2,.1);return{sd,c:r.p,n:r.n}});
const FANG=[-1,1].map(sd=>({sd,r:headRay(sd*.3,HZ+.3)})),LIPT=headRay(0,HZ+.2).p;   // the roots of the two fangs, the front of the mouth
// the crown: a band of obsidian set into the nape, five faceted points in an arc across the head, leaning back 20° and fanned out
// (the middle one the tallest); built once in the head frame: vertices, faces (indices) and their normals
const CRB=-10.5,CRW=[[0,32,4.8,0,2,0],[7.4,22,3.9,.3,4,2.6],[-7.4,22,3.9,-.3,1,2.2],[14.2,14,3.1,.58,3,5.2],[-14.2,14,3.1,-.58,5,4.7]],CRX=y=>5*Math.min(1.4,(y/14.2)*(y/14.2));
const CROWN=CRW.map(([y,L,r0,fan,chip,dx],k)=>{const tp=headTop(CRB+dx,y),b=add(tp.p,mul(tp.n,-.8)),d0=[-Math.sin(.35),0,Math.cos(.35)],d=nrm(rotX(d0,-fan));
  const[u,v]=frm(d,[1,0,0]),ring=(h,r,tw,pinch)=>{const R=[];for(let i=0;i<6;i++){const a=i/6*TAU+tw,rr=r*(i===pinch?.62:1);R.push(add(add(b,mul(d,h)),add(mul(u,Math.cos(a)*rr),mul(v,Math.sin(a)*rr))))}return R};
  const R0=ring(0,r0,.3,chip),tip=add(b,mul(d,L)),VV=R0.concat([tip]),F=[];
  for(let i=0;i<6;i++){const j=(i+1)%6;F.push([i,j,6])}
  const FN=F.map(f=>{const q=f.map(i=>VV[i]);let n=fnorm(q);if(dot(n,sub(cen(q),add(b,mul(d,L*.4))))<0)n=mul(n,-1);return n});
  return{k,y,b,d,L,r0,V:VV,F,FN,tip,lil:(chip+3)%6,base:tp}});

// the band: its points across the nape (head frame), raised a little
const CBAND=[];for(let i=0;i<=10;i++){const y=-16.5+i*3.3,tp=headTop(CRB+CRX(y),y);CBAND.push({p:add(tp.p,mul(tp.n,.6)),n:tp.n})}
// the collar: ten round petals on a ring round the neck just behind the head (head frame): the ring's centre, its half sizes
const CLC=[-15.5,0,-4],CLR=[17.5,15.5],NP=10,PL=22,PW=6;
// the seven obsidian domes down the back (ring index, length, width, height) and the eight spines of the tail (ring index, height)
const PLATES=[[1.8,10.5,17,4.8],[2.8,10.4,17,4.6],[3.8,10.2,16,4.4],[4.8,9.8,14.6,4.1],[5.8,9.2,13,3.8],[6.8,8.4,11,3.4],[7.75,7.4,9,3]],
  SPINES=[[8.7,5],[9.6,4.5],[10.5,4],[11.4,3.6],[12.3,3.1],[13.2,2.7],[14.1,2.3],[15,2]];
// the spots of the flanks (ring index, angle round the body from her right side, radius): two rows of five on each side
// (ring index, angle from the top toward her right side, radius across, how much longer along the body, its place in the wave of light)
const SPOTS=[];{const R1=[[3.1,.86,4.8,1.6,0],[3.62,1.47,3,1.4,.3],[3.98,1.1,5.6,1.75,.8],[4.42,.7,2.9,1.3,1.1],[4.86,1.52,3.7,1.55,1.5],[5.24,.98,4.3,1.6,2],[5.95,1.3,5.2,1.8,2.5],[6.33,.78,3.1,1.4,2.9],[6.86,1.12,3.9,1.5,3.4],[7.22,1.56,2.8,1.3,3.8]],
  R2=[[3.3,1.02,5.2,1.7,.1],[3.8,1.5,3.3,1.45,.4],[4.28,.8,3.4,1.4,1.1],[4.62,1.24,4.6,1.65,1.4],[5.38,.9,5,1.7,2.1],[5.72,1.55,3.1,1.4,2.4],[6.12,1.08,3.6,1.5,2.7],[6.66,1.4,4.4,1.6,3.2],[7.1,.86,3,1.35,3.6]];
  for(const[f,a,r,e,i] of R1)SPOTS.push([f,Math.PI/2-a,r,e,i]);for(const[f,a,r,e,i] of R2)SPOTS.push([f,Math.PI/2+a,r,e,i])}
// the islands of crust of the second phase (ring index, angle, size)
const ISLES=[[3.5,1.95,5.2],[4.6,.95,4.6],[5.3,2.45,4.2],[6.25,1.15,4.8],[2.6,.45,3.6],[7.25,2.05,3.8],[8.6,1.5,3.2]];

// ------------------------------------------------------------------ the moves (every one depends only on p; idle and walk close on themselves)
const MV=['idle','walk','hit','spit','whip','whip2','burrow','swim','breach','leap','crouch','run','pant','erupt','rage','taunt','enter','die'];
const DUR={idle:3.2,walk:1.4,hit:.6,spit:2,whip:1.7,whip2:2.8,burrow:.8,swim:.6,breach:1.7,leap:1.9,crouch:.9,run:.45,pant:1.4,erupt:2.2,rage:3,taunt:1.2,enter:3.4,die:4};
// tails ready-made: lying straight back on the floor (the train of the queen), up in the arc of a scorpion (the tip over her hips),
// straight up behind her, straight back in line (the lash of a whip), coiled round under her in the pool
const TZ=[0,0,0,0,0,0,0,0,0],TLIE=[-.3,-.12,-.04,-.02,0,.02,0,-.05,-.1],TSCO=[.95,1.28,1.52,1.74,1.94,2.08,2.18,2.24,2.28],TUP=[1.2,1.42,1.52,1.56,1.57,1.57,1.55,1.5,1.45],
  TCOIL=[.5,1.2,1.9,2.6,3.3,4,4.7,5.3,5.8],TCOE=[-.6,-.2,0,0,0,.05,.1,.15,.2];
// the order in which the petals light again (from the top of the collar down both sides)
const PORD=Array.from({length:NP},(_,i)=>{const a=(i+.5)/NP*TAU;return Math.round(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))/Math.PI*4.5)});
// the crown lights point by point from her left to her right (the indices in CROWN)
const CRL=[4,2,0,1,3];
const ONLY2={whip2:1,leap:1,erupt:1},ESS={pool:1,epool:1,dome:1,column:1,crownfall:1};
// the tail at the start and the end of a move: the game goes into every move from the walk and back to it, so they all begin and end
// with the train of the walk on the floor (TLIE). 1: the tail stays down for the whole move; 2: it rises to the throne after the start and
// lies down again before the end
const TAILB={spit:2,whip:2,whip2:2,burrow:2,rage:2,crouch:2,breach:1,leap:1,enter:1,erupt:1,pant:1,taunt:1};
// the moves in which the head keeps looking at you (the game gives the angle; in the attacks only the lag of the body's turn)
const LOOKM={idle:1,walk:1,spit:1,crouch:1,pant:1,erupt:1,rage:1,taunt:1};
const MOULT=45;   // how far she slides out of the old skin (the game moves her as much at the end of the moult)
// the moves the game starts from the walk and the ones it ends into the walk: their first and last eighth blend with the walk (o.wph: the
// phase of the walk she was in when the move began; at the end the walk starts again from 0), so neither the feet in their stride nor the
// sway of the tail pop when she begins or ends a blow
const FROMW={spit:1,whip:1,whip2:1,burrow:1,crouch:1,erupt:1,taunt:1,rage:1},TOW={spit:1,whip:1,whip2:1,breach:1,leap:1,pant:1,erupt:1,taunt:1,enter:1};
function blendA(A,W,k){if(k<=0)return;const L=(a,b)=>(a||0)+((b||0)-(a||0))*k;
  for(const n of['lean','roll','yaw','bend','nk','npt','hy','hp','hr','hx','hz','lowF','lowB','col','cLit','jaw','lid','br','rear','rearHead','sq','tuckF','tuckH','raiseF','claw','tongue'])A[n]=L(A[n],W[n]);
  for(let i=0;i<3;i++)A.B[i]=L(A.B[i],W.B[i]);for(let j=0;j<NTL;j++){A.th[j]=L(A.th[j],W.th[j]);A.te[j]=L(A.te[j],W.te[j])}
  for(let l=0;l<4;l++)for(let i=0;i<3;i++)A.feet[l][i]=L(A.feet[l][i],W.feet[l][i])}
// the reared poses: how much she rears round her hips (the trunk then stands at about 60°), how high she comes out of the column of lava,
// the keys of the entrance under the lava [rear, x, z] (the head just under the surface while the points and the eyes come out)
const RRE=.68,RZB=40,RXB=25,TDN=[-1.3,-1.45,-1.5,-1.5,-1.5,-1.5,-1.5,-1.5,-1.5],EK0=[[0,[1,34,-112]],[.13,[1,34,-91]],[.41,[1,34,-92]],[.51,[.9,30,-42]],[.6,[.42,15,-13]],[.7,[.06,2,-1.5]],[.72,[0,0,0]],[1,[0,0,0]]];
function sPose(anim,p,o){const ph=p*TAU,P2=(!!o.p2||!!ONLY2[anim])&&anim!=='enter'&&anim!=='rage',A={B:[0,0,0],lean:0,roll:0,yaw:0,s:0,sx:0,Z0:0,
    br:0,rear:0,rearHead:.55,lowF:0,lowB:0,bend:0,nk:0,npt:0,curve:0,th:TH0.slice(),te:TE0.slice(),tlen:1,tfloor:1,
    hy:0,hp:.17,hr:0,hx:0,hz:0,jaw:0,lid:.8,sq:0,shut:0,lk:[0,0],eyeDim:1,smirk:0,
    col:P2?.85:.12,cMode:0,cm:1,cLit:P2?.6:.15,cCold:0,petLit:null,petCold:null,halo:0,
    run:[],spot:P2?.5:.2,spotW:-1,spotA:.75,scep:0,claw:0,throat:0,cheek:0,tongue:0,flashW:0,
    feet:FEET.map(f=>f.slice()),tuckF:0,tuckH:0,raiseF:0,k2:P2?1:0,crownFl:P2?[1,1,1,1,1]:[0,0,0,0,0],crownK:1,crownEm:null,
    cut:null,swimK:0,swimZ:0,noBody:0,husk:null,split:-1,grey:0,crack:-1,coolF:-1,stone:0,mound:0,crownOff:0,dimHead:0,fx:[]};
  const fx=(k,t,o2)=>{if(t>=0&&t<1)A.fx.push(Object.assign({k,t},o2||{}))};
  const tailTo=(H,E,k)=>{if(k<=0)return;for(let j=0;j<NTL;j++){A.th[j]=lerp(A.th[j],H[j],k);A.te[j]=lerp(A.te[j],E[j],k)}};
  const wave=(amp,ph0,kk)=>{for(let j=0;j<NTL;j++){const k=(j+1)/NTL;A.th[j]+=amp*Math.pow(k,1.2)*Math.sin(ph0-j*(kk||.75))}};
  {const m=TAILB[anim];if(m)tailTo(TZ,TLIE,m===1?1:1-sstep(.03,.18,p)*(1-sstep(.86,.98,p)))}
  if(anim==='idle'){// FERMA: a slow wide breath (in .00-.50, out .50-1); the collar swells and lights at the top of it, the spots light in a
    // wave from the collar to the tail; threads of smoke from the nostrils, the tongue tastes the air twice, two little snaps of the head,
    // a slow blink; the end of the tail sways like a waiting cat's, the sceptre twitches. Phase 2: two breaths, the collar open and pulsing
    const b=P2?.5-.5*Math.cos(ph*2):.5-.5*Math.cos(ph);A.br=.04*b;A.B=[0,0,.6*b];
    A.col=P2?.86+.12*b:.12+.13*b;A.cLit=P2?.6+.35*b:.15+.5*pls(p,.475,.2);A.spotW=P2?(p*2)%1:p<.5?sstep(.05,.45,p):-1;
    const sn=s=>ez(cl(s/.06,0,1));A.hy=.087*(sn(p-.22)-sn(p-.72));
    A.tongue=Math.max(rise(p,.30,.31,.35,.36),rise(p,.40,.41,.45,.46));
    A.lid=.8*(p<.85?1:p<.88?1-.5*sstep(.85,.88,p):p<.91?.5:p<.93?.5-.5*sstep(.91,.93,p):p<.97?sstep(.93,.97,p):1);
    for(let j=5;j<NTL;j++){const k=(j-5)/3;A.th[j]+=.2*k*Math.sin(ph-k*1.1);A.te[j]+=.05*k*Math.cos(ph-k*1.1)}
    A.th[NTL-1]+=.3*Math.sin(Math.PI*cl((p-.94)/.06,0,1));
    fx('nsmoke',(p-.55)/.15);fx('embers',p,{n:P2?4:2})}
  else if(anim==='walk'){// CAMMINA: solemn as a monitor lizard, high on her legs, by diagonal pairs (front left with hind right in the air
    // .00-.50, the others .50-1); the trunk bends in an S and the shoulders roll, the head stays still in the air aimed at you; the tail
    // trails behind and sways the other way, its tip dragging on the floor (the train of the queen)
    const st=stepper(p,.5),S1=17,H1=5,a=st(.5,S1,H1),b=st(0,S1,H1),c=st(0,S1-1,H1-1),d=st(.5,S1-1,H1-1);
    A.feet=[[FEET[0][0]+a.x,FEET[0][1],a.z],[FEET[1][0]+b.x,FEET[1][1],b.z],[FEET[2][0]+c.x,FEET[2][1],c.z],[FEET[3][0]+d.x,FEET[3][1],d.z]];
    A.B=[0,0,-.9*Math.cos(ph*2)];A.bend=-4*Math.sin(ph);A.roll=.05*Math.sin(ph);A.hr=-A.roll;A.hy=.04*Math.sin(ph);
    tailTo(TZ,TLIE,1);wave(.34,ph+Math.PI,.72);A.col=.15-.05*Math.cos(ph);A.cLit=.2;
    A.tongue=Math.max(rise(p,.22,.24,.28,.3),rise(p,.72,.74,.78,.8));
    for(const[c0,l] of[[0,1],[0,2],[.5,0],[.5,3]])fx('plant',((p-c0)%1+1)%1/.22,{l});fx('sparks',p,{tip:1})}
  else if(anim==='hit'){// COLPITA (for the pages: in the game the bosses do not use it): the head snaps back, the collar bristles, the eyes
    // squeeze shut, the mouth hisses, a white flash runs down the slits, the crown sways with the head
    const k=hitK(p);A.B=[-3*k,0,0];A.hp=.17+.32*k;A.hx=-3*k;A.col=.12+.6*Math.max(0,k);A.cLit=.3+.6*Math.max(0,k);A.shut=p<.42?1:0;
    A.jaw=.45*Math.max(0,k);A.flashW=flash(p,.04,.38);A.roll=.04*k;A.bend=2.5*k;A.hr=.08*k}
  else if(anim==='spit'){// SPUTAFUOCO: .00-.40 rises on her front legs and opens the collar (the light runs up the throat to the mouth, the
    // throat and the cheeks swell and glow from inside, the eyes narrow); .42 .58 .74 three sharp snaps of the head with the jaws wide (a
    // ring of smoke, the ball of magma comes out), the throat swells again between them; .78-1 down again, the collar shut, two puffs
    const up=sstep(0,.4,p)*(1-sstep(.78,1,p)),op=sstep(0,.36,p)*(1-sstep(.78,.98,p));A.rear=.25*up;A.rearHead=.2;A.col=.12+.95*op;A.cLit=.2+.8*op;
    const snap=c=>p<c-.025?0:p<c?ez((p-c+.025)/.025):p<c+.02?1:p<c+.1?1-ez((p-c-.02)/.08):0,sn=Math.max(snap(.42),snap(.58),snap(.74));
    A.hp=.17+.22*up-.42*sn;A.hx=6*sn;A.hz=-2*sn;A.jaw=.12*up+.88*sn;A.lid=lerp(.8,1,sn);A.sq=.55*up*(1-sn);
    A.run.push({w:'throat',a:0,b:sstep(.08,.38,p),al:1-sstep(.78,.88,p)});A.throat=sstep(.12,.4,p)*(1-sstep(.76,.86,p))*(1-.6*sn);A.cheek=A.throat;
    for(const c of[.42,.58,.74]){fx('muzzle',(p-c)/.14);fx('glob',(p-c)/.04)}fx('puff',(p-.86)/.1);fx('puff',(p-.93)/.07);
    A.feet[0][0]+=1.5*up;A.feet[1][0]+=1.5*up;wave(.06,ph*2)}
  else if(anim==='whip'||anim==='whip2'){// FRUSTATA: she turns her back on you (the game keeps the direction still: the model turns), the
    // tail rises in the arc of a scorpion (the tip over her hips, bent a little to her side: never over you, never a pole hiding her) and
    // the head looks at you over her shoulder (the neck 60°, the head 60°); the light runs down to the sceptre (white), then the tail
    // slams down and sweeps the floor behind her from one flank to the other (200°), bounces, and she turns back round. Phase 2 (whip2):
    // the tail rises again straight up and lashes down in line
    const W2=anim==='whip2',tA=W2?.25:.28,tB=W2?.88:.72,turnAt=q=>Math.PI*(sstep(0,tA,q)-sstep(tB,1,q)),turn=turnAt(p),tk=turn/Math.PI;
    A.yaw=turn;A.nk=-1.05*tk;A.hy=-1.05*tk;A.hr=.06*tk;A.rearHead=.3;
    // the feet: two quick steps of the front ones while the hind ones pivot; on the way back the last step of each foot lands on its place
    // of the walk before the end (the game walks on from there)
    const wR=Math.min(.07,(1-tB)*.35);
    for(let l=0;l<4;l++){const fr=l<2,ss=fr?[tA*.18,tA*.6]:[tA*.38,tA*.82],RS=fr?[0,.33]:[.15,.48];let yw=0,lf=0;
      for(const s0 of ss){const w=.07,k=sstep(s0,s0+w,p);yw=lerp(yw,turnAt(s0+w),k);lf=Math.max(lf,4.5*Math.sin(Math.PI*cl((p-s0)/w,0,1)))}
      for(let m=0;m<2;m++){const s0=tB+(1-tB)*RS[m],k=sstep(s0,s0+wR,p);yw=lerp(yw,m?0:turnAt(s0+wR),k);lf=Math.max(lf,4.5*Math.sin(Math.PI*cl((p-s0)/wR,0,1)))}
      const f=rotZ(FEET[l],yw);A.feet[l]=[f[0],f[1],lf]}
    const hiE=W2?.47:.58,s0=W2?.49:.61,s1=W2?.54:.68,SA=TSCO.map((e,j)=>e+.1*(j<5?1:.4)),HK=TZ.map((_,j)=>j>=NTL-5?.25:0),
      flo=(a,lag)=>TZ.map((_,j)=>lerp(1.75,-1.75,ez(cl((p-s0-j*lag)/(s1-s0),0,1)))+a);
    // the tail curls up from the tip (a hook first, then the whole arc over her hips: never a straight pole); the plane of the arc leans
    // to her right, away from the head that looks over her left shoulder, so from behind it is a hook and her body shows
    A.troll=-.48*sstep(.02,tA,p)*(1-sstep(s0-.05,s0-.01,p))-(W2?.3*sstep(.57,.66,p)*(1-sstep(.79,.815,p)):0);
    for(let j=0;j<NTL;j++){const u=j/(NTL-1),a0=.02+(1-u)*.42*tA,k=sstep(a0,a0+.58*tA,p);A.th[j]=lerp(A.th[j],HK[j],k);A.te[j]=lerp(A.te[j],TSCO[j],k)}tailTo(HK,SA,sstep(tA,hiE,p));
    if(p>tA&&p<s0-.01){const q=.07*Math.sin(TAU*6*DUR.whip*p)*sstep(tA,tA+.05,p);for(let j=5;j<NTL;j++)A.th[j]+=q*(j-4)/4}
    if(p>=s0-.03){const k=sstep(s0-.03,s0,p),H=flo(0,.004);let E=TLIE.slice();tailTo(H,E,k);const bo=.22*Math.sin(Math.PI*cl((p-s1)/.06,0,1));for(let j=0;j<NTL;j++)A.th[j]+=bo*(j/NTL)}
    if(W2){// up again, straight behind her (.56-.70), held while the sceptre lights (.80), then the lash in line, the tip down on the blow (.85)
      tailTo(TZ,TUP,sstep(.57,.7,p));if(p>.7&&p<.81){const q=.05*Math.sin(TAU*6*DUR.whip2*p);for(let j=5;j<NTL;j++)A.th[j]+=q}
      const lk=[0,1,2,3,4,5,6,7,8].map(j=>sstep(.81+j*.0025,.83+j*.0025,p));for(let j=0;j<NTL;j++){A.te[j]=lerp(A.te[j],TLIE[j],lk[j]);A.th[j]=lerp(A.th[j],0,lk[j])}}
    tailTo(TZ,TLIE,sstep(tB,1,p));
    const sc1=W2?rise(p,.3,.48,.53,.6)+rise(p,.66,.8,.85,.92):rise(p,.4,.55,.66,.75);A.scep=Math.min(1,sc1);
    A.run.push({w:'back',a:0,b:sstep(W2?.25:.28,W2?.48:.55,p),al:1-sstep(W2?.53:.66,W2?.6:.76,p)});if(W2)A.run.push({w:'back',a:0,b:sstep(.6,.8,p),al:sstep(.6,.62,p)*(1-sstep(.85,.92,p))});
    const op=Math.min(1,.6*sstep(0,tA,p)+.4*sstep(tA,hiE,p))*(1-sstep(tB,1,p));A.col=.12+.95*op;A.cLit=.2+.8*op;A.sq=.4*op;A.lid=.9;
    fx('sweep',(p-s0)/(s1-s0+.14),{s0,s1});fx('puff',(p-tB)/.12);if(W2)fx('lash',(p-.85)/.12)}
  else if(anim==='burrow'){// SI TUFFA: .00-.22 rises a little, folds the collar «a elmo», the light runs into the front legs, the claws go
    // white and dig, under the chest the stone melts into a pool of magma; .22-.80 dives head first: the nose goes down and the whole body
    // slides into the pool along itself (the hind legs kick, the tail goes in last with a flick of the tip); .80-1 only the points of the
    // crown stay out, where she swims, and the pool closes into a glowing crack (at 1 the same drawing as 'swim' at 0)
    A.Z0=30;const r0=sstep(0,.12,p);A.lowF=-2.5*r0*(1-sstep(.2,.3,p));A.cMode=1;A.cm=sstep(0,.15,p);A.col=.12;A.cLit=.35;
    A.run.push({w:'legs',a:0,b:sstep(0,.18,p),al:1-sstep(.34,.44,p)});A.claw=sstep(.08,.2,p)*(1-sstep(.4,.5,p));
    // (the claws dig once, down and back: one stroke in .13 s)
    for(const l of[0,1]){const dg=cl((p-.06)/.16,0,1);A.feet[l][0]+=2.5*Math.sin(TAU*dg);A.feet[l][2]=1.5*Math.max(0,Math.sin(TAU*dg))}
    const lk=ez(sstep(.18,.38,p)),sl=Math.pow(sstep(.27,.8,p),1.2),D0=215*sl;A.lean=.82*lk;A.rear=-.38*lk;A.rearHead=.4;A.hp=.17-.3*lk;A.sq=.6;A.cut=p<.2?null:0;A.tfloor=0;
    A.B=[D0*Math.cos(A.lean),0,-D0*Math.sin(A.lean)];A.tuckF=sstep(.2,.32,p);A.tuckH=sstep(.3,.46,p);
    tailTo(TZ,[-.2,-.05,.08,.18,.26,.32,.36,.4,.44],sstep(.2,.42,p));if(p>.62)wave(.5*rise(p,.62,.68,.74,.8),TAU*3*p);
    A.swimK=p>.6?1:0;A.swimZ=-26*(1-ez(sstep(.68,.84,p)));A.wave=sstep(.8,.97,p);A.uglow=sstep(.55,.85,p);
    fx('pool',p,{r:26*sstep(.05,.22,p)*(1-sstep(.82,1,p)),cr:sstep(.8,1,p)});if(p>.24&&p<.84)fx('splash',(p-.24)/.6)}
  else if(anim==='swim'){// LA PINNA: under the floor only the points of the crown cut the stone like the fin of a shark, a wave of molten
    // stone in front of them, the two amber eyes at floor level, the red glow of her body under the floor
    A.noBody=1;A.swimK=1;A.swimZ=0;A.wave=1}
  else if(anim==='breach'||anim==='leap'){// ESPLODE FUORI: .00-.45 the crown sinks, the floor swells and boils into a dome of cracked slabs;
    // .45-.55 out of a column of lava, reared up at 60° in an S (the neck bent forward, the snout on you, the crown high; the front legs
    // spread at the height of her shoulders with the claws open), jaws and collar wide (the blow at .48); .55-.76 bends forward and falls
    // on her belly (.74), .76-1 shakes the lava off like a wet dog. SALTO DEL DELFINO (leap, phase 2): out at .40-.48, an arc forward (the
    // game moves her and gives the height, o.z), head first into the second circle (.76-.80) where a pool of magma opens, out of it again
    // (the crown and the head first) and a shake
    const LP=anim==='leap',t0=LP?.4:.45;A.swimK=p<t0?1:0;A.swimZ=-26*sstep(0,.22,p);A.wave=1-sstep(0,.14,p);A.uglow=1-sstep(t0-.12,t0,p);
    // (the dome boils until she comes out, then bursts and its slabs fly; the column is born inside it; both at the first hole)
    if(p<t0+.1)fx('dome',Math.min(.999,p/t0),{fade:sstep(t0,t0+.1,p)});if(p>=t0-.03)fx('column',(p-t0+.03)/.23);
    if(p<t0){A.noBody=1}
    else{const up=ez(sstep(t0,t0+.05,p));A.Z0=30;A.cut=p>(LP?.97:.76)?null:0;A.tfloor=0;A.col=1.05;A.cLit=1;A.jaw=.95*rise(p,t0,t0+.03,LP?.5:.56,LP?.56:.64);A.lid=1;
      if(!LP){const f=ez(sstep(.56,.74,p)),r=1-f;A.lean=-.55*r;A.npt=.4*r;A.B=[RXB*r,0,lerp(-120,RZB,up)*r];A.hp=.27+A.lean+.3*rise(p,t0,t0+.03,.52,.58);
        A.raiseF=r;A.tuckH=1-sstep(.6,.76,p);
        tailTo(TZ,TDN,1-sstep(.54,.66,p));A.tfloor=sstep(.62,.72,p);A.col=lerp(1.05,.12,sstep(.7,.95,p));A.cLit=lerp(1,.2,sstep(.7,.95,p));
        const sh=sstep(.76,.8,p)*(1-sstep(.92,1,p));A.roll=.15*Math.sin(TAU*2*(p-.76)/.24)*sh;A.hr=-.6*A.roll;A.bend=3.5*Math.sin(TAU*2*(p-.76)/.24+1)*sh;
        fx('thud',(p-.74)/.16);fx('drops',(p-.76)/.24)}
      else{// the arc of the dolphin (the height from the game, or its own), then head first into the second circle; she surfaces in it
        // (level, the crown and the head first) and shakes
        const u=cl((p-.48)/.28,0,1),zA=o.z!=null?0:70*Math.sin(Math.PI*u),dv=sstep(.76,.8,p),ou=cl((p-.8)/.15,0,1),out=1-(1-ou)*(1-ou)*(1-ou);
        if(p<.8){A.lean=p<.48?-.55:p<.76?lerp(-.55,1.1,ez(u)):lerp(1.1,1.2,dv);A.npt=.4*(1-sstep(.48,.58,p));A.hp=.27+(p<.48?A.lean:.82*Math.min(0,A.lean)-.2*Math.max(0,A.lean));
          const D0=170*ez(dv);A.B=[RXB*(1-sstep(.46,.56,p))+D0*Math.cos(A.lean),0,(p<.48?lerp(-120,RZB,up):zA)-D0*Math.sin(A.lean)];
          A.raiseF=1-sstep(.55,.65,p);A.tuckF=sstep(.55,.65,p);A.tuckH=1}
        else{A.lean=-.45*(1-out);A.npt=.3*(1-out);A.hp=.2+A.lean*.9;A.B=[0,0,-95*(1-out)];A.tuckF=1-sstep(.88,.96,p);A.tuckH=1-sstep(.9,.98,p)}
        tailTo(TZ,TDN,1-sstep(.46,.56,p));tailTo(TZ,TZ,sstep(.46,.56,p)*(1-sstep(.9,1,p)));A.col=lerp(1.05,.86,sstep(.86,1,p));A.cLit=lerp(1,.6,sstep(.86,1,p));
        const sh=sstep(.92,.95,p)*(1-sstep(.98,1,p));A.roll=.12*Math.sin(TAU*(p-.92)/.08)*sh;
        fx('dive2',(p-.76)/.2);fx('pool',p,{c:[0,0,0],r:lerp(22,30,sstep(.76,.84,p))*sstep(.752,.768,p)*(1-sstep(.9,.985,p)),cr:sstep(.9,.97,p)*(1-sstep(.97,1,p))});fx('drops',(p-.9)/.1)}}}
  else if(anim==='crouch'){// SI ACQUATTA (prepares the ring of fire): the belly on the floor, the claws dig in and go white, the collar
    // stretched back flat like a comet with flames out of it, the spots light in three quick waves from the head to the tail, the tail
    // lashes once from side to side, the eyes narrow; she ends low, ready to spring
    const k=ez(sstep(0,.3,p));A.lowF=10*k;A.lowB=7*k;A.lean=.05*k;A.hp=.17-.14*k;A.claw=sstep(.1,.35,p);A.cMode=2;A.cm=sstep(0,.4,p);A.col=.12;A.cLit=.3+.7*A.cm;
    A.spotW=p>.05&&p<.95?((p-.05)/.3)%1:-1;A.spotA=1;A.sq=.6*k;tailTo(TZ,TLIE,k*.8);
    const w=Math.sin(TAU*cl((p-.3)/.4,0,1))*sstep(.3,.36,p)*(1-sstep(.64,.7,p));for(let j=0;j<NTL;j++)A.th[j]+=.7*w*Math.pow((j+1)/NTL,.8);
    for(let l=0;l<4;l++)A.feet[l][1]*=1+.1*k;fx('dig',(p-.1)/.5)}
  else if(anim==='run'){// CORSA: very low and long, huge strides (the legs nearly out of sight), the tail stretched behind like a whip, the
    // collar a comet throwing flames, the mouth half open; o.curve bends her along the ring and leans her into the curve
    A.lowF=7;A.lowB=6;A.lean=.05;A.cMode=2;A.cm=1;A.col=.12;A.cLit=.9;A.jaw=.2;A.sq=.4;A.lid=.9;
    const cv=o.curve||0;A.curve=cv;A.roll=-.15*Math.sign(cv)*Math.min(1,Math.abs(cv)*110);A.hr=-.5*A.roll;
    const st=stepper(p,.42),S1=21,H1=2.6,a=st(.5,S1,H1),b=st(0,S1,H1),c=st(0,S1,H1),d=st(.5,S1,H1);
    A.feet=[[FEET[0][0]+4+a.x,FEET[0][1]*1.05,a.z],[FEET[1][0]+4+b.x,FEET[1][1]*1.05,b.z],[FEET[2][0]-4+c.x,FEET[2][1]*1.05,c.z],[FEET[3][0]-4+d.x,FEET[3][1]*1.05,d.z]];
    A.bend=-5*Math.sin(ph);tailTo(TZ,TLIE,1);wave(.16,ph+Math.PI,.6);A.B=[0,0,-.6*Math.cos(ph*2)];fx('sparks',p,{tip:1,many:1});
    // the dash before the Frustata (o.rush): the collar open as a fan and the light already starting down her back, the sign of the
    // Frustata (the comet belongs to the ring of fire)
    if(o.rush){A.cMode=0;A.col=.62;A.cLit=.75;A.run.push({w:'back',a:0,b:.3+.05*Math.sin(ph),al:.85});A.scep=.15}}
  else if(anim==='pant'){// COLLARE FREDDO: she stops dead (the comet of the run goes limp and grey and folds: it does not change shape in
    // one frame); the flanks heave fast (four times), the mouth open, the tongue out, the head low; .75-1 the collar lights again petal by
    // petal from the top down, to the dim glow of the walk
    const k=1-sstep(.75,.95,p),c0=sstep(0,.08,p);A.cMode=2;A.cm=1-c0;A.cCold=c0;A.col=.12;A.cLit=lerp(.9,.15,c0)+.05*sstep(.9,1,p);
    A.petCold=PORD.map(r=>c0*(1-sstep(.75+r*.045,.79+r*.045,p)));A.petLit=PORD.map(r=>Math.max(.9*(1-c0),sstep(.75+r*.045,.79+r*.045,p)*lerp(.8,.2,sstep(.93,1,p))));
    A.br=.07*(.5-.5*Math.cos(TAU*4*cl(p/.75,0,1)))*k;A.jaw=lerp(.2,.5,c0)*k;A.tongue=k*c0;A.hp=.17-.28*k*c0;A.lowF=lerp(7,3,c0)*k;A.lowB=6*(1-sstep(0,.1,p));
    A.lean=.05*(1-c0);A.sq=.4*(1-c0);A.lid=lerp(.9,lerp(.8,.6,k),c0);A.B=[0,0,-.6*(1-c0)];fx('steam',p/.8)}
  else if(anim==='erupt'){// ERUZIONE (phase 2): .00-.36 rises on her hind legs to 60° in an S (the neck bent forward, the crown high), the
    // tail planted behind like a tripod, the front legs spread, the collar wide open like a sun; the light climbs from the sceptre to the
    // crown and lights every slit; .36-.48 roars at the sky, the points of the crown blaze; .46-.52 drops on her front legs with a blow
    // (.52); .56-1 stays low, legs planted, the collar pulsing with every wave (.56, .70, .84), then stands as she walks
    const up=ez(sstep(0,.36,p)),dn=ez(sstep(.46,.52,p)),hi=up*(1-dn),ro=rise(p,.36,.4,.44,.48);
    A.rear=RRE*hi;A.npt=.34*hi*(1-.7*ro);A.rearHead=.15;A.raiseF=hi;A.col=1.1;A.cLit=.8+.2*hi;A.spot=lerp(.5,1,hi);A.halo=hi;
    A.run.push({w:'back',a:1-sstep(0,.36,p),b:1,al:1-sstep(.56,.7,p),rev:1});A.scep=hi;
    A.hp=.17+.55*ro;A.jaw=.9*ro;A.lid=1;A.crownFl=[1,1,1,1,1].map(()=>1+.6*ro);
    const lo=sstep(.5,.56,p)*(1-sstep(.88,1,p));A.lowF=4*lo;A.cLit=Math.max(A.cLit,.7+.3*Math.max(pls(p,.56,.06),pls(p,.70,.06),pls(p,.84,.06)));
    fx('slam',(p-.52)/.18);fx('roarfx',(p-.36)/.14)}
  else if(anim==='rage'){// LA MUTA: .00-.20 she writhes hissing, cracks of light run over the skin from the crown to the tail; .20-.45 the old
    // skin splits down the back from the head to the tail and turns grey, she arches; .45-.72 she slides forward out of it, new and
    // glowing (the old skin stays there, empty); .72-.86 she shakes, the points of the crown light one by one, the collar opens and stays
    // open; .86-1 she roars at you (the mouth shut again at the end: the eruption follows)
    const wr=sstep(0,.04,p)*(1-sstep(.18,.24,p));A.roll=.1*Math.sin(TAU*4*p)*wr;A.bend=6*Math.sin(TAU*3*p)*wr;A.jaw=.4*wr;A.sq=wr;A.crack=sstep(0,.2,p);
    const ar=rise(p,.22,.32,.4,.45);A.rear=.15*ar;A.lean=-.04*ar;A.split=p<.45?sstep(.2,.45,p):-1;A.grey=p<.45?sstep(.2,.42,p):0;
    // (she leaves the old skin where it was: the body that slides out goes from the grey of the old skin to the new glow, no pop)
    if(p>=.45){const sl=ez(sstep(.45,.72,p));A.husk={k:1};A.B=[MOULT*sl,0,0];A.k2=sstep(.45,.56,p);A.grey=1-sstep(.45,.56,p);A.split=A.grey>0?1:-1}
    else A.k2=0;
    const sh=sstep(.72,.75,p)*(1-sstep(.83,.86,p));A.roll+=.14*Math.sin(TAU*2.5*(p-.72)/.14)*sh;A.hr=-.5*A.roll;
    A.crownFl=CROWN.map((c,k)=>sstep(.74+CRL.indexOf(k)*.03,.76+CRL.indexOf(k)*.03,p));A.col=p<.45?.12+.1*wr:lerp(.12,1,sstep(.76,.86,p));A.cLit=p<.45?.15:lerp(.3,1,sstep(.74,.86,p));
    const ro=rise(p,.86,.9,.95,1);A.jaw=Math.max(A.jaw,.85*ro);A.hp=.17+.22*ro;A.lid=p>.86?1:.8;fx('steam',(p-.2)/.3)}
  else if(anim==='taunt'){// PRESA IN GIRO: she lifts her chin and looks down her nose at you, the lids half shut, the corners of the smile
    // up (the bored queen); two rings of smoke from her nose (.30, .45) that come toward you, widening; the tip of the tail, lying on the
    // floor, lifts and taps it twice (.62, .76), as a queen drums her fingers
    const k=sstep(0,.25,p)*(1-sstep(.85,1,p));A.hp=.17+.48*k;A.hr=.1*k;A.rearHead=.55;A.rear=.08*k;A.lid=lerp(.8,.42,k);A.smirk=k;A.col=.12+.15*k;
    fx('ring',(p-.30)/.4);fx('ring',(p-.45)/.4);
    for(const c of[.62,.76]){const lf=sstep(c-.075,c-.03,p)*(1-sstep(c-.022,c,p));for(let j=NTL-3;j<NTL;j++)A.te[j]+=.62*lf*(j-NTL+4)/3;fx('tap',(p-c)/.12)}}
  else if(anim==='enter'){// ENTRATA: .00-.15 the cracks of lava light up and a pool of magma opens in the middle; .15-.27 the points of the
    // crown come out of the magma one after the other (each along its own axis); .29-.41 two amber eyes open just under the surface, look
    // left, right, then at you; .41-.51 the head rises, magma dripping from the brows and the chin; .51-.70 she comes out of the pool (the
    // front feet on the rim, the collar lighting petal by petal, the tail last, wrapping round her); .72-.86 rises on her hind legs in an S,
    // opens the collar like a sun (.76), roars at you (.77); .86-.94 drops on her front legs (.88), the tail cracks the floor behind her
    // (.90); .94-1 settles as she walks
    const v=keys(EK0,p);
    A.rear=v[0];A.rearHead=p>.71?.15:.35*sstep(.4,.5,p);A.B=[v[1],0,v[2]];A.cut=p<.72?0:null;A.tfloor=p>.6?1:0;
    const rk=ez(sstep(.72,.76,p))*(1-ez(sstep(.855,.885,p))),ro=rise(p,.76,.78,.84,.86);A.rear+=RRE*rk;A.npt=.34*rk*(1-.5*ro);
    if(p>.72&&p<.885)A.raiseF=sstep(.72,.75,p)*(1-sstep(.855,.885,p));
    A.lk=[p<.32?-.6*sstep(.3,.32,p):p<.36?-.6+1.2*sstep(.32,.36,p):.6-.6*sstep(.36,.4,p),0];A.lid=p<.29?0:p<.33?sstep(.29,.33,p)*.8:.8;A.eyeUnder=1;
    A.crownEm=CROWN.map(c=>{const t=c.k===0?.15:c.k<3?.19:.23;return sstep(t,t+.06,p)});
    // (under the lava the head is pitched down so the points of the crown stand up straight through the surface, the eyes just in front)
    A.hp=lerp(-.32,.17,sstep(.38,.47,p))+.25*rise(p,.41,.46,.6,.66)+.2*ro;A.jaw=.85*ro+.1*rise(p,.41,.45,.5,.55);A.lid=Math.max(A.lid,p>.76&&p<.86?1:0);
    const ew=sstep(.94,1,p);A.petLit=Array.from({length:NP},(_,i)=>sstep(.56+i*.012,.575+i*.012,p)*(.5+.5*sstep(.74,.77,p))*lerp(1,.2,ew));
    A.col=(p<.56?0:lerp(.12,.3,sstep(.56,.68,p))+.8*rise(p,.74,.77,.86,.92))*(1-ew)+.1*ew;A.cLit=lerp(.6,.2,ew);A.halo=rise(p,.75,.77,.84,.9);
    tailTo(TCOIL.map(h=>h*.25),TCOE,1-sstep(.6,.72,p));
    {const wh=rise(p,.86,.89,.9,.94);for(let j=0;j<NTL;j++){A.th[j]-=.9*wh*(j/NTL);A.te[j]=lerp(A.te[j],TLIE[j],wh*.7)}}
    if(p<.51){A.tuckF=1}else A.tuckF=1-sstep(.51,.55,p);A.tuckH=p<.6?1:1-sstep(.6,.7,p);
    fx('epool',p);fx('drips',(p-.41)/.2);fx('roarfx',(p-.77)/.12);fx('crackfx',(p-.9)/.1)}
  else if(anim==='die'){// SCONFITTA, la corona cade: .00-.12 she arches back with a long hiss, the collar opens and shuts in three jerks;
    // .12-.42 the light leaves her from the tail toward the head (the sceptre out first, then the slits and the spots go grey one by one,
    // each with a puff of steam, the tail stiffens into black stone); in the second phase the flames of the crown go out one by one, each
    // with a puff of steam; .42-.52 she tries to lift her head and roar, only a little ring of smoke and a cough; .52-.575 the band of the
    // crown comes off the cooling skull, falls, bounces and rolls (the climax); .575-.80 the head goes down, the eyes go out, the body of
    // obsidian cracks along the slits and slumps into a heap of glossy black rocks; .80-1 a curl of smoke, the last ember rises like a
    // firefly, circles over the crown and slips into a crack of the floor
    const ar=rise(p,0,.05,.1,.16);A.rear=.18*ar;A.hp=.17+.35*ar;A.jaw=.5*ar;A.lid=.7*sstep(.12,.2,p);
    A.col=.12+.55*Math.abs(Math.sin(Math.PI*3*cl(p/.12,0,1)))*(p<.12?1:0);A.cLit=lerp(.5,.1,sstep(.1,.16,p));
    A.coolF=p<.12?-1:1-sstep(.12,.42,p);A.scep=p<.12?0:-1;A.stone=sstep(.12,.45,p);
    if(P2){A.crownFl=A.crownFl.map((v,k)=>{const t=.3+CRL.indexOf(k)*.025;return v*(1-sstep(t,t+.04,p))});fx('flameout',(p-.3)/.3)}
    const tr=rise(p,.42,.45,.5,.53);A.hp+=.25*tr;A.jaw=Math.max(A.jaw,.4*tr);A.eyeDim=(p<.42?1:.75+.25*Math.sin(TAU*12*p))*(1-sstep(.58,.66,p));
    A.crownOff=p>=.55?1:0;const lo=sstep(.575,.75,p);A.hp-=.45*lo;A.lowF=6*lo;A.lowB=3*lo;A.dimHead=sstep(.42,.6,p);
    A.mound=sstep(.66,.82,p);for(let j=0;j<NTL;j++)A.te[j]=lerp(A.te[j],TLIE[j],sstep(.6,.8,p));A.cCold=sstep(.34,.46,p);
    if(A.mound>0){A.B=[A.B[0],A.B[1],A.B[2]-66*Math.pow(A.mound,1.4)];A.cut=0}
    fx('cough',(p-.47)/.1);fx('crownfall',(p-.52)/.48);fx('dsteam',(p-.12)/.32);fx('firefly',(p-.82)/.18);fx('smokecurl',(p-.8)/.2)}
  // the head looks at you (the game gives the angle): three quarters of it the head, a quarter the neck, never more than 1.2 in all
  if(LOOKM[anim]){const lk=cl(o.look||0,-1.2,1.2);A.hy+=.75*lk;A.nk+=.25*lk}
  // the second phase: the crust and the fire stay on, a little more spring in her
  if(P2&&anim!=='die'){A.col=Math.max(A.col,A.cMode?0:.75);A.cLit=Math.max(A.cLit,.55)}
  if(FROMW[anim]&&o.wph!=null&&p<.12)blendA(A,sPose('walk',o.wph,{p2:o.p2,look:o.look}),1-sstep(0,.12,p));
  if(TOW[anim]&&p>.88)blendA(A,sPose('walk',0,{p2:o.p2,look:o.look}),sstep(.88,1,p));
  // (the ring of fire: the crouch ends in the first stride of the run; the cold collar, and the Frustata after the dash, start from the
  // stride the run was in, o.rph)
  if(anim==='crouch'&&p>.85)blendA(A,sPose('run',0,{p2:o.p2}),sstep(.85,1,p));
  if((anim==='pant'||anim==='whip'||anim==='whip2')&&o.rph!=null&&p<.1)blendA(A,sPose('run',o.rph,{p2:o.p2,rush:anim!=='pant'}),1-sstep(0,.1,p));
  return A}

// ------------------------------------------------------------------ the spine for a pose: rings round it, through the body's frame X
// the trunk: a C bend between the neck and the hips, the neck turned (nk) and bent forward over the chest (npt: the S of the reared
// poses), bent along the curve of a run (curve), lowered at the front or the back, reared up round the hips; the tail: from the hips,
// each piece along its direction (turned with the hips and the curve)
function trunkPt(A,q,u){let x=q[0],y=q[1]+A.bend*Math.sin(Math.PI*u),z=q[2]-lerp(A.lowF,A.lowB,u);
  if(A.nk){const k=cl(1-u*7/3,0,1);if(k>0){const a=A.nk*k,c=Math.cos(a),s=Math.sin(a);const x1=x*c-y*s,y1=x*s+y*c;x=x1;y=y1}}
  if(A.npt){const k=cl(1-u*7/3,0,1);if(k>0){const a=-A.npt*k,c=Math.cos(a),s=Math.sin(a),dz=z-25;const x1=x*c-dz*s;z=25+x*s+dz*c;x=x1}}
  if(A.curve&&x<0)y-=A.curve*x*x/2;
  if(A.rear){const hx=-40,hz=16.5-A.lowB,cr=Math.cos(A.rear),sr=Math.sin(A.rear),dx=x-hx,dz=z-hz;x=hx+dx*cr-dz*sr;z=hz+dx*sr+dz*cr}return[x,y,z]}
function spine(A,X){const S=new Array(NS);
  for(let i=0;i<NT;i++){const r=TRK[i],bw=i>=2&&i<=6?Math.sin(Math.PI*(i-1.5)/5):0;S[i]={c:trunkPt(A,r,i/HI),ry:r[3]*(1+A.br*bw),rz:r[4]*(1+A.br*bw*.7),a:r[5]+A.rear-(A.npt||0)*cl(1-i/HI*7/3,0,1)}}
  const d0=sub(S[HI].c,S[HI-1].c),yb=Math.atan2(d0[1],-d0[0]);let c=S[HI].c,sl=40;
  const tr=A.troll||0,ctr=Math.cos(tr),str=Math.sin(tr);
  for(let j=0;j<NTL;j++){sl+=TSG[j]*.5;const h=A.th[j]+yb-(A.curve?A.curve*sl:0),e=A.te[j],ce=Math.cos(e);let dv=[-ce*Math.cos(h),ce*Math.sin(h),Math.sin(e)];if(tr)dv=[dv[0],dv[1]*ctr-dv[2]*str,dv[1]*str+dv[2]*ctr];sl+=TSG[j]*.5;c=add(c,mul(dv,TSG[j]*A.tlen));
    if(A.tfloor&&c[2]<TRD[j][1]*.95)c=[c[0],c[1],lerp(c[2],TRD[j][1]*.95,cl(A.tfloor,0,1))];S[NT+j]={c,ry:TRD[j][0],rz:TRD[j][1],dv,tl:1}}
  let vP=null;
  for(let i=0;i<NS;i++){const q=S[i];let n;
    // (the side axis is her y made square to the spine: it never flips, even when she rears past upright)
    if(i<NT){const a=S[Math.max(0,i-1)].c,b=S[Math.min(NT-1,i+1)].c,t=nrm(sub(a,b)),v=nrm(sub([0,1,0],mul(t,t[1]))),f=nrm([v[1],-v[0],0]),ca=Math.cos(q.a);n=[ca*f[0],ca*f[1],Math.sin(q.a)];q.v=v}
    else{const j=i-NT,d1=S[i].dv,d2=j<NTL-1?S[i+1].dv:d1;n=nrm(mul(add(d1,d2),-.5));let v=vP;v=nrm(sub(v,mul(n,dot(v,n))));q.v=v}
    q.n=n;q.w=cross(n,q.v);vP=q.v}
  for(const q of S){q.c=X.T(q.c);q.n=X.Rd(q.n);q.v=X.Rd(q.v);q.w=X.Rd(q.w)}
  return S}
// the ring points (3D), their normals and their screen points
function rings(V0,S){for(const q of S){const P3=new Array(M),N3=new Array(M),P2=new Array(M);for(let k=0;k<M;k++){const c=RC[k],s=RS[k];
      P3[k]=[q.c[0]+q.v[0]*c*q.ry+q.w[0]*s*q.rz,q.c[1]+q.v[1]*c*q.ry+q.w[1]*s*q.rz,q.c[2]+q.v[2]*c*q.ry+q.w[2]*s*q.rz];
      N3[k]=nrm([q.v[0]*c/q.ry+q.w[0]*s/q.rz,q.v[1]*c/q.ry+q.w[1]*s/q.rz,q.v[2]*c/q.ry+q.w[2]*s/q.rz]);P2[k]=V0.P(P3[k])}
    q.P3=P3;q.N3=N3;q.P2=P2;q.q=V0.P(q.c)}}
// a point on the body at a (fractional) ring index f, angle th round it (0 = her right side, π/2 = the top), pushed out by `out`
function surf(S,f,th,out){const i=Math.max(0,Math.min(S.length-2,Math.floor(f))),k=cl(f-i,0,1),a=S[i],b=S[i+1],c=lerp3(a.c,b.c,k),v=nrm(lerp3(a.v,b.v,k)),w=nrm(lerp3(a.w,b.w,k)),
  ry=lerp(a.ry,b.ry,k)+(out||0),rz=lerp(a.rz,b.rz,k)+(out||0),cs=Math.cos(th),sn=Math.sin(th);
  return{p:add(c,add(mul(v,cs*ry),mul(w,sn*rz))),n:nrm(add(mul(v,cs/ry),mul(w,sn/rz))),t:nrm(sub(a.c,b.c)),ry,rz}}
// the hulls of a piece of the spine, two rings at a time (cut at the floor)
function pieceHulls(S,i0,i1,cut){const H=[],HC=S.hc||(S.hc={});for(let i=i0;i<i1;i++){if(HC[i]!==undefined){if(HC[i])H.push(HC[i]);continue}const a=S[i],b=S[i+1];let h=null;
    if(cut!=null&&below([a.P3,b.P3],cut)){const pts=cutRows([a.P3,b.P3],cut);if(pts.length>=3)h=chull(pts.map(q=>VV.P(q)))}else h=chull(a.P2.concat(b.P2));
    if(h&&h.length<3)h=null;HC[i]=h;if(h)H.push(h)}return H}
let VV=null;   // the camera of the drawing in progress
const ringF=i=>(i-1)/(NS-2);   // where a ring is along the road of the light (0 the collar, 1 the sceptre)

// ------------------------------------------------------------------ painting the body
// the skin's fill over the whole body: light along the top, the base, the shadow under it (one gradient for all the pieces, so they join)
function skinFill(bb,T){const g=ctx.createLinearGradient(0,bb[1],0,bb[3]);g.addColorStop(0,T.l);g.addColorStop(.16,T.b);g.addColorStop(.55,T.b);g.addColorStop(1,T.d);return g}
// the three tones along a piece: a dark band down its lower side, a warm light down its upper side (as shadeLimb, along the spine). The
// side of each band comes from the ring's own top (+w) and the light from the upper left, never from the bend of the line on the screen
// (it flipped where the tail comes toward us); where the rings crowd on the screen (a piece seen end on) the bands stop
function tubeShade(S,i0,i1,T){const n=i1-i0+1,pts=[],ex=[];for(let i=i0;i<=i1;i++){const q=S[i],o=q.q,a=VV.P(add(q.c,mul(q.v,q.ry))),b=VV.P(add(q.c,mul(q.w,q.rz)));pts.push(o);ex.push([a[0]-o[0],a[1]-o[1],b[0]-o[0],b[1]-o[1]])}
  const DK=[],LT=[];let cd=[],cl2=[],avg=0,cnt=0;
  for(let i=0;i<n;i++){const ia=Math.max(0,i-1),ib=Math.min(n-1,i+1),A2=pts[ia],B2=pts[ib],dx=B2[0]-A2[0],dy=B2[1]-A2[1],l=Math.hypot(dx,dy),q=S[i0+i];
    if(l/(ib-ia||1)<.4*Math.max(q.ry,q.rz)){if(cd.length>1){DK.push(cd);LT.push(cl2)}cd=[];cl2=[];continue}
    let nx=-dy/l,ny=dx/l;const e=ex[i],bl=Math.hypot(e[2],e[3])||1;if((nx*e[2]+ny*e[3])/bl+.6*(-.55*nx-.83*ny)<0){nx=-nx;ny=-ny}
    const ee=Math.sqrt((e[0]*nx+e[1]*ny)**2+(e[2]*nx+e[3]*ny)**2);avg+=ee;cnt++;cd.push([pts[i][0]-nx*ee*.62,pts[i][1]-ny*ee*.62]);cl2.push([pts[i][0]+nx*ee*.52,pts[i][1]+ny*ee*.52])}
  if(cd.length>1){DK.push(cd);LT.push(cl2)}if(!cnt||!DK.length)return;avg/=cnt;
  const a0=ctx.globalAlpha;ctx.globalAlpha=a0*.6;strokeRuns(DK,T.d,Math.max(.6,avg*.7));ctx.globalAlpha=a0*.3;strokeRuns(LT,wa(1),Math.max(.6,avg*.2));ctx.globalAlpha=a0}
// the warm rim along the lit edge of a piece: for every ring the point of its outline farthest toward the light, pulled 1.9 px inside
function pieceRim(S,i0,i1,al){if(LOWFX)return;const pts=[];for(let i=i0;i<=i1;i++){const a=S[Math.max(i0,i-1)].q,b=S[Math.min(i1,i+1)].q;let nx=-(b[1]-a[1]),ny=b[0]-a[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;if(nx*-.55+ny*-.83<0){nx=-nx;ny=-ny}
    const q=S[i],c=q.q;let m=-1e9;for(const w of q.P2)m=Math.max(m,(w[0]-c[0])*nx+(w[1]-c[1])*ny);pts.push([c[0]+nx*(m-1.9),c[1]+ny*(m-1.9)])}
  const b=bbox(pts),cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,Rr=Math.max(b[2]-b[0],b[3]-b[1])/2+4,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.2,cy+Rr*.2);
  g.addColorStop(0,wa(al||.3));g.addColorStop(1,wa(0));ctx.save();ctx.strokeStyle=g;ctx.lineWidth=1.3;ctx.lineCap='round';ctx.lineJoin='round';line(pts);ctx.stroke();ctx.restore()}
// the gold belly: on every ring the arc of its underside from the angle t0 to t1 (higher on the throat and the chest, the gold pectoral
// seen from the front; a narrow band under the tail), only where it faces us, worked out exactly: its edges are the silhouette and a
// smooth line along the body (no saw teeth of quads); one polygon for every ring pair and every piece of arc that shows, in one path
const BELA=i=>i<3?[Math.PI*5/6,Math.PI*13/6]:i===3?[Math.PI*11/12,Math.PI*25/12]:i<NT?[Math.PI,TAU]:[Math.PI*4/3,Math.PI*5/3];
function ringArc(q,t0,t1,n,out){for(let j=0;j<=n;j++){const t=t0+(t1-t0)*j/n,c=Math.cos(t),s=Math.sin(t);out.push([q.c[0]+q.v[0]*c*q.ry+q.w[0]*s*q.rz,q.c[1]+q.v[1]*c*q.ry+q.w[1]*s*q.rz,q.c[2]+q.v[2]*c*q.ry+q.w[2]*s*q.rz])}return out}
// an arc of a ring on the screen from the angle t0 to t1 (either way round), through the ring's own screen points (M of them)
function ringArcS(q,t0,t1,out){const P2=q.P2,f0=t0/TAU*M,f1=t1/TAU*M,at=f=>{const i=Math.floor(f),k=f-i,a=P2[((i%M)+M)%M],b=P2[(((i+1)%M)+M)%M];return[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k]};
  out.push(at(f0));if(f1>f0){for(let i=Math.floor(f0)+1;i<f1;i++)out.push(P2[((i%M)+M)%M])}else{for(let i=Math.ceil(f0)-1;i>f1;i--)out.push(P2[((i%M)+M)%M])}out.push(at(f1));return out}
function bellyPath(S,i0,i1,cut){ctx.beginPath();let any=false;
  for(let i=i0;i<i1;i++){const a=S[i],b=S[i+1],ga=BELA(i),gb=BELA(i+1);
    // the half of the ring that faces us, from the two rings' normals (cos t·D(v)/ry + sin t·D(w)/rz > 0)
    const ph=Math.atan2(VV.D(a.w)/a.rz+VV.D(b.w)/b.rz,VV.D(a.v)/a.ry+VV.D(b.v)/b.ry);
    for(let k=-1;k<=2;k++){const lo=ph-Math.PI/2+k*TAU,hi=ph+Math.PI/2+k*TAU,A0=Math.max(ga[0],lo),A1=Math.min(ga[1],hi),B0=Math.max(gb[0],lo),B1=Math.min(gb[1],hi);
      if(A1-A0<.02||B1-B0<.02)continue;
      // (above the floor the arcs follow the ring's own screen points, its ends in between: no new projections; cut by the floor, in 3D)
      if(cut==null||!below([a.P3,b.P3],cut)){const PA=ringArcS(a,A0,A1,[]);ringArcS(b,B1,B0,PA);ctx.moveTo(PA[0][0],PA[0][1]);for(let j=1;j<PA.length;j++)ctx.lineTo(PA[j][0],PA[j][1]);ctx.closePath();any=true;continue}
      const P3=ringArc(a,A0,A1,Math.max(2,Math.ceil((A1-A0)/.52)),[]);ringArc(b,B1,B0,Math.max(2,Math.ceil((B1-B0)/.52)),P3);
      const Q3=clipZ(P3,cut);if(Q3.length<3)continue;const q0=VV.P(Q3[0]);ctx.moveTo(q0[0],q0[1]);for(let j=1;j<Q3.length;j++){const q=VV.P(Q3[j]);ctx.lineTo(q[0],q[1])}ctx.closePath();any=true}}
  return any}
// the quads round the top of the rings (angles k0..k1 of M), as one path, where they face us
function topPath(S,i0,i1,k0,k1,cut){ctx.beginPath();let any=false;for(let i=i0;i<i1;i++){const a=S[i],b=S[i+1];for(let k=k0;k<k1;k++){const k2=(k+1)%M,n=add(add(a.N3[k],a.N3[k2]),add(b.N3[k],b.N3[k2]));if(VV.F(n)<=0)continue;
  if(cut!=null&&(a.P3[k][2]<cut||b.P3[k][2]<cut))continue;const q=[a.P2[k],a.P2[k2],b.P2[k2],b.P2[k]];ctx.moveTo(q[0][0],q[0][1]);for(let j=1;j<4;j++)ctx.lineTo(q[j][0],q[j][1]);ctx.closePath();any=true}}return any}

// ------------------------------------------------------------------ the model
function salamander2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};anim=MV.includes(anim)?anim:'idle';const V0=V(face),A=sPose(anim,p,o),fx=fxOn(o);A.swimP=p;
  if(o.z)A.B[2]+=o.z/sc;VV=V0;
  // (the leap: the game moves her from the first hole, where the column of lava stays; o.h1 is that hole from her point, in px)
  A.h1=o.h1&&anim==='leap'?[o.h1.x/sc,o.h1.y/sc]:null;
  const K=A.k2>=1?K2:A.k2<=0?K1:palMix(K1,K2,A.k2,'12'),X=frame(A,A.Z0||0),S=A.noBody?null:spine(A,X);if(S)rings(V0,S);
  // the warm pool of light the collar throws on the floor, the shadow (none under the floor)
  if(!LOWFX){const k=cl(.25+.45*A.col*(.5+.5*A.cLit)+.3*A.k2+.3*A.halo,0,1.2)*(A.noBody?.55:1)*(1-A.mound);if(k>.02){const q=V0.P(A.noBody?16:cl(A.B[0],-20,20)-6,A.B[1],0);shine(K.glow,x+q[0]*sc,y+q[1]*sc,90*sc,.22*k,90*.55*C.KR()*sc)}}
  if(S){const sh=[];for(let i=0;i<NS;i+=2){const q=S[i];if(q.c[2]+q.rz<0)continue;sh.push([q.c,q.ry*1.1*(1-cl((q.c[2]-q.rz-4)/60,0,.5))])}if(sh.length)longShadow(V0,x,y,sc,sh,.3*(1-A.mound))}
  // the old skin she slides out of (the moult): the same picture the game keeps on the floor afterwards (N3.salamanderHusk, cool 0). She
  // slides forward out of it: when she faces away from us the old skin is the nearer of the two and covers her (her new head and crown
  // come out of its front), otherwise she covers it (the direction never changes during the moult)
  const huskTop=A.husk&&V0.s<-.15;
  if(A.husk&&!huskTop){N3.salamanderHusk(x,y,face,sc,{cool:0});VV=V0}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  let info=null;if(S)info=bodyParts(L,V0,A,K,o,fx,S,X);
  if(A.swimK>0)swimParts(L,V0,A,K,fx);
  // (the pools, the dome, the column of lava and the falling crown are part of the staging: drawn even without the effects)
  for(const e of A.fx)if(fx||ESS[e.k])fxDraw(V0,L,e,A,K,info);
  run(L);VV=V0;ctx.restore();
  if(huskTop){N3.salamanderHusk(x,y,face,sc,{cool:0});VV=V0}}
// the shadow of a long body: a soft ellipse under every few points of its spine, all in one path
function longShadow(V0,x,y,sc,pts,al){if(typeof noShadow!=='undefined'&&noShadow)return;const k=C.KR();ctx.fillStyle=`rgba(0,0,0,${al==null?.28:al})`;ctx.beginPath();
  for(const[c,r] of pts){const q=V0.P(c[0],c[1],0);ctx.moveTo(x+(q[0]+r)*sc,y+q[1]*sc);ctx.ellipse(x+q[0]*sc,y+q[1]*sc,r*sc,r*.55*k*sc,0,0,TAU)}ctx.fill()}

// the parts of the body (trunk, tail, legs, head, collar) in the list L; returns what the effects need
function bodyParts(L,V0,A,K,o,fx,S,X){const{P,D,F}=V0,cut=A.cut!=null?A.cut:null;
  // the palettes: the old skin going grey (the moult), the body cooling into black stone from the tail (the defeat)
  const KB=A.grey>0?palMix(K,KH,A.grey,'g'+(A.k2>.5?2:1)):K,KST=A.stone>0?KS:null;
  const LB=parts();
  const allQ=[];for(const q of S)allQ.push(q.q);const bb=bbox(allQ),RY=(S[3].ry+S[3].rz)*.5;bb[1]-=RY*1.2;bb[3]+=RY*.8;
  const fill=skinFill(bb,KB.skin),sfill=KST?skinFill(bb,KST.skin):null;
  const pd=PCS.map(([i0,i1])=>{let c=[0,0,0];for(let i=i0;i<=i1;i++)c=add(c,S[i].c);return D(mul(c,1/(i1-i0+1)))});pd[0]-=6;
  const drawn=[];
  for(const pi of[0,1,2]){LB.add(pd[pi],()=>{const[i0,i1]=PCS[pi],H=pieceHulls(S,i0,i1,cut);if(!H.length)return;
    const jn=[];for(const pj of drawn){const[j0,j1]=PCS[pj];if(j1===i0+1||j1===i0)jn.push(...pieceHulls(S,Math.max(j0,j1-2),j1,cut));if(j0===i1-1||j0===i1)jn.push(...pieceHulls(S,j0,Math.min(j1,j0+2),cut))}
    // one path for the piece (the hulls of its ring pairs): the ink stroked under the fill (only its outer half shows), the clip of the marks
    const pa=new Path2D();for(const h of H){pa.moveTo(h[0][0],h[0][1]);for(let i=1;i<h.length;i++)pa.lineTo(h[i][0],h[i][1]);pa.closePath()}
    backBits(V0,S,i0,i1,A,KB,cut,pi,true);
    if(jn.length){ctx.save();ctx.beginPath();ctx.rect(-1e4,-1e4,2e4,2e4);for(const h of jn){ctx.moveTo(h[0][0],h[0][1]);for(const q of h)ctx.lineTo(q[0],q[1]);ctx.closePath()}ctx.clip('evenodd')}
    ctx.lineJoin='round';ctx.lineWidth=2.7;ctx.strokeStyle=INK;ctx.stroke(pa);if(jn.length)ctx.restore();
    ctx.fillStyle=fill;ctx.fill(pa);
    ctx.save();ctx.clip(pa);bodyMarks(V0,S,i0,i1,A,KB,cut,pi,sfill);ctx.restore();
    pieceRim(S,i0,i1,.32);drawn.push(pi);backBits(V0,S,i0,i1,A,KB,cut,pi);
    if(A.husk0&&A.split>0){ctx.save();ctx.clip(pa);splitDraw(V0,S,i0,i1,A,cut);ctx.restore()}})}
  // ---------------- the legs: two bones, carmine fading to gold, three round toes with claws of obsidian. The far ones behind everything,
  // the near ones over the trunk (their outline never drawn where they come out of it). Tucked to the body when she dives or rears
  // (in the defeat each leg turns to stone with the ring it hangs from: the hind ones first, as the cold comes from the tail)
  const fw=X.Rd([1,0,0]);
  for(let l=0;l<4;l++){const sd=l%2?1:-1,front=l<2,u=ROOTU[l],r0=ROOT[l],tp0=trunkPt(A,r0,u),root=X.T(tp0);if(cut!=null&&root[2]<cut-2)continue;
    const f=A.feet[l];let foot=A.yaw?[f[0]+A.B[0],f[1]+A.B[1],f[2]]:[f[0]+A.B[0],f[1]+A.B[1],f[2]];
    const tk=front?A.tuckF:A.tuckH;if(tk>0){const tf=X.T(add(tp0,front?[7,sd*9,-15]:[-13,sd*13,-6]));foot=lerp3(foot,tf,tk)}
    // (reared up: the front legs spread out to her sides at the height of the shoulders, the claws open)
    if(front&&A.raiseF>0){const rf=X.T(add(tp0,[5,sd*26,6]));foot=lerp3(foot,rf,A.raiseF)}
    const ks=A.coolF>=0?sstep(-.04,.04,ringF(front?3:7)-A.coolF):0,KL=ks>0?palMix(KB,KS,ks,'L'+(A.k2>.5?2:1)):KB;
    // the depth: the root's, moved toward us on the near side and away on the far side (no jump while she turns); a raised front leg
    // takes the depth of its hand
    const fs=F(X.Rd([0,sd,0])),near=fs>-.18,pole=X.Rd(front?(A.raiseF>0?nrm(lerp3([-.15,sd,.75],[-.6,sd,-.3],A.raiseF)):[-.15,sd,.75]):[-.55,sd*.85,0]),
      dR=lerp(D(X.T(r0)),D(foot),front?A.raiseF:0)+30*fs;
    LB.add(dR,()=>legDraw(V0,root,foot,pole,BONE[l],LEGR[l],KL,cl(-fs*1.4,0,.6),near,fw,A,front,sd,cut,X))}
  // ---------------- the head with its own camera: the cranium and the jaw, the eyes, the brows, the smile, the crown; the collar round it
  const hd=headFrame(A,S,X),Hd=splitHead(hd.c,hd.F,HE.map(e=>({c:e.c,r:e.r})),HZ,A.jaw*.6,3,12),dH=D(hd.c)+4;
  const KHd=A.dimHead>0?palMix(KB,KS,A.dimHead*.85,'h'+(A.k2>.5?2:1)):KB;
  LB.add(dH,()=>headDraw(V0,hd,Hd,A,KHd,cut,fx));
  if(A.eyeUnder&&cut!=null){const ez0=Math.max(...EYE.map(e=>hd.T(e.c)[2])),k=sstep(.28,.31,A.swimP||0)*(1-sstep(cut+.5,cut+3.5,ez0));if(k>.01)L.add(-6.9e3,()=>floorEyes(V0,hd,KHd,A.lid/.8,A.lk,k))}
  if(!A.husk0)collar(V0,LB,hd,A,A.dimHead>0?KHd:KB,dH,pd[0],cut);
  // ---------------- the defeat: the body as one picture fading into the heap of black rocks
  // ---------------- the defeat: the heap of black rocks grows round her while the body slumps down into it
  if(A.mound>0)L.add(1e4-5,()=>moundDraw(V0,A,K));
  for(const e of LB)L.push(e);
  return{S,hd,X,pd,dH}}

// ------------------------------------------------------------------ markings on the skin of a piece (clipped inside it)
function bodyMarks(V0,S,i0,i1,A,K,cut,pi,sfill){const{P,F}=V0;
  // the gold belly (and the underside of the tail)
  if(bellyPath(S,i0,i1,cut)){const b=bbox(S.slice(i0,i1+1).map(q=>q.q));ctx.fillStyle=skinFill([b[0],b[1]-10,b[2],b[3]+14],K.gold);ctx.fill()}
  // the three tones down the piece
  tubeShade(S,i0,i1,K.skin);
  // the folds of the throat (light lines across the gold) and of the belly (dark gold, every 8): the scales of her underside
  if(pi===0){const FT=[],FB=[];for(const f of[.8,1.7,2.6,3.5,4.4,5.3,6.2]){if(F(surf(S,f,-Math.PI/2,.2).n)<-.2)continue;let cur=[];for(let j=0;j<=4;j++){const th=-Math.PI*.2-j/4*Math.PI*.6,s=surf(S,f,th,.2);if(F(s.n)>.1&&(cut==null||s.p[2]>cut))cur.push(P(s.p));else{if(cur.length>1)(f<2?FT:FB).push(cur);cur=[]}}if(cur.length>1)(f<2?FT:FB).push(cur)}
    strokeRuns(FT,'rgba(255,246,214,.35)',1);strokeRuns(FB,'rgba(150,78,22,.38)',1)}
  const cf=A.coolF;   // the defeat: the rings past this (from the tail) are cold
  // the spots of the flanks: an ember rim and a bright core that lights in a wave from the collar to the tail
  if(pi===0){const lit2=[];for(const[f,th,r,el,i] of SPOTS){const s=surf(S,f,th,.3),v=F(s.n);if(v<=.05)continue;if(cut!=null&&s.p[2]<cut)continue;const w=A.spotW>=0?pls(A.spotW,.1+i*.18,.36):0;
      let br=cl(A.spot+A.spotA*w,0,1);if(cf>=0&&ringF(f)>cf)br=-1;lit2.push([discE(V0,s.p,s.n,1,s.t,el),r,br,v])}
    // (each spot's screen ellipse is worked out once, at radius 1, and scaled)
    const el=(e,r)=>{ctx.moveTo(e[0]+e[2]*r*Math.cos(e[4]),e[1]+e[2]*r*Math.sin(e[4]));ctx.ellipse(e[0],e[1],e[2]*r,e[3]*r,e[4],0,TAU)};
    ctx.beginPath();for(const[e,r,br] of lit2)if(br>=0)el(e,r);ctx.fillStyle=K.spotE;ctx.fill();
    if(cf>=0){ctx.beginPath();for(const[e,r,br] of lit2)if(br<0)el(e,r);ctx.fillStyle='#2a2232';ctx.fill()}
    {const BQ=new Map(),hot=[];for(const[e,r,br] of lit2){if(br<0)continue;const qb=Math.round(br*6)/6;let a=BQ.get(qb);if(!a){a=[];BQ.set(qb,a)}a.push([e,r]);if(br>.55)hot.push([e,r*.3*br])}
      for(const[qb,a] of BQ){ctx.beginPath();for(const[e,r2] of a)el(e,r2*(.55+.25*qb));ctx.fillStyle=cmix(K.org,K.spot,.4+.6*qb);ctx.fill()}
      if(hot.length){ctx.beginPath();for(const[e,r2] of hot)el(e,r2);ctx.fillStyle=K.core;ctx.fill()}}
    if(!LOWFX)for(const[e,r,br,v] of lit2)if(br>.58&&r>4&&v>.08)shine(K.glow,e[0],e[1],r*2.6,.36*br*sstep(.08,.4,v))}
  // the islands of crust of the second phase
  if(A.k2>.02&&A.grey<.5){ga(A.k2,()=>{for(const[f,th,r] of ISLES){if(f<i0||f>i1)continue;const s=surf(S,f,th,.25),v=F(s.n);if(v<=.08)continue;if(cut!=null&&s.p[2]<cut)continue;const e=discE(V0,s.p,s.n,r);ctx.beginPath();
    for(let k=0;k<9;k++){const a=k/9*TAU,rr=1+.22*Math.sin(k*2.3+f*3);ctx.lineTo(e[0]+Math.cos(e[4])*Math.cos(a)*e[2]*rr-Math.sin(e[4])*Math.sin(a)*e[3]*rr,e[1]+Math.sin(e[4])*Math.cos(a)*e[2]*rr+Math.cos(e[4])*Math.sin(a)*e[3]*rr)}ctx.closePath();
    ctx.fillStyle=K.crust;ctx.fill();ctx.strokeStyle=K.crustE;ctx.lineWidth=1.3;ctx.stroke()}})}
  // the moult: the cracks of light (from the crown to the tail), the split down the back with the new skin glowing in it
  if(A.crack>=0&&A.crack<1.2&&!A.husk){const R=[];for(const cr of CRK){const pts=[];for(const[f,th] of cr){if(f<i0-.5||f>i1+.5)continue;if(ringF(f)>A.crack*1.1)break;const s=surf(S,f,th,.2);if(F(s.n)>.05)pts.push(P(s.p));else if(pts.length>1){R.push(pts.slice());pts.length=0}}if(pts.length>1)R.push(pts)}
    if(R.length){const al=1-sstep(.85,1.15,A.crack+(A.split>0?A.split:0));ga(al,()=>{if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';strokeRuns(R,`rgba(${K.glow},.4)`,3.6);ctx.restore()}strokeRuns(R,K.yel,1.4);strokeRuns(R,K.core,.6)})}}
  if(A.split>0&&!A.husk0)splitDraw(V0,S,i0,i1,A,cut);
  // the slit of magma down the back, under the domes (the road of the light): a dark groove with a dim core; the light that runs down it
  // with a pearl at its head; white in a flash when she is hit
  {const pts=[],fs=[],fr=[];for(let i=Math.max(1,i0);i<=i1;i++){const q=S[i];pts.push(q.P2[KT]);fs.push(F(q.N3[KT])>-.15&&(cut==null||q.P3[KT][2]>cut));fr.push(ringF(i))}
    if(pts.length>1){const runs=[],cold=[];let cur=[],cc=[];for(let i=0;i<pts.length;i++){const isC=cf>=0&&fr[i]>cf;if(fs[i]&&!isC)cur.push(pts[i]);else{if(cur.length>1)runs.push(cur);cur=[]}if(fs[i]&&isC)cc.push(pts[i]);else{if(cc.length>1)cold.push(cc);cc=[]}}
      if(cur.length>1)runs.push(cur);if(cc.length>1)cold.push(cc);
      strokeRuns(runs,K.slit,3.4);strokeRuns(runs,cmix(K.red,K.org,.5*A.cLit),1.5);if(cold.length){strokeRuns(cold,'#15101a',3);strokeRuns(cold,'#4a4056',1)}
      if(A.flashW>0)ga(A.flashW,()=>{strokeRuns(runs,'#fff6e0',2.2)});
      for(const rn of A.run){if(rn.w!=='back'||rn.al<=.01)continue;const seg=[];for(let i=0;i<pts.length-1;i++){const f0=fr[i],f1=fr[i+1],lo=Math.max(rn.a,f0),hi=Math.min(rn.b,f1);if(hi<=lo||!fs[i]||!fs[i+1])continue;
          const k0=(lo-f0)/(f1-f0),k1=(hi-f0)/(f1-f0);seg.push([[lerp(pts[i][0],pts[i+1][0],k0),lerp(pts[i][1],pts[i+1][1],k0)],[lerp(pts[i][0],pts[i+1][0],k1),lerp(pts[i][1],pts[i+1][1],k1)]])}
        if(seg.length)ga(rn.al,()=>{if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';strokeRuns(seg,`rgba(${K.glow},.45)`,6);ctx.restore()}strokeRuns(seg,K.yel,2.4);strokeRuns(seg,K.core,1)});
        // the pearl of light at the head of the run
        const hf=rn.rev?rn.a:rn.b;if(hf>.001&&hf<.999)for(let i=0;i<pts.length-1;i++){if(fr[i]<=hf&&fr[i+1]>=hf&&fs[i]){const k=(hf-fr[i])/(fr[i+1]-fr[i]),q=[lerp(pts[i][0],pts[i+1][0],k),lerp(pts[i][1],pts[i+1][1],k)];ga(rn.al,()=>{if(!LOWFX)shine(K.glow,q[0],q[1],10,.6);ctx.fillStyle=K.core;ball(q,2.4);ctx.fill()});break}}}}}
  for(const rn of A.run){if(rn.w!=='back'||rn.al<=.01)continue;const seg=[];
    if(pi>0){for(let i=Math.max(i0,1);i<i1;i++){const f0=ringF(i),f1=ringF(i+1),lo=Math.max(rn.a,f0),hi=Math.min(rn.b,f1);if(hi<=lo)continue;if(cut!=null&&S[i].c[2]<cut)continue;
        const p0=S[i].q,p1=S[i+1].q,k0=(lo-f0)/(f1-f0),k1=(hi-f0)/(f1-f0);seg.push([[lerp(p0[0],p1[0],k0),lerp(p0[1],p1[1],k0)],[lerp(p0[0],p1[0],k1),lerp(p0[1],p1[1],k1)]])}}
    else for(const sd of[-1,1]){let cur=[];for(let i=1;i<=Math.min(i1,HI+1);i++){const f=ringF(i),th=Math.PI/2+sd*1.05;if(f>rn.b+.03||f<rn.a-.03){if(cur.length>1)seg.push(cur);cur=[];continue}
        const sf=surf(S,i,th,.1);if(F(sf.n)>.05&&(cut==null||sf.p[2]>cut))cur.push(P(sf.p));else{if(cur.length>1)seg.push(cur);cur=[]}}if(cur.length>1)seg.push(cur)}
    if(seg.length)ga(rn.al,()=>{if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';strokeRuns(seg,`rgba(${K.glow},.3)`,pi>0?7:6);ctx.restore()}if(pi>0||LOWFX)strokeRuns(seg,`rgba(255,214,110,${pi>0?.55:.35})`,1.4)})}
  // the defeat: the cold rings, black stone
  if(cf>=0&&sfill&&cf<1){ctx.beginPath();let any=false;for(let i=Math.max(i0,1);i<i1;i++){if(ringF(i+1)<cf-.02)continue;const h=chull(S[i].P2.concat(S[i+1].P2));ctx.moveTo(h[0][0],h[0][1]);for(const q of h)ctx.lineTo(q[0],q[1]);ctx.closePath();any=true}
    if(any){ctx.save();ctx.globalAlpha*=.92;ctx.fillStyle=sfill;ctx.fill();ctx.restore()}}}
// the split down the back of the moult
  // (one narrow strip along the spine with its two lips, no grid of quads: on her the new skin glows in it; on the empty old skin it is a
  // dark slit with a thread of warmth on its lips that cools, the lips curled a little)
function splitDraw(V0,S,i0,i1,A,cut){const{P,F}=V0;
  {const fr=A.split*1.02,i9=Math.min(i1,Math.floor(lerp(0,NS-1,fr))+1);if(i9>i0){
    const hw=A.husk0?.14:lerp(.03,.2,sstep(0,.3,A.split)),RA=[],RB=[],CA=[],CB=[];let ra=[],rb=[],ca=[],cb=[];
    const flush=()=>{if(ra.length>1){RA.push(ra);RB.push(rb);CA.push(ca);CB.push(cb)}ra=[];rb=[];ca=[];cb=[]};
    for(let i=i0;i<=i9;i++){const q=S[i];if(!(F(q.N3[KT])>-.1&&(cut==null||q.P3[KT][2]>cut))){flush();continue}
      ra.push(P(surf(S,i,Math.PI/2+hw,.3).p));rb.push(P(surf(S,i,Math.PI/2-hw,.3).p));if(A.husk0){ca.push(P(surf(S,i,Math.PI/2+hw+.07,.5).p));cb.push(P(surf(S,i,Math.PI/2-hw-.07,.5).p))}}
    flush();
    if(RA.length){ctx.beginPath();for(let r=0;r<RA.length;r++){const a=RA[r],b=RB[r];ctx.moveTo(a[0][0],a[0][1]);for(const q of a)ctx.lineTo(q[0],q[1]);for(let j=b.length-1;j>=0;j--)ctx.lineTo(b[j][0],b[j][1]);ctx.closePath()}
      const lips=RA.concat(RB),bb=bbox([].concat(...lips));
      if(A.husk0){const g=ctx.createLinearGradient(0,bb[1],0,bb[3]+1);g.addColorStop(0,'#1e1614');g.addColorStop(1,'#3a2a26');ctx.fillStyle=g;ctx.fill();
        const wm=1-(A.coolH||0);strokeRuns(lips,'rgba(18,12,10,.8)',1.1);if(wm>.03)strokeRuns(lips,`rgba(255,${120+60*wm|0},60,${.75*wm})`,.7);
        strokeRuns(CA.concat(CB),'rgba(176,164,154,.6)',.8)}
      else{const a0=ctx.globalAlpha;ctx.globalAlpha=a0*(A.husk?A.grey:1);ctx.fillStyle=skinFill(bb,K2.skin);ctx.fill();strokeRuns(lips,'rgba(30,18,16,.75)',1.2);ctx.globalAlpha=a0}}}}
}
// the cracks of light of the moult: paths over the skin from the neck to the tail (ring index, angle)
const CRK=[[[.5,1.2],[1.4,1.0],[2.4,1.15],[3.3,.95],[4.4,1.05],[5.4,.9],[6.5,1.0],[7.6,.85],[8.8,1.1],[10,1.2],[11.3,1.0]],
  [[.6,2.0],[1.6,2.2],[2.6,2.0],[3.7,2.25],[4.8,2.1],[5.9,2.3],[7,2.15],[8.1,2.3],[9.3,2.0],[10.6,2.1],[12,2.0]],
  [[2,.3],[3,.15],[4.1,.35],[5.2,.2],[6.3,.4]],[[2.2,2.85],[3.3,3.0],[4.3,2.8],[5.5,2.95],[6.6,2.75]]];
// the domes of obsidian along the back, the spines of the tail, the sceptre (they stick out of the outline), drawn after the piece
// (far: only the domes and spines whose top faces away from us, drawn before the piece so it covers them; the others after it)
function backBits(V0,S,i0,i1,A,K,cut,pi,far){const{P,F}=V0;
  const cold=A.coolF>=0;
  for(const pl of PLOC){const f=pl.f;if(f<PCO[pi]||f>=PCO[pi+1])continue;const s=surf(S,f,Math.PI/2,-.6),up=s.n,t=s.t,sd=nrm(cross(up,t)),o=s.p;if(cut!=null&&o[2]+pl.Hh<cut)continue;if((F(up)<.08)!==!!far)continue;
    // the dome's points and face normals are kept in its own frame (along the spine, across, up) and turned into place
    const W3=q=>[t[0]*q[0]+sd[0]*q[1]+up[0]*q[2],t[1]*q[0]+sd[1]*q[1]+up[1]*q[2],t[2]*q[0]+sd[2]*q[1]+up[2]*q[2]],P2=pl.V.map(q=>{const w=W3(q);return P(o[0]+w[0],o[1]+w[1],o[2]+w[2])}),NN=pl.N.map(W3);
    const r=gem(V0,P2,STUDF,NN,A.husk0?KHP:K.obs,{lw:1.9,q:4});if(!r)continue;
    if(!A.husk0&&pl.dot){const hq=P2[4];ctx.fillStyle='rgba(236,230,255,.6)';ball([hq[0]-.6,hq[1]-.4],.8);ctx.fill()}
    if(K.edge&&A.k2>0&&!(cold&&ringF(f)>A.coolF))edgeIn(r.H,1.3,K.edge,A.k2)}
  // the spines of the tail: little fins of obsidian leaning back, all of one colour (filled together)
  ctx.beginPath();let any=false;for(const[f,h] of SPINES){if(f<PCO[pi]||f>=PCO[pi+1])continue;const s=surf(S,f,Math.PI/2,-.4);if(cut!=null&&s.p[2]<cut+.5)continue;if((F(s.n)<.08)!==!!far)continue;
    const sd=nrm(cross(s.n,s.t)),w=Math.max(.7,h*.22),a=add(s.p,mul(s.t,h*.75)),b=add(s.p,mul(s.t,-h*.55)),tip=add(add(s.p,mul(s.n,h*1.15)),mul(s.t,-h*.85));
    const h2=chull([a,b,tip,add(s.p,mul(sd,w)),add(s.p,mul(sd,-w))].map(q=>P(q)));ctx.moveTo(h2[0][0],h2[0][1]);for(const q of h2)ctx.lineTo(q[0],q[1]);ctx.closePath();any=true}
  if(any){ctx.fillStyle=A.husk0?KHP.b:K.obs.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.lineJoin='round';ctx.stroke()}
  if(i1===NS-1&&!A.husk0&&!far)sceptre(V0,S,A,K,cut)}
const KHP=T3('#8a7c74','#5e5048','#30262a');
// the faces of a dome of the back (outward, in order: front right, back right, front left, back left)
const STUDF=[[0,1,4],[1,2,5,4],[3,0,4],[2,3,4,5]].map(f=>f.slice());STUDF[2]=[0,3,4];STUDF[3]=[3,2,5,4];
const PLOC=PLATES.map(([f,Lp,W,Hh],i)=>{const V=[[Lp/2,0,0],[0,W/2,-.6],[-Lp/2,0,0],[0,-W/2,-.6],[.15*Lp,0,Hh],[-.15*Lp,0,Hh]];return{f,Hh,V,dot:i<2,N:STUDF.map(fc=>{const a=V[fc[0]],b=V[fc[1]],c=V[fc[2]];return nrm(cross(sub(b,a),sub(c,a)))})}});
// the sceptre: a faceted drop of obsidian, its heart of magma showing between the faces; white-hot before the lash; out when she dies
const SCV=(()=>{const V=[[0,0,0]],F=[];for(let i=0;i<4;i++){const a=i/4*TAU+.4;V.push([.58,Math.cos(a),Math.sin(a)])}V.push([1,0,0]);
  for(let i=0;i<4;i++){const j=(i+1)%4;F.push([0,1+i,1+j]);F.push([1+i,5,1+j])}return{V,F}})();
// its face normals in its own frame (along the tail, across, across), worked out once
const SCN=(()=>{const Ls=SCEP+4,W=5.4,V=SCV.V.map(q=>[q[0]*Ls,q[1]*W,q[2]*W]),c=[.45*Ls,0,0];return SCV.F.map(f=>{const q=f.map(i=>V[i]);let n=fnorm(q);if(dot(n,sub(cen(q),c))<0)n=mul(n,-1);return n})})();
function sceptre(V0,S,A,K,cut){const{P,F}=V0,e=S[NS-1],d=nrm(sub(e.c,S[NS-2].c)),[u,v]=frm(d,[0,0,1]),b=add(e.c,mul(d,-3)),Ls=SCEP+4,W=5.4;
  const at=q=>{const x=q[0]*Ls,y=q[1]*W,z=q[2]*W;return[b[0]+d[0]*x+u[0]*y+v[0]*z,b[1]+d[1]*x+u[1]*y+v[1]*z,b[2]+d[2]*x+u[2]*y+v[2]*z]},VV2=SCV.V.map(at);if(cut!=null&&VV2.every(q=>q[2]<cut))return;
  const FS=SCV.F.map(f=>f.map(i=>VV2[i])),NSx=SCN.map(n=>[d[0]*n[0]+u[0]*n[1]+v[0]*n[2],d[1]*n[0]+u[1]*n[1]+v[1]*n[2],d[2]*n[0]+u[2]*n[1]+v[2]*n[2]]);
  const off=A.scep<0,hot=Math.max(0,A.scep),T=hot>0?mixT(K.obs,T3('#ffffff','#fff3c4','#ffb040'),hot):K.obs;
  if(!LOWFX&&!off){const q=P(at([.58,0,0]));shine(K.glow,q[0],q[1],10+12*hot,.32+.5*hot)}
  const r=facets(V0,FS,T,{lw:2,seamCol:off?'rgba(140,120,160,.25)':'rgba(255,160,80,.45)'},NSx);if(!r)return;
  const q=P(at([.58,0,0]));if(!off){ctx.fillStyle=cmix(K.red,K.org,.5+.5*hot);ball(q,2.4+hot);ctx.fill();ctx.fillStyle=cmix(K.yel,K.core,hot);ball(q,1.3+hot);ctx.fill()}
  const tq=P(at([.8,.25,-.3]));ctx.fillStyle='rgba(236,230,255,.8)';ball(tq,.8);ctx.fill()}

// ------------------------------------------------------------------ a leg: two bones (IK), the far ones darker
function legDraw(V0,root,foot,pole,bn,lr,K,dark,near,fw,A,front,sd,cut,X){const{P}=V0,fp=add(foot,[0,0,3.2]),[kn,an]=ik(root,fp,bn[0],bn[1],pole),A2=P(root),K2=P(kn),T2=P(an);
  if(cut!=null&&kn[2]<cut&&an[2]<cut)return;
  const sk=dark>0?mixT(K.skin,T3(K.skin.b,K.skin.d,K.skin.d),dark):K.skin,gd=dark>0?mixT(K.gold,T3(K.gold.b,K.gold.d,K.gold.d),dark):K.gold;
  // the foot: three round toes splayed forward and out, a claw of obsidian on each (none under the floor)
  const fl=Math.hypot(fw[0],fw[1]),bu=X.Rd([0,0,1]),fh=fl>.3?[fw[0]/fl,fw[1]/fl,0]:nrm([-bu[0],-bu[1],1e-4]),fd=foot[2]<3?fh:nrm(lerp3(fh,fw,sstep(.25,.75,Math.abs(fw[2])))),side=X.Rd([0,1,0]),toes=[],fz=cut!=null&&foot[2]<cut+1?false:true,spr=.62+(front?.45*A.raiseF:0);if(fz)for(let i=-1;i<=1;i++){const d=nrm(add(fd,mul(side,i*spr+sd*.25))),b=add(foot,[0,0,1.6]),t=add(add(foot,mul(d,7.2)),[0,0,1.2]);toes.push([P(b),P(t),d])}
  const ink2=near?(()=>{ctx.save();ctx.beginPath();ctx.rect(-1e4,-1e4,2e4,2e4);ctx.moveTo(A2[0]+lr[0]*1.7,A2[1]);ctx.arc(A2[0],A2[1],lr[0]*1.7,0,TAU);ctx.clip('evenodd')}):null;
  if(ink2)ink2();ctx.fillStyle=INK;ctx.beginPath();capsP(A2,lr[0]+1.3,K2,lr[1]+1.3);capsP(K2,lr[1]+1.3,T2,lr[1]*.85+1.3);ctx.fill();if(ink2)ctx.restore();
  if(fz){ctx.fillStyle=INK;ctx.beginPath();for(const[b,t] of toes)capsP(b,2.8+1.25,t,2.5+1.25);ballP(P(add(foot,[0,0,2])),4.4+1.25);ctx.fill();
    ctx.beginPath();ballP(P(add(foot,[0,0,2])),4.4);ctx.fillStyle=cmix(sk.b,sk.d,.4);ctx.fill();ctx.beginPath();for(const[b,t] of toes)capsP(b,2.8,t,2.5);ctx.fillStyle=gd.b;ctx.fill();
    ctx.beginPath();for(const[b,t] of toes)ballP([t[0]-.5,t[1]-.7],1);ctx.fillStyle=gd.l;ctx.fill()}
  // (the near legs darken toward the foot; the far ones, in shadow, are one tone)
  let g=sk.b;if(near){g=ctx.createLinearGradient(A2[0],A2[1],T2[0],T2[1]);g.addColorStop(0,sk.b);g.addColorStop(.6,sk.b);g.addColorStop(1,cmix(sk.b,sk.d,.4))}
  ctx.beginPath();capsP(A2,lr[0],K2,lr[1]);capsP(K2,lr[1],T2,lr[1]*.85);ctx.fillStyle=g;ctx.fill();
  if(near)shadeLimb([A2,K2,T2],[lr[0],lr[1],lr[1]*.85],'rgba(60,8,4,.3)',.2);
  // the light that runs down into the front legs before the dive (the claws go white)
  if(front)for(const rn of A.run){if(rn.w!=='legs'||rn.al<=.01||rn.b<=.01)continue;const pts=[A2,K2,T2],L1=Math.hypot(K2[0]-A2[0],K2[1]-A2[1]),L2=Math.hypot(T2[0]-K2[0],T2[1]-K2[1]),Lt=L1+L2,e=rn.b*Lt,run=[A2];
    if(e<=L1)run.push([lerp(A2[0],K2[0],e/L1),lerp(A2[1],K2[1],e/L1)]);else{run.push(K2);run.push([lerp(K2[0],T2[0],(e-L1)/L2),lerp(K2[1],T2[1],(e-L1)/L2)])}
    ga(rn.al,()=>{if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';strokeRuns([run],`rgba(${K.glow},.4)`,5);ctx.restore()}strokeRuns([run],K.yel,1.8);const q=run[run.length-1];if(rn.b<.99){ctx.fillStyle=K.core;ball(q,2);ctx.fill()}})}
  // the claws
  if(fz){ctx.beginPath();for(const[b,t,d] of toes){const e=P(add(add(foot,mul(d,10.2)),[0,0,.4])),dx=e[0]-t[0],dy=e[1]-t[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*1.5,ny=dx/l*1.5;ctx.moveTo(t[0]+nx,t[1]+ny);ctx.lineTo(e[0],e[1]);ctx.lineTo(t[0]-nx,t[1]-ny);ctx.closePath()}
    ctx.fillStyle=A.claw>0?cmix(K.obs.b,'#fff6e0',A.claw):K.obs.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.stroke();
    if(A.claw>.3&&!LOWFX)for(const[b,t] of toes)shine('255,240,200',t[0],t[1],5,.3*A.claw)}}

// ------------------------------------------------------------------ the head
// its frame: on the neck node, turned by the look (o.look, the move and the neck), nodding, rolling; it partly follows the trunk when
// she rears up; hx/hz push it along its own axes (the snaps of the spit)
function headFrame(A,S,X){const nk=S[0],hy=A.hy+A.nk,hp=A.hp+A.rear*(A.rearHead==null?.55:A.rearHead)-(A.lean||0)*.0,hr=A.hr;
  const R0=v=>X.Rd(rotZ(rotY(rotX(v,hr),-hp),hy));return linFrame(R0([1,0,0]),R0([0,1,0]),R0([0,0,1]),(u,v,w)=>add(add(nk.c,lin3(u,v,w,mul(HNK,-1))),add(mul(u,A.hx||0),mul(w,A.hz||0))))}
// a frame from its three axes (the turn is linear: one matrix product per point instead of the rotations); c from the axes
const lin3=(u,v,w,d)=>[u[0]*d[0]+v[0]*d[1]+w[0]*d[2],u[1]*d[0]+v[1]*d[1]+w[1]*d[2],u[2]*d[0]+v[2]*d[1]+w[2]*d[2]];
function linFrame(u,v,w,cf){const c=typeof cf==='function'?cf(u,v,w):cf;return{c,F:{u,v,w},R:d=>lin3(u,v,w,d),T:d=>[c[0]+u[0]*d[0]+v[0]*d[1]+w[0]*d[2],c[1]+u[1]*d[0]+v[1]*d[1]+w[1]*d[2],c[2]+u[2]*d[0]+v[2]*d[1]+w[2]*d[2]]}}
// the throat lit from inside (the spit): a glow that climbs from the back of the jaw to the mouth
const THR0=[-13,0,-6.5],THR1=[16,0,-5];
function headDraw(V0,hd,Hd,A,K,cut,fx){const{P,F}=V0,T=hd.T,fwd=F(hd.F.u),under=cut!=null&&hd.c[2]<cut-14;
  if(under){crownDraw(V0,hd,A,K,null,cut);return}
  // the far brow first (behind the cranium), then the jaw and the inside of the mouth, the cranium, the face, the near brow over it
  const brows=BROW.map(b=>({b,f:F(hd.R(b.en))}));
  for(const w of brows)if(w.f<=.1)browDraw(V0,hd,w.b,A,K,true,sstep(-.3,.1,w.f),cut);
  // the jaw: carmine on top, the gold of the throat under it (it swells when she fills her throat with fire)
  let bw=[].concat(...Hd.bowl);if(A.cheek>0){const{u,v,w}=hd.F;bw=bw.map(q=>{const d=sub(q,hd.c),lx=dot(d,u),ly=dot(d,v),k=A.cheek*(1-sstep(-6,14,lx));return k>0?add(q,add(mul(w,-4*k),mul(v,ly*.12*k))):q})}
  if(cut!=null&&below([bw],cut))bw=cutRows([bw],cut);
  let jw=[];if(bw.length>2){jw=hullE(bw.map(q=>P(q)),.08);if(jw.length>2){const b=bbox(jw),g=ctx.createLinearGradient(0,b[1],0,b[3]);g.addColorStop(0,K.skin.b);g.addColorStop(.42,K.gold.b);g.addColorStop(1,K.gold.d);svol3(V0,jw,K.skin,{lw:2.5,scr:1,fill:g})}}
  if(jw.length>2&&(A.throat>0||A.run.length)){ctx.save();ctx.clip(jw.path);
    if(A.throat>0){const q=P(Hd.jaw(lerp3(THR0,THR1,.55))),gr=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],20);gr.addColorStop(0,`rgba(255,236,170,${.85*A.throat})`);gr.addColorStop(.5,`rgba(255,140,50,${.5*A.throat})`);gr.addColorStop(1,'rgba(255,90,30,0)');ctx.fillStyle=gr;ctx.fill(jw.path)}
    for(const rn of A.run){if(rn.w!=='throat'||rn.al<=.01||rn.b<=.01)continue;const q=P(Hd.jaw(lerp3(THR0,THR1,rn.b))),q0=P(Hd.jaw(THR0));ga(rn.al,()=>{if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';strokeRuns([[q0,q]],`rgba(${K.glow},.5)`,7);ctx.restore()}strokeRuns([[q0,q]],K.yel,2.2);if(rn.b<.99){if(!LOWFX)shine(K.glow,q[0],q[1],10,.6);ctx.fillStyle=K.core;ball(q,2.2);ctx.fill()}})}
    ctx.restore()}
  if(A.jaw>.03&&F(Hd.wJ)>.02){const fl=Hd.floor.filter(q=>cut==null||q[2]>cut).map(q=>P(q));if(fl.length>2){const h=chull(fl);poly(h);ctx.fillStyle=K.mouth;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();
    ctx.save();poly(h);ctx.clip();let mx=0,my=0;for(const q of h){mx+=q[0];my+=q[1]}mx/=h.length;my/=h.length;const hq=P(Hd.jaw([-10,0,Hd.hz])),m=[lerp(mx,hq[0],.3),lerp(my,hq[1],.3)],bh=bbox(h),g=ctx.createRadialGradient(m[0],m[1],1,m[0],m[1],Math.max(8,Math.max(bh[2]-bh[0],bh[3]-bh[1])*.6)+6*A.throat);g.addColorStop(0,'rgba(255,244,190,1)');g.addColorStop(.3,'rgba(255,150,50,.9)');g.addColorStop(.7,'rgba(200,50,20,.45)');g.addColorStop(1,'rgba(160,30,10,0)');ctx.fillStyle=g;ctx.fill();
    // the forked tongue lying in it
    const t0=P(Hd.jaw([-8,0,Hd.hz+.5])),t1=P(Hd.jaw([9+5*A.tongue,0,Hd.hz+.7])),d=[t1[0]-t0[0],t1[1]-t0[1]],l=Math.hypot(d[0],d[1])||1,nx=-d[1]/l,ny=d[0]/l;ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=4.2;seg(t0,t1);ctx.stroke();ctx.strokeStyle=K.tongue;ctx.lineWidth=2.6;seg(t0,t1);ctx.stroke();
    ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(t1[0],t1[1]);ctx.lineTo(t1[0]+d[0]/l*3+nx*2,t1[1]+d[1]/l*3+ny*2);ctx.moveTo(t1[0],t1[1]);ctx.lineTo(t1[0]+d[0]/l*3-nx*2,t1[1]+d[1]/l*3-ny*2);ctx.stroke();ctx.restore()}}
  // the cranium with the mounds of the eyes on it (one outline: the head rises to the eyes, then slopes down to the nostrils)
  const dp=(cut!=null&&below(Hd.dome,cut)?cutRows(Hd.dome,cut):[].concat(...Hd.dome)).map(q=>P(q));
  for(const m of MOUND){if(cut!=null&&hd.T(m.c)[2]<cut+2)continue;for(const q of ellSil(V0,m.c,m.r,AXES,hd.T,12))dp.push(q)}
  if(dp.length<3){crownDraw(V0,hd,A,K,null,cut);return}
  const sk=svol3(V0,hullE(dp,.08),K.skin,{lw:2.6,rim:.3,scr:1});hd.sk=sk;if(sk.length<3)return;

  // the dark under the brows
  for(const e of EYE){const n=hd.R(e.n);if(F(n)<.3)continue;const q=P(T(add(e.c,[0,0,3.5])));ctx.fillStyle=`rgba(40,6,4,${.28*sstep(.3,.5,F(n))})`;ctx.beginPath();ctx.ellipse(q[0],q[1],6,3.4,0,0,TAU);ctx.fill()}
  // the long smile with its thread of magma (the light of the furnace inside); the corners rise up under the eyes (more when she smirks)
  {const runs=[];let cur=[];for(const s of SMILE){const v=F(hd.R(s.n));const pp=A.smirk>0?add(s.p,[0,0,2.2*A.smirk*s.k*s.k]):s.p;if(v>.04&&(cut==null||T(pp)[2]>cut))cur.push(P(T(pp)));else{if(cur.length>1)runs.push(cur);cur=[]}}if(cur.length>1)runs.push(cur);
    strokeRuns(runs,INK,2.2);if(A.jaw<.15){const th=cl(.45+.55*A.throat+.3*A.cLit,0,1)*(1-A.dimHead);if(!LOWFX&&th>.05){ctx.save();ctx.globalCompositeOperation='lighter';strokeRuns(runs,`rgba(${K.glow},${.35*th})`,4);ctx.restore()}strokeRuns(runs,cmix(K.red,K.yel,th),1)}}
  // the nostrils
  for(const nz of NOSE){const v=F(hd.R(nz.n));if(v<.2)continue;const q=P(T(nz.c));ctx.fillStyle='rgba(40,6,4,.8)';ctx.beginPath();ctx.ellipse(q[0],q[1],1.4*Math.max(.4,v),.9,0,0,TAU);ctx.fill()}
  // the eyes
  for(const e of EYE)eyeDraw(V0,hd,e,A,K,cut);
  // the tongue that tastes the air: out of the front of the closed mouth, forked
  if(A.tongue>.02&&A.jaw<.2&&fwd>-.2){const b0=T(add(LIPT,[-1,0,0])),tp=T(add(LIPT,[3+11*A.tongue,0,-1.5])),q0=P(b0),q1=P(tp),d=[q1[0]-q0[0],q1[1]-q0[1]],l=Math.hypot(d[0],d[1])||1,nx=-d[1]/l,ny=d[0]/l;
    ctx.strokeStyle=INK;ctx.lineWidth=3.2;ctx.lineCap='round';seg(q0,q1);ctx.stroke();ctx.strokeStyle=K.tongue;ctx.lineWidth=1.6;seg(q0,q1);ctx.stroke();
    ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(q1[0],q1[1]);ctx.lineTo(q1[0]+d[0]/l*2.6+nx*1.8,q1[1]+d[1]/l*2.6+ny*1.8);ctx.moveTo(q1[0],q1[1]);ctx.lineTo(q1[0]+d[0]/l*2.6-nx*1.8,q1[1]+d[1]/l*2.6-ny*1.8);ctx.stroke()}
  // two little fangs from the upper lip, in front
  if(fwd>-.25){for(const{sd,r} of FANG){if(F(hd.R([.5,sd*.86,0]))<-.35)continue;const b0=T(r.p),tp=T(add(r.p,[.7,sd*.2,-4.9-1.5*A.jaw])),qa=P(b0),qb=P(tp);if(cut!=null&&tp[2]<cut)continue;ctx.fillStyle=K.fang;ctx.strokeStyle=INK;ctx.lineWidth=1.1;tri(qa[0],qa[1],qb[0],qb[1],1.7)}}
  for(const w of brows)if(w.f>.1){const cl2=F(hd.R([0,w.b.sd,0]))<-.05;if(cl2){ctx.save();ctx.clip(sk.path)}browDraw(V0,hd,w.b,A,K,false,1,cut);if(cl2)ctx.restore()}
  // the crown, cut where the cranium covers its base
  crownDraw(V0,hd,A,K,sk,cut)}
// an eye: a dark ring like a queen's make-up (with a wing at the back corner), the amber iris with the slit, the point of light, the upper
// lid slanting down toward the snout (the frown; level when the eye is wide open); a soft glow round it
// The far eye seen from three quarters fades out (from .35 of its facing) and keeps inside the outline of the head, without its wing and
// glow (it stuck out of the profile like a horn); under the lava the eye fades in as it comes through the surface
function eyeDraw(V0,hd,e,A,K,cut){const{P,F}=V0,n=hd.R(e.n),v=F(n);if(v<.12)return;const c=hd.T(e.c);let ke=1;if(cut!=null){ke=sstep(cut+.5,cut+3.5,c[2]);if(ke<=.01)return}
  const lid=A.shut?0:cl(A.lid*(1-.4*A.sq),0,1),o=P(c),up=hd.R([0,0,1]),u1=nrm(sub(up,mul(n,dot(up,n)))),u2=nrm(cross(n,u1)),dim=A.eyeDim==null?1:A.eyeDim;
  const a=P(add(c,mul(u2,5.5))),b=P(add(c,mul(u1,-6.5))),ax=[a[0]-o[0],a[1]-o[1]],ay=[b[0]-o[0],b[1]-o[1]],k=sstep(.12,.35,v)*ke,kw=sstep(.35,.5,v),Q=(x,y)=>[o[0]+ax[0]*x+ay[0]*y,o[1]+ax[1]*x+ay[1]*y];
  const sx=dot(hd.R(e.fw),u2)>0?1:-1,yl=-1+2*(1-lid),sl=.42*sx*cl((1-lid)/.2,0,1)*(1-.6*(A.smirk||0)),lidY=x=>yl+sl*x;
  if(!LOWFX&&lid>.2&&!A.husk0&&dim>.05&&kw>.02)shine(K.halo,o[0],o[1],13,.28*k*kw*(.7+.3*A.cLit)*dim);
  ctx.save();if(v<.4&&hd.sk&&hd.sk.path)ctx.clip(hd.sk.path);ctx.globalAlpha*=k;
  // the wing of the make-up (screen points, under the ring)
  if(!A.husk0&&kw>.02){const ka=ctx.globalAlpha;ctx.globalAlpha=ka*kw;const w=[Q(-sx*1.02,-.62),Q(-sx*1.86,-1.02),Q(-sx*1.16,.1)];ctx.beginPath();ctx.moveTo(w[0][0],w[0][1]);ctx.lineTo(w[1][0],w[1][1]);ctx.lineTo(w[2][0],w[2][1]);ctx.closePath();ctx.fillStyle=K.eyeRing;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.lineJoin='round';ctx.stroke();ctx.globalAlpha=ka}
  ctx.save();ctx.transform(ax[0],ax[1],ay[0],ay[1],o[0],o[1]);
  ctx.beginPath();ctx.arc(0,0,1.22,0,TAU);ctx.fillStyle=A.husk0?K.skin.d:K.eyeRing;ctx.fill();
  ctx.beginPath();ctx.arc(0,0,1,0,TAU);ctx.fillStyle=eyeGrad(K,dim);ctx.fill();
  const lk=A.lk;ctx.fillStyle=K.pupil;ctx.beginPath();ctx.ellipse(lk[0]*.25,lk[1]*.2,.17*(1-.35*A.sq)*(A.k2>.5?.75:1),.74,0,0,TAU);ctx.fill();
  // the lid: skin over the top of the eye, above its slanting edge
  if(lid<.99){ctx.save();ctx.beginPath();ctx.arc(0,0,1.01,0,TAU);ctx.clip();ctx.beginPath();ctx.moveTo(-1.3,lidY(-1.3));ctx.lineTo(1.3,lidY(1.3));ctx.lineTo(1.3,-1.5);ctx.lineTo(-1.3,-1.5);ctx.closePath();ctx.fillStyle=K.skin.b;ctx.fill();ctx.restore()}
  ctx.beginPath();ctx.arc(0,0,1.22,0,TAU);ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
  // the edge of the lid, or the shut eye; the point of light (on the screen)
  if(lid<.99&&lid>.02){const qa=1+sl*sl,qb=2*yl*sl,qc=yl*yl-1,ds=qb*qb-4*qa*qc;if(ds>0){const r=Math.sqrt(ds),x1=(-qb-r)/(2*qa)*1.05,x2=(-qb+r)/(2*qa)*1.05,p0=Q(x1,lidY(x1)),p1=Q(x2,lidY(x2));ctx.lineWidth=1.5;seg(p0,p1);ctx.stroke()}}
  else if(lid<=.02&&!A.husk0){const p0=Q(-.9,.15),p1=Q(.9,.15),m=Q(0,.6);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.quadraticCurveTo(m[0],m[1],p1[0],p1[1]);ctx.stroke()}
  if(lid>.3&&dim>.3){const x0=-.35,q=Q(x0,Math.max(-.42,lidY(x0)+.3));ctx.fillStyle='#ffffff';ball(q,1.2);ctx.fill()}ctx.restore()}
const EGC={};function eyeGrad(K,dim){const d=Math.round(dim*8)/8,key=K.core+K.iris+K.irisD+d;let g=EGC[key];if(!g){if(Object.keys(EGC).length>40)for(const k in EGC)delete EGC[k];g=ctx.createRadialGradient(0,.25,.1,0,0,1);g.addColorStop(0,cmix('#3a2a34',K.core,d));g.addColorStop(.35,cmix('#2a2232',K.iris,d));g.addColorStop(1,cmix('#1a141e',K.irisD,d));EGC[key]=g}return g}
// a brow: a heavy plate of obsidian over the eye, sloping down toward the snout (the far one pulled in and sunk behind the cranium)
function browDraw(V0,hd,b,A,K,far,fk,cut){const{P}=V0,f=fk==null?1:fk,lo=-1.5*(A.sq||0)+1.1*(A.smirk||0),sink=far?(1-f)*4.5:0,pin=far?lerp(1,.6,1-f):1,
  pt=(q,k)=>{const r=add(q,mul(b.up,lo*k));return hd.T([r[0],r[1]*pin,r[2]-sink])},a=pt(far?lerp3(b.a,b.m,.25+.35*(1-f)):b.a,.35),m=pt(b.m,.8),c=pt(b.b,1.25),
  e1=nrm(sub(c,a)),up=hd.R(b.n),e2=nrm(cross(up,e1)),e3=cross(e1,e2);
  if(cut!=null&&(a[2]<cut||c[2]<cut))return;
  const pts=[];for(const[q,r1,r2] of[[a,1.9,1.4],[m,2.9,2],[c,2.4,1.7]])for(let i=0;i<8;i++){const t=i/8*TAU;pts.push(add(q,add(mul(e2,Math.cos(t)*r1),mul(e3,Math.sin(t)*r2))))}
  const hp=svol3(V0,pts,A.husk0?KHP:K.obs,{lw:2});if(hp.length<3||A.husk0)return;
  const t0=P(add(a,mul(e3,1.4))),t1=P(add(m,mul(e3,2.1))),t2=P(add(c,mul(e3,1.7)));ctx.strokeStyle='rgba(236,230,255,.55)';ctx.lineWidth=1.1;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(t0[0],t0[1]);ctx.quadraticCurveTo(t1[0],t1[1],t2[0],t2[1]);ctx.stroke();
  if(K.edge)edgeIn(hp,1.4,K.edge,A.k2)}
// a face cut at the floor (the points of the crown under the floor): its part above z
function clipZ(f,z){const out=[];for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length];if(a[2]>=z)out.push(a);if((a[2]>=z)!==(b[2]>=z)){const k=(a[2]-z)/(a[2]-b[2]);out.push(lerp3(a,b,k))}}return out}
// the crown: the band set into the nape and its five points (faceted obsidian, a lilac sheen on one face, a point of light near the tip);
// while the nape turns away from us the cranium covers their feet; under the floor only what sticks out of it
function crownDraw(V0,hd,A,K,sk,cut){const{P,F}=V0,T=hd.T,R=hd.R;if(A.crownOff||A.husk0)return;
  const nape=F(R(CROWN[0].base.n)),clipSk=nape<0&&sk&&sk.path;
  if(clipSk){ctx.save();const pa=new Path2D();pa.rect(-1e4,-1e4,2e4,2e4);pa.addPath(sk.path);ctx.clip(pa,'evenodd')}
  if(cut==null){const runs=[];let cur=[];for(const b of CBAND){if(F(R(b.n))>-.05)cur.push(P(T(b.p)));else{if(cur.length>1)runs.push(cur);cur=[]}}if(cur.length>1)runs.push(cur);strokeRuns(runs,INK,6.2);strokeRuns(runs,K.obs.b,3.8);strokeRuns(runs,'rgba(142,127,184,.6)',1.2)}
  const pts=CROWN.map(c=>({c,d:V0.D(T(c.b))})).sort((a,b)=>a.d-b.d);
  // (the entrance: each point comes out of the head along its own axis, crownEm 0..1; the second phase: one soft glow behind the flames)
  const em=c=>A.crownEm?A.crownEm[c.k]:1,flm=Math.max(...A.crownFl);
  if(flm>.02&&!LOWFX&&cut==null){const q=P(T(add(CROWN[0].b,mul(CROWN[0].d,CROWN[0].L*.7))));shine('255,150,50',q[0],q[1],30*Math.min(1.4,flm),.32*Math.min(1,flm))}
  for(const{c} of pts){const e=em(c);if(e<=.001)continue;const sk0=e<1?mul(c.d,-c.L*(1-e)):null,TT=sk0?(q=>T(add(q,sk0))):T,VV2=c.V.map(TT);let NN=c.FN.map(R),r;
    if(cut!=null){let FS=c.F.map(f=>f.map(i=>VV2[i]));const F2=[],N2=[];FS.forEach((f,i)=>{const g=clipZ(f,cut);if(g.length>2){F2.push(g);N2.push(NN[i])}});if(!F2.length)continue;r=facets(V0,F2,K.obs,{lw:2.1,kb:-.16,q:5,seam:false},N2);if(!r)continue}
    else{const P2=VV2.map(q=>P(q));r=gem(V0,P2,c.F,NN,K.obs,{lw:2.1,kb:-.16,q:5});if(!r)continue;if(r.vis.includes(c.lil)){ctx.beginPath();for(const j of c.F[c.lil])ctx.lineTo(P2[j][0],P2[j][1]);ctx.closePath();ctx.fillStyle='rgba(190,170,240,.35)';ctx.fill()}}
    const t3=TT(add(c.b,mul(c.d,c.L*.82)));if(c.k===0&&(cut==null||t3[2]>cut)){const tq=P(t3);ctx.fillStyle=K.obsDot;ball([tq[0]-1,tq[1]],.9);ctx.fill()}
    if(K.edge&&A.k2>0)edgeIn(r.H,1.3,K.edge,A.k2)
    // the flames of the second phase wrap the upper half of each point and lean back
    const fl=A.crownFl[c.k];if(fl>.02&&(cut==null||T(c.tip)[2]>cut)){const a=P(T(add(c.b,mul(c.d,c.L*.55)))),tq=P(T(c.tip)),o0=P(T(c.b)),o1=P(T(add(c.b,[-6,0,0])));
      crownFlame(a,tq,c.r0*.8,[(o1[0]-o0[0])/6,(o1[1]-o0[1])/6],fl*(c.k===0?1.15:1),c.k)}}
  if(cut==null){const runs=[];let cur=[];for(const b of CBAND){if(F(R(b.n))>.05)cur.push(P(T(add(b.p,[1.8,0,-.4]))));else{if(cur.length>1)runs.push(cur);cur=[]}}if(cur.length>1)runs.push(cur);strokeRuns(runs,cmix(K.red,K.yel,.3+.5*A.cLit),1.1)}
  if(clipSk)ctx.restore()}
// the flame that wraps a point of the crown from the middle of it (a, on the screen) past its tip (tp): as wide as the point, leaning
// back (bk, the way back of the head on the screen); three tongues, orange, gold and white. It flickers with the room's clock, not the
// move's; still on slow phones
function crownFlame(a,tp,w,bk,k,seed){const t=LOWFX?0:(G.t||0)*9+seed*2.1,dx=tp[0]-a[0],dy=tp[1]-a[1],l=Math.max(2,Math.hypot(dx,dy)),ux=dx/l,uy=dy/l,nx=-uy,ny=ux,
    fl=(1+(LOWFX?0:.12*Math.sin(t)+.06*Math.sin(t*2.3+1)))*Math.min(1.6,k),sw=LOWFX?0:.22*Math.sin(t*1.3+seed),W=w*Math.min(1.2,.65+.35*k),
    h=[tp[0]+(ux*.32+bk[0]*.3+nx*sw)*l*fl,tp[1]+(uy*.32+bk[1]*.3+ny*sw)*l*fl];
  const tongue=(b0,W0,h0,col)=>{const mx=lerp(b0[0],h0[0],.55),my=lerp(b0[1],h0[1],.55);ctx.beginPath();ctx.moveTo(b0[0]+nx*W0,b0[1]+ny*W0);
    ctx.quadraticCurveTo(mx+nx*W0*1.2,my+ny*W0*1.2,h0[0],h0[1]);ctx.quadraticCurveTo(mx-nx*W0*1.2,my-ny*W0*1.2,b0[0]-nx*W0,b0[1]-ny*W0);
    ctx.quadraticCurveTo(b0[0]-ux*W0*.7,b0[1]-uy*W0*.7,b0[0]+nx*W0,b0[1]+ny*W0);ctx.closePath();ctx.fillStyle=col;ctx.fill()};
  tongue(a,W,h,'rgba(255,100,24,.86)');tongue([a[0]+ux*l*.3,a[1]+uy*l*.3],W*.62,[lerp(a[0],h[0],.84),lerp(a[1],h[1],.84)],'#ffb040');
  tongue([a[0]+ux*l*.55,a[1]+uy*l*.55],W*.32,[lerp(a[0],h[0],.68),lerp(a[1],h[1],.68)],'#fff3c4')}

// ------------------------------------------------------------------ the collar: ten petals of magma on a ring round the neck
// open k: 0 folded back over the shoulders like a closed fan, 1 a sun round the head; modes: 0 the fan, 1 «a elmo» (folded tight to the
// nape), 2 «a cometa» (stretched back flat, flames out of it). Each petal takes its place in the draw order from the open collar
function collar(V0,L,hd,A,K,dH,dTr,cut){const{P,D,F}=V0,u=hd.F.u,v=hd.F.v,w=hd.F.w,c0=hd.T(CLC);
  const open=cl(A.col,0,1.1),mode=A.cMode;if(cut!=null&&c0[2]<cut-12)return;
  // open (mode 0) the petals lean back a little from the plane of the sun, so their lit faces look out to the front and to the sides too;
  // their backs, seen from behind, glow as well (only a closed or cold collar shows dark backs). The lowest petals shorten while the mouth
  // opens (never over the mouth, never like fangs). Their place in the order: their own depth, pushed back while her face looks at us
  // and forward while her nape does (they stay behind the head from the front and in front of it from behind, with no jump at the side)
  const jo=sstep(.1,.5,A.jaw),ok=mode===0?sstep(.3,.8,open):0,fu=F(u)*14;
  for(let i=0;i<NP;i++){const ph=(i+.5)/NP*TAU,rv=add(mul(v,Math.sin(ph)*CLR[0]),mul(w,Math.cos(ph)*CLR[1])),rh=nrm(rv),tg=nrm(add(mul(v,Math.cos(ph)),mul(w,-Math.sin(ph))));
    const mid=add(add(c0,rv),mul(rh,PL*.5)),dp=D(mid)-fu;let d=dp>dH-1&&dp<dH+1?(dp>dH?dH+1:dH-1):dp;if(d>dTr-3&&d<dTr+3)d=d>dTr?dTr+3:dTr-3;
    L.add(d,()=>{let th,ln=PL,ring=1;
      const low=sstep(.45,.9,-Math.cos(ph)),th0=lerp(.24,.08,low);   // (the lowest petals fold tight under the throat)
      if(mode===1){th=lerp(th0,.2,A.cm);ring=lerp(1,.82,A.cm)}else if(mode===2){th=lerp(th0,.12,A.cm);ln=PL*lerp(1,1.22,A.cm)}else th=lerp(th0,Math.PI/2-.26,Math.pow(open,1.15));
      ln*=lerp(1,.6,low*jo);
      const cold=A.petCold?A.petCold[i]:A.cCold;
      let dd=nrm(add(mul(u,-Math.cos(th)),mul(rh,Math.sin(th))));if(cold>0)dd=nrm(add(dd,[0,0,-.55*cold]));
      const b=add(c0,mul(rv,ring)),n=nrm(cross(tg,dd)),front=F(n)>0,lt=A.petLit?Math.max(A.petLit[i],A.cLit*.3):A.cLit;
      petal(V0,b,dd,tg,ln,PW,K,lt,cold,front,mode===2?A.cm:0,i,cut,ok)})}
  if(!LOWFX&&(open>.4||A.halo>0)){const q=P(c0),k=Math.max((open-.4)/.6*(.4+.6*A.cLit)*(1-A.cCold),A.halo);L.add(dH-30,()=>shine(K.glow,q[0],q[1],46+20*A.halo,.35*k))}}
// a petal: a round leaf of magma (dark at the root, lit toward the edge, a thread of light inside the edge), its outline curved; its back
// one dark tone, or glowing too while the collar is open (ok); in the comet a flame from its tip; ash grey and limp when cold. With LOWFX
// one full tone
function petal(V0,b,d,s,Lp,W,K,lt,cold,front,comet,i,cut,ok){const{P}=V0,n=nrm(cross(d,s)),P3=[],N=5;
  for(let j=0;j<=N;j++){const k=j/N,w=W*Math.sqrt(Math.max(0,1-(2*k-1)*(2*k-1)))*(1-.25*k)+.6;P3.push(add(add(b,mul(d,k*Lp)),add(mul(s,w),mul(n,-1.2*k*k*Lp*.1))))}
  for(let j=N-1;j>0;j--){const k=j/N,w=W*Math.sqrt(Math.max(0,1-(2*k-1)*(2*k-1)))*(1-.25*k)+.6;P3.push(add(add(b,mul(d,k*Lp)),add(mul(s,-w),mul(n,-1.2*k*k*Lp*.1))))}
  const Q3=cut!=null?clipZ(P3,cut):P3;if(Q3.length<3)return;const pts=Q3.map(q=>P(q));
  const q0=P(b),q1=P(add(b,mul(d,Lp)));ctx.lineJoin='round';const pa=smoothP(pts),ash=cold>0?cold:0,k=cl(lt,0,1),BK=cmix(cmix(K.pBack,'#3a0c08',.35),'#3a342e',ash),ob=front?0:(ok||0)*(1-ash)*(.35+.65*k);
  if(front){const hot=cl(lt-1,0,.6)/.6;
    if(LOWFX)ctx.fillStyle=cmix(cmix(cmix('#9a2216',K.pBody,k),K.yel,hot),'#6a625c',ash);
    else{const g=ctx.createLinearGradient(q0[0],q0[1],q1[0],q1[1]);
      g.addColorStop(0,cmix(cmix('#4a0c08',K.pRoot,k),'#3a3430',ash));g.addColorStop(.55,cmix(cmix(cmix('#9a2216',K.pBody,k),K.yel,hot),'#6a625c',ash));g.addColorStop(1,cmix(cmix(cmix('#e8501e',K.pEdge,k),K.pHot,hot),'#9a928a',ash));ctx.fillStyle=g}}
  else if(ob>.02){if(LOWFX)ctx.fillStyle=cmix(BK,cmix(K.pBack,K.pBody,.5),ob);
    else{const g=ctx.createLinearGradient(q0[0],q0[1],q1[0],q1[1]);g.addColorStop(0,cmix(BK,K.pBack,ob));g.addColorStop(1,cmix(BK,cmix(K.pBody,K.pEdge,.25),ob*.9));ctx.fillStyle=g}}
  else ctx.fillStyle=BK;
  ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke(pa);
  if(front||ob>.02){let cx=0,cy=0;for(const q of pts){cx+=q[0];cy+=q[1]}cx/=pts.length;cy/=pts.length;const ins=pts.map(q=>{const dx=q[0]-cx,dy=q[1]-cy,l=Math.hypot(dx,dy)||1,kk=Math.max(0,1-1.5/l);return[cx+dx*kk,cy+dy*kk]});
    const a0=ctx.globalAlpha;ctx.globalAlpha=a0*(front?.7:.6*ob);ctx.strokeStyle=front?cmix(cmix('#ff6a2a',K.pEdge,k),'#a39a92',ash):K.pEdge;ctx.lineWidth=front?1.2:1;poly(ins);ctx.stroke();ctx.globalAlpha=a0}
  // the comet: a flame from the tip of every petal (it grows with the comet and dies as the collar goes cold)
  const cf=comet*(1-cold);
  if(cf>.01){if(!LOWFX){const t=(G.t||0)*8+i*1.7,h=(6+3*Math.sin(t))*cf;shine('255,150,50',q1[0],q1[1],h,.5*cf)}
    const t=LOWFX?0:(G.t||0)*9+i*2.3,h=(4+1.6*Math.sin(t))*cf,wd=2.2*Math.min(1,.3+cf),dx=q1[0]-q0[0],dy=q1[1]-q0[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l;
    ctx.beginPath();ctx.moveTo(q1[0]-uy*wd,q1[1]+ux*wd);ctx.quadraticCurveTo(q1[0]+ux*h*.6-uy*wd*.9,q1[1]+uy*h*.6+ux*wd*.9,q1[0]+ux*h,q1[1]+uy*h-1.5*cf);ctx.quadraticCurveTo(q1[0]+ux*h*.6+uy*wd*.9,q1[1]+uy*h*.6-ux*wd*.9,q1[0]+uy*wd,q1[1]-ux*wd);ctx.closePath();ctx.fillStyle='#ffb040';ctx.fill()}}

// ------------------------------------------------------------------ under the floor: the fin of the crown, the eyes, the wave, the glow
// (the swim; the end of the dive; the start of the bursts out). The head sits under the floor, swimZ lifts or sinks it
function swimHead(A,p){const sw=A.swimK>=1&&A.noBody?.035*Math.sin(p*TAU):0,c=[6,0,-12.5+A.swimZ],R=v=>rotZ(rotX(v,sw),0);return{c,F:{u:[1,0,0],v:[0,1,0],w:[0,0,1]},R,T:d=>add(c,R(d))}}
// a long soft glow on the floor along her body axis (centre cx, half length hl, half width hw), drawn as one stretched gradient
function floorGlow(V0,cx,hl,hw,rgb,al){if(al<=.005)return;const o=V0.P(cx,0,0),u=V0.P(cx+hl,0,0),v=V0.P(cx,hw,0);ctx.save();ctx.transform(u[0]-o[0],u[1]-o[1],v[0]-o[0],v[1]-o[1],o[0],o[1]);ctx.beginPath();ctx.arc(0,0,1,0,TAU);
  if(LOWFX){ctx.fillStyle=`rgba(${rgb},${al*.5})`;ctx.fill()}else{ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(${rgb},${al})`);g.addColorStop(.5,`rgba(${rgb},${al*.55})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;ctx.fill()}ctx.restore()}
const SWSL=[-.62,0,.62];
// her two eyes seen at floor level (under the floor or the lava, looking up through it): amber almonds, lid (0 shut .. 1 open), the look
// lk (the pupils sliding left / right), faded in by k
function floorEyes(V0,hd,K,lid,lk,k){if(k<=.01)return;const{P}=V0;for(const e of EYE){const c=hd.T(e.c),q=P(c[0],c[1],0),w=5.6,h=3.4*(.3+.7*Math.min(1,lid/.5));ctx.save();ctx.globalAlpha*=k;if(!LOWFX)shine(K.halo,q[0],q[1],13,.5*Math.min(1,lid*2));
    const al=()=>{ctx.beginPath();ctx.moveTo(q[0]-w,q[1]);ctx.quadraticCurveTo(q[0],q[1]-h*1.5,q[0]+w,q[1]);ctx.quadraticCurveTo(q[0],q[1]+h*1.5,q[0]-w,q[1]);ctx.closePath()};
    if(lid<.04){ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q[0]-w,q[1]);ctx.quadraticCurveTo(q[0],q[1]+2,q[0]+w,q[1]);ctx.stroke();ctx.restore();continue}
    al();ctx.fillStyle=K.eyeRing;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke();ctx.save();al();ctx.clip();const px=q[0]+(lk[0]||0)*w*.45;
    ctx.fillStyle=K.iris;ctx.fillRect(q[0]-w,q[1]-h*.25,2*w,h*1.6);ctx.fillStyle=K.irisD;ctx.fillRect(q[0]-w,q[1]+h*.5,2*w,h);ctx.fillStyle=K.pupil;ctx.beginPath();ctx.ellipse(px,q[1]+h*.15,.9,h*.95,0,0,TAU);ctx.fill();
    ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(q[0]-w,q[1]-h*.25);ctx.lineTo(q[0]+w,q[1]-h*.25);ctx.stroke();ctx.restore();ctx.fillStyle='#fff';ball([px-w*.3,q[1]+h*.05],.9);ctx.fill();ctx.restore()}}
function swimParts(L,V0,A,K,fx){const{P,D}=V0,sp=A.swimP||0,hd=swimHead(A,sp),z=A.swimZ,wv=A.wave||0,ug=A.uglow==null?1:A.uglow,ph=sp*TAU,x0=hd.c[0];
  // the red glow of her body under the floor (head, trunk, tail: 150 long)
  if(ug>.01)L.add(-8e3,()=>{floorGlow(V0,x0-40,62,30,'255,70,30',.42*ug);floorGlow(V0,x0-104,44,15,'255,60,25',.3*ug)});
  // the cut the points make in the stone (a slit of lava under them) and the short glowing wake behind it
  if(z>-20)L.add(-7e3-1,()=>{const k=sstep(-20,-8,z),c=P(x0-14,0,0),a=P(x0-14,19,0),b=P(x0-9,0,0);ctx.save();ctx.globalAlpha*=k;
    const ex=[a[0]-c[0],a[1]-c[1]],ey=[b[0]-c[0],b[1]-c[1]];ctx.beginPath();for(let i=0;i<16;i++){const t=i/16*TAU;ctx.lineTo(c[0]+ex[0]*Math.cos(t)+ey[0]*Math.sin(t),c[1]+ex[1]*Math.cos(t)+ey[1]*Math.sin(t))}ctx.closePath();
    ctx.fillStyle='#2a1a14';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();ctx.save();ctx.clip();const g0=P(x0-14,0,0);ctx.fillStyle=LOWFX?'#ff8a2a':'#ffb040';ctx.beginPath();ctx.ellipse(g0[0],g0[1],Math.hypot(ex[0],ex[1])*.8,Math.max(1.2,Math.hypot(ey[0],ey[1])*.45),Math.atan2(ex[1],ex[0]),0,TAU);ctx.fill();ctx.restore();
    if(wv>.01){ctx.lineCap='round';ctx.lineJoin='round';const a0=ctx.globalAlpha;for(let i=0;i<6;i++){const q0=P(x0-20-i*8,(i%2?1.4:-1.4),0),q1=P(x0-28-i*8,(i%2?-1.4:1.4),0);ctx.globalAlpha=a0*wv*(1-i/6);
        if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,110,40,.3)';ctx.lineWidth=5;seg(q0,q1);ctx.stroke();ctx.restore()}ctx.strokeStyle='#2a1a14';ctx.lineWidth=2.6;seg(q0,q1);ctx.stroke();ctx.strokeStyle='#ff9a3a';ctx.lineWidth=1;seg(q0,q1);ctx.stroke()}ctx.globalAlpha=a0}
    ctx.restore()});
  // the eyes at floor level, just in front of the points: two amber almonds half shut, looking up at you
  if(z>-14)L.add(-6.9e3,()=>floorEyes(V0,hd,K,.5,[0,0],sstep(-14,-6,z)));
  // the bow wave ahead: a low crest of slabs of the floor lifting and falling, the lava in the cracks between them, sparks
  if(wv>.01){L.add(D(x0+36,0,0),()=>{ctx.save();ctx.globalAlpha*=sstep(0,.5,wv);
      {const pts=[];for(let i=0;i<=12;i++){const a=-1.05+i/12*2.1,r=33+2.5*Math.sin(i*1.7);pts.push(P(x0+6+r*Math.cos(a),r*Math.sin(a),0))}for(let i=12;i>=0;i--){const a=-1.05+i/12*2.1,r=23;pts.push(P(x0+6+r*Math.cos(a),r*Math.sin(a),0))}
        ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.fillStyle=LOWFX?'#ff8a2a':'rgba(255,140,50,.85)';ctx.fill()}
      ctx.restore();if(wv<.2)return;ctx.save();const SL=[];for(let i=0;i<3;i++){const a=SWSL[i],r=29,bx=x0+6+r*Math.cos(a),by=r*Math.sin(a),lf=.5+.5*Math.sin(ph-i*1.3-1),h=(2+4.5*lf)*sstep(.2,1,wv),tl=.3+.4*lf;
        const t=[Math.cos(a),Math.sin(a),0],sd=[-Math.sin(a),Math.cos(a),0],c=[bx,by,0],w=i===1?7:6,F0=[add(c,add(mul(t,-4),mul(sd,-w))),add(c,add(mul(t,4),mul(sd,-w))),add(c,add(mul(t,4),mul(sd,w))),add(c,add(mul(t,-4),mul(sd,w)))],
          top=F0.map((q,j)=>add(q,[0,0,j===0||j===3?h:h*(1-tl)])),FS=[top,[F0[2],F0[3],top[3],top[2]],[F0[0],F0[1],top[1],top[0]],[F0[1],F0[2],top[2],top[1]],[F0[3],F0[0],top[0],top[3]]];SL.push({d:D(c),FS})}
      SL.sort((a,b)=>a.d-b.d);for(const q of SL)facets(V0,q.FS,T3('#7a6a60','#54463e','#2e2420'),{lw:1.7,seam:false,q:4});
      if(fx)for(let i=0;i<5;i++){const u=(sp*2+i/5)%1,a=(i-2)*.4,q=P(x0+6+31*Math.cos(a)+u*8,31*Math.sin(a),u*16-u*u*6);ctx.fillStyle=`rgba(255,${210-90*u|0},90,${1-u})`;ball(q,1.3);ctx.fill()}
      ctx.restore()})}
  // the points of the crown out of the floor
  L.add(D(x0-10,0,0)+1,()=>{const A2=Object.assign({},A,{crownOff:0,husk0:0});crownDraw(V0,hd,A2,K,null,0)})}

// ------------------------------------------------------------------ the old skin (the moult): her rest pose, empty and grey, split down the
// back, the prints of the domes, the lids shut and smooth, no crown and no collar; the slits and the spots cool from red to black (cool)
const KHC={};
function huskPal(cool){const k=Math.round(cl(cool,0,1)*8)/8;if(KHC[k])return KHC[k];return KHC[k]=Object.assign({},KH,{spot:cmix('#ff6a2a','#2e2220',k),spotE:cmix('#b02a18','#2e2220',k),org:cmix('#ff6a2a','#2e2220',k),yel:cmix('#ffb040','#2e2220',k),core:cmix('#ffd27a','#3a2e2a',k),red:cmix('#ff6a2a','#2e2220',k),slit:'#1e1614',glow:'255,110,40',edge:null})}
function huskDraw(V0,face,A0,cool){const A=sPose('idle',.12,{}),K=huskPal(cool);Object.assign(A,{husk0:1,crownOff:1,lid:0,spot:.35*(1-cool),spotW:-1,cLit:0,col:0,split:1,k2:0,fx:[],tongue:0,coolH:cool});
  const L=parts(),X=frame(A,0),S=spine(A,X);rings(V0,S);bodyParts(L,V0,A,K,{noFx:1},false,S,X);run(L)}

// ------------------------------------------------------------------ the defeat: a heap of glossy black rocks of obsidian where she was
const MROCK=[[18,2,13],[2,-11,17],[-8,12,16],[-26,-5,16],[-42,8,13],[-57,-2,11],[-71,10,9],[-86,15,7],[8,18,9],[-16,-21,9],[-100,20,6]].map(([x,y,r],i)=>{const F=[],seed=i*1.7,ring=(z,rr,o2)=>{const R=[];for(let k=0;k<7;k++){const a=k/7*TAU+o2+seed;R.push([x+Math.cos(a)*rr*(1+.14*Math.sin(k*2.1+seed)),y+Math.sin(a)*rr*(1+.14*Math.cos(k*1.7+seed)),z])}return R};
  const R0=ring(0,r*.9,0),R1=ring(r*.5,r,.4),R2=ring(r*.95,r*.55,.8),top=[x+r*.1,y,r*1.15];for(let k=0;k<7;k++){const j=(k+1)%7;F.push([R0[k],R0[j],R1[j],R1[k]],[R1[k],R1[j],R2[j],R2[k]],[R2[k],R2[j],top])}return{F,c:[x,y,r*.55],r,dl:cl((x+100)/118,0,1)*.42}});
const KOB=T3('#3e3654','#1c1626','#0a070e');
function moundDraw(V0,A,K){const{P,D}=V0,L=parts();for(const m of MROCK){const g=ez(sstep(m.dl,m.dl+.55,A.mound));if(g<=.02)continue;const b=[m.c[0],m.c[1],0],F2=g>=1?m.F:m.F.map(f=>f.map(q=>add(b,mul(sub(q,b),g))));
    L.add(D(m.c),()=>{const r=facets(V0,F2,KOB,{lw:2.2,seamCol:'rgba(200,186,240,.16)'});if(!r)return;const q=P(add(b,mul(sub(add(m.c,[-m.r*.25,-m.r*.2,m.r*.4]),b),g)));ctx.fillStyle='rgba(190,170,240,.7)';ball(q,1.1*g);ctx.fill()})}
  run(L);
  // a few embers still glowing between the rocks, going out
  const ek=1-sstep(.6,1,A.mound);if(ek>.02)for(const[x,y] of[[6,4],[-18,6],[-34,-2],[-62,6]]){const q=P(x,y,6);if(!LOWFX)shine('255,120,40',q[0],q[1],6,.5*ek);ctx.fillStyle=cmix('#5a2010','#ffb040',ek);ball(q,1.4);ctx.fill()}}

// ------------------------------------------------------------------ the effects of the moves
const ballOut=(q,r,c)=>{ctx.fillStyle=c;ball(q,r);ctx.fill()};
function fxDraw(V0,L,e,A,K,info){const{P,D}=V0,t=e.t,hd=info&&info.hd,S=info&&info.S;
  const mouthAt=()=>hd.T([22,0,HZ-1]);
  if(e.k==='nsmoke'&&hd){const d=hd.R([1,0,.5]);L.add(D(hd.c)+30,()=>{for(const nz of NOSE){for(let i=0;i<3;i++){const u=cl(t*1.3-i*.15,0,1);if(u<=0||u>=1)continue;const q=P(add(hd.T(nz.c),add(mul(d,u*10),[0,0,u*12+i*2])));
    ctx.fillStyle=`rgba(${K.smoke},${.45*Math.sin(u*Math.PI)})`;ball(q,1.4+u*3.5);ctx.fill()}}})}
  else if(e.k==='embers'&&S){L.add(999,()=>{for(let i=0;i<(e.n||4);i++){const u=(t*2+i/4)%1,f=1.5+i*1.7,s=surf(S,f,Math.PI/2,1),q=P(add(s.p,[Math.sin(i*2.3+u*3)*3,0,u*26]));ctx.fillStyle=`rgba(255,${190-90*u|0},80,${.9*(1-u)})`;ball(q,1.3*(1-u*.4));ctx.fill()}})}
  else if(e.k==='plant'){const f=A.feet[e.l],c=[f[0]+A.B[0],f[1]+A.B[1],0];L.add(-6e3,()=>{const q=P(c),k=1-t;if(!LOWFX)shine('255,140,50',q[0],q[1],10,.45*k,6);ctx.fillStyle=`rgba(255,150,60,${.35*k})`;ctx.beginPath();ctx.ellipse(q[0],q[1],6,3.2,0,0,TAU);ctx.fill()})}
  else if(e.k==='sparks'&&S){const tip=S[NS-1].c;L.add(D(tip)+5,()=>{for(let i=0;i<(e.many?5:3);i++){const u=((t*(e.many?6:3))+i/(e.many?5:3))%1,q=P(add([tip[0],tip[1],0],[-u*10+Math.sin(i*2.1)*3,Math.cos(i*1.7)*4*u,1+u*9*(1-u)*2]));ctx.fillStyle=`rgba(255,${210-90*u|0},90,${1-u})`;ball(q,1.1);ctx.fill()}})}
  else if(e.k==='muzzle'&&hd){const m0=mouthAt(),d=hd.R([1,0,-.15]);L.add(D(m0)+40,()=>{const q=P(add(m0,mul(d,4+t*10))),r=3+t*10;ctx.strokeStyle=`rgba(${K.smoke},${.6*(1-t)})`;ctx.lineWidth=2.5*(1-t)+.8;ctx.beginPath();ctx.ellipse(q[0],q[1],r,r*.6,0,0,TAU);ctx.stroke();
    for(let i=0;i<5;i++){const a=i/5*TAU+1,qq=[q[0]+Math.cos(a)*r*1.2,q[1]+Math.sin(a)*r*.8];ctx.fillStyle=`rgba(255,200,90,${1-t})`;ball(qq,1.1);ctx.fill()}})}
  else if(e.k==='glob'&&hd){const m0=mouthAt(),d=hd.R([1,0,-.25]),c=add(m0,mul(d,3+t*14));L.add(D(c)+50,()=>{const q=P(c);ctx.save();ctx.translate(q[0],q[1]);globDraw(Math.atan2(P(add(c,d))[1]-q[1],P(add(c,d))[0]-q[0]),.6+.4*t,A.k2>.5);ctx.restore()})}
  else if(e.k==='puff'&&hd){L.add(D(hd.c)+30,()=>{for(const nz of NOSE){const q=P(add(hd.T(nz.c),hd.R([3+t*8,0,2+t*10])));ctx.fillStyle=`rgba(${K.smoke},${.5*(1-t)})`;ball(q,2+t*5);ctx.fill()}})}
  else if(e.k==='sweep'){L.add(-6e3,()=>{const R0=e.s0,R1=e.s1,X=info&&info.X;if(!X)return;const cur=lerp(1.75,-1.75,ez(cl(t*(R1-R0+.14)/(R1-R0),0,1))),tail=Math.max(-1.75,cur),k=1-sstep(.6,1,t),hip=X.T([-40,0,0]);
    ctx.lineCap='round';for(const[w,c,al] of[[9,'255,110,40',.35],[4,'255,190,90',.8],[1.6,'255,250,220',1]]){ctx.strokeStyle=`rgba(${c},${al*k})`;ctx.lineWidth=w;ctx.beginPath();for(let i=0;i<=16;i++){const a=lerp(1.75,tail,i/16),dv=X.Rd([-Math.cos(a),Math.sin(a),0]),pt=add(hip,mul(dv,92));const q=P(pt);ctx.lineTo(q[0],q[1])}ctx.stroke()}})}
  else if(e.k==='lash'&&info){const X=info.X;L.add(-6e3,()=>{const k=1-t;ctx.lineCap='round';for(const[w,c,al] of[[10,'255,110,40',.35],[3.5,'255,220,140',.9]]){ctx.strokeStyle=`rgba(${c},${al*k})`;ctx.lineWidth=w;const a=P(X.T([-45,0,0])),b=P(X.T([-150,0,0]));seg(a,b);ctx.stroke()}})}
  else if(e.k==='pool'){const r=e.r,cr=e.cr,pc=e.c||[14,0,0];L.add(-7e3,()=>{if(r>.5)poolDraw(V0,pc,r,0,{seed:2});if(cr>0){const k=1-sstep(.5,1,cr),q0=P(pc[0]-10,pc[1]-9,0),q1=P(pc[0],pc[1],0),q2=P(pc[0]+10,pc[1]+8,0);ctx.strokeStyle=`rgba(255,150,60,${.9*k})`;ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q0[0],q0[1]);ctx.lineTo(q1[0],q1[1]);ctx.lineTo(q2[0],q2[1]);ctx.stroke();if(!LOWFX)shine('255,120,40',q1[0],q1[1],14,.5*k)}})}
  else if(e.k==='splash'){L.add(D(17,0,0)+20,()=>{for(let i=0;i<6;i++){const u=(t*3+i/6)%1,a=i/6*TAU+.5,q=P(17+Math.cos(a)*(8+u*14),Math.sin(a)*(8+u*14),u*18*(1-u)*3);ctx.fillStyle=`rgba(255,${170-60*u|0},60,${1-u})`;ball(q,2-u);ctx.fill()}})}
  else if(e.k==='dome'){const h1=A.h1;L.add(-7e3,()=>{if(h1){ctx.save();ctx.translate(h1[0],h1[1])}domeDraw(V0,t,e.fade||0);if(h1)ctx.restore()})}
  else if(e.k==='column'){// the lava she bursts out of (at the first hole: in the leap the game carries her away from it): a crown of splashes,
    // tongues of lava thrown up all round her, taller behind her (a plume) and a third of her height in front of her, so she comes out of the
    // lava and not of a pot; a bright pool at its foot, drops thrown up and out. (Its place in the order: the hole's depth: the hole's
    // offset on the screen h1, divided by the camera's k, is its depth)
    const k=t<.15?ez(t/.15):1-sstep(.45,1,t);if(k>.01){const h1=A.h1,o0=P(0,0,0),q0=h1?[o0[0]+h1[0],o0[1]+h1[1]]:o0,ky=.55*C.KR(),rb=30*(.5+.5*Math.min(1,k*1.4)),tt=G.t||0,dc=D(0,0,0)+(h1?h1[1]/C.cam.k:0);
      // (half of the crown of splashes: its foot round the pool, then tongues of lava that flare out and up, with low valleys between them)
      const crownHalf=(front,H)=>{const a0=front?0:Math.PI,a1=front?Math.PI:TAU,NT=front?5:6,da=(a1-a0)/NT,pt=(a,r,h)=>[q0[0]+Math.cos(a)*r,q0[1]+Math.sin(a)*r*ky-h];
        ctx.beginPath();const b0=pt(a0,rb,0);ctx.moveTo(b0[0],b0[1]);ctx.ellipse(q0[0],q0[1],rb,rb*ky,0,a0,a1,false);const e1=pt(a1,rb*1.06,H*.25);ctx.lineTo(e1[0],e1[1]);
        for(let i=NT-1;i>=0;i--){const am=a0+da*(i+.5),ht=H*(.78+.28*Math.sin(i*2.3+(front?0:1.3))+(LOWFX?0:.08*Math.sin(tt*8+i*1.9))),tip=pt(am+(LOWFX?0:.05*Math.sin(tt*5+i)),rb*1.48,ht),
            v=pt(a0+da*i,rb*1.08,H*(.26+.1*Math.sin(i*1.7))),c1=pt(am+da*.46,rb*1.3,ht*.82),c2=pt(am-da*.46,rb*1.3,ht*.82);
          ctx.quadraticCurveTo(c1[0],c1[1],tip[0],tip[1]);ctx.quadraticCurveTo(c2[0],c2[1],v[0],v[1])}
        ctx.closePath();if(LOWFX)ctx.fillStyle=front?'#ff8a2a':'#ff6a2a';else{const g=ctx.createLinearGradient(0,q0[1]-H*1.1,0,q0[1]+rb*ky);g.addColorStop(0,'#fff3c4');g.addColorStop(.35,'#ffb040');g.addColorStop(.8,'#ff6a2a');g.addColorStop(1,'#c0381a');ctx.fillStyle=g}
        ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.lineJoin='round';ctx.stroke();
        ctx.save();ctx.clip();ctx.fillStyle='rgba(58,26,18,.5)';ctx.beginPath();for(let i=0;i<3;i++){const u=(tt*.8+i*.33)%1,xx=q0[0]+(i-1)*16+(front?0:6),yy=q0[1]-H*(.08+.4*u)+(front?rb*ky*.5:-rb*ky*.4);ctx.moveTo(xx+4.5,yy);ctx.ellipse(xx,yy,4.5,2,.3*(i-1),0,TAU)}ctx.fill();ctx.restore()};
      L.add(-7e3+3,()=>{if(!LOWFX)shine('255,140,50',q0[0],q0[1]-20,70,.55*k);const rr=rb*1.05*Math.min(1,.35+.65*k);ga(Math.min(1,k*2),()=>{ctx.beginPath();ctx.ellipse(q0[0],q0[1],rr,rr*ky,0,0,TAU);ctx.fillStyle=LOWFX?'#ff8a2a':'#ffb040';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke()})});
      L.add(dc-80,()=>crownHalf(false,60*k));
      L.add(dc+30,()=>{crownHalf(true,36*k);
        for(let i=0;i<(LOWFX?1:8);i++){const a=i/8*TAU+.3,u=(t*1.7+i*.137)%1,q=P(Math.cos(a)*(18+u*26),Math.sin(a)*(18+u*26)*.8,36*k+u*34-u*u*52);if(u>.95)continue;ctx.fillStyle=`rgba(255,${190-80*u|0},70,${1-u})`;ball([q[0]+q0[0]-o0[0],q[1]+q0[1]-o0[1]],2.6-1.6*u);ctx.fill()}})}}
  else if(e.k==='thud'){L.add(-6e3,()=>{const r=30+t*60,pts=[];for(let i=0;i<28;i++){const a=i/28*TAU;pts.push(P(-10+Math.cos(a)*r,Math.sin(a)*r,0))}ctx.strokeStyle=`rgba(255,160,80,${.55*(1-t)})`;ctx.lineWidth=3*(1-t)+1;poly(pts);ctx.stroke()})}
  else if(e.k==='drops'&&S){L.add(999,()=>{for(let i=0;i<8;i++){const f=1+i*1.4,s=surf(S,f,i%2?.3:2.8,2),u=cl(t*1.6-i*.04,0,1);if(u<=0||u>=1)continue;const dv=nrm(add(s.n,[0,0,.6])),q=P(add(s.p,add(mul(dv,u*22),[0,0,-u*u*30])));ctx.fillStyle=`rgba(255,${160-40*u|0},50,${1-u})`;ball(q,1.8-u);ctx.fill()}})}
  else if(e.k==='dive2'){L.add(D(0,0,0)+10,()=>{for(let i=0;i<8;i++){const a=i/8*TAU,u=t,q=P(Math.cos(a)*(10+u*26),Math.sin(a)*(10+u*26),24*u*(1-u)*2);ctx.fillStyle=`rgba(255,${170-60*u|0},60,${1-u})`;ball(q,2.4-u*1.4);ctx.fill()}})}
  else if(e.k==='dig'){L.add(-6e3+1,()=>{for(const l of[0,1]){const f=A.feet[l],q=P(f[0]+8,f[1],0);for(let i=0;i<3;i++){const u=(t*3+i/3)%1;ctx.fillStyle=`rgba(255,${210-80*u|0},120,${1-u})`;ball([q[0]+Math.sin(i*2.1+u*4)*4,q[1]-u*6],1);ctx.fill()}}})}
  else if(e.k==='steam'&&S){L.add(998,()=>{for(let i=0;i<6;i++){const u=(t*2+i/6)%1,f=.8+i*1.3,s=surf(S,f,Math.PI/2+(i%2?.6:-.6),1),q=P(add(s.p,[0,0,u*20]));ctx.fillStyle=`rgba(${K.steam},${.45*(1-u)})`;ball(q,2+u*5);ctx.fill()}})}
  else if(e.k==='slam'){L.add(-6e3,()=>{const r=26+t*70;for(const[w,a] of[[4,.6],[2,.9]]){const pts=[];for(let i=0;i<32;i++){const an=i/32*TAU;pts.push(P(8+Math.cos(an)*r,Math.sin(an)*r,0))}ctx.strokeStyle=`rgba(255,170,80,${a*(1-t)})`;ctx.lineWidth=w*(1-t)+.6;poly(pts);ctx.stroke()}})}
  else if(e.k==='roarfx'&&hd){const m0=mouthAt();L.add(D(m0)+60,()=>{const q=P(m0);for(let i=0;i<2;i++){const u=cl(t*1.2-i*.25,0,1);if(u<=0||u>=1)continue;ctx.strokeStyle=`rgba(255,236,190,${.6*(1-u)})`;ctx.lineWidth=2.2*(1-u)+.6;ctx.beginPath();ctx.arc(q[0],q[1],8+u*30,0,TAU);ctx.stroke()}})}
  else if(e.k==='ring'&&hd){const n0=hd.T([21,0,3]),d=hd.R([1,0,.25]);L.add(D(n0)+50,()=>{const q=P(add(n0,mul(d,4+t*30))),r=2.5+t*7,al=1-sstep(.5,1,t);
    // a ring of smoke: its dark body and a pale lit top, so it reads on the dark floor
    ctx.lineWidth=3.4*(1-t*.5)+.6;ctx.strokeStyle=`rgba(${K.smoke},${.75*al})`;ctx.beginPath();ctx.ellipse(q[0],q[1]-t*6,r,r*.62,0,0,TAU);ctx.stroke();
    ctx.lineWidth=1.3;ctx.strokeStyle=`rgba(226,212,196,${.85*al})`;ctx.beginPath();ctx.ellipse(q[0],q[1]-t*6-.8,r,r*.62,0,Math.PI*1.05,Math.PI*1.95);ctx.stroke();
    if(A.k2>.5&&t<.7){ctx.fillStyle='rgba(255,170,70,.9)';ball([q[0]-r*.3,q[1]-t*6],1);ctx.fill();ball([q[0]+r*.35,q[1]-t*6+.5],.8);ctx.fill()}})}
  else if(e.k==='tap'&&S){const tip=S[NS-1].c;L.add(-6e3+2,()=>{const q=P(tip[0],tip[1],0),r=4+t*10;ctx.strokeStyle=`rgba(200,170,140,${.6*(1-t)})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(q[0],q[1],r,r*.5,0,0,TAU);ctx.stroke();for(let i=0;i<3;i++){const u=t;ctx.fillStyle=`rgba(255,200,110,${1-u})`;ball([q[0]+(i-1)*u*7,q[1]-u*8*(1-u)*4],1);ctx.fill()}})}
  else if(e.k==='epool'){L.add(-7e3,()=>{const p=t,r=50*sstep(0,.15,p)*(1-sstep(.9,1,p)),cr=sstep(.9,1,p);if(r>.5)poolDraw(V0,[-4,0,0],r,0,{seed:5});if(cr>0){const pts=[];for(let i=0;i<20;i++){const a=i/20*TAU,rr=40*(1+.12*Math.sin(i*2.3));pts.push(P(-4+Math.cos(a)*rr,Math.sin(a)*rr,0))}ctx.fillStyle=`rgba(30,20,18,${.5*cr})`;poly(pts);ctx.fill()}
    if(p<.22&&!LOWFX){const q=P(-4,0,0);shine('255,120,40',q[0],q[1],70,.4*sstep(0,.05,p)*(1-sstep(.14,.22,p)))}})}
  else if(e.k==='drips'&&hd){L.add(D(hd.c)+40,()=>{for(let i=0;i<5;i++){const u=(t*2.2+i/5)%1,b=hd.T([[10,-12,8],[12,12,8],[18,-6,-6],[20,6,-6],[14,0,-8]][i]),q=P(add(b,[0,0,-u*20]));if(add(b,[0,0,-u*20])[2]<0)continue;ctx.fillStyle=`rgba(255,${150-40*u|0},40,${1-u*.6})`;ctx.beginPath();ctx.ellipse(q[0],q[1],1.4,2.2,0,0,TAU);ctx.fill()}})}
  else if(e.k==='crackfx'&&info){const X=info.X;L.add(-6e3,()=>{const k=1-t,a=P(X.T([-60,-30,0])),b=P(X.T([-95,0,0])),c=P(X.T([-60,30,0]));ctx.strokeStyle=`rgba(255,200,110,${.9*k})`;ctx.lineWidth=3*k+.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(b[0],b[1],c[0],c[1]);ctx.stroke();
    ctx.fillStyle='rgba(30,18,14,.4)';ctx.beginPath();ctx.ellipse(b[0],b[1],12,5,0,0,TAU);ctx.fill()})}
  else if(e.k==='cough'&&hd){const m0=mouthAt();L.add(D(m0)+50,()=>{const q=P(add(m0,[0,0,t*10])),r=2+t*5;ctx.strokeStyle=`rgba(${K.smoke},${.6*(1-t)})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(q[0],q[1],r,r*.6,0,0,TAU);ctx.stroke()})}
  else if(e.k==='dsteam'&&S){L.add(998,()=>{const f0=1-t,fi=sstep(0,.08,t);for(let i=0;i<4;i++){const f=(f0*(NS-2)+1)+i*.6,u=(t*5+i*.3)%1;if(f>NS-1)continue;const s=surf(S,Math.min(NS-1.01,f),Math.PI/2,1),q=P(add(s.p,[0,0,u*18]));ctx.fillStyle=`rgba(${K.steam},${.5*(1-u)*fi})`;ball(q,2+u*4);ctx.fill()}})}
  else if(e.k==='flameout'&&hd&&!A.crownOff){L.add(D(hd.c)+70,()=>{for(const c of CROWN){const tk=(t*.3-CRL.indexOf(c.k)*.025-.02)/.14;if(tk<=0||tk>=1)continue;const q=P(hd.T(c.tip));
    for(let i=0;i<3;i++){const qq=[q[0]+Math.sin(i*2.1+c.k)*3*tk,q[1]-tk*12-i*2.5];ctx.fillStyle=`rgba(${K.steam},${.55*(1-tk)})`;ball(qq,1.6+tk*3.5);ctx.fill()}}})}
  else if(e.k==='crownfall'&&hd){const cf=crownFallAt(V0,hd,t);if(cf)L.add(D(cf.c)+6,()=>crownFallDraw(V0,A,K,cf))}
  else if(e.k==='firefly'){L.add(1e4,()=>{const X0=CREST[0]-10,Y0=CREST[1]-4,path=u=>{if(u<.2)return lerp3([-10,0,24],[X0-4,Y0-2,40],ez(u/.2));if(u<.7){const a=(u-.2)/.5*TAU*1.2;return[X0+Math.cos(a)*10,Y0+Math.sin(a)*10,40+4*Math.sin(a*2)]}return lerp3([X0+10,Y0,40],[X0+18,Y0+8,0],ez((u-.7)/.3))},q=P(path(t));
    if(t<.85){if(!LOWFX)shine('255,190,90',q[0],q[1],7,.7);ctx.fillStyle='#fff3c4';ball(q,1.5);ctx.fill()}
    else{const k=1-sstep(.9,1,t),a=P(X0+12,Y0+4,0),b=P(X0+18,Y0+8,0),c=P(X0+26,Y0+8,0);ctx.strokeStyle=`rgba(255,170,70,${k})`;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.stroke();if(!LOWFX)shine('255,140,50',b[0],b[1],10,.6*k)}})}
  else if(e.k==='smokecurl'){L.add(1e4-1,()=>{for(let i=0;i<5;i++){const u=(t+i*.2)%1,q=P(-20+Math.sin(u*6+i)*5,0,20+u*36);ctx.fillStyle=`rgba(${K.smoke},${.35*Math.sin(u*Math.PI)*(1-t*.5)})`;ball(q,2.6+u*6);ctx.fill()}})}}
// the crown coming off the cooling skull (the climax of the defeat): it slides off (.55), falls, bounces on the floor (.575), spins and
// wobbles to rest beside her muzzle almost upright, a little on one side (lying flat on its side it read as a black claw under her chin:
// upright and turned toward the camera it is her crown at once, from every side); a last glint on its middle point (.93, before the end: the game keeps the last
// picture). It is drawn at its own depth (in the views from behind it stays behind the head). t from .52 of the move
const CREST=[54,40,4];
function crownFallAt(V0,hd,t){const p=.52+t*.48;if(p<.55)return null;const u=cl((p-.55)/.025,0,1),r2=cl((p-.575)/.1,0,1),c0=hd.T([CRB,0,8]),end=CREST,mid=[lerp(c0[0],end[0],.7),lerp(c0[1],end[1],.7),6];
  const o=V0.P([0,0,0]),yw=Math.atan2(V0.P([0,1,0])[1]-o[1],V0.P([1,0,0])[1]-o[1])+.35;
  let c,tilt,yaw;if(p<.575){c=lerp3(c0,[mid[0],mid[1],Math.max(6,c0[2]*(1-u*u))],ez(u));tilt=.9*u;yaw=yw+1.6*u}
  else{const b=Math.abs(Math.sin(Math.PI*2*r2))*(1-r2)*6,k=ez(r2);c=lerp3(mid,end,k);c=[c[0],c[1],c[2]+b];tilt=lerp(.9,.36,k)+.28*Math.sin(r2*9)*(1-r2);yaw=yw+1.6*(1-k)}
  return{p,c,tilt,yaw}}
function crownFallDraw(V0,A,K,cf){const{P}=V0,c=cf.c,p=cf.p;
  const R=v=>rotZ(rotY(rotX(v,cf.tilt),-.2),cf.yaw),T=d=>add(c,R(sub(d,[CRB,0,8]))),fake={T,R,c,F:{u:R([1,0,0]),v:R([0,1,0]),w:R([0,0,1])}};
  crownDraw(V0,fake,Object.assign({},A,{crownOff:0,husk0:0}),KC,null,null);
  const gl=pls(p,.93,.04);if(gl>0){const q=P(T(add(CROWN[0].b,mul(CROWN[0].d,CROWN[0].L*.9))));if(!LOWFX)shine('255,255,255',q[0],q[1],8,.8*gl);ctx.fillStyle=`rgba(255,255,255,${gl})`;ball(q,1.4);ctx.fill()}}
const KC=Object.assign({},K1,{edge:null});

// ------------------------------------------------------------------ the floor: pools of magma, the dome of slabs, the ball, the geyser, the print
// a pool of her magma on the floor (centre c, radius r, k cooling 0..1): the magma lit and bubbling, drawing back from the edge to 45% of
// the radius while a black crust with thin orange cracks grows round it; gone at 1
function poolDraw(V0,c,r,k,o){o=o||{};if(r<=.5||k>=1)return;const{P}=V0,seed=o.seed||0,al=1-sstep(.88,1,k),shp=f=>{const pts=[];for(let i=0;i<18;i++){const a=i/18*TAU,rr=r*f*(1+.13*Math.sin(i*2.3+seed)+.07*Math.sin(i*4.1+seed*2));pts.push(P(c[0]+Math.cos(a)*rr,c[1]+Math.sin(a)*rr,0))}return pts};
  ctx.save();ctx.globalAlpha*=al;
  // the crust (it grows from the edge as the pool cools)
  const outer=shp(1);ctx.lineJoin='round';smooth(outer);ctx.fillStyle=k>.02?'#2a1a14':'#3a1a10';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
  const m=lerp(.94,.45,sstep(0,.85,k)),inner=shp(m),q0=P(c);
  if(!LOWFX)shine('255,140,50',q0[0],q0[1],r*1.4*m,.25*(1-k),r*1.4*m*.55*C.KR());
  smooth(inner);const g=ctx.createRadialGradient(q0[0],q0[1],1,q0[0],q0[1],r*m*1.05);g.addColorStop(0,'#ffd05a');g.addColorStop(.35,'#ff8a2a');g.addColorStop(.8,'#d8401a');g.addColorStop(1,'#a8281a');ctx.fillStyle=LOWFX?'#ff6a2a':g;ctx.fill();
  // the thin cracks of the crust, the bubbles
  if(k>.05){ctx.strokeStyle=`rgba(255,140,60,${.7*(1-k)})`;ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<5;i++){const a=i/5*TAU+seed,a0=P(c[0]+Math.cos(a)*r*m,c[1]+Math.sin(a)*r*m,0),a1=P(c[0]+Math.cos(a+.15)*r*.95,c[1]+Math.sin(a+.15)*r*.95,0);ctx.moveTo(a0[0],a0[1]);ctx.lineTo(a1[0],a1[1])}ctx.stroke()}
  if(!LOWFX&&k<.8){const t=(G.t||0);for(let i=0;i<3;i++){const u=(t*.9+i/3+seed*.1)%1,a=i*2.1+seed,rr=r*m*.5*Math.sin(i+1),q=P(c[0]+Math.cos(a)*rr,c[1]+Math.sin(a)*rr,0);ctx.strokeStyle=`rgba(255,240,190,${.8*(1-u)})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(q[0],q[1]-u*2,1+u*2.6,0,TAU);ctx.stroke()}}
  ctx.restore()}
// the floor swelling and boiling into a dome of cracked slabs (radius 40) while she comes up under it (k 0..1): the slabs tilt up toward
// the middle, the cracks between them open and glow; it bursts (fade): the slabs fly out and fall
const DOMEA=[.15,1.2,2.25,3.2,4.25,5.25],DOMEJ=[1,.9,1.08,.94,1.04,.92];
function domeDraw(V0,k,fade){if(k<=0||fade>=1)return;const{P}=V0,e=ez(cl(k,0,1)),h=11*e,R=40*(.62+.38*e),gap=.6+2.6*e,q0=P(0,0,0),lv=(1-fade);
  if(!LOWFX)shine('255,120,40',q0[0],q0[1]-h*.4,R*1.5,.55*e*lv,R*.85);
  // the lava under the slabs (it shows in the cracks)
  {const pts=[];for(let i=0;i<14;i++){const a=i/14*TAU;pts.push(P(Math.cos(a)*R*1.02,Math.sin(a)*R*1.02,0))}smooth(pts);ctx.fillStyle=`rgba(255,${120+60*e|0},40,${.85*lv})`;ctx.fill()}
  const sl=[];for(let i=0;i<6;i++){const a0=DOMEA[i]+gap/R*.9,a1=DOMEA[(i+1)%6]+(i===5?TAU:0)-gap/R*.9,am=(a0+a1)/2,fl=fade*(22+5*i),up=Math.sin(Math.PI*cl(fade*1.3,0,1))*14,c=[Math.cos(am)*fl,Math.sin(am)*fl,up],ri=R*.24+gap,ro=R*DOMEJ[i],
      zi=h,zo=.6,pt=(a,r,z)=>add(c,[Math.cos(a)*r,Math.sin(a)*r,z]),top=[pt(a0,ri,zi),pt(am,ri*.9,zi+1),pt(a1,ri,zi),pt(a1,ro,zo),pt(am,ro*1.04,zo),pt(a0,ro,zo)],bot=top.map(q=>[q[0],q[1],Math.min(q[2],q[2]-3)]);
    sl.push({d:V0.D(pt(am,(ri+ro)/2,0)),FS:[top,[top[3],top[4],bot[4],bot[3]],[top[4],top[5],bot[5],bot[4]],[top[5],top[0],bot[0],bot[5]],[top[2],top[3],bot[3],bot[2]]]})}
  // the cap in the middle, the highest
  {const c=[0,0,h+1.5+fade*30],pts=[];for(let i=0;i<6;i++){const a=i/6*TAU+.3;pts.push(add(c,[Math.cos(a)*(R*.2),Math.sin(a)*(R*.2),0]))}const bot=pts.map(q=>[q[0],q[1],q[2]-3.5]);
    sl.push({d:V0.D(c)+5,FS:[pts].concat(pts.map((q,i)=>[q,pts[(i+1)%6],bot[(i+1)%6],bot[i]]))})}
  sl.sort((a,b)=>a.d-b.d);ctx.save();ctx.globalAlpha*=1-sstep(.6,1,fade);for(const q of sl)facets(V0,q.FS,T3('#7a6a60','#54463e','#2e2420'),{lw:1.8,seam:false,q:4});ctx.restore();
  if(!LOWFX&&fade<1){const t=G.t||0;for(let i=0;i<5;i++){const u=(t*1.4+i/5)%1,a=i*1.3,q=P(Math.cos(a)*R*.55,Math.sin(a)*R*.55,h*.6+u*14);ctx.fillStyle=`rgba(255,210,120,${(1-u)*lv})`;ball(q,1.3);ctx.fill()}}}
// the ball of magma in flight (at the origin of the current transform): a hot core, plates of obsidian crust with the lilac sheen, a tail
// of sparks behind it (a: the way it flies, on the screen), a glow; brighter in the second phase
function globDraw(a,s,p2){const r=7*s,ca=Math.cos(a),sa=Math.sin(a),t=G.t||0;if(!LOWFX)shine('255,140,50',0,0,r*3.2,.55);
  // the sparks behind it
  ctx.fillStyle='rgba(255,200,90,.85)';ctx.beginPath();for(let i=1;i<=4;i++){const d=r*.95+i*r*.55,w=Math.sin(i*2.7+t*20)*r*.25;ballP([-ca*d-sa*w,-sa*d+ca*w],Math.max(.5,r*.22*(1-i*.18)))}ctx.fill();
  // the hot core (lit from the upper left)
  ctx.beginPath();ctx.arc(0,0,r,0,TAU);if(LOWFX)ctx.fillStyle='#ffb040';else{const g=ctx.createRadialGradient(-r*.3,-r*.35,r*.1,0,0,r);g.addColorStop(0,p2?'#ffffff':'#fff3c4');g.addColorStop(.45,'#ffd05a');g.addColorStop(1,'#ff8a2a');ctx.fillStyle=g}ctx.fill();
  // two plates of crust on its shadow side (lower right), the magma glowing between them; a lilac sheen on each
  ctx.save();ctx.clip();ctx.lineJoin='round';
  for(const[a0,a1,d0,j] of GLOBP){ctx.beginPath();for(let i=0;i<=4;i++){const u=a0+(a1-a0)*i/4;ctx.lineTo(Math.cos(u)*r*1.2,Math.sin(u)*r*1.2)}for(let i=4;i>=0;i--){const u=a0+(a1-a0)*i/4,rr=r*(d0+j*Math.sin(i*2.1+a0*3));ctx.lineTo(Math.cos(u)*rr,Math.sin(u)*rr)}ctx.closePath();
    ctx.fillStyle='#43355a';ctx.fill();ctx.strokeStyle=p2?'#ffb040':INK;ctx.lineWidth=1.1;ctx.stroke();
    const um=(a0+a1)/2-.15;ctx.strokeStyle='rgba(190,170,240,.6)';ctx.lineWidth=Math.max(.6,r*.12);ctx.beginPath();ctx.arc(0,0,r*.84,um-.3,um+.2);ctx.stroke()}
  ctx.restore();ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.9)';ball([-r*.36,-r*.42],Math.max(.5,r*.16));ctx.fill()}
const GLOBP=[[-.1,1.05,.52,.06],[1.3,2.25,.6,.05]];
// the geyser of lava (at the origin of the current transform, its foot): k -1..0 the warning (the floor boils and cracks inside r 22),
// 0..1 its 0.6 s: it bursts out, a column 50 tall with a crown of splashes, a band of dark crust and flakes of obsidian, then falls back
function geyserDraw(k,s,p2){const V0=V(Math.PI/2),{P}=V0;ctx.save();ctx.scale(s,s);
  if(k<0){const w=1+k;const pts=[];for(let i=0;i<16;i++){const a=i/16*TAU;pts.push(P(Math.cos(a)*22,Math.sin(a)*22,0))}ctx.fillStyle=`rgba(255,110,40,${.15+.3*w})`;poly(pts);ctx.fill();
    ctx.strokeStyle=`rgba(255,${150+80*w|0},80,${.4+.5*w})`;ctx.lineWidth=1.4;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<5;i++){const a=i/5*TAU+.4,r1=6+12*w;const a0=P(Math.cos(a)*3,Math.sin(a)*3,0),a1=P(Math.cos(a+.3)*r1,Math.sin(a+.3)*r1,0);ctx.moveTo(a0[0],a0[1]);ctx.lineTo(a1[0],a1[1])}ctx.stroke();
    if(!LOWFX){const t=G.t||0;for(let i=0;i<3;i++){const u=(t*1.6+i/3)%1,q=P(Math.cos(i*2.1)*8,Math.sin(i*2.1)*8,0);ctx.strokeStyle=`rgba(255,240,190,${(1-u)*w})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(q[0],q[1]-u*3,1+u*3,0,TAU);ctx.stroke()}}ctx.restore();return}
  const up=k<.15?ez(k/.15):1,dn=k>.6?ez((k-.6)/.4):0,h=50*up*(1-dn),q0=P(0,0,0),t=G.t||0,rb=12+2*up,rt=7.5;
  if(!LOWFX)shine('255,140,50',q0[0],q0[1]-h*.5,34,.55*(1-dn));
  if(h>1){// the jet: its sides wobble, white-hot at the top, a dome of lava boiling over it, its ink outline
    const N=9,Lf=[],Rt=[];for(let i=0;i<=N;i++){const u=i/N,z=h*u,w=lerp(rb*.9,rt,Math.pow(u,.6))+(LOWFX?0:1.2*Math.sin(u*8-t*13+1)*(1-u*.4));Lf.push(P(0,w,z));Rt.push(P(0,-w,z))}
    const tp=P(0,0,h+rt*.85);ctx.beginPath();ctx.moveTo(Lf[0][0],Lf[0][1]);for(const q of Lf)ctx.lineTo(q[0],q[1]);ctx.quadraticCurveTo(Lf[N][0]-1,tp[1],tp[0],tp[1]);ctx.quadraticCurveTo(Rt[N][0]+1,tp[1],Rt[N][0],Rt[N][1]);for(let i=N;i>=0;i--)ctx.lineTo(Rt[i][0],Rt[i][1]);ctx.closePath();
    if(LOWFX)ctx.fillStyle='#ff8a2a';else{const g=ctx.createLinearGradient(0,tp[1],0,q0[1]);g.addColorStop(0,p2?'#ffffff':'#fff3c4');g.addColorStop(.3,'#ffd05a');g.addColorStop(.75,'#ff8a2a');g.addColorStop(1,'#e0451c');ctx.fillStyle=g}
    ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.lineJoin='round';ctx.stroke();
    // patches of dark crust carried up the jet
    ctx.save();ctx.clip();ctx.fillStyle='rgba(42,26,20,.85)';ctx.beginPath();for(let i=0;i<3;i++){const u=((k*1.6+i*.34)%1)*.75+.1,q=P(0,(i%2?1:-1)*rb*(.25+.2*i),h*u);ctx.moveTo(q[0]+3.2,q[1]);ctx.ellipse(q[0],q[1],3.2,1.8,.3*(i-1),0,TAU)}ctx.fill();ctx.restore();
    // the crown of splashes: tongues of lava flung out and up from the top
    ctx.fillStyle='#ffb040';ctx.strokeStyle='rgba(120,30,10,.8)';ctx.lineWidth=.9;for(let i=0;i<6;i++){const a=i/6*TAU+.4+k*2,e=Math.cos(a),c=P(0,0,h+rt*.4),u=.5+.5*Math.sin(Math.PI*cl(k*2.5-.05*i,0,1)),
      tip=P(e*(rt+5+4*u),Math.sin(a)*(rt+5+4*u),h+rt*.4+6*u-2),dx=tip[0]-c[0],dy=tip[1]-c[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*2.2,ny=dx/l*2.2,m=[c[0]+dx*.45,c[1]+dy*.45];
      ctx.beginPath();ctx.moveTo(m[0]+nx,m[1]+ny);ctx.quadraticCurveTo(tip[0]+nx*.4,tip[1]+ny*.4,tip[0],tip[1]);ctx.quadraticCurveTo(tip[0]-nx*.4,tip[1]-ny*.4,m[0]-nx,m[1]-ny);ctx.closePath();ctx.fill();ctx.stroke()}
    // a ring of splash at its foot
    {const R0=rb*1.15,ky=.55*C.KR();ctx.beginPath();ctx.moveTo(q0[0]+R0,q0[1]);ctx.ellipse(q0[0],q0[1],R0,R0*ky,0,0,Math.PI,false);
      for(let i=0;i<=10;i++){const a=Math.PI-i/10*Math.PI,sp=(2.5+2.5*Math.abs(Math.sin(i*1.9+t*6)))*up*(LOWFX?.6:1);ctx.lineTo(q0[0]+Math.cos(a)*R0*.92,q0[1]+Math.sin(a)*R0*ky*.6-sp)}
      ctx.closePath();ctx.fillStyle=LOWFX?'#ff8a2a':'#ff9a3a';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke()}}
  // the flakes of obsidian flying out
  if(k<.8){ctx.lineJoin='round';for(let i=0;i<4;i++){const u=cl(k*1.5-i*.05,0,1),a=i*1.7+.3,q=P(Math.cos(a)*(6+u*30),Math.sin(a)*(6+u*30),h*.6+u*40-u*u*60),r=2.4;ctx.beginPath();ctx.moveTo(q[0],q[1]-r);ctx.lineTo(q[0]+r*.8,q[1]+r*.2);ctx.lineTo(q[0],q[1]+r*.7);ctx.lineTo(q[0]-r*.8,q[1]+r*.1);ctx.closePath();
    ctx.fillStyle='#43355a';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.stroke();ctx.fillStyle='rgba(190,170,240,.7)';ball([q[0]-.5,q[1]-r*.4],.6);ctx.fill()}}
  // the drop it falls back into
  if(dn>0){const r=14*(.6+.4*dn),pts=[];for(let i=0;i<14;i++){const a=i/14*TAU,rr=r*(1+.1*Math.sin(i*2.5));pts.push(P(Math.cos(a)*rr,Math.sin(a)*rr,0))}ctx.globalAlpha*=1-sstep(.85,1,k);smooth(pts);ctx.fillStyle='#ff8a2a';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke()}
  ctx.restore()}
// the print of a front foot on the floor, turned along a (the pad and three toes with the notch of the claw): it lights up and cools
function printDraw(a,k){const V0=V(a),{P}=V0,c=k<.25?cmix('#ffd05a','#ffb02e',k/.25):cmix('#ffb02e','#2a1c1e',sstep(.25,.85,k)),al=1-sstep(.85,1,k);ctx.save();ctx.globalAlpha*=al;
  if(!LOWFX&&k<.5)shine('255,150,50',0,0,9,.4*(1-k*2));ctx.fillStyle=c;ctx.beginPath();const q=P(0,0,0);ctx.ellipse(q[0],q[1],4.2,4.2*.55*C.KR(),0,0,TAU);for(let i=-1;i<=1;i++){const d=[Math.cos(i*.55),Math.sin(i*.55),0],t=P(mul(d,6.5));ctx.moveTo(t[0]+2,t[1]);ctx.ellipse(t[0],t[1],2,1.3,0,0,TAU)}ctx.fill();
  ctx.strokeStyle=k<.6?'rgba(90,30,10,.6)':'rgba(10,8,8,.5)';ctx.lineWidth=1;ctx.beginPath();for(let i=-1;i<=1;i++){const d=[Math.cos(i*.55),Math.sin(i*.55),0],a0=P(mul(d,8.4)),a1=P(mul(d,10.6));ctx.moveTo(a0[0],a0[1]);ctx.lineTo(a1[0],a1[1])}ctx.stroke();ctx.restore()}

// ------------------------------------------------------------------ for the game: the pieces of her attacks, with the same look
// N3.salamanderGlob(x, y, z, a, sc, o): the ball of magma in flight (x, y the floor point, z its height, a the way it flies); o.p2
N3.salamanderGlob=function(x,y,z,a,sc,o){o=o||{};sc=sc||1;ctx.save();ctx.translate(x,y-(z||0));globDraw(a||0,sc,!!o.p2);ctx.restore()};
// N3.salamanderGeyser(x, y, k, sc, o): the geyser (k -1..0 the warning, 0..1 its life); o.p2 brighter
N3.salamanderGeyser=function(x,y,k,sc,o){o=o||{};ctx.save();ctx.translate(x,y);geyserDraw(k,sc||1,!!o.p2);ctx.restore()};
// N3.salamanderPool(x, y, r, k, o): any fire of hers on the floor (the train, the pools, the ring, the crescent, the drops); k its cooling
N3.salamanderPool=function(x,y,r,k,o){o=o||{};ctx.save();ctx.translate(x,y);poolDraw(V(o.a==null?Math.PI/2:o.a),[0,0,0],r,cl(k||0,0,1),{seed:o.seed||0});ctx.restore()};
// N3.salamanderPrint(x, y, a, k, o): the print of a front foot, turned along a, k 0..1 (it lights up, cools and goes)
N3.salamanderPrint=function(x,y,a,k,o){ctx.save();ctx.translate(x,y);printDraw(a||0,cl(k||0,0,1));ctx.restore()};
// N3.salamanderHusk(x, y, face, sc, o): the old skin (o.cool 0..1: its slits and spots go from red to black, o.crumble 0..1: it falls to
// ash in pieces from the tail to the head). Drawn once into a picture for every eighth of cool (as the rocks of the game)
const HSK={};let HSKN=0;
N3.salamanderHusk=function(x,y,face,sc,o){o=o||{};sc=sc||1;const cool=Math.round(cl(o.cool||0,0,1)*8)/8,cr=cl(o.crumble||0,0,1),f=Math.round(face*50)/50,key=f+'|'+cool+'|'+sc.toFixed(2)+'|'+C.cam.k;
  let im=HSK[key];if(!im){if(++HSKN>40){for(const k in HSK)delete HSK[k];HSKN=0}const W=Math.ceil(260*sc),H=Math.ceil(190*sc),cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),sv=ctx,sVV=VV;
    ctx=g;try{const V0=V(f);VV=V0;g.translate(W/2,H*.62);g.scale(sc,sc);huskDraw(V0,f,null,cool)}finally{ctx=sv;VV=sVV}im=HSK[key]={cv,ox:W/2,oy:H*.62}}
  const V0=V(f);if(cr<=0){ctx.drawImage(im.cv,x-im.ox,y-im.oy);return}
  // crumbling: the part from the tail up to the front of the ash is gone; the front is a ragged line of teeth that change as it goes
  // (the skin falls to ash in pieces, not cut by a knife), the ash falls along it
  // (the front runs along her body as it looks on the screen, from the tip of the tail to the snout, so it never cuts the raised head
  // off before the chest)
  const fr=lerp(-140,50,ez(cr)),t=G.t||0,a2=V0.P(-126,0,8),b2=V0.P(46,0,50),ax=b2[0]-a2[0],ay=b2[1]-a2[1],al=Math.hypot(ax,ay)||1,ux=ax/al,uy=ay/al,nx=-uy,ny=ux,
    u0=(fr+126)/172*al,c0=[a2[0]+ux*u0,a2[1]+uy*u0],edge=[];
  for(let i=0;i<=16;i++){const v=-80+i*10,jag=(i%2?5:-3.5)+2.5*Math.sin(i*2.7+cr*9+t*1.5);edge.push([c0[0]+nx*v+ux*jag,c0[1]+ny*v+uy*jag])}
  ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.moveTo(edge[0][0],edge[0][1]);for(const q of edge)ctx.lineTo(q[0],q[1]);
  const e1=edge[edge.length-1],e0=edge[0];ctx.lineTo(e1[0]+ux*600+nx*300,e1[1]+uy*600+ny*300);ctx.lineTo(e0[0]+ux*600-nx*300,e0[1]+uy*600-ny*300);ctx.closePath();ctx.clip();
  ctx.drawImage(im.cv,-im.ox,-im.oy);ctx.restore();
  for(let i=0;i<10;i++){const u=(t*1.3+i/10)%1,q=V0.P(fr+Math.sin(i*2.3)*6,-36+i*8+Math.sin(i*1.7)*3,10-u*10);ctx.fillStyle=`rgba(110,96,90,${(1-u)*(1-cr*.5)})`;ball([x+q[0],y+q[1]],1.4+u*1.6);ctx.fill()}};
for(const k of['Glob','Geyser','Pool','Print','Husk'])N3['salamander2'+k]=N3['salamander'+k];

// ------------------------------------------------------------------ registration
reg('salamander2',{n:'Salamandra di Lava',g:'boss',sc:1,an:MV.slice(),dur:Object.assign({},DUR),
  lab:{idle:'Ferma',walk:'Cammina',hit:'Colpita',spit:'Sputafuoco',whip:'Frustata',whip2:'Frustata doppia (fase 2)',burrow:'Si tuffa',swim:'La pinna (sotto il pavimento)',
    breach:'Esplode fuori',leap:'Salto del delfino (fase 2)',crouch:'Si acquatta',run:'Corsa',pant:'Collare freddo',erupt:'Eruzione (fase 2)',rage:'La muta (fase 2)',
    taunt:'Presa in giro',enter:'Entrata',die:'Sconfitta'}},salamander2);
// «Prima e dopo»: the Salamander of today (kept: once the game puts this model in place of N3.salamander, N3.salamander is the new one)
{const OLD=N3.salamander,M0=N3.meta.salamander;if(OLD&&M0)N3.meta.salamander2.old=(x,y,f,a,pp)=>OLD(x,y,f,M0.an.includes(a)?a:'idle',pp,M0.sc||1,{})}
})();
