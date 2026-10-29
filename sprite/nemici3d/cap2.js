// Nemici del secondo capitolo (Cenere e Forgia) rifatti in 3D come l'Arciere: stesse forme e colori di oggi nel gioco (drawImp e
// drawObsidian), dipinti con la cassetta C3 (base3d.js). Ogni mossa dipende solo da p (0..1).
// Diavoletto: una palla rossa che è testa e corpo insieme, corna d'oro, occhi gialli, un sorriso, ali da pipistrello e la coda a
// ricciolo; vola sbattendo le ali e sputa palle di fuoco (attacco: si tira indietro e gonfia il fuoco in bocca, poi lo sputa).
// Golem d'ossidiana: un masso tondo di vetro nero lucido, crepe di lava che pulsano, occhi arancioni accesi, due grossi pugni tondi
// che fluttuano ai lati e due piedi tozzi; cammina pesante e carica a testa bassa (attacco: si carica, scatta in avanti e pesta).
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,tri,hull,rim,run,dk,lt,rgba,poly,line,bbox,softBox,softBall,
  look,blink,keys,bump,sstep,hitK,frame,vol,ellPts,ellAt,ellN,sball,caps,chain,disc3,spot,eyes,mouth,ellFace,floor,stars,orb,parts,reg,shine,rotX,rotZ,wa}=C;

// an ellipsoid (centre C, radii Rd along the body's axes, through the frame X) seen by the camera is exactly an ellipse on the screen:
// the image of the unit ball under the linear map L (its columns are the projected radii), whose outline comes from L·Lᵀ. So round
// bodies get a perfectly smooth outline, whatever their squash, lean or turn. Returns {c, rx, ry, rot, path(), bb}
function oval(V0,X,C,Rd){const o=V0.P(X.T(C)),Lc=[0,1,2].map(i=>{const e=[0,0,0];e[i]=Rd[i];const q=V0.P(X.T(add(C,e)));return[q[0]-o[0],q[1]-o[1]]});
  let a=0,b=0,d=0;for(const l of Lc){a+=l[0]*l[0];b+=l[0]*l[1];d+=l[1]*l[1]}const m=(a+d)/2,r=Math.sqrt(((a-d)/2)**2+b*b),rot=.5*Math.atan2(2*b,a-d),rx=Math.sqrt(m+r),ry=Math.sqrt(Math.max(.01,m-r));
  const ex=Math.sqrt(rx*rx*Math.cos(rot)**2+ry*ry*Math.sin(rot)**2),ey=Math.sqrt(rx*rx*Math.sin(rot)**2+ry*ry*Math.cos(rot)**2);
  return{c:o,rx,ry,rot,bb:[o[0]-ex,o[1]-ey,o[0]+ex,o[1]+ey],path:(k)=>{k=k||0;ctx.beginPath();ctx.ellipse(o[0],o[1],Math.max(.2,rx-k),Math.max(.2,ry-k),rot,0,TAU)}}}
// that ellipsoid painted like C3.vol: three soft tones, the thick outline, the warm rim inside it. Returns the oval (o.path() to clip)
function ovol(V0,X,C,Rd,col,o){o=o||{};const E=oval(V0,X,C,Rd);E.path();ctx.fillStyle=o.fill||softBox(E.bb,col,o.kl,o.kd);ctx.fill();if(!o.noInk){ink(o.lw||2.5);ctx.stroke()}
  if(!o.noRim){const[x0,y0,x1,y1]=E.bb,cx=(x0+x1)/2,cy=(y0+y1)/2,R=Math.max(x1-x0,y1-y0)/2,g=ctx.createLinearGradient(cx-R*.8,cy-R*.8,cx+R*.15,cy+R*.15);
    g.addColorStop(0,wa(o.rim||.3));g.addColorStop(1,wa(0));ctx.save();ctx.strokeStyle=g;ctx.lineWidth=1.3;E.path(1.9);ctx.stroke();ctx.restore()}return E}

