// IL CERVO D'AURORA rifatto: «il Re della Vetta» (Denis, 15 ottobre: «rivisita tutti i boss, rendili più creepy e fatti meglio sia da
// fermi che nelle animazioni», «un po' più cupi», «falli possenti, belli, fighi, che diano timore nello sfidarli»; 16 ottobre, dopo il
// Golem: «sì, fai gli altri 12»). Design: docs/boss-classici-design/stag.md. L'ultimo boss del gioco è il re della cima del mondo: un
// cervo del nord antico e immenso (126 in punta alle corna, il più alto di tutti), del colore del cielo di notte dove nasce l'aurora, col
// collare bianco di brina, le calze bianche e una criniera di ghiaccioli sul collo. In testa porta la sua corona: corna di cristallo vivo
// con la pala in cima come i caribù, attaccate da due rosette d'oro antico, e dentro scorre l'aurora. È lento e solenne: ti guarda
// dall'alto con le palpebre pesanti sotto due sopracciglia di brina a V. Prima di ogni colpo l'aurora nasce dalle rosette e corre una
// punta alla volta nel pezzo che colpirà (è il suo avviso, come il cuore del Golem). A metà vita «l'aurora si accende»: manto violaceo
// con le costellazioni, corna più lunghe con la pala a cinque punte e le fiamme d'aurora, occhi viola. Quando perde si inchina all'eroe,
// lascia la corona nel muschio e torna aurora. Resta della Classica: forme robuste da giocattolo, colori pieni, occhi con la lucina, due
// zannette di ghiaccio, niente sangue, ferite, cuciture né teschi.
// Metodo dello spaventapasseri: scheletro 3D proiettato con V(face), zampe a due ossa con ik (il punto alto scivola col passo), ordine di
// disegno dalla posa di riposo, la testa con la sua telecamera (resta puntata sull'eroe mentre il corpo ondeggia), le corna in tabelle
// fisse nello spazio della testa; dipinto come la lanterna (tre toni, bordo caldo in alto a sinistra e controluce d'aurora dall'altra
// parte, glowTop, bagliori morbidi solo sulle punte accese e sugli occhi). Unità del modello a sc 1: x avanti, y a sinistra del cervo, z su.
// Mosse: idle, walk, hit, prep / charge / stuck / recoil / prep2 / skid (Carica del Re), sweep (Spazzata della Corona), aurora (Tende
// d'Aurora), stomp (Zoccolata del Re), call (Richiamo della Mandria), crown (Corona Boreale, fase 2), rage (l'aurora si accende), taunt
// (Presa in giro), enter (Entrata), die (Sconfitta).
// Opzioni: o.p2 (seconda fase), o.z (altezza data dal gioco), o.noFx (niente polvere, fiato, gocce, scia), o.ghost (0..1: tutto di luce
// d'aurora, gli spiriti della mandria), o.see (0..1: corona e criniera trasparenti fino a .5 quando l'eroe gli passa dietro), o.dir (±1:
// il verso della Corona Boreale, +1 la testa gira verso la sua sinistra, +y). Con LOWFX niente gocce né fili di luce, fiamme, controluce,
// scia, fiato né licheni che dondolano; stelle ferme senza alone; la vena è una riga chiara; bagliori solo negli occhi; il fantasma è una
// sagoma piena.
// Scelte dove il design lasciava margine: la pala di cristallo un po' più grande (raggio 9,5 invece di 8) e girata davanti, con le sue punte
// nel suo piano, perché da davanti la corona si legga come corona e non come due rami; P2 e P3 un poco più lunghe e i cristalli più tozzi
// (punte a 129 da fermo, 132 nella fase 2, 163 nell'impennata; larga 123 e 135); nella fase 2 i fili di luce scendono dalle lance fino
// alla neve nelle mosse calme (fermo, cammina, presa in giro). Ogni tremolio sta sotto i 5,5 Hz del modello (sotto gli 8 Hz anche
// nell'arena 12, dove il boss va 1,38 volte).
// Disegni per il gioco con lo stesso aspetto: N3.stagShard (la scheggia di cristallo), N3.stagSpike (la punta di ghiaccio dell'onda),
// N3.stagSpirit (lo spirito della mandria), N3.stagCrown (la corona ritta sul cumulo fiorito) e N3.stagInfo (i momenti delle mosse); gli
// stessi anche come N3.stag2Shard ecc. Modello 'stag2': nel gioco prende il nome 'stag' (src/js/89-cervo-nuovo.js).
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,run,cmix,poly,bbox,keys,sstep,hitK,frame,ellAt,ellN,AXES,parts,reg,shine,chull,ik,stepper,blink,glowTop,rgba}=C;
const{trem,fxOn,cheat,pls,rise,flash,ellCap,fadeDraw,grad3,ellSil,hullE,smoothP,limbGrad,ringS,frm,T3,mixT,mixRgb}=C3K;

// ------------------------------------------------------------------ helpers
// rotations with the frame's conventions: yaw (the front goes to +y > 0), pitch (the nose goes down > 0), roll (the top goes to +y > 0)
const yawR=(v,a)=>{const c=Math.cos(a),s=Math.sin(a);return[v[0]*c-v[1]*s,v[0]*s+v[1]*c,v[2]]};
const pitR=(v,a)=>{const c=Math.cos(a),s=Math.sin(a);return[v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c]};
const rolR=(v,a)=>{const c=Math.cos(a),s=Math.sin(a);return[v[0],v[1]*c+v[2]*s,-v[1]*s+v[2]*c]};
// a pulse on a cycle (it wraps round p = 1), the cycles since c, a sharp nod (down in a, back in b)
const pw=(p,c,w)=>{const d=Math.abs(((p-c)%1+1.5)%1-.5);return d>=w/2?0:.5+.5*Math.cos(d/(w/2)*Math.PI)};
const cyc=(p,c)=>((p-c)%1+1)%1;
const nodK=(p,c,a,b)=>{const d=p-c;return d<0||d>=a+b?0:d<a?ez(d/a):1-ez((d-a)/b)};
// a capsule (two screen circles) and a ball into a path (ctx or Path2D), all with the same winding: their union fills
function capsP(pa,a,ra,b,rb){ra=Math.max(.2,ra);rb=Math.max(.2,rb);const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);
  if(d<=Math.abs(ra-rb)+.01){const q=ra>=rb?a:b,r=Math.max(ra,rb);pa.moveTo(q[0]+r,q[1]);pa.arc(q[0],q[1],r,0,TAU);return}
  const an=Math.atan2(dy,dx),f=Math.acos(cl((ra-rb)/d,-1,1));pa.moveTo(a[0]+Math.cos(an+f)*ra,a[1]+Math.sin(an+f)*ra);pa.arc(a[0],a[1],ra,an+f,an+TAU-f);pa.arc(b[0],b[1],rb,an-f,an+f);pa.closePath()}
const ballP=(pa,q,r)=>{r=Math.max(.05,r);pa.moveTo(q[0]+r,q[1]);pa.arc(q[0],q[1],r,0,TAU)};
// a leaf, a lock of fur, an ear: an almond from b along d (length L, half width W across s), the tip bent along n; into the path pa
function leafP(pa,P,b,d,s,L,W,n,bend){const bn=bend||0,tip=n?add(add(b,mul(d,L)),mul(n,bn*L*.4)):add(b,mul(d,L)),mid=n?add(add(b,mul(d,L*.48)),mul(n,bn*L*.1)):add(b,mul(d,L*.48));
  const B=P(b),T=P(tip),M1=P(add(mid,mul(s,W*2))),M2=P(add(mid,mul(s,-W*2)));pa.moveTo(B[0],B[1]);pa.quadraticCurveTo(M1[0],M1[1],T[0],T[1]);pa.quadraticCurveTo(M2[0],M2[1],B[0],B[1]);pa.closePath();return[B,T,M1,M2]}
// a path stroked twice as wide in ink, then filled: one outline round the union of its pieces (no seams between them)
function inkFill(pa,fill,lw){ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=GH?GWC:INK;ctx.lineWidth=(GH?1.4:lw)*2;ctx.stroke(pa);ctx.fillStyle=GH?GG:fill;ctx.fill(pa)}
// a soft light that works even on slow phones (the eyes are the only glows left with LOWFX)
function glowL(rgb,q,r,a){if(a<=.004)return;ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,q[0],q[1],r,Math.min(1,a*ctx.globalAlpha));ctx.restore()}
// the warm rim of the sun of the summit (upper left) and the thin backlight of the aurora (lower right, 'lighter') inside an outline
function rimW(pts,al){const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0)/2,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.15,cy+Rr*.15),kx=1-1.9/Math.max(1,(x1-x0)/2),ky=1-1.9/Math.max(1,(y1-y0)/2);
  g.addColorStop(0,`rgba(255,226,168,${(al*.62).toFixed(3)})`);g.addColorStop(1,'rgba(255,226,168,0)');ctx.beginPath();for(const q of pts)ctx.lineTo(cx+(q[0]-cx)*kx,cy+(q[1]-cy)*ky);ctx.closePath();ctx.strokeStyle=g;ctx.lineWidth=1.3;ctx.stroke()}
