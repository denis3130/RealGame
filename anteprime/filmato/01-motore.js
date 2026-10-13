// =====================================================================
// IL FILMATO: l'intro cinematografica di Mossbound (40 secondi).
// Non usa la telecamera del gioco: è una regia da film, con inquadrature, tagli, carrellate, gru, camera a mano,
// effetto Vertigo, luci della notte e suoni fatti dal codice.
// La scena è fatta di "cartoni" piatti messi a profondità diverse davanti a una telecamera in prospettiva (come un set
// teatrale): ogni movimento della telecamera ha la parallasse vera. Pavimenti, pareti e scalini sono poligoni proiettati.
// L'eroe è l'Arciere 3D del gioco (EROE.arciere), con l'inclinazione giusta per ogni inquadratura e la luce della scena.
// Tutto dipende solo dal tempo t: lo stesso t dà sempre lo stesso fotogramma (per le foto di controllo: FILM.foto(t)).
// File: 01 motore · 02 bosco e cripta di fuori · 03 dentro la cripta · 04 arena e boss · 05 inquadrature · 06 suoni.
// =====================================================================

// ------------------------------------------------------------------ small tools
const fcl=(v,a,b)=>v<a?a:v>b?b:v,flp=(a,b,k)=>a+(b-a)*k,FTAU=Math.PI*2;
const EZ={io:k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2,o:k=>1-Math.pow(1-k,3),i:k=>k*k*k,s:k=>k*k*(3-2*k),o2:k=>1-(1-k)*(1-k),i2:k=>k*k,
  sine:k=>.5-.5*Math.cos(Math.PI*k),back:k=>{const c=1.6;return 1+(c+1)*Math.pow(k-1,3)+c*Math.pow(k-1,2)}};
const seg01=(t,a,b)=>fcl((t-a)/(b-a),0,1);
const add3=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],nrm3=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]};
// a value that goes through keys [[t, v], ...] with an ease between them
function kf(K,t,ez){ez=ez||EZ.io;if(t<=K[0][0])return K[0][1];for(let i=0;i<K.length-1;i++){const a=K[i],b=K[i+1];if(t<=b[0]){const k=ez((t-a[0])/Math.max(1e-6,b[0]-a[0]));
  return Array.isArray(a[1])?a[1].map((v,j)=>flp(v,b[1][j],k)):flp(a[1],b[1],k)}}return K[K.length-1][1]}