// ------------------------------------------------------------------ DIAVOLETTO (drawImp): a red ball r 10 flying 24 above the floor
const IC={body:'#e5484d',wing:'#a8342a',wingB:'#8a2a20',vein:'#6e1c16',horn:'#f2d36b',eye:'#ffd86b',tail:'#c43a2e',mouth:'#5a1414',fire:'#ffb020'};
const IZ=24,IR=10;
// a wing: the arm runs from the shoulder up, out and back to the tip, in 3D (it beats about the body's long axis); the membrane hangs
// from the arm across the line of sight (as the bat of sprite/nemici, but turned about the arm to face us), on its lower outer side, so
// it never shows as a thin blade. Its shape is the game's: in (a along the arm, m out from it) the root, the bow of the arm, the tip,
// the two scallops of the trailing edge and their points
const IW={lead:[8.8,-1.6],tip:[15.6,0],c1:[9.4,3.7],s1:[7.4,8.1],c2:[5.4,3.5],s2:[-1,6.8]},IWR=sd=>[-2.4,sd*5.4,IZ+2.6];
// (raised in a V, well above the camera's 29 degrees, so the arm never points straight at the camera while it beats)
const impArm=(sd,sw,fl)=>rotX([-Math.sin(sw)*.64,sd*Math.cos(sw)*.64,.77],sd*fl);
function impWing(V0,X,A,sd){const{P,F,s,c}=V0,R0=X.T(IWR(sd)),Ua=nrm(X.Rd(impArm(sd,A.sw,A.fl))),v=nrm([s,c,.55]);
  // the side of the arm the membrane hangs on: down and out from the arm, in the body's own frame; turned about the arm to face us (Wc)
  // on that side, and back to the body's direction where facing us is ambiguous, so it never flips over (it used to, seen from the side)
  const Dn=X.Rd([0,sd*.6,-1]),Dp=nrm(sub(Dn,mul(Ua,dot(Dn,Ua))));let Wc=cross(v,Ua);const lc=len(Wc);Wc=lc<1e-3?Dp:mul(Wc,1/lc);
  const sg=dot(Wc,Dp),wk=sstep(0,.3,Math.abs(sg))*sstep(.05,.2,lc),Wa=nrm(add(mul(Dp,1-wk),mul(Wc,(sg<0?-1:1)*wk)));
  const at=q=>P(add(R0,add(mul(Ua,q[0]*1.08),mul(Wa,q[1]*1.08)))),r=at([0,0]),t=at(IW.tip),s1=at(IW.s1),s2=at(IW.s2),c1=at(IW.c1),c2=at(IW.c2),le=at(IW.lead);
  // the colour of the side we see (darker from behind, as in the game) and a little darker for the far wing
  const col=C.cmix(C.cmix(IC.wing,IC.wingB,sstep(.15,-.35,F(X.Rd([1,0,0])))),'#3a0e0a',.18*sstep(0,-.16,F(X.Rd([0,sd,0]))));
  const path=()=>{ctx.beginPath();ctx.moveTo(r[0],r[1]);ctx.quadraticCurveTo(le[0],le[1],t[0],t[1]);ctx.quadraticCurveTo(c1[0],c1[1],s1[0],s1[1]);ctx.quadraticCurveTo(c2[0],c2[1],s2[0],s2[1]);ctx.closePath()};
  ctx.lineJoin='round';path();ctx.fillStyle=softBox(bbox([r,t,s1,s2]),col,.16,.26);ctx.fill();ink(2.2);ctx.stroke();
  ctx.save();path();ctx.clip();
  // the fingers of the membrane, and a warm light along the arm on the lit side
  ctx.strokeStyle=rgba(IC.vein,.5);ctx.lineWidth=1;ctx.lineCap='round';for(const q of[s1,s2]){seg(r,q);ctx.stroke()}
  if(!LOWFX){ctx.strokeStyle=rgba(lt(col,.3),.8);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(r[0],r[1]+1);ctx.quadraticCurveTo(le[0],le[1]+1.1,t[0],t[1]+1.1);ctx.stroke()}
  ctx.restore()}
// a horn: a cone from a ring on the head to its point
function impHorn(V0,X,Cb,sd){const b=nrm([.2,sd*.55,.8]),ax=nrm([.04,sd*.36,1]),c=add(Cb,mul(b,IR*.92)),tip=add(c,mul(ax,9.2)),u=nrm(cross(ax,[1,0,0])),v=cross(ax,u),pts=[tip];
  for(let i=0;i<10;i++){const a=i/10*TAU;pts.push(add(c,add(mul(u,Math.cos(a)*2.2),mul(v,Math.sin(a)*2.2))))}
  vol(V0,pts.map(X.T),IC.horn,{kl:.3,kd:.32,lw:1.8,rim:.4})}
