// Nemici del quarto capitolo (Brina e Ghiacciaio) rifatti in 3D come l'Arciere: stesse forme e colori di oggi nel gioco (EDRAW.wolf,
// EDRAW.snowspirit, EDRAW.icesentinel), dipinti con la cassetta C3 (base3d.js). Ogni mossa dipende solo da p (0..1).
// Lupo delle nevi: grigio azzurro con la pancia chiara e la sella scura, occhi di ghiaccio, orecchie a punta e coda folta con la punta
// bianca; zampe a due ossa che trottano a coppie diagonali; ulula col muso al cielo, poi scatta in avanti e morde (attacco).
// Spirito della neve: una goccia di neve bianca e azzurra che fluttua, occhioni blu e un sorriso, due manine, un fiocco di neve che
// gira sopra la testa e tre fiocchetti che le girano intorno; si raccoglie e scoppia in una raffica di neve (attacco) e sparisce in un
// vortice di fiocchi per ricomparire altrove (teletrasporto).
// Sentinella di ghiaccio: un blocco di cristallo sfaccettato con la runa a rombo che brilla, occhietti blu, pugni e piedi azzurri, tre
// schegge di ghiaccio che le girano intorno (o.shards, come e.shards nel gioco); cammina pesante e lancia il ghiaccio alzando i pugni.
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,tri,hull,rim,run,dk,lt,rgba,poly,line,bbox,softBox,softBall,chull,
  look,blink,keys,bump,sstep,hitK,frame,vol,ellPts,ellAt,ellN,chain,disc3,spot,eyes,mouth,ellFace,floor,stars,orb,parts,reg,shine,rotX,rotY,rotZ,wa,ik,stepper,cmix,IDF}=C;

// ------------------------------------------------------------------ ovals: ellipsoids drawn with their exact screen outline
// an ellipsoid (centre C, radii Rd along the frame's axes, through the frame X) seen by the camera is exactly an ellipse on the screen:
// the image of the unit ball under the linear map L (its columns are the projected radii), whose outline comes from L·Lᵀ
function oval(V0,X,Cc,Rd){const o=V0.P(X.T(Cc)),Lc=[0,1,2].map(i=>{const e=[0,0,0];e[i]=Rd[i];const q=V0.P(X.T(add(Cc,e)));return[q[0]-o[0],q[1]-o[1]]});
  let a=0,b=0,d=0;for(const l of Lc){a+=l[0]*l[0];b+=l[0]*l[1];d+=l[1]*l[1]}const m=(a+d)/2,r=Math.sqrt(((a-d)/2)**2+b*b),rot=.5*Math.atan2(2*b,a-d),rx=Math.sqrt(m+r),ry=Math.sqrt(Math.max(.01,m-r));
  const ex=Math.sqrt(rx*rx*Math.cos(rot)**2+ry*ry*Math.sin(rot)**2),ey=Math.sqrt(rx*rx*Math.sin(rot)**2+ry*ry*Math.cos(rot)**2);
  return{c:o,rx,ry,rot,bb:[o[0]-ex,o[1]-ey,o[0]+ex,o[1]+ey],path:(k)=>{k=k||0;ctx.beginPath();ctx.ellipse(o[0],o[1],Math.max(.2,rx-k),Math.max(.2,ry-k),rot,0,TAU)}}}
// the warm rim inside an outline, from its screen box (as C3.rimPoly, for any path)
function rimIn(bb,path,al){const[x0,y0,x1,y1]=bb,cx=(x0+x1)/2,cy=(y0+y1)/2,R=Math.max(x1-x0,y1-y0)/2,g=ctx.createLinearGradient(cx-R*.8,cy-R*.8,cx+R*.15,cy+R*.15);
  g.addColorStop(0,wa(al||.3));g.addColorStop(1,wa(0));ctx.save();ctx.strokeStyle=g;ctx.lineWidth=1.3;path();ctx.stroke();ctx.restore()}
// an ellipsoid painted like C3.vol: three soft tones, the thick outline, the warm rim. Returns the oval (o.path() to clip)
function ovol(V0,X,Cc,Rd,col,o){o=o||{};const E=oval(V0,X,Cc,Rd);E.path();ctx.fillStyle=o.fill||softBox(E.bb,col,o.kl,o.kd);ctx.fill();if(!o.noInk){ink(o.lw||2.5);ctx.stroke()}
  if(!o.noRim)rimIn(E.bb,()=>E.path(1.9),o.rim);return E}
// points round an oval's outline
function ovalPts(E,n){const pts=[],cr=Math.cos(E.rot),sr=Math.sin(E.rot);for(let i=0;i<n;i++){const t=i/n*TAU,c=Math.cos(t)*E.rx,s=Math.sin(t)*E.ry;pts.push([E.c[0]+c*cr-s*sr,E.c[1]+c*sr+s*cr])}return pts}
// several ellipsoids as one smooth body: the convex hull of their outlines
function blobHull(V0,X,ells,n){let pts=[];for(const[Cc,R] of ells)pts=pts.concat(ovalPts(oval(V0,X,Cc,R),n||22));return chull(pts)}
// the part of such a body below the height z of its own frame, as we see it: under the near half of its cross-section at z (the lower
// chain of that section on the screen), down to the bottom of the box bb. Leaves the path ready to fill; false if the body is all above z
function below(V0,X,ells,z,bb){const pts=[];for(const[Cc,R] of ells){const t=(z-Cc[2])/R[2];if(Math.abs(t)>=1)continue;const k=Math.sqrt(1-t*t);
    for(let i=0;i<24;i++){const a=i/24*TAU;pts.push(V0.P(X.T([Cc[0]+R[0]*k*Math.cos(a),Cc[1]+R[1]*k*Math.sin(a),z])))}}
  if(pts.length<3)return false;const h=chull(pts),n=h.length;let iL=0,iR=0;h.forEach((q,i)=>{if(q[0]<h[iL][0])iL=i;if(q[0]>h[iR][0])iR=i});
  const ch=(a,b)=>{const r=[];for(let i=a;;i=(i+1)%n){r.push(h[i]);if(i===b)break}return r},c1=ch(iL,iR),c2=ch(iR,iL).reverse(),my=c=>c.reduce((s,q)=>s+q[1],0)/c.length,lo=my(c1)>=my(c2)?c1:c2;
  ctx.beginPath();for(const q of lo)ctx.lineTo(q[0],q[1]);ctx.lineTo(lo[lo.length-1][0],bb[3]+30);ctx.lineTo(lo[0][0],bb[3]+30);ctx.closePath();return true}

