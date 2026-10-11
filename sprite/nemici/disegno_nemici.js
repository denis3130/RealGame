// Nemici della modalità CLASSICA rifatti con il metodo dello Zombie spaventapasseri (sprite/mostri/disegno_mostri.js, da cui prende
// la cassetta degli attrezzi CR._rig): scheletro 3D proiettato con V(face), arti a due ossa con la cinematica inversa, ordine di
// disegno deciso dalla posa di riposo, pezzi che girano per conto loro con Vat, ogni mossa dipende solo da p (0..1).
// Dipinti come lo Zombie della lanterna (tre toni su ogni pezzo, bordo illuminato, pieghe, bagliori) ma con lo spirito della
// modalità Classica, che deve piacere anche ai bambini: colori pieni e saturi (gli stessi di ECOL nel gioco), forme tonde da
// giocattolo, teste grandi, occhi grandi con la luce dentro, bocche semplici con al massimo due zannette, sopracciglia birichine.
// Niente sangue, ferite, crepe o cuciture: quelle restano ai mostri della modalità Zombie. Da fermi si guardano intorno e respirano.
// Stessi personaggi di prima (goblin con l'arco, scheletro con balestra e scudo, slime, pipistrello).
// Firma: NE.<nome>(x, y, face, anim, p, sc[, o]); anim: 'idle' | 'walk' | 'attack'. Va eseguito dopo disegno_mostri.js.
window.NE=(()=>{
const R=CR._rig,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,Vat,mix,farK,ik,stepper,NOSTEP,shine,ball,seg,tri,hull,limb,on,neck,hand,fist,bone,claw,rag,leg,trunk,wa,rim,shadeLimb,glowTop,folds,run,ZC,zArm}=R;
// a cartoon eye: the white, a coloured iris, the pupil and a point of light. k = how much it faces us (narrows as it turns away);
// o.sq squashes it for a blink (1 open, 0 shut), o.dx/o.dy move the iris (-1..1), o.glow adds a soft halo of that rgb
function cEye(q,r,iris,k,o){if(k<=0)return;o=o||{};const rx=Math.max(.35,k)*r,sq=o.sq==null?1:o.sq,ry=Math.max(.3,r*sq);
  ink(1.3);ctx.fillStyle='#fff8ec';ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU);ctx.fill();ctx.stroke();
  if(sq>.25){const dx=(o.dx||0)*rx*.3,dy=(o.dy||0)*ry*.3;ctx.save();ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU);ctx.clip();
    ctx.fillStyle=iris;ctx.beginPath();ctx.ellipse(q[0]+dx,q[1]+dy,rx*.6,r*.6,0,0,TAU);ctx.fill();
    ctx.fillStyle='#1b1612';ctx.beginPath();ctx.ellipse(q[0]+dx*1.15,q[1]+dy*1.15,rx*.32,r*.34,0,0,TAU);ctx.fill();
    ctx.fillStyle='#fff';ball([q[0]-rx*.28+dx*.5,q[1]-r*.3+dy*.5],r*.17);ctx.fill();ctx.restore()}
  if(o.glow)shine(o.glow,q[0],q[1],r*3,.18)}
// a steady little light in a dark socket (the skeleton): a coloured dot with its halo and a white point
function pip(q,r,col,rgb,k){if(k<=0)return;shine(rgb,q[0],q[1],r*4,.3*k);ctx.fillStyle=col;ball(q,r*k+.2);ctx.fill();ctx.fillStyle='#fff';ball([q[0]-r*.35,q[1]-r*.35],r*.33*k+.1);ctx.fill()}
// a mischievous eyebrow: a short stroke that slants toward the nose (sd = side, k = how much it faces us)
function brow(q,sd,w,k,col){ctx.strokeStyle=col||'#1b1612';ctx.lineWidth=1.3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q[0]-sd*w*.5*k,q[1]-.6);ctx.lineTo(q[0]+sd*w*.5*k,q[1]+.9);ctx.stroke()}
// two little fangs hanging from a mouth (screen centre q, half distance w, y of the gum, height h)
function fangs(q,w,gy,h,col){ctx.fillStyle=col||'#fff6e0';ink(.8);for(const sd of[-1,1])tri(q[0]+sd*w,gy,q[0]+sd*w*.9,gy+h,.9)}
// an even row of square teeth along a jaw (screen centre q, half width w, y of the gum, n teeth, height h, pointing down (1) or up (-1))
function teethRow(q,w,gy,n,h,dir,col){ctx.fillStyle=col||'#f3ead8';ctx.strokeStyle=INK;ctx.lineWidth=.8;for(let i=0;i<n;i++){const x0=q[0]-w+i*(2*w/n),tw=2*w/n;ctx.beginPath();ctx.rect(x0+.15,Math.min(gy,gy+dir*h),tw-.3,h);ctx.fill();ctx.stroke()}}
// a smile: a curve from one corner to the other, drawn as a stroke, bowed down by `bow`
function smile(q,w,y,bow){ctx.strokeStyle='#1b1612';ctx.lineWidth=1.3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q[0]-w,y);ctx.quadraticCurveTo(q[0],y+bow,q[0]+w,y);ctx.stroke()}
// an open mouth: the dark inside, a pink tongue, two fangs on top (screen centre q, half width w, height h)
function openMouth(q,w,h,dark,tongue,fang){ink(1.4);ctx.fillStyle=dark;ctx.beginPath();ctx.ellipse(q[0],q[1],w,h,0,0,TAU);ctx.fill();ctx.stroke();ctx.save();ctx.beginPath();ctx.ellipse(q[0],q[1],w,h,0,0,TAU);ctx.clip();
  ctx.fillStyle=tongue;ctx.beginPath();ctx.ellipse(q[0],q[1]+h*.85,w*.6,h*.6,0,0,TAU);ctx.fill();if(fang)fangs(q,w*.55,q[1]-h,Math.min(h*.9,2.6),fang);ctx.restore()}
// when standing still the head looks gently one way and the other (period 1, smooth at the seam)
const look=(p,a)=>a*Math.sin(p*TAU)*(.55+.45*Math.cos(p*TAU*2));
// a blink: 1 open, dips to 0 around p0 (the eyelid takes `len` of the cycle)
const blink=(p,p0,len)=>{const d=Math.abs(((p-p0)%1+1.5)%1-.5);return d<len/2?Math.abs(d/(len/2)):1};

// ------------------------------------------------------------------ GOBLIN: a little hunched archer under a red hood, cheeky grin
const GC={skin:'#7bbf4a',skinD:'#569334',skinF:'#447a2a',skinL:'#a4dc6a',hood:'#a8443a',hoodD:'#7a2c25',hoodF:'#5e2019',tunic:'#c25a44',tunicD:'#8e3a2c',tunicF:'#6e2c22',belt:'#5a3a22',
  eye:'#e5484d',eyeRgb:'229,72,77',nail:'#3a2a1a',bow:'#8a5a2a',bowD:'#4a2e14',str:'#f3ead8',mouth:'#4a1818',tongue:'#e07a8a',fang:'#fff6e0',patch:'#6a7a8a',shoe:'#4a3222'};
