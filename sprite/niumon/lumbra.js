// Lumbra, il Niumon d'ombra (progetto Niumon, nome provvisorio), in 3D col metodo dei nemici della Classica (cassetta C3 di
// sprite/nemici3d/base3d.js, scheletro proiettato con V(face) di CR._rig): gira a 360 gradi e ogni pezzo resta attaccato al suo posto.
// Dai disegni di Denis del 13 ottobre (quattro direzioni in piedi e la posa acquattata), col corpo un po' più lungo come ha chiesto lui:
// una volpe d'ombra grigia col pelo a matita; la testa grande a uovo con la cresta di fiamma che si arriccia all'indietro; occhi viola a
// mandorla, cattivi, col sorrisetto; il contorno fatto di riccioli di fiamma come la cresta di un'onda (sulla testa, sulla schiena, sul
// petto, sulle zampe); due code di fumo (una dalla nuca, una dalla groppa) fatte di sbuffi tondi, grigie alla radice e viola in fondo,
// che finiscono arricciate; una fiammella viola dietro i talloni; sbuffi viola che volano via; ombra viola.
// Disegnato come i disegni: grigio caldo con la luce dall'alto a sinistra, contorno grigio scuro sottile (a trattini sulle fiamme e sul
// fumo) e la grana della matita (si spegne con LOWFX). Misure: 1 unità = 1/25 dei disegni di Denis (1254 px).
// Firma N3.lumbra(x, y, face, anim, p, sc, o): anim 'idle' (fermo), 'stalk' (agguato), 'walk', 'attack' (morso), 'leap' (balzo),
// 'hit'; ogni mossa dipende solo da p (0..1). o.noFx: senza sbuffi; o.noTex: senza grana; o.pose: pezzi della posa da sostituire.
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,stepper,keys,bump,sstep,hitK,frame,look,blink,rotX,rotY,rotZ,cmix,lt,rgba,chull,bbox,parts,reg,ik,ball,run}=C;

// ------------------------------------------------------------------ colours (taken from the drawings)
const LC={fur:'#b2acaf',ink:'#2c2832',shade:'#2b2433',
  smoke:'#9466d8',smokeL:'#d9c2fb',smokeD:'#4c3590',
  irisT:'#4a3590',irisM:'#9f80e2',irisB:'#f2eaff',pupil:'#1b1826',sock:'#2a2736'};
const dk=(c,k)=>cmix(c,LC.shade,k);
// the outline: thin like a pencil line (in screen pixels, whatever the size); dashes on the flames and the smoke
const LWPX=sc=>cl(1.2+sc*.12,1.5,4.4);

// ------------------------------------------------------------------ the pencil grain of the drawings: small overlapping arcs like
// scales of wool (dark strokes, the paper showing light between them), in a tile that repeats
let TEXC=null;
function texCanvas(){if(TEXC)return TEXC;const S=120,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');let s=11;const rnd=()=>{s=(s*16807)%2147483647;return(s-1)/2147483646};
  x.lineCap='round';const G=6.2,n=Math.round(S/G),cell=S/n;
  for(let pass=0;pass<2;pass++)for(let gy=0;gy<n;gy++)for(let gx=0;gx<n;gx++){const cx=(gx+(gy%2)*.5+(rnd()-.5)*.6)*cell,cy=(gy+(rnd()-.5)*.6)*cell,r=(2.6+rnd()*1.3)*(pass?.8:1),rot=(rnd()-.5)*1.1,
      a0=Math.PI*(.12+rnd()*.12)+rot,a1=Math.PI*(.88-rnd()*.12)+rot,dark=!pass;
    x.strokeStyle=dark?`rgba(30,26,40,${(.42+rnd()*.32).toFixed(2)})`:`rgba(255,255,255,${(.3+rnd()*.3).toFixed(2)})`;x.lineWidth=dark?.8+rnd()*.5:.7+rnd()*.4;
    const oy=pass?-1.6:0;for(const ox of[-S,0,S])for(const o2 of[-S,0,S]){const X0=cx+ox,Y0=cy+oy+o2;if(X0<-8||X0>S+8||Y0<-8||Y0>S+8)continue;x.beginPath();x.arc(X0,Y0,r,a0,a1);x.stroke()}}
  return TEXC=c}
let PAT=null,PATC=null;
// the grain anchored to the creature (it moves with it); one tile pixel = k screen pixels
function grain(sc,k){if(LOWFX)return null;try{if(!PAT||PATC!==ctx){PAT=ctx.createPattern(texCanvas(),'repeat');PATC=ctx}if(!PAT.setTransform)return null;PAT.setTransform(new DOMMatrix().scale(k/sc));return PAT}catch(e){return null}}

// ------------------------------------------------------------------ shapes
// an ellipsoid seen by the camera is an ellipse on the screen (centre Cc, radii Rd along the axes of the frame T)
function oval(V0,T,Cc,Rd){const o=V0.P(T(Cc)),Lc=[0,1,2].map(i=>{const e=[0,0,0];e[i]=Rd[i];const q=V0.P(T(add(Cc,e)));return[q[0]-o[0],q[1]-o[1]]});
  let a=0,b=0,d=0;for(const l of Lc){a+=l[0]*l[0];b+=l[0]*l[1];d+=l[1]*l[1]}const m=(a+d)/2,r=Math.sqrt(((a-d)/2)**2+b*b),rot=.5*Math.atan2(2*b,a-d),rx=Math.sqrt(m+r),ry=Math.sqrt(Math.max(.01,m-r));
  const ex=Math.sqrt(rx*rx*Math.cos(rot)**2+ry*ry*Math.sin(rot)**2),ey=Math.sqrt(rx*rx*Math.sin(rot)**2+ry*ry*Math.cos(rot)**2);
  return{c:o,rx,ry,rot,bb:[o[0]-ex,o[1]-ey,o[0]+ex,o[1]+ey],path:k=>{k=k||0;ctx.beginPath();ctx.ellipse(o[0],o[1],Math.max(.2,rx-k),Math.max(.2,ry-k),rot,0,TAU)}}}
// several shapes painted as one: every outline first (twice as wide, so half of it shows outside), then every fill with the same paint
// and the grain; no line where the shapes meet. S: functions that make a path
function paintAll(S,fill,lw,o){o=o||{};ctx.lineJoin='round';ctx.lineCap=o.dash?'butt':'round';ctx.strokeStyle=o.ink||LC.ink;ctx.lineWidth=lw*2;if(o.dash)ctx.setLineDash(o.dash);
  for(const f of S){f();ctx.stroke()}if(o.dash)ctx.setLineDash([]);
  for(const f of S){f();ctx.fillStyle=fill;ctx.fill();if(o.tex){ctx.globalAlpha=o.texA||.7;ctx.fillStyle=o.tex;ctx.fill();ctx.globalAlpha=1}}}
// fur paint for a piece: light from the upper left, three tones (light, fur, shadow)
function furPaint(bb,kl,kd,col){col=col||LC.fur;const w=bb[2]-bb[0],h=bb[3]-bb[1],cx=(bb[0]+bb[2])/2,cy=(bb[1]+bb[3])/2,R=Math.max(w,h)*.75;
  const g=ctx.createRadialGradient(cx-w*.22,cy-h*.3,R*.03,cx-w*.04,cy+h*.02,R);g.addColorStop(0,lt(col,kl==null?.62:kl));g.addColorStop(.46,col);g.addColorStop(1,dk(col,kd==null?.48:kd));return g}