// ------------------------------------------------------------------ LUPO DELLE NEVI (EDRAW.wolf): 56 long from the tail to the nose
const WC={fur:'#8a9ab0',lite:'#d8e2ee',dark:'#5a6a80',earIn:'#7c8aa0',nose:'#1b1612',eye:'#9fe6ff',mouth:'#5a1f2e',fang:'#f4f8ff'};
// the body: the chest and the hips, two ellipsoids under one skin
const WB=[[[3.5,0,17.4],[10.5,8.6,7.4]],[[-9.5,0,16.6],[8,7.6,6.4]],[[9.6,0,21],[4.6,5,4.8]]];
// the legs: hips (body frame) and paws at rest (on the floor); front legs bend forward at the wrist, hind legs back at the hock
const WL=[{h:[7.6,-4.6,12.4],f:[8.6,-5,0],fr:1,k:0},{h:[7.6,4.6,12.4],f:[8.6,5,0],fr:1,k:.5},{h:[-10.4,-4.4,12.4],f:[-10.2,-4.8,0],fr:-1,k:.5},{h:[-10.4,4.4,12.4],f:[-10.2,4.8,0],fr:-1,k:0}];
// the head, in its own frame (x along the muzzle, z up, origin in the middle of the skull)
const WSK=[5.8,5.9,5.4],WMZ=[[1.6,0,-.4,4.2,3.6],[7.4,0,-.9,3,2.6],[11.4,0,-1.1,2.1,1.8]],WJW=[[1.8,0,-3.2,3,1.9],[6.5,0,-3.1,2.3,1.4],[10.2,0,-2.6,1.4,.9]];
// a tapered volume through rings [x, y, z, half width, half height] (the muzzle and the jaw), turned by fn into the frame of the camera
function rings(R,fn,m){const pts=[];m=m||10;for(const[x,y,z,w,h] of R)for(let i=0;i<m;i++){const a=i/m*TAU;pts.push(fn([x,y+Math.cos(a)*w,z+Math.sin(a)*h]))}
  const l=R[R.length-1];pts.push(fn([l[0]+l[4]*.8,l[1],l[2]]));return pts}