// a fixed random sequence from a seed (the same forest every time)
function frng(seed){let a=(seed*2654435761)>>>0||1;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
// a smooth wobble from a few sines (hand-held camera, swaying branches)
const wob=(t,s)=>Math.sin(t*1.7+s)*.5+Math.sin(t*2.9+s*2.1)*.3+Math.sin(t*5.3+s*.7)*.2;
// colours: #rrggbb mixed with a cache (the result is #rrggbb again, so it can be mixed once more)
const HXC={},MXC={};
function hx3(c){let v=HXC[c];if(!v){const n=parseInt(c.slice(1,7),16);v=HXC[c]=[n>>16&255,n>>8&255,n&255]}return v}
function mc(a,b,k){k=Math.round(fcl(k,0,1)*48)/48;if(k<=0)return a;if(k>=1)return b;const id=a+b+k;let v=MXC[id];if(v)return v;const A=hx3(a),B=hx3(b);
  return MXC[id]='#'+[0,1,2].map(i=>Math.round(A[i]+(B[i]-A[i])*k).toString(16).padStart(2,'0')).join('')}
const rgba=(c,a)=>{const v=hx3(c);return`rgba(${v[0]},${v[1]},${v[2]},${fcl(a,0,1)})`};
const rgb3=c=>hx3(c).join(',');

// ------------------------------------------------------------------ the film's state
const FM={on:false,splash:false,ver:'A',trailer:false,t:0,start:0,last:0,DUR:40,shot:null,onEnd:null,ended:false,logo:false,
  cv:null,host:null,W:360,H:640,dpr:1,k:1,cw:360,ch:640,lay:null,rim:null,bb:null,bbDiv:3,grain:null,frame:0};
let X=null;                       // the film's 2D context (the screen, or the soft background while it is being drawn)
let CPX=1;                        // device pixels per logical unit on the canvas being drawn
let C={};                         // the camera of this frame
let FOGC='#000000',FOGD=1e9;      // fog: colour and distance (world units) of this frame

function fmSetup(host){FM.host=host;
  if(!document.getElementById('filmCss')){const st=document.createElement('style');st.id='filmCss';
    // the film draws its own words; in the trailer there is no Salta, and the title stays
    st.textContent='#introScr.film{background:#000}#introScr.film #iCap{display:none}#introScr.trailer #iSkip{display:none}#introScr.film #iFlash{display:none}';document.head.appendChild(st)}
  if(!FM.cv){const c=document.createElement('canvas');c.id='filmCv';c.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;display:block;z-index:0';
    FM.cv=c;X=c.getContext('2d');FM.lay=document.createElement('canvas');FM.rim=document.createElement('canvas');FM.bb=document.createElement('canvas')}
  if(FM.cv.parentNode!==host)host.insertBefore(FM.cv,host.firstChild);fmResize()}
function fmResize(){const r=FM.host.getBoundingClientRect(),cw=Math.max(1,r.width),ch=Math.max(1,r.height),dpr=LOWFX?1:Math.min(2,window.devicePixelRatio||1);
  FM.cw=cw;FM.ch=ch;FM.dpr=dpr;FM.k=Math.min(cw/360,ch/640);FM.W=cw/FM.k;FM.H=ch/FM.k;
  const w=Math.round(cw*dpr),h=Math.round(ch*dpr);for(const c of[FM.cv,FM.lay,FM.rim])if(c.width!==w||c.height!==h){c.width=w;c.height=h}}
const PX=()=>FM.dpr*FM.k;          // device pixels per logical unit

// ------------------------------------------------------------------ the camera
// x, y, z: where it is (y goes down: the ground is y=0, up is negative); f: the lens (bigger = closer); hx, hy: where the
// centre of the view is on the screen (moving hy is a lens shift: the horizon goes up or down without bending the verticals);
// roll: the tilt of the frame; sh: the hand-held shake; dof: how soft the far background is (0 = sharp); bgZ: from where it is soft
function camDefaults(){return{x:0,y:-30,z:-100,f:600,hx:.5,hy:.5,roll:0,sh:0,shx:0,shy:0,dof:0,bgZ:1e9,fog:null,fogD:1e9}}
const sc=z=>{const d=z-C.z;return d>.05?C.f/d:C.f/.05};
function pr(x,y,z){const s=sc(z);return[FM.W*C.hx+s*(x-C.x),FM.H*C.hy+s*(y-C.y),s]}
// the transform of a card at depth z (world units on the card), after base()
function cardT(c,z){const s=sc(z);c.translate(FM.W*C.hx-s*C.x,FM.H*C.hy-s*C.y);c.scale(s,s);return s}
function base(c,px){c.setTransform(px,0,0,px,0,0);if(C.roll||C.shx||C.shy){c.translate(FM.W/2+C.shx,FM.H/2+C.shy);c.rotate(C.roll);c.translate(-FM.W/2,-FM.H/2)}}
// how much fog is in front of something at depth z, and a colour seen through it
const fz=z=>FOGD>=1e8?0:1-Math.exp(-Math.max(0,z-C.z)/FOGD);
const fogc=(col,z,k)=>mc(col,FOGC,fz(z)*(k==null?1:k));
// a ground polygon (points [x, z] on y=0, or [x, y, z]) projected on the screen; only the part in front of the camera
function gpoly(c,pts,near){near=near||C.z+2;const out=[],P=pts.map(q=>q.length===2?[q[0],0,q[1]]:q);
  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],ia=a[2]>near,ib=b[2]>near;if(ia)out.push(a);
    if(ia!==ib){const k=(near-a[2])/(b[2]-a[2]);out.push([flp(a[0],b[0],k),flp(a[1],b[1],k),near])}}
  c.beginPath();for(const q of out){const p=pr(q[0],q[1],q[2]);c.lineTo(p[0],p[1])}c.closePath();return out.length>2}