const polyPath=pts=>()=>{ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.closePath()};
// the drawings' modelling: inside the outline (a convex polygon round the piece) the side away from the light darkens and the side
// toward it lightens, softly, following the edge (the shadow of the outside falling in). Off with LOWFX
function innerShade(pts,dark,light,kb){if(LOWFX||pts.length<3)return;const m=ctx.getTransform(),s=Math.hypot(m.a,m.b),bb=bbox(pts),w=bb[2]-bb[0],h=bb[3]-bb[1],R=Math.max(w,h),M=R*.7;
  let ar=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];ar+=a[0]*b[1]-b[0]*a[1]}const P0=ar>0?pts.slice().reverse():pts;
  const ring=()=>{ctx.beginPath();ctx.moveTo(bb[0]-M,bb[1]-M);ctx.lineTo(bb[2]+M,bb[1]-M);ctx.lineTo(bb[2]+M,bb[3]+M);ctx.lineTo(bb[0]-M,bb[3]+M);ctx.closePath();ctx.moveTo(P0[0][0],P0[0][1]);for(let i=1;i<P0.length;i++)ctx.lineTo(P0[i][0],P0[i][1]);ctx.closePath()};
  ctx.save();ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.clip();ctx.fillStyle='#000';const k=kb||1;
  if(dark){ctx.shadowColor=dark;ctx.shadowBlur=R*.16*s*k;ctx.shadowOffsetX=-R*.07*s*k;ctx.shadowOffsetY=-R*.09*s*k;ring();ctx.fill()}
  if(light){ctx.shadowColor=light;ctx.shadowBlur=R*.14*s*k;ctx.shadowOffsetX=R*.06*s*k;ctx.shadowOffsetY=R*.07*s*k;ring();ctx.fill()}
  ctx.restore()}
// a closed smooth path through screen points (quadratic curves through the midpoints); open: from the first to the last point
function smoothPath(pts,open){const n=pts.length;ctx.beginPath();if(open){ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<n-1;i++){const m=[(pts[i][0]+pts[i+1][0])/2,(pts[i][1]+pts[i+1][1])/2];ctx.quadraticCurveTo(pts[i][0],pts[i][1],m[0],m[1])}ctx.lineTo(pts[n-1][0],pts[n-1][1]);return}
  const m=i=>[(pts[i][0]+pts[(i+1)%n][0])/2,(pts[i][1]+pts[(i+1)%n][1])/2];let s=m(n-1);ctx.moveTo(s[0],s[1]);for(let i=0;i<n;i++){const e=m(i);ctx.quadraticCurveTo(pts[i][0],pts[i][1],e[0],e[1])}ctx.closePath()}
// a tube through 3D points (radius r, as wide as r*kw across the side axis sa, through T): one convex hull per piece, for paintAll
function tube(V0,T,pts,rs,sa,kw){const out=[];const ring=(q,i,dir)=>{const u=nrm(sa),v=nrm(cross(dir,u)),R=[];for(let j=0;j<14;j++){const t=j/14*TAU;R.push(V0.P(T(add(q,add(mul(u,Math.cos(t)*rs[i]*(kw||1)),mul(v,Math.sin(t)*rs[i]))))))}return R};
  for(let i=0;i<pts.length-1;i++){const dir=nrm(sub(pts[i+1],pts[i]));out.push(chull(ring(pts[i],i,dir).concat(ring(pts[i+1],i+1,dir))))}return out}
// a capsule between two screen circles
function capsule(a,ra,b,rb){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);ctx.beginPath();if(d<=Math.abs(ra-rb)+.01){const q=ra>=rb?a:b;ctx.arc(q[0],q[1],Math.max(ra,rb),0,TAU);return}
  const an=Math.atan2(dy,dx),f=Math.acos(cl((ra-rb)/d,-1,1));ctx.arc(a[0],a[1],ra,an+f,an+TAU-f);ctx.arc(b[0],b[1],rb,an-f,an+f);ctx.closePath()}

// ------------------------------------------------------------------ the drawings' curl of flame. Its outline is drawn once in its own
// plane (u along the rise, from the root; v toward the side it curls to) and laid on the screen from its 3D root, rise and curl
// directions; seen side on it keeps .6 of its width, so it reads from every side. 'wave': a breaking wave (a round back, a hollow under
// the crest, the tip hooked down); 'blade': a long thin sickle (the ears and the jowls); 'tongue': a small flame
const CURL={wave:[[-.2,-.55],[-.04,-.55],[.12,-.44],[.45,-.4],[.73,-.27],[.91,0],[1,.36],[.98,.73],[.91,1],[.73,1.18],[.6,1.15],[.55,.95],[.67,.85],[.73,.64],[.64,.4],[.36,.36],[.09,.4],[-.04,.55],[-.2,.55]],
  blade:[[-.12,-.22],[0,-.22],[.28,-.22],[.56,-.14],[.8,.02],[.96,.22],[1.02,.4],[.86,.24],[.6,.13],[.32,.14],[0,.2],[-.12,.2]],
  tongue:[[-.12,-.4],[0,-.42],[.3,-.4],[.6,-.24],[.84,.02],[1,.3],[.86,.2],[.66,.16],[.44,.24],[.2,.3],[0,.3],[-.12,.3]],
  // the whole top of the head, traced on Denis's side view: the forehead, the crest with its hook, the back of the head down to the nape
  headtop:[[-0.15,-0.612],[0,-0.612],[0.246,-0.597],[0.396,-0.493],[0.485,-0.373],[0.575,-0.224],[0.709,-0.03],[0.828,0.075],[0.948,0.194],[0.985,0.313],[1,0.433],[0.978,0.552],[0.933,0.627],[0.873,0.642],[0.858,0.567],[0.896,0.522],[0.858,0.433],[0.799,0.388],[0.724,0.373],[0.679,0.403],[0.575,0.448],[0.5,0.433],[0.44,0.373],[0.396,0.463],[0.336,0.552],[0.097,0.612],[0,0.612],[-0.15,0.612]],
  // the crest of the head, traced on Denis's side view (u up from the top of the head, v backward)
  crest:[[-.2,-.56],[.1,-.53],[.3,-.48],[.52,-.38],[.74,-.23],[.87,-.03],[.94,.23],[.95,.48],[.9,.74],[.84,.87],[.7,.94],[.6,.88],[.6,.79],[.7,.71],[.68,.56],[.54,.41],[.36,.36],[.25,.43],[.05,.52],[-.2,.53]]};
// the same outlines made symmetric (a plain flame): seen from in front or behind a curl turns into this, so it never flips side
const SYM={};for(const k in CURL){const T=CURL[k],n=T.length,u0=Math.min(...T.map(q=>q[0])),u1=Math.max(...T.map(q=>q[0])),vm=T.reduce((s,q)=>s+q[1],0)/n,h=(n-1)/2;
  SYM[k]=T.map((q,i)=>{const t=i<=h?i/h:(n-1-i)/h,u=u0+(u1-u0)*t,w=(T[0][1]<T[n-1][1]?1:-1)*.5*(Math.max(...T.map(p=>p[1]))-Math.min(...T.map(p=>p[1])))*Math.pow(Math.max(0,1-Math.pow(Math.max(0,t-.04)/.96,1.8)),.8);return[u,vm*.3+(i<=h?-w:w)]})}
