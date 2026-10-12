// L'eroe della modalità Classica (l'Arciere) rifatto con il metodo dei mostri nuovi: scheletro 3D proiettato con V(face) dalla
// cassetta degli attrezzi CR._rig (sprite/mostri/disegno_mostri.js), quindi gira a 360 gradi e ogni pezzo resta attaccato al suo posto.
// È lo stesso eroe di oggi (drawRig con heroStyle('arciere') nel gioco) con le stesse misure: corpo a goccia con la giubba, cappuccio tondo
// senza punta, faccia grande nell'apertura con due occhi neri, colletto a V, cucitura e bottoni, cintura con la fibbia d'oro, piedi tondi,
// mani senza braccia, l'arco tenuto davanti alla pancia, la faretra a tracolla sulla schiena con le penne rosse e bianche.
// Dipinto come i nemici Classici rifatti: tre toni su ogni pezzo, luce calda dall'alto a sinistra, bordo illuminato, contorno spesso.
// Firma: EROE.arciere(x, y, face, anim, p, sc, o). Va eseguito dopo disegno_mostri.js, dentro la funzione principale di index.html
// (usa ctx, ink, ell, shadow, glow, INK, LOWFX, G.t; se ci sono usa anche ITEM e ringAura del gioco).
//   x, y: il punto dei piedi (drawRig del gioco ha il suo punto 8 px più in alto); face: direzione in radianti (π/2 = verso chi guarda)
//   anim: 'idle' (fermo) | 'walk' (cammina) | 'shoot' (tira di continuo) | 'aim' (arco teso di o.pull, come P.aiming nel gioco) |
//         'dash' (scatto) | 'hit' (colpito); p: 0..1 lungo la mossa; sc: grandezza (1 = come oggi)
//   o.style: colori ed equipaggiamento come heroStyle() del gioco (body, hood, skin, belt, bowCol, bowKind, held, armor, ring, amu, skinId)
//   o.moss: il bastoncino di muschio in bocca (solo schermata iniziale e intro); o.pull: 0..1 con 'aim'; o.eyeLight: puntino di luce negli occhi
//   o.noFx: niente freccia che vola, scie e polvere (per i fogli, dove il gioco disegna i suoi effetti)
window.EROE=(()=>{
const R=CR._rig,{cam,KR,TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,Vat,mix,stepper,shine,ball,seg,tri,hull,on,fist,wa,rim,glowTop,run,starS}=R;
// ------------------------------------------------------------------ colours (giubba di cuoio + arco di frassino, as in the game)
const HC={body:'#2fb3a6',hood:'#23877d',skin:'#f2c9a0',eye:'#1b1612',foot:'#4a3626',foot2:'#3a2a1d',belt:'#8a5a20',buckle:'#ffc93c',
  button:'#d9b27a',bow:'#a4703d',bowL:'#d9b27a',str:'#f6ead2',shaft:'#d9b27a',tip:'#c9cfd6',fl:'#e5484d',flW:'#f6ead2',
  quiver:'#7a5232',quiverT:'#5a3a22',band:'#c9a040',strap:'#4a321e',moss:'#4f8a34',mossL:'#8fd14f'};
const dk=(c,k)=>mix(c,'#0d1418',k),lt=(c,k)=>mix(c,'#ffffff',k);
// the armours of the game: colours of the tunic (a) and of the hood (b), as in ITEMS[].tint; the bows: colour and shape
const ARM={giubba:['#2fb3a6','#23877d'],cotta:['#8a97a2','#5d6872'],mantello_ombra:['#5a4682','#3a2c58'],corazza_muschio:['#5f9e3c','#3f7a2a']};
const BOWS={arco_frassino:['#a4703d',null],arco_ricurvo:['#7a4a2a','recurve'],arco_spine:['#4f8a34','thorn'],arco_fenice:['#d9442e','phoenix'],balestra:['#6b4a2a','xbow']};

// ------------------------------------------------------------------ small helpers
const rotY=(v,a)=>{const c=Math.cos(a),s=Math.sin(a);return[v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c]};
function chull(pts){pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
  for(const q of pts){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}
  for(let i=pts.length-1;i>=0;i--){const q=pts[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}
  lo.pop();up.pop();return lo.concat(up)}
const poly=pts=>{ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.closePath()};
// soft three-tone shading: a radial gradient from a light spot (x0, y0) to the dark side, the base colour in the middle
function soft(x0,y0,x1,y1,R,col,kl,kd){const g=ctx.createRadialGradient(x0,y0,R*.06,x1,y1,R);g.addColorStop(0,lt(col,kl));g.addColorStop(.5,col);g.addColorStop(1,dk(col,kd));return g}
const line=pts=>{ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1])};
// when standing still the head looks gently one way and the other (period 1, smooth at the seam)
const look=(p,a)=>a*Math.sin(p*TAU)*(.55+.45*Math.cos(p*TAU*2));
// a blink: 1 open, dips to 0 around p0 (the eyelid takes `w` of the cycle)
const blink=(p,p0,w)=>{const d=Math.abs(((p-p0)%1+1.5)%1-.5);return d<w/2?d/(w/2):1};
// keyframes on p: [[p, value or [values]], ...], eased between keys
function keys(K,p){for(let i=0;i<K.length-1;i++){const a=K[i],b=K[i+1];if(p>=a[0]&&p<=b[0]){const k=ez((p-a[0])/Math.max(1e-6,b[0]-a[0]));
  return Array.isArray(a[1])?a[1].map((v,j)=>lerp(v,b[1][j],k)):lerp(a[1],b[1],k)}}const l=K[K.length-1][1];return Array.isArray(l)?l.slice():l}
// a warm rim inside a convex outline, fading out away from the upper left (like rim() for balls and capsules)
function rimPoly(pts,al){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of pts){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])}
  const cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0)/2,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.15,cy+Rr*.15);g.addColorStop(0,wa(al||.32));g.addColorStop(1,wa(0));
  const s=pts.map(q=>[cx+(q[0]-cx)*(1-1.9/Math.max(1,(x1-x0)/2)),cy+(q[1]-cy)*(1-1.9/Math.max(1,(y1-y0)/2))]);ctx.save();ctx.strokeStyle=g;ctx.lineWidth=1.3;poly(s);ctx.stroke();ctx.restore()}

// ------------------------------------------------------------------ the body: a gumdrop (a solid of revolution), the tunic
// rings from the hem up: [height above ZB, radius across the shoulders]; front to back the body is AX times as deep (as in the game,
// where the body is 22 px wide seen from the front and 16 seen from the side). The outline is the hull of the rings seen by the camera,
// so it is right from every side and stays right when the body leans, squashes or stretches
const ZB=4.4,AX=.76,PROF=[[0,8.6],[1.3,10.3],[3.1,11.3],[5.3,11.3],[7.8,10.2],[10.2,8.3],[12.3,6],[14.2,3.2]];
function radAt(dz){if(dz<=PROF[0][0])return PROF[0][1];for(let i=0;i<PROF.length-1;i++){const a=PROF[i],b=PROF[i+1];if(dz<=b[0])return lerp(a[1],b[1],(dz-a[0])/(b[0]-a[0]))}return PROF[PROF.length-1][1]}
// a point on the surface of the tunic (angle t round the body, 0 = in front, π/2 = the hero's right; height z above the ground),
// pushed out by `out`, and its normal
function surf(t,z,out){const dz=z-ZB,r=radAt(dz)+(out||0),sl=(radAt(dz+.5)-radAt(dz-.5));return{p:[Math.cos(t)*r*AX,Math.sin(t)*r,z],n:nrm([Math.cos(t)/AX,Math.sin(t),-sl])}}
// the body's frame: squash/stretch (s: taller > 0), stretch along x (sx, for the dash), lean (the top goes forward > 0) and roll
// (the top goes to the right > 0), round the hem; then the root offset B. Rd turns a direction the same way (no squash)
function frame(A){const ca=Math.cos(A.lean),sa=Math.sin(A.lean),cr=Math.cos(A.roll),sr=Math.sin(A.roll),sz=1+A.s,sxy=1/Math.sqrt(Math.max(.3,sz)),sx=sxy*(1+(A.sx||0));
  const turn=(x,y,z)=>{const y1=y*cr+z*sr,z1=-y*sr+z*cr;return[x*ca+z1*sa,y1,-x*sa+z1*ca]};
  return{T:q=>{const r=turn(q[0]*sx,q[1]*sxy,(q[2]-ZB)*sz);return[r[0]+A.B[0],r[1]+A.B[1],r[2]+ZB+A.B[2]]},Rd:v=>turn(v[0],v[1],v[2])}}

