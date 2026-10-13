// Nemici del primo capitolo (Muschio e Cristalli) rifatti in 3D come l'Arciere: stesse forme e colori di oggi nel gioco, dipinti con la
// cassetta C3 (base3d.js). Ogni mossa dipende solo da p (0..1).
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,Vat,stepper,ball,seg,tri,hull,rim,run,dk,lt,rgba,poly,bbox,softBox,softBall,rimPoly,
  look,blink,keys,bump,sstep,hitK,frame,vol,ellPts,ellAt,ellN,sball,caps,chain,disc3,spot,leaf,eyes,mouth,cheeks,ellFace,floor,stars,orb,parts,reg,shine}=C;

// ------------------------------------------------------------------ FUNGO: a cream stem with a little face under a purple cap with white spots
// (drawMushroom): two round stumps for feet, rosy cheeks and a smile; it waddles; the attack fills the cap up and lets out a puff of spores
const MC={cap:'#9a5bc8',spot:'#efe4f7',stem:'#ece0c6',foot:'#c9b89a',foot2:'#b3a283',blush:'192,128,122'};
// the white spots on the cap: [angle round it (0 = in front), height (0 = the rim .. π/2 = the top), radius]
const SPOTS=[[.45,.42,3.7],[-.62,.6,3.4],[1.5,.28,3],[2.45,.66,3.6],[-2.2,.34,3.2],[3.3,.24,2.8],[-1.4,1.06,2.8],[.95,1.12,2.6],[-2.95,.82,2.4],[2.05,1.24,2.2]];
function mushroom(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU;
  const A={B:[0,0,0],lean:0,roll:0,s:0,yaw:0,cap:0,capY:0,fL:[0,-5,0],fR:[0,5,0],blink:1,shut:0,squint:0,mouth:0,puff:-1,stars:0};
  if(anim==='walk'){const st=stepper(p,.5),a=st(0,2.4,2.2),b=st(.5,2.4,2.2),up=Math.abs(Math.sin(ph));A.fL=[a.x,-5,a.z];A.fR=[b.x,5,b.z];
    A.B=[0,-.5*Math.sin(ph),1.1*up];A.roll=-.08*Math.sin(ph);A.lean=.06;A.s=-.03+.05*up;A.capY=.4-.8*up;A.cap=.02*Math.cos(ph*2)}
  else if(anim==='attack'){// .0-.35 crouches and fills up, .35-.5 the cap swells, .5 the puff of spores, .5-1 it settles with a wobble
    const k1=ez(cl(p/.35,0,1)),k2=ez(cl((p-.35)/.15,0,1)),k3=ez(cl((p-.5)/.5,0,1));
    A.s=p<.35?-.14*k1:p<.5?-.14+.32*k2:.18*(1-k3)-.05*Math.sin(k3*Math.PI*3)*(1-k3);
    A.cap=p<.35?.04*k1:p<.5?.04+.2*k2:.24*(1-k3);A.squint=p<.5?k1:1-k3;A.mouth=p>.42&&p<.72?1:0;A.puff=p>=.48?(p-.48)/.52:-1;A.lean=-.05*k1*(1-k3)}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.3*kb;A.B=[-2.4*kb,0,.4*kb];A.s=-.1*kb;A.roll=.06*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;A.capY=-1*kb}
  else{const b=Math.sin(ph);A.s=.025*b;A.cap=.04*Math.sin(ph+.5);A.capY=.4*Math.sin(ph-.4);A.yaw=look(p,.35);A.blink=blink(p,.62,.08)}
  const X=frame(A,0);
  floor(V0,x,y,sc,A.B,14,5.6,.3,A.B[2]);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),Cb=[0,0,15],dT=D(Cb);
  // the feet: two round stumps under the stem, the far one darker
  for(const[sd,f] of[[-1,A.fL],[1,A.fR]]){const far=F(0,sd,0)<0,c=add(f,[0,0,3.4]);L.add(dT-100+D(c)*.01,()=>sball(V0,add(c,[A.B[0],A.B[1],0]),3.4,far?MC.foot2:MC.foot,{rim:.2}))}
  // the stem: a round cream body with the face
  const Rb=[7.2,9,13];L.add(dT,()=>{const hp=vol(V0,ellPts(Cb,Rb,null,6,18).map(X.T),MC.stem,{kl:.14,kd:.2});
    ctx.save();poly(hp);ctx.clip();
    {const q=P(X.T([4,0,24.5])),g=ctx.createRadialGradient(q[0],q[1]+1,1,q[0],q[1]+1,12);g.addColorStop(0,'rgba(60,20,80,.3)');g.addColorStop(1,'rgba(60,20,80,0)');ctx.fillStyle=g;ctx.fillRect(q[0]-14,q[1]-12,28,24)}
    const fc=ellFace(V0,X,Cb,Rb);
    eyes(null,fc.h,9,{at:fc.at,dir:[1,.38,.05],kind:'dark',rx:1.85,ry:2.25,fall:.42,blink:A.blink,squint:A.squint,shut:A.shut,a:.55,b:.7});
    cheeks(null,fc.h,9,null,{at:fc.at,dir:[1,.62,-.08],rgb:MC.blush,al:.55,rx:1.8,ry:1.1});
    if(A.mouth>0)mouth(null,fc.h,9,[1,0,-.2],{at:fc.at,kind:'o',w:2.2,h:1.4});else mouth(null,fc.h,9,[1,0,-.18],{at:fc.at,kind:'smile',w:1.9,bow:1.5});
    ctx.restore()});
  // the cap: a purple dome with white spots, bobbing on the stem
  const capC=[0,0,26.6+A.capY],cs=1+A.cap,Rc=[17*cs,17*cs,10.8*(1+A.cap*.6)];
  L.add(dT+.5,()=>{const hp=vol(V0,ellPts(capC,Rc,null,7,24,-.12).map(X.T),MC.cap,{kl:.18,kd:.3});
    ctx.save();poly(hp);ctx.clip();
    for(const[t,e,r] of SPOTS){const m=[Math.cos(t)*Math.cos(e),Math.sin(t)*Math.cos(e),Math.sin(e)];spot(V0,X.T(ellAt(capC,Rc,null,m)),X.Rd(ellN(Rc,null,m)),r*cs,MC.spot,{v0:.02})}
    // a darker band along the edge, where the cap curls under toward the gills
    {ctx.strokeStyle=rgba(dk(MC.cap,.45),.55);ctx.lineWidth=2.2;ctx.lineCap='round';ctx.beginPath();let pen=false;
      for(let i=0;i<=32;i++){const t=i/32*TAU,q=P(X.T(ellAt(capC,Rc,null,[Math.cos(t)*.993,Math.sin(t)*.993,-.12]))),v=F(X.Rd([Math.cos(t),Math.sin(t),-.5]));
        if(v>-.1){if(!pen){ctx.moveTo(q[0],q[1]);pen=true}else ctx.lineTo(q[0],q[1])}else pen=false}ctx.stroke()}
    ctx.restore()});
  // the puff of spores: a ring of purple specks bursting out from under the cap and drifting up
  if(A.puff>=0&&!o.noFx)L.add(dT+50,()=>{const k=A.puff;for(let i=0;i<14;i++){const a=i/14*TAU+.3,r=14+k*26*(.7+.3*Math.sin(i*2.3)),q=P([Math.cos(a)*r,Math.sin(a)*r,16+k*10+Math.sin(i*1.7)*4*k]);
      ctx.fillStyle=`rgba(${i%3?'190,130,240':'226,196,255'},${(1-k)*.85})`;ball(q,1.4+k*2.2);ctx.fill()}
    if(!LOWFX){const q=P([0,0,14]);shine('176,106,216',q[0],q[1],20+k*26,.35*(1-k))}});
  run(L);
  if(A.stars>0)stars(P(X.T([0,0,43])),9,A.stars);
  ctx.restore()}