function curl(V0,b,d,c,L,W,kind,sway){const q=V0.P(b),Pd=V0.P(d),Pc=V0.P(c),dl=Math.hypot(Pd[0],Pd[1]),ud=dl>1e-4?[Pd[0]/dl,Pd[1]/dl]:[0,-1],ul=Math.max(dl,.42),pp=[-ud[1],ud[0]];
  const a=Pc[0]*ud[0]+Pc[1]*ud[1],bb=Pc[0]*pp[0]+Pc[1]*pp[1],t=cl(Math.abs(bb)/.62,0,1),b2=(bb>=0?1:-1)*Math.max(Math.abs(bb),.62),U=[ud[0]*ul*L,ud[1]*ul*L],Wv=[(ud[0]*a*.5+pp[0]*b2)*W,(ud[1]*a*.5+pp[1]*b2)*W];
  const T=CURL[kind]||CURL.wave,Sm=SYM[kind]||SYM.wave,k=t*t*(3-2*t);
  return T.map(([u,v],i)=>{if(k<1){u=lerp(Sm[i][0],u,k);v=lerp(Sm[i][1]*(bb>=0?1:-1),v,k)}v+=(sway||0)*u*u;return[q[0]+U[0]*u+Wv[0]*v,q[1]+U[1]*u+Wv[1]*v]})}
// paint a curl: the fill of its piece (so it melts into it), the grain, a shade along the hollow, the outline (dashed) on its free
// edges only, never across its root
function drawCurl(pts,fill,lw,o,v){o=o||{};const al=v==null?1:1-sstep(o.v0||.38,o.v1||.72,v);if(al<=.02)return;ctx.save();ctx.globalAlpha*=al;ctx.lineJoin='round';ctx.lineCap='round';smoothPath(pts);ctx.fillStyle=fill;ctx.fill();if(o.tex){ctx.globalAlpha=o.texA||.7;ctx.fillStyle=o.tex;ctx.fill();ctx.globalAlpha=1}
  const n=pts.length,h=Math.floor(n/2);if(!o.flat){ctx.save();smoothPath(pts);ctx.clip();ctx.strokeStyle='rgba(38,28,58,.2)';ctx.lineWidth=lw*3.2;smoothPath(pts.slice(h-1,n-1),true);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=lw*2.4;smoothPath(pts.slice(1,h-1),true);ctx.stroke();ctx.restore()}
  ctx.strokeStyle=o.ink||LC.ink;ctx.lineWidth=lw;if(o.dash){ctx.setLineDash(o.dash);ctx.lineCap='butt'}smoothPath(pts.slice(1,n-1),true);ctx.stroke();if(o.dash)ctx.setLineDash([]);ctx.restore()}

// ------------------------------------------------------------------ smoke: round puffs along a rope of 3D points (radii rs), drawn on the
// screen as one cloud with curls off its edges leaning back toward the root; grey at the root, violet toward the end, the grain, a
// dashed outline. o.hooks: [[k, side (1|-1), size], ...]
function catmull(P,n){const out=[];for(let i=0;i<P.length-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)];
  for(let j=0;j<n;j++){const t=j/n,t2=t*t,t3=t2*t;out.push(p1.map((_,k)=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3)))}}
  out.push(P[P.length-1].slice());return out}
function smoke(V0,pts3,rs,lw,o){o=o||{};const P2=pts3.map((q,i)=>{const s=V0.P(q);return[s[0],s[1],rs[i]]}),S=catmull(P2,o.res||4),n=S.length;if(n<2)return;
  const Nn=[];for(let i=0;i<n;i++){const a=S[Math.max(0,i-1)],e=S[Math.min(n-1,i+1)];let tx=e[0]-a[0],ty=e[1]-a[1];const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;Nn.push([-ty,tx,tx,ty])}
  // the cloud: capsules between the samples, swelling into round puffs
  const lob=i=>Math.max(.05,S[i][2]*(1+(o.lobe==null?.09:o.lobe)*Math.sin(i/(o.res||4)*Math.PI*1.15+(o.ph||0))));const shapes=[];
  for(let i=0;i<n-1;i++){const a=S[i],b=S[i+1],ra=lob(i),rb=lob(i+1);shapes.push(()=>capsule(a,ra,b,rb))}
  // the curls off the edges: out of the side, leaning back along the rope toward the root, hooking round outward
  const hk=[];for(const[k,sd,sz] of o.hooks||[]){const i=Math.round(cl(k,0,1)*(n-1)),q=S[i],N=Nn[i],w=lob(i),s=(sz||1)*w*1.15,b=[q[0]+N[0]*w*sd*.92,q[1]+N[1]*w*sd*.92],
      out=[N[0]*sd,N[1]*sd],back=[-N[2],-N[3]],d=nrm([out[0]*.9+back[0]*.45,out[1]*.9+back[1]*.45,0]);
    // the outline of a wave on the screen: rise d, curling toward the root (back) and away from the rope
    const pp=[-d[1],d[0]],side=(pp[0]*back[0]+pp[1]*back[1])>=0?1:-1,U=[d[0]*s*.85,d[1]*s*.85],Wv=[pp[0]*side*s*.78,pp[1]*side*s*.78];
    hk.push(CURL.wave.map(([u,v])=>[b[0]+U[0]*u+Wv[0]*v,b[1]+U[1]*u+Wv[1]*v]))}
  for(const h of hk)shapes.push(()=>smoothPath(h));
  // the paint: along the rope from the root colour to the end colour
  const a=S[0],e=S[n-1],g=ctx.createLinearGradient(a[0],a[1],e[0],e[1]);(o.stops||[[0,LC.fur],[.26,cmix(LC.fur,LC.smoke,.3)],[.6,LC.smoke],[1,cmix(LC.smoke,LC.smokeL,.3)]]).forEach(s=>g.addColorStop(s[0],s[1]));
  paintAll(shapes,g,lw,{dash:o.dash,tex:o.tex,texA:o.texA||.55});
  // light on the top of the puffs, shade under them (soft, inside the cloud)
  ctx.save();ctx.beginPath();for(let i=0;i<n-1;i++){const a1=S[i],b1=S[i+1],ra=lob(i),rb=lob(i+1),dx=b1[0]-a1[0],dy=b1[1]-a1[1],dd=Math.hypot(dx,dy);
    if(dd<=Math.abs(ra-rb)+.01){const r=Math.max(ra,rb);ctx.moveTo(a1[0]+r,a1[1]);ctx.arc(a1[0],a1[1],r,0,TAU);continue}const an=Math.atan2(dy,dx),f=Math.acos(cl((ra-rb)/dd,-1,1));
    ctx.moveTo(a1[0]+ra*Math.cos(an+f),a1[1]+ra*Math.sin(an+f));ctx.arc(a1[0],a1[1],ra,an+f,an+TAU-f);ctx.arc(b1[0],b1[1],rb,an-f,an+f);ctx.closePath()}ctx.clip('nonzero');
  for(let i=0;i<n;i+=2){const q=S[i],r=lob(i),gl=ctx.createRadialGradient(q[0]-r*.35,q[1]-r*.45,r*.05,q[0]-r*.1,q[1]-r*.1,r*1.15);gl.addColorStop(0,'rgba(255,255,255,.3)');gl.addColorStop(.55,'rgba(255,255,255,0)');gl.addColorStop(.85,'rgba(40,20,80,.1)');gl.addColorStop(1,'rgba(40,20,80,0)');
    ctx.fillStyle=gl;ctx.beginPath();ctx.arc(q[0],q[1],r*1.15,0,TAU);ctx.fill()}
  ctx.restore();
  // the hollows under the curls
  for(const h of hk){ctx.save();smoothPath(h);ctx.clip();ctx.strokeStyle='rgba(38,24,70,.22)';ctx.lineWidth=lw*3;smoothPath(h.slice(10,18),true);ctx.stroke();ctx.restore()}
  return S}