// ------------------------------------------------------------------ the head: a hood like a ball of cloth, the face in its opening
// a point on a ball drawn as a screen circle (like ball()): the offset is squeezed so the limb of the ball lands on the circle
function sp(V0,q,Rr,m){const o=V0.P(0,0,0),pm=V0.P(m),nf=cam.zk*Math.hypot(1,cam.k/cam.zk);return[q[0]+(pm[0]-o[0])*Rr,q[1]+(pm[1]-o[1])*Rr/nf]}
// the part of a ball (screen centre q, radius Rr) inside a cap round direction n with half-angle al, as a screen path:
// the cap's rim where it faces us, closed along the limb of the ball where the cap goes round the back. false if nothing shows
function capPath(V0,q,Rr,n,al){n=nrm(n);let u=cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u),ca=Math.cos(al),sa=Math.sin(al),N=44,b=[],f=[];
  for(let i=0;i<N;i++){const t=i/N*TAU,m=add(mul(n,ca),add(mul(u,Math.cos(t)*sa),mul(v,Math.sin(t)*sa)));b.push(m);f.push(V0.F(m))}
  const vis=f.map(x=>x>=0),nv=vis.filter(Boolean).length;if(!nv)return false;
  if(nv===N){ctx.beginPath();for(const m of b){const s=sp(V0,q,Rr,m);ctx.lineTo(s[0],s[1])}ctx.closePath();return{full:true,rim:b.map(m=>sp(V0,q,Rr,m))}}
  // start right after a hidden sample, so the visible run is in one piece; cut it where the facing crosses zero
  let s0=0;for(let i=0;i<N;i++)if(!vis[i]&&vis[(i+1)%N]){s0=(i+1)%N;break}
  const run=[];let i=s0;const cut=(a,c)=>{const fa=f[a],fc=f[c],k=fa/(fa-fc);return nrm(lerp3(b[a],b[c],k))};
  run.push(cut((s0-1+N)%N,s0));while(vis[i]){run.push(b[i]);i=(i+1)%N}run.push(cut((i-1+N)%N,i));
  const pts=run.map(m=>sp(V0,q,Rr,m)),a0=Math.atan2(pts[0][1]-q[1],pts[0][0]-q[0]),a1=Math.atan2(pts[pts.length-1][1]-q[1],pts[pts.length-1][0]-q[0]);
  // close along the limb, going round on the side where the cap's middle shows
  const nm=sp(V0,q,Rr,n),an=Math.atan2(nm[1]-q[1],nm[0]-q[0]),norm=a=>((a%TAU)+TAU)%TAU,ccw=norm(a0-a1),inC=norm(an-a1)<=ccw;
  ctx.beginPath();for(const s of pts)ctx.lineTo(s[0],s[1]);if(inC)ctx.arc(q[0],q[1],Rr,a1,a1+ccw,false);else ctx.arc(q[0],q[1],Rr,a1,a1-(TAU-ccw),true);ctx.closePath();
  return{full:false,rim:pts}}

// where the face looks (a little up, so seen from the front the face sits in the middle of the hood as in the game) and its pieces
const FACE=[1,0,.27],EYE=[1,.33,.25],CHEEK=[1,.54,.04],MOUTH=[1,-.13,-.06];
// the hood and the face. Vh: the head's own camera (it turns with the look); A.hp: how much the head nods down; o: eyes, mouth, moss
function head(Vh,Rh,S,A,o){const h=Vh.P(0,0,0),{F}=Vh,hood=S.hood,skin=S.skin,nod=v=>rotY(v,A.hp),fd=nrm(nod(FACE));
  const mouthD=nrm(nod(MOUTH)),mossD=nrm(nod([.66,-.72,-.22]));
  // the moss stick, when the mouth turns away: drawn before the hood, so only the part sticking out past the cheek shows
  const mossBack=o.moss&&F(mouthD)<.05;if(mossBack)mossStick(Vh,h,Rh,mouthD,mossD,o,false);
  ink(2.5);ball(h,Rh);ctx.fillStyle=hood;ctx.fill();ctx.stroke();
  // soft shading of a ball lit from the upper left: the three tones blend into each other, no patches with an edge
  ctx.save();ball(h,Rh-.8);ctx.clip();ctx.fillStyle=soft(h[0]-Rh*.36,h[1]-Rh*.42,h[0]-Rh*.05,h[1]+Rh*.05,Rh*1.2,hood,.14,.3);ctx.fillRect(h[0]-Rh,h[1]-Rh,Rh*2,Rh*2);
  // the seam over the top of the hood, from the opening to the back
  {const pts=[];for(let i=0;i<=16;i++){const a=.9+i/16*2.1,m=nod([Math.cos(a),0,Math.sin(a)]);if(F(m)>-.02)pts.push(sp(Vh,h,Rh*.99,m));else if(pts.length)break}
    if(pts.length>1){ctx.strokeStyle=dk(hood,.22);ctx.lineWidth=1;ctx.lineCap='round';line(pts);ctx.stroke()}}
  // the opening: a thin dark lining inside the hood, the face set in it
  const op=capPath(Vh,h,Rh,fd,.87);
  if(op){ctx.fillStyle=dk(hood,.55);ctx.fill();
    ctx.save();ctx.clip();const fc=capPath(Vh,h,Rh*.99,fd,.79);
    if(fc){const fq=sp(Vh,h,Rh,fd);ctx.fillStyle=soft(fq[0]-Rh*.28,fq[1]-Rh*.2,fq[0],fq[1],Rh*.95,skin,.12,.12);ctx.fill();
      // eyes, blush and mouth stay inside the skin: near the edge of the face they fade, never over the rim
      ctx.save();ctx.clip();{const g=ctx.createLinearGradient(0,fq[1]-Rh,0,fq[1]-Rh*.35);g.addColorStop(0,'rgba(60,30,14,.18)');g.addColorStop(1,'rgba(60,30,14,0)');ctx.fillStyle=g;ctx.fillRect(fq[0]-Rh,fq[1]-Rh,Rh*2,Rh)}
      face(Vh,h,Rh,nod,o,fd);ctx.restore()}
    ctx.restore();
    // the edge of the hood round the opening: a thick dark ring, as in the game
    if(op.rim&&op.rim.length>1){ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=2.5;line(op.rim);if(op.full)ctx.closePath();ctx.stroke()}}
  ctx.restore();rim(h,Rh,h,Rh,.3);
  if(o.moss&&!mossBack)mossStick(Vh,h,Rh,mouthD,mossD,o,true)}
