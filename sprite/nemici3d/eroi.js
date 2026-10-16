// Gli eroi, i compagni e il Mercante in 3D (richiesta di Denis del 13 ottobre: «fammi anche i pg tutti in 3d», «sì, falli tutti»).
// Eroi: l'Arciere (già nel gioco), la Cacciatrice (coda di capelli, arco rosa), il Balestriere (elmo, balestra) e il Druida (corna di legno,
// punta del cappuccio, bastone con la sfera verde, occhi verdi), tutti sullo stesso corpo 3D (EROE.arciere) con i colori del gioco
// (HEROES in src/js/39-meta2-eroi-talenti.js), mosse: fermo, cammina, tira, scatto, colpito. Compagni (drawPetSprite in
// src/js/34-compagni.js): la Lucciola (la coda che brilla, ali di velo) e il Draghetto (corna gialle, ali, coda a punta, sputa fuoco); Muschietto
// non c'è più (punto 41 del piano di Denis), le creature nuove stanno in creature.js. Il Mercante del gioco (MERCHANT) col suo tappeto, le pozioni e la cassa.
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,run,dk,lt,rgba,poly,bbox,softBox,softBall,rimPoly,look,blink,keys,hitK,hop,frame,
  vol,ellPts,ellAt,ellN,sball,caps,chain,leaf,spot,eyes,mouth,cheeks,ellFace,floor,stars,parts,reg,shine}=C;

// ------------------------------------------------------------------ the heroes: the game's style of each one, without the gear (as in the shop)
const HST=id=>{const h=typeof HERO_BY!=='undefined'&&HERO_BY[id];const S={...(typeof HERO!=='undefined'?HERO:{}),...(h?h.style:{}),hid:id};if(id==='druida')S.eyes=S.eyeCol;return S};
const hero=id=>(x,y,face,anim,p,sc,o)=>{o=o||{};const S=HST(id);EROE.arciere(x,y,face,anim,p,(sc||1)*(S.sc||1),{style:{...S,...(o.style||{})},noFx:o.noFx,pull:anim==='aim'?.8:0})};
// the hero of today (drawRig of the game, its point is 8 px above the feet)
const oldHero=id=>(x,y,face,anim,p)=>{const S={...HST(id)};delete S.hid;const mv=anim==='walk',ph=p*TAU,pull=anim==='shoot'?(p<.5?p/.5*5:0):0,m0=mossOn,h0=typeof H3D!=='undefined'&&H3D.on;
  mossOn=0;if(h0)H3D.on=false;try{drawRig(x,y-8,face,mv?ph:0,mv,S,{pull})}finally{mossOn=m0;if(h0)H3D.on=true}};
const HD={idle:2.4,walk:.56,shoot:1.15,dash:.75,hit:1.1};
reg('arciere',{n:'Arciere',g:'eroi',an:['idle','walk','shoot','dash','hit'],dur:HD,lab:{shoot:'Tira',dash:'Scatto'},old:oldHero('arciere')},hero('arciere'));
reg('cacciatrice',{n:'Cacciatrice',g:'eroi',an:['idle','walk','shoot','dash','hit'],dur:HD,lab:{shoot:'Tira',dash:'Scatto'},old:oldHero('cacciatrice')},hero('cacciatrice'));
reg('balestriere',{n:'Balestriere',g:'eroi',an:['idle','walk','shoot','dash','hit'],dur:{...HD,shoot:1.8},lab:{shoot:'Balestra',dash:'Scatto'},old:oldHero('balestriere')},hero('balestriere'));
reg('druida',{n:'Druida',g:'eroi',an:['idle','walk','shoot','dash','hit'],dur:{...HD,shoot:1.5},lab:{shoot:'Incanta',dash:'Scatto'},old:oldHero('druida')},hero('druida'));
// the six heroes of 16 October (Denis: «sia la 1 che la 2»), on the same 3D body with their own pieces: they have no drawing of before
for(const[id,n,sh,lab,ex] of[['paladino','Paladino',1.3,'Martello'],['mago','Mago del ghiaccio',1.5,'Incanta'],['berserker','Berserker',1.3,'Ascia'],['corsaro','Corsaro',1.1,'Coltello',['slash',1,'Sciabola']],
    ['domatore','Domatore',1.2,'Frusta'],['monaco','Monaco',1,'Pugni']]){const an=['idle','walk','shoot','dash','hit'],dur={...HD,shoot:sh},lb={shoot:lab,dash:'Scatto'};if(ex){an.splice(3,0,ex[0]);dur[ex[0]]=ex[1];lb[ex[0]]=ex[2]}
  reg(id,{n,g:'eroi',an,dur,lab:lb},hero(id))}