function wolf(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU;
  // A: the body (B, lean = the front goes down > 0, roll, s, sx, yaw), the head (H its place in the body frame, hp nose up, hy look,
  // jaw 0..1, ears back 0..1), the tail (tl lift, tw sway), the paws (dx, dz off their rest place), the face, the puffs, the stars
  const A={B:[0,0,0],lean:0,roll:0,s:0,sx:0,yaw:0,H:[13.8,0,23.2],hp:0,hy:0,jaw:0,ears:0,tl:0,tw:0,pw:WL.map(()=>[0,0,0]),blink:1,shut:0,squint:0,puff:-1,stars:0};
  if(anim==='walk'){// a trot: the diagonal pairs swing together, the body bobs twice a stride, the head nods, the tail streams
    const st=stepper(p,.5);WL.forEach((l,i)=>{const s=st(l.k,4.2,2.8);A.pw[i]=[s.x,0,s.z]});const up=Math.abs(Math.cos(ph));
    A.B=[0,0,.7*up-.3];A.s=.02*up;A.roll=.04*Math.sin(ph);A.lean=.03;A.H=[14.4,0,22.8+.5*up];A.hp=-.06-.04*up;A.tl=.25;A.tw=.25*Math.sin(ph)}
  else if(anim==='attack'){// the lunge: .0-.18 it crouches, .18-.42 it springs forward, the body stretched, the jaws open, .42-.52 it bites
    // and lands, .52-1 it steps back into its stance
    const v=keys([[0,[0,0,0,0,0]],[.18,[-1.4,-2.2,.06,0,-.12]],[.32,[3.6,2.4,-.06,.14,.05]],[.42,[5.4,1.2,.04,.1,0]],[.52,[5.2,-.8,.08,0,-.1]],[.64,[4.4,0,.02,0,0]],[1,[0,0,0,0,0]]],p);
    A.B=[v[0],0,v[1]];A.lean=v[2];A.sx=v[3];A.s=v[4];A.jaw=p<.2?0:p<.3?ez((p-.2)/.1):p<.46?1:p<.5?1-ez((p-.46)/.04):0;A.ears=sstep(.05,.2,p)*(1-sstep(.6,.85,p));
    A.H=[14.4+keys([[0,0],[.18,-.6],[.38,2.2],[.5,1.4],[1,0]],p),0,23.2+keys([[0,0],[.18,-2.4],[.38,-.8],[.52,-1.2],[1,0]],p)];A.hp=keys([[0,0],[.18,-.2],[.38,.06],[.5,-.08],[1,0]],p);
    const fr=keys([[0,[0,0]],[.2,[-.5,0]],[.3,[6,3.4]],[.42,[9,2]],[.5,[8.4,0]],[.66,[8.4,0]],[.8,[3.6,2]],[.92,[0,0]],[1,[0,0]]],p),
      hi=keys([[0,[0,0]],[.22,[0,0]],[.34,[-1.5,0]],[.44,[4,2.6]],[.54,[6,0]],[.7,[6,0]],[.86,[2,2]],[.96,[0,0]],[1,[0,0]]],p);
    WL.forEach((l,i)=>{const k=l.fr>0?fr:hi,dl=l.fr>0?(i===1?.4:0):(i===2?.4:0);A.pw[i]=[k[0]+dl,0,k[1]]});A.tl=keys([[0,0],[.2,-.4],[.36,.7],[.6,.3],[1,0]],p);A.squint=sstep(.1,.25,p)*(1-sstep(.55,.7,p))}
  else if(anim==='howl'){// the nose goes up to the sky, the mouth opens, the howl shakes the head and fogs the air, then it comes down
    const k=sstep(0,.2,p)*(1-sstep(.8,1,p)),sh=p>.22&&p<.8?Math.sin(p*TAU*14)*.03:0;A.hp=.95*k+sh;A.H=[13.4-1.6*k,0,23.2+4.4*k];A.lean=-.1*k;A.B=[-1*k,0,0];
    A.jaw=sstep(.15,.28,p)*(1-sstep(.74,.86,p));A.ears=.6*k;A.tl=-.25*k;A.tw=.2*k*Math.sin(ph*3);A.squint=k;A.puff=p>.25&&p<.95?(p-.25)/.7:-1}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.18*kb;A.B=[-2.6*kb,0,.4*kb];A.roll=.08*kb;A.s=-.06*kb;A.hp=.25*kb;A.H=[13.4,0,23.2+1.2*kb];A.ears=kb;A.tl=-.5*kb;
    A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0}
  else{// standing: it breathes, looks round slowly, flicks an ear, the tail sways
    const b=Math.sin(ph);A.s=.018*b;A.H=[13.8,0,23.2+.3*b];A.hy=look(p,.45);A.hp=.04*Math.sin(ph*2+1);A.blink=blink(p,.32,.07);A.tw=.3*Math.sin(ph*2);A.tl=.1*b;
    A.ears=.25*bump(cl((p-.6)/.08,0,1))}
  const X=frame(A,0),dT=D(X.T([-3,0,17]));
  floor(V0,x,y,sc,[A.B[0]-1.5,A.B[1],0],19,6.2,.3,A.B[2]);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  // the head's frame: rings and points of the head (nose up hp, look hy) placed at H in the body frame
  const hT=q=>X.T(add(A.H,rotZ(rotY(mul(q,1.1),-A.hp),A.hy))),hR=v=>X.Rd(rotZ(rotY(v,-A.hp),A.hy)),XH={T:hT,Rd:hR},hD=D(hT([0,0,0]));
  // the legs: two bones with ik, always under the body (the far ones darker), a round paw at the end
  WL.forEach((l,i)=>{const hip=X.T(l.h),pw=add(add(l.f,A.pw[i]),[A.B[0],A.B[1],0]),far=F(0,l.h[1],0)<0,col=far?cmix(WC.fur,WC.dark,.6):WC.fur;
    L.add(dT-100+D(add(l.f,[0,0,6]))*.01,()=>{const an=add(pw,[0,0,1.7]),IK=ik(hip,an,5.8,5.6,X.Rd([l.fr,0,.1])),kn=IK[0],end=IK[1];
      chain(V0,[hip,kn,end],[2.5,2.2,1.9],col,{lw:1.7,kl:.12,kd:.3,rim:.15});ovol(V0,IDF,add(end,[.9,0,-.5]),[2.5,2,1.5],far?cmix(WC.lite,WC.dark,.45):cmix(WC.lite,WC.fur,.3),{lw:1.7,noRim:true})})});
  // the bushy tail with its white tip, from under the rump
  {const T=[[-16,0,18],[-21.4,0,17],[-26,0,13.8],[-28.6,0,10]],sw=[0,.6,1.4,2.2],pts=T.map((q,i)=>X.T(add(q,[0,A.tw*sw[i]*4,A.tl*i*2.4-(A.tl<0?A.tl*i*.6:0)]))),rs=[2.6,3.7,3.4,2.4];
    L.add(D(X.T(T[1]))-4,()=>{const Q=chain(V0,pts,rs,WC.fur,{lw:2.2,kl:.14,kd:.3}),a=lerp3(Q[2].concat(0),Q[3].concat(0),.4);
      ctx.fillStyle=softBox([a[0]-4,a[1]-4,Q[3][0]+4,Q[3][1]+4],WC.lite,.1,.18);hull(a,rs[2]*.92-1,Q[3],rs[3]-1);ctx.fill()})}
  // the body: chest and hips under one skin, the pale belly, the dark saddle on the back
  L.add(dT,()=>{const hp=blobHull(V0,X,WB),bb=bbox(hp);ctx.lineJoin='round';poly(hp);ctx.fillStyle=softBox(bb,WC.fur,.16,.3);ctx.fill();
    ctx.save();poly(hp);ctx.clip();
    if(below(V0,X,WB.slice(0,2),15.8,bb)){ctx.fillStyle=softBox(bb,WC.lite,.08,.16);ctx.fill()}
    // the saddle: a dark patch lying on the back, behind the shoulders
    {const c=X.T([-4,0,24]),n=X.Rd([0,0,1]),v=F(n);if(v>0){const u=X.Rd([1,0,0]),w=X.Rd([0,1,0]),pts=[];for(let i=0;i<20;i++){const a=i/20*TAU;pts.push(P(add(c,add(mul(u,Math.cos(a)*9),mul(w,Math.sin(a)*5.4)))))}
      ctx.fillStyle=rgba(WC.dark,.85);C.smooth(pts);ctx.fill()}}
    // the shadow under the head on the shoulders
    {const q=P(hT([-1,0,-3])),g=ctx.createRadialGradient(q[0],q[1]+3,1,q[0],q[1]+3,9);g.addColorStop(0,'rgba(20,30,50,.22)');g.addColorStop(1,'rgba(20,30,50,0)');ctx.fillStyle=g;ctx.fillRect(q[0]-10,q[1]-7,20,20)}
    ctx.restore();ink(2.4);poly(hp);ctx.stroke();C.rimPoly(hp,.32)});
  // the head: the skull and the upper muzzle under one skin (as the game's wedge), the pale jaw under it (it opens round its hinge), the
  // dark mouth, two little fangs, the black nose, the ice eyes, the ears; its own little list of parts in the order the camera sees them
  L.add(hD,()=>{const H=parts(),fc=ellFace(V0,XH,[0,0,0],WSK),op=A.jaw,fwd=F(hR([1,0,0]));
    for(const sd of[-1,1]){const b=[-1.6,sd*3.6,3.6],tp=[-3.3-2.6*A.ears,sd*4.3,11.2-2*A.ears],ax=nrm(sub(tp,b));
      H.add(D(hT(b))-1.4,()=>{const u=nrm(cross(ax,[1,0,0])),w=nrm(cross(ax,u)),pts=[hT(tp)];for(let i=0;i<10;i++){const a=i/10*TAU;pts.push(hT(add(b,add(mul(u,Math.cos(a)*2.6),mul(w,Math.sin(a)*2.7)))))}
        const hp=vol(V0,pts,WC.dark,{kl:.18,kd:.25,lw:2,rim:.25});
        // the inside of the ear, paler, where it faces us
        const f=F(hR(nrm([1,sd*.25,.15])));if(f>.05){ctx.save();ctx.globalAlpha=cl(f*3,0,1);const t=P(hT(lerp3(tp,b,.12))),b0=P(hT(add(b,mul(u,1.3)))),b1=P(hT(add(b,mul(u,-1.3))));
          ctx.fillStyle=WC.earIn;ctx.beginPath();ctx.moveTo(t[0],t[1]);ctx.lineTo(b0[0],b0[1]);ctx.lineTo(b1[0],b1[1]);ctx.closePath();ctx.fill();ctx.restore()}})}
    const jw=q=>hT(add([1.6,0,-2.2],rotY(sub(q,[1.6,0,-2.2]),.6*op))),jD=D(hT([6,0,-3]));
    // the mouth and the jaw: under the muzzle, drawn first so the muzzle covers their root
    H.add(hD-.5,()=>{if(op>.05){const m=[];for(const x0 of[1.5,5,9.4])m.push(hT([x0,0,-2.4]),jw([x0,0,-2.2]));ctx.fillStyle=WC.mouth;poly(chull(m.map(P)));ctx.fill();ink(1.4);ctx.stroke()}
      vol(V0,rings(WJW,jw,8),WC.lite,{kl:.08,kd:.2,lw:2.2,noRim:true})});
    H.add(hD,()=>{const pts=ellPts([0,0,0],WSK,null,5,14).concat(rings(WMZ,q=>q,9)).map(hT),hp=vol(V0,pts,WC.fur,{kl:.15,kd:.3,lw:2.4,rim:.3});
      ctx.save();poly(hp);ctx.clip();
      // the pale cheeks and underside of the muzzle (the game's light band under the snout)
      if(below(V0,XH,[[[0,0,0],WSK],[[6.2,0,-.9],[5.6,3.4,2.7]]],-1.7,bbox(hp))){ctx.fillStyle=softBox(bbox(hp),WC.lite,.06,.16);ctx.fill()}
      const EY=eyes(null,fc.h,5.6,{at:fc.at,dir:[.8,.54,.42],kind:'glow',col:WC.eye,rx:2.1,ry:1.45,fall:.6,blink:A.blink,squint:A.squint,shut:A.shut,shutCol:'#2a3a50',a:.55,b:.7,lr:.45});
      if(!A.shut)for(const e of EY)if(e.rx>.8)shine('159,230,255',e.q[0],e.q[1],3.6,.3*Math.min(1,e.v*2)*A.blink);
      ctx.restore();
      if(op>.15)for(const sd of[-1,1]){const a=P(hT([9.2,sd*1.2,-2.5])),b=P(hT([9.2,sd*1.2,-2.5-1.8*op]));ctx.fillStyle=WC.fang;ink(.8);tri(a[0],a[1],b[0],b[1],.8)}
      if(fwd>-.5){const q=P(hT([11.9,0,-.4]));ctx.save();ctx.globalAlpha=cl((fwd+.5)*3,0,1);ink(1);ctx.fillStyle=WC.nose;ctx.beginPath();ctx.ellipse(q[0],q[1],1.8,1.35,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.5)';ball([q[0]-.6,q[1]-.5],.45);ctx.fill();ctx.restore()}});
    run(H)});
  // the howl fogs the cold air: puffs out of the mouth, rising and spreading
  if(A.puff>=0&&!o.noFx)L.add(hD+20,()=>{for(let i=0;i<3;i++){const k=(A.puff*1.6+i/3)%1,q=P(hT([12+k*6,0,1+k*9]));ctx.fillStyle=`rgba(235,245,255,${.55*(1-k)*(A.puff<.85?1:(1-A.puff)/.15)})`;ball(q,1.2+k*3.2);ctx.fill()}});
  run(L);
  if(A.stars>0)stars(P(hT([0,0,9])),9,A.stars);
  ctx.restore()}
reg('wolf',{n:'Lupo delle nevi',g:4,an:['idle','walk','attack','howl','hit'],dur:{idle:2.6,walk:.5,attack:1,howl:.9,hit:.6},lab:{attack:'Scatto',howl:'Ululato'}},wolf);

// ------------------------------------------------------------------ SPIRITO DELLA NEVE (EDRAW.snowspirit): a floating drop of snow
const SC={top:'#ffffff',mid:'#d8f0ff',bot:'#a8d8f8',deep:'#86b6e0',arm:'#e8f6ff',eye:'#1e3a6a',flake:'#ffffff'};
// the drop: a body of revolution, [height above its bottom, radius], wide and round below, narrowing to a soft point on top
const SPR=[[0,0],[.7,4.8],[2.1,8.6],[4.4,11.2],[7.6,12.4],[10.8,12.1],[14.2,10.6],[17.4,8.4],[20,6.2],[22,4.2],[23.4,2.3],[24,0]],SZ=12.6,SFC=[0,0,SZ+11],SFR=[12.2,12.2,11.8];
// a snowflake drawn flat toward the camera: six arms with little forks, white with a thin blue edge (it turns in its own plane)
function flake(q,r,a,al){if(al<=0)return;ctx.save();ctx.globalAlpha*=al;ctx.lineCap='round';const arm=(w,col)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();
    for(let k=0;k<6;k++){const t=a+k*TAU/6,c=Math.cos(t),s=Math.sin(t),e=[q[0]+c*r,q[1]+s*r],m=[q[0]+c*r*.55,q[1]+s*r*.55];ctx.moveTo(q[0],q[1]);ctx.lineTo(e[0],e[1]);
      for(const sd of[-1,1]){const t2=t+sd*.75;ctx.moveTo(m[0],m[1]);ctx.lineTo(m[0]+Math.cos(t2)*r*.32,m[1]+Math.sin(t2)*r*.32)}}ctx.stroke()};
  arm(3.2,'rgba(30,58,106,.75)');arm(1.5,SC.flake);ctx.fillStyle='#fff';ball(q,1.2);ctx.fill();ctx.restore()}
function snowspirit(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU;
  // A: the body (B, lean, roll, s, yaw, k its size, al its alpha), the arms (aw wave, ar raise, af forward), the snowflake's turn (fa),
  // the specks' turn (sa) and how far out (sr), the face, the glow, the burst, the swirl of the teleport
  const A={B:[0,0,0],lean:0,roll:0,s:0,yaw:0,k:1,al:1,aw:0,ar:0,af:0,fa:p*TAU/3,sa:p*TAU/3,sr:16,blink:1,shut:0,squint:0,o:0,glow:.35,burst:-1,swirl:-1,stars:0};
  if(anim==='walk'){A.B=[0,0,2*Math.sin(ph*2)];A.lean=.14;A.af=-.6;A.aw=Math.sin(ph*2)*.25;A.ar=.1;A.yaw=.06*Math.sin(ph);A.roll=.05*Math.sin(ph);A.fa=p*TAU/3*2;A.sa=p*TAU/3*2}
  else if(anim==='attack'){// .0-.4 it gathers: squeezes down, the hands come together in front, it glows; .4-.52 it bursts: stretches up, flings
    // the hands wide, a ring of snow bursts out of it; .52-1 it settles with a wobble
    const v=keys([[0,[0,0,0,0]],[.4,[-.14,.9,-.7,1]],[.48,[.16,-.5,1.1,0]],[.62,[-.05,-.2,.6,0]],[.8,[.03,0,.1,0]],[1,[0,0,0,0]]],p);
    A.s=v[0];A.af=v[1];A.ar=v[2];A.glow=.35+.5*v[3]+(p>.4&&p<.6?.6*(1-(p-.4)/.2):0);A.squint=v[3];A.o=p>.42&&p<.7?1:0;A.B=[0,0,keys([[0,0],[.4,-1.5],[.48,2.5],[.7,0],[1,0]],p)];
    A.fa=keys([[0,0],[.4,TAU*.5],[.5,TAU*.9],[1,TAU]],p);A.sr=16-6*v[3];A.burst=p>=.44&&p<.9?(p-.44)/.46:-1}
  else if(anim==='tele'){// it spins and shrinks into a whirl of snowflakes and is gone (.0-.36); gone (.36-.62); the whirl comes back and it pops
    // out of it with a bounce (.62-1). The game moves it while it is gone
    const out=sstep(0,.36,p),inn=sstep(.62,.9,p),k=p<.5?1-out:inn;A.k=k<.01?0:lerp(.15,1,k)*(p>.62?1+.12*Math.sin(cl((p-.62)/.38,0,1)*Math.PI*2)*(1-cl((p-.85)/.15,0,1)):1);
    A.al=k;A.yaw=p<.5?out*out*TAU*1.5:-(1-inn)*(1-inn)*TAU*1.5;A.swirl=p;A.sr=16*(1-.5*(p<.5?out:1-inn));A.B=[0,0,p<.5?4*out:4*(1-inn)];A.glow=.35+.4*(p<.5?out:1-inn)}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.3*kb;A.B=[-3*kb,0,.8*kb];A.roll=.1*kb;A.s=-.1*kb;A.shut=p<.5?1:0;A.o=p<.5?1:0;A.stars=p<.75?1-p/.75:0;A.ar=.5*kb;A.af=-.4*kb}
  else{// floating: a slow bob, the hands wave, it looks round, the snowflake turns
    A.B=[0,0,2.6*Math.sin(ph)];A.aw=Math.sin(ph*2);A.yaw=look(p,.4);A.blink=blink(p,.48,.07);A.s=.03*Math.sin(ph*2+1)}
  const X=frame(Object.assign({},A,{s:A.s}),SFC[2]),K=A.k,T=q=>{const r=X.T(q);return K===1?r:add(mul(sub(r,X.T(SFC)),K),X.T(SFC))},dT=D(T(SFC));
  if(A.al>0)floor(V0,x,y,sc,A.B,9.5*Math.max(.3,K),3.6*Math.max(.3,K),.22*A.al,SZ-2+A.B[2]);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),ga=A.al;
  if(!LOWFX&&ga>0)L.add(dT-200,()=>{const q=P(T(SFC));shine('200,235,255',q[0],q[1],(22+8*A.glow)*Math.max(.4,K),A.glow*ga)});
  // the three specks of snow going round it
  if(!o.noFx)for(let i=0;i<3;i++){const an=A.sa+i*TAU/3,c=[Math.cos(an)*A.sr,Math.sin(an)*A.sr,SFC[2]+A.B[2]+Math.sin(an*2+i)*2];
    L.add(D(c),()=>{const q=P(c);ctx.fillStyle=`rgba(255,255,255,${.9*Math.max(ga,A.swirl>=0?.6:0)})`;ball(q,1.4);ctx.fill();ctx.strokeStyle=`rgba(30,58,106,${.35*ga})`;ctx.lineWidth=.6;ctx.stroke()})}
  if(K>0){
    // the little hands: round mittens on the sides, waving
    for(const sd of[-1,1]){const r0=[2.2,sd*10.4,SZ+11.4],r1=add(r0,[2.2*A.af+2.2,sd*(2.6-1.4*Math.max(0,A.af)+.6*A.ar),-2.2+4.2*A.ar+.9*A.aw]);
      L.add(D(T([0,sd*11,SZ+11.6]))-.5,()=>{ctx.save();ctx.globalAlpha*=ga;const a=T(r0),b=T(r1),A2=P(a),B2=P(b),fs=cl(Math.hypot(B2[0]-A2[0],B2[1]-A2[1])/(len(sub(b,a))||1),0,1);
        // seen end on, the mitten is a soft lump on the body: a thinner outline and a bluer shade, so it never reads as an open mouth
        C.caps(V0,a,2.8*K,b,2.9*K,cmix(SC.arm,'#b8dcf6',.6*(1-fs)),{kl:.25,kd:.32,lw:lerp(1,1.8,sstep(.3,.7,fs))*Math.max(.5,K),rim:.25});ctx.restore()})}
    // the body with the face
    L.add(dT,()=>{ctx.save();ctx.globalAlpha*=ga;const pts=chull(C.revo(SPR,1,{T},SZ,20).map(P)),bb=bbox(pts),w=bb[2]-bb[0],h=bb[3]-bb[1],cx=(bb[0]+bb[2])/2,cy=(bb[1]+bb[3])/2;
      const g=ctx.createRadialGradient(cx-w*.22,cy-h*.3,Math.max(w,h)*.05,cx-w*.02,cy+h*.05,Math.max(w,h)*.72);g.addColorStop(0,SC.top);g.addColorStop(.42,SC.mid);g.addColorStop(.78,SC.bot);g.addColorStop(1,SC.deep);
      ctx.lineJoin='round';C.smooth(pts);ctx.fillStyle=g;ctx.fill();ink(2.3*Math.max(.5,K));ctx.stroke();
      ctx.save();C.smooth(pts);ctx.clip();ctx.fillStyle='rgba(255,255,255,.6)';ctx.save();ctx.translate(cx-w*.17,cy-h*.12);ctx.rotate(.25);ell(0,0,w*.1,h*.17);ctx.fill();ctx.restore();
      if(K>.5){const fc=ellFace(V0,{T,Rd:X.Rd},SFC,SFR);
        eyes(null,fc.h,13*K,{at:fc.at,dir:[.86,.29,.42],kind:'dark',col:SC.eye,rx:1.9*K,ry:2.9*K,fall:.55,blink:A.blink,squint:A.squint,shut:A.shut,shutCol:SC.eye,a:.42,b:.58});
        if(A.o)mouth(null,fc.h,13*K,[.96,0,.06],{at:fc.at,kind:'o',w:2.2,h:1.6,dark:'#2a4a7a'});else mouth(null,fc.h,13*K,[.96,0,.06],{at:fc.at,kind:'smile',w:1.9*K,bow:2.2*K,col:SC.eye,lw:1.2})}
      ctx.restore();C.rimPoly(pts,.25);ctx.restore()});
    // the snowflake turning over its head
    L.add(dT+60,()=>{const q=P(T([0,0,SZ+28]));flake(q,5.6*K,A.fa,ga);if(!LOWFX)shine('220,240,255',q[0],q[1],8*K,.3*ga)})}
  // the burst of snow: a ring of puffs flying out round it (the snowballs themselves are the game's)
  if(A.burst>=0&&!o.noFx)L.add(dT+80,()=>{const k=A.burst,r=8+k*22;for(let i=0;i<10;i++){const a=i/10*TAU+.3,q=P([Math.cos(a)*r,Math.sin(a)*r,SFC[2]+A.B[2]-2+k*3]);
      ctx.fillStyle=`rgba(240,250,255,${.8*(1-k)})`;ball(q,1.6+k*2.6);ctx.fill()}if(!LOWFX){const q=P(T(SFC));shine('210,240,255',q[0],q[1],18+k*20,.5*(1-k))}});
  // the whirl of the teleport: snowflakes spiralling round where it stands
  if(A.swirl>=0&&!o.noFx){const p2=A.swirl,act=bump(cl(p2/.62,0,1))*.6+bump(cl((p2-.3)/.7,0,1));for(let i=0;i<9;i++){const an=p2*TAU*2+i*TAU/9,rr=6+10*Math.abs(Math.sin(i*1.7+p2*3)),zz=SZ+2+((i*7.3+p2*30)%24);
      const c=[Math.cos(an)*rr,Math.sin(an)*rr,zz];L.add(D(c),()=>{const q=P(c);flake(q,1.6+(i%3)*.5,an*2,act*.9)})}}
  run(L);
  if(A.stars>0)stars(P(X.T([0,0,SZ+29])),9,A.stars);
  ctx.restore()}