function imp(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU;
  // A: the body (B, lean, roll, s, yaw), the wings (fl flap, up > 0; sw sweep back), the tail sway (tw) and curl (tc), the face, the fire
  const A={B:[0,0,0],lean:0,roll:0,s:0,big:0,yaw:0,fl:0,sw:.42,tw:0,tc:0,blink:1,shut:0,squint:0,open:0,fire:0,burst:-1,stars:0};
  if(anim==='walk'){// flying on: leaning into it, quicker beats, the tail streaming behind
    A.fl=.1+.34*Math.sin(ph*3);A.B=[0,0,1.1*Math.sin(ph*3-1)];A.lean=.24;A.sw=.6;A.tw=Math.sin(ph)*.8;A.tc=.6;A.roll=.06*Math.sin(ph);A.s=.03*Math.sin(ph*3+.6);A.yaw=.05*Math.sin(ph)}
  else if(anim==='attack'){// .0-.36 it rears back and swells, the fire glowing through it, .36-.46 it lunges and spits, then it settles
    const v=keys([[0,[0,0,0,0,0]],[.36,[-.32,-2.4,2,.05,.07]],[.45,[.3,3,-1,-.12,-.02]],[.6,[.1,1,-.2,.03,0]],[.78,[-.05,-.3,.3,-.02,0]],[1,[0,0,0,0,0]]],p);
    A.lean=v[0];A.B=[v[1],0,v[2]];A.s=v[3];A.big=v[4];A.fire=sstep(.05,.34,p)*(1-sstep(.4,.46,p));A.squint=ez(cl(p/.3,0,1))*(1-sstep(.38,.46,p));
    A.open=p<.37?0:p<.45?ez((p-.37)/.08):p<.62?1-ez((p-.45)/.17):0;A.burst=p>=.42&&p<.82?(p-.42)/.4:-1;
    const amp=keys([[0,.26],[.25,.12],[.36,.06],[.45,.36],[.7,.3],[1,.26]],p);A.fl=keys([[0,.12],[.36,.5],[.45,-.14],[.62,.1],[1,.12]],p)+amp*Math.sin(ph*4);
    A.sw=.42+.2*bump(cl((p-.25)/.3,0,1));A.tw=.4*Math.sin(ph*2);A.tc=-.6*v[0]}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.34*kb;A.B=[-3*kb,0,1.2*kb];A.roll=.12*kb;A.s=-.08*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;
    A.fl=.12+.3*Math.sin(ph*3)*(1-.5*kb);A.tw=.8*kb*Math.sin(ph*4);A.tc=.5*kb}
  else if(anim==='prep'){// gets ready to spit (held): reared back and swollen, the fire glowing through it, eyes narrowed, the wings beating hard, a shiver
    const b=Math.sin(ph*2);A.lean=-.3;A.B=[-2.2+.25*Math.sin(ph*5),0,1.8+.4*b];A.s=.05+.015*b;A.big=.065;A.fire=.82+.15*(.5+.5*b);A.squint=.9;
    A.fl=.45+.3*Math.sin(ph*4);A.sw=.55;A.tw=.4*Math.sin(ph*2);A.tc=.18}
  else if(anim==='die'){// .0-.15 the blow, .15-.6 it tumbles down backwards, the wings flailing, .6 it lands and bounces, then lies with its wings limp, dizzy
    const k1=ez(cl(p/.15,0,1)),k2=cl((p-.15)/.45,0,1),fall=k2*k2,land=p>.6?(p-.6)/.4:0;
    A.B=[-3*k1-3*k2,0,1.2*k1*(1-fall)+(-IZ+IR*.95)*fall+(land>0?2.2*Math.sin(land*Math.PI*2)*Math.exp(-land*5):0)];A.lean=-.34*k1-1.15*ez(k2);A.roll=.3*k2;A.s=-.08*k1;
    A.shut=1;A.fl=p<.6?.12+.5*Math.sin(ph*5)*(1-k2):-.32;A.tw=.3*(1-land);A.tc=.4;A.stars=land>0?.85-.3*land:0}
  else{// hovering: quick beats, a slow bob, it looks round slowly, the tail swings
    A.fl=.12+.26*Math.sin(ph*6);A.B=[0,0,1.5*Math.sin(ph*2)+.35*Math.sin(ph*6-1.2)];A.yaw=look(p,.42);A.tw=Math.sin(ph*2+.6);A.s=.025*Math.sin(ph*6+.4);
    A.blink=blink(p,.7,.07);A.roll=.04*Math.sin(ph*2)}
  // the face and the horns turn a little toward the camera from the side (as the hero's head), so the face stays in the ball
  const dv=Math.atan2(Math.sin(Math.PI/2-face),Math.cos(Math.PI/2-face)),cheat=.38*Math.sin(dv)*cl((Math.PI-Math.abs(dv))/(Math.PI/2),0,1);
  const X=frame(A,IZ),Xh=frame(Object.assign({},A,{yaw:A.yaw+cheat}),IZ),Cb=[0,0,IZ];
  floor(V0,x,y,sc,A.B,9.5,3.8,.24,A.B[2]+6);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),dT=D(X.T(Cb)),hq=()=>P(X.T(Cb));
  // the warm glow of a fire creature, behind everything
  if(!LOWFX)L.add(dT-200,()=>{const q=hq();shine('255,120,60',q[0],q[1],19+4*A.fire,.24+.2*A.fire)});
  // the wings: from the shoulder blades, out and back; their place in the draw order is where they are at rest
  for(const sd of[-1,1]){const rc=add(IWR(sd),mul(impArm(sd,.42,0),7));L.add(D(X.T(rc)),()=>impWing(V0,X,A,sd))}
  // the curly tail, from under the back down to a little hook
  {const T=[[-3.4,0,IZ-6.8],[-6.6,0,IZ-11],[-8.2,0,IZ-15.4],[-7.2,0,IZ-18.6],[-4.8,0,IZ-19.2],[-3.6,0,IZ-17.4]],w=[0,.5,1.3,2.1,2.6,2.8];
    const cy=[0,0,.7,2.2,3.8,4.4],pts=T.map((q,i)=>X.T(add(q,[-A.tc*i*.5,A.tw*w[i]+cy[i],A.tc*i*.35])));L.add(D(X.T(T[2])),()=>chain(V0,pts,[1.9,1.75,1.6,1.5,1.4,1.3],IC.tail,{lw:1.6,kl:.18,kd:.3}))}
  // the body: the red ball with the face (a little flatter than a ball, so the camera sees it round as the game draws it); before the
  // spit the fire glows through it from the mouth
  const Rb=IR*(1+A.big),RB=[Rb,Rb,Rb*.877],MD=nrm([.95,0,-.22]);
  L.add(dT,()=>{const E=ovol(V0,X,Cb,RB,IC.body,{kl:.17,kd:.34});
    ctx.save();E.path();ctx.clip();const fc=ellFace(V0,Xh,Cb,RB),m=fc.at(MD),fk=A.fire*(.45+.55*cl(m.v*2,0,1));
    if(fk>0){const g=ctx.createRadialGradient(m.q[0],m.q[1],1,m.q[0],m.q[1],Rb*1.3);g.addColorStop(0,`rgba(255,214,90,${.75*fk})`);g.addColorStop(.45,`rgba(255,150,60,${.35*fk})`);g.addColorStop(1,'rgba(255,120,60,0)');
      ctx.fillStyle=g;ctx.fillRect(m.q[0]-Rb*1.4,m.q[1]-Rb*1.4,Rb*2.8,Rb*2.8)}
    eyes(null,fc.h,Rb,{at:fc.at,dir:[.88,.34,.33],kind:'glow',col:IC.eye,rx:2.15,ry:2.35,fall:.5,blink:A.blink,squint:A.squint,shut:A.shut,shutCol:'#4a1010',a:.42,b:.6,lr:.55});
    if(A.open>.05)mouth(null,fc.h,Rb,MD,{at:fc.at,kind:'open',open:A.open,w:2.8,h:2.3,dark:IC.mouth,tongue:'#ffb84a'});
    else mouth(null,fc.h,Rb,MD,{at:fc.at,kind:'smile',w:2.7-A.fire*.9,bow:3.2-A.fire*1.8,lw:1.4});
    ctx.restore()});
  // the horns on top: in front of the ball wherever their root faces us (decided at rest, so they never pop as the head looks round)
  for(const sd of[-1,1]){const b=add(Cb,mul(nrm([.2,sd*.55,.8]),IR));L.add(dT+D(sub(b,Cb))+.01,()=>impHorn(V0,Xh,Cb,sd))}
  // the spit: a flash of flame out of the mouth, then a puff of smoke (the fireball itself is the game's); before it, smoke from the mouth
  if(!o.noFx&&(A.burst>=0||A.fire>.5)){const m0=Xh.T(add(Cb,mul(MD,Rb))),fw=Xh.Rd(nrm([1,0,-.15]));
    L.add(D(add(m0,mul(fw,3))),()=>{if(A.fire>.5&&A.burst<0){const k=(A.fire-.5)*2;for(let i=0;i<2;i++){const t=(p*7+i*.5)%1,q=P(add(m0,add(mul(fw,1+t*2),[0,(i?1:-1)*(1.5+t*2),1+t*6])));ctx.fillStyle=`rgba(110,96,92,${.4*k*(1-t)})`;ball(q,.8+t*2);ctx.fill()}}
      if(A.burst<0)return;const k=A.burst;
      if(k<.4){const kk=k/.4,q=P(add(m0,mul(fw,2.5+kk*7)));shine('255,150,40',q[0],q[1],10+kk*10,.65*(1-kk));
        ctx.fillStyle=`rgba(255,${120+kk*60|0},40,${.9*(1-kk)})`;for(let i=0;i<6;i++){const a=i/6*TAU+.5,e=P(add(m0,add(mul(fw,3+kk*5),mul(X.Rd([0,Math.cos(a),Math.sin(a)]),2+kk*6))));ball(e,1.6*(1-kk)+.4);ctx.fill()}
        ctx.save();ctx.globalAlpha=1-kk*kk;orb(q,5.2*(1-kk*.4),'#ffcf4a',{glow:'255,140,40',halo:2.4,lw:1.4});ctx.restore()}
      if(k>.25){const kk=(k-.25)/.75;for(let i=0;i<3;i++){const q=P(add(m0,add(mul(fw,2+kk*5+i*1.2),[0,(i-1)*1.6,1.5+kk*8+i])));ctx.fillStyle=`rgba(110,96,92,${.38*(1-kk)*Math.min(1,kk*6)})`;ball(q,1.4+kk*3.4);ctx.fill()}}})}
  run(L);
  if(A.stars>0)stars(P(X.T([0,0,IZ+IR+8])),9,A.stars);
  ctx.restore()}
