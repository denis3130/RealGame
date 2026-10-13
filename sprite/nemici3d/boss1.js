// I tre boss del primo giro della modalità Classica rifatti in 3D come l'Arciere (sprite/eroe3d/disegno_eroe.js), con la cassetta C3
// (base3d.js): stesse forme, colori e proporzioni di oggi nel gioco, ma volumi veri che girano a 360 gradi, dipinti a tre toni con la luce
// calda dall'alto a sinistra, contorno scuro spesso e bordo illuminato. Ogni mossa dipende solo da p (0..1) e si chiude su se stessa.
// - GOLEM DI MUSCHIO (golem): corpo tondo di pietra grigia, muschio sulle spalle, pugni tondi di pietra, testa piccola con la fessura
//   della visiera e gli occhi azzurri che brillano, runa verde a rombo sul petto, crepe sulla schiena. Cammina pesante dondolando;
//   'leap' si accuccia, salta e ricade schiacciando i pugni a terra; 'throw' strappa un masso da terra, lo alza sopra la testa e lo
//   scaglia; 'roll' si chiude a palla e rotola. Fase 2 (o.p2): pietra più scura, muschio e runa di lava, occhi rossi.
// - RE ROSPO (toad) e YETI DELLE VETTE (yeti): vedi più sotto.
// Opzioni comuni: o.p2 (seconda fase), o.z (altezza dal pavimento data dal gioco, al posto del salto disegnato dalla mossa),
// o.noFx (niente polvere, massi in volo e bagliori della mossa: li disegna il gioco).
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,Vat,ball,seg,tri,hull,rim,run,dk,lt,rgba,poly,line,bbox,soft,softBox,softBall,
  sp,capPath,rotX,rotY,rotZ,look,blink,keys,bump,sstep,hitK,frame,vol,ellPts,ellAt,ellN,AXES,sball,caps,chain,spot,leaf,eyes,mouth,floor,stars,parts,reg,shine,stepper}=C;

// ------------------------------------------------------------------ shared helpers
// a unit direction from an angle round the body (0 = in front, π/2 = its right) and an elevation (π/2 = straight up)
const dir=(t,e)=>[Math.cos(e)*Math.cos(t),Math.cos(e)*Math.sin(t),Math.sin(e)];
// the visible part of a cap on an ellipsoid (centre Cc, radii Rd, axes Fr, through the frame X): the cap round the unit direction n (in
// the ellipsoid's own axes) with half-angle al, cut where the surface turns away and closed along the limb (in the ellipsoid's own axes
// the limb is a great circle). Leaves the path in ctx; returns {full, rim: screen points of the cap's edge that face us} or false
// o.alv: another half-angle across (an elliptic cap: al along `o.u`, alv across); o.rf(t): bumps on the rim (moss), which only move the
// points drawn: where the cap turns away is decided on the smooth rim, so the outline never jumps
function ellCap(V0,X,Cc,Rd,Fr,n,al,N,o){Fr=Fr||AXES;N=N||36;o=o||{};n=nrm(n);let u=o.u?sub(o.u,mul(n,dot(o.u,n))):cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u),alv=o.alv||al;
  const S=m=>V0.P(X.T(ellAt(Cc,Rd,Fr,m))),g=nrm([V0.F(X.Rd(Fr.u))/Rd[0],V0.F(X.Rd(Fr.v))/Rd[1],V0.F(X.Rd(Fr.w))/Rd[2]]),b=[],bd=[],f=[];
  const at=(t,k)=>{const c=Math.cos(t),s=Math.sin(t),a=k/Math.sqrt((c/al)*(c/al)+(s/alv)*(s/alv));return add(mul(n,Math.cos(a)),add(mul(u,c*Math.sin(a)),mul(v,s*Math.sin(a))))};
  for(let i=0;i<N;i++){const t=i/N*TAU,m=at(t,1);b.push(m);bd.push(o.rf?at(t,o.rf(t)):m);f.push(dot(m,g))}
  const nv=f.filter(x=>x>=0).length;if(!nv)return false;
  if(nv===N){const pts=bd.map(S);poly(pts);return{full:true,rim:pts}}
  let s0=0;for(let i=0;i<N;i++)if(f[i]<0&&f[(i+1)%N]>=0){s0=(i+1)%N;break}
  const cut=(a,c)=>{const k=f[a]/(f[a]-f[c]);return nrm(lerp3(b[a],b[c],k))},rn=[cut((s0-1+N)%N,s0)],rd=[rn[0]];let i=s0;while(f[i]>=0){rn.push(b[i]);rd.push(bd[i]);i=(i+1)%N}rn.push(cut((i-1+N)%N,i));rd.push(rn[rn.length-1]);
  let e1=cross(g,[0,0,1]);if(len(e1)<.2)e1=cross(g,[0,1,0]);e1=nrm(e1);const e2=cross(g,e1),ang=m=>Math.atan2(dot(m,e2),dot(m,e1)),nm=a=>((a%TAU)+TAU)%TAU;
  const a0=ang(rn[rn.length-1]),a1=ang(rn[0]),ccw=nm(a1-a0),span=ccw<=Math.PI?ccw:-(TAU-ccw);// a cap smaller than half the ball meets the limb in less than half of it
  const M=Math.max(2,Math.ceil(Math.abs(span)/.2)),lb=[];for(let k=1;k<M;k++){const a=a0+span*k/M;lb.push(add(mul(e1,Math.cos(a)),mul(e2,Math.sin(a))))}
  poly(rd.concat(lb).map(S));return{full:false,rim:rd.map(S)}}
// a line on an ellipsoid through the unit directions ms (its own axes), only where the surface faces us; returns the screen runs
function ellLine(V0,X,Cc,Rd,Fr,ms,o){o=o||{};const S=m=>V0.P(X.T(ellAt(Cc,Rd,Fr,m))),fa=m=>V0.F(X.Rd(ellN(Rd,Fr,m))),pts=[],n=o.sub||3;
  for(let i=0;i<ms.length-1;i++)for(let k=0;k<n;k++)pts.push(nrm(lerp3(ms[i],ms[i+1],k/n)));pts.push(nrm(ms[ms.length-1]));if(o.closed)pts.push(pts[0]);
  const runs=[];let cur=[];for(const m of pts){if(fa(m)>(o.v0==null?.04:o.v0))cur.push(S(m));else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
  return runs.filter(r=>r.length>1)}
// the runs of points on a ball (screen centre h, radius r, camera Vb) that face us, from a list of unit directions
function ballRuns(Vb,h,r,ms,v0){const runs=[];let cur=[];for(const m of ms){if(Vb.F(m)>v0)cur.push(sp(Vb,h,r,m));else{if(cur.length>1)runs.push(cur);cur=[]}}if(cur.length>1)runs.push(cur);return runs}
const strokeRuns=(runs,col,w,dx,dy)=>{ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;ctx.lineWidth=w;for(const r of runs){ctx.beginPath();for(const q of r)ctx.lineTo(q[0]+(dx||0),q[1]+(dy||0));ctx.stroke()}};
// a crack in stone: a dark line with a thin lit lip under it; lava (an orange glowing line) in the second phase
function crackRuns(runs,lava,al){if(!runs.length)return;ctx.save();ctx.globalAlpha*=al==null?1:al;
  if(lava){if(!LOWFX){ctx.globalCompositeOperation='lighter';strokeRuns(runs,'rgba(255,120,40,.35)',4.2);ctx.globalCompositeOperation='source-over'}strokeRuns(runs,'#ff7a2e',1.9);strokeRuns(runs,'rgba(255,230,150,.8)',.7)}
  else{strokeRuns(runs,'rgba(255,248,230,.16)',1.1,.7,.9);strokeRuns(runs,'rgba(28,22,18,.72)',1.5)}ctx.restore()}
// a lumpy volume made of balls (3D centres cs, radii rs) drawn as one piece: every outline, then every fill with one soft gradient
function blob(V0,cs,rs,col,o){o=o||{};const lw=o.lw||2.2,Q=cs.map(c=>V0.P(c)),bb=[1e9,1e9,-1e9,-1e9];
  Q.forEach((q,i)=>{bb[0]=Math.min(bb[0],q[0]-rs[i]);bb[1]=Math.min(bb[1],q[1]-rs[i]);bb[2]=Math.max(bb[2],q[0]+rs[i]);bb[3]=Math.max(bb[3],q[1]+rs[i])});
  ctx.fillStyle=INK;for(let i=0;i<Q.length;i++){ball(Q[i],rs[i]+lw/2);ctx.fill()}
  ctx.fillStyle=o.fill||softBox(bb,col,o.kl,o.kd);for(let i=0;i<Q.length;i++){ball(Q[i],Math.max(.1,rs[i]-lw/2));ctx.fill()}return{Q,bb}}
// a convex volume like C3.vol but with a smooth outline (no corners on the big shapes); returns the hull for clipping (clipTo)
function svol(V0,pts3,col,o){o=o||{};const pts=C.chull(pts3.map(q=>V0.P(q)));if(pts.length<3)return pts;
  ctx.lineJoin='round';C.smooth(pts);ctx.fillStyle=o.fill||softBox(bbox(pts),col,o.kl,o.kd);ctx.fill();if(!o.noInk){ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2.5;ctx.stroke()}
  if(!o.noRim)C.rimPoly(pts,o.rim||.3);return pts}
const clipTo=hp=>{C.smooth(hp);ctx.clip()};
// bigger dizzy stars for the bosses
function bstars(c0,r,a){if(a<=0)return;for(let i=0;i<3;i++){const an=G.t*5+i*TAU/3;C.starS(c0[0]+Math.cos(an)*r,c0[1]+Math.sin(an)*r*.33*C.KR(),3,a)}}
// how a ball (centre c0 and radius r in the body's frame) sticks out of an ellipsoid (centre Cc, radii Rd scaled by k, axes Fr), taking
// the ellipsoid as flat under the ball: null when the ball is clear of it, false when it is all inside, else the cap that sticks out
// (its axis n through the frame X, half-angle al) to clip the ball with (capPath)
function outCap(X,Cc,Rd,Fr,c0,r,k){const R2=mul(Rd,k),d=sub(c0,Cc),u=[dot(d,Fr.u)/R2[0],dot(d,Fr.v)/R2[1],dot(d,Fr.w)/R2[2]],l=len(u);if(l<1e-4)return false;
  const m=mul(u,1/l),n=ellN(R2,Fr,m),h=dot(sub(c0,ellAt(Cc,R2,Fr,m)),n);if(h>=r)return null;if(h<=-r)return false;return{n:X.Rd(n),al:Math.acos(cl(-h/r,-1,1))}}
// the part of a ball (screen centre q, radius Rr) inside the cap round n with half-angle al, as screen points (as C3.capPath, which
// draws it): {pts, rim, full} or false when none of it faces us
function capPts(V0,q,Rr,n,al){n=nrm(n);let u=cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u),ca=Math.cos(al),sa=Math.sin(al),N=36,b=[],f=[];
  for(let i=0;i<N;i++){const t=i/N*TAU,m=add(mul(n,ca),add(mul(u,Math.cos(t)*sa),mul(v,Math.sin(t)*sa)));b.push(m);f.push(V0.F(m))}
  const nv=f.filter(x=>x>=0).length;if(!nv)return false;if(nv===N){const pts=b.map(m=>sp(V0,q,Rr,m));return{pts,rim:pts,full:true}}
  let s0=0;for(let i=0;i<N;i++)if(f[i]<0&&f[(i+1)%N]>=0){s0=(i+1)%N;break}
  const cut=(a,c)=>{const k=f[a]/(f[a]-f[c]);return nrm(lerp3(b[a],b[c],k))},rn=[cut((s0-1+N)%N,s0)];let i=s0;while(f[i]>=0){rn.push(b[i]);i=(i+1)%N}rn.push(cut((i-1+N)%N,i));
  const rim=rn.map(m=>sp(V0,q,Rr,m)),a0=Math.atan2(rim[0][1]-q[1],rim[0][0]-q[0]),a1=Math.atan2(rim[rim.length-1][1]-q[1],rim[rim.length-1][0]-q[0]);
  const nm=a=>((a%TAU)+TAU)%TAU,ccw=nm(a0-a1),span=ccw<=Math.PI?ccw:-(TAU-ccw),M=Math.max(2,Math.ceil(Math.abs(span)/.15)),pts=rim.slice();
  for(let k=1;k<M;k++){const a=a1+span*k/M;pts.push([q[0]+Math.cos(a)*Rr,q[1]+Math.sin(a)*Rr])}return{pts,rim,full:false}}
