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
// Lo stesso corpo fa anche i nemici e i boss che nel gioco usano il rig dell'eroe (goblin, scheletro, negromante, scheletrino, piromante,
// nano bombarolo, Strega, Fabbro, Regina dei Ghiacci: sprite/nemici3d/umanoidi.js), con le opzioni di stile del gioco: skull e ribs
// (teschio e costole), ears (orecchie a punta), hoodTip (punta del cappuccio), crown (corna di rami con i boccioli), tiara (corona di
// ghiaccio), helm e beard (elmo e barba), robe e float (veste lunga, sospesi in aria), cracks (crepe di lava), shield (scudo), eyeCol
// (colore degli occhi), held 'scettro' / 'martello' / 'bomba' (bastone con la sfera, martello del Fabbro, bomba); armor 'none' (niente
// giubba), quiver false, belt null, blush false. Senza queste opzioni l'eroe resta identico al pixel.
// Anche gli altri tre eroi stanno su questo corpo, con i loro pezzi del gioco: ponytail e hair (la coda della Cacciatrice), helm (l'elmo
// del Balestriere), antlers (le corna di legno del Druida, con hoodTip e il suo bastone) e eyes (il colore degli occhi, verdi nel Druida).
window.EROE=(()=>{
const R=CR._rig,{cam,KR,TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,Vat,mix,stepper,shine,ball,seg,tri,hull,on,fist,wa,rim,glowTop,run,starS}=R;
// ------------------------------------------------------------------ colours (giubba di cuoio + arco di frassino, as in the game)
const HC={body:'#2fb3a6',hood:'#23877d',skin:'#f2c9a0',eye:'#1b1612',foot:'#4a3626',foot2:'#3a2a1d',belt:'#8a5a20',buckle:'#ffc93c',
  button:'#d9b27a',bow:'#a4703d',bowL:'#d9b27a',str:'#f6ead2',shaft:'#d9b27a',tip:'#c9cfd6',fl:'#e5484d',flW:'#f6ead2',
  quiver:'#7a5232',quiverT:'#5a3a22',band:'#c9a040',strap:'#4a321e',moss:'#4f8a34',mossL:'#8fd14f'};
const dk=(c,k)=>mix(c,'#0d1418',k),lt=(c,k)=>mix(c,'#ffffff',k);
// the armours of the game: colours of the tunic (a) and of the hood (b), as in ITEMS[].tint; the bows: colour and shape
const VESTITI={};// the outfits, filled in by sprite/eroe3d/vestiti3d.js
const ARM={giubba:['#2fb3a6','#23877d'],cotta:['#8a97a2','#5d6872'],mantello_ombra:['#5a4682','#3a2c58'],corazza_muschio:['#5f9e3c','#3f7a2a']};
const BOWS={arco_frassino:['#a4703d',null],arco_ricurvo:['#7a4a2a','recurve'],arco_tuono:['#2b3f6b','thunder'],arco_spine:['#4f8a34','thorn'],arco_fenice:['#d9442e','phoenix'],balestra:['#6b4a2a','xbow']};

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
// a smooth bump between a and b (0 outside, 1 in the middle, no corner at either end)
const win=(p,a,b)=>{if(p<=a||p>=b)return 0;const k=Math.sin((p-a)/(b-a)*Math.PI);return k*k};
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
// the long robe of the mages (style.robe): from the floor, wide at the hem, the same shoulders as the tunic. BP, BZ: the profile and its
// base for the body being drawn (the tunic from ZB, the robe from the floor)
const ROBE=[[0,14.6],[1.4,15.3],[3.6,14.8],[6.4,13.4],[9.2,11.7],[11.8,9.7],[14.4,7.4],[16.6,4.8],[18.4,2.8]];let BP=PROF,BZ=ZB;
function radAt(dz){const P=BP;if(dz<=P[0][0])return P[0][1];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];if(dz<=b[0])return lerp(a[1],b[1],(dz-a[0])/(b[0]-a[0]))}return P[P.length-1][1]}
// a point on the surface of the tunic (angle t round the body, 0 = in front, π/2 = the hero's right; height z above the ground),
// pushed out by `out`, and its normal
function surf(t,z,out){const dz=z-BZ,r=radAt(dz)+(out||0),sl=(radAt(dz+.5)-radAt(dz-.5));return{p:[Math.cos(t)*r*AX,Math.sin(t)*r,z],n:nrm([Math.cos(t)/AX,Math.sin(t),-sl])}}
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
  // close along the limb: the limb inside a cap smaller than half the ball is always the short way round (a bigger cap: the long way).
  // Deciding it from the screen angle of the cap's middle went the wrong way when only a sliver of the cap showed or hid, and for a
  // frame the whole head took the colour of the hood's lining
  const norm=a=>((a%TAU)+TAU)%TAU,ccw=norm(a0-a1),inC=al<Math.PI/2?ccw<=Math.PI:ccw>Math.PI;
  ctx.beginPath();for(const s of pts)ctx.lineTo(s[0],s[1]);if(inC)ctx.arc(q[0],q[1],Rr,a1,a1+ccw,false);else ctx.arc(q[0],q[1],Rr,a1,a1-(TAU-ccw),true);ctx.closePath();
  return{full:false,rim:pts}}

// where the face looks (a little up, so seen from the front the face sits in the middle of the hood as in the game) and its pieces
const FACE=[1,0,.27],EYE=[1,.33,.25],CHEEK=[1,.54,.04],MOUTH=[1,-.13,-.06];
// the hood and the face. Vh: the head's own camera (it turns with the look); A.hp: how much the head nods down; o: eyes, mouth, moss
function head(Vh,Rh,S,A,o){const h=Vh.P(0,0,0),{F}=Vh,hood=S.hood,skin=S.skin,nod=v=>rotY(v,A.hp),fd=nrm(nod(FACE));
  if(S.skull)return skullHead(Vh,Rh,S,A,o,h,nod);
  const mouthD=nrm(nod(MOUTH)),mossD=nrm(nod([.66,-.72,-.22]));
  // the moss stick, when the mouth turns away: drawn before the hood, so only the part sticking out past the cheek shows
  const mossBack=o.moss&&F(mouthD)<.05;if(mossBack)mossStick(Vh,h,Rh,mouthD,mossD,o,false);
  // the enemies' bits behind the head: the antlers, an ear on the far side, the back spikes of the tiara
  if(S.crown)antlers(Vh,h,Rh,S,nod);if(S.ears)for(const sd of[-1,1])if(F(nod([0,sd,0]))<=.3)ear(Vh,h,Rh,S,nod,sd);if(S.tiara)tiara(Vh,h,Rh,S,nod,false);
  if(S.antlers)deerAntlers(Vh,h,Rh,nod);const tailFront=S.ponytail&&F(nod([-1,0,-.2]))>.15;if(S.ponytail&&!tailFront)ponytail(Vh,h,Rh,S,nod,o.sway||0);
  // the hero's own look: what it needs, what goes behind the head (the feather, the band's tails, the hair's pieces, the far ear)
  const lk=S.look?lookPrep(Vh,Rh,S,o,h,nod):null;if(lk)lookBehind(Vh,Rh,S,o,h,nod,lk);
  // the new heroes' things round the head: the Bard's plume (unless the look puts a feather there), the Ninja's band (unless the look
  // puts one), the Alchemist's goggles; the Ninja's mask on the face. Behind the head the plume whose root is on the far side, the
  // band's knot and tails
  const LK=S.look,hat=lk&&lk.hat,Rw=lk&&lk.bare?lk.Rc:Rh,plume=S.plume&&!hat&&!(LK&&LK.acc==='piuma'),band=S.bandana&&!hat&&!(LK&&(LK.acc==='fascia'||LK.acc==='maschera')),sw=o.sway||0;
  if(S.mask)o.mask=S.mask;
  if(plume&&!featherFront(Vh,nod))featherHood(Vh,h,Rw,nod,sw,S.plume,1.25);if(band)headband(Vh,h,Rw,nod,S.bandana,sw,false);
  // the outfit's pieces on the hood (sprite/eroe3d/vestiti3d.js: behind it, on its cloth, in front of it), not on a bare head or under a hat
  const OH=S.of&&S.of.hoodFx&&!(lk&&lk.bare)?{Vh,h,Rh,nod,F,S,A,hood,sp,capPath}:null;if(OH)S.of.hoodFx(OH,'back');
  // without the hood: the bare head with its hair
  if(lk&&lk.bare)bareHead(Vh,Rh,S,A,o,h,nod,fd,lk);
  else{ink(2.5);ball(h,Rh);ctx.fillStyle=hood;ctx.fill();ctx.stroke();
  // soft shading of a ball lit from the upper left: the three tones blend into each other, no patches with an edge
  ctx.save();ball(h,Rh-.8);ctx.clip();ctx.fillStyle=soft(h[0]-Rh*.36,h[1]-Rh*.42,h[0]-Rh*.05,h[1]+Rh*.05,Rh*1.2,hood,.14,.3);ctx.fillRect(h[0]-Rh,h[1]-Rh,Rh*2,Rh*2);
  // the seam over the top of the hood, from the opening to the back
  {const pts=[];for(let i=0;i<=16;i++){const a=.9+i/16*2.1,m=nod([Math.cos(a),0,Math.sin(a)]);if(F(m)>-.02)pts.push(sp(Vh,h,Rh*.99,m));else if(pts.length)break}
    if(pts.length>1){ctx.strokeStyle=dk(hood,.22);ctx.lineWidth=1;ctx.lineCap='round';line(pts);ctx.stroke()}}
  if(OH)S.of.hoodFx(OH,'in');
  // the opening: a thin dark lining inside the hood, the face set in it
  const op=capPath(Vh,h,Rh,fd,.87);
  if(op){ctx.fillStyle=dk(hood,.55);ctx.fill();
    ctx.save();ctx.clip();const fc=capPath(Vh,h,Rh*.99,fd,.79);
    if(fc){const fq=sp(Vh,h,Rh,fd);ctx.fillStyle=soft(fq[0]-Rh*.28,fq[1]-Rh*.2,fq[0],fq[1],Rh*.95,skin,.12,.12);ctx.fill();if(lk){lk.fcRim=fc.rim;lk.fcFull=fc.full}
      // eyes, blush and mouth stay inside the skin: near the edge of the face they fade, never over the rim
      ctx.save();ctx.clip();{const g=ctx.createLinearGradient(0,fq[1]-Rh,0,fq[1]-Rh*.35);g.addColorStop(0,'rgba(60,30,14,.18)');g.addColorStop(1,'rgba(60,30,14,0)');ctx.fillStyle=g;ctx.fillRect(fq[0]-Rh,fq[1]-Rh,Rh*2,Rh)}
      face(Vh,h,Rh,nod,o,fd);ctx.restore()}
    ctx.restore();
    // the edge of the hood round the opening: a thick dark ring, as in the game
    if(op.rim&&op.rim.length>1){ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=2.5;line(op.rim);if(op.full)ctx.closePath();ctx.stroke()}}
  ctx.restore();rim(h,Rh,h,Rh,.3)}
  // and in front of it: the look's pieces, the helmet, the point of the hood, the beard, an ear on our side, the front spikes of the tiara
  if(tailFront)ponytail(Vh,h,Rh,S,nod,o.sway||0);
  if(lk)lookFront(Vh,Rh,S,o,h,nod,lk);
  if(band)headband(Vh,h,Rw,nod,S.bandana,sw,true);if(S.goggles&&!hat)goggles(Vh,h,Rw,nod);if(plume&&featherFront(Vh,nod))featherHood(Vh,h,Rw,nod,sw,S.plume,1.25);
  if(S.helm)helm(Vh,h,Rh,S,nod);if(S.hoodTip&&!(lk&&lk.bare))hoodTip(Vh,h,Rh,S,nod);if(S.beard)beard(Vh,h,Rh,S,nod);if(S.ears)for(const sd of[-1,1])if(F(nod([0,sd,0]))>.3)ear(Vh,h,Rh,S,nod,sd);if(S.tiara)tiara(Vh,h,Rh,S,nod,true);
  if(OH)S.of.hoodFx(OH,'front');
  if(hat)hatDraw(Vh,h,lk.Rc,nod,hat,LK.hatCol,sw);
  if(o.moss&&!mossBack)mossStick(Vh,h,Rh,mouthD,mossD,o,true)}
// two big dark eyes with a small, sharp point of light (o.eyeLight: false takes it away); they close for a blink, squeeze shut when hit;
// a faint blush, a little mouth when needed. No eye ever sits on the outline of the head: when the head turns, the far eye slides in
// toward the middle of the face (as the game draws it in three-quarter view) and gets narrower as it tucks in beside the near eye,
// until it is gone; it is never drawn see-through
const sstep=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t)};
function face(Vh,h,Rh,nod,o,fd){const{F}=Vh,fq=sp(Vh,h,Rh*.97,fd);
  const edge=o.bare?q=>1-sstep(.84,.97,Math.hypot(q[0]-h[0],q[1]-h[1])/Rh):q=>1-sstep(.7,.84,Math.hypot(q[0]-h[0],q[1]-h[1])/Rh);
  // a soft limit on how far from the middle of the head an eye may sit (a, b: where the limit starts and the most it reaches)
  const inward=(q,a,b)=>{const dx=q[0]-h[0],dy=q[1]-h[1],d=Math.hypot(dx,dy)/Rh;if(d<=a)return q;const d2=a+(b-a)*(1-Math.exp(-(d-a)/(b-a)));return[h[0]+dx*d2/d,h[1]+dy*d2/d]};
  const ry=2.3,E=[-1,1].map(sd=>{const e=nrm(nod([EYE[0],sd*EYE[1],EYE[2]])),v=F(e);return{sd,v,q:sp(Vh,h,Rh*.97,e),rx:1.95*Math.pow(Math.max(0,v),.7)}}).filter(e=>e.v>.08).sort((a,b)=>b.v-a.v);
  if(E.length){E[0].q=inward(E[0].q,.6,.74)}
  if(E.length>1){const n=E[0],f=E[1];f.q=inward(f.q,.5,.66);const gap=Math.hypot(f.q[0]-n.q[0],f.q[1]-n.q[1])-n.rx-.8;f.rx=Math.min(f.rx,Math.max(0,gap))}
  // the hero's own look (the making of the hero): a face of its own; without it, the face of always
  if(o.L){faceLook(Vh,h,Rh,nod,o,fq,E,ry,edge);if(o.mask)ninjaMask(Vh,h,Rh*.97,nod,o.mask);return}
  for(const{v,q,rx} of E){if(rx<.7)continue;
    ctx.save();
    if(o.shut){const dir=fq[0]>=q[0]?1:-1;ctx.strokeStyle=HC.eye;ctx.lineWidth=1.3;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
      ctx.moveTo(q[0]-dir*rx*.9,q[1]-1.5);ctx.lineTo(q[0]+dir*rx*.8,q[1]);ctx.lineTo(q[0]-dir*rx*.9,q[1]+1.5);ctx.stroke()}
    else{const sq=(o.blink==null?1:o.blink)*(1-.3*(o.squint||0)),sy=ry*Math.max(.12,sq);if(o.glow&&sq>.3)shine(o.glow,q[0],q[1],ry*2.3,.3*Math.min(1,v*2));ctx.fillStyle=o.eyeCol||HC.eye;ctx.beginPath();ctx.ellipse(q[0],q[1],rx,sy,0,0,TAU);ctx.fill();
      if(o.eyeLight!==false&&sq>.45&&rx>1.2){ctx.fillStyle='#fdf6e8';ball([q[0]-rx*.34,q[1]-sy*.46],.36);ctx.fill()}}
    ctx.restore()}
  if(o.blush!==false)for(const sd of[-1,1]){const c=nrm(nod([CHEEK[0],sd*CHEEK[1],CHEEK[2]])),v=F(c),k=sstep(.15,.35,v);if(k<=0)continue;const q=sp(Vh,h,Rh*.97,c),kk=k*edge(q);ctx.fillStyle=`rgba(255,120,110,${.2*kk})`;ell(q[0],q[1],1.7*Math.pow(v,.7),1);ctx.fill()}
  if(o.mouth>.05){const m=nrm(nod(MOUTH)),v=F(m);if(v>.05){const q=sp(Vh,h,Rh*.97,m),w=1.3*Math.max(.45,v),hh=.6+o.mouth*1.1;ink(1);ctx.fillStyle='#5a2020';ctx.beginPath();ctx.ellipse(q[0],q[1],w,hh,0,0,TAU);ctx.fill();ctx.stroke()}}
  if(o.mask)ninjaMask(Vh,h,Rh*.97,nod,o.mask)}

// ------------------------------------------------------------------ the hero's own look (S.look, from the making of the hero)
// Denis, 14 October: «nella creazione del pg si possa modificare a piacimento tra occhi cicatrici ecc.», then «migliora il design di
// tutto… aggiungi più cose… la grandezza delle cose tranne degli accessori… i capelli che coprono tutta la testa sotto il cappuccio anche
// dove non si vede… fai anche senza cappuccio». Everything sits on the ball of the head in 3D, so it turns with it and never slips off:
// a point of the face is fp(x, y) (x toward his right, y up, in the units of EYE and MOUTH), a direction of the head is hdir(a, e)
// (azimuth a: 0 in front, + toward his right; elevation e: 0 at the level of the ears). The Classic style: no blood, scars are healed
// pale lines. The sizes (eyeK, browK, mouthK, markK, hairK, beardK, earK) go from about .7 to 1.35, 1 as drawn here.
//   eyes   tondi (as always) | grandi | decisi | assonnati | felini | piccoli | ciglia | tristi | felici | spalancati | stellati;
//          iris: a colour (a coloured eye with a pupil) or none (dark)
//   brows  nessuna | sottili | folte | decise | alzate | spezzate | unite | arcuate | puntini | cespugliose (browCol)
//   mouth  nessuna | sorriso | sorrisone | ghigno | dentino | broncio | lingua | fischio | denti | sorpreso | neutra (lipCol: the lips
//          and the inside of an open mouth in a colour; else as always)
//   mark   nessuno | cicatrice | graffio | lentiggini | pittura | cerotto | runa | neo | croce | lacrima | stella | baffi | macchia
//          (markCol: the painted ones, the rune and the band-aid in a colour; scars, freckles and moles stay as they are)
//   hair   nascosti (short: all under the hood) | ciuffo | frangia | spettinati | lunghi | riccioli | caschetto | treccine | coda |
//          chignon | cresta | rasati | mossi (hairCol). A volume over the whole head: under the hood it frames the face, without the
//          hood it is all there
//   beard  nessuna | baffetti | baffoni | pizzetto | barbetta | barba | lunga | intrecciata (beardCol, else the colour of the hair)
//   ears   tonde (under the hood) | punta | lunghe (out of the hood) | gatto | orso | coniglio (on top: of the hood, or of the hair)
//   tattoo nessuno | tribale | fulmine | luna | puntini | artigli | spirale | onde | cuore (tatK, tatCol: the ink, else dark blue)
//   hood   su | senza (the bare head, no hood at all: Denis, 14 October, «se non si seleziona il cappuccio toglilo completamente») |
//          a hat on the bare head (hatCol, else its own): berretto | punta | paglia | cilindro | elmo | bandana | pompon |
//          giu (the bare head with the hood lowered on the shoulders, drawn with the body: kept, no longer offered)
//   acc    nessuno | benda | occhialetti | sciarpa | piuma | fascia | orecchino | fiore | maschera | collana | coroncina (accCol; accFix:
//          a colour picked by the player also for the patch, the frame of the glasses, the mask and the stones of the crown)
const LK_SCAR='#e3998a',LK_SCARL='#fbdccf';
const hdir=(a,e)=>{const c=Math.cos(e);return[c*Math.cos(a),c*Math.sin(a),Math.sin(e)]};
// ------------------------------------------------------------------ parts of the ball of the head (the hair, the beard, the mask)
// the region between the heights eLo(a) and eHi(a), for the azimuth a from a0 to a1, seen by the head's camera: a mesh of points, each
// one the offset on the screen from the centre of a ball of radius 1 (the ones behind brought to the outline, so the edge is exact) and
// how much it faces us. One mesh gives the path at any radius (the volume of the hair, its outline, the hair on the skin)
function regionMesh(Vh,nod,a0,a1,eLo,eHi,NA,NE){const{F}=Vh,w=[F(1,0,0),F(0,1,0),F(0,0,1)],o=Vh.P(0,0,0),nf=cam.zk*Math.hypot(1,cam.k/cam.zk),off=[],fac=[];
  for(let i=0;i<=NA;i++){const a=a0+(a1-a0)*i/NA,lo=eLo(a),hi=eHi(a),ro=[],rf=[];
    for(let j=0;j<=NE;j++){let n=nrm(nod(hdir(a,lo+(hi-lo)*j/NE)));const f=dot(n,w);if(f<0)n=nrm(sub(n,mul(w,f)));const pm=Vh.P(n);ro.push([pm[0]-o[0],(pm[1]-o[1])/nf]);rf.push(f)}
    off.push(ro);fac.push(rf)}
  return{NA,NE,off,fac,wrap:a1-a0>6.2}}
// its path at radius R round the screen point h: every quad with a corner facing us, all in one path (no seams). A run of such quads in
// a row is one strip (along its lower edge and back along the upper one): far fewer pieces to fill than one per quad. false: nothing shows
function meshPath(M,h,R){ctx.beginPath();let any=false;const{off,fac}=M,X=h[0],Y=h[1],NA=M.NA,vis=(i,j)=>fac[i][j]>0||fac[i+1][j]>0||fac[i+1][j+1]>0||fac[i][j+1]>0;
  for(let j=0;j<M.NE;j++){let i=0;while(i<NA){if(!vis(i,j)){i++;continue}let i1=i;while(i1+1<NA&&vis(i1+1,j))i1++;any=true;
    ctx.moveTo(X+off[i][j][0]*R,Y+off[i][j][1]*R);for(let k=i+1;k<=i1+1;k++)ctx.lineTo(X+off[k][j][0]*R,Y+off[k][j][1]*R);
    for(let k=i1+1;k>=i;k--)ctx.lineTo(X+off[k][j+1][0]*R,Y+off[k][j+1][1]*R);ctx.closePath();i=i1+1}}
  return any}
// an edge of the mesh (row j: 0 the lower one) where it faces us, as runs of screen points (one run across the seam at the back)
function meshEdge(M,h,R,j,minF){const runs=[];let cur=[];
  for(let i=0;i<=M.NA;i++){if(M.fac[i][j]>minF){const q=M.off[i][j];cur.push([h[0]+q[0]*R,h[1]+q[1]*R])}else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
  if(M.wrap&&runs.length>1&&M.fac[0][j]>minF&&M.fac[M.NA][j]>minF){const l=runs.pop();runs[0]=l.concat(runs[0].slice(1))}return runs}
// a ring of the head at the height e where it faces us (the shine of the hair)
function ringRuns(Vh,h,R,nod,e,minF){const runs=[];let cur=[],first=null;
  for(let i=0;i<=56;i++){const n=nrm(nod(hdir(-Math.PI+i/56*TAU,e)));if(Vh.F(n)>minF){cur.push(sp(Vh,h,R,n));if(i===0)first=true}else{if(cur.length)runs.push(cur);cur=[]}}
  if(cur.length){if(first&&runs.length){runs[0]=cur.concat(runs[0].slice(1))}else runs.push(cur)}return runs}
// how many quads: fewer when the head is small on the screen
function meshRes(R){const t=ctx.getTransform(),px=Math.hypot(t.a,t.b)*R;return px>70?[52,8]:px>34?[40,6]:px>16?[30,5]:[22,4]}
// ------------------------------------------------------------------ the hair
// each style: its hairline (the fringe f(a) for |a| < fa; down the temples to the bottom of the sideburns s at |a| = ta; up round the
// ear to `ear`, or covering the ears when ear is null; the nape n at the back), how far it stands off the head (v), and its pieces.
// The eyes are at about e .24, the brows .59, the top of the hood's opening 1.05, the chin -.55
const zig=x=>{const t=((x%1)+1)%1;return t<.5?t*4-1:3-t*4};
const HAIRS={
  nascosti:{v:.05,f:a=>.76+.016*Math.sin(a*15),fa:.4,s:.04,ta:.66,ear:.3,n:-.55},
  ciuffo:{v:.06,f:a=>.92-.38*sstep(-.55,.5,a),fa:.52,s:.04,ta:.7,ear:.3,n:-.55,lock:1},
  frangia:{v:.065,f:a=>.635+.014*Math.cos(a*38),fa:.47,s:0,ta:.66,ear:.3,n:-.55},
  spettinati:{v:.07,f:a=>.68+.06*zig(a*4.4+.25),fa:.45,s:-.02,ta:.68,ear:.28,n:-.58,spikes:1},
  lunghi:{v:.065,f:a=>.65+.24*Math.exp(-(a/.1)*(a/.1)),fa:.42,s:-.72,ta:.6,ear:null,n:-.95,locks:1},
  riccioli:{v:.1,f:a=>.71-.05*Math.abs(Math.sin(a*9)),fa:.45,s:-.06,ta:.66,ear:.24,n:-.58,curls:1},
  caschetto:{v:.12,f:a=>.625,fa:.49,s:-.4,ta:.63,ear:null,n:-.5},
  treccine:{v:.05,f:a=>.72+.02*Math.sin(a*12),fa:.43,s:.02,ta:.66,ear:.3,n:-.55,braids:1},
  coda:{v:.045,f:a=>.86,fa:.45,s:.1,ta:.72,ear:.34,n:-.4,tail:1,sw:.25},
  chignon:{v:.045,f:a=>.85,fa:.45,s:.1,ta:.72,ear:.34,n:-.4,bun:1,sw:.25},
  cresta:{v:0,f:a=>.86,fa:.45,s:.12,ta:.74,ear:.34,n:-.45,flat:1,fin:1},
  rasati:{v:0,f:a=>.8,fa:.45,s:.12,ta:.74,ear:.34,n:-.45,flat:1},
  mossi:{v:.12,f:a=>.66+.035*Math.sin(a*8),fa:.47,s:-.32,ta:.65,ear:null,n:-.52,waves:1}};
// the hairline of a style; K (the size) makes the long hair longer, the fringe stays where it is
function hairLine(H,K){const fa=H.fa,ta=H.ta,s=H.s-(H.s<-.1?(K-1)*.3:0),n=H.n-(K-1)*.14,ear=H.ear;
  return a=>{const x=Math.abs(a);if(x<=fa)return H.f(a);const f0=H.f(a<0?-fa:fa);
    if(x<=ta)return lerp(f0,s,sstep(fa,ta,x));
    if(ear==null)return lerp(s,n,sstep(ta,2.5,x));
    if(x<=1.36)return s;if(x<=1.62)return lerp(s,ear,sstep(1.36,1.62,x));if(x<=1.92)return ear;return lerp(ear,n,sstep(1.92,2.45,x))}}
// the hair's colours: lit from the upper left like the hood, a shade deeper
const hairGrad=(h,R,col)=>soft(h[0]-R*.4,h[1]-R*.52,h[0]-R*.04,h[1]+R*.06,R*1.32,col,.28,.44);
const STRANDS=[-2.6,-1.75,-1.12,-.58,-.14,.32,.8,1.34,1.95,2.7];
// the hair on a ball of radius R (mesh M): the colour, strands from the crown, the shine round the top, the hairline (inked when lw)
function hairPaint(Vh,h,R,nod,M,H,hl,col,g,lw){if(!meshPath(M,h,R))return;
  ctx.save();if(H.flat)ctx.globalAlpha*=.6;ctx.fillStyle=g;ctx.fill();ctx.restore();
  ctx.save();meshPath(M,h,R);ctx.clip();ctx.lineCap='round';ctx.lineJoin='round';
  if(H.flat){// stubble: a fine dark grain
    ctx.fillStyle=dk(col,.35);ctx.globalAlpha=.32;for(let i=0;i<40;i++){const a=-Math.PI+(i*2.399)%TAU,e=.2+((i*.618)%1)*1.25,n=nrm(nod(hdir(a,e)));if(Vh.F(n)<.1)continue;const q=sp(Vh,h,R,n);ctx.fillRect(q[0]-.22,q[1]-.22,.44,.44)}}
  else{// the strands, a little darker, from the crown down to the hairline (they lean the way the hair is combed)
    ctx.strokeStyle=dk(col,.42);ctx.globalAlpha=.34;ctx.lineWidth=.6;
    for(const a0 of STRANDS){const e1=hl(a0)+.08,e0=Math.min(1.08,e1+.62),pts=[];if(e0<=e1+.1)continue;for(let k=0;k<=7;k++){const n=nrm(nod(hdir(a0+(H.sw||0)*k/7+(H.waves?.07*Math.sin(k*1.1):0),lerp(e0,e1,k/7))));if(Vh.F(n)>.08)pts.push(sp(Vh,h,R,n));else if(pts.length)break}
      if(pts.length>1){line(pts);ctx.stroke()}}
    // a shade under the hair's edge, where it lies on the skin
    ctx.globalAlpha=1;ctx.strokeStyle=dk(col,.32);ctx.lineWidth=2.2;ctx.globalAlpha=.28;for(const r of meshEdge(M,h,R,0,.04)){if(r.length<2)continue;line(r.map(q=>[q[0],q[1]-1]));ctx.stroke()}
    // the shine: a soft band round the top of the head, brightest toward the light
    const sg=ctx.createLinearGradient(h[0]-R*.95,h[1]-R*.95,h[0]+R*.3,h[1]+R*.25);sg.addColorStop(0,'rgba(255,255,255,.62)');sg.addColorStop(.6,'rgba(255,255,255,.12)');sg.addColorStop(1,'rgba(255,255,255,0)');
    ctx.globalAlpha=1;ctx.strokeStyle=sg;for(const r of ringRuns(Vh,h,R,nod,1.0,.18)){if(r.length<2)continue;ctx.lineWidth=2.6;ctx.globalAlpha=.35;line(r);ctx.stroke();ctx.lineWidth=1;ctx.globalAlpha=.9;line(r);ctx.stroke()}}
  ctx.restore();
  if(lw){ctx.strokeStyle=INK;ctx.lineWidth=lw;ctx.lineCap='round';ctx.lineJoin='round';if(H.flat){ctx.save();ctx.globalAlpha*=.45}for(const r of meshEdge(M,h,R,0,.04)){if(r.length<2)continue;line(r);ctx.stroke()}if(H.flat)ctx.restore()}}
// a lock of hair (or a braid's strand, a tail) through 3D points of the head with their widths: one outline round it all, the hair's colours
function lock3(Vh,h,P3,W,col,g){const N=[],WW=[];for(let i=0;i<P3.length-1;i++)for(let k=0;k<3;k++){const t=k/3,a=P3[Math.max(0,i-1)],b=P3[i],c=P3[i+1],d=P3[Math.min(P3.length-1,i+2)];
    N.push([0,1,2].map(m=>.5*((2*b[m])+(-a[m]+c[m])*t+(2*a[m]-5*b[m]+4*c[m]-d[m])*t*t+(-a[m]+3*b[m]-3*c[m]+d[m])*t*t*t)));WW.push(lerp(W[i],W[i+1],t))}
  N.push(P3[P3.length-1]);WW.push(W[W.length-1]);const Q=N.map(v=>hP(Vh,h,v));g=pieceGrad(Q,col)||g;
  ctx.fillStyle=INK;for(let i=0;i<Q.length-1;i++){hull(Q[i],WW[i]+1.1,Q[i+1],WW[i+1]+1.1);ctx.fill()}
  ctx.fillStyle=g;for(let i=0;i<Q.length-1;i++){hull(Q[i],WW[i],Q[i+1],WW[i+1]);ctx.fill()}
  ctx.save();ctx.strokeStyle=dk(col,.42);ctx.globalAlpha*=.5;ctx.lineWidth=.6;ctx.lineCap='round';for(const s of[-.35,.3]){line(Q.map((q,i)=>[q[0]+WW[i]*s,q[1]]));ctx.stroke()}
  ctx.strokeStyle=lt(col,.4);ctx.globalAlpha=.55;ctx.lineWidth=.7;line(Q.slice(0,Math.ceil(Q.length*.6)).map((q,i)=>[q[0]-WW[i]*.45,q[1]-WW[i]*.2]));ctx.stroke();ctx.restore()}
// the colours of a piece hanging from the head: its own light from the upper left
function pieceGrad(Q,col){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of Q){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])}if(!(x1>x0))return null;
  const w=x1-x0+4,hh=y1-y0+4;return soft(x0-2+w*.3,y0-2+hh*.22,(x0+x1)/2,(y0+y1)/2,Math.max(w,hh)*.75,col,.24,.36)}