// a puff of smoke flying off: a small curl (a comma), violet, dashed
function puff(q,r,al,lw,dash,rot){if(al<=0||r<.2)return;ctx.save();ctx.globalAlpha*=al;ctx.translate(q[0],q[1]);ctx.rotate(rot||0);ctx.lineJoin='round';ctx.lineCap='round';
  const pts=[];for(let i=0;i<=18;i++){const t=i/18*TAU;pts.push([Math.cos(t)*r*(1+.2*Math.cos(t*2)),Math.sin(t)*r*.6])}
  ctx.beginPath();for(const p of pts)ctx.lineTo(p[0],p[1]);ctx.closePath();const g=ctx.createLinearGradient(-r,-r,r,r);g.addColorStop(0,LC.smokeL);g.addColorStop(1,LC.smoke);ctx.fillStyle=g;ctx.fill();
  ctx.strokeStyle=LC.ink;ctx.lineWidth=lw;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle=rgba(LC.smokeD,.55);ctx.lineWidth=lw*.8;ctx.beginPath();for(let i=0;i<=12;i++){const t=i/12*TAU*.85,rr=r*.6*(1-i/15);ctx.lineTo(Math.cos(t+1)*rr,Math.sin(t+1)*rr*.6)}ctx.stroke();ctx.restore()}

// ------------------------------------------------------------------ lofts: a body made of cross-sections (rings) along x: [x, zc, hz, hy]
// = centre height, half height, half width. Resampled smoothly and drawn as the convex hulls of consecutive rings (for paintAll)
function loft(V0,T,R,n,egg){const rings=catmull(R,n||3),out=[],e=egg||0;const ring=r=>{const pts=[];for(let j=0;j<18;j++){const t=j/18*TAU;pts.push(V0.P(T([r[0],Math.sin(t)*r[3]*(1-e*Math.cos(t)),r[1]+Math.cos(t)*r[2]])))}return pts};
  let prev=ring(rings[0]);for(let i=1;i<rings.length;i++){const cur=ring(rings[i]);out.push(chull(prev.concat(cur)));prev=cur}return out}
// the ring of a loft at x (interpolated)
function ringAt(R,x){if(x>=R[0][0])return R[0];for(let i=0;i<R.length-1;i++){const a=R[i],b=R[i+1];if(x<=a[0]&&x>=b[0]){const k=(a[0]-x)/(a[0]-b[0]);return a.map((v,j)=>lerp(v,b[j],k))}}return R[R.length-1]}
// a point on a loft at x, angle `an` round it (0 = top, π/2 = the right side, π = the bottom; side sd mirrors), sunk by `sink`, and the
// surface's normal there
function onLoft(R,x,an,sd,sink,egg){const e=egg||0,f=(xx,aa)=>{const r=ringAt(R,xx);return[xx,Math.sin(aa)*r[3]*(1-e*Math.cos(aa))*sd,r[1]+Math.cos(aa)*r[2]]},p=f(x,an),dx=sub(f(x-.3,an),f(x+.3,an)),da=sub(f(x,an+.05),f(x,an-.05));
  let n=nrm(cross(da,dx));if(dot(n,sub(p,[x,0,ringAt(R,x)[1]]))<0)n=mul(n,-1);return{p:sub(p,mul(n,sink||0)),n}}

// ------------------------------------------------------------------ the body, in units (x forward, y right, z up), standing; measured on
// Denis's side view (1 unit = 25 px of the drawing). BODYK stretches the torso and the legs along x (Denis: "il corpo un po' più lungo")
const BODYK=1;
const TORSO=[[14.4,13.6,1.6,1.8],[13.6,13.8,4.6,3.8],[11.6,14.6,6.6,5],[8.5,15.6,7.4,5.4],[4.5,16.2,7.2,5.3],[1,16.5,6.6,5],[-2,16.4,6,4.7],[-4.8,15.6,5,4.6],[-7.4,14.6,4,4.3],[-9.4,14,3,3.6],[-10.6,13.8,1.6,2.2],[-11,13.8,.4,.6]];
// the haunches and the shoulders, under the same skin as the torso (right side; mirrored): the legs come out from under them
const BULGE=[];
// points round an oval on the screen
function ovPts(E,n){const pts=[],cr=Math.cos(E.rot),sr=Math.sin(E.rot);for(let i=0;i<n;i++){const t=i/n*TAU,c=Math.cos(t)*E.rx,s=Math.sin(t)*E.ry;pts.push([E.c[0]+c*cr-s*sr,E.c[1]+c*sr+s*cr])}return pts}
// the head, in its own frame (origin HPOS in the body, x along the face, z up): rings from the back of the head to the face, the snout
const HEAD=[[8.5,-.3,.5,.5],[8.3,-.3,1.8,1.4],[7.8,-.4,3.6,2.6],[6.8,-1,6,4.2],[5.2,-1,6.3,5.3],[3.8,-.8,6.5,6.2],[1.8,-.7,6.6,6.8],[-.2,-.7,6.6,6.7],[-2.2,-.5,6.4,6.3],[-4.2,0,5.6,5.5],[-6.4,.5,3.8,3.9],[-7.4,.8,1.4,1.4]];
const SNOUT=[[7.1,0,-4.8],[1.4,1.9,1.4]],HEGG=.24;
const HPOS=[11.8,0,20.2];
// the legs: shoulder or hip on the body, the paw on the floor (y = side); front legs bend back at the elbow, hind legs forward at the
// knee and back at the hock
const LEGS=[{fr:1,sd:-1,h:[7.4,-3.6,12.4],f:[8.2,-5,0],k:0},{fr:1,sd:1,h:[7.4,3.6,12.4],f:[8.2,5,0],k:.5},
  {fr:-1,sd:-1,h:[-6,-3.6,12.6],f:[-11.4,-4.8,0],k:.5},{fr:-1,sd:1,h:[-6,3.6,12.6],f:[-11.4,4.8,0],k:0}];
