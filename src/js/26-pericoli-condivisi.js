// ---------------- shared hazards: lobbed shots, rolling snowballs ----------------
function lob(sx,sy,tx,ty,o){o=o||{};G.lobs.push({sx,sy,tx:clamp(tx,L+14,R-14),ty:clamp(ty,TOP+14,BOT-14),t:-(o.delay||0),dur:o.dur||1,kind:o.kind||'poison',r:o.r||22,dmg:o.dmg||14,h:o.h==null?90:o.h,fuse:o.fuse||0})}
function updLobs(dt){
  for(let i=G.lobs.length-1;i>=0;i--){const b=G.lobs[i];b.t+=dt;if(b.t<b.dur)continue;
    if(b.kind==='bomb'){if(!b.landed){b.landed=true;b.ft=b.fuse||.6;sfx('click',0,b.tx);stepFx(b.tx,b.ty,false)}b.ft-=dt;if(b.ft>0)continue;
      G.lobs.splice(i,1);G.fx.push({k:'boom',x:b.tx,y:b.ty,t:.35,r:b.r*1.2});vfxBlast(b.tx,b.ty,'255,160,60',b.r*1.6,{fire:8,sparks:16,debris:'stone',n:8,dust:8});stamp('scorch',b.tx,b.ty,b.r);shake(4);sfx('boom',0,b.tx);
      if(Math.hypot(P.x-b.tx,P.y-b.ty)<b.r+P.r*.4)hurtP(Math.round(b.dmg*DMG()));continue}
    G.lobs.splice(i,1);
    if(b.kind==='coins'||b.kind==='sack'||b.kind==='rock'){goldLand(b);continue}
    if(b.kind==='poison'){addZone(b.tx,b.ty,b.r*.85,2.6,'acid');vfxBlast(b.tx,b.ty,'150,230,90',b.r*1.4,{sparks:8,spcol:['#c8f07a','#7bd65a','#e8ffc0'],dust:0,ring2:false,spore:8,sporeRgb:'170,240,110'});sfx('splash',0,b.tx)}
    else if(b.kind==='icicle'){vfxBlast(b.tx,b.ty,'180,225,255',b.r*1.5,{sparks:12,spcol:['#ffffff','#c9f3ff','#8fd0f0'],debris:['#e8f6ff','#a8d8f0','#ffffff'],n:10,dust:4,ring2:false});addZone(b.tx,b.ty,b.r*.8,2.2,'frost');sfx('iceBreak',0,b.tx);shake(2)}
    else if(b.kind==='snow'){vfxBlast(b.tx,b.ty,'230,245,255',b.r*1.3,{sparks:6,spcol:['#ffffff','#e0f0ff'],debris:['#ffffff','#e0ecf4'],n:10,dust:6,ring2:false});sfx('snowball',1,b.tx)}
    if(Math.hypot(P.x-b.tx,P.y-b.ty)<b.r+P.r*.4)hurtP(Math.round(b.dmg*DMG()))}
  for(let i=G.rollers.length-1;i>=0;i--){const o=G.rollers[i];o.life-=dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.rot+=Math.hypot(o.vx,o.vy)*dt/Math.max(6,o.r);o.r=Math.min(o.max,o.r+dt*6);
    let hit=false;if(o.x<L+o.r){o.x=L+o.r;o.vx=Math.abs(o.vx);hit=true}if(o.x>R-o.r){o.x=R-o.r;o.vx=-Math.abs(o.vx);hit=true}if(o.y<TOP+o.r){o.y=TOP+o.r;o.vy=Math.abs(o.vy);hit=true}if(o.y>BOT-o.r){o.y=BOT-o.r;o.vy=-Math.abs(o.vy);hit=true}
    for(const k of G.rocks){const ex=o.x-k.x,ey=o.y-k.y,dd=Math.hypot(ex,ey),m=o.r+k.r;if(dd<m&&dd>.01){if(k.temp){k.life=0;continue}const nx=ex/dd,ny=ey/dd;o.x=k.x+nx*m;o.y=k.y+ny*m;const dot=o.vx*nx+o.vy*ny;if(dot<0){o.vx-=2*dot*nx;o.vy-=2*dot*ny}hit=true;k.hit=.15}}
    if(hit){o.b--;shake(2);sfx('snowball',0,o.x);for(let q=0;q<6;q++)G.debris.push({x:o.x,y:o.y,z:o.r,vx:rand(-80,80),vy:rand(-60,60),vz:rand(60,140),col:pk(['#ffffff','#e0ecf4']),s:rand(1.5,3),rot:0,vr:6,life:1})}
    if(Math.random()<.5)G.fx.push({k:'puff',x:o.x+rand(-o.r*.6,o.r*.6),y:o.y+o.r*.5,vx:-o.vx*.08,vy:-o.vy*.08,t:.4,r:rand(3,6)});
    if(Math.hypot(P.x-o.x,P.y-o.y)<o.r+P.r*.6&&P.inv<=0&&P.dashT<=0){hurtP(Math.round(o.dmg*DMG()));o.life=0}
    if(o.life<=0||o.b<0){vfxBlast(o.x,o.y-o.r*.5,'235,245,255',o.r*2,{sparks:6,spcol:['#ffffff','#e0f0ff'],debris:['#ffffff','#e0ecf4','#c8d8e6'],n:14,dust:10,ring2:false});G.rollers.splice(i,1)}}
}
function drawLobsGround(){
  for(const b of G.lobs){if(b.t<0)continue;const p=clamp(b.t/b.dur,0,1),col=b.kind==='poison'?'150,230,90':b.kind==='bomb'?'255,110,40':b.kind==='snow'?'200,220,255':'140,200,255';
    if(b.kind==='coins'||b.kind==='sack'){ctx.strokeStyle=`rgba(255,210,80,${.4+p*.4})`;ctx.lineWidth=2;circ(b.tx,b.ty,b.r*.8);ctx.stroke();continue}
    if(b.landed){const bl=Math.floor(b.ft*12)%2===0;ctx.strokeStyle=`rgba(255,90,40,${bl?.9:.4})`;ctx.lineWidth=2.5;ctx.setLineDash([5,5]);circ(b.tx,b.ty,b.r);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=`rgba(255,90,40,${bl?.2:.08})`;circ(b.tx,b.ty,b.r);ctx.fill();continue}
    ctx.strokeStyle=`rgba(${col},.75)`;ctx.lineWidth=2.5;circ(b.tx,b.ty,b.r);ctx.stroke();ctx.fillStyle=`rgba(${col},${.08+p*.25})`;circ(b.tx,b.ty,b.r*p);ctx.fill()}
  for(const o of G.rollers){ctx.fillStyle='rgba(40,60,90,.3)';ell(o.x,o.y+o.r*.7,o.r*1.05,o.r*.38);ctx.fill()}
}
function drawLobsAir(){
  for(const b of G.lobs){if(b.t<0)continue;const p=clamp(b.t/b.dur,0,1),x=b.sx+(b.tx-b.sx)*p,gy=b.sy+(b.ty-b.sy)*p,h=b.landed?0:b.kind==='icicle'?(1-p)*(1-p)*320:Math.sin(p*Math.PI)*b.h+(1-p)*(b.sy<b.ty?0:0);
    if(b.landed){ink(2);circ(b.tx,b.ty-5,6);fs('#2a2a30');ctx.fillStyle=Math.floor(b.ft*12)%2?'#ff5a3c':'#ffd86b';circ(b.tx+3,b.ty-12,2.2);ctx.fill();continue}
    shadow(x,gy+3,6*(.5+p*.5),2.5,.25);
    if(b.kind==='poison'){glow('150,230,90',x,gy-h,12,.45);ink(1.8);circ(x,gy-h,5.5);fs('#7bd65a');ctx.fillStyle='#e8ffc0';circ(x-1.5,gy-h-1.5,2);ctx.fill()}
    else if(b.kind==='bomb'){ctx.save();ctx.translate(x,gy-h);ctx.rotate(p*9);ink(2);circ(0,0,6);fs('#2a2a30');ctx.fillStyle='rgba(255,255,255,.35)';circ(-2,-2,1.8);ctx.fill();ctx.strokeStyle='#8a6a44';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(4,-4);ctx.lineTo(7,-8);ctx.stroke();ctx.restore();glow('255,200,90',x+5,gy-h-7,6,.8)}
    else if(b.kind==='coins'||b.kind==='sack'){const fy=gy-(1-p)*(1-p)*300;if(b.kind==='sack'){ctx.save();ctx.translate(x,fy);ink(2);ctx.beginPath();ctx.moveTo(-8,8);ctx.quadraticCurveTo(-11,-2,-4,-6);ctx.lineTo(4,-6);ctx.quadraticCurveTo(11,-2,8,8);ctx.closePath();fs('#c9a26a');ctx.fillStyle='#ffd23c';ctx.font='9px sans-serif';ctx.textAlign='center';ctx.fillText('$',0,5);ctx.strokeStyle='#8a5a20';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-4,-6);ctx.lineTo(4,-6);ctx.stroke();ctx.restore()}
      else for(let k=0;k<3;k++){ink(1.6);circ(x+(k-1)*5,fy-k%2*4,4);fs('#ffc93c')}continue}
    else if(b.kind==='rock'){const fy=gy-(1-p)*(1-p)*300;ink(2.2);circ(x,fy,10);fs(stonePal().mid);ctx.fillStyle='rgba(255,255,255,.2)';circ(x-3,fy-3,3);ctx.fill();continue}
    else if(b.kind==='icicle'){ctx.save();ctx.translate(x,gy-h);ink(1.6);ctx.beginPath();ctx.moveTo(-5,-22);ctx.lineTo(5,-22);ctx.lineTo(0,6);ctx.closePath();const g=ctx.createLinearGradient(-5,0,5,0);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#7fc8f0');ctx.fillStyle=g;ctx.fill();ctx.stroke();ctx.restore()}
    else{ink(1.8);circ(x,gy-h,7);fs('#ffffff');ctx.fillStyle='rgba(160,190,220,.5)';circ(x+2,gy-h+2,3.5);ctx.fill()}}
  for(const o of G.rollers){ctx.save();ctx.translate(o.x,o.y-o.r*.55);ink(2.5);circ(0,0,o.r);const g=ctx.createRadialGradient(-o.r*.35,-o.r*.4,o.r*.1,0,0,o.r);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#c8d8ea');ctx.fillStyle=g;ctx.fill();ctx.stroke();
    ctx.rotate(o.rot);ctx.strokeStyle='rgba(120,150,190,.55)';ctx.lineWidth=1.6;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(0,0,o.r*(.35+k*.2),k*2,k*2+1.7);ctx.stroke()}ctx.fillStyle='#8a96a2';circ(o.r*.4,-o.r*.2,1.8);ctx.fill();circ(-o.r*.3,o.r*.45,1.5);ctx.fill();ctx.restore()}
}
// projectiles of the new worlds
const EPDRAW={
  poison:p=>{glow('150,230,90',p.x,p.y,p.r*3,.45);ink(1.8);ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*1.15,p.r*.95,p.a,0,TAU);fs('#7bd65a');ctx.fillStyle='#e8ffc0';circ(p.x-p.r*.3,p.y-p.r*.35,p.r*.35);ctx.fill();ctx.fillStyle='rgba(60,120,30,.6)';circ(p.x+p.r*.35,p.y+p.r*.25,p.r*.25);ctx.fill()},
  bubble:p=>{const w=1+Math.sin(G.t*9+p.ph)*.08;ctx.save();ctx.translate(p.x,p.y);ctx.scale(w,2-w);ctx.fillStyle='rgba(170,230,150,.25)';circ(0,0,p.r);ctx.fill();ctx.strokeStyle='rgba(30,60,30,.9)';ctx.lineWidth=2;ctx.stroke();ctx.strokeStyle='rgba(220,255,200,.9)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,p.r*.7,3.6,4.6);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.9)';circ(-p.r*.35,-p.r*.4,p.r*.18);ctx.fill();ctx.restore()},
  ice:p=>{glow('160,220,255',p.x,p.y,p.r*2.6,.4);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ink(1.6);ctx.beginPath();ctx.moveTo(p.r*1.9,0);ctx.lineTo(-p.r*.4,-p.r*.75);ctx.lineTo(-p.r*1.3,0);ctx.lineTo(-p.r*.4,p.r*.75);ctx.closePath();const g=ctx.createLinearGradient(-p.r,0,p.r*2,0);g.addColorStop(0,'#7fc8f0');g.addColorStop(1,'#ffffff');ctx.fillStyle=g;ctx.fill();ctx.stroke();ctx.restore()},
  snow:p=>{glow('230,245,255',p.x,p.y,p.r*2.4,.35);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(G.t*4+p.ph);ctx.strokeStyle='#1b1612';ctx.lineWidth=3.2;ctx.lineCap='round';ctx.beginPath();for(let k=0;k<3;k++){const a=k*Math.PI/3;ctx.moveTo(-Math.cos(a)*p.r,-Math.sin(a)*p.r);ctx.lineTo(Math.cos(a)*p.r,Math.sin(a)*p.r)}ctx.stroke();ctx.strokeStyle='#ffffff';ctx.lineWidth=1.6;ctx.stroke();ctx.restore()}};

