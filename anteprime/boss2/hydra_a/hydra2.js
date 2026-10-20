// L'IDRA DELLA PALUDE rifatta: «l'Antica della Pozza Nera» (Denis, 15 ottobre: «rivisita tutti i boss, rendili più creepy e fatti meglio
// sia da fermi che nelle animazioni», «un po' più cupi», «falli possenti, belli, fighi, che diano timore nello sfidarli»; 16 ottobre, dopo
// il Golem: «sì, fai gli altri 12»). Design: docs/boss-classici-design/hydra.md. Un'idra antichissima vive nella Pozza Nera, sommersa fino
// alle spalle, con due grandi mani palmate aggrappate al bordo della sua acqua; dall'acqua salgono tre colli lunghissimi con la striscia
// d'avorio delle placche davanti e, su ogni testa, un ventaglio d'avorio e viola sulla nuca. Tre teste e una sola mente: respirano insieme,
// ti guardano insieme, sbattono gli occhi nello stesso istante. Prima di ogni colpo il veleno sale luminoso lungo la striscia del collo che
// colpirà, dall'acqua alla gola (come il cuore del Golem). A metà vita le gemme sulle fronti si aprono: erano occhi (il terzo occhio).
// Resta della Classica: forme grosse e tonde da giocattolo, contorni scuri spessi, colori pieni, occhi con la lucina, due sole zannette
// per testa, niente sangue, ferite o cuciture.
// Metodo dello spaventapasseri: scheletro 3D proiettato con V(face), mani a due ossa (ik), ogni testa con la sua telecamera, l'ordine di
// disegno dalla posa di riposo (acqua, coda, mano lontana, gobba, i tre colli con le teste, mano vicina); dipinto come la lanterna (tre
// toni, bordo caldo, bagliori morbidi). Ogni mossa dipende solo da p.
// Mosse: idle, walk, hit, bite (Morso a Tenaglia), stuck (Zanne piantate), spit (Salva di Veleno), breath (Soffio Velenoso), ambush
// (Agguato dal Profondo: il tratto .35-.65 si ripete), decree (Il Giudizio della Palude), dive (Si tuffa), rise (Riemerge), gaze (Sguardo
// del Terzo Occhio, fase 2), rage (Apre il terzo occhio), taunt (Presa in giro), enter (Entrata), die (Sconfitta).
// Opzioni: o.p2, o.tg (i tre bersagli del morso [dx, dy] in px dello schermo dal punto di disegno), o.tg2 (i due del secondo morso della
// fase 2), o.sweep (il giro delle teste nel Soffio), o.td (la distanza dell'eroe, per far convergere gli occhi), o.call (la chiamata),
// o.noGlob (niente palla di veleno nella Salva), o.noFx (niente spruzzi, gocce, schegge, nebbia).
// Con LOWFX niente bagliori, gocce, schiuma che si muove, nebbia né bolle; l'acqua è piatta; la luce del veleno è una striscia piatta.
// Disegni per il gioco con lo stesso aspetto: N3.hydra2Mouths (le bocche, i punti sotto le bocche, gli occhi e i terzi occhi sullo schermo),
// N3.hydra2Head (la testa che sbuca da una macchia d'acqua nera), N3.hydra2Under (le luci sotto il pavimento nel Tuffo), N3.hydra2Stain
// (l'acqua nera dove riemerge), N3.hydra2Glob (la palla di veleno), N3.hydra2Pool (la pozza), N3.hydra2Geyser (la colonna di veleno).
// Nel gioco prende il nome 'hydra' (src/js/89-idra-nuova.js).
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,run,cmix,rgbOf,poly,line,bbox,
  blink,keys,sstep,hitK,frame,ellAt,ellN,AXES,parts,reg,shine,chull,ik,starS,wa,softBall,KR}=C;
const{trem,fxOn,pls,rise,flash,ga,grad3,hullE,smoothP,svol3,T3,mixT,mixRgb,limbGrad}=C3K;

// ------------------------------------------------------------------ colours (three tones: light / base / shadow)
const K1={sc:T3('#66b86e','#33784a','#173d29'),rim:'255,226,170',loz:'rgba(43,31,66,.45)',plate:T3('#fff6d8','#efe0b4','#b39a64'),pline:'rgba(126,106,62,.45)',
  ivory:T3('#fffbea','#f1e4c0','#b8a272'),tip:'#8a6a38',mem:T3('#b06ad8','#7a40b0','#3c1a5e'),memG:'176,106,216',
  gem:'#a8f060',gemG:'150,255,90',gemLid:'#2a4a14',gemRim:'#173d29',eye:'#ffc93a',eyeG:'255,200,60',mouth:'#4a1a2e',tongue:'#d9709a',fang:'#f6ead2',
  ven:'#9be05a',venG:'150,230,90',w0:'#142420',w1:'#22362f',w2:'#3e5a50',wG:'170,255,120',foam:'#cfe9d8',bub:'#d8ffb0',pool:'#6fbf3a',poolE:'#2f5a1a',
  tw:'#f6eaff',ti:'#c77dff',tr:'#7a2ec0',tG:'199,125,255'};
const K2=Object.assign({},K1,{sc:T3('#4f9a62','#285e3e','#10301f'),rim:'199,125,255',mem:T3('#e2aaff','#9a52d8','#4a2270'),memG:'199,125,255',eye:'#ffb02e',
  eyeG:'255,170,50',ven:'#c77dff',venG:'199,125,255',w0:'#1a1226',w1:'#2c1f3e',w2:'#5a3f7e',wG:'199,125,255',bub:'#f0d8ff',pool:'#9a52d8',poolE:'#3c1a5e'});
// the defeat: the water clears
const KW={w0:'#24524a',w1:'#3a7a6c',w2:'#6fae9a'};
const PALC={};
function pal(k2,clr){k2=Math.round(cl(k2,0,1)*12)/12;clr=Math.round(cl(clr||0,0,1)*12)/12;const id=k2+'|'+clr;if(PALC[id])return PALC[id];const K={};
  for(const k in K1){const a=K1[k],b=K2[k];K[k]=typeof a!=='string'?mixT(a,b,k2):a===b?a:a[0]==='#'?cmix(a,b,k2):mixRgb(a,b,k2)}
  if(clr>0)for(const k in KW)K[k]=cmix(K[k],KW[k],clr);K.k2=k2;return PALC[id]=K}
const rgbS=c=>rgbOf(c).join(',');

// ------------------------------------------------------------------ the body at rest (model units: x forward, y its right, z up)
const HB={c:[-8,0,0],r:[42,56,36]};                  // the hump, cut at the water
// the three necks: where each comes out of the hump, where its head rests, its size, the rays of its fan (degrees) and their lengths
const HN=[{s:-1,root:[20,-22,20],head:[18,-50,70],k:1,fa:[-35,0,35],fl:[11,15,11]},
  {s:0,root:[24,0,24],head:[24,0,92],k:1.12,fa:[-50,-25,0,25,50],fl:[10,14,19,14,10]},
  {s:1,root:[20,22,20],head:[18,50,70],k:1,fa:[-35,0,35],fl:[11,15,11]}];
const HE=[{c:[-4,0,1],r:[11,10.5,9]},{c:[9,0,-1.5],r:[12.5,7.5,6]}];   // a head: the skull and the long snout (head axes, ×k)
const FINS=[[2.04,11],[2.64,14],[3.14,18],[3.64,14],[4.24,11]];        // the fins round its back: azimuth (π = behind), height
const SHO=[[6,-42,-14],[6,42,-14]],HAND=[[52,-50,1],[52,50,1]];         // the shoulders under the water, the hands on the rim
const DEG=Math.PI/180;
const yawC=(s,o)=>-s*Math.atan(50/((o.td||180)/.55));                   // the side heads turn in, the eyes converge on you

// ------------------------------------------------------------------ helpers (as boss2.js): rings, slicing at the water, outlines
function ellRows(c,r,F,n,m,a0,a1){a0=a0==null?-Math.PI/2:a0;a1=a1==null?Math.PI/2:a1;const rows=[];for(let i=0;i<=n;i++){const a=a0+i/n*(a1-a0),z=Math.sin(a),rr=Math.cos(a),row=[],mm=rr<1e-3?1:m;
  for(let j=0;j<mm;j++){const t=j/m*TAU;row.push(add(c,add(add(mul(F.u,Math.cos(t)*rr*r[0]),mul(F.v,Math.sin(t)*rr*r[1])),mul(F.w,z*r[2]))))}rows.push(row)}return rows}
function cutRows(rows,zc){const out=[],n=rows.length;
  for(let i=0;i<n;i++){const r=rows[i],m=r.length;for(let j=0;j<m;j++){const a=r[j],da=a[2]-zc;if(da>=0)out.push(a);
    const b=r[(j+1)%m];if(da*(b[2]-zc)<0)out.push(lerp3(a,b,da/(a[2]-b[2])));
    if(i<n-1){const r2=rows[i+1],c=r2[j%r2.length];if(da*(c[2]-zc)<0)out.push(lerp3(a,c,da/(a[2]-c[2])))}
    if(i>0&&m===1){const r0=rows[i-1];for(const c of r0)if(da*(c[2]-zc)<0)out.push(lerp3(a,c,da/(a[2]-c[2])))}}}
  return out}
const below=(rows,zc)=>{for(const r of rows)for(const q of r)if(q[2]<zc)return true;return false};
const flat=rows=>[].concat(...rows);
function grow(h,d){const n=h.length;let ar=0;for(let i=0;i<n;i++){const a=h[i],b=h[(i+1)%n];ar+=a[0]*b[1]-b[0]*a[1]}const sg=ar>0?1:-1,N=[];
  for(let i=0;i<n;i++){const a=h[i],b=h[(i+1)%n],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;N.push([sg*dy/l,-sg*dx/l])}
  const out=[];for(let i=0;i<n;i++){const n1=N[(i+n-1)%n],n2=N[i],k=d/Math.max(.35,1+n1[0]*n2[0]+n1[1]*n2[1]);out.push([h[i][0]+(n1[0]+n2[0])*k,h[i][1]+(n1[1]+n2[1])*k])}return out}
function polys(H){ctx.beginPath();for(const h of H){ctx.moveTo(h[0][0],h[0][1]);for(let i=1;i<h.length;i++)ctx.lineTo(h[i][0],h[i][1]);ctx.closePath()}}
function discP(V0,c,n,r,r2,u0){let u=u0||cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(sub(u,mul(n,dot(u,n))));const v=cross(n,u),o=V0.P(c),A=V0.P(add(c,mul(u,r))),B=V0.P(add(c,mul(v,r2||r))),
  a=[A[0]-o[0],A[1]-o[1]],b=[B[0]-o[0],B[1]-o[1]],p=a[0]*a[0]+b[0]*b[0],q=a[1]*a[1]+b[1]*b[1],s=a[0]*a[1]+b[0]*b[1],m=(p+q)/2,d=Math.sqrt((p-q)*(p-q)/4+s*s),
  rx=Math.sqrt(m+d),ry=Math.sqrt(Math.max(1e-4,m-d)),ph=.5*Math.atan2(2*s,p-q);ctx.moveTo(o[0]+rx*Math.cos(ph),o[1]+rx*Math.sin(ph));ctx.ellipse(o[0],o[1],rx,ry,ph,0,TAU)}
// a head split at the mouth into a top and a jaw (boss2.js): the hull of the ellipsoids E (head axes F round hc) cut by the plane of the
// mouth at the height hz; the jaw turns down by ja round a hinge at the back of the cut
function splitHead(hc,F,E,hz,ja,n,m){const top=d=>add(hc,add(add(mul(F.u,d[0]),mul(F.v,d[1])),mul(F.w,d[2])));let hx=1e9;
  for(const e of E){const zl=cl((hz-e.c[2])/e.r[2],-.98,.98);e.zl=zl;e.rr=Math.sqrt(1-zl*zl);hx=Math.min(hx,e.c[0]-e.rr*e.r[0])}hx*=.92;
  const cs=Math.cos(ja),sn=Math.sin(ja),jaw=d=>{const a=d[0]-hx,b=d[2]-hz;return top([hx+a*cs+b*sn,d[1],hz+b*cs-a*sn])},
    band=(e,z0,z1,fn,nn)=>{const rows=[],a0=Math.asin(z0),a1=Math.asin(z1);for(let i=0;i<=nn;i++){const a=a0+(a1-a0)*i/nn,z=Math.sin(a),q=Math.cos(a),row=[],mm=q<1e-3?1:m;
      for(let j=0;j<mm;j++){const t=j/m*TAU;row.push(fn([e.c[0]+Math.cos(t)*q*e.r[0],e.c[1]+Math.sin(t)*q*e.r[1],e.c[2]+z*e.r[2]]))}rows.push(row)}return rows},
    dome=[],bowl=[],floor=[],palate=[];
  for(const e of E){const d=band(e,e.zl,1,top,n),b=band(e,-1,e.zl,jaw,Math.max(2,n>>1));dome.push(...d);bowl.push(...b);palate.push(...d[0]);floor.push(...b[b.length-1])}
  const lipL=t=>{let best=null,bd=-1e9;for(const e of E){const d=[e.c[0]+Math.cos(t)*e.rr*e.r[0],e.c[1]+Math.sin(t)*e.rr*e.r[1],hz],k=d[0]*Math.cos(t)+d[1]*Math.sin(t);if(k>bd){bd=k;best={d,e}}}return best};
  return{top,jaw,dome,bowl,floor,palate,hz,lip:(t,k)=>(k?jaw:top)(lipL(t).d),lipN:t=>{const e=lipL(t).e;return ellN(e.r,F,[Math.cos(t)*e.rr,Math.sin(t)*e.rr,e.zl])},wJ:add(mul(F.u,sn),mul(F.w,cs))}}
