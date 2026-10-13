// =====================================================================
// MICRO ANIMATIONS: squash on hit, coins flying to the counter, level-up hop, HP trail, gate dust; menu buttons and badges
// =====================================================================
{const _h=hurtE;hurtE=function(e,dmg,crit,dot){if(!dot&&e&&!e.dead&&!(e.intro>0)&&!e.hidden)e.sq=.16;return _h.apply(this,arguments)}}
{const _d=drawEnemy;drawEnemy=function(e){if(!(e.sq>0)||LOWFX||(typeof n3Has==='function'&&n3Has(e)))return _d(e);const k=Math.sin(e.sq/.16*Math.PI)*(isBoss(e.type)?.06:.18);
  ctx.save();ctx.translate(e.x,e.y);ctx.scale(1+k,1-k);ctx.translate(-e.x,-e.y);_d(e);ctx.restore()}}
{const _d=drawHero;drawHero=function(){const h=P&&P.hopT>0?Math.sin((1-P.hopT/.38)*Math.PI)*11:0;if(!h)return _d();ctx.save();ctx.translate(0,-h);_d();ctx.restore()}}
{const _g=gainXp;gainXp=function(v){const l=P.lvl;_g(v);if(P.lvl>l&&G.state!=='dead')P.hopT=.38}}
// screen position (CSS px) of a point of the room
function roomToScreen(x,y){const r=cv.getBoundingClientRect(),dpr=cv.width/Math.max(1,r.width),cw=cv.width,ch=cv.height,s=Math.min(cw/VW,ch/VH),ox=(cw-VW*s)/2,oy=Math.max(0,(ch-VH*s)/2);x-=G.vx||0;y-=G.vy||0;return[r.left+(ox+x*s)/dpr,r.top+(oy+y*s)/dpr]}
function bump(el){if(el&&el.animate)el.animate([{transform:'scale(1)'},{transform:'scale(1.25)'},{transform:'scale(1)'}],{duration:260,easing:'ease-out'})}
// one little coin flying from (x,y) in CSS px to an element; the counter bumps when it lands
let flyN=0;function flyCoin(x,y,to,done,gem){if(LOWFX||!to||!document.body.animate||flyN>7){done&&done();return}const b=to.getBoundingClientRect();if(!b.width){done&&done();return}flyN++;
  const c=document.createElement('i');c.className='flyCoin'+(gem?' gem':'');c.style.left=x+'px';c.style.top=y+'px';document.body.appendChild(c);
  const tx=b.left+b.width/2-x,ty=b.top+b.height/2-y,mx=tx*.3+(Math.random()-.5)*60,my=Math.min(ty*.3,-40-Math.random()*40);
  c.animate([{transform:'translate(-50%,-50%) scale(.6)'},{transform:`translate(calc(${mx}px - 50%),calc(${my}px - 50%)) scale(1.15)`,offset:.35},{transform:`translate(calc(${tx}px - 50%),calc(${ty}px - 50%)) scale(.7)`}],{duration:520+Math.random()*120,easing:'cubic-bezier(.5,0,.6,1)'}).onfinish=()=>{c.remove();flyN--;bump(to);done&&done()}}
{const _u=update;update=function(dt){
  const hadDoor=G&&G.door,gold0=G?G.gold:0;_u(dt);if(!G||!P)return;
  for(const e of G.enemies)if(e.sq>0)e.sq-=dt;if(P.hopT>0)P.hopT-=dt;
  // HP trail: waits a moment, then slides down to the real value
  if(P.hpTrail==null||P.hp>=P.hpTrail){P.hpTrail=P.hp;P.hpTD=.35}else{P.hpTD-=dt;if(P.hpTD<=0)P.hpTrail=Math.max(P.hp,P.hpTrail-P.maxhp*.9*dt)}
  // gate: bars slide up with a puff of dust
  if(G.door&&!hadDoor&&G.state!=='trans'){G.gateT=.6;if(!LOWFX)for(let i=0;i<16;i++)G.fx.push({k:'puff',x:AW/2+rand(-DOORW,DOORW),y:TOP+rand(-4,6),vx:rand(-40,40),vy:rand(-30,10),t:rand(.4,.8),r:rand(4,8)})}
  if(G.gateT>0)G.gateT-=dt;
  // coins picked up in battle fly to the gold counter
  if(G.gold>gold0&&$('menu').hidden&&!INTRO.on&&!G.goldRun){const[sx,sy]=roomToScreen(P.x,P.y-10);flyCoin(sx,sy,$('goldTxt'))}}}
// menu: coins fly from the last tap to the wallet when gold goes up
let lastTap=[innerWidth/2,innerHeight/2];addEventListener('pointerdown',e=>{lastTap=[e.clientX,e.clientY]},true);
{const _t=tweenNum;tweenNum=function(el,to){const from=el&&el.dataset.v!=null?+el.dataset.v:null;_t(el,to);
  if(from!=null&&to>from&&!$('menu').hidden&&(el.id==='mGold'||el.id==='mGems')){const n=Math.min(6,2+Math.floor(Math.log10(to-from+1)));for(let i=0;i<n;i++)setTimeout(()=>flyCoin(lastTap[0]+rand(-14,14),lastTap[1]+rand(-14,14),el,null,el.id==='mGems'),i*70)}}}

