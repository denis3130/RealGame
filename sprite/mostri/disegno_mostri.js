// New chapter enemies for Mossbound: Zombie, Segugio infernale (demon hound), boss Il Becchino.
// Every body part sits in a small 3D frame (x forward, y right, z up) and is projected with the facing angle,
// so the monsters turn smoothly through all 360 degrees and every piece stays attached to the same point of the body.
// Drawn with the game's own primitives (ctx, ink, circ, ell, fs, glow, shadow, INK, LOWFX).
// anim: 'idle' | 'walk' | 'attack' (boss: 'idle' | 'walk' | 'slam' | 'summon'); p = 0..1 progress in the cycle.
window.CR=(()=>{
const TAU=Math.PI*2,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ez=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
// projection: world floor = fwd*x + right*y, screen y squashed (top-down camera), depth = how close to the camera
function V(face){const c=Math.cos(face),s=Math.sin(face);return{c,s,P:(x,y,z)=>[x*c-y*s,(x*s+y*c)*.55-z],D:(x,y)=>x*s+y*c,F:(x,y,r)=>(x*s+y*c)/r}}
function line(a,b,w,col){ctx.strokeStyle=INK;ctx.lineWidth=w+2.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke()}
function quad(a,m,b,w,col){ctx.strokeStyle=INK;ctx.lineWidth=w+2.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(m[0],m[1],b[0],b[1]);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke()}
function shine(rgb,x,y,r,a){if(LOWFX||a<=0)return;ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x,y,r,a);ctx.restore()}
function run(parts){parts.sort((a,b)=>a.d-b.d);for(const q of parts){ink(2.4);q.f()}}
// a claw: three dark hooked talons pointing along screen direction (dx,dy)
function claws(h,dx,dy,len,col){const a=Math.atan2(dy,dx);ctx.strokeStyle=INK;ctx.lineCap='round';for(let k=-1;k<=1;k++){const b=a+k*.42;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(h[0]+Math.cos(b)*2.2,h[1]+Math.sin(b)*2.2);ctx.quadraticCurveTo(h[0]+Math.cos(b)*len,h[1]+Math.sin(b)*len,h[0]+Math.cos(b+.5)*len*1.15,h[1]+Math.sin(b+.5)*len*1.15);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=1.1;ctx.stroke();ctx.strokeStyle=INK}}

// ------------------------------------------------------------------ ZOMBIE DELLA CRIPTA
const ZC={skin:'#88a06c',skinD:'#5a7048',rot:'#3f5233',cloth:'#3a454e',clothD:'#262e35',pants:'#2f2a26',bone:'#e6dcc0',socket:'#141010',eye:'#e9ff7a',mouth:'#2a0c0c',gum:'#6a1a1a',claw:'#2a2a22'};
function zombie(x,y,face,anim,p,sc){sc=sc||1.1;const t=G.t,{c,s,P,D,F}=V(face),ph=p*TAU,walk=anim==='walk',atk=anim==='attack';
  // attack: .0-.35 rear back with arms up, .35-.6 lunge and rake down, .6-1 recover
  let up=0,reach=0,lunge=0;if(atk){if(p<.35){up=ez(p/.35);lunge=-up*2}else if(p<.6){const k=ez((p-.35)/.25);up=1-k*1.3;reach=k;lunge=-2+k*7}else{const k=ez((p-.6)/.4);up=-.3*(1-k);reach=1-k;lunge=5*(1-k)}}
  const bob=walk?Math.abs(Math.sin(ph))*1.5:Math.sin(ph)*.4,roll=walk?Math.sin(ph)*1.4:Math.sin(t*1.3)*.6,hunch=5+lunge;
  shadow(x+c*lunge*sc*.4,y+s*lunge*sc*.22,11*sc,4.4*sc,.34);
  ctx.save();ctx.translate(x,y-bob*sc);ctx.scale(sc,sc);
  const parts=[],L=lunge*.6;
  // legs: the left one drags behind (limp)
  for(const sd of[-1,1]){const st=walk?Math.sin(ph+(sd>0?Math.PI:0))*(sd<0?3:5.5):0,lift=walk&&sd>0?Math.max(0,Math.sin(ph+Math.PI))*2.4:0,fx=st+L*.5,fy=sd*4.4;
    parts.push({d:D(fx,fy)-.5,f:()=>{const h=P(L*.4,sd*3.4,8),f=P(fx,fy,lift);line(h,f,4.2,ZC.pants);ctx.save();ctx.translate(f[0],f[1]);ctx.rotate(Math.atan2(s*.55,c));ink(1.8);ell(1.4,0,4.4,2.6);fs('#1f1b18');ctx.restore()}})}
  // torso: hunched, ragged shirt, a hole showing the ribs on the chest, spine bumps on the back
  const T=[L+hunch*.3,roll*.6];
  parts.push({d:D(T[0],T[1]),f:()=>{const m=P(T[0],T[1],15),hw=Math.hypot(9.6*s,6.4*c),top=m[1]-9,bot=m[1]+8;
    ctx.beginPath();ctx.moveTo(m[0]-hw,bot-2);ctx.quadraticCurveTo(m[0]-hw-1.6,top+3,m[0]-hw*.4,top);ctx.quadraticCurveTo(m[0],top-1.6,m[0]+hw*.4,top);ctx.quadraticCurveTo(m[0]+hw+1.6,top+3,m[0]+hw,bot-2);
    for(let i=0;i<=7;i++){const xx=m[0]+hw-i*hw*2/7;ctx.lineTo(xx,bot+(i%2?2.6:-.4)+(i===3?2:0))}ctx.closePath();ctx.fillStyle=ZC.cloth;ctx.fill();ctx.stroke();
    ctx.save();ctx.clip();ctx.fillStyle=ZC.clothD;ell(m[0]+hw*.45,m[1]+3,hw*.7,6);ctx.fill();ctx.restore();
    const fr=F(6.4,-1.5,6.6);if(fr>.12){const q=P(T[0]+5.8,T[1]-1.5,14);ctx.save();ctx.globalAlpha=cl(fr*2,0,1);ink(1.6);ctx.fillStyle=ZC.rot;ctx.beginPath();ctx.ellipse(q[0],q[1],3.6*Math.max(.35,fr),4.6,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.strokeStyle=ZC.bone;ctx.lineWidth=1.3;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(q[0]-2.8*fr,q[1]-2.6+i*2.4);ctx.quadraticCurveTo(q[0],q[1]-3.4+i*2.4,q[0]+2.8*fr,q[1]-2.6+i*2.4);ctx.stroke()}ctx.restore()}
    const bk=F(-6.4,0,6.4);if(bk>.12){ctx.save();ctx.globalAlpha=cl(bk*2,0,1);ctx.fillStyle=ZC.skinD;for(let i=0;i<3;i++){const q=P(T[0]-6,T[1],19-i*3.5);ink(1.3);circ(q[0],q[1],1.5);ctx.fill();ctx.stroke()}ctx.restore()}
    // tears
    ctx.strokeStyle='rgba(20,16,14,.65)';ctx.lineWidth=1;ctx.beginPath();const a=P(T[0]+3*s,T[1]-5*c,20),b=P(T[0]+2*s,T[1]-3*c,12);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0]+1.5,(a[1]+b[1])/2);ctx.lineTo(b[0],b[1]);ctx.stroke()}});
  // arms: long, reaching, with dark claws; raised high when it rears back
  for(const sd of[-1,1]){const sh=[T[0],sd*8.4+T[1],20.5],hd=[T[0]+11+reach*9,sd*(5.2-reach*1.4)+T[1],15.5+up*15-(walk?Math.sin(ph+sd)*1.4:0)+Math.sin(t*2+sd)*.4];
    parts.push({d:(D(sh[0],sh[1])+D(hd[0],hd[1]))/2+.2,f:()=>{const a=P(...sh),b=P(...hd),m=P((sh[0]+hd[0])/2-1,(sh[1]+hd[1])/2+sd*1.2,(sh[2]+hd[2])/2-3);
      quad(a,m,b,4.4,F(0,sd,1)<0?ZC.skinD:ZC.skin);ctx.strokeStyle='rgba(20,16,14,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo((a[0]+m[0])/2,(a[1]+m[1])/2-1);ctx.lineTo((a[0]+m[0])/2+1.6,(a[1]+m[1])/2+1.4);ctx.stroke();
      ink(1.8);circ(b[0],b[1],2.9);fs(ZC.skin);const dx=b[0]-m[0],dy=b[1]-m[1];claws(b,dx,dy,5.6,ZC.claw)}})}
  // head: lolling, hollow sockets with pinpoint lights, hanging jaw full of broken teeth
  const H=[T[0]+hunch*.55,T[1]*1.4+Math.sin(t*1.6)*1.3,27.5+(walk?Math.sin(ph*2)*.5:0)],R=8.4;
  parts.push({d:D(H[0],H[1])+.4,f:()=>{const h=P(...H);ctx.beginPath();ctx.arc(h[0],h[1],R,0,TAU);ctx.fillStyle=ZC.skin;ctx.fill();ctx.stroke();
    ctx.save();ctx.beginPath();ctx.arc(h[0],h[1],R-1.2,0,TAU);ctx.clip();ctx.fillStyle=ZC.skinD;ell(h[0]-s*2,h[1]+4.6,R,4.4);ctx.fill();ctx.fillStyle=ZC.rot;ell(h[0]+c*3.5,h[1]-3.5,2.6,1.8);ctx.fill();ctx.restore();
    // thin hair
    ctx.strokeStyle=INK;ctx.lineWidth=1.2;for(let i=-2;i<=2;i++){const q=P(H[0]-1+i*.6,H[1]+i*1.6,H[2]+R-.6);ctx.beginPath();ctx.moveTo(q[0],q[1]+1);ctx.quadraticCurveTo(q[0]+i*1.2,q[1]-3,q[0]+i*2.4+Math.sin(t*2+i),q[1]-4.4);ctx.stroke()}
    const at=(fx,fy,fz)=>({q:P(H[0]+fx,H[1]+fy,H[2]+fz),v:F(fx,fy,R)});
    // back of the skull: a stitched crack
    {const b=at(-7.6,1,1.4);if(b.v>.1){ctx.save();ctx.globalAlpha=cl(b.v*2,0,1);ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(b.q[0]-3,b.q[1]-2);ctx.lineTo(b.q[0],b.q[1]);ctx.lineTo(b.q[0]+2.6,b.q[1]-2.4);for(let i=0;i<3;i++){const xx=b.q[0]-2.4+i*2.2;ctx.moveTo(xx-.8,b.q[1]-2.6+i*.4);ctx.lineTo(xx+.8,b.q[1]-.4+i*.4)}ctx.stroke();ctx.restore()}}
    // scar on the right cheek
    {const b=at(1.5,7.4,-.6);if(b.v>.1){ctx.save();ctx.globalAlpha=cl(b.v*2.4,0,1);ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(b.q[0]-2,b.q[1]-2);ctx.lineTo(b.q[0]+2,b.q[1]+2);ctx.moveTo(b.q[0]-1.4,b.q[1]+.6);ctx.lineTo(b.q[0]-.2,b.q[1]-.8);ctx.moveTo(b.q[0]+.4,b.q[1]+1.8);ctx.lineTo(b.q[0]+1.6,b.q[1]+.4);ctx.stroke();ctx.restore()}}
    // sockets and eyes
    for(const sd of[-1,1]){const e=at(6.6,sd*3.3,1.6);if(e.v<.05)continue;const k=cl(e.v*1.6,0,1),big=sd>0?1.15:.9;ctx.save();ctx.globalAlpha=k;ink(1.5);ctx.fillStyle=ZC.socket;ctx.beginPath();ctx.ellipse(e.q[0],e.q[1],2.6*big*Math.max(.4,e.v),2.9*big,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
      shine('230,255,120',e.q[0],e.q[1],4.6,.55*k+.12*Math.sin(t*5+sd));ctx.fillStyle=ZC.eye;circ(e.q[0]+c*.3,e.q[1]+.2,1*big*k);ctx.fill()}
    // jaw
    {const m=at(6.4,0,-3.8);if(m.v>.02){const k=cl(m.v*1.6,0,1),op=atk&&p>.25&&p<.7?1:.55+.2*Math.sin(t*3.2),w=4.4*Math.max(.35,m.v),hh=2+op*2.6;ctx.save();ctx.globalAlpha=k;ink(1.6);ctx.fillStyle=ZC.mouth;ctx.beginPath();ctx.ellipse(m.q[0],m.q[1]+hh*.35,w,hh,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.fillStyle=ZC.gum;ctx.fillRect(m.q[0]-w*.8,m.q[1]-hh*.6,w*1.6,1);ctx.fillStyle=ZC.bone;ink(.8);for(let i=0;i<4;i++){const xx=m.q[0]-w*.75+i*w*.5,yy=m.q[1]-hh*.5,hh2=i===1?2.4:1.5;ctx.beginPath();ctx.moveTo(xx-.8,yy);ctx.lineTo(xx,yy+hh2);ctx.lineTo(xx+.8,yy);ctx.closePath();ctx.fill();ctx.stroke()}
      for(let i=0;i<3;i++){const xx=m.q[0]-w*.5+i*w*.5,yy=m.q[1]+hh*1.1;ctx.beginPath();ctx.moveTo(xx-.7,yy);ctx.lineTo(xx,yy-1.6);ctx.lineTo(xx+.7,yy);ctx.closePath();ctx.fill();ctx.stroke()}
      const dr=(t*.9+.3)%1;ctx.strokeStyle='rgba(190,220,140,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(m.q[0]+w*.4,m.q[1]+hh*1.2);ctx.lineTo(m.q[0]+w*.4,m.q[1]+hh*1.2+2+dr*4);ctx.stroke();ctx.restore()}}}});
  run(parts);ctx.restore()}

// ------------------------------------------------------------------ SEGUGIO INFERNALE
const HC={fur:'#2b1f24',furD:'#1a1216',hide:'#3d2a30',belly:'#4a2e30',spike:'#9a2222',ember:'#ff7a2a',eye:'#ff3b2f',horn:'#d8c9ac',bone:'#e6dcc0',maw:'#4a0a0e'};
function hound(x,y,face,anim,p,sc){sc=sc||1.05;const t=G.t,{c,s,P,D,F}=V(face),ph=p*TAU,runA=anim==='walk',atk=anim==='attack';
  // pounce: .0-.28 crouches and wiggles, .28-.36 launches nose up, .36-.66 flies (jaws open, then snap), .66-.8 lands and skids, .8-1 recovers
  let z=0,crouch=0,str=0,pitch=0,wig=0,skid=0,jaw=runA?.35+.15*Math.sin(ph*2):.2+.08*Math.sin(t*3)+(anim==='idle'?Math.max(0,Math.sin(ph*2))*.25:0);
  if(atk){if(p<.28){const k=ez(p/.28);crouch=k;wig=k;jaw=.45}else if(p<.36){const k=(p-.28)/.08;crouch=1-k;str=k;pitch=k*.9;jaw=.8}
    else if(p<.66){const k=(p-.36)/.3;z=Math.sin(k*Math.PI)*17;str=1-k*.4;pitch=.9-k*1.8;jaw=k<.5?1:Math.max(0,1-(k-.5)*6)}
    else if(p<.8){const k=(p-.66)/.14;crouch=Math.sin(k*Math.PI)*.8;skid=k*3;pitch=-.9*(1-k);jaw=0}else{const k=ez((p-.8)/.2);skid=3*(1-k);jaw=.2*k}}
  // run: rotary gallop, the back flexes (gather / stretch) and the body rocks nose-up, nose-down
  const bob=runA?Math.abs(Math.sin(ph))*2.2:Math.sin(ph)*.5,br=Math.sin(ph)*(anim==='idle'?.9:.5),flex=runA?Math.cos(ph)*2:0,fwd=(atk&&p>.28&&p<.66?7*str:0)+skid;pitch+=runA?Math.sin(ph)*.35:0;
  shadow(x+c*fwd*sc,y+s*fwd*sc*.55,15*sc*(1-z/40),5.4*sc*(1-z/40),.36);
  ctx.save();ctx.translate(x+Math.sin(p*90)*wig*.8*sc,y);ctx.scale(sc,sc);
  const H0=7-crouch*3+bob*.3-z*0,lift=z+bob-crouch*2.4;// height of the body above the floor
  const R=[-9-str*2+fwd-flex*.5,0],C=[6+str*3+fwd+flex*.5,0],Hd=[15+str*4+fwd+flex*.6,0];
  const Pp=(x,y,z)=>P(x,y,z+pitch*(x-fwd+1.5)*.32);
  const parts=[];
  // legs: gallop, thin and bony, with claws
  const leg=(u,sd,phase,front)=>{let sw=runA?Math.sin(ph+phase)*5.5:0,lf=runA?Math.max(0,Math.cos(ph+phase))*2.6:0;if(atk&&p>.3&&p<.75){sw=front?8:-8;lf=3}
    const fx=u+sw,fy=sd*4.6;parts.push({d:D(u,fy)-.6,f:()=>{const top=Pp(u,sd*4,H0+lift+3),knee=Pp(u+(front?-2:2)+sw*.4,sd*4.4,H0*.5+lift+lf*.5),foot=P(fx,fy,Math.max(0,lift-H0*.6)+lf);
      quad(top,knee,foot,3.2,F(0,sd,1)<0?HC.furD:HC.fur);ink(1.3);ctx.fillStyle=HC.furD;circ(foot[0],foot[1],1.9);ctx.fill();ctx.stroke();
      ctx.strokeStyle=HC.bone;ctx.lineWidth=1;for(let k=-1;k<=1;k++){const a=Math.atan2(s*.55,c)+k*.5;ctx.beginPath();ctx.moveTo(foot[0]+Math.cos(a)*1.6,foot[1]+Math.sin(a)*1.6);ctx.lineTo(foot[0]+Math.cos(a)*3.2,foot[1]+Math.sin(a)*3.2+.6);ctx.stroke()}}})};
  leg(R[0],-1,0,false);leg(R[0],1,.45,false);leg(C[0],-1,Math.PI,true);leg(C[0],1,Math.PI+.45,true);
  // tail: bony, ending in a flame
  {const tw=Math.sin(runA?ph-1.2:t*6)*3+wig*Math.sin(p*90+1)*4,tip=[R[0]-11,tw,H0+lift+10+(runA?Math.sin(ph*2)*1.6:0)];parts.push({d:D(R[0]-6,tw*.5)-.2,f:()=>{const a=Pp(R[0]-5,0,H0+lift+6),m=Pp(R[0]-9,tw*.5,H0+lift+11),b=Pp(...tip);quad(a,m,b,2.2,HC.fur);
    for(let i=1;i<4;i++){const k=i/4,q=[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k-2];ink(1);ctx.fillStyle=HC.spike;ctx.beginPath();ctx.moveTo(q[0]-1.2,q[1]+1);ctx.lineTo(q[0],q[1]-2.4);ctx.lineTo(q[0]+1.2,q[1]+1);ctx.closePath();ctx.fill();ctx.stroke()}
    shine('255,120,40',b[0],b[1]-2,8,.55+.12*Math.sin(t*14));ink(1.2);ctx.fillStyle=HC.ember;ctx.beginPath();ctx.moveTo(b[0]-2.6,b[1]+1);ctx.quadraticCurveTo(b[0]-1.8,b[1]-4,b[0]+Math.sin(t*12)*1.4,b[1]-7);ctx.quadraticCurveTo(b[0]+2,b[1]-3.8,b[0]+2.6,b[1]+1);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ffe28a';circ(b[0],b[1]-1.4,1.1);ctx.fill()}})}
  // body: rump + ribcage chest, visible ribs, spikes on the spine, glowing cracks
  parts.push({d:D((R[0]+C[0])/2,0),f:()=>{const r=Pp(R[0],0,H0+lift+5.5),k=Pp(C[0],0,H0+lift+6.5),wr=Math.hypot(6.6*s,7.6*c),wk=Math.hypot(7.6*s,8.4*c);
    ctx.fillStyle=HC.fur;ctx.beginPath();ctx.ellipse(r[0],r[1],wr,6.2,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.ellipse(k[0],k[1]-.4,wk+br*.3,7.2+br*.3,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(r[0],r[1]-5.6);ctx.lineTo(k[0],k[1]-6.8);ctx.lineTo(k[0],k[1]+5.4);ctx.lineTo(r[0],r[1]+5);ctx.closePath();ctx.fill();
    ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(r[0],r[1]-6.2);ctx.lineTo(k[0],k[1]-7.4);ctx.stroke();
    // ribs on the side facing the camera
    const sideV=Math.abs(c);if(sideV>.25){ctx.save();ctx.globalAlpha=cl((sideV-.25)*2,0,1);ctx.strokeStyle='#5a4046';ctx.lineWidth=1.3;for(let i=0;i<4;i++){const q=Pp(C[0]-1-i*2.6,0,H0+lift+6.4);ctx.beginPath();ctx.moveTo(q[0]-.8,q[1]-4.4);ctx.quadraticCurveTo(q[0]+2*Math.sign(c),q[1],q[0]-.6,q[1]+4.2);ctx.stroke()}ctx.restore()}
    // spikes along the spine
    for(let i=0;i<6;i++){const u=R[0]+(C[0]-R[0])*i/5,q=Pp(u,0,H0+lift+12.2+(i===5?1:0));ink(1.3);ctx.fillStyle=HC.spike;const h=3.6+(i%2)*1.6;ctx.beginPath();ctx.moveTo(q[0]-1.9,q[1]+1.4);ctx.lineTo(q[0]-c*1.6,q[1]-h);ctx.lineTo(q[0]+1.9,q[1]+1.4);ctx.closePath();ctx.fill();ctx.stroke()}
    // ember cracks
    const gl=.65+.35*Math.sin(t*4);ctx.strokeStyle=`rgba(255,${130+60*gl|0},50,${.7*gl+.3})`;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(k[0]-2,k[1]-3.4);ctx.lineTo(k[0]+.6,k[1]-.4);ctx.lineTo(k[0]-1,k[1]+2.6);ctx.moveTo(r[0]+1,r[1]-2.4);ctx.lineTo(r[0]-1.6,r[1]+1);ctx.stroke();shine('255,110,40',k[0],k[1],7,.18*gl);
    // smoke rising from the back
    if(!LOWFX){for(let i=0;i<3;i++){const q=(t*.6+i/3)%1,sp=Pp(R[0]+(C[0]-R[0])*(i/2),0,H0+lift+13);ctx.fillStyle=`rgba(60,50,55,${.35*(1-q)})`;circ(sp[0]+Math.sin(t+i)*2,sp[1]-q*12,1.6+q*3);ctx.fill()}}}});
  // neck + head: horns, ears, glowing eyes, long snout, a maw full of fangs that opens to bite
  const hz=H0+lift+11-crouch*2;
  parts.push({d:D(Hd[0],0)+.3,f:()=>{const nk=Pp(C[0]+2,0,H0+lift+9),h=Pp(Hd[0],0,hz);line(nk,h,6.4,HC.fur);
    const at=(fx,fy,fz)=>({q:Pp(Hd[0]+fx,fy,hz+fz),v:F(fx,fy,6.5)});
    // horns (always visible), curved back
    for(const sd of[-1,1]){const b=at(-1.5,sd*3.4,3.6),tp=at(-7,sd*5.8,9.5),m=at(-3,sd*5.4,8.4);ink(1.5);ctx.fillStyle=HC.horn;ctx.beginPath();ctx.moveTo(b.q[0]-1.8,b.q[1]+.8);ctx.quadraticCurveTo(m.q[0],m.q[1],tp.q[0],tp.q[1]);ctx.quadraticCurveTo(m.q[0]+1.6,m.q[1]+1.8,b.q[0]+1.8,b.q[1]+.8);ctx.closePath();ctx.fill();ctx.stroke()}
    // skull
    ctx.fillStyle=HC.fur;ctx.beginPath();ctx.ellipse(h[0],h[1],Math.hypot(5.6*s,6.6*c)+.6,5.8,0,0,TAU);ctx.fill();ctx.stroke();
    for(const sd of[-1,1]){const e=at(-2,sd*4.2,4.4);ctx.fillStyle=HC.furD;ctx.beginPath();ctx.moveTo(e.q[0]-1.8,e.q[1]+1.6);ctx.lineTo(e.q[0]-c*1.2,e.q[1]-4.4);ctx.lineTo(e.q[0]+1.8,e.q[1]+1.6);ctx.closePath();ctx.fill();ctx.stroke()}
    // snout and jaw, pointing forward
    const sn=at(6.4,0,-.6),jw=at(6,0,-2.8-jaw*2.6),fv=F(1,0,1);
    const snoutBehind=fv<-.25;
    const drawSnout=()=>{const w=Math.hypot(3*s,4.8*c)+.6;ctx.fillStyle=HC.furD;ctx.beginPath();ctx.ellipse(jw.q[0],jw.q[1],w,2,0,0,TAU);ctx.fill();ctx.stroke();
      if(jaw>.3&&fv>-.2){ctx.fillStyle=HC.maw;ctx.beginPath();ctx.ellipse((sn.q[0]+jw.q[0])/2,(sn.q[1]+jw.q[1])/2,w*.8,Math.abs(jw.q[1]-sn.q[1])*.6+.6,0,0,TAU);ctx.fill()}
      ctx.fillStyle=HC.hide;ctx.beginPath();ctx.ellipse(sn.q[0],sn.q[1],w+.4,2.6,0,0,TAU);ctx.fill();ctx.stroke();
      if(fv>-.2){ctx.fillStyle=HC.bone;ink(.8);const n=5;for(let i=0;i<n;i++){const k=(i/(n-1))*2-1,xx=sn.q[0]+k*w*.8,yy=sn.q[1]+2,hh=i===0||i===n-1?3.2+jaw:1.8;ctx.beginPath();ctx.moveTo(xx-.8,yy);ctx.lineTo(xx,yy+hh);ctx.lineTo(xx+.8,yy);ctx.closePath();ctx.fill();ctx.stroke()}
        for(let i=0;i<4;i++){const k=(i/3)*2-1,xx=jw.q[0]+k*w*.7,yy=jw.q[1]-1.4;ctx.beginPath();ctx.moveTo(xx-.7,yy);ctx.lineTo(xx,yy-1.8-jaw);ctx.lineTo(xx+.7,yy);ctx.closePath();ctx.fill();ctx.stroke()}}
      ctx.fillStyle=INK;const ns=at(9,0,.6);circ(ns.q[0],ns.q[1],1);ctx.fill();
      if(jaw>.3&&fv>-.2){const dr=(t*1.1)%1;ctx.strokeStyle='rgba(255,170,120,.6)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(jw.q[0]+1.6,jw.q[1]+1.6);ctx.lineTo(jw.q[0]+1.6,jw.q[1]+2+dr*4);ctx.stroke()}};
    // eyes: two burning slits, only where the face is turned toward us
    const eyes=()=>{for(const sd of[-1,1]){const e=at(3.6,sd*2.9,1.4);if(e.v<-.05)continue;const k=cl((e.v+.05)*2.4,0,1);shine('255,60,40',e.q[0],e.q[1],5.6,.6*k+.12*Math.sin(t*5));ctx.save();ctx.globalAlpha=k;ctx.fillStyle=HC.eye;ctx.beginPath();ctx.ellipse(e.q[0],e.q[1],1.9,1,sd*.35*c,0,TAU);ctx.fill();ctx.fillStyle='#ffe28a';circ(e.q[0],e.q[1],.5);ctx.fill();ctx.restore()}};
    if(snoutBehind){drawSnout();ctx.fillStyle=HC.fur;ctx.beginPath();ctx.ellipse(h[0],h[1],Math.hypot(5.6*s,6.6*c)+.6,5.8,0,0,TAU);ctx.fill();ctx.stroke()}else{eyes();drawSnout()}
    if(!snoutBehind)eyes()}});
  run(parts);ctx.restore()}

// ------------------------------------------------------------------ BOSS: IL BECCHINO
const BC={skin:'#7d9a62',skinD:'#55703f',coat:'#2e2638',coatD:'#1e1826',coatL:'#463a56',hat:'#1f1a24',band:'#6a1e28',metal:'#8a96a2',wood:'#6b4a2a',bone:'#e6dcc0',hole:'#0e140c',glow:'150,255,110',chain:'#7a7f86'};
function becchino(x,y,face,anim,p,sc){sc=sc||2;const t=G.t,{c,s,P,D,F}=V(face),ph=p*TAU,walk=anim==='walk',slam=anim==='slam',sum=anim==='summon';
  const w=walk?Math.sin(ph):0,bob=walk?Math.abs(Math.sin(ph))*1.8:Math.sin(ph)*.6,sway=walk?Math.sin(ph)*1.2:0;
  // slam: .0-.45 raise the shovel high behind the head, .45-.6 smash it down, .6-1 pull it out
  let a=-1.05,lift=0,squash=0,shake=0;
  if(slam){if(p<.45){const k=ez(p/.45);a=-1.05+k*3.05;lift=k*2}else if(p<.6){const k=(p-.45)/.15;a=2-k*3.35;squash=Math.sin(k*Math.PI)*.1}else{const k=ez((p-.6)/.4);a=-1.35+k*.3;shake=(1-k)*1.2}}
  const armUp=sum?(p<.25?ez(p/.25):p<.8?1:1-ez((p-.8)/.2)):0;
  shadow(x,y+2*sc,16*sc,6*sc,.38);
  // summon: green ring on the floor and zombie hands clawing out of the ground around him
  if(sum){const k=cl((p-.15)/.6,0,1);ctx.save();shine(BC.glow,x,y+2*sc,34*sc*armUp,.35*armUp);
    ctx.strokeStyle=`rgba(150,255,110,${.6*armUp})`;ctx.lineWidth=2;ell(x,y+2*sc,26*sc*armUp,9*sc*armUp);ctx.stroke();
    for(let i=0;i<4;i++){const an=i*TAU/4+.4,hx=x+Math.cos(an)*25*sc,hy=y+2*sc+Math.sin(an)*9*sc,e=cl(k*1.5-i*.14,0,1);if(e<=0)continue;
      ctx.fillStyle='rgba(20,16,12,.75)';ell(hx,hy+1,4.6*sc,1.6*sc);ctx.fill();ctx.save();ctx.translate(hx,hy);ctx.scale(sc*.8,sc*.8);ink(1.8);
      const up=e*9,wv=Math.sin(t*7+i)*1.2;ctx.fillStyle=ZC.skin;ctx.beginPath();ctx.moveTo(-2.2,0);ctx.lineTo(-2.2+wv*.3,-up);ctx.lineTo(2.2+wv*.3,-up);ctx.lineTo(2.2,0);ctx.closePath();ctx.fill();ctx.stroke();circ(wv*.3,-up,3.2);fs(ZC.skin);claws([wv*.3,-up],wv*.2,-1,5,ZC.claw);ctx.restore()}
    ctx.restore()}
  ctx.save();ctx.translate(x,y-(bob+lift)*sc+shake*Math.sin(t*60)*sc*.3);ctx.scale(sc*(1+squash),sc*(1-squash));
  const parts=[];
  // legs: stumpy, heavy boots
  for(const sd of[-1,1]){const st=walk?w*sd*4:0,fx=st,fy=sd*7;parts.push({d:D(fx,fy)-1,f:()=>{const h=P(0,sd*6,8),f=P(fx,fy,0);line(h,f,6,BC.coatD);ctx.save();ctx.translate(f[0],f[1]);ink(2);ell(c*1.6,s*.9,5.2,3);fs('#1b1714');ctx.restore()}})}
  // body: huge rotten belly opened like a cage, with ribs and a green glow inside; coat around it
  const B0=[1,sway*.5];
  parts.push({d:D(B0[0],B0[1]),f:()=>{const m=P(B0[0],B0[1],16),hw=Math.hypot(17*s,13*c),top=m[1]-14,bot=m[1]+9;
    ctx.beginPath();ctx.moveTo(m[0]-hw,bot-2);ctx.quadraticCurveTo(m[0]-hw-5,top+6,m[0]-hw*.5,top);ctx.quadraticCurveTo(m[0],top-3,m[0]+hw*.5,top);ctx.quadraticCurveTo(m[0]+hw+5,top+6,m[0]+hw,bot-2);
    for(let i=0;i<=8;i++){const xx=m[0]+hw-i*hw*2/8;ctx.lineTo(xx,bot+(i%2?3:0))}ctx.closePath();ctx.fillStyle=BC.coat;ctx.fill();ctx.stroke();
    ctx.save();ctx.clip();ctx.fillStyle=BC.coatD;ell(m[0]+hw*.5,m[1]+4,hw*.7,12);ctx.fill();ctx.fillStyle=BC.coatL;ell(m[0]-hw*.6,top+4,hw*.3,3);ctx.fill();ctx.restore();
    // the belly faces forward: open cage, ribs, glow
    const fv=F(12,0,12);if(fv>.05){const k=cl(fv*1.8,0,1),q=P(B0[0]+10,B0[1],14),bw=9.6*Math.max(.3,fv),bh=9;ctx.save();ctx.globalAlpha=k;
      ink(2);ctx.fillStyle=BC.skin;ctx.beginPath();ctx.ellipse(q[0],q[1],bw+2.4,bh+2,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.fillStyle=BC.hole;ctx.beginPath();ctx.ellipse(q[0],q[1]+.6,bw,bh*.8,0,0,TAU);ctx.fill();shine(BC.glow,q[0],q[1]+1,12,.45+.15*Math.sin(t*3));
      ctx.fillStyle=`rgba(150,255,110,${.35+.15*Math.sin(t*3)})`;ell(q[0],q[1]+2,bw*.55,bh*.4);ctx.fill();
      ctx.strokeStyle=BC.bone;ctx.lineWidth=2;for(let i=0;i<4;i++){const yy=q[1]-5+i*3.4,ww=bw*(1-Math.abs(i-1.5)*.18);ctx.beginPath();ctx.moveTo(q[0]-ww,yy+1);ctx.quadraticCurveTo(q[0],yy-1.6,q[0]+ww,yy+1);ctx.stroke()}
      ctx.strokeStyle=INK;ctx.lineWidth=1.2;for(const sd of[-1,1])for(let i=0;i<4;i++){const yy=q[1]-6+i*3.6,xx=q[0]+sd*(bw+1.2);ctx.beginPath();ctx.moveTo(xx-1.6,yy);ctx.lineTo(xx+1.6,yy+1)}ctx.stroke();ctx.restore()}
    // chains across the coat
    ctx.strokeStyle=INK;ctx.lineWidth=1.2;for(let i=0;i<7;i++){const u=i/6,a1=P(B0[0]+(fv>0?5:-5),B0[1]-14+u*28,22-u*12);ctx.fillStyle=BC.chain;ctx.beginPath();ctx.ellipse(a1[0],a1[1],1.8,1.2,.6,0,TAU);ctx.fill();ctx.stroke()}
    // patches on the back
    const bk=F(-12,0,12);if(bk>.1){ctx.save();ctx.globalAlpha=cl(bk*2,0,1);const q=P(B0[0]-11,B0[1]+2,17);ink(1.4);ctx.fillStyle='#6b5a3a';ctx.fillRect(q[0]-3,q[1]-3,6,5.4);ctx.strokeRect(q[0]-3,q[1]-3,6,5.4);ctx.beginPath();ctx.moveTo(q[0]-2,q[1]-2);ctx.lineTo(q[0]+2,q[1]+1.6);ctx.stroke();ctx.restore()}}});
  // free arm (left): raised to summon
  {const sh=[2,-14,24],hd=[6+armUp*2,-17-armUp*2,14+armUp*24+(walk?w*2:0)];parts.push({d:(D(sh[0],sh[1])+D(hd[0],hd[1]))/2+.3,f:()=>{const a1=P(...sh),b=P(...hd),m=P((sh[0]+hd[0])/2-2,(sh[1]+hd[1])/2-2,(sh[2]+hd[2])/2-2);quad(a1,m,b,6.4,F(0,-1,1)<0?BC.coatD:BC.coat);ink(2);circ(b[0],b[1],3.8);fs(BC.skin);claws(b,b[0]-m[0],b[1]-m[1],6,ZC.claw);
    if(armUp>.3)shine(BC.glow,b[0],b[1],10,.5*armUp)}})}
  // shovel arm (right) and the shovel: one straight handle in 3D, so it turns with him
  {const sh=[2,14,24],hd=[9,13,15+(slam?Math.max(0,Math.sin(a))*9:0)];const dir=[Math.cos(a)*.9,.18,Math.sin(a)],pt=k=>[hd[0]+dir[0]*k,hd[1]+dir[1]*k,hd[2]+dir[2]*k];
    parts.push({d:(D(hd[0],hd[1])+D(pt(28)[0],pt(28)[1]))/2+.6,f:()=>{const a1=P(...sh),b=P(...hd),m=P((sh[0]+hd[0])/2-1,(sh[1]+hd[1])/2+2,(sh[2]+hd[2])/2-2);
      const h0=P(...pt(-7)),h1=P(...pt(22)),b0=P(...pt(21)),b1=P(...pt(33));line(h0,h1,2.8,BC.wood);
      const dx=b1[0]-b0[0],dy=b1[1]-b0[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,bwid=6;ink(2);ctx.fillStyle=BC.metal;ctx.beginPath();ctx.moveTo(b0[0]+nx*bwid*.7,b0[1]+ny*bwid*.7);ctx.lineTo(b1[0]+nx*bwid,b1[1]+ny*bwid);ctx.quadraticCurveTo(b1[0]+dx/L*4,b1[1]+dy/L*4,b1[0]-nx*bwid,b1[1]-ny*bwid);ctx.lineTo(b0[0]-nx*bwid*.7,b0[1]-ny*bwid*.7);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='rgba(110,40,30,.6)';circ(b1[0]-dx/L*3+nx*2,b1[1]-dy/L*3+ny*2,1.6);ctx.fill();circ(b1[0]-dx/L*6-nx*2.4,b1[1]-dy/L*6-ny*2.4,1.1);ctx.fill();ctx.fillStyle='rgba(255,255,255,.3)';circ(b0[0]+dx/L*4+nx*3,b0[1]+dy/L*4+ny*3,1.2);ctx.fill();
      quad(a1,m,b,6.4,F(0,1,1)<0?BC.coatD:BC.coat);ink(2);circ(b[0],b[1],3.8);fs(BC.skin)}})}
  // head: small for that body, battered top hat, two glowing eyes (one huge), mouth stitched wide with jagged teeth
  const Hh=[4,sway*.6,35+(walk?Math.sin(ph*2)*.5:0)-(slam&&p>.45&&p<.6?1.5:0)],R=8.6;
  parts.push({d:D(Hh[0],Hh[1])+.5,f:()=>{const h=P(...Hh);ctx.beginPath();ctx.arc(h[0],h[1],R,0,TAU);ctx.fillStyle=BC.skin;ctx.fill();ctx.stroke();
    ctx.save();ctx.beginPath();ctx.arc(h[0],h[1],R-1.2,0,TAU);ctx.clip();ctx.fillStyle=BC.skinD;ell(h[0]-s*2,h[1]+5,R,4);ctx.fill();ctx.restore();
    const at=(fx,fy,fz)=>({q:P(Hh[0]+fx,Hh[1]+fy,Hh[2]+fz),v:F(fx,fy,R)});
    for(const sd of[-1,1]){const e=at(6.8,sd*3.4,1.2);if(e.v<.04)continue;const k=cl(e.v*1.8,0,1),big=sd>0?1.35:.85;shine(BC.glow,e.q[0],e.q[1],6*big,.55*k+.15*Math.sin(t*4));ctx.save();ctx.globalAlpha=k;ink(1.4);ctx.fillStyle='#0c120a';ctx.beginPath();ctx.ellipse(e.q[0],e.q[1],2.6*big*Math.max(.4,e.v),2.8*big,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#d6ff9a';circ(e.q[0]+c*.3,e.q[1],1.1*big);ctx.fill();ctx.restore()}
    {const m=at(6.8,0,-3.6);if(m.v>.04){const k=cl(m.v*1.8,0,1),op=(slam&&p>.4&&p<.68)||sum?1:.3+.15*Math.sin(t*2.4),w=5.4*Math.max(.35,m.v),hh=1.4+op*2.6;ctx.save();ctx.globalAlpha=k;ink(1.5);ctx.fillStyle='#200808';ctx.beginPath();ctx.ellipse(m.q[0],m.q[1]+hh*.3,w,hh,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.fillStyle=BC.bone;ink(.8);for(let i=0;i<5;i++){const xx=m.q[0]-w*.8+i*w*.4,yy=m.q[1]-hh*.6,h2=i%2?2.2:1.4;ctx.beginPath();ctx.moveTo(xx-.8,yy);ctx.lineTo(xx,yy+h2);ctx.lineTo(xx+.8,yy);ctx.closePath();ctx.fill();ctx.stroke()}
      ctx.strokeStyle=INK;ctx.lineWidth=1;for(let i=0;i<4;i++){const xx=m.q[0]-w*.7+i*w*.47;ctx.beginPath();ctx.moveTo(xx,m.q[1]-hh-1.2);ctx.lineTo(xx+.4,m.q[1]+hh*1.2+1);ctx.stroke()}ctx.restore()}}
    // battered top hat, tilted, sits on the skull in every direction
    const hb=P(Hh[0]-.5,Hh[1],Hh[2]+R-2.2),tilt=-.16+.04*Math.sin(t*1.4),bw=Math.hypot(10.5*s,10.5*c);ctx.save();ctx.translate(hb[0],hb[1]);ctx.rotate(tilt);ink(2.2);ctx.fillStyle=BC.hat;ctx.beginPath();ctx.ellipse(0,0,bw,3,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-6.4,-.6);ctx.lineTo(-5.6,-12);ctx.lineTo(1,-13.4);ctx.lineTo(6,-11.4);ctx.lineTo(6.4,-.6);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=BC.band;ctx.beginPath();ctx.moveTo(-6.2,-4.4);ctx.lineTo(6.3,-4.4);ctx.lineTo(6.3,-1.6);ctx.lineTo(-6.3,-1.6);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(2,-13);ctx.lineTo(3.4,-9.6);ctx.lineTo(1.6,-7.4);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.1)';ctx.fillRect(-4.6,-11,2,6);ctx.restore()}});
  run(parts);
  // flies
  if(!LOWFX){ctx.fillStyle=INK;const h=P(...Hh);for(let i=0;i<4;i++){const an=t*3+i*1.6;circ(h[0]+Math.cos(an)*14,h[1]-4+Math.sin(an*1.3)*5,.8);ctx.fill()}}
  ctx.restore();
  // slam impact where the blade hits the floor: crack, green splash
  if(slam&&p>.55&&p<.95){const k=(p-.55)/.4,{P:Pw}=V(face),q=Pw(9+Math.cos(-1.35)*.9*30,13+.18*30,0),ix=x+q[0]*sc,iy=y+q[1]*sc;ctx.save();
    ctx.strokeStyle=`rgba(150,255,110,${.75*(1-k)})`;ctx.lineWidth=3;ell(ix,iy,(6+k*30)*sc/2,(2+k*11)*sc/2);ctx.stroke();
    ctx.strokeStyle=`rgba(20,16,12,${.85*(1-k*.4)})`;ctx.lineWidth=2.2;ctx.beginPath();for(let i=0;i<6;i++){const an=i*1.05+.3,r=(10+i%2*5)*sc/2*(.6+k*.8);ctx.moveTo(ix,iy);ctx.lineTo(ix+Math.cos(an)*r*.6,iy+Math.sin(an)*r*.25+1);ctx.lineTo(ix+Math.cos(an+.15)*r,iy+Math.sin(an+.15)*r*.4)}ctx.stroke();
    if(!LOWFX){for(let i=0;i<6;i++){const an=i*1.05,r=k*16*sc/2;ctx.fillStyle=`rgba(150,255,110,${.7*(1-k)})`;circ(ix+Math.cos(an)*r,iy+Math.sin(an)*r*.4-Math.sin(k*Math.PI)*8,2);ctx.fill()}}ctx.restore()}
}

// ------------------------------------------------------------------ ZOMBIE GONFIO (bloater): huge swollen belly full of toxic gas
const GC={skin:'#8aa36a',skinD:'#5d7347',bruise:'#6a4a6e',pus:'#c8f06a',cloth:'#4a3a2a',gas:'150,230,90'};
function gonfio(x,y,face,anim,p,sc){sc=sc||1.1;const t=G.t,{c,s,P,D,F}=V(face),ph=p*TAU,walk=anim==='walk',atk=anim==='attack',idle=anim==='idle';
  // ---- attack timing: .0-.15 breathes in (shrinks), .15-.55 swells and trembles, .55-.62 bursts with a flash, .62-1 deflates with a wobble
  let sw=0,burst=-1,trem=0,flash=0;if(atk){if(p<.15)sw=-.18*ez(p/.15);else if(p<.55){const k=(p-.15)/.4;sw=-.18+1.3*ez(k)+Math.sin(k*40)*.06*k;trem=k}else if(p<.62){const k=(p-.55)/.07;sw=1.12-k*.9;flash=1-k;burst=(p-.55)/.45}else{const k=(p-.62)/.38;sw=.22*Math.cos(k*Math.PI*3)*(1-k);burst=(p-.55)/.45}}
  // ---- one skeleton: everything hangs from the belly centre B, so limbs can never drift away from the body
  // walk: two steps per cycle. Each foot is planted for half the cycle and swings forward for the other half;
  // the belly rides over the planted foot (side shift), drops when a foot lands and squashes, then rises.
  const Rb=12.5+sw*4.6+(idle?Math.sin(ph)*.9:Math.sin(t*2)*.3);
  const step=k=>{const q=((ph/TAU+k)%1+1)%1;return q<.5?{x:3.4-q/.5*6.8,lift:0}:{x:-3.4+ez((q-.5)/.5)*6.8,lift:Math.sin((q-.5)/.5*Math.PI)*2.6}};
  const fL=walk?step(0):{x:0,lift:0},fR=walk?step(.5):{x:0,lift:0};
  const land=walk?Math.pow(Math.abs(Math.cos(ph*2)),6):0,shift=walk?-Math.cos(ph)*1.8:0;
  const sq=land*.07+flash*.1-(walk?0:0),lift=walk?(1-land)*1.4:Math.sin(ph)*.4;
  const tx=Math.sin(t*90+p*200)*trem*.8,B=[0,shift+tx*.2,7+Rb*(1-sq)+lift];// belly centre (x fwd, y right, z up)
  const rx=Rb*(1+sq),rz=Rb*(1-sq);
  const onB=(fx,fy,fz)=>[B[0]+fx*rx,B[1]+fy*rx,B[2]+fz*rz];// point on the belly surface (unit directions)
  shadow(x,y+8*sc,(13+sw*4)*sc,5.2*sc,.34);
  if(burst>=0&&burst<1){for(let i=0;i<9;i++){const a=i*TAU/9+.3,r=(9+burst*21)*sc,q=[x+Math.cos(a)*r,y-14*sc+Math.sin(a)*r*.5-burst*8*sc];ctx.fillStyle=`rgba(${GC.gas},${.45*(1-burst)})`;circ(q[0],q[1],(5+burst*7)*sc);ctx.fill()}}
  ctx.save();ctx.translate(x+tx*sc,y);ctx.scale(sc,sc);const parts=[];
  // legs: from hip sockets under the belly down to the feet
  for(const[sd,f] of[[-1,fL],[1,fR]]){const hip=onB(0,sd*.42,-.9),foot=[f.x,sd*5.6,f.lift];
    parts.push({d:D(foot[0],foot[1])-.5,f:()=>{const h=P(...hip),k=P((hip[0]+foot[0])/2+1.2,(hip[1]+foot[1])/2,(hip[2]+foot[2])/2+.5),fo=P(...foot);quad(h,k,fo,5.2,F(0,sd,1)<0?'#3a2c20':GC.cloth);
      ctx.save();ctx.translate(fo[0],fo[1]);ctx.rotate(Math.atan2(s*.55,c)*.0);ink(1.8);ell(c*1.6,s*.6,4.8,2.8);fs('#1f1b18');ctx.restore()}})}
  // belly
  parts.push({d:D(B[0],B[1]),f:()=>{const m=P(...B);ctx.beginPath();ctx.ellipse(m[0],m[1],rx,rz*.95,0,0,TAU);ctx.fillStyle=GC.skin;ctx.fill();ctx.stroke();
    ctx.save();ctx.clip();ctx.fillStyle=GC.skinD;ell(m[0]+rx*.35,m[1]+rz*.4,rx*.8,rz*.6);ctx.fill();ctx.fillStyle='rgba(255,255,255,.18)';ell(m[0]-rx*.35,m[1]-rz*.45,rx*.35,rz*.2);ctx.fill();ctx.restore();
    // vest strips over the shoulders
    for(const sd of[-1,1]){if(F(0,sd,1)<-.6)continue;const a=P(...onB(.1,sd*.75,.62)),b=P(...onB(.25,sd*.95,-.1));ink(1);ctx.fillStyle=GC.cloth;ctx.beginPath();ctx.moveTo(a[0]-2,a[1]);ctx.lineTo(a[0]+2,a[1]);ctx.lineTo(b[0]+1.5,b[1]);ctx.lineTo(b[0]-1.5,b[1]+2);ctx.closePath();ctx.fill();ctx.stroke()}
    const spots=[[.85,-.3,.3,'b'],[.8,.4,-.1,'p'],[.6,-.7,-.4,'p'],[-.7,.5,.2,'b'],[.3,.85,.4,'p'],[-.5,-.75,-.3,'p'],[.9,.1,-.5,'p']];
    for(const[fx,fy,fz,k] of spots){const v=F(fx,fy,1);if(v<.08)continue;const q=P(...onB(fx,fy,fz)),a=cl(v*2,0,1);ctx.save();ctx.globalAlpha=a;
      if(k==='b'){ctx.fillStyle=GC.bruise;ell(q[0],q[1],3.4*Math.max(.4,v),2.6);ctx.fill()}else{const pr=1.8+Math.max(0,sw)*1.4;shine(GC.gas,q[0],q[1],4+Math.max(0,sw)*3,.25+Math.max(0,sw)*.4);ink(1.1);ctx.fillStyle=GC.pus;circ(q[0],q[1],pr);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';circ(q[0]-.5,q[1]-.6,.5);ctx.fill()}ctx.restore()}
    const fv=F(1,0,1);if(fv>.1){ctx.save();ctx.globalAlpha=cl(fv*2,0,1);ctx.strokeStyle=INK;ctx.lineWidth=1.1;const a=P(...onB(.95,0,.5)),b=P(...onB(1,0,-.4));ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(a[0]+3*c,(a[1]+b[1])/2,b[0],b[1]);for(let i=0;i<4;i++){const k=i/3,xx=a[0]+(b[0]-a[0])*k+1.4*c,yy=a[1]+(b[1]-a[1])*k;ctx.moveTo(xx-1.6,yy-.6);ctx.lineTo(xx+1.6,yy+.6)}ctx.stroke();ctx.restore()}}});
  // arms: short and stubby, from shoulder sockets on the sides of the belly; they swing opposite to the legs
  for(const[sd,f] of[[-1,fR],[1,fL]]){const sh=onB(.15,sd*.9,.3),sw2=walk?-f.x*.5:0,up=atk?Math.max(0,sw)*5:0,
      hd=[sh[0]+2.5+sw2,sh[1]+sd*(3.5+up*.6),sh[2]-6+up+(trem?Math.sin(p*300+sd)*1.4:0)];
    parts.push({d:D(sh[0],sh[1])+.2,f:()=>{const a=P(...sh),b=P(...hd);line(a,b,3.6,F(0,sd,1)<0?GC.skinD:GC.skin);ink(1.6);circ(b[0],b[1],2.6);fs(GC.skin);claws(b,b[0]-a[0],b[1]-a[1],4,ZC.claw)}})}
  // head: sits in a socket on top of the belly and only nods a little
  const neck=onB(.2,0,.92),H=[neck[0]+.5,neck[1],neck[2]+4.2+(walk?land*-.6:0)],R=6;
  parts.push({d:D(H[0],H[1])+.6,f:()=>{const h=P(...H);ctx.beginPath();ctx.arc(h[0],h[1],R,0,TAU);ctx.fillStyle=GC.skin;ctx.fill();ctx.stroke();
    const at=(fx,fy,fz)=>({q:P(H[0]+fx,H[1]+fy,H[2]+fz),v:F(fx,fy,R)});
    for(const sd of[-1,1]){const e=at(4.8,sd*2.4,1);if(e.v<.05)continue;const k=cl(e.v*1.8,0,1);shine('230,255,120',e.q[0],e.q[1],3.6,.5*k);ctx.save();ctx.globalAlpha=k;ctx.fillStyle=ZC.socket;ell(e.q[0],e.q[1],1.8*Math.max(.4,e.v),1.9);ctx.fill();ctx.fillStyle=ZC.eye;circ(e.q[0],e.q[1],.8);ctx.fill();ctx.restore()}
    const m=at(4.8,0,-2.4);if(m.v>.05){const op=atk?.3+Math.max(0,sw)*.7:.35;ctx.save();ctx.globalAlpha=cl(m.v*1.8,0,1);ink(1.2);ctx.fillStyle=ZC.mouth;ell(m.q[0],m.q[1],2.6*Math.max(.4,m.v),1+op*2);ctx.fill();ctx.stroke();ctx.restore()}}});
  run(parts);if(flash>0)shine('220,255,170',0,-B[2],34,flash*.9);ctx.restore()}

// ------------------------------------------------------------------ ZOMBIE STRISCIANTE (crawler): only the upper half, drags itself on its long arms
function strisciante(x,y,face,anim,p,sc){sc=sc||1.1;const t=G.t,{c,s,P,D,F}=V(face),ph=p*TAU,walk=anim==='walk',atk=anim==='attack';
  // attack: .0-.35 rears up on its arms, .35-.65 lunges forward low, .65-1 slumps back
  let rear=0,lunge=0;if(atk){if(p<.35)rear=ez(p/.35);else if(p<.65){const k=ez((p-.35)/.3);rear=1-k;lunge=k*9}else lunge=9*(1-ez((p-.65)/.35))}
  const pull=walk?Math.sin(ph):0,base=lunge+(walk?Math.max(0,-Math.cos(ph))*1.5:0);
  shadow(x+c*base*sc,y+s*base*sc*.55,13*sc,4.6*sc,.36);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const parts=[];
  // trailing spine and rags behind
  parts.push({d:D(base-14,0)-.5,f:()=>{const a=P(base-4,0,5+rear*4),b=P(base-15,Math.sin(t*2)*1.2,1.4);quad(a,P(base-9,0,2.5),b,4,ZC.cloth);ctx.strokeStyle=ZC.bone;ctx.lineWidth=1.4;for(let i=1;i<4;i++){const k=i/4,q=[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k];ctx.beginPath();ctx.moveTo(q[0]-1.4,q[1]-1);ctx.lineTo(q[0]+1.4,q[1]+1);ctx.stroke()}
    ctx.fillStyle=ZC.clothD;ink(1);for(let i=0;i<3;i++){const q=P(base-13+i*2,(i-1)*3,1);ctx.beginPath();ctx.moveTo(q[0],q[1]-2);ctx.lineTo(q[0]-c*4+(i-1),q[1]+1.5);ctx.lineTo(q[0]+1.5,q[1]+1);ctx.closePath();ctx.fill();ctx.stroke()}}});
  // torso, lying low, ribs on the back
  parts.push({d:D(base,0),f:()=>{const m=P(base,0,6+rear*7),hw=Math.hypot(8.6*s,9*c);ctx.beginPath();ctx.ellipse(m[0],m[1],hw,6.4+rear*1.5,0,0,TAU);ctx.fillStyle=ZC.cloth;ctx.fill();ctx.stroke();
    ctx.save();ctx.clip();ctx.fillStyle=ZC.clothD;ell(m[0]+hw*.4,m[1]+3,hw*.8,4);ctx.fill();const bk=Math.max(F(-1,0,1)+.6,0);if(bk>0){ctx.globalAlpha=cl(bk,0,1);ctx.strokeStyle=ZC.bone;ctx.lineWidth=1.3;for(let i=0;i<3;i++){const q=P(base-2.5+i*2.4,0,9+rear*7);ctx.beginPath();ctx.moveTo(q[0]-3.4,q[1]+1);ctx.quadraticCurveTo(q[0],q[1]-1.4,q[0]+3.4,q[1]+1);ctx.stroke()}}ctx.restore()}});
  // long arms reaching and pulling, alternating
  for(const sd of[-1,1]){const k=walk?(sd>0?pull:-pull):0,hx=base+9+k*6+lunge*.6,hz=rear*10+(walk?Math.max(0,k)*2.4:0),sh=[base+3,sd*7,8+rear*8],hd=[hx,sd*(9-rear*2),hz],el=[(sh[0]+hd[0])/2-1,sd*12,(sh[2]+hd[2])/2+5];
    parts.push({d:D(hd[0],hd[1])+.1,f:()=>{const a=P(...sh),e=P(...el),b=P(...hd);line(a,e,4,ZC.skin);line(e,b,3.6,F(0,sd,1)<0?ZC.skinD:ZC.skin);ink(1.6);circ(b[0],b[1],2.8);fs(ZC.skin);claws(b,c,s*.55,5.2,ZC.claw)}})}
  // head: low at the front, staring up, jaw hanging
  const H=[base+9+lunge*.3,0,10+rear*9],R=7.4;parts.push({d:D(H[0],H[1])+.5,f:()=>{const h=P(...H);ctx.beginPath();ctx.arc(h[0],h[1],R,0,TAU);ctx.fillStyle=ZC.skin;ctx.fill();ctx.stroke();ctx.save();ctx.beginPath();ctx.arc(h[0],h[1],R-1.1,0,TAU);ctx.clip();ctx.fillStyle=ZC.skinD;ell(h[0],h[1]+4,R,3.6);ctx.fill();ctx.restore();
    ctx.strokeStyle=INK;ctx.lineWidth=1.1;for(let i=-1;i<=1;i++){const q=P(H[0]-2,i*2,H[2]+R-.5);ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0]-c*3+i,q[1]-2.6);ctx.stroke()}
    const at=(fx,fy,fz)=>({q:P(H[0]+fx,H[1]+fy,H[2]+fz),v:F(fx,fy,R)});
    for(const sd of[-1,1]){const e=at(5.8,sd*2.8,2.2);if(e.v<.05)continue;const k=cl(e.v*1.8,0,1);shine('230,255,120',e.q[0],e.q[1],4.4,.6*k);ctx.save();ctx.globalAlpha=k;ink(1.2);ctx.fillStyle=ZC.socket;ctx.beginPath();ctx.ellipse(e.q[0],e.q[1],2.3*Math.max(.4,e.v),2.6,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=ZC.eye;circ(e.q[0],e.q[1],.9);ctx.fill();ctx.restore()}
    const m=at(5.6,0,-3.2);if(m.v>.05){const op=atk&&p>.25&&p<.7?1:.6+.2*Math.sin(t*4),w=3.6*Math.max(.35,m.v);ctx.save();ctx.globalAlpha=cl(m.v*1.8,0,1);ink(1.4);ctx.fillStyle=ZC.mouth;ctx.beginPath();ctx.ellipse(m.q[0],m.q[1]+op,w,1.6+op*2.4,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=ZC.bone;ink(.8);for(let i=0;i<3;i++){const xx=m.q[0]-w*.6+i*w*.6,yy=m.q[1]-.6;ctx.beginPath();ctx.moveTo(xx-.7,yy);ctx.lineTo(xx,yy+1.8);ctx.lineTo(xx+.7,yy);ctx.closePath();ctx.fill();ctx.stroke()}ctx.restore()}}});
  run(parts);ctx.restore()}

// ------------------------------------------------------------------ ZOMBIE MINATORE: helmet with a lamp, overalls, rusty pickaxe
const MC={helm:'#d9a628',helmD:'#9a7418',over:'#3e5a7a',overD:'#2a3e56',wood:'#6b4a2a',iron:'#7a8088'};
function minatore(x,y,face,anim,p,sc){sc=sc||1.1;const t=G.t,{c,s,P,D,F}=V(face),ph=p*TAU,walk=anim==='walk',atk=anim==='attack';
  // attack: .0-.18 crouches and swings the pick back, .18-.42 raises it high (overshoot), .42-.5 smashes down,
  // .5-.68 stuck in the ground with a jolt, .68-.84 tugs at it, .84-1 pulls it out
  let a=-.9+(walk?Math.sin(ph+.6)*.28:Math.sin(t*1.2)*.05),hit=-1,crouch=0,lunge=0,jolt=0;
  if(atk){if(p<.18){const k=ez(p/.18);a=-.9-k*.35;crouch=k*1.6}else if(p<.42){const k=(p-.18)/.24,o=1+2.2*Math.pow(k-1,3)+1.2*Math.pow(k-1,2);a=-1.25+o*3.55;crouch=1.6*(1-k)}
    else if(p<.5){const k=(p-.42)/.08;a=2.3-k*3.65;lunge=k*3}else if(p<.68){const k=(p-.5)/.18;a=-1.35;lunge=3;jolt=1-k;hit=k*.6}
    else if(p<.84){const k=(p-.68)/.16;a=-1.35+Math.sin(k*Math.PI*3)*.12;lunge=3-k*1.5}else{const k=ez((p-.84)/.16);a=-1.35+k*.45;lunge=1.5*(1-k)}}
  // walk: stiff lurching gait, the head lags behind each step and the pick swings in the hand
  const bob=(walk?Math.abs(Math.sin(ph))*1.6:Math.sin(ph)*.4)-crouch-jolt*1.2,roll=walk?Math.sin(ph)*1.5:Math.sin(t*1.3)*.5,lean=4+lunge+(walk?Math.cos(ph*2)*1.2:0);
  shadow(x,y+8*sc,11*sc,4.4*sc,.34);
  // the lamp's beam on the floor in front
  if(!LOWFX){const q=V(face).P(26,0,0);ctx.save();ctx.globalCompositeOperation='lighter';glow('255,230,150',x+q[0]*sc,y+q[1]*sc+6*sc,16*sc,.22+.04*Math.sin(t*9),7*sc);ctx.restore()}
  ctx.save();ctx.translate(x+Math.sin(p*400)*jolt*.8*sc,y-bob*sc);ctx.scale(sc,sc);const parts=[];
  for(const sd of[-1,1]){const st=walk?Math.sin(ph+(sd>0?Math.PI:0))*4.5:0,fx=st,fy=sd*4.2;parts.push({d:D(fx,fy)-.5,f:()=>{const h=P(0,sd*3.4,8),f=P(fx,fy,walk?Math.max(0,Math.sin(ph+(sd>0?Math.PI:0)))*2:0);line(h,f,4.4,MC.overD);ctx.save();ctx.translate(f[0],f[1]);ink(1.8);ell(c*1.4,0,4.6,2.8);fs('#3a2a1a');ctx.restore()}})}
  // overalls with straps, a torn knee, coal dust
  const T=[lean*.3,roll*.5];parts.push({d:D(T[0],T[1]),f:()=>{const m=P(T[0],T[1],15),hw=Math.hypot(9.4*s,6.2*c),top=m[1]-9,bot=m[1]+8;
    ctx.beginPath();ctx.moveTo(m[0]-hw,bot);ctx.quadraticCurveTo(m[0]-hw-1.5,top+3,m[0]-hw*.4,top);ctx.quadraticCurveTo(m[0],top-1.5,m[0]+hw*.4,top);ctx.quadraticCurveTo(m[0]+hw+1.5,top+3,m[0]+hw,bot);ctx.quadraticCurveTo(m[0],bot+3,m[0]-hw,bot);ctx.closePath();ctx.fillStyle='#6a6458';ctx.fill();ctx.stroke();
    ctx.save();ctx.clip();ctx.fillStyle=MC.over;ctx.fillRect(m[0]-hw-2,m[1]-2,hw*2+4,14);ctx.fillStyle=MC.overD;ell(m[0]+hw*.5,m[1]+4,hw*.6,5);ctx.fill();
    for(const sd of[-1,1]){const a1=P(T[0]+(F(1,0,1)>0?5:-5),T[1]+sd*4.6,23),b1=P(T[0]+(F(1,0,1)>0?5.8:-5.8),T[1]+sd*4,14);ctx.strokeStyle=MC.over;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(a1[0],a1[1]);ctx.lineTo(b1[0],b1[1]);ctx.stroke();ctx.fillStyle='#c9a040';circ(b1[0],b1[1],.9);ctx.fill()}
    ctx.fillStyle='rgba(20,18,16,.35)';for(let i=0;i<5;i++)circ(m[0]-hw*.6+i*hw*.3,m[1]-4+(i%2)*3,1.2),ctx.fill();ctx.restore()}});
  // left arm hangs and swings; right arm holds the pickaxe
  {const sh=[T[0],-8.4+T[1],20.5],hd=[T[0]+6,-9.6+T[1],12+(walk?Math.sin(ph)*2:0)];parts.push({d:(D(sh[0],sh[1])+D(hd[0],hd[1]))/2+.2,f:()=>{const a1=P(...sh),b=P(...hd);quad(a1,P(sh[0]+1,sh[1]-1.6,16),b,4.2,F(0,-1,1)<0?ZC.skinD:ZC.skin);ink(1.6);circ(b[0],b[1],2.7);fs(ZC.skin);claws(b,b[0]-a1[0],b[1]-a1[1],4.6,ZC.claw)}})}
  {const hd=[T[0]+7,8+T[1],15+(atk?Math.max(0,Math.sin(a))*8:0)],dir=[Math.cos(a)*.95,.12,Math.sin(a)],pt=k=>[hd[0]+dir[0]*k,hd[1]+dir[1]*k,hd[2]+dir[2]*k],sh=[T[0],8.4+T[1],20.5];
    parts.push({d:(D(hd[0],hd[1])+D(pt(16)[0],pt(16)[1]))/2+.4,f:()=>{const a1=P(...sh),b=P(...hd),h0=P(...pt(-4)),h1=P(...pt(17));line(h0,h1,2.4,MC.wood);
      // pick head: two curved spikes across the top of the handle
      const top=pt(16),u=[-dir[2],0,dir[0]],L=7.5,e1=P(top[0]+u[0]*L+dir[0]*1.5,top[1],top[2]+u[2]*L+dir[2]*1.5),e2=P(top[0]-u[0]*L+dir[0]*1.5,top[1],top[2]-u[2]*L+dir[2]*1.5),tc=P(...top),tc2=P(...pt(19));
      ink(1.8);ctx.fillStyle=MC.iron;ctx.beginPath();ctx.moveTo(e1[0],e1[1]);ctx.quadraticCurveTo(tc2[0],tc2[1],e2[0],e2[1]);ctx.quadraticCurveTo(tc[0],tc[1],e1[0],e1[1]);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='rgba(120,60,30,.6)';circ((e1[0]+tc[0])/2,(e1[1]+tc[1])/2,1);ctx.fill();
      quad(a1,P(sh[0]+2,sh[1]+2,16),b,4.2,F(0,1,1)<0?ZC.skinD:ZC.skin);ink(1.6);circ(b[0],b[1],2.8);fs(ZC.skin)}})}
  // head with a miner's helmet and a lit lamp
  const H=[T[0]+lean*.5,T[1]*1.3+(walk?Math.sin(ph-1)*1.2:Math.sin(t*1.5)*.8),27.5+(walk?Math.sin(ph*2-1.6)*.8:0)-crouch*.4],R=8.2;parts.push({d:D(H[0],H[1])+.4,f:()=>{const h=P(...H);ctx.beginPath();ctx.arc(h[0],h[1],R,0,TAU);ctx.fillStyle=ZC.skin;ctx.fill();ctx.stroke();ctx.save();ctx.beginPath();ctx.arc(h[0],h[1],R-1.1,0,TAU);ctx.clip();ctx.fillStyle=ZC.skinD;ell(h[0],h[1]+4.6,R,4);ctx.fill();ctx.restore();
    const at=(fx,fy,fz)=>({q:P(H[0]+fx,H[1]+fy,H[2]+fz),v:F(fx,fy,R)});
    for(const sd of[-1,1]){const e=at(6.6,sd*3.2,-.4);if(e.v<.05)continue;const k=cl(e.v*1.8,0,1);ctx.save();ctx.globalAlpha=k;ink(1.3);ctx.fillStyle=ZC.socket;ctx.beginPath();ctx.ellipse(e.q[0],e.q[1],2.4*Math.max(.4,e.v),2.4,0,0,TAU);ctx.fill();ctx.stroke();if(sd>0){shine('230,255,120',e.q[0],e.q[1],4,.5*k);ctx.fillStyle=ZC.eye;circ(e.q[0],e.q[1],.9);ctx.fill()}ctx.restore()}
    const m=at(6.4,0,-4.4);if(m.v>.05){const op=atk&&p>.35&&p<.6?1:.4;ctx.save();ctx.globalAlpha=cl(m.v*1.8,0,1);ink(1.3);ctx.fillStyle=ZC.mouth;ell(m.q[0],m.q[1],3.4*Math.max(.4,m.v),1.2+op*1.8);ctx.fill();ctx.stroke();ctx.fillStyle=ZC.bone;ctx.fillRect(m.q[0]-1.4,m.q[1]-1,1.2,1.4);ctx.fillRect(m.q[0]+.6,m.q[1]-1,1.2,1.6);ctx.restore()}
    // helmet: dome + brim, all around the head
    const hb=P(H[0],H[1],H[2]+2.6),bw=R+2.6;ink(2);ctx.fillStyle=MC.helmD;ctx.beginPath();ctx.ellipse(hb[0],hb[1],bw,3,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle=MC.helm;ctx.beginPath();ctx.ellipse(hb[0],hb[1]-.6,R+.4,R*.85,0,Math.PI,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle=MC.helmD;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(hb[0]-s*0,hb[1]-R*.85);ctx.lineTo(hb[0],hb[1]-1);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.3)';ell(hb[0]-3,hb[1]-R*.55,2.4,1.2);ctx.fill();
    // lamp on the front of the helmet
    const l=at(R*.8,0,5.4);if(l.v>-.35){const k=cl((l.v+.35)*1.6,0,1);ctx.save();ctx.globalAlpha=k;shine('255,230,150',l.q[0],l.q[1],8,.7*k);ink(1.3);ctx.fillStyle='#5a5f68';circ(l.q[0],l.q[1],2.6);ctx.fill();ctx.stroke();ctx.fillStyle='#fff6c8';circ(l.q[0],l.q[1],1.6*Math.max(.3,l.v));ctx.fill();ctx.restore()}}});
  run(parts);ctx.restore();
  // pickaxe hits the floor: sparks and chips of stone
  if(hit>=0&&hit<.6){const q=V(face).P(T[0]+7+Math.cos(-1.3)*.95*17,8.6,0),ix=x+q[0]*sc,iy=y+q[1]*sc+6*sc,k=hit/.6;ctx.save();for(let i=0;i<7;i++){const an=-Math.PI*.15-i*.45,r=(4+k*16)*sc;ctx.strokeStyle=`rgba(255,${200+i*8},120,${1-k})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(ix+Math.cos(an)*r*.6,iy+Math.sin(an)*r*.6);ctx.lineTo(ix+Math.cos(an)*r,iy+Math.sin(an)*r);ctx.stroke()}
    ctx.fillStyle=`rgba(90,80,70,${1-k})`;for(let i=0;i<4;i++)circ(ix+(i-1.5)*5*sc*k,iy-Math.sin(k*Math.PI)*8*sc+i,1.4*sc),ctx.fill();ctx.restore()}}

return {zombie,hound,becchino,gonfio,strisciante,minatore};
})();
