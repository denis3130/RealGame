// Le creature nuove (punto 41 del piano di Denis, anteprima 47): al posto di Muschietto, che il piano toglie del tutto, tre compagni nuovi
// che stanno bene in tutte e due le modalità. Lo Spiritello della lanterna (un fantasmino di velo verde chiaro, misterioso, con la sua
// lanterna che fa luce), il Corvetto d'ossa (un corvo nero con la maschera di teschio e gli occhi d'ambra: cupo, per il camposanto) e il
// Funghetto (un fungo dal cappello rosso a pois che saltella e soffia spore: fantasy, per la Classica). Fatti col metodo dei compagni di
// eroi.js (C3): uno scheletro 3D, ogni pezzo attaccato al suo punto, mosse che dipendono solo da p: fermo, cammina o vola, attacca,
// felice, colpito. Si disegnano da drawPetSprite (src/js/64-nemici-3d.js) come gli altri compagni.
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,V,ball,seg,run,dk,lt,poly,bbox,softBox,softBall,rimPoly,look,blink,keys,hitK,hop,frame,
  vol,ellPts,ellAt,ellN,sball,chain,leaf,spot,eyes,mouth,cheeks,floor,stars,orb,parts,reg,shine}=C;
const PD={idle:2.4,walk:.6,attack:1,happy:1.2,hit:.6},AN=['idle','walk','attack','happy','hit'];
const now=()=>typeof G!=='undefined'&&G&&G.t!=null?G.t:performance.now()/1000;
// ------------------------------------------------------------------ LO SPIRITELLO DELLA LANTERNA: a little ghost of pale green veil that
// floats; its hem flutters in four soft points; big dark eyes with a point of light, a small round mouth; beside it hangs its iron lantern
// with a green flame. The attack lifts the lantern and the flame flares (the spectral bolt it throws is the game's); happy: it twirls
const SC={veil:'#d6fbe8',veilD:'#8fd8bc',lant:'#3a3d44',flame:'120,255,170'};
function spiritello(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU,Z0=18,r=7.6;
  const A={B:[0,0,2*Math.sin(ph)],lean:0,roll:0,s:0,yaw:0,flut:Math.sin(ph*2),lift:0,flare:0,blink:1,shut:0,open:0,stars:0,spin:0};
  if(anim==='walk'){A.B=[0,0,1.6*Math.sin(ph*2)];A.lean=.22;A.flut=Math.sin(ph*4)}
  else if(anim==='attack'){const k=p<.3?ez(p/.3):p<.6?1:1-ez((p-.6)/.4);A.lift=k;A.flare=p>.28&&p<.7?Math.sin((p-.28)/.42*Math.PI):0;A.lean=keys([[0,0],[.3,-.12],[.4,.12],[1,0]],p);A.open=A.flare>.2?1:0}
  else if(anim==='happy'){A.spin=ez(p)*TAU;A.B=[0,0,2.6*Math.sin(p*Math.PI)];A.open=1;A.flut=Math.sin(ph*3)}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-3*kb,0,1.2*kb];A.lean=-.3*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0}
  else{A.yaw=look(p,.4);A.blink=blink(p,.55,.07)}
  const X=frame({...A,yaw:A.yaw+A.spin},Z0),Cb=[0,0,Z0+r*.35],dT=D(X.T(Cb));
  floor(V0,x,y,sc,A.B,7,2.8,.18,Z0);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  // the soft green light under it
  if(!LOWFX){const q=P(X.T([0,0,Z0-4]));shine(SC.flame,q[0],q[1],14,.22)}
  // the body: a dome of veil and its hem in four soft points that flutter (a body of revolution: the outline is the same from every side)
  L.add(dT,()=>{const q=P(X.T(Cb)),sx=Math.sqrt(1/Math.max(.5,1+A.s)),pts=[];
    for(let i=0;i<=12;i++){const a=Math.PI+i/12*Math.PI;pts.push([q[0]+Math.cos(a)*r*sx,q[1]+Math.sin(a)*r])}
    const by=q[1]+r*1.35;for(let i=0;i<=16;i++){const k=i/16,xx=q[0]+r*sx*(1-2*k),w=Math.sin(k*Math.PI*4+A.flut*1.2+face);pts.push([xx,by+(w>0?w*2.4:w*.8)-Math.sin(k*Math.PI)*1.2])}
    ctx.lineJoin='round';C.smooth(pts);ctx.fillStyle=softBall(q,r*1.3,SC.veil,.12,.34);ctx.fill();ink(2.2);ctx.stroke();
    ctx.save();C.smooth(pts);ctx.clip();const g=ctx.createLinearGradient(0,q[1],0,by+3);g.addColorStop(0,'rgba(143,216,188,0)');g.addColorStop(1,'rgba(110,190,160,.55)');ctx.fillStyle=g;ctx.fillRect(q[0]-r*2,q[1],r*4,r*2);
    const at=m=>({q:P(X.T(add(Cb,mul(m,r*.97)))),v:F(X.Rd(m))});
    eyes(null,q,r,{at,dir:[1,.36,.12],kind:'dark',rx:2.1,ry:2.7,blink:A.blink,shut:A.shut,lr:.65});
    if(A.open)mouth(null,q,r,[1,0,-.28],{at,kind:'open',w:1.3,h:1.5,open:1,dark:'#2a3a34',tongue:'#2a3a34'});else mouth(null,q,r,[1,0,-.26],{at,kind:'o',w:.9,h:.9});
    ctx.restore();rimPoly(pts,.32)});
  // the lantern on its right, hanging from a wisp of veil; lifted when it attacks
  {const hk=X.T([1.4,10.4,Z0+1.5+A.lift*6]),lc=add(hk,[0,0,-4.6]),sd=F(X.Rd([0,1,0]))>0?1:-1;
    L.add(dT+D(sub(X.T([1.4,10.4,Z0]),X.T(Cb)))+(sd>0?.3:-.3),()=>{const a=P(X.T([0,6.4,Z0+2.6])),b=P(hk),c=P(lc);ctx.strokeStyle='rgba(214,251,232,.85)';ctx.lineWidth=1.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo((a[0]+b[0])/2,b[1]-2,b[0],b[1]);ctx.stroke();
      ctx.strokeStyle=INK;ctx.lineWidth=.9;seg(b,[c[0],c[1]-4.2]);ctx.stroke();
      const fl=.85+.15*Math.sin(now()*13)+A.flare*.8;if(!LOWFX)shine(SC.flame,c[0],c[1],8+7*fl,.5+.3*A.flare);
      ink(1.4);ctx.fillStyle='rgba(30,60,44,.7)';ctx.beginPath();ctx.roundRect(c[0]-2.4,c[1]-3.4,4.8,6.4,1.2);ctx.fill();ctx.stroke();
      ctx.fillStyle=`rgba(190,255,210,${.75})`;ctx.beginPath();ctx.ellipse(c[0],c[1]+.3,1.1,1.9*fl,0,0,TAU);ctx.fill();
      ctx.fillStyle=SC.lant;ctx.beginPath();ctx.moveTo(c[0]-3,c[1]-3.4);ctx.lineTo(c[0]+3,c[1]-3.4);ctx.lineTo(c[0],c[1]-5.6);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillRect(c[0]-2.8,c[1]+3,5.6,1.2)})}
  run(L);if(A.stars>0)stars(P(X.T([0,0,Z0+r*2+4])),6,A.stars);ctx.restore()}