reg('snowspirit',{n:'Spirito della neve',g:4,an:['idle','walk','attack','tele','hit'],dur:{idle:2.4,walk:1.2,attack:1,tele:1.3,hit:.6},lab:{attack:'Raffica di neve',tele:'Teletrasporto'}},snowspirit);

// ------------------------------------------------------------------ SENTINELLA DI GHIACCIO (EDRAW.icesentinel): a faceted block of ice
const IC4={hi:'#eef8ff',light:'#d2ecfc',mid:'#9ccaec',dark:'#6a9ac8',deep:'#4f7fb0',fist:'#8ab8e0',foot:'#6a8aa8',eye:'#1e3a6a',rune:'#bff0ff',shard:'#6fb8e8'};
// the block: three hexagonal rings [height, radius] (a face toward the front), the bottom on the feet, wide shoulders, a flat top
const IRG=[[9,13],[25,15],[34,8.4]],IAX=.82,IAN=[0,1,2,3,4,5].map(k=>-Math.PI/6+k*Math.PI/3);
// the camera's own axes (right, up, toward us) and a warm light from the upper left: how bright a face with the normal n is (0..1)
function camAxes(V0){const v=nrm([V0.s,V0.c,.55]),r=[V0.c,-V0.s,0],u=nrm(cross(r,v));return{r,u,v}}
const LC=nrm([-.5,.62,.6]),lit=(ax,n)=>cl(.42+.6*(dot(n,ax.r)*LC[0]+dot(n,ax.u)*LC[1]+dot(n,ax.v)*LC[2]),0,1);
// the colour of an ice face from its brightness: deep, dark, mid, light, white
function iceCol(b){return b<.35?cmix(IC4.deep,IC4.dark,b/.35):b<.6?cmix(IC4.dark,IC4.mid,(b-.35)/.25):b<.85?cmix(IC4.mid,IC4.light,(b-.6)/.25):cmix(IC4.light,IC4.hi,(b-.85)/.15)}
// a faceted solid: faces = lists of 3D points (already in the camera's space), drawn where they face us, each with its own flat tone,
// thin bright edges (ice), and the thick outline round the whole. Returns the screen hull for clipping
function facets(V0,ax,faces,o){o=o||{};const{P,F}=V0,all=[];let ctr=[0,0,0];for(const f of faces)for(const q of f){ctr=add(ctr,q);all.push(P(q))}ctr=mul(ctr,1/all.length);
  const hp=chull(all);ctx.lineJoin='round';
  for(const f of faces){let n=nrm(cross(sub(f[1],f[0]),sub(f[2],f[0])));const m=f.reduce((a,q)=>add(a,q),[0,0,0]).map(v=>v/f.length);if(dot(n,sub(m,ctr))<0)n=mul(n,-1);if(F(n)<=0)continue;
    const pts=f.map(q=>P(q)),b=lit(ax,n);ctx.fillStyle=o.flash?cmix(iceCol(b),'#ffffff',o.flash):iceCol(b+(o.lift||0));poly(pts);ctx.fill();ctx.strokeStyle=`rgba(255,255,255,${.35+.3*b})`;ctx.lineWidth=.8;ctx.stroke()}
  poly(hp);ink(o.lw||2.5);ctx.stroke();return hp}