reg('imp',{n:'Diavoletto',g:2,an:['idle','walk','prep','attack','hit','die'],dur:{idle:2.4,walk:.8,prep:.8,attack:1.2,hit:.6,die:.9}},imp);

// ------------------------------------------------------------------ GOLEM D'OSSIDIANA (drawObsidian): a round block of black glass
const OC={hi:'#4f4a5c',mid:'#2a2530',lo:'#16131a',fist:'#2c2733',foot:'#24202a',foot2:'#1b1820',lava:'#ff7a2e',core:'#ffd27a',eye:'#ffb020',eyeL:'#fff1b0'};
const OZ=20,OR=[14.5,16,11.5],OFR=7,OFY=16.5;
// the lava cracks on the body: polylines of directions on the ellipsoid (two in front as in the game, two on the back, one on top)
const OCR=[[[.62,.46,.64],[.96,.2,.12],[.8,.38,-.46]],[[.42,-.52,.74],[.68,-.68,.26]],[[-.58,.3,.75],[-.93,.06,.36],[-.84,-.36,-.12]],[[-.42,-.68,.58],[-.72,-.62,.08]],[[.05,.42,.9],[-.32,.1,.94]]];
// the soft three tones of black glass for an oval (as the game's gradient: light upper left, dark lower right)
function glass(E,a,b,c){const[x0,y0,x1,y1]=E.bb,w=x1-x0,h=y1-y0,cx=(x0+x1)/2,cy=(y0+y1)/2,g=ctx.createRadialGradient(cx-w*.26,cy-h*.3,Math.max(w,h)*.04,cx-w*.04,cy+h*.02,Math.max(w,h)*.74);
  g.addColorStop(0,a);g.addColorStop(.5,b);g.addColorStop(1,c);return g}