(()=>{for(const r of TORSO)r[0]*=BODYK;for(const l of LEGS){l.h[0]*=BODYK;l.f[0]*=BODYK}HPOS[0]*=BODYK})();
// the eyes: centre and the way they face (right eye; the left one mirrored), half length
const EYE={c:[5.6,4.4,-1.9],n:[.7,.71,.02],re:2.65};
// the plume of smoke from the nape and the tail from the rump ([x back from the root, z up, radius]); the flame behind the heels
const PLUME=[[0,0,1.1],[-2,1,1.1],[-3.6,1.6,1.1],[-5.2,0.8,1],[-6.8,-0.2,1],[-8.4,-1,1.05],[-10,-0.8,1.1],[-11.2,-0.2,1.2],[-12.8,0.8,1.35],[-14,2,1.5],[-15,3.6,1.6],[-15.6,5.2,1.6],[-16,6.6,1.6],[-17.2,7.2,1.5],[-18.8,7,1.45],[-20.4,6.4,1.4],[-21.6,5.4,1.3],[-23.2,5.2,1.25],[-24.8,6,1.2],[-26,7.2,1.1],[-26.8,8.6,0.95],[-27.2,9.6,0.8],[-27.8,10,0.6],[-28.4,9,0.25]];
const TAIL=[[0,0,2],[-1.6,-0.8,2.05],[-3.2,-1.2,2],[-4.8,-1,1.9],[-6.4,-0.2,1.8],[-8,1,1.7],[-9.2,2.4,1.6],[-9.8,4,1.5],[-9.6,5.4,1.35],[-8.8,6.2,1.2],[-7.8,6.4,1],[-7,6,0.75],[-6.6,5.2,0.45],[-6.7,4.6,0.15]];
const HEEL=[[0,0,0.9],[-1.2,1,1.1],[-2,2.2,1.15],[-1.8,3.4,1.05],[-2.4,4.4,0.95],[-3.6,5,0.85],[-4.4,5.8,0.75],[-4.8,6.8,0.6],[-5.4,7.4,0.4],[-6.2,7.6,0.15]];
// the curls of the torso: [x, angle round it, rise (along the normal, up, back), curl toward, height, width, kind, both sides]
const BW=[[9,0,[.25,1,.25],[-1,0,0],2.4,2.4,0,0],[5,0,[.2,1,.25],[-1,0,0],2.7,2.7,0,0],[1,0,[.2,1,.25],[-1,0,0],2.7,2.7,0,0],[-3,0,[.2,1,.3],[-1,0,0],2.5,2.5,0,0],[-7,.1,[.3,1,.4],[-1,0,0],2.4,2.4,0,0],
  [10,1,[.7,.8,.25],[-1,0,0],2.7,2.7,0,1],[4,1.05,[.75,.7,.3],[-1,0,0],2.4,2.4,0,1],[-2,1.1,[.75,.65,.35],[-1,0,0],2.3,2.3,0,1],[-8,1.05,[.75,.6,.45],[-1,0,0],2.1,2.1,0,1],
  [7,1.85,[.85,-.1,.3],[-1,0,0],2.1,2.1,0,1],[0,1.9,[.85,-.1,.35],[-1,0,0],2,2,0,1],[-6,1.8,[.85,0,.4],[-1,0,0],2,2,0,1],
  [3,2.6,[.55,-.8,.45],[-1,0,0],1.9,1.9,0,1],[-3,2.6,[.55,-.8,.5],[-1,0,0],1.8,1.8,0,1],
  [13.2,1.9,[.9,-.2,-.6],[0,0,1],2,2,0,1],[12.4,2.5,[.7,-.6,-.6],[-1,0,.2],1.9,1.9,0,1],[-10,.9,[.6,.6,.7],[0,0,1],2.1,2.1,0,1]];
// the curls round the head (rings of HEAD; side mirrored): [x, angle, rise, curl toward, height, width, kind]: the crescent ears by the
// eyes, the big curls of the jowls, two on the top of the brow, one under the cheek, two at the back of the head
const HW=[[2.4,1.2,[.4,1,.15],[-1,0,0],3.4,2.6,'blade'],[-4.6,1.75,[.55,1,.35],[-1,0,0],6.2,4.6],[5.6,.4,[.5,.8,.1],[-1,0,0],1.6,1.6],[3.4,.45,[.45,.85,.15],[-1,0,0],1.7,1.7],[1,.55,[.45,.85,.2],[-1,0,0],1.8,1.8],
  [3.4,2.1,[1,-.2,.1],[0,0,1],1.9,1.9],[-5.4,.9,[.6,.6,.6],[0,0,1],1.9,1.9],[-6.4,2.2,[.7,-.1,.7],[0,0,1],1.7,1.7],[-1.8,1.4,[.8,.4,.4],[-1,0,0],2,2],[.8,2.3,[.9,-.3,.3],[0,0,1],1.7,1.7]];
// curls all round the torso and the head, on rings of their lofts: only the ones near the outline are drawn (the drawings' flaming
// edge, from every side). [x, angle, side, height, rise (normal, up, back), curl toward]
const BWG=[],HWG=[];
// rise: mostly straight out of the surface (so seen from any side they stick out of the outline), a little up and back; curl: backward
// on the top, upward on the sides and underneath
const cvDir=an=>an<.6?[-1,0,.15]:an<2.3?[-.45,0,1]:[-.6,0,.8];
[12.5,9,5.5,2,-1.5,-5,-8.5].forEach((x,i)=>[0,.7,1.4,2.1,2.8].forEach((an,j)=>{const L=(an<1?3.5:an<1.8?3.2:2.8)*(1-.1*Math.abs(x-2)/10)+((i+j)%3)*.15;
  for(const sd of an===0?[1]:[-1,1])BWG.push([x+((j%2)?1.6:0),an,sd,L,[1,an<2.3?.25:-.1,.25],cvDir(an)])}));
[4.6,2.2,-.4,-3,-5.4].forEach((x,i)=>[0,.6,1.2,1.8,2.4].forEach((an,j)=>{if(x>2&&an>.5&&an<2.6)return;if(x>4.4&&an>.3)return;if(an<.7)return;const L=(an<1.2?3.4:3.1)+((i+j)%3)*.15;
  for(const sd of an===0?[1]:[-1,1])HWG.push([x+((j%2)?1.2:0),an,sd,L,[1,an<2.3?.3:-.1,.2],cvDir(an)])}));
// paints: the head lighter than the body, as in the drawings
const COL={head:'#bdb7ba',body:'#9d979d',leg:'#958f96'};

