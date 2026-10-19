// =====================================================================
// OBSTACLES PLANTED IN THE FLOOR: soft shadows, the floor darkening and cracking under the weight,
// material piled at the foot (moss, ash, mud, snow) covering the base, and every still obstacle shaded
// darker at the bottom and lit from above (drawn once into a sprite, then reused every frame)
// =====================================================================
const MAINCTX=ctx;const SHB=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.45,'rgba(0,0,0,.62)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return c})();
// the three shadows of an obstacle that stays put, in one picture as big as they are on the canvas, copied one to one (phase 9): black over
// black, the floor under them gets just as dark; an obstacle that fades away, or one that keeps moving, as before
function shadowSprite(k,h,r){const m=ctx.getTransform();if(m.b!==0||m.c!==0||!(m.a>=1)||Math.abs(m.a-m.d)>1e-6||(k._shN||0)>4)return false;const S=m.a,key=S+'|'+r+'|'+h+'|'+k.x+'|'+k.y;let c=k._sh;
  if(!c||c.key!==key){const l=r*1.1+h*.42,cx=k.x+h*.28,cy=k.y+h*.12+2,co=Math.cos(.5),si=Math.sin(.5),hx=co*l+si*r*.72,hy=si*l+co*r*.72,
      x0=Math.floor(Math.min(cx-hx,k.x-r*1.5))-1,y0=Math.floor(Math.min(cy-hy,k.y+2-r*.64))-1,x1=Math.ceil(Math.max(cx+hx,k.x+r*1.5))+1,y1=Math.ceil(Math.max(cy+hy,k.y+2+r*.64))+1;
    if(!(x1>x0&&y1>y0&&(x1-x0)*S<2048&&(y1-y0)*S<2048))return false;
    const sc=c&&c.cv||document.createElement('canvas');sc.width=Math.ceil((x1-x0)*S);sc.height=Math.ceil((y1-y0)*S);const x=sc.getContext('2d');x.setTransform(S,0,0,S,-x0*S,-y0*S);
    x.save();x.globalAlpha=.4;x.translate(cx,cy);x.rotate(.5);x.drawImage(SHB,-l,-r*.72,l*2,r*1.44);x.restore();
    x.globalAlpha=.55;x.drawImage(SHB,k.x-r*1.5,k.y+2-r*.64,r*3,r*1.28);x.globalAlpha=.7;x.drawImage(SHB,k.x-r*1.08,k.y+1.5-r*.4,r*2.16,r*.8);
    c=k._sh={key,cv:sc,x0,y0};k._shN=(k._shN||0)+1}
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.drawImage(c.cv,Math.round(S*c.x0+m.e),Math.round(S*c.y0+m.f));ctx.setTransform(m.a,m.b,m.c,m.d,m.e,m.f);return true}
function castShadow(k){const a=k.temp?Math.min(1,k.life/.6):1,h=kH(k),r=k.r;if(a>=1&&!k.temp&&shadowSprite(k,h,r))return;
  ctx.save();ctx.globalAlpha=a*.4;ctx.translate(k.x+h*.28,k.y+h*.12+2);ctx.rotate(.5);const l=r*1.1+h*.42;ctx.drawImage(SHB,-l,-r*.72,l*2,r*1.44);ctx.restore();
  ctx.globalAlpha=a*.55;ctx.drawImage(SHB,k.x-r*1.5,k.y+2-r*.64,r*3,r*1.28);
  ctx.globalAlpha=a*.7;ctx.drawImage(SHB,k.x-r*1.08,k.y+1.5-r*.4,r*2.16,r*.8);ctx.globalAlpha=1};
