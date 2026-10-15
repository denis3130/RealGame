// ------------------------------------------------------------------ 03 · inside the crypt
// Stone walls of big blocks with moss in the joints, a floor of flagstones, pillars, roots hanging from the vault, cobwebs,
// two braziers with a warm fire, the altar with the ash bow and the quiver in a beam of moonlight full of dust; the way out
// with the stairs in the moonlight and the stone slab; the long corridor toward the arena.
// The walls and the floor are real planes projected by the camera; the rest are cards.
const CQ={stone:'#3a434e',stoneL:'#7f93ab',stoneD:'#12171d',joint:'#06080b',floor:'#262c33',floorL:'#4d5865',moss:'#3c6e2b',mossL:'#8cc650',
  fire:'#ffb347',fireO:'#ff6a1e',fireC:'#fff3c0',iron:'#22201e',ironL:'#5a5450',dark:'#05070a'};
// the scream (from 05): when the crypt shakes
const SCREAM1=19.05,SLAB_DROP=23.72,SLAB_HIT=23.95,BOW_TAKEN=15;
const shakeAt=t=>Math.max(0,1-Math.abs(t-SCREAM1-.55)/.9)*(t>SCREAM1?1:0);

// ---------- planes
// a side wall: the plane x = xw from z0 to z1, from the floor up to yTop (negative). Rows of blocks, staggered joints, a lit top edge
function wallX(c,xw,z0,z1,yTop,o){o=o||{};const near=Math.max(z0,C.z+3);if(near>=z1)return;
  if(!gpoly(c,[[xw,0,near],[xw,0,z1],[xw,yTop,z1],[xw,yTop,near]]))return;
  const a=pr(xw,0,near),b=pr(xw,0,z1),g=c.createLinearGradient(a[0],0,b[0],0),base=o.col||CQ.stone;
  g.addColorStop(0,fogc(mc(base,CQ.stoneD,.15),near));g.addColorStop(.5,fogc(base,(near+z1)/2));g.addColorStop(1,fogc(base,z1));c.fillStyle=g;c.fill();
  c.save();c.clip();const rh=o.rh||28,bw=o.bw||46;
  // the lit top edge of every row of blocks
  c.strokeStyle=rgba(fogc(CQ.stoneL,(near+z1)/2),.22);c.lineWidth=1.6;c.beginPath();for(let y=-rh+3;y>yTop;y-=rh)wline(c,[xw,y,near],[xw,y,z1]);c.stroke();
  c.strokeStyle=rgba(CQ.joint,.75);c.lineWidth=1.3;c.beginPath();let row=0;
  for(let y=0;y>yTop;y-=rh,row++){wline(c,[xw,y,near],[xw,y,z1]);for(let z=z0+(row%2?bw/2:0);z<z1;z+=bw)if(z>near)wline(c,[xw,y,z],[xw,y-rh,z])}c.stroke();
  // moss at the foot of the wall and in a few joints
  c.strokeStyle=rgba(fogc(CQ.moss,(near+z1)/2),.8);c.lineWidth=2.4;c.beginPath();wline(c,[xw,-2,near],[xw,-2,z1]);c.stroke();
  if(o.dark){c.fillStyle=o.dark;c.fillRect(-500,-500,FM.W+1000,FM.H+1000)}
  c.restore()}
// the floor of flagstones: the rectangle x0..x1, z0..z1 on y=0
function floorT(c,x0,x1,z0,z1,o){o=o||{};const near=Math.max(z0,C.z+3);if(near>=z1)return;if(!gpoly(c,[[x0,near],[x1,near],[x1,z1],[x0,z1]]))return;
  c.fillStyle=groundGrad(c,o.col||CQ.floor);c.fill();c.save();c.clip();const tw=o.tw||40;
  c.strokeStyle=rgba(CQ.joint,.8);c.lineWidth=1.4;c.beginPath();for(let x=Math.ceil(x0/tw)*tw;x<x1;x+=tw)wline(c,[x,0,near],[x,0,z1]);
  for(let z=Math.ceil(z0/tw)*tw;z<z1;z+=tw){if(z<near)continue;const off=(Math.round(z/tw)%2)*tw*.5;wline(c,[x0,0,z],[x1,0,z])}c.stroke();
  // moss in some joints, a light edge on the stones
  c.strokeStyle=rgba(CQ.moss,.55);c.lineWidth=1.8;c.beginPath();const r=frng(o.seed||3);for(let i=0;i<26;i++){const x=Math.round(flp(x0,x1,r())/tw)*tw,z=flp(near,Math.min(z1,near+400),r());wline(c,[x,0,z],[x,0,z+tw*(.4+r()*.6)])}c.stroke();
  c.restore()}
function ceilT(c,x0,x1,z0,z1,y,col){const near=Math.max(z0,C.z+3);if(near>=z1)return;if(gpoly(c,[[x0,y,near],[x1,y,near],[x1,y,z1],[x0,y,z1]])){c.fillStyle=fogc(col||'#0b0e12',(near+z1)/2);c.fill()}}