// draws f() (a ball at the screen point q, radius r) clipped to the part that sticks out (oc from outCap), with a crease where it goes in.
// A cap bigger than half the ball is drawn as the ball minus the small cap that is hidden
function sunkDraw(V0,q,r,oc,f){if(oc===false)return;if(!oc){f();return}const big=oc.al>Math.PI/2,n=big?mul(oc.n,-1):oc.n,al=big?Math.PI-oc.al:oc.al,R1=r+1.6,cp=capPts(V0,q,R1,n,al);
  if(big&&!cp){f();return}if(!big&&!cp)return;
  ctx.save();ctx.beginPath();if(big){ctx.arc(q[0],q[1],R1+2,0,TAU);ctx.closePath()}ctx.moveTo(cp.pts[0][0],cp.pts[0][1]);for(const w of cp.pts)ctx.lineTo(w[0],w[1]);ctx.closePath();ctx.clip(big?'evenodd':'nonzero');f();ctx.restore();
  const c2=capPts(V0,q,r,n,al);if(c2&&c2.rim.length>1){ctx.save();ctx.beginPath();for(const w of c2.rim)ctx.lineTo(w[0],w[1]);if(c2.full)ctx.closePath();ctx.strokeStyle='rgba(28,22,18,.8)';ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.restore()}}
// draws f() as one picture faded to k (no outlines showing through): into a small canvas round the screen point q (radius r in the
// current units), then pasted with the alpha. Used for the head and fists sinking into the golem's body when it curls up
let OC=null;
function fadeDraw(f,q,r,k){if(k>=.99){f();return}if(k<=.01)return;const T=ctx.getTransform(),S=Math.hypot(T.a,T.b),dx=T.a*q[0]+T.c*q[1]+T.e,dy=T.b*q[0]+T.d*q[1]+T.f,R=Math.ceil(r*S+6),W=2*R;
  if(!OC)OC=document.createElement('canvas');if(OC.width<W)OC.width=OC.height=W;const oc=OC.getContext('2d');oc.setTransform(1,0,0,1,0,0);oc.clearRect(0,0,W,W);
  oc.setTransform(T.a,T.b,T.c,T.d,T.e-(dx-R),T.f-(dy-R));const saved=ctx;ctx=oc;try{f()}finally{ctx=saved}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha*=k;ctx.drawImage(OC,0,0,W,W,dx-R,dy-R,W,W);ctx.restore()}
// a tremble of the window a..b of a move: hz shakes per second (at most ~8: faster ones turn into a random jitter on the frames of a phone)
// for a move of dur seconds, easing in and out at the edges of the window so it never starts or stops with a jump
const trem=(p,a,b,hz,dur)=>{const w=Math.min(.03,(b-a)/3);return sstep(a,a+w,p)*(1-sstep(b-w,b,p))*Math.sin((p-a)*TAU*hz*dur)};
// built-in effects of a move (dust puffs...) only when the game does not draw its own and the phone is fast
const fxOn=o=>!o.noFx&&!LOWFX;
// as the hero's head: seen from the side the head turns a little toward the camera, so the face shows (none from the front or the back)
const cheat=(face,k)=>{const dv=Math.atan2(Math.sin(Math.PI/2-face),Math.cos(Math.PI/2-face));return k*Math.sin(dv)*cl((Math.PI-Math.abs(dv))/(Math.PI/2),0,1)};
// a few puffs of dust round a 3D point (k 0..1: spreading and fading)
function dust(V0,c,k,n,r,rgb){for(let i=0;i<n;i++){const a=i/n*TAU+.4,d=r*(.4+k*.9),q=V0.P(add(c,[Math.cos(a)*d,Math.sin(a)*d,k*6+(i%2)*2]));ctx.fillStyle=`rgba(${rgb||'205,195,175'},${.5*(1-k)})`;ball(q,2.4+k*4.5);ctx.fill()}}

// a patch of moss growing on an ellipsoid (round the unit direction m in its own axes): a bumpy soft-green cap with a darker edge,
// a lighter middle and a few tufts; in the second phase of the golem a glowing patch of lava
function mossPatch(V0,X,Cc,Rd,Fr,m,k,seed,K,lava){const fn=V0.F(X.Rd(ellN(Rd,Fr,m)));if(fn<-.2)return;
  const r=ellCap(V0,X,Cc,Rd,Fr,m,.36*k,30,{alv:.27*k,u:[0,0,1],rf:t=>1+.1*Math.sin(t*6+seed)+.05*Math.sin(t*11+seed*2)});if(!r)return;
  const q=V0.P(X.T(ellAt(Cc,Rd,Fr,m))),bb=[q[0]-11*k,q[1]-8*k,q[0]+11*k,q[1]+8*k];
  ctx.save();if(lava&&!LOWFX)shine('255,120,40',q[0],q[1],16*k,.55);
  ctx.fillStyle=softBox(bb,K.moss,.25,.25);ctx.fill();ctx.lineJoin='round';ctx.strokeStyle=dk(K.moss,.5);ctx.lineWidth=1.3;ctx.stroke();ctx.clip();
  // the tufts: light dots on the patch, only where they face us
  let u=cross(m,[0,0,1]);if(len(u)<.2)u=[1,0,0];u=nrm(u);const w=cross(m,u);
  ctx.fillStyle=K.mossL;for(const[a,b,rr] of[[-.2,.05,1.5],[.02,.12,1.7],[.2,0,1.4],[-.08,-.1,1.2],[.12,-.12,1.1],[-.26,-.08,1]]){const mm=nrm(add(m,add(mul(w,a*k),mul(u,b*k))));
    if(V0.F(X.Rd(ellN(Rd,Fr,mm)))>.05){ball(V0.P(X.T(ellAt(Cc,Rd,Fr,mm))),rr*k);ctx.fill()}}
  ctx.restore()}

// ------------------------------------------------------------------ GOLEM DI MUSCHIO (drawGolem in src/js/16-creature.js, golemUpd in 12-ia-nemici.js)
const GO={stone:'#7d7568',dark:'#625b50',moss:'#6fa040',mossL:'#a8dc6a',eye:'#7fe0f0',eyeRgb:'127,224,240',rune:'#6fa040',runeRgb:'150,230,100',rock:'#857b6c'},
  GO2={stone:'#6e655c',dark:'#544c45',moss:'#ff7a2e',mossL:'#ffd86b',eye:'#ff6a3a',eyeRgb:'255,100,50',rune:'#ff7a2e',runeRgb:'255,120,40',rock:'#6e655c'};
// rest: the body (centre, radii), the head, the fists (y = ±), the feet; the ball it curls into
const GB=[0,0,33],GR=[26,31,21],GH=[11,0,60],GRh=12,GF=[8,33,27],GFr=12,GT=[3,14,0],GBall=28;
// cracks on the stone: [angle round, elevation] in the body's own axes (front flanks, back, a small one on the head)
const GCR=[[[1.15,.28],[.9,.12],[.78,-.04],[.5,-.2]],[[-1.02,-.4],[-.8,-.52],[-.72,-.72]],
  [[2.95,.75],[3.1,.5],[2.98,.25],[3.16,.02],[3.05,-.2]],[[-2.75,.6],[-2.62,.36],[-2.7,.18]],[[2.4,.1],[2.25,-.12],[2.32,-.3]]].map(c=>c.map(a=>dir(a[0],a[1])));