function rimA(pts,rgb,al){if(LOWFX)return;const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0)/2,g=ctx.createLinearGradient(cx+Rr*.85,cy+Rr*.85,cx-Rr*.05,cy-Rr*.05),kx=1-1.8/Math.max(1,(x1-x0)/2),ky=1-1.8/Math.max(1,(y1-y0)/2);
  g.addColorStop(0,`rgba(${rgb},${al})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.save();ctx.globalCompositeOperation='lighter';ctx.beginPath();for(const q of pts)ctx.lineTo(cx+(q[0]-cx)*kx,cy+(q[1]-cy)*ky);ctx.closePath();ctx.strokeStyle=g;ctx.lineWidth=1.4;ctx.stroke();ctx.restore()}
// draws f() whole, or faded to k as one picture (no outline showing through)
const fadeOr=(k,f,q,r)=>{if(k>=.99)f();else if(k>.01)fadeDraw(f,q,r,k)};
// a little star of frost (four points)
function star4(pa,q,r){const k=r*.3;pa.moveTo(q[0],q[1]-r);pa.lineTo(q[0]+k,q[1]-k);pa.lineTo(q[0]+r,q[1]);pa.lineTo(q[0]+k,q[1]+k);pa.lineTo(q[0],q[1]+r);pa.lineTo(q[0]-k,q[1]+k);pa.lineTo(q[0]-r,q[1]);pa.lineTo(q[0]-k,q[1]-k);pa.closePath()}

// ------------------------------------------------------------------ colours: three tones per piece (light, base, shadow)
// phase 1, «il re della vetta»: the night sky where the aurora is born, the white of frost, ice crystal, antique gold
const K1={coat:T3('#5a76b0','#34497f','#1a2750'),muz:T3('#6782bd','#3d5490','#1f2d5c'),belly:T3('#8ea6cc','#607aa6','#354870'),
  frost:T3('#ffffff','#dce9f6','#8ea8c7'),fStr:'#6f8db0',star:'#e8f6ff',starG:'140,255,210',ice:T3('#f2fdff','#a8e6f6','#4f9cc4'),iceL:'#e0fff6',iceG:'150,240,255',
  moss:T3('#9bd46a','#4f8e3e','#2b5a2a'),mTip:'#d8f0d0',lich:T3('#d2e3b4','#9fb98a','#627a58'),gold:T3('#ffe9a8','#d9a93e','#8a6020'),
  beam:T3('#93acd0','#506a96','#283756'),crys:T3('#f0ffff','#a2eaf6','#4fa8c8'),
  irisL:'#b8fbff',irisD:'#3fd6e8',irisE:'#17708a',eyeG:'120,235,255',lid:'#141e33',brow:T3('#f0f8ff','#b6cee6','#6f8db0'),
  nose:'#161e30',noseL:'#4a5a7e',mouth:'#2a1830',fang:'#f0fbff',fangD:'#9cc3dc',hoof:T3('#616d86','#343d54','#181e2c'),hoofE:'#cfe6f5',
  back:'125,255,208',backA:.5,flower:'#ffffff'};
// phase 2, «l'aurora si accende»: a deeper violet coat with the constellations lit, lilac shadows in the frost, violet crystal
const K2={coat:T3('#5e5fb4','#35347c','#1a1848'),muz:T3('#6a6ac0','#3e3d8a','#201e52'),belly:T3('#9a92d8','#6a62a8','#3a3470'),
  frost:T3('#ffffff','#e4e2f8','#9a9cd0'),fStr:'#7d7fbe',star:'#f6eeff',starG:'200,160,255',ice:T3('#fbf4ff','#cdb8ff','#7a64c8'),iceL:'#f6eeff',iceG:'190,150,255',
  moss:T3('#a8d88a','#5a9a52','#2e5a36'),mTip:'#f2fbff',lich:K1.lich,gold:T3('#fff3c4','#f0c04a','#9a6a1c'),
  beam:T3('#a29ad8','#5a4f9a','#2c2558'),crys:T3('#fbf4ff','#cdb8ff','#7a64c8'),
  irisL:'#f0c8ff',irisD:'#b46cff',irisE:'#5a2a9a',eyeG:'200,140,255',lid:'#16122e',brow:T3('#fbf6ff','#cfc6ec','#7a74b0'),
  nose:'#17142e',noseL:'#5a5488',mouth:'#2a1430',fang:'#fbf6ff',fangD:'#b8a8e0',hoof:T3('#6a6488','#3a3458','#1c182e'),hoofE:'#e2dcf8',
  back:'170,150,255',backA:.7,flower:'#f2fbff'};
const PALC={};
function pal(k2){k2=Math.round(cl(k2,0,1)*24)/24;if(PALC[k2])return PALC[k2];const K={};
  for(const k in K1){const a=K1[k],b=K2[k];K[k]=typeof a==='number'?lerp(a,b,k2):typeof a==='string'?(a[0]==='#'?cmix(a,b,k2):mixRgb(a,b,k2)):mixT(a,b,k2)}
  K.p2=k2>.5;return PALC[k2]=K}
// the pale crown that stays on the mound (its light gone out)
const PALE={beam:T3('#d4dce6','#9aa8ba','#5c6878'),crys:T3('#f6fbff','#d6e2ec','#94a6b6')};
// the light of the crown: the aurora (green to blue), violet in the Call, whiter when it is about to strike
const LIT0='103,240,226',VIO='180,140,255';
const litRgb=A=>mixRgb(mixRgb(LIT0,VIO,Math.round(cl(A.tcol,0,1)*8)/8),'255,255,255',Math.round(cl(A.tw,0,1)*.7*8)/8);
// the light of the aurora (o.ghost): one gradient from the top to the floor for every piece, a white outline, no marks
let GH=0,GG='#8fe',GWC='#ffffff';
function ghostGrad(V0){const a=V0.P(0,0,140)[1],b=V0.P(0,0,0)[1]+18,g=ctx.createLinearGradient(0,a,0,b);g.addColorStop(0,'rgb(140,255,215)');g.addColorStop(.5,'rgb(120,200,255)');g.addColorStop(1,'rgb(190,150,255)');return g}

// ------------------------------------------------------------------ the body at rest (x forward, y to its left, z up; 0,0,0 the floor point)
// chest and withers, barrel, rump: one volume
const TC=[[16,0,56],[-4,0,50],[-28,0,50]],TR=[[22,20,24],[28,18,18],[16,16,17]];
const NK=[[26,0,64],[37,0,75],[45,0,82]],NKR=[15,12.5,9.6],NB0=NK[0];          // the neck: its base in the chest, its top at the nape
const NAPE=[44,0,84];                                                          // the head's own camera turns round the nape
const SKC=[48,0,86],SKR=[14,11,11.5],MZC=[61,0,80],MZR=[10,7,7.5];               // the skull and the muzzle (its tip at x 71)
const JH=[50,0,77],JWC=[60.5,0,74],JWR=[8.2,5.4,3.2];                           // the lower jaw: its hinge, the white chin
const CR0=[45,0,95];                                                           // the middle of the crown (between the rosettes)
// the legs: LF, RF, LH, RH (L = +y). Root (inside the body), the hoof at rest, the two bones, the radii (root, knee, end)
const RT0=[[18,10,38],[18,-10,38],[-26,10,42],[-26,-10,42]],FT0=[[19,11,0],[19,-11,0],[-27,11,0],[-27,-11,0]];
const LEGL=[[20,18],[20,18],[22,20],[22,20]],LEGR=[[9.6,6.4,5.2],[9.6,6.4,5.2],[10.6,6.6,5.2],[10.6,6.6,5.2]];
const FBP=[[31,11,21],[31,-11,21],null,null];                                   // the front hooves folded under the chest (reared up)
const KW=[.75,.25,0,.5];                                                       // the walk: LF lands at .25, RF at .75, LH at 0, RH at .5
// the antlers: the beam (rosette, three nodes, the palm) and the points (the given points are the tips of the crystals): P1 the lance,
// P2, P3 on the beam; P4 up, P5 out, P6 back on the edge of the palm; P7 and P8 only in the second phase. The palm a little lower than
// in the design (116 instead of 118) so that its points read as points and the tallest tip stays P3, at 126
const AB0=[[45,6.5,95],[36,17,105],[26,31,113],[17,45,116],[12,49,113.5]],ABR=[5.4,4.8,4.2,3.6,3.2];
const ATIP=[[64,12,99],[45,24,120],[24,38,126],[15,50,125],[6,60,121],[3,54,112],[9,57,127],[0,60,116]];
const PLT=[1,.74,.96,.8,1.04,.72,.94,.82,1,.7],ACL=[9.5,9,9,10.5,10.5,10,10.5,10],ACW=[3.6,3.4,3.4,3.2,3.2,3.1,3.2,3.1],PALN=nrm([.9,.3,-.15]);
const KNOT=[[.3,1,1.7],[.55,-1,1.9],[.8,1,1.5]];                                 // the knots of old ice on the beam near the head
const ROSN=[-1,1].map(sd=>ellN(SKR,AXES,nrm([(45-48)/14,6.5*sd/11,(95-86)/11.5])));  // the skull's normal under each rosette
const EARN=[-1,1].map(sd=>ellN(SKR,AXES,nrm([(42.5-48)/14,10*sd/11,(92-86)/11.5])));
const AGC={};
function antGeo(sd,g,cs){const id=sd+'|'+Math.round(g*40)+'|'+Math.round(cs*40);if(AGC[id])return AGC[id];
  const R0=[45,6.5*sd,95],S=q=>add(R0,mul(sub(q,R0),g)),my=q=>[q[0],q[1]*sd,q[2]],B=AB0.map(q=>S(my(q))),pc=B[4],st=[lerp3(B[0],B[1],.2),B[1],B[2]],T=[];
  for(let i=0;i<8;i++){const palm=i>=3;let tip0=S(my(ATIP[i]));if(i===1||i===2){const r=st[i];tip0=add(r,mul(sub(tip0,r),1.15))}let s,t=tip0;
    if(palm){const pn=nrm(my(PALN)),d0=sub(tip0,pc),d=nrm(sub(d0,mul(pn,dot(d0,pn)))),Lr=i<6?Math.max(len(d0),16*g)*cs:16*g;t=add(pc,mul(d,Lr));s=add(pc,mul(d,3))}else s=st[i];
    const d=nrm(sub(t,s)),Lc=ACL[i]*(g>1.01?1.06:1);T.push({i,s,b:add(t,mul(d,-Lc)),t,d,Lc,r0:palm?2.6:[3.5,3.3,3.1][i],r1:palm?2.2:[2.3,2.2,2.1][i],w:ACW[i],palm})}
  return AGC[id]={B,BR:ABR.map(r=>r*(1+.3*(g-1))),T,pc,pn:nrm(my(PALN)),R0,d0:nrm(sub(B[1],B[0]))}}
// the ice of the mane: bases on the crest (the first four on the neck: their place along it), heights, tilted back 35°
const MANE=[[40,0,89,6],[36,0,86,8],[31,0,84,10],[25,0,82,11],[19,0,81,12],[13,0,80,9],[7,0,78,6]].map(([x,y,z,h])=>({x,z,h,s:x>=25?cl((x-26)/19,0,1):-1}));
// the inside of the body (for placing the locks of the collar on its surface)
const inBody=q=>{const c=TC[0],r=TR[0];if(((q[0]-c[0])/r[0])**2+((q[1]-c[1])/r[1])**2+((q[2]-c[2])/r[2])**2<1)return true;
  for(let i=0;i<2;i++){const a=NK[i],b=NK[i+1],ab=sub(b,a),t=cl(dot(sub(q,a),ab)/dot(ab,ab),0,1),r=lerp(NKR[i],NKR[i+1],t);if(len(sub(q,lerp3(a,b,t)))<r)return true}return false};
const onSurf=(q0,d)=>{let q=q0;for(let i=0;i<120&&inBody(q);i++)q=add(q,mul(d,.4));return q};
// the collar of frost: two rows of locks (5 on the throat, 4 on the chest down between the front legs): base, outward normal, length
const COLL=[];
for(const[y,L] of[[-8,8.5],[-4,10],[0,11],[4,10],[8,8.5]]){const d=nrm([.86,y*.03,-.5]);COLL.push({b:onSurf([37,y*.8,68],d),n:d,L,row:0,y})}
for(const[y,L] of[[-6,10],[-2,11.5],[2,11.5],[6,10]]){const d=nrm([1,y*.04,-.12]);COLL.push({b:onSurf([28,y*.8,51],d),n:d,L,row:1,y})}
// the frost stars of a flank (5 on the shoulder and the upper flank, 4 on the lower flank) and on the rump: [ellipsoid, azimuth, elevation]
const STF=[[0,1.32,.36],[0,1.55,.08],[1,1.46,.42],[1,1.8,.3],[1,2.14,.44],[1,1.4,-.2],[1,1.72,-.12],[1,2.02,-.22],[2,2.12,-.02]],STR=[[2,Math.PI,.86],[2,Math.PI-.55,.62],[2,Math.PI+.55,.62]];
const STL=[[0,2],[2,3],[3,4],[0,1],[1,5],[5,6],[6,7],[7,8],[4,8]];
const SDIR=(t,e)=>[Math.cos(e)*Math.cos(t),Math.cos(e)*Math.sin(t),Math.sin(e)];
const STARS=[];for(const sd of[-1,1])STF.forEach(([e,t,el],i)=>STARS.push({e,m:SDIR(t*sd,el),i:STARS.length,g:sd}));for(const[e,t,el] of STR)STARS.push({e,m:SDIR(t,el),i:STARS.length,g:0});
// the fur: little C tufts on the shoulder, at the root of the neck and on the thigh; two soft curves of the muscles of the shoulder
const FUR=[];for(const sd of[-1,1])for(const[e,t,el] of[[0,1.12,.06],[0,1.25,-.28],[0,.98,.32],[0,.7,.55],[2,2.3,-.12],[2,2.52,.16],[2,2.18,.34],[1,1.95,.08]])FUR.push({e,m:SDIR(t*sd,el)});
const MUS=[];for(const sd of[-1,1])MUS.push([[1.02,.44],[1.24,.12],[1.2,-.3]].map(([t,el])=>SDIR(t*sd,el)),[[1.5,.5],[1.66,.12]].map(([t,el])=>SDIR(t*sd,el)));

// ------------------------------------------------------------------ the moves (every one depends only on p; idle and walk close on themselves)
const MV=['idle','walk','hit','prep','charge','stuck','recoil','prep2','skid','sweep','aurora','stomp','call','crown','rage','taunt','enter','die'];
const DUR={idle:3,walk:1.1,hit:.6,prep:1.4,charge:.6,stuck:1.6,recoil:.5,prep2:.95,skid:.6,sweep:1.8,aurora:3.4,stomp:2,call:2.2,crown:4,rage:3,taunt:1.2,enter:3.4,die:4.2};
// the moments the brain needs (p of the move)
const INFO={notch:[.08,.16,.24,.32,.40,.48],enterNotch:[.72,.745,.77,.795,.82,.845],prep:{lock:.35,paw:[.32,.58]},prep2:{lock:.05,paw:.45},stuck:{tug:[.30,.58],free:.82},
  sweep:{full:.5,go:.55,end:.70,back:[.70,.82]},aurora:{nod:[.58,.72,.86]},stomp:{hit:[.52,.76],flash:.40},call:{roar:[.25,.70],flash:[.25,.50]},
  crown:{lock:.38,rays:[.40,.88],ring:[.15,.40]},rage:{column:[.32,.50],roar:.68,ring:.70},enter:{steps:[.42,.55],eyes:.64,roar:.86},die:{clou:.52,horns:[.56,.74],light:[.62,.92],flowers:.84},
  taunt:{puffs:[.25,.40],paw:.80}};
// a paw of a front hoof that strikes at c: it lifts and comes forward, strikes down, scrapes back, returns
function paw(A,i,p,c){const k=(p-c+.09)/.16;if(k<=0||k>=1)return;const v=keys([[0,[0,0]],[.34,[3.5,5.5]],[.56,[1.5,0]],[.82,[-3.5,0]],[1,[0,0]]],k);A.ft[i][0]+=v[0];A.ft[i][2]+=v[1]}
// a leg of the gallop: on the floor from a to b (sliding from +S to -S), in the air swinging forward, lifted by H
function gal(p,a,b,S,H){const ln=b-a,q=((p-a)%1+1)%1;if(q<ln)return[S-2*S*q/ln,0];const u=(q-ln)/(1-ln);return[-S+2*S*ez(u),H*Math.sin(Math.PI*u)]}
// a step of a hoof from where it was (dx) to its place, between a and b, lifted by h
function step(A,i,p,a,b,dx,h,dy){const k=cl((p-a)/(b-a),0,1);A.ft[i][0]+=dx*(1-ez(k));if(dy)A.ft[i][1]+=dy*(1-ez(k));A.ft[i][2]+=h*Math.sin(Math.PI*k)}
function sPose(anim,p,o){const ph=p*TAU,P2=!!o.p2&&anim!=='enter'&&anim!=='rage',A={B:[0,0,0],lean:0,roll:0,yaw:0,s:0,sx:0,pv:null,
    ft:FT0.map(f=>f.slice()),fb:[0,0,0,0],rs:[0,0,0,0],fo:[0,0,0,0],hd:[0,0,0],ny:0,np:0,hy:0,hp:.12,hr:0,hk:.2,ch:.28,
    jaw:0,blink:1,lid:.3,squint:0,brow:0,nost:0,lookD:0,earL:0,earR:0,tail:0,tsw:0,mane:0,maneLit:P2?.55:0,maneO:0,br:0,coll:0,lich:0,cr:0,cs:1,
    tl:[0,0,0,0,0,0,0,0],tcol:0,tw:0,palm:0,veinK:.8,runs:[],rose:0,trem:0,eflash:0,eyeOn:1,k2:P2?1:0,grow:P2?1:0,p78:P2?1:0,starK:P2?1:0,constel:P2?1:0,
    starPulse:0,hoofW:0,pearl:-1,ring:-1,flameK:P2?1:0,threads:P2&&(anim==='idle'||anim==='walk'||anim==='taunt'||anim==='hit')?1:0,ghost:0,vis:1,cline:-1,cup:0,det:0,body:1,rib:-1,bodyUp:0,dawn:0,mound:0,flw:0,edel:0,
    lastDrop:-1,cflash:0,pale:0,fx:[]};
  const fx=(k,t,o2)=>{if(t>=0&&t<1)A.fx.push(Object.assign({k,t},o2||{}))};
  // (a shake of the crown: at most two, never faster than 5.5 a second, so that in the arena 12, where the boss runs 1.38 times, every
  // tremor stays under 8 Hz; the same limit for every tremor below)
  const shake=(a,b,amp)=>{const k=(p-a)/(b-a);if(k>0&&k<1){const e=Math.sin(k*Math.PI),n=Math.max(1,Math.min(2,5.5*(b-a)*DUR[anim]));A.hy+=amp*Math.sin(k*TAU*n)*e;A.cr-=amp*.35*Math.sin(k*TAU*n-.6)*e;A.maneO+=.08*Math.sin(k*TAU*n+1)*e}};
  if(anim==='walk'){// CAMMINA: a heavy step in four beats (LH 0, LF .25, RH .5, RF .75), each hoof up 7 and down with its weight; the shoulder and
    // the hip slide with their hoof, the head nods at each front hoof and the crown follows a moment later; a king walking past his prey
    const st=stepper(p,.6),hf=P2?12:7;for(let i=0;i<4;i++){const r=st(KW[i],21,i<2?hf:7);A.ft[i][0]+=r.x;A.ft[i][2]+=r.z;A.rs[i]=r.x/21*(i<2?7:6)}
    A.B[2]=-(1.1*pw(p,.27,.16)+1.1*pw(p,.77,.16)+.6*pw(p,.02,.16)+.6*pw(p,.52,.16));A.roll=.03*Math.sin(TAU*(p-.12));
    A.hp=(P2?-.1:.12)+.07*(pw(p,.31,.24)+pw(p,.81,.24));A.cr=-.035*Math.sin(TAU*(p-.32));A.coll=.07*Math.sin(TAU*2*(p-.12));A.lich=.3*Math.sin(TAU*2*(p-.22));
    A.blink=blink(p,.4,.08);A.maneO=.03*Math.sin(TAU*2*(p-.2));if(P2){A.tail=.45;A.starPulse=.5+.5*Math.sin(TAU*2*p)}
    for(const[i,c] of[[0,.25],[1,.75]]){fx('print',cyc(p,c)/.95,{i});fx('snow',cyc(p,c)/.22,{i})}
    if(P2)fx('vapor',p)}
  else if(anim==='hit'){// COLPITO (only for the pages): the head back, the body back 4, the ears flat, the eyes shut, the crown's light trembles
    const k=hitK(p);A.hp=.12-.3*k;A.hd=[-3*k,0,1.5*k];A.B[0]=-4*k;A.lean=-.05*k;A.earL=A.earR=-Math.min(1,Math.abs(k));A.blink=1-rise(p,0,.04,.36,.42);
    A.trem=Math.min(1,Math.abs(k));A.maneO=.12*k*Math.sin(TAU*5.5*.6*p);fx('frost',p/.5)}
  else if(anim==='prep'){// PREPARA LA CARICA: the head goes down until the lances point forward like swords, two paws of the right front hoof, the
    // light comes down from the rosettes into the lances (white from .35, the flash of the eyes: the strip locks), then it loads back
    const dn=sstep(0,.2,p);A.hp=.12+.43*dn;A.hd=[4*dn,0,-10*dn];A.np=.2*dn;A.earL=A.earR=-.9*dn;A.ch=.28-.16*dn;A.squint=.35*dn;
    paw(A,1,p,.32);paw(A,1,p,.58);fx('snow',(p-.32)/.2,{i:1});fx('snow',(p-.58)/.2,{i:1});
    A.runs.push({g:'lance',k:sstep(.2,.35,p),a:1});A.tl[0]=sstep(.33,.37,p);A.tw=sstep(.2,.35,p);A.rose=sstep(.15,.22,p)*(1-sstep(.4,.5,p));A.eflash=flash(p,.35,.1);fx('breath',(p-.62)/.25,{});
    const ld=sstep(.8,.95,p);A.B[0]-=4*ld;A.B[2]-=3*ld;A.lean-=.05*ld;A.B[1]+=.7*trem(p,.8,1,5.5,1.4);A.tail=sstep(.8,.92,p)}
  else if(anim==='charge'){// CARICA: a true gallop in bounds (a cycle): the front legs reach together, the hind ones push, all four in the air at
    // .45-.60; the head low and still with the lances forward, the ears flat, the white flag of the tail, a trail of aurora from the lances
    const CT=[[.02,.40],[.10,.45],[.60,.96],[.66,1.04]];for(let i=0;i<4;i++){const g=gal(p,CT[i][0],CT[i][1],i<2?17:18,i<2?12:9);A.ft[i][0]+=g[0];A.ft[i][2]+=g[1];A.rs[i]=g[0]/18*(i<2?7:6)}
    A.B[2]=4*rise(p,.42,.5,.56,.64);A.lean=.05*pw(p,.16,.32)-.05*pw(p,.72,.32);A.sx=.045*Math.cos(TAU*(p-.95));
    A.hp=.55;A.hd=[6,0,-12];A.np=.25;A.hk=0;A.ch=.1;A.earL=A.earR=-1;A.tail=1;A.mane=-.6;A.squint=.3;A.tl[0]=1;A.tw=1;A.runs.push({g:'lance',k:1,a:1});
    fx('trail',p,{});fx('snow',cyc(p,.1)/.25,{i:0,j:1});fx('snow',cyc(p,.6)/.25,{i:2,j:3})}
  else if(anim==='stuck'){// CORNA INCASTRATE: the blow into the wall (a star of cracks on the lances), stuck: the body pushes, the hind hooves dig and
    // slide back, two tugs (bits of ice fall), the rosettes tremble four times a second (now you hit him); it tears free (.82), shakes, snorts
    const im=sstep(0,.05,p),fr=sstep(.8,.86,p),end=sstep(.86,1,p),push=sstep(.06,.2,p)*(1-fr);
    A.hp=lerp(.55+.15*im,.12,sstep(.82,1,p));A.hd=[lerp(4+2*im,0,sstep(.82,1,p)),0,lerp(-10,0,sstep(.82,1,p))];A.np=.2*(1-sstep(.82,1,p));A.hk=0;A.ch=.12;
    const tug=Math.max(pls(p,.30,.08),pls(p,.58,.08));A.hd[0]-=4*tug;
    A.B[0]=3*pls(p,.03,.06)-2*pls(p,.09,.06)+1.5*push-1.5*tug-5*fr*(1-end);A.lean=.05*push;
    for(const i of[2,3])A.ft[i][0]-=6*sstep(.08,.3,p)*(1-end);for(const i of[0,1])A.ft[i][0]+=3*push;
    step(A,0,p,.8,.85,0,0);{const k=sstep(.8,.85,p)*(1-end);A.ft[0][0]-=8*k;A.ft[0][2]+=3.5*Math.sin(Math.PI*cl((p-.8)/.05,0,1))}
    {const k=sstep(.83,.88,p)*(1-end);A.ft[1][0]-=8*k;A.ft[1][2]+=3.5*Math.sin(Math.PI*cl((p-.83)/.05,0,1))}
    for(const i of[0,1])A.ft[i][2]+=2.5*Math.sin(Math.PI*cl((p-.88-.04*i)/.08,0,1));
    A.rose=p>.08&&p<.8?.5+.5*Math.sin(TAU*4*1.6*(p-.08)):0;A.earL=A.earR=-.8*(1-end);A.squint=.5*(1-end);A.tl[0]=1-sstep(.05,.2,p);A.tw=1;A.maneO=.1*tug*Math.sin(TAU*5.5*1.6*p);
    fx('crack',p/.3,{});fx('bits',(p-.3)/.3,{});fx('bits',(p-.58)/.3,{});shake(.88,1,.22);fx('breath',(p-.9)/.1,{snort:1})}
  else if(anim==='recoil'){// RIMBALZO (the first charge of the second phase): it bounces off, a step back with the front legs, a shake of the crown
    const b=sstep(0,.06,p)*(1-sstep(.2,.5,p)),up=sstep(0,.18,p);A.hp=lerp(.55,.12,up)-.35*b;A.hd=[4*(1-up)-3*b,0,-10*(1-up)];A.np=.2*(1-up);A.B[0]=-4*b;A.maneO=.12*b*Math.sin(TAU*5.5*.5*p);
    for(const[i,a] of[[0,.2],[1,.36]]){const k=cl((p-a)/.2,0,1),bk=cl((p-a-.42)/.16,0,1);A.ft[i][0]-=6*ez(k)*(1-ez(bk));A.ft[i][2]+=3.5*Math.sin(Math.PI*k)+2.5*Math.sin(Math.PI*bk)}
    shake(.6,1,.18);A.tl[0]=1-sstep(0,.2,p);A.tw=1;A.earL=A.earR=-.5*b}
  else if(anim==='prep2'){// SECONDA CARICA: it turns to you and lowers the head, the lances already lit (the strip is already locked: the flash at
    // .05), one paw (.45), it loads back and trembles
    const dn=sstep(0,.3,p);A.hp=.12+.43*dn;A.hd=[4*dn,0,-10*dn];A.np=.2*dn;A.earL=A.earR=-.9*dn;A.ch=.28-.16*dn;A.squint=.35*dn;
    A.tl[0]=1;A.tw=1;A.runs.push({g:'lance',k:1,a:1});A.eflash=flash(p,.05,.1);paw(A,1,p,.45);fx('snow',(p-.45)/.2,{i:1});
    const ld=sstep(.6,.85,p);A.B[0]-=4*ld;A.B[2]-=3*ld;A.lean-=.05*ld;A.B[1]+=.7*trem(p,.6,1,5.5,.95);A.tail=sstep(.6,.8,p)}
  else if(anim==='skid'){// FRENATA: the front hooves planted forward, the body pulled back, snow from the hooves (the game slides it); it straightens
    const k=sstep(0,.1,p)*(1-sstep(.55,.8,p)),bk=1-sstep(.45,.85,p);for(const i of[0,1])A.ft[i][0]+=8*k;A.lean=-.15*k;A.B[0]=-3*k;A.B[2]=-1.5*k;
    A.hp=lerp(.12,.55,bk);A.hd=[6*bk,0,-12*bk];A.np=.25*bk;A.hk=.2*(1-bk);A.ch=.28-.18*bk;A.earL=A.earR=-bk;A.tail=bk;fx('spray',p/.6,{});shake(.62,1,.2)}
  else if(anim==='sweep'){// SPAZZATA DELLA CORONA: the head turns to its right (the neck follows half, the torso twists), the crown tilts like a sword
    // drawn; the points light in six notches (lance .08 ... P6 .48), the flash of the eyes; held; the great sweep from right to left
    // (.55-.70), the points go out one after the other as the shards fly; it shakes the crown. Second phase: the way back (.70-.82)
    const wd=sstep(0,.45,p);let hy=-wd,yaw=-.2*wd,hr=-.35*wd;
    if(p>=.55){const k=ez(cl((p-.55)/.15,0,1));hy=lerp(-1,1,k);yaw=lerp(-.2,.2,k);hr=lerp(-.35,.22,k)}
    if(!P2&&p>=.7){const k=sstep(.7,1,p);hy=lerp(1,0,k);yaw=lerp(.2,0,k);hr=lerp(.22,0,k)}
    if(P2&&p>=.7){if(p<.82){const k=ez((p-.7)/.12);hy=lerp(1,-.3,k);yaw=lerp(.2,-.06,k);hr=lerp(.22,-.12,k)}else{const k=sstep(.82,1,p);hy=lerp(-.3,0,k);yaw=lerp(-.06,0,k);hr=lerp(-.12,0,k)}}
    A.hy=hy;A.yaw=yaw;A.hr=hr;A.ny=.5*hy-yaw;if(p>=.5&&p<.55){const t=trem(p,.5,.55,5.5,1.8);A.B[1]+=.6*t;A.hy+=.03*t}
    if(P2)shake(.84,1,.12);else shake(.73,.95,.16);
    const NT=[.08,.16,.24,.32,.40,.48];for(let i=0;i<8;i++){const j=Math.min(i,5);let l=sstep(NT[j],NT[j]+.03,p)*(1-sstep(.56+.02*j,.58+.02*j,p));
      if(P2)l=Math.max(l,sstep(.66,.7,p)*(1-sstep(.72+.016*j,.74+.016*j,p)));A.tl[i]=l}
    A.tw=.5;A.rose=sstep(0,.08,p)*(1-sstep(.5,.6,p));A.eflash=flash(p,.48,.1);A.earL=A.earR=-.4*wd*(p<.75?1:0);
    {const k=cl((p-.55)/.07,0,1),bk=cl((p-.86)/.12,0,1);A.ft[0][1]+=6*ez(k)*(1-ez(bk));A.ft[0][0]+=2*ez(k)*(1-ez(bk));A.ft[0][2]+=4*Math.sin(Math.PI*k)+3*Math.sin(Math.PI*bk)}
    fx('trail',(p-.55)/.15,{sweep:1});if(P2)fx('trail',(p-.7)/.12,{sweep:-1});fx('dropfall',(p-.72)/.22,{});fx('breath',(p-.85)/.15,{snort:1})}
  else if(anim==='aurora'){// TENDE D'AURORA: the head to the sky, the palms blaze and the light rises from them like smoke, the drops rise; it holds
    // the head high (the neck trembles under 5 Hz), the soft call (.2-.5); three sharp nods, one for each curtain (.58, .72, .86 in the
    // second phase); it lowers the head and shakes the crown
    const up=sstep(0,.14,p)*(1-sstep(.88,.98,p)),hold=rise(p,.14,.2,.84,.88);A.hp=.12-.72*up;A.hd=[-2*up,0,7*up];A.np=-.3*up;A.earL=A.earR=-.6*up;
    A.squint=.55*hold;A.jaw=.45*rise(p,.2,.25,.45,.5);A.hd[2]+=.5*Math.sin(TAU*4.5*3.4*p)*hold;
    for(const c of P2?[.58,.72,.86]:[.58,.72])A.hp+=.3*nodK(p,c,.02,.06);
    A.palm=up;for(const i of[3,4,5,6,7])A.tl[i]=up;A.rose=up;A.runs.push({g:'beam',k:sstep(0,.14,p),a:up});A.maneLit=Math.max(A.maneLit,.4*up);
    shake(.88,1,.18);fx('smoke',p,{k:up});fx('rdrop',p,{k:up})}
  else if(anim==='stomp'){// ZOCCOLATA DEL RE: it rears up on its hind legs (round the hind hooves), the front legs high and folded, the icicles
    // stand up; a pearl of light comes down from the rosettes along the front of the neck and the chest into the front legs (the hooves go
    // white); the flash of the eyes (.40), it trembles at the top, it slams down (the blow at .52), stays low with the frosty breath, rises.
    // Second phase: it rises halfway and slams again (.76)
    let r;if(p<.45)r=ez(p/.45);else if(p<.48)r=1;else if(p<.52)r=1-Math.pow((p-.48)/.04,2);else r=0;
    if(P2){if(p>=.56&&p<.7)r=.5*ez((p-.56)/.14);else if(p>=.7&&p<.74)r=.5;else if(p>=.74&&p<.76)r=.5*(1-Math.pow((p-.74)/.02,2))}
    A.lean=-.7*r;A.pv=[-27,0,30];A.hk=.5;A.hp=.12+.3*r;A.np=-.3*r;A.hd=[0,0,3*r];A.mane=Math.max(r,0);A.coll=.12*Math.sin(TAU*3*p)*r;
    // (the front legs fold as it rears and reach down for the floor while it falls: by the clock, not by the height, or they would snap
    // straight in the last instant of the slam)
    let fb=sstep(.02,.25,p)*(1-sstep(.46,.52,p)),fo=sstep(.1,.3,p)*(1-sstep(.48,.52,p));if(P2){fb=Math.max(fb,sstep(.57,.66,p)*(1-sstep(.71,.76,p)));fo=Math.max(fo,sstep(.58,.66,p)*(1-sstep(.73,.76,p)))}
    A.fb[0]=A.fb[1]=fb;A.fo[0]=A.fo[1]=fo;for(const i of[2,3])A.ft[i][0]-=3*r;
    A.pearl=p<.42?sstep(.02,.35,p):-1;A.hoofW=sstep(.3,.36,p)*(1-sstep(P2?.84:.6,P2?.95:.75,p));A.eflash=flash(p,.40,.1);A.rose=sstep(0,.05,p)*(1-sstep(.3,.4,p));
    A.B[1]+=.8*trem(p,.45,.48,5.5,2);A.earL=A.earR=-.5*r;
    for(const c of P2?[.52,.76]:[.52]){const k=pls(p,c+.006,.03);A.s-=.06*k;A.B[2]-=3*k;A.hp+=.15*pls(p,c+.015,.05);fx('ring',(p-c)/.3,{});fx('snow',(p-c)/.25,{i:0,j:1,big:1})}
    const low=P2?rise(p,.52,.54,.55,.57)+rise(p,.76,.78,.86,.94):rise(p,.52,.54,.74,.82);A.B[2]-=3*low;A.lean+=.05*low;
    A.maneO=.1*rise(p,.52,.54,.7,.78)*Math.sin(TAU*5.5*2*p);fx('breath',(p-.56)/.2,{big:1});fx('breath',(p-.9)/.1,{snort:1})}
  else if(anim==='call'){// RICHIAMO DELLA MANDRIA: the neck forward and up, the bellow (.25-.70), the crown goes violet from the rosettes to the
    // points, the icicles stand up and light; the neck trembles, three clouds of breath, two flashes of the eyes; it lowers the head, two snorts
    const up=sstep(0,.25,p)*(1-sstep(.7,.9,p)),hold=rise(p,.25,.3,.65,.7);A.hd=[8*up,0,7*up];A.np=-.25*up;A.hp=.12-.45*up;A.jaw=.85*rise(p,.06,.25,.66,.72);A.brow=up;A.earL=A.earR=-.5*up;
    A.tcol=sstep(0,.25,p)*(1-sstep(.75,.95,p));A.runs.push({g:'beam',k:sstep(0,.25,p),a:1-sstep(.7,.9,p),vio:1});for(let i=0;i<8;i++)A.tl[i]=.6*sstep(.12+.015*i,.25,p)*(1-sstep(.75,.95,p));A.rose=up;
    A.mane=up;A.maneLit=Math.max(A.maneLit,up);A.hd[2]+=.5*Math.sin(TAU*4.5*2.2*p)*hold;A.hd[0]+=.3*Math.sin(TAU*4.5*2.2*p+1)*hold;
    A.eflash=Math.max(flash(p,.25,.08),flash(p,.5,.08));A.nost=up;for(const c of[.28,.42,.56])fx('cloud',(p-c)/.22,{});fx('breath',(p-.78)/.12,{snort:1});fx('breath',(p-.9)/.1,{snort:1})}
  else if(anim==='crown'){// CORONA BOREALE (second phase): the legs planted wide, the head up, the crown opens; the light gathers on every point,
    // the flames grow, the mane lights, a ring of light rises over the crown (.15-.40, the flash .38); the crown burns and the head turns 40°
    // slowly the way of o.dir (.40-.88); the light goes out, the head low, the frosty panting
    const pl=sstep(0,.15,p)*(1-sstep(.9,1,p)),dr=o.dir===-1?-1:1,g=sstep(.15,.4,p),off=sstep(.88,.95,p);
    A.ft[0][1]+=4*pl;A.ft[1][1]-=4*pl;A.hp=.12-.42*sstep(0,.15,p)*(1-sstep(.88,.94,p))+.28*rise(p,.88,.94,.97,1);A.cs=1+.15*pl;
    for(let i=0;i<8;i++)A.tl[i]=g*(1-off);A.tw=sstep(.3,.4,p)*(1-off);A.flameK=1+g*(1-off);A.maneLit=Math.max(.55,g*(1-off));A.mane=.6*g*(1-off);A.rose=g*(1-off);
    A.ring=p>=.15&&p<.96?(p-.15)/.81:-1;A.eflash=flash(p,.38,.1);A.hy=dr*.698*cl((p-.4)/.48,0,1)*(1-sstep(.9,1,p));A.ny=.35*A.hy;
    A.B[1]+=.3*trem(p,.4,.88,5.5,4);A.runs.push({g:'beam',k:g,a:1-off});for(const c of[.9,.95])fx('breath',(p-c)/.1,{big:1})}
  else if(anim==='rage'){// L'AURORA SI ACCENDE (the change of phase): it staggers and the crown goes out; it kneels on the left knee with the head
    // bowed (it looks finished); the column of aurora (the game's): the crown lights again from the points down, P7 and P8 grow, the antlers
    // and the icicles grow longer, the colours turn to the second phase; it rises, the stars light one by one into constellations, the eyes
    // open violet; the bellow of rage; it lowers the crown, ready
    const st=sstep(0,.06,p)*(1-sstep(.1,.18,p));A.B[0]=-4*st;A.lean=-.06*st;A.B[1]+=.6*trem(p,0,.12,5.5,3);
    const out=sstep(.04,.12,p),re=sstep(.34,.5,p);A.veinK=.8*(1-out)*(.6+.4*Math.sin(TAU*16*p))+re;
    const ORD=[2,3,6,1,4,7,5,0];for(let i=0;i<8;i++){const t0=.34+.02*ORD.indexOf(i);A.tl[i]=.5*(1-out)*(.5+.5*Math.sin(TAU*16*p+i))+sstep(t0,t0+.03,p)*(1-.7*sstep(.9,1,p))}
    A.grow=sstep(.32,.5,p);A.p78=sstep(.36,.5,p);A.k2=sstep(.32,.6,p);A.maneLit=sstep(.4,.6,p)*.55;A.starK=sstep(.5,.66,p);A.constel=sstep(.6,.68,p);A.flameK=sstep(.42,.56,p);A.threads=sstep(.6,.7,p);A.rose=re*(1-sstep(.9,1,p));
    const kn=sstep(.12,.3,p)*(1-sstep(.5,.66,p));A.B[2]-=9*kn;A.lean+=.14*kn;A.ft[0]=lerp3(FT0[0],[5,11,2.5],kn);A.hp=.12+.62*kn;A.hd[2]-=6*kn;A.np+=.3*kn;A.blink=1-.75*rise(p,.14,.2,.5,.56);
    A.eflash=flash(p,.6,.1);A.earL=A.earR=-.6*kn;
    const roar=rise(p,.68,.72,.86,.9);A.hd=add(A.hd,[6*roar,0,8*roar]);A.np-=.25*roar;A.hp-=.5*roar;A.jaw=.9*roar;A.brow=roar;A.mane=Math.max(A.mane,roar);A.nost=roar;A.earL=A.earR=Math.min(A.earL,-.6*roar);
    A.hp+=.08*sstep(.9,1,p);A.maneO=.08*roar*Math.sin(TAU*16*p);fx('cloud',(p-.7)/.2,{})}
  else if(anim==='taunt'){// PRESA IN GIRO: it raises the chin and looks down the muzzle at you under the heavy lids, two puffs, a slow «no, no» while
    // the drops of light on the lances tinkle like little bells, one paw, then it stares at you again
    const up=sstep(0,.15,p)*(1-sstep(.85,1,p));A.hp=.12-.52*up;A.hd[2]+=2*up;A.lid=.3+.22*up;A.lookD=up;
    fx('breath',(p-.25)/.18,{snort:1});fx('breath',(p-.40)/.18,{snort:1});
    A.hy=.3*Math.sin(TAU*(p-.45)/.3)*rise(p,.45,.5,.7,.75);A.ny=.3*A.hy;A.tl[0]=.6*Math.max(pls(p,.52,.07),pls(p,.66,.07));
    fx('bell',(p-.5)/.12,{});fx('bell',(p-.64)/.12,{});paw(A,1,p,.8);fx('snow',(p-.8)/.2,{i:1})}
  else if(anim==='enter'){// ENTRATA: «il re scende con l'aurora». Not there yet (the game lets the veil of aurora down); its shape of aurora light
    // forms, head low; the colour rises from the hooves to the antlers (a line across the screen with a thread of light) while it takes two
    // heavy steps forward (.42, .55); the eyes open (the flash .64); the head rises and the crown lights point after point (six notches,
    // .72-.845); the bellow of the entrance, then it lowers the crown a little toward you
    A.vis=p<.18?0:1;A.ghost=p<.35?1:0;A.gk=sstep(.18,.35,p);A.cline=p>=.35&&p<.6?sstep(.35,.6,p):-1;A.cup=1;
    const mv=sstep(.36,.6,p);A.B[0]=-12*(1-mv);for(let i=0;i<4;i++)A.ft[i][0]-=12;
    for(const[i,a,b] of[[0,.36,.42],[3,.4,.47],[1,.49,.55],[2,.53,.6]]){const k=cl((p-a)/(b-a),0,1);A.ft[i][0]+=12*ez(k);A.ft[i][2]+=6*Math.sin(Math.PI*k)}
    const ra=sstep(.7,.86,p);A.hp=lerp(.38,-.12,ra);A.np=lerp(.22,-.12,ra);A.hd=[0,0,lerp(-4,2,ra)];A.eyeOn=sstep(.62,.66,p);A.eflash=flash(p,.64,.1);
    const NT=INFO.enterNotch;for(let i=0;i<6;i++)A.tl[i]=sstep(NT[i],NT[i]+.015,p)*(1-.8*sstep(.95,1,p));A.tw=.35;A.veinK=.8*sstep(.6,.72,p);A.rose=sstep(.68,.72,p)*(1-sstep(.95,1,p));
    const roar=rise(p,.86,.89,.95,.98);A.hd=add(A.hd,[4*roar,0,5*roar]);A.np-=.2*roar;A.hp-=.3*roar;A.jaw=.85*roar;A.brow=roar;A.mane=roar;A.nost=roar;
    A.hp+=.22*sstep(.95,1,p);fx('snow',(p-.42)/.2,{i:0});fx('snow',(p-.55)/.2,{i:1});fx('cloud',(p-.87)/.13,{})}
  else if(anim==='die'){// SCONFITTA: «il re si inchina». It staggers (the light of the antlers trembles), the points go out from the top to the
    // rosettes, it bends the front legs and bows to you until the crown touches the floor; a soft flash of the whole crown (the climax, .52);
    // the antlers come off clean (the rosettes stay) and stand in the moss in front of it like a little tree of crystal; the body turns into
    // aurora light from the hooves up and rises like a curtain rolling up; a warm ray of dawn falls on the antlers, the mound of moss grows
    // with white flowers and an edelweiss, the last drop of light falls from the highest point. At .999: the pale crown on the flowered mound
    A.B[1]+=.8*trem(p,0,.16,5.5,4.2);A.roll=.03*trem(p,0,.16,5,4.2);A.B[0]=-3*sstep(0,.08,p)*(1-sstep(.12,.2,p));
    const ORD=[2,3,6,1,4,7,5,0];for(let i=0;i<8;i++){const t0=.15+.022*ORD.indexOf(i);A.tl[i]=sstep(0,.05,p)*(.65+.35*Math.sin(TAU*5.5*4.2*p+i))*(1-sstep(t0,t0+.025,p))}
    A.veinK=.8*(1-sstep(.3,.36,p))*(.65+.35*Math.sin(TAU*5*4.2*p))+.6*pls(p,.53,.06);A.rose=.5*(1-sstep(.3,.36,p));
    const bw=sstep(.34,.5,p);A.B[2]-=12*bw;A.lean+=.22*bw;A.hp=.12+1.02*bw;A.hd=[6*bw,0,-10*bw];A.np=.4*bw;A.hk=.6;A.ch=.28*(1-bw);
    A.ft[0]=lerp3(FT0[0],[6,11,2.5],bw);A.ft[1]=lerp3(FT0[1],[6,-11,2.5],bw);A.blink=1-.6*bw;A.earL=A.earR=-.4*bw;
    A.cflash=pls(p,.53,.07);A.det=ez(sstep(.56,.74,p));A.pale=sstep(.56,.8,p);
    A.cline=p>=.62&&p<.8?sstep(.62,.8,p):p>=.8?1:-1;A.cup=0;A.bodyUp=sstep(.8,.93,p);A.body=p<.93?1:0;A.rib=p>=.78&&p<.97?(p-.78)/.19:-1;
    A.dawn=rise(p,.84,.9,.95,.995);A.mound=sstep(.84,.97,p);A.flw=sstep(.88,.99,p);A.edel=sstep(.9,1,p);A.lastDrop=p>=.9&&p<.985?(p-.9)/.085:-1}
  else{// FERMO: planted on wide legs, slow deep breaths (two a cycle, three in the second phase): the chest, the withers and the collar rise, the
    // icicles tinkle; on the breath out two puffs of frost; at each breath a pulse of aurora runs from the rosettes to the points; a drop of
    // light swells under a lance and falls (.3 left, .8 right; threads of light in the second phase); the head stays on you while the body
    // sways; heavy lids and a slow blink, the ears, the tail; it lowers the crown a little at you (.5-.6) and paws the snow (.82)
    const nb=P2?3:2,amp=P2?1.4:1,br=.5-.5*Math.cos(TAU*nb*p);A.br=br*amp;A.roll=.02*Math.sin(ph);A.B[2]=.4*br*amp;for(const i of[0,1,2,3])A.ft[i][1]+=i%2?-1.5:1.5;
    A.blink=blink(p,.62,.1);A.earL=.7*pls(p,.2,.08);A.earR=.7*pls(p,.45,.08);{const k=(p-.66)/.1;if(k>0&&k<1)A.tsw=Math.sin(k*TAU)*Math.sin(k*Math.PI)}
    A.coll=.05*Math.sin(TAU*nb*p-.6);A.lich=.22*Math.sin(TAU*2*p+.4);A.maneO=.05*(pw(p,.25,.12)+pw(p,.75,.12))*Math.sin(TAU*16*p);
    A.hp=.12+.18*pls(p,.55,.1);paw(A,1,p,.82);fx('snow',(p-.82)/.18,{i:1});
    for(const c of P2?[.05,.38,.72]:[.1,.6]){const k=(p-c)/.3;if(k>0&&k<1.3)A.runs.push({g:'beam',k:cl(k,0,1),a:1-sstep(.95,1.3,k),soft:1})}
    A.veinK=.55+.45*br;A.rose=.3*br;
    if(!P2){fx('drop',(p-.12)/.38,{sd:1});fx('drop',(p-.62)/.38,{sd:-1})}else A.starPulse=br;
    for(const c of P2?[.33,.66,.99]:[.35,.85])fx('breath',cyc(p,c)/.3,{});if(P2)fx('vapor',p)}
  A.tp=p*(anim==='idle'?3:anim==='rage'?2:1);   // the clock of the threads of light (whole cycles in the loops)
  return A}

// ------------------------------------------------------------------ pieces
// the body: one volume (chest and withers, barrel, rump) in three tones, the lighter belly, the fur and the muscles of the shoulder, the
// frost stars (lit into constellations in the second phase), the warm rim and the backlight of the aurora; the moss on the withers and the
// hips, the white cap of the collar
function bodyDraw(V0,X,A,K,J){const{P,F}=V0,br=A.br,TCb=[[TC[0][0],0,TC[0][2]+.4*br],TC[1],TC[2]],TRb=[[TR[0][0]*(1+.008*br),TR[0][1]*(1+.012*br),TR[0][2]*(1+.02*br)],TR[1],TR[2]];
  const pts=[];for(let i=0;i<3;i++)for(const q of ellSil(V0,TCb[i],TRb[i],null,X.T,14))pts.push(q);const hp=hullE(pts,.08);if(hp.length<3)return;
  const pa=hp.path=smoothP(hp);J.body=hp;J.TCb=TCb;J.TRb=TRb;J.bcut=null;ctx.lineJoin='round';
  if(GH){ctx.fillStyle=GG;ctx.fill(pa);ctx.strokeStyle=GWC;ctx.lineWidth=1.4;ctx.stroke(pa);return}
  const bb=bbox(hp);ctx.fillStyle=grad3(bb,K.coat);ctx.fill(pa);
  ctx.save();ctx.clip(pa);
  // the lighter belly (a wide cap under the barrel) and the inside of the thighs
  if(ellCap(V0,X,TCb[1],add(TRb[1],[.6,.6,.6]),AXES,[0,0,-1],1.0,24,{alv:.86,u:[1,0,0],ck:'sbel'})){ctx.fillStyle=grad3([bb[0],bb[1]+(bb[3]-bb[1])*.45,bb[2],bb[3]],K.belly);ctx.fill()}
  // the shade along the bottom, the soft shadow of the neck on the chest
  {const g=ctx.createLinearGradient(0,bb[1]+(bb[3]-bb[1])*.5,0,bb[3]);g.addColorStop(0,'rgba(8,10,30,0)');g.addColorStop(1,'rgba(8,10,30,.36)');ctx.fillStyle=g;ctx.fillRect(bb[0]-2,bb[1],bb[2]-bb[0]+4,bb[3]-bb[1]+2)}
  {const q=P(X.T([30,0,66])),g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],20);g.addColorStop(0,'rgba(8,10,30,.3)');g.addColorStop(1,'rgba(8,10,30,0)');ctx.fillStyle=g;ctx.fillRect(q[0]-20,q[1]-20,40,40)}
  // the fur: little C tufts and the two curves of the shoulder muscles (only what faces us)
  {const fp=new Path2D();for(const f of FUR){const n=X.Rd(ellN(TRb[f.e],AXES,f.m));if(F(n)<.2)continue;const q=P(X.T(ellAt(TCb[f.e],TRb[f.e],AXES,f.m))),a0=Math.atan2(-n[0]*.4,1)+(f.m[1]>0?.6:-.6);fp.moveTo(q[0]+2.3*Math.cos(a0),q[1]+2.3*Math.sin(a0));fp.arc(q[0],q[1],2.3,a0,a0+2.4)}
    ctx.strokeStyle='rgba(12,18,44,.42)';ctx.lineWidth=1.1;ctx.lineCap='round';ctx.stroke(fp);
    const mp=new Path2D();for(const cu of MUS){let st=true;for(const m of cu){const n=X.Rd(ellN(TRb[0],AXES,m));if(F(n)<.15){st=true;continue}const q=P(X.T(ellAt(TCb[0],TRb[0],AXES,m)));if(st){mp.moveTo(q[0],q[1]);st=false}else mp.lineTo(q[0],q[1])}}
    ctx.strokeStyle=rgba(K.coat.l,.42);ctx.lineWidth=1.3;ctx.stroke(mp)}
  starsDraw(V0,X,A,K,TCb,TRb);
  ctx.restore();
  ctx.strokeStyle=INK;ctx.lineWidth=2.8;ctx.stroke(pa);rimW(hp,.34);rimA(hp,K.back,K.backA);
  // the warm light of the crown on the withers
  glowTop(P(X.T([10,0,72])),22,.1);
  mossDraw(V0,X,A,K,TCb,TRb);collarCap(V0,X,K,TCb,TRb)}
// the frost stars: points of the surface drawn only where they face us (one path); lit in the second phase, joined by thin threads
function starsDraw(V0,X,A,K,TCb,TRb){const{P,F}=V0,sp=new Path2D(),dp=new Path2D(),S=[],lit=A.starK,N=STARS.length;
  for(const s of STARS){const n=X.Rd(ellN(TRb[s.e],AXES,s.m)),f=F(n);if(f<.12){S.push(null);continue}const q=P(X.T(ellAt(TCb[s.e],TRb[s.e],AXES,s.m))),r=3.5*Math.sqrt(cl((f-.12)*3,0,1));S.push(q);star4(sp,q,r);ballP(dp,q,.7)}
  if(!S.some(Boolean))return;
  if(A.constel>.02){const lp=new Path2D();for(const g of[-1,1]){const o=g<0?0:STF.length;for(const[a,b] of STL){const qa=S[o+a],qb=S[o+b];if(qa&&qb){lp.moveTo(qa[0],qa[1]);lp.lineTo(qb[0],qb[1])}}}
    const r0=S[2*STF.length];for(const k of[1,2]){const qb=S[2*STF.length+k];if(r0&&qb){lp.moveTo(r0[0],r0[1]);lp.lineTo(qb[0],qb[1])}}ctx.strokeStyle=`rgba(220,200,255,${(.35*A.constel).toFixed(3)})`;ctx.lineWidth=.9;ctx.stroke(lp)}
  ctx.fillStyle=rgba(K.star,.85);ctx.fill(sp);ctx.fillStyle='#ffffff';ctx.fill(dp);
  // lit (the second phase): each star in turn, a soft halo pulsing with the breath (still and without a halo on slow phones)
  if(lit>.01&&!LOWFX){const hp=new Path2D(),hp2=new Path2D();S.forEach((q,i)=>{if(!q||cl(lit*N-i*.8,0,1)<.5)return;ballP(hp,q,6);ballP(hp2,q,3)});
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${K.starG},${(.1+.08*A.starPulse).toFixed(3)})`;ctx.fill(hp);ctx.fillStyle=`rgba(${K.starG},${(.16+.1*A.starPulse).toFixed(3)})`;ctx.fill(hp2);ctx.restore()}}
// the moss: a mantle on the withers behind the mane (a scalloped edge with frosted tips) and two tufts on the hips; dark, lit only on top;
// little flowers of ice on it in the second phase
function mossGrad(b,T){const w=b[2]-b[0],h=b[3]-b[1],cx=(b[0]+b[2])/2,R=Math.max(w,h,2)*.78,g=ctx.createRadialGradient(cx-w*.14,b[1]+h*.1,R*.04,cx-w*.04,b[1]+h*.32,R);
  g.addColorStop(0,T.l);g.addColorStop(.3,T.b);g.addColorStop(.78,T.d);g.addColorStop(1,T.d);return g}