// a spike of hair from the head (b3) to its point (t3): two curved sides, inked, the base melting into the hair
function spike3(Vh,h,b3,t3,w,col,g){const B=hP(Vh,h,b3),T=hP(Vh,h,t3),dx=T[0]-B[0],dy=T[1]-B[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*w,ny=dx/l*w;
  const s1=[B[0]+dx*.5+nx*.55,B[1]+dy*.5+ny*.55],s2=[B[0]+dx*.5-nx*.45,B[1]+dy*.5-ny*.45];
  ctx.beginPath();ctx.moveTo(B[0]+nx,B[1]+ny);ctx.quadraticCurveTo(s1[0],s1[1],T[0],T[1]);ctx.quadraticCurveTo(s2[0],s2[1],B[0]-nx,B[1]-ny);ctx.fillStyle=g;ctx.fill();
  // the outline only from the middle to the point, so the spike grows out of the hair
  ctx.strokeStyle=INK;ctx.lineWidth=1.15;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();const m1=[(B[0]+nx+s1[0])/2,(B[1]+ny+s1[1])/2],m2=[(B[0]-nx+s2[0])/2,(B[1]-ny+s2[1])/2];
  ctx.moveTo(m1[0],m1[1]);ctx.quadraticCurveTo(s1[0],s1[1],T[0],T[1]);ctx.quadraticCurveTo(s2[0],s2[1],m2[0],m2[1]);ctx.stroke();
  ctx.strokeStyle=lt(col,.35);ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(B[0]+dx*.35,B[1]+dy*.35);ctx.lineTo(B[0]+dx*.72,B[1]+dy*.72);ctx.stroke()}
// a curl: a little ball of hair with its swirl and its light
function curl3(Vh,h,c3,r,col,g){const q=hP(Vh,h,c3);ink(1.1);ball(q,r);ctx.fillStyle=g;ctx.fill();ctx.stroke();
  ctx.strokeStyle=dk(col,.3);ctx.globalAlpha*=.55;ctx.lineWidth=.6;ctx.beginPath();ctx.arc(q[0]+r*.1,q[1]+r*.12,r*.52,.9,3.9);ctx.stroke();ctx.globalAlpha/=.55;ctx.fillStyle='rgba(255,255,255,.3)';ball([q[0]-r*.36,q[1]-r*.4],r*.3);ctx.fill()}
// a braid: a chain of crossing knots along the 3D points, a band and a tuft at its end
function braid3(Vh,h,P3,w,col,g,accC){const N=[];for(let i=0;i<P3.length-1;i++)for(let k=0;k<2;k++)N.push(lerp3(P3[i],P3[i+1],k/2));N.push(P3[P3.length-1]);const S=N.map(v=>hP(Vh,h,v));g=pieceGrad(S,col)||g;
  const knots=[];for(let i=0;i<S.length-1;i++){const a=S[i],b=S[i+1];knots.push({m:[(a[0]+b[0])/2,(a[1]+b[1])/2],an:Math.atan2(b[1]-a[1],b[0]-a[0])+(i%2?.55:-.55),L0:Math.hypot(b[0]-a[0],b[1]-a[1])*.68+w*.3,ww:w*.78*(1-.25*i/S.length)})}
  ctx.fillStyle=INK;for(const k of knots){ctx.beginPath();ctx.ellipse(k.m[0],k.m[1],k.L0+1.1,k.ww+1.1,k.an,0,TAU);ctx.fill()}
  for(const k of knots){ctx.beginPath();ctx.ellipse(k.m[0],k.m[1],k.L0,k.ww,k.an,0,TAU);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=dk(col,.45);ctx.lineWidth=.7;ctx.stroke();
    ctx.strokeStyle=lt(col,.4);ctx.lineWidth=.55;ctx.beginPath();ctx.ellipse(k.m[0]-.25,k.m[1]-.3,k.L0*.55,k.ww*.42,k.an,3.7,5.3);ctx.stroke()}
  const e=S[S.length-1],p=S[S.length-2],an=Math.atan2(e[1]-p[1],e[0]-p[0]);
  ctx.save();ctx.translate(e[0],e[1]);ctx.rotate(an);ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-w*.75);ctx.quadraticCurveTo(w*2.2,-w*.9,w*2.6,0);ctx.quadraticCurveTo(w*2.2,w*.9,0,w*.75);ctx.closePath();ctx.fill();ink(1);ctx.stroke();
  ctx.fillStyle=accC||'#d24b3e';ctx.fillRect(-w*.35,-w*.85,w*.7,w*1.7);ctx.strokeRect(-w*.35,-w*.85,w*.7,w*1.7);ctx.restore()}
// the pieces of a style that stand out of the head: behind it (front false) or in front of it. Under the hood (bare false) only what
// comes out of it: the long locks and the braids from the bottom of the opening, the tail at the back, the tuft of the crest
function hairPieces(Vh,h,R,nod,H,L,S,col,g,K,front,bare,sw){const{F}=Vh,fr=v=>F(nod(v))>.06;
  if(H.spikes&&bare){for(const[a,e,l,b] of[[-.62,1.0,3,-.9],[.0,1.22,3.4,.5],[.62,1.0,3,1],[1.45,.72,2.8,1.1],[-1.45,.72,2.8,-1.1],[2.25,.62,2.9,1.3],[-2.25,.62,2.9,-1.3],[2.75,1.0,3,.7],[-2.75,1.0,3,-.7],[3.14,.4,3,0]]){
    const d=nod(hdir(a,e)),t=nod([-Math.sin(a),Math.cos(a),0]);if(front||F(d)>.62)continue;spike3(Vh,h,mul(d,R*.9),add(mul(d,R+l*K),add(mul(t,b*K),[0,0,-.4*K])),2.3*K,col,g)}}
  if(H.curls&&bare){const C=[];for(const[e,n,o] of[[.25,7,0],[.72,7,.5],[1.18,4,.2]])for(let i=0;i<n;i++){const a=-Math.PI+(i+o)/n*TAU;if(e<.5&&Math.abs(a)<1.05)continue;C.push(nod(hdir(a,e)))}
    for(const a of[-.5,-.17,.17,.5])C.push(nod(hdir(a,HAIRS.riccioli.f(a)+.1)));
    C.sort((p,q)=>F(p)-F(q));if(!front)for(const d of C){if(F(d)>.3)continue;curl3(Vh,h,mul(d,R+.1*K),2.3*K,col,g)}
    else{ctx.save();ctx.strokeStyle=dk(col,.32);ctx.lineWidth=.7;ctx.lineCap='round';for(const d of C){const f=F(d);if(f<.35)continue;const q=hP(Vh,h,mul(d,R*.99)),r=1.5*K;ctx.globalAlpha=.55*cl((f-.35)*4,0,1);
      ctx.beginPath();ctx.arc(q[0],q[1],r,.4,3.6);ctx.stroke();ctx.beginPath();ctx.arc(q[0]+r*.15,q[1]+r*.1,r*.48,3.2,6);ctx.stroke()}ctx.restore()}}
  if(H.lock&&front&&bare){// the big lock: from the crown over to his right brow, its point curling out
    const P=[[-.55,1.28,.2],[-.2,1.05,.75],[.18,.84,.95],[.48,.62,.7],[.62,.47,.25]].map(([a,e,o])=>mul(nod(hdir(a,e)),R+o*K)),W=[2.4,2.5,2.2,1.5,.45].map(v=>v*K);
    if(F(nod(hdir(.1,.9)))>-.05)lock3(Vh,h,P,W,col,g)}
  if(H.locks){// long hair: a curtain down each side (from under the hood's opening when it is up) and the mass of it down the back
    const backV=F(nod([-1,0,-.1]))>.35,L0=9*K;
    if(!front)for(const sd of[-1,1]){const b0=bare?mul(nod(hdir(sd*1.05,-.05)),R*.88):mul(nod(hdir(sd*.72,-.42)),R*.9),P=[b0,add(b0,nod([.6,sd*.9,-L0*.42])),add(b0,nod([.9,sd*.8,-L0*.8])),add(b0,nod([.8,sd*.9+sw*.4,-L0*1.05]))];
      lock3(Vh,h,P,[3.4,3.1,2.4,.8].map(v=>v*Math.sqrt(K)),col,g)}
    if(bare&&backV===front){const b0=mul(nod(hdir(Math.PI,-.2)),R*.9),P=[b0,add(b0,nod([-1.4,sw*.3,-4.8*K])),add(b0,nod([-1.8,sw*.6,-8.4*K]))];lock3(Vh,h,P,[7.4,7,5.6].map(v=>v*Math.sqrt(K)),col,g)}}
  if(H.braids&&!front){for(const sd of[-1,1]){const d0=bare?nod(hdir(sd*1.25,-.25)):nod(hdir(sd*.74,-.44)),
    b0=mul(d0,R*.92),P=[b0,add(b0,nod([1.3,sd*.6,-3.8*K])),add(b0,nod([2,sd*.5+sw*.3,-7.6*K])),add(b0,nod([2.2,sd*.6+sw*.6,-10.2*K]))];braid3(Vh,h,P,2.3*Math.sqrt(K),col,g,L.accCol)}}
  if(H.tail&&!S.ponytail){const back=F(nod([-1,0,.2]))<=.15;if(back===!front){// the tail: from the back of the head (out of the hood) down behind the neck
      const tie=mul(nod(hdir(Math.PI,bare?.3:.05)),R*(bare?1:.95)),P=[tie,add(tie,nod([-2.6,sw*.5,-2.4])),add(tie,nod([-3.4,sw*1.2,-6.8*K])),add(tie,nod([-2.8,sw*2,-10.8*K]))];
      lock3(Vh,h,P,[2.9,3,2.4,.8].map(v=>v*Math.sqrt(K)),col,g);const q=hP(Vh,h,tie);ink(1.1);ctx.fillStyle=L.accCol||'#d24b3e';ball(q,1.6*Math.sqrt(K));ctx.fill();ctx.stroke()}}
  if(H.bun&&bare){const d=nod(hdir(Math.PI,.82)),c=mul(d,R+2.1*K),fF=F(d)>-.25;if(fF===front){const q=hP(Vh,h,c),r=3.4*K;
    {const s0=hP(Vh,h,add(c,nod([.3,-4.4*K,.9*K]))),s1=hP(Vh,h,add(c,nod([-.3,4.4*K,-.9*K])));ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.1;seg(s0,s1);ctx.stroke();ctx.strokeStyle='#c9a26a';ctx.lineWidth=1.1;ctx.stroke();ctx.fillStyle=L.accCol||'#d24b3e';ink(.8);ball(s0,.9);ctx.fill();ctx.stroke()}
    ink(2);ball(q,r);ctx.fillStyle=g;ctx.fill();ctx.stroke();
    ctx.strokeStyle=dk(col,.42);ctx.lineWidth=.7;ctx.beginPath();ctx.arc(q[0]+r*.1,q[1]+r*.05,r*.62,.6,4.9);ctx.stroke();ctx.fillStyle=lt(col,.4);ball([q[0]-r*.36,q[1]-r*.4],r*.24);ctx.fill();
    void 0}}
  if(H.fin&&bare&&front)crest3(Vh,h,R,nod,col,K)}
// the crest: a fin of hair standing over the middle of the head from the forehead to the nape, its top in points; two faces, the one
// turned to us lit, the other in the shade, one outline
function crest3(Vh,h,R,nod,col,K){const lat=nod([0,1,0]),wd=1.9*K,N=16,top=[],bl=[],br=[];
  for(let i=0;i<=N;i++){const t=.7+i/N*1.78,d=nod([Math.cos(t),0,Math.sin(t)]),tt=nod([-Math.sin(t),0,Math.cos(t)]),hh=(2+2.6*Math.sin((t-.6)/1.95*Math.PI))*K*(i%2?.7:1),b=mul(d,R*.97);
    top.push(hP(Vh,h,add(mul(d,R+hh),mul(tt,-.7*K))));bl.push(hP(Vh,h,add(b,mul(lat,wd))));br.push(hP(Vh,h,add(b,mul(lat,-wd))))}
  const fl=Vh.F(lat),face=(B,lit)=>{ctx.beginPath();for(const q of B)ctx.lineTo(q[0],q[1]);for(let i=top.length-1;i>=0;i--)ctx.lineTo(top[i][0],top[i][1]);ctx.closePath();
    const Q=B.concat(top),gg=pieceGrad(Q,lit?col:hexMix(col,'#0d1418',.28));ctx.fillStyle=gg;ctx.fill();ink(1.25);ctx.stroke()};
  if(fl>=0){face(br,false);face(bl,true)}else{face(bl,false);face(br,true)}
  ctx.strokeStyle=lt(col,.35);ctx.lineWidth=.6;ctx.lineCap='round';line(top.map((q,i)=>[lerp(q[0],(fl>=0?bl:br)[i][0],.35),lerp(q[1],(fl>=0?bl:br)[i][1],.35)]).filter((q,i)=>i%2===0));ctx.stroke()}
// ------------------------------------------------------------------ the beard
// the part on the face (below the line: the height e over the azimuth), the moustache, the part that hangs under the chin
// (seen from the camera, high above, the chin is short: the mouth is at e -.13, the bottom of the hood's opening at -.53)
const BEARDS={baffetti:{must:1},baffoni:{must:2},pizzetto:{line:a=>-.21-1.3*sstep(.2,.32,Math.abs(a)),hang:.5,narrow:1},
  barbetta:{line:a=>-.21+.37*sstep(.5,1.25,Math.abs(a))},barba:{line:a=>-.07+.24*sstep(.3,1.05,Math.abs(a)),must:1,hang:1},
  lunga:{line:a=>-.07+.24*sstep(.3,1.05,Math.abs(a)),must:1,hang:2.1},intrecciata:{line:a=>-.08+.24*sstep(.3,1.05,Math.abs(a)),must:1,hang:1.9,braid:1}};
// the moustache: two tufts over the mouth, in the face's units
function moustache(kind,fp,seen,col,K){const al=seen(0,-.06);if(al<=.02)return;ctx.save();ctx.globalAlpha*=al;ctx.lineJoin='round';
  for(const sd of[-1,1]){const P=(kind===2?[[.02,-.02],[.2,.03],[.4,-.01],[.56,.07],[.58,.12],[.5,.1],[.42,-.08],[.2,-.08],[.04,-.06]]:[[.02,-.025],[.17,.0],[.31,-.05],[.27,-.085],[.14,-.075],[.03,-.06]])
      .map(([x,y])=>fp(sd*x*K,-.04+(y+.04)*K));
    poly(P);const g=ctx.createLinearGradient(0,P[1][1]-1,0,P[P.length-2][1]+1);g.addColorStop(0,lt(col,.25));g.addColorStop(1,dk(col,.18));ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=dk(col,.62);ctx.lineWidth=.8;ctx.stroke()}
  ctx.restore()}
// what hangs under the chin: a soft tuft (a long one for the long beard, a braid at the end of the braided one), only seen from the front
function beardHang(Vh,h,R,nod,B,col,K,sw,accC){const{F}=Vh,f=F(nod([1,0,-.25]));if(f<-.12)return;const ex=B.hang*K,nar=B.narrow?.42:1;
  // a teardrop from the chin down: widest under the jaw, a soft point at the end that swings a little
  const Wt=R*.6*nar,N=9,pts=[],mid=[];for(let i=0;i<=8;i++){const a=(-1+i/4)*.6*nar;pts.push(hP(Vh,h,mul(nod(hdir(a,-.42)),R*.99)))}
  for(let i=0;i<=N;i++){const u=i/N,z=lerp(-R*.52,-R*(.6+ex*.66),u),x=R*.88+ex*.95*u,w=Wt*Math.pow(Math.max(0,1-Math.pow(u,1.7)),.65),s=sw*.35*u*u;
    pts.push(hP(Vh,h,nod([x,w+s,z])),hP(Vh,h,nod([x,-w+s,z])));mid.push(hP(Vh,h,nod([x+.3,s,z])))}
  const ring=new Set(pts.slice(0,9)),Hh=chull(pts),bb=[1e9,1e9,-1e9,-1e9];for(const q of Hh){bb[0]=Math.min(bb[0],q[0]);bb[1]=Math.min(bb[1],q[1]);bb[2]=Math.max(bb[2],q[0]);bb[3]=Math.max(bb[3],q[1])}
  ctx.save();ctx.globalAlpha*=cl((f+.12)*5,0,1);poly(Hh);ctx.fillStyle=soft(bb[0]+(bb[2]-bb[0])*.32,bb[1]+(bb[3]-bb[1])*.18,bb[0]+(bb[2]-bb[0])*.5,bb[1]+(bb[3]-bb[1])*.5,Math.max(bb[2]-bb[0],bb[3]-bb[1])*.8,col,.26,.3);ctx.fill();
  // the outline round its sides and its point, not along the top, where it grows out of the beard on the face
  ink(1.9);ctx.beginPath();for(let i=0;i<Hh.length;i++){const a=Hh[i],b=Hh[(i+1)%Hh.length];if(ring.has(a)&&ring.has(b))continue;ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}ctx.stroke();
  if(f>.15){ctx.save();poly(Hh);ctx.clip();ctx.lineCap='round';ctx.strokeStyle=hexMix(col,'#1b1210',.38);ctx.globalAlpha*=.55;ctx.lineWidth=.7;
    for(const s of[-.42,0,.42]){line(mid.map((q,i)=>{const u=i/N,w=Wt*Math.pow(Math.max(0,1-Math.pow(u,1.7)),.65)*s,qq=hP(Vh,h,nod([R*.88+ex*.95*u,w+sw*.35*u*u,lerp(-R*.52,-R*(.6+ex*.66),u)]));return qq}).slice(1,N-1));ctx.stroke()}
    ctx.strokeStyle=lt(col,.4);ctx.globalAlpha=.6;ctx.lineWidth=.8;line(mid.slice(1,Math.ceil(N*.6)).map(q=>[q[0]-(bb[2]-bb[0])*.16,q[1]]));ctx.stroke();ctx.restore()}
  if(B.braid){const u=1,tip=nod([R*.88+ex*.95*u,sw*.35,-R*(.6+ex*.66)]);braid3(Vh,h,[add(tip,nod([0,0,1.2])),add(tip,nod([.3,sw*.2,-1.6*K])),add(tip,nod([.5,sw*.4,-3.4*K]))],1.5,col,null,accC)}
  ctx.restore()}
const hexMix=(a,b,k)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),f=s=>Math.round(((A>>s)&255)*(1-k)+((B>>s)&255)*k);return'#'+((1<<24)|(f(16)<<16)|(f(8)<<8)|f(0)).toString(16).slice(1)};
// ------------------------------------------------------------------ the ears
// at the sides (round ones only without the hood; pointed ones come out of the hood), on the side we see (front) or the far one
function sideEar(Vh,h,R,nod,kind,sd,K,skin,col){const a=sd*(Math.PI/2+.1),b=nod(hdir(a,.06)),out=nod([0,sd,0]),up=nod([0,0,1]),fw=nod([1,0,0]);
  if(kind==='tonde'){const tw=nrm(sub(mul(fw,Math.cos(EARB)),mul(out,Math.sin(EARB)))),nn=nrm(add(mul(out,Math.cos(EARB)),mul(fw,Math.sin(EARB)))),c=add(mul(b,R*.97),mul(out,1.1*K)),pts=[];
    for(let i=0;i<20;i++){const t=i/20*TAU;pts.push(hP(Vh,h,add(c,add(mul(tw,Math.cos(t)*1.9*K),add(mul(up,Math.sin(t)*2.6*K),mul(nn,Math.max(0,Math.cos(t))*.5*K))))))}
    const H=chull(pts);if(H.length<3)return;const bb=[1e9,1e9,-1e9,-1e9];for(const q of H){bb[0]=Math.min(bb[0],q[0]);bb[1]=Math.min(bb[1],q[1]);bb[2]=Math.max(bb[2],q[0]);bb[3]=Math.max(bb[3],q[1])}
    ink(1.5);poly(H);ctx.fillStyle=soft(bb[0]+(bb[2]-bb[0])*.3,bb[1]+(bb[3]-bb[1])*.25,(bb[0]+bb[2])/2,(bb[1]+bb[3])/2,Math.max(bb[2]-bb[0],bb[3]-bb[1])*.75,skin,.12,.22);ctx.fill();ctx.stroke();
    if(Vh.F(nn)>.15){const q0=hP(Vh,h,add(c,add(mul(up,1.3*K),mul(tw,.3*K)))),q1=hP(Vh,h,add(c,mul(tw,-.7*K))),q2=hP(Vh,h,add(c,add(mul(up,-1.2*K),mul(tw,.2*K))));
      ctx.strokeStyle='rgba(120,60,40,.55)';ctx.lineWidth=.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q0[0],q0[1]);ctx.quadraticCurveTo(q1[0],q1[1],q2[0],q2[1]);ctx.stroke()}
    return}
  const lg=kind==='lunghe',L0=(lg?9.2:6.4)*K,UP=(lg?5:3.2)*K,base=mul(b,R*.95),tip=add(base,add(add(mul(out,L0),mul(up,UP)),mul(fw,-(lg?2.6:1.5)*K))),
    b1=add(base,add(mul(up,3*K),mul(fw,1.1*K))),b2=add(base,add(mul(up,-2.5*K),mul(fw,-.7*K))),m1=add(lerp3(b1,tip,.5),mul(up,1.5*K)),m2=add(lerp3(b2,tip,.55),mul(up,-.2*K));
  const B1=hP(Vh,h,b1),B2=hP(Vh,h,b2),T=hP(Vh,h,tip),M1=hP(Vh,h,m1),M2=hP(Vh,h,m2);
  const path=()=>{ctx.beginPath();ctx.moveTo(B1[0],B1[1]);ctx.quadraticCurveTo(M1[0],M1[1],T[0],T[1]);ctx.quadraticCurveTo(M2[0],M2[1],B2[0],B2[1]);ctx.closePath()};
  const bb=[Math.min(B1[0],B2[0],T[0]),Math.min(B1[1],B2[1],T[1]),Math.max(B1[0],B2[0],T[0]),Math.max(B1[1],B2[1],T[1])];
  ink(1.4);path();ctx.fillStyle=soft(bb[0]+(bb[2]-bb[0])*.3,bb[1]+(bb[3]-bb[1])*.25,(bb[0]+bb[2])/2,(bb[1]+bb[3])/2,Math.max(bb[2]-bb[0],bb[3]-bb[1])*.8,skin,.14,.24);ctx.fill();ctx.stroke();
  ctx.save();path();ctx.clip();const i0=hP(Vh,h,lerp3(b1,b2,.35)),i1=hP(Vh,h,lerp3(base,tip,.72)),i2=hP(Vh,h,lerp3(b1,b2,.8));ctx.fillStyle='rgba(150,70,60,.26)';ctx.beginPath();ctx.moveTo(i0[0],i0[1]);ctx.lineTo(i1[0],i1[1]);ctx.lineTo(i2[0],i2[1]);ctx.closePath();ctx.fill();ctx.restore();void col}
// on top: a cat's, a bear's or a rabbit's (of the hood's cloth when it is up, of the hair when it is down), both drawn after the head
function topEar(Vh,h,R,nod,kind,sd,K,col,inner){const a=sd*(kind==='coniglio'?.34:1.0),e=kind==='coniglio'?1.12:1.2,d=nrm(nod(hdir(a,e))),up=nod([0,0,1]),fw=nod([1,0,0]),side=nod([0,sd,0]);
  const base=mul(d,R*.96);
  if(kind==='orso'){const c=add(base,add(mul(d,1.8*K),mul(up,.5*K))),q=hP(Vh,h,c),r=2.6*K,fF=Vh.F(fw);
    ink(1.6);ball(q,r);ctx.fillStyle=soft(q[0]-r*.4,q[1]-r*.45,q[0],q[1],r*1.3,col,.16,.3);ctx.fill();ctx.stroke();
    if(fF>-.2){const qi=hP(Vh,h,add(c,mul(fw,.5)));ctx.fillStyle=inner;ball([qi[0],qi[1]+r*.1],r*.52*cl(fF+.6,.3,1));ctx.fill()}return}
  const rab=kind==='coniglio',L0=(rab?9.5:5.6)*K,wb=(rab?2.3:3.1)*K,tip=add(base,add(mul(d,L0*.7),add(mul(up,L0*.55),mul(fw,(rab?-1.6:-.5)*K)))),
    l1=add(base,mul(side,-wb)),l2=add(base,mul(side,wb));
  const B1=hP(Vh,h,l1),B2=hP(Vh,h,l2),T=hP(Vh,h,tip),C1=hP(Vh,h,add(lerp3(l1,tip,.55),mul(side,-wb*(rab?.55:.2)))),C2=hP(Vh,h,add(lerp3(l2,tip,.55),mul(side,wb*(rab?.55:.2))));
  const path=k=>{const m=[(B1[0]+B2[0])/2,(B1[1]+B2[1])/2],s=(q)=>[m[0]+(q[0]-m[0])*k,m[1]+(q[1]-m[1])*k],b1=s(B1),b2=s(B2),t=s(T),c1=s(C1),c2=s(C2);
    ctx.beginPath();ctx.moveTo(b1[0],b1[1]);ctx.quadraticCurveTo(c1[0],c1[1],t[0],t[1]);ctx.quadraticCurveTo(c2[0],c2[1],b2[0],b2[1]);ctx.closePath()};
  const bb=[Math.min(B1[0],B2[0],T[0]),Math.min(B1[1],B2[1],T[1]),Math.max(B1[0],B2[0],T[0]),Math.max(B1[1],B2[1],T[1])];
  ink(1.6);path(1);ctx.fillStyle=soft(bb[0]+(bb[2]-bb[0])*.3,bb[1]+(bb[3]-bb[1])*.2,(bb[0]+bb[2])/2,(bb[1]+bb[3])/2,Math.max(bb[2]-bb[0],bb[3]-bb[1])*.8,col,.18,.3);ctx.fill();ctx.stroke();
  if(Vh.F(fw)>-.25){path(.55);ctx.fillStyle=inner;ctx.fill()}}
function earsDraw(Vh,h,R,nod,L,S,bare,front){const kind=L.ears||'tonde',K=L.earK||1;if(kind==='tonde'&&!bare)return;
  if(kind==='gatto'||kind==='orso'||kind==='coniglio'){if(!front)return;const col=bare?(L.hairCol||'#8a5a32'):S.hood,inner=kind==='orso'?(bare?dk(col,.3):dk(S.hood,.35)):'#f6b7c8';
    for(const sd of[-1,1].sort((p,q)=>Vh.F(nod([0,p,0]))-Vh.F(nod([0,q,0]))))topEar(Vh,h,R,nod,kind,sd,K,col,inner);return}
  for(const sd of[-1,1]){const out=nod([0,sd,0]),tw=kind==='tonde'||bare,n=tw?add(mul(out,Math.cos(EARB)),mul(nod([1,0,0]),Math.sin(EARB))):out;if((Vh.F(n)>(tw?.05:.1))!==front)continue;sideEar(Vh,h,R,nod,kind,sd,K,S.skin,L.hairCol)}}
const EARB=.62;
// ------------------------------------------------------------------ the face
// the hair, the beard and the mask on the face are drawn by the head (o.hairFn, o.beardFn, o.maskFn, o.mustFn), in their place between
// the marks and the eyes
function faceLook(Vh,h,Rh,nod,o,fq,E,ry,edge){const{F}=Vh,L=o.L,w=[F(1,0,0),F(0,1,0),F(0,0,1)],eyes=L.eyes||'tondi',mark=L.mark||'nessuno',acc=L.acc||'nessuno';
  // a point of the face (x to his right, y up, in the units of EYE and MOUTH) on the ball; one behind it goes to the outline
  const fp=(x,y,r)=>{let n=nrm(nod([1,x,y]));const f=dot(n,w);if(f<0)n=nrm(sub(n,mul(w,f)));return sp(Vh,h,Rh*(r||.97),n)},fv=(x,y)=>F(nrm(nod([1,x,y])));
  const seen=(x,y)=>{const q=fp(x,y);return sstep(.12,.32,fv(x,y))*edge(q)};
  const kE=L.eyeK||1,kB=L.browK||1,kM=L.mouthK||1,kS=L.markK||1;
  // under the eyes: the marks painted or grown on the skin, then the hair, the beard on the cheeks, the mask
  if(mark!=='nessuno'&&mark!=='cerotto')faceMark(mark,fp,seen,kS,L.markCol);
  if(L.tattoo&&L.tattoo!=='nessuno')faceTattoo(L.tattoo,fp,seen,L.tatK||1,L.tatCol);
  if(o.hairFn)o.hairFn();if(o.beardFn)o.beardFn();if(o.maskFn)o.maskFn();
  // the eyes (the one under the patch is not there)
  const sq=(o.blink==null?1:o.blink)*(1-.3*(o.squint||0));
  for(const e of E){if(e.rx<.7||(acc==='benda'&&e.sd<0))continue;const{v,q,rx}=e;ctx.save();
    if(o.shut){const dir=fq[0]>=q[0]?1:-1;ctx.strokeStyle=HC.eye;ctx.lineWidth=1.3;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
      ctx.moveTo(q[0]-dir*rx*.9,q[1]-1.5);ctx.lineTo(q[0]+dir*rx*.8,q[1]);ctx.lineTo(q[0]-dir*rx*.9,q[1]+1.5);ctx.stroke()}
    else eyeLook(eyes,L.iris,q,rx,ry,sq,v,o,fq,kE);
    ctx.restore()}
  // the brows (the joined ones also over the middle)
  const bw=L.brows||'nessuna';if(bw!=='nessuna'){const Bs=[];for(const e of E){if(e.rx<.7)continue;const b=browLook(bw,e,ry,fq,L.browCol||'#3e2616',edge(e.q)*cl((e.v-.08)*5,0,1),eyes,o.shut,kB,kE);if(b)Bs.push(b)}
    if(bw==='unite'&&Bs.length===2){const[a,b]=Bs,m=[(a.i[0]+b.i[0])/2,(a.i[1]+b.i[1])/2+.35*kB];ctx.save();ctx.globalAlpha*=Math.min(a.al,b.al);ctx.strokeStyle=L.browCol||'#3e2616';ctx.lineCap='round';ctx.lineWidth=1.1*kB;
      ctx.beginPath();ctx.moveTo(a.i[0],a.i[1]);ctx.quadraticCurveTo(m[0],m[1],b.i[0],b.i[1]);ctx.stroke();ctx.restore()}}
  // the blush, the mouth (open when he is hit, else the look's), the moustache over it
  if(o.blush!==false)for(const sd of[-1,1]){const c=nrm(nod([CHEEK[0],sd*CHEEK[1],CHEEK[2]])),v=F(c),k=sstep(.15,.35,v);if(k<=0)continue;const q=sp(Vh,h,Rh*.97,c),kk=k*edge(q);ctx.fillStyle=`rgba(255,120,110,${.2*kk})`;ell(q[0],q[1],1.7*Math.pow(v,.7),1);ctx.fill()}
  if(o.mouth>.05){const m=nrm(nod(MOUTH)),v=F(m);if(v>.05){const q=sp(Vh,h,Rh*.97,m),ww=1.3*Math.max(.45,v),hh=.6+o.mouth*1.1;ink(1);ctx.fillStyle='#5a2020';ctx.beginPath();ctx.ellipse(q[0],q[1],ww,hh,0,0,TAU);ctx.fill();ctx.stroke()}}
  else if(L.mouth&&L.mouth!=='nessuna')mouthLook(L.mouth,fp,seen,kM,L.lipCol);
  if(o.mustFn)o.mustFn(fp,seen);
  // over everything: the band-aid, the eyepatch, the glasses
  if(mark==='cerotto')bandAid(fp,seen,kS,L.markCol);
  if(acc==='benda')eyePatch(E,ry,fq,fp,seen,L.accFix);
  if(acc==='occhialetti')glasses(E,ry,fq,eyes,edge,kE,L.accFix)}