const GHCR=[[-.5,.85],[-.42,.6],[-.55,.42]].map(a=>dir(a[0],a[1]));
// the rune: a diamond on the upper chest (pushed up so the camera, looking down, sees it where the game draws it)
const GRUNE=[[0,.81],[.2,.44],[0,.07],[-.2,.44]].map(a=>dir(a[0],a[1]));
// the moss cushions on the shoulders: [angle round, elevation, size]
const GMOSS=[[1.42,1.12,1,1.3],[-1.47,1.15,.92,4.1]];
function gPose(anim,p,o){const ph=p*TAU,A={B:[0,0,0],lean:0,roll:0,s:0,sx:0,yaw:0,hd:[0,0,0],hy:0,hp:.04,hL:[GF[0],-GF[1],GF[2]],hR:GF.slice(),
  fL:[GT[0],-GT[1],0],fR:GT.slice(),blink:1,shut:0,glow:1,curl:0,spin:0,rock:0,rockAt:null,fly:-1,charge:0,dust:-1,dustAt:null,stars:0,air:0};
  if(anim==='walk'){// heavy steps: the body dips on each footfall and sways over the planted foot, the fists swing against the feet
    const st=stepper(p,.5),a=st(0,8,4.2),b=st(.5,8,4.2),imp=Math.cos((p-.05)*TAU*2);
    A.fL=[GT[0]+a.x,-GT[1],a.z];A.fR=[GT[0]+b.x,GT[1],b.z];A.B=[0,-2*Math.sin(ph),-1.6*imp+.4];A.s=-.035*Math.max(0,imp);A.roll=-.085*Math.sin(ph);A.lean=.08;A.yaw=.07*Math.sin(ph);
    const sw=Math.cos(ph-.4);A.hR=add(GF,[9*sw,2,2*Math.max(0,sw)-1.4*imp]);A.hL=add([GF[0],-GF[1],GF[2]],[-9*sw,-2,2*Math.max(0,-sw)-1.4*imp]);
    A.hd=[0,0,-.9*Math.cos((p-.13)*TAU*2)];A.hy=-.06*Math.sin(ph);A.hp=.07}
  else if(anim==='leap'){// .0-.3 crouches deep with the fists swung back (the rune lights up), .3 springs up swinging them forward, .36-.76 in
    // the air with both fists raised over the head, .8 slams them down on the floor, .8-1 bounces back and settles. Built-in jump unless
    // the game gives the height (o.z)
    const K=[[0,[0,0,0,.04,0, 8,33,27, 0]],[.1,[-.06,.08,-.02,.04,-1, 6,34,22, .2]],[.27,[-.18,.2,-.04,.12,-4, -5,35,13, 1]],[.3,[-.19,.22,-.02,.12,-4, -6,35,12, 1]],
      [.36,[.14,-.06,0,-.1,2, 10,28,54, .7]],[.48,[.05,-.14,0,-.16,1, 4,16,84, .5]],[.66,[.02,-.18,0,-.15,0, -2,14,88, .4]],[.76,[.06,.16,0,.08,0, 18,17,46, .3]],
      [.8,[-.24,.26,.1,.16,-2, 24,25,11, 0]],[.86,[.06,.14,-.02,.06,1, 20,26,14, 0]],[.93,[-.04,.05,0,.04,0, 12,30,22, 0]],[1,[0,0,0,.04,0, 8,33,27, 0]]];
    const v=keys(K,p);A.s=v[0];A.lean=v[1];A.sx=v[2];A.hp=v[3];A.hd=[0,0,v[4]];A.hL=[v[5],-v[6],v[7]];A.hR=[v[5],v[6],v[7]];A.charge=v[8];
    if(p>.2&&p<.3)A.B=[0,.6*trem(p,.2,.3,8,1.6),0];
    const air=p>.31&&p<.8?Math.sin((p-.31)/.49*Math.PI):0;A.air=air;A.lift=34*air;
    if(air>0){A.fL=[GT[0]+2,-GT[1]+2,0];A.fR=[GT[0]+2,GT[1]-2,0]}
    A.dust=p>=.8&&p<.98?(p-.8)/.18:-1;A.dustAt='fists'}
  else if(anim==='throw'){// .0-.12 bends down and tears a boulder out of the floor, .12-.38 lifts it over its head, .38-.5 winds up leaning
    // back, .5-.56 hurls it (let go at .54), .56-1 follows through and comes back
    const K=[[0,[0,0,0,0,  8,-33,27, 8,33,27, .04]],[.12,[.2,-.08,-.06,-.1, 20,-28,9, 6,31,30, .3]],[.18,[.14,-.05,-.03,-.05, 16,-28,24, 6,31,29, .2]],
      [.38,[-.12,.04,.03,.12, 0,-24,76, 4,32,28, -.12]],[.5,[-.2,.06,.04,.24, -9,-21,81, 3,33,29, -.14]],[.56,[.22,-.02,-.04,-.14, 24,-18,50, 9,31,25, .1]],
      [.66,[.26,-.05,-.08,-.12, 27,-17,24, 2,30,30, .18]],[.82,[.08,-.02,-.02,-.02, 14,-30,26, 6,32,28, .08]],[1,[0,0,0,0, 8,-33,27, 8,33,27, .04]]];
    const v=keys(K,p);A.lean=v[0];A.roll=v[1];A.s=v[2];A.yaw=v[3];A.hL=[v[4],v[5],v[6]];A.hR=[v[7],v[8],v[9]];A.hp=v[10];
    // the boulder: it bursts out of the floor in front of the fist (.1-.16), the fist takes it up (.16-.26), it rides on the fist till the throw
    A.rock=p<.1||p>=.54?0:p<.16?1:p<.26?2:3;A.rockK=p<.16?ez((p-.1)/.06):p<.26?ez((p-.16)/.1):1;A.fly=p>=.54&&p<.7?(p-.54)/.16:-1;A.dust=p>.09&&p<.3?(p-.09)/.21:-1;A.dustAt='scoop';
    if(p>.44&&p<.5)A.B=[0,.5*trem(p,.44,.5,8,1.2),0]}
  else if(anim==='roll'){// .0-.14 crouches, .14-.24 curls up into a ball, .24-.8 rolls (the game drives the spin with o.spin), .8-.9 unfolds
    // with a pop, .9-1 settles
    const c=p<.14?0:p<.24?ez((p-.14)/.1):p<.8?1:p<.9?1-ez((p-.8)/.1):0;A.curl=c;
    const pre=p<.14?ez(p/.14):p<.24?1:p<.8?1:p<.9?0:0;A.s=-.1*pre*(1-c)-.12*c+(p>.8&&p<.97?.08*Math.sin((p-.8)/.17*Math.PI):0);A.lean=.2*pre*(1-c);A.hp=.04+.25*pre*(1-c);A.charge=p<.24?pre:0;
    A.hL=lerp3([GF[0],-GF[1],GF[2]],[13,-27,16],pre);A.hR=lerp3(GF,[13,27,16],pre);A.hd=[0,0,-4*pre];
    const rk=p<.24?0:p<.8?(p-.24)/.56:1;A.spin=o.spin!=null?o.spin:ez(rk)*TAU*3;A.B=[0,0,c>.99?2.5*Math.abs(Math.sin(rk*Math.PI*6)):0];
    if(p>.9)A.B=[0,.5*trem(p,.9,1,8,2.4)*(1-p)*10,0];A.dust=p>=.8&&p<.95?(p-.8)/.15:-1;A.dustAt='feet'}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.24*kb;A.B=[-3*kb,0,.5*kb];A.s=-.06*kb;A.roll=.05*kb;A.hp=.04-.22*kb;A.hd=[-1.5*kb,0,1.2*kb];
    A.hL=add([GF[0],-GF[1],GF[2]],[-5*kb,-4*kb,7*kb]);A.hR=add(GF,[-5*kb,4*kb,7*kb]);A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;A.glow=p<.5?.6:1}
  else{// idle: slow deep breaths, the head looks round, the eyes pulse and blink, the fists sway a little behind the breath
    const b=Math.sin(ph);A.s=.014*b;A.B=[0,0,.25*b];A.hd=[0,0,.5*Math.sin(ph-.5)];A.hy=look(p,.4);A.hp=.04+.03*Math.sin(ph+1);
    A.hL=add([GF[0],-GF[1],GF[2]],[0,-.4*b,.7*Math.sin(ph-.7)]);A.hR=add(GF,[0,.4*b,.7*Math.sin(ph-.9)]);A.blink=blink(p,.62,.09);A.glow=.8+.2*Math.sin(ph*2)}
  return A}