const MMANT=nrm([-.35,0,.94]),MHIP=[nrm([-.05,-.9,.42]),nrm([-.05,.9,.42])];
const mrf=t=>1+.12*Math.pow(Math.abs(Math.cos(t*5.5)),.7),mrf2=t=>1+.16*Math.pow(Math.abs(Math.cos(t*3.5)),.7);
function mossDraw(V0,X,A,K,TCb,TRb){if(GH)return;const{P,F}=V0;
  // (the tufts on the hips small and darker than the mantle: a little moss in the shade, never two green spots)
  for(let j=0;j<3;j++){const e=j?2:0,m=j?MHIP[j-1]:MMANT,al=j?.36:.66,alv=j?.2:.56,R2=add(TRb[e],j?[1.2,1.2,1.2]:[1.8,1.8,1.8]);
    const r=ellCap(V0,X,TCb[e],R2,AXES,m,al,j?20:33,{alv,u:[1,0,0],ck:j?'smh'+j:'smm',rf:j?mrf2:mrf});if(!r)continue;
    const q=P(X.T(ellAt(TCb[e],R2,AXES,m))),w=j?8:16,h=j?6:11,bb=[q[0]-w,q[1]-h,q[0]+w,q[1]+h];ctx.fillStyle=mossGrad(bb,j?T3(cmix(K.moss.l,K.moss.b,.6),cmix(K.moss.b,K.moss.d,.55),K.moss.d):K.moss);ctx.fill();ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=j?1.7:2.1;ctx.stroke();
    if(j)continue;
    // the frosted tips of the scallops of the mantle, and its little flowers of ice in the second phase
    const n=nrm(m);let u=sub([1,0,0],mul(n,dot([1,0,0],n)));u=nrm(u);const v=cross(n,u),tips=new Path2D(),fl=new Path2D();let nt=0;
    for(let k=0;k<11;k++){const t=k/11*TAU,c=Math.cos(t),s=Math.sin(t),a=1.12/Math.sqrt((c/al)*(c/al)+(s/alv)*(s/alv)),mm=add(mul(n,Math.cos(a)),add(mul(u,c*Math.sin(a)),mul(v,s*Math.sin(a)))),nn=X.Rd(ellN(R2,AXES,mm));
      if(F(nn)<.05)continue;ballP(tips,P(X.T(ellAt(TCb[e],add(R2,[.4,.4,.4]),AXES,mm))),1.15);nt++}
    if(nt){ctx.fillStyle=K.mTip;ctx.fill(tips)}
    if(A.k2>.5)for(const[a,b2] of[[.25,.2],[-.3,-.1],[.05,-.35]]){const mm=nrm(add(n,add(mul(u,a*al),mul(v,b2*alv))));if(F(X.Rd(ellN(R2,AXES,mm)))<.2)continue;const fq=P(X.T(ellAt(TCb[e],add(R2,[.3,.3,.3]),AXES,mm)));for(let i=0;i<5;i++){const an=i/5*TAU+a*7;ballP(fl,[fq[0]+Math.cos(an)*1.5,fq[1]+Math.sin(an)*1.1],1.05)}}
    if(A.k2>.5){ctx.fillStyle=K.flower;ctx.fill(fl);ctx.strokeStyle='rgba(60,70,120,.6)';ctx.lineWidth=.5;ctx.stroke(fl)}}}