reg('spiritello',{n:'Spiritello',g:'eroi',an:AN,dur:PD,lab:{walk:'Fluttua',attack:'Fiamma verde',happy:'Piroetta'}},spiritello);
// ------------------------------------------------------------------ IL CORVETTO D'OSSA: a little black crow with a mask of bone (the skull with
// the long beak), amber eyes that glow in the sockets, dark wings with ragged feathers, a fan of tail feathers, bony claws. It flies beside
// the hero, now and then it tilts its head too far (as the zombies do); the attack dives and pecks; happy: it caws with the beak open
const KC={body:'#24222a',bodyL:'#3a3846',bone:'#e8e0cc',boneD:'#b8ab8c',eye:'255,176,60',claw:'#d8ccb0'};
function corvetto(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU,Z0=17;
  const A={B:[0,0,2*Math.sin(ph)],lean:0,roll:0,s:0,yaw:0,flap:Math.sin(ph*3),tilt:0,open:0,glow:.7+.3*Math.sin(ph*2),stars:0};
  if(anim==='walk'){A.B=[0,0,1.8*Math.sin(ph*2)];A.lean=.25;A.flap=Math.sin(ph*6)}
  else if(anim==='attack'){A.lean=keys([[0,0],[.3,-.2],[.45,.55],[.6,.55],[.8,0],[1,0]],p);A.B=[keys([[0,0],[.3,-2],[.45,5],[.6,5],[.8,0],[1,0]],p),0,keys([[0,0],[.3,2],[.45,-3],[.6,-3],[1,0]],p)];A.flap=Math.sin(ph*4);A.open=p>.4&&p<.62?1:0;A.glow=1.2}
  else if(anim==='happy'){A.open=Math.sin(ph*3)>0?1:0;A.B=[0,0,2.4*Math.abs(Math.sin(ph*2))];A.flap=Math.sin(ph*5);A.tilt=.25*Math.sin(ph)}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-3*kb,0,1.5*kb];A.lean=-.4*kb;A.stars=p<.75?1-p/.75:0}
  else{A.yaw=look(p,.35);const k=p>.55&&p<.8?Math.sin((p-.55)/.25*Math.PI):0;A.tilt=.55*k;A.flap=.35*Math.sin(ph*2)}
  const X=frame(A,Z0),Cb=[0,0,Z0],Rb=[6.4,4.6,4.8],Hc=[5,0,Z0+4.8],Rh=4.4,dT=D(X.T(Cb));
  floor(V0,x,y,sc,A.B,7,2.8,.2,Z0);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  // the tail: a fan of three ragged feathers
  for(let i=-1;i<=1;i++){const b=X.T([-4.6,i*1,Z0-.4]),d=nrm(X.Rd([-1,i*.35,.1])),sv=nrm(X.Rd([0,1,0]));L.add(dT-1+i*.01,()=>leaf(V0,b,d,sv,7.4,1.7,i?KC.body:KC.bodyL,{back:KC.body,round:.6,tip:.3,lw:1.6}))}
  // the wings: dark, with feather points, beating
  for(const sd of[-1,1]){const th=.75*A.flap,b=X.T([.4,sd*3.6,Z0+1.6]),d=nrm(X.Rd([-.45,sd*Math.cos(th),Math.sin(th)+.2])),sv=nrm(X.Rd([1,0,.1]));
    L.add(dT+(F(0,sd,0)>.2?1.2:-1.2),()=>{const pts=leaf(V0,b,d,sv,10.5,3.6,KC.body,{back:'#1a1820',round:.55,tip:.4,lw:1.8});
      if(pts&&pts.length>8){ctx.strokeStyle='rgba(120,116,140,.45)';ctx.lineWidth=.7;for(const k of[.4,.6,.8]){const i0=Math.round(k*10),q=pts[i0];if(q){ctx.beginPath();ctx.moveTo(P(b)[0],P(b)[1]);ctx.lineTo(q[0],q[1]);ctx.stroke()}}}})}
  // the claws under the body
  for(const sd of[-1,1]){const a=X.T([1,sd*1.6,Z0-4]),b=X.T([1.6,sd*1.8,Z0-7]);L.add(dT-.6,()=>{const A2=P(a),B2=P(b);ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.lineCap='round';seg(A2,B2);ctx.stroke();ctx.strokeStyle=KC.claw;ctx.lineWidth=1;seg(A2,B2);ctx.stroke()})}
  // the body
  L.add(dT,()=>{const hp=vol(V0,ellPts(Cb,Rb,null,6,16).map(X.T),KC.body,{kl:.22,kd:.3});ctx.save();poly(hp);ctx.clip();
    spot(V0,X.T(ellAt(Cb,Rb,null,nrm([.8,0,-.3]))),X.Rd(ellN(Rb,null,nrm([.8,0,-.3]))),3.4,'rgba(80,76,96,.5)',{v0:-.1});ctx.restore()});
  // the head: the dark crown behind, the bone mask in front with the beak, the amber eyes in the sockets; it tilts too far now and then
  const hX={T:q=>X.T(add(Hc,rotT(sub(q,Hc),A.tilt))),Rd:v=>X.Rd(rotT(v,A.tilt))};
  L.add(dT+D(sub(X.T(Hc),X.T(Cb)))+.1,()=>{const q=sball(V0,hX.T(Hc),Rh,KC.body,{rim:.2}),at=m=>({q:P(hX.T(add(Hc,mul(m,Rh*.98)))),v:F(hX.Rd(m))});
    // the mask: a pale disc on the front of the head
    const mf=at(nrm([1,0,.05]));if(mf.v>.05){ctx.save();ctx.globalAlpha*=cl(mf.v*3,0,1);ball(mf.q,Rh*.95*Math.max(.55,mf.v));ctx.fillStyle=softBall(mf.q,Rh*.95,KC.bone,.2,.25);ctx.fill();ink(1.2);ctx.stroke();ctx.restore()}
    for(const sd of[-1,1]){const e=at(nrm([1,sd*.42,.18]));if(e.v<.1)continue;ctx.fillStyle='#120e14';ball(e.q,1.45);ctx.fill();if(!LOWFX)shine(KC.eye,e.q[0],e.q[1],3.4,.6*A.glow);ctx.fillStyle=`rgb(255,${(150+40*A.glow)|0},60)`;ball(e.q,.7);ctx.fill()}});
  // the beak: two bone halves, open when it pecks or caws
  {const bA=hX.T(add(Hc,[Rh*.9,0,-.4])),dir=nrm(hX.Rd([1,0,-.25])),up=nrm(hX.Rd([0,0,1])),sdv=nrm(hX.Rd([0,1,0]));
    L.add(dT+D(sub(add(X.T(Hc),mul(dir,5)),X.T(Cb)))+.2,()=>{const tip=add(bA,mul(dir,6.2)),op=A.open*.9;
      for(const s of[1,-1]){const t2=add(tip,mul(up,s*op*1.2)),a=P(add(bA,mul(up,s*1.1))),b=P(add(bA,mul(sdv,1.3))),c=P(add(bA,mul(sdv,-1.3))),T2=P(t2);
        ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(T2[0],T2[1]);ctx.lineTo(c[0],c[1]);ctx.closePath();ctx.fillStyle=s>0?KC.bone:KC.boneD;ctx.fill();ink(1.2);ctx.stroke()}})}
  run(L);if(A.stars>0)stars(P(X.T(add(Hc,[0,0,6]))),6,A.stars);ctx.restore()}