// two big dark eyes with a small, sharp point of light (o.eyeLight: false takes it away); they close for a blink, squeeze shut when hit;
// a faint blush, a little mouth when needed. No eye ever sits on the outline of the head: when the head turns, the far eye slides in
// toward the middle of the face (as the game draws it in three-quarter view) and gets narrower as it tucks in beside the near eye,
// until it is gone; it is never drawn see-through
const sstep=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t)};
function face(Vh,h,Rh,nod,o,fd){const{F}=Vh,fq=sp(Vh,h,Rh*.97,fd);
  const edge=q=>1-sstep(.7,.84,Math.hypot(q[0]-h[0],q[1]-h[1])/Rh);
  // a soft limit on how far from the middle of the head an eye may sit (a, b: where the limit starts and the most it reaches)
  const inward=(q,a,b)=>{const dx=q[0]-h[0],dy=q[1]-h[1],d=Math.hypot(dx,dy)/Rh;if(d<=a)return q;const d2=a+(b-a)*(1-Math.exp(-(d-a)/(b-a)));return[h[0]+dx*d2/d,h[1]+dy*d2/d]};
  const ry=2.3,E=[-1,1].map(sd=>{const e=nrm(nod([EYE[0],sd*EYE[1],EYE[2]])),v=F(e);return{v,q:sp(Vh,h,Rh*.97,e),rx:1.95*Math.pow(Math.max(0,v),.7)}}).filter(e=>e.v>.08).sort((a,b)=>b.v-a.v);
  if(E.length){E[0].q=inward(E[0].q,.6,.74)}
  if(E.length>1){const n=E[0],f=E[1];f.q=inward(f.q,.5,.66);const gap=Math.hypot(f.q[0]-n.q[0],f.q[1]-n.q[1])-n.rx-.8;f.rx=Math.min(f.rx,Math.max(0,gap))}
  for(const{v,q,rx} of E){if(rx<.7)continue;
    ctx.save();
    if(o.shut){const dir=fq[0]>=q[0]?1:-1;ctx.strokeStyle=HC.eye;ctx.lineWidth=1.3;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
      ctx.moveTo(q[0]-dir*rx*.9,q[1]-1.5);ctx.lineTo(q[0]+dir*rx*.8,q[1]);ctx.lineTo(q[0]-dir*rx*.9,q[1]+1.5);ctx.stroke()}
    else{const sq=(o.blink==null?1:o.blink)*(1-.3*(o.squint||0)),sy=ry*Math.max(.12,sq);ctx.fillStyle=HC.eye;ctx.beginPath();ctx.ellipse(q[0],q[1],rx,sy,0,0,TAU);ctx.fill();
      if(o.eyeLight!==false&&sq>.45&&rx>1.2){ctx.fillStyle='#fdf6e8';ball([q[0]-rx*.34,q[1]-sy*.46],.36);ctx.fill()}}
    ctx.restore()}
  for(const sd of[-1,1]){const c=nrm(nod([CHEEK[0],sd*CHEEK[1],CHEEK[2]])),v=F(c),k=sstep(.15,.35,v);if(k<=0)continue;const q=sp(Vh,h,Rh*.97,c),kk=k*edge(q);ctx.fillStyle=`rgba(255,120,110,${.2*kk})`;ell(q[0],q[1],1.7*Math.pow(v,.7),1);ctx.fill()}
  if(o.mouth>.05){const m=nrm(nod(MOUTH)),v=F(m);if(v>.05){const q=sp(Vh,h,Rh*.97,m),w=1.3*Math.max(.45,v),hh=.6+o.mouth*1.1;ink(1);ctx.fillStyle='#5a2020';ctx.beginPath();ctx.ellipse(q[0],q[1],w,hh,0,0,TAU);ctx.fill();ctx.stroke()}}}
// the moss stick from the mouth: green, a glowing tip that brightens on each drag, a puff of smoke after it
function mossStick(Vh,h,Rh,md,dd,o,front){const a3=mul(md,Rh*.92),b3=add(a3,mul(dd,5.4)),A=sp(Vh,h,1,a3),B=sp(Vh,h,1,b3),t=G.t,inh=o.inhale||0,pulse=.72+.12*Math.sin(t*3.1)+.55*inh;
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=3.1;seg(A,B);ctx.stroke();ctx.strokeStyle=HC.moss;ctx.lineWidth=1.8;seg(A,B);ctx.stroke();
  ctx.fillStyle=HC.mossL;for(let i=1;i<3;i++){const q=[lerp(A[0],B[0],i/3),lerp(A[1],B[1],i/3)-.3];ball(q,.45);ctx.fill()}
  shine('150,255,90',B[0],B[1],(front?4.5:3.5)*pulse,(front?.55:.35)*pulse);ctx.fillStyle=inh>.3?'#f4ffc8':'#c9ff7a';ball(B,.95);ctx.fill();
  if(LOWFX)return;for(let k=0;k<3;k++){const q=(t*.42+k/3)%1;ctx.fillStyle=`rgba(185,238,150,${(1-q)*.3})`;ball([B[0]+q*2+Math.sin(t*2.1+k*2)*1.6*q,B[1]-1.5-q*12],.55+q*2);ctx.fill()}
  if(o.exhale>0){const e=o.exhale;for(let k=0;k<3;k++){const q=e*1.25-k*.14;if(q<=0||q>=1)continue;ctx.fillStyle=`rgba(190,240,160,${(1-q)*.34})`;ball([A[0]+2+q*7+Math.sin(q*5+k)*1.5,A[1]-1-q*13],1.3+q*4.5);ctx.fill()}}}

// ------------------------------------------------------------------ the feet: round shoes under the hem (no legs, as in the game)
function foot(V0,f,col){const{P}=V0,hq=P(add(f,[-1,0,3])),tq=P(add(f,[1.7,0,2.85]));ink(2.4);hull(hq,3.05,tq,3.15);ctx.fillStyle=col;ctx.fill();ctx.stroke();
  ctx.save();hull(hq,2.2,tq,2.3);ctx.clip();const m=[(hq[0]+tq[0])/2,(hq[1]+tq[1])/2];ctx.fillStyle='rgba(0,0,0,.3)';ell(m[0]+1.6,m[1]+2,4.4,2.4);ctx.fill();
  ctx.fillStyle='rgba(255,236,210,.16)';ell(m[0]-1.2,m[1]-1.6,2.4,1.3);ctx.fill();ctx.restore()}

// ------------------------------------------------------------------ the bow: an arc in the plane of `up` (along the string) and `aim`
// grip = the bow hand; the tips sit bk behind it; the string goes from tip to tip through `pinch` (the string hand) when drawn
function bowPts(grip,aim,up,draw,Lb,bk0){const bk=bk0+draw*1.6,top=add(sub(grip,mul(aim,bk)),mul(up,Lb)),bot=sub(sub(grip,mul(aim,bk)),mul(up,Lb)),ctl=add(grip,mul(aim,bk));return{top,bot,ctl,bk,mid:sub(grip,mul(aim,bk))}}
function bow(V0,B,S,draw,pinch,arrowOn,grip,aim){const{P,D}=V0,T=P(B.top),Bo=P(B.bot),C=P(B.ctl),col=S.bowCol||HC.bow,kind=S.bowKind;
  const curve=()=>{ctx.beginPath();ctx.moveTo(T[0],T[1]);ctx.quadraticCurveTo(C[0],C[1],Bo[0],Bo[1])};
  if(kind==='phoenix')shine('255,130,40',P(grip)[0],P(grip)[1],18,.3+.08*Math.sin(G.t*9));
  // the string: behind the stave or in front of it, whichever is nearer to the camera
  const Sm=pinch||B.mid,Sx=P(Sm),str=()=>{ctx.strokeStyle=HC.str;ctx.lineWidth=1.1;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(T[0],T[1]);ctx.lineTo(Sx[0],Sx[1]);ctx.lineTo(Bo[0],Bo[1]);ctx.stroke()};
  const strFirst=D(grip)>=D(Sm);if(strFirst)str();
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=5.8;curve();ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=3.1;curve();ctx.stroke();
  ctx.strokeStyle=lt(col,.35);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(T[0]-.6,T[1]-.5);ctx.quadraticCurveTo(C[0]-.7,C[1]-.6,Bo[0]-.6,Bo[1]-.5);ctx.stroke();
  bowTrim(V0,B,kind,col);
  if(!strFirst)str();
  if(arrowOn)arrow(V0,arrowOn.a,arrowOn.b,arrowOn.al==null?1:arrowOn.al)}