// a straight line in the world (clipped to the front of the camera)
function wline(c,a,b,near){near=near||C.z+2;if(a[2]<=near&&b[2]<=near)return false;if(a[2]<near){const k=(near-a[2])/(b[2]-a[2]);a=[flp(a[0],b[0],k),flp(a[1],b[1],k),near]}
  if(b[2]<near){const k=(near-b[2])/(a[2]-b[2]);b=[flp(b[0],a[0],k),flp(b[1],a[1],k),near]}const p=pr(a[0],a[1],a[2]),q=pr(b[0],b[1],b[2]);c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);return true}

// ------------------------------------------------------------------ light and paint helpers (on the film's context)
const GLW={};function glowSpr(c3){let s=GLW[c3];if(s)return s;s=document.createElement('canvas');s.width=s.height=96;const g=s.getContext('2d'),r=g.createRadialGradient(48,48,0,48,48,48);
  r.addColorStop(0,`rgba(${c3},1)`);r.addColorStop(.25,`rgba(${c3},.55)`);r.addColorStop(.6,`rgba(${c3},.14)`);r.addColorStop(1,`rgba(${c3},0)`);g.fillStyle=r;g.fillRect(0,0,96,96);return GLW[c3]=s}
// a soft light: additive glow (c3 = 'r,g,b')
function glo(c,c3,x,y,r,a,ry,mode){if(a<=0||r<=0)return;c.save();c.globalCompositeOperation=mode||'lighter';c.globalAlpha=Math.min(1,a);c.drawImage(glowSpr(c3),x-r,y-(ry||r),r*2,(ry||r)*2);c.restore()}
// a shape drawn soft (out of focus): its shadow, blurred, is the only thing that shows
function soft(c,blur,col,path){if(blur<.6||LOWFX){c.fillStyle=col;path();c.fill();return}c.save();const m0=c.getTransform(),sx=Math.hypot(m0.a,m0.b)||1,off=4000/sx;c.translate(-off,0);
  const m=c.getTransform();c.shadowColor=col;c.shadowBlur=blur*CPX;c.shadowOffsetX=off*m.a;c.shadowOffsetY=off*m.b;c.fillStyle=col;path();c.fill();c.restore()}
const INKC='#1b1612';
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function blob(c,pts){// a closed smooth shape through points
  c.beginPath();const n=pts.length;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],m=[(a[0]+b[0])/2,(a[1]+b[1])/2];if(i===0){const z=pts[n-1],m0=[(z[0]+a[0])/2,(z[1]+a[1])/2];c.moveTo(m0[0],m0[1])}c.quadraticCurveTo(a[0],a[1],m[0],m[1])}c.closePath()}

// ------------------------------------------------------------------ the hero in the scene
// H: {x, z, face, anim, p, el (the tilt of his own camera, 12° = eye level, 45° = the game), st (style), moss, look, tweak,
// pull, sc, tint (a colour over him), wash: [colour, a, x, y, r] (a light falling on him, screen units), rim: [colour, a, dx, dy, w]
// (a light behind him: the edge toward (dx, dy) lights up), shadow: alpha of the shadow on the floor}
function camEl(el){const th=el*Math.PI/180,SP=Math.SQRT2*Math.sin(th),CP=Math.SQRT2*Math.cos(th),flat=Math.abs(el-45)<.01,kr=flat?1:Math.sqrt(SP),zk=flat?1:Math.pow(CP,.25);
  Object.assign(CR.cam,{k:flat?.55:.55*kr,zk});RIGCAM.kr=kr;RIGCAM.zk=zk}