function rotT(v,a){const c=Math.cos(a),s=Math.sin(a);return[v[0],v[1]*c-v[2]*s,v[1]*s+v[2]*c]}
reg('corvetto',{n:"Corvetto d'ossa",g:'eroi',an:AN,dur:PD,lab:{walk:'Vola',attack:'Beccata',happy:'Gracchia'}},corvetto);
// ------------------------------------------------------------------ IL FUNGHETTO: a mushroom that hops: a cream stem with the face, a big round red
// cap with white spots that sits a little crooked, two little feet. The attack squashes it and the cap puffs a cloud of glowing spores (the
// spore it throws is the game's); happy: it spins and the spots sparkle
const FC={stem:'#f4e8d0',stemD:'#d8c8a8',cap:'#e04a3a',capD:'#a82a20',dot:'#fff6ea',foot:'#c8b090',spore:'190,255,140'};
function funghetto(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU;
  const A={B:[0,0,0],lean:0,roll:0,s:0,yaw:0,capZ:0,capT:.12,blink:1,shut:0,open:0,puff:-1,stars:0,spin:0};
  if(anim==='walk'){const h=hop(p,.55);A.B=[0,0,h.z*5];A.s=h.s*1.5;A.lean=.1;A.capT=.12+.08*Math.sin(ph)}
  else if(anim==='attack'){A.s=keys([[0,0],[.3,-.22],[.4,.15],[.55,0],[1,0]],p);A.capZ=keys([[0,0],[.3,-1.4],[.4,2.6],[.6,1],[1,0]],p);A.puff=p>.35?(p-.35)/.65:-1;A.open=p>.35&&p<.7?1:0}
  else if(anim==='happy'){const h=hop(p,.5);A.B=[0,0,h.z*6];A.spin=ez(p)*TAU;A.open=1}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-3*kb,0,.4*kb];A.lean=-.3*kb;A.s=-.14*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;A.capT=.12+.2*kb}
  else{A.s=.035*Math.sin(ph);A.yaw=look(p,.4);A.blink=blink(p,.6,.07);A.capZ=.4*Math.sin(ph)}
  const X=frame({...A,yaw:A.yaw+A.spin},0),Cs=[0,0,6],Rs=[4.6,4.6,6],Cc=[0,0,13+A.capZ],Rc=[9.4,9.4,5.4],dT=D(X.T(Cs));
  floor(V0,x,y,sc,A.B,9,3.6,.28,A.B[2]);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  for(const sd of[-1,1]){const f=[1.2,sd*2.8,1.4];L.add(dT-50+D(X.T(f))*.01,()=>sball(V0,add(X.T(f),[0,0,0]),2.2,FC.foot,{rim:.15,lw:2}))}
  // the stem with the face
  L.add(dT,()=>{const hp=vol(V0,ellPts(Cs,Rs,null,6,16).map(X.T),FC.stem,{kl:.15,kd:.26});ctx.save();poly(hp);ctx.clip();
    const q=P(X.T(Cs)),at=m=>({q:P(X.T(ellAt(Cs,Rs,null,m))),v:F(X.Rd(ellN(Rs,null,m)))});
    eyes(null,q,4.6,{at,dir:[1,.38,.18],kind:'dark',rx:1.6,ry:2,blink:A.blink,shut:A.shut,lr:.6});
    cheeks(null,q,4.6,null,{at,dir:[1,.62,-.12],rgb:'255,140,150',al:.6,rx:1.3,ry:.8});
    if(A.open)mouth(null,q,4.6,[1,0,-.2],{at,kind:'open',w:1.4,h:1.2,open:1,dark:'#5a2a1a',tongue:'#e07a8a'});else mouth(null,q,4.6,[1,0,-.18],{at,kind:'smile',w:1.2,bow:.9});
    ctx.restore()});
  // the cap: a round dome, a little crooked, with white spots; it lifts and puffs when it attacks
  {const capF={u:nrm([Math.cos(A.capT*0),0,0]),v:[0,1,0],w:nrm([-Math.sin(A.capT),0,Math.cos(A.capT)])};capF.u=nrm(cross(capF.v,capF.w));
    L.add(dT+1,()=>{const pts=ellPts(Cc,Rc,capF,6,20,-.15).map(X.T),hp=vol(V0,pts,FC.cap,{kl:.22,kd:.3});ctx.save();poly(hp);ctx.clip();
      // the underside (gills) where it turns toward us, darker
      for(const[a,e,r0] of[[0,.55,1.9],[1.2,.5,1.5],[-1.3,.45,1.6],[2.5,.4,1.6],[-2.4,.6,1.7],[.6,.95,1.4],[-.7,.9,1.2],[3.14,.85,1.3],[1.9,.85,1.1],[-1.9,.85,1.2]]){
        const m=[Math.cos(a)*Math.cos(e),Math.sin(a)*Math.cos(e),Math.sin(e)];spot(V0,X.T(ellAt(Cc,Rc,capF,m)),X.Rd(ellN(Rc,capF,m)),r0,FC.dot,{v0:.05,lw:.6,ink:'rgba(120,40,30,.5)'})}
      ctx.restore()})}
  // the spores: a cloud of glowing dots that rises from the cap
  if(A.puff>=0)L.add(dT+5,()=>{const k=A.puff;for(let i=0;i<9;i++){const u=(k+i/9)%1,a=i*2.3+k*3,c=X.T([Math.cos(a)*(4+u*9),Math.sin(a)*(4+u*9),16+u*10]),q=P(c);
    ctx.fillStyle=`rgba(${FC.spore},${(1-u)*.85})`;ball(q,1.1+u*1.4);ctx.fill();if(!LOWFX)shine(FC.spore,q[0],q[1],4,.3*(1-u))}});
  if(anim==='happy'&&!LOWFX)L.add(dT+5,()=>{for(let i=0;i<4;i++){const a=i*TAU/4+p*6,q=P(X.T([Math.cos(a)*8,Math.sin(a)*8,15+3*Math.sin(p*9+i)]));shine('255,250,200',q[0],q[1],3,.7)}});
  run(L);if(A.stars>0)stars(P(X.T([0,0,22])),7,A.stars);ctx.restore()}
reg('funghetto',{n:'Funghetto',g:'eroi',an:AN,dur:PD,lab:{walk:'Saltella',attack:'Spore',happy:'Giravolta'}},funghetto);
})();
