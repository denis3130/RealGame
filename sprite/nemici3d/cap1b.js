// Nemici del primo capitolo, seconda parte, rifatti in 3D come l'Arciere: stesse forme e stessi colori di oggi nel gioco (ECOL e i disegni di
// src/js), dipinti con la cassetta C3 (base3d.js). Ogni mossa dipende solo da p (0..1).
// - Scarabeo bomba (beetle): guscio arancione a cupola con i puntini neri e la riga nera nel mezzo, testa scura con due occhi gialli, sei
//   zampe, la miccia accesa sul dietro. Fermo respira, si guarda intorno e batte una zampa; corre svelto sulle zampe a tripode; quando si
//   arma ('attack') si pianta sulle zampe, trema, si gonfia e lampeggia di bianco, la scintilla della miccia brucia più forte (l'esplosione
//   la disegna il gioco). o.arm (0..1, quanto è andato avanti l'innesco: 1 - e.arm/.75) lo arma in qualunque mossa.
// - Fiore occhio (eyeflower): fiore rosa col cuore a occhio (iride, pupilla a fessura, palpebre), gambo verde con le spine, due viticci
//   spinosi con i boccioli, quattro foglie a terra. È radicato: fermo ondeggia, respira coi petali, si guarda intorno e sbatte l'occhio;
//   'attack' carica (petali aperti, occhio rosso che brilla) fino a p .55, dove il gioco spara le spine, poi rinculo (nel gioco:
//   p = .55·(1 - e.wind/.6) mentre carica, poi .55 + .25·(1 - e.recoil/.25)). o.root: un angolo fisso per foglie e viticci, così girano
//   solo gambo e testa verso l'eroe, come nel gioco di oggi. Niente 'walk' (se arriva, è come 'idle').
// - Occhio d'ombra (shadoweye): palla viola scuro che fluttua, un grande occhio a mandorla con la fessura e il bagliore viola, una corona
//   di ciuffi scuri a punta, sei pallini scuri che le girano intorno. Fermo sale e scende e si guarda intorno; 'walk' fluttua piegandosi
//   in avanti coi ciuffi all'indietro; 'attack' è lo sguardo: l'occhio si spalanca e si carica di luce fino a p .7, dove il gioco tira il
//   raggio, poi un contraccolpo (nel gioco: p = .7·(1 - e.stare/.85), poi .7 + .3·(1 - e.recoil/.3)).
// Tutti e tre: 'hit' = spinto indietro, occhi strizzati, stelline. Con LOWFX niente bagliori, scintille e dettagli piccoli; o.noFx toglie
// gli effetti della mossa (lampi, raggi della scintilla).
(()=>{const C=C3,{TAU,cl,ez,add,sub,mul,nrm,dot,cross,lerp3,V,stepper,ball,seg,rim,run,dk,cmix,rgba,poly,bbox,softBox,softBall,
  look,blink,keys,bump,sstep,hitK,frame,vol,ellPts,ellAt,ellN,sball,caps,spot,eyes,ellFace,floor,stars,parts,reg,shine,capPath,sp,rotZ,surfLine,ik}=C,{wa}=C.R;
// a thin bendy tube (legs, a fuse, stems, vines) as one smooth stroked path: the dark outline, the colour, and (not with LOWFX) a darker
// line on the shaded side and a warm one on the lit side. Far cheaper than chain() for thin parts (a few strokes instead of three per segment)
function tube(V0,pts3,r,col,o){o=o||{};const q=pts3.map(p=>V0.P(p)),lw=o.lw||2,n=q.length;ctx.lineCap='round';ctx.lineJoin='round';
  ctx.beginPath();ctx.moveTo(q[0][0],q[0][1]);for(let i=1;i<n-1;i++)ctx.quadraticCurveTo(q[i][0],q[i][1],(q[i][0]+q[i+1][0])/2,(q[i][1]+q[i+1][1])/2);ctx.lineTo(q[n-1][0],q[n-1][1]);
  ctx.strokeStyle=INK;ctx.lineWidth=2*r+lw;ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=Math.max(.6,2*r-lw);ctx.stroke();
  if(o.shade&&!LOWFX){const k=r*.3;ctx.save();ctx.translate(k,k);ctx.strokeStyle=dk(col,.3);ctx.lineWidth=Math.max(.5,r-lw/2);ctx.stroke();ctx.translate(-2*k,-2*k);ctx.strokeStyle=wa(.3);ctx.lineWidth=.9;ctx.stroke();ctx.restore()}
  return q}

// ------------------------------------------------------------------ SCARABEO BOMBA: an orange shell with black spots and a black middle line
// (drawBeetle), a dark head with two yellow eyes, six legs, a lit fuse at its back end. It scurries on a tripod gait; when it arms it
// braces, swells and blinks white while the spark at the end of the fuse burns brighter (the game draws the explosion)
const BC={shell:'#e0662a',flash:'#fff2d0',spot:'#3a2a24',head:'#3a2a24',leg:'#3a2a24',eye:'#ffc93c',fuse:'#6b4a2a',spk:'#ffd86b',spk2:'#ff8a3c'};
// the shell (an ellipsoid dome over the ground), the head, the spots seen from above as in the game ([x, y, radius] on a 24×18 shell)
const BS=1.08,BCs=[-1.1,0,3.6],BRs=[12.4*BS,9.6*BS,8.6*BS],BHc=[11.9,0,3.7],BRh=5.1,BSPOT=[[-5,4.5,2],[1,5,2],[-5,-4.5,2],[1,-5,2]];
function beetle(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU;
  const A={B:[0,0,0],lean:0,roll:0,s:0,yaw:0,blink:1,shut:0,stars:0,sway:0,trail:0,flail:0,tapL:0,tapR:0,flip:0,out:0};
  // arming: o.arm (0..1, how far the arming has gone) from the game; 'attack' arms along p and lets go at the very end, so it loops; 'prep'
  // holds the start of it (braced, a shiver, the fuse a little brighter, no blinking yet)
  const k=o.arm>0?cl(o.arm,0,1):anim==='attack'?(p<.9?p/.9:1-ez((p-.9)/.1)):anim==='prep'?.2+.06*Math.sin(ph*2):0;
  let st=null;
  if(anim==='walk'){// a fast scurry: two tripods of legs take turns, the body bobs on each and rocks from side to side
    st=stepper(p,.5);const up=Math.abs(Math.sin(ph));A.B=[0,0,.6*up];A.roll=.06*Math.sin(ph);A.lean=.05;A.trail=1;A.sway=.5*Math.sin(ph)}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.32*kb;A.B=[-3*kb,0,.8*kb];A.roll=.08*kb;A.shut=p<.55?1:0;A.stars=p<.75?1-p/.75:0;A.flail=kb}
  else if(anim==='die'){// .0-.14 the blow, .14-.5 a hop that flips it on its back, then the legs wave in the air and curl up, the fuse goes out in a puff
    const k1=ez(cl(p/.14,0,1)),fl=ez(cl((p-.14)/.36,0,1)),hop=Math.sin(cl((p-.14)/.36,0,1)*Math.PI);A.flip=fl;A.roll=Math.PI*fl;A.lean=-.25*k1*(1-fl);
    A.B=[-2.4*k1,0,.8*k1*(1-fl)+7*hop+9.6*fl];A.shut=1;A.flail=p>.4?Math.max(0,1-(p-.4)/.5):0;A.out=cl((p-.3)/.25,0,1);A.stars=p>.55?.8:0}
  else if(anim==='prep'){A.s=.02*Math.sin(ph);A.sway=.3*Math.sin(ph)}
  else{// breathing, looking round slowly, tapping a front foot now and then
    A.s=.03*Math.sin(ph);A.yaw=look(p,.3);A.blink=blink(p,.62,.08);A.sway=.6*Math.sin(ph+.6);A.tapL=bump(cl((p-.12)/.16,0,1));A.tapR=bump(cl((p-.68)/.16,0,1))}
  // arming: it braces on spread legs, trembles and swells
  const brace=sstep(0,.14,k),sw=sstep(.06,1,k)*.2;
  if(k>0){A.s-=.05*brace;A.B=add(A.B,[Math.sin(p*97)*.35*k,Math.cos(p*83)*.35*k,0])}
  // the blink of the armed shell: on and off, faster toward the end
  const fl=k>0&&anim!=='prep'&&((1.6*k+4.4*k*k)%1)<.5?1:0;
  const X=frame(A,3);
  floor(V0,x,y,sc,A.B,16,6.8,.3,A.B[2]);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  const Cs=BCs,Rs=BRs.map((r,i)=>r*(1+sw*(i===2?1.2:1))),Hc=[BHc[0]+sw*6,0,BHc[2]],Rh=BRh*(1+sw*.4),dS=D(X.T(Cs));
  // the legs: from under the rim of the shell, a knee a little up and out, the foot on the ground (the far ones first)
  for(const sd of[-1,1])for(const i of[-1,0,1]){const ph0=(i===0)===(sd>0)?0:.5,rt=[i*5.4,sd*7.5,2.4],ft=[i*9.3+1.1,sd*(13+brace*1.3)-Math.abs(i)*sd*.6,0];
    const s=st?st(ph0,2.8,2.4):{x:0,z:0},fw=A.flail?Math.sin(p*TAU*4+i*2+sd)*2.4*A.flail:0,tap=i===1?(sd<0?A.tapL:A.tapR)*1.8:0;
    // (on its back the feet go with the body, up in the air, and curl in toward it)
    const cu=A.flip?cl((p-.62)/.3,0,1):0,foot=A.flip?X.T([ft[0]*(1-.35*cu)+fw,ft[1]*(1-.3*cu),s.z-1.5*cu+Math.max(0,fw)*.5]):[ft[0]+s.x+A.B[0]+fw,ft[1]+A.B[1],s.z+Math.max(0,fw)*.6+tap];
    L.add(D(X.T(rt))-(F(0,sd,0)<0?.5:0),()=>{const h=X.T(rt),[kn]=ik(h,foot,4.5,5,X.Rd([0,sd*.7,1]));tube(V0,[h,kn,foot],1.05,BC.leg,{lw:1.5})})}
  // the fuse: out of the back of the shell, up and over to the left; the spark at its end
  const fr=ellAt(Cs,Rs,null,[-Math.cos(.9),0,Math.sin(.9)]),fT=[-A.trail*1.5,-.4+A.sway*.4,0];
  const fpts=[fr,add(fr,[-1.1,-.2,3.1]),add(fr,add([-2.1,-1.1,5.6],mul(fT,.5))),add(fr,add([-2.6,-3,7],fT))];
  L.add(D(X.T(fr)),()=>{const q=fpts.map(X.T);tube(V0,q,1.3,BC.fuse,{lw:1.8,shade:true});
    const e=P(q[3]),r=2.4*(1+k*.5)*(1-A.out);
    // (dying, the spark goes out in a little puff of grey smoke)
    if(A.out>0&&!o.noFx){for(let j=0;j<3;j++){const u=cl(A.out*1.2-j*.12,0,1);if(u<=0||u>=1)continue;ctx.fillStyle=`rgba(150,140,130,${(.55*(1-u)).toFixed(3)})`;ball([e[0]+(j-1)*2.4*u,e[1]-u*10-j*2],1.6+u*4);ctx.fill()}}
    if(r<.2)return;shine('255,190,90',e[0],e[1],r*(3+k*2),.5+.3*k);
    ctx.fillStyle=Math.sin(G.t*30)>0?BC.spk:BC.spk2;ball(e,r);ctx.fill();ctx.fillStyle='#fffbe8';ball([e[0]-r*.2,e[1]-r*.2],r*.45);ctx.fill();
    // the sparkle: four short rays that turn and flicker, longer when it is armed
    if(!o.noFx&&!LOWFX){ctx.strokeStyle=rgba('#ffd86b',.85);ctx.lineWidth=1;ctx.lineCap='round';for(let j=0;j<4;j++){const a=j*TAU/4+p*TAU*3+Math.sin(G.t*20)*.3,l=r*(1.5+.6*Math.sin(G.t*25+j*2)+k);seg([e[0]+Math.cos(a)*r*1.1,e[1]+Math.sin(a)*r*1.1],[e[0]+Math.cos(a)*l,e[1]+Math.sin(a)*l]);ctx.stroke()}}});
  // the shell: an orange dome, the black middle line, four black spots, the rim curling under
  L.add(dS,()=>{const col=fl?cmix(BC.shell,BC.flash,.9):BC.shell,hp=vol(V0,ellPts(Cs,Rs,null,6,22,-.2).map(X.T),col,{kl:.22,kd:.3});
    ctx.save();poly(hp);ctx.clip();
    for(const[sx,sy,r] of BSPOT){const mx=(sx+1)/12.2,my=sy/9.4,m=[mx,my,Math.sqrt(Math.max(0,1-mx*mx-my*my))];spot(V0,X.T(ellAt(Cs,Rs,null,m)),X.Rd(ellN(Rs,null,m)),r*BS*(1+sw),BC.spot,{v0:.02})}
    surfLine(V0,X,u=>{const t=Math.PI*(1-u*.86),m=[Math.cos(t),0,Math.sin(t)];return{p:ellAt(Cs,Rs,null,m),n:ellN(Rs,null,m)}},INK,2,true);
    {ctx.strokeStyle=rgba(dk(col,.45),.55);ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();let pen=false;
      for(let i=0;i<=32;i++){const t=i/32*TAU,q=P(X.T(ellAt(Cs,Rs,null,[Math.cos(t)*.99,Math.sin(t)*.99,-.19]))),v=F(X.Rd([Math.cos(t),Math.sin(t),-.4]));
        if(v>-.1){if(!pen){ctx.moveTo(q[0],q[1]);pen=true}else ctx.lineTo(q[0],q[1])}else pen=false}ctx.stroke()}
    ctx.restore()});
  // the head: a dark ball under the front of the shell, two yellow eyes on its top (they squint while it arms, squeeze shut when hit)
  L.add(D(X.T(Hc))+2,()=>{const Rd=[Rh*.9,Rh*1.12,Rh*.88];vol(V0,ellPts(Hc,Rd,null,5,14).map(X.T),BC.head,{kl:.25,kd:.3,rim:.35});const fc=ellFace(V0,X,Hc,Rd);
    eyes(null,fc.h,Rh,{at:fc.at,dir:[.62,.56,.56],kind:'dark',col:BC.eye,rx:1.55,ry:1.7,fall:1.2,gap:.25,blink:A.blink,squint:k*.8,shut:A.shut,shutCol:BC.eye,a:.48,b:.58,v0:.5,lr:.45})});
  run(L);
  if(A.stars>0)stars(P(X.T([0,0,18])),9,A.stars);
  ctx.restore()}
reg('beetle',{n:'Scarabeo bomba',g:1,an:['idle','walk','prep','attack','hit','die'],dur:{idle:2.4,walk:.36,prep:.8,attack:.8,hit:.6,die:1},lab:{idle:'fermo',walk:'corre',prep:'si prepara',attack:'si arma',hit:'colpito',die:'muore'}},beetle);

// ------------------------------------------------------------------ FIORE OCCHIO: a pink flower whose heart is a big eye (drawEyeflower), on a thorny
// green stem; two thorny vines with pink buds curl up at its sides, four leaves lie on the ground. It is rooted: the stem sways and the head
// turns to follow the hero (o.root: a fixed angle for the leaves and the vines, so only the stem and the head turn, as in the game); the attack
// winds up (the petals open, the eye turns red and glows), lets go (the game shoots the thorns) and recoils
const FC={pet:'#c8407a',pet2:'#e0609a',back:'#9a2f5f',back2:'#a8467f',eye:'#f4e6b8',hot:'#ff883c',pupil:'#1b1612',iris:'#d9a23f',
  stem:'#5f9e3c',leaf:'#4f8a34',leaf2:'#3f7a2a',leafB:'#356a26',thorn:'#e8d8a0',bud:'#c8407a',calyx:'#4f8a34'};
// a frame from a forward direction: u forward, v to its right, w up
const fr3=u=>{u=nrm(u);const v=nrm(cross([0,0,1],u)),w=cross(u,v);return{u,v,w}};
// a round petal or leaf (an ellipse in 3D, as the game draws them): from the base b along d, L long, 2W wide across s; bend curls the tip
// along its normal d×s; two sided (o.back for the side turned away); o.vein: a line down the middle
function petal(V0,b,d,s,L,W,col,o){o=o||{};d=nrm(d);s=nrm(s);const n=nrm(cross(d,s)),bend=o.bend||0,N=12,pts=[],at=(k,wd)=>add(add(add(b,mul(d,k*L)),mul(s,wd)),mul(n,bend*k*k*L*.4));
  for(let i=0;i<=N;i++){const k=i/N;pts.push(V0.P(at(k,W*Math.sqrt(Math.max(0,1-(2*k-1)*(2*k-1))))))}
  for(let i=N-1;i>0;i--){const k=i/N;pts.push(V0.P(at(k,-W*Math.sqrt(Math.max(0,1-(2*k-1)*(2*k-1))))))}
  const c=o.back&&V0.F(n)<0?o.back:col;ctx.lineJoin='round';C.smooth(pts);ctx.fillStyle=softBox(bbox(pts),c,o.kl==null?.2:o.kl,o.kd==null?.24:o.kd);ctx.fill();
  ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2;ctx.stroke();
  if(o.vein){const a=V0.P(at(.12,0)),e=V0.P(at(.82,0));ctx.strokeStyle=o.vein;ctx.lineWidth=1;ctx.lineCap='round';seg(a,e);ctx.stroke()}
  return pts}
// a chunky petal: a flattened ellipsoid from the base b along d (L long, 2W wide across s, 2T thick), two sided in colour, its tip curled
// along its normal by bend
function petal3(V0,b,d,s,L,W,T,col,o){o=o||{};d=nrm(d);s=nrm(s);const n=nrm(cross(d,s)),c=add(add(b,mul(d,L*.5)),mul(n,(o.bend||0)*L*.18)),F3={u:nrm(add(d,mul(n,(o.bend||0)*.5))),v:s,w:n};
  return vol(V0,ellPts(c,[L*.5,W,T],F3,4,12),o.back&&V0.F(n)<0?o.back:col,{kl:o.kl==null?.22:o.kl,kd:o.kd==null?.26:o.kd,lw:o.lw||2.2,rim:.25,noRim:LOWFX})}
// cream thorns out of a stem, all in one path: each [base point, direction, length, half width]; the outline only on their two sides
function thorns(V0,list){if(!list.length)return;ctx.beginPath();for(const[c,d,l,hw] of list){const q=V0.P(c),e=V0.P(add(c,mul(nrm(d),l))),dx=e[0]-q[0],dy=e[1]-q[1],L=Math.hypot(dx,dy)||1,nx=-dy/L*hw,ny=dx/L*hw;
    ctx.moveTo(q[0]+nx,q[1]+ny);ctx.lineTo(e[0],e[1]);ctx.lineTo(q[0]-nx,q[1]-ny)}
  ctx.fillStyle=FC.thorn;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.lineJoin='round';ctx.stroke()}
// the eye: a cream dome bulging out of the middle of the flower (a cap of a ball, so it hides behind the petals from the back), an iris and
// an upright slit for a pupil round the gaze, the point of light, the pink lids (blink, shut)
function flowerEye(V0,E,re,Fh,A){const{u,v,w}=Fh,{F}=V0,q=V0.P(E),col=A.wind>0?cmix(FC.eye,FC.hot,A.wind):FC.eye,AL=1.66;
  if(A.wind>0)shine('255,90,90',q[0],q[1],re*2.6,A.wind*.55*cl(F(u)+.6,0,1));
  if(!capPath(V0,q,re,u,AL))return;ctx.fillStyle=softBall(q,re,col,.16,.24);ctx.fill();ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.stroke();
  ctx.save();capPath(V0,q,re-1.1,u,AL);ctx.clip();
  const g=nrm(add(u,add(mul(v,A.gy*.3),mul(w,A.gx*.25)))),fg=F(g);
  if(fg>-.2){ctx.save();ctx.globalAlpha*=cl((fg+.2)*3,0,1);
    if(capPath(V0,q,re,g,.6)){ctx.fillStyle=cmix(FC.iris,'#c8302a',A.wind*.75);ctx.fill();ctx.strokeStyle=rgba(dk(FC.iris,.5),.6);ctx.lineWidth=1;ctx.stroke()}
    const e1=nrm(cross(w,g)),e2=nrm(cross(g,e1)),pw=(.85+A.wind*.4)/re,ph=(2.6-A.wind*.5)/re,pts=[];
    for(let i=0;i<16;i++){const t=i/16*TAU;pts.push(sp(V0,q,re,nrm(add(g,add(mul(e1,Math.cos(t)*pw),mul(e2,Math.sin(t)*ph))))))}
    ctx.fillStyle=FC.pupil;poly(pts);ctx.fill();ctx.restore()}
  if(F(u)>.25){ctx.fillStyle=`rgba(255,255,255,${.85*cl((F(u)-.25)*4,0,1)})`;ball([q[0]-re*.32,q[1]-re*.36],re*.19);ctx.fill()}
  // the lids: pink caps of the ball that come down from the top (and up from the bottom when it squeezes its eye shut)
  const lid=(n,al,edge)=>{const c=capPath(V0,q,re,n,al);if(!c)return;ctx.fillStyle=softBall(q,re,FC.back2,.2,.3);ctx.fill();
    if(edge&&c.rim&&c.rim.length>1){ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.lineCap='round';C.line(c.rim);ctx.stroke()}};
  if(A.shut){// squeezed shut: both lids meet, a dark crease bowing up with a pinch at each corner
    lid(mul(w,-1),1.52,false);lid(w,1.7,false);const fu=F(u);if(fu>.05){const c=sp(V0,q,re,nrm(add(u,mul(w,-.05)))),a=sp(V0,q,re,nrm(add(u,mul(v,-.75)))),b=sp(V0,q,re,nrm(add(u,mul(v,.75))));
      ctx.save();ctx.globalAlpha*=cl(fu*4,0,1);ctx.strokeStyle=INK;ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a[0],a[1]+.8);ctx.quadraticCurveTo(c[0],c[1]-3.2,b[0],b[1]+.8);ctx.stroke();
      // two little pinch marks at the corners
      ctx.lineWidth=1.2;for(const[e,sd] of[[a,-1],[b,1]]){seg([e[0]+sd*.6,e[1]-.6],[e[0]+sd*2,e[1]-2.2]);ctx.stroke()}ctx.restore()}}
  else if(A.blink<.98)lid(w,(1-A.blink)*1.85,true);
  ctx.restore()}