// the trims of the special bows: recurved tips with a green grip, thorns and a flower, phoenix flames
function bowTrim(V0,B,kind,col){if(!kind)return;const{P}=V0,T=P(B.top),Bo=P(B.bot),C=P(B.ctl),bz=(t)=>[(1-t)*(1-t)*T[0]+2*(1-t)*t*C[0]+t*t*Bo[0],(1-t)*(1-t)*T[1]+2*(1-t)*t*C[1]+t*t*Bo[1]];
  if(kind==='recurve'){for(const[q,o] of[[T,B.top],[Bo,B.bot]]){const e=P(add(o,mul(nrm(sub(B.ctl,o)),-2.6)));ctx.strokeStyle=INK;ctx.lineWidth=4.6;seg(q,e);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=2.2;ctx.stroke()}
    const g0=bz(.42),g1=bz(.58);ctx.strokeStyle=INK;ctx.lineWidth=4.8;seg(g0,g1);ctx.stroke();ctx.strokeStyle='#6cc24a';ctx.lineWidth=3;ctx.stroke()}
  else if(kind==='thorn'){ink(1.1);ctx.fillStyle='#2f5a22';for(const t of[.12,.28,.72,.88]){const a=bz(t),b=bz(t+.04),dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;tri(a[0],a[1],a[0]-dy/l*3.2+dx/l,a[1]+dx/l*3.2+dy/l,1)}
    const fq=bz(.05);ctx.fillStyle='#b874e6';for(let i=0;i<5;i++){const a=i*TAU/5+G.t*.6;ball([fq[0]+Math.cos(a)*2,fq[1]+Math.sin(a)*2],1.5);ctx.fill();ctx.stroke()}ctx.fillStyle='#ffe28a';ball(fq,1.1);ctx.fill()}
  else if(kind==='phoenix'){for(const q of[T,Bo]){const fl=Math.sin(G.t*14+q[1])*1.4;ink(1.2);ctx.fillStyle='#ffb020';ctx.beginPath();ctx.moveTo(q[0]-2,q[1]);ctx.quadraticCurveTo(q[0]-5-fl,q[1]-4,q[0]+fl*.5,q[1]-8);ctx.quadraticCurveTo(q[0]+3,q[1]-3,q[0]+2,q[1]);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#fff1a8';ball([q[0]-.4,q[1]-3],1.1);ctx.fill()}
    const g0=bz(.38),g1=bz(.62);ctx.strokeStyle='#ffd86b';ctx.lineWidth=1.3;seg(g0,g1);ctx.stroke()}}
// an arrow from a (the nock) to b (the point): shaft, steel head, red and white fletching near the nock
function arrow(V0,a3,b3,al){if(al<=.02)return;const{P}=V0,A=P(a3),B=P(b3),dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy)||1,u=[dx/l,dy/l],n=[-u[1],u[0]],hs=cl(l/6,.45,1);ctx.save();ctx.globalAlpha=al;
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.6;seg(A,B);ctx.stroke();ctx.strokeStyle=HC.shaft;ctx.lineWidth=1.1;seg(A,B);ctx.stroke();
  ink(.9);ctx.fillStyle=HC.tip;ctx.beginPath();ctx.moveTo(B[0]+u[0]*3*hs,B[1]+u[1]*3*hs);ctx.lineTo(B[0]+n[0]*1.6,B[1]+n[1]*1.6);ctx.lineTo(B[0]-n[0]*1.6,B[1]-n[1]*1.6);ctx.closePath();ctx.fill();ctx.stroke();
  for(const[sd,c] of[[1,HC.fl],[-1,HC.flW]]){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(A[0]+u[0]*1*hs,A[1]+u[1]*1*hs);ctx.lineTo(A[0]+u[0]*3.6*hs+n[0]*sd*.4,A[1]+u[1]*3.6*hs+n[1]*sd*.4);ctx.lineTo(A[0]+u[0]*.4*hs+n[0]*sd*2.2,A[1]+u[1]*.4*hs+n[1]*sd*2.2);ctx.closePath();ctx.fill();ctx.stroke()}
  ctx.restore()}
// the crossbow (balestra): a stock along the aim, a steel bow across its front, the string to the nut, a bolt when it is loaded
function xbow(V0,grip,aim,side,draw,loaded){const{P}=V0,back=sub(grip,mul(aim,5)),front=add(grip,mul(aim,9)),A=P(back),Fr=P(front);
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=5.4;seg(A,Fr);ctx.stroke();ctx.strokeStyle=BOWS.balestra[0];ctx.lineWidth=3;ctx.stroke();
  const t0=add(front,mul(side,8.5)),t1=add(front,mul(side,-8.5)),cc=add(front,mul(aim,2.4)),T0=P(t0),T1=P(t1),C=P(cc),nut=P(add(grip,mul(aim,1.2-draw*2)));
  ctx.strokeStyle=HC.str;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(T0[0],T0[1]);ctx.lineTo(nut[0],nut[1]);ctx.lineTo(T1[0],T1[1]);ctx.stroke();
  ctx.strokeStyle=INK;ctx.lineWidth=4.6;ctx.beginPath();ctx.moveTo(T0[0],T0[1]);ctx.quadraticCurveTo(C[0],C[1],T1[0],T1[1]);ctx.stroke();ctx.strokeStyle='#a7b0ba';ctx.lineWidth=2.4;ctx.stroke();
  if(loaded){const b0=P(add(grip,mul(aim,1))),b1=P(add(grip,mul(aim,12)));ctx.strokeStyle=INK;ctx.lineWidth=2.6;seg(b0,b1);ctx.stroke();ctx.strokeStyle='#dfe4ea';ctx.lineWidth=1.2;ctx.stroke()}}

