// =====================================================================
// THE ZOMBIE MENU: THE CAMPFIRE (punto 45 del piano di Denis: «il personaggio equipaggiato seduto su un tronco davanti a un falò, l'arma
// accanto, fiamme, scintille, braci, luce che trema, ombre; zombie che camminano in lontananza, si fermano, girano la testa, guardano il
// personaggio o la telecamera; nebbia leggera, ambiente abbandonato, suoni lontani, luce soffusa»). Drawn in the home canvas by drawCamp
// when the menu is in the Zombie mode, in the same space as the classic scene (360 wide, the hero's feet at HOME_Y, his scale hs), so the
// menu's buttons fall in the same places.
// - Far away (painted once in a picture): the night sky, the far hills, dead trees, the farmhouse in ruins with one weak light inside, the
//   windmill, the dirt path. In front of the path (a second picture): the broken fence, the graves, the tall grass.
// - Live: the moon and the clouds passing over it, the windmill's blades, the zombies on the path (the CR models, small because far: they
//   walk, stop, snap round to look at us, walk on), the fog, crows now and then.
// - The camp, in 3D with the monsters' camera (V(0): screen = x, y·0.55 − z) at the hero's scale: the log the hero sits on (EROE 'sit'),
//   the ring of stones with the burning logs, the flames, sparks and embers, the smoke, the gun leaning on the log (ARMI3D), the backpack.
// - The light: the night darkness with a hole where the fire is (it breathes and flickers) and the fire's warm light on what is near.
// LOWFX: no fog, no smoke, fewer sparks, no crows; the scene stays the same.
// =====================================================================
const FALO={bg:null,fence:null,key:'',t:0,sparks:[],embers:[],smoke:[],crows:[],crowT:6,Z:[],zT:0,blades:0,
  // the camp in the room, in the hero's units, round the hero (0, 0): the fire in front of him on the right, he looks at it
  fire:[10,17],face:Math.atan2(17,10),seat:7.4,gun:'pistola',up:7};