function gobHead(V0,Hc,Rh,ph,o){const{P,F,c}=V0,h=P(Hc),at=Rh*.95;
  // the ears poke out of the hood: long rounded leaves pointing back, lighter inside
  const ear=sd=>{const b=add(Hc,[-.5,sd*Rh*.8,.5]),tp=add(Hc,[-Rh*.9,sd*Rh*1.85,Rh*.85]),m=add(Hc,[-Rh*.2,sd*Rh*1.4,Rh*.8]);
    ink(1.8);ctx.fillStyle=o.skin;ctx.beginPath();const B=P(b),T=P(tp),M=P(m),B2=P(add(b,[0,0,Rh*.6]));ctx.moveTo(B[0],B[1]);ctx.quadraticCurveTo(M[0]+1,M[1]+2.5,T[0],T[1]);ctx.quadraticCurveTo(M[0]-1,M[1]-1.5,B2[0],B2[1]);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=GC.skinL;ctx.beginPath();ctx.moveTo((B[0]*.6+B2[0]*.4),(B[1]*.6+B2[1]*.4));ctx.quadraticCurveTo(M[0]*.7+T[0]*.3+.5,M[1]*.7+T[1]*.3+1,T[0]-(T[0]-M[0])*.3,T[1]-(T[1]-M[1])*.3);ctx.quadraticCurveTo(M[0]-.4,M[1]-.2,(B[0]*.2+B2[0]*.8),(B[1]*.2+B2[1]*.8));ctx.closePath();ctx.fill()};
  for(const sd of[-1,1])if(F(0,sd,0)<0)ear(sd);
  // the hood: a ball of cloth over the head with the front cut away, a floppy tip that bobs behind, a patch sewn on the side
  ink(2.4);ball(h,Rh+1.4);ctx.fillStyle=o.hood;ctx.fill();ctx.stroke();
  ctx.save();ball(h,Rh+.4);ctx.clip();ctx.fillStyle=GC.hoodD;ell(h[0]+Rh*.45,h[1]+Rh*.7,Rh*1.2,Rh*.7);ctx.fill();ctx.fillStyle=GC.hoodF;ell(h[0]+Rh*.9,h[1]+Rh*.1,Rh*.5,Rh*1.1);ctx.fill();glowTop(h,Rh+1,.22);
  on(V0,Hc,at,[-.4,.75,.35],.05,q=>{ink(1);ctx.fillStyle=GC.patch;ctx.fillRect(q[0]-2.4,q[1]-2,4.8,4);ctx.strokeRect(q[0]-2.4,q[1]-2,4.8,4)});
  ctx.restore();rim(h,Rh+1.4,h,Rh+1.4,.3);
  {const bob=Math.sin(ph*2)*.6,tp=P(add(Hc,[-Rh*1.1,bob*.3,Rh*1.7+bob*.4])),m=P(add(Hc,[-Rh*.25,0,Rh*1.4]));ink(2.2);ctx.fillStyle=o.hood;ctx.beginPath();ctx.moveTo(h[0]-Rh*.55,h[1]-Rh*.85);ctx.quadraticCurveTo(m[0]-2,m[1],tp[0],tp[1]);ctx.quadraticCurveTo(m[0]+2,m[1]+1,h[0]+Rh*.5,h[1]-Rh*.9);ctx.fill();ctx.stroke();
    ctx.fillStyle=GC.hoodD;ball(tp,1.4);ctx.fill();ctx.stroke()}
  // the face in the opening of the hood: green skin, big red eyes with slanted brows, a round nose, a cheeky grin with two fangs
  on(V0,Hc,Rh*.4,[1,0,-.15],-.05,(q,v)=>{const k=cl(v*1.6,0,1),w=Rh*.84*Math.max(.3,k),hh=Rh*.84;ink(1.6);ctx.fillStyle=GC.hoodF;ctx.beginPath();ctx.ellipse(q[0],q[1],w+1,hh+1,0,0,TAU);ctx.fill();
    ctx.fillStyle=o.skin;ctx.beginPath();ctx.ellipse(q[0],q[1]+.4,w,hh,0,0,TAU);ctx.fill();ctx.save();ctx.clip();ctx.fillStyle=GC.skinD;ctx.beginPath();ctx.ellipse(q[0]+w*.35,q[1]+hh*.65,w,hh*.55,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(60,20,20,.2)';ctx.beginPath();ctx.ellipse(q[0],q[1]-hh*.7,w*1.1,hh*.3,0,0,TAU);ctx.fill();ctx.fillStyle=wa(.2);ctx.beginPath();ctx.ellipse(q[0]-w*.3,q[1]-hh*.05,w*.32,hh*.34,0,0,TAU);ctx.fill();ctx.restore();
    const op=o.open||0,sq=blink(ph/TAU,.46,.07);
    for(const sd of[-1,1]){const ex=q[0]-sd*w*.44,ey=q[1]-hh*.1;cEye([ex,ey],Rh*.26,GC.eye,k,{dy:.25,dx:-c*.3,sq});brow([ex,ey-Rh*.42],sd,Rh*.46,k,'#3a2a1a')}
    // the nose: a round green ball in the middle of the face
    ctx.fillStyle=GC.skinL;ink(1.2);ball([q[0]+c*w*.1,q[1]+hh*.26],Rh*.17);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ball([q[0]+c*w*.1-.5,q[1]+hh*.26-.6],.45);ctx.fill();
    // the mouth: a grin with two little fangs; open wide when it draws the bow or laughs
    const my=q[1]+hh*.6,mw=w*.6;if(op>.2){openMouth([q[0],my+op*1],mw*.7,1+op*2.4,GC.mouth,GC.tongue,GC.fang)}
    else{smile([q[0],my],mw,my-1,2.6);fangs([q[0],my],mw*.6,my+.2,1.8,GC.fang)}});
  for(const sd of[-1,1])if(F(0,sd,0)>=0)ear(sd)}
// the bow: an arc in the vertical plane beside the hand (held point hd), bent more when drawn (k), with the string and the nocked arrow
function gobBow(V0,hd,k,aim){const{P}=V0,ad=nrm(aim),bk=mul(ad,-1.2),top=add(add(hd,bk),[0,0,8.5]),bot=add(add(hd,bk),[0,0,-8.5]),mid=add(hd,mul(ad,2.8+k*1.6)),T=P(top),B=P(bot),M=P(mid),H=P(hd);
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=4.6;ctx.beginPath();ctx.moveTo(T[0],T[1]);ctx.quadraticCurveTo(M[0],M[1],B[0],B[1]);ctx.stroke();ctx.strokeStyle=GC.bow;ctx.lineWidth=2.2;ctx.stroke();
  ctx.strokeStyle=wa(.35);ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(T[0]-.6,T[1]);ctx.quadraticCurveTo(M[0]-.8,M[1],B[0]-.6,B[1]);ctx.stroke();
  const S=P(add(hd,mul(ad,-1.2-k*6)));ctx.strokeStyle=GC.str;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(T[0],T[1]);ctx.lineTo(S[0],S[1]);ctx.lineTo(B[0],B[1]);ctx.stroke();
  if(k>.05){const A=P(add(hd,mul(ad,-1.2-k*6))),E=P(add(hd,mul(ad,6.5)));ctx.strokeStyle=INK;ctx.lineWidth=2.6;seg(A,E);ctx.stroke();ctx.strokeStyle='#d8b878';ctx.lineWidth=1.1;seg(A,E);ctx.stroke();
    ctx.fillStyle='#e5484d';ink(.9);tri(A[0]+(A[0]-E[0])*.02,A[1]+(A[1]-E[1])*.02,A[0]+(A[0]-E[0])*.16,A[1]+(A[1]-E[1])*.16,1.1);ctx.fillStyle='#9a9aa6';tri(E[0]-(E[0]-A[0])*.1,E[1]-(E[1]-A[1])*.1,E[0]+(E[0]-A[0])*.12,E[1]+(E[1]-A[1])*.12,1.3)}
  for(const sd of[-1,1]){const w=P(add(hd,[0,0,sd*2.2]));ctx.fillStyle=GC.bowD;ball(w,1.1);ctx.fill()}}
function goblin(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU,walk=anim==='walk',atk=anim==='attack',idle=!walk&&!atk;
  // attack: .0-.42 draws the string back to the cheek and leans back, .42-.5 lets go (the hand recoils), .5-1 lowers the bow
  let draw=0,rel=0,lean=0;if(atk){if(p<.42){draw=ez(p/.42);lean=-draw*1.4}else if(p<.5){const k=(p-.42)/.08;draw=1-k;rel=1-k;lean=-1.4+k*2.4}else{const k=ez((p-.5)/.5);rel=0;lean=1*(1-k);draw=0}}
  // walk: a scurry on bent legs, quick short steps; idle: hunched, breathing, looking around
  const st=stepper(p,.5),fL=walk?st(0,2.6,1.9):NOSTEP,fR=walk?st(.5,2.6,1.9):NOSTEP,bob=walk?Math.abs(Math.sin(ph))*1.1:idle?Math.sin(ph)*.35:0;
  const hunch=2.4,Pv=[lean*.4,0,12.2+bob],Ch=[hunch+lean,0,18.8+bob],hy=idle?look(p,.6):walk?Math.sin(ph)*.12:0,
    Hc=add(Ch,[2.6-draw*.8,Math.sin(ph*(walk?2:1))*.3,7.2+(walk?Math.cos(ph*2)*.3:0)]),Rh=5.6;
  {const q=P(1,0,0);shadow(x+q[0]*sc,y+q[1]*sc,10*sc,4*sc,.34)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[],dT=D(Ch);
  for(const[sd,f] of[[-1,fL],[1,fR]]){const hip=add(Pv,[0,sd*2.8,-2.2]),foot=[1.2+f.x,sd*4,f.z],k=farK(F(0,sd,0));
    parts.push({d:dT-100+D(hip)*.01,f:()=>{leg(V0,hip,foot,{L1:5.2,L2:5.2,w1:3,w2:2.6,col:mix(GC.skin,GC.skinF,k),colD:'rgba(20,40,10,.3)',shoe:GC.shoe,heel:1.3,toe:3,sr:2.3,pole:[1,0,.1],ank:1.6});
      // three round toes with little nails
      const fq=P(add(foot,[3.4,sd*.6,0]));ink(.9);ctx.fillStyle=GC.nail;for(let i=-1;i<=1;i++){tri(fq[0]+i*1.2,fq[1],fq[0]+i*1.3,fq[1]+1.2,.55)}}})}
  parts.push({d:dT,f:()=>{trunk(V0,Pv,5.2,Ch,6.8,GC.tunic,GC.tunicD,4,{folds:[-1,-.3,.4,1.1,2.6,3.5],neck:1});
    // the belt with its golden buckle
    const bq=P(lerp3(Pv,Ch,.3));ctx.strokeStyle=GC.belt;ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(bq[0],bq[1],5.4,2.1,0,0,TAU);ctx.stroke();on(V0,lerp3(Pv,Ch,.3),5.4,[1,0,0],0,q=>{ink(1);ctx.fillStyle='#e8b84a';ctx.fillRect(q[0]-1.6,q[1]-1.4,3.2,2.8);ctx.strokeRect(q[0]-1.6,q[1]-1.4,3.2,2.8);ctx.fillStyle='#fff3c0';ctx.fillRect(q[0]-1,q[1]-.9,1,.8)});
    // a lighter patch sewn on the back of the tunic
    on(V0,Ch,6.3,[-1,.3,.1],.1,q=>{ink(1);ctx.fillStyle=GC.patch;ctx.fillRect(q[0]-2,q[1]-1.8,4,3.6);ctx.strokeRect(q[0]-2,q[1]-1.8,4,3.6)})}});
  // the bow arm (left) holds the bow out in front; the right hand draws the string to the cheek and lets go
  const shL=add(Ch,[0,-5.4,2.4]),shR=add(Ch,[0,5.4,2.4]),bowH=add(Ch,[7.5+draw*3,-6.4+draw*4.2,.5+draw*2.2-lean*.3]),
    strH=atk?lerp3(add(Ch,[6,2.6,1.5]),add(Ch,[2.2,2.4,6.2]),draw):walk?add(Ch,[2+Math.sin(ph)*1.6,5.6,-1]):add(Ch,[2.4,5.4,-1.2]);
  parts.push({d:D(add(shL,[6,0,0])),f:()=>{const {h}=zArm(V0,shL,bowH,[-.2,-.8,-.6],{side:-1,L1:5,L2:5,w1:3.2,we:2.8,w2:2.3,hand:1.7,fl:4.6,skin:mix(GC.skin,GC.skinF,farK(F(0,-1,0))),cloth:GC.tunic,clothD:'rgba(0,0,0,.25)',sleeve:4,sleeveK:.4,noHand:true,body:()=>hull(P(Pv),4.2,P(Ch),5.6)});
    gobBow(V0,h,draw,lerp3([0,-1,.05],[1,-.05,0],Math.max(draw,rel)));fist(V0,h,2,GC.skin)}});
  parts.push({d:D(add(shR,[4,0,0]))+.002,f:()=>{zArm(V0,shR,strH,[-.3,.9,-.4],{side:1,L1:5,L2:5,w1:3.2,we:2.8,w2:2.3,hand:1.7,fl:4.6,skin:mix(GC.skin,GC.skinF,farK(F(0,1,0))),cloth:GC.tunic,clothD:'rgba(0,0,0,.25)',sleeve:4,sleeveK:.4,pd:[0,-1,0],body:()=>hull(P(Pv),4.2,P(Ch),5.6)})}});
  parts.push({d:D(Hc),f:()=>{neck(V0,add(Ch,[1.4,0,5.4]),2.6,add(Hc,[-.8,0,-4.2]),2.4,GC.skin);const Vh=Vat(face+hy,P(Hc),D(Hc));gobHead(Vh,[0,0,0],Rh,ph,{skin:GC.skin,hood:GC.hood,open:atk?draw*.9:idle&&p>.62&&p<.8?.5*Math.sin((p-.62)/.18*Math.PI):0})}});
  run(parts);ctx.restore()}

// ------------------------------------------------------------------ SKELETON: clean bone, two red lights in the sockets, a jaw that clacks; crossbow and shield
const KC={bone:'#d9d2c0',boneD:'#b0a68e',boneF:'#8f8470',cav:'#3a302a',eye:'#e5484d',eyeRgb:'229,72,77',wood:'#8a5a2a',woodD:'#4a2e14',iron:'#6a6a74',ironL:'#9a9aa6',shield:'#8a6a3a',shieldD:'#5a4424',crest:'#e5484d',str:'#f3ead8',cloth:'#4a6a8a',clothD:'#2e4a66'};
function skull(V0,Hc,Rh,ph,o){const{P,F,c}=V0,h=P(Hc),at=Rh*.95;
  ink(2.4);ball(h,Rh);ctx.fillStyle=KC.bone;ctx.fill();ctx.stroke();
  ctx.save();ball(h,Rh-1.1);ctx.clip();ctx.fillStyle=KC.boneD;ell(h[0]+Rh*.35,h[1]+Rh*.7,Rh*1.15,Rh*.6);ctx.fill();ctx.fillStyle=KC.boneF;ell(h[0]+Rh*.85,h[1],Rh*.45,Rh*1.05);ctx.fill();glowTop(h,Rh,.22);
  // one soft suture line on top, like every cartoon skull
  on(V0,Hc,at,[-.3,.1,.95],0,q=>{ctx.strokeStyle='rgba(60,45,30,.35)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(q[0]-2.5,q[1]+.6);for(let i=0;i<5;i++)ctx.lineTo(q[0]-2.5+i*1.25,q[1]+(i%2?-.6:.6));ctx.stroke()});
  // the sockets: round and dark, each with a steady red light and a point of white
  for(const sd of[-1,1])on(V0,Hc,at,[.8,sd*.4,.12],0,(q,v)=>{const k=cl(v*1.6,0,1);ink(1.5);ctx.fillStyle=KC.cav;ctx.beginPath();ctx.ellipse(q[0],q[1],Rh*.3*Math.max(.45,v),Rh*.32,0,0,TAU);ctx.fill();ctx.stroke();pip([q[0]+c*.2,q[1]+.2],Rh*.11,KC.eye,KC.eyeRgb,k)});
  // the nose: a little heart-shaped hole
  on(V0,Hc,at,[1,0,-.25],.05,(q,v)=>{ctx.fillStyle=KC.cav;ctx.beginPath();ctx.moveTo(q[0],q[1]-1.2);ctx.lineTo(q[0]+1.1*v,q[1]+1);ctx.lineTo(q[0]-1.1*v,q[1]+1);ctx.closePath();ctx.fill()});
  ctx.restore();rim(h,Rh,h,Rh,.3);
  // the upper teeth on the skull, then the jaw: a separate bone hanging under it that swings and clacks
  on(V0,Hc,at,[.95,0,-.5],.05,(q,v)=>{ctx.save();ctx.globalAlpha=cl(v*2,0,1);teethRow([q[0],q[1]],Rh*.46*Math.max(.4,v),q[1]-.8,5,1.6,1,KC.bone);ctx.restore()});
  const op=o.open||0,J=add(Hc,[Rh*.25,0,-Rh*.75-op*2.2]),j=P(J),jv=F(1,0,-.4);
  if(jv>-.6){ctx.save();ctx.globalAlpha=cl((jv+.6)*2,0,1);const w=Rh*.62*Math.max(.35,Math.abs(V0.c)*.6+.4),hh=Rh*.3;ink(1.8);ctx.fillStyle=KC.bone;ctx.beginPath();ctx.ellipse(j[0],j[1],w,hh,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle=KC.cav;ctx.beginPath();ctx.ellipse(j[0],j[1]-hh*.35,w*.8,hh*.5+op*1.2,0,0,TAU);ctx.fill();teethRow([j[0],j[1]],w*.66,j[1]-hh*.2,4,1.4,-1,KC.bone);
    ctx.strokeStyle='rgba(60,45,30,.5)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(j[0]-w*.9,j[1]-hh);ctx.lineTo(j[0]-w*1.1,j[1]-Rh*.55);ctx.moveTo(j[0]+w*.9,j[1]-hh);ctx.lineTo(j[0]+w*1.1,j[1]-Rh*.55);ctx.stroke();ctx.restore()}}
// the ribcage over the dark cavity of the chest, the spine down the back, the pelvis bone
function ribcage(V0,Pv,rP,Ch,rC){const{P,F}=V0,a=P(Pv),b=P(Ch);ink(2.4);hull(a,rP,b,rC);ctx.fillStyle=KC.cav;ctx.fill();ctx.stroke();
  ctx.save();hull(a,rP-1,b,rC-1);ctx.clip();ctx.fillStyle='rgba(0,0,0,.35)';ell(b[0]+rC*.6,b[1]+rC*.3,rC*.8,rC);ctx.fill();
  // ribs: arcs on the front and the sides, fading as they turn away
  for(let i=0;i<4;i++){const z=.75-i*.42;for(const sd of[-1,1])on(V0,lerp3(Pv,Ch,.55+i*.1),lerp(rP,rC,.55+i*.1)-.4,[.6,sd*.75,z*.4],-.25,(q,v)=>{ctx.strokeStyle=INK;ctx.lineWidth=3.4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q[0]-sd*4.4*v,q[1]-1.2);ctx.quadraticCurveTo(q[0]-sd*1*v,q[1]+1.9,q[0]+sd*3*v,q[1]+1);ctx.stroke();ctx.strokeStyle=KC.bone;ctx.lineWidth=2.1;ctx.stroke();
      ctx.strokeStyle=wa(.3);ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(q[0]-sd*4*v,q[1]-1.5);ctx.quadraticCurveTo(q[0]-sd*1*v,q[1]+1.4,q[0]+sd*2.6*v,q[1]+.5);ctx.stroke()})}
  // the sternum in front, the spine behind
  on(V0,lerp3(Pv,Ch,.75),lerp(rP,rC,.75),[1,0,.1],.1,q=>{ctx.strokeStyle=KC.bone;ctx.lineWidth=2.4;ctx.lineCap='round';seg([q[0],q[1]-4],[q[0],q[1]+4]);ctx.stroke()});
  for(let i=0;i<5;i++)on(V0,lerp3(Pv,Ch,.2+i*.18),lerp(rP,rC,.2+i*.18),[-1,0,0],.2,q=>{ink(1.2);ctx.fillStyle=KC.boneD;ball(q,1.5);ctx.fill();ctx.stroke()});
  ctx.restore();
  // the pelvis: a bone bowl at the bottom
  const pq=P(add(Pv,[0,0,-1.2]));ink(2);ctx.fillStyle=KC.bone;ctx.beginPath();ctx.ellipse(pq[0],pq[1],rP+.8,rP*.55,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=KC.cav;ctx.beginPath();ctx.ellipse(pq[0],pq[1]+.4,rP*.45,rP*.3,0,0,TAU);ctx.fill();rim(pq,rP+.8,pq,rP+.8,.25)}
// the crossbow: stock along dir from the hand, bow limbs across it, string, a bolt in the groove; k = how much the string is drawn
function crossbow(V0,hd,dir,k){const{P}=V0;dir=nrm(dir);let side=cross(dir,[0,0,1]);if(len(side)<.2)side=[0,1,0];side=nrm(side);
  const b0=add(hd,mul(dir,-6.5)),b1=add(hd,mul(dir,9)),B0=P(b0),B1=P(b1);ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=5.6;seg(B0,B1);ctx.stroke();ctx.strokeStyle=KC.wood;ctx.lineWidth=3.2;seg(B0,B1);ctx.stroke();
  ctx.strokeStyle=wa(.35);ctx.lineWidth=.8;seg([B0[0]-.6,B0[1]-.6],[B1[0]-.6,B1[1]-.6]);ctx.stroke();
  const c3=add(hd,mul(dir,6.6)),L=P(add(c3,mul(side,-8.5))),Rr=P(add(c3,mul(side,8.5))),C=P(c3),back=add(c3,mul(dir,-2-k*4)),Bk=P(back);
  ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(L[0],L[1]);ctx.quadraticCurveTo(C[0]+(C[0]-Bk[0])*.4,C[1]+(C[1]-Bk[1])*.4,Rr[0],Rr[1]);ctx.stroke();ctx.strokeStyle=KC.iron;ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle=KC.str;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L[0],L[1]);ctx.lineTo(Bk[0],Bk[1]);ctx.lineTo(Rr[0],Rr[1]);ctx.stroke();
  const T=P(add(c3,mul(dir,4.5)));ctx.strokeStyle=INK;ctx.lineWidth=2.6;seg(Bk,T);ctx.stroke();ctx.strokeStyle='#b09a74';ctx.lineWidth=1;seg(Bk,T);ctx.stroke();ctx.fillStyle=KC.cloth;ink(.9);tri(Bk[0]+(Bk[0]-T[0])*.02,Bk[1]+(Bk[1]-T[1])*.02,Bk[0]+(Bk[0]-T[0])*.2,Bk[1]+(Bk[1]-T[1])*.2,1);ctx.fillStyle=KC.ironL;tri(T[0]-(T[0]-Bk[0])*.1,T[1]-(T[1]-Bk[1])*.1,T[0]+(T[0]-Bk[0])*.14,T[1]+(T[1]-Bk[1])*.14,1.1);
  const tq=P(add(hd,mul(dir,-2.4)));ctx.fillStyle=KC.iron;ink(1);ctx.beginPath();ctx.arc(tq[0],tq[1]+1.6,1.4,0,TAU);ctx.fill();ctx.stroke()}
// the shield on the forearm: an oval of planks with an iron rim and a red crest; cracks only appear as it wears (dmg 0..1)
function shieldOn(V0,c3,n,dmg){const{P,F}=V0;n=nrm(n);const v=F(n);if(v<-.95)return;let u=cross(n,[0,0,1]);if(len(u)<.2)u=[0,1,0];u=nrm(u);const w=cross(n,u),rx=5.2,ry=6.4,pts=[];
  for(let i=0;i<22;i++){const a=i/22*TAU;pts.push(P(add(add(c3,mul(u,Math.cos(a)*rx)),mul(w,Math.sin(a)*ry))))}
  const path=()=>{ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.closePath()};
  ink(2.4);path();ctx.fillStyle=KC.shield;ctx.fill();ctx.stroke();ctx.save();path();ctx.clip();const c=P(c3);
  if(v>0){for(let i=-1;i<=1;i++){const a=P(add(add(c3,mul(u,i*3.2)),mul(w,-ry))),b=P(add(add(c3,mul(u,i*3.2)),mul(w,ry)));ctx.strokeStyle='rgba(40,25,10,.4)';ctx.lineWidth=1;seg(a,b);ctx.stroke()}
    ctx.fillStyle=KC.crest;ctx.beginPath();ctx.moveTo(c[0],c[1]-3.2*v-2.6);ctx.lineTo(c[0]+3*v,c[1]);ctx.lineTo(c[0],c[1]+3.8);ctx.lineTo(c[0]-3*v,c[1]);ctx.closePath();ctx.fill();ctx.fillStyle='#ff8a8a';ball([c[0]-1*v,c[1]-1.6],.7);ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.26)';ctx.beginPath();for(let i=0;i<22;i++){const a=i/22*TAU;const q=P(add(add(c3,mul(u,Math.cos(a)*rx*.8+1.2)),mul(w,Math.sin(a)*ry*.8+1.4)));ctx.lineTo(q[0],q[1])}ctx.closePath();ctx.fill();
    glowTop(c,ry,.16);
    if(dmg>0){ctx.strokeStyle='rgba(40,25,10,.85)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(c[0]-rx*.6*v,c[1]-ry*.7);ctx.lineTo(c[0]-rx*.1*v,c[1]-ry*.1);ctx.lineTo(c[0]-rx*.5*v,c[1]+ry*.6);if(dmg>.5){ctx.moveTo(c[0]+rx*.5*v,c[1]-ry*.4);ctx.lineTo(c[0]+rx*.15*v,c[1]+ry*.3)}ctx.stroke()}}
  else{ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(c[0]-10,c[1]-10,20,20);ctx.strokeStyle=KC.wood;ctx.lineWidth=2;seg([c[0],c[1]-ry*.6],[c[0],c[1]+ry*.6]);ctx.stroke()}
  ctx.restore();ctx.strokeStyle=KC.iron;ctx.lineWidth=1.6;path();ctx.stroke();
  for(let i=0;i<8;i++){const q=pts[i*22/8|0];ctx.fillStyle=KC.ironL;ball(q,.8);ctx.fill()}
  if(dmg>.5&&v>0){ctx.fillStyle=KC.cav;ctx.beginPath();const q=pts[3];ctx.moveTo(q[0]-2,q[1]-1);ctx.lineTo(q[0]+1.5,q[1]+1.5);ctx.lineTo(q[0]-1.5,q[1]+2.5);ctx.closePath();ctx.fill()}}
function skeleton(x,y,face,anim,p,sc,o){sc=sc||1.1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU,walk=anim==='walk',atk=anim==='attack',idle=!walk&&!atk,shield=o.shield==null?1:o.shield;
  // attack: .0-.3 raises the crossbow to the eye and aims, .3-.38 shoots (recoil), .38-1 lowers it and cranks the string back
  let aim=0,kick=0,crank=0;if(atk){if(p<.3)aim=ez(p/.3);else if(p<.38){aim=1;kick=1-(p-.3)/.08}else{const k=(p-.38)/.62;aim=1-ez(Math.min(1,k*1.6));crank=Math.sin(k*Math.PI)}}
  // walk: stiff jerky steps, the hips twist; idle: stands straight, tilts the head curiously, the jaw clacks once
  const st=stepper(p,.52),fL=walk?st(0,3.2,2.4):NOSTEP,fR=walk?st(.5,3.2,2.4):NOSTEP,bob=walk?Math.abs(Math.sin(ph))*.9:idle?Math.sin(ph)*.25:0,tw=walk?Math.sin(ph)*.9:0;
  const Pv=[0,tw*.3,12.6+bob],Ch=[1.2,tw,20.4+bob],tilt=idle?Math.sin(ph*.5)*.18*Math.sin(ph):walk?Math.sin(ph*2)*.08:aim*-.15,
    Hc=add(Ch,[1.4,tilt*4.5,10.2+(walk?Math.cos(ph*2)*.3:0)-Math.abs(tilt)*.8]),Rh=6.4,hy=idle?look(p,.5):0;
  {const q=P(.8,0,0);shadow(x+q[0]*sc,y+q[1]*sc,10.5*sc,4.2*sc,.34)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[],dT=D(Ch);
  for(const[sd,f] of[[-1,fL],[1,fR]]){const hip=add(Pv,[0,sd*3.1,-2.4]),foot=[.8+f.x,sd*3.9,f.z],[kn,ft]=ik(hip,add(foot,[0,0,1.4]),5.2,5.2,[1,0,.12]),k=farK(F(0,sd,0)),col=mix(KC.bone,KC.boneF,k);
    parts.push({d:dT-100+D(hip)*.01,f:()=>{const pts=[P(hip),P(kn),P(ft)];bone(pts,[1.9,1.6,1.4],col,()=>{
        // the foot: a heel knob, the arch bone down to the ball of the foot, then three toes of two little bones each, with their knuckles
        const heel=add(ft,[-1.5,0,-.6]),bl=add(ft,[2.1,sd*.15,-1]);bone([P(add(ft,[0,0,.3])),P(heel),P(bl)],[1.3,1.45,1.25],col,null,[[P(heel),1.5]]);shadeLimb([P(heel),P(bl)],[1.45,1.25],'rgba(40,30,20,.3)');
        for(const i of[-1,0,1]){const a=add(bl,[.3,i*1.1,.05]),m=add(bl,[1.6,i*1.35,-.05]),t=add(bl,[2.7,i*1.5,-.1]);bone([P(a),P(m),P(t)],[.8,.75,.65],col,null,[[P(m),.85]])}},[[P(kn),2.1]]);shadeLimb(pts,[1.9,1.6,1.4],'rgba(40,30,20,.3)')}})}
  parts.push({d:dT,f:()=>{ribcage(V0,Pv,5.2,Ch,7.2);
    // a blue pennant of cloth knotted on the shoulder, swinging
    on(V0,Ch,7,[-.2,-.9,.4],-.1,q=>{const sw=Math.sin(ph*(walk?2:1))*1.2;ink(1.4);ctx.fillStyle=KC.cloth;ctx.beginPath();ctx.moveTo(q[0]-2.5,q[1]-1);ctx.lineTo(q[0]+2.5,q[1]-1);ctx.lineTo(q[0]+.6+sw,q[1]+7.5);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=KC.clothD;ctx.beginPath();ctx.moveTo(q[0]+.4,q[1]-1);ctx.lineTo(q[0]+2.5,q[1]-1);ctx.lineTo(q[0]+.6+sw,q[1]+7.5);ctx.closePath();ctx.fill()})}});
  // right arm: the shield strapped to the forearm, held low at rest and raised to the chest when walking into fire
  const shR=add(Ch,[.5,6.6,3.6]),hR=add(Ch,[4.5+aim*1,7.8-aim*2,-1+aim*4.5]),shL=add(Ch,[.5,-6.6,3.6]),
    hL=atk?lerp3(add(Ch,[6,-5.5,-.5]),add(Ch,[7.5,-2.4,8.6]),aim):walk?add(Ch,[5+Math.sin(ph)*.6,-6,-.5]):add(Ch,[5.5,-5.8,-.8]),dirL=atk?nrm(sub(add(Ch,[20,-2.4+kick*1.5,8.6]),hL)):[1,-.1,-.25];
  parts.push({d:D(add(shR,[4,0,0]))+.002,f:()=>{const r=zArm(V0,shR,hR,[-.2,.9,-.5],{side:1,L1:5.4,L2:5.4,bony:1,w1:3.4,we:3,w2:2.3,hand:1.7,fl:5,skin:mix(KC.bone,KC.boneF,farK(F(0,1,0))),cloth:KC.cloth,sleeve:0,shade:'rgba(40,30,20,.3)',pd:[0,1,0]});
    if(shield>0)shieldOn(V0,lerp3(r.el,r.h,.55),[.9,.6,.15],cl(1-shield,0,1))}});
  parts.push({d:D(add(shL,[5,0,0]))+.001,f:()=>{const r=zArm(V0,shL,hL,[-.2,-.9,-.6],{side:-1,L1:5.4,L2:5.4,bony:1,w1:3.4,we:3,w2:2.3,hand:1.7,fl:5,skin:mix(KC.bone,KC.boneF,farK(F(0,-1,0))),cloth:KC.cloth,sleeve:0,shade:'rgba(40,30,20,.3)',noHand:true});
    crossbow(V0,r.h,dirL,crank*.9+(aim>.9&&!kick?.6:0));fist(V0,r.h,2,mix(KC.bone,KC.boneF,farK(F(0,-1,0))));
    if(kick>0){const m=P(add(r.h,mul(dirL,12)));shine('255,220,160',m[0],m[1],8*kick,.6*kick)}}});
  parts.push({d:D(Hc),f:()=>{// the neck: a few vertebrae
    for(let i=0;i<3;i++){const q=P(lerp3(add(Ch,[1.2,0,6.6]),add(Hc,[-.6,0,-5]),i/2));ink(1.2);ctx.fillStyle=KC.boneD;ball(q,1.7-i*.15);ctx.fill();ctx.stroke()}
    const Vh=Vat(face+hy,P(Hc),D(Hc));skull(Vh,[0,0,0],Rh,ph,{open:atk?aim*.7:idle?(p>.3&&p<.4?.9*Math.sin((p-.3)/.1*Math.PI):.15):.25+.2*Math.sin(ph*2)})}});
  run(parts);ctx.restore()}

// ------------------------------------------------------------------ SLIME: the very same slime as the game (drawSlime in 16-creature.js): a plain
// green blob with the white highlight, two round eyes with the pupils that look where it goes, a little smile, a dark patch on the back.
// Only the moves come from the method (hop, lunge), and the eyes slide round the blob as it turns instead of jumping between views
const LC2={gel:'#8fd14f'};
function slime(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,F,c,s}=V0,ph=p*TAU,walk=anim==='walk',atk=anim==='attack',col=o.gel||LC2.gel;
  // hop: squashes to load, leaps stretched, splats; attack: rears back, lunges forward with the mouth open, settles
  let sq=1,hop=0,lean=0,open=0;
  if(walk){if(p<.22){sq=1-.2*ez(p/.22)}else if(p<.6){const k=(p-.22)/.38;hop=Math.sin(k*Math.PI)*7;sq=1.14-.06*k;lean=1.5}else if(p<.72){const k=(p-.6)/.12;sq=.78+.08*k}else{const k=ez((p-.72)/.28);sq=.86+.14*k}}
  else if(atk){if(p<.3){const k=ez(p/.3);lean=-2.6*k;sq=1-.1*k;open=k}else if(p<.45){const k=ez((p-.3)/.15);lean=-2.6+10.6*k;sq=.9+.22*k;open=1}else{const k=ez((p-.45)/.55);lean=8*(1-k);sq=1.12-.12*k;open=1-k}}
  else{sq=1-.06*Math.sin(ph)}
  const r=13,sx=1/Math.sqrt(sq),sy=sq,g=P(lean*.5,0,0),qx=g[0],qy=g[1]-r*.2-hop,qa=Math.atan2(s*.55,c);// qa: where it faces, on the screen
  shadow(x+qx*sc,y+(g[1]+r*.55)*sc,r*sc*(1-hop/40),r*.4*sc*(1-hop/40));
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ink(2.5);
  ell(qx,qy,r*1.08*sx,r*.92*sy);ctx.fillStyle=col;ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.4)';ell(qx-r*.35*sx,qy-r*.6*sy,r*.25,r*.15);ctx.fill();
  // the face: each eye shows while its side of the blob faces the camera (the far one hides in the side view, like before)
  const cx=qx+Math.cos(qa)*r*.42,cy=qy+Math.sin(qa)*r*.18-r*.25,sp=r*.32*Math.sqrt(Math.abs(Math.sin(qa)));
  for(const k of[-1,1]){const v=F(1,k*.6,.3);if(v<=0)continue;ctx.save();ctx.globalAlpha=cl(v*4,0,1);ctx.fillStyle='#fff';ball([cx+k*sp,cy],r*.22);ctx.fill();ctx.fillStyle=INK;ball([cx+k*sp+Math.cos(qa)*r*.07,cy+Math.sin(qa)*r*.06],r*.11);ctx.fill();ctx.restore()}
  {const v=F(1,0,-.1);if(v>0){ctx.save();ctx.globalAlpha=cl(v*3,0,1);if(open>.2){ctx.fillStyle=INK;ell(cx,cy+r*.3+open*r*.05,r*.15*(1+open*.5),r*.08+open*r*.16);ctx.fill()}
    else{ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy+r*.3,r*.15,.2,Math.PI-.2);ctx.stroke()}ctx.restore()}}
  {const v=-F(1,0,0);if(v>.1){ctx.save();ctx.globalAlpha=cl((v-.1)*3,0,1)*.12;ctx.fillStyle='#000';ell(qx,qy+r*.1,r*.6,r*.4);ctx.fill();ctx.restore()}}
  ctx.restore()}

// ------------------------------------------------------------------ BAT: a big round head with huge yellow eyes and tall pink ears on a little furry
// body, hovering upright; wide wings with three long fingers and scalloped edges, held so the camera sees the membrane almost face on
const BC2={fur:'#8a5bc4',furD:'#5d3a8f',furF:'#46296e',skin:'#c48ad8',memb:'#a77ad6',membD:'#7a52a8',membL:'#c9a4ea',eye:'#e8a020',mouth:'#3a1a3a',tongue:'#e07a8a',fang:'#fff6e0',ear:'#e9a0c0',nail:'#3a2a44',nose:'#5a2a66'};
function bat(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F,c}=V0,ph=p*TAU,fly=anim==='walk',atk=anim==='attack',idle=!fly&&!atk;
  // attack: .0-.3 rears up and opens wide, .3-.55 dives forward and down with the wings swept back, bites, .55-1 climbs back
  let dive=0,climb=0,open=0,sweep=0;if(atk){if(p<.3){const k=ez(p/.3);climb=k;open=k}else if(p<.55){const k=(p-.3)/.25;dive=Math.sin(k*Math.PI);climb=1-k;open=k<.6?1:.3;sweep=Math.sin(k*Math.PI)}else{const k=ez((p-.55)/.45);open=.3*(1-k)}}
  // the flap beats the wings about the shoulders; hovering, the whole bat bobs up and down and pitches a little in the dive
  const flap=fly?Math.sin(ph*2):atk?Math.sin(ph*3)*.6:Math.sin(ph)*.85,bob=fly?Math.cos(ph*2)*1.2:idle?Math.sin(ph)*1.4:0,lean=dive*.9-climb*.3,
    Rb=3.9,Rh=5.4,C=[dive*9-climb*2,0,17+bob+climb*5-dive*9],Hc=add(C,[1+lean*4,0,Rb+Rh-1.4-Math.abs(lean)*1.5]),hy=idle?look(p,.5):0;
  {const q=P(C[0],0,0);shadow(x+q[0]*sc,y+q[1]*sc,(8-dive*1.5)*sc,3.2*sc,.22+dive*.1)}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[];
  // a wing lives in its own tilted plane: U runs along the span (turned up and down by the flap, swept back a little), Wc down
  // the chord. The membrane hangs down from the arm toward the camera (V0.s, V0.c is the way to the camera in body space), so
  // from the front and from behind the camera sees it wide, and it turns smoothly in between; in the dive the wings sweep back
  const th=.68-sweep*.4,be=.2+sweep*.5,wing=sd=>{const phi=flap*.5+.25-sweep*.2,cb=Math.cos(be),U=[-Math.sin(be),sd*cb*Math.cos(phi),cb*Math.sin(phi)],W0=[V0.s*Math.cos(th),V0.c*Math.cos(th),-Math.sin(th)],Wc=nrm(sub(W0,mul(U,dot(U,W0)))),
      S=add(C,[.6,sd*2.4,1.8]),pt=(u,w)=>add(add(S,mul(U,u)),mul(Wc,w)),E=pt(5.2,-2.6),W=pt(9.6,-1),T1=pt(14.6,1.6),T2=pt(12.8,6),T3=pt(9,9.2),H=pt(1.5,7.8),
      ps=[S,E,W,T1,T2,T3,H].map(P),k=farK(F(0,sd,.3)),col=mix(BC2.membL,BC2.memb,k),scal=(a,b,pull)=>{const m=lerp3(a,b,.5),cq=P(add(m,mul(sub(W,m),pull))),q=P(b);ctx.quadraticCurveTo(cq[0],cq[1],q[0],q[1])};
    return{d:D(C)+(D(add(C,[0,sd*3,0]))-D(C))*2-.01,f:()=>{ctx.lineJoin='round';ink(2.4);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(ps[0][0],ps[0][1]);ctx.lineTo(ps[1][0],ps[1][1]);ctx.lineTo(ps[2][0],ps[2][1]);ctx.lineTo(ps[3][0],ps[3][1]);
        scal(T1,T2,.22);scal(T2,T3,.22);scal(T3,H,.16);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.save();ctx.clip();ctx.fillStyle=BC2.membD;ctx.beginPath();ctx.moveTo(ps[0][0],ps[0][1]);ctx.lineTo(ps[1][0],ps[1][1]);ctx.lineTo(ps[6][0],ps[6][1]);ctx.closePath();ctx.fill();
        ctx.fillStyle=wa(.12);ctx.beginPath();ctx.moveTo(ps[2][0],ps[2][1]);ctx.lineTo(ps[3][0],ps[3][1]);ctx.lineTo(ps[4][0],ps[4][1]);ctx.closePath();ctx.fill();
        ctx.restore();
        // the arm and the three fingers over the membrane, a knob at the elbow, the little thumb claw at the wrist
        ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(ps[0][0],ps[0][1]);ctx.lineTo(ps[1][0],ps[1][1]);ctx.lineTo(ps[2][0],ps[2][1]);ctx.stroke();ctx.strokeStyle=mix(BC2.fur,BC2.furF,k);ctx.lineWidth=2;ctx.stroke();
        ctx.strokeStyle=INK;ctx.lineWidth=2.3;ctx.beginPath();for(const t of[T1,T2,T3]){const q=P(t);ctx.moveTo(ps[2][0],ps[2][1]);ctx.lineTo(q[0],q[1])}ctx.stroke();ctx.strokeStyle=mix(BC2.memb,BC2.membD,k);ctx.lineWidth=1;ctx.stroke();
        ctx.fillStyle=mix(BC2.fur,BC2.furF,k);ball(ps[1],1.5);ctx.fill();const cw=P(add(W,mul(Wc,-1.8)));ctx.fillStyle=BC2.nail;ink(.8);tri(ps[2][0],ps[2][1],cw[0],cw[1],.7)}}};
  parts.push(wing(-1));parts.push(wing(1));
  // the body: fluffy tufts first (only their tips peek out), then a furry ball with a pale belly, two little feet tucked under
  parts.push({d:D(C),f:()=>{const b=P(C);ctx.fillStyle=BC2.fur;ink(1.4);for(let i=-1;i<=1;i++)tri(b[0]+i*Rb*.5,b[1]+Rb*.5,b[0]+i*Rb*.65,b[1]+Rb*1.35,1.1);
    ink(2.4);ball(b,Rb);ctx.fillStyle=BC2.fur;ctx.fill();ctx.stroke();ctx.save();ball(b,Rb-1);ctx.clip();ctx.fillStyle=BC2.furD;ell(b[0]+Rb*.4,b[1]+Rb*.6,Rb,Rb*.7);ctx.fill();
    on(V0,C,Rb,[.7,0,-.3],-.1,q=>{ctx.fillStyle=BC2.skin;ell(q[0],q[1],Rb*.55,Rb*.5);ctx.fill()});glowTop(b,Rb,.2);ctx.restore();rim(b,Rb,b,Rb,.3);
    for(const sd of[-1,1]){const f0=add(C,[.4,sd*1.5,-Rb+.4]),f1=add(f0,[1.3,sd*.3,-2.4]);ctx.strokeStyle=INK;ctx.lineWidth=2.6;seg(P(f0),P(f1));ctx.stroke();ctx.strokeStyle=BC2.skin;ctx.lineWidth=1.1;seg(P(f0),P(f1));ctx.stroke();const q=P(f1);ink(.8);ctx.fillStyle=BC2.nail;for(let i=-1;i<=1;i+=2)tri(q[0],q[1],q[0]+i*.9,q[1]+1.2,.45)}}});
  // the head: tall ears, cheek tufts, the ball in three tones, then the face with its huge eyes, pink muzzle, little nose and two fangs
  parts.push({d:D(Hc)+.01,f:()=>{const Vh=Vat(face+hy,P(Hc),D(Hc)),H=[0,0,0],h=Vh.P(H);
    for(const sd of[-1,1])if(Vh.F(-.3,sd,.6)<0)batEar(Vh,H,Rh,sd,ph);
    ctx.fillStyle=BC2.fur;ink(1.4);for(const sd of[-1,1]){tri(h[0]+sd*Rh*.55,h[1]+Rh*.2,h[0]+sd*Rh*1.35,h[1]+Rh*.45,1.4);tri(h[0]+sd*Rh*.6,h[1]+Rh*.5,h[0]+sd*Rh*1.2,h[1]+Rh*.95,1.2)}
    ink(2.4);ball(h,Rh);ctx.fillStyle=BC2.fur;ctx.fill();ctx.stroke();ctx.save();ball(h,Rh-1);ctx.clip();ctx.fillStyle=BC2.furD;ell(h[0]+Rh*.4,h[1]+Rh*.7,Rh,Rh*.6);ctx.fill();ctx.fillStyle=BC2.furF;ell(h[0]+Rh*.9,h[1]+Rh*.1,Rh*.4,Rh);ctx.fill();glowTop(h,Rh,.22);ctx.restore();rim(h,Rh,h,Rh,.3);
    on(Vh,H,Rh*.95,[1,0,-.1],-.05,(q,v)=>{const k=cl(v*1.6,0,1),w=Rh*.85*Math.max(.3,k),bl=blink(p,.55,.08);
      ctx.fillStyle=BC2.skin;ctx.beginPath();ctx.ellipse(q[0],q[1]+Rh*.38,w*.62,Rh*.42,0,0,TAU);ctx.fill();
      for(const sd of[-1,1]){const ex=q[0]-sd*w*.52,ey=q[1]-Rh*.22;cEye([ex,ey],Rh*.34,BC2.eye,k,{dy:.15,dx:-Vh.c*.3,sq:atk?1:bl})}
      ctx.fillStyle=BC2.nose;ctx.beginPath();ctx.ellipse(q[0],q[1]+Rh*.22,w*.2,Rh*.12,0,0,TAU);ctx.fill();ctx.fillStyle='#2a1030';ball([q[0]-w*.07,q[1]+Rh*.24],.4);ctx.fill();ball([q[0]+w*.07,q[1]+Rh*.24],.4);ctx.fill();
      const my=q[1]+Rh*.56,mw=w*.42;if(open>.2)openMouth([q[0],my+open*1.2],mw*(.8+open*.5),.8+open*3.4,BC2.mouth,BC2.tongue,BC2.fang);
      else{smile([q[0],my],mw,my-.7,1.8);fangs([q[0],my],mw*.6,my-.2,1.6,BC2.fang)}});
    for(const sd of[-1,1])if(Vh.F(-.3,sd,.6)>=0)batEar(Vh,H,Rh,sd,ph)}});
  run(parts);ctx.restore()}
// a tall rounded ear on the top of the head, pink inside, wiggling a little
function batEar(Vh,H,Rh,sd,ph){const{P}=Vh,wig=Math.sin(ph*2+sd)*.25,B=P(add(H,[-.4,sd*Rh*.9,Rh*.4])),B2=P(add(H,[.3,sd*Rh*.12,Rh*.98])),T=P(add(H,[-1.6,sd*(Rh*1.3+wig),Rh*2.2])),
    Mo=P(add(H,[-1.2,sd*Rh*2.2,Rh*1.25])),Mi=P(add(H,[-.4,sd*Rh*.55,Rh*1.75])),mid=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k];
  ink(1.8);ctx.lineJoin='round';ctx.fillStyle=BC2.fur;ctx.beginPath();ctx.moveTo(B[0],B[1]);ctx.quadraticCurveTo(Mo[0],Mo[1],T[0],T[1]);ctx.quadraticCurveTo(Mi[0],Mi[1],B2[0],B2[1]);ctx.closePath();ctx.fill();ctx.stroke();
  const b1=mid(B,B2,.3),b2=mid(B,B2,.8),ti=mid(T,mid(B,B2,.5),.3);ctx.fillStyle=BC2.ear;ctx.beginPath();ctx.moveTo(b1[0],b1[1]);ctx.quadraticCurveTo(mid(Mo,ti,.35)[0],mid(Mo,ti,.35)[1],ti[0],ti[1]);ctx.quadraticCurveTo(mid(Mi,b2,.4)[0],mid(Mi,b2,.4)[1],b2[0],b2[1]);ctx.closePath();ctx.fill()}

return{goblin,skeleton,slime,bat,cEye,pip,brow,fangs,teethRow,smile,openMouth,look,blink};})();
