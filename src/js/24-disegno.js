// ---------- drawing ----------
const PYRO={sc:1,body:'#5a1f1f',hood:'#2a1414',skin:'#d9a07a',foot:'#2a1a14',held:'staff',eyeCol:'#ffb020',hoodTip:true,belt:'#8a5a20'};
const SMITH={sc:1.9,body:'#3a3a42',hood:'#24242a',skin:'#ff7a2e',foot:'#1b1b20',held:'hammer',eyeCol:'#ffd86b',belt:'#6b4a2a',cracks:true};
function drawImp(e){const B=basis(e.face),x=e.x,y=e.y-16+Math.sin(e.t*6)*3,fl=Math.sin(e.t*24)*6;
  ctx.save();ctx.translate(x,y);ink(2.2);
  ctx.fillStyle=B.back?'#8a2a20':'#a8342a';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*5,-3);ctx.lineTo(s*18,-10+fl);ctx.lineTo(s*15,0);ctx.lineTo(s*10,-2);ctx.lineTo(s*7,3);ctx.closePath();ctx.fill();ctx.stroke()}
  ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-2,7);ctx.quadraticCurveTo(-10,14,-6+Math.sin(e.t*5)*3,18);ctx.stroke();ctx.strokeStyle='#c43a2e';ctx.lineWidth=1.6;ctx.stroke();
  ink(2.2);circ(0,0,e.r);fs(e.slow>0?'#c79090':'#e5484d');
  for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*4,-8);ctx.lineTo(s*7,-15);ctx.lineTo(s*8,-6);ctx.closePath();fs('#f2d36b')}
  if(!B.back){const cx=Math.cos(B.qa)*4,cy=Math.sin(B.qa)*2;for(const k of B.side?[1]:[-1,1]){ctx.fillStyle='#ffd86b';circ(cx+k*(B.side?0:3.2),cy-1,2.2);ctx.fill()}
    ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(cx,cy+3,3,.2,Math.PI-.2);ctx.stroke()}
  ctx.restore();glow('255,120,60',x,y,14,.25)}
function drawObsidian(e){const B=basis(e.face),x=e.x,y=e.y;ctx.save();ctx.translate(x,y);ctx.scale(B.f,1);ink(2.5);
  const w=e.moving?Math.sin(e.walk):0;ell(-8+w*3,4,6,5);fs('#24202a');ell(8-w*3,4,6,5);fs('#24202a');
  if(B.side){circ(-15,-10,7);fs('#2a2530')}
  ctx.beginPath();ctx.ellipse(0,-12,B.side?13:16,14,0,0,TAU);const g=ctx.createLinearGradient(-16,-26,16,2);g.addColorStop(0,'#4a4456');g.addColorStop(.5,'#2a2530');g.addColorStop(1,'#16131a');ctx.fillStyle=g;ctx.fill();ctx.stroke();
  ctx.strokeStyle='#ff7a2e';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-8,-20);ctx.lineTo(-2,-12);ctx.lineTo(-6,-4);ctx.moveTo(6,-22);ctx.lineTo(9,-14);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.25)';ell(-6,-20,5,2.5);ctx.fill();
  if(!B.back){const hx=B.v==='s'?0:B.v==='s34'?4:8;ctx.fillStyle='#ffb020';ell(hx-4,-15,2.4,1.6);ctx.fill();if(!B.side){ell(hx+4,-15,2.4,1.6);ctx.fill()}}
  ink(2.5);if(B.side)circ(15,-8,7);else{circ(-17,-9,6.5);fs('#2a2530');circ(17,-9,6.5)}fs('#2a2530');
  ctx.restore()}