// the calyx: a green dome on the back of the flower with five dark lines, as the game draws the back of the head
function calyx(V0,H,Fh){const{u,v,w}=Fh,c=add(H,mul(u,-1.8)),F2={u:v,v:w,w:mul(u,-1)},Rd=[8.4,8.4,3.8];
  vol(V0,ellPts(c,Rd,F2,4,16,-.15),FC.calyx,{kl:.2,kd:.3,lw:2.2});
  if(LOWFX)return;ctx.beginPath();for(let i=0;i<5;i++){const a=i/5*TAU+.6;let pen=false;
    for(let j=0;j<=6;j++){const t=j/6*1.25,m=[Math.cos(a)*Math.sin(t),Math.sin(a)*Math.sin(t),Math.cos(t)],q=V0.P(ellAt(c,Rd,F2,m));if(V0.F(ellN(Rd,F2,m))>.02){if(pen)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1]);pen=true}else pen=false}}
  ctx.strokeStyle='rgba(20,40,10,.4)';ctx.lineWidth=1.1;ctx.lineCap='round';ctx.stroke()}
function eyeflower(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),V1=o.root!=null?V(o.root):V0,{P,D,F}=V0,ph=p*TAU;
  // the head's offset (hx forward, hy right, hz up), tilt (the face turns up), turn (looks left / right), open (the petals flare), wind (0..1:
  // the eye goes red and glows), gaze (gx up, gy right), blink (1 open), shut, flash (the shot), sway (the vines)
  const A={hx:0,hy:0,hz:0,tilt:.22,turn:0,open:0,wind:0,gx:0,gy:0,blink:1,shut:0,flash:0,stars:0,sway:0};
  if(anim==='attack'){// .0-.55 winds up (draws back, the petals open, the eye reddens), .55 lets go with a snap forward, .6-.8 recoils, then settles
    const K=keys([[0,[0,0,.22,0]],[.55,[-2.6,1.4,.34,.4]],[.6,[2.8,-.4,.12,.3]],[.76,[-3.2,-.8,.32,-.08]],[.9,[.6,0,.18,0]],[1,[0,0,.22,0]]],p);
    A.hx=K[0];A.hz=K[1];A.tilt=K[2];A.open=K[3];A.wind=p<.55?ez(p/.55):1-sstep(.55,.82,p);A.flash=p>=.55&&p<.8?1-(p-.55)/.25:0;A.sway=.5*Math.sin(ph)}
  else if(anim==='hit'){const kb=hitK(p);A.hx=-5*kb;A.hz=-1.6*kb;A.tilt=.22+.45*kb;A.open=-.25*kb;A.shut=p<.55?1:0;A.stars=p<.75?1-p/.75:0;A.sway=1.4*Math.sin(p*TAU*2)*(1-p)}
  else if(anim==='prep'){// gets ready: drawn back as at the middle of its wind-up, the petals open, the eye reddening and glowing, a shiver
    const b=Math.sin(ph*2);A.hx=-1.8+.25*Math.sin(ph*5);A.hz=1+.3*b;A.tilt=.3;A.open=.3+.08*b;A.wind=.6+.2*(.5+.5*b);A.sway=.4*Math.sin(ph)}
  else if(anim==='die'){// wilts: .0-.18 the blow, .18-.75 the stem bends over until the flower lies on the ground, the eye closing, the petals folding
    const k1=ez(cl(p/.18,0,1)),k2=ez(cl((p-.18)/.57,0,1));A.hx=-4*k1*(1-k2)+9*k2;A.hz=-1.4*k1*(1-k2)-27*k2;A.tilt=.22+.4*k1*(1-k2)-.95*k2;A.open=-.25*k1-.35*k2;
    A.shut=1;A.sway=1.2*Math.sin(p*TAU*2)*(1-k2)-.8*k2}
  else{// at rest it sways on its stem, breathes with its petals, looks round and blinks
    A.hy=1.3*Math.sin(ph);A.hx=.6*Math.sin(ph*2+.4);A.hz=.5*Math.sin(ph*2);A.turn=look(p,.28);A.open=.07*Math.sin(ph*2+1);A.blink=blink(p,.58,.09);A.sway=Math.sin(ph+.8);
    A.gx=.3*Math.sin(ph*2+2);A.gy=look(p+.12,.5)}
  floor(V1,x,y,sc,[0,0,0],17,5.6,.3);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  // the head turns a little toward the camera from the side (as the hero's head does); past the side it swings on quickly to show its back
  // (the game draws the back three-quarter view as the back), so the flower shows its edge only for a moment
  const dv=Math.atan2(Math.sin(Math.PI/2-face),Math.cos(Math.PI/2-face)),ad=Math.abs(dv),
    cheat=o.noCheat?0:Math.sign(dv)*(ad<=Math.PI/2?.42*Math.sin(ad):ad-Math.PI+(Math.PI/2+.42)*Math.pow(1-(ad-Math.PI/2)/(Math.PI/2),2));
  const Fh=fr3(rotZ([Math.cos(A.tilt),0,Math.sin(A.tilt)],A.turn+cheat)),{u,v,w}=Fh,H=[1.6+A.hx,A.hy,39+A.hz];
  // the leaves on the ground: two big ones at the sides, two smaller behind them
  for(const[an,Lf,W,col] of[[1.25,20,6.2,FC.leaf],[-1.25,20,6.2,FC.leaf],[2.3,16,5.2,FC.leaf2],[-2.3,16,5.2,FC.leaf2]]){const d=nrm([Math.cos(an),Math.sin(an),.3]),b=[Math.cos(an)*1.2,Math.sin(an)*1.2,.4];
    L.add(V1.D(add(b,mul(d,Lf*.3)))-20,()=>petal(V1,b,d,[-Math.sin(an),Math.cos(an),0],Lf,W,col,{back:FC.leafB,bend:-.3,lw:2,vein:'rgba(190,230,120,.45)'}))}
  // the vines: out of the ground beside the stem, a wide curl up, a pink bud at the tip, thorns along the outside
  for(const sd of[-1,1]){const h=sd>0?24:20,sw=A.sway*(sd>0?1:-.8),
    pts=[[0,sd*2.8,0],[.3,sd*10,3.8],[.5,sd*15.4,h*.42],[.5+sw*.3,sd*16.2+sw*.5,h*.66],[.3+sw*.6,sd*14.2+sw,h*.87],[sw*.8,sd*11.4+sw*1.4,h]];
    L.add(V1.D([0,sd*12,h*.5]),()=>{const th=[];for(const[i,k] of[[1,.6],[2,.5],[3,.6]]){const c=lerp3(pts[i],pts[i+1],k),dd=nrm([0,sd,.5+i*.15]);th.push([add(c,mul(dd,1.3)),dd,3,1.3])}
      thorns(V1,th.filter(t=>V1.F(t[1])<0));tube(V1,pts,1.8,FC.stem,{lw:1.6,shade:true});thorns(V1,th.filter(t=>V1.F(t[1])>=0));
      const t=pts[5],dd=nrm(sub(pts[5],pts[4]));caps(V1,add(t,mul(dd,.8)),2.7,add(t,mul(dd,3.4)),2.5,FC.bud,{lw:1.6,kl:.25,kd:.25})})}
  // the stem: a thick green stalk bowing a little, from the root to the back of the head, with cream thorns
  const St=add(add(H,mul(u,-3)),mul(w,-4.6)),Sc=[-2.6+A.hx*.3,-1.6+A.hy*.4,16],bz=k=>{const b=2*(1-k)*k,c=k*k;return[b*Sc[0]+c*St[0],b*Sc[1]+c*St[1],b*Sc[2]+c*St[2]]};
  const SP=[0,.25,.5,.75,1].map(bz);
  L.add(D(bz(.5)),()=>{const th=[[.3,[-.25,-1,-.3]],[.56,[-.2,-1,-.25]],[.44,[.2,1,-.3]]].map(([k,d])=>{const dd=nrm(d);return[add(bz(k),mul(dd,1.6)),dd,3.4,1.5]});
    thorns(V0,th.filter(t=>F(t[1])<0));tube(V0,SP,2.5,FC.stem,{lw:2,shade:true});thorns(V0,th.filter(t=>F(t[1])>=0))});
  // the head: eight petals round the eye, the calyx behind them, in their own depth order
  const E=add(H,mul(u,-.4)),re=8,cup=-.6-A.open*.5,PL=12.5*(1+A.open*.2);
  L.add(D(H)+30,()=>{const its=[],eyeTop=F(u)>0;
    // eight chunky petals round the eye, bent back a little (so from the side they fan out behind the eye, as in the game)
    for(let i=0;i<8;i++){const an=i/8*TAU+.2,r=add(mul(v,Math.cos(an)),mul(w,Math.sin(an))),t=cross(u,r),d=add(mul(r,Math.cos(cup)),mul(u,Math.sin(cup))),b=add(add(H,mul(r,6.6)),mul(u,-.9));
      its.push({d:D(add(b,mul(d,PL*.5))),f:()=>petal3(V0,b,d,t,PL,5.2,2.6,i%2?FC.pet:FC.pet2,{back:i%2?FC.back:FC.back2,bend:-.15})})}
    // the eye bulges out in front of the petals when it looks our way, behind them otherwise
    its.push({d:D(add(H,mul(u,-2.6))),f:()=>calyx(V0,H,Fh)});if(!eyeTop)its.push({d:-1e9,f:()=>flowerEye(V0,E,re,Fh,A)});
    its.sort((a,b)=>a.d-b.d);for(const q of its)q.f();if(eyeTop)flowerEye(V0,E,re,Fh,A);
    // the shot: a quick pink flash out of the eye
    if(A.flash>0&&!o.noFx&&!LOWFX&&F(u)>-.1){const q=P(add(E,mul(u,re))),k=A.flash*cl((F(u)+.1)*4,0,1);shine('255,140,170',q[0],q[1],10+14*(1-A.flash),.6*k);ctx.strokeStyle=`rgba(255,226,236,${.85*k})`;ctx.lineWidth=1.3;ctx.lineCap='round';
      for(let j=0;j<6;j++){const a=j/6*TAU+.3,r0=re*.5+(1-A.flash)*5,r1=r0+3+3*A.flash;seg([q[0]+Math.cos(a)*r0,q[1]+Math.sin(a)*r0],[q[0]+Math.cos(a)*r1,q[1]+Math.sin(a)*r1]);ctx.stroke()}}});
  run(L);
  if(A.stars>0)stars(P(add(H,[0,0,21])),10,A.stars);
  ctx.restore()}