function lumbra(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU,lw=LWPX(sc)/sc,dash=[Math.max(4,sc*.62)/sc,Math.max(1.6,sc*.15)/sc],tex=o.noTex||sc<2?null:grain(sc,cl(sc*.052,.8,1.35));
  // A: the body (B, lean = front down, roll, yaw, s, sx), the head (H, hp nose up, hy turn left, hr tilt), the eyes, the jaw, the paws'
  // offsets (pw), the smoke's wave (wv) and how much it sways (ws), the flames' flicker (fl), the puffs
  const A={B:[0,0,0],lean:0,roll:0,yaw:0,s:0,sx:0,H:HPOS.slice(),hp:0,hy:0,hr:0,blink:1,squint:0,shut:0,jaw:0,pw:LEGS.map(()=>[0,0,0]),wv:ph,ws:1,fl:ph,tail:0,plume:0,puff:p,stars:0};
  if(anim==='walk'){const st=stepper(p,.55);LEGS.forEach((l,i)=>{const s=st(l.k,3.4,2.2);A.pw[i]=[s.x,0,s.z]});const up=Math.abs(Math.cos(ph));A.B=[0,0,.45*up-.2];A.roll=.03*Math.sin(ph);
    A.H=[HPOS[0]+.3,0,HPOS[2]+.35*up-.2];A.hp=-.04;A.ws=1.3}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.12*kb;A.B=[-2.2*kb,0,.3*kb];A.roll=.06*kb;A.H=[HPOS[0]-.4,0,HPOS[2]+.8*kb];A.hp=.25*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0}
  else{const b=Math.sin(ph);A.s=.012*b;A.H=[HPOS[0],0,HPOS[2]+.25*b];A.hy=look(p,.28);A.hp=.03*Math.sin(ph*2+1);A.blink=blink(p,.34,.07)}
  if(o.pose)Object.assign(A,o.pose);
  const X=frame(A,12),hR=v=>X.Rd(rotZ(rotY(rotX(v,A.hr),-A.hp),A.hy)),hT=q=>X.T(add(A.H,rotZ(rotY(rotX(q,A.hr),-A.hp),A.hy))),hD=D(hT([0,0,0]))+1.5;
  // flicker of a flame: each one licks a little on its own (period 1 or 2 in p, so the move loops)
  const fk=(i,a)=>a*Math.sin(A.fl*(1+i%2)+i*1.7);
  // the shadow: soft and violet, under the body and the paws
  {const c=P(X.T([0,0,0]).slice(0,2).concat(0));ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const ax=P(22,0,0),ay=P(0,9,0),rx=Math.max(Math.hypot(ax[0],ax[1]),Math.hypot(ay[0],ay[1])),ry=Math.max(2.5,Math.abs(ax[1])+Math.abs(ay[1]));
    const g=ctx.createRadialGradient(0,0,1,0,0,rx);g.addColorStop(0,'rgba(96,66,156,.32)');g.addColorStop(.55,'rgba(110,84,170,.18)');g.addColorStop(1,'rgba(120,96,180,0)');ctx.fillStyle=g;
    ctx.translate(c[0],c[1]);ctx.scale(1,ry/rx);ctx.beginPath();ctx.arc(0,0,rx,0,TAU);ctx.fill();ctx.restore()}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),dB=D(X.T([0,0,16]));
  const torso=loft(V0,X.T,TORSO,3,.08),bulge=[];for(const sd of[-1,1])for(const[c,r] of BULGE){const E=oval(V0,X.T,[c[0]*BODYK,c[1]*sd,c[2]],r);bulge.push(E)}
  const bodyBB=bbox([].concat(...torso).concat(...bulge.map(E=>[[E.bb[0],E.bb[1]],[E.bb[2],E.bb[3]]]))),bodyFill=furPaint(bodyBB,.62,.46,COL.body);
  const CO={tex,texA:.75,dash};
  // ---------------------------------------------------------------- the legs
  LEGS.forEach((l,i)=>{const far=F(X.Rd([0,l.sd,0]))<0,hip=X.T(l.h),pw=add(add(l.f,A.pw[i]),[A.B[0],A.B[1],0]);
    const dl=far?dB-60+D(hip)*.01:dB+30+D(hip)*.01;
    L.add(dl,()=>{const col=far?cmix(COL.leg,LC.shade,.3):COL.leg;let pts,rs;
      if(l.fr>0){const wr=add(pw,[-.3,0,2.4]),IK=ik(hip,wr,6,5.6,X.Rd([-1,0,.1]));pts=[hip,IK[0],IK[1]];rs=[2.25,1.85,1.55]}
      else{const hk=add(pw,[-1.1,0,4.4]),IK=ik(hip,hk,7.4,6.2,X.Rd([1,0,-.2]));pts=[hip,IK[0],IK[1],add(pw,[-.4,0,1.5])];rs=[3.2,2.15,1.25,1.4]}
      const P2=pts.map(P),pawC=add(pw,[.5,0,1.15]),PE=oval(V0,q=>q,pawC,[2.35,1.95,1.15]),bb=bbox(P2.map((q,j)=>[q[0]-rs[j],q[1]-rs[j]]).concat(P2.map((q,j)=>[q[0]+rs[j],q[1]+rs[j]])).concat([[PE.bb[0],PE.bb[1]],[PE.bb[2],PE.bb[3]]]));
      const fill=far?furPaint(bb,.4,.6,col):bodyFill,S=[];for(let j=0;j<P2.length-1;j++){const a=P2[j],b=P2[j+1],ra=rs[j],rb=rs[j+1];S.push(()=>capsule(a,ra,b,rb))}S.push(()=>PE.path());
      // the curls of the leg: up the back (elbow or hock), down the front and on the outer side, curling up
      const CV=[];for(let j=0;j<pts.length-1;j++)for(const k of(l.fr>0||j<2?[.5]:[.5]))for(let a8=0;a8<8;a8++){const dx=Math.cos(a8*Math.PI/4),dy=Math.sin(a8*Math.PI/4);if(dy*l.sd<-.5&&!far)continue;const dir=X.Rd([dx,dy,0]),v=F(dir);if(Math.abs(v)>.3)continue;
        const q=lerp3(pts[j],pts[j+1],k),r0=lerp(rs[j],rs[j+1],k),b=add(q,mul(dir,r0*.75)),L2=(j===0?1.9:1.6)*(dx<0?1.15:1),rise=nrm(add(dir,X.Rd([0,0,.25])));
        CV.push({pts:curl(V0,b,rise,X.Rd([0,0,1]),L2,L2*.75,'wave',fk(i*9+j*3+(k>.5),.18)),v})}
      const CL={tex,texA:.75,dash,v0:.16,v1:.36};for(const q of CV)if(q.v<0)drawCurl(q.pts,fill,lw,CL,-q.v);
      paintAll(S,fill,lw,{tex,texA:.75});
      // the top of a near leg melts into the body (same paint): cover its line
      if(!far){ctx.fillStyle=fill;ctx.beginPath();ctx.arc(P2[0][0],P2[0][1],rs[0]+lw*1.1,Math.PI*.95,Math.PI*2.05);ctx.lineTo(P2[0][0],P2[0][1]);ctx.closePath();ctx.fill();if(tex){ctx.globalAlpha=.75;ctx.fillStyle=tex;ctx.fill();ctx.globalAlpha=1}}
      // the toes: three pads parted by two lines on the front of the paw
      for(const ty of[-.62,.62]){const pts3=[];for(let j=0;j<=6;j++){const t=j/6,a=-.15+t*1.3;pts3.push(add(pawC,X.Rd([Math.cos(a)*2.5*.98,ty*(1-.2*t),Math.sin(a)*1.2*.98-.2])))}
        if(F(X.Rd([1,ty*.4,.3]))>-.05){ctx.strokeStyle=LC.ink;ctx.lineWidth=lw;ctx.beginPath();for(const q of pts3){const s=P(q);ctx.lineTo(s[0],s[1])}ctx.stroke()}}
      for(const q of CV)if(q.v>=0)drawCurl(q.pts,fill,lw,CL,q.v);
      // the violet flame behind the heel of the hind legs
      if(l.fr<0){const base=add(pts[2],X.Rd([-1,0,-.9])),pts3=HEEL.map(([hx,hz,r],j)=>add(base,X.Rd([hx,Math.sin(A.wv*1.3+j*.9)*.35*j*.3,hz+Math.sin(A.wv+j)*.15])));
        smoke(V0,pts3,HEEL.map(h=>h[2]),lw,{dash,tex,texA:.5,res:3,lobe:.14,stops:[[0,cmix(COL.leg,LC.smoke,.5)],[.3,LC.smoke],[1,LC.smokeL]],hooks:[[.22,1,.9],[.42,-1,.85],[.62,1,.75],[.8,-1,.6]]})}})});
  // ---------------------------------------------------------------- the torso and its curls
  const bw=[];BWG.forEach((f,i)=>{const q=onLoft(TORSO,f[0]*BODYK,f[1],f[2],.3,.08),rise=nrm(add(add(mul(q.n,f[4][0]),[0,0,f[4][1]]),[-f[4][2],0,0]));
    const v=F(X.Rd(q.n));if(Math.abs(v)<.4)bw.push({f:[0,0,0,0,f[3],f[3]*.72,'wave'],i,b:X.T(q.p),d:X.Rd(rise),c:X.Rd(f[5]),v})});
  const CV2={tex,texA:.75,dash,v0:.16,v1:.36},drawBW=q=>{const f=q.f;drawCurl(curl(V0,q.b,q.d,q.c,f[4],f[5],f[6]||'wave',fk(q.i,.2)),bodyFill,lw,CV2,Math.abs(q.v))};
  for(const q of bw)if(q.v<0)L.add(dB-1+q.v*.01,()=>drawBW(q));
  L.add(dB,()=>{paintAll(torso.map(polyPath).concat(bulge.map(E=>()=>E.path())),bodyFill,lw,{tex,texA:.75});innerShade(chull([].concat(...torso).concat(...bulge.map(E=>ovPts(E,16)))),'rgba(28,20,46,.62)','rgba(255,250,246,.5)');for(const q of bw)if(q.v>=0)drawBW(q)});
  // ---------------------------------------------------------------- the tail from the rump
  {const root=X.T([-10.2*BODYK,0,16.4]),sw=k=>Math.sin(A.wv+k*2.2)*.7*k*A.ws,pts3=TAIL.map(([tx,tz],j)=>add(root,X.Rd([tx,sw(j/13),tz+Math.sin(A.wv+j*.7)*.25*j/13+A.tail*j*.3])));
    L.add(D(root)-.5,()=>smoke(V0,pts3,TAIL.map(t=>t[2]),lw,{dash,tex,texA:.85,ph:1,stops:[[0,'#8a8490'],[.4,'#7c7390'],[.7,'#8f68d2'],[1,'#ac88ee']],
      hooks:[[.08,-1,1.3],[.22,-1,1.4],[.38,-1,1.3],[.15,1,1.2],[.32,1,1.25],[.5,1,1.2],[.66,1,1.1],[.8,1,1]]}))}
  // ---------------------------------------------------------------- the head
  const head=loft(V0,hT,HEAD,3,HEGG),hfill=furPaint(bbox([].concat(...head)),.85,.58,COL.head);
  // the plume of smoke from the nape, behind the head
  {const root=hT([-7.8,0,5.2]),sw=k=>Math.sin(A.wv+k*2.6)*1.1*k*A.ws,pts3=PLUME.map(([tx,tz],j)=>add(root,X.Rd([tx,sw(j/23),tz+Math.sin(A.wv+j*.5)*.35*j/23+A.plume*j*.18])));
    L.add(Math.min(hD,D(root))-.4,()=>smoke(V0,pts3,PLUME.map(t=>t[2]),lw,{dash,tex,texA:.85,stops:[[0,'#7d7883'],[.25,'#77708a'],[.5,'#8a6cc4'],[.75,LC.smoke],[1,'#b18ef0']],
      hooks:[[.07,1,1.6],[.17,-1,1.7],[.27,-1,1.6],[.36,1,1.5],[.44,-1,1.4],[.52,1,1.5],[.62,1,1.4],[.7,-1,1.4],[.8,1,1.3],[.88,-1,1.2]]}))}
  const hw=[];for(const sd of[-1,1])HW.slice(0,2).forEach((f,i)=>{const q=onLoft(HEAD,f[0],f[1],sd,.3,HEGG),rise=nrm(add(add(mul(q.n,f[2][0]),[0,0,f[2][1]]),[-f[2][2],0,0]));
    hw.push({f,sd,i,b:hT(q.p),d:hR(rise),c:hR([f[3][0],f[3][1]*sd,f[3][2]]),v:F(hR(q.n)),sp:1})});
  HWG.forEach((f,i)=>{const q=onLoft(HEAD,f[0],f[1],f[2],.3,HEGG),rise=nrm(add(add(mul(q.n,f[4][0]),[0,0,f[4][1]]),[-f[4][2],0,0])),v=F(hR(q.n));
    if(Math.abs(v)<.4)hw.push({f:[0,0,0,0,f[3],f[3]*.72,'wave'],sd:f[2],i:i+9,b:hT(q.p),d:hR(rise),c:hR(f[5]),v})});
  const CH2={tex,texA:.75,dash,v0:.16,v1:.36},drawHW=q=>{const f=q.f;drawCurl(curl(V0,q.b,q.d,q.c,f[4],f[5],f[6]||'wave',fk(q.i*2+(q.sd>0),.2)),hfill,lw,q.sp?CO:CH2,f[6]==='blade'?null:Math.abs(q.v))};
  for(const q of hw)if(q.v<0)L.add(hD-.6+q.v*.01,()=>drawHW(q));
  L.add(hD,()=>{const SN=oval(V0,hT,SNOUT[0],SNOUT[1]);paintAll(head.map(polyPath).concat([()=>SN.path()]),hfill,lw,{tex,texA:.75});innerShade(chull([].concat(...head)),'rgba(28,20,46,.55)','rgba(255,252,248,.6)');
    // the crest: the outline traced on the drawing, standing on the top of the head and curling backward
    drawCurl(curl(V0,hT([-.6,0,1]),hR([0,0,1]),hR([-1,0,0]),13.4,13.4,'headtop',fk(8,.03)),hfill,lw,{tex,texA:.75});
    // the crest's own curls: two on its front edge, one at its back near the root
    for(const[b,d,c,Ln,W] of[[[-.3,0,10.2],[.7,0,.7],[-1,0,0],1.6,1.6],[[1.6,0,8.1],[.75,0,.65],[-1,0,0],1.45,1.45],[[-6.6,0,9.4],[-.9,0,.4],[0,0,1],1.6,1.6]])
      drawCurl(curl(V0,hT(b),hR(d),hR(c),Ln,W,'wave',fk(7,.15)),hfill,lw,CO);
    // the face: eyes and mouth, inside the head
    ctx.save();ctx.beginPath();for(const h of head){ctx.moveTo(h[0][0],h[0][1]);for(const q of h)ctx.lineTo(q[0],q[1]);ctx.closePath()}ctx.moveTo(SN.c[0]+SN.rx*Math.cos(SN.rot),SN.c[1]+SN.rx*Math.sin(SN.rot));ctx.ellipse(SN.c[0],SN.c[1],SN.rx,SN.ry,SN.rot,0,TAU);ctx.clip();
    face2(V0,hT,hR,A,lw);
    ctx.restore();
    for(const q of hw)if(q.v>=0)drawHW(q)});
  // ---------------------------------------------------------------- the puffs of smoke flying off
  if(!o.noFx&&!LOWFX)L.add(9999,()=>{const base=[hT([-7.8,0,5.2]),X.T([-10.2*BODYK,0,16.4])];for(let i=0;i<5;i++){const k=((A.puff+i/5)%1),src=i%2?base[1]:base[0],q=P(add(src,X.Rd([-14-i*3-k*8,Math.sin(i*2.1)*3,6+i*1.5+k*9])));
      puff(q,1.3+.5*(i%3)-k*.4,Math.sin(k*Math.PI)*.95,lw,dash,i)}});
  run(L);
  if(A.stars>0)C.stars(P(hT([0,0,15])),9,A.stars);
  ctx.restore()}