// ---------- cards
// a wall of blocks facing the camera (on its card), with an opening: o.door = {x, w, h} (round top)
function blockWall(c,x0,x1,yTop,z,o){o=o||{};const F=col=>fogc(col,z),r=frng(o.seed||(z|0));c.save();
  c.beginPath();c.rect(x0,yTop,x1-x0,-yTop);if(o.door){const d=o.door;c.moveTo(d.x-d.w/2,0);c.lineTo(d.x-d.w/2,-d.h+d.w*.5);c.arc(d.x,-d.h+d.w*.5,d.w/2,Math.PI,0);c.lineTo(d.x+d.w/2,0);c.closePath()}
  c.fillStyle=F(o.col||CQ.stone);c.fill('evenodd');c.clip('evenodd');
  const rh=o.rh||26,bw=o.bw||44;let row=0;
  for(let y=0;y>yTop;y-=rh,row++){for(let x=x0-(row%2?bw/2:0);x<x1;x+=bw){const k=r();c.fillStyle=k<.3?rgba(F(CQ.stoneD),.35):k>.8?rgba(F(CQ.stoneL),.08):'rgba(0,0,0,0)';c.fillRect(x+1,y-rh+1,bw-2,rh-2);
      c.fillStyle=rgba(F(CQ.stoneL),.16);c.fillRect(x+2,y-rh+2,bw-4,1.6)}}
  c.strokeStyle=rgba(CQ.joint,.85);c.lineWidth=1.4;c.beginPath();row=0;for(let y=0;y>yTop;y-=rh,row++){c.moveTo(x0,y);c.lineTo(x1,y);for(let x=x0-(row%2?bw/2:0);x<x1;x+=bw){c.moveTo(x,y);c.lineTo(x,y-rh)}}c.stroke();
  // moss creeping up from the floor and in the joints
  c.fillStyle=rgba(F(CQ.moss),.85);for(let i=0;i<10;i++){const x=flp(x0,x1,r()),w=10+r()*30;c.beginPath();c.ellipse(x,0,w,4+r()*7,0,Math.PI,FTAU);c.fill()}
  c.restore();
  if(o.door){const d=o.door;// the frame of the opening: big blocks and the keystone
    c.lineWidth=2.2;c.strokeStyle=F(INKC);for(let i=0;i<9;i++){const a=Math.PI+i/8*Math.PI,cx=d.x,cy=-d.h+d.w*.5,R0=d.w/2,R1=d.w/2+12;
      c.beginPath();c.arc(cx,cy,R1,a-.17,a+.17);c.arc(cx,cy,R0,a+.17,a-.17,true);c.closePath();c.fillStyle=F(i===4?CQ.stoneL:mc(CQ.stone,CQ.stoneL,.25));c.fill();c.stroke()}
    for(const sd of[-1,1]){const x=d.x+sd*(d.w/2+6);for(let y=0;y>-d.h+d.w*.5;y-=24){c.fillStyle=F(mc(CQ.stone,CQ.stoneL,.2));c.fillRect(x-6,y-24,12,24);c.strokeRect(x-6,y-24,12,24)}}}}
// what is behind an opening: darkness, with a light far inside (col3 'r,g,b', a)
function doorDepth(c,d,col3,a,t){c.save();c.beginPath();c.moveTo(d.x-d.w/2,0);c.lineTo(d.x-d.w/2,-d.h+d.w*.5);c.arc(d.x,-d.h+d.w*.5,d.w/2,Math.PI,0);c.lineTo(d.x+d.w/2,0);c.closePath();
  c.fillStyle=CQ.dark;c.fill();c.clip();if(a>0){const g=c.createRadialGradient(d.x,-d.h*.32,1,d.x,-d.h*.35,d.w*.85);g.addColorStop(0,`rgba(${col3},${a})`);g.addColorStop(.5,`rgba(${col3},${a*.25})`);g.addColorStop(1,`rgba(${col3},0)`);c.fillStyle=g;c.fillRect(d.x-d.w,-d.h,d.w*2,d.h)}c.restore()}
// a pillar on its card: blocks, a base and a capital, moss, the lit edge toward lx (-1 left / 1 right)
function pillar(c,x,w,yTop,z,lx,t){const F=col=>fogc(col,z);c.lineWidth=2.4;c.strokeStyle=F(INKC);
  const g=c.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,F(lx<0?CQ.stoneL:CQ.stoneD));g.addColorStop(lx<0?.25:.75,F(CQ.stone));g.addColorStop(1,F(lx<0?CQ.stoneD:CQ.stoneL));
  c.fillStyle=g;c.fillRect(x-w/2,yTop,w,-yTop);c.strokeRect(x-w/2,yTop,w,-yTop);c.strokeStyle=rgba(CQ.joint,.8);c.lineWidth=1.3;c.beginPath();for(let y=-30;y>yTop;y-=30){c.moveTo(x-w/2,y);c.lineTo(x+w/2,y)}c.stroke();
  for(const[y,h] of[[0,-12],[yTop+14,-14]]){c.fillStyle=F(mc(CQ.stone,CQ.stoneL,.15));c.fillRect(x-w/2-5,y+h,w+10,-h);c.strokeStyle=F(INKC);c.lineWidth=2.2;c.strokeRect(x-w/2-5,y+h,w+10,-h)}
  c.fillStyle=F(CQ.moss);c.beginPath();c.ellipse(x-w*.2,-10,w*.5,8,0,0,FTAU);c.fill();c.beginPath();c.ellipse(x+w*.3,yTop*.55,w*.25,10,0,0,FTAU);c.fill()}
// roots and moss strands hanging from the vault
function roots(c,list,z,t){c.strokeStyle=fogc('#1c140e',z);c.lineCap='round';for(const[x,y,l,w] of list){const sw=Math.sin(t*.9+x)*2;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+4,y+l*.3,x-5+sw*.5,y+l*.6,x+sw,y+l);c.stroke()}
  c.strokeStyle=fogc(CQ.moss,z);c.lineWidth=1.2;for(const[x,y,l] of list){const sw=Math.sin(t*1.2+x*2)*2;c.beginPath();c.moveTo(x+3,y);c.quadraticCurveTo(x+4+sw*.5,y+l*.35,x+3+sw,y+l*.6);c.stroke()}}