// one eye of a shape, with its colour (iris: a coloured eye with a dark pupil) or dark as always; the lids of the narrowed shapes; kE: size
function eyeLook(kind,iris,q,rx,ry,sq,v,o,fq,kE){kE=kE||1;const dir=fq[0]>=q[0]?1:-1,x=q[0],y=q[1],big=kind==='grandi'||kind==='stellati',small=kind==='piccoli',fel=kind==='felini',wide=kind==='spalancati',col=o.eyeCol||null;
  if(kind==='felici'){// happy: closed into two little arches
    const ex=rx*1.02*kE,ey=ry*.6*kE;ctx.strokeStyle=col||HC.eye;ctx.lineWidth=1.45*Math.sqrt(kE);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-ex,y+ey*.4);ctx.quadraticCurveTo(x,y-ey*1.6,x+ex,y+ey*.4);ctx.stroke();return}
  const ex=rx*(big?1.14:small?.62:fel?1.04:wide?1.12:1)*kE,ey=ry*(big?1.18:small?.64:fel?.9:wide?1.18:1)*kE*Math.max(.12,sq);
  const path=()=>{ctx.beginPath();if(fel){const t=ey*.32;ctx.moveTo(x-dir*ex*1.12,y-t);ctx.quadraticCurveTo(x+dir*ex*.1,y-ey*1.32,x+dir*ex*1.06,y+t*.3);ctx.quadraticCurveTo(x,y+ey*1.1,x-dir*ex*1.12,y-t);ctx.closePath()}else ctx.ellipse(x,y,ex,ey,0,0,TAU)};
  // the cut of the lid: lower toward the nose (decisi), lower toward the outside (tristi), half closed (assonnati)
  const lid=kind==='decisi'?[y-ey*.8,y-ey*.02]:kind==='tristi'?[y-ey*.04,y-ey*.78]:kind==='assonnati'?[y-ey*.12,y-ey*.12]:null,lidY=t=>lid[0]+(lid[1]-lid[0])*(t+1.6)/3.2;
  if(lid){ctx.beginPath();ctx.moveTo(x-dir*ex*1.6,lid[0]);ctx.lineTo(x+dir*ex*1.6,lid[1]);ctx.lineTo(x+dir*ex*1.6,y+ey*2+2);ctx.lineTo(x-dir*ex*1.6,y+ey*2+2);ctx.closePath();ctx.clip()}
  if(o.glow&&sq>.3)shine(o.glow,x,y,ry*2.3,.3*Math.min(1,v*2));
  path();
  if(wide&&ey>.8){// wide open: the white, a small pupil in it
    ctx.fillStyle='#fffaf0';ctx.fill();const pr=Math.min(ex,ey)*.5;ctx.save();path();ctx.clip();ctx.fillStyle=col||iris||HC.eye;ball([x+dir*ex*.1,y+ey*.06],pr);ctx.fill();
    if(iris&&!col){ctx.fillStyle='#140e0b';ball([x+dir*ex*.1,y+ey*.06],pr*.5);ctx.fill()}ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=.95;path();ctx.stroke()}
  else if(iris&&!col&&ey>.8){const g=ctx.createLinearGradient(0,y-ey,0,y+ey);g.addColorStop(0,dk(iris,.6));g.addColorStop(.5,iris);g.addColorStop(1,lt(iris,.32));ctx.fillStyle=g;ctx.fill();
    ctx.save();path();ctx.clip();ctx.strokeStyle=dk(iris,.5);ctx.lineWidth=Math.max(.4,ex*.16);ctx.stroke();
    ctx.fillStyle='#140e0b';ctx.beginPath();if(fel)ctx.ellipse(x,y,Math.max(.32,ex*.24),ey*.9,0,0,TAU);else ctx.ellipse(x+dir*ex*.05,y+ey*.06,ex*.5,ey*.54,0,0,TAU);ctx.fill();ctx.restore();
    ctx.strokeStyle='rgba(27,22,18,.9)';ctx.lineWidth=.75;path();ctx.stroke()}
  else{ctx.fillStyle=col||HC.eye;ctx.fill()}
  // the lights: the round one (a star for the starry eyes), a second small one in the big and the coloured eyes
  if(o.eyeLight!==false&&sq>.45&&rx>1.2){ctx.fillStyle='#fdf6e8';const hq=[x-ex*.34,y-ey*.46];
    if(kind==='stellati'){const s=.95*kE;ctx.beginPath();for(let i=0;i<8;i++){const r=i%2?s*.32:s,a=i/8*TAU-Math.PI/2;ctx.lineTo(hq[0]+Math.cos(a)*r,hq[1]+Math.sin(a)*r)}ctx.closePath();ctx.fill()}
    else{ball(hq,(small?.24:big?.55:.36)*Math.sqrt(kE));ctx.fill()}
    if(big||(iris&&!wide)){ball([x+ex*.34,y+ey*.36],.24*Math.sqrt(kE));ctx.fill()}}
  // the lid's line along the cut; the lashes
  if(lid&&ey>.7){ctx.strokeStyle=INK;ctx.lineWidth=.95;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-dir*ex*1.12,lidY(-1.12));ctx.lineTo(x+dir*ex*1.02,lidY(1.02));ctx.stroke()}
  if(kind==='ciglia'&&ey>.8){ctx.strokeStyle=INK;ctx.lineWidth=.55*Math.sqrt(kE);ctx.lineCap='round';for(let k=0;k<3;k++){const an=-Math.PI/2-dir*(.7+.36*k),px=x+Math.cos(an)*ex,py=y+Math.sin(an)*ey,l=(1.05-.18*k)*kE;
    ctx.beginPath();ctx.moveTo(px,py);ctx.quadraticCurveTo(px+Math.cos(an)*l*.6,py+Math.sin(an)*l*.6-.15,px+Math.cos(an)*l-dir*.35,py+Math.sin(an)*l-.45);ctx.stroke()}}}
// a brow over its eye, a little thicker in the middle (it narrows with the eye when the head turns); the far brow follows the far eye in.
// Gives back where its inner end is (the joined brows meet over the middle)
function browLook(kind,e,ry,fq,col,al,eyes,shut,kB,kE){if(al<=.02)return null;kB=kB||1;kE=kE||1;const{q,rx}=e,dir=fq[0]>=q[0]?1:-1,w=Math.max(.7,rx*1.15)*(.84+.16*kB),x=q[0],
    y=q[1]-ry*kE*(eyes==='grandi'||eyes==='stellati'||eyes==='spalancati'?1.78:eyes==='piccoli'?1.3:1.58)-.5+(shut?.5:0);
  ctx.save();ctx.globalAlpha*=al;ctx.fillStyle=col;ctx.strokeStyle=col;ctx.lineCap='round';ctx.lineJoin='round';
  if(kind==='puntini'){ctx.beginPath();ctx.ellipse(x+dir*w*.28,y-.2,1*kB,.66*kB,dir*.35,0,TAU);ctx.fill();ctx.restore();return null}
  // the centre line from the outer end (o) through c to the inner end (i), its thickness at the outer end, the middle, the inner end
  const T=(a,b,c)=>[a*kB,b*kB,c*kB],D={sottili:[[-1,.45],[0,-.75],[1,.45],T(.3,.85,.5)],folte:[[-.95,.3],[0,-.62],[.92,.35],T(.8,2,1.6)],decise:[[-.95,-.85],[0,-.2],[.9,1],T(.6,1.65,1.45)],
    alzate:[[-1,.15],[.05,-2.1],[1,-.05],T(.5,1.15,.85)],spezzate:[[-.92,.25],[-.05,-.55],[.92,.3],T(.75,1.8,1.4)],unite:[[-.95,.25],[0,-.55],[1.05,.38],T(.6,1.5,1.25)],
    arcuate:[[-1.05,.75],[-.1,-1.55],[.85,.1],T(.3,.9,.5)],cespugliose:[[-1.05,.2],[0,-.95],[1,.45],T(1.1,2.6,2.1)]}[kind]||[[-1,.45],[0,-.75],[1,.45],T(.3,.85,.5)];
  const a0=[x+dir*w*D[0][0],y+D[0][1]],c0=[x+dir*w*D[1][0],y+D[1][1]],b0=[x+dir*w*D[2][0],y+D[2][1]],
    P=t=>[(1-t)*(1-t)*a0[0]+2*(1-t)*t*c0[0]+t*t*b0[0],(1-t)*(1-t)*a0[1]+2*(1-t)*t*c0[1]+t*t*b0[1]],th=t=>t<.5?lerp(D[3][0],D[3][1],t/.5):lerp(D[3][1],D[3][2],(t-.5)/.5);
  const piece=(t0,t1)=>{const N=12,top=[],bot=[];for(let i=0;i<=N;i++){const t=t0+(t1-t0)*i/N,p=P(t),p2=P(Math.min(1,t+.01)),p1=P(Math.max(0,t-.01)),dx=p2[0]-p1[0],dy=p2[1]-p1[1],l=Math.hypot(dx,dy)||1,
      nx=-dy/l,ny=dx/l,s=th(t)/2*(kind==='cespugliose'&&i%2?1.25:1),u=ny<0?1:-1;top.push([p[0]+nx*s*u,p[1]+ny*s*u]);bot.push([p[0]-nx*s*u*.8,p[1]-ny*s*u*.8])}
    ctx.beginPath();for(const p of top)ctx.lineTo(p[0],p[1]);for(let i=bot.length-1;i>=0;i--)ctx.lineTo(bot[i][0],bot[i][1]);ctx.closePath();ctx.fill()};
  if(kind==='spezzate'){piece(0,.5);piece(.64,1)}else piece(0,1);
  ctx.restore();return{i:P(1),al}}
// the mouth: its shape in the face's units round (0, -.13), sized by K; it turns with the face like the eyes
function mouthLook(kind,fp,seen,K,col){const al=seen(0,-.13);if(al<=.02)return;const M=(x,y)=>fp(x*K,-.13+y*K),lw=Math.max(.7,1.05*Math.sqrt(K));
  ctx.save();ctx.globalAlpha*=al;ctx.lineCap='round';ctx.lineJoin='round';const red=col?hexMix(col,'#2a0a08',.38):'#7a2a22',lip=col||'#5a2a1e';
  const curve=(P)=>{const Q=P.map(p=>M(p[0],p[1]));ctx.beginPath();ctx.moveTo(Q[0][0],Q[0][1]);for(let i=1;i<Q.length-1;i+=2)ctx.quadraticCurveTo(Q[i][0],Q[i][1],Q[i+1][0],Q[i+1][1]);return Q};
  const shape=(P,fill)=>{curve(P);ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=lw*.85;ctx.stroke()};
  if(kind==='sorriso'||kind==='dentino'||kind==='lingua'){if(kind==='lingua'){const T=curve([[.0,-.02],[.02,-.1],[.1,-.12],[.15,-.1],[.14,-.02]]);ctx.closePath();ctx.fillStyle='#f08a9a';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=lw*.7;ctx.stroke();void T}
    curve([[-.17,.02],[0,-.11],[.17,.02]]);ctx.strokeStyle=lip;ctx.lineWidth=lw;ctx.stroke();
    if(kind==='dentino'){const Q=[M(.04,-.035),M(.1,-.025),M(.075,-.1)];ctx.beginPath();ctx.moveTo(Q[0][0],Q[0][1]);ctx.lineTo(Q[1][0],Q[1][1]);ctx.lineTo(Q[2][0],Q[2][1]);ctx.closePath();ctx.fillStyle='#fffaf0';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.6;ctx.stroke()}}
  else if(kind==='sorrisone'||kind==='denti'){shape([[-.19,.03],[0,.05],[.19,.03],[0,-.27],[-.19,.03]],red);
    ctx.save();curve([[-.19,.03],[0,.05],[.19,.03],[0,-.27],[-.19,.03]]);ctx.closePath();ctx.clip();
    if(kind==='denti'){const a=M(-.2,.06),b=M(.2,-.04);ctx.fillStyle='#fffaf0';ctx.fillRect(Math.min(a[0],b[0]),a[1]-.2,Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1])*.9+.4);ctx.strokeStyle='rgba(60,40,30,.5)';ctx.lineWidth=.4;for(const x of[-.07,.07]){const p=M(x,.04),p2=M(x,-.04);seg(p,p2);ctx.stroke()}}
    else{const t=M(0,-.2);ctx.fillStyle='#f08a9a';ctx.beginPath();ctx.ellipse(t[0],t[1],2.1*K,1.2*K,0,0,TAU);ctx.fill()}ctx.restore();
    // a colour of the lips: round the open mouth, inside its dark edge
    if(col){curve([[-.19,.03],[0,.05],[.19,.03],[0,-.27],[-.19,.03]]);ctx.closePath();ctx.strokeStyle=col;ctx.lineWidth=lw*.62;ctx.stroke()}}
  else if(kind==='ghigno'){curve([[-.15,-.01],[.03,-.07],[.18,.07]]);ctx.strokeStyle=lip;ctx.lineWidth=lw;ctx.stroke();const d=M(.19,.08),d2=M(.21,.04);seg(d,d2);ctx.lineWidth=lw*.6;ctx.stroke()}
  else if(kind==='broncio'){curve([[-.12,-.05],[0,.05],[.12,-.05]]);ctx.strokeStyle=lip;ctx.lineWidth=lw;ctx.stroke()}
  else if(kind==='fischio'){const c=M(0,-.02),r=1.05*K;ink(lw*.8);ctx.fillStyle=red;ctx.beginPath();ctx.ellipse(c[0],c[1],r*.75,r,0,0,TAU);ctx.fill();ctx.stroke()}
  else if(kind==='sorpreso'){const c=M(0,-.05),r=1.6*K;ink(lw*.85);ctx.fillStyle=red;ctx.beginPath();ctx.ellipse(c[0],c[1],r*.78,r,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#f08a9a';ctx.beginPath();ctx.ellipse(c[0],c[1]+r*.45,r*.5,r*.35,0,0,TAU);ctx.fill()}
  else{curve([[-.11,0],[0,-.01],[.11,0]]);ctx.strokeStyle=lip;ctx.lineWidth=lw;ctx.stroke()}
  ctx.restore()}
// the marks on the skin, in the face's own units (they turn with it and fade at its edge); each one grows from its own middle with K
function faceMark(kind,fp,seen,K,col){K=K||1;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';const sw=Math.sqrt(K);
  const at=(cx,cy)=>(x,y)=>fp(cx+(x-cx)*K,cy+(y-cy)*K);
  const stroke=(m,P,col,lw,al)=>{if(al<=.02)return;ctx.globalAlpha=al;ctx.strokeStyle=col;ctx.lineWidth=lw*sw;ctx.beginPath();for(const p of P){const q=m(p[0],p[1]);ctx.lineTo(q[0],q[1])}ctx.stroke();ctx.globalAlpha=1};
  const fill=(m,P,col,al,lw)=>{if(al<=.02)return;ctx.globalAlpha=al;ctx.beginPath();for(const p of P){const q=m(p[0],p[1]);ctx.lineTo(q[0],q[1])}ctx.closePath();ctx.fillStyle=col;ctx.fill();if(lw){ctx.strokeStyle=INK;ctx.lineWidth=lw;ctx.stroke()}ctx.globalAlpha=1};
  if(kind==='cicatrice'){// a healed line through his left eye, from the brow to the cheek
    const m=at(-.3,.38),P=[[-.17,1.02],[-.25,.7],[-.32,.38],[-.38,.06],[-.44,-.26]],al=seen(-.33,.3);stroke(m,P,LK_SCAR,2.5,.9*al);stroke(m,P.map(p=>[p[0]-.025,p[1]]),LK_SCARL,.9,.95*al)}
  else if(kind==='graffio'){const m=at(.6,-.1),al=seen(.58,-.1);stroke(m,[[.4,.06],[.78,-.18]],LK_SCAR,1.8,.92*al);stroke(m,[[.47,-.1],[.75,-.28]],LK_SCAR,1.5,.85*al);stroke(m,[[.41,.07],[.77,-.16]],LK_SCARL,.6,.85*al)}
  else if(kind==='croce'){const m=at(.52,-.1),al=seen(.52,-.1);for(const P of[[[.4,.02],[.64,-.22]],[[.4,-.22],[.64,.02]]]){stroke(m,P,LK_SCAR,1.9,.92*al);stroke(m,P.map(p=>[p[0]-.012,p[1]+.012]),LK_SCARL,.6,.8*al)}}
  else if(kind==='lentiggini'){const D=[[-.07,-.02],[.07,0],[0,-.08]];for(const sd of[-1,1])for(const[a,b] of[[.34,-.07],[.46,-.1],[.58,-.05],[.4,-.19],[.53,-.18],[.65,-.12],[.27,-.15]])D.push([sd*a,b]);
    for(const[a,b] of D){const al=seen(a,b);if(al<=.02)continue;ctx.fillStyle=`rgba(160,86,44,${(.62*al).toFixed(3)})`;ball(fp(a*(.8+.2*K),b),.5*sw);ctx.fill()}}
  else if(kind==='pittura'){for(const sd of[-1,1]){const m=at(sd*.52,-.1),al=seen(sd*.52,-.1);
    for(const yy of[0,-.155]){const P=[[sd*.3,-.04+yy],[sd*.52,-.02+yy],[sd*.76,.01+yy],[sd*.74,-.06+yy],[sd*.52,-.08+yy],[sd*.32,-.08+yy]];fill(m,P,col||'#3f86d8',.92*al);stroke(m,[[sd*.36,-.045+yy],[sd*.7,-.01+yy]],col?hexMix(col,'#ffffff',.55):'#a4ccf6',.5,.7*al)}}}
  else if(kind==='runa'){// a rune of moss on his left cheek, glowing softly
    const al=seen(-.5,-.12);if(al>.02){const m=at(-.5,-.12),c=fp(-.5,-.12);if(!LOWFX)shine(col?hexRgb(hexMix(col,'#ffffff',.3)):'125,255,154',c[0],c[1],4.6*K,.42*al);const R1=[[-.5,.06],[-.5,-.3]],R2=[[-.61,-.03],[-.5,-.14],[-.39,-.03]];
      for(const R of[R1,R2])stroke(m,R,col?hexMix(col,'#000000',.45):'#2f8a46',2.4,al);for(const R of[R1,R2])stroke(m,R,col||'#5fe07c',1.3,al);stroke(m,R1,col?hexMix(col,'#ffffff',.75):'#d8ffe0',.45,al)}}
  else if(kind==='neo'){const al=seen(.24,-.18);if(al>.02){ctx.globalAlpha=al;ctx.fillStyle='#4a2a1a';ball(fp(.24,-.18),.62*sw);ctx.fill();ctx.globalAlpha=1}}
  else if(kind==='lacrima'){// a painted tear under his left eye
    const m=at(-.36,-.1),al=seen(-.36,-.1);fill(m,[[-.36,.0],[-.42,-.12],[-.405,-.195],[-.36,-.215],[-.315,-.195],[-.3,-.12]],col||'#5fb4f0',.95*al,.5);
    const hq=m(-.38,-.14);ctx.globalAlpha=.8*al;ctx.fillStyle=col?hexMix(col,'#ffffff',.8):'#e6f6ff';ball(hq,.35*sw);ctx.fill();ctx.globalAlpha=1}
  else if(kind==='stella'){// a painted golden star on his right cheek
    const m=at(.5,-.08),al=seen(.5,-.08),P=[];for(let i=0;i<10;i++){const r=i%2?.07:.16,a=i/10*TAU-Math.PI/2;P.push([.5+Math.cos(a)*r,-.08-Math.sin(a)*r])}fill(m,P,col||'#f6c94b',.95*al,.45);
    const hq=m(.47,-.04);ctx.globalAlpha=.8*al;ctx.fillStyle=col?hexMix(col,'#ffffff',.72):'#fff6c8';ball(hq,.3*sw);ctx.fill();ctx.globalAlpha=1}
  else if(kind==='baffi'){// whiskers painted like a cat's
    for(const sd of[-1,1]){const m=at(sd*.56,-.06),al=seen(sd*.56,-.06);for(const dy of[.05,-.02,-.09])stroke(m,[[sd*.4,-.04+dy*.5],[sd*.58,-.03+dy*.95],[sd*.76,-.02+dy*1.6]],col||'#4a3020',.42,.85*al)}}
  else if(kind==='macchia'){// a birthmark by his left temple
    const m=at(-.6,.12),al=seen(-.6,.12),P=[];for(let i=0;i<9;i++){const a=i/9*TAU,r=.085*(1+.28*Math.sin(i*2.7+1));P.push([-.6+Math.cos(a)*r*1.2,.12+Math.sin(a)*r])}fill(m,P,'rgba(140,80,52,.62)',al)}
  ctx.restore()}
// a band-aid on his right cheek: four corners on the face, rounded, the pad in the middle, little holes
function bandAid(fp,seen,K,col){K=K||1;const al=seen(.5,-.16);if(al<=.02)return;const m=(x,y)=>fp(.48+(x-.48)*K,-.17+(y+.17)*K),C=[[.27,-.02],[.73,-.16],[.69,-.32],[.23,-.18]].map(p=>m(p[0],p[1]));ctx.save();ctx.globalAlpha=al;ctx.lineJoin='round';
  ctx.beginPath();for(const q of C)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.fillStyle=col||'#f6dcae';ctx.fill();ctx.strokeStyle='rgba(27,22,18,.85)';ctx.lineWidth=.7;ctx.stroke();
  const mm=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k],p0=mm(C[0],C[1],.36),p1=mm(C[0],C[1],.64),p2=mm(C[3],C[2],.64),p3=mm(C[3],C[2],.36);
  ctx.beginPath();for(const q of[p0,p1,p2,p3])ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.fillStyle=col?hexMix(col,'#ffffff',.45):'#e2b880';ctx.fill();
  ctx.fillStyle=col?`rgba(${hexRgb(hexMix(col,'#000000',.45))},.6)`:'rgba(150,100,50,.6)';for(const k of[.16,.84])for(const j of[.33,.67]){const a=mm(C[0],C[1],k),b=mm(C[3],C[2],k),q=mm(a,b,j);ball(q,.26);ctx.fill()}ctx.restore()}
// a dark patch over his left eye, the strap across the forehead and round to the ear
function eyePatch(E,ry,fq,fp,seen,col){const al=seen(-.33,.25);ctx.save();ctx.lineCap='round';const pc=col||'#2a211c';
  const s1=fp(-.12,.62),s2=fp(.75,1.25),s3=fp(-.56,.42),s4=fp(-1.05,.32);ctx.strokeStyle=col?hexMix(col,'#000000',.3):pc;ctx.lineWidth=1.25;ctx.beginPath();ctx.moveTo(s1[0],s1[1]);ctx.lineTo(s2[0],s2[1]);ctx.moveTo(s3[0],s3[1]);ctx.lineTo(s4[0],s4[1]);ctx.stroke();
  if(al>.02){const q=fp(-.33,.24),e=E.find(o=>o.sd<0),rx=Math.max(.9,e?e.rx:1.95*Math.pow(Math.max(.05,al),.7))*1.38,ryp=ry*1.32;ctx.globalAlpha=al;
    ctx.beginPath();ctx.ellipse(q[0],q[1]+.1,rx,ryp,0,0,TAU);ctx.fillStyle=pc;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.ellipse(q[0]-rx*.3,q[1]-ryp*.42,rx*.36,ryp*.2,-.3,0,TAU);ctx.fill()}
  ctx.restore()}
// round glasses: a gold ring round each eye, the bridge over the nose, a little shine on the glass
function glasses(E,ry,fq,eyes,edge,kE,col){const fc=col||'#d4a84a';const R=E.filter(e=>e.rx>=.7),k=(eyes==='grandi'||eyes==='stellati'||eyes==='spalancati'?1.16:eyes==='piccoli'?.82:1)*(.65+.35*(kE||1));if(!R.length)return;ctx.save();ctx.lineCap='round';
  const ring=e=>({x:e.q[0],y:e.q[1],rx:e.rx*1.42*k+.35,ry:ry*1.34*k});
  for(const e of R){const g=ring(e),al=edge(e.q);ctx.globalAlpha=al;ctx.fillStyle='rgba(214,236,255,.16)';ctx.beginPath();ctx.ellipse(g.x,g.y,g.rx,g.ry,0,0,TAU);ctx.fill();
    ctx.strokeStyle=INK;ctx.lineWidth=1.9;ctx.stroke();ctx.strokeStyle=fc;ctx.lineWidth=.95;ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=.6;ctx.beginPath();ctx.ellipse(g.x,g.y,g.rx*.72,g.ry*.72,0,3.6,4.5);ctx.stroke()}
  // the bridge between the two rings (or a stub toward the nose when only one shows)
  ctx.globalAlpha=1;const a=ring(R[0]);let p0,p1;
  if(R.length>1){const b=ring(R[1]),d=b.x>a.x?1:-1;p0=[a.x+d*a.rx,a.y-a.ry*.15];p1=[b.x-d*b.rx,b.y-b.ry*.15]}else{const d=fq[0]>=a.x?1:-1;p0=[a.x+d*a.rx,a.y-a.ry*.15];p1=[p0[0]+d*1.2,p0[1]+.2]}
  ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.quadraticCurveTo((p0[0]+p1[0])/2,Math.min(p0[1],p1[1])-.9,p1[0],p1[1]);ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke();ctx.strokeStyle=fc;ctx.lineWidth=.9;ctx.stroke();
  ctx.restore()}
// ------------------------------------------------------------------ what is worn on the head (on the hood, or on the hair when the hood is down)
// the feather stuck in its side (before the head when its root is on the far side); R: the radius it sits on
function featherHood(Vh,h,Rh,nod,sw,col,sk){sk=sk||1;const nb=nrm(nod([-.15,.85,.45])),d=nrm(nod(sk>1?[-1.05,.34+sw*.04,.85]:[-.45,.25+sw*.04,1])),b3=mul(nb,Rh*.94),fw=nrm(cross(d,nb)),side=nrm(add(fw,mul(nb,.8))),L=11.5*sk;
  const at=(k,o2,sd)=>add(add(b3,mul(d,k*L)),add(mul(sd||side,o2),mul(nb,k*k*2*sk))),wid=k=>k<.1?0:Math.pow(Math.sin(Math.min(1,(k-.1)/.9)*Math.PI),.7)*3.1*sk;
  // the Bard's plume (sk > 1): its two halves bent a little out of one plane, like a real feather, so it never shows as a bare line
  const vn=nrm(cross(d,side)),sL=sk>1?nrm(add(side,mul(vn,.8))):side,sR=sk>1?nrm(sub(side,mul(vn,.8))):side;
  const lft=[],rgt=[];for(let i=0;i<=14;i++){const k=.12+i/14*.88;lft.push(hP(Vh,h,at(k,wid(k),sL)));rgt.push(hP(Vh,h,at(k,-wid(k)*.85,sR)))}
  const vane=lft.concat(rgt.reverse()),a=hP(Vh,h,at(0,0)),b=hP(Vh,h,at(1,0)),g=ctx.createLinearGradient(a[0],a[1],b[0],b[1]);g.addColorStop(0,'#f6ead2');g.addColorStop(.55,lt(col,.15));g.addColorStop(1,col);
  ctx.lineJoin='round';poly(vane);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke();
  ctx.save();poly(vane);ctx.clip();ctx.strokeStyle='rgba(60,30,20,.3)';ctx.lineWidth=.6;ctx.beginPath();for(let k=.25;k<.95;k+=.12){const p=hP(Vh,h,at(k,0)),q=hP(Vh,h,at(k+.08,wid(k)));ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1])}ctx.stroke();ctx.restore();
  ctx.strokeStyle='#fff1c4';ctx.lineWidth=.8;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<=8;i++){const q=hP(Vh,h,at(i/8*.96,0));ctx.lineTo(q[0],q[1])}ctx.stroke()}