// the white cap of the collar on the front of the chest (the locks hang over it)
function collarCap(V0,X,K,TCb,TRb){const R2=add(TRb[0],[1,1,1]),r=ellCap(V0,X,TCb[0],R2,AXES,nrm([.8,0,-.3]),.72,24,{alv:.6,u:[0,0,1],ck:'scol'});if(!r)return;
  const q=V0.P(X.T(ellAt(TCb[0],R2,AXES,nrm([.8,0,-.3])))),bb=[q[0]-16,q[1]-18,q[0]+16,q[1]+16];ctx.fillStyle=grad3(bb,K.frost);ctx.fill();ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke()}
// the locks of the collar (two rows on the throat and the chest) and the three little icicles under it: they sway with the breath and the
// step; a lock is drawn while its side of the chest faces us (the ones round the far side drop out)
function collarDraw(V0,X,A,K,J){if(GH)return;const{P,F}=V0,pa=new Path2D(),sp=new Path2D(),nd=J.nd||[0,0,0],bp=[[],[]];let n=0;
  for(const c of COLL){const nw=X.Rd(c.n),f=F(nw);if(f<-.32)continue;const b=add(X.T(c.b),c.row?[0,0,0]:mul(nd,.7)),d=nrm(X.Rd([.2+(c.row?0:.08),c.y*.025+A.coll*(c.row?.8:1.2),-1])),s=nrm(cross(d,nw));
    bp[c.row].push(P(add(b,mul(d,1.2))));const r=leafP(pa,P,b,d,s,c.L,2.3,nw,.35);n++;if(c.L>9.5){sp.moveTo(lerp(r[0][0],r[1][0],.18),lerp(r[0][1],r[1][1],.18));sp.quadraticCurveTo(lerp(r[2][0],r[3][0],.55),lerp(r[2][1],r[3][1],.55),lerp(r[0][0],r[1][0],.8),lerp(r[0][1],r[1][1],.8))}}
  if(n){const b0=P(X.T([40,0,66])),b1=P(X.T([32,0,36])),g=ctx.createLinearGradient(b0[0],b0[1],b1[0],b1[1]);g.addColorStop(0,K.frost.l);g.addColorStop(.55,K.frost.b);g.addColorStop(1,K.frost.d);
    // the soft white root of the locks (one band on the throat and one on the chest, joined): the locks grow out of a mane of frost,
    // never a row of white points on the dark chest
    const ba=new Path2D();for(let w=0;w<2;w++){const Z=bp[w],r=w?4.4:3.8;Z.forEach((q,i)=>{ballP(ba,q,r);if(i)ballP(ba,[(q[0]+Z[i-1][0])/2,(q[1]+Z[i-1][1])/2],r*.92)})}
    if(bp[0].length&&bp[1].length){const a=bp[0][bp[0].length>>1],b=bp[1][bp[1].length>>1];for(const k of[.33,.66])ballP(ba,[lerp(a[0],b[0],k),lerp(a[1],b[1],k)],4)}
    inkFill(ba,g,1.5);inkFill(pa,g,1.5);
    ctx.strokeStyle=rgba(K.fStr,.55);ctx.lineWidth=.8;ctx.stroke(sp)}
  // three little icicles under the collar
  if(F(X.Rd(nrm([.8,0,-.6])))>-.35){const ip=new Path2D(),lp=new Path2D();for(const[x,y,z,L] of[[32,5,38,4.5],[33,0,37,5],[32,-5,38,4.5]]){const b=P(X.T([x,y,z])),t=P(X.T([x+.6,y,z-L])),dx=t[0]-b[0],dy=t[1]-b[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*1.4,ny=dx/l*1.4;
      ip.moveTo(b[0]+nx,b[1]+ny);ip.lineTo(t[0],t[1]);ip.lineTo(b[0]-nx,b[1]-ny);ip.closePath();lp.moveTo(b[0]-nx*.3,b[1]-ny*.3);lp.lineTo(lerp(b[0],t[0],.6),lerp(b[1],t[1],.6))}
    ctx.fillStyle=K.ice.b;ctx.fill(ip);ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke(ip);ctx.strokeStyle=K.iceL;ctx.lineWidth=.7;ctx.stroke(lp)}}
// the neck: a chain of two capsules from the chest to the nape; its outline never drawn where it comes out of the body
function neckDraw(V0,N,A,K,J){const{P}=V0,Q=N.map(q=>P(q)),R=NKR.map(r=>r*(1+.01*A.br)),lw=GH?.7:1.4;ctx.lineJoin='round';
  const cut=J.body&&J.body.path;if(cut){if(!J.bcut){J.bcut=new Path2D();J.bcut.rect(-1e4,-1e4,2e4,2e4);J.bcut.addPath(J.body.path)}ctx.save();ctx.clip(J.bcut,'evenodd')}
  ctx.beginPath();capsP(ctx,Q[0],R[0]+lw,Q[1],R[1]+lw);capsP(ctx,Q[1],R[1]+lw,Q[2],R[2]+lw);ctx.fillStyle=GH?GWC:INK;ctx.fill();if(cut)ctx.restore();
  ctx.beginPath();capsP(ctx,Q[0],R[0]-lw,Q[1],R[1]-lw);capsP(ctx,Q[1],R[1]-lw,Q[2],R[2]-lw);ctx.fillStyle=GH?GG:limbGrad(Q[0],Q[2],R[1]+2,K.coat);ctx.fill();if(GH)return;
  // the lighter throat, the warm rim, the backlight of the aurora
  {const dx=Q[2][0]-Q[0][0],dy=Q[2][1]-Q[0][1],l=Math.hypot(dx,dy)||1;let nx=-dy/l,ny=dx/l;if(ny<0){nx=-nx;ny=-ny}ctx.save();ctx.clip();ctx.strokeStyle=rgba(K.belly.b,.5);ctx.lineWidth=7;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(Q[0][0]+nx*R[0]*.9,Q[0][1]+ny*R[0]*.9);ctx.quadraticCurveTo(Q[1][0]+nx*R[1]*.9,Q[1][1]+ny*R[1]*.9,Q[2][0]+nx*R[2]*.85,Q[2][1]+ny*R[2]*.85);ctx.stroke();ctx.restore()}
  C.rim(Q[1],R[1],Q[2],R[2],.3);if(!LOWFX){const dx=Q[2][0]-Q[0][0],dy=Q[2][1]-Q[0][1],l=Math.hypot(dx,dy)||1;let nx=-dy/l,ny=dx/l;if(nx+ny<0){nx=-nx;ny=-ny}
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${K.back},${(K.backA*.7).toFixed(3)})`;ctx.lineWidth=1.3;ctx.lineCap='round';ctx.beginPath();
    ctx.moveTo(Q[1][0]+nx*(R[1]-2),Q[1][1]+ny*(R[1]-2));ctx.lineTo(Q[2][0]+nx*(R[2]-2),Q[2][1]+ny*(R[2]-2));ctx.stroke();ctx.restore()}}
// the mane of ice: seven icicles on the crest of the neck and the withers, tilted back (upright when it rears, calls or rages), planted in
// tufts of frosty fur; longer and lit inside in the second phase
function maneDraw(V0,X,A,K,J,N){const{P,F,D}=V0,g=1+.3*A.grow,side=X.Rd(yawR([0,1,0],A.ny)),Z=X.Rd([0,0,1]),back=X.Rd([-1,0,0]),L=[];
  const ang=(A.mane>=0?lerp(.61,.087,cl(A.mane,0,1)):.61+.44*Math.min(1,-A.mane));
  MANE.forEach((m,i)=>{let b,up,bk;if(m.s>=0){const s=m.s,a=s<.5?N[0]:N[1],c=s<.5?N[1]:N[2],k=s<.5?s*2:s*2-1,ra=s<.5?NKR[0]:NKR[1],rc=s<.5?NKR[1]:NKR[2],ctr=lerp3(a,c,k),d=nrm(sub(c,a));
      up=nrm(cross(d,side));if(dot(up,Z)<0)up=mul(up,-1);bk=mul(d,-1);b=add(ctr,mul(up,lerp(ra,rc,k)*.93))}else{b=X.T([m.x,0,m.z-.6]);up=Z;bk=back}
    const an=ang+A.maneO*Math.sin(i*1.7+1),dir=nrm(add(mul(up,Math.cos(an)),mul(bk,Math.sin(an))));L.push({b,dir,h:m.h*g,up,bk,i,d:D(b)})});
  L.sort((a,b)=>a.d-b.d);J.mane=L;
  const ip=new Path2D(),lp=new Path2D(),tp=new Path2D();
  for(const m of L){const b=P(m.b),t=P(add(m.b,mul(m.dir,m.h))),dx=t[0]-b[0],dy=t[1]-b[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,w=1.9+m.h*.2,nx=-uy*w,ny=ux*w,mx=b[0]+dx*.22,my=b[1]+dy*.22;
    ip.moveTo(b[0]+nx*.8,b[1]+ny*.8);ip.lineTo(mx+nx,my+ny);ip.lineTo(t[0],t[1]);ip.lineTo(mx-nx,my-ny);ip.lineTo(b[0]-nx*.8,b[1]-ny*.8);ip.closePath();
    const sl=(nx+ny<0)?1:-1;lp.moveTo(mx+nx*.45*sl,my+ny*.45*sl);lp.lineTo(lerp(mx,t[0],.6)+nx*.2*sl,lerp(my,t[1],.6)+ny*.2*sl);
    if(!GH)leafP(tp,P,add(m.b,mul(m.up,-.8)),nrm(add(mul(m.bk,1),mul(m.up,.3))),nrm(cross(m.bk,m.up)),4.2+m.h*.1,1.7,m.up,.2)}
  ctx.lineJoin='round';const lt=A.maneLit;
  if(GH){ctx.fillStyle=GG;ctx.fill(ip);ctx.strokeStyle=GWC;ctx.lineWidth=1.4;ctx.stroke(ip);return}
  const bb=bbox(L.map(m=>P(m.b)).concat(L.map(m=>P(add(m.b,mul(m.dir,m.h))))));bb[1]-=4;
  const T=lt>.02?mixT(K.ice,T3('#ffffff',K.iceL,K.ice.b),lt*.6):K.ice;ctx.fillStyle=grad3(bb,T);ctx.fill(ip);ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke(ip);
  if(lt>.02&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${K.iceG},${(.55*lt).toFixed(3)})`;ctx.lineWidth=2.6;ctx.lineCap='round';ctx.stroke(lp);ctx.restore()}
  ctx.strokeStyle=K.iceL;ctx.lineWidth=.9;ctx.lineCap='round';ctx.stroke(lp);
  inkFill(tp,cmix(K.frost.b,K.frost.d,.45),1.3)}
// the tail: a short leaf, blue on top and white under it; up like a white flag in the charge
function tailDraw(V0,X,A,K){const{P,F}=V0,b=X.T([-42.5,0,58]),dl=nrm(add(lerp3([-.5,0,-.86],[-.62,0,.78],A.tail),[0,.55*A.tsw,0])),d=X.Rd(dl),s=X.Rd([0,1,0]),n=nrm(cross(d,s)),pa=new Path2D();
  const r=leafP(pa,P,b,d,s,11,2.6,n,-.25),under=F(n)>=0,bb=bbox([r[0],r[1],r[2],r[3]]);inkFill(pa,grad3(bb,under?K.frost:K.coat),1.6);
  if(!GH&&!under){const p2=new Path2D();leafP(p2,P,add(b,mul(d,6.5)),d,s,4.5,1.6,n,-.25);ctx.fillStyle=K.frost.b;ctx.fill(p2)}}
// a leg: two bones (ik), its root sliding inside the body, the sock of frost on the last 9 above the hoof with two tufts at the fetlock (in
// one ink with the leg), the split hoof with its frosted edge; the far legs darker; the front hooves turn white in the Stomp
function legGeo(X,A,i){const front=i<2,sd=i%2?-1:1,r0=RT0[i],root=X.T([r0[0]+A.rs[i],r0[1],r0[2]]),ft=A.ft[i];let foot=[ft[0],ft[1],ft[2]+1.5];
  if(A.fb[i]>0)foot=lerp3(foot,X.T(FBP[i]),A.fb[i]);
  const pole=X.Rd(front?[1,0,-.15]:[-1,0,-.1]),[L1,L2]=LEGL[i],dv=sub(foot,root),dl=len(dv),mx=L1+L2-.6;let rt=root;if(dl>mx)rt=add(root,mul(dv,Math.min(4,dl-mx)/dl));
  const[kn,en]=ik(rt,foot,L1,L2,pole);return{i,front,sd,root:rt,kn,en}}