function cobweb(c,x,y,r,sx,sy,z){c.strokeStyle=rgba(fogc('#c8d0d8',z),.22);c.lineWidth=.6;c.beginPath();for(let i=0;i<=5;i++){const a=i/5*Math.PI/2;c.moveTo(x,y);c.lineTo(x+Math.cos(a)*r*sx,y+Math.sin(a)*r*sy)}
  for(let k=1;k<=4;k++){const rr=r*k/4;for(let i=0;i<5;i++){const a=i/5*Math.PI/2,b=(i+1)/5*Math.PI/2;c.moveTo(x+Math.cos(a)*rr*sx,y+Math.sin(a)*rr*sy);c.quadraticCurveTo(x+Math.cos((a+b)/2)*rr*.8*sx,y+Math.sin((a+b)/2)*rr*.8*sy,x+Math.cos(b)*rr*sx,y+Math.sin(b)*rr*sy)}}c.stroke()}

// ---------- fire
// a flame of three tongues (orange, yellow, white core); lean bends it (the scream), the flicker comes from t
function flame(c,x,y,h,t,lean,seed){const f=k=>Math.sin(t*(9+k)+seed*3)*.5+Math.sin(t*(15+k*2)+seed)*.3,wl=lean||0;
  for(const[col,s0,w0] of[[CQ.fireO,1,.42],[CQ.fire,.72,.3],[CQ.fireC,.42,.17]]){const hh=h*s0*(1+.12*f(1)),tx=x+(wl*h*.7+f(2)*h*.12)*s0,w=h*w0;
    c.fillStyle=col;c.beginPath();c.moveTo(x-w,y);c.bezierCurveTo(x-w*1.1,y-hh*.45,tx-w*.25,y-hh*.7,tx,y-hh);c.bezierCurveTo(tx+w*.25,y-hh*.7,x+w*1.1,y-hh*.45,x+w,y);c.closePath();c.fill()}}
function brazier(c,x,z,t,o){o=o||{};const F=col=>fogc(col,z),lean=o.lean||0;
  c.strokeStyle=F(INKC);c.lineWidth=2;c.fillStyle=F(CQ.iron);// the tripod and the bowl
  for(const sd of[-1,0,1]){c.beginPath();c.moveTo(x+sd*3,-34);c.lineTo(x+sd*14,0);c.lineWidth=3.4;c.strokeStyle=F(INKC);c.stroke();c.lineWidth=1.6;c.strokeStyle=F(CQ.ironL);c.stroke()}
  c.beginPath();c.moveTo(x-17,-42);c.quadraticCurveTo(x,-24,x+17,-42);c.closePath();c.fillStyle=F(CQ.iron);c.fill();c.lineWidth=2.2;c.strokeStyle=F(INKC);c.stroke();
  c.fillStyle=F(CQ.ironL);c.fillRect(x-17,-44,34,3);
  // coals and the fire
  c.fillStyle='#ff5a1a';c.beginPath();c.ellipse(x,-42,13,3,0,0,FTAU);c.fill();flame(c,x,-42,o.h||30,t,lean,o.seed||x);
  // embers going up
  for(let i=0;i<5;i++){const q=((t*.5+i/5+(x*.013))%1),ex=x+Math.sin(i*2.3+t*2)*6+lean*q*30,ey=-48-q*60;c.fillStyle=`rgba(255,200,120,${(1-q)*.9})`;c.fillRect(ex,ey,1.4,1.4)}
  glo(c,'255,170,80',x,-56,70,.55,60)}

// ---------- the altar, the bow, the quiver, the beam of moonlight
// AL: the altar of this frame. Seen from the front it is long across (ALT0); seen from the side (3.2) it is long in depth (ALTS)
const ALT0={x:0,z:180,w:76,d:30,h:20,rot:0},ALTS={x:0,z:150,w:26,d:76,h:20,rot:1};let AL=ALT0;
const alC=()=>[AL.x,AL.z+AL.d/2];
function altarFront(c,t){const F=col=>fogc(col,AL.z),x0=AL.x-AL.w/2;stoneBlock(c,x0,-AL.h,AL.w,AL.h,F,77,{lw:2.4});
  // the carved ring with the moss sign, a faint green light in the grooves
  const gl=.6+.4*Math.sin(t*1.7),R=Math.min(7,AL.w*.28);c.strokeStyle=F('#1d2420');c.lineWidth=2.2;c.beginPath();c.arc(AL.x,-AL.h/2,R,0,FTAU);c.stroke();
  c.strokeStyle=`rgba(150,255,100,${.4*gl})`;c.lineWidth=1.1;c.beginPath();c.arc(AL.x,-AL.h/2,R,0,FTAU);c.moveTo(AL.x,-AL.h/2-R*.65);c.quadraticCurveTo(AL.x+R*.65,-AL.h/2,AL.x,-AL.h/2+R*.65);c.quadraticCurveTo(AL.x-R*.65,-AL.h/2,AL.x,-AL.h/2-R*.65);c.stroke();
  c.fillStyle=F(CQ.moss);c.beginPath();c.ellipse(x0+Math.min(10,AL.w*.3),-1.5,Math.min(16,AL.w*.4),4,0,Math.PI,FTAU);c.fill()}
function altarSides(c){const y=-AL.h,x0=AL.x-AL.w/2,x1=AL.x+AL.w/2,z0=AL.z,z1=AL.z+AL.d;
  for(const xs of[x0,x1]){if((xs===x0&&C.x>=x0)||(xs===x1&&C.x<=x1))continue;if(gpoly(c,[[xs,0,z0],[xs,0,z1],[xs,y,z1],[xs,y,z0]])){const a=pr(xs,0,z0),b=pr(xs,0,z1),g=c.createLinearGradient(a[0],0,b[0],0);
      g.addColorStop(0,fogc(xs===x0?CQ.stoneD:mc(CQ.stone,CQ.stoneL,.3),z0));g.addColorStop(1,fogc(CQ.stoneD,z1));c.fillStyle=g;c.fill();c.strokeStyle=fogc(INKC,z0);c.lineWidth=2;c.stroke()}}
  if(C.y<y-1&&gpoly(c,[[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1]])){c.fillStyle=fogc(mc(CQ.stone,CQ.stoneL,.22),AL.z);c.fill();c.strokeStyle=fogc(INKC,AL.z);c.lineWidth=2;c.stroke()}}