const featherFront=(Vh,nod)=>Vh.F(nrm(nod([-.15,.85,.45])))>-.12;
// the headband: a strip round the head, over the forehead in front and low at the back; front: the part on our side and the knot when
// the back of the head faces us, else the tails behind the head
function headband(Vh,h,Rh,nod,col,sw,front){const{F}=Vh,at=(a,dz)=>nrm(nod([Math.cos(a),Math.sin(a),lerp(1.42,.42,(1-Math.cos(a))/2)+dz]));
  const kn=at(Math.PI,0),kv=F(kn),R1=Rh*1.03;
  if(front){const runs=[];let cur=[];for(let i=0;i<=48;i++){const a=i/48*TAU,m=at(a,0);if(F(m)>.02)cur.push(a);else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
    if(runs.length>1&&runs[0][0]===0&&runs[runs.length-1][runs[runs.length-1].length-1]>=TAU-.01){const l=runs.pop();runs[0]=l.map(a=>a-TAU).concat(runs[0])}
    for(const r of runs){if(r.length<2)continue;const top=r.map(a=>sp(Vh,h,R1,at(a,.21))),bot=r.map(a=>sp(Vh,h,R1,at(a,-.21)));ctx.beginPath();for(const q of top)ctx.lineTo(q[0],q[1]);for(let i=bot.length-1;i>=0;i--)ctx.lineTo(bot[i][0],bot[i][1]);ctx.closePath();
      ctx.fillStyle=col;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();ctx.strokeStyle=lt(col,.35);ctx.lineWidth=.6;line(r.map(a=>sp(Vh,h,R1,at(a,.08))));ctx.stroke()}}
  // the knot and the two tails, hanging and swinging a little
  if((kv>-.25)!==front)return;const k3=mul(kn,Rh*1.05),q=hP(Vh,h,k3);
  for(const sd of[-1,1]){const t1=add(k3,nod([-2.2,sd*1.6+sw*.3,-3.6])),t2=add(k3,nod([-3.4,sd*2.6+sw*.6,-8]));const A=hP(Vh,h,t1),B=hP(Vh,h,t2);
    ctx.fillStyle=INK;hull(q,2,A,1.9);ctx.fill();hull(A,1.9,B,1.5);ctx.fill();ctx.fillStyle=col;hull(q,1.1,A,1);ctx.fill();hull(A,1,B,.7);ctx.fill()}
  ink(1.2);ball(q,1.9);ctx.fillStyle=col;ctx.fill();ctx.stroke()}
// the spiky locks over the edge of the hood's opening (hair 'spettinati' under the hood)
function spikesHood(Vh,h,Rh,nod,col){for(const x of[-.55,-.02,.52]){const v=Vh.F(nrm(nod([1,x,1.2])));if(v<.12)continue;
  const A=sp(Vh,h,Rh*.99,nrm(nod([1,x-.2,1.45]))),B=sp(Vh,h,Rh*.99,nrm(nod([1,x+.2,1.45]))),T=sp(Vh,h,Rh*1.12,nrm(nod([1,x+.12,2.6])));
  ctx.save();ctx.globalAlpha=cl((v-.12)*4,0,1);ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.quadraticCurveTo((A[0]+T[0])/2-.5,(A[1]+T[1])/2,T[0],T[1]);ctx.quadraticCurveTo((B[0]+T[0])/2+.4,(B[1]+T[1])/2,B[0],B[1]);ctx.closePath();
  ctx.fillStyle=col;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke();ctx.restore()}}
// a little golden crown on top of the head: a band with five points and red stones, the far half first
function crown(Vh,h,R,nod,col){const up=nrm(nod([0,0,1])),c0=mul(up,R*.9),u=nrm(nod([1,0,0])),v=nrm(nod([0,1,0])),r=4.6,H=2.8,N=20;
  const ring=(z,rr)=>{const o=[];for(let i=0;i<N;i++){const t=i/N*TAU;o.push(add(add(c0,mul(up,z)),add(mul(u,Math.cos(t)*rr),mul(v,Math.sin(t)*rr))))}return o},B=ring(0,r),T=ring(H,r*1.06);
  const Hh=chull(B.concat(T).map(q=>hP(Vh,h,q)).concat([0,4,8,12,16].map(i=>hP(Vh,h,add(T[i],mul(up,2.3)))))),bb=[1e9,1e9,-1e9,-1e9];for(const q of Hh){bb[0]=Math.min(bb[0],q[0]);bb[1]=Math.min(bb[1],q[1]);bb[2]=Math.max(bb[2],q[0]);bb[3]=Math.max(bb[3],q[1])}
  // the inside (the far wall, darker), then the outside wall with its points
  const g=ctx.createLinearGradient(bb[0],bb[1],bb[2],bb[3]);g.addColorStop(0,'#fff0a8');g.addColorStop(.45,'#f2c240');g.addColorStop(1,'#a8701a');
  ink(1.15);ctx.beginPath();const top=T.map(q=>hP(Vh,h,q));for(const q of top)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.fillStyle='#8a5a14';ctx.fill();
  const wall=[];for(let i=0;i<N;i++){const t=i/N*TAU,n=add(mul(u,Math.cos(t)),mul(v,Math.sin(t)));if(Vh.F(n)>-.05)wall.push(i)}
  ctx.beginPath();for(const i of wall){const q=hP(Vh,h,B[i]);ctx.lineTo(q[0],q[1])}for(let k=wall.length-1;k>=0;k--){const i=wall[k],q=hP(Vh,h,i%4===0?add(T[i],mul(up,2.3)):T[i]);ctx.lineTo(q[0],q[1])}ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.stroke();
  for(const i of wall)if(i%4===2){const q=hP(Vh,h,add(lerp3(B[i],T[i],.5),mul(add(mul(u,Math.cos(i/N*TAU)),mul(v,Math.sin(i/N*TAU))),.2)));ink(.6);ctx.fillStyle=col||'#e5484d';ball(q,.95);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ball([q[0]-.25,q[1]-.25],.25);ctx.fill()}
  for(const i of wall)if(i%4===0){const q=hP(Vh,h,add(T[i],mul(up,2.3)));ctx.fillStyle='#fff6c8';ink(.6);ball(q,.7);ctx.fill();ctx.stroke()}}
// a flower tucked over his left ear: five petals and a golden middle, turned the way the head turns
function flower(Vh,h,R,nod,col){const d=nrm(nod(hdir(-1.05,.5))),c=mul(d,R*1.02),u=nrm(cross(d,[0,0,1])),v=nrm(cross(u,d)),f=Vh.F(d);if(f<-.2)return;
  ctx.save();ctx.globalAlpha*=cl((f+.2)*4,0,1);for(let i=0;i<5;i++){const t=i/5*TAU+.3,q=hP(Vh,h,add(c,add(mul(u,Math.cos(t)*1.7),mul(v,Math.sin(t)*1.7))));ink(.9);ball(q,1.45);ctx.fillStyle=lt(col,.25);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.45)';ball([q[0]-.4,q[1]-.4],.45);ctx.fill()}
  const q=hP(Vh,h,add(c,mul(d,.3)));ink(.8);ball(q,1);ctx.fillStyle='#ffd84a';ctx.fill();ctx.stroke();ctx.restore()}
// an earring: a gold hoop with a stone, hanging under his left ear (under the hood's edge when the ears are under the hood)
function earring(Vh,h,R,nod,col,hidden){const d=nrm(nod(hidden?hdir(-.82,-.28):hdir(-1.62,-.22))),f=Vh.F(hidden?d:add(mul(nod([0,-1,0]),Math.cos(EARB)),mul(nod([1,0,0]),Math.sin(EARB))));if(f<.02)return;
  const top=hidden?mul(d,R):add(mul(d,R*.97),mul(nod([0,-1,0]),1.3)),q=hP(Vh,h,top),b=hP(Vh,h,add(top,[0,0,-2.6]));
  ctx.save();ctx.globalAlpha*=cl(f*5,0,1);ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse((q[0]+b[0])/2,(q[1]+b[1])/2,1,Math.abs(b[1]-q[1])/2+.3,0,0,TAU);ctx.stroke();ctx.strokeStyle='#f2c240';ctx.lineWidth=.8;ctx.stroke();
  ink(.8);ctx.fillStyle=col;ball([b[0],b[1]+.6],.9);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ball([b[0]-.3,b[1]+.3],.3);ctx.fill();ctx.restore()}
// the mask: a band round the head over the eyes (they look out through it), its knot at the back
function maskMesh(Vh,nod,NA){return regionMesh(Vh,nod,-Math.PI,Math.PI,a=>.03+.13*Math.exp(-(a/.15)*(a/.15)),()=>.5,NA,2)}
function maskPaint(Vh,h,R,M,col){if(!meshPath(M,h,R))return;const g=soft(h[0]-R*.4,h[1]-R*.4,h[0],h[1],R*1.3,col,.2,.35);ctx.fillStyle=g;ctx.fill();
  ctx.strokeStyle=INK;ctx.lineWidth=.9;for(const j of[0,M.NE])for(const r of meshEdge(M,h,R,j,.05)){if(r.length<2)continue;line(r);ctx.stroke()}}
// ------------------------------------------------------------------ the bare head (hood down): the ball of skin, the hair over it, the ears
// Drawn in layers: the dark outline of everything, the volume of the hair (and of the beard) standing off the ball, the ball of skin,
// the face with the hair on it (lk.hairFn, between the marks and the eyes), then what stands out in front
function bareHead(Vh,Rh,S,A,o,h,nod,fd,lk){const{R0,Rc,Rb,H,M,MB,g,bg}=lk;
  ctx.fillStyle=INK;if(!H.flat){meshPath(M,h,Rc+.95);ctx.fill()}if(MB){meshPath(MB,h,Rb+.95);ctx.fill()}ball(h,R0+1.25);ctx.fill();
  if(!H.flat){meshPath(M,h,Rc);ctx.fillStyle=g;ctx.fill()}if(MB){meshPath(MB,h,Rb);ctx.fillStyle=bg;ctx.fill()}
  ball(h,R0);ctx.fillStyle=soft(h[0]-R0*.36,h[1]-R0*.42,h[0]-R0*.05,h[1]+R0*.05,R0*1.2,S.skin,.14,.26);ctx.fill();
  ctx.save();ball(h,R0);ctx.clip();
  // a soft shade under the chin, where the head sits on the collar
  {const gq=ctx.createLinearGradient(0,h[1]+R0*.35,0,h[1]+R0);gq.addColorStop(0,'rgba(60,30,14,0)');gq.addColorStop(1,'rgba(60,30,14,.24)');ctx.fillStyle=gq;ctx.fillRect(h[0]-R0,h[1]+R0*.35,R0*2,R0*.7)}
  face(Vh,h,R0,nod,o,fd);ctx.restore();
  rim(h,R0,h,R0,.22)}
// the knot of the mask (or of a band) at the back of the head, its two tails swinging a little
function bandKnot(Vh,h,k3,nod,col,sw){const q=hP(Vh,h,k3);
  for(const sd of[-1,1]){const t1=add(k3,nod([-2,sd*1.5+sw*.3,-3.2])),t2=add(k3,nod([-3,sd*2.3+sw*.6,-7]));const A=hP(Vh,h,t1),B=hP(Vh,h,t2);
    ctx.fillStyle=INK;hull(q,1.8,A,1.7);ctx.fill();hull(A,1.7,B,1.3);ctx.fill();ctx.fillStyle=col;hull(q,1,A,.9);ctx.fill();hull(A,.9,B,.6);ctx.fill()}
  ink(1.1);ball(q,1.7);ctx.fillStyle=col;ctx.fill();ctx.stroke()}
// ------------------------------------------------------------------ the look on the head: what is needed for this drawing (the meshes of
// the hair, the beard and the mask, their colours), the hair and the beard on the face (o.hairFn, o.beardFn, o.mustFn, o.maskFn), what
// goes behind the head and what in front of it
function lookPrep(Vh,Rh,S,o,h,nod){const L=S.look;o.L=L;const hat=HATS[L.hood]&&!S.helm?L.hood:null,bare=L.hood==='senza'||L.hood==='giu'||!!hat,K=L.hairK||1,H=HAIRS[L.hair]||HAIRS.nascosti,col=L.hairCol||'#8a5a32';
  const R0=bare?Rh*.93:Rh,Rc=bare?R0*(1+H.v*K):Rh,hl=hairLine(H,K),res=meshRes(R0),NA=res[0],NE=res[1],sw=o.sway||0;
  const lk={bare,hat,K,H,col,R0,Rc,hl,sw};o.bare=bare;
  if(bare||(L.hair&&L.hair!=='nascosti')){lk.M=bare?regionMesh(Vh,nod,-Math.PI,Math.PI,hl,()=>Math.PI/2,NA,NE):regionMesh(Vh,nod,-1.35,1.35,hl,()=>Math.PI/2,Math.round(NA*.7),NE);lk.g=hairGrad(h,bare?Rc:Rh,col)}
  // (under the Ninja's mask there is no beard)
  const B=S.mask?null:BEARDS[L.beard];if(B){lk.B=B;lk.bcol=hexMix(L.beardCol||col,'#1b1210',.1);lk.bK=L.beardK||1;
    if(B.line){lk.MB=regionMesh(Vh,nod,-1.35,1.35,()=>-1.5,B.line,Math.round(NA*.6),4);lk.Rb=R0*(1+.05*lk.bK);lk.bg=hairGrad(h,bare?lk.Rb:Rh,lk.bcol)}
    if(B.must)o.mustFn=(fp,seen)=>moustache(B.must,fp,seen,lk.bcol,lk.bK)}
  // the hair on the face: under the hood the part in the opening, with the hood's shadow on it; on the bare head the part over the skin
  if(lk.M)o.hairFn=()=>{const R=bare?R0:Rh*.99;hairPaint(Vh,h,R,nod,lk.M,H,hl,col,lk.g,bare?1.15:1.05);
    if(!bare){if(H.lock){const P=[[-.55,1.28,.2],[-.2,1.05,.75],[.18,.84,.95],[.48,.62,.7],[.62,.47,.25]].map(([a,e,oo])=>mul(nod(hdir(a,e)),R+oo*K));lock3(Vh,h,P,[2.4,2.5,2.2,1.5,.45].map(v=>v*K),col,lk.g)}
      if(H.curls)for(const a of[-.62,-.31,0,.31,.62])curl3(Vh,h,mul(nod(hdir(a,hl(a)+.04)),R+.3*K),1.5*K,col,lk.g);
      if(lk.fcRim){ctx.save();ctx.strokeStyle='rgba(16,10,6,.34)';ctx.lineWidth=2.6;ctx.lineJoin='round';line(lk.fcRim);if(lk.fcFull)ctx.closePath();ctx.stroke();ctx.restore()}}};
  if(lk.MB)o.beardFn=()=>{const R=bare?R0:Rh*.99;if(!meshPath(lk.MB,h,R))return;ctx.fillStyle=lk.bg;ctx.fill();
    ctx.save();ctx.clip();ctx.strokeStyle=hexMix(lk.bcol,'#0d1418',.45);ctx.globalAlpha=.45;ctx.lineWidth=.6;ctx.lineCap='round';
    for(const a0 of[-1.05,-.72,-.4,-.13,.13,.4,.72,1.05]){const pts=[];for(let k=0;k<=6;k++){const n=nrm(nod(hdir(a0*(1-k*.04),lerp(B.line(a0)-.04,-1.2,k/6))));if(Vh.F(n)>.05)pts.push(sp(Vh,h,R,n));else if(pts.length)break}if(pts.length>1){line(pts);ctx.stroke()}}
    ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=.95;ctx.lineCap='round';ctx.lineJoin='round';for(const r of meshEdge(lk.MB,h,R,lk.MB.NE,.05)){if(r.length<2)continue;line(r);ctx.stroke()}};
  if(L.acc==='maschera'){lk.MM=maskMesh(Vh,nod,Math.max(24,Math.round(NA*.8)));o.maskFn=()=>maskPaint(Vh,h,(bare?R0:Rh*.99)*1.006,lk.MM,L.accFix||'#3a2f45')}
  return lk}
function lookBehind(Vh,Rh,S,o,h,nod,lk){const L=S.look,acc=L.acc,Rw=lk.bare?lk.Rc:Rh;
  if(acc==='piuma'&&!lk.hat&&!featherFront(Vh,nod))featherHood(Vh,h,Rw,nod,lk.sw,L.accCol||'#e5484d');
  if(acc==='fascia'&&!S.helm&&!lk.hat)headband(Vh,h,Rw,nod,L.accCol||'#d24b3e',lk.sw,false);
  if(lk.g)hairPieces(Vh,h,lk.bare?lk.Rc:Rh,nod,lk.H,L,S,lk.col,lk.g,lk.K,false,lk.bare,lk.sw);
  earsDraw(Vh,h,lk.bare?lk.R0:Rh,nod,L,S,lk.bare,false)}
function lookFront(Vh,Rh,S,o,h,nod,lk){const L=S.look,acc=L.acc,Rw=lk.bare?lk.Rc:Rh;
  if(!lk.bare&&L.hair==='spettinati'&&!S.helm)spikesHood(Vh,h,Rh,nod,lk.col);
  const top=L.ears==='gatto'||L.ears==='orso'||L.ears==='coniglio';if(!top)earsDraw(Vh,h,lk.bare?lk.R0:Rh,nod,L,S,lk.bare,true);
  if(lk.g)hairPieces(Vh,h,lk.bare?lk.Rc:Rh,nod,lk.H,L,S,lk.col,lk.g,lk.K,true,lk.bare,lk.sw);
  if(top&&!S.helm&&!lk.hat)earsDraw(Vh,h,lk.bare?lk.Rc*.98:Rh,nod,L,S,lk.bare,true);
  if(lk.B&&lk.B.hang)beardHang(Vh,h,lk.bare?lk.R0:Rh,nod,lk.B,lk.bcol,lk.bK,lk.sw,L.accCol);
  if(acc==='fascia'&&!S.helm&&!lk.hat)headband(Vh,h,Rw,nod,L.accCol||'#d24b3e',lk.sw,true);
  if(acc==='piuma'&&!lk.hat&&featherFront(Vh,nod))featherHood(Vh,h,Rw,nod,lk.sw,L.accCol||'#e5484d');
  if(acc==='coroncina'&&!S.helm&&!lk.hat)crown(Vh,h,lk.bare?lk.Rc:Rh,nod,L.accFix);
  if(acc==='fiore')flower(Vh,h,Rw,nod,L.accCol||'#e5484d');
  if(acc==='orecchino')earring(Vh,h,lk.bare?lk.R0:Rh,nod,L.accCol||'#e5484d',!lk.bare);
  if(acc==='maschera'&&lk.bare){const d=nod(hdir(Math.PI,.27));if(Vh.F(d)>-.2)bandKnot(Vh,h,mul(d,lk.R0*1.04),nod,L.accFix||'#3a2f45',lk.sw)}}
// ------------------------------------------------------------------ the hood lowered (look hood 'giu'), drawn with the body
// the cloth gathered round the neck: a soft roll of the hood's colour (its far half before the tunic, the near half after it and
// under the head), with folds
const COWL_Z=12.4;
function cowl(V0,X,col,near){const{P,F}=V0,z=ZB+COWL_Z,r=radAt(COWL_Z)+1.25,rt=1.75,N=36,pts=[];
  for(let i=0;i<=N;i++){const t=i/N*TAU,n=X.Rd([Math.cos(t),Math.sin(t),0]);pts.push({t,q:P(X.T([Math.cos(t)*r*AX,Math.sin(t)*r,z])),f:F(n)})}
  const runs=[];let cur=[];for(const p of pts){if((p.f>=0)===near)cur.push(p);else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
  // a roll of the same thickness all along: a thick round line (the same shape as a chain of capsules, in one go)
  ctx.lineCap='round';ctx.lineJoin='round';for(const[w,c] of[[rt+1.3,INK],[rt,near?col:dk(col,.25)]]){ctx.strokeStyle=c;ctx.lineWidth=w*2;for(const r of runs){if(r.length<2)continue;line(r.map(p=>p.q));ctx.stroke()}}
  if(near){ctx.lineCap='round';for(const r of runs){ctx.strokeStyle=dk(col,.28);ctx.lineWidth=1.1;ctx.globalAlpha=.6;line(r.map(p=>[p.q[0],p.q[1]+rt*.5]));ctx.stroke();
      ctx.strokeStyle=lt(col,.35);ctx.lineWidth=.8;ctx.globalAlpha=.8;line(r.map(p=>[p.q[0],p.q[1]-rt*.45]));ctx.stroke();ctx.globalAlpha=1;
      // two soft folds where the cloth gathers in front
      ctx.strokeStyle=dk(col,.3);ctx.lineWidth=.75;for(const p of r){const t=((p.t+Math.PI)%TAU)-Math.PI;if(Math.abs(Math.abs(t)-.45)<.06){const q=p.q;ctx.beginPath();ctx.moveTo(q[0],q[1]-rt*.55);ctx.quadraticCurveTo(q[0]+.5,q[1],q[0]-.1,q[1]+rt*.6);ctx.stroke()}}}}}
// the hood itself lying on the upper back: a bag of cloth behind the neck, its opening toward the sky (the lining shows from behind), a
// seam down the middle and two folds; the mages' point hangs down from it
function hoodBack(V0,X,S,sw){const{P,F}=V0,col=S.hood,fb=F(X.Rd([-1,0,.4]));
  const ring=(cx,z,ry,rx,n)=>{const o=[];for(let i=0;i<n;i++){const t=i/n*TAU;o.push(X.T([cx+Math.cos(t)*rx,Math.sin(t)*ry,z]))}return o};
  const R3=[...ring(-6.4,ZB+14.6,6.6,2.4,16),...ring(-8.4,ZB+11.4,6.9,3.1,16),...ring(-9.1,ZB+8.3,5.7,2.7,14),...(S.hoodTip?[X.T([-9.8,sw*.5,ZB+2.4])]:ring(-8.9,ZB+6.1,3.2,1.8,10))];
  const Hh=chull(R3.map(q=>P(q))),bb=[1e9,1e9,-1e9,-1e9];for(const q of Hh){bb[0]=Math.min(bb[0],q[0]);bb[1]=Math.min(bb[1],q[1]);bb[2]=Math.max(bb[2],q[0]);bb[3]=Math.max(bb[3],q[1])}
  ctx.lineJoin='round';ink(2.3);poly(Hh);ctx.fillStyle=soft(bb[0]+(bb[2]-bb[0])*.3,bb[1]+(bb[3]-bb[1])*.22,(bb[0]+bb[2])/2,(bb[1]+bb[3])/2,Math.max(bb[2]-bb[0],bb[3]-bb[1])*.75,col,.14,.32);ctx.fill();ctx.stroke();
  ctx.save();poly(Hh);ctx.clip();
  // the opening: the dark lining, where we can look into it
  if(fb>-.25){const op=chull(ring(-6.3,ZB+14.9,5.6,2.1,18).map(q=>P(q)));poly(op);ctx.fillStyle=dk(col,.58);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke()}
  // the seam and the folds, only on the side we see
  if(fb>0){ctx.strokeStyle=dk(col,.3);ctx.lineWidth=1;ctx.lineCap='round';line([X.T([-8.6,0,ZB+13.4]),X.T([-9.4,0,ZB+9.6]),X.T([-9.3,0,ZB+6.4])].map(q=>P(q)));ctx.stroke();
    for(const sd of[-1,1]){line([X.T([-7.6,sd*4.6,ZB+12.8]),X.T([-8.9,sd*3.6,ZB+10.2]),X.T([-9,sd*2.2,ZB+7.6])].map(q=>P(q)));ctx.stroke()}}
  // the shade of the head on it
  {const g=ctx.createLinearGradient(0,bb[1],0,bb[3]);g.addColorStop(0,'rgba(0,0,0,.22)');g.addColorStop(.4,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(bb[0],bb[1],bb[2]-bb[0],bb[3]-bb[1])}
  ctx.restore();rimPoly(Hh,.25)}
// the necklace (look acc 'collana'): a cord of beads round the neck, three white fangs in the middle
function necklace(V0,X,col){const{P,F}=V0;for(let i=0;i<=22;i++){const k=i/22,sd=k<.5?-1:1,u=Math.abs(k-.5)*2,s=surf(sd*lerp(.02,.62,u),lerp(ZB+9.3,ZB+12.7,u*u),.45),n=X.Rd(s.n),v=F(n);if(v<=.06)continue;
    const q=P(X.T(s.p));ctx.save();ctx.globalAlpha=cl(v*5,0,1);
    if(u<.16&&i%2===1){ink(.8);ctx.fillStyle='#f6efe0';ctx.beginPath();ctx.moveTo(q[0]-.9,q[1]-.4);ctx.lineTo(q[0]+.9,q[1]-.4);ctx.lineTo(q[0]+.1,q[1]+2.6);ctx.closePath();ctx.fill();ctx.stroke()}
    else{ink(.7);ctx.fillStyle=i%3?col:'#f2c240';ball(q,1.05);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.55)';ball([q[0]-.3,q[1]-.3],.28);ctx.fill()}ctx.restore()}}
// ------------------------------------------------------------------ the enemies' heads and what they wear on them
// a point of the head's own 3D space (an offset from its centre, in head units) on the screen, like the moss stick's points
const hP=(Vh,h,v)=>sp(Vh,h,1,v);
const inwardAt=(h,Rh,q,a,b)=>{const dx=q[0]-h[0],dy=q[1]-h[1],d=Math.hypot(dx,dy)/Rh;if(d<=a)return q;const d2=a+(b-a)*(1-Math.exp(-(d-a)/(b-a)));return[h[0]+dx*d2/d,h[1]+dy*d2/d]};
// the skull of the skeletons: a clean bone ball, two dark sockets with a coloured light inside, a row of teeth, a crack at the back
function skullHead(Vh,Rh,S,A,o,h,nod){const{F}=Vh,bone=S.skin;
  ink(2.5);ball(h,Rh);ctx.fillStyle=bone;ctx.fill();ctx.stroke();
  ctx.save();ball(h,Rh-.8);ctx.clip();ctx.fillStyle=soft(h[0]-Rh*.36,h[1]-Rh*.42,h[0]-Rh*.05,h[1]+Rh*.05,Rh*1.2,bone,.12,.3);ctx.fillRect(h[0]-Rh,h[1]-Rh,Rh*2,Rh*2);
  {const pts=[];for(const m of[[-.82,-.2,.55],[-.97,.12,.24],[-.94,-.08,-.06]]){const d=nrm(nod(m));if(F(d)>.05)pts.push(sp(Vh,h,Rh*.97,d))}
    if(pts.length>1){ctx.strokeStyle='rgba(27,22,18,.5)';ctx.lineWidth=1.5;ctx.lineCap='round';ctx.lineJoin='round';line(pts);ctx.stroke()}}
  // the sockets, placed as the hero's eyes are: never on the outline, the far one slides in and narrows
  const E=[-1,1].map(sd=>{const e=nrm(nod([1,sd*.36,.12])),v=F(e);return{v,q:sp(Vh,h,Rh*.97,e),rx:2.75*Math.pow(Math.max(0,v),.6)}}).filter(e=>e.v>.06).sort((a,b)=>b.v-a.v);
  if(E.length)E[0].q=inwardAt(h,Rh,E[0].q,.58,.72);
  if(E.length>1){const n=E[0],f=E[1];f.q=inwardAt(h,Rh,f.q,.48,.64);const gap=Math.hypot(f.q[0]-n.q[0],f.q[1]-n.q[1])-n.rx-.6;f.rx=Math.min(f.rx,Math.max(0,gap))}
  const lit=o.shut?0:o.blink==null?1:sstep(.05,.65,o.blink),rgb=hexRgb(S.eyes||'#e5484d');
  for(const{v,q,rx} of E){if(rx<.7)continue;const ry=3.1*(1-.25*(o.squint||0));ctx.fillStyle='#2a211c';ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU);ctx.fill();
    if(lit>0){shine(rgb,q[0],q[1]+.3,6,.5*Math.min(1,v*2)*lit);ctx.save();ctx.globalAlpha*=lit;ctx.fillStyle=S.eyes||'#e5484d';ball([q[0],q[1]+.4],Math.min(rx*.62,1.35));ctx.fill();ctx.fillStyle='#fff';ball([q[0]-.35,q[1]],.42);ctx.fill();ctx.restore()}}
  // the teeth: the line of the jaw with the gaps between the teeth
  {const m=nrm(nod([1,0,-.44])),v=F(m);if(v>.08){const q=inwardAt(h,Rh,sp(Vh,h,Rh*.97,m),.62,.8),w=3.8*Math.max(.4,Math.pow(v,.6));ctx.save();ctx.globalAlpha=cl((v-.08)*4,0,1)*.85;ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(q[0]-w,q[1]);ctx.lineTo(q[0]+w,q[1]);for(let i=-1;i<=1;i++){ctx.moveTo(q[0]+i*w*.5,q[1]-1.3);ctx.lineTo(q[0]+i*w*.5,q[1]+1.3)}ctx.stroke();ctx.restore()}}
  ctx.restore();rim(h,Rh,h,Rh,.3)}
// a goblin's ear: a long point of skin out of the side of the hood, a little up and back, lighter inside
function ear(Vh,h,Rh,S,nod,sd){const b1=hP(Vh,h,nod(mul(nrm([.18,sd,.42]),Rh*.9))),b2=hP(Vh,h,nod(mul(nrm([-.3,sd,-.2]),Rh*.9))),t=hP(Vh,h,nod([-Rh*.95,sd*Rh*1.7,Rh*.6])),
    m=hP(Vh,h,nod([-Rh*.4,sd*Rh*1.25,Rh*.25]));
  const path=()=>{ctx.beginPath();ctx.moveTo(b1[0],b1[1]);ctx.quadraticCurveTo((b1[0]+t[0])/2+(m[0]-(b1[0]+b2[0])/2)*.2,(b1[1]+t[1])/2-1,t[0],t[1]);ctx.quadraticCurveTo((b2[0]+t[0])/2,(b2[1]+t[1])/2+1.2,b2[0],b2[1]);ctx.closePath()};
  const bb=[Math.min(b1[0],b2[0],t[0]),Math.min(b1[1],b2[1],t[1]),Math.max(b1[0],b2[0],t[0]),Math.max(b1[1],b2[1],t[1])],w=bb[2]-bb[0],hh=bb[3]-bb[1];
  ink(2.4);path();ctx.fillStyle=soft(bb[0]+w*.3,bb[1]+hh*.25,bb[0]+w*.5,bb[1]+hh*.5,Math.max(w,hh)*.8,S.skin,.16,.24);ctx.fill();ctx.stroke();
  ctx.save();path();ctx.clip();ctx.fillStyle='rgba(60,30,20,.22)';ctx.beginPath();ctx.moveTo(lerp(b1[0],b2[0],.3),lerp(b1[1],b2[1],.3));ctx.lineTo(lerp(t[0],m[0],.25),lerp(t[1],m[1],.25));ctx.lineTo(lerp(b1[0],b2[0],.75),lerp(b1[1],b2[1],.75));ctx.closePath();ctx.fill();ctx.restore()}
// the point of the hood (the mages): a soft cone on top of the head, leaning back; outlined only along its sides, so it grows out of the hood
function hoodTip(Vh,h,Rh,S,nod){const c0=nod(mul(nrm([-.32,0,1]),Rh*.8)),ap=nod([-Rh*.64,0,Rh*1.66]),ax=nrm(sub(ap,c0));let e1=cross(ax,[0,1,0]);if(len(e1)<.2)e1=cross(ax,[1,0,0]);e1=nrm(e1);const e2=cross(ax,e1),rb=Rh*.44,pts=[];
  for(let i=0;i<16;i++){const a=i/16*TAU;pts.push(hP(Vh,h,add(c0,add(mul(e1,Math.cos(a)*rb),mul(e2,Math.sin(a)*rb)))))}
  const A=hP(Vh,h,ap);pts.push(A);const H=chull(pts),bb=[1e9,1e9,-1e9,-1e9];for(const q of H){bb[0]=Math.min(bb[0],q[0]);bb[1]=Math.min(bb[1],q[1]);bb[2]=Math.max(bb[2],q[0]);bb[3]=Math.max(bb[3],q[1])}
  poly(H);ctx.fillStyle=soft(bb[0]+(bb[2]-bb[0])*.3,bb[1]+(bb[3]-bb[1])*.3,bb[0]+(bb[2]-bb[0])*.5,bb[1]+(bb[3]-bb[1])*.55,Math.max(bb[2]-bb[0],bb[3]-bb[1])*.8,S.hood,.14,.3);ctx.fill();
  const i=H.indexOf(A);if(i>=0){const a=H[(i-1+H.length)%H.length],b=H[(i+1)%H.length];ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(A[0],A[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}}
// the dwarf's helmet: a steel dome over the top of the head, a band round its brim, a nose guard down the front
function helm(Vh,h,Rh,S,nod){const R2=Rh*1.05,up=nrm(nod([.1,0,1])),c=capPath(Vh,h,R2,up,1.02);if(!c)return;
  ink(2.5);ctx.fillStyle=soft(h[0]-R2*.4,h[1]-R2*.6,h[0],h[1]-R2*.2,R2*1.1,'#a9b1ba',.35,.42);ctx.fill();ctx.stroke();
  ctx.save();ctx.clip();ctx.fillStyle='rgba(255,255,255,.35)';ell(h[0]-R2*.35,h[1]-R2*.62,R2*.32,R2*.16);ctx.fill();ctx.restore();
  // the band round the brim (only the part we see), then the nose guard
  const pts=[];let on=[];for(let i=0;i<=36;i++){const a=i/36*TAU,e=.55,d=nrm(nod([Math.cos(a)*Math.cos(e),Math.sin(a)*Math.cos(e),Math.sin(e)]));if(F0(Vh,d)>.02)on.push(sp(Vh,h,R2*1.01,d));else if(on.length){pts.push(on);on=[]}}if(on.length)pts.push(on);
  ctx.lineCap='round';ctx.lineJoin='round';for(const r of pts){if(r.length<2)continue;ctx.strokeStyle=INK;ctx.lineWidth=3.8;line(r);ctx.stroke();ctx.strokeStyle='#5a5f68';ctx.lineWidth=1.9;line(r);ctx.stroke()}
  const nf=Vh.F(nod([1,0,0]));if(nf>.15){const a=sp(Vh,h,R2*1.02,nrm(nod([1,0,.6]))),b=sp(Vh,h,Rh*1.04,nrm(nod([1,0,.12])));ctx.save();ctx.globalAlpha=cl((nf-.15)*4,0,1);ctx.strokeStyle=INK;ctx.lineWidth=4.4;seg(a,b);ctx.stroke();ctx.strokeStyle='#6b727c';ctx.lineWidth=2.4;ctx.stroke();ctx.restore()}}
const F0=(Vh,d)=>Vh.F(d);
// the dwarf's beard: a soft orange tuft hanging from the jaw in front of the chest, with two strands
function beard(Vh,h,Rh,S,nod){const f=Vh.F(nod([1,0,-.2]));if(f<-.1)return;const pts=[];
  for(let i=0;i<=8;i++){const a=-1.05+i/8*2.1;pts.push(hP(Vh,h,nod(mul(nrm([Math.cos(a)*.86,Math.sin(a),-.6]),Rh*.98))))}
  const tip=hP(Vh,h,nod([Rh*.86,0,-Rh*1.55])),mid=[hP(Vh,h,nod([Rh*.98,-Rh*.45,-Rh*1.1])),hP(Vh,h,nod([Rh*.98,Rh*.45,-Rh*1.1]))];
  const H=chull(pts.concat([tip],mid)),bb=[1e9,1e9,-1e9,-1e9];for(const q of H){bb[0]=Math.min(bb[0],q[0]);bb[1]=Math.min(bb[1],q[1]);bb[2]=Math.max(bb[2],q[0]);bb[3]=Math.max(bb[3],q[1])}
  ctx.save();ctx.globalAlpha=cl((f+.1)*4,0,1);ink(2.4);poly(H);ctx.fillStyle=soft(bb[0]+(bb[2]-bb[0])*.3,bb[1]+(bb[3]-bb[1])*.3,bb[0]+(bb[2]-bb[0])*.5,bb[1]+(bb[3]-bb[1])*.55,Math.max(bb[2]-bb[0],bb[3]-bb[1])*.75,S.beard,.18,.3);ctx.fill();ctx.stroke();
  if(f>.25){ctx.strokeStyle='rgba(60,20,6,.38)';ctx.lineWidth=1;ctx.lineCap='round';for(const sd of[-.28,.28]){const a=hP(Vh,h,nod([Rh*.98,sd*Rh,-Rh*.62])),b=hP(Vh,h,nod([Rh*.94,sd*Rh*.7,-Rh*1.2]));seg(a,b);ctx.stroke()}}
  ctx.restore()}
// the Cacciatrice's ponytail: a soft tapered lock of hair from the back of her head, hanging down behind the neck; it swings a little
function ponytail(Vh,h,Rh,S,nod,sw){const col=S.hair||S.hood,pts=[[-.9*Rh,0,.2*Rh],[-1.25*Rh,sw*.6,-.25*Rh],[-1.42*Rh,sw*1.3,-.85*Rh],[-1.4*Rh,sw*2,-1.45*Rh]].map(v=>hP(Vh,h,nod(v))),rs=[3.3,3.1,2.4,1.2];
  ctx.fillStyle=INK;for(let i=0;i<3;i++){hull(pts[i],rs[i]+1.3,pts[i+1],rs[i+1]+1.3);ctx.fill()}
  const bb=[1e9,1e9,-1e9,-1e9];for(const q of pts){bb[0]=Math.min(bb[0],q[0]-3);bb[1]=Math.min(bb[1],q[1]-3);bb[2]=Math.max(bb[2],q[0]+3);bb[3]=Math.max(bb[3],q[1]+3)}
  ctx.fillStyle=soft(bb[0]+(bb[2]-bb[0])*.3,bb[1]+(bb[3]-bb[1])*.2,(bb[0]+bb[2])/2,(bb[1]+bb[3])/2,Math.max(bb[2]-bb[0],bb[3]-bb[1])*.8,col,.2,.3);for(let i=0;i<3;i++){hull(pts[i],rs[i],pts[i+1],rs[i+1]);ctx.fill()}
  ctx.strokeStyle='rgba(90,50,10,.35)';ctx.lineWidth=.8;ctx.lineCap='round';line([lerp3([...pts[0],0],[...pts[1],0],.5).slice(0,2),pts[2],pts[3]]);ctx.stroke()}
// the Druid's antlers: two crooked branches of pale wood from the top of his head, each with two tines (as in the game, without buds)
function deerAntlers(Vh,h,Rh,nod){for(const sd of[-1,1]){const b0=nod([-.1*Rh,sd*.48*Rh,.78*Rh]),p1=add(b0,nod([-.4,sd*3.8,10])),p2=add(p1,nod([-.4,sd*6,5])),t1=add(lerp3(b0,p1,.7),nod([.3,-sd*4.6,6.6])),t2=add(lerp3(p1,p2,.45),nod([-.2,sd*1.2,6.5]));
  const L=[[b0,p1,p2],[lerp3(b0,p1,.7),t1],[lerp3(p1,p2,.45),t2]].map(l=>l.map(v=>hP(Vh,h,v)));ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle=INK;ctx.lineWidth=4.6;for(const l of L){line(l);ctx.stroke()}ctx.strokeStyle='#c9a26a';ctx.lineWidth=2.3;for(const l of L){line(l);ctx.stroke()}
  ctx.strokeStyle='rgba(255,240,210,.45)';ctx.lineWidth=.8;line(L[0]);ctx.stroke()}}
// the Witch's crown of branches: two crooked antlers from the top of the head, each with a fork, green buds at the tips (orange in her
// second phase). Drawn behind the head, so they grow out of it
function antlers(Vh,h,Rh,S,nod){const bud=S.p2?'#ff8a3c':'#7bbf4a';
  for(const sd of[-1,1]){const b0=nod([-.1*Rh,sd*.36*Rh,.86*Rh]),p1=add(b0,nod([-.6,sd*4.6,12.5])),p2=add(p1,nod([-.4,sd*5.8,4.6])),pb=lerp3(b0,p1,.7),pc=add(pb,nod([.4,-sd*4.6,7.8]));
    const L=[[b0,p1,p2],[pb,pc]].map(l=>l.map(v=>hP(Vh,h,v)));ctx.lineCap='round';ctx.lineJoin='round';
    ctx.strokeStyle=INK;ctx.lineWidth=5.2;for(const l of L){line(l);ctx.stroke()}ctx.strokeStyle='#7a5a3a';ctx.lineWidth=2.6;for(const l of L){line(l);ctx.stroke()}
    ctx.strokeStyle='rgba(255,230,190,.35)';ctx.lineWidth=.9;line(L[0]);ctx.stroke();
    ink(1.4);for(const v of[p2,pc]){const q=hP(Vh,h,v);shine(S.p2?'255,138,60':'123,191,74',q[0],q[1],6,.35);ctx.fillStyle=bud;ball(q,2.4);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.55)';ball([q[0]-.7,q[1]-.8],.7);ctx.fill()}}}
// the Ice Queen's tiara: five ice spikes on the front of the head (the middle one tallest), white to ice blue, a cold glow and a gem at
// the foot of the middle one (purple in her second phase). front: draw the spikes on our side (after the head) or the far ones (before)
function tiara(Vh,h,Rh,S,nod,front){const H=[7,10,14,10,7];
  for(let i=0;i<5;i++){const a=(i-2)*.6,out=nod([Math.cos(a),Math.sin(a),0]);if((Vh.F(out)>=-.05)!==front)continue;
    const b=nod(mul(nrm([Math.cos(a)*.6,Math.sin(a)*.6,.8]),Rh*.9)),up=nod([Math.cos(a)*.16,Math.sin(a)*.16,1]),sd=nod([-Math.sin(a),Math.cos(a),0]),hh=H[i];
    const q0=hP(Vh,h,add(b,mul(sd,-2.4))),q1=hP(Vh,h,add(b,mul(up,hh))),q2=hP(Vh,h,add(b,mul(sd,2.4)));
    shine('159,230,255',q1[0],(q1[1]+q0[1])/2,hh*.7,.22);const g=ctx.createLinearGradient(0,q1[1],0,Math.max(q0[1],q2[1]));g.addColorStop(0,'#ffffff');g.addColorStop(1,'#7fc8f0');
    ink(1.8);ctx.beginPath();ctx.moveTo(q0[0],q0[1]);ctx.lineTo(q1[0],q1[1]);ctx.lineTo(q2[0],q2[1]);ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=.8;seg([lerp(q0[0],q1[0],.2),lerp(q0[1],q1[1],.2)],[lerp(q0[0],q1[0],.8),lerp(q0[1],q1[1],.8)]);ctx.stroke()}
  if(front){const d=nod([.6,0,.8]),v=Vh.F(nrm(d));if(v>-.05){const q=hP(Vh,h,mul(nrm(d),Rh*.94)),c=S.p2?'#c48aff':'#5fd0ff';shine(S.p2?'196,138,255':'95,208,255',q[0],q[1],7,.5);ink(1.2);ball(q,2.2);ctx.fillStyle=c;ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ball([q[0]-.6,q[1]-.7],.6);ctx.fill()}}}
// the moss stick from the mouth: green, a glowing tip that brightens on each drag, a puff of smoke after it
function mossStick(Vh,h,Rh,md,dd,o,front){const a3=mul(md,Rh*.92),b3=add(a3,mul(dd,5.4)),A=sp(Vh,h,1,a3),B=sp(Vh,h,1,b3),t=G.t,inh=o.inhale||0,pulse=.72+.12*Math.sin(t*3.1)+.55*inh;
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=3.1;seg(A,B);ctx.stroke();ctx.strokeStyle=HC.moss;ctx.lineWidth=1.8;seg(A,B);ctx.stroke();
  ctx.fillStyle=HC.mossL;for(let i=1;i<3;i++){const q=[lerp(A[0],B[0],i/3),lerp(A[1],B[1],i/3)-.3];ball(q,.45);ctx.fill()}
  shine('150,255,90',B[0],B[1],(front?4.5:3.5)*pulse,(front?.55:.35)*pulse);ctx.fillStyle=inh>.3?'#f4ffc8':'#c9ff7a';ball(B,.95);ctx.fill();
  if(LOWFX)return;for(let k=0;k<3;k++){const q=(t*.42+k/3)%1;ctx.fillStyle=`rgba(185,238,150,${(1-q)*.3})`;ball([B[0]+q*2+Math.sin(t*2.1+k*2)*1.6*q,B[1]-1.5-q*12],.55+q*2);ctx.fill()}
  if(o.exhale>0){const e=o.exhale;for(let k=0;k<3;k++){const q=e*1.25-k*.14;if(q<=0||q>=1)continue;ctx.fillStyle=`rgba(190,240,160,${(1-q)*.34})`;ball([A[0]+2+q*7+Math.sin(q*5+k)*1.5,A[1]-1-q*13],1.3+q*4.5);ctx.fill()}}}

// the scarf (look acc 'sciarpa'): a soft knitted roll round the neck just under the head, one end hanging over the chest and swinging.
// near: the half on our side (drawn after the tunic, the head goes over it); else the far half (before the tunic, which hides it)
const SCARF_Z=11.5,SCARF_T0=-.55;
function scarf(V0,X,col,sw,near){const{P,F}=V0,z=ZB+SCARF_Z,r=radAt(SCARF_Z)+1.25,rt=1.75,N=36,pts=[];
  for(let i=0;i<=N;i++){const t=i/N*TAU,n=X.Rd([Math.cos(t),Math.sin(t),0]);pts.push({t,q:P(X.T([Math.cos(t)*r*AX,Math.sin(t)*r,z])),f:F(n)})}
  const runs=[];let cur=[];for(const p of pts){if((p.f>=0)===near)cur.push(p);else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
  // the roll: a thick round line (the same shape as a chain of capsules, in one go)
  ctx.lineCap='round';ctx.lineJoin='round';for(const[w,c] of[[rt+1.3,INK],[rt,col]]){ctx.strokeStyle=c;ctx.lineWidth=w*2;for(const r of runs){if(r.length<2)continue;line(r.map(p=>p.q));ctx.stroke()}}
  if(near){// the knit: darker ribs across the roll (all in one path), a light line along its top
    ctx.lineCap='round';for(const r of runs){ctx.strokeStyle=dk(col,.28);ctx.lineWidth=.8;ctx.beginPath();for(let i=1;i<r.length-1;i+=2){const q=r[i].q;ctx.moveTo(q[0]-.3,q[1]-rt*.8);ctx.lineTo(q[0]+.3,q[1]+rt*.8)}ctx.stroke();
      ctx.strokeStyle=lt(col,.35);ctx.lineWidth=.7;line(r.map(p=>[p.q[0],p.q[1]-rt*.55]));ctx.stroke()}
    // the end hanging down the front, when that side faces us
    const ft=F(X.Rd([Math.cos(SCARF_T0),Math.sin(SCARF_T0),0]));if(ft>.05){const t=SCARF_T0,b=[Math.cos(t)*r*AX+.4,Math.sin(t)*r,z-.6],
        T=[b,[b[0]+.9,b[1]-.5+sw*.4,b[2]-3.4],[b[0]+1.3,b[1]-.8+sw*.9,b[2]-6.6]].map(v=>P(X.T(v))),rs=[1.6,1.5,1.35];
      ctx.save();ctx.globalAlpha=cl((ft-.05)*5,0,1);ctx.fillStyle=INK;for(let i=0;i<2;i++){hull(T[i],rs[i]+1.3,T[i+1],rs[i+1]+1.3);ctx.fill()}ctx.fillStyle=col;for(let i=0;i<2;i++){hull(T[i],rs[i],T[i+1],rs[i+1]);ctx.fill()}
      ctx.strokeStyle=dk(col,.3);ctx.lineWidth=.9;for(const k of[.35,.7]){const q=[lerp(T[1][0],T[2][0],k),lerp(T[1][1],T[2][1],k)];ctx.beginPath();ctx.moveTo(q[0]-1.3,q[1]);ctx.lineTo(q[0]+1.3,q[1]);ctx.stroke()}
      ctx.strokeStyle=col;ctx.lineWidth=.8;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(T[2][0]+i*.8,T[2][1]+1);ctx.lineTo(T[2][0]+i*.9,T[2][1]+2.6);ctx.stroke()}ctx.restore()}}}

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
const QFL={arco_ricurvo:['#6cc24a','#b8e890'],arco_tuono:['#9fd4ff','#ffd84a'],arco_fenice:['#ff7a2a','#ffd86b']};
function quiverArrows(V0,X,jig,wid){const{P}=V0,b3=X.T(QB),t3=X.T(QT),ax=nrm(sub(t3,b3)),sideV=nrm(cross(ax,[0,0,1])),mouth=add(t3,mul(ax,.4)),QF=QFL[wid];
  const out=nrm(add(ax,[0,.12,0]));for(const[o,h,c] of[[-1.5,4.2,QF?QF[1]:HC.flW],[.2,5.4,QF?QF[0]:HC.fl],[1.6,4,QF?QF[1]:HC.flW]]){const a=add(mouth,mul(sideV,o)),tip=add(add(a,mul(out,h)),[0,0,jig*(o+2)*.15]),A=P(a),Tp=P(tip);
    ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.4;seg(A,Tp);ctx.stroke();ctx.strokeStyle='#c9a26a';ctx.lineWidth=1;ctx.stroke();
    const dx=Tp[0]-A[0],dy=Tp[1]-A[1],l=Math.hypot(dx,dy)||1,u=[dx/l,dy/l],n=[-u[1],u[0]];ctx.fillStyle=c;ink(1.2);ctx.beginPath();ctx.moveTo(Tp[0]+u[0]*1.2,Tp[1]+u[1]*1.2);ctx.lineTo(Tp[0]-u[0]*3.8+n[0]*2.3,Tp[1]-u[1]*3.8+n[1]*2.3);ctx.lineTo(Tp[0]-u[0]*2.6,Tp[1]-u[1]*2.6);ctx.lineTo(Tp[0]-u[0]*3.8-n[0]*2.3,Tp[1]-u[1]*3.8-n[1]*2.3);ctx.closePath();ctx.fill();ctx.stroke()}}

// ------------------------------------------------------------------ the armour bits you can see
// the mantello d'ombra: a purple cloak hanging from the shoulders round the back, its hem waving
function cape(V0,X,sway,col){const{P}=V0,top=[],bot=[],N=10;
  for(let i=0;i<=N;i++){const a=-1+2*i/N,t=Math.PI+a*1.8,ws=Math.sin(a*Math.PI*1.5+sway*2)*.8;
    top.push(P(X.T(surf(t,ZB+13.4-Math.abs(a)*1.6,.6).p)));
    const s=surf(t,ZB+.1,1.3+(1-Math.abs(a))*1.6+ws*.4).p;bot.push(P(X.T([s[0]-sway*.7,s[1],s[2]+(i%2?1:0)*1.1+ws*.4])))}
  const pts=top.concat(bot.reverse());ink(2.4);ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();
  let y0=1e9,y1=-1e9;for(const q of pts){y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}
  const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,col?lt(col,.12):'#6a54a0');g.addColorStop(.5,col||'#3a2c58');g.addColorStop(1,col?dk(col,.42):'#241a3a');ctx.fillStyle=g;ctx.fill();ctx.stroke();
  if(col){ctx.save();ctx.clip();ctx.strokeStyle=dk(col,.3);ctx.lineWidth=.8;for(let i=1;i<N;i+=3){const q=top[i],b=bot[N-i];ctx.beginPath();ctx.moveTo(q[0],q[1]+2);ctx.lineTo(b[0],b[1]-1);ctx.stroke()}ctx.restore();return}
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
    // after the release the bow arm, the body and the eyes relax quickly (dr) instead of jumping back in one frame
    const dr=rel<0?draw:Math.exp(-rel*25);A.draw=draw;A.grip=add(sh.grip,mul(sh.aim,1.4*dr+(rel>=0?.9*Math.exp(-rel*30)*Math.sin(rel*60):0)));A.aim=sh.aim;A.up=sh.up;
    const pin=k=>sub(sub(A.grip,mul(sh.aim,BK+1.6*k)),mul(sh.aim,PULL*k));
    if(rel<0)hand=pin(draw);else{const back=add(pin(1),[-.8,1.6,.9]);hand=rel<.1?lerp3(pin(1),back,ez(rel/.1)):rel<.36?lerp3(back,S0,ez((rel-.1)/.26)):S0}
    A.hR=hand;A.pinch=rel<0;A.twang=rel>=0&&rel<.16?1-rel/.16:0;A.rel=rel;
    A.lean=-.05*dr+(rel>=0?.13*(1-Math.exp(-rel*40))*Math.exp(-rel*12):0);A.B=[-.3*dr,0,0];A.s=.012*dr;A.hd=[.3,0,0];A.hp=.04;A.squint=dr>.5?(dr-.5)/.5:0;
    A.fL=[2.2,-5.2,0];A.fR=[-1,5,0];A.jig=rel>=0?.8*(1-Math.exp(-rel*40))*Math.exp(-rel*10):0}
  else if(anim==='dash'){// crouch, burst forward with the body stretched, a little hop, land and settle
    const K=[[0,[0,0,0,.02,0,0]],[.16,[-.6,0,-1.4,-.08,-.12,0]],[.34,[6,0,2.4,.4,.1,.2]],[.56,[8.4,0,1,.28,.02,.1]],[.72,[5,0,-.8,.04,-.08,0]],[.86,[1.6,0,.3,-.02,.03,0]],[1,[0,0,0,.02,0,0]]];
    const v=keys(K,p);A.B=[v[0],v[1],v[2]];A.lean=v[3];A.s=v[4];A.sx=v[5];A.hp=.06+v[3]*.2;A.hd=[0,0,-v[3]*1.2];
    const run=cl((p-.16)/.4,0,1),k=Math.sin(run*Math.PI);A.speed=p>.2&&p<.62?Math.sin((p-.2)/.42*Math.PI):0;A.dust=p>.14&&p<.5?(p-.14)/.36:-1;
    A.grip=add(REST.grip,[-2.6*k,0,1.2*k]);A.aim=nrm([.8,0,-.6+.35*k]);A.hR=add(REST.hR,[-5.5*k,.6*k,2.4*k]);
    A.fL=[.8+v[0]+lerp(0,-4,k),-5,k*3.4];A.fR=[.2+v[0]+lerp(0,3,k),5,k*1.6];A.jig=k*1.6;A.sway=-k*3;A.squint=k*.6}
  else if(anim==='sit'){// sitting on a log by the fire (the zombie menu; o.seat = the height of the seat): the body down on the seat, a
    // little back and leaning toward the fire, the feet on the ground in front, the hands on the knees. It breathes slowly and looks at the
    // fire; around .3 it lifts the head to the night, around .55 it rubs its hands toward the fire, around .8 it turns the head to one side
    // (the zombies far away) and back. One loop is long (the menu plays it in 9 s): every move fades in and out, so the loop has no jump
    const b=Math.sin(ph),seat=o&&o.seat!=null?o.seat:7.4,lk=win(p,.24,.42),rub=win(p,.48,.66),sd=win(p,.72,.92);
    A.B=[-1.6,0,seat-ZB+.14*b];A.lean=.15+.025*b-.08*lk;A.s=.016*b;A.roll=.02*Math.sin(ph+1);
    A.fL=[6.4,-4.6,0];A.fR=[7,4.3,0];A.hd=[.5,0,.18*b];A.hp=.16-.24*lk+.05*rub;A.hy=.06*Math.sin(ph*2)+.55*sd;
    const rb=Math.sin(p*TAU*14)*rub;A.hR=add(lerp3([6.6,5.2,8.2],[9.4,1.3,10.6],rub),[0,.9*rb,.2*b]);
    A.blink=Math.min(blink(p,.12,.035),blink(p,.6,.035),blink(p,.86,.035));A.inhale=0;A.exhale=0;A.jig=.2*b;A.sway=.4*b}
  else if(anim==='ripara'){// repairing a barrier on the zombie map (boards on a window, bars on a fence): leaning toward it, the left hand holds
    // the board against it, the right raises the hammer slowly and brings it down on the nail; one blow per loop (the game nails the board at
    // p = 1, the blow lands at .8-.92), a little nod and a squint on the blow
    const up=p<.8?ez(p/.8):p<.92?1-ez((p-.8)/.12):0,hit=p>=.86&&p<.98?1-Math.abs(p-.92)/.06:0,bb=Math.sin(ph);
    A.lean=.17+.02*hit;A.B=[1.2,0,-.5+.1*bb];A.s=-.02;A.hd=[.6,0,0];A.hp=.14+.06*hit;A.hy=0;A.blink=blink(p,.35,.1);A.squint=.5*hit;
    A.hL=[12.4,-3.6,14.4-.5*hit];A.hR=[9.4+2.4*(1-up),3.8,13.6+6.8*up];A.tool=lerp(-.55,1.6,up);A.fL=[2.4,-5.2,0];A.fR=[-.6,5,0];A.jig=.5*hit;A.sway=.3*hit}
  else if(anim==='hit'){// knocked back, eyes squeezed shut, a wobble back to standing
    const kb=p<.12?ez(p/.12):Math.exp(-(p-.12)*6)*Math.cos((p-.12)*16);A.lean=-.32*kb;A.B=[-2.6*kb,0,.4*kb];A.s=-.08*kb;A.roll=.05*kb;
    A.hd=[-.6*kb,0,.4*kb];A.hp=.06-.1*kb;A.shut=p<.5?1:0;A.mouth=p<.5?1:0;A.flash=p<.14?1-p/.14:0;A.stars=p<.75?1-p/.75:0;
    A.grip=add(REST.grip,[-1.6*kb,0,2.2*kb]);A.aim=nrm([.8,0,-.6+.3*kb]);A.hR=add(REST.hR,[-1.4*kb,1.6*kb,3.4*kb]);A.jig=kb*1.4;A.sway=kb*2}
  return A}

function mixPose(A,B,k){const M={...(k<.5?A:B)};for(const key of Object.keys(A)){const a=A[key],b=B[key];
    if(typeof a==='number'&&typeof b==='number'&&key!=='fly'&&key!=='rel')M[key]=lerp(a,b,k);else if(Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&typeof a[0]==='number')M[key]=a.map((v,i)=>lerp(v,b[i],k))}
  M.aim=nrm(M.aim);M.up=nrm(M.up);return M}
// ------------------------------------------------------------------ the weapon in the hands, in 3D (armi3d.js)
// The bows of the cards, the crossbow, the Druid's staff and the eight guns of the zombie mode are volumes seen by the hero's camera
// (ARMI3D). Which one: style.gun (a zombie gun: no quiver), held 'staff' (the staff: no quiver), held 'xbow' or the balestra card (the
// crossbow), else the bow of the card. How it is held (cls): 'one' a hand gun in the right hand, the left hand free at the side; 'long'
// the right hand on the grip and the left on the fore-grip (or on the pump, which it works); 'shoulder' the rocket launcher on the right
// shoulder; 'xbow' the crossbow like a long gun; 'staff' upright in the right hand, its foot near the ground, the orb beside the head.
const WCLS={tamburo:'long',lanciafiamme:'long',vapore:'long',risonatore:'long',pistola:'one',revolver:'one',mitraglietta:'long',mitra:'long',mitragliatrice:'long',pompa:'long',tattica:'long',lanciarazzi:'shoulder',balestra:'xbow',bastone:'staff',
  scettro:'staff',martello:'hammer',bomba:'one',liuto:'lute',fiala:'one',stellina:'one'};
// the size of each (1 = the units of the zombie guns' profiles, a little smaller than the game's 2D guns, which are drawn at 1.35)
const WSZ={tamburo:1.08,lanciafiamme:.9,vapore:.9,risonatore:1,pistola:1.22,revolver:1.1,mitraglietta:1.12,mitra:1,mitragliatrice:.92,pompa:.92,tattica:1.02,lanciarazzi:.95,balestra:1,bastone:.95,scettro:.95,martello:1,bomba:1,
  liuto:1.08,fiala:1,stellina:.82};
// rest: [the right hand (on the grip), pitch (down < 0), yaw (toward the middle < 0)] for standing and walking; aim: the same when it
// shoots; anc: a point of the weapon at rest, which gives it its place in the draw order (always the same, as for every part)
const HOLD={one:{rest:[[10,8.6,9.4],-.26,-.2],aim:[[12.6,9.4,12.8],0,-.04],anc:[14,8,9.5]},
  long:{rest:[[6.4,8.8,9.2],-.2,-.36],aim:[[5.6,9.2,12.2],0,-.02],anc:[11,7,9]},
  shoulder:{rest:[[2.6,8.9,11.1],-.07,0],aim:[[3.6,8.9,11.2],0,0],anc:[3,8.9,17]},
  xbow:{rest:[[8,8,9.2],-.2,-.26],aim:[[9,8.4,12.8],0,-.02],anc:[11,7,9.5]},
  staff:{rest:[[-3,12.6,14.4],[-.12,.12,1]],aim:[[8,9.6,13.2],[1,-.08,.45]],anc:[-3,13,16]},
  // the Fabbro's hammer: both hands on the handle at the right side, the head forward and down
  hammer:{rest:[[7.6,9.4,10.4],-.16,-.08],aim:[[9,9,12],0,-.04],anc:[13,9,10.5]},
  // the Bard's lute: across the belly, its neck up toward the left shoulder, the soundboard to the front (set in wpose0)
  lute:{rest:[[11,3.4,9.6],0,0],aim:[[11.4,3.2,10.2],0,0],anc:[12,3,9.8]}};
// (the guns are held at the right side of the body, so from behind they still show beside it, and from the front the gun pointing at
// us is beside the belly, not over it; the anchors are chosen so that from every side the weapon goes in front of the body when it is
// on the side we see, behind it when it is on the other side; the staff stands at the right side a little behind the middle, so its
// orb never covers the face)
// the shots of one 'shoot' cycle: n shots, the first at off; pump: when the pump goes back and forth after a shot (in parts of the time
// between two shots); rel: the reload after a shot (rocket, crossbow)
const FIRE={tamburo:{n:12,off:.02},lanciafiamme:{n:12,off:.02},vapore:{n:1,off:.08},risonatore:{n:1,off:.1},pistola:{n:3,off:.04},revolver:{n:2,off:.06},mitraglietta:{n:10,off:.02},mitra:{n:6,off:.03},mitragliatrice:{n:12,off:.02},
  pompa:{n:1,off:.08,pump:[.2,.56]},tattica:{n:2,off:.06,pump:[.3,.74]},lanciarazzi:{n:1,off:.12,rel:[.32,.78]},balestra:{n:1,off:.14,rel:[.36,.84]},bastone:{n:1,off:.3},
  scettro:{n:1,off:.3},martello:{n:1,off:.1},bomba:{n:1,off:.1},liuto:{n:1,off:.02},fiala:{n:1,off:.1},stellina:{n:1,off:.1}};
const KICK={tamburo:[.8,.05],lanciafiamme:[.5,.02],vapore:[2.2,.12],risonatore:[1.6,.1],pistola:[1.6,.12],revolver:[2.6,.32],mitraglietta:[.9,.05],mitra:[1.4,.07],mitragliatrice:[1.2,.04],pompa:[3,.2],tattica:[2.4,.18],lanciarazzi:[3.4,.14],balestra:[1.2,.08],bastone:[0,0],
  scettro:[0,0],martello:[0,0],bomba:[0,0],liuto:[0,0],fiala:[0,0],stellina:[0,0]};
// the new heroes' own things in the hand (style.held): the Bard's lute, the Alchemist's flask, the Ninja's star
const HELD3={liuto:1,fiala:1,stellina:1};
function weaponOf(S0){if(S0.held==='scettro'||S0.held==='martello'||S0.held==='bomba')return S0.held;if(S0.gun&&WCLS[S0.gun])return S0.gun;if(HELD3[S0.held])return S0.held;if(S0.held==='staff')return'bastone';if(S0.held==='xbow'||S0.weapon==='balestra')return'balestra';if(S0.held===null)return null;return'arco'}
const dirPY=(pitch,yaw)=>nrm([Math.cos(pitch)*Math.cos(yaw),Math.cos(pitch)*Math.sin(yaw),Math.sin(pitch)]);
const bump=k=>k<=0||k>=1?0:Math.sin(k*Math.PI);
// the lute: across the belly, the neck up toward the left shoulder, the soundboard to the front; the right hand strums (st.strum across
// the strings, -1..1), the left one holds the neck. The strum: .0-.12 the hand sweeps down across the strings (the notes fly out of the
// sound hole, only in 'shoot': in battle the game draws its own notes), then it comes back slowly and lifts again before the next one.
// In battle ('aim') the game's pull drives it, so the strum falls on the shot
function lutePose(W,A,anim,p,dg,o){const ph=p*TAU;let aim=[.2,-.86,.46],up=[1,.16,.08],strum=.25,ring=0,q=-1,cast=-1,g=[11,3.4,9.6];
  if(anim==='shoot')q=((p-.02)%1+1)%1;else if(anim==='aim')q=(cl(o.pull==null?1:o.pull,0,1)+.02)%1;
  if(anim==='idle'){g=add(g,[0,0,.18*Math.sin(ph)]);strum=.25+.08*Math.sin(ph)}
  if(anim==='walk'){g=add(g,[.4*Math.sin(ph),0,.35*Math.abs(Math.sin(ph))]);aim=add(aim,[0,0,.06*Math.sin(ph*2)])}
  if(anim==='dash'){const k=Math.sin(cl((p-.16)/.4,0,1)*Math.PI);aim=add(aim,[-.35*k,0,-.15*k]);g=add(g,[-2*k,0,1*k])}
  if(anim==='hit'){const kb=p<.12?ez(p/.12):Math.exp(-(p-.12)*6)*Math.cos((p-.12)*16);aim=add(aim,[-.3*kb,0,.15*kb]);g=add(g,[-1.4*kb,0,1.6*kb])}
  if(q>=0){g=[11.4,3.2,10.2];if(q<.12)strum=lerp(.95,-.95,ez(q/.12));else if(q<.8)strum=lerp(-.95,.25,ez((q-.12)/.68));else strum=lerp(.25,.95,ez((q-.8)/.2));
    ring=q<.6?1-q/.6:0;if(anim==='shoot'&&q<.5)cast=q;g=add(g,[0,0,q<.12?-.45*Math.sin(q/.12*Math.PI):0]);if(q<.2)W.lean=.05*Math.sin(q/.2*Math.PI)}
  W.grip=add(g,anim==='idle'||anim==='walk'?[0,0,0]:dg.map(v=>v*.3));W.aim=nrm(aim);W.up=nrm(up);W.st.strum=strum;W.st.ring=ring;W.cast=cast;W.rec=0;W.flash=0;W.shots=[];return W}
// where the weapon is and what its moving parts do, for this move at p (only p: the cycle closes on itself). It reuses the body of the
// bow's pose (A): breathing, steps, the dash, the knock back
function wpose0(A,anim,p,id,o){o=o||{};const cls=WCLS[id],H=HOLD[cls],dg=sub(A.grip,REST.grip),W={id,cls,s:WSZ[id],rec:0,flash:0,st:{},shots:[],ej:[],hL:[A.hR[0],-A.hR[1],A.hR[2]],kick:KICK[id]};
  const staff=cls==='staff';
  if(cls==='lute')return lutePose(W,A,anim,p,dg,o);
  // the flask and the star in battle ('aim' with the game's pull, 0 just after a shot .. 1 at the next): the throw ends on the shot
  if(anim==='aim'&&(id==='fiala'||id==='stellina')){const k=cl(o.pull==null?1:o.pull,0,1);p=(k+(id==='fiala'?.46:.4))%1+FIRE[id].off;anim='throw'}
  const set=(h,extra)=>{W.grip=add(h[0],extra||[0,0,0]);if(staff){W.aim=nrm(h[1]);W.up=[1,0,0]}else{W.aim=dirPY(h[1],h[2]);W.up=[0,0,1]}};
  if(anim!=='shoot'&&anim!=='aim'&&anim!=='throw'){set(H.rest,dg);
    const tilt=v=>{if(staff)W.aim=nrm(add(nrm(H.rest[1]),[v,0,0]));else W.aim=dirPY(H.rest[1]+v,H.rest[2])};
    if(anim==='walk')tilt(staff?.08*Math.sin(p*TAU):.05*Math.sin(p*TAU*2));
    if(anim==='dash')tilt((staff?-.5:.34)*Math.sin(cl((p-.16)/.4,0,1)*Math.PI));
    if(anim==='hit'){const kb=p<.12?ez(p/.12):Math.exp(-(p-.12)*6)*Math.cos((p-.12)*16);tilt((staff?-.4:.3)*kb)}
    if(id==='bastone'||id==='scettro')W.st.glow=.6+.25*Math.sin(p*TAU);if(id==='martello')W.st.hot=o.hot||0;
    return W}
  // aiming and shooting: the aim hold, breathing a little
  set(H.aim,[0,0,.15*Math.sin(p*TAU)]);if(anim==='aim'){if(id==='bastone')W.st.glow=.8;
    // the crossbow follows the game's pull: the string goes back to the nut and the new bolt drops in before the next shot
    if(id==='balestra'&&o.pull!=null){const k=cl(o.pull,0,1);W.st.draw=k;W.st.bolt=k>.45}return W}
  const F=FIRE[id],T=1/F.n,q=((p-F.off)%1+1)%1,k=Math.floor(q/T),u=q-k*T,un=u/T;W.k=k;W.u=u;W.T=T;W.q=q;
  // the recoil: back along the aim and the muzzle up, quick for the automatic guns; the flash
  const dec=F.n>=6?T*.42:F.n>=2?.07:.09;W.rec=Math.exp(-u/dec);W.flash=cl(1-u/Math.min(T*.55,.06),0,1);
  if(id==='pistola'||id==='mitraglietta'||id==='mitra')W.st.slide=Math.exp(-u/(dec*.8));
  if(id==='revolver'){W.st.hammer=cl(un*1.8-.2,0,1);W.st.cyl=(k+ez(cl(un/.35,0,1)))/6}
  if(id==='mitragliatrice'){W.st.spin=p*TAU*3;W.st.feed=((k+ez(cl(un*3,0,1)))/3)%1}
  if(F.pump){const[a,c]=F.pump;W.st.pump=bump((un-a)/(c-a))}
  // the spent cases in the air (their age, from when they leave the gun): at the shot, or when the pump goes back
  const ejAt=F.pump?(F.pump[0]+F.pump[1])/2*T:0,ejOn=id!=='revolver'&&id!=='lanciarazzi'&&id!=='balestra'&&id!=='bastone';
  if(ejOn)for(let j=0;j<4;j++){const e=u+j*T-ejAt;if(e>=0&&e<.34)W.ej.push(e)}
  // the shots still flying (their age), for the bullets, the smoke, the bolt, the leaves
  for(let j=0;j<3;j++){const a=u+j*T;if(a<.5)W.shots.push(a)}
  // reloads: the rocket pushed into the tube by the left hand; the crossbow's string pulled back to the nut by the right hand
  const ph=(a,c,inn,out)=>q>=a-inn&&q<a?{ph:1,t:(q-a+inn)/inn}:q>=a&&q<c?{ph:2,t:(q-a)/(c-a)}:q>=c&&q<c+out?{ph:3,t:(q-c)/out}:null;
  if(id==='lanciarazzi'){const[a,c]=F.rel;W.st.loaded=q<a?0:q<c?ez((q-a)/(c-a)):1;W.load=ph(a,c,.1,.1)}
  if(id==='balestra'){const[a,c]=F.rel;W.st.draw=q<.02?1-q/.02:q<a?0:q<c?ez((q-a)/(c-a)):1;W.st.bolt=q>=c+.05||q<.004;W.pull=ph(a,c,.1,.12)}
  if(id==='scettro'&&o.staffMove==='summon'){// the summoning: the staff goes up high and stays there while the orb flares, the free hand
    // rises too, then both come down
    const r0=H.rest,UP=[[1.2,10.6,21.5],[.1,.04,1]],k=q<.22?ez(q/.22):q<.78?1:1-ez((q-.78)/.22);
    W.grip=lerp3(r0[0],UP[0],k);W.aim=nrm(lerp3(nrm(r0[1]),nrm(UP[1]),k));W.up=[1,0,0];W.st.glow=.75+1.1*k+(q>.22&&q<.78?.25*Math.sin(q*TAU*6):0);
    W.hL=lerp3(W.hL,[2.5,-10.5,19.5],k);W.flash=0;W.cast=-1;W.summon=q>.18&&q<.82?(q-.18)/.64:-1;W.rec=0;W.shots=[];return W}
  if(id==='martello'){const r0=H.rest,RG=r0[0],RA=dirPY(r0[1],r0[2]);W.rec=0;W.flash=0;W.shots=[];
    if(o.hammerMove==='forge'){// raised high over the head, glowing like the forge, then down again
      const k=q<.25?ez(q/.25):q<.75?1:1-ez((q-.75)/.25);W.grip=lerp3(RG,[1.5,7.5,25],k);W.aim=nrm(lerp3(RA,nrm([.18,-.05,1]),k));W.up=[1,0,0];
      W.st.hot=Math.max(o.hot||0,k*(.75+.25*Math.sin(q*TAU*5)));W.lean=-.06*k;W.impact=-1;return W}
    // the slam: .0-.38 winds up over the right shoulder, .38-.47 smashes down in front, .47 the blow, .47-.62 holds, .62-1 lifts it back
    const WG=[-3,8.6,23.5],WA=nrm([-.42,.08,.9]),SG=[12.5,6,10.5],SA=nrm([.96,-.04,-.28]);let g,d,ln=0,bd=[0,0,0];
    if(q<.38){const k=ez(q/.38);g=lerp3(RG,WG,k);d=nrm(lerp3(RA,WA,k));ln=-.12*k;bd=[-1*k,0,0]}
    else if(q<.47){const k=(q-.38)/.09,kk=k*k;g=lerp3(WG,SG,kk);d=nrm(lerp3(WA,SA,kk));ln=lerp(-.12,.16,kk);bd=[lerp(-1,1.4,kk),0,0]}
    else if(q<.62){g=SG;d=SA;ln=.16;bd=[1.4,0,-.4]}
    else{const k=ez((q-.62)/.38);g=lerp3(SG,RG,k);d=nrm(lerp3(SA,RA,k));ln=.16*(1-k);bd=[1.4*(1-k),0,-.4*(1-k)]}
    W.grip=g;W.aim=nrm(d);W.up=[0,0,1];W.st.hot=Math.max(o.hot||0,q<.47?ez(cl(q/.38,0,1))*.6:.6*(1-cl((q-.47)/.3,0,1)));
    W.impact=q>=.47?q-.47:-1;W.lean=ln;W.body=bd;W.sq=q>=.47&&q<.56?-.06*Math.sin((q-.47)/.09*Math.PI):0;return W}
  if(id==='stellina'){// the throw: .0-.28 the star goes back across the chest to the left shoulder, .28-.4 the arm whips across, .38 it
    // leaves the hand and flies straight on, spinning; a new one is in the hand at .75
    const r0=H.rest,RG=r0[0],RA=dirPY(r0[1],r0[2]),BG=[4.5,-3.5,15.5],BA=nrm([-.25,-1,.25]),TG=[15.5,5.5,12.6],TA=nrm([1,.35,0]);let g,d,ln=0;
    if(q<.28){const k=ez(q/.28);g=lerp3(RG,BG,k);d=nrm(lerp3(RA,BA,k));ln=-.07*k}
    else if(q<.4){const k=(q-.28)/.12;g=lerp3(BG,TG,k);d=nrm(lerp3(BA,TA,k));ln=lerp(-.07,.11,k)}
    else{const k=ez(cl((q-.4)/.35,0,1));g=lerp3(TG,RG,k);d=nrm(lerp3(TA,RA,k));ln=.11*(1-k)}
    W.grip=g;W.aim=d;W.up=[0,0,1];W.st.has=q<.38?1:q<.75?0:ez(cl((q-.75)/.1,0,1));W.cast=anim==='shoot'&&q>=.38?q-.38:-1;W.rel=TG;W.lean=ln;W.rec=0;W.flash=0;W.shots=[];return W}
  if(id==='bomba'||id==='fiala'){// the throw: .0-.36 the bomb goes back over the shoulder, .36-.46 the arm swings forward, .44 it leaves the hand and flies
    // on in an arc; a new one pops into the hand at .8 (the Alchemist's flask the same, a little lower)
    const r0=H.rest,RG=r0[0],RA=dirPY(r0[1],r0[2]),BG=[-5,9.5,21],BA=nrm([-.3,0,1]),TG=[14,6.6,16.5],TA=nrm([1,0,.3]);let g,d,ln=0;
    if(q<.36){const k=ez(q/.36);g=lerp3(RG,BG,k);d=nrm(lerp3(RA,BA,k));ln=-.1*k}
    else if(q<.46){const k=(q-.36)/.1;g=lerp3(BG,TG,k);d=nrm(lerp3(BA,TA,k));ln=lerp(-.1,.12,k)}
    else{const k=ez(cl((q-.46)/.4,0,1));g=lerp3(TG,RG,k);d=nrm(lerp3(TA,RA,k));ln=.12*(1-k)}
    W.grip=g;W.aim=d;W.up=[0,0,1];W.st.has=q<.44?1:q<.8?0:ez(cl((q-.8)/.12,0,1));W.cast=q>=.44&&(id==='bomba'||anim==='shoot')?q-.44:-1;W.rel=TG;W.lean=ln;W.rec=0;W.flash=0;W.shots=[];return W}
  if(id==='bastone'||id==='scettro'){// the cast: the staff goes up high (the orb above the head, brighter), strikes forward (the orb flares, leaves
    // burst out), holds a moment, then goes back to the side
    const r0=H.rest,r1=H.aim,UP=[[-.6,11.4,18.6],[0,.06,1]];let g,d;
    if(q<.24){const k=ez(q/.24);g=lerp3(r0[0],UP[0],k);d=lerp3(nrm(r0[1]),nrm(UP[1]),k)}
    else if(q<.32){const k=ez((q-.24)/.08);g=lerp3(UP[0],r1[0],k);d=lerp3(nrm(UP[1]),nrm(r1[1]),k)}
    else if(q<.5){g=r1[0];d=r1[1]}
    else if(q<.86){const k=ez((q-.5)/.36);g=lerp3(r1[0],r0[0],k);d=lerp3(nrm(r1[1]),nrm(r0[1]),k)}
    else{g=r0[0];d=r0[1]}
    W.grip=g;W.aim=nrm(d);W.up=[1,0,0];W.st.glow=q<.24?.7+.6*ez(q/.24):q<.32?1.3:q<.5?1.7-(q-.32)/.18*.8:.75;
    W.flash=q>=.3?cl(Math.min((q-.3)/.02,1-(q-.32)/.1),0,1):0;W.cast=q>=.32?q-.32:-1;W.rec=0;W.shots=[]}
  return W}
// the gun of a match (o.gp = ARMI.nuova(id).pose(), on the zombie map): its own recoil, flash and moving parts (slide, hammer and cylinder,
// barrels and belt, pump, shells on the saddle, rocket) in place of the test cycle of 'shoot', and its reload (below)
function realGun(W,g,id){W.rec=cl(g.rec||0,0,1);W.flash=cl(g.flash||0,0,1);W.shots=[];W.ej=[];const s=W.st;
  if(id==='pistola'||id==='mitraglietta'||id==='mitra'||id==='tamburo')s.slide=g.slide||0;
  // the pistol's slide stays back after the last round, until the reload lets it go
  if(id==='pistola'&&g.n===0&&g.st!=='ricarica')s.slide=1;
  if(id==='revolver'){s.hammer=g.hammer==null?1:cl(g.hammer,0,1);s.cyl=g.cyl||0}
  if(id==='mitragliatrice'){s.spin=g.spin||0;s.feed=g.feed||0}
  if(id==='pompa'||id==='tattica')s.pump=g.pump||0;if(id==='tattica'&&g.saddle!=null)s.saddle=g.saddle;
  if(id==='lanciarazzi'){s.loaded=g.loaded==null?1:g.loaded;W.load=null}
  reloadPose(W,g,id);if(!W.rl&&g.eq!=null&&g.eq<1)drawPose(W,g.eq,id)}
// the gun just taken: it comes up from low at the side (pointing down and back) to its hold, then the free hand works it once: the slide
// or the bolt, the pump, the cylinder's turn, the rocket's tube (ARMI.EQR: when it clicks)
const HOLST={one:[[1.5,10,7.5],-1.25,.35],long:[[.5,9.5,7.5],-1.05,.55],shoulder:[[-3,8,12],-.9,.3]};
function drawPose(W,e,id){const H=HOLST[W.cls];if(!H)return;const k=ez(cl(e/.55,0,1)),A0=dirPY(H[1],H[2]);
  W.grip=lerp3(H[0],W.grip,k);W.aim=nrm(lerp3(A0,W.aim,k));const r=typeof ARMI!=='undefined'&&ARMI.EQR||.74,w=tzw(e,.5,r-.06,r,.98);
  if(w>0)W.rl={kind:'draw',e,b:w};const s=W.st;
  if(id==='pistola'||id==='mitraglietta'||id==='mitra'||id==='tamburo')s.slide=Math.max(s.slide||0,bump((e-(r-.12))/.24));
  if(id==='pompa'||id==='tattica')s.pump=Math.max(s.pump||0,bump((e-(r-.14))/.26));
  if(id==='revolver')s.cyl=(s.cyl||0)+ez(cl((e-.55)/.3,0,1))/6;
  if(id==='mitragliatrice')s.spin=(s.spin||0)+ez(cl((e-.5)/.4,0,1))*TAU*.5}
// ------------------------------------------------------------------ the reload of the zombie guns (Denis, 14 ottobre: «miglioriamo le
// animazioni delle pistole, cioè la ricarica»). The gun comes in front of the chest, its muzzle up and turned on its side toward the free
// hand, and the head looks down at it. The free hand takes the magazine out (it falls: the map throws it on the floor), fetches a new one
// at the belt, pushes it in and pulls the slide or the bolt; the revolver swings its cylinder out, throws out the six cases, takes six
// rounds one by one and snaps shut; the shotguns take one shell at a time at the belt (the tactical one from its saddle) and push it
// into the loading port; the rocket comes from the belt and is pushed into the tube. All of it follows the gun's own state: k = pose().rk
// (0..1 along the reload) or the shell's f = pose().shell, with the moments of ARMI.RLT, the same for the 2D guns and the sounds.
const tzw=(k,a,b,c,d)=>k<=a||k>=d?0:k<b?ez((k-a)/(b-a)):k<=c?1:1-ez((k-c)/(d-c));
// the reload hold of each kind: [the right hand, pitch, yaw, roll (the top of the gun to the right, its bottom toward the free hand)]
const RLP={one:[[9.6,3.4,12.6],.5,-.62,.55],long:[[5.8,6.2,11.4],.3,-.5,.62],
  revolver:[[10.6,2.8,10.8],0,-.62,.5],mitragliatrice:[[5.4,6.6,10.8],.14,-.36,.4],lanciafiamme:[[9.6,5,10.4],.12,-.22,.4],vapore:[[8.4,5.4,10.8],.2,-.34,.5],pompa:[[5.4,6,11.6],.24,-.46,.95],tattica:[[5.8,6,11.8],.26,-.5,.95]};
// where the free hand takes a new magazine, shell or rocket: a pouch on the belt, in front and a little to the right (the hero's frame)
const POUCH=[9.4,2.4,9.2];
function reloadPose(W,g,id){const T=typeof ARMI!=='undefined'&&ARMI.RLT,sh=id==='pompa'||id==='tattica',k=g.rk==null?-1:g.rk,s=W.st;if(!T||W.cls==='staff')return;
  let R=null;
  if(sh){if(!(g.tilt>0))return;R={kind:'shell',b:cl(g.tilt/.16,0,1),f:g.shell!=null&&g.shell>=0?g.shell:-1}}
  else{if(k<0)return;
    if(id==='revolver'){const V=T.rev;R={kind:'rev',k,b:tzw(k,-1,0,.92,1)*ez(cl(k/.06,0,1))};
      s.swing=k<V.open[0]?0:k<V.open[1]?ez((k-V.open[0])/(V.open[1]-V.open[0])):k<V.shut[0]?1:k<V.shut[1]?1-ez((k-V.shut[0])/(V.shut[1]-V.shut[0])):0;
      s.eject=k<V.eject[0]?0:k<V.eject[1]?ez((k-V.eject[0])/(V.eject[1]-V.eject[0])):k<V.eject[1]+.012?1:0;
      const n=(k-V.load[0])/(V.load[1]-V.load[0])*6,i=Math.floor(n),u=n-i;
      s.rounds=k<V.eject[1]+.012?6:k<V.load[0]?0:k>=V.load[1]?6:Math.min(6,i+(u>=.6?1:0));if(k>=V.load[0]&&k<V.load[1]&&u<.6)s.roundIn=ez(u/.6);
      R.n=n;R.pit=.55*tzw(k,.1,.15,.2,.25)-.3*tzw(k,.23,.3,.8,.88)}
    else if(id==='lanciarazzi'){R={kind:'rocket',k,b:tzw(k,0,.14,.84,1)}}
    else{const M=T.mag;R={kind:'mag',k,b:tzw(k,0,.1,M.done-.04,1)};
      // the magazine seating and the slide going home jolt the gun a little
      R.pit=.06*Math.exp(-Math.max(0,k-M.seat)*60)*(k>=M.seat?1:0)+.05*Math.exp(-Math.max(0,k-M.fwd)*60)*(k>=M.fwd?1:0);
      // the pistol emptied: its slide stays back until the hand lets it go
      if(id==='pistola'&&g.empty)s.slide=k<M.fwd?1:Math.max(0,1-(k-M.fwd)/.04);
      if(id==='lanciafiamme')s.glow=k<M.out?.8*(1-k/M.out):k<M.seat?0:Math.min(1,(k-M.seat)/(M.done-M.seat))*.9;
      if(id==='vapore'){s.valve=k>=M.rack?ez(cl((k-M.rack)/(M.done-M.rack),0,1))*Math.PI*1.5:0;s.gauge=k<M.rack?.1:.1+.6*ez(cl((k-M.rack)/(M.done-M.rack),0,1))}
      if(id==='tamburo')s.key=k>=M.seat?ez(cl((k-M.seat)/(M.rack-M.seat),0,1))*Math.PI*2:0}}
  W.rl=R;const P=RLP[id]||RLP[W.cls];if(!P||!R.b)return;
  // the gun goes to its reload hold (the rocket stays on the shoulder, its muzzle up a little)
  const b=R.b,A0=dirPY(P[1]+(R.pit||0),P[2]),U0=nrm(sub([0,0,1],mul(A0,A0[2]))),Z0=cross(U0,A0),U=nrm(add(mul(U0,Math.cos(P[3])),mul(Z0,Math.sin(P[3]))));
  W.grip=lerp3(W.grip,P[0],b);W.aim=nrm(lerp3(W.aim,A0,b));W.up=nrm(lerp3(W.up,U,b))}
{const _rp=reloadPose;reloadPose=function(W,g,id){_rp(W,g,id);if(id==='lanciarazzi'&&W.rl){const b=W.rl.b,pt=Math.asin(cl(W.aim[2],-1,1)),yw=Math.atan2(W.aim[1],W.aim[0]);W.aim=dirPY(pt+.16*b,yw)}}}
// where the free hand is during the reload, in the gun's own frame, and what it carries: it sets st (the magazine in the hand, the shell,
// the rocket) for the gun's drawing. kp: the gun's key points for this state (ARMI3D.keys); loc(q): a point of the hero's frame in the
// gun's frame; S: where the hand is when it is not reloading (on the fore-grip or the pump, or at the side)
function reloadHand(R,st,kp,loc,S){const T=ARMI.RLT,E=ez,L3=(a,b,t)=>lerp3(a,b,E(cl(t,0,1))),Pq=loc(POUCH);let H=S;
  if(R.kind==='mag'&&kp.magSeat){const M=T.mag,k=R.k,MS=kp.magSeat,at=m=>add(MS,mul(kp.magDir,kp.magLen*m)),rk=kp.rack||MS;
    if(k<M.out)H=L3(S,MS,k/M.out);
    else if(k<M.drop){const m=E((k-M.out)/(M.drop-M.out))*.6;st.mag=m;H=at(m)}
    else if(k<M.pouch){st.magOff=true;H=L3(at(.6),Pq,(k-M.drop)/(M.pouch-M.drop))}
    else if(k<M.well){H=L3(Pq,at(1),(k-M.pouch)/(M.well-M.pouch));st.magAt=sub(H,MS)}
    else if(k<M.push){st.mag=1;H=at(1)}
    else if(k<M.seat){const m=1-E((k-M.push)/(M.seat-M.push));st.mag=m;H=at(m)}
    else if(k<M.rack)H=L3(MS,rk,(k-M.seat)/(M.rack-M.seat));
    else if(k<M.done)H=rk;
    else H=L3(rk,S,(k-M.done)/(1-M.done))}
  else if(R.kind==='rev'){const V=T.rev,k=R.k,side=kp.cylSide,rod=kp.rod,ch=kp.chs,at=(i,r)=>add(ch[Math.max(0,Math.min(5,i))],[-(1-r)*3.2-2.4,0,0]);
    if(k<V.open[0]+.02)H=L3(S,side,k/(V.open[0]+.02));
    else if(k<V.eject[0])H=side;
    else if(k<V.eject[0]+.02)H=L3(side,rod,(k-V.eject[0])/.02);
    else if(k<V.eject[1]+.012)H=rod;
    else if(k<V.load[0])H=L3(rod,Pq,(k-V.eject[1]-.012)/(V.load[0]-V.eject[1]-.012)*1.6);
    else if(k<V.load[1]){const i=Math.floor(R.n),u=R.n-i;H=u<.6?at(i,E(u/.6)):L3(at(i,1),at(i+1,0),(u-.6)/.4);if(i===0&&u<.6)H=L3(Pq,H,u/.25)}
    else if(k<V.shut[0])H=L3(at(5,1),side,(k-V.load[1])/(V.shut[0]-V.load[1]));
    else if(k<V.shut[1])H=side;
    else H=L3(side,S,(k-V.shut[1])/(1-V.shut[1]))}
  else if(R.kind==='shell'&&kp.port){const f=R.f,po=kp.port,j=Math.max(0,Math.min(3,(st.saddle==null?4:st.saddle)-1)),pick=kp.sad?kp.sad[j]:Pq,
      UND=add(po,[-2.6,-3.6,0]),INN=add(po,[1.6,1.1,0]),HO=[-1.2,-2,-.6],hand=b=>add(b,HO);
    if(f<0)H=hand(INN);
    else if(f<.3)H=L3(hand(INN),pick,f/.3);
    else if(f<.55){H=L3(pick,hand(UND),(f-.3)/.25);st.shellAt=sub(H,HO);if(kp.sad&&st.saddle>0)st.saddle--}
    else if(f<.8){const t=E((f-.55)/.25),b=lerp3(UND,INN,t);st.shellAt=b;st.shellIn=t;H=hand(b);if(kp.sad&&st.saddle>0)st.saddle--}
    else H=hand(INN);
    H=lerp3(S,H,R.b)}
  else if(R.kind==='draw'){const rk=kp.rack||kp.cylSide||kp.sup;if(rk)H=lerp3(S,rk,R.b)}
  else if(R.kind==='rocket'&&kp.rocket){const k=R.k,F0=[27.6,3.9,0];
    if(k<.15)H=L3(S,Pq,k/.15);
    else if(k<.3){H=L3(Pq,F0,(k-.15)/.15);st.rocketAt=sub(H,F0)}
    else if(k<.85)H=kp.rocket;
    else H=L3(kp.rocket,S,(k-.85)/.12)}
  return H}
function wpose(A,anim,p,id,o){const W=wpose0(A,anim,p,id,o);if(o&&o.gp&&typeof ARMI3D!=='undefined'&&ARMI3D.ZOMBIE.includes(id))realGun(W,o.gp,id);return W}
// a muzzle flash of the zombie guns (ARMI.vampa, drawn in the gun's own plane) at the gun's point pt, k 1 .. 0
function flashFx(K,id,pt,k,seed,back){if(k<=0||typeof ARMI==='undefined')return;K.fx(pt,q=>{const b=K.P(K.W(add(pt,[1,0,0]))),dx=b[0]-q[0],dy=b[1]-q[1],l=Math.hypot(dx,dy)/K.s;
  ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(Math.atan2(dy,dx));ctx.scale(K.s*Math.max(.5,l),K.s);try{ARMI.vampa(back?'retro':id,0,0,k,seed)}catch(e){}ctx.restore()},back?-.5:1.4)}
// a crossbow bolt in flight (like arrow(), steel with blue vanes)
function boltFx(V0,a3,b3,al){if(al<=.02)return;const{P}=V0,A=P(a3),B=P(b3),dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy)||1,u=[dx/l,dy/l],n=[-u[1],u[0]];ctx.save();ctx.globalAlpha=al;
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.6;seg(A,B);ctx.stroke();ctx.strokeStyle='#dfe4ea';ctx.lineWidth=1.2;seg(A,B);ctx.stroke();
  ink(.9);ctx.fillStyle='#c9cfd6';ctx.beginPath();ctx.moveTo(B[0]+u[0]*3,B[1]+u[1]*3);ctx.lineTo(B[0]+n[0]*1.5,B[1]+n[1]*1.5);ctx.lineTo(B[0]-n[0]*1.5,B[1]-n[1]*1.5);ctx.closePath();ctx.fill();ctx.stroke();
  for(const sd of[1,-1]){ctx.fillStyle='#4d97ff';ctx.beginPath();ctx.moveTo(A[0]+u[0],A[1]+u[1]);ctx.lineTo(A[0]+u[0]*3.4+n[0]*sd*.4,A[1]+u[1]*3.4+n[1]*sd*.4);ctx.lineTo(A[0]+n[0]*sd*2,A[1]+n[1]*sd*2);ctx.closePath();ctx.fill();ctx.stroke()}ctx.restore()}

// the weapon (with its hands and its effects) as one part of the hero, and the free hand at the side
function weaponParts(parts,V0,X,S,Wp,wid,o){const{D}=V0,cls=Wp.cls,r=Wp.rec,kk=Wp.kick||[0,0],fx=!o.noFx;
  // the recoil: the weapon goes back along its aim and the muzzle goes up, round the hand
  let aimB=Wp.aim,upB=Wp.up;if(r>0&&kk[1]){const th=kk[1]*r,c=Math.cos(th),sn=Math.sin(th);[aimB,upB]=[add(mul(aimB,c),mul(upB,sn)),sub(mul(upB,c),mul(aimB,sn))]}
  const g3=X.T(sub(Wp.grip,mul(Wp.aim,kk[0]*r*.55))),fr=ARMI3D.frame(g3,nrm(X.Rd(aimB)),nrm(X.Rd(upB)),Wp.s);
  // the hammer's blow: a ring of dust and a few sparks on the floor under its head; the bomb flying on after the throw
  if(wid==='martello'&&fx&&Wp.impact>=0&&Wp.impact<.32&&!LOWFX){const fc=add(fr.O,mul(add(mul(fr.X,20.7),mul(fr.Y,-9)),fr.s)),gp=[fc[0],fc[1],0],k=Wp.impact/.32;
    parts.push({d:D(gp)+3,f:()=>{const q=V0.P(gp);ctx.save();ctx.globalAlpha=(1-k)*.8;ctx.strokeStyle='rgba(220,205,175,.9)';ctx.lineWidth=2.4*(1-k)+.6;ctx.beginPath();ctx.ellipse(q[0],q[1],6+k*26,(6+k*26)*.45*KR(),0,0,TAU);ctx.stroke();
      for(let i=0;i<6;i++){const a=i/6*TAU+.4,r=4+k*22;ctx.fillStyle=`rgba(225,210,180,${(.5*(1-k)).toFixed(3)})`;ball([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.45-k*6],2+k*3.5);ctx.fill()}
      for(let i=0;i<4;i++){const a=-Math.PI/2+(i-1.5)*.5,r=k*20;ctx.fillStyle=i%2?'#ffd86b':'#ff8a3c';ball([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r-k*k*-8],1.3*(1-k)+.3);ctx.fill()}ctx.restore()}})}
  if(wid==='fiala'&&fx&&Wp.cast>=0&&Wp.cast<.36){const k=Wp.cast/.36,a0=X.T(Wp.rel),fw=X.Rd([1,0,0]),c=add(add(a0,mul(fw,k*46)),[0,0,Math.sin(k*Math.PI)*16-k*10]);
    parts.push({d:D(c),f:()=>{const q=V0.P(c);flaskShape(q[0],q[1],2.6,k*9,S.flask||'#7bf06a')}})}
  if(wid==='stellina'&&fx&&Wp.cast>=0&&Wp.cast<.3){const k=Wp.cast/.3,a0=X.T(Wp.rel),fw=X.Rd(nrm([1,.1,0])),c=add(a0,mul(fw,k*72));
    parts.push({d:D(c),f:()=>{const q=V0.P(c);ctx.save();ctx.globalAlpha=k>.75?(1-k)/.25:1;if(!LOWFX){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1.2;const b=V0.P(sub(c,mul(fw,10)));seg(b,q);ctx.stroke()}starShape(q[0],q[1],3.4,k*26,'#8a96a4');ctx.restore()}})}
  if(wid==='liuto'&&fx&&Wp.cast>=0)for(let i=0;i<3;i++){const k=Wp.cast/.5-i*.14;if(k<0||k>=1)continue;const c=X.T(add(Wp.grip,[4+k*13,(i-1)*4.5*k,3+k*13+Math.sin(k*6+i)*1.6]));
    parts.push({d:D(c),f:()=>{const q=V0.P(c);ctx.save();ctx.globalAlpha=k<.15?k/.15:1-Math.max(0,(k-.6)/.4);musicNote(q[0],q[1],1.9,NOTE_COL[i%3],i===1?1:0);ctx.restore()}})}
  if(wid==='bomba'&&fx&&Wp.cast>=0&&Wp.cast<.36){const k=Wp.cast/.36,a0=X.T(Wp.rel),fw=X.Rd([1,0,0]),c=add(add(a0,mul(fw,k*48)),[0,0,Math.sin(k*Math.PI)*14-k*9]);
    parts.push({d:D(c),f:()=>{const q=V0.P(c),r=4.8;ink(2.2);ball(q,r);ctx.fillStyle=soft(q[0]-r*.36,q[1]-r*.42,q[0],q[1],r*1.2,'#2e2e36',.3,.4);ctx.fill();ctx.stroke();
      const f=[q[0]+1.4,q[1]-r-1.6];ctx.strokeStyle='#8a6a44';ctx.lineWidth=1.4;seg([q[0],q[1]-r+.4],f);ctx.stroke();shine('255,200,90',f[0],f[1],6,.85);ctx.fillStyle='#fff3c0';ball(f,1.1);ctx.fill()}})}
  // the reload: where the free hand goes and what it carries (the gun's key points for this state, the hero's points in the gun's frame)
  const st={...Wp.st};if(wid==='balestra')st.col=S.bowCol;if(wid==='fiala')st.col=S.flask;if(wid==='bastone'||wid==='scettro')st.orbCol=S.eyeCol||'#9fff7a';
  let RH=null,kp0=null;if(Wp.rl&&ARMI3D.keys&&typeof ARMI!=='undefined'&&ARMI.RLT){kp0=ARMI3D.keys(wid,st);
    const loc=q=>{const d=sub(X.T(q),fr.O);return[dot(d,fr.X)/fr.s,dot(d,fr.Y)/fr.s,dot(d,fr.Z)/fr.s]};RH=reloadHand(Wp.rl,st,kp0,loc,kp0.sup||loc(Wp.hL))}
  parts.push({d:D(X.T(HOLD[cls].anc)),f:()=>{
    ARMI3D.draw(wid,V0,fr,st,(K,kp)=>{
      // where the magazine is when it falls (the zombie map throws it on the floor from there): on the screen, and the floor under it
      if(o.out&&kp0&&kp0.magSeat&&Wp.rl.kind==='mag'){const q=K.W(add(kp0.magSeat,mul(kp0.magDir,kp0.magLen*.6)));o.out.mag=K.P(q);o.out.magFloor=K.P([q[0],q[1],0])}
      // where the muzzle is on the screen (o.out, in the hero's own units from his feet): the zombie map fires its shots from there
      if(o.out&&kp.muzzle)o.out.muzzle=K.P(K.W(kp.muzzle));if(o.out&&kp.eject){const q=K.W(kp.eject);o.out.eject=K.P(q);o.out.ejectZ=q[2]}
      // the right hand on the grip, or pulling the crossbow's string back to the nut
      let rh=kp.strum||[0,0,0];const pl=Wp.pull;
      if(pl&&kp.nut){const at=[kp.nut[0]+.2,4.3,0],far=[10.4,4.3,0];rh=pl.ph===1?lerp3([0,0,0],far,ez(pl.t)):pl.ph===2?at:lerp3([-.4,4.3,0],[0,0,0],ez(pl.t))}
      K.hand(rh,2.8,S.hand,1.2,S.ring?q=>ringOn(V0,q,S.ring):null);
      // the left hand on the fore-grip or the pump; it pushes the new rocket into the tube
      let lh=RH||kp.sup;const ld=Wp.load;
      if(ld&&lh){const off=(1-ez(Wp.st.loaded||0))*9,on=[16.6+off,4.2,0];lh=ld.ph===1?lerp3(kp.sup,[25.6,4.2,0],ez(ld.t)):ld.ph===2?on:lerp3([16.6,4.2,0],kp.sup,ez(ld.t))}
      if(lh)K.hand(lh,2.7,S.hand,1.2);
      // the flash at the muzzle (and the rocket's blast behind), the orb flaring
      if(Wp.flash>0&&kp.muzzle&&ARMI3D.ZOMBIE.includes(wid))flashFx(K,wid,kp.muzzle,Wp.flash,(Wp.k||0)*7+3);
      if(wid==='lanciarazzi'&&Wp.flash>0&&kp.back)flashFx(K,wid,kp.back,Wp.flash,11,true);
      if((wid==='bastone'||wid==='scettro')&&Wp.flash>0){const rgb=hexRgb(S.eyeCol||'#9fff7a');K.fx(kp.orb,q=>{shine(rgb,q[0],q[1],18*Wp.flash+6,.75*Wp.flash);ctx.strokeStyle=`rgba(234,255,214,${(.8*Wp.flash).toFixed(3)})`;ctx.lineWidth=1.4;ball(q,4+(1-Wp.flash)*9);ctx.stroke()},2)}
      if(!fx)return;
      // effects: the bullets, the shotgun's pellets, the rocket, the smoke, the spent cases, the bolt, the leaves
      const D0=typeof ARMI!=='undefined'?ARMI.DATI[wid]:null,mz=kp.muzzle;
      if(D0&&mz)for(const a of Wp.shots){const sp=wid==='lanciarazzi'?60+a*900:900,d=a*sp,al=cl(1-a/(wid==='lanciarazzi'?.25:.09),0,1);if(al<=0||d<1)continue;
        if(wid==='lanciarazzi'){const c=add(mz,[d/K.s,0,0]);K.fx(c,q=>{const b=K.P(K.W(add(c,[1,0,0])));try{ARMI.razzo(q[0],q[1],Math.atan2(b[1]-q[1],b[0]-q[0]),G.t)}catch(e){}},0)}
        else{const n=D0.pel||1;for(let i=0;i<n;i++){const an=n>1?(i/(n-1)-.5)*.42:0,c=add(mz,[d/K.s*Math.cos(an),0,d/K.s*Math.sin(an)]);
          K.fx(c,q=>{const b=K.P(K.W(add(c,[Math.cos(an),0,Math.sin(an)])));try{ARMI.colpo(D0.colpo,q[0],q[1],b[0]-q[0],b[1]-q[1],al)}catch(e){}},0)}}}
      if(typeof ARMI!=='undefined'&&mz&&!LOWFX&&ARMI3D.ZOMBIE.includes(wid))for(const a of Wp.shots){const k=a/.42;if(k>=1)continue;const c=add(mz,[1.5,1+k*5,0]);
        K.fx(c,q=>ARMI.fumo(q[0],q[1],k,wid==='lanciarazzi'?6:wid==='pompa'||wid==='tattica'?4.2:3,false),-.2)}
      if(wid==='lanciarazzi'&&kp.back&&!LOWFX&&typeof ARMI!=='undefined')for(const a of Wp.shots){const k=a/.5;if(k>=1)continue;const c=add(kp.back,[-2-k*8,1+k*3,0]);
        K.fx(c,q=>ARMI.fumo(q[0],q[1],k,7,true),-.5)}
      if(D0&&D0.bossolo&&kp.eject)for(const e of Wp.ej){const k=e/.34,c=add(kp.eject,[-2.5*k,6*k-11*k*k,8*k]);
        K.fx(c,q=>{try{ARMI.bossolo(D0.bossolo,q[0],q[1],k*14,cl((1-k)*3,0,1))}catch(e){}},.5)}
      if(wid==='balestra')for(const a of Wp.shots){const d=a*700,al=cl(1-a/.12,0,1);if(al<=0)continue;const c0=add(mz,[d/K.s-9,0,0]),c1=add(mz,[d/K.s,0,0]);
        K.fx(c1,()=>boltFx(V0,K.W(c0),K.W(c1),al),0)}
      if(wid==='scettro'&&kp.orb){const rgb=hexRgb(S.eyeCol||'#9fff7a');
        // the cast: sparks of the orb's colour burst forward; the summoning: three lights circle round the orb, wider and wider
        if(Wp.cast>=0&&Wp.cast<.3)for(let i=0;i<6;i++){const k=Wp.cast/.3,an=(i-2.5)*.2,c=add(kp.orb,[2+k*30*Math.cos(an),Math.sin(i*2.1)*k*5,k*30*Math.sin(an)]);
          K.fx(c,q=>{shine(rgb,q[0],q[1],5*(1-k)+2,.6*(1-k));ctx.fillStyle=`rgba(255,255,255,${(.9*(1-k)).toFixed(3)})`;ball(q,1.1*(1-k)+.3);ctx.fill()},0)}
        if(Wp.summon>=0)K.fx(kp.orb,q=>{const k=Wp.summon,R0=(5+k*9)*K.s;shine(rgb,q[0],q[1],R0*1.6,.35+.25*Math.sin(k*Math.PI));
          for(let i=0;i<3;i++){const a=G.t*4+i*2.1;ctx.fillStyle=`rgba(${rgb},.9)`;ball([q[0]+Math.cos(a)*R0,q[1]+Math.sin(a)*R0*.55],1.6);ctx.fill();ctx.fillStyle='rgba(255,255,255,.85)';ball([q[0]+Math.cos(a)*R0,q[1]+Math.sin(a)*R0*.55],.7);ctx.fill()}},1)}
      if(wid==='bastone'&&Wp.cast>=0&&Wp.cast<.3)for(let i=0;i<5;i++){const k=Wp.cast/.3,an=(i-2)*.22,c=add(kp.orb,[3+k*34*Math.cos(an),Math.sin(i*2.1)*k*4,k*34*Math.sin(an)]);
        K.fx(c,q=>{ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(G.t*9+i*1.3);ctx.globalAlpha=cl((1-k)*2,0,1);ink(1);ctx.fillStyle='#7bf0a8';ctx.beginPath();ctx.ellipse(0,0,2.6,1.3,0,0,TAU);ctx.fill();ctx.stroke();
          ctx.strokeStyle='rgba(30,90,40,.7)';ctx.lineWidth=.5;seg([-2,0],[2,0]);ctx.stroke();ctx.restore()},0)}
    })}});
  // the free hand: the left one, at the side (it swings when walking)
  if((cls==='one'||cls==='staff')&&!RH)parts.push({d:D(X.T([-.6,-11.4,11.4])),f:()=>fist(V0,X.T(Wp.hL),2.7,S.hand)})}
const hexRgb=h=>{const n=parseInt(String(h).slice(1),16);return`${n>>16},${n>>8&255},${n&255}`};
const NOTE_COL=['#ffd84a','#ff8ab8','#7fe0ff'];

// ------------------------------------------------------------------ the hats of the look (Denis, 15 October: «più cose nell'aspetto»:
// cappelli). On the bare head over its hair, each a volume on the head's own camera, so they turn with it: up is the head's top, fw its
// front, rt its right. A brim: drawn whole before the crown and its near half again after it (the crown rises behind it). col: the hat's
// colour picked in the look (else its own)
const HAT_COL={berretto:'#c8323c',punta:'#5a3a9a',paglia:'#e8c870',cilindro:'#2e2a30',elmo:'#a9b1ba',bandana:'#d24b3e',pompon:'#3f7fd0'};
const HATS={berretto:1,punta:1,paglia:1,cilindro:1,elmo:1,bandana:1,pompon:1};
// (the hats with a brim are pushed back on the head, so from our camera, which looks down, the brim never hides the eyes)
const HAT_TILT={berretto:.12,punta:.26,paglia:.5,cilindro:.36};
function hatDraw(Vh,h,R,nod,kind,col,sw){const{F}=Vh,tl=HAT_TILT[kind]||0,up0=nrm(nod([0,0,1])),fw0=nrm(nod([1,0,0])),rt=nrm(nod([0,1,0])),c=col||HAT_COL[kind]||'#c8323c';
  const up=nrm(add(mul(up0,Math.cos(tl)),mul(fw0,-Math.sin(tl)))),fw=nrm(cross(rt,up));
  const at=(cz,r,t,c0)=>add(add(mul(up,cz),c0||[0,0,0]),add(mul(fw,Math.cos(t)*r),mul(rt,Math.sin(t)*r))),P3=v=>hP(Vh,h,v);
  const ring=(cz,r,N,c0)=>{const o=[];for(let i=0;i<N;i++)o.push(P3(at(cz,r,i/N*TAU,c0)));return o};
  const box=pts=>{const b=[1e9,1e9,-1e9,-1e9];for(const q of pts){b[0]=Math.min(b[0],q[0]);b[1]=Math.min(b[1],q[1]);b[2]=Math.max(b[2],q[0]);b[3]=Math.max(b[3],q[1])}return b};
  const softF=(pts,col,kl,kd)=>{const b=box(pts);return soft(b[0]+(b[2]-b[0])*.3,b[1]+(b[3]-b[1])*.25,(b[0]+b[2])/2,(b[1]+b[3])/2,Math.max(b[2]-b[0],b[3]-b[1])*.75,col,kl||.16,kd||.32)};
  const solid=(pts,col,lw)=>{const H=chull(pts);ink(lw||2.2);poly(H);ctx.fillStyle=softF(H,col);ctx.fill();ctx.stroke();return H};
  // the brim between r0 and r1 at the height cz: the whole ring, or only the half nearer to us (near)
  const brim=(cz,r0,r1,col,near,det)=>{const N=36,ts=[];for(let i=0;i<=N;i++){const t=i/N*TAU;if(!near||F(add(mul(fw,Math.cos(t)),mul(rt,Math.sin(t))))>-.02)ts.push(t)}
    if(near){if(ts.length<2)return;// the run of the near half (it can wrap across t = 0)
      let k=0;for(let i=1;i<ts.length;i++)if(ts[i]-ts[i-1]>.5){k=i;break}const run=k?ts.slice(k).map(t=>t-TAU).concat(ts.slice(0,k)):ts;
      const O=run.map(t=>P3(at(cz,r1,t))),I=run.map(t=>P3(at(cz,r0,t))).reverse();ctx.beginPath();for(const q of O.concat(I))ctx.lineTo(q[0],q[1]);ctx.closePath();
      ctx.fillStyle=softF(O,col,.2,.3);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;line(O);ctx.stroke();if(det)det(run,true);return}
    const O=ring(cz,r1,N);ink(1.8);poly(O);ctx.fillStyle=softF(O,dk(col,.08),.18,.3);ctx.fill();ctx.stroke();if(det)det(ts,false)};
  const sp1=(i,n)=>i/n*TAU;ctx.lineJoin='round';ctx.lineCap='round';
  // the angles of a ring whose side faces us, in one run (without this the line jumped across the hat: the old "smile")
  const runT=(N,lim)=>{const ts=[];for(let i=0;i<N;i++){const t=i/N*TAU;if(F(add(mul(fw,Math.cos(t)),mul(rt,Math.sin(t))))>lim)ts.push(t)}
    let k=0;for(let i=1;i<ts.length;i++)if(ts[i]-ts[i-1]>TAU/N*1.5){k=i;break}return k?ts.slice(k).map(t=>t-TAU).concat(ts.slice(0,k)):ts};
  // a band of cloth between two rings (the lower one first), filled, with its two edges inked
  const strip=(ts,z0,r0,z1,r1,col)=>{if(ts.length<2)return;const A=ts.map(t=>P3(at(z0,r0,t))),B=ts.map(t=>P3(at(z1,r1,t)));ctx.beginPath();for(const q of A.concat(B.slice().reverse()))ctx.lineTo(q[0],q[1]);ctx.closePath();
    ctx.fillStyle=soft(A[0][0],A[0][1],(A[0][0]+A[A.length-1][0])/2,(A[0][1]+B[0][1])/2,Math.max(8,Math.abs(A[A.length-1][0]-A[0][0])*.7),col,.22,.28);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;line(A);ctx.stroke();line(B);ctx.stroke()};
  if(kind==='berretto'){// a soft beret pulled to his right, a band round the head, a little stalk on top, a feather
    const c0=add(mul(rt,R*.22),mul(fw,-R*.05)),pts=[];for(let i=0;i<16;i++)for(const[z,r] of[[R*.6,R*.98],[R*.86,R*1.2],[R*1.08,R*1.02],[R*1.18,R*.5]])pts.push(P3(at(z,r,sp1(i,16),z>R*.7?c0:null)));
    const H=solid(pts,c);ctx.save();poly(H);ctx.clip();ctx.strokeStyle=dk(c,.3);ctx.lineWidth=1.1;for(const r of ringRunsAt(Vh,h,up,fw,rt,R*.66,R*.97,.02))if(r.length>1){line(r);ctx.stroke()}ctx.restore();
    const tq=P3(add(mul(up,R*1.22),c0));ink(1.1);ctx.fillStyle=dk(c,.15);ball(tq,1.1);ctx.fill();ctx.stroke();
    if(!LOWFX){ctx.fillStyle='rgba(255,255,255,.22)';const hl=P3(add(mul(up,R*1.08),add(c0,mul(fw,-R*.2))));ctx.beginPath();ctx.ellipse(hl[0]-R*.2,hl[1],R*.42,R*.13,-.2,0,TAU);ctx.fill()}
    return}
  if(kind==='punta'){// the wizard's hat: a wide brim, a tall cone that bends back at the tip, a band, little golden stars
    const zb=R*.56;brim(zb,R*.84,R*1.44,c);
    const sp=[[0,R*.92],[R*.55,R*.74],[R*1.05,R*.52],[R*1.5,R*.3],[R*1.85,R*.12],[R*2.05,R*.02]],bend=k=>add(mul(fw,-R*.5*k*k),mul(rt,R*.1*k*k*k)),S=sp.map(([z,r],i)=>({c:add(mul(up,zb+z),bend(i/(sp.length-1))),r}));
    const segs=[];for(let i=0;i<S.length-1;i++){const a=[],b=[];for(let j=0;j<14;j++){a.push(P3(at(0,S[i].r,sp1(j,14),S[i].c)));b.push(P3(at(0,S[i+1].r,sp1(j,14),S[i+1].c)))}segs.push(chull(a.concat(b)))}
    ink(2.3);for(const H of segs){poly(H);ctx.stroke()}const all=[].concat(...segs),g=softF(all,c);for(const H of segs){poly(H);ctx.fillStyle=g;ctx.fill()}
    strip(runT(32,0),zb+R*.04,R*.92,zb+R*.3,R*.82,'#f0c64a');
    for(const[z,t] of[[.62,.4],[1.05,-.55],[1.4,.15],[.7,-1.75],[1.15,1.6],[.6,2.55],[1.1,-2.75],[1.45,3]]){const k=z/2.05,cc=add(mul(up,zb+R*z),bend(k*1.2)),n=add(mul(fw,Math.cos(t)),mul(rt,Math.sin(t)));if(F(n)<.15)continue;const q=P3(add(cc,mul(n,R*(.74-.34*k))));starS(q[0],q[1],1.25,1)}
    brim(zb,R*.84,R*1.44,c,true);return}
  if(kind==='paglia'){// the straw hat: a wide brim with the weave, a low round crown, a red band
    const zb=R*.5;const weave=(ts,near)=>{if(LOWFX)return;ctx.strokeStyle='rgba(120,80,20,.35)';ctx.lineWidth=.6;for(let i=0;i<ts.length;i+=2){const t=ts[i],a=P3(at(zb,R*1.0,t)),b=P3(at(zb,R*1.56,t));seg(a,b);ctx.stroke()}};
    brim(zb,R*.86,R*1.6,c,false,weave);const pts=[];for(let i=0;i<16;i++)for(const[z,r] of[[0,R*.94],[R*.4,R*.95],[R*.62,R*.8],[R*.72,R*.45]])pts.push(P3(at(zb+z,r,sp1(i,16))));
    const H=solid(pts,c);ctx.save();poly(H);ctx.clip();strip(runT(32,-.12),zb+R*.04,R*.955,zb+R*.3,R*.955,'#c8323c');ctx.restore();brim(zb,R*.86,R*1.6,c,true,weave);return}
  if(kind==='cilindro'){// the top hat: a small curled brim, a tall cylinder, a band and its top seen from above
    const zb=R*.58;brim(zb,R*.84,R*1.28,c);const pts=[];for(let i=0;i<18;i++)for(const[z,r] of[[0,R*.8],[R*1.36,R*.86]])pts.push(P3(at(zb+z,r,sp1(i,18))));
    const H=solid(pts,c);ctx.save();poly(H);ctx.clip();strip(runT(32,-.12),zb+R*.06,R*.81,zb+R*.36,R*.82,'#c8323c');ctx.restore();
    const top=ring(zb+R*1.36,R*.86,18);poly(top);ctx.fillStyle=lt(c,.12);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();brim(zb,R*.84,R*1.28,c,true);return}
  if(kind==='elmo'){// the horned helmet: a steel dome, a band with rivets, two curved horns of bone (the far one first)
    const zb=R*.38,horns=[-1,1].map(sd=>{const b=add(mul(up,zb+R*.42),mul(rt,sd*R*.86)),pts=[b,add(b,add(mul(rt,sd*R*.55),mul(up,R*.2))),add(b,add(mul(rt,sd*R*.78),mul(up,R*.75))),add(b,add(mul(rt,sd*R*.62),mul(up,R*1.18)))];return{sd,pts,v:F(mul(rt,sd))}}).sort((a,b)=>a.v-b.v);
    const horn=H3=>{const Q=H3.pts.map(P3),ws=[2.6,2.2,1.5,.5];ctx.fillStyle=INK;for(let i=0;i<3;i++){hull(Q[i],ws[i]+1.2,Q[i+1],ws[i+1]+1.2);ctx.fill()}ctx.fillStyle=softF(Q,'#f2e6c8',.2,.3);for(let i=0;i<3;i++){hull(Q[i],ws[i],Q[i+1],ws[i+1]);ctx.fill()}
      ctx.strokeStyle='rgba(120,90,50,.45)';ctx.lineWidth=.6;for(let i=1;i<3;i++){const q=Q[i];ctx.beginPath();ctx.moveTo(q[0]-ws[i],q[1]);ctx.lineTo(q[0]+ws[i],q[1]+.5);ctx.stroke()}};
    if(horns[0].v<0)horn(horns[0]);
    const pts=[];for(let i=0;i<18;i++)for(const[z,r] of[[0,R*1.02],[R*.4,R*.95],[R*.72,R*.68],[R*.9,R*.3]])pts.push(P3(at(zb+z,r,sp1(i,18))));const H=solid(pts,c,2.4);
    ctx.save();poly(H);ctx.clip();ctx.fillStyle='rgba(255,255,255,.35)';const hq=P3(add(mul(up,zb+R*.75),mul(fw,R*.2)));ctx.beginPath();ctx.ellipse(hq[0]-R*.25,hq[1],R*.35,R*.14,-.3,0,TAU);ctx.fill();
    const band=runT(28,-.05).map(t=>({q:P3(at(zb+R*.12,R*1.01,t)),j:Math.round((t+TAU)/TAU*28)%28}));
    if(band.length>1){ctx.strokeStyle=INK;ctx.lineWidth=3.6;line(band.map(b=>b.q));ctx.stroke();ctx.strokeStyle='#6b727c';ctx.lineWidth=2;line(band.map(b=>b.q));ctx.stroke();ctx.fillStyle='#d8dde3';for(const b of band)if(b.j%4===0){ball(b.q,.55);ctx.fill()}}ctx.restore();
    for(const hh of horns)if(hh.v>=0||hh===horns[1])if(hh.v>=0)horn(hh);return}
  if(kind==='bandana'||kind==='pompon'){// cloth on the skull: the pirate's band tied at the back (white spots), or the wool hat with its ribbed
    // brim and the pompom on top
    const pom=kind==='pompon',M=regionMesh(Vh,nod,-Math.PI,Math.PI,pom?a=>.42-.06*Math.cos(a):a=>.5-.2*(1-Math.cos(a))/2,()=>Math.PI/2,36,5),Rr=R*(pom?1.07:1.03);
    ctx.fillStyle=INK;meshPath(M,h,Rr+1.1);ctx.fill();meshPath(M,h,Rr);ctx.fillStyle=soft(h[0]-Rr*.4,h[1]-Rr*.6,h[0],h[1]-Rr*.2,Rr*1.2,c,.18,.3);ctx.fill();
    ctx.save();meshPath(M,h,Rr);ctx.clip();
    if(pom){ctx.strokeStyle=dk(c,.28);ctx.lineWidth=.7;for(let a=-3;a<=3;a+=.3){const pts=[];for(let k=0;k<=6;k++){const n=nrm(nod(hdir(a,.5+k*.17)));if(F(n)>.05)pts.push(sp(Vh,h,Rr,n))}if(pts.length>1){line(pts);ctx.stroke()}}}
    else{ctx.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<14;i++){const n=nrm(nod(hdir(-2.6+i*.4+(i%2)*.15,.62+(i%3)*.28)));if(F(n)<.1)continue;const q=sp(Vh,h,Rr,n);ball(q,.75*Math.min(1,F(n)*2));ctx.fill()}}
    ctx.restore();
    // the lower edge: a thick ribbed brim for the wool hat, a fold for the band
    for(const r of meshEdge(M,h,Rr,0,.04)){if(r.length<2)continue;ctx.strokeStyle=INK;ctx.lineWidth=pom?5.2:3.2;line(r);ctx.stroke();ctx.strokeStyle=pom?lt(c,.08):dk(c,.08);ctx.lineWidth=pom?3.4:1.6;line(r);ctx.stroke()}
    if(pom){const q=P3(mul(up,Rr*1.12)),r=3.1;ink(1.4);ball(q,r);ctx.fillStyle=soft(q[0]-1.2,q[1]-1.2,q[0],q[1],r*1.3,'#f6efe4',.2,.25);ctx.fill();ctx.stroke();
      if(!LOWFX){ctx.strokeStyle='rgba(180,170,160,.6)';ctx.lineWidth=.5;for(let i=0;i<6;i++){const a=i/6*TAU;ctx.beginPath();ctx.moveTo(q[0]+Math.cos(a)*r*.3,q[1]+Math.sin(a)*r*.3);ctx.lineTo(q[0]+Math.cos(a)*r*.85,q[1]+Math.sin(a)*r*.85);ctx.stroke()}}}
    else{const d=nod(hdir(Math.PI,.42));if(F(d)>-.3)bandKnot(Vh,h,mul(d,R*1.05),nod,c,sw||0)}
    return}}
// a ring round the head's axis up at the height z (radius r), where it faces us, as runs of screen points
function ringRunsAt(Vh,h,up,fw,rt,z,r,minF){const runs=[];let cur=[];for(let i=0;i<=36;i++){const t=i/36*TAU,n=add(mul(fw,Math.cos(t)),mul(rt,Math.sin(t)));if(Vh.F(n)>minF)cur.push(hP(Vh,h,add(mul(up,z),mul(n,r))));else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);return runs}
// the tattoos of the look (Denis, 15 October): drawn on the skin in the face's units, ink of a colour (col), grown from their middle by K
const TAT_INK='#2e4c8c';
// the tattoos (look 'tatuaggio'), in ink on the skin: shapes that read even small, thin tapered strokes and clean filled figures, never
// thick lines on a tiny shape (that was a smudge). K: the size of the look's slider; col: the ink
function faceTattoo(kind,fp,seen,K,col){K=K||1;col=col||TAT_INK;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';const sw=Math.sqrt(K);
  const at=(cx,cy)=>(x,y)=>fp(cx+(x-cx)*K,cy+(y-cy)*K);
  const path=(m,P,lw,al,fill)=>{if(al<=.02)return;ctx.globalAlpha=al*.94;ctx.beginPath();for(const p of P){const q=m(p[0],p[1]);ctx.lineTo(q[0],q[1])}if(fill){ctx.closePath();ctx.fillStyle=col;ctx.fill()}else{ctx.strokeStyle=col;ctx.lineWidth=lw*sw;ctx.stroke()}ctx.globalAlpha=1};
  const arc=(cx,cy,r,a0,a1,n)=>{const o=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}return o};
  // a tapered stroke from a to b, bowing by bend to one side, w wide in the middle and pointed at both ends
  const blade=(m,a,b,bend,w,al)=>{const N=12,Lf=[],Rt=[],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
    for(let i=0;i<=N;i++){const t=i/N,c=Math.sin(t*Math.PI),x=a[0]+dx*t+nx*bend*c,y=a[1]+dy*t+ny*bend*c,hw=w*Math.pow(c,.75)/2;Lf.push([x+nx*hw,y+ny*hw]);Rt.push([x-nx*hw,y-ny*hw])}
    path(m,Lf.concat(Rt.reverse()),0,al,true)};
  if(kind==='tribale'){// three blades fanning down from the outer corner of his left eye
    const m=at(-.5,-.1),al=seen(-.5,-.1);if(al>.02){blade(m,[-.47,.13],[-.4,-.46],-.14,.13,al);blade(m,[-.61,.06],[-.7,-.37],.11,.095,al);blade(m,[-.35,-.02],[-.19,-.31],-.08,.08,al)}}
  else if(kind==='fulmine'){// a lightning bolt down his right cheek
    const m=at(.52,-.16),al=seen(.52,-.16);path(m,[[.42,.12],[.68,.12],[.55,-.07],[.72,-.07],[.38,-.5],[.49,-.21],[.33,-.21]],0,al,true)}
  else if(kind==='luna'){// a crescent moon in the middle of the forehead, with a small star
    const m=at(0,.66),al=seen(0,.66);if(al>.02){const o=arc(0,.66,.15,.55,TAU-.55,16),i2=arc(.075,.69,.125,TAU-.95,.95,14).reverse();path(m,o.concat(i2),0,al,true);
      const q=m(.2,.78);ctx.globalAlpha=al*.94;ctx.fillStyle=col;ctx.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU-Math.PI/2,r=(i%2?.35:1)*1.25*sw;ctx.lineTo(q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.globalAlpha=1}}
  else if(kind==='puntini'){// three dots down his left cheekbone
    for(const[x,y] of[[-.56,.02],[-.5,-.13],[-.44,-.28]]){const al=seen(x,y);if(al<=.02)continue;ctx.globalAlpha=al*.94;ctx.fillStyle=col;ball(fp(-.5+(x+.5)*K,-.13+(y+.13)*K),.72*sw);ctx.fill();ctx.globalAlpha=1}}
  else if(kind==='artigli'){// three claw marks across his right cheek
    const m=at(.52,-.14),al=seen(.52,-.14);if(al>.02)for(const d of[-.1,0,.1])blade(m,[.4+d,.12],[.62+d,-.42],.03,.065,al)}
  else if(kind==='spirale'){// a spiral of a turn and a half on his left cheek, open in the middle
    const m=at(-.48,-.15),al=seen(-.48,-.15),P=[];for(let i=0;i<=36;i++){const a=i/36*TAU*1.5,r=.05+i/36*.15;P.push([-.48+Math.cos(a)*r,-.15+Math.sin(a)*r])}path(m,P,.58,al)}
  else if(kind==='onde'){// two waves under each eye
    for(const sd of[-1,1]){const m=at(sd*.46,-.1),al=seen(sd*.46,-.1);for(const y0 of[-.03,-.16]){const P=[];for(let i=0;i<=16;i++){const x=sd*(.3+i*.022);P.push([x,y0+Math.sin(i/16*TAU*1.5)*.035])}path(m,P,.6,al)}}}
  else if(kind==='cuore'){// a little heart on his right cheek
    const m=at(.5,-.17),al=seen(.5,-.17),P=[];for(let i=0;i<=28;i++){const t=i/28*TAU,x=16*Math.pow(Math.sin(t),3),y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);P.push([.5+x*.0115,-.17+y*.0115])}path(m,P,0,al,true)}
  ctx.restore()}
// ------------------------------------------------------------------ the new heroes' own things (Denis, 15 October: «crea altri 3 pg con le
// loro abilità»): the Bard's plume and cape, the Alchemist's goggles, apron, vials and backpack, the Ninja's mask, band and sword
// a music note (the Bard's, also the shots in the game): kind 0 one note, 1 two notes beamed; s: its size; col: its colour
function musicNote(x,y,s,col,kind){ctx.save();ctx.translate(x,y);ctx.lineCap='round';ctx.lineJoin='round';
  const H=kind?[[-s*.85,s*.25],[s*.95,-s*.05]]:[[0,0]],T=kind?[-s*2.6,-s*2.9]:[-s*2.6];
  const draw=(w,c,grow)=>{ctx.strokeStyle=c;ctx.fillStyle=c;
    H.forEach(([hx,hy],i)=>{ctx.beginPath();ctx.ellipse(hx,hy,s*.78+grow,s*.56+grow,-.42,0,TAU);ctx.fill();ctx.lineWidth=s*.34+w;ctx.beginPath();ctx.moveTo(hx+s*.66,hy-s*.12);ctx.lineTo(hx+s*.66,hy+T[i]);ctx.stroke()});
    if(kind){ctx.lineWidth=s*.62+w;ctx.beginPath();ctx.moveTo(H[0][0]+s*.66,H[0][1]+T[0]);ctx.lineTo(H[1][0]+s*.66,H[1][1]+T[1]);ctx.stroke()}
    else{ctx.lineWidth=s*.34+w;ctx.beginPath();ctx.moveTo(s*.66,T[0]);ctx.quadraticCurveTo(s*1.75,T[0]+s*.7,s*1.45,T[0]+s*1.75);ctx.stroke()}};
  draw(s*.55,INK,s*.28);draw(0,col,0);ctx.fillStyle='rgba(255,255,255,.7)';ball([H[0][0]-s*.26,H[0][1]-s*.18],s*.2);ctx.fill();ctx.restore()}
// the Ninja's star seen flat (a shot in flight): four points round a hole, turned by a
function starShape(x,y,r,a,col){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.lineJoin='round';ctx.beginPath();for(let i=0;i<8;i++){const an=i/8*TAU,rr=i%2?r*.34:r;ctx.lineTo(Math.cos(an)*rr,Math.sin(an)*rr)}ctx.closePath();
  ctx.strokeStyle=INK;ctx.lineWidth=Math.max(1.2,r*.32);ctx.stroke();ctx.fillStyle=col||'#8a96a4';ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-r*.18,-r*.3);ctx.lineTo(0,-r);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-r*.3,r*.18);ctx.lineTo(-r,0);ctx.closePath();ctx.fill();
  ctx.fillStyle='#1b1612';ball([0,0],r*.17);ctx.fill();ctx.restore()}
// the Alchemist's flask seen flat (a shot in flight, or thrown): the glass belly, the liquid glowing in it, the neck and the cork, turned by a
function flaskShape(x,y,r,a,col){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.lineJoin='round';col=col||'#7bf06a';
  shine(hexRgb(col),0,0,r*2.4,.3);ink(Math.max(1.2,r*.3));ctx.beginPath();ctx.arc(0,0,r,-1.25,Math.PI+1.25);ctx.lineTo(-r*.32,-r*1.75);ctx.lineTo(r*.32,-r*1.75);ctx.closePath();ctx.fillStyle='#d6eef2';ctx.fill();ctx.stroke();
  ctx.save();ball([0,0],r*.8);ctx.clip();ctx.fillStyle=col;ctx.fillRect(-r,-r*.15,r*2,r*1.2);ctx.fillStyle=lt(col,.45);ctx.fillRect(-r,-r*.15,r*2,r*.22);ctx.restore();
  ctx.fillStyle='#a86833';ctx.fillRect(-r*.4,-r*2.2,r*.8,r*.5);ctx.strokeRect(-r*.4,-r*2.2,r*.8,r*.5);
  ctx.fillStyle='rgba(255,255,255,.8)';ball([-r*.4,-r*.35],r*.22);ctx.fill();ctx.restore()}
// the Alchemist's goggles, pushed up on the forehead: a leather strap round the head (over the hood, or over the hair) and two big
// round lenses in brass rims on the front, only on our side (drawn after the head)
function goggles(Vh,h,R,nod){const{F}=Vh,el=a=>lerp(1.02,.66,(1-Math.cos(a))/2),at=a=>nrm(nod(hdir(a,el(a)))),R1=R*1.03;
  const runs=[];let cur=[];for(let i=0;i<=48;i++){const a=i/48*TAU,m=at(a);if(F(m)>.02)cur.push(a);else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
  if(runs.length>1&&runs[0][0]===0&&runs[runs.length-1][runs[runs.length-1].length-1]>=TAU-.01){const l=runs.pop();runs[0]=l.map(a=>a-TAU).concat(runs[0])}
  ctx.lineCap='round';ctx.lineJoin='round';
  for(const r of runs){if(r.length<2)continue;const pts=r.map(a=>sp(Vh,h,R1,at(a)));ctx.strokeStyle=INK;ctx.lineWidth=3.1;line(pts);ctx.stroke();ctx.strokeStyle='#3d2a1a';ctx.lineWidth=1.7;line(pts);ctx.stroke();
    ctx.strokeStyle='rgba(240,200,140,.55)';ctx.lineWidth=.5;ctx.setLineDash([.9,1.3]);line(pts);ctx.stroke();ctx.setLineDash([])}
  // the lenses, the nearer one last; a ring of brass round each, the glass with a light in it
  const L=[-1,1].map(sd=>{const n=at(sd*.44);return{sd,n,v:F(n)}}).filter(l=>l.v>.05).sort((a,b)=>a.v-b.v);
  for(const{n,v} of L){let u=cross(n,[0,0,1]);if(len(u)<.2)u=[0,1,0];u=nrm(u);const w=cross(n,u),c=mul(n,R*1.08),rr=2.5;
    const ring=k=>{const o=[];for(let i=0;i<18;i++){const t=i/18*TAU;o.push(hP(Vh,h,add(c,add(mul(u,Math.cos(t)*rr*k),mul(w,Math.sin(t)*rr*k)))))}return o};
    const O=ring(1),I=ring(.64),q=hP(Vh,h,c);ctx.save();ctx.globalAlpha*=cl(v*4,0,1);
    poly(O);ctx.strokeStyle=INK;ctx.lineWidth=1.9;ctx.stroke();ctx.fillStyle=soft(q[0]-1.2,q[1]-1.2,q[0],q[1],rr*1.2,'#d39a33',.3,.3);ctx.fill();
    poly(I);const g=ctx.createRadialGradient(q[0]-.9,q[1]-.9,.2,q[0],q[1],rr*.75);g.addColorStop(0,'#eafcff');g.addColorStop(1,'#5fa8bc');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='rgba(70,36,8,.75)';ctx.lineWidth=.6;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.9)';ball([q[0]-.75,q[1]-.7],.5);ctx.fill();ctx.restore()}}
// the Ninja's mask: cloth over the lower face up to under the eyes (a little higher over the nose), round the whole head, two folds
function ninjaMask(Vh,h,R,nod,col){const M=regionMesh(Vh,nod,-Math.PI,Math.PI,()=>-1.5,a=>.07+.08*Math.exp(-(a/.32)*(a/.32)),32,4),R1=R*1.004;
  if(!meshPath(M,h,R1))return;ctx.fillStyle=soft(h[0]-R*.35,h[1],h[0],h[1]+R*.3,R*1.25,col,.18,.3);ctx.fill();
  ctx.strokeStyle=INK;ctx.lineWidth=1.15;ctx.lineCap='round';for(const r of meshEdge(M,h,R1,M.NE,.04)){if(r.length<2)continue;line(r);ctx.stroke()}
  ctx.strokeStyle=lt(col,.22);ctx.lineWidth=.6;for(const r of meshEdge(M,h,R1*.995,M.NE,.12)){if(r.length<2)continue;line(r.map(q=>[q[0],q[1]+.8]));ctx.stroke()}
  ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=.7;for(const a of[-.32,.32]){const pts=[];for(let k=0;k<=4;k++){const n=nrm(nod(hdir(a*(1-k*.1),.0-k*.16)));if(Vh.F(n)>.08)pts.push(sp(Vh,h,R1,n))}if(pts.length>1){line(pts);ctx.stroke()}}}
// the Ninja's sword on his back: the black scabbard from the left hip up to the right shoulder, the round guard, the wrapped hilt over the
// shoulder and its pommel
function katanaBack(V0,X){const{P}=V0,a3=X.T([-10,-5.6,ZB+2.6]),b3=X.T([-8.6,3.9,ZB+15.2]),g3=X.T([-8.45,4.5,ZB+16]),h3=X.T([-7.8,7.4,ZB+20.6]),A=P(a3),B=P(b3),G3=P(g3),Hh=P(h3);
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=4.8;seg(A,B);ctx.stroke();ctx.strokeStyle='#262832';ctx.lineWidth=3;seg(A,B);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=.8;seg([A[0]-.7,A[1]-.5],[B[0]-.7,B[1]-.5]);ctx.stroke();
  ink(1.1);ctx.fillStyle='#d6a640';ball(A,1.9);ctx.fill();ctx.stroke();
  ctx.strokeStyle=INK;ctx.lineWidth=4.2;seg(G3,Hh);ctx.stroke();ctx.strokeStyle='#e9e2d0';ctx.lineWidth=2.4;seg(G3,Hh);ctx.stroke();
  ctx.strokeStyle='#3a2f45';ctx.lineWidth=.9;for(let i=1;i<5;i++){const q=[lerp(G3[0],Hh[0],i/5),lerp(G3[1],Hh[1],i/5)];ctx.beginPath();ctx.moveTo(q[0]-1.3,q[1]+.8);ctx.lineTo(q[0]+1.3,q[1]-.8);ctx.stroke()}
  ink(1.2);ctx.fillStyle='#c9a24a';ctx.beginPath();ctx.ellipse(G3[0],G3[1],3,1.6,Math.atan2(Hh[1]-G3[1],Hh[0]-G3[0])+Math.PI/2,0,TAU);ctx.fill();ctx.stroke();
  ctx.fillStyle='#c9a24a';ball(Hh,1.2);ctx.fill();ctx.stroke()}
// the Alchemist's backpack: a leather bag on the back with its flap and buckle, a big flask and a little one sticking out of the top
function alchPack(V0,X,col){const{P,F}=V0,C=[];for(const x of[-14.2,-9.4])for(const y of[-4.9,4.9])for(const z of[ZB+3.4,ZB+13.2])C.push(P(X.T([x,y,z])));
  const H=chull(C),bb=[1e9,1e9,-1e9,-1e9];for(const q of H){bb[0]=Math.min(bb[0],q[0]);bb[1]=Math.min(bb[1],q[1]);bb[2]=Math.max(bb[2],q[0]);bb[3]=Math.max(bb[3],q[1])}
  // the flasks first (they stand in the bag, behind its front)
  const fl=(c,r,lc)=>{const q=P(X.T(c)),nk=P(X.T(add(c,[0,0,r*1.7])));ink(1.3);ctx.fillStyle='#cfe6ea';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(q[0]-r*.36,q[1]);ctx.lineTo(nk[0]-r*.36,nk[1]);ctx.lineTo(nk[0]+r*.36,nk[1]);ctx.lineTo(q[0]+r*.36,q[1]);ctx.closePath();ctx.fill();ctx.stroke();
    ball(q,r);ctx.fill();ctx.stroke();ctx.save();ball(q,r*.8);ctx.clip();ctx.fillStyle=lc;ctx.fillRect(q[0]-r,q[1]-r*.1,r*2,r*1.2);ctx.restore();shine(hexRgb(lc),q[0],q[1],r*2,.25);
    ctx.fillStyle='rgba(255,255,255,.8)';ball([q[0]-r*.35,q[1]-r*.35],r*.22);ctx.fill();ctx.fillStyle='#a86833';ctx.fillRect(nk[0]-r*.42,nk[1]-r*.5,r*.84,r*.55);ctx.strokeRect(nk[0]-r*.42,nk[1]-r*.5,r*.84,r*.55)};
  fl([-11.6,1.8,ZB+15.4],2.5,'#7bf06a');fl([-11.2,-2.6,ZB+14.2],1.6,'#ff7ab8');
  ink(2.3);poly(H);ctx.fillStyle=soft(bb[0]+(bb[2]-bb[0])*.3,bb[1]+(bb[3]-bb[1])*.25,(bb[0]+bb[2])/2,(bb[1]+bb[3])/2,Math.max(bb[2]-bb[0],bb[3]-bb[1])*.75,col,.16,.32);ctx.fill();ctx.stroke();
  // the flap over the top and its buckle, seen from the back
  const bk=F(X.Rd([-1,0,0]));if(bk>.05){const f0=P(X.T([-14.3,-4.7,ZB+12.6])),f1=P(X.T([-14.3,4.7,ZB+12.6])),f2=P(X.T([-14.4,4.2,ZB+8.4])),f3=P(X.T([-14.4,-4.2,ZB+8.4]));
    ctx.save();ctx.globalAlpha=cl(bk*4,0,1);ctx.beginPath();ctx.moveTo(f0[0],f0[1]);ctx.lineTo(f1[0],f1[1]);ctx.quadraticCurveTo((f1[0]+f2[0])/2+1,(f1[1]+f2[1])/2,f2[0],f2[1]);ctx.lineTo(f3[0],f3[1]);ctx.closePath();
    ctx.fillStyle=dk(col,.18);ctx.fill();ctx.strokeStyle='rgba(27,22,18,.7)';ctx.lineWidth=1;ctx.stroke();const b=P(X.T([-14.5,0,ZB+8.6]));ink(.9);ctx.fillStyle='#d39a33';ctx.fillRect(b[0]-1.3,b[1]-1,2.6,2);ctx.strokeRect(b[0]-1.3,b[1]-1,2.6,2);ctx.restore()}}
// a vial at the Alchemist's belt (t: where round the body), glass with its coloured liquid and a cork
function vialAt(V0,X,t,col){const{P}=V0,s=surf(t,ZB+4.2,1.2),c=X.T(s.p),top=add(c,[0,0,3.4]),A=P(c),B=P(top),r=1.45;
  ctx.fillStyle=INK;hull(A,r+1,B,r*.7+1);ctx.fill();ctx.fillStyle='#d6eef2';hull(A,r,B,r*.7);ctx.fill();
  const m=[lerp(A[0],B[0],.45),lerp(A[1],B[1],.45)];ctx.fillStyle=col;hull(A,r*.78,m,r*.68);ctx.fill();shine(hexRgb(col),A[0],A[1],4,.25);
  ctx.fillStyle='#a86833';ball(B,r*.72);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke();ctx.fillStyle='rgba(255,255,255,.75)';ball([A[0]-.5,A[1]-.6],.4);ctx.fill()}
// the Alchemist's apron, on the tunic (inside its outline): the part of it that faces us, its neck strap, a pocket
function apronOn(V0,X,col){const{P,F}=V0,vis=(t,z)=>F(X.Rd(surf(t,z,.2).n))>.02,T0=-.78,T1=.78,N=16;const top=[],bot=[];
  for(let i=0;i<=N;i++){const t=lerp(T0,T1,i/N);if(vis(t,ZB+11.2)){top.push(P(X.T(surf(t,ZB+11.2-Math.abs(t)*1.4,.2).p)));bot.push(P(X.T(surf(t*1.08,ZB+1.1,.2).p)))}}
  if(top.length<2)return;ctx.beginPath();for(const q of top)ctx.lineTo(q[0],q[1]);for(let i=bot.length-1;i>=0;i--)ctx.lineTo(bot[i][0],bot[i][1]);ctx.closePath();
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of top.concat(bot)){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])}
  ctx.fillStyle=soft(x0+(x1-x0)*.3,y0+(y1-y0)*.25,(x0+x1)/2,(y0+y1)/2,Math.max(x1-x0,y1-y0)*.8,col,.12,.26);ctx.fill();ctx.strokeStyle='rgba(27,22,18,.75)';ctx.lineWidth=1.1;ctx.stroke();
  for(const sd of[-1,1])surfLine(V0,X,k=>surf(sd*lerp(.66,.22,k),lerp(ZB+10.2,ZB+13.4,k),.25),dk(col,.25),1.3,1);
  if(vis(0,ZB+5)){const pk=[[-.3,ZB+6.4],[.3,ZB+6.4],[.3,ZB+3.6],[-.3,ZB+3.6]].map(([t,z])=>P(X.T(surf(t,z,.3).p)));poly(pk);ctx.fillStyle=dk(col,.12);ctx.fill();ctx.strokeStyle='rgba(27,22,18,.55)';ctx.lineWidth=.8;ctx.setLineDash([1.2,1]);ctx.stroke();ctx.setLineDash([])}}