function legDraw(V0,X,A,K,g,dark){const{P,F}=V0,R=LEGR[g.i],qa=P(g.root),qk=P(g.kn),qe=P(g.en),fw=X.Rd([1,0,0]),fh=nrm([fw[0],fw[1],1e-4]),side=nrm(cross([0,0,1],fh)),lw=GH?.7:1.1;
  const ink=new Path2D(),sock=new Path2D(),ld=nrm(sub(g.kn,g.en)),bk=mul(fh,-1);
  capsP(ink,qa,R[0]+lw,qk,R[1]+lw);capsP(ink,qk,R[1]+lw,qe,R[2]+lw);
  // the tufts at the back of the fetlock (in the same ink as the leg)
  const tufts=[];if(!GH)for(const s2 of[-1,1]){const b=add(add(g.en,mul(ld,7.2)),add(mul(bk,R[2]*.55),mul(side,s2*1.7))),d=nrm(add(mul(bk,.75),[0,0,-1])),s=nrm(cross(d,[0,0,1]));tufts.push([b,d,s])}
  for(const[b,d,s] of tufts)leafP(ink,P,b,d,s,6.2+lw,2.1+lw*.6);
  ctx.fillStyle=GH?GWC:INK;ctx.fill(ink);
  const T=dark>0?mixT(K.coat,T3(K.coat.b,K.coat.d,K.coat.d),dark):K.coat,fill=new Path2D();capsP(fill,qa,R[0]-lw,qk,R[1]-lw);capsP(fill,qk,R[1]-lw,qe,R[2]-lw);
  ctx.fillStyle=GH?GG:limbGrad(qa,qe,R[1]+3,T);ctx.fill(fill);
  if(!GH){const st=P(add(g.en,mul(ld,15.5))),sb=P(add(g.en,mul(ld,3)));capsP(sock,st,R[2]+.2-lw,sb,R[2]-lw);for(const[b,d,s] of tufts)leafP(sock,P,b,d,s,6.2,2.1);
    const FT=dark>0?mixT(K.frost,T3(K.frost.b,K.frost.d,K.frost.d),dark*.8):K.frost;ctx.fillStyle=limbGrad(st,sb,R[2]+2,FT);ctx.fill(sock);
    // the fur edge at the top of the sock
    const ax=sub(sb,st),l=Math.hypot(ax[0],ax[1])||1,nx=-ax[1]/l*(R[2]-.6),ny=ax[0]/l*(R[2]-.6);ctx.strokeStyle=rgba(K.fStr,.8);ctx.lineWidth=1;ctx.lineCap='round';ctx.beginPath();
    ctx.moveTo(st[0]+nx,st[1]+ny);ctx.quadraticCurveTo(st[0]+ax[0]/l*2.2,st[1]+ax[1]/l*2.2,st[0]-nx,st[1]-ny);ctx.stroke()}
  // the hoof: an ellipsoid along the way the body faces, tilted with the shin when the leg is up; a V in front, the frosted coronet
  const tilt=cl(1-ld[2],0,1),hu=nrm(lerp3(fh,mul(ld,-1),tilt*.35)),hw=nrm(cross(hu,side)),hc=add(g.en,add(mul(hu,1.3),mul(hw,2.7)));const Fr={u:hu,v:side,w:hw[2]<0?mul(hw,-1):hw};
  const hp=ellSil(V0,hc,[6,5,4.5],Fr,null,12),wk=g.front?A.hoofW:0;
  if(GH){ctx.beginPath();poly(hp);ctx.fillStyle=GG;ctx.fill();ctx.strokeStyle=GWC;ctx.lineWidth=1.4;ctx.stroke();return}
  let HT=dark>0?mixT(K.hoof,T3(K.hoof.b,K.hoof.d,K.hoof.d),dark):K.hoof;if(wk>.01)HT=mixT(HT,T3('#ffffff','#e6f6ff','#9ccbe8'),wk);
  poly(hp);ctx.fillStyle=grad3(bbox(hp),HT);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.1;ctx.stroke();
  {const N=14,cr=ringS(V0,add(hc,mul(Fr.w,2.7)),hu,side,4.6,N),nr=[],run=[];for(let k=0;k<N;k++){const a=k/N*TAU;nr.push(F(add(mul(hu,Math.cos(a)),mul(side,Math.sin(a))))>.05)}
    let s0=-1;for(let k=0;k<N;k++)if(nr[k]&&!nr[(k+N-1)%N]){s0=k;break}if(s0<0&&nr[0])s0=0;if(s0>=0)for(let j=0;j<N;j++){const k=(s0+j)%N;if(!nr[k])break;run.push(cr[k])}
    if(run.length>1){ctx.beginPath();for(const q of run)ctx.lineTo(q[0],q[1]);ctx.strokeStyle=rgba(K.hoofE,.9);ctx.lineWidth=1.6;ctx.lineCap='round';ctx.stroke()}}
  if(F(hu)>.12){const a=P(add(hc,add(mul(hu,5.6),mul(Fr.w,1.8)))),b=P(add(hc,add(mul(hu,6),mul(Fr.w,-3.8))));ctx.strokeStyle=rgba(HT.d,.9);ctx.lineWidth=1.3;seg(a,b);ctx.stroke()}
  if(wk>.05&&!LOWFX)shine('235,250,255',P(hc)[0],P(hc)[1],10,.5*wk)}
// the head: its own camera (Xh: design point → world). The far brow behind the skull; the white chin and the beard under the muzzle (the open
// mouth dark inside, no tongue); the skull and the muzzle in one volume, the lighter ridge and forehead, the dark sockets (never a pale mask:
// no skull); the eyes of ice blue under the heavy lids, the big dark shiny nose, the mouth, the two little fangs of ice, the near brow
function headDraw(V0,HX,A,K,J){const{P,F}=V0,HT=HX.T,HRd=HX.Rd,fwd=F(HRd([1,0,0]));
  const BRW=[-1,1].map(sd=>{const n=HRd(ellN(SKR,AXES,nrm([.6,.52*sd,.6])));return{sd,f:F(n)}});
  if(!GH)for(const w of BRW)if(w.f<.1)browDraw(V0,HX,A,K,w.sd,1);
  jawDraw(V0,HX,A,K);
  const pts=ellSil(V0,SKC,SKR,null,HT,16).concat(ellSil(V0,MZC,MZR,null,HT,14)),hp=hullE(pts,.08);if(hp.length<3)return;const pa=hp.path=smoothP(hp),bb=bbox(hp);J.head=hp;
  ctx.lineJoin='round';if(GH){ctx.fillStyle=GG;ctx.fill(pa);ctx.strokeStyle=GWC;ctx.lineWidth=1.4;ctx.stroke(pa);return}
  ctx.fillStyle=grad3(bb,K.coat);ctx.fill(pa);
  ctx.save();ctx.clip(pa);
  // the ridge of the muzzle and the forehead, a shade lighter; the dark under the brows
  if(ellCap(V0,HX,MZC,add(MZR,[.6,.6,.6]),AXES,nrm([.22,0,1]),.9,20,{alv:.62,u:[1,0,0],ck:'smz'})){ctx.fillStyle=grad3(bb,K.muz);ctx.fill()}
  if(ellCap(V0,HX,SKC,add(SKR,[.5,.5,.5]),AXES,nrm([.66,0,.75]),.55,20,{alv:.46,u:[0,0,1],ck:'sfh'})){ctx.globalAlpha*=.85;ctx.fillStyle=grad3(bb,K.muz);ctx.fill();ctx.globalAlpha/=.85}
  for(const sd of[-1,1]){const m=nrm([.72,.62*sd,.3]),c=ellAt(SKC,SKR,AXES,m),f=F(HRd(ellN(SKR,AXES,m)));if(f<.05)continue;const q=P(HT(add(c,[0,0,.8]))),g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],8.5);
    g.addColorStop(0,'rgba(20,30,51,.55)');g.addColorStop(1,'rgba(20,30,51,0)');ctx.fillStyle=g;ctx.fillRect(q[0]-9,q[1]-9,18,18)}
  // the soft shadow of the jaw line, the warm light on top of the skull (and the light of the crown on it when it burns)
  {const q=P(HT([54,0,96]));glowTop(q,14,.12);if(!LOWFX&&A.crownGlow>.05)shine(litRgb(A),q[0],q[1]-3,14,.25*A.crownGlow)}
  // the mouth: a simple line under the muzzle (open in the bellows: see the jaw)
  if(A.jaw<.12&&F(HRd(nrm([.6,0,-.8])))>-.3){const a=P(HT([63.2,-4.6,75.6])),m=P(HT([68.8,0,74.6])),b=P(HT([63.2,4.6,75.6]));ctx.strokeStyle=K.lid;ctx.lineWidth=1.3;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(m[0]*2-(a[0]+b[0])/2,m[1]*2-(a[1]+b[1])/2,b[0],b[1]);ctx.stroke()}
  // the nose: a big dark shiny cap on the tip of the muzzle, its nostrils (they flare in the snorts)
  {const r=ellCap(V0,HX,MZC,add(MZR,[.35,.35,.35]),AXES,nrm([1,0,.12]),.62,18,{alv:.5,u:[0,0,1],ck:'snos'});if(r){ctx.fillStyle=K.nose;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
      const hq=P(HT(ellAt(MZC,add(MZR,[.5,.5,.5]),AXES,nrm([1,0,.42]))));ctx.fillStyle=rgba(K.noseL,.9);ctx.beginPath();ctx.ellipse(hq[0]-.6,hq[1]-.2,2.2,1,0,0,TAU);ctx.fill();
      const np=new Path2D();for(const sd of[-1,1]){const mm=nrm([1,.34*sd,-.04]);if(F(HRd(ellN(MZR,AXES,mm)))<.1)continue;const q=P(HT(ellAt(MZC,add(MZR,[.4,.4,.4]),AXES,mm)));np.moveTo(q[0]+1.2+.7*A.nost,q[1]);np.ellipse(q[0],q[1],1.2+.7*A.nost,.85+.4*A.nost,0,0,TAU)}ctx.fillStyle='#05070e';ctx.fill(np)}}
  ctx.restore();
  ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke(pa);rimW(hp,.3);rimA(hp,K.back,K.backA);
  eyesDraw(V0,HX,A,K,J);
  // the two little fangs of ice from the upper lip
  if(fwd>-.3){ctx.save();ctx.globalAlpha*=cl((fwd+.3)*3,0,1);for(const sd of[-1,1]){if(F(HRd(nrm([.55,.8*sd,-.2])))<-.6)continue;const a=P(HT([66,3*sd,75.6])),b=P(HT([66.6,3.2*sd,72.4]));
    ctx.fillStyle=K.fang;ctx.strokeStyle=INK;ctx.lineWidth=.8;C.tri(a[0],a[1],b[0],b[1],1.05);ctx.strokeStyle=K.fangD;ctx.lineWidth=.6;seg([a[0]+.4,a[1]],[lerp(a[0],b[0],.7)+.2,lerp(a[1],b[1],.7)]);ctx.stroke()}ctx.restore()}
  for(const w of BRW)if(w.f>=.1)browDraw(V0,HX,A,K,w.sd,0)}
// a brow of frost: a wedge from the inner end (low, toward the nose) to the outer end (thick); raised and opened in the bellow and the rage
function browDraw(V0,HX,A,K,sd,far){const{P,F}=V0,HT=HX.T,br=A.brow,sq=A.squint;
  const I=[59.6,(3.2+1.4*br)*sd,92.4+2.2*br-1.6*sq],O=[52.4,10.4*sd,91.4+1.3*br],on=q=>{const m=nrm([(q[0]-SKC[0])/SKR[0],(q[1]-SKC[1])/SKR[1],(q[2]-SKC[2])/SKR[2]]);return{p:add(ellAt(SKC,SKR,AXES,m),mul(ellN(SKR,AXES,m),1.1)),n:ellN(SKR,AXES,m)}};
  const a=on(I),b=on(O),e=nrm(sub(b.p,a.p)),ua=nrm(cross(a.n,e)),ub=nrm(cross(b.n,e)),up=v=>v[2]<0?mul(v,-1):v,u1=up(ua),u2=up(ub);
  const pts=[add(a.p,mul(u1,.7)),add(b.p,mul(u2,2.8)),add(add(b.p,mul(e,2)),mul(u2,.5)),add(b.p,mul(u2,-1.5)),add(a.p,mul(u1,-.7))].map(q=>P(HT(q)));
  ctx.save();if(far)ctx.globalAlpha*=.9;ctx.lineJoin='round';poly(pts);ctx.fillStyle=grad3(bbox(pts),K.brow);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(lerp(pts[0][0],pts[1][0],.15),lerp(pts[0][1],pts[1][1],.15)-.2);ctx.lineTo(lerp(pts[0][0],pts[1][0],.8),lerp(pts[0][1],pts[1][1],.8)-.2);ctx.stroke();ctx.restore()}
// the lower jaw: the white chin and lower lip (turned down round its hinge when the mouth opens on its dark inside), the beard of three locks
function jawDraw(V0,HX,A,K){const{P}=V0,HT=HX.T,ja=A.jaw*.42,rj=q=>add(JH,pitR(sub(q,JH),ja)),Fr={u:pitR([1,0,0],ja),v:[0,1,0],w:pitR([0,0,1],ja)};
  if(GH){const hp=ellSil(V0,rj(JWC),JWR,Fr,HT,12);poly(hp);ctx.fillStyle=GG;ctx.fill();ctx.strokeStyle=GWC;ctx.lineWidth=1.4;ctx.stroke();return}
  if(ja>.02){const up=[[52,-4.6,75.4],[60,-4.5,75],[66.6,-3.2,74.9],[68.6,0,74.9],[66.6,3.2,74.9],[60,4.5,75],[52,4.6,75.4]],lo=up.slice().reverse().map(q=>rj([q[0],q[1]*.95,q[2]-.6]));
    const pts=up.concat(lo).map(q=>P(HT(q)));poly(pts);ctx.fillStyle=K.mouth;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke()}
  const hp=ellSil(V0,rj(JWC),JWR,Fr,HT,12);poly(hp);ctx.fillStyle=grad3(bbox(hp),K.frost);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
  // the beard: three white locks under the chin
  const pa=new Path2D();for(const[x,y,L] of[[57.5,-2.6,4.8],[60.5,0,6],[57.5,2.6,4.8]]){const b=HT(rj([x,y,71.4])),d=HX.Rd(pitR(nrm([-.32,y*.05,-1]),ja)),s=HX.Rd([0,1,0]);leafP(pa,P,b,d,s,L,1.7)}
  inkFill(pa,K.frost.b,1.3)}
// the eyes: almonds of ice blue (a light core, a darker rim, the point of light) under the heavy upper lid that covers 30% (the inner end comes
// down toward the nose when it narrows them); a soft light round them, a double halo for a moment in the flashes; violet in the second phase
function eyesDraw(V0,HX,A,K,J){const{P,F}=V0,HT=HX.T,HRd=HX.Rd,open=Math.min(A.blink,A.eyeOn),lidK=A.lid+(1-A.lid)*(1-open);
  for(const sd of[-1,1]){const m=nrm([.72,.62*sd,.3]),n=ellN(SKR,AXES,m),f=F(HRd(n));if(f<.06)continue;const c=add(ellAt(SKC,SKR,AXES,m),mul(n,.3));
    let eA=nrm(cross([0,0,1],n));if(eA[0]>0)eA=mul(eA,-1);let eB=nrm(cross(eA,n));if(eB[2]<0)eB=mul(eB,-1);
    const ca=Math.cos(.2),sa=Math.sin(.2),u=add(mul(eA,ca),mul(eB,sa)),w=add(mul(eB,ca),mul(eA,-sa)),at=(xx,yy)=>P(HT(add(c,add(mul(u,xx),mul(w,yy)))));
    const pts=[];for(let i=0;i<16;i++){const t=i/16*TAU,s=Math.sin(t);pts.push(at(5.2*Math.cos(t),3.6*s*(.3+.7*Math.pow(Math.abs(s),1.1))))}
    const q=at(-.4,-.4-1.2*A.lookD),vis=cl((f-.06)*5,0,1);ctx.save();ctx.globalAlpha*=vis;
    if(open>.05)glowL(K.eyeG,q,10,.3*open*cl(f*2,0,1));if(A.eflash>0){glowL(K.eyeG,q,10,.9*A.eflash);glowL(K.eyeG,q,20,.6*A.eflash)}
    poly(pts);const g=ctx.createRadialGradient(q[0]-.6,q[1]-.5,.3,q[0],q[1],5.4);g.addColorStop(0,'#ffffff');g.addColorStop(.25,K.irisL);g.addColorStop(1,K.irisD);ctx.fillStyle=g;ctx.fill();
    // the heavy upper lid (the inner end lower when it narrows the eyes); shut, the lid covers it all
    ctx.save();ctx.clip();const yl=x=>3.6*(1-2*lidK)-1.7*A.squint*sstep(-5.2,5.2,-x),lp=[];for(let i=0;i<=8;i++){const x=5.6-i*1.4;lp.push(at(x,yl(x)))}
    ctx.beginPath();ctx.moveTo(lp[0][0],lp[0][1]);for(const z of lp)ctx.lineTo(z[0],z[1]);const t1=at(-5.6,6),t0=at(5.6,6);ctx.lineTo(t1[0],t1[1]);ctx.lineTo(t0[0],t0[1]);ctx.closePath();ctx.fillStyle=K.lid;ctx.fill();
    ctx.beginPath();ctx.moveTo(lp[0][0],lp[0][1]);for(const z of lp)ctx.lineTo(z[0],z[1]);ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();ctx.restore();
    poly(pts);ctx.strokeStyle=K.irisE;ctx.lineWidth=1.1;ctx.lineJoin='round';ctx.stroke();ctx.strokeStyle=INK;ctx.lineWidth=.6;ctx.stroke();
    // the point of light (under the lid)
    const yh=yl(-1.2)-1.3-1.1*A.lookD;if(lidK<.78&&yh>-3)ball(at(-1.4,Math.min(yh,1.2)),.95),ctx.fillStyle='#ffffff',ctx.fill();
    ctx.restore()}}
// an ear: a wide leaf out and back from the side of the skull, the coat outside and the frost inside, a dark tip with a little icicle that
// tinkles; forward when it listens, flat back when it is angry
function earDraw(V0,HX,A,K,sd){const{P,F}=V0,HT=HX.T,HRd=HX.Rd,ang=sd>0?A.earL:A.earR,d0=[-.64,.76*sd,.04];
  // (out and back nearly level, under the beam of the antler: up they would hide behind it)
  const dl=nrm(ang>=0?lerp3(d0,[.12,.92*sd,.3],ang):lerp3(d0,[-.95,.28*sd,0],-ang)),b=HT([42.5,10*sd,92]),d=HRd(dl),n0=HRd(nrm([.6,.2*sd,.75])),s=nrm(cross(n0,d)),n=nrm(cross(d,s));
  // (a thin volume, the front leaf and its back a little behind it: edge on it is still an ear, never a stick)
  const pa=new Path2D(),r=leafP(pa,P,b,d,s,14,3.7,n,.3);leafP(pa,P,add(b,mul(n,-1.5)),d,s,13.2,3.4,n,.3);
  if(GH){inkFill(pa,GG,1.4);return}
  inkFill(pa,grad3(bbox(r),K.coat),1.8);
  // the frost inside the ear, shown as the inside turns toward us (no sudden swap of colours)
  const fi=sstep(-.12,.2,F(n));if(fi>.01){const ip=new Path2D(),ri=leafP(ip,P,add(b,mul(d,1.2)),d,s,11.5,2.8,n,.3);ctx.save();ctx.globalAlpha*=fi;ctx.fillStyle=grad3(bbox(ri),K.frost);ctx.fill(ip);
    const iq=new Path2D();leafP(iq,P,add(b,mul(d,3)),d,s,7.5,1.4,n,.3);ctx.fillStyle=rgba(K.frost.d,.55);ctx.fill(iq);ctx.restore()}
  // the dark tip, the little icicle hanging from it
  const tp=new Path2D(),tb=add(b,mul(d,9.8));leafP(tp,P,tb,d,s,4.2,1.7,n,.3);ctx.fillStyle=K.lid;ctx.fill(tp);
  const tip=add(add(b,mul(d,14)),mul(n,.3*14*.4)),ice=add(tip,[.4*A.maneO*8,0,-3.2]),q0=P(tip),q1=P(ice);ctx.fillStyle=K.ice.l;ctx.strokeStyle=INK;ctx.lineWidth=.8;C.tri(q0[0],q0[1],q1[0],q1[1],1.1)}