// what gathers at the foot of an obstacle, per chapter: [dark, mid, light]
function footMat(th){return LAVAZ.includes(th)?['#241c19','#3a302b','#5a4d45']:isIce(th)?['#8fa9c6','#d6e6f6','#ffffff']:isSwamp(th)?['#2c2a18','#46432a','#68643c']:th==='cristalli'?['#26302f','#3c4a48','#5f7471']:th==='radici'?['#1f2a17','#36502a','#56783a']:['#26381c','#3f6a2a','#6fa040']}
function groundPatch(c,k,th){const x=k.x,y=k.y,r=k.r,M=footMat(th);
  // the floor darkens as it nears the obstacle
  c.save();c.translate(x,y+2);c.scale(1,.5);const g=c.createRadialGradient(0,0,r*.3,0,0,r*2.2);g.addColorStop(0,'rgba(14,9,6,.62)');g.addColorStop(.5,'rgba(14,9,6,.24)');g.addColorStop(1,'rgba(14,9,6,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,r*2.2,0,TAU);c.fill();c.restore();
  // the tiles around crack under the weight
  for(let i=0;i<3;i++){const a=rand(0,TAU);let px=x+Math.cos(a)*r*1.02,py=y+Math.sin(a)*r*.46;const pts=[[px,py]];for(let j=0;j<2;j++){px+=Math.cos(a+rand(-.5,.5))*rand(3,6);py+=Math.sin(a+rand(-.5,.5))*rand(1.5,3.5);pts.push([px,py])}
    c.strokeStyle='rgba(0,0,0,.36)';c.lineWidth=1.1;c.beginPath();pts.forEach((p,j)=>j?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();
    c.strokeStyle='rgba(255,255,255,.08)';c.lineWidth=1;c.beginPath();pts.forEach((p,j)=>j?c.lineTo(p[0]+.8,p[1]+.8):c.moveTo(p[0]+.8,p[1]+.8));c.stroke()}
  // chipped flakes of tile, flat on the floor: lit edge on top, dark edge below, no outline
  for(let i=0;i<5;i++){const a=rand(0,TAU),d=rand(1.15,1.7),px=x+Math.cos(a)*r*d,py=y+Math.sin(a)*r*.5*d,s=rand(1.6,3.2),rot=rand(0,TAU);
    c.save();c.translate(px,py);c.rotate(rot);c.beginPath();c.moveTo(-s,0);c.lineTo(-s*.2,-s*.7);c.lineTo(s,-s*.2);c.lineTo(s*.4,s*.6);c.closePath();c.fillStyle='rgba(0,0,0,.35)';c.save();c.translate(.8,1);c.fill();c.restore();
    c.fillStyle=pk(ENV[th]?ENV[th].floor:G.env.floor);c.fill();c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=.9;c.beginPath();c.moveTo(-s,0);c.lineTo(-s*.2,-s*.7);c.lineTo(s,-s*.2);c.stroke();c.restore()}
  // a soft bed of the chapter's material all round the base
  for(let i=0;i<9;i++){const a=i/9*TAU+rand(-.2,.2),px=x+Math.cos(a)*r*rand(.9,1.2),py=y+Math.sin(a)*r*.46,w=r*rand(.3,.5);
    c.fillStyle=M[0];c.globalAlpha=.55;c.beginPath();c.ellipse(px,py+1,w,w*.42,0,0,TAU);c.fill();c.globalAlpha=1}
  if(th==='cristalli'){c.save();c.shadowColor='#7fe0f0';c.shadowBlur=6;c.fillStyle='rgba(160,235,255,.85)';for(let i=0;i<4;i++){const a=rand(0,Math.PI),px=x+Math.cos(a)*r*1.2,py=y+Math.sin(a)*r*.56;c.beginPath();c.moveTo(px,py-4);c.lineTo(px+1.6,py);c.lineTo(px-1.6,py);c.closePath();c.fill()}c.restore()}
  else if(th==='radici'){c.lineCap='round';for(let i=0;i<3;i++){const a=rand(0,TAU),p0=[x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.4],p1=[x+Math.cos(a)*r*1.4,y+Math.sin(a)*r*.9],p2=[x+Math.cos(a+.4)*r*1.9,y+Math.sin(a+.4)*r*1.1];
    for(const[col,lw] of [['#1b1612',4],['#5a3f2a',2.2]]){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(...p0);c.quadraticCurveTo(...p1,...p2);c.stroke()}}}
  else if(LAVAZ.includes(th)){c.save();c.lineCap='round';c.strokeStyle='#ff7a2e';c.shadowColor='#ff6a1a';c.shadowBlur=6;c.lineWidth=1.4;for(let i=0;i<3;i++){const a=rand(0,Math.PI);let px=x+Math.cos(a)*r*1.05,py=y+Math.sin(a)*r*.5;c.beginPath();c.moveTo(px,py);for(let j=0;j<3;j++){px+=Math.cos(a+rand(-.5,.5))*rand(4,8);py+=Math.sin(a+rand(-.5,.5))*rand(2,5);c.lineTo(px,py)}c.stroke()}c.restore()}
  else if(isSwamp(th)||isIce(th))groundPatch3(c,k,th,x,y,r);
};
// in front of the base: little mounds of material and a few stones that overlap its bottom edge, so it sits IN the floor
function groundFront(k){if(k._noFront)return;const th=themeOf(G.room),r=k.r,x=k.x,y=k.y;
  if(!k._ft||k._ftTh!==th){let s0=Math.floor((k.seed||1)*7919)%233280;const rn=()=>(s0=(s0*9301+49297)%233280)/233280;k._ftTh=th;k._ft=[];
    const n=r>=20?4:3;for(let i=0;i<n;i++){const a=Math.PI*(.12+.76*(i+.5)/n)+(rn()-.5)*.25;k._ft.push({m:1,x:Math.cos(a)*r*(.88+rn()*.14),y:Math.sin(a)*r*.42+1.5,w:r*(.32+rn()*.2),ph:rn()*9})}
    for(let i=0;i<3;i++){const a=Math.PI*(.1+rn()*.8);k._ft.push({m:0,x:Math.cos(a)*r*(1.08+rn()*.25),y:Math.sin(a)*r*.5+2,w:1.6+rn()*1.8,rot:rn()*3})}}
  const M=footMat(th),S=stonePal(),moss=!LAVAZ.includes(th)&&!isIce(th)&&!isSwamp(th)&&th!=='cristalli';
  for(const f of k._ft){const px=x+f.x,py=y+f.y;
    if(f.m){const w=f.w,h=w*.62;ctx.beginPath();ctx.ellipse(px,py,w,h,0,Math.PI,0);ctx.quadraticCurveTo(px,py+h*.35,px-w,py);ctx.closePath();ctx.fillStyle=M[1];ctx.fill();
      ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(px,py,w,h,0,Math.PI*1.05,-Math.PI*.05);ctx.stroke();
      ctx.fillStyle=M[2];ctx.beginPath();ctx.ellipse(px-w*.18,py-h*.55,w*.5,h*.3,0,0,TAU);ctx.fill();
      ctx.fillStyle=M[0];ctx.globalAlpha=.6;ctx.beginPath();ctx.ellipse(px,py+h*.12,w*.9,h*.22,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
      if(moss){ctx.lineCap='round';for(let b=0;b<3;b++){const bx=px-w*.5+b*w*.5;ctx.strokeStyle=b%2?'#5a8a32':'#86c050';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(bx,py-h*.5);ctx.lineTo(bx+(b-1)*1.5+Math.sin(G.t*2+f.ph+b)*.8,py-h*.5-3-b%2*2.5);ctx.stroke()}}
      else if(LAVAZ.includes(th)){ctx.fillStyle=`rgba(255,${130+60*Math.sin(G.t*3+f.ph)|0},50,.95)`;circ(px+w*.3,py-h*.3,1.3);ctx.fill()}
      else if(isSwamp(th)){ctx.strokeStyle='#7a8a3a';ctx.lineWidth=1.3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(px+w*.2,py-h*.6);ctx.quadraticCurveTo(px+w*.3,py-h-4,px+w*.25+Math.sin(G.t*1.6+f.ph),py-h-8);ctx.stroke()}
      else if(th==='cristalli'){ctx.fillStyle='rgba(170,240,255,.95)';ctx.beginPath();ctx.moveTo(px+w*.3,py-h-5);ctx.lineTo(px+w*.3+2,py-h*.4);ctx.lineTo(px+w*.3-2,py-h*.4);ctx.closePath();ctx.fill()}}
    else{const s=f.w;ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(px+.8,py+s*.45,s*1.1,s*.42,0,0,TAU);ctx.fill();
      ctx.save();ctx.translate(px,py);ctx.rotate(f.rot*.3);ctx.beginPath();ctx.moveTo(-s,s*.3);ctx.lineTo(-s*.6,-s*.6);ctx.lineTo(s*.5,-s*.7);ctx.lineTo(s,s*.2);ctx.lineTo(s*.2,s*.5);ctx.closePath();ctx.fillStyle=S.mid;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke();
      ctx.fillStyle=S.hi;ctx.beginPath();ctx.moveTo(-s*.6,-s*.6);ctx.lineTo(s*.5,-s*.7);ctx.lineTo(s*.3,-s*.1);ctx.lineTo(-s*.5,-s*.05);ctx.closePath();ctx.fill();ctx.restore()}}};
// still obstacles are drawn once into a sprite, shaded darker at the base and lit from above
const ROCK_LIVE={crystal:1,brazier:1,lavarock:1,cauldron:1,mudmound:1,reeds:1,lantern:1,snowman:1};
{const _dr=drawRock;
  function rockSprite(k){const th=themeOf(G.room),fl=(th==='golem'||th==='radici')&&G.enemies.some(e=>e.p2)?1:0,SS=Math.min(3,Math.max(1.5,Math.round(cv.width/VW*2)/2)),st=wearSt(k),key=k.kind+'|'+st+'|'+fl+'|'+SS;
    if(k._sp&&k._sp.key===key)return k._sp;
    const r=k.r,H=kH(k),x0=k.x-r*3.2,y0=k.y-H-r*3,w=r*6.4,h=H+r*4.6,c=document.createElement('canvas');c.width=Math.ceil(w*SS);c.height=Math.ceil(h*SS);
    const o=c.getContext('2d');o.setTransform(SS,0,0,SS,-x0*SS,-y0*SS);const keep=ctx,hit=k.hit;ctx=o;k.hit=0;k._noFront=1;try{_dr(k)}finally{ctx=keep;k.hit=hit;k._noFront=0}
    o.setTransform(SS,0,0,SS,-x0*SS,-y0*SS);o.globalCompositeOperation='source-atop';
    let g=o.createLinearGradient(0,k.y+r*.5,0,k.y-Math.min(30,Math.max(10,H*.55)));g.addColorStop(0,'rgba(12,8,6,.6)');g.addColorStop(1,'rgba(12,8,6,0)');o.fillStyle=g;o.fillRect(x0,y0,w,h);
    g=o.createLinearGradient(0,k.y-H-r*1.2,0,k.y-H*.35);g.addColorStop(0,'rgba(255,236,200,.2)');g.addColorStop(1,'rgba(255,236,200,0)');o.fillStyle=g;o.fillRect(x0,y0,w,h);
    o.fillStyle=`rgba(${(G.env&&G.env.light)||'255,200,140'},.05)`;o.fillRect(x0,y0,w,h);o.globalCompositeOperation='source-over';
    return k._sp={key,c,x0,y0,w,h,ss:SS}}
  drawRock=function(k){if(k._raw||k.temp||ROCK_LIVE[k.kind]||ctx!==MAINCTX){_dr(k);return}
    // on whole pixels and at its own size: with the canvas at 2 (or 1,5) pixels a point the picture is copied one to one, not resampled
    const sp=rockSprite(k),dx=k.hit>0?Math.sin(G.t*90)*k.hit*14:0,S=sp.ss;ctx.drawImage(sp.c,Math.round((sp.x0+dx)*S)/S,Math.round(sp.y0*S)/S,sp.c.width/S,sp.c.height/S);groundFront(k)}}