// a crystal shard: a four-sided bipyramid round the point c (half width w, half height h), turned by t round the vertical
function shardFaces(c,w,h,t){const eq=[0,1,2,3].map(k=>add(c,[Math.cos(t+k*Math.PI/2)*w,Math.sin(t+k*Math.PI/2)*w,0])),top=add(c,[0,0,h]),bot=add(c,[0,0,-h*.85]),F2=[];
  for(let k=0;k<4;k++){F2.push([eq[k],eq[(k+1)%4],top]);F2.push([eq[(k+1)%4],eq[k],bot])}return F2}
function icesentinel(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU,ax=camAxes(V0);
  // A: the body (B, lean, roll, s, yaw), the fists in the body's frame (hL, hR), the feet on the floor (fL, fR), the glow of the rune (gl),
  // the turn of the shards (rot, how far out sr, their height sz), the face, the flash of the cast, the stars
  const A={B:[0,0,0],lean:0,roll:0,s:0,yaw:0,hL:[2,-18.5,20],hR:[2,18.5,20],fL:[1,-7.2,0],fR:[1,7.2,0],gl:.3+.2*Math.sin(ph*2),rot:p*TAU/3,sr:24,sz:22,blink:1,shut:0,squint:0,flash:0,cast:-1,stars:0};
  if(anim==='walk'){// heavy steps: the block rocks from foot to foot, the fists swing a little
    const st=stepper(p,.55),a=st(0,3,2.4),b=st(.5,3,2.4),up=Math.abs(Math.sin(ph));A.fL=[1+a.x,-7.2,a.z];A.fR=[1+b.x,7.2,b.z];A.B=[0,-.5*Math.sin(ph),.7*up];A.roll=-.06*Math.sin(ph);
    A.lean=.04;A.hL=[2-2.6*Math.cos(ph),-18.5,20+.6*up];A.hR=[2+2.6*Math.cos(ph),18.5,20+.6*up]}
  else if(anim==='attack'){// the cast: .0-.55 the fists rise and the rune charges, the shards spin faster and draw in; .55-.62 it thrusts
    // its fists forward and the ice flies (a flash on the rune); .62-1 it settles
    const v=keys([[0,[0,0,0,0]],[.5,[1,0,-.06,1]],[.58,[0,1,.1,1]],[.7,[0,.5,.04,.4]],[1,[0,0,0,0]]],p);
    A.hL=[2+3*v[0]+9*v[1],-18.5+3*v[1],20+9*v[0]+1*v[1]];A.hR=[2+3*v[0]+9*v[1],18.5-3*v[1],20+9*v[0]+1*v[1]];A.lean=v[2];A.s=.04*v[0]-.05*v[1];A.B=[-1*v[0]+1.2*v[1],0,0];
    A.gl=.3+.7*v[3];A.squint=v[3];A.rot=keys([[0,0],[.55,TAU*.9],[1,TAU]],p)*1/3*3;A.sr=24-4*v[3];A.flash=p>.54&&p<.66?1-(p-.54)/.12:0;A.cast=p>.55&&p<.85?(p-.55)/.3:-1;A.rot=keys([[0,0],[.55,2.6],[1,TAU/3]],p)}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.2*kb;A.B=[-2.6*kb,0,.3*kb];A.roll=.07*kb;A.s=-.06*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;A.flash=p<.12?.7*(1-p/.12):0;
    A.hL=[2-2.5*kb,-18.5-1.5*kb,20+3*kb];A.hR=[2-2.5*kb,18.5+1.5*kb,20+3*kb];A.sr=24+3*kb;A.rot=p*TAU/3+.4*kb}
  else{// standing guard: it breathes, the rune pulses, the fists float, it turns its gaze slowly
    A.s=.015*Math.sin(ph);A.yaw=look(p,.22);A.blink=blink(p,.66,.07);A.hL=[2,-18.5,20+.8*Math.sin(ph+.5)];A.hR=[2,18.5,20+.8*Math.sin(ph+1.6)]}
  const X=frame(A,0),dT=D(X.T([0,0,22]));
  floor(V0,x,y,sc,A.B,16,6,.32);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  // the glow of the rune behind the ice (it shows through), stronger when it casts
  if(!LOWFX)L.add(dT-200,()=>{const q=P(X.T([8,0,22]));shine('120,210,255',q[0],q[1],16+12*A.gl,.25+.35*A.gl)});
  // the feet: two blue stumps under the block, the far one darker
  for(const[sd,f] of[[-1,A.fL],[1,A.fR]]){const far=F(0,sd,0)<0,c=add(f,[A.B[0],A.B[1],4]);L.add(dT-100+D(c)*.01,()=>ovol(V0,IDF,c,[5.6,4.6,3.8],far?cmix(IC4.foot,IC4.deep,.4):IC4.foot,{kl:.2,kd:.3,lw:2.3,rim:.3}))}
  // the block of ice: its faces, the rune glowing on the front, the little eyes on the upper front face
  L.add(dT,()=>{const R=IRG.map(([z,r])=>IAN.map(a=>X.T([Math.cos(a)*r*IAX,Math.sin(a)*r,z]))),faces=[];
    for(let k=0;k<6;k++){const k1=(k+1)%6;faces.push([R[0][k],R[0][k1],R[1][k1],R[1][k]]);faces.push([R[1][k],R[1][k1],R[2][k1],R[2][k]])}faces.push(R[2].slice());
    const hp=facets(V0,ax,faces,{flash:A.flash});ctx.save();poly(hp);ctx.clip();
    // the front faces: the rune (a diamond) on the lower one, the eyes on the upper one; both only where that face turns toward us
    const nF=X.Rd(nrm([16,0,-1.4])),vF=F(nF);if(vF>0){const fk=cl(vF*3,0,1),c=X.T([10.4,0,20.5]),u=X.Rd([0,1,0]),w=X.Rd(nrm([.09,0,1])),Q=(a,b)=>P(add(c,add(mul(u,a),mul(w,b))));
      if(!LOWFX){const q=Q(0,0),g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],9+5*A.gl);g.addColorStop(0,`rgba(190,245,255,${(.55+.4*A.gl)*fk})`);g.addColorStop(1,'rgba(190,245,255,0)');ctx.fillStyle=g;ctx.fillRect(q[0]-15,q[1]-15,30,30)}
      ctx.save();ctx.globalAlpha*=fk;const d=[Q(0,5.2),Q(4.2,0),Q(0,-5.2),Q(-4.2,0)];ctx.fillStyle=cmix(IC4.rune,'#ffffff',A.gl*.6);poly(d);ctx.fill();ink(1.6);ctx.stroke();
      ctx.fillStyle=`rgba(255,255,255,${.5+.4*A.gl})`;poly([Q(0,3.4),Q(1.4,.6),Q(0,-.4),Q(-1.2,.8)]);ctx.fill();ctx.restore()}
    const nE=X.Rd(nrm([9,0,5.6])),vE=F(nE);if(vE>.05){const ek=cl((vE-.05)*4,0,1),c=X.T([8.5,0,29.2]),u=X.Rd([0,1,0]),w=X.Rd(nrm([-.53,0,.85])),Q=(a,b)=>P(add(c,add(mul(u,a),mul(w,b))));
      ctx.save();ctx.globalAlpha*=ek;for(const sd of[-1,1]){const q=Q(sd*3.2,0),e=Q(sd*3.2+1.9,0),rx=Math.max(.4,Math.hypot(e[0]-q[0],e[1]-q[1])),sq=A.blink*(1-.4*A.squint);
        if(A.shut){ctx.strokeStyle=IC4.eye;ctx.lineWidth=1.2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q[0]-rx,q[1]-1);ctx.lineTo(q[0]+rx*.8,q[1]);ctx.lineTo(q[0]-rx,q[1]+1);ctx.stroke();continue}
        ctx.fillStyle=IC4.eye;ctx.beginPath();ctx.ellipse(q[0],q[1],rx,1.45*Math.max(.15,sq),0,0,TAU);ctx.fill();if(sq>.5&&rx>.9){ctx.fillStyle='#ffffff';ball([q[0]-rx*.35,q[1]-.5],.45);ctx.fill()}}ctx.restore()}
    ctx.restore()});
  // the fists: blue lumps of ice floating at the sides; their place in the draw order is where they are at rest
  for(const[sd,h] of[[-1,A.hL],[1,A.hR]]){const r0=X.T([2,sd*18.5,20]);L.add(D(r0)+.02,()=>{const c=X.T(h),fs=[];const E=ovol(V0,IDF,c,[4.6,4.6,6.2],IC4.fist,{kl:.3,kd:.32,lw:2.3,rim:.35});
    ctx.save();E.path(1);ctx.clip();ctx.fillStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.ellipse(E.c[0]-E.rx*.3,E.c[1]-E.ry*.35,E.rx*.28,E.ry*.18,-.5,0,TAU);ctx.fill();
      if(A.gl>.6){ctx.fillStyle=`rgba(200,245,255,${(A.gl-.6)*1.2})`;E.path();ctx.fill()}ctx.restore()})}
  // the shards going round it (o.shards: [{a: angle round it on the floor, as e.rot + s.a in the game, hp: 0 = broken, re, hit}]),
  // each in the draw order of where it is now
  const SH=o.shards||[0,1,2].map(i=>({a:A.rot+i*TAU/3+face,hp:2,re:0,hit:0}));
  for(const s of SH){if(s.hp<=0&&(s.re||0)>4.5)continue;const an=s.a-face,grow=s.hp>0?1:Math.max(.15,1-(s.re||0)/5)*.5,c=add([Math.cos(an)*A.sr,Math.sin(an)*A.sr,A.sz+1.2*Math.sin(ph*2+an)],[A.B[0],A.B[1],0]);
    L.add(D(c),()=>{ctx.save();if(s.hp<=0)ctx.globalAlpha*=.5;const fa=shardFaces(c,5*grow,9*grow,an+ph);facets(V0,ax,fa,{lw:1.6,flash:s.hit>0?1:0,lift:.08});ctx.restore()})}
  // the cast: a flash on the rune and a ring of frost going out from the fists (the ice bolts themselves are the game's)
  if(A.cast>=0&&!o.noFx)L.add(dT+60,()=>{const k=A.cast,c=X.T([14+k*10,0,22]),q=P(c);shine('180,235,255',q[0],q[1],10+k*16,.7*(1-k));
    for(let i=0;i<8;i++){const a=i/8*TAU,e=P(add(c,mul(X.Rd([0,Math.cos(a),Math.sin(a)]),3+k*9)));ctx.fillStyle=`rgba(235,250,255,${.9*(1-k)})`;ball(e,1.3*(1-k)+.4);ctx.fill()}});
  run(L);
  if(A.stars>0)stars(P(X.T([0,0,42])),11,A.stars);
  ctx.restore()}
reg('icesentinel',{n:'Sentinella di ghiaccio',g:4,dur:{idle:2.4,walk:1.26,attack:1.1,hit:.6},lab:{attack:'Lancio di ghiaccio'}},icesentinel);
})();