// ------------------------------------------------------------------ the quiver on the back, slung from the left shoulder
// the leather tube and the arrows are two pieces: the arrows poke out over the right shoulder, next to the head, so they have their own
// place in the draw order (in front of the head seen from that side, behind it seen from the front)
const QB=[-11.2,-3.6,ZB+3.4],QT=[-8.6,4.4,ZB+17];
function quiverTube(V0,X){const{P}=V0,b3=X.T(QB),t3=X.T(QT),ax=nrm(sub(t3,b3)),Bq=P(b3),Tq=P(t3),r=3.5;
  ink(2.4);hull(Bq,r,Tq,r);ctx.fillStyle=HC.quiver;ctx.fill();ctx.stroke();
  ctx.save();hull(Bq,r-.9,Tq,r-.9);ctx.clip();const dx=Tq[0]-Bq[0],dy=Tq[1]-Bq[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,sd=nx>0?1:-1;
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.moveTo(Bq[0]+nx*sd*r*.2,Bq[1]+ny*sd*r*.2);ctx.lineTo(Tq[0]+nx*sd*r*.2,Tq[1]+ny*sd*r*.2);ctx.lineTo(Tq[0]+nx*sd*r*2,Tq[1]+ny*sd*r*2);ctx.lineTo(Bq[0]+nx*sd*r*2,Bq[1]+ny*sd*r*2);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,236,210,.22)';ctx.lineWidth=1.3;seg([Bq[0]-nx*sd*r*.45,Bq[1]-ny*sd*r*.45],[Tq[0]-nx*sd*r*.45,Tq[1]-ny*sd*r*.45]);ctx.stroke();
  const band=(k,col,w)=>{const Q=P(lerp3(b3,t3,k));ctx.strokeStyle=col;ctx.lineWidth=w;seg([Q[0]-nx*r,Q[1]-ny*r],[Q[0]+nx*r,Q[1]+ny*r]);ctx.stroke()};
  band(.92,HC.quiverT,3.4);band(.3,HC.band,1.6);ctx.restore();
  // the open mouth of the tube where it faces up toward us
  ctx.fillStyle='#2a1a10';ink(1.4);const m=P(add(t3,mul(ax,.4)));ctx.beginPath();ctx.ellipse(m[0],m[1],r*.92,r*.42*KR()+.5,Math.atan2(dy,dx)+Math.PI/2,0,TAU);ctx.fill();ctx.stroke();
  rim(Bq,r,Tq,r,.24)}
function quiverArrows(V0,X,jig){const{P}=V0,b3=X.T(QB),t3=X.T(QT),ax=nrm(sub(t3,b3)),sideV=nrm(cross(ax,[0,0,1])),mouth=add(t3,mul(ax,.4));
  const out=nrm(add(ax,[0,.12,0]));for(const[o,h,c] of[[-1.5,4.2,HC.flW],[.2,5.4,HC.fl],[1.6,4,HC.flW]]){const a=add(mouth,mul(sideV,o)),tip=add(add(a,mul(out,h)),[0,0,jig*(o+2)*.15]),A=P(a),Tp=P(tip);
    ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.4;seg(A,Tp);ctx.stroke();ctx.strokeStyle='#c9a26a';ctx.lineWidth=1;ctx.stroke();
    const dx=Tp[0]-A[0],dy=Tp[1]-A[1],l=Math.hypot(dx,dy)||1,u=[dx/l,dy/l],n=[-u[1],u[0]];ctx.fillStyle=c;ink(1.2);ctx.beginPath();ctx.moveTo(Tp[0]+u[0]*1.2,Tp[1]+u[1]*1.2);ctx.lineTo(Tp[0]-u[0]*3.8+n[0]*2.3,Tp[1]-u[1]*3.8+n[1]*2.3);ctx.lineTo(Tp[0]-u[0]*2.6,Tp[1]-u[1]*2.6);ctx.lineTo(Tp[0]-u[0]*3.8-n[0]*2.3,Tp[1]-u[1]*3.8-n[1]*2.3);ctx.closePath();ctx.fill();ctx.stroke()}}

// ------------------------------------------------------------------ the armour bits you can see
// the mantello d'ombra: a purple cloak hanging from the shoulders round the back, its hem waving
function cape(V0,X,sway){const{P}=V0,top=[],bot=[],N=10;
  for(let i=0;i<=N;i++){const a=-1+2*i/N,t=Math.PI+a*1.8,ws=Math.sin(a*Math.PI*1.5+sway*2)*.8;
    top.push(P(X.T(surf(t,ZB+13.4-Math.abs(a)*1.6,.6).p)));
    const s=surf(t,ZB+.1,1.3+(1-Math.abs(a))*1.6+ws*.4).p;bot.push(P(X.T([s[0]-sway*.7,s[1],s[2]+(i%2?1:0)*1.1+ws*.4])))}
  const pts=top.concat(bot.reverse());ink(2.4);ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();
  let y0=1e9,y1=-1e9;for(const q of pts){y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}
  const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#6a54a0');g.addColorStop(.5,'#3a2c58');g.addColorStop(1,'#241a3a');ctx.fillStyle=g;ctx.fill();ctx.stroke();
  if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const ph=(G.t*.7+i/3)%1,q=P(X.T(surf(Math.PI+(i-1)*.9,ZB+1+ph*8,2).p));glow('140,90,230',q[0],q[1],4+ph*3,.26*(1-ph))}ctx.restore()}}
function pauldron(V0,c3,rr){const q=V0.P(c3);ink(2.2);ball(q,rr);ctx.fillStyle='#9aa3ad';ctx.fill();ctx.stroke();ctx.save();ball(q,rr-.8);ctx.clip();ctx.fillStyle='rgba(20,26,34,.28)';ell(q[0]+rr*.4,q[1]+rr*.45,rr,rr*.6);ctx.fill();ctx.fillStyle='rgba(255,255,255,.5)';ell(q[0]-rr*.35,q[1]-rr*.4,rr*.45,rr*.28);ctx.fill();ctx.restore()}
function mossClump(V0,c3,k){const q=V0.P(c3);ink(1.6);ctx.fillStyle='#5f9e3c';for(let i=0;i<3;i++){ball([q[0]+(i-1)*2.6*k,q[1]-(i===1?1.4:0)],2.8*k);ctx.fill();ctx.stroke()}ctx.fillStyle='#9fe06a';ball([q[0]-1,q[1]-1.6],1);ctx.fill();ball([q[0]+2,q[1]-.5],.8);ctx.fill()}