// the companions of today (drawPetSprite of the game, with a pretend state)
const oldPet=id=>(x,y,face,anim,p)=>{const t=G.t;drawPetSprite(id,x,y,{face,moving:anim==='walk',hop:p*TAU*2,t,att:anim==='attack'&&p>.3&&p<.7?1:0,happy:anim==='happy'?1:0})};
const PD={idle:2.4,walk:.6,attack:1,happy:1.2};

// ------------------------------------------------------------------ LUCCIOLA: a firefly: a round tail that glows yellow-green and pulses, a dark
// head and chest, big eyes, two antennae with lit tips, two wings of veil that beat fast. It hovers beside the hero; the attack lights the
// tail up (the spark it shoots is the game's); happy: a big warm pulse (when it heals)
const LC={tail:'#e8ff7a',tailD:'#9fd04a',body:'#4a3a20',ant:'#e8ff7a'};
function lucciola(x,y,face,anim,p,sc,o){sc=(sc||1)*1.3;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU,Z0=22;
  const A={B:[0,0,2.2*Math.sin(ph)],lean:0,roll:0,s:0,yaw:0,glow:.6+.4*Math.sin(ph*2),flap:Math.sin(ph*10),blink:1,shut:0,stars:0};
  if(anim==='walk'){A.B=[0,0,1.6*Math.sin(ph*2)];A.lean=.25;A.flap=Math.sin(ph*5)}
  else if(anim==='attack'){const k=p<.35?ez(p/.35):1-ez(cl((p-.35)/.65,0,1));A.glow=.6+1.2*k;A.lean=keys([[0,0],[.35,-.15],[.43,.2],[1,0]],p);A.flap=Math.sin(ph*2)}
  else if(anim==='happy'){A.glow=1+.8*Math.sin(p*Math.PI);A.B=[0,0,2.5*Math.sin(ph*2)];A.yaw=.3*Math.sin(ph);A.flap=Math.sin(ph*6)}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-3*kb,0,1.5*kb];A.lean=-.35*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;A.glow=.4}
  else{A.yaw=look(p,.4);A.blink=blink(p,.5,.07)}
  // (the wing beats stay at or under ~8 Hz: faster ones turn into a random jitter on the frames of a phone; the draw order is the body at
  // rest, so no part pops in front of another as it bobs and looks round)
  const X=frame(A,Z0),dT=D(X.T([0,0,Z0])),rd=q=>dT+D(sub(q,[0,0,Z0])),Ct=[-4.6,0,Z0-1],Cc=[.2,0,Z0+.6],Ch=[4,0,Z0+2.6];
  floor(V0,x,y,sc,A.B,6,2.6,.2,Z0);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  // the glow of the tail, behind everything
  if(!LOWFX){const q=P(X.T(Ct));shine('220,255,110',q[0],q[1],12+A.glow*7,.42*Math.min(1.3,A.glow))}
  // the wings: two veils on the back, beating fast
  for(const sd of[-1,1]){const b=X.T([.4,sd*1.6,Z0+3.4]),d=nrm(X.Rd([-.55,sd*(.5+.35*A.flap),.75])),sv=nrm(X.Rd([1,0,.2]));
    L.add(rd([.4,sd*1.6,Z0+3.4])+(F(0,sd,0)>.2?.6:-.6),()=>{ctx.save();ctx.globalAlpha*=.75;leaf(V0,b,d,sv,8.5,2.8,'#e6f5ff',{back:'#d8ecff',round:.55,lw:1.1,kl:.3,kd:.1,flat:true});ctx.restore()})}
  // the tail: an egg of light with two rings, brighter as it pulses
  L.add(rd(Ct),()=>{const g=A.glow,col=`rgb(${Math.min(255,200+40*g)|0},255,${Math.min(255,90+50*g)|0})`,pts=vol(V0,ellPts(Ct,[5.4,4.4,4.2],null,5,14).map(X.T),'#d8ff7a',{fill:col,rim:.4});
    ctx.save();poly(pts);ctx.clip();const q=P(X.T(Ct));ctx.fillStyle='rgba(255,255,230,.55)';ball([q[0]-1.5,q[1]-1.4],2.2);ctx.fill();
    ctx.strokeStyle='rgba(60,80,20,.3)';ctx.lineWidth=1;for(const k of[-.35,.25]){const a=P(X.T(add(Ct,[k*5.4,-4.4,0]))),b=P(X.T(add(Ct,[k*5.4,4.4,0]))),m=P(X.T(add(Ct,[k*5.4,0,-4.2])));ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(m[0],m[1]+2,b[0],b[1]);ctx.stroke()}ctx.restore()});
  // the chest and the head, dark brown; the eyes, the antennae with their lit tips
  L.add(rd(Cc),()=>sball(V0,X.T(Cc),3.9,LC.body,{rim:.3}));
  L.add(rd(Ch)+.1,()=>{const q=sball(V0,X.T(Ch),3.4,LC.body,{rim:.3}),at=m=>({q:P(X.T(add(Ch,mul(m,3.3)))),v:F(X.Rd(m))});
    eyes(null,q,3.4,{at,dir:[1,.5,.2],kind:'white',col:'#1b1612',rx:1.55,ry:1.65,shut:A.shut,blink:A.blink,lw:.7,v0:.02,a:.6,b:.82,gap:.2});
    for(const sd of[-1,1]){const a0=X.T(add(Ch,[.8,sd*1.4,2.6])),a1=X.T(add(Ch,[2.6,sd*3,6.5])),a2=X.T(add(Ch,[4.6,sd*4.4,7.6])),P0=P(a0),P1=P(a1),P2=P(a2);
      ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(P0[0],P0[1]);ctx.quadraticCurveTo(P1[0],P1[1],P2[0],P2[1]);ctx.stroke();
      if(!LOWFX)shine('232,255,122',P2[0],P2[1],3.5,.6);ctx.fillStyle=LC.ant;ball(P2,1.05);ctx.fill()}});
  run(L);if(A.stars>0)stars(P(X.T([0,0,Z0+10])),6,A.stars);ctx.restore()}