// the light that runs (the warning before a blow): a bright thread from the start of the path to k (by length), a pearl at its head
function runDraw(path,k,al,rgb,soft){if(k<=0||al<=.01||path.length<2)return;let Lt=0;const sg=[];for(let i=1;i<path.length;i++){const l=Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]);sg.push(l);Lt+=l}
  let left=Lt*Math.min(1,k);const pts=[path[0]];for(let i=1;i<path.length&&left>0;i++){const l=sg[i-1];if(left>=l){pts.push(path[i]);left-=l}else{const t=left/l;pts.push([lerp(path[i-1][0],path[i][0],t),lerp(path[i-1][1],path[i][1],t)]);left=0}}
  // (the soft pulse of the breath: only its head shows, a short bright stretch fading behind it)
  if(soft){const tail=Math.max(0,Lt*Math.min(1,k)-14);let acc=0,i0=0;for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(acc+l<tail){acc+=l;i0=i}else break}
    const sp=pts.slice(i0);if(sp.length<2)return;ctx.save();ctx.globalAlpha*=Math.min(1,al)*.75;ctx.lineCap='round';const q=sp[sp.length-1],g=ctx.createLinearGradient(sp[0][0],sp[0][1],q[0],q[1]);g.addColorStop(0,`rgba(${rgb},0)`);g.addColorStop(1,`rgba(${mixRgb(rgb,'255,255,255',.5)},.95)`);
    ctx.strokeStyle=g;ctx.lineWidth=1.6;ctx.beginPath();for(const z of sp)ctx.lineTo(z[0],z[1]);ctx.stroke();if(k<.995){if(!LOWFX)shine(rgb,q[0],q[1],6,.45);ctx.fillStyle='rgba(255,255,255,.9)';ball(q,1.3);ctx.fill()}ctx.restore();return}
  ctx.save();ctx.globalAlpha*=Math.min(1,al);ctx.lineCap='round';ctx.lineJoin='round';
  if(!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${rgb},.38)`;ctx.lineWidth=4;ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.globalCompositeOperation='source-over'}
  ctx.strokeStyle=`rgb(${mixRgb(rgb,'255,255,255',.55)})`;ctx.lineWidth=1.5;ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.stroke();
  if(k<.995){const q=pts[pts.length-1];if(!LOWFX)shine(rgb,q[0],q[1],9,.7);ctx.fillStyle='#ffffff';ball(q,2.1);ctx.fill()}ctx.restore()}
// a crystal: a chunky diamond (the lit half, the shaded half, the white line on the lit facet) from the screen point b to the tip e
function diamond(b,e,w){let dx=e[0]-b[0],dy=e[1]-b[1],l=Math.hypot(dx,dy);if(l<w*1.3){const m=[(b[0]+e[0])/2,(b[1]+e[1])/2];if(l<.2){dx=0;dy=-1;l=1}const ux=dx/l,uy=dy/l,h=w*1.2;b=[m[0]-ux*h,m[1]-uy*h];e=[m[0]+ux*h,m[1]+uy*h];dx=e[0]-b[0];dy=e[1]-b[1];l=Math.hypot(dx,dy)}
  const ux=dx/l,uy=dy/l;let vx=-uy,vy=ux;if(vx+vy>0){vx=-vx;vy=-vy}const m=[b[0]+dx*.42,b[1]+dy*.42],L=[m[0]+vx*w,m[1]+vy*w],Dk=[m[0]-vx*w,m[1]-vy*w];return{b,e,m,L,D:Dk}}
// an antler (design space of the head: TA a point, TD a direction): the lichens hanging from the lance, the beam and the shafts of the
// points (one ink round them all; old dark ice near the head with three knots, lighter outward; a light and a dark side), the vein of
// aurora inside it and the light that runs, the round palm of crystal, the crystals of the points (the lit ones with a white heart and a
// glow on them only), the rosette of antique gold, the flames of aurora of the second phase
function antDraw(V0,TA,TD,A,K,sd,G,o){const{P,F}=V0,lit=litRgb(A),pale=A.pale||0,KB=pale>0?mixT(K.beam,PALE.beam,pale):K.beam,KC=pale>0?mixT(K.crys,PALE.crys,pale):K.crys;
  const Bs=G.B.map(q=>P(TA(q))),TT=[];
  for(const t of G.T){if(t.i>=6&&(A.p78<.02||GH))continue;const k78=t.i>=6?A.p78:1,e=t.i>=6?add(t.b,mul(t.d,t.Lc*k78)):t.t;TT.push({t,s:P(TA(t.s)),b:P(TA(t.b)),e:P(TA(e)),w:t.w*(t.i>=6?.6+.4*k78:1),L:GH?0:(A.tl[t.i]||0)})}
  if(!GH&&!o.noLich)lichDraw(V0,TA,TD,A,K,G);
  const ink=new Path2D(),fill=new Path2D(),lw=GH?.7:.9;
  for(let i=0;i<4;i++){capsP(ink,Bs[i],G.BR[i]+lw,Bs[i+1],G.BR[i+1]+lw);capsP(fill,Bs[i],G.BR[i]-lw,Bs[i+1],G.BR[i+1]-lw)}
  for(const z of TT){if(z.t.palm)continue;capsP(ink,z.s,z.t.r0+lw,z.b,z.t.r1+lw);capsP(fill,z.s,z.t.r0-lw,z.b,z.t.r1-lw)}
  if(!GH){const a=Bs[0],b=Bs[1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;for(const[k,s2,r] of KNOT){const q=[a[0]+dx*k+nx*s2*G.BR[0]*.62,a[1]+dy*k+ny*s2*G.BR[0]*.62];ballP(ink,q,r+lw);ballP(fill,q,r-lw)}}
  ctx.fillStyle=GH?GWC:INK;ctx.fill(ink);
  if(GH)ctx.fillStyle=GG;else{const g=ctx.createLinearGradient(Bs[0][0],Bs[0][1],Bs[4][0],Bs[4][1]);g.addColorStop(0,cmix(KB.d,KB.b,.55));g.addColorStop(.45,KB.b);g.addColorStop(1,cmix(KB.l,KC.b,.45));ctx.fillStyle=g}ctx.fill(fill);
  if(!GH){// the dark side and the light side of every piece (one stroke each)
    const lt=new Path2D(),dkp=new Path2D(),side=(a,b,ra,rb)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(l<1.5)return;let nx=-dy/l,ny=dx/l;if(nx+ny>0){nx=-nx;ny=-ny}const ux=dx/l,uy=dy/l;
      lt.moveTo(a[0]+nx*ra*.42+ux*ra*.3,a[1]+ny*ra*.42+uy*ra*.3);lt.lineTo(b[0]+nx*rb*.42-ux*rb*.3,b[1]+ny*rb*.42-uy*rb*.3);dkp.moveTo(a[0]-nx*ra*.48+ux*ra*.3,a[1]-ny*ra*.48+uy*ra*.3);dkp.lineTo(b[0]-nx*rb*.48-ux*rb*.3,b[1]-ny*rb*.48-uy*rb*.3)};
    for(let i=0;i<4;i++)side(Bs[i],Bs[i+1],G.BR[i],G.BR[i+1]);for(const z of TT)if(!z.t.palm)side(z.s,z.b,z.t.r0,z.t.r1);
    ctx.lineCap='round';ctx.strokeStyle=rgba(KB.d,.65);ctx.lineWidth=2;ctx.stroke(dkp);ctx.strokeStyle='rgba(236,250,255,.32)';ctx.lineWidth=1.1;ctx.stroke(lt);
    // the vein of aurora inside the beam (it breathes); a plain light line on slow phones
    const vk=A.veinK*(1-pale);if(vk>.02){const v=new Path2D();v.moveTo(lerp(Bs[0][0],Bs[1][0],.3),lerp(Bs[0][1],Bs[1][1],.3));for(let i=1;i<4;i++)v.lineTo(Bs[i][0],Bs[i][1]);v.lineTo(Bs[4][0],Bs[4][1]);
      if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${lit},${(.13*vk).toFixed(3)})`;ctx.lineWidth=2.6;ctx.stroke(v);ctx.restore()}ctx.strokeStyle=`rgba(200,255,240,${(.32*vk).toFixed(3)})`;ctx.lineWidth=.8;ctx.stroke(v)}
    for(const r of A.runs){const path=r.g==='lance'?[Bs[0],TT[0].s,TT[0].e]:Bs;runDraw(path,r.k,r.a*(1-pale),r.vio?VIO:lit,r.soft)}}
  // the palm: a jagged plate of crystal, wider than tall, its heart a little raised: a fan of facets, each lit by where it faces
  {const c=TA(G.pc),n=TD(G.pn),[u,v]=frm(n,[0,0,1]),H=[],c3=add(c,mul(n,1.6));
    for(let k=0;k<PLT.length;k++){const a=k/PLT.length*TAU,r=PLT[k];H.push(add(c,add(mul(u,Math.cos(a)*8.2*r),mul(v,Math.sin(a)*11*r*sd))))}
    const Q=H.map(q=>P(q)),qc=P(c3);
    if(Q.length>2){const pk=Math.max(A.palm,A.tl[3]*.6,.3*Math.min(1,A.flameK||0)),T=GH?null:pk>.02?mixT(KC,T3('#ffffff',`rgb(${lit})`,KC.b),pk*.7):KC;
      ctx.beginPath();ctx.moveTo(Q[0][0],Q[0][1]);for(let k=1;k<Q.length;k++)ctx.lineTo(Q[k][0],Q[k][1]);ctx.closePath();
      ctx.lineJoin='round';ctx.strokeStyle=GH?GWC:INK;ctx.lineWidth=GH?2.8:3.6;ctx.stroke();ctx.fillStyle=GH?GG:T.b;ctx.fill();
      if(!GH){const fl=[new Path2D(),new Path2D(),new Path2D()];
        for(let k=0;k<H.length;k++){const a=H[k],b=H[(k+1)%H.length];let nf=nrm(cross(sub(a,c3),sub(b,c3)));if(F(nf)<0)nf=mul(nf,-1);const l=.6*nf[2]+.4*F(nf)+(k%2?.08:-.08);
          const w=fl[l>.5?0:l>.18?1:2];w.moveTo(qc[0],qc[1]);w.lineTo(Q[k][0],Q[k][1]);w.lineTo(Q[(k+1)%Q.length][0],Q[(k+1)%Q.length][1]);w.closePath()}
        ctx.fillStyle=T.l;ctx.fill(fl[0]);ctx.fillStyle=cmix(T.b,T.d,.45);ctx.fill(fl[2]);
        const ed=new Path2D();for(let k=0;k<Q.length;k+=2){ed.moveTo(qc[0],qc[1]);ed.lineTo(lerp(qc[0],Q[k][0],.92),lerp(qc[1],Q[k][1],.92))}ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=.8;ctx.stroke(ed);
        if(pk>.05&&!LOWFX)shine(lit,qc[0],qc[1],16,.4*pk)}}}
  // the crystals of the points
  const Lh=new Path2D(),Dh=new Path2D(),Wl=new Path2D(),DM=[];
  for(const z of TT){const d=diamond(z.b,z.e,z.w);DM.push([d,z]);Lh.moveTo(d.b[0],d.b[1]);Lh.lineTo(d.L[0],d.L[1]);Lh.lineTo(d.e[0],d.e[1]);Lh.closePath();Dh.moveTo(d.b[0],d.b[1]);Dh.lineTo(d.e[0],d.e[1]);Dh.lineTo(d.D[0],d.D[1]);Dh.closePath();
    Wl.moveTo(lerp(d.b[0],d.L[0],.55),lerp(d.b[1],d.L[1],.55));Wl.lineTo(lerp(d.e[0],d.L[0],.32),lerp(d.e[1],d.L[1],.32))}
  ctx.lineJoin='round';
  if(GH){ctx.fillStyle=GG;ctx.fill(Lh);ctx.fill(Dh);ctx.strokeStyle=GWC;ctx.lineWidth=1.2;for(const[d] of DM){ctx.beginPath();ctx.moveTo(d.b[0],d.b[1]);ctx.lineTo(d.L[0],d.L[1]);ctx.lineTo(d.e[0],d.e[1]);ctx.lineTo(d.D[0],d.D[1]);ctx.closePath();ctx.stroke()}return}
  ctx.fillStyle=cmix(KC.b,KC.d,.38);ctx.fill(Dh);ctx.fillStyle=KC.l;ctx.fill(Lh);
  const Ol=new Path2D();for(const[d] of DM){Ol.moveTo(d.b[0],d.b[1]);Ol.lineTo(d.L[0],d.L[1]);Ol.lineTo(d.e[0],d.e[1]);Ol.lineTo(d.D[0],d.D[1]);Ol.closePath()}ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke(Ol);
  ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=.9;ctx.lineCap='round';ctx.stroke(Wl);
  // the lit points: the colour of the light, a white heart, a glow only on them (only the colour on slow phones)
  const lc=`rgb(${lit})`,ll=cmix('#ffffff',lc,.3);for(const[d,z] of DM){const L=z.L*(1-pale);if(L<=.02)continue;ctx.save();ctx.globalAlpha*=Math.min(1,L);
    ctx.beginPath();ctx.moveTo(d.b[0],d.b[1]);ctx.lineTo(d.L[0],d.L[1]);ctx.lineTo(d.e[0],d.e[1]);ctx.closePath();ctx.fillStyle=ll;ctx.fill();ctx.beginPath();ctx.moveTo(d.b[0],d.b[1]);ctx.lineTo(d.e[0],d.e[1]);ctx.lineTo(d.D[0],d.D[1]);ctx.closePath();ctx.fillStyle=lc;ctx.fill();
    ctx.beginPath();ctx.moveTo(d.b[0],d.b[1]);ctx.lineTo(d.L[0],d.L[1]);ctx.lineTo(d.e[0],d.e[1]);ctx.lineTo(d.D[0],d.D[1]);ctx.closePath();ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke();
    const c=[lerp(d.m[0],d.e[0],.25),lerp(d.m[1],d.e[1],.25)];ctx.beginPath();ctx.moveTo(lerp(c[0],d.b[0],.4),lerp(c[1],d.b[1],.4));ctx.lineTo(lerp(c[0],d.L[0],.45),lerp(c[1],d.L[1],.45));ctx.lineTo(lerp(c[0],d.e[0],.45),lerp(c[1],d.e[1],.45));ctx.lineTo(lerp(c[0],d.D[0],.45),lerp(c[1],d.D[1],.45));ctx.closePath();ctx.fillStyle='#ffffff';ctx.fill();
    ctx.restore();if(!LOWFX&&L>.2)shine(lit,d.e[0]*.6+d.m[0]*.4,d.e[1]*.6+d.m[1]*.4,9,.55*Math.min(1,L))}
  // the rosette of antique gold: a ring of seven buttons round the root of the beam (the half that faces us, over the beam)
  if(!o.noRose)roseDraw(V0,TA(G.R0),TD(G.d0),K,A,lit)
  // the flames of aurora on the points (the second phase): they flicker under 8 Hz with the game's clock
  if(A.flameK>.02&&!LOWFX&&!pale){const t0=G.t||0,fp=new Path2D(),cp=new Path2D();let y0=1e9,y1=-1e9;
    for(const[d,z] of DM){const h=(8.5+2*Math.sin(t0*TAU*5.2+z.t.i*1.9+sd))*Math.min(1.35,A.flameK),q=d.e,sw=.8*Math.sin(t0*TAU*3.1+z.t.i);y0=Math.min(y0,q[1]-h);y1=Math.max(y1,q[1]);
      fp.moveTo(q[0]-2.6,q[1]+.6);fp.quadraticCurveTo(q[0]-2.4,q[1]-h*.5,q[0]+sw,q[1]-h);fp.quadraticCurveTo(q[0]+2.4,q[1]-h*.5,q[0]+2.6,q[1]+.6);fp.closePath();
      cp.moveTo(q[0]-1.1,q[1]);cp.quadraticCurveTo(q[0]-1,q[1]-h*.32,q[0]+sw*.6,q[1]-h*.55);cp.quadraticCurveTo(q[0]+1,q[1]-h*.32,q[0]+1.1,q[1]);cp.closePath()}
    const g=ctx.createLinearGradient(0,y1,0,y0);g.addColorStop(0,'rgba(125,255,176,.75)');g.addColorStop(.55,'rgba(195,140,255,.7)');g.addColorStop(1,'rgba(255,122,208,.55)');
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=Math.min(1,A.flameK);ctx.fillStyle=g;ctx.fill(fp);ctx.fillStyle='rgba(255,255,255,.75)';ctx.fill(cp);ctx.restore();
    const pq=P(TA(G.pc));shine('190,140,255',pq[0],pq[1]-4,20,.3*Math.min(1,A.flameK))}}
// two threads of lichen hanging from the lance, each with two knots (they swing; still on slow phones)
function lichDraw(V0,TA,TD,A,K,G){const{P}=V0,z=G.T[0],side=TD([0,1,0]),pa=new Path2D(),kp=new Path2D();
  for(const[k,ph] of[[.74,0],[.93,1.3]]){const a=TA(lerp3(z.s,z.b,k)),th=LOWFX?0:A.lich*(1+.3*ph)*Math.cos(ph),sw=Math.sin(th),m=add(a,add([0,0,-4.6],mul(side,sw*2.2))),e=add(a,add([0,0,-9*Math.cos(th)],mul(side,sw*9*.5)));
    const qa=P(a),qm=P(m),qe=P(e);pa.moveTo(qa[0],qa[1]);pa.quadraticCurveTo(qm[0],qm[1],qe[0],qe[1]);ballP(kp,qm,1.1);ballP(kp,qe,1.35)}
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.7;ctx.stroke(pa);ctx.strokeStyle=K.lich.b;ctx.lineWidth=1.3;ctx.stroke(pa);ctx.fillStyle=K.lich.l;ctx.fill(kp);ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke(kp)}
// the shadow on the floor: an ellipse along the body (lighter and smaller when it rears up)
function shadowE(V0,x,y,sc,A,al){if(typeof noShadow!=='undefined'&&noShadow)return;const r=1-.3*cl(-A.lean/.7,0,1),c=[A.B[0]-4,A.B[1],0],Fr={u:yawR([1,0,0],A.yaw),v:yawR([0,1,0],A.yaw),w:[0,0,1]},pts=ellSil(V0,c,[46*r,17*r,.01],Fr,null,18);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);poly(pts);ctx.fillStyle=`rgba(0,0,0,${(al*r).toFixed(3)})`;ctx.fill();ctx.restore()}
// a picture drawn once into its own canvas (slot n) and pasted with the alpha k (optionally clipped to the screen band y < yc, local units)
const PIC=[];
function pic(n,f,q,r){const T=ctx.getTransform(),S=Math.hypot(T.a,T.b),dx=T.a*q[0]+T.c*q[1]+T.e,dy=T.b*q[0]+T.d*q[1]+T.f,R=Math.ceil(r*S+8),W=2*R;
  let OC=PIC[n];if(!OC)OC=PIC[n]=document.createElement('canvas');if(OC.width<W||OC.height<W)OC.width=OC.height=W;const oc=OC.getContext('2d');oc.setTransform(1,0,0,1,0,0);oc.clearRect(0,0,W,W);
  oc.setTransform(T.a,T.b,T.c,T.d,T.e-(dx-R),T.f-(dy-R));const saved=ctx;ctx=oc;try{f(oc)}finally{ctx=saved}
  return(k,dyl)=>{if(k<=.01)return;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha*=Math.min(1,k);ctx.drawImage(OC,0,0,W,W,dx-R,dy-R-(dyl||0)*S,W,W);ctx.restore()}}