// ------------------------------------------------------------------ poses: every move depends only on p, so it loops without a jump
// A: the body (B root, lean, roll, s squash, sx stretch along x), the head (hd offset, hy look, hp nod), the bow in the body's frame
// (grip = the bow hand, aim = where the bow's belly points, up = along the string, draw), the string hand hR, the feet in the room
// (fL, fR), the face (blink, squint, shut, mouth). At rest the bow is held flat in front of the belly like in the game today
const REST={grip:[13.8,-.4,5.5],aim:nrm([.8,0,-.6]),up:nrm([0,.98,.2]),hR:[-.6,11.4,11.4]},SHOOT={grip:[17.4,-.5,12.2],aim:[1,0,0],up:nrm([0,1,.06])},BK=5.6,LB=11.2,PULL=4;
function pose(anim,p,o){const ph=p*TAU,A={B:[0,0,0],lean:.02,roll:0,s:0,sx:0,hd:[0,0,0],hy:0,hp:.06,grip:REST.grip,aim:REST.aim,up:REST.up,hR:REST.hR,draw:0,pinch:false,nock:0,
  fL:[.8,-5,0],fR:[.2,5,0],blink:1,squint:0,shut:0,mouth:0,fly:-1,rel:-1,inhale:0,exhale:0,speed:0,dust:-1,stars:0,flash:0,jig:0,sway:0,twang:0};
  if(anim==='idle'){const b=Math.sin(ph);A.s=.018*b;A.B=[0,0,.22*b];A.hd=[0,0,.3*b];A.hy=look(p,.2);A.hp=.06+.015*Math.sin(ph+.6);A.blink=blink(p,.43,.08);
    A.grip=add(REST.grip,[0,0,.3*b+.15*Math.sin(ph*2)]);A.up=nrm([0,.98,.2+.03*Math.sin(ph)]);A.hR=add(REST.hR,[0,0,.3*b]);
    A.jig=Math.sin(ph)*.4;A.sway=Math.sin(ph);A.inhale=p<.22?Math.sin(p/.22*Math.PI):0;A.exhale=p>.24&&p<.62?(p-.24)/.38:0}
  else if(anim==='walk'){const st=stepper(p,.5),a=st(0,3.4,2.6),b=st(.5,3.4,2.6),up=Math.abs(Math.sin(ph));
    A.fL=[.8+a.x,-5,a.z];A.fR=[.2+b.x,5,b.z];A.B=[0,-.4*Math.sin(ph),-.3+1.4*up];A.s=-.04+.065*up;A.lean=.1;A.roll=-.04*Math.sin(ph);
    A.hd=[0,0,.4*Math.cos(ph*2+.5)];A.hy=.07*Math.sin(ph);A.hp=.08;
    A.grip=add(REST.grip,[.6-1.1*Math.cos(ph),0,.5*up]);A.aim=nrm([.8,0,-.56+.06*Math.cos(ph)]);A.up=nrm([0,.98,.2+.06*Math.sin(ph)]);
    A.hR=add(REST.hR,[3.2*Math.cos(ph),0,.6*up+.8*Math.max(0,Math.cos(ph))]);A.jig=Math.sin(ph*2)*.9;A.sway=Math.sin(ph)*1.6}
  else if(anim==='shoot'||anim==='aim'){// the bow comes up level: .0-.38 draws the string back, .38-.5 holds the aim, .5 lets go, the hand comes
    // back to the string (.6-.86) and nocks a new arrow (.86-1). 'aim' is the game's P.aiming: the string drawn by o.pull, nothing else
    let draw=0,rel=-1,hand;const sh=SHOOT,S0=sub(sh.grip,mul(sh.aim,BK));
    if(anim==='aim'){draw=cl(o.pull==null?1:o.pull,0,1);A.nock=cl(draw*4+.25,0,1)}
    else if(p<.38){draw=ez(p/.38);A.nock=1}else if(p<.5){draw=1;A.nock=1}else{rel=p-.5;A.fly=rel/.5;A.nock=p>.86?(p-.86)/.14:0}
    A.draw=draw;A.grip=add(sh.grip,mul(sh.aim,1.4*draw+(rel>=0?.9*Math.exp(-rel*30)*Math.sin(rel*60):0)));A.aim=sh.aim;A.up=sh.up;
    const pin=k=>sub(sub(A.grip,mul(sh.aim,BK+1.6*k)),mul(sh.aim,PULL*k));
    if(rel<0)hand=pin(draw);else{const back=add(pin(1),[-.8,1.6,.9]);hand=rel<.1?lerp3(pin(1),back,ez(rel/.1)):rel<.36?lerp3(back,S0,ez((rel-.1)/.26)):S0}
    A.hR=hand;A.pinch=rel<0;A.twang=rel>=0&&rel<.16?1-rel/.16:0;A.rel=rel;
    A.lean=-.05*draw+(rel>=0?.05*Math.exp(-rel*12):0);A.B=[-.3*draw,0,0];A.s=.012*draw;A.hd=[.3,0,0];A.hp=.04;A.squint=draw>.5?(draw-.5)/.5:0;
    A.fL=[2.2,-5.2,0];A.fR=[-1,5,0];A.jig=rel>=0?.8*Math.exp(-rel*10):0}
  else if(anim==='dash'){// crouch, burst forward with the body stretched, a little hop, land and settle
    const K=[[0,[0,0,0,.02,0,0]],[.16,[-.6,0,-1.4,-.08,-.12,0]],[.34,[6,0,2.4,.4,.1,.2]],[.56,[8.4,0,1,.28,.02,.1]],[.72,[5,0,-.8,.04,-.08,0]],[.86,[1.6,0,.3,-.02,.03,0]],[1,[0,0,0,.02,0,0]]];
    const v=keys(K,p);A.B=[v[0],v[1],v[2]];A.lean=v[3];A.s=v[4];A.sx=v[5];A.hp=.06+v[3]*.2;A.hd=[0,0,-v[3]*1.2];
    const run=cl((p-.16)/.4,0,1),k=Math.sin(run*Math.PI);A.speed=p>.2&&p<.62?Math.sin((p-.2)/.42*Math.PI):0;A.dust=p>.14&&p<.5?(p-.14)/.36:-1;
    A.grip=add(REST.grip,[-2.6*k,0,1.2*k]);A.aim=nrm([.8,0,-.6+.35*k]);A.hR=add(REST.hR,[-5.5*k,.6*k,2.4*k]);
    A.fL=[.8+v[0]+lerp(0,-4,k),-5,k*3.4];A.fR=[.2+v[0]+lerp(0,3,k),5,k*1.6];A.jig=k*1.6;A.sway=-k*3;A.squint=k*.6}
  else if(anim==='hit'){// knocked back, eyes squeezed shut, a wobble back to standing
    const kb=p<.12?ez(p/.12):Math.exp(-(p-.12)*6)*Math.cos((p-.12)*16);A.lean=-.32*kb;A.B=[-2.6*kb,0,.4*kb];A.s=-.08*kb;A.roll=.05*kb;
    A.hd=[-.6*kb,0,.4*kb];A.hp=.06-.1*kb;A.shut=p<.5?1:0;A.mouth=p<.5?1:0;A.flash=p<.14?1-p/.14:0;A.stars=p<.75?1-p/.75:0;
    A.grip=add(REST.grip,[-1.6*kb,0,2.2*kb]);A.aim=nrm([.8,0,-.6+.3*kb]);A.hR=add(REST.hR,[-1.4*kb,1.6*kb,3.4*kb]);A.jig=kb*1.4;A.sway=kb*2}
  return A}