// a thick 3D stroke (outline, then colour): pts in the world, widths in world units
function wstroke(c,pts,w,col,ink,hl){const P=pts.map(q=>pr(q[0],q[1],q[2]));c.lineCap='round';c.lineJoin='round';
  if(ink){c.strokeStyle=ink;for(let i=0;i<P.length-1;i++){c.lineWidth=(w[i]+1.5)*P[i][2];c.beginPath();c.moveTo(P[i][0],P[i][1]);c.lineTo(P[i+1][0],P[i+1][1]);c.stroke()}}
  c.strokeStyle=col;for(let i=0;i<P.length-1;i++){c.lineWidth=w[i]*P[i][2];c.beginPath();c.moveTo(P[i][0],P[i][1]);c.lineTo(P[i+1][0],P[i+1][1]);c.stroke()}
  if(hl){c.strokeStyle=hl;for(let i=0;i<P.length-1;i++){c.lineWidth=w[i]*.3*P[i][2];c.beginPath();c.moveTo(P[i][0],P[i][1]-w[i]*.25*P[i][2]);c.lineTo(P[i+1][0],P[i+1][1]-w[i]*.25*P[i][2]);c.stroke()}}}
// the bow lying on the altar: across it (rot 0) or along it (rot 1)
function bowPts(){const y=-AL.h-1.6,[cx,cz]=alC(),pts=[],w=[];for(let i=0;i<=12;i++){const k=i/12*2-1;
    if(AL.rot)pts.push([cx-4+7*(1-k*k),y,cz+k*26]);else pts.push([cx-6+k*27,y,cz+1+7*(1-k*k)]);w.push(2.9*(1-.5*Math.abs(k)))}return{pts,w}}
function bowOnAltar(c,t){const{pts,w}=bowPts(),F=col=>fogc(col,AL.z);
  // the string first (under the bow), then the bow: ash wood, the leather grip, horn tips
  const a=pr(pts[0][0],pts[0][1],pts[0][2]),b=pr(pts[12][0],pts[12][1],pts[12][2]);c.strokeStyle=F('#f6ead2');c.lineWidth=.6*(a[2]+b[2])/2;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();
  wstroke(c,pts,w,F('#a4703d'),F(INKC),rgba(F('#d9b27a'),.8));wstroke(c,pts.slice(5,8),[3.4,3.4],F('#5a3a22'),null);
  for(const q of[pts[0],pts[12]]){const p=pr(q[0],q[1],q[2]);c.fillStyle=F('#efe3c4');c.beginPath();c.arc(p[0],p[1],1.6*p[2],0,FTAU);c.fill();c.strokeStyle=F(INKC);c.lineWidth=.8*p[2];c.stroke()}}
function quiverOnAltar(c,t){const F=col=>fogc(col,AL.z),y=-AL.h-3.3,[cx,cz]=alC(),A=AL.rot?[cx+8,y,cz+24]:[cx+2,y,cz+11],B=AL.rot?[cx+7,y,cz-6]:[cx+20,y,cz-7];
  wstroke(c,[A,B],[6.6],F('#7a5232'),F(INKC),rgba(F('#a87a4a'),.7));
  for(const k of[.22,.78]){const q=[flp(A[0],B[0],k),y-3.4,flp(A[2],B[2],k)],r=[flp(A[0],B[0],k),y+3.4,flp(A[2],B[2],k)];c.strokeStyle=F('#c9a040');c.lineWidth=1.6*pr(q[0],q[1],q[2])[2];c.beginPath();wline(c,q,r);c.stroke()}
  // the arrows out of the open end: shafts and red and white feathers
  const dir=[B[0]-A[0],0,B[2]-A[2]],L=Math.hypot(dir[0],dir[2]);dir[0]/=L;dir[2]/=L;
  for(let i=0;i<4;i++){const off=(i-1.5)*1.3,base=[B[0]-dir[2]*off,y-.6,B[2]+dir[0]*off],tip=[base[0]+dir[0]*9,y-1.2-(i%2)*.8,base[2]+dir[2]*9];
    wstroke(c,[base,tip],[.7],F('#d9b27a'),F(INKC));const p=pr(tip[0],tip[1],tip[2]),q=pr(tip[0]-dir[0]*4,tip[1],tip[2]-dir[2]*4);c.fillStyle=F(i%2?'#f6ead2':'#e5484d');c.strokeStyle=F(INKC);c.lineWidth=.6*p[2];
    c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(p[0],p[1]-1.6*p[2]);c.lineTo(p[0]+.6*p[2],p[1]+1.2*p[2]);c.closePath();c.fill();c.stroke()}}