// ------------------------------------------------------------------ the model
function stag2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};anim=MV.includes(anim)?anim:'idle';p=cl(p||0,0,.9999);const A=sPose(anim,p,o);if(A.vis<=0)return;
  const V0=V(face),{P,D,F}=V0,fx=fxOn(o),gh0=o.ghost!=null?cl(o.ghost,0,1):0,see=cl(o.see||0,0,1)*.5;
  A.B[2]+=(o.z||0)/sc;if(A.pv){const X0=frame(Object.assign({},A,{B:[0,0,0]}),0),q=X0.T(A.pv);A.B=add(A.B,sub(A.pv,q))}
  const X=frame(A,0),K=pal(A.k2),J={};A.crownGlow=Math.max(A.rose,...A.tl.map(v=>v*.6));
  // the head: its pivot at the nape on top of the neck (the neck turns and bends with it), its own camera on the hero
  const v0=sub(NAPE,NB0),vn=add(yawR(pitR(v0,A.np),A.ny),A.hd),pivB=add(NB0,vn),Hc=X.T(pivB);
  const hpW=A.hp+A.lean*A.hk,hyW=A.hy+cheat(face,A.ch),HRd=v=>yawR(pitR(rolR(v,A.hr),hpW),hyW),HT=q=>add(Hc,HRd(sub(q,NAPE))),HX={T:HT,Rd:HRd};
  const n0=X.T(NK[0]),n2=HT(NK[2]),n1=lerp3(X.T(add(NK[1],mul(sub(vn,v0),.55))),lerp3(n0,n2,.5),.2),NKW=[n0,n1,n2];J.nd=sub(n1,X.T(NK[1]));
  // the crown: on the head (with its own heavy roll), or coming off and standing in the moss (the defeat)
  let Cc=add(Hc,HRd(sub(CR0,NAPE))),cA={hp:hpW,hy:hyW,hr:A.hr+A.cr};
  if(A.det>0){const s={hp:.45,hy:0,hr:0},cp=add(X.T([54,0,0]),[0,0,0]);cp[2]=5;const k=A.det;Cc=lerp3(Cc,cp,k);cA={hp:lerp(cA.hp,s.hp,k),hy:lerp(cA.hy,s.hy,k),hr:lerp(cA.hr,0,k)}}
  const CRd=v=>yawR(pitR(rolR(v,cA.hr),cA.hp),cA.hy),TA=q=>add(Cc,CRd(sub(q,CR0))),gro=1+.1*A.grow;
  const AG=[antGeo(-1,gro,A.cs),antGeo(1,gro,A.cs)];J.lance=AG.map(G=>TA(G.T[0].t));
  // the legs (their bones now: the effects need the hooves)
  const LG=[0,1,2,3].map(i=>legGeo(X,A,i));J.LG=LG;
  // the floor
  if(gh0<.5&&!A.ghost&&A.body>0)shadowE(V0,x,y,sc,A,.3*(1-A.bodyUp));
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);GG=ghostGrad(V0);
  const LB=parts(),LF=parts(),L0=parts(),kN=100,kM=120,kH=200,dk=sd=>.35*sstep(.02,.4,-F(X.Rd([0,sd,0])));
  // ---------------- the stag (drawn in colour, or as light of the aurora)
  for(const g of LG){const d0=D(RT0[g.i])*.01,fo=A.fo[g.i]*sstep(.05,.4,F(X.Rd(nrm([1,0,.35])))),dr=()=>legDraw(V0,X,A,K,g,dk(g.sd));
    if(fo<.99)LB.add(-800+d0,dr);if(fo>.01)LB.add(400+d0,()=>fadeOr(fo,dr,P(lerp3(g.root,g.en,.5)),40))}
  {const to=sstep(-.05,.05,F(X.Rd(nrm([-1,0,.25])))),dr=()=>tailDraw(V0,X,A,K);if(to<.99)LB.add(-700,dr);if(to>.01)LB.add(160,()=>fadeOr(to,dr,P(X.T([-48,0,54])),16))}
  LB.add(0,()=>bodyDraw(V0,X,A,K,J));
  LB.add(kN,()=>neckDraw(V0,NKW,A,K,J));
  LB.add(kM,()=>fadeOr(1-see,()=>maneDraw(V0,X,A,K,J,NKW),P(X.T([22,0,90])),36));
  LB.add(140,()=>collarDraw(V0,X,A,K,J));
  LB.add(kH,()=>{headDraw(V0,HX,A,K,J);if(A.det>0&&!GH)roseOnHead(V0,HX,A,K)});
  for(const sd of[-1,1]){const j=sd>0?1:0,eo=sstep(-.05,.05,F(HRd(EARN[j]))),de=()=>earDraw(V0,HX,A,K,sd),qe=P(HT([38,16*sd,98]));
    if(eo<.99)LB.add(-990,de);if(eo>.01)LB.add(290,()=>fadeOr(eo,de,qe,18))}
  // the antlers: over the head while the rosette (on top of the skull) faces us, behind everything when it does not, with a short crossfade
  // (one picture) only while the rosette is on the edge of the skull. Come off (the defeat) they stand in the moss in front of him: drawn
  // before the body when the body is between them and us (L0), after it otherwise, never in the passes of the body turning into light
  const LC=A.det>0&&D(X.T([54,0,0]))<D(X.T([20,0,40]))?L0:LF;
  for(const sd of[-1,1]){const j=sd>0?1:0,G=AG[j],ao=A.det>0?1:sstep(-.05,.05,F(CRd(ROSN[j]))),qa=P(TA([32,36*sd,110])),ra=50*gro,
      da=()=>antDraw(V0,TA,CRd,A,K,sd,G,{noRose:A.det>0}),dv=k=>fadeOr(k*(1-see),da,qa,ra);
    if(A.det>0){LC.add(500+D(TA(G.R0))*.01,()=>dv(1));continue}
    if(ao<.99)LB.add(-1000+D(TA(G.R0))*.01,()=>dv(1));if(ao>.01)LB.add(300+D(TA(G.R0))*.01,()=>dv(ao))}
  // ---------------- the effects
  if(fx)for(const e of A.fx)fxDraw(V0,X,LF,e,A,K,J,HX,TA,AG);
  if(A.pearl>=0&&!GH){const fF=F(HRd([1,0,0])),cF=F(X.Rd([1,0,0])),fl=sstep(.05,.4,F(X.Rd(nrm([1,0,.35]))));
    if(fF>-.2)LB.add(kH+1,()=>pearlDraw(V0,X,A,K,J,HX,'head'));
    (cF>0?LB:L0).add(151,()=>pearlDraw(V0,X,A,K,J,HX,'chest'));
    for(const g of LG.slice(0,2)){const d0=D(RT0[g.i])*.01,fo=A.fo[g.i]*fl;LB.add((fo>.5?401:-799)+d0,()=>pearlDraw(V0,X,A,K,J,HX,'leg',g))}}
  if(A.ring>=0)LF.add(460,()=>ringDraw(V0,TA,A,K));
  if(A.det>0&&A.mound>0){LC.add(480,()=>moundDraw(V0,X,A,K));LC.add(520,()=>moundFront(V0,X,A,K))}
  if(A.dawn>0)LF.add(490,()=>dawnDraw(V0,TA,A));
  // (a thread behind the chest is drawn before the body: the body hides it)
  if(A.threads>.01&&fx){const fw=F(HRd([1,0,0])),Lh=lerp(24,10,sstep(.1,.4,fw));for(let j=0;j<2;j++){const tp=TA(AG[j].T[0].t);(fw>.3||D(tp)<D(X.T([30,0,50]))?L0:LF).add(905,()=>threadDraw(V0,tp,j,A,Lh))}}
  if(A.lastDrop>=0&&fx)LF.add(495,()=>{const G=AG[1],t=TA(G.T[2].t),k=A.lastDrop,z=t[2]*(1-ez(cl((k-.3)/.7,0,1))),q=P([t[0],t[1],Math.max(6,z)]);if(!LOWFX)shine('234,255,246',q[0],q[1],7,.6);ctx.fillStyle='#eafff6';ball(q,1.5);ctx.fill()});
  if(A.rib>=0&&fx)LF.add(600,()=>ribbonDraw(V0,X,A));
  if(A.cflash>0&&!LOWFX&&A.det<.5)LF.add(700,()=>{const q=P(TA(CR0));shine(litRgb(A),q[0],q[1],60,.5*A.cflash);shine('255,255,255',q[0],q[1],24,.4*A.cflash)});
  // ---------------- draw: in colour, as aurora light (the spirits), or both cut by the line where the colour rises (the entrance) or leaves
  // (the defeat)
  const gk=A.ghost?A.gk:gh0,ghostAll=A.ghost||gh0>.99;
  run(L0);
  if(A.body>0){
    if(ghostAll&&A.cline<0)ghostPass(V0,LB,gk*(gh0>0&&gh0<1?gh0:1),0,null,A);
    else if(A.cline>=0){const lo=P(0,0,0)[1]+12,hi=P(0,0,136)[1]-6,yb=lerp(lo,hi,A.cline),up=A.bodyUp*70;
      if(A.cup){ctx.save();ctx.beginPath();ctx.rect(-1e4,yb,2e4,2e4);ctx.clip();run(LB);ctx.restore();ghostPass(V0,LB,1,0,yb,A,true)}
      else{ctx.save();ctx.beginPath();ctx.rect(-1e4,-1e4,2e4,yb+1e4);ctx.clip();if(A.bodyUp<.01)run(LB);ctx.restore();ghostPass(V0,LB,1-A.bodyUp,up,yb,A,false)}}
    else if(gh0>0){fadeOr(1-gh0,()=>run(LB),P(10,0,60),118);ghostPass(V0,LB,gh0,0,null,A)}
    else run(LB)}
  GH=0;run(LF);
  if(o.dbg)dbgPts(o.dbg,x,y,sc,V0,X,A,LG,Hc,HT,TA,AG);
  ctx.restore()}
// the aurora light of the body as one picture (a white outline round the pieces), pasted with the alpha k; cut at the line yb (above it
// with a thread of light when the colour is rising, below it when the body is turning into light), raised by up
function ghostPass(V0,LB,k,up,yb,A,above){if(k<=.01)return;GH=1;
  if(LOWFX){ctx.save();if(yb!=null){ctx.beginPath();if(above)ctx.rect(-1e4,-1e4,2e4,yb+1e4);else ctx.rect(-1e4,yb,2e4,2e4);ctx.clip()}ctx.translate(0,-up);ctx.globalAlpha*=Math.min(1,k);run(LB);ctx.restore();GH=0;return}
  const c=V0.P(10,0,62),b=pic(0,()=>{run(LB);if(yb!=null){ctx.globalCompositeOperation='source-atop';const g=ctx.createLinearGradient(0,yb-6,0,yb+2);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.75,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(-300,yb-6,600,8);ctx.globalCompositeOperation='source-over'}},c,122);
  GH=0;ctx.save();if(yb!=null){ctx.beginPath();if(above)ctx.rect(-1e4,-1e4,2e4,yb+2+1e4);else ctx.rect(-1e4,yb-2,2e4,2e4);ctx.clip()}b(.62*k,up);if(!LOWFX&&yb==null){}ctx.restore()}