function drawSalamander(e){
  if(e.st==='burrow'&&e.sub==='under')return;
  if(e.hidden){ctx.fillStyle='rgba(255,120,40,.5)';ell(e.x,e.y,18,8);ctx.fill();return}
  const tr=e.trail||[{x:e.x,y:e.y}],n=7;
  for(let i=n;i>=1;i--){const idx=Math.max(0,tr.length-1-i*6),p=tr[idx],r=e.r*(1-i*.1);
    ink(2.5);ell(p.x,p.y-8,r,r*.78);fs(i%2?'#c43d18':'#e05220');ctx.fillStyle='rgba(255,210,120,.5)';ell(p.x,p.y-6,r*.5,r*.28);ctx.fill();
    ctx.fillStyle='#7a1f0e';ctx.beginPath();ctx.moveTo(p.x-3,p.y-8-r*.7);ctx.lineTo(p.x,p.y-8-r*1.05);ctx.lineTo(p.x+3,p.y-8-r*.7);ctx.closePath();ctx.fill()}
  const a=Q8(e.face)*Math.PI/4;ctx.save();ctx.translate(e.x,e.y-10);ctx.rotate(a);ink(2.5);
  ctx.beginPath();ctx.ellipse(4,0,e.r*1.15,e.r*.82,0,0,TAU);fs(e.slow>0?'#c79a90':'#e85a22');
  ctx.fillStyle='rgba(255,220,140,.55)';ell(8,0,e.r*.6,e.r*.3);ctx.fill();
  for(const s of [-1,1]){ctx.fillStyle='#ffd86b';circ(e.r*.75,s*e.r*.42,3.4);ctx.fill();ctx.fillStyle=INK;circ(e.r*.82,s*e.r*.42,1.6);ctx.fill();
    ink(2);ctx.beginPath();ctx.moveTo(-2,s*e.r*.7);ctx.lineTo(-10,s*e.r*1.15);ctx.lineTo(4,s*e.r*.82);ctx.closePath();fs('#ffb020')}
  if(e.st==='spit'){ctx.fillStyle='#ffd86b';circ(e.r*1.25,0,4+Math.sin(G.t*30)*1.5);ctx.fill()}
  ctx.restore();if(e.p2)glow('255,120,40',e.x,e.y-10,46,.3)}
