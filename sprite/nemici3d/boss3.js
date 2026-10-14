// I quattro boss nuovi del terzo giro della modalità Classica (arene 9–12), disegnati in 3D come gli altri (cassetta C3, base3d.js):
// volumi veri che girano a 360 gradi, tre toni con la luce calda dall'alto a sinistra, contorno scuro spesso, bordo illuminato, ogni
// mossa che dipende solo da p (0..1) e si chiude su se stessa. Stile della Classica: forme tonde da giocattolo, colori pieni, occhi
// grandi con la luce, bocche semplici con al massimo due zannette, niente sangue né ferite.
// - IL BURATTINAIO D'OMBRA (puppeteer), Cripta delle Ombre: un mantello viola a campana che fluttua, il cappuccio a punta col sonaglio,
//   due occhi gialli che brillano nel buio del cappuccio, la gorgiera bianca, due grandi mani guantate staccate dal corpo con i fili
//   d'oro che pendono dalle dita. Mosse: fluttua, prepara, manate, fili, burattini, sipario (sparisce nell'ombra e torna), colpito,
//   entrata (scende appeso ai suoi fili e fa l'inchino), sconfitta (i fili si spezzano, le mani si sciolgono in fumo, il mantello si
//   affloscia vuoto, gli occhi salgono come bolle e scoppiano).
// - LA FENICE DELLA FORGIA (phoenix), Forgia degli Dei. - LA PIOVRA DELLA PALUDE (octopus), Palude Maledetta.
// - IL CERVO D'AURORA (stag), Vetta di Mossbound. Vedi più sotto.
// Opzioni comuni: o.p2 (seconda fase), o.z (altezza data dal gioco), o.noFx (niente effetti della mossa: li disegna il gioco).
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,tri,hull,rim,run,dk,lt,rgba,rgbs,cmix,poly,line,bbox,soft,softBox,softBall,
  sp,capPath,rotX,rotY,rotZ,look,blink,keys,bump,sstep,hitK,frame,vol,ellPts,ellAt,ellN,AXES,axes,sball,caps,chain,disc3,spot,leaf,revo,revoAt,surfLine,
  eyes,mouth,cheeks,floor,parts,reg,shine,stepper,smooth,chull}=C;

// ------------------------------------------------------------------ shared helpers (as in boss1.js)
const dir=(t,e)=>[Math.cos(e)*Math.cos(t),Math.cos(e)*Math.sin(t),Math.sin(e)];
const trem=(p,a,b,hz,dur)=>{const w=Math.min(.03,(b-a)/3);return sstep(a,a+w,p)*(1-sstep(b-w,b,p))*Math.sin((p-a)*TAU*hz*dur)};
const fxOn=o=>!o.noFx&&!LOWFX;
const cheat=(face,k)=>{const dv=Math.atan2(Math.sin(Math.PI/2-face),Math.cos(Math.PI/2-face));return k*Math.sin(dv)*cl((Math.PI-Math.abs(dv))/(Math.PI/2),0,1)};
// the visible part of a cap on an ellipsoid (from boss1.js): leaves the path in ctx, returns {full, rim} or false
function ellCap(V0,X,Cc,Rd,Fr,n,al,N,o){Fr=Fr||AXES;N=N||36;o=o||{};n=nrm(n);let u=o.u?sub(o.u,mul(n,dot(o.u,n))):cross(n,[0,0,1]);if(len(u)<.2)u=cross(n,[0,1,0]);u=nrm(u);const v=cross(n,u),alv=o.alv||al;
  const S=m=>V0.P(X.T(ellAt(Cc,Rd,Fr,m))),g=nrm([V0.F(X.Rd(Fr.u))/Rd[0],V0.F(X.Rd(Fr.v))/Rd[1],V0.F(X.Rd(Fr.w))/Rd[2]]),b=[],bd=[],f=[];
  const at=(t,k)=>{const c=Math.cos(t),s=Math.sin(t),a=k/Math.sqrt((c/al)*(c/al)+(s/alv)*(s/alv));return add(mul(n,Math.cos(a)),add(mul(u,c*Math.sin(a)),mul(v,s*Math.sin(a))))};
  for(let i=0;i<N;i++){const t=i/N*TAU,m=at(t,1);b.push(m);bd.push(o.rf?at(t,o.rf(t)):m);f.push(dot(m,g))}
  const nv=f.filter(x=>x>=0).length;if(!nv)return false;
  if(nv===N){const pts=bd.map(S);poly(pts);return{full:true,rim:pts}}
  let s0=0;for(let i=0;i<N;i++)if(f[i]<0&&f[(i+1)%N]>=0){s0=(i+1)%N;break}
  const cut=(a,c)=>{const k=f[a]/(f[a]-f[c]);return nrm(lerp3(b[a],b[c],k))},rn=[cut((s0-1+N)%N,s0)],rd=[rn[0]];let i=s0;while(f[i]>=0){rn.push(b[i]);rd.push(bd[i]);i=(i+1)%N}rn.push(cut((i-1+N)%N,i));rd.push(rn[rn.length-1]);
  let e1=cross(g,[0,0,1]);if(len(e1)<.2)e1=cross(g,[0,1,0]);e1=nrm(e1);const e2=cross(g,e1),ang=m=>Math.atan2(dot(m,e2),dot(m,e1)),nm=a=>((a%TAU)+TAU)%TAU;
  const a0=ang(rn[rn.length-1]),a1=ang(rn[0]),ccw=nm(a1-a0),span=ccw<=Math.PI?ccw:-(TAU-ccw);// a cap smaller than half the ball meets the limb in less than half of it
  const M=Math.max(2,Math.ceil(Math.abs(span)/.2)),lb=[];for(let k=1;k<M;k++){const a=a0+span*k/M;lb.push(add(mul(e1,Math.cos(a)),mul(e2,Math.sin(a))))}
  poly(rd.concat(lb).map(S));return{full:false,rim:rd.map(S)}}
// a convex volume with a smooth outline (no corners on the big shapes); returns the hull for clipping
function svol(V0,pts3,col,o){o=o||{};const pts=chull(pts3.map(q=>V0.P(q)));if(pts.length<3)return pts;
  ctx.lineJoin='round';smooth(pts);ctx.fillStyle=o.fill||softBox(bbox(pts),col,o.kl,o.kd);ctx.fill();if(!o.noInk){ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2.5;ctx.stroke()}
  if(!o.noRim)C.rimPoly(pts,o.rim||.3);return pts}
const clipTo=hp=>{smooth(hp);ctx.clip()};
// bigger dizzy stars for the bosses
function bstars(c0,r,a){if(a<=0)return;for(let i=0;i<3;i++){const an=G.t*5+i*TAU/3;C.starS(c0[0]+Math.cos(an)*r,c0[1]+Math.sin(an)*r*.33*C.KR(),3,a)}}
// puffs round a 3D point (k 0..1: spreading and fading)
function dust(V0,c,k,n,r,rgb,al){for(let i=0;i<n;i++){const a=i/n*TAU+.4,d=r*(.4+k*.9),q=V0.P(add(c,[Math.cos(a)*d,Math.sin(a)*d,k*6+(i%2)*2]));ctx.fillStyle=`rgba(${rgb||'205,195,175'},${(al||.5)*(1-k)})`;ball(q,2.4+k*4.5);ctx.fill()}}
// a ring on the floor (a shock wave): centre c (3D, z = 0), radius r, colour, alpha, width
function ring0(V0,c,r,rgb,a,w){if(a<=0)return;const pts=[];for(let i=0;i<32;i++){const t=i/32*TAU;pts.push(V0.P(add(c,[Math.cos(t)*r,Math.sin(t)*r,0])))}
  ctx.save();ctx.strokeStyle=`rgba(${rgb},${a})`;ctx.lineWidth=w||3;poly(pts);ctx.stroke();ctx.restore()}
// a filled ellipse on the floor (a puddle, a glow)
function pool0(V0,c,rx,ry,fill){const pts=[];for(let i=0;i<28;i++){const t=i/28*TAU;pts.push(V0.P(add(c,[Math.cos(t)*rx,Math.sin(t)*ry,0])))}ctx.fillStyle=fill;poly(pts);ctx.fill();return pts}
// a five-pointed star in screen space (buttons, sparkles)
function star5(q,r,col,a){ctx.save();ctx.globalAlpha*=a==null?1:a;ctx.beginPath();for(let i=0;i<10;i++){const an=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;ctx.lineTo(q[0]+Math.cos(an)*rr,q[1]+Math.sin(an)*rr)}ctx.closePath();
  ctx.fillStyle=col;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();ctx.restore()}
// draws f() as one picture faded to k (no outlines showing through): into a small canvas round the screen point q, pasted with the alpha
let OC=null;
function fadeDraw(f,q,r,k){if(k>=.99){f();return}if(k<=.01)return;const T=ctx.getTransform(),S=Math.hypot(T.a,T.b),dx=T.a*q[0]+T.c*q[1]+T.e,dy=T.b*q[0]+T.d*q[1]+T.f,R=Math.ceil(r*S+6),W=2*R;
  if(!OC)OC=document.createElement('canvas');if(OC.width<W)OC.width=OC.height=W;const oc=OC.getContext('2d');oc.setTransform(1,0,0,1,0,0);oc.clearRect(0,0,W,W);
  oc.setTransform(T.a,T.b,T.c,T.d,T.e-(dx-R),T.f-(dy-R));const saved=ctx;ctx=oc;try{f()}finally{ctx=saved}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha*=k;ctx.drawImage(OC,0,0,W,W,dx-R,dy-R,W,W);ctx.restore()}
// a bubble that rises and pops (k 0..1): a soft round light with a white glint; at the end a ring of sparks
function bubble(q,r,rgb,k){if(k<=0||k>=1)return;if(k<.82){ctx.save();ctx.globalAlpha*=sstep(0,.1,k);ctx.fillStyle=`rgba(${rgb},.35)`;ball(q,r);ctx.fill();ctx.strokeStyle=`rgba(${rgb},.9)`;ctx.lineWidth=1.2;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.85)';ball([q[0]-r*.35,q[1]-r*.4],r*.22);ctx.fill();ctx.restore();return}
  const u=(k-.82)/.18;ctx.save();ctx.strokeStyle=`rgba(${rgb},${1-u})`;ctx.lineWidth=1.4;ctx.lineCap='round';for(let i=0;i<6;i++){const a=i/6*TAU+.3,a0=r*(.6+u*1.2),a1=r*(1+u*1.6);seg([q[0]+Math.cos(a)*a0,q[1]+Math.sin(a)*a0],[q[0]+Math.cos(a)*a1,q[1]+Math.sin(a)*a1]);ctx.stroke()}ctx.restore()}

// ------------------------------------------------------------------ IL BURATTINAIO D'OMBRA (puppeteer)
// a violet bell-shaped cloak floating over the floor (its hem in wavy tongues), golden trim and three golden star buttons, a white ruff,
// a big hood ending in a soft point with a little golden bell, the dark inside of the hood with two big glowing yellow eyes and a yellow
// smile with two little fangs; two big white gloves with violet cuffs float beside it, golden strings hanging from their fingers.
// Phase 2 (o.p2): a darker cloak with magenta trim, orange-red eyes, violet flames on the fingertips
const PU={cloak:'#6a40b0',cloakD:'#3e2470',inner:'#1b1030',trim:'#ffcf4a',star:'#ffd84a',ruff:'#f6f0ff',ruffD:'#c9bce6',glove:'#f2ecff',cuff:'#7a52c4',
  eye:'#ffd84a',eyeRgb:'255,216,74',smile:'#ffd84a',fang:'#ffffff',str:'#ffe9a0',strRgb:'255,233,160',bell:'#ffc93c',shadowRgb:'120,70,200'},
  PU2=Object.assign({},PU,{cloak:'#4f2a8c',cloakD:'#2c1458',trim:'#ff5fc8',star:'#ff8ad8',cuff:'#a02a8a',eye:'#ff7a3a',eyeRgb:'255,122,58',smile:'#ff7a3a',str:'#ff9ae0',strRgb:'255,154,224'});