reg('lucciola',{n:'Lucciola',g:'eroi',an:['idle','walk','attack','happy','hit'],dur:{...PD,hit:.6},lab:{walk:'Vola',attack:'Scintilla',happy:'Cura'},old:oldPet('lucciola')},lucciola);

// ------------------------------------------------------------------ DRAGHETTO: a little red-orange dragon with a cream belly, a round head with two
// yellow horns, big eyes, little bat wings, a tail ending in a yellow arrow, yellow claws. It flies beside the hero; the attack opens its
// mouth and breathes a short flame (the fire on the floor is the game's); happy: little pink hearts
const DC={body:'#e5582e',belly:'#ffd8a0',horn:'#ffd86b',wing:'#d9442e',wingB:'#a8342a',claw:'#ffd86b'};
function draghetto(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU,Z0=16;
  const A={B:[0,0,2.4*Math.sin(ph)],lean:0,roll:0,s:0,yaw:0,flap:Math.sin(ph*4),blink:1,shut:0,open:0,fire:-1,hearts:-1,stars:0,tail:Math.sin(ph)};
  if(anim==='walk'){A.B=[0,0,1.8*Math.sin(ph*2)];A.lean=.2;A.flap=Math.sin(ph*6);A.tail=Math.sin(ph*2)}
  else if(anim==='attack'){const k=p<.3?ez(p/.3):1;A.lean=keys([[0,0],[.3,-.18],[.38,.14],[.75,.14],[1,0]],p);A.open=p>.25&&p<.8?1:0;A.fire=p>.3&&p<.8?(p-.3)/.5:-1;A.flap=Math.sin(ph*2)}
  else if(anim==='happy'){A.hearts=p;A.B=[0,0,2.8*Math.sin(ph*2)];A.roll=.12*Math.sin(ph*2);A.open=1}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-3*kb,0,1.5*kb];A.lean=-.35*kb;A.roll=.1*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0}
  else{A.yaw=look(p,.35);A.blink=blink(p,.45,.07)}
  const X=frame(A,Z0),Cb=[-1,0,Z0],Rb=[8,6.4,6.2],Hc=[6.4,0,Z0+6],Rh=5.6,dT=D(Cb);
  floor(V0,x,y,sc,A.B,9,3.6,.22,Z0);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  // the wings: two little bat wings on the back, beating; the draw order is the body at rest (dT is its place, every part an offset from it)
  const WG=[[1,1.6],[12,10.6],[9.4,2.6],[14,1.6],[8.2,-1.8],[3,-2]];
  for(const sd of[-1,1]){const th=.6*A.flap,Sd=nrm([-.55,sd*Math.cos(th),Math.sin(th)+.25]),U0=[0,-sd*Math.sin(th),Math.cos(th)],U=nrm(sub(U0,mul(Sd,dot(U0,Sd)))),sh=[-1,sd*3,Z0+4.4];
    const at=(u,w)=>X.T(add(sh,add(mul(Sd,u),mul(U,w)))),n=nrm(X.Rd(cross(Sd,U)));
    L.add(D(add(sh,add(mul(nrm([-.55,sd,.25]),6),[0,0,2])))<dT?dT-1:dT+1.5,()=>{const pts=WG.map(([u,w])=>P(at(u,w))),f=F(n)*sd;poly(pts);ctx.fillStyle=softBox(bbox(pts),f>=0?DC.wing:DC.wingB,.2,.25);ctx.fill();ink(1.8);ctx.stroke();
      ctx.strokeStyle='rgba(60,10,6,.4)';ctx.lineWidth=.9;const s0=P(at(1.4,0));seg(s0,pts[1]);ctx.stroke();seg(s0,pts[3]);ctx.stroke()})}
  // the tail: from the back of the body down and back, swinging, with a yellow arrow at its end
  {const tp=[0,.33,.66,1].map(k=>X.T([-6-k*9,A.tail*2.4*k*k,Z0-1.5-k*3+k*k*2])),tip=tp[3],dir=nrm(sub(tip,tp[2])),side=nrm(cross(dir,[0,0,1]));
    L.add(dT+D(sub([-10,0,Z0-3],Cb)),()=>{chain(V0,tp,[3,2.4,1.7,1.1],DC.body,{rim:.2});const a=P(add(tip,mul(dir,3.6))),b=P(add(tip,mul(side,2.2))),c=P(add(tip,mul(side,-2.2)));ctx.fillStyle=DC.horn;ink(1.4);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath();ctx.fill();ctx.stroke()})}
  // the claws under the belly
  for(const sd of[-1,1]){const c=X.T([1.5,sd*2.6,Z0-5.6]);L.add(dT-.5,()=>sball(V0,c,1.5,DC.claw,{lw:1.4,rim:.15}))}
  // the body: an egg with the cream belly in front
  L.add(dT,()=>{const hp=vol(V0,ellPts(Cb,Rb,null,6,18).map(X.T),DC.body,{kl:.18,kd:.3});ctx.save();poly(hp);ctx.clip();
    spot(V0,X.T(ellAt(Cb,Rb,null,nrm([.75,0,-.6]))),X.Rd(ellN(Rb,null,nrm([.75,0,-.6]))),5.4,DC.belly,{v0:-.2,N:18});
    for(const z of[-.3,.1])spot(V0,X.T(ellAt(Cb,Rb,null,nrm([.8,0,z-.45]))),X.Rd(ellN(Rb,null,nrm([.8,0,z-.45]))),.01,DC.belly);ctx.restore()});
  // the head with the horns, the eyes, the mouth; the flame when it breathes fire
  for(const sd of[-1,1]){const b=X.T(add(Hc,mul(nrm([-.4,sd*.5,.75]),Rh*.85))),d=nrm(X.Rd([-.55,sd*.3,1])),sv=nrm(X.Rd([1,0,0]));L.add(dT+D(sub(Hc,Cb))+(F(0,sd,0)>.3?.5:-.5),()=>leaf(V0,b,d,sv,5.6,1.7,DC.horn,{tip:0,round:.5,kl:.3,kd:.15}))}
  L.add(dT+D(sub(Hc,Cb)),()=>{const q=sball(V0,X.T(Hc),Rh,DC.body),at=m=>({q:P(X.T(add(Hc,mul(m,Rh*.97)))),v:F(X.Rd(m))});
    eyes(null,q,Rh,{at,dir:[1,.42,.2],kind:'white',col:'#1b1612',rx:1.7,ry:1.9,shut:A.shut,blink:A.blink,lw:.8,a:.58,b:.74,gap:.3});
    if(A.open)mouth(null,q,Rh,[1,0,-.3],{at,kind:'open',w:2.2,h:1.6,open:1,dark:'#5a1f1f',tongue:'#e07a8a'});else mouth(null,q,Rh,[1,0,-.28],{at,kind:'smile',w:1.5,bow:.9})});
  if(A.fire>=0&&!o.noFx)L.add(dT+D(sub(add(Hc,[8,0,0]),Cb))+1.5,()=>{const k=A.fire,m=X.T(add(Hc,[Rh*.9,0,-1.5])),dir=nrm(X.Rd([1,0,-.15]));
    for(let i=5;i>=0;i--){const u=((k*3+i/6)%1),c=add(m,mul(dir,2+u*16)),q=P(c),r0=1.6+u*4.2;ctx.fillStyle=`rgba(255,${(220-u*140)|0},${(90-u*60)|0},${((1-u)*.85*Math.min(1,k*8,(1-k)*8)).toFixed(3)})`;ball([q[0],q[1]-u*2],r0);ctx.fill()}
    const q=P(m);shine('255,140,50',q[0],q[1],12,.6*Math.min(1,k*8,(1-k)*8))});
  if(A.hearts>=0)L.add(dT+20,()=>{for(let i=0;i<2;i++){const u=(A.hearts*1.4+i*.5)%1,q=P(X.T(add(Hc,[0,(i?3:-3),6+u*12])));ctx.save();ctx.globalAlpha*=Math.sin(u*Math.PI);ctx.fillStyle='#ff6a8a';ink(1);
    ctx.beginPath();ctx.moveTo(q[0],q[1]+1.6);ctx.bezierCurveTo(q[0]-3,q[1]-.6,q[0]-1.6,q[1]-3,q[0],q[1]-1.2);ctx.bezierCurveTo(q[0]+1.6,q[1]-3,q[0]+3,q[1]-.6,q[0],q[1]+1.6);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}});
  run(L);if(A.stars>0)stars(P(X.T(add(Hc,[0,0,8]))),7,A.stars);ctx.restore()}