reg('mushroom',{n:'Fungo',g:1,dur:{idle:2.6,walk:.9,attack:1.3,hit:.6}},mushroom);

// ------------------------------------------------------------------ SLIME: the version Denis chose (NE.slime, sprite/nemici/disegno_nemici.js: a teschio
// inside, yellow eyes, a mouth with teeth), unchanged; the big one and the lava one only change size and colour. 'hit' (the original has no
// such move): knocked back and squashed, with the dizzy stars
const SLV={slime:{sc:1.15},bigslime:{sc:1.7,gel:'#4f8a30',gelD:'#335a22',gelF:'#26401a'},magmaslime:{sc:1.05,gel:'#ff7a2e',gelD:'#b8401a',gelF:'#7a2a10',glow:'255,120,40'}};
const slimeOf=id=>(x,y,face,anim,p,sc,o)=>{o=o||{};const S=SLV[id],k=(sc||1)*S.sc,op={gel:S.gel,gelD:S.gelD,gelF:S.gelF};
  if(S.glow&&!LOWFX)shine(S.glow,x,y-9*k,26*k,.28+.06*Math.sin(p*TAU));
  if(anim!=='hit')return NE.slime(x,y,face,anim,p,k,op);
  const kb=hitK(p),V0=V(face),b=V0.P([-4*kb,0,0]);ctx.save();ctx.translate(x+b[0]*k,y+b[1]*k);ctx.scale(1+.14*kb,1-.16*kb);NE.slime(0,0,face,'idle',p,k,op);ctx.restore();
  if(p<.75)stars([x+b[0]*k,y-24*k],8*k,1-p/.75)};