function golem(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const K=o.p2?GO2:GO,lava=!!o.p2,V0=V(face),{P,D,F}=V0,A=gPose(anim,p,o);
  const lift=o.z!=null?o.z/sc:A.lift||0;A.B[2]+=lift;
  const X=frame(A,0),cu=A.curl,Rb=lerp3(GR,[GBall,GBall,GBall],cu),Cb=lerp3(GB,[0,0,GBall],cu),cs=Math.cos(A.spin),sn=Math.sin(A.spin),
    Fr=cu>0&&A.spin?{u:[cs,0,-sn],v:[0,1,0],w:[sn,0,cs]}:AXES;
  floor(V0,x,y,sc,[A.B[0],A.B[1],0],40*(1-.1*cu),13,.4,A.B[2]);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),dB=D(GB);
  // the feet: squat stones under the body, always behind it (tucked away inside the ball when it rolls)
  if(cu<.6)for(const[sd,f] of[[-1,A.fL],[1,A.fR]]){const fk=sstep(0,-.12,F(0,sd,0)),c=[f[0]+A.B[0],f[1]+A.B[1],6+f[2]+lift+cu*8];
    L.add(dB-100+D([GT[0],sd*GT[1],6])*.01,()=>svol(V0,ellPts(c,[9.5,8.5,6],null,6,18),dk(K.dark,.12*fk),{lw:2.6,kl:.12,kd:.25}))}
  // the body: the round stone, its cracks, the rune, the moss on the shoulders
  L.add(dB,()=>{const hp=svol(V0,ellPts(Cb,Rb,Fr,8,22).map(X.T),K.stone,{lw:3,kl:.17,kd:.32});
    ctx.save();clipTo(hp);
    // the soft shadow of the head on the shoulders
    if(cu<.3){const hq=P(X.T(add(GH,A.hd))),sy=hq[1]+GRh*.9,g=ctx.createRadialGradient(hq[0]+1.5,sy,1,hq[0]+1.5,sy,GRh*1.25);g.addColorStop(0,'rgba(20,14,10,.2)');g.addColorStop(1,'rgba(20,14,10,0)');
      ctx.save();ctx.translate(0,sy);ctx.scale(1,.45);ctx.translate(0,-sy);ctx.fillStyle=g;ctx.fillRect(hq[0]-GRh*1.5,sy-GRh*1.3,GRh*3,GRh*2.6);ctx.restore()}
    for(const c of GCR)crackRuns(ellLine(V0,X,Cb,Rb,Fr,c),lava);
    // the rune: a diamond inlaid in the chest (it lights up when the golem gathers itself for a jump or a roll)
    {const runs=ellLine(V0,X,Cb,Rb,Fr,GRUNE,{closed:true,sub:4,v0:.1});if(runs.length){const ch=Math.max(A.charge,lava?.6:0);
      if(ch>0&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';strokeRuns(runs,rgba(K.rune,.35*ch),6);ctx.restore();const q=V0.P(X.T(ellAt(Cb,Rb,Fr,dir(0,.44))));shine(K.runeRgb,q[0],q[1],16,.45*ch)}
      strokeRuns(runs,dk(K.stone,.38),3.8);strokeRuns(runs,ch>0?lt(K.rune,.35*ch):K.rune,2.2)}}
    ctx.restore();
    // moss on the shoulders: soft patches growing on the stone, a bumpy edge and lighter tufts (glowing lava in phase 2)
    for(const[t,e,k,sd] of GMOSS)mossPatch(V0,X,Cb,Rb,Fr,dir(t,e),k,sd,K,lava)});
  // the head: a small stone ball with the slot of the visor and two glowing eyes; it looks round on its own camera. When the golem
  // curls up, the head and the fists sink into the stone: a copy behind the body (only what sticks out shows) and the front copy fading
  const tA=1-sstep(0,.6,cu),Hc=X.T(lerp3(add(GH,A.hd),[5,0,28],cu)),Rh=GRh*(1-.25*cu);
  const head=()=>{const h=P(Hc),Vh=Vat(face+A.yaw+A.hy+cheat(face,.32),h,0),nod=v=>rotY(v,A.hp+A.lean);
    sball(V0,Hc,Rh,K.stone,{lw:3,kl:.17,kd:.3});
    ctx.save();ball(h,Rh-1.2);ctx.clip();
    // the crack on top and the visor: a carved groove round the front of the head over the eyes, with a lit lower lip
    crackRuns(ballRuns(Vh,h,Rh*.98,GHCR.map(m=>nrm(nod(m))),.05),lava,.9);
    {const r=ballRuns(Vh,h,Rh*.99,Array.from({length:17},(_,i)=>nrm(nod(dir(-1.25+i/16*2.5,.33)))),.04);strokeRuns(r,'rgba(255,240,215,.22)',1.2,0,1.6);strokeRuns(r,INK,2.6)}
    // the eyes: glowing slits under the visor (squeezed into two lit strokes when it is hit)
    const E=eyes(Vh,h,Rh,{dir:[1,.42,-.1],nod,kind:'glow',col:A.shut||lava?K.eye:lt(K.eye,.2),rx:3.1,ry:2.1,lightCol:'#ffffff',lr:.7,blink:A.blink,shut:A.shut,shutCol:K.eye,a:.62,b:.76});
    if(!LOWFX&&!A.shut)for(const e of E)if(e.rx>.6)shine(K.eyeRgb,e.q[0],e.q[1],9,.5*A.glow*A.blink*Math.min(1,e.v*2));
    ctx.restore();rim(h,Rh,h,Rh,.3)};
  const hc0=lerp3(add(GH,A.hd),[5,0,28],cu);if(cu<.97)L.add(D([GH[0],0,GB[2]])+3,()=>sunkDraw(V0,P(Hc),Rh,outCap(X,Cb,Rb,Fr,hc0,Rh,lerp(.9,1,cu)),head));
  // the fists: round stones beside the body with the fingers curled (the left one tears up and throws the boulder)
  const fist=(sd,c,r)=>{const q=sball(V0,c,r,K.stone,{lw:3,kl:.17,kd:.3});
    // the curled fingers: three grooves over the knuckles, which face forward and down
    const kd=nrm(X.Rd([1,sd*.25,-.55]));ctx.save();ball(q,r-1.2);ctx.clip();
    let ax=cross(kd,[0,0,1]);if(len(ax)<.2)ax=[0,1,0];ax=nrm(ax);const up=nrm(cross(ax,kd));
    for(const k of[-.42,0,.42]){const pts=[];for(let j=0;j<=6;j++){const e=-.85+j/6*1.5,m=nrm(add(add(mul(kd,Math.cos(e)),mul(up,Math.sin(e))),mul(ax,k)));if(V0.F(m)>.08)pts.push(sp(V0,q,r*.98,m))}
      if(pts.length>1)strokeRuns([pts],'rgba(28,22,18,.45)',1.3)}
    ctx.restore();
    // the boulder torn from the floor, sitting on the fist
    if(sd<0&&A.rock>1)rockAt(c)};
  // the boulder: out of the floor (only what is above the floor shows, a dark hole round it), then on the fist
  const RG=[27,-31,11],rockAt=c=>{const top=c&&add(c,[0,0,GFr+9]),w=A.rock===1?[RG[0],RG[1],lerp(-12,RG[2],A.rockK)]:A.rock===2?lerp3(RG,top,A.rockK):top;
    sunkDraw(V0,P(w),11.6,w[2]<11.6?{n:[0,0,1],al:Math.acos(cl(-w[2]/11.6,-1,1))}:null,()=>rockBall(V0,w,11,K))};
  if(A.rock===1)L.add(D([GF[0],-GF[1],GB[2]])+.01,()=>rockAt(null));
  for(const sd of[-1,1]){const c0=lerp3(sd<0?A.hL:A.hR,[4,sd*13,28],cu),c=X.T(c0),r=GFr*(1-.25*cu),f=()=>fist(sd,c,r);
    if(cu<.97)L.add(D([GF[0],sd*GF[1],GB[2]]),cu>0?()=>sunkDraw(V0,P(c),r,outCap(X,Cb,Rb,Fr,c0,r,lerp(.72,1,cu)),f):f)}
  // the boulder flying off after the throw (the game throws its own)
  if(A.fly>=0&&!o.noFx){const k=A.fly,c=X.T(add([24,-18,50],[k*60,0,14*Math.sin(k*Math.PI)-k*6]));L.add(D(c)+50,()=>{ctx.save();ctx.globalAlpha*=1-k*k;rockBall(V0,c,11,K);ctx.restore()})}
  // dust where the fists or the feet hit the floor
  if(A.dust>=0&&fxOn(o)){L.add(dB+60,()=>{const k=A.dust;if(A.dustAt==='fists')for(const sd of[-1,1])dust(V0,X.T([28,sd*22,0]),k,6,10);
    else if(A.dustAt==='scoop')dust(V0,[22,-28,0],k,5,8,'190,175,150');else dust(V0,[0,0,0],k,9,26)})}
  run(L);
  if(A.stars>0)bstars(P(X.T([GH[0],0,GH[2]+GRh+7])),15,A.stars);
  ctx.restore()}
// a boulder: a lumpy stone ball with a lit top and a dab of moss
const RL=[1,.92,1.06,.95,1.02,.9,1.05,.97];
function rockBall(V0,c,r,K){const q=V0.P(c),pts=[];for(let i=0;i<8;i++){const a=i/8*TAU;pts.push([q[0]+Math.cos(a)*r*RL[i],q[1]+Math.sin(a)*r*RL[(i+3)%8]*.95])}
  ctx.lineJoin='round';C.smooth(pts);ctx.fillStyle=softBall(q,r,K.rock,.18,.32);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke();
  if(r>7){ctx.fillStyle=K===GO2?'#ff9a4a':'#7fb84a';ctx.beginPath();ctx.ellipse(q[0]+r*.15,q[1]-r*.55,r*.42,r*.2,-.2,0,TAU);ctx.fill()}rim(q,r,q,r,.28)}
reg('golem',{n:'Golem di Muschio',g:'boss',sc:1,an:['idle','walk','leap','throw','roll','hit'],dur:{idle:2.6,walk:1.05,leap:1.6,throw:1.2,roll:2.4,hit:.6},
  lab:{idle:'Fermo',walk:'Cammina',leap:'Salto',throw:'Lancio del masso',roll:'Rotolata',hit:'Colpito'}},golem);

// ------------------------------------------------------------------ RE ROSPO (EDRAW.toad and EUPD.toad in src/js/29-cap3-boss.js)
// a huge green toad that is all head and belly: big yellow eyes on two bumps with a slit pupil, a wide mouth, a cream belly, dark spots,
// a golden crown with a red gem between the eyes, folded haunches and small front hands. It hops heavily; 'tongue' rears back and lashes
// its tongue out; 'flop' jumps high and lands on its belly; 'bubbles' swells its throat and spits a spray of bubbles. Phase 2 (o.p2):
// a browner green, glowing orange spots, the crown askew. o.tip = [dx, dy]: where the tip of the tongue is on the screen (the game's own
// tongue, 250 px long), else the tongue goes out in front of it
const TD={body:'#6a8a3a',dark:'#4a6a2a',belly:'#e0d8a0',spot:'#3f5a22',eye:'#ffcf3c',crown:'#ffd23c',gem:'#e5484d',tongue:'#e86a8a',mouth:'#5a1f2e',sac:'#f6eec4'},
  TD2=Object.assign({},TD,{body:'#7a7a2a',dark:'#4a4a1a',spot:'#ff9a3c'});