reg('eyeflower',{n:'Fiore occhio',g:1,an:['idle','prep','attack','hit','die'],dur:{idle:2.6,prep:.8,attack:1.1,hit:.6,die:.9},lab:{idle:'fermo',prep:'si prepara',attack:'spine',hit:'colpito',die:'muore'}},eyeflower);

// ------------------------------------------------------------------ OCCHIO D'OMBRA: a floating dark purple ball with one big pale almond eye (a slit
// for a pupil, a purple glow), a crown of dark spiky tendrils on its top and back, six small dark orbs circling round it (drawShadoweye).
// It bobs in the air; it drifts leaning into the way it goes, the tendrils streaming back; the stare opens the eye wide and charges the
// glow (the game draws the beam), then a kick back
const SC={body:'#462c64',light:'#634285',dark:'#1e1228',sp1:'#24162f',sp2:'#3a2550',orb:'#3a2550',eye:'#f6e8f4',eyeL:'#b874e6',pupil:'#1b0f22'};
// the tendrils of the crown: [angle round the ball (0 = in front), height on it (rad above the middle), length]: the tallest on top,
// none low in front, so they never cover the eye
const SPK=[[0,1.45,17.5],[.6,1.02,13.5],[-.6,1.02,13.5],[1.6,.98,14.5],[-1.6,.98,14.5],[2.55,1.02,13],[-2.55,1.02,13]];
function shadoweye(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const V0=V(face),{P,D,F}=V0,ph=p*TAU;
  // bob (z), lean, roll; open (the eye 0..1 wider), glow, blink (1 open), shut, gaze (gx up, gy right), the tendrils' sway, stream (blown
  // back) and bristle (stand up), the orbs' turn (spin), pull (closer in), flash (the beam goes)
  const A={z:0,lean:0,roll:0,B:[0,0,0],s:0,open:0,glow:0,blink:1,shut:0,gx:0,gy:0,sway:1,stream:0,bristle:0,spin:p*TAU/2,pull:0,flash:0,stars:0,trem:0,fade:1,smoke:-1};
  if(anim==='walk'){// drifting: leaning into it, the tendrils blown back, a quicker bob
    A.z=1.6*Math.sin(ph*2);A.lean=.3;A.roll=.06*Math.sin(ph);A.stream=1;A.sway=.8;A.spin=p*TAU*2/6*3;A.gy=.15*Math.sin(ph);A.trail=3.5}
  else if(anim==='attack'){// .0-.7 the stare: the eye opens wide and glows, the tendrils bristle, the orbs draw in and spin faster;
    // .7 the beam (the game's), a flash and a kick back, then it settles
    const k=ez(cl(p/.7,0,1)),r=p<.7?0:p<.85?ez((p-.7)/.15):1-ez((p-.85)/.15);
    A.open=p<.7?k:1-sstep(.7,.95,p);A.glow=p<.7?k:1-sstep(.7,1,p);A.bristle=p<.7?k:1-sstep(.7,1,p);A.pull=A.bristle*.1;A.spin=p*TAU*4/6*1.5;A.trem=k*(1-sstep(.64,.72,p));
    A.flash=p>=.7&&p<.9?1-(p-.7)/.2:0;A.B=[-3.5*r,0,0];A.lean=-.2*r;A.z=1.2*Math.sin(ph)}
  else if(anim==='hit'){const kb=hitK(p);A.B=[-4*kb,0,1*kb];A.lean=-.35*kb;A.roll=.1*kb;A.shut=p<.55?1:0;A.stars=p<.75?1-p/.75:0;A.sway=1.6;A.spin=p*TAU/6}
  else if(anim==='prep'){// gets ready to stare: the eye opening and filling with light, the tendrils bristling, the orbs drawing in, a tremble
    const b=Math.sin(ph*2);A.open=.55+.12*b;A.glow=.5+.2*(.5+.5*b);A.bristle=.55;A.pull=.06;A.spin=p*TAU*2;A.trem=.45;A.z=1.2*Math.sin(ph)}
  else if(anim==='die'){// .0-.15 the blow, then it spins, sinks and comes apart into purple smoke, the eye closing
    const k1=ez(cl(p/.15,0,1)),k2=cl((p-.15)/.7,0,1);A.B=[-4*k1,0,1*k1];A.lean=-.3*k1*(1-k2);A.roll=.5*k2;A.shut=1;A.spin=p*TAU*3;A.sway=1.6;A.z=-14*k2*k2;
    A.s=-.25*k2;A.fade=1-ez(cl((p-.35)/.55,0,1));A.smoke=p>.2?(p-.2)/.8:-1}
  else{A.z=2.4*Math.sin(ph);A.gy=look(p,.6);A.gx=.25*Math.sin(ph*2+1);A.blink=blink(p,.7,.08)}
  // the tremble of the stare: 8 and 6 Hz (faster shakes turn into a random jitter on the frames of a phone)
  if(A.trem)A.B=add(A.B,[Math.sin(p*TAU*9.6)*.4*A.trem,Math.sin(p*TAU*7.2)*.4*A.trem,0]);
  const Cz=26+A.z,X=frame(A,Cz),C0=[0,0,Cz],R0=12.5;
  floor(V0,x,y,sc,A.B,11.5,4.2,.24*A.fade,8+A.z*3);
  // (dying: puffs of its smoke going up and out)
  if(A.smoke>=0&&!o.noFx){const k=A.smoke;ctx.save();for(let j=0;j<6;j++){const a=j/6*TAU+.5,u=cl(k*1.3-j*.06,0,1),r=(4+u*16),q=P(Math.cos(a)*r,Math.sin(a)*r,Cz*.6+u*18+Math.sin(j*1.9)*4);
      ctx.fillStyle=`rgba(60,30,90,${(.5*Math.sin(u*Math.PI)).toFixed(3)})`;ctx.beginPath();ctx.arc(x+q[0]*sc,y+q[1]*sc,(3+u*5)*sc,0,TAU);ctx.fill()}ctx.restore()}
  if(A.fade<=.02)return;
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.globalAlpha*=A.fade;const L=parts(),Cb=X.T(C0),dB=D(Cb);let eyeAt=null;
  // the body: a dark purple ball, lit from the upper left as the game paints it, a faint swirl of smoke turning inside, and the eye
  L.add(dB,()=>{const q=P(Cb);ink(2.5);ball(q,R0);const g=ctx.createRadialGradient(q[0]-R0*.34,q[1]-R0*.42,R0*.1,q[0]-R0*.05,q[1]+R0*.05,R0*1.12);
    g.addColorStop(0,SC.light);g.addColorStop(.42,SC.body);g.addColorStop(1,SC.dark);ctx.fillStyle=g;ctx.fill();ctx.stroke();
    ctx.save();ball(q,R0-1.2);ctx.clip();
    if(!LOWFX){const a0=p*TAU+.8;ctx.strokeStyle='rgba(180,120,255,.25)';ctx.lineWidth=1.4;ctx.lineCap='round';ctx.beginPath();ctx.arc(q[0],q[1],R0*.64,a0,a0+2.2);ctx.stroke()}
    eyeAt=shadowEye(V0,X,q,R0,face,A);ctx.restore();rim(q,R0,q,R0,.26)});
  // the tendrils: dark flames out of the top and the back, swaying; the ones behind the ball first
  // each one leans out only sideways on the screen (never toward us or away), so the crown always fans out over the ball as in the game
  const ch=nrm([V0.s,V0.c,0]);
  SPK.forEach(([an,el,len],i)=>{const m=X.Rd([Math.cos(an)*Math.cos(el),Math.sin(an)*Math.cos(el),Math.sin(el)]),B3=add(Cb,mul(m,R0*.9));
    L.add(D(B3)+(F(m)>0?.5:-.5),()=>{const hr=X.Rd([Math.cos(an),Math.sin(an),0]),hp=sub(hr,mul(ch,dot(hr,ch))),
      d=nrm(add(add(X.Rd([0,0,1]),mul(hp,1.25-A.bristle*.6-A.stream*.75)),X.Rd([-1.5*A.stream,0,0]))),
      Ln=len*(1+.18*Math.sin(ph*2+i*1.7)*A.sway+.25*A.bristle)*(i===0?1:.95),T3=add(B3,mul(d,Ln)),q=P(B3),e=P(T3),
      sw=(Math.sin(ph*(A.stream?2:1)+i*1.9-an*A.stream)*1.8*A.sway)+(i%2?1.4:-1.4)*(i?1:.3),dx=e[0]-q[0],dy=e[1]-q[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,hw=3.6,
      c1=[q[0]+dx*.55+nx*(hw*.7+sw),q[1]+dy*.55+ny*(hw*.7+sw)],c2=[q[0]+dx*.5+nx*(-hw*.3+sw),q[1]+dy*.5+ny*(-hw*.3+sw)],front=F(m)>.15;
      ctx.beginPath();ctx.moveTo(q[0]+nx*hw,q[1]+ny*hw);ctx.quadraticCurveTo(c1[0],c1[1],e[0],e[1]);ctx.quadraticCurveTo(c2[0],c2[1],q[0]-nx*hw,q[1]-ny*hw);
      ctx.fillStyle=i%2?SC.sp1:SC.sp2;ctx.fill();if(!front)ctx.closePath();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.lineJoin='round';ctx.stroke()})});
  // the orbs: six small dark balls on a ring round the middle, turning; faster and a little closer in while it stares
  for(let i=0;i<6;i++){const a=A.spin+i*TAU/6,r=(19+2*Math.sin(ph*2+i))*(1-A.pull),c=add(Cb,[Math.cos(a)*r-(A.trail||0),Math.sin(a)*r,1.4*Math.sin(ph*2+i*1.3)]);
    L.add(D(c),()=>{const fr=F([Math.cos(a),Math.sin(a),0])<0;sball(V0,c,2.4,fr?'#2a1a3a':SC.orb,{lw:1.4,kl:.3,kd:.3,noRim:true})})}
  run(L);
  // the flash when the beam goes
  if(A.flash>0&&!o.noFx&&!LOWFX&&eyeAt){const q=eyeAt,k=A.flash;{shine('190,110,255',q[0],q[1],14+16*(1-k),.7*k);ctx.strokeStyle=`rgba(236,214,255,${.9*k})`;ctx.lineWidth=1.4;ctx.lineCap='round';
    for(let j=0;j<8;j++){const a=j/8*TAU,r0=5+(1-k)*6,r1=r0+3+4*k;seg([q[0]+Math.cos(a)*r0,q[1]+Math.sin(a)*r0],[q[0]+Math.cos(a)*r1,q[1]+Math.sin(a)*r1]);ctx.stroke()}}}
  if(A.stars>0)stars(P(X.T([0,0,Cz+21])),10,A.stars);
  ctx.restore()}
// the eye: a pale almond on the front of the ball, looking a little up toward us so it sits in the middle as in the game. As the eyes of
// C3.eyes: its place comes from the ball turning (and a little toward the camera from the side), then it slides in from the edge and gets
// narrower, so it never sits on the outline, and fades out round the back. The slit of the pupil pokes out past the lids as in the game;
// a point of light; two purple strokes out of the corners; a glow round it. Returns where the eye is on the screen (for the flash)
function shadowEye(V0,X,q,R0,face,A){const{F}=V0;
  const dv=Math.atan2(Math.sin(Math.PI/2-face),Math.cos(Math.PI/2-face)),cheat=.42*Math.sin(dv)*cl((Math.PI-Math.abs(dv))/(Math.PI/2),0,1);
  const g=X.Rd(nrm(rotZ([Math.cos(.38+A.gx*.2),0,Math.sin(.38+A.gx*.2)],cheat+A.gy*.25))),v=F(g);if(v<.1)return null;
  const c0=sp(V0,q,R0,g),ec=C.inward(q,R0,c0,.34,.46),e1=nrm(cross(X.Rd([0,0,1]),g)),h1=sp(V0,q,R0,nrm(add(g,mul(e1,.2))));
  // the long axis of the almond follows the ball, but stays close to level on the screen, as in the game
  let ux=h1[0]-c0[0],uy=h1[1]-c0[1];const sg=ux<0?-1:1,ul0=Math.hypot(ux,uy)||1;ux=sg+(ux/ul0-sg)*.3;uy=uy/ul0*.3;const ul=Math.hypot(ux,uy)||1;ux/=ul;uy/=ul;const nx=-uy*sg,ny=ux*sg,k=cl((v-.1)*4,0,1);
  const ew=(6.6+A.open*.8)*(.42+.58*Math.pow(v,.8)),eh=(3.1+A.open*2.6)*(A.shut?0:A.blink),at=(x,y)=>[ec[0]+ux*x+nx*y,ec[1]+uy*x+ny*y];
  ctx.save();ctx.globalAlpha*=k;shine('190,110,255',ec[0],ec[1],14+A.glow*8,.28+A.glow*.45);
  if(eh>.25){ctx.beginPath();for(let i=0;i<=10;i++){const t=-1+i/5,p=at(t*ew,-(1-t*t)*eh);ctx.lineTo(p[0],p[1])}for(let i=10;i>=0;i--){const t=-1+i/5,p=at(t*ew,(1-t*t)*eh);ctx.lineTo(p[0],p[1])}ctx.closePath();
    ctx.fillStyle=A.glow>0?cmix(SC.eye,'#ffffff',A.glow*.6):SC.eye;ctx.fill();ctx.strokeStyle=SC.eyeL;ctx.lineWidth=1.6;ctx.lineJoin='round';ctx.stroke();
    // the slit, a little taller than the eye, looking about; the point of light
    const px=A.gy*1.6*(.5+.5*v),pw=1.2+A.glow*.8,ph=Math.min(4.4,eh+1.3),pc=at(px,0);ctx.fillStyle=SC.pupil;ctx.beginPath();ctx.ellipse(pc[0],pc[1],pw*(.6+.4*v),ph,0,0,TAU);ctx.fill();
    if(eh>1.4){const l=at(-ew*.42,-eh*.42);ctx.fillStyle='rgba(255,255,255,.85)';ball(l,.95);ctx.fill()}}
  else if(A.shut){// squeezed shut: a dark curve bowing up
    ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<=8;i++){const t=-1+i/4,p=at(t*ew*.85,-(1-t*t)*1.8+.6);ctx.lineTo(p[0],p[1])}ctx.stroke()}
  else{ctx.strokeStyle=SC.eyeL;ctx.lineWidth=1.6;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<=8;i++){const t=-1+i/4,p=at(t*ew,0);ctx.lineTo(p[0],p[1])}ctx.stroke()}
  // the two strokes out of the corners
  ctx.strokeStyle='rgba(190,110,255,.7)';ctx.lineWidth=1.2;ctx.lineCap='round';for(const sd of[-1,1]){seg(at(sd*(ew+2.6),0),at(sd*(ew+5.2),-.9));ctx.stroke()}
  ctx.restore();return ec}
reg('shadoweye',{n:"Occhio d'ombra",g:1,an:['idle','walk','prep','attack','hit','die'],dur:{idle:2.6,walk:1.2,prep:.8,attack:1.2,hit:.6,die:.9},lab:{idle:'fermo',walk:'fluttua',prep:'si prepara',attack:'fissa',hit:'colpito',die:'muore'}},shadoweye);
})();