// a glassy shine on the upper left of an oval: a soft wide one and a small sharp one
function gloss(E,k){const[x0,y0,x1,y1]=E.bb,w=x1-x0,h=y1-y0;ctx.save();ctx.translate(x0+w*.31,y0+h*.27);ctx.rotate(-.5);ctx.fillStyle=`rgba(255,255,255,${.2*k})`;ell(0,0,w*.18,h*.09);ctx.fill();
  ctx.fillStyle=`rgba(255,255,255,${.5*k})`;ell(-w*.02,-h*.01,w*.07,h*.035);ctx.fill();ctx.restore()}
// a crack: a dark groove, the glowing lava in it and a hot core, only where the surface faces us; glow 0..1 makes it burn brighter
function crack(V0,X,C,Rd,pts,glow){const{P,F}=V0,N=[];for(let i=0;i<pts.length-1;i++)for(let j=0;j<4;j++)N.push(nrm(lerp3(pts[i],pts[i+1],j/4)));N.push(nrm(pts[pts.length-1]));
  const runs=[];let cur=[];for(const m of N){const v=F(X.Rd(ellN(Rd,null,m)));if(v>.05)cur.push(P(X.T(ellAt(C,Rd,null,m))));else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
  ctx.lineCap='round';ctx.lineJoin='round';for(const r of runs){if(r.length<2)continue;
    if(!LOWFX&&glow>.55){const q=r[r.length>>1];shine('255,120,40',q[0],q[1],4+glow*4,.5*(glow-.55))}
    ctx.strokeStyle='rgba(12,6,8,.7)';ctx.lineWidth=3.4;line(r);ctx.stroke();ctx.strokeStyle=OC.lava;ctx.lineWidth=1.9;ctx.stroke();ctx.strokeStyle=rgba(OC.core,.35+.55*glow);ctx.lineWidth=.8;ctx.stroke()}}
function obsidian(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU;
  // A: the body (B, lean, roll, s, yaw), the fists in the body's frame (hL, hR), the feet on the floor (fL, fR), the face, the heat of the lava
  const A={B:[0,0,0],lean:0,roll:0,s:0,yaw:0,hL:[4,-OFY,17.5],hR:[4,OFY,17.5],fL:[1,-8,0],fR:[1,8,0],blink:1,shut:0,squint:0,heat:.5,dust:-1,stars:0,flare:0,shard:-1};
  if(anim==='walk'){// heavy steps: the body rocks from foot to foot, the fists swing against the feet
    const st=C.stepper(p,.55),a=st(0,3.2,2.6),b=st(.5,3.2,2.6),up=Math.abs(Math.sin(ph));A.fL=[1+a.x,-8,a.z];A.fR=[1+b.x,8,b.z];
    A.B=[0,-.7*Math.sin(ph),.9*up];A.roll=-.07*Math.sin(ph);A.lean=.06;A.s=-.03+.04*up;A.hL=[4-3.4*Math.cos(ph),-OFY,17.5+.8*up];A.hR=[4+3.4*Math.cos(ph),OFY,17.5+.8*up];A.heat=.5+.15*up}
  else if(anim==='attack'){// .0-.45 it crouches and heats up, scraping the floor with a foot like a bull, the fists drawn back; .45-.78
    // the charge, head down, fists in front, legs pounding; .78-.88 it stops with a stamp (dust and sparks); .88-1 it straightens up
    const v=keys([[0,[0,0,0,0]],[.16,[-.14,-1.2,-.08,.2]],[.45,[.04,-1.8,-.12,.9]],[.5,[.24,2,-.04,1]],[.78,[.26,3,-.02,1]],[.84,[.08,1.2,-.2,.6]],[.92,[-.04,.3,.05,.2]],[1,[0,0,0,0]]],p);
    A.lean=v[0];A.B=[v[1],0,0];A.s=v[2];A.heat=.5+.5*v[3];A.flare=v[3];A.squint=sstep(.1,.4,p)*(1-sstep(.84,.95,p));
    const ch=p>.47&&p<.8?(p-.47)/.33:-1;if(ch>=0){const st=C.stepper(ch*2%1,.5),a=st(0,3.4,3),b=st(.5,3.4,3);A.fL=[1+a.x+v[1],-8,a.z];A.fR=[1+b.x+v[1],8,b.z];A.B[2]=1.2*Math.abs(Math.sin(ch*2*TAU))}
    else if(p<.45){const sk=sstep(.08,.16,p)*(1-sstep(.38,.45,p)),q=(p-.08)/.3*2%1;A.fL=[1,-8,0];A.fR=[1+(-2.4+2.8*Math.cos(q*TAU))*sk,8,Math.max(0,Math.sin(q*TAU))*1.6*sk]}
    else{A.fL=[1+(p>.8?v[1]:0),-8,0];A.fR=[1+(p>.8?v[1]:0),8,0]}
    const fk=keys([[0,[4,17.5,0]],[.4,[-4,18.5,1]],[.47,[-4,18.5,1]],[.53,[14,18,5]],[.78,[14,18,5]],[.86,[7,16.5,1]],[1,[4,17.5,0]]],p);A.hL=[fk[0],-OFY+fk[2],fk[1]];A.hR=[fk[0],OFY-fk[2],fk[1]];
    A.dust=p>.8&&p<1?(p-.8)/.2:-1}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.24*kb;A.B=[-2.4*kb,0,.3*kb];A.s=-.07*kb;A.roll=.06*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;
    A.hL=[4-3*kb,-OFY-1.5*kb,17.5+3*kb];A.hR=[4-3*kb,OFY+1.5*kb,17.5+3*kb];A.heat=.5+.4*kb}
  else if(anim==='prep'){// gets ready to charge (held): crouched, heating up, the fists drawn back, scraping the floor with a foot like a bull
    const b=Math.sin(ph*2),q=(p*2)%1;A.lean=-.06;A.B=[-1.5,0,0];A.s=-.1;A.heat=.78+.15*(.5+.5*b);A.flare=.62+.2*(.5+.5*b);A.squint=.9;
    A.fL=[1,-8,0];A.fR=[1-2.4+2.8*Math.cos(q*TAU),8,Math.max(0,Math.sin(q*TAU))*1.6];A.hL=[-4,-OFY+1,18.5+.4*b];A.hR=[-4,OFY-1,18.5+.4*b]}
  else if(anim==='die'){// cracks up: .0-.2 the blow, the cracks blazing, .2-.62 the fists drop and the body slumps and splits, chips of glass flying,
    // then the lava cools and goes dark
    const k1=ez(cl(p/.2,0,1)),k2=ez(cl((p-.2)/.42,0,1)),cool=cl((p-.5)/.45,0,1);A.lean=-.24*k1*(1-k2)+.16*k2;A.B=[-2*k1,0,0];A.s=-.07*k1-.3*k2;A.roll=.06*k1+.1*k2;
    A.shut=1;A.heat=lerp(.5+.6*k1,0,cool);A.flare=(1-cool)*(.5+.5*k1);const zf=OFR*.95/(1+A.s);A.hL=[4+2*k2,-OFY-3*k2,lerp(17.5+2*k1,zf,k2)];A.hR=[4+3*k2,OFY+2.5*k2,lerp(17.5+2*k1,zf,cl(k2*1.15,0,1))];
    A.shard=p>.18&&p<.95?(p-.18)/.77:-1;A.dust=p>.55&&p<.95?(p-.55)/.4:-1}
  else{// standing: it breathes slowly, the fists float up and down, the lava pulses, it looks round
    const b=Math.sin(ph);A.s=.022*b;A.yaw=look(p,.3);A.blink=blink(p,.58,.07);A.hL=[4,-OFY,17.5+.9*Math.sin(ph+.6)];A.hR=[4,OFY,17.5+.9*Math.sin(ph+1.4)];A.heat=.45+.25*(.5+.5*Math.sin(ph*2))}
  const dv=Math.atan2(Math.sin(Math.PI/2-face),Math.cos(Math.PI/2-face)),cheat=.45*Math.sin(dv)*cl((Math.PI-Math.abs(dv))/(Math.PI/2),0,1);
  const X=frame(A,0),Xh=frame(Object.assign({},A,{yaw:A.yaw+cheat}),0),Cb=[0,0,OZ],dT=D(X.T(Cb));
  floor(V0,x,y,sc,A.B,17,6.5,.32);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  // the feet: two dark stumps under the body, the far one darker
  for(const[sd,f] of[[-1,A.fL],[1,A.fR]]){const far=F(0,sd,0)<0,c=add(f,[A.B[0],A.B[1],4.4]);L.add(dT-100+D(c)*.01,()=>{const E=ovol(V0,C.IDF,c,[6,5,4.2],far?OC.foot2:OC.foot,{kl:.12,kd:.4,rim:.36});gloss(E,.5)})}
  // the body: the round block of glass, the cracks, the glowing eyes
  L.add(dT,()=>{const E=ovol(V0,X,Cb,OR,OC.mid,{rim:.45});E.path();ctx.fillStyle=glass(E,OC.hi,OC.mid,OC.lo);ctx.fill();ink(2.5);ctx.stroke();
    ctx.save();E.path(1.2);ctx.clip();
    // the warm light of the lava from inside, stronger when it heats up
    if(A.flare>0){const g=ctx.createRadialGradient(E.c[0],E.c[1]+3,1,E.c[0],E.c[1]+3,E.rx*1.1);g.addColorStop(0,`rgba(255,110,40,${.1*A.flare})`);g.addColorStop(1,'rgba(255,110,40,0)');ctx.fillStyle=g;ctx.fillRect(E.bb[0],E.bb[1],E.bb[2]-E.bb[0],E.bb[3]-E.bb[1])}
    for(const c of OCR)crack(V0,X,Cb,OR,c,A.heat);
    gloss(E,1);
    const fc=ellFace(V0,Xh,Cb,OR);
    eyes(null,fc.h,14,{at:fc.at,dir:[.76,.24,.58],kind:'glow',col:OC.eye,glow:'255,170,40',rx:2.5+.5*A.flare,ry:1.65,fall:.5,blink:A.blink,squint:A.squint,shut:A.shut,shutCol:OC.eye,lightCol:OC.eyeL,lr:.5,a:.38,b:.54,v0:.2});
    ctx.restore()});
  // the fists: big round lumps of the same glass, floating at the sides; their place in the draw order is where they are at rest
  for(const[sd,h] of[[-1,A.hL],[1,A.hR]]){const r0=X.T([4,sd*OFY,17.5]);L.add(D(r0)+.02,()=>{const c=X.T(h),E=ovol(V0,C.IDF,c,[OFR,OFR,OFR*.877],OC.fist,{rim:.45});E.path();ctx.fillStyle=glass(E,OC.hi,OC.fist,OC.lo);ctx.fill();ink(2.4);ctx.stroke();
    ctx.save();E.path(1);ctx.clip();crack(V0,C.IDF,c,[OFR,OFR,OFR*.877],[[.6,sd*.2,.75],[.9,sd*.35,.1]],A.heat);gloss(E,.9);ctx.restore()})}
  // the stamp at the end of the charge: dust round the feet and a few sparks
  // (dying: chips of the black glass fly off the body and fall)
  if(A.shard>=0&&!o.noFx)L.add(dT+30,()=>{const k=A.shard;for(let i=0;i<6;i++){const a=i/6*TAU+.3,u=cl(k*1.3-i*.05,0,1),r=OR[0]*.8+u*12,z=OZ+6+u*14-u*u*30,q=P([A.B[0]+Math.cos(a)*r,Math.sin(a)*r,Math.max(1,z)]),s0=2.6-u*.8,rt=u*5+i;
      ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(rt);ctx.beginPath();ctx.moveTo(-s0,-s0*.4);ctx.lineTo(0,-s0);ctx.lineTo(s0*.9,s0*.2);ctx.lineTo(-s0*.2,s0*.8);ctx.closePath();ctx.fillStyle=i%2?OC.mid:OC.lo;ctx.fill();ink(1);ctx.stroke();ctx.restore()}});
  if(A.dust>=0&&!o.noFx)L.add(dT+40,()=>{const k=A.dust;for(let i=0;i<7;i++){const a=i/7*TAU+.4,r=10+k*14,q=P([A.B[0]+Math.cos(a)*r,Math.sin(a)*r*1.1,1+k*3]);ctx.fillStyle=`rgba(80,70,80,${.42*(1-k)})`;ball(q,2+k*3.5);ctx.fill()}
    if(!LOWFX)for(let i=0;i<5;i++){const a=i/5*TAU+1.1,q=P([A.B[0]+Math.cos(a)*(6+k*16),Math.sin(a)*(6+k*16),4+k*14-k*k*10]);ctx.fillStyle=`rgba(255,${150+i*18},60,${1-k})`;ball(q,1.1);ctx.fill()}});
  run(L);
  if(A.stars>0)stars(P(X.T([0,0,OZ+OR[2]+8])),11,A.stars);
  ctx.restore()}
reg('obsidian',{n:"Golem d'ossidiana",g:2,an:['idle','walk','prep','attack','hit','die'],dur:{idle:2.8,walk:1.05,prep:.9,attack:1.6,hit:.6,die:1},lab:{attack:'Carica'}},obsidian);
})();