// a smooth volume cut at the water, painted in three tones (svol3); the coloured rim (warm in the first phase, violet in the second)
function svc(V0,rows,T,wl,o){const pts=below(rows,wl)?cutRows(rows,wl):flat(rows);if(pts.length<3)return null;const H=svol3(V0,pts,T,o);return H.length>2?H:null}
function rimK(pts,al,rgb){if(!pts||pts.length<3)return;const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0)/2,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.15,cy+Rr*.15),
  kx=1-1.9/Math.max(1,(x1-x0)/2),ky=1-1.9/Math.max(1,(y1-y0)/2);g.addColorStop(0,`rgba(${rgb},${al})`);g.addColorStop(1,`rgba(${rgb},0)`);
  ctx.beginPath();for(const q of pts)ctx.lineTo(cx+(q[0]-cx)*kx,cy+(q[1]-cy)*ky);ctx.closePath();ctx.strokeStyle=g;ctx.lineWidth=1.3;ctx.stroke()}
const rimA=K=>K.k2>.5?.42:.2;
// a foam collar on the water where a piece comes out of it (screen centre q, radius r)
function foam(q,r,K,a){ctx.save();ctx.globalAlpha*=a==null?1:a;ctx.strokeStyle=`rgba(${rgbS(K.foam)},.7)`;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(q[0],q[1],r*1.3,r*.55*1.3*KR(),0,0,TAU);ctx.stroke();
  ctx.strokeStyle='rgba(10,20,16,.35)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(q[0],q[1]+.6,r*1.05,r*.55*1.05*KR(),0,.15,Math.PI-.15);ctx.stroke();ctx.restore()}

// ------------------------------------------------------------------ the pose: every move depends only on p
function hd0(n,p2){return{s:n.s,off:[0,0,0],yaw:0,pitch:-.12,roll:0,open:0,fan:p2?1:.6,ft:p2?1:0,wing:0,tongue:0,sac:0,vl:null,gem:.3,third:p2?1:0,wide:0,spiral:0,spA:0,
  blink:1,squint:0,shut:0,reach:0,tgt:null,slide:1,tug:0,sq:0,under:0,uz:-34,arch:0,archPh:0,stars:0,drip:-1,glob:-1,mist:-1,cough:0,throat:0,smirk:0}}
function hand0(i){return{p:HAND[i].slice(),tap:[0,0,0],palm:0,curl:0}}
// the bite targets: the game's screen offsets brought to the floor of the model (the inverse of V(face)); the side ones by the sign of y
function tgW(face,q){const c=Math.cos(face),s=Math.sin(face),Y=q[1]/.55;return[q[0]*c+Y*s,-q[0]*s+Y*c,0]}
function biteT(o,face){let l=[120,-60,0],m=[140,0,0],r=[120,60,0];
  if(o.tg){const a=tgW(face,o.tg[0]),b=tgW(face,o.tg[1]),c=tgW(face,o.tg[2]);m=b;if(a[1]<=c[1]){l=a;r=c}else{l=c;r=a}}
  let l2=add(l,[-26,-24,0]),r2=add(r,[-26,24,0]);if(o.tg2){const a=tgW(face,o.tg2[0]),c=tgW(face,o.tg2[1]);if(a[1]<=c[1]){l2=a;r2=c}else{l2=c;r2=a}}
  return{side:{'-1':l,'1':r},mid:m,side2:{'-1':l2,'1':r2}}}
function hPose(anim,p,o,face){const p2=!!o.p2&&anim!=='rage',ph=p*TAU;
  const A={B:[0,0,p2?10:0],lean:0,roll:0,yaw:0,s:0,br:0,wz:0,wr:74,k2:p2?1:0,clr:0,dark:0,swirl:0,wglow:0,boil:0,rings:[],wake:0,fin:0,finW:0,finUp:1,tail:0,
    hands:[hand0(0),hand0(1)],H:HN.map(n=>hd0(n,p2)),fx:[],flashW:0,flashV:0,glowAll:0,eyesU:0,gemsU:0,flies:-1,fanRings:-1,tips:0,memLit:p2?1:0};
  const H=A.H,L0=H[0],M0=H[1],R0=H[2],sides=[L0,R0];
  if(anim==='walk'){A.B[2]+=Math.sin(ph*2);A.lean=.015*Math.sin(ph*2+1);A.roll=.03*Math.sin(ph);A.wake=1;A.finW=1;A.tail=.25*Math.sin(ph);
    H.forEach(h=>{h.off=[4*Math.sin(ph),0,1.2*Math.sin(ph*2)];h.pitch=-.12-.05*Math.sin(ph);h.blink=blink(p,.3,.07)});
    const KP=[[0,[52,-50,1]],[.2,[62,-46,3]],[.45,[40,-54,-2]],[.7,[46,-53,2.5]],[1,[52,-50,1]]];A.hands[0].p=keys(KP,p);const r=keys(KP,(p+.5)%1);A.hands[1].p=[r[0],-r[1],r[2]]}
  else if(anim==='hit'){const kb=hitK(p),kc=cl(kb,0,1);A.B[2]-=3*kb;H.forEach(h=>{h.off=[-8*kb,0,4*kb];h.pitch=-.12+.35*kb;h.shut=p<.5?1:0;h.fan=lerp(h.fan,.3,kc)});
    if(p<.6)A.fx.push({k:'splash',at:[34,0,0],t:p/.6,n:7,r:34})}
  else if(anim==='bite'){const T=biteT(o,face),prep=sstep(0,.4,p),ch=rise(p,.40,.44,.46,.48);
    A.hands.forEach((hd,i)=>{const sd=i?1:-1;hd.p=[52,sd*lerp(50,58,prep),1+5*rise(p,.56,.6,.62,.645)]});
    for(const h of sides){const s=h.s,strike=sstep(.44,.48,p);h.off=[-6*prep-2*ch,s*12*prep,10*prep];h.yaw=s*.25*prep;h.pitch=-.12-.2*prep;
      h.open=.9*sstep(.12,.2,p);h.fan=lerp(h.fan,1,sstep(0,.2,p));h.ft=sstep(0,.2,p);h.wing=sstep(.05,.2,p);h.vl=[0,sstep(.05,.4,p)];
      h.gem=.3+.7*Math.max(pls(p,.12,.06),pls(p,.28,.06));h.squint=ch>0?.6:0;h.tug=pls(p,.52,.03)+pls(p,.56,.03);h.sq=pls(p,.49,.04);h.reach=strike;h.tgt=T.side[s];
      if(!p2){h.reach=strike*(1-sstep(.58,.8,p));if(p>=.47){h.open=.05+.45*rise(p,.58,.64,.7,.8);h.vl=null;h.squint=.5*(1-sstep(.58,.7,p));h.wing=1-sstep(.58,.8,p);h.fan=lerp(1,.6,sstep(.6,.85,p));h.ft=1-sstep(.6,.85,p)}}
      else{const u=sstep(.55,.88,p),lift=45*rise(p,.52,.6,.9,.95);h.tgt=add(lerp3(T.side[s],T.side2[s],u),[0,0,lift]);h.sq=Math.max(h.sq,pls(p,.96,.04));
        if(p>=.47){h.open=p<.52?.05:p<.95?.8*rise(p,.52,.58,.9,.95):.05;h.squint=.7*rise(p,.86,.88,.92,.95);h.vl=p>.6?[0,sstep(.6,.9,p)]:null;if(p>.95)h.vl=null}}
      if(p>=.48&&p<.6)A.fx.push({k:'chips',at:T.side[s],t:(p-.48)/.12});if(p2&&p>=.95)A.fx.push({k:'chips',at:T.side2[s],t:(p-.95)/.05*.4})}
    {const h=M0,coil=sstep(.54,.62,p)*(1-sstep(.62,.64,p)),strike=sstep(.62,.64,p);h.off=[-10*prep-14*coil,0,12*prep];h.pitch=-.12-.25*prep;
      h.open=.9*sstep(.15,.25,p);h.fan=lerp(h.fan,1,sstep(0,.2,p));h.ft=sstep(0,.2,p);h.wing=sstep(.05,.2,p);h.vl=[0,sstep(.05,.4,p)];
      h.gem=.3+.7*Math.max(pls(p,.12,.06),pls(p,.28,.06));h.reach=strike;h.tgt=T.mid;h.sq=pls(p,.65,.04);if(coil>.3)h.squint=.6;
      if(p>=.62){h.squint=.6;h.open=p<.635?.9:.15;h.fan=lerp(1,.3,sstep(.64,.8,p));h.ft=1-sstep(.64,.8,p);h.gem=.3*(1-sstep(.62,.7,p));h.vl=null;h.wing=1-sstep(.64,.8,p)}
      if(p>=.64&&p<.8)A.fx.push({k:'chips',at:T.mid,t:(p-.64)/.16,big:1})}
    const lunge=rise(p,.62,.65,.8,1);A.B[0]+=4*lunge;A.lean=.1*lunge;
    if(p>=.645&&p<.75)for(const i of[0,1])A.fx.push({k:'splash',at:A.hands[i].p.slice(),t:(p-.645)/.105,n:5,r:10})}
  else if(anim==='stuck'){const T=biteT(o,face),free=sstep(.8,1,p),tug=pls(p,.25,.1)+pls(p,.55,.1);
    M0.reach=1-free;M0.tgt=T.mid;M0.open=.15+.3*pls(p,.82,.08);M0.fan=lerp(.3,p2?1:.6,free);M0.ft=free*(p2?1:0);M0.gem=free*.3;M0.squint=.6*(1-free);M0.tug=tug;
    M0.yaw=.15*Math.sin((p-.8)*TAU*12)*rise(p,.8,.82,.88,.92);A.lean=-.08*tug;
    A.hands.forEach((hd,i)=>{hd.p=[52,(i?1:-1)*58*(1-free)+(i?1:-1)*50*free,1]});
    for(const h of sides){h.open=.65*tug+.1;h.off=[-4*tug,h.s*2*tug,2*tug];h.pitch=-.12+.15*tug;h.wing=tug}
    if(p>=.8&&p<.98)A.fx.push({k:'chips',at:T.mid,t:(p-.8)/.18,big:1})}
  else if(anim==='spit'){const TM=[[0,.25,.30],[.12,.37,.42],[.24,.49,.54]],T2=[[.52,.62,.66],null,[.60,.70,.74]];
    const sh=(a,b,t)=>({lit:sstep(a,b,p)*(1-sstep(t,t+.06,p)),rear:rise(p,b-.12,t-.02,t+.02,t+.14),kick:pls(p,t+.03,.06),sac:sstep(b-.08,b,p)*(1-sstep(t,t+.05,p)),op:pls(p,t,.1)});
    H.forEach((h,i)=>{let q=sh(...TM[i]);const ts=[TM[i][2]];if(p2&&T2[i]){ts.push(T2[i][2]);if(p>.5){const b=sh(...T2[i]);q={lit:Math.max(q.lit,b.lit),rear:Math.max(q.rear,b.rear),kick:Math.max(q.kick,b.kick),sac:Math.max(q.sac,b.sac),op:Math.max(q.op,b.op)}}}
      h.vl=q.lit>.01?[0,q.lit]:null;h.sac=q.sac;h.off=[-8*q.rear-3*q.kick,0,8*q.rear];h.pitch=-.12+.4*q.rear;h.open=Math.max(.8*q.op,.12*q.rear);h.squint=q.rear>.3?.4:0;h.wing=q.rear;
      for(const t of ts){if(p>=t&&p<t+.08&&!o.noGlob)h.glob=(p-t)/.08;if(p>t+.02&&p<t+.2)h.drip=(p-t-.02)/.18}
      const lk=p2?.9:.8;h.tongue=pls(p,lk,.08)});
    }
  else if(anim==='breath'){const back=sstep(0,.3,p)*(1-sstep(.3,.4,p)),fwd=sstep(.3,.4,p)*(1-sstep(.85,1,p)),jet=rise(p,.38,.42,.83,.87);A.glowAll=rise(p,.05,.3,.4,.55);
    H.forEach(h=>{h.off=[-8*back+10*fwd,0,10*back-6*fwd];h.pitch=-.12+.35*back-.25*fwd;h.vl=p<.4?[0,sstep(0,.3,p)]:[sstep(.4,.85,p),1];if(p>=.85)h.vl=null;
      h.sac=sstep(.1,.3,p)*(1-sstep(.38,.45,p));h.fan=p<.86?1:lerp(1,h.fan,sstep(.86,1,p));h.ft=p<.86?1:1-sstep(.86,1,p)*(p2?0:1);h.wing=rise(p,.05,.2,.85,.95);
      h.open=sstep(.3,.36,p)*(1-sstep(.85,.92,p));h.squint=fwd>.5?.6:0;h.off[2]+=.8*trem(p,.40,.85,6,2.4);h.yaw=(p2?(o.sweep||0):0)*jet;if(jet>0)h.mist=jet;
      h.cough=pls(p,.87,.04)+pls(p,.92,.04);if(p>.86)h.yaw+=.1*Math.sin((p-.86)*TAU*8)*(1-sstep(.9,1,p))})}
  else if(anim==='ambush'){const hiss=rise(p,0,.08,.15,.2),dv=[.17,.27,.22],up=[.89,.86,.92];A.br=.03*(.5-.5*Math.cos(TAU*4*p));A.gemsU=rise(p,.28,.32,.85,.88);
    H.forEach((h,i)=>{const t=dv[i],u=up[i],dn=sstep(t-.03,t+.05,p),bk=sstep(u,u+.06,p),d=sstep(0,.15,p);
      h.open=.6*hiss+.5*rise(p,u,u+.03,u+.06,u+.1);h.wing=Math.max(hiss,rise(p,u,u+.03,u+.06,u+.1));h.off=[-4*hiss,0,8*hiss];h.pitch=-.12+.2*hiss-.9*dn*(1-bk);
      h.vl=d>0&&d<1?[Math.max(0,1-d-.35),1-d]:null;h.under=dn*(1-bk);h.uz=-30;h.arch=sstep(t+.02,t+.1,p)*(1-sstep(u-.04,u+.02,p));h.archPh=(p-.3)/.3;
      if(p>=t&&p<t+.12)A.fx.push({k:'splash',head:i,t:(p-t)/.12,n:7,r:14});if(p>=u&&p<u+.12)A.fx.push({k:'splash',head:i,t:(p-u)/.12,n:6,r:12});
      if(p>u+.05)h.yaw+=.12*Math.sin((p-u)*TAU*6)*(1-sstep(u+.05,1,p))});
    A.hands.forEach(hd=>{hd.curl=.5;hd.p=[52,hd.p[1]*1.06,1]})}
  else if(anim==='decree'){const up=sstep(0,.25,p)*(1-sstep(.8,1,p)),low=sstep(0,.25,p)*(1-sstep(.71,.76,p)),nod=sstep(.70,.73,p)*(1-sstep(.76,.88,p)),pu=.4*pls(p,.38,.08)+.7*pls(p,.5,.08)+pls(p,.62,.08);
    M0.off=[-2*up,0,16*up];M0.fan=lerp(M0.fan,1,up);M0.ft=Math.max(M0.ft,up);M0.pitch=-.12+.12*up-.5*nod;M0.gem=.3+.6*up+.6*pu;M0.wing=up;
    const dd=sstep(.05,.25,p);M0.vl=dd>0&&dd<1?[Math.max(0,1-dd-.35),1-dd]:null;
    for(const h of sides){h.off=[8*low,h.s*6*low,-40*low];h.pitch=-.12-.5*low;h.fan=lerp(h.fan,.3,low);h.ft=h.ft*(1-low);h.squint=.3*low}
    A.wglow=cl(sstep(.15,.3,p)*(1-sstep(.75,.95,p))*.7+.5*pu,0,1.2);
    A.hands.forEach(hd=>{const k=pls(p,.26,.08)+pls(p,.41,.08);hd.p[2]+=14*k;hd.palm=k});
    for(const t of[.30,.45])if(p>=t&&p<t+.15)for(const i of[0,1])A.fx.push({k:'splash',at:[52,i?50:-50,0],t:(p-t)/.15,n:6,r:16})}
  else if(anim==='dive'){const arch=rise(p,0,.08,.12,.4),dv=[.10,.32,.20],sink=sstep(.45,.9,p);A.B[2]+=-50*sink;A.swirl=sink;A.wr=lerp(74,24,sstep(.9,1,p));A.boil=.5*sink;
    H.forEach((h,i)=>{const t=dv[i],dn=sstep(t,t+.12,p);h.off=[-4*arch,0,6*arch];h.pitch=-.12+.2*arch-1*dn;h.under=dn;h.uz=i===1?lerp(-10,-34,sstep(.9,1,p)):-34;h.fan=lerp(h.fan,i===1?1:.3,dn);
      h.ft=i===1?Math.max(h.ft,dn):h.ft;if(p>=t+.06&&p<t+.18)A.fx.push({k:'splash',head:i,t:(p-t-.06)/.12,n:7,r:14})});
    A.hands.forEach((hd,i)=>{const k=sstep(.3,.45,p);hd.p=[lerp(52,40,k),(i?1:-1)*lerp(50,46,k),lerp(1,-16,k)]})}
  else if(anim==='rise'){const up=[.06,0,.12],hump=keys([[0,-40],[.2,-40],[.26,4],[.35,0],[1,0]],p);A.B[2]+=hump;A.boil=1-sstep(.2,.6,p);
    H.forEach((h,i)=>{const t=up[i],k=sstep(t,t+.12,p);h.under=1-k;h.uz=-34;h.yaw=h.s*.3*(1-sstep(.2,.6,p));h.pitch=-.12+.3*(1-sstep(t+.06,.3,p));
      if(p>=t&&p<t+.15)A.fx.push({k:'splash',head:i,t:(p-t)/.15,n:8,r:16});const sh=sstep(.6,.62,p)*(1-sstep(.85,1,p));h.yaw+=.12*Math.sin((p-.6)*TAU*5)*sh;
      h.open=.5*rise(p,.6,.66,.9,1);h.wing=rise(p,.6,.66,.9,1)});
    A.hands.forEach((hd,i)=>{const t=i?.38:.30,k=sstep(t-.08,t,p);hd.p=[lerp(40,52,k),(i?1:-1)*50,lerp(-16,1,k)];if(p>=t&&p<t+.15)A.fx.push({k:'splash',at:HAND[i].slice(),t:(p-t)/.15,n:5,r:12})});
    if(p>=.2&&p<.45)A.fx.push({k:'wave',t:(p-.2)/.25})}
  else if(anim==='gaze'){const close=sstep(0,.1,p)*(1-sstep(.8,1,p)),amp=rise(p,.1,.16,.74,.8)*(p<.55?1:.6),w=TAU*p*2;
    H.forEach(h=>{h.off=h.s?[6*close,-h.s*34*close,0]:[12*close,0,4*close];h.off[1]+=10*amp*Math.sin(w);h.off[2]+=5*amp*Math.sin(2*w);h.roll=.06*amp*Math.sin(w);
      h.third=1;h.wide=rise(p,.06,.14,.75,.85);h.spiral=rise(p,.1,.15,.55,.6);h.spA=TAU*3*p;h.fan=1;h.ft=1;h.open=.08*amp});
    A.fanRings=p>.1&&p<.55?((p-.1)/.45*4)%1:-1;A.flashV=flash(p,.55,.06)}
  else if(anim==='rage'){const k2=sstep(.78,.95,p),r1=sstep(.6,.75,p),lost=rise(p,0,.03,.18,.25),roar=rise(p,.78,.82,.9,.95);A.k2=k2;A.B[2]=10*r1;A.memLit=r1;
    H.forEach((h,i)=>{const q=[0,2.1,4.2][i],t3=[.42,.58,.50][i];h.off=[-6*lost,h.s*2*lost,4*lost+1.6*lost*Math.sin(p*TAU*6*2.8+q)];h.yaw=.18*lost*Math.sin(p*TAU*3*2.8+q*1.3);
      h.third=sstep(t3,t3+.04,p);h.wide=.6*rise(p,t3,t3+.03,t3+.1,t3+.2);h.fan=lerp(.6,1,r1);h.ft=r1;h.open=roar;h.pitch=-.12+.3*roar;h.wing=roar;h.squint=.5*lost});
    A.hands.forEach((hd,i)=>{const sd=i?1:-1,k=sstep(.6,.72,p)*(1-sstep(.9,1,p));hd.p=[lerp(52,60,k),sd*lerp(50,54,k),lerp(1,0,k)+8*rise(p,.6,.66,.69,.72)];
      if(p>=.72&&p<.86)A.fx.push({k:'chips',at:[60,sd*54,0],t:(p-.72)/.14})})}
  else if(anim==='taunt'){const dn=rise(p,0,.05,.45,.5),sw=Math.sin(TAU*1.5*cl(p/.5,0,1)),end=sstep(.8,.86,p);
    H.forEach((h,i)=>{h.off=[0,6*dn*sw,0];h.roll=.1*dn*sw;h.tongue=pls(p,[.52,.58,.64][i],.06)});
    M0.roll+=.35*end;M0.squint=.5*end;M0.open=.12*end;M0.smirk=end;for(const h of sides){h.off[2]+=1.5*end*Math.sin(p*TAU*7*1.1);h.squint=.45*end;h.open=.15*end}
    if(o.call){const k=rise(p,.72,.8,.96,1),hd=A.hands[1];hd.p=[52,50,1+20*k];hd.palm=k;hd.curl=k*(.5+.5*Math.sin(Math.max(0,p-.8)*TAU/.1))}}
  else if(anim==='enter'){const dark=sstep(0,.15,p)*(1-sstep(.67,.85,p)),body=-40*(1-sstep(.67,.81,p)),openF=sstep(.67,.81,p),roar=rise(p,.81,.84,.92,.95),tilt=sstep(.95,.975,p);
    A.dark=dark;A.swirl=sstep(0,.19,p)*(1-sstep(.5,.7,p));A.B[2]+=body;A.eyesU=sstep(.185,.2,p)*(1-sstep(.47,.52,p));A.gemsU=A.eyesU;A.finUp=sstep(.67,.81,p);
    H.forEach(h=>{h.under=1-sstep(.48,.67,p);h.uz=lerp(-40,-15,sstep(.29,.48,p));h.fan=p<.48?.9:lerp(.4,1,openF)*(1-.4*sstep(.95,1,p))+.0;h.ft=p<.48?1:openF*(1-sstep(.95,1,p));
      h.yaw=h.s*.18*rise(p,.67,.72,.78,.81);h.open=roar;h.pitch=-.12+.2*roar;h.wing=roar;h.roll=.3*tilt;h.drip=p>.48&&p<.7?((p-.48)/.22*3)%1:-1});
    A.hands.forEach((hd,i)=>{const t=i?.655:.62,k=sstep(t-.06,t,p);hd.p=[lerp(40,52,k),(i?1:-1)*50,lerp(-16,1,k)];if(p>=t&&p<t+.06)A.fx.push({k:'splash',at:HAND[i].slice(),t:(p-t)/.06,n:5,r:12})});
    if(p>=.67&&p<.81)A.fx.push({k:'wave',t:(p-.67)/.14});if(p>=.29&&p<.36)for(let i=0;i<3;i++)A.fx.push({k:'splash',head:i,t:(p-.29)/.07,n:5,r:10})}
  else if(anim==='die'){A.flashW=flash(p,0,.125);const daze=rise(p,.125,.15,.28,.32),clear=sstep(.6,.825,p);A.B[2]+=-50*sstep(.45,.65,p);A.clr=clear;
    A.flies=p>=.6?(p-.6)/.4:-1;A.tips=rise(p,.83,.87,.93,.97);
    const lp=[[.30,.40],[.50,.60],[.38,.475]];
    H.forEach((h,i)=>{const q=[0,1.7,3.4][i],[a,b]=lp[i],k=sstep(a,b,p),ret=sstep(0,.125,p);h.off=[-6*ret,4*daze*Math.sin(p*TAU*5+q),3*ret+2*daze*Math.sin(p*TAU*4+q)];
      h.roll=.18*daze*Math.sin(p*TAU*4.5+q);h.shut=p<.15?1:0;h.stars=daze;h.fan=lerp(.6,.2,sstep(.15,.3,p));h.ft=0;h.gem=.3*(1-sstep(.15+.05*i,.2+.05*i,p));
      h.under=k;h.uz=-34;h.pitch=-.12-.8*sstep(a-.05,b,p);if(p>=b-.05&&p<b+.08)A.fx.push({k:'splash',head:i,t:(p-b+.05)/.13,n:6,r:12})});
    M0.shut=p<.15?1:p>.475&&p<.6?0:p>=.3&&p<.475?.0:M0.shut;M0.open=.4*rise(p,.48,.5,.56,.6);
    A.hands.forEach((hd,i)=>{const k=sstep(.6,.75,p);hd.p=[lerp(52,42,k),(i?1:-1)*lerp(50,46,k),lerp(1,-16,k)]});
    if(p>=.94&&p<1)A.fx.push({k:'bubble',at:[18,0,0],t:(p-.94)/.06})}
  else{// idle (also the portrait of the arena at p 0): the hump and the water breathe, the heads breathe as a fan, all look at you together
    const nb=p2?2:1,br=q=>.5-.5*Math.cos(TAU*nb*q),k=br(p);A.br=.02*k;A.wz=k-.5;
    for(const st of[.10,.60]){const t=((p-st)%1+1)%1/.5;if(t<1)A.rings.push({t,r0:56})}
    A.tail=.2*Math.sin(ph);A.fin=.05*k;
    H.forEach((h,i)=>{const kh=br(p-.06),kf=br(p-.10);h.off=[0,h.s*3*kh,(h.s?3:4)*kh];h.yaw=h.s*.05*kh;if(!p2)h.fan=.6+.12*kf;
      h.blink=blink(p,.62,.07);if(p2)h.blink=Math.min(h.blink,blink(p,.12,.07));h.tongue=pls(p,.35+.03*i,.06);h.gem=.25+.2*k});
    M0.open=.18*rise(p,.45,.48,.52,.55);M0.throat=rise(p,.44,.48,.52,.56);M0.drip=p>=.8&&p<.9?(p-.8)/.1:-1;if(p>=.9)A.fx.push({k:'ring',head:1,t:(p-.9)/.1});
    A.hands[0].tap=[.15,.20,.25].map(t=>2.5*pls(p,t,.05));A.hands[1].tap=[.65,.70,.75].map(t=>2.5*pls(p,t,.05))}
  return A}

// ------------------------------------------------------------------ the rig: where every head is now and how its neck runs
function rigOf(A,X,face,o){const wl=A.wz,G=[];
  for(let i=0;i<3;i++){const n=HN[i],h=A.H[i],k=n.k;let hc=X.T(add(n.head,h.off));
    const yw=h.yaw+yawC(n.s,o),pi=h.pitch;let hu=X.Rd([Math.cos(pi)*Math.cos(yw),Math.cos(pi)*Math.sin(yw),Math.sin(pi)]),root=X.T(n.root);
    if(h.reach>0&&h.tgt){const T=h.tgt,dx=T[0]-root[0],dy=T[1]-root[1],dl=Math.hypot(dx,dy)||1,ux=dx/dl,uy=dy/dl,k2=h.reach;
      const hcT=[T[0]-ux*(5+2*h.tug)*k,T[1]-uy*(5+2*h.tug)*k,(T[2]||0)+7*k],huT=nrm([ux,uy,-.55+.25*h.tug]);hc=lerp3(hc,hcT,k2);hu=nrm(lerp3(hu,huT,k2));
      if(dl>110){const tl=Math.hypot(T[0],T[1])||1,Rs=[T[0]/tl*62,T[1]/tl*62,wl-2];root=lerp3(root,Rs,k2*h.slide)}}
    if(h.under>0)hc=[hc[0],hc[1],lerp(hc[2],h.uz,h.under)];
    let hv=cross([0,0,1],hu);if(len(hv)<.1)hv=X.Rd([0,1,0]);hv=nrm(hv);let hw=cross(hu,hv);
    if(h.roll){const c=Math.cos(h.roll),s=Math.sin(h.roll),v2=sub(mul(hv,c),mul(hw,s)),w2=add(mul(hw,c),mul(hv,s));hv=v2;hw=w2}
    G.push({i,s:n.s,k,hc,HF:{u:hu,v:hv,w:hw},root,h,n})}
  return G}
// the neck: a curve from the root to the nape of the head (a question mark at rest, stretched low on the floor in the bite, the arches of a
// sea serpent in the Agguato), one ring every 10 of length (at least 8), radius from 11 at the root to 7.5 under the head
function spineOf(g,X,wl){const{hc,HF,k,root,h,s}=g,hu=HF.u,hw=HF.w,e=add(add(hc,mul(hu,-7*k)),mul(hw,-3.5*k)),L=len(sub(e,root));
  let c1=add(root,X.Rd([-10,s*6,L*.5])),c2=sub(e,mul(add(mul(hw,.8),mul(hu,.55)),L*.36));
  if(h.reach>0){const d=nrm([e[0]-root[0],e[1]-root[1],0]),c1s=add(root,add(mul(d,L*.28),[0,0,13])),c2s=add(e,add(mul(hu,-L*.26),[0,0,6]));c1=lerp3(c1,c1s,h.reach);c2=lerp3(c2,c2s,h.reach)}
  const NS=18,pts=[];for(let j=0;j<=NS;j++){const t=j/NS,u=1-t;pts.push(add(add(mul(root,u*u*u),mul(c1,3*u*u*t)),add(mul(c2,3*u*t*t),mul(e,t*t*t))))}
  // in the Agguato: from the root down into the water, then out into its moat and along it, two humps of a sea serpent that slide outward
  // (one rises while the other sinks: it repeats with archPh, seamless)
  if(h.arch>0){const th0=s?s*.35:-.3,sw=s?s*1.2:.6,ph=((h.archPh%1)+1)%1;
    for(let j=0;j<=NS;j++){const t=j/NS,a=sstep(0,.25,t),r=lerp(26,62,a),th=th0+sw*sstep(.2,1,t),q=X.T([Math.cos(th)*r-6,Math.sin(th)*r,0]);let z=lerp(root[2],wl-9,a);
      if(t>.2)for(const kk of[0,.5]){const f=(ph+kk)%1,c=.3+.64*f,d=Math.abs(t-c)/.17;if(d<1)z=Math.max(z,wl-9+26*Math.sin(Math.PI*f)*Math.cos(d*Math.PI/2)**2)}
      pts[j]=lerp3(pts[j],[q[0],q[1],z],h.arch)}}
  const cum=[0];for(let j=1;j<pts.length;j++)cum.push(cum[j-1]+len(sub(pts[j],pts[j-1])));const Lt=cum[cum.length-1]||1,N=Math.max(8,Math.round(Lt/10)),S=[];
  let j=0;for(let i=0;i<=N;i++){const sl=Lt*i/N;while(j<pts.length-2&&cum[j+1]<sl)j++;const u=(sl-cum[j])/Math.max(1e-6,cum[j+1]-cum[j]);S.push({c:lerp3(pts[j],pts[j+1],cl(u,0,1)),s:i/N})}
  const fw=X.Rd([1,0,0]);
  for(let i=0;i<=N;i++){const q=S[i],t=nrm(sub(S[Math.min(N,i+1)].c,S[Math.max(0,i-1)].c)),ref=nrm(lerp3(fw,hu,q.s));let f=sub(ref,mul(t,dot(ref,t)));
    if(len(f)<.15)f=sub([0,0,-1],mul(t,-t[2]));f=nrm(f);q.t=t;q.f=f;q.v=cross(t,f);q.r=lerp(11,7.5,q.s);q.hide=h.arch>.6&&q.s<.22}
  return S}

// ------------------------------------------------------------------ the pieces
// a fan of rays with a membrane between them: root b, up axis a, side axis sd; angles and lengths; o.mem (tones), o.lit (the membrane
// glows), o.cut (the water), o.rw (ray width), o.bend (the middle ray's tip bent toward o.back), o.mk (how far the membrane goes)
function fanDraw(V0,b,a,sd,angs,lens,K,o){const{P,F}=V0,wl=o.cut==null?-1e9:o.cut,n=nrm(cross(a,sd)),fv=F(n),T=o.mem||K.mem,mk=o.mk||.8,mid=angs.length>>1;
  const R=angs.map((an,i)=>{const d=nrm(add(mul(a,Math.cos(an)),mul(sd,Math.sin(an))));let tip=add(b,mul(d,lens[i]));
    if(o.bend&&i===mid&&angs.length>3)tip=add(add(b,mul(d,lens[i]*.6)),mul(nrm(add(mul(d,Math.cos(o.bend)),mul(o.back,Math.sin(o.bend)))),lens[i]*.42));return{d,tip,m:lerp3(b,tip,mk)}});
  if(b[2]<wl-2&&R.every(r=>r.tip[2]<wl))return;
  const B=P(b),Pm=R.map(r=>P(r.m)),Pt=R.map(r=>P(r.tip)),rw=o.rw||1.2,mem=()=>{ctx.beginPath();for(let i=0;i<R.length-1;i++){const m1=Pm[i],m2=Pm[i+1],cx=lerp((m1[0]+m2[0])/2,B[0],.16),cy=lerp((m1[1]+m2[1])/2,B[1],.16);
    ctx.moveTo(B[0],B[1]);ctx.lineTo(m1[0],m1[1]);ctx.quadraticCurveTo(cx,cy,m2[0],m2[1]);ctx.closePath()}},rays=()=>{ctx.beginPath();for(const t of Pt){ctx.moveTo(B[0],B[1]);ctx.lineTo(t[0],t[1])}};
  // the ink first (the outline of the membrane and of the rays), then the membrane over it: inside the membrane the rays lose their ink
  ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=INK;mem();ctx.lineWidth=(o.lw||1.4)*1.7;ctx.stroke();rays();ctx.lineWidth=rw+1.8;ctx.stroke();
  const lit=o.lit||0;mem();ctx.fillStyle=fv>=0?(lit>.5?T.l:T.b):cmix(T.b,T.d,lit>.5?.1:.4);ctx.fill();
  if(lit>0&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${K.memG},${.22*lit})`;ctx.fill();ctx.restore()}
  // two folds in every piece of membrane (not on the small fans)
  if(!o.small){ctx.strokeStyle=fv>=0?T.d:'rgba(20,8,30,.5)';ctx.lineWidth=.8;ctx.beginPath();for(let i=0;i<R.length-1;i++)for(const f of[.35,.68]){const q=lerp3(R[i].m,R[i+1].m,f),qq=P(lerp3(b,q,.9)),q0=P(lerp3(b,q,.3));ctx.moveTo(q0[0],q0[1]);ctx.lineTo(qq[0],qq[1])}ctx.stroke()}
  // the ivory rays with their bronze tips
  rays();ctx.strokeStyle=K.ivory.b;ctx.lineWidth=rw;ctx.stroke();ctx.fillStyle=K.tip;for(const t of Pt){ball(t,rw*.7);ctx.fill()}}
// a neck with its plates, its lozenges and the venom light; returns its outline pieces
function neckDraw(V0,S,K,wl,h,fx){const{P,F}=V0,N=S.length;if(N<2)return null;
  const RG=S.map(q=>{const r=[];for(let j=0;j<8;j++){const t=j/8*TAU;r.push(add(q.c,add(mul(q.f,Math.cos(t)*q.r),mul(q.v,Math.sin(t)*q.r))))}return r});
  const Hs=[];for(let i=0;i<N-1;i++){if(S[i].hide||S[i+1].hide)continue;const pts=below([RG[i],RG[i+1]],wl)?cutRows([RG[i],RG[i+1]],wl):RG[i].concat(RG[i+1]);if(pts.length<3)continue;const hh=chull(pts.map(q=>P(q)));if(hh.length>2)Hs.push(hh)}
  if(!Hs.length)return null;
  polys(Hs.map(hh=>grow(hh,1.3)));ctx.fillStyle=INK;ctx.fill();let all=[];for(const hh of Hs)all=all.concat(hh);polys(Hs);ctx.fillStyle=grad3(bbox(all),K.sc);ctx.fill();
  ctx.save();polys(Hs);ctx.clip();
  // the ivory strip of the plates where the belly faces us (above the water), with a thin line every 7 of length
  const ca=Math.cos(.66),sa=Math.sin(.66),edge=(q,sg)=>P(add(q.c,mul(add(mul(q.f,ca),mul(q.v,sg*sa)),q.r*1.02))),vis=S.map(q=>F(q.f)>-.05&&q.c[2]>wl-1&&!q.hide);
  const strip=(a,b,fill)=>{let run=[];const flush=()=>{if(run.length>1){ctx.beginPath();for(const q of run){const e=edge(q,1);ctx.lineTo(e[0],e[1])}for(let i=run.length-1;i>=0;i--){const e=edge(run[i],-1);ctx.lineTo(e[0],e[1])}ctx.closePath();ctx.fillStyle=fill;ctx.fill()}run=[]};
    for(let i=0;i<N;i++){const q=S[i];if(vis[i]&&q.s>=a-1e-6&&q.s<=b+1e-6)run.push(q);else flush()}flush()};
  strip(0,1,grad3(bbox(all),K.plate));
  {const Lt=N-1;ctx.strokeStyle=K.pline;ctx.lineWidth=.9;ctx.beginPath();for(let i=1;i<N-1;i++){if(!vis[i]||i%1)continue;const a=edge(S[i],1),b=edge(S[i],-1);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}if(Lt)ctx.stroke()}
  // the purple lozenges down its back
  ctx.beginPath();for(let i=1;i<N-1;i+=2){const q=S[i],n=mul(q.f,-1);if(F(n)<.12||q.c[2]<wl+1||q.hide)continue;const c=add(q.c,mul(n,q.r*.97)),a=P(add(c,mul(q.t,3.4))),b=P(add(c,mul(q.v,2.4))),cc=P(add(c,mul(q.t,-3.4))),d=P(add(c,mul(q.v,-2.4)));
    ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(cc[0],cc[1]);ctx.lineTo(d[0],d[1]);ctx.closePath()}ctx.fillStyle='rgba(43,31,66,.5)';ctx.fill();
  // the venom that climbs the strip: lime (violet in the second phase), brightest at its head
  if(h&&h.vl&&h.vl[1]>h.vl[0]+.01){const[a,b]=h.vl;strip(a,b,`rgba(${K.venG},${LOWFX?.85:.7})`);
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';strip(Math.max(a,b-.22),b,`rgba(${K.venG},.55)`);ctx.restore();
      let bi=0;for(let i=0;i<N;i++)if(S[i].s<=b)bi=i;if(vis[bi]){const q=edge(S[bi],0);shine(K.venG,q[0],q[1],16,.5)}}}
  if(h&&h.glowAll>0)ga(.5*h.glowAll,()=>{if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';strip(0,1,`rgba(${K.venG},.5)`);ctx.restore()}});
  // the shade: the dark side of the neck, a light line on the lit side
  const Q=S.map(q=>P(q.c));let dk=[],lt=[];for(let i=0;i<N;i++){const a=Q[Math.max(0,i-1)],b=Q[Math.min(N-1,i+1)];let nx=-(b[1]-a[1]),ny=b[0]-a[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;if(nx*-.55+ny*-.83<0){nx=-nx;ny=-ny}
    const r=S[i].r,up=S[i].c[2]>wl+r*.3&&!S[i].hide;dk.push([Q[i][0]-nx*r*.72,Q[i][1]-ny*r*.72,r]);lt.push(up?[Q[i][0]+nx*(r-1.8),Q[i][1]+ny*(r-1.8)]:null)}
  ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=`rgba(${rgbS(K.sc.d)},.42)`;ctx.lineWidth=S[0].r*.75;ctx.beginPath();for(const q of dk)ctx.lineTo(q[0],q[1]);ctx.stroke();
  ctx.restore();
  ctx.strokeStyle=`rgba(${K.rim},${rimA(K)})`;ctx.lineWidth=1.3;ctx.beginPath();let pen=false;for(const q of lt){if(!q){pen=false;continue}if(pen)ctx.lineTo(q[0],q[1]);else{ctx.moveTo(q[0],q[1]);pen=true}}ctx.stroke();
  // foam where it comes out of the water
  if(fx)for(let i=0;i<N-1;i++){const a=S[i].c,b=S[i+1].c;if(!S[i].hide&&(a[2]-wl)*(b[2]-wl)<0){const u=(wl-a[2])/(b[2]-a[2]),c=lerp3(a,b,u);foam(P([c[0],c[1],wl]),S[i].r*.8,K,.55)}}
  return Hs}
// the gold eye with its slit, the brow, the third eye on the forehead
function eyeG(q,rx,ry,K,h,ang){const sq=(h.blink==null?1:h.blink)*(1-.4*(h.squint||0)),sy=ry*Math.max(.12,sq);
  if(h.shut>.5){ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.lineCap='round';ctx.beginPath();ctx.ellipse(q[0],q[1]+ry*.2,rx,ry*.5,ang,.15,Math.PI-.15);ctx.stroke();return}
  ctx.beginPath();ctx.ellipse(q[0],q[1],rx,sy,ang,0,TAU);ctx.fillStyle=K.eye;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.25;ctx.stroke();
  if(sq>.25){ctx.fillStyle='#1b1612';ctx.beginPath();ctx.ellipse(q[0],q[1],Math.max(.45,rx*.2),sy*.76,ang,0,TAU);ctx.fill();ctx.fillStyle='#fff';ball([q[0]-rx*.3,q[1]-sy*.34],Math.max(.4,Math.min(rx,sy)*.26));ctx.fill()}}
function thirdEye(V0,c,n,hv,rx,ry,K,h){const{P,F}=V0,f=F(n);if(f<.08)return;const q=P(c),a=P(add(c,mul(hv,rx))),ang=Math.atan2(a[1]-q[1],a[0]-q[0]),fr=cl((f-.08)*3,0,1),RX=rx*Math.pow(f,.3),RY=ry*Math.pow(f,.7)*(1+.25*(h.wide||0));
  ctx.save();ctx.globalAlpha*=fr;
  if(!LOWFX&&(h.gem>.38||h.third>.5)){const gl=h.third>.5?K.tG:K.gemG;shine(gl,q[0],q[1],RX*3,.2+.45*cl(h.gem||0,0,1.5)+(h.third>.5?.2:0))}
  ctx.beginPath();ctx.ellipse(q[0],q[1],RX,RY,ang,0,TAU);
  if(h.third>.02){ctx.fillStyle=K.tw;ctx.fill();ctx.save();ctx.clip();const ir=RY*.95;ctx.fillStyle=K.ti;ball(q,ir);ctx.fill();ctx.strokeStyle=K.tr;ctx.lineWidth=1;ball(q,ir*.92);ctx.stroke();
    if(h.spiral>0){ctx.strokeStyle=`rgba(74,20,120,${.8*h.spiral})`;ctx.lineWidth=.9;for(const s0 of[0,Math.PI]){ctx.beginPath();for(let t=0;t<=1;t+=.1){const an=s0+(h.spA||0)+t*4.2,rr=ir*.95*t;ctx.lineTo(q[0]+Math.cos(an)*rr,q[1]+Math.sin(an)*rr)}ctx.stroke()}}
    ctx.fillStyle='#1b1612';ctx.beginPath();ctx.ellipse(q[0],q[1],Math.max(.4,RX*.14),RY*.78,ang,0,TAU);ctx.fill();ctx.fillStyle='#fff';ball([q[0]-RX*.25,q[1]-RY*.3],Math.max(.4,RY*.26));ctx.fill();
    // the lid slides away (what is left of the gem)
    if(h.third<1){ctx.fillStyle=K.gem;ctx.beginPath();ctx.ellipse(q[0],q[1]-RY*2*h.third,RX*1.05,RY*1.05,ang,0,TAU);ctx.fill()}
    ctx.restore()}
  else{ctx.fillStyle=softBall(q,RX,K.gem,.45,.2);ctx.fill();ctx.strokeStyle=K.gemLid;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(q[0]-Math.cos(ang)*RX*.8,q[1]-Math.sin(ang)*RX*.8);ctx.lineTo(q[0]+Math.cos(ang)*RX*.8,q[1]+Math.sin(ang)*RX*.8);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.85)';ball([q[0]-RX*.35,q[1]-RY*.4],Math.max(.4,RY*.3));ctx.fill()}
  ctx.beginPath();ctx.ellipse(q[0],q[1],RX,RY,ang,0,TAU);ctx.strokeStyle=K.gemRim;ctx.lineWidth=1.3;ctx.stroke();ctx.restore()}
// a head: the skull and the snout split at the mouth, the fan on its nape, the little fins behind the jaw, the throat sac, the gold eyes
// under heavy brows, the gem (the third eye), the nostrils, the mouth with the smirk and two little fangs, the forked tongue
function headDraw(V0,g,K,wl,fx,A){const{P,F}=V0,{hc,HF,k,h,n}=g,hu=HF.u,hv=HF.v,hw=HF.w,ja=h.open*.8;if(hc[2]+24*k<wl)return;
  const sq=h.sq||0,E=HE.map(e=>({c:mul(e.c,k),r:[e.r[0]*k*(1+.1*sq),e.r[1]*k*(1+.05*sq),e.r[2]*k*(1-.15*sq)]})),Hd=splitHead(hc,HF,E,-2.2*k,ja,2,10);
  const toW=d=>add(hc,add(add(mul(hu,d[0]),mul(hv,d[1])),mul(hw,d[2]))),toD=d=>nrm(add(add(mul(hu,d[0]),mul(hv,d[1])),mul(hw,d[2])));
  const skC=E[0].c,skR=E[0].r,onSk=m=>toW(ellAt(skC,skR,null,nrm(m))),nSk=m=>{const q=ellN(skR,null,nrm(m));return toD(q)};
  // the fan: on the nape, its rays in the plane across the head, leaning back (35° at rest, 15° open)
  const fanB=onSk([-.75,0,.66]),tilt=lerp(35,15,cl(h.ft,0,1))*DEG,fa=toD([-Math.sin(tilt),0,Math.cos(tilt)]),spread=.42+.58*cl(h.fan,0,1.2),fanFront=F(nSk([-.75,0,.66]))>.1;
  const fan=()=>fanDraw(V0,add(fanB,mul(fa,-1.5*k)),fa,hv,n.fa.map(d=>d*DEG*spread*(n.fa.length>3?1:1.15)),n.fl.map(l=>l*k*1.28*(.85+.15*cl(h.fan,0,1))),K,{cut:wl,rw:1.25*k,mk:.84,bend:n.fa.length>3?20*DEG:0,back:mul(hu,-1),lit:Math.max(A.memLit,h.wide||0)});
  // the little fins behind the jaw (open when it hisses)
  const wing=sd=>{const b=toW([-8*k,sd*7.5*k,-3.2*k]),op=cl(h.wing,0,1),a=toD([-.9+.5*op,sd*(.25+.75*op),.2]),side=toD([.15,0,1]);
    fanDraw(V0,b,nrm(a),nrm(side),[-30*DEG,0,30*DEG].map(x=>x*(.5+.5*op)),[6*k,7.5*k,6*k],K,{cut:wl,rw:1.1,lw:1.2,lit:A.memLit,small:1})};
  const wFar=F(hv)>0?-1:1,wOn=h.wing>.12;
  if(!fanFront)fan();
  if(wOn)wing(wFar);
  // the throat sac (ivory, it swells and lights up when the venom comes)
  if(h.sac>.02||h.throat>.02){const r=(4+4*cl(h.sac,0,1))*k,c=toW([-1*k,0,-6.5*k-r*.4]);if(c[2]>wl){const q=P(c);ctx.lineWidth=1.6;ctx.strokeStyle=INK;ball(q,r);ctx.fillStyle=softBall(q,r,K.plate.b,.3,.3);ctx.fill();ctx.stroke();
    if(h.sac>.3){ctx.save();ctx.globalAlpha*=sstep(.3,.8,h.sac);ball(q,r*.75);ctx.fillStyle=`rgba(${K.venG},.55)`;ctx.fill();ctx.restore();if(!LOWFX)shine(K.venG,q[0],q[1],r*2.4,.4*h.sac)}}}
  // the jaw, the inside of the mouth with the tongue, the light in the throat
  svc(V0,Hd.bowl,mixT(K.sc,K.plate,.18),wl,{lw:2});
  const mouthOpen=ja>.04&&F(Hd.wJ)>.02,mT=lerp3(Hd.lip(0,0),Hd.lip(0,1),.5);
  if(mouthOpen){const fl=Hd.floor.filter(q=>q[2]>wl).map(q=>P(q));if(fl.length>2){const gm=chull(fl);poly(gm);ctx.fillStyle=K.mouth;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
    ctx.save();poly(gm);ctx.clip();ctx.beginPath();discP(V0,Hd.jaw([3*k,0,Hd.hz+.3]),Hd.wJ,3.4*k,2.2*k,hu);ctx.fillStyle=K.tongue;ctx.fill();
    const th=h.throat||(h.vl&&h.vl[1]>.95?1:0)||(h.mist>0?1:0);if(th>0){const q=P(Hd.jaw([-6*k,0,Hd.hz+.6]));ctx.fillStyle=`rgba(${K.venG},${.8*th})`;ball(q,2.6*k);ctx.fill();if(!LOWFX)shine(K.venG,q[0],q[1],9*k,.5*th)}ctx.restore()}}
  const hp=svc(V0,Hd.dome,K.sc,wl,{lw:2.4});
  if(hp){rimK(hp,rimA(K),K.rim);
    if(mouthOpen&&F(mul(hw,-1))>.02){const pl=Hd.palate.filter(q=>q[2]>wl).map(q=>P(q));if(pl.length>2){poly(chull(pl));ctx.fillStyle=C.dk(K.mouth,.25);ctx.fill()}}
    ctx.save();ctx.clip(hp.path);
    // a soft light on the top of the head, the darker snout below
    const tq=P(onSk([.2,0,1]));ctx.fillStyle=wa(.14);ctx.beginPath();ctx.ellipse(tq[0],tq[1],5*k,3*k,0,0,TAU);ctx.fill();
    // the mouth: the rim of the cut, rising at the back into a smirk
    {let r=[];const run2=[];ctx.lineCap='round';for(let i=0;i<=9;i++){const t=-1.55+i/9*3.1,q0=Hd.lip(t,0),up=Math.max(0,Math.abs(t)-1)*(2.6+2*(h.smirk||0))*k,q=add(q0,mul(hw,up));
        if(F(Hd.lipN(t))>.02&&q[2]>wl)r.push(P(q));else if(r.length){run2.push(r);r=[]}}if(r.length)run2.push(r);ctx.strokeStyle=INK;ctx.lineWidth=1.4;for(const rr of run2)if(rr.length>1){line(rr);ctx.stroke()}}
    // the nostrils at the tip of the snout
    for(const sd of[-1,1]){const m=nrm([.95,sd*.22,.32]);if(F(toD(ellN(E[1].r,null,m)))<.1)continue;const q=P(toW(ellAt(E[1].c,E[1].r,null,m)));
      ctx.fillStyle='rgba(8,24,14,.75)';ctx.beginPath();ctx.ellipse(q[0],q[1],1.1*k,.6*k,0,0,TAU);ctx.fill()}
    ctx.restore();
    // the brows and the eyes (gold, a slit, the point of light), on the skull where the snout begins
    const sn=P(toW([20*k,0,-1*k])),EY=[];for(const sd of[-1,1]){const m=nrm([.55,sd*.6,.55]),nn=nSk(m),f=F(nn);if(f<.12)continue;const q=P(onSk(m)),rx=(n.s?3.6:4)*Math.pow(f,.45),ry=(n.s?3:3.3)*Math.pow(f,.7);EY.push({q,rx,ry,f,sd})}
    EY.sort((a,b)=>a.f-b.f);if(!LOWFX&&!h.shut&&EY.length){let x=0,y=0;for(const e of EY){x+=e.q[0];y+=e.q[1]}shine(K.eyeG,x/EY.length,y/EY.length,(EY.length>1?11:8)*k,.3)}
    for(const e of EY){const dir=sn[0]>=e.q[0]?1:-1,ang=Math.atan2(sn[1]-e.q[1],sn[0]-e.q[0])*.18*dir;eyeG(e.q,e.rx,e.ry,K,h,ang);
      if(!(h.shut>.5)){const sqz=h.squint||0,o0=[e.q[0]-dir*e.rx*1.15,e.q[1]-e.ry*1.25],o1=[e.q[0]+dir*e.rx*1.05,e.q[1]-e.ry*(.75-.45*sqz)],cc=[e.q[0],e.q[1]-e.ry*1.55];
        ctx.lineCap='round';ctx.strokeStyle=K.sc.d;ctx.lineWidth=2.6*k;ctx.beginPath();ctx.moveTo(o0[0],o0[1]);ctx.quadraticCurveTo(cc[0],cc[1],o1[0],o1[1]);ctx.stroke();
        ctx.strokeStyle=K.sc.l;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(o0[0],o0[1]-1);ctx.quadraticCurveTo(cc[0],cc[1]-1.1,o1[0],o1[1]-1);ctx.stroke()}}
    // the gem on the forehead, in front of the fan (an eye that opens in the second phase)
    {const m=nrm([.3,0,.95]);thirdEye(V0,add(onSk(m),mul(nSk(m),.3)),nSk(m),hv,(n.s?3.7:4.4)*k,(n.s?2.5:3)*k,K,h)}
    // two little fangs on the upper lip
    if(ja>.06||F(hu)>-.2)for(const sd of[-1,1]){const t=sd*.34;if(F(Hd.lipN(t))<.08)continue;const b=Hd.lip(t,0);if(b[2]<wl)continue;const q=P(b),e=P(add(b,mul(hw,-(2.2+1.8*cl(h.open/.6,0,1))*k)));
      ctx.fillStyle=K.fang;ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.lineJoin='round';const dx=e[0]-q[0],dy=e[1]-q[1],l=Math.hypot(dx,dy)||1,w=1.15*k;ctx.beginPath();ctx.moveTo(q[0]-dy/l*w,q[1]+dx/l*w);ctx.lineTo(e[0],e[1]);ctx.lineTo(q[0]+dy/l*w,q[1]-dx/l*w);ctx.closePath();ctx.fill();ctx.stroke()}}
  // the forked tongue that flicks out
  if(h.tongue>.03){const tl=(6+4*h.tongue)*k*h.tongue,b=add(mT,mul(hu,1*k)),e=add(b,add(mul(hu,tl),mul(hw,-1.2*k))),q0=P(b),q1=P(e);if(b[2]>wl){ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.6;seg(q0,q1);ctx.stroke();ctx.strokeStyle=K.tongue;ctx.lineWidth=1.3;seg(q0,q1);ctx.stroke();
    for(const sd of[-1,1]){const f2=P(add(e,add(mul(hu,2*k),mul(hv,sd*1.6*k))));ctx.strokeStyle=K.tongue;ctx.lineWidth=1.1;seg(q1,f2);ctx.stroke()}}}
  if(wOn)wing(-wFar);
  if(fanFront)fan();
  // the effects at the mouth: the venom ball leaving, the mist of the breath, a drip, the cough from the nostrils
  if(fx){const mq=P(add(mT,mul(hu,2*k)));
    if(h.glob>=0){const u=h.glob,m=add(mT,add(mul(hu,(3+u*18)*k),[0,0,10*u])),q=P(m),r=(3+u*4)*k;if(!LOWFX)shine(K.venG,q[0],q[1],r*3,.4);ctx.lineWidth=1.4;ctx.strokeStyle=INK;ball(q,r);ctx.fillStyle=softBall(q,r,K.ven,.45,.25);ctx.fill();ctx.stroke()}
    if(h.mist>0&&!LOWFX)for(let j=0;j<5;j++){const u=((A.t||0)*3+j/5)%1,m=add(mT,add(mul(hu,(4+u*22)*k),[0,0,u*4])),q=P(m);ctx.fillStyle=`rgba(${K.venG},${.4*(1-u)*h.mist})`;ball(q,(2.5+u*8)*k);ctx.fill()}
    if(h.drip>=0&&h.drip<1){const m=add(mT,mul(hw,-2*k)),z=lerp(m[2],wl,h.drip*h.drip),q=P([m[0],m[1],z]);ctx.fillStyle=K.ven;ctx.strokeStyle=INK;ctx.lineWidth=.8;ball(q,1.4*k);ctx.fill();ctx.stroke()}
    if(h.cough>0&&!LOWFX)for(const sd of[-1,1]){const m=toW([22*k,sd*2*k,1*k]),q=P(add(m,mul(hu,4*k*h.cough)));ctx.fillStyle=`rgba(${K.venG},${.45*h.cough})`;ball(q,3*k*(1+h.cough));ctx.fill()}}
  if(h.stars>0){const q=P(add(hc,mul(hw,16*k)));for(let i=0;i<3;i++){const an=(A.t||0)*5+i*TAU/3;starS(q[0]+Math.cos(an)*10*k,q[1]+Math.sin(an)*3.4*k,2.6,h.stars)}}}
// the hump, cut at the water: smooth scales, two rows of lozenges (its cloak), the ivory gorget, the five fins round its back
function moundDraw(V0,X,A,K,wl,fx){const{P,F}=V0,br=1+(A.br||0),Rd=[HB.r[0]*br,HB.r[1]*br,HB.r[2]*(1+(A.br||0)*1.3)];
  const fin=near=>{for(let i=0;i<FINS.length;i++){const[az,hg]=FINS[i],el=.8,m=[Math.cos(az)*Math.cos(el),Math.sin(az)*Math.cos(el),Math.sin(el)],nm=X.Rd(ellN(Rd,null,m));if((F(nm)>0)!==near)continue;
    const b=X.T(add(ellAt(HB.c,Rd,null,m),[0,0,-1.5]));if(b[2]<wl-4)continue;const wv=A.finW*.28*Math.sin((A.t||0)*TAU/1.6*1-i*1.1)+(A.fin||0),out=X.Rd([Math.cos(az),Math.sin(az),0]);
    const a=nrm(add(add(mul(nm,.45),X.Rd([0,0,.9])),mul(out,.42+wv))),sd=X.Rd([-Math.sin(az),Math.cos(az),0]),H0=hg*(.45+.55*A.finUp);
    fanDraw(V0,b,a,sd,[-28*DEG,0,28*DEG],[H0*.78,H0,H0*.78],K,{cut:wl,rw:1.7,lit:A.memLit})}};
  fin(false);
  const rows=ellRows(HB.c,Rd,AXES,6,18,-.8,Math.PI/2).map(r=>r.map(X.T)),H=svc(V0,rows,K.sc,wl,{lw:2.8});if(!H)return;
  ctx.save();ctx.clip(H.path);
  // the cloak: two rows of big lozenges
  ctx.beginPath();for(const[el,nn,r] of[[.25,12,6],[.6,8,5]])for(let j=0;j<nn;j++){const az=j/nn*TAU+el*2,m=[Math.cos(az)*Math.cos(el),Math.sin(az)*Math.cos(el),Math.sin(el)],c=X.T(ellAt(HB.c,Rd,null,m)),nm=X.Rd(ellN(Rd,null,m));
    if(F(nm)<.22||c[2]<wl+1)continue;const e1=nrm(cross(nm,[0,0,1])),e2=nrm(cross(e1,nm)),a=P(add(c,mul(e1,r))),b=P(add(c,mul(e2,r*.8))),cc=P(add(c,mul(e1,-r))),d=P(add(c,mul(e2,-r*.8)));
    ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(cc[0],cc[1]);ctx.lineTo(d[0],d[1]);ctx.closePath()}ctx.fillStyle=K.loz;ctx.fill();
  // the gorget: a light collar of ivory plates on its front, under the roots of the necks (three rows, staggered seams)
  {const S0=(az,z)=>{const zz=cl(z/Rd[2],-.99,.99),rr=Math.sqrt(1-zz*zz),m=[Math.cos(az)*rr,Math.sin(az)*rr,zz];return{c:X.T(ellAt(HB.c,Rd,null,m)),n:X.Rd(ellN(Rd,null,m))}};
    const AZ=.5,Z0=1,Z1=18,edge=[];for(let j=0;j<=8;j++)edge.push(S0(-AZ+2*AZ*j/8,Z1+2*Math.cos((j/8-.5)*Math.PI)));for(let j=8;j>=0;j--)edge.push(S0(-AZ+2*AZ*j/8,Z0));
    if(F(S0(0,11).n)>.05){const pe=edge.map(q=>P(q.c));ctx.beginPath();pe.forEach(q=>ctx.lineTo(q[0],q[1]));ctx.closePath();ctx.fillStyle=grad3(bbox(pe),mixT(K.plate,K.sc,.12));ctx.fill();
      ctx.strokeStyle=K.pline;ctx.lineWidth=1.1;ctx.beginPath();for(const z of[6.5,12]){for(let j=0;j<=10;j++){const q=P(S0(-AZ+2*AZ*j/10,z).c);j?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}}
      [[Z0,6.5,5],[6.5,12,4],[12,Z1,3]].forEach(([za,zb,nn],r)=>{for(let j=1;j<nn;j++){const az=-AZ+2*AZ*j/nn,a=P(S0(az,za+.4).c),b=P(S0(az,zb-.4).c);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}});ctx.stroke();
      ctx.strokeStyle=K.plate.d;ctx.lineWidth=1.3;ctx.beginPath();pe.forEach(q=>ctx.lineTo(q[0],q[1]));ctx.closePath();ctx.stroke()}}
  // deep shadow at the water line
  const bb=bbox(H),g=ctx.createLinearGradient(0,bb[1],0,bb[3]);g.addColorStop(0,'rgba(10,20,14,0)');g.addColorStop(.62,'rgba(10,20,14,0)');g.addColorStop(1,'rgba(6,14,10,.55)');ctx.fillStyle=g;ctx.fillRect(bb[0]-2,bb[1],bb[2]-bb[0]+4,bb[3]-bb[1]+2);
  ctx.restore();rimK(H,rimA(K)*1.1,K.rim);
  fin(true);
  // the foam along the water line, the part toward us
  if(fx){const zz=(wl-(HB.c[2]+A.B[2]))/Rd[2];if(Math.abs(zz)<.95){const rr=Math.sqrt(1-zz*zz),run2=[];let r=[];for(let j=0;j<=24;j++){const t=j/24*TAU,m=[Math.cos(t)*rr,Math.sin(t)*rr,zz],nm=X.Rd(ellN(Rd,null,m));
      if(F(nm)>.05){const c=X.T(ellAt(HB.c,Rd,null,m));r.push(P([c[0],c[1],wl]))}else if(r.length){run2.push(r);r=[]}}if(r.length)run2.push(r);
    ctx.strokeStyle=`rgba(${rgbS(K.foam)},.55)`;ctx.lineWidth=1.8;ctx.lineCap='round';for(const q of run2)if(q.length>1){line(q.map((s,j)=>[s[0],s[1]+.8*Math.sin(j*1.7+(A.t||0)*4)]));ctx.stroke()}}}}
// an arm: the shoulder under the water, the elbow at the water line, the webbed hand on the rim with three fingers and ivory claws
function armDraw(V0,X,A,i,K,wl,fx){const{P,F}=V0,sd=i?1:-1,hd=A.hands[i],S=X.T(SHO[i]),W=hd.p,pole=X.Rd([.25,sd,.9]),[E,Wr]=ik(S,W,26,26,pole);
  const T=K.sc,limb=(a,ra,b,rb)=>{if(a[2]<wl&&b[2]<wl)return;let c=a;if(a[2]<wl){c=lerp3(a,b,(wl-a[2])/(b[2]-a[2]))}else if(b[2]<wl){b=lerp3(a,b,(wl-a[2])/(b[2]-a[2]))}
    const qa=P(c),qb=P(b);C.caps(V0,c,ra,b,rb,T.b,{fill:limbGrad(qa,qb,Math.max(ra,rb),T),lw:2.4,rim:.2});if(fx&&c!==a)foam(P([c[0],c[1],wl]),ra,K)};
  limb(S,9,E,8.2);limb(E,8.2,Wr,7);if(Wr[2]<wl-4)return;
  // the hand
  const fw=nrm([Wr[0]-E[0],Wr[1]-E[1],0]),sw=[-fw[1],fw[0],0],pc=add(Wr,add(mul(fw,3.5),[0,0,1.5+(hd.palm||0)*2])),up=hd.palm>.3;
  const fing=[-1,0,1].map(j=>{const an=j*.55,d=nrm(add(mul(fw,Math.cos(an)),mul(sw,Math.sin(an)))),b=add(pc,mul(d,4.5)),lift=(hd.tap?hd.tap[j+1]:0)+(hd.curl||0)*3*(j===0?1:.4),
    m=add(b,add(mul(d,4),[0,0,.5+lift])),t=add(m,add(mul(d,2.2),[0,0,-2.6+lift*.6-(hd.curl||0)*2]));return{b,m,t,d}});
  // the webbing between the fingers
  ctx.beginPath();for(let j=0;j<2;j++){const a=fing[j],b=fing[j+1],q=[P(a.b),P(lerp3(a.b,a.m,.85)),P(lerp3(b.b,b.m,.85)),P(b.b)];ctx.moveTo(q[0][0],q[0][1]);for(const s of q.slice(1))ctx.lineTo(s[0],s[1]);ctx.closePath()}
  ctx.fillStyle=K.mem.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();
  // the palm: green on top (ivory under when it lifts), then the fingers and the claws
  const q=P(pc);ctx.lineWidth=2.2;ctx.strokeStyle=INK;ctx.beginPath();ctx.ellipse(q[0],q[1],7.6,5.6,0,0,TAU);ctx.fillStyle=softBall(q,7.6,up?K.plate.b:T.b,.3,.3);ctx.fill();ctx.stroke();
  ctx.lineCap='round';ctx.lineJoin='round';const FP=fing.map(f=>[P(f.b),P(f.m),P(f.t)]);ctx.strokeStyle=INK;ctx.lineWidth=7.4;ctx.beginPath();for(const q3 of FP){ctx.moveTo(q3[0][0],q3[0][1]);ctx.lineTo(q3[1][0],q3[1][1]);ctx.lineTo(q3[2][0],q3[2][1])}ctx.stroke();
  ctx.strokeStyle=T.b;ctx.lineWidth=4.6;ctx.stroke();ctx.strokeStyle=T.l;ctx.lineWidth=1.2;ctx.beginPath();for(const q3 of FP){ctx.moveTo(q3[0][0]-1,q3[0][1]-1.2);ctx.lineTo(q3[1][0]-1,q3[1][1]-1.2)}ctx.stroke();
  for(const f of fing){const tq=P(f.t),cq=P(add(f.t,add(mul(f.d,1.6),[0,0,-2.4])));ctx.fillStyle=K.ivory.b;ctx.strokeStyle=INK;ctx.lineWidth=1;
    const dx=cq[0]-tq[0],dy=cq[1]-tq[1],l=Math.hypot(dx,dy)||1,w=1.45;ctx.beginPath();ctx.moveTo(tq[0]-dy/l*w,tq[1]+dx/l*w);ctx.quadraticCurveTo(cq[0]+dx*.2,cq[1]+dy*.2,tq[0]+dy/l*w,tq[1]-dx/l*w);ctx.closePath();ctx.fill();ctx.stroke()}}
// the tip of the tail behind, curling up out of the water with a small fan
function tailDraw(V0,X,A,K,wl,fx){const{P}=V0,cu=A.tail||0,b=X.T([-62,16,-3]),m=X.T([-68,21+4*cu,6]),t=X.T([-72+3*cu,24+8*cu,14-2*Math.abs(cu)]);if(t[2]<wl)return;
  let c=b;if(b[2]<wl)c=lerp3(b,m,(wl-b[2])/(m[2]-b[2]));C.chain(V0,[c,m,t],[6,4.6,3.2],K.sc.b,{lw:2.2,rim:.18});if(fx)foam(P([c[0],c[1],wl]),5,K);
  const d=nrm(sub(t,m));fanDraw(V0,t,nrm(add(d,[0,0,.4])),nrm(cross(d,[0,0,1])),[-50,-25,0,25,50].map(x=>x*DEG),[5,6,7,6,5],K,{cut:wl,rw:1.1,lw:1.2,lit:A.memLit,small:1})}
// the water: its own pool (also its shadow), lighter at the back and dark in front, the rings of its breath, the reflections of the eyes
function waterDraw(V0,A,K,G,fx,o){const{P}=V0,wl=A.wz,c=P([0,0,wl]),rx=A.wr,ry=A.wr*.55*KR();
  ctx.fillStyle='rgba(8,14,12,.5)';ctx.beginPath();ctx.ellipse(c[0],c[1]+2,rx+4,ry+3,0,0,TAU);ctx.fill();
  const g=ctx.createRadialGradient(c[0],c[1]-ry*.3,2,c[0],c[1],rx);g.addColorStop(0,K.w0);g.addColorStop(.62,K.w1);g.addColorStop(1,K.w2);
  ctx.beginPath();ctx.ellipse(c[0],c[1],rx,ry,0,0,TAU);ctx.fillStyle=g;ctx.fill();
  {const g2=ctx.createLinearGradient(0,c[1]-ry,0,c[1]+ry);g2.addColorStop(0,'rgba(255,255,255,.05)');g2.addColorStop(.55,'rgba(0,0,0,0)');g2.addColorStop(1,'rgba(0,0,0,.28)');ctx.fillStyle=g2;ctx.fill()}
  if(A.dark>0){ctx.fillStyle=`rgba(2,4,4,${.6*A.dark})`;ctx.fill()}
  ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
  ctx.save();ctx.beginPath();ctx.ellipse(c[0],c[1],rx,ry,0,0,TAU);ctx.clip();
  ctx.strokeStyle=`rgba(${rgbS(K.w2)},.9)`;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(c[0],c[1]-1,rx*.93,ry*.88,0,Math.PI*1.08,Math.PI*1.92);ctx.stroke();
  // the rings of its breath, the drops, the swirl, the wake
  for(const r of A.rings){const R=r.r0+(rx+4-r.r0)*r.t;ctx.strokeStyle=`rgba(${rgbS(K.foam)},${.32*(1-r.t)})`;ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(c[0],c[1],R,R*.55*KR(),0,0,TAU);ctx.stroke()}
  if(A.swirl>0)for(let i=0;i<4;i++){const a0=(A.t||0)*1.4+i*Math.PI/2,R=rx*(.35+.13*i);ctx.strokeStyle=`rgba(${rgbS(K.foam)},${.28*A.swirl})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(c[0],c[1],R,R*.55*KR(),0,a0,a0+1.6);ctx.stroke()}
  if(A.wake>0){ctx.strokeStyle=`rgba(${rgbS(K.foam)},.3)`;ctx.lineWidth=1.4;for(const sd of[-1,1]){const a=P([62,0,wl]),b=P([30,sd*44,wl]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}}
  if(A.wglow>0&&!LOWFX){ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${K.wG},${.3*Math.min(1,A.wglow)})`;ctx.fillRect(c[0]-rx,c[1]-ry,rx*2,ry*2);ctx.globalCompositeOperation='source-over'}
  else if(A.wglow>0){ctx.fillStyle=`rgba(${K.wG},${.2*Math.min(1,A.wglow)})`;ctx.fillRect(c[0]-rx,c[1]-ry,rx*2,ry*2)}
  // the bubbles when it boils
  if(A.boil>0&&fx)for(let i=0;i<9;i++){const t=((A.t||0)*1.7+i*.37)%1,a=i*2.4,rr=rx*(.2+.65*((i*.618)%1)),q=[c[0]+Math.cos(a)*rr,c[1]+Math.sin(a)*rr*.55];ctx.strokeStyle=`rgba(${rgbS(K.bub)},${.6*A.boil*(1-t)})`;ctx.lineWidth=1;ball(q,1+t*3.5);ctx.stroke()}
  // the eyes and the gems under the water (the entrance, the Agguato)
  for(const gg of G){const hp=P([gg.hc[0],gg.hc[1],wl]);
    if(A.eyesU>0){for(const sd of[-1,1]){const q=[hp[0]+sd*4.5*gg.k,hp[1]-2];if(!LOWFX)shine(K.eyeG,q[0],q[1],9,.55*A.eyesU);ctx.fillStyle=`rgba(255,201,58,${.85*A.eyesU})`;ctx.beginPath();ctx.ellipse(q[0],q[1],2.6*gg.k,1.2*gg.k,0,0,TAU);ctx.fill();
      ctx.fillStyle=`rgba(20,16,10,${.8*A.eyesU})`;ctx.fillRect(q[0]-.4,q[1]-1.1,.8,2.2)}}
    if(A.gemsU>0){const q=[hp[0],hp[1]-7*gg.k];if(!LOWFX)shine(K.gemG,q[0],q[1],10,.5*A.gemsU);ctx.fillStyle=`rgba(168,240,96,${.8*A.gemsU})`;ctx.beginPath();ctx.ellipse(q[0],q[1],2.4,1.4,0,0,TAU);ctx.fill()}
    // the reflections of the eyes (gold) and of the gem (lime) on the water under every head that is up
    else if(!LOWFX&&gg.hc[2]>wl+10)shine(K.eyeG,hp[0],hp[1],13*gg.k,.12)}
  if(A.tips>0){const q=P([28,0,wl]);ctx.fillStyle=`rgba(176,106,216,${.45*A.tips})`;for(const dx of[-6,0,6]){ctx.beginPath();ctx.ellipse(q[0]+dx,q[1]-1,1.6,1,0,0,TAU);ctx.fill()}}
  ctx.restore()}
// the effects that sit over everything: splashes, chips of stone, bubbles, the wave, the fireflies of the defeat
function fxDraw(V0,A,K,G,wl){const{P}=V0;
  for(const f of A.fx){const t=cl(f.t,0,1);let at=f.at;if(f.head!=null){const gg=G[f.head];at=[gg.hc[0],gg.hc[1],0]}if(!at)continue;const base=[at[0],at[1],wl];
    if(f.k==='splash'){const q=P(base),r=f.r||12,n=f.n||6;ctx.strokeStyle=`rgba(${rgbS(K.foam)},${.6*(1-t)})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(q[0],q[1],r*(.4+t),r*(.4+t)*.55,0,0,TAU);ctx.stroke();
      if(!LOWFX)for(let i=0;i<n;i++){const a=i/n*TAU+.3,d=r*.5*t+2,z=Math.sin(t*Math.PI)*(14+r*.5)*(.7+.3*((i*.37)%1)),s=P([base[0]+Math.cos(a)*d,base[1]+Math.sin(a)*d,wl+z]);ctx.fillStyle=`rgba(${rgbS(K.foam)},${.8*(1-t*t)})`;ball(s,1.5+(1-t));ctx.fill()}}
    else if(f.k==='ring'){const q=P(base);ctx.strokeStyle=`rgba(${K.venG},${.6*(1-t)})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(q[0],q[1],3+8*t,(3+8*t)*.55,0,0,TAU);ctx.stroke()}
    else if(f.k==='chips'){const q=P([at[0],at[1],0]),n=f.big?9:6;C3K.dust(V0,[at[0],at[1],0],t,LOWFX?3:6,f.big?14:10,'196,184,160',.5);
      ctx.fillStyle='#8a8478';ctx.strokeStyle=INK;ctx.lineWidth=.8;for(let i=0;i<n;i++){const a=i/n*TAU+.7,d=(f.big?22:16)*t,z=Math.sin(Math.min(1,t*1.3)*Math.PI)*(f.big?18:12),s=P([at[0]+Math.cos(a)*d,at[1]+Math.sin(a)*d,z]);ctx.beginPath();ctx.rect(s[0]-1.3,s[1]-1.3,2.6,2.6);ctx.fill();ctx.stroke()}}
    else if(f.k==='bubble'){const q=P([at[0],at[1],wl+t*6]);ctx.strokeStyle=`rgba(${rgbS(K.bub)},${.8*(1-t)})`;ctx.lineWidth=1.2;ball(q,2+t*3);ctx.stroke()}
    else if(f.k==='wave'){const q=P([0,0,wl]),R=60+30*t;ctx.strokeStyle=`rgba(${rgbS(K.foam)},${.5*(1-t)})`;ctx.lineWidth=2.4*(1-t)+.6;ctx.beginPath();ctx.ellipse(q[0],q[1],R,R*.55,0,0,TAU);ctx.stroke()}}
  if(A.flies>=0){const n=LOWFX?3:7;for(let i=0;i<n;i++){const u=cl(A.flies*1.25-i*.04,0,1);if(u<=0)continue;const a=i*2.4,r=20+(i*13)%40,q=P([Math.cos(a)*r,Math.sin(a)*r,wl+u*70+6*Math.sin(u*9+i)]),al=Math.sin(u*Math.PI);
    if(!LOWFX)shine('200,255,150',q[0],q[1],8,.6*al);ctx.fillStyle=`rgba(230,255,190,${al})`;ball(q,1.5);ctx.fill()}}}

// ------------------------------------------------------------------ the model
function hydra2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,A=hPose(anim,p,o,face),K=pal(A.k2,A.clr),X=frame(A,0),fx=fxOn(o),wl=A.wz;
  A.t=p*(N3.meta.hydra2.dur[anim]||1);const G=rigOf(A,X,face,o);G.forEach(g=>{g.h.glowAll=A.glowAll});
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  L.add(-1e9,()=>waterDraw(V0,A,K,G,fx,o));
  L.add(D(X.T([-66,20,4])),()=>tailDraw(V0,X,A,K,wl,fx));
  for(const i of[0,1])L.add(D(X.T(HAND[i])),()=>armDraw(V0,X,A,i,K,wl,fx));
  L.add(D(X.T([-8,0,14])),()=>moundDraw(V0,X,A,K,wl,fx));
  const nf=F(X.Rd([1,0,0]))>-.2;
  G.forEach(g=>L.add(D(X.T(g.n.root))+.01*D(X.T(g.n.head)),()=>{const S=spineOf(g,X,wl);if(nf)neckDraw(V0,S,K,wl,g.h,fx);headDraw(V0,g,K,wl,fx,A);if(!nf)neckDraw(V0,S,K,wl,g.h,fx)}));
  run(L);fxDraw(V0,A,K,G,wl);
  if(A.flashW>0&&!LOWFX){const q=P([10,0,50]);shine('255,255,250',q[0],q[1],90,.5*A.flashW)}
  if(A.flashV>0&&!LOWFX)for(const g of G){const q=P(add(g.hc,mul(g.HF.w,8*g.k)));shine('199,125,255',q[0],q[1],40,.8*A.flashV)}
  if(A.fanRings>=0&&!LOWFX)for(const g of G){const q=P(add(g.hc,add(mul(g.HF.u,-12*g.k),mul(g.HF.w,12*g.k)))),r=6+30*A.fanRings;ctx.strokeStyle=`rgba(199,125,255,${.55*(1-A.fanRings)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(q[0],q[1],r,r*.7,0,0,TAU);ctx.stroke()}
  ctx.restore()}
const MV=['idle','walk','hit','bite','stuck','spit','breath','ambush','decree','dive','rise','gaze','rage','taunt','enter','die'];
const DUR={idle:3.2,walk:1.6,hit:.7,bite:2,stuck:1,spit:1.4,breath:2.4,ambush:2.8,decree:2.2,dive:1.2,rise:1,gaze:2,rage:2.8,taunt:1.1,enter:4.2,die:4};
const LAB={idle:'Ferma',walk:'Nuota',hit:'Colpita',bite:'Morso a Tenaglia',stuck:'Zanne piantate',spit:'Salva di Veleno',breath:'Soffio Velenoso',ambush:'Agguato dal Profondo',
  decree:'Il Giudizio della Palude',dive:'Si tuffa',rise:'Riemerge',gaze:'Sguardo del Terzo Occhio',rage:'Apre il terzo occhio',taunt:'Presa in giro',enter:'Entrata',die:'Sconfitta'};
reg('hydra2',{n:'Idra della Palude',g:'boss',sc:1,p2:true,an:MV,dur:DUR,lab:LAB},hydra2);
// «prima e dopo»: the drawing of today
if(N3.hydra){const old=N3.hydra,oM=N3.meta.hydra;N3.meta.hydra2.old=(x,y,f,a,p)=>old(x,y,f,oM.an.includes(a)?a:'idle',p,oM.sc||1,{})}

// ------------------------------------------------------------------ drawings for the game, with the same look
// where the mouths are: for the heads s -1, 0, +1 {m mouth, f the floor under it, e between the eyes, g the third eye, up}, screen px from the
// drawing point at sc 1 (the same pose as the drawing, nothing drawn)
N3.hydra2Mouths=function(face,anim,p,o){o=o||{};const V0=V(face),A=hPose(anim,p,o,face),X=frame(A,0),G=rigOf(A,X,face,o),wl=A.wz;
  return G.map(g=>{const{hc,HF,k,h}=g,E=HE.map(e=>({c:mul(e.c,k),r:mul(e.r,k)})),Hd=splitHead(hc,HF,E,-2.2*k,h.open*.8,1,6),m=add(lerp3(Hd.lip(0,0),Hd.lip(0,1),.5),mul(HF.u,2*k)),
    toW=d=>add(hc,add(add(mul(HF.u,d[0]),mul(HF.v,d[1])),mul(HF.w,d[2]))),e=toW([4*k,0,5*k]),gg=toW([-1*k,0,9*k]);
    return{m:V0.P(m),f:V0.P([m[0],m[1],0]),e:V0.P(e),g:V0.P(gg),up:hc[2]>wl-4,z:m[2]}})};
// a head that bursts out of a stain of black water ('burst', 1.6 s): the stain opens, two eyes under it, the head shoots up with its mouth
// wide, the jaws snap (.60), it sways and looks at you, then it sinks back with a gulp. o.who (-1, 0, 1), o.p2; o.part 'stain' (only the
// water on the floor, under the hero) or 'head' (only what comes out of it, over him)
N3.hydra2Head=function(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P}=V0,K=pal(o.p2?1:0,0),who=o.who==null?0:o.who,n=HN[who+1],k=n.k,fx=fxOn(o);
  const rS=24*sstep(0,.2,p)*(1-sstep(.9,1,p)),out=sstep(.55,.6,p)*(1-sstep(.875,.96,p)),snap=sstep(.59,.61,p),sway=rise(p,.6,.66,.84,.875);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  if(rS>.5&&o.part!=='head'){const g=ctx.createRadialGradient(0,-rS*.15,1,0,0,rS);g.addColorStop(0,'#05090a');g.addColorStop(.75,K.w0);g.addColorStop(1,K.w2);ctx.beginPath();ctx.ellipse(0,0,rS,rS*.55,0,0,TAU);ctx.fillStyle=g;ctx.fill();
    ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke();ctx.strokeStyle=`rgba(${rgbS(K.foam)},.5)`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,-.6,rS*.9,rS*.48,0,Math.PI*1.1,Math.PI*1.9);ctx.stroke();
    if(out<.2){const eo=sstep(.06,.1,p)*(1-sstep(.55,.57,p))*blink(p,.12,.05);for(const sd of[-1,1]){const q=[sd*4.5*k,-2];if(!LOWFX)shine(K.eyeG,q[0],q[1],8,.5*eo);ctx.fillStyle=`rgba(255,201,58,${.9*eo})`;ctx.beginPath();ctx.ellipse(q[0],q[1],2.5*k,1.2*k,0,0,TAU);ctx.fill()}}
    if(fx)for(let i=0;i<5;i++){const t=(p*4+i*.29)%1,a=i*2.3,q=[Math.cos(a)*rS*.55,Math.sin(a)*rS*.3];ctx.strokeStyle=`rgba(${rgbS(K.bub)},${.6*(1-t)*sstep(.15,.3,p)})`;ctx.lineWidth=1;ball(q,.8+t*2.4);ctx.stroke()}}
  if(out>.01&&o.part!=='stain'){const z=lerp(-30,40,out),hc=[6*sway*Math.sin(p*TAU*3)*0,4*sway*Math.sin(p*TAU*2.5),z+8],pi=lerp(.9,-.25,snap)+.1*sway*Math.sin(p*TAU*3),yw=.25*sway*Math.sin(p*TAU*2);
    const hu=[Math.cos(pi)*Math.cos(yw),Math.cos(pi)*Math.sin(yw),Math.sin(pi)],hv=nrm(cross([0,0,1],hu)),hw=cross(hu,hv),h=Object.assign(hd0(n,!!o.p2),{open:p<.6?.95:.15+.35*rise(p,.66,.7,.76,.8),fan:1,ft:1,wing:p<.6?1:rise(p,.66,.7,.76,.8),gem:.5,drip:sway>0?((p-.6)/.2)%1:-1});
    const g={i:0,s:n.s,k,hc,HF:{u:hu,v:hv,w:hw},root:[0,0,-14],h,n},X=frame({},0);
    ctx.save();ctx.beginPath();ctx.rect(-60,-200,120,200+.5);ctx.clip();
    const S=spineOf(g,X,0);neckDraw(V0,S,K,0,h,fx);headDraw(V0,g,K,0,fx,{memLit:o.p2?1:0,t:p*1.6});ctx.restore();
    if(fx&&p>=.55&&p<.75){const t=(p-.55)/.2;ctx.fillStyle=`rgba(${rgbS(K.foam)},${.5*(1-t)})`;for(let i=0;i<8;i++){const a=i/8*TAU,q=P([Math.cos(a)*(6+10*t),Math.sin(a)*(6+10*t),Math.sin(t*Math.PI)*30*(.6+.4*(i%2))]);ball(q,1.8);ctx.fill()}}}
  ctx.restore()};