let drawFalo=()=>{};
{const ZR=CR._rig,{cl,lerp,add,mul,nrm,seg,hull,rim}=ZR;
// a small random that repeats (the painting is the same every time)
function zfRand(seed){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
// ------------------------------------------------------------------ the far picture: sky, hills, trees, the farmhouse, the windmill, the path
const ZFX0=-30,ZFY0=-330,ZFW=420,ZFH=600,ZFK=2;
function zfBack(){if(FALO.bg)return FALO.bg;const c=document.createElement('canvas');c.width=ZFW*ZFK;c.height=ZFH*ZFK;const x=c.getContext('2d');
  x.scale(ZFK,ZFK);x.translate(-ZFX0,-ZFY0);const R=zfRand(7),rr=(a,b)=>a+R()*(b-a);
  // the sky: almost black at the top, a sick green glow low on the horizon
  let g=x.createLinearGradient(0,ZFY0,0,124);g.addColorStop(0,'#020407');g.addColorStop(.45,'#081214');g.addColorStop(.8,'#15241c');g.addColorStop(1,'#283a2c');
  x.fillStyle=g;x.fillRect(ZFX0,ZFY0,ZFW,ZFH);
  for(let i=0;i<170;i++){const sx=rr(ZFX0,ZFX0+ZFW),sy=rr(ZFY0,60),k=1-(sy-ZFY0)/(60-ZFY0),a=(.15+.55*R())*(.35+.65*k);x.fillStyle=`rgba(225,235,220,${a.toFixed(3)})`;x.fillRect(sx,sy,R()<.08?1.6:1,R()<.08?1.6:1)}
  // far hills, the farthest lighter (the mist), with a few dead trees on the crest
  const ridge=(y0,amp,col,seed,trees)=>{const Q=zfRand(seed),pts=[];for(let px=ZFX0;px<=ZFX0+ZFW+12;px+=12)pts.push([px,y0-Math.abs(Math.sin(px*.021+seed))*amp-Q()*amp*.25]);
    x.beginPath();x.moveTo(ZFX0,200);for(const p of pts)x.lineTo(p[0],p[1]);x.lineTo(ZFX0+ZFW,200);x.closePath();x.fillStyle=col;x.fill();
    if(trees)for(let i=0;i<trees;i++){const p=pts[Math.floor(Q()*pts.length)];zfDeadTree(x,p[0],p[1]+1,8+Q()*10,col,Q)}};
  {const hg=x.createLinearGradient(0,40,0,112);hg.addColorStop(0,'rgba(60,90,70,0)');hg.addColorStop(1,'rgba(60,90,70,.22)');x.fillStyle=hg;x.fillRect(ZFX0,40,ZFW,72)}
  ridge(92,16,'#101b17',3,0);ridge(104,12,'#0c1512',9,7);
  // the windmill on the right, its tower tapering, the cap; the blades turn live (zfMill)
  {const mx=304,my=118,h=74,b=13,tp=6;x.fillStyle='#0b1311';x.beginPath();x.moveTo(mx-b,my);x.lineTo(mx-tp,my-h);x.lineTo(mx+tp,my-h);x.lineTo(mx+b,my);x.closePath();x.fill();
    x.strokeStyle='rgba(160,190,170,.16)';x.lineWidth=1;x.beginPath();x.moveTo(mx-b+.6,my);x.lineTo(mx-tp+.4,my-h);x.stroke();// the moon on its left edge
    x.strokeStyle='rgba(0,0,0,.35)';for(let k=1;k<5;k++){const yy=my-h*k/5,w=lerp(b,tp,k/5);x.beginPath();x.moveTo(mx-w,yy);x.lineTo(mx+w,yy);x.stroke()}
    x.fillStyle='#0e1715';x.beginPath();x.moveTo(mx-tp-3,my-h);x.quadraticCurveTo(mx,my-h-12,mx+tp+3,my-h);x.closePath();x.fill();
    x.fillStyle='rgba(255,170,90,.12)';x.fillRect(mx-2,my-h*.45,4,6)}
  // the farmhouse in ruins on the left: the gable, the roof fallen in on one side, broken planks, an empty window and one with a weak light
  {const hx=62,hy=124,w=70,h=34,rh=26;x.fillStyle='#0d1513';x.beginPath();x.moveTo(hx,hy);x.lineTo(hx,hy-h);x.lineTo(hx+w*.42,hy-h-rh);x.lineTo(hx+w*.62,hy-h-rh+6);
    x.lineTo(hx+w*.7,hy-h-6);x.lineTo(hx+w*.8,hy-h+2);x.lineTo(hx+w,hy-h+6);x.lineTo(hx+w,hy);x.closePath();x.fill();
    x.strokeStyle='rgba(170,200,175,.2)';x.lineWidth=1;x.beginPath();x.moveTo(hx+w*.42,hy-h-rh);x.lineTo(hx+w*.62,hy-h-rh+6);x.moveTo(hx+w,hy-h+6);x.lineTo(hx+w,hy);x.stroke();
    x.strokeStyle='#0a100e';x.lineWidth=1.6;for(const[a,b2,c2,d] of[[hx+w*.62,hy-h-rh+6,hx+w*.86,hy-h-14],[hx+w*.66,hy-h-rh+10,hx+w*.9,hy-h-7],[hx+w*.7,hy-h-6,hx+w*.95,hy-h-16]]){x.beginPath();x.moveTo(a,b2);x.lineTo(c2,d);x.stroke()}
    x.fillStyle='#050807';x.fillRect(hx+8,hy-h+10,10,12);x.fillRect(hx+44,hy-h+8,10,11);x.fillRect(hx+27,hy-16,11,16);
    const wg=x.createRadialGradient(hx+49,hy-h+13,0,hx+49,hy-h+13,9);wg.addColorStop(0,'rgba(255,160,70,.55)');wg.addColorStop(1,'rgba(255,120,40,0)');x.fillStyle=wg;x.fillRect(hx+38,hy-h+2,22,22);
    x.fillStyle='rgba(255,170,90,.5)';x.fillRect(hx+46,hy-h+11,4,6);x.strokeStyle='#050807';x.lineWidth=1.2;x.beginPath();x.moveTo(hx+44,hy-h+13.5);x.lineTo(hx+54,hy-h+13.5);x.moveTo(hx+49,hy-h+8);x.lineTo(hx+49,hy-h+19);x.stroke();
    x.fillStyle='#0b1210';x.fillRect(hx+w*.18,hy-h-rh+4,6,14)}
  // dead trees nearer, black against the sky
  zfDeadTree(x,24,128,46,'#070c0a',zfRand(31),1.4);zfDeadTree(x,232,122,30,'#08100d',zfRand(44),1);zfDeadTree(x,352,130,52,'#060a09',zfRand(57),1.5);
  // the ground beyond the fence, the path where the zombies walk
  g=x.createLinearGradient(0,112,0,260);g.addColorStop(0,'#141e19');g.addColorStop(.25,'#111915');g.addColorStop(1,'#0c120f');x.fillStyle=g;x.fillRect(ZFX0,118,ZFW,ZFH);
  x.fillStyle='#2a2a22';x.beginPath();x.moveTo(ZFX0,128);for(let px=ZFX0;px<=ZFX0+ZFW;px+=10)x.lineTo(px,126+Math.sin(px*.05)*1.6);for(let px=ZFX0+ZFW;px>=ZFX0;px-=10)x.lineTo(px,135+Math.sin(px*.04+1)*1.4);x.closePath();x.fill();
  x.fillStyle='rgba(120,130,110,.08)';for(let i=0;i<60;i++){x.fillRect(rr(ZFX0,ZFX0+ZFW),rr(126,135),rr(1,3),.8)}
  // grass in the field: short dark strokes, denser near us
  x.lineCap='round';for(let i=0;i<900;i++){const gx=rr(ZFX0,ZFX0+ZFW),gy=rr(136,262),k=(gy-136)/126,l=2+k*5;if(gy<138&&R()<.5)continue;x.strokeStyle=R()<.5?'#18241c':'#0e1612';x.lineWidth=.8+k*.6;
    x.beginPath();x.moveTo(gx,gy);x.lineTo(gx+rr(-1.4,1.4),gy-l);x.stroke()}
  for(let i=0;i<40;i++){x.strokeStyle='rgba(60,80,62,.5)';x.lineWidth=.7;const gx=rr(ZFX0,ZFX0+ZFW),gy=rr(140,262);x.beginPath();x.moveTo(gx,gy);x.lineTo(gx+rr(-1,1),gy-rr(3,7));x.stroke()}
  return FALO.bg=c}
function zfDeadTree(x,tx,ty,h,col,Q,w){w=w||1;x.strokeStyle=col;x.lineCap='round';const br=(px,py,a,l,lw,d)=>{if(d>4||l<2)return;const ex=px+Math.cos(a)*l,ey=py+Math.sin(a)*l;x.lineWidth=lw;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo((px+ex)/2+(Q()-.5)*l*.3,(py+ey)/2,ex,ey);x.stroke();
    const n=d<1?3:2;for(let i=0;i<n;i++)br(ex,ey,a+(Q()-.5)*1.4+(i-(n-1)/2)*.5,l*(.55+Q()*.2),lw*.6,d+1)};br(tx,ty,-Math.PI/2+(Q()-.5)*.2,h*.45,2.6*w,0)}
// ------------------------------------------------------------------ the picture in front of the path: the broken fence, graves, tall grass
function zfFence(){if(FALO.fence)return FALO.fence;const c=document.createElement('canvas');c.width=ZFW*ZFK;c.height=ZFH*ZFK;const x=c.getContext('2d');
  x.scale(ZFK,ZFK);x.translate(-ZFX0,-ZFY0);const R=zfRand(19),rr=(a,b)=>a+R()*(b-a);x.lineCap='round';x.lineJoin='round';
  const plank=(a,b,w,col)=>{x.strokeStyle='#050806';x.lineWidth=w+1.6;x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke();x.strokeStyle=col;x.lineWidth=w;x.stroke();
    x.strokeStyle='rgba(170,190,170,.12)';x.lineWidth=.7;x.beginPath();x.moveTo(a[0],a[1]-w*.3);x.lineTo(b[0],b[1]-w*.3);x.stroke()};
  // posts every ~26 units, some leaning, two missing; two rails, broken here and there, one plank hanging
  const posts=[];for(let px=-18;px<=378;px+=rr(22,30)){if(R()<.12)continue;posts.push([px,146+rr(-1.5,1.5),rr(-.18,.18)])}
  for(const[px,py,lean] of posts){const top=[px+Math.sin(lean)*16,py-16];plank([px,py],top,3.2,'#2a2620')}
  for(let i=0;i<posts.length-1;i++){const a=posts[i],b=posts[i+1];if(R()<.2)continue;for(const h of[5.5,11.5]){if(R()<.15)continue;const pa=[a[0]+Math.sin(a[2])*h,a[1]-h],pb=[b[0]+Math.sin(b[2])*h,b[1]-h];
      if(R()<.2){const m=[lerp(pa[0],pb[0],.55),lerp(pa[1],pb[1],.55)+rr(2,6)];plank(pa,m,2.4,'#332c22')}else plank(pa,pb,2.4,'#332c22')}}
  // graves on the left and right: a stone with a rounded top, two wooden crosses leaning
  const stone=(gx,gy,w,h)=>{x.fillStyle='#1d2421';x.strokeStyle='#050806';x.lineWidth=1.4;x.beginPath();x.moveTo(gx-w/2,gy);x.lineTo(gx-w/2,gy-h+w/2);x.arc(gx,gy-h+w/2,w/2,Math.PI,0);x.lineTo(gx+w/2,gy);x.closePath();x.fill();x.stroke();
    x.strokeStyle='rgba(160,190,170,.18)';x.beginPath();x.arc(gx,gy-h+w/2,w/2-1.2,Math.PI*1.05,Math.PI*1.5);x.stroke();x.fillStyle='rgba(0,0,0,.35)';x.fillRect(gx-w*.2,gy-h*.55,w*.4,1.2)};
  const cross=(gx,gy,h,lean)=>{const t=[gx+Math.sin(lean)*h,gy-h];plank([gx,gy],t,2.2,'#2e271e');const cy=gy-h*.72,cx=gx+Math.sin(lean)*h*.72;plank([cx-4.5,cy+lean*3],[cx+4.5,cy-lean*3],1.8,'#2e271e')};
  stone(30,160,11,15);cross(52,158,16,.14);stone(330,162,12,16);cross(312,160,15,-.2);cross(286,155,12,.25);
  // tall grass clumps along the fence
  for(let i=0;i<70;i++){const gx=rr(-20,380),gy=rr(147,158),n=3+Math.floor(R()*4);for(let k=0;k<n;k++){const l=rr(5,11);x.strokeStyle=R()<.5?'#121b15':'#0b120e';x.lineWidth=1.1;x.beginPath();x.moveTo(gx+k*1.2,gy);x.quadraticCurveTo(gx+k*1.2+rr(-2,2),gy-l*.6,gx+k*1.2+rr(-4,4),gy-l);x.stroke()}}
  return FALO.fence=c}
// ------------------------------------------------------------------ the zombies on the path: walk, stop, snap round to look at us, walk on
const ZFKIND=['zombie','strisciante','zombie','minatore'];
function zfWalker(i,mid){const dir=Math.random()<.5?1:-1;return{kind:ZFKIND[i%ZFKIND.length],x:mid?80+Math.random()*200:dir>0?-14-Math.random()*20:374+Math.random()*20,y:129+Math.random()*4,dir,face:dir>0?0:Math.PI,
  st:'walk',t:0,next:2+Math.random()*5,p:Math.random(),spd:6+Math.random()*4,look:0}}
function zfZombies(dt){const Z=FALO.Z;if(!FALO.zInit){FALO.zInit=1;Z.push(zfWalker(0,1))}if(Z.length<3&&(FALO.zT-=dt)<=0){Z.push(zfWalker(Z.length+Math.floor(Math.random()*4)));FALO.zT=4+Math.random()*7}
  for(let i=Z.length-1;i>=0;i--){const z=Z[i];z.t+=dt;
    if(z.st==='walk'){z.x+=z.dir*z.spd*dt;z.p=(z.p+dt/1.7)%1;if(z.t>z.next&&(z.x>40&&z.x<112||z.x>212&&z.x<320)){z.st='stop';z.t=0;z.next=.8+Math.random()*1.2}
      if(z.x<-70||z.x>430)Z.splice(i,1)}
    else if(z.st==='stop'){z.p=(z.p+dt/2.4)%1;if(z.t>z.next){z.st='look';z.t=0;z.next=1.6+Math.random()*2;z.look=Math.random()<.5?1:2;sndZGroan(z)}}// it snaps round
    else if(z.st==='look'){z.p=(z.p+dt/2.4)%1;if(z.t>z.next){z.st='back';z.t=0}}
    else if(z.st==='back'){z.p=(z.p+dt/2.4)%1;if(z.t>.5){z.st='walk';z.t=0;z.next=4+Math.random()*6}}
    // where it faces: along the path; at the look it turns to us (or to the hero by the fire) in a moment, back slowly
    const tgt=z.st==='look'?(z.look===1?Math.PI/2:Math.atan2(40,(FALO.hx||156)-z.x)):z.dir>0?0:Math.PI,k=z.st==='look'?Math.min(1,dt*14):Math.min(1,dt*3);
    let d=tgt-z.face;d=Math.atan2(Math.sin(d),Math.cos(d));z.face+=d*k}}
// a far groan, panned where the zombie stands (the audio may not be open yet: then nothing)
function sndZGroan(z){try{if(!AU.ctx||!AU.on.sfx||$('menu').hidden)return;const c=AU.ctx,t=c.currentTime,pan=c.createStereoPanner?c.createStereoPanner():null,g=c.createGain(),o=c.createOscillator(),f=c.createBiquadFilter();
  o.type='sawtooth';const f0=70+Math.random()*30;o.frequency.setValueAtTime(f0,t);o.frequency.linearRampToValueAtTime(f0*.78,t+1.1);f.type='lowpass';f.frequency.value=420;f.Q.value=6;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05*VOLS(),t+.25);g.gain.linearRampToValueAtTime(0,t+1.3);o.connect(f);f.connect(g);
  if(pan){pan.pan.value=cl((z.x-180)/180,-1,1)*.8;g.connect(pan);pan.connect(AU.sfxBus)}else g.connect(AU.sfxBus);o.start(t);o.stop(t+1.4)}catch(e){}}
// ------------------------------------------------------------------ the camp in 3D, at the hero's scale (room units: the hero is ~37 tall)
// the log the hero sits on, across his facing: bark in three tones, moss, the sawn end with its rings toward us
function zfLog(V0,C,ax,L,r,lit){const{P}=V0,a3=add(C,mul(ax,L/2)),b3=add(C,mul(ax,-L/2)),A=P(a3),B=P(b3);
  ink(2.6);hull(A,r,B,r);ctx.fillStyle='#6a4c32';ctx.fill();ctx.stroke();
  ctx.save();hull(A,r-.2,B,r-.2);ctx.clip();
  // dark underside, warm lit top (the fire is on the right), bark lines along it
  const dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,s=ny<0?1:-1;
  ctx.fillStyle='rgba(12,8,6,.5)';ctx.beginPath();ctx.moveTo(A[0]-nx*s*r*.15,A[1]-ny*s*r*.15);ctx.lineTo(B[0]-nx*s*r*.15,B[1]-ny*s*r*.15);ctx.lineTo(B[0]-nx*s*r*1.2,B[1]-ny*s*r*1.2);ctx.lineTo(A[0]-nx*s*r*1.2,A[1]-ny*s*r*1.2);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(20,12,8,.5)';ctx.lineWidth=.8;for(const o of[-.55,-.2,.15,.5]){ctx.beginPath();ctx.moveTo(A[0]+nx*r*o+dx*.04,A[1]+ny*r*o+dy*.04);ctx.quadraticCurveTo((A[0]+B[0])/2+nx*r*(o+.08),(A[1]+B[1])/2+ny*r*(o+.08),B[0]+nx*r*o-dx*.04,B[1]+ny*r*o-dy*.04);ctx.stroke()}
  ctx.strokeStyle=`rgba(255,214,160,${(.3*lit).toFixed(3)})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(A[0]+nx*s*r*.62,A[1]+ny*s*r*.62);ctx.lineTo(B[0]+nx*s*r*.62,B[1]+ny*s*r*.62);ctx.stroke();
  // moss on the top, a knot
  ctx.fillStyle='rgba(70,96,52,.75)';for(const k of[.18,.3,.62]){const q=[lerp(A[0],B[0],k)+nx*s*r*.45,lerp(A[1],B[1],k)+ny*s*r*.45];ell(q[0],q[1],2.6,1.2,Math.atan2(dy,dx));ctx.fill()}
  {const q=[lerp(A[0],B[0],.78),lerp(A[1],B[1],.78)];ctx.strokeStyle='rgba(20,12,8,.6)';ctx.lineWidth=.9;ell(q[0],q[1],1.4,.9);ctx.stroke()}
  ctx.restore();rim(A,r,B,r,.2);
  // the sawn end toward us (the lower one on the screen): rings, a crack
  const E=A[1]>B[1]?a3:b3,Eq=P(E);ink(2);ctx.fillStyle='#b88a5a';ctx.beginPath();ctx.ellipse(Eq[0],Eq[1],r*.62,r*.98,Math.atan2(dy,dx)*.2,0,TAU);ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(110,70,40,.55)';ctx.lineWidth=.7;for(const k of[.7,.45,.22]){ctx.beginPath();ctx.ellipse(Eq[0],Eq[1],r*.62*k,r*.98*k,0,0,TAU);ctx.stroke()}
  ctx.strokeStyle='rgba(40,24,12,.7)';ctx.lineWidth=.9;seg([Eq[0],Eq[1]],[Eq[0]+r*.5,Eq[1]-r*.6]);ctx.stroke()}
// one stone of the fire ring: a lump in three tones, warm on the side toward the fire, cold moon on top
function zfStone(V0,c3,r,toFire,fl){const{P}=V0,q=P(c3);ink(1.8);ctx.fillStyle='#4c4a46';ctx.beginPath();ctx.ellipse(q[0],q[1],r*1.15,r*.8,0,0,TAU);ctx.fill();ctx.stroke();
  ctx.save();ctx.beginPath();ctx.ellipse(q[0],q[1],r*1.15-.6,r*.8-.6,0,0,TAU);ctx.clip();ctx.fillStyle='rgba(10,10,12,.35)';ell(q[0]+r*.3,q[1]+r*.45,r*1.1,r*.6);ctx.fill();
  ctx.fillStyle='rgba(190,210,200,.16)';ell(q[0]-r*.35,q[1]-r*.4,r*.6,r*.3);ctx.fill();
  const fx=q[0]+toFire[0]*r*.7,fy=q[1]+toFire[1]*r*.5;const g=ctx.createRadialGradient(fx,fy,0,fx,fy,r*1.3);g.addColorStop(0,`rgba(255,150,70,${(.6*fl).toFixed(3)})`);g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.fillRect(q[0]-r*2,q[1]-r*2,r*4,r*4);ctx.restore()}
// a burning log in the fire, from the rim to the middle: bark, the inner end glowing
function zfFireLog(V0,a3,b3,r,fl,t){const{P}=V0,A=P(a3),B=P(b3);ink(2);hull(A,r,B,r);ctx.fillStyle='#3a2a1e';ctx.fill();ctx.stroke();
  ctx.save();hull(A,r-.3,B,r-.3);ctx.clip();const g=ctx.createLinearGradient(A[0],A[1],B[0],B[1]);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.55,'rgba(80,30,10,.5)');g.addColorStop(1,`rgba(255,${120+60*fl|0},40,${(.85*fl).toFixed(3)})`);ctx.fillStyle=g;ctx.fillRect(Math.min(A[0],B[0])-r*2,Math.min(A[1],B[1])-r*2,Math.abs(B[0]-A[0])+r*4,Math.abs(B[1]-A[1])+r*4);
  ctx.strokeStyle=`rgba(255,200,90,${(.5*fl).toFixed(3)})`;ctx.lineWidth=.6;for(let i=0;i<3;i++){const k=.62+i*.12;ctx.beginPath();ctx.moveTo(lerp(A[0],B[0],k)-r*.5,lerp(A[1],B[1],k)-r*.3);ctx.lineTo(lerp(A[0],B[0],k)+r*.3,lerp(A[1],B[1],k)+r*.4);ctx.stroke()}ctx.restore()}
// the flames: tongues that sway and lick up, three layers (red, orange, yellow) and the white heart
function zfFlames(q,s,t,fl){const T=[[-3.2,10,1.3,0],[3,11,1.1,1.7],[-.6,15,1.5,3.1],[1.6,12.5,1.2,4.6],[-2,8,1,5.9]];
  if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,120,40',q[0],q[1]-6*s,22*s*fl,.55*fl);glow('255,190,90',q[0],q[1]-4*s,10*s,.6*fl);ctx.restore()}
  const lay=[['#b82a12',1.18,0],['#ff6a1a',.92,.5],['#ffb03a',.66,1],['#fff1b8',.34,1.4]];
  for(const[col,k,dz] of lay){ctx.fillStyle=col;for(const[ox,h,w,ph] of T){const H=h*k*(.82+.18*Math.sin(t*9+ph)+.08*Math.sin(t*23+ph*2))*fl,W=w*3.6*k,sway=Math.sin(t*5.3+ph)*2.2*k+Math.sin(t*11+ph)*.8,
      bx=q[0]+ox*s*k,by=q[1]-dz*s;ctx.beginPath();ctx.moveTo(bx-W*s,by);ctx.bezierCurveTo(bx-W*s*.9,by-H*s*.45,bx+sway*s*.4,by-H*s*.6,bx+sway*s,by-H*s);ctx.bezierCurveTo(bx+sway*s*.3+W*s*.25,by-H*s*.55,bx+W*s*.95,by-H*s*.4,bx+W*s,by);ctx.closePath();ctx.fill()}}}
// the gun by the hero: a hand gun lies on the log beside him, a long gun leans against the log with its butt on the ground (ARMI3D in the
// room, the camera of the camp). at = where on the log (its top), ax = along the log, fwd = the side of the log toward the fire
function zfGun(V0,id,at,ax,fwd){if(typeof ARMI3D==='undefined'||!ARMI3D.ZOMBIE.includes(id))return;const hand=id==='pistola'||id==='revolver';
  try{if(hand){const fr=ARMI3D.frame(add(at,[0,0,.9]),nrm(add(ax,mul(fwd,.3))),nrm(add(fwd,[0,0,.25])),.92);ARMI3D.draw(id,V0,fr,{})}
    else{const base=add(at,add(mul(fwd,5.2),[0,0,-at[2]])),aim=nrm(add(add(mul(fwd,-.55),mul(ax,.45)),[0,0,1])),fr=ARMI3D.frame(base,aim,nrm(add(mul(fwd,1),[0,0,.2])),1);ARMI3D.draw(id,V0,fr,{})}}catch(e){}}
// a shovel stuck in the ground, a little crooked: the wooden shaft, the iron blade half in the earth
function zfShovel(V0,c3,lean){const{P}=V0,top=add(c3,[lean[0]*10,lean[1]*10,26]),A=P(c3),B=P(top);ink(3.2);seg(A,B);ctx.stroke();ctx.strokeStyle='#6b4a2a';ctx.lineWidth=1.8;seg(A,B);ctx.stroke();
  ctx.strokeStyle='rgba(255,220,180,.18)';ctx.lineWidth=.7;seg([A[0]-.5,A[1]],[B[0]-.5,B[1]]);ctx.stroke();
  const h1=P(add(top,[-2.2,0,0])),h2=P(add(top,[2.2,0,0]));ink(2.6);seg(h1,h2);ctx.stroke();ctx.strokeStyle='#6b4a2a';ctx.lineWidth=1.4;seg(h1,h2);ctx.stroke();
  const b0=P(add(c3,[-2.6,0,3.5])),b1=P(add(c3,[2.6,0,3.5])),b2=P(add(c3,[2.2,0,-.5])),b3=P(add(c3,[-2.2,0,-.5]));ink(1.6);ctx.fillStyle='#6d7680';ctx.beginPath();ctx.moveTo(b0[0],b0[1]);ctx.lineTo(b1[0],b1[1]);ctx.lineTo(b2[0],b2[1]);ctx.lineTo(b3[0],b3[1]);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(200,215,225,.3)';ctx.fillRect(b0[0]+.6,b0[1]+.4,1.2,2.4);ctx.fillStyle='#16110d';ctx.beginPath();ctx.ellipse((b2[0]+b3[0])/2,(b2[1]+b3[1])/2,3.6,1.2,0,0,TAU);ctx.fill()}
// a small wooden crate of ammunition: planks, a stencil, the lid ajar with a few rounds
function zfCrate(V0,c3,w,d,h){const{P}=V0,x0=c3[0]-w/2,y0=c3[1]-d/2,P3=(a,b,c)=>P([a,b,c]),q=[P3(x0,y0+d,0),P3(x0+w,y0+d,0),P3(x0+w,y0+d,h),P3(x0,y0+d,h)],tp=[P3(x0,y0,h),P3(x0+w,y0,h),P3(x0+w,y0+d,h),P3(x0,y0+d,h)],sd=[P3(x0+w,y0,0),P3(x0+w,y0+d,0),P3(x0+w,y0+d,h),P3(x0+w,y0,h)];
  const face=(pts,col)=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=col;ctx.fill();ink(1.8);ctx.stroke()};
  face(sd,'#4a3622');face(q,'#7a5a36');face(tp,'#94703f');ctx.strokeStyle='rgba(30,18,8,.5)';ctx.lineWidth=.7;for(const k of[.33,.66]){seg([lerp(q[0][0],q[3][0],k),lerp(q[0][1],q[3][1],k)],[lerp(q[1][0],q[2][0],k),lerp(q[1][1],q[2][1],k)]);ctx.stroke()}
  ctx.fillStyle='rgba(20,14,8,.55)';const m=[(q[0][0]+q[2][0])/2,(q[0][1]+q[2][1])/2];ctx.fillRect(m[0]-2.6,m[1]-.8,5.2,1.6);
  for(let i=0;i<3;i++){const b=P3(x0+w*.3+i*1.6,y0+d*.4,h+.4);ctx.fillStyle='#d39a33';ink(.8);ctx.beginPath();ctx.ellipse(b[0],b[1]-1,.7,1.6,0,0,TAU);ctx.fill();ctx.stroke()}}
// a small iron pot on the stones at the side of the fire, steam rising from it
function zfPot(V0,c3,t){const{P}=V0,b=P(c3),tp=P(add(c3,[0,0,5]));ink(2);ctx.fillStyle='#2a2c2e';ctx.beginPath();ctx.moveTo(b[0]-4,tp[1]);ctx.quadraticCurveTo(b[0]-4.6,b[1]+1,b[0],b[1]+1.4);ctx.quadraticCurveTo(b[0]+4.6,b[1]+1,b[0]+4,tp[1]);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#16181a';ctx.beginPath();ctx.ellipse(tp[0],tp[1],4,1.5,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(120,90,60,.8)';ctx.beginPath();ctx.ellipse(tp[0],tp[1]+.2,3,1,0,0,TAU);ctx.fill();
  ctx.strokeStyle='rgba(200,215,220,.25)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(b[0]-3.4,tp[1]+1.2);ctx.quadraticCurveTo(b[0]-3.8,b[1]-.4,b[0]-1.5,b[1]+.6);ctx.stroke();
  ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(b[0]-4,tp[1]-.3);ctx.quadraticCurveTo(b[0],tp[1]-6,b[0]+4,tp[1]-.3);ctx.stroke();
  if(!LOWFX)for(let i=0;i<3;i++){const k=((t*.35+i/3)%1),x=tp[0]+Math.sin(k*6+i)*1.6,y=tp[1]-2-k*12;ctx.fillStyle=`rgba(210,220,215,${(.16*(1-k)).toFixed(3)})`;circ(x,y,1.4+k*2.6);ctx.fill()}}
// an old oil lantern on the ground, out (the Lanterna delle Anime is on the map), a faint glint on its glass
function zfLantern(V0,c3){const{P}=V0,b=P(c3),tp=P(add(c3,[0,0,8]));ink(1.8);ctx.fillStyle='#2e3236';ctx.fillRect(b[0]-2.6,b[1]-1.6,5.2,1.8);ctx.strokeRect(b[0]-2.6,b[1]-1.6,5.2,1.8);
  ctx.fillStyle='rgba(150,170,160,.35)';ctx.fillRect(b[0]-2,tp[1]+1.6,4,b[1]-tp[1]-3.2);ctx.strokeRect(b[0]-2,tp[1]+1.6,4,b[1]-tp[1]-3.2);ctx.fillStyle='rgba(255,240,220,.4)';ctx.fillRect(b[0]-1.4,tp[1]+2.4,.8,3);
  ctx.fillStyle='#2e3236';ctx.beginPath();ctx.moveTo(b[0]-3,tp[1]+1.8);ctx.lineTo(b[0],tp[1]-1);ctx.lineTo(b[0]+3,tp[1]+1.8);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.arc(b[0],tp[1]-2,2,Math.PI,0);ctx.stroke()}
// the backpack against the log, a rolled blanket on it
function zfPack(V0,c3){const{P}=V0,q=P(c3),b=P(add(c3,[0,0,7]));ink(2.2);ctx.fillStyle='#4b5232';hull(q,4.6,b,4);ctx.fill();ctx.stroke();
  ctx.save();hull(q,4.4,b,3.8);ctx.clip();ctx.fillStyle='rgba(0,0,0,.3)';ell(q[0]+2.5,q[1]+1,4,6);ctx.fill();ctx.fillStyle='#3c4228';ctx.fillRect(q[0]-3,q[1]-5,6,4);ctx.restore();
  ctx.strokeStyle=INK;ctx.lineWidth=1.2;seg([q[0]-3,q[1]-6],[q[0]-3,q[1]+1]);ctx.stroke();seg([q[0]+3,q[1]-6],[q[0]+3,q[1]+1]);ctx.stroke();
  const r1=P(add(c3,[0,-4,8.6])),r2=P(add(c3,[0,4,8.6]));ink(2);hull(r1,2.3,r2,2.3);ctx.fillStyle='#7a3a30';ctx.fill();ctx.stroke();ctx.strokeStyle='rgba(30,10,8,.5)';ctx.lineWidth=1;seg([lerp(r1[0],r2[0],.3),r1[1]-2],[lerp(r1[0],r2[0],.3),r1[1]+2]);ctx.stroke();seg([lerp(r1[0],r2[0],.7),r2[1]-2],[lerp(r1[0],r2[0],.7),r2[1]+2]);ctx.stroke()}
// ------------------------------------------------------------------ the whole scene (called by drawCamp in the Zombie mode)
// A = {hx, hy, hs, t, dt, k}: the hero's point and scale in the home's units; k (0..1) how much the hero is sitting (the switch of mode)
drawFalo=function(A){const t=A.t,dt=A.dt,hs=A.hs,hx=A.hx,hy=A.hy;FALO.hx=hx;FALO.t+=dt;
  const fl=.86+.08*Math.sin(t*13.1)+.05*Math.sin(t*7.7+1)+.04*Math.sin(t*23.3);
  ctx.fillStyle='#0c120f';ctx.fillRect(-400,200,SW+800,900);ctx.drawImage(zfBack(),ZFX0,ZFY0,ZFW,ZFH);
  // the moon behind thin clouds, its green halo
  {const mx=268,my=-108;if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('170,220,180',mx,my,80,.16);glow('220,240,210',mx,my,36,.3);ctx.restore()}
    ctx.fillStyle='#d9e4c8';circ(mx,my,19);ctx.fill();ctx.fillStyle='rgba(60,80,60,.18)';for(const[a,b,r] of[[-6,-5,4.5],[6,3,3.4],[-1,9,2.6],[8,-8,2]]){circ(mx+a,my+b,r);ctx.fill()}
    for(let k=0;k<4;k++){const cx=((k*121+t*(2.2+k*.7))%520)-80,cy=-150+k*30,w=70+k*18;ctx.fillStyle='rgba(24,36,34,.6)';ctx.beginPath();ctx.ellipse(cx,cy,w,8,0,0,TAU);ctx.ellipse(cx-w*.3,cy-6,w*.42,7,0,0,TAU);ctx.ellipse(cx+w*.28,cy-5,w*.36,6,0,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(190,215,195,.14)';ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(cx-w*.3,cy-6,w*.42,7,0,Math.PI*1.1,Math.PI*1.9);ctx.stroke()}}
  // the windmill's blades, turning slow (one is broken)
  {FALO.blades+=dt*.35;const mx=304,my=44,a0=FALO.blades;ctx.lineCap='round';for(let i=0;i<4;i++){const a=a0+i*Math.PI/2,L=i===2?17:30,ex=mx+Math.cos(a)*L,ey=my+Math.sin(a)*L;
      ctx.strokeStyle='#0a1210';ctx.lineWidth=2.2;seg([mx,my],[ex,ey]);ctx.stroke();ctx.lineWidth=5.5;const s0=.35,ax=mx+Math.cos(a)*L*s0,ay=my+Math.sin(a)*L*s0;
      ctx.strokeStyle='rgba(12,20,18,.92)';seg([ax+Math.cos(a+1.57)*2.4,ay+Math.sin(a+1.57)*2.4],[ex+Math.cos(a+1.57)*2.4,ey+Math.sin(a+1.57)*2.4]);ctx.stroke()}
    ctx.fillStyle='#0a1210';circ(mx,my,2.4);ctx.fill()}
  // the zombies on the path (far away: small and dim, eyes still glowing), behind the fence
  zfZombies(dt);
  for(const z of FALO.Z.slice().sort((a,b)=>a.y-b.y)){const an=z.st==='walk'?'walk':'idle',f=CR[z.kind];if(!f)continue;ctx.save();ctx.globalAlpha=.9;
    try{f(z.x,z.y,z.face,an,z.p,hs*.3)}catch(e){}ctx.restore()}
  ctx.drawImage(zfFence(),ZFX0,ZFY0,ZFW,ZFH);
  // fog over the field
  if(!LOWFX){const im=glowSprite('150,175,160');ctx.save();for(let k=0;k<5;k++){const w=150+k*30,fx=((k*137+t*(4+k*1.6))%(360+w*2))-w,fy=132+k*9;ctx.globalAlpha=.1+.03*Math.sin(t*.3+k);ctx.drawImage(im,fx,fy-12,w*2,26)}ctx.restore();ctx.globalAlpha=1}
  // crows crossing the sky now and then
  if(!LOWFX){if((FALO.crowT-=dt)<=0){FALO.crowT=12+Math.random()*14;const dir=Math.random()<.5?1:-1,y0=-150+Math.random()*90;for(let i=0;i<3+Math.floor(Math.random()*3);i++)FALO.crows.push({x:dir>0?-20-i*14:380+i*14,y:y0+(Math.random()-.5)*20,dir,ph:Math.random()*6,v:34+Math.random()*10})}
    for(let i=FALO.crows.length-1;i>=0;i--){const c=FALO.crows[i];c.x+=c.dir*c.v*dt;c.ph+=dt*8;if(c.x<-60||c.x>420){FALO.crows.splice(i,1);continue}const wg=Math.sin(c.ph);ctx.fillStyle='#020403';ctx.beginPath();ctx.ellipse(c.x,c.y,3.4,1.5,0,0,TAU);ctx.fill();
      for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.quadraticCurveTo(c.x+sd*5,c.y-2-wg*4,c.x+sd*9,c.y-wg*6);ctx.quadraticCurveTo(c.x+sd*5,c.y+1-wg*2,c.x,c.y+1);ctx.fill()}}}
  // ---------------------------------------------------------------- the camp, in the hero's 3D
  // (the camp sits FALO.up units higher than the classic hero's feet: sitting he is shorter, and the fire in front of him needs room)
  const V0=CR._rig.V(0),f=FALO.face,fc=FALO.fire,s=hs,cy0=hy-FALO.up*s;ctx.save();ctx.translate(hx,cy0);ctx.scale(s,s);
  // the clearing: trampled earth between the hero and the fire, warm where the fire lights it
  {const q=V0.P(fc[0]*.5,fc[1]*.45,0);ctx.save();ctx.translate(q[0],q[1]);ctx.scale(1,.55);const g=ctx.createRadialGradient(0,0,4,0,0,48);g.addColorStop(0,'rgba(64,46,30,.95)');g.addColorStop(.55,'rgba(42,33,24,.75)');g.addColorStop(1,'rgba(20,24,19,0)');
    ctx.fillStyle=g;ctx.fillRect(-50,-50,100,100);ctx.restore();ctx.fillStyle='rgba(90,80,64,.35)';for(let i=0;i<14;i++){const a=i*2.17,r=8+(i*7)%30;ctx.fillRect(q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.5,1.4,.9)}}
  const F3=[fc[0],fc[1],0],fwd=[Math.cos(f),Math.sin(f),0],ax=[-Math.sin(f),Math.cos(f),0],C=[-1.6*fwd[0],-1.6*fwd[1],3.7];
  // the camp's things on a layer of their own (same transform), lit by the fire afterwards: only where there is something
  const M=ctx.getTransform(),L=FALO.lay||(FALO.lay=document.createElement('canvas')),bx0=-60,by0=-64,bw=98,bh=76,
    d0=[M.a*bx0+M.e,M.d*by0+M.f],W1=Math.ceil(bw*M.a)+2,H1=Math.ceil(bh*M.d)+2;if(L.width<W1)L.width=W1;if(L.height<H1)L.height=H1;
  const lg=L.getContext('2d'),sv=ctx;lg.setTransform(1,0,0,1,0,0);lg.clearRect(0,0,L.width,L.height);lg.setTransform(M.a,0,0,M.d,M.e-Math.floor(d0[0]),M.f-Math.floor(d0[1]));ctx=lg;
  try{
    // the log runs almost across the screen (people sit a little turned), the hero on it, facing the fire. Behind it the shovel stuck in
    // the earth and the backpack leaning on its left end
    const la=nrm([-1,.3,0]),LC=add(C,mul(la,6));
    zfShovel(V0,add(C,add(mul(la,-8),[-2,-10,-3.7])),[.1,-.05]);zfPack(V0,add(C,add(mul(la,22),[0,-6.5,-3.7])));
    zfLog(V0,LC,la,44,4,fl);
    // the hero on the log (A.k: 0 standing up, 1 sitting): his clothes are the ones he wears, no weapon in his hands
    {const st={...heroStyle(),gun:null,held:null,quiver:false},k=A.k==null?1:A.k,P9=(t%9)/9;
      // going to play (A.walk 0..1): he has taken his gun and walks away toward the path, into the dark
      if(A.walk>0){const w=A.walk,fw=Math.atan2(-30,-26);ctx.save();ctx.globalAlpha*=1-w*w;EROE.arciere(-26*w,-30*w,fw,'walk',(t*1.4)%1,1,{style:{...st,gun:FALO.gun}});ctx.restore()}
      else if(k>=.999)EROE.arciere(0,0,f,'sit',P9,1,{style:st,seat:FALO.seat});
      else EROE.arciere(0,0,f,'idle',(t/2.4)%1,1,{style:st,seat:FALO.seat,mix:['sit',P9,k]})}
    // the gun on his right (toward us)
    if(!(A.walk>0))zfGun(V0,FALO.gun,add(C,add(mul(la,11),[0,0,3.7])),la,fwd);
    // the crate of ammunition on the other side of the fire
    zfCrate(V0,add(F3,[14,-5,0]),9,6,5.5);
    // the fire's light on them: warm from the fire's side, fading away from it; laid only where there is something (masked by the layer),
    // as a soft light (the dark outlines stay dark), plus a little glow on the side toward the fire
    if(!LOWFX){const fq=V0.P(F3),Tm=FALO.lit||(FALO.lit=document.createElement('canvas'));if(Tm.width!==L.width||Tm.height!==L.height){Tm.width=L.width;Tm.height=L.height}
      const tg=Tm.getContext('2d');tg.setTransform(1,0,0,1,0,0);tg.globalCompositeOperation='source-over';tg.clearRect(0,0,Tm.width,Tm.height);tg.setTransform(lg.getTransform());
      const g=tg.createRadialGradient(fq[0],fq[1]-6,2,fq[0],fq[1]-6,56);g.addColorStop(0,`rgba(255,160,70,${(.95*fl).toFixed(3)})`);g.addColorStop(.5,`rgba(255,130,50,${(.55*fl).toFixed(3)})`);g.addColorStop(1,'rgba(255,110,40,0)');
      tg.fillStyle=g;tg.fillRect(bx0,by0,bw,bh);tg.setTransform(1,0,0,1,0,0);tg.globalCompositeOperation='destination-in';tg.drawImage(L,0,0);
      lg.save();lg.setTransform(1,0,0,1,0,0);lg.globalCompositeOperation='soft-light';lg.drawImage(Tm,0,0);lg.globalCompositeOperation='lighter';lg.globalAlpha=.16;lg.drawImage(Tm,0,0);lg.restore()}
  }finally{ctx=sv}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(L,0,0,W1,H1,Math.floor(d0[0]),Math.floor(d0[1]),W1,H1);ctx.restore();
  // the fire: scorched ground, the ring of stones, the logs, the flames
  {const q=V0.P(F3);ctx.fillStyle='#16110d';ctx.beginPath();ctx.ellipse(q[0],q[1],9.5,9.5*.55,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(120,110,100,.35)';for(let i=0;i<9;i++){const a=i*2.3;ctx.fillRect(q[0]+Math.cos(a)*5,q[1]+Math.sin(a)*2.4,1.2,.8)}
    const N=10,ring=[];for(let i=0;i<N;i++){const a=i/N*TAU+.2,p3=add(F3,[Math.cos(a)*8,Math.sin(a)*8,1.2]);ring.push([p3,a])}
    const back=ring.filter(r=>Math.sin(r[1])<0),front=ring.filter(r=>Math.sin(r[1])>=0);
    for(const[p3,a] of back)zfStone(V0,p3,2.4+.3*Math.sin(a*3),[-Math.cos(a),-Math.sin(a)],fl);
    for(let i=0;i<4;i++){const a=i/4*TAU+.6;zfFireLog(V0,add(F3,[Math.cos(a)*7,Math.sin(a)*7,1.6]),add(F3,[Math.cos(a)*1.2,Math.sin(a)*1.2,3.2]),1.45,fl,t)}
    // embers glowing in the middle
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const a=i*1.7+t*.2,r=1.5+i%3;glow('255,110,30',q[0]+Math.cos(a)*r,q[1]-2+Math.sin(a)*r*.5,3,.5*fl)}ctx.restore()}
    zfFlames([q[0],q[1]-3],1.15,t,fl);zfPot(V0,add(F3,[-7.5,6.5,1.6]),t);
    for(const[p3,a] of front)zfStone(V0,p3,2.4+.3*Math.sin(a*3),[-Math.cos(a),-Math.sin(a)],fl);
    // sparks that shoot up and embers that float, smoke rising and drifting away
    const nS=LOWFX?2:7;if(Math.random()<dt*nS)FALO.sparks.push({x:q[0]+(Math.random()-.5)*5,y:q[1]-6,vx:(Math.random()-.5)*14,vy:-24-Math.random()*26,l:.6+Math.random()*.9});
    if(!LOWFX&&Math.random()<dt*1.4)FALO.smoke.push({x:q[0]+(Math.random()-.5)*4,y:q[1]-18,r:3,l:0});
    for(let i=FALO.smoke.length-1;i>=0;i--){const m=FALO.smoke[i];m.l+=dt/4;if(m.l>=1){FALO.smoke.splice(i,1);continue}m.y-=dt*7;m.x+=dt*(3+m.l*5);m.r=3+m.l*12;ctx.fillStyle=`rgba(34,36,34,${(.2*Math.sin(m.l*Math.PI)).toFixed(3)})`;circ(m.x,m.y,m.r);ctx.fill()}
    ctx.save();ctx.globalCompositeOperation='lighter';for(let i=FALO.sparks.length-1;i>=0;i--){const e=FALO.sparks[i];e.l-=dt;if(e.l<=0){FALO.sparks.splice(i,1);continue}e.vx+=Math.sin(t*3+i)*8*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy*=1-dt*.6;
      const a=Math.min(1,e.l*1.6);ctx.fillStyle=`rgba(255,${180+(i*29)%60},${80+(i*13)%60},${a.toFixed(3)})`;ctx.fillRect(e.x-.45,e.y-.45,.9,.9+Math.min(2.4,-e.vy*.04))}ctx.restore()}
  ctx.restore();
  // ---------------------------------------------------------------- the light: the night all round, a hole that breathes where the fire is
  const q=[hx+fc[0]*s,cy0+fc[1]*.55*s],lx=campLx,LOF=300,LH2=SH+600;lx.globalCompositeOperation='source-over';lx.clearRect(0,0,SW,LH2);lx.fillStyle='rgba(2,6,8,.42)';lx.fillRect(0,0,SW,LH2);
  lx.globalCompositeOperation='destination-out';const spr=glowSprite('0,0,0'),Lt=(x,y,r,a)=>{lx.globalAlpha=Math.min(1,a);lx.drawImage(spr,x-r,y+LOF-r,r*2,r*2)};
  Lt(q[0],q[1]-6*s,(30+16*s)*fl,1);Lt(q[0],q[1]-4*s,(14+9*s)*fl,1);Lt(hx,cy0-14*s,(16+10*s)*fl,.7);Lt(268,-108,52,.7);Lt(111,103,14,.6);
  lx.globalAlpha=1;campLightBlit();
  // the eyes of the zombies on the path: two small glows that breathe, above the dark
  if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';for(const z of FALO.Z){const k=.6+.4*Math.sin(t*2.2+z.x*.1),sc=hs*.3,e=CR._rig.V(z.face).P(4.6,0,0),hxz=z.x+e[0]*sc,hyz=z.y-34*sc+e[1]*sc;
      if(Math.cos(z.face-Math.PI/2)>-.3){glow('200,255,120',hxz,hyz,3.2*sc,.5*k);glow('220,255,160',hxz,hyz,1.1*sc,.9*k)}}ctx.restore()}
  // the fire's warm light on everything near (it flickers)
  if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,130,50',q[0],q[1]-8*s,(26+12*s)*fl,.17*fl);glow('255,170,90',q[0],q[1]-5*s,(10+6*s)*fl,.14);ctx.restore()}
  campVigDraw(1.35)}}
