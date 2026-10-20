// L'IDRA DELLA PALUDE rifatta, seconda versione: «l'Antica della Pozza Nera», la Madre delle Vipere (Denis, 20 ottobre: «ok migliora
// l'idra rendilo più spaventoso e cambia design fallo fatto meglio e creepy»; prima, 15 ottobre: «rivisita tutti i boss, rendili più
// creepy e fatti meglio sia da fermi che nelle animazioni», «un po' più cupi», «falli possenti, belli, fighi, che diano timore nello
// sfidarli»). La prima versione (la cupola verde coi ventagli e le mani palmate) è da parte in anteprime/boss2/hydra_a/hydra2.js.
// Tre teste di vipera cornuta, grandi, piatte e larghe dietro le mascelle, ognuna col suo cappuccio da cobra, su tre colli lunghi e
// muscolosi che salgono da una pozza nera come la pece; sotto l'acqua un corpo di serpente enorme che affiora a spire (due davanti, la
// coda dietro) con le alghe marce sulla schiena. Scaglie verde bottiglia quasi nere, il ventre color osso vecchio, lo zigzag scuro delle
// vipere lungo la schiena con i puntini acidi nelle pieghe; occhi gialli acidi col taglio nero in orbite scure sotto le corna sopra gli
// occhi, la terza palpebra trasparente che passa di traverso, la lingua biforcuta; quando la bocca si spalanca le due zanne si aprono in
// avanti e gocciolano veleno. Dietro ogni cappuccio due occhi finti: anche di spalle ti guarda. Tre teste e una sola mente: respirano
// insieme, ti fissano insieme, sbattono la terza palpebra insieme; ogni tanto una piega la testa di lato, piano, mentre le altre due non si
// muovono. Il suo avviso: il veleno sale luminoso lungo il ventre e i puntini del collo che colpirà, dall'acqua alla gola, e il cappuccio
// si apre. A metà vita la fessura sulla fronte si apre (il terzo occhio, magenta), si aprono gli occhi finti dei cappucci, le scaglie
// diventano fredde e il veleno viola.
// Resta della Classica: forme grosse e robuste, contorni scuri spessi, colori pieni, occhi grandi con la lucina, due sole zanne per testa,
// niente sangue, ferite o cuciture.
// Metodo dello spaventapasseri: scheletro 3D proiettato con V(face), ogni testa con la sua telecamera, l'ordine di disegno dalla posa di
// riposo (acqua, coda, spire, schiena, i tre colli coi cappucci e le teste); dipinto come la lanterna (tre toni, bordo caldo, bagliori
// morbidi). Ogni mossa dipende solo da p; tempi e mosse sono quelli della prima versione (il cervello non cambia).
// Mosse: idle, walk, hit, bite (Morso a Tenaglia), stuck (Zanne piantate), spit (Salva di Veleno), breath (Soffio Velenoso), ambush
// (Agguato dal Profondo: il tratto .35-.65 si ripete), decree (Il Giudizio della Palude), dive (Si tuffa), rise (Riemerge), gaze (Sguardo
// del Terzo Occhio, fase 2), rage (Apre il terzo occhio), taunt (Presa in giro), enter (Entrata), die (Sconfitta).
// Opzioni: o.p2, o.tg (i tre bersagli del morso [dx, dy] in px dello schermo dal punto di disegno), o.tg2 (i due del secondo morso della
// fase 2), o.sweep (il giro delle teste nel Soffio), o.td (la distanza dell'eroe, per far convergere gli occhi), o.call (la chiamata: la
// coda si alza e ti fa cenno), o.noGlob (niente palla di veleno nella Salva), o.noFx (niente spruzzi, gocce, schegge, nebbia).
// Con LOWFX niente bagliori, gocce, riflessi dell'acqua, luce della pozza sui colli, nebbia né bolle; la luce del veleno è una striscia piatta.
// Disegni per il gioco con lo stesso aspetto: N3.hydra2Mouths (le bocche, i punti sotto le bocche, gli occhi e i terzi occhi sullo schermo),
// N3.hydra2Head (la testa che sbuca da una macchia d'acqua nera), N3.hydra2Under (gli occhi sotto il pavimento nel Tuffo), N3.hydra2Stain
// (l'acqua nera dove riemerge), N3.hydra2Glob (la palla di veleno), N3.hydra2Pool (la pozza), N3.hydra2Geyser (la colonna di veleno).
// Nel gioco prende il nome 'hydra' (src/js/89-idra-nuova.js).
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,run,cmix,rgbOf,poly,line,bbox,
  blink,keys,sstep,hitK,frame,ellAt,ellN,AXES,parts,reg,shine,chull,ik,starS,wa,softBall,KR}=C;
const{trem,fxOn,pls,rise,flash,ga,grad3,hullE,smoothP,svol3,T3,mixT,mixRgb,limbGrad}=C3K;

// ------------------------------------------------------------------ colours (three tones: light / base / shadow)
// bottle green almost black, the belly of old bone, the dark zigzag and the acid dots, horns of bone, the eyes acid gold in dark sockets
const K1={sc:T3('#4f8f6e','#295646','#0f251c'),belly:T3('#c9c29a','#958c66','#4f4a32'),pline:'rgba(70,56,28,.5)',zig:'rgba(6,16,12,.66)',
  dot:'#c8ff4c',dotG:'190,255,80',spine:T3('#4a7a62','#203c30','#0b1711'),horn:T3('#f3e9ca','#c2b082','#6e5e3c'),hornT:'#3a2e20',
  hoodF:T3('#ece2b4','#b9ab7a','#6a6040'),band:'rgba(46,32,18,.55)',hoodB:T3('#41735c','#1e3d30','#0a1610'),spot:'#efe8c4',spotC:'#13201a',spotG:'190,255,80',
  sock:'#06100b',eye:'#ffd23c',eyeG:'255,206,60',eyeD:'#a85a06',nict:'rgba(206,236,196,.8)',mouth:'#3a0e2c',tongue:'#a42e66',fang:'#f7efd9',
  ven:'#b6f04a',venG:'182,240,74',rim:'255,214,150',gem:'#a8f060',gemG:'160,255,90',tw:'#fff0fb',ti:'#ff5fd0',tr:'#7a1666',tG:'255,95,208',
  w0:'#03070a',w1:'#0a1512',w2:'#1f382d',wG:'170,255,90',foam:'#a9bd78',bub:'#cfe8a8',pool:'#7cc43a',poolE:'#2f5a1a',
  weed:T3('#5a6a2e','#33401a','#161d0c'),lily:T3('#668644','#3b5728','#1a2a12'),flower:'#e3d6e0'};
// the second phase: cold scales, violet venom, magenta eyes, the false eyes of the hoods awake
const K2=Object.assign({},K1,{sc:T3('#527b7c','#244244','#0c1b1d'),hoodB:T3('#45676f','#1d3539','#0a1416'),spine:T3('#4c7074','#1f3a3d','#0a1617'),
  dot:'#ea94ff',dotG:'229,140,255',spot:'#f8dcff',spotC:'#2a0f2a',spotG:'229,140,255',eye:'#ff7ade',eyeG:'255,116,220',eyeD:'#8a1474',
  ven:'#d58bff',venG:'213,139,255',rim:'226,160,255',gem:'#ea94ff',gemG:'229,140,255',
  w0:'#07040c',w1:'#140d1e',w2:'#36284a',wG:'199,125,255',foam:'#b9a2d8',bub:'#f0d8ff',pool:'#9a52d8',poolE:'#3c1a5e'});
// the defeat: the water clears
const KW={w0:'#24524a',w1:'#3a7a6c',w2:'#6fae9a'};
const PALC={};
function pal(k2,clr){k2=Math.round(cl(k2,0,1)*12)/12;clr=Math.round(cl(clr||0,0,1)*12)/12;const id=k2+'|'+clr;if(PALC[id])return PALC[id];const K={};
  for(const k in K1){const a=K1[k],b=K2[k];K[k]=typeof a!=='string'?mixT(a,b,k2):a===b?a:a[0]==='#'?cmix(a,b,k2):mixRgb(a,b,k2)}
  if(clr>0)for(const k in KW)K[k]=cmix(K[k],KW[k],clr);K.k2=k2;return PALC[id]=K}
const rgbS=c=>rgbOf(c).join(',');