const PHOV=9,PPROF=[[0,27],[4,28.5],[11,26],[21,21.5],[32,17],[41,14],[46,12]],PAX=.88,PHC=[3,0,74],PHR=19.5,PRF=[0,0,55.5];
// the hands: where they float at rest (body space), the strings' length
const PHR0=[15,40,40],PHL0=[15,-40,40];
function puPose(anim,p,o){const ph=p*TAU,A={B:[0,0,0],lean:0,roll:0,yaw:0,s:0,sx:0,hd:[0,0,0],hy:0,hp:0,
  hR:PHR0.slice(),hL:PHL0.slice(),gR:'open',gL:'open',fR:[0,0,-1],fL:[0,0,-1],str:'hang',strK:1,
  blink:1,squint:0,shut:0,grin:0,eyeK:1,sink:0,alpha:1,hood:null,ring:-1,ringAt:null,span:-1,pup:-1,vanish:-1,die:-1,stars:0,glowK:0,from:0,bow:0};
  // the hover: a slow bob that never stops
  const bob=Math.sin(ph)*(anim==='idle'||anim==='prep'?1.6:anim==='walk'?1.2:0);A.B[2]=bob;
  if(anim==='walk'){// glides forward: leans into it, the hem trails, the hands swing gently against each other
    const sw=Math.sin(ph);A.lean=.16;A.B[2]+=.8*Math.cos(ph*2);A.roll=.06*sw;A.yaw=.05*sw;A.hp=-.05;
    A.hR=[6-8*sw,33,42+2*Math.cos(ph)];A.hL=[6+8*sw,-33,42-2*Math.cos(ph)];A.hy=.1*Math.sin(ph-1)}
  else if(anim==='prep'){// winds up: the hands draw back and up, a violet glow gathers, the eyes narrow (loops: held)
    const k=sstep(0,.25,p)*(1-sstep(.9,1,p));A.hR=lerp3(PHR0,[-6,30,64],k);A.hL=lerp3(PHL0,[-6,-30,64],k);A.lean=-.12*k;A.squint=.6*k;A.glowK=k;A.gR=A.gL=k>.5?'claw':'open';
    A.B[1]+=.6*trem(p,.25,.9,7,.9)*k;A.str='hang'}
  else if(anim==='slam'){// .0-.35 both hands rise high over the hood (fists), .35-.45 they slam down on the floor in front, .45-.62 hold
    // (a shock wave), .62-1 float back. The body leans into the blow
    const K=[[0,[0,10,34,44,0]],[.3,[-.12,4,28,92,.5]],[.36,[-.14,2,26,96,.6]],[.45,[.22,40,20,6,1]],[.6,[.2,40,21,7,1]],[.8,[.04,18,30,30,.4]],[1,[0,10,34,44,0]]];
    const v=keys(K,p);A.lean=v[0];A.hR=[v[1],v[2],v[3]];A.hL=[v[1],-v[2],v[3]];A.gR=A.gL=p>.12&&p<.75?'fist':'open';A.squint=.5*v[4];A.grin=v[4]>.8?.8:0;
    A.str=p>.12&&p<.75?'none':'hang';A.ring=p>=.44&&p<.9?(p-.44)/.46:-1;A.ringAt=[40,0,0];if(p>.43&&p<.5)A.B[2]-=2}
  else if(anim==='strings'){// the hands spread wide, a bright string stretches between them and sweeps forward and back
    const K=[[0,[10,34,44,0]],[.18,[0,46,58,1]],[.82,[0,46,58,1]],[1,[10,34,44,0]]],v=keys(K,p),sw=sstep(.2,.5,p)-sstep(.55,.8,p);
    A.hR=[v[0]+46*sw,v[1],v[2]-14*sw];A.hL=[v[0]+46*sw,-v[1],v[2]-14*sw];A.gR=A.gL='point';A.fR=[1,0,0];A.fL=[1,0,0];A.span=v[3];A.str='none';A.lean=.1*sw;A.squint=.3*v[3];A.grin=.6*v[3]}
  else if(anim==='puppets'){// the hands rise over three little shadow puppets that climb out of the floor, the fingers playing the strings
    const k=sstep(0,.2,p)*(1-sstep(.85,1,p)),w=Math.sin(ph*3);A.hR=[22,24,70+3*w];A.hL=[22,-24,70-3*w];A.hR=lerp3(PHR0,A.hR,k);A.hL=lerp3(PHL0,A.hL,k);
    A.gR=A.gL='open';A.str=k>.3?'pull':'hang';A.strK=k;A.pup=p;A.grin=.5*k;A.hp=.08*k;A.lean=.08*k}
  else if(anim==='vanish'){// the curtain: .0-.35 spins and sinks into a violet puddle, .35-.62 only the puddle with the eyes, .62-1 rises back
    const dn=sstep(0,.35,p),up=sstep(.62,1,p);A.sink=dn*(1-up);A.yaw=TAU*(ez(cl(p/.35,0,1))+ez(cl((p-.62)/.38,0,1)));A.vanish=p;A.str='none';
    A.hR=lerp3(PHR0,[6,16,30],A.sink);A.hL=lerp3(PHL0,[6,-16,30],A.sink);A.gR=A.gL=A.sink>.4?'fist':'open';A.B[2]-=(PHOV+100)*ez(A.sink);A.s=.06*bump(A.sink)}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.3*kb;A.B=[-4*kb,0,A.B[2]+2*kb];A.s=-.06*kb;A.hp=-.2*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;
    A.hR=[10-8*kb,36+6*kb,44+16*kb];A.hL=[10-8*kb,-36-6*kb,44+16*kb];A.str='hang'}
  else if(anim==='enter'){// comes down from above hanging on its own strings, lands softly, then a deep theatrical bow (a hand on the chest)
    const dn=1-ez(cl(p/.5,0,1)),land=p>.5&&p<.62?Math.sin((p-.5)/.12*Math.PI):0;A.B[2]+=150*dn-3*land;A.s=-.08*land;A.str=p<.55?'up':'hang';A.from=dn;
    const bw=bump(cl((p-.62)/.34,0,1));A.bow=bw;A.lean=.42*bw;A.hp=.2*bw;A.hR=lerp3(PHR0,[16,10,50],bw);A.gR=bw>.3?'fist':'open';A.hL=lerp3(PHL0,[-8,-46,60],bw);A.grin=.7*bw}
  else if(anim==='die'){// .0-.12 the strings snap, .1-.4 the hands fall and bounce, .35-.5 they puff into smoke, .25-.7 the cloak goes limp
    // and settles flat on the floor, .5-.72 the hood falls on it, .62-.95 the eyes float up as two bubbles and pop
    A.die=p;A.str=p<.12?'snap':'none';A.strK=p/.12;const fall=sstep(.1,.32,p),bnc=p>.32&&p<.42?Math.sin((p-.32)/.1*Math.PI)*3:0;
    A.hR=[14,36,lerp(44,4,fall)+bnc];A.hL=[14,-36,lerp(44,4,fall)+bnc];A.gR=A.gL='open';A.handK=1-sstep(.36,.5,p);
    const lim=sstep(.25,.6,p);A.lim=lim;A.s=-.55*lim;A.sx=.08*lim;A.lean=.38*lim;A.roll=.16*lim;A.B[2]=-PHOV*lim;A.cloakK=1-sstep(.68,.9,p);A.smoke=p>.66&&p<.98?(p-.66)/.32:-1;A.roll=.1*Math.sin(p*14)*(1-lim)*sstep(.2,.3,p);A.shut=p>.05&&p<.6?1:0;
    A.hood=sstep(.48,.7,p);A.eyeK=1-sstep(.6,.66,p)}
  else{// idle: breathes (the cloak swells), the head looks round, the hands drift and the fingers play the strings a little
    const b=Math.sin(ph);A.s=.025*b;A.hy=look(p,.4);A.hp=.04*Math.sin(ph+1);A.blink=blink(p,.6,.07);A.grin=.15+.1*Math.sin(ph*2);
    A.hR=[10+2*Math.sin(ph+.6),34+1.4*b,44+3*Math.sin(ph-.4)];A.hL=[10+2*Math.sin(ph+2.2),-34-1.4*b,44+3*Math.sin(ph+1.2)]}
  return A}
// a white glove: the palm (an ellipsoid along the fingers u, across v, thin along the back w), the violet cuff, three fingers and the thumb
// as soft capsules, curled for a fist, the index straight to point. Returns the fingertips (3D) for the strings
function glove(V0,c,u,w,side,pose,K,fk,gs){gs=gs||1;u=nrm(u);w=nrm(sub(w,mul(u,dot(w,u))));const v=cross(w,u),F={u,v,w},{P,D}=V0,L=parts();
  const col=dk(K.glove,.25*fk),tips=[],at=(a,b,cc)=>add(c,mul(add(add(mul(u,a),mul(v,b)),mul(w,cc)),gs)),S=x=>mul(x,gs);
  L.add(D(c),()=>svol(V0,ellPts(c,[6.6*gs,6.2*gs,3.8*gs],F,5,14),col,{lw:2.5,kl:.22,kd:.22}));
  // the cuff: a short wide ring behind the palm
  const cf=at(-7.5,0,0);L.add(D(cf)-.5,()=>{const R=[];for(let i=0;i<14;i++){const t=i/14*TAU;for(const a of[-1.8,1.8])R.push(add(cf,S(add(add(mul(u,a),mul(v,Math.cos(t)*5.6)),mul(w,Math.sin(t)*4.4)))))}
    svol(V0,R,dk(K.cuff,.2*fk),{lw:2.3,kl:.25,kd:.25});const r2=[];for(let i=0;i<=14;i++){const t=i/14*TAU;r2.push(P(add(cf,S(add(add(mul(u,1.9),mul(v,Math.cos(t)*5.6)),mul(w,Math.sin(t)*4.4))))))}
    ctx.strokeStyle=K.trim;ctx.lineWidth=1.5;line(r2);ctx.stroke()});
  const rk=.75+.25*gs,fing=(b,dirs,rs,i)=>{const pts=[b];let q=b;for(const d of dirs){q=add(q,S(d));pts.push(q)}tips[i]=q;L.add(D(lerp3(b,q,.5))+(dot(dirs[0],w)<0?-.3:.3),()=>chain(V0,pts,rs.map(r=>r*rk),col,{lw:2.2,kl:.25,kd:.2}))};
  for(let i=0;i<3;i++){const b=at(5,(i-1)*3.6,.3);let d1,d2;
    if(pose==='fist'||(pose==='point'&&i!==1)){d1=add(mul(u,2.2),mul(w,-2.6));d2=add(mul(u,-1.6),mul(w,-2.4))}
    else if(pose==='claw'){d1=add(mul(u,3.6),mul(w,-1.2));d2=add(mul(u,1.6),mul(w,-3))}
    else{d1=add(add(mul(u,4.4),mul(w,-.7)),mul(v,(i-1)*.9));d2=add(add(mul(u,3.8),mul(w,-1.3)),mul(v,(i-1)*.7))}
    fing(b,[d1,d2],[2.35,2.15,1.9],i)}
  const ts=-side,tb=at(.5,ts*5.2,-.4);fing(tb,pose==='fist'?[add(mul(v,ts*1.8),mul(u,2.6)),add(mul(u,1.8),mul(w,-1.4))]:[add(mul(v,ts*2.8),mul(u,2.2)),add(mul(u,2.8),mul(v,ts*.6))],[2.3,2.1,1.85],3);
  run(L);return tips}
