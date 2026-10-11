// =====================================================================
// BIG ARENAS: camera that follows the hero, the chapter landscape past the walls, arrows for enemies out of view
// =====================================================================
const bdCv=document.createElement('canvas');let bdKey='',bdFx=[],bdPal=null,bdSC=1;
// the land past the walls: the arena is a ledge over a dark abyss, inside the ribcage of a colossal dead beast whose skull rises behind the door.
// Candles, skulls on pikes, eyes blinking in the dark and ghost lights; every chapter gives it its own colours and details
const BDPAL={
  moss:{a0:'#06110d',a1:'#0a0910',mist:'90,255,170',eye:'120,235,80',bone:'#cbc69c',bs:'#7f7b58',bh:'#ece7be',st:['#3d443d','#272c29','#161a18'],acc:'#5f9a3a',acc2:'#8fd14f'},
  lava:{a0:'#170604',a1:'#0b0303',mist:'255,90,30',eye:'255,200,90',bone:'#9c8a78',bs:'#5a463a',bh:'#c9b6a0',st:['#3e2c25','#281a12','#150c08'],acc:'#ff6a1a',acc2:'#ffc04a'},
  swamp:{a0:'#071311',a1:'#080f0a',mist:'170,240,60',eye:'210,255,90',bone:'#cbc69c',bs:'#7f7b58',bh:'#ece7be',st:['#344231','#222c20','#141a12'],acc:'#3f6e3a',acc2:'#c8f04a'},
  ice:{a0:'#071026',a1:'#0a0c1c',mist:'120,200,255',eye:'130,230,255',bone:'#e2ebf3',bs:'#8ea5bf',bh:'#ffffff',st:['#41516e','#2a3652','#171f38'],acc:'#9fdcff',acc2:'#e8f6ff'}};