reg('slime',{n:'Slime',g:1,an:['idle','walk','attack','hit'],dur:{idle:2.4,walk:.9,attack:1.2,hit:.6},lab:{walk:'Salta'}},slimeOf('slime'));
reg('bigslime',{n:'Slime grande',g:1,an:['idle','walk','attack','hit'],dur:{idle:2.6,walk:1.05,attack:1.3,hit:.6},lab:{walk:'Salta'}},slimeOf('bigslime'));
reg('magmaslime',{n:'Slime di lava',g:2,an:['idle','walk','attack','hit'],dur:{idle:2.4,walk:.9,attack:1.2,hit:.6},lab:{walk:'Salta'}},slimeOf('magmaslime'));

// ------------------------------------------------------------------ PIPISTRELLO: a big purple ball that is head and body at once (drawBat), two
// pointed ears pink inside, yellow eyes, two little fangs; wings of membrane spread to the sides with a scalloped edge, the membrane facing
// the camera (as Denis asked on 11 October), seen thin from the side. It hovers and flaps; the attack rears up open-mouthed and dives
const BTC={body:'#8a5bc4',wing:'#5b3a87',wingB:'#4a2f70',earIn:'#e7a3c8',eye:'#ffc93c',fang:'#fff6e0'};
// the wing's outline in its own plane: u along the span (out from the shoulder), w up; the 2D wing of the game, a little bigger
const WING=[[5,3.4],[20,11.5],[18.2,2.4],[16.4,-4.4],[12.4,.8],[8.8,-6.8],[5.2,-3.2]];
function bat(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU,Z0=17,r=10;
  const A={B:[0,0,0],lean:0,roll:0,s:0,yaw:0,flap:0,fold:0,blink:1,shut:0,open:0,squint:0,stars:0};
  if(anim==='walk'){const f=Math.sin(ph*3);A.flap=f;A.B=[0,0,1.4*Math.sin(ph*3+1.2)];A.lean=.24;A.roll=.1*Math.sin(ph);A.yaw=.12*Math.sin(ph)}
  else if(anim==='attack'){// .0-.35 rears up with the mouth open, .35-.52 dives forward with the wings swept back, .52-1 swings back up
    const v=keys([[0,[0,0,0]],[.35,[-3,4.5,-.4]],[.5,[11,-5,.7]],[.62,[8,-3,.45]],[1,[0,0,0]]],p);A.B=[v[0],0,v[1]];A.lean=v[2];
    A.flap=p<.35?Math.sin(ph*4.5):p<.62?-.25:Math.sin(ph*3);A.fold=p>.36&&p<.64?Math.sin((p-.36)/.28*Math.PI):0;A.open=p>.18&&p<.66?1:0;A.squint=p>.3&&p<.6?.8:0}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-3.5*kb,0,1.5*kb];A.lean=-.35*kb;A.roll=.16*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;A.flap=Math.sin(ph*2)*.4;A.fold=.5*Math.max(0,kb)}
  else{A.flap=Math.sin(ph*2);A.B=[0,0,1.6*Math.sin(ph)];A.yaw=look(p,.4);A.blink=blink(p,.55,.07)}
  const X=frame(A,Z0),Cb=[0,0,Z0],dT=D(Cb);
  floor(V0,x,y,sc,A.B,10.5,4.2,.25,Z0+A.B[2]);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  // the wings: each a flat membrane through the shoulder, flapping round the body's forward axis, swept back when it dives
  for(const sd of[-1,1]){const th=.55*A.flap,S0=[-.48-A.fold*.8,sd*Math.cos(th),Math.sin(th)],Sd=nrm(S0),U=nrm(sub([0,-sd*Math.sin(th),Math.cos(th)],mul(Sd,dot([0,-sd*Math.sin(th),Math.cos(th)],Sd)))),sh=[0,sd*6.5,Z0+1];
    const at=(u,w)=>X.T(add(sh,add(mul(Sd,u*1.08),mul(U,w*1.08)))),mid=at(14,1),n=nrm(X.Rd(cross(Sd,U)));
    L.add(D(mid)<dT+.5?dT-1:dT+1,()=>{const pts=WING.map(([u,w])=>P(at(u,w))),f=F(n)*sd;ctx.lineJoin='round';poly(pts);ctx.fillStyle=softBox(bbox(pts),f>=0?BTC.wing:BTC.wingB,.2,.25);ctx.fill();ink(2.2);ctx.stroke();
      // the long fingers that hold the membrane: from the shoulder to the points of the edge
      ctx.strokeStyle='rgba(28,14,48,.45)';ctx.lineWidth=1.1;ctx.lineCap='round';const s0=P(at(5,0));for(const i of[1,3,5]){seg(s0,pts[i]);ctx.stroke()}})}
  // the ears: two points on top, pink inside where they face us
  for(const sd of[-1,1]){const b=X.T(add(Cb,mul(nrm([-.05,sd*.46,.88]),r*.8))),d=nrm(X.Rd([-.1,sd*.38,1])),sv=nrm(X.Rd([0,1,0]));
    L.add(dT+(F(X.Rd([-.3,sd,.2]))>.25?.6:-.6),()=>{leaf(V0,b,d,sv,8.2,4.4,BTC.body,{back:BTC.body,round:.62,tip:.1});const f=F(cross(sv,d));if(f>.05){ctx.save();ctx.globalAlpha=cl(f*3,0,1);leaf(V0,add(b,mul(d,1.2)),d,sv,5.6,2.6,BTC.earIn,{noInk:true,round:.62,tip:.1,flat:true});ctx.restore()}})}
  // the body: a ball, the face on it
  L.add(dT,()=>{const q=sball(V0,X.T(Cb),r,BTC.body),at=m=>({q:P(X.T(add(Cb,mul(m,r*.97)))),v:F(X.Rd(m))});
    eyes(null,q,r,{at,dir:[1,.38,.14],kind:'dark',col:BTC.eye,rx:2.25,ry:2.5,blink:A.blink,squint:A.squint,shut:A.shut,lr:.55,glow:'255,201,60'});
    if(A.open)mouth(null,q,r,[1,0,-.34],{at,kind:'open',w:2.6,h:1.9,open:1,fang:BTC.fang,fh:1.8});else mouth(null,q,r,[1,0,-.3],{at,kind:'fangs',w:2,bow:.8,fang:BTC.fang,fh:1.9})});
  run(L);if(A.stars>0)stars(P(X.T([0,0,Z0+r+4])),8,A.stars);ctx.restore()}