function puppeteer(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const K=o.p2?PU2:PU,V0=V(face),{P,D,F}=V0,A=puPose(anim,p,o),ph=p*TAU,fx=fxOn(o);
  const lift=o.z!=null?o.z/sc:0;A.B[2]+=lift;const hov=PHOV+A.B[2],X=frame(A,hov),dB=D([0,0,30]);
  const hgt=Math.max(0,hov-PHOV);floor(V0,x,y,sc,[A.B[0],A.B[1],0],28,11,(A.die>=0?.3:.34)*(1-A.sink*.8),hgt);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),al=A.alpha;
  // the floor effects first: the violet puddle of the curtain, the shock wave of the slam
  if(A.vanish>=0){const k=Math.max(A.sink,sstep(.3,.36,A.vanish)*(1-sstep(.62,.7,A.vanish)));L.add(-999,()=>{const r=lerp(14,30,k);pool0(V0,[0,0,0],r,r*.95,`rgba(40,18,80,${.75*k})`);
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';const q=P(0,0,0);shine(K.shadowRgb,q[0],q[1],r*1.6,.35*k,r*.6);ctx.restore()}
    if(A.vanish>.36&&A.vanish<.64){const q=P(0,0,1);ctx.save();ctx.globalAlpha*=sstep(.36,.42,A.vanish)*(1-sstep(.58,.64,A.vanish));
      for(const sd of[-1,1]){ctx.fillStyle=K.eye;ctx.beginPath();ctx.ellipse(q[0]+sd*5.5,q[1]-1,2.6,1.8,0,0,TAU);ctx.fill();shine(K.eyeRgb,q[0]+sd*5.5,q[1]-1,7,.4)}ctx.restore()}})}
  if(A.vanish>=0&&A.sink>.45){const k=sstep(.45,.9,A.sink);L.add(990,()=>{const r=lerp(16,30,A.sink);pool0(V0,[0,0,0],r*1.04,r,`rgba(40,18,80,${.9*k})`)})}
  if(A.ring>=0&&fx){const k=A.ring;L.add(-998,()=>{ring0(V0,A.ringAt,8+k*46,K.shadowRgb,.7*(1-k),4*(1-k)+1);ring0(V0,A.ringAt,4+k*30,'255,233,160',.5*(1-k),2);
    for(const sd of[-1,1])dust(V0,add(A.ringAt,[0,sd*20,0]),k,6,10,'150,110,210',.45)})}
  const LC=parts();
  if(A.sink<.98){
    // the hem's wavy tongues (behind the cloak: only their ends show under the hem)
    const nT=9,tR=PPROF[0][1];for(let i=0;i<nT;i++){const t=i/nT*TAU+.18,c0=X.T([Math.cos(t)*tR*PAX*.94,Math.sin(t)*tR*.94,hov+1]);
      LC.add(dB-40+D(c0)*.01,()=>{const sw=Math.sin(ph*2+i*1.3)*.25,d=X.Rd(nrm([Math.cos(t)*.35,Math.sin(t)*.35+sw*.2,-1])),s=X.Rd([-Math.sin(t),Math.cos(t),0]);
        leaf(V0,c0,d,s,7.5+2*Math.sin(i*1.7+ph),4.6,dk(K.cloak,.25),{lw:2.2,kl:.1,kd:.25,round:.55})})}
    // the cloak: a soft bell with the golden trim along the hem and three star buttons down the front
    LC.add(dB,()=>{const pts=revo(PPROF,PAX,X,hov,26),core=svol(V0,pts,K.cloak,{lw:2.8,kl:.2,kd:.3});
      ctx.save();clipTo(core);
      surfLine(V0,X,t=>revoAt(PPROF,PAX,hov,t,hov+2.4,.2),K.trim,2.2,false,null,false);
      surfLine(V0,X,t=>revoAt(PPROF,PAX,hov,t,hov+5.4,.2),dk(K.trim,.35),1,false,[2,3],false);
      for(const zz of[15,27,39]){const s=revoAt(PPROF,PAX,hov,0,hov+zz,.4),f=F(X.Rd(s.n));if(f>.15){const q=P(X.T(s.p));star5(q,3.2*Math.min(1,f*1.6),K.star,cl((f-.15)*4,0,1))}}
      if(o.p2&&!LOWFX){ctx.globalCompositeOperation='lighter';const q=P(X.T([0,0,hov+10]));shine('200,60,220',q[0],q[1],26,.18+.06*Math.sin(G.t*6),12)}
      ctx.restore()})}
  // the ruff: white puffs round the neck, each at its own depth (the front ones in front of the chin)
  const Hc=X.T(add(PHC,A.hd)),hood=A.hood;
  if(A.sink<.9){for(let i=0;i<13;i++){const t=i/13*TAU,c=X.T([PRF[0]+Math.cos(t)*13.5*PAX,Math.sin(t)*13.5,PRF[2]+hov-PHOV+Math.sin(t*2+ph)*.3]);
    const rr=(4.4+.3*Math.sin(i*2.3))*(1-(A.lim||0));if(rr>.6)LC.add(D(c),()=>sball(V0,c,rr,K.ruff,{lw:2,kl:.2,kd:.18}))}}
  {const ck=A.cloakK==null?1:A.cloakK;if(ck>=.99)for(const e of LC)L.push(e);else if(ck>.01){const LCs=LC.slice().sort((a,b)=>a.d-b.d);L.add(dB,()=>fadeDraw(()=>{for(const e of LCs){ink(2.4);e.f()}},P(X.T([0,0,hov+16])),62,ck))}
    if(A.smoke>=0&&fx){const k=A.smoke;L.add(dB+1,()=>{dust(V0,[4,0,8],k,9,22,'150,110,210',.55);dust(V0,[4,0,20],cl(k*1.2,0,1),7,14,'190,160,240',.45)})}}
  // the hood: the head turns on its own (the look) and leans with the body; the dark face opening with the eyes and the smile, the soft
  // point with its little bell (behind or in front of the head as it turns)
  const hy=A.yaw+A.hy+cheat(face,.3),hp=A.hp+A.lean*.5,HR=v=>X.Rd(rotZ(rotY(v,hp),hy));
  let HC2=Hc,hk=0;if(hood!=null){hk=hood;HC2=lerp3(Hc,[22,4,PHR*.62],ez(hk));if(hk>.85&&hk<1)HC2=add(HC2,[0,0,3*Math.sin((hk-.85)/.15*Math.PI)])}
  const tipPts=[[-3,0,14],[-9,0,19.5],[-15.5,0,21],[-20,0,17.5]].map(q=>add(HC2,HR(q)));
  const drawTip=()=>{chain(V0,tipPts,[5.4,4.2,3.1,2.2],K.cloak,{lw:2.4,kl:.2,kd:.3});const b=P(tipPts[3]);const sw=Math.sin(G.t*4)*.8;ink(1.6);ball([b[0]+sw,b[1]+2.4],2.6);ctx.fillStyle=softBall([b[0]+sw,b[1]+2.4],2.6,K.bell,.5,.25);ctx.fill();ctx.stroke()};
  const tipBehind=F(HR([-1,0,.4]))<0;
  if(A.sink<.85){if(tipBehind)L.add(D(HC2)-6,drawTip);
    L.add(D(HC2),()=>{const h=P(HC2);ink(2.7);ball(h,PHR);ctx.fillStyle=softBall(h,PHR,K.cloak,.2,.3);ctx.fill();ctx.stroke();rim(h,PHR,h,PHR,.3);
      const nf=HR(nrm([1,0,-.12]));const cp=capPath(V0,h,PHR*.98,nf,.92);
      if(cp){ctx.fillStyle=K.inner;ctx.fill();ctx.save();ctx.strokeStyle=K.trim;ctx.lineWidth=1.8;ctx.lineJoin='round';ctx.beginPath();for(const q of cp.rim)ctx.lineTo(q[0],q[1]);if(cp.full)ctx.closePath();ctx.stroke();ctx.restore();
        ctx.save();ctx.beginPath();ctx.arc(h[0],h[1],PHR*.97,0,TAU);ctx.clip();capPath(V0,h,PHR*.98,nf,.92);ctx.clip();
        if(A.eyeK>0){const nod=v=>HR(v),E=eyes(V0,h,PHR,{nod,dir:[1,.36,.18],kind:'glow',col:K.eye,glow:K.eyeRgb,rx:4.7*(1+.15*A.glowK),ry:5.2,lightCol:'#ffffff',lr:.9,blink:A.blink,squint:A.squint,shut:A.shut&&A.eyeK>.5,shutCol:K.eye,a:.5,b:.66});
          if(!LOWFX&&!A.shut)for(const e of E)if(e.rx>.8)shine(K.eyeRgb,e.q[0],e.q[1],9,.4*A.blink*A.eyeK*Math.min(1,e.v*2))}
        if(!A.shut||A.die<0)mouth(V0,h,PHR,HR(nrm([1,0,-.45])),{kind:A.grin>.5?'open':'fangs',col:K.smile,lw:2,w:5.6,bow:3,fang:K.fang,fh:1.8,open:A.grin,dark:'#3a1a10',tongue:'#e07a8a'});
        ctx.restore()}});
    if(!tipBehind)L.add(D(HC2)+6,drawTip)}
  // the hands with their strings; fading into smoke when it is defeated
  const hand=(sd,h0,g,fd)=>{const c=add(h0,[A.B[0],A.B[1],hov-PHOV]),fk=sstep(0,-.15,F(0,sd,0))*.6,hk2=A.handK==null?1:A.handK;if(hk2<=0)return;
    L.add(D(c)+2,()=>{const u=g==='fist'?[0,0,-1]:g==='point'?fd:g==='claw'?nrm([1,sd*.25,.55]):nrm([.25,sd*.1,-1]),w=g==='fist'?[1,0,0]:g==='point'?[0,0,1]:g==='claw'?[-.5,0,1]:[1,0,.2];
      const draw=()=>{const tips=glove(V0,c,X.Rd(u),X.Rd(w),sd,g,K,fk,1.45);if(o.p2&&!LOWFX&&g!=='fist')for(const tp of tips.slice(0,3)){const q=P(tp);ctx.save();ctx.globalCompositeOperation='lighter';shine('210,80,255',q[0],q[1],5,.5);ctx.restore()}
        if(A.str!=='none'&&hk2>=1){for(const tp of tips.slice(0,3)){const q=P(tp);let e;
          if(A.str==='up')e=P(add(tp,[0,0,200]));else if(A.str==='pull'&&A.pup>=0){e=P([40,sd*14,8+18*sstep(.15,.5,A.pup)])}else if(A.str==='snap'){const k=A.strK;e=P(add(tp,[0,0,-(tp[2])*(1-k)-2]))}
          else e=P([tp[0]+Math.sin(G.t*1.6+tp[1])*1.5,tp[1],0]);
          ctx.save();ctx.strokeStyle=`rgba(${K.strRgb},.85)`;ctx.lineWidth=.9;seg(q,e);ctx.stroke();ctx.restore();
          if(A.str==='snap'&&A.strK<1){ctx.save();ctx.globalAlpha*=1-A.strK;star5(q,2.6,'#fff2b0');ctx.restore()}}}};
      if(hk2<.99)fadeDraw(draw,P(c),28,hk2);else draw()});
    if(A.handK!=null&&A.handK<1&&A.handK>0&&fx)L.add(D(c)+3,()=>dust(V0,c,1-A.handK,7,7,'170,130,230',.6))};
  if(A.sink<.95){hand(1,A.hR,A.gR,A.fR);hand(-1,A.hL,A.gL,A.fL)}
  // the bright string between the hands (sweeping forward)
  if(A.span>0){const a=add(A.hR,[A.B[0]+6,A.B[1],hov-PHOV]),b=add(A.hL,[A.B[0]+6,A.B[1],hov-PHOV]);L.add(Math.max(D(a),D(b))+4,()=>{const qa=P(a),qb=P(b);
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${K.strRgb},${.35*A.span})`;ctx.lineWidth=6;seg(qa,qb);ctx.stroke();ctx.restore()}
    ctx.save();ctx.strokeStyle=`rgba(255,250,220,${A.span})`;ctx.lineWidth=1.6;seg(qa,qb);ctx.stroke();ctx.restore()})}
  // three little shadow puppets climbing out of the floor (round violet heads with yellow eyes, little arms up on their strings)
  if(A.pup>=0&&fx){const k=sstep(.1,.5,A.pup)*(1-sstep(.88,1,A.pup));for(const[i,t] of[[0,-.6],[1,0],[2,.6]]){const c=[40*Math.cos(t)+6,40*Math.sin(t),0];L.add(D(c)-1,()=>{
    const up=k*(1-.15*Math.sin(G.t*6+i)),q0=P(c),r=6.4,top=P(add(c,[0,0,4+16*up]));ctx.save();ctx.beginPath();ctx.rect(q0[0]-20,q0[1]-60,40,60);ctx.clip();
    pool0(V0,c,9,8,`rgba(40,18,80,${.6*k})`);ink(2);hull(top,r,P(add(c,[0,0,-6])),r*.9);ctx.fillStyle=softBox([top[0]-r,top[1]-r,top[0]+r,top[1]+20],'#4a2a7a',.2,.3);ctx.fill();ctx.stroke();
    ink(2);ball(top,r);ctx.fillStyle=softBall(top,r,'#5a3590',.2,.3);ctx.fill();ctx.stroke();for(const sd of[-1,1]){ctx.fillStyle='#ffd84a';ball([top[0]+sd*2.2,top[1]+.4],1.3);ctx.fill()}ctx.restore()})}}
  // the defeat: the two eyes rise from the fallen hood as bubbles and pop
  if(A.die>=0){const k=cl((A.die-.62)/.33,0,1);if(k>0&&k<1){const h=add(HC2,[4,0,4]);L.add(999,()=>{for(const sd of[-1,1]){const q=P(add(h,[0,sd*6,k*60+sd*4*Math.sin(k*9)]));bubble(q,4.5,K.eyeRgb,cl(k+(sd>0?.06:0),0,1))}})}}
  if(A.vanish>=0&&A.sink>.005){const L0=L.filter(e=>e.d<-900),L1=L.filter(e=>e.d>=-900);run(L0);
    const q0=P(0,0,0),r=lerp(16,30,A.sink),E=[];for(let i=0;i<28;i++){const t=i/28*TAU;E.push(P(Math.cos(t)*r*1.02,Math.sin(t)*r*.97,0))}
    let ar=0;for(let i=0;i<E.length;i++){const a=E[i],b=E[(i+1)%E.length];ar+=a[0]*b[1]-b[0]*a[1]}const R4=[[q0[0]-400,q0[1]-600],[q0[0]+400,q0[1]-600],[q0[0]+400,q0[1]],[q0[0]-400,q0[1]]];
    ctx.save();ctx.beginPath();for(const w of(ar>0?R4:R4.slice().reverse()))ctx.lineTo(w[0],w[1]);ctx.closePath();ctx.moveTo(E[0][0],E[0][1]);for(const w of E)ctx.lineTo(w[0],w[1]);ctx.closePath();ctx.clip();run(L1);ctx.restore()}
  else run(L);
  if(A.glowK>0&&!LOWFX){const q=P(X.T([0,0,hov+30]));ctx.save();ctx.globalCompositeOperation='lighter';shine(K.shadowRgb,q[0],q[1],46,.28*A.glowK,30);ctx.restore()}
  if(A.stars>0)bstars(P(add(Hc,[0,0,22])),17,A.stars);
  ctx.restore()}
reg('puppeteer',{n:"Il Burattinaio d'Ombra",g:'boss3',sc:1,an:['idle','walk','prep','slam','strings','puppets','vanish','hit','enter','die'],
  dur:{idle:2.6,walk:1.5,prep:1,slam:1.3,strings:1.7,puppets:1.6,vanish:2,hit:.6,enter:2.4,die:3.4},
  lab:{idle:'Fermo',walk:'Fluttua',prep:'Prepara',slam:'Manate',strings:'Fili',puppets:'Burattini',vanish:'Sipario',hit:'Colpito',enter:'Entrata',die:'Sconfitta'}},puppeteer);
// ------------------------------------------------------------------ LA FENICE DELLA FORGIA (phoenix)
// a plump orange fire bird standing on short golden legs: a round body with a golden belly, a big round head with big white eyes (amber
// iris, a point of light) under angry little brows, a small golden beak, a crest of five flame feathers; two wings of long feathers from
// red to orange to gold, folded along its sides or spread wide; a tail of three long flame feathers that curl up. Little flames lick its
// crest, its wing tips and its tail. Phase 2 (o.p2, after the rebirth): blue-white flames, a pale golden body, ice-blue eyes
const PX={body:'#ff6a1f',belly:'#ffcf4a',f0:'#e8361c',f1:'#ff7a24',f2:'#ffd84a',crest:'#ffd84a',crest2:'#ff8a24',beak:'#ffb020',leg:'#ffb020',iris:'#ff9a1a',
  fire:'255,140,40',fireHot:'255,220,120',ash:'#9a948c',ashD:'#6a655e',egg:'#fff3d0'},
  PX2=Object.assign({},PX,{body:'#ffe0a0',belly:'#ffffff',f0:'#3a8ae8',f1:'#7fc8ff',f2:'#e8f8ff',crest:'#e8f8ff',crest2:'#7fd4ff',iris:'#3aa0ff',fire:'120,200,255',fireHot:'220,245,255'});
const XBC=[0,0,40],XBR=[17,15.5,20.5],XHC=[7,0,69],XHR=15,XSH=[1,13,53],XTB=[-14,0,31];
// a little flame licking up from a screen point (the game's time makes it flicker; never a pose)
function lick(q,r,rgb,hot,a,seed){const t=G.t*7+seed*3.1,h=r*(2.2+.5*Math.sin(t)),sw=.35*r*Math.sin(t*1.3+seed);ctx.save();ctx.globalAlpha*=a;
  const g=ctx.createLinearGradient(q[0],q[1],q[0],q[1]-h);g.addColorStop(0,`rgba(${hot},.95)`);g.addColorStop(.6,`rgba(${rgb},.85)`);g.addColorStop(1,`rgba(${rgb},0)`);
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(q[0]-r,q[1]);ctx.quadraticCurveTo(q[0]-r*.9,q[1]-h*.55,q[0]+sw,q[1]-h);ctx.quadraticCurveTo(q[0]+r*.9,q[1]-h*.55,q[0]+r,q[1]);ctx.closePath();ctx.fill();ctx.restore()}
function pxPose(anim,p,o){const ph=p*TAU,A={B:[0,0,0],lean:.12,roll:0,yaw:0,s:0,sx:0,hd:[0,0,0],hy:0,hp:0,wR:{sp:0,fl:0,sw:0},wL:{sp:0,fl:0,sw:0},tail:0,legs:1,
  blink:1,squint:0,shut:0,brow:.6,beak:0,lookE:[0,0],flame:1,ash:0,egg:-1,ball:-1,shell:-1,chick:-1,burst:-1,trail:-1,fan:-1,ring:-1,rain:-1,pillar:-1,stars:0,glowK:0,kk:1,ruff:-1};
  const fold=(a,b)=>{A.wR=Object.assign({},a);A.wL=Object.assign({},b||a)};
  if(anim==='walk'){// flies low: two wing beats per cycle, the body leaning into the flight, the legs tucked
    const f=Math.sin(ph*2);A.B=[0,0,13+3*Math.sin(ph*2-.8)];A.lean=.42;fold({sp:1,fl:.85*f,sw:.1});A.tail=.3*Math.sin(ph*2-1.2);A.legs=0;A.hp=-.2;A.hy=.08*Math.sin(ph)}
  else if(anim==='prep'){// rears up: wings rise and open, the crest flares, a glow gathers, the head ducks (a held loop)
    const k=sstep(0,.25,p)*(1-sstep(.9,1,p));A.lean=lerp(.12,-.15,k);fold({sp:.75*k,fl:.55*k,sw:-.2*k});A.glowK=k;A.flame=1+.8*k;A.squint=.5*k;A.brow=1;A.hp=.12*k;A.B[1]+=.6*trem(p,.25,.9,7,.9)*k}
  else if(anim==='feathers'){// .0-.35 the wings swing far back and up, .35-.5 they sweep forward hard (a fan of fire feathers flies), .5-1 back
    const K=[[0,[0,0,.12,0]],[.32,[.9,.75,-.25,-.7]],[.4,[1,.2,.3,.5]],[.5,[.85,-.4,.35,.85]],[.7,[.5,-.2,.2,.3]],[1,[0,0,.12,0]]],v=keys(K,p);fold({sp:v[0],fl:v[1],sw:v[3]});A.lean=v[2];
    A.beak=p>.36&&p<.6?.8:0;A.brow=1;A.fan=p>=.4&&p<.95?(p-.4)/.55:-1}
  else if(anim==='dive'){// .0-.35 rises with big beats, .35-.62 dives forward like an arrow (wings swept back, a trail of fire), .62-1 brakes
    // with the wings wide and lands
    const up=p<.35?ez(p/.35):p<.62?1-ez((p-.35)/.27)*.9:.1*(1-ez((p-.62)/.38));A.B=[p<.35?-6*ez(p/.35):p<.62?lerp(-6,46,ez((p-.35)/.27)):lerp(46,0,ez((p-.62)/.38)),0,62*up];
    if(p<.35)fold({sp:1,fl:.9*Math.sin(p/.35*TAU*2),sw:0});else if(p<.62)fold({sp:.35,fl:.15,sw:-1.1});else fold({sp:1,fl:.4*Math.cos((p-.62)/.38*Math.PI),sw:.2});
    A.lean=p<.35?-.1:p<.62?1.05:lerp(.6,.12,ez((p-.62)/.38));A.legs=p>.8?1:0;A.beak=p>.36&&p<.62?.5:0;A.brow=1;A.trail=p>=.35&&p<.7?(p-.35)/.35:-1}
  else if(anim==='vortex'){// spins on the spot with the wings spread: a ring of fire spreads round it
    const k=sstep(0,.15,p)*(1-sstep(.85,1,p));A.yaw=TAU*2*ez(p);fold({sp:k,fl:.25*k,sw:0});A.B[2]=8*k;A.legs=1-k;A.lean=.05;A.ring=p>.12&&p<.95?(p-.12)/.83:-1;A.squint=.6*k}
  else if(anim==='rain'){// flies up high beating hard, embers rain down round it, then comes down
    const up=bump(cl(p/.95,0,1));A.B=[0,0,92*Math.pow(up,.7)];fold({sp:1,fl:.95*Math.sin(ph*3),sw:0});A.lean=-.08;A.legs=up>.2?0:1;A.rain=p>.2&&p<.95?(p-.2)/.75:-1;A.beak=.4*up;A.hp=-.25*up}
  else if(anim==='rebirth'){// the phase change: .0-.28 wraps itself in its wings into a ball of fire, .28-.5 the ball goes grey and hard
    // like an egg of ash, .5-.6 it cracks and bursts, .6-1 the reborn phoenix (blue flames) opens its wings wide and cries
    A.ball=p<.6?sstep(0,.28,p):-1;A.kk=p<.56?1-sstep(.05,.28,p):sstep(.56,.68,p);A.egg=p>=.28&&p<.6?(p-.28)/.32:-1;A.burst=p>=.5&&p<.85?(p-.5)/.35:-1;
    const k=sstep(.6,.8,p);fold(p<.3?{sp:0,fl:-.3,sw:.5}:{sp:k,fl:.6*k-.2*Math.sin((p-.6)*20)*k,sw:0});A.beak=p>.62&&p<.95?1:0;A.lean=lerp(.3,-.2,k);A.reborn=p>=.55;A.flame=1+k}
  else if(anim==='hit'){const kb=hitK(p);A.lean=.12-.35*kb;A.B=[-4*kb,0,1.5*kb];A.s=-.06*kb;A.hp=-.2*kb;fold({sp:.45*kb,fl:.5*kb,sw:-.3*kb});A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;A.ruff=p<.8?p/.8:-1;A.flame=1-.4*kb}
  else if(anim==='enter'){// swoops down from the sky inside a pillar of fire, lands with a beat of the wings, then spreads them wide and cries
    const dn=1-ez(cl(p/.45,0,1));A.B=[0,0,200*dn];fold(p<.45?{sp:1,fl:.7*Math.sin(p*TAU*4),sw:0}:{sp:sstep(.6,.75,p)*1+(1-sstep(.45,.55,p))*.8,fl:.5*sstep(.6,.75,p),sw:0});
    A.legs=p>.4?1:0;A.lean=p<.45?.3:lerp(.3,-.15,sstep(.6,.75,p));A.beak=p>.68&&p<.95?1:0;A.pillar=p<.6?p/.6:-1;A.brow=1;A.dustK=p>.44&&p<.7?(p-.44)/.26:-1}
  else if(anim==='die'){// .0-.25 staggers as its flames flicker out, .2-.55 the feathers go grey from the tips and it sinks, .5-.75 it curls up into a
    // round glowing egg (ash rises), .75-.9 the egg cracks, .9-1 a tiny chick peeks out of the shell and blinks
    A.flame=1-sstep(.05,.35,p);A.ash=sstep(.18,.55,p);A.kk=1-sstep(.45,.72,p);A.egg=p>=.5?Math.min(1,(p-.5)/.25):-1;A.shell=p>=.75?(p-.75)/.25:-1;A.chick=p>=.88?(p-.88)/.12:-1;
    A.lean=.12+.25*sstep(.15,.45,p);A.B=[0,0,-6*sstep(.3,.6,p)];A.roll=.12*Math.sin(p*20)*(1-sstep(.2,.4,p))*sstep(0,.08,p);fold({sp:.25*bump(cl(p/.4,0,1)),fl:-.4*sstep(.2,.5,p),sw:.3});
    A.shut=p>.08?1:0;A.s=-.15*sstep(.25,.55,p)}
  else{// idle: breathes (the belly swells), looks round, blinks; the wings shuffle on its sides, the crest and the tail sway
    const b=Math.sin(ph);A.s=.03*b;A.hy=look(p,.42);A.hp=.05*Math.sin(ph+1);A.blink=blink(p,.62,.07);fold({sp:.06+.04*Math.sin(ph*2),fl:-.05,sw:.05*b});A.tail=.15*Math.sin(ph+.5)}
  return A}
// one wing: shoulder S (body space), the bones to the elbow and the wrist, opened by sp (0 folded on the side .. 1 spread), raised by fl
// (-1 down .. 1 up), swept by sw (forward > 0); feathers along the hand and the arm, from red at the root to gold at the tip
function pxWing(V0,X,sd,W,K,ash,fk){const{P,D,F}=V0,S=[XSH[0],sd*XSH[1],XSH[2]],sp=cl(W.sp,0,1),fl=W.fl||0,sw=W.sw||0,L=parts();
  // the wing's own turn: raised by fl round the body's forward axis, swept forward by sw round the vertical
  const fa=sd*fl*.95,cf=Math.cos(fa),sf=Math.sin(fa),sb=sd*sw*.55,cb=Math.cos(sb),sbb=Math.sin(sb);
  const rel=v=>{const y=v[1]*cf-v[2]*sf,z=v[1]*sf+v[2]*cf,x=v[0];return[x*cb+y*sbb,-x*sbb+y*cb,z]};
  const at=v=>X.T(add(S,rel(v))),ce=c=>ash>0?C.cmix(c,K.ash,ash):c,fc=[ce(K.f0),ce(K.f1),ce(K.f2)];
  const E=lerp3([-5,sd*4,-7],[0,sd*17,5],sp),Wr=lerp3([-15,sd*5,-9],[-2,sd*35,8],sp),up=X.Rd(rel([0,0,1])),gk=sstep(.18,.6,sp),bk=1-sstep(.22,.42,sp);
  let tip=P(at(lerp3(Wr,[-2,sd*48,8],.5)));
  // folded: a rounded feathered blade on the side of the body with three feather tips at the back
  if(bk>.01){const Cb=at([-5,sd*3.5,-10]),Fb={u:X.Rd(rel(nrm([1,0,-.3]))),v:X.Rd(rel([0,sd,0])),w:X.Rd(rel(nrm([.3,0,1])))};
    L.add(D(Cb),()=>{const draw=()=>{for(let i=0;i<3;i++){const b=add(Cb,add(mul(Fb.u,-9+i*2.5),mul(Fb.w,-8+i*3))),d=nrm(add(mul(Fb.u,-1),mul(Fb.w,-.55))),s=Fb.v;
        leaf(V0,b,d,nrm(cross(d,s)),12-i*1.5,3.6,fc[1],{back:dk(fc[1],.2),lw:1.8,kl:.25,kd:.2});leaf(V0,add(b,mul(d,4.5)),d,nrm(cross(d,s)),6.5,2.2,fc[2],{lw:1.2,kl:.3,kd:.15})}
      const core=svol(V0,ellPts(Cb,[13,4.2,15.5],Fb,5,14),dk(fc[0],.12*fk),{lw:2.5,kl:.25,kd:.3});ctx.save();clipTo(core);
      for(let i=0;i<3;i++){const c=add(Cb,add(mul(Fb.u,-6+i*5),mul(Fb.w,-9+i*1.5))),q=P(c);ctx.strokeStyle=fc[1];ctx.lineWidth=2;ctx.beginPath();ctx.arc(q[0],q[1]-2,5,.2,Math.PI-.2);ctx.stroke()}
      const q=P(add(Cb,mul(Fb.w,7)));ctx.fillStyle=`rgba(255,240,200,${.18})`;ctx.beginPath();ctx.ellipse(q[0]-2,q[1],5,3,0,0,TAU);ctx.fill();ctx.restore()};
      if(bk<.99)fadeDraw(draw,P(Cb),34,bk);else draw()})}
  if(gk>.01){
    // spread: the primaries along the hand (the outer ones the longest), the secondaries along the arm, the leading edge on top
    for(let i=0;i<6;i++){const k=i/5,b=at(lerp3(Wr,E,k*.85)),th=lerp(.12,1.2,k),d=X.Rd(rel(nrm([-Math.sin(th),sd*Math.cos(th),.04]))),s=nrm(cross(d,up)),Lf=lerp(26,15,k)*gk;
      L.add(D(b)-k*.01,()=>{leaf(V0,b,d,s,Lf,4.8*Math.min(1,gk*1.5),fc[0],{back:dk(fc[0],.25),lw:2,kl:.2,kd:.25,bend:.08});leaf(V0,add(b,mul(d,Lf*.35)),d,s,Lf*.62,3.1*Math.min(1,gk*1.5),fc[2],{back:dk(fc[1],.2),lw:1.4,kl:.3,kd:.15})})}
    for(let i=0;i<4;i++){const k=i/3,b=at(lerp3(E,[0,sd*2,0],k*.8)),d=X.Rd(rel(nrm([-1,sd*.25,-.05]))),s=nrm(cross(d,up)),Lf=lerp(17,12,k)*gk;
      L.add(D(b)-.2,()=>{leaf(V0,b,d,s,Lf,4.5,fc[1],{back:dk(fc[1],.25),lw:2,kl:.2,kd:.25});leaf(V0,add(b,mul(d,Lf*.4)),d,s,Lf*.55,2.7,fc[2],{lw:1.3,kl:.3,kd:.15})})}
    const pts=[at([0,0,0]),at(E),at(Wr)];L.add(D(pts[1])+.3,()=>{ctx.save();ctx.globalAlpha*=Math.min(1,gk*1.6);chain(V0,pts,[6.4,5.2,3.6],dk(fc[0],.1*fk),{lw:2.3,kl:.22,kd:.25});ctx.restore()})}
  run(L);return tip}
function phoenix(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const A=pxPose(anim,p,o),K=o.p2||A.reborn?PX2:PX,V0=V(face),{P,D,F}=V0,ph=p*TAU,fx=fxOn(o);
  const lift=o.z!=null?o.z/sc:0;A.B[2]+=lift;const X=frame(A,XBC[2]-XBR[2]),dB=D(XBC),ash=A.ash,ce=c=>ash>0?C.cmix(c,K.ash,ash):c;
  floor(V0,x,y,sc,[A.B[0],A.B[1],0],26,10,.34,A.B[2]);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  // the floor effects: the fire ring, the pillar of fire of the entrance (behind and in front), the dust of the landing
  if(A.ring>=0&&fx){const k=A.ring;L.add(-998,()=>{ring0(V0,[0,0,0],14+k*60,K.fire,.8*(1-k),6*(1-k)+1.5);ring0(V0,[0,0,0],10+k*44,K.fireHot,.6*(1-k),2);
    for(let i=0;i<10;i++){const t=i/10*TAU+k*2,r=14+k*60,q=P(Math.cos(t)*r,Math.sin(t)*r,0);lick(q,3.4*(1-k*.5),K.fire,K.fireHot,1-k,i)}})}
  if(A.pillar>=0&&fx){const k=A.pillar;L.add(-997,()=>{const q=P(0,0,0),w=lerp(22,8,k),a=.65*(1-sstep(.75,1,k));ctx.save();ctx.globalCompositeOperation='lighter';
    const g=ctx.createLinearGradient(q[0],q[1]-260,q[0],q[1]);g.addColorStop(0,`rgba(${K.fire},0)`);g.addColorStop(.6,`rgba(${K.fire},${.35*a})`);g.addColorStop(1,`rgba(${K.fireHot},${.6*a})`);
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(q[0],q[1]-130,w,130,0,0,TAU);ctx.fill();ctx.restore()})}
  if(A.dustK>=0&&fx)L.add(-996,()=>dust(V0,[0,0,0],A.dustK,10,22,'255,190,120',.5));
  const kk=A.kk;
  const bird=()=>{const LB=parts();
    // the legs: short golden shins and three toes forward, one back
    if(A.legs>0)for(const sd of[-1,1]){const kn=X.T([2,sd*7,22]),an=[3+A.B[0],sd*8+A.B[1],3+A.B[2]*(1-A.legs)+lerp(14,0,A.legs)*(A.B[2]>2?1:0)],fk=sstep(0,-.15,F(0,sd,0));
      LB.add(D(an)-30,()=>{const lc=dk(ce(K.leg),.2*fk);chain(V0,[kn,lerp3(kn,an,.5),an],[2.6,2.2,2],lc,{lw:2,kl:.3,kd:.25});for(const[dx,dy] of[[6,-2.6],[6.6,0],[6,2.6],[-3.5,0]])caps(V0,an,1.6,add(an,X.Rd([dx,dy,-2.2])),1.2,lc,{lw:1.6})})}
    // the tail: three long flame feathers from the rump, curling up at the ends (two shorter golden ones on top)
    const tb=X.T(XTB);for(let i=0;i<5;i++){const j=i-2,lg=i%2===0,d=X.Rd(nrm([-1,j*.32+A.tail*.4,-.3+.05*Math.abs(j)])),s=X.Rd(nrm(cross([-1,j*.32,-.3],[0,0,1]))),Lf=lg?32-3*Math.abs(j):22;
      LB.add(dB-20-Math.abs(j)*.1,()=>{leaf(V0,tb,d,s,Lf,lg?5.4:4,ce(lg?K.f0:K.f1),{back:dk(ce(K.f0),.25),lw:2.1,kl:.2,kd:.25,bend:-.5});leaf(V0,add(tb,mul(d,Lf*.45)),d,s,Lf*.5,lg?3.2:2.4,ce(K.f2),{lw:1.4,kl:.3,kd:.15,bend:-.4})})}
    // the wings (the far one behind the body, the near one in front)
    let tips=[];for(const sd of[-1,1]){const W=sd>0?A.wR:A.wL,c=X.T([XSH[0]-6,sd*(XSH[1]+10*W.sp),XSH[2]-4]),fk=sstep(0,-.15,F(0,sd,0));LB.add(D(c)+(F(0,sd,0)>0?8:-8),()=>{tips[sd>0?1:0]=pxWing(V0,X,sd,W,K,ash,fk)})}
    // the body: a soft ball with the golden belly and a few feather scallops
    LB.add(dB,()=>{const core=svol(V0,ellPts(XBC,XBR,null,7,20).map(X.T),ce(K.body),{lw:2.8,kl:.22,kd:.28});ctx.save();clipTo(core);
      if(ellCap(V0,X,XBC,XBR,null,dir(0,-.15),.78,32,{alv:.62,u:[0,0,1]})){const q=P(X.T([16,0,36]));ctx.fillStyle=soft(q[0]-6,q[1]-8,q[0],q[1],24,ce(K.belly),.3,.15);ctx.fill()}
      for(const[t,e] of[[.5,.35],[-.5,.35],[.9,0],[-.9,0],[2.5,.4],[-2.5,.4],[3.14,.2]]){const m=dir(t,e),n=X.Rd(ellN(XBR,null,m)),f=F(n);if(f<.2)continue;const c=X.T(ellAt(XBC,XBR,null,m)),q=P(c);
        ctx.save();ctx.globalAlpha*=cl((f-.2)*3,0,1);ctx.strokeStyle=dk(ce(K.body),.22);ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(q[0],q[1]-1.5,3.4,.3,Math.PI-.3);ctx.stroke();ctx.restore()}
      ctx.restore()});
    // the head: a big ball turning on its own, big white eyes, angry little brows, the beak (opening when it cries), cheek fluff, the crest
    const Hc=X.T(add(XHC,A.hd)),hy=A.yaw+A.hy+cheat(face,.32),hp=A.hp-A.lean*.4,HR=v=>X.Rd(rotZ(rotY(v,hp),hy)),fwd=HR([1,0,0]),beakFront=F(fwd)>-.05;
    const crest=()=>{for(let i=0;i<5;i++){const j=i-2,b=add(Hc,HR(mul(nrm([-.25,j*.28,1]),XHR*.9))),d=HR(nrm([-.55-.08*Math.abs(j),j*.3,1])),s=HR(nrm([0,1,0])),fl=A.flame;
      leaf(V0,b,d,s,(19-2*Math.abs(j))*(.8+.25*fl),4.6,ce(i%2?K.crest2:K.crest),{back:dk(ce(K.crest2),.2),lw:1.8,kl:.3,kd:.2,bend:-.6})}};
    const crestBack=F(HR([-.3,0,1]))<.2;
    const beak=()=>{const o2=A.beak,bt=add(Hc,HR([XHR+9,0,-3.5-o2*1.5])),bl=add(Hc,HR([XHR*.8,-5.6,-1.5])),br=add(Hc,HR([XHR*.8,5.6,-1.5])),bb=add(Hc,HR([XHR*.76,0,-6.5-o2*3])),lt2=add(Hc,HR([XHR+5.5,0,-7.5-o2*6]));
      ink(1.8);ctx.fillStyle=dk(K.beak,.2);poly([P(bl),P(bb),P(br),P(lt2)].sort((a,b)=>a[0]-b[0]));
      ctx.beginPath();const q1=P(bl),q2=P(bb),q3=P(br),q4=P(lt2);ctx.moveTo(q1[0],q1[1]);ctx.lineTo(q2[0],q2[1]);ctx.lineTo(q3[0],q3[1]);ctx.lineTo(q4[0],q4[1]);ctx.closePath();ctx.fill();ctx.stroke();
      const t1=P(bl),t2=P(br),t3=P(bt),t4=P(add(Hc,HR([XHR*.95,0,2.4])));ctx.beginPath();ctx.moveTo(t1[0],t1[1]);ctx.lineTo(t4[0],t4[1]);ctx.lineTo(t2[0],t2[1]);ctx.lineTo(t3[0],t3[1]);ctx.closePath();
      ctx.fillStyle=softBox(bbox([t1,t2,t3,t4]),K.beak,.35,.2);ctx.fill();ctx.stroke()};
    LB.add(D(Hc),()=>{if(crestBack)crest();if(!beakFront)beak();const h=P(Hc);ink(2.7);ball(h,XHR);ctx.fillStyle=softBall(h,XHR,ce(K.body),.22,.28);ctx.fill();ctx.stroke();rim(h,XHR,h,XHR,.3);
      for(const sd of[-1,1]){const c=add(Hc,HR([3,sd*13.5,-4])),f=F(HR([0,sd,0]));if(f>-.3){const q=P(c);ctx.save();ctx.globalAlpha*=cl((f+.3)*2,0,1);ctx.fillStyle=ce(K.f1);ctx.strokeStyle=INK;ctx.lineWidth=1.4;
        for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(q[0]+sd*-1.5*k*(f>0?1:-1),q[1]+k*2.2,3.2,1.8,sd*.4,0,TAU);ctx.fill();ctx.stroke()}ctx.restore()}}
      ctx.save();ctx.beginPath();ctx.arc(h[0],h[1],XHR*.97,0,TAU);ctx.clip();
      const E=eyes(V0,h,XHR,{nod:HR,dir:[1,.44,.16],kind:'white',iris:A.reborn?'#3aa0ff':K.iris,col:'#1b1612',rx:4.8,ry:5.6,lw:1.4,blink:A.blink,squint:A.squint,shut:A.shut,a:.5,b:.66});
      for(const e of E){if(e.rx<1||A.shut)continue;const q=e.q,dirx=h[0]>=q[0]?1:-1;ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q[0]-dirx*e.rx*1.05,q[1]-5.6-.6*A.brow);ctx.lineTo(q[0]+dirx*e.rx*.9,q[1]-5.4+1.6*A.brow);ctx.stroke()}
      ctx.restore();if(beakFront)beak();if(!crestBack)crest()});
    run(LB);
    // the little flames: on the crest, the wing tips, the tail
    if(fx&&A.flame>.05&&!A.ball){const a=Math.min(1,A.flame);const q=P(add(Hc,HR([-2,0,XHR+8])));lick(q,3.2,K.fire,K.fireHot,a,1);for(const t of tips)if(t)lick(t,2.6,K.fire,K.fireHot,a,2);
      const tq=P(X.T(add(XTB,[-26,0,-4])));lick(tq,2.8,K.fire,K.fireHot,a,3)}};
  // the bird (faded out when it curls into a ball or an egg), the ball of fire, the egg
  if(kk>0)L.add(dB,()=>{if(kk>=.99)bird();else fadeDraw(bird,P(X.T([0,0,45])),80,kk)});
  if(A.ball>0&&A.egg<0){const k=A.ball;L.add(dB+1,()=>{const q=P(0,0,26),r=lerp(8,22,k);if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';shine(K.fire,q[0],q[1],r*2.6,.5*k);ctx.restore()}
    ink(2.4);ball(q,r);ctx.fillStyle=soft(q[0]-r*.3,q[1]-r*.35,q[0],q[1],r*1.25,`rgb(${K.fireHot})`,.4,.1);ctx.fill();ctx.stroke();for(let i=0;i<6;i++)lick([q[0]+Math.cos(i)*r*.7,q[1]-r*.6+Math.sin(i*2)*3],3,K.fire,K.fireHot,k,i)})}
  if(A.egg>=0){const k=A.egg,ember=anim==='die',sh=A.shell;L.add(dB+2,()=>{const c=[0,0,16],q=P(c),rx=12,ry=15,col=ember?C.cmix('#ff8a3a',K.egg,sstep(.4,1,k)):C.cmix('#ffd9a0','#cfc8bd',sstep(0,.6,k));
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';shine(ember?'255,150,60':K.fire,q[0],q[1]-4,30,.45*(1-.6*sstep(.5,1,k)));ctx.restore()}
    const fadeIn=sstep(0,.25,k);ctx.save();ctx.globalAlpha*=fadeIn;
    const egg=(top)=>{ctx.beginPath();ctx.ellipse(q[0],q[1]-ry*.9,rx,ry,0,top?Math.PI:0,top?TAU:Math.PI);ctx.closePath()};
    ink(2.6);ctx.beginPath();ctx.ellipse(q[0],q[1]-ry*.9,rx,ry,0,0,TAU);ctx.fillStyle=soft(q[0]-rx*.4,q[1]-ry*1.4,q[0],q[1]-ry*.9,ry*1.3,col,.35,.18);
    if(sh<0||sh<.55){ctx.fill();ctx.stroke()}
    if(sh>=0){// the crack: a zigzag round the middle, then the top lifts off and a tiny chick peeks out
      const cy=q[1]-ry*.95,zz=[];for(let i=0;i<=8;i++){const xx=q[0]-rx+i*rx/4;zz.push([xx,cy+(i%2?-2.4:2.2)])}
      if(sh<.55){ctx.save();ctx.globalAlpha*=sstep(0,.2,sh);ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.lineJoin='round';line(zz.slice(0,Math.ceil(1+8*sstep(0,.45,sh))));ctx.stroke();ctx.restore()}
      else{const lifted=sstep(.55,.75,sh);// bottom half
        ctx.save();ctx.beginPath();ctx.moveTo(q[0]-rx-2,cy);for(const w of zz)ctx.lineTo(w[0],w[1]);ctx.lineTo(q[0]+rx+2,q[1]+4);ctx.lineTo(q[0]-rx-2,q[1]+4);ctx.closePath();ctx.clip();
        ctx.beginPath();ctx.ellipse(q[0],q[1]-ry*.9,rx,ry,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
        // the chick: a little yellow ball with big eyes and a tiny beak, coming up out of the shell
        if(A.chick>=0){const ck=ez(A.chick),hq=[q[0],cy+2-8*ck],r=6.4;ctx.save();ctx.beginPath();ctx.rect(q[0]-rx-4,cy-40,2*rx+8,40+2.5);ctx.clip();
          ink(2);ball(hq,r);ctx.fillStyle=softBall(hq,r,'#ffe066',.35,.2);ctx.fill();ctx.stroke();ctx.restore();
          if(ck>.4){ctx.save();ctx.globalAlpha*=sstep(.4,.6,ck);const bl=blink(A.chick*.7,.6,.25);for(const sd of[-1,1]){ctx.fillStyle='#1b1612';ctx.beginPath();ctx.ellipse(hq[0]+sd*2.4,hq[1]-.6,1.1,1.5*bl,0,0,TAU);ctx.fill();ctx.fillStyle='#fff';ball([hq[0]+sd*2.4-.4,hq[1]-1.1],.4);ctx.fill()}
            ctx.fillStyle='#ff9a1a';ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(hq[0]-1.4,hq[1]+1.2);ctx.lineTo(hq[0]+1.4,hq[1]+1.2);ctx.lineTo(hq[0],hq[1]+3.2);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}}
        // the top of the shell, lifted and tipped
        ctx.save();ctx.translate(q[0]+8*lifted,cy-10*lifted-(A.chick>=0?6*ez(A.chick):0));ctx.rotate(.5*lifted);ctx.beginPath();ctx.moveTo(-rx-2,0);for(const w of zz)ctx.lineTo(w[0]-q[0],w[1]-cy);
        ctx.lineTo(rx+2,0);ctx.ellipse(0,cy-(q[1]-ry*.9)-cy+(q[1]-ry*.9)+(q[1]-ry*.9-cy),rx,ry,0,0,Math.PI,true);ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.stroke();ctx.restore()}}
    // ash flakes rising from the egg (the defeat), the flash of the rebirth
    if(ember&&fx)for(let i=0;i<7;i++){const u=((k*1.5+i/7)%1),q2=[q[0]+Math.sin(i*2.3+u*3)*14,q[1]-20-u*50];ctx.fillStyle=`rgba(200,195,185,${.7*(1-u)})`;ctx.fillRect(q2[0],q2[1],2,2)}
    ctx.restore()})}
  if(A.burst>=0&&fx){const k=A.burst;L.add(999,()=>{const q=P(0,0,22);ctx.save();ctx.globalCompositeOperation='lighter';shine(K.fireHot,q[0],q[1],20+90*k,.8*(1-k));ctx.restore();ring0(V0,[0,0,0],10+70*k,K.fire,.8*(1-k),5*(1-k)+1);
    for(let i=0;i<10;i++){const a=i/10*TAU,d=10+60*k,q2=[q[0]+Math.cos(a)*d,q[1]+Math.sin(a)*d*.6-20*k];ctx.fillStyle=`rgba(200,195,185,${.6*(1-k)})`;ball(q2,2+3*k);ctx.fill()}})}
  // a fan of fire feathers (the feather volley), the trail of the dive, the embers of the rain, the loose feathers of a hit
  if(A.fan>=0&&fx){const k=A.fan;for(let i=0;i<5;i++){const a=(i-2)*.32,c=[14+k*90*Math.cos(a),k*90*Math.sin(a),42-k*12];L.add(D(c)+20,()=>{const q=P(c),d=[Math.cos(a)*.9,Math.sin(a)*.9,0],q2=P(add(c,mul(d,-10)));
    ctx.save();ctx.globalAlpha*=1-sstep(.75,1,k);ctx.strokeStyle=`rgba(${K.fire},.6)`;ctx.lineWidth=3;seg(q,q2);ctx.stroke();leaf(V0,c,d,nrm(cross(d,[0,0,1])),11,3,K.f1,{lw:1.6,kl:.3,kd:.2});ctx.restore()})}}
  if(A.trail>=0&&fx){const k=A.trail;L.add(-990,()=>{for(let i=0;i<8;i++){const u=i/8,c=[A.B[0]-12-u*60*(1-k*.3),A.B[1],Math.max(4,A.B[2]*(1-u*.6))],q=P(c);lick(q,5*(1-u),K.fire,K.fireHot,(1-u)*(1-k),i)}})}
  if(A.rain>=0&&fx){const k=A.rain;L.add(-995,()=>{for(let i=0;i<14;i++){const u=((k*2.2+i*.37)%1),a=i*2.4,r=18+(i*13)%46,c=[Math.cos(a)*r,Math.sin(a)*r,(1-u)*110],q=P(c),g=P(Math.cos(a)*r,Math.sin(a)*r,0);
    ctx.save();ctx.globalAlpha*=sstep(0,.1,k)*(1-sstep(.85,1,k));if(u>.85){ring0(V0,[Math.cos(a)*r,Math.sin(a)*r,0],(u-.85)*40,K.fire,1-(u-.85)/.15,1.6)}else{ctx.fillStyle=`rgba(${K.fireHot},.9)`;ball(q,2.2);ctx.fill();ctx.strokeStyle=`rgba(${K.fire},.5)`;ctx.lineWidth=2;seg(q,[q[0],q[1]-8]);ctx.stroke();
      ctx.fillStyle=`rgba(0,0,0,${.15*u})`;ctx.beginPath();ctx.ellipse(g[0],g[1],3,1.4,0,0,TAU);ctx.fill()}ctx.restore()}})}
  if(A.ruff>=0&&fx){const k=A.ruff;L.add(999,()=>{for(let i=0;i<3;i++){const c=[-4-k*10,(i-1)*14,46+k*14-k*k*20],d=nrm([Math.cos(i+k*5),Math.sin(i+k*5),.3]);ctx.save();ctx.globalAlpha*=1-k;leaf(V0,c,d,nrm(cross(d,[0,0,1])),8,2.6,K.f1,{lw:1.4});ctx.restore()}})}
  run(L);
  if(A.glowK>0&&!LOWFX){const q=P(X.T([0,0,48]));ctx.save();ctx.globalCompositeOperation='lighter';shine(K.fire,q[0],q[1],56,.3*A.glowK,40);ctx.restore()}
  if(A.stars>0)bstars(P(X.T([XHC[0],0,XHC[2]+22])),17,A.stars);
  ctx.restore()}
reg('phoenix',{n:'La Fenice della Forgia',g:'boss3',sc:1,an:['idle','walk','prep','feathers','dive','vortex','rain','rebirth','hit','enter','die'],
  dur:{idle:2.4,walk:.9,prep:1,feathers:1.2,dive:1.8,vortex:1.6,rain:2.4,rebirth:3,hit:.6,enter:2.6,die:3.6},
  lab:{idle:'Fermo',walk:'Vola',prep:'Prepara',feathers:'Piume di fuoco',dive:'Picchiata',vortex:'Vortice',rain:'Pioggia di braci',rebirth:'Rinascita',hit:'Colpita',enter:'Entrata',die:'Sconfitta'}},phoenix);

// ------------------------------------------------------------------ LA PIOVRA DELLA PALUDE (octopus)
// a big round teal octopus sitting in the swamp water: a tall soft mantle with light spots and a lily pad on top (with its pink flower),
// big white eyes with golden irises under heavy lids, rosy cheeks, a small round mouth; six tentacles rise from the water round it,
// curling at the tips, pink suckers on their inner side. Phase 2 (o.p2): a purple mantle with glowing magenta spots, red irises.
// o.noWater: no pool drawn under it (the game's arena has its own water; the ripples stay)
const OC0={body:'#2fae9e',spot:'#86e6d2',suck:'#f5a6c4',pad:'#5fae4a',padD:'#3f7a2a',petal:'#ff9ad8',petalD:'#e05aa8',heart:'#ffd84a',iris:'#ffc83c',cheek:'255,130,150',
  water:'#1f4a4a',waterRgb:'60,140,130',ink:'#3a2050',inkRgb:'58,32,80',glowRgb:'134,230,210'},
  OC2=Object.assign({},OC0,{body:'#7a3aa8',spot:'#ff7ae0',suck:'#ffb0d8',iris:'#ff5a5a',glowRgb:'255,122,224'});
const OMC=[0,0,41],OMR=[21,24,25.5],OLC=[4,0,15],OLR=[17,20,11];
// the six tentacles: angle round the body (0 = in front), how far out the base is, the rest curl
const OTN=[[.55,1],[-.55,-1],[1.5,1],[-1.5,-1],[2.45,1],[-2.45,-1]];
function ocPose(anim,p,o){const ph=p*TAU,A={B:[0,0,0],lean:-.06,roll:0,yaw:0,s:0,sx:0,T:OTN.map((t,i)=>({lift:0,curl:.9,sway:.15*Math.sin(ph+i*1.3),len:1,reach:0,spin:0})),
  blink:1,squint:0,shut:0,lid:.25,mouth:0,cheek:0,pale:0,sinkW:0,ink:-1,inkCloud:-1,splash:-1,splashAt:null,whirl:-1,bub:-1,wave:-1,hello:-1,stars:0,glowK:0,pad:1,flower:1};
  const each=f=>A.T.forEach((T,i)=>f(T,i,OTN[i]));
  if(anim==='walk'){// swims: lower in the water, leaning forward, the tentacles beating together behind it (a pulse)
    const pu=Math.sin(ph);A.B=[2*pu,0,-7+1.5*Math.cos(ph)];A.lean=.22;A.s=.05*pu;each((T,i,n)=>{T.curl=.5-.35*pu;T.lift=-3-3*pu;T.sway=.25*Math.sin(ph+i);T.len=.95});A.wave=p}
  else if(anim==='prep'){// rises out of the water, the tentacles lift high and spread, the eyes narrow, a glow gathers (a held loop)
    const k=sstep(0,.25,p)*(1-sstep(.9,1,p));A.B=[0,0,8*k];A.lean=-.12*k;A.lid=lerp(.25,.5,k);A.squint=.4*k;A.glowK=k;each((T,i)=>{T.lift=16*k;T.curl=lerp(.9,.35,k);T.sway=.15*Math.sin(ph*3+i)});A.B[1]+=.6*trem(p,.25,.9,7,.9)*k}
  else if(anim==='slam'){// .0-.35 the front right tentacle rises high and coils, .35-.48 slams down far in front (a splash), .48-1 drawn back
    const K=[[0,[0,.9,0]],[.3,[58,-1.2,0]],[.38,[64,-1.4,0]],[.48,[0,0,1]],[.62,[0,0,1]],[.85,[0,.6,.3]],[1,[0,.9,0]]],v=keys(K,p);const T=A.T[0];T.lift=v[0];T.curl=v[1];T.reach=v[2];T.len=1+.7*v[2]+.25*sstep(.1,.35,p)*(1-v[2]);T.ang=.55-.5*sstep(.15,.42,p)*(1-sstep(.7,.95,p));
    A.lean=-.1+.2*v[2];A.lid=p>.3&&p<.6?.45:.25;A.mouth=p>.36&&p<.55?.6:0;A.splash=p>=.47&&p<.85?(p-.47)/.38:-1;A.splashAt=[66,10,0]}
  else if(anim==='ink'){// .0-.3 puffs up (cheeks full), .3-.45 spits three blobs of ink in an arc, .45-1 shrinks back
    const K=[[0,[0,0,0]],[.28,[.16,1,0]],[.34,[.18,1,0]],[.42,[-.08,0,1]],[.55,[-.05,0,.6]],[1,[0,0,0]]],v=keys(K,p);A.s=v[0];A.sx=v[0]*.6;A.cheek=v[1];A.mouth=v[2];A.ink=p>=.38&&p<.95?(p-.38)/.57:-1;
    A.lean=-.12*v[1]+.15*v[2];each((T,i)=>{T.curl=.9+.3*v[1]})}
  else if(anim==='whirl'){// spins with every tentacle stretched out flat: a whirlpool turns round it
    const k=sstep(0,.15,p)*(1-sstep(.85,1,p));A.yaw=TAU*1.5*ez(p);A.B=[0,0,-3*k];each((T,i)=>{T.curl=lerp(.9,-.25,k);T.lift=-6*k;T.len=1+.25*k;T.sway=-.5*k});A.whirl=p;A.squint=.5*k}
  else if(anim==='dive'){// .0-.32 sinks under the water (bubbles), .32-.66 only the bubbles and the lily pad, .66-1 bursts out with a splash
    const dn=sstep(0,.32,p),up=sstep(.66,.84,p);A.sinkW=dn*(1-up);A.B=[0,0,-78*ez(A.sinkW)];A.bub=p;A.splash=p>=.7&&p<.98?(p-.7)/.28:-1;A.splashAt=[0,0,0];
    each((T,i)=>{T.curl=lerp(.9,1.6,A.sinkW);T.lift=-10*A.sinkW});A.shut=A.sinkW>.5?1:0}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.06-.28*kb;A.B=[-4*kb,0,2*kb];A.s=-.08*kb;A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;each((T,i)=>{T.curl=.9+.6*kb;T.lift=8*kb})}
  else if(anim==='enter'){// comes up from the water: bubbles, the lily pad first, then the eyes, then the whole of it with the tentacles
    // splashing; then it waves hello with two tentacles and puts on its grumpy face
    const up=sstep(.15,.55,p);A.sinkW=1-up;A.B=[0,0,-78*ez(A.sinkW)];A.bub=p<.5?p*.6:-1;A.splash=p>=.45&&p<.8?(p-.45)/.35:-1;A.splashAt=[0,0,0];
    const hk=bump(cl((p-.6)/.36,0,1));A.hello=hk;A.T[0].lift=30*hk;A.T[0].curl=.9+.6*Math.sin((p-.6)*30)*hk;A.T[1].lift=30*hk;A.T[1].curl=.9-.6*Math.sin((p-.6)*30)*hk;A.lid=p>.9?.4:.1;A.mouth=hk>.3?.4:0}
  else if(anim==='die'){// .0-.2 shakes and goes pale, .15-.6 the tentacles curl up like springs and it spins slowly down into the water,
    // .55-.8 a cloud of ink blooms on the water, .8-1 it clears: only the lily pad floats there, with its flower
    A.pale=sstep(0,.25,p);A.shut=p>.08?1:0;A.B=[.8*trem(p,0,.2,8,3.6),0,-80*ez(sstep(.25,.68,p))];A.yaw=1.4*ez(sstep(.2,.7,p));A.sinkW=sstep(.25,.68,p);
    each((T,i)=>{T.curl=lerp(.9,2.6,sstep(.12,.5,p));T.lift=-6*sstep(.12,.5,p)});A.inkCloud=p>=.52&&p<1?(p-.52)/.48:-1;A.bub=p>.25&&p<.8?p:-1;A.padFloat=sstep(.55,.7,p)}
  else{// idle: bobs in the water, the tentacles wave slowly one after another, it blinks and looks round, the flower sways
    A.B=[0,0,1.6*Math.sin(ph)];A.s=.025*Math.sin(ph+.6);A.yaw=.12*Math.sin(ph);A.blink=blink(p,.58,.08);each((T,i)=>{T.curl=.9+.25*Math.sin(ph+i*1.1);T.lift=2*Math.sin(ph+i*.9);T.sway=.25*Math.sin(ph+i*1.7)})}
  return A}
// a tentacle from its base b (3D) going up and outward along `out`, curling over toward the outside (curl, in half turns), swaying
// sideways; returns its points and radii (the suckers on its inner side face the centre of the curl)
function ocArm(b,out,len,curl,lift,sway,reach){const up=[0,0,1],side=nrm(cross(up,out)),N=9,pts=[],rs=[],ins=[];let u=0,z=0,th=lerp(1.25,.06,reach);const ds=len/N;
  for(let i=0;i<=N;i++){const k=i/N;pts.push(add(b,add(add(mul(out,u),mul(up,z)),mul(side,sway*Math.sin(k*Math.PI)*k*len*.35))));rs.push(lerp(8.2,1.8,Math.pow(k,.85)));
    ins.push(nrm(add(mul(out,-Math.sin(th)),mul(up,Math.cos(th)))));th-=curl*Math.PI/N*Math.pow(k+.15,1.1)*1.05;u+=Math.cos(th)*ds;z=Math.max(-2,z+Math.sin(th)*ds+lift/N*1.3*(1-k))}
  return{pts,rs,ins}}
function octopus(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const A=ocPose(anim,p,o),K0=o.p2?OC2:OC0,V0=V(face),{P,D,F}=V0,ph=p*TAU,fx=fxOn(o);
  const K=A.pale>0?Object.assign({},K0,{body:C.cmix(K0.body,'#d8e8e4',A.pale*.7),spot:C.cmix(K0.spot,'#ffffff',A.pale*.6)}):K0;
  const lift=o.z!=null?o.z/sc:0;A.B[2]+=lift;const X=frame(A,OLC[2]-OLR[2]),dB=D(OMC);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),W0=[0,0,0];
  // the pool and its ripples (behind everything), the whirlpool, the ink cloud
  L.add(-999,()=>{if(!o.noWater){pool0(V0,W0,52,48,K.water);ctx.save();ctx.strokeStyle=`rgba(${K.waterRgb},.6)`;ctx.lineWidth=2;const e=[];for(let i=0;i<28;i++){const t=i/28*TAU;e.push(P(Math.cos(t)*52,Math.sin(t)*48,0))}poly(e);ctx.stroke();ctx.restore()}
    for(let i=0;i<3;i++){const k=(p*2+i/3)%1;ring0(V0,[A.B[0],A.B[1],0],22+k*22,'200,240,230',.35*(1-k),1.4)}
    if(A.whirl>=0&&fx){const k=sstep(0,.15,A.whirl)*(1-sstep(.85,1,A.whirl));ctx.save();ctx.strokeStyle=`rgba(200,240,230,${.55*k})`;ctx.lineWidth=2;for(let a=0;a<3;a++){ctx.beginPath();for(let i=0;i<40;i++){const t=i/40*TAU*1.4+a*TAU/3-G.t*3,r=8+i*1.1;const q=P(Math.cos(t)*r,Math.sin(t)*r,0);ctx.lineTo(q[0],q[1])}ctx.stroke()}ctx.restore()}});
  if(A.inkCloud>=0){const k=A.inkCloud;L.add(995,()=>{const a=(k<.5?sstep(0,.2,k):1-sstep(.5,1,k))*.85;for(let i=0;i<7;i++){const t=i/7*TAU+k,r=8+k*28,c=[Math.cos(t)*r*.6,Math.sin(t)*r*.6,0],q=P(c);ctx.fillStyle=`rgba(${K.inkRgb},${a})`;ctx.beginPath();ctx.ellipse(q[0],q[1],10+k*14,(10+k*14)*.55,0,0,TAU);ctx.fill()}})}
  const sunk=A.sinkW>.001;
  // the tentacles
  OTN.forEach(([t0,sd],i)=>{const T=A.T[i],t=T.ang==null?t0:T.ang,out=[Math.cos(t),Math.sin(t),0],b=add([OLC[0]+Math.cos(t)*OLR[0]*.78,Math.sin(t)*OLR[1]*.78,3],A.B),arm=ocArm(b,X.Rd(out),48*T.len,T.curl,T.lift,T.sway,T.reach),fk=sstep(0,-.3,F(X.Rd(out)))*.5;
    const mid=arm.pts[3];L.add(D(mid)+(F(X.Rd(out))>0?0:-8)+(i===0&&(T.reach>.05||T.lift>8)&&anim==='slam'?60:0),()=>{const col=dk(K.body,.18*fk);chain(V0,arm.pts,arm.rs,col,{lw:2.5,kl:.22,kd:.25});
      for(let j=2;j<arm.pts.length-1;j++){const n=arm.ins[j],f=F(n);if(f<.1)continue;spot(V0,add(arm.pts[j],mul(n,arm.rs[j]*.72)),n,arm.rs[j]*.45,K.suck,{lw:.8,v0:.1})}})});
  // the body: the round lower part and the tall mantle, spots, the face (eyes under heavy lids, cheeks, mouth), the lily pad on top
  L.add(dB,()=>{svol(V0,ellPts(OLC,OLR,null,6,18).map(X.T),K.body,{lw:2.8,kl:.2,kd:.3});const core=svol(V0,ellPts(OMC,OMR,null,7,20).map(X.T),K.body,{lw:2.8,kl:.24,kd:.3});
    ctx.save();clipTo(core);for(const[t,e,r] of[[.4,.75,3.6],[-.6,.55,3],[1.2,.3,4],[-1.3,.35,3.4],[2.3,.5,4.2],[-2.2,.7,3.2],[3,.2,3.8],[.1,.98,3]]){const m=dir(t,e),n=X.Rd(ellN(OMR,null,m));
      spot(V0,X.T(ellAt(OMC,OMR,null,m)),n,r,K.spot,{v0:.05});if(o.p2&&!LOWFX&&F(n)>.2){const q=P(X.T(ellAt(OMC,OMR,null,m)));ctx.save();ctx.globalCompositeOperation='lighter';shine(K.glowRgb,q[0],q[1],r*2.4,.3);ctx.restore()}}
    ctx.restore();
    const at=m=>({q:P(X.T(ellAt(OMC,OMR,null,nrm(m)))),v:F(X.Rd(ellN(OMR,null,nrm(m))))}),h=P(X.T(OMC));
    if(!(sunk&&A.sinkW>.7)){
      const E=eyes(null,h,22,{at,dir:[1,.4,-.1],kind:'white',iris:K.iris,col:'#1b1612',rx:7.4,ry:8.6,lw:1.6,blink:A.blink,squint:A.squint,shut:A.shut,a:.6,b:.74});
      // the heavy lids: the body colour over the top of each eye
      if(!A.shut)for(const e of E){if(e.rx<1.2)continue;const q=e.q,lid=A.lid,ry=8.6*Math.max(.12,A.blink),yl=q[1]-ry+2*ry*lid*.8;ctx.save();ctx.beginPath();ctx.ellipse(q[0],q[1],e.rx+.4,ry+.4,0,0,TAU);ctx.clip();ctx.fillStyle=K.body;ctx.fillRect(q[0]-e.rx-2,q[1]-ry-2,2*e.rx+4,yl-(q[1]-ry-2));
        ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(q[0]-e.rx-1,yl);ctx.lineTo(q[0]+e.rx+1,yl);ctx.stroke();ctx.restore()}
      cheeks(null,h,22,null,{at,dir:[1,.66,-.36],rgb:K.cheek,al:.32+.3*A.cheek,rx:4+1.6*A.cheek,ry:2.2+1*A.cheek});
      mouth(null,h,22,[1,0,-.48],{at,kind:A.mouth>.15?'open':'o',open:A.mouth,w:3.6+1.8*A.cheek,h:2,dark:'#4a1a2a',tongue:'#e07a8a'})}
  });
  // the lily pad: a flat round leaf with a notch, on top of the mantle, and its pink flower (it floats on the water when it is defeated)
  {const tm=nrm([-.18,0,1]),tc=X.T(ellAt(OMC,OMR,null,tm)),tn=X.Rd(ellN(OMR,null,tm)),fl=A.padFloat||0;L.add(fl>.01?996:D(tc)+8,()=>{const pc=lerp3(tc,[A.B[0]*0+6,8,1.5],fl),pn=nrm(lerp3(tn,[0,0,1],fl));
    let u=cross(pn,[1,0,0]);if(len(u)<.2)u=cross(pn,[0,1,0]);u=nrm(u);const v=cross(pn,u),pts=[];for(let i=0;i<=26;i++){const t=.32+i/26*(TAU-.64);pts.push(P(add(pc,add(mul(u,Math.cos(t)*14),mul(v,Math.sin(t)*14)))))}pts.push(P(pc));
    ink(2.2);poly(pts);ctx.fillStyle=softBox(bbox(pts),K.pad,.25,.25);ctx.fill();ctx.stroke();ctx.strokeStyle=K.padD;ctx.lineWidth=1;for(let i=1;i<6;i++){const t=.32+i/6*(TAU-.64),q=P(add(pc,add(mul(u,Math.cos(t)*12),mul(v,Math.sin(t)*12))));seg(P(pc),q);ctx.stroke()}
    const fc=add(pc,mul(pn,2.5)),sw=.12*Math.sin(G.t*2);for(let i=0;i<6;i++){const a=i/6*TAU+sw,d=nrm(add(mul(pn,1),add(mul(u,Math.cos(a)*.9),mul(v,Math.sin(a)*.9)))),s=nrm(cross(d,pn));leaf(V0,fc,d,s,8,3.4,i%2?K.petal:K.petalD,{lw:1.5,kl:.35,kd:.15,ell:true})}
    const hq=P(add(fc,mul(pn,2.2)));ink(1.4);ball(hq,2.2);ctx.fillStyle=softBall(hq,2.2,K.heart,.4,.2);ctx.fill();ctx.stroke()})}
  // the ink blobs flying in an arc, the splash, the bubbles, the waved tentacles
  if(A.ink>=0&&fx){const k=A.ink;for(let i=0;i<3;i++){const a=(i-1)*.35,d=20+k*80,c=[OMC[0]+d*Math.cos(a),d*Math.sin(a),30+40*k-60*k*k];L.add(D(c)+20,()=>{if(c[2]<0){const q=P(c[0],c[1],0);ctx.fillStyle=`rgba(${K.inkRgb},.7)`;ctx.beginPath();ctx.ellipse(q[0],q[1],9,5,0,0,TAU);ctx.fill();return}
    const q=P(c);ink(1.8);ball(q,4.6);ctx.fillStyle=softBall(q,4.6,K.ink,.3,.25);ctx.fill();ctx.stroke()})}}
  if(A.splash>=0&&fx){const k=A.splash,c=A.splashAt;L.add(D(c)+15,()=>{for(let i=0;i<9;i++){const a=i/9*TAU,r=6+k*24,z=26*Math.sin(Math.min(1,k*1.2)*Math.PI)*(.6+.4*Math.sin(i*2.1)),q=P(add(c,[Math.cos(a)*r,Math.sin(a)*r,z]));
    ctx.fillStyle=`rgba(210,245,240,${.8*(1-k)})`;ball(q,2.6*(1-k*.5));ctx.fill()}ring0(V0,c,6+k*30,'210,245,240',.7*(1-k),2.5)})}
  if(A.bub>=0&&fx){const k=A.bub;L.add(990,()=>{for(let i=0;i<8;i++){const u=((k*3+i*.13)%1),c=[Math.sin(i*2.7)*16,Math.cos(i*1.9)*14,0],q=P(c);ctx.save();ctx.globalAlpha*=1-u;ctx.strokeStyle='rgba(220,250,245,.9)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(q[0],q[1]-u*6,1.5+u*3,0,TAU);ctx.stroke();ctx.restore()}})}
  // under the water: everything sinking is cut at the waterline and seen through the water
  if(sunk){const L0=L.filter(e=>e.d<-900),L1=L.filter(e=>e.d>=-900&&e.d<990),L2=L.filter(e=>e.d>=990);run(L0);const q0=P(0,0,0),E=[];for(let i=0;i<28;i++){const t=i/28*TAU;E.push(P(Math.cos(t)*50,Math.sin(t)*46,0))}
    let ar=0;for(let i=0;i<E.length;i++){const a=E[i],b=E[(i+1)%E.length];ar+=a[0]*b[1]-b[0]*a[1]}const R4=[[q0[0]-400,q0[1]-600],[q0[0]+400,q0[1]-600],[q0[0]+400,q0[1]],[q0[0]-400,q0[1]]];
    ctx.save();ctx.beginPath();for(const w of(ar>0?R4:R4.slice().reverse()))ctx.lineTo(w[0],w[1]);ctx.closePath();ctx.moveTo(E[0][0],E[0][1]);for(const w of E)ctx.lineTo(w[0],w[1]);ctx.closePath();ctx.clip();run(L1);ctx.restore();
    ctx.save();ctx.globalAlpha*=.55*sstep(0,.3,A.sinkW);pool0(V0,W0,50,46,K.water);ctx.restore();run(L2)}
  else run(L);
  if(A.glowK>0&&!LOWFX){const q=P(X.T(OMC));ctx.save();ctx.globalCompositeOperation='lighter';shine(K.glowRgb,q[0],q[1],50,.3*A.glowK,34);ctx.restore()}
  if(A.stars>0)bstars(P(X.T([0,0,OMC[2]+OMR[2]+14])),18,A.stars);
  ctx.restore()}
reg('octopus',{n:'La Piovra della Palude',g:'boss3',sc:1,an:['idle','walk','prep','slam','ink','whirl','dive','hit','enter','die'],
  dur:{idle:2.8,walk:1.2,prep:1,slam:1.4,ink:1.3,whirl:1.8,dive:2.4,hit:.6,enter:3,die:3.6},
  lab:{idle:'Ferma',walk:'Nuota',prep:'Prepara',slam:'Tentacolata',ink:'Inchiostro',whirl:'Gorgo',dive:'Immersione',hit:'Colpita',enter:'Entrata',die:'Sconfitta'}},octopus);

// ------------------------------------------------------------------ IL CERVO D'AURORA (stag), Vetta di Mossbound, l'ultimo boss
// a big snow-white stag with patches of moss on its back and a mane of moss along its neck, little white flowers in the moss, big kind
// eyes with teal irises, a dark nose, leaf-shaped ears; on its head great antlers of ice crystal that glow with the colours of the aurora;
// slim legs with blue-grey hooves, a tuft of moss for a tail. Phase 2 (o.p2): the antlers blaze, the moss glows and is full of flowers
const ST={body:'#eef5f7',belly:'#ffffff',moss:'#5fae4a',mossD:'#3f7a2a',mossL:'#9fdc6a',flower:'#ffffff',flower2:'#ffc0dc',hoof:'#4a5a7a',nose:'#2e3a4a',
  ice:'#bff0ff',iceD:'#7fc8e8',iceRgb:'160,235,255',aur:['110,255,190','120,200,255','190,140,255'],iris:'#2fc8b0',ear:'#e0ecf0',earIn:'#ffc8d8'},
  ST2=Object.assign({},ST,{ice:'#e8fff6',iceD:'#8ff0d0',iceRgb:'170,255,220',moss:'#6cc44e',mossL:'#c8ff8a',iris:'#b38cff'});
const STC=[0,0,40],STR=[24,15,16.5],SCH=[13,0,43],SCHR=[13,14.5,16.5],SRU=[-16,0,42],SRUR=[12,14.5,15.5];
const SHC=[31,0,74],SHR=[13,11,11.5],SSN=[42,0,69.5],SSNR=[8.5,7,7],SNK=[17,0,50];
// the legs: hip or shoulder (body space), the foot at rest, the two bones, where the middle joint goes
const SLEG=[{h:[14,-7.5,34],f:[15,-8.5,0],L:[18,17],pole:[1,0,-.15]},{h:[14,7.5,34],f:[15,8.5,0],L:[18,17],pole:[1,0,-.15]},
  {h:[-17,-7.5,36],f:[-18,-8.5,0],L:[19,18],pole:[-1,0,-.15]},{h:[-17,7.5,36],f:[-18,8.5,0],L:[19,18],pole:[-1,0,-.15]}];
function sgPose(anim,p,o){const ph=p*TAU,A={B:[0,0,0],lean:0,roll:0,yaw:0,s:0,sx:0,hd:[0,0,0],hy:0,hp:0,feet:SLEG.map(l=>l.f.slice()),hips:[0,0,0,0],
  blink:1,squint:0,shut:0,mouth:0,ear:0,tail:0,antK:1,aurK:0,glowK:0,crack:-1,bloom:0,fadeK:1,aurora:-1,shards:-1,spikes:-1,dustAt:null,dust:-1,breath:-1,stars:0,rise:-1};
  const leg=(i,dx,dz)=>{A.feet[i][0]+=dx;A.feet[i][2]+=dz};
  if(anim==='walk'){// a light trot: the diagonal pairs move together, the body bobs twice per cycle, the head nods a little
    const st=stepper(p,.5);[[0,0],[1,.5],[2,.5],[3,0]].forEach(([i,ofs])=>{const a=st(ofs,8,7);leg(i,a.x,a.z)});A.B[2]=-1.2*Math.cos(ph*2);A.hp=.05*Math.cos(ph*2);A.roll=.03*Math.sin(ph);A.tail=.4*Math.sin(ph*2)}
  else if(anim==='prep'){// lowers its head with the antlers forward and paws the ground with a front hoof, snorting (a held loop)
    const k=sstep(0,.25,p)*(1-sstep(.9,1,p)),pw=Math.max(0,Math.sin(ph*2));A.hp=.5*k;A.hd=[4*k,0,-10*k];A.lean=.06*k;leg(1,-6*pw*k,6*pw*k);A.squint=.5*k;A.glowK=k;A.aurK=.5*k;A.breath=k>.5?(p*2)%1:-1;A.B[2]=-2*k;A.dust=pw>.8&&k>.5?(p*4)%1:-1;A.dustAt='hoof'}
  else if(anim==='charge'){// gallops with its head down and the antlers forward (a looping bound)
    const g=p,ext=Math.sin(g*TAU);A.hp=.55;A.hd=[6,0,-12];A.lean=.1*ext;A.B[2]=4*Math.max(0,Math.sin(g*TAU))-1;
    leg(0,10*ext,6*Math.max(0,-ext));leg(1,10*Math.sin(g*TAU+.4),6*Math.max(0,-Math.sin(g*TAU+.4)));leg(2,-10*ext,6*Math.max(0,ext));leg(3,-10*Math.sin(g*TAU+.4),6*Math.max(0,Math.sin(g*TAU+.4)));
    A.tail=.6;A.aurK=.6;A.dust=(p*2)%1;A.dustAt='feet';A.squint=.4}
  else if(anim==='crystals'){// .0-.3 throws its head back, .3-.45 swings the antlers forward and down (a fan of crystal shards flies), .45-1 back
    const K=[[0,[0,0,0]],[.28,[-.5,-.14,0]],[.34,[-.55,-.15,0]],[.44,[.6,.12,1]],[.56,[.5,.1,1]],[.8,[.1,.02,.2]],[1,[0,0,0]]],v=keys(K,p);A.hp=v[0];A.lean=v[1];A.hd=[0,0,v[0]*6];A.aurK=.4+.6*v[2];A.shards=p>=.42&&p<.95?(p-.42)/.53:-1;A.mouth=v[2]*.6}
  else if(anim==='aurora'){// raises its head high (the antlers blaze), curtains of aurora rise and sway over it, then lowers it
    const k=sstep(0,.25,p)*(1-sstep(.85,1,p));A.hp=-.45*k;A.hd=[-2*k,0,6*k];A.lean=-.08*k;A.aurK=1;A.glowK=k;A.aurora=p;A.mouth=.5*k;A.squint=.3*k}
  else if(anim==='stomp'){// .0-.35 rears up on its hind legs, .35-.45 brings the front hooves down hard (a ring of ice spikes), .45-1 recovers
    const K=[[0,[0,0]],[.3,[-.55,1]],[.36,[-.6,1]],[.45,[.08,0]],[.55,[.05,0]],[1,[0,0]]],v=keys(K,p);A.lean=v[0];A.B[2]=10*v[1];A.hp=-.25*v[1];
    for(const i of[0,1]){A.feet[i][2]+=30*v[1];A.feet[i][0]+=8*v[1]}A.spikes=p>=.44&&p<.95?(p-.44)/.51:-1;A.dust=p>=.44&&p<.7?(p-.44)/.26:-1;A.dustAt='front';A.mouth=p>.3&&p<.5?.6:0}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.12*kb;A.B=[-4*kb,0,1.5*kb];A.hp=-.3*kb;A.hd=[-3*kb,0,2*kb];A.shut=p<.5?1:0;A.stars=p<.75?1-p/.75:0;A.ear=-.6*kb}
  else if(anim==='enter'){// leaps down from above, lands with its legs folding under it, then lifts its head proudly while the antlers light up
    // one point after another
    const dn=1-ez(cl(p/.4,0,1)),land=p>.38&&p<.6?Math.sin((p-.38)/.22*Math.PI):0;A.B=[-30*dn,0,120*dn-5*land];A.lean=p<.4?-.1:.1*land;
    for(const i of[0,1,2,3]){A.feet[i][2]+=p<.4?12:0;A.feet[i][0]+=p<.4?(i<2?6:-6):0}A.hp=lerp(.2,-.35,sstep(.6,.8,p))*(p>.55?1:0)+(p<.55?.2:0);A.antK=sstep(.6,.9,p);A.aurK=sstep(.6,.9,p);A.mouth=p>.75&&p<.95?.7:0;A.dust=p>=.4&&p<.65?(p-.4)/.25:-1;A.dustAt='feet'}
  else if(anim==='die'){// .0-.2 staggers, .15-.4 kneels on its front legs, .35-.55 lies down, the head sinks; .45-.75 the antlers crack and
    // crumble into snow, .55-.85 flowers bloom over its moss, .7-1 it turns into the light of the aurora and rises, leaving a mound of moss
    // with one glowing flower
    const kn=sstep(.15,.4,p),ly=sstep(.35,.55,p);A.roll=.06*trem(p,0,.2,6,3.6);A.lean=.25*kn-.25*ly;A.B[2]=-14*kn-8*ly;for(const i of[0,1]){A.feet[i][0]+=12*kn;A.feet[i][2]+=0}for(const i of[2,3])A.feet[i][0]-=10*ly;
    A.hp=.5*kn+.3*ly;A.hd=[4*ly,0,-10*ly];A.shut=p>.2?1:0;A.crack=p>=.45?Math.min(1,(p-.45)/.3):-1;A.antK=1-sstep(.5,.75,p);A.bloom=sstep(.55,.85,p);A.fadeK=1-sstep(.72,.95,p);A.rise=p>=.7?(p-.7)/.3:-1;A.aurK=1-sstep(.2,.4,p)+sstep(.7,.85,p)}
  else{// idle: breathes, looks round, flicks its ears and its tail, blinks; the antlers twinkle
    const b=Math.sin(ph);A.s=.02*b;A.hy=look(p,.45);A.hp=.06*Math.sin(ph+1);A.blink=blink(p,.62,.07);A.ear=.3*Math.max(0,Math.sin(ph*2-.5))*(p>.4&&p<.6?1:0);A.tail=.3*Math.sin(ph*3)*(p>.7?1:0)}
  return A}
// a crystal: an elongated diamond from a to the tip direction d (length l, width w), lit along one side
function crystal(V0,a,d,l,w,col,colD){const{P}=V0;d=nrm(d);let s=cross(d,[0,0,1]);if(len(s)<.2)s=cross(d,[0,1,0]);s=nrm(s);const t=cross(d,s);
  const tip=add(a,mul(d,l)),m=add(a,mul(d,l*.42)),pts=[a,add(m,mul(s,w)),add(m,mul(t,w*.8)),add(m,mul(s,-w)),add(m,mul(t,-w*.8)),tip].map(q=>P(q)),h=C.chull(pts);
  ink(1.6);poly(h);ctx.fillStyle=softBox(bbox(h),col,.45,.15);ctx.fill();ctx.stroke();const q1=P(a),q2=P(tip),q3=P(add(m,mul(s,w*.6)));ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(q1[0],q1[1]);ctx.lineTo(q3[0],q3[1]);ctx.lineTo(q2[0],q2[1]);ctx.stroke();return h}
function stag(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};const K=o.p2?ST2:ST,V0=V(face),{P,D,F}=V0,A=sgPose(anim,p,o),ph=p*TAU,fx=fxOn(o);
  const lift=o.z!=null?o.z/sc:0;A.B[2]+=lift;const X=frame(A,0),dB=D(STC);
  floor(V0,x,y,sc,[A.B[0],A.B[1],0],34,13,.36*(A.rise>=0?1-A.rise*.6:1),A.B[2]+lift);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  // the floor effects: the ring of ice spikes, the dust
  if(A.spikes>=0&&fx){const k=A.spikes;for(let i=0;i<12;i++){const t=i/12*TAU,r=22+k*34,c=[20+Math.cos(t)*r,Math.sin(t)*r,0],h=14*Math.sin(Math.min(1,k*2.2)*Math.PI*.5)*(1-sstep(.7,1,k));
    L.add(D(c)-200,()=>{if(h<.5)return;crystal(V0,c,[Math.cos(t)*.25,Math.sin(t)*.25,1],h,2.6,K.ice,K.iceD)})}L.add(-999,()=>ring0(V0,[20,0,0],22+k*34,K.iceRgb,.6*(1-k),3))}
  if(A.dust>=0&&fx){const k=A.dust;L.add(-998,()=>{if(A.dustAt==='hoof')dust(V0,add(A.feet[1],A.B),k,5,6,'235,244,255');else if(A.dustAt==='front')for(const i of[0,1])dust(V0,add(A.feet[i],A.B),k,6,10,'235,244,255');else for(const i of[0,1,2,3])dust(V0,add(A.feet[i],[A.B[0],A.B[1],0]),k,4,7,'235,244,255')})}
  const stagDraw=()=>{const LS=parts();
    // the legs: two bones each (the far ones darker and behind the body), the hooves
    SLEG.forEach((lg,i)=>{const sd=lg.h[1]>0?1:-1,hip=X.T(lg.h),ft=add(A.feet[i],[A.B[0],A.B[1],A.B[2]>4&&anim!=='stomp'&&anim!=='enter'?0:Math.max(0,A.B[2]*0)]),fk=sstep(0,-.15,F(0,sd,0))*.5;
      const target=add(ft,[0,0,4]),[kn,tg]=C.ik(hip,target,lg.L[0],lg.L[1],X.Rd(lg.pole)),far=F(0,sd,0)<0;
      LS.add(dB+(far?-30:30)+(i<2?2:0),()=>{const col=dk(K.body,.2*fk);chain(V0,[hip,kn,tg],[7.4,4.6,3.8],col,{lw:2.5,kl:.25,kd:.25});
        const hv=add(tg,[0,0,-1.5]);svol(V0,ellPts(hv,[5,4,3.6],null,4,10),dk(K.hoof,.15*fk),{lw:2,kl:.25,kd:.25})})});
    // the tail: a tuft of moss
    {const tb=X.T([-27,0,48]),d=X.Rd(nrm([-1,0,.6+.4*A.tail]));LS.add(dB-5,()=>{for(let j=-1;j<=1;j++)leaf(V0,tb,nrm(add(d,X.Rd([0,j*.4,0]))),X.Rd([0,1,0]),9,3.4,j?K.mossD:K.moss,{lw:1.8,kl:.25,kd:.25})})}
    // the body: one soft volume (chest, barrel, rump), the white belly, patches of moss with flowers
    LS.add(dB,()=>{const pts=[...ellPts(STC,STR,null,6,16),...ellPts(SCH,SCHR,null,6,16),...ellPts(SRU,SRUR,null,6,16)].map(X.T),core=svol(V0,pts,K.body,{lw:2.8,kl:.25,kd:.28});
      ctx.save();clipTo(core);for(const[t,e,al,av] of[[0,1.15,.55,.42],[2.8,.95,.5,.4],[1.6,.85,.36,.3],[-1.6,.85,.36,.3]]){const m=dir(t,e);if(ellCap(V0,X,STC,STR,null,m,al,30,{alv:av,u:[1,0,0],rf:tt=>1+.12*Math.sin(tt*7+t*3)})){
        const q=P(X.T(ellAt(STC,STR,null,m)));ctx.fillStyle=soft(q[0]-6,q[1]-6,q[0],q[1],24,K.moss,.25,.3);ctx.fill();ctx.strokeStyle=K.mossD;ctx.lineWidth=1.4;ctx.stroke()}}
      const nF=6+Math.round(10*A.bloom);for(let i=0;i<nF;i++){const m=dir(i*2.4,.7+.4*Math.sin(i*1.3)),n=X.Rd(ellN(STR,null,m)),f=F(n);if(f<.2)continue;const q=P(X.T(ellAt(STC,STR,null,m))),r=1.4+.9*A.bloom*(i%3===0?1:.6);
        ctx.fillStyle=i%2?K.flower:K.flower2;for(let j=0;j<5;j++){const a=j/5*TAU;ball([q[0]+Math.cos(a)*r*.8,q[1]+Math.sin(a)*r*.6],r*.55);ctx.fill()}ctx.fillStyle='#ffd84a';ball(q,r*.4);ctx.fill()}
      if(o.p2&&!LOWFX){const q=P(X.T([0,0,58]));ctx.globalCompositeOperation='lighter';shine('150,255,150',q[0],q[1],30,.15+.05*Math.sin(G.t*4),12)}ctx.restore()});
    // the neck with its mane of moss, the head (turning on its own), the ears, the eyes, the nose, the antlers
    const Hc=X.T(add(SHC,A.hd)),hy=A.yaw+A.hy+cheat(face,.3),hp=A.hp,HR=v=>X.Rd(rotZ(rotY(v,hp),hy)),Xh={T:q=>add(Hc,HR(sub(q,SHC))),Rd:HR},nb=X.T(SNK);
    const neck=[nb,lerp3(nb,Xh.T([SHC[0]-6,0,SHC[2]-5]),.5),Xh.T([SHC[0]-6,0,SHC[2]-4])];
    LS.add(dB+6,()=>{chain(V0,neck,[11,9.5,8.5],K.body,{lw:2.6,kl:.25,kd:.25});for(let j=0;j<6;j++){const c=lerp3(neck[0],neck[2],j/5),q=add(c,X.Rd([-4,0,6-j*.3])),d=X.Rd(nrm([-.75,Math.sin(j*1.7)*.25,1])),sd2=X.Rd([0,1,0]);leaf(V0,q,d,sd2,9.5-j*.5,4.6,j%2?K.mossD:K.moss,{back:K.mossD,lw:1.8,kl:.3,kd:.2,bend:-.4});leaf(V0,add(q,mul(d,2)),d,sd2,5.5,2.4,K.mossL,{lw:1.2,kl:.3,kd:.15,bend:-.3})}});
    const antler=sd=>{if(A.antK<=.02)return;const b=Xh.T([SHC[0]-3,sd*5.5,SHC[2]+8.5]),T=v=>Xh.T(add([SHC[0],0,SHC[2]],[v[0],sd*v[1],v[2]])),ak=A.antK,cr=A.crack;
      const beam=[b,T([-6,10,17]),T([-10,16,27]),T([-15,19,37])].map((q,i)=>i?lerp3(b,q,ak):q),tines=[[1,T([2,15,25])],[2,T([-6,24,35])],[3,T([-20,25,45])],[3,T([-12,16,46])]];
      const col=K.ice,glw=K.aur[(sd>0?1:0)];if(A.aurK>0&&!LOWFX){const q=P(beam[3]);ctx.save();ctx.globalCompositeOperation='lighter';shine(glw,q[0],q[1],22,.3*A.aurK*(1+.3*Math.sin(G.t*3+sd)),16);ctx.restore()}
      chain(V0,beam,[4.3,3.7,3.1,2.5],col,{lw:2.3,kl:.4,kd:.15});for(const[j,tp] of tines){const e=lerp3(beam[j],tp,ak);chain(V0,[beam[j],e],[3,2],col,{lw:2.1,kl:.4,kd:.15});
        if(ak>.6)crystal(V0,e,sub(e,beam[j]),7*sstep(.6,1,ak),2.8,col,K.iceD)}
      if(ak>.6)crystal(V0,beam[3],sub(beam[3],beam[2]),9*sstep(.6,1,ak),3.2,col,K.iceD);
      if(cr>=0&&cr<1){const q=P(beam[2]);ctx.strokeStyle='rgba(30,60,90,.8)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(q[0]-3,q[1]-4);ctx.lineTo(q[0]+1,q[1]);ctx.lineTo(q[0]-1,q[1]+3);ctx.stroke()}};
    const antFar=sd=>F(HR([0,sd,0]))<0;
    LS.add(D(Hc),()=>{for(const sd of[-1,1])if(antFar(sd))antler(sd);
      for(const sd of[-1,1])if(antFar(sd)){const e=Xh.T([SHC[0]-4,sd*9.5,SHC[2]+5]);leaf(V0,e,HR(nrm([-.3,sd*1,.5+.4*A.ear])),HR([1,0,0]),12,5.2,K.ear,{back:K.earIn,lw:2,kl:.25,kd:.2})}
      const hp1=svol(V0,[...ellPts(SHC,SHR,null,6,14),...ellPts(SSN,SSNR,null,5,12)].map(Xh.T),K.body,{lw:2.6,kl:.25,kd:.25});
      const at=m=>({q:P(Xh.T(ellAt(SHC,SHR,null,nrm(m)))),v:F(HR(ellN(SHR,null,nrm(m))))}),h=P(Xh.T(SHC));ctx.save();clipTo(hp1);
      const E=eyes(null,h,12,{at,dir:[.8,.6,.3],kind:'white',iris:K.iris,col:'#1b1612',rx:4.5,ry:5.3,lw:1.4,blink:A.blink,squint:A.squint,shut:A.shut,a:.62,b:.8});
      if(!LOWFX&&!A.shut&&A.glowK>0)for(const e of E)if(e.rx>1)shine('110,255,200',e.q[0],e.q[1],7,.4*A.glowK);
      ctx.restore();
      const ns=Xh.T([SSN[0]+SSNR[0]-1,0,SSN[2]+.5]);if(F(HR([1,0,0]))>-.4){const q=P(ns);ink(1.6);ctx.beginPath();ctx.ellipse(q[0],q[1],3,2.2,0,0,TAU);ctx.fillStyle='#2e3a4a';ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.6)';ball([q[0]-1,q[1]-.8],.6);ctx.fill()}
      const mm=Xh.T([SSN[0]+3,0,SSN[2]-4.2]);if(F(HR([1,0,-.6]))>0){const q=P(mm);if(A.mouth>.1){ink(1.2);ctx.fillStyle='#5a2a3a';ctx.beginPath();ctx.ellipse(q[0],q[1]+1,3,1.2+2*A.mouth,0,0,TAU);ctx.fill();ctx.stroke()}else{ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(q[0]-3,q[1]);ctx.quadraticCurveTo(q[0],q[1]+1.6,q[0]+3,q[1]);ctx.stroke()}}
      for(const sd of[-1,1])if(!antFar(sd)){const e=Xh.T([SHC[0]-4,sd*9.5,SHC[2]+5]);leaf(V0,e,HR(nrm([-.3,sd*1,.5+.4*A.ear])),HR([1,0,0]),12,5.2,K.ear,{back:K.earIn,lw:2,kl:.25,kd:.2})}
      for(const sd of[-1,1])if(!antFar(sd))antler(sd)});
    run(LS);
    if(A.breath>=0&&fx){const k=A.breath,c=Xh.T([SSN[0]+SSNR[0]+2,0,SSN[2]-1]);for(let i=0;i<4;i++){const u=((k+i/4)%1),q=P(add(c,HR([u*14,(i-1.5)*2,-u*4])));ctx.fillStyle=`rgba(235,246,255,${.55*(1-u)})`;ball(q,2+u*5);ctx.fill()}}};
  // the stag (fading into the light when it is defeated), the mound of moss with one flower that stays
  if(A.fadeK>0)L.add(dB,()=>{if(A.fadeK>=.99)stagDraw();else fadeDraw(stagDraw,P(X.T([10,0,50])),95,A.fadeK)});
  if(A.rise>=0){const k=A.rise;L.add(dB-1,()=>{const c=[4,0,0],pts=[];for(let i=0;i<20;i++){const t=i/20*TAU;pts.push(P(add(c,[Math.cos(t)*30,Math.sin(t)*14,0])))}
    const top=P(add(c,[0,0,10*sstep(0,.4,k)]));ctx.save();ctx.globalAlpha*=sstep(0,.35,k);ink(2.4);ctx.beginPath();for(const q of pts)ctx.lineTo(q[0],q[1]-Math.max(0,(q[1]-top[1])*.0));ctx.closePath();
    svol(V0,ellPts(add(c,[0,0,2]),[28,13,9*sstep(0,.4,k)+.5],null,4,16),K.moss,{lw:2.4,kl:.25,kd:.3});const fq=P(add(c,[2,0,10*sstep(0,.4,k)+2]));
    for(let j=0;j<5;j++){const a=j/5*TAU+.3;ctx.fillStyle=K.flower;ball([fq[0]+Math.cos(a)*2.4,fq[1]+Math.sin(a)*1.8],1.8);ctx.fill()}ctx.fillStyle='#ffd84a';ball(fq,1.2);ctx.fill();
    if(!LOWFX){ctx.globalCompositeOperation='lighter';shine('170,255,220',fq[0],fq[1],12,.5*sstep(.4,1,k))}ctx.restore()})}
  // the curtains of the aurora (the attack, and the light rising when it is defeated), the crystal shards
  const aurora=(k,base,h,a)=>{if(LOWFX)return;const q=P(base);ctx.save();ctx.globalCompositeOperation='lighter';for(let b=0;b<3;b++){const rgb=K.aur[b];ctx.beginPath();
    const mid=u=>q[1]-h*.66-b*10+Math.sin(u*6+G.t*1.8+b*1.7)*9,th=u=>h*.34*Math.pow(Math.sin(u*Math.PI),.8);
    for(let i=0;i<=24;i++){const u=i/24;ctx.lineTo(q[0]-66+u*132,mid(u)+th(u)*.7)}for(let i=24;i>=0;i--){const u=i/24;ctx.lineTo(q[0]-66+u*132,mid(u)-th(u))}
    ctx.closePath();const g=ctx.createLinearGradient(0,q[1]-h*1.05-b*10,0,q[1]-h*.35-b*10);g.addColorStop(0,`rgba(${rgb},0)`);g.addColorStop(.55,`rgba(${rgb},${.36*a})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;ctx.fill()}ctx.restore()};
  if(A.aurora>=0&&fx){const k=A.aurora,a=sstep(.15,.3,k)*(1-sstep(.85,1,k));L.add(-990,()=>aurora(k,[10,0,40],120+20*Math.sin(k*TAU),a))}
  if(A.rise>=0&&fx){const k=A.rise;L.add(999,()=>aurora(k,[10,0,40+k*60],100+60*k,sstep(0,.3,k)*(1-sstep(.75,1,k))))}
  if(A.shards>=0&&fx){const k=A.shards;for(let i=0;i<5;i++){const a=(i-2)*.3,c=[40+k*90*Math.cos(a),k*90*Math.sin(a),70-k*40];L.add(D(c)+20,()=>{ctx.save();ctx.globalAlpha*=1-sstep(.8,1,k);crystal(V0,c,[Math.cos(a),Math.sin(a),-.3],9,2.4,K.ice,K.iceD);ctx.restore()})}}
  if(A.crack>=0&&A.crack<1&&fx){const k=A.crack;L.add(998,()=>{const c=X.T([SHC[0]-8,0,SHC[2]+20]);for(let i=0;i<10;i++){const u=((k*1.4+i*.1)%1),q=P(add(c,[Math.sin(i*2.1)*20,Math.cos(i*1.7)*14,-u*40]));ctx.fillStyle=`rgba(230,248,255,${.9*(1-u)})`;star5(q,2,'#e8faff',1-u)}})}
  run(L);
  if(A.glowK>0&&!LOWFX){const q=P(X.T([SHC[0]-6,0,SHC[2]+24]));ctx.save();ctx.globalCompositeOperation='lighter';shine(K.iceRgb,q[0],q[1],40,.28*A.glowK,30);ctx.restore()}
  if(A.stars>0)bstars(P(X.T([SHC[0],0,SHC[2]+30])),18,A.stars);
  ctx.restore()}
reg('stag',{n:"Il Cervo d'Aurora",g:'boss3',sc:1,an:['idle','walk','prep','charge','crystals','aurora','stomp','hit','enter','die'],
  dur:{idle:3,walk:1,prep:1.2,charge:.7,crystals:1.3,aurora:2.4,stomp:1.5,hit:.6,enter:2.8,die:4},
  lab:{idle:'Fermo',walk:'Trotta',prep:'Prepara',charge:'Carica',crystals:'Cristalli',aurora:'Aurora',stomp:'Zoccolata',hit:'Colpito',enter:'Entrata',die:'Sconfitta'}},stag);

})();