const TB=[0,0,31],TR=[30,36,22],TE=[8,16,57.5],TEr=9.5,TC=[1,0,55.5];
// the spots on the back and sides: [angle round, elevation, radius]
const TSP=[[2.25,.5,4.2],[-2.2,.6,3.8],[2.95,.18,3.6],[-2.8,.12,3.2],[1.85,.9,3.2],[-1.8,.95,3.4],[3.14,.8,3.6],[1.4,.12,3.6],[-1.42,.22,3.2],[2.5,-.2,2.8],[-2.48,-.25,3],[1.15,1.25,2.6],[-1.2,1.28,2.8],[2.75,1.1,2.6]];
// the hind legs: [hip, knee, ankle, foot] for sitting (folded), pushing off (stretched back) and hanging in the air (right side, y > 0)
const TLF=[[-13,21,17],[-5,29,14],[-14,30,6.5],[-1,34,1.8]],TLP=[[-12,21,17],[-20,29,11],[-31,30,5],[-38,31,2]],TLH=[[-12,21,17],[-8,28,5],[-14,29,-7],[-11,30,-11]];
function tPose(anim,p,o){const ph=p*TAU,A={B:[0,0,0],lean:0,roll:0,s:0,sx:0,yaw:0,leg:[1,0,0],hand:[0,0,0],sac:0,open:0,tl:0,blink:1,squint:0,shut:0,look:0,ctilt:0,cz:0,stars:0,dust:-1,fx:-1,air:0};
  if(anim==='walk'){// a heavy hop: it pushes off with the hind legs (p=0), flies low with the legs trailing, lands on its hands with a squash
    // (.47) that wobbles the whole body, then gathers itself for the next hop
    const K=[[0,[.1,-.1,0, .2,.8,0]],[.12,[.06,-.08,0, .3,.5,0]],[.35,[.02,.04,0, .7,.2,0]],[.47,[-.15,.08,.06, 1,0,0]],[.56,[.05,.02,-.02, 1,0,0]],[.66,[-.04,.03,.01, 1,0,0]],
      [.78,[.01,.02,0, 1,0,0]],[.92,[-.07,.06,.02, 1,0,0]],[1,[.1,-.1,0, .2,.8,0]]];
    const v=keys(K,p);A.s=v[0];A.lean=v[1];A.sx=v[2];A.leg=[v[3],v[4],v[5]];const air=p<.47?Math.sin(p/.47*Math.PI):0;A.air=air;A.lift=14*air;
    A.hand=[3*air,0,2*air];A.cz=-1.6*air+(p>.47&&p<.7?2*Math.sin((p-.47)/.23*Math.PI):0);A.dust=p>=.47&&p<.75?(p-.47)/.28:-1;A.yaw=look(p,.04)}
  else if(anim==='tongue'){// .0-.56 rears back puffing up, the eyes narrow; .57 the mouth snaps open and the tongue lashes
    // out (out by .69), holds and wobbles, .75-.97 it is pulled back in; a gulp
    const K=[[0,[0,0,0,0,0]],[.3,[-.1,-.03,0,.5,.05]],[.53,[-.17,-.04,0,.8,.07]],[.57,[.16,.04,0,.6,.08]],[.7,[.2,.03,0,.5,.06]],[.8,[.08,0,0,.3,.04]],[.93,[-.02,.03,0,0,.04]],[1,[0,0,0,0,0]]];
    const v=keys(K,p);A.lean=v[0];A.s=v[1];A.sac=v[2];A.squint=v[3];A.sx=v[4];A.open=p<.56?0:p<.6?ez((p-.56)/.04):p<.93?1:1-ez((p-.93)/.06);
    A.tl=p<.57?0:p<.69?ez((p-.57)/.12):p<.75?1:p<.97?1-ez((p-.75)/.22):0;if(p>.48&&p<.56)A.B=[0,.5*trem(p,.48,.56,8,1.3),0]}
  else if(anim==='flop'){// .0-.3 squats down (it trembles at the end), .3 springs up, .36-.8 high in the air with the legs hanging and the belly
    // out, .8 lands flat on its belly with a splash, .8-1 the whole body wobbles and the crown bounces
    const K=[[0,[0,0,0,0, 1,0,0, 0]],[.25,[-.2,.12,.06,0, 1,0,0, .6]],[.3,[-.22,.13,.07,0, 1,0,0, .7]],[.36,[.24,-.2,-.06,0, 0,1,0, .3]],[.48,[.1,-.26,-.03,0, 0,.3,.7, 0]],
      [.7,[.06,-.18,0,0, 0,0,1, 0]],[.78,[.04,.04,0,0, 0,0,1, 0]],[.8,[-.33,.06,.12,0, 1,0,0, .5]],[.85,[.1,.02,-.03,0, 1,0,0, .2]],[.9,[-.08,0,.03,0, 1,0,0, 0]],[.95,[.03,0,0,0, 1,0,0, 0]],[1,[0,0,0,0, 1,0,0, 0]]];
    const v=keys(K,p);A.s=v[0];A.lean=v[1];A.sx=v[2];A.leg=[v[4],v[5],v[6]];A.squint=v[7];if(p>.2&&p<.3)A.B=[0,.6*trem(p,.2,.3,8,1.6),0];
    const air=p>.31&&p<.8?Math.sin((p-.31)/.49*Math.PI):0;A.air=air;A.lift=40*air;A.hand=[4*air,6*air,-3*air];
    A.cz=p>.8&&p<.95?6*Math.sin((p-.8)/.15*Math.PI):-2*air;A.ctilt=p>.8&&p<.98?.15*Math.sin((p-.8)/.18*Math.PI*2):0;A.dust=p>=.8&&p<.98?(p-.8)/.18:-1}
  else if(anim==='bubbles'){// .0-.62 the throat swells into a great bubble, .62 it spits a spray of bubbles (the mouth opens, the throat empties),
    // .7-1 settles
    const K=[[0,[0,0,0,0]],[.55,[-.08,.04,.05,1]],[.62,[-.1,.05,.06,1]],[.67,[.12,-.03,-.02,.25]],[.8,[.04,0,0,.05]],[1,[0,0,0,0]]];
    const v=keys(K,p);A.lean=v[0];A.s=v[1];A.sx=v[2];A.sac=v[3];A.open=p>.61&&p<.82?Math.sin((p-.61)/.21*Math.PI)*.9:0;A.fx=p>=.62&&p<.9?(p-.62)/.28:-1;A.squint=p>.6&&p<.75?.5:0}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.24*kb;A.B=[-3*kb,0,.6*kb];A.s=-.1*kb;A.roll=.06*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;A.cz=3*kb;A.ctilt=.2*kb;A.open=.35*(1-sstep(.34,.46,p))}
  else{// idle: it breathes deep (the throat pulses), looks round, blinks; the crown sits a little loose
    const b=Math.sin(ph);A.s=.03*b;A.sx=.02*Math.sin(ph+1);A.yaw=look(p,.22);A.look=Math.sin(ph-1)*.5;A.blink=blink(p,.42,.07);A.cz=.4*Math.sin(ph-.6);A.ctilt=.03*Math.sin(ph-.3)}
  return A}