function heroPt(H){return pr(H.x,0,H.z)}
// FM.cheap (slow phones, LOWFX, or measured during the film): the hero's light layer works at half size, with the tint only
const fmCheap=()=>LOWFX||FM.cheap;
function drawHero(H){const L=FM.lay,LX=L.getContext('2d'),px=PX(),cheap=fmCheap();LX.setTransform(1,0,0,1,0,0);LX.clearRect(0,0,cheap?L.width/2+2:L.width,cheap?L.height/2+2:L.height);base(LX,cheap?px/2:px);
  const q=heroPt(H),s=q[2]*(H.sc||1);
  // the shadow on the floor, under him (the scene's, not the game's)
  if(H.shadow!==0){X.save();base(X,px);const g=X.createRadialGradient(q[0],q[1],1,q[0],q[1],15*s);g.addColorStop(0,`rgba(0,0,0,${H.shadow||.5})`);g.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=g;X.translate(q[0],q[1]);X.scale(1,Math.max(.12,.32*(H.el||20)/30));X.translate(-q[0],-q[1]);X.beginPath();X.arc(q[0],q[1],15*s,0,FTAU);X.fill();X.restore()}
  const saved=ctx,ns=noShadow;ctx=LX;noShadow=true;camEl(H.el==null?24:H.el);
  try{EROE.arciere(q[0],q[1],H.face,H.anim||'idle',H.p||0,s,{style:H.st,moss:H.moss?2:false,eyeLight:H.eyeLight!==false,look:H.look||0,tweak:H.tweak,noFx:true,pull:H.pull,inhale:H.inhale,exhale:H.exhale})}
  catch(e){if(!drawHero.err){drawHero.err=1;console.error(e)}}finally{camEl(45);ctx=saved;noShadow=ns}
  if(cheap){LX.setTransform(1,0,0,1,0,0);if(H.tint){LX.globalCompositeOperation='source-atop';LX.fillStyle=H.tint[0]==='#'?rgba(mc(H.tint,'#000000',.35),.5):H.tint;LX.fillRect(0,0,L.width/2+2,L.height/2+2);LX.globalCompositeOperation='source-over'}
    X.save();X.setTransform(1,0,0,1,0,0);X.globalAlpha=H.alpha==null?1:H.alpha;X.drawImage(L,0,0,L.width/2,L.height/2,0,0,L.width,L.height);X.restore();return}
  // the light of the scene on him. The mask keeps his shape (blend modes paint outside it too); tint multiplies him (the night),
  // the washes are lights added in screen; the rims are a thin band of light just inside his outline on the side of the light
  const M=FM.rim,MX=M.getContext('2d'),W0=L.width,H0=L.height,al=H.alpha==null?1:H.alpha;
  // every step works only on the box round him (in device pixels), not on the whole screen
  const mg=20+Math.abs(C.shx||0)+Math.abs(C.shy||0),bx=Math.max(0,Math.floor((q[0]-40*s-mg)*px)),by=Math.max(0,Math.floor((q[1]-62*s-mg)*px)),
    bw=Math.min(W0,Math.ceil((q[0]+40*s+mg)*px))-bx,bh=Math.min(H0,Math.ceil((q[1]+14*s+mg)*px))-by;if(bw<=0||bh<=0)return;
  const clip=c=>{c.save();c.setTransform(1,0,0,1,0,0);c.beginPath();c.rect(bx,by,bw,bh);c.clip()},cut=(c,img,dx,dy)=>c.drawImage(img,bx,by,bw,bh,bx+(dx||0),by+(dy||0),bw,bh);
  clip(MX);MX.globalCompositeOperation='copy';cut(MX,L);MX.restore();
  clip(LX);
  if(H.tint){LX.globalCompositeOperation=H.tint[0]==='#'?'multiply':'source-atop';LX.fillStyle=H.tint;LX.fillRect(bx,by,bw,bh)}
  if(H.wash&&!LOWFX)for(const w of(Array.isArray(H.wash[0])?H.wash:[H.wash])){const[col,a,wx,wy,wr]=w;if(a<=0)continue;const g=LX.createRadialGradient(wx*px,wy*px,0,wx*px,wy*px,Math.max(1,wr*px));
    g.addColorStop(0,rgba(col,a));g.addColorStop(.55,rgba(col,a*.35));g.addColorStop(1,rgba(col,0));LX.globalCompositeOperation='screen';LX.fillStyle=g;LX.fillRect(bx,by,bw,bh)}
  LX.globalCompositeOperation='destination-in';cut(LX,M);LX.restore();
  X.save();X.setTransform(1,0,0,1,0,0);X.globalAlpha=al;cut(X,L);X.restore();
  if(H.rim&&!LOWFX){const R2=FM.rim2||(FM.rim2=document.createElement('canvas'));if(R2.width!==W0||R2.height!==H0){R2.width=W0;R2.height=H0}const RX=R2.getContext('2d');
    for(const r of(Array.isArray(H.rim[0])?H.rim:[H.rim]).slice(0,1)){const[col,a,dx,dy,w]=r;if(a<=0)continue;const l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,o1=2.3*s*px*.5,o2=o1+(w||1.3)*s*px*.55;
      // pixels inside his outline (moved by its width) that are near the edge toward the light
      clip(RX);RX.globalCompositeOperation='copy';cut(RX,M,-ux*o1,-uy*o1);RX.globalCompositeOperation='destination-in';cut(RX,M);
      RX.globalCompositeOperation='destination-out';cut(RX,M,-ux*o2,-uy*o2);RX.globalCompositeOperation='source-in';RX.fillStyle=col;RX.fillRect(bx,by,bw,bh);RX.restore();
      X.save();X.setTransform(1,0,0,1,0,0);X.globalCompositeOperation='screen';X.globalAlpha=a*al;cut(X,R2);X.restore()}}}