// the beam: from a crack in the vault down to the floor, over the altar; o.a = how strong
function beam(c,t,o){const a=o.a==null?1:o.a,[cx,cz]=alC(),top=o.top||[cx+6,-210,cz],bot=o.bot||[cx,0,cz],wt=o.wt||6,wb=o.wb||34;
  const p0=pr(top[0]-wt,top[1],top[2]),p1=pr(top[0]+wt,top[1],top[2]),p2=pr(bot[0]+wb,bot[1],bot[2]),p3=pr(bot[0]-wb,bot[1],bot[2]);
  c.save();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(0,(p0[1]+p1[1])/2,0,(p2[1]+p3[1])/2),fl=.85+.15*Math.sin(t*.7);
  g.addColorStop(0,`rgba(200,225,255,${.3*a*fl})`);g.addColorStop(.55,`rgba(180,210,255,${.1*a*fl})`);g.addColorStop(1,`rgba(180,210,255,${.03*a})`);c.fillStyle=g;
  c.beginPath();c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1]);c.lineTo(p2[0],p2[1]);c.lineTo(p3[0],p3[1]);c.closePath();c.fill();
  // where it lands: the top of the altar glows
  const sp=o.spot||[cx,-AL.h,cz],q=pr(sp[0],sp[1],sp[2]),sq=fcl((sp[1]-C.y)/Math.max(1,sp[2]-C.z)*1.6,.12,1);
  c.globalAlpha=a*.45;c.drawImage(glowSpr('210,230,255'),q[0]-wb*1.1*q[2],q[1]-wb*1.1*q[2]*sq,wb*2.2*q[2],wb*2.2*q[2]*sq);c.restore()}
// dust in the air: drifting motes, bright inside the beam
function mkDust(n,seed,x0,x1,y0,y1,z0,z1){const r=frng(seed),D=[];for(let i=0;i<n;i++)D.push([flp(x0,x1,r()),flp(y0,y1,r()),flp(z0,z1,r()),r()*9,.3+r()*.7]);return D}
function dustItems(D,t,out,inBeam,fall){for(const[x0,y0,z0,ph,sp] of D){const x=x0+Math.sin(t*.3*sp+ph)*6,y=fall?((y0+t*fall*sp*40)%210)-210:y0+Math.sin(t*.25*sp+ph*2)*5-t*1.5*sp,z=z0+Math.cos(t*.2*sp+ph)*5;
    const b=inBeam?inBeam(x,y,z):.3;out.push({z,c:(c,s)=>{const a=(.25+.75*b)*(1-fz(z)*.8);c.fillStyle=`rgba(225,235,255,${a})`;c.beginPath();c.arc(x,y,.45+b*.35,0,FTAU);c.fill();if(b>.5)glo(c,'210,230,255',x,y,2.6,a*.35)}})}}

// ---------- the slab of the way out
function slabCard(c,x,w,h,z,yOff,t){const F=col=>fogc(col,z);c.save();c.translate(0,yOff);
  c.beginPath();c.moveTo(x-w/2,0);c.lineTo(x-w/2+2,-h);c.lineTo(x+w/2-1,-h-2);c.lineTo(x+w/2,0);c.closePath();
  const g=c.createLinearGradient(x+w/2,-h,x-w/2,0);g.addColorStop(0,F(CQ.stoneL));g.addColorStop(.4,F(CQ.stone));g.addColorStop(1,F(CQ.stoneD));c.fillStyle=g;c.fill();c.strokeStyle=F(INKC);c.lineWidth=2.6;c.stroke();
  c.save();c.clip();c.strokeStyle=rgba(CQ.joint,.7);c.lineWidth=1.4;c.beginPath();c.moveTo(x-w*.3,-h*.15);c.lineTo(x-w*.1,-h*.4);c.lineTo(x-w*.2,-h*.7);c.moveTo(x+w*.25,-h*.85);c.lineTo(x+w*.1,-h*.6);c.stroke();
  // the sign of the crypt carved in relief: a ring and a leaf, lit from the upper left, dark below
  const R=w*.24,cy=-h*.58;for(const[ox,oy,col] of[[1.4,1.4,rgba(CQ.joint,.8)],[-1,-1,rgba(F(CQ.stoneL),.5)]]){c.strokeStyle=col;c.lineWidth=3.2;c.beginPath();c.arc(x+ox,cy+oy,R,0,FTAU);c.stroke();
    c.beginPath();c.moveTo(x+ox,cy+oy-R*.7);c.quadraticCurveTo(x+ox+R*.6,cy+oy,x+ox,cy+oy+R*.7);c.quadraticCurveTo(x+ox-R*.6,cy+oy,x+ox,cy+oy-R*.7);c.moveTo(x+ox,cy+oy-R*.55);c.lineTo(x+ox,cy+oy+R*.55);c.stroke()}
  c.strokeStyle=F(mc(CQ.stone,CQ.stoneL,.15));c.lineWidth=2;c.beginPath();c.arc(x,cy,R,0,FTAU);c.stroke();
  c.fillStyle=F(CQ.moss);c.beginPath();c.ellipse(x-w*.35,-h*.95,w*.25,6,0,0,FTAU);c.fill();c.restore();c.restore()}
// the light that comes through the gaps round the closed slab (blue moonlight)
function slabCracks(c,x,w,h,a,t){if(a<=0)return;c.save();c.globalCompositeOperation='lighter';c.strokeStyle=`rgba(170,205,255,${a})`;c.lineWidth=1.3;
  c.beginPath();c.moveTo(x-w/2+1,-2);c.lineTo(x-w/2+3,-h+4);c.lineTo(x+w/2-2,-h+2);c.lineTo(x+w/2,-4);c.stroke();
  for(const[px,py] of[[x-w/2+2,-h*.5],[x+w/2-1,-h*.35],[x,-h+2]])glo(c,'150,190,255',px,py,22,a*.6);c.restore()}