// ------------------------------------------------------------------ the hero
// the body being drawn is the robe or the tunic: set for this one drawing, and always put back afterwards
function arciere(x,y,face,anim,p,sc,o){const S0=(o&&o.style)||{};BP=S0.robe?ROBE:PROF;BZ=S0.robe?0:ZB;try{arciere0(x,y,face,anim,p,sc,o)}finally{BP=PROF;BZ=ZB}}
function arciere0(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const S0=o.style||{},arm=S0.armor==='none'?'none':S0.armor&&ARM[S0.armor]?S0.armor:'giubba',wk=S0.weapon,AR=ARM[arm]||ARM.giubba;
  const S={...S0,body:S0.body||AR[0],hood:S0.hood||AR[1],skin:S0.skin||HC.skin,belt:S0.belt===null?null:S0.belt||HC.belt};
  // the outfit (style.outfit, sprite/eroe3d/vestiti3d.js): its own boots, gloves, details on the tunic and the hood, pieces of its own;
  // without it the hero stays identical to the pixel
  const OF=VESTITI[S0.outfit||S0.skinId]||null;S.hand=(OF&&OF.glove)||S.skin;if(OF){S.of=OF;if(OF.foot)S.foot=OF.foot;if(OF.foot2)S.foot2=OF.foot2}
  const W3=typeof ARMI3D!=='undefined'?ARMI3D:null,wid=weaponOf(S0),isX=wid==='balestra',gunW=W3&&wid&&wid!=='arco';
  let bk=S0.bowKind!==undefined?S0.bowKind:(wk&&BOWS[wk]?BOWS[wk][1]:null);if(bk==='plain'||bk==='xbow')bk=null;
  S.bowKind=bk;S.bowCol=S0.bowCol||(wk&&BOWS[wk]?BOWS[wk][0]:HC.bow);
  const V0=V(face),{P,D,F}=V0,Rh=10;let A=pose(anim,p,o),Wp=null;
  // o.mix = [another move, its p, k 0..1]: the pose goes toward that one (sitting down by the fire and standing up again, without a jump)
  if(o&&o.mix&&o.mix[2]>0)A=mixPose(A,pose(o.mix[0],o.mix[1],o),cl(o.mix[2],0,1));
  // with a gun, the crossbow or the staff: the body of the bow's pose for standing, walking, the dash and the knock back; when it aims
  // or shoots, a firm stance that breathes, eyes narrowed, the body pushed back a little by each shot
  if(gunW){if(anim==='shoot'||anim==='aim'){A=pose('idle',p,o);A.fL=[2.2,-5.2,0];A.fR=[-1,5,0];A.hd=[.3,0,0];A.hp=.04;A.hy=0;A.squint=anim==='shoot'?.55:.35;A.inhale=A.exhale=0}
    Wp=wpose(A,anim,p,wid,o);if(Wp.rl&&Wp.rl.b){const b=Wp.rl.b;A.hp+=.22*b;A.hy+=.3*b;A.squint=Math.max(A.squint||0,.25*b)}if(Wp.rec>0&&Wp.kick){const k=Wp.rec*Wp.kick[0]/3;A.lean=.02-.06*k;A.B=add(A.B,[-.7*k,0,0]);A.hd=add(A.hd,[-.4*k,0,.1*k])}
    // the hammer's blow and the bomb's throw move the whole body: back on the wind-up, forward on the strike
    if(Wp.lean!=null){A.lean=Wp.lean;A.hd=add(A.hd,[Wp.lean*3,0,0]);if(Wp.body)A.B=add(A.B,Wp.body);if(Wp.sq)A.s=Wp.sq}}
  // the mages float in the air (style.float): a slow bob instead of the steps
  if(S0.float){const fl=7+2.4*Math.sin(p*TAU+.4);A.B=[A.B[0],A.B[1],A.B[2]*(anim==='walk'?.2:1)+fl];A.roll*=.4}
  // o.tweak(A, p): a last touch to the pose from outside (the intro film's acting); without it nothing changes
  if(o.tweak)o.tweak(A,p);
  const X=frame(A);
  // the shadow on the floor, smaller when the hero is up in the air
  {const lift=cl(A.B[2]/6,0,1),q=P(A.B[0]+.5,A.B[1],0);shadow(x+q[0]*sc,y+q[1]*sc,13.5*sc*(1-.2*lift),5.4*sc*KR()*(1-.2*lift),.3)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  if(S.ring&&typeof ringAura==='function'){ctx.save();ctx.translate(0,-8);try{ringAura(S)}catch(e){}ctx.restore()}
  const parts=[],Cb=X.T([0,0,ZB+7]),dT=D(Cb);
  // dust kicked up at the start of a dash and speed lines behind the hero (effects of the game, not of the sheets)
  if(!o.noFx&&A.dust>=0&&!LOWFX)parts.push({d:D([-8,0,3]),f:()=>{for(let i=0;i<4;i++){const k=A.dust,q=P([-2-k*9-i*2.4,(i-1.5)*3.4,1+k*3+i*.4]);ctx.fillStyle=`rgba(220,205,170,${.42*(1-k)})`;ball(q,2+k*4.2+i*.6);ctx.fill()}}});
  if(!o.noFx&&A.speed>0&&!LOWFX)parts.push({d:D(X.T([-14,0,ZB+8])),f:()=>{for(let i=0;i<5;i++){const z=4+i*5,a=X.T([-12,(i-2)*3.6,z]),b=add(a,[-8-6*A.speed-(i%2)*3,0,0]),A2=P(a),B2=P(b);ctx.strokeStyle=`rgba(255,255,255,${.6*A.speed})`;ctx.lineWidth=1.6;ctx.lineCap='round';seg(A2,B2);ctx.stroke()}}});
  // the feet: always under the body, the far one darker
  if(!S0.robe&&!S0.float)for(const[sd,f] of[[-1,A.fL],[1,A.fR]]){const far=F(0,sd,0)<0;parts.push({d:dT-100+D(f)*.01,f:()=>foot(V0,f,far?(S.foot2||HC.foot2):(S.foot||HC.foot))})}
  // the mantello d'ombra hangs behind the back, over the quiver
  if(arm==='mantello_ombra')parts.push({d:D(X.T([-14,0,ZB+4])),f:()=>cape(V0,X,A.sway*.4)});
  else if(S0.cape)parts.push({d:D(X.T([-14,0,ZB+4])),f:()=>cape(V0,X,A.sway*.4,S.hood)});
  if(S0.pack)parts.push({d:D(X.T([-11.6,0,ZB+8])),f:()=>alchPack(V0,X,S0.pack)});
  if(S0.katana)parts.push({d:D(X.T([-10.4,0,ZB+9])),f:()=>katanaBack(V0,X)});
  if(S0.vials)S0.vials.forEach((c,i)=>{const t=[-1.05,-1.45,1.2][i%3],s3=X.T(surf(t,ZB+5,1.2).p);parts.push({d:D(s3),f:()=>vialAt(V0,X,t,c)})});
  // the tunic: the hull of the rings, three tones, the hem, the collar, seam and buttons, the strap of the quiver, the belt and its buckle
  const Hc=add(X.T([.5,0,ZB+15]),add(X.Rd([0,0,7.4]),A.hd)),hDep=D(Hc);
  parts.push({d:dT,f:()=>{const pts=[];for(const[dz,r] of BP)for(let i=0;i<24;i++){const t=i/24*TAU;pts.push(P(X.T([Math.cos(t)*r*AX,Math.sin(t)*r,BZ+dz])))}
    const hp=chull(pts);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of hp){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])}
    const w=x1-x0,h=y1-y0,cx=(x0+x1)/2,cy=(y0+y1)/2;
    // the tunic in three tones that blend (light from the upper left), so no patch shows an edge
    ctx.lineJoin='round';ink(2.5);poly(hp);ctx.fillStyle=soft(cx-w*.24,cy-h*.26,cx-w*.04,cy+h*.04,Math.max(w,h)*.72,S.body,.15,.28);ctx.fill();ctx.stroke();
    ctx.save();poly(hp);ctx.clip();
    // the soft shadow of the head on the shoulders
    {const hq=P(Hc),sy=hq[1]+Rh*.95,g=ctx.createRadialGradient(hq[0]+1.2,sy,1,hq[0]+1.2,sy,Rh*1.05);g.addColorStop(0,'rgba(0,0,0,.18)');g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.save();ctx.translate(0,sy);ctx.scale(1,.4);ctx.translate(0,-sy);ctx.fillStyle=g;ctx.fillRect(hq[0]-Rh*1.3,sy-Rh*1.1,Rh*2.6,Rh*2.2);ctx.restore()}
    // the hem: a darker band all round the bottom of the tunic, only where it faces us
    surfLine(V0,X,t=>surf(t,BZ+.9,.15),dk(S.body,.24),2.2,0);
    // the enemies' marks on the body: the ribs of the skeletons (and the spine at the back), the Fabbro's lava cracks, the green hem of the robes
    if(S0.ribs){for(const z of[ZB+10.6,ZB+7.6,ZB+4.6])surfLine(V0,X,k=>surf(lerp(-1.05,1.05,k),z,.1),'rgba(27,22,18,.55)',1.6,1);surfLine(V0,X,k=>surf(Math.PI,lerp(ZB+12.8,ZB+2.6,k),.1),'rgba(27,22,18,.5)',2,1)}
    if(S0.cracks){const cc=S0.p2?'#ffd86b':'#ff7a2e',rg=S0.p2?'255,216,107':'255,122,46';for(const cr of CRACKS){const at=k=>{const n=cr.length-1,i=Math.min(n-1,Math.floor(k*n)),u=k*n-i;return surf(lerp(cr[i][0],cr[i+1][0],u),lerp(cr[i][1],cr[i+1][1],u),.12)};
        if(!LOWFX){const m=at(.5),v=F(X.Rd(m.n));if(v>.1){const q=P(X.T(m.p));shine(rg,q[0],q[1],7,.3*v)}}surfLine(V0,X,at,cc,1.6,1)}}
    if(S0.robe)surfLine(V0,X,t=>surf(t,BZ+2.2,.15),'rgba(123,191,74,.55)',2,0);
    const KO=OF?{V0,X,P,F,D,S,A,anim,p,face,ZB,BZ,surf,surfLine}:null;if(OF&&OF.tunic)OF.tunic(KO);
    if(S.skinId&&!OF)for(const[t,dz] of[[-.5,9.5],[.3,6.5],[-.1,3.6],[.75,11],[-.9,5.6],[2.6,8],[3.4,4.6],[-2.4,10]]){const s=surf(t,ZB+dz,.1),v=F(X.Rd(s.n));if(v>.1){const q=P(X.T(s.p));ctx.fillStyle=S.skinId==='stellato'?'#ffffff':'#f6ff9a';ball(q,.9);ctx.fill()}}
    if(arm==='cotta'){ctx.strokeStyle='rgba(20,26,34,.32)';ctx.lineWidth=.9;for(let r=0;r<6;r++)for(let c=0;c<16;c++){const s=surf(c/16*TAU+(r%2)*.2,ZB+2+r*2.1,.1),n=X.Rd(s.n);if(F(n)<.12)continue;const q=P(X.T(s.p));ctx.beginPath();ctx.arc(q[0],q[1],1.2,0,Math.PI);ctx.stroke()}}
    if(arm==='corazza_muschio')on(V0,X.T([0,0,ZB+5.5]),1,X.Rd([.76,-.3,.1]),.05,()=>{const s=surf(-.32,ZB+5.4,.2),q=P(X.T(s.p));ctx.fillStyle='rgba(95,158,60,.6)';ell(q[0],q[1],5,3);ctx.fill();ctx.fillStyle='rgba(159,224,106,.75)';for(const[a,b] of[[-3,1],[0,2.6],[2,0]]){ball([q[0]+a,q[1]+b],.9);ctx.fill()}});
    if(arm==='giubba'&&!(OF&&OF.noGiubba)){// the collar, the seam down the front and the buttons of the leather jacket
      for(const sd of[-1,1])surfLine(V0,X,k=>surf(sd*lerp(.62,.04,k),lerp(ZB+13.2,ZB+10.8,k),.1),'rgba(27,22,18,.5)',1.3,1);
      surfLine(V0,X,k=>surf(.04,lerp(ZB+10.8,ZB+6.8,k),.1),'rgba(27,22,18,.42)',1,1,[1.6,1.6]);
      for(const z of[ZB+9.9,ZB+8]){const s=surf(.17,z,.25),n=X.Rd(s.n);if(F(n)>.1){const q=P(X.T(s.p));ctx.fillStyle=HC.button;ink(.7);ball(q,.95);ctx.fill();ctx.stroke()}}}
    if(S0.apron)apronOn(V0,X,S0.apron);
    // the strap of the quiver: over the left shoulder, across the chest to the right hip and round the back
    if(S0.strap!==false)surfLine(V0,X,t=>surf(t,ZB+8.4-4.6*Math.sin(t),.35),OF&&OF.strap||HC.strap,1.4,0);
    // the belt with the golden buckle
    if(S.belt)surfLine(V0,X,t=>surf(t,ZB+5.6,.3),S.belt,2.7,0,null,true);
    if(S.belt){const s=surf(0,ZB+5.6,.55),n=X.Rd(s.n),v=F(n);if(v>.05){const q=P(X.T(s.p)),k=Math.max(.45,v);ctx.save();ctx.globalAlpha=cl(v*4,0,1);ink(1);ctx.fillStyle=OF&&OF.buckle||HC.buckle;ctx.fillRect(q[0]-1.7*k,q[1]-2,3.4*k,4);ctx.strokeRect(q[0]-1.7*k,q[1]-2,3.4*k,4);ctx.fillStyle='#fff3c0';ctx.fillRect(q[0]-1.1*k,q[1]-1.4,1*k,1);ctx.fillStyle='#8a5a20';ctx.fillRect(q[0]-.5*k,q[1]-.4,1*k,1.6);ctx.restore()}}
    if(OF&&OF.over)OF.over(KO);
    if(S.amu)amulet(V0,X,S.amu);
    if(S0.look&&S0.look.acc==='collana')necklace(V0,X,S0.look.accCol||'#d24b3e');
    ctx.restore();rimPoly(hp,.32);
    if(A.flash>0){ctx.save();ctx.globalAlpha=A.flash*.3;poly(hp);ctx.fillStyle='#ffffff';ctx.fill();ctx.restore()}}});
  // the hood lowered (the hero's own look): on the upper back, and gathered round the neck unless the scarf is there
  const LKS=S0.look;if(LKS&&LKS.hood==='giu'){parts.push({d:D(X.T([-9.2,0,ZB+10.6])),f:()=>hoodBack(V0,X,S,A.sway)});
    if(LKS.acc!=='sciarpa'){const r=radAt(COWL_Z)+1.6;let dn=-1e9;for(let i=0;i<16;i++){const t=i/16*TAU;dn=Math.max(dn,D(X.T([Math.cos(t)*r*AX,Math.sin(t)*r,ZB+COWL_Z])))}
      parts.push({d:dT-.03,f:()=>cowl(V0,X,S.hood,false)});parts.push({d:Math.max(dT+.012,Math.min(hDep-.015,dn)),f:()=>cowl(V0,X,S.hood,true)})}}
  // the scarf of the hero's own look: its far half before the tunic, the near half after it and under the head
  if(S0.look&&S0.look.acc==='sciarpa'){const col=S0.look.accCol||'#d24b3e',r=radAt(SCARF_Z)+1.25;let dn=-1e9;for(let i=0;i<16;i++){const t=i/16*TAU;dn=Math.max(dn,D(X.T([Math.cos(t)*r*AX,Math.sin(t)*r,ZB+SCARF_Z])))}
    parts.push({d:dT-.02,f:()=>scarf(V0,X,col,A.sway,false)});parts.push({d:Math.max(dT+.01,Math.min(hDep-.01,dn)),f:()=>scarf(V0,X,col,A.sway,true)})}
  // the quiver on the back (the balestriere keeps his bolts in it too)
  if(S0.quiver!==false&&!S0.gun&&wid!=='bastone'&&!NOQ[wid]){parts.push({d:D(X.T([-11,0,ZB+6])),f:()=>quiverTube(V0,X)});parts.push({d:D(X.T(QT)),f:()=>quiverArrows(V0,X,A.jig,wid)})}
  if(OF&&OF.parts)OF.parts({V0,X,P,F,D,S,A,anim,p,face,ZB,surf,surfLine,Hc,hDep,dT},parts);
  // the skeleton's round shield, strapped on the left side in front of the body (style.shield; style.shDmg 0..1 cracks it as it wears out)
  if(S0.shield){const c3=X.T([7.6,-9.6,10.4]),n3=nrm(X.Rd([.78,-.62,.05]));parts.push({d:D(X.T([9,-10,10])),f:()=>shield(V0,c3,n3,9.2,S0)})}
  // the armour on the shoulders
  if(arm==='cotta'||arm==='corazza_muschio')for(const sd of[-1,1]){const c3=X.T([.2,sd*8.4,ZB+11.2]);parts.push({d:D(c3)+.05,f:()=>arm==='cotta'?pauldron(V0,c3,3.7):mossClump(V0,c3,1)})}
  // the bow and the hand that holds it, in front of the belly; the string hand at the right side (or on the string). No arms, as in the game
  const grip=X.T(A.grip),aim=nrm(X.Rd(A.aim)),up=nrm(X.Rd(A.up)),hR=X.T(A.hR),Bw=bowPts(grip,aim,up,A.draw,LB,BK);
  if(gunW)weaponParts(parts,V0,X,S,Wp,wid,o);
  else if(!wid){// no weapon (held: null): both hands at the sides (A.hL: the left hand somewhere else, as in 'ripara'; o.tool 'martello': the
    // hammer in the right hand, its handle along A.tool, an angle in the body's x-z plane, its head across it)
    const hL=X.T(A.hL||[A.hR[0],-A.hR[1],A.hR[2]]);
    if(o.tool==='martello'&&A.tool!=null){const a=A.tool,dir=X.Rd([Math.cos(a),0,Math.sin(a)]),crs=X.Rd([Math.sin(a),0,-Math.cos(a)]),hd=add(hR,mul(dir,6.4));
      parts.push({d:D(X.T(A.hR))+.02,f:()=>{const H0=P(hR),H1=P(hd),K0=P(sub(hd,mul(crs,1.6))),K1=P(add(hd,mul(crs,2.6)));ctx.lineCap='round';
        ctx.strokeStyle=INK;ctx.lineWidth=3.2;seg(H0,H1);ctx.stroke();ctx.strokeStyle='#8a6a42';ctx.lineWidth=1.5;seg(H0,H1);ctx.stroke();
        ctx.strokeStyle=INK;ctx.lineWidth=4.6;seg(K0,K1);ctx.stroke();ctx.strokeStyle='#4a4c56';ctx.lineWidth=2.8;seg(K0,K1);ctx.stroke();ctx.strokeStyle='rgba(220,225,240,.55)';ctx.lineWidth=.8;seg(K0,K1);ctx.stroke();
        fist(V0,hR,2.7,S.hand)}})}
    else parts.push({d:D(X.T(REST.hR)),f:()=>fist(V0,hR,2.7,S.hand)});parts.push({d:A.hL?D(hL):D(X.T([-.6,-11.4,11.4])),f:()=>fist(V0,hL,2.7,S.hand)})}
  else if(W3){// the bow in 3D: the stave, its trims, the string and the arrow sort with the two hands
    const fr=W3.frame(grip,aim,up,1),strOn=anim==='shoot'||anim==='aim',loc=q=>{const d=sub(q,grip);return[dot(d,fr.X),dot(d,fr.Y),dot(d,fr.Z)]};
    parts.push({d:D(X.T([12,0,ZB+5])),f:()=>{let pinch=null;if(A.pinch)pinch=loc(hR);else if(A.twang>0)pinch=[-(BK+A.draw*1.6)+Math.sin(A.twang*22)*1.2*A.twang,0,0];
      W3.draw('arco',V0,fr,{kind:S.bowKind||'plain',col:S.bowCol,draw:A.draw,pinch,nock:A.nock},K=>{K.hand([0,0,0],2.8,S.hand,1.2,S.ring?q=>ringOn(V0,q,S.ring):null);if(strOn)K.hand(loc(hR),2.7,S.hand,.6)})}});
    if(!strOn)parts.push({d:D(X.T(REST.hR)),f:()=>fist(V0,hR,2.7,S.hand)})}
  else{parts.push({d:D(X.T([12,0,ZB+5])),f:()=>{
    if(isX){xbow(V0,grip,aim,up,A.draw,A.nock>.5)}
    else{let pinch=A.pinch?hR:null;if(!pinch&&A.twang>0){const m=Bw.mid;pinch=add(m,mul(aim,Math.sin(A.twang*22)*1.2*A.twang))}
      const nk=A.pinch?hR:Bw.mid,arrowOn=A.nock>.02?{a:nk,b:add(grip,mul(aim,4.6)),al:A.nock}:null;bow(V0,Bw,S,A.draw,pinch,arrowOn,grip,aim)}
    fist(V0,grip,2.8,S.hand);if(S.ring)ringOn(V0,grip,S.ring)}});
  parts.push({d:anim==='shoot'||anim==='aim'?D(X.T([12,0,ZB+5]))+.01:D(X.T(REST.hR)),f:()=>fist(V0,hR,2.7,S.hand)});}
  // the head turns on its own camera (the look), the face nods
  const dv=Math.atan2(Math.sin(Math.PI/2-face),Math.cos(Math.PI/2-face)),cheat=o.noCheat?0:.42*Math.sin(dv)*cl((Math.PI-Math.abs(dv))/(Math.PI/2),0,1);
  parts.push({d:hDep,f:()=>{const Vh=Vat(face+A.hy+cheat+(o.look||0),P(Hc),hDep);head(Vh,Rh,S,A,{blink:A.blink,squint:A.squint,shut:A.shut,mouth:A.mouth,moss:!S.mask&&(o.moss&&anim==='idle'||o.moss===2),inhale:A.inhale,exhale:A.exhale,eyeLight:o.eyeLight!==false,
      eyeCol:S0.eyes,glow:S0.glowEyes&&S0.eyes?hexRgb(S0.eyes):null,blush:S0.blush,sway:A.sway});
    if(A.flash>0){ctx.save();ctx.globalAlpha=A.flash*.3;ball(P(Hc),Rh);ctx.fillStyle='#fff';ctx.fill();ctx.restore()}}});
  // the arrow flies off after the release, in front of the hero or behind him
  if(!o.noFx&&A.fly>=0&&A.fly<.5&&!isX){const k=A.fly/.5,a=add(sub(grip,mul(aim,BK+1)),mul(aim,k*44)),b=add(a,mul(aim,12));
    parts.push({d:D(add(a,mul(aim,6))),f:()=>{if(!LOWFX){const A2=P(a),B2=P(sub(a,mul(aim,10)));ctx.strokeStyle=`rgba(255,248,225,${.55*(1-k)})`;ctx.lineWidth=2;ctx.lineCap='round';seg(B2,A2);ctx.stroke()}arrow(V0,a,b,1-k*k)}})}
  run(parts);
  // dizzy stars when hit
  if(A.stars>0){const c0=P(add(Hc,[0,0,Rh+3.4]));for(let i=0;i<3;i++){const an=G.t*5+i*TAU/3;starS(c0[0]+Math.cos(an)*8,c0[1]+Math.sin(an)*2.6*KR(),1.9,A.stars)}}
  ctx.restore()}