reg('draghetto',{n:'Draghetto',g:'eroi',an:['idle','walk','attack','happy','hit'],dur:{...PD,hit:.6},lab:{walk:'Vola',attack:'Fiammata',happy:'Felice'},old:oldPet('draghetto')},draghetto);

// ------------------------------------------------------------------ IL MERCANTE: the merchant of the game's events (MERCHANT): a purple robe with a
// golden belt, a dark hood with its point, golden eyes, a staff with a golden orb; in front of him his red rug with a golden border, three
// potions (red, blue, green) and a wooden crate beside him
const MST={armor:'none',quiver:false,strap:false,blush:false,sc:1.08,body:'#5a3f7a',hood:'#3a2a52',skin:'#e8c0a0',foot:'#3a2a1d',held:'scettro',eyeCol:'#ffc93c',eyes:'#ffc93c',belt:'#8a5a20',hoodTip:true};
function potion(V0,c,col,k){const{P}=V0,q=P(c);ink(1.4);ctx.fillStyle=softBall(q,3.2*k,col,.3,.3);ball(q,3.2*k);ctx.fill();ctx.stroke();const n=P(add(c,[0,0,3.6*k]));ctx.fillStyle='#c9cfd6';ctx.fillRect(n[0]-1.3*k,n[1]-1.6*k,2.6*k,2.4*k);ctx.strokeRect(n[0]-1.3*k,n[1]-1.6*k,2.6*k,2.4*k);
  ctx.fillStyle='rgba(255,255,255,.6)';ball([q[0]-1*k,q[1]-1.1*k],.9*k);ctx.fill()}