// ---------- the room of the altar (looking toward the dark way to the corridor)
const RM={x0:-150,x1:150,yTop:-210,zb:420};
const ARCH={x:0,w:96,h:160};
const altarDust=mkDust(70,8,-60,60,-205,-5,130,230);
const screamDust=mkDust(60,9,-140,140,-210,0,20,420);
const ROOTS1=[[-120,RM.yTop,40,2],[-80,RM.yTop,70,2.4],[-20,RM.yTop,30,1.6],[40,RM.yTop,56,2.2],[96,RM.yTop,44,2],[130,RM.yTop,80,2.6]];
function inBeam(x,y,z){const k=fcl(-y/210,0,1),[ax,az]=alC(),cx=flp(ax,ax+6,k),r=flp(34,6,k);return fcl(1-Math.hypot(x-cx,(z-az)*.8)/r,0,1)}
SETS.altare={sky(t,sh){const X0=X;X0.fillStyle='#000';X0.fillRect(-300,-300,FM.W+600,FM.H+600);
    ceilT(X0,RM.x0,RM.x1,C.z+3,RM.zb,RM.yTop);floorT(X0,RM.x0,RM.x1,C.z+3,RM.zb,{seed:4});
    wallX(X0,RM.x0,C.z+3,RM.zb,RM.yTop,{});wallX(X0,RM.x1,C.z+3,RM.zb,RM.yTop,{});
    // the warm pools of the braziers on the floor
    for(const sd of[-1,1]){const q=pr(sd*62,0,200),sq=Math.min(1,Math.max(.12,-C.y/Math.max(20,200-C.z)*1.4));glo(X0,'255,150,70',q[0],q[1],90*q[2],.35,90*q[2]*sq)}},
  items(t,sh,lt){const out=[],sk=shakeAt(t),bowHere=t<BOW_TAKEN;AL=sh.alt||ALT0;
    out.push({z:RM.zb,c:(c,s)=>{doorDepth(c,ARCH,'80,170,60',.12+.06*Math.sin(t*1.3),t);blockWall(c,RM.x0,RM.x1,RM.yTop,RM.zb,{door:ARCH,seed:12});cobweb(c,RM.x0,RM.yTop,40,1,1,RM.zb);cobweb(c,RM.x1,RM.yTop,40,-1,1,RM.zb)}});
    for(const[x,z,lx] of[[-108,90,1],[108,90,-1],[-108,300,1],[108,300,-1]])out.push({z,c:(c,s)=>pillar(c,x,30,RM.yTop,z,lx,t)});
    out.push({z:AL.z,c:(c,s)=>altarFront(c,t)});
    out.push({z:AL.z+AL.d*.6,s:c=>altarSides(c)});
    out.push({z:AL.z-.5,s:c=>{if(bowHere&&C.y<-AL.h-1){quiverOnAltar(c,t);bowOnAltar(c,t)}}});
    for(const sd of[-1,1])out.push({z:200,c:(c,s)=>brazier(c,sd*62,200,t,{lean:sk*(.9+.3*Math.sin(t*20))*sd*.6+sk*.5,h:30+sk*8,seed:sd})});
    out.push({z:RM.zb-10,c:(c,s)=>roots(c,ROOTS1,RM.zb-10,t)});out.push({z:120,c:(c,s)=>roots(c,ROOTS1.map(q=>[q[0]*.9+11,q[1],q[2]*.8,q[3]]),120,t)});
    for(const[x,z,n] of[[-130,140,4],[128,250,3],[-60,400,3],[70,396,4]])out.push({z,c:(c,s)=>drawShrooms(c,x,n,t,(x+z)|0,1.1)});
    dustItems(altarDust,t,out,inBeam);
    if(t>SCREAM1&&t<SCREAM1+2.4)dustItems(screamDust,t-SCREAM1,out,null,2.2);
    // the beam of moonlight stands at the altar: in front of what is behind it, behind what is in front
    if(!sh.noBeam){const[,cz]=alC();out.push({z:cz-.2,s:c=>beam(c,t,{a:sh.beam==null?1:sh.beam})})}
    if(sh.items)sh.items(t,out);
    return out}};

// ---------- the way out (looking back at the door to the stairs, the moon outside)
const EXIT={x:0,w:84,h:130,z:330};
function slabY(t){if(t<SLAB_DROP)return -EXIT.h-20;if(t>=SLAB_HIT)return 0;const k=(t-SLAB_DROP)/(SLAB_HIT-SLAB_DROP);return(-EXIT.h-20)*(1-k*k)}
const exitDust=mkDust(50,21,-90,90,-120,-2,280,330);
function moonStairs(c,d,t,a){// the stairs going up into the moonlight, behind the door
  c.save();c.beginPath();c.moveTo(d.x-d.w/2,0);c.lineTo(d.x-d.w/2,-d.h+d.w*.5);c.arc(d.x,-d.h+d.w*.5,d.w/2,Math.PI,0);c.lineTo(d.x+d.w/2,0);c.closePath();c.clip();
  const g=c.createLinearGradient(0,-d.h,0,0);g.addColorStop(0,`rgba(190,215,255,${a})`);g.addColorStop(.6,`rgba(90,120,170,${a*.85})`);g.addColorStop(1,'rgba(20,30,50,1)');c.fillStyle='#0a1220';c.fillRect(d.x-d.w,-d.h,d.w*2,d.h);c.fillStyle=g;c.fillRect(d.x-d.w,-d.h,d.w*2,d.h);
  for(let i=0;i<7;i++){const y=-4-i*12,w=d.w*(1-i*.08);c.fillStyle=`rgba(${30+i*14},${44+i*18},${70+i*22},${.9})`;c.fillRect(d.x-w/2,y-8,w,8);c.fillStyle=`rgba(200,225,255,${.25*a})`;c.fillRect(d.x-w/2,y-8,w,1.6)}
  c.restore()}