function drawRock2(k,x,y,r,sd,S){
  switch(k.kind){
    case 'basalt':{const cols=[[-r*.45,.75,r*.5],[r*.4,1,r*.5],[0,.55,r*.55]];
      for(const[ox,hm,w] of cols){const h=kH(k)*hm,cx=x+ox,cy=y+(ox===0?r*.25:0);
        ctx.beginPath();ctx.moveTo(cx-w,cy);ctx.lineTo(cx-w,cy-h);ctx.lineTo(cx-w*.5,cy-h-w*.35);ctx.lineTo(cx+w*.5,cy-h-w*.35);ctx.lineTo(cx+w,cy-h);ctx.lineTo(cx+w,cy);ctx.lineTo(cx+w*.5,cy+w*.3);ctx.lineTo(cx-w*.5,cy+w*.3);ctx.closePath();
        ctx.fillStyle=vGrad(cx-w,cx+w,'#5a4d46','#3d3430','#231d1a');ctx.fill();ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx-w,cy-h);ctx.lineTo(cx-w*.5,cy-h-w*.35);ctx.lineTo(cx+w*.5,cy-h-w*.35);ctx.lineTo(cx+w,cy-h);ctx.lineTo(cx+w*.5,cy-h+w*.3);ctx.lineTo(cx-w*.5,cy-h+w*.3);ctx.closePath();fs('#6a5c54');
        ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(cx-w*.5,cy-h+w*.3);ctx.lineTo(cx-w*.5,cy+w*.3);ctx.moveTo(cx+w*.5,cy-h+w*.3);ctx.lineTo(cx+w*.5,cy+w*.3);ctx.stroke();ink(2.5)}
      ctx.strokeStyle='#ff7a2e';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x-r*.8,y+2);ctx.lineTo(x-r*.3,y+r*.35);ctx.lineTo(x+r*.2,y+r*.2);ctx.stroke();ink(2.5);break}
    case 'lavarock':{const pts=[];for(let i=0;i<10;i++){const a=i/10*TAU,rr=r*(.86+.14*Math.sin(sd*3+i*2.1));pts.push([x+Math.cos(a)*rr,y-r*.38+Math.sin(a)*rr*.86])}
      ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();const g=ctx.createLinearGradient(x-r,y-r,x+r,y+r*.4);g.addColorStop(0,'#4a3f3a');g.addColorStop(1,'#1e1916');ctx.fillStyle=g;ctx.fill();ctx.stroke();
      const pulse=.7+.3*Math.sin(G.t*2+sd);ctx.strokeStyle=`rgba(255,${120+60*pulse|0},40,.95)`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-r*.5,y-r*.9);ctx.lineTo(x-r*.1,y-r*.4);ctx.lineTo(x+r*.4,y-r*.6);ctx.moveTo(x-r*.1,y-r*.4);ctx.lineTo(x-r*.2,y+r*.1);ctx.stroke();
      glow('255,120,40',x,y-r*.4,r*1.2,.25*pulse);ink(2.5);break}
    case 'obsidian':{ell(x,y,r*.95,r*.4);fs('#1e1a1c');const shards=[[0,0,1,0],[-.55,.15,.7,-.35],[.55,.2,.75,.3]];
      for(const[ox,oy,sz,tilt] of shards){const cx=x+ox*r,cy=y-2+oy*r*.4,h=kH(k)*sz,w=r*.42*sz;ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt);
        ctx.beginPath();ctx.moveTo(-w,0);ctx.lineTo(-w*.6,-h*.75);ctx.lineTo(0,-h);ctx.lineTo(w*.7,-h*.7);ctx.lineTo(w,0);ctx.closePath();const g=ctx.createLinearGradient(-w,0,w,0);g.addColorStop(0,'#5a4a66');g.addColorStop(.4,'#1b1820');g.addColorStop(1,'#0e0c10');ctx.fillStyle=g;ctx.fill();ink(2);ctx.stroke();
        ctx.strokeStyle='rgba(255,140,80,.55)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-w*.3,-h*.2);ctx.lineTo(0,-h*.92);ctx.stroke();ctx.restore()}ink(2.5);break}
    case 'anvil':{ctx.beginPath();ctx.rect(x-r*.65,y-r*.7,r*1.3,r*.7);ctx.fillStyle=vGrad(x-r,x+r,'#8a6038','#6b4a2a','#4a3220');ctx.fill();ctx.stroke();ell(x,y-r*.7,r*.65,r*.25);fs('#a87a4a');
      const ay=y-r*.75;ctx.beginPath();ctx.moveTo(x-r*1.05,ay-r*.55);ctx.lineTo(x+r*.7,ay-r*.55);ctx.quadraticCurveTo(x+r*1.25,ay-r*.5,x+r*1.2,ay-r*.3);ctx.lineTo(x+r*.45,ay-r*.25);ctx.lineTo(x+r*.35,ay);ctx.lineTo(x-r*.45,ay);ctx.lineTo(x-r*.5,ay-r*.25);ctx.lineTo(x-r*.95,ay-r*.32);ctx.closePath();
      ctx.fillStyle=vGrad(x-r,x+r,'#8a929c','#5a5f68','#3a3e45');ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(x-r*.9,ay-r*.53,r*1.5,2);break}
    case 'cauldron':{ctx.strokeStyle=INK;ctx.lineWidth=4;for(const lx of [-.6,0,.6]){ctx.beginPath();ctx.moveTo(x+lx*r,y+2);ctx.lineTo(x+lx*r*.7,y-8);ctx.stroke()}
      ink(2.5);ctx.beginPath();ctx.ellipse(x,y-14,r*.95,r*.75,0,0,Math.PI);ctx.lineTo(x-r*.95,y-14);ctx.closePath();fs('#2a2a30');ctx.beginPath();ctx.ellipse(x,y-14,r*.95,r*.75,0,Math.PI,TAU);fs('#2a2a30');
      ell(x,y-24,r*.9,r*.32);fs('#3a3a40');ell(x,y-24,r*.72,r*.24);const p=.7+.3*Math.sin(G.t*3+sd);ctx.fillStyle=`rgb(255,${110+50*p|0},40)`;ctx.fill();
      ctx.fillStyle='#ffd86b';for(let i=0;i<2;i++){const q=(G.t*.8+i*.5+sd)%1;circ(x+Math.sin(i*3+G.t)*r*.4,y-24-q*6,2*(1-q)+.5);ctx.fill()}break}
    case 'crate':{const s=r*.95,h=kH(k);ctx.beginPath();ctx.rect(x-s,y-h,s*2,h);ctx.fillStyle=vGrad(x-s,x+s,'#b08048','#8a6038','#5a3c22');ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(x-s,y-h);ctx.lineTo(x+s,y-h);ctx.lineTo(x+s-4,y-h-8);ctx.lineTo(x-s+4,y-h-8);ctx.closePath();fs('#c99a5a');
      ctx.strokeStyle='#5a5f68';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x-s,y-h*.3);ctx.lineTo(x+s,y-h*.3);ctx.moveTo(x-s,y-h*.8);ctx.lineTo(x+s,y-h*.8);ctx.stroke();
      ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x-s+3,y-3);ctx.lineTo(x+s-3,y-h+3);ctx.stroke();ink(2.5);break}
  }
}
function bakeLava(c,V){
  const free=(x,y,m)=>!G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+(m||10));
  const spot=m=>{for(let i=0;i<30;i++){const x=rand(L+14,R-14),y=rand(TOP+18,BOT-14);if(free(x,y,m))return[x,y]}return[rand(L+14,R-14),rand(TOP+18,BOT-14)]};
  G.lavaLights=G.lavaLights||[];
  for(let i=0;i<(V.lavaCracks||0);i++){let[x,y]=spot(0);const a0=rand(0,TAU),pts=[[x,y]];for(let k=0;k<6;k++){x+=Math.cos(a0+rand(-.8,.8))*rand(7,14);y+=Math.sin(a0+rand(-.8,.8))*rand(7,14);pts.push([x,y])}
    c.save();c.lineCap='round';c.strokeStyle='#1a1210';c.lineWidth=5;c.beginPath();pts.forEach((p,j)=>j?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();
    c.shadowColor='#ff7a2e';c.shadowBlur=10;c.strokeStyle='#ff8a3c';c.lineWidth=2;c.stroke();c.shadowBlur=0;c.strokeStyle='#ffd86b';c.lineWidth=.8;c.stroke();c.restore();
    G.lavaLights.push({x:pts[3][0],y:pts[3][1],r:40})}
  for(let i=0;i<(V.lavaPools||0);i++){const[x,y]=spot(28),rx=rand(18,30),ry=rx*.5;
    c.save();c.shadowColor='#ff6a1a';c.shadowBlur=16;c.fillStyle='#ff6a1a';c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();c.restore();
    c.fillStyle='#2a1a14';for(let k=0;k<7;k++){c.beginPath();c.ellipse(x+rand(-rx*.6,rx*.6),y+rand(-ry*.5,ry*.5),rand(4,9),rand(2,5),rand(0,3),0,TAU);c.fill()}
    c.strokeStyle='#1b1210';c.lineWidth=3;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.stroke();G.lavaLights.push({x,y,r:rx*2.2})}
  for(let i=0;i<(V.shards||0);i++){const[x,y]=spot(10);c.fillStyle='#1b1820';c.strokeStyle='#0e0c10';c.lineWidth=1;c.beginPath();c.moveTo(x,y-6);c.lineTo(x+3,y);c.lineTo(x-3,y);c.closePath();c.fill();c.stroke();c.strokeStyle='rgba(255,140,80,.5)';c.beginPath();c.moveTo(x,y-5);c.lineTo(x,y-1);c.stroke()}
  for(let i=0;i<(V.grates||0);i++){const[x,y]=spot(22),w=rand(26,40),h=w*.6;c.fillStyle='#1a1210';c.fillRect(x-w/2,y-h/2,w,h);
    c.save();c.shadowColor='#ff6a1a';c.shadowBlur=12;c.fillStyle='rgba(255,110,40,.75)';c.fillRect(x-w/2+3,y-h/2+3,w-6,h-6);c.restore();
    c.strokeStyle='#4a4a52';c.lineWidth=3;for(let gx=x-w/2+5;gx<x+w/2;gx+=6){c.beginPath();c.moveTo(gx,y-h/2);c.lineTo(gx,y+h/2);c.stroke()}c.strokeStyle='#1b1612';c.lineWidth=2;c.strokeRect(x-w/2,y-h/2,w,h);G.lavaLights.push({x,y,r:45})}
  for(let i=0;i<(V.lavaChannel||0);i++){const y=TOP+(BOT-TOP)*(i?.7:.35)+rand(-20,20);
    c.save();c.shadowColor='#ff6a1a';c.shadowBlur=14;c.fillStyle='#ff6a1a';c.fillRect(L,y-9,R-L,18);c.restore();c.fillStyle='rgba(255,220,120,.6)';for(let x=L;x<R;x+=22)c.fillRect(x+rand(0,10),y-2,rand(5,10),2);
    c.fillStyle='#5a5f68';c.fillRect(L,y-12,R-L,3);c.fillRect(L,y+9,R-L,3);c.strokeStyle='#3a3e45';c.lineWidth=2.5;for(let x=L+4;x<R;x+=8){c.beginPath();c.moveTo(x,y-9);c.lineTo(x,y+9);c.stroke()}
    for(let x=L+30;x<R;x+=90)G.lavaLights.push({x,y,r:50})}
  if(V.rune==='magma'||V.rune==='fabbro'){}
}
function lavaGlowLive(){for(const l of (G.lavaLights||[])){glow('255,110,40',l.x,l.y,l.r,.12+.05*Math.sin(G.t*1.6+l.x),l.r*.6)}}

function drawSmith(e){if(e.p2)glow('255,110,40',e.x,e.y-30,70,.35+.1*Math.sin(G.t*6));
  drawRig(e.x,e.y,e.face,e.walk,e.moving,{...SMITH,p2:e.p2},{wind:e.st==='slam'&&e.sub==='a',slam:e.st==='slam'&&e.sub==='b'});
  if(e.st==='anvil'||e.st==='rain'){const p=.5+.5*Math.sin(G.t*20);glow('255,160,60',e.x,e.y-70,26,.5*p)}}
function drawPyro(e){drawRig(e.x,e.y,e.face,e.walk,e.moving,e.slow>0?{...PYRO,body:'#7a5a6a'}:PYRO,{});
  if(e.cast>0){const p=1-e.cast/.65;glow('255,120,40',e.x,e.y-36,14+p*16,.5+p*.4);ctx.fillStyle='#ffd86b';circ(e.x,e.y-36,2+p*4);ctx.fill()}}