// the Fabbro's lava cracks: [angle round the body, height] along each one (two in front, two on the back)
const CRACKS=[[[-.45,ZB+11.6],[-.2,ZB+7.4],[-.38,ZB+3]],[[.42,ZB+10],[.2,ZB+4.8]],[[2.6,ZB+11],[2.85,ZB+6.6],[2.7,ZB+3.2]],[[-2.75,ZB+9.4],[-2.95,ZB+4.4]]];
const NOQ={scettro:1,martello:1,bomba:1,liuto:1,fiala:1,stellina:1};
// the skeleton's shield: a round board of wood, thick, with an iron rim and an iron boss; seen from behind its back is darker; cracks
// spread over it as it wears out (S.shDmg), a flash when it parries (S.shHit)
function shield(V0,c,n,r,S){const{P,F}=V0;let u=cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u),N=22,f=F(n),th=1.1,fr=[],bk=[];
  for(let i=0;i<N;i++){const t=i/N*TAU,d=add(mul(u,Math.cos(t)*r),mul(v,Math.sin(t)*r));fr.push(P(add(add(c,d),mul(n,th))));bk.push(P(add(add(c,d),mul(n,-th))))}
  const H=chull(fr.concat(bk)),face=f>=0?fr:bk,q=P(add(c,mul(n,f>=0?th:-th)));
  ink(2.6);poly(H);ctx.fillStyle='#5a3a20';ctx.fill();ctx.stroke();
  const bb=[1e9,1e9,-1e9,-1e9];for(const p of face){bb[0]=Math.min(bb[0],p[0]);bb[1]=Math.min(bb[1],p[1]);bb[2]=Math.max(bb[2],p[0]);bb[3]=Math.max(bb[3],p[1])}
  poly(face);ctx.fillStyle=soft(bb[0]+(bb[2]-bb[0])*.3,bb[1]+(bb[3]-bb[1])*.28,(bb[0]+bb[2])/2,(bb[1]+bb[3])/2,Math.max(bb[2]-bb[0],bb[3]-bb[1])*.7,f>=0?'#8a5a32':'#6b4a2a',.18,.3);ctx.fill();
  if(f>=0){ctx.save();poly(face);ctx.clip();
    // the planks, the iron rim, the boss in the middle
    ctx.strokeStyle='rgba(40,22,10,.4)';ctx.lineWidth=.9;for(const k of[-.34,.34]){const a=P(add(add(c,mul(n,th)),add(mul(v,k*r),mul(u,-r)))),b=P(add(add(c,mul(n,th)),add(mul(v,k*r),mul(u,r))));seg(a,b);ctx.stroke()}
    ctx.restore();const rim2=[];for(let i=0;i<N;i++){const t=i/N*TAU;rim2.push(P(add(add(c,mul(n,th+.05)),add(mul(u,Math.cos(t)*(r-1.4)),mul(v,Math.sin(t)*(r-1.4))))))}
    ctx.strokeStyle='#9aa3ad';ctx.lineWidth=2;poly(rim2);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=.7;ctx.stroke();
    if(S.shDmg>0){ctx.save();poly(face);ctx.clip();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.lineCap='round';const nC=Math.ceil(S.shDmg*4);
      for(let i=0;i<nC;i++){const a=-1.9+i*1.25,p0=P(add(add(c,mul(n,th)),add(mul(u,Math.cos(a)*2.4),mul(v,Math.sin(a)*2.4)))),p1=P(add(add(c,mul(n,th)),add(mul(u,Math.cos(a+.25)*r*.55),mul(v,Math.sin(a+.25)*r*.55)))),p2=P(add(add(c,mul(n,th)),add(mul(u,Math.cos(a-.1)*r*.95),mul(v,Math.sin(a-.1)*r*.95))));
        ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.lineTo(p2[0],p2[1]);ctx.stroke()}ctx.restore()}
    const bq=P(add(c,mul(n,th+.9)));ink(2);ball(bq,2.5);ctx.fillStyle=soft(bq[0]-1,bq[1]-1.2,bq[0],bq[1],3,'#c9cfd6',.4,.35);ctx.fill();ctx.stroke()}
  if(S.shHit>0){ctx.save();ctx.globalAlpha=Math.min(1,S.shHit*3);poly(H);ctx.fillStyle='#fff';ctx.fill();ctx.restore()}
  rimPoly(H,.25)}
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

// only the head, its centre at x, y (the little portraits of the making of the hero): standing still, turned to `face`
function testa(x,y,face,sc,o){o=o||{};const S0=o.style||{},AR=ARM[S0.armor]||ARM.giubba,S={...S0,body:S0.body||AR[0],hood:S0.hood||AR[1],skin:S0.skin||HC.skin};
  const A=pose('idle',o.p==null?.25:o.p,o);A.hy=0;ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  try{head(Vat(face,[0,0],0),10,S,A,{blink:1,squint:0,shut:0,mouth:0,moss:false,eyeLight:true,eyeCol:S0.eyes,glow:S0.glowEyes&&S0.eyes?hexRgb(S0.eyes):null,blush:S0.blush,sway:0})}finally{ctx.restore()}}
return{arciere,testa,pose,ARM,BOWS,HC,ROBE,VESTITI,nota:musicNote,stella:starShape,fiala:flaskShape,hatCol:HAT_COL,kit:{surf,surfLine,soft,dk,lt,line,poly,sp,capPath,rotY,keys,ZB,AX,HC}}})();