reg('bat',{n:'Pipistrello',g:1,an:['idle','walk','attack','hit'],dur:{idle:2.2,walk:.7,attack:1.2,hit:.6},lab:{walk:'Vola',attack:'Picchiata'}},bat);

// ------------------------------------------------------------------ PIANTA: a pink flower on a green stem with two leaves on the floor (drawPlant): seven
// petals round a yellow face with a mouth and three white teeth, the back of the flower green. Rooted: it turns to look at you, sways, the
// petals turn slowly; the attack swells the flower, opens the mouth wide and spits (the ring of seeds is the game's)
const PLC={leaf:'#4f8a34',stem:'#5f9e3c',petal:'#d65ba8',petalB:'#a8467f',disc:'#f2d36b',back:'#4f8a34',mouth:'#5a1f2e',tooth:'#fff6e0'};
function plant(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU;
  const A={sway:0,head:1,open:.3,spin:0,lean:0,stars:0,flare:0,yaw:0};
  if(anim==='attack'){// .0-.42 the flower swells and leans back, the mouth opens wide; .42-.5 it spits (snaps forward); .5-1 settles
    const k1=ez(cl(p/.42,0,1)),k2=cl((p-.42)/.08,0,1),k3=ez(cl((p-.5)/.5,0,1));A.head=1+.18*k1*(1-k3);A.open=p<.42?.3+.7*k1:1-.7*k3;A.lean=p<.42?-.18*k1:p<.5?lerp(-.18,.2,k2):.2*(1-k3);
    A.flare=p<.5?k1:1-k3;A.spin=p*.5;A.sway=.04*Math.sin(ph)}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.32*kb;A.sway=.12*kb;A.stars=p<.75?1-p/.75:0;A.open=p<.4?.8:.3;A.head=1-.06*kb}
  else{A.sway=.07*Math.sin(ph);A.lean=.03*Math.sin(ph*2);A.spin=p;A.open=.3+.12*Math.sin(ph*2);A.yaw=look(p,.25)}
  floor(V0,x,y,sc,[0,0,0],16,5.6,.3);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  // the leaves on the floor, at the foot of the stem
  for(const[a,len0] of[[Math.PI/2+.12,20],[-Math.PI/2-.12,20],[Math.PI*.98,12]]){const d=[Math.cos(a)*.97,Math.sin(a)*.97,.16],sv=[-Math.sin(a),Math.cos(a),0],b=[Math.cos(a)*1.2,Math.sin(a)*1.2,1];
    L.add(D(add(b,mul(d,6)))-30,()=>leaf(V0,b,d,sv,len0,len0*.4,PLC.leaf,{bend:-.45,vein:'rgba(20,50,10,.45)',round:.7,kl:.2,kd:.25}))}
  // the stem: a green curve from the floor to the flower, bending with the sway
  const top=[1.2+A.lean*6,A.sway*10,20.5],stem=[0,.25,.5,.75,1].map(k=>[Math.sin(k*Math.PI)*-1.6+top[0]*k*k,top[1]*k*k,k*top[2]]);
  L.add(D([0,0,8])-1,()=>chain(V0,stem,[1.9,1.8,1.7,1.6,1.5],PLC.stem,{rim:.2}));
  // the flower head: it looks along its own direction (the face, turned up toward the camera a little), petals round a disc
  const yaw=A.yaw,fwd=nrm(C.rotZ(C.rotY([1,0,.56],-A.lean),yaw)),Hc=add(top,mul(fwd,2.2)),hk=A.head;let u=cross([0,0,1],fwd);u=nrm(u);const w=cross(fwd,u);
  const dq=(a,b,z)=>add(add(add(Hc,mul(u,a*hk)),mul(w,b*hk)),mul(fwd,(z||0)*hk));
  const fF=F(fwd);
  L.add(D(Hc),()=>{const N=7,R0=5.4,PL=11.6;
    // the petals: two-sided leaves out from under the disc, cupped toward the face, turning slowly
    const pet=[];for(let i=0;i<N;i++){const a=(i+A.spin)*TAU/N,dir=add(mul(u,Math.cos(a)),mul(w,Math.sin(a))),side=add(mul(u,-Math.sin(a)),mul(w,Math.cos(a))),b=dq(Math.cos(a)*R0,Math.sin(a)*R0,-.4);
      pet.push({b,dir:nrm(add(dir,mul(fwd,.28-.25*A.flare))),side,d:D(add(b,mul(dir,4)))})}
    pet.sort((a,b)=>a.d-b.d);for(const q of pet)leaf(V0,q.b,q.dir,q.side,PL*hk,5.2*hk,fF>=0?PLC.petal:PLC.petalB,{back:fF>=0?PLC.petalB:PLC.petal,ell:true,bend:.5,kl:.22,kd:.2});
    // the disc: a thick round face (yellow in front, green behind), the mouth with three teeth on its front
    const fr=[],bk=[],Rd=7.6;for(let i=0;i<24;i++){const a=i/24*TAU;fr.push(P(dq(Math.cos(a)*Rd,Math.sin(a)*Rd,1.4)));bk.push(P(dq(Math.cos(a)*Rd,Math.sin(a)*Rd,-1.2)))}
    const H=C.chull(fr.concat(bk));ink(2.4);poly(H);ctx.fillStyle=fF>=0?C.dk(PLC.disc,.25):C.dk(PLC.back,.2);ctx.fill();ctx.stroke();
    const fc=fF>=0?fr:bk;poly(fc);ctx.fillStyle=softBox(bbox(fc),fF>=0?PLC.disc:PLC.back,.25,.22);ctx.fill();ctx.strokeStyle='rgba(27,22,18,.55)';ctx.lineWidth=1;ctx.stroke();
    if(fF>.04){ctx.save();ctx.globalAlpha=cl(fF*5,0,1);const mo=[],op=A.open;for(let i=0;i<16;i++){const a=i/16*TAU;mo.push(P(dq(Math.cos(a)*4.3,-1.2+Math.sin(a)*(1.6+2.2*op),1.45)))}
      ink(1.2);poly(mo);ctx.fillStyle=PLC.mouth;ctx.fill();ctx.stroke();
      // three white teeth hanging from the top of the mouth
      ctx.fillStyle=PLC.tooth;ctx.strokeStyle=INK;ctx.lineWidth=.7;for(const tx of[-2,0,2]){const a=P(dq(tx-1,-1.2+1.6+2.2*op-.1,1.5)),b=P(dq(tx,-1.2+1.6+2.2*op-1.9,1.5)),c=P(dq(tx+1,-1.2+1.6+2.2*op-.1,1.5));
        ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath();ctx.fill();ctx.stroke()}
      ctx.fillStyle='rgba(255,255,255,.4)';const hl=P(dq(-3.6,3.8,1.45));ball(hl,1.3);ctx.fill();ctx.restore()}
    rimPoly(H,.25)});
  run(L);if(A.stars>0)stars(P(add(Hc,[0,0,12])),9,A.stars);ctx.restore()}