// ------------------------------------------------------------------ one frame
// a set gives: sky(t, sh) (drawn first, screen units), items(t, sh, lt) -> [{z, c(ctx, s)} cards | {z, s(ctx)} screen | {z, hero}],
// over(t, sh) (after everything, screen units: light shafts, dust in the air). The shot gives the camera and the hero.
const SETS={};let SHOTS=[];
function shotAt(t){let s=SHOTS[0];for(const q of SHOTS)if(t>=q.t0)s=q;return s}
function render(t){if(!X)return;FM.t=t;FM.frame++;const sh=shotAt(t),lt=t-sh.t0,k=fcl(lt/sh.d,0,1);FM.shot=sh;
  C=Object.assign(camDefaults(),sh.cam?sh.cam(k,lt,t):{});
  // the hand-held shake: a smooth wobble, plus a hard shake for the screams and the blows
  if(C.sh||C.hit){const a=C.sh||0,h=C.hit||0;C.shx=wob(t*2.2,1.3)*a+h*(Math.sin(t*61)*1.6+Math.sin(t*37)*.8);C.shy=wob(t*2.6,4.1)*a+h*(Math.cos(t*53)*1.6+Math.sin(t*29)*.8);C.roll+=wob(t*1.4,2.7)*a*.004+h*Math.sin(t*41)*.004}
  FOGC=C.fog||'#000000';FOGD=C.fogD||1e9;
  const S=SETS[sh.set],px=PX();X.setTransform(1,0,0,1,0,0);X.globalCompositeOperation='source-over';X.globalAlpha=1;X.fillStyle='#000';X.fillRect(0,0,FM.cv.width,FM.cv.height);
  if(!S){fmPost(t,sh,lt);return}
  const H=sh.hero?sh.hero(lt,k,t):null;sh.heroNow=H;
  const items=S.items(t,sh,lt);if(H)items.push({z:H.z+(H.dz||0),hero:H});items.sort((a,b)=>b.z-a.z);
  // depth of field: the far part goes on a small canvas, drawn enlarged (soft). X is always the canvas being drawn on
  const MAIN=X,useBB=C.dof>0&&!fmCheap();let inBB=false;CPX=px;
  if(useBB){const div=1+C.dof,bw=Math.max(8,Math.round(FM.cv.width/div)),bh=Math.max(8,Math.round(FM.cv.height/div));if(FM.bb.width!==bw||FM.bb.height!==bh){FM.bb.width=bw;FM.bb.height=bh}
    X=FM.bb.getContext('2d');CPX=px*bw/FM.cv.width;X.setTransform(1,0,0,1,0,0);X.globalCompositeOperation='source-over';X.globalAlpha=1;X.fillStyle='#000';X.fillRect(0,0,bw,bh);inBB=true}
  const toMain=()=>{if(!inBB)return;inBB=false;X=MAIN;CPX=px;X.save();X.setTransform(1,0,0,1,0,0);X.imageSmoothingEnabled=true;X.imageSmoothingQuality='high';X.drawImage(FM.bb,0,0,FM.cv.width,FM.cv.height);X.restore()};
  try{
    X.save();base(X,CPX);if(S.sky)S.sky(t,sh,lt);X.restore();
    for(const it of items){if(it.z<=C.z+.5&&!it.always)continue;if(inBB&&(it.hero||it.z<C.bgZ))toMain();
      if(it.hero){drawHero(it.hero);continue}
      X.save();base(X,CPX);if(it.c){const s=cardT(X,it.z);it.c(X,s)}else if(it.s)it.s(X);X.restore()}
    toMain();
    if(S.over){X.save();base(X,px);S.over(t,sh,lt);X.restore()}
  }finally{X=MAIN;CPX=px}
  if(sh.over){X.save();base(X,px);sh.over(lt,k,t);X.restore()}
  fmPost(t,sh,lt)}