function mercante(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const k=sc*MST.sc,V0=V(face),{P,D}=V0;
  // the rug on the floor (flat, round) and the things on it: behind him first, then him, then the ones in front
  {const pts=[],pin=[];for(let i=0;i<28;i++){const a=i/28*TAU;pts.push(P([10+Math.cos(a)*23,Math.sin(a)*34,0]));pin.push(P([10+Math.cos(a)*19.5,Math.sin(a)*29,0]))}
    ctx.save();ctx.translate(x,y);ctx.scale(k,k);ink(2);poly(pts);ctx.fillStyle='#7a2f2a';ctx.fill();ctx.stroke();ctx.strokeStyle='#d9a64a';ctx.lineWidth=1.8;poly(pin);ctx.stroke();ctx.restore()}
  const items=[{c:[12,-17,3.2],f:V0=>potion(V0,[12,-17,3.2],'#e5484d',1)},{c:[18,-8,3.2],f:V0=>potion(V0,[18,-8,3.2],'#4d97ff',1)},{c:[17,19,3.2],f:V0=>potion(V0,[17,19,3.2],'#6cc24a',1)},
    {c:[-6,-17,7],f:V0=>{vol(V0,[[-11,-22,0],[-1,-22,0],[-11,-12,0],[-1,-12,0],[-11,-22,14],[-1,-22,14],[-11,-12,14],[-1,-12,14]],'#6b4a2a',{kl:.2,kd:.3});const a=V0.P([-11,-12,8]),b=V0.P([-1,-12,8]);ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.5;seg(a,b);ctx.stroke()}}];
  const d0=D(0,0,10),draw=list=>{ctx.save();ctx.translate(x,y);ctx.scale(k,k);for(const it of list)it.f(V0);ctx.restore()};
  draw(items.filter(it=>D(it.c)<d0).sort((a,b)=>D(a.c)-D(b.c)));
  EROE.arciere(x,y,face,anim==='magic'?'shoot':anim,p,k,{style:MST,noFx:o.noFx,staffMove:'summon',look:o.look||0});
  draw(items.filter(it=>D(it.c)>=d0).sort((a,b)=>D(a.c)-D(b.c)))}
const oldMerchant=(x,y,face)=>{const s=1;ctx.save();ctx.fillStyle='#7a2f2a';ctx.beginPath();ctx.ellipse(x,y-2,40,14,0,0,TAU);ctx.fill();ctx.strokeStyle='#d9a64a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y-2,34,11,0,0,TAU);ctx.stroke();
  for(const[ox,col] of [[-24,'#e5484d'],[-14,'#4d97ff'],[22,'#6cc24a']]){ink(1.6);ctx.beginPath();ctx.rect(x+ox-3,y-6,6,8);fs(col);ctx.beginPath();ctx.rect(x+ox-1.5,y-9,3,3);fs('#c9cfd6')}
  ink(2.5);ctx.beginPath();ctx.rect(x-22,y-38,16,26);fs('#6b4a2a');ctx.restore();drawRig(x,y-8,face,0,false,MERCHANT,{})};
reg('mercante',{n:'Il Mercante',g:'eroi',an:['idle','magic'],dur:{idle:2.6,magic:1.9},lab:{magic:'Magia'},old:oldMerchant},mercante);
})();