function bakeBackdrop(){const th=themeOf(G.room),M=BIG.m+20,W=AW+M*2,H=AH+M*2,kind=LAVAZ.includes(th)?'lava':isSwamp(th)?'swamp':isIce(th)?'ice':'moss',SC=LOWFX?1:2,key=kind+W+'x'+H+SC;if(key===bdKey)return;bdKey=key;
  const Q=BDPAL[kind];bdPal=Q;bdFx=[];bdSC=SC;bdCv.width=W*SC;bdCv.height=H*SC;const c=bdCv.getContext('2d');c.setTransform(SC,0,0,SC,M*SC,M*SC);
  let seed=11;const rn=()=>(seed=(seed*16807)%2147483647)/2147483647,rr=(a,b)=>a+rn()*(b-a);
  const K='#0b0806',ink=w=>{c.strokeStyle=K;c.lineWidth=w;c.lineJoin='round';c.lineCap='round'};
  const inRoom=(x,y,p)=>x>-p&&x<AW+p&&y>-p&&y<AH+p;
  // abyss
  const g=c.createLinearGradient(0,-M,0,AH+M);g.addColorStop(0,Q.a0);g.addColorStop(1,Q.a1);c.fillStyle=g;c.fillRect(-M,-M,W,H);
  const mist=(x,y,r,a)=>{const gg=c.createRadialGradient(x,y,0,x,y,r);gg.addColorStop(0,`rgba(${Q.mist},${a})`);gg.addColorStop(1,`rgba(${Q.mist},0)`);c.fillStyle=gg;c.fillRect(x-r,y-r,r*2,r*2)};
  for(let i=0;i<14;i++){const sd=i%2,y=rr(-M,AH+M);mist(sd?AW+rr(20,M):-rr(20,M),y,rr(60,120),rr(.05,.11))}
  mist(AW/2,-M*.6,220,.16);
  // deep in the abyss: a river of lava, a frozen lake or a poisoned bog shining from below
  {const deep=kind==='lava'?['255,110,30','#ff6a1a','#ffc04a']:kind==='ice'?['120,200,255','#4f86c6','#bfe6ff']:kind==='swamp'?['170,240,60','#3d6a24','#a8d84a']:['90,255,170','#1f5a44','#5fd8a0'],river=(pts,w)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineCap='round';c.lineJoin='round';
      c.strokeStyle=`rgba(${deep[0]},.10)`;c.lineWidth=w*3.2;c.stroke();c.strokeStyle=deep[1];c.globalAlpha=kind==='lava'?.85:.5;c.lineWidth=w;c.stroke();c.strokeStyle=deep[2];c.globalAlpha=kind==='lava'?.7:.35;c.lineWidth=w*.3;c.stroke();c.globalAlpha=1};
    for(const sd of [-1,1]){const pts=[];for(let y=-M;y<=AH+M;y+=40)pts.push([sd<0?-M+34+Math.sin(y*.013)*9:AW+M-34+Math.sin(y*.013+2)*9,y]);river(pts,kind==='lava'?14:10);
      for(let k=0;k<pts.length;k+=3)if(kind==='lava')bdFx.push({k:'lv',x:pts[k][0],y:pts[k][1],r:44,ph:k})}
    const pts=[];for(let x=-M;x<=AW+M;x+=40)pts.push([x,AH+M-30+Math.sin(x*.02)*6]);river(pts,kind==='lava'?14:10);if(kind==='lava')for(let k=1;k<pts.length;k+=3)bdFx.push({k:'lv',x:pts[k][0],y:pts[k][1],r:44,ph:k})}
  // far silhouettes in the abyss: broken spires and dead claws of rock, barely lighter than the dark
  c.fillStyle='rgba(255,255,255,.035)';for(let i=0;i<26;i++){const sd=i%2,x=sd?AW+rr(30,M+10):-rr(30,M+10),y=rr(-M,AH+M),w=rr(8,16),h=rr(30,70);c.beginPath();c.moveTo(x-w,y);c.lineTo(x-w*.3,y-h);c.lineTo(x+w*.2,y-h*.7);c.lineTo(x+w,y);c.fill()}
  // --- shapes
  const boneLine=(x1,y1,cx,cy,x2,y2,w)=>{const path=()=>{c.beginPath();c.moveTo(x1,y1);c.quadraticCurveTo(cx,cy,x2,y2)};
    path();ink(w+5);c.stroke();path();c.strokeStyle=Q.bone;c.lineWidth=w;c.stroke();
    c.save();c.translate(0,w*.18);path();c.strokeStyle=Q.bs;c.lineWidth=w*.45;c.globalAlpha=.7;c.stroke();c.restore();
    c.save();c.translate(-w*.12,-w*.22);path();c.strokeStyle=Q.bh;c.lineWidth=Math.max(1.5,w*.22);c.globalAlpha=.8;c.stroke();c.restore()};
  const knob=(x,y,r)=>{for(const o of [-1,1]){c.beginPath();c.arc(x+o*r*.55,y,r*.62,0,TAU);c.fillStyle=Q.bone;c.fill();ink(2.5);c.stroke()}};
  const smallBone=(x,y,len,a)=>{const dx=Math.cos(a)*len/2,dy=Math.sin(a)*len/2;c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.rect(-len/2,-2.2,len,4.4);c.fillStyle=Q.bone;c.fill();ink(2.2);c.stroke();
    for(const sx of [-len/2,len/2])for(const o of [-1,1]){c.beginPath();c.arc(sx,o*2.6,3.1,0,TAU);c.fillStyle=Q.bone;c.fill();ink(2.2);c.stroke()}c.fillStyle=Q.bone;c.fillRect(-len/2,-1.6,len,3.2);c.restore()};
  const skull=(x,y,r,rot,glowEyes)=>{c.save();c.translate(x,y);c.rotate(rot||0);
    // jaw
    c.beginPath();c.moveTo(-r*.55,r*.35);c.lineTo(-r*.5,r*.95);c.quadraticCurveTo(0,r*1.18,r*.5,r*.95);c.lineTo(r*.55,r*.35);c.closePath();c.fillStyle=Q.bs;c.fill();ink(2.6);c.stroke();
    c.beginPath();c.arc(0,0,r,0,TAU);c.fillStyle=Q.bone;c.fill();ink(2.8);c.stroke();
    c.beginPath();c.arc(-r*.25,-r*.35,r*.42,Math.PI*1.05,Math.PI*1.6);c.strokeStyle=Q.bh;c.lineWidth=Math.max(1.5,r*.18);c.stroke();
    c.fillStyle=K;for(const o of [-1,1]){c.beginPath();c.ellipse(o*r*.4,r*.15,r*.27,r*.31,o*.2,0,TAU);c.fill()}
    c.beginPath();c.moveTo(0,r*.45);c.lineTo(-r*.12,r*.66);c.lineTo(r*.12,r*.66);c.closePath();c.fill();
    c.strokeStyle=K;c.lineWidth=1.6;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*r*.17,r*.82);c.lineTo(i*r*.17,r*1.02);c.stroke()}
    c.restore();if(glowEyes)bdFx.push({k:'sk',x:x-r*.4,y:y+r*.15,x2:x+r*.4,r:r*.22,ph:rn()*9})};
  const candle=(x,y,h)=>{c.beginPath();c.rect(x-3,y-h,6,h);c.fillStyle='#efe1bc';c.fill();ink(2.2);c.stroke();c.fillStyle='#fffbe8';c.fillRect(x-2,y-h+1,1.6,h-2);
    c.beginPath();c.moveTo(x-3,y-h+2);c.quadraticCurveTo(x-5,y-h+6,x-3.5,y-h+8);c.strokeStyle='#efe1bc';c.lineWidth=2;c.stroke();bdFx.push({k:'cd',x,y:y-h,ph:rn()*9})};
  const pike=(x,y)=>{c.beginPath();c.moveTo(x,y);c.lineTo(x+2,y-52);ink(7);c.stroke();c.strokeStyle='#6b4a2a';c.lineWidth=3.5;c.stroke();
    c.beginPath();c.ellipse(x,y,9,3.5,0,0,TAU);c.fillStyle='rgba(0,0,0,.45)';c.fill();skull(x+2,y-56,9,rr(-.25,.25),rn()<.6)};
  const pile=(x,y)=>{c.beginPath();c.ellipse(x,y+6,26,8,0,0,TAU);c.fillStyle='rgba(0,0,0,.45)';c.fill();
    smallBone(x-10,y+3,20,rr(-.4,.4));smallBone(x+9,y+5,18,rr(2.6,3.4));skull(x-9,y-4,8,-.25,false);skull(x+9,y-3,8,.2,false);skull(x,y-14,9,0,rn()<.7);
    if(rn()<.75){candle(x-19,y+4,rr(9,14));candle(x+20,y+6,rr(7,12))}};
  const tomb=(x,y)=>{c.save();c.translate(x,y);c.rotate(rr(-.25,.25));c.beginPath();c.moveTo(-10,0);c.lineTo(-10,-20);c.arc(0,-20,10,Math.PI,0);c.lineTo(10,0);c.closePath();c.fillStyle=Q.st[0];c.fill();ink(2.8);c.stroke();
    c.strokeStyle=Q.st[2];c.lineWidth=2;c.beginPath();c.moveTo(0,-26);c.lineTo(0,-12);c.moveTo(-5,-21);c.lineTo(5,-21);c.stroke();c.fillStyle=Q.acc;c.beginPath();c.ellipse(-4,-1,7,3,0,0,TAU);c.fill();c.restore()};
  const deadTree=(x,y,s)=>{const br=(x0,y0,a,l,w,d)=>{if(d>3||l<5)return;const x1=x0+Math.cos(a)*l,y1=y0+Math.sin(a)*l;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);ink(w+4);c.stroke();c.strokeStyle='#2c231c';c.lineWidth=w;c.stroke();
    br(x1,y1,a-rr(.3,.7),l*.68,w*.65,d+1);br(x1,y1,a+rr(.3,.7),l*.62,w*.6,d+1)};br(x,y,-Math.PI/2+rr(-.2,.2),26*s,7*s,0)};
  const pool=(x,y,rx,ry)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);ink(3);c.stroke();
    if(kind==='lava'){const gg=c.createRadialGradient(x,y,0,x,y,rx);gg.addColorStop(0,'#ffd27a');gg.addColorStop(.45,'#ff7a1a');gg.addColorStop(1,'#a82a0a');c.fillStyle=gg;c.fill();bdFx.push({k:'lv',x,y,r:rx*2.2,ph:rn()*9})}
    else{c.fillStyle=kind==='ice'?'#2f5f8f':'#16302a';c.fill();c.strokeStyle=kind==='ice'?'rgba(220,240,255,.6)':'rgba(200,240,74,.35)';c.lineWidth=1.6;c.beginPath();c.ellipse(x-rx*.2,y-ry*.2,rx*.45,ry*.35,0,0,TAU);c.stroke()}};
  const crystal=(x,y,h)=>{for(const [dx,s] of [[-6,.7],[5,.8],[0,1]]){c.beginPath();c.moveTo(x+dx-5*s,y);c.lineTo(x+dx-3*s,y-h*s);c.lineTo(x+dx+1*s,y-h*s-6*s);c.lineTo(x+dx+5*s,y);c.closePath();c.fillStyle=Q.acc;c.fill();ink(2.4);c.stroke();c.fillStyle='rgba(255,255,255,.6)';c.fillRect(x+dx-2*s,y-h*s+2,1.6,h*s*.6)}};
  const frozen=(x,y)=>{skull(x,y,10,rr(-.3,.3),false);c.beginPath();c.moveTo(x-16,y+14);c.lineTo(x-14,y-14);c.lineTo(x+2,y-20);c.lineTo(x+16,y-10);c.lineTo(x+15,y+14);c.closePath();c.fillStyle='rgba(160,215,255,.35)';c.fill();ink(2.5);c.stroke();
    c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2;c.beginPath();c.moveTo(x-10,y-10);c.lineTo(x-4,y-15);c.stroke()};
  // --- colossal ribs coming out from under the arena on both sides (drawn before the ledge, so they pass beneath it)
  const rib=(x0,y0,cx,cy,x1,y1,w)=>{const N=16,P=[],Qb=t=>[(1-t)**2*x0+2*(1-t)*t*cx+t*t*x1,(1-t)**2*y0+2*(1-t)*t*cy+t*t*y1];
    for(let i=0;i<=N;i++){const t=i/N,[x,y]=Qb(t),[xa,ya]=Qb(Math.min(1,t+.01)),[xb,yb]=Qb(Math.max(0,t-.01)),a=Math.atan2(ya-yb,xa-xb)+Math.PI/2,ww=w*(1.35-t*.75)/2;P.push([x,y,Math.cos(a)*ww,Math.sin(a)*ww])}
    const side=(k,f)=>{c.beginPath();P.forEach(([x,y,nx,ny],i)=>{const X=x+nx*k,Y=y+ny*k;i?c.lineTo(X,Y):c.moveTo(X,Y)});for(let i=P.length-1;i>=0;i--){const[x,y,nx,ny]=P[i];c.lineTo(x+nx*f,y+ny*f)}c.closePath()};
    side(1,-1);c.fillStyle=Q.bone;c.fill();ink(3.2);c.stroke();
    const dn=x1>x0?1:-1;side(dn*1,dn*.15);c.fillStyle=Q.bs;c.globalAlpha=.75;c.fill();c.globalAlpha=1;
    c.beginPath();P.slice(1,N-2).forEach(([x,y,nx,ny],i)=>{const X=x-nx*dn*.55,Y=y-ny*dn*.55;i?c.lineTo(X,Y):c.moveTo(X,Y)});c.strokeStyle=Q.bh;c.lineWidth=Math.max(1.6,w*.16);c.lineCap='round';c.stroke();
    const[ex,ey]=Qb(1);c.beginPath();c.arc(ex,ey,w*.34,0,TAU);c.fillStyle=Q.bone;c.fill();ink(2.6);c.stroke();
    c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1.6;for(const t of [.35,.62]){const[x,y,nx,ny]=P[Math.round(t*N)];c.beginPath();c.moveTo(x+nx*.8,y+ny*.8);c.lineTo(x+nx*.1,y+ny*.1);c.stroke()}};
  for(let y=TOP+20,i=0;y<AH-30;y+=104,i++)for(const sd of [-1,1]){const x0=sd<0?6:AW-6,ox=sd<0?0:AW,len=rr(56,68),drop=rr(48,64),w=rr(13,16);
    rib(x0,y,ox+sd*len*.95,y-16,ox+sd*len,y+drop,w);
    if(kind==='moss'&&rn()<.6){c.fillStyle=Q.acc;c.beginPath();c.ellipse(ox+sd*len*.7,y+4,7,4,0,0,TAU);c.fill();c.fillStyle=Q.acc2;c.beginPath();c.arc(ox+sd*len*.7-2,y+2,2,0,TAU);c.fill()}
    if(kind==='ice'){c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.ellipse(ox+sd*len*.6,y-3,8,2.6,sd*.3,0,TAU);c.fill()}
    if(kind==='lava'){c.strokeStyle=Q.acc;c.lineWidth=1.6;c.beginPath();c.moveTo(ox+sd*len*.5,y-2);c.lineTo(ox+sd*len*.62,y+4);c.lineTo(ox+sd*len*.7,y+1);c.stroke()}}
  // --- the beast's skull behind the back wall, horns spread wide
  {const cx=AW/2,cy=6;
    for(const sd of [-1,1]){const hx=cx+sd*104,path=()=>{c.beginPath();c.moveTo(hx,cy-24);c.bezierCurveTo(hx+sd*50,cy-30,hx+sd*90,cy-40,hx+sd*96,cy-84)};
      path();ink(24);c.stroke();path();c.strokeStyle=Q.bs;c.lineWidth=18;c.stroke();c.save();c.translate(-sd*2,-3);path();c.strokeStyle=Q.bone;c.lineWidth=9;c.stroke();c.restore();
      for(let k=1;k<5;k++){const t=k/5,bx=(1-t)**3*hx+3*(1-t)**2*t*(hx+sd*50)+3*(1-t)*t*t*(hx+sd*90)+t**3*(hx+sd*96),by=(1-t)**3*(cy-24)+3*(1-t)**2*t*(cy-30)+3*(1-t)*t*t*(cy-40)+t**3*(cy-84);c.strokeStyle=K;c.lineWidth=2;c.beginPath();c.arc(bx,by,8-k,0,TAU);c.stroke()}}
    c.beginPath();c.ellipse(cx,cy,118,70,0,0,TAU);c.fillStyle=Q.bone;c.fill();ink(4);c.stroke();
    c.beginPath();c.ellipse(cx,cy+14,118,56,0,0,Math.PI);c.fillStyle=Q.bs;c.globalAlpha=.55;c.fill();c.globalAlpha=1;
    c.beginPath();c.ellipse(cx-30,cy-40,46,14,-.15,Math.PI*1.05,Math.PI*1.85);c.strokeStyle=Q.bh;c.lineWidth=7;c.stroke();
    c.strokeStyle=K;c.lineWidth=2.4;c.beginPath();c.moveTo(cx+20,cy-68);c.lineTo(cx+28,cy-50);c.lineTo(cx+22,cy-42);c.lineTo(cx+34,cy-30);c.moveTo(cx-60,cy-50);c.lineTo(cx-48,cy-44);c.stroke();
    // brow ridges and deep sockets
    for(const sd of [-1,1]){c.beginPath();c.ellipse(cx+sd*50,cy-20,30,23,sd*.25,0,TAU);c.fillStyle=K;c.fill();
      c.beginPath();c.moveTo(cx+sd*18,cy-42);c.quadraticCurveTo(cx+sd*50,cy-56,cx+sd*84,cy-34);ink(9);c.stroke();c.strokeStyle=Q.bone;c.lineWidth=5;c.stroke()}
    if(false){for(const [dx,dy] of [[-80,-40],[70,-52],[0,-66]]){c.fillStyle=Q.acc;c.beginPath();c.ellipse(cx+dx,cy+dy,16,7,0,0,TAU);c.fill();ink(2);c.stroke();c.fillStyle=Q.acc2;c.beginPath();c.ellipse(cx+dx-4,cy+dy-2,6,2.5,0,0,TAU);c.fill()}}
    if(kind==='ice'){c.fillStyle='#ffffff';c.beginPath();c.ellipse(cx,cy-62,70,10,0,Math.PI,0);c.fill();ink(2);c.stroke();for(const dx of [-40,-12,22,50]){c.beginPath();c.moveTo(cx+dx-4,cy-56);c.lineTo(cx+dx,cy-44);c.lineTo(cx+dx+4,cy-56);c.fillStyle=Q.acc2;c.fill()}}
    if(kind==='lava'){c.strokeStyle=Q.acc;c.lineWidth=2.4;c.beginPath();c.moveTo(cx-10,cy-70);c.lineTo(cx-4,cy-52);c.lineTo(cx-16,cy-40);c.stroke()}
    if(kind==='swamp'||kind==='moss'){c.fillStyle=kind==='moss'?'#3f6e3a':Q.acc;for(const dx of [-70,-30,40,80]){c.beginPath();c.moveTo(cx+dx,cy-48+Math.abs(dx)*.2);c.quadraticCurveTo(cx+dx+4,cy-30,cx+dx+1,cy-16);c.lineTo(cx+dx-3,cy-16);c.quadraticCurveTo(cx+dx-1,cy-30,cx+dx-4,cy-48+Math.abs(dx)*.2);c.fill()}}
    // only a shape in the dark (Denis): a heavy veil over the skull and its horns, and no light in its eyes
    c.save();c.translate(cx,cy-24);c.scale(1,.56);const vg=c.createRadialGradient(0,0,30,0,0,250);vg.addColorStop(0,'rgba(4,3,8,.88)');vg.addColorStop(.62,'rgba(4,3,8,.84)');vg.addColorStop(1,'rgba(4,3,8,0)');c.fillStyle=vg;c.fillRect(-250,-250,500,500);c.restore()}
  // --- the tail of the beast along the bottom: a row of vertebrae sinking into the abyss
  for(let x=-30;x<AW+40;x+=30){const y=AH+46+Math.sin(x*.02)*8;c.beginPath();c.ellipse(x,y,13,9,0,0,TAU);c.fillStyle=Q.bone;c.fill();ink(2.8);c.stroke();
    c.beginPath();c.moveTo(x-4,y-6);c.lineTo(x,y-18);c.lineTo(x+4,y-6);c.closePath();c.fill();c.stroke();c.fillStyle=Q.bs;c.beginPath();c.ellipse(x,y+3,8,3,0,0,TAU);c.fill()}
  // --- the ledge: a rough rim of rock on the sides and a cliff face below, so the arena stands over the abyss
  const rock=(x,y,w,h)=>{c.beginPath();c.moveTo(x-w/2,y+h*.4);c.lineTo(x-w*.42,y-h*.35);c.lineTo(x-w*.1,y-h/2);c.lineTo(x+w*.38,y-h*.38);c.lineTo(x+w/2,y+h*.3);c.lineTo(x+w*.1,y+h/2);c.closePath();c.fillStyle=Q.st[1];c.fill();ink(2.6);c.stroke();
    c.beginPath();c.moveTo(x-w*.38,y-h*.3);c.lineTo(x-w*.1,y-h*.44);c.lineTo(x+w*.32,y-h*.32);c.strokeStyle=Q.st[0];c.lineWidth=2.4;c.stroke()};
  {const fg=c.createLinearGradient(0,AH,0,AH+30);fg.addColorStop(0,Q.st[1]);fg.addColorStop(1,Q.st[2]);c.beginPath();c.moveTo(-14,AH-4);c.lineTo(AW+14,AH-4);
    for(let x=AW+14;x>=-14;x-=12)c.lineTo(x,AH+22+rn()*12);c.closePath();c.fillStyle=fg;c.fill();ink(3);c.stroke();
    c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=2;for(let x=0;x<AW;x+=rr(18,34)){c.beginPath();c.moveTo(x,AH+2);c.lineTo(x+rr(-4,4),AH+18);c.stroke()}}
  for(let y=-6;y<AH+8;y+=rr(13,19)){rock(-rr(6,10),y,rr(14,20),rr(14,19));rock(AW+rr(6,10),y,rr(14,20),rr(14,19))}
  if(kind==='moss')for(let y=10;y<AH;y+=rr(40,90))for(const x of [-8,AW+8]){c.fillStyle=Q.acc;c.beginPath();c.ellipse(x,y,7,4,0,0,TAU);c.fill();ink(1.8);c.stroke()}
  if(kind==='ice')for(let y=10;y<AH;y+=rr(30,60))for(const x of [-8,AW+8]){c.fillStyle='#f4fbff';c.beginPath();c.ellipse(x,y-5,8,3,0,0,TAU);c.fill()}
  // --- props in the dark between the ribs, in the corners and along the tail
  const spots=[];for(let y=TOP+70;y<AH-40;y+=104)for(const sd of [-1,1])spots.push([sd<0?-rr(40,62):AW+rr(40,62),y+rr(-4,10)]);
  for(const [x,y] of [[-40,-14],[AW+40,-14],[-44,AH+30],[AW+44,AH+30],[AW*.25,AH+64],[AW*.72,AH+66]])spots.push([x,y]);
  spots.forEach(([x,y],i)=>{const r=rn();
    if(i>=spots.length-6&&i<spots.length-2){pike(x,y+10);candle(x-14,y+12,10);candle(x+13,y+14,8);return}
    if(r<.32)pile(x,y);else if(r<.5)pike(x,y+8);
    else if(kind==='moss'){rn()<.5?tomb(x,y+8):deadTree(x,y+12,.8)}
    else if(kind==='lava'){pool(x,y+6,16,7);smallBone(x+6,y-2,16,rr(0,3))}
    else if(kind==='swamp'){pool(x,y+6,18,8);skull(x-3,y+3,7,.3,false);c.beginPath();c.ellipse(x-3,y+8,10,3,0,0,TAU);c.fillStyle='#16302a';c.fill()}
    else{rn()<.5?frozen(x,y):crystal(x,y+10,20)}});
  for(let i=0;i<40;i++){const sd=i%3,x=sd===0?-rr(18,M):sd===1?AW+rr(18,M):rr(-M,AW+M),y=sd<2?rr(0,AH):AH+rr(30,M);if(inRoom(x,y,14))continue;smallBone(x,y,rr(10,16),rr(0,3.2))}
  // eyes watching from the abyss
  for(let i=0;i<9;i++){const sd=i%3,x=sd===0?-rr(52,M-6):sd===1?AW+rr(52,M-6):rr(20,AW-20),y=sd<2?rr(TOP,AH):AH+rr(66,M-4);bdFx.push({k:'ey',x,y,ph:rn()*20,s:rr(.8,1.2)})}
  for(let i=0;i<7;i++)bdFx.push({k:'wi',x:rn(),y:rn(),ph:rn()*9});
  // the skull sinks into shadow and mist where it meets the top of the back wall: no hard line
  {const gg=c.createLinearGradient(0,-74,0,2);gg.addColorStop(0,'rgba(0,0,0,0)');gg.addColorStop(.4,'rgba(4,3,8,.5)');gg.addColorStop(.75,'rgba(4,3,8,.88)');gg.addColorStop(1,'rgba(4,3,8,.98)');c.fillStyle=gg;c.fillRect(-M,-74,W,76);
    const mg=c.createLinearGradient(0,-26,0,0);mg.addColorStop(0,`rgba(${Q.mist},0)`);mg.addColorStop(1,`rgba(${Q.mist},.12)`);c.fillStyle=mg;c.fillRect(-M,-26,W,26)}
  // the top of the back wall is a ruined crest of stones of different heights, with the chapter's moss, snow or ash on it
  {let x=-M;const st=Q.st;while(x<AW+M){const w=rr(14,30),h=rr(4,13),top=-h-(rn()<.2?rr(4,9):0),gap=rn()<.12;if(!gap){c.beginPath();c.moveTo(x,2);c.lineTo(x+rr(0,2),top+rr(0,3));c.lineTo(x+w*.5,top+rr(-2,1));c.lineTo(x+w-rr(0,2),top+rr(0,3));c.lineTo(x+w,2);c.closePath();
      const gg=c.createLinearGradient(0,top,0,2);gg.addColorStop(0,st[1]);gg.addColorStop(1,st[2]);c.fillStyle=gg;c.fill();c.fillStyle='rgba(6,4,8,.45)';c.fill();ink(2.2);c.stroke();
      c.strokeStyle=`rgba(${Q.mist},.18)`;c.lineWidth=1.2;c.beginPath();c.moveTo(x+2,top+2);c.lineTo(x+w-3,top+2);c.stroke();
      if(rn()<.55){c.fillStyle=kind==='ice'?'#eef6ff':kind==='lava'?'#3a302b':Q.acc;c.beginPath();c.ellipse(x+w*rr(.3,.7),top+1,w*rr(.25,.45),2.6,0,0,TAU);c.fill()}
      if(kind==='lava'&&rn()<.3){c.strokeStyle=Q.acc;c.lineWidth=1.2;c.beginPath();c.moveTo(x+w*.4,top+3);c.lineTo(x+w*.5,0);c.stroke()}}x+=w+(gap?rr(4,10):rr(-1,1))}
    // a thin mist lying along the wall top
    const mg=c.createLinearGradient(0,-14,0,4);mg.addColorStop(0,`rgba(${Q.mist},0)`);mg.addColorStop(.6,`rgba(${Q.mist},.08)`);mg.addColorStop(1,`rgba(${Q.mist},0)`);c.fillStyle=mg;c.fillRect(-M,-14,W,18)}
  // depth: the farther from the arena, the darker
  const edge=(x0,y0,x1,y1,rx,ry,rw,rh)=>{const gg=c.createLinearGradient(x0,y0,x1,y1);gg.addColorStop(0,'rgba(0,0,0,0)');gg.addColorStop(1,'rgba(0,0,0,.62)');c.fillStyle=gg;c.fillRect(rx,ry,rw,rh)};
  edge(-8,0,-M,0,-M,-M,M-8,H);edge(AW+8,0,AW+M,0,AW+8,-M,M-8,H);edge(0,-30,0,-M,-M,-M,W,M-30);edge(0,AH+30,0,AH+M,-M,AH+30,W,M-30);
  // a static glow for the low-effects mode
  if(LOWFX){c.globalCompositeOperation='lighter';for(const f of bdFx){if(f.k==='cd')mist(f.x,f.y,22,.35);else if(f.k==='big')mist(f.x,f.y,40,.5);else if(f.k==='lv')mist(f.x,f.y,f.r,.25)}c.globalCompositeOperation='source-over'}}
