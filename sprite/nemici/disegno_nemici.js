// Nemici della modalità classica rifatti con il metodo dello Zombie spaventapasseri (sprite/mostri/disegno_mostri.js, da cui prende
// la cassetta degli attrezzi CR._rig): scheletro 3D proiettato con V(face), arti a due ossa con la cinematica inversa, ordine di
// disegno deciso dalla posa di riposo, pezzi che girano per conto loro con Vat, ogni mossa dipende solo da p (0..1).
// Dipinti come lo Zombie della lanterna (tre toni, bordo illuminato, pieghe, bagliori) e più inquietanti: occhi che brillano e
// pulsano come un respiro, bocche troppo larghe con denti storti, dita lunghe, crepe e cuciture; da fermi restano immobili e poi
// girano di colpo la testa. Stessi personaggi di prima (goblin con l'arco, scheletro con balestra e scudo, slime, pipistrello).
// Firma: NE.<nome>(x, y, face, anim, p, sc[, o]); anim: 'idle' | 'walk' | 'attack'. Va eseguito dopo disegno_mostri.js.
window.NE=(()=>{
const R=CR._rig,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,Vat,mix,farK,ik,stepper,NOSTEP,shine,ball,seg,tri,hull,limb,on,neck,hand,fist,bone,claw,rag,leg,trunk,wa,rim,shadeLimb,glowTop,folds,run,ZC,zArm}=R;
const PULSE=(t,k)=>.7+.3*Math.sin(t*3.1+(k||0));// the breathing of every glowing eye
// a glowing eye: the pupil ball with its halo and a white point; k = how much it faces us (fades out as it turns away)
function gEye(q,r,col,rgb,k,t){if(k<=0)return;shine(rgb,q[0],q[1],r*4.2,.45*k*PULSE(t));ctx.fillStyle=col;ball(q,r*k+.2);ctx.fill();ctx.fillStyle='#fff';ball([q[0]-r*.35,q[1]-r*.35],r*.36*k+.1);ctx.fill()}
// a row of crooked teeth along a mouth (screen centre q, half width w, y of the gum, pointing down (dir 1) or up (-1))
function teeth(q,w,gy,n,h,dir,col){ctx.fillStyle=col||ZC.bone;ctx.strokeStyle=INK;ctx.lineWidth=.8;for(let i=0;i<n;i++){const xx=q[0]-w+(i+.5)*(2*w/n),hh=h*(.6+.5*Math.abs(Math.sin(i*2.7)));tri(xx,gy,xx+(i%2?.4:-.3),gy+dir*hh,.8)}}
// the sudden turn of the head when standing still: looks away slowly, then snaps toward you and stays
const snap=(p,a)=>p<.55?a*(.6+.4*Math.sin(p*TAU))*1:p<.62?a*(1-ez((p-.55)/.07)):p<.9?0:a*ez((p-.9)/.1);
// a sudden tremor at a moment of the cycle (p0..p0+len), decaying
const tremor=(p,p0,len)=>p>p0&&p<p0+len?Math.sin((p-p0)*220)*(1-(p-p0)/len):0;

// ------------------------------------------------------------------ GOBLIN: hunched little archer under a torn hood
const GC={skin:'#7fae4a',skinD:'#5a8233',skinF:'#4a6a2a',hood:'#8c3a32',hoodD:'#5a221e',hoodF:'#3f1613',tunic:'#a8453a',tunicD:'#742c24',tunicF:'#56211b',belt:'#4a3626',
  eye:'#ff3b2f',eyeRgb:'255,70,50',nail:'#1e1a14',bow:'#6b4a2a',bowD:'#3f2a16',str:'#e8e0cc',teeth:'#e6dcc0',mouth:'#2a0c0c',patch:'#5a5a62'};
function gobHead(V0,Hc,Rh,ph,o,t){const{P,F,c}=V0,h=P(Hc),at=Rh*.95;
  // the ears poke out of the hood: long, torn, pointing back
  const ear=sd=>{const b=add(Hc,[-.5,sd*Rh*.8,.5]),tp=add(Hc,[-Rh*1.1,sd*Rh*1.9,Rh*.9]),m=add(Hc,[-Rh*.3,sd*Rh*1.35,Rh*.75]);
    ink(1.8);ctx.fillStyle=o.skin;ctx.beginPath();const B=P(b),T=P(tp),M=P(m),B2=P(add(b,[0,0,Rh*.55]));ctx.moveTo(B[0],B[1]);ctx.quadraticCurveTo(M[0]+1,M[1]+2,T[0],T[1]);ctx.quadraticCurveTo(M[0]-1,M[1]-1,B2[0],B2[1]);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(60,20,20,.35)';ctx.beginPath();ctx.moveTo((B[0]+B2[0])/2,(B[1]+B2[1])/2);ctx.lineTo(T[0]-(T[0]-B[0])*.25,T[1]-(T[1]-B[1])*.25+1);ctx.lineTo(B2[0],B2[1]);ctx.closePath();ctx.fill();
    ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(T[0]-(T[0]-M[0])*.35,T[1]-(T[1]-M[1])*.35);ctx.lineTo(T[0]-(T[0]-M[0])*.3+1.5,T[1]-(T[1]-M[1])*.3+1.5);ctx.stroke()};
  for(const sd of[-1,1])if(F(0,sd,0)<0)ear(sd);
  // the hood: a ball of cloth over the head with the front cut away, a crooked tip bent back, a patch sewn on
  ink(2.4);ball(h,Rh+1.4);ctx.fillStyle=o.hood;ctx.fill();ctx.stroke();
  ctx.save();ball(h,Rh+.4);ctx.clip();ctx.fillStyle=GC.hoodD;ell(h[0]+Rh*.45,h[1]+Rh*.7,Rh*1.2,Rh*.7);ctx.fill();ctx.fillStyle=GC.hoodF;ell(h[0]+Rh*.9,h[1]+Rh*.1,Rh*.5,Rh*1.1);ctx.fill();glowTop(h,Rh+1,.2);
  on(V0,Hc,at,[-.4,.75,.35],.05,q=>{ink(1);ctx.fillStyle=GC.patch;ctx.fillRect(q[0]-2.4,q[1]-2,4.8,4);ctx.strokeRect(q[0]-2.4,q[1]-2,4.8,4);ctx.beginPath();for(let i=0;i<3;i++){ctx.moveTo(q[0]-2.4,q[1]-1.5+i*1.5);ctx.lineTo(q[0]-3.2,q[1]-1+i*1.5)}ctx.stroke()});
  ctx.restore();rim(h,Rh+1.4,h,Rh+1.4,.3);
  {const tp=P(add(Hc,[-Rh*.9,0,Rh*1.9])),m=P(add(Hc,[-Rh*.2,0,Rh*1.35]));ink(2.2);ctx.fillStyle=o.hood;ctx.beginPath();ctx.moveTo(h[0]-Rh*.55,h[1]-Rh*.85);ctx.quadraticCurveTo(m[0]-2,m[1],tp[0],tp[1]);ctx.quadraticCurveTo(m[0]+2,m[1]+1,h[0]+Rh*.5,h[1]-Rh*.9);ctx.fill();ctx.stroke()}
  // the face in the opening of the hood: sickly skin in the dark, a long hooked nose, a grin too wide for the face
  on(V0,Hc,Rh*.45,[1,0,-.15],-.05,(q,v)=>{const k=cl(v*1.6,0,1),w=Rh*.74*Math.max(.3,k),hh=Rh*.72;ink(1.6);ctx.fillStyle='#120c0c';ctx.beginPath();ctx.ellipse(q[0],q[1],w+1,hh+1,0,0,TAU);ctx.fill();
    ctx.fillStyle=o.skin;ctx.beginPath();ctx.ellipse(q[0],q[1]+.4,w,hh,0,0,TAU);ctx.fill();ctx.save();ctx.clip();ctx.fillStyle=GC.skinD;ctx.beginPath();ctx.ellipse(q[0]+w*.35,q[1]+hh*.55,w,hh*.7,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(q[0],q[1]-hh*.55,w*1.1,hh*.4,0,0,TAU);ctx.fill();ctx.restore();
    // eyes: red, too far apart, pulsing
    for(const sd of[-1,1]){const ex=q[0]-sd*w*.52*c*0-sd*w*.5,ey=q[1]-hh*.18;ctx.fillStyle='#1a0808';ball([ex,ey],Rh*.19);ctx.fill();gEye([ex,ey],Rh*.13,GC.eye,GC.eyeRgb,k,t)}
    // the grin: crooked teeth top and bottom, a thread of drool
    const my=q[1]+hh*.42,mw=w*.78,op=o.open||0;ink(1.4);ctx.fillStyle=GC.mouth;ctx.beginPath();ctx.moveTo(q[0]-mw,my-1);ctx.quadraticCurveTo(q[0],my+2+op*4,q[0]+mw,my-1);ctx.quadraticCurveTo(q[0],my-2.2-op*1.5,q[0]-mw,my-1);ctx.fill();ctx.stroke();
    ctx.save();ctx.beginPath();ctx.moveTo(q[0]-mw,my-1);ctx.quadraticCurveTo(q[0],my+2+op*4,q[0]+mw,my-1);ctx.quadraticCurveTo(q[0],my-2.2-op*1.5,q[0]-mw,my-1);ctx.clip();teeth([q[0],my],mw*.85,my-1.6-op,7,2.2,1,GC.teeth);teeth([q[0],my],mw*.6,my+1.4+op*3.5,4,1.6,-1,GC.teeth);ctx.restore();
    if(k>.5){ctx.strokeStyle='rgba(190,220,140,.6)';ctx.lineWidth=.9;const dr=(ph/TAU+.4)%1;seg([q[0]+mw*.5,my+1.5+op*2],[q[0]+mw*.5,my+3+op*2+dr*3]);ctx.stroke()}});
  // the nose: a long hooked cone sticking out of the hood
  {const base=add(Hc,[Rh*.8,0,-Rh*.1]),tip=add(Hc,[Rh*2.15,0,-Rh*.8]),b=P(base),tp=P(tip);const fv=F(1,0,-.3);if(fv>-.45){ctx.save();ctx.globalAlpha=cl((fv+.45)*3,0,1);ink(1.8);ctx.fillStyle=o.skin;hull(b,Rh*.26,tp,Rh*.12);ctx.fill();ctx.stroke();ctx.fillStyle=GC.skinD;ball([tp[0]+.3,tp[1]+.4],Rh*.1);ctx.fill();
    ctx.strokeStyle='rgba(20,14,10,.5)';ctx.lineWidth=.8;ball([tp[0]+.6,tp[1]-.2],Rh*.07);ctx.stroke();ctx.restore()}}
  for(const sd of[-1,1])if(F(0,sd,0)>=0)ear(sd)}
// the bow: an arc in the vertical plane beside the hand (held point hd), bent more when drawn (k), with the string and the nocked arrow
function gobBow(V0,hd,k,aim){const{P}=V0,ad=nrm(aim),bk=mul(ad,-1.2),top=add(add(hd,bk),[0,0,8.5]),bot=add(add(hd,bk),[0,0,-8.5]),mid=add(hd,mul(ad,2.8+k*1.6)),T=P(top),B=P(bot),M=P(mid),H=P(hd);
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=4.6;ctx.beginPath();ctx.moveTo(T[0],T[1]);ctx.quadraticCurveTo(M[0],M[1],B[0],B[1]);ctx.stroke();ctx.strokeStyle=GC.bow;ctx.lineWidth=2.2;ctx.stroke();
  ctx.strokeStyle=wa(.3);ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(T[0]-.6,T[1]);ctx.quadraticCurveTo(M[0]-.8,M[1],B[0]-.6,B[1]);ctx.stroke();
  const S=P(add(hd,mul(ad,-1.2-k*6)));ctx.strokeStyle=GC.str;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(T[0],T[1]);ctx.lineTo(S[0],S[1]);ctx.lineTo(B[0],B[1]);ctx.stroke();
  if(k>.05){const A=P(add(hd,mul(ad,-1.2-k*6))),E=P(add(hd,mul(ad,6.5)));ctx.strokeStyle=INK;ctx.lineWidth=2.6;seg(A,E);ctx.stroke();ctx.strokeStyle='#c9b48a';ctx.lineWidth=1.1;seg(A,E);ctx.stroke();ctx.fillStyle='#8a8a94';ink(1);tri(E[0]-(E[0]-A[0])*.1,E[1]-(E[1]-A[1])*.1,E[0]+(E[0]-A[0])*.12,E[1]+(E[1]-A[1])*.12,1.3)}
  for(const sd of[-1,1]){const w=P(add(hd,[0,0,sd*2.2]));ctx.fillStyle=GC.bowD;ball(w,1.1);ctx.fill()}}
function goblin(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU,walk=anim==='walk',atk=anim==='attack',idle=!walk&&!atk,t=G.t;
  // attack: .0-.42 draws the string back to the cheek and leans back, .42-.5 lets go (the hand recoils), .5-1 lowers the bow
  let draw=0,rel=0,lean=0;if(atk){if(p<.42){draw=ez(p/.42);lean=-draw*1.4}else if(p<.5){const k=(p-.42)/.08;draw=1-k;rel=1-k;lean=-1.4+k*2.4}else{const k=ez((p-.5)/.5);rel=0;lean=1*(1-k);draw=0}}
  // walk: a scurry on bent legs, quick short steps; idle: hunched and still, breathing, then the head snaps round
  const st=stepper(p,.5),fL=walk?st(0,2.6,1.9):NOSTEP,fR=walk?st(.5,2.6,1.9):NOSTEP,bob=walk?Math.abs(Math.sin(ph))*1.1:idle?Math.sin(ph)*.3:0,tr=idle?tremor(p,.6,.08)*.5:0;
  const hunch=2.4,Pv=[lean*.4,0,12.2+bob],Ch=[hunch+lean,0,18.8+bob],hy=idle?snap(p,.7):walk?Math.sin(ph)*.12:0,
    Hc=add(Ch,[2.6-draw*.8+tr,Math.sin(ph*(walk?2:1))*.3,7.2+(walk?Math.cos(ph*2)*.3:0)]),Rh=5.6;
  {const q=P(1,0,0);shadow(x+q[0]*sc,y+q[1]*sc,10*sc,4*sc,.34)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[],dT=D(Ch);
  for(const[sd,f] of[[-1,fL],[1,fR]]){const hip=add(Pv,[0,sd*2.8,-2.2]),foot=[1.2+f.x,sd*4,f.z],k=farK(F(0,sd,0));
    parts.push({d:dT-100+D(hip)*.01,f:()=>{leg(V0,hip,foot,{L1:5.2,L2:5.2,w1:3,w2:2.6,col:mix(GC.skin,GC.skinF,k),colD:'rgba(20,40,10,.35)',shoe:'#3a2616',heel:1.3,toe:3,sr:2.3,pole:[1,0,.1],ank:1.6});
      // long toes with claws
      const fq=P(add(foot,[3.4,sd*.6,0]));ink(.9);ctx.fillStyle=GC.nail;for(let i=-1;i<=1;i++){tri(fq[0]+i*1.2,fq[1],fq[0]+i*1.5,fq[1]+1.6,.6)}}})}
  parts.push({d:dT,f:()=>{trunk(V0,Pv,5.2,Ch,6.8,GC.tunic,GC.tunicD,4,{folds:[-1,-.3,.4,1.1,2.6,3.5],neck:1});
    // the belt with its buckle, a torn patch on the back
    const bq=P(lerp3(Pv,Ch,.3));ctx.strokeStyle=GC.belt;ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(bq[0],bq[1],5.4,2.1,0,0,TAU);ctx.stroke();on(V0,lerp3(Pv,Ch,.3),5.4,[1,0,0],0,q=>{ink(1);ctx.fillStyle='#c9a040';ctx.fillRect(q[0]-1.6,q[1]-1.4,3.2,2.8);ctx.strokeRect(q[0]-1.6,q[1]-1.4,3.2,2.8)});
    on(V0,Ch,6.3,[-1,.3,.1],.1,q=>{ctx.strokeStyle='rgba(20,14,10,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0]-2,q[1]-2.5);ctx.lineTo(q[0]+1.5,q[1]);ctx.lineTo(q[0]-1,q[1]+2.5);ctx.stroke();for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(q[0]-1.5+i*1.2,q[1]-1.8+i*1.6);ctx.lineTo(q[0]-.3+i*1.2,q[1]-2.6+i*1.6);ctx.stroke()}})}});
  // the bow arm (left) holds the bow out in front; the right hand draws the string to the cheek and lets go
  const shL=add(Ch,[0,-5.4,2.4]),shR=add(Ch,[0,5.4,2.4]),bowH=add(Ch,[7.5+draw*3,-6.4+draw*4.2,.5+draw*2.2-lean*.3]),
    strH=atk?lerp3(add(Ch,[6,2.6,1.5]),add(Ch,[2.2,2.4,6.2]),draw):walk?add(Ch,[2+Math.sin(ph)*1.6,5.6,-1]):add(Ch,[2.4,5.4,-1.2]);
  parts.push({d:D(add(shL,[6,0,0])),f:()=>{const {h}=zArm(V0,shL,bowH,[-.2,-.8,-.6],{side:-1,L1:5,L2:5,bony:1,w1:3.2,we:2.8,w2:2.1,hand:1.6,fl:4.6,skin:mix(GC.skin,GC.skinF,farK(F(0,-1,0))),cloth:GC.tunic,clothD:'rgba(0,0,0,.28)',sleeve:4,sleeveK:.4,noHand:true,body:()=>hull(P(Pv),4.2,P(Ch),5.6)});
    gobBow(V0,h,draw,lerp3([0,-1,.05],[1,-.05,0],Math.max(draw,rel)));fist(V0,h,2,GC.skin)}});
  parts.push({d:D(add(shR,[4,0,0]))+.002,f:()=>{zArm(V0,shR,strH,[-.3,.9,-.4],{side:1,L1:5,L2:5,bony:1,w1:3.2,we:2.8,w2:2.1,hand:1.6,fl:4.6,skin:mix(GC.skin,GC.skinF,farK(F(0,1,0))),cloth:GC.tunic,clothD:'rgba(0,0,0,.28)',sleeve:4,sleeveK:.4,pd:[0,-1,0],body:()=>hull(P(Pv),4.2,P(Ch),5.6)})}});
  parts.push({d:D(Hc),f:()=>{neck(V0,add(Ch,[1.4,0,5.4]),2.6,add(Hc,[-.8,0,-4.2]),2.4,GC.skin);const Vh=Vat(face+hy,P(Hc),D(Hc));gobHead(Vh,[0,0,0],Rh,ph,{skin:GC.skin,hood:GC.hood,open:atk?draw*.8:idle&&p>.62&&p<.8?.6:.15},t)}});
  run(parts);ctx.restore()}

// ------------------------------------------------------------------ SKELETON: cracked bones, a hanging jaw, an ember in one socket; crossbow and shield
const KC={bone:'#d9d2c0',boneD:'#aba08a',boneF:'#8a8070',cav:'#2a211b',ember:'#ff5a2a',emberRgb:'255,90,40',wood:'#6b4a2a',woodD:'#3f2a16',iron:'#5a5a62',ironL:'#8a8a94',shield:'#6e5a3a',shieldD:'#4a3a24',crest:'#8a2a2a',str:'#e8e0cc',cloth:'#3a3440'};
function skull(V0,Hc,Rh,ph,o,t){const{P,F,c}=V0,h=P(Hc),at=Rh*.95;
  ink(2.4);ball(h,Rh);ctx.fillStyle=KC.bone;ctx.fill();ctx.stroke();
  ctx.save();ball(h,Rh-1.1);ctx.clip();ctx.fillStyle=KC.boneD;ell(h[0]+Rh*.35,h[1]+Rh*.7,Rh*1.15,Rh*.6);ctx.fill();ctx.fillStyle=KC.boneF;ell(h[0]+Rh*.85,h[1],Rh*.45,Rh*1.05);ctx.fill();glowTop(h,Rh,.2);
  // a crack across the cranium, the sutures on top and the back
  on(V0,Hc,at,[.3,-.6,.75],-.1,q=>{ctx.strokeStyle='rgba(20,14,10,.85)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(q[0]-3,q[1]+1);ctx.lineTo(q[0]-1,q[1]-1.5);ctx.lineTo(q[0]+.5,q[1]+.2);ctx.lineTo(q[0]+2.6,q[1]-2.2);ctx.moveTo(q[0]-1,q[1]-1.5);ctx.lineTo(q[0]-.5,q[1]-3);ctx.stroke()});
  on(V0,Hc,at,[-.4,.1,.9],0,q=>{ctx.strokeStyle='rgba(20,14,10,.5)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(q[0]-2.5,q[1]+1);for(let i=0;i<5;i++)ctx.lineTo(q[0]-2.5+i*1.25,q[1]+(i%2?-.8:.8));ctx.stroke()});
  on(V0,Hc,at,[-.95,0,-.1],.1,q=>{ctx.strokeStyle='rgba(20,14,10,.5)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(q[0],q[1]-3);ctx.lineTo(q[0]+.6,q[1]+3);ctx.stroke()});
  // the sockets: deep; the right one holds a red ember that breathes
  for(const sd of[-1,1])on(V0,Hc,at,[.8,sd*.42,.1],0,(q,v)=>{const k=cl(v*1.6,0,1);ink(1.5);ctx.fillStyle=KC.cav;ctx.beginPath();ctx.ellipse(q[0],q[1],Rh*.33*Math.max(.45,v),Rh*.36,sd*.2,0,TAU);ctx.fill();ctx.stroke();
    if(sd>0||o.both)gEye([q[0]+c*.2,q[1]+.3],Rh*.11,KC.ember,KC.emberRgb,k,t)});
  // the nose hole and the cheekbones
  on(V0,Hc,at,[1,0,-.25],.05,(q,v)=>{ctx.fillStyle=KC.cav;ctx.beginPath();ctx.moveTo(q[0],q[1]-1.6);ctx.lineTo(q[0]+1.2*v,q[1]+1);ctx.lineTo(q[0]-1.2*v,q[1]+1);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(20,14,10,.4)';ctx.lineWidth=1;for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(q[0]+sd*2.6*v,q[1]-.4);ctx.quadraticCurveTo(q[0]+sd*3.6*v,q[1]+.6,q[0]+sd*2.8*v,q[1]+2);ctx.stroke()}});
  ctx.restore();rim(h,Rh,h,Rh,.3);
  // the upper teeth on the skull, then the jaw: a separate bone hanging under it, swinging and chattering
  on(V0,Hc,at,[.95,0,-.5],.05,(q,v)=>{ctx.save();ctx.globalAlpha=cl(v*2,0,1);teeth([q[0],q[1]],Rh*.5*Math.max(.4,v),q[1]-.6,6,1.7,1,KC.bone);ctx.restore()});
  const op=o.open||0,J=add(Hc,[Rh*.25,0,-Rh*.75-op*2.2]),j=P(J),jv=F(1,0,-.4);
  if(jv>-.6){ctx.save();ctx.globalAlpha=cl((jv+.6)*2,0,1);const w=Rh*.62*Math.max(.35,F(0,1,0)*0+Math.abs(V0.c)*.6+.4),hh=Rh*.3;ink(1.8);ctx.fillStyle=KC.bone;ctx.beginPath();ctx.ellipse(j[0],j[1],w,hh,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle=KC.cav;ctx.beginPath();ctx.ellipse(j[0],j[1]-hh*.35,w*.8,hh*.5+op*1.2,0,0,TAU);ctx.fill();teeth([j[0],j[1]],w*.7,j[1]-hh*.2,5,1.5,-1,KC.bone);
    ctx.strokeStyle='rgba(20,14,10,.5)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(j[0]-w*.9,j[1]-hh);ctx.lineTo(j[0]-w*1.1,j[1]-Rh*.55);ctx.moveTo(j[0]+w*.9,j[1]-hh);ctx.lineTo(j[0]+w*1.1,j[1]-Rh*.55);ctx.stroke();ctx.restore()}}
// the ribcage over the dark cavity of the chest, the spine down the back, the pelvis bone
function ribcage(V0,Pv,rP,Ch,rC){const{P,F}=V0,a=P(Pv),b=P(Ch);ink(2.4);hull(a,rP,b,rC);ctx.fillStyle=KC.cav;ctx.fill();ctx.stroke();
  ctx.save();hull(a,rP-1,b,rC-1);ctx.clip();ctx.fillStyle='rgba(0,0,0,.4)';ell(b[0]+rC*.6,b[1]+rC*.3,rC*.8,rC);ctx.fill();
  // ribs: arcs on the front and the sides, fading as they turn away
  for(let i=0;i<4;i++){const z=.75-i*.42;for(const sd of[-1,1])on(V0,lerp3(Pv,Ch,.55+i*.1),lerp(rP,rC,.55+i*.1)-.4,[.6,sd*.75,z*.4],-.25,(q,v)=>{ctx.strokeStyle=INK;ctx.lineWidth=3.4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q[0]-sd*4.4*v,q[1]-1.2);ctx.quadraticCurveTo(q[0]-sd*1*v,q[1]+1.9,q[0]+sd*3*v,q[1]+1);ctx.stroke();ctx.strokeStyle=KC.bone;ctx.lineWidth=2.1;ctx.stroke();
      ctx.strokeStyle='rgba(20,14,10,.35)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(q[0]-sd*4*v,q[1]-.6);ctx.quadraticCurveTo(q[0]-sd*1*v,q[1]+2.3,q[0]+sd*2.6*v,q[1]+1.5);ctx.stroke()})}
  // the sternum in front, the spine behind
  on(V0,lerp3(Pv,Ch,.75),lerp(rP,rC,.75),[1,0,.1],.1,q=>{ctx.strokeStyle=KC.bone;ctx.lineWidth=2.4;ctx.lineCap='round';seg([q[0],q[1]-4],[q[0],q[1]+4]);ctx.stroke()});
  for(let i=0;i<5;i++)on(V0,lerp3(Pv,Ch,.2+i*.18),lerp(rP,rC,.2+i*.18),[-1,0,0],.2,q=>{ink(1.2);ctx.fillStyle=KC.boneD;ball(q,1.5);ctx.fill();ctx.stroke()});
  ctx.restore();
  // the pelvis: a bone bowl at the bottom
  const pq=P(add(Pv,[0,0,-1.2]));ink(2);ctx.fillStyle=KC.bone;ctx.beginPath();ctx.ellipse(pq[0],pq[1],rP+.8,rP*.55,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=KC.cav;ctx.beginPath();ctx.ellipse(pq[0],pq[1]+.4,rP*.45,rP*.3,0,0,TAU);ctx.fill();rim(pq,rP+.8,pq,rP+.8,.25)}
// the crossbow: stock along dir from the hand, bow limbs across it, string, a bolt in the groove; k = how much the string is drawn
function crossbow(V0,hd,dir,k){const{P}=V0;dir=nrm(dir);let side=cross(dir,[0,0,1]);if(len(side)<.2)side=[0,1,0];side=nrm(side);
  const b0=add(hd,mul(dir,-6.5)),b1=add(hd,mul(dir,9)),B0=P(b0),B1=P(b1);ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=5.6;seg(B0,B1);ctx.stroke();ctx.strokeStyle=KC.wood;ctx.lineWidth=3.2;seg(B0,B1);ctx.stroke();
  ctx.strokeStyle=wa(.3);ctx.lineWidth=.8;seg([B0[0]-.6,B0[1]-.6],[B1[0]-.6,B1[1]-.6]);ctx.stroke();
  const c3=add(hd,mul(dir,6.6)),L=P(add(c3,mul(side,-8.5))),Rr=P(add(c3,mul(side,8.5))),C=P(c3),back=add(c3,mul(dir,-2-k*4)),Bk=P(back);
  ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(L[0],L[1]);ctx.quadraticCurveTo(C[0]+(C[0]-Bk[0])*.4,C[1]+(C[1]-Bk[1])*.4,Rr[0],Rr[1]);ctx.stroke();ctx.strokeStyle=KC.iron;ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle=KC.str;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L[0],L[1]);ctx.lineTo(Bk[0],Bk[1]);ctx.lineTo(Rr[0],Rr[1]);ctx.stroke();
  const T=P(add(c3,mul(dir,4.5)));ctx.strokeStyle=INK;ctx.lineWidth=2.6;seg(Bk,T);ctx.stroke();ctx.strokeStyle='#9a8a6a';ctx.lineWidth=1;seg(Bk,T);ctx.stroke();ctx.fillStyle=KC.ironL;ink(.9);tri(T[0]-(T[0]-Bk[0])*.1,T[1]-(T[1]-Bk[1])*.1,T[0]+(T[0]-Bk[0])*.14,T[1]+(T[1]-Bk[1])*.14,1.1);
  const tq=P(add(hd,mul(dir,-2.4)));ctx.fillStyle=KC.iron;ink(1);ctx.beginPath();ctx.arc(tq[0],tq[1]+1.6,1.4,0,TAU);ctx.fill();ctx.stroke()}
// the shield on the forearm: a battered oval of planks with an iron rim and a red crest, cracked and chipped as it wears (dmg 0..1)
function shieldOn(V0,c3,n,dmg){const{P,F}=V0;n=nrm(n);const v=F(n);if(v<-.95)return;let u=cross(n,[0,0,1]);if(len(u)<.2)u=[0,1,0];u=nrm(u);const w=cross(n,u),rx=5.2,ry=6.4,pts=[];
  for(let i=0;i<22;i++){const a=i/22*TAU;pts.push(P(add(add(c3,mul(u,Math.cos(a)*rx)),mul(w,Math.sin(a)*ry))))}
  const path=()=>{ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.closePath()};
  ink(2.4);path();ctx.fillStyle=KC.shield;ctx.fill();ctx.stroke();ctx.save();path();ctx.clip();const c=P(c3);
  if(v>0){for(let i=-1;i<=1;i++){const a=P(add(add(c3,mul(u,i*3.2)),mul(w,-ry))),b=P(add(add(c3,mul(u,i*3.2)),mul(w,ry)));ctx.strokeStyle='rgba(20,14,10,.45)';ctx.lineWidth=1;seg(a,b);ctx.stroke()}
    ctx.fillStyle=KC.crest;ctx.beginPath();ctx.moveTo(c[0],c[1]-3.2*v-2.6);ctx.lineTo(c[0]+3*v,c[1]);ctx.lineTo(c[0],c[1]+3.8);ctx.lineTo(c[0]-3*v,c[1]);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();for(let i=0;i<22;i++){const a=i/22*TAU;const q=P(add(add(c3,mul(u,Math.cos(a)*rx*.8+1.2)),mul(w,Math.sin(a)*ry*.8+1.4)));ctx.lineTo(q[0],q[1])}ctx.closePath();ctx.fill();
    glowTop(c,ry,.14);
    if(dmg>0){ctx.strokeStyle='rgba(20,14,10,.9)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(c[0]-rx*.6*v,c[1]-ry*.7);ctx.lineTo(c[0]-rx*.1*v,c[1]-ry*.1);ctx.lineTo(c[0]-rx*.5*v,c[1]+ry*.6);if(dmg>.5){ctx.moveTo(c[0]+rx*.5*v,c[1]-ry*.4);ctx.lineTo(c[0]+rx*.15*v,c[1]+ry*.3)}ctx.stroke()}}
  else{ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(c[0]-10,c[1]-10,20,20);ctx.strokeStyle=KC.wood;ctx.lineWidth=2;seg([c[0],c[1]-ry*.6],[c[0],c[1]+ry*.6]);ctx.stroke()}
  ctx.restore();ctx.strokeStyle=KC.iron;ctx.lineWidth=1.6;path();ctx.stroke();
  for(let i=0;i<8;i++){const q=pts[i*22/8|0];ctx.fillStyle=KC.ironL;ball(q,.8);ctx.fill()}
  if(dmg>.5&&v>0){ctx.fillStyle=KC.cav;ctx.beginPath();const q=pts[3];ctx.moveTo(q[0]-2,q[1]-1);ctx.lineTo(q[0]+1.5,q[1]+1.5);ctx.lineTo(q[0]-1.5,q[1]+2.5);ctx.closePath();ctx.fill()}}
function skeleton(x,y,face,anim,p,sc,o){sc=sc||1.1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU,walk=anim==='walk',atk=anim==='attack',idle=!walk&&!atk,t=G.t,shield=o.shield==null?1:o.shield;
  // attack: .0-.3 raises the crossbow to the empty socket and aims, .3-.38 shoots (recoil), .38-1 lowers it and cranks the string back
  let aim=0,kick=0,crank=0;if(atk){if(p<.3)aim=ez(p/.3);else if(p<.38){aim=1;kick=1-(p-.3)/.08}else{const k=(p-.38)/.62;aim=1-ez(Math.min(1,k*1.6));crank=Math.sin(k*Math.PI)}}
  // walk: stiff jerky steps, the hips twist; idle: still as a statue, a rattle, the head tilts too far and snaps back
  const st=stepper(p,.52),fL=walk?st(0,3.2,2.4):NOSTEP,fR=walk?st(.5,3.2,2.4):NOSTEP,bob=walk?Math.abs(Math.sin(ph))*.9:0,tw=walk?Math.sin(ph)*.9:0,rat=idle?tremor(p,.3,.1)*.8:0;
  const Pv=[0,tw*.3,12.6+bob],Ch=[1.2+rat*.3,tw,20.4+bob],tilt=idle?(p<.5?Math.sin(p*Math.PI)*.55:p<.56?.55*(1-ez((p-.5)/.06)):0):walk?Math.sin(ph*2)*.08:aim*-.15,
    Hc=add(Ch,[1.4+rat,tilt*4.5+rat*.6,10.2+(walk?Math.cos(ph*2)*.3:0)-Math.abs(tilt)*.8]),Rh=6.4,hy=idle?snap(p,.6)*.6:0;
  {const q=P(.8,0,0);shadow(x+q[0]*sc,y+q[1]*sc,10.5*sc,4.2*sc,.34)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[],dT=D(Ch);
  for(const[sd,f] of[[-1,fL],[1,fR]]){const hip=add(Pv,[0,sd*3.1,-2.4]),foot=[.8+f.x,sd*3.9,f.z],[kn,ft]=ik(hip,add(foot,[0,0,1.4]),5.2,5.2,[1,0,.12]),k=farK(F(0,sd,0)),col=mix(KC.bone,KC.boneF,k);
    parts.push({d:dT-100+D(hip)*.01,f:()=>{const pts=[P(hip),P(kn),P(ft)];bone(pts,[1.9,1.6,1.4],col,()=>{const h0=P(add(ft,[-1.2,0,-.3])),t0=P(add(ft,[2.8,0,-.5]));ink(2);ctx.fillStyle=col;hull(h0,1.5,t0,1.3);ctx.fill();ctx.stroke();
        ctx.fillStyle=col;for(let i=-1;i<=1;i++){const q=P(add(ft,[3.6,i*1.1,-.6]));ball(q,.8);ctx.fill()}},[[P(kn),2.1]]);shadeLimb(pts,[1.9,1.6,1.4],'rgba(40,30,20,.35)');
      ctx.strokeStyle='rgba(20,14,10,.5)';ctx.lineWidth=.8;const m=P(lerp3(hip,kn,.5));seg([m[0]-.8,m[1]-1.5],[m[0]+.4,m[1]+1.4]);ctx.stroke()}})}
  parts.push({d:dT,f:()=>{ribcage(V0,Pv,5.2,Ch,7.2);
    // a scrap of rotten cloth hanging from the shoulder, swinging
    on(V0,Ch,7,[-.2,-.9,.4],-.1,q=>{const sw=Math.sin(ph*(walk?2:1))*1.2;ink(1.4);ctx.fillStyle=KC.cloth;ctx.beginPath();ctx.moveTo(q[0]-2.5,q[1]-1);ctx.lineTo(q[0]+2.5,q[1]-1);ctx.lineTo(q[0]+1.5+sw,q[1]+7);ctx.lineTo(q[0]-.5+sw,q[1]+5);ctx.lineTo(q[0]-1.5+sw,q[1]+8);ctx.closePath();ctx.fill();ctx.stroke()})}});
  // right arm: the shield strapped to the forearm, held low at rest and raised to the chest when walking into fire
  const shR=add(Ch,[.5,6.6,3.6]),hR=add(Ch,[4.5+aim*1,7.8-aim*2,-1+aim*4.5]),shL=add(Ch,[.5,-6.6,3.6]),
    hL=atk?lerp3(add(Ch,[6,-5.5,-.5]),add(Ch,[7.5,-2.4,8.6]),aim):walk?add(Ch,[5+Math.sin(ph)*.6,-6,-.5]):add(Ch,[5.5,-5.8,-.8]),dirL=atk?nrm(sub(add(Ch,[20,-2.4+kick*1.5,8.6]),hL)):[1,-.1,-.25];
  parts.push({d:D(add(shR,[4,0,0]))+.002,f:()=>{const r=zArm(V0,shR,hR,[-.2,.9,-.5],{side:1,L1:5.4,L2:5.4,bony:1,w1:3.4,we:3,w2:2.3,hand:1.7,fl:5,skin:mix(KC.bone,KC.boneF,farK(F(0,1,0))),cloth:KC.cloth,sleeve:0,shade:'rgba(40,30,20,.35)',pd:[0,1,0]});
    if(shield>0)shieldOn(V0,lerp3(r.el,r.h,.55),[.9,.6,.15],cl(1-shield,0,1))}});
  parts.push({d:D(add(shL,[5,0,0]))+.001,f:()=>{const r=zArm(V0,shL,hL,[-.2,-.9,-.6],{side:-1,L1:5.4,L2:5.4,bony:1,w1:3.4,we:3,w2:2.3,hand:1.7,fl:5,skin:mix(KC.bone,KC.boneF,farK(F(0,-1,0))),cloth:KC.cloth,sleeve:0,shade:'rgba(40,30,20,.35)',noHand:true});
    crossbow(V0,r.h,dirL,crank*.9+(aim>.9&&!kick?.6:0));fist(V0,r.h,2,mix(KC.bone,KC.boneF,farK(F(0,-1,0))));
    if(kick>0){const m=P(add(r.h,mul(dirL,12)));shine('255,220,160',m[0],m[1],8*kick,.6*kick)}}});
  parts.push({d:D(Hc),f:()=>{// the neck: a few vertebrae
    for(let i=0;i<3;i++){const q=P(lerp3(add(Ch,[1.2,0,6.6]),add(Hc,[-.6,0,-5]),i/2));ink(1.2);ctx.fillStyle=KC.boneD;ball(q,1.7-i*.15);ctx.fill();ctx.stroke()}
    const Vh=Vat(face+hy,P(Hc),D(Hc));skull(Vh,[0,0,0],Rh,ph,{open:atk?aim*.7:idle?(p>.3&&p<.42?.9:.25+.1*Math.sin(ph*4)):.3+.2*Math.sin(ph*2)},t)}});
  run(parts);ctx.restore()}

// ------------------------------------------------------------------ SLIME: a sick green jelly with a skull inside and a mouth too wide
const LC2={gel:'#5f9a3a',gelD:'#3f6a2a',gelF:'#2f4f20',gelL:'#8fd05a',eye:'#e9ff7a',eyeRgb:'230,255,120',mouth:'#140808',teeth:'#e6dcc0',skull:'rgba(230,220,192,.5)'};
function slime(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F,c,s}=V0,ph=p*TAU,walk=anim==='walk',atk=anim==='attack',idle=!walk&&!atk,t=G.t,col=o.gel||LC2.gel,colD=o.gelD||LC2.gelD;
  // hop: squashes to load, leaps stretched, splats; attack: rears back open-mouthed, lunges forward, pulls back trailing goo
  let sq=1,hop=0,lean=0,open=.2,lurch=0;
  if(walk){if(p<.22){sq=1-.25*ez(p/.22)}else if(p<.6){const k=(p-.22)/.38;hop=Math.sin(k*Math.PI)*7;sq=1.22-.1*k;lean=1.5}else if(p<.72){const k=(p-.6)/.12;sq=.68+.1*k}else{const k=ez((p-.72)/.28);sq=.78+.22*k}}
  else if(atk){if(p<.3){const k=ez(p/.3);lean=-2.6*k;sq=1-.14*k;open=.2+.8*k}else if(p<.45){const k=ez((p-.3)/.15);lean=-2.6+10.6*k;sq=.86+.3*k;open=1}else{const k=ez((p-.45)/.55);lean=8*(1-k);sq=1.16-.16*k;open=1-k*.8}}
  else{sq=1+.05*Math.sin(ph);open=.15+.08*Math.sin(ph*2);lurch=p>.64&&p<.74?Math.sin((p-.64)/.1*Math.PI)*2.2:0;lean=lurch}
  const r=11,rx=r/Math.sqrt(sq),rz=8*sq,C=[lean*.5,0,rz+hop],q=P(C),w=rx,h=rz*.72+rx*.3;
  {const g=P(lean*.5,0,0);shadow(x+g[0]*sc,y+g[1]*sc,(rx+1)*sc*(1-hop*.03),4.4*sc*(1-hop*.03),.34*(1-hop*.04))}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  // the body: a wobbling blob (bumps round the outline), lit from the upper left, darker and dirtier at the base
  const path=(k)=>{ctx.beginPath();for(let i=0;i<=28;i++){const a=i/28*TAU,wob=1+.045*Math.sin(a*3+ph*2+1)+.03*Math.sin(a*5-ph);const px=q[0]+Math.cos(a)*(w+k)*wob,py=q[1]+Math.sin(a)*(h+k)*wob*(Math.sin(a)>0?1.12:.9);ctx.lineTo(px,py)}ctx.closePath()};
  // goo strings and drops hanging from the base (behind the body)
  ctx.lineCap='round';for(let i=0;i<4;i++){const a=.3+i*.7,bx=q[0]+Math.cos(a)*w*.8,by=q[1]+h*.8,l=3+2*Math.sin(ph+i*1.7)+(hop>0?hop*.5:0);ctx.strokeStyle=INK;ctx.lineWidth=2.4;seg([bx,by],[bx,by+l]);ctx.stroke();ctx.strokeStyle=colD;ctx.lineWidth=1.1;seg([bx,by],[bx,by+l]);ctx.stroke();ctx.fillStyle=col;ink(1);ball([bx,by+l],1.1);ctx.fill();ctx.stroke()}
  ink(2.4);path(0);ctx.fillStyle=col;ctx.fill();ctx.stroke();
  ctx.save();path(-1.2);ctx.clip();ctx.fillStyle=colD;ell(q[0]+w*.35,q[1]+h*.6,w*1.1,h*.7);ctx.fill();ctx.fillStyle=LC2.gelF;ell(q[0]+w*.8,q[1]+h*.15,w*.4,h*.8);ctx.fill();
  // something inside: a skull swallowed long ago, drifting
  {const sk=[q[0]-w*.15+Math.sin(ph*.5)*1.2+c*2,q[1]+h*.15+Math.cos(ph*.7)*.8];ctx.fillStyle=LC2.skull;ball(sk,r*.3);ctx.fill();ctx.fillStyle='rgba(20,12,8,.5)';ball([sk[0]-1.1,sk[1]-.4],.9);ctx.fill();ball([sk[0]+1.1,sk[1]-.4],.9);ctx.fill();ctx.fillRect(sk[0]-1.6,sk[1]+1.4,3.2,1)}
  ctx.fillStyle=wa(.22);ell(q[0]-w*.4,q[1]-h*.45,w*.42,h*.25);ctx.fill();ctx.fillStyle=wa(.12);ell(q[0]-w*.15,q[1]-h*.7,w*.25,h*.12);ctx.fill();
  // bubbles rising inside
  for(let i=0;i<3;i++){const bb=(ph/TAU*.6+i*.33)%1;ctx.strokeStyle='rgba(200,255,160,.35)';ctx.lineWidth=.8;ball([q[0]+(i-1)*w*.35,q[1]+h*.6-bb*h*1.1],1+i*.3);ctx.stroke()}
  ctx.restore();rim(q,Math.min(w,h),q,Math.min(w,h),.3);
  // the face slides round the body as it turns: eyes high and far apart, the mouth low and wide
  const fv=F(1,0,.1);if(fv>-.2){ctx.save();ctx.globalAlpha=cl((fv+.2)*2.5,0,1);const fx=q[0]+(-s)*0+V0.c*0;const ox=-s*w*.0;const cx=q[0]+(c*0)-(V0.s*0),sx=-V0.s;
    // eyes: two drifting pupils that look at you and breathe
    for(const sd of[-1,1]){const ex=q[0]-sd*w*.42*Math.max(.35,fv)+(-V0.s)*0+(V0.c)*w*.3*sd*0+V0.c*0,ey=q[1]-h*.25+Math.sin(ph+sd)*.6;const dx=V0.c*0;
      ctx.fillStyle='#1a2a10';ball([ex+V0.c*2,ey],r*.19);ctx.fill();gEye([ex+V0.c*2,ey+.2],r*.12,LC2.eye,LC2.eyeRgb,cl(fv*1.5,0,1),t)}
    // the mouth: a wide dark gash full of crooked teeth, open when it strikes, strings of goo across it
    const my=q[1]+h*.32,mw=w*.72*Math.max(.3,fv),mh=1.2+open*5.5;ink(1.6);ctx.fillStyle=LC2.mouth;ctx.beginPath();ctx.moveTo(q[0]-mw+V0.c*2,my-1);ctx.quadraticCurveTo(q[0]+V0.c*2,my+mh,q[0]+mw+V0.c*2,my-1);ctx.quadraticCurveTo(q[0]+V0.c*2,my-1.5-open*1.2,q[0]-mw+V0.c*2,my-1);ctx.fill();ctx.stroke();
    ctx.save();ctx.beginPath();ctx.moveTo(q[0]-mw+V0.c*2,my-1);ctx.quadraticCurveTo(q[0]+V0.c*2,my+mh,q[0]+mw+V0.c*2,my-1);ctx.quadraticCurveTo(q[0]+V0.c*2,my-1.5-open*1.2,q[0]-mw+V0.c*2,my-1);ctx.clip();
    teeth([q[0]+V0.c*2,my],mw*.85,my-1.4-open*.8,8,2+open,1,LC2.teeth);teeth([q[0]+V0.c*2,my],mw*.6,my+mh*.75,5,1.6+open,-1,LC2.teeth);
    if(open>.4){ctx.strokeStyle='rgba(190,230,140,.55)';ctx.lineWidth=.9;for(let i=-1;i<=1;i++){seg([q[0]+V0.c*2+i*mw*.4,my-.5],[q[0]+V0.c*2+i*mw*.35,my+mh*.7]);ctx.stroke()}}ctx.restore();ctx.restore()}
  ctx.restore()}

// ------------------------------------------------------------------ BAT: ragged wings full of holes, a screaming face, eyes like coals
const BC2={fur:'#4e3860',furD:'#33243f',furF:'#241930',skin:'#7a5078',memb:'#6a4474',membD:'#46304e',membL:'#8e6a98',eye:'#ff3b2f',eyeRgb:'255,70,50',mouth:'#1a0808',teeth:'#e6dcc0',ear:'#6a4a6a'};
function bat(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F,c}=V0,ph=p*TAU,fly=anim==='walk',atk=anim==='attack',idle=!fly&&!atk,t=G.t;
  // attack: .0-.3 climbs back and opens wide, .3-.55 dives forward and down with the wings swept back, bites, .55-1 climbs back up
  let dive=0,climb=0,open=.25,sweep=0;if(atk){if(p<.3){const k=ez(p/.3);climb=k;open=.25+.75*k}else if(p<.55){const k=(p-.3)/.25;dive=Math.sin(k*Math.PI);climb=1-k;open=k<.6?1:.3;sweep=Math.sin(k*Math.PI)}else{const k=ez((p-.55)/.45);dive=0;climb=0;open=.3*(1-k)+.25*k}}
  const flap=fly?Math.sin(ph*2):atk?Math.sin(ph*3)*.6:Math.sin(ph)*.45,bob=fly?Math.cos(ph*2)*1.2:idle?Math.sin(ph)*1.4:0,
    hz=22+bob+climb*5-dive*11,hx=dive*10-climb*2,C=[hx,0,hz],Hc=add(C,[5-dive*.5,0,1.4+climb*.6]),Rb=4.8,Rh=4.3,hy=idle?snap(p,.6)*.8:0;
  {const q=P(hx,0,0);shadow(x+q[0]*sc,y+q[1]*sc,(7-dive*1.5)*sc,2.8*sc,.22+dive*.1)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[];
  // wings: membranes between the shoulder, the elbow, the long finger and two trailing points; holes and tears in the skin
  const wing=sd=>{const S=add(C,[.5,sd*2.4,1.4]),E=add(S,[1.5-sweep*4,sd*7.5,flap*4.2+1]),T=add(E,[-1-sweep*5,sd*8.5,flap*6.5]),Q1=add(E,[-10-sweep*2,sd*4.5,flap*2.4-2.2]),Q2=add(S,[-10.5,sd*1.4,-2.6+flap*.5]),
      pts=[S,E,T,Q1,Q2].map(P),k=farK(F(0,sd,-flap*.3)),col=mix(BC2.memb,BC2.membD,k);
    return{d:D(lerp3(S,E,.5)),f:()=>{ctx.lineJoin='round';ink(2.4);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);ctx.lineTo(pts[1][0],pts[1][1]);ctx.lineTo(pts[2][0],pts[2][1]);
        // the trailing edge is scalloped and torn
        ctx.quadraticCurveTo((pts[2][0]+pts[3][0])/2+1,(pts[2][1]+pts[3][1])/2+2.5,pts[3][0],pts[3][1]);ctx.quadraticCurveTo((pts[3][0]+pts[4][0])/2,(pts[3][1]+pts[4][1])/2+2.5,pts[4][0],pts[4][1]);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.save();ctx.clip();ctx.fillStyle=BC2.membD;ctx.beginPath();ctx.moveTo(pts[1][0],pts[1][1]);ctx.lineTo(pts[2][0],pts[2][1]);ctx.lineTo(pts[3][0],pts[3][1]);ctx.closePath();ctx.fill();ctx.fillStyle=wa(.1);ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);ctx.lineTo(pts[1][0],pts[1][1]);ctx.lineTo(pts[4][0],pts[4][1]);ctx.closePath();ctx.fill();
        // scars and thin spots in the membrane (the floor never shows through: nothing is cut out)
        const h1=P(lerp3(lerp3(E,T,.45),Q1,.4)),h2=P(lerp3(lerp3(S,E,.6),Q2,.5));ctx.fillStyle=BC2.furF;ell(h1[0],h1[1],1.7,1.1);ctx.fill();ell(h2[0],h2[1],1.2,.8);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.9;ell(h1[0],h1[1],1.7,1.1);ctx.stroke();
        ctx.strokeStyle='rgba(20,12,24,.5)';ctx.lineWidth=.8;for(const m of[lerp3(E,T,.5),lerp3(S,E,.5)]){const a=P(m),b=P(add(m,[-4,0,-1.2]));seg(a,b);ctx.stroke()}ctx.restore();
        // the finger bones over the membrane
        ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);ctx.lineTo(pts[1][0],pts[1][1]);ctx.lineTo(pts[2][0],pts[2][1]);ctx.moveTo(pts[1][0],pts[1][1]);ctx.lineTo(pts[3][0],pts[3][1]);ctx.stroke();
        ctx.strokeStyle=mix(BC2.skin,BC2.furF,k);ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle=BC2.furF;ball(pts[1],1.3);ctx.fill();const cl2=P(add(T,[.6,sd*.6,-.4]));ctx.fillStyle=ZC.nail;ink(.8);tri(pts[2][0],pts[2][1],cl2[0],cl2[1]+1.2,.7)}}};
  parts.push(wing(-1));parts.push(wing(1));
  // the body: a furry ball with a lighter belly, two clawed feet tucked under
  parts.push({d:D(C),f:()=>{const b=P(C);ink(2.4);ball(b,Rb);ctx.fillStyle=BC2.fur;ctx.fill();ctx.stroke();ctx.save();ball(b,Rb-1);ctx.clip();ctx.fillStyle=BC2.furD;ell(b[0]+Rb*.4,b[1]+Rb*.6,Rb,Rb*.7);ctx.fill();
    on(V0,C,Rb,[.5,0,-.8],-.1,q=>{ctx.fillStyle=BC2.skin;ell(q[0],q[1],Rb*.6,Rb*.4);ctx.fill()});glowTop(b,Rb,.18);
    ctx.strokeStyle='rgba(20,14,20,.5)';ctx.lineWidth=.8;for(let i=0;i<5;i++){const a=i*1.3;seg([b[0]+Math.cos(a)*Rb*.6,b[1]+Math.sin(a)*Rb*.6],[b[0]+Math.cos(a)*Rb*1.1,b[1]+Math.sin(a)*Rb*1.1]);ctx.stroke()}ctx.restore();rim(b,Rb,b,Rb,.3);
    for(const sd of[-1,1]){const f0=add(C,[-1,sd*1.6,-Rb]),f1=add(f0,[-1.5,sd*.4,-2.6]);ctx.strokeStyle=INK;ctx.lineWidth=2.6;seg(P(f0),P(f1));ctx.stroke();ctx.strokeStyle=BC2.skin;ctx.lineWidth=1.1;seg(P(f0),P(f1));ctx.stroke();const q=P(f1);ink(.8);ctx.fillStyle=ZC.nail;for(let i=-1;i<=1;i++){tri(q[0],q[1],q[0]+i*1.2,q[1]+1.6,.5)}}}});
  // the head: big torn ears, a flat snout, a mouth screaming full of needle teeth, eyes like coals
  parts.push({d:D(Hc),f:()=>{const Vh=Vat(face+hy,P(Hc),D(Hc)),H=[0,0,0],h=Vh.P(H);
    for(const sd of[-1,1])if(Vh.F(0,sd,.5)<0)batEar(Vh,H,Rh,sd,ph);
    ink(2.4);ball(h,Rh);ctx.fillStyle=BC2.fur;ctx.fill();ctx.stroke();ctx.save();ball(h,Rh-1);ctx.clip();ctx.fillStyle=BC2.furD;ell(h[0]+Rh*.4,h[1]+Rh*.65,Rh,Rh*.6);ctx.fill();glowTop(h,Rh,.2);ctx.restore();rim(h,Rh,h,Rh,.3);
    on(Vh,H,Rh*.95,[1,0,-.05],-.05,(q,v)=>{const k=cl(v*1.6,0,1),w=Rh*.8*Math.max(.3,k);// the face
      ctx.fillStyle=BC2.skin;ctx.beginPath();ctx.ellipse(q[0],q[1]+.4,w,Rh*.75,0,0,TAU);ctx.fill();
      ctx.fillStyle='#2a1a2e';ctx.beginPath();ctx.ellipse(q[0],q[1]-.6,w*.32,Rh*.22,0,0,TAU);ctx.fill();ctx.fillStyle='#120a12';ball([q[0]-w*.14,q[1]-.6],.6);ctx.fill();ball([q[0]+w*.14,q[1]-.6],.6);ctx.fill();
      for(const sd of[-1,1]){const ex=q[0]-sd*w*.58,ey=q[1]-Rh*.42;ctx.fillStyle='#1a0808';ball([ex,ey],Rh*.2);ctx.fill();gEye([ex,ey],Rh*.13,BC2.eye,BC2.eyeRgb,k,t)}
      const my=q[1]+Rh*.3,mw=w*.8,mh=.8+open*4.5;ink(1.4);ctx.fillStyle=BC2.mouth;ctx.beginPath();ctx.ellipse(q[0],my+mh*.3,mw,mh,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.save();ctx.beginPath();ctx.ellipse(q[0],my+mh*.3,mw,mh,0,0,TAU);ctx.clip();teeth([q[0],my],mw*.9,my-mh*.7,7,1.4+open*1.6,1,BC2.teeth);teeth([q[0],my],mw*.7,my+mh*1.25,6,1.2+open*1.2,-1,BC2.teeth);
      if(open>.5){ctx.fillStyle='#8a2a3a';ctx.beginPath();ctx.ellipse(q[0],my+mh*.9,mw*.4,mh*.35,0,0,TAU);ctx.fill()}ctx.restore()});
    for(const sd of[-1,1])if(Vh.F(0,sd,.5)>=0)batEar(Vh,H,Rh,sd,ph)}});
  run(parts);ctx.restore()}
function batEar(Vh,H,Rh,sd,ph){const{P}=Vh,b=add(H,[-.5,sd*Rh*.7,Rh*.6]),tp=add(H,[-1.2,sd*Rh*1.3,Rh*2.4+Math.sin(ph*2+sd)*.3]),m=add(H,[-.6,sd*Rh*1.5,Rh*1.3]),B=P(b),T=P(tp),M=P(m),B2=P(add(H,[.4,sd*Rh*.25,Rh*.9]));
  ink(1.8);ctx.fillStyle=BC2.fur;ctx.beginPath();ctx.moveTo(B[0],B[1]);ctx.quadraticCurveTo(M[0],M[1],T[0],T[1]);ctx.quadraticCurveTo((T[0]+B2[0])/2-1,(T[1]+B2[1])/2,B2[0],B2[1]);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=BC2.ear;ctx.beginPath();ctx.moveTo((B[0]*2+B2[0])/3,(B[1]*2+B2[1])/3);ctx.quadraticCurveTo(M[0]*.6+T[0]*.4,M[1]*.6+T[1]*.4,T[0]-(T[0]-B[0])*.2,T[1]-(T[1]-B[1])*.2);ctx.lineTo((B[0]+B2[0]*2)/3,(B[1]+B2[1]*2)/3);ctx.closePath();ctx.fill();
  // a notch torn out of the edge
  ctx.fillStyle=BC2.furD;ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();const nx=M[0]*.5+T[0]*.5,ny=M[1]*.5+T[1]*.5;ctx.moveTo(nx-1.2,ny-1);ctx.lineTo(nx+.6,ny+.4);ctx.lineTo(nx-1,ny+1.4);ctx.closePath();ctx.fill();ctx.stroke()}

return{goblin,skeleton,slime,bat,gEye,teeth,snap,tremor};})();