// ------------------------------------------------------------------ after the picture: colour, vignette, grain, fades, words
function fmGrain(){if(FM.grain)return FM.grain;const g=document.createElement('canvas');g.width=g.height=128;const x=g.getContext('2d'),im=x.createImageData(128,128),r=frng(77);
  for(let i=0;i<im.data.length;i+=4){const v=Math.round(r()*255);im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}x.putImageData(im,0,0);return FM.grain=g}
function fmPost(t,sh,lt){const px=PX(),W=FM.W,H=FM.H;X.save();X.setTransform(px,0,0,px,0,0);
  if(sh.grade){X.globalCompositeOperation='soft-light';X.fillStyle=sh.grade;X.fillRect(0,0,W,H);X.globalCompositeOperation='source-over'}
  const vg=sh.vig==null?.62:sh.vig;if(vg>0){const key=W.toFixed(0)+'x'+H.toFixed(0);if(!FM.vig||FM.vigK!==key){const v=FM.vig||(FM.vig=document.createElement('canvas'));v.width=Math.round(W/4);v.height=Math.round(H/4);
      const x=v.getContext('2d'),g=x.createRadialGradient(v.width/2,v.height*.47,Math.min(v.width,v.height)*.28,v.width/2,v.height*.5,Math.hypot(v.width,v.height)*.6);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,1)');x.fillStyle=g;x.fillRect(0,0,v.width,v.height);FM.vigK=key}
    X.globalAlpha=vg;X.drawImage(FM.vig,0,0,W,H);X.globalAlpha=1}
  if(!fmCheap()){const gr=fmGrain(),f=Math.floor(t*24),r=frng(f+1),pat=X.createPattern(gr,'repeat');X.globalCompositeOperation='soft-light';X.globalAlpha=.09;X.translate(-r()*128,-r()*128);X.fillStyle=pat;X.fillRect(0,0,W+256,H+256);X.setTransform(px,0,0,px,0,0);X.globalAlpha=1;X.globalCompositeOperation='source-over'}
  // fades: from black at the start of a shot (sh.fin seconds), to black at its end (sh.fout seconds), a white flash (sh.flash)
  let blk=0;if(sh.fin)blk=Math.max(blk,1-seg01(lt,0,sh.fin));if(sh.fout)blk=Math.max(blk,seg01(lt,sh.d-sh.fout,sh.d));if(sh.black)blk=Math.max(blk,sh.black(lt));
  if(blk>0){X.fillStyle=`rgba(0,0,0,${blk})`;X.fillRect(0,0,W,H)}
  if(sh.flash){const a=sh.flash(lt);if(a>0){X.fillStyle=`rgba(255,250,235,${a})`;X.fillRect(0,0,W,H)}}
  fmWords(t);X.restore()}