// ------------------------------------------------------------------ the face: two almond eyes, angry (the upper lid slants down toward
// the nose), violet irises lighter at the bottom, the pupil with its ring, two points of light; a little smirk under the snout
function face2(V0,hT,hR,A,lw){const{P,F}=V0,E=[];
  for(const sd of[-1,1]){const c=[EYE.c[0],EYE.c[1]*sd,EYE.c[2]],n=nrm([EYE.n[0],EYE.n[1]*sd,EYE.n[2]]),v=F(hR(n));if(v<-.05)continue;
    const up=nrm(sub([0,0,1],mul(n,n[2]))),u=mul(nrm(cross(up,n)),sd),re=EYE.re,R0=6.5;
    // a point of the eye's own plane (u toward the outer corner, w up), laid on the curve of the head
    const o0=P(hT(c)),su=sub(P(hT(add(c,u))),o0),sv=sub(P(hT(add(c,up))),o0),sn=sub(P(hT(add(c,n))),o0),lu=Math.hypot(su[0],su[1]),kk=sstep(.08,.45,v),
      m=lu<.8?lerp(1,.8/Math.max(.05,lu),kk):1,su2=[su[0]*m,su[1]*m];
    const at=(eu,ew)=>{const d2=(eu*eu+ew*ew)*re*re,b=-d2/(2*R0);return[o0[0]+su2[0]*eu*re+sv[0]*ew*re+sn[0]*b,o0[1]+su2[1]*eu*re+sv[1]*ew*re+sn[1]*b]};E.push({sd,v,at})}
  E.sort((a,b)=>a.v-b.v);
  for(const e of E){const{at}=e,op=A.shut?0:A.blink*(1-.3*A.squint);if(e.v<.03)continue;
    // the almond: the upper lid straight and slanted down toward the nose, the lower lid round
    // a "D" lying on its side: the straight lid on top, slanting down to the inner corner, the round side at the back and below
    const I=[-1,-.3],O=[.8,.62],P1=[1.38,-.82],P2=[.18,-1.75],up=[],lo=[];for(let i=0;i<=10;i++){const t=i/10;up.push([lerp(I[0],O[0],t),lerp(I[1],O[1],t)+.1*Math.sin(Math.PI*t)])}
    for(let i=1;i<10;i++){const t=i/10,a=(1-t)**3,b=3*(1-t)**2*t,c=3*(1-t)*t*t,d=t**3;lo.push([a*O[0]+b*P1[0]+c*P2[0]+d*I[0],a*O[1]+b*P1[1]+c*P2[1]+d*I[1]])}
    const lid=up.map(([a,b],i)=>{const j=cl(lo.length-1-Math.round(i*(lo.length-1)/10),0,lo.length-1);return[a,lerp(lo[j][1]+.1,b,op)]});
    const shape=lid.concat(lo).map(q=>at(q[0],q[1]));ctx.save();ctx.globalAlpha*=cl(e.v*5,0,1);
    ctx.beginPath();for(const q of shape)ctx.lineTo(q[0],q[1]);ctx.closePath();
    const bt=bbox(shape),g=ctx.createLinearGradient(0,bt[1],0,bt[3]);g.addColorStop(0,'#3a3350');g.addColorStop(.38,'#6a58a8');g.addColorStop(1,'#f6f0fe');ctx.fillStyle=g;ctx.fill();
    if(op>.15){ctx.save();ctx.clip();
      const circ=(cu,cw,ru,rw)=>{const pts=[];for(let i=0;i<22;i++){const t=i/22*TAU;pts.push(at(cu+Math.cos(t)*ru,cw+Math.sin(t)*rw))}return pts},iris=circ(.06,-.3,.86,.9),ib=bbox(iris);
      const gi=ctx.createLinearGradient(0,ib[1],0,ib[3]);gi.addColorStop(0,LC.irisT);gi.addColorStop(.5,LC.irisM);gi.addColorStop(1,LC.irisB);ctx.fillStyle=gi;C.poly(iris);ctx.fill();
      ctx.strokeStyle='rgba(36,24,74,.6)';ctx.lineWidth=lw*.6;C.poly(circ(.05,-.3,.55,.58));ctx.stroke();
      ctx.fillStyle=LC.pupil;C.poly(circ(.02,-.28,.3,.48));ctx.fill();
      // the shadow of the upper lid on the eye
      ctx.strokeStyle='rgba(24,20,34,.32)';ctx.lineWidth=lw*1.6;ctx.beginPath();for(const q of lid)ctx.lineTo(...at(q[0],q[1]-.14));ctx.stroke();
      ctx.fillStyle='#fff';C.poly(circ(-.22,.04,.23,.24));ctx.fill();C.poly(circ(.36,-.78,.09,.095));ctx.fill();
      ctx.restore()}
    // the lids: a thick dark upper lid that runs a little past the outer corner, a thin lower lid
    ctx.strokeStyle=LC.ink;ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=lw*2;ctx.beginPath();for(const q of lid)ctx.lineTo(...at(q[0],q[1]));ctx.lineTo(...at(1,lid[10][1]+.1));ctx.stroke();
    ctx.lineWidth=lw;ctx.beginPath();ctx.lineTo(...at(O[0],O[1]));for(const q of lo)ctx.lineTo(...at(q[0],q[1]));ctx.lineTo(...at(I[0],I[1]));ctx.stroke();
    ctx.restore()}
  // the smirk: a small curve under the snout, the corners turned up
  const[sc0,sr]=SNOUT,pts=[];for(let i=0;i<=12;i++){const s=-1+i/6,a=s*.95,m=nrm([Math.cos(a)*.7,Math.sin(a),-.66-.1*(1-s*s)+.32*Math.max(0,Math.abs(s)-.7)]),q=C.ellAt(sc0,sr,C.AXES,m),v=F(hR(C.ellN(sr,C.AXES,m)));
    pts.push({q:P(hT(q)),v})}
  ctx.strokeStyle=LC.ink;ctx.lineWidth=lw;ctx.lineCap='round';let open=false;ctx.beginPath();for(const t of pts){if(t.v>.02){if(!open){ctx.moveTo(t.q[0],t.q[1]);open=true}else ctx.lineTo(t.q[0],t.q[1])}else open=false}ctx.stroke()}

reg('lumbra',{n:'Lumbra',g:'niumon',sc:1,an:['idle','stalk','walk','attack','leap','hit'],dur:{idle:2.8,stalk:2.4,walk:1.1,attack:1.2,leap:1.4,hit:.6},
  lab:{idle:'Fermo',stalk:'Agguato',walk:'Camminata',attack:'Morso',leap:'Balzo',hit:'Colpito'}},lumbra);
})();