function drawBackdrop(vx,vy){if(!bdCv.width)return;const M=BIG.m+20,Q=bdPal;ctx.drawImage(bdCv,-M,-M,bdCv.width/bdSC,bdCv.height/bdSC);if(LOWFX||!Q)return;
  const t=G.t,vis=(x,y,p)=>x>vx-p&&x<vx+VW+p&&y>vy-p&&y<vy+VH+p;ctx.save();ctx.globalCompositeOperation='lighter';
  for(const f of bdFx){
    if(f.k==='wi'){const x=-M+(f.x*(AW+2*M)+t*(6+f.ph))%(AW+2*M),y=-M+(f.y*(AH+2*M)+Math.sin(t*.6+f.ph)*30+(AH+2*M))%(AH+2*M);if(x>-4&&x<AW+4&&y>-4&&y<AH+4||!vis(x,y,30))continue;const a=.45+.25*Math.sin(t*3+f.ph);glow(Q.mist,x,y,22,a*.5);glow('255,255,255',x,y,4,a);continue}
    if(!vis(f.x,f.y,80))continue;
    if(f.k==='cd'){const fl=1+.18*Math.sin(t*11+f.ph)+.1*Math.sin(t*23+f.ph*2);glow('255,170,70',f.x,f.y-5,30*fl,.38);ctx.globalCompositeOperation='source-over';
      ctx.beginPath();ctx.moveTo(f.x,f.y-1);ctx.quadraticCurveTo(f.x-3.6*fl,f.y-5,f.x+Math.sin(t*9+f.ph),f.y-11*fl);ctx.quadraticCurveTo(f.x+3.6*fl,f.y-5,f.x,f.y-1);ctx.fillStyle='#ffb43a';ctx.fill();
      ctx.beginPath();ctx.ellipse(f.x,f.y-4,1.5,3,0,0,TAU);ctx.fillStyle='#fff6c8';ctx.fill();ctx.globalCompositeOperation='lighter'}
    else if(f.k==='sk'){const a=.55+.35*Math.sin(t*2.2+f.ph);for(const x of [f.x,f.x2]){glow(Q.eye,x,f.y,f.r*5,a*.6);glow('255,255,255',x,f.y,f.r*1.1,a)}}
    else if(f.k==='big'){}
    else if(f.k==='lv')glow('255,120,40',f.x,f.y,f.r,.22+.1*Math.sin(t*1.5+f.ph));
    else if(f.k==='ey'){const cyc=(t*.35+f.ph)%6,open=cyc<4.6?1:cyc<4.75?0:cyc<4.9?1:cyc<5.05?0:1;if(!open)continue;const a=.75+.2*Math.sin(t*2+f.ph),s=f.s;
      for(const o of [-1,1]){glow(Q.eye,f.x+o*5*s,f.y,10*s,a*.5);ctx.fillStyle=`rgba(${Q.eye},${a})`;ctx.beginPath();ctx.ellipse(f.x+o*5*s,f.y,2.6*s,1.5*s,o*.25,0,TAU);ctx.fill()}}}
  ctx.restore()}