// ------------------------------------------------------------------ the words: version A (short lines in the middle) or B (the hero's thoughts)
// [from, to, text]; set by 05 (TXT.A, TXT.B)
const TXT={A:[],B:[]};
function fmWrap(c,txt,maxW){const words=txt.split(' '),lines=[];let cur='';for(const w of words){const tr=cur?cur+' '+w:w;if(c.measureText(tr).width>maxW&&cur){lines.push(cur);cur=w}else cur=tr}if(cur)lines.push(cur);return lines}
function fmWords(t){const W=FM.W,H=FM.H,list=TXT[FM.ver]||[];
  for(const[a,b,txt,ty] of list){if(t<a||t>b)continue;const fi=seg01(t,a,a+.55),fo=1-seg01(t,b-.6,b),al=EZ.s(Math.min(fi,fo));if(al<=0)continue;
    X.save();X.textAlign='center';X.textBaseline='middle';
    if(FM.ver==='A'){// a slow line in the middle: it comes in a little bigger and settles, then fades
      const sz=Math.min(30,W*.082),s=1+.05*(1-EZ.o(fi));X.font=`400 ${sz}px "Lilita One","Baloo 2",system-ui,sans-serif`;
      X.translate(W/2,H*(ty||.4));X.scale(s,s);X.globalAlpha=al;X.shadowColor='rgba(0,0,0,.85)';X.shadowBlur=18*PX();X.fillStyle='#f6ead2';
      const lines=fmWrap(X,txt,W*.84);lines.forEach((ln,i)=>X.fillText(ln,0,(i-(lines.length-1)/2)*sz*1.12));
      X.shadowBlur=0;X.globalCompositeOperation='lighter';X.globalAlpha=al*.18;X.fillStyle='#c9ff7a';lines.forEach((ln,i)=>X.fillText(ln,0,(i-(lines.length-1)/2)*sz*1.12))}
    else{// the hero's thought: written letter by letter at the bottom, in italic
      const n=Math.floor(fcl((t-a)*24,0,txt.length)),part=txt.slice(0,n),sz=Math.min(19,W*.053);X.font=`italic 600 ${sz}px "Baloo 2",system-ui,sans-serif`;
      const lines=fmWrap(X,txt,W*.86),y0=H*(1-.065)-sz*1.3*(lines.length)-10;let left=part.length;X.globalAlpha=al;X.lineJoin='round';
      lines.forEach((ln,i)=>{const sh=ln.slice(0,Math.max(0,left));left-=ln.length+1;const y=y0+i*sz*1.3,w=X.measureText(ln).width,x0=W/2-w/2;X.textAlign='left';
        X.lineWidth=4.5;X.strokeStyle='rgba(10,8,6,.9)';X.strokeText(sh,x0,y);X.fillStyle='#fff6e2';X.fillText(sh,x0,y)})}
    X.restore()}}

// ------------------------------------------------------------------ playing it
// FILM.play({ver:'A'|'B', trailer:bool, onEnd}): shows #introScr with the film. The first touch starts the sound (the splash).
function fmLoop(now){if(!FM.on)return;requestAnimationFrame(fmLoop);if(FM.splash){render(0);return}
  if(now-FM.last>1000)FM.start+=now-FM.last-16;FM.last=now;// the tab slept: the film waits (a slow phone only drops frames)
  const t=(now-FM.start)/1000;if(FM.trailer&&t>FM.DUR)return render(FM.DUR);
  render(Math.max(0,t));
  // a phone that cannot keep up (more than ~30 ms between frames, after the first second) gets the cheap mode for the rest
  if(!FM.cheap&&t>1&&FM.prevF){const dt=now-FM.prevF;FM.ema=FM.ema==null?dt:FM.ema*.92+dt*.08;if(++FM.nf>30&&FM.ema>31)FM.cheap=true}FM.prevF=now;if(typeof AUD!=='undefined')AUD.tick(Math.max(0,t));fmLogo(t);
  if(!FM.trailer&&t>=FM.DUR+1.6&&!FM.ended)fmEnd()}