reg('plant',{n:'Pianta',g:1,an:['idle','attack','hit'],dur:{idle:2.8,attack:1.3,hit:.6},lab:{attack:'Sputa semi'}},plant);

// ------------------------------------------------------------------ FUOCO FATUO: a floating drop of light, round below and pointed above, lilac at the tip
// and sky blue at the bottom (drawWisp), two dark eyes; the tip sways like a flame. It drifts, charges and lets go a pulse (its bolts are the
// game's), and vanishes to appear elsewhere ('tele')
const WSC={top:'#c7b3f2',bot:'#7fd3f0',eye:'#2a1f4a'},WPR=[[0,0],[1.4,6.6],[3.6,9.4],[6.4,10.4],[9.4,9.8],[12.4,8],[15.6,5.4],[19,3],[22.6,1.3],[26.8,0]];
function wisp(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU,Z0=10;
  const A={B:[0,0,0],lean:0,roll:0,s:0,yaw:0,sway:0,blink:1,squint:0,shut:0,stars:0,fade:1,pulse:-1,ring:0};
  if(anim==='walk'){A.B=[0,0,1.6*Math.sin(ph*2)];A.lean=.22;A.sway=-.9+.5*Math.sin(ph*2);A.yaw=.1*Math.sin(ph)}
  else if(anim==='attack'){const k1=ez(cl(p/.4,0,1)),k3=ez(cl((p-.5)/.5,0,1));A.s=p<.4?.14*k1:p<.5?.14-.3*(p-.4)/.1:-.16*(1-k3);A.squint=p<.5?k1:1-k3;A.pulse=p>=.46?(p-.46)/.54:-1;A.sway=Math.sin(ph*3)*.4;A.B=[0,0,1.2*Math.sin(ph)]}
  else if(anim==='tele'){// fades and shrinks away (.0-.38), gone (.38-.6), comes back where the ring is (.6-1)
    const k=p<.38?1-ez(p/.38):p<.6?0:ez((p-.6)/.4);A.fade=k;A.s=-.5*(1-k);A.ring=p>.3&&p<.75?Math.sin((p-.3)/.45*Math.PI):0;A.sway=Math.sin(ph*2)*.6}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-3*kb,0,1.2*kb];A.lean=-.35*kb;A.roll=.1*kb;A.s=-.1*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0}
  else{A.B=[0,0,2*Math.sin(ph)];A.sway=.7*Math.sin(ph*2);A.yaw=look(p,.3);A.blink=blink(p,.4,.07)}
  if(A.ring>0&&!LOWFX){const q=P(0,0,0);ctx.save();ctx.strokeStyle=`rgba(138,91,196,${(.75*A.ring).toFixed(3)})`;ctx.lineWidth=2.5*sc;ctx.beginPath();ctx.ellipse(x+q[0]*sc,y+q[1]*sc,(16-6*A.ring)*sc,(16-6*A.ring)*.45*sc*C.KR(),0,0,TAU);ctx.stroke();ctx.restore()}
  if(A.fade<=.02)return;
  const X=frame(A,Z0);floor(V0,x,y,sc,A.B,9,3.6,.22*A.fade,Z0);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.globalAlpha*=A.fade;
  // the body: rings of the drop, the upper ones pushed sideways by the sway like a flame, its outline is their hull
  const pts=[];for(const[dz,rr] of WPR){const k=cl((dz-9)/15,0,1),off=[-A.lean*0,A.sway*6*k*k,0];for(let i=0;i<20;i++){const t=i/20*TAU;pts.push(P(X.T([Math.cos(t)*rr+off[0],Math.sin(t)*rr+off[1],Z0+dz])))}}
  const H=C.chull(pts),bb=bbox(H);ink(2.5);poly(H);const g=ctx.createLinearGradient(0,bb[1],0,bb[3]);g.addColorStop(0,WSC.top);g.addColorStop(1,WSC.bot);ctx.fillStyle=g;ctx.fill();ctx.stroke();
  ctx.save();poly(H);ctx.clip();{const w=bb[2]-bb[0],h=bb[3]-bb[1],cx=(bb[0]+bb[2])/2,cy=bb[1]+h*.66,gg=ctx.createRadialGradient(cx-w*.2,cy-h*.12,1,cx,cy,w*.75);gg.addColorStop(0,'rgba(255,255,255,.35)');gg.addColorStop(.5,'rgba(255,255,255,0)');gg.addColorStop(1,'rgba(40,40,110,.28)');ctx.fillStyle=gg;ctx.fillRect(bb[0],bb[1],w,h)}
  {const q=P(X.T([0,-4,Z0+8]));ctx.fillStyle='rgba(255,255,255,.55)';ell(q[0]-1,q[1]-2,2.6,4.2);ctx.fill()}
  const Ce=[0,0,Z0+6.6],Re=[10.6,10.6,9.6],fc=ellFace(V0,X,Ce,Re);eyes(null,fc.h,10,{at:fc.at,dir:[1,.34,.1],kind:'dark',col:WSC.eye,rx:1.85,ry:2.9,blink:A.blink,squint:A.squint,shut:A.shut,lr:.5,a:.55,b:.7});
  ctx.restore();rimPoly(H,.35);
  if(A.pulse>=0&&!o.noFx){const k=A.pulse,q=P(X.T([0,0,Z0+7]));ctx.strokeStyle=`rgba(199,179,242,${(.8*(1-k)).toFixed(3)})`;ctx.lineWidth=2.4*(1-k)+.5;ball(q,8+k*20);ctx.stroke();shine('160,140,240',q[0],q[1],14+k*10,.4*(1-k))}
  ctx.restore();if(A.stars>0)stars(P(X.T([0,0,Z0+27])).map((v,i)=>i?y+v*sc:x+v*sc),7*sc,A.stars)}
reg('wisp',{n:'Fuoco fatuo',g:1,an:['idle','walk','attack','tele','hit'],dur:{idle:2.4,walk:1,attack:1.2,tele:1.4,hit:.6},lab:{walk:'Fluttua',attack:'Lampo',tele:'Sparisce'}},wisp);
})();