// the beast's eyes over the gate: the whole socket glows from inside, drawn after the room lighting so every chapter looks the same
function drawBeastEyes(){const Q=bdPal;if(!Q)return;const t=G.t||0,a=.9+.1*Math.sin(t*1.7);ctx.save();ctx.globalCompositeOperation='lighter';
  for(const f of bdFx){if(f.k!=='big')continue;if(LOWFX){glow(Q.eye,f.x,f.y,f.r*2.2,.6);continue}
    glow(Q.eye,f.x,f.y-2,f.r*2.4,a*.75,f.r*1.8);glow(Q.eye,f.x,f.y-2,f.r*2,a*.5,f.r*1.5);glow(Q.eye,f.x,f.y,f.r*1.2,a);glow('255,255,255',f.x,f.y,f.r*.45,a*.9);glow(Q.eye,f.x,f.y+6,f.r*4.5,a*.25,f.r*2.2)}
  ctx.restore()}
// little arrows on the screen edge pointing at enemies the camera does not show
function drawOffscreen(cw,ch,s,ox,oy,vx,vy){if(G.state!=='play')return;const pad=18*s;
  for(const e of G.enemies){if(e.dead||e.hidden||e.spawn>0)continue;const sx=ox+(e.x-vx)*s,sy=oy+(e.y-vy)*s;if(sx>ox&&sx<ox+VW*s&&sy>oy&&sy<oy+VH*s)continue;
    const cx=clamp(sx,ox+pad,ox+VW*s-pad),cy=clamp(sy,oy+pad+60*s,oy+VH*s-pad-40*s),a=Math.atan2(sy-cy,sx-cx);
    ctx.save();ctx.translate(cx,cy);ctx.rotate(a);ctx.globalAlpha=.75+.25*Math.sin(G.t*6);ctx.beginPath();ctx.moveTo(10*s,0);ctx.lineTo(-6*s,-8*s);ctx.lineTo(-3*s,0);ctx.lineTo(-6*s,8*s);ctx.closePath();
    ctx.fillStyle=isBoss(e.type)?'#ffc93c':'#e5484d';ctx.strokeStyle=INK;ctx.lineWidth=2.5*s;ctx.fill();ctx.stroke();ctx.restore()}}
{const _b=buildRoom;buildRoom=function(){const r=_b.apply(this,arguments);if(AW>VW||AH>VH)bakeBackdrop();camSnap();return r}}
{const _u=update;update=function(dt){_u(dt);if(G&&P)camStep(dt)}}

// =====================================================================
// BOSSES 2 (approved by Denis from the preview in anteprime/): living details, each boss's own world, moves that change the arena,
// the Dark Souls mimic, the witch's sanctuary, the creepy hydra
// =====================================================================