SETS.uscita={sky(t,sh){const X0=X;X0.fillStyle='#000';X0.fillRect(-300,-300,FM.W+600,FM.H+600);
    ceilT(X0,-130,130,C.z+3,EXIT.z,RM.yTop);floorT(X0,-130,130,C.z+3,EXIT.z,{seed:7});wallX(X0,-130,C.z+3,EXIT.z,RM.yTop,{});wallX(X0,130,C.z+3,EXIT.z,RM.yTop,{});
    // the moonlight from the door on the floor, until the slab closes it
    const op=1-seg01(t,SLAB_DROP+.05,SLAB_HIT);if(op>0){X0.save();X0.globalCompositeOperation='lighter';if(gpoly(X0,[[EXIT.x-EXIT.w/2,EXIT.z],[EXIT.x+EXIT.w/2,EXIT.z],[EXIT.x+EXIT.w*.9,EXIT.z-150],[EXIT.x-EXIT.w*.9,EXIT.z-150]])){
      const a=pr(0,0,EXIT.z),b=pr(0,0,EXIT.z-150),g=X0.createLinearGradient(0,a[1],0,b[1]);g.addColorStop(0,`rgba(150,185,240,${.38*op})`);g.addColorStop(1,'rgba(150,185,240,0)');X0.fillStyle=g;X0.fill()}X0.restore()}
    for(const sd of[-1,1]){const q=pr(sd*95,0,150),sq=Math.min(1,Math.max(.12,-C.y/Math.max(20,150-C.z)*1.4));glo(X0,'255,150,70',q[0],q[1],80*q[2],.28,80*q[2]*sq)}},
  items(t,sh,lt){const out=[],op=1-seg01(t,SLAB_DROP+.05,SLAB_HIT),sy=slabY(t),hit=t-SLAB_HIT;
    out.push({z:EXIT.z+2,c:(c,s)=>moonStairs(c,EXIT,t,.9)});
    out.push({z:EXIT.z-3,c:(c,s)=>{if(sy>-EXIT.h-19){c.save();c.beginPath();c.rect(EXIT.x-EXIT.w/2-10,-EXIT.h-40,EXIT.w+20,EXIT.h+40);c.clip();slabCard(c,EXIT.x,EXIT.w+8,EXIT.h+6,EXIT.z-3,sy,t);c.restore()}
      if(t>SLAB_HIT)slabCracks(c,EXIT.x,EXIT.w+8,EXIT.h+6,.75,t)}});
    out.push({z:EXIT.z,c:(c,s)=>{blockWall(c,-130,130,RM.yTop,EXIT.z,{door:EXIT,seed:31});if(op>0)glo(c,'150,190,255',EXIT.x,-EXIT.h*.45,EXIT.w*1.3,.35*op,EXIT.h*.8)}});
    for(const[x,z,lx] of[[-92,120,1],[92,120,-1],[-92,250,1],[92,250,-1]])out.push({z,c:(c,s)=>pillar(c,x,28,RM.yTop,z,lx,t)});
    for(const sd of[-1,1])out.push({z:150,c:(c,s)=>brazier(c,sd*95,150,t,{h:26,seed:sd+5})});
    out.push({z:EXIT.z-12,c:(c,s)=>roots(c,ROOTS1,EXIT.z-12,t)});
    for(const[x,z,n] of[[-110,200,3],[112,280,4]])out.push({z,c:(c,s)=>drawShrooms(c,x,n,t,(x+z)|0,1.1)});
    dustItems(exitDust,t,out,(x,y,z)=>op*fcl(1-Math.abs(x)/50,0,1)*.8);
    // the slab hits the floor: a cloud of dust rolls out
    if(hit>0&&hit<2.5)for(let i=0;i<14;i++){const a=i/14*Math.PI,r=8+hit*55*(.6+.4*Math.sin(i*3.1)),x=EXIT.x+Math.cos(a)*r*1.3,z=EXIT.z-6-Math.sin(a)*r*.7,y=-6-hit*12*(.5+(i%3)*.3);
      out.push({z,c:(c,s)=>{const al=(1-hit/2.5)*.55;const g=c.createRadialGradient(x,y,0,x,y,10+hit*22);g.addColorStop(0,`rgba(150,145,140,${al})`);g.addColorStop(1,'rgba(150,145,140,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,10+hit*22,0,FTAU);c.fill()}})}
    if(sh.items)sh.items(t,out);
    return out}};

// ---------- the slab seen from the side (5.3): it is the plane x = 16 on the right of the hero
SETS.lastra={sky(t,sh){const X0=X;X0.fillStyle='#000';X0.fillRect(-300,-300,FM.W+600,FM.H+600);
    floorT(X0,-300,16,C.z+3,420,{seed:9});ceilT(X0,-300,16,C.z+3,420,RM.yTop);
    // far behind him the room, warm from the braziers
    const q=pr(-120,-40,300);glo(X0,'255,150,70',q[0],q[1],140*q[2],.5,120*q[2]);
    // the slab: a stone face along his right, the moonlight seeping round its edge
    if(gpoly(X0,[[16,0,-40],[16,0,90],[16,-150,90],[16,-150,-40]])){const a=pr(16,0,-10),b=pr(16,0,90),g=X0.createLinearGradient(a[0],0,b[0],0);g.addColorStop(0,CQ.stone);g.addColorStop(1,fogc(CQ.stoneD,90));X0.fillStyle=g;X0.fill();
      X0.save();X0.clip();X0.strokeStyle=rgba(CQ.joint,.7);X0.lineWidth=1.6;X0.beginPath();wline(X0,[16,-40,-40],[16,-58,90]);wline(X0,[16,-90,-40],[16,-80,40]);wline(X0,[16,-80,40],[16,-104,90]);X0.stroke();
      X0.fillStyle=rgba(CQ.moss,.8);X0.beginPath();const m=pr(16,-2,30);X0.ellipse(m[0],m[1],20*m[2],5*m[2],0,0,FTAU);X0.fill();X0.restore();
      X0.save();X0.globalCompositeOperation='lighter';X0.strokeStyle='rgba(170,205,255,.8)';X0.lineWidth=2;X0.beginPath();wline(X0,[16,-150,-40],[16,-150,90]);X0.stroke();X0.restore()}},
  items(t,sh,lt){const out=[];out.push({z:300,c:(c,s)=>{pillar(c,-150,30,RM.yTop,300,1,t);brazier(c,-100,300,t,{h:26,seed:3})}});out.push({z:180,c:(c,s)=>pillar(c,-70,30,RM.yTop,180,1,t)});
    if(sh.items)sh.items(t,out);return out}};

// ---------- the slab behind him (6.1, 6.2): a card filling the background, light through its cracks
SETS.lastra2={sky(t,sh){const X0=X;X0.fillStyle='#000';X0.fillRect(-300,-300,FM.W+600,FM.H+600);floorT(X0,-200,200,C.z+3,40,{seed:11})},
  items(t,sh,lt){const out=[];out.push({z:22,c:(c,s)=>{blockWall(c,-200,200,RM.yTop,22,{seed:44});slabCard(c,0,100,150,22,0,t);slabCracks(c,0,100,150,.85,t)}});
    if(sh.items)sh.items(t,out);return out}};

// ---------- the corridor toward the arena: arches one after the other, moss glowing on the walls, the warm light of the gate at the end
const COR={hw:42,yTop:-120,z1:640};
const corDust=mkDust(40,31,-35,35,-110,-4,0,600);
SETS.corridoio={sky(t,sh){const X0=X;X0.fillStyle='#000';X0.fillRect(-300,-300,FM.W+600,FM.H+600);
    ceilT(X0,-COR.hw,COR.hw,C.z+3,COR.z1,COR.yTop);floorT(X0,-COR.hw,COR.hw,C.z+3,COR.z1,{tw:28,seed:12});wallX(X0,-COR.hw,C.z+3,COR.z1,COR.yTop,{rh:22,bw:36});wallX(X0,COR.hw,C.z+3,COR.z1,COR.yTop,{rh:22,bw:36});
    // the warm light from the gate along the floor
    X0.save();X0.globalCompositeOperation='lighter';if(gpoly(X0,[[-COR.hw,COR.z1],[COR.hw,COR.z1],[COR.hw,COR.z1-260],[-COR.hw,COR.z1-260]])){const a=pr(0,0,COR.z1),b=pr(0,0,COR.z1-260),g=X0.createLinearGradient(0,a[1],0,b[1]);
      g.addColorStop(0,'rgba(255,150,70,.45)');g.addColorStop(1,'rgba(255,150,70,0)');X0.fillStyle=g;X0.fill()}X0.restore()},
  items(t,sh,lt){const out=[];
    out.push({z:COR.z1,c:(c,s)=>{const d={x:0,w:64,h:100};blockWall(c,-90,90,COR.yTop-30,COR.z1,{door:d,seed:51});
      c.save();c.beginPath();c.moveTo(-32,0);c.lineTo(-32,-68);c.arc(0,-68,32,Math.PI,0);c.lineTo(32,0);c.closePath();c.clip();const g=c.createRadialGradient(0,-40,2,0,-40,80);g.addColorStop(0,'#ffd27a');g.addColorStop(.4,'#ff8a3a');g.addColorStop(1,'#5a1e0a');c.fillStyle=g;c.fillRect(-40,-110,80,110);
      // the bars of the gate against the fire
      c.strokeStyle='#120a06';c.lineWidth=4;for(let x=-28;x<=28;x+=9.3){c.beginPath();c.moveTo(x,0);c.lineTo(x,-104);c.stroke()}c.lineWidth=3.4;for(const y of[-24,-62]){c.beginPath();c.moveTo(-34,y);c.lineTo(34,y);c.stroke()}c.restore();
      glo(c,'255,150,70',0,-50,120,.55,90)}});
    for(let z=60;z<COR.z1;z+=70)out.push({z,c:(c,s)=>{// an arch across the corridor
      const F=col=>fogc(col,z);c.fillStyle=F(mc(CQ.stone,CQ.stoneD,.2));c.strokeStyle=F(INKC);c.lineWidth=2.2;
      c.beginPath();c.moveTo(-COR.hw-8,0);c.lineTo(-COR.hw-8,COR.yTop-10);c.lineTo(COR.hw+8,COR.yTop-10);c.lineTo(COR.hw+8,0);c.lineTo(COR.hw-6,0);c.lineTo(COR.hw-6,-80);c.quadraticCurveTo(COR.hw-6,-104,0,-106);c.quadraticCurveTo(-COR.hw+6,-104,-COR.hw+6,-80);c.lineTo(-COR.hw+6,0);c.closePath();c.fill();c.stroke();
      c.strokeStyle=rgba(F(CQ.stoneL),.25);c.lineWidth=1.4;c.beginPath();c.moveTo(-COR.hw+7,-80);c.quadraticCurveTo(-COR.hw+7,-102,0,-104);c.stroke();
      // glowing moss on the arch
      c.fillStyle=F(CQ.moss);c.beginPath();c.ellipse(-COR.hw+2,-6,10,5,0,Math.PI,FTAU);c.fill();glo(c,'120,230,90',-COR.hw+2,-8,16,.25*(1-fz(z)));
      if((z/70)%2<1)drawShrooms(c,COR.hw-10,3,t,z|0,.9)}});
    dustItems(corDust,t,out,(x,y,z)=>fcl((z-300)/300,0,1)*.6);
    if(sh.items)sh.items(t,out);return out}};
