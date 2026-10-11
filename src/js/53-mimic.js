// =====================================================================
// THE MIMIC, Dark Souls style: a rotten chest that stands up on long, thin, pale legs with backward knees,
// long arms hanging to the floor with clawed fingers. The lid breathes, showing teeth; a tongue hangs out.
// Front, side and back views; it unfolds out of the chest when it wakes up.
// =====================================================================
function drawMimicDS(e){const B=basis(e.face),side=B.side,back=B.back,f=B.f,t=G.t||0,ph=e.hopT||0,moving=e.st==='walk',x=e.x,gy=e.y+12;
  const it=e.intro>0?(e.iT||0):9,legK=e.intro>0?clamp((it-.45)/.6,0,1):1,armK=e.intro>0?clamp((it-.7)/.55,0,1):1;
  const wind=e.st==='chomp'&&e.sub==='a',lunge=e.st==='chomp'&&e.sub==='b',quake=e.st==='quake',spit=e.st==='coins'||e.st==='tongue';
  const crouch=wind?.7:quake?.75:1,legs=legK*crouch,bob=moving?Math.abs(Math.sin(ph))*2.2:0,z=quake?(e.z||0):0;
  const twitch=(t%3.3)<.16?Math.sin(t*90)*1.6:0,shake=e.intro>0&&it<.45?Math.sin(t*70)*2.2:0;
  const breath=.1+.07*Math.sin(t*1.7),chew=moving?Math.abs(Math.sin(t*6))*.25:0,introOp=e.intro>0?clamp((it-1.05)/.35,0,1):0;
  const op=Math.max(e.intro>0?introOp:(e.mouth||0),e.intro>0?0:Math.max(breath,chew));
  const W=side?15:20,hip=22*legs,yb=-hip-2-bob,yt=yb-22,K='#1b1612';
  const skin='#9d968a',skinD='#6a645b',wood='#5a3a22',woodD='#38220f',woodL='#76502e',band='#7a5a2a',bandL='#b08a40';
  ctx.save();ctx.translate(x+twitch+shake,gy-z);ctx.scale(f,1);if(lunge&&side)ctx.rotate(.14);
  const limb=(pts,w,col)=>{ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.strokeStyle=K;ctx.lineWidth=w+3;ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke();
    ctx.fillStyle=col;ctx.strokeStyle=K;ctx.lineWidth=1.4;for(let i=1;i<pts.length-1;i++){ctx.beginPath();ctx.arc(pts[i][0],pts[i][1],w*.62,0,TAU);ctx.fill();ctx.stroke()}};
  const claws=(hx,hy,dir,len,col,up)=>{ctx.lineCap='round';for(let k=-1;k<=1;k++){const a=dir+k*.42,mx=hx+Math.cos(a)*len*.55,my=hy+Math.sin(a)*len*.55,ex=hx+Math.cos(a+(up?-.5:.5)*.6)*len,ey=hy+Math.sin(a+(up?-.5:.5)*.6)*len;
    ctx.strokeStyle=K;ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(hx,hy);ctx.quadraticCurveTo(mx,my,ex,ey);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=1.8;ctx.stroke();ctx.fillStyle='#e8e0cc';ctx.beginPath();ctx.arc(ex,ey,1.1,0,TAU);ctx.fill()}};
  // --- arms: hanging to the floor, raised wide before the bite, reaching forward in the lunge
  const arm=(s,far)=>{if(armK<.02)return;const sx=side?(far?-3:3):s*W,sy=yt+7,col=far?skinD:skin;let ex,ey,hx,hy,dir,up=false;
    if(wind||quake){ex=sx+(side?8:s*16);ey=yt-8;hx=sx+(side?14:s*22);hy=yt-24;dir=-Math.PI/2+(side?.6:s*.5);up=true}
    else if(lunge||spit){ex=sx+(side?14:s*12);ey=yb-4;hx=sx+(side?30:s*18);hy=yb-10;dir=side?0:(s>0?-.2:Math.PI+.2)}
    else{const sw=Math.sin(t*2+s)*2.5+(moving?Math.sin(ph+(s>0?0:Math.PI))*5:0);ex=sx+(side?6+sw*.4:s*12);ey=yb+3;hx=sx+(side?9+sw:s*(9+sw*.4));hy=-4;dir=Math.PI/2+(side?-.3:s*-.25)}
    ex=sx+(ex-sx)*armK;ey=sy+(ey-sy)*armK;hx=sx+(hx-sx)*armK;hy=sy+(hy-sy)*armK;limb([[sx,sy],[ex,ey],[hx,hy]],3.4,col);claws(hx,hy,dir,9*armK,col,up)};
  // --- legs: thin, pale, the knees bent the wrong way
  const leg=(hx,s,far,phase)=>{if(legs<.02)return;const lift=moving?Math.max(0,Math.sin(ph+phase))*7:0,col=far?skinD:skin;
    const fx=side?hx+(moving?Math.sin(ph+phase)*10:0):hx*1.6,fy=-lift,hy=-hip-bob,kx=side?(hx+fx)/2-10*legs:hx*2.3+s*3,ky=hy*.45-lift*.4;
    limb([[hx,hy],[kx,ky],[fx,fy]],3.6,col);claws(fx,fy,side?0:(s>0?.3:Math.PI-.3),6,col,false)};
  // --- the chest
  const chest=()=>{ctx.beginPath();ctx.rect(-W,yt,W*2,yb-yt);ctx.fillStyle=vGrad(-W,W,woodL,wood,woodD);ctx.fill();ctx.strokeStyle=K;ctx.lineWidth=2.6;ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.2;for(const yy of [yt+7,yt+14]){ctx.beginPath();ctx.moveTo(-W+2,yy);ctx.lineTo(W-2,yy+(Math.sin(yy)*1));ctx.stroke()}
    ctx.strokeStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.moveTo(-W*.3,yt+3);ctx.lineTo(-W*.15,yt+9);ctx.lineTo(-W*.35,yt+13);ctx.stroke();
    for(const bx of side?[-W+3,W-6]:[-W+3,W-6]){ctx.fillStyle=band;ctx.fillRect(bx,yt,3.5,yb-yt);ctx.strokeStyle=K;ctx.lineWidth=1.6;ctx.strokeRect(bx,yt,3.5,yb-yt);ctx.fillStyle=bandL;for(const ry of [yt+4,yb-4]){ctx.beginPath();ctx.arc(bx+1.75,ry,1.2,0,TAU);ctx.fill()}}
    ctx.fillStyle=band;ctx.fillRect(-W,yb-4,W*2,3);ctx.strokeStyle=K;ctx.lineWidth=1.6;ctx.strokeRect(-W,yb-4,W*2,3);
    ctx.fillStyle='rgba(60,80,40,.55)';ctx.beginPath();ctx.ellipse(-W*.55,yb-2,4,1.6,0,0,TAU);ctx.ellipse(W*.4,yt+18,3,1.3,0,0,TAU);ctx.fill()};
  const teethRow=(x0,x1,y0,dir,n,big)=>{ctx.fillStyle='#efe6c8';ctx.strokeStyle=K;ctx.lineWidth=1.1;for(let i=0;i<n;i++){const u=(i+.5)/n,tx=x0+(x1-x0)*u,h=(big?6:4)*(.7+.5*Math.abs(Math.sin(i*2.7)));ctx.beginPath();ctx.moveTo(tx-2.2,y0);ctx.lineTo(tx+Math.sin(i)*.8,y0+dir*h);ctx.lineTo(tx+2.2,y0);ctx.closePath();ctx.fill();ctx.stroke()}};
  const tongue=(x0,y0,dx)=>{const len=(10+op*24)*(e.intro>0?introOp:1);if(len<3)return;const sw=Math.sin(t*3.4)*4,ex=x0+dx*len*.35+sw,ey=y0+len;ctx.lineCap='round';
    for(const[c,w] of [[K,8],['#8a2a3a',5.4]]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(x0+dx*6,y0+len*.5,ex,ey);ctx.stroke()}
    ctx.strokeStyle='rgba(230,140,150,.6)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x0-1,y0+2);ctx.quadraticCurveTo(x0+dx*5,y0+len*.5,ex-1,ey-2);ctx.stroke();
    const d=(t*1.3)%1;ctx.fillStyle='rgba(220,230,200,.8)';ctx.beginPath();ctx.ellipse(ex,ey+3+d*12,1.3,2+d,0,0,TAU);ctx.fill()};
  if(side){arm(0,true);leg(-5,0,true,Math.PI)}else{arm(-1,false);arm(1,false)}
  if(!side){leg(-9,-1,false,0);leg(9,1,false,Math.PI)}
  chest();
  if(back){// the back of the lid and its hinges; no teeth from behind
    const gp=op*10;ctx.fillStyle='#0d0806';ctx.fillRect(-W+1,yt-gp,W*2-2,gp);ctx.beginPath();ctx.moveTo(-W,yt-gp);ctx.quadraticCurveTo(0,yt-gp-12,W,yt-gp);ctx.lineTo(W,yt-gp+3);ctx.lineTo(-W,yt-gp+3);ctx.closePath();ctx.fillStyle=wood;ctx.fill();ctx.strokeStyle=K;ctx.lineWidth=2.6;ctx.stroke();
    for(const hx of [-W*.5,W*.5]){ctx.fillStyle=band;ctx.fillRect(hx-3,yt-gp-3,6,8);ctx.strokeStyle=K;ctx.lineWidth=1.4;ctx.strokeRect(hx-3,yt-gp-3,6,8)}}
  else if(side){// the lid hinges at the back and opens towards where it looks
    const ang=-op*.95;ctx.save();ctx.beginPath();ctx.moveTo(-W,yt);ctx.lineTo(W+2,yt);ctx.lineTo(W+2+Math.cos(ang)*0,yt);ctx.lineTo(-W+Math.cos(ang)*(W*2+2),yt+Math.sin(ang)*(W*2+2));ctx.closePath();ctx.fillStyle='#2a0808';ctx.fill();
    ctx.save();ctx.globalCompositeOperation='lighter';glow('150,60,30',W*.4,yt-op*8,14*op+2,.5*op);ctx.restore();ctx.restore();
    teethRow(-W*.2,W,yt,-1,5,true);
    ctx.save();ctx.translate(-W,yt);ctx.rotate(ang);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(W,-12,W*2+2,0);ctx.lineTo(W*2+2,3);ctx.lineTo(0,3);ctx.closePath();ctx.fillStyle=wood;ctx.fill();ctx.strokeStyle=K;ctx.lineWidth=2.6;ctx.stroke();
    ctx.strokeStyle=band;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(W,-12,W*2+2,0);ctx.stroke();if(op>.08)teethRow(W*.8,W*2,3,1,4,false);ctx.restore();
    if(op>.15)tongue(W*.75,yt-1,1);leg(5,0,false,0);arm(0,false)}
  else{// front: the lid lifts, two rows of teeth, the dark throat, the tongue spilling over the edge
    const gp=op*16;if(gp>1){ctx.beginPath();ctx.ellipse(0,yt-gp*.45,W-2,gp*.62+1,0,0,TAU);ctx.fillStyle='#2a0808';ctx.fill();ctx.strokeStyle=K;ctx.lineWidth=2;ctx.stroke();
      ctx.save();ctx.globalCompositeOperation='lighter';glow('150,60,30',0,yt-gp*.4,W*.8,.45*op);ctx.restore();teethRow(-W+3,W-3,yt,-1,7,true);teethRow(-W+4,W-4,yt-gp,1,6,false)}
    else teethRow(-W+5,W-5,yt+.5,-1,7,false);
    ctx.beginPath();ctx.moveTo(-W,yt-gp);ctx.quadraticCurveTo(0,yt-gp-12,W,yt-gp);ctx.lineTo(W,yt-gp+3);ctx.lineTo(-W,yt-gp+3);ctx.closePath();ctx.fillStyle=woodL;ctx.fill();ctx.strokeStyle=K;ctx.lineWidth=2.6;ctx.stroke();
    ctx.strokeStyle=band;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(-W,yt-gp);ctx.quadraticCurveTo(0,yt-gp-12,W,yt-gp);ctx.stroke();
    ctx.fillStyle=band;ctx.fillRect(-3,yt-gp-2,6,6);ctx.strokeStyle=K;ctx.lineWidth=1.4;ctx.strokeRect(-3,yt-gp-2,6,6);ctx.fillStyle=K;ctx.fillRect(-.8,yt-gp,1.6,2.6);
    if(op>.15)tongue(2,yt-1,.3)}
  ctx.restore()}
{const _dm=drawMimic;drawMimic=function(e){if(BOSS2)drawMimicDS(e);else _dm(e)}}