function fmLogo(t,force){const sc0=$('introScr'),on=t>=SHOT_LOGO;if(on!==FM.logo||force){FM.logo=on;sc0.classList.toggle('logo',on);
  const p=$('iPlay');if(p)p.textContent=FM.trailer?'Gioca ora':'Gioca!'}}
let SHOT_LOGO=38.75;
// the sound may start only from a real tap (on phones pointerdown does not count, the click after it does). On the iPhone the
// film also plays like a video, with the silent switch on (Safari 17+: navigator.audioSession); the setting goes back at the end
function fmUnlock(cb){try{initAudio()}catch(e){}
  try{const S=navigator.audioSession;if(S&&S.type!=='playback'){if(FM.sess==null)FM.sess=S.type;S.type='playback'}}catch(e){}
  const c=AU.ctx;if(!c||c.state==='running'){cb();return}let done=false;const go=()=>{if(done)return;done=true;cb()};
  try{c.resume().then(go,go)}catch(e){go()}setTimeout(go,700)}
function fmGo(){if(!FM.on)return;FM.splash=false;$('introScr').classList.remove('splash');try{initAudio()}catch(e){}
  FM.start=performance.now()+120-(FM.from||0)*1000;FM.last=performance.now();if(typeof AUD!=='undefined')AUD.start()}
function fmPlay(o){o=o||{};const sc0=$('introScr');FM.ver=o.ver==='B'?'B':'A';FM.cheap=false;FM.ema=null;FM.nf=0;FM.prevF=0;FM.trailer=!!o.trailer;FM.onEnd=o.onEnd||null;FM.on=true;FM.ended=false;FM.logo=false;
  sc0.hidden=false;sc0.className='';sc0.classList.toggle('film',true);sc0.classList.toggle('trailer',FM.trailer);fmSetup(sc0);
  if(!AU.ctx||AU.ctx.state!=='running'){FM.splash=true;sc0.classList.add('splash')}else fmGo();
  requestAnimationFrame(fmLoop)}
function fmEnd(){if(!FM.on)return;FM.on=false;FM.ended=true;if(typeof AUD!=='undefined')AUD.stop();const sc0=$('introScr');sc0.classList.remove('logo','splash','film','trailer');
  try{if(FM.sess!=null&&navigator.audioSession){navigator.audioSession.type=FM.sess;FM.sess=null}}catch(e){}
  if(FM.onEnd)FM.onEnd()}
addEventListener('resize',()=>{if(FM.cv&&FM.host)fmResize()});
// Salta, Gioca, the splash and the keys
$('iSkip').addEventListener('click',e=>{if(!FM.on)return;e.stopPropagation();try{initAudio()}catch(er){}fmEnd()});
$('iPlay').addEventListener('click',e=>{if(!FM.on)return;e.stopPropagation();fmEnd()});
$('introScr').addEventListener('click',e=>{if(FM.on&&FM.splash&&!FM.unl&&!e.target.closest('#iSkip')){e.preventDefault();FM.unl=true;fmUnlock(()=>{FM.unl=false;fmGo()})}});
addEventListener('keydown',e=>{if(!FM.on)return;if(e.code==='Escape')fmEnd();else if(FM.splash&&!FM.unl&&(e.code==='Enter'||e.code==='Space')){FM.unl=true;fmUnlock(()=>{FM.unl=false;fmGo()})}});
// if the sound is still asleep while the film plays, any tap wakes it up
{const wake=()=>{if(FM.on&&AU.ctx&&AU.ctx.state!=='running')try{AU.ctx.resume()}catch(e){}};for(const ev of['pointerup','touchend','click'])addEventListener(ev,wake,true)}
document.addEventListener('visibilitychange',()=>{if(!FM.on||FM.splash)return;if(document.hidden)FM.hid=performance.now();else if(FM.hid){FM.start+=performance.now()-FM.hid;FM.hid=0}});
// while the film plays the game stays quiet: no music of its own, no ambience of the menu underneath
{const _pm=playMusic;playMusic=function(n){if(FM.on)return;_pm(n)}}
if(typeof ambStart==='function'){const _as=ambStart;ambStart=function(k){if(FM.on||FM.offline)k=null;return _as(k)}}