// ------------------------------------------------------------------ the hero
function arciere(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const S0=o.style||{},arm=S0.armor&&ARM[S0.armor]?S0.armor:'giubba',wk=S0.weapon;
  const S={...S0,body:S0.body||ARM[arm][0],hood:S0.hood||ARM[arm][1],skin:S0.skin||HC.skin,belt:S0.belt||HC.belt};
  const isX=S0.held==='xbow'||wk==='balestra';let bk=S0.bowKind!==undefined?S0.bowKind:(wk&&BOWS[wk]?BOWS[wk][1]:null);if(bk==='plain'||bk==='xbow')bk=null;
  S.bowKind=bk;S.bowCol=S0.bowCol||(wk&&BOWS[wk]?BOWS[wk][0]:HC.bow);
  const V0=V(face),{P,D,F}=V0,A=pose(anim,p,o),X=frame(A),Rh=10;
  // the shadow on the floor, smaller when the hero is up in the air
  {const lift=cl(A.B[2]/6,0,1),q=P(A.B[0]+.5,A.B[1],0);shadow(x+q[0]*sc,y+q[1]*sc,13.5*sc*(1-.2*lift),5.4*sc*KR()*(1-.2*lift),.3)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  if(S.ring&&typeof ringAura==='function'){ctx.save();ctx.translate(0,-8);try{ringAura(S)}catch(e){}ctx.restore()}
  const parts=[],Cb=X.T([0,0,ZB+7]),dT=D(Cb);
  // dust kicked up at the start of a dash and speed lines behind the hero (effects of the game, not of the sheets)
  if(!o.noFx&&A.dust>=0&&!LOWFX)parts.push({d:D([-8,0,3]),f:()=>{for(let i=0;i<4;i++){const k=A.dust,q=P([-2-k*9-i*2.4,(i-1.5)*3.4,1+k*3+i*.4]);ctx.fillStyle=`rgba(220,205,170,${.42*(1-k)})`;ball(q,2+k*4.2+i*.6);ctx.fill()}}});
  if(!o.noFx&&A.speed>0&&!LOWFX)parts.push({d:D(X.T([-14,0,ZB+8])),f:()=>{for(let i=0;i<5;i++){const z=4+i*5,a=X.T([-12,(i-2)*3.6,z]),b=add(a,[-8-6*A.speed-(i%2)*3,0,0]),A2=P(a),B2=P(b);ctx.strokeStyle=`rgba(255,255,255,${.6*A.speed})`;ctx.lineWidth=1.6;ctx.lineCap='round';seg(A2,B2);ctx.stroke()}}});
  // the feet: always under the body, the far one darker
  for(const[sd,f] of[[-1,A.fL],[1,A.fR]]){const far=F(0,sd,0)<0;parts.push({d:dT-100+D(f)*.01,f:()=>foot(V0,f,far?(S.foot2||HC.foot2):(S.foot||HC.foot))})}
  // the mantello d'ombra hangs behind the back, over the quiver
  if(arm==='mantello_ombra')parts.push({d:D(X.T([-14,0,ZB+4])),f:()=>cape(V0,X,A.sway*.4)});
  // the tunic: the hull of the rings, three tones, the hem, the collar, seam and buttons, the strap of the quiver, the belt and its buckle
  const Hc=add(X.T([.5,0,ZB+15]),add(X.Rd([0,0,7.4]),A.hd)),hDep=D(Hc);
  parts.push({d:dT,f:()=>{const pts=[];for(const[dz,r] of PROF)for(let i=0;i<24;i++){const t=i/24*TAU;pts.push(P(X.T([Math.cos(t)*r*AX,Math.sin(t)*r,ZB+dz])))}
    const hp=chull(pts);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of hp){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])}
    const w=x1-x0,h=y1-y0,cx=(x0+x1)/2,cy=(y0+y1)/2;
    // the tunic in three tones that blend (light from the upper left), so no patch shows an edge
    ctx.lineJoin='round';ink(2.5);poly(hp);ctx.fillStyle=soft(cx-w*.24,cy-h*.26,cx-w*.04,cy+h*.04,Math.max(w,h)*.72,S.body,.15,.28);ctx.fill();ctx.stroke();
    ctx.save();poly(hp);ctx.clip();
    // the soft shadow of the head on the shoulders
    {const hq=P(Hc),sy=hq[1]+Rh*.95,g=ctx.createRadialGradient(hq[0]+1.2,sy,1,hq[0]+1.2,sy,Rh*1.05);g.addColorStop(0,'rgba(0,0,0,.18)');g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.save();ctx.translate(0,sy);ctx.scale(1,.4);ctx.translate(0,-sy);ctx.fillStyle=g;ctx.fillRect(hq[0]-Rh*1.3,sy-Rh*1.1,Rh*2.6,Rh*2.2);ctx.restore()}
    // the hem: a darker band all round the bottom of the tunic, only where it faces us
    surfLine(V0,X,t=>surf(t,ZB+.9,.15),dk(S.body,.24),2.2,0);
    if(S.skinId)for(const[t,dz] of[[-.5,9.5],[.3,6.5],[-.1,3.6],[.75,11],[-.9,5.6],[2.6,8],[3.4,4.6],[-2.4,10]]){const s=surf(t,ZB+dz,.1),v=F(X.Rd(s.n));if(v>.1){const q=P(X.T(s.p));ctx.fillStyle=S.skinId==='stellato'?'#ffffff':'#f6ff9a';ball(q,.9);ctx.fill()}}
    if(arm==='cotta'){ctx.strokeStyle='rgba(20,26,34,.32)';ctx.lineWidth=.9;for(let r=0;r<6;r++)for(let c=0;c<16;c++){const s=surf(c/16*TAU+(r%2)*.2,ZB+2+r*2.1,.1),n=X.Rd(s.n);if(F(n)<.12)continue;const q=P(X.T(s.p));ctx.beginPath();ctx.arc(q[0],q[1],1.2,0,Math.PI);ctx.stroke()}}
    if(arm==='corazza_muschio')on(V0,X.T([0,0,ZB+5.5]),1,X.Rd([.76,-.3,.1]),.05,()=>{const s=surf(-.32,ZB+5.4,.2),q=P(X.T(s.p));ctx.fillStyle='rgba(95,158,60,.6)';ell(q[0],q[1],5,3);ctx.fill();ctx.fillStyle='rgba(159,224,106,.75)';for(const[a,b] of[[-3,1],[0,2.6],[2,0]]){ball([q[0]+a,q[1]+b],.9);ctx.fill()}});
    if(arm==='giubba'){// the collar, the seam down the front and the buttons of the leather jacket
      for(const sd of[-1,1])surfLine(V0,X,k=>surf(sd*lerp(.62,.04,k),lerp(ZB+13.2,ZB+10.8,k),.1),'rgba(27,22,18,.5)',1.3,1);
      surfLine(V0,X,k=>surf(.04,lerp(ZB+10.8,ZB+6.8,k),.1),'rgba(27,22,18,.42)',1,1,[1.6,1.6]);
      for(const z of[ZB+9.9,ZB+8]){const s=surf(.17,z,.25),n=X.Rd(s.n);if(F(n)>.1){const q=P(X.T(s.p));ctx.fillStyle=HC.button;ink(.7);ball(q,.95);ctx.fill();ctx.stroke()}}}
    // the strap of the quiver: over the left shoulder, across the chest to the right hip and round the back
    surfLine(V0,X,t=>surf(t,ZB+8.4-4.6*Math.sin(t),.35),HC.strap,1.4,0);
    // the belt with the golden buckle
    surfLine(V0,X,t=>surf(t,ZB+5.6,.3),S.belt,2.7,0,null,true);
    {const s=surf(0,ZB+5.6,.55),n=X.Rd(s.n),v=F(n);if(v>.05){const q=P(X.T(s.p)),k=Math.max(.45,v);ctx.save();ctx.globalAlpha=cl(v*4,0,1);ink(1);ctx.fillStyle=HC.buckle;ctx.fillRect(q[0]-1.7*k,q[1]-2,3.4*k,4);ctx.strokeRect(q[0]-1.7*k,q[1]-2,3.4*k,4);ctx.fillStyle='#fff3c0';ctx.fillRect(q[0]-1.1*k,q[1]-1.4,1*k,1);ctx.fillStyle='#8a5a20';ctx.fillRect(q[0]-.5*k,q[1]-.4,1*k,1.6);ctx.restore()}}
    if(S.amu)amulet(V0,X,S.amu);
    ctx.restore();rimPoly(hp,.32);
    if(A.flash>0){ctx.save();ctx.globalAlpha=A.flash*.3;poly(hp);ctx.fillStyle='#ffffff';ctx.fill();ctx.restore()}}});
  // the quiver on the back (the balestriere keeps his bolts in it too)
  parts.push({d:D(X.T([-11,0,ZB+6])),f:()=>quiverTube(V0,X)});
  parts.push({d:D(X.T(QT)),f:()=>quiverArrows(V0,X,A.jig)});
  // the armour on the shoulders
  if(arm==='cotta'||arm==='corazza_muschio')for(const sd of[-1,1]){const c3=X.T([.2,sd*8.4,ZB+11.2]);parts.push({d:D(c3)+.05,f:()=>arm==='cotta'?pauldron(V0,c3,3.7):mossClump(V0,c3,1)})}
  // the bow and the hand that holds it, in front of the belly; the string hand at the right side (or on the string). No arms, as in the game
  const grip=X.T(A.grip),aim=nrm(X.Rd(A.aim)),up=nrm(X.Rd(A.up)),hR=X.T(A.hR),Bw=bowPts(grip,aim,up,A.draw,LB,BK);
  parts.push({d:D(X.T([12,0,ZB+5])),f:()=>{
    if(isX){xbow(V0,grip,aim,up,A.draw,A.nock>.5)}
    else{let pinch=A.pinch?hR:null;if(!pinch&&A.twang>0){const m=Bw.mid;pinch=add(m,mul(aim,Math.sin(A.twang*22)*1.2*A.twang))}
      const nk=A.pinch?hR:Bw.mid,arrowOn=A.nock>.02?{a:nk,b:add(grip,mul(aim,4.6)),al:A.nock}:null;bow(V0,Bw,S,A.draw,pinch,arrowOn,grip,aim)}
    fist(V0,grip,2.8,S.skin);if(S.ring)ringOn(V0,grip,S.ring)}});
  parts.push({d:anim==='shoot'||anim==='aim'?D(X.T([12,0,ZB+5]))+.01:D(X.T(REST.hR)),f:()=>fist(V0,hR,2.7,S.skin)});
  // the head turns on its own camera (the look), the face nods
  const dv=Math.atan2(Math.sin(Math.PI/2-face),Math.cos(Math.PI/2-face)),cheat=o.noCheat?0:.42*Math.sin(dv)*cl((Math.PI-Math.abs(dv))/(Math.PI/2),0,1);
  parts.push({d:hDep,f:()=>{const Vh=Vat(face+A.hy+cheat,P(Hc),hDep);head(Vh,Rh,S,A,{blink:A.blink,squint:A.squint,shut:A.shut,mouth:A.mouth,moss:o.moss&&anim==='idle'||o.moss===2,inhale:A.inhale,exhale:A.exhale,eyeLight:o.eyeLight!==false});
    if(A.flash>0){ctx.save();ctx.globalAlpha=A.flash*.3;ball(P(Hc),Rh);ctx.fillStyle='#fff';ctx.fill();ctx.restore()}}});
  // the arrow flies off after the release, in front of the hero or behind him
  if(!o.noFx&&A.fly>=0&&A.fly<.5&&!isX){const k=A.fly/.5,a=add(sub(grip,mul(aim,BK+1)),mul(aim,k*44)),b=add(a,mul(aim,12));
    parts.push({d:D(add(a,mul(aim,6))),f:()=>{if(!LOWFX){const A2=P(a),B2=P(sub(a,mul(aim,10)));ctx.strokeStyle=`rgba(255,248,225,${.55*(1-k)})`;ctx.lineWidth=2;ctx.lineCap='round';seg(B2,A2);ctx.stroke()}arrow(V0,a,b,1-k*k)}})}
  run(parts);
  // dizzy stars when hit
  if(A.stars>0){const c0=P(add(Hc,[0,0,Rh+3.4]));for(let i=0;i<3;i++){const an=G.t*5+i*TAU/3;starS(c0[0]+Math.cos(an)*8,c0[1]+Math.sin(an)*2.6*KR(),1.9,A.stars)}}
  ctx.restore()}
