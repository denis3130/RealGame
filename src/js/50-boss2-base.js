// =====================================================================
// BOSS 2 (preview): richer bosses. Every boss breathes; each one gets its own living details, anchored to its body:
// orbiting stones, smoke, embers, drool, flies, frost breath, glints... Particles respect LOWFX.
// =====================================================================
let BOSS2=true;
const B2={};
function b2tick(e){const now=G.t||0,dt=Math.min(.05,Math.max(0,now-(e._b2t==null?now:e._b2t)));e._b2t=now;if(!e._b2p)e._b2p=[];
  const L=e._b2p;for(let i=L.length-1;i>=0;i--){const p=L[i];p.t+=dt;if(p.gy!=null&&p.y>=p.gy&&p.k==='drip'){L[i]={k:'splash',x:p.x,y:p.gy,t:0,life:.35,vx:0,vy:0,col:p.col};continue}
    if(p.t>=p.life){L.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g||0)*dt;if(p.drag){p.vx*=1-p.drag*dt;p.vy*=1-p.drag*dt}}
  return dt}
const b2emit=(e,p)=>{if(LOWFX||!e._b2p||e._b2p.length>70)return;e._b2p.push(Object.assign({t:0,vx:0,vy:0},p))};
const b2every=(e,key,per,dt)=>{e['_b2e'+key]=(e['_b2e'+key]||0)+dt;if(e['_b2e'+key]>=per){e['_b2e'+key]=0;return true}return false};
function b2draw(e){const L=e._b2p;if(!L||!L.length)return;
  for(const p of L){const k=1-p.t/p.life;
    switch(p.k){
      case 'smoke':ctx.fillStyle=`rgba(${p.col||'70,62,58'},${.38*k})`;circ(p.x,p.y,(p.r||3)+(1-k)*7);ctx.fill();break;
      case 'vapor':ctx.fillStyle=`rgba(235,246,255,${.55*k})`;circ(p.x,p.y,(p.r||3)+(1-k)*6);ctx.fill();break;
      case 'dust':ctx.fillStyle=`rgba(${p.col||'205,195,175'},${.42*k})`;circ(p.x,p.y,(p.r||3)+(1-k)*5);ctx.fill();break;
      case 'pebble':ink(1.4);circ(p.x,p.y,p.r||2);fs(p.col||'#7d7568');break;
      case 'drip':ctx.fillStyle=p.col;ctx.beginPath();ctx.ellipse(p.x,p.y,1.8,2.6,0,0,TAU);ctx.fill();break;
      case 'splash':ctx.strokeStyle=p.col;ctx.globalAlpha=k;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(p.x,p.y,2+(1-k)*7,1+(1-k)*3,0,0,TAU);ctx.stroke();ctx.globalAlpha=1;break;
      case 'snow':ctx.fillStyle=`rgba(255,255,255,${.9*Math.min(1,k*3)})`;circ(p.x+Math.sin(p.t*3+p.ph)*3,p.y,p.r||1.5);ctx.fill();break;
      case 'leaf':ctx.save();ctx.translate(p.x+Math.sin(p.t*2.5+p.ph)*6,p.y);ctx.rotate(p.t*3+p.ph);ctx.globalAlpha=Math.min(1,k*2);ink(1);ell(0,0,3.6,1.8);fs(p.col||'#6fa040');ctx.restore();ctx.globalAlpha=1;break;
      case 'bubble':ctx.strokeStyle=`rgba(${p.col||'190,255,170'},${.8*k})`;ctx.lineWidth=1.2;circ(p.x,p.y,p.r||2);ctx.stroke();break;
      case 'coin':ctx.fillStyle=`rgba(255,215,90,${k})`;ctx.beginPath();ctx.ellipse(p.x,p.y,2.6*Math.abs(Math.cos(p.t*8+p.ph))+.4,2.6,0,0,TAU);ctx.fill();break;
      case 'mote':{const ex=p.e?p.e.x:p.x,ey=p.e?p.e.y:p.y,an=p.a+p.t*2.4,rr=p.rad*(1-p.t/p.life*.4),px=ex+Math.cos(an)*rr,py=ey-p.h0-p.t*46+Math.sin(an)*rr*.35;ctx.save();ctx.globalCompositeOperation='lighter';glow(p.col,px,py,7,.7*Math.sin(k*Math.PI));ctx.fillStyle=`rgba(255,255,255,${.9*Math.sin(k*Math.PI)})`;circ(px,py,1.1);ctx.fill();ctx.restore();break}
      case 'conv':{const q=1-k,ex=p.e.x,ey=p.e.y-p.h,px=ex+Math.cos(p.a)*p.rad*(1-q*q),py=ey+Math.sin(p.a)*p.rad*(1-q*q)*.6;ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${p.col},${.9*q})`;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+(ex-px)*.18,py+(ey-py)*.18);ctx.stroke();glow(p.col,px,py,5,.8*q);ctx.restore();break}
      case 'ring':{const r=(p.r0||10)+(p.r1-(p.r0||10))*(1-k);ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${p.col},${.85*k})`;ctx.lineWidth=(p.w||4)*k+1;ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*(p.fl||.45),0,0,TAU);ctx.stroke();ctx.restore();break}
      case 'flame':{const s=(p.r||5)*(.5+k*.7);ctx.save();ctx.globalCompositeOperation='lighter';glow(p.col||'255,140,50',p.x,p.y,s*2.2,.6*k);ctx.restore();ctx.fillStyle=k>.5?'#ffd86b':'#ff8a3c';ctx.beginPath();ctx.moveTo(p.x,p.y-s*1.6);ctx.quadraticCurveTo(p.x+s,p.y,p.x,p.y+s*.6);ctx.quadraticCurveTo(p.x-s,p.y,p.x,p.y-s*1.6);ctx.fill();break}
      case 'ember':case 'spark':case 'glint':ctx.save();ctx.globalCompositeOperation='lighter';
        if(p.k==='ember'){glow(p.col||'255,140,50',p.x,p.y,6*k+2,.8*k);ctx.fillStyle=`rgba(255,230,170,${k})`;circ(p.x,p.y,1.1);ctx.fill()}
        else if(p.k==='spark'){ctx.strokeStyle=`rgba(255,220,120,${k})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.035,p.y-p.vy*.035);ctx.stroke()}
        else{const s=(p.r||5)*Math.sin(k*Math.PI);ctx.strokeStyle=`rgba(255,255,255,${k})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(p.x-s,p.y);ctx.lineTo(p.x+s,p.y);ctx.moveTo(p.x,p.y-s);ctx.lineTo(p.x,p.y+s);ctx.stroke();glow(p.col||'255,255,255',p.x,p.y,s*1.6,.5*k)}
        ctx.restore();break}}}