// the rosette of antique gold round the root of a beam (c, its axis d0): a band of gold and a ring of seven buttons on it; only the half that
// faces us (the beam covers the rest); it glows when the aurora is born in it
function roseDraw(V0,c,d0,K,A,lit){const{P,F}=V0,[u,v]=frm(d0,[0,0,1]),ring=ringS(V0,add(c,mul(d0,.3)),u,v,4.6,16),bp=new Path2D(),hl=new Path2D(),bq=[];
  // the band: the near half of the ring (where the ring faces us), ink under gold
  const near=[];for(let k=0;k<16;k++){const a=k/16*TAU,dr=add(mul(u,Math.cos(a)),mul(v,Math.sin(a)));near.push(F(dr)>-.15)}
  const runs=[];let cur=[];for(let k=0;k<=16;k++){const i=k%16;if(near[i])cur.push(ring[i]);else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
  ctx.lineCap='round';ctx.lineJoin='round';for(const[w,col] of[[5.2,INK],[3,K.gold.b]])for(const r of runs){if(r.length<2)continue;ctx.beginPath();for(const q of r)ctx.lineTo(q[0],q[1]);ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke()}
  for(let k=0;k<7;k++){const a=k/7*TAU+.3,dr=add(mul(u,Math.cos(a)),mul(v,Math.sin(a)));if(F(dr)<-.2)continue;const q=P(add(add(c,mul(dr,4.8)),mul(d0,.5)));bq.push(q);ballP(bp,q,2.25);ballP(hl,[q[0]-.7,q[1]-.8],.6)}
  if(!bq.length)return;const b2=bbox(bq);b2[0]-=2.5;b2[1]-=2.5;b2[2]+=2.5;b2[3]+=2.5;ctx.fillStyle=grad3(b2,K.gold);ctx.fill(bp);ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke(bp);ctx.fillStyle='rgba(255,252,230,.9)';ctx.fill(hl);
  if(A.rose>.1&&!LOWFX){const q=P(c);shine(mixRgb('255,226,150',lit||LIT0,.45),q[0],q[1],10,.55*A.rose)}}
// the rosettes left on the head when the antlers come off
function roseOnHead(V0,HX,A,K){for(const sd of[-1,1]){const G=antGeo(sd,1,1);roseDraw(V0,HX.T(G.R0),HX.Rd(G.d0),K,A,null)}}
// the pearl of light of the Stomp: from the rosettes down the front of the neck and the chest into the two front legs
// (the path is a smooth curve through its points: from the rosettes down behind the eye to the throat, the front of the neck, the chest, then
// each front leg from its root through the knee to the hoof)
function crS(Q,n){const out=[Q[0]];for(let i=0;i<Q.length-1;i++){const a=Q[Math.max(0,i-1)],b=Q[i],c=Q[i+1],d=Q[Math.min(Q.length-1,i+2)];
    for(let j=1;j<=n;j++){const t=j/n,t2=t*t,t3=t2*t,f=(p0,p1,p2,p3)=>.5*(2*p1+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);out.push([f(a[0],b[0],c[0],d[0]),f(a[1],b[1],c[1],d[1])])}}return out}
// (in three pieces, each drawn at the depth of what it runs on: down the cheek that faces us (behind the eye, never across the face), down
// the front of the neck and the chest (hidden by the body when the chest turns away), down each front leg with its leg)
function pearlDraw(V0,X,A,K,J,HX,part,g){if(GH)return;const{P,F}=V0,k=A.pearl,k1=cl(k/.6,0,1),lit=litRgb(A),s=F(HX.Rd([0,1,0]))>=0?1:-1;
  if(part==='head'){runDraw(crS([HX.T([44,7.5*s,97]),HX.T([46.5,9*s,87]),HX.T([45,8.5*s,78])].map(P),4),cl(k1*2,0,1),1,lit);return}
  const top=[HX.T([45,8.5*s,78]),X.T([38,0,66]),X.T([34,0,52]),X.T([29,0,40])].map(P);
  if(part==='chest'){runDraw(crS(top,4),cl(k1*2-1,0,1),1,lit);return}
  if(k>.6&&g)runDraw(crS([top[top.length-1],P(g.root),P(g.kn),P(g.en)],3),(k-.6)/.4,1,lit)}
// the drops of light of the second phase: under each lance a short thread of aurora that fades into nothing (24 long, 10 while the lance
// is in front of the face, and then behind the head), a bead of light that slides down it and drops off
function threadDraw(V0,tp,j,A,Lh){const{P}=V0,k=A.threads;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  const a=P(add(tp,[0,0,-1.6])),b=P(add(tp,[0,0,-1.6-Lh])),g=ctx.createLinearGradient(a[0],a[1],b[0],b[1]);g.addColorStop(0,`rgba(200,255,236,${(.5*k).toFixed(3)})`);g.addColorStop(1,'rgba(170,150,255,0)');
  ctx.strokeStyle=g;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
  const u=((A.tp+j*.5)%1+1)%1,q=P(add(tp,[0,0,-1.6-Lh*1.35*u])),al=k*Math.sin(Math.PI*Math.min(1,u*1.1));ctx.fillStyle=`rgba(235,255,246,${(.85*al).toFixed(3)})`;ball(q,1.25);ctx.fill();ctx.restore()}
// the ring of light of the Corona Boreale over the crown (rising to z 140, its radius 10 to 40; it pulses, then fades)
function ringDraw(V0,TA,A,K){const{P}=V0,k=A.ring,ph=k*.81+.15,r0=sstep(.15,.4,ph),c=TA(CR0),z=lerp(c[2]+20,140*(1+.08*A.grow),r0),R=lerp(10,40,ez(r0))*(1+.06*Math.sin(TAU*3*4*ph)*(ph>.4?1:0)),al=sstep(.15,.22,ph)*(1-sstep(.88,.96,ph));
  if(al<=.01)return;const pts=[];for(let i=0;i<28;i++){const t=i/28*TAU;pts.push(P([c[0]+Math.cos(t)*R,c[1]+Math.sin(t)*R,z]))}
  ctx.save();ctx.lineJoin='round';if(!LOWFX){ctx.globalCompositeOperation='lighter';poly(pts);ctx.strokeStyle=`rgba(${litRgb(A)},${(.5*al).toFixed(3)})`;ctx.lineWidth=6;ctx.stroke();ctx.globalCompositeOperation='source-over'}
  poly(pts);ctx.strokeStyle=`rgba(240,255,250,${(.85*al).toFixed(3)})`;ctx.lineWidth=1.6;ctx.stroke();ctx.restore()}
// the warm ray of dawn falling on the antlers (the defeat)
function dawnDraw(V0,TA,A){const{P}=V0,c=TA([35,0,108]),b=P([c[0],c[1],0]),t=P([c[0],c[1],230]),al=A.dawn;
  // (three nested rays, each faint, so its edges are soft; on slow phones only the middle one)
  const g=ctx.createLinearGradient(0,t[1],0,b[1]);g.addColorStop(0,'rgba(255,217,160,0)');g.addColorStop(.62,`rgba(255,217,160,${(.085*al).toFixed(3)})`);g.addColorStop(1,`rgba(255,217,160,${(.04*al).toFixed(3)})`);
  ctx.save();if(!LOWFX)ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;
  for(const w of LOWFX?[.66]:[1,.66,.36]){ctx.beginPath();ctx.moveTo(t[0]-12*w,t[1]);ctx.lineTo(t[0]+12*w,t[1]);ctx.lineTo(b[0]+42*w,b[1]+4);ctx.lineTo(b[0]-42*w,b[1]+4);ctx.closePath();ctx.fill()}ctx.restore();
  if(!LOWFX){const q=P(TA([32,0,104]));shine('255,217,160',q[0],q[1],34,.3*al)}}
// the mound of moss where the crown stands (the end of the defeat): a low cushion (a dome: only what is above the floor) with a soft bumpy
// edge, dark and lit only on top, frosted tufts, little white flowers on it and an edelweiss at its foot, on the side toward us
const MDN=[];for(let i=0;i<16;i++){const t=i/16*TAU,b=1+.06*Math.sin(t*3+1)+.04*Math.sin(t*5+2);for(const[f,z] of[[1,0],[.9,.5],[.6,.86]])MDN.push([Math.cos(t)*b*f,Math.sin(t)*b*f,z])}MDN.push([0,0,1]);
const MFL=[[.5,.62,1],[1.7,.5,.9],[2.9,.66,.85],[4.1,.45,1],[5.3,.6,.9],[.1,.25,.8]];
function moundAt(X,c0){const c=c0?c0.slice():X.T([54,0,0]);c[2]=0;return c}
function moundDraw(V0,X,A,K,c0){const k=A.mound;if(k<=.01)return;const{P}=V0,c=moundAt(X,c0),g=.55+.45*k,R=[29*g,23*g,12*k];
  poly(ellSil(V0,c,[R[0]*1.12,R[1]*1.12,.01],null,null,16));ctx.fillStyle='rgba(0,0,0,.22)';ctx.fill();
  const hp=hullE(MDN.map(m=>P(c[0]+m[0]*R[0],c[1]+m[1]*R[1],m[2]*R[2])),.05);if(hp.length<3)return;const pa=smoothP(hp),bb=bbox(hp);
  ctx.fillStyle=mossGrad(bb,K1.moss);ctx.fill(pa);
  {const gd=ctx.createLinearGradient(0,bb[1]+(bb[3]-bb[1])*.45,0,bb[3]);gd.addColorStop(0,'rgba(10,30,14,0)');gd.addColorStop(1,'rgba(10,30,14,.38)');ctx.fillStyle=gd;ctx.fill(pa)}
  ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.lineJoin='round';ctx.stroke(pa);
  // the tufts of frost on the moss, the little white flowers
  const on=(a,r,z)=>P(c[0]+Math.cos(a)*R[0]*r,c[1]+Math.sin(a)*R[1]*r,R[2]*z),tp=new Path2D();for(const[a,r] of[[.4,.72],[2.1,.6],[3.6,.76],[5,.55],[1.2,.3]])ballP(tp,on(a,r,Math.sqrt(1-r*r)*.95),1.2);ctx.fillStyle=K1.mTip;ctx.fill(tp);
  if(A.flw>.02){const fl=new Path2D(),fc=new Path2D();for(const[a,r,s] of MFL){const q=on(a,r,Math.sqrt(1-r*r)*.97),sz=A.flw*s;for(let i=0;i<5;i++){const an=i/5*TAU+a;ballP(fl,[q[0]+Math.cos(an)*1.9*sz,q[1]+Math.sin(an)*1.4*sz],1.4*sz)}ballP(fc,q,.9*sz)}
    ctx.fillStyle='#ffffff';ctx.fill(fl);ctx.strokeStyle=INK;ctx.lineWidth=.7;ctx.stroke(fl);ctx.fillStyle='#ffd84a';ctx.fill(fc)}
  if(A.edel>.02){const a=Math.atan2(V0.c,V0.s)+.55;edelweiss(P(c[0]+Math.cos(a)*R[0]*1.02,c[1]+Math.sin(a)*R[1]*1.02,0),A.edel*1.25)}}
// the moss over the foot of the crown (after the antlers): a few tufts round the roots of the beams, on the side toward us
function moundFront(V0,X,A,K,c0){const k=A.mound;if(k<=.05)return;const{P,F}=V0,c=moundAt(X,c0),z=12*k*.85,pa=new Path2D(),tp=new Path2D();let n=0;
  for(let i=0;i<9;i++){const a=i/9*TAU+.2,d=[Math.cos(a),Math.sin(a),0];if(F(d)<.05)continue;const b=[c[0]+d[0]*8,c[1]+d[1]*8,z],dl=nrm([d[0]*.8,d[1]*.8,.7]),s=nrm(cross(dl,[0,0,1]));
    const r=leafP(pa,P,b,dl,s,5.5*k,2.6*k);ballP(tp,r[1],.9*k);n++}
  if(!n)return;inkFill(pa,mossGrad(bbox([P(c[0]-10,c[1],z+6),P(c[0]+10,c[1],z-3)]),K1.moss),1.1);ctx.fillStyle=K1.mTip;ctx.fill(tp)}
// an edelweiss: eight felt petals in a star, a cluster of yellow-green buds in the middle (k: how open it is)
function edelweiss(q,k){if(k<=.02)return;const pa=new Path2D();for(let i=0;i<8;i++){const a=i/8*TAU+.2,L=(i%2?3.6:4.4)*k,e=[q[0]+Math.cos(a)*L,q[1]+Math.sin(a)*L*.75],s=.42;
    pa.moveTo(q[0],q[1]);pa.quadraticCurveTo(q[0]+Math.cos(a+s)*L*.55,q[1]+Math.sin(a+s)*L*.55*.75,e[0],e[1]);pa.quadraticCurveTo(q[0]+Math.cos(a-s)*L*.55,q[1]+Math.sin(a-s)*L*.55*.75,q[0],q[1]);pa.closePath()}
  ctx.fillStyle='#f6f8f0';ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke(pa);ctx.fillStyle='#dfe8b8';ball(q,1.5*k);ctx.fill();ctx.fillStyle='#c9d86a';for(const[a,r] of[[0,.6],[2.1,.6],[4.2,.6]]){ball([q[0]+Math.cos(a)*r*k,q[1]+Math.sin(a)*r*k],.55*k);ctx.fill()}}
// three ribbons of aurora rising and fading where the body was (the defeat)
function ribbonDraw(V0,X,A){if(LOWFX)return;const{P}=V0,k=A.rib,c=P(X.T([0,0,40])),t=G.t||0;ctx.save();ctx.globalCompositeOperation='lighter';
  [['110,255,196',-18],['95,224,255',0],['180,140,255',18]].forEach(([rgb,dx],i)=>{const u=cl(k*1.25-i*.12,0,1);if(u<=0||u>=1)return;const h=60+90*u,y0=c[1]+20-90*ez(u),a=Math.sin(u*Math.PI)*.42;
    const g=ctx.createLinearGradient(0,y0-h,0,y0);g.addColorStop(0,`rgba(${rgb},0)`);g.addColorStop(.5,`rgba(${rgb},${a.toFixed(3)})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;ctx.beginPath();
    for(let j=0;j<=10;j++){const v=j/10,yy=y0-h*v;ctx.lineTo(c[0]+dx-6+8*Math.sin(v*5+t*1.6+i*2),yy)}for(let j=10;j>=0;j--){const v=j/10,yy=y0-h*v;ctx.lineTo(c[0]+dx+6+8*Math.sin(v*5+t*1.6+i*2+.6),yy)}ctx.closePath();ctx.fill()});
  ctx.restore()}
// the effects of the moves (only when the game does not draw its own and the phone is fast)
function fxDraw(V0,X,L,e,A,K,J,HX,TA,AG){const{P,D}=V0,t=e.t,HT=HX.T,HRd=HX.Rd;
  const front=V0.F(HRd([1,0,0]))>-.15,kHd=front?950:-950;
  if(e.k==='breath'||e.k==='cloud'||e.k==='vapor'){L.add(kHd,()=>{const big=e.k==='cloud'||e.big,n=e.k==='vapor'?2:3;for(let i=0;i<n;i++){const u=e.k==='vapor'?((t*3+i*.5)%1):cl(t*1.15-i*.12,0,1);if(u<=0||u>=1)continue;
      const sd=i%2?1:-1,q=P(HT(e.k==='cloud'?[66+u*12,sd*(5+u*6),70+u*9+i]:[71+u*10,sd*(2.6+u*5),77-u*6+i*.6])),r=Math.min(big?7:6,(big?2+u*6:1.4+u*4.6)*(e.k==='vapor'?.7:1)),al=(e.k==='vapor'?.2:.3)*(1-u);
      const gr=ctx.createRadialGradient(q[0],q[1],r*.15,q[0],q[1],r);gr.addColorStop(0,`rgba(235,246,255,${al.toFixed(3)})`);gr.addColorStop(1,'rgba(235,246,255,0)');ctx.fillStyle=gr;ball(q,r);ctx.fill()}})}
  else if(e.k==='snow'){const legs=e.j!=null?[e.i,e.j]:[e.i];for(const i of legs){const g=J.LG[i];if(!g)continue;const at=[g.en[0]+3,g.en[1],0];L.add(-1800+D(at)*.01,()=>{const n=e.big?7:4;for(let j=0;j<n;j++){const a=j/n*TAU+.4,d=(e.big?9:5)*(.4+t*.9),q=P(add(at,[Math.cos(a)*d,Math.sin(a)*d,t*6+(j%2)*2]));ctx.fillStyle=`rgba(235,246,255,${(.6*(1-t)).toFixed(3)})`;ball(q,(e.big?2.4:1.8)+t*3.6);ctx.fill()}})}}
  else if(e.k==='print'){const i=e.i,base=FT0[i],u=t*.95,x0=base[0]+21-70*u,at=[x0,base[1],0];if(u<.55)return;const al=sstep(.55,.62,u)*(1-sstep(.75,.95,u));
    L.add(-1900,()=>{const q=P(at);ctx.fillStyle=`rgba(232,246,255,${(.55*al).toFixed(3)})`;ctx.beginPath();ctx.ellipse(q[0],q[1],3.4,1.8,0,0,TAU);ctx.fill();ctx.strokeStyle=`rgba(120,150,190,${(.5*al).toFixed(3)})`;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(q[0]+2.6,q[1]);ctx.lineTo(q[0]-1,q[1]);ctx.stroke()})}
  else if(e.k==='drop'){const j=e.sd>0?1:0,tip=J.lance[j];if(!tip)return;L.add(900,()=>{let q,r;if(t<.47){const k=t/.47;q=P(add(tip,[0,0,-1.5-2*k]));r=.6+1.2*k}else if(t<.66){const k=(t-.47)/.19,z=lerp(tip[2]-3.5,0,k*k);q=P([tip[0],tip[1],z]);r=1.8}else{const k=(t-.66)/.34,q2=P([tip[0],tip[1],0]),pa=new Path2D();star4(pa,q2,3.4*(1-.3*k));ctx.fillStyle=`rgba(232,246,255,${(.9*(1-k)).toFixed(3)})`;ctx.fill(pa);if(!LOWFX)shine('140,255,210',q2[0],q2[1],7,.4*(1-k));return}
      if(!LOWFX)shine('140,255,210',q[0],q[1],6,.5);ctx.fillStyle='#eafff6';ball(q,r);ctx.fill();ctx.strokeStyle='rgba(60,140,140,.6)';ctx.lineWidth=.5;ctx.stroke()})}
  else if(e.k==='rdrop'){if(e.k2===0)return;L.add(900,()=>{for(let s=0;s<2;s++){const G=AG[s],a=TA(G.pc);for(let i=0;i<3;i++){const u=(t*3.4+i/3+s*.17)%1,q=P(add(a,[Math.sin(i*2+s)*4,0,4+u*30]));ctx.fillStyle=`rgba(234,255,246,${(.85*Math.sin(u*Math.PI)*e.k).toFixed(3)})`;ball(q,1.3);ctx.fill()}}})}
  else if(e.k==='smoke'){if(LOWFX)return;L.add(880,()=>{ctx.save();ctx.globalCompositeOperation='lighter';for(let s=0;s<2;s++){const G=AG[s];for(const z of[3,4,5]){const tp=TA(G.T[z].t);for(let i=0;i<2;i++){const u=(t*3.4*1.4+i*.5+z*.13+s*.3)%1,q=P(add(tp,[Math.sin(u*5+z)*3,0,u*26])),rgb=i?'95,224,255':'110,255,196';
      ctx.fillStyle=`rgba(${rgb},${(.3*Math.sin(u*Math.PI)*e.k).toFixed(3)})`;ball(q,2+u*5);ctx.fill()}}}ctx.restore()})}
  // the trail of aurora behind the points: in the Charge four fading strokes back from the lances; in the Sweep an arc behind each point
  // (where it was a moment ago: the point turned back round the nape, against the way the head sweeps)
  else if(e.k==='trail'){if(LOWFX)return;L.add(870,()=>{ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';const lit=litRgb(A);
      if(!e.sweep){const fw=X.Rd([1,0,0]);for(const G of AG){const tp=TA(G.T[0].t),q0=P(tp);for(let i=1;i<=4;i++){const q1=P(add(tp,mul(fw,-9*i)));
          ctx.strokeStyle=`rgba(${lit},${(.55*(1-i/5)).toFixed(3)})`;ctx.lineWidth=4-i*.6;ctx.beginPath();ctx.moveTo(q0[0],q0[1]);ctx.lineTo(q1[0],q1[1]);ctx.stroke()}}}
      else{const Hc=HT(NAPE),al=.5*Math.sin(Math.PI*cl(t,0,1));for(const G of AG)for(const z of G.T){if(z.i>=6&&!A.p78)continue;const tp=TA(z.t),rel=sub(tp,Hc),Q=[];for(let i=0;i<5;i++)Q.push(P(add(Hc,yawR(rel,-e.sweep*.1*i))));
          for(let i=1;i<5;i++){ctx.strokeStyle=`rgba(${lit},${(al*(1-i/5)).toFixed(3)})`;ctx.lineWidth=3.4-i*.6;ctx.beginPath();ctx.moveTo(Q[i-1][0],Q[i-1][1]);ctx.lineTo(Q[i][0],Q[i][1]);ctx.stroke()}}}
      ctx.restore()})}
  else if(e.k==='crack'){L.add(910,()=>{for(const G of AG){const q=P(TA(G.T[0].t));ctx.strokeStyle=`rgba(255,255,255,${(.9*(1-t)).toFixed(3)})`;ctx.lineWidth=1;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<5;i++){const a=i/5*TAU+.3,r=3+t*5;ctx.moveTo(q[0]+Math.cos(a)*1.5,q[1]+Math.sin(a)*1.5);ctx.lineTo(q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r)}ctx.stroke()}})}
  else if(e.k==='bits'){L.add(905,()=>{for(let s=0;s<2;s++){const G=AG[s];for(let i=0;i<3;i++){const a=TA(G.T[[1,2,4][i]].t),z=a[2]-110*t*t-8*t,q=P([a[0]+i*2,a[1],Math.max(1,z)]);if(z<1&&t>.9)continue;ctx.fillStyle=K.crys.l;ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(q[0],q[1]-2);ctx.lineTo(q[0]+1.3,q[1]);ctx.lineTo(q[0],q[1]+2);ctx.lineTo(q[0]-1.3,q[1]);ctx.closePath();ctx.fill();ctx.stroke()}}})}
  else if(e.k==='spray'){for(const i of[0,1]){const g=J.LG[i];L.add(-1700,()=>{const fw=X.Rd([1,0,0]);for(let j=0;j<5;j++){const u=(t*2.4+j/5)%1,q=P(add([g.en[0],g.en[1],0],[fw[0]*u*18+Math.sin(j*2.1)*4,fw[1]*u*18+Math.cos(j*1.7)*4,u*8-u*u*6]));ctx.fillStyle=`rgba(235,246,255,${(.7*(1-u)).toFixed(3)})`;ball(q,1.6+u*2.6);ctx.fill()}})}}
  else if(e.k==='ring'){L.add(-1600,()=>{const c=[(J.LG[0].en[0]+J.LG[1].en[0])/2,0,0],r=10+t*40,pts=[];for(let i=0;i<28;i++){const a=i/28*TAU;pts.push(P(add(c,[Math.cos(a)*r,Math.sin(a)*r,0])))}ctx.strokeStyle=`rgba(200,240,255,${(.7*(1-t)).toFixed(3)})`;ctx.lineWidth=3.5*(1-t)+1;poly(pts);ctx.stroke();
      for(const g of J.LG.slice(0,2))for(let i=0;i<3;i++){const a=i/3*TAU+g.sd,q=P([g.en[0]+Math.cos(a)*6,g.en[1]+Math.sin(a)*6,0]);N3.stagSpike(q[0],q[1],7,cl(t*1.4,0,1),1,{a:a,p2:K.p2,local:1})}})}
  else if(e.k==='bell'){L.add(920,()=>{for(const tp of J.lance){const q=P(tp);C.starS(q[0]+1.5,q[1]+2.5,2.4*Math.sin(t*Math.PI),Math.sin(t*Math.PI))}})}
  else if(e.k==='frost'){L.add(915,()=>{const c=P(X.T([0,0,62]));for(let i=0;i<6;i++){const a=i/6*TAU,d=10+t*18,q=[c[0]+Math.cos(a)*d,c[1]+Math.sin(a)*d*.6-t*6];ctx.fillStyle=`rgba(235,246,255,${(.45*(1-t)).toFixed(3)})`;ball(q,2+t*3);ctx.fill()}})}
  else if(e.k==='dropfall'){L.add(900,()=>{for(let s=0;s<2;s++){const G=AG[s];for(const[z,o2] of[[3,0],[5,.3]]){const u=cl(t*1.3-o2,0,1);if(u<=0||u>=1)continue;const tp=TA(G.T[z].t),q=P([tp[0],tp[1],tp[2]*(1-u*u)]);if(!LOWFX)shine('140,255,210',q[0],q[1],5,.4);ctx.fillStyle='#eafff6';ball(q,1.4);ctx.fill()}}})}}
// debug: the screen points of the model (for the tests of the jumps)
function dbgPts(D0,x,y,sc,V0,X,A,LG,Hc,HT,TA,AG){const S=q=>{const s=V0.P(q);return[x+s[0]*sc,y+s[1]*sc]};D0.pts={};
  LG.forEach((g,i)=>{D0.pts['hoof'+i]=S(g.en);D0.pts['knee'+i]=S(g.kn)});D0.pts.head=S(Hc);D0.pts.nose=S(HT([71,0,81]));D0.pts.body=S(X.T([0,0,50]));D0.pts.tail=S(X.T([-50,0,52]));
  AG.forEach((G,j)=>{D0.pts['lance'+j]=S(TA(G.T[0].t));D0.pts['p3'+j]=S(TA(G.T[2].t));D0.pts['palm'+j]=S(TA(G.pc))});
  D0.tips=AG.map(G=>G.T.map(t=>TA(t.t)))}

// ------------------------------------------------------------------ for the game: the pieces of its attacks, with the same look
// N3.stagShard(x, y, z, a, sc, o): the shard of crystal of the crown (the Sweep, the blow of the Charge): a diamond 18 long and 7 wide with a
// heart of aurora, a lit face, the white line and the ink outline; o.p2 violet. The short form (x, y, r, a) works too
N3.stagShard=function(x,y,z,a,sc,o){if(arguments.length===4){sc=(z||7)/7;z=0}o=o||{};sc=sc||1;const p2=!!o.p2,Kc=p2?K2.crys:K1.crys,core=p2?'190,150,255':'110,255,196';
  ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);if(!LOWFX)shine(core,0,0,14,.4);ctx.rotate(a||0);
  const P0=[[9,0],[1.2,-3.5],[-9,0],[1.2,3.5]];ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(1.2,-3.5);ctx.lineTo(-9,0);ctx.closePath();ctx.fillStyle=Kc.l;ctx.fill();
  ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(-9,0);ctx.lineTo(1.2,3.5);ctx.closePath();ctx.fillStyle=cmix(Kc.b,Kc.d,.35);ctx.fill();
  ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(.8,-1.5);ctx.lineTo(-4.5,0);ctx.lineTo(.8,1.5);ctx.closePath();ctx.fillStyle=`rgb(${core})`;ctx.fill();ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.moveTo(3.4,0);ctx.lineTo(.8,-.7);ctx.lineTo(-1.5,0);ctx.lineTo(.8,.7);ctx.closePath();ctx.fill();
  ctx.beginPath();for(const q of P0)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=.9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(6.2,-.9);ctx.lineTo(-5.4,-1.2);ctx.stroke();ctx.restore()};
// N3.stagSpike(x, y, h, k, sc, o): the spike of ice on the front of the wave of the Stomp (h its height, about 18): it springs up (k .00-.15),
// stands, shatters into chips of frost (.75-1); o.a: the way it leans (out from the middle), o.p2 violet
N3.stagSpike=function(x,y,h,k,sc,o){o=o||{};sc=sc||1;h=h||18;if(k<=0)return;const a=o.a==null?Math.PI/2:o.a,V0=V(a),{P}=V0,up=k<.15?ez(k/.15):1,cr=sstep(.75,1,k),hh=h*up*(1-.65*cr),Kc=o.p2?K2.ice:K1.ice;
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);if(cr>0)ctx.globalAlpha*=1-cr*.8;
  if(hh>.5){const lean=.32,s=Math.min(1,h/18),tip=[Math.sin(lean)*hh,0,hh],B=[[-4.2*s,-3.6*s,0],[3.6*s,-4*s,0],[4.6*s,3.2*s,0],[-3.4*s,4*s,0]].map(P),T=P(tip),H=chull(B.concat([T]));
    poly(H);ctx.fillStyle=grad3(bbox(H),Kc);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.lineJoin='round';ctx.stroke();
    ctx.strokeStyle=o.p2?'#f6eeff':'#e0fff6';ctx.lineWidth=.9;ctx.lineCap='round';seg([lerp(B[0][0],T[0],.15),lerp(B[0][1],T[1],.15)],[lerp(B[0][0],T[0],.75),lerp(B[0][1],T[1],.75)]);ctx.stroke();
    ctx.fillStyle='rgba(235,246,255,.65)';ctx.beginPath();ctx.ellipse(0,0,6*s,2.6*s,0,0,TAU);ctx.fill()}
  if(cr>0)for(let i=0;i<5;i++){const an=i/5*TAU+.4,q=P([Math.cos(an)*7*cr,Math.sin(an)*5*cr,h*.5*(1-cr)+2]);ctx.fillStyle=Kc.l;ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(q[0],q[1]-1.8);ctx.lineTo(q[0]+1.3,q[1]);ctx.lineTo(q[0],q[1]+1.8);ctx.lineTo(q[0]-1.3,q[1]);ctx.closePath();ctx.fill();ctx.stroke()}
  ctx.restore()};
// N3.stagSpirit(x, y, face, p, sc, o): a spirit of the herd: the model all of aurora light in the Charge at the moment p, at sc .62 (o.k: 0..1
// while it takes shape and when it fades). The game draws it once a frame for each direction on a layer and pastes it
N3.stagSpirit=function(x,y,face,p,sc,o){o=o||{};sc=sc==null?.62:sc;const k=o.k==null?1:cl(o.k,0,1);if(k<=.01)return;const a0=ctx.globalAlpha;ctx.globalAlpha=a0*k;
  try{stag2(x,y,face,'charge',p,sc,{ghost:1,noFx:true,p2:!!o.p2})}finally{ctx.globalAlpha=a0}};
// N3.stagCrown(x, y, sc, o): the crown standing on the mound of flowered moss, as at the end of the defeat (o.p2: the palm with five points;
// o.k: its light, 0..1; o.face: the view)
N3.stagCrown=function(x,y,sc,o){o=o||{};sc=sc||1;const face=o.face==null?Math.PI/2-.42:o.face,V0=V(face),A={tl:[0,0,0,0,0,0,0,0].map(()=>cl(o.k||0,0,1)),tcol:0,tw:0,palm:0,veinK:.8*cl(o.k||0,0,1),runs:[],rose:0,p78:o.p2?1:0,pale:1-cl(o.k||0,0,1),flameK:0,lich:0,mound:1,flw:1,edel:1};
  const K=pal(o.p2?1:0),g=o.p2?1.1:1,cp=[0,0,5],R=v=>yawR(pitR(v,.45),0),TA=q=>add(cp,R(sub(q,CR0)));
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();L.add(-1,()=>moundDraw(V0,null,A,K,[0,0,0]));
  for(const sd of[-1,1]){const G=antGeo(sd,g,1);L.add(V0.D(TA(G.R0)),()=>antDraw(V0,TA,R,A,K,sd,G,{noRose:true}))}L.add(1e3,()=>moundFront(V0,null,A,K,[0,0,0]));run(L);ctx.restore()};
// the moments of the moves for the brain
N3.stagInfo=INFO;
for(const nm of['Shard','Spike','Spirit','Crown','Info'])N3['stag2'+nm]=N3['stag'+nm];

reg('stag2',{n:"Il Cervo d'Aurora",g:'boss',sc:1,p2:true,an:MV.slice(),dur:Object.assign({},DUR),
  lab:{idle:'Fermo',walk:'Cammina',hit:'Colpito',prep:'Prepara la carica',charge:'Carica',stuck:'Corna incastrate',recoil:'Rimbalzo',prep2:'Seconda carica',skid:'Frenata',
    sweep:'Spazzata della Corona',aurora:"Tende d'Aurora",stomp:'Zoccolata del Re',call:'Richiamo della Mandria',crown:'Corona Boreale (fase 2)',rage:"L'aurora si accende (fase 2)",
    taunt:'Presa in giro',enter:'Entrata',die:'Sconfitta'}},stag2);
// «Prima e dopo»: the Stag of today
{const OLD=N3.stag,M0=N3.meta.stag;if(OLD&&M0)N3.meta.stag2.old=(x,y,f,a,pp)=>OLD(x,y,f,M0.an.includes(a)?a:'idle',pp,M0.sc||1,{})}
})();
