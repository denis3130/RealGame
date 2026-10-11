// =====================================================================
// HYDRA: a creepier rise. The pool boils with a sick light, three pairs of yellow eyes circle under the water and stop
// to stare at you; the heads breach one at a time, twitching, streaming water; the fins show, then the body heaves up.
// The same staggered rise when it dives and comes back during the fight
// =====================================================================
Object.assign(BOSS_INTRO,{hydra:4.4});
const HY_D={'0':1.5,'-1':2.0,'1':2.35},HY_UP={'0':0,'-1':.18,'1':.32};
{const _hh=hydraHead;hydraHead=function(e,h){const p=_hh(e,h);if(BOSS2&&(h._dy||h._jx)){p.x+=h._jx||0;p.y+=h._dy||0;p.rx+=h._jx||0;p.ry+=h._dy||0}return p}}
{const _bi3=bossIntro3;bossIntro3=function(e,t,t0,at,roar){if(!(BOSS2&&e.type==='hydra'))return _bi3(e,t,t0,at,roar);
  e.em=null;e.hole=0;
  // the heads exist from the very start of the entrance (in the game they were only made when the fight began, so the hydra was invisible during its entrance)
  if(!e.heads)e.heads=[-1,0,1].map((s,i)=>({s,t:1+i*.7,st:'idle',ext:0,open:0,tx:e.x,ty:e.y,k:0}));
  if(t0===0){sfx('creep',1,e.x);shake(2)}
  if(t<3.2&&Math.random()<.7)G.fx.push({k:'bub',x:e.x+rand(-44,44),y:e.y+rand(-16,16),t:.6,r:rand(2,5)});
  if(at(.6)||at(1.15)){shake(2.5);sfx('creep',1,e.x);G.ripples.push({x:e.x,y:e.y,r:6,max:70,a:.9})}
  for(const s of ['0','-1','1'])if(at(HY_D[s])){sfx('splash',1,e.x);const hx=e.x+(+s)*36;G.ripples.push({x:hx,y:e.y,r:4,max:40,a:1});ENV2.splash(hx,e.y,8,'#cfe9d8')}
  if(at(3.0)){shake(7);sfx('splash',2,e.x);ENV2.splash(e.x,e.y,22,'#cfe9d8');vfxBlast(e.x,e.y,'120,200,140',100,{sparks:10,spcol:['#c8f0d8','#7bd6a0','#ffffff'],dust:0,debris:['#3f7a4a','#2a5a34','#8fd0a8'],n:16,ring2:false})}
  if(at(3.8)){roar();sfx('roar',0,e.x);G.ripples.push({x:e.x,y:e.y,r:10,max:110,a:1})}
  for(const h of e.heads||[])h.open=t>3.75&&t<4.35?1:t>1.5&&t<3.7?.25+.25*Math.sin(t*7+h.s):0;
  return true}}
const hyEyes=(x,y,t,k,s,stare)=>{if(k<=0)return;const a=t*1.3+s*2.1,r=stare?0:26,ex=x+Math.cos(a)*r,ey=y+Math.sin(a)*r*.35,bl=(Math.sin(t*2.3+s*4)>.93)?.1:1;
  ctx.fillStyle=`rgba(0,10,5,${.4*k})`;ctx.beginPath();ctx.ellipse(ex,ey+2,14,6,0,0,TAU);ctx.fill();k*=.85;
  ctx.save();ctx.globalCompositeOperation='lighter';glow('255,200,60',ex,ey,16,.35*k*bl);for(const o of [-5,5]){glow('255,210,60',ex+o,ey,8,.8*k*bl);ctx.fillStyle=`rgba(255,240,150,${k*bl})`;ctx.beginPath();ctx.ellipse(ex+o,ey,2.6,1.6*bl+.3,o*.04,0,TAU);ctx.fill()}ctx.restore();
  ctx.fillStyle=`rgba(0,0,0,${.8*k*bl})`;for(const o of [-5,5]){ctx.fillRect(ex+o-.5,ey-1.4,1,2.8)}};
{const hy=B2.hydra,ob=hy.back,of=hy.front;
  hy.pre=e=>{if(!e.heads)return;const t=G.t||0;
    if(e.intro>0){const it=e.iT||0;for(const h of e.heads)h._q=clamp((it-HY_D[h.s])/.85,0,1);e.sink=1.6*(1-clamp((it-3)/.8,0,1))}
    else if(e.st==='dive'&&e.sub==='up'){const u=1-(e.sink||0);for(const h of e.heads){const d=HY_UP[h.s];h._q=clamp((u-d)/(1-d),0,1)}}
    else if(e.st==='dive'&&e.sub==='a'){const u=1-(e.sink||0);for(const h of e.heads)h._q=u}
    else for(const h of e.heads)h._q=1;
    for(const h of e.heads){const k=1-h._q;h._dy=k*95+(e.intro>0?Math.min(1.6,e.sink||0)*30:0);const n=Math.sin(Math.floor(t*9)*12.9898+h.s*78.233)*43758.5453;h._jx=k>0&&k<1?(Math.sin(t*37+h.s*5)*3+((n-Math.floor(n))-.5)*9)*k:0;
      if(h._qp!=null&&h._qp<=0&&h._q>0)b2emit(e,{k:'ring',x:e.x+h.s*36,y:e.y,r0:4,r1:34,life:.5,col:'200,240,210',w:3});h._qp=h._q}};
  hy.back=(e,dt)=>{const t=G.t||0;
    // under the water: the eyes circle, then stop and stare
    // the crests stay under the water line too
    ctx.save();ctx.beginPath();ctx.rect(e.x-200,e.y-320,400,322);ctx.clip();ob(e,dt);ctx.restore()};
  hy.front=(e,dt)=>{of(e,dt);if(!e.heads)return;for(const h of e.heads)if(h._q>.1&&h._q<1&&b2every(e,'wd'+h.s,.07,dt)){const p=hydraHead(e,h);b2emit(e,{k:'drip',x:p.x+rand(-7,7),y:p.y+4,vy:10,g:300,gy:e.y+rand(-2,4),life:1.5,col:'rgba(200,235,215,.9)'})}};
  hy.post=e=>{if(!e.heads)return;const t=G.t||0;
    if(e.intro>0){const it=e.iT||0;ctx.save();ctx.globalCompositeOperation='lighter';glow('120,220,90',e.x,e.y,70,.18+.1*Math.sin(t*5),26);ctx.restore();
      for(const h of e.heads)if(!(clamp((it-HY_D[h.s])/.85,0,1)>0))hyEyes(e.x+h.s*30,e.y-2,t,clamp(it/.5,0,1),h.s,it>1.1)}
    if(e.st==='dive'&&e.sub==='under'&&e.tx!=null){const k=clamp((1-(e.stT||0))/.3,0,1);for(const s of [-1,0,1])hyEyes(e.tx+s*30,e.ty-2,t,k,s,(e.stT||1)<.45)}
  }}
{const _de2=drawEnemy;drawEnemy=function(e){const S=BOSS2&&B2[e.type];if(S&&S.pre&&!e.dead)S.pre(e);_de2(e);if(S&&S.post&&!e.dead)S.post(e)}}

