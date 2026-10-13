// =====================================================================
// NORMAL ENEMIES ALIVE: a lighter version of the bosses' treatment. They breathe (slimes wobble), they give off
// particles of their own material, walkers raise dust, and a little star flashes over the head of an enemy about to
// shoot or charge, so even a child can read it
// =====================================================================
const EL_EMIT=(e,dt,key,per,p)=>{if(b2every(e,key,per,dt))b2emit(e,typeof p==='function'?p():p)};
const ELIFE={
  slime:{sq:.06,sp:4,fx:(e,dt)=>EL_EMIT(e,dt,'g',.7,()=>({k:'drip',x:e.x+rand(-e.r,e.r)*.8,y:e.y-e.r*.4,vy:5,g:160,gy:e.y+4,life:1.2,col:'rgba(150,220,90,.9)'}))},
  bigslime:{sq:.07,sp:3,fx:(e,dt)=>EL_EMIT(e,dt,'g',.5,()=>({k:'drip',x:e.x+rand(-e.r,e.r)*.8,y:e.y-e.r*.4,vy:5,g:160,gy:e.y+5,life:1.2,col:'rgba(120,200,70,.9)'}))},
  magmaslime:{sq:.06,sp:4,fx:(e,dt)=>{EL_EMIT(e,dt,'e',.25,()=>({k:'ember',x:e.x+rand(-e.r,e.r)*.7,y:e.y-e.r,vx:rand(-8,8),vy:-rand(25,45),life:.8}));EL_EMIT(e,dt,'g',.9,()=>({k:'drip',x:e.x+rand(-e.r,e.r)*.7,y:e.y-e.r*.3,vy:5,g:140,gy:e.y+4,life:1,col:'rgba(255,140,50,.95)'}))}},
  bat:{fx:(e,dt)=>EL_EMIT(e,dt,'d',.35,()=>({k:'dust',x:e.x+rand(-6,6),y:e.y-18,vy:18,life:.6,r:1.6,col:'150,120,190'}))},
  goblin:{walk:1},skeleton:{walk:1},bonelet:{walk:1},
  mushroom:{sq:.025,fx:(e,dt)=>EL_EMIT(e,dt,'s',.4,()=>({k:'mote',e,a:rand(0,TAU),rad:e.r*rand(.4,.9),h0:e.r,life:1.4,col:'200,150,255'}))},
  wisp:{fx:(e,dt)=>EL_EMIT(e,dt,'w',.12,()=>({k:'mote',e,a:rand(0,TAU),rad:rand(2,7),h0:14,life:.8,col:'140,220,255'}))},
  beetle:{walk:1,fx:(e,dt)=>{if(e.arm>0)EL_EMIT(e,dt,'a',.2,()=>({k:'spark',x:e.x+rand(-6,6),y:e.y-10,vx:rand(-60,60),vy:-rand(40,90),g:300,life:.4}))}},
  plant:{sq:.025,sp:2,fx:(e,dt)=>EL_EMIT(e,dt,'p',.8,()=>({k:'leaf',x:e.x+rand(-10,10),y:e.y-e.r*1.4,vy:rand(10,18),life:1.6,ph:rand(0,9),col:pk(['#6fa040','#86b84a'])}))},
  eyeflower:{sq:.025,sp:2,fx:(e,dt)=>EL_EMIT(e,dt,'p',.5,()=>({k:'mote',e,a:rand(0,TAU),rad:rand(6,14),h0:e.r,life:1.3,col:'255,200,120'}))},
  imp:{fx:(e,dt)=>EL_EMIT(e,dt,'e',.15,()=>({k:'ember',x:e.x+rand(-6,6),y:e.y-16,vx:rand(-10,10),vy:-rand(20,40),life:.7}))},
  pyro:{walk:1,fx:(e,dt)=>{EL_EMIT(e,dt,'e',.12,()=>({k:'ember',x:e.x+rand(-8,8),y:e.y-rand(10,30),vx:rand(-10,10),vy:-rand(25,45),life:.8}));EL_EMIT(e,dt,'s',.5,()=>({k:'smoke',x:e.x+rand(-5,5),y:e.y-30,vy:-16,life:1,r:2,col:'50,44,40'}))}},
  obsidian:{walk:1,fx:(e,dt)=>EL_EMIT(e,dt,'e',.3,()=>({k:'ember',x:e.x+rand(-10,10),y:e.y-rand(8,24),vx:rand(-6,6),vy:-rand(15,30),life:.7,col:'190,120,255'}))},
  necro:{walk:1,fx:(e,dt)=>EL_EMIT(e,dt,'m',.18,()=>({k:'mote',e,a:rand(0,TAU),rad:e.r*rand(.8,1.3),h0:rand(0,14),life:1.2,col:pk(['170,110,230','140,220,120'])}))},
  bomber:{walk:1,fx:(e,dt)=>EL_EMIT(e,dt,'f',.08,()=>({k:'spark',x:e.x+rand(-2,2),y:e.y-e.r*1.5,vx:rand(-40,40),vy:-rand(40,80),g:260,life:.3}))},
  frog:{sq:.04,sp:3.5,fx:(e,dt)=>EL_EMIT(e,dt,'b',.9,()=>({k:'bubble',x:e.x+rand(-12,12),y:e.y+rand(0,4),vy:-rand(6,12),life:.7,r:rand(1.2,2.4)}))},
  croc:{walk:1,fx:(e,dt)=>EL_EMIT(e,dt,'b',.8,()=>({k:'bubble',x:e.x+rand(-14,14),y:e.y+rand(0,4),vy:-rand(6,12),life:.7,r:rand(1.4,2.6)}))},
  tadpole:{sq:.05,sp:6,fx:(e,dt)=>EL_EMIT(e,dt,'b',.6,()=>({k:'bubble',x:e.x+rand(-6,6),y:e.y,vy:-rand(6,12),life:.6,r:1.4}))},
  snail:{sq:.02,fx:(e,dt)=>{if(e.moving)EL_EMIT(e,dt,'t',.5,()=>({k:'splash',x:e.x,y:e.y+3,life:.9,col:'rgba(220,230,170,.28)'}))}},
  mosquito:{},
  wolf:{walk:1,fx:(e,dt)=>{if(isIce(themeOf(G.room)))EL_EMIT(e,dt,'v',1.1,()=>{const a=e.face||0;return{k:'vapor',x:e.x+Math.cos(a)*e.r,y:e.y-12+Math.sin(a)*e.r*.4,vx:Math.cos(a)*16,vy:-4,drag:1.5,life:.8,r:2}})}},
  snowspirit:{fx:(e,dt)=>EL_EMIT(e,dt,'s',.15,()=>({k:'snow',x:e.x+rand(-14,14),y:e.y-rand(10,30),vy:rand(14,24),life:1.2,ph:rand(0,9),r:rand(1,1.6)}))},
  icesentinel:{walk:1,fx:(e,dt)=>EL_EMIT(e,dt,'g',.6,()=>({k:'glint',x:e.x+rand(-12,12),y:e.y-rand(10,34),life:.45,r:3.5,col:'200,240,255'}))},
  shadoweye:{fx:(e,dt)=>EL_EMIT(e,dt,'s',.12,()=>({k:'smoke',x:e.x+rand(-10,10),y:e.y-rand(10,24),vy:-rand(8,16),life:1,r:3,col:'40,20,60'}))}};
{const _de=drawEnemy;drawEnemy=function(e){const Lf=ELIFE[e.type];if(!Lf||e.dead||(e.spawn>0)||isBoss(e.type)){_de(e);return}
  const dt=b2tick(e),t=G.t||0,sq=e.hidden||(typeof n3Has==='function'&&n3Has(e))?0:Math.sin(t*(Lf.sp||3)+e.x*.031)*(Lf.sq||.015);
  ctx.save();ctx.translate(e.x,e.y);ctx.scale(1-sq*.7,1+sq);ctx.translate(-e.x,-e.y);_de(e);ctx.restore();
  if(!e.hidden){if(Lf.fx)Lf.fx(e,dt);
    if(Lf.walk&&e.moving&&b2every(e,'st',.32,dt))b2emit(e,{k:'dust',x:e.x+rand(-4,4),y:e.y+e.r*.5,vx:rand(-10,10),vy:-rand(4,10),drag:3,life:.45,r:2.4});
    // about to shoot or charge: a star over the head
    const tele=(e.aim>0&&e.aim<.6)||e.wind>0||(e.ph==='tele');if(tele&&!e._tele){b2emit(e,{k:'glint',x:e.x,y:e.y-e.r*1.6-14,life:.4,r:7,col:'255,240,180'})}e._tele=tele}
  b2draw(e)}}
