// ---------- hazards: meteors and lava fissures ----------
function meteor(x,y,delay,r,dmg){G.meteors.push({x:clamp(x,L+16,R-16),y:clamp(y,TOP+16,BOT-16),t:-(delay||0),dur:1.05,r:r||30,dmg:dmg||16})}
function updHazards2(dt){
  for(let i=G.meteors.length-1;i>=0;i--){const m=G.meteors[i];m.t+=dt;if(m.t<m.dur)continue;G.meteors.splice(i,1);
    G.fx.push({k:'boom',x:m.x,y:m.y,t:.35,r:m.r*1.3});vfxBlast(m.x,m.y,'255,140,50',m.r*1.8,{debris:'lava',n:8,fire:6,sparks:10,dust:5,ring2:false});shake(3);sfx('boom');stamp('scorch',m.x,m.y,m.r);addZone(m.x,m.y,m.r*.7,1.6,'fire');
    if(Math.hypot(P.x-m.x,P.y-m.y)<m.r+P.r*.5)hurtP(Math.round(m.dmg*DMG()));
    for(let k=0;k<8;k++){const a=rand(0,TAU),s=rand(50,140);G.debris.push({x:m.x,y:m.y,z:6,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.7,vz:rand(80,180),col:pk(['#ff7a2e','#ffd86b','#3d3430']),s:rand(1.5,2.8),rot:0,vr:9,life:1.2,glow:true})}}
  for(let i=G.lines.length-1;i>=0;i--){const l=G.lines[i];
    if(l.warn>0){l.warn-=dt;continue}
    if(!l.fired){l.fired=true;shake(3);if(!l.col)for(let s2=8;s2<l.len;s2+=22)fxPush({k:'firep',x:l.x+Math.cos(l.a)*s2,y:l.y+Math.sin(l.a)*s2,vx:rand(-10,10),vy:rand(-80,-40),t:rand(.4,.7),max:.7,r:rand(5,9)})}
    l.act-=dt;const ex=l.x+Math.cos(l.a)*l.len,ey=l.y+Math.sin(l.a)*l.len,dx=ex-l.x,dy=ey-l.y,t=clamp(((P.x-l.x)*dx+(P.y-l.y)*dy)/(dx*dx+dy*dy),0,1);
    if(!l.hit&&Math.hypot(l.x+dx*t-P.x,l.y+dy*t-P.y)<l.w/2+P.r*.6&&P.inv<=0&&P.dashT<=0){l.hit=true;hurtP(Math.round((l.dmg||18)*DMG()))}
    if(l.act<=0)G.lines.splice(i,1)}
}
function drawHazards2Ground(){
  for(const m of G.meteors){if(m.t<0)continue;const p=m.t/m.dur;ctx.strokeStyle=`rgba(255,110,40,${.5+.3*Math.sin(G.t*20)})`;ctx.lineWidth=2.5;circ(m.x,m.y,m.r);ctx.stroke();ctx.fillStyle=`rgba(255,90,30,${.1+p*.28})`;circ(m.x,m.y,m.r*p);ctx.fill()}
  for(const l of G.lines){if(l.col){drawBeamLine(l);continue}ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.a);
    if(l.warn>0){ctx.fillStyle=`rgba(255,110,40,${.12+.1*Math.sin(G.t*22)})`;ctx.fillRect(0,-l.w/2,l.len,l.w);ctx.strokeStyle='rgba(255,140,60,.75)';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(0,-l.w/2,l.len,l.w);ctx.setLineDash([])}
    else{const g=ctx.createLinearGradient(0,-l.w/2,0,l.w/2);g.addColorStop(0,'rgba(255,90,20,0)');g.addColorStop(.5,'rgba(255,200,90,.95)');g.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=g;ctx.fillRect(0,-l.w/2,l.len,l.w);
      ctx.fillStyle='#ffd86b';for(let s=6;s<l.len;s+=14){const h=6+Math.sin(G.t*30+s)*4;ctx.beginPath();ctx.moveTo(s-4,0);ctx.lineTo(s,-h);ctx.lineTo(s+4,0);ctx.closePath();ctx.fill()}}
    ctx.restore()}
}
function drawHazards2Air(){for(const m of G.meteors){if(m.t<0)continue;const p=m.t/m.dur,h=(1-p)*260,x=m.x+(1-p)*40;
  glow('255,140,60',x,m.y-h,18,.8);ctx.fillStyle='#ffd86b';circ(x,m.y-h,6);ctx.fill();ctx.strokeStyle='rgba(255,120,40,.6)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,m.y-h);ctx.lineTo(x+16,m.y-h-30);ctx.stroke()}}