// under the floor in the Tuffo: a dark ripple with the three gems lit in a triangle, the six gold eyes barely seen, a V wake back along a
N3.hydra2Under=function(x,y,a,p,sc,o){sc=sc||1;o=o||{};const K=pal(o.p2?1:0,0),ca=Math.cos(a),sa=Math.sin(a);ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  const w=1+.08*Math.sin(p*TAU);ctx.fillStyle='rgba(6,12,10,.55)';ctx.beginPath();ctx.ellipse(0,0,30*w,14*w,0,0,TAU);ctx.fill();ctx.strokeStyle=`rgba(${rgbS(K.foam)},.35)`;ctx.lineWidth=1.3;ctx.stroke();
  ctx.strokeStyle=`rgba(${rgbS(K.foam)},.3)`;ctx.lineWidth=1.4;for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(-ca*24-sa*sd*4,-sa*24*.55+ca*sd*4*.55);ctx.lineTo(-ca*60-sa*sd*20,(-sa*60+ca*sd*20)*.55);ctx.stroke()}
  for(const[gx,gy] of[[0,-6],[-9,3],[9,3]]){if(!LOWFX)shine(K.gemG,gx,gy,8,.5);ctx.fillStyle=K.gem;ctx.beginPath();ctx.ellipse(gx,gy,2,1.2,0,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(255,201,58,.45)';for(const sd of[-1,1]){ctx.beginPath();ctx.ellipse(gx+sd*3,gy+2.4,1.4,.7,0,0,TAU);ctx.fill()}}
  if(!LOWFX)for(let i=0;i<4;i++){const t=(p+i*.25)%1,q=[Math.cos(i*1.7)*16-ca*t*20,Math.sin(i*1.7)*7-sa*t*11];ctx.strokeStyle=`rgba(${rgbS(K.bub)},${.6*(1-t)})`;ctx.lineWidth=1;ball(q,1+t*2);ctx.stroke()}
  ctx.restore()};
// the black water that opens on the floor where it comes up: k 0..1, the radius up to o.r (74), a light rim, the three gems lighting up
N3.hydra2Stain=function(x,y,k,sc,o){sc=sc||1;o=o||{};const K=pal(o.p2?1:0,0),R=(o.r||74)*ez(cl(k,0,1));if(R<1)return;ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  const g=ctx.createRadialGradient(0,-R*.15,1,0,0,R);g.addColorStop(0,'#04080a');g.addColorStop(.7,K.w0);g.addColorStop(1,K.w2);ctx.beginPath();ctx.ellipse(0,0,R,R*.55,0,0,TAU);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle=`rgba(${rgbS(K.foam)},.45)`;ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(0,-1,R*.92,R*.5,0,Math.PI*1.08,Math.PI*1.92);ctx.stroke();
  const gk=sstep(.3,.8,k);for(const[gx,gy] of[[0,-10],[-16,6],[16,6]]){if(!LOWFX)shine(K.gemG,gx*R/74,gy*R/74,10,.6*gk);ctx.fillStyle=`rgba(168,240,96,${gk})`;ctx.beginPath();ctx.ellipse(gx*R/74,gy*R/74,2.6,1.5,0,0,TAU);ctx.fill()}
  if(!LOWFX){const t0=(o.t!=null?o.t:(typeof G!=='undefined'&&G&&G.t)||0);for(let i=0;i<6;i++){const t=(t0*1.8+i*.31)%1,a=i*2.2,q=[Math.cos(a)*R*.6,Math.sin(a)*R*.3];ctx.strokeStyle=`rgba(${rgbS(K.bub)},${.55*(1-t)*k})`;ctx.lineWidth=1;ball(q,1+t*3);ctx.stroke()}}
  ctx.restore()};
// the venom ball in flight (r 7): three tones, lime or violet, a point of light, two drops trailing behind (o.vx, o.vy)
N3.hydra2Glob=function(x,y,z,r,sc,o){sc=sc||1;o=o||{};const K=pal(o.p2?1:0,0);r=r||7;ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  if(z>2){ctx.fillStyle=`rgba(0,0,0,${.25*cl(1-z/160,.3,1)})`;ctx.beginPath();ctx.ellipse(0,0,r*.9,r*.45,0,0,TAU);ctx.fill()}
  const q=[0,-z],vl=Math.hypot(o.vx||0,o.vy||0);if(vl>1){const ux=-(o.vx||0)/vl,uy=-(o.vy||0)/vl;ctx.fillStyle=K.ven;ctx.strokeStyle=INK;ctx.lineWidth=.9;for(const[d,rr] of[[r*1.5,r*.38],[r*2.4,r*.24]]){ball([q[0]+ux*d,q[1]+uy*d],rr);ctx.fill();ctx.stroke()}}
  if(!LOWFX)shine(K.venG,q[0],q[1],r*3,.45);ctx.lineWidth=1.6;ctx.strokeStyle=INK;ball(q,r);ctx.fillStyle=softBall(q,r,K.ven,.45,.3);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.85)';ball([q[0]-r*.32,q[1]-r*.34],r*.3);ctx.fill();ctx.restore()};
// the pool of venom (r 26; k its life 0..1, to come and go): bright liquid with a darker centre, a dashed rim, bubbles popping; o.boil,
// o.dry (a dry stain), o.p2
N3.hydra2Pool=function(x,y,r,k,sc,o){sc=sc||1;o=o||{};const K=pal(o.p2?1:0,0);r=r||26;const a=cl(Math.min(k*5,(1-k)*4+.2,1),0,1);if(a<=0)return;ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.globalAlpha*=a;
  if(o.dry){ctx.fillStyle='rgba(40,48,30,.5)';ctx.beginPath();ctx.ellipse(0,0,r,r*.55,0,0,TAU);ctx.fill();ctx.restore();return}
  const bo=cl(o.boil||0,0,1),t0=(o.t!=null?o.t:(typeof G!=='undefined'&&G&&G.t)||0),R=r*(1+.05*Math.sin(t0*3+x)),g=ctx.createRadialGradient(0,0,1,0,0,R);g.addColorStop(0,cmix(K.pool,'#0d1418',.45));g.addColorStop(.7,K.pool);g.addColorStop(1,cmix(K.pool,'#ffffff',.18));
  if(!LOWFX)shine(K.venG,0,0,R*1.3,.25+.25*bo,R*.7);ctx.beginPath();ctx.ellipse(0,-bo*2,R,R*.55,0,0,TAU);ctx.fillStyle=g;ctx.fill();ctx.setLineDash([5,4]);ctx.strokeStyle=K.poolE;ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
  if(!LOWFX)for(let i=0;i<4+Math.round(bo*4);i++){const t=(t0*(1.4+bo*2)+i*.37)%1,an=i*2.4+x*.1,q=[Math.cos(an)*R*.55,Math.sin(an)*R*.3-bo*2-t*bo*6];ctx.strokeStyle=`rgba(${rgbS(K.bub)},${.7*(1-t)})`;ctx.lineWidth=1;ball(q,1+t*(2.4+bo*2));ctx.stroke()}
  ctx.restore()};
// the column of venom: rises to 60 (.00-.25), stays and boils with drops falling (.25-.70), falls back in a splash (.70-1)
N3.hydra2Geyser=function(x,y,k,r,sc,o){sc=sc||1;o=o||{};const K=pal(o.p2?1:0,0);r=r||22;if(k<=0||k>=1)return;const h=k<.25?60*ez(k/.25):k<.7?60+3*Math.sin(k*40):60*(1-ez((k-.7)/.3)),w=r*.55*(k<.7?1:1-.6*(k-.7)/.3);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);if(!LOWFX)shine(K.venG,0,-h*.5,r*2,.4);
  ctx.beginPath();ctx.moveTo(-w,0);ctx.quadraticCurveTo(-w*.8,-h*.6,-w*.4,-h);ctx.quadraticCurveTo(0,-h-w*.8,w*.4,-h);ctx.quadraticCurveTo(w*.8,-h*.6,w,0);ctx.closePath();
  const g=ctx.createLinearGradient(-w,0,w,0);g.addColorStop(0,cmix(K.ven,'#0d1418',.3));g.addColorStop(.4,cmix(K.ven,'#ffffff',.25));g.addColorStop(1,cmix(K.ven,'#0d1418',.35));ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=K.ven;ctx.strokeStyle=INK;ctx.lineWidth=.9;for(let i=0;i<(LOWFX?3:6);i++){const t=(k*3+i/6)%1,a=i*1.9,q=[Math.cos(a)*(w+t*14),-h+t*h+Math.sin(t*Math.PI)*-10];ball(q,1.8);ctx.fill();ctx.stroke()}
  ctx.strokeStyle=`rgba(${rgbS(K.foam)},.6)`;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(0,0,w*1.6,w*.8,0,0,TAU);ctx.stroke();ctx.restore()};
for(const nm of['Mouths','Head','Under','Stain','Glob','Pool','Geyser'])N3['hydra'+nm]=N3['hydra2'+nm];
})();