// a line drawn on the tunic: fn(k) gives a surface point for k in 0..1 (or t round the body for closed lines); only where it faces us
function surfLine(V0,X,fn,col,w,open,dash,inked){const{P,F}=V0,N=open?14:44,runs=[];let cur=[];
  for(let i=0;i<=N;i++){const k=i/N,s=fn(open?k:k*TAU),v=F(X.Rd(s.n));if(v>.02)cur.push(P(X.T(s.p)));else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
  ctx.lineCap='round';ctx.lineJoin='round';if(dash)ctx.setLineDash(dash);
  for(const r of runs){if(r.length<2)continue;if(inked){ctx.strokeStyle=INK;ctx.lineWidth=w+1.8;line(r);ctx.stroke()}ctx.strokeStyle=col;ctx.lineWidth=w;line(r);ctx.stroke()}
  if(dash)ctx.setLineDash([])}
// the amulets on the chest (from the gear), hanging from a cord round the neck
function amulet(V0,X,id){const{P,F}=V0,s=surf(0,ZB+8.6,.6),n=X.Rd(s.n),v=F(n);if(v<=.08)return;const q=P(X.T(s.p)),t=G.t;ctx.save();ctx.globalAlpha=cl(v*4,0,1);
  for(const sd of[-1,1])surfLine(V0,X,k=>surf(sd*lerp(.55,.02,k),lerp(ZB+12.6,ZB+9.2,k),.3),'rgba(27,22,18,.75)',1,1);ink(1.2);
  if(id==='amuleto_osso'){ctx.fillStyle='#efe8d6';ctx.beginPath();ctx.moveTo(q[0]-2,q[1]-2.5);ctx.quadraticCurveTo(q[0]-2.4,q[1]+2,q[0],q[1]+4.5);ctx.quadraticCurveTo(q[0]+2.4,q[1]+2,q[0]+2,q[1]-2.5);ctx.closePath();ctx.fill();ctx.stroke()}
  else if(id==='amuleto_luna'){shine('170,190,255',q[0],q[1]+1,7,.35);ctx.fillStyle='#e6ecff';ctx.beginPath();ctx.arc(q[0],q[1]+1,3.2,.6,TAU-.6);ctx.arc(q[0]+1.8,q[1]+1,2.4,TAU-.9,.9,true);ctx.closePath();ctx.fill();ctx.stroke()}
  else if(id==='amuleto_lame'){ctx.fillStyle='#dfe4ea';ctx.beginPath();ctx.moveTo(q[0],q[1]-3);ctx.lineTo(q[0]+2.4,q[1]+1);ctx.lineTo(q[0],q[1]+5);ctx.lineTo(q[0]-2.4,q[1]+1);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(q[0]-.4,q[1]-1.5,.8,4)}
  else if(id==='cuore_drago'){const b=.5+.5*Math.sin(t*4);shine('255,60,50',q[0],q[1]+1,8+b*3,.35+b*.25);ctx.fillStyle='#ffd86b';ell(q[0],q[1]+1,3.6,4.2);ctx.fill();ctx.stroke();ctx.fillStyle=`rgb(${200+55*b|0},50,60)`;ell(q[0],q[1]+1,2.2,2.8);ctx.fill();ctx.fillStyle='#fff';ball([q[0]-.8,q[1]],.7);ctx.fill()}
  ctx.restore()}
// a ring on the bow hand, coloured like the item (ITEM[].tint of the game), glowing for the rare ones
const RINGS={anello_rame:['#c87533','#e8a060',0],anello_falco:['#c9cfd6','#4d97ff',2],anello_vento:['#c9cfd6','#7fe0f0',3],anello_gelo:['#ffd86b','#bfe9ff',4]};
function ringOn(V0,h3,id){const it=typeof ITEM!=='undefined'&&ITEM[id],r=it?[it.tint.a,it.tint.b,it.rar]:RINGS[id];if(!r)return;const q=V0.P(add(h3,[0,0,-1.6]));
  ink(1.1);ctx.fillStyle=r[0];ball([q[0]+1.2,q[1]+.6],1.7);ctx.fill();ctx.stroke();ctx.fillStyle=r[1];ball([q[0]+1.2,q[1]+.6],.8);ctx.fill();
  if(r[2]>=2)shine(id==='anello_gelo'?'160,220,255':id==='anello_vento'?'150,240,240':'120,170,255',q[0]+1.2,q[1]+.6,6,.32*(.5+.5*Math.sin(G.t*5)))}

return{arciere,pose,ARM,BOWS,HC}})();