// ------------------------------------------------------------------ the body at rest (model units: x forward, y its right, z up)
const HB={c:[-14,0,-8],r:[40,46,25]};                // the back of the body, low in the water (only its top shows)
// the three necks: where each comes out of the body (inside it), where its head rests, its size
const HN=[{s:-1,root:[6,-20,4],head:[22,-58,80],k:1.08},{s:0,root:[10,0,6],head:[30,0,102],k:1.24},{s:1,root:[6,20,4],head:[22,58,80],k:1.08}];
// a head: the wide skull (the muscles of the jaws) and the flat snout of a viper (head axes, ×k)
const HE=[{c:[-4,0,1.2],r:[14,14,8.8]},{c:[12,0,-1.4],r:[15,9,5.8]}];
const MZ=-2.4,JA=1.05;                                                   // the cut of the mouth (head units ×k), how far the jaw drops
const HAND=[[52,-50,1],[52,50,1]];                                       // the tops of the two coils in front (the moves move them)
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
function hd0(n,p2){return{s:n.s,off:[0,0,0],yaw:0,pitch:-.12,roll:0,hb:0,open:0,fan:p2?1:.6,ft:p2?1:0,wing:0,tongue:0,sac:0,vl:null,gem:.3,third:p2?1:0,wide:0,spiral:0,spA:0,
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
    if(o.call){A.beck=rise(p,.72,.8,.96,1);A.beckW=Math.sin(Math.max(0,p-.8)*TAU/.1)}}
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
  else{// idle (also the portrait of the arena at p 0): the body and the water breathe, the heads breathe together, all look at you together
    const nb=p2?2:1,br=q=>.5-.5*Math.cos(TAU*nb*q),k=br(p);A.br=.02*k;A.wz=k-.5;
    for(const st of[.10,.60]){const t=((p-st)%1+1)%1/.5;if(t<1)A.rings.push({t,r0:56})}
    A.tail=.2*Math.sin(ph);A.fin=.05*k;
    H.forEach((h,i)=>{const kh=br(p-.06),kf=br(p-.10);h.off=[0,h.s*3*kh,(h.s?3:4)*kh];h.yaw=h.s*.05*kh;if(!p2)h.fan=.6+.12*kf;
      h.blink=blink(p,.62,.07);if(p2)h.blink=Math.min(h.blink,blink(p,.12,.07));h.tongue=Math.max(pls(p,.35+.03*i,.05),pls(p,.43+.03*i,.05));h.gem=.25+.2*k;h.hb=.1*kf});
    // one head at a time tilts its head to the side, slowly, while the others keep still and keep looking at you; the middle one snaps
    // forward a moment, as if to bite, and stops
    for(const[i,a,b,r] of[[0,.06,.3,.5],[2,.34,.58,-.5],[1,.66,.88,.42]])H[i].roll+=r*rise(p,a,a+.08,b-.08,b);M0.off[0]+=5*pls(p,.47,.035);
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
// sea serpent in the Agguato), one ring every 10 of length (at least 8), radius from 13.5 at the root to 8.4 under the head
function spineOf(g,X,wl){const{hc,HF,k,root,h,s}=g,hu=HF.u,hw=HF.w,e=add(add(hc,mul(hu,-8*k)),mul(hw,-3.5*k)),L=len(sub(e,root));
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
    if(len(f)<.15)f=sub([0,0,-1],mul(t,-t[2]));f=nrm(f);q.t=t;q.f=f;q.v=cross(t,f);q.r=lerp(12,7,q.s)*(k>1.15?1.06:1);q.hide=h.arch>.6&&q.s<.22}
  return S}

// ------------------------------------------------------------------ the pieces
// a tube along samples S ({c centre, t along, f its belly side, v across, r radius}): the hull of every two rings, cut at the water
function tubeHull(V0,S,wl){const{P}=V0,N=S.length,RG=S.map(q=>{const r=[];for(let j=0;j<8;j++){const t=j/8*TAU;r.push(add(q.c,add(mul(q.f,Math.cos(t)*q.r),mul(q.v,Math.sin(t)*q.r))))}return r});
  const Hs=[];for(let i=0;i<N-1;i++){if(S[i].hide||S[i+1].hide)continue;const pts=below([RG[i],RG[i+1]],wl)?cutRows([RG[i],RG[i+1]],wl):RG[i].concat(RG[i+1]);if(pts.length<3)continue;const hh=chull(pts.map(q=>P(q)));if(hh.length>2)Hs.push(hh)}
  return Hs}
// the frames along a curve: the belly side toward ref (down for the coils and the tail), the radius from R(s)
function frames(pts,R,ref){const N=pts.length-1,S=[];for(let i=0;i<=N;i++){const t=nrm(sub(pts[Math.min(N,i+1)],pts[Math.max(0,i-1)]));let f=sub(ref,mul(t,dot(ref,t)));if(len(f)<.15)f=sub([1,0,0],mul(t,t[0]));f=nrm(f);
  S.push({c:pts[i],t,f,v:cross(t,f),r:R(i/N),s:i/N})}return S}
// a piece of the serpent painted: one ink round all of it, three tones; clipped: the belly of old bone where it faces us (o.belly), the
// dark zigzag of the vipers down its back with the acid dots in its bends, the venom light that climbs (o.vl [from, to] along it), the
// light of the pool from below, the dark side; then the warm rim, the spines down its back (o.sp: one every o.sp rings), the foam
function tubeDraw(V0,S,K,wl,o){const{P,F}=V0,N=S.length;if(N<2)return null;const Hs=tubeHull(V0,S,wl);if(!Hs.length)return null;
  polys(Hs.map(hh=>grow(hh,1.3)));ctx.fillStyle=INK;ctx.fill();let all=[];for(const hh of Hs)all=all.concat(hh);const bb=bbox(all);polys(Hs);ctx.fillStyle=grad3(bb,K.sc);ctx.fill();
  const up=S.map(q=>q.c[2]>wl-1&&!q.hide),vl=o.vl&&o.vl[1]>o.vl[0]+.01?o.vl:null;
  if(o.simple){const runs=[];let r=[];for(let i=0;i<N;i++){const q=S[i];if(!up[i]||q.c[2]<wl+q.r*.6||F(mul(q.f,-1))<.3){if(r.length>1)runs.push(r);r=[];continue}r.push(P(add(q.c,add(mul(q.f,-q.r*.9),mul(q.v,(i%2?1:-1)*q.r*.3)))))}if(r.length>1)runs.push(r);
    ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=K.zig;ctx.lineWidth=S[0].r*(o.zw||.5)*.7;for(const rr of runs){line(rr);ctx.stroke()}}
  else{ctx.save();polys(Hs);ctx.clip();
  // the belly: plates of old bone where it faces us, a thin seam on every ring
  const ca=Math.cos(.46),sa=Math.sin(.46),edge=(q,sg)=>P(add(q.c,mul(add(mul(q.f,ca),mul(q.v,sg*sa)),q.r*1.02))),vis=S.map((q,i)=>up[i]&&F(q.f)>-.05);
  const strip=(a,b,fill)=>{let run=[];const flush=()=>{if(run.length>1){ctx.beginPath();for(const q of run){const e=edge(q,1);ctx.lineTo(e[0],e[1])}for(let i=run.length-1;i>=0;i--){const e=edge(run[i],-1);ctx.lineTo(e[0],e[1])}ctx.closePath();ctx.fillStyle=fill;ctx.fill()}run=[]};
    for(let i=0;i<N;i++){const q=S[i];if(vis[i]&&q.s>=a-1e-6&&q.s<=b+1e-6)run.push(q);else flush()}flush()};
  if(o.belly){strip(0,1,grad3(bb,K.belly));ctx.strokeStyle=K.pline;ctx.lineWidth=.9;ctx.beginPath();for(let i=1;i<N-1;i++){if(!vis[i])continue;const a=edge(S[i],1),b=edge(S[i],-1);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}ctx.stroke()}
  // the zigzag down its back and the acid dots in its bends (lit by the venom as it climbs)
  const DT=[];{const runs=[];let r=[];for(let i=0;i<N;i++){const q=S[i];if(!up[i]||F(mul(q.f,-1))<.04){if(r.length>1)runs.push(r);r=[];continue}
      const sg=i%2?1:-1,s=P(add(q.c,add(mul(q.f,-q.r*.97),mul(q.v,sg*q.r*.42))));r.push(s);if(i%4===1)DT.push({s,q})}if(r.length>1)runs.push(r);
    ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=K.zig;ctx.lineWidth=S[0].r*(o.zw||.5);for(const rr of runs){line(rr);ctx.stroke()}
    for(const d of DT){const lt=vl&&d.q.s>=vl[0]&&d.q.s<=vl[1]?1:o.glowAll||0,r=d.q.r*.13;ball(d.s,r);ctx.fillStyle=lt>.05?cmix(K.dot,'#ffffff',.5*lt):`rgba(${K.dotG},.55)`;ctx.fill()}}
  // the venom that climbs: up the belly, brightest at its head
  if(vl){const[a,b]=vl;if(o.belly)strip(a,b,`rgba(${K.venG},${LOWFX?.85:.7})`);
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';if(o.belly)strip(Math.max(a,b-.22),b,`rgba(${K.venG},.55)`);for(const d of DT)if(d.q.s>=a&&d.q.s<=b){ball(d.s,d.q.r*.42);ctx.fillStyle=`rgba(${K.dotG},.35)`;ctx.fill()}ctx.restore();
      let bi=0;for(let i=0;i<N;i++)if(S[i].s<=b)bi=i;if(vis[bi]){const q=edge(S[bi],0);shine(K.venG,q[0],q[1],16,.5)}}}
  if(o.glowAll>0&&o.belly)ga(.5*o.glowAll,()=>{if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';strip(0,1,`rgba(${K.venG},.5)`);ctx.restore()}});
  // the light of the pool on its lower part
  if(!LOWFX&&o.under!==false&&S[0].c[2]<wl+2){const lo=S[0].c,a=P([lo[0],lo[1],wl]),b=P([lo[0],lo[1],wl+30]),g=ctx.createLinearGradient(a[0],a[1],b[0],b[1]);g.addColorStop(0,`rgba(${K.wG},.26)`);g.addColorStop(1,`rgba(${K.wG},0)`);
    const y0=Math.max(bb[1]-2,Math.min(a[1],b[1])-2),y1=Math.min(bb[3]+2,Math.max(a[1],b[1])+4);if(y1>y0){ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.fillRect(bb[0]-2,y0,bb[2]-bb[0]+4,y1-y0);ctx.globalCompositeOperation='source-over'}}
  // the shade: the dark side, a light line on the lit side
  const Q=S.map(q=>P(q.c)),lt=[];ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
  for(let i=0;i<N;i++){const a=Q[Math.max(0,i-1)],b=Q[Math.min(N-1,i+1)];let nx=-(b[1]-a[1]),ny=b[0]-a[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;if(nx*-.55+ny*-.83<0){nx=-nx;ny=-ny}
    const r=S[i].r;ctx.lineTo(Q[i][0]-nx*r*.72,Q[i][1]-ny*r*.72);lt.push(up[i]&&S[i].c[2]>wl+r*.3?[Q[i][0]+nx*(r-1.8),Q[i][1]+ny*(r-1.8)]:null)}
  ctx.strokeStyle=`rgba(${rgbS(K.sc.d)},.45)`;ctx.lineWidth=S[0].r*.75;ctx.stroke();
  ctx.restore();
  ctx.strokeStyle=`rgba(${K.rim},${rimA(K)})`;ctx.lineWidth=1.3;ctx.beginPath();let pen=false;for(const q of lt){if(!q){pen=false;continue}if(pen)ctx.lineTo(q[0],q[1]);else{ctx.moveTo(q[0],q[1]);pen=true}}ctx.stroke()}
  // the spines down its back, raked back toward its tail (only the ones on the side we see)
  if(o.sp){const pa=new Path2D();let n=0;for(let i=o.sp0||1;i<N-1;i+=o.sp){const q=S[i];if(!up[i])continue;const nn=mul(q.f,-1);if(F(nn)<-.22)continue;const hh=(o.spH||3.2)*(o.spK==null?1:o.spK);if(hh<.3)continue;
      const b=add(q.c,mul(nn,q.r*.9)),T=P(add(add(b,mul(nn,hh)),mul(q.t,-hh*.85))),B1=P(add(b,mul(q.t,hh*.5))),B2=P(add(b,mul(q.t,-hh*.45)));pa.moveTo(B1[0],B1[1]);pa.lineTo(T[0],T[1]);pa.lineTo(B2[0],B2[1]);pa.closePath();n++}
    if(n){ctx.lineJoin='round';ctx.fillStyle=K.spine.d;ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke(pa)}}
  // foam where it comes out of the water
  if(o.fx)for(let i=0;i<N-1;i++){const a=S[i].c,b=S[i+1].c;if(!S[i].hide&&(a[2]-wl)*(b[2]-wl)<0){const u=(wl-a[2])/(b[2]-a[2]),c=lerp3(a,b,u);foam(P([c[0],c[1],wl]),S[i].r*.8,K,.55)}}
  return Hs}
// how open the hood is: half open at rest, wide when it threatens (the old fan, the fins, a breath)
const hoodK=h=>cl(.3+.7*Math.max(h.wing||0,(h.fan-.6)/.4*.8,0)+(h.hb||0),0,1.15);
// the hood of the cobra: the neck under the head opened on both sides, a little cupped forward; the front pale with three dark bands
// across the throat, the back dark with two pale false eyes joined by a curve (in the second phase they open: magenta, with a slit)
const HOODW=[[0,.1],[.28,.55],[.6,.94],[.8,1],[.93,.86],[1,.6]];
function hoodDraw(V0,S,g,K,wl,A){const{P,F}=V0,k=g.k,h=g.h,fl=hoodK(h),W=lerp(10,27,cl(fl,0,1.15))*k,s0=.4,s1=.88,L3=[],R3=[],C=[];
  for(const q of S){if(q.s<s0-1e-6||q.s>s1+1e-6||q.hide||q.c[2]<wl+3)continue;const u=(q.s-s0)/(s1-s0),w=W*keys(HOODW,u)+q.r*.55,fw=mul(q.f,.3*w*w/(W+q.r));
    L3.push(add(add(q.c,mul(q.v,w)),fw));R3.push(add(add(q.c,mul(q.v,-w)),fw));C.push({q,w,u})}
  if(C.length<3||C[C.length-1].u<.7)return null;const qt=C[C.length-1].q,top=add(qt.c,add(mul(qt.t,W*.18+2*k),mul(qt.f,-.1*W))),P3=L3.concat([top],R3.slice().reverse());if(P3.every(q=>q[2]<wl))return null;
  const pts=P3.map(q=>P([q[0],q[1],Math.max(q[2],wl)])),pa=smoothP(pts),bb=bbox(pts),mid=C[Math.round((C.length-1)*.62)],fv=F(mid.q.f),front=fv>=0,thin=Math.abs(fv)<.22;
  ctx.lineJoin='round';ctx.fillStyle=grad3(bb,K.hoodB);ctx.fill(pa);
  // the ribs under the skin, from the neck out to the edge
  ctx.strokeStyle=front?'rgba(90,72,40,.35)':'rgba(0,0,0,.3)';ctx.lineWidth=.9;ctx.beginPath();for(const f of[.2,.42,.64,.84]){const i=Math.round((C.length-1)*f),c=P(C[i].q.c),a=P(L3[i]),b=P(R3[i]);ctx.moveTo(c[0],c[1]);ctx.lineTo(a[0],a[1]);ctx.moveTo(c[0],c[1]);ctx.lineTo(b[0],b[1])}ctx.stroke();
  const surf=(c,sd,d)=>{const q=c.q;return add(add(q.c,mul(q.v,sd*d)),mul(q.f,.3*d*d/(W+q.r)))};
  if(thin){}
  else if(front){// the pale throat down the middle, with three dark bands across it
    const th=[],tw=k*4.6;for(const c of C){const q=c.q,hw2=Math.min(tw+q.r*.4,c.w*.85);th.push([P(add(add(q.c,mul(q.v,hw2)),mul(q.f,q.r*.7))),P(add(add(q.c,mul(q.v,-hw2)),mul(q.f,q.r*.7)))])}
    ctx.beginPath();for(const a of th)ctx.lineTo(a[0][0],a[0][1]);for(let i=th.length-1;i>=0;i--)ctx.lineTo(th[i][1][0],th[i][1][1]);ctx.closePath();ctx.fillStyle=grad3(bb,K.hoodF);ctx.fill();
    ctx.strokeStyle=K.band;ctx.lineWidth=2.4*k;ctx.lineCap='butt';ctx.beginPath();for(const f of[.3,.46,.62]){const i=Math.round((th.length-1)*f);ctx.moveTo(th[i][0][0],th[i][0][1]);ctx.lineTo(th[i][1][0],th[i][1][1])}ctx.stroke()}
  else{// the false eyes: two big pale rings that stare, a dark middle in each (nothing else: no brow, no mouth); in the second phase they
    // open, magenta, with a slit
    const e=C[Math.round((C.length-1)*.68)],nB=mul(e.q.f,-1),open=A.memLit||0,u0=e.q.t;
    for(const sd of[-1,1]){const c=add(surf(e,sd,e.w*.5),mul(nB,.6)),q=P(c),R=5*k;if(!LOWFX&&open>.05)shine(K.spotG,q[0],q[1],R*2.8,.6*open);
      ctx.beginPath();discP(V0,c,nB,R,R*.86,u0);ctx.fillStyle=K.spot;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke();
      ctx.beginPath();discP(V0,c,nB,R*.6,R*.52,u0);ctx.fillStyle=open>.5?K.ti:K.spotC;ctx.fill();
      if(open>.5){ctx.fillStyle='#14060f';ctx.beginPath();discP(V0,c,nB,R*.12,R*.5,u0);ctx.fill()}else{ctx.fillStyle=`rgba(${rgbS(K.spot)},.5)`;ctx.beginPath();discP(V0,add(c,mul(u0,R*.18)),nB,R*.14,R*.12,u0);ctx.fill()}}}
  ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke(pa);if(!thin)rimK(pts,rimA(K)*.8,K.rim);return pts}
// a horn of bone: from b (on the skull) along d, curving up by up, L long, r wide at the root; dark where it grows and at the tip
function hornDraw(V0,b,d,up,L,r,K,flat){const{P}=V0,t=add(add(b,mul(d,L)),up),m=add(b,add(mul(d,L*.52),mul(up,.12))),B=P(b),M=P(m),T=P(t);
  const dx=T[0]-B[0],dy=T[1]-B[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*r,ny=dx/l*r;
  ctx.beginPath();ctx.moveTo(B[0]+nx,B[1]+ny);ctx.quadraticCurveTo(M[0]+nx*.6,M[1]+ny*.6,T[0],T[1]);ctx.quadraticCurveTo(M[0]-nx*.6,M[1]-ny*.6,B[0]-nx,B[1]-ny);ctx.closePath();
  if(flat)ctx.fillStyle=K.horn.b;else{const g=ctx.createLinearGradient(B[0],B[1],T[0],T[1]);g.addColorStop(0,K.horn.d);g.addColorStop(.25,K.horn.b);g.addColorStop(.65,K.horn.l);g.addColorStop(1,K.hornT);ctx.fillStyle=g}ctx.fill();
  ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();
  if(L>4){ctx.strokeStyle='rgba(70,52,30,.55)';ctx.lineWidth=.8;ctx.beginPath();for(const f of[.3,.55]){const c=[lerp(B[0],T[0],f),lerp(B[1],T[1],f)],w=(1-f*.85)*.85;ctx.moveTo(c[0]+nx*w,c[1]+ny*w);ctx.lineTo(c[0]-nx*w,c[1]-ny*w)}ctx.stroke()}}
// the eye: acid gold with a black slit, a point of light; the third lid (a pale film) sweeps across it from the snout side (h.blink); over it
// the heavy upper lid slanting down to the snout (an angry eye: lower still when it squints), its edge in ink, the brow ridge along it
function eyeG(q,rx,ry,K,h,ang,dir){const sy=ry;
  if(h.shut>.5){ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.lineCap='round';ctx.beginPath();ctx.ellipse(q[0],q[1]+ry*.2,rx,ry*.5,ang,.15,Math.PI-.15);ctx.stroke();return}
  const eyeP=()=>{ctx.beginPath();ctx.ellipse(q[0],q[1],rx,sy,ang,0,TAU)};
  eyeP();const g=ctx.createRadialGradient(q[0]-rx*.2,q[1]+sy*.1,rx*.1,q[0],q[1],rx*1.05);g.addColorStop(0,cmix(K.eye,'#ffffff',.5));g.addColorStop(.5,K.eye);g.addColorStop(1,K.eyeD);
  ctx.fillStyle=g;ctx.fill();
  const pw=Math.max(.5,rx*(.13+.25*(h.wide||0)));ctx.fillStyle='#0b0604';ctx.beginPath();ctx.ellipse(q[0]+dir*rx*.08,q[1]+sy*.08,pw,sy*.86,ang,0,TAU);ctx.fill();
  ctx.fillStyle='#fff';ball([q[0]-dir*rx*.3,q[1]+sy*.05],Math.max(.45,Math.min(rx,sy)*.22));ctx.fill();
  const b=h.blink==null?1:h.blink;
  ctx.save();eyeP();ctx.clip();
  if(b<.98){const c=1-b,ex=q[0]+dir*rx*(1-2.1*c);ctx.beginPath();ctx.moveTo(ex,q[1]-sy-2);ctx.quadraticCurveTo(ex-dir*rx*.3,q[1],ex,q[1]+sy+2);ctx.lineTo(q[0]+dir*(rx+3),q[1]+sy+2);ctx.lineTo(q[0]+dir*(rx+3),q[1]-sy-2);ctx.closePath();
    ctx.fillStyle=K.nict;ctx.fill();ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=.7;ctx.stroke()}
  const sq=h.squint||0,A0=[q[0]-dir*rx*1.15,q[1]-sy*(.9-.45*sq)],B0=[q[0]+dir*rx*1.15,q[1]-sy*(.02-.5*sq)];
  ctx.beginPath();ctx.moveTo(A0[0],A0[1]);ctx.lineTo(B0[0],B0[1]);ctx.lineTo(B0[0],B0[1]-sy*3);ctx.lineTo(A0[0],A0[1]-sy*3);ctx.closePath();ctx.fillStyle=K.sc.b;ctx.fill();ctx.restore();
  eyeP();ctx.strokeStyle=INK;ctx.lineWidth=1.35;ctx.stroke();
  const A1=[A0[0]-dir*rx*.35,A0[1]-sy*.25],B1=[B0[0]+dir*rx*.2,B0[1]+sy*.08];ctx.lineCap='round';
  ctx.strokeStyle=K.sc.d;ctx.lineWidth=Math.max(2,ry*.75);ctx.beginPath();ctx.moveTo(A1[0],A1[1]-ry*.4);ctx.lineTo(B1[0],B1[1]-ry*.4);ctx.stroke();
  ctx.strokeStyle=INK;ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(A1[0],A1[1]);ctx.lineTo(B1[0],B1[1]);ctx.stroke();
  ctx.strokeStyle=K.sc.l;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(A1[0],A1[1]-ry*.75);ctx.lineTo(B1[0],B1[1]-ry*.75);ctx.stroke()}
// the slit on the forehead (closed: a seam that glows with the venom, h.gem; open in the second phase: a magenta eye standing upright,
// the pupil across it; h.spiral turns two lines in it in the Sguardo)
function thirdEye(V0,c,n,hu,K,h,k){const{P,F}=V0,f=F(n);if(f<.1)return;const q=P(c),a=P(add(c,mul(hu,4.8*k))),ang=Math.atan2(a[1]-q[1],a[0]-q[0]),fr=cl((f-.1)*3,0,1),RL=Math.hypot(a[0]-q[0],a[1]-q[1]),
    op=cl(h.third||0,0,1),RW=lerp(.7,2.9*(1+.3*(h.wide||0)),op)*k*Math.pow(f,.5);
  ctx.save();ctx.globalAlpha*=fr;
  if(!LOWFX){const gl=op>.5?K.tG:K.gemG,al=op>.5?.5:.12+.45*cl(h.gem||0,0,1.5);if(al>.13)shine(gl,q[0],q[1],RL*2.2,al)}
  ctx.beginPath();ctx.ellipse(q[0],q[1],RL,RW,ang,0,TAU);
  if(op>.04){ctx.fillStyle=K.tw;ctx.fill();ctx.save();ctx.clip();ctx.fillStyle=K.ti;ctx.beginPath();ctx.ellipse(q[0],q[1],RL*.62,RW*.95,ang,0,TAU);ctx.fill();
    if(h.spiral>0){ctx.strokeStyle=`rgba(74,10,70,${.8*h.spiral})`;ctx.lineWidth=.9;for(const s0 of[0,Math.PI]){ctx.beginPath();for(let t=0;t<=1;t+=.1){const an=s0+(h.spA||0)+t*4.2,rr=RW*.9*t;ctx.lineTo(q[0]+Math.cos(an)*rr*RL/RW*.55,q[1]+Math.sin(an)*rr)}ctx.stroke()}}
    ctx.fillStyle='#14060f';ctx.beginPath();ctx.ellipse(q[0],q[1],RL*.5,Math.max(.4,RW*.16),ang,0,TAU);ctx.fill();ctx.fillStyle='#fff';ball([q[0]-RL*.2,q[1]-RW*.35],Math.max(.4,RW*.24));ctx.fill();ctx.restore();
    ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke()}
  else{ctx.fillStyle=`rgba(${K.gemG},${.25+.5*cl(h.gem||0,0,1)})`;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke()}
  ctx.restore()}
// a head: the skull and the snout split at the mouth; two big horns swept back and two short ones over the eyes; the dark arrow of the
// vipers on top; the deep sockets with the acid eyes under heavy brows; the slit on the forehead; the nostrils and the pits; the long line
// of the mouth bending down at the back (up in the smirk); the jaw paler under; inside the mouth the dark throat and its light; the two
// fangs that fold back when it closes and swing forward when it opens wide; the forked tongue
function headDraw(V0,g,K,wl,fx,A){const{P,F}=V0,{hc,HF,k,h,n}=g,hu=HF.u,hv=HF.v,hw=HF.w,ja=h.open*JA;if(hc[2]+28*k<wl)return;
  const sq=h.sq||0,E=HE.map(e=>({c:mul(e.c,k),r:[e.r[0]*k*(1+.1*sq),e.r[1]*k*(1+.05*sq),e.r[2]*k*(1-.15*sq)]})),Hd=splitHead(hc,HF,E,MZ*k,ja,2,10);
  const toW=d=>add(hc,add(add(mul(hu,d[0]),mul(hv,d[1])),mul(hw,d[2]))),toD=d=>nrm(add(add(mul(hu,d[0]),mul(hv,d[1])),mul(hw,d[2])));
  const skC=E[0].c,skR=E[0].r,onSk=m=>toW(ellAt(skC,skR,null,nrm(m))),nSk=m=>toD(ellN(skR,null,nrm(m)));
  // the horns (the ones on the far side behind the head)
  const HR=[];for(const sd of[-1,1])HR.push({m:[-.5,sd*.62,.56],d:[-.9,sd*.48,.36],L:12.5,r:2.9,u:4.6},{m:[.42,sd*.56,.72],d:[-.42,sd*.34,1],L:6,r:2.15,u:.6});
  for(const hr of HR){hr.b=add(onSk(hr.m),mul(nSk(hr.m),-.6*k));hr.far=F(nSk(hr.m))<(hr.L>8?.02:-.3)}
  const horn=hr=>{if(hr.b[2]>wl)hornDraw(V0,hr.b,toD(hr.d),mul(hw,hr.u*k),hr.L*k,hr.r*k,K,hr.L<8)};
  for(const hr of HR)if(hr.far)horn(hr);
  // the jaw, the inside of the mouth with the tongue, the light in the throat
  svc(V0,Hd.bowl,mixT(K.sc,K.belly,.42),wl,{lw:2});
  const mouthOpen=ja>.04&&F(Hd.wJ)>.02,mT=lerp3(Hd.lip(0,0),Hd.lip(0,1),.5);
  if(mouthOpen){const fl=Hd.floor.filter(q=>q[2]>wl).map(q=>P(q));if(fl.length>2){const gm=chull(fl);poly(gm);ctx.fillStyle=K.mouth;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
    ctx.save();poly(gm);ctx.clip();ctx.beginPath();discP(V0,Hd.jaw([4*k,0,Hd.hz+.3]),Hd.wJ,3.6*k,2.2*k,hu);ctx.fillStyle=K.tongue;ctx.fill();
    const th=h.throat||(h.vl&&h.vl[1]>.95?1:0)||(h.mist>0?1:0)||.35*cl(h.open*1.5-.6,0,1);if(th>0){const q=P(Hd.jaw([-7*k,0,Hd.hz+.6]));ctx.fillStyle=`rgba(${K.venG},${.8*cl(th,0,1)})`;ball(q,2.8*k);ctx.fill();if(!LOWFX)shine(K.venG,q[0],q[1],10*k,.5*cl(th,0,1))}ctx.restore()}}
  const hp=svc(V0,Hd.dome,K.sc,wl,{lw:2.4});
  const sn=P(toW([24*k,0,-1*k])),EY=[];
  if(hp){rimK(hp,rimA(K),K.rim);
    if(mouthOpen&&F(mul(hw,-1))>.02){const pl=Hd.palate.filter(q=>q[2]>wl).map(q=>P(q));if(pl.length>2){poly(chull(pl));ctx.fillStyle=C.dk(K.mouth,.25);ctx.fill()}}
    for(const sd of[-1,1]){const m=nrm([.6,sd*.64,.4]),nn=nSk(m),f=F(nn);if(f<.1)continue;const q=P(onSk(m)),rx=(n.s?4.5:4.9)*k*Math.pow(f,.45),ry=(n.s?3.3:3.6)*k*Math.pow(f,.7);EY.push({q,rx,ry,f,sd})}
    ctx.save();ctx.clip(hp.path);
    // the dark arrow of the vipers on the top of the head, pointing at the snout
    if(F(hw)>.05){const a=P(onSk([-.62,-.55,.6])),b=P(onSk([-.62,.55,.6])),c=P(toW([14*k,0,4.4*k])),d=P(onSk([-.2,0,1])),m1=P(onSk([.25,-.3,.92])),m2=P(onSk([.25,.3,.92]));
      ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(m1[0],m1[1],c[0],c[1]);ctx.quadraticCurveTo(m2[0],m2[1],b[0],b[1]);ctx.lineTo(d[0],d[1]);ctx.closePath();ctx.fillStyle=K.zig;ctx.fill()}
    // a soft light on the top of the head, the darker snout below
    const tq=P(onSk([.2,0,1]));ctx.fillStyle=wa(.12);ctx.beginPath();ctx.ellipse(tq[0],tq[1],5.5*k,3.2*k,0,0,TAU);ctx.fill();
    // the deep sockets
    for(const e of EY){ctx.fillStyle=K.sock;ctx.beginPath();ctx.ellipse(e.q[0],e.q[1]-e.ry*.15,e.rx*1.5,e.ry*1.55,0,0,TAU);ctx.fill()}
    // the mouth: the long line of the lips, bending down at the back (up in the smirk)
    {let r=[];const run2=[];ctx.lineCap='round';const sm=h.smirk||0;for(let i=0;i<=11;i++){const t=-1.6+i/11*3.2,q0=Hd.lip(t,0),bend=Math.max(0,Math.abs(t)-.95)*k*(sm>0?2.6+2*sm:-1.8),q=add(q0,mul(hw,bend));
        if(F(Hd.lipN(t))>.02&&q[2]>wl)r.push(P(q));else if(r.length){run2.push(r);r=[]}}if(r.length)run2.push(r);ctx.strokeStyle=INK;ctx.lineWidth=1.5;for(const rr of run2)if(rr.length>1){line(rr);ctx.stroke()}}
    // the nostrils at the tip of the snout, the pits under the eyes
    for(const sd of[-1,1]){for(const[m,rx,ry] of[[[.95,sd*.24,.34],1.15,.65],[[.5,sd*.86,.1],.9,.6]]){const mm=nrm(m);if(F(toD(ellN(E[1].r,null,mm)))<.1)continue;const q=P(toW(ellAt(E[1].c,E[1].r,null,mm)));
      ctx.fillStyle='rgba(4,14,8,.8)';ctx.beginPath();ctx.ellipse(q[0],q[1],rx*k,ry*k,0,0,TAU);ctx.fill()}}
    ctx.restore();
    // the eyes in their sockets (each with its glow), under the heavy brows that slope down to the snout
    EY.sort((a,b)=>a.f-b.f);
    if(!LOWFX&&!(h.shut>.5)&&EY.length){let x=0,y=0;for(const e of EY){x+=e.q[0];y+=e.q[1]}shine(K.eyeG,x/EY.length,y/EY.length,(EY.length>1?13:9)*k,.32+6*(A.br||0))}
    for(const e of EY){const dir=sn[0]>=e.q[0]?1:-1,ang=Math.atan2(sn[1]-e.q[1],sn[0]-e.q[0])*.18*dir;eyeG(e.q,e.rx,e.ry,K,h,ang,dir);
}
    // the slit on the forehead, between the short horns
    {const m=nrm([.3,0,.95]);thirdEye(V0,add(onSk(m),mul(nSk(m),.3)),nSk(m),hu,K,h,k)}}
  for(const hr of HR)if(!hr.far)horn(hr);
  // the two fangs: folded back along the palate when the mouth is shut (only the tips show), swinging forward as it opens
  const op=sstep(.08,.55,h.open||0),FT=[];
  for(const sd of[-1,1]){const t=sd*.3,b=Hd.lip(t,0);if(b[2]<wl||(F(Hd.lipN(t))<-.12&&op<.3))continue;
    const fold=nrm(add(mul(hu,-.5),mul(hw,-.86))),out=nrm(add(mul(hu,.3),mul(hw,-.95))),d=nrm(lerp3(fold,out,op)),Lf=lerp(3.2,9.5,op)*k,tip=add(b,mul(d,Lf));FT.push(tip);
    const B=P(b),T=P(tip),M=P(add(add(b,mul(d,Lf*.55)),mul(hu,.9*k*op))),dx=T[0]-B[0],dy=T[1]-B[1],l=Math.hypot(dx,dy)||1,w=1.4*k,nx=-dy/l*w,ny=dx/l*w;
    ctx.beginPath();ctx.moveTo(B[0]+nx,B[1]+ny);ctx.quadraticCurveTo(M[0]+nx*.45,M[1]+ny*.45,T[0],T[1]);ctx.quadraticCurveTo(M[0]-nx*.45,M[1]-ny*.45,B[0]-nx,B[1]-ny);ctx.closePath();
    ctx.fillStyle=K.fang;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();
    if(op>.45&&fx){if(!LOWFX)shine(K.venG,T[0],T[1]+1,4*k,.5*op);ctx.fillStyle=K.ven;ctx.strokeStyle=INK;ctx.lineWidth=.7;ball([T[0],T[1]+1.1*k],.9*k);ctx.fill();ctx.stroke()}}
  // the forked tongue that flicks out
  if(h.tongue>.03){const tl=(8+6*h.tongue)*k*h.tongue,b=add(mT,mul(hu,1*k)),e=add(b,add(mul(hu,tl),mul(hw,-1.4*k))),q0=P(b),q1=P(e);if(b[2]>wl){ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.8;seg(q0,q1);ctx.stroke();ctx.strokeStyle=K.tongue;ctx.lineWidth=1.4;seg(q0,q1);ctx.stroke();
    for(const sd of[-1,1]){const f2=P(add(e,add(mul(hu,2.6*k),mul(hv,sd*2*k))));ctx.strokeStyle=INK;ctx.lineWidth=2.2;seg(q1,f2);ctx.stroke();ctx.strokeStyle=K.tongue;ctx.lineWidth=1;seg(q1,f2);ctx.stroke()}}}
  // the effects at the mouth: the venom ball leaving, the mist of the breath, a drop from a fang, the cough from the nostrils
  if(fx){if(h.glob>=0){const u=h.glob,m=add(mT,add(mul(hu,(3+u*18)*k),[0,0,10*u])),q=P(m),r=(3+u*4)*k;if(!LOWFX)shine(K.venG,q[0],q[1],r*3,.4);ctx.lineWidth=1.4;ctx.strokeStyle=INK;ball(q,r);ctx.fillStyle=softBall(q,r,K.ven,.45,.25);ctx.fill();ctx.stroke()}
    if(h.mist>0&&!LOWFX)for(let j=0;j<5;j++){const u=((A.t||0)*3+j/5)%1,m=add(mT,add(mul(hu,(4+u*22)*k),[0,0,u*4])),q=P(m);ctx.fillStyle=`rgba(${K.venG},${.4*(1-u)*h.mist})`;ball(q,(2.5+u*8)*k);ctx.fill()}
    if(h.drip>=0&&h.drip<1){const m=FT.length?FT[0]:add(mT,mul(hw,-2*k)),z=lerp(m[2],wl,h.drip*h.drip),q=P([m[0],m[1],z]);ctx.fillStyle=K.ven;ctx.strokeStyle=INK;ctx.lineWidth=.8;ball(q,1.5*k);ctx.fill();ctx.stroke()}
    if(h.cough>0&&!LOWFX)for(const sd of[-1,1]){const m=toW([24*k,sd*2*k,1*k]),q=P(add(m,mul(hu,4*k*h.cough)));ctx.fillStyle=`rgba(${K.venG},${.45*h.cough})`;ball(q,3*k*(1+h.cough));ctx.fill()}}
  if(h.stars>0){const q=P(add(hc,mul(hw,18*k)));for(let i=0;i<3;i++){const an=(A.t||0)*5+i*TAU/3;starS(q[0]+Math.cos(an)*10*k,q[1]+Math.sin(an)*3.4*k,2.6,h.stars)}}}
// a neck with its hood and its head, in the order the hood faces us: hood, neck, head (from the front); head, neck, hood (from behind)
function neckGroup(V0,g,X,K,wl,fx,A){const S=spineOf(g,X,wl),fm=S[Math.round(S.length*.8)]||S[S.length-1],front=V0.F(fm.f)>=0,h=g.h;
  const neck=()=>tubeDraw(V0,S,K,wl,{belly:1,vl:h.vl,glowAll:h.glowAll,sp:2,sp0:2,spH:3,fx,zw:.46});
  if(front){hoodDraw(V0,S,g,K,wl,A);neck();headDraw(V0,g,K,wl,fx,A)}else{headDraw(V0,g,K,wl,fx,A);neck();hoodDraw(V0,S,g,K,wl,A)}}
// the back of the body: a long low hump in the black water (only its top shows), dark blotches, the zigzag down its spine with the acid
// dots, a row of spines (they rise in the entrance), the weed draped over it, the foam at the water line
const BLOT=[[.6,.5,7],[2.3,.45,8],[3.5,.6,7],[4.6,.4,8],[5.6,.55,6],[1.4,.25,6]];
const BWEED=[[2.2,.7,0],[2.75,1.15,1.7],[3.3,.55,3.1],[3.7,1.0,4.4],[4.25,.62,2.2]];
function bodyDraw(V0,X,A,K,wl,fx){const{P,F}=V0,br=1+(A.br||0),Rd=[HB.r[0]*br,HB.r[1]*br,HB.r[2]*(1+(A.br||0)*1.3)],at=m=>X.T(ellAt(HB.c,Rd,null,m)),nAt=m=>X.Rd(ellN(Rd,null,m)),sph=(az,el)=>[Math.cos(az)*Math.cos(el),Math.sin(az)*Math.cos(el),Math.sin(el)];
  const rows=ellRows(HB.c,Rd,AXES,5,18,-.8,Math.PI/2).map(r=>r.map(X.T)),H=svc(V0,rows,K.sc,wl,{lw:2.8});if(!H)return;
  ctx.save();ctx.clip(H.path);
  ctx.fillStyle=`rgba(${rgbS(K.sc.d)},.38)`;for(const[az,el,r] of BLOT){const m=sph(az,el);if(F(nAt(m))<.15||at(m)[2]<wl)continue;ctx.beginPath();discP(V0,at(m),nAt(m),r,r*.7);ctx.fill()}
  {const runs=[],dots=[];let r=[];for(let i=0;i<=14;i++){const el=lerp(.5,2.8,i/14),sg=i%2?1:-1,m=nrm([Math.cos(el),sg*.15,Math.sin(el)]);if(F(nAt(m))<.05||at(m)[2]<wl+1){if(r.length>1)runs.push(r);r=[];continue}const s=P(at(m));r.push(s);if(i%2)dots.push(s)}
    if(r.length>1)runs.push(r);ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=K.zig;ctx.lineWidth=7;for(const rr of runs){line(rr);ctx.stroke()}}
  const bb=bbox(H),g=ctx.createLinearGradient(0,bb[1],0,bb[3]);g.addColorStop(0,'rgba(4,10,8,0)');g.addColorStop(.55,'rgba(4,10,8,0)');g.addColorStop(1,'rgba(2,8,6,.6)');ctx.fillStyle=g;ctx.fillRect(bb[0]-2,bb[1],bb[2]-bb[0]+4,bb[3]-bb[1]+2);
  ctx.restore();rimK(H,rimA(K)*1.1,K.rim);
  // the spines down its spine
  {const pa=new Path2D();let n=0;const up=A.finUp==null?1:A.finUp;for(let i=0;i<7;i++){const el=lerp(.8,2.55,i/6),m=[Math.cos(el),0,Math.sin(el)],nn=nAt(m);if(F(nn)<-.3)continue;const b=at(m);if(b[2]<wl)continue;
      const hh=(6.2-1.6*Math.abs(i-3)/3)*up+(A.fin||0)*8;if(hh<.4)continue;const bk=X.Rd([-Math.sin(el),0,Math.cos(el)]),T=P(add(add(b,mul(nn,hh)),mul(bk,hh*.65))),B1=P(add(b,mul(bk,-hh*.45))),B2=P(add(b,mul(bk,hh*.55)));
      pa.moveTo(B1[0],B1[1]);pa.lineTo(T[0],T[1]);pa.lineTo(B2[0],B2[1]);pa.closePath();n++}
    if(n){ctx.lineJoin='round';ctx.fillStyle=K.spine.d;ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke(pa)}}
  // the weed draped over its back, down to the water (it sways a little)
  {const t=A.t||0;for(const[az,el0,ph] of BWEED){const mm=sph(az,el0*.6);if(F(nAt(mm))<-.05)continue;const pts=[];for(let j=0;j<=6;j++){const el=lerp(el0,-.2,j/6),sw=Math.sin(t*1.3+ph+j*.9)*.05*j/6,m=sph(az+sw+.04*Math.sin(j*1.7+ph),el),q=add(at(m),mul(nAt(m),1.2));if(q[2]<wl){pts.push([q[0],q[1],wl]);break}pts.push(q)}
      if(pts.length<2)continue;const sp=pts.map(q=>P(q));ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=3.6;line(sp);ctx.stroke();ctx.strokeStyle=K.weed.b;ctx.lineWidth=2;line(sp);ctx.stroke();
      ctx.strokeStyle=K.weed.l;ctx.lineWidth=.9;line(sp.map(q=>[q[0]-.6,q[1]-.7]));ctx.stroke()}}
  // the foam along the water line, the part toward us
  if(fx){const zz=(wl-(HB.c[2]+A.B[2]))/Rd[2];if(Math.abs(zz)<.95){const rr=Math.sqrt(1-zz*zz),run2=[];let r=[];for(let j=0;j<=24;j++){const t=j/24*TAU,m=[Math.cos(t)*rr,Math.sin(t)*rr,zz],nm=X.Rd(ellN(Rd,null,m));
      if(F(nm)>.05){const c=X.T(ellAt(HB.c,Rd,null,m));r.push(P([c[0],c[1],wl]))}else if(r.length){run2.push(r);r=[]}}if(r.length)run2.push(r);
    ctx.strokeStyle=`rgba(${rgbS(K.foam)},.55)`;ctx.lineWidth=1.8;ctx.lineCap='round';for(const q of run2)if(q.length>1){line(q.map((s,j)=>[s[0],s[1]+.8*Math.sin(j*1.7+(A.t||0)*4)]));ctx.stroke()}}}}
const KCC={};function KC(K){const id=K.k2+'|'+(K.sc.b);return KCC[id]||(KCC[id]=Object.assign({},K,{sc:mixT(K.sc,T3(K.sc.b,K.sc.d,'#050c09'),.42)}))}
// a coil of the body that arches out of the water in front (A.hands[i].p: its top, as the moves move it; tap: it twitches; curl: tighter),
// with its zigzag, its spines and a strand of weed
function coilDraw(V0,X,A,i,K,wl,fx){const{P}=V0,sd=i?1:-1,hd=A.hands[i],tp=hd.tap?Math.max(hd.tap[0],hd.tap[1],hd.tap[2]):0,cu=hd.curl||0;
  const S0=X.T([12+8*cu,sd*26,-20]),E0=X.T([84-8*cu,sd*(66-8*cu),-20]),ap=X.T(add(hd.p,[-4,sd*3,13+tp+6*cu])),Cc=sub(mul(ap,2),mul(add(S0,E0),.5)),N=11,pts=[];
  for(let j=0;j<=N;j++){const t=j/N,u=1-t;pts.push(add(add(mul(S0,u*u),mul(Cc,2*u*t)),mul(E0,t*t)))}
  const S=frames(pts,s=>lerp(9,7.6,s),[0,0,-1]);tubeDraw(V0,S,KC(K),wl,{sp:2,sp0:1,spH:3.4,fx,zw:.55,simple:1});
  // a strand of weed hanging from its top
  const q=S[N>>1];if(q.c[2]>wl+4&&V0.F(mul(q.f,-1))>-.2){const t=A.t||0,a=add(q.c,add(mul(q.f,-q.r*.6),mul(q.v,sd*q.r*.5))),sw=Math.sin(t*1.6+i*2)*1.6,b=add(a,add(mul(q.v,sd*(5+sw)),[0,0,-6])),c=[b[0]+sw,b[1],Math.max(wl,a[2]-16)],sp=[a,b,c].map(x=>P(x));
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=4;line(sp);ctx.stroke();ctx.strokeStyle=K.weed.b;ctx.lineWidth=2.3;line(sp);ctx.stroke()}}
// the tail behind: it curls out of the water, spines down its back and a bone spike at its tip; in the call it rises and beckons to you
function tailDraw(V0,X,A,K,wl,fx){const cu=A.tail||0,bk=A.beck||0,bw=A.beckW||0;
  const p0=X.T([-50,14,-16]),p1=X.T([-62,20,-4]),p2=X.T([-70+2*cu,24+5*cu,8+16*bk]),p3=X.T([-74+4*cu-8*bk,28+9*cu,15-2*Math.abs(cu)+30*bk]),N=8,pts=[];
  for(let j=0;j<=N;j++){const t=j/N,u=1-t;pts.push(add(add(mul(p0,u*u*u),mul(p1,3*u*u*t)),add(mul(p2,3*u*t*t),mul(p3,t*t*t))))}
  if(bk>0)for(let j=5;j<=N;j++){const f=(j-5)/(N-5),c=bk*(.55+.45*bw)*f*f;pts[j]=add(pts[j],X.Rd([12*c,0,-9*c]))}
  const S=frames(pts,s=>lerp(8.4,2.4,s),[0,0,-1]);if(S[N].c[2]<wl)return;
  tubeDraw(V0,S,K,wl,{sp:2,sp0:2,spH:2.6,fx,zw:.5,simple:1});
  const a=S[N].c,d=S[N].t;hornDraw(V0,add(a,mul(d,-1.2)),d,[0,0,1.2],7.5,2.5,K)}
// the water: its own pool (also its shadow), black as pitch, an oily sheen on the far side, the scum at its rim, the rings of its breath,
// dead lilies bobbing (one with a pale flower), the reflections of the eyes, the eyes under the water
const LILY=[[-46,50,7.5,1],[54,-44,6.5,0],[-64,-20,6,0],[30,62,5.5,0]],SCUM=[[3.4,3.56,.94],[4.2,4.42,.95],[4.95,5.05,.93],[5.6,5.82,.95]];
function waterDraw(V0,A,K,G,fx,o){const{P}=V0,wl=A.wz,c=P([0,0,wl]),rx=A.wr,ry=A.wr*.55*KR(),t0=A.t||0;
  ctx.fillStyle='rgba(4,8,8,.55)';ctx.beginPath();ctx.ellipse(c[0],c[1]+2,rx+4,ry+3,0,0,TAU);ctx.fill();
  const g=ctx.createRadialGradient(c[0],c[1]-ry*.3,2,c[0],c[1],rx);g.addColorStop(0,K.w0);g.addColorStop(.62,K.w1);g.addColorStop(1,K.w2);
  ctx.beginPath();ctx.ellipse(c[0],c[1],rx,ry,0,0,TAU);ctx.fillStyle=g;ctx.fill();
  {const g2=ctx.createLinearGradient(0,c[1]-ry,0,c[1]+ry);g2.addColorStop(0,'rgba(255,255,255,.04)');g2.addColorStop(.55,'rgba(0,0,0,0)');g2.addColorStop(1,'rgba(0,0,0,.3)');ctx.fillStyle=g2;ctx.fill()}
  if(A.dark>0){ctx.fillStyle=`rgba(2,4,4,${.6*A.dark})`;ctx.fill()}
  ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
  ctx.save();ctx.beginPath();ctx.ellipse(c[0],c[1],rx,ry,0,0,TAU);ctx.clip();
  // the scum along the rim, the oily sheen
  ctx.strokeStyle=`rgba(${rgbS(K.foam)},.42)`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(c[0],c[1]-.6,rx*.95,ry*.92,0,Math.PI*1.04,Math.PI*1.96);ctx.stroke();
  ctx.fillStyle=`rgba(${rgbS(K.foam)},.55)`;for(const[a0,a1,k0] of SCUM){const a=(a0+a1)/2,w=(a1-a0)*rx*.5;ctx.beginPath();ctx.ellipse(c[0]+Math.cos(a)*rx*k0,c[1]-.6+Math.sin(a)*ry*k0,w,1.4+w*.12,0,0,TAU);ctx.fill()}
  if(!LOWFX){ctx.lineWidth=4;ctx.strokeStyle='rgba(160,110,210,.1)';ctx.beginPath();ctx.ellipse(c[0]-rx*.08,c[1],rx*.6,ry*.58,0,Math.PI*1.12,Math.PI*1.62);ctx.stroke();
    ctx.strokeStyle='rgba(110,210,160,.09)';ctx.beginPath();ctx.ellipse(c[0]+rx*.05,c[1],rx*.76,ry*.74,0,Math.PI*1.3,Math.PI*1.86);ctx.stroke()}
  // the rings of its breath, the swirl, the wake, the glow, the bubbles
  for(const r of A.rings){const R=r.r0+(rx+4-r.r0)*r.t;ctx.strokeStyle=`rgba(${rgbS(K.foam)},${.3*(1-r.t)})`;ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(c[0],c[1],R,R*.55*KR(),0,0,TAU);ctx.stroke()}
  if(A.swirl>0)for(let i=0;i<4;i++){const a0=t0*1.4+i*Math.PI/2,R=rx*(.35+.13*i);ctx.strokeStyle=`rgba(${rgbS(K.foam)},${.28*A.swirl})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(c[0],c[1],R,R*.55*KR(),0,a0,a0+1.6);ctx.stroke()}
  if(A.wake>0){ctx.strokeStyle=`rgba(${rgbS(K.foam)},.3)`;ctx.lineWidth=1.4;for(const sd of[-1,1]){const a=P([62,0,wl]),b=P([30,sd*44,wl]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}}
  if(A.wglow>0){if(!LOWFX)ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${K.wG},${(LOWFX?.2:.3)*Math.min(1,A.wglow)})`;ctx.fillRect(c[0]-rx,c[1]-ry,rx*2,ry*2);ctx.globalCompositeOperation='source-over'}
  if(A.boil>0&&fx)for(let i=0;i<9;i++){const t=(t0*1.7+i*.37)%1,a=i*2.4,rr=rx*(.2+.65*((i*.618)%1)),q=[c[0]+Math.cos(a)*rr,c[1]+Math.sin(a)*rr*.55];ctx.strokeStyle=`rgba(${rgbS(K.bub)},${.6*A.boil*(1-t)})`;ctx.lineWidth=1;ball(q,1+t*3.5);ctx.stroke()}
  // a low fog drifting on the water
  if(!LOWFX&&fx){ctx.fillStyle=`rgba(${rgbS(K.foam)},.07)`;for(let i=0;i<4;i++){const a=t0*.25+i*1.6,q=[c[0]+Math.cos(a)*rx*.55,c[1]+Math.sin(a*1.3)*ry*.45];ctx.beginPath();ctx.ellipse(q[0],q[1],20+4*Math.sin(t0+i),7,0,0,TAU);ctx.fill()}}
  // the dead lilies
  for(let i=0;i<LILY.length;i++){const[lx,ly,r,fl]=LILY[i];if(Math.hypot(lx,ly)>rx-r-3)continue;const q=P([lx,ly,wl]),bob=LOWFX?0:.7*Math.sin(t0*2.1+i*1.9),a0=i*1.7+.4,sy=.55*KR(),qy=q[1]+bob;
    ctx.beginPath();ctx.moveTo(q[0],qy);ctx.ellipse(q[0],qy,r,r*sy,0,a0+.5,a0+TAU-.1);ctx.closePath();ctx.fillStyle=grad3([q[0]-r,qy-r*sy,q[0]+r,qy+r*sy],K.lily);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
    ctx.strokeStyle=`rgba(${rgbS(K.lily.d)},.6)`;ctx.lineWidth=.7;ctx.beginPath();for(const da of[1.4,2.6,3.8,5]){ctx.moveTo(q[0],qy);ctx.lineTo(q[0]+Math.cos(a0+da)*r*.85,qy+Math.sin(a0+da)*r*sy*.85)}ctx.stroke();
    if(fl){const f=[q[0]+r*.15,qy-1.4];ctx.fillStyle=K.flower;ctx.strokeStyle=INK;ctx.lineWidth=.7;for(let j=0;j<5;j++){const an=j/5*TAU+.3;ctx.beginPath();ctx.ellipse(f[0]+Math.cos(an)*1.9,f[1]+Math.sin(an)*1.1,1.6,.95,an,0,TAU);ctx.fill();ctx.stroke()}
      ctx.fillStyle='#b3a46a';ball(f,1);ctx.fill()}}
  // the eyes under the water (the entrance, the Agguato): six gold eyes and the three slits, and the reflections of the eyes that are up
  for(const gg of G){const hp=P([gg.hc[0],gg.hc[1],wl]);
    if(A.eyesU>0){for(const sd of[-1,1]){const q=[hp[0]+sd*5*gg.k,hp[1]-2];if(!LOWFX)shine(K.eyeG,q[0],q[1],10,.6*A.eyesU);ctx.fillStyle=`rgba(${K.eyeG},${.9*A.eyesU})`;ctx.beginPath();ctx.ellipse(q[0],q[1],2.8*gg.k,1.3*gg.k,0,0,TAU);ctx.fill();
      ctx.fillStyle=`rgba(12,8,4,${.85*A.eyesU})`;ctx.fillRect(q[0]-.45,q[1]-1.2,.9,2.4)}}
    if(A.gemsU>0){const q=[hp[0],hp[1]-7*gg.k];if(!LOWFX)shine(K.gemG,q[0],q[1],8,.4*A.gemsU);ctx.fillStyle=`rgba(${K.gemG},${.7*A.gemsU})`;ctx.beginPath();ctx.ellipse(q[0],q[1],.9,2.4,0,0,TAU);ctx.fill()}
    else if(!LOWFX&&gg.hc[2]>wl+10)shine(K.eyeG,hp[0],hp[1],13*gg.k,.14)}
  if(A.tips>0){const q=P([28,0,wl]);ctx.fillStyle=`rgba(${rgbS(K.spot)},${.45*A.tips})`;for(const dx of[-7,7]){ctx.beginPath();ctx.ellipse(q[0]+dx,q[1]-1,2,1.2,0,0,TAU);ctx.fill()}}
  ctx.restore()}
// the effects that sit over everything: splashes, chips of stone, bubbles, the wave, the fireflies of the defeat
function fxDraw(V0,A,K,G,wl){const{P}=V0;
  for(const f of A.fx){const t=cl(f.t,0,1);let at=f.at;if(f.head!=null){const gg=G[f.head];at=[gg.hc[0],gg.hc[1],0]}if(!at)continue;const base=[at[0],at[1],wl];
    if(f.k==='splash'){const q=P(base),r=f.r||12,n=f.n||6,wc=rgbS(cmix(K.foam,'#ffffff',.45));ctx.strokeStyle=`rgba(${wc},${.6*(1-t)})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(q[0],q[1],r*(.4+t),r*(.4+t)*.55,0,0,TAU);ctx.stroke();
      if(!LOWFX)for(let i=0;i<n;i++){const a=i/n*TAU+.3,d=r*.5*t+2,z=Math.sin(t*Math.PI)*(14+r*.5)*(.7+.3*((i*.37)%1)),s=P([base[0]+Math.cos(a)*d,base[1]+Math.sin(a)*d,wl+z]);ctx.fillStyle=`rgba(${wc},${.8*(1-t*t)})`;ball(s,1.5+(1-t));ctx.fill()}}
    else if(f.k==='ring'){const q=P(base);ctx.strokeStyle=`rgba(${K.venG},${.6*(1-t)})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(q[0],q[1],3+8*t,(3+8*t)*.55,0,0,TAU);ctx.stroke()}
    else if(f.k==='chips'){const q=P([at[0],at[1],0]),n=f.big?9:6;C3K.dust(V0,[at[0],at[1],0],t,LOWFX?3:6,f.big?14:10,'196,184,160',.5);
      ctx.fillStyle='#8a8478';ctx.strokeStyle=INK;ctx.lineWidth=.8;for(let i=0;i<n;i++){const a=i/n*TAU+.7,d=(f.big?22:16)*t,z=Math.sin(Math.min(1,t*1.3)*Math.PI)*(f.big?18:12),s=P([at[0]+Math.cos(a)*d,at[1]+Math.sin(a)*d,z]);ctx.beginPath();ctx.rect(s[0]-1.3,s[1]-1.3,2.6,2.6);ctx.fill();ctx.stroke()}}
    else if(f.k==='bubble'){const q=P([at[0],at[1],wl+t*6]);ctx.strokeStyle=`rgba(${rgbS(K.bub)},${.8*(1-t)})`;ctx.lineWidth=1.2;ball(q,2+t*3);ctx.stroke()}
    else if(f.k==='wave'){const q=P([0,0,wl]),R=60+30*t;ctx.strokeStyle=`rgba(${rgbS(K.foam)},${.5*(1-t)})`;ctx.lineWidth=2.4*(1-t)+.6;ctx.beginPath();ctx.ellipse(q[0],q[1],R,R*.55,0,0,TAU);ctx.stroke()}}
  if(A.flies>=0){const n=LOWFX?3:7;for(let i=0;i<n;i++){const u=cl(A.flies*1.25-i*.04,0,1);if(u<=0)continue;const a=i*2.4,r=20+(i*13)%40,q=P([Math.cos(a)*r,Math.sin(a)*r,wl+u*70+6*Math.sin(u*9+i)]),al=Math.sin(u*Math.PI);
    if(!LOWFX)shine('200,255,150',q[0],q[1],8,.6*al);ctx.fillStyle=`rgba(230,255,190,${al})`;ball(q,1.5);ctx.fill()}}}

// ------------------------------------------------------------------ the model
function hydra2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D}=V0,A=hPose(anim,p,o,face),K=pal(A.k2,A.clr),X=frame(A,0),fx=fxOn(o),wl=A.wz;
  A.t=p*(N3.meta.hydra2.dur[anim]||1);const G=rigOf(A,X,face,o);G.forEach(g=>{g.h.glowAll=A.glowAll});
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  L.add(-1e9,()=>waterDraw(V0,A,K,G,fx,o));
  L.add(D(X.T([-64,22,2])),()=>tailDraw(V0,X,A,K,wl,fx));
  for(const i of[0,1])L.add(D(X.T(HAND[i])),()=>coilDraw(V0,X,A,i,K,wl,fx));
  L.add(D(X.T([-14,0,10])),()=>bodyDraw(V0,X,A,K,wl,fx));
  G.forEach(g=>L.add(D(X.T(g.n.root))+.01*D(X.T(g.n.head)),()=>neckGroup(V0,g,X,K,wl,fx,A)));
  run(L);fxDraw(V0,A,K,G,wl);
  if(A.flashW>0&&!LOWFX){const q=P([10,0,50]);shine('255,255,250',q[0],q[1],90,.5*A.flashW)}
  if(A.flashV>0&&!LOWFX)for(const g of G){const q=P(add(g.hc,mul(g.HF.w,9*g.k)));shine(K.tG,q[0],q[1],40,.8*A.flashV)}
  if(A.fanRings>=0&&!LOWFX)for(const g of G){const q=P(add(g.hc,add(mul(g.HF.u,-10*g.k),mul(g.HF.w,6*g.k)))),r=8+32*A.fanRings;ctx.strokeStyle=`rgba(${K.tG},${.55*(1-A.fanRings)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(q[0],q[1],r,r*.7,0,0,TAU);ctx.stroke()}
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
  return G.map(g=>{const{hc,HF,k,h}=g,E=HE.map(e=>({c:mul(e.c,k),r:mul(e.r,k)})),Hd=splitHead(hc,HF,E,MZ*k,h.open*JA,1,6),m=add(lerp3(Hd.lip(0,0),Hd.lip(0,1),.5),mul(HF.u,2*k)),
    toW=d=>add(hc,add(add(mul(HF.u,d[0]),mul(HF.v,d[1])),mul(HF.w,d[2]))),e=toW([5*k,0,5.5*k]),gg=toW([1*k,0,9.6*k]);
    return{m:V0.P(m),f:V0.P([m[0],m[1],0]),e:V0.P(e),g:V0.P(gg),up:hc[2]>wl-4,z:m[2]}})};
// a head that bursts out of a stain of black water ('burst', 1.6 s): the stain opens, two eyes under it, the head shoots up with its mouth
// wide and its hood open, the jaws snap (.60), it sways and looks at you, then it sinks back with a gulp. o.who (-1, 0, 1), o.p2; o.part
// 'stain' (only the water on the floor, under the hero) or 'head' (only what comes out of it, over him)
N3.hydra2Head=function(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P}=V0,K=pal(o.p2?1:0,0),who=o.who==null?0:o.who,n=HN[who+1],k=n.k,fx=fxOn(o);
  const rS=24*sstep(0,.2,p)*(1-sstep(.9,1,p)),out=sstep(.55,.6,p)*(1-sstep(.875,.96,p)),snap=sstep(.59,.61,p),sway=rise(p,.6,.66,.84,.875);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  if(rS>.5&&o.part!=='head'){const g=ctx.createRadialGradient(0,-rS*.15,1,0,0,rS);g.addColorStop(0,'#030608');g.addColorStop(.75,K.w0);g.addColorStop(1,K.w2);ctx.beginPath();ctx.ellipse(0,0,rS,rS*.55,0,0,TAU);ctx.fillStyle=g;ctx.fill();
    ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke();ctx.strokeStyle=`rgba(${rgbS(K.foam)},.55)`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,-.6,rS*.9,rS*.48,0,Math.PI*1.1,Math.PI*1.9);ctx.stroke();
    if(out<.2){const eo=sstep(.06,.1,p)*(1-sstep(.55,.57,p))*blink(p,.12,.05);for(const sd of[-1,1]){const q=[sd*5*k,-2];if(!LOWFX)shine(K.eyeG,q[0],q[1],8,.55*eo);ctx.fillStyle=`rgba(${K.eyeG},${.9*eo})`;ctx.beginPath();ctx.ellipse(q[0],q[1],2.6*k,1.2*k,0,0,TAU);ctx.fill();
      ctx.fillStyle=`rgba(12,8,4,${.85*eo})`;ctx.fillRect(q[0]-.45,q[1]-1.1,.9,2.2)}}
    if(fx)for(let i=0;i<5;i++){const t=(p*4+i*.29)%1,a=i*2.3,q=[Math.cos(a)*rS*.55,Math.sin(a)*rS*.3];ctx.strokeStyle=`rgba(${rgbS(K.bub)},${.6*(1-t)*sstep(.15,.3,p)})`;ctx.lineWidth=1;ball(q,.8+t*2.4);ctx.stroke()}}
  if(out>.01&&o.part!=='stain'){const z=lerp(-30,44,out),hc=[0,4*sway*Math.sin(p*TAU*2.5),z+8],pi=lerp(.9,-.25,snap)+.1*sway*Math.sin(p*TAU*3),yw=.25*sway*Math.sin(p*TAU*2);
    const hu=[Math.cos(pi)*Math.cos(yw),Math.cos(pi)*Math.sin(yw),Math.sin(pi)],hv=nrm(cross([0,0,1],hu)),hw=cross(hu,hv),h=Object.assign(hd0(n,!!o.p2),{open:p<.6?.95:.15+.35*rise(p,.66,.7,.76,.8),fan:1,ft:1,wing:p<.6?1:rise(p,.66,.7,.76,.8),gem:.5,drip:sway>0?((p-.6)/.2)%1:-1});
    const g={i:0,s:n.s,k,hc,HF:{u:hu,v:hv,w:hw},root:[0,0,-14],h,n},X=frame({},0);
    ctx.save();ctx.beginPath();ctx.rect(-70,-220,140,220+.5);ctx.clip();neckGroup(V0,g,X,K,0,fx,{memLit:o.p2?1:0,t:p*1.6});ctx.restore();
    if(fx&&p>=.55&&p<.75){const t=(p-.55)/.2;ctx.fillStyle=`rgba(${rgbS(K.foam)},${.5*(1-t)})`;for(let i=0;i<8;i++){const a=i/8*TAU,q=P([Math.cos(a)*(6+10*t),Math.sin(a)*(6+10*t),Math.sin(t*Math.PI)*30*(.6+.4*(i%2))]);ball(q,1.8);ctx.fill()}}}
  ctx.restore()};
// under the floor in the Tuffo: a dark ripple with six gold eyes in three pairs barely seen and the three slits, a V wake back along a
N3.hydra2Under=function(x,y,a,p,sc,o){sc=sc||1;o=o||{};const K=pal(o.p2?1:0,0),ca=Math.cos(a),sa=Math.sin(a);ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  const w=1+.08*Math.sin(p*TAU);ctx.fillStyle='rgba(4,8,8,.6)';ctx.beginPath();ctx.ellipse(0,0,30*w,14*w,0,0,TAU);ctx.fill();ctx.strokeStyle=`rgba(${rgbS(K.foam)},.35)`;ctx.lineWidth=1.3;ctx.stroke();
  ctx.strokeStyle=`rgba(${rgbS(K.foam)},.3)`;ctx.lineWidth=1.4;for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(-ca*24-sa*sd*4,-sa*24*.55+ca*sd*4*.55);ctx.lineTo(-ca*60-sa*sd*20,(-sa*60+ca*sd*20)*.55);ctx.stroke()}
  for(const[gx,gy] of[[0,-6],[-10,3],[10,3]]){for(const sd of[-1,1]){const q=[gx+sd*2.6,gy];if(!LOWFX)shine(K.eyeG,q[0],q[1],6,.45);ctx.fillStyle=`rgba(${K.eyeG},.8)`;ctx.beginPath();ctx.ellipse(q[0],q[1],1.6,.8,0,0,TAU);ctx.fill();
      ctx.fillStyle='rgba(10,6,2,.85)';ctx.fillRect(q[0]-.3,q[1]-.7,.6,1.4)}
    ctx.fillStyle=`rgba(${K.gemG},.5)`;ctx.beginPath();ctx.ellipse(gx,gy-3,.6,1.6,0,0,TAU);ctx.fill()}
  if(!LOWFX)for(let i=0;i<4;i++){const t=(p+i*.25)%1,q=[Math.cos(i*1.7)*16-ca*t*20,Math.sin(i*1.7)*7-sa*t*11];ctx.strokeStyle=`rgba(${rgbS(K.bub)},${.6*(1-t)})`;ctx.lineWidth=1;ball(q,1+t*2);ctx.stroke()}
  ctx.restore()};
// the black water that opens on the floor where it comes up: k 0..1, the radius up to o.r (74), a scum rim, three pairs of eyes opening
N3.hydra2Stain=function(x,y,k,sc,o){sc=sc||1;o=o||{};const K=pal(o.p2?1:0,0),R=(o.r||74)*ez(cl(k,0,1));if(R<1)return;ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  const g=ctx.createRadialGradient(0,-R*.15,1,0,0,R);g.addColorStop(0,'#020507');g.addColorStop(.7,K.w0);g.addColorStop(1,K.w2);ctx.beginPath();ctx.ellipse(0,0,R,R*.55,0,0,TAU);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle=`rgba(${rgbS(K.foam)},.5)`;ctx.lineWidth=1.3;ctx.setLineDash([7,4,2,4]);ctx.beginPath();ctx.ellipse(0,-1,R*.92,R*.5,0,Math.PI*1.08,Math.PI*1.92);ctx.stroke();ctx.setLineDash([]);
  const gk=sstep(.3,.8,k);for(const[gx,gy] of[[0,-10],[-16,6],[16,6]]){for(const sd of[-1,1]){const q=[gx*R/74+sd*3.4,gy*R/74];if(!LOWFX)shine(K.eyeG,q[0],q[1],8,.55*gk);ctx.fillStyle=`rgba(${K.eyeG},${.9*gk})`;
      ctx.beginPath();ctx.ellipse(q[0],q[1],2.2,.2+.9*gk,0,0,TAU);ctx.fill();ctx.fillStyle=`rgba(10,6,2,${.85*gk})`;ctx.fillRect(q[0]-.35,q[1]-1,.7,2)}}
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