function toad(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const K=o.p2?TD2:TD,V0=V(face),{P,D,F}=V0,A=tPose(anim,p,o);A.B[2]+=o.z!=null?o.z/sc:A.lift||0;
  const X=frame(A,0),Zc=TB[2],dB=D(TB),lw=3;
  floor(V0,x,y,sc,[A.B[0],A.B[1],0],40,13,.4,A.B[2]);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  // the hind legs: thick folded haunches with a flat foot (stretched back when it pushes off, hanging when it flies), the far one darker
  for(const sd of[-1,1]){const w=A.leg,j=i=>{const a=TLF[i],b=TLP[i],c=TLH[i];return X.T([a[0]*w[0]+b[0]*w[1]+c[0]*w[2],sd*(a[1]*w[0]+b[1]*w[1]+c[1]*w[2]),a[2]*w[0]+b[2]*w[1]+c[2]*w[2]])};
    const fk=sstep(0,-.12,F(0,sd,0)),col=dk(K.dark,.12*fk);
    L.add(D([-10,sd*27,Zc]),()=>{const pts=[j(0),j(1),j(2)],ft=j(3),fd=nrm(X.Rd([1,sd*.35,0]));
      svol(V0,ellPts(ft,[8.5,5.2,2.6],{u:fd,v:nrm(cross([0,0,1],fd)),w:[0,0,1]},3,12),dk(K.body,.12*fk),{lw:2.4,kl:.2,kd:.25});
      chain(V0,pts,[13,11,6.5],col,{lw:2.8,kl:.18,kd:.3})})}
  // the body (head and belly in one): the green ball with its spots, the cream belly, the wide mouth
  L.add(dB,()=>{const hp=svol(V0,ellPts(TB,TR,null,8,24).map(X.T),K.body,{lw,kl:.2,kd:.32});ctx.save();clipTo(hp);
    for(const[t,e,r] of TSP){const m=dir(t,e),n=X.Rd(ellN(TR,null,m));spot(V0,X.T(ellAt(TB,TR,null,m)),n,r,K.spot,{v0:.05});if(o.p2&&!LOWFX&&F(n)>.2){const q=P(X.T(ellAt(TB,TR,null,m)));shine('255,150,60',q[0],q[1],r*2.4,.35)}}
    if(ellCap(V0,X,TB,TR,null,dir(0,.2),.78,36,{alv:.5,u:[0,1,0]})){ctx.fillStyle=softBox(bbox([P(X.T([24,-26,10])),P(X.T([24,26,40]))]),K.belly,.25,.18);ctx.fill()}
    // the mouth: a wide line from cheek to cheek with the corners turned up; open, a dark hole in the middle
    const mo=[];for(let i=0;i<=12;i++){const t=-1.08+i/12*2.16,k=t/1.08;mo.push(dir(t,.56+.22*k*k))}
    if(A.open>.02&&ellCap(V0,X,TB,TR,null,dir(0,.5),.34*A.open+.08,24,{alv:.12+.2*A.open,u:[0,1,0]})){ctx.save();ctx.globalAlpha*=sstep(.02,.12,A.open);ctx.fillStyle=K.mouth;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();ctx.restore()}
    strokeRuns(ellLine(V0,X,TB,TR,null,mo,{v0:.06}),INK,2.6);
    ctx.restore()});
  // the front legs: short arms coming out from under the chin (behind the body, so only what shows below it is seen) and small flat hands
  for(const sd of[-1,1]){const hc=X.T(add([11,sd*14.5,2.2],[A.hand[0],sd*A.hand[1],A.hand[2]]));
    L.add(dB-.3,()=>caps(V0,X.T([6,sd*16,12]),4.8,add(hc,[0,0,1.2]),3.8,K.body,{lw:2.4,kl:.2,kd:.3}));
    L.add(D([18,sd*13,Zc]),()=>{const fd=nrm(X.Rd([1,sd*.3,0]));svol(V0,ellPts(hc,[7,4.6,2.4],{u:fd,v:nrm(cross([0,0,1],fd)),w:[0,0,1]},3,12),K.body,{lw:2.2,kl:.22,kd:.25})})}
  // the throat sac: a cream bubble that swells out of the throat
  if(A.sac>.04)L.add(D([24,0,Zc])+.5,()=>{const r=6+14*A.sac,c0=[16+12*A.sac,0,27-2*A.sac],c=X.T(c0),q=P(c);
    sunkDraw(V0,q,r,outCap(X,TB,TR,AXES,c0,r,1),()=>{ink(2.4);ball(q,r);ctx.fillStyle=soft(q[0]-r*.35,q[1]-r*.4,q[0],q[1],r*1.2,K.sac,.5,.16);ctx.fill();ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.ellipse(q[0]-r*.38,q[1]-r*.42,r*.26,r*.15,-.5,0,TAU);ctx.fill()})});
  // the eyes: two green bumps on top with big yellow eyes, a black slit pupil and a point of light; the lid comes down to blink
  for(const sd of[-1,1]){const c=X.T([TE[0],sd*TE[1],TE[2]]);L.add(D([TE[0],sd*TE[1],Zc])+4,()=>{const q=sball(V0,c,TEr,K.body,{lw:2.8,kl:.22,kd:.3}),n=nrm(X.Rd([1,sd*.32,.42]));
      const sq=A.shut?0:A.blink*(1-.55*A.squint),cp=capPts(V0,q,TEr*.97,n,.74);if(!cp)return;ctx.save();ctx.beginPath();for(const w of cp.pts)ctx.lineTo(w[0],w[1]);ctx.closePath();
      ctx.fillStyle=softBall(q,TEr,K.eye,.3,.18);ctx.fill();ctx.clip();
      // the slit pupil across the eye, a point of light
      let hu=cross(n,[0,0,1]);if(len(hu)<.2)hu=[0,1,0];hu=nrm(hu);const vu=cross(hu,n),pc=sp(V0,q,TEr,nrm(add(n,mul(hu,A.look*.18)))),hw=5.2*Math.max(.35,Math.min(1,F(n)*1.3));
      ctx.strokeStyle=INK;ctx.lineCap='round';ctx.lineWidth=2.8;seg([pc[0]-hw,pc[1]],[pc[0]+hw,pc[1]]);ctx.stroke();
      const hl=sp(V0,q,TEr,nrm(add(n,add(mul(hu,-.3),mul(vu,-.38)))));ctx.fillStyle='#fff';ball(hl,1.6);ctx.fill();
      // the lid: green from the top of the eye down, shut when hit (a dark line where it closes)
      if(sq<.98){const lid=sp(V0,q,TEr,nrm(add(n,mul(vu,-.7+1.4*sq)))),top=sp(V0,q,TEr*1.2,nrm(add(n,mul(vu,1.4))));ctx.fillStyle=soft(q[0]-4,q[1]-6,q[0],q[1],TEr*1.4,K.body,.25,.2);ctx.beginPath();
        ctx.rect(q[0]-TEr*1.3,top[1]-TEr,TEr*2.6,lid[1]-top[1]+TEr);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.8;seg([q[0]-TEr,lid[1]],[q[0]+TEr,lid[1]]);ctx.stroke()}
      ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();for(const w of cp.rim)ctx.lineTo(w[0],w[1]);if(cp.full)ctx.closePath();ctx.stroke()})}
  // the crown: a golden band with five points and a red gem in front, sitting between the eyes (askew in phase 2)
  L.add(D([TC[0],0,Zc])+3.5,()=>crown(V0,X,add(TC,[0,0,A.cz]),(o.p2?.22:-.06)+A.ctilt,K));
  // the tongue: from the mouth out to its sticky tip (to o.tip on the screen when the game gives it)
  if(A.tl>.01){const m0=X.T(ellAt(TB,TR,null,dir(0,.52))),tip=o.tip?null:X.T([28+70*A.tl,0,30-6*A.tl]);
    L.add(D(m0)+2,()=>{const a=P(m0),b=o.tip?[o.tip[0]/sc,o.tip[1]/sc]:P(tip),wob=Math.sin(p*TAU*8*1.3)*2*sstep(.85,.97,A.tl),mid=[(a[0]+b[0])/2-(b[1]-a[1])*.06+wob,(a[1]+b[1])/2+(b[0]-a[0])*.06];
      ctx.lineCap='round';const path=()=>{ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(mid[0],mid[1],b[0],b[1])};
      path();ctx.strokeStyle=INK;ctx.lineWidth=10;ctx.stroke();ctx.strokeStyle=K.tongue;ctx.lineWidth=6.6;ctx.stroke();ctx.strokeStyle='rgba(255,220,230,.6)';ctx.lineWidth=1.8;ctx.save();ctx.translate(-.6,-1.2);path();ctx.stroke();ctx.restore();
      ink(2.5);ball(b,6.6);ctx.fillStyle=softBall(b,6.6,K.tongue,.3,.25);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.6)';ball([b[0]-2.2,b[1]-2.4],1.6);ctx.fill()})}
  // dust and splashes where it lands, bubbles spat out of the mouth
  if(A.dust>=0&&fxOn(o))L.add(dB+60,()=>dust(V0,[A.B[0],0,0],A.dust,9,anim==='flop'?30:24,'150,190,160'));
  if(A.fx>=0&&fxOn(o)){const m0=X.T(ellAt(TB,TR,null,dir(0,.5)));L.add(D(m0)+3,()=>{const k=A.fx;for(let i=0;i<5;i++){const an=(i-2)*.32,d=6+k*46*(.7+.3*Math.sin(i*2.1)),q=P(add(m0,[Math.cos(an)*d,Math.sin(an)*d,Math.sin(i*1.7)*4+k*6]));
    ctx.strokeStyle=`rgba(225,250,255,${.9*(1-k)})`;ctx.lineWidth=1.5;ball(q,2.6+i%3);ctx.stroke();ctx.fillStyle=`rgba(190,240,255,${.25*(1-k)})`;ctx.fill()}})}
  run(L);
  if(A.stars>0)bstars(P(X.T([TC[0],0,TC[2]+16])),18,A.stars);
  ctx.restore()}
// a crown in 3D: a band round the point c (in the body's frame), tilted by `tilt` about the forward axis; points and valleys along the top,
// the far side's inside first (darker gold), then the near side; the gem in front
function crown(V0,X,c,tilt,K){const{P,F}=V0,N=10,R0=11,ca=Math.cos(tilt),sa=Math.sin(tilt),T=v=>{const y=v[1]*ca-v[2]*sa,z=v[1]*sa+v[2]*ca;return X.T(add(c,[v[0],y,z]))},Rd=v=>X.Rd([v[0],v[1]*ca-v[2]*sa,v[1]*sa+v[2]*ca]);
  const B=[],Tp=[],nf=[];for(let i=0;i<=N;i++){const a=i/N*TAU,h=i%2?4.6:13,r=R0*(i%2?1.03:1.15);B.push(P(T([Math.cos(a)*R0*.86,Math.sin(a)*R0,0])));Tp.push(P(T([Math.cos(a)*r*.86,Math.sin(a)*r,h])))}
  for(let i=0;i<N;i++){const a=(i+.5)/N*TAU;nf.push(F(Rd([Math.cos(a),Math.sin(a),0])))}
  const quad=i=>{ctx.beginPath();ctx.moveTo(B[i][0],B[i][1]);ctx.lineTo(B[i+1][0],B[i+1][1]);ctx.lineTo(Tp[i+1][0],Tp[i+1][1]);ctx.lineTo(Tp[i][0],Tp[i][1]);ctx.closePath()};
  ctx.lineJoin='round';ctx.lineCap='round';const bb=bbox(B.concat(Tp)),cw=C.cmix(K.crown,'#a0600c',.42),cx=(bb[0]+bb[2])/2,cy=(bb[1]+bb[3])/2,gf=ctx.createLinearGradient(bb[0],bb[1],bb[2],bb[3]);gf.addColorStop(0,lt(K.crown,.5));gf.addColorStop(.45,K.crown);gf.addColorStop(1,cw);
  for(let i=0;i<N;i++)if(nf[i]<0){quad(i);ctx.fillStyle=cw;ctx.fill();ctx.strokeStyle=cw;ctx.lineWidth=.8;ctx.stroke()}
  for(let i=0;i<N;i++)if(nf[i]<0){ctx.strokeStyle=INK;ctx.lineWidth=2;seg(Tp[i],Tp[i+1]);ctx.stroke()}
  for(let i=0;i<N;i++)if(nf[i]>=0){quad(i);ctx.fillStyle=gf;ctx.fill();ctx.strokeStyle=gf;ctx.lineWidth=.8;ctx.stroke()}
  ctx.strokeStyle=INK;ctx.lineWidth=2;for(let i=0;i<N;i++)if(nf[i]>=0){seg(Tp[i],Tp[i+1]);ctx.stroke();seg(B[i],B[i+1]);ctx.stroke()}
  for(let i=0;i<N;i++)if((nf[i]>=0)!==(nf[(i+1)%N]>=0)){seg(B[i+1],Tp[i+1]);ctx.stroke()}
  // the gem on the front, between two points
  {const gn=Rd([1,0,0]),v=F(gn);if(v>0){const g=P(T([R0*.9,0,5.6])),r=2.3*Math.max(.45,v);ctx.save();ctx.globalAlpha*=cl(v*4,0,1);ink(1.2);ctx.fillStyle=K.gem;ctx.beginPath();ctx.ellipse(g[0],g[1],r,2.3,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.75)';ball([g[0]-r*.35,g[1]-.8],.7);ctx.fill();ctx.restore()}}}
reg('toad',{n:'Re Rospo',g:'boss',sc:1,an:['idle','walk','tongue','flop','bubbles','hit'],dur:{idle:2.4,walk:.8,tongue:1.3,flop:1.6,bubbles:1.2,hit:.6},
  lab:{idle:'Fermo',walk:'Saltella',tongue:'Linguata',flop:'Panciata',bubbles:'Bolle',hit:'Colpito'}},toad);

// ------------------------------------------------------------------ YETI DELLE VETTE (EDRAW.yeti and EUPD.yeti in src/js/31-cap4-boss.js)
// a big white furry yeti: a soft body and head made of round clumps of fur along the outline, a blue-grey face with glowing blue eyes
// under angry brows, a little fang, curved grey horns, long furry arms with blue-grey hands, blue-grey feet. It lumbers along swinging
// its arms; 'pound' raises both fists and slams them on the floor; 'snowball' scoops up a big snowball, lifts it over its head and
// heaves it forward; 'leap' crouches, jumps and lands on fists and feet; 'roar' fills its chest and roars. Phase 2 (o.p2): red eyes
const YE={fur:'#eef3f8',furL:'#ffffff',furD:'#b8c6d8',mark:'rgba(120,140,170,.55)',belly:'rgba(150,170,200,.35)',skin:'#7a8aa8',hand:'#4a5a8a',horn:'#9aa3ad',eye:'#7fe0ff',eyeRgb:'127,224,255',mouth:'#3a1a2a'},
  YE2=Object.assign({},YE,{eye:'#ff5a5a',eyeRgb:'255,90,90'});
const YB=[0,0,38],YR=[22,27,26],YH=[10,0,69],YHR=[12.5,14.5,12.5],YS=[0,24,52],YF=[3,12,0];
// the clumps of fur on a ball: unit directions in rings (staggered) and their sizes
function clumps(rings){const out=[];rings.forEach(([e,n,r],i)=>{for(let k=0;k<n;k++){const t=(k+(i%2)*.5)/n*TAU;out.push({m:dir(t,e),r:r*(1+.12*Math.sin(k*2.7+i))})}});return out}
const YBC=clumps([[-1.05,6,6],[-.62,10,7],[-.2,12,7.5],[.22,12,7.5],[.62,10,7],[1,7,6.5],[1.35,3,6]]),YHC=clumps([[-.85,6,4.6],[-.35,9,5],[.15,10,5],[.6,8,4.8],[1.05,5,4.4]]);
// a ball of fur: the ellipsoid (centre Cc, radii Rd) through the frame X, its outline made of the clumps that sit near it (they stay on
// the body as it turns, so the fluffy edge never crawls); skip(m): clumps left out (the face); one soft white-to-blue shading
function furBall(V0,X,Cc,Rd,cl,K,o){o=o||{};const{P,F}=V0,core=C.chull(ellPts(Cc,Rd,null,6,16).map(q=>P(X.T(q)))),rim=[];
  for(const c of cl){if(o.skip&&o.skip(c.m))continue;const n=nrm(X.Rd(ellN(Rd,null,c.m))),f=F(n);if(Math.abs(f)>.62)continue;const s=ellAt(Cc,Rd,null,c.m),rr=c.r*(o.k||1);
    rim.push({q:P(X.T(add(s,mul(ellN(Rd,null,c.m),-rr*.62)))),r:rr})}
  const bb=bbox(core);for(const w of rim){bb[0]=Math.min(bb[0],w.q[0]-w.r);bb[1]=Math.min(bb[1],w.q[1]-w.r);bb[2]=Math.max(bb[2],w.q[0]+w.r);bb[3]=Math.max(bb[3],w.q[1]+w.r)}
  const lw=o.lw||2.8,w=bb[2]-bb[0],h=bb[3]-bb[1],cx=(bb[0]+bb[2])/2,cy=(bb[1]+bb[3])/2,g=ctx.createRadialGradient(cx-w*.24,cy-h*.28,Math.max(w,h)*.04,cx-w*.04,cy+h*.04,Math.max(w,h)*.74);
  g.addColorStop(0,K.furL);g.addColorStop(.45,K.fur);g.addColorStop(1,K.furD);
  ctx.fillStyle=INK;ctx.lineJoin='round';C.smooth(core);ctx.strokeStyle=INK;ctx.lineWidth=lw;ctx.stroke();for(const c of rim){ball(c.q,c.r+lw/2);ctx.fill()}
  ctx.fillStyle=o.fill||g;C.smooth(core);ctx.fill();for(const c of rim){ball(c.q,Math.max(.2,c.r-lw/2));ctx.fill()}
  C.rimPoly(core,.28);return core}
// a little curl of fur (the game's 'u' marks): an arc on the surface where it faces us
function furMark(V0,X,Cc,Rd,m,k,col){const n=X.Rd(ellN(Rd,null,m)),f=V0.F(n);if(f<.15)return;const s=X.T(ellAt(Cc,Rd,null,m));let u=cross(n,[0,0,1]);if(len(u)<.2)u=[1,0,0];u=nrm(u);const v=nrm(cross(u,n));
  const a=V0.P(add(s,add(mul(u,-3*k),mul(v,3*k)))),b=V0.P(add(s,mul(v,-.6*k))),c=V0.P(add(s,add(mul(u,3*k),mul(v,3*k))));ctx.save();ctx.globalAlpha*=cl((f-.15)*4,0,1);ctx.strokeStyle=col;ctx.lineWidth=1.6;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(b[0],b[1]+(b[1]-(a[1]+c[1])/2),c[0],c[1]);ctx.stroke();ctx.restore()}
const YMK=[[.5,.55],[-.6,.75],[.15,.1],[-.75,.05],[.9,-.3],[-.2,-.42],[2.6,.6],[-2.7,.5],[3.1,.1],[2.3,-.25],[-2.35,-.3],[1.6,.3],[-1.6,.4]].map(a=>dir(a[0],a[1]));
function yPose(anim,p,o){const ph=p*TAU,A={B:[0,0,0],lean:0,roll:0,s:0,sx:0,yaw:0,hy:0,hp:.03,hd:[0,0,0],hL:[4,-28,14],hR:[4,28,14],eL:null,eR:null,fL:[YF[0],-YF[1],0],fR:YF.slice(),
  blink:1,squint:0,shut:0,brow:0,roar:0,ball:0,ballAt:null,fly:-1,breath:-1,dust:-1,dustAt:null,stars:0,air:0,shake:0};
  if(anim==='walk'){// a heavy lumbering walk: each foot lands with a dip, the body rolls over it, the long arms swing against the legs
    const st=stepper(p,.5),a=st(0,9,5),b=st(.5,9,5),imp=Math.cos((p-.05)*TAU*2),sw=Math.cos(ph-.3);
    A.fL=[YF[0]+a.x,-YF[1],a.z];A.fR=[YF[0]+b.x,YF[1],b.z];A.B=[0,-2.2*Math.sin(ph),-1.8*imp+.5];A.s=-.04*Math.max(0,imp);A.roll=-.09*Math.sin(ph);A.lean=.1;A.yaw=.08*Math.sin(ph);
    A.hR=[4+10*sw,29,15+3*Math.max(0,sw)];A.hL=[4-10*sw,-29,15+3*Math.max(0,-sw)];A.hd=[0,0,-1*Math.cos((p-.13)*TAU*2)];A.hy=-.07*Math.sin(ph);A.hp=.06}
  else if(anim==='pound'){// .0-.42 rears up with both fists over its head (it rises on its toes), .42-.5 slams them down on the floor in
    // front, .5-.62 holds the blow (snow bursts), .62-1 straightens up
    const K=[[0,[0,0,0,.03, 4,28,14]],[.15,[.04,-.06,0,-.05, 4,28,50]],[.36,[.1,-.18,1.5,-.2, -6,13,92]],[.42,[.12,-.2,2,-.22, -8,12,94]],[.5,[-.26,.2,-1,.05, 26,15,4]],
      [.58,[-.2,.18,-1,.04, 27,16,3]],[.7,[.04,.08,0,.04, 18,22,10]],[.85,[-.02,.03,0,.04, 8,27,14]],[1,[0,0,0,.03, 4,28,14]]];
    const v=keys(K,p);A.s=v[0];A.lean=v[1];A.B=[0,0,v[2]];A.hp=v[3];A.hR=[v[4],v[5],v[6]];A.hL=[v[4],-v[5],v[6]];A.sx=p>.48&&p<.6?.06:0;A.brow=p<.5?1:.6;A.squint=p>.3&&p<.6?.4:0;
    if(p>.38&&p<.43)A.B[1]=.6*trem(p,.38,.43,8,1.2);A.dust=p>=.48&&p<.75?(p-.48)/.27:-1;A.dustAt='fists'}
  else if(anim==='snowball'){// .0-.16 scoops snow off the floor (a snowball grows between its hands), .16-.44 lifts it over its head,
    // .44-.54 winds up leaning back, .54-.62 heaves it forward and down (let go at .6), .62-1 follows through and comes back
    const K=[[0,[0,0,0,.03, 4,28,14]],[.14,[.25,-.04,0,.25, 22,10,8]],[.2,[.2,-.03,0,.15, 20,10,20]],[.44,[-.12,.02,.03,-.15, 2,10,88]],[.54,[-.22,.03,.04,-.2, -6,10,90]],
      [.6,[.28,-.02,-.04,.18, 26,11,34]],[.68,[.3,0,-.06,.2, 28,13,14]],[.84,[.06,0,-.01,.06, 12,24,14]],[1,[0,0,0,.03, 4,28,14]]];
    const v=keys(K,p);A.lean=v[0];A.roll=v[1];A.s=v[2];A.hp=v[3];A.hR=[v[4],v[5],v[6]];A.hL=[v[4],-v[5],v[6]];
    A.ball=p<.06?0:p<.16?ez((p-.06)/.1):p<.6?1:0;A.fly=p>=.6&&p<.78?(p-.6)/.18:-1;A.dust=p>.06&&p<.26?(p-.06)/.2:-1;A.dustAt='scoop';A.brow=1}
  else if(anim==='leap'){// .0-.28 crouches with the arms swung back, .28 springs up with the arms flung up, .34-.78 in the air (arms spread),
    // .8 lands on its feet and fists, .8-1 straightens up. Built-in jump unless the game gives the height (o.z)
    const K=[[0,[0,0,0,.03, 4,28,14]],[.24,[-.2,.22,-.04,.15, -14,30,18]],[.28,[-.21,.24,-.03,.15, -15,30,17]],[.34,[.16,-.1,0,-.1, 6,26,74]],[.5,[.05,-.12,0,-.12, 6,36,62]],
      [.7,[.03,-.06,0,-.06, 10,34,52]],[.78,[.06,.12,0,.06, 22,26,28]],[.8,[-.26,.3,.1,.2, 24,22,3]],[.87,[.04,.16,-.02,.08, 20,24,8]],[.94,[-.03,.05,0,.04, 9,27,13]],[1,[0,0,0,.03, 4,28,14]]];
    const v=keys(K,p);A.s=v[0];A.lean=v[1];A.sx=v[2];A.hp=v[3];A.hR=[v[4],v[5],v[6]];A.hL=[v[4],-v[5],v[6]];if(p>.18&&p<.28)A.B=[0,.6*trem(p,.18,.28,8,1.6),0];
    const air=p>.29&&p<.8?Math.sin((p-.29)/.51*Math.PI):0;A.air=air;A.lift=36*air;if(air>0){A.fL=[YF[0]-2,-YF[1]-2,0];A.fR=[YF[0]-2,YF[1]+2,0]}
    A.brow=1;A.dust=p>=.8&&p<.98?(p-.8)/.18:-1;A.dustAt='land'}
  else if(anim==='roar'){// .0-.25 fills its chest leaning back, the arms open; .25-.8 roars leaning forward, mouth wide open, arms spread with
    // the fists clenched, the whole body shaking, a cloud of frosty breath; .8-1 calms down
    const K=[[0,[0,0,0,.03, 4,28,14, 0]],[.22,[.06,-.16,0,-.3, -4,31,26, 0]],[.3,[-.04,.1,.04,-.32, 12,36,40, 1]],[.72,[-.03,.12,.04,-.3, 13,37,42, 1]],[.84,[0,.04,0,-.06, 8,30,20, .2]],[1,[0,0,0,.03, 4,28,14, 0]]];
    const v=keys(K,p);A.s=v[0];A.lean=v[1];A.sx=v[2];A.hp=v[3];A.hR=[v[4],v[5],v[6]];A.hL=[v[4],-v[5],v[6]];A.roar=v[7];A.hd=[3*v[7],0,-1*v[7]];A.brow=1;A.squint=.3*v[7];
    if(p>.3&&p<.75){A.B=[0,.7*trem(p,.3,.75,8,1.4),0];A.shake=1}A.breath=p>=.3&&p<.8?(p-.3)/.5:-1}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.26*kb;A.B=[-3*kb,0,.6*kb];A.s=-.08*kb;A.roll=.06*kb;A.hp=.03-.24*kb;A.hd=[-1.6*kb,0,1.2*kb];
    A.hR=[4-6*kb,30+4*kb,14+12*kb];A.hL=[4-6*kb,-30-4*kb,14+12*kb];A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0}
  else{// idle: slow heavy breaths (the fur rises), the head looks round, a blink; the arms hang and sway a little
    const b=Math.sin(ph);A.s=.02*b;A.B=[0,0,.4*b];A.hd=[0,0,.6*Math.sin(ph-.5)];A.hy=look(p,.38);A.hp=.03+.04*Math.sin(ph+1);A.blink=blink(p,.55,.08);
    A.hR=[4+1.2*Math.sin(ph-.8),28+.6*b,14+.8*Math.sin(ph-.8)];A.hL=[4+1.2*Math.sin(ph-1),-28-.6*b,14+.8*Math.sin(ph-1)]}
  return A}
function yeti(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const K=o.p2?YE2:YE,V0=V(face),{P,D,F}=V0,A=yPose(anim,p,o);const lift=o.z!=null?o.z/sc:A.lift||0;A.B[2]+=lift;
  const X=frame(A,0),Zc=YB[2],dB=D(YB);
  floor(V0,x,y,sc,[A.B[0],A.B[1],0],38,12,.38,A.B[2]);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  // the feet: blue-grey pads under the fur, always behind the body
  for(const[sd,f] of[[-1,A.fL],[1,A.fR]]){const fk=sstep(0,-.12,F(0,sd,0)),c=[f[0]+A.B[0],f[1]+A.B[1],5+f[2]+lift];
    L.add(dB-100+D([YF[0],sd*YF[1],5])*.01,()=>svol(V0,ellPts(c,[10,7.5,5.5],null,6,18),dk(K.hand,.15*fk),{lw:2.6,kl:.2,kd:.28}))}
  // the body: a ball of fur with its curls and the bluish belly
  L.add(dB,()=>{const core=furBall(V0,X,YB,YR,YBC,K);ctx.save();clipTo(core);
    if(ellCap(V0,X,YB,YR,null,dir(0,-.1),.62,30,{alv:.58})){ctx.fillStyle=K.belly;ctx.fill()}
    for(const m of YMK)furMark(V0,X,YB,YR,m,1.1,K.mark);ctx.restore()});
  // the arms: long furry arms (two bones, the elbow bends out and back) ending in blue-grey hands; the far one darker
  const arm=(sd,h)=>{const sh=X.T([YS[0],sd*YS[1],YS[2]]),hd=X.T(h),[el,hh]=C.ik(sh,hd,17,17,X.Rd([-.4,sd*.8,-.2])),fk=sstep(0,-.12,F(0,sd,0)),cs=[],rs=[];
    for(let i=0;i<=4;i++){const k=i/4;cs.push(i<=2?lerp3(sh,el,k*2):lerp3(el,hh,(k-.5)*2));rs.push(lerp(9,6.8,k)*[1,.9,1,.92,1][i])}
    const bl=blob(V0,cs,rs,K.fur,{lw:2.8,fill:(()=>{const bb=[1e9,1e9,-1e9,-1e9];for(const c of cs){const q=P(c);bb[0]=Math.min(bb[0],q[0]-9);bb[1]=Math.min(bb[1],q[1]-9);bb[2]=Math.max(bb[2],q[0]+9);bb[3]=Math.max(bb[3],q[1]+9)}
      const g=ctx.createLinearGradient(bb[0],bb[1],bb[2],bb[3]);g.addColorStop(0,C.cmix(K.furL,K.fur,fk));g.addColorStop(.55,C.cmix(K.fur,C.cmix(K.fur,K.furD,.4),fk));g.addColorStop(1,K.furD);return g})()});
    sball(V0,add(hh,X.Rd([0,0,-3])),7,dk(K.hand,.15*fk),{lw:2.6,kl:.2,kd:.28});return hh};
  for(const sd of[-1,1])L.add(D([4,sd*YS[1],Zc]),()=>{const hh=arm(sd,sd<0?A.hL:A.hR);if(sd>0&&A.ball>0&&A.ballAt!=='x')snowball()});
  // the snowball between the hands (scooped up, lifted, heaved)
  const snowball=()=>{const c=lerp3(X.T(A.hL),X.T(A.hR),.5),r=13*(.35+.65*A.ball),q=P(add(c,X.Rd([0,0,A.hL[2]>60?9:r*.7])));ink(2.6);ball(q,r);ctx.fillStyle=soft(q[0]-r*.35,q[1]-r*.4,q[0],q[1],r*1.2,'#f4f8ff',.6,.16);ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(150,180,215,.35)';ball([q[0]+r*.25,q[1]+r*.3],r*.45);ctx.fill();rim(q,r,q,r,.3)};
  if(A.fly>=0&&!o.noFx){const k=A.fly,c=X.T([30+k*60,0,30-k*24]);L.add(D(c)+50,()=>{if(c[2]<0)return;const q=P(c),r=13;ctx.save();ctx.globalAlpha*=1-k*k;ink(2.6);ball(q,r);ctx.fillStyle=soft(q[0]-r*.35,q[1]-r*.4,q[0],q[1],r*1.2,'#f4f8ff',.6,.16);ctx.fill();ctx.stroke();ctx.restore()})}
  // the head: a ball of fur turning on its own (the look), the blue face, glowing eyes, brows, a fang, the curved horns
  const Hc=X.T(add(YH,A.hd)),hy=A.yaw+A.hy+cheat(face,.32),hp=A.hp+A.lean*.6,HR=v=>X.Rd(rotZ(rotY(v,hp),hy)),Xh={T:q=>add(Hc,HR(q)),Rd:HR},FD=dir(0,.22);
  L.add(D([YH[0],0,Zc])+4,()=>{
    const horn=sd=>{const pts=[[1,sd*9.5,5],[-2,sd*16.5,8.5],[-6,sd*20.5,14.5],[-7,sd*19.5,21],[-5,sd*16.5,26.5]].map(Xh.T);chain(V0,pts,[3.7,3.2,2.6,1.9,1.1],K.horn,{lw:2.4,kl:.3,kd:.3})};
    const hornFar=sd=>F(X.Rd([0,sd,0]))<-.25;for(const sd of[-1,1])if(hornFar(sd))horn(sd);
    const core=furBall(V0,Xh,[0,0,0],YHR,YHC,K,{skip:m=>dot(m,FD)>.62,lw:2.6});
    // the face: a blue-grey oval on the front of the head
    const fr=ellCap(V0,Xh,[0,0,0],YHR,null,FD,.76,32,{alv:.9,u:[0,0,1]});if(fr){const q=P(Xh.T([12,0,0]));ctx.fillStyle=soft(q[0]-5,q[1]-6,q[0],q[1],16,K.skin,.18,.22);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.stroke()}
    const at=m=>({q:P(Xh.T(ellAt([0,0,0],YHR,null,m))),v:F(Xh.Rd(ellN(YHR,null,m)))}),h=P(Hc);
    if(fr){ctx.save();clipTo(fr.full?fr.rim:core);
      // the eyes: glowing slits; angry brows over them
      const E=eyes(null,h,13,{at,dir:[1,.3,.3],kind:'glow',col:A.shut?K.eye:lt(K.eye,.25),rx:2.5,ry:1.8,lightCol:'#ffffff',lr:.6,blink:A.blink,squint:A.squint,shut:A.shut,shutCol:K.eye,a:.55,b:.7});
      if(!LOWFX&&!A.shut)for(const e of E)if(e.rx>.5)shine(K.eyeRgb,e.q[0],e.q[1],6,.38*A.blink*Math.min(1,e.v*2));
      for(const sd of[-1,1]){const a=at(nrm([1,sd*.55,.56])),b=at(nrm([1,sd*.17,.44+.04*A.brow]));if(Math.min(a.v,b.v)>.05){ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.lineCap='round';seg(a.q,b.q);ctx.stroke()}}
      // the mouth: a line with one little fang, or wide open with two fangs when it roars
      const mm=at(nrm([1,0,-.1]));if(mm.v>.1){const w=4.4*Math.max(.4,Math.min(1,mm.v*1.3));
        if(A.roar>.05){const hh=1.6+3.4*A.roar;ink(1.4);ctx.fillStyle=K.mouth;ctx.beginPath();ctx.ellipse(mm.q[0],mm.q[1]+hh*.35,w*1.15,hh,0,0,TAU);ctx.fill();ctx.stroke();
          ctx.fillStyle='#ffffff';ctx.strokeStyle=INK;ctx.lineWidth=.7;for(const sd of[-1,1])tri(mm.q[0]+sd*w*.55,mm.q[1]+hh*.35-hh+.2,mm.q[0]+sd*w*.45,mm.q[1]+hh*.35-hh+2.6,.95)}
        else{ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.lineCap='round';seg([mm.q[0]-w,mm.q[1]],[mm.q[0]+w,mm.q[1]]);ctx.stroke();ctx.fillStyle='#ffffff';ctx.lineWidth=.7;tri(mm.q[0]-w*.55,mm.q[1]-.2,mm.q[0]-w*.5,mm.q[1]+2.4,1)}}
      ctx.restore()}
    for(const sd of[-1,1])if(!hornFar(sd))horn(sd)});
  // frosty breath when it roars, snow thrown up where the fists or the feet hit
  if(A.breath>=0&&fxOn(o)){const m0=Xh.T(ellAt([0,0,0],YHR,null,nrm([1,0,-.1])));L.add(D(m0)+40,()=>{const k=A.breath;for(let i=0;i<7;i++){const u=((k*2+i/7)%1),an=(i-3)*.16,d=4+u*40,q=P(add(m0,X.Rd([Math.cos(an)*d,Math.sin(an)*d,-u*6+Math.sin(i*1.9)*3])));
    ctx.fillStyle=`rgba(235,246,255,${.6*(1-u)*Math.min(1,(1-k)*4)})`;ball(q,2+u*6);ctx.fill()}})}
  if(A.dust>=0&&fxOn(o))L.add(dB+60,()=>{const k=A.dust;if(A.dustAt==='fists')for(const sd of[-1,1])dust(V0,X.T([28,sd*16,0]),k,6,11,'235,244,255');else if(A.dustAt==='scoop')dust(V0,X.T([24,0,0]),k,6,10,'235,244,255');else dust(V0,[A.B[0],0,0],k,10,30,'235,244,255')});
  run(L);
  if(A.stars>0)bstars(P(X.T([YH[0],0,YH[2]+18])),17,A.stars);
  ctx.restore()}
reg('yeti',{n:'Yeti delle Vette',g:'boss',sc:1,an:['idle','walk','pound','snowball','leap','roar','hit'],dur:{idle:2.8,walk:1,pound:1.2,snowball:1.3,leap:1.6,roar:1.4,hit:.6},
  lab:{idle:'Fermo',walk:'Cammina',pound:'Pugni a terra',snowball:'Palla di neve',leap:'Balzo',roar:'Ruggito',hit:'Colpito'}},yeti);
})();
